// STUPID DAD LIVE!: section 7 of Cartoon Land, the boss. The user's design (cartoon-spec.md, verbatim there): "you will
// eventually reach an amphitheater of the stage show where 'stupid dad' recreates scenes from the show. you approach the
// stage from the left. there's a security guard who won't let you on. since most boss doors involve kicking down a door,
// this 'boss door' is the security guards nuts. you kick him there, he keels over, and you have free access to the stage
// and the boss fight against 'stupid dad'. mechanics come later." And the setup: the show's lone surviving cast member,
// the man who voiced the dad, in his 70s now and a drunk; his TV family cheap animatronics; he sits on the couch asking
// his kid for another beer so he can watch the game; he drinks real beer doing it.
//
//   layout.ts  the bowl: the concourse, the aisle steps, the pit, the stage steps, the deck; who and what's where
//   art.ts     the place painted to the one eye (the marquee, the BEER GARDEN, the crowd, the band shell, the set)
//   dad.ts     STUPID DAD at boss grade (sat, sipping, calling, reaching, getting up, crushing the can), his close-up,
//              the couch
//   family.ts  the animatronic family (MOM, THE BOY on his track, SIS, GRAMPS): running, glitching, off
//   guard.ts   the security guard (the boss door) and his close-up
//   show.ts    the show on its loop (BOY! BEER!, the laugh track, the Boy's fetch), and what everybody's doing
//   scene.ts   the guard's nuts (the boss door's cutscene), STUPID DAD's intro, the placeholder card
//   lines.ts   every line: his, the guard's, the show's, the intro's, by pants
//
// The flow: in at the gate (cp 60); down through the bowl (the show's lines once he's in it); the boss-door refill in
// the pit; up to the guard and it's the cutscene (cp 61 once he's down: GUARD_DOWN in state.stageMemo, so a death or a
// checkpoint start finds him down); up the steps onto the stage and it's STUPID DAD's intro (cp 62; once a visit: a
// retry goes straight on); THE FIGHT ISN'T DESIGNED YET (the user's to give): the placeholder card (BOSS FIGHT COMING
// SOON), the stage emptied behind it, VICTORY, the walk-away (walkAway/stupidDad.ts: the MALLET), the hub, Cartoon Land
// cleared. His deaths (standard and weakness) aren't built: they wait for the fight. Revisits (the land cleared): the
// guard still down (an ice pack on it now), the stage empty, the family slumped and powered down, the TV off, the
// bleachers empty but for the one asleep.
//
// The way back: the left end (to the knockoff area's end). No way on (the end of the land).

import { pickLine, pickFreshLine } from '../../../m1/game/platform/speech';
import type { GameState } from '../../../m1/game/core/state';
import type { CartoonSection } from '../section';
import { layOwn, endWalls, endExits, runExits, hands, solid, meatheadSays, byPants, saidOver, speak } from '../section';
import { goTo, markLandCleared, noteBossKill, isLandCleared } from '../../store';
import { startVictory, tickVictory, drawVictory, victoryDone } from '../../victory';
import { playWalkAway, tickWalkAway, drawWalkAway } from '../../walkAway';
import { markBossFight } from '../../bossQuiet';
import { DOORS } from '../geometry';
import {
  X, x0, x1, TOP_Y, PIT_Y, STAGE_Y, AISLE, STEPS, DECK_A, STAND, REFILL_X, GUARD_X, GUARD_WALL, MOM, SIS, GRAMPS,
  BOY_TRACK, CP_GATE, CP_STEPS, CP_DAD,
} from './layout';
import { amphiOf, introSeen, saidOnce, GUARD_DOWN, type Amphi } from './state';
import { updateShow, stageLook } from './show';
import { startKick, updateKick, guardPoseOf, startIntro, updateIntro, drawKickHud, drawIntroHud } from './scene';
import { drawAmphiBackdrop, drawAmphiBack, amphiLamps } from './art';
import { DAD_K, DAD_H, DAD_SIT_H } from './dad';
import { guardHeadAt } from './guard';
import { ARRIVE, REVISIT, GAGS, GUARD_GROAN, GUARD_LATER, VOICES } from './lines';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

export { GUARD_DOWN };

const pmidX = (state: GameState) => state.player.pos.x + state.player.width / 2;

/** Over: the land's cleared, the walk-away with the MALLET, the hub. */
const leave = (state: GameState, s: Amphi) => {
  markLandCleared('cartoon'); noteBossKill();
  s.walk = playWalkAway(state, { boss: 'stupid-dad', onDone: () => goTo('hub') });
};

