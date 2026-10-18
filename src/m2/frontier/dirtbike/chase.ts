// THE TEENAGERS: the chase itself, a self-contained mode that takes over the screen (as Foreign Lands' helicopter takes
// over its section): its own road (road.ts), its own camera behind him, its own riders and roadside, its own HUD
// (React's: bikeHud / bikeTips in store.ts; the sub-boss bar, the speedo, Tucker's talking head drawn here), drawn over
// the whole screen from the section's drawHud. Meathead's own figure in the world is hidden and held still meanwhile.
//
// The controls (the user's, positional on every pad): X / left click (shoot) hits LEFT, B / right click (charge or
// special) hits RIGHT, A jumps; left and right steer. Throttle (ours): it rides itself at a cruise; UP boosts (the PWR
// row: drains, comes back, a parry tops it up), DOWN brakes.
//
// The teens come up from behind and ahead in waves, one stretch of road each (the trail, the fields, farm country, the
// creek, the power lines, the last mile), each harder: a few, then packs, nastier weapons, rougher road. They work
// him from his left and right; a wound-up swing flashes (the tell); hit toward them as they swing and it's a PUNCH
// PARRY: they're done, at once, with a flourish (the bike chain: a human bomb; the bat: into a tree; the crowbar:
// faceplant, run over by their own pack; the nunchucks: bowled back into the pack; the hockey stick: jammed in their
// spokes, a human ramp; the skateboard: worn round their neck, ridden blind into a cow). A plain hit knocks them about
// (two or three and they're off); a shove can put them into the roadside. Riding into the roadside is a bail (over the
// bars, the bike cartwheeling): heavy damage, then straight back on the road (it only kills him low).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { registerHurtLines } from '../../kinds';
import { setUi } from '../../store';
import { timeOfDay } from '../../timeOfDay';
import { meatheadSays, speak, saidOver, byPants, label, box as sbox, landVisit, tuckerWoundsOf, teleport, frontierState, type Said } from '../section';
import { DOORS } from '../geometry';
import { TUCKER_VOICE } from '../talk';
import { drawTuckerCloseup } from '../tucker';
import {
  W, H, K, SEG_L, DRAW, PLAYER_Z, CAM_H, SPR, view, PS, PX, PY, PZ, CLIP,
  newTrack, generate, nextBiome, segAt, project, placeAt, roadYAt, drawRoad, drawBackground, type Track, type Spr,
} from './road';
import { drawSpr, drawTeenRider, drawTeenBody, drawMeathead, drawMhTumble, drawBikeTumble, drawTuckerRider, drawWeapon, teenLookOf, ART, INK, type Weapon, type TeenLook, type RiderPose, type MhPose } from './art';
import { HURT, MH_START, MH_AGAIN, MH_KNOCKOFF, MH_PARRY, MH_END, TEEN_TAUNT, TEEN_PARRIED, TUCKER_RAISE, TUCKER_LEDGER, TUCKER_FLEE } from './lines';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

/** The chase beaten (never again): stageMemo. */
export const TEENS_MEMO = 'frontier-teens-done';
export const teensDone = (state: GameState) => state.stageMemo[TEENS_MEMO] === '1';
/** Into the arena off the end of the chase, on the bike: true once, for job 7's catch-up to pick up. */
let handoff = false;
export const takeChaseHandoff = () => { const h = handoff; handoff = false; return h; };

// ---------------------------------------------------------------------------------------------------------------
// The waves (one stretch of road each; checkpoint 50 + its index)

interface Wave { name: string; sign: string; biome: number; teens: Weapon[]; pack: number; engage: number; wind: number; hp: number }
export const WAVES: Wave[] = [
  { name: 'TEENAGERS', sign: 'DIRT TRAIL', biome: 0, teens: ['bat', 'chain', 'bat'], pack: 1, engage: 1, wind: 50, hp: 2 },
  { name: 'TEENAGERS: OPEN RANGE', sign: 'OPEN RANGE', biome: 1, teens: ['crowbar', 'chain', 'bat', 'crowbar'], pack: 2, engage: 1, wind: 46, hp: 2 },
  { name: 'TEENAGERS: FARM ROAD', sign: 'FARM ROAD', biome: 2, teens: ['nunchucks', 'bat', 'chain', 'nunchucks', 'crowbar'], pack: 3, engage: 2, wind: 42, hp: 2 },
  { name: 'TEENAGERS: CREEK CROSSING', sign: 'CREEK CROSSING', biome: 3, teens: ['hockey', 'skateboard', 'chain', 'nunchucks', 'hockey'], pack: 3, engage: 2, wind: 40, hp: 2 },
  { name: 'TEENAGERS: POWER LINE CUT', sign: 'POWER LINE CUT', biome: 4, teens: ['skateboard', 'chain', 'hockey', 'crowbar', 'nunchucks', 'bat'], pack: 4, engage: 2, wind: 37, hp: 3 },
  { name: 'TEENAGERS: THE LAST MILE', sign: 'DEAD END 1 MILE', biome: 5, teens: ['chain', 'skateboard', 'hockey', 'nunchucks', 'crowbar', 'bat', 'chain'], pack: 4, engage: 2, wind: 34, hp: 3 },
];
const TOTAL = WAVES.reduce((a, w) => a + w.teens.length, 0);
/** The parry window: the last frames of the wind-up (the flash) and the swing's own. */
const TELL = 18, SWING = 9;

/** Speeds (world units a frame): cruising, boosting, braking, off the road. */
const CRUISE = 140, BOOST = 200, BRAKE = 50, ROUGH = 75, MAXV = 200;
const GRAV = 0.75, JUMP_V = 15, MOUND_V = 12, RAMP_V = 22;
/** Damage (before M2's x0.65): a bail, a weapon, a loose bike, the blast. */
const BAIL_DMG = 32, HIT_DMG = 14, WRECK_DMG = 10, BOMB_DMG = 18;

// ---------------------------------------------------------------------------------------------------------------
// State

type Mode = 'hover' | 'engage' | 'wind' | 'swing' | 'recover';
interface Teen {
  id: number; seed: number; k: TeenLook; weapon: Weapon;
  z: number; x: number; speed: number; vx: number; h: number; vh: number;
  hp: number; side: number; mode: Mode; t: number; cool: number; hit: number; lean: number;
  hoverDz: number; ready: number;
  said: Said | null; taunted: boolean; alive: boolean;
}
type LooseKind = 'tumbler' | 'body' | 'wreck' | 'bomb' | 'blast' | 'flyer' | 'faceplant' | 'vault' | 'ramp' | 'blind' | 'mh' | 'mhbike';
interface Loose {
  kind: LooseKind; z: number; x: number; h: number; vz: number; vx: number; vh: number; t: number; rot: number;
  k?: TeenLook; color?: string; flat?: number; done?: boolean; side?: number;
  /** (the bat's flyer: where it's flying to, the tree, and how long it takes) */
  to?: { z: number; x: number; n: number; spr: Spr | null; z0: number; x0: number };
  ran?: number;
  /** (when he last rode over it) */
  hitAt?: number;
}
interface Particle { z: number; x: number; h: number; vz: number; vx: number; vh: number; life: number; col: string; size: number }
interface Pop { text: string; t: number; col: string; y: number }
interface Parry { w: Weapon; side: number; t: number; k: TeenLook; x: number; dz: number; bike: string }

interface Chase {
  phase: 'off' | 'ride' | 'bail' | 'outro' | 'dead';
  wave: number; spawned: number; killed: number; spawnAt: number; nextId: number;
  track: Track;
  z: number; x: number; vx: number; speed: number; h: number; vh: number; lean: number; boost: number; spin: number;
  punch: { side: number; t: number } | null; punchCool: number;
  parry: Parry | null;
  bail: { t: number } | null;
  inv: number; hitStop: number; shake: number; fade: number; tips: number; t: number;
  teens: Teen[]; loose: Loose[]; parts: Particle[]; pops: Pop[];
  bgX: number;
  prev: { l: boolean; r: boolean; j: boolean };
  tucker: { on: boolean; z: number; x: number; t: number; leave: boolean; flee: boolean; said: Said | null; at: number };
  outro: { t: number; step: 'talk' | 'fade'; said: boolean };
  quipAt: number; bumpAt: number; engineAt: number; tauntAt: number;
  deathLast: number;
  bike: string;
  /** A parried kid's yelp (subtitled while it's said: they're mid-flourish, so it goes under the pops). */
  yelp: Said | null;
}

