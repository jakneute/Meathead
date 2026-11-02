// THE CRYPT UNDER THE GRAND STAIRCASE: a max ammo find (upgrades/SPEC.md: +10% ammo in every weapon, one of 5; the
// last of them). The owner: "this part in fairy land, in the grand staircase, just before the first trial. there will
// be a staircase going downard, have some tricky downward stair based platforming, similar to the other one later in
// the stage but this one you need to move down while avoiding stuff on the way down." / "that is the final ammo pickup".
//
// In the hall's floor, between the pier's column and the far staircase's foot: THE TRAPDOOR STAIRS (E0), a flight lying
// level in the floor (it IS the floor there, walked over) that tells and dips down into the dark and back, on the clock.
// Under the hall, the crypt (a cutaway: the floor's slab, the vault under it, a long way down to its floor):
//   E0  ride it down (or step on as it dips) to D1, a ledge under the floor.
//   M1  down-left off D1, long, the clock; AXE 1 (a pendulum blade on a chain off the vault) sweeps across it.
//   D2  a ledge out over the drop; M2 down-right off it to D3, AXE 2 sweeping its foot.
//   D3  a ledge by a pillar: its DRAGON-HEAD gargoyle (it smokes and glows, then breathes fire across the ledge).
//   M3  down-left off D3, its low end swinging way down: catch it level-ish to step off into
//   THE NICHE in the left wall: the ammo can (once a save: upgrades/ammoAward.ts, the card; gone after).
// Falls: the crypt's floor (a long way down, never out of the world), a LADDER up the shaft's right side back to the
// hall's floor beside the trapdoor (from the niche too: drop off it). Nothing of this is on the hall's own route.
//
// Heights up from the ground line (negative: under it); x from the section's start (layout.ts X / Y).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { worldSound } from '../../onScreen';
import { makeStairs, updateStairs, drawStairs, stairEnd, type Stair, type StairDef } from '../stairs';
import { updateLadders, drawLadders, type LadderDef } from '../../moves/ladders';
import { layOwn, ledge, solid, meatheadSays, byPants } from '../section';
import { type Ctx, INK, box, mix, hash, checker, still, onScreen, slab, polyF, STONE, IRON, GOLD, LIP, rampH } from '../kit';
import { GY } from '../geometry';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import { timeOfDay } from '../../timeOfDay';
import { X, Y } from './layout';
import { AMMO_GOT } from './lines';
import { ammoWon, awardAmmo, openAmmoCard, tickAmmoCard, type AmmoCard } from '../../upgrades/ammoAward';

const LAND = 'fantasy', FIND_ID = 'ammo-crypt';

// ---------------------------------------------------------------------------------------------------------------
// Where it all is

/** The hole in the hall's floor (the trapdoor stairs lie across it), the crypt's walls and its floor, the slab's depth. */
export const HOLE = { a: 11800, b: 12000 };
export const CRYPT = { a: 11240, b: 12290, floor: -1000, slab: 24 };
const rel = (p: { x: number; y: number }) => ({ x: Math.round(p.x - X(0)), h: Math.round(GY - p.y) });

const E0: StairDef = { px: X(HOLE.b), py: Y(0), len: HOLE.b - HOLE.a, docks: [Math.PI, Math.PI - 0.75], hold: 170, swing: 60 };
const e0 = rel(stairEnd(E0, 1));
const D1 = { a: e0.x - 90, b: e0.x, h: e0.h };
const M1: StairDef = { px: X(D1.a), py: Y(D1.h), len: 380, docks: [Math.PI - 0.2, Math.PI - 0.7], hold: 100, swing: 45, phase: 30 };
const e1 = rel(stairEnd(M1, 1));
const D2 = { a: e1.x - 90, b: e1.x, h: e1.h };
const M2: StairDef = { px: X(D2.b), py: Y(D2.h), len: 400, docks: [0.2, 0.6], hold: 90, swing: 45, phase: 100 };
const e2 = rel(stairEnd(M2, 1));
const D3 = { a: e2.x, b: e2.x + 90, h: e2.h };
const M3: StairDef = { px: X(D3.a), py: Y(D3.h), len: 380, docks: [Math.PI - 0.25, Math.PI - 0.75], hold: 70, swing: 40, phase: 10 };
const e3 = rel(stairEnd(M3, 0));
/** The niche: from the left wall to M3's end (its high dock). */
const NICHE = { a: CRYPT.a + 50, b: e3.x, h: e3.h };
const LEDGES = [D1, D2, D3, NICHE];
export const CRYPT_STAIRS: StairDef[] = [E0, M1, M2, M3].map(d => ({ stone: '#8A80A6', lip: '#F2E2B8', ...d }));

