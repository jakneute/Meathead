// Themed stage enemies: Artie's wildlife and his goons.
//
// The goons ride on the existing enemy logic with a new look: the shooter is a
// stationary gunner, the charger runs you down like the rusher, the shielder
// hides behind a slab of ice and drops it to throw. The wildlife have their
// own AI (below), set up as 'custom' behaviour: moveEnemy still does their
// gravity, footing and knockback, the AI only decides where they want to go.
//
//   wolverine: small, low and vicious. Prowls; when you're close it bristles,
//              then lunges along the ground in hops.
//   goat:      stands on rocks. When it sees you it charges, leaping up or off
//              any ledge in the way (but not over a crevasse), and headbutts hard.
//   eagle:     circles overhead, then folds its wings and dives at where you
//              are, pulling back up afterwards.

import { Enemy, EnemyKind } from '../../../types';
import { GRAVITY } from '../../../constants';
import type { FrameContext } from '../../core/context';
import { floorTopAt, profileYAt } from '../../core/terrain';
import type { GameState } from '../../core/state';
import { runHectorKindAI } from './hector';
import { runVictorKindAI } from './victor';
import { runErnieKindAI } from './ernie';
import { runDaleKindAI } from './dale';
import { runTommyKindAI } from './tommy';

interface KindStats { w: number; h: number; hp: number; contact: number; air?: boolean }

export const KIND_STATS: Record<EnemyKind, KindStats> = {
  wolverine: { w: 46, h: 28, hp: 60, contact: 9 },
  goat: { w: 50, h: 44, hp: 90, contact: 13 },
  eagle: { w: 46, h: 26, hp: 50, contact: 10, air: true },
  shooter: { w: 40, h: 62, hp: 110, contact: 6 },
  charger: { w: 50, h: 70, hp: 220, contact: 12 },
  shielder: { w: 50, h: 70, hp: 150, contact: 7 },
  moose: { w: 150, h: 96, hp: 2000, contact: 18 },
  // Hector's stage
  tourist: { w: 40, h: 62, hp: 110, contact: 6 },
  bouncer: { w: 52, h: 72, hp: 230, contact: 12 },
  surfer: { w: 50, h: 70, hp: 150, contact: 7 },
  cop: { w: 40, h: 64, hp: 180, contact: 6 },
  riotcop: { w: 50, h: 70, hp: 280, contact: 8 },
  gator: { w: 92, h: 26, hp: 150, contact: 15 },
  pelican: { w: 50, h: 28, hp: 45, contact: 9, air: true },
  iguana: { w: 40, h: 16, hp: 35, contact: 7 },
  crab: { w: 30, h: 18, hp: 30, contact: 6 },
  civilian: { w: 34, h: 62, hp: 1, contact: 0 },
  shark: { w: 84, h: 34, hp: 90, contact: 14, air: true },
  eye: { w: 200, h: 200, hp: 1200, contact: 16 },
  // Victor's stage
  heatsuit: { w: 40, h: 64, hp: 120, contact: 6 },
  smokejumper: { w: 52, h: 72, hp: 230, contact: 12 },
  blastshield: { w: 52, h: 70, hp: 170, contact: 8 },
  salamander: { w: 46, h: 18, hp: 45, contact: 8 },
  vulture: { w: 56, h: 30, hp: 55, contact: 10, air: true },
  magmafish: { w: 50, h: 26, hp: 40, contact: 14 },
  doorman: { w: 72, h: 100, hp: 950, contact: 8 },
  // Ernie's stage
  techbro: { w: 40, h: 62, hp: 110, contact: 6 },
  courier: { w: 46, h: 66, hp: 200, contact: 12 },
  protester: { w: 48, h: 66, hp: 160, contact: 7 },
  raccoon: { w: 42, h: 24, hp: 50, contact: 8 },
  seagull: { w: 44, h: 22, hp: 35, contact: 8, air: true },
  // (a drone's danger is its gun: bumping into it, or body-checking it, never hurts you)
  drone: { w: 58, h: 30, hp: 40, contact: 0, air: true },
  jetskier: { w: 74, h: 54, hp: 50, contact: 12 },
  burning: { w: 34, h: 62, hp: 1, contact: 0 },
  // Dale's stage
  sicario: { w: 40, h: 64, hp: 120, contact: 6 },
  enforcer: { w: 52, h: 72, hp: 230, contact: 12 },
  cardoor: { w: 52, h: 68, hp: 170, contact: 7 },
  rattlesnake: { w: 44, h: 16, hp: 40, contact: 9 },
  scorpion: { w: 32, h: 16, hp: 30, contact: 7 },
  coyote: { w: 54, h: 34, hp: 70, contact: 10 },
  junkie: { w: 56, h: 92, hp: 1300, contact: 6 },
  visitor: { w: 34, h: 62, hp: 1, contact: 0 },
  // Barry's stage
  pimp: { w: 40, h: 66, hp: 120, contact: 6 },
  hooker: { w: 36, h: 66, hp: 130, contact: 11 },
  mugger: { w: 40, h: 64, hp: 140, contact: 12 },
  bum: { w: 58, h: 64, hp: 170, contact: 7 },
  rat: { w: 30, h: 14, hp: 30, contact: 6 },
  guard: { w: 42, h: 66, hp: 130, contact: 6 },
  commuter: { w: 44, h: 66, hp: 210, contact: 12 },
  reader: { w: 50, h: 66, hp: 160, contact: 7 },
  exec: { w: 40, h: 66, hp: 120, contact: 6 },
  intern: { w: 38, h: 62, hp: 180, contact: 11 },
  hr: { w: 56, h: 68, hp: 170, contact: 7 },
  exterminator: { w: 42, h: 66, hp: 130, contact: 6 },
  janitor: { w: 44, h: 68, hp: 220, contact: 12 },
  custodian: { w: 54, h: 66, hp: 170, contact: 7 },
  labtech: { w: 40, h: 64, hp: 130, contact: 6 },
  subject: { w: 56, h: 78, hp: 260, contact: 14 },
  scientist: { w: 56, h: 68, hp: 180, contact: 7 },
  // (a tenant's only ever his top half, out of his window, and one hit does him; the minion's harmless; a generator's a big box)
  tenant: { w: 40, h: 44, hp: 1, contact: 0 },
  minion: { w: 36, h: 62, hp: 1, contact: 0 },
  generator: { w: 120, h: 150, hp: 100, contact: 0 },
  // Tommy's stage
  banger: { w: 40, h: 64, hp: 120, contact: 6 },
  bruiser: { w: 54, h: 72, hp: 240, contact: 13 },
  pitbull: { w: 52, h: 30, hp: 70, contact: 8 },
  // (a lowrider's danger is the guns in its windows: it doesn't run him down)
  lowrider: { w: 150, h: 52, hp: 170, contact: 0 },
  hazmat: { w: 42, h: 66, hp: 130, contact: 6 },
  bloater: { w: 60, h: 74, hp: 260, contact: 14 },
  manhole: { w: 52, h: 68, hp: 180, contact: 7 },
  sludgeling: { w: 30, h: 18, hp: 30, contact: 7 },
  // (what's left of the people the water killed: the stage runs it)
  // (it goes all the way down to the bottom of its pool)
  amalgam: { w: 300, h: 580, hp: 11000, contact: 0 },
};

