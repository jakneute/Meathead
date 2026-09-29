// Chuco, Dale's distributor: the mid-boss up in the warehouse office, and the
// first of the three hitmen Dale's sent after Meathead. A wiry, twitchy maniac
// with a shaved head, gold teeth and a gold-plated pistol, out of his mind on his
// own product.
//
// He comes at you slowly, twitching, and if he gets his hands on you he holds you
// by the collar and punches you in the face a few times before he throws you
// across the room. Charging into him (or sliding, or any of it) just hands him
// the collar. Bullets barely register (he doesn't even notice he's been shot).
// Keep your distance too long and he pulls the gold pistol.
//
// The way to hurt him is with his own stash. There are four hidden around his
// office, each one got at by one of the weapons Meathead's sure to have by now:
//   the desk (the flamethrower burns it down: it was in a drawer)
//   the filing cabinet (the tidal wave washes it over: it was in a file)
//   the ceiling fan (a boulder heaved up at it brings it down: taped on top)
//   the snitch hanging in the coat closet (shotgun ice freezes him, and he
//     shatters: he'd swallowed it)
// The moment any of it's out in the open he's on it: snorts it, loses his mind,
// and runs flat out headfirst into the nearest wall. Massive damage, to him. Three
// of those does it (two, if you've really pumped him full of lead as well).
// Meathead taunts him about his things as the fight goes on (the hint's in the
// taunt), and if that doesn't take, spells out which weapon goes where.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { playSound, playGlassShatterSound } from '../../platform/audio';
import { midBossProjectileDamage, junkieShare } from '../../combat/midBoss';
import { KIND_STATS } from '../../enemies/kinds';
import { MAX_AMMO } from '../../../constants';
import { COURSE, CP } from './course';
import { Talk, queueLines, replaceLines, ScriptLine } from './script';

export const JUNKIE_HP = KIND_STATS.junkie.hp;
const W = KIND_STATS.junkie.w, H = KIND_STATS.junkie.h;

export type PropName = 'desk' | 'cabinet' | 'fan' | 'closet';
export const PROPS: PropName[] = ['desk', 'cabinet', 'fan', 'closet'];
/** How much of each of his things a hit from the right weapon takes: the flames a frame's worth, a wave a frame's
 * worth of it passing over, a boulder, a shard of ice. (Burn the desk for five seconds, three waves or so on the
 * cabinet, eight boulders for the fan, eight or nine blasts of ice on the snitch: more than he's likely carrying, so
 * Chuco's pockets make up the rest: see pocketAmmo.) */
export const PROP_TAKES: Record<PropName, number> = { desk: 1 / 300, cabinet: 1 / 80, fan: 0.125, closet: 0.025 };
/** The weapon that gets at each stash. */
export const PROP_WEAPON: Record<PropName, WeaponType> = { desk: 'FLAMETHROWER', cabinet: 'TSUNAMI', fan: 'BOULDER', closet: 'SHOTGUN' };

export interface PropState {
  /** Standing; going (burning, washed over, falling, frozen and shattering); gone (the stash is out). */
  state: 'intact' | 'going' | 'gone';
  t: number;
  /** Which way it went (the tidal wave's direction). */
  dir: number;
  /** Where it ended up (the fan on the floor, the cabinet washed along). */
  x: number;
  y: number;
  /** How much it's got left in it (1 whole, 0 it goes): only the right weapon takes any off. */
  hp: number;
  /** When it last took some (it flashes). */
  hitAt: number;
}
export interface Stash { x: number; y: number; vy: number; landed: boolean; taken: boolean; from: PropName }
/** (headbutt: killed by his own head, into the wall) */
export interface JunkieCorpse { x: number; y: number; facing: 1 | -1; weapon: WeaponType; t0: number; headbutt?: 1 | -1 }

export interface JunkieFight {
  phase: 'waiting' | 'intro' | 'fight' | 'dead' | 'leaving' | 'done';
  t: number;
  man: Enemy | null;
  walls: Block[];
  props: Record<PropName, PropState>;
  stashes: Stash[];
  corpse: JunkieCorpse | null;
  hpFlash: number;
  /** Holding Meathead by the collar: frames since, punches landed. */
  grab: { t: number; punches: number } | null;
  /** He's thrown you: your speed across the room, and for how long. */
  thrown: { vx: number; t: number } | null;
  /** Taunts and hints: when the next is due, which of each have been said, the last time he got his stash. */
  hintAt: number;
  taunted: Set<PropName>;
  spelled: Set<PropName>;
  /** Times he's had you by the collar (Meathead makes a note of it the first time). */
  grabs: number;
  /** When he last slapped you up into the ceiling (the plaster comes down when you hit it). */
  slappedAt?: number;
  /** Wall cracks: where he's headbutted it (x, y), per wall side. */
  cracks: { side: -1 | 1; y: number }[];
  /** Said about a weapon on the wrong thing (once each). */
  wrongSaid: Set<string>;
  /** The walk to the window: frames since it started. */
  leaveT: number;
  /** Ammo out of his pockets: when some last fell out, his health then, and how many times it's happened. */
  pocketAt: number;
  pocketHp: number;
  pockets: number;
}

const office = () => COURSE.office;

export const createJunkieFight = (state: GameState, startedAt: number): JunkieFight => {
  const o = office();
  const done = startedAt > CP.OFFICE;
  const prop = (x: number, y: number): PropState => ({ state: done ? 'gone' : 'intact', t: 999, dir: 1, x, y, hp: 1, hitAt: -999 });
  const memo = state.stageMemo.junkieCorpse ? JSON.parse(state.stageMemo.junkieCorpse) as JunkieCorpse : undefined;
  return {
    phase: done ? 'done' : 'waiting', t: 0, man: null, hpFlash: 0, grab: null, thrown: null,
    walls: [{ x: o.x1 - 40, y: o.ceiling - 200, w: 40, h: o.floor - o.ceiling + 200, type: 'wall', hidden: true, tag: 'office-door' }],
    props: { desk: prop(o.desk, o.floor), cabinet: prop(o.cabinet, o.floor), fan: prop(o.fan, o.ceiling + 64), closet: prop(o.closet, o.floor) },
    stashes: [], corpse: done && memo ? memo : null,
    hintAt: 0, taunted: new Set(), spelled: new Set(), grabs: 0, cracks: [], wrongSaid: new Set(), leaveT: 0, pocketAt: 0, pocketHp: JUNKIE_HP, pockets: 0,
  };
};

