// THE LONG LADDER: one of the 5 hidden MAX AMMO finds (upgrades/SPEC.md: +10% ammo in every weapon). The owner's:
// "future land. ammo pickup. there's a stairway on top of the airlock obstacle that goes up and up and up. to the top
// ... nothing tricky here. just get the ammo pickup at the top then divekick down. whee! make sure you cannot go out of
// bounds." Then: "or rather, make it a ladder instead", "just a long ass metal gear solid 3 ladder. okay, maybe not
// that long".
//
//   THE WAY UP   two catwalks by the meteor shower's winch platform (layout.ts LEDGES) step him up onto the airlock
//                housing's roof (its lit lip: the housing's solid is just the slab now, index.ts). On the roof's left
//                end, one long brass ladder (moves/ladders.ts), straight up 1200 px: about 9 seconds of climbing
//                (charge + up rushes it), height marks on the truss beside it every 20 FT.
//   THE TOP      a little deck hung off the atom's roof steel, the find on it (an ammo can, a big brass round stood up
//                out of it, glowing): touch it, his for good (upgrades/ammoAward.ts: saved there and then), the YOU GOT
//                card (its buffer). Gone on revisits (the ladder and deck stay).
//   THE WAY DOWN off the deck's open right end: the whole housing roof under him, nothing on it. A dive kick from the
//                deck goes about 700 px across the drop and lands near the far truss ("WHEE!" the first time). He's
//                never hurt by a fall. Off the roof's left end, back down by the catwalks.
//   THE BOUNDS   a truss hung off the roof steel up the left (walled: it stops 200 px over the roof, the way in under
//                it), a truss stood on the roof's right end up to the roof steel (walled, down to the roof: no way off
//                the far end, past the airlocks), the roof steel over it all (solid, well over a jump off the deck).
//                The camera rides up with him (cameraRow), never far over the roof steel; the atom's dark dome (its
//                backdrop, lifted with him: art.ts) all round.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import type { Light } from '../../../m1/game/render/lighting';
import { pickLine } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { updateLadders, drawLadders, onLadder, type LadderDef } from '../../moves/ladders';
import { awardAmmo, ammoWon, openAmmoCard, tickAmmoCard, type AmmoCard } from '../../upgrades/ammoAward';
import { solid, meatheadSays } from '../section';
import { INK, box, rampOf, stamp, checker, steppedGlow, hazeBands } from '../../intro/art/kit';
import { truss, rivets, hazard, lamp } from './snes';
import { plate } from './signs';
import { A, AIRLOCK_TOP } from './layout';
import { WHEE, LADDER_DONE, type Dressed } from './lines';

export const AMMO_LAND = 'space', AMMO_ID = 'ammo-ladder';

/** The airlock housing's roof (the top of its slab: stood on). */
export const ROOF_Y = AIRLOCK_TOP - 74;
/** The ladder (its middle), its top (level with the deck), its foot on the roof. */
const LADDER_X = A + 3940, LADDER_TOP = ROOF_Y - 1200;
const LADDERS: LadderDef[] = [{ x: LADDER_X, top: LADDER_TOP, bottom: ROOF_Y, ledge: { x: LADDER_X + 36, y: LADDER_TOP } }];
/** The deck at the top (one-way, its lit lip), the find on it. */
const DECK = { x: A + 3958, w: 124, y: LADDER_TOP };
const FIND_X = A + 4052;
/** The roof steel's underside (solid from there up), the walls: the left one hung (the way in under it), the right one
 *  stood on the roof. */
const CEIL_Y = LADDER_TOP - 250, CEIL_TOP = CEIL_Y - 70;
const WALL_L = { x: A + 3872, w: 28, bottom: ROOF_Y - 200 };
const WALL_R = { x: A + 4840, w: 40 };
const SPAN = { x0: A + 3860, x1: A + 4900 };
/** Up in it (over the roof, between the walls). */
const inShaft = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  return cx > WALL_L.x && cx < WALL_R.x + WALL_R.w && p.pos.y + p.height < ROOF_Y - 40;
};

