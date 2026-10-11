// THE TOWN: section 1 of Spooky Land. A gothic Victorian town square that tries hard to look the part, with the modern
// conveniences showing through (free Wi-Fi on a gas lamp, an ATM in a crypt, a selfie station on the gallows, a
// phone-charging coffin, an ADA ramp up to a crypt...). Wildlife out to kill him on the way (bats, of course; crows,
// rats, a mangy black cat), and the park's staff in cheap classic-monster costumes, the first of them (kinds.ts): the
// bedsheet ghost, the wolfman (rusher), the stitched-up monster (bruiser), the witch (flyer, thrower), and late on the
// skeleton behind his tombstone (shield). The haunted kiddie rides along the way (he mocks each as he passes), the
// ELEVATOR TO HELL's clock tower far off in the background all the way along (he wants to ride it). At the end, the
// long flight of stairs up, the sign at the bottom: DRACULA'S OTHER CASTLE; at the top, the castle's door (on in, to
// the castle section's start; back out of it, he's at the top of the stairs).
//
// Laid out in layout.ts, drawn in art.ts. Outdoors: the time of day's light (gloomy as it likes, but by the hour).

import { pickLine } from '../../../m1/game/platform/speech';
import type { EnemyKind } from '../../../m1/types';
import type { SpookySection } from '../section';
import { layOwn, ledge, solid, endWalls, endExits, runExits, meatheadSays } from '../section';
import { SECTIONS, GY } from '../geometry';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { profileYAt } from '../../../m1/game/core/terrain';
import { updateLobbed, drawLobbed } from './kinds';
import { townOf } from './state';
import { GROUND, LEDGES, SOLIDS, LADDERS, ENEMIES, PICKUPS, RIDES, CHECKPOINTS, STAIRS, MOAT, X, Y } from './layout';
import { buildRides, updateRides, drawPumpkins } from './rides';
import { townDanger } from './rideHits';
import { updateLadders, drawLadders, type LadderDef } from '../../moves/ladders';
import { drawTownBackdrop, drawTownBack, townLamps } from './art';
import { ARRIVE, ELEVATOR_SEEN, ELEVATOR_AGAIN, STAIRS as STAIRS_LINES, RIDE_LINES, PONY_LAUNCHED, TRAIN_RIDE, PUMPKINS_SEEN, PIT_SEEN, FALL_SCREAM } from './lines';
import { playSound } from '../../../m1/game/platform/audio';

const { x0, x1 } = SECTIONS.town;
/** The town's ladders (layout.ts), as the ladders want them: each up to the ledge it's for, stepped off onto it. */
const TOWN_LADDERS: LadderDef[] = LADDERS.map(([rx, bottom, top, , offX]) => ({ x: X(rx), top: Y(top), bottom: Y(bottom), ledge: { x: X(rx + offX), y: Y(top) } }));
const pick = pickLine;

