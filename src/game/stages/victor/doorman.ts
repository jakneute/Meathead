// The doorman of Club Caldera: the mid-boss at the foot of the volcano. A big,
// meaty man like you, who wants to see some ID and proof of membership, and
// isn't letting you in without them.
//
// He walks you down (forward and back, always facing you) and does your moves
// back at you: the shoulder charge, the slide tackle, the uppercut (he never
// jumps, so no dive kick). Bullets barely bother him. The way to hurt him is to
// meet him head on, the same move as his:
//   your shoulder charge into his: a clash, locked shoulder to shoulder (mash it)
//   your slide into his slide: a clash, feet to feet (time your presses)
//   anything else into one of his (the wrong move, a dive kick, an uppercut):
//     he goes straight through you, and you're wrecked
//   jumping over him: he uppercuts you out of the air (unless he's mid charge or slide)
//   charging into him when he isn't attacking: barely a scratch, and he shoves you off
// Winning a clash is how he goes down. Like every mid-boss: no
// invincibility between hits, lots of health, no status effects; how he dies
// decides what's left of him.

import type { Block, Enemy, Projectile, WeaponType } from '../../../types';
import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { shakeScreen } from '../../core/state';
import { rectsOverlap, boundsOf } from '../../core/utils';
import { hurtPlayer } from '../../bosses/shared';
import { playSound } from '../../platform/audio';
import { say, isSpeaking, Voice, MEATHEAD_VOICE } from '../../platform/speech';
import { midBossProjectileDamage, DOORMAN_RESIST } from '../../combat/midBoss';
import { KIND_STATS } from '../../enemies/kinds';
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
/** (finisher: killed by winning a clash, which leaves him its own way) */
export interface DoormanCorpse { x: number; y: number; facing: 1 | -1; weapon: WeaponType; t0: number; finisher?: ClashKind }
export interface DoormanFight {
  /**
   * Times he's smacked Meathead around; the hint Meathead's about to shout (line by line) and when the next line's
   * due; the last line said and when; how many hints so far (they get angrier); which spelled-out one's next.
   */
  smacks?: number;
  hintQueue?: string[];
  hintAt?: number;
  lastHint?: string;
  hintSaidAt?: number;
  hintsGiven?: number;
  fourthWall?: number;
  /** When the hint line he's saying started (unset once it's finished), and how long it is. */
  hintSpeakingSince?: number;
  hintLen?: number;
  /** With no voice: till when the line's up to be read (his other chatter holds off). */
  hintQuietUntil?: number;
  /** How many hints in he last grudgingly commended you (so it's once per bout of yelling). */
  commendedAt?: number;
  /** His runs Meathead's got out of the way of; whether the current run's found him; his state last frame. */
  dodges?: number;
  dashTouched?: boolean;
  prevAi?: string;
  phase: 'waiting' | 'intro' | 'fight' | 'dead';
  t: number;
  man: Enemy | null;
  walls: Block[];
  corpse: DoormanCorpse | null;
  hpFlash: number;
  clash: Clash | null;
  /** The clash buttons as they were last frame (to catch presses). */
  buttonsWas: Record<string, boolean>;
  /** A breather after any collision with him, so one bump isn't counted twice. */
  touchCd: number;
  /** What he's saying (only while it's being said), and a pause before the next line. */
  line: string;
  lineT: number;
  talkCd: number;
  /** The last thing that happened, for the callout. */
  lastCall: string;
  /** How far the camera's pushed in for a clash (0..1, eased), where on, and frames since the clash began. */
  zoom: number;
  zoomAt: { x: number; y: number };
  clashT: number;
  /** He's thrown you: the speed you're sailing across at, and for how long. */
  thrown: { vx: number; t: number } | null;
  /** Just out of a clash: frames your controls stay locked, then the buttons you were still mashing are ignored till you let go. */
  lockT: number;
  ignoring: Set<keyof Controls>;
}

const arena = () => COURSE.club;
/** How he was left last time (a weapon, or a clash). */
const memoCorpse = (m?: string): { weapon: WeaponType; finisher?: ClashKind } => m === 'clash-shoulder' ? { weapon: 'GUN', finisher: 'shoulder' } : m === 'clash-slide' ? { weapon: 'GUN', finisher: 'slide' } : { weapon: (m as WeaponType) || 'GUN' };
const DOORMAN_VOICE: Voice = { pitch: 0.35, rate: 0.9 };

