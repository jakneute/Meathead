// THE BROOMSTICK DEATHMATCH itself: a self-contained mode that takes over the screen (as the Road Rash chase does:
// frontier/dirtbike/chase.ts), behind his back on his broom over the castle grounds (arena.ts: the mode 7 floor, the
// castle, the towers, the balloons), its own HUD bits drawn over it (the suitors' bar, the radar, the altimeter, the
// up/down plate) and React's (broomHud / broomTips in store.ts). His figure in the side view is hidden and held.
//
// Modeled on STAR FOX 64's ALL-RANGE MODE (the user's), simpler: the camera behind him, a bounded arena round a
// landmark, a forced U-turn at its edge, the radar, everybody arrowed and marked, the charged lock-on.
//
// FLYING (the user's): up / down PITCH (NOT inverted to start: up climbs; Y or alternate fire flips it, the plate says
// which, a flash says so), left / right TURN (he leans into it). A (jump) BOOSTS (a burst: a short meter, used up it
// refills before it'll go again); B (the boost button) BRAKES while held: deliberate, not to be swapped. Skimming the
// lawn is fine; the park's MAGIC WALL forces a U-turn (swung round and back in, his controls off a moment, no damage);
// the castle and its towers are solid (fly into one: it bounces him off and hurts).
// X fires the LASER on the broom's end (the user's): tap, a pink beam (unlimited, a little aim help toward whoever's
// nearest the middle); HOLD, the lock-on (Star Fox's): the reticle sweeps and grows, snaps red onto the suitor ahead
// with a tone; let go locked and it's a HOMING shot (5 times the damage); let go unlocked, just the laser.
//
// THE SUITORS: whoever flew off the runway (state.stageMemo 'fa-broom-roster'; the FASTPASS boys if it's missing) and
// the LATE ENTRIES (paid cash at the gate: they fly in over the wall when the first lot's down to one, or after a
// while), 6 to 8 in all, each his own way on a broom: FLANKERS (get behind or beside, throw / shoot), CHARGERS (a
// glint, then a straight ram: Hank's foam lance), SNIPERS (keep away, a long aim, one fast bolt), HUNTERS (go after the
// other suitors first). They fight each other as much as him (hit one and he wants you back). Shot down: a spiral, a
// scream and a shit, into the lawn, a tower or the drained moat; dead for good (through his deaths, this visit).
// All dead: the rose barrier on her window wilts, he's flown at it (a cutscene: the rapid zoom), the glass breaks
// over the screen in shards, and he's outside the Great Pixie's bedroom.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, pickFreshLine, silenceAll, announce } from '../../../m1/game/platform/speech';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { inputDevice, padFamily } from '../../../m1/game/platform/device';
import { registerHurtLines } from '../../kinds';
import { setUi } from '../../store';
import { meatheadSays, speak, saidOver, byPants, landVisit, teleport, fantasyState, type Said } from '../section';
import { DOORS } from '../geometry';
import { PIPER_PA_VOICE } from '../talk';
import { RIVALS } from '../glen/rivals';
import { FASTPASS } from '../keep/runway';
import { ROSTER_MEMO } from '../keep/state';
import type { SuitorLook } from '../suitors';
import { hash } from '../kit';
import {
  W, H, HORIZON, FOCAL, CAM_BACK, CAM_UP, WALL_R, MIN_ALT, MAX_ALT, MOAT, CASTLE_U, WINDOW, SOLIDS, TOWERS, FLAGS, BALLOONS, TREES,
  CASTLE_K, CASTLE_CX, CASTLE_CY, TOWER_PX, view, setView, project, seen, solidAt, radiusAt, topOf, balloonAt,
  drawSky, drawGround, castleCanvas, towerCanvas, treeCanvas, flagCanvas, balloonCanvas, type Proj, type Solid,
} from './arena';
import { drawMeatheadBroom, drawMeatheadFall, riderCanvas, clearRiders, drawThing, drawCorpse, RIDER_W, RIDER_H, RIDER_AX, RIDER_AY, type Thing } from './art';
import {
  BROOM_VOICES, MH_START, MH_AGAIN, MH_KILL, MH_INFIGHT, MH_WALL, MH_LATE, MH_LAST, MH_WIN, PIPER_START, PIPER_KILL, PIPER_INFIGHT,
  PIPER_LATE, PIPER_LAST, PIPER_WIN, PIPER_WALL, TAUNT, RIVAL, DIE, SRC, HURT, KILL_CALLS, type FlyerId,
} from './lines';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

/** The deathmatch won (never again): stageMemo. */
export const BROOM_MEMO = 'fa-broom-done';
export const broomDone = (state: GameState) => state.stageMemo[BROOM_MEMO] === '1';

// ---------------------------------------------------------------------------------------------------------------
// The flyers

type Style = 'flank' | 'charge' | 'snipe' | 'hunt';
type Atk = 'bolt' | 'burst' | 'snipe' | 'shaker' | 'dumbbell' | 'turkey';
interface Def { id: FlyerId; look: SuitorLook; tiara: boolean; style: Style; atk: Atk; hp: number; turn: number; speed: number; late: boolean }

/** The late entries: new, beefy, paid cash. */
const WILD: { id: 'brody' | 'sven' | 'sebastian'; look: SuitorLook }[] = [
  { id: 'brody', look: { name: 'BRODY', skin: ['#E8A070', '#C47A48', '#8E5230'], hair: '#140A06', kit: 'tee', main: '#F97316', trim: '#FFFFFF', voice: BROOM_VOICES.brody, gut: 0.2 } },
  { id: 'sven', look: { name: 'SVEN', skin: ['#FFE0CC', '#F2BFA0', '#C88E70'], hair: '#E8D090', kit: 'viking', main: '#5A4A3A', trim: '#B8B8C0', voice: BROOM_VOICES.sven, gut: 0.7 } },
  { id: 'sebastian', look: { name: 'SEBASTIAN', skin: ['#6A4026', '#4A2A16', '#2E180A'], hair: '#140A06', kit: 'prince', main: '#0F766E', trim: '#F6D365', voice: BROOM_VOICES.sebastian, gut: 0 } },
];
const STYLE: Record<FlyerId, { style: Style; atk: Atk; hp: number; turn: number; speed: number }> = {
  blake: { style: 'flank', atk: 'shaker', hp: 13, turn: 0.032, speed: 24 },
  rafael: { style: 'hunt', atk: 'dumbbell', hp: 14, turn: 0.03, speed: 23 },
  hank: { style: 'charge', atk: 'turkey', hp: 18, turn: 0.026, speed: 21 },
  chet: { style: 'flank', atk: 'burst', hp: 12, turn: 0.036, speed: 25 },
  thaddeus: { style: 'snipe', atk: 'snipe', hp: 12, turn: 0.04, speed: 24 },
  dmitri: { style: 'charge', atk: 'bolt', hp: 16, turn: 0.028, speed: 22 },
  brody: { style: 'hunt', atk: 'burst', hp: 13, turn: 0.034, speed: 24 },
  sven: { style: 'charge', atk: 'bolt', hp: 17, turn: 0.026, speed: 21 },
  sebastian: { style: 'snipe', atk: 'snipe', hp: 11, turn: 0.036, speed: 23 },
};
const RIVAL_IDS = RIVALS.map(r => r.id) as FlyerId[];
const LOOKS: Record<string, SuitorLook> = Object.fromEntries([...RIVALS, ...FASTPASS, ...WILD].map(r => [r.id, r.look]));

/** Who's in the sky: the runway's roster (the FASTPASS three if there's none: a checkpoint start), then the late
 *  entries to make 6 to 8. */
const rosterOf = (state: GameState): Def[] => {
  const memo = (state.stageMemo[ROSTER_MEMO] ?? '').split(',').filter(id => id in STYLE && LOOKS[id]) as FlyerId[];
  const first = memo.length ? memo : (FASTPASS.map(r => r.id) as FlyerId[]);
  const late = WILD.slice(0, Math.max(1, Math.min(3, 7 - first.length))).map(w => w.id as FlyerId);
  const def = (id: FlyerId, isLate: boolean): Def => {
    const st = STYLE[id], look = LOOKS[id];
    return { id, look, tiara: RIVAL_IDS.includes(id), ...st, hp: st.hp + (look.gut >= 0.5 ? 2 : 0), late: isLate };
  };
  return [...first.map(id => def(id, false)), ...late.map(id => def(id, true))];
};

type Mode = 'fly' | 'aim' | 'wind' | 'tell' | 'ram' | 'recover';
interface Fall { t: number; by: number; wall: Solid | null; splat: boolean; spin: number; kind: 'ground' | 'wall' | 'moat' }
interface Flyer {
  d: Def; i: number;
  x: number; z: number; alt: number; yaw: number; yawRate: number; speed: number; valt: number; bank: number; face: 1 | -1;
  hp: number; mode: Mode; t: number; cool: number; shots: number;
  target: number; retarget: number; aggro: number; aggroOn: number; side: number; far: number;
  ramYaw: number; ramValt: number;
  hit: number; said: Said | null; alive: boolean; in: boolean; gone: boolean; fall: Fall | null;
}
interface Shot { k: Thing; x: number; z: number; alt: number; vx: number; vz: number; valt: number; g: number; life: number; owner: number; dmg: number; foe: number; src: string; rot: number; home?: number }
interface Part { x: number; z: number; alt: number; vx: number; vz: number; valt: number; g: number; life: number; col: string; size: number }
interface Pop { text: string; t: number; col: string }

/** What outlives his deaths (this visit): who's dead and where they came down, the late entries in, what's been said. */
interface Corpse { x: number; z: number; kind: 'ground' | 'wall' | 'moat'; smear: { x: number; z: number; alt: number } | null }
const kept = { visit: -1, dead: new Map<FlyerId, Corpse>(), late: false, said: false, tips: false, last: false };
const keptOf = () => {
  if (kept.visit !== landVisit()) { kept.visit = landVisit(); kept.dead.clear(); kept.late = false; kept.said = false; kept.tips = false; kept.last = false; }
  return kept;
};
/** Up / down inverted: his to flip (Y / alternate fire); kept as he left it. */
let inverted = false;

interface Fight {
  phase: 'off' | 'fly' | 'dead' | 'win' | 'zoom';
  t: number;
  x: number; z: number; alt: number; yaw: number; yawRate: number; valt: number; speed: number; boost: number; bank: number; pitch: number;
  fireCool: number; fired: number; inv: number; shake: number; fade: number; tips: number; flash: number; hy: number;
  flyers: Flyer[]; shots: Shot[]; parts: Part[]; pops: Pop[];
  prevY: boolean; lock: number;
  /** X held (frames), the lock it's got (a suitor's index, or -1) and when it locked; X last frame. */
  hold: number; locked: number; lockedAt: number; prevX: boolean;
  /** The forced U-turn at the arena's edge: frames left of it (his controls off), the way it swings. */
  uturn: number; uturnDir: number;
  /** The boost used up: none till its meter's full again (Star Fox's). */
  spent: boolean;
  piper: Said | null; piperAt: number; quipAt: number; wallAt: number; tauntAt: number; fwAt: number;
  win: { t: number; step: 'talk' | 'go'; open: number; said: boolean };
  zoom: { t: number; cx: number; cz: number; yaw: number };
  deathLast: number; fallY: number; fallRot: number;
}
const fightOf = (state: GameState) => fantasyState<Fight>(state, 'broom', () => ({
  phase: 'off', t: 0, x: 0, z: 0, alt: 500, yaw: 0, yawRate: 0, valt: 0, speed: 0, boost: 1, bank: 0, pitch: 0,
  fireCool: 0, fired: 99, inv: 0, shake: 0, fade: 0, tips: 0, flash: 0, hy: HORIZON,
  flyers: [], shots: [], parts: [], pops: [], prevY: false, lock: -1,
  hold: 0, locked: -1, lockedAt: 0, prevX: false, uturn: 0, uturnDir: 1, spent: false,
  piper: null, piperAt: -999, quipAt: -999, wallAt: -999, tauntAt: -999, fwAt: 0,
  win: { t: 0, step: 'talk', open: 0, said: false }, zoom: { t: 0, cx: 0, cz: 0, yaw: 0 },
  deathLast: -1, fallY: 0, fallRot: 0,
}));
export const inFight = (state: GameState) => fightOf(state).phase !== 'off';

