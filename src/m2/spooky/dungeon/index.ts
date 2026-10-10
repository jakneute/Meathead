// THE DUNGEON: section 3 of Spooky Land, the last stop of the castle's ghost tour. Down the stairs from the gallery:
//   the cells:  chains, the rack, an iron maiden (props); the PA's story of the dungeon and of the chamber ahead (and
//               Sal, who built it); a few of the cast (everything he's met, mixed) and a couple of bats.
//   THE CHAMBER OF THE DESCENDING CEILING (Silent Hill 3's spiked ceiling, only here it really hurts): in, and both
//               doors slam; the spiked ceiling grinds down. The way out is shut till the lever's pulled, and the lever
//               is up on the wall, two ledges up (the ceiling coming down to meet him up there). Pulled, the far door
//               grinds up, and it's a run for it under the spikes (low by then: duck, or slide). The spikes hurt (a
//               new hurt: voiced callouts); all the way down, they kill (skewered: his own death, dungeon/death.ts).
//               Out, it slams down behind him, comes back up and jams, low (the way back stays open: under it).
//   then a stretch of corridor to the EMERGENCY EXIT: the red-mist hallway.
// Checkpoints: the dungeon's start, the chamber's door (a quick retry), and past it.
//
// Indoors (no time of day): torchlight of its own.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Block } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, endWalls, endExits, runExits, solid, ledge, wallSign, doorway, groundBox, ledgeBox, box, meatheadSays, getSpooky, spookyState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { spawnStaff } from '../castle/staff';
import { paStory, paQuip, paBusy, byPants, pick, drawHorn, drawPaWords, paSaying } from '../castle/pa';
import { skewer, skewerRise, SKEWERED } from './death';
import * as L from './lines';

registerHurtLines('spooky_ceiling', L.HURT_CEILING, L.DEATH_CEILING);

const { x0, x1 } = SECTIONS.dungeon;
const X = (dx: number) => x0 + dx;
/** The chamber: its walls (the doors in them), the ceiling's spikes at the top (their tips), how fast it comes down. */
const RA = X(1400), RB = X(2600), TIP0 = GY - 470, CEIL_V = 0.8, CEIL_WAIT = 60, JAM = GY - 210;
/** Pulled, the lever lets the door go and the counterweight with it: the ceiling lurches and comes down faster (a quick
 *  pull gets him out with room to stand; a slow one, ducking or sliding the last of it; too slow, skewered). */
const CEIL_V2 = 1.5, LURCH = 6;
/** Its two ledges up to the lever, and the lever. */
const RLEDGES: [number, number, number][] = [[RA + 130, GY - 120, 140], [RA + 310, GY - 240, 150]];
const LEVER = { x: RA + 385, y: GY - 300 };
/** The cells' ledges (chains hung off the wall), and who's in them. */
const CLEDGES: [number, number, number][] = [[X(560), GY - 140, 170], [X(860), GY - 230, 170]];
const CAST: ['igor' | 'skeleton' | 'knight' | 'bride' | 'bat', number, number][] = [
  ['igor', X(720), GY], ['skeleton', X(980), GY], ['bride', X(1200), GY], ['bat', X(700), GY - 330], ['bat', X(1000), GY - 360],
];
const HORNS: [number, number][] = [[X(420), GY - 350], [X(1060), GY - 350], [RA + 900, GY - 340], [X(2800), GY - 350]];
const CEIL_TOP = GY - 900;

interface Dungeon {
  init: boolean;
  room: 'idle' | 'armed' | 'down' | 'escaped' | 'jammed';
  t: number; tip: number; vy: number;
  lever: boolean; leverT: number; door: number;
  entry: Block | null; exit: Block | null;
  toldIn: boolean; taunted: boolean;
}
const dungeonOf = (state: GameState) => spookyState<Dungeon>(state, 'dungeon', () => ({
  init: false, room: 'idle', t: 0, tip: TIP0, vy: 0, lever: false, leverT: 0, door: 0, entry: null, exit: null, toldIn: false, taunted: false,
}));
/** Heard the dungeon's story already (kept across his deaths; fresh from the start of the land). */
let toldDungeon = false;

const pBoxTop = (state: GameState) => { const p = state.player; return p.pos.y + (p.isDucking || p.isSliding ? 28 : 0); };
const inRoom = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2; return cx > RA && cx < RB; };
const DOOR_H = 300;
const openDoor = (b: Block | null) => { if (b) b.y = -99999; };
const shutDoor = (b: Block | null) => { if (b) b.y = GY - DOOR_H; };

