// THE MAX AMMO FIND (one of the 5 hidden ammo finds: upgrades/SPEC.md, +10% ammo in every weapon). Up the flood climb's
// second shaft the crane wire's track runs on a long way left past where its harness parks (layout.ts WIRES[1]
// `beyond`), out over the HOTEL HAPPYWOOD to a RIGGERS' PERCH hung off chains: ride the wire left (face left on it) and
// it takes him there; nothing else reaches it (the highest he can get from the hotel's scaffold is well under it). On
// the perch, the find: an ammo can with a big brass round standing up out of it, glowing. Touch it: his for good
// (upgrades/ammoAward.ts: the save's written there and then), the YOU GOT card (its buffer; the flood and everything
// else held while it's up). Shut it and THE RACE BACK: the flood comes up for the wire's low point (where it parks) in
// RACE_T frames at the least, so he has to get straight back on the wire and ride it right past there before the water
// gets him (or reel the cable in, up, to ride over it). Back up the shaft, safe: his line about the find. Spent (the
// revisit), no flood: the find (if it's still there) is just a find.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import type { Light } from '../../../m1/game/render/lighting';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { solid, meatheadSays } from '../section';
import { byPants } from '../blvd/kinds';
import { awardAmmo, ammoWon, openAmmoCard, tickAmmoCard, type AmmoCard } from '../../upgrades/ammoAward';
import { X, Y, R, GY, PERCH, AMMO_FIND_RX, AMMO_FIND_ID, RACE_T, RACE_TO } from './layout';
import { hvOf } from './state';
import { type Ctx, INK, box, STEEL, TRUSS, ramp6, hour, lip, chain, board, plain, still, seen, viewOf, topBack, underBack, hazard, SCAF_D } from './paint';
import { AMMO_FIND, AMMO_RACE } from './lines';

const LAND = 'hollywood';

interface Af { taken: boolean; card: AmmoCard | null; race: { end: number } | null }
const ALL = new WeakMap<object, Af>();
const afOf = (state: GameState): Af => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) { o = { taken: false, card: null, race: null }; ALL.set(k, o); }
  return o;
};
const here = (state: GameState) => !afOf(state).taken && !ammoWon(LAND, AMMO_FIND_ID);

/** The perch (its block: one-way, a lit lip). Every build, found or not. */
export const buildAmmoFind = (state: GameState) => {
  solid(state, X(PERCH.rx), Y(PERCH.h), PERCH.w, 16, { type: 'platform', oneWay: true, hidden: true, tag: 'havoc-perch' });
};

/** After the deadline the flood creeps on up at this (px a frame). */
const RACE_CREEP = 0.3;
/** The flood's rise this frame while the race is on, in place of its usual rubber band (null otherwise): up to the
 *  wire's low point right on the deadline, however close behind him it was (so the time's always the same), and on
 *  up slowly after that. */
export const raceRate = (state: GameState, h: number): number | null => {
  const r = afOf(state).race;
  if (!r) return null;
  return Math.max(RACE_CREEP, (RACE_TO - h) / Math.max(1, r.end - state.frame));
};

