// THE CRYPT UNDER THE GRAND STAIRCASE: a max ammo find (upgrades/SPEC.md: +10% ammo in every weapon, one of 5; the
// last of them). The owner: "this part in fairy land, in the grand staircase, just before the first trial. there will
// be a staircase going downard, have some tricky downward stair based platforming, similar to the other one later in
// the stage but this one you need to move down while avoiding stuff on the way down." / "that is the final ammo pickup".
// Then (2026-11-03): "make sure there isn't a ladder there. you can just climb down and get it without incident. make it
// a cannon that just shoots you straight up. also make sure the window better lines up with the environment. make the
// amount of stairs you need to go down a bit further too and you cannot 'jump down' to skip. make the background a bit
// more detailed and dungeon like in this small area"; "make it so the pillar doesn't go all the way down but has a small
// gap you can walk under" ("it comes short of touching the floor"); "the pillar has collision".
//
// In the hall's floor, between the pier's column and the far staircase's foot: THE TRAPDOOR STAIRS (E0), a flight lying
// level in the floor (it IS the floor there, walked over) that tells and dips down into the dark and back, on the clock.
// Under the hall, the crypt (a cutaway), a stairwell of four more flights in TIERS, zigzagging down, left of the big
// pillar:
//   E0 to D1, a bracket ledge under the floor. Then per tier: a flight (M1..M4) down off the last ledge, its free end
//   swinging between a steep dock (short of the landing, over the spikes) and the landing; the landing a stone PIER; past
//   the pier a drop to the next tier's STEP (a corbelled ledge on the wall) where the next flight starts, back the other
//   way, under the pier and the tier's spike trough (they're its low ceiling).
//   Under every flight: a TROUGH OF SPIKES (a slab, iron spikes along its top). Off a flight, he lands on them: hurt, and
//   put back on the last landing he stood on. So there's no jumping down to skip it: every way down is the stairs.
//   The hazards, teach then escalate: M1 one slow PENDULUM AXE; M2 a quicker one; the step before M3 the DRAGON HEAD's
//   fire (a gargoyle on the pillar, smoke and a glow first); M3 two axes; M4 two quicker ones.
//   At the bottom, THE VAULT ROOM: the ammo can in an arched alcove at the floor, and under the pillar's foot (a low gap,
//   walked under) the RETURN CANNON (upgrades/returnCannon.ts) in its shaft by the right wall: straight up the shaft,
//   through the iron grate in the hall's floor (thrown open), and down on the grate (the hall's far end; the bro up on
//   the high landing is held off while he lands: nobody's there).
//
// Heights up from the ground line (negative: under it); x from the section's start (layout.ts X / Y).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { worldSound } from '../../onScreen';
import { makeStairs, updateStairs, drawStairs, stairEnd, type Stair, type StairDef } from '../stairs';
import { ledge, solid, meatheadSays, byPants, teleport } from '../section';
import { type Ctx, INK, box, mix, hash, checker, still, onScreen, slab, polyF, STONE, IRON, GOLD, LIP, rampH } from '../kit';
import { GY } from '../geometry';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import { timeOfDay } from '../../timeOfDay';
import { X, Y } from './layout';
import { AMMO_GOT } from './lines';
import { ammoWon, awardAmmo, openAmmoCard, tickAmmoCard, type AmmoCard } from '../../upgrades/ammoAward';
import { makeCannon, updateCannon, cannonBusy, drawCannon, SPOOKY, type Cannon } from '../../upgrades/returnCannon';

const LAND = 'fantasy', FIND_ID = 'ammo-crypt';

// ---------------------------------------------------------------------------------------------------------------
// Where it all is

/** The hole in the hall's floor (the trapdoor stairs lie across it), the crypt's walls and its bottom, the slab's depth. */
export const HOLE = { a: 11800, b: 12000 };
export const CRYPT = { a: 11240, b: 12290, floor: -1540, slab: 24 };
/** The big pillar (solid: its sides are walls, its foot a low ceiling over the gap), the cannon's shaft right of it, and
 *  the iron grate over the shaft in the hall's floor (solid: stood on, never dropped through). */
export const PILLAR = { a: 12130, b: 12170 };
export const HATCH = { a: PILLAR.b, b: 12300 };
const rel = (p: { x: number; y: number }) => ({ x: Math.round(p.x - X(0)), h: Math.round(GY - p.y) });

const E0: StairDef = { px: X(HOLE.b), py: Y(0), len: HOLE.b - HOLE.a, docks: [Math.PI, Math.PI - 0.75], hold: 170, swing: 60 };
const e0 = rel(stairEnd(E0, 1));
const D1 = { a: e0.x - 90, b: e0.x, h: e0.h };

/** A flight's length, its landing dock and its steep one (down off level), the pier's width, the spikes' top under the
 *  landing, a slab's thickness, the drop off a pier to the next step. (The next flight starts under the pier: its head
 *  room there is STEP - TROUGH - SLAB_T - his height = 6.) */
const FLIGHT = 380, LAND_A = 0.45, STEEP_A = 0.6, PIER_W = 80, TROUGH = 90, SLAB_T = 30, STEP = 190;
type Span = { a: number; b: number; h: number };
interface Tier { s: StairDef; d: 1 | -1; px: number; ph: number; ceil: number; pier: Span; trough: Span; step: Span | null }
/** Each flight's clock: [hold, swing, phase]; its axes: [along it from the pivot, swing (radians either side), period,
 *  phase] (the chain's from the ceiling down to his chest over the flight). Checked in a sim (the walk through each,
 *  with a 4 px margin): M1's window 61 frames, M2's 41, M3's 45 (two), M4's 36 (two); the pivots and landings never hit. */
const CLOCKS: [number, number, number][] = [[110, 36, 0], [110, 36, 60], [100, 34, 20], [96, 32, 90]];
const AXE_SPEC: [number, number, number, number][][] = [
  [[170, 0.8, 190, 0]],
  [[180, 0.8, 160, 30]],
  [[130, 0.95, 170, 0], [240, 0.95, 170, 135]],
  [[130, 0.95, 150, 0], [240, 0.95, 150, 120]],
];
const TIERS: Tier[] = [];
{
  let px = D1.a, ph = D1.h, d: 1 | -1 = -1, ceil = -CRYPT.slab;
  for (let k = 0; k < 4; k++) {
    const last = k === 3;
    const lx = Math.round(px + d * FLIGHT * Math.cos(LAND_A)), lh = Math.round(ph - FLIGHT * Math.sin(LAND_A));
    const pier = last ? { a: lx, b: CRYPT.b, h: lh } : d < 0 ? { a: lx - PIER_W, b: lx, h: lh } : { a: lx, b: lx + PIER_W, h: lh };
    const trough = d < 0 ? { a: lx, b: PILLAR.a, h: lh - TROUGH } : { a: CRYPT.a, b: lx, h: lh - TROUGH };
    const step = last ? null : d < 0 ? { a: CRYPT.a, b: pier.a, h: lh - STEP } : { a: pier.b, b: PILLAR.a, h: lh - STEP };
    const [hold, swing, phase] = CLOCKS[k];
    const s: StairDef = { px: X(px), py: Y(ph), len: FLIGHT, docks: d < 0 ? [Math.PI - STEEP_A, Math.PI - LAND_A] : [STEEP_A, LAND_A], hold, swing, phase };
    TIERS.push({ s, d, px, ph, ceil, pier, trough, step });
    if (step) { px = d < 0 ? pier.a : pier.b; ph = step.h; }
    ceil = trough.h - SLAB_T; d = d < 0 ? 1 : -1;
  }
}
/** The vault room at the bottom: its floor (the last pier, out to the right wall), its ceiling (the last tier's trough's
 *  underside). The pillar's foot: a gap over the floor he walks under (his 64, and 26 to spare). */
