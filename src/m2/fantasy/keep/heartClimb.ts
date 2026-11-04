// THE TOWER'S HIDDEN CLIMB: a max health find (upgrades/SPEC.md: +10 max health, one of 5) up in the top left of the
// keep's tower. The owner: "this part in fairy land. near the end. show some moving stairs the player will need to
// uppercut to to get to. have a rising tricky moving stiar section here in the upper left portion of this castle that
// will have a health pickup at the end of the climb."
//
// Off the tower's GALLERY (the balcony at the top of the tower stairs, its balustrade, the king's portrait over it).
// The owner, later: "make the gaps between the stair obstacles higher. not the number of obstacles but space it out and
// make it more challenging. you will go quite a bit higher to get the heart", and "remember you can uppercut. so you can
// make it a bit more than what a standard jump can reach". The same four flights, a gap above the top of each: he
// gets himself from each flight's high end up to the next landing (a held jump ~142; an UPPERCUT ~277; a jump with
// the uppercut at its peak ~380-418; no armor counted). 800 up from the gallery to the perch before, ~1580 now.
//   U1  the way in (teaches the uppercut, the gallery the safe spot under it): a flight hanging over the gallery's
//       left end, its pivot ~236 over the gallery's floor. A jump can't make it; an uppercut from under its pivot can.
//       On the clock: it swings up and back down.
//   G1  a HELD JUMP (100) off its high end up to the first corbel (L1), overhanging the end.
//   U2  off L1, up the tower's left wall: fast; down, its end's way under; ride it up.
//   G2  an UPPERCUT (190) off its high end to L2, before it swings away.
//   U3  off L2, back out to the right, long: a 'ride' flight (stand on it a moment and it swings up, carrying him; it
//       waits up there while he's on it).
//   G3  the big one, no hurry: a JUMP and an UPPERCUT at its peak (300) off its high end to L3. A miss drops him onto L1.
//   U4  off L3, up to the right: the fastest, its low dock way under: ride it up.
//   G4  an UPPERCUT (190) off its high end, on its short hold, to the top perch (L4): the HEART CANISTER (once a save:
//       upgrades/healthAward.ts, the find kept in the save, the card).
// Down: drop off the perch (or anywhere): it's the gallery under it (the perch is over it); off the left side, the
// landing, the stairs and the tower's floor (no fall hurts here). Nothing's in the way of the tower's own route (all
// of it's over 900 up).
//
// Heights up from the ground line; x from the section's start (layout.ts X / Y).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { stairEnd, type StairDef } from '../stairs';
import { ledge, meatheadSays, byPants } from '../section';
import { type Ctx, INK, box, still, onScreen } from '../kit';
import { PALE, R, standSlab } from './paint';
import { X, Y, GY } from './layout';
import { keepOf } from './state';
import { HEART_GOT } from './lines';
import { gonePants } from '../piperLines';
import { HEART_GOT_R } from '../revisitLines';
import { healthWon, awardHealth, openHealthCard, tickHealthCard } from '../../upgrades/healthAward';

const STONE = '#9A8EB4', LIP = '#F6E7C0';
const st = (d: StairDef): StairDef => ({ stone: STONE, lip: LIP, ...d });
const rel = (p: { x: number; y: number }) => ({ x: Math.round(p.x - X(0)), h: Math.round(GY - p.y) });

/** The gaps over each flight's high end (see above): a held jump, an uppercut, a jump and an uppercut, an uppercut. */
export const GAPS = [100, 190, 300, 190];
/** How far each landing reaches back over the flight's end under it (so he can go straight up off the end). */
const OVER = 20;
// (U1: its pivot over the gallery's left end (the gallery's 6791..7540, 774 up); low dock first)
const U1 = st({ px: X(6900), py: Y(1010), len: 240, docks: [Math.PI - 0.2, Math.PI + 0.5], hold: 100, swing: 50 });
const e1 = rel(stairEnd(U1, 1));
export const L1 = { a: e1.x - 80, b: e1.x + OVER, h: e1.h + GAPS[0] };
const U2 = st({ px: X(L1.a), py: Y(L1.h), len: 250, docks: [Math.PI - 0.3, Math.PI + 0.6], hold: 70, swing: 40, phase: 70 });
const e2 = rel(stairEnd(U2, 1));
export const L2 = { a: e2.x - 68, b: e2.x + OVER, h: e2.h + GAPS[1] };
const U3 = st({ px: X(L2.b), py: Y(L2.h), len: 300, docks: [-0.3, -0.7], hold: 150, swing: 50, ride: 24 });
const e3 = rel(stairEnd(U3, 1));
export const L3 = { a: e3.x - OVER, b: e3.x + 80, h: e3.h + GAPS[2] };
const U4 = st({ px: X(L3.b), py: Y(L3.h), len: 240, docks: [0.35, -0.5], hold: 70, swing: 34, phase: 40 });
const e4 = rel(stairEnd(U4, 1));
export const L4 = { a: e4.x - OVER, b: e4.x + 100, h: e4.h + GAPS[3] };

