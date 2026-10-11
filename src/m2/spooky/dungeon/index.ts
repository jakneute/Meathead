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
import { layOwn, endWalls, endExits, runExits, solid, ledge, wallSign, doorway, groundBox, ledgeBox, box, meatheadSays, getSpooky, spookyState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { setUi } from '../../store';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { spawnStaff } from '../castle/staff';
import { hazardVictims, hazardKill, setHazardZones } from '../../hazardHit';
import { paStory, paQuip, paBusy, byPants, pick, drawHorn, drawPaWords, paSaying } from '../castle/pa';
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
const LEVER_B = { x: RA + 1585, y: GY - 130 };
/** Pulled, the lever lets the door go and the counterweight with it: the ceiling lurches and comes down faster (a quick
 *  pull gets him out with room to stand; a slow one, ducking or sliding the last of it; too slow, skewered). */
const FAST = 1.2, LURCH = 6;
/** Before the pull, the sections never come down past these (the first two over his head stood up; the last over his
 *  head stood on the crate): the pressure's on, but the lever's never out of reach and nothing kills him for being
 *  slow to it. */
const CAP = [GY - 70, GY - 70, GY - 70 - 64 - 20];
/** The pull: how long it takes (frames: he's at it, out of his hands), and how much time to spare a clean dash to the
 *  door gets after it (frames: the ceiling's set going at whatever pace makes it so, however long he took). */
const PULL = 30, SPARE = 42;
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
// Drawing (crude)

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;

const drawDungeon = (c: CanvasRenderingContext2D, state: GameState, dg: Dungeon) => {
  const f = state.frame;
  // Stone walls, block by block
  box(c, CELLS, CEIL_TOP, x1 - CELLS, GY - CEIL_TOP, '#26221F');
  for (let y = CEIL_TOP; y < GY; y += 40) for (let x = CELLS + ((y / 40) % 2 ? 0 : 40); x < x1; x += 80) if (seen(state, x, x + 80)) box(c, x, y, 76, 36, (x + y) % 3 ? '#2E2925' : '#332D28');
  // The cells: bars, chains, the rack, the iron maiden (dimmed back)
  if (seen(state, x0, RA)) {
    for (let k = 0; k < 3; k++) { const cx = X(300 + k * 340); box(c, cx, GY - 260, 220, 260, '#151210'); for (let b = 0; b < 9; b++) box(c, cx + 8 + b * 24, GY - 260, 5, 260, '#4A4440'); box(c, cx, GY - 266, 220, 8, '#57524C'); }
    // (the rack: a wooden frame, a roller at each end with its crank, the ropes and the cuffs; a skeleton prop on it)
    { const rx = X(1180); box(c, rx, GY - 62, 170, 14, '#5A3A20'); for (const lx of [rx + 4, rx + 152]) box(c, lx, GY - 48, 14, 48, '#4A2A16');
      for (const ex of [rx - 6, rx + 162]) { box(c, ex, GY - 70, 14, 30, '#3A2416'); box(c, ex + 4, GY - 86, 4, 18, '#71717A'); box(c, ex - 4, GY - 88, 12, 4, '#71717A'); }
      box(c, rx + 30, GY - 70, 110, 6, '#E7E2D6'); box(c, rx + 22, GY - 74, 14, 12, '#E7E2D6'); box(c, rx + 25, GY - 71, 3, 3, '#1A0A04'); box(c, rx + 30, GY - 71, 3, 3, '#1A0A04');
      box(c, rx + 8, GY - 67, 22, 2, '#A8A29E'); box(c, rx + 140, GY - 67, 22, 2, '#A8A29E'); }
    // (the iron maiden: a coffin stood on end with a face on its lid, the lid hung open, the spikes inside)
    { const mx = X(578); c.fillStyle = '#1A1A1E'; c.beginPath(); c.moveTo(mx - 34, GY); c.lineTo(mx - 40, GY - 140); c.lineTo(mx - 24, GY - 210); c.lineTo(mx + 24, GY - 210); c.lineTo(mx + 40, GY - 140); c.lineTo(mx + 34, GY); c.closePath(); c.fill();
      c.fillStyle = '#52525B'; c.beginPath(); c.moveTo(mx - 28, GY - 4); c.lineTo(mx - 34, GY - 140); c.lineTo(mx - 20, GY - 204); c.lineTo(mx + 20, GY - 204); c.lineTo(mx + 34, GY - 140); c.lineTo(mx + 28, GY - 4); c.closePath(); c.fill();
      box(c, mx - 10, GY - 190, 20, 26, '#A1A1AA'); box(c, mx - 6, GY - 182, 4, 3, '#1A1A1E'); box(c, mx + 2, GY - 182, 4, 3, '#1A1A1E'); box(c, mx - 4, GY - 172, 8, 2, '#1A1A1E');
      box(c, mx + 36, GY - 200, 50, 196, '#3F3F46'); for (let k = 0; k < 7; k++) box(c, mx + 40, GY - 186 + k * 26, 14, 3, '#D4D4D8'); }
    // (shackles on the wall, a pair at a time)
    for (const sx of [X(560), X(1460 - 400)]) for (const d of [0, 40]) { box(c, sx + d, GY - 320, 3, 60, '#57534E'); box(c, sx + d - 5, GY - 262, 13, 8, '#71717A'); }
    for (const [x, y, w] of CLEDGES) { box(c, x + 10, CEIL_TOP + 40, 3, y - CEIL_TOP - 40, '#57534E'); box(c, x + w - 13, CEIL_TOP + 40, 3, y - CEIL_TOP - 40, '#57534E'); ledgeBox(c, x, y, w, '#3A2A1A', '#C08A5A'); }
    wallSign(c, X(560), GY - 330, 'THE DUNGEON', '#27272A', '#FCA5A5');
  }
  // The chamber
  if (seen(state, RA - 100, RB + 100)) {
    box(c, RA, CEIL_TOP, RB - RA, GY - CEIL_TOP, '#1C1816');
    for (let x = RA + 60; x < RB; x += 120) box(c, x, GY - 420, 8, 420, '#2A2420');
    wallSign(c, RA + 640, GY - 420, 'THE CHAMBER OF THE DESCENDING CEILING', '#3A0A0A', '#FCA5A5');
    for (const [x, y, w] of RLEDGES) ledgeBox(c, x, y, w, '#3A3A3A', '#C9C9C9');
    // (the lever, over the crate at the far end)
    box(c, LEVER_B.x - 14, LEVER_B.y - 10, 28, 30, '#3F3F46');
    { const k = dg.levB || dg.room === 'escaped' || dg.room === 'jammed' ? 1 : dg.pulling > 0 ? Math.min(1, (dg.pulling / PULL) ** 1.6) : 0;
      c.save(); c.translate(LEVER_B.x, LEVER_B.y + 4); c.rotate(-0.9 + 1.8 * k + (dg.pulling > 0 ? Math.sin(f * 1.3) * 0.04 : 0));
      box(c, -3, -34, 6, 34, '#A1A1AA'); box(c, -7, -42, 14, 12, '#B91C1C');
      // (his two fists round the handle, hauling on it)
      if (dg.pulling > 0) { box(c, -9, -46, 8, 10, '#D9A877'); box(c, 1, -46, 8, 10, '#D9A877'); box(c, -9, -46, 18, 2, '#1A0B06'); }
      c.restore(); }
    if (dg.room === 'down' && !dg.levB && (f >> 4) % 2) wallSign(c, LEVER_B.x, LEVER_B.y - 60, 'DOOR RELEASE', '#14532D', '#BBF7D0');
    // (the crates: wooden, banded, lit along the top)
    for (const [x, w, h] of CRATES) { box(c, x - 2, GY - h - 2, w + 4, h + 2, '#120A06'); box(c, x, GY - h, w, h, '#6B4423'); box(c, x + 4, GY - h + 4, w - 8, h - 8, '#7A5030'); box(c, x, GY - h + h / 2 - 3, w, 6, '#4A2C16'); box(c, x, GY - h, w, 4, '#C08A5A'); }
    // (over the exit door, its lamp: red, then green)
    box(c, RB - 17, GY - DOOR_H - 60, 18, 18, dg.levB || dg.room === 'jammed' ? '#22C55E' : '#DC2626');
    // (the doors: iron, down shut, or up)
    const door = (x: number, k: number) => { const h = DOOR_H * (1 - k); box(c, x, GY - DOOR_H - 30, 24, 30, '#18181B'); if (h > 0) { box(c, x, GY - h, 24, h, '#52525B'); for (let y = GY - h + 10; y < GY; y += 30) box(c, x, y, 24, 4, '#3F3F46'); } };
    const shut = dg.room === 'armed' || dg.room === 'down';
    door(RA - 12, shut ? 0 : 1);
    door(RB - 12, dg.room === 'down' ? dg.door : dg.room === 'armed' ? 0 : 1);
    // The ceiling: the slab, its chains up into the dark, the spikes along its underside
    // The ceiling, section by section: the slab, its chains up into the dark, the spikes along its underside (the fast
    // middle one hazard-striped)
    const dead = state.meatheadDeath?.kind === SKEWERED && state.deathScene ? skewerRise(state.deathScene.t) : 0;
    SECTS.forEach((q, i) => {
      const tip = (dg.room === 'down' ? dg.tips[i] : dg.tip) - dead, slab = tip - 30;
      // (one solid iron-bound block of it, from the chamber's roof down to its spikes: nothing over it, no gap)
      box(c, q.a, CEIL_TOP, q.b - q.a, slab - CEIL_TOP, '#3A3633');
      for (let y = slab - 40; y > CEIL_TOP; y -= 80) box(c, q.a, y, q.b - q.a, 8, '#57534E');
      for (let x = q.a + 40; x < q.b; x += 120) box(c, x, CEIL_TOP, 6, slab - CEIL_TOP, '#2A2725');
      box(c, q.a, slab - 8, q.b - q.a, 8, '#292524');
      if (i === 1) for (let x = q.a; x < q.b; x += 40) box(c, x, slab - 46, 20, 20, '#CA8A04');
      box(c, q.b - 2, slab - 60, 4, 60, '#1C1917');
      if (i < SECTS.length - 1) { const t2 = (dg.room === 'down' ? Math.min(dg.tips[i], dg.tips[i + 1]) : dg.tip) - dead - 90; box(c, q.b - 10, CEIL_TOP, 20, t2 - CEIL_TOP, '#3A3430'); box(c, q.b - 10, CEIL_TOP, 4, t2 - CEIL_TOP, '#57524C'); }
      c.fillStyle = '#A8A29E'; c.beginPath();
      for (let x = q.a + 6; x < q.b - 10; x += 24) { c.moveTo(x, slab); c.lineTo(x + 12, slab); c.lineTo(x + 6, tip); }
      c.fill();
      c.fillStyle = '#E7E5E4'; for (let x = q.a + 6; x < q.b - 10; x += 24) c.fillRect(x + 2, slab, 2, 14);
      if (dg.room === 'escaped' || dg.room === 'jammed' || state.meatheadDeath?.kind === SKEWERED) { c.fillStyle = '#7F1D1D'; for (let x = q.a + 6; x < q.b - 10; x += 48) c.fillRect(x + 5, tip - 8, 3, 8); }
    });
  }
  // The corridor on, the emergency exit
  if (seen(state, RB, x1)) {
    doorway(c, x1 - 90, GY, 'TO THE LOADING BAY', '#57534E', '#0A0A0A'); for (let k = 0; k < 6; k++) box(c, x1 - 120 + k * 10, GY - 20 - k * 18, 70, 6, '#3F3A36');
  }
  // Torches
  for (let x = CELLS + 200; x < x1; x += 400) if (seen(state, x - 20, x + 20) && (x < RA || x > RB)) { box(c, x - 3, GY - 300, 6, 24, '#57534E'); box(c, x - 6, GY - 316 - ((f + x) % 7 < 3 ? 2 : 0), 12, 16, '#F97316'); box(c, x - 3, GY - 310, 6, 8, '#FDE047'); }
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (seen(state, hx - 30, hx + 30)) drawHorn(c, hx, hy, talking, f);
  groundBox(c, CELLS, x1 + 200, GY, '#3F3A36', '#A8A29E');
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
    if (dg.pulling > 0) { const p = ctx.state.player; p.vel.x = 0; p.facing = 1; run(ctx, dg); return { ...controls, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false, shoot: false }; }
    if (!dg.init) {
      // (the checkpoint's only known once the stage is built: past the chamber before, it's down and jammed, the doors
      // open; started at it, the story's been told)
      dg.init = true;
      initStairs(ctx.state);
      if (ctx.state.checkpoint >= 22) toldDungeon = true;
      if (ctx.state.checkpoint >= 23) { dg.room = 'jammed'; dg.tip = CRUSHED; dg.levB = dg.lever = true; dg.door = 1; }
    }
    // (the way on: the emergency exit; the way back: up the stairs, out at the top into the castle)
    if (runExits(ctx.state, endExits('dungeon'))) return controls;
    run(ctx, dg);
    return runRopes(ctx, controls);
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0A09'); return true; },
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