const run = (ctx: FrameContext, dg: Dungeon) => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  // The story, in through the dungeon door
  if (!toldDungeon && cx > X(200)) { toldDungeon = true; paStory(state, byPants(state, L.PA_DUNGEON), pick(L.MH_DUNGEON)); }
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
      // (pulled: a beat for him to get down off the ledge, then the counterweight takes it)
      if (dg.lever) dg.leverT++;
      dg.tip += dg.lever && dg.leverT > 36 ? CEIL_V2 : CEIL_V;
      if (dg.t % 4 === 0) state.particles.push({ pos: { x: RA + Math.random() * (RB - RA), y: dg.tip - 20 }, vel: { x: 0, y: 1.5 }, life: 60, color: '#A8A29E', size: 2, grav: 0.05 });
      if (dg.t % 20 === 0) { playSound('grind', 0.35, -10); shakeScreen(state, 2, 1); }
      if (dg.t === 200 && !dg.taunted) { dg.taunted = true; paQuip(state, byPants(state, L.PA_CEILING)[1 + Math.floor(Math.random() * 2)]); }
      // (the lever, up on the wall: on the ledge under it, he yanks it)
      const top = RLEDGES[1];
      if (!dg.lever && p.isGrounded && Math.abs(p.pos.y + p.height - top[1]) < 3 && cx > top[0] + 30 && cx < top[0] + top[2]) {
        dg.lever = true; playSound('clang', 1, -4); playSound('rumble', 0.9, -2); playSound('crash', 0.6, -10);
        // (the counterweight goes: the ceiling lurches down, sparks off the chains)
        dg.tip += LURCH; shakeScreen(state, 10, 5);
        for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: k % 2 ? RA + 200 : RB - 200, y: dg.tip - 120 }, vel: { x: (Math.random() - 0.5) * 6, y: Math.random() * 3 }, life: 24, color: '#FDE047', size: 2 });
        if (!paBusy(state)) meatheadSays(state, pick(L.MH_LEVER));
      }
      if (dg.lever && dg.door < 1) { dg.door = Math.min(1, dg.door + 1 / 70); if (dg.door >= 1) openDoor(dg.exit); }
      // The spikes on him: hurt, and shoved down under them; all the way down, skewered
      skewer.tip = dg.tip;
      if (inRoom(state) && p.health > 0) {
        const top0 = pBoxTop(state), feet = p.pos.y + p.height;
        // (all the way down, or down on him where he's stood on a ledge: no room left for him)
        if (dg.tip >= GY - 30 || (p.isGrounded && feet < GY - 10 && dg.tip > feet - 24)) hurtPlayer(ctx, 9999, 'spooky_ceiling');
        else if (top0 < dg.tip) {
          // (the spikes in the top of his head: it hurts (duck under them!); up in the air, he's knocked down off them)
          if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 12, 'spooky_ceiling', { x: 0, y: 3 });
          if (!p.isGrounded) { p.pos.y += dg.tip - top0; if (p.vel.y < 1) p.vel.y = 1; }
        }
      }
      // (and anybody else under there)
      for (const e of state.enemies) if (e.health > 0 && e.pos.x + e.width > RA && e.pos.x < RB && e.pos.y < dg.tip && !e.isBlownAway) { e.health = 0; e.isBlownAway = true; ctx.fx.spawnDeathShower({ x: e.pos.x + e.width / 2, y: e.pos.y + 10 }, 0, 3); playSound('splat', 1, -4); }
      // Out the far door: it slams down behind him
      if (dg.lever && cx > RB + 30) {
        dg.room = 'escaped'; dg.t = 0; dg.vy = 0;
        paStory(state, [pick(byPants(state, L.PA_ESCAPED))], pick(L.MH_ESCAPED));
      }
      break;
    }
    case 'escaped':
      // (down it comes, all the way, BOOM; then it creaks back up and jams, low)
      dg.t++;
      if (dg.vy >= 0 && dg.tip < GY - 6) { dg.vy += 1.2; dg.tip = Math.min(GY - 6, dg.tip + dg.vy); if (dg.tip >= GY - 6) { playSound('crash', 1, -10); playSound('boom', 0.6, -8); shakeScreen(state, 16, 8); dg.vy = -1; } }
      else if (dg.tip > JAM) { dg.tip -= 1.4; if (dg.tip <= JAM) { dg.tip = JAM; dg.room = 'jammed'; openDoor(dg.entry); playSound('clang', 0.9, -6); } }
      break;
    case 'jammed':
      // (stuck: a spark off the chain now and then)
      if (state.frame % 50 === 0 && Math.abs(cx - (RA + RB) / 2) < 900) for (let k = 0; k < 5; k++) state.particles.push({ pos: { x: RA + 40, y: CEIL_TOP + 120 }, vel: { x: Math.random() * 3, y: Math.random() * 2 }, life: 18, color: '#FDE047', size: 2 });
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + CANVAS_WIDTH + 100;
/** The ceiling's tips as drawn (going back up with him on it, if it's got him). */
const tipNow = (state: GameState, dg: Dungeon) => {
  const d = state.meatheadDeath;
  return d && d.kind === SKEWERED && state.deathScene ? (d.floor ?? dg.tip) - skewerRise(state.deathScene.t) : dg.tip;
};