export const createDoormanFight = (state: GameState, startedAt: number): DoormanFight => {
  const a = arena();
  const dead = startedAt > CP.CLUB;
  return {
    phase: dead ? 'dead' : 'waiting', t: 0, man: null, hpFlash: 0, clash: null, buttonsWas: {}, touchCd: 0,
    line: '', lineT: 0, talkCd: 60, lastCall: '', zoom: 0, zoomAt: { x: 0, y: 0 }, clashT: 0, thrown: null, lockT: 0, ignoring: new Set(),
    walls: [
      { x: a.x1 - 40, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'club-wall' },
      { x: a.x2, y: a.y - 900, w: 40, h: 900, type: 'wall', hidden: true, tag: 'club-wall' },
    ],
    corpse: dead ? { x: a.x2 - 300, y: a.y, facing: -1, t0: -600, ...memoCorpse(state.stageMemo.doormanWeapon as string | undefined) } : null,
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
  // (never over the top of Meathead in the middle of one of his hints: it waits its turn)
  const priority = force ? (fight.hintSpeakingSince !== undefined || fight.hintQueue?.length ? 'queue' : 'urgent') : 'casual';
  const shown = say(text, DOORMAN_VOICE, priority, {
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
  if (fight.phase === 'fight') { watchDodges(state, fight); sayHint(state, fight); }
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
  // He's down: the shot stays put on the club while you're in front of it (no swinging back to you and panning off again)
  else if (fight.phase === 'dead' && player.pos.x > COURSE.checkpoints[CP.CLUB].x - 100 && player.pos.x < a.x2 + 200) state.cameraOverride = { x: a.x1 - 10, y: a.y - 550 };
  else if (fight.phase === 'dead' && state.cameraOverride?.x === a.x1 - 10) state.cameraOverride = null;
  if (fight.phase === 'intro' && fight.t > 80) { fight.phase = 'fight'; if (fight.man) { fight.man.aiState = 'stalk'; fight.man.aiTimer = 0; } }
  // A clash: it takes the special button
  // A clash takes either mouse button, or any of A B X Y on a pad (each counts on its own, so mashing two in turn works)
  const keys: (keyof Controls)[] = ['jump', 'special', 'shoot'];
  const pressed = keys.some(k => controls[k] && !fight.buttonsWas[k]);
  for (const k of ['up', 'left', 'down', 'right', 'special', 'jump', 'shoot'] as (keyof Controls)[]) fight.buttonsWas[k] = controls[k];
  // Thrown clean across the club
  if (fight.thrown) {
    player.vel.x = fight.thrown.vx;
    if (--fight.thrown.t <= 0 || (player.isGrounded && fight.thrown.t < 36)) fight.thrown = null;
  }
  // The camera pushes in on a clash, and eases back out after
  // (and stays pushed in, following him, while he flies to his death after a clash)
  const flying = fight.man && (fight.man.aiState === 'launched' || fight.man.aiState === 'spun');
  fight.zoom += ((fight.clash ? 1 : flying ? 0.45 : 0) - fight.zoom) * (fight.clash ? 0.18 : 0.1);
  if (flying) { const fm = fight.man!; fight.zoomAt = { x: fm.pos.x + fm.width / 2, y: Math.min(a.y - 120, fm.pos.y + fm.height / 2) }; }
  if (fight.clash && fight.man) {
    fight.clashT++;
    const m = fight.man;
    fight.zoomAt = { x: (player.pos.x + player.width / 2 + m.pos.x + m.width / 2) / 2, y: m.pos.y + m.height - (fight.clash.kind === 'slide' ? 30 : 60) };
    // Sparks where they meet
    if (state.frame % 2 === 0) for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: fight.zoomAt.x, y: fight.zoomAt.y + (Math.random() - 0.5) * 30 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 5 }, life: 16, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2 + Math.random() * 2 });
    runClash(ctx, fight, m, pressed);
    return { ...NO_CONTROLS };
  }
  fight.clashT = 0;
  // Just out of a clash: hands off for a moment, then nothing you're still mashing counts till you let go of it
  if (fight.lockT > 0) {
    fight.lockT--;
    if (fight.lockT === 0) for (const k of ACTION_KEYS) if (controls[k]) fight.ignoring.add(k);
    return { ...NO_CONTROLS };
  }
  if (fight.ignoring.size) {
    const out = { ...controls };
    for (const k of [...fight.ignoring]) { if (controls[k]) out[k] = false as never; else fight.ignoring.delete(k); }
    return out;
  }
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
/** Damage to him: winning a clash, and bumping into him when he's not attacking. */
const CLASH_WIN = 170, SCRATCH = 12;
/** Damage to you: his charge, his slide, his uppercut, losing a clash, tripping on his slide, a shove. */
const HIT_CHARGE = 16, HIT_SLIDE = 14, HIT_UPPERCUT = 20, CLASH_LOSE = 24, SHOVE = 5;
/** On top, for meeting one of his moves with the wrong one of yours. */
const WRECK_EXTRA = 8;
/** Once he's down he's more open (the usual share's DOORMAN_RESIST: see combat/midBoss.ts). */
const BULLET_SCALE_DOWN = 0.4;

export const isAttacking = (m: Enemy) => m.aiState === 'charge' || m.aiState === 'slide' || m.aiState === 'uppercut';

export const updateDoorman = (ctx: FrameContext, m: Enemy, fight: DoormanFight): boolean => {
  const { state } = ctx;
  const p = state.player;
  const a = arena();
  // Nothing takes: no freezing, burning, oil, needles, tasing
  m.frozenTimer = 0; m.pauseTimer = 0; m.isOnFire = false; m.fireTimer = 0; m.isOiled = false; m.oiledTimer = 0;
  m.sludgeTimer = 0; m.needleCount = 0; m.needleOffsets = []; m.dotTimer = 0; m.isTased = false;
  if (m.hitFlash && m.hitFlash > 0) m.hitFlash--;
  // Finished off in a clash: he flies first, and it's the landing that does it
  if (m.aiState === 'launched' || m.aiState === 'spun') {
    m.aiTimer = (m.aiTimer || 0) + 1;
    m.vel.y += FINISH_GRAVITY;
    m.pos.x = Math.max(a.x1 + 2, Math.min(a.x2 - W - 2, m.pos.x + m.vel.x));
    m.pos.y += m.vel.y;
    if (m.aiTimer > 6 && m.pos.y >= a.y - H) { m.pos.y = a.y - H; killDoorman(ctx, m, fight, m.aiState === 'launched' ? 'shoulder' : 'slide'); return false; }
    return true;
  }
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
      if ((!fight.thrown && antiAir(m, p, px, mx))) break;
      if (m.aiTimer > (angry ? 70 : 110) && fight.phase === 'fight') { start(m, Math.random() < 0.55 ? 'windup-charge' : 'windup-slide'); playSound('taser'); }
      break;
    }
    case 'windup-charge':
      // Shoulder down, pawing the ground (the tell). (Only once he's actually charging or sliding can you get over him)
      if ((!fight.thrown && antiAir(m, p, px, mx))) break;
      m.vel.x = 0; m.facing = toward;
      if (m.aiTimer > WINDUP_CHARGE) { start(m, 'charge'); m.vel.x = m.facing * CHARGE; talk(fight, ["MOVE!"], false); }
      break;
    case 'windup-slide':
      if ((!fight.thrown && antiAir(m, p, px, mx))) break;
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
      // Up off the ground to meet you (however high you went), fist first, and back down
      m.vel.x = m.aiTimer < 16 ? toward * 5 : 0;
      m.vel.y += 0.65;
      if (m.aiTimer > UPPERCUT_FRAMES && m.pos.y >= floor) start(m, 'recover');
      break;
    case 'tripped':
      // Flat on his back: your chance
      m.vel.x *= 0.9;
      if (m.aiTimer > TRIPPED) { start(m, 'recover'); talk(fight, LINES.hurt, true); }
      break;
    case 'thrown':
      // Sailing over you; down on his back when he lands
      if (m.aiTimer > 4 && m.pos.y >= floor) { start(m, 'tripped'); m.vel.x = 0; shakeScreen(state, 22, 9); playSound('nuke'); dust(state, m); dust(state, m); }
      break;
    case 'shove':
      m.vel.x *= 0.7;
      if (m.aiTimer > 20) start(m, 'stalk');
      break;
    case 'recover':
    default:
      m.vel.x *= 0.8;
      m.facing = toward;
      if (m.aiTimer > 8 && (!fight.thrown && antiAir(m, p, px, mx))) break;
      if (m.aiTimer > RECOVER) start(m, 'stalk');
      break;
  }
  m.pos.x += m.vel.x;
  m.pos.x = Math.max(a.x1 + 2, Math.min(a.x2 - W - 2, m.pos.x));
  if (m.aiState === 'uppercut' || m.aiState === 'thrown' || m.pos.y < floor) { m.vel.y += m.aiState === 'thrown' ? 0.65 : 0; m.pos.y += m.vel.y; if (m.pos.y >= floor) { m.pos.y = floor; m.vel.y = 0; } }
  else m.pos.y = floor;
  if (fight.phase === 'fight') touch(ctx, m, fight);
  return true;
};

