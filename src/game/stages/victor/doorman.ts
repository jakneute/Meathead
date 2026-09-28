// The doorman of Club Caldera: the mid-boss at the foot of the volcano. A big,
// meaty man like you, who wants to see some ID and proof of membership, and
// isn't letting you in without them.
//
// He walks you down (forward and back, always facing you) and does your moves
// back at you: the shoulder charge, the slide tackle, the uppercut (he never
// jumps, so no dive kick). Bullets barely bother him. The way to hurt him is to
// counter:
//   his shoulder charge: slide into it or dive kick onto it and he goes down
//   your shoulder charge into his: a clash, locked shoulder to shoulder (mash
//     the special button: B on a pad, right click on a mouse)
//   his slide: dive kick onto it and he's stomped flat
//   your shoulder charge into his slide: he takes your legs out (you're hurt)
//   your slide into his slide: a different clash, feet to feet (press the
//     special button when the marker's in the zone, three times)
//   jumping over him: he uppercuts you out of the air
//   charging into him when he isn't attacking: barely a scratch, and he shoves you off
// Winning a clash hurts him more than either trip. Like every mid-boss: no
// invincibility between hits, lots of health, no status effects; how he dies
// decides what's left of him.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../context';
import type { GameState } from '../../state';
import type { Controls } from '../../input';
import { NO_CONTROLS } from '../../input';
import { shakeScreen } from '../../state';
import { rectsOverlap, boundsOf } from '../../utils';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../audio';
import { say, Voice } from '../../speech';
import { BOULDER_DAMAGE_PER_SPEED, GML_SCALE } from '../../../constants';
import { KIND_STATS } from '../../systems/kinds';
import { COURSE, CP } from './course';

export const DOORMAN_HP = KIND_STATS.doorman.hp;
const W = KIND_STATS.doorman.w, H = KIND_STATS.doorman.h;

export type ClashKind = 'shoulder' | 'slide';
export interface Clash {
  kind: ClashKind;
  t: number;
  /** Shoulder: the tug of war (0 he wins, 1 you win). Slide: the marker's position (0..1) and the hits you've landed. */
  meter: number;
  hits: number;
  /** Frames the last hit/miss flash stays up. */
  flash: number;
  missed: boolean;
}
export interface DoormanCorpse { x: number; y: number; facing: 1 | -1; weapon: WeaponType; t0: number }
export interface DoormanFight {
  phase: 'waiting' | 'intro' | 'fight' | 'dead';
  t: number;
  man: Enemy | null;
  walls: Block[];
  corpse: DoormanCorpse | null;
  hpFlash: number;
  clash: Clash | null;
  /** The special button last frame (to catch presses). */
  specialWas: boolean;
  /** A breather after any collision with him, so one bump isn't counted twice. */
  touchCd: number;
  /** What he's saying (only while it's being said), and a pause before the next line. */
  line: string;
  lineT: number;
  talkCd: number;
  /** The last thing that happened, for the callout. */
  lastCall: string;
}

const arena = () => COURSE.club;
const DOORMAN_VOICE: Voice = { pitch: 0.35, rate: 0.9 };

export const createDoormanFight = (state: GameState, startedAt: number): DoormanFight => {
  const a = arena();
  const dead = startedAt > CP.CLUB;
  return {
    phase: dead ? 'dead' : 'waiting', t: 0, man: null, hpFlash: 0, clash: null, specialWas: false, touchCd: 0,
    line: '', lineT: 0, talkCd: 60, lastCall: '',
    walls: [
      { x: a.x1 - 40, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'club-wall' },
      { x: a.x2, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'club-wall' },
    ],
    corpse: dead ? { x: a.x2 - 300, y: a.y, facing: -1, weapon: (state.stageMemo.doormanWeapon as WeaponType) || 'GUN', t0: -600 } : null,
  };
};

const LINES = {
  idle: ["ID, PLEASE.", "I'M GONNA NEED TO SEE SOME PROOF OF MEMBERSHIP.", "YOU'RE NOT ON THE LIST.", "MEMBERS ONLY, MEATBALL.", "NO SHIRT, NO ENTRY. HOUSE RULES.",
    "THIS IS A PRIVATE EVENT.", "SHOW ME A MEMBERSHIP CARD OR WALK.", "NICE TRY. LET'S SEE THAT ID.", "I DON'T CARE WHO YOU KNOW."],
  hurt: ["OKAY. THAT'S STRIKE ONE.", "YOU JUST GOT YOURSELF BANNED.", "THAT'S GOING IN THE INCIDENT REPORT."],
  clash: ["YOU'RE NOT GETTING IN!", "NOT TONIGHT, PAL!"],
  win: ["AND STAY OUT.", "NEXT!"],
};