const rnd = Math.random;
/** Playing on a Nintendo pad (a Pro Controller, Joy-Con): the broom's boost and brake swap (the user's). */
export const switchPad = () => { if (inputDevice() !== 'pad') return false; const fam = padFamily(); return fam === 'switch' || fam === 'joycon-l' || fam === 'joycon-r'; };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const angDiff = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

/** Flying (units a frame): his cruise and boost, his turn and climb; the wand bolt's speed and life. */
const CRUISE = 22, BOOST = 40, BRAKE = 11, TURN = 0.04, CLIMB = 10, BOLT_V = 64, BOLT_LIFE = 60, FIRE_EVERY = 8;
/** The lock-on: held this long it's charging (a tap's just the laser), this long more to lock; the homing shot. */
const HOLD_T = 12, LOCK_T = 26, HOME_V = 46, HOME_DMG = 5;
/** The forced U-turn at the arena's edge (the user's, Star Fox's all-range mode): frames, his controls off. */
const UTURN_T = 64;
/** Damage to him (before M2's x0.65), and theirs to each other. */
const DMG: Record<Atk | 'ram' | 'tower', number> = { bolt: 8, burst: 6, snipe: 13, shaker: 10, dumbbell: 12, turkey: 10, ram: 18, tower: 12 };
const FOE: Record<Atk | 'ram', number> = { bolt: 2, burst: 1, snipe: 4, shaker: 3, dumbbell: 3, turkey: 3, ram: 5 };
const SRC_OF: Record<Atk, string> = { bolt: SRC.bolt, burst: SRC.bolt, snipe: SRC.snipe, shaker: SRC.shaker, dumbbell: SRC.dumbbell, turkey: SRC.turkey };
const AIM_T: Partial<Record<Atk, number>> = { bolt: 26, burst: 18, snipe: 52 };
const TELL = 34, RAM_T = 70;

// ---------------------------------------------------------------------------------------------------------------
// Starting and ending

const holdHim = (state: GameState, on: boolean) => {
  const p = state.player;
  p.hidden = on; p.carried = on; p.noSpecials = on; p.vel.x = 0; p.vel.y = 0;
  if (on) p.shootCooldown = Math.max(p.shootCooldown, 3);
  if (!on) p.inCutscene = false;
};

/** Into the deathmatch (off the runway, or back at its checkpoint): the dead stay dead. */
export const startFight = (state: GameState) => {
  const f = fightOf(state), k = keptOf();
  if (state.checkpoint >= 51) k.late = true;
  f.phase = 'fly'; f.t = 0;
  f.x = 0; f.z = -3700; f.alt = 520; f.yaw = 0; f.yawRate = 0; f.valt = 0; f.speed = CRUISE; f.boost = 1; f.bank = 0; f.pitch = 0;
  f.inv = 90; f.fade = 1; f.shake = 0; f.flash = 0; f.fireCool = 20; f.hy = HORIZON;
  f.shots = []; f.parts = []; f.pops = []; f.lock = -1; f.piper = null;
  f.hold = 0; f.locked = -1; f.prevX = false; f.uturn = 0; f.spent = false;
  f.win = { t: 0, step: 'talk', open: 0, said: false };
  clearRiders();
  const defs = rosterOf(state), first = defs.filter(d => !d.late).length;
  f.flyers = defs.map((d, i): Flyer => {
    const dead = k.dead.has(d.id);
    const n = d.late ? i - first : i, cnt = d.late ? defs.length - first : first;
    const pos = d.late
      ? { x: Math.sin(n * 2.1 + 1) * 2600, z: Math.cos(n * 2.1 + 1) * 2600, yaw: n * 2.1 + 1 + Math.PI }
      : { x: (n - (cnt - 1) / 2) * 420, z: -2900 + (n % 2) * 220, yaw: 0 };
    return {
      d, i, x: pos.x, z: pos.z, alt: 460 + (n % 3) * 160, yaw: pos.yaw, yawRate: 0, speed: d.speed, valt: 0, bank: 0, face: 1,
      hp: d.hp, mode: 'fly', t: 0, cool: 110 + n * 40, shots: 0,
      target: -1, retarget: 30 + n * 20, aggro: 0, aggroOn: -1, side: n % 2 ? 1 : -1, far: 0, ramYaw: 0, ramValt: 0,
      hit: 0, said: null, alive: !dead, in: !d.late || k.late, gone: dead, fall: null,
    };
  });
  holdHim(state, true);
  state.player.inCutscene = false;
  if (state.checkpoint < 50) state.checkpoint = 50;
  f.tips = k.tips ? 0 : 600; k.tips = true;
  setUi({ noSwitch: true, broomHud: true, broomBoost: 1, broomTips: f.tips > 0 });
  if (!k.said) {
    k.said = true;
    piperSays(f, pickFreshLine(PIPER_START), () => meatheadSays(state, pickLine(byPants(state, MH_START)), true));
  } else if (rnd() < 0.4) setTimeout(() => meatheadSays(state, pickLine(byPants(state, MH_AGAIN)), false), 700);
};

/** Piper over the castle's horns (queued: never over anybody). */
const piperSays = (f: Fight, line: string | null, then?: () => void) => {
  if (!line) { then?.(); return; }
  f.piperAt = Date.now();
  speak(PIPER_PA_VOICE, line, s => { f.piper = s; }, true, then);
};

/** Done: out of the mode and on to the bedroom (through the window: the shatter over it; skipped: straight there). */
const finish = (state: GameState, shards: HTMLCanvasElement | null) => {
  const f = fightOf(state), p = state.player;
  f.phase = 'off';
  state.stageMemo[BROOM_MEMO] = '1';
  holdHim(state, false);
  setUi({ noSwitch: false, broomHud: false, broomTips: false });
  teleport(state, DOORS.bedroom.start.x, DOORS.bedroom.start.y);
  p.facing = 1;
  // (in through the glass: bits of it all round him on the floor)
  for (let i = 0; i < 26; i++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (rnd() - 0.6) * 60, y: p.pos.y + rnd() * p.height }, vel: { x: (rnd() - 0.3) * 6, y: -2 - rnd() * 5 }, life: 40 + rnd() * 30, color: rnd() < 0.5 ? '#E0F2FE' : '#F9A8D4', size: 2 + (rnd() < 0.3 ? 1 : 0) });
  if (shards) { startShatter(shards); p.inCutscene = true; }
};

// ---------------------------------------------------------------------------------------------------------------
// Targets

const tg = { x: 0, z: 0, alt: 0, vx: 0, vz: 0, valt: 0, yaw: 0 };
const targetOf = (f: Fight, j: number) => {
  if (j < 0) { tg.x = f.x; tg.z = f.z; tg.alt = f.alt; tg.yaw = f.yaw; tg.vx = Math.sin(f.yaw) * f.speed; tg.vz = Math.cos(f.yaw) * f.speed; tg.valt = f.valt; }
  else { const o = f.flyers[j]; tg.x = o.x; tg.z = o.z; tg.alt = o.alt; tg.yaw = o.yaw; tg.vx = Math.sin(o.yaw) * o.speed; tg.vz = Math.cos(o.yaw) * o.speed; tg.valt = o.valt; }
  return tg;
};
const live = (f: Fight, j: number) => (j < 0 ? f.phase === 'fly' : !!f.flyers[j] && f.flyers[j].alive && f.flyers[j].in);
const pickTarget = (f: Fight, fl: Flyer) => {
  fl.retarget = 100 + Math.floor(rnd() * 80);
  if (fl.aggro > 0 && live(f, fl.aggroOn)) { fl.target = fl.aggroOn; return; }
  let near = -1, best = 1e9;
  for (const o of f.flyers) {
    if (o === fl || !o.alive || !o.in) continue;
    const d = Math.hypot(o.x - fl.x, o.z - fl.z);
    if (d < best) { best = d; near = o.i; }
  }
  const dHim = Math.hypot(f.x - fl.x, f.z - fl.z);
  if (f.phase !== 'fly') { fl.target = near; return; }
  if (fl.d.style === 'hunt') fl.target = near >= 0 && best < 4200 && !(dHim < 1300 && rnd() < 0.35) ? near : -1;
  else fl.target = near >= 0 && best < 2400 && rnd() < 0.3 ? near : -1;
};

// ---------------------------------------------------------------------------------------------------------------
// Hits and deaths

const blood = (f: Fight, x: number, z: number, alt: number, n: number, mud = false) => {
  for (let i = 0; i < n; i++) {
    if (f.parts.length > 420) f.parts.shift();
    f.parts.push({ x, z, alt, vx: (rnd() - 0.5) * 10, vz: (rnd() - 0.5) * 10, valt: 2 + rnd() * 8, g: 0.45, life: 26 + rnd() * 24, col: mud ? (rnd() < 0.5 ? '#5C4424' : '#7A5A34') : rnd() < 0.7 ? '#B91C1C' : '#7F1D1D', size: 7 + rnd() * 8 });
  }
};
const sparks = (f: Fight, x: number, z: number, alt: number, cols: string[], n: number) => {
  for (let i = 0; i < n; i++) f.parts.push({ x, z, alt, vx: (rnd() - 0.5) * 14, vz: (rnd() - 0.5) * 14, valt: (rnd() - 0.3) * 12, g: 0.2, life: 14 + rnd() * 10, col: cols[i % cols.length], size: 5 });
};
/** A firework over the grounds (Piper's: every kill, and now and then). */
const firework = (f: Fight, x: number, z: number, alt: number) => {
  const cols = [['#F472B6', '#FFE4F2'], ['#FACC15', '#FFF7D0'], ['#60A5FA', '#E0F2FE'], ['#A78BFA', '#F3E8FF']][Math.floor(rnd() * 4)];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2, b = (rnd() - 0.5) * Math.PI, v = 14 + rnd() * 4;
    f.parts.push({ x, z, alt, vx: Math.cos(a) * Math.cos(b) * v, vz: Math.sin(a) * Math.cos(b) * v, valt: Math.sin(b) * v, g: 0.12, life: 50 + rnd() * 20, col: cols[i % 2], size: 14 });
  }
  playSound('boom', 0.15, 8);
};
const pop = (f: Fight, text: string, col = '#FDE68A') => { f.pops.push({ text, t: 0, col }); if (f.pops.length > 3) f.pops.shift(); };

const hitFlyer = (state: GameState, f: Fight, fl: Flyer, n: number, by: number) => {
  if (!fl.alive) return;
  fl.hp -= n; fl.hit = 6;
  if (by !== fl.i) { fl.aggroOn = by; fl.aggro = 300; if (fl.target !== by && rnd() < 0.6) { fl.target = by; fl.retarget = 160; } }
  blood(f, fl.x, fl.z, fl.alt + 40, by < 0 ? 4 : 6);
  if (by < 0) playSound('gunhit', 0.35, 4);
  // (a rough one: he's knocked out of his line)
  if (fl.mode === 'aim' || fl.mode === 'wind') { if (rnd() < 0.25) { fl.mode = 'fly'; fl.cool = 40; } }
  if (fl.hp <= 0) killFlyer(state, f, fl, by);
};