const start = (m: Enemy, state: string) => { m.aiState = state; m.aiTimer = 0; };

/**
 * You're coming over the top (a jump, an uppercut, a dash, however high): he goes up to meet you.
 * He never jumps, except for this: an uppercut timed to get to where you're going.
 */
const antiAir = (m: Enemy, p: GameState['player'], px: number, mx: number) => {
  if (p.isGrounded || Math.abs(px - mx) > 170 || p.pos.y + p.height > m.pos.y + 40) return false;
  start(m, 'uppercut');
  // (to where you're going to be, not where you are)
  const rise = Math.max(40, m.pos.y - p.pos.y + 20 + Math.max(0, -p.vel.y) * 7);
  m.vel.y = -Math.min(28, Math.sqrt(2 * 0.65 * rise));
  return true;
};

const dust = (state: GameState, m: Enemy) => {
  state.particles.push({ pos: { x: m.pos.x + W / 2 - m.facing! * 30, y: m.pos.y + H - 4 }, vel: { x: -m.facing! * (1 + Math.random() * 3), y: -Math.random() * 2 }, life: 20, color: Math.random() > 0.5 ? '#78716C' : '#44403C', size: 4 + Math.random() * 4 });
};

/** Where he can be touched right now: all of him standing, low along the ground mid-slide, his top half on the way up. */
const bodyBox = (m: Enemy) =>
  m.aiState === 'slide' ? { x: m.pos.x - 10, y: m.pos.y + H - 40, w: W + 20, h: 40 }
  : m.aiState === 'tripped' ? { x: m.pos.x - 20, y: m.pos.y + H - 30, w: W + 40, h: 30 }
  : m.aiState === 'uppercut' ? { x: m.pos.x - 12, y: m.pos.y - 44, w: W + 24, h: H + 44 }
  : { x: m.pos.x + 6, y: m.pos.y + 4, w: W - 12, h: H - 4 };