const talk = (fight: DoormanFight, pool: string[], force = false) => {
  if (!force && (fight.talkCd > 0 || fight.lineT > 0)) return;
  const text = pool[Math.floor(Math.random() * pool.length)];
  fight.talkCd = 260;
  const shown = say(text, DOORMAN_VOICE, force ? 'urgent' : 'casual', {
    onShow: () => { fight.line = text; fight.lineT = 150; },
    onHide: () => { if (fight.line === text) fight.lineT = Math.min(fight.lineT, 20); },
  });
  if (!shown && force) { fight.line = text; fight.lineT = 110; }
};

/** Runs the club door: the fight starts once you walk up. Returns the controls (the clashes take them over). */
export const updateDoormanFight = (ctx: FrameContext, fight: DoormanFight, controls: Controls): Controls => {
  const { state } = ctx;
  const { player } = state;
  const a = arena();
  fight.t++;
  if (fight.hpFlash > 0) fight.hpFlash--;
  if (fight.lineT > 0) fight.lineT--;
  if (fight.talkCd > 0) fight.talkCd--;
  if (fight.touchCd > 0) fight.touchCd--;
  if (fight.phase === 'waiting') {
    // He's on the door; walk up and it's on
    if (!fight.man) {
      fight.man = makeDoorman(a.x2 - 150, a.y);
      state.enemies.push(fight.man);
    }
    if (player.pos.x + player.width / 2 > a.x1 + 60 && player.isGrounded && player.pos.x < a.x2) {
      fight.phase = 'intro'; fight.t = 0;
      state.blocks.push(...fight.walls);
      talk(fight, ["ID, PLEASE."], true);
    }
  }
  if (fight.phase === 'intro' || fight.phase === 'fight') state.cameraOverride = { x: a.x1 - 10, y: a.y - 550 };
  if (fight.phase === 'intro' && fight.t > 80) { fight.phase = 'fight'; if (fight.man) { fight.man.aiState = 'stalk'; fight.man.aiTimer = 0; } }
  // A clash: it takes the special button
  const special = controls.special;
  const pressed = special && !fight.specialWas;
  fight.specialWas = special;
  if (fight.clash && fight.man) { runClash(ctx, fight, fight.man, pressed); return { ...NO_CONTROLS }; }
  return controls;
};

const makeDoorman = (x: number, floorY: number): Enemy => ({
  id: 'doorman', kind: 'doorman', pos: { x, y: floorY - H }, vel: { x: 0, y: 0 }, width: W, height: H,
  health: DOORMAN_HP, maxHealth: DOORMAN_HP, type: 'enemy', enemyType: 'tank', behavior: 'custom',
  patrolRange: 0, initialX: x, shootTimer: 0, aiState: 'door', aiTimer: 0, facing: -1, hitFlash: 0,
});

// ---------------------------------------------------------------------------
// Him (in place of the generic enemy code)
// ---------------------------------------------------------------------------

const WALK = 1.6, CHARGE = 10.5, SLIDE = 11.5;
const WINDUP_CHARGE = 34, WINDUP_SLIDE = 28, CHARGE_FRAMES = 60, SLIDE_FRAMES = 34, UPPERCUT_FRAMES = 36, RECOVER = 34, TRIPPED = 100;
/** Damage to him: winning a clash, the trips, and bumping into him when he's not attacking. */
const CLASH_WIN = 170, DIVE_TRIP = 95, SLIDE_TRIP = 85, SCRATCH = 12;
/** Damage to you: his charge, his slide, his uppercut, losing a clash, tripping on his slide, a shove. */
const HIT_CHARGE = 16, HIT_SLIDE = 14, HIT_UPPERCUT = 20, CLASH_LOSE = 24, TRIP_YOU = 20, SHOVE = 5;
/** Bullets barely scratch him (a bit more once he's down). */
const BULLET_SCALE = 0.12, BULLET_SCALE_DOWN = 0.4;

export const isAttacking = (m: Enemy) => m.aiState === 'charge' || m.aiState === 'slide' || m.aiState === 'uppercut';