const ROOM = TIERS[3].pier;
const ROOM_CEIL = TIERS[2].trough.h - SLAB_T;
const GAP = 90;
const PILLAR_FOOT = ROOM.h + GAP;
export const CRYPT_STAIRS: StairDef[] = [E0, ...TIERS.map(t => t.s)].map(d => ({ stone: '#8A80A6', lip: '#F2E2B8', ...d }));

/** The pendulum axes: pivot x, the ceiling's height, chain, swing, period, phase. */
interface Axe { x: number; h: number; ch: number; sw: number; per: number; ph: number }
const AXES: Axe[] = TIERS.flatMap((t, k) => AXE_SPEC[k].map(([u, sw, per, ph]) => {
  const line = t.ph - u * Math.tan(LAND_A);
  return { x: t.px + t.d * u, h: t.ceil, ch: Math.round(t.ceil - (line + 38)), sw, per, ph };
}));
const BLADE_R = 26;
/** The dragon head on the pillar's left face, over the step before M3: its mouth's height, the jet's reach (left, to just
 *  short of M3's pivot: on the flight he's out of it). */
const STEP2 = TIERS[1].step!;
const DRAGON = { x: PILLAR.a, h: STEP2.h + 40, mouth: PILLAR.a - 46, reach: PILLAR.a - 46 - (STEP2.a + 10), period: 200, tell: 50, burn: 70 };
/** The ammo can (its foot's middle, world), in its alcove; the cannon in the shaft. */
const CAN_X = 11905;
const CAN = { x: X(CAN_X), y: Y(ROOM.h) };
const CANNON_X = Math.round((HATCH.a + CRYPT.b) / 2);
/** Where he's put back after the spikes: the landings (the step under the dragon's fire puts him on the pier over it). */
const SAFE: (Span & { to: Span })[] = [
  { ...D1, to: D1 },
  ...TIERS.flatMap((t, k) => [{ ...t.pier, to: t.pier }, ...(t.step ? [{ ...t.step, to: k === 1 ? t.pier : t.step }] : [])]),
];
/** The torches in their sconces on the back wall (the flame's foot): lit by the lighting, flickering. */
const TORCHES: [number, number][] = [[11300, -330], [11980, -250], [11460, -620], [12050, -700], [11300, -1060], [11880, -1010], [11830, -1260], [11985, -1260]];

// ---------------------------------------------------------------------------------------------------------------
// Its state (one per stage build)

interface Cr { stairs: Stair[]; card: AmmoCard | null; taken: boolean; cannon: Cannon; back: Span; grate: number }
const ALL = new WeakMap<object, Cr>();
const newCannon = () => makeCannon(X(CANNON_X), Y(ROOM.h), { x: X(CANNON_X), y: Y(0) }, { x: X(CANNON_X), y: Y(0) });
const crOf = (state: GameState): Cr => {
  const k = state.stage as object;
  let o = ALL.get(k);
  if (!o) { o = { stairs: [], card: null, taken: false, cannon: newCannon(), back: D1, grate: 0 }; ALL.set(k, o); }
  return o;
};
const canHere = (state: GameState) => !crOf(state).taken && !ammoWon(LAND, FIND_ID);

export const buildCrypt = (state: GameState) => {
  const cr = crOf(state);
  cr.stairs = makeStairs(state, CRYPT_STAIRS);
  cr.cannon = newCannon();
  const wall = (a: number, b: number, top: number, bot: number) => solid(state, X(a), Y(top), b - a, top - bot, { hidden: true });
  // (the hall's floor over the crypt either side of the hole; the grate over the cannon's shaft, solid)
  wall(CRYPT.a, HOLE.a, 0, -CRYPT.slab);
  wall(HOLE.b, HATCH.a, 0, -CRYPT.slab);
  wall(HATCH.a, HATCH.b, 0, -CRYPT.slab);
  // (the crypt's walls; the pillar, down to just short of the room's floor)
  wall(CRYPT.a - 60, CRYPT.a, -CRYPT.slab, CRYPT.floor - 80);
  wall(CRYPT.b, CRYPT.b + 60, -CRYPT.slab, CRYPT.floor - 80);
  wall(PILLAR.a, PILLAR.b, -CRYPT.slab, PILLAR_FOOT);
  // (the first ledge; each tier's pier, trough and step; the room's floor; the last trough down to the bottom)
  ledge(state, X(D1.a), Y(D1.h), D1.b - D1.a, { hidden: true });
  TIERS.forEach((t, k) => {
    const last = k === 3;
    wall(t.pier.a, t.pier.b, t.pier.h, last ? CRYPT.floor : t.trough.h - SLAB_T);
    wall(t.trough.a, t.trough.b, t.trough.h, last ? CRYPT.floor : t.trough.h - SLAB_T);
    if (t.step) wall(t.step.a, t.step.b, t.step.h, t.step.h - SLAB_T);
  });
};

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const hits = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const axeAng = (f: number, a: Axe) => Math.sin(((f + a.ph) / a.per) * Math.PI * 2) * a.sw;
const axeAt = (f: number, a: Axe) => { const t = axeAng(f, a); return { x: X(a.x) + Math.sin(t) * a.ch, y: Y(a.h) + Math.cos(t) * a.ch, t }; };
const dragonPhase = (f: number) => { const r = (f + 40) % DRAGON.period; return r < DRAGON.tell ? { tell: r / DRAGON.tell, burn: 0 } : r < DRAGON.tell + DRAGON.burn ? { tell: 0, burn: Math.min(1, (r - DRAGON.tell) / 8, (DRAGON.tell + DRAGON.burn - r) / 8) } : { tell: 0, burn: 0 }; };

/** Each frame, first thing: the card up, him held (index.ts's cutscene rule keeps his controls out); the cannon takes
 *  his controls while he's in it. */