// ---------------------------------------------------------------------------
// Meathead working it out the hard way. After the doorman's smacked him around a couple of times (or he's spent
// a couple of the doorman's runs just getting out of the way), a hint, the way he'd put it: at himself, furious.
// Picked by what just happened, never the same line twice running, and angrier each time. By the fourth he's
// given up on subtle and turns round to spell it out to whoever's holding the controls, buttons and all.
// ---------------------------------------------------------------------------

type HintKind = 'hit' | 'wrong' | 'clash' | 'dodge';
/** First go: blunt. */
const CALM: Record<HintKind, string[]> = {
  hit: [
    "HE CHARGES, I CHARGE! SHOULDER TO SHOULDER, YOU IDIOT!",
    "HE SLIDES, I SLIDE! SAME MOVE, SAME TIME! THROUGH THE SLAB!",
    "BULLETS DO NOTHING TO THIS WALK-IN FRIDGE! MEET HIM HEAD ON!",
  ],
  wrong: [
    "WRONG MOVE AND HE FOLDS ME LIKE A LAWN CHAIR! MATCH HIM, DUMMY!",
    "CHARGE MEETS CHARGE! SLIDE MEETS SLIDE! IT'S NOT ROCKET SCIENCE!",
  ],
  clash: [
    "WHEN WE LOCK UP, MASH! MASH LIKE MY PROTEIN DEPENDS ON IT!",
    "HE OUT-MUSCLED ME?! MASH HARDER! HARDER THAN LEG DAY!",
  ],
  dodge: [
    "QUIT DANCING AROUND THE BIG IDIOT! HE CHARGES? CHARGE RIGHT BACK!",
    "DODGING WON'T GET ME IN THE CLUB! MEET HIS SLIDE WITH A SLIDE!",
    "I DIDN'T COME HERE TO PLAY TAG! SAME MOVE AS HIM, IN HIS FACE!",
  ],
};
/** Third go: losing it. */
const HEATED: Record<HintKind, string[]> = {
  hit: ["ARE YOU KIDDING ME?! SAME! MOVE! AS! HIM! HOW MANY TIMES?!"],
  wrong: ["I SAID MATCH HIM! CHARGE FOR CHARGE! SLIDE FOR SLIDE! UGH!"],
  clash: ["MASH! MASH! MASH! ARE THESE ARMS MADE OF NOODLES?!"],
  dodge: ["STOP HOPPING OVER HIM LIKE A SCARED GAZELLE! HIT HIM BACK!"],
};
/**
 * Fourth go and on: turned round to talk straight to the player. The moves spelled right out, but not the buttons:
 * he's got no idea what they're holding over there, and it shows.
 */
const FOURTH_WALL: string[][] = [
  ["HEY. YOU. YEAH, YOU, WITH THE PLASTIC DOOHICKEY.", "HE CHARGES? I CHARGE. HE SLIDES? I SLIDE. SAME MOVE!", "THEN WE LOCK UP AND YOU MASH WHATEVER THAT THING HAS ON IT!"],
  ["OKAY, PLAYER. I'M DONE BEING SUBTLE.", "WHATEVER YOU'RE CLICKING, TAPPING OR SMACKING OVER THERE...", "MAKE ME DO WHAT HE DOES, WHEN HE DOES IT! NOT A JUMP!"],
  ["I CAN SEE YOU THROUGH THE SCREEN, CHAMP.", "SHOULDER FOR SHOULDER! LEGS FOR LEGS! THEN MASH EVERYTHING!", "IF THAT'S A TOASTER YOU'RE HOLDING, GET A REAL CONTROLLER!"],
];
/** How many smacks (or dodges) before the first hint, and between the ones after; the wait after a hit (the ow comes first). */
const SMACKS_FIRST = 2, SMACKS_EVERY = 2, DODGES_FIRST = 2, DODGES_EVERY = 2, HINT_DELAY = 70;
/** Never two hints closer together than this, and a line of a spelled-out hint waits this long after the one before. */
const HINT_GAP = 360;

