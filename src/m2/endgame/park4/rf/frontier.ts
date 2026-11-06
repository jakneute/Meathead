// TUCKER THE CONDUCTOR's refight (GREED): hell's knockoff of his glade, Wilderness Land's own boss fight run whole
// (frontier/arena/fight.ts) at 999. The owner's: "for tucker, he will complain 'why didn't you restore my eyesight' and
// seems extra agitated", "tucker is just wandering hell's wilderness because he cannot see and is lost". The same
// fight (blind, the flintlock at sounds, the bees, the stampedes, the lions); his lines swapped for the raised ones
// (park4/lines/frontier.ts: lost, blind, furious at Ned, still billing). Started at checkpoint 61 (the land's own retry:
// short of the arena, him flat by the felled tree, up with a jump as Meathead comes near: the entrance beat).
//
// Stitched up the way he died: the grizzly (claw seams down him, a bear's brown fur sewn in where it ate) or the lions
// (torn in half at the waist, the halves sewn back on a bit crooked, staples where the thread ran out).
//
// The hell's props go along the glade's back through the land's own hook (frontier/arena/index.ts setRefightBack:
// behind the boulder and him), not the framework's arena() (that's drawn after the land's back, over Tucker: he's
// drawn in the land's back pass).

import type { RefightDef } from '../defs';
import type { GameState } from '../../../../m1/game/core/state';
import { frontierLayout } from '../../../frontier/index';
import { setRefightBack } from '../../../frontier/arena/index';
import { ARENA_L, ARENA_R, GY } from '../../../frontier/arena/layout';
import * as A from '../../../frontier/arena/lines';
import { bossDeath } from '../../../store';
import { refightOn } from '../hook';
import { drawHellProps, bossBox } from '../hell';
import { refightId, refightStage } from '../where';
import * as L from '../lines/frontier';

type Ctx = CanvasRenderingContext2D;
const ARENA = { l: ARENA_L - 60, r: ARENA_R + 60, floor: GY };

// (hell's wilderness along the glade's back: behind the boulder and him)
setRefightBack((c, state) => drawHellProps(c, state, 'GREED', ARENA));

/** The bear's fur sewn into him (the grizzly's look): a few tufts of it over the patches (the seams are drawStitches'). */
const furTufts = (c: Ctx, state: GameState) => {
  if ((refightOn()?.look ?? 'normal') !== 'normal') return;
  const at = bossBox(state);
  if (!at) return;
  const L0 = at.x - at.w / 2, T = at.feet - at.h, fx = (u: number) => (at.face < 0 ? L0 + at.w * (1 - u) : L0 + at.w * u);
  c.save();
  c.strokeStyle = '#3B2412'; c.lineWidth = 1;
  for (const [u, v] of [[0.62, 0.34], [0.7, 0.4], [0.58, 0.44], [0.2, 0.66], [0.28, 0.72]] as const) {
    const x = fx(u), y = T + at.h * v;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + k * 2, y); c.lineTo(x + k * 2 - 2, y - 4); c.stroke(); }
  }
  c.restore();
};

export const frontierRefight: RefightDef = {
  land: 'frontier', id: refightId('frontier'), stage: refightStage('frontier'),
  boss: 'TUCKER THE CONDUCTOR', sin: 'GREED',
  inner: frontierLayout, cp: 61,
  sign: { pic: 'train', word: 'TRAIN', color: '#B45309' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('frontier') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'TORN IN HALF BY LIONS (WEAKNESS)' : 'MAULED BY A GRIZZLY'),
  swaps: () => [
    [A.TUCKER_ENTRANCE, L.RF_TUCKER_ENTRANCE], [A.TF_TAUNT, L.RF_TF_TAUNT], [A.TF_FIRE, L.RF_TF_FIRE], [A.TF_HEAR, L.RF_TF_HEAR],
    [A.TF_HIT, L.RF_TF_HIT], [A.TF_RELOAD, L.RF_TF_RELOAD], [A.TF_HURT, L.RF_TF_HURT], [A.TF_BEES, L.RF_TF_BEES],
    [A.TF_STAMPEDE, L.RF_TF_STAMPEDE], [A.TF_BLOODY, L.RF_TF_BLOODY], [A.TF_MAULED, L.RF_TF_MAULED], [A.TF_GETUP, L.RF_TF_GETUP],
    [A.TF_LOW, L.RF_TF_LOW], [A.TF_FALL, L.RF_TF_FALL], [A.TF_POP, L.RF_TF_POP], [A.TF_GLOAT, L.RF_TF_GLOAT],
    [A.TF_LAST_BEAR, L.RF_TF_LAST_BEAR], [A.TF_LAST_LIONS, L.RF_TF_LAST_LIONS],
  ],
  // (none from the framework: its props would go over him (see the top); the land's hook draws them behind)
  arena: () => null,
  stitches: look => look === 'weakness'
    // (torn in half: the waist seam right round him, a hand's width off true (sewn back crooked), a second seam where
    // the top half sits wrong on the bottom; staples where Ned ran out of thread)
    ? { thread: '#1A1A1A', patch: '#B91C1C', seams: [[0.0, 0.5, 1.0, 0.56], [0.05, 0.54, 0.95, 0.6], [0.45, 0.48, 0.5, 0.64]], patches: [[0.1, 0.5, 0.8, 0.05]], staples: [[0.2, 0.53], [0.5, 0.55], [0.8, 0.57]] }
    // (the grizzly: three claw seams raked down him, the bear's brown fur patched in where it ate)
    : { thread: '#F5F5F4', patch: '#5B3A1E', seams: [[0.25, 0.2, 0.7, 0.55], [0.35, 0.18, 0.8, 0.5], [0.15, 0.25, 0.6, 0.62]], patches: [[0.55, 0.3, 0.3, 0.18], [0.15, 0.62, 0.25, 0.14]], staples: [[0.45, 0.36], [0.3, 0.7]] },
  drawFront: furTufts,
};
