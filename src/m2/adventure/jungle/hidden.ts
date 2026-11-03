// THE JUNGLE'S HIDDEN HEALTH: a MAX HEALTH find in a cave under the gorge's cliff, behind its falls (the owner, 2026-11-01:
// "at the vines at the waterfall, put in a cave to the left you can see if you go downwards on the longer vines. put in
// some tricky vine platforms the player needs to navigate as they go downwards into a cave then rightwards, behind the
// waterfall they just passed. the cannon at the end of the sequence will shoot them to the point after the vines."; and
// 2026-11-03: "the cave should have some obstacles across bottomless pits and clever manipulation of the vines to get to
// where you need to go.")
//
//   THE TELL: the gorge's first long vine (7200) hangs by the overlook's cliff. Climbed down toward its end, a dark mouth
//     shows in the cliff below-left (mist drifting out of it, a glint in the dark): out of sight from up top.
//   THE WAY IN: let go off that vine toward it (or drop off the overlook's end and steer back in) onto the shelf in its
//     mouth: THE FALLS CAVE's checkpoint (CAVE_CP: a death in here starts him again on the shelf; out of the cave
//     again, the gorge's is his again, so jumping out of the mouth into the gorge is always a way back to the overlook).
//   THE GALLERY (going left, CAVE.hi): ledges along it with bottomless pits between (PITS_HI), a vine over each.
//     1. Down off the shelf onto the first ledge, a stalactite over it (DRIPS: it shakes and drips, then drops: taught
//        over solid rock). The first pit: one vine (V1), an easy swing.
//     2. The second ledge, a stalactite over it too (it comes down while he lines up the next). The second pit, wide:
//        its vine (V2) is caught high off the jump, and from up there the far ledge is out of reach: CLIMB DOWN it to
//        lengthen the swing. The far ledge's face below its lip is thorny roots (THORNS: come in low and it's them).
//     3. The far ledge, and the SHAFT down past it: a climbing vine (V3) down the shaft into the dark (dropped down it
//        without the vine, it's a pit like the rest). RIDE IT DOWN into the lower tunnel and jump off onto the pillar.
//   THE TUNNEL (going right, CAVE.lo): three vines chained across the dark (V4, V5, V6), no ledge between.
//     4. A stalactite over V4's swing: no dawdling on it.
//     5. Thorny roots grow up out of the dark under V5's back swing: caught low (it's caught low off V4), CLIMB UP it to
//        shorten the swing, or it swings him back into them.
//     6. The falls' spray (SPRAY): every few seconds it blasts back down the passage and out over the last gap, shoving
//        whatever's in the air or on V6 back left (a hiss and a mist first). Time the last swing for the calm; a
//        stalactite over V6 too.
//   THE PASSAGE: from the ledge right, under the gorge, behind the falls (their overflow pours over its front, in front
//     of him: art/hidden.ts), the HEART CANISTER at the far end (a MAX HEALTH find: upgrades/healthAward.ts, once a
//     save; the card; a line), and the RETURN CANNON (upgrades/returnCannon.ts, the Ben lair's jungle look): any time,
//     up through a crack in the ceiling and out of the plunge pool on the arc to the far bank, just past the vines
//     (short of JAGUAR COUNTRY's checkpoint and the canopy's first branch: nobody there).
//   THE PITS: bottomless (no floor under any of them). Down one far enough, he's put out of the camera's reach and the
//     engine's own fall takes it from there (like the gorge's). FALLING INTO THE GORGE is the same as ever: anything
//     down in the gorge below the plunge pool's level (KILL_FEET) that isn't in the passage.
//
// Nothing's kept but the find (the save): the stalactites are all back each go.
//
// The camera's held still in the gallery and in the tunnel (each fits a screen; the dark under the pits never shows a
// bottom), and follows him down the shaft.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { sectionState, meatheadSays } from '../section';
import { SECTIONS, GY } from '../geometry';
import type { VineDef } from './vines';
import { jungleOf } from './state';
import { CAVE_FOUND, HEART_GOT } from './lines';
import { awardHealth, healthWon, openHealthCard, tickHealthCard, type HealthCard } from '../../upgrades/healthAward';
import { maxHealth } from '../../upgrades/state';
import { makeCannon, updateCannon, cannonBusy, cannonCeilingX, type Cannon } from '../../upgrades/returnCannon';
import { makeTraps, updateTraps, type Traps } from './caveTraps';