export const updateDoorman = (ctx: FrameContext, m: Enemy, fight: DoormanFight): boolean => {
  const { state } = ctx;
  const p = state.player;
  const a = arena();
  // Nothing takes: no freezing, burning, oil, needles, tasing
  m.frozenTimer = 0; m.pauseTimer = 0; m.isOnFire = false; m.fireTimer = 0; m.isOiled = false; m.oiledTimer = 0;
  m.sludgeTimer = 0; m.needleCount = 0; m.needleOffsets = []; m.dotTimer = 0; m.isTased = false;
  if (m.hitFlash && m.hitFlash > 0) m.hitFlash--;
  if (m.health <= 0 || m.isBlownAway) { killDoorman(ctx, m, fight); return false; }
  m.aiTimer = (m.aiTimer || 0) + 1;
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  const toward = (px < mx ? -1 : 1) as 1 | -1;
  const angry = m.health < m.maxHealth * 0.5;
  const floor = a.y - H;
  if (fight.clash) return true;

  switch (m.aiState) {
    case 'door':
      // Arms folded, blocking the door
      m.facing = toward; m.vel.x = 0;
      break;
    case 'stalk': {
      // Walking you down, forward and back, always square to you
      m.facing = toward;
      const d = Math.abs(px - mx);
      const want = 230 + Math.sin(m.aiTimer * 0.04) * 90;
      m.vel.x = d > want + 20 ? toward * WALK : d < want - 20 ? -toward * WALK : 0;
      if (fight.phase === 'fight') talk(fight, LINES.idle);
      // You're coming over the top: he's waiting for it
      if (!p.isGrounded && Math.abs(px - mx) < 150 && p.pos.y + p.height < m.pos.y + 40 && p.vel.y > -20) { start(m, 'uppercut'); m.vel.y = -9; break; }
      if (m.aiTimer > (angry ? 70 : 110) && fight.phase === 'fight') start(m, Math.random() < 0.55 ? 'windup-charge' : 'windup-slide');
      break;
    }
    case 'windup-charge':
      // Shoulder down, pawing the ground (the tell)
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer > WINDUP_CHARGE) { start(m, 'charge'); m.vel.x = m.facing * CHARGE; talk(fight, ["MOVE!"], false); }
      break;
    case 'windup-slide':
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer > WINDUP_SLIDE) { start(m, 'slide'); m.vel.x = m.facing * SLIDE; }
      break;
    case 'charge': {
      m.vel.x = m.facing! * CHARGE;
      const front = m.facing === 1 ? m.pos.x + W : m.pos.x;
      const wall = m.facing === 1 ? a.x2 : a.x1;
      if (Math.abs(wall - front) < 30 || m.aiTimer > CHARGE_FRAMES) start(m, 'recover');
      if (m.aiTimer % 4 === 0) dust(state, m);
      break;
    }
    case 'slide':
      m.vel.x = m.facing! * SLIDE * Math.max(0.3, 1 - m.aiTimer / (SLIDE_FRAMES * 1.4));
      if (m.aiTimer > SLIDE_FRAMES) start(m, 'recover');
      if (m.aiTimer % 3 === 0) dust(state, m);
      break;
    case 'uppercut':
      // Straight up off the ground, fist first, and back down
      m.vel.x = 0;
      m.vel.y += 0.65;
      if (m.aiTimer > UPPERCUT_FRAMES && m.pos.y >= floor) start(m, 'recover');
      break;
    case 'tripped':
      // Flat on his back: your chance
      m.vel.x *= 0.9;
      if (m.aiTimer > TRIPPED) { start(m, 'recover'); talk(fight, LINES.hurt, true); }
      break;
    case 'shove':
      m.vel.x *= 0.7;
      if (m.aiTimer > 20) start(m, 'stalk');
      break;
    case 'recover':
    default:
      m.vel.x *= 0.8;
      m.facing = toward;
      if (m.aiTimer > RECOVER) start(m, 'stalk');
      break;
  }
  m.pos.x += m.vel.x;
  m.pos.x = Math.max(a.x1 + 2, Math.min(a.x2 - W - 2, m.pos.x));
  if (m.aiState === 'uppercut' || m.pos.y < floor) { m.pos.y += m.vel.y; if (m.pos.y >= floor) { m.pos.y = floor; m.vel.y = 0; } }
  else m.pos.y = floor;
  if (fight.phase === 'fight') touch(ctx, m, fight);
  return true;
};

