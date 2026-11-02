// JAPAN's far end (job 4b: the pavilions lengthened): THE BULLET TRAIN. Past the sumo ring and the manga stand, the
// line runs through two fiberglass Mt. Fuji hills (climbed up and over: stepped, snow-capped), and between them the
// track lies across the whole station floor. The HAPPY LAND SHINKANSEN (it never stops here) comes out of the left
// tunnel and through to the right one every several seconds: the crossing bells, the lights and the tunnel's shutter
// rolling up first (the tell); on the track as it goes through, he's hit hard and thrown (`m2:fl_bullet_train`); the
// cast on the track die (they wait for it; knocked on, that's that). Out of its way: the signal gantries at each end
// and the platform walkway in the middle (all higher than the train's roof), the station roof over the walkway, the
// departure board over that (a small ammo). Ninjas blink onto the walkways with him, a sumo stomps him off them. Over
// the right-hand Fuji and on to Morocco.
//
// THE LEFT GATE (gateFind.ts: the MAX AMMO find): the left tunnel's shutter rolls up as the bells start (not at their
// end, like the right one) and comes down behind the train's tail; open, its mouth is walkable, and the find lies in
// it. Still in the mouth when the train comes through, it blasts him out onto the track (`m2:fl_train_blast`).

import type { Light } from '../../../m1/game/render/lighting';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { type Controls, NO_CONTROLS } from '../../../m1/game/platform/input';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { type GateFind, newGateFind, tickGateCard, grabGateFind, drawGateFind } from './gateFind';
import { solid, ledge, foreignState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { spawnCast, byPants } from '../cast';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones } from '../../hazardHit';
import { hurtIn, hitCastIn, newShout, shout, drawShout, placePickups, type Shout } from '../setpiece';
import { type Ctx, type View, postBoard, hungBoard, LOOKS, onScreen } from '../kit';
import { drawTrack, drawGantry, drawWalkway, drawCanopy, drawDepartureBoard, drawFujiSteps, drawPortal, drawTrainArt } from './art';
import { V, STATION } from './lines';
import { knockPlantedIn } from '../../moves/followups';

const { x0, x1 } = SECTIONS.japan;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

/** Where the old Japan ended: this starts there. */
export const STATION_FROM = 3600;

// ---------------------------------------------------------------------------------------------------------------
// Layout (x from Japan's start, heights up from the promenade). He jumps ~145 up, ~210 across.

/** The two Fujis (solid steps: [a, b, h]) and the track between them. */
const FUJI_L: [number, number, number][] = [[3700, 3800, 120], [3800, 3880, 240], [3880, 3960, 340]];
const FUJI_R: [number, number, number][] = [[4960, 5040, 340], [5040, 5120, 240], [5120, 5200, 120]];
const LANE = { a: 3960, b: 4960 } as const;
/** Out of the train's way (one-way, higher than its roof): the gantries, the walkway, the station roof, the board. */
const REFUGES: [number, number, number][] = [[4040, 4140, 140], [4300, 4620, 140], [4800, 4900, 140], [4360, 4560, 280], [4420, 4500, 410]];
/** The train: its roof, its length, its speed; one every EVERY frames, WARN of bells first. */
const TRAIN = { h: 110, len: 1500, v: 30 } as const;
const EVERY = 430, WARN = 105;
/** The left gate: its mouth (the tunnel's last 80 px, in the first Fuji's foot, as high as the portal's opening); its
 *  shutter up over LEFT_UP frames from the first bell, walkable once its foot's over his head (WALK_OPEN), down over
 *  LEFT_DOWN frames once the train's tail is out (pass frame TAIL_OUT); the find in it (rx) and the blast's damage. */
const GATE = { a: 3880, b: LANE.a, h: TRAIN.h + 10 } as const;
const LEFT_UP = 24, LEFT_DOWN = 8, WALK_OPEN = 0.56, TAIL_OUT = Math.ceil(TRAIN.len / TRAIN.v);
const FIND_RX = 3918, BLAST = 36;

