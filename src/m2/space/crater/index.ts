// THE CRATER: section 7 of Space Land (owner: the haunted-house agent). The UFO's impact site: the wreck nose down in
// the bowl it plowed, smoking; dead aliens all over (head first in the dirt, in halves, run through on its antenna, in a
// heap, wrapped round a lamp post: undignified, gory, green); and the ones that got out, running for it (some), or coming
// for him (the rest: sore about the ship). They run for XENOSCARE, the park's cheap haunted spaceship (a parody of the
// old alien-encounter rides, and of a certain movie derelict: LEGALLY DISTINCT, its signs insist; its own name and look),
// and in he goes after them: the boarding queue, the teleporter pre-show (the BOO), then the ship (the bridge, the
// specimen bay, the engine room), where cheap animatronics jump out and go BOO while the real ones fight him, griping
// that the ride makes aliens look like violent invaders (they are violent invaders). Further in, their operators (in
// mind-control headsets) take the animatronics over and set them on him: kill the operator, and it's a prop again. In
// the corridor aft to the hold the props are only props; the ones there tell him what a callous prick he is.
// On to the queen section's start (the hold: the showpiece).
//
// Laid out in layout.ts; the aliens (kinds.ts, drawn in aliens.ts); the ride's machinery (house.ts: the pre-show, the
// trams; rigs.ts: the animatronics); the rest drawn in art.ts. The impact site is outdoors (the time of day's light); XENOSCARE indoors
// (its own dark).
//
// The way back: none to the left (he came down in the crash: one way); on: the right end, into the queen's antechamber
// (and back from it).

import type { GameState } from '../../../m1/game/core/state';
import type { EnemyKind, PickupType } from '../../../m1/types';
import type { SpaceSection } from '../section';
import { layOwn, endWalls, endExits, runExits, solid, ledge, spaceState, meatheadSays, box } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { pickLine } from '../../../m1/game/platform/speech';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { todLight } from '../../timeOfDay';
import { drawBars } from '../../spooky/control/cine';
import { GRUNT, BRUTE, CRAWLER, FLEER, seedAlien, tickAliens, sweepGone, drawBolts, drawAlienSaid, resetAliens, setBarkPlace, setOnFlee, setHush } from './kinds';
import { resetRigs } from './rigs';
import { drawImpactBackdrop, drawCraterBack, drawCraterFront, floorAt } from './art';
import { type House, makeHouse, buildHouse, tickHouse, showOn, showSkipT, drawHouseBack, drawHouseFront, houseLighting, AFTER_PRESHOW_CP } from './house';
import { D, BOWL, RIM, DOME, CART, PYLON, CATWALKS, CRATES, FACADE_X, HOUSE_DOOR, PRESHOW, HALLS, WRECK_X, TRAMS } from './layout';
import * as L from './lines';

const { x0, x1 } = SECTIONS.crater;
const pick = pickLine;

interface Crater { house: House; saidArrive: boolean; saidRun: boolean; saidHouse: boolean; arriveHold?: boolean }
const craterOf = (state: GameState) => spaceState<Crater>(state, 'crater', () => ({ house: makeHouse(), saidArrive: false, saidRun: false, saidHouse: false }));

/** Who's where: [kind, x, the floor under it, its look's seed]. Out at the site, taught one at a time (the soldier up
 *  on the wreck's dome, then one on the flat; the crawlers; the brute alone; then mixed), the runners all through it.
 *  In XENOSCARE, mixed, more of them, up on the catwalks and the crates too. */
