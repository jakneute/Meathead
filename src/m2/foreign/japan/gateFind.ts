// THE MAX AMMO FIND in the bullet train's LEFT tunnel (one of the 5 hidden ammo finds: upgrades/SPEC.md, +10% ammo in
// every weapon). The owner, 2026-11-01: "in japan there's a bullet train. if you see closely when the gate opens, an
// ammo pickup will be there. give a short window to grab it before it closes and spits you out and you take heavy
// damage from the train/door closing. the lefthand gate" and "you are allowed to enter the open gate when it's open.
// still standing in it when it closes will eject you for heavy damage as the train blasts you".
//
// The left portal's shutter rolls up as the bells start (station.ts leftOpen: the right one keeps its old timing), and
// in the dark of the tunnel mouth, on the ballast, there it is: the ammo can with the brass round standing up out of it
// (the same find as the Hollywood one), a faint amber glow, a glint. The gate's walkable once the shutter's foot is
// over his head; he steps in, touches it: his for good (upgrades/ammoAward.ts: saved there and then), the YOU GOT card
// (its buffer; the train's clock held while it's up). Then out, fast: still in the mouth when the train comes through
// and it blasts him out onto the track (station.ts: `m2:fl_train_blast`, heavy, it can kill). Gone on revisits.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { pickLine } from '../../../m1/game/platform/speech';
import { meatheadSays } from '../section';
import { byPants } from '../cast';
import { type Ctx, INK, box, ramp6, still } from '../kit';
import { awardAmmo, ammoWon, openAmmoCard, tickAmmoCard, type AmmoCard } from '../../upgrades/ammoAward';
import { AMMO_FIND } from './lines';

/** The find, in the save (one per save). */
export const AMMO_LAND = 'foreign', AMMO_ID = 'ammo-shinkansen';

export interface GateFind { taken: boolean; card: AmmoCard | null }
export const newGateFind = (): GateFind => ({ taken: false, card: null });
/** It's still lying there. */
export const findHere = (g: GateFind) => !g.taken && !ammoWon(AMMO_LAND, AMMO_ID);

/** The card while it's up (him held): the controls to use, or null when there's no card. */
export const tickGateCard = (state: GameState, g: GateFind): Controls | null => {
  if (!g.card) return null;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  if (tickAmmoCard(g.card, state.frame)) {
    g.card = null; p.inCutscene = false;
    meatheadSays(state, pickLine(byPants(state, AMMO_FIND)), false);
  }
  return { ...NO_CONTROLS };
};

/** Picking it up (at fx on the ground gy), only while the gate's open: true if he just did (the card's up). */
export const grabGateFind = (ctx: FrameContext, g: GateFind, fx: number, gy: number): boolean => {
  const { state } = ctx, p = state.player;
  if (!findHere(g) || p.health <= 0 || p.inCutscene || p.carried || state.deathTimer > 0) return false;
  const feet = p.pos.y + p.height;
  if (!(p.pos.x < fx + 14 && p.pos.x + p.width > fx - 14 && feet > gy - 40 && p.pos.y < gy)) return false;
  g.taken = true;
  for (let k = 0; k < 18; k++) state.particles.push({ pos: { x: fx, y: gy - 20 }, vel: { x: (Math.random() - 0.5) * 7, y: -1 - Math.random() * 5 }, life: 36, color: k % 3 ? '#FCD34D' : '#FFF7D6', size: 3, grav: 0.2 });
  if (!awardAmmo(AMMO_LAND, AMMO_ID)) return false;
  g.card = openAmmoCard();
  p.inCutscene = true; p.vel.x = 0;
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawn in the tunnel mouth, over its dark and under the shutter: only what the shutter's rolled up off shows.

const OL = ramp6('#5E6B30'), BR = ramp6('#C8961E'), CU = ramp6('#E07A2A');
/** The find (local, its foot at 0): an olive ammo can lit from the left in steps, lid flipped open, a big brass round
 *  standing up out of it, its copper tip in steps. The same look as the Hollywood one (and the pause screen's icon). */
const paintFind = (g: Ctx) => {
  box(g, -13, -15, 26, 16, INK);
  box(g, -12, -14, 3, 14, OL[4]); box(g, -9, -14, 13, 14, OL[3]); box(g, 4, -14, 5, 14, OL[2]); box(g, 9, -14, 3, 14, OL[1]);
  box(g, -12, -14, 24, 3, OL[2]); box(g, -12, -14, 24, 1, OL[5]);
  box(g, -12, -7, 24, 1, OL[1]); box(g, -12, -6, 24, 1, OL[4]);
  box(g, 8, -12, 3, 5, INK); box(g, 9, -11, 1, 3, BR[4]);
  for (const x of [-8, -4, 0]) { box(g, x, -4, 2, 3, '#FDE047'); box(g, x, -5, 1, 1, '#FDE047'); }
  box(g, -12, -18, 24, 4, INK); box(g, -11, -17, 22, 2, OL[2]);
  box(g, -5, -29, 10, 16, INK);
  box(g, -4, -28, 1, 14, BR[5]); box(g, -3, -28, 2, 14, BR[4]); box(g, -1, -28, 3, 14, BR[3]); box(g, 2, -28, 1, 14, BR[2]); box(g, 3, -28, 1, 14, BR[1]);
  box(g, -4, -17, 8, 2, BR[1]); box(g, -4, -18, 8, 1, BR[5]);
  const steps: [number, number][] = [[-29, 4], [-31, 4], [-33, 3], [-35, 2], [-36, 1]];
  for (const [y, hw] of steps) box(g, -hw - 1, y - 1, hw * 2 + 2, 3, INK);
  for (const [y, hw] of steps) { box(g, -hw, y, hw * 2, 2, CU[3]); box(g, -hw, y, 1, 2, CU[5]); box(g, hw - 1, y, 1, 2, CU[1]); }
  box(g, -1, -36, 1, 1, '#FFF1DC');
};

/** The find at (fx, gy) in the mouth, showing below `reveal` (the shutter's foot): a faint amber glow in stepped bands,
 *  the can and round (stamped once), a glint now and then. */
export const drawGateFind = (c: Ctx, g: GateFind, fx: number, gy: number, reveal: number, f: number) => {
  if (!findHere(g) || reveal >= gy) return;
  c.save();
  c.beginPath(); c.rect(fx - 40, reveal, 80, gy - reveal + 2); c.clip();
  const pulse = 0.12 + 0.06 * Math.sin(f * 0.1);
  for (let k = 3; k >= 1; k--) { c.fillStyle = `rgba(251, 191, 36, ${((pulse * (4 - k)) / 3).toFixed(3)})`; c.beginPath(); c.arc(fx, gy - 16, 8 + k * 6, 0, Math.PI * 2); c.fill(); }
  still(c, 'jp-ammofind', fx, gy, -16, -40, 32, 42, paintFind);
  const t = f % 56;
  if (t < 12) {
    const k = Math.floor(f / 56) % 4, gx = fx + [-9, 6, -2, 10][k], gyy = gy + [-24, -32, -12, -18][k], s = t < 6 ? t / 2 : (12 - t) / 2;
    box(c, gx - s, gyy, s * 2 + 1, 1, '#FFFBEB'); box(c, gx, gyy - s, 1, s * 2 + 1, '#FFFBEB');
  }
  c.restore();
};
