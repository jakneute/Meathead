// Victor Volcano: jumps, lands, then opens magma vents on a wall and the floor. Between times he barfs fire: a stream
// out of his mouth right across the arena, wall to wall, that swings round after you, slowly: get round the other
// side of him (over him) and it has to come all the way round to find you again.
// His weakness, the tsunami, turns the vents into steam (see bosses/hazards.ts).

import { Enemy, Projectile, Rect, Volcano } from '../../types';
import { ARENA_LEFT, ARENA_RIGHT, BOSS_DOOR_X, STAGE_WIDTH, PLAYER_PUSHBACK_VEL_X, PLAYER_PUSHBACK_VEL_Y } from '../../constants';
import { VICTOR_LINES } from '../../content/dialogue';
import type { FrameContext } from '../core/context';
import { pickRandom, rectsOverlap, boundsOf } from '../core/utils';
import { BossDef, FLOOR_Y, midX, hurtPlayer, speakAsBoss, bossPain } from './shared';
import { hitBoss } from './registry';
import { TSUNAMI_DAMAGE_BOSS, TSUNAMI_DAMAGE_WEAKNESS } from '../../constants';
import { startVolcanoFinale } from '../scenes/volcanoFinale';

const VICTOR = 'Victor Volcano';
/** A corked vent holds for this long, then blows (long enough to cork the other two of a set). */
export const CORK_FUSE = 270;
const CORK_BLAST_RADIUS = 180;
const CORK_BLAST_DAMAGE = 35;   // corking is a trap, not a strategy: standing near one when it blows really hurts

const TELEGRAPH_FRAMES = 60;
const ERUPTION_FRAMES = 130;
const REST_FRAMES = 40;
const VENT_MIN_GAP_FROM_VICTOR = 150;
const VENT_MIN_GAP = 100;

/**
 * The fire barf: how often he goes for it instead of a jump (when it's ready); the gurgling wind-up (no fire yet); how
 * long the stream goes for; how far it reaches (right across the arena: it stops at the walls and the floor); how fast
 * it swings round after you (radians a frame: slow, so getting round the other side of him buys you a while); what it
 * does; and how long before he can do it again.
 */
/** Room he has to leave between himself and either wall to barf, over and above Meathead's own width: enough for him
 * to stand behind Victor there, clear of him and the stream (backed right up against a wall, there'd be nowhere to go). */
const BARF_WALL_MARGIN = 28;
const BARF_CHANCE = 0.85, BARF_WINDUP = 45, BARF_FRAMES = 280, BARF_REACH = 900, BARF_TURN = 0.0085, BARF_DAMAGE = 12, BARF_COOLDOWN = 200;
/** How wide the stream is: at his mouth, and how much it spreads over its length. */
export const BARF_WIDTH = { base: 10, spread: 30 };
/**
 * Breathing fire, his head turns to where he's aiming it, as far as a neck goes: which way he faces for it, and how
 * far his head's tipped (up or down) from straight ahead. Null when he isn't.
 */
export const victorHeadTurn = (e: Enemy): { f: 1 | -1; rot: number } | null => {
  if (e.bossState !== 'barfing' || e.barfAngle === undefined) return null;
  const a = e.barfAngle;
  const f: 1 | -1 = Math.cos(a) < 0 ? -1 : 1;
  let rot = f === 1 ? a : a - Math.PI;
  while (rot > Math.PI) rot -= Math.PI * 2;
  while (rot < -Math.PI) rot += Math.PI * 2;
  return { f, rot: Math.max(-1, Math.min(1, rot)) };
};
/** His head's middle (in his 80x80 sprite), its scale, and his mouth below it (in the head's own units). */
const HEAD = { x: 40, y: 19, s: 1.35 }, MOUTH = { x: 0.5, y: 5.5 };
/** Where his mouth is (the stream comes out of it): wherever his head's turned to. */
export const victorMouth = (e: Enemy) => {
  const t = victorHeadTurn(e);
  let dx = MOUTH.x * (t?.f ?? 1), dy = MOUTH.y;
  if (t) { const c = Math.cos(t.rot), s = Math.sin(t.rot); [dx, dy] = [dx * c - dy * s, dx * s + dy * c]; }
  return { x: e.pos.x + (HEAD.x + dx * HEAD.s) * (e.width / 80), y: e.pos.y + (HEAD.y + dy * HEAD.s) * (e.height / 80) };
};