const ENEMIES: [string, number, number][] = [
  // (THE BULLET TRAIN's checkpoint's spot left clear) a ninja waiting on the first Fuji's top
  ['m2:fl_ninja', 3920, 340],
  // the refuges: a ninja on the first gantry; the walkway's sumo and samurai, a ninja over them, the cosplay kid up on
  // the canopy throwing down; a samurai and a ninja on the last gantry (the katana: no charging along it)
  ['m2:fl_ninja', 4090, 140], ['m2:fl_sumo', 4420, 140], ['m2:fl_samurai', 4560, 140], ['m2:fl_ninja', 4460, 280],
  ['m2:fl_cosplay', 4440, 410], ['m2:fl_samurai', 4820, 140], ['m2:fl_ninja', 4870, 140],
  // the other Fuji's top: a sumo and the cosplay kid (its stomp knocks him off the peak onto the track; THE OTHER FUJI's
  // checkpoint's foot left clear)
  ['m2:fl_sumo', 4985, 340], ['m2:fl_cosplay', 5025, 340],
];

export const STATION_CHECKPOINTS = [
  { name: 'JAPAN: THE BULLET TRAIN', cp: 54, x: X(3640), y: GY },
  { name: 'JAPAN: THE OTHER FUJI', cp: 55, x: X(5240), y: GY },
];

// ---------------------------------------------------------------------------------------------------------------
// The train

/** The train now: 'warn' (bells), 'pass' (its nose at world x), or gone. */
const trainAt = (f: number) => {
  const t = f % EVERY, n = Math.floor(f / EVERY);
  if (t < WARN) return { st: 'warn' as const, n, nose: X(LANE.a), t };
  const nose = X(LANE.a) + (t - WARN) * TRAIN.v;
  if (nose - TRAIN.len < X(LANE.b)) return { st: 'pass' as const, n, nose, t: t - WARN };
  return { st: 'gone' as const, n, nose: 0, t: 0 };
};

/** The left gate's shutter (0 shut .. 1 up). */
const leftOpen = (tr: ReturnType<typeof trainAt>) =>
  tr.st === 'warn' ? Math.min(1, tr.t / LEFT_UP) : tr.st === 'pass' ? (tr.t < TAIL_OUT ? 1 : Math.max(0, 1 - (tr.t - TAIL_OUT) / LEFT_DOWN)) : 0;

/** `lag`: the frames the train's clock was held (the find's card up), so its schedule just waits. */
interface Station { said: Shout; hit: Set<object>; n: number; lag: number; gate: Block | null; find: GateFind }
const stationOf = (state: GameState) => foreignState<Station>(state, 'japan-station' as 'japan', () => ({ said: newShout(), hit: new Set(), n: -1, lag: 0, gate: null, find: newGateFind() }));
/** The train's clock. */
const clock = (state: GameState) => state.frame - stationOf(state).lag;

export const buildStation = (state: GameState) => {
  for (const [a, b, h] of [...FUJI_L, ...FUJI_R]) {
    // (the first Fuji's last step: the left gate's mouth under it, its shutter a wall of its own, moved off while open)
    if (a === GATE.a) { solid(state, X(a), Y(h), b - a, h - GATE.h, { hidden: true, tag: 'jp-fuji' }); solid(state, X(a), Y(GATE.h), b - a, GATE.h, { hidden: true, tag: 'jp-gate' }); continue; }
    solid(state, X(a), Y(h), b - a, h, { hidden: true, tag: 'jp-fuji' });
  }
  for (const [a, b, h] of REFUGES) ledge(state, X(a), Y(h), b - a, { hidden: true, tag: 'jp-refuge' });
  spawnCast(state, ENEMIES, X, Y);
  placePickups(state, 'jp', X, Y, [[4460, 410, 'small_ammo'], [4090, 140, 'small_health']]);
};