const killFlyer = (state: GameState, f: Fight, fl: Flyer, by: number) => {
  fl.alive = false; fl.mode = 'fly';
  // (near a tower or the castle, under its top: he spirals into its wall; else down onto the lawn, or the moat)
  let wall: Solid | null = null, best = 750;
  for (const s of SOLIDS) { const d = Math.hypot(s.x - fl.x, s.z - fl.z) - radiusAt(s, fl.alt); if (radiusAt(s, fl.alt) > 0 && d < best) { best = d; wall = s; } }
  fl.fall = { t: 0, by, wall, splat: false, spin: rnd() < 0.5 ? -1 : 1, kind: 'ground' };
  keptOf().dead.set(fl.d.id, { x: fl.x, z: fl.z, kind: 'ground', smear: null });
  playSound('screams', 0.8, rnd() * 4); playSound('fart', 0.8, -2);
  speak(fl.d.look.voice, pickLine(DIE[fl.d.id]), s => { fl.said = s; }, false);
  firework(f, (rnd() - 0.5) * 1400, (rnd() - 0.5) * 1400, 2100 + rnd() * 500);
  const now = Date.now();
  if (by < 0) {
    if (now - f.piperAt > 7000 && rnd() < 0.6) piperSays(f, pickFreshLine(PIPER_KILL));
    else if (now - f.quipAt > 6000 && rnd() < 0.6) { f.quipAt = now; meatheadSays(state, pickLine(byPants(state, MH_KILL)), true); }
  } else if (now - f.piperAt > 7000 && rnd() < 0.5) piperSays(f, pickFreshLine(PIPER_INFIGHT), () => { if (rnd() < 0.5) meatheadSays(state, pickLine(byPants(state, MH_INFIGHT)), true); });
  // (two left in her sky: him and one)
  const k = keptOf();
  if (!k.last && k.late && f.flyers.filter(o => o.alive && o.in).length === 1) { k.last = true; piperSays(f, pickFreshLine(PIPER_LAST), () => meatheadSays(state, pickLine(byPants(state, MH_LAST)), true)); }
};

/** Down he goes: spinning, screaming, shitting; into the wall he was by, or the lawn (or the moat's mud). */
const tickFall = (f: Fight, fl: Flyer) => {
  const F = fl.fall!;
  F.t++;
  fl.yaw += 0.22 * F.spin;
  if (F.t % 3 === 0) f.parts.push({ x: fl.x, z: fl.z, alt: fl.alt + 20, vx: 0, vz: 0, valt: -2, g: 0.3, life: 40, col: rnd() < 0.5 ? '#5C3A16' : '#7A5222', size: 9 });
  if (F.t % 5 === 0) f.parts.push({ x: fl.x, z: fl.z, alt: fl.alt + 50, vx: 0, vz: 0, valt: 1.5, g: -0.02, life: 30, col: '#6B6B78', size: 16 });
  if (F.wall && !F.splat) {
    const s = F.wall, dx = s.x - fl.x, dz = s.z - fl.z, d = Math.hypot(dx, dz) || 1;
    fl.x += (dx / d) * 26; fl.z += (dz / d) * 26; fl.alt = Math.max(60, fl.alt - 3);
    if (d < radiusAt(s, fl.alt) + 30 || F.t > 90) {
      F.splat = true; F.kind = 'wall';
      playSound('splat', 0.9); playSound('poopsplat', 0.7); playSound('crunch', 0.6);
      blood(f, fl.x, fl.z, fl.alt + 30, 22);
      const c = keptOf().dead.get(fl.d.id);
      if (c) c.smear = { x: fl.x, z: fl.z, alt: fl.alt + 40 };
    }
    return;
  }
  if (F.splat) {
    // (slid down the wall to its foot)
    fl.alt = Math.max(0, fl.alt - 7);
  } else {
    fl.speed *= 0.985; fl.valt = Math.max(-34, fl.valt - 0.6);
    fl.x += Math.sin(fl.yaw) * fl.speed * 0.6; fl.z += Math.cos(fl.yaw) * fl.speed * 0.6; fl.alt += fl.valt;
    // (something solid in the way on the way down: splat on it)
    const s = solidAt(fl.x, fl.z, fl.alt, 20);
    if (s) { F.wall = s; return; }
  }
  if (fl.alt <= 0) {
    fl.alt = 0; fl.gone = true;
    const r = Math.hypot(fl.x, fl.z);
    if (!F.splat) F.kind = r > MOAT[0] - 30 && r < MOAT[1] + 30 ? 'moat' : 'ground';
    if (!F.splat) { playSound('splat', 0.9); playSound('poopsplat', 0.7); blood(f, fl.x, fl.z, 20, 18, F.kind === 'moat'); }
    const c = keptOf().dead.get(fl.d.id);
    if (c) { c.x = fl.x; c.z = fl.z; c.kind = F.kind; }
    const pool = F.by >= 0 ? KILL_CALLS.infight : KILL_CALLS[F.kind];
    const call = pool[Math.floor(rnd() * pool.length)];
    pop(f, call, F.kind === 'moat' ? '#C8A060' : '#FCA5A5');
    announce(call, 0.7);
  }
};

/** Hurt him (if he can be): the hit, the shake, dead at zero. */
const hurtHim = (ctx: FrameContext, f: Fight, dmg: number, src: string) => {
  if (f.inv > 0 || f.phase !== 'fly') return false;
  hurtPlayer(ctx, dmg, src, { x: 0, y: 0 });
  f.inv = 50; f.shake = Math.max(f.shake, 10);
  blood(f, f.x, f.z, f.alt + 40, 8);
  if (ctx.state.player.health <= 0) die(ctx.state, f);
  return true;
};

/** Dead: his tumble off the broom plays out with the death scene's frames, then the death screen. */
const die = (state: GameState, f: Fight) => {
  if (f.phase === 'dead') return;
  f.phase = 'dead'; f.deathLast = -1; f.fallY = 0; f.fallRot = 0;
  state.deathScene = { t: 0, len: 100, voiced: false };
  setUi({ broomTips: false });
};

// ---------------------------------------------------------------------------------------------------------------
// Their flying

const launch = (f: Fight, fl: Flyer, k: Atk, spread = 0) => {
  const T = targetOf(f, fl.target);
  const ox = fl.x + Math.sin(fl.yaw) * 50, oz = fl.z + Math.cos(fl.yaw) * 50, oa = fl.alt + 24;
  const thrown = k === 'shaker' || k === 'dumbbell' || k === 'turkey';
  const v = k === 'snipe' ? 58 : thrown ? 26 : k === 'burst' ? 36 : 34, g = thrown ? 0.3 : 0;
  const d0 = Math.hypot(T.x - ox, T.z - oz, T.alt - oa), tt = d0 / v;
  const ax = T.x + T.vx * tt * 0.8, az = T.z + T.vz * tt * 0.8, aa = T.alt + 30 + T.valt * tt * 0.5;
  const hx = ax - ox, hz = az - oz, hd = Math.hypot(hx, hz) || 1;
  const t2 = hd / v, a = Math.atan2(hx, hz) + spread;
  f.shots.push({
    k: k === 'burst' ? 'bolt' : (k as Thing), x: ox, z: oz, alt: oa, vx: Math.sin(a) * v, vz: Math.cos(a) * v,
    valt: (aa - oa) / t2 + 0.5 * g * t2, g, life: Math.ceil(t2) + 40, owner: fl.i, dmg: DMG[k], foe: FOE[k], src: SRC_OF[k], rot: 0,
  });
  if (Math.hypot(fl.x - f.x, fl.z - f.z) < 2600) playSound(thrown ? 'whoosh' : k === 'snipe' ? 'egun' : 'spell', thrown ? 0.35 : 0.25, k === 'snipe' ? -4 : 6);
};