const update = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  // A wave that's been and gone having only washed over him: he's barely wet, and he lets you know it
  // The steam off a blown vent getting back to him: it's his own volcano, so it comes up through him
  if (boss.steamAt !== undefined && state.frame >= boss.steamAt) steamArrives(ctx, boss);
  if (boss.tsunamiWave === state.tsunamiSerial && !state.tsunamiActive && boss.steamAt === undefined && boss.rinsedWave !== state.tsunamiSerial && (boss.tsunamiPaid ?? 0) < TSUNAMI_DAMAGE_WEAKNESS && boss.health > 0) {
    boss.rinsedWave = state.tsunamiSerial;
    speakAsBoss(VICTOR, state.player.gut?.stage === 2 ? VICTOR_LINES.RINSED_SHAT : pickRandom(VICTOR_LINES.RINSED), helpers, 'casual');
  }
  switch (boss.bossState) {
    case 'pain':
      // (doubled over, put out; or hopping, scalded: then back to it)
      boss.vel.x = 0;
      // Put out: choking on it, a hacking cough every so often, smoke and water coming up out of him
      if (boss.painKind === 'doused' && boss.stateTimer! % COUGH_EVERY === 0 && boss.stateTimer! > 10) cough(ctx, boss);
      if (boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.painKind = undefined; boss.stateTimer = REST_FRAMES; }
      break;
    case 'attacking':
      // Vents erupting; rest once they've all gone quiet
      boss.vel.x = 0;
      if (state.bossVolcanoes.length === 0 && boss.stateTimer! <= 0) { boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; }
      break;
    case 'telegraphing':
      boss.vel.x = 0;
      // Counts the warnings down (the renderer builds them up as they near zero)
      state.bossVolcanoTelegraphs.forEach(t => { if (t.life > 0) t.life--; });
      if (boss.stateTimer! <= 0) {
        boss.bossState = 'attacking';
        boss.stateTimer = ERUPTION_FRAMES;
        state.bossVolcanoTelegraphs.forEach(t => helpers.addVolcano({ pos: t.pos, life: ERUPTION_FRAMES, type: t.type, setId: state.frame }));
        helpers.clearVolcanoTelegraphs();
      }
      break;
    case 'jumping':
      if (boss.isGroundedBoss) telegraphVents(ctx, boss);
      break;
    case 'barfing':
      barf(ctx, boss);
      break;
    default: {
      // Rested: the barf (when it's ready, about half the time), or up for the next jump and the vents
      if (boss.stateTimer! > 0) break;
      const room = state.player.width + BARF_WALL_MARGIN;
      const clear = boss.pos.x - ARENA_LEFT > room && ARENA_RIGHT - (boss.pos.x + boss.width) > room;
      if (boss.isGroundedBoss && clear && state.frame >= (boss.barfReadyAt ?? 0) && Math.random() < BARF_CHANCE) startBarf(ctx, boss);
      else jump(ctx, boss);
    }
  }
  if (boss.isGroundedBoss) boss.vel.x *= 0.95;
};

const BARF_LINES = ["FEEL THE HEAT, MEATHEAD!", "NOWHERE TO RUN, BRO!", "LAST CALL! IT'S ON FIRE!", "EVERYBODY OUT OF MY CLUB!"];

const startBarf = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.bossState = 'barfing';
  boss.barfT = 0; boss.barfLen = 0;
  const m = victorMouth(boss), p = state.player;
  boss.barfAngle = Math.atan2(p.pos.y + p.height / 2 - m.y, midX(p) - m.x);
  boss.vel.x = 0;
  if (Math.random() < 0.6) speakAsBoss(VICTOR, pickRandom(BARF_LINES), ctx.bossHelpers, 'casual');
};