const start = (m: Enemy, state: string) => { m.aiState = state; m.aiTimer = 0; };

const dust = (state: GameState, m: Enemy) => {
  state.particles.push({ pos: { x: m.pos.x + W / 2 - m.facing! * 30, y: m.pos.y + H - 4 }, vel: { x: -m.facing! * (1 + Math.random() * 3), y: -Math.random() * 2 }, life: 20, color: Math.random() > 0.5 ? '#78716C' : '#44403C', size: 4 + Math.random() * 4 });
};

/** Where he can be touched right now: all of him standing, low along the ground mid-slide, his top half on the way up. */
const bodyBox = (m: Enemy) =>
  m.aiState === 'slide' ? { x: m.pos.x - 10, y: m.pos.y + H - 40, w: W + 20, h: 40 }
  : m.aiState === 'tripped' ? { x: m.pos.x - 20, y: m.pos.y + H - 30, w: W + 40, h: 30 }
  : { x: m.pos.x + 6, y: m.pos.y + 4, w: W - 12, h: H - 4 };

/** Bumping into him: what you're doing against what he's doing. */
const touch = (ctx: FrameContext, m: Enemy, fight: DoormanFight) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (fight.touchCd > 0 || state.deathTimer > 0 || !rectsOverlap(bodyBox(m), boundsOf(p))) return;
  const pCharge = p.isCharging && !p.isSliding, pSlide = !!p.isSliding, pDive = !!p.isDivekicking, pUp = !!p.isUppercutting;
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  const away = (px < mx ? -1 : 1);
  const endMoves = () => { p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.recoiling = false; p.lockTimer = 0; };
  const call = (text: string, color: string) => { fight.lastCall = text; fx.spawnDamageNumber({ x: px - 40, y: p.pos.y - 34 }, text, true, color); };
  const youHit = (dmg: number, kb: { x: number; y: number }, source: string, text: string) => {
    if (p.invincibilityTimer > 0) return;
    endMoves();
    hurtPlayer(ctx, dmg, source, kb, 40);
    shakeScreen(state, 12, 6);
    call(text, '#F87171');
  };
  fight.touchCd = 18;
  switch (m.aiState) {
    case 'charge':
      if (pCharge) { startClash(ctx, fight, m, 'shoulder'); return; }
      if (pSlide || pDive) {
        // Took his legs out from under him / stomped him mid-charge
        endMoves();
        if (pDive) { p.vel.y = -9; p.vel.x = -m.facing! * 4; }
        trip(ctx, m, fight, pDive ? DIVE_TRIP : SLIDE_TRIP, pDive ? 'STOMPED!' : 'TRIPPED!');
        return;
      }
      youHit(HIT_CHARGE, { x: m.facing! * 13, y: -8 }, 'doorman_charge', 'BOUNCED!');
      start(m, 'recover');
      return;
    case 'slide':
      if (pSlide) { startClash(ctx, fight, m, 'slide'); return; }
      if (pDive) {
        endMoves(); p.vel.y = -10;
        trip(ctx, m, fight, DIVE_TRIP, 'STOMPED!');
        return;
      }
      if (pCharge) {
        // He takes your legs out
        youHit(TRIP_YOU, { x: m.facing! * 4, y: -11 }, 'doorman_slide', 'SWEPT!');
        state.playerStunTimer = 40;
        return;
      }
      youHit(HIT_SLIDE, { x: m.facing! * 5, y: -12 }, 'doorman_slide', 'SWEPT!');
      return;
    case 'uppercut':
      youHit(HIT_UPPERCUT, { x: away * 6, y: -20 }, 'doorman_uppercut', 'DENIED!');
      return;
    case 'tripped':
      // He's down: specials land properly
      if (pCharge || pSlide || pDive || pUp) {
        endMoves(); p.vel.x = away * 6; p.vel.y = -6;
        damage(ctx, m, fight, 45);
        call('KICKED WHILE DOWN!', '#FACC15');
      }
      return;
    default:
      if (pCharge || pSlide || pDive || pUp) {
        // Not attacking: barely a scratch, and he shoves you off
        endMoves();
        damage(ctx, m, fight, SCRATCH);
        p.vel.x = away * 12; p.vel.y = -7; p.lockTimer = 16;
        start(m, 'shove'); m.facing = (-away) as 1 | -1;
        call('SHOVED!', '#94A3B8');
        talk(fight, ["HANDS OFF.", "NICE TRY.", "DON'T TOUCH ME."], true);
        return;
      }
      if (p.invincibilityTimer <= 0) { hurtPlayer(ctx, SHOVE, 'doorman', { x: away * 8, y: -5 }); fight.touchCd = 30; }
  }
};

