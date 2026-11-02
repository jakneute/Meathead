// THE JUNGLE'S HIDDEN HEALTH: a MAX HEALTH find in a cave under the gorge's cliff, behind its falls (the owner, 2026-11-01:
// "at the vines at the waterfall, put in a cave to the left you can see if you go downwards on the longer vines. put in
// some tricky vine platforms the player needs to navigate as they go downwards into a cave then rightwards, behind the
// waterfall they just passed. the cannon at the end of the sequence will shoot them to the point after the vines.")
//
//   THE TELL: the gorge's first long vine (7200) hangs by the overlook's cliff. Climbed down toward its end, a dark mouth
//     shows in the cliff below-left (mist drifting out of it, a glint in the dark): out of sight from up top.
//   THE WAY IN: let go off that vine toward it (or drop off the overlook's end and steer back in) onto the shelf in its
//     mouth. Inside, a tall cavern cut down into the cliff (CAVE): four hanging vines down it, zigzagging left and right
//     (CAVE_VINES: each a pumped swing and a well-timed letting go from the one above), then a hard swing right off the
//     last onto the ledge into the passage. A fall lands on the cavern's floor (THE BASE: no harm), where a climbing vine
//     up its left wall goes back up to a perch by the first vine, for another go.
//   THE PASSAGE: from that ledge right, under the gorge, behind the falls (their overflow pours over its front, in front
//     of him: art/hidden.ts), the HEART CANISTER at the far end (a MAX HEALTH find: upgrades/healthAward.ts, once a
//     save; the card; a line), and the RETURN CANNON (upgrades/returnCannon.ts, the Ben lair's jungle look): any time,
//     up through a crack in the ceiling and out of the plunge pool on the arc to the far bank, just past the vines
//     (short of JAGUAR COUNTRY's checkpoint and the canopy's first branch: nobody there).
//   FALLING INTO THE GORGE is still a fall death, as ever: anything down in the gorge below the plunge pool's level
//     (KILL_FEET) that isn't in the passage is killed the gorge's way (the camera's let go of him: the engine's own fall).
//     The cave's floors under the gorge are tagged 'seabed' (the camera doesn't head down to them as he falls).
//
// Nothing's kept but the find (the save). A death in here: back at THE GORGE's checkpoint, up on the overlook.

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

const X = (rx: number) => SECTIONS.jungle.x0 + rx;

// ---------------------------------------------------------------------------------------------------------------
// Where (world; heights are world y, GY the ground line)

/** The cavern: its inside (a..b), the cliff's face (wall: the overlook's end), its ceiling, the mouth's top (the
 *  opening in the face, down to the shelf), the shelf in the mouth, the perch up its left wall (the climb back's top),
 *  its floor (THE BASE). */
export const CAVE = {
  a: X(6600), b: X(6970), wall: X(7000),
  ceil: 300, mouthTop: 330,
  shelf: { a: X(6880), y: 560 },
  perch: { b: X(6690), y: 460 },
  base: 1500,
};
/** The passage under the gorge: from the ledge in the cavern's right wall (ledge) to the far bank's rock (b); its
 *  ceiling (under the slab of rock it's under: slabTop), its floor. */
export const PASSAGE = { ledge: X(6910), a: X(7000), b: X(7780), slabTop: 1000, ceil: 1060, floor: 1240 };
/** The lip over the way into the passage (in off the cavern's right wall). */
export const OVERHANG = { a: X(6890), y: PASSAGE.ceil - 30 };
/** The plunge pool's level at the foot of the gorge (the rock under the gorge is painted from here down). */
export const POOL_Y = GY + 255;
/** Down in the gorge this far (feet) and not in the passage: fallen. */
const KILL_FEET = GY + 320;
/** The heart canister (on its rock), the cannon, the falls' overflow pouring over the passage's front. */
export const HEART_X = X(7520), CANNON_X = X(7660);
export const FALLS = { a: X(7300), b: X(7470) };
/** Out of the plunge pool, on to the far bank just past the vines (short of the canopy's first branch, which would
 *  catch the arc; nobody about). */
const EXIT = { x: X(7700), y: GY + 170 }, DEST = { x: X(7812), y: GY };
/** The find, in the save (one per save). */
export const HEALTH_LAND = 'adventure', HEALTH_ID = 'health-falls';

const sw = (rx: number, y: number, len: number): VineDef => ({ x: X(rx), y, len, kind: 'swing' });
/** Down the cavern: four hanging vines, zigzagging (each off a root out of the rock), and the climb back up its left
 *  wall from the base to the perch. After the land's own (VINES): their indices follow on from those. */
