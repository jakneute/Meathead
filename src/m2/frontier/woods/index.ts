// THE WOODS: section 5 of Wilderness Land. Out of the woodchipper, off the crew's clearing and into real woods, outside
// the park's bounds (the land's turn: "Wilderness Land" ends up in the ACTUAL wilderness): real trees, a dirt trail,
// litter, a real NO TRESPASSING sign, power lines, the park's back fence glimpsed far behind (art.ts, far.ts, ground.ts;
// paint.ts the kit, the log ride's real side's). A short walk with
// a couple of real hazards (hazards.ts: poison ivy, taught alone; a real bear trap), a crow or two, then the local kids'
// dirt lot, the refill, and THE BOUNTY (scene.ts, the user's: the kick, "MINE", Tucker EXTRA BLOODIED out of the leaf
// pile, the hijack, the apology, "20 BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD'S HEAD", the teens happily
// oblige) and off on the kid's bike into the dirt-bike chase (DOORS.dirtbike.start; job 6's takeBountyHandoff).
//
// Checkpoints 40-49: the treeline (40), the dirt lot (41). The ways: in from the crew's clearing (DOORS.woods.start);
// no way back (one-way: the left end's a dead end, the river bank and a thicket, art.ts); on: the bounty's ride (once it's been,
// off the right end on foot to the chase's start); back from the chase onto the lot (DOORS.woods.end). Revisits: the
// lot's empty (the kids off chasing him), the leaf pile scattered, the kid he kicked off sulking on a stump (his lines
// by the state of Meathead). BOUNTY_MEMO keeps it done (respawns, the checkpoint skip past it).