interface Climb { taken: boolean; card: AmmoCard | null; whee: boolean }
const ALL = new WeakMap<object, Climb>();
const climbOf = (state: GameState): Climb => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) { o = { taken: false, card: null, whee: false }; ALL.set(k, o); }
  return o;
};
/** The YOU GOT card's up (the section holds everything else meanwhile). */
export const climbCardUp = (state: GameState) => !!climbOf(state).card;
const here = (state: GameState) => !climbOf(state).taken && !ammoWon(AMMO_LAND, AMMO_ID);
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

/** Its blocks (every build, found or not): the deck, the walls, the roof steel. Hidden (painted by drawClimb). */
export const buildClimb = (state: GameState) => {
  solid(state, DECK.x, DECK.y, DECK.w, 14, { type: 'platform', oneWay: true, hidden: true, tag: 'atom-climb-deck' });
  solid(state, WALL_L.x, CEIL_TOP, WALL_L.w, WALL_L.bottom - CEIL_TOP, { hidden: true, tag: 'atom-climb-wall' });
  solid(state, WALL_R.x, CEIL_TOP, WALL_R.w, ROOF_Y - CEIL_TOP, { hidden: true, tag: 'atom-climb-wall' });
  solid(state, SPAN.x0, CEIL_TOP, SPAN.x1 - SPAN.x0, CEIL_Y - CEIL_TOP, { hidden: true, tag: 'atom-climb-ceiling' });
};

/** The camera's row while he's up in it: lower on the screen, so the roof steel's just in at the top. */
export const climbRow = (state: GameState): number | undefined => (inShaft(state) || onLadder(state) ? 400 : undefined);

/** First thing in the section's update (the ladder takes the controls it uses). The controls to go on with. */
export const updateClimb = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, cl = climbOf(state);
  // The card: him held, nothing passed on; shut, his line
  if (cl.card) {
    p.inCutscene = true; p.vel.x = 0;
    if (tickAmmoCard(cl.card, state.frame)) {
      cl.card = null; p.inCutscene = false;
      meatheadSays(state, pickLine(LADDER_DONE[dressed(state)]), true);
    }
    return { ...NO_CONTROLS };
  }
  const out = updateLadders(ctx, LADDERS, controls);
  const alive = p.health > 0 && !p.inCutscene && state.deathTimer <= 0, feet = p.pos.y + p.height;
  // The find
  if (here(state) && alive && !p.carried) {
    if (p.pos.x < FIND_X + 14 && p.pos.x + p.width > FIND_X - 14 && p.pos.y < DECK.y && feet > DECK.y - 40) {
      climbOf(state).taken = true;
      for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: FIND_X, y: DECK.y - 20 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 36, color: k % 3 ? '#FCD34D' : '#FFF7D6', size: 3, grav: 0.2 });
      if (awardAmmo(AMMO_LAND, AMMO_ID)) { cl.card = openAmmoCard(); p.inCutscene = true; p.vel.x = 0; return { ...NO_CONTROLS }; }
    }
  }
  // WHEE: a dive kick from way up (once a visit; again after he's climbed back up)
  if (alive && p.isDivekicking && !cl.whee && inShaft(state) && feet < ROOF_Y - 600) {
    cl.whee = true;
    meatheadSays(state, pickLine(WHEE[dressed(state)]), false);
  }
  if (cl.whee && onLadder(state) && feet < ROOF_Y - 600) cl.whee = false;
  return out;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn (behind him: in drawBack, after the backstage). All still parts stamped once; only the find's glow is live.

const STEEL = rampOf('#52525B'), DARKSTEEL = rampOf('#27272A');
const on = (state: GameState, x0: number, x1: number) => x1 > state.camera.x - 40 && x0 < state.camera.x + CANVAS_WIDTH + 40;
const onY = (state: GameState, y0: number, y1: number) => y1 > state.camera.y - 40 && y0 < state.camera.y + 640;

/** A tall thing stamped in slices (each its own canvas, only the ones in view drawn). */
const SLICE = 400;
const sliced = (c: CanvasRenderingContext2D, state: GameState, key: string, x: number, y0: number, w: number, y1: number, paint: (g: CanvasRenderingContext2D) => void) => {
  for (let y = y0; y < y1; y += SLICE) {
    const h = Math.min(SLICE, y1 - y);
    if (!onY(state, y, y + h)) continue;
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    stamp(c, `${key}:${y}`, x, y, w, h, g => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); paint(g); g.restore(); });
    c.restore();
  }
};