export const CAVE_VINES: VineDef[] = [
  sw(6820, CAVE.ceil + 15, 250),
  sw(6680, 560, 200),
  sw(6840, 790, 190),
  sw(6680, 1010, 170),
  { x: X(6618), y: CAVE.perch.y, len: CAVE.base - CAVE.perch.y, kind: 'climb', top: { x: X(6650), y: CAVE.perch.y } },
];

// ---------------------------------------------------------------------------------------------------------------
// The rock

/** Cuts the cave out of the overlook's rock and puts down its floors, walls and ceilings (the jungle's build). */
export const buildHidden = (state: GameState) => {
  const ox = X(5300), oy = GY - 460;
  const i = state.blocks.findIndex(b => b.type === 'ground' && b.x === ox && b.y === oy);
  if (i < 0) return;
  state.blocks.splice(i, 1);
  const B = (x0: number, y0: number, x1: number, y1: number, extra: Partial<Block> = {}) =>
    state.blocks.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, type: 'ground', hidden: true, ...extra } as Block);
  const deep = 1900;
  // (the overlook: all of it left of the cavern, its roof over the cavern)
  B(ox, oy, CAVE.a, deep);
  B(CAVE.a, oy, CAVE.wall, CAVE.ceil);
  // (the cliff's face round the mouth: its lip down to the mouth's top, the shelf in the mouth, the wall under it to the
  // passage's ceiling)
  B(CAVE.b, CAVE.ceil, CAVE.wall, CAVE.mouthTop);
  B(CAVE.shelf.a, CAVE.shelf.y, CAVE.wall, CAVE.shelf.y + 40);
  B(CAVE.b, CAVE.shelf.y + 40, CAVE.wall, PASSAGE.ceil);
  // (a lip of it over the way into the passage: a fling too far off the second vine fetches up on it, not on the ledge
  // below: no skipping the last two)
  B(OVERHANG.a, OVERHANG.y, CAVE.b, PASSAGE.ceil);
  // (the perch up the left wall, the climb back's top)
  B(CAVE.a, CAVE.perch.y, CAVE.perch.b, CAVE.perch.y + 40);
  // (the base, and the ledge into the passage)
  B(CAVE.a, CAVE.base, PASSAGE.ledge, deep);
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

interface Hidden { cannon: Cannon; card: HealthCard | null; said: Record<string, boolean> }
const hidOf = (state: GameState) => sectionState<Hidden, string>(state, 'jungleHidden', () => ({ cannon: newCannon(), card: null, said: {} }));
export const hiddenCannon = (state: GameState) => hidOf(state).cannon;
/** The card's up, or he's in (or flying out of) the cannon: the vines leave him be. */
export const hiddenBusy = (state: GameState) => { const h = hidOf(state); return !!h.card || cannonBusy(h.cannon); };
/** The find's still lying there (not got on this save, nor this visit). */
export const heartThere = () => !healthWon(HEALTH_LAND, HEALTH_ID);

type Pants = 'clean' | 'shitty' | 'nude';
const pantsOf = (state: GameState): Pants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

const inCavern = (cx: number, feet: number) => cx > CAVE.a - 30 && cx < CAVE.wall + 10 && feet > CAVE.mouthTop && feet < CAVE.base + 10;
const inPassage = (cx: number, feet: number) => cx > PASSAGE.ledge && cx < PASSAGE.b && feet > PASSAGE.ceil && feet < PASSAGE.floor + 10;
/** Where his feet go on screen down here (the cavern: low enough to see the next vine down; the passage: its middle). */
export const hiddenRow = (state: GameState): number | undefined => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (inPassage(cx, feet)) return 420;
  if (inCavern(cx, feet)) return 300;
  return undefined;
};
/** The camera's down in here (the front plants, at the ground line, kept off it). */
export const hiddenView = (state: GameState) => state.camera.y > 150 && state.camera.x + 800 > CAVE.a - 500 && state.camera.x < PASSAGE.b + 100;

// ---------------------------------------------------------------------------------------------------------------
// Each frame (after the vines)

export const updateHidden = (ctx: FrameContext, c: Controls, firstCaveVine: number): Controls => {
  const { state } = ctx, p = state.player, h = hidOf(state);
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
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
  // Fallen into the gorge (below the pool's level, not in the passage): the gorge's fall, as ever
  if (cx > PASSAGE.a && cx < PASSAGE.b && feet > KILL_FEET && feet < PASSAGE.ceil + 10 && p.health > 0 && state.deathTimer <= 0) {
    // (put down past everything under the gorge, out of the camera's reach: the engine's own check takes it from there)
    p.pos.y = Math.max(state.camera.y + 1001, 2100); p.vel.x = 0;
    return c;
  }
  // On one of the cavern's vines: the camera low enough to see the next one down
  const j = jungleOf(state);
  if (j.hold.on >= firstCaveVine) state.cameraRestY = feet - 300;
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