const updateFlyer = (ctx: FrameContext, f: Fight, fl: Flyer) => {
  const { state } = ctx, st = fl.d;
  fl.t++;
  if (fl.hit > 0) fl.hit--;
  if (fl.cool > 0) fl.cool--;
  if (fl.aggro > 0) fl.aggro--;
  if (--fl.retarget <= 0 || !live(f, fl.target)) pickTarget(f, fl);
  const dHim = Math.hypot(fl.x - f.x, fl.z - f.z);
  fl.far = dHim > 3400 ? fl.far + 1 : 0;
  // (out of his way too long: back at him, so nobody's ever lost off in a corner)
  if (fl.far > 420 && f.phase === 'fly') { fl.target = -1; fl.retarget = 360; }
  if (fl.t % 300 === 0) fl.side = -fl.side;
  const has = live(f, fl.target);
  const T = targetOf(f, has ? fl.target : -1);
  // (nobody to go for (his tumble, the end): circle the castle)
  if (!has) { const a = Math.atan2(fl.x, fl.z) + 0.6; T.x = Math.sin(a) * 2200; T.z = Math.cos(a) * 2200; T.alt = 900; T.vx = 0; T.vz = 0; }
  const dx = T.x - fl.x, dz = T.z - fl.z, dist = Math.hypot(dx, dz), dAlt = T.alt - fl.alt;
  const toT = Math.atan2(dx, dz), off = Math.abs(angDiff(toT, fl.yaw));
  let wantYaw = toT, wantAlt = T.alt, wantSpeed = st.speed, turn = st.turn;
  if (st.style === 'flank' || st.style === 'hunt') {
    const fx = Math.sin(T.yaw), fz = Math.cos(T.yaw), px = T.x - fx * 420 + fz * fl.side * 340, pz = T.z - fz * 420 - fx * fl.side * 340;
    if (dist > 650) wantYaw = Math.atan2(px - fl.x, pz - fl.z);
    wantAlt = T.alt + 40;
  } else if (st.style === 'snipe') {
    wantYaw = dist < 1300 ? toT + Math.PI * 0.75 * fl.side : dist > 2300 ? toT : toT + 1.2 * fl.side;
    wantAlt = T.alt + 220;
  }
  // ---- what he's at
  switch (fl.mode) {
    case 'tell':
      wantSpeed = 10; wantYaw = toT; wantAlt = T.alt;
      if (fl.t >= TELL) { fl.mode = 'ram'; fl.t = 0; fl.ramYaw = toT; fl.ramValt = clamp(dAlt / Math.max(1, dist / 40), -12, 12); playSound('whoosh', 0.5, -6); }
      break;
    case 'ram': {
      wantSpeed = 40; wantYaw = fl.ramYaw; turn = 0.008;
      const d3 = Math.hypot(dx, dz, dAlt);
      if (has && d3 < 110) {
        if (fl.target < 0) { if (hurtHim(ctx, f, DMG.ram, SRC.ram)) { f.yaw += (rnd() < 0.5 ? -1 : 1) * 0.5; f.valt = 8; playSound('slam', 0.8); } }
        else hitFlyer(state, f, f.flyers[fl.target], FOE.ram, fl.i);
        fl.mode = 'recover'; fl.t = 0; playSound('thud', 0.6);
      }
      if (fl.t >= RAM_T) { fl.mode = 'recover'; fl.t = 0; }
      break;
    }
    case 'recover':
      wantSpeed = st.speed + 4;
      if (fl.t >= 60) { fl.mode = 'fly'; fl.t = 0; fl.cool = 90; }
      break;
    case 'aim': {
      wantYaw = toT; wantSpeed = st.speed * 0.6;
      const at = AIM_T[st.atk] ?? 26;
      if (st.atk === 'burst') {
        if (fl.t >= at && (fl.t - at) % 6 === 0 && fl.shots > 0) { launch(f, fl, 'burst', (rnd() - 0.5) * 0.08); fl.shots--; }
        if (fl.shots <= 0) { fl.mode = 'fly'; fl.t = 0; fl.cool = 110 + Math.floor(rnd() * 40); }
      } else if (fl.t >= at) { if (has) launch(f, fl, st.atk); fl.mode = 'fly'; fl.t = 0; fl.cool = (st.atk === 'snipe' ? 150 : 80) + Math.floor(rnd() * 40); }
      break;
    }
    case 'wind':
      wantYaw = toT;
      if (fl.t >= 28) { if (has) launch(f, fl, st.atk); fl.mode = 'fly'; fl.t = 0; fl.cool = 90 + Math.floor(rnd() * 40); }
      break;
    case 'fly':
      if (fl.cool <= 0 && has && f.phase === 'fly' || (fl.cool <= 0 && has && fl.target >= 0)) {
        const thrown = st.atk === 'shaker' || st.atk === 'dumbbell' || st.atk === 'turkey';
        if (st.style === 'charge' && dist < 1400 && off < 0.4 && Math.abs(dAlt) < 500 && rnd() < 0.7) { fl.mode = 'tell'; fl.t = 0; playSound('whirl', 0.4, 4); }
        else if (thrown && dist < 1150 && off < 0.6) { fl.mode = 'wind'; fl.t = 0; }
        else if (!thrown && dist < (st.atk === 'snipe' ? 2800 : st.atk === 'burst' ? 1200 : 1500) && off < (st.atk === 'snipe' ? 0.3 : 0.35)) {
          fl.mode = 'aim'; fl.t = 0; fl.shots = st.atk === 'burst' ? 3 : 1;
          if (st.atk === 'snipe' && dHim < 3000) playSound('primed', 0.3, 6);
        }
      }
      break;
  }
  // ---- round anything solid ahead; back in from the wall
  for (const probe of [260, 560]) {
    const px = fl.x + Math.sin(fl.yaw) * probe, pz = fl.z + Math.cos(fl.yaw) * probe, s = solidAt(px, pz, fl.alt, 90);
    if (!s) continue;
    const side = Math.sign(angDiff(Math.atan2(s.x - fl.x, s.z - fl.z), fl.yaw)) || 1;
    if (fl.mode !== 'ram') wantYaw = fl.yaw - side * 1.4;
    if (probe === 260) wantAlt = Math.max(wantAlt, topOf(s) + 160);
    break;
  }
  const r = Math.hypot(fl.x, fl.z);
  if (r > WALL_R - 450) wantYaw = Math.atan2(-fl.x, -fl.z);
  // ---- steering, height, speed
  fl.yawRate = clamp(angDiff(wantYaw, fl.yaw) * 0.12, -turn, turn);
  fl.yaw += fl.yawRate; fl.bank = fl.yawRate / Math.max(0.001, st.turn);
  if (fl.mode === 'ram') fl.valt = fl.ramValt;
  else fl.valt += (clamp((wantAlt - fl.alt) * 0.04, -9, 9) - fl.valt) * 0.2;
  fl.alt = clamp(fl.alt + fl.valt, 80, MAX_ALT);
  fl.speed += (wantSpeed - fl.speed) * 0.08;
  fl.x += Math.sin(fl.yaw) * fl.speed; fl.z += Math.cos(fl.yaw) * fl.speed;
  // (inside something anyway: out of it)
  const s = solidAt(fl.x, fl.z, fl.alt, 40);
  if (s) { const ex = fl.x - s.x, ez = fl.z - s.z, e = Math.hypot(ex, ez) || 1, rr = radiusAt(s, fl.alt) + 45; fl.x = s.x + (ex / e) * rr; fl.z = s.z + (ez / e) * rr; }
  // ---- their trash talk (one at a time, now and then)
  const now = Date.now();
  if (now - f.tauntAt > 7000 && has && dist < 1500 && fl.mode === 'fly' && rnd() < 0.01) {
    f.tauntAt = now;
    const line = fl.target < 0 ? pickLine(byPants(state, TAUNT[st.id])) : pickLine(RIVAL[st.id]);
    speak(st.look.voice, line, x => { fl.said = x; }, false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The frame

/** The aim help: the live suitor nearest the middle ahead (within ~11 degrees across, any height), or -1. */
const lockOn = (f: Fight, cone = 0.2) => {
  let best = -1, bestA = cone;
  for (const o of f.flyers) {
    if (!o.alive || !o.in) continue;
    const dx = o.x - f.x, dz = o.z - f.z, d = Math.hypot(dx, dz);
    if (d > 3300 || d < 60) continue;
    const a = Math.abs(angDiff(Math.atan2(dx, dz), f.yaw));
    if (Math.abs(Math.atan2(o.alt - f.alt, d)) > 0.7) continue;
    if (a < bestA) { bestA = a; best = o.i; }
  }
  return best;
};

/** The broom's laser: a beam off its tip (`home` a suitor's index: the charged, locked-on homing shot). */
const fire = (f: Fight, home = -1) => {
  const ox = f.x + Math.sin(f.yaw) * 40, oz = f.z + Math.cos(f.yaw) * 40, oa = f.alt + 22;
  let vx = Math.sin(f.yaw), vz = Math.cos(f.yaw), va = f.pitch * 0.2;
  if (home >= 0) {
    f.shots.push({ k: 'homing', x: ox, z: oz, alt: oa, vx: vx * HOME_V, vz: vz * HOME_V, valt: va * HOME_V, g: 0, life: 150, owner: -1, dmg: 0, foe: HOME_DMG, src: '', rot: 0, home });
    f.fired = 0;
    playSound('egun', 0.5, -2); playSound('whoosh', 0.4, 4);
    return;
  }
  if (f.lock >= 0) {
    const o = f.flyers[f.lock], d = Math.hypot(o.x - ox, o.z - oz, o.alt + 40 - oa), t = d / BOLT_V;
    const ax = o.x + Math.sin(o.yaw) * o.speed * t, az = o.z + Math.cos(o.yaw) * o.speed * t, aa = o.alt + 40 + o.valt * t;
    const ex = ax - ox, ez = az - oz, ea = aa - oa, e = Math.hypot(ex, ez, ea) || 1;
    vx = ex / e; vz = ez / e; va = ea / e;
  } else { const n = Math.hypot(vx, vz, va); vx /= n; vz /= n; va /= n; }
  f.shots.push({ k: 'mybolt', x: ox, z: oz, alt: oa, vx: vx * BOLT_V + Math.sin(f.yaw) * f.speed, vz: vz * BOLT_V + Math.cos(f.yaw) * f.speed, valt: va * BOLT_V, g: 0, life: BOLT_LIFE, owner: -1, dmg: 0, foe: 1, src: '', rot: 0 });
  f.fired = 0;
  playSound('egun', 0.2, 9);
};

const updateShots = (ctx: FrameContext, f: Fight) => {
  const { state } = ctx;
  const out: Shot[] = [];
  for (const s of f.shots) {
    // (the homing shot: turning onto its suitor as it goes, while he's alive)
    if (s.home !== undefined && s.home >= 0) {
      const o = f.flyers[s.home];
      if (o && o.alive && o.in) {
        const ex = o.x - s.x, ez = o.z - s.z, ea = o.alt + 40 - s.alt, e = Math.hypot(ex, ez, ea) || 1, k = 0.16;
        s.vx += ((ex / e) * HOME_V - s.vx) * k; s.vz += ((ez / e) * HOME_V - s.vz) * k; s.valt += ((ea / e) * HOME_V - s.valt) * k;
      }
      if (f.t % 2 === 0) f.parts.push({ x: s.x, z: s.z, alt: s.alt, vx: 0, vz: 0, valt: 0, g: 0, life: 12, col: '#F472B6', size: 10 });
    }
    s.x += s.vx; s.z += s.vz; s.valt -= s.g; s.alt += s.valt; s.life--; s.rot += 0.3;
    if (s.life <= 0) continue;
    if (s.alt <= 0) { sparks(f, s.x, s.z, 4, ['#4C8A3A', '#8A6A48'], 4); continue; }
    if (solidAt(s.x, s.z, s.alt)) { sparks(f, s.x, s.z, s.alt, ['#FFFFFF', '#DCD2EC'], 6); if (s.owner < 0) playSound('clink', 0.15, 6); continue; }
    let gone = false;
    // (his: into a suitor)
    for (const o of f.flyers) {
      if (!o.alive || !o.in || o.i === s.owner) continue;
      if (Math.hypot(o.x - s.x, o.z - s.z, o.alt + 40 - s.alt) < 80) { hitFlyer(state, f, o, s.foe, s.owner); gone = true; break; }
    }
    if (gone) continue;
    // (theirs: into him)
    if (s.owner >= 0 && f.phase === 'fly' && Math.hypot(f.x - s.x, f.z - s.z, f.alt + 30 - s.alt) < 64) { if (hurtHim(ctx, f, s.dmg, s.src)) continue; }
    out.push(s);
  }
  f.shots = out;
};

export const updateFight = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, f = fightOf(state), p = state.player;
  if (f.phase === 'off' || f.phase === 'dead') return {} as Controls;
  holdHim(state, true);
  f.t++;
  if (f.fade > 0 && f.phase === 'fly') f.fade = Math.max(0, f.fade - 1 / 30);
  if (f.tips > 0) f.tips--;
  if (f.inv > 0) f.inv--;
  if (f.shake > 0) f.shake--;
  if (f.flash > 0) f.flash--;
  f.fired++;
  for (const q of f.pops) q.t++;
  f.pops = f.pops.filter(q => q.t < 80);
  const flying = f.phase === 'fly';
  setUi({ broomHud: flying, broomBoost: f.boost, broomTips: f.tips > 0 && flying });
  // ---- the toggle (Y / alternate fire, pressed)
  const Y = !!controls.secondary;
  if (flying && Y && !f.prevY) { inverted = !inverted; f.flash = 70; playSound('click', 0.6, inverted ? 4 : -4); playSound('twinkle', 0.3); }
  f.prevY = Y;
  // ---- flying
  // (the user's: up / down pitch, left / right turn; A (jump) boosts, B (the boost button) brakes: deliberate)
  let steer = 0, climb = 0, boosting = false, braking = false;
  if (flying && f.uturn > 0) {
    // (the forced U-turn at the edge: swung round and back in, his controls off a moment)
    f.uturn--;
    steer = f.uturnDir; climb = clamp((900 - f.alt) * 0.004, -0.5, 0.5);
  } else if (flying) {
    steer = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
    climb = (controls.up ? 1 : 0) - (controls.down ? 1 : 0);
    if (inverted) climb = -climb;
    if (f.spent && f.boost >= 0.99) f.spent = false;
    // (on a Nintendo pad the two swap (the user's: an exception to positional buttons): the jump spot brakes, the
    // boost spot boosts; keyboard and the other pads as above)
    const nin = switchPad();
    const boostBtn = nin ? !!(controls.special || controls.charge) : !!controls.jump, brakeBtn = nin ? !!controls.jump : !!(controls.special || controls.charge);
    boosting = boostBtn && !f.spent && f.boost > 0;
    braking = !boosting && brakeBtn;
  } else if (f.phase === 'win') {
    // (the autopilot: round to the castle, level with her window)
    const want = Math.atan2(-f.x, -f.z);
    steer = clamp(angDiff(want, f.yaw) * 3, -1, 1);
    climb = clamp((WINDOW.alt - CAM_UP - f.alt) * 0.02, -1, 1);
  }
  f.yawRate += (steer * TURN * (f.uturn > 0 ? 1.6 : 1) - f.yawRate) * 0.18;
  f.yaw += f.yawRate;
  f.valt += (climb * CLIMB - f.valt) * 0.15;
  f.alt += f.valt;
  if (f.alt < MIN_ALT) { f.alt = MIN_ALT; f.valt = Math.max(0, f.valt); }
  if (f.alt > MAX_ALT) { f.alt = MAX_ALT; f.valt = Math.min(0, f.valt); }
  f.speed += ((f.phase === 'win' ? 16 : boosting ? BOOST : braking ? BRAKE : CRUISE) - f.speed) * (boosting ? 0.12 : 0.07);
  if (boosting) { f.boost = Math.max(0, f.boost - 1 / 75); if (f.boost <= 0) f.spent = true; if (f.t % 20 === 0) playSound('whoosh', 0.35, -4); }
  else f.boost = Math.min(1, f.boost + 1 / 220);
  f.bank = f.yawRate / TURN; f.pitch = f.valt / CLIMB;
  if (f.phase !== 'zoom') { f.x += Math.sin(f.yaw) * f.speed; f.z += Math.cos(f.yaw) * f.speed; }
  // (skimming the lawn: petals and grass kicked up)
  if (flying && f.alt < 70 && f.t % 3 === 0) f.parts.push({ x: f.x + (rnd() - 0.5) * 60, z: f.z, alt: 6, vx: (rnd() - 0.5) * 6, vz: 0, valt: 4 + rnd() * 4, g: 0.35, life: 20, col: rnd() < 0.6 ? '#6EAA4A' : '#F9A8D4', size: 6 });
  if (flying) {
    // ---- the park's magic wall: it swings him back round
    const r = Math.hypot(f.x, f.z);
    // (the user's: the edge forces a turnaround, Star Fox's all-range way: swung round back in, no damage)
    const out = angDiff(Math.atan2(f.x, f.z), f.yaw);
    if (r > WALL_R - 60 && f.uturn <= 0 && Math.abs(out) < Math.PI / 2) {
      f.uturn = UTURN_T; f.uturnDir = out > 0 ? -1 : 1;
      f.hold = 0; f.locked = -1;
      playSound('taser', 0.4, 6); playSound('whoosh', 0.5, -6);
      pop(f, 'TURNING BACK', '#F9A8D4');
      const now = Date.now();
      if (now - f.quipAt > 45000) {
        f.quipAt = now;
        if (rnd() < 0.5) piperSays(f, pickFreshLine(PIPER_WALL)); else meatheadSays(state, pickLine(byPants(state, MH_WALL)), true);
      }
    }
    if (r > WALL_R - 300 && f.t % 3 === 0) sparks(f, f.x + Math.sin(f.yaw) * 160, f.z + Math.cos(f.yaw) * 160, f.alt + 40, ['#F472B6', '#FFE4F2', '#FFFFFF'], 3);
    if (r > WALL_R + 220) { f.x *= (WALL_R + 220) / r; f.z *= (WALL_R + 220) / r; }
    // ---- the castle and its towers: solid (bounced off, hurt); the balloons: a boing
    const s = solidAt(f.x, f.z, f.alt + 30, 40);
    if (s) {
      const ex = f.x - s.x, ez = f.z - s.z, e = Math.hypot(ex, ez) || 1, rr = radiusAt(s, f.alt + 30) + 90;
      f.x = s.x + (ex / e) * rr; f.z = s.z + (ez / e) * rr;
      f.yaw = Math.atan2(ex, ez); f.yawRate = 0; f.speed *= 0.4; f.shake = Math.max(f.shake, 12);
      playSound('thud', 0.8, -4); sparks(f, f.x, f.z, f.alt + 40, ['#DCD2EC', '#9484B4', '#FFFFFF'], 10);
      hurtHim(ctx, f, DMG.tower, SRC.tower);
    }
    for (const b of BALLOONS) {
      const q = balloonAt(b, state.frame), ex = f.x - q.x, ez = f.z - q.z, ea = f.alt + 30 - (q.alt + 60), e = Math.hypot(ex, ez, ea);
      if (e < 200) { const k = 210 / (e || 1); f.x = q.x + ex * k; f.z = q.z + ez * k; f.valt = ea >= 0 ? 9 : -9; f.speed *= 0.6; playSound('boing', 0.6, 2); }
    }
    // ---- the broom's laser (the user's: X fires it; tap: the laser; HOLD: the lock-on (Star Fox 64's): the reticle
    // sweeps and grows, snaps red onto the suitor ahead with a tone; let go locked: a homing shot, a big one; let go
    // without a lock: just the laser)
    const X = !!controls.shoot && f.uturn <= 0;
    f.lock = lockOn(f);
    if (f.fireCool > 0) f.fireCool--;
    if (X && !f.prevX && f.fireCool <= 0) { fire(f); f.fireCool = FIRE_EVERY; }
    if (X) {
      f.hold++;
      if (f.hold >= HOLD_T + LOCK_T && (f.locked < 0 || !live(f, f.locked))) {
        const t = lockOn(f, 0.32);
        if (t >= 0) { f.locked = t; f.lockedAt = f.t; playSound('beep', 0.6, 10); playSound('ding', 0.4, 12); }
      }
    } else if (f.prevX) {
      if (f.hold >= HOLD_T && f.locked >= 0 && live(f, f.locked)) fire(f, f.locked);
      else if (f.hold >= HOLD_T && f.fireCool <= 0) { fire(f); f.fireCool = FIRE_EVERY; }
      f.hold = 0; f.locked = -1;
    }
    f.prevX = X;
  }
  // ---- the suitors, the shots, what's in the air
  for (const fl of f.flyers) {
    if (!fl.in) continue;
    if (fl.fall && !fl.gone) { tickFall(f, fl); continue; }
    if (fl.alive) updateFlyer(ctx, f, fl);
  }
  updateShots(ctx, f);
  for (const q of f.parts) { q.x += q.vx; q.z += q.vz; q.valt -= q.g; q.alt += q.valt; q.vx *= 0.97; q.vz *= 0.97; q.life--; }
  f.parts = f.parts.filter(q => q.life > 0 && q.alt > -10);
  // (Piper's fireworks, now and then, beyond the castle)
  if (state.frame >= f.fwAt) { f.fwAt = state.frame + 200 + Math.floor(rnd() * 160); const a = rnd() * Math.PI * 2, r = 1800 + rnd() * 2400; firework(f, Math.sin(a) * r, Math.cos(a) * r, 2000 + rnd() * 700); }
  // ---- the late entries: over the wall when the first lot's down to one (or it's gone on a while)
  const k = keptOf();
  if (flying && !k.late && (f.flyers.filter(o => !o.d.late && (o.alive || (o.fall && !o.gone))).length <= 1 || f.t > 4200)) {
    k.late = true;
    let n = 0;
    for (const o of f.flyers) {
      if (!o.d.late || !o.alive) continue;
      const a = f.yaw + (n - 1) * 0.55;
      o.in = true; o.x = Math.sin(a) * (WALL_R + 300); o.z = Math.cos(a) * (WALL_R + 300); o.yaw = a + Math.PI; o.alt = 700 + n * 220; o.cool = 150; o.target = -1; o.retarget = 200;
      n++;
    }
    if (state.checkpoint < 51) state.checkpoint = 51;
    pop(f, 'LATE ENTRIES!', '#F9A8D4');
    piperSays(f, pickFreshLine(PIPER_LATE), () => meatheadSays(state, pickLine(byPants(state, MH_LATE)), true));
  }
  // ---- all dead (down and still): her window
  if (flying && k.late && f.flyers.every(o => !o.alive && o.gone)) startWin(state, f);
  if (f.phase === 'win') tickWin(state, f);
  if (f.phase === 'zoom') tickZoom(state, f);
  void p;
  return {} as Controls;
};

// ---------------------------------------------------------------------------------------------------------------
// The end: the barrier wilts, the window, the zoom, the glass

const startWin = (state: GameState, f: Fight) => {
  f.phase = 'win'; f.win = { t: 0, step: 'talk', open: 0, said: false };
  state.player.inCutscene = true;
  f.shots = [];
  setUi({ broomHud: false, broomTips: false });
  piperSays(f, pickFreshLine(PIPER_WIN), () => {
    if (isNude(state)) { playSound('boing', 0.9, -6); f.win.said = true; }
    meatheadSays(state, pickLine(byPants(state, MH_WIN)), true, () => { f.win.step = 'go'; });
  });
};
const tickWin = (state: GameState, f: Fight) => {
  const w = f.win;
  w.t++;
  state.player.inCutscene = true;
  if (w.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); finish(state, null); return; } }
  // (the rose barrier on her window wilting away: petals off it)
  if (w.t > 20) w.open = Math.min(1, w.open + 1 / 90);
  if (w.open < 1 && w.t % 2 === 0) {
    const a = Math.atan2(f.x, f.z), side = WINDOW.side;
    f.parts.push({ x: Math.cos(a) * side + (rnd() - 0.5) * 60, z: -Math.sin(a) * side + (rnd() - 0.5) * 60, alt: WINDOW.alt + (rnd() - 0.3) * 80, vx: (rnd() - 0.5) * 3, vz: (rnd() - 0.5) * 3, valt: -1 - rnd() * 2, g: 0.05, life: 90, col: rnd() < 0.5 ? '#F472B6' : '#DC2626', size: 10 });
  }
  if (isNude(state) && w.t % 9 === 0 && w.t < 200) f.parts.push({ x: f.x, z: f.z, alt: f.alt + 90, vx: (rnd() - 0.5) * 2, vz: (rnd() - 0.5) * 2, valt: 2.4, g: -0.01, life: 40, col: rnd() < 0.5 ? '#F472B6' : '#FB7185', size: 10 });
  if ((w.step === 'go' && w.open >= 1 && w.t > 120) || w.t > 900) startZoom(f);
};