const X = (rx: number) => SECTIONS.jungle.x0 + rx;

// ---------------------------------------------------------------------------------------------------------------
// Where (world; heights are world y, GY the ground line)

/** The whole cave: its inside, left to right (a..b), the cliff's face (wall: the overlook's end), the mouth's hall's
 *  ceiling, the mouth's top (the opening in the face, down to the shelf), the shelf in the mouth, the bottom of it all
 *  (base: under the pits, for its bounds; there's no floor down there); the hall's left (open up to its ceiling from
 *  here to the face); the gallery's ceiling and floor (hi), the tunnel's (lo). */
export const CAVE = {
  a: X(5760), b: X(6970), wall: X(7000),
  ceil: 300, mouthTop: 330,
  shelf: { a: X(6880), y: 560 },
  base: 1500,
  hall: X(6600),
  hi: { ceil: 370, floor: 630 },
  lo: { ceil: 980, floor: 1240 },
};
/** The shaft down from the gallery to the tunnel: from the left wall to here. */
export const SHAFT_B = X(5850);
/** The gallery's ledges [from, to] (each at CAVE.hi.floor), and the pits between them. */
export const LEDGES_HI: [number, number][] = [[X(5850), X(5950)], [X(6280), X(6400)], [X(6640), X(6880)]];
export const PITS_HI: [number, number][] = [[X(5950), X(6280)], [X(6400), X(6640)]];
/** The rock under the gallery (the tunnel's ceiling): down to here it's the pits' dark, under it rock. */
export const BAND_Y = 940;
/** The pillar up out of the dark in the tunnel, the landing under the shaft (at CAVE.lo.floor). (The passage's ledge is
 *  the other one.) */
export const PILLARS_LO: [number, number][] = [[X(5890), X(6010)]];
/** The passage under the gorge: from the ledge at the tunnel's end (ledge) to the far bank's rock (b); its ceiling
 *  (under the slab of rock it's under: slabTop), its floor. */
export const PASSAGE = { ledge: X(6910), a: X(7000), b: X(7780), slabTop: 1000, ceil: 1060, floor: 1240 };
/** The plunge pool's level at the foot of the gorge (the rock under the gorge is painted from here down). */
export const POOL_Y = GY + 255;
/** Down in the gorge this far (feet) and not in the passage: fallen. */
const KILL_FEET = GY + 320;
/** Down a pit this far (feet: the gallery's, the tunnel's): fallen. */
const PIT_FALL = 170;
/** The heart canister (on its rock), the cannon, the falls' overflow pouring over the passage's front. */
export const HEART_X = X(7520), CANNON_X = X(7660);
export const FALLS = { a: X(7300), b: X(7470) };
/** Out of the plunge pool, on to the far bank just past the vines (short of the canopy's first branch, which would
 *  catch the arc; nobody about). */
const EXIT = { x: X(7700), y: GY + 170 }, DEST = { x: X(7812), y: GY };
/** The find, in the save (one per save). */
export const HEALTH_LAND = 'adventure', HEALTH_ID = 'health-falls';
/** THE FALLS CAVE's checkpoint, on the shelf in the mouth (between the gorge's and JAGUAR COUNTRY's: layout.ts), and
 *  the gorge's (his again the moment he's out of the cave). */
export const CAVE_CP = 4.5, GORGE_CP = 4;
export const CAVE_SPAWN = { x: X(6950), y: CAVE.shelf.y };

