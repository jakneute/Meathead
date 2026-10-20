// The big-kid zone's rides: TRACKLESS, all of them (the user's: "they will try to run into you though"). Each roams
// loose about its own patch, lines up on him when he's about, gives its tell, and goes for him; each hurts him and the
// cast alike (none of the cast idles in one's way: hazard zones; knocked in, they're fair game). He never rides one:
// nothing on a ride is lit to stand on.
//
//   COUCH DUDES' CRUISIN' COUCH: a plaid couch on a go-kart chassis, two animatronic slacker teens on it. Wanders the
//     street out of its garage; lines up on him (turns to face him first), its headlights flash and the horn goes
//     twice (the tell), then it floors it at him and skids to a stop. Jump it, or get up on the newsstand/shelter. On a
//     later visit it's parked dead outside its garage (OUT OF ORDER).
//   SPAZ & STINKY'S BUMPER BASH: three bumper cars loose in a fenced rink (one to each bay between the rink's two
//     towers), no riders. They wander and spin; lined up on him, the pole's light flashes and the buzzer goes (the
//     tell), then they ram. They bounce off each other, the rails and the towers' feet, and ramming a tower's foot sets
//     it swinging (and him on it).
//   GIGGLES THE CLOWN'S HURL-A-WHIRL: four barf-bucket cars on arms round a clown-head hub that rolls loose about its
//     plaza. The front half of the turn's on the play plane; the cars are at two heights (jump the low ones, walk under
//     the high ones). Every so often the clown's eyes spin and the calliope honks (the tell) and the whole thing
//     lurches over toward him.
//   DETECTIVE DRAKE'S MOTION MADNESS: the simulator pod on four hydraulic legs. Crouches, hisses, its beacon flashing
//     (the tell), then hops at where he is and lands like a dropped fridge (the street shakes). Kept to its plaza.
//   RAD RAT'S TUBULAR HALFPIPE: a giant skateboard (four seats, nobody in them) rocking back and forth in a concrete
//     halfpipe; the coping clanks at each end. Drop in, cross, jump it at the bottom.
//   THE GLOP PITS: bottomless green slime (the big kids' ball pit). In, and he's spat back out where he last stood
//     safe, hurt; the cast it spits out dead.
//   What the cast throw (kinds.ts): traffic cones, the skate punk's board, Gloppy's loogies (and the sticky puddles
//   they leave: he wades through them at half speed), churros.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { hazardVictims, hazardHit, hazardKill, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { teleport } from '../section';
import { onScreen } from '../kit';
import { onTower } from '../sway';
import { bigkidOf, makeRide, type Ride } from './state';
import { COUCH, RINK, WHIRL, POD, PIPE, PITS, IN_RINK, pipeDepth, X, Y } from './layout';
import { GY } from '../geometry';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const overlaps = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
/** A ride hits him (box in world space). */
const rideHurts = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, source: string, knock: { x: number; y: number }) => {
  const { state } = ctx, p = state.player;
  if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, x, y, w, h)) { hurtPlayer(ctx, dmg, source, knock); return true; }
  return false;
};
/** A ride hits the cast in its box (each no more than once a second). */
const rideHitsCast = (ctx: FrameContext, x: number, y: number, w: number, h: number, dmg: number, fromX: number, call: string) => {
  const { state } = ctx, k = bigkidOf(state);
  for (const e of hazardVictims(state)) {
    if (!boxHits(e, x, y, w, h) || state.frame - (k.rideHit.get(e) ?? -999) < 60) continue;
    k.rideHit.set(e, state.frame);
    hazardHit(ctx, e, dmg, fromX, call, { knock: 11 });
  }
};
const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;
const pfeet = (state: GameState) => state.player.pos.y + state.player.height;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dust = (state: GameState, x: number, y: number, n = 8, col = '#D6D3D1') => { for (let i = 0; i < n; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 40, y: y - 3 }, vel: { x: (Math.random() - 0.5) * 4, y: -0.5 - Math.random() * 2 }, life: 26, color: col, size: 4 }); };
const sparks = (state: GameState, x: number, y: number) => { for (let i = 0; i < 10; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 7, y: -Math.random() * 5 }, life: 18, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2, grav: 0.3 } as typeof state.particles[number]); };