/** The left truss: hung off the roof steel, its foot capped (hazard striped) 200 over the roof; the ladder's brackets
 *  off it; the height marks (every 240 px: 20 FT, him six foot). */
const paintLeft = (g: CanvasRenderingContext2D) => {
  const x = WALL_L.x, w = WALL_L.w, top = CEIL_Y - 4, bot = WALL_L.bottom;
  truss(g, x, top, w, bot - top, '#57534E', true);
  // (the foot: a capped end, striped)
  box(g, x - 3, bot - 12, w + 6, 13, INK); hazard(g, x - 2, bot - 11, w + 4, 10, '#FACC15', '#1C1917', 6); box(g, x - 2, bot - 11, w + 4, 1, '#FEF08A');
  // (the ladder's standoffs, every so often: steel, bolted)
  for (let y = ROOF_Y - 80; y > LADDER_TOP + 30; y -= 120) {
    if (y > bot - 16) continue;
    box(g, x + w - 2, y - 1, LADDER_X - 14 - (x + w) + 4, 6, INK); box(g, x + w - 1, y, LADDER_X - 14 - (x + w) + 2, 4, STEEL[2]); box(g, x + w - 1, y, LADDER_X - 14 - (x + w) + 2, 1, STEEL[4]);
  }
};
/** The ladder's own foot brace (down at the roof, under the truss's end) and its plate. */
const paintFoot = (g: CanvasRenderingContext2D) => {
  for (const y of [ROOF_Y - 40, ROOF_Y - 140]) {
    box(g, WALL_L.x + 4, y - 1, LADDER_X - 14 - WALL_L.x - 2, 6, INK); box(g, WALL_L.x + 5, y, LADDER_X - 14 - WALL_L.x - 4, 4, STEEL[1]); box(g, WALL_L.x + 5, y, LADDER_X - 14 - WALL_L.x - 4, 1, STEEL[3]);
  }
};
/** The right truss: stood on the roof's right end, up to the roof steel; a base plate. */
const paintRight = (g: CanvasRenderingContext2D) => {
  const x = WALL_R.x, w = WALL_R.w;
  truss(g, x, CEIL_Y - 4, w, ROOF_Y - CEIL_Y + 4, '#57534E', true);
  box(g, x - 6, ROOF_Y - 8, w + 12, 8, INK); box(g, x - 5, ROOF_Y - 7, w + 10, 6, STEEL[2]); box(g, x - 5, ROOF_Y - 7, w + 10, 1, STEEL[4]);
  rivets(g, x - 2, x + w, ROOF_Y - 4, '#71717A', 8);
};
/** The roof steel: the atom's shell (dark ribbed plate, way up), a big girder under it, its lit underside's rivets. */
const paintCeiling = (g: CanvasRenderingContext2D) => {
  const x0 = SPAN.x0 - 40, x1 = SPAN.x1 + 40, w = x1 - x0;
  // (the shell, up into the dark: plates, ribs)
  const sh = 260, sy = CEIL_TOP - sh + 30;
  box(g, x0, sy, w, sh, DARKSTEEL[0]);
  for (let x = x0; x < x1; x += 80) { box(g, x, sy, 3, sh, INK); box(g, x + 3, sy, 1, sh, DARKSTEEL[2]); }
  for (let y = sy + 40; y < CEIL_TOP; y += 64) { box(g, x0, y, w, 2, INK); box(g, x0, y + 2, w, 1, DARKSTEEL[2]); }
  hazeBands(g, x0, sy, w, 120, '#000000', 0.8, 0, 4);
  // (the girder: an I-beam, inked, stepped, lit along its lower flange where the work lights catch it)
  const gy = CEIL_TOP, gh = CEIL_Y - CEIL_TOP;
  box(g, x0, gy - 1, w, gh + 2, INK);
  box(g, x0, gy, w, 10, STEEL[1]); box(g, x0, gy, w, 2, STEEL[3]);
  box(g, x0, gy + 10, w, gh - 22, STEEL[0]); checker(g, x0, gy + 10, w, 2, STEEL[1]);
  for (let x = x0 + 30; x < x1; x += 60) { box(g, x, gy + 12, 4, gh - 26, STEEL[1]); box(g, x, gy + 12, 1, gh - 26, STEEL[2]); }
  box(g, x0, CEIL_Y - 12, w, 12, STEEL[2]); box(g, x0, CEIL_Y - 12, w, 1, STEEL[4]); box(g, x0, CEIL_Y - 2, w, 2, STEEL[0]);
  rivets(g, x0 + 4, x1 - 4, CEIL_Y - 8, '#A1A1AA', 14); rivets(g, x0 + 4, x1 - 4, gy + 4, '#71717A', 14);
};
/** The deck: punched steel on a frame, a lit lip, hazard stripes on its kickplate, hung on two rods off the girder. */
const paintDeck = (g: CanvasRenderingContext2D) => {
  const { x, w, y } = DECK;
  for (const rx of [x + 8, x + w - 10]) { box(g, rx - 1, CEIL_Y, 4, y - CEIL_Y, INK); box(g, rx, CEIL_Y, 2, y - CEIL_Y, '#71717A'); box(g, rx - 3, CEIL_Y, 8, 4, INK); }
  box(g, x - 1, y - 1, w + 2, 22, INK);
  box(g, x, y, w, 12, STEEL[2]); box(g, x, y + 9, w, 3, STEEL[1]);
  for (let px = x + 6; px < x + w - 4; px += 10) { box(g, px, y + 4, 4, 3, STEEL[0]); box(g, px, y + 4, 4, 1, INK); }
  hazard(g, x, y + 13, w, 7, '#FACC15', '#1C1917', 6);
  // (its lit lip: stood on)
  box(g, x, y, w, 3, '#E4E4E7'); box(g, x, y, w, 1, '#FFFFFF');
  // (a rail on the ladder end only, the open end's open)
  box(g, x - 1, y - 40, 4, 40, INK); box(g, x, y - 40, 2, 40, '#A1A1AA');
};