const drawDungeon = (c: CanvasRenderingContext2D, state: GameState, dg: Dungeon) => {
  const f = state.frame;
  // Stone walls, block by block
  box(c, x0, CEIL_TOP, x1 - x0, GY - CEIL_TOP, '#26221F');
  for (let y = CEIL_TOP; y < GY; y += 40) for (let x = x0 + ((y / 40) % 2 ? 0 : 40); x < x1; x += 80) if (seen(state, x, x + 80)) box(c, x, y, 76, 36, (x + y) % 3 ? '#2E2925' : '#332D28');
  // The cells: bars, chains, the rack, the iron maiden (dimmed back)
  if (seen(state, x0, RA)) {
    for (let k = 0; k < 3; k++) { const cx = X(300 + k * 340); box(c, cx, GY - 260, 220, 260, '#151210'); for (let b = 0; b < 9; b++) box(c, cx + 8 + b * 24, GY - 260, 5, 260, '#4A4440'); box(c, cx, GY - 266, 220, 8, '#57524C'); }
    // (the rack: a wooden frame, a roller at each end with its crank, the ropes and the cuffs; a skeleton prop on it)
    { const rx = X(1180); box(c, rx, GY - 62, 170, 14, '#5A3A20'); for (const lx of [rx + 4, rx + 152]) box(c, lx, GY - 48, 14, 48, '#4A2A16');
      for (const ex of [rx - 6, rx + 162]) { box(c, ex, GY - 70, 14, 30, '#3A2416'); box(c, ex + 4, GY - 86, 4, 18, '#71717A'); box(c, ex - 4, GY - 88, 12, 4, '#71717A'); }
      box(c, rx + 30, GY - 70, 110, 6, '#E7E2D6'); box(c, rx + 22, GY - 74, 14, 12, '#E7E2D6'); box(c, rx + 25, GY - 71, 3, 3, '#1A0A04'); box(c, rx + 30, GY - 71, 3, 3, '#1A0A04');
      box(c, rx + 8, GY - 67, 22, 2, '#A8A29E'); box(c, rx + 140, GY - 67, 22, 2, '#A8A29E'); }
    // (the iron maiden: a coffin stood on end with a face on its lid, the lid hung open, the spikes inside)
    { const mx = X(195); c.fillStyle = '#1A1A1E'; c.beginPath(); c.moveTo(mx - 34, GY); c.lineTo(mx - 40, GY - 140); c.lineTo(mx - 24, GY - 210); c.lineTo(mx + 24, GY - 210); c.lineTo(mx + 40, GY - 140); c.lineTo(mx + 34, GY); c.closePath(); c.fill();
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
    // (the lever: up, or yanked down)
    box(c, LEVER.x - 14, LEVER.y - 10, 28, 30, '#3F3F46');
    c.save(); c.translate(LEVER.x, LEVER.y + 4); c.rotate(dg.lever || dg.room === 'escaped' || dg.room === 'jammed' ? 0.9 : -0.9);
    box(c, -3, -34, 6, 34, '#A1A1AA'); box(c, -7, -42, 14, 12, '#B91C1C'); c.restore();
    if (!dg.lever && dg.room === 'down' && (f >> 4) % 2) wallSign(c, LEVER.x, LEVER.y - 60, 'DOOR RELEASE', '#14532D', '#BBF7D0');
    // (the doors: iron, down shut, or up)
    const door = (x: number, k: number) => { const h = DOOR_H * (1 - k); box(c, x, GY - DOOR_H - 30, 24, 30, '#18181B'); if (h > 0) { box(c, x, GY - h, 24, h, '#52525B'); for (let y = GY - h + 10; y < GY; y += 30) box(c, x, y, 24, 4, '#3F3F46'); } };
    const shut = dg.room === 'armed' || dg.room === 'down';
    door(RA - 12, shut ? 0 : 1);
    door(RB - 12, dg.room === 'down' ? dg.door : dg.room === 'armed' ? 0 : 1);
    // The ceiling: the slab, its chains up into the dark, the spikes along its underside
    const tip = tipNow(state, dg), slab = tip - 30;
    for (const cx of [RA + 200, RB - 200]) box(c, cx, CEIL_TOP, 6, slab - 60 - CEIL_TOP, '#57534E');
    box(c, RA, slab - 60, RB - RA, 60, '#44403C'); box(c, RA, slab - 60, RB - RA, 6, '#57534E'); box(c, RA, slab - 8, RB - RA, 8, '#292524');
    c.fillStyle = '#A8A29E';
    c.beginPath();
    for (let x = RA + 6; x < RB - 10; x += 24) { c.moveTo(x, slab); c.lineTo(x + 12, slab); c.lineTo(x + 6, tip); }
    c.fill();
    c.fillStyle = '#E7E5E4'; for (let x = RA + 6; x < RB - 10; x += 24) c.fillRect(x + 2, slab, 2, 14);
    // (rust, and worse, on the tips once it's had somebody)
    if (dg.room === 'escaped' || dg.room === 'jammed' || state.meatheadDeath?.kind === SKEWERED) { c.fillStyle = '#7F1D1D'; for (let x = RA + 6; x < RB - 10; x += 48) c.fillRect(x + 5, tip - 8, 3, 8); }
  }
  // The corridor on, the emergency exit
  if (seen(state, RB, x1)) {
    box(c, RB + 340, GY - 220, 4, 220, '#3F3F46');
    doorway(c, x1 - 90, GY, 'EMERGENCY EXIT', '#7F1D1D', '#0A0404');
  }
  if (seen(state, x0, x0 + 200)) doorway(c, x0 + 80, GY, 'UP TO THE CASTLE', '#3F3F46', '#050505');
  // Torches
  for (let x = x0 + 200; x < x1; x += 400) if (seen(state, x - 20, x + 20) && (x < RA || x > RB)) { box(c, x - 3, GY - 300, 6, 24, '#57534E'); box(c, x - 6, GY - 316 - ((f + x) % 7 < 3 ? 2 : 0), 12, 16, '#F97316'); box(c, x - 3, GY - 310, 6, 8, '#FDE047'); }
  const talking = !!paSaying(state);
  for (const [hx, hy] of HORNS) if (seen(state, hx - 30, hx + 30)) drawHorn(c, hx, hy, talking, f);
  groundBox(c, x0 - 200, x1 + 200, GY, '#3F3A36', '#A8A29E');
};

export const dungeon: SpookySection = {
  id: 'dungeon', x0, x1,
  checkpoints: [
    { name: 'THE DUNGEON', cp: 20, x: x0 + 200, y: GY },
    { name: 'THE SPIKED CEILING', cp: 21, x: RA - 120, y: GY },
    { name: 'PAST THE SPIKED CEILING', cp: 22, x: RB + 140, y: GY },
  ],
  build: (state) => {
    if (state.checkpoint < 10) toldDungeon = false;
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'dungeon');
    solid(state, x0 - 200, CEIL_TOP - 60, x1 - x0 + 400, 60, { hidden: true, tag: 'dungeon-ceiling' });
    for (const [x, y, w] of [...CLEDGES, ...RLEDGES]) ledge(state, x, y, w, { hidden: true, tag: 'dungeon-ledge' });
    const dg = dungeonOf(state);
    dg.entry = solid(state, RA - 12, -99999, 24, DOOR_H, { hidden: true, tag: 'dungeon-door' });
    dg.exit = solid(state, RB - 12, -99999, 24, DOOR_H, { hidden: true, tag: 'dungeon-door' });
    for (const [kind, x, y] of CAST) spawnStaff(state, kind, x, y, 40 + Math.round(x) % 7);
  },
  update: (ctx, controls) => {
    const dg = dungeonOf(ctx.state);
    if (!dg.init) {
      // (the checkpoint's only known once the stage is built: past the chamber before, it's down and jammed, the doors
      // open; started at it, the story's been told)
      dg.init = true;
      if (ctx.state.checkpoint >= 21) toldDungeon = true;
      if (ctx.state.checkpoint >= 22) { dg.room = 'jammed'; dg.tip = JAM; dg.lever = true; dg.door = 1; }
    }
    if (runExits(ctx.state, endExits('dungeon'))) return controls;
    run(ctx, dg);
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0A09'); return true; },
  drawBack: (c, state) => drawDungeon(c, state, dungeonOf(state)),
  drawFront: (c, state) => { if (getSpooky(state)?.section === 'dungeon') drawPaWords(c, state, HORNS); },
  lighting: (state) => {
    const lights = [];
    for (let x = x0 + 200; x < x1; x += 400) if (x > state.camera.x - 300 && x < state.camera.x + CANVAS_WIDTH + 300 && (x < RA || x > RB)) lights.push({ x, y: GY - 300, r: 240, a: 0.8, color: 'rgba(249, 115, 22, 0.10)' });
    if (RB > state.camera.x - 200 && RA < state.camera.x + CANVAS_WIDTH + 200) lights.push({ x: LEVER.x, y: LEVER.y, r: 200, a: 0.7, color: 'rgba(220, 38, 38, 0.10)' }, { x: (RA + RB) / 2, y: GY - 120, r: 520, a: 0.5 });
    return { dark: 0.55, shade: [18, 10, 8] as [number, number, number], lights };
  },
};