const queueHint = (state: GameState, fight: DoormanFight, kind: HintKind, delay: number) => {
  if (fight.hintQueue?.length || hintTalking(state, fight) || state.frame - (fight.hintSaidAt ?? -1e9) < HINT_GAP) return;
  const n = fight.hintsGiven || 0;
  // (once he's spelled it out every way he knows how, he gives up talking and just suffers)
  if (n >= 3 + FOURTH_WALL.length) return;
  let lines: string[];
  if (n >= 3) {
    // Spelled out, straight down the camera
    lines = [...FOURTH_WALL[(fight.fourthWall || 0) % FOURTH_WALL.length]];
    fight.fourthWall = (fight.fourthWall || 0) + 1;
  } else {
    const pool = n === 2 ? HEATED[kind] : CALM[kind];
    const fresh = pool.filter(l => l !== fight.lastHint);
    lines = [fresh[Math.floor(Math.random() * fresh.length)] ?? pool[0]];
  }
  fight.hintsGiven = n + 1;
  fight.hintQueue = lines;
  fight.hintAt = state.frame + delay;
};

/**
 * The wrong move into one of his (a slide into his shoulder charge, a charge into his slide, a dive kick or an
 * uppercut into either): Meathead calls out exactly what he did wrong, there and then (it doesn't wait its turn
 * like the hints do, but it doesn't say the same thing twice running either).
 */
type MyMove = 'charge' | 'slide' | 'dive' | 'uppercut';
const WRONG_MOVE: Record<'charge' | 'slide', Record<MyMove, string[]>> = {
  charge: {
    charge: [],
    slide: ["I SLID INTO A SHOULDER CHARGE?! SHOULDER MEETS SHOULDER, GENIUS!", "LEG SWEEP ON A CHARGING FRIDGE! GREAT PLAN!"],
    dive: ["A DIVE KICK?! ON A CHARGING BULL?! SHOULDER HIM!"],
    uppercut: ["UPPERCUT A FREIGHT TRAIN? NO! SHOULDER! TO! SHOULDER!"],
  },
  slide: {
    slide: [],
    charge: ["HE WENT LOW AND I WENT HIGH! SLIDE FOR SLIDE, DUMMY!", "CHARGED STRAIGHT OVER HIS LEGS INTO THE FLOOR! SLIDE, IDIOT!"],
    dive: ["DIVE KICKED A GUY SLIDING ON THE FLOOR! BRILLIANT! SLIDE!"],
    uppercut: ["UPPERCUT THE GUY ON THE FLOOR?! GET DOWN THERE AND SLIDE!"],
  },
};
const WRONG_MOVE_GAP = 90;

/**
 * He's been yelling hints and it's finally sunk in (a clash: the same move as the doorman, at last). A commendation,
 * passive-aggressively; the more worked up he got first, the more of it there is. Once per bout of yelling.
 */
const COMMEND: string[][] = [
  // After a hint or two
  ["OH LOOK. IT LISTENS.", "WOW. THE SAME MOVE. WHAT A CONCEPT.", "SEE? NOBODY HAD TO GET HURT. WELL. I DID."],
  // After he lost it
  ["SEE? WAS THAT SO HARD? WAS IT? WAS IT REALLY?", "GOLD STAR. REALLY. SO PROUD. TOOK LONG ENOUGH.", "AMAZING. TRULY. I'LL TELL MY GRANDKIDS."],
  // After he had to turn round and spell it out
  ["OH, NOW WE FIGURE OUT THE DOOHICKEY. SLOW CLAP.", "CONGRATULATIONS, PLAYER. YOU DID THE ONE THING. I'M WEEPING.", "LOOK WHO READ THE MANUAL. ALL FOUR WORDS OF IT."],
];

const finallyListened = (state: GameState, fight: DoormanFight) => {
  const n = fight.hintsGiven || 0;
  if (n === 0 || (fight.commendedAt ?? -1) >= n) return;
  fight.commendedAt = n;
  const tier = COMMEND[(fight.fourthWall || 0) > 0 ? 2 : n >= 3 ? 1 : 0];
  // (the rest of any lecture he was partway through goes unsaid: he lets the line he's on finish, then this)
  fight.hintQueue = [tier[Math.floor(Math.random() * tier.length)]];
  if (fight.hintAt === undefined || fight.hintAt < state.frame) fight.hintAt = state.frame + 10;
};

const wrongMoveLine = (state: GameState, fight: DoormanFight, his: 'charge' | 'slide', mine: MyMove) => {
  const pool = WRONG_MOVE[his][mine];
  // (not over the top of a spelled-out hint he's partway through)
  if (!pool.length || fight.hintQueue?.length || hintTalking(state, fight) || state.frame - (fight.hintSaidAt ?? -1e9) < WRONG_MOVE_GAP) return;
  const fresh = pool.filter(l => l !== fight.lastHint);
  fight.hintQueue = [fresh[Math.floor(Math.random() * fresh.length)] ?? pool[0]];
  fight.hintAt = state.frame + 12;
};

const smacked = (state: GameState, fight: DoormanFight, kind: Exclude<HintKind, 'dodge'>) => {
  fight.smacks = (fight.smacks || 0) + 1;
  const n = fight.smacks;
  if (n >= SMACKS_FIRST && (n - SMACKS_FIRST) % SMACKS_EVERY === 0) queueHint(state, fight, kind, HINT_DELAY);
};

