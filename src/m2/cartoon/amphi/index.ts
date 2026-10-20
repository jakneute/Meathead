// THE STUPID DAD AMPHITHEATER: section 7 of Cartoon Land, the boss (job 7's; the skeleton's stand-in for now). The
// user's design (cartoon-spec.md, verbatim there): the stage show where STUPID DAD recreates scenes from the show (the
// lone surviving cast member, in his 70s, an alcoholic; the rest of the cast died of alcohol; his TV family cheap
// animatronics; he sits on the couch asking his kid for another beer for the football game; he drinks real beer during
// performances). He approaches the stage from the left; a security guard won't let him on; the boss door is the guard's
// nuts (kicked: he keels over; free access to the stage). THE FIGHT ISN'T DESIGNED YET: don't design it. (Main bosses:
// 666 HP, the 60-frame breather, non-weakness damage 35%; clean / shitty / naked pools for every line group, intro to
// death; markBossFight each frame of it.)
//
// THE SKELETON'S STAND-IN (replace it): the boss-door refill (a big health, a big ammo), the guard by the stage's steps;
// walk past him and it's VICTORY, the walk-away (walkAway/stupidDad.ts, a placeholder registered as 'stupid-dad' in
// walkAway.ts; his toy: the MALLET) and the hub, Cartoon Land cleared. Revisits: once the land's cleared, it doesn't fire.
//
// Checkpoints 60-69. The way back: the left end (to the knockoff area's end). No way on (the end of the land).

import type { GameState } from '../../../m1/game/core/state';
import type { CartoonSection } from '../section';
import { layOwn, endWalls, endExits, runExits, groundBox, cartoonState, hands } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { toonSign, toonSky, onScreen, box, hour, INK } from '../kit';
import { MONUMENT_AT } from '../monument';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { type Victory, startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { type WalkAway, playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';

const { x0, x1 } = SECTIONS.amphi;
/** The guard, by the stage's steps (the stand-in ends the land walking past him). */
const GUARD_X = x0 + 2400;

interface Amphi { done: boolean; wonAt: number; victory: Victory | null; walk: WalkAway | null }
const amphiOf = (state: GameState) => cartoonState<Amphi>(state, 'amphi', () => ({ done: false, wonAt: 0, victory: null, walk: null }));

export const amphi: CartoonSection = {
  id: 'amphi', x0, x1,
  checkpoints: [{ name: 'STUPID DAD LIVE', cp: 60, x: DOORS.amphi.start.x, y: GY }],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' }]);
    endWalls(state, 'amphi');
    // (the boss-door refill: a big health, a big ammo, before the guard)
    state.pickups.push({ id: 'ct-door-hp', pos: { x: GUARD_X - 420, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'ct-door-ammo', pos: { x: GUARD_X - 340, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = amphiOf(state);
    if (!s.done) {
      runExits(state, endExits('amphi'));
      if (!isLandCleared('cartoon') && p.pos.x + p.width / 2 > GUARD_X && p.isGrounded) { s.done = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return controls;
    }
    p.inCutscene = true;
    if (s.victory) {
      tickVictory(state, s.victory);
      if (victoryDone(s.victory) && state.frame - s.wonAt > 60) {
        s.victory = null;
        markLandCleared('cartoon'); noteBossKill();
        s.walk = playWalkAway(state, { boss: 'stupid-dad', onDone: () => goTo('hub') });
      }
    }
    if (s.walk) tickWalkAway(s.walk, controls);
    return hands();
  },
  drawBackdrop: (c, state) => toonSky(c, state, MONUMENT_AT.amphi, { hill: '#86C17A', near: '#5A9A5E' }),
  drawBack: (c, state) => {
    groundBox(c, x0 - 200, x1 + 200, GY, hour('#A8A29E'), '#F5F5F4');
    if (onScreen(state, x0 + 300, x0 + 700)) toonSign(c, x0 + 500, GY, ['STUPID DAD LIVE!', 'THE AMPHITHEATER', 'SHOWS HOURLY. HE TRIES.'], { board: '#B45309', tall: 140 });
    // (the stage: a low proscenium off to the right, a beat-up couch on it, a TV)
    if (onScreen(state, GUARD_X, x1)) {
      const sx = GUARD_X + 120;
      box(c, sx, GY - 60, 1200, 60, INK); box(c, sx + 3, GY - 57, 1194, 54, hour('#78350F'));
      box(c, sx + 3, GY - 57, 1194, 3, '#FDE68A');
      box(c, sx + 400, GY - 120, 220, 60, INK); box(c, sx + 404, GY - 116, 212, 52, hour('#65A30D'));
      box(c, sx + 700, GY - 140, 90, 80, INK); box(c, sx + 706, GY - 134, 78, 60, hour('#1E293B'));
      toonSign(c, sx + 300, GY - 60, ['STUPID DAD', 'COMING SOON'], { board: '#B45309' });
    }
    // (the guard: a big man in a yellow STAFF tee, arms folded, by the steps)
    if (onScreen(state, GUARD_X - 60, GUARD_X + 60)) {
      const gx = GUARD_X + 40;
      box(c, gx - 16, GY - 40, 12, 40, INK); box(c, gx + 4, GY - 40, 12, 40, INK);
      box(c, gx - 15, GY - 39, 10, 38, '#1E293B'); box(c, gx + 5, GY - 39, 10, 38, '#1E293B');
      box(c, gx - 22, GY - 92, 44, 54, INK); box(c, gx - 20, GY - 90, 40, 50, '#FACC15');
      box(c, gx - 22, GY - 72, 44, 12, '#A16207');
      c.fillStyle = INK; c.beginPath(); c.arc(gx, GY - 104, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#A86B43'; c.beginPath(); c.arc(gx, GY - 104, 12, 0, Math.PI * 2); c.fill();
      box(c, gx - 7, GY - 108, 4, 2, INK); box(c, gx + 3, GY - 108, 4, 2, INK); box(c, gx - 5, GY - 98, 10, 2, INK);
    }
  },
  drawHud: (c, state) => {
    const s = amphiOf(state);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  outdoors: () => 1,
};