/** Each frame (before the hazards: the card holds them). Returns the controls to use while the card's up, else null. */
export const updateAmmoFind = (ctx: FrameContext, done: boolean): Controls | null => {
  const { state } = ctx, p = state.player, a = afOf(state), hv = hvOf(state);
  // The card: him held, nothing moving on; shut, the race back (or, no flood, just his line)
  if (a.card) {
    p.inCutscene = true; p.vel.x = 0;
    if (tickAmmoCard(a.card, state.frame)) {
      a.card = null; p.inCutscene = false;
      if (!done && hv.flood.on && !hv.flood.drain) {
        a.race = { end: state.frame + RACE_T };
        playSound('tsunami', 0.9, -2); playSound('rumble', 0.7, -10); shakeScreen(state, 8, 6);
        meatheadSays(state, pickLine(AMMO_RACE), true);
      } else meatheadSays(state, pickLine(byPants(state, AMMO_FIND)), true);
    }
    return { ...NO_CONTROLS };
  }
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, alive = p.health > 0 && !p.inCutscene && state.deathTimer <= 0;
  // The race: over once he's back past where the wire parks and up (or the flood's gone); then his line
  if (a.race && (!hv.flood.on || hv.flood.drain || (alive && R(cx) > 7170 && GY - feet > 700))) {
    a.race = null;
    if (alive) meatheadSays(state, pickLine(byPants(state, AMMO_FIND)), true);
  }
  // Grabbing it
  if (here(state) && alive && !p.carried) {
    const fx = X(AMMO_FIND_RX), fy = Y(PERCH.h);
    if (p.pos.x < fx + 14 && p.pos.x + p.width > fx - 14 && p.pos.y < fy && feet > fy - 36) {
      a.taken = true;
      for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: fx, y: fy - 20 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 36, color: k % 3 ? '#FCD34D' : '#FFF7D6', size: 3, grav: 0.2 });
      if (awardAmmo(LAND, AMMO_FIND_ID)) { a.card = openAmmoCard(); p.inCutscene = true; p.vel.x = 0; return { ...NO_CONTROLS }; }
    }
  }
  return null;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn (behind him). The perch: a steel grate deck clamped in a frame, hung off two chains from the fly system up out
// of sight, a lit lip (stood on), hazard stripes along its kickplate, RIGGERS ONLY on a board under it; its deck going
// back. The find: an olive ammo can, lid open, a big brass round standing up out of it (the pause screen's icon),
// glowing amber in stepped bands, bobbing a little, a glint going round. All of it painted once (still); only the
// glow's bands and the glint are live.

const paintPerch = (g: Ctx, w: number) => {
  const S = STEEL.map(c2 => hour(c2));
  // (the deck's face: punched steel, its holes, its joints)
  box(g, -1, -1, w + 2, 16, INK); box(g, 0, 0, w, 14, S[3]); box(g, 0, 10, w, 4, S[1]);
  for (let x = 6; x < w - 4; x += 10) { box(g, x, 5, 4, 3, S[0]); box(g, x, 5, 4, 1, INK); }
  for (let x = 0; x < w; x += 52) box(g, x, 0, 1, 14, S[1]);
  // (the kickplate under it: hazard stripes, inked)
  box(g, -1, 14, w + 2, 8, INK); hazard(g, 0, 15, w, 6, 0);
  // (the frame's ends: the shackles the chains hang off)
  for (const x of [4, w - 10]) { box(g, x - 1, -9, 8, 10, INK); box(g, x, -8, 6, 8, S[2]); box(g, x + 1, -7, 2, 2, S[5]); }
  // RIGGERS ONLY on a board hung under it (not a ledge: its top's tucked under the kickplate)
  board(g, w / 2, 33, ['RIGGERS ONLY'], plain(1, 1, '#18181B'), hour('#E8B820'), S, 3);
  lip(g, 0, 0, w);
};
const paintChains = (g: Ctx, w: number) => {
  for (const x of [7, w - 7]) chain(g, x, -720, -8, TRUSS.map(c2 => hour(c2)));
};