/** The pendulum axes: [pivot x, pivot height, chain, swing (radians either side), period, phase]. */
const AXES: [number, number, number, number, number, number][] = [
  [11610, -40, 140, 0.85, 150, 0],
  [11700, -330, 190, 0.8, 130, 50],
  [11560, -470, 160, 0.8, 140, 90],
];
const BLADE_R = 26;
/** The dragon head on its pillar (by D3): its x (the pillar's middle), its mouth's height, the jet's reach (left). */
const DRAGON = { x: 12150, h: D3.h + 50, reach: 300, period: 200, tell: 50, burn: 70 };
/** The ladder back up, in its own hatch by the hall's far wall (a grate over it: walked over, climbed up through):
 *  its middle, top (the hall's floor), foot (the crypt's). */
export const HATCH = { a: 12240, b: 12300 };
const LADDER_X = 12268;
const LADDERS: LadderDef[] = [{ x: X(LADDER_X), top: Y(0), bottom: Y(CRYPT.floor), ledge: { x: X(HATCH.a - 30), y: Y(0) } }];
/** The ammo can: its foot's middle (world). */
const CAN = { x: X(NICHE.a + 50), y: Y(NICHE.h) };

// ---------------------------------------------------------------------------------------------------------------
// Its state (one per stage build)

interface Cr { stairs: Stair[]; card: AmmoCard | null; taken: boolean; said: boolean }
const ALL = new WeakMap<object, Cr>();
const crOf = (state: GameState): Cr => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) { o = { stairs: [], card: null, taken: false, said: false }; ALL.set(k, o); }
  return o;
};
const canHere = (state: GameState) => !crOf(state).taken && !ammoWon(LAND, FIND_ID);

export const buildCrypt = (state: GameState) => {
  const cr = crOf(state);
  cr.stairs = makeStairs(state, CRYPT_STAIRS);
  // (its floor, a long way down: falls land here, never out of the world)
  layOwn(state, [{ x1: X(CRYPT.a), y1: Y(CRYPT.floor), x2: X(CRYPT.b), y2: Y(CRYPT.floor), surface: 'stone' }]);
  for (const L of LEDGES) ledge(state, X(L.a), Y(L.h), L.b - L.a, { hidden: true });
  // (the hall's floor over the crypt, solid both ways either side of the hole; the crypt's walls)
  solid(state, X(CRYPT.a), Y(0), HOLE.a - CRYPT.a, CRYPT.slab, { hidden: true });
  solid(state, X(HOLE.b), Y(0), HATCH.a - HOLE.b, CRYPT.slab, { hidden: true });
  ledge(state, X(HATCH.a), Y(0), HATCH.b - HATCH.a, { hidden: true });
  solid(state, X(CRYPT.a - 60), Y(-CRYPT.slab), 60, -CRYPT.floor + 80, { hidden: true });
  solid(state, X(CRYPT.b), Y(-CRYPT.slab), 60, -CRYPT.floor + 80, { hidden: true });
};

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const hits = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const axeAng = (f: number, a: typeof AXES[number]) => Math.sin(((f + a[5]) / a[4]) * Math.PI * 2) * a[3];
const axeAt = (f: number, a: typeof AXES[number]) => { const t = axeAng(f, a); return { x: X(a[0]) + Math.sin(t) * a[2], y: Y(a[1]) + Math.cos(t) * a[2], t }; };
const dragonPhase = (f: number) => { const r = (f + 40) % DRAGON.period; return r < DRAGON.tell ? { tell: r / DRAGON.tell, burn: 0 } : r < DRAGON.tell + DRAGON.burn ? { tell: 0, burn: Math.min(1, (r - DRAGON.tell) / 8, (DRAGON.tell + DRAGON.burn - r) / 8) } : { tell: 0, burn: 0 }; };

/** Each frame, first thing (the ladder takes his controls on it); null: nothing of the crypt's going on. The card up:
 *  him held (index.ts's cutscene rule keeps his controls out). */