const isRun = (s?: string) => s === 'charge' || s === 'slide';

/** Watches his charges and slides: one that ends without finding Meathead (no hit, no clash) was a dodge. */
const watchDodges = (state: GameState, fight: DoormanFight) => {
  const ai = fight.man?.aiState;
  if (isRun(ai) && !isRun(fight.prevAi)) fight.dashTouched = false;
  if (isRun(fight.prevAi) && !isRun(ai) && !ai?.startsWith('clash') && !fight.dashTouched) {
    fight.dodges = (fight.dodges || 0) + 1;
    const n = fight.dodges;
    if (n >= DODGES_FIRST && (n - DODGES_FIRST) % DODGES_EVERY === 0) queueHint(state, fight, 'dodge', 20);
  }
  fight.prevAi = ai;
};

/** Says the next line of the hint that's due (over whatever ow he's still saying). */
const sayHint = (state: GameState, fight: DoormanFight) => {
  // (with no voice, the words on screen are the line: his ows and taunts hold off till it's been read)
  if (fight.hintQuietUntil !== undefined && state.frame >= fight.hintQuietUntil) { state.isMeatheadSpeaking = false; fight.hintQuietUntil = undefined; }
  // Every line's heard to the end: nothing of his cuts in till the one he's on is finished (and a breath after)
  if (hintTalking(state, fight)) return;
  if (!fight.hintQueue?.length || fight.hintAt === undefined || state.frame < fight.hintAt || state.deathTimer > 0) return;
  // (and if he's still mid-"ow" from the hit, or the doorman's mid-sentence, it lets them finish first: a couple of
  // seconds at most, then it cuts in)
  if (isSpeaking() && state.frame < fight.hintAt + HINT_WAIT_FOR_OTHERS) return;
  const text = fight.hintQueue.shift()!;
  fight.lastHint = text;
  fight.hintSaidAt = state.frame;
  fight.hintSpeakingSince = state.frame;
  fight.hintLen = text.length;
  // (with no voice to wait on, the words stay up long enough to read them)
  const readFor = HINT_READ_BASE + text.length * HINT_READ_PER_CHAR;
  fight.hintAt = state.frame + readFor + HINT_BREATH;
  let voiced = false;
  const shown = say(text, MEATHEAD_VOICE, 'urgent', {
    onShow: spoken => {
      voiced = spoken;
      state.playerLastVulgarity = text;
      state.playerVulgarityTimer = spoken ? 9999 : readFor;
      state.isMeatheadSpeaking = true;
      if (!spoken) { fight.hintSpeakingSince = undefined; fight.hintQuietUntil = state.frame + readFor; }
    },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
    onDone: () => {
      // (with no voice there's nothing to wait on: the reading time set above stands)
      if (!voiced) return;
      state.isMeatheadSpeaking = false;
      if (fight.lastHint !== text) return;
      fight.hintSpeakingSince = undefined;
      // (the next line a breath after this one's finished)
      if (fight.hintQueue?.length) fight.hintAt = state.frame + HINT_BREATH;
    },
  });
  if (!shown) {
    state.playerLastVulgarity = text; state.playerVulgarityTimer = readFor; fight.hintSpeakingSince = undefined;
    state.isMeatheadSpeaking = true; fight.hintQuietUntil = state.frame + readFor;
  }
};

/** Still saying a hint line (spoken lines are waited on till they finish; never forever, in case the voice drops it). */
const hintTalking = (state: GameState, fight: DoormanFight) => {
  if (fight.hintSpeakingSince === undefined) return false;
  if (state.frame - fight.hintSpeakingSince > HINT_READ_BASE + (fight.hintLen || 0) * HINT_SPEAK_MAX_PER_CHAR) { fight.hintSpeakingSince = undefined; return false; }
  return true;
};
/** Reading time for a line with no voice (frames), a pause between lines, and the longest a spoken line is waited on. */
const HINT_READ_BASE = 50, HINT_READ_PER_CHAR = 3.5, HINT_BREATH = 20, HINT_SPEAK_MAX_PER_CHAR = 9, HINT_WAIT_FOR_OTHERS = 150;