/**
 * The small ground critters, too low to shoot even ducking: a slide tackle's what takes them out, in one go
 * (and a slide's only a little damage to anything else).
 */
export const isSmallCritter = (kind?: EnemyKind) =>
  kind === 'wolverine' || kind === 'salamander' || kind === 'raccoon' || kind === 'crab' || kind === 'iguana' || kind === 'magmafish'
  || kind === 'rattlesnake' || kind === 'scorpion' || kind === 'rat' || kind === 'sludgeling';

/** The ones that run you down like the rusher. */
export const isChargerKind = (kind?: EnemyKind) => kind === 'charger' || kind === 'bouncer' || kind === 'smokejumper' || kind === 'courier' || kind === 'enforcer'
  || kind === 'hooker' || kind === 'mugger' || kind === 'commuter' || kind === 'intern' || kind === 'janitor' || kind === 'subject'
  || kind === 'bruiser' || kind === 'bloater';

let spawnCount = 0;

/** A themed enemy standing on the ground at (x, groundY) (or flying `above` it). */
export const makeKindEnemy = (kind: EnemyKind, x: number, groundY: number): Enemy => {
  const s = KIND_STATS[kind];
  const pos = { x: x - s.w / 2, y: groundY - s.h };
  const base: Enemy = {
    id: `${kind}-${++spawnCount}`, kind, pos, vel: { x: 0, y: 0 }, width: s.w, height: s.h,
    health: s.hp, maxHealth: s.hp, type: 'enemy', enemyType: 'tank', behavior: 'custom',
    patrolRange: 0, initialX: pos.x, shootTimer: 0, homeX: pos.x, homeY: pos.y, aiState: 'idle', aiTimer: 0, facing: -1,
  };
  switch (kind) {
    case 'eagle': return { ...base, enemyType: 'flyer', initialY: pos.y };
    case 'shooter': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    // The charger uses the rusher's run-you-down logic
    case 'charger': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'shielder': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    // Hector's goons and cops ride on the same logic, dressed for the beach (or the job)
    case 'tourist': case 'cop': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'bouncer': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'surfer': case 'riotcop': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    case 'pelican': case 'shark': return { ...base, enemyType: 'flyer', initialY: pos.y };
    // Victor's goons, in heat gear: the same three jobs
    case 'heatsuit': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'smokejumper': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'blastshield': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    case 'vulture': return { ...base, enemyType: 'flyer', initialY: pos.y };
    // Ernie's: a tech bro with a pistol, a bike courier who runs you down, a protester behind his sign
    case 'techbro': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'courier': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'protester': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    case 'seagull': return { ...base, enemyType: 'flyer', initialY: pos.y };
    case 'drone': return { ...base, enemyType: 'flyer', initialY: pos.y, harmless: true };
    // On fire and screaming: nobody's enemy, and only you can end it
    case 'burning': return { ...base, harmless: true, innocent: true };
    // Beachgoers: not out to hurt anyone
    case 'civilian': return { ...base, harmless: true, innocent: true };
    // Dale's cartel: a sicario with a rifle, an enforcer who runs you down with a machete, a man behind a car door
    case 'sicario': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'enforcer': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'cardoor': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    // Tourists in the old west town: the same as the beachgoers
    case 'visitor': return { ...base, harmless: true, innocent: true };
    // Barry's New Yorkers: somebody with a gun, somebody who comes at you, somebody behind something throwing things
    case 'pimp': case 'guard': case 'exec': case 'exterminator': case 'labtech': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'hooker': case 'mugger': case 'commuter': case 'intern': case 'janitor': case 'subject': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'bum': case 'reader': case 'hr': case 'custodian': case 'scientist': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    // (the stage runs these itself)
    case 'minion': return { ...base, harmless: true };
    case 'tenant': case 'generator': return { ...base, harmless: true };
    // Tommy's: a gangbanger with a pistol, a bruiser with a bat, a manhole man behind his cover; down below, his hazmat
    // crew with their sprayers and the bloated sewer workers
    case 'banger': case 'hazmat': return { ...base, behavior: 'shoot', shootTimer: Math.floor(Math.random() * 40) };
    case 'bruiser': case 'bloater': return { ...base, behavior: 'patrol', pauseTimer: 0 };
    case 'manhole': return { ...base, enemyType: 'shield', behavior: 'shoot', isShieldActive: true };
    case 'amalgam': return { ...base, harmless: true };
    default: return base;
  }
};