const ENEMIES: [string, number, number, number][] = [
  // (the impact site)
  [FLEER, D + 700, GY, 3], [GRUNT, DOME.x + 85, DOME.y, 11], [FLEER, D + 1640, GY + BOWL.deep, 7], [FLEER, D + 2480, GY, 13],
  [GRUNT, D + 2660, GY, 17], [CRAWLER, D + 3160, GY, 19], [CRAWLER, D + 3330, GY, 23], [FLEER, D + 3420, GY, 25],
  [BRUTE, D + 3940, GY, 29], [GRUNT, PYLON.x + 220, PYLON.y, 31], [CRAWLER, D + 4620, GY, 37], [FLEER, D + 4560, GY, 34], [GRUNT, D + 4760, GY, 41],
  // (the queue)
  [GRUNT, D + 5820, GY, 43], [GRUNT, D + 6120, GY, 46],
  // (THE BRIDGE)
  [GRUNT, D + 7420, GY, 47], [CRAWLER, D + 8020, GY, 53], [GRUNT, D + 8320, GY, 55], [BRUTE, D + 8880, GY, 59],
  // (THE SPECIMEN BAY: up on the gantries too; the operators (seeds from 1000: headsets on) are posted by the rigs
  // they'll take over)
  [GRUNT, CATWALKS[0][0] + 130, CATWALKS[0][1], 1061], [CRAWLER, D + 9300, GY, 65], [GRUNT, CATWALKS[1][0] + 120, CATWALKS[1][1], 67],
  [BRUTE, D + 9620, GY, 71], [GRUNT, CATWALKS[2][0] + 150, CATWALKS[2][1], 1073], [GRUNT, D + 10160, GY, 77],
  // (THE ENGINE ROOM: everything at once)
  [GRUNT, CRATES[0][0] + CRATES[0][1] / 2, GY - CRATES[0][2], 1081], [CRAWLER, D + 10700, GY, 79], [BRUTE, D + 10960, GY, 83], [GRUNT, CRATES[1][0] + CRATES[1][1] / 2, GY - CRATES[1][2], 1085],
  [CRAWLER, D + 11260, GY, 89], [GRUNT, D + 11420, GY, 91], [BRUTE, D + 11960, GY, 95],
  // (the corridor aft to the hold: the operators (headsets on), there to take the props over, right before her; and
  // they've seen what he did on the way, and say so)
  [GRUNT, D + 12220, GY, 1097], [GRUNT, D + 12440, GY, 1099],
];
/** What's lying about (small: lean drops): [x, y (feet), type]. */
const PICKUPS: [number, number, PickupType][] = [[PYLON.x + 60, PYLON.y, 'small_health'], [CATWALKS[1][0] + 40, CATWALKS[1][1], 'small_ammo'], [CRATES[2][0] + 45, GY - CRATES[2][2], 'small_health']];

/** How far either side of a tram's track a car reaches (it comes out of the wall well before it, goes on past). */
const TRAM_REACH = 230;
let fresh = true;