export const updateCrypt = (ctx: FrameContext, controls: Controls): { out: Controls; held: boolean } => {
  const { state } = ctx, p = state.player, cr = crOf(state), f = state.frame;
  if (cr.card) {
    p.inCutscene = true; p.vel.x = 0;
    for (const e of state.enemies) e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2);
    if (tickAmmoCard(cr.card, f)) { cr.card = null; p.inCutscene = false; meatheadSays(state, pickLine(byPants(state, AMMO_GOT))); }
    return { out: controls, held: !!cr.card };
  }
  updateStairs(ctx, cr.stairs);
  if (cr.grate > 0) cr.grate--;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, rx = cx - X(0);
  // (the cannon: in the room, and all through the shot; nobody up in the hall goes for him while he's flying or landing)
  let out = controls;
  const inRoom = rx > ROOM.a && rx < CRYPT.b && feet > Y(ROOM_CEIL) && feet < Y(ROOM.h) + 8;
  if (cannonBusy(cr.cannon) || inRoom) {
    out = updateCannon(ctx, cr.cannon, controls, {
      onExit: (s, x, y) => {
        cr.grate = 40; playSound('clang', 0.8, -6);
        for (let j = 0; j < 14; j++) s.particles.push({ pos: { x: x + (Math.random() - 0.5) * 60, y: y + 4 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 30, color: j % 2 ? '#6A6478' : '#3A3650', size: 3 + Math.random() * 3, grav: 0.25 });
      },
      onLand: (s) => { s.gapGrace = Math.max(s.gapGrace || 0, 90); },
    });
    if (cannonBusy(cr.cannon)) state.gapGrace = Math.max(state.gapGrace || 0, 2);
  }
  const near = onScreen(state, X(CRYPT.a) - 200, X(CRYPT.b) + 200);
  if (!near) return { out, held: false };
  // (the last landing he stood on: where the spikes put him back)
  if (p.isGrounded && p.health > 0) {
    if (Math.abs(feet - Y(0)) < 3) cr.back = D1;
    else for (const s of SAFE) if (Math.abs(feet - Y(s.h)) < 3 && rx > s.a && rx < s.b) { cr.back = s.to; break; }
  }
  // (the spikes: on them, hurt (unless he's still blinking from the last), and put back)
  if (p.health > 0 && !p.inCutscene && p.vel.y >= 0) {
    for (const t of TIERS) {
      const tr = t.trough;
      if (Math.abs(feet - Y(tr.h)) < 4 && rx > tr.a + 4 && rx < tr.b - 4) {
        playSound('splat', 0.7, -4);
        for (let j = 0; j < 12; j++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 20, y: feet - 4 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 26, color: j % 3 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2, grav: 0.2 });
        if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 12, 'm2:fa_spikes', { x: 0, y: -3 });
        if (p.health > 0) { const b = cr.back; teleport(state, X((b.a + b.b) / 2), Y(b.h)); }
        break;
      }
    }
  }
  // (the axes: the blade's disc; the chain's harmless)
  for (const a of AXES) {
    const b = axeAt(f, a);
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, b.x - BLADE_R, b.y - BLADE_R * 0.6, BLADE_R * 2, BLADE_R * 1.4)) hurtPlayer(ctx, 12, 'm2:fa_axe', { x: (cx < b.x ? -1 : 1) * 5, y: -4 });
    // (the swoosh as it passes the bottom of its swing, near him)
    if (Math.abs(b.t) < 0.05 && f % 4 === 0) worldSound(state, 'whoosh', 0.25, -6, b.x - BLADE_R, b.y - BLADE_R, BLADE_R * 2, BLADE_R * 2);
  }
  // (the dragon head: smoke and a glow, then fire across the step to its left)
  const d = dragonPhase(f), mx = X(DRAGON.mouth), my = Y(DRAGON.h);
  if (d.burn > 0.3 && f % 10 === 1 && alive(state) && p.invincibilityTimer <= 0 && hits(state, mx - DRAGON.reach, my - 22, DRAGON.reach, 44)) hurtPlayer(ctx, 12, 'm2:fa_dragonhead', { x: -4, y: -3 });
  if (Math.abs(cx - mx) < 700 && Math.abs(p.pos.y - my) < 500) {
    const r = (f + 40) % DRAGON.period;
    if (r === 0) playSound('rumble', 0.3, 6);
    if (r === DRAGON.tell) playSound('flame', 0.5);
  }
  // (the can: touched, it's his)
  if (canHere(state) && alive(state)) {
    if (Math.abs(cx - CAN.x) < 28 && feet > CAN.y - 60 && p.pos.y < CAN.y - 6) {
      cr.taken = true;
      playSound('powerup', 0.6, 4);
      for (let j = 0; j < 22; j++) state.particles.push({ pos: { x: CAN.x + (Math.random() - 0.5) * 20, y: CAN.y - 20 + (Math.random() - 0.5) * 20 }, vel: { x: (Math.random() - 0.5) * 5, y: -1 - Math.random() * 4 }, life: 36, color: j % 3 ? '#FDE68A' : '#FFFFFF', size: 2 + Math.random() * 2, grav: 0.08 });
      if (awardAmmo(LAND, FIND_ID)) { cr.card = openAmmoCard(); p.inCutscene = true; p.vel.x = 0; return { out, held: true }; }
    }
  }
  return { out, held: false };
};

/** (index.ts lighting) Down in the crypt, the dark comes in (eased with the camera's depth under the hall's floor); the
 *  torches cut out of it, flickering. */