/** Bumping into him: what you're doing against what he's doing. */
const touch = (ctx: FrameContext, m: Enemy, fight: DoormanFight) => {
  const { state, fx } = ctx;
  const p = state.player;
  if (fight.touchCd > 0 || state.deathTimer > 0 || m.aiState === 'thrown' || !rectsOverlap(bodyBox(m), boundsOf(p))) return;
  // (this run of his didn't miss: it found him)
  fight.dashTouched = true;
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
    if (text !== 'WRECKED!') smacked(state, fight, 'hit');
  };
  // The wrong move into one of his: he goes right through you, and you're down a moment
  const wrecked = (dmg: number, kb: { x: number; y: number }, source: string) => {
    if (p.invincibilityTimer > 0) return;
    const mine: MyMove = pSlide ? 'slide' : pCharge ? 'charge' : pDive ? 'dive' : 'uppercut';
    youHit(dmg, kb, source, 'WRECKED!');
    // (straight away, what he did wrong, in so many words)
    wrongMoveLine(state, fight, source === 'doorman_slide' ? 'slide' : 'charge', mine);
    smacked(state, fight, 'wrong');
    state.playerStunTimer = 40;
    shakeScreen(state, 20, 9);
  };
  fight.touchCd = 18;
  switch (m.aiState) {
    case 'charge':
      // Only a charge meets a charge (a clash); anything else and he goes straight through you
      if (pCharge) { startClash(ctx, fight, m, 'shoulder'); return; }
      if (pSlide || pDive || pUp) { wrecked(HIT_CHARGE + WRECK_EXTRA, { x: m.facing! * 15, y: -10 }, 'doorman_charge'); return; }
      youHit(HIT_CHARGE, { x: m.facing! * 13, y: -8 }, 'doorman_charge', 'BOUNCED!');
      start(m, 'recover');
      return;
    case 'slide':
      // Only a slide meets a slide (a clash); anything else and he takes your legs clean out
      if (pSlide) { startClash(ctx, fight, m, 'slide'); return; }
      if (pCharge || pDive || pUp) { wrecked(HIT_SLIDE + WRECK_EXTRA, { x: m.facing! * 5, y: -13 }, 'doorman_slide'); return; }
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


// ---------------------------------------------------------------------------
// The clashes
// ---------------------------------------------------------------------------

const SHOULDER_FRAMES = 170, SLIDE_FRAMES_CLASH = 300;
/** How long your controls stay locked after a clash. */
const CLASH_LOCK = 36;
const ACTION_KEYS: (keyof Controls)[] = ['jump', 'special', 'shoot', 'charge'];
/** Thrown after losing a clash: how long he's in the air, and how hard he goes up. */
const THROW_FRAMES = 44, THROW_LIFT = 14.3;
/** His last flight, after a clash that finishes him: floatier than a throw, so it plays out where you can see it. */
const FINISH_GRAVITY = 0.2;

const startClash = (ctx: FrameContext, fight: DoormanFight, m: Enemy, kind: ClashKind) => {
  const p = ctx.state.player;
  // Finally doing what he's been yelling about: he lets you know how he feels about that
  finallyListened(ctx.state, fight);
  fight.clash = { kind, t: 0, meter: kind === 'shoulder' ? 0.5 : 0, hits: 0, flash: 0, missed: false };
  // Locked together, face to face
  const side = p.pos.x + p.width / 2 < m.pos.x + W / 2 ? -1 : 1;
  p.facing = (-side) as 1 | -1;
  m.facing = side as 1 | -1;
  p.pos.x = side < 0 ? m.pos.x - p.width + (kind === 'slide' ? -30 : 2) : m.pos.x + W - (kind === 'slide' ? -30 : 2);
  p.vel = { x: 0, y: 0 };
  // (he's held there in his charge or slide, drawn by the stage, while it's on)
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false;
  p.hidden = true;
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
    if (pressed) { c.meter += 0.14; c.flash = 4; }
    c.meter -= angry ? 0.0038 : 0.003;
    if (state.frame % 5 === 0) shakeScreen(state, 4, 3);
    if (c.meter >= 1) return endClash(ctx, fight, m, true);
    if (c.meter <= 0 || c.t > SHOULDER_FRAMES) return endClash(ctx, fight, m, false);
  } else {
    // A marker sweeping back and forth: press it in the zone, three times. (A count of three first, so anyone
    // still mashing from the slide doesn't blow it before it's started)
    if (c.t <= SLIDE_COUNTDOWN) { c.meter = 0; return; }
    const period = angry ? 46 : 56;
    const tt = c.t - SLIDE_COUNTDOWN;
    const k = (tt % (period * 2)) / period;
    c.meter = k < 1 ? k : 2 - k;
    if (pressed) {
      if (Math.abs(c.meter - 0.5) < SLIDE_ZONE / 2) { c.hits++; c.flash = 12; c.missed = false; playSound('taser'); if (c.hits >= 3) return endClash(ctx, fight, m, true); }
      else { c.missed = true; c.flash = 12; return endClash(ctx, fight, m, false); }
    }
    if (tt > SLIDE_FRAMES_CLASH) return endClash(ctx, fight, m, false);
  }
};

/** How wide the slide clash's zone is (as a share of the bar). */
export const SLIDE_ZONE = 0.2;
/** The slide clash's count of three before it takes your presses. */
export const SLIDE_COUNTDOWN = 90;