/** The office's walls, ceiling and window wall (always there). */
export const officeBlocks = (): Block[] => {
  const o = office();
  return [
    { x: o.x1 - 40, y: o.ceiling - 30, w: o.x2 - o.x1 + 80, h: 30, type: 'wall', hidden: true, tag: 'office-ceiling' },
    { x: o.x2, y: o.ceiling - 200, w: 60, h: o.floor - o.ceiling + 200, type: 'wall', hidden: true, tag: 'office-window' },
  ];
};

// ---------------------------------------------------------------------------
// The fight
// ---------------------------------------------------------------------------

/** His walk; his lunge for your collar; his rush at the stash; flat out at the wall. */
const WALK = 1.15, LUNGE = 5.5, TO_STASH = 4.2, RAMPAGE = 5;
/** How long he stands staring at a stash before he goes for it. */
const NOTICE = 70;
/** Reaching for you: the tell, then the lunge; how close he has to be to try. */
const REACH_TELL = 20, LUNGE_FRAMES = 12, REACH_RANGE = 90;
/** Holding you: a punch every so often, then the throw. */
const PUNCH_EVERY = 26, PUNCHES = 3;
/** The pistol: how long you have to keep away before he pulls it, the aim, the shots. */
const GUN_AFTER = 170, GUN_AIM = 36, GUN_SHOTS = 3, GUN_EVERY = 18;
/** The stash: snorting it, the high, the wall; how long he's seeing stars after. */
const SNORT = 64, HIGH = 36, DAZED = 130;
/** Damage to him: his headbutt, kicking him while he's seeing stars; to you: a punch, the throw, his rampage, a bullet. */
const HEADBUTT_QUICK = 45, HEADBUTT_BIG = 350, KICK_DAZED = 45;
/** The headbutts: two quick ones this far apart, then the wind-up for the big one. */
export const BUTT_QUICK = 18, BUTT_BIG = 60;
const PUNCH = 7, THROW = 8, RAMPAGE_HIT = 16, BULLET = 8;
/** In his way to the stash: backhanded up into the ceiling (how hard, and how high it sends you). */
const SLAP = 10, SLAP_UP = 26;
/** A taunt about one of his things every so often; the first a few seconds in. */
const FIRST_HINT = 380, HINT_EVERY = 780;

const TAUNT: Record<PropName, string> = {
  desk: "NICE DESK, CHUCO! REAL WOOD? BE A SHAME IF IT CAUGHT FIRE!",
  cabinet: "WHAT'S IN THE FILING CABINET, TWEAKY? BET IT'D WASH RIGHT OUT!",
  fan: "THAT FAN'S HANGING BY A THREAD, ESE! A FEW BIG ROCKS AND DOWN IT COMES!",
  closet: "YOUR BUDDY IN THE CLOSET LOOKS HOT! WANT ME TO PUT HIM ON ICE?",
};
const SPELL: Record<PropName, string> = {
  desk: "KEEP THE FLAMETHROWER ON THE DESK. WHATEVER'S IN THOSE DRAWERS, SMOKE IT OUT.",
  cabinet: "A FEW TIDAL WAVES AND THAT FILING CABINET'S GOING FOR A SWIM.",
  fan: "KEEP HEAVING BOULDERS STRAIGHT UP AT THAT FAN. BRING IT DOWN.",
  closet: "ICE THE STIFF IN THE CLOSET WITH THE SHOTGUN. SHATTER HIM.",
};
const LINES = {
  intro: [{ who: 'junkie', text: "WHO LET YOU IN HERE?! THIS IS A PLACE OF BUSINESS!" }, { who: 'junkie', text: "YOU WANT SOME?! HUH?! YOU WANT SOME OF THIS?!" }] as ScriptLine[],
  idle: ["TIGHT! TIGHT! TIGHT!", "LOOK AT MY EYES! LOOK AT 'EM!", "I'M GONNA RIP YOUR HEART OUT AND SELL IT!", "YOU THINK YOU'RE BIG?! I'M BIGGER! IN HERE!", "DALE SAYS YOU'RE A FED! ARE YOU A FED?!"],
  grab: ["COME HERE, MUSCLES!", "GOTCHA! HUH?! HUH?!"],
  throw: ["GET OUTTA MY OFFICE!", "AND STAY OUT!"],
  gun: ["YOU LIKE MY GUN?! IT'S GOLD!", "SAY HELLO TO MY GOLDEN FRIEND!"],
  stash: ["IS THAT... BLUE?!", "MY BLUE! MY BEAUTIFUL BLUE!", "MINE! MINE MINE MINE!"],
  slap: ["OUTTA MY WAY!", "MOVE, MEATHEAD!", "NOBODY STANDS BETWEEN ME AND MY BLUE!"],
  high: ["OHHHH YEAHHHH! I CAN SEE THROUGH TIME!", "I'M A FREIGHT TRAIN, BABY!"],
  dazed: ["...THE WALL STARTED IT.", "WHO PUT THAT THERE?", "I'M OKAY! I'M OKAY!"],
  shot: ["YOU CALL THAT A BULLET?!", "THAT TICKLES, FED!"],
};

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const junkieSays = (state: GameState, talk: Talk, pool: string[], now = false) => {
  const line = { who: 'junkie' as const, text: pick(pool) };
  if (now) replaceLines(state, talk, [line]);
  else if (!talk.current && !talk.queue.length) queueLines(state, talk, [line]);
};
const meatheadSays = (state: GameState, talk: Talk, text: string, now = false) => {
  if (now) replaceLines(state, talk, [{ who: 'meathead', text }]);
  else queueLines(state, talk, [{ who: 'meathead', text }]);
};