export const cryptLight = (state: GameState, base: SceneLight | null | undefined): SceneLight | null => {
  if (!onScreen(state, X(CRYPT.a), X(CRYPT.b))) return base ?? null;
  const camMid = state.camera.y + 300, u = Math.max(0, Math.min(1, (camMid - Y(0)) / 260));
  const k = u * u * (3 - 2 * u);
  if (k <= 0.01) return base ?? null;
  const f = state.frame, lights: Light[] = [...(base?.lights ?? [])];
  TORCHES.forEach(([x, h], i) => {
    const y = Y(h) - 12;
    if (y < state.camera.y - 200 || y > state.camera.y + 800) return;
    const fl = Math.sin(f * 0.23 + i * 1.7) * 6 + Math.sin(f * 0.61 + i) * 4;
    lights.push({ x: X(x), y, r: 120 + fl, a: 0.8 * k, color: 'rgba(255, 168, 80, 0.16)' });
  });
  // (the ammo can's own glow)
  if (canHere(state)) lights.push({ x: CAN.x, y: CAN.y - 30, r: 70, a: 0.6 * k, color: 'rgba(253, 230, 138, 0.12)' });
  return { dark: Math.max(base?.dark ?? 0, 0.55 * k), shade: [12, 8, 22], rim: 0.35, grade: base?.grade, lights };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing. Behind everything of the crypt: the vault's back wall (baked in tiles: ashlar in banded courses, mortar,
// damp, moss, cracks; chains and shackles, a skeleton hung in irons, barred cell windows, sconces, cobwebs, a drain,
// the can's alcove), dimmed (none of it's stood on). Then the solid stone (the hall's floor, the walls, the pillar, the
// piers, steps, troughs and the room's floor: each baked once, lit along a top that's stood on; the spikes' tops not),
// the torches' flames, the gargoyle. Then (in drawCryptMid) the stairs, the axes, the fire, the cannon, the can.

const TILE = 256;
const VAULT = ['#120E1E', '#1C162C', '#28203C', '#362C4E', '#4A3E64', '#665A82'];
const MOSS = ['#14241A', '#1E3A26', '#2E5232', '#4A7040'];
type Feat = { k: 'chain' | 'skeleton' | 'cell' | 'sconce' | 'web' | 'drain' | 'alcove' | 'damp' | 'crack'; x: number; h: number; s?: number };
/** The back wall's set dressing, placed (x, height; s: a size or a side). */
const FEATS: Feat[] = [
  ...TORCHES.map(([x, h]): Feat => ({ k: 'sconce', x, h })),
  { k: 'chain', x: 11560, h: -40, s: 70 }, { k: 'chain', x: 11600, h: -40, s: 90 },
  { k: 'cell', x: 11540, h: -530 }, { k: 'cell', x: 11640, h: -930 },
  { k: 'skeleton', x: 12000, h: -900 },
  { k: 'chain', x: 11330, h: -430, s: 50 }, { k: 'chain', x: 11930, h: -470, s: 60 }, { k: 'chain', x: 11290, h: -1270, s: 60 },
  { k: 'web', x: CRYPT.a, h: -CRYPT.slab, s: 1 }, { k: 'web', x: PILLAR.a, h: TIERS[0].trough.h - SLAB_T, s: -1 },
  { k: 'web', x: CRYPT.a, h: TIERS[1].trough.h - SLAB_T, s: 1 }, { k: 'web', x: PILLAR.a, h: ROOM_CEIL, s: -1 },
  { k: 'web', x: CRYPT.b, h: -CRYPT.slab, s: -1 }, { k: 'web', x: PILLAR.b, h: ROOM_CEIL, s: 1 },
  { k: 'damp', x: 11700, h: TIERS[0].trough.h - SLAB_T, s: 120 }, { k: 'damp', x: 11420, h: TIERS[1].trough.h - SLAB_T, s: 150 },
  { k: 'damp', x: 12080, h: ROOM_CEIL, s: 200 }, { k: 'damp', x: 11880, h: -CRYPT.slab, s: 160 }, { k: 'damp', x: 12230, h: -CRYPT.slab, s: 300 },
  { k: 'crack', x: 11760, h: -300 }, { k: 'crack', x: 11380, h: -700 }, { k: 'crack', x: 12210, h: -800 }, { k: 'crack', x: 11720, h: -1220 },
  { k: 'drain', x: 12060, h: ROOM.h },
  { k: 'alcove', x: CAN_X, h: ROOM.h },
];
const featBox = (q: Feat): [number, number, number, number] => {
  switch (q.k) {
    case 'chain': return [q.x - 10, -q.h, 20, (q.s ?? 60) + 14];
    case 'skeleton': return [q.x - 40, -q.h - 20, 80, 140];
    case 'cell': return [q.x - 30, -q.h - 30, 60, 60];
    case 'sconce': return [q.x - 14, -q.h - 10, 28, 40];
    case 'web': return [q.x - 50, -q.h, 100, 50];
    case 'drain': return [q.x - 30, -q.h - 30, 60, 30];
    case 'alcove': return [q.x - 50, -q.h - 140, 100, 140];
    case 'damp': return [q.x - 14, -q.h, 28, q.s ?? 120];
    case 'crack': return [q.x - 30, -q.h - 30, 60, 60];
  }
};

/** One tile of the vault's back wall. Tile (i, j): x from the crypt's left, y down from the hall's floor's top (so the
 *  set dressing's heights are -y). */
const paintVault = (g: Ctx, i: number, j: number) => {
  const W = rampH(VAULT, true), S = rampH(STONE, true), Ir = rampH(IRON, true), M = rampH(MOSS, true);
  const x0 = i * TILE, y0 = j * TILE;
  // (darker going down, in bands, dithered between)
  const band = (y: number) => Math.min(2, Math.floor((y0 + y) / 520));
  for (let y = 0; y < TILE; y += 4) box(g, 0, y, TILE, 4, W[2 - band(y)]);
  for (let b = 1; b < 3; b++) { const by = b * 520 - y0; if (by > -4 && by < TILE) checker(g, 0, by - 3, TILE, 6, W[3 - b], 0, 2); }
  // (the ashlar: courses 20 tall, blocks of their own widths, each banded (lit top, its face, a shaded foot), mortar
  // between; some picked out lighter, some darker, a few chipped)
  const CH = 20;
  for (let y = -(y0 % CH); y < TILE; y += CH) {
    const row = Math.floor((y0 + y) / CH), bd = band(Math.max(0, y));
    box(g, 0, y, TILE, 2, W[0]);
    // (walk the course from the crypt's left (a seeded start), so a block that straddles two tiles matches)
    let wsx = -40 + Math.floor(hash(row * 1.7) * 40);
    while (wsx < x0 + TILE) {
      const seed = hash(wsx * 0.071 + row * 13.3), w = 26 + Math.floor(seed * 36), bx = wsx - x0;
      if (bx + w > 0) {
        const tone = seed > 0.78 ? 4 : seed < 0.18 ? 2 : 3, base = W[Math.max(1, tone - bd)];
        box(g, bx + 1, y + 2, w - 1, CH - 2, base);
        box(g, bx + 1, y + 2, w - 1, 2, W[Math.min(5, tone - bd + 1)]);
        box(g, bx + 1, y + CH - 4, w - 1, 2, W[Math.max(0, tone - bd - 1)]);
        if (seed > 0.4 && seed < 0.47) checker(g, bx + 2, y + 6, w - 4, CH - 10, W[Math.max(0, tone - bd - 1)], 0, 1);
        if (seed > 0.9) { box(g, bx + w - 7, y + 2, 6, 5, W[0]); box(g, bx + w - 7, y + 7, 6, 1, W[Math.min(5, tone - bd + 1)]); }
        // (moss along the tops of the low courses, now and then)
        if (y0 + y > 300 && hash(wsx * 0.013 + row) > 0.86) { box(g, bx + 3, y + 2, Math.min(w - 4, 14), 2, M[2]); box(g, bx + 5, y + 4, 6, 2, M[1]); box(g, bx + 4, y + 2, 3, 1, M[3]); }
        box(g, bx, y + 2, 1, CH - 2, W[0]);
      }
      wsx += w;
    }
  }
  // (the set dressing over it)
  for (const q of FEATS) {
    const [fx, fy, fw, fh] = featBox(q), lx = q.x - CRYPT.a - x0, ly = -q.h - y0;
    if (fx - CRYPT.a + fw < x0 || fx - CRYPT.a > x0 + TILE || fy + fh < y0 || fy > y0 + TILE) continue;
    paintFeat(g, q, lx, ly, W, S, Ir, M);
  }
};

const paintFeat = (g: Ctx, q: Feat, x: number, y: number, W: string[], S: string[], Ir: string[], M: string[]) => {
  const bone = mix('#D8D2C0', W[3], 0.35), boneL = mix('#F0ECE0', W[3], 0.3), boneD = mix('#9A9282', W[2], 0.35);
  switch (q.k) {
    case 'chain': {
      // (an iron ring in the wall, a chain down off it, a shackle on its end)
      const n = q.s ?? 60;
      box(g, x - 4, y, 8, 6, INK); box(g, x - 3, y + 1, 6, 4, Ir[3]); box(g, x - 3, y + 1, 6, 1, Ir[5]);
      for (let cy = y + 6; cy < y + n; cy += 6) { box(g, x - 2, cy, 4, 5, INK); box(g, x - 1, cy + 1, 2, 3, (cy / 6) % 2 ? Ir[3] : Ir[4]); }
      box(g, x - 6, y + n, 12, 8, INK); box(g, x - 5, y + n + 1, 10, 6, Ir[2]); box(g, x - 3, y + n + 3, 6, 3, INK); box(g, x - 5, y + n + 1, 10, 1, Ir[4]);
      break;
    }
    case 'skeleton': {
      // (a skeleton hung up by the wrists in irons, slumped, its jaw dropped)
      for (const s of [-1, 1]) {
        box(g, x + s * 30 - 3, y - 4, 6, 6, INK); box(g, x + s * 30 - 2, y - 3, 4, 4, Ir[3]);
        for (let cy = y + 2; cy < y + 18; cy += 5) box(g, x + s * 30 - 1, cy, 2, 4, Ir[3]);
        box(g, x + s * 30 - 4, y + 18, 8, 5, INK); box(g, x + s * 30 - 3, y + 19, 6, 3, Ir[2]);
        // (the arm: up off the shoulder to the iron)
        polyF(g, [[x + s * 10, y + 44], [x + s * 30, y + 22], [x + s * 30 + s * 3, y + 24], [x + s * 12, y + 47]], bone);
      }
      // (the skull, slumped onto its shoulder; the ribs; the spine; the pelvis; the legs hanging)
      g.fillStyle = INK; g.beginPath(); g.arc(x + 4, y + 36, 10, 0, Math.PI * 2); g.fill();
      g.fillStyle = bone; g.beginPath(); g.arc(x + 4, y + 36, 8.5, 0, Math.PI * 2); g.fill(); box(g, x + 1, y + 30, 4, 2, boneL);
      box(g, x - 1, y + 35, 4, 4, INK); box(g, x + 6, y + 35, 4, 4, INK); box(g, x + 3, y + 40, 2, 2, INK);
      box(g, x - 1, y + 45, 10, 4, bone); for (let k = 0; k < 4; k++) box(g, x + k * 2, y + 45, 1, 4, INK);
      box(g, x - 1, y + 48, 2, 50, boneD);
      for (let k = 0; k < 5; k++) { box(g, x - 13 + k, y + 52 + k * 6, 26 - k * 2, 2, bone); box(g, x - 13 + k, y + 54 + k * 6, 26 - k * 2, 1, boneD); }
      polyF(g, [[x - 12, y + 96], [x + 12, y + 96], [x + 8, y + 106], [x - 8, y + 106]], bone);
      for (const s of [-1, 1]) { polyF(g, [[x + s * 6, y + 104], [x + s * 10, y + 104], [x + s * 12, y + 134], [x + s * 8, y + 134]], bone); box(g, x + s * 10 - 4, y + 134, 8, 3, boneD); }
      break;
    }
    case 'cell': {
      // (a barred cell window: a deep dark hole in a dressed stone frame, a lintel and sill, iron bars, a faint cold
      // light behind)
      box(g, x - 26, y - 24, 52, 48, INK);
      box(g, x - 25, y - 23, 50, 46, S[2]); box(g, x - 25, y - 23, 50, 3, S[3]); box(g, x - 25, y + 19, 50, 4, S[3]); box(g, x - 25, y + 19, 50, 1, S[4]);
      box(g, x - 18, y - 16, 36, 34, '#05030A'); box(g, x - 18, y - 16, 36, 10, mix('#2A3A5A', W[0], 0.6)); checker(g, x - 18, y - 6, 36, 4, mix('#2A3A5A', W[0], 0.6), 0, 1);
      for (let k = 0; k < 4; k++) { const bx = x - 14 + k * 9; box(g, bx, y - 16, 3, 34, INK); box(g, bx + 1, y - 16, 1, 34, Ir[4]); }
      box(g, x - 18, y - 2, 36, 3, INK); box(g, x - 18, y - 1, 36, 1, Ir[4]);
      // (rust down the stone under it)
      for (let k = 0; k < 3; k++) box(g, x - 12 + k * 11, y + 23, 2, 8 + k * 4, mix('#6A3A1A', W[2], 0.5));
      break;
    }
    case 'sconce': {
      // (an iron sconce bolted on: a cup on a bracket, its back plate; soot up the wall over it)
      for (let k = 0; k < 4; k++) { g.globalAlpha = 0.25 - k * 0.05; box(g, x - 6 + k, y - 40 + k * 6, 12 - k * 2, 30, W[0]); }
      g.globalAlpha = 1;
      box(g, x - 4, y + 4, 8, 22, INK); box(g, x - 3, y + 5, 6, 20, Ir[3]); box(g, x - 3, y + 5, 2, 20, Ir[4]);
      polyF(g, [[x - 2, y + 18], [x + 2, y + 18], [x + 2, y + 4], [x - 2, y + 4]], Ir[2]);
      polyF(g, [[x - 9, y - 2], [x + 9, y - 2], [x + 6, y + 6], [x - 6, y + 6]], INK); polyF(g, [[x - 8, y - 1], [x + 8, y - 1], [x + 5, y + 5], [x - 5, y + 5]], Ir[3]);
      box(g, x - 8, y - 1, 16, 1, Ir[5]);
      break;
    }
    case 'web': {
      // (a cobweb in the corner of a ceiling and a wall: s, the side the wall's on)
      const s = q.s ?? 1;
      g.strokeStyle = mix('#C8C8DC', W[2], 0.55); g.lineWidth = 1;
      for (let r = 8; r < 46; r += 9) { g.beginPath(); for (let a = 0; a <= 4; a++) { const t = (a / 4) * (Math.PI / 2), rr = r - (a % 2 ? 2 : 0); const px = x + s * Math.cos(t) * rr, py = y + Math.sin(t) * rr; if (a) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); }
      for (let a = 0; a <= 4; a++) { const t = (a / 4) * (Math.PI / 2); g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * Math.cos(t) * 48, y + Math.sin(t) * 48); g.stroke(); }
      break;
    }
    case 'drain': {
      // (a drain at the wall's foot: an arched mouth, iron bars, a wet stain down to it and green slime in its sill)
      for (let k = 0; k < 24; k += 2) box(g, x - 4 + Math.round(Math.sin(k * 0.6) * 2), y - 60 + k * 2, 8, 4, mix(W[2], '#1E3A2E', 0.45));
      g.fillStyle = INK; g.beginPath(); g.arc(x, y - 4, 22, Math.PI, 0); g.fill(); box(g, x - 22, y - 4, 44, 4, INK);
      g.fillStyle = S[2]; g.beginPath(); g.arc(x, y - 4, 20, Math.PI, 0); g.fill();
      g.fillStyle = '#05030A'; g.beginPath(); g.arc(x, y - 4, 15, Math.PI, 0); g.fill(); box(g, x - 15, y - 4, 30, 4, '#05030A');
      for (let k = -2; k <= 2; k++) { box(g, x + k * 6 - 1, y - 18 + Math.abs(k) * 2, 3, 18 - Math.abs(k) * 2, INK); box(g, x + k * 6, y - 18 + Math.abs(k) * 2, 1, 18 - Math.abs(k) * 2, Ir[4]); }
      box(g, x - 16, y - 2, 32, 2, M[2]); box(g, x - 10, y - 3, 8, 1, M[3]);
      break;
    }
    case 'alcove': {
      // (the can's alcove: an arch cut into the wall, springing off two plain jambs that stand on the floor (its sill is
      // the floor), dressed voussoirs round its head, a keystone; dark inside, a skull on a ledge at the back)
      const w = 76, top = 104, aw = w / 2;
      box(g, x - aw - 8, y - top + aw, w + 16, top - aw, INK);
      g.fillStyle = INK; g.beginPath(); g.arc(x, y - top + aw, aw + 8, Math.PI, 0); g.fill();
      // (the jambs, the voussoirs)
      for (const s of [-1, 1]) { const jx = s < 0 ? x - aw - 7 : x + aw + 1; box(g, jx, y - top + aw, 6, top - aw, S[3]); box(g, jx, y - top + aw, 1, top - aw, S[4]); for (let k = 1; k < 4; k++) box(g, jx, y - top + aw + k * 18, 6, 1, S[1]); }
      for (let k = 0; k < 9; k++) {
        const a0 = Math.PI + (k / 9) * Math.PI, a1 = Math.PI + ((k + 1) / 9) * Math.PI, cx = x, cy = y - top + aw;
        polyF(g, [[cx + Math.cos(a0) * (aw + 1), cy + Math.sin(a0) * (aw + 1)], [cx + Math.cos(a0) * (aw + 7), cy + Math.sin(a0) * (aw + 7)], [cx + Math.cos(a1) * (aw + 7), cy + Math.sin(a1) * (aw + 7)], [cx + Math.cos(a1) * (aw + 1), cy + Math.sin(a1) * (aw + 1)]], k === 4 ? S[4] : S[k % 2 ? 2 : 3]);
      }
      g.fillStyle = W[0]; g.beginPath(); g.arc(x, y - top + aw, aw, Math.PI, 0); g.fill(); box(g, x - aw, y - top + aw, w, top - aw, W[0]);
      checker(g, x - aw, y - top + aw - 8, w, top - aw + 8, '#08060E', 0, 2);
      box(g, x - aw, y - 3, w, 3, W[1]);
      // (the skull at the back, high, on its own little shelf)
      box(g, x + 14, y - 64, 20, 3, S[2]);
      g.fillStyle = bone; g.beginPath(); g.arc(x + 24, y - 72, 6, 0, Math.PI * 2); g.fill(); box(g, x + 20, y - 70, 3, 3, INK); box(g, x + 25, y - 70, 3, 3, INK);
      break;
    }
    case 'damp': {
      // (a damp streak down from a slab's underside: the stone darker and greener, a drip line, slime at its head)
      const n = q.s ?? 120;
      for (let k = 0; k < n; k += 2) { const ww = Math.max(2, 14 - (k / n) * 12); box(g, x - ww / 2 + Math.round(Math.sin(k * 0.13) * 2), y + k, ww, 2, mix(W[2], '#1E3A2E', 0.4 * (1 - k / n) + 0.1)); }
      box(g, x - 8, y, 16, 3, M[1]); box(g, x - 4, y + 3, 8, 2, M[2]); box(g, x, y + 5, 2, 6, M[3]);
      break;
    }
    case 'crack': {
      // (a crack through a few courses: dark, lit along its lower lip)
      let cx = x, cy = y - 26;
      for (let k = 0; k < 9; k++) { const nx = cx + (hash(q.x + k) - 0.5) * 12, ny = cy + 6; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(nx, ny); g.stroke(); g.strokeStyle = W[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx + 1, cy + 1); g.lineTo(nx + 1, ny + 1); g.stroke(); cx = nx; cy = ny; }
      break;
    }
  }
};