/** Set the ride nearest him going for him (a ride op on the headset): true if there was one near enough (`dry`: only
 *  asking). */
export const sicRide = (state: GameState, dry = false) => {
  const k = bigkidOf(state), px = pmid(state);
  const all: Ride[] = [k.whirl, k.pod, ...k.bumpers];
  if (k.couch.phase !== 'parked') all.push(k.couch);
  // (only a ride whose patch he's in or right by: one further off couldn't get to him anyway)
  let best: Ride | null = null, bd = 260;
  for (const r of all) { const d = px < r.lo ? r.lo - px : px > r.hi ? px - r.hi : 0; if (d < bd) { bd = d; best = r; } }
  if (!best) return false;
  if (dry) return true;
  best.sic = 200; best.cool = 0;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Building them

export const COUCH_DONE_MEMO = 'ct-bigkid-done';
export const COUCH_L = 156, COUCH_H = 64;
export const CAR_L = 86, CAR_H = 46;
const WHIRL_SPEED = 0.022, WHIRL_N = 4;
export const CUP_W = 64, CUP_H = 44;
export const POD_W = 112, POD_H = 100;
const POD_G = 0.44;
export const BOARD_L = 128;
const BOARD_H = 50, BOARD_P = 260, BOARD_A = (PIPE.b - PIPE.a) / 2 - 45;

export const makeRides = (state: GameState, revisit: boolean) => {
  const k = bigkidOf(state);
  k.couch = makeRide(X(COUCH.a + 150), X(COUCH.a) + COUCH_L / 2, X(COUCH.b) - COUCH_L / 2, 0, -1);
  if (revisit) { k.couch.phase = 'parked'; k.couch.x = X(COUCH.a) + COUCH_L / 2 + 30; k.couch.dir = 1; }
  // (the rink's bays: between its rails and the two towers' feet)
  const feet = IN_RINK.map(i => k.towers[i].d.x);
  const bays: [number, number][] = [[X(RINK.a), feet[0]], [feet[0], feet[1]], [feet[1], X(RINK.b)]];
  k.bumpers = bays.map(([a, b], i) => makeRide((a + b) / 2 + (i - 1) * 30, a + CAR_L / 2 + 16, b - CAR_L / 2 - 16, i, i % 2 ? 1 : -1));
  k.whirl = makeRide(X((WHIRL.lo + WHIRL.hi) / 2), X(WHIRL.lo), X(WHIRL.hi));
  k.whirl.phase = 'spin';
  k.pod = makeRide(X(POD.b - 80), X(POD.a), X(POD.b));
  k.pod.phase = 'sit';
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

/** He's about (for a ride to line up on him): his middle within `m` of its patch, his feet no higher than `top`. */
const about = (state: GameState, r: Ride, m: number, top: number) => {
  const px = pmid(state);
  return alive(state) && px > r.lo - m && px < r.hi + m && pfeet(state) > Y(top);
};
/** He's seen it line up on him: now and then, the sneer. */
let sneer: ((state: GameState) => void) | null = null;
export const onSneer = (f: (state: GameState) => void) => { sneer = f; };

const updateCouch = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, r = bigkidOf(state).couch, px = pmid(state);
  r.t++; if (r.cool > 0) r.cool--; if (r.sic > 0) r.sic--;
  if (r.phase === 'parked') return;
  const lineUp = (r.phase === 'roam' || r.phase === 'idle') && (r.cool <= 0 || r.sic > 0) && about(state, r, 220, 220) && (Math.abs(px - r.x) < 600 || r.sic > 0);
  if (lineUp) {
    const ahead = Math.sign(px - r.x) === r.dir;
    r.phase = ahead ? 'tell' : 'turnTell'; r.t = 0; r.v = 0;
  }
  switch (r.phase) {
    case 'roam': {
      const d = r.target - r.x;
      if (Math.sign(d) !== r.dir && Math.abs(d) > 10) { r.phase = 'turn'; r.t = 0; r.v = 0; break; }
      r.v = Math.min(1.5, r.v + 0.05); r.x += r.dir * r.v;
      if (Math.abs(d) < 8) { r.phase = 'idle'; r.t = 0; r.v = 0; }
      if (r.t % 50 === 0) envSound(state, r.x, 'engine', 0.15, 10);
      break;
    }
    case 'idle':
      if (r.t > 50 + (r.x % 40)) { r.target = r.lo + Math.random() * (r.hi - r.lo); r.phase = 'roam'; r.t = 0; }
      break;
    case 'turn': case 'turnTell':
      // (a three-point turn, quick: the couch swings round)
      if (r.t === 1) envSound(state, r.x, 'engine', 0.2, 6);
      if (r.t >= 26) { r.dir = (r.dir * -1) as 1 | -1; r.phase = r.phase === 'turnTell' ? 'tell' : 'roam'; r.t = 0; }
      break;
    case 'tell':
      // (headlights flashing, the horn twice, revving: then it goes)
      r.dir = (px < r.x ? -1 : 1) as 1 | -1;
      if (r.t === 1 || r.t === 24) envSound(state, r.x, 'truckhorn', 0.55, 4);
      if (r.t % 8 === 0) envSound(state, r.x, 'engine', 0.3, 8 + r.t / 6);
      if (r.t === 2 && sneer && state.frame - bigkidOf(state).sneerAt > 900) sneer(state);
      if (r.t >= 52) { r.phase = 'charge'; r.t = 0; r.target = r.x; envSound(state, r.x, 'carroar', 0.5, 0); }
      break;
    case 'charge':
      r.v = Math.min(7.6, r.v + 0.45); r.x += r.dir * r.v;
      if (r.t % 4 === 0 && onScreen(state, r.x - 100, r.x + 100)) dust(state, r.x - r.dir * COUCH_L / 2, GY, 2);
      if (r.x <= r.lo || r.x >= r.hi || Math.abs(r.x - r.target) > 820) { r.x = clamp(r.x, r.lo, r.hi); r.phase = 'brake'; r.t = 0; envSound(state, r.x, 'crash', 0.25, 14); }
      break;
    case 'brake':
      r.v *= 0.86; r.x = clamp(r.x + r.dir * r.v, r.lo, r.hi);
      if (r.t % 3 === 0 && onScreen(state, r.x - 100, r.x + 100)) dust(state, r.x - r.dir * 40, GY, 2, '#A8A29E');
      if (r.v < 0.3) { r.phase = 'idle'; r.t = 0; r.v = 0; r.cool = 110; r.sic = 0; }
      break;
  }
  const bx = r.x - COUCH_L / 2;
  if (r.v > 0.8) {
    const charging = r.phase === 'charge' || (r.phase === 'brake' && r.v > 3);
    rideHurts(ctx, bx, Y(COUCH_H), COUCH_L, COUCH_H, charging ? 14 : 8, 'm2:ct_couch', { x: r.dir * (charging ? 10 : 5), y: charging ? -8 : -4 });
    rideHitsCast(ctx, bx, Y(COUCH_H), COUCH_L, COUCH_H, charging ? 70 : 25, r.x - r.dir * 60, 'COUCHED!');
  }
  zones.push({ x0: bx - 30 + (r.dir > 0 ? 0 : -90), x1: bx + COUCH_L + 30 + (r.dir > 0 ? 90 : 0), y0: Y(COUCH_H + 20), y1: GY });
  if (r.phase === 'tell' || r.phase === 'charge') zones.push({ x0: Math.min(r.x, r.dir > 0 ? r.hi : r.lo) - COUCH_L / 2, x1: Math.max(r.x, r.dir > 0 ? r.hi : r.lo) + COUCH_L / 2, y0: Y(COUCH_H + 20), y1: GY });
};

const updateBumpers = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, k = bigkidOf(state), px = pmid(state);
  // (which rink tower he's on, if any: the cars go for its foot)
  const onT = IN_RINK.find(i => onTower(state, k.towers[i]));
  for (const r of k.bumpers) {
    r.t++; if (r.cool > 0) r.cool--; if (r.sic > 0) r.sic--;
    const goal = onT !== undefined ? k.towers[onT].d.x : px;
    const inReach = alive(state) && px > X(RINK.a) - 160 && px < X(RINK.b) + 160 && pfeet(state) > Y(320) && Math.abs(goal - r.x) < 460;
    if ((r.phase === 'roam' || r.phase === 'idle' || r.phase === 'spin') && (r.cool <= 0 || r.sic > 0) && (inReach || r.sic > 0)) {
      r.phase = 'tell'; r.t = 0; r.v = 0; r.dir = (goal < r.x ? -1 : 1) as 1 | -1;
    }
    switch (r.phase) {
      case 'roam': {
        const d = r.target - r.x;
        r.dir = (d < 0 ? -1 : 1) as 1 | -1; r.v = Math.min(2, r.v + 0.08); r.x += r.dir * r.v;
        if (Math.abs(d) < 6) { r.phase = Math.random() < 0.5 ? 'spin' : 'idle'; r.t = 0; r.v = 0; }
        break;
      }
      case 'idle':
        if (r.t > 40) { r.target = r.lo + Math.random() * (r.hi - r.lo); r.phase = 'roam'; r.t = 0; }
        break;
      case 'spin':
        // (a full spin in place, the way bumper cars do when you yank the wheel)
        r.spin += 0.16;
        if (r.t >= 40) { r.spin = 0; r.phase = 'idle'; r.t = 0; }
        break;
      case 'tell':
        r.dir = (goal < r.x ? -1 : 1) as 1 | -1;
        if (r.t % 9 === 0) envSound(state, r.x, 'beep', 0.35, 10);
        if (r.t >= 36) { r.phase = 'charge'; r.t = 0; envSound(state, r.x, 'engine', 0.35, 14); }
        break;
      case 'charge':
        r.v = Math.min(6.6, r.v + 0.5); r.x += r.dir * r.v;
        if (r.t > 90) { r.phase = 'bounce'; r.t = 0; r.v = 1.5; }
        break;
      case 'bounce':
        // (knocked back off whatever it hit)
        r.v *= 0.9; r.x -= r.dir * r.v;
        if (r.t > 24) { r.phase = 'idle'; r.t = 0; r.v = 0; r.cool = 70 + r.k * 15; r.sic = 0; }
        break;
    }
    // (the rails and the towers' feet: it can't go past either end of its bay; banging into one bounces it off, and
    // a tower's foot rammed sets the tower swinging)
    if (r.x < r.lo || r.x > r.hi) {
      const atLo = r.x < r.lo;
      r.x = clamp(r.x, r.lo, r.hi);
      if (r.phase === 'charge' || (r.phase === 'roam' && r.v > 1.5)) {
        const hard = r.phase === 'charge';
        const edge = atLo ? r.lo - CAR_L / 2 - 16 : r.hi + CAR_L / 2 + 16;
        const ti = IN_RINK.find(i => Math.abs(k.towers[i].d.x - edge) < 4);
        if (ti !== undefined) {
          const t = k.towers[ti];
          t.vel += (atLo ? -1 : 1) * (hard ? 0.034 : 0.012);
          envSound(state, edge, 'thud', hard ? 0.7 : 0.35, -6);
          if (hard) shakeScreen(state, 4, 2);
        } else envSound(state, edge, 'clang', hard ? 0.5 : 0.25, 8);
        if (hard) sparks(state, edge, Y(30));
        r.phase = 'bounce'; r.t = 0; r.v = hard ? 2.5 : 1;
      } else if (r.phase === 'roam') { r.phase = 'idle'; r.t = 0; r.v = 0; }
    }
  }
  // (into each other: both knocked back; sparks)
  for (let i = 0; i < k.bumpers.length; i++) for (let j = i + 1; j < k.bumpers.length; j++) {
    const a = k.bumpers[i], b = k.bumpers[j];
    if (Math.abs(a.x - b.x) < CAR_L - 6) {
      const s = a.x < b.x ? -1 : 1;
      a.x += s * 3; b.x -= s * 3;
      if (a.phase === 'charge' || b.phase === 'charge') { sparks(state, (a.x + b.x) / 2, Y(26)); envSound(state, a.x, 'clang', 0.5, 4); }
      for (const r of [a, b]) if (r.phase === 'charge' || r.phase === 'roam') { r.phase = 'bounce'; r.t = 0; r.v = 2; r.dir = (r === a ? -s : s) as 1 | -1; }
    }
  }
  for (const r of k.bumpers) {
    const bx = r.x - CAR_L / 2, moving = r.v > 0.8 && r.phase !== 'bounce';
    if (moving || r.phase === 'charge') {
      const charging = r.phase === 'charge';
      rideHurts(ctx, bx, Y(CAR_H), CAR_L, CAR_H, charging ? 12 : 6, 'm2:ct_bumper', { x: r.dir * (charging ? 9 : 5), y: -6 });
      rideHitsCast(ctx, bx, Y(CAR_H), CAR_L, CAR_H, charging ? 50 : 20, r.x - r.dir * 40, 'BUMPED OFF!');
    }
    zones.push({ x0: bx - 30, x1: bx + CAR_L + 30, y0: Y(CAR_H + 20), y1: GY });
  }
  // (the rink floor while the cars are on it: nobody stands about in there)
  zones.push({ x0: X(RINK.a), x1: X(RINK.b), y0: Y(CAR_H + 10), y1: GY });
};