const ZOOM_LEN = 80;
/** The cut: the eye out along his bearing from the castle, level with her window, square on it; then the rapid zoom
 *  (the focal length shooting up) with him flying off into it, smaller and smaller. */
const startZoom = (f: Fight) => {
  f.phase = 'zoom';
  const b = Math.atan2(f.x, f.z), D = 2400;
  const yaw = b + Math.PI, rx = Math.cos(yaw), rz = -Math.sin(yaw);
  f.zoom = { t: 0, cx: Math.sin(b) * D + rx * WINDOW.side, cz: Math.cos(b) * D + rz * WINDOW.side, yaw };
  f.yaw = yaw; f.bank = 0; f.pitch = 0;
  playSound('whoosh', 0.9, -8); playSound('twinkle', 0.6, 4);
};
const tickZoom = (state: GameState, f: Fight) => {
  const z = f.zoom;
  z.t++;
  state.player.inCutscene = true;
  if (z.t > 6) offerSkip();
  if (takeSkip()) { silenceAll(); finish(state, null); return; }
  if (z.t >= ZOOM_LEN) {
    // (the smash: what's on the view now, broken into shards over the next scene)
    playSound('glass', 1); playSound('crash', 0.8); playSound('glass', 0.8, -4);
    const cap = document.createElement('canvas'); cap.width = W; cap.height = H;
    if (low) cap.getContext('2d')!.drawImage(low, 0, 0);
    finish(state, cap);
  }
};
const zoomK = (t: number) => { const u = clamp(t / ZOOM_LEN, 0, 1); return u * u * u; };

// ---------------------------------------------------------------------------------------------------------------
// The shatter (after the smash, over the bedroom: index.ts ticks and draws it)

interface Shard { pts: number[]; cx: number; cy: number; vx: number; vy: number; vr: number; ring: number }
let shatter: { t: number; img: HTMLCanvasElement; shards: Shard[]; ix: number; iy: number } | null = null;
const SHATTER_LEN = 78, CRACK = 9;
const startShatter = (img: HTMLCanvasElement) => {
  const ix = CANVAS_WIDTH / 2, iy = CANVAS_HEIGHT / 2, N = 14, RINGS = [0, 36, 92, 170, 280, 430, 640, 960];
  const ang = Array.from({ length: N }, (_, k) => (k / N) * Math.PI * 2 + (hash(k * 3.7) - 0.5) * 0.3);
  const P = (j: number, k: number): [number, number] => {
    if (j === 0) return [ix, iy];
    const kk = ((k % N) + N) % N, r = RINGS[j] * (0.85 + hash(j * 7.1 + kk * 1.3) * 0.3);
    return [ix + Math.cos(ang[kk]) * r, iy + Math.sin(ang[kk]) * r];
  };
  const shards: Shard[] = [];
  for (let j = 0; j < RINGS.length - 1; j++) for (let k = 0; k < N; k++) {
    const a = P(j, k), b = P(j, k + 1), c = P(j + 1, k + 1), d = P(j + 1, k);
    const pts = j === 0 ? [...a, ...c, ...d] : [...a, ...b, ...c, ...d];
    let cx = 0, cy = 0; for (let i = 0; i < pts.length; i += 2) { cx += pts[i]; cy += pts[i + 1]; }
    cx /= pts.length / 2; cy /= pts.length / 2;
    const dx = cx - ix, dy = cy - iy, dd = Math.hypot(dx, dy) || 1, v = 1.6 + j * 1.3 + hash(j * 5 + k) * 1.5;
    shards.push({ pts, cx, cy, vx: (dx / dd) * v, vy: (dy / dd) * v - 1.2, vr: (hash(j * 11 + k * 3) - 0.5) * 0.22, ring: j });
  }
  shatter = { t: 0, img, shards, ix, iy };
};
/** (index.ts, every frame) The shatter playing: him held (a cutscene) till it's done. */
export const tickShatter = (state: GameState) => {
  if (!shatter) return false;
  shatter.t++;
  if (shatter.t >= SHATTER_LEN) { shatter = null; state.player.inCutscene = false; return false; }
  state.player.inCutscene = true;
  return true;
};
/** (index.ts, over everything) The glass: cracks spreading from the window's middle, then the shards flying apart (out
 *  and toward us, spinning, falling, catching the light), the next scene showing through the gaps. */