export const updateJunkieFight = (ctx: FrameContext, fight: JunkieFight, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const o = office();
  fight.t++;
  if (fight.hpFlash > 0) fight.hpFlash--;
  if (fight.phase === 'done') return controls;
  if (fight.phase === 'waiting') {
    if (!fight.man) {
      // (across the room from the door: at his side table by the window, nose in a pile of it)
      fight.man = makeJunkie(o.x2 - 110, o.floor);
      state.enemies.push(fight.man);
    }
    // Up the stairs and through the door: he looks up from his desk
    if (p.pos.x > o.x1 + 40 && p.isGrounded && p.pos.y + p.height <= o.floor + 2) {
      fight.phase = 'intro'; fight.t = 0;
      state.blocks.push(...fight.walls);
      queueLines(state, talk, LINES.intro);
    }
  }
  if (fight.phase === 'intro' || fight.phase === 'fight' || fight.phase === 'dead' || fight.phase === 'leaving') {
    state.cameraOverride = { x: o.x1 - 20, y: o.floor - 450 };
  }
  if (fight.phase === 'intro' && fight.t > 140) {
    fight.phase = 'fight'; fight.t = 0; fight.hintAt = FIRST_HINT;
    if (fight.man) start(fight.man, 'stalk');
  }
  updateProps(ctx, fight, talk);
  updateStashes(fight);
  // Slapped up into the ceiling: he hits it, and the plaster comes down
  if (fight.slappedAt !== undefined && state.frame - fight.slappedAt < 60 && p.pos.y <= o.ceiling + 4) {
    fight.slappedAt = undefined;
    shakeScreen(state, 14, 8); playSound('thud');
    for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: o.ceiling + 2 }, vel: { x: (Math.random() - 0.5) * 5, y: Math.random() * 3 }, life: 30 + Math.random() * 20, color: i % 3 ? '#D6D3D1' : '#A8A29E', size: 2 + Math.random() * 4 });
  }
  if (fight.phase === 'fight') { hints(state, fight, talk); pocketAmmo(state, fight, talk); }
  // Thrown across the room
  if (fight.thrown) {
    p.vel.x = fight.thrown.vx;
    if (--fight.thrown.t <= 0 || (p.isGrounded && fight.thrown.t < 20)) fight.thrown = null;
  }
  // Held by the collar: he's got the controls
  if (fight.grab && fight.man) { holdPlayer(ctx, fight, fight.man, talk); return { ...NO_CONTROLS }; }
  if (fight.phase === 'dead' || fight.phase === 'leaving') return leave(ctx, fight, talk, controls);
  return controls;
};

const makeJunkie = (x: number, floorY: number): Enemy => ({
  id: 'junkie', kind: 'junkie', pos: { x, y: floorY - H }, vel: { x: 0, y: 0 }, width: W, height: H,
  health: JUNKIE_HP, maxHealth: JUNKIE_HP, type: 'enemy', enemyType: 'tank', behavior: 'custom',
  patrolRange: 0, initialX: x, shootTimer: 0, aiState: 'snorting', aiTimer: 0, facing: -1, hitFlash: 0,
});

const start = (m: Enemy, s: string) => { m.aiState = s; m.aiTimer = 0; };