/** A frame of the station: the controls to use while the find's card holds him (the train's clock held too), else null. */
export const updateStation = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, p = state.player, s = stationOf(state);
  const held = tickGateCard(state, s.find);
  if (held) { s.lag++; return held; }
  const f = clock(state);
  const near = p.pos.x > X(3400) && p.pos.x < X(5400);
  const tr = trainAt(f);
  if (tr.n !== s.n) { s.n = tr.n; s.hit.clear(); }
  // The left gate: walkable while its shutter's up over his head; coming down on him (never, the train sees to that,
  // but never shut in) puts him back out on the track
  const open = leftOpen(tr), walk = open >= WALK_OPEN;
  s.gate ??= state.blocks.find(b => b.tag === 'jp-gate') ?? null;
  if (s.gate) {
    if (walk) s.gate.y = GY + 4000;
    else {
      if (s.gate.y !== Y(GATE.h) && p.pos.x < X(GATE.b) && p.pos.x + p.width > X(GATE.a) && p.pos.y + p.height > Y(GATE.h)) p.pos.x = X(GATE.b);
      s.gate.y = Y(GATE.h);
    }
  }
  const inGate = p.pos.x < X(GATE.b) - 8 && p.pos.x + p.width > X(GATE.a) && p.pos.y + p.height > Y(GATE.h) && p.health > 0;
  if (walk && grabGateFind(ctx, s.find, X(FIND_RX), GY)) { s.lag++; return { ...NO_CONTROLS }; }
  // Still in the mouth when the train comes through: it blasts him out, onto the track
  if (inGate && tr.st === 'pass' && tr.t < TAIL_OUT && !s.hit.has(p) && !p.inCutscene) {
    s.hit.add(p);
    if (p.invincibilityTimer <= 0 && !p.carried) hurtPlayer(ctx, BLAST, 'm2:fl_train_blast', { x: 18, y: -13 }, 50);
    else p.vel = { x: 18, y: -13 };
    playSound('crash', 1, -6); playSound('truckhorn', 0.9, 14); shakeScreen(state, 12, 10);
    for (let k = 0; k < 16; k++) state.particles.push({ pos: { x: X(GATE.b), y: GY - 20 - Math.random() * 60 }, vel: { x: 4 + Math.random() * 8, y: (Math.random() - 0.7) * 5 }, life: 26, color: k % 2 ? '#A8A29E' : '#E7E5E4', size: 3 + Math.random() * 3 });
  }
  if (tr.st !== 'gone') setHazardZones(state, 'jp-train', [{ x0: X(LANE.a), x1: X(LANE.b), y0: Y(TRAIN.h), y1: GY + 4, ground: true }]);
  if (tr.st === 'warn' && near && tr.t % 20 === 0) playSound('ding', 0.45, tr.t % 40 ? 4 : 0);
  if (tr.st === 'warn' && tr.t === 0 && near) shout(state, s.said, V.cosplay.f, byPants(state, STATION), X(4460), Y(410) - 70, 0.4);
  if (tr.st !== 'pass') return null;
  if (tr.t === 0 && near) { playSound('truckhorn', 0.9, 14); playSound('rumble', 0.9, -4); }
  if (near && tr.t % 6 === 0) shakeScreen(state, 3, 2);
  const a = Math.max(X(LANE.a), tr.nose - TRAIN.len), b = Math.min(X(LANE.b), tr.nose);
  // (the cast in the left gate's mouth go with it too)
  if (tr.nose - TRAIN.len < X(LANE.a)) hitCastIn(ctx, X(GATE.a), Y(TRAIN.h), GATE.b - GATE.a, TRAIN.h, 999, X(GATE.a) - 200, 'SHINKANSEN!', '#F8FAFC', s.hit, true);
  if (b <= a) return null;
  if (!s.hit.has(p) && hurtIn(ctx, a, Y(TRAIN.h), b - a, TRAIN.h, 18, 'm2:fl_bullet_train', { x: 16, y: -12 }, 40)) { s.hit.add(p); playSound('crash', 0.9, -2); shakeScreen(state, 8, 6); }
  hitCastIn(ctx, a, Y(TRAIN.h), b - a, TRAIN.h, 999, a - 200, 'SHINKANSEN!', '#F8FAFC', s.hit, true);
  knockPlantedIn(ctx, a, Y(TRAIN.h), b - a, GY - Y(TRAIN.h), a - 200, 'SHINKANSEN!');
  return null;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the SNES pass: art.ts paints it; still art stamped for the hour, the shutters, lights and train live)