const sw = (rx: number, y: number, len: number): VineDef => ({ x: X(rx), y, len, kind: 'swing' });
/** The cave's vines (each off a root out of the rock): V1 and V2 over the gallery's pits, V3 the climb down the shaft
 *  (run up over the far ledge's lip: stood there, down takes hold of it), V4 to V6 across the tunnel. After the land's
 *  own (VINES): their indices follow on from those. (Every gap's reach worked out from vines.ts and the player's
 *  physics, with room to spare: the reach check in the commit that made them.) */
export const CAVE_VINES: VineDef[] = [
  sw(6520, CAVE.hi.ceil + 15, 190),
  sw(6150, CAVE.hi.ceil + 15, 235),
  { x: X(5810), y: CAVE.hi.floor, len: 530, kind: 'climb', top: { x: X(5885), y: CAVE.hi.floor } },
  sw(6120, CAVE.lo.ceil + 10, 190),
  sw(6360, CAVE.lo.ceil + 10, 230),
  sw(6640, CAVE.lo.ceil + 10, 210),
];

// ---------------------------------------------------------------------------------------------------------------
// The rock

/** Cuts the cave out of the overlook's rock and puts down its ledges, walls and ceilings (the jungle's build). */
export const buildHidden = (state: GameState) => {
  const ox = X(5300), oy = GY - 460;
  const i = state.blocks.findIndex(b => b.type === 'ground' && b.x === ox && b.y === oy);
  if (i < 0) return;
  state.blocks.splice(i, 1);
  const B = (x0: number, y0: number, x1: number, y1: number, extra: Partial<Block> = {}) =>
    state.blocks.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, type: 'ground', hidden: true, ...extra } as Block);
  const deep = 1900;
  // (the overlook: all of it left of the cave, its roof over the gallery and over the hall)
  B(ox, oy, CAVE.a, deep);
  B(CAVE.a, oy, CAVE.hall, CAVE.hi.ceil);
  B(CAVE.hall, oy, CAVE.wall, CAVE.ceil);
  // (the cliff's face round the mouth: its lip down to the mouth's top, the shelf in the mouth and the rock under it, the
  // wall over the passage's mouth)
  B(CAVE.b, CAVE.ceil, CAVE.wall, CAVE.mouthTop);
  B(CAVE.shelf.a, CAVE.shelf.y, CAVE.wall, CAVE.lo.ceil);
  B(CAVE.b, CAVE.lo.ceil, CAVE.wall, PASSAGE.ceil);
  // (the gallery's ledges, the rock under them down to the tunnel; under the pits, the rock from where their dark ends
  // ('seabed': the camera never heads down to it after him falling))
  for (const [a, b] of LEDGES_HI) B(a, CAVE.hi.floor, b, CAVE.lo.ceil);
  B(SHAFT_B, BAND_Y, CAVE.shelf.a, CAVE.lo.ceil, { tag: 'seabed' });
  // (the tunnel: the pillar, the passage's ledge; nothing under the rest)
  for (const [a, b] of PILLARS_LO) B(a, CAVE.lo.floor, b, deep);
  B(PASSAGE.ledge, PASSAGE.floor, PASSAGE.a, deep);
  // (under the gorge: the passage's floor, and the slab over it, a crack through it where the cannon's shot goes; both
  // 'seabed', so the camera never heads down to them after anything falling into the gorge)
  B(PASSAGE.a, PASSAGE.floor, PASSAGE.b, deep, { tag: 'seabed' });
  const gx = crackX();
  B(PASSAGE.a, PASSAGE.slabTop, gx - 46, PASSAGE.ceil, { tag: 'seabed' });
  B(gx + 46, PASSAGE.slabTop, PASSAGE.b, PASSAGE.ceil, { tag: 'seabed' });
};
const newCannon = () => makeCannon(CANNON_X, PASSAGE.floor, EXIT, DEST);
/** Where the cannon's shot goes up through the passage's ceiling (the crack in it). */
export const crackX = () => { const cn = newCannon(); return Math.round((cannonCeilingX(cn, PASSAGE.ceil) + cannonCeilingX(cn, PASSAGE.slabTop)) / 2); };