/** Dressed stone, lit along its top only if it's stood on (`lit`); its underside's shadow. A block of the crypt's. */
const paintBlock = (g: Ctx, w: number, h: number, lit: boolean, seed: number) => {
  const S = rampH(STONE);
  box(g, 0, 0, w, h, INK); slab(g, 1, 1, w - 2, h - 2, S);
  for (let y = 10; y < h - 4; y += 16) { box(g, 1, y, w - 2, 1, S[1]); for (let x = 6 + (Math.floor(y / 16) % 2) * 18 + Math.floor(hash(seed + y) * 8); x < w - 4; x += 36) box(g, x, y - 15 > 0 ? y - 15 : 1, 1, Math.min(15, y), S[1]); }
  box(g, 1, h - 4, w - 2, 3, S[1]); box(g, 1, h - 1, w - 2, 1, INK);
  if (lit) { box(g, 0, 0, w, 3, LIP[2]); box(g, 0, 0, w, 1, LIP[3]); box(g, 0, 3, w, 1, S[2]); }
};
/** A trough's slab: a row of iron spikes up off it (bright tips; not stood on: no lit lip), old bones caught on them. */
const paintTrough = (g: Ctx, w: number, h: number, seed: number) => {
  const S = rampH(STONE), Ir = rampH(IRON);
  paintBlock(g, w, h, false, seed);
  box(g, 0, 0, w, 3, S[2]);
  for (let x = 1; x < w - 8; x += 10) {
    polyF(g, [[x - 1, 1], [x + 4.5, -17], [x + 10, 1]], INK);
    polyF(g, [[x, 0], [x + 4.5, -15], [x + 9, 0]], Ir[3]); polyF(g, [[x, 0], [x + 4.5, -15], [x + 4.5, 0]], Ir[5]);
    box(g, x + 4, -15, 1, 4, '#F4F2FA');
    // (rust and old blood up some of them)
    if (hash(seed + x * 0.37) > 0.6) polyF(g, [[x + 1, 0], [x + 4.5, -6 - Math.floor(hash(x + seed) * 5)], [x + 8, 0]], '#6A1A1A');
  }
  box(g, 0, 0, w, 2, INK);
  // (a skull and a long bone stuck on the spikes; a ribcage further along)
  const bone = '#D8D2C0', boneD = '#9A9282';
  for (let k = 0; k < Math.floor(w / 220) + 1; k++) {
    const bx = 30 + Math.floor(hash(seed + k * 3) * Math.max(10, w - 90));
    g.fillStyle = INK; g.beginPath(); g.arc(bx, -10, 8, 0, Math.PI * 2); g.fill();
    g.fillStyle = bone; g.beginPath(); g.arc(bx, -10, 6.5, 0, Math.PI * 2); g.fill();
    box(g, bx - 4, -11, 3, 3, INK); box(g, bx + 1, -11, 3, 3, INK); box(g, bx - 3, -5, 6, 2, boneD);
    box(g, bx + 14, -7, 22, 3, bone); box(g, bx + 13, -8, 3, 5, bone); box(g, bx + 34, -8, 3, 5, bone); box(g, bx + 14, -5, 22, 1, boneD);
    box(g, bx + 3, -12, 2, 2, '#7F1D1D');
  }
};
/** The pillar: dressed stone in drums, lit down its left, an iron band now and then; its foot a carved capital (a
 *  stepped molding cut into its own width, a bevel under), its underside dark (it's not stood on). */
