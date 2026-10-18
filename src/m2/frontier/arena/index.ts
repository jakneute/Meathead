// THE CATCH-UP AND TUCKER'S ARENA: section 7 of Wilderness Land. The user's design (frontier-spec.md, verbatim there):
// back to side view, Meathead catches up to Tucker ("YOU TOOK THEM ALL OUT?"); he's furious (he can't stand people
// cutting the line expecting a free ride; he doesn't give handouts); he crashes into a tree with a pointy branch that
// impales him through the chest (the mutilation rule: an ANIMATED, detailed close-up of it happening). Missing an eye, a
// buzzsaw in his forehead, a branch through his chest, crashed. Meathead walks up: "ARE YOU GOING TO FAKE ME OUT AGAIN?"
// Yep: he pops up like a jumpscare (he does it every time). The real fight starts here. THE FIGHT ISN'T DESIGNED YET.
// (His standard death, for when it is: he falls over, apparently dead; Meathead walks up; the jumpscare "AAHHH!"; then a
// grizzly comes out of nowhere and mauls him to death for good, chunks flying; the close-up rule applies. Main bosses:
// 666 HP, the 60-frame breather, non-weakness damage 35%; clean / shitty / naked pools for every line group.)
//
//   layout.ts   where things are: the trail, the clearing, the giant oak and its branch (lined up with tucker.ts's
//               'impaled' pose), the refill
//   catchup.ts  THE CATCH-UP (a cutscene, in off the chase's black): the rant, the crash, the close-up (the branch's
//               wound painter), him hung on the oak; BRANCH_MEMO
//   intro.ts    HIS ARENA INTRO, reusable for the fight: THE FAKE-OUT (walk up to the body: the line, the jumpscare;
//               UP_MEMO) and a retry's ENTRANCE BEAT (he pops up again off the ground)
//   entry.ts    THE ARENA ENTRY (on from the fake-out, the same cutscene): he runs off to the axe tree, MAN TO MAN;
//               Meathead's one swing; the tree on his head, the close-up (the split's wound painter), blind; SPLIT_MEMO,
//               checkpoint 60; the fight starts at its end
//   cast.ts     saying things, the camera, Tucker and the bikes in the world
//   art.ts      the real woods, the clearing, the oak, the wreck, the fight's placeholder board
//   lines.ts    every line, clean / shitty / naked
//
// THE FIGHT'S PLACEHOLDER (the fight hangs off intro.ts's `onUp` when it's designed): he stands there squaring up (full
// detail, every wound), a COMING SOON board; walk on past him and the oak and it's VICTORY, the walk-away
// (walkAway/tucker.ts, the FLINTLOCK) and the hub, Wilderness Land cleared. (The user's spin for the real thing: the
// walk-away says HEADING BACK TO PARK and he walks back in from the parking lot: frontier-spec.md, a later job.)
//
// Checkpoint 60 (manual: his once he's up): at the trail's start, Tucker up (a retry: flat by the oak, the entrance beat).
// The big refill between where the kid's bike is left and the body (before his door, every retry). The way back: the
// left end (the chase's side-view trail, DOORS.dirtbike.end). No way on (the end of the land). Revisits once the land's
// cleared: nobody here; the oak's branch snapped, the wreck under it, the kid's bike parked.

import type { GameState } from '../../../m1/game/core/state';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, endExits, runExits, hands } from '../section';
import { DOORS } from '../geometry';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { takeChaseHandoff } from '../dirtbike';
import { x0, x1, GY, HANG_X, FIGHT_X, MH_PARK, REFILL_X, BODY_NEAR, ENTRANCE_NEAR, TRIGGER_X } from './layout';
import { arenaOf, introSeen, UP_MEMO, SPLIT_MEMO, type Arena } from './state';
import { updateEntry, drawEntryHud, setFelled } from './entry';
import { startCatchup, updateCatchup, drawCatchupHud, branchDone, setBranchMemos } from './catchup';
import { startFakeout, updateFakeout, startEntrance, tickEntrance, layFlat, drawIntroHud } from './intro';
import { drawArenaCast, drawTuckerWords, tickTucker } from './cast';
import { drawArenaBackdrop, drawArenaBack, drawBoard, drawLeaves, tickLeaves, drawFallingTree } from './art';