/** The barf: a gurgle, then the stream, swinging round after him slowly; it hurts to be in it. */
const barf = (ctx: FrameContext, boss: Enemy) => {
  const { state, fx } = ctx;
  const p = state.player;
  boss.vel.x = 0;
  boss.barfT = (boss.barfT ?? 0) + 1;
  const t = boss.barfT, m = victorMouth(boss);
  // (the tidal wave coming through him puts it out: a hiss of steam, and he's done)
  const doused = state.tsunamiActive && Math.abs(state.tsunamiX - midX(boss)) < 120;
  if (t > BARF_WINDUP + BARF_FRAMES || doused) {
    if (doused) for (let i = 0; i < 12; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 40, color: '#E5E7EB', size: 6 + Math.random() * 6 });
    boss.bossState = 'idle'; boss.stateTimer = REST_FRAMES; boss.barfT = undefined; boss.barfLen = 0;
    boss.barfReadyAt = state.frame + BARF_COOLDOWN;
    // (put out mid-breath: the wave counts in full, and he chokes on it)
    if (doused) {
      boss.dousedWave = state.tsunamiSerial; topUpTsunami(ctx, boss);
      bossPain(ctx, boss, 'doused', DOUSED_FRAMES, 'DOUSED!', '#38BDF8'); fx.playGunSound('ignite', 0.6, -10);
      speakAsBoss(VICTOR, pickRandom(VICTOR_LINES.DOUSED), ctx.bossHelpers, 'casual');
    }
    return;
  }
  if (t < BARF_WINDUP) {
    // Gurgling: embers out of his mouth, the sound of it coming up
    if (t % 4 === 0) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: (Math.random() - 0.5) * 2, y: -Math.random() * 2 }, life: 16, color: Math.random() < 0.5 ? '#FF6D00' : '#FFD600', size: 2 + Math.random() * 3 });
    if (t === 1) fx.playGunSound('ignite');
    return;
  }
  // Swinging round after him, slowly
  const want = Math.atan2(p.pos.y + p.height / 2 - m.y, midX(p) - m.x);
  let d = want - (boss.barfAngle ?? 0);
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  boss.barfAngle = (boss.barfAngle ?? 0) + Math.max(-BARF_TURN, Math.min(BARF_TURN, d));
  // (it runs out to full reach, and back in at the end)
  const s = t - BARF_WINDUP;
  // (out across the room fast, stopping at a wall or the floor, and back in at the end)
  const a0 = boss.barfAngle!, cx = Math.cos(a0), cy = Math.sin(a0);
  const toWall = cx > 0.01 ? (ARENA_RIGHT - m.x) / cx : cx < -0.01 ? (ARENA_LEFT - m.x) / cx : Infinity;
  const toFloor = cy > 0.01 ? (FLOOR_Y - m.y) / cy : Infinity;
  const reach = Math.min(BARF_REACH, toWall, toFloor);
  boss.barfLen = reach * Math.min(1, s / 24, (BARF_FRAMES - s) / 16);
  if (s % 6 === 0) fx.playGunSound('flame');
  // In it: it burns
  const a = boss.barfAngle!, len = boss.barfLen;
  const ux = Math.cos(a), uy = Math.sin(a);
  const pts = [{ x: midX(p), y: p.pos.y + 8 }, { x: midX(p), y: p.pos.y + p.height / 2 }, { x: midX(p), y: p.pos.y + p.height - 8 }];
  const hit = pts.some(q => {
    const along = (q.x - m.x) * ux + (q.y - m.y) * uy;
    if (along < 0 || along > len) return false;
    const off = Math.abs((q.x - m.x) * -uy + (q.y - m.y) * ux);
    return off < (BARF_WIDTH.base + BARF_WIDTH.spread * (along / BARF_REACH)) * 0.8 + p.width / 2;
  });
  if (hit && p.invincibilityTimer <= 0 && state.deathTimer <= 0) {
    hurtPlayer(ctx, BARF_DAMAGE, 'victor_barf', { x: (midX(p) < midX(boss) ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
    p.sootTimer = Math.max(p.sootTimer ?? 0, 90); // (and he's blacked with it for a moment)
  }
  // (and it lights the room: a few sparks off it for the glow)
  if (s % 2 === 0) state.particles.push({ pos: { x: m.x + ux * len * Math.random(), y: m.y + uy * len * Math.random() }, vel: { x: ux * 2, y: uy * 2 - 1 }, life: 12, color: '#FFB300', size: 3 });
};

/** Just landed: mark a wall vent (alternating sides) and one or two floor vents. */
const telegraphVents = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const helpers = ctx.bossHelpers;
  boss.bossState = 'telegraphing';
  boss.stateTimer = TELEGRAPH_FRAMES;
  helpers.clearVolcanoTelegraphs();

  const side = (state.victorWallSide + 1) % 2;
  helpers.setVictorWallSide(side);
  helpers.addVolcanoTelegraph({ pos: { x: side === 0 ? BOSS_DOOR_X : STAGE_WIDTH, y: 250 + Math.random() * 200 }, life: TELEGRAPH_FRAMES, type: 'wall' });

  // More floor vents below half health, kept away from Victor and each other
  const healthPct = (boss.health / boss.maxHealth) * 100;
  const count = healthPct > 50 ? 1 : 2;
  const placed: number[] = [];
  for (let i = 0; i < count; i++) {
    let x = 0;
    for (let attempt = 0; attempt < 20; attempt++) {
      x = BOSS_DOOR_X + 150 + Math.random() * 500;
      if (Math.abs(x - midX(boss)) > VENT_MIN_GAP_FROM_VICTOR && placed.every(p => Math.abs(x - p) >= VENT_MIN_GAP)) break;
    }
    placed.push(x);
    helpers.addVolcanoTelegraph({ pos: { x: Math.max(BOSS_DOOR_X + 50, Math.min(ARENA_RIGHT - 60, x)), y: FLOOR_Y }, life: TELEGRAPH_FRAMES, type: 'ground' });
  }
};

/** Jumps for a platform if there is one, otherwise toward Meathead. */
const jump = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.vel.y = -20 - Math.random() * 5;
  const platforms = state.blocks.filter(b => b.type === 'platform' && b.x > BOSS_DOOR_X);
  if (platforms.length > 0) {
    const target = platforms[Math.floor(Math.random() * platforms.length)];
    boss.vel.x = (target.x + target.w / 2 - midX(boss)) * 0.04;
  } else {
    boss.vel.x = (state.player.pos.x < boss.pos.x ? -1 : 1) * 4 + (Math.random() - 0.5) * 2;
  }
  boss.bossState = 'jumping';
  boss.stateTimer = 60;
};