export const crater: SpaceSection = {
  id: 'crater', x0, x1,
  checkpoints: [
    { name: 'THE IMPACT SITE', cp: 60, x: DOORS.crater.start.x, y: GY },
    { name: 'XENOSCARE', cp: 61, x: FACADE_X - 520, y: GY },
    { name: 'THE TELEPORTER', cp: AFTER_PRESHOW_CP, x: PRESHOW.r + 90, y: GY },
    { name: 'THE SPECIMEN BAY', cp: 63, x: HALLS.specimen.l + 90, y: GY },
    { name: 'THE ENGINE ROOM', cp: 64, x: HALLS.engine.l + 70, y: GY },
  ],
  build: (state) => {
    // The ground: the furrow, the bowl (down, its floor, up), the lawns and walks; XENOSCARE's floor
    layOwn(state, [
      { x1: x0 - 200, y1: GY, x2: BOWL.a, y2: GY, surface: 'dirt' },
      { x1: BOWL.a, y1: GY, x2: BOWL.b, y2: GY + BOWL.deep, surface: 'dirt' },
      { x1: BOWL.b, y1: GY + BOWL.deep, x2: BOWL.c, y2: GY + BOWL.deep, surface: 'dirt' },
      { x1: BOWL.c, y1: GY + BOWL.deep, x2: BOWL.d, y2: GY, surface: 'dirt' },
      { x1: BOWL.d, y1: GY, x2: HOUSE_DOOR, y2: GY, surface: 'grass' },
      { x1: HOUSE_DOOR, y1: GY, x2: x1 + 200, y2: GY, surface: 'tile' },
    ]);
    endWalls(state, 'crater');
    // (the wreck's rim and dome; the cart; the pylon; the catwalks; the crates)
    ledge(state, RIM.x, RIM.y, RIM.w, { hidden: true, tag: 'crater-wreck' });
    ledge(state, DOME.x, DOME.y, DOME.w, { hidden: true, tag: 'crater-wreck' });
    solid(state, CART.x, GY - CART.h + 6, CART.w, CART.h - 6, { hidden: true, tag: 'crater-cart' });
    ledge(state, PYLON.x, PYLON.y, PYLON.w, { hidden: true, tag: 'crater-pylon' });
    for (const [x, y, w] of CATWALKS) ledge(state, x, y, w, { hidden: true, tag: 'xeno-catwalk' });
    for (const [x, w, h] of CRATES) solid(state, x, GY - h, w, h, { hidden: true, tag: 'xeno-crate' });
    // (coming at it fresh: the lines again, the pre-show again)
    if (state.checkpoint < 60) fresh = true;
    resetAliens(); resetRigs(fresh);
    const cr = craterOf(state);
    buildHouse(state, cr.house);
    if (!fresh) cr.saidArrive = true;
    fresh = false;
    // (nobody stood on a tram's track to start with, where a car would have them before he's even there: those posted
    // on the floor along one start out past its nearer end, spaced out, facing in)
    const offTrack = new Map<number, number>();
    for (const [k, x0, y, seed] of ENEMIES) {
      let x = x0;
      const t = y === GY ? TRAMS.findIndex(([a, b]) => x > a - TRAM_REACH && x < b + TRAM_REACH) : -1;
      if (t >= 0) {
        const [a, b] = TRAMS[t], end = x - a < b - x ? -1 : 1, n = offTrack.get(t * 2 + (end > 0 ? 1 : 0)) ?? 0;
        offTrack.set(t * 2 + (end > 0 ? 1 : 0), n + 1);
        x = end < 0 ? a - TRAM_REACH - 30 - n * 70 : b + TRAM_REACH + 30 + n * 70;
      }
      const e = seedAlien(makeKindEnemy(k as EnemyKind, x, y), seed);
      e.facing = -1;
      state.enemies.push(e);
    }
    state.pickups.push(...PICKUPS.map(([x, y, type], i) => ({ id: `crater-${i}`, pos: { x: x - 10, y: y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 })));
    setBarkPlace(e => (e.pos.x > HALLS.exit.l ? 'aft' : e.pos.x > HOUSE_DOOR ? 'house' : 'crash'));
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, cr = craterOf(state), cx = p.pos.x + p.width / 2;
    // (just down out of the sky in the saucer's wreck (orbit/ufo.ts): his line first, queued after the gun's, said in
    // full, him held still (no HUD) and nobody barking over it; then he's his)
    if (state.stageMemo['m2:orbit:crashed'] === '1') {
      state.stageMemo['m2:orbit:crashed'] = '2';
      cr.saidArrive = true; cr.arriveHold = true; setHush(true);
      meatheadSays(state, pick(L.MH_ARRIVE), true, () => { cr.arriveHold = false; setHush(false); p.inCutscene = false; });
    }
    tickAliens(ctx);
    sweepGone(state);
    setOnFlee(() => { if (!cr.saidRun && cr.saidArrive) { cr.saidRun = true; meatheadSays(state, pick(L.MH_ESCAPEES), false); } });
    if (cr.arriveHold) { p.inCutscene = true; p.invincibilityTimer = Math.max(p.invincibilityTimer, 2); p.vel.x = 0; return { ...NO_CONTROLS }; }
    const out = tickHouse(ctx, cr.house, controls);
    if (out) return out;
    // (his bits: walking out into it; up to the haunted house)
    if (state.checkpoint > 60) cr.saidArrive = true;
    if (!cr.saidArrive && cx > D + 360 && p.isGrounded) { cr.saidArrive = true; meatheadSays(state, pick(L.MH_ARRIVE), false); }
    if (!cr.saidHouse && cx > FACADE_X - 600 && cx < HOUSE_DOOR) { cr.saidHouse = true; meatheadSays(state, pick(L.MH_HOUSE), false); }
    // (on into the queen's antechamber; no way back up into the sky)
    runExits(state, endExits('crater').filter(e => e.x0 > x0 + 100));
    return controls;
  },
  drawBackdrop: (c, state) => {
    if (state.camera.x < HOUSE_DOOR + 40) return drawImpactBackdrop(c, state);
    box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#07040E');
    return true;
  },
  drawBack: (c, state) => {
    drawCraterBack(c, state);
    drawHouseBack(c, state, craterOf(state).house);
  },
  drawFront: (c, state) => {
    drawCraterFront(c, state);
    drawBolts(c, state.frame);
    drawHouseFront(c, state, craterOf(state).house);
    drawAlienSaid(c, state);
  },
  drawHud: (c, state) => {
    const h = craterOf(state).house;
    if (showOn(h)) { drawBars(c, Math.min(1, showSkipT(h) / 20)); if (showSkipT(h) > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
  },
  lighting: (state) => houseLighting(state, craterOf(state).house) ?? todLight(LAMPS, 1),
  lamps: () => LAMPS,
  outdoors: (state) => (state.player.pos.x < HOUSE_DOOR ? 1 : 0),
};

/** The impact site's lamps (the fires, the park's lamp posts): glowing as the day goes. */
const LAMPS = [
  { x: WRECK_X + 130, y: GY - 60, r: 160, a: 0.7, color: 'rgba(249, 115, 22, 0.1)' },
  { x: D + 3600, y: GY - 60, r: 140, a: 0.7, color: 'rgba(249, 115, 22, 0.1)' },
  { x: D + 2300, y: GY - 156, r: 130, a: 0.6, color: 'rgba(249, 168, 212, 0.08)' },
  { x: D + 4880, y: GY - 156, r: 130, a: 0.6, color: 'rgba(249, 168, 212, 0.08)' },
  { x: HOUSE_DOOR - 180, y: GY - 395, r: 200, a: 0.6, color: 'rgba(74, 222, 128, 0.08)' },
];
void floorAt;