const chaseOf = (state: GameState) => frontierState<Chase>(state, 'dirtbike', () => ({
  phase: 'off', wave: 0, spawned: 0, killed: 0, spawnAt: 0, nextId: 1, track: newTrack(0, 1),
  z: 0, x: 0, vx: 0, speed: 0, h: 0, vh: 0, lean: 0, boost: 1, spin: 0,
  punch: null, punchCool: 0, parry: null, bail: null,
  inv: 0, hitStop: 0, shake: 0, fade: 0, tips: 0, t: 0,
  teens: [], loose: [], parts: [], pops: [], bgX: 0, prev: { l: false, r: false, j: false },
  tucker: { on: false, z: 0, x: 0.3, t: 0, leave: false, flee: false, said: null, at: 0 },
  outro: { t: 0, step: 'talk', said: false },
  quipAt: 0, bumpAt: 0, engineAt: 0, tauntAt: 0, deathLast: -1, bike: '#E5E7EB', yelp: null,
}));
export const inChase = (state: GameState) => chaseOf(state).phase !== 'off';

/** Said the start line this visit. */
let startVisit = -1;
const rnd = Math.random;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const teensLeft = (c: Chase) => {
  let n = 0;
  for (let i = c.wave; i < WAVES.length; i++) n += WAVES[i].teens.length;
  return n - c.killed;
};

// ---------------------------------------------------------------------------------------------------------------
// Starting and ending

const holdHim = (state: GameState, on: boolean) => {
  const p = state.player;
  p.hidden = on; p.carried = on; p.noSpecials = on; p.vel.x = 0; p.vel.y = 0;
  if (!on) { p.inCutscene = false; p.jetski = false; p.moto = false; }
};

/** Into the chase at wave `wave` (0 off the bounty's ride, or a checkpoint inside it). */
export const startChase = (state: GameState, wave: number, fromBounty: boolean) => {
  const c = chaseOf(state), wv = WAVES[wave];
  c.phase = 'ride'; c.wave = wave; c.spawned = 0; c.killed = 0; c.t = 0;
  c.spawnAt = state.frame + (fromBounty ? 30 : 100);
  c.track = newTrack(wv.biome, 77 + wave * 31);
  nextBiome(c.track, wv.biome, wv.sign, wave >= 1);
  c.z = SEG_L * 14; c.x = 0; c.vx = 0; c.h = 0; c.vh = 0; c.lean = 0; c.boost = 1;
  c.speed = fromBounty ? 130 : 60;
  c.teens = []; c.loose = []; c.parts = []; c.pops = []; c.parry = null; c.punch = null; c.bail = null;
  c.inv = 90; c.fade = 1; c.tips = wave === 0 ? 720 : 0;
  c.tucker = { on: false, z: 0, x: 0.3, t: 0, leave: false, flee: false, said: null, at: state.frame + (wave === 0 ? 1100 : 260) };
  c.bike = '#DC2626';
  generate(c.track, Math.floor(c.z / SEG_L) + DRAW + 20);
  holdHim(state, true);
  state.player.inCutscene = false;
  if (state.checkpoint < 50 + wave) state.checkpoint = 50 + wave;
  setUi({ noSwitch: true, bikeHud: true, bikeBoost: 1, bikeTips: c.tips > 0 });
  // (off the bounty: the pack's right behind him)
  if (fromBounty) for (let i = 0; i < 2; i++) spawnTeen(state, c, true, -1400 - i * 900);
  const first = startVisit !== landVisit();
  if (first) { startVisit = landVisit(); setTimeout(() => meatheadSays(state, pickLine(byPants(state, MH_START)), true), 900); }
  else if (rnd() < 0.4) setTimeout(() => meatheadSays(state, pickLine(byPants(state, MH_AGAIN)), false), 900);
};