/** In place of the generic enemy code. */
export const updateJunkie = (ctx: FrameContext, m: Enemy, fight: JunkieFight, talk: Talk): boolean => {
  const { state } = ctx;
  const p = state.player;
  const o = office();
  // Nothing takes: no freezing, burning, oil, needles, tasing
  m.frozenTimer = 0; m.pauseTimer = 0; m.isOnFire = false; m.fireTimer = 0; m.isOiled = false; m.oiledTimer = 0;
  m.sludgeTimer = 0; m.needleCount = 0; m.needleOffsets = []; m.dotTimer = 0; m.isTased = false;
  if (m.hitFlash && m.hitFlash > 0) m.hitFlash--;
  if (m.health <= 0 || m.isBlownAway) { killJunkie(ctx, m, fight, talk); return false; }
  m.aiTimer = (m.aiTimer || 0) + 1;
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  const toward = (px < mx ? -1 : 1) as 1 | -1;
  const floor = o.floor - H;
  const fighting = fight.phase === 'fight';
  const stash = fight.stashes.find(s => s.landed && !s.taken);
  // The moment there's a stash out, it's all he can think about (unless he's got his hands full)
  if (fighting && stash && !fight.grab && (m.aiState === 'stalk' || m.aiState === 'reach' || m.aiState === 'lunge' || m.aiState === 'aim' || m.aiState === 'shoot' || m.aiState === 'recover' || m.aiState === 'dazed')) {
    start(m, 'notice');
    junkieSays(state, talk, LINES.stash, true);
  }
  switch (m.aiState) {
    case 'snorting':
      // Bent over the desk, nose in a pile of it
      m.vel.x = 0; m.facing = -1;
      break;
    case 'grab':
      // (holding him: see holdPlayer)
      m.vel.x = 0;
      if (!fight.grab) start(m, 'recover');
      break;
    case 'stalk': {
      // Twitching his way at you
      m.facing = toward;
      m.vel.x = Math.abs(px - mx) > 40 ? toward * WALK * (0.7 + 0.5 * Math.abs(Math.sin(m.aiTimer * 0.2))) : 0;
      if (fighting && Math.random() < 0.004) junkieSays(state, talk, LINES.idle);
      if (fighting && Math.abs(px - mx) < REACH_RANGE && Math.abs(p.pos.y + p.height - (m.pos.y + H)) < 60 && p.invincibilityTimer <= 0 && state.deathTimer <= 0) start(m, 'reach');
      // Keep away from him long enough and out comes the gun
      if (fighting && Math.abs(px - mx) > 280 && m.aiTimer > GUN_AFTER) { start(m, 'aim'); junkieSays(state, talk, LINES.gun); }
      break;
    }
    case 'reach':
      // Arms out, the tell
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer > REACH_TELL) start(m, 'lunge');
      break;
    case 'lunge':
      m.vel.x = m.facing! * LUNGE;
      if (m.aiTimer > LUNGE_FRAMES) start(m, 'recover');
      break;
    case 'aim':
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer > GUN_AIM) start(m, 'shoot');
      break;
    case 'shoot':
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer % GUN_EVERY === 1) fireGold(ctx, m);
      if (m.aiTimer > GUN_SHOTS * GUN_EVERY) start(m, 'recover');
      break;
    case 'notice':
      // He's seen it: stops dead, stares, and a beat later he's off after it
      m.vel.x = 0;
      if (stash) m.facing = (stash.x < mx ? -1 : 1) as 1 | -1;
      if (m.aiTimer > NOTICE) start(m, stash ? 'to-stash' : 'recover');
      break;
    case 'to-stash': {
      if (!stash) { start(m, 'recover'); break; }
      const dir = (stash.x < mx ? -1 : 1) as 1 | -1;
      m.facing = dir;
      m.vel.x = dir * TO_STASH;
      if (Math.abs(stash.x - mx) < 14) { m.vel.x = 0; stash.taken = true; start(m, 'snort'); playSound('snort'); }
      break;
    }
    case 'snort':
      m.vel.x = 0;
      if (m.aiTimer % 10 === 0) for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: mx + m.facing! * 10, y: o.floor - 8 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 }, life: 20, color: i % 2 ? '#7DD3FC' : '#E0F2FE', size: 2 + Math.random() * 2 });
      if (m.aiTimer > SNORT) { start(m, 'high'); junkieSays(state, talk, LINES.high, true); shakeScreen(state, 8, 4); }
      break;
    case 'high':
      // Shaking all over, eyes out on stalks: then he picks a wall
      m.vel.x = 0;
      if (m.aiTimer > HIGH) {
        const wall = (mx - o.x1 < o.x2 - mx ? -1 : 1) as 1 | -1;
        start(m, 'rampage'); m.facing = wall; playSound('roar');
      }
      break;
    case 'rampage': {
      // A quick march over to it, head down, muttering (anyone in the way gets swatted aside)
      m.vel.x = m.facing! * RAMPAGE;
      if (m.aiTimer % 5 === 0) state.particles.push({ pos: { x: mx - m.facing! * 20, y: o.floor - 4 }, vel: { x: -m.facing! * 1.5, y: -Math.random() * 1.5 }, life: 16, color: '#78716C', size: 3 + Math.random() * 3 });
      const front = m.facing === 1 ? m.pos.x + W : m.pos.x;
      const wallX = m.facing === 1 ? o.x2 : o.x1;
      if (Math.abs(wallX - front) < 10) { start(m, 'butt'); m.vel.x = 0; }
      break;
    }
    case 'butt': {
      // Up against it: bonk, bonk, and then the big one (rearing right back, and all of it)
      m.vel.x = 0;
      const t = m.aiTimer;
      if (t === BUTT_QUICK || t === BUTT_QUICK * 2) headbutt(ctx, m, fight, talk, HEADBUTT_QUICK, false);
      if (t === BUTT_QUICK * 2 + BUTT_BIG) headbutt(ctx, m, fight, talk, HEADBUTT_BIG, true);
      break;
    }    case 'dazed':
      m.vel.x *= 0.8;
      if (m.aiTimer === 40) junkieSays(state, talk, LINES.dazed);
      if (m.aiTimer > DAZED) start(m, 'stalk');
      break;
    case 'recover':
    default:
      m.vel.x *= 0.8;
      m.facing = toward;
      if (m.aiTimer > 30) start(m, 'stalk');
      break;
  }
  m.pos.x += m.vel.x;
  m.pos.x = Math.max(o.x1 + 2, Math.min(o.x2 - W - 2, m.pos.x));
  m.pos.y = floor;
  if (fighting) touch(ctx, m, fight, talk);
  return true;
};

/** His gold pistol: a shot at you. */
const fireGold = (ctx: FrameContext, m: Enemy) => {
  const { state } = ctx;
  const p = state.player;
  const sx = m.pos.x + W / 2 + m.facing! * 34, sy = m.pos.y + 34;
  const tx = p.pos.x + p.width / 2, ty = p.pos.y + p.height / 2;
  const len = Math.hypot(tx - sx, ty - sy) || 1;
  state.projectiles.push({
    id: `ep-junkie-${state.frame}`, pos: { x: sx - 5, y: sy - 4 }, vel: { x: ((tx - sx) / len) * 9, y: ((ty - sy) / len) * 9 },
    width: 10, height: 8, health: 1, maxHealth: 1, type: 'projectile', damage: BULLET, owner: 'enemy', shooterKind: 'junkie', shot: 'slug',
  });
  ctx.fx.playGunSound('gun');
  for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: sx, y: sy }, vel: { x: m.facing! * (2 + Math.random() * 3), y: (Math.random() - 0.5) * 3 }, life: 8, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 3 + Math.random() * 3 });
};

