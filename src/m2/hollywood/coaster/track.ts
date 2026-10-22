// THRONES OF THE STARS' track: each ride a path through the air (world space), laid down like a turtle walking it:
// straight runs, turns up and down (a loop's a full turn), rolls (the train turning over about the rail), and a curve
// to wherever it has to end up (the next stop's deck, level). Sampled every STEP px of track: where the rail is, which
// way it's going, how far it's rolled, and what the track's doing there (free, the chain lift, the brakes, a booster,
// the launch). Marks along it cue the lines.
//
// The physics is a cheap one: gravity along the rail, a little drag, never slower than a crawl (it always makes the
// loop); the chain pulls it up at its own speed; the brakes bring it to a stop right at the end; the boosters shove.
// The loops (and the rolls) are run FAST (the user: faster loops): a stretch marked fast is held at least at its speed
// (hidden boosters: the ride's impossible anyway), so a loop's a whip round, not a crawl over the top.

import { X, Y, STATION, STOPS, parkAt, type Place } from './layout';

export const STEP = 4;
/** What the track's doing at a point. */
export const enum Mode { Free = 0, Lift = 1, Brake = 2, Boost = 3, Launch = 4 }
/** `fast`: the speed it's held at, at least, there (px a frame; 0: none). `d`: how near the camera the track is there
 *  (DEPTH, below: 1 the play plane; under 1 away into the distance, over 1 in toward the viewer). Only the drawing
 *  uses it: x, y stay the play plane's (the camera, the stops, the hazards, the launch all run off them). */
export interface TPt { x: number; y: number; a: number; roll: number; mode: Mode; fast: number; d: number }
export interface Track {
  pts: TPt[]; len: number;
  /** Named points along it (px of track): the lines' cues. */
  marks: Map<string, number>;
  /** Where it goes, and from where. */
  from: Place; to: Place | 'warehouse' | 'fade';
}

// DEPTH (the user: the ride looked too flat, a pile of overlapping track; still a side view, but have him go toward
// and away from the camera). Each ride's laid down in x, y as before (the play plane: what the game runs on), and
// given a depth along it: keyframes (depth(), at the turtle's place: eased between, smoothstep) — the lift hills going
// away up into the haze, the drops diving in at the viewer, the rows of loops going back one behind the other, the
// banked runs swinging out toward the camera and back — plus a loop's top leaning away (a loop seen at an angle) and
// a roll's twist toward and away (a corkscrew). Every ride is at 1 on the decks (the stops, the station, the launch's
// end) and eases there well before it gets near one, so the stops stay exactly as they were, at full scale.
// art.ts draws each point at its depth about the scene's one eye (the train, him, the legs to the ground at their own
// depth, fogged far, darker near; drawn behind nearer track, in front of farther).

/** How far a roll swings the train toward and away (a corkscrew's twist). */
const ROLL_Z = 0.1;
/** The depth's bounds (never so far it's lost, never so near it fills the screen). */
const D_MIN = 0.62, D_MAX = 1.46;