export const updateCrypt = (ctx: FrameContext, controls: Controls): { out: Controls; held: boolean } => {
  const { state } = ctx, p = state.player, cr = crOf(state), f = state.frame;
  if (cr.card) {
    p.inCutscene = true; p.vel.x = 0;
    for (const e of state.enemies) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2);
    if (tickAmmoCard(cr.card, f)) { cr.card = null; p.inCutscene = false; meatheadSays(state, pickLine(byPants(state, AMMO_GOT))); }
    return { out: controls, held: !!cr.card };
  }
  const out = updateLadders(ctx, LADDERS, controls);
  updateStairs(ctx, cr.stairs);
  const near = onScreen(state, X(CRYPT.a) - 200, X(CRYPT.b) + 200);
  if (!near) return { out, held: false };
  const cx = p.pos.x + p.width / 2;
  // (the axes: the blade's disc; the chain's harmless)
  for (const a of AXES) {
    const b = axeAt(f, a);
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, b.x - BLADE_R, b.y - BLADE_R * 0.6, BLADE_R * 2, BLADE_R * 1.4)) hurtPlayer(ctx, 12, 'm2:fa_axe', { x: (cx < b.x ? -1 : 1) * 5, y: -4 });
    // (the swoosh as it passes the bottom of its swing, near him)
    if (Math.abs(b.t) < 0.05 && f % 4 === 0) worldSound(state, 'whoosh', 0.25, -6, b.x - BLADE_R, b.y - BLADE_R, BLADE_R * 2, BLADE_R * 2);
  }
  // (the dragon head: smoke and a glow, then fire across D3 to its left)
  const d = dragonPhase(f), mx = X(DRAGON.x) - 22, my = Y(DRAGON.h);
  if (d.burn > 0.3 && f % 10 === 1 && alive(state) && p.invincibilityTimer <= 0 && hits(state, mx - DRAGON.reach, my - 22, DRAGON.reach, 44)) hurtPlayer(ctx, 12, 'm2:fa_dragonhead', { x: -4, y: -3 });
  if (Math.abs(cx - mx) < 700 && Math.abs(p.pos.y - my) < 500) {
    const r = (f + 40) % DRAGON.period;
    if (r === 0) playSound('rumble', 0.3, 6);
    if (r === DRAGON.tell) playSound('flame', 0.5);
  }
  // (the can: touched, it's his)
  if (canHere(state) && alive(state)) {
    const feet = p.pos.y + p.height;
    if (Math.abs(cx - CAN.x) < 28 && feet > CAN.y - 60 && p.pos.y < CAN.y - 6) {
      cr.taken = true;
      playSound('powerup', 0.6, 4);
      for (let j = 0; j < 22; j++) state.particles.push({ pos: { x: CAN.x + (Math.random() - 0.5) * 20, y: CAN.y - 20 + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 36, color: j % 3 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.08 });
      if (awardAmmo(LAND, FIND_ID)) { cr.card = openAmmoCard(); p.inCutscene = true; p.vel.x = 0; return { out, held: true }; }
    }
  }
  return { out, held: false };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the crypt (a cutaway under the hall, baked in tiles), its ledges, the hole's mouth; then (behind him) the
// stairs, the axes, the dragon head and its fire, the ladder, the can.

const TILE = 256;
const VAULT = ['#120E1E', '#1C162C', '#28203C', '#362C4E', '#4A3E64', '#665A82'];
/** One tile of the vault's back wall: dark ashlar in courses, darker going down (banded), dithered between bands;
 *  arches, niches with skulls, cobwebs, chains, water stains. Tile (i, j): x from the crypt's left, y down from the slab. */
const paintVault = (g: Ctx, i: number, j: number) => {
  const W = rampH(VAULT, true), S = rampH(STONE, true), Ir = rampH(IRON, true);
  const x0 = i * TILE, y0 = j * TILE, depth = (y: number) => Math.min(3, Math.floor((y0 + y) / 260));
  for (let y = 0; y < TILE; y += 4) { const dk = depth(y); box(g, 0, y, TILE, 4, W[3 - Math.min(2, dk)]); }
  // (the courses: mortar lines, staggered joints, blocks picked out lighter or darker)
  for (let y = -((y0) % 18); y < TILE; y += 18) {
    const row = Math.floor((y0 + y) / 18), dk = depth(Math.max(0, y));
    box(g, 0, y, TILE, 1, W[Math.max(0, 1 - Math.min(1, dk))]); box(g, 0, y + 1, TILE, 1, W[4 - Math.min(3, dk)]);
    for (let x = -((x0 + (row % 2) * 22) % 44); x < TILE; x += 44) {
      box(g, x, y + 1, 1, 17, W[1]);
      const t = hash((x0 + x) * 0.13 + row * 7.1);
      if (t > 0.7) box(g, x + 2, y + 3, 40, 13, W[Math.max(1, 3 - dk)]);
      else if (t < 0.12) box(g, x + 2, y + 3, 40, 13, W[Math.max(0, 2 - dk)]);
    }
  }
  // (between bands, a dither so the dark comes in in steps)
  for (let b = 1; b < 4; b++) { const by = b * 260 - y0; if (by > -4 && by < TILE) checker(g, 0, by - 2, TILE, 4, W[3 - Math.min(2, b)], 0, 2); }
  // (features: an arch's ribs, a burial niche with a skull, a chain, a water stain; by where they are)
  for (let fx = Math.floor((x0 - 100) / 180) * 180 + 90; fx < x0 + TILE + 100; fx += 180) {
    for (let fy = Math.floor((y0 - 100) / 220) * 220 + 120; fy < y0 + TILE + 100; fy += 220) {
      const x = fx - x0, y = fy - y0, k = Math.floor(hash(fx * 0.31 + fy * 0.17) * 5);
      if (k === 0) {
        // (a burial niche: an arched hole, a skull and bones in it)
        g.fillStyle = INK; g.beginPath(); g.arc(x, y, 22, Math.PI, 0); g.fill(); box(g, x - 22, y, 44, 22, INK);
        g.fillStyle = W[0]; g.beginPath(); g.arc(x, y, 19, Math.PI, 0); g.fill(); box(g, x - 19, y, 38, 20, W[0]);
        g.fillStyle = S[3]; g.beginPath(); g.arc(x - 4, y + 10, 7, 0, Math.PI * 2); g.fill(); box(g, x - 9, y + 14, 10, 5, S[3]);
        box(g, x - 8, y + 8, 3, 3, INK); box(g, x - 3, y + 8, 3, 3, INK); box(g, x - 6, y + 16, 1, 3, INK); box(g, x - 3, y + 16, 1, 3, INK); box(g, x - 9, y + 6, 2, 1, S[5]);
        box(g, x + 4, y + 16, 14, 3, S[2]); box(g, x + 3, y + 15, 3, 5, S[3]); box(g, x + 16, y + 15, 3, 5, S[3]);
        box(g, x - 23, y + 22, 46, 3, S[2]); box(g, x - 23, y + 22, 46, 1, S[4]);
      } else if (k === 1) {
        // (a chain hanging, its shackle)
        for (let cy = y - 60; cy < y + 30; cy += 6) { box(g, x - 1, cy, 3, 4, Ir[1]); box(g, x, cy, 1, 3, Ir[3]); }
        box(g, x - 5, y + 30, 11, 6, INK); box(g, x - 4, y + 31, 9, 4, Ir[2]); box(g, x - 4, y + 31, 9, 1, Ir[4]);
      } else if (k === 2) {
        // (a water stain down the stones, moss at its foot)
        for (let sy = y - 50; sy < y + 50; sy += 2) box(g, x - 6 + Math.round(Math.sin(sy * 0.1) * 2), sy, 10 - Math.abs(sy - y) / 12, 2, mix(W[2], '#1E3A2E', 0.4));
        box(g, x - 10, y + 48, 22, 3, '#2A4A30'); box(g, x - 8, y + 47, 6, 1, '#4E7A44');
      } else if (k === 3) {
        // (a cobweb in a corner of the courses)
        g.strokeStyle = 'rgba(200,200,220,0.25)'; g.lineWidth = 1;
        for (let r = 8; r < 40; r += 8) { g.beginPath(); g.arc(x, y, r, 0, Math.PI / 2); g.stroke(); }
        for (let a = 0; a <= Math.PI / 2 + 0.01; a += Math.PI / 8) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 42, y + Math.sin(a) * 42); g.stroke(); }
      }
    }
  }
};
/** The slab under the hall's floor (its section: dressed stone, lit along the floor's top), over x a..b (rx). */
const paintSlab = (g: Ctx, w: number) => {
  const S = rampH(STONE);
  box(g, 0, 0, w, CRYPT.slab, INK); slab(g, 0, 1, w, CRYPT.slab - 2, S);
  for (let x = 12; x < w; x += 40) box(g, x, 3, 1, CRYPT.slab - 6, S[1]);
  box(g, 0, CRYPT.slab - 3, w, 3, S[1]);
  box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
};
/** A crypt ledge: stone on an iron bracket, lit along its top. */
const paintLedge = (g: Ctx, w: number) => {
  const S = rampH(STONE), Ir = rampH(IRON);
  box(g, -1, -1, w + 2, 15, INK); slab(g, 0, 0, w, 14, S); box(g, 0, 11, w, 3, S[1]);
  for (let k = 10; k < w - 10; k += 34) { polyF(g, [[k, 14], [k + 4, 14], [k + 18, 34], [k + 14, 34]], INK); polyF(g, [[k + 1, 14], [k + 3, 14], [k + 16, 32], [k + 14, 32]], Ir[3]); }
  box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
};

