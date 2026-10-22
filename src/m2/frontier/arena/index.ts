// THE CATCH-UP AND TUCKER'S ARENA: section 7 of Wilderness Land, the land's boss. The user's design (frontier-spec.md,
// verbatim there): back to side view, Meathead catches up to Tucker ("YOU TOOK THEM ALL OUT?"); he's furious (he can't
// stand people cutting the line expecting a free ride; he doesn't give handouts); he crashes into a tree with a pointy
// branch that impales him through the chest (the mutilation rule: an ANIMATED, detailed close-up of it happening).
// Meathead walks up: "ARE YOU GOING TO FAKE ME OUT AGAIN?" Yep: the jumpscare. He runs off to the axe tree, man to man;
// one swing, the tree on his head, his face split to the nose: blind. Then HIS FIGHT (job G: fight.ts): a flintlock fired
// at sounds, bees, stampeding critters, the soul sucker's blood drawing the mountain lions; his two deaths (the lions'
// slow-mo kill; any other way, the grizzly).
//
//   layout.ts   where things are: the trail, the clearing, the giant oak and its branch (lined up with tucker.ts's
//               'impaled' pose), the refills, the axe tree, the fight's arena (two screens) and its boulder
//   catchup.ts  THE CATCH-UP (a cutscene, in off the chase's black): the rant, the crash, the close-up (the branch's
//               wound painter), him hung on the oak; BRANCH_MEMO
//   intro.ts    HIS ARENA INTRO: THE FAKE-OUT (walk up to the body: the line, the jumpscare; UP_MEMO) and a retry's
//               ENTRANCE BEAT (he pops up again off the ground, blind; no hurting in it)
//   entry.ts    THE ARENA ENTRY (on from the fake-out, the same cutscene): he runs off to the axe tree, MAN TO MAN;
//               Meathead's one swing; the tree on his head, the close-up (the split's wound painter), blind; SPLIT_MEMO,
//               checkpoint 60; the fight starts at its end
//   fight.ts    HIS FIGHT: blind, the flintlock, the bees, the stampedes, the lions; his deaths, the kill cam, his bar
//   critters.ts the stampedes' small wildlife (new kinds)
//   beasts.ts   the mountain lions and the grizzly (and their close-ups: the 'maul' and 'lions' wound painters)
//   cast.ts     saying things, the camera, Tucker and the bikes in the world (before the fight)
//   art.ts      the real woods, the clearing, the oak, the wreck, the axe tree, the boulder
//   lines.ts    every line, clean / shitty / naked
//
// Checkpoints (manual): 60 (at the trail's start, once he's up: a retry the same visit is the entrance beat by the felled
// tree), 61 (short of the arena once the fight's first started: the world as the entry left it). The boss-door refills:
// one between where the kid's bike is left and the body, one right before the arena (both every retry). Once the fight's
// on, both ends are walled (till he's dead); beaten: VICTORY, the walk-away (walkAway/tucker.ts, the FLINTLOCK),
// Wilderness Land cleared; the walk-away says HEADING BACK TO PARK and he walks back in from the intro's parking lot
// (job H: `leave` below; not the hub). The way back: the left end (the chase's side-view trail,
// DOORS.dirtbike.end). Revisits once the land's cleared: nobody here; the oak's branch snapped, the wreck, the kid's bike,
// the felled tree, the axe in the stump, and his cap and a stain where he died.

