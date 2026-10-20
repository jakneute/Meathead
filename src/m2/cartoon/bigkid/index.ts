// THE BIG-KID ZONE: section 5 of Cartoon Land. The user's brief: "the next section is more platforming but involving
// bigger, more intense rides based on 'big kid' y7 like shows and early adult animated shows, like the simpsons.
// meathead still refuses to ride them because he is prejudiced against rides that don't have a track. he thinks those
// rides are for 'pussies'. they will try to run into you though. you will see posters for another failed mid 90s tv
// show producers put way too much stock in: a show called 'stupid dad'." (The rest of Stupid Dad's story is the boss's,
// later: here, the setup: the posters, the gift shack, the memorial for the dead cast, the LIVE billboard.)
//
// The zone (layout.ts: teach, then escalate): the land's swaying stack-towers (cartoon/sway.ts) over the glop pits and
// in the bumper rink (where the cars ram their feet); the trackless rides roaming loose and running at him (rides.ts);
// the zone's cast (kinds.ts); STUPID DAD everywhere (art.ts); his lines (lines.ts).
//
// The ways: back out its left end to the White House's stage door (DOORS.whitehouse2.end); on out its right end, the
// gate to STUPID DAD: THE EXTENDED UNIVERSE (DOORS.itchy.start); back from there, he's at DOORS.bigkid.end. Been out the
// far gate (`ct-bigkid-done`): a later visit's the revisit (the couch parked dead, OUT OF ORDER; his lines).

import { pickLine, pickFreshLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, endExits, endWalls, saidOver, speak } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeTowers, updateTowers, drawTowers, ridingTower, onTower } from '../sway';
import { GROUND, PIPE_RUNS, SOLIDS, LEDGES, TOWERS, CAST, PICKUPS, CHECKPOINTS, GAG_AT, SHACK, X, Y } from './layout';
import { bigkidOf, saidOnce } from './state';
import { makeRides, updateRides, drawRidesBack, drawRidesFront, noteSafe, inPuddle, onSneer, COUCH_DONE_MEMO } from './rides';
import { drawBigkidBackdrop, drawBigkidBack, bigkidLamps } from './art';
import { ARRIVE, REVISIT, GAGS, TRACKLESS, DOLL_LINES, CAST_VOICES } from './lines';
import './kinds';

const { x0, x1 } = SECTIONS.bigkid;
export { COUCH_DONE_MEMO as BIGKID_DONE_MEMO };

// (a ride lining up on him: now and then, his sneer)
onSneer(state => {
  const p = state.player, k = bigkidOf(state);
  if (p.inCutscene || p.health <= 0 || Math.random() > 0.55) return;
  const line = pickFreshLine(byPants(state, TRACKLESS));
  if (!line) return;
  k.sneerAt = state.frame;
  meatheadSays(state, line, false);
});

export const bigkid: CartoonSection = {
  id: 'bigkid', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, [
      ...GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })),
      ...PIPE_RUNS.map(([a, d1, b, d2]) => ({ x1: X(a), y1: GY + d1, x2: X(b), y2: GY + d2, surface: 'hard' as const })),
    ]);
    endWalls(state, 'bigkid');
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, GY + 40 - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const k = bigkidOf(state);
    k.towers = makeTowers(state, TOWERS);
    makeRides(state, !!state.stageMemo[COUCH_DONE_MEMO]);
    for (const [kind, rx, h] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `bigkid-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    // (where the glop pits spit him back out, till he's stood somewhere: his checkpoint (or the section's start))
    const cp = CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? CHECKPOINTS[0];
    k.safe = { x: cp.x, y: cp.y };
    k.lastX = state.player.pos.x;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, k = bigkidOf(state);
    updateTowers(ctx, k.towers);
    noteSafe(state);
    // (wading through a sticky loogie puddle: half speed)
    const dx = p.pos.x - k.lastX;
    if (dx !== 0 && Math.abs(dx) < 14 && p.isGrounded && !k.towers.some(t => onTower(state, t)) && inPuddle(state)) {
      p.pos.x = k.lastX + dx * 0.5;
      if (state.frame % 14 === 0) playSound('squish', 0.25, 10);
    }
    k.lastX = p.pos.x;
    updateRides(ctx);
    const rx = p.pos.x + p.width / 2 - x0;
    // What he's got to say about it (once each a visit)
    const once = (key: string, pool: string[], after = false) => { if (!p.inCutscene && p.health > 0 && saidOnce(key)) meatheadSays(state, pickLine(pool), after); };
    const revisit = !!state.stageMemo[COUCH_DONE_MEMO];
    // (in out the stage door, his line as he went is still going: this one waits its turn)
    if (rx > 360 && rx < 900) once('arrive', byPants(state, revisit ? REVISIT : ARRIVE), true);
    for (const [key, at] of GAG_AT) {
      if (rx < at || rx > at + 400) continue;
      if (key === 'couch') once(revisit ? 'broke' : 'couch', byPants(state, GAGS[revisit ? 'broke' : 'couch']));
      else once(key, byPants(state, GAGS[key as keyof typeof GAGS]));
    }
    // (on a tower as it first leans)
    const t = ridingTower(state, k.towers);
    if (t && Math.abs(t.ang) > 0.12) once('tower', byPants(state, GAGS.tower));
    // (the talking doll in the clearance bin: walk up to it and it goes off, now and then; his say, the first time)
    const binX = X(SHACK.bin);
    const dollLine = Math.abs(mid(p).x - binX) < 120 && p.health > 0 && !p.inCutscene && !k.doll && state.frame - k.dollAt > 480 ? pickFreshLine(DOLL_LINES) : null;
    if (dollLine) {
      k.dollAt = state.frame;
      speak(CAST_VOICES.doll, dollLine, s => { k.doll = s; }, false, () => {
        if (!p.inCutscene && p.health > 0 && saidOnce('doll')) meatheadSays(state, pickLine(byPants(state, GAGS.doll)), true);
      });
    }
    // The ways: back out the left end (the White House's stage door); on out the right (the extended universe)
    const leavingRight = rx > x1 - x0 - 80;
    if (runExits(state, endExits('bigkid')) && leavingRight) state.stageMemo[COUCH_DONE_MEMO] = '1';
    return controls;
  },
  drawBackdrop: (c, state) => drawBigkidBackdrop(c, state),
  drawBack: (c, state) => {
    const k = bigkidOf(state);
    drawBigkidBack(c, state, !!k.doll);
    drawTowers(c, state, k.towers);
    drawRidesBack(c, state);
  },
  drawFront: (c, state) => {
    const k = bigkidOf(state);
    drawRidesFront(c, state);
    // (the cast's barks over their heads; the doll's over the bin)
    for (const [e, s] of k.barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 14, '#FDE68A', 220);
    if (k.doll) saidOver(c, k.doll.text, X(SHACK.bin), Y(96), '#FCA5A5', 200);
  },
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => bigkidLamps(state),
};