/** The find: an olive ammo can, its lid open, a big brass round stood up out of it (the Hollywood find's look). */
const OL = rampOf('#5E6B30'), BR = rampOf('#C8961E'), CU = rampOf('#E07A2A');
const paintFind = (g: CanvasRenderingContext2D) => {
  box(g, -13, -15, 26, 16, INK);
  box(g, -12, -14, 3, 14, OL[4]); box(g, -9, -14, 13, 14, OL[3]); box(g, 4, -14, 5, 14, OL[2]); box(g, 9, -14, 3, 14, OL[1]);
  box(g, -12, -14, 24, 3, OL[2]); box(g, -12, -14, 24, 1, OL[4]);
  box(g, -12, -7, 24, 1, OL[0]); box(g, -12, -6, 24, 1, OL[3]);
  box(g, 8, -12, 3, 5, INK); box(g, 9, -11, 1, 3, BR[4]);
  for (const x of [-8, -4, 0]) { box(g, x, -4, 2, 3, '#FDE047'); box(g, x, -5, 1, 1, '#FDE047'); }
  box(g, -12, -18, 24, 4, INK); box(g, -11, -17, 22, 2, OL[2]);
  box(g, -5, -29, 10, 16, INK);
  box(g, -4, -28, 1, 14, BR[4]); box(g, -3, -28, 2, 14, BR[3]); box(g, -1, -28, 3, 14, BR[2]); box(g, 2, -28, 1, 14, BR[1]); box(g, 3, -28, 1, 14, BR[0]);
  box(g, -4, -17, 8, 2, BR[0]); box(g, -4, -18, 8, 1, BR[4]);
  const steps: [number, number][] = [[-29, 4], [-31, 4], [-33, 3], [-35, 2], [-36, 1]];
  for (const [y, hw] of steps) box(g, -hw - 1, y - 1, hw * 2 + 2, 3, INK);
  for (const [y, hw] of steps) { box(g, -hw, y, hw * 2, 2, CU[2]); box(g, -hw, y, 1, 2, CU[4]); box(g, hw - 1, y, 1, 2, CU[0]); }
  box(g, -1, -36, 1, 1, '#FFF1DC');
};

/** The height marks up the left truss (stenciled plates on it, facing the ladder). */
const MARKS = [1, 2, 3, 4, 5].map(k => ({ y: ROOF_Y - k * 240 + 30, t: `${k * 20} FT` }));