/** Contact damage for a themed enemy (undefined for the old generic ones). */
export const kindContactDamage = (e: Enemy) => (e.kind ? KIND_STATS[e.kind].contact : undefined);

/** Runs the wildlife AI. Returns true if it took care of movement itself (the eagle flies its own path). */
export const runKindAI = (ctx: FrameContext, e: Enemy): boolean => {
  switch (e.kind) {
    case 'wolverine': wolverine(ctx, e); return false;
    case 'goat': goat(ctx, e); return false;
    case 'eagle': eagle(ctx, e); return true;
    case 'gator': case 'pelican': case 'iguana': case 'crab': case 'civilian': case 'shark': return runHectorKindAI(ctx, e);
    // Victor's wildlife: the salamander prowls and lunges like a wolverine, the vulture circles and dives like the eagle
    case 'salamander': wolverine(ctx, e); return false;
    case 'vulture': eagle(ctx, e); return true;
    case 'magmafish': return runVictorKindAI(ctx, e);
    // Ernie's wildlife and machines: the raccoon lunges like the wolverine, the seagull swoops like the pelican
    case 'raccoon': wolverine(ctx, e); return false;
    case 'seagull': return runHectorKindAI(ctx, e);
    case 'drone': case 'jetskier': case 'burning': return runErnieKindAI(ctx, e);
    // Dale's desert: the coyote lunges in bounding hops like the wolverine, the scorpion scuttles and pinches like the
    // crab; the rattlesnake coils up and strikes; the tourists in town carry on like the beachgoers
    case 'coyote': wolverine(ctx, e); return false;
    case 'scorpion': case 'visitor': return runHectorKindAI(ctx, e);
    case 'rattlesnake': return runDaleKindAI(ctx, e);
    // Barry's rats scurry and lunge like the wolverine
    case 'rat': wolverine(ctx, e); return false;
    case 'pitbull': case 'lowrider': case 'sludgeling': return runTommyKindAI(ctx, e);
    default: return false;
  }
};