/** For the music (music/cues.ts), when it comes: the intro's step, or null. */
export const stupidDadMusic = (state: GameState) => { const s = amphiOf(state); return s.intro ? { intro: s.intro.step, card: s.intro.step === 'card' } : null; };

/** The guard groans as he goes by, now and then (a fresh line only; dropped if anybody's talking). */
const groan = (state: GameState, s: Amphi, cleared: boolean) => {
  const near = Math.abs(pmidX(state) - X(GUARD_X + 30)) < 220;
  if (!near || state.player.inCutscene || state.frame - s.groanAt < 540) return;
  if (cleared) { if (!saidOnce('guard-later')) return; }
  const text = pickFreshLine(byPants(state, cleared ? GUARD_LATER : GUARD_GROAN));
  if (!text) return;
  s.groanAt = state.frame;
  speak(VOICES.guard, text, said => { if (said) s.said.set('guard', said); else s.said.delete('guard'); }, false);
};

export const amphi: CartoonSection = {
  id: 'amphi', x0, x1,
  checkpoints: [
    { name: 'STUPID DAD LIVE', cp: CP_GATE, x: DOORS.amphi.start.x, y: TOP_Y },
    { name: 'THE STAGE STEPS', cp: CP_STEPS, x: X(GUARD_X + 6), y: PIT_Y, manual: true },
    { name: 'STUPID DAD', cp: CP_DAD, x: X(DECK_A + 60), y: STAGE_Y, clear: [400, 3000], manual: true },
  ],
  build: (state) => {
    const s = amphiOf(state), cleared = isLandCleared('cartoon');
    // (a start past the guard (a checkpoint, the checkpoint cheat, a save): he's down, the way a run there left him)
    if (state.checkpoint >= CP_STEPS) state.stageMemo[GUARD_DOWN] = '1';
    const down = cleared || !!state.stageMemo[GUARD_DOWN];
    s.guard = down ? 'down' : 'up';
    // The ground: the concourse, down the aisle steps, the pit, up the stage steps, the deck
    layOwn(state, [
      { x1: X(-200), y1: TOP_Y, x2: X(AISLE.a), y2: TOP_Y, surface: 'hard' },
      { x1: X(AISLE.a), y1: TOP_Y, x2: X(AISLE.b), y2: PIT_Y, surface: 'hard', steps: { n: 24 } },
      { x1: X(AISLE.b), y1: PIT_Y, x2: X(STEPS.a), y2: PIT_Y, surface: 'hard' },
      { x1: X(STEPS.a), y1: PIT_Y, x2: X(STEPS.b), y2: STAGE_Y, surface: 'wood', steps: { n: STEPS.n } },
      { x1: X(STEPS.b), y1: STAGE_Y, x2: x1 + 200, y2: STAGE_Y, surface: 'wood' },
    ]);
    endWalls(state, 'amphi');
    // THE BOSS DOOR: the guard, a wall in front of him till he's down
    if (!down) s.wall = solid(state, X(GUARD_WALL.a), PIT_Y - 6000, GUARD_WALL.w, 6000, { hidden: true, tag: 'amphi-guard' });
    // (the boss-door refill: a big health, a big ammo, in the pit before him)
    if (!cleared) {
      state.pickups.push({ id: 'ct-door-hp', pos: { x: X(REFILL_X[0]) - 10, y: PIT_Y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
      state.pickups.push({ id: 'ct-door-ammo', pos: { x: X(REFILL_X[1]) - 10, y: PIT_Y - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
    }
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = amphiOf(state);
    const cleared = isLandCleared('cartoon');
    // Over: VICTORY, then the walk-away
    if (s.won) {
      p.inCutscene = true;
      if (s.victory) { tickVictory(state, s.victory); if (victoryDone(s.victory) && state.frame - s.wonAt > 60) { s.victory = null; leave(state, s); } }
      if (s.walk) tickWalkAway(s.walk, controls);
      return hands();
    }
    const rx = pmidX(state) - x0;
    // The show (its lines once he's down in the bowl; none started while a scene's on)
    if (!cleared && !s.intro) updateShow(state, s, rx > AISLE.a + 40, !!s.kick, () => { if (saidOnce('show')) meatheadSays(state, pickLine(byPants(state, GAGS.show)), true); });
    // The boss door's cutscene
    if (s.kick) return updateKick(ctx, s);
    // STUPID DAD's intro, the placeholder
    if (s.intro && !s.won) {
      markBossFight(state, 'stupid-dad');
      const { out, done } = updateIntro(ctx, s);
      if (done) { s.won = true; s.wonAt = state.frame; s.victory = startVictory(); }
      return out;
    }
    runExits(state, endExits('amphi'));
    // What he's got to say (once each a visit)
    const once = (key: string, pool: string[]) => { if (!p.inCutscene && p.health > 0 && saidOnce(key)) meatheadSays(state, pickLine(pool), true); };
    if (rx > 120 && rx < 700) once('arrive', byPants(state, cleared ? REVISIT : ARRIVE));
    if (!cleared) {
      if (rx > STAND.a - 40 && rx < STAND.b) once('beer', byPants(state, GAGS.beer));
      if (rx > AISLE.a + 120 && rx < AISLE.a + 700) once('crowd', byPants(state, GAGS.crowd));
      if (rx > AISLE.b + 120 && rx < STEPS.a - 100) once('robots', byPants(state, GAGS.robots));
    }
    // Up to the guard: the boss door
    if (s.guard === 'up' && p.health > 0 && !p.inCutscene && p.isGrounded && rx > GUARD_WALL.a - 130) { startKick(state, s); return updateKick(ctx, s); }
    if (s.guard === 'down') groan(state, s, cleared);
    // Up onto the stage: STUPID DAD (the first time this visit, the intro; a retry, straight on)
    if (!cleared && s.guard === 'down' && p.health > 0 && p.isGrounded && rx > DECK_A + 70) {
      startIntro(state, s, introSeen());
      markBossFight(state, 'stupid-dad');
      return updateIntro(ctx, s).out;
    }
    return controls;
  },
  drawBackdrop: (c, state) => drawAmphiBackdrop(c, state),
  drawBack: (c, state) => {
    const s = amphiOf(state), cleared = isLandCleared('cartoon');
    const look = stageLook(state, s);
    const g = guardPoseOf(s);
    const u = s.show.boyU;
    drawAmphiBack(c, state, { stage: look, guard: { ...g, ice: cleared }, cleared: cleared || !!s.intro?.emptied, doorOpen: u > 0.8 ? (u - 0.8) / 0.2 : 0 });
  },
  drawFront: (c, state) => {
    // (the words over whoever's saying them: the stage's at their depth, the guard's over him)
    const s = amphiOf(state);
    if (!s.said.size) return;
    const E = { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 };
    const at = (x: number, y: number, d: number) => ({ x: E.x + (x - E.x) * d, y: E.y + (y - E.y) * d });
    const look = stageLook(state, s);
    for (const [who, said] of s.said) {
      let p: { x: number; y: number };
      if (who === 'guard') { const g = guardPoseOf(s); p = guardHeadAt(X(GUARD_X), PIT_Y, g.pose); p.y -= 10; }
      else if (who === 'dad') { const D = look.dad; if (!D) continue; const sat = D.pose !== 'stand' && D.pose !== 'shuffle' && D.pose !== 'crush'; p = at(X(D.x), STAGE_Y - (sat ? DAD_SIT_H : DAD_H) - 14, D.d); }
      else if (who === 'boy') { const k = look.boy.u; p = at(X(BOY_TRACK.a.x + (BOY_TRACK.b.x - BOY_TRACK.a.x) * k), STAGE_Y - 104 * DAD_K, BOY_TRACK.a.d + (BOY_TRACK.b.d - BOY_TRACK.a.d) * k); }
      else if (who === 'mom') p = at(X(MOM.x), STAGE_Y - 130 * DAD_K, MOM.d);
      else if (who === 'sis') p = at(X(SIS.x), STAGE_Y - 76 * DAD_K, SIS.d);
      else p = at(X(GRAMPS.x + 10), STAGE_Y - 122 * DAD_K, GRAMPS.d);
      const col = who === 'dad' ? '#FDE047' : who === 'guard' ? '#E5E7EB' : '#93C5FD';
      saidOver(c, said.text, p.x, p.y, col, 240);
    }
  },
  drawHud: (c, state) => {
    const s = amphiOf(state);
    if (s.kick) drawKickHud(c, state, s);
    if (s.intro && !s.won) drawIntroHud(c, state, s);
    if (s.victory) drawVictory(c, s.victory);
    if (s.walk) drawWalkAway(c, s.walk);
  },
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => amphiLamps(state),
};