const headbutt = (ctx: FrameContext, m: Enemy, fight: JunkieFight, talk: Talk, dmg: number, big: boolean) => {
  const { state, fx } = ctx;
  const side = m.facing === 1 ? 1 : -1;
  m.health -= dmg;
  m.hitFlash = big ? 14 : 6;
  fight.hpFlash = big ? 16 : 8;
  const wx = m.pos.x + W / 2 + side * W / 2, hy = m.pos.y + 16;
  if (big) fight.cracks.push({ side, y: hy - 2 + Math.random() * 10 });
  fx.spawnDamageNumber({ x: m.pos.x + W / 2, y: m.pos.y - 20 }, dmg, big, '#FF0000');
  fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 50, y: m.pos.y - (big ? 70 : 44) }, big ? 'HEADBUTT!!!' : 'BONK!', true, big ? '#FACC15' : '#FDE68A');
  fx.spawnDeathShower({ x: wx, y: hy }, -side, big ? 0.8 : 0.2);
  for (let i = 0; i < (big ? 26 : 8); i++) state.particles.push({ pos: { x: wx, y: hy }, vel: { x: -side * Math.random() * (big ? 7 : 4), y: (Math.random() - 0.5) * (big ? 9 : 5) }, life: 30, color: i % 2 ? '#D6D3D1' : '#A8A29E', size: 3 + Math.random() * 4 });
  shakeScreen(state, big ? 30 : 10, big ? 12 : 5);
  playSound(big ? 'slam' : 'punch');
  if (!big) return;
  m.vel.x = -side * 4;
  if (m.health <= 0) { m.health = 0; fight.corpse = { x: 0, y: 0, facing: side, weapon: 'GUN', t0: 0, headbutt: side }; return; }
  start(m, 'dazed');
  // The first time: Meathead gets it
  const done = PROPS.filter(n => fight.props[n].state !== 'intact').length;
  if (done === 1) meatheadSays(state, talk, "HE HEADBUTTED THE WALL?! OKAY! KEEP HIM HIGH! FIND HIM MORE STASH!", true);
  fight.hintAt = Math.max(fight.hintAt, fight.t + 240);
};
/** Bumping into him, or him into you. */
const touch = (ctx: FrameContext, m: Enemy, fight: JunkieFight, talk: Talk) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (state.deathTimer > 0 || fight.grab || !rectsOverlap(bodyBox(m), boundsOf(p))) return;
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  const away = px < mx ? -1 : 1;
  const special = p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking;
  const endMoves = () => { p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.recoiling = false; p.lockTimer = 0; };
  switch (m.aiState) {
    case 'rampage': case 'butt':
      // In his way to the wall (walking into him, charging him, whatever): swatted out of it
      if (p.invincibilityTimer > 0) return;
      endMoves();
      hurtPlayer(ctx, RAMPAGE_HIT, 'junkie_rush', { x: away * 11, y: -9 }, 30);
      shakeScreen(state, 12, 6);
      return;
    case 'dazed':
      // Seeing stars: now you can lay into him
      if (special && m.hitByMove !== p.moveId) {
        m.hitByMove = p.moveId;
        endMoves(); p.vel.x = away * 6; p.vel.y = -6;
        damage(ctx, m, fight, KICK_DAZED);
        fx.spawnDamageNumber({ x: px - 40, y: p.pos.y - 34 }, 'KICKED WHILE HE\'S DOWN!', true, '#FACC15');
      }
      return;
    case 'to-stash':
      // In his way to his stash: a backhand so hard it puts you in the ceiling (and he doesn't break stride)
      if (p.invincibilityTimer > 0) return;
      endMoves();
      hurtPlayer(ctx, SLAP, 'junkie_slap', { x: (m.facing ?? 1) * 5, y: -SLAP_UP }, 40);
      p.isGrounded = false;
      shakeScreen(state, 18, 10);
      playSound('punch'); playSound('slam');
      fx.spawnDamageNumber({ x: px - 40, y: p.pos.y - 40 }, 'PIMP SLAPPED!', true, '#F472B6');
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: px, y: p.pos.y + 20 }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 6 }, life: 18, color: i % 2 ? '#FFFFFF' : '#F472B6', size: 2 + Math.random() * 3 });
      fight.slappedAt = state.frame;
      junkieSays(state, talk, LINES.slap, true);
      return;
    case 'snort': case 'high': case 'notice':
      // Too busy to care; the specials bounce off him
      if (special) { endMoves(); p.vel.x = away * 8; p.vel.y = -5; }
      return;
    default:
      // A charge, a slide, anything: he's got you by the collar. Or he's lunged and got you anyway
      if (special || m.aiState === 'lunge' || m.aiState === 'reach') {
        if (p.invincibilityTimer > 0 && !special) return;
        endMoves();
        grabPlayer(ctx, fight, m, talk, special);
      }
  }
};

/** Where he can be touched. */
const bodyBox = (m: Enemy) => ({ x: m.pos.x + 8, y: m.pos.y + 6, w: W - 16, h: H - 6 });

const grabPlayer = (ctx: FrameContext, fight: JunkieFight, m: Enemy, talk: Talk, charged: boolean) => {
  const { state } = ctx;
  const p = state.player;
  fight.grab = { t: 0, punches: 0 };
  fight.grabs++;
  const side = p.pos.x + p.width / 2 < m.pos.x + W / 2 ? -1 : 1;
  m.facing = side as 1 | -1;
  start(m, 'grab');
  p.vel = { x: 0, y: 0 };
  junkieSays(state, talk, LINES.grab, true);
  if (charged && !fight.wrongSaid.has('charge')) { fight.wrongSaid.add('charge'); queueLines(state, talk, [{ who: 'meathead', text: "NOTE TO SELF: DON'T RUN AT THE CRACKHEAD." }]); }
  else if (fight.grabs === 2 && !fight.wrongSaid.has('close')) { fight.wrongSaid.add('close'); queueLines(state, talk, [{ who: 'meathead', text: "KEEP AWAY FROM HIS HANDS! MAKE HIM COME TO THE STASH INSTEAD!" }]); }
};

const holdPlayer = (ctx: FrameContext, fight: JunkieFight, m: Enemy, talk: Talk) => {
  const { state, fx } = ctx;
  const p = state.player;
  const g = fight.grab!;
  g.t++;
  const side = m.facing === 1 ? 1 : -1;
  // Held up by the collar in front of him
  p.pos.x = m.pos.x + W / 2 + side * 34 - p.width / 2;
  p.pos.y = m.pos.y + H - p.height - 10 - Math.sin(g.t * 0.5) * 2;
  p.vel = { x: 0, y: 0 };
  p.facing = (-side) as 1 | -1;
  p.invincibilityTimer = 0;
  if (g.t % PUNCH_EVERY === 0 && g.punches < PUNCHES) {
    g.punches++;
    hurtPlayer(ctx, PUNCH, 'junkie_punch', { x: 0, y: 0 }, 8);
    p.invincibilityTimer = 0;
    shakeScreen(state, 10, 5);
    playSound('punch');
    fx.spawnDeathShower({ x: p.pos.x + p.width / 2, y: p.pos.y + 16 }, side, 0.25);
    if (g.punches === 2) junkieSays(state, talk, ["HUH?! HUH?! HUH?!", "WHO'S THE FED NOW?!"], true);
  }
  if (state.deathTimer > 0) { fight.grab = null; start(m, 'recover'); return; }
  if (g.t >= PUNCH_EVERY * (PUNCHES + 1)) {
    // And out you go, as far across the room as it goes
    fight.grab = null;
    start(m, 'recover');
    const o = office();
    const land = side > 0 ? o.x2 - 80 : o.x1 + 40;
    const vx = (land - p.pos.x) / 36;
    hurtPlayer(ctx, THROW, 'junkie_throw', { x: vx, y: -12 }, 40);
    fight.thrown = { vx, t: 36 };
    state.playerStunTimer = 20;
    junkieSays(state, talk, LINES.throw);
    shakeScreen(state, 14, 7);
  }
};