export const town: SpookySection = {
  id: 'town', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, GROUND.map(([a, ha, b, hb, surface]) => ({
      x1: X(a), y1: Y(ha), x2: X(b), y2: Y(hb), surface,
      ...(surface === 'stairs' ? { steps: { n: 20 } } : {}),
    }) as never));
    for (const [rx, h, w] of LEDGES) ledge(state, X(rx), Y(h), w, { hidden: true, tag: 'town' });
    for (const [rx, top, w, base] of SOLIDS) solid(state, X(rx), Y(top), w, top - base, { hidden: true, tag: 'town' });
    buildRides(state);
    endWalls(state, 'town');
    townOf(state);
    ENEMIES.forEach(([kind, rx, h], i) => {
      // (on the ground, or the stairs, wherever that is under it; a flyer, a perch: where it's put)
      const ground = profileYAt(state.groundRuns, X(rx)) ?? GY;
      const air = kind === 'm2:town_bat' || kind === 'm2:town_witch' || kind === 'm2:town_crow';
      const e = makeKindEnemy(kind as EnemyKind, X(rx), air ? Y(h) : Math.min(ground, Y(h)));
      // (never put down in a ride's way, on its track or over the pit: moved on, clear of it; a flyer up over one is fine)
      const unsafe = () => townDanger(e, e.pos.x) || (!air && profileYAt(state.groundRuns, e.pos.x + e.width / 2) === undefined);
      for (let n = 0; n < 40 && unsafe(); n++) { e.pos.x += 40; const g = profileYAt(state.groundRuns, e.pos.x + e.width / 2); if (!air && g !== undefined) e.pos.y = g - e.height; }
      if (import.meta.env.DEV && e.pos.x !== X(rx) - e.width / 2) console.warn(`town: ${kind} at ${rx} moved clear of a ride to ${Math.round(e.pos.x + e.width / 2 - x0)}`);
      e.homeX = e.pos.x; e.homeY = e.pos.y; e.initialY = e.pos.y;
      e.variant = (i * 7 + rx) % 13;
      state.enemies.push(e);
    });
    for (const [rx, h, type] of PICKUPS) state.pickups.push({ id: `town-${rx}`, pos: { x: X(rx) - 10, y: Y(h) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 1e9 });
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, t = townOf(state);
    controls = updateLadders(ctx, TOWN_LADDERS, controls);
    const rx = p.pos.x + p.width / 2 - x0, onGround = p.pos.y + p.height > GY - 700;
    updateLobbed(ctx);
    updateRides(ctx);
    // What he's got to say about it (once each, each in its turn)
    const once = (k: string, lines: string[]) => { if (!t.said[k]) { t.said[k] = true; meatheadSays(state, pick(lines), true); } };
    if (!p.inCutscene && p.health > 0 && onGround) {
      if (state.checkpoint === 0 && rx < 600 && state.frame > 60) once('arrive', ARRIVE);
      if (rx > 700 && rx < 2000) once('elevator', ELEVATOR_SEEN);
      for (const r of RIDES) if (Math.abs(rx - r.x) < 220) once(`ride-${r.id}`, RIDE_LINES[r.id]);
      if (rx > STAIRS.a0 - 350 && rx < STAIRS.a0) once('stairs', STAIRS_LINES);
      if (rx > STAIRS.land1 - 200 && rx < STAIRS.land1 + 200) once('elevator2', ELEVATOR_AGAIN);
      // (riding the train out over the moat; bucked off the pony; the first pumpkin coming down at him)
      if (rx > MOAT.a + 60 && rx < MOAT.b - 60 && p.pos.y + p.height < GY - 30) once('train', TRAIN_RIDE);
      if ((t.rides?.pony.buck ?? 99) === 6) once('pony', PONY_LAUNCHED);
      if (t.pumpkins.length && rx > STAIRS.a0 - 300) once('pumpkins', PUMPKINS_SEEN);
      if (rx > MOAT.a - 320 && rx < MOAT.b + 320) once('pit', PIT_SEEN);
    }
    // (over the edge into the pit: the scream, going away down into the dark; once a fall)
    if (p.isGrounded) t.said.falling = false;
    else if (!t.said.falling && rx > MOAT.a && rx < MOAT.b && p.pos.y + p.height > GY + 30) {
      t.said.falling = true;
      meatheadSays(state, pick(FALL_SCREAM), false);
      playSound('whoosh', 0.8, -8);
    }
    // Up the stairs and in at the castle's door (the end of the town: on to the castle's start)
    runExits(state, endExits('town'));
    return controls;
  },
  drawBackdrop: (c, state) => { drawTownBackdrop(c, state); return true; },
  drawBack: (c, state) => { drawTownBack(c, state); drawLadders(c, state, TOWN_LADDERS); },
  drawFront: (c, state) => { drawPumpkins(c, state); drawLobbed(c, state); },
  // (near the pit, the camera sits higher on him: more of the drop on screen, so it reads as no bottom at all)
  cameraRow: (state) => {
    const px = state.player.pos.x + state.player.width / 2, d = Math.max(0, X(MOAT.a) - px, px - X(MOAT.b));
    return 550 - 220 * Math.max(0, Math.min(1, 1 - d / 700));
  },
  outdoors: () => 1,
  lamps: () => townLamps(),
};