/** The whirl's cars: x, how high their bottoms are, front (on the play plane) or not. */
export const whirlCars = (r: Ride) => Array.from({ length: WHIRL_N }, (_, k) => {
  const a = r.spin + (k / WHIRL_N) * Math.PI * 2;
  return { k, a, x: r.x + Math.cos(a) * WHIRL.r, h: k % 2 ? 142 : 22, front: Math.sin(a) > 0.2, depth: Math.sin(a) };
});
const updateWhirl = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, r = bigkidOf(state).whirl, px = pmid(state);
  r.t++; if (r.sic > 0) r.sic--;
  r.spin += WHIRL_SPEED * (r.phase === 'tell' ? 1.25 : 1);
  const near = alive(state) && px > X(WHIRL.a) - 420 && px < X(WHIRL.b) + 420;
  switch (r.phase) {
    case 'spin':
      if ((near && r.t > 240) || (r.sic > 0 && r.t > 30)) { r.phase = 'tell'; r.t = 0; }
      break;
    case 'tell':
      // (the clown's eyes spin, the calliope honks, it shudders on its casters: the tell)
      if (r.t % 10 === 0) envSound(state, r.x, 'ding', 0.4, 6 + (r.t / 10) * 3);
      if (r.t === 1) envSound(state, r.x, 'horn', 0.45, 12);
      if (r.t === 2 && sneer && state.frame - bigkidOf(state).sneerAt > 900) sneer(state);
      if (r.t >= 44) { r.phase = 'lurch'; r.t = 0; r.target = clamp(px, r.lo, r.hi); r.dir = (r.target < r.x ? -1 : 1) as 1 | -1; envSound(state, r.x, 'rumble', 0.45, 0); }
      break;
    case 'lurch':
      r.v = Math.min(2.8, r.v + 0.12); r.x += r.dir * r.v;
      if (r.t % 6 === 0 && onScreen(state, r.x - 200, r.x + 200)) dust(state, r.x, GY, 2);
      if ((r.target - r.x) * r.dir <= 0 || r.x <= r.lo || r.x >= r.hi || r.t > 170) { r.x = clamp(r.x, r.lo, r.hi); r.v = 0; r.phase = 'spin'; r.t = 0; r.sic = 0; envSound(state, r.x, 'thud', 0.4, -4); }
      break;
  }
  for (const car of whirlCars(r)) {
    if (!car.front) continue;
    const y = Y(car.h + CUP_H);
    // (the front half's going right to left: it knocks him the way it's going)
    rideHurts(ctx, car.x - CUP_W / 2, y, CUP_W, CUP_H, 11, 'm2:ct_whirl', { x: -7 * Math.sign(Math.sin(car.a)), y: -6 });
    rideHitsCast(ctx, car.x - CUP_W / 2, y, CUP_W, CUP_H, 45, car.x + 30, 'HURLED!');
  }
  zones.push({ x0: r.x - WHIRL.r - CUP_W, x1: r.x + WHIRL.r + CUP_W, y0: Y(142 + CUP_H + 10), y1: GY });
  if (r.phase === 'lurch') zones.push({ x0: Math.min(r.x, r.target) - WHIRL.r - CUP_W, x1: Math.max(r.x, r.target) + WHIRL.r + CUP_W, y0: Y(200), y1: GY });
};

