// OUTSIDE THE GREAT PIXIE'S BEDROOM, AND PIPER: section 7 of Fairy Land, the boss (a later job's; the skeleton's
// stand-in for now). The user's design (fantasy-spec.md, verbatim there): the broomstick's crash in through the
// window puts him outside the great pixie's bedroom (naked: he's got a boner here). He kicks down the door to her
// chambers; she's MORBIDLY OBESE (the reveal: the sultry voice all land long against the look of her); naked, his
// boner slowly goes flaccid when he sees her (only when he's nude). He insults how fat and ugly she is, which enrages
// her and starts the actual fight. THE FIGHT ISN'T DESIGNED YET: don't design it. (Main bosses: 666 HP, the 60-frame
// breather, non-weakness damage 35%; clean / shitty / naked pools for every line group, intro to death; markBossFight
// each frame of it.) She's drawn at full detail already: fantasy/piper.ts.
//
// THE SKELETON'S STAND-IN (replace it): the boss-door refill (a big health, a big ammo), a door; walk past it and it's
// VICTORY, the walk-away (walkAway/piper.ts, a placeholder registered as 'piper' in walkAway.ts; his toy: the
// SPELLBOOK) and the hub, Fairy Land cleared. Revisits: once the land's cleared, the stand-in doesn't fire.
//
// Checkpoints 60-69. The way back: the left end (to the broomsticks' end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { FantasySection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, fantasyState, hands } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { storySign, onScreen, box } from '../kit';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const { x0, x1 } = SECTIONS.bedroom;
/** Her door (the stand-in ends the land walking through it). */
const DOOR_X = x0 + 2200;

interface Bedroom { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const bedroomOf = (state: GameState) => fantasyState<Bedroom>(state, 'bedroom', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const bedroom: FantasySection = {
  id: 'bedroom', x0, x1,
  checkpoints: [{ name: 'PIPER THE PIXIE', cp: 60, x: DOORS.bedroom.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'wood' }]);
    endWalls(state, 'bedroom');
    // (the boss-door refill: a big health, a big ammo, before her door)
    state.pickups.push({ id: 'fa-door-hp', pos: { x: DOOR_X - 420, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'fa-door-ammo', pos: { x: DOOR_X - 340, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = bedroomOf(state);
    if (!s.done) {
      runExits(state, endExits('bedroom'));
      if (!isLandCleared('fantasy') && p.pos.x + p.width / 2 > DOOR_X && p.isGrounded) { s.done = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (s.victory) {
      tickVictory(state, s.victory);
      if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
        s.victory = null;
        markLandCleared('fantasy'); noteBossKill();
        s.walk = playWalkAway(state, { boss: 'piper', onDone: () => goTo('hub') });
      }
    }
    if (s.walk) tickWalkAway(s.walk, controls);
    return hands();
  },
  // (indoors: the castle's top floor, pink and gold)
  drawBackdrop: (c) => { box(c, 0, 0, 800, 600, '#3A1A3E'); for (let y = 0; y < 600; y += 40) box(c, 0, y, 800, 2, '#4A2450'); return true; },
  drawBack: (c, state) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#5A2A3A', '#E8B0C8');
    if (onScreen(state, x0 + 400, x0 + 800)) storySign(c, x0 + 600, GY, ["THE GREAT PIXIE'S CHAMBERS", 'PIPER: COMING SOON'], { board: '#6E1E4E' });
    if (onScreen(state, DOOR_X - 80, DOOR_X + 80)) {
      // (her door: tall, pink, gold hinges, a heart knocker)
      box(c, DOOR_X - 46, GY - 170, 92, 170, '#1A1028'); box(c, DOOR_X - 42, GY - 166, 84, 166, '#C8487E'); box(c, DOOR_X - 42, GY - 166, 16, 166, '#E070A0');
      for (const y of [GY - 140, GY - 40]) box(c, DOOR_X - 42, y, 22, 8, '#F2C84A');
      box(c, DOOR_X + 18, GY - 92, 10, 10, '#F2C84A');
    }
  },
  drawHud: (c, state) => {
    const s = bedroomOf(state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
};