const paintPillar = (g: Ctx, w: number, h: number) => {
  const S = rampH(STONE), Ir = rampH(IRON);
  box(g, 0, 0, w, h, INK); slab(g, 1, 0, w - 2, h - 1, S);
  box(g, 4, 0, 3, h, S[4]); box(g, w - 9, 0, 4, h, S[1]);
  for (let y = 24; y < h - 40; y += 24) { box(g, 1, y, w - 2, 1, S[1]); box(g, 1, y + 1, w - 2, 1, S[4]); }
  for (let y = 200; y < h - 60; y += 300) { box(g, 0, y, w, 6, INK); box(g, 1, y + 1, w - 2, 4, Ir[3]); box(g, 1, y + 1, w - 2, 1, Ir[5]); for (const bx of [5, w - 8]) box(g, bx, y + 2, 2, 2, Ir[5]); }
  // (the capital at its foot)
  const c0 = h - 34;
  box(g, 0, c0, w, 34, INK);
  box(g, 1, c0 + 1, w - 2, 8, S[4]); box(g, 1, c0 + 1, w - 2, 1, S[5]);
  box(g, 1, c0 + 9, w - 2, 2, INK);
  box(g, 2, c0 + 11, w - 4, 10, S[3]); box(g, 2, c0 + 11, 2, 10, S[4]); box(g, w - 6, c0 + 11, 4, 10, S[1]);
  box(g, 1, c0 + 21, w - 2, 2, INK);
  box(g, 1, c0 + 23, w - 2, 6, S[2]); box(g, 1, c0 + 23, w - 2, 1, S[3]);
  // (the bevel and the dark underside)
  box(g, 1, h - 5, w - 2, 4, S[0]); box(g, 0, h - 1, w, 1, INK);
  // (a carved rosette on the capital's face)
  g.fillStyle = S[1]; g.beginPath(); g.arc(w / 2, c0 + 16, 4, 0, Math.PI * 2); g.fill(); box(g, w / 2 - 1, c0 + 15, 2, 2, S[4]);
};
/** A corbelled step on the wall (s: the side the wall's on): stone, lit along its top, stepped corbels under it. */
const paintStep = (g: Ctx, w: number, s: 1 | -1) => {
  const S = rampH(STONE);
  paintBlock(g, w, SLAB_T, true, w);
  for (let k = 0; k < 3; k++) { const cw = 26 - k * 8, x = s > 0 ? 0 : w - cw; box(g, x, SLAB_T + k * 8, cw, 8, INK); box(g, x + (s > 0 ? 0 : 1), SLAB_T + k * 8, cw - 1, 7, S[3 - Math.min(1, k)]); box(g, x + (s > 0 ? 0 : 1), SLAB_T + k * 8, cw - 1, 1, S[4]); }
};
/** A ledge on an iron bracket (D1), lit along its top. */
const paintLedge = (g: Ctx, w: number) => {
  const S = rampH(STONE), Ir = rampH(IRON);
  box(g, -1, -1, w + 2, 15, INK); slab(g, 0, 0, w, 14, S); box(g, 0, 11, w, 3, S[1]);
  for (let k = 10; k < w - 10; k += 34) { polyF(g, [[k, 14], [k + 4, 14], [k + 18, 34], [k + 14, 34]], INK); polyF(g, [[k + 1, 14], [k + 3, 14], [k + 16, 32], [k + 14, 32]], Ir[3]); }
  box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
};
/** The slab under the hall's floor (its section: dressed stone, lit along the floor's top), over w. */
const paintSlab = (g: Ctx, w: number) => {
  const S = rampH(STONE);
  box(g, 0, 0, w, CRYPT.slab, INK); slab(g, 0, 1, w, CRYPT.slab - 2, S);
  for (let x = 12; x < w; x += 40) box(g, x, 3, 1, CRYPT.slab - 6, S[1]);
  box(g, 0, CRYPT.slab - 3, w, 3, S[1]);
  box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
};
/** The room's floor: flagstones, lit along the top, bones swept into its corner, a few chips of stone off the pillar. */
const paintFloor = (g: Ctx, w: number, h: number) => {
  const F = rampH(STONE);
  box(g, 0, 0, w, h, F[1]); for (let y = 6; y < h; y += 14) { box(g, 0, y, w, 1, F[0]); for (let x = (y % 28) * 2; x < w; x += 56) box(g, x, y, 1, 14, F[0]); }
  box(g, 0, 0, w, 6, F[3]); box(g, 0, 4, w, 2, F[2]); box(g, 0, 0, w, 2, LIP[2]); box(g, 0, 0, w, 1, LIP[3]);
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
  // (a stone dragon's head out of the pillar, facing left, on a stone mount bolted to the pillar's face: brow, horns, a
  // jaw open, teeth, a socket for the eye)
  const S = rampH(STONE), Gd = rampH(GOLD);
  polyF(g, [[0, -30], [-8, -26], [-8, 24], [0, 28]], INK); polyF(g, [[0, -28], [-7, -25], [-7, 23], [0, 26]], S[2]); box(g, -7, -25, 1, 48, S[4]);
  polyF(g, [[-6, -24], [-30, -20], [-46, -10], [-50, 0], [-40, 4], [-46, 12], [-34, 18], [-6, 18]], INK);
  polyF(g, [[-6, -22], [-29, -18], [-44, -9], [-47, -1], [-38, 2], [-30, 0], [-26, 6], [-42, 12], [-32, 16], [-6, 16]], S[3]);
  polyF(g, [[-6, -22], [-29, -18], [-44, -9], [-30, -10], [-6, -14]], S[4]);
  polyF(g, [[-26, 6], [-42, 12], [-32, 16], [-6, 16], [-8, 10]], S[2]);
  // (the mouth's dark, teeth)
  polyF(g, [[-30, 0], [-46, 0], [-42, 10], [-26, 6]], INK);
  for (const x of [-44, -38, -32]) { polyF(g, [[x, 0], [x + 3, 0], [x + 1.5, 4]], '#F0ECE0'); polyF(g, [[x + 1, 10], [x + 4, 9], [x + 2, 6]], '#F0ECE0'); }
  // (horns back over the brow; the eye socket, a gilt ring)
  polyF(g, [[-16, -20], [-6, -34], [-2, -36], [-8, -22]], INK); polyF(g, [[-15, -20], [-6, -32], [-3, -34], [-9, -21]], S[4]);
  box(g, -24, -14, 7, 5, INK); box(g, -23, -13, 5, 3, Gd[2]);
  // (its scales: a few lines down its neck)
  for (let k = 0; k < 4; k++) box(g, -16 + k * 3, -8 + k * 5, 6, 1, S[1]);
};