import type { EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { layOwn, solid, endWalls, runExits, meatheadSays, speak, saidOver, byPants, landVisit, type FrontierSection, type Exit } from '../section';
import { DOORS } from '../geometry';
import { x0, x1, X, GY, CP_LOT, FALLEN, BOULDER, CROWS, REFILL, TRIG, SULK } from './layout';
import { woodsOf } from './state';
import { makeBike, rideBike, teenOf } from './teens';
import { updateHazards, drawIvy, drawTrap, ivyLamps } from './hazards';
import { BOUNTY_MEMO, bountyDone, inBounty, startBounty, updateBounty, tickBountyCast, drawBountyCast, drawBountyFront, drawBountyHud, kidASeed } from './scene';
import { drawWoodsBackdrop, drawWoodsBack, drawWoodsFront, drawPile, drawSulk } from './art';
import { REAL_WOODS, KID_SULK } from './lines';

/** The ways off its ends, on foot (the right one only once the bounty's been: before it, the bounty's ride is the way). */
const exits = (on: boolean): Exit[] => [
  ...(on ? [{ x0: x1 - 60, x1, yTop: GY - 40, yBot: GY + 2, to: DOORS.dirtbike.start }] : []),
];
/** Said the woods' first line this visit. */
let woodsVisit = -1;

export const woods: FrontierSection = {
  id: 'woods', x0, x1,
  checkpoints: [
    { name: 'THE WOODS', cp: 40, x: X(200), y: GY },
    { name: 'THE DIRT LOT', cp: 41, x: X(CP_LOT), y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'woods');
    // (the fallen tree, the boulder: stand on them, jump from them)
    solid(state, X(FALLEN[0]), GY - FALLEN[2], FALLEN[1] - FALLEN[0], FALLEN[2], { hidden: true });
    solid(state, X(BOULDER[0]) + 4, GY - BOULDER[2], BOULDER[1] - BOULDER[0] - 8, BOULDER[2], { hidden: true });
    for (const [rx, h] of CROWS) { const e = makeKindEnemy('m2:fr_crow' as EnemyKind, X(rx), GY - h); e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = rx % 7; state.enemies.push(e); }
    // (the refill before the bounty, and the chase after it)
    state.pickups.push(
      { id: 'woods-health', pos: { x: X(REFILL) - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'woods-ammo', pos: { x: X(REFILL) + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
    const w = woodsOf(state);
    w.first = true;
    // (the lot's riders, doing laps over the jumps in its back lane: till the bounty, then off chasing him for good)
    if (!bountyDone(state)) for (let i = 0; i < 4; i++) {
      const seed = 600 + i * 41 + landVisit() * 7, b = makeBike(seed, X(2000 + i * 230), 1, i % 2 ? -1 : 1, teenOf(seed));
      b.loop = { a: X(1980), b: X(2900) }; b.vx = b.facing * 4;
      w.bikes.push(b);
    }
    if (bountyDone(state)) w.pile.burst = true;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, w = woodsOf(state);
    const cx = p.pos.x + p.width / 2;
    // (the checkpoint skip to somewhere past the bounty: it's been)
    if (w.first) { w.first = false; if (state.checkpoint >= 50 && !bountyDone(state)) { state.stageMemo[BOUNTY_MEMO] = '1'; w.bikes = []; w.pile.burst = true; } }
    tickBountyCast(state);
    // ---- the bounty
    if (inBounty(state)) return updateBounty(ctx) ?? controls;
    if (!bountyDone(state)) {
      // (back on the lot from the chase's end without it ever having been (the checkpoint skip): it's been)
      if (cx > X(TRIG) + 400) { state.stageMemo[BOUNTY_MEMO] = '1'; w.bikes = []; w.pile.burst = true; }
      else if (cx >= X(TRIG) && p.isGrounded && p.health > 0 && !p.inCutscene) { startBounty(state); return updateBounty(ctx) ?? controls; }
    }
    // ---- the lot's riders, doing laps (their engines' buzz while they're near)
    for (const b of w.bikes) if (b.loop) rideBike(b);
    if (!bountyDone(state) && cx > X(CP_LOT) - 500 && --w.buzz <= 0) { w.buzz = 40 + Math.floor(Math.random() * 40); playSound('engine', 0.22, 4 + Math.random() * 8); }
    // ---- the woods' first line (once a visit)
    if (woodsVisit !== landVisit() && cx > X(380) && p.health > 0) { woodsVisit = landVisit(); meatheadSays(state, pickLine(byPants(state, REAL_WOODS)), false); }
    // ---- after: the kid he kicked off, sulking on his stump
    if (bountyDone(state)) {
      const d = Math.abs(cx - X(SULK));
      if (w.sulkArmed && d < 110 && p.health > 0) { w.sulkArmed = false; speak(teenOf(kidASeed()).voice, pickLine(byPants(state, KID_SULK)), s => { w.sulk = s; }, false); }
      if (d > 320) w.sulkArmed = true;
    }
    // ---- the ways off
    if (runExits(state, exits(bountyDone(state)))) return controls;
    return updateHazards(ctx, controls);
  },
  cameraX: () => ({ min: x0, max: x1 - CANVAS_WIDTH }),
  drawBackdrop: (c, state) => drawWoodsBackdrop(c, state),
  drawBack: (c, state) => {
    drawWoodsBack(c, state);
    drawIvy(c, state);
    drawTrap(c, state);
    const w = woodsOf(state);
    drawPile(c, state, w.pile.burst, w.pile.shiver);
    if (bountyDone(state) && !inBounty(state)) drawSulk(c, state, kidASeed(), !!w.sulk);
    drawBountyCast(c, state);
  },
  drawFront: (c, state) => {
    drawWoodsFront(c, state);
    drawBountyFront(c, state);
    const w = woodsOf(state);
    if (w.sulk && bountyDone(state)) saidOver(c, w.sulk.text, X(SULK), GY - 90, '#E0F2FE', 240);
  },
  drawHud: (c, state) => drawBountyHud(c, state),
  outdoors: () => 1,
  // (the poison ivy glows: a sickly green, at dusk and after)
  lamps: () => ivyLamps(),
};