class Turtle {
  pts: TPt[] = [];
  marks = new Map<string, number>();
  roll = 0; mode: Mode = Mode.Free; fastV = 0;
  /** The depth's keyframes [s, d]; the lean off them at each point (a loop's top). */
  kf: [number, number][] = [[0, 1]]; zo = 0; zs: number[] = [];
  constructor(public x: number, public y: number, public a = 0) { this.push(); }
  private push() { this.pts.push({ x: this.x, y: this.y, a: this.a, roll: this.roll, mode: this.mode, fast: this.fastV, d: 1 }); this.zs.push(this.zo); }
  get s() { return (this.pts.length - 1) * STEP; }
  set(m: Mode) { this.mode = m; return this; }
  /** The depth here is d (eased to from the last keyframe, on to the next). */
  depth(d: number) { this.kf.push([this.s, d]); return this; }
  /** Held at least at v from here on (0: let go). */
  fast(v: number) { this.fastV = v; return this; }
  mark(name: string) { this.marks.set(name, this.s); return this; }
  fwd(len: number) {
    const n = Math.max(1, Math.round(len / STEP));
    for (let i = 0; i < n; i++) { this.x += Math.cos(this.a) * STEP; this.y += Math.sin(this.a) * STEP; this.push(); }
    return this;
  }
  /** A turn of `sweep` radians (less: nose up, going right) on a curve of radius r. */
  turn(r: number, sweep: number, lean = 0) {
    const n = Math.max(1, Math.round((Math.abs(sweep) * r) / STEP)), da = sweep / n, ds = (Math.abs(sweep) * r) / n;
    for (let i = 0; i < n; i++) { this.a += da / 2; this.x += Math.cos(this.a) * ds; this.y += Math.sin(this.a) * ds; this.a += da / 2; this.zo = lean * Math.sin((Math.PI * (i + 1)) / n); this.push(); }
    this.zo = 0;
    return this;
  }
  /** Turned to heading `to` (radians) on a curve of radius r, the short way (after a loop the heading's gone round a
   *  whole turn: it's the same heading). */
  pitch(to: number, r: number) {
    let d = to - this.a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d <= -Math.PI) d += Math.PI * 2;
    return this.turn(r, d);
  }
  /** A vertical loop (nose up first, whichever way it's going; over the top upside down; out where it went in). */
  loop(r: number) { return this.turn(r, (Math.cos(this.a) >= 0 ? -1 : 1) * Math.PI * 2, -Math.min(0.12, r / 2200)); }
  /** A straight run, the train rolling over `turns` times about the rail. */
  rollRun(len: number, turns: number) {
    const n = Math.max(1, Math.round(len / STEP)), dr = (Math.PI * 2 * turns) / n;
    for (let i = 0; i < n; i++) { this.roll += dr; this.x += Math.cos(this.a) * STEP; this.y += Math.sin(this.a) * STEP; this.push(); }
    this.roll = ((this.roll % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (Math.abs(this.roll) < 0.01 || Math.abs(this.roll - Math.PI * 2) < 0.01) this.roll = 0;
    return this;
  }
  /** A smooth curve to (x, y), arriving heading `a` (a cubic, its handles along the two headings). */
  to(x: number, y: number, a = 0, k = 0.36) {
    const d = Math.hypot(x - this.x, y - this.y), h = d * k;
    const p0 = [this.x, this.y], p1 = [this.x + Math.cos(this.a) * h, this.y + Math.sin(this.a) * h], p2 = [x - Math.cos(a) * h, y - Math.sin(a) * h], p3 = [x, y];
    const at = (t: number) => { const u = 1 - t; return [0, 1].map(i => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i]); };
    // (walked at even steps along it)
    const fine: number[][] = []; for (let i = 0; i <= 400; i++) fine.push(at(i / 400));
    let acc = 0;
    for (let i = 1; i < fine.length; i++) {
      const seg = Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]);
      acc += seg;
      if (acc >= STEP || i === fine.length - 1) {
        acc = 0;
        const ang = Math.atan2(fine[i][1] - this.y, fine[i][0] - this.x);
        // (keep the heading continuous with the last: no jumps of 2 pi)
        let na = ang; while (na - this.a > Math.PI) na -= Math.PI * 2; while (na - this.a < -Math.PI) na += Math.PI * 2;
        this.a = na; this.x = fine[i][0]; this.y = fine[i][1]; this.push();
      }
    }
    let na = a; while (na - this.a > Math.PI) na -= Math.PI * 2; while (na - this.a < -Math.PI) na += Math.PI * 2;
    this.a = na;
    return this;
  }
  done(from: Place, to: Track['to']): Track {
    // (the depth at every point: eased between the keyframes, the lean, a roll's twist)
    const kf = this.kf;
    let k = 0;
    this.pts.forEach((p, i) => {
      const s = i * STEP;
      while (k < kf.length - 1 && kf[k + 1][0] <= s) k++;
      let base = kf[k][1];
      if (k < kf.length - 1) { const [s0, d0] = kf[k], [s1, d1] = kf[k + 1], u = s1 > s0 ? Math.min(1, Math.max(0, (s - s0) / (s1 - s0))) : 1; base = d0 + (d1 - d0) * u * u * (3 - 2 * u); }
      p.d = Math.max(D_MIN, Math.min(D_MAX, base + this.zs[i] + ROLL_Z * Math.sin(p.roll)));
    });
    return { pts: this.pts, len: (this.pts.length - 1) * STEP, marks: this.marks, from, to };
  }
}