const updatePod = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, r = bigkidOf(state).pod, px = pmid(state);
  r.t++; if (r.sic > 0) r.sic--;
  const near = alive(state) && px > r.lo - 460 && px < r.hi + 460 && pfeet(state) > Y(260);
  switch (r.phase) {
    case 'sit':
      if ((near && r.t > 50) || (r.sic > 0 && r.t > 20)) { r.phase = 'tell'; r.t = 0; }
      break;
    case 'tell':
      // (it crouches on its legs, hissing, the beacon going round: the tell)
      if (r.t === 1) envSound(state, r.x, 'whoosh', 0.45, -10);
      if (r.t % 14 === 0) envSound(state, r.x, 'ding', 0.25, 16);
      if (r.t === 2 && sneer && state.frame - bigkidOf(state).sneerAt > 900) sneer(state);
      if (r.t % 4 === 0 && onScreen(state, r.x - 100, r.x + 100)) state.particles.push({ pos: { x: r.x + (Math.random() - 0.5) * POD_W, y: GY - 20 }, vel: { x: (Math.random() - 0.5) * 2, y: -1.2 }, life: 24, color: '#F1F5F9', size: 5 });
      if (r.t >= 46) {
        const tx = clamp(px, r.lo, r.hi), T = (2 * 11.5) / POD_G;
        r.vy = 11.5; r.v = (tx - r.x) / T; r.target = tx; r.phase = 'air'; r.t = 0; r.dir = (tx < r.x ? -1 : 1) as 1 | -1;
        envSound(state, r.x, 'boom', 0.4, 10); envSound(state, r.x, 'whoosh', 0.6, 4);
      }
      break;
    case 'air':
      r.x += r.v; r.y += r.vy; r.vy -= POD_G;
      if (r.y <= 0) {
        r.y = 0; r.vy = 0; r.phase = 'land'; r.t = 0;
        envSound(state, r.x, 'slam', 0.9, -8); shakeScreen(state, 8, 4); dust(state, r.x, GY, 14);
      }
      break;
    case 'land':
      if (r.t > 42) { r.phase = 'sit'; r.t = 0; r.sic = 0; }
      break;
  }
  const bx = r.x - POD_W / 2, by = Y(r.y + POD_H);
  const air = r.phase === 'air' || (r.phase === 'land' && r.t < 3);
  rideHurts(ctx, bx, by, POD_W, POD_H, air ? 15 : 6, 'm2:ct_pod', { x: (pmid(state) < r.x ? -1 : 1) * (air ? 9 : 5), y: air ? -8 : -4 });
  rideHitsCast(ctx, bx, by, POD_W, POD_H, air ? 80 : 20, r.x, 'PODDED!');
  zones.push({ x0: bx - 20, x1: bx + POD_W + 20, y0: by - 20, y1: Y(r.y) + 4 });
  if (r.phase === 'tell' || r.phase === 'air') { const tx = r.phase === 'air' ? r.target : clamp(px, r.lo, r.hi); zones.push({ x0: tx - POD_W, x1: tx + POD_W, y0: Y(POD_H + 20), y1: GY }); }
};