import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, endExits, runExits, hands } from '../section';
import { DOORS } from '../geometry';
import { topBand } from '../../../m1/constants';
import { goTo, landsCleared, markLandCleared, markBossDeath, noteBossKill, isLandCleared, setWalkBack } from '../../store';
import { startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { playWalkAway, tickWalkAway, drawWalkAway, prewarmWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { takeChaseHandoff } from '../dirtbike';
import { x0, x1, GY, HANG_X, FIGHT_X, MH_PARK, BODY_NEAR, ENTRANCE_NEAR, ARENA_L, ARENA_R, CP61_X, REFILL2_X } from './layout';
import { arenaOf, introSeen, markIntroSeen, UP_MEMO, SPLIT_MEMO, type Arena } from './state';
import { updateEntry, drawEntryHud, setFelled } from './entry';
import { startCatchup, updateCatchup, drawCatchupHud, branchDone, setBranchMemos } from './catchup';
import { startFakeout, updateFakeout, startEntrance, tickEntrance, layFlat, drawIntroHud } from './intro';
import { drawArenaCast, drawTuckerWords } from './cast';
import { drawArenaBackdrop, drawArenaBack, drawBoulder, drawLeaves, tickLeaves, drawFallingTree, drawRemainsMark } from './art';
import { startFight, updateFight, fightOver, endFight, resetFight, holdIn, killedByWeakness, drawFightBack, drawFightFront, drawFightHud, fightZoom, fightHoldTick } from './fight';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** The world as it stands, on the first frame here since the rebuild (or a cheat start's pick). */
const setUp = (state: GameState, s: Arena) => {
  // (a start at his checkpoint, or anything past the catch-up: the world as a run left it; past the fight's start (61):
  // the entry's been, the tree down, him split)
  if (state.checkpoint >= 60) setBranchMemos(state);
  if (state.checkpoint >= 61) { state.stageMemo[UP_MEMO] = '1'; state.stageMemo[SPLIT_MEMO] = '1'; markIntroSeen(state); }
  if (isLandCleared('frontier')) { s.phase = 'body'; s.tMode = 'gone'; s.snapped = true; s.wreck = true; s.mx = MH_PARK; setFelled(state, s); return; }
  if (!branchDone(state)) { s.phase = 'wait'; s.tMode = 'gone'; s.wreck = false; s.mx = null; return; }
  s.phase = 'body'; s.wreck = true; s.mx = MH_PARK;
  // (a retry this visit: the axe tree down, him flat by it, split, the branch up out of his chest, waiting to pop up
  // again; else hung on the oak, the axe tree standing)
  if (introSeen(state) && state.stageMemo[UP_MEMO] === '1') { setFelled(state, s); state.stageMemo[SPLIT_MEMO] = '1'; layFlat(s); }
  else { s.tMode = 'impaled'; s.face = 'out'; s.snapped = false; }
};

/** Both ends of the arena walled (once it's on: till he's dead). */
const lockWalls = (state: GameState, s: Arena) => {
  if (s.walls.length) return;
  s.walls = [
    { x: ARENA_L - 40, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'tucker-wall' } as Block,
    { x: ARENA_R, y: -4000, w: 40, h: 4000 + GY, type: 'wall', hidden: true, tag: 'tucker-wall' } as Block,
  ];
  state.blocks.push(...s.walls);
};
const openWalls = (state: GameState, s: Arena) => { state.blocks = state.blocks.filter(b => !s.walls.includes(b)); s.walls = []; };

/** Up, and it's his fight: Tucker out of the scenes' hands into the fight's; checkpoint 61 from here on. */
const fightOn = (state: GameState) => {
  const s = arenaOf(state);
  s.phase = 'up';
  lockWalls(state, s);
  s.fight = startFight(state, s.tx, s.tFacing);
  s.tMode = 'gone'; s.said = null;
  if (state.checkpoint < 61) state.checkpoint = 61;
};

/** Beaten: off he walks (the walk-away, the FLINTLOCK, HEADING BACK TO PARK), and then, in place of the hub, the walk
 *  back in from the intro's parking lot (job H: intro/index.ts). The land's cleared first, so the lot's at the new hour. */
const leave = (state: GameState, weakness: boolean) => {
  markBossDeath('frontier', weakness); markLandCleared('frontier'); noteBossKill();
  arenaOf(state).walk = playWalkAway(state, { boss: 'tucker', weakness, onDone: () => { setWalkBack(true); goTo('intro'); } });
};

export const arena: FrontierSection = {
  id: 'arena', x0, x1,
  checkpoints: [
    { name: 'TUCKER', cp: 60, x: DOORS.arena.start.x, y: GY, manual: true },
    { name: 'THE GLADE', cp: 61, x: CP61_X, y: GY, manual: true },
  ],
  build: (state) => {
    resetFight();
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'arena');
    // (the boss-door refill: one big health, one big ammo, right before the arena (only the one set: the playtest); there
    // every retry)
    state.pickups.push(
      { id: 'arena-health2', pos: { x: REFILL2_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'arena-ammo2', pos: { x: REFILL2_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
    );
    arenaOf(state).first = true;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = arenaOf(state);
    tickLeaves(s);
    if (s.first) {
      s.first = false;
      const fromChase = takeChaseHandoff();
      setUp(state, s);
      // (in off the chase, or walked in with it not done: the catch-up)
      if (s.phase === 'wait' && (fromChase || p.health > 0)) { startCatchup(state); return hands(); }
    }
    switch (s.phase) {
      case 'catchup': return updateCatchup(ctx) ?? controls;
      case 'fakeout': return updateFakeout(ctx, fightOn) ?? controls;
      case 'entry': return updateEntry(ctx, fightOn) ?? controls;
      case 'entrance':
        // (a retry's entrance beat: walled in already, him popping up; nothing hurts in it)
        holdIn(state);
        if (tickEntrance(state)) fightOn(state);
        return controls;
      case 'body': {
        runExits(state, endExits('arena', { left: false }));
        if (isLandCleared('frontier') || p.health <= 0 || p.inCutscene) return controls;
        // (up to the body: the fake-out; a retry: he pops up again as he comes near)
        if (s.tMode === 'impaled' && p.isGrounded && pmid(state) > HANG_X - BODY_NEAR) { startFakeout(state); return hands(); }
        if (s.tMode === 'flat' && pmid(state) > FIGHT_X - ENTRANCE_NEAR) { lockWalls(state, s); startEntrance(state); }
        return controls;
      }
      case 'up': {
        const f = s.fight;
        if (!f) return controls;
        holdIn(state);
        markBossFight(state, 'tucker');
        const out = updateFight(ctx, f);
        if (fightOver(f)) {
          s.phase = 'won'; s.wonAt = state.frame; s.weak = killedByWeakness(f);
          endFight(state, f);
          openWalls(state, s);
          s.victory = startVictory();
          // (the walk-away's art painted in idle slices under the VICTORY, at the hour it'll be once the land's cleared)
          prewarmWalkAway('tucker', s.weak, isLandCleared('frontier') ? null : landsCleared() + 1);
        }
        return out ?? controls;
      }
      case 'won': {
        p.inCutscene = true;
        if (s.victory) {
          tickVictory(state, s.victory);
          if (victoryDone(s.victory) && state.frame - s.wonAt > 60) { s.victory = null; leave(state, s.weak); }
        }
        if (s.walk) tickWalkAway(s.walk, controls);
        return hands();
      }
      default:
        runExits(state, endExits('arena', { left: false }));
        return controls;
    }
  },
  // (the fight on, or his entrance: the camera kept to the arena)
  cameraX: (state) => { const s = arenaOf(state); return s.phase === 'up' || s.phase === 'entrance' ? { min: ARENA_L, max: ARENA_R - 800 } : undefined; },
  // (none of it under the walk-away: it covers the whole screen, and the land's just cleared moved the hour on, so every
  // stamp of the woods would be painted afresh for nobody)
  drawBackdrop: (c, state) => (arenaOf(state).walk ? true : drawArenaBackdrop(c, state)),
  drawBack: (c, state) => {
    if (arenaOf(state).walk) return;
    drawArenaBack(c, state);
    drawBoulder(c, state);
    if (isLandCleared('frontier') && !arenaOf(state).fight) drawRemainsMark(c, state);
    drawArenaCast(c, state);
    const f = arenaOf(state).fight;
    // (and after it, what's left of him, under the VICTORY)
    if (f && (arenaOf(state).phase === 'up' || arenaOf(state).phase === 'won')) drawFightBack(c, state, f);
  },
  drawFront: (c, state) => {
    const s = arenaOf(state);
    if (s.walk) return;
    drawFallingTree(c, s);
    drawLeaves(c, s);
    if (s.fight && s.phase === 'up') drawFightFront(c, state, s.fight);
    // (his words over him; not while a close-up or the jumpscare has the screen: they're under those)
    const screened = (s.phase === 'catchup' && s.step === 'close') || (s.phase === 'fakeout' && s.step === 'pop') || (s.phase === 'entry' && s.step === 'close');
    if (!screened) drawTuckerWords(c, state);
  },
  drawHud: (c, state) => {
    const s = arenaOf(state);
    drawCatchupHud(c, state);
    drawIntroHud(c, state);
    drawEntryHud(c, state);
    if (s.fight && s.phase === 'up') drawFightHud(c, state, s.fight, topBand());
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  zoom: (state) => { const s = arenaOf(state); return s.fight && s.phase === 'up' ? fightZoom(state, s.fight) : null; },
  holdTick: (ctx) => { const s = arenaOf(ctx.state); return s.fight && s.phase === 'up' ? fightHoldTick(s.fight) : false; },
  outdoors: () => 1,
};
