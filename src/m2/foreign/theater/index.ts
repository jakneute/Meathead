// CULTURES OF THE WORLD: the end of the streets, the sub-boss (owner: the theater agent). Walked into from Canada with
// no cut: the theater's front on the promenade, its street doors (the side wall's outside face fades as he goes in),
// THE LOBBY (the PA's welcome, the concessions, the posters, the big health and ammo before the house doors:
// checkpoint 101), THE HOUSE (the crowd in the seats, in front of everything, the whole time), up the steps onto THE
// STAGE: the show (show.ts: the volunteer, the eight showpieces cycling behind the curtain on the stage clock, only the
// living ones coming back, damage kept; the narrator's spin, the crowd's every reaction; the curtain call), then out
// through the stage-right wing door, down backstage, through the EXIT on to the helipad (DOORS.heli.start).
//
// Files: layout.ts (where everything is), lines.ts (every line, by voice), state.ts, talk.ts (one voice at a time),
// troupe.ts (the eight troupes and how each fights), robots.ts (the animatronics drawn), show.ts (the show itself),
// art.ts (the building, the stage, the sets, the curtain, the clock, the crowd).
//
// Sub-boss rules: open before it starts; both sides locked once it's on till it's over; never again once it's done
// (SHOW_MEMO; checkpoint 102 past it). Revisits differ: the marquee says SHOW CANCELED, the house is empty (popcorn
// left in the seats), the stage struck (the wrecks shoved in a pile upstage, in their fluid), the wing door open.
// Back from the helipad: backstage (DOORS.theater.end).

import { CANVAS_WIDTH } from '../../../m1/constants';
import type { ForeignSection } from '../section';
import { layOwn, endExits, runExits, meatheadSays, landVisit } from '../section';
import { pickLine } from '../../../m1/game/platform/speech';
import { x0, x1, X, GY, DOOR, LOBBY_A, HOUSE_DOOR, REFILL, STEPS_A, SA, WING_B, STEPS_B, STAGE_H, FY, HOUSE_ROW, CHECKPOINTS } from './layout';
import { buildShow, updateShow, showCam, theaterOf, showDone, drawShowHud } from './show';
import { narrate } from './talk';
import { drawTheaterBack, drawTheaterFront } from './art';
import { PA_LOBBY, PA_HOUSE, MH_LOBBY, MH_HOUSE } from './lines';

/** What's been said this go at the land (not again after a death: once a visit). */
const saidIn = new Map<string, number>();
const onceAVisit = (key: string, go: () => void) => { if (saidIn.get(key) === landVisit()) return; saidIn.set(key, landVisit()); go(); };

export const theater: ForeignSection = {
  id: 'theater', x0, x1,
  checkpoints: CHECKPOINTS,
  build: (state) => {
    layOwn(state, [
      { x1: x0, y1: GY, x2: X(STEPS_A), y2: GY, surface: 'hard' },
      { x1: X(STEPS_A), y1: GY, x2: X(SA), y2: FY, surface: 'hard', steps: { n: 3 } },
      { x1: X(SA), y1: FY, x2: X(WING_B), y2: FY, surface: 'hard' },
      { x1: X(WING_B), y1: FY, x2: X(STEPS_B), y2: GY, surface: 'hard', steps: { n: 3 } },
      { x1: X(STEPS_B), y1: GY, x2: x1 + 200, y2: GY, surface: 'hard' },
    ]);
    // (the right end: the backstage wall, past the EXIT)
    state.blocks.push({ x: x1, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: 'theater-end' });
    // (the big refill before the house doors: the sub-boss rule)
    state.pickups.push({ id: 'th-health', pos: { x: X(REFILL) - 30, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
    state.pickups.push({ id: 'th-ammo', pos: { x: X(REFILL) + 10, y: GY - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
    buildShow(state);
  },
  update: (ctx, controls) => {
    const { state } = ctx, T = theaterOf(state), p = state.player, rx = p.pos.x + p.width / 2 - x0;
    const out = updateShow(ctx);
    if (out) return out;
    // (the PA in the lobby and the house, once each; his line after it)
    if (!showDone(state) && p.health > 0 && !p.inCutscene) {
      if (rx > LOBBY_A + 60 && rx < HOUSE_DOOR) onceAVisit('lobby', () => narrate(T, pickLine(PA_LOBBY)));
      if (rx > 1000 && rx < 1250 && !T.paBusy) onceAVisit('fries', () => meatheadSays(state, pickLine(MH_LOBBY), true));
      if (rx > HOUSE_DOOR + 20 && rx < SA) onceAVisit('house', () => narrate(T, pickLine(PA_HOUSE), () => meatheadSays(state, pickLine(MH_HOUSE), true)));
    }
    // (the EXIT backstage: on to the helicopters)
    runExits(state, endExits('theater', { left: false }));
    return controls;
  },
  drawBack: (c, state) => drawTheaterBack(c, state),
  drawFront: (c, state) => drawTheaterFront(c, state),
  drawHud: (c, state) => drawShowHud(c, state),
  // (the camera held on the stage while the show's on; along the streets otherwise)
  cameraX: (state) => showCam(state),
  cameraRow: (state) => { const rx = state.player.pos.x + state.player.width / 2 - x0; return rx > HOUSE_DOOR - 120 && rx < STEPS_B + 40 ? HOUSE_ROW : undefined; },
  // (open air out front; indoors once he's through the doors)
  outdoors: (state) => Math.max(0, Math.min(1, (DOOR + 40 - (state.player.pos.x + state.player.width / 2 - x0)) / 80)),
};

void CANVAS_WIDTH; void STAGE_H;