const damage = (ctx: FrameContext, m: Enemy, fight: JunkieFight, dmg: number) => {
  m.health -= dmg;
  m.hitFlash = 6;
  fight.hpFlash = 10;
  ctx.fx.spawnDamageNumber({ x: m.pos.x + W / 2, y: m.pos.y - 10 }, Math.round(dmg), dmg >= 60);
};

/** A player projectile hit him: bullets barely register (the rest only a little). No status effects, no invincibility. */
export const hitJunkie = (ctx: FrameContext, m: Enemy, p: Projectile, fight: JunkieFight, talk: Talk): boolean => {
  if (fight.phase !== 'fight' || m.health <= 0) return true;
  const dmg = midBossProjectileDamage(p) * junkieShare(p) * (m.aiState === 'dazed' ? 2 : 1);
  if (dmg <= 0) return true;
  m.health -= dmg;
  m.hitFlash = 3;
  fight.hpFlash = 5;
  ctx.fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 10 }, Math.max(1, Math.round(dmg)));
  for (let i = 0; i < 2; i++) ctx.state.particles.push({ pos: { x: p.pos.x, y: p.pos.y }, vel: { x: -Math.sign(p.vel.x || 1) * (1 + Math.random() * 3), y: -Math.random() * 4 }, life: 20, color: '#8B0000', size: 2 + Math.random() * 2 });
  if (Math.random() < 0.02) junkieSays(ctx.state, talk, LINES.shot);
  return true;
};

const killJunkie = (ctx: FrameContext, m: Enemy, fight: JunkieFight, talk: Talk) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  const headbutt = fight.corpse?.headbutt;
  fight.corpse = { x: m.pos.x + W / 2, y: office().floor, facing: m.facing === 1 ? 1 : -1, weapon, t0: state.frame, headbutt };
  state.stageMemo.junkieCorpse = JSON.stringify(fight.corpse);
  fight.phase = 'dead'; fight.t = 0; fight.grab = null;
  fight.man = null;
  fx.spawnDeathShower({ x: m.pos.x + W / 2, y: m.pos.y + H / 2 }, 0, 3, true, 120);
  shakeScreen(state, 30, 9);
  fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 70, y: m.pos.y - 40 }, headbutt ? 'OFF HIS HEAD!' : 'DISTRIBUTION CUT!', true, '#FACC15');
  fx.announceKill(headbutt ? 'OFF HIS HEAD!' : 'DISTRIBUTION CUT!');
  state.player.killSatisfactionTimer = 90;
  // (the walk out's scripted: see leave)
  void talk;
};

// ---------------------------------------------------------------------------
// His things, and what's hidden in them
// ---------------------------------------------------------------------------

/** Each thing's box (world), while it's standing. */
export const propBox = (fight: JunkieFight, n: PropName) => {
  const o = office();
  switch (n) {
    case 'desk': return { x: o.desk - 58, y: o.floor - 52, w: 116, h: 52 };
    case 'cabinet': return { x: o.cabinet - 24, y: o.floor - 104, w: 48, h: 104 };
    case 'fan': return { x: o.fan - 60, y: o.ceiling + 44, w: 120, h: 34 };
    case 'closet': return { x: o.closet - 22, y: o.floor - 150, w: 44, h: 110 };
  }
  void fight;
};

