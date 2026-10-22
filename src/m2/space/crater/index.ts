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
import { drawImpactBackdrop, drawCraterBack, drawCraterFront, floorAt, SITE_LAMPS } from './art';
import { type House, tramKeepOut, makeHouse, buildHouse, tickHouse, showOn, showSkipT, drawHouseBack, drawHouseProps, drawHouseFront, houseLighting, AFTER_PRESHOW_CP } from './house';
import { D, BOWL, RIM, DOME, CART, PYLON, CATWALKS, CRATES, FACADE_X, HOUSE_DOOR, PRESHOW, HALLS, WRECK_X, TRAMS } from './layout';
import * as L from './lines';

const { x0, x1 } = SECTIONS.crater;
const pick = pickLine;

interface Crater { house: House; saidArrive: boolean; saidRun: boolean; saidHouse: boolean; arriveHold?: boolean }
const craterOf = (state: GameState) => spaceState<Crater>(state, 'crater', () => ({ house: makeHouse(), saidArrive: false, saidRun: false, saidHouse: false }));

/** Who's where: [kind, x, the floor under it, its look's seed]. Out at the site, taught one at a time (the soldier up
 *  on the wreck's dome, then one on the flat; the crawlers; the brute alone; then mixed), the runners all through it.
 *  In XENOSCARE, mixed, more of them, up on the catwalks and the crates too. Never on a tram's floor (tramKeepOut: a
 *  car takes all of it): the bridge's are at its far end, shooting across the track at him (the soldier) and waiting
 *  for him to step off it (the brute); the engine room's are up on its crates (shooting down at him on the track) and
 *  at its two ends, where the floor's theirs. */
const ENEMIES: [string, number, number, number][] = [
  // (the impact site: the soldier up on the wreck's dome; another at the top of the bowl's far side, shooting down at
  // him climbing out; one up on the churro cart with a crawler waiting where he lands off it, another past it; then the
  // brute with a crawler at his feet and a soldier behind him, shooting past him (the pylon and the way to XENOSCARE's
  // checkpoint quiet))
  [FLEER, D + 700, GY, 3], [GRUNT, DOME.x + 85, DOME.y, 11], [FLEER, D + 1640, GY + BOWL.deep, 7], [FLEER, D + 2480, GY, 13],
  [GRUNT, D + 2250, GY, 31], [GRUNT, CART.x + CART.w / 2, GY - CART.h + 6, 17], [CRAWLER, D + 3060, GY, 19], [CRAWLER, D + 3330, GY, 23], [FLEER, D + 3420, GY, 25],
  [CRAWLER, D + 3830, GY, 37], [BRUTE, D + 3940, GY, 29], [FLEER, D + 4560, GY, 34], [GRUNT, D + 4080, GY, 41],
  // (the queue)
  [GRUNT, D + 5820, GY, 43], [GRUNT, D + 6120, GY, 46],
  // (THE BRIDGE: the tram's the thing; from the far end, past the track)
  [GRUNT, D + 9300, GY, 55], [BRUTE, D + 9440, GY, 59],
  // (THE SPECIMEN BAY: up on the gantries too; the operators (seeds from 1000: headsets on) are posted by the rigs
  // they'll take over)
  [GRUNT, CATWALKS[0][0] + 240, CATWALKS[0][1], 1061], [GRUNT, CATWALKS[1][0] + 120, CATWALKS[1][1], 67], [CRAWLER, D + 9560, GY, 65],
  [CRAWLER, D + 9720, GY, 53], [GRUNT, CATWALKS[2][0] + 150, CATWALKS[2][1], 1073], [BRUTE, D + 9900, GY, 71],
  // (the way into the engine room, before its track: one over it on the last catwalk)
  [GRUNT, D + 10030, GY, 77], [CRAWLER, D + 10100, GY, 79], [GRUNT, CATWALKS[3][0] + 80, CATWALKS[3][1], 1081],
  // (THE ENGINE ROOM: everything at once; up on its crates, out of the tram's way, shooting down at him on the track;
  // nobody on the first crate: THE ENGINE ROOM checkpoint's in reach of it)
  [GRUNT, CRATES[1][0] + CRATES[1][1] / 2, GY - CRATES[1][2], 1085],
  [GRUNT, CRATES[2][0] + CRATES[2][1] / 2, GY - CRATES[2][2], 91],
  // (past its track, waiting for him to get off it)
  [CRAWLER, D + 12130, GY, 89], [BRUTE, D + 12320, GY, 95],
  // (the corridor aft to the hold: the operators (headsets on), there to take the props over, right before her; and
  // they've seen what he did on the way, and say so)
  [GRUNT, D + 12220, GY, 1097], [GRUNT, D + 12440, GY, 1099],
];
/** What's lying about (small: lean drops): [x, y (feet), type]. */
const PICKUPS: [number, number, PickupType][] = [[PYLON.x + 60, PYLON.y, 'small_health'], [CATWALKS[1][0] + 40, CATWALKS[1][1], 'small_ammo'], [CRATES[2][0] + 45, GY - CRATES[2][2], 'small_health']];

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
    // (nobody stood on a tram's floor (ENEMIES is laid out clear of it); one that somehow is, moved off past its nearer
    // end, so a car never has them before he's even there)
    for (const [k, x0, y, seed] of ENEMIES) {
      let x = x0;
      const t = y === GY ? TRAMS.findIndex(([a, b]) => { const [k0, k1] = tramKeepOut(a, b); return x > k0 - 40 && x < k1 + 40; }) : -1;
      if (t >= 0) {
        const [k0, k1] = tramKeepOut(...TRAMS[t]);
        x = x - k0 < k1 - x ? k0 - 60 : k1 + 60;
        if (import.meta.env?.DEV) console.warn(`[crater] ${k} posted on a tram's floor at ${x0}: moved to ${x}`);
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
    // (the jump scares' props over everything, their bolts over those)
    drawHouseProps(c, state, craterOf(state).house);
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
  ...SITE_LAMPS.map(x => ({ x, y: GY - 156, r: 130, a: 0.6, color: 'rgba(249, 168, 212, 0.08)' })),
  { x: HOUSE_DOOR - 180, y: GY - 395, r: 200, a: 0.6, color: 'rgba(74, 222, 128, 0.08)' },
];
void floorAt;
