// THE DUNGEON: section 3 of Spooky Land, the last stop of the castle's ghost tour. Down the stairs from the gallery:
//   the cells:  chains, the rack, an iron maiden (props); the PA's story of the dungeon and of the chamber ahead (and
//               Sal, who built it); a few of the cast (everything he's met, mixed) and a couple of bats.
//   THE CHAMBER OF THE DESCENDING CEILING (Silent Hill 3's spiked ceiling, only here it really hurts): in, and both
//               doors slam; the spiked ceiling grinds down. The way out is shut till the lever's pulled, and the lever
//               is up on the wall, two ledges up (the ceiling coming down to meet him up there). Pulled, the far door
//               grinds up, and it's a run for it under the spikes (low by then: duck, or slide). The spikes hurt (a
//               new hurt: voiced callouts); all the way down, they kill (skewered: his own death, dungeon/death.ts).
//               Out, it slams down behind him, comes back up and jams, low (the way back stays open: under it).
//   then the rope walk, and up the stairs at the far end to the ELEVATOR TO HELL's loading bay (the tower section).
// Checkpoints: the dungeon's start, the chamber's door (a quick retry), and past it.
//
// Indoors (no time of day): torchlight of its own.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, solid, ledge, meatheadSays, getSpooky, spookyState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { setUi } from '../../store';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { spawnStaff } from '../castle/staff';
import { hazardVictims, hazardKill, setHazardZones } from '../../hazardHit';
import { paStory, paQuip, paBusy, byPants, pick, drawPaWords, paSaying } from '../castle/pa';
import { drawPaHorn } from '../castle/horn';
import { INK, box, pole, rampOf, checker, hazeBands, bandedGradient, hash, put, plaque, blockFill, plateFill, spikeDown, torch, chain, stoneLedge, flagFloor, paintCell, paintRack, paintMaiden, paintCrate, STONE, IRON, STEEL, BLOOD } from './paint';
import { skewer, skewerRise, SKEWERED } from './death';
import * as L from './lines';
import { CELLS, STAIR_TOP, stairRuns, buildStairs, runStairs, drawStairs, stairsLighting, resetStairs, initStairs } from './stairs';
import { floorRuns, buildRopes, runRopes, drawRopeWalk, ropeRow } from './ropes';

registerHurtLines('spooky_ceiling', L.HURT_CEILING, L.DEATH_CEILING);

const { x0, x1 } = SECTIONS.dungeon;
/** (the cells and everything after them: from the foot of the stairs) */
const X = (dx: number) => CELLS + dx;
/** The chamber: its walls (the doors in them), the ceiling's spikes at the top (their tips), how fast it comes down. */
const RA = X(1400), RB = X(3400), TIP0 = GY - 470, CEIL_WAIT = 30;
/** Down for good: the spikes driven into the floor (the chamber's a solid block of it after; no way back through). */
const CRUSHED = GY + 30;
/** The ceiling comes down in three sections, each at its own pace (px a frame): the first steady, the middle one fast
 *  (hazard-striped: over the pit), the last slower. The lever pulled, every one of them faster still. Solid above the
 *  spikes (each a block down to its spikes, side by side: no squeezing up between them, no getting on top). */
const SECTS = [{ a: RA, b: RA + 700, v: 1.0 }, { a: RA + 700, b: RA + 1400, v: 1.3 }, { a: RA + 1400, b: RB, v: 0.8 }];
/** The crate in the last section: up on it to the second lever (over it, on the wall). x, w, h. */
const CRATES: [number, number, number][] = [[RA + 1540, 90, 70]];
const LEVER_B = { x: RA + 1585, y: GY - 120 };
/** Pulled, the lever lets the door go and the counterweight with it: the ceiling lurches and comes down faster (a quick
 *  pull gets him out with room to stand; a slow one, ducking or sliding the last of it; too slow, skewered). */
const FAST = 1.2, LURCH = 6;
/** Before the pull, the sections never come down past these (the first two over his head stood up; the last over his
 *  head stood on the crate): the pressure's on, but the lever's never out of reach and nothing kills him for being
 *  slow to it. */
const CAP = [GY - 70, GY - 70, GY - 70 - 64 - 20];
/** The pull: how long it takes (frames: he's at it, out of his hands), and how much time to spare a clean dash to the
 *  door gets after it (frames: the ceiling's set going at whatever pace makes it so, however long he took). */
const PULL = 36, SPARE = 42;
/** The lever's swing (radians, about its pivot): up at the start (a touch to the left), hauled down to the right, near
 *  past level; the grip on its handle (from the pivot, up it), and where he stands to haul on it (his middle, from the pivot). */
const LEV0 = -0.2, LEV1 = 2.0, GRIP = 39, STAND = 12;
/** The pull's beats (of it, 0..1): reaching up and taking hold (the lever not moving yet), the haul (heavy to start,
 *  coming faster), down against its stop with a jolt at BOTTOM. */
