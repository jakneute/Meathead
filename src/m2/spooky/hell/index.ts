// REAL HELL: section 6 of Spooky Land. He comes down the shaft from the top of the clock tower (the elevator went
// through the floor; he jumps after it) and lands in the pit: the destroyed elevator car, its riders' bits all over.
// The ride's still boarding: now and then another car comes down the shaft. Then hell's wildlife (kinds.ts: imps that
// lob fire, hellhounds, fire bats, a horned hell goat), taught one at a time; the platforming (hazards.ts: lava, fire
// jets, crumbling rock), taught then escalated; the big health and ammo; the sub-boss, BLOATHAZAR, Satan's boy
// (demon.ts); beaten, he goes crying to his dad, and Satan comes up out of the lava and blows Meathead back up to earth
// on a lava geyser (satan.ts): into Donnie's control room (the control section's DOORS start).
//
// No costumed park staff here: it's the real thing. Laid out in layout.ts; drawn in art.ts (crude first pass).
//
// The way back: from the control room he comes back down by the vent (DOORS.hell.end); back through the pit (the
// demon's gone, his fork's still stuck in the floor, the wreck's piled higher), and up the STAIRS in the pit's rock to
// the top of the clock tower (DOORS.tower.end).

import type { SpookySection } from '../section';
import type { EnemyKind } from '../../../m1/types';
import { layOwn, solid, ledge, endWalls, teleport, meatheadSays } from '../section';
import { DOORS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import {
  x0, x1, D, SHAFT_L, SHAFT_R, SHAFT_TOP, LEFT_ROCK_BOTTOM, RIGHT_ROCK_BOTTOM, RIGHT_ROCK_W, STAIRS_X, POOLS, LAVA_DROP, ROCKS, LEDGES,
  REFILL_X, VENT_X, WRECK_X, CAB_W, CAB_H, PICKUPS,
} from './layout';
import { hellOf } from './state';
import { HELL_KINDS } from './kinds';
import { buildHazards, updateHazards, drawLava, drawHazards, drawHazardsFront } from './hazards';
import { buildDemon, updateDemon, drawDemon, drawDemonSaid, drawDemonHud, drawFireWall, demonOf, DONE_CP } from './demon';
import { startFinale, startVent, runFinale, finaleZoom, drawSatan, drawGeyser, drawFinaleHud } from './satan';
import { drawHellBackdrop, drawHellWorld, drawLake } from './art';
import { MH_LANDED, MH_BODIES, MH_LAVA } from './lines';

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

/** Who's where: [kind, x, the floor under it (or, flying, how high)]. Each kind on its own first, where its type
 *  works (the thrower up on a rock, the rushers on a long run, the flyers over the lava), then mixed. */
const ENEMIES: [keyof typeof HELL_KINDS, number, number][] = [
  // (the bone yard: an imp up on a low rock; another higher)
  ['imp', D + 1950, GY - 110], ['imp', D + 2200, GY - 220],
  // (the hound run: one, then two)
  ['hound', D + 2700, GY], ['hound', D + 3180, GY], ['hound', D + 3300, GY],
  // (the first lava's pool: bats over it)
  ['bat', D + 4020, GY - 230], ['bat', D + 4270, GY - 250],
  // (the high road over the vents: an imp on it)
  ['imp', D + 5000, GY - 200],
  // (the goat, alone on its flat)
  ['goat', D + 5920, GY],
  // (the lake: an imp on the pillar, bats over it)
  ['imp', D + 6830, GY - 90], ['bat', D + 6480, GY - 330], ['bat', D + 6930, GY - 290],
  // (the shore: hounds on the run in, the goat behind them, an imp up on its rock)
  ['hound', D + 7260, GY], ['hound', D + 7360, GY], ['goat', D + 7460, GY], ['imp', D + 7585, GY - 120],
];

export const hell: SpookySection = {
  id: 'hell', x0, x1,
  checkpoints: [
    { name: 'THE BOTTOM OF THE PIT', cp: 50, x: D + 760, y: GY },
    { name: 'THE BRIMSTONE STEPS', cp: 51, x: D + 5640, y: GY },
    // (back for another go at the demon: nobody about the refill and his pit)
    { name: 'THE DEMON', cp: 52, x: REFILL_X - 60, y: GY, clear: [500, 1600] },
    { name: "SATAN'S DOORSTEP", cp: DONE_CP, x: VENT_X - 300, y: GY },
  ],
  build: (state) => {
    // The floor (the pools a little lower: lava), the shaft's rock, the rocks in the lava, the ledges
    const runs = [];
    let from = x0 - 200;
    for (const [a, b] of POOLS) { runs.push({ x1: from, y1: GY, x2: a, y2: GY, surface: 'rock' }, { x1: a, y1: GY + LAVA_DROP, x2: b, y2: GY + LAVA_DROP, surface: 'lava' }); from = b; }
    runs.push({ x1: from, y1: GY, x2: x1 + 200, y2: GY, surface: 'rock' });
    layOwn(state, runs);
    solid(state, x0 - 200, SHAFT_TOP, SHAFT_L - x0 + 200, LEFT_ROCK_BOTTOM - SHAFT_TOP, { hidden: true, tag: 'hell' });
    solid(state, SHAFT_R, SHAFT_TOP, RIGHT_ROCK_W, RIGHT_ROCK_BOTTOM - SHAFT_TOP, { hidden: true, tag: 'hell' });
    for (const [x, top, w] of ROCKS) solid(state, x, top, w, GY + LAVA_DROP + 40 - top, { hidden: true, tag: 'hell' });
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'hell' });
    // (the wreck's cab: stand on its roof)
    solid(state, WRECK_X - CAB_W / 2, GY - CAB_H, CAB_W, CAB_H, { hidden: true, tag: 'hell-cab' });
    endWalls(state, 'hell');
    const h = hellOf(state);
    buildHazards(state, h);
    for (const [k, x, y] of ENEMIES) {
      const e = makeKindEnemy(HELL_KINDS[k] as EnemyKind, x, y);
      e.facing = -1;
      state.enemies.push(e);
    }
    buildDemon(state);
    // Before the demon: the big health and the big ammo
    state.pickups.push(
      { id: 'hell-health', pos: { x: REFILL_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'hell-ammo', pos: { x: REFILL_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
      // (and what's out on the side paths)
      ...PICKUPS.map(([x, y, type], i) => ({ id: `hell-side-${i}`, pos: { x: x - 10, y: y - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 })),
    );
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, h = hellOf(state);
    // The cutscene after the demon (and the vent's geyser): it has the controls
    const fin = runFinale(ctx);
    if (fin) return fin;
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    // Down the shaft: the landing (hard: a crunch, a shake; his bit about it, and about the bodies)
    if (!h.landed && cx < SHAFT_R && p.vel.y > 14) h.falling = true;
    if (h.falling && p.isGrounded) {
      h.falling = false; h.landed = true;
      playSound('land', 1); playSound('thud', 1, -8); playSound('splat', 0.7, -4); shakeScreen(state, 14, 6);
      for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: cx, y: GY - 2 }, vel: { x: (Math.random() - 0.5) * 10, y: -1 - Math.random() * 4 }, life: 30, color: i % 2 ? '#78350F' : '#7F1D1D', size: 4 + Math.random() * 5, grav: 0.3 });
      meatheadSays(state, pick(MH_LANDED), true);
      meatheadSays(state, pick(MH_BODIES), true);
    }
    // (the first lava: he's got something to say about it)
    if (!h.lavaSaid && cx > POOLS[0][0] - 380 && cx < POOLS[0][0]) { h.lavaSaid = true; meatheadSays(state, pick(MH_LAVA), false); }
    updateHazards(ctx, h);
    // The demon; beaten, the cutscene
    const d = demonOf(state);
    const wasOn = d?.fight === 'on';
    updateDemon(ctx);
    if (wasOn && d?.fight === 'beaten') { startFinale(state); return runFinale(ctx) ?? controls; }
    // The ways out: the stairs up (to the top of the clock tower), the vent (up to the control room, once he's beaten)
    if (p.health > 0 && p.isGrounded && feet > GY - 4) {
      if (cx < STAIRS_X + 40) { teleport(state, DOORS.tower.end.x, DOORS.tower.end.y); p.facing = -1; return controls; }
      // (walking on to it, rightward: going back the other way, he walks over it)
      if ((!d || d.fight === 'gone') && Math.abs(cx - VENT_X) < 30 && p.vel.x > 0.5) { startVent(state); return runFinale(ctx) ?? controls; }
    }
    return controls;
  },
  zoom: (state) => finaleZoom(state),
  drawBackdrop: (c, state) => { drawHellBackdrop(c, state); return true; },
  drawBack: (c, state) => {
    const d = demonOf(state);
    drawLake(c, state, 'shore');
    drawSatan(c, state);
    drawLake(c, state, 'surface');
    drawHellWorld(c, state, { extraWreck: state.checkpoint >= DONE_CP, beaten: !d || d.fight !== 'wait' && d.fight !== 'on' });
    drawLava(c, state);
    drawHazards(c, state);
    drawFireWall(c, state);
    drawGeyser(c, state);
    drawDemon(c, state);
  },
  drawFront: (c, state) => {
    drawHazardsFront(c, state);
    drawDemonSaid(c, state);
  },
  drawHud: (c, state) => {
    drawDemonHud(c, state);
    drawFinaleHud(c, state);
  },
};