/** How far up the tunnels' shutters are (0 shut .. 1 up): rolling up at the end of the bells, up while it passes. */
const shutterUp = (tr: ReturnType<typeof trainAt>) => (tr.st === 'warn' ? Math.min(1, Math.max(0, (tr.t - WARN + 40) / 30)) : tr.st === 'pass' ? 1 : 0);

export const drawStationBack = (c: Ctx, v: View, state: GameState) => {
  if (!onScreen(v, X(STATION_FROM), x1)) return;
  const f = state.frame, tr = trainAt(clock(state)), warn = tr.st === 'warn';
  // (the track across the station floor)
  if (onScreen(v, X(LANE.a), X(LANE.b))) drawTrack(c, v, X(LANE.a), X(LANE.b));
  // (the gantries at each end (their signals), the walkway, the station canopy over it, the departure board over that)
  const sig = warn ? ((f >> 3) % 2 ? 1 : 2) : 0;
  for (const [a, b, h] of REFUGES) {
    if (!onScreen(v, X(a) - 40, X(b) + 40)) continue;
    if (h === 140 && b - a < 200) drawGantry(c, v, X(a), X(b), Y(h), GY, sig);
    else if (h === 140) drawWalkway(c, v, X(a), X(b), Y(h));
    else if (h === 280) drawCanopy(c, v, X(a), X(b), Y(h), Y(140));
    else drawDepartureBoard(c, v, X(a), X(b), Y(h), Y(280), f);
  }
  // (the Fujis, their portals on the track side)
  const open = shutterUp(tr);
  drawFujiSteps(c, v, [...FUJI_L, ...FUJI_R].map(([a, b, h]) => ({ a: X(a), b: X(b), top: Y(h) })));
  // (the left one rolls up early: the find in its mouth, under the shutter)
  if (onScreen(v, X(LANE.a) - 100, X(LANE.a))) {
    const lo = leftOpen(tr);
    drawPortal(c, X(LANE.a) - 84, Y(GATE.h), lo, warn, f);
    drawGateFind(c, stationOf(state).find, X(FIND_RX), GY, Y(GATE.h) + Math.round(GATE.h * (1 - lo)), f);
  }
  if (onScreen(v, X(LANE.b), X(LANE.b) + 100)) drawPortal(c, X(LANE.b), Y(TRAIN.h + 10), open, warn, f);
  // (the signs: held up, nothing over them)
  if (onScreen(v, X(3560), X(3720))) postBoard(c, X(3640), GY, ['SHINKANSEN', 'BULLET TRAIN', '(DOES NOT STOP)'], LOOKS.japan(1), '#F8FAFC', undefined, 150);
  if (onScreen(v, X(4300), X(4620))) hungBoard(c, X(4460), Y(280) + 12, Y(280) + 46, ['PLEASE STAND BEHIND', 'THE YELLOW LINE'], LOOKS.japan(1), '#F8FAFC');
  if (onScreen(v, X(5260), X(5400))) postBoard(c, X(5330), GY, ['LEAVING JAPAN', 'SAYONARA (THANK YOU)'], LOOKS.japan(1), '#F8FAFC', undefined, 100);
};

export const drawStationFront = (c: Ctx, v: View, state: GameState) => {
  const tr = trainAt(clock(state));
  if (tr.st === 'pass' && onScreen(v, X(LANE.a), X(LANE.b))) drawTrainArt(c, tr.nose, TRAIN.len, Y(TRAIN.h), TRAIN.h, X(LANE.a) - 84, X(LANE.b) + 84, state.frame);
  drawShout(c, stationOf(state).said);
};

export const stationLamps = (v: View, state: GameState): Light[] => {
  const f = state.frame, tr = trainAt(clock(state));
  if (!onScreen(v, X(LANE.a), X(LANE.b)) || tr.st !== 'warn' || (f >> 3) % 2) return [];
  return [{ x: X(4090), y: Y(170), r: 110, a: 0.6, color: '#EF4444' }, { x: X(4850), y: Y(170), r: 110, a: 0.6, color: '#EF4444' }];
};