const pmid = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** The world as it stands, on the first frame here since the rebuild (or a cheat start's pick). */
const setUp = (state: GameState, s: Arena) => {
  // (a start at his checkpoint, or anything past the catch-up: the world as a run left it)
  if (state.checkpoint >= 60) setBranchMemos(state);
  if (isLandCleared('frontier')) { s.phase = 'body'; s.tMode = 'gone'; s.snapped = true; s.wreck = true; s.mx = MH_PARK; setFelled(state, s); return; }
  if (!branchDone(state)) { s.phase = 'wait'; s.tMode = 'gone'; s.wreck = false; s.mx = null; return; }
  s.phase = 'body'; s.wreck = true; s.mx = MH_PARK;
  // (a retry this visit: the axe tree down, him flat by it, split, the branch up out of his chest, waiting to pop up
  // again; else hung on the oak, the axe tree standing)
  if (introSeen() && state.stageMemo[UP_MEMO] === '1') { setFelled(state, s); state.stageMemo[SPLIT_MEMO] = '1'; layFlat(s); }
  else { s.tMode = 'impaled'; s.face = 'out'; s.snapped = false; }
};

/** Up, and it's his fight (the placeholder for now: he stands there; walk past him to finish the land). */
const fightOn = (state: GameState) => { const s = arenaOf(state); s.phase = 'up'; };

export const arena: FrontierSection = {
  id: 'arena', x0, x1,
  checkpoints: [{ name: 'TUCKER', cp: 60, x: DOORS.arena.start.x, y: GY, manual: true }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'arena');
    // (the boss-door refill: big health, big ammo, on the way to the body; there every retry)
    state.pickups.push(
      { id: 'arena-health', pos: { x: REFILL_X - 30, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 },
      { id: 'arena-ammo', pos: { x: REFILL_X + 10, y: GY - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 },
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
        if (tickEntrance(state)) fightOn(state);
        return controls;
      case 'body': {
        runExits(state, endExits('arena'));
        if (isLandCleared('frontier') || p.health <= 0 || p.inCutscene) return controls;
        // (up to the body: the fake-out; a retry: he pops up again as he comes near)
        if (s.tMode === 'impaled' && p.isGrounded && pmid(state) > HANG_X - BODY_NEAR) { startFakeout(state); return hands(); }
        if (s.tMode === 'flat' && pmid(state) > FIGHT_X - ENTRANCE_NEAR) startEntrance(state);
        return controls;
      }
      case 'up': {
        runExits(state, endExits('arena'));
        tickTucker(s);
        // (the fight's placeholder: blind, groping, now and then squared up and jabbing the ledger finger at the wrong
        // way, turning to face him when he's near and making noise)
        {
          const toward: 1 | -1 = pmid(state) < s.tx ? -1 : 1, beat = Math.floor(state.frame / 150);
          s.tFacing = beat % 3 === 2 ? (toward === 1 ? -1 : 1) : toward;
          s.pose = beat % 2 ? 'point' : 'grope';
        }
        if (!isLandCleared('frontier') && pmid(state) > TRIGGER_X && p.isGrounded && p.health > 0) {
          s.phase = 'won'; s.wonAt = state.frame; s.victory = startVictory();
        }
        return controls;
      }
      case 'won': {
        p.inCutscene = true;
        if (s.victory) {
          tickVictory(state, s.victory);
          if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
            s.victory = null;
            markLandCleared('frontier'); noteBossKill();
            s.walk = playWalkAway(state, { boss: 'tucker', onDone: () => goTo('hub') });
          }
        }
        if (s.walk) tickWalkAway(s.walk, controls);
        return hands();
      }
      default:
        runExits(state, endExits('arena'));
        return controls;
    }
  },
  drawBackdrop: (c, state) => drawArenaBackdrop(c, state),
  drawBack: (c, state) => {
    drawArenaBack(c, state);
    const s = arenaOf(state);
    if (s.phase === 'up' || s.phase === 'won') drawBoard(c, state);
    drawArenaCast(c, state);
  },
  drawFront: (c, state) => {
    const s = arenaOf(state);
    drawFallingTree(c, s);
    drawLeaves(c, s);
    // (his words over him; not while a close-up or the jumpscare has the screen: they're under those)
    const screened = (s.phase === 'catchup' && s.step === 'close') || (s.phase === 'fakeout' && s.step === 'pop') || (s.phase === 'entry' && s.step === 'close');
    if (!screened) drawTuckerWords(c, state);
  },
  drawHud: (c, state) => {
    const s = arenaOf(state);
    drawCatchupHud(c, state);
    drawIntroHud(c, state);
    drawEntryHud(c, state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  outdoors: () => 1,
};