export const drawShatter = (c: CanvasRenderingContext2D) => {
  const S = shatter;
  if (!S) return;
  const t = S.t;
  c.save();
  c.imageSmoothingEnabled = false;
  if (t < CRACK) {
    c.drawImage(S.img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const k = (t + 1) / CRACK;
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.globalAlpha = 0.9;
    for (const sh of S.shards) {
      if (sh.ring > k * 7) continue;
      c.beginPath(); c.moveTo(sh.pts[0], sh.pts[1]); for (let i = 2; i < sh.pts.length; i += 2) c.lineTo(sh.pts[i], sh.pts[i + 1]); c.closePath(); c.stroke();
    }
    c.globalAlpha = (1 - k) * 0.7; c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.restore();
    return;
  }
  const tt = t - CRACK, fade = t > SHATTER_LEN - 18 ? (SHATTER_LEN - t) / 18 : 1;
  for (const sh of S.shards) {
    const ox = sh.vx * tt, oy = sh.vy * tt + 0.22 * tt * tt, rot = sh.vr * tt, sc = 1 + tt * (0.01 + sh.ring * 0.002);
    c.save();
    c.globalAlpha = fade;
    c.translate(sh.cx + ox, sh.cy + oy); c.rotate(rot); c.scale(sc, sc); c.translate(-sh.cx, -sh.cy);
    c.beginPath(); c.moveTo(sh.pts[0], sh.pts[1]); for (let i = 2; i < sh.pts.length; i += 2) c.lineTo(sh.pts[i], sh.pts[i + 1]); c.closePath();
    c.save(); c.clip(); c.drawImage(S.img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // (the glass's own tint and a glint across it as it turns)
    c.fillStyle = 'rgba(224,242,254,0.12)'; c.fillRect(sh.cx - 300, sh.cy - 300, 600, 600);
    c.restore();
    c.strokeStyle = (tt + sh.ring) % 6 < 2 ? '#FFFFFF' : '#BAE6FD'; c.lineWidth = 2; c.stroke();
    c.restore();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the view on its own 400x300 canvas, blown up over the screen (rolled with his bank), then him, the words
// and the HUD bits at full size

let low: HTMLCanvasElement | null = null;
const P: Proj = { ok: false, sx: 0, sy: 0, s: 0, d: 0 };
const Q: Proj = { ok: false, sx: 0, sy: 0, s: 0, d: 0 };
interface Ent { d: number; draw: () => void }
const ents: Ent[] = [];
interface Tag { x: number; y: number; fl: Flyer; s: number }
const tags: Tag[] = [];
const ROLL = 0.09, ZOOMIN = 1.08;

/** A point on the view to where it lands on the screen (the roll and the overscan the view's blown up with). */
const scr = { x: 0, y: 0 };
let rollA = 0;
const toScreen = (lx: number, ly: number) => {
  const dx = (lx - W / 2) * 2 * ZOOMIN, dy = (ly - H / 2) * 2 * ZOOMIN, ca = Math.cos(rollA), sa = Math.sin(rollA);
  scr.x = CANVAS_WIDTH / 2 + dx * ca - dy * sa; scr.y = CANVAS_HEIGHT / 2 + dx * sa + dy * ca;
  return scr;
};

const shadow = (g: CanvasRenderingContext2D, x: number, z: number, r: number, k = 0.32) => {
  project(x, z, 0, Q);
  if (!Q.ok || Q.sy < view.hy) return;
  const rx = Math.max(1, r * Q.s), ry = Math.max(0.6, rx * Math.min(1, view.calt / Q.d));
  g.globalAlpha = k; g.fillStyle = '#0A0612'; g.beginPath(); g.ellipse(Q.sx, Q.sy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
};

export const drawFight = (c0: CanvasRenderingContext2D, state: GameState) => {
  const f = fightOf(state);
  if (f.phase === 'off') return;
  const fr = state.frame;
  // (dead: his tumble plays out with the death scene's frames)
  if (f.phase === 'dead') {
    const t = state.deathScene?.t ?? 999;
    while (f.deathLast < t && f.deathLast < 140) { f.deathLast++; f.fallY += 1 + f.deathLast * 0.16; f.fallRot += 0.16; }
  }
  if (!low) { low = document.createElement('canvas'); low.width = W; low.height = H; }
  const g = low.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  // ---- the eye
  const zooming = f.phase === 'zoom';
  const zk = zooming ? zoomK(f.zoom.t) : 0;
  f.hy += (HORIZON + (zooming ? 0 : f.pitch * 46) - f.hy) * 0.15;
  if (zooming) {
    // (the eye square on her window: the focal length shooting up, toward it a little)
    const yaw = f.zoom.yaw, push = zk * 700;
    setView(f.zoom.cx + Math.sin(yaw) * push, f.zoom.cz + Math.cos(yaw) * push, WINDOW.alt, yaw, H / 2, FOCAL * (1 + zk * 46));
  } else setView(f.x - Math.sin(f.yaw) * CAM_BACK, f.z - Math.cos(f.yaw) * CAM_BACK, f.alt + CAM_UP, f.yaw, f.hy, FOCAL);
  const camYaw = zooming ? f.zoom.yaw : f.yaw;
  drawSky(g, camYaw);
  drawGround(g);
  const k = keptOf();
  // ---- on the ground: the shadows, the dead (and the smears up the walls they hit)
  if (!zooming) {
    shadow(g, f.x, f.z, 46, 0.4 - Math.min(0.25, f.alt / 8000));
    for (const fl of f.flyers) if (fl.in && !fl.gone) shadow(g, fl.x, fl.z, 50);
    for (const b of BALLOONS) { const q = balloonAt(b, fr); shadow(g, q.x, q.z, 160, 0.2); }
  }
  ents.length = 0; tags.length = 0;
  for (const fl of f.flyers) {
    const c = k.dead.get(fl.d.id);
    if (!c || !fl.gone) continue;
    project(c.x, c.z, 0, P);
    if (!seen(P, 120 * P.s, 60 * P.s, 60 * P.s)) continue;
    const d = P.d, sx = P.sx, sy = P.sy, s = P.s;
    ents.push({ d: d + 5, draw: () => drawCorpse(g, riderCanvas(fl.d.id, fl.d.look, fl.d.tiara, 1, false), sx, sy, s, view.calt / Math.max(1, d), c.kind === 'moat') });
    if (c.smear) {
      project(c.smear.x, c.smear.z, c.smear.alt, Q);
      if (Q.ok) { const top = Q.sy, x = Q.sx, s2 = Q.s; project(c.smear.x, c.smear.z, 0, Q); const bot = Q.sy; ents.push({ d: d - 2, draw: () => { g.fillStyle = '#8A1414'; g.fillRect(Math.round(x - 14 * s2), Math.round(top - 20 * s2), Math.max(1, Math.round(28 * s2)), Math.max(1, Math.round(bot - top + 20 * s2))); g.fillStyle = '#B91C1C'; g.fillRect(Math.round(x - 8 * s2), Math.round(top - 26 * s2), Math.max(1, Math.round(16 * s2)), Math.max(1, Math.round(30 * s2))); } }); }
    }
  }
  // ---- the billboards
  project(0, 0, 0, P);
  if (P.ok) {
    const sc = P.s * (CASTLE_U / CASTLE_K), cv = castleCanvas(), cx = P.sx, cy = P.sy, s = P.s;
    if (cx + 360 * sc > 0 && cx - 360 * sc < W) ents.push({ d: P.d, draw: () => { g.drawImage(cv, Math.round(cx - CASTLE_CX * sc), Math.round(cy - CASTLE_CY * sc), Math.round(cv.width * sc), Math.round(cv.height * sc)); drawWindow(g, f, cx, cy, s, fr); } });
  }
  const tcv = towerCanvas();
  for (const t of TOWERS) {
    project(t.x, t.z, 0, P);
    const sc = P.s * TOWER_PX;
    if (!seen(P, 32 * sc, 330 * sc)) continue;
    const x = P.sx, y = P.sy;
    ents.push({ d: P.d, draw: () => g.drawImage(tcv, Math.round(x - 32 * sc), Math.round(y - 328 * sc), Math.max(1, Math.round(64 * sc)), Math.max(1, Math.round(330 * sc))) });
  }
  for (const t of TREES) {
    project(t.x, t.z, 0, P);
    const sc = P.s * 4 * (t.h / 420);
    if (!seen(P, 32 * sc, 140 * sc) || P.d > 7000) continue;
    const x = P.sx, y = P.sy, cv = treeCanvas(t.k);
    ents.push({ d: P.d, draw: () => g.drawImage(cv, Math.round(x - 32 * sc), Math.round(y - 138 * sc), Math.max(1, Math.round(64 * sc)), Math.max(1, Math.round(140 * sc))) });
  }
  const fcv = flagCanvas((fr >> 4) & 1);
  for (const fl of FLAGS) {
    project(fl.x, fl.z, 0, P);
    const sc = P.s * 4;
    if (!seen(P, 40 * sc, 170 * sc)) continue;
    const x = P.sx, y = P.sy;
    ents.push({ d: P.d, draw: () => g.drawImage(fcv, Math.round(x - 6 * sc), Math.round(y - 168 * sc), Math.max(1, Math.round(40 * sc)), Math.max(1, Math.round(170 * sc))) });
  }
  const bcv = balloonCanvas();
  for (const b of BALLOONS) {
    const q = balloonAt(b, fr);
    project(q.x, q.z, q.alt, P);
    const sc = P.s * 4;
    if (!seen(P, 40 * sc, 46 * sc, 74 * sc)) continue;
    const x = P.sx, y = P.sy;
    ents.push({ d: P.d, draw: () => g.drawImage(bcv, Math.round(x - 40 * sc), Math.round(y - 46 * sc), Math.max(1, Math.round(80 * sc)), Math.max(1, Math.round(120 * sc))) });
  }
  // ---- the suitors
  if (!zooming) for (const fl of f.flyers) {
    if (!fl.in || fl.gone) continue;
    project(fl.x, fl.z, fl.alt, P);
    if (!seen(P, RIDER_W * P.s, RIDER_H * P.s, RIDER_H * P.s)) continue;
    // (which way he's facing on the view: his motion across it, held till it's clearly the other way)
    const lat = Math.sin(fl.yaw) * view.rx + Math.cos(fl.yaw) * view.rz;
    if (lat > 0.2) fl.face = 1; else if (lat < -0.2) fl.face = -1;
    const x = P.sx, y = P.sy, s = P.s, d = P.d;
    ents.push({ d, draw: () => drawRider(g, fl, x, y, s, fr) });
    if (fl.alive) tags.push({ x, y: y - (RIDER_AY - 6) * s, fl, s });
  }
  // ---- the shots and what's in the air
  for (const q of f.shots) {
    project(q.x, q.z, q.alt, P);
    if (!seen(P, 20, 20, 20)) continue;
    const x = P.sx, y = P.sy, s = P.s, rot = q.rot, kk = q.k;
    if (kk === 'mybolt') {
      // (the laser: a beam, from where it is back along where it's been)
      project(q.x - q.vx * 2.5, q.z - q.vz * 2.5, q.alt - q.valt * 2.5, Q);
      const tx = Q.ok ? Q.sx : x, ty = Q.ok ? Q.sy : y, w = Math.max(1.5, 9 * s);
      ents.push({ d: P.d, draw: () => { g.lineCap = 'round'; g.strokeStyle = '#F472B6'; g.lineWidth = w * 1.8; g.beginPath(); g.moveTo(tx, ty); g.lineTo(x, y); g.stroke(); g.strokeStyle = '#FFE4F2'; g.lineWidth = Math.max(1, w * 0.7); g.stroke(); } });
      continue;
    }
    ents.push({ d: P.d, draw: () => drawThing(g, kk, x, y, s, rot, fr) });
  }
  for (const q of f.parts) {
    project(q.x, q.z, q.alt, P);
    if (!P.ok || P.sx < -10 || P.sx > W + 10 || P.sy < -10 || P.sy > H + 10) continue;
    const sz = Math.max(1, Math.round(q.size * P.s)), x = P.sx, y = P.sy, col = q.col;
    ents.push({ d: P.d, draw: () => { g.fillStyle = col; g.fillRect(Math.round(x - sz / 2), Math.round(y - sz / 2), sz, sz); } });
  }
  ents.sort((a, b) => b.d - a.d);
  for (const e of ents) e.draw();
  // ---- blown up onto the screen, rolled with his bank, shaken
  rollA = zooming ? 0 : -f.bank * ROLL;
  const sh = f.shake > 0 ? f.shake * 0.7 : 0;
  c0.save();
  c0.imageSmoothingEnabled = false;
  c0.fillStyle = '#000000'; c0.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  c0.translate(CANVAS_WIDTH / 2 + (rnd() - 0.5) * sh, CANVAS_HEIGHT / 2 + (rnd() - 0.5) * sh); c0.rotate(rollA); c0.scale(ZOOMIN, ZOOMIN);
  c0.drawImage(low, -CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT);
  c0.restore();
  // ---- him (not rolled: he leans himself), at full size
  const p = state.player, nude = isNude(state), shat = isShat(state);
  const meY = f.hy + (CAM_UP * FOCAL) / CAM_BACK + 8;
  let meX = W / 2 + f.bank * 5, meS = 0.84;
  c0.save(); c0.scale(2, 2); c0.imageSmoothingEnabled = false;
  if (f.phase === 'dead') drawMeatheadFall(c0, meX, meY - 30 + f.fallY, meS, f.fallRot, nude);
  else if (zooming) {
    // (him off into her window: up the middle and away, smaller and smaller)
    const u = zk; meX = W / 2; meS = 0.84 * (1 - u) + 0.04;
    if (u < 0.97) drawMeatheadBroom(c0, meX, meY + (H / 2 - meY) * Math.min(1, u * 1.4), meS, { bank: 0, pitch: 0, nude, shat, boost: true, fire: 99, blink: false, f: fr });
  } else drawMeatheadBroom(c0, meX, meY, meS, { bank: f.bank, pitch: f.pitch, nude, shat, boost: f.speed > CRUISE + 4, fire: f.fired, blink: f.inv > 0 && f.inv < 50 && f.phase === 'fly', f: fr, charge: f.hold >= HOLD_T ? Math.min(1, (f.hold - HOLD_T) / LOCK_T) : 0, locked: f.locked >= 0 });
  c0.restore();
  drawOver(c0, state, f, meX * 2, (meY - 92) * 2);
  void p;
};

/** Her window on the castle (it faces him, as the castle does): sealed by a rose barrier (thorns, roses, a pink
 *  shimmer) till they're all dead; it wilts; then lit and open. */
const drawWindow = (g: CanvasRenderingContext2D, f: Fight, cx: number, cy: number, s: number, fr: number) => {
  const wx = cx + WINDOW.side * s, wy = cy - WINDOW.alt * s, ww = WINDOW.w * s, wh = WINDOW.h * s;
  const open = f.phase === 'win' || f.phase === 'zoom' ? f.win.open : 0;
  if (ww < 1) return;
  // (the glow behind it, breathing; brighter once it's open)
  g.globalAlpha = 0.25 + 0.15 * Math.sin(fr * 0.06) + open * 0.3; g.fillStyle = '#FF8AC8';
  g.beginPath(); g.ellipse(wx, wy, ww * 1.4, wh * 1.0, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  if (ww > 10) {
    // (close up: the stained glass drawn big: the heart, the leading)
    g.fillStyle = '#1A1028'; g.fillRect(Math.round(wx - ww / 2 - 1), Math.round(wy - wh / 2 - 1), Math.round(ww + 2), Math.round(wh + 2));
    g.fillStyle = '#F49AC8'; g.fillRect(Math.round(wx - ww / 2), Math.round(wy - wh / 2), Math.round(ww), Math.round(wh));
    g.fillStyle = '#FFD0E8'; g.fillRect(Math.round(wx - ww / 2), Math.round(wy - wh / 2), Math.round(ww / 3), Math.round(wh));
    g.fillStyle = '#D8306E'; g.beginPath(); g.arc(wx - ww * 0.14, wy - wh * 0.06, ww * 0.16, 0, Math.PI * 2); g.arc(wx + ww * 0.14, wy - wh * 0.06, ww * 0.16, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(wx - ww * 0.3, wy - wh * 0.02); g.lineTo(wx, wy + wh * 0.22); g.lineTo(wx + ww * 0.3, wy - wh * 0.02); g.closePath(); g.fill();
    g.fillStyle = '#1A1028'; g.fillRect(Math.round(wx - ww / 2), Math.round(wy + wh * 0.3), Math.round(ww), Math.max(1, Math.round(ww * 0.05)));
    g.fillRect(Math.round(wx - Math.max(0.5, ww * 0.025)), Math.round(wy - wh / 2), Math.max(1, Math.round(ww * 0.05)), Math.round(wh));
  }
  if (open >= 1) return;
  // (the rose barrier: a ring of thorny vine and roses round it, a shimmer across it)
  const k = 1 - open, R = Math.max(ww, wh) * 0.7;
  g.globalAlpha = k * (0.35 + 0.15 * Math.sin(fr * 0.1)); g.fillStyle = '#F472B6';
  g.fillRect(Math.round(wx - ww / 2), Math.round(wy - wh / 2), Math.round(ww), Math.round(wh)); g.globalAlpha = 1;
  g.strokeStyle = '#14532D'; g.lineWidth = Math.max(1, ww * 0.08 * k);
  g.beginPath(); g.ellipse(wx, wy, R, R * 1.15, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(wx - ww / 2, wy - wh / 2); g.lineTo(wx + ww / 2, wy + wh / 2); g.moveTo(wx + ww / 2, wy - wh / 2); g.lineTo(wx - ww / 2, wy + wh / 2); g.stroke();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + fr * 0.004, rr = Math.max(1, ww * 0.16 * k);
    const x = wx + Math.cos(a) * R, y = wy + Math.sin(a) * R * 1.15;
    g.fillStyle = '#7F1D1D'; g.beginPath(); g.arc(x, y, rr * 1.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = i % 2 ? '#DC2626' : '#F472B6'; g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill();
  }
};

/** A suitor on his broom (or going down: spinning, tipped over); his hit flash; a tell's glint; what's in his hand. */
const drawRider = (g: CanvasRenderingContext2D, fl: Flyer, x: number, y: number, s: number, fr: number) => {
  const cv = riderCanvas(fl.d.id, fl.d.look, fl.d.tiara, fl.face, fl.hit > 0 && (fl.hit & 2) > 0);
  g.save(); g.translate(x, y);
  if (fl.fall) g.rotate(fl.fall.t * 0.3 * fl.fall.spin);
  else g.rotate(clamp(fl.bank, -1, 1) * 0.25 * fl.face + (fl.mode === 'ram' ? 0.25 * fl.face : 0));
  g.drawImage(cv, -RIDER_AX * s, -RIDER_AY * s, RIDER_W * s, RIDER_H * s);
  g.restore();
  if (fl.fall) return;
  const head = y - 100 * s, hand = x + fl.face * 34 * s;
  // (the tells: a ram's glint and the broom dipped; a wand charging; a throw held up)
  if (fl.mode === 'tell' && (fr >> 2) % 2) { g.fillStyle = '#FFFFFF'; const r = Math.max(2, 10 * s); g.fillRect(Math.round(x + fl.face * 40 * s - r), Math.round(y - 1), Math.round(r * 2), 2); g.fillRect(Math.round(x + fl.face * 40 * s - 1), Math.round(y - r), 2, Math.round(r * 2)); }
  if (fl.mode === 'aim') {
    const at = AIM_T[fl.d.atk] ?? 26, k = Math.min(1, fl.t / at), r = Math.max(1.5, (fl.d.atk === 'snipe' ? 14 : 8) * s * (0.4 + k));
    g.globalAlpha = 0.5 + 0.5 * ((fr >> 1) % 2); g.fillStyle = fl.d.atk === 'snipe' ? '#22D3EE' : '#4ADE80';
    g.beginPath(); g.arc(hand, y - 50 * s, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  }
  if (fl.mode === 'wind') drawThing(g, fl.d.atk as Thing, x - fl.face * 6 * s, head - 10 * s, s, Math.sin(fr * 0.4) * 0.6, fr);
};

// ---------------------------------------------------------------------------------------------------------------
// Over the view: the words, the markers, the HUD bits

const RING8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]] as const;
const fontPx = (px: number) => `${px}px "Press Start 2P"`;
const inked = (c: CanvasRenderingContext2D, text: string, x: number, y: number, col: string, px: number, align: CanvasTextAlign = 'center') => {
  c.font = fontPx(px); c.textAlign = align;
  c.fillStyle = '#140C1E'; for (const [dx, dy] of RING8) c.fillText(text, x + dx, y + dy);
  c.fillStyle = col; c.fillText(text, x, y);
};

const drawOver = (c: CanvasRenderingContext2D, state: GameState, f: Fight, meX: number, meTop: number) => {
  const p = state.player, cut = p.inCutscene || f.phase !== 'fly', fr = state.frame;
  // ---- the suitors: names and health over them; a lock bracket on his aim; arrows in from the edges to the rest
  if (!cut) {
    for (const tgg of tags) {
      const fl = tgg.fl, q = toScreen(tgg.x, tgg.y), near = tgg.s > 0.07;
      if (q.x < -20 || q.x > CANVAS_WIDTH + 20 || q.y < -20 || q.y > CANVAS_HEIGHT + 20) continue;
      const col = fl.d.look.main;
      if (near) {
        const bw = 40, k = Math.max(0, fl.hp / fl.d.hp);
        c.fillStyle = '#140C1E'; c.fillRect(Math.round(q.x - bw / 2 - 1), Math.round(q.y - 9), bw + 2, 6);
        c.fillStyle = '#3A1A2A'; c.fillRect(Math.round(q.x - bw / 2), Math.round(q.y - 8), bw, 4);
        c.fillStyle = k > 0.5 ? '#4ADE80' : k > 0.25 ? '#FACC15' : '#EF4444'; c.fillRect(Math.round(q.x - bw / 2), Math.round(q.y - 8), Math.round(bw * k), 4);
        inked(c, fl.d.look.name, q.x, q.y - 13, '#FFFFFF', 6);
      } else {
        // (far off: a diamond in his color over him, so he's findable)
        c.fillStyle = '#140C1E'; c.beginPath(); c.moveTo(q.x, q.y - 12); c.lineTo(q.x + 6, q.y - 6); c.lineTo(q.x, q.y); c.lineTo(q.x - 6, q.y - 6); c.closePath(); c.fill();
        c.fillStyle = col; c.beginPath(); c.moveTo(q.x, q.y - 10); c.lineTo(q.x + 4, q.y - 6); c.lineTo(q.x, q.y - 2); c.lineTo(q.x - 4, q.y - 6); c.closePath(); c.fill();
      }
      if (fl.i === f.lock) {
        const r = Math.max(14, 60 * tgg.s * 2), cy = q.y + 40 * tgg.s * 2;
        c.strokeStyle = (fr >> 2) % 2 ? '#F472B6' : '#FFFFFF'; c.lineWidth = 2;
        for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.moveTo(q.x + sx * r, cy + sy * r - sy * 6); c.lineTo(q.x + sx * r, cy + sy * r); c.lineTo(q.x + sx * r - sx * 6, cy + sy * r); c.stroke(); }
      }
    }
    for (const fl of f.flyers) {
      if (!fl.alive || !fl.in) continue;
      project(fl.x, fl.z, fl.alt + 40, P);
      const on = P.ok && P.sx > 4 && P.sx < W - 4 && P.sy > 4 && P.sy < H - 4;
      if (on) continue;
      // (an arrow at the screen's edge toward him, in his color, his initial on it)
      const rel = Math.atan2((fl.x - f.x) * view.rx + (fl.z - f.z) * view.rz, (fl.x - f.x) * view.fx + (fl.z - f.z) * view.fz);
      let dx = Math.sin(rel), dy = -Math.cos(rel) * 0.5 + clamp((f.alt - fl.alt) / 1600, -0.6, 0.6);
      if (P.ok) { dx = P.sx - W / 2; dy = P.sy - H / 2; }
      const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
      const ex = CANVAS_WIDTH / 2 - 40, ey = CANVAS_HEIGHT / 2 - 40, t = Math.min(ex / Math.max(0.001, Math.abs(dx)), ey / Math.max(0.001, Math.abs(dy)));
      let ax = CANVAS_WIDTH / 2 + dx * t, ay = CANVAS_HEIGHT / 2 + dy * t;
      ay = Math.max(ay, 116);
      if (ax < 330 && ay < 120) ax = 330;
      const a = Math.atan2(dy, dx), pulse = (fr >> 3) % 2 ? 1 : 0.85;
      c.save(); c.translate(ax, ay); c.rotate(a); c.scale(pulse, pulse);
      c.fillStyle = '#140C1E'; c.beginPath(); c.moveTo(16, 0); c.lineTo(-8, -12); c.lineTo(-8, 12); c.closePath(); c.fill();
      c.fillStyle = fl.d.look.main; c.beginPath(); c.moveTo(12, 0); c.lineTo(-6, -9); c.lineTo(-6, 9); c.closePath(); c.fill();
      c.restore();
      inked(c, fl.d.look.name[0], ax - dx * 18, ay - dy * 18 + 4, '#FFFFFF', 8);
    }
  }
  // ---- what's said: theirs over them (or by their arrow), his over him, Piper's up top
  for (const fl of f.flyers) {
    if (!fl.said || !fl.in) continue;
    project(fl.x, fl.z, fl.alt + 110, P);
    const q = P.ok ? toScreen(P.sx, P.sy) : { x: CANVAS_WIDTH / 2, y: 420 };
    saidOver(c, fl.said.text, clamp(q.x, 140, CANVAS_WIDTH - 140), clamp(q.y, 150, CANVAS_HEIGHT - 60), '#FDE68A', 220);
  }
  if (state.playerLastVulgarity && state.playerVulgarityTimer > 0 && f.phase !== 'dead') saidOver(c, state.playerLastVulgarity, meX, clamp(meTop, 150, 470), '#FFFFFF', 300);
  if (f.piper) saidOver(c, f.piper.text, CANVAS_WIDTH / 2, 136, '#F9A8D4', 360);
  if (!cut) {
    // ---- his aim: a little star ahead
    project(f.x + Math.sin(f.yaw) * 1400, f.z + Math.cos(f.yaw) * 1400, f.alt + 22 + f.pitch * 280, P);
    if (P.ok) {
      const q = toScreen(P.sx, P.sy), ax = q.x, ay = q.y;
      c.strokeStyle = f.lock >= 0 ? '#F472B6' : 'rgba(255,255,255,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax - 9, ay); c.lineTo(ax - 3, ay); c.moveTo(ax + 3, ay); c.lineTo(ax + 9, ay); c.moveTo(ax, ay - 9); c.lineTo(ax, ay - 3); c.moveTo(ax, ay + 3); c.lineTo(ax, ay + 9); c.stroke();
      // (X held: the lock-on reticle charging, sweeping round and growing, till it locks)
      if (f.hold >= HOLD_T && f.locked < 0) {
        const k = Math.min(1, (f.hold - HOLD_T) / LOCK_T), r = 14 + k * 30, a = f.hold * 0.12;
        c.save(); c.translate(ax, ay); c.rotate(a); c.strokeStyle = k >= 1 ? '#FDE68A' : '#FFFFFF'; c.lineWidth = 2;
        for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(r, -6); c.lineTo(r, 6); c.moveTo(r, 0); c.lineTo(r - 6, 0); c.stroke(); }
        c.restore();
      }
    }
    // (locked: the reticle snapped onto him, red, spinning tight)
    if (f.locked >= 0 && live(f, f.locked)) {
      const o = f.flyers[f.locked];
      project(o.x, o.z, o.alt + 40, P);
      if (P.ok) {
        const q = toScreen(P.sx, P.sy), snap = Math.max(0, 1 - (f.t - f.lockedAt) / 8), r = Math.max(16, 70 * P.s * 2) + snap * 40;
        c.save(); c.translate(q.x, q.y); c.rotate(fr * 0.08); c.strokeStyle = (fr >> 2) % 2 ? '#EF4444' : '#FCA5A5'; c.lineWidth = 3;
        c.strokeRect(-r, -r, r * 2, r * 2); c.restore();
        inked(c, 'LOCKED', q.x, q.y - r - 8, '#EF4444', 8);
      }
    }
    drawSuitorBar(c, f);
    drawRadar(c, f, fr);
    drawPlate(c, f);
  }
  // (the pops: GROUNDED!, LATE ENTRIES!...)
  for (const q of f.pops) {
    if (q.t > 60 && (q.t >> 1) % 2) continue;
    const kk = Math.min(1, q.t / 8);
    inked(c, q.text, CANVAS_WIDTH / 2, 230 - q.t * 0.6, q.col, Math.round(12 + kk * 6) & ~1);
  }
  // (the toggle's flash)
  if (f.flash > 0 && !cut && (f.flash > 20 || (f.flash >> 2) % 2)) inked(c, inverted ? 'INVERTED: ON' : 'INVERTED: OFF', CANVAS_WIDTH / 2, 300, inverted ? '#F472B6' : '#FFFFFF', 16);
  if (f.fade > 0) { c.fillStyle = `rgba(0,0,0,${f.fade})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if ((f.phase === 'win' && f.win.t > SKIP_AFTER) || f.phase === 'zoom') drawSkipPrompt(c, CANVAS_WIDTH);
};

/** The suitors, along the top band (clear of the HUD): a cell each in his color, his name, his health; dead: crossed
 *  out. The late entries only once they're in. */
const drawSuitorBar = (c: CanvasRenderingContext2D, f: Fight) => {
  const band = topBand(), shown = f.flyers.filter(o => o.in || o.gone);
  if (!shown.length) return;
  const gap = 4, cw = Math.min(70, Math.floor((band.x2 - band.x1 - gap * (shown.length - 1)) / shown.length)), bw = cw * shown.length + gap * (shown.length - 1);
  let x = Math.round(band.mid - bw / 2);
  const y = 14;
  const left = shown.filter(o => o.alive).length;
  inked(c, `SUITORS: ${left} LEFT`, band.mid, y + 44, '#FDE68A', 8);
  for (const o of shown) {
    c.fillStyle = '#140C1E'; c.fillRect(x, y, cw, 24);
    c.fillStyle = o.alive ? o.d.look.main : '#2A2230'; c.fillRect(x + 2, y + 2, cw - 4, 12);
    const k = o.alive ? Math.max(0, o.hp / o.d.hp) : 0;
    c.fillStyle = '#3A1A2A'; c.fillRect(x + 2, y + 16, cw - 4, 5);
    c.fillStyle = k > 0.5 ? '#4ADE80' : k > 0.25 ? '#FACC15' : '#EF4444'; c.fillRect(x + 2, y + 16, Math.round((cw - 4) * k), 5);
    const nm = o.d.look.name.length * 6 > cw - 4 ? o.d.look.name.slice(0, Math.floor((cw - 4) / 6)) : o.d.look.name;
    c.font = fontPx(6); c.textAlign = 'center'; c.fillStyle = o.alive ? '#FFFFFF' : '#6A6070'; c.fillText(nm, x + cw / 2, y + 11);
    if (!o.alive) { c.strokeStyle = '#EF4444'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 3, y + 3); c.lineTo(x + cw - 3, y + 21); c.moveTo(x + cw - 3, y + 3); c.lineTo(x + 3, y + 21); c.stroke(); }
    x += cw + gap;
  }
};

/** The radar (bottom right, his heading up): the park's wall, the castle, the towers, the suitors (up or down
 *  arrows when they're well above or below him); the altimeter beside it. */
const drawRadar = (c: CanvasRenderingContext2D, f: Fight, fr: number) => {
  const cx = CANVAS_WIDTH - 82, cy = CANVAS_HEIGHT - 84, R = 64, k = R / 5600;
  const rel = (x: number, z: number) => { const dx = x - f.x, dz = z - f.z; return { x: cx + (dx * view.rx + dz * view.rz) * k, y: cy - (dx * view.fx + dz * view.fz) * k }; };
  c.save();
  c.fillStyle = 'rgba(20,12,30,0.78)'; c.beginPath(); c.arc(cx, cy, R + 4, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#F9A8D4'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R + 4, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
  const o = rel(0, 0);
  c.strokeStyle = 'rgba(244,114,182,0.8)'; c.lineWidth = 1.5; c.beginPath(); c.arc(o.x, o.y, WALL_R * k, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#DCD2EC'; c.beginPath(); c.arc(o.x, o.y, 5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F472B6'; c.fillRect(Math.round(o.x - 1), Math.round(o.y - 1), 3, 3);
  for (const t of TOWERS) { const q = rel(t.x, t.z); c.fillStyle = '#9484B4'; c.fillRect(Math.round(q.x - 2), Math.round(q.y - 2), 4, 4); }
  for (const fl of f.flyers) {
    if (!fl.alive || !fl.in) continue;
    const q = rel(fl.x, fl.z), dAlt = fl.alt - f.alt;
    c.fillStyle = '#140C1E'; c.fillRect(Math.round(q.x - 4), Math.round(q.y - 4), 8, 8);
    c.fillStyle = fl.d.look.main; c.fillRect(Math.round(q.x - 3), Math.round(q.y - 3), 6, 6);
    if (Math.abs(dAlt) > 300) { c.fillStyle = '#FFFFFF'; c.beginPath(); const s = dAlt > 0 ? -1 : 1; c.moveTo(q.x - 3, q.y + s * 5); c.lineTo(q.x + 3, q.y + s * 5); c.lineTo(q.x, q.y + s * 9); c.closePath(); c.fill(); }
  }
  c.restore();
  // (him in the middle, heading up)
  c.fillStyle = (fr >> 3) % 2 ? '#FFFFFF' : '#FDE68A'; c.beginPath(); c.moveTo(cx, cy - 7); c.lineTo(cx + 5, cy + 5); c.lineTo(cx, cy + 2); c.lineTo(cx - 5, cy + 5); c.closePath(); c.fill();
  // (the altimeter: the lawn to the sky's limit, him on it, the suitors' heights as ticks)
  const ax = cx - R - 22, ay0 = cy + R, ay1 = cy - R, at = (a: number) => ay0 + (ay1 - ay0) * clamp(a / MAX_ALT, 0, 1);
  c.fillStyle = 'rgba(20,12,30,0.78)'; c.fillRect(ax - 5, ay1 - 4, 10, ay0 - ay1 + 8);
  c.fillStyle = '#4C8A3A'; c.fillRect(ax - 3, ay0 - 4, 6, 4);
  c.fillStyle = '#F472B6'; c.fillRect(ax - 3, Math.round(at(WINDOW.alt)) - 1, 6, 2);
  for (const fl of f.flyers) if (fl.alive && fl.in) { c.fillStyle = fl.d.look.main; c.fillRect(ax - 3, Math.round(at(fl.alt)) - 1, 6, 2); }
  c.fillStyle = '#FFFFFF'; c.beginPath(); const yy = at(f.alt); c.moveTo(ax + 6, yy); c.lineTo(ax + 12, yy - 4); c.lineTo(ax + 12, yy + 4); c.closePath(); c.fill();
};

/** Bottom left: what up does right now (and whether it's inverted). */
const drawPlate = (c: CanvasRenderingContext2D, f: Fight) => {
  const x = 16, y = CANVAS_HEIGHT - 52;
  c.fillStyle = 'rgba(20,12,30,0.78)'; c.fillRect(x, y, 150, 36);
  c.strokeStyle = inverted ? '#F472B6' : '#6A6070'; c.lineWidth = 2; c.strokeRect(x, y, 150, 36);
  inked(c, inverted ? 'INVERTED' : 'NORMAL', x + 75, y + 14, inverted ? '#F472B6' : '#FFFFFF', 8);
  inked(c, inverted ? 'UP: DIVE' : 'UP: CLIMB', x + 75, y + 28, '#C8C0D8', 6);
  void f;
};