const PI = Math.PI;
/** Into a stop's deck: a curve to just short of its left pylon, level, then the brake run to the parked spot. */
const intoStop = (t: Turtle, i: 0 | 1 | 2, climb: Mode = Mode.Free) => {
  const s = STOPS[i], park = parkAt(i);
  t.fast(0).mark('home').set(climb).to(X(s.a - 140), Y(s.h), 0).set(Mode.Brake).mark('brakes').depth(1).fwd(park.x - X(s.a - 140));
  return t;
};
/** Out along a deck from its parked spot, to its right end (boosted). */
const outOf = (t: Turtle, endRx: number) => t.set(Mode.Boost).fwd(X(endRx) - t.x).set(Mode.Free);
/** Loops (and rolls) at speed: how fast they're held. */
const LOOP_V = 15, ROLL_V = 13;

// ---------------------------------------------------------------------------------------------------------------
// The rides (each a good deal longer than it was: the user wanted more track, and the loops faster). The lines said
// along each (script.ts) are budgeted against how long its stretches take (the marks): keep them in step if a ride
// changes.

/** Ride 1: the station to stop 1. The lift hill (the spiel), the first drop, a loop, an immelmann (up and over and
 *  rolled upright, going back), three loops in a row going back, a dive loop down and rolled upright again, a heartline
 *  roll, up into stop 1. */
const ride1 = () => {
  const p = parkAt('station'), t = new Turtle(p.x, p.y);
  outOf(t, STATION.b + 20);
  // (depth: the lift going away up into the haze; the drop diving in at the camera, the loop right up close; up and
  // over going back, the three loops going back away one behind the other; the dive loop coming back in, the roll
  // swung out near; level with the deck by stop 1)
  t.pitch(-1.3, 150).set(Mode.Lift).mark('lift').depth(1).fwd(1300).set(Mode.Free).mark('crest').depth(0.66);
  t.pitch(0, 120).fwd(50).pitch(1.45, 110).mark('drop').depth(0.64).fwd(1040).pitch(0, 230);
  t.fast(LOOP_V).mark('loop').depth(1.34).loop(250).fwd(60);
  // (up and over, going back, rolled upright; three loops going back the way it came)
  t.mark('immelmann').depth(1.2).turn(190, -PI).rollRun(260, 0.5).fwd(40);
  t.mark('twin').depth(0.96).loop(200).fwd(50).loop(200).fwd(50).loop(200).fwd(60);
  t.mark('dive').depth(0.68).turn(150, -PI).rollRun(220, 0.5).fwd(40);
  t.fast(ROLL_V).mark('roll').depth(1.12).rollRun(380, 1).depth(1.02);
  return intoStop(t, 0).done('station', 0);
};

/** Ride 2: stop 1 to stop 2. Off the deck's end and down, a big loop, the TOP HAT (straight up, over, straight down:
 *  impossibly tall), a cobra roll (up and over, going back, a long heartline roll on the way, then down and under,
 *  going on again), a double loop, the booster up into stop 2. */