const damage = (ctx: FrameContext, m: Enemy, fight: DoormanFight, dmg: number) => {
  m.health -= dmg;
  m.hitFlash = 6;
  fight.hpFlash = 10;
  ctx.fx.spawnDamageNumber({ x: m.pos.x + W / 2, y: m.pos.y - 10 }, Math.round(dmg), dmg >= 60);
  for (let i = 0; i < Math.min(12, dmg / 8); i++) ctx.state.particles.push({ pos: { x: m.pos.x + W / 2, y: m.pos.y + 30 }, vel: { x: (Math.random() - 0.5) * 8, y: -Math.random() * 6 }, life: 40, color: '#8B0000', size: 3 + Math.random() * 3 });
};

const trip = (ctx: FrameContext, m: Enemy, fight: DoormanFight, dmg: number, text: string) => {
  damage(ctx, m, fight, dmg);
  start(m, 'tripped');
  m.vel.x = m.facing! * 4;
  shakeScreen(ctx.state, 18, 8);
  playSound('nuke');
  fight.lastCall = text;
  ctx.fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 40, y: m.pos.y - 40 }, text, true, '#FACC15');
};

// ---------------------------------------------------------------------------
// The clashes
// ---------------------------------------------------------------------------

const SHOULDER_FRAMES = 170, SLIDE_FRAMES_CLASH = 300;

const startClash = (ctx: FrameContext, fight: DoormanFight, m: Enemy, kind: ClashKind) => {
  const p = ctx.state.player;
  fight.clash = { kind, t: 0, meter: kind === 'shoulder' ? 0.5 : 0, hits: 0, flash: 0, missed: false };
  // Locked together, face to face
  const side = p.pos.x + p.width / 2 < m.pos.x + W / 2 ? -1 : 1;
  p.facing = (-side) as 1 | -1;
  m.facing = side as 1 | -1;
  p.pos.x = side < 0 ? m.pos.x - p.width + (kind === 'slide' ? -20 : 12) : m.pos.x + W - (kind === 'slide' ? -20 : 12);
  p.vel = { x: 0, y: 0 };
  m.vel = { x: 0, y: 0 };
  start(m, kind === 'shoulder' ? 'clash-shoulder' : 'clash-slide');
  shakeScreen(ctx.state, 16, 8);
  playSound('nuke');
  talk(fight, LINES.clash, true);
};

const runClash = (ctx: FrameContext, fight: DoormanFight, m: Enemy, pressed: boolean) => {
  const { state } = ctx;
  const p = state.player;
  const c = fight.clash!;
  c.t++;
  if (c.flash > 0) c.flash--;
  p.vel = { x: 0, y: 0 };
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  const angry = m.health < m.maxHealth * 0.5;
  if (c.kind === 'shoulder') {
    // Tug of war: mash it
    if (pressed) { c.meter += 0.075; c.flash = 4; }
    c.meter -= angry ? 0.0075 : 0.0062;
    if (state.frame % 5 === 0) shakeScreen(state, 4, 3);
    if (c.meter >= 1) return endClash(ctx, fight, m, true);
    if (c.meter <= 0 || c.t > SHOULDER_FRAMES) return endClash(ctx, fight, m, false);
  } else {
    // A marker sweeping back and forth: press it in the zone, three times
    const period = angry ? 46 : 56;
    const k = (c.t % (period * 2)) / period;
    c.meter = k < 1 ? k : 2 - k;
    if (pressed) {
      if (Math.abs(c.meter - 0.5) < SLIDE_ZONE / 2) { c.hits++; c.flash = 12; c.missed = false; playSound('taser'); if (c.hits >= 3) return endClash(ctx, fight, m, true); }
      else { c.missed = true; c.flash = 12; return endClash(ctx, fight, m, false); }
    }
    if (c.t > SLIDE_FRAMES_CLASH) return endClash(ctx, fight, m, false);
  }
};

/** How wide the slide clash's zone is (as a share of the bar). */
export const SLIDE_ZONE = 0.2;