/** The halfpipe's board: its middle (x), where it sits (y), its tilt, which way it's going. */
export const boardAt = (f: number) => {
  const cx = X((PIPE.a + PIPE.b) / 2), w = (Math.PI * 2) / BOARD_P;
  const x = cx + Math.sin(f * w) * BOARD_A, v = Math.cos(f * w) * BOARD_A * w;
  const y = GY + pipeDepth(x - X(0));
  const slope = (pipeDepth(x - X(0) + 4) - pipeDepth(x - X(0) - 4)) / 8;
  return { x, y, a: Math.atan(slope), v };
};
const updateBoard = (ctx: FrameContext, zones: Zone[]) => {
  const { state } = ctx, f = state.frame, b = boardAt(f), prev = boardAt(f - 1);
  // (the coping clanks at each end of the swing; a roar through the bottom)
  if (Math.sign(b.v) !== Math.sign(prev.v)) envSound(state, b.x, 'clang', 0.45, 6);
  if (Math.abs(b.x - X((PIPE.a + PIPE.b) / 2)) < 4) envSound(state, b.x, 'whoosh', 0.4, -4);
  const bx = b.x - BOARD_L / 2 + 6, by = b.y - BOARD_H;
  rideHurts(ctx, bx, by, BOARD_L - 12, BOARD_H, 13, 'm2:ct_board', { x: Math.sign(b.v || 1) * 9, y: -8 });
  rideHitsCast(ctx, bx, by, BOARD_L - 12, BOARD_H, 60, b.x - Math.sign(b.v || 1) * 40, 'BOARDED!');
  zones.push({ x0: bx - 30, x1: bx + BOARD_L + 30, y0: by - 10, y1: b.y + 4 });
  // (the pipe's floor: nobody stands about down there)
  zones.push({ x0: X(PIPE.a), x1: X(PIPE.b), y0: GY, y1: GY + PIPE.depth + 4, ground: true });
};