const REACH = 0.2, BOTTOM = 0.85;
/** How far down the lever is (0..1), and how far it's knocked back up off its stop, `t` through the pull. */
const leverK = (t: number) => t <= REACH ? 0 : t >= BOTTOM ? 1 : ((t - REACH) / (BOTTOM - REACH)) ** 1.7;
/** The lever's angle, as it's drawn: down (pulled, or the room done), or partway through the pull (shaking as he strains). */
const leverAng = (dg: Dungeon) => {
  if (dg.levB || dg.room === 'escaped' || dg.room === 'jammed') return LEV1;
  if (dg.pulling <= 0) return LEV0;
  const t = dg.pulling / PULL, j = t > BOTTOM ? (t - BOTTOM) / (1 - BOTTOM) : 0;
  return LEV0 + (LEV1 - LEV0) * leverK(t) + (t > REACH && t < BOTTOM ? Math.sin(dg.pulling * 1.3) * 0.03 : 0) - Math.sin(Math.PI * j) * 0.12 * (1 - j);
};
/** Two ledges by the way in (somewhere up out of the way of the first section, a while). */
const RLEDGES: [number, number, number][] = [[RA + 130, GY - 120, 140], [RA + 310, GY - 240, 150]];
/** The cells' ledges (chains hung off the wall), and who's in them. */
const CLEDGES: [number, number, number][] = [[X(560), GY - 140, 170], [X(860), GY - 230, 170]];
const CAST: ['igor' | 'skeleton' | 'knight' | 'bride' | 'bat', number, number][] = [
  ['igor', X(720), GY], ['skeleton', X(980), GY], ['bride', X(1060), GY], ['bat', X(700), GY - 330], ['bat', X(1000), GY - 360],
];
const HORNS: [number, number][] = [[SECTIONS.dungeon.x0 + 420, STAIR_TOP - 60], [SECTIONS.dungeon.x0 + 1250, STAIR_TOP + 320], [X(420), GY - 350], [X(1060), GY - 350], [RA + 900, GY - 340], [RA + 1700, GY - 340], [X(3600), GY - 350]];
const CEIL_TOP = GY - 900;

interface Dungeon {
  init: boolean;
  room: 'idle' | 'armed' | 'down' | 'escaped' | 'jammed';
  t: number; tip: number; vy: number; tips: number[];
  levB: boolean; lever: boolean; leverT: number; door: number; pulling: number; v3: number;
  entry: Block | null; exit: Block | null; slabs: Block[];
  toldIn: boolean; taunted: boolean;
}
const dungeonOf = (state: GameState) => spookyState<Dungeon>(state, 'dungeon', () => ({
  init: false, room: 'idle', t: 0, tip: TIP0, vy: 0, tips: SECTS.map(() => TIP0), levB: false, lever: false, leverT: 0, door: 0, pulling: 0, v3: 0, entry: null, exit: null, slabs: [], toldIn: false, taunted: false,
}));
/** Heard the dungeon's story already (kept across his deaths; fresh from the start of the land). */
let toldDungeon = false;

const pBoxTop = (state: GameState) => { const p = state.player; return p.pos.y + (p.isDucking || p.isSliding ? 28 : 0); };
const inRoom = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2; return cx > RA && cx < RB; };
const DOOR_H = 300;
/** The spikes' tips over x (its section's; outside the chamber, the lot together). */
let upHeld = false;
/** Stood on the crate, under the lever. */
const atLever = (cx: number, feet: number) => Math.abs(cx - LEVER_B.x) < 55 && Math.abs(feet - (GY - CRATES[0][2])) < 4;
const tipAt = (dg: Dungeon, x: number) => { if (dg.room !== 'down') return dg.tip; const i = SECTS.findIndex(q => x >= q.a && x < q.b); return i < 0 ? dg.tip : dg.tips[i]; };
/**
 * His pose at the lever (Player.leverPull): reaching up and taking hold of the handle, hauling it down (sinking,
 * braced, straining), the jolt as it hits its stop, then letting go of it (a moment after, unless he's off first). His
 * hands go on the handle wherever it is; hurt or dead, he's let go of it.
 */