/** A torch's flame (its foot at x, y): banded, licking (cheap: a few polygons a frame). */
const drawFlame = (c: Ctx, x: number, y: number, f: number, i: number) => {
  const w = Math.sin(f * 0.4 + i * 2.1), h = 14 + Math.sin(f * 0.27 + i) * 3;
  for (const [col, k] of [['#B91C1C', 1], ['#F97316', 0.78], ['#FDE047', 0.5], ['#FFFBEB', 0.25]] as const) {
    polyF(c, [[x - 6 * k, y], [x - 4 * k + w, y - h * k * 0.55], [x + w * 2, y - h * k - 2], [x + 4 * k + w, y - h * k * 0.55], [x + 6 * k, y]], col);
  }
  if ((f + i * 7) % 18 === 0) c.fillRect(Math.round(x + w * 2), Math.round(y - h - 6), 1, 1);
};

/** The crypt under the hall (behind the stairs and him): in drawBack after the hall. */
export const drawCryptBack = (c: Ctx, state: GameState) => {
  const L = X(CRYPT.a), Rr = X(CRYPT.b);
  if (!onScreen(state, L - 60, Rr + 60)) return;
  const top = Y(0), camY = state.camera.y, f = state.frame;
  const vis = (y0: number, y1: number) => y1 > camY - 40 && y0 < camY + 640;
  // (the vault, in tiles: only the ones on screen, from under the slab down to the bottom)
  const vy0 = top + CRYPT.slab, vy1 = Y(CRYPT.floor);
  for (let i = 0; i * TILE < CRYPT.b - CRYPT.a; i++) {
    const tx = L + i * TILE, tw = Math.min(TILE, Rr - tx);
    if (!onScreen(state, tx, tx + tw)) continue;
    for (let j = 0; top + j * TILE < vy1; j++) {
      const ty = top + j * TILE, th = Math.min(TILE, vy1 - ty);
      if (ty > camY + 620 || ty + th < camY - 20) continue;
      still(c, `sq-crypt2-${i}-${j}`, tx, ty, 0, 0, tw, th, g => { g.save(); g.beginPath(); g.rect(0, 0, tw, th); g.clip(); paintVault(g, i, j); g.restore(); });
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
      const by0 = Math.max(fy0, Y(CRYPT.floor));
      if (fy1 > by0) c.fillRect(L - 24, by0, Rr - L + 48, fy1 - by0);
    }
  }
  // (the walls either side: dressed stone, lit on their inner faces)
  const S = rampH(STONE, true);
  for (const [x, w, lt] of [[L - 24, 24, 1], [Rr, 24, 0]] as const) if (vis(vy0, vy1)) {
    const y0 = Math.max(vy0, camY - 20), y1 = Math.min(vy1, camY + 620);
    box(c, x, y0, w, y1 - y0, S[2]); box(c, lt ? x + w - 3 : x, y0, 3, y1 - y0, S[4]); box(c, lt ? x : x + w - 2, y0, 2, y1 - y0, INK);
  }
  // (the torches' flames)
  TORCHES.forEach(([x, h], i) => { const y = Y(h); if (vis(y - 30, y + 10)) drawFlame(c, X(x), y, f, i); });
  // (the slab: either side of the hole; the hole's cut ends going down into the dark; the grate over the shaft (thrown
  // open as the cannon's shot comes up through it))
  if (vis(top, top + CRYPT.slab)) {
    for (const [a, b] of [[CRYPT.a, HOLE.a], [HOLE.b, HATCH.a]] as const) still(c, `sq-crypt-slab-${a}`, X(a), top, 0, 0, b - a, CRYPT.slab, g => paintSlab(g, b - a));
    const gw = HATCH.b - HATCH.a, cr = crOf(state);
    if (cr.grate > 0) {
      // (open: the grate's two leaves flung up off their hinges, the dark shaft between)
      box(c, X(HATCH.a), top, gw, CRYPT.slab, rampH(VAULT, true)[0]);
      const k = Math.min(1, cr.grate / 10), hgt = 30 * k;
      for (const [hx, s] of [[X(HATCH.a), 1], [X(HATCH.b), -1]] as const) { polyF(c, [[hx, top], [hx + s * 6, top - hgt], [hx + s * 10, top - hgt], [hx + s * 4, top]], INK); polyF(c, [[hx + s, top], [hx + s * 6, top - hgt + 2], [hx + s * 8, top - hgt + 2], [hx + s * 3, top]], IRON[4]); }
    } else still(c, 'sq-crypt-grate2', X(HATCH.a), top, 0, 0, gw, CRYPT.slab, g => {
      const Ir = rampH(IRON);
      box(g, 0, 0, gw, CRYPT.slab, rampH(VAULT, true)[0]);
      box(g, 0, 0, gw, 5, INK); box(g, 0, 1, gw, 3, Ir[4]); box(g, 0, 0, gw, 1, LIP[3]); box(g, 0, 1, gw, 1, LIP[2]);
      for (let x = 2; x < gw; x += 8) { box(g, x, 4, 4, CRYPT.slab - 4, INK); box(g, x + 1, 4, 2, CRYPT.slab - 6, Ir[3]); box(g, x + 1, 4, 1, CRYPT.slab - 6, Ir[5]); }
      for (const x of [0, gw - 6]) { box(g, x, 0, 6, CRYPT.slab, INK); box(g, x + 1, 1, 4, CRYPT.slab - 2, Ir[3]); }
    });
    box(c, X(HOLE.a), top, HOLE.b - HOLE.a, CRYPT.slab, rampH(VAULT, true)[1]); checker(c, X(HOLE.a), top + CRYPT.slab - 4, HOLE.b - HOLE.a, 4, rampH(VAULT, true)[2], 0, 2);
    for (const x of [X(HOLE.a), X(HOLE.b) - 4]) { box(c, x, top, 4, CRYPT.slab, S[1]); box(c, x + (x === X(HOLE.a) ? 0 : 3), top, 1, CRYPT.slab, INK); }
  }
  // (the pillar, down from the slab to its capital, just short of the floor; baked in lengths)
  {
    const py0 = top + CRYPT.slab, py1 = Y(PILLAR_FOOT), seg = 384;
    for (let k = 0; py0 + k * seg < py1; k++) {
      const y = py0 + k * seg, hgt = Math.min(seg, py1 - y), lastSeg = y + hgt >= py1;
      if (!vis(y, y + hgt)) continue;
      still(c, `sq-crypt-pillar-${k}`, X(PILLAR.a), y, 0, 0, PILLAR.b - PILLAR.a, hgt, g => {
        if (lastSeg) paintPillar(g, PILLAR.b - PILLAR.a, hgt);
        else { g.save(); g.beginPath(); g.rect(0, 0, PILLAR.b - PILLAR.a, hgt); g.clip(); paintPillar(g, PILLAR.b - PILLAR.a, hgt + 200); g.restore(); }
      });
    }
  }
  // (the first ledge; every tier's pier, trough and step; the room's floor)
  if (vis(Y(D1.h), Y(D1.h) + 40)) still(c, 'sq-crypt-ledge-d1', X(D1.a), Y(D1.h), -2, -2, D1.b - D1.a + 4, 40, g => paintLedge(g, D1.b - D1.a));
  TIERS.forEach((t, k) => {
    const last = k === 3;
    const tb = last ? t.trough.h - CRYPT.floor : SLAB_T, fh = ROOM.h - CRYPT.floor;
    if (vis(Y(t.trough.h) - 20, Y(t.trough.h) + tb)) still(c, `sq-crypt-trough-${k}`, X(t.trough.a), Y(t.trough.h), 0, -20, t.trough.b - t.trough.a, tb + 20, g => paintTrough(g, t.trough.b - t.trough.a, tb, k * 7.3));
    if (last) { if (vis(Y(ROOM.h), Y(ROOM.h) + fh)) still(c, 'sq-crypt-floor2', X(ROOM.a), Y(ROOM.h), 0, 0, ROOM.b - ROOM.a, fh, g => paintFloor(g, ROOM.b - ROOM.a, fh)); }
    else { const ph = t.pier.h - (t.trough.h - SLAB_T); if (vis(Y(t.pier.h), Y(t.pier.h) + ph)) still(c, `sq-crypt-pier-${k}`, X(t.pier.a), Y(t.pier.h), 0, 0, PIER_W, ph, g => paintBlock(g, PIER_W, ph, true, k * 3.1)); }
    if (t.step) { const st = t.step, s: 1 | -1 = st.a === CRYPT.a ? 1 : -1; if (vis(Y(st.h), Y(st.h) + SLAB_T + 24)) still(c, `sq-crypt-step-${k}`, X(st.a), Y(st.h), 0, 0, st.b - st.a, SLAB_T + 24, g => paintStep(g, st.b - st.a, s)); }
  });
  // (the dragon head on the pillar's face; the glow in its mouth in the tell)
  const px = X(DRAGON.x), my = Y(DRAGON.h);
  if (vis(my - 40, my + 30)) {
    still(c, 'sq-crypt-dragon2', px, my, -52, -38, 54, 68, paintDragon);
    const d = dragonPhase(f);
    if (d.tell > 0) {
      c.save(); c.globalAlpha = 0.25 + d.tell * 0.6; c.fillStyle = f % 6 < 3 ? '#FB923C' : '#FDE047'; c.fillRect(px - 46, my - 1, 14, 8); c.restore();
      if (f % 5 === 0) state.particles.push({ pos: { x: px - 46, y: my }, vel: { x: -0.4 - Math.random() * 0.4, y: -0.6 - Math.random() * 0.6 }, life: 40, color: Math.random() < 0.5 ? '#4A4458' : '#6A6478', size: 4 + Math.random() * 4 });
    }
  }
};