export const updateRides = (ctx: FrameContext) => {
  const { state } = ctx;
  const zones: Zone[] = [];
  updateCouch(ctx, zones);
  updateBumpers(ctx, zones);
  updateWhirl(ctx, zones);
  updatePod(ctx, zones);
  updateBoard(ctx, zones);
  setHazardZones(state, 'ct-bigkid-rides', zones);
  updatePits(ctx);
  updateThrows(ctx);
};

// ---------------------------------------------------------------------------------------------------------------
// The glop pits

const GLOPS = ['#65D11B', '#84CC16', '#4D9F10', '#A3E635'];
const splash = (state: GameState, x: number, y: number) => { for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: y - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 5 }, life: 34, color: GLOPS[i % GLOPS.length], size: 5, grav: 0.3 } as typeof state.particles[number]); };
const updatePits = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player, k = bigkidOf(state);
  {
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const pit = PITS.find(([a, b]) => cx > X(a) && cx < X(b));
    if (pit && feet > GY + 30 && p.health > 0) {
      splash(state, cx, GY);
      envSound(state, cx, 'glug', 0.7, -6); playSound('splat', 0.6, -10);
      hurtPlayer(ctx, 12, 'm2:ct_glop', { x: 0, y: -4 });
      if (p.health > 0) { teleport(state, k.safe.x, k.safe.y); p.invincibilityTimer = Math.max(p.invincibilityTimer, 60); splash(state, k.safe.x, k.safe.y); }
    }
  }
  for (const e of state.enemies) {
    if (e.health <= 0 || e.type === 'boss' || e.enemyType === 'flyer' || e.isBlownAway) continue;
    const ex = e.pos.x + e.width / 2;
    if (e.pos.y + e.height < GY + 30 || !PITS.some(([a, b]) => ex > X(a) && ex < X(b))) continue;
    splash(state, ex, GY);
    if (e.seen) hazardKill(ctx, e, ex, 'GLOPPED!', { fling: { x: (Math.random() < 0.5 ? -1 : 1) * 4, y: -14 }, sound: 'glug', color: '#BEF264' });
    // (never seen: spared, back where it was put)
    else { e.pos.x = e.homeX ?? e.pos.x; e.pos.y = e.homeY ?? Y(0) - e.height; e.vel.x = 0; e.vel.y = 0; }
  }
};