let axeCanvas: HTMLCanvasElement | null = null;
/** The blade, baked once (drawn turned: the stamp cache won't take a rotation): a crescent of steel, its edge bright,
 *  an iron hub, a gilt boss. Centered on the hub, the edge pointing down (+y). */
const axeArt = () => {
  if (axeCanvas) return axeCanvas;
  const cv = document.createElement('canvas'); cv.width = 72; cv.height = 52;
  const g = cv.getContext('2d')!, cx = 36, cy = 14;
  const steel = ['#2A2A38', '#4A4A5E', '#7A7A92', '#A8A8C0', '#D4D4E4', '#FFFFFF'];
  const cres = (r: number, col: string, dy = 0) => { g.fillStyle = col; g.beginPath(); g.arc(cx, cy - 12 + dy, r, 0.12 * Math.PI, 0.88 * Math.PI); g.closePath(); g.fill(); };
  cres(36, INK); cres(34, steel[2]); cres(30, steel[3], -2); cres(22, steel[2], -4);
  g.strokeStyle = steel[5]; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy - 12, 33, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  g.strokeStyle = steel[4]; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy - 12, 30, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke();
  // (a rust spot, a notch: it's old)
  g.fillStyle = '#7A3A1A'; g.fillRect(cx + 8, cy + 10, 4, 3); g.fillStyle = INK; g.fillRect(cx - 14, cy + 17, 3, 2);
  g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3A3650'; g.beginPath(); g.arc(cx, cy, 6.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLD[3]; g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD[5]; g.fillRect(cx - 1, cy - 2, 1, 1);
  axeCanvas = cv;
  return cv;
};