const ride2 = () => {
  const p = parkAt(0), t = new Turtle(p.x, p.y);
  outOf(t, STOPS[0].b + 20);
  // (depth: off the deck and swinging out toward the camera, the loop near; the top hat going away as it climbs, over
  // the top far off, coming back in on the way down; the cobra going back and away, the roll out there; under and in
  // again, the double loop right at the camera; eased back to the deck by stop 2)
  t.pitch(1.1, 130).mark('drop').depth(1).fwd(150).pitch(0, 200).fwd(60);
  t.fast(LOOP_V).mark('loop').depth(1.2).loop(270).fwd(60).fast(0);
  t.pitch(-PI / 2, 150).mark('tophat').depth(1.3).fwd(1300).depth(0.74).turn(120, PI).fwd(1300).pitch(0, 150).fwd(40);
  t.fast(LOOP_V).mark('cobra').depth(1.16).turn(300, -PI).fast(ROLL_V).mark('roll').depth(0.88).rollRun(620, 1.5).fwd(30);
  t.fast(LOOP_V).mark('under').depth(0.8).turn(300, -PI).rollRun(220, 0.5).fwd(60);
  t.mark('double').depth(1.1).loop(190).fwd(40).loop(190).fwd(40);
  t.fast(ROLL_V).mark('zerog').depth(1.38).rollRun(320, 1).fwd(30).depth(1.12);
  return intoStop(t, 1, Mode.Boost).done(0, 1);
};

/** The INSANITY LOOPS: ten, each smaller than the last (the 'suicide coaster'), wound tight like a spring. */
export const INSANITY = [250, 205, 168, 138, 112, 90, 72, 56, 42, 30];
/** Ride 3: stop 2 to stop 3. The second lift (higher than anything has a right to be), the near-vertical drop, a
 *  big loop, the insanity loops in a row (faster and faster), the long corkscrew out of them, a last loop, the booster
 *  up into stop 3. */
const ride3 = () => {
  const p = parkAt(1), t = new Turtle(p.x, p.y);
  outOf(t, STOPS[1].b + 20);
  // (depth: the second lift away up into the haze, far off at its crest; the near-vertical drop straight in at the
  // camera, the big loop right up close; the insanity loops going away in a row, each smaller and further; the
  // corkscrew back over them twisting toward and away, coming in; the last loop near; level by stop 3)
  t.pitch(-1.32, 140).set(Mode.Lift).mark('lift').depth(1).fwd(1400).set(Mode.Free).mark('crest').depth(0.64);
  t.pitch(0, 100).fwd(30).pitch(1.5, 90).mark('drop').depth(0.63).fwd(1700).pitch(0, 240).fwd(40);
  t.fast(LOOP_V).mark('bigloop').depth(1.42).loop(320).fwd(180);
  INSANITY.forEach((r, i) => {
    t.fast(16 + i * 0.7).mark(`insane${i}`);
    if (i === 0) t.depth(1.22);
    t.loop(r);
    const next = INSANITY[i + 1];
    t.fwd(next ? next + 26 : 80);
  });
  // (up and over, back over the loops it's just been through, the long corkscrew going back; down and under, on again)
  t.fast(LOOP_V).mark('over').depth(0.8).turn(300, -PI).fast(ROLL_V).mark('roll').depth(0.88).rollRun(900, 3.5).depth(1.04).fwd(30);
  t.fast(LOOP_V).turn(180, -PI).rollRun(200, 0.5).fwd(60);
  t.mark('last').depth(1.22).loop(240).fwd(60).depth(1.1);
  // (the booster up the last wall into stop 3: straight up it, near enough)
  return intoStop(t, 2, Mode.Boost).done(1, 2);
};

/** THE LAUNCH (the lever on EXPERIMENTAL): stop 3 along its deck on the launch boosters (far too fast), off its end,
 *  down and round two loops, up the EXPERIMENTAL section: the track just ends, pointed at the sky. Off it goes. */
const launch = () => {
  const p = parkAt(2), t = new Turtle(p.x, p.y);
  t.set(Mode.Launch).mark('launch').fwd(X(STOPS[2].b + 20) - t.x).set(Mode.Free).depth(1);
  // (depth: down off the deck swinging in at the camera, the second loop further back; the ramp level with the play
  // plane, so the flight off it (and the warehouse's burst-in) is where it always was)
  t.pitch(1.0, 140).fwd(260).pitch(0, 220).fast(18).mark('loop').depth(1.22).loop(260).fwd(60).depth(0.9).loop(220).fwd(60).fast(0);
  t.set(Mode.Launch).mark('ramp').depth(1).pitch(-0.85, 260).fwd(160).mark('end');
  return t.done(2, 'warehouse');
};