// ---------------------------------------------------------------------------------------------------------------
// State (keyed on state.stage: rebuilt with the stage on every death)

interface Hidden { cannon: Cannon; card: HealthCard | null; said: Record<string, boolean>; traps: Traps }
const hidOf = (state: GameState) => sectionState<Hidden, string>(state, 'jungleHidden', () => ({
  cannon: newCannon(), card: null, traps: makeTraps(),
  // (back on the shelf from dying in here: he's found it already)
  said: { cave: state.checkpoint === CAVE_CP },
}));
export const hiddenCannon = (state: GameState) => hidOf(state).cannon;
export const hiddenTraps = (state: GameState) => hidOf(state).traps;
/** The card's up, or he's in (or flying out of) the cannon: the vines leave him be. */
export const hiddenBusy = (state: GameState) => { const h = hidOf(state); return !!h.card || cannonBusy(h.cannon); };
/** The find's still lying there (not got on this save, nor this visit). */
export const heartThere = () => !healthWon(HEALTH_LAND, HEALTH_ID);

type Pants = 'clean' | 'shitty' | 'nude';
const pantsOf = (state: GameState): Pants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** In the cave (the mouth's hall, the gallery, the shaft, the tunnel, down its pits), or in the passage. */
const inCavern = (cx: number, feet: number) => cx > CAVE.a - 30 && cx < CAVE.wall + 10 && feet > CAVE.mouthTop && feet < CAVE.base + 10;
const inPassage = (cx: number, feet: number) => cx > PASSAGE.ledge && cx < PASSAGE.b && feet > PASSAGE.ceil && feet < PASSAGE.floor + 10;
export const inCave = (state: GameState) => { const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height; return inCavern(cx, feet) || inPassage(cx, feet); };
/** Where the camera's top rests down here: the gallery's (the hall's ceiling to just under its pits' rims), the tunnel's
 *  (its ceiling to well down its pits), following him down the shaft between; the passage's, its middle. */
const UP_REST = 200, LO_REST = 900;
const restFor = (cx: number, feet: number) => {
  if (inPassage(cx, feet)) return feet - 420;
  if (cx > SHAFT_B + 10 && feet < CAVE.lo.ceil + 30) return UP_REST;
  if (cx <= SHAFT_B + 10 && feet < CAVE.lo.floor - 60) return Math.max(UP_REST, Math.min(LO_REST, feet - 300));
  return LO_REST;
};
/** Where his feet go on screen down here (so the camera's top rests where restFor has it). */
export const hiddenRow = (state: GameState): number | undefined => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (!inCavern(cx, feet) && !inPassage(cx, feet)) return undefined;
  return feet - restFor(cx, feet);
};
/** The camera's down in here (the front plants, at the ground line, kept off it). */
export const hiddenView = (state: GameState) => state.camera.y > 150 && state.camera.x + 800 > CAVE.a - 500 && state.camera.x < PASSAGE.b + 100;
/** In the cave, the camera's kept off what's left of it (the overlook's face, outside). */
export const HIDDEN_CAM_MIN = CAVE.a - 60;
export const hiddenCameraMin = (state: GameState) => (inCave(state) ? HIDDEN_CAM_MIN : undefined);

// ---------------------------------------------------------------------------------------------------------------
// Each frame (after the vines)

