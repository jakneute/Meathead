// REAL HELL: section 6 of Spooky Land. Down from the top of the clock tower, the drop into the real hell. At the bottom
// of the pit: the destroyed elevator, dead body parts splayed all over. A brief platforming stretch, then the sub-boss:
// a demon, a big fat tanky fucker who'd rather be doing something else (eating souls) than fight. He jumps around,
// quakes the room, tries to spike him with his pitchfork in various strikes: slow windups, big hurt if they connect
// (the pitchfork and the quakes are new hurt sources: hurt callouts and death lines). Beaten: "fuck this. daaaad, this
// mortal is hurting me", and he leaves. Then Satan shows up: "meathead. one of these days your soul will be mine
// forever. that day is not today." And a lava geyser launches him back up to earth (into Donnie's control room: the
// control section).
//
// Sub-boss rules: a big health + ammo refill before it; the arena locks its exit until he's dead (the way in stays
// open); never respawned once past. The demon and Satan get clean / shitty / naked variants where they react to him.
// No costumed park staff here (it's real hell).
//
// PLACEHOLDER (the skeleton's crude first pass): flat ground, a crude wrecked elevator, a few ledges, the arena's
// plaque-on-a-rock, the geyser at the right end (walk into it: on to the control room). The way back (left end) goes up
// to the top of the clock tower. Owner: see ../OWNERSHIP.md.

import type { SpookySection } from '../section';
import { layOwn, ledge, endWalls, endExits, runExits, postSign, groundBox, ledgeBox, box } from '../section';
import { SECTIONS, GY } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';

const { x0, x1 } = SECTIONS.hell;
const LEDGES: [number, number, number][] = [[x0 + 2000, GY - 120, 300], [x0 + 2500, GY - 220, 300], [x0 + 3000, GY - 140, 300], [x0 + 3600, GY - 240, 400]];
const ARENA_X = x0 + 6000;

export const hell: SpookySection = {
  id: 'hell', x0, x1,
  checkpoints: [
    { name: 'THE BOTTOM OF THE PIT', cp: 50, x: x0 + 200, y: GY },
    { name: 'THE DEMON', cp: 51, x: ARENA_X, y: GY },
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x1 + 200, y2: GY, surface: 'brimstone' }]);
    for (const [x, y, w] of LEDGES) ledge(state, x, y, w, { hidden: true });
    endWalls(state, 'hell');
  },
  update: (ctx, controls) => {
    runExits(ctx.state, endExits('hell'));
    return controls;
  },
  drawBackdrop: (c) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#3B0A05'); return true; },
  drawBack: (c) => {
    groundBox(c, x0 - 200, x1 + 200, GY, '#451A03', '#F97316');
    for (const [x, y, w] of LEDGES) ledgeBox(c, x, y, w, '#57260A', '#FB923C');
    // (the wrecked elevator, crude)
    box(c, x0 + 500, GY - 90, 160, 90, '#52525B');
    box(c, x0 + 520, GY - 70, 50, 40, '#18181B');
    postSign(c, x0 + 900, GY, 'ELEVATOR TO HELL', '#450A0A', '#FDBA74');
    postSign(c, ARENA_X - 300, GY, 'NO LOITERING', '#7F1D1D', '#FEF08A');
    // (the lava geyser, crude: on up to the control room)
    box(c, x1 - 120, GY - 200, 80, 200, '#F97316');
    box(c, x1 - 100, GY - 260, 40, 60, '#FDE047');
  },
};