export const drawClimb = (c: CanvasRenderingContext2D, state: GameState) => {
  if (!on(state, SPAN.x0 - 60, SPAN.x1 + 60) || !onY(state, CEIL_TOP - 260, ROOF_Y + 10)) return;
  if (onY(state, CEIL_TOP - 240, CEIL_Y + 2)) stamp(c, 'atom-climb-ceiling', SPAN.x0 - 40, CEIL_TOP - 232, SPAN.x1 - SPAN.x0 + 80, CEIL_Y - CEIL_TOP + 234, paintCeiling);
  if (on(state, WALL_L.x - 10, LADDER_X + 20)) {
    sliced(c, state, 'atom-climb-left', WALL_L.x - 4, CEIL_Y - 6, LADDER_X - WALL_L.x - 8, WALL_L.bottom + 4, paintLeft);
    if (onY(state, ROOF_Y - 150, ROOF_Y)) stamp(c, 'atom-climb-foot', WALL_L.x, ROOF_Y - 150, LADDER_X - WALL_L.x - 10, 150, paintFoot);
    for (const m of MARKS) if (onY(state, m.y - 12, m.y + 12)) plate(c, `atom-climb-${m.t}`, WALL_L.x + WALL_L.w / 2, m.y, m.t, 'stencil', '#FDE047', '#1C1917', 3);
    if (onY(state, ROOF_Y - 260, ROOF_Y - 200)) plate(c, 'atom-climb-maint', WALL_L.x + WALL_L.w / 2 + 2, ROOF_Y - 232, 'MAINT.\nACCESS', 'stencil', '#E5E7EB', '#B91C1C', 3);
    // (work lamps on the truss, every so often, lit)
    for (let y = ROOF_Y - 340; y > LADDER_TOP; y -= 360) if (onY(state, y - 10, y + 10)) lamp(c, WALL_L.x + WALL_L.w + 6, y, 4, '#FEF9C3', true, 0);
  }
  if (on(state, WALL_R.x - 10, WALL_R.x + WALL_R.w + 10)) sliced(c, state, 'atom-climb-right', WALL_R.x - 6, CEIL_Y - 6, WALL_R.w + 12, ROOF_Y + 1, paintRight);
  if (onY(state, CEIL_Y - 4, DECK.y + 24)) stamp(c, 'atom-climb-deck', DECK.x - 4, CEIL_Y, DECK.w + 8, DECK.y - CEIL_Y + 24, paintDeck);
  drawLadders(c, state, LADDERS);
  if (here(state) && onY(state, DECK.y - 80, DECK.y + 10)) {
    const f = state.frame, bob = Math.round(Math.sin(f * 0.08) * 2), fy = DECK.y - 2 + bob;
    steppedGlow(c, FIND_X, fy - 18, 46 + Math.round(Math.sin(f * 0.12) * 4), '#FCD34D', 0.34, 0.04, 4);
    c.save(); c.translate(FIND_X, fy);
    stamp(c, 'atom-climb-find', -16, -40, 32, 44, paintFind);
    c.restore();
    // (a glint going round the round)
    const gk = (f % 90);
    if (gk < 12) { const gy = fy - 30 + gk; box(c, FIND_X - 4, gy, 8, 1, '#FFF7D6'); }
  }
};

/** Its lights (added to the atom's): the work lamps up the truss, the deck, the find. */
export const climbLights = (state: GameState): Light[] => {
  const out: Light[] = [];
  if (!on(state, SPAN.x0 - 200, SPAN.x1 + 200)) return out;
  for (let y = ROOF_Y - 340; y > LADDER_TOP; y -= 360) if (onY(state, y - 400, y + 400)) out.push({ x: WALL_L.x + WALL_L.w + 6, y, r: 260, a: 0.7, color: 'rgba(254, 249, 195, 0.08)' });
  if (onY(state, DECK.y - 300, DECK.y + 300)) out.push({ x: DECK.x + DECK.w / 2, y: CEIL_Y + 20, r: 240, a: 0.75, cone: 120, color: 'rgba(254, 249, 195, 0.08)' });
  if (here(state) && onY(state, DECK.y - 200, DECK.y + 200)) out.push({ x: FIND_X, y: DECK.y - 20, r: 90, a: 0.9, color: 'rgba(252, 211, 77, 0.2)' });
  return out;
};