/** In front of the stairs, behind him: the axes, the fire, the cannon, the can. */
export const drawCryptMid = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(CRYPT.a) - 60, X(CRYPT.b) + 60)) return;
  const f = state.frame, camY = state.camera.y, cr = crOf(state);
  drawStairs(c, state, cr.stairs);
  // (the axes: a chain from its iron ring in the ceiling, the blade turned with the swing)
  const art = axeArt();
  for (const a of AXES) {
    const py = Y(a.h);
    if (py - 10 > camY + 640 || py + a.ch + 40 < camY - 40) continue;
    const b = axeAt(f, a), px = X(a.x);
    box(c, px - 6, py, 12, 5, INK); box(c, px - 5, py, 10, 4, IRON[3]); box(c, px - 5, py + 3, 10, 1, IRON[5]);
    const n = Math.floor(a.ch / 7);
    for (let k = 1; k < n; k++) { const t = k / n, x = px + (b.x - px) * t, y = py + (b.y - py) * t; box(c, Math.round(x) - 1, Math.round(y) - 2, 3, 4, k % 2 ? '#3A3650' : '#6A6688'); }
    c.save(); c.translate(b.x, b.y); c.rotate(-b.t); c.drawImage(art, -36, -14); c.restore();
  }
  // (the fire: a jet out of the dragon's mouth, banded red to yellow, licking; embers)
  const d = dragonPhase(f);
  if (d.burn > 0) {
    const mx = X(DRAGON.mouth), my = Y(DRAGON.h) + 3, len = DRAGON.reach * d.burn;
    for (const [col, hh, k] of [['#B91C1C', 18, 1], ['#F97316', 13, 0.92], ['#FDE047', 7, 0.8], ['#FFFBEB', 3, 0.55]] as const) {
      c.fillStyle = col; c.beginPath(); c.moveTo(mx, my - hh * 0.4);
      for (let s = 0; s <= 8; s++) { const t = s / 8; c.lineTo(mx - len * k * t, my - hh * (0.4 + t * 0.6) + Math.sin(f * 0.7 + s * 1.7) * 3); }
      for (let s = 8; s >= 0; s--) { const t = s / 8; c.lineTo(mx - len * k * t, my + hh * (0.4 + t * 0.6) + Math.sin(f * 0.9 + s * 1.3) * 3); }
      c.closePath(); c.fill();
    }
    if (f % 2 === 0) state.particles.push({ pos: { x: mx - Math.random() * len, y: my + (Math.random() - 0.5) * 20 }, vel: { x: -1 - Math.random(), y: -1 - Math.random() * 2 }, life: 20, color: Math.random() < 0.5 ? '#FDBA74' : '#FDE047', size: 2 });
  }
  if (Y(ROOM.h) > camY - 160 && Y(ROOM.h) - 160 < camY + 640) drawCannon(c, cr.cannon, SPOOKY);
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