// ---------------------------------------------------------------------------
// Corking the vents with boulders
// ---------------------------------------------------------------------------

/** How far a vent's cone stands out of its floor or wall. */
const CONE_HEIGHT = 50;

/** The crater at the tip of a vent's cone, where its magma comes out (walls vents point out into the room). */
export const ventTip = (v: Volcano) => {
  if (v.type === 'ground') return { x: v.pos.x, y: FLOOR_Y - CONE_HEIGHT };
  const left = v.pos.x < (ARENA_LEFT + ARENA_RIGHT) / 2;
  return { x: left ? ARENA_LEFT + CONE_HEIGHT : ARENA_RIGHT - CONE_HEIGHT, y: v.pos.y };
};

/** Where a vent's cone sits (what a boulder has to hit to jam it). */
const ventBox = (v: Volcano): Rect => {
  if (v.type === 'ground') return { x: v.pos.x - 42, y: FLOOR_Y - 56, w: 84, h: 56 };
  const left = v.pos.x < (ARENA_LEFT + ARENA_RIGHT) / 2;
  return { x: left ? ARENA_LEFT : ARENA_RIGHT - 64, y: v.pos.y - 44, w: 64, h: 88 };
};

/**
 * One of Meathead's boulders jamming into an erupting vent: it stops spitting
 * magma, but only until the pressure blows the cork. Mostly a waste of a
 * boulder (and Victor says so)... unless it's the whole set, with him half dead.
 */