/** How long enemies keep holding off after he's landed from a crevasse. */
const GAP_GRACE = 40;

/**
 * Fairness: nobody starts an attack on him while he's jumping a crevasse (or
 * picking his way across its ledges), or for a moment after he lands. No
 * eagles diving on him mid-jump, no goats leaping the gap at him.
 */
export const updateGapGrace = (state: GameState) => {
  const runs = state.groundRuns;
  const p = state.player;
  // (not in a set piece that has the camera: the tram cabin, for one, rides out over the gorge)
  const overGap = runs.length > 0 && !state.cameraOverride && profileYAt(runs, p.pos.x + p.width / 2) === undefined;
  state.gapGrace = overGap ? GAP_GRACE : Math.max(0, (state.gapGrace || 0) - 1);
};

/** Which way a shield enemy's shield faces (-1 left, the default, or 1 right). */
export const shieldFacing = (e: Enemy) => (e.facing === 1 ? 1 : -1);

export const holdingOff = (state: GameState) => (state.gapGrace || 0) > 0;

export const mid = (o: { pos: { x: number; y: number }; width: number; height: number }) => ({ x: o.pos.x + o.width / 2, y: o.pos.y + o.height / 2 });

/** Is there ground a step ahead that isn't a drop? (So prowlers don't wander off ledges.) */
/** Ground to step onto `look` px past its leading edge (look further ahead the faster it's going, to stop in time). */
export const safeAhead = (ctx: FrameContext, e: Enemy, dir: number, look = 8) => {
  const top = floorTopAt(ctx.state.blocks, e.pos.x + e.width / 2 + dir * (e.width / 2 + look), e.pos.y + e.height);
  return top !== null && top - (e.pos.y + e.height) < 40;
};

export const seesPlayer = (ctx: FrameContext, e: Enemy, rangeX: number, rangeY: number) => {
  const p = mid(ctx.state.player), m = mid(e);
  return Math.abs(p.x - m.x) < rangeX && Math.abs(p.y - m.y) < rangeY && ctx.state.player.health > 0;
};

// ---------------------------------------------------------------------------

const WOLVERINE_PROWL = 1.1;
const WOLVERINE_LUNGE = 8.5;
/** How far one of its bounding hops carries it (it checks there's ground all that way before it leaves the floor). */
const WOLVERINE_HOP_REACH = 170;

/** Solid ground (no drop) every stride of the way from its leading edge to `dist` px on. */
const groundAllAlong = (ctx: FrameContext, e: Enemy, dir: number, dist: number) => {
  for (let d = 8; d <= dist; d += 20) if (!safeAhead(ctx, e, dir, d)) return false;
  return true;
};

const wolverine = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  const dirToPlayer = mid(player).x < mid(e).x ? -1 : 1;
  e.aiTimer = (e.aiTimer || 0) + 1;
  switch (e.aiState) {
    case 'idle':
    default: {
      // Prowl back and forth near home
      const home = e.homeX ?? e.pos.x;
      if (e.facing === undefined) e.facing = -1;
      if (Math.abs(e.pos.x - home) > 70 || !safeAhead(ctx, e, e.facing)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
      e.vel.x = e.facing * WOLVERINE_PROWL;
      if (seesPlayer(ctx, e, 360, 110) && !holdingOff(ctx.state)) { e.aiState = 'bristle'; e.aiTimer = 0; }
      break;
    }
    case 'bristle':
      // Hackles up, crouched, about to go
      e.facing = dirToPlayer as 1 | -1;
      e.vel.x = 0;
      if (e.aiTimer > 16) { e.aiState = 'lunge'; e.aiTimer = 0; }
      break;
    case 'lunge':
      // Bounding at you in low hops (pulling up short at an edge rather than going over it)
      if (e.vel.y === 0 && !safeAhead(ctx, e, e.facing!, 24)) { e.vel.x = 0; e.aiState = 'recover'; e.aiTimer = 0; break; }
      e.vel.x = e.facing! * WOLVERINE_LUNGE;
      // (only hops when there's ground all the way to where it'd come down: no bounding out over a gap)
      if (e.aiTimer % 14 === 1 && e.vel.y === 0 && groundAllAlong(ctx, e, e.facing!, WOLVERINE_HOP_REACH)) e.vel.y = -4.5;
      if (e.aiTimer > 46) { e.aiState = 'recover'; e.aiTimer = 0; }
      break;
    case 'recover':
      e.vel.x *= 0.85;
      if (e.aiTimer > 34) { e.aiState = seesPlayer(ctx, e, 360, 110) && !holdingOff(ctx.state) ? 'bristle' : 'idle'; e.aiTimer = 0; e.homeX = e.pos.x; }
      break;
  }
};