const paintDragon = (g: Ctx) => {
  // (a stone dragon's head out of the pillar, facing left: brow, horns, a jaw open, teeth, a socket for the eye)
  const S = rampH(STONE), Gd = rampH(GOLD);
  polyF(g, [[0, -24], [-30, -20], [-46, -10], [-50, 0], [-40, 4], [-46, 12], [-34, 18], [-4, 18]], INK);
  polyF(g, [[0, -22], [-29, -18], [-44, -9], [-47, -1], [-38, 2], [-30, 0], [-26, 6], [-42, 12], [-32, 16], [-4, 16]], S[3]);
  polyF(g, [[0, -22], [-29, -18], [-44, -9], [-30, -10], [-4, -14]], S[4]);
  polyF(g, [[-26, 6], [-42, 12], [-32, 16], [-4, 16], [-6, 10]], S[2]);
  // (the mouth's dark, teeth)
  polyF(g, [[-30, 0], [-46, 0], [-42, 10], [-26, 6]], INK);
  for (const x of [-44, -38, -32]) { polyF(g, [[x, 0], [x + 3, 0], [x + 1.5, 4]], '#F0ECE0'); polyF(g, [[x + 1, 10], [x + 4, 9], [x + 2, 6]], '#F0ECE0'); }
  // (horns back over the brow; the eye socket, a gilt ring)
  polyF(g, [[-14, -20], [-4, -34], [2, -36], [-6, -22]], INK); polyF(g, [[-13, -20], [-4, -32], [0, -34], [-7, -21]], S[4]);
  box(g, -24, -14, 7, 5, INK); box(g, -23, -13, 5, 3, Gd[2]);
  // (its scales: a few lines down its neck)
  for (let k = 0; k < 4; k++) box(g, -12 + k * 3, -8 + k * 5, 6, 1, S[1]);
};