export const tryCorkVent = (ctx: FrameContext, p: Projectile): boolean => {
  const { state } = ctx;
  const box = boundsOf(p);
  const vent = state.bossVolcanoes.find(v => !v.corked && rectsOverlap(box, ventBox(v)));
  if (!vent) return false;
  vent.corked = true;
  vent.fuse = CORK_FUSE;
  // Sealed: it's harmless until it blows (the blob it was just spitting fizzles in the crater)
  const tip = ventTip(vent);
  // (marked spent rather than filtered out: this runs while the projectiles are updating)
  for (const m of state.projectiles) if (m.id.startsWith('magma-') && Math.hypot(m.pos.x + 7 - tip.x, m.pos.y + 7 - tip.y) < 70) m.life = 0;
  vent.life = Math.min(ERUPTION_FRAMES - 12, Math.max(vent.life, 60)); // frozen hot...
  vent.age = Math.max(vent.age || 0, 12);                             // ...and fully risen
  ctx.fx.spawnRockShatter({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
  ctx.fx.playGunSound('crack');
  state.screenShakeTimer = Math.max(state.screenShakeTimer, 10);

  // The rest of its set keep erupting (building pressure) until this one blows
  const set = state.bossVolcanoes.filter(v => v.setId === vent.setId);
  for (const v of set) if (!v.corked) v.life = Math.max(v.life, CORK_FUSE);

  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0);
  const allCorked = set.length >= 3 && set.every(v => v.corked);
  if (boss && allCorked && boss.health <= boss.maxHealth / 2) {
    startVolcanoFinale(ctx);
    return true;
  }
  if (boss && (state.victorCorkTauntAt === undefined || state.frame - state.victorCorkTauntAt > 180)) {
    state.victorCorkTauntAt = state.frame;
    speakAsBoss(VICTOR, pickRandom(VICTOR_LINES.CORKED), ctx.bossHelpers);
  }
  return true;
};

/** A corked vent: no magma, just rumbling and smoke as the pressure builds, then the cork blows. Returns false once it's gone. */
export const updateCorkedVent = (ctx: FrameContext, v: Volcano): boolean => {
  const { state, fx } = ctx;
  v.fuse = (v.fuse || 0) - 1;
  const box = ventBox(v);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const urgency = 1 - v.fuse / CORK_FUSE;
  if (state.frame % Math.max(2, Math.round(8 - urgency * 6)) === 0) {
    state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 30, y: cy - 10 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() * 2 - urgency * 2 }, life: 26, color: Math.random() > 0.5 ? '#5D4037' : '#8D6E63', size: 5 + Math.random() * 6 });
  }
  if (v.fuse > 0) return true;

  // The cork blows: a burst of rock and magma that hurts anyone close
  for (const c of ['#FF6D00', '#FFD600', '#5D4037']) fx.spawnExplosion({ x: cx, y: cy }, c, 18, 0, 16);
  fx.spawnRockShatter({ x: cx, y: cy });
  fx.playGunSound('boom');
  state.screenShakeTimer = 20;
  const { player } = state;
  const dx = player.pos.x + player.width / 2 - cx, dy = player.pos.y + player.height / 2 - cy;
  if (dx * dx + dy * dy < CORK_BLAST_RADIUS * CORK_BLAST_RADIUS && player.invincibilityTimer <= 0) {
    hurtPlayer(ctx, CORK_BLAST_DAMAGE, 'cork_blast', { x: (dx < 0 ? -1 : 1) * PLAYER_PUSHBACK_VEL_X, y: PLAYER_PUSHBACK_VEL_Y });
  }
  return false;
};

/**
 * The tsunami on Victor. It only really hurts him (in full) when it does what water does to a volcano: puts his fire out
 * mid-breath, or blows one of his open vents into steam. Otherwise (fired too soon, with nothing of his to put out) it
 * just rinses him, for a fraction of that. Once a wave: what it's owed is topped up if it earns more on its way through.
 */
const tsunamiFull = (state: FrameContext['state'], boss: Enemy) =>
  state.tsunamiVentWave === state.tsunamiSerial || boss.dousedWave === state.tsunamiSerial || boss.bossState === 'barfing';
const topUpTsunami = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  if (boss.tsunamiWave !== state.tsunamiSerial || boss.health <= 0) return;
  const owed = (tsunamiFull(state, boss) ? TSUNAMI_DAMAGE_WEAKNESS : TSUNAMI_DAMAGE_BOSS) - (boss.tsunamiPaid ?? 0);
  if (owed <= 0) return;
  boss.tsunamiPaid = (boss.tsunamiPaid ?? 0) + owed;
  hitBoss(ctx, boss, 'TSUNAMI', { facing: state.tsunamiDir, damage: owed });
};
/** The wave reaches him. */
export const victorTsunamiHit = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  if (boss.tsunamiWave === state.tsunamiSerial) return;
  boss.tsunamiWave = state.tsunamiSerial; boss.tsunamiPaid = 0;
  topUpTsunami(ctx, boss);
};
/** Put out mid-breath: how long he's choking on it, and a cough every so often in it. */
const DOUSED_FRAMES = 100, COUGH_EVERY = 24;
/** The steam off a blown vent: how fast it rushes back along to him (px a frame), and how long he's scalded by it. */
const STEAM_RUSH = 10, SCALDED_FRAMES = 75;