const updateProps = (ctx: FrameContext, fight: JunkieFight, talk: Talk) => {
  const { state } = ctx;
  const o = office();
  if (fight.phase !== 'fight' && fight.phase !== 'intro') { for (const n of PROPS) if (fight.props[n].state === 'going') fight.props[n].t++; return; }
  for (const n of PROPS) {
    const pr = fight.props[n];
    if (pr.state === 'going') {
      pr.t++;
      if (n === 'desk' && pr.t % 3 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: o.desk + (Math.random() - 0.5) * 100, y: o.floor - 40 - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 1.5, y: -1.5 - Math.random() * 2 }, life: 24, color: i === 0 ? '#57534E' : i === 1 ? '#F97316' : '#FDE047', size: 5 + Math.random() * 6 });
      if (n === 'cabinet') { pr.x += pr.dir * Math.max(0, 7 - pr.t * 0.12); pr.x = Math.max(o.x1 + 30, Math.min(o.x2 - 30, pr.x)); }
      if (n === 'fan') { pr.y = Math.min(o.floor - 8, o.ceiling + 64 + 0.35 * pr.t * pr.t); }
      const reveal = n === 'desk' ? 70 : n === 'cabinet' ? 50 : n === 'fan' ? 36 : 26;
      if (pr.t === reveal) revealStash(ctx, fight, n, talk);
      if (n === 'fan' && pr.y >= o.floor - 8 && pr.t < 60 && pr.dir !== 9) { pr.dir = 9; shakeScreen(state, 14, 6); playSound('crash'); fanLands(ctx, fight); }
      if (pr.t > 200) pr.state = 'gone';
      continue;
    }
    if (pr.state !== 'intact') continue;
    const box = propBox(fight, n);
    // Worn down by the right weapon, and only by that (see PROP_TAKES): it goes once there's nothing left in it
    let took = 0;
    // The desk: the flamethrower's flames on it, for a while
    if (n === 'desk' && state.flameSegments.some(s => rectsOverlap(box, { x: s.x - s.size / 2, y: s.y - s.size / 2, w: s.size, h: s.size }))) took = PROP_TAKES.desk;
    // The cabinet: the tidal wave passing over it (one wave does most of it)
    if (n === 'cabinet' && state.tsunamiActive && Math.abs(state.tsunamiX - o.cabinet) < 90) { took = PROP_TAKES.cabinet; pr.dir = state.tsunamiDir; }
    // The fan: boulders (heaved up at it: a rolled one never gets up there)
    if (n === 'fan') { const b = state.projectiles.find(pj => pj.isBoulder && pj.owner === 'player' && rectsOverlap(box, boundsOf(pj)) && state.frame - pr.hitAt > 20); if (b) { took = PROP_TAKES.fan; b.vel.y = Math.abs(b.vel.y) * 0.4; b.vel.x *= -0.4; } }
    // The snitch: shotgun ice, a good few blasts of it
    if (n === 'closet') { const ice = state.projectiles.find(pj => pj.isIce && pj.owner === 'player' && pj.health > 0 && rectsOverlap(box, boundsOf(pj))); if (ice) { took = PROP_TAKES.closet; ice.health = 0; } }
    if (took > 0) {
      pr.hp = Math.max(0, pr.hp - took);
      if (state.frame - pr.hitAt > 8 && n !== 'desk') playSound(n === 'fan' ? 'clang' : n === 'closet' ? 'ice' : 'splash', 0.6);
      pr.hitAt = state.frame;
    }
    if (took > 0 && pr.hp <= 0) {
      pr.state = 'going'; pr.t = 0;
      if (n === 'desk') playSound('ignite');
      if (n === 'cabinet') playSound('splash');
      if (n === 'fan') playSound('crash');
      if (n === 'closet') { playSound('clang'); }
      continue;
    }
    // The wrong thing at it: Meathead lets you know (once each)
    wrongWeapon(ctx, fight, talk, n, box);
  }
};

/** Shots at his things that won't get at what's in them. */
const wrongWeapon = (ctx: FrameContext, fight: JunkieFight, talk: Talk, n: PropName, box: { x: number; y: number; w: number; h: number }) => {
  const { state } = ctx;
  if (fight.phase !== 'fight') return;
  const pj = state.projectiles.find(q => q.owner === 'player' && q.health > 0 && !q.isBoulder && !(q.isSludge && q.isLingering) && !(n === 'closet' && q.isIce) && rectsOverlap(box, boundsOf(q)));
  if (!pj) return;
  // (the shot carries on through: it's only what's in it that it can't get at. And if Chuco's right there,
  // it was him being shot at, not the thing)
  const m = fight.man;
  if (m && Math.abs(m.pos.x + W / 2 - (box.x + box.w / 2)) < 140) return;
  const key = `${n}`;
  if (fight.wrongSaid.has(key)) return;
  fight.wrongSaid.add(key);
  const line: Record<PropName, string> = {
    desk: "SHOOTING THE DESK? IT'S A DESK. IT NEEDS SOMETHING HOTTER.",
    cabinet: "BULLETS WON'T GET INTO THAT CABINET. IT NEEDS A WHOLE LOT OF WATER.",
    fan: "IT NEEDS SOMETHING A LOT HEAVIER THAN THAT TO BRING THAT FAN DOWN.",
    closet: "HE'S ALREADY DEAD. HE JUST NEEDS TO BE A LOT COLDER.",
  };
  queueLines(state, talk, [{ who: 'meathead', text: line[n] }]);
};

const fanLands = (ctx: FrameContext, fight: JunkieFight) => {
  const m = fight.man;
  if (!m) return;
  // (right on his head, if he was under it)
  const o = office();
  if (Math.abs(m.pos.x + W / 2 - o.fan) < 70) { damage(ctx, m, fight, 60); ctx.fx.spawnDamageNumber({ x: m.pos.x, y: m.pos.y - 40 }, 'BONK!', true, '#FACC15'); }
};

const revealStash = (ctx: FrameContext, fight: JunkieFight, n: PropName, talk: Talk) => {
  const { state } = ctx;
  const o = office();
  const pr = fight.props[n];
  const x = n === 'cabinet' ? pr.x : n === 'desk' ? o.desk : n === 'fan' ? o.fan : o.closet - 30;
  const y = n === 'fan' ? pr.y - 20 : n === 'closet' ? o.floor - 90 : o.floor - 40;
  fight.stashes.push({ x, y, vy: -3, landed: false, taken: false, from: n });
  for (let i = 0; i < 16; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 6 }, life: 30, color: i % 2 ? '#38BDF8' : '#BAE6FD', size: 2 + Math.random() * 3 });
  if (n === 'closet') { ctx.fx.spawnDeathShower({ x: o.closet, y: o.floor - 100 }, 0, 0.6); ctx.fx.spawnDamageNumber({ x: o.closet - 60, y: o.floor - 180 }, 'SNITCHES GET SHATTERED!', true, '#7DD3FC'); }
  void talk;
};

const updateStashes = (fight: JunkieFight) => {
  const o = office();
  for (const s of fight.stashes) {
    if (s.landed) continue;
    s.vy += 0.5; s.y += s.vy;
    if (s.y >= o.floor - 8) { s.y = o.floor - 8; s.landed = true; }
  }
};

/**
 * Chuco keeps ammo loose in his pockets: all kinds, whatever he's picked up, none of it for anything he owns. When
 * Meathead's running low on what one of the things still standing needs, a hit on Chuco (or just him flailing about,
 * given long enough) shakes some out: a good handful for that weapon. One at a time, and not too often.
 */