export const updateHidden = (ctx: FrameContext, c: Controls, firstCaveVine: number): Controls => {
  const { state } = ctx, p = state.player, h = hidOf(state);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // THE FALLS CAVE's checkpoint: his once he's stood on the shelf (coming the gorge's way, not back from further on);
  // out of the cave again, the gorge's is his again (walking the overlook past the shelf's x doesn't make it his)
  const here = inCavern(cx, feet) || inPassage(cx, feet);
  if (state.checkpoint === CAVE_CP && !here) state.checkpoint = GORGE_CP;
  else if (state.checkpoint === GORGE_CP && here && p.isGrounded && feet <= CAVE.shelf.y + 2 && cx > CAVE.shelf.a) state.checkpoint = CAVE_CP;
  // The card (the find's): him held till it's closed; then his line
  if (h.card) {
    p.inCutscene = true; p.vel.x = 0;
    if (tickHealthCard(h.card, state.frame)) { h.card = null; p.inCutscene = false; meatheadSays(state, pickLine(HEART_GOT[pantsOf(state)]), false); }
    return { ...NO_CONTROLS };
  }
  // The cannon: any time he's in the passage (and all through the shot)
  if (cannonBusy(h.cannon) || inPassage(cx, feet)) {
    c = updateCannon(ctx, h.cannon, c, {
      onExit: (st, x, y) => {
        playSound('splash', 0.9);
        for (let k = 0; k < 24; k++) st.particles.push({ pos: { x: x - 16 + Math.random() * 32, y: POOL_Y - 4 }, vel: { x: (Math.random() - 0.5) * 6, y: -3 - Math.random() * 6 }, life: 34, color: k % 3 ? 'rgba(220, 240, 248, 0.85)' : '#FFFFFF', size: 3 + Math.random() * 4 });
        void y;
      },
    });
    if (cannonBusy(h.cannon)) return c;
  }
  // (put down past everything, out of the camera's reach: the engine's own fall check takes it from there)
  const fallen = () => { p.pos.y = Math.max(state.camera.y + 1001, 2100); p.vel.x = 0; };
  const alive = p.health > 0 && state.deathTimer <= 0;
  // Fallen into the gorge (below the pool's level, not in the passage): the gorge's fall, as ever
  if (alive && cx > PASSAGE.a && cx < PASSAGE.b && feet > KILL_FEET && feet < PASSAGE.ceil + 10) { fallen(); return c; }
  // Down one of the cave's pits: the gallery's (into their dark), the tunnel's (anywhere off its ledges)
  const j = jungleOf(state), onCaveVine = j.hold.on >= firstCaveVine;
  if (alive && !onCaveVine) {
    if (feet > CAVE.hi.floor + PIT_FALL && feet < CAVE.lo.ceil && PITS_HI.some(([a, b]) => cx > a && cx < b)) { fallen(); return c; }
    if (feet > CAVE.lo.floor + PIT_FALL && cx > CAVE.a - 30 && cx < PASSAGE.ledge) { fallen(); return c; }
  }
  // The stalactites, the thorns, the spray
  updateTraps(ctx, h.traps, firstCaveVine);
  // The camera: held still in the gallery and the tunnel, following him down the shaft
  if (here && !inPassage(cx, feet)) state.cameraRestY = restFor(cx, feet);
  // First time in the mouth: his line
  if (!h.said.cave && feet <= CAVE.shelf.y + 2 && feet > CAVE.mouthTop && cx > CAVE.shelf.a - 10 && cx < CAVE.wall && p.isGrounded) {
    h.said.cave = true; meatheadSays(state, pickLine(CAVE_FOUND[pantsOf(state)]), false);
  }
  // The heart canister: walked into, it's his (once a save)
  if (heartThere() && !p.inCutscene && p.health > 0) {
    const hy = PASSAGE.floor - 64;
    if (Math.abs(cx - HEART_X) < 34 && p.pos.y < hy + 40 && feet > hy - 20) {
      if (awardHealth(HEALTH_LAND, HEALTH_ID)) {
        p.health = Math.max(p.health, maxHealth());
        for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2; state.particles.push({ pos: { x: HEART_X, y: hy }, vel: { x: Math.cos(a) * (2 + Math.random() * 3), y: Math.sin(a) * (2 + Math.random() * 3) }, life: 36, color: k % 3 ? '#F87171' : '#FDE68A', size: 3 + Math.random() * 3 }); }
        h.card = openHealthCard();
        p.inCutscene = true; p.vel.x = 0;
        return { ...NO_CONTROLS };
      }
    }
  }
  return c;
};