/** A hacking cough, choking on it: a gout of black smoke and dirty water out of his mouth, his head jerking forward. */
const cough = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  const m = victorMouth(boss), f = boss.facing ?? 1;
  for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: m.x, y: m.y }, vel: { x: f * (2 + Math.random() * 4), y: -1.5 - Math.random() * 2 }, life: 34, color: i % 3 ? '#374151' : '#9CA3AF', size: 6 + Math.random() * 7 });
  for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: m.x, y: m.y + 4 }, vel: { x: f * (1 + Math.random() * 3), y: Math.random() * 2 }, life: 22, color: '#38BDF8', size: 2 + Math.random() * 2 });
  state.damageNumbers.push({ id: `cough-${state.frame}`, text: pickRandom(['HACK!', 'COUGH!', 'HURK!']), pos: { x: m.x + f * 16, y: m.y - 20 }, vel: { x: f * 0.6, y: -1.6 }, life: 34, maxLife: 34, isCritical: false, isCallout: true, color: '#CBD5E1' });
  ctx.fx.playGunSound('ignite', 0.35, -14);
};

/**
 * The wave's blown one of his vents into steam (at `at`). The vents are him (it's his volcano): the steam rushes back
 * along to him, plain to see, and when it gets there it comes up through him: scalded, steam out of his ears, and the
 * wave counts in full against him. However far off he is.
 */
export const victorVentBlown = (ctx: FrameContext, at: { x: number; y: number }) => {
  const { state } = ctx;
  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0);
  if (!boss) return;
  const tx = midX(boss), ty = boss.pos.y + boss.height * 0.45;
  const dist = Math.hypot(tx - at.x, ty - at.y);
  const frames = Math.max(4, Math.round(dist / STEAM_RUSH));
  // (two blown at once: the first to get there counts)
  // (the rush of it, along to him: the world draws it, see drawSteamRush)
  if (boss.steamAt === undefined || state.frame + frames < boss.steamAt) { boss.steamFrom = { ...at }; boss.steamStart = state.frame; boss.steamAt = state.frame + frames; }
  boss.steamWave = state.tsunamiSerial;
  ctx.fx.playGunSound('ignite', 0.5, 8);
};

/** The steam's got back to him: scalded (out of whatever he was doing, fire and all), and the wave counts in full. */
const steamArrives = (ctx: FrameContext, boss: Enemy) => {
  const { state } = ctx;
  boss.steamAt = undefined; boss.steamFrom = undefined;
  if (boss.health <= 0) return;
  if (boss.steamWave === state.tsunamiSerial) state.tsunamiVentWave = boss.steamWave;
  topUpTsunami(ctx, boss);
  // (a burst of it out of all of him)
  for (let i = 0; i < 24; i++) state.particles.push({ pos: { x: midX(boss) + (Math.random() - 0.5) * boss.width * 0.8, y: boss.pos.y + Math.random() * boss.height * 0.8 }, vel: { x: (Math.random() - 0.5) * 5, y: -2 - Math.random() * 4 }, life: 40, color: i % 2 ? '#F8FAFC' : '#E2E8F0', size: 6 + Math.random() * 8 });
  if (boss.health <= 0) return;
  if (boss.bossState === 'pain' && boss.painKind === 'doused') return;
  boss.barfT = undefined; boss.barfLen = 0;
  const fresh = boss.bossState !== 'pain';
  bossPain(ctx, boss, 'scalded', SCALDED_FRAMES, 'STEAMED!', '#F8FAFC');
  ctx.fx.playGunSound('ignite', 0.7, -6);
  if (fresh) speakAsBoss(VICTOR, pickRandom(VICTOR_LINES.STEAMED), ctx.bossHelpers, 'casual');
};

export const victor: BossDef = {
  id: 'Victor Volcano',
  // (bumping into him)
  contact: { damage: 8 },
  weakness: 'TSUNAMI',
  weaknessDamage: 150,
  spawn: { x: 7700 },
  update,
  // He stays 'jumping' when he lands so update() can open the vents
  physics: { landingEndsJump: false },
};