/** The crypt under the hall (behind the stairs and him): in drawBack after the hall. */
export const drawCryptBack = (c: Ctx, state: GameState) => {
  const L = X(CRYPT.a), Rr = X(CRYPT.b);
  if (!onScreen(state, L - 60, Rr + 60)) return;
  const top = Y(0), camY = state.camera.y, f = state.frame;
  // (the vault, in tiles: only the ones on screen, from under the slab down to the floor)
  const vy0 = top + CRYPT.slab, vy1 = Y(CRYPT.floor) + 60;
  for (let i = 0; i * TILE < CRYPT.b - CRYPT.a; i++) {
    const tx = L + i * TILE, tw = Math.min(TILE, Rr - tx);
    if (!onScreen(state, tx, tx + tw)) continue;
    for (let j = 0; vy0 + j * TILE < vy1; j++) {
      const ty = vy0 + j * TILE, th = Math.min(TILE, vy1 - ty);
      if (ty > camY + 620 || ty + th < camY - 20) continue;
      still(c, `sq-crypt-${i}-${j}`, tx, ty, 0, 0, tw, th, g => { g.save(); g.beginPath(); g.rect(0, 0, tw, th); g.clip(); paintVault(g, i, j); g.restore(); });
    }
  }
  // (outside the walls, under the hall's near floor: the castle's foundations, packed rock in courses (a pattern,
  // baked once), down out of the picture, so nothing of the town shows through down here)
  {
    const fy0 = Math.max(top + 130, camY - 20), fy1 = camY + 620;
    if (fy1 > fy0) {
      const pat = tilePattern(c, `fa-sq-found-${timeOfDay().key}`, 64, 48, g => {
        const W = rampH(VAULT, true);
        box(g, 0, 0, 64, 48, W[1]);
        for (let r = 0; r < 3; r++) { box(g, 0, r * 16, 64, 1, W[0]); for (let x = (r % 2) * 16; x < 64; x += 32) { box(g, x, r * 16 + 1, 1, 15, W[0]); box(g, x + 2, r * 16 + 2, 26, 1, W[2]); } }
        checker(g, 0, 46, 64, 2, W[0], 0, 2);
      });
      c.fillStyle = pat;
      const sx0 = state.camera.x - 20, sx1 = state.camera.x + 820;
      if (L - 24 > sx0) c.fillRect(sx0, fy0, L - 24 - sx0, fy1 - fy0);
      if (Rr + 24 < sx1) c.fillRect(Rr + 24, fy0, sx1 - Rr - 24, fy1 - fy0);
    }
  }
  // (the walls either side: dressed stone, lit on their inner faces)
  const S = rampH(STONE, true);
  for (const [x, w, lt] of [[L - 24, 24, 1], [Rr, 24, 0]] as const) if (vy1 > camY - 20 && vy0 < camY + 620) {
    const y0 = Math.max(vy0, camY - 20), y1 = Math.min(vy1, camY + 620);
    box(c, x, y0, w, y1 - y0, S[2]); box(c, lt ? x + w - 3 : x, y0, 3, y1 - y0, S[4]); box(c, lt ? x : x + w - 2, y0, 2, y1 - y0, INK);
  }
  // (the slab: either side of the hole; the hole's cut ends going down into the dark)
  if (top + CRYPT.slab > camY - 20 && top < camY + 620) {
    for (const [a, b] of [[CRYPT.a, HOLE.a], [HOLE.b, HATCH.a]] as const) still(c, `sq-crypt-slab-${a}`, X(a), top, 0, 0, b - a, CRYPT.slab, g => paintSlab(g, b - a));
    // (the hatch: an iron grate over the ladder's shaft, lit along its top (stood on), the dark between its bars)
    still(c, 'sq-crypt-grate', X(HATCH.a), top, 0, 0, HATCH.b - HATCH.a, CRYPT.slab, g => {
      const w = HATCH.b - HATCH.a, Ir = rampH(IRON);
      box(g, 0, 0, w, CRYPT.slab, rampH(VAULT, true)[0]);
      box(g, 0, 0, w, 5, INK); box(g, 0, 1, w, 3, Ir[4]); box(g, 0, 0, w, 1, LIP[3]);
      for (let x = 2; x < w; x += 8) { box(g, x, 4, 4, CRYPT.slab - 4, INK); box(g, x + 1, 4, 2, CRYPT.slab - 6, Ir[3]); box(g, x + 1, 4, 1, CRYPT.slab - 6, Ir[5]); }
    });
    box(c, X(HOLE.a), top, HOLE.b - HOLE.a, CRYPT.slab, rampH(VAULT, true)[1]); checker(c, X(HOLE.a), top + CRYPT.slab - 4, HOLE.b - HOLE.a, 4, rampH(VAULT, true)[2], 0, 2);
    for (const x of [X(HOLE.a), X(HOLE.b) - 4]) { box(c, x, top, 4, CRYPT.slab, S[1]); box(c, x + (x === X(HOLE.a) ? 0 : 3), top, 1, CRYPT.slab, INK); }
  }
  // (the crypt's floor: flagstones, lit along the top; bones swept into the corners)
  const fy = Y(CRYPT.floor);
  if (fy > camY - 40 && fy < camY + 640) still(c, 'sq-crypt-floor', L, fy, 0, 0, Rr - L, 70, g => {
    const F = rampH(STONE), w = Rr - L;
    box(g, 0, 0, w, 70, F[1]); for (let y = 6; y < 70; y += 14) { box(g, 0, y, w, 1, F[0]); for (let x = (y % 28) * 2; x < w; x += 56) box(g, x, y, 1, 14, F[0]); }
    box(g, 0, 0, w, 6, F[3]); box(g, 0, 4, w, 2, F[2]); box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
    for (let k = 0; k < 9; k++) { const x = hash(k * 3.7) < 0.5 ? 6 + hash(k) * 60 : w - 70 + hash(k) * 60; box(g, x, -3, 10, 3, '#D8D2C0'); box(g, x - 1, -4, 3, 4, '#E8E2D0'); }
  });
  // (the ledges and the niche)
  LEDGES.forEach((Lg, i) => { const y = Y(Lg.h); if (y > camY - 40 && y < camY + 640) still(c, `sq-crypt-ledge-${i}`, X(Lg.a), y, -2, -2, Lg.b - Lg.a + 4, 40, g => paintLedge(g, Lg.b - Lg.a)); });
  // (the niche: an arch cut into the left wall over it)
  { const y = Y(NICHE.h); if (y > camY - 160 && y < camY + 640) still(c, 'sq-crypt-niche', L, y, -26, -130, NICHE.b - CRYPT.a + 30, 132, g => {
    const w = NICHE.b - CRYPT.a;
    g.fillStyle = INK; g.beginPath(); g.moveTo(-24, 0); g.lineTo(-24, -90); g.quadraticCurveTo(w / 2, -150, w, -90); g.lineTo(w, 0); g.closePath(); g.fill();
    g.fillStyle = rampH(VAULT, true)[0]; g.beginPath(); g.moveTo(-22, 0); g.lineTo(-22, -86); g.quadraticCurveTo(w / 2, -144, w - 3, -86); g.lineTo(w - 3, 0); g.closePath(); g.fill();
    for (let k = 0; k < 9; k++) { const t = k / 8, ax = -24 + t * (w + 24), ay = -90 - Math.sin(t * Math.PI) * 30; box(g, ax - 5, ay - 5, 10, 8, rampH(STONE)[k % 2 ? 3 : 4]); box(g, ax - 5, ay - 5, 10, 1, rampH(STONE)[5]); }
  }); }
  // (the dragon head's pillar: background, dimmed (not stood on); its head; the glow in its mouth in the tell)
  const px = X(DRAGON.x), my = Y(DRAGON.h);
  if (onScreen(state, px - 300, px + 40) && my > camY - 200 && my < camY + 800) {
    const y0 = Math.max(vy0, camY - 20), y1 = Math.min(vy1, camY + 620);
    if (y1 > y0) { box(c, px - 16, y0, 32, y1 - y0, S[2]); box(c, px - 16, y0, 4, y1 - y0, S[3]); box(c, px + 12, y0, 4, y1 - y0, S[1]); for (let y = Math.ceil(y0 / 20) * 20; y < y1; y += 20) box(c, px - 16, y, 32, 1, S[1]); }
    still(c, 'sq-crypt-dragon', px - 14, my, -52, -38, 56, 58, paintDragon);
    const d = dragonPhase(f);
    if (d.tell > 0) {
      c.save(); c.globalAlpha = 0.25 + d.tell * 0.6; c.fillStyle = f % 6 < 3 ? '#FB923C' : '#FDE047'; c.fillRect(px - 58, my - 1, 14, 8); c.restore();
      if (f % 5 === 0) state.particles.push({ pos: { x: px - 58, y: my }, vel: { x: -0.4 - Math.random() * 0.4, y: -0.6 - Math.random() * 0.6 }, life: 40, color: Math.random() < 0.5 ? '#4A4458' : '#6A6478', size: 4 + Math.random() * 4 });
    }
  }
};