const POCKET_LOW = 0.3, POCKET_EVERY = 300, POCKET_ANYWAY = 600;
const POCKET_LINES = ["HEY! THAT'S MY AMMO!", "WHO KEEPS TAKING MY AMMO?!", "I GOT HOLES IN ALL MY POCKETS, MAN!", "THAT'S NOT EVEN FOR MY GUN! WHERE'D THAT COME FROM?!"];
const pocketAmmo = (state: GameState, fight: JunkieFight, talk: Talk) => {
  const m = fight.man;
  if (!m || m.health <= 0) return;
  const hit = m.health < fight.pocketHp - 0.5;
  fight.pocketHp = m.health;
  if (fight.t - fight.pocketAt < POCKET_EVERY) return;
  if (!hit && fight.t - fight.pocketAt < POCKET_ANYWAY) return;
  if (state.pickups.some(pk => pk.id.startsWith('chuco-pocket'))) return;
  const owned = (w: WeaponType) => (state.availableWeapons ?? state.player.availableWeapons ?? []).includes(w);
  const ammo = state.player.weaponAmmo;
  const low = PROPS.filter(n => fight.props[n].state === 'intact' && owned(PROP_WEAPON[n])).map(n => PROP_WEAPON[n])
    .filter(w => (ammo[w] ?? 0) < MAX_AMMO[w] * POCKET_LOW);
  if (!low.length) return;
  const w = low.reduce((a, b) => ((ammo[a] ?? 0) / MAX_AMMO[a] <= (ammo[b] ?? 0) / MAX_AMMO[b] ? a : b));
  fight.pocketAt = fight.t;
  fight.pockets++;
  // (out of his pocket and bouncing off across the floor, away from him)
  const o = office();
  const x = Math.max(o.x1 + 40, Math.min(o.x2 - 60, m.pos.x + W / 2 - 10));
  const away = m.pos.x + W / 2 < (o.x1 + o.x2) / 2 ? 1 : -1;
  state.pickups.push({ id: `chuco-pocket-${state.frame}`, pos: { x, y: m.pos.y + H * 0.45 }, vel: { x: away * (3 + Math.random() * 2), y: -7 }, width: 20, height: 20, type: 'large_ammo', life: 1e9, weapon: w });
  playSound('reload', 0.5);
  if (talk.current || talk.queue.length) return;
  // The first time, Meathead has something to say about it; after that, now and then, Chuco does
  if (fight.pockets === 1) queueLines(state, talk, [{ who: 'junkie', text: POCKET_LINES[0] }, { who: 'meathead', text: "LOOSE AMMO IN HIS POCKETS. CARELESS. THANKS, CHUCO." }]);
  else if (Math.random() < 0.5) junkieSays(state, talk, POCKET_LINES.slice(1));
};

/** Taunts about his things as it goes on (one he's not been taunted about yet, whose weapon Meathead's got); then, spelled out. */
const hints = (state: GameState, fight: JunkieFight, talk: Talk) => {
  if (fight.t < fight.hintAt || talk.current || talk.queue.length || fight.grab) return;
  const m = fight.man;
  if (!m || m.aiState === 'notice' || m.aiState === 'to-stash' || m.aiState === 'snort' || m.aiState === 'high' || m.aiState === 'rampage' || m.aiState === 'butt') return;
  const owned = (w: WeaponType) => (state.availableWeapons ?? state.player.availableWeapons ?? []).includes(w);
  const open = PROPS.filter(n => fight.props[n].state === 'intact' && owned(PROP_WEAPON[n]));
  if (!open.length) return;
  fight.hintAt = fight.t + HINT_EVERY;
  const untaunted = open.filter(n => !fight.taunted.has(n));
  if (untaunted.length) {
    const n = untaunted[Math.floor(Math.random() * untaunted.length)];
    fight.taunted.add(n);
    queueLines(state, talk, [{ who: 'meathead', text: TAUNT[n] }]);
    return;
  }
  const unspelled = open.filter(n => !fight.spelled.has(n));
  const n = (unspelled.length ? unspelled : open)[0];
  fight.spelled.add(n);
  queueLines(state, talk, [{ who: 'meathead', text: SPELL[n] }]);
};

// ---------------------------------------------------------------------------
// Out the window
// ---------------------------------------------------------------------------

/**
 * After he's down (ten seconds at most): Dale out in the yard yelling to load the rest of the cargo, Meathead's
 * answer, and meanwhile he walks himself over to the window; the moment they're done (or the time's up) he's
 * through it.
 */
const LEAVE_LINES_AT = 30, WALK_AT = 45, LEAVE_BY = 540;

const leave = (ctx: FrameContext, fight: JunkieFight, talk: Talk, controls: Controls): Controls => {
  const { state } = ctx;
  const p = state.player;
  const o = office();
  if (fight.phase === 'dead') { fight.phase = 'leaving'; fight.leaveT = 0; }
  fight.leaveT++;
  if (fight.leaveT === LEAVE_LINES_AT) replaceLines(state, talk, [
    { who: 'dale', text: "LOAD THE REST OF THE CARGO! MOVE IT! HE'S COMING!" },
    { who: 'meathead', text: "THE CARGO'S LEAVING? NOT WITHOUT ME." },
  ]);
  if (fight.leaveT >= 10000) { p.vel.x = 0; return { ...NO_CONTROLS }; }
  if (fight.leaveT < WALK_AT) return { ...NO_CONTROLS };
  // Walking over to it, and waiting there for them to finish
  p.facing = 1;
  const atWindow = p.pos.x + p.width > o.x2 - 90;
  const talkedOut = fight.leaveT > LEAVE_LINES_AT + 20 && !talk.current && !talk.queue.length;
  if (atWindow && (talkedOut || fight.leaveT >= LEAVE_BY)) {
    // Through it
    fight.leaveT = 10000;
    playGlassShatterSound();
    ctx.fx.spawnGlassShatter({ x: o.x2, y: o.floor - 60 });
    p.vel = { x: 7, y: -9 };
    p.hidden = true;
    return { ...NO_CONTROLS };
  }
  return { ...NO_CONTROLS, right: !atWindow };
};
/** Out through the window (the stage fades to the highway). */
export const outTheWindow = (fight: JunkieFight) => fight.leaveT >= 10000;

/** The fight's HUD: his health. */
export const junkieHealth = (fight: JunkieFight) => (fight.man ? Math.max(0, fight.man.health / JUNKIE_HP) : 0);