const finishChase = (state: GameState) => {
  const c = chaseOf(state);
  c.phase = 'off';
  state.stageMemo[TEENS_MEMO] = '1';
  holdHim(state, false);
  setUi({ noSwitch: false, bikeHud: false, bikeTips: false });
  handoff = true;
  teleport(state, DOORS.arena.start.x, DOORS.arena.start.y);
  state.player.facing = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The teens

const spawnTeen = (state: GameState, c: Chase, behind: boolean, dz?: number) => {
  const wv = WAVES[c.wave], weapon = wv.teens[c.spawned];
  const seed = 700 + c.wave * 97 + c.spawned * 41 + landVisit() * 13;
  const k = teenLookOf(seed);
  const side = c.spawned % 2 ? 1 : -1;
  const z = c.z + (dz ?? (behind ? -2600 - rnd() * 1400 : 5200 + rnd() * 2400));
  c.teens.push({
    id: c.nextId++, seed, k, weapon, z, x: clamp(c.x + side * 0.6, -0.9, 0.9), speed: behind ? c.speed + 40 : Math.max(40, c.speed - 40), vx: 0, h: 0, vh: 0,
    hp: wv.hp + (k.heavy ? 1 : 0), side, mode: 'hover', t: 0, cool: 60, hit: 0, lean: 0,
    hoverDz: behind ? -1400 - rnd() * 600 : 900 + rnd() * 600, ready: 30 + Math.floor(rnd() * 40),
    said: null, taunted: false, alive: true,
  });
  c.spawned++;
  playSound('engine', 0.35, 6);
};

/** A teen's off (not by a parry: punched off, shoved into something, bowled, blown up). */
const knockOff = (state: GameState, c: Chase, t: Teen, side: number, quip: boolean) => {
  if (!t.alive) return;
  t.alive = false; c.killed++;
  c.loose.push({ kind: 'tumbler', z: t.z + 30, x: t.x, h: 60 + t.h, vz: t.speed * 0.85, vx: side * 0.018, vh: 12, t: 0, rot: 0, k: t.k });
  c.loose.push({ kind: 'wreck', z: t.z, x: t.x, h: 0, vz: t.speed * 0.8, vx: side * 0.01, vh: 6, t: 0, rot: 0, color: t.k.bike });
  blood(c, t.z, t.x, 140, 10);
  playSound('crash', 0.5, 4);
  if (quip && state.frame > c.quipAt && rnd() < 0.3) { c.quipAt = state.frame + 400; meatheadSays(state, pickLine(byPants(state, MH_KNOCKOFF)), false); }
};

/** Something in the road or by it in this segment that a rider at x hits (tall ones; low ones when not in the air). */
const hitIn = (c: Chase, i: number, x: number, h: number, pad: number): Spr | null => {
  const s = segAt(c.track, i);
  for (const sp of s.spr) {
    if (sp.gone) continue;
    const d = SPR[sp.k];
    if (d.solid === 'none') continue;
    if (d.solid === 'low' && h > 60) continue;
    if (Math.abs(x - sp.x) < d.hit + pad) return sp;
  }
  return null;
};

/** An animal hit by anybody: dead (its dead look), bleeding. */
const killAnimal = (c: Chase, sp: Spr, z: number) => {
  const d = SPR[sp.k];
  if (!d.animal) return;
  sp.k = d.animal === 'cow' ? 'deadcow' : 'deaddeer'; sp.vx = 0;
  blood(c, z, sp.x, 200, 18);
  playSound(d.animal === 'cow' ? 'bellow' : 'snort', 0.6, 0);
  playSound('splat', 0.5);
};

const updateTeens = (ctx: FrameContext, c: Chase) => {
  const { state } = ctx, wv = WAVES[c.wave], f = state.frame;
  let engaged = 0, left = false, right = false;
  for (const t of c.teens) if (t.alive && t.mode !== 'hover') { engaged++; if (t.side < 0) left = true; else right = true; }
  for (const t of c.teens) {
    if (!t.alive) continue;
    if (t.hit > 0) t.hit--;
    if (t.cool > 0) t.cool--;
    const dz = t.z - c.z;
    // (who works him: a free side, their turn)
    if (t.mode === 'hover' && t.cool <= 0 && engaged < wv.engage && c.phase === 'ride' && Math.abs(dz) < 3500) {
      const want = c.x + t.side * 0.42;
      let side = t.side;
      if ((side < 0 && left) || (side > 0 && right) || Math.abs(want) > 1.2) side = -side;
      if (!((side < 0 && left) || (side > 0 && right))) { t.side = side; t.mode = 'engage'; t.t = 0; t.ready = 20 + Math.floor(rnd() * 40); engaged++; if (side < 0) left = true; else right = true; }
    }
    // (where they want to be: alongside him on their side, or hanging back / out ahead waiting)
    const engagedNow = t.mode !== 'hover';
    const tdz = engagedNow ? ((t.id % 3) - 1) * 25 : t.hoverDz;
    let tx = engagedNow ? c.x + t.side * (t.mode === 'recover' ? 0.62 : 0.42) : c.x + t.side * 0.7;
    tx = clamp(tx, -1.15, 1.15);
    // (steering round anything in their way just ahead)
    const si = Math.floor(t.z / SEG_L);
    for (let k = 1; k <= 4; k++) { const sp = hitIn(c, si + k, tx, t.h, 0.12); if (sp && SPR[sp.k].solid === 'tall') { tx = sp.x + (tx < sp.x ? -1 : 1) * (SPR[sp.k].hit + 0.2); break; } }
    const want = c.phase === 'bail' ? c.speed : c.speed + clamp((tdz - dz) * 0.03, -45, 45);
    t.speed += (Math.max(30, want) - t.speed) * 0.1;
    const oldZ = t.z;
    t.z += t.speed;
    t.x += clamp((tx - t.x) * 0.06, -0.022, 0.022) + t.vx;
    t.vx *= 0.88;
    const curve = segAt(c.track, si).curve;
    t.lean += (clamp(-curve * 0.04 + t.vx * 6, -0.3, 0.3) - t.lean) * 0.2;
    // (their hops: over logs, rocks, the creek, a dirt jump)
    if (t.h > 0 || t.vh > 0) { t.vh -= GRAV; t.h = Math.max(0, t.h + t.vh); if (t.h === 0) t.vh = 0; }
    // (anything they're shoved into, or ride into)
    for (let i = Math.floor(oldZ / SEG_L); i <= Math.floor(t.z / SEG_L); i++) {
      const s = segAt(c.track, i);
      if ((s.water || s.mound) && t.h === 0) t.vh = 9;
      const sp = hitIn(c, i, t.x, t.h, 0.07);
      if (sp) {
        if (SPR[sp.k].solid === 'low') { if (t.h === 0) t.vh = 9; continue; }
        killAnimal(c, sp, t.z);
        knockOff(state, c, t, Math.sign(t.x - sp.x) || 1, false);
        playSound('crunch', 0.6);
        break;
      }
    }
    if (!t.alive) continue;
    // (bumping him: shoved apart, him the heavier)
    const sep = t.x - c.x;
    if (Math.abs(t.z - c.z) < 110 && Math.abs(sep) < 0.17 && c.h < 40 && t.h < 40 && c.phase === 'ride') {
      const s = Math.sign(sep) || 1;
      t.vx += s * 0.022; c.vx -= s * 0.006;
      if (f > c.bumpAt) { c.bumpAt = f + 20; playSound('thud', 0.4, 2); }
    }
    // (their taunt, pulling up alongside)
    if (engagedNow && !t.taunted && Math.abs(dz) < 300 && f > c.tauntAt) {
      t.taunted = true; c.tauntAt = f + 360;
      if (rnd() < 0.5) speak(t.k.voice, pickLine(byPants(state, TEEN_TAUNT)), s => { t.said = s; }, false);
    }
    // ---- their swings
    t.t++;
    const inRange = Math.abs(dz) < 170 && Math.abs(sep) > 0.15 && Math.abs(sep) < 0.8 && Math.sign(sep) === t.side;
    if (t.mode === 'engage') {
      if (inRange && t.cool <= 0 && c.phase === 'ride') { if (--t.ready <= 0) { t.mode = 'wind'; t.t = 0; playSound('whoosh', 0.35, -6); } }
      if (t.t > 600) { t.mode = 'hover'; t.cool = 120; t.hoverDz = rnd() < 0.5 ? -1500 : 1000; }
    } else if (t.mode === 'wind') {
      if (t.t >= wv.wind) { t.mode = 'swing'; t.t = 0; playSound('whoosh', 0.55, 4); }
    } else if (t.mode === 'swing') {
      if (t.t === 1 && inRange && c.h < 70 && c.inv <= 0 && c.phase === 'ride') hitHim(ctx, c, t);
      if (t.t >= SWING) { t.mode = 'recover'; t.t = 0; }
    } else if (t.mode === 'recover') {
      if (t.t >= 40) { t.mode = 'engage'; t.t = 0; t.cool = 50 + Math.floor(rnd() * 70); t.ready = 10 + Math.floor(rnd() * 30); }
    }
    // (left way behind or ahead: back into the fray)
    if (dz < -6000) { t.z = c.z - 3000; t.speed = c.speed + 40; }
    if (dz > 12000) { t.z = c.z + 6000; t.speed = c.speed - 40; }
  }
  c.teens = c.teens.filter(t => t.alive);
};

/** A teen's swing lands on him. */
const hitHim = (ctx: FrameContext, c: Chase, t: Teen) => {
  const { state } = ctx;
  hurtPlayer(ctx, HIT_DMG, 'm2:fr_' + t.weapon, { x: 0, y: 0 });
  c.vx -= t.side * 0.03; c.shake = 10; c.inv = 50;
  playSound('punch', 0.8, -2);
  blood(c, c.z, c.x + t.side * 0.05, 300, 8);
  if (state.player.health <= 0) die(state, c);
};

// ---------------------------------------------------------------------------------------------------------------
// His hits, and the punch parries

const attack = (state: GameState, c: Chase, side: number) => {
  if (c.punch || c.punchCool > 0 || c.parry || c.phase !== 'ride') return;
  c.punch = { side, t: 0 };
  // (a teen on that side, mid-swing (the tell or the swing): the parry)
  let parry: Teen | null = null, near: Teen | null = null, best = 1e9;
  for (const t of c.teens) {
    if (!t.alive) continue;
    const dz = t.z - c.z, sep = t.x - c.x;
    if (Math.sign(sep) !== side || Math.abs(dz) > 210 || Math.abs(sep) < 0.1 || Math.abs(sep) > 0.85) continue;
    const wv = WAVES[c.wave];
    if ((t.mode === 'wind' && t.t >= wv.wind - TELL) || (t.mode === 'swing' && t.t < SWING)) { parry = t; break; }
    if (Math.abs(dz) < best) { best = Math.abs(dz); near = t; }
  }
  if (parry) return startParry(state, c, parry, side);
  if (near) {
    near.hp--; near.hit = 8; near.vx += side * 0.032;
    if (near.mode === 'wind' || near.mode === 'swing') { near.mode = 'recover'; near.t = 0; }
    playSound('punch', 0.75);
    blood(c, near.z, near.x, 260, 4);
    if (near.hp <= 0) knockOff(state, c, near, side, true);
  } else playSound('whoosh', 0.3, 8);
};

const startParry = (state: GameState, c: Chase, t: Teen, side: number) => {
  t.alive = false; c.killed++;
  c.punch = null;
  c.parry = { w: t.weapon, side, t: 0, k: t.k, x: t.x, dz: clamp(t.z - c.z, -60, 120), bike: t.k.bike };
  c.hitStop = 6; c.boost = Math.min(1, c.boost + 0.35);
  c.pops.push({ text: 'PARRY!', t: 0, col: '#FDE047', y: 150 });
  playSound('slam', 0.8); playSound(t.weapon === 'bat' || t.weapon === 'hockey' ? 'clang' : 'punch', 0.7, 2);
  if (rnd() < 0.6) speak(t.k.voice, pickLine(byPants(state, TEEN_PARRIED)), s => { c.yelp = s; }, false);
  if (state.frame > c.quipAt && rnd() < 0.55) { c.quipAt = state.frame + 300; const pool = MH_PARRY[t.weapon]; setTimeout(() => meatheadSays(state, pickLine(byPants(state, pool)), false), 500); }
};

/** The nearest tree (pine or oak) by the road on that side, between `from` and `to` segments ahead. */
const treeAhead = (c: Chase, side: number, from: number, to: number) => {
  const base = Math.floor(c.z / SEG_L);
  for (let i = base + from; i < base + to; i++) for (const sp of segAt(c.track, i).spr) if (!sp.gone && (sp.k === 'pine' || sp.k === 'oak') && Math.sign(sp.x) === side && Math.abs(sp.x) < 3) return { sp, z: i * SEG_L };
  return null;
};

const tickParry = (state: GameState, c: Chase) => {
  const pr = c.parry!;
  pr.t++;
  const t = pr.t, tz = c.z + pr.dz;
  switch (pr.w) {
    case 'chain':
      if (t === 2) playSound('clink', 0.6);
      if (t > 8 && t < 34 && t % 7 === 0) playSound('whoosh', 0.5, (t % 14) ? 2 : -2);
      if (t === 34) {
        c.loose.push({ kind: 'bomb', z: c.z + 150, x: c.x, h: 300, vz: c.speed + 110, vx: 0, vh: 18, t: 0, rot: 0, k: pr.k });
        c.loose.push({ kind: 'wreck', z: tz, x: pr.x, h: 0, vz: c.speed * 0.8, vx: pr.side * 0.012, vh: 4, t: 0, rot: 0, color: pr.bike });
        c.parry = null;
      }
      break;
    case 'bat':
      if (t === 10) { playSound('bonk', 0.9); c.pops.push({ text: 'BONK!', t: 0, col: '#FFFFFF', y: 120 }); }
      if (t === 16) {
        // (a tree far enough ahead that it's still ahead of him when they get there)
        const n = 34, need = Math.ceil((Math.max(c.speed, 60) * n) / SEG_L) + 8;
        const tree = treeAhead(c, pr.side, need, need + 30);
        let spr: Spr | null = null, z: number, x: number;
        if (tree) { spr = tree.sp; z = tree.z; x = tree.sp.x; }
        else { const i = Math.floor(c.z / SEG_L) + need + 20; spr = { k: 'oak', x: pr.side * 1.8, seed: 7 }; segAt(c.track, i).spr.push(spr); z = i * SEG_L; x = spr.x; }
        c.loose.push({ kind: 'flyer', z: tz, x: pr.x, h: 80, vz: 0, vx: 0, vh: 0, t: 0, rot: 0, k: pr.k, to: { z, x, n, spr, z0: tz, x0: pr.x } });
        c.loose.push({ kind: 'wreck', z: tz, x: pr.x, h: 0, vz: c.speed * 0.8, vx: pr.side * 0.01, vh: 4, t: 0, rot: 0, color: pr.bike });
        c.parry = null;
      }
      break;
    case 'crowbar':
      if (t === 3) playSound('clang', 0.5, 4);
      if (t === 9) {
        c.loose.push({ kind: 'faceplant', z: c.z + 320, x: c.x + pr.side * 0.08, h: 0, vz: c.speed * 0.6, vx: 0, vh: 0, t: 0, rot: 0, k: pr.k, flat: 0 });
        c.loose.push({ kind: 'wreck', z: tz, x: pr.x, h: 0, vz: c.speed * 0.8, vx: pr.side * 0.014, vh: 5, t: 0, rot: 0, color: pr.bike });
        playSound('thud', 0.7); c.pops.push({ text: 'FACEPLANT!', t: 0, col: '#FCA5A5', y: 130 });
        c.parry = null;
      }
      break;
    case 'nunchucks':
      if (t === 4) playSound('clink', 0.6);
      if (t === 10) playSound('whoosh', 0.7, -4);
      if (t === 28) {
        // (bowled back into the pack: everybody behind him goes down)
        let n = 0;
        for (const q of c.teens) if (q.alive && q.z < c.z + 60 && q.z > c.z - 4000) { knockOff(state, c, q, Math.sign(q.x - c.x) || 1, false); n++; }
        for (let i = 0; i < Math.max(2, n + 1); i++) setTimeout(() => playSound(i % 2 ? 'clang' : 'crash', 0.6, i), 80 * i);
        c.pops.push({ text: n >= 2 ? 'STRIKE!' : n === 1 ? 'SPARE!' : 'GUTTER BALL!', t: 0, col: n >= 2 ? '#FDE047' : '#E5E7EB', y: 140 });
        c.loose.push({ kind: 'wreck', z: tz, x: pr.x, h: 0, vz: c.speed * 0.8, vx: pr.side * 0.012, vh: 4, t: 0, rot: 0, color: pr.bike });
        c.parry = null;
      }
      break;
    case 'hockey':
      if (t === 4) playSound('clang', 0.7, -4);
      if (t === 9) {
        // (the spokes jammed: the bike stops dead, the kid pole-vaults over the bars onto the road ahead of him)
        c.loose.push({ kind: 'wreck', z: tz, x: pr.x, h: 0, vz: 0, vx: 0, vh: 9, t: 0, rot: 0, color: pr.bike });
        c.loose.push({ kind: 'vault', z: tz + 60, x: pr.x, h: 100, vz: c.speed + 60, vx: (c.x - pr.x) / 44, vh: 21, t: 0, rot: 0, k: pr.k });
        playSound('crash', 0.6, -2);
        c.parry = null;
      }
      break;
    case 'skateboard':
      if (t === 9) { playSound('crack', 0.8); c.pops.push({ text: 'NECK BOARD!', t: 0, col: '#C4B5FD', y: 130 }); }
      if (t === 14) {
        // (riding blind, wearing their board; make sure there's something to ride into)
        const base = Math.floor(c.z / SEG_L);
        let found = false;
        for (let i = base + 15; i < base + 60 && !found; i++) for (const sp of segAt(c.track, i).spr) if (!sp.gone && SPR[sp.k].solid === 'tall' && Math.sign(sp.x) === pr.side && Math.abs(sp.x) < 2) { found = true; break; }
        if (!found) segAt(c.track, base + 55).spr.push({ k: 'cow', x: pr.side * 1.4, seed: 11 });
        c.loose.push({ kind: 'blind', z: tz, x: pr.x, h: 0, vz: c.speed + 18, vx: pr.side * 0.008, vh: 0, t: 0, rot: 0, k: pr.k, color: pr.bike, side: pr.side });
        c.parry = null;
      }
      break;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Bails, deaths, blood

const blood = (c: Chase, z: number, x: number, h: number, n: number) => {
  for (let i = 0; i < n; i++) {
    if (c.parts.length > 220) c.parts.shift();
    c.parts.push({ z, x, h, vz: (rnd() - 0.3) * 30, vx: (rnd() - 0.5) * 0.03, vh: 4 + rnd() * 10, life: 30 + rnd() * 30, col: rnd() < 0.7 ? '#B91C1C' : '#7F1D1D', size: 30 + rnd() * 40 });
  }
};

const bail = (ctx: FrameContext, c: Chase, src: string, sp: Spr | null) => {
  const { state } = ctx;
  if (c.phase !== 'ride' || c.inv > 0) return;
  if (sp) killAnimal(c, sp, c.z);
  hurtPlayer(ctx, BAIL_DMG, src, { x: 0, y: 0 });
  c.phase = 'bail'; c.bail = { t: 0 }; c.punch = null; c.parry = null; c.shake = 16;
  c.loose.push({ kind: 'mh', z: c.z + 40, x: c.x, h: 60, vz: c.speed * 0.9, vx: c.vx, vh: 14, t: 0, rot: 0 });
  c.loose.push({ kind: 'mhbike', z: c.z, x: c.x, h: 0, vz: c.speed * 0.75, vx: 0, vh: 10, t: 0, rot: 0, color: c.bike });
  playSound('crash', 0.9); playSound('crunch', 0.7);
  blood(c, c.z, c.x, 200, 14);
  if (state.player.health <= 0) die(state, c);
};

/** Dead: the stage's own death scene (the tumble down the road plays out), then the death screen. */
const die = (state: GameState, c: Chase) => {
  if (c.phase === 'dead') return;
  if (!c.loose.some(l => l.kind === 'mh')) {
    c.loose.push({ kind: 'mh', z: c.z + 40, x: c.x, h: 60, vz: c.speed * 0.9, vx: c.vx, vh: 14, t: 0, rot: 0 });
    c.loose.push({ kind: 'mhbike', z: c.z, x: c.x, h: 0, vz: c.speed * 0.75, vx: 0, vh: 10, t: 0, rot: 0, color: c.bike });
  }
  c.phase = 'dead'; c.deathLast = -1;
  state.deathScene = { t: 0, len: 100, voiced: false };
  setUi({ bikeTips: false });
};

// ---------------------------------------------------------------------------------------------------------------
// The loose things: tumbling kids, loose bikes, the human bomb and its blast, the flyer into the tree, the faceplant,
// the vault and the human ramp, the blind rider, him and his bike in a bail

const tickLoose = (ctx: FrameContext | null, state: GameState, c: Chase) => {
  for (const l of c.loose) {
    if (l.done) continue;
    l.t++;
    const oldZ = l.z;
    switch (l.kind) {
      case 'tumbler': case 'mh': case 'vault':
        l.z += l.vz; l.x += l.vx; l.vh -= GRAV; l.h += l.vh; l.rot += l.kind === 'vault' ? 0.12 : 0.28;
        if (l.h <= 0) {
          l.h = 0;
          if (l.vh < -6) { l.vh = -l.vh * 0.35; l.vz *= 0.6; playSound('thud', 0.4, l.kind === 'mh' ? -4 : 2); blood(c, l.z, l.x, 20, 4); }
          else { l.vh = 0; l.vz *= 0.85; if (l.vz < 4) { l.vz = 0; if (l.kind === 'tumbler') l.kind = 'body'; else if (l.kind === 'vault') { l.kind = 'ramp'; c.pops.push({ text: 'HUMAN RAMP!', t: 0, col: '#86EFAC', y: 130 }); } } }
        }
        break;
      case 'wreck': case 'mhbike':
        l.z += l.vz; l.x += l.vx; l.vz *= 0.96; l.rot += l.vz * 0.004 + (l.vh > 0 ? 0.2 : 0);
        if (l.vh > 0 || l.h > 0) { l.vh -= GRAV; l.h = Math.max(0, l.h + l.vh); if (l.h === 0 && l.vh < 0) l.vh = l.vh < -4 ? -l.vh * 0.4 : 0; }
        if (l.vz < 3) l.vz = 0;
        break;
      case 'faceplant':
        l.z += l.vz; l.vz *= 0.95; if (l.vz < 3) l.vz = 0;
        // (the pack coming up behind runs over them: thumps once he's past)
        if (!l.ran && l.z < c.z - 200) l.ran = 1;
        if ((l.ran ?? 0) > 0 && l.t % 9 === 0 && (l.ran ?? 0) < 4 && l.z < c.z - 200) { l.ran = (l.ran ?? 0) + 1; playSound('crunch', 0.5, l.ran); l.flat = Math.min(1, (l.flat ?? 0) + 0.2); }
        break;
      case 'bomb':
        l.z += l.vz; l.vh -= 1; l.h += l.vh; l.rot += 0.3;
        if (l.h <= 0) {
          l.kind = 'blast'; l.t = 0; l.h = 0; l.vz = 0;
          playSound('boom', 1); c.shake = 18;
          blood(c, l.z, l.x, 100, 30);
          let n = 0;
          for (const t of c.teens) if (t.alive && Math.abs(t.z - l.z) < 800 && Math.abs(t.x - l.x) < 0.75) { knockOff(state, c, t, Math.sign(t.x - l.x) || 1, false); n++; }
          for (let i = Math.floor(l.z / SEG_L) - 4; i <= Math.floor(l.z / SEG_L) + 4; i++) for (const sp of segAt(c.track, i).spr) if (!sp.gone && SPR[sp.k].animal && Math.abs(sp.x - l.x) < 1.2) killAnimal(c, sp, i * SEG_L);
          segAt(c.track, Math.floor(l.z / SEG_L)).spr.push({ k: 'scorch', x: l.x, seed: 1 });
          c.pops.push({ text: n ? `HUMAN BOMB! +${n}` : 'HUMAN BOMB!', t: 0, col: '#FB923C', y: 120 });
        }
        break;
      case 'blast':
        if (ctx && l.t < 26 && c.phase === 'ride' && c.inv <= 0 && Math.abs(c.z - l.z) < 260 && Math.abs(c.x - l.x) < 0.45) {
          hurtPlayer(ctx, BOMB_DMG, 'm2:fr_teenbomb', { x: 0, y: 0 }); c.inv = 60; c.shake = 10;
          if (state.player.health <= 0) die(state, c);
        }
        if (l.t > 50) l.done = true;
        break;
      case 'flyer': {
        const to = l.to!, k = Math.min(1, l.t / to.n);
        l.z = to.z0 + (to.z - to.z0) * k; l.x = to.x0 + (to.x - to.x0) * k; l.h = 80 + Math.sin(k * Math.PI) * 500; l.rot += 0.35;
        if (k >= 1) { l.done = true; if (to.spr && !to.spr.gone) { to.spr.k = 'teentree'; to.spr.seed = l.k ? l.k.seed : 0; } playSound('splat', 0.9); playSound('crunch', 0.7); blood(c, to.z, to.x, 500, 16); }
        break;
      }
      case 'blind': {
        l.z += l.vz; l.vx += (rnd() - 0.5) * 0.004 + (l.side ?? 1) * 0.001; l.x += l.vx; l.vx *= 0.98; l.rot = Math.sin(l.t * 0.3) * 0.15;
        let sp: Spr | null = null;
        for (let i = Math.floor(oldZ / SEG_L); i <= Math.floor(l.z / SEG_L) && !sp; i++) { const s = hitIn(c, i, l.x, 0, 0.08); if (s && SPR[s.k].solid === 'tall') sp = s; }
        if (sp || l.t > 330 || Math.abs(l.x) > 2.6) {
          if (sp) { killAnimal(c, sp, l.z); playSound('crunch', 0.7); }
          l.done = true;
          c.loose.push({ kind: 'tumbler', z: l.z, x: l.x, h: 80, vz: l.vz * 0.5, vx: 0, vh: 10, t: 0, rot: 0, k: l.k });
          c.loose.push({ kind: 'wreck', z: l.z, x: l.x, h: 0, vz: l.vz * 0.4, vx: 0, vh: 6, t: 0, rot: 0, color: l.color });
          blood(c, l.z, l.x, 200, 12);
        }
        break;
      }
      case 'body': case 'ramp': break;
    }
    // (behind the camera a way: gone)
    if (l.z < c.z - PLAYER_Z - 1500 && l.kind !== 'mh' && l.kind !== 'mhbike') l.done = true;
  }
  c.loose = c.loose.filter(l => !l.done);
  // (blood: arcs, then a spatter on the road)
  for (const q of c.parts) { q.z += q.vz; q.x += q.vx; q.vh -= GRAV * 0.8; q.h = Math.max(0, q.h + q.vh); if (q.h === 0) { q.vz *= 0.7; q.vx = 0; q.vh = 0; } q.life--; }
  c.parts = c.parts.filter(q => q.life > 0);
};

/** Him passing over or into the loose things: bodies are bumps, the ramp launches him, a loose bike hurts. */
const hisLoose = (ctx: FrameContext, c: Chase, oldZ: number) => {
  for (const l of c.loose) {
    if (l.done) continue;
    const dx = Math.abs(l.x - c.x);
    const crossed = l.z > oldZ - 40 && l.z <= c.z + 40;
    if ((l.kind === 'body' || l.kind === 'faceplant') && crossed && dx < 0.25 && c.h < 30 && c.t - (l.hitAt ?? -99) > 30) {
      l.hitAt = c.t; c.vh = 5; c.h = 1; playSound('crunch', 0.6); blood(c, l.z, l.x, 30, 6); l.flat = Math.min(1, (l.flat ?? 0) + 0.5);
      if (l.kind === 'faceplant' && !l.ran) { l.ran = 1; c.pops.push({ text: 'SPLAT!', t: 0, col: '#FCA5A5', y: 160 }); }
    }
    if (l.kind === 'ramp' && crossed && dx < 0.3 && c.h < 30 && !l.flat) { c.vh = RAMP_V; c.h = 1; l.flat = 1; playSound('crunch', 0.8); blood(c, l.z, l.x, 30, 10); c.pops.push({ text: 'WHEEE!', t: 0, col: '#86EFAC', y: 120 }); }
    if (l.kind === 'wreck' && l.vz > 15 && Math.abs(l.z - c.z) < 120 && dx < 0.2 && c.h < 60 && c.inv <= 0) {
      hurtPlayer(ctx, WRECK_DMG, 'm2:fr_bikewreck', { x: 0, y: 0 }); c.inv = 50; c.shake = 8; c.vx += (c.x < l.x ? -1 : 1) * 0.03; l.vz = 0;
      playSound('clang', 0.7);
      if (ctx.state.player.health <= 0) die(ctx.state, c);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Tucker, glimpsed ahead (out of reach), yelling back

const tickTucker = (state: GameState, c: Chase) => {
  const T = c.tucker, f = state.frame;
  if (!T.on && f >= T.at && c.phase === 'ride') { T.on = true; T.t = 0; T.z = c.z + 9000; T.x = 0.3; T.leave = false; T.flee = false; }
  if (!T.on) return;
  T.t++;
  const dz = T.z - c.z, want = T.leave ? 16000 : 2500;
  T.z += Math.max(60, c.speed + clamp((want - dz) * 0.02, -60, 80));
  if (T.z < c.z + 1700) T.z = c.z + 1700;
  T.x += ((T.flee ? (T.t > 60 ? 2.6 : 0.6) : Math.sin(T.t * 0.01) * 0.4) - T.x) * (T.flee ? 0.02 : 0.03);
  const live = c.phase !== 'outro';
  if (T.t === 70 && live) speak(TUCKER_VOICE, pickLine(byPants(state, TUCKER_RAISE)), s => { T.said = s; }, true);
  if (T.t === 330 && live && rnd() < 0.6) speak(TUCKER_VOICE, pickLine(byPants(state, TUCKER_LEDGER)), s => { T.said = s; }, true);
  if (T.t > 560 && live) T.leave = true;
  if ((T.leave && dz > 14500) || (T.flee && T.x > 2.5)) { T.on = false; T.at = f + 1e9; }
};

// ---------------------------------------------------------------------------------------------------------------
// The frame

export const updateChase = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, c = chaseOf(state), p = state.player, f = state.frame;
  if (c.phase === 'off' || c.phase === 'dead') return {} as Controls;
  holdHim(state, true);
  if (c.fade > 0 && c.phase !== 'outro') c.fade = Math.max(0, c.fade - 1 / 30);
  if (c.tips > 0) c.tips--;
  setUi({ bikeHud: c.phase === 'ride' || c.phase === 'bail', bikeBoost: c.boost, bikeTips: c.tips > 0 && c.phase === 'ride' });
  if (c.hitStop > 0) { c.hitStop--; return {} as Controls; }
  c.t++;
  if (c.inv > 0) c.inv--;
  if (c.shake > 0) c.shake--;
  for (const q of c.pops) q.t++;
  c.pops = c.pops.filter(q => q.t < 70);
  const out = c.phase === 'outro';
  // ---- the controls (pressed this frame)
  const L = !!controls.shoot, R = !!(controls.special || controls.charge), J = !!controls.jump;
  const pressL = L && !c.prev.l, pressR = R && !c.prev.r, pressJ = J && !c.prev.j;
  c.prev.l = L; c.prev.r = R; c.prev.j = J;
  const riding = c.phase === 'ride' && !out;
  // ---- throttle, boost, steering
  const offroad = Math.abs(c.x) > 1.02;
  let target = out ? 120 : controls.down ? BRAKE : controls.up && c.boost > 0 ? BOOST : CRUISE;
  if (offroad) target = Math.min(target, ROUGH);
  if (c.phase === 'bail') target = 0;
  c.speed += (target - c.speed) * (target > c.speed ? (c.phase === 'bail' ? 0 : 0.025) : c.phase === 'bail' ? 0.09 : 0.06);
  if (riding && controls.up && c.boost > 0 && !offroad) c.boost = Math.max(0, c.boost - 1 / 150); else c.boost = Math.min(1, c.boost + 1 / 420);
  const sp = c.speed / MAXV, si = Math.floor(c.z / SEG_L), seg = segAt(c.track, si);
  const steer = riding ? (controls.right ? 1 : 0) - (controls.left ? 1 : 0) : out ? clamp(-c.x * 2, -1, 1) : 0;
  if (c.phase !== 'bail') {
    c.x += steer * 0.034 * (0.3 + sp) * (c.h > 0 ? 0.6 : 1);
    c.x -= seg.curve * sp * sp * 0.0045;
  }
  c.x += c.vx; c.vx *= 0.85;
  c.x = clamp(c.x, -2.8, 2.8);
  c.lean += ((c.phase === 'bail' ? 0 : steer * 0.22 + seg.curve * sp * 0.03) - c.lean) * 0.15;
  c.spin += c.speed * 0.02;
  c.bgX += seg.curve * sp * 2;
  // ---- moving on (and generating road ahead)
  const oldZ = c.z;
  c.z += c.speed;
  generate(c.track, Math.floor(c.z / SEG_L) + DRAW + 30);
  // ---- up in the air: a jump, a dirt jump, a ramp
  if (riding && pressJ && c.h === 0) { c.vh = JUMP_V; c.h = 0.1; playSound('jump', 0.5, -4); }
  if (c.h > 0 || c.vh > 0) {
    c.vh -= GRAV; c.h += c.vh;
    if (c.h <= 0) { c.h = 0; c.vh = 0; playSound('land', 0.5); c.shake = Math.max(c.shake, 4); }
  }
  // ---- what he rides into
  if (riding) {
    for (let i = Math.floor(oldZ / SEG_L); i <= Math.floor(c.z / SEG_L); i++) {
      const s = segAt(c.track, i);
      if (s.mound && c.h === 0) { c.vh = MOUND_V; c.h = 0.1; playSound('jump', 0.4, 2); }
      if (s.water && c.h < 15) { bail(ctx, c, 'm2:fr_bail_creek', null); playSound('splash', 0.9); break; }
      // (a first-aid kit somebody dropped)
      for (const q of s.spr) if (q.k === 'health' && !q.gone && Math.abs(q.x - c.x) < 0.2 && c.h < 150) { q.gone = true; p.health = Math.min(p.maxHealth, p.health + 30); playSound('pickup'); }
      const hit = hitIn(c, i, c.x, c.h, 0.08);
      if (hit) { bail(ctx, c, SPR[hit.k].src ?? 'm2:fr_bail_tree', hit); break; }
    }
  }
  // (deer crossing the road as he comes: from whichever side it's on to the other)
  for (let i = si; i < si + 50; i++) for (const q of segAt(c.track, i).spr) if (q.vx && q.k === 'deer') {
    if (!q.t) { q.t = 1; q.vx = -Math.sign(q.x) * Math.abs(q.vx); }
    q.x += q.vx;
    if (Math.abs(q.x) > 2.4 && Math.sign(q.x) === Math.sign(q.vx)) q.vx = 0;
  }
  if (c.phase === 'ride' || c.phase === 'bail' || out) hisLoose(ctx, c, oldZ);
  // ---- his punches
  if (c.punchCool > 0) c.punchCool--;
  if (c.punch && ++c.punch.t >= 14) { c.punch = null; c.punchCool = 10; }
  if (riding && !c.parry) { if (pressL) attack(state, c, -1); else if (pressR) attack(state, c, 1); }
  if (c.parry) tickParry(state, c);
  // ---- the teens, the loose things, Tucker
  updateTeens(ctx, c);
  tickLoose(ctx, state, c);
  tickTucker(state, c);
  // ---- the engine's buzz (his, faster with the speed)
  if (f >= c.engineAt && c.phase !== 'bail') { c.engineAt = f + 18; playSound('engine', 0.16, -6 + sp * 12); }
  if (offroad && riding && f % 3 === 0) { c.parts.push({ z: c.z - 60, x: c.x + (rnd() - 0.5) * 0.2, h: 10, vz: c.speed * 0.6, vx: (rnd() - 0.5) * 0.02, vh: 3 + rnd() * 3, life: 18, col: '#9A7A50', size: 50 }); if (f % 9 === 0) c.shake = Math.max(c.shake, 2); }
  // ---- a bail: back on the road
  if (c.phase === 'bail' && c.bail) {
    c.bail.t++;
    if (c.bail.t >= 80) {
      c.phase = 'ride'; c.bail = null;
      c.loose = c.loose.filter(l => l.kind !== 'mh' && l.kind !== 'mhbike');
      c.x = clamp(c.x, -0.6, 0.6); c.vx = 0; c.speed = 50; c.h = 0; c.vh = 0; c.inv = 120;
    }
  }
  // ---- the waves
  if (c.phase === 'ride') {
    const wv = WAVES[c.wave];
    const alive = c.teens.length;
    if (c.spawned < wv.teens.length && alive < wv.pack && f >= c.spawnAt) { spawnTeen(state, c, c.spawned % 3 !== 1); c.spawnAt = f + 70 + Math.floor(rnd() * 80); }
    if (c.spawned >= wv.teens.length && alive === 0 && !c.parry && c.killed >= wv.teens.length) {
      if (c.wave < WAVES.length - 1) {
        c.wave++; c.spawned = 0; c.killed = 0; c.spawnAt = f + 160;
        const nw = WAVES[c.wave];
        nextBiome(c.track, nw.biome, nw.sign, true);
        if (state.checkpoint < 50 + c.wave) state.checkpoint = 50 + c.wave;
        if (!c.tucker.on) c.tucker.at = f + 240;
      } else startOutro(state, c);
    }
  }
  if (out) tickOutro(state, c);
  return {} as Controls;
};

// ---------------------------------------------------------------------------------------------------------------
// The end: the last teen down; Tucker's bounty's gone and off he goes into the trees; Meathead after him (a cutscene:
// no HUD, SKIP >> for all of it), black, the arena

const startOutro = (state: GameState, c: Chase) => {
  c.phase = 'outro'; c.outro = { t: 0, step: 'talk', said: false };
  state.player.inCutscene = true;
  setUi({ bikeHud: false, bikeTips: false });
  offerSkip();
  const T = c.tucker;
  if (!T.on) { T.on = true; T.t = 0; T.z = c.z + 6000; T.x = 0.2; }
  T.flee = false; T.leave = false; T.at = state.frame + 1e9;
};
const tickOutro = (state: GameState, c: Chase) => {
  const o = c.outro, T = c.tucker;
  o.t++;
  if (o.t > SKIP_AFTER) offerSkip();
  if (takeSkip()) { silenceAll(); finishChase(state); return; }
  if (o.t === 50) speak(TUCKER_VOICE, pickLine(byPants(state, TUCKER_FLEE)), s => { T.said = s; }, true, () => {
    T.flee = true; T.t = 0;
    meatheadSays(state, pickLine(byPants(state, MH_END)), true, () => { o.step = 'fade'; });
  });
  if (o.t > 900) o.step = 'fade';
  if (o.step === 'fade') { c.fade = Math.min(1, c.fade + 1 / 40); if (c.fade >= 1) finishChase(state); }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the road view on its own little canvas, blown up over the whole screen, then the words and the HUD bits

let low: HTMLCanvasElement | null = null;
const P = { n: 0, sx: 0, sy: 0, sc: 0, clip: 0 };
interface Ent { z: number; draw: () => void }
const buckets: Ent[][] = Array.from({ length: DRAW + 2 }, () => []);

/** px per art unit at scale sc. */
const artS = (sc: number) => sc * ART * K;

export const drawChase = (c0: CanvasRenderingContext2D, state: GameState) => {
  const c = chaseOf(state);
  if (c.phase === 'off') return;
  const f = state.frame;
  // (dead: the tumble plays out with the death scene's frames)
  if (c.phase === 'dead') {
    const t = state.deathScene?.t ?? 999;
    while (c.deathLast < t && c.deathLast < 140) { c.deathLast++; c.speed *= 0.93; c.z += c.speed; tickLoose(null, state, c); }
  }
  if (!low) { low = document.createElement('canvas'); low.width = W; low.height = H; }
  const g = low.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // ---- the camera behind him
  const camZ = c.z - PLAYER_Z, camY = roadYAt(c.track, c.z) + CAM_H;
  project(c.track, camZ, c.x * 1000, camY);
  const pseg = segAt(c.track, Math.floor(c.z / SEG_L));
  drawBackground(g, pseg.biome, c.bgX, 0);
  drawRoad(g, c.track);
  // ---- everything that moves, into its slot
  for (const b of buckets) b.length = 0;
  const into = (z: number, draw: () => void) => { const n = Math.floor((z - view.base * SEG_L) / SEG_L); if (n >= 1 && n <= DRAW) buckets[n].push({ z, draw }); };
  const shat = isShat(state), nude = isNude(state), wounds = tuckerWoundsOf(state);
  const wv = WAVES[c.wave];
  for (const t of c.teens) {
    into(t.z, () => {
      placeAt(t.z, t.x, P); if (P.n < 1) return;
      const s = artS(P.sc), y = P.sy - t.h * P.sc * K;
      if (y - 90 * s > P.clip) return;
      const tell = t.mode === 'wind' && t.t >= wv.wind - TELL;
      const pose: RiderPose = { lean: t.lean, side: -t.side, arm: t.mode === 'wind' ? 'wind' : t.mode === 'swing' ? 'swing' : 'idle', flash: tell && (f >> 2) % 2 === 0, look: t.mode === 'hover' ? 0 : -t.side, hit: t.hit > 0, spin: t.z * 0.01 };
      shadow(g, P.sx, P.sy, s, P.clip);
      drawTeenRider(g, t.k, t.weapon, pose, P.sx, y, s, f + t.id * 7);
      // (the tell: a "!" over their head)
      if (tell) { const ex = P.sx, ey = y - 104 * s; g.fillStyle = (f >> 2) % 2 ? '#FDE047' : '#FFFFFF'; g.fillRect(ex - 1.5 * s, ey - 9 * s, 3 * s, 7 * s); g.fillRect(ex - 1.5 * s, ey, 3 * s, 2.5 * s); }
      if (t.said) sayAt.push({ text: t.said.text, x: P.sx * 2, y: (y - 108 * s) * 2, col: '#E0F2FE' });
    });
  }
  for (const l of c.loose) into(l.z, () => drawLoose(g, c, l, f, shat, nude));
  if (c.tucker.on) into(c.tucker.z, () => {
    placeAt(c.tucker.z, c.tucker.x, P); if (P.n < 1) return;
    const s = artS(P.sc);
    shadow(g, P.sx, P.sy, s, P.clip);
    drawTuckerRider(g, P.sx, P.sy, s, Math.sin(c.tucker.t * 0.05) * 0.1, wounds, !!c.tucker.said, f);
  });
  // (him)
  const me = c.phase !== 'bail' && !(c.phase === 'dead');
  if (me) into(c.z, () => {
    placeAt(c.z, c.x, P);
    const s = artS(P.sc), y = P.sy - c.h * P.sc * K;
    shadow(g, P.sx, P.sy, s * (1 - Math.min(0.5, c.h / 600)), H);
    const pose: MhPose = { lean: c.lean, spin: c.spin, punch: c.punch ? c.punch.side : 0, reach: c.punch ? c.punch.t / 14 : 0, parry: c.parry ? { w: c.parry.w, t: c.parry.t, side: c.parry.side } : null, shat, nude, blink: c.inv > 0 && c.phase === 'ride' && c.inv < 120 && c.inv > 0, bike: c.bike };
    drawMeathead(g, pose, P.sx, y, s, f);
    meAt.x = P.sx; meAt.y = y - 104 * s; meAt.s = s; meAt.base = y;
    if (c.parry) drawParry(g, c, P.sx, y, s, f);
  });
  // ---- far to near: each slot's roadside things, then its movers
  for (let n = DRAW; n >= 1; n--) {
    const s = segAt(c.track, view.base + n);
    if (s.spr.length && PZ[n] > 60) {
      for (const q of s.spr) {
        if (q.gone) continue;
        const sc = PS[n], sx = PX[n] + sc * q.x * 1000 * K, sy = PY[n];
        if (sx < -400 || sx > W + 400 || sy - 20 > CLIP[n]) continue;
        if (q.k === 'scorch') { g.fillStyle = 'rgba(20,14,10,0.8)'; g.beginPath(); g.ellipse(sx, sy, Math.max(1, sc * 450 * K), Math.max(0.5, sc * 80 * K), 0, 0, Math.PI * 2); g.fill(); continue; }
        drawSpr(g, q.k, q.seed, sx, sy, sc, CLIP[n], q.words, (q.k === 'cow' || q.k === 'deer' || q.k === 'deadcow' || q.k === 'deaddeer') && q.x < 0);
      }
    }
    const b = buckets[n];
    if (b.length > 1) b.sort((a, z) => z.z - a.z);
    for (const e of b) e.draw();
  }
  // (blood in the air and on the road)
  for (const q of c.parts) {
    placeAt(q.z, q.x, P); if (P.n < 1) continue;
    const sz = Math.max(1, q.size * P.sc * K * 0.12), y = P.sy - q.h * P.sc * K;
    if (y > P.clip + 2) continue;
    g.fillStyle = q.col; g.fillRect(Math.round(P.sx - sz / 2), Math.round(y - sz / 2), Math.ceil(sz), Math.ceil(sz));
  }
  // ---- the hour's light over it all
  const mul = timeOfDay().mul;
  if (mul && mul.toUpperCase() !== '#FFFFFF') { g.globalCompositeOperation = 'multiply'; g.fillStyle = mul; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  // ---- blown up onto the screen (shaken)
  c0.save();
  c0.imageSmoothingEnabled = false;
  const sh = c.shake > 0 ? c.shake * 0.6 : 0;
  c0.drawImage(low, Math.round((rnd() - 0.5) * sh), Math.round((rnd() - 0.5) * sh), CANVAS_WIDTH, CANVAS_HEIGHT);
  c0.restore();
  drawOver(c0, state, c);
  sayAt.length = 0;
};

const shadow = (g: CanvasRenderingContext2D, x: number, y: number, s: number, clip: number) => { if (y > clip + 1) return; g.fillStyle = 'rgba(20,12,6,0.35)'; g.beginPath(); g.ellipse(x, y, 16 * s, 3.5 * s, 0, 0, Math.PI * 2); g.fill(); };
const meAt = { x: W / 2, y: 180, s: 1, base: 260 };
const sayAt: { text: string; x: number; y: number; col: string }[] = [];

/** A loose thing on the road. */
const drawLoose = (g: CanvasRenderingContext2D, c: Chase, l: Loose, f: number, shat: boolean, nude: boolean) => {
  placeAt(l.z, l.x, P); if (P.n < 1) return;
  const s = artS(P.sc), y = P.sy - l.h * P.sc * K;
  if (y - 40 * s > P.clip) return;
  switch (l.kind) {
    case 'tumbler': case 'vault': case 'flyer': if (l.k) { shadow(g, P.sx, P.sy, s * 0.7, P.clip); drawTeenBody(g, l.k, P.sx, y, s, l.rot, false); } break;
    case 'body': case 'faceplant': case 'ramp': if (l.k) drawTeenBody(g, l.k, P.sx, P.sy, s, 0, true, l.flat ?? 0); break;
    case 'blind':
      if (l.k) {
        // (riding on blind, wearing their board round their neck, flailing)
        drawTeenRider(g, l.k, 'skateboard', { lean: l.rot, side: 1, arm: 'none', flash: false, look: 0, hit: false, spin: l.z * 0.01 }, P.sx, P.sy, s, f);
        g.save(); g.translate(P.sx, P.sy - 74 * s * 0.92); g.scale(s, s);
        g.fillStyle = INK; g.fillRect(-17, -4, 34, 9); g.fillStyle = '#7C3AED'; g.fillRect(-16, -3, 32, 7); g.fillStyle = '#F5F5F4'; g.fillRect(-13, 4, 4, 2); g.fillRect(9, 4, 4, 2);
        g.restore();
      }
      break;
    case 'wreck': case 'mhbike': shadow(g, P.sx, P.sy, s * 0.8, P.clip); drawBikeTumble(g, P.sx, y, s, l.rot, l.color ?? '#888888'); break;
    case 'mh': shadow(g, P.sx, P.sy, s * 0.7, P.clip); drawMhTumble(g, P.sx, y - 10 * s, s, l.rot, nude, shat); break;
    case 'bomb': if (l.k) { drawTeenBody(g, l.k, P.sx, y, s, l.rot, false); g.fillStyle = (f >> 2) % 2 ? '#FDE047' : '#F97316'; g.fillRect(P.sx - 2 * s, y - 34 * s, 4 * s, 4 * s); } break;
    case 'blast': {
      // (the human bomb: a banded fireball, white to yellow to orange to red, then smoke, chunks flying)
      const k = Math.min(1, l.t / 14), r = (30 + k * 90) * s, fade = l.t > 26 ? Math.max(0, 1 - (l.t - 26) / 24) : 1;
      const cy = P.sy - r * 0.7;
      g.globalAlpha = fade;
      const rings = l.t < 26 ? ['#7F1D1D', '#DC2626', '#F97316', '#FDE047', '#FFFBEB'] : ['#3F3F46', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8'];
      rings.forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(P.sx, cy, r * (1 - i * 0.18), 0, Math.PI * 2); g.fill(); });
      for (let i = 0; i < 8; i++) { const a = i * 0.8 + l.t * 0.05, d = r * (0.6 + k * 0.9); g.fillStyle = i % 3 ? '#7F1D1D' : '#F5F5F4'; g.fillRect(P.sx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6 - l.t * s * 0.6, 4 * s, 4 * s); }
      g.globalAlpha = 1;
      break;
    }
  }
};

/** The parry's flourish: the kid (and their weapon) in his hands, before they're thrown, flung or left. */
const drawParry = (g: CanvasRenderingContext2D, c: Chase, mx: number, my: number, s: number, f: number) => {
  const pr = c.parry!, t = pr.t, sd = pr.side;
  placeAt(c.z + pr.dz, pr.x, P);
  const tx = P.n >= 1 ? P.sx : mx + sd * 60 * s, ty = P.n >= 1 ? P.sy : my;
  const ts = P.n >= 1 ? artS(P.sc) : s;
  const rider = (arm: RiderPose['arm'], hit = false) => drawTeenRider(g, pr.k, pr.w, { lean: sd * 0.1, side: -sd, arm, flash: false, look: -sd, hit, spin: f }, tx, ty, ts, f);
  const ln = (x1: number, y1: number, x2: number, y2: number, col: string, w: number) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
  switch (pr.w) {
    case 'chain': {
      if (t < 8) {
        // (caught by the chain: yanked off their bike toward him)
        const k = t / 8, bx = tx + (mx - tx) * k * 0.6, by = ty - 50 * ts - k * 40 * s;
        rider('none');
        ln(mx + sd * 38 * s, my - 70 * s, bx, by, '#A1A1AA', Math.max(1, s));
        drawTeenBody(g, pr.k, bx, by + 20 * s, ts, sd * k * 2, false);
      } else {
        // (whirled round over his head on the chain)
        const a = ((t - 8) / 26) * Math.PI * 3, hx = mx, hy = my - 100 * s;
        const bx = hx + Math.cos(a) * 34 * s, by = hy - 14 * s + Math.sin(a) * 9 * s;
        ln(hx, hy, bx, by, '#A1A1AA', Math.max(1, s * 1.2));
        drawTeenBody(g, pr.k, bx, by + 14 * s, s * 0.85, a + Math.PI / 2, false);
      }
      break;
    }
    case 'bat': {
      rider('swing', t >= 10 && t < 14);
      // (the bat caught in his fist, then brought down on their head)
      const hx = mx + sd * (t < 6 ? 38 : 24) * s, hy = my - (t < 6 ? 70 : 96 - (t - 6) * 3) * s;
      drawWeapon(g, 'bat', hx, hy, sd > 0 ? (t < 6 ? 0 : 0.2 + (t - 6) * 0.12) : Math.PI - (t < 6 ? 0 : 0.2 + (t - 6) * 0.12), false, f);
      if (t >= 10 && t < 16) star(g, tx, ty - 86 * ts, 10 * ts, '#FFFFFF');
      break;
    }
    case 'crowbar': {
      rider(t < 5 ? 'swing' : 'none');
      const hx = mx + sd * 38 * s, hy = my - 70 * s;
      drawWeapon(g, 'crowbar', hx - sd * t * 2 * s, hy, sd > 0 ? Math.PI : 0, false, f);
      break;
    }
    case 'nunchucks': {
      if (t < 10) {
        rider('none');
        // (wrapped round their neck, his fist on the other end)
        g.strokeStyle = '#3A2A1A'; g.lineWidth = Math.max(1, 2 * ts); g.beginPath(); g.ellipse(tx, ty - 74 * ts, 7 * ts, 3 * ts, 0, 0, Math.PI * 2); g.stroke();
        ln(mx + sd * 10 * s, my - 60 * s, tx, ty - 74 * ts, '#A1A1AA', Math.max(1, s));
      } else {
        // (slung back over his shoulder, at us, past the camera, into the pack behind)
        const k = (t - 10) / 18, sc = s * (1 + k * 3.2);
        const bx = tx + (mx - sd * 40 * s - tx) * k, by = ty - 70 * ts - Math.sin(k * Math.PI) * 70 * s + k * k * 260 * s;
        drawTeenBody(g, pr.k, bx, by, sc, k * 9 * -sd, false);
      }
      break;
    }
    case 'hockey': {
      rider(t < 4 ? 'swing' : 'none');
      // (the stick jammed in their front spokes)
      if (t >= 4) { ln(mx + sd * 38 * s, my - 66 * s, tx, ty - 14 * ts, '#D6B07A', Math.max(1, 2 * s)); if (t >= 7) star(g, tx, ty - 14 * ts, 8 * ts, '#FDE047'); }
      else drawWeapon(g, 'hockey', mx + sd * 38 * s, my - 70 * s, sd > 0 ? 0 : Math.PI, false, f);
      break;
    }
    case 'skateboard': {
      rider(t < 6 ? 'swing' : 'none', t >= 9 && t < 12);
      // (snatched, then down over their head: their head through the deck)
      if (t < 9) drawWeapon(g, 'skateboard', mx + sd * (38 - t * 2) * s, my - (70 + t * 3) * s, sd > 0 ? -0.4 : Math.PI + 0.4, false, f);
      else { g.save(); g.translate(tx, ty - 74 * ts * 0.92); g.scale(ts, ts); g.fillStyle = INK; g.fillRect(-17, -4, 34, 9); g.fillStyle = '#7C3AED'; g.fillRect(-16, -3, 32, 7); g.restore(); if (t < 12) star(g, tx, ty - 86 * ts, 9 * ts, '#FFFFFF'); }
      break;
    }
  }
};

const star = (g: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) => {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, rr = i % 2 ? r * 0.45 : r; g[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
};

/** Over the blown-up view, at full size: what's said, the sub-boss bar, the speedo, Tucker's talking head, the pops,
 *  the fade, the skip. */
const drawOver = (c: CanvasRenderingContext2D, state: GameState, ch: Chase) => {
  const p = state.player, cut = ch.phase === 'outro';
  // (the teens' words over their heads; his over his)
  for (const s of sayAt) saidOver(c, s.text, s.x, s.y, s.col, 220);
  if (ch.yelp) saidOver(c, ch.yelp.text, 400, 380, '#E0F2FE', 260);
  if (state.playerLastVulgarity && state.playerVulgarityTimer > 0 && ch.phase !== 'dead') saidOver(c, state.playerLastVulgarity, meAt.x * 2, Math.min(meAt.y * 2, 470), '#FFFFFF', 300);
  // (Tucker's talking head, while he's yelling: a Genesis inset, his face at full detail)
  if (ch.tucker.said) {
    const x = 612, y = 118, w = 170, h = 150;
    sbox(c, x - 3, y - 3, w + 6, h + 6, '#0B0B0F'); sbox(c, x, y, w, h, '#2A3A5A');
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    drawTuckerCloseup(c, x + w / 2, y + 72, 4.2, state.frame, { wounds: tuckerWoundsOf(state), talking: true, face: 'manic', red: true, jolt: 0.3 });
    c.restore();
    label(c, 'TUCKER', x + w / 2, y + h + 14, '#FDE68A', 7);
    saidOver(c, ch.tucker.said.text, x + w / 2 - 120, y + h + 40, '#FDE68A', 300);
  }
  if (!cut && ch.phase !== 'dead' && !p.inCutscene) {
    // The sub-boss bar (the top band, clear of the HUD): the teens left, pooled
    const band = topBand(), w = band.x2 - band.x1, left = teensLeft(ch), k = left / TOTAL;
    sbox(c, band.x1, 18, w, 14, '#18181B');
    sbox(c, band.x1 + 2, 20, (w - 4) * k, 10, k < 0.33 ? '#EF4444' : '#F59E0B');
    label(c, 'TEENAGERS', band.mid, 46, '#FDE68A', 7);
    label(c, `${left} LEFT`, band.x2 - 40, 60, '#A1A1AA', 6);
    // (the speedo, bottom right)
    label(c, `${Math.round(ch.speed * 0.45)} MPH`, CANVAS_WIDTH - 70, CANVAS_HEIGHT - 24, ch.speed > CRUISE + 10 ? '#FDE047' : '#F5F5F4', 10);
  }
  // (the pops: PARRY!, STRIKE!, HUMAN BOMB!...)
  for (const q of ch.pops) {
    const k = Math.min(1, q.t / 8), y = q.y * 2 - q.t * 0.8;
    c.save(); c.globalAlpha = q.t > 50 ? Math.max(0, 1 - (q.t - 50) / 20) : 1;
    c.font = `${Math.round(14 + k * 6)}px "Press Start 2P"`; c.textAlign = 'center';
    c.fillStyle = '#000000'; c.fillText(q.text, 402, y + 3); c.fillStyle = q.col; c.fillText(q.text, 400, y);
    c.restore();
  }
  if (ch.fade > 0) { c.fillStyle = `rgba(0,0,0,${ch.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if (cut && ch.outro.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
};