const endClash = (ctx: FrameContext, fight: DoormanFight, m: Enemy, won: boolean) => {
  const { state } = ctx;
  const p = state.player;
  const kind = fight.clash!.kind;
  fight.clash = null;
  fight.lockT = CLASH_LOCK;
  fight.touchCd = 30;
  p.hidden = false;
  const a = arena();
  const px = p.pos.x + p.width / 2, mx = m.pos.x + W / 2;
  if (won) {
    // You throw him: as far from you as the club goes (over your head, if that's the far end), down on his back
    damage(ctx, m, fight, CLASH_WIN);
    const leftEnd = a.x1 + 40, rightEnd = a.x2 - W - 40;
    const land = Math.abs(px - (leftEnd + W / 2)) > Math.abs(px - (rightEnd + W / 2)) ? leftEnd : rightEnd;
    const over = Math.sign(land - m.pos.x) || 1;
    if (m.health <= 0) {
      // That's him done: the shoulder sends him sky high (he comes down head first), the sweep sends him spinning.
      // (He hangs on to a sliver of health till he lands, so he's still there to watch on the way.)
      m.health = 1;
      start(m, kind === 'shoulder' ? 'launched' : 'spun');
      // (slow and floaty, so you get to watch it: a couple of seconds in the air)
      const lift = kind === 'shoulder' ? 13 : 9;
      const air = (2 * lift) / FINISH_GRAVITY;
      m.vel = { x: (land - m.pos.x) / air, y: -lift };
      talk(fight, ["NOOOOOOO!", "I'M GONNA NEED A MINUTE!"], true);
    } else {
      start(m, 'thrown');
      m.vel = { x: (land - m.pos.x) / THROW_FRAMES, y: -THROW_LIFT };
    }
    p.vel = { x: 0, y: -3 };
    p.facing = (over > 0 ? 1 : -1) as 1 | -1;
    fight.lastCall = kind === 'shoulder' ? 'OVERPOWERED!' : 'SWEPT HIM!';
    ctx.fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 50, y: m.pos.y - 50 }, fight.lastCall, true, '#22C55E');
    shakeScreen(state, 26, 10);
    ctx.fx.speakVulgarity('charge_kill');
  } else {
    // He throws you: as far from him as the club goes (over his head, if that's the far end)
    start(m, 'recover');
    p.invincibilityTimer = 0;
    const leftEnd = a.x1 + 40, rightEnd = a.x2 - p.width - 40;
    const land = Math.abs(mx - (leftEnd + p.width / 2)) > Math.abs(mx - (rightEnd + p.width / 2)) ? leftEnd : rightEnd;
    const vx = (land - p.pos.x) / 40;
    hurtPlayer(ctx, CLASH_LOSE, 'doorman_clash', { x: vx, y: -16 }, 44);
    smacked(state, fight, 'clash');
    fight.thrown = { vx, t: 44 };
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
  if (fight.phase !== 'fight' || fight.clash || m.aiState === 'launched' || m.aiState === 'spun') return true;
  // (he's built like a vault: a small slice of whatever it is)
  const dmg = midBossProjectileDamage(p) * (m.aiState === 'tripped' ? BULLET_SCALE_DOWN : DOORMAN_RESIST);
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

const killDoorman = (ctx: FrameContext, m: Enemy, fight: DoormanFight, finisher?: ClashKind) => {
  const { state, fx } = ctx;
  const weapon: WeaponType = state.player.currentWeapon;
  fight.phase = 'dead';
  fight.clash = null;
  fight.corpse = { x: m.pos.x + W / 2, y: arena().y, facing: m.facing || -1, weapon, t0: state.frame, finisher };
  if (finisher) {
    fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 60, y: m.pos.y - 70 }, finisher === 'shoulder' ? 'HEAD FIRST!' : 'SWEPT OFF HIS FEET!', true, '#22C55E');
    for (let i = 0; i < 16; i++) state.particles.push({ pos: { x: m.pos.x + W / 2, y: arena().y - 4 }, vel: { x: (Math.random() - 0.5) * 10, y: -Math.random() * 7 }, life: 30, color: i % 2 ? '#78716C' : '#A8A29E', size: 4 + Math.random() * 5 });
  }
  fight.man = null;
  state.stageMemo.doormanWeapon = finisher ? `clash-${finisher}` : weapon;
  fx.spawnDeathShower({ x: m.pos.x + W / 2, y: m.pos.y + H / 2 }, 0, 3, true, 120);
  shakeScreen(state, 30, 9);
  fx.spawnDamageNumber({ x: m.pos.x + W / 2 - 70, y: m.pos.y - 40 }, 'YOU\'RE ON THE LIST NOW!', true, '#FACC15');
  fx.speakVulgarity(weapon === 'FLAMETHROWER' ? 'flamethrower_kill' : weapon === 'SHOTGUN' ? 'shotgun_kill' : weapon === 'BOULDER' ? 'boulder_kill' : weapon === 'TSUNAMI' ? 'tsunami_kill' : weapon === 'TASER' ? 'taser_kill' : weapon === 'NEEDLES' ? 'dart_kill' : weapon === 'SLUDGE' ? 'sludge_kill' : weapon === 'OIL_ROCKET' ? 'oil_kill' : 'gun_kill');
  state.blocks = state.blocks.filter(b => !fight.walls.includes(b));
  state.cameraOverride = null;
  state.player.killSatisfactionTimer = 90;
};