const endClash = (ctx: FrameContext, fight: DoormanFight, m: Enemy, won: boolean) => {
  const { state } = ctx;
  const p = state.player;
  const kind = fight.clash!.kind;
  fight.clash = null;
  fight.touchCd = 30;
  const dir = m.facing === 1 ? -1 : 1; // (which way's away from him, for you)
  if (won) {
    damage(ctx, m, fight, CLASH_WIN);
    start(m, 'tripped');
    m.vel.x = -dir * 9;
    p.vel = { x: -dir * 2, y: -4 };
    fight.lastCall = kind === 'shoulder' ? 'OVERPOWERED!' : 'SWEPT HIM!';
    ctx.fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 50, y: m.pos.y - 50 }, fight.lastCall, true, '#22C55E');
    shakeScreen(state, 26, 10);
    ctx.fx.speakVulgarity('charge_kill');
  } else {
    start(m, 'recover');
    p.invincibilityTimer = 0;
    hurtPlayer(ctx, CLASH_LOSE, 'doorman_clash', { x: dir * 14, y: -10 }, 40);
    state.playerStunTimer = 30;
    fight.lastCall = 'LOST THE CLASH!';
    ctx.fx.spawnDamageNumber({ x: p.pos.x - 40, y: p.pos.y - 40 }, fight.lastCall, true, '#F87171');
    shakeScreen(state, 18, 8);
    talk(fight, LINES.win, true);
  }
};

// ---------------------------------------------------------------------------

/** A player projectile hit him: it barely registers (a bit more with him on the floor). No status effects, no invincibility. */
export const hitDoorman = (ctx: FrameContext, m: Enemy, p: Projectile, fight: DoormanFight): boolean => {
  if (fight.phase !== 'fight' || fight.clash) return true;
  let dmg = p.damage;
  if (p.isBoulder) dmg = BOULDER_DAMAGE_PER_SPEED * Math.max(1, Math.hypot(p.vel.x, p.vel.y) / GML_SCALE) * 0.8;
  if (p.isSludge) dmg = p.isLingering ? 0 : 20;
  dmg *= m.aiState === 'tripped' ? BULLET_SCALE_DOWN : BULLET_SCALE;
  if (dmg <= 0) return true;
  m.health -= dmg;
  m.hitFlash = 4;
  fight.hpFlash = 6;
  ctx.fx.spawnDamageNumber({ x: p.pos.x, y: p.pos.y - 10 }, Math.max(1, Math.round(dmg)));
  // Mostly it just bounces off him
  for (let i = 0; i < 2; i++) ctx.state.particles.push({ pos: { x: p.pos.x, y: p.pos.y }, vel: { x: -Math.sign(p.vel.x || 1) * (1 + Math.random() * 4), y: -Math.random() * 4 }, life: 20, color: i ? '#FDE047' : '#8B0000', size: 2 + Math.random() * 2 });
  if (Math.random() < 0.02) talk(fight, ["THAT TICKLES.", "YOU DONE?"]);
  return true;
};

const killDoorman = (ctx: FrameContext, m: Enemy, fight: DoormanFight) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  fight.phase = 'dead';
  fight.clash = null;
  fight.corpse = { x: m.pos.x + W / 2, y: arena().y, facing: m.facing || -1, weapon, t0: state.frame };
  fight.man = null;
  state.stageMemo.doormanWeapon = weapon;
  fx.spawnDeathShower({ x: m.pos.x + W / 2, y: m.pos.y + H / 2 }, 0, 3, true, 120);
  shakeScreen(state, 30, 9);
  fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 70, y: m.pos.y - 40 }, 'YOU\'RE ON THE LIST NOW!', true, '#FACC15');
  fx.speakVulgarity(weapon === 'FLAMETHROWER' ? 'flamethrower_kill' : weapon === 'SHOTGUN' ? 'shotgun_kill' : weapon === 'BOULDER' ? 'boulder_kill' : weapon === 'TSUNAMI' ? 'tsunami_kill' : weapon === 'TASER' ? 'taser_kill' : weapon === 'NEEDLES' ? 'dart_kill' : weapon === 'SLUDGE' ? 'sludge_kill' : weapon === 'OIL_ROCKET' ? 'oil_kill' : 'gun_kill');
  state.blocks = state.blocks.filter(b => !fight.walls.includes(b));
  state.cameraOverride = null;
  state.player.killSatisfactionTimer = 90;
};