/** Where he last stood safe (index.ts calls this every frame): on the ground or a ledge, not a tower, not in a ride's
 *  way, not in the halfpipe, not at a pit's lip. */
export const noteSafe = (state: GameState) => {
  const p = state.player, k = bigkidOf(state);
  if (!p.isGrounded || p.health <= 0 || p.inCutscene) return;
  if (k.towers.some(t => onTower(state, t))) return;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, atGround = Math.abs(feet - GY) < 4;
  if (atGround && PITS.some(([a, b]) => cx > X(a) - 40 && cx < X(b) + 40)) return;
  if (cx > X(PIPE.a) - 10 && cx < X(PIPE.b) + 10) return;
  if (atGround && cx > X(RINK.a) && cx < X(RINK.b)) return;
  if (atGround && cx > X(POD.a) - 80 && cx < X(POD.b) + 80) return;
  if (atGround && Math.abs(cx - k.whirl.x) < WHIRL.r + 70) return;
  if (atGround && k.couch.phase !== 'parked' && Math.abs(cx - k.couch.x) < 340) return;
  k.safe.x = cx; k.safe.y = feet;
};

// ---------------------------------------------------------------------------------------------------------------
// What the cast throw, and the puddles

/** The sticky puddles: is he wading in one (his feet at the street, within one)? */
export const inPuddle = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return bigkidOf(state).throws.some(t => t.kind === 'puddle' && !t.dead && Math.abs(feet - t.y) < 4 && Math.abs(cx - t.x) < 36);
};
const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, k = bigkidOf(state), p = state.player;
  for (const s of k.throws) {
    s.t++;
    if (s.kind === 'puddle') { if (s.t > 330) s.dead = true; continue; }
    if (s.kind === 'board') {
      // (skidding along the ground on its wheels; over an edge it falls; slows to a stop and lies there)
      const top = floorTopAt(state.blocks, s.x, s.y - 2, 10);
      if (top === null || top > s.y + 2) { s.vy += 0.4; s.y += s.vy; if (s.y > GY + 260) s.dead = true; }
      else { s.y = top; s.vy = 0; }
      s.x += s.vx; s.vx *= s.down ? 0.8 : 0.988;
      if (Math.abs(s.vx) < 0.6 && !s.down) { s.down = true; s.vx = 0; }
      const wall = state.blocks.some(b => !b.oneWay && b.type === 'wall' && s.x > b.x && s.x < b.x + b.w && s.y - 8 > b.y && s.y - 8 < b.y + b.h);
      if (wall) { s.vx = -s.vx * 0.5; s.x += s.vx * 2; envSound(state, s.x, 'clang', 0.3, 10); }
      if (!s.down && alive(state) && p.invincibilityTimer <= 0 && overlaps(state, s.x - 24, s.y - 14, 48, 14)) { hurtPlayer(ctx, 10, 'm2:ct_board_shot', { x: Math.sign(s.vx || 1) * 6, y: -6 }); playSound('bonk', 0.6, 4); }
      if (s.down && s.t > 900) s.dead = true;
      if (!s.down && s.t % 8 === 0) envSound(state, s.x, 'whirl', 0.12, 20);
      continue;
    }
    if (s.down) { if (s.t > 240) s.dead = true; continue; }
    const g = s.kind === 'churro' ? 0.12 : s.kind === 'glop' ? 0.3 : 0.35;
    s.vy += g; s.x += s.vx; s.y += s.vy;
    const hit = s.kind === 'cone' ? [16, 20] : s.kind === 'churro' ? [30, 8] : [16, 14];
    if (alive(state) && p.invincibilityTimer <= 0 && overlaps(state, s.x - hit[0] / 2, s.y - hit[1] / 2, hit[0], hit[1])) {
      const src = s.kind === 'cone' ? 'm2:ct_cone_shot' : s.kind === 'churro' ? 'm2:ct_churro_shot' : 'm2:ct_glop_shot';
      hurtPlayer(ctx, s.kind === 'churro' ? 9 : 8, src, { x: Math.sign(s.vx || 1) * 5, y: -4 });
      playSound(s.kind === 'glop' ? 'splat' : 'bonk', 0.6, s.kind === 'cone' ? 0 : 8);
      if (s.kind === 'glop') splatGlop(state, s.x, s.y);
      s.dead = true; continue;
    }
    const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h);
    if ((top !== null && s.y >= top) || wall || s.t > 200 || s.y > GY + 300) {
      if (s.kind === 'cone' && top !== null && !wall) { s.down = true; s.y = top; s.t = 0; envSound(state, s.x, 'clink', 0.4, -6); continue; }
      s.dead = true;
      if (s.kind === 'glop') {
        envSound(state, s.x, 'splat', 0.5, -4); splatGlop(state, s.x, top ?? s.y);
        // (a puddle where it lands on the street (not on a lid, a ledge or a ride))
        if (top !== null && Math.abs(top - GY) < 3 && !wall) k.throws.push({ kind: 'puddle', x: s.x, y: top, vx: 0, vy: 0, t: 0, from: s.from });
      } else if (s.kind === 'churro') { envSound(state, s.x, 'thud', 0.3, 12); for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 20, color: '#E7B676', size: 2 }); }
    }
  }
  k.throws = k.throws.filter(s => !s.dead);
};
const splatGlop = (state: GameState, x: number, y: number) => { for (let i = 0; i < 9; i++) state.particles.push({ pos: { x, y: y - 3 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 3 }, life: 24, color: GLOPS[i % GLOPS.length], size: 4, grav: 0.25 } as typeof state.particles[number]); };

// (the rides are drawn in rideArt.ts)