/** Back to the station (the lever left on NORMAL): off stop 3's end, down the long drop and away into the distance,
 *  up over the lip of the GIANT TOILET and straight down into it (giant.ts: flushed); a cut to the station. */
const back = () => {
  const p = parkAt(2), t = new Turtle(p.x, p.y);
  outOf(t, STOPS[2].b + 20);
  t.depth(1).pitch(1.3, 140).mark('drop').fwd(700).pitch(0, 240).fwd(200).depth(0.72);
  // (over the lip and down the hole)
  t.pitch(-0.5, 90).fwd(40).pitch(1.5, 80).mark('flush').fwd(110);
  return t.done(2, 'fade');
};

/** The station's arrival, after the cut: in from off its left, into the brakes, parked. */
export const stationArrival = () => {
  const p = parkAt('station'), t = new Turtle(p.x - 900, p.y);
  t.set(Mode.Brake).fwd(900);
  return t.done('station', 'station');
};

let built: { r1: Track; r2: Track; r3: Track; launch: Track; back: Track; arrive: Track } | null = null;
export const tracks = () => (built ??= { r1: ride1(), r2: ride2(), r3: ride3(), launch: launch(), back: back(), arrive: stationArrival() });
/** The ride out of a place (stop 3's depends on the lever). */
export const rideFrom = (pl: Place, experimental: boolean): Track => {
  const t = tracks();
  return pl === 'station' ? t.r1 : pl === 0 ? t.r2 : pl === 1 ? t.r3 : experimental ? t.launch : t.back;
};

/** Where on a track at s (px along it): interpolated. */
export const at = (tr: Track, s: number): TPt => {
  const k = Math.max(0, Math.min(tr.pts.length - 1, s / STEP)), i = Math.floor(k), f = k - i;
  const A = tr.pts[i], B = tr.pts[Math.min(tr.pts.length - 1, i + 1)];
  return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, a: A.a + (B.a - A.a) * f, roll: A.roll + (((B.roll - A.roll + PI * 3) % (PI * 2)) - PI) * f, mode: A.mode, fast: A.fast, d: A.d + (B.d - A.d) * f };
};
/** (past the end of a track: on along its last heading) */
export const pointOn = (tr: Track, s: number): TPt => {
  if (s <= tr.len) return at(tr, s);
  const e = tr.pts[tr.pts.length - 1], d = s - tr.len;
  return { ...e, x: e.x + Math.cos(e.a) * d, y: e.y + Math.sin(e.a) * d };
};

/** The physics: gravity along the rail, a little drag; the chain's own speed; the boosters; the launch; the fast
 *  stretches; the brakes (to a stop right at the end). One frame of it, the train at s going v; what the track was
 *  doing where it was (for the sounds). */
const G = 0.26, DRAG = 0.00025, LIFT_V = 4.5, MIN_V = 4;
export const stepRide = (tr: Track, r: { s: number; v: number }): Mode => {
  const pt = pointOn(tr, r.s);
  if (pt.mode === Mode.Lift) r.v += (LIFT_V - r.v) * 0.2;
  else if (pt.mode === Mode.Boost) r.v = Math.min(Math.max(r.v, 0) + 0.3, Math.max(r.v, 10));
  else if (pt.mode === Mode.Launch) r.v = Math.min(r.v + 0.5, 26);
  else r.v += G * Math.sin(pt.a) - DRAG * r.v * r.v;
  if (pt.fast > 0 && r.v < pt.fast) r.v += Math.min(pt.fast - r.v, 0.8);
  if (pt.mode === Mode.Brake) r.v = Math.min(r.v, Math.sqrt(2 * 0.14 * Math.max(0, tr.len - r.s)) + 0.4);
  if (pt.mode !== Mode.Lift && pt.mode !== Mode.Brake) r.v = Math.max(r.v, MIN_V);
  r.s += r.v;
  return pt.mode;
};