/** The climb's staircases (keep/index.ts puts them after layout.ts's STAIRS: the same stairs.ts runs and draws them). */
export const CLIMB_STAIRS: StairDef[] = [U1, U2, U3, U4];
/** The landings (one-way, lit along their tops, on corbels out of the tower's wall). */
export const CLIMB_LEDGES = [L1, L2, L3, L4];

/** The heart canister: its foot's middle (world), its find id in the save. */
export const HEART = { x: X(L4.a + 76), y: Y(L4.h), land: 'fantasy', id: 'health-keep' };

export const buildClimb = (state: GameState) => {
  for (const L of CLIMB_LEDGES) ledge(state, X(L.a), Y(L.h), L.b - L.a, { hidden: true });
  keepOf(state).heart = !healthWon(HEART.land, HEART.id);
};

/** Each frame: the canister touched (it's his, the card up), and the card's run while it's up (him held, nobody moving
 *  on him; his line once it's shut). True while the card's up (index.ts holds everything else). */
export const updateClimb = (ctx: FrameContext): boolean => {
  const { state } = ctx, p = state.player, k = keepOf(state);
  if (k.heartCard) {
    p.inCutscene = true; p.vel.x = 0;
    for (const e of state.enemies) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2);
    if (!tickHealthCard(k.heartCard, state.frame)) return true;
    k.heartCard = null; p.inCutscene = false;
    meatheadSays(state, pickLine(byPants(state, gonePants(HEART_GOT, HEART_GOT_R))));
    return false;
  }
  if (!k.heart || p.health <= 0 || p.inCutscene) return false;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (Math.abs(cx - HEART.x) > 28 || feet < HEART.y - 60 || p.pos.y > HEART.y - 6) return false;
  k.heart = false;
  playSound('powerup', 0.6, 4);
  for (let j = 0; j < 22; j++) state.particles.push({ pos: { x: HEART.x + (Math.random() - 0.5) * 20, y: HEART.y - 26 + (Math.random() - 0.5) * 24 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 36, color: j % 3 ? '#F87171' : '#FDE68A', size: 2 + Math.random() * 2, grav: 0.08 });
  if (awardHealth(HEART.land, HEART.id)) { k.heartCard = openHealthCard(); p.inCutscene = true; p.vel.x = 0; return true; }
  return false;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (behind him, before the stairs): the landings, the canister on the perch

const seenY = (state: GameState, top: number, bot: number) => bot > state.camera.y - 60 && top < state.camera.y + 660;

/** The heart canister (its foot's middle at x, y): a fat glass jar, brass caps, a meaty red heart inside, baked once;
 *  per frame only a bob, the beat (drawn a touch bigger on the beat) and a soft glow behind. */
const CAN_W = 30, CAN_H = 44;
const paintCanister = (g: Ctx) => {
  const Br = ['#3A2410', '#6A4418', '#A06C1C', '#D8A23A', '#F2C84A', '#FFF0A8'];
  const Rd = ['#2E0408', '#5A0A12', '#8E1420', '#C42A34', '#E8545A', '#FF9A9A'];
  const w = CAN_W, h = CAN_H;
  // (the glass: dark tinted behind, the heart, highlights)
  box(g, -w / 2 - 1, -h + 7, w + 2, h - 13, INK);
  box(g, -w / 2, -h + 8, w, h - 15, '#3A1A2E');
  box(g, -w / 2 + 2, -h + 8, w - 4, h - 15, '#4E2238');
  // (the heart: two lobes and a point, banded light to dark, a vein, the aorta stub)
  const hx = 0, hy = -h / 2 + 2;
  const heart = (r: number, col: string, dy = 0) => {
    g.fillStyle = col; g.beginPath();
    g.arc(hx - r * 0.5, hy - r * 0.2 + dy, r * 0.55, 0, Math.PI * 2); g.arc(hx + r * 0.5, hy - r * 0.2 + dy, r * 0.55, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(hx - r * 1.02, hy + dy); g.lineTo(hx + r * 1.02, hy + dy); g.lineTo(hx, hy + r * 1.05 + dy); g.closePath(); g.fill();
  };
  heart(11, INK); heart(10, Rd[2]); heart(8.4, Rd[3], -0.6); heart(5.6, Rd[4], -1.6);
  box(g, hx - 6, hy - 6, 3, 2, Rd[5]); box(g, hx - 5, hy - 4, 1, 1, '#FFFFFF');
  g.strokeStyle = Rd[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(hx + 1, hy - 5); g.quadraticCurveTo(hx + 3, hy + 1, hx - 1, hy + 7); g.stroke();
  box(g, hx + 1, hy - 12, 4, 5, INK); box(g, hx + 2, hy - 11, 2, 4, Rd[3]);
  // (bubbles, the glass's sheen down its left, a shadow down its right)
  for (const [bx, by] of [[-9, -12], [8, -28], [-6, -32], [10, -14]]) { box(g, bx, by, 2, 2, '#F4A8C4'); box(g, bx, by, 1, 1, '#FFFFFF'); }
  box(g, -w / 2 + 2, -h + 10, 3, h - 19, 'rgba(255,255,255,0.45)'); box(g, -w / 2 + 6, -h + 10, 1, h - 19, 'rgba(255,255,255,0.25)');
  box(g, w / 2 - 4, -h + 10, 3, h - 19, 'rgba(20,0,20,0.35)');
  // (the brass caps, top and foot, in steps, rivets)
  for (const [y0, hh] of [[-h, 9], [-8, 8]] as const) {
    box(g, -w / 2 - 3, y0 - 1, w + 6, hh + 2, INK);
    box(g, -w / 2 - 2, y0, w + 4, hh, Br[2]); box(g, -w / 2 - 2, y0, w + 4, 2, Br[4]); box(g, -w / 2 - 2, y0 + 1, w + 4, 1, Br[5]);
    box(g, -w / 2 - 2, y0 + hh - 2, w + 4, 2, Br[1]);
    for (let rx = -w / 2 + 2; rx < w / 2; rx += 7) box(g, rx, y0 + hh / 2, 2, 2, Br[4]);
  }
  // (a knob on the lid)
  box(g, -5, -h - 5, 10, 6, INK); box(g, -4, -h - 4, 8, 4, Br[3]); box(g, -4, -h - 4, 8, 1, Br[5]);
};
const drawCanister = (c: Ctx, x: number, y: number, f: number) => {
  const bob = Math.round(Math.sin(f * 0.06) * 3), beat = f % 50 < 6;
  // (the glow behind: a few banded rings, the beat brightens it)
  c.save();
  for (let i = 3; i >= 1; i--) { c.globalAlpha = (beat ? 0.16 : 0.1) * (4 - i) / 3; c.fillStyle = '#FF5A6A'; c.beginPath(); c.arc(x, y - CAN_H / 2 - 4 + bob, 18 + i * 9, 0, Math.PI * 2); c.fill(); }
  c.restore();
  still(c, 'kp-heartcan', x, y - 4 + bob, -CAN_W / 2 - 6, -CAN_H - 8, CAN_W + 12, CAN_H + 10, paintCanister);
  if (beat) { c.save(); c.globalAlpha = 0.35; c.fillStyle = '#FF9A9A'; c.beginPath(); c.arc(x, y - CAN_H / 2 - 2 + bob, 7, 0, Math.PI * 2); c.fill(); c.restore(); }
};

export const drawClimb = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(L2.a) - 60, X(L4.b) + 60) || !seenY(state, Y(L4.h) - 80, Y(L1.h) + 60)) return;
  const S = R(PALE, false);
  CLIMB_LEDGES.forEach((L, i) => {
    if (!onScreen(state, X(L.a) - 20, X(L.b) + 20) || !seenY(state, Y(L.h) - 10, Y(L.h) + 40)) return;
    still(c, `kp-climb-${i}`, X(L.a), Y(L.h), -4, -4, L.b - L.a + 8, 44, g => standSlab(g, 0, L.b - L.a, 20, S, L.a + 31 * i, true));
  });
  const k = keepOf(state);
  if (k.heart && onScreen(state, HEART.x - 60, HEART.x + 60) && seenY(state, HEART.y - 90, HEART.y)) drawCanister(c, HEART.x, HEART.y, state.frame);
};