const leverPose = (state: GameState, dg: Dungeon) => {
  const p = state.player;
  const a = leverAng(dg), gx = LEVER_B.x + Math.sin(a) * GRIP, gy = LEVER_B.y + 4 - Math.cos(a) * GRIP;
  if (dg.pulling > 0) {
    const t = dg.pulling / PULL, r = Math.min(1, t / REACH), j = t > BOTTOM ? (t - BOTTOM) / (1 - BOTTOM) : 0;
    // (stepped under it as he reaches up)
    const cx = p.pos.x + p.width / 2;
    p.pos.x += (LEVER_B.x + STAND - cx) * 0.35;
    p.leverPull = { gx, gy, ang: a, hold: r * r * (3 - 2 * r), load: t <= REACH ? 0 : t >= BOTTOM ? 1 : Math.min(1, (t - REACH) / (BOTTOM - REACH) * 1.6), jolt: j > 0 ? Math.sin(Math.PI * Math.min(1, j * 1.4)) : 0, lean: 1 };
    return;
  }
  const lp = p.leverPull;
  if (!lp) return;
  // (letting go: his hands come down off it, he straightens up; moving off, jumping or hurt, it's over now)
  if (p.health <= 0 || p.pushbackTimer > 0 || !p.isGrounded || Math.abs(p.vel.x) > 0.5 || lp.hold <= 0) { p.leverPull = undefined; return; }
  lp.gx = gx; lp.gy = gy; lp.ang = a; lp.hold = Math.max(0, lp.hold - 1 / 10); lp.load *= 0.75; lp.jolt = 0;
};
const pull = (state: GameState, dg: Dungeon, x: number) => {
  playSound('clang', 1, -4); playSound('rumble', 0.9, -2); playSound('crash', 0.6, -10);
  // (each lever pulled: the ceiling lurches down, sparks off the chains)
  dg.tips = dg.tips.map(t => t + LURCH); shakeScreen(state, 10, 5);
  for (let k = 0; k < 14; k++) state.particles.push({ pos: { x, y: GY - 260 }, vel: { x: (Math.random() - 0.5) * 6, y: Math.random() * 3 }, life: 24, color: '#FDE047', size: 2 });
  dg.lever = dg.levB;
  if (!paBusy(state)) meatheadSays(state, pick(L.MH_LEVER));
};
const openDoor = (b: Block | null) => { if (b) b.y = -99999; };
const shutDoor = (b: Block | null) => { if (b) b.y = GY - DOOR_H; };