/** In front of the stairs, behind him: the axes, the fire, the ladder, the can. */
export const drawCryptMid = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(CRYPT.a) - 60, X(CRYPT.b) + 60)) return;
  const f = state.frame, camY = state.camera.y;
  drawStairs(c, state, crOf(state).stairs);
  drawLadders(c, state, LADDERS);
  // (the axes: a chain from its iron ring in the vault, the blade turned with the swing)
  const art = axeArt();
  for (const a of AXES) {
    const py = Y(a[1]);
    if (py - 10 > camY + 640 || py + a[2] + 40 < camY - 40) continue;
    const b = axeAt(f, a), px = X(a[0]);
    box(c, px - 5, py - 4, 10, 6, INK); box(c, px - 4, py - 3, 8, 4, IRON[3]);
    const n = Math.floor(a[2] / 7);
    for (let k = 1; k < n; k++) { const t = k / n, x = px + (b.x - px) * t, y = py + (b.y - py) * t; box(c, Math.round(x) - 1, Math.round(y) - 2, 3, 4, k % 2 ? '#3A3650' : '#6A6688'); }
    c.save(); c.translate(b.x, b.y); c.rotate(-b.t); c.drawImage(art, -36, -14); c.restore();
  }
  // (the fire: a jet out of the dragon's mouth, banded red to yellow, licking; embers)
  const d = dragonPhase(f);
  if (d.burn > 0) {
    const mx = X(DRAGON.x) - 58, my = Y(DRAGON.h) + 3, len = DRAGON.reach * d.burn;
    for (const [col, hh, k] of [['#B91C1C', 18, 1], ['#F97316', 13, 0.92], ['#FDE047', 7, 0.8], ['#FFFBEB', 3, 0.55]] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(mx, my - hh * 0.4);
      for (let s = 0; s <= 8; s++) { const t = s / 8; c.lineTo(mx - len * k * t, my - hh * (0.4 + t * 0.6) + Math.sin(f * 0.7 + s * 1.7) * 3); }
      for (let s = 8; s >= 0; s--) { const t = s / 8; c.lineTo(mx - len * k * t, my + hh * (0.4 + t * 0.6) + Math.sin(f * 0.9 + s * 1.3) * 3); }
      c.closePath(); c.fill();
    }
    if (f % 2 === 0) state.particles.push({ pos: { x: mx - Math.random() * len, y: my + (Math.random() - 0.5) * 20 }, vel: { x: -1 - Math.random(), y: -1 - Math.random() * 2 }, life: 20, color: Math.random() < 0.5 ? '#FDBA74' : '#FDE047', size: 2 });
  }
  if (canHere(state) && CAN.y > camY - 80 && CAN.y < camY + 680) drawCan(c, CAN.x, CAN.y, f);
};

