// PUNCHY & KICKY: section 6 of Cartoon Land. The user's brief: "we then enter an area that is a tie in to the show: a
// clear itchy and scratchy knock off where a legally distinct cat and a legally distinct mouse try to smash each other
// to death with hammers. this is a part of the 'stupid dad' extended universe portion of the park." And since: the cat
// and mouse are PUNCHY and KICKY, "and this is the area for standard Looney Tunes violence as hazards/set pieces:
// falling anvils, giant hammers, and the like (dynamite, falling pianos/safes, ACME-style traps, portable holes,
// cannons, rakes underfoot...)".
//
// The area (layout.ts: each hazard taught alone on the flat, then in combos, then with the land's swaying stack-towers
// over the painted canyon and the floor of portable holes): the hazards (hazards.ts, drawn in hazardArt.ts), the cast
// (kinds.ts, kindArt.ts: Punchy and Kicky in costume, the live show's host and its stagehands), the show's theming
// (art.ts), his lines (lines.ts). Meathead's never seen the show and he's fine with the violence.
//
// The ways: back out its left end to the big-kid zone's far gate (DOORS.bigkid.end); on out its right end, the STUPID
// DAD LIVE! gate (DOORS.amphi.start); back from the amphitheater, he's at DOORS.itchy.end. Been out the far gate
// (ITCHY_DONE): a later visit's the revisit (the KILL-O-RAMA closed for cleanup, its robot Kicky's head hanging off by
// its wires (it still swings), his lines). What the run's set off stays set off (ITCHY_FIRED: the safe, the piano, the
// sprung bear traps, the host's anvils where they came down).

import { pickLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import { makeKindEnemy, mid } from '../../../m1/game/enemies/kinds';
import type { CartoonSection } from '../section';
import { layOwn, ledge, solid, meatheadSays, byPants, runExits, endExits, endWalls, saidOver } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeTowers, updateTowers, drawTowers, ridingTower } from '../sway';
import { GROUND, SOLIDS, LEDGES, TOWERS, CAST, PICKUPS, CHECKPOINTS, GAG_AT, X, Y } from './layout';
import { itchyOf, saidOnce, ITCHY_DONE } from './state';
import { makeHazards, updateHazards, noteSafe, onDropped } from './hazards';
import { drawHazardsBack, drawHazardsFront } from './hazardArt';
import { drawItchyBackdrop, drawItchyBack, drawItchySigns, itchyLamps } from './art';
import { primeAmphiFar } from '../amphi/far';
import { ARRIVE, REVISIT, GAGS } from './lines';
import { drawItchyDeathCam } from './deaths';
import { tickHurtGag, drawHurtGag } from '../../hurtGags';
import './kinds';

const { x0, x1 } = SECTIONS.itchy;
export { ITCHY_DONE };

// (the safe and the piano coming down, the first time: his line)
onDropped((state, id) => {
  const p = state.player;
  if (!p.inCutscene && p.health > 0 && saidOnce(id)) meatheadSays(state, pickLine(byPants(state, GAGS[id])), true);
});

export const itchy: CartoonSection = {
  id: 'itchy', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, b]) => ({ x1: X(a), y1: GY, x2: X(b), y2: GY, surface: 'hard' as const })));
    endWalls(state, 'itchy');
    for (const [a, b, top] of SOLIDS) solid(state, X(a), Y(top), b - a, GY + 40 - Y(top), { hidden: true });
    for (const [a, b, h] of LEDGES) ledge(state, X(a), Y(h), b - a, { hidden: true });
    const k = itchyOf(state);
    k.towers = makeTowers(state, TOWERS);
    makeHazards(state);
    for (const [kind, rx, h] of CAST) {
      const e = makeKindEnemy(kind as EnemyKind, X(rx), Y(h));
      e.homeX ??= e.pos.x; e.homeY = e.pos.y; e.variant = Math.abs(Math.round(rx)) % 7; e.facing = -1;
      state.enemies.push(e);
    }
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `itchy-${Math.round(rx)}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
    // (where the canyon and the holes put him back, till he's stood somewhere: his checkpoint (or the section's start))
    const cp = CHECKPOINTS.find(c => c.cp === state.checkpoint) ?? CHECKPOINTS[0];
    k.safe = { x: cp.x, y: cp.y };
    k.lastX = state.player.pos.x;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, k = itchyOf(state);
    updateTowers(ctx, k.towers);
    noteSafe(state);
    updateHazards(ctx);
    tickHurtGag(state);
    // (a bear trap's got his leg: he can shoot, not go anywhere)
    if (k.trapped > 0) {
      k.trapped--; p.vel.x = 0;
      if (p.health > 0) controls = { ...controls, left: false, right: false, jump: false, special: false, charge: false };
    }
    k.lastX = p.pos.x;
    const rx = p.pos.x + p.width / 2 - x0;
    // What he's got to say about it (once each a visit)
    const once = (key: string, pool: string[], after = false) => { if (!p.inCutscene && p.health > 0 && saidOnce(key)) meatheadSays(state, pickLine(pool), after); };
    const revisit = !!state.stageMemo[ITCHY_DONE];
    // (in out of the big-kid zone, his line as he went is still going: this one waits its turn)
    if (rx > 120 && rx < 700) once('arrive', byPants(state, revisit ? REVISIT : ARRIVE), true);
    for (const [key, at] of GAG_AT) if (rx >= at && rx <= at + 400) once(key, byPants(state, GAGS[key as keyof typeof GAGS]));
    // (on a tower as it first leans)
    const t = ridingTower(state, k.towers);
    if (t && Math.abs(t.ang) > 0.12) once('tower', byPants(state, GAGS.tower));
    // The ways: back out the left end (the big-kid zone); on out the right (the amphitheater)
    const leavingRight = rx > x1 - x0 - 80;
    if (runExits(state, endExits('itchy')) && leavingRight) state.stageMemo[ITCHY_DONE] = '1';
    return controls;
  },
  drawBackdrop: (c, state) => {
    // (near the gate on: the amphitheater's far off stamped ahead, a layer a frame (amphi/far.ts), under this one's)
    if (state.camera.x > x1 - 2400) primeAmphiFar(c);
    return drawItchyBackdrop(c, state);
  },
  drawBack: (c, state) => {
    const k = itchyOf(state);
    drawItchyBack(c, state, !!state.stageMemo[ITCHY_DONE]);
    drawTowers(c, state, k.towers);
    drawHazardsBack(c, state, !!state.stageMemo[ITCHY_DONE]);
    drawItchySigns(c, state);
  },
  drawFront: (c, state) => {
    const k = itchyOf(state);
    // (the rake in his face, the bear trap on his leg: him, in the pose for it (hurtGags.ts))
    drawHurtGag(c, state);
    drawHazardsFront(c, state);
    // (the cast's barks over their heads)
    for (const [e, s] of k.barks) if (e.health > 0) saidOver(c, s.text, mid(e).x, e.pos.y - 18, '#FDE68A', 220);
  },
  // (the canyon's fall, the floor of holes' forever: their kill cams)
  drawHud: (c, state) => { drawItchyDeathCam(c, state); },
  cameraRow: () => 500,
  outdoors: () => 1,
  lamps: (state) => itchyLamps(state),
};
