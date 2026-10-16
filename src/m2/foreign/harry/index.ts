// HELICOPTER HARRY: the land's boss. STUB (the first job's): the arena (crude), and a clearly temporary stand-in: walk
// past the middle and it's VICTORY, the walk-away (walkAway/helicopterHarry.ts, a placeholder) and the hub, Foreign
// Lands cleared (his toy: the SOUVENIR launcher). Its owner builds the fight when the user gives its mechanics (the
// arena first): Harry dropped his progressive act after he was thrown out of his own helicopter, and swears a WHOLE lot
// (no slurs: "DAMN FOREIGNERS", "THEY SHOULD BUILD A WALL AROUND THE WALL"); main boss: 666 HP, the 60-frame breather,
// non-weakness 35%; clean / shitty / naked pools for every line group, intro to death; Harry fully drawn. A big health
// + ammo refill before it (the crash site). Checkpoints 120-129.
//
// The way in: Harry's rocket and the crash (DOORS.harry.start, for now the helipad's right end). Back: the left end.

import type { GameState } from '../../../m1/game/core/state';
import type { ForeignSection } from '../section';
import { layOwn, endWalls, endExits, runExits, foreignState, hands } from '../section';
import { SECTIONS, GY } from '../geometry';
import { viewIn, promenade, postBoard, onScreen, LOOKS } from '../kit';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { drawTodSky } from '../../timeOfDay';

const { x0, x1 } = SECTIONS.harry;
const X = (rx: number) => x0 + rx;
/** Where the stand-in ends the land. */
const TRIGGER_X = X(1500);

interface Harry { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const harryOf = (state: GameState) => foreignState<Harry>(state, 'harry', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const harry: ForeignSection = {
  id: 'harry', x0, x1,
  checkpoints: [{ name: 'HELICOPTER HARRY', cp: 120, x: X(200), y: GY, clear: [300, 3000] }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'harry');
    state.pickups.push({ id: 'hh-health', pos: { x: X(500), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'hh-ammo', pos: { x: X(600), y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = harryOf(state);
    if (!s.done) {
      runExits(state, endExits('harry'));
      if (!isLandCleared('foreign') && p.pos.x + p.width / 2 > TRIGGER_X && p.isGrounded) { s.done = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (s.victory) {
      tickVictory(state, s.victory);
      if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
        s.victory = null;
        markLandCleared('foreign'); noteBossKill();
        s.walk = playWalkAway(state, { boss: 'helicopter-harry', onDone: () => goTo('hub') });
      }
    }
    if (s.walk) tickWalkAway(s.walk, controls);
    return hands();
  },
  drawBackdrop: (c) => { drawTodSky(c, 0, 0, 800, 600, ['#7F1D1D', '#C2410C', '#FB923C', '#FDE68A'], { horizon: 430, sun: [620, 110], moon: [170, 90] }); return true; },
  drawBack: (c, state) => {
    const v = viewIn(state);
    promenade(c, v, x0 - 200, x1 + 200, '#A8A29E', '#57534E');
    if (onScreen(v, X(1200), X(1800))) postBoard(c, X(1500), GY, ['HELICOPTER HARRY', 'THE FIGHT: COMING SOON'], LOOKS.land(1), '#7F1D1D', undefined, 120);
  },
  drawHud: (c, state) => {
    const s = harryOf(state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  outdoors: () => 1,
};