const OL = ramp6('#5E6B30'), BR = ramp6('#C8961E'), CU = ramp6('#E07A2A');
const paintFind = (g: Ctx) => {
  // (the can: olive drab, lit from the left in steps, its lid band, a rib, the latch)
  box(g, -13, -15, 26, 16, INK);
  box(g, -12, -14, 3, 14, OL[4]); box(g, -9, -14, 13, 14, OL[3]); box(g, 4, -14, 5, 14, OL[2]); box(g, 9, -14, 3, 14, OL[1]);
  box(g, -12, -14, 24, 3, OL[2]); box(g, -12, -14, 24, 1, OL[5]);
  box(g, -12, -7, 24, 1, OL[1]); box(g, -12, -6, 24, 1, OL[4]);
  box(g, 8, -12, 3, 5, INK); box(g, 9, -11, 1, 3, BR[4]);
  // (stenciled rounds on its face)
  for (const x of [-8, -4, 0]) { box(g, x, -4, 2, 3, '#FDE047'); box(g, x, -5, 1, 1, '#FDE047'); }
  // (the lid, flipped open behind)
  box(g, -12, -18, 24, 4, INK); box(g, -11, -17, 22, 2, OL[2]);
  // (the round: the brass case, stepped; its rim)
  box(g, -5, -29, 10, 16, INK);
  box(g, -4, -28, 1, 14, BR[5]); box(g, -3, -28, 2, 14, BR[4]); box(g, -1, -28, 3, 14, BR[3]); box(g, 2, -28, 1, 14, BR[2]); box(g, 3, -28, 1, 14, BR[1]);
  box(g, -4, -17, 8, 2, BR[1]); box(g, -4, -18, 8, 1, BR[5]);
  // (its tip: copper, an ogive in steps, inked)
  const steps: [number, number][] = [[-29, 4], [-31, 4], [-33, 3], [-35, 2], [-36, 1]];
  for (const [y, hw] of steps) box(g, -hw - 1, y - 1, hw * 2 + 2, 3, INK);
  for (const [y, hw] of steps) { box(g, -hw, y, hw * 2, 2, CU[3]); box(g, -hw, y, 1, 2, CU[5]); box(g, hw - 1, y, 1, 2, CU[1]); }
  box(g, -1, -36, 1, 1, '#FFF1DC');
};

export const drawAmmoFind = (c: Ctx, state: GameState) => {
  const v = viewOf(state), x = X(PERCH.rx), y = Y(PERCH.h), w = PERCH.w, f = state.frame;
  if (!seen(v, x - 40, x + w + 40)) return;
  if (y + 60 < state.camera.y - 20) return;
  // The perch: its chains, its deck going back, its face
  still(c, `hh-perch-chains-${w}`, x, y, -4, -724, w + 8, 718, g => paintChains(g, w));
  const S = STEEL.map(c2 => hour(c2)), eye = v.eye;
  if (!topBack(c, eye, x, x + w, y, 1, SCAF_D + 0.01, S, 3)) underBack(c, eye, x, x + w, y + 14, 1, SCAF_D + 0.01, S, 3);
  still(c, `hh-perch-${w}`, x, y, -6, -10, w + 12, 62, g => paintPerch(g, w));
  // The find
  if (!here(state)) return;
  const fx = X(AMMO_FIND_RX), bob = Math.round(Math.sin(f * 0.08) * 2), fy = y - 2 + bob;
  // (its glow: amber, in stepped bands, pulsing)
  const pulse = 0.2 + 0.12 * Math.sin(f * 0.1);
  for (let k = 3; k >= 1; k--) { c.fillStyle = `rgba(251, 191, 36, ${((pulse * (4 - k)) / 3).toFixed(3)})`; c.beginPath(); c.arc(fx, fy - 18, 10 + k * 7, 0, Math.PI * 2); c.fill(); }
  // (its shadow on the deck)
  c.fillStyle = 'rgba(28, 16, 20, 0.35)'; c.fillRect(fx - 12, y - 2, 24, 2);
  still(c, 'hh-ammofind', fx, fy, -16, -40, 32, 42, paintFind);
  // (a glint going round it)
  const t = f % 48;
  if (t < 12) {
    const gx = fx + [-9, 6, -2, 10][Math.floor(f / 48) % 4], gy = fy + [-24, -32, -12, -18][Math.floor(f / 48) % 4], s = t < 6 ? t / 2 : (12 - t) / 2;
    box(c, gx - s, gy, s * 2 + 1, 1, '#FFFBEB'); box(c, gx, gy - s, 1, s * 2 + 1, '#FFFBEB');
  }
};

/** Its glow as a lamp (it shows up in the dusk). */
export const ammoFindLamps = (state: GameState): Light[] => {
  if (!here(state)) return [];
  const x = X(AMMO_FIND_RX);
  if (Math.abs(x - state.camera.x - 400) > 900) return [];
  return [{ x, y: Y(PERCH.h) - 20, r: 90, a: 0.5 + 0.12 * Math.sin(state.frame * 0.1), color: '#FBBF24' }];
};