/** The ceiling's blocks: solid from the roof down to each section's spikes. */
const setSlabs = (dg: Dungeon) => dg.slabs.forEach((b, i) => { const tip = dg.room === 'down' ? dg.tips[i] : dg.tip; b.y = CEIL_TOP - 60; b.h = Math.max(1, tip - 30 - b.y); });
const run = (ctx: FrameContext, dg: Dungeon) => {
  setSlabs(dg);
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  // The story, in through the dungeon door
  runStairs(ctx);
  // (the chamber, while its ceiling's coming down: nobody goes in there of their own accord)
  setHazardZones(state, 'dungeon-ceiling', dg.room === 'armed' || dg.room === 'down' ? [{ x0: RA, x1: RB, y0: CEIL_TOP, y1: GY }] : []);
  // The story (at the foot of the stairs, in the cells)
  if (!toldDungeon && cx > X(200) && p.isGrounded) { toldDungeon = true; paStory(state, byPants(state, L.PA_DUNGEON), pick(L.MH_DUNGEON)); }
  switch (dg.room) {
    case 'idle':
      if (cx > RA + 170 && p.health > 0) {
        dg.room = 'armed'; dg.t = 0;
        shutDoor(dg.entry); shutDoor(dg.exit);
        playSound('slam', 1, -8); playSound('clang', 0.8, -10); shakeScreen(state, 8, 4);
        paStory(state, [byPants(state, L.PA_CEILING)[0]], pick(L.MH_CEILING));
      }
      break;
    case 'armed':
      // (the tell: dust sifting down off it, the chains taking up the slack)
      if (dg.t % 5 === 0) state.particles.push({ pos: { x: RA + Math.random() * (RB - RA), y: dg.tip - 20 }, vel: { x: 0, y: 1.5 }, life: 80, color: '#A8A29E', size: 2 + Math.random() * 2, grav: 0.05 });
      if (dg.t === 20) playSound('clang', 0.6, -12);
      if (++dg.t > CEIL_WAIT) { dg.room = 'down'; dg.t = 0; playSound('rumble', 1, -8); shakeScreen(state, 5, 3); }
      break;
    case 'down': {
      dg.t++;
      // (pulled: the counterweight takes it, the last section at the pace that makes it a close thing; before, each
      // section no lower than its cap)
      if (dg.lever) dg.leverT++;
      SECTS.forEach((q, i) => { dg.tips[i] = dg.lever ? dg.tips[i] + (i === 2 ? dg.v3 : q.v * FAST) : Math.min(CAP[i], dg.tips[i] + q.v); if (dg.t % (i === 1 ? 3 : 5) === 0) state.particles.push({ pos: { x: q.a + Math.random() * (q.b - q.a), y: dg.tips[i] - 20 }, vel: { x: 0, y: 1.5 }, life: 60, color: '#A8A29E', size: 2, grav: 0.05 }); });
      dg.tip = Math.max(...dg.tips);
      if (dg.t % 20 === 0) { playSound('grind', 0.35, -10); shakeScreen(state, 2, 1); }
      if (dg.t === 200 && !dg.taunted) { dg.taunted = true; paQuip(state, byPants(state, L.PA_CEILING)[1 + Math.floor(Math.random() * 2)]); }
      // The lever, on the wall over the crate at the far end: stood up on the crate under it, up and he takes hold of
      // it, and hauls it down (a moment, out of his hands); let go, the door's going up, and so's the pace of the
      // ceiling: set so a clean dash to the door makes it with a little to spare, however long he took to get here
      const feet0 = p.pos.y + p.height, at = !dg.levB && dg.pulling === 0 && p.isGrounded && atLever(cx, feet0);
      setUi({ upPrompt: at ? 'PULL THE LEVER' : null });
      if (at && upHeld) { dg.pulling = 1; playSound('clang', 0.5, 4); }
      if (dg.pulling > 0 && ++dg.pulling > PULL) {
        dg.pulling = 0; dg.levB = true; pull(state, dg, LEVER_B.x);
        const dash = (RB + 30 - cx) / 4.2 + 10, room = (GY - 64) - (dg.tips[2] + LURCH);
        dg.v3 = Math.max(0.5, room / (dash + SPARE));
      }
      if (dg.lever && dg.door < 1) { dg.door = Math.min(1, dg.door + 1 / 60); if (dg.door >= 1) openDoor(dg.exit); }
      // The spikes on him (his section's): hurt, and shoved down under them; all the way down, skewered
      const tip = tipAt(dg, cx);
      skewer.tip = tip;
      if (inRoom(state) && p.health > 0) {
        const top0 = pBoxTop(state), feet = p.pos.y + p.height;
        // (all the way down, or down on him where he's stood up on something: no room left for him)
        if (tip >= GY - 30 || (p.isGrounded && feet < GY - 10 && tip > feet - 24)) hurtPlayer(ctx, 9999, 'spooky_ceiling');
        else if (top0 < tip) {
          // (the spikes in the top of his head: it hurts (duck under them!); up in the air, he's knocked down off them)
          if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 12, 'spooky_ceiling', { x: 0, y: 3 });
          if (!p.isGrounded) { p.pos.y += tip - top0; if (p.vel.y < 1) p.vel.y = 1; }
        }
      }
      // (and anybody else under there)
      for (const e of hazardVictims(state)) if (e.pos.x + e.width > RA && e.pos.x < RB && e.pos.y < tipAt(dg, e.pos.x + e.width / 2)) hazardKill(ctx, e, e.pos.x + e.width / 2, 'SKEWERED!', { fling: { x: 0, y: 4 }, sound: 'splat' });
      // Out the far door: it slams down behind him
      if (dg.lever && cx > RB + 30) {
        dg.room = 'escaped'; dg.t = 0; dg.vy = 0;
        // (out: it's past, for good. Dying from here, he's back out past it (it's down, jammed: no way back through it
        // to its door), not at its door)
        state.checkpoint = Math.max(state.checkpoint, 23);
        paStory(state, [pick(byPants(state, L.PA_ESCAPED))], pick(L.MH_ESCAPED));
      }
      break;
    }
    case 'escaped':
      // (down it comes behind him, all the way into the floor, BOOM; and it stays there: no way back through)
      dg.t++;
      dg.vy += 1.2; dg.tip = Math.min(CRUSHED, dg.tip + dg.vy);
      if (dg.tip >= CRUSHED) { dg.room = 'jammed'; playSound('crash', 1, -10); playSound('boom', 0.6, -8); shakeScreen(state, 16, 8); for (let k = 0; k < 24; k++) state.particles.push({ pos: { x: RB - 40 - Math.random() * 300, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 50, color: '#A8A29E', size: 4 + Math.random() * 4 }); }
      break;
    case 'jammed':
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the final pass: peak SNES; paint.ts)

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;
/** The walls are painted in tiles this wide (stamped), from the foot of the stairs. */
const DTW = 400;
/** The chamber's buttresses (room x). */
const BUTTRESS = (x: number) => (x - RA - 120) % 240 === 0;

/** One tile of the dungeon's wall (its origin at (tx, GY)): dressed stone, damp, mossy; the chamber's darker, stained,
 *  scratched with tallies; a vault of shadow up under the roof. */
const paintDungeonWall = (g: CanvasRenderingContext2D, tx: number) => {
  const top = CEIL_TOP - GY;
  for (const [a, b, col] of [[tx, Math.min(tx + DTW, RA), '#4A443E'], [Math.max(tx, RA), Math.min(tx + DTW, RB), '#3A3634'], [Math.max(tx, RB), tx + DTW, '#4A443E']] as const) {
    if (b <= a) continue;
    g.fillStyle = blockFill(g, col, col); g.fillRect(a - tx, top, b - a, -top);
  }
  // (damp running down it, moss in the joints, a crack or two)
  for (let k = 0; k < 6; k++) {
    const s = hash(tx * 0.013 + k * 3.7), x = Math.floor(s * (DTW - 30));
    if (s < 0.5) { for (let j = 0; j < 5; j++) checker(g, x + j * 2, -420 + Math.floor(hash(tx + k) * 200), 4, 60 + j * 20, 'rgba(10, 14, 12, 0.35)'); }
    else box(g, x, -80 - Math.floor(hash(k + tx * 0.7) * 300), 22, 4, s < 0.75 ? '#2E3A22' : '#1E2618');
  }
  for (let k = 0; k < 2; k++) {
    const x = 40 + Math.floor(hash(tx * 0.02 + k * 9.1) * 300), y = -500 + Math.floor(hash(tx * 0.031 + k) * 340);
    g.fillStyle = STONE[0]; for (let j = 0; j < 6; j++) g.fillRect(x + j * 4 + (j % 2) * 2, y + j * 6, 2, 7);
  }
  // (an iron ring in the wall, now and then)
  if (hash(tx * 0.007) > 0.5) { const x = 120 + Math.floor(hash(tx) * 160); box(g, x - 1, -181, 14, 14, INK); box(g, x, -180, 12, 12, IRON[2]); box(g, x + 3, -177, 6, 6, '#1A1614'); box(g, x, -180, 12, 2, IRON[4]); }
  // The chamber's own: its buttresses, the tallies scratched by whoever was in there before, a smear of old blood low down
  for (let x = Math.ceil((tx - RA - 120) / 240) * 240 + RA + 120; x < tx + DTW && x < RB; x += 240) if (x > RA && BUTTRESS(x)) {
    const lx = x - tx;
    box(g, lx - 15, top, 30, -top, INK); pole(g, lx - 14, top, 28, -top, '#4A4440');
    box(g, lx - 20, -40, 40, 40, INK); box(g, lx - 19, -39, 38, 39, STONE[2]); box(g, lx - 19, -39, 38, 3, STONE[3]);
  }
  if (tx + DTW > RA && tx < RB) {
    for (let k = 0; k < 3; k++) {
      const x = Math.max(RA, tx) - tx + 30 + k * 120;
      if (x > DTW - 40 || x + tx > RB - 40) continue;
      const y = -140 - Math.floor(hash(tx + k) * 60);
      for (let j = 0; j < 4; j++) box(g, x + j * 5, y, 2, 20, '#5E5650');
      box(g, x - 2, y + 8, 22, 2, '#5E5650');
      if (hash(tx * 3 + k) > 0.5) for (let j = 0; j < 3; j++) box(g, x + 30 + j * 5, y, 2, 20, '#5E5650');
    }
    const bx = Math.max(RA, tx) - tx + 60;
    if (bx < DTW - 60) for (let j = 0; j < 7; j++) { const h = 10 + Math.floor(hash(tx + j * 3.3) * 36); box(g, bx + j * 5, -92 + (j % 3) * 4, 3, h, j % 2 ? BLOOD[0] : BLOOD[1]); box(g, bx + j * 5, -92 + (j % 3) * 4 + h, 3, 3, BLOOD[0]); }
  }
  // (the vault up under the roof: dark, in bands)
  hazeBands(g, 0, top, DTW, 360, '#060504', 0.85, 0, 6);
  hazeBands(g, 0, -60, DTW, 60, '#060504', 0, 0.35, 3);
};

const drawDungeon = (c: CanvasRenderingContext2D, state: GameState, dg: Dungeon) => {
  const f = state.frame;
  // The walls (stamped)
  for (let i = 0, tx = CELLS; tx < x1; i++, tx += DTW) if (seen(state, tx, tx + DTW)) put(c, `dWall:${i}`, tx, GY, 0, CEIL_TOP - GY, Math.min(DTW, x1 + 200 - tx), GY - CEIL_TOP, g => paintDungeonWall(g, tx));
  // The cells: bars, chains, the rack, the iron maiden (dimmed back)
  if (seen(state, x0, RA)) {
    for (let k = 0; k < 3; k++) { const cx = X(300 + k * 340); if (seen(state, cx - 20, cx + 240)) put(c, `dCell:${k}`, cx, GY, -14, -284, 250, 286, g => paintCell(g, k)); }
    put(c, 'dRack', X(1180), GY, -12, -96, 196, 98, paintRack);
    put(c, 'dMaiden', X(560), GY, -44, -214, 136, 216, paintMaiden);
    // (shackles on the wall, a pair at a time)
    for (const sx of [X(540), X(1060)]) for (const d of [0, 40]) { chain(c, sx + d, GY - 330, GY - 262); box(c, sx + d - 6, GY - 263, 15, 10, INK); box(c, sx + d - 5, GY - 262, 13, 8, IRON[2]); box(c, sx + d - 2, GY - 259, 7, 4, '#1A1614'); }
    for (const [x, y, w] of CLEDGES) { chain(c, x + 10, CEIL_TOP + 40, y); chain(c, x + w - 13, CEIL_TOP + 40, y); stoneLedge(c, x, y, w); }
    plaque(c, X(560), GY - 350, 'THE DUNGEON');
  }
  // The chamber
  if (seen(state, RA - 100, RB + 100)) {
    plaque(c, RA + 640, GY - 420, 'THE CHAMBER OF THE DESCENDING CEILING', '#3A0A0A', '#FCA5A5', '#6A2A2A');
    for (const [x, y, w] of RLEDGES) stoneLedge(c, x, y, w, '#5E5A56');
    // (the lever: an iron plate on the wall, hazard-striped round its slot; the lever in it, its red knob)
    put(c, 'dLeverPlate', LEVER_B.x, LEVER_B.y, -22, -20, 44, 46, g => {
      box(g, -19, -15, 38, 38, INK);
      for (let k = 0; k < 9; k++) box(g, -18 + k * 4, -14, 4, 36, k % 2 ? '#1A1A1A' : '#CA8A04');
      box(g, -14, -10, 28, 28, IRON[2]); box(g, -14, -10, 28, 2, IRON[4]); box(g, -14, -10, 2, 28, IRON[3]); box(g, 12, -10, 2, 28, IRON[0]);
      box(g, -4, -6, 8, 20, '#0A0808');
      for (const [rx, ry] of [[-12, -8], [9, -8], [-12, 14], [9, 14]]) { box(g, rx, ry, 3, 3, IRON[4]); box(g, rx + 1, ry + 1, 2, 2, IRON[0]); }
    });
    // (his hands on its handle are his own: drawn with him, Player.leverPull)
    { c.save(); c.translate(LEVER_B.x, LEVER_B.y + 4); c.rotate(leverAng(dg));
      box(c, -4, -35, 8, 36, INK); box(c, -3, -34, 6, 34, STEEL[2]); box(c, -3, -34, 2, 34, STEEL[4]); box(c, 2, -34, 1, 34, STEEL[0]);
      box(c, -8, -44, 16, 14, INK); box(c, -7, -43, 14, 12, '#B91C1C'); box(c, -7, -43, 14, 3, '#F87171'); box(c, -5, -40, 3, 3, '#FECACA'); box(c, 3, -36, 4, 5, '#7F1D1D');
      box(c, -5, -3, 10, 8, INK); box(c, -4, -2, 8, 6, IRON[3]);
      c.restore(); }
    if (dg.room === 'down' && !dg.levB && (f >> 4) % 2) {
      plaque(c, LEVER_B.x, LEVER_B.y - 66, 'DOOR RELEASE', '#14532D', '#BBF7D0', '#3A7A4A');
      // (an arrow down at it)
      for (let k = 0; k < 4; k++) box(c, LEVER_B.x - 7 + k * 2, LEVER_B.y - 50 + k * 2, 14 - k * 4, 2, '#BBF7D0');
    }
    // (the crate, up on it to the lever)
    for (const [x, w, h] of CRATES) put(c, `dCrate:${w}:${h}`, x, GY, -4, -h - 4, w + 8, h + 6, g => paintCrate(g, w, h));
    // (over the exit door, its lamp in its cage: red, then green)
    { const go = dg.levB || dg.room === 'jammed', L = rampOf(go ? '#22C55E' : '#DC2626'), lx = RB - 19, ly = GY - DOOR_H - 64;
      box(c, lx - 1, ly - 1, 24, 24, INK); box(c, lx, ly, 22, 22, L[2]); box(c, lx, ly, 22, 4, L[4]); box(c, lx + 2, ly + 4, 6, 6, L[3]); box(c, lx, ly + 18, 22, 4, L[0]);
      for (const gx of [lx + 7, lx + 14]) box(c, gx, ly, 2, 22, INK); box(c, lx, ly + 10, 22, 2, INK); }
    // (the doors: iron slabs, banded and riveted, in their housings; down shut, or up)
    const door = (x: number, k: number) => {
      const h = DOOR_H * (1 - k);
      box(c, x - 7, GY - DOOR_H - 36, 38, 38, INK); box(c, x - 6, GY - DOOR_H - 35, 36, 36, STONE[1]); box(c, x - 6, GY - DOOR_H - 35, 36, 3, STONE[3]); box(c, x - 2, GY - DOOR_H - 8, 28, 8, '#0A0808');
      if (h <= 0) return;
      box(c, x - 1, GY - h - 1, 26, h + 1, INK);
      box(c, x, GY - h, 24, h, IRON[2]); box(c, x, GY - h, 4, h, IRON[3]); box(c, x + 20, GY - h, 4, h, IRON[0]);
      for (let y = GY - 12; y > GY - h; y -= 30) { box(c, x, y, 24, 5, IRON[1]); box(c, x, y, 24, 1, IRON[4]); box(c, x + 4, y + 2, 2, 2, IRON[4]); box(c, x + 18, y + 2, 2, 2, IRON[4]); }
      box(c, x, GY - h, 24, 3, IRON[4]);
    };
    const shut = dg.room === 'armed' || dg.room === 'down';
    door(RA - 12, shut ? 0 : 1);
    door(RB - 12, dg.room === 'down' ? dg.door : dg.room === 'armed' ? 0 : 1);
    // The ceiling, section by section: one solid iron-bound block of it from the chamber's roof down to its spikes (no
    // gap, nothing over it), the chains it hangs off, the spikes along its underside (the fast middle one
    // hazard-striped); its blocks go down with it
    const dead = state.meatheadDeath?.kind === SKEWERED && state.deathScene ? skewerRise(state.deathScene.t) : 0;
    const bloody = dg.room === 'escaped' || dg.room === 'jammed' || state.meatheadDeath?.kind === SKEWERED;
    SECTS.forEach((q, i) => {
      if (!seen(state, q.a, q.b)) return;
      const tip = (dg.room === 'down' ? dg.tips[i] : dg.tip) - dead, slab = Math.round(tip - 30), w = q.b - q.a;
      c.save(); c.translate(q.a, slab);
      c.fillStyle = plateFill(c); c.fillRect(0, CEIL_TOP - slab, w, slab - CEIL_TOP);
      box(c, 0, CEIL_TOP - slab, 3, slab - CEIL_TOP, INK); box(c, w - 3, CEIL_TOP - slab, 3, slab - CEIL_TOP, INK);
      // (its iron bands across, riveted, and the straps down it)
      for (let y = -40; y > CEIL_TOP - slab; y -= 80) { box(c, 0, y, w, 8, INK); box(c, 0, y + 1, w, 6, IRON[2]); box(c, 0, y + 1, w, 1, IRON[4]); for (let r = 12; r < w; r += 40) box(c, r, y + 3, 2, 2, IRON[4]); }
      for (let x = 40; x < w; x += 120) { box(c, x - 1, CEIL_TOP - slab, 8, slab - CEIL_TOP, INK); box(c, x, CEIL_TOP - slab, 6, slab - CEIL_TOP, IRON[1]); box(c, x, CEIL_TOP - slab, 1, slab - CEIL_TOP, IRON[3]); }
      // (the underside: a thick iron plate the spikes are set in)
      box(c, 0, -14, w, 14, INK); box(c, 0, -13, w, 12, IRON[1]); box(c, 0, -13, w, 2, IRON[3]); box(c, 0, -3, w, 2, IRON[0]);
      if (i === 1) { box(c, 0, -46, w, 24, INK); for (let x = 0; x < w; x += 20) for (let y = 0; y < 22; y += 2) box(c, x + ((y >> 1) % 10) * 2, -45 + y, 10, 2, '#CA8A04'); box(c, 0, -45, w, 1, '#FDE047'); }
      c.restore();
      if (i < SECTS.length - 1) { const t2 = (dg.room === 'down' ? Math.min(dg.tips[i], dg.tips[i + 1]) : dg.tip) - dead - 90; box(c, q.b - 11, CEIL_TOP, 22, t2 - CEIL_TOP, INK); pole(c, q.b - 10, CEIL_TOP, 20, t2 - CEIL_TOP, '#4A4440'); }
      chain(c, q.a + w * 0.25, CEIL_TOP - 200, CEIL_TOP); chain(c, q.a + w * 0.75, CEIL_TOP - 200, CEIL_TOP);
      for (let x = q.a + 6; x < q.b - 10; x += 24) {
        spikeDown(c, x, slab, 12, tip);
        if (bloody && (x - q.a) % 48 === 6) { box(c, x + 5, tip - 10, 3, 9, BLOOD[2]); box(c, x + 5, tip - 14, 2, 4, BLOOD[1]); }
      }
    });
  }
  // The corridor on, up the steps to the emergency exit
  if (seen(state, RB, x1)) {
    put(c, 'dExit', x1 - 90, GY, -140, -200, 240, 202, g => {
      for (let k = 0; k < 6; k++) { box(g, -30 + k * 10, -20 - k * 18, 70, 7, INK); box(g, -29 + k * 10, -19 - k * 18, 68, 5, STONE[2]); box(g, -29 + k * 10, -19 - k * 18, 68, 2, STONE[3]); }
      box(g, -46, -150, 92, 150, INK); box(g, -44, -148, 88, 148, STONE[2]); box(g, -44, -148, 88, 3, STONE[3]);
      box(g, -32, -136, 64, 136, '#0A0908'); bandedGradient(g, -32, -136, 64, 136, ['#060504', '#0E0C0A', '#141210'], 4);
      // (a modern convenience: the lit EMERGENCY EXIT box over it)
      box(g, -40, -176, 80, 18, INK); box(g, -39, -175, 78, 16, '#0E3A1A'); box(g, -39, -175, 78, 2, '#1E5A2A');
    });
    if (seen(state, x1 - 140, x1)) { c.save(); c.font = '6px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#062010'; c.fillText('EMERGENCY', x1 - 89, GY - 163); c.fillStyle = '#4ADE80'; c.fillText('EMERGENCY', x1 - 90, GY - 164); c.restore(); c.textAlign = 'left'; }
    plaque(c, x1 - 90, GY - 200, 'TO THE LOADING BAY', '#27272A', '#FCD34D');
  }
  // Torches
  for (let x = CELLS + 200; x < x1; x += 400) if (seen(state, x - 20, x + 20) && (x < RA || x > RB)) torch(c, x, GY - 300, f);
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (seen(state, hx - 30, hx + 60)) drawPaHorn(c, hx, hy, talking, f);
  if (seen(state, CELLS, x1 + 200)) flagFloor(c, Math.max(CELLS, state.camera.x - 40), Math.min(x1 + 200, state.camera.x + CANVAS_WIDTH + 40));
};

export const dungeon: SpookySection = {
  id: 'dungeon', x0, x1,
  checkpoints: [
    { name: 'THE DUNGEON STAIRS', cp: 20, x: x0 + 100, y: STAIR_TOP },
    { name: 'THE DUNGEON', cp: 21, x: CELLS + 120, y: GY },
    // (back for another go at it: the cells' cast cleared off its door, nobody rushing him as he comes back)
    { name: 'THE SPIKED CEILING', cp: 22, x: RA - 120, y: GY, clear: [700, 0] },
    { name: 'PAST THE SPIKED CEILING', cp: 23, x: RB + 140, y: GY },
  ],
  build: (state) => {
    if (state.checkpoint < 10) toldDungeon = false;
    resetStairs(state);
    layOwn(state, [...stairRuns(), ...floorRuns(CELLS, x1 + 200)]);
    buildRopes(state);
    buildStairs(state);
    endWalls(state, 'dungeon');
    solid(state, CELLS, CEIL_TOP - 60, x1 - CELLS + 200, 60, { hidden: true, tag: 'dungeon-ceiling' });
    for (const [x, y, w] of [...CLEDGES, ...RLEDGES]) ledge(state, x, y, w, { hidden: true, tag: 'dungeon-ledge' });
    for (const [x, w, h] of CRATES) solid(state, x, GY - h, w, h, { hidden: true, tag: 'dungeon-crate' });
    // (a bat at the chamber's door, one past its far door: nobody starts out in there, under that ceiling)
    spawnStaff(state, 'bat', RA - 300, GY - 250, 81); spawnStaff(state, 'bat', RB + 320, GY - 280, 82);
    const dg = dungeonOf(state);
    dg.entry = solid(state, RA - 12, -99999, 24, DOOR_H, { hidden: true, tag: 'dungeon-door' });
    dg.exit = solid(state, RB - 12, -99999, 24, DOOR_H, { hidden: true, tag: 'dungeon-door' });
    dg.slabs = SECTS.map(q => solid(state, q.a, CEIL_TOP - 60, q.b - q.a, TIP0 - 30 - (CEIL_TOP - 60), { hidden: true, tag: 'dungeon-ceiling-slab' }));
    for (const [kind, x, y] of CAST) spawnStaff(state, kind, x, y, 40 + Math.round(x) % 7);
  },
  update: (ctx, controls) => {
    const dg = dungeonOf(ctx.state);
    upHeld = !!controls.up;
    // (at the lever, hauling it down: his hands are full)
    // (hurt or killed hauling on it, he's let go of it: it springs back up)
    { const p = ctx.state.player; if (dg.pulling > 0 && (p.health <= 0 || p.pushbackTimer > 0 || (p.hurtFormTimer ?? 0) > 0)) { dg.pulling = 0; p.leverPull = undefined; } }
    if (dg.pulling > 0) { const p = ctx.state.player; p.vel.x = 0; p.facing = 1; run(ctx, dg); leverPose(ctx.state, dg); return { ...controls, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false, shoot: false }; }
    if (!dg.init) {
      // (the checkpoint's only known once the stage is built: past the chamber before, it's down and jammed, the doors
      // open; started at it, the story's been told)
      dg.init = true;
      initStairs(ctx.state);
      if (ctx.state.checkpoint >= 22) toldDungeon = true;
      if (ctx.state.checkpoint >= 23) { dg.room = 'jammed'; dg.tip = CRUSHED; dg.levB = dg.lever = true; dg.door = 1; }
    }
    // (the way on: the emergency exit; the way back: up the stairs, out at the top into the castle)
    if (runExits(ctx.state, endExits('dungeon'))) { ctx.state.player.leverPull = undefined; return controls; }
    run(ctx, dg);
    leverPose(ctx.state, dg);
    return runRopes(ctx, controls);
  },
  drawBackdrop: (c) => { bandedGradient(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#050403', '#0C0A09', '#120E0C'], 8); return true; },
  drawBack: (c, state) => { drawStairs(c, state); drawDungeon(c, state, dungeonOf(state)); drawRopeWalk(c, state); },
  cameraRow: (state) => ropeRow(state),
  drawFront: (c, state) => { if (getSpooky(state)?.section === 'dungeon') drawPaWords(c, state, HORNS); },
  lighting: (state) => {
    // (on the stairs: their own dark, deeper the further down)
    if (state.player.pos.x < CELLS - 60) return stairsLighting(state);
    const lights = [];
    for (let x = CELLS + 200; x < x1; x += 400) if (x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300 && (x < RA || x > RB)) lights.push({ x, y: GY - 300, r: 240, a: 0.8, color: 'rgba(249, 115, 22, 0.10)' });
    if (RB > state.camera.x - 200 && RA < state.camera.x + CANVAS_WIDTH + 200) lights.push(...state.enemies.filter(e => e.health > 0 && e.pos.x > RA - 100 && e.pos.x < RB + 100).map(e => ({ x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2, r: 70, a: 0.55, color: 'rgba(248, 113, 113, 0.12)' })));
    if (RB > state.camera.x - 200 && RA < state.camera.x + CANVAS_WIDTH + 200) lights.push({ x: LEVER_B.x, y: LEVER_B.y, r: 200, a: 0.7, color: 'rgba(220, 38, 38, 0.10)' }, { x: RA + 500, y: GY - 120, r: 520, a: 0.5 }, { x: RA + 1500, y: GY - 120, r: 520, a: 0.5 });
    return { dark: 0.55, shade: [18, 10, 8] as [number, number, number], lights };
  },
};