const GOAT_CHARGE = 6.8;

const goat = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const grounded = e.vel.y === 0;
  switch (e.aiState) {
    case 'idle':
    default:
      e.vel.x = 0;
      e.facing = (mid(player).x < mid(e).x ? -1 : 1) as 1 | -1;
      if (seesPlayer(ctx, e, 440, 220) && !holdingOff(ctx.state)) { e.aiState = 'paw'; e.aiTimer = 0; }
      break;
    case 'paw':
      // Scrapes a hoof, head down
      e.vel.x = 0;
      e.facing = (mid(player).x < mid(e).x ? -1 : 1) as 1 | -1;
      if (holdingOff(ctx.state)) e.aiTimer = Math.min(e.aiTimer, 12);
      if (e.aiTimer > 24) { e.aiState = 'charge'; e.aiTimer = 0; }
      break;
    case 'charge':
      if (grounded) {
        e.vel.x = e.facing! * GOAT_CHARGE;
        // A gap, a drop or a step up in the way: leap it
        const aheadX = e.pos.x + e.width / 2 + e.facing! * (e.width / 2 + 26);
        const top = floorTopAt(ctx.state.blocks, aheadX, e.pos.y + e.height, 60);
        const feet = e.pos.y + e.height;
        if (top === null || top < feet - 20 || top > feet + 50) {
          // Not over a crevasse, though: it digs its hooves in at the edge (and doesn't go and die where you can't see it)
          if (top === null) { e.vel.x = 0; e.aiState = 'skid'; e.aiTimer = 0; break; }
          e.vel.y = -11;
        }
        // Also springs up at you if you're above it
        else if (mid(player).y < e.pos.y - 40 && Math.abs(mid(player).x - mid(e).x) < 140) e.vel.y = -12;
      }
      if (e.aiTimer > 80 || (grounded && Math.sign(mid(player).x - mid(e).x) !== e.facing && Math.abs(mid(player).x - mid(e).x) > 120)) {
        e.aiState = 'skid'; e.aiTimer = 0;
      }
      break;
    case 'skid':
      if (grounded) e.vel.x *= 0.8;
      if (e.aiTimer > 30) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
};

const EAGLE_DIVE = 9.5;

const eagle = (ctx: FrameContext, e: Enemy) => {
  const { player } = ctx.state;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const homeX = e.homeX ?? e.pos.x, homeY = e.homeY ?? e.pos.y;
  const m = mid(e);
  switch (e.aiState) {
    case 'idle':
    default: {
      // Lazy circles over its patch of sky
      const t = (ctx.state.frame + homeX) * 0.02;
      const tx = homeX + Math.cos(t) * 110, ty = homeY + Math.sin(t * 2) * 18;
      e.vel.x = (tx - e.pos.x) * 0.06;
      e.vel.y = (ty - e.pos.y) * 0.06;
      e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      const p = mid(player);
      if (e.aiTimer > 60 && !holdingOff(ctx.state) && Math.abs(p.x - m.x) < 420 && p.y > m.y + 40 && player.health > 0) {
        e.aiState = 'dive'; e.aiTimer = 0; e.aiX = p.x; e.aiY = p.y;
        const len = Math.hypot(p.x - m.x, p.y - m.y) || 1;
        e.vel = { x: ((p.x - m.x) / len) * EAGLE_DIVE, y: ((p.y - m.y) / len) * EAGLE_DIVE };
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
      }
      break;
    }
    case 'dive':
      // Straight at where you were, until it gets there (or hits the ground)
      // (and never past it: it doesn't overshoot down into a crevasse)
      if (Math.hypot((e.aiX ?? m.x) - m.x, (e.aiY ?? m.y) - m.y) < 14 || m.y > (e.aiY ?? m.y) + 10 || e.aiTimer > 70) {
        e.aiState = 'climb'; e.aiTimer = 0;
      }
      break;
    case 'climb':
      // Beats its way back up home
      e.vel.x *= 0.95;
      e.vel.y = Math.max(-5, e.vel.y - GRAVITY);
      if (e.pos.y <= homeY) { e.aiState = 'idle'; e.aiTimer = 0; }
      break;
  }
  // Don't fly through the ground
  const floor = floorTopAt(ctx.state.blocks, m.x, e.pos.y + e.height, 0);
  e.pos.x += e.vel.x;
  e.pos.y += e.vel.y;
  if (floor !== null && e.pos.y + e.height > floor) { e.pos.y = floor - e.height; if (e.aiState === 'dive') { e.aiState = 'climb'; e.aiTimer = 0; } }
};