/** The ammo can (its foot's middle at x, y): olive steel, stenciled, a big brass round standing up out of it; baked
 *  once, a bob and a soft glow per frame. */
const paintCan = (g: Ctx) => {
  const Ol = ['#1E2414', '#2E3820', '#46542E', '#5E6E3E', '#7E9054', '#A8B87A'], Br = ['#3A2410', '#6A4418', '#A06C1C', '#D8A23A', '#F2C84A', '#FFF0A8'];
  // (the round: casing, the bullet's copper nose)
  box(g, -7, -50, 14, 26, INK); box(g, -6, -49, 12, 25, Br[3]); box(g, -6, -49, 3, 25, Br[5]); box(g, 3, -49, 3, 25, Br[1]);
  polyF(g, [[-7, -50], [0, -64], [7, -50]], INK); polyF(g, [[-6, -50], [0, -62], [6, -50]], '#C2662E'); polyF(g, [[-6, -50], [0, -62], [-2, -50]], '#E89A5E');
  // (the can: a box, its lid's lip, the handle, the stencil)
  box(g, -17, -28, 34, 28, INK); box(g, -16, -27, 32, 27, Ol[3]); box(g, -16, -27, 32, 3, Ol[5]); box(g, -16, -27, 3, 27, Ol[4]); box(g, 13, -27, 3, 27, Ol[1]);
  box(g, -16, -22, 32, 2, Ol[2]); box(g, -6, -32, 12, 3, INK); box(g, -5, -31, 10, 1, Ol[4]);
  box(g, -10, -15, 20, 7, Ol[1]); for (let k = 0; k < 5; k++) box(g, -9 + k * 4, -14, 2, 5, '#E8E0B0');
  box(g, -16, -3, 32, 3, Ol[1]);
};
const drawCan = (c: Ctx, x: number, y: number, f: number) => {
  const bob = Math.round(Math.sin(f * 0.06) * 3);
  c.save();
  for (let i = 3; i >= 1; i--) { c.globalAlpha = 0.09 * (4 - i) / 3 + (f % 50 < 6 ? 0.04 : 0); c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(x, y - 30 + bob, 20 + i * 9, 0, Math.PI * 2); c.fill(); }
  c.restore();
  still(c, 'sq-crypt-can', x, y - 2 + bob, -20, -68, 40, 70, paintCan);
};
