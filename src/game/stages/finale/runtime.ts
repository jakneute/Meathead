// The finale, frame by frame (the alien himself is in bosses/alien.ts): the camera held on the whole press room; the
// Secret Service flooding in through the doors and the windows, for ever (capped on screen); the room wrecked its own
// way each time one of Meathead's guns runs dry, for the rest of the fight (they stack); and once every one of them's
// dry, the end of it: the agents pull out, the doors slam, it's just him and the alien, and the alien begs (each plea
// answered), lobbing sad little bolts, while the pistol does him in a few rounds.
// Nothing drops in here: he's on what he walked in with.

import type { FrameContext } from '../../core/context';
import type { Controls } from '../../platform/input';
import type { Enemy, EnemyKind, WeaponType } from '../../../types';
import { MAX_AMMO, SPOKEN_TEXT_HOLD } from '../../../constants';
import { ALIEN_LINES, FINALE_LINES } from '../../../content/dialogue';
import { makeKindEnemy, KIND_STATS } from '../../enemies/kinds';
import { say, isTalking, MEATHEAD_VOICE, Voice } from '../../platform/speech';
import { playSound } from '../../platform/audio';
import { speakAsBoss } from '../../bosses/shared';
import { ALIEN_ID } from '../../bosses/alien';
import { spillOil, lightOil } from '../../bosses/oscar';
import { isShat } from '../../player/gut';
import { shakeScreen } from '../../core/state';
import { pickRandom } from '../../core/utils';
import { getFinale, alienPace, FinaleRuntime } from './state';
import { ROOM_L, ROOM_R, ROOM_MID, FLOOR, VIEW_X, VIEW_Y, VIEW_W, VIEW_H, DOOR_H, WINDOW_TOP, WINDOW_BOTTOM, doorOutside, sideOf } from './geometry';

/** The Secret Service's radio. */
const RADIO_VOICE: Voice = { id: 'finale.radio', pitch: 1, rate: 1 };

/** How many of them at once at most: on foot, in the air. */
export const MAX_GROUND = 7, MAX_AIR = 3;
/** How often more come in (frames), fewer frames between as the alien loses health. */
const SPAWN_EVERY = 125, SPAWN_RAMP = 50;
/** When he mentions his souped-up toys (frames into the fight). */
const SOUPED_UP_AT = 75;
/** How long after the retreat's called the doors slam regardless (anyone still in the room is let out first). */
const RETREAT_MAX = 300;

/** The weapons that run out (the ones that wreck the room when they do), in the order their wrecks are layered. */
export const WRECK_ORDER: WeaponType[] = ['BOULDER', 'TSUNAMI', 'SLUDGE', 'OIL_ROCKET', 'NEEDLES', 'SHOTGUN', 'FLAMETHROWER', 'TASER'];
/** What goes up on the screen as each one wrecks the room. */
const WRECK_BANNER: Partial<Record<WeaponType, [string, string]>> = {
  SHOTGUN: ['THE ROOM FREEZES OVER!', '#B3F0FF'],
  FLAMETHROWER: ["THE PRESS ROOM'S ON FIRE!", '#F97316'],
  BOULDER: ['THE WALLS CAVE IN!', '#D6D3D1'],
  TSUNAMI: ['THE ROOM FLOODS!', '#38BDF8'],
  SLUDGE: ['TOXIC SPILL!', '#84CC16'],
  TASER: ['LIGHTS OUT!', '#00E5FF'],
  OIL_ROCKET: ['OILED WALL TO WALL!', '#A8A29E'],
  NEEDLES: ['NEEDLES EVERYWHERE!', '#E879F9'],
};

/** A radio line not heard yet this fight (none twice: once they've all been said, the radio's got nothing new). */
const freshRadio = (rt: FinaleRuntime, pool: readonly string[]) => {
  const left = pool.filter(l => !rt.said[`radio:${l}`]);
  if (!left.length) return null;
  const line = pickRandom(left);
  rt.said[`radio:${line}`] = true;
  return line;
};

const queue = (rt: FinaleRuntime, who: 'alien' | 'meathead' | 'radio', text: string, shat?: string) => {
  if (rt.lines.length < 8) rt.lines.push({ who, text, shat });
};

/** The weapons he's got that run out (the handgun never does). */
const limitedWeapons = (ctx: FrameContext): WeaponType[] =>
  (ctx.state.availableWeapons ?? (Object.keys(MAX_AMMO) as WeaponType[])).filter(w => w !== 'GUN' && w !== 'LMG' && Number.isFinite(MAX_AMMO[w]) && MAX_AMMO[w] > 0);

export const updateFinale = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx;
  const rt = getFinale(state);
  if (!rt) return controls;
  rt.t++;
  // The whole room, all the time (and what's on screen is all of it, from the first frame: see core/utils screenRect)
  state.cameraOverride = { x: VIEW_X, y: VIEW_Y };
  state.view = { x: VIEW_X, y: VIEW_Y, w: VIEW_W, h: VIEW_H };
  // Nothing drops in here
  if (state.pickups.length) state.pickups = [];
  const boss = state.enemies.find(e => e.type === 'boss');
  // (gone out of a door or a window)
  if (state.enemies.some(e => e.aiState === 'gone')) state.enemies = state.enemies.filter(e => e.aiState !== 'gone');
  if (rt.radioCd > 0) rt.radioCd--;
  for (let i = 0; i < 2; i++) if (rt.doorOpen[i] > 0 && !rt.doorsShut) rt.doorOpen[i] = Math.max(0, rt.doorOpen[i] - 0.012);

  // A beat into it, he mentions (casually) what he did to his toys in the garage for this (once; never over anyone)
  if (rt.t === SOUPED_UP_AT && !rt.said.soupedUp) {
    rt.said.soupedUp = true;
    for (const l of FINALE_LINES.SOUPED_UP) queue(rt, 'meathead', l.text, l.shat);
  }
  checkWrecks(ctx, rt);
  wreckedRoom(ctx, rt);
  if (boss && boss.health > 0 && state.bossExplosionTimer <= 0) {
    if (rt.retreatAt === undefined) spawnAgents(ctx, rt, boss);
    else retreat(ctx, rt, boss);
    shedSkin(ctx, rt, boss);
    if (rt.pleadAt !== undefined) beg(ctx, rt);
  }
  // He's dead (before he ever got to begging, with his men still about): every one of them left goes off like a
  // grenade, there and then (whatever kept them going went with him)
  if ((!boss || boss.health <= 0 || state.bossExplosionTimer > 0) && !rt.said.agentsPopped) {
    rt.said.agentsPopped = true;
    const left = agents(ctx);
    for (const e of left) {
      const c = { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 };
      ctx.fx.spawnExplosion(c, '#F97316', 14, 0, 12);
      ctx.fx.spawnDeathShower(e.pos, 0, 2.2);
      ctx.fx.blowAwayEnemy(e, { x: (Math.random() - 0.5) * 30, y: -14 - Math.random() * 10 }, 'oil_kill', 0, 2.5);
      ctx.fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 24 }, 'POP!', true, '#F97316');
    }
    if (left.length) playSound('boom', 0.8);
  }
  fallingSkin(rt);
  pumpLines(ctx, rt);
  return controls;
};

// ---------------------------------------------------------------------------
// The Secret Service
// ---------------------------------------------------------------------------

const agents = (ctx: FrameContext) => ctx.state.enemies.filter(e => e.type !== 'boss' && e.health > 0 && !e.isBlownAway && (e.kind === 'agent' || e.kind === 'agentrush' || e.kind === 'agentshield' || e.kind === 'jetagent'));

const spawnAgents = (ctx: FrameContext, rt: FinaleRuntime, boss: Enemy) => {
  if (--rt.spawnT > 0) return;
  const pace = alienPace(boss);
  rt.spawnT = Math.round(SPAWN_EVERY - pace * SPAWN_RAMP);
  const now = agents(ctx);
  const ground = now.filter(e => e.kind !== 'jetagent').length, air = now.length - ground;
  // (the first wave's a flood: three at once; after that one or two, more when the room's thin)
  const n = rt.spawned === 0 ? 3 : now.length < 3 ? 2 : 1;
  const airCap = rt.t < 900 ? 1 : MAX_AIR;
  let g = ground, a = air;
  for (let i = 0; i < n; i++) {
    const side = rt.spawnSide;
    rt.spawnSide = side < 0 ? 1 : -1;
    const r = Math.random();
    // (one in four from the air; and the first of them early, the moment the first flood's in: a window goes in)
    const wantAir = (r < 0.25 || !rt.windowBroken.some(Boolean)) && a < airCap && rt.spawned > 2;
    if (wantAir) { spawnJet(ctx, rt, side); a++; }
    else if (g < MAX_GROUND) { spawnOnFoot(ctx, rt, side, r < 0.55 ? 'agent' : r < 0.82 ? 'agentrush' : 'agentshield'); g++; }
  }
  // The radio: who's coming in (once in a while, never over anyone)
  if (rt.radioCd <= 0 && (rt.spawned <= 3 || Math.random() < 0.3)) {
    const line = rt.spawned <= 3 ? freshRadio(rt, FINALE_LINES.RADIO_IN.slice(0, 1)) : freshRadio(rt, FINALE_LINES.RADIO_IN.slice(1));
    if (line) queue(rt, 'radio', line);
    rt.radioCd = 840;
  }
};

let seq = 0;
const spawnOnFoot = (ctx: FrameContext, rt: FinaleRuntime, side: -1 | 1, kind: EnemyKind) => {
  const s = KIND_STATS[kind];
  const e = makeKindEnemy(kind, 0, FLOOR);
  e.pos.x = doorOutside(side, s.w);
  e.homeX = Math.floor(Math.random() * 997);
  e.variant = ++seq;
  e.facing = side < 0 ? 1 : -1;
  // (where he's taking up his position: somewhere his side of the room, not in the doorway)
  e.aiX = side < 0 ? ROOM_L + 50 + Math.random() * 500 : ROOM_R - 50 - s.w - Math.random() * 500;
  e.seen = true;
  ctx.state.enemies.push(e);
  rt.doorOpen[side < 0 ? 0 : 1] = 1;
  rt.spawned++;
  if (rt.spawned === 1 || Math.random() < 0.3) playSound('crash', 0.35, 4);
};

const spawnJet = (ctx: FrameContext, rt: FinaleRuntime, side: -1 | 1) => {
  const { state } = ctx;
  const e = makeKindEnemy('jetagent', 0, 0);
  e.pos = { x: side < 0 ? ROOM_L - 60 : ROOM_R + 16, y: (WINDOW_TOP + WINDOW_BOTTOM) / 2 - e.height / 2 };
  e.initialY = e.pos.y;
  e.homeX = side < 0 ? ROOM_L + 10 : ROOM_R - 10;
  e.variant = ++seq;
  e.seen = true;
  state.enemies.push(e);
  rt.spawned++;
  // The first one through each window comes through the glass
  const w = side < 0 ? 0 : 1;
  if (!rt.windowBroken[w]) {
    rt.windowBroken[w] = true;
    ctx.fx.spawnGlassShatter({ x: side < 0 ? ROOM_L : ROOM_R, y: (WINDOW_TOP + WINDOW_BOTTOM) / 2 });
    if (!rt.said.jets) { rt.said.jets = true; const line = freshRadio(rt, FINALE_LINES.RADIO_JETS); if (line) queue(rt, 'radio', line); }
  }
};

// ---------------------------------------------------------------------------
// The room going to pieces, gun by gun
// ---------------------------------------------------------------------------

const checkWrecks = (ctx: FrameContext, rt: FinaleRuntime) => {
  const ammo = ctx.state.player.weaponAmmo;
  const limited = limitedWeapons(ctx);
  for (const w of limited) if (rt.wrecked[w] === undefined && (ammo[w] ?? 0) <= 0) wreck(ctx, rt, w);
  // Every one of them dry: that's it for the Secret Service
  if (limited.length > 0 && rt.retreatAt === undefined && limited.every(w => rt.wrecked[w] !== undefined)) callRetreat(ctx, rt);
};

/** One of his guns has just run dry: the room goes its way (a crash, a shake, the banner, and him saying so). */
const wreck = (ctx: FrameContext, rt: FinaleRuntime, w: WeaponType) => {
  const { state, fx } = ctx;
  rt.wrecked[w] = rt.t;
  const b = WRECK_BANNER[w];
  if (b) rt.banner = { text: b[0], color: b[1], at: rt.t };
  shakeScreen(state, 26, 12);
  const line = FINALE_LINES.WRECKED[w];
  if (line) queue(rt, 'meathead', line);
  const across = (n: number, colors: string[], vy: number, life = 60) => {
    for (let i = 0; i < n; i++) state.particles.push({ pos: { x: ROOM_L + Math.random() * (ROOM_R - ROOM_L), y: -140 + Math.random() * 60 }, vel: { x: (Math.random() - 0.5) * 2, y: vy * (0.5 + Math.random()) }, life: life + Math.random() * 40, color: colors[i % colors.length], size: 3 + Math.random() * 6, grav: 0.2 });
  };
  switch (w) {
    case 'SHOTGUN': playSound('ice', 1, -6); playSound('glass'); across(40, ['#E0F2FE', '#FFFFFF', '#BAE6FD'], 2); break;
    case 'FLAMETHROWER': playSound('ignite', 1, -4); playSound('flame', 1, -6); lightOil(state, { x: ROOM_L - 10, y: -200, w: ROOM_R - ROOM_L + 20, h: 800 }); break;
    case 'BOULDER': playSound('crash', 1, -6); playSound('rumble', 1, -4); across(50, ['#78716C', '#A8A29E', '#57534E'], 4); break;
    case 'TSUNAMI': playSound('tsunami', 0.8, -3); fx.spawnSteamExplosionParticles({ x: ROOM_MID, y: FLOOR - 40 }, 10); break;
    case 'SLUDGE': playSound('barf', 1, -5); across(40, ['#84CC16', '#65A30D', '#3F6212'], 3); break;
    case 'TASER': playSound('taser', 1, -5); playSound('crack', 1, -3); across(30, ['#00E5FF', '#FFFFFF'], 3, 20); break;
    case 'OIL_ROCKET': playSound('oil', 1, -6); coatInOil(state); across(40, ['#1C1917', '#292524', '#44403C'], 3); break;
    case 'NEEDLES': playSound('dart', 1, -4); playSound('glass', 0.6); across(30, ['#E5E7EB', '#E879F9'], 3); break;
  }
};

/** The room oiled: slicks over the floor either side (the same oil as Oscar's: slippery, and it burns), down the walls. */
const coatInOil = (state: FrameContext['state']) => {
  spillOil(state, ROOM_L + 200, ROOM_L + 520);
  spillOil(state, ROOM_R - 520, ROOM_R - 200);
  spillOil(state, ROOM_L, ROOM_L, 'left', 200, FLOOR);
  spillOil(state, ROOM_R, ROOM_R, 'right', 200, FLOOR);
};

/** What the wrecks do while they last: the oil kept fresh (it doesn't dry up in here), and lit now and then by the fire. */
const wreckedRoom = (ctx: FrameContext, rt: FinaleRuntime) => {
  const { state } = ctx;
  if (rt.wrecked.OIL_ROCKET !== undefined && rt.t % 300 === 0) coatInOil(state);
  // The fire round the walls catches the oil down them, every so often (it runs along the floor slicks from there)
  if (rt.wrecked.OIL_ROCKET !== undefined && rt.wrecked.FLAMETHROWER !== undefined && rt.t % 480 === 240) {
    const side = (rt.t / 480) % 2 < 1 ? -1 : 1;
    if (lightOil(state, { x: side < 0 ? ROOM_L - 6 : ROOM_R - 6, y: 380, w: 12, h: FLOOR - 380 })) playSound('ignite', 0.8);
  }
  // Sludge dripping off the ceiling; water off it in the flood
  if (rt.wrecked.SLUDGE !== undefined && rt.t % 9 === 0) state.particles.push({ pos: { x: ROOM_L + 20 + Math.random() * (ROOM_R - ROOM_L - 40), y: -146 }, vel: { x: 0, y: 1 }, life: 160, color: Math.random() < 0.5 ? '#84CC16' : '#65A30D', size: 2 + Math.random() * 3, grav: 0.25 });
  if (rt.wrecked.TSUNAMI !== undefined && rt.t % 14 === 0) state.particles.push({ pos: { x: ROOM_L + 20 + Math.random() * (ROOM_R - ROOM_L - 40), y: -146 }, vel: { x: 0, y: 1 }, life: 160, color: '#7DD3FC', size: 2, grav: 0.3 });
  if (rt.wrecked.TASER !== undefined && rt.t % 23 === 0) {
    const x = [ROOM_L + 180, ROOM_MID - 140, ROOM_MID + 210, ROOM_R - 160][Math.floor(Math.random() * 4)];
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x, y: -60 + (x % 40) }, vel: { x: (Math.random() - 0.5) * 5, y: -1 + Math.random() * 4 }, life: 14 + Math.random() * 10, color: i % 2 ? '#00E5FF' : '#FFFFFF', size: 2, grav: 0.2 });
    if (Math.random() < 0.5) playSound('taser', 0.25, 3);
  }
};

// ---------------------------------------------------------------------------
// The end of it
// ---------------------------------------------------------------------------

const callRetreat = (ctx: FrameContext, rt: FinaleRuntime) => {
  rt.retreatAt = rt.t;
  // (whatever was still waiting to be said about the room can go: this is what matters now)
  rt.lines = [];
  queue(rt, 'meathead', FINALE_LINES.ALL_OUT);
  queue(rt, 'radio', FINALE_LINES.RADIO_RETREAT);
  for (const e of agents(ctx)) pullOut(e);
  for (let i = 0; i < 2; i++) rt.doorOpen[i] = 1;
};

/** He's off: out the nearest door (or window), not looking back. */
const pullOut = (e: Enemy) => {
  e.harmless = true;
  e.behavior = 'custom';
  e.aiState = 'flee';
  e.aiTimer = 0;
  e.pauseTimer = 0;
  e.isShieldActive = false;
  e.aiX = sideOf(e.pos.x + e.width / 2);
  e.homeX = e.aiX < 0 ? ROOM_L + 10 : ROOM_R - 10;
};

const retreat = (ctx: FrameContext, rt: FinaleRuntime, boss: Enemy) => {
  const { state } = ctx;
  if (rt.doorsShut) return;
  const left = agents(ctx);
  // (anyone who's turned up since: out too)
  for (const e of left) if (e.aiState !== 'flee' && e.aiState !== 'gone') pullOut(e);
  if (left.length > 0 && rt.t - rt.retreatAt! < RETREAT_MAX) return;
  // The last of them's out (or it's been long enough: the stragglers are hustled out): the doors slam
  if (left.length) state.enemies = state.enemies.filter(e => !left.includes(e));
  rt.doorsShut = true; rt.slamAt = rt.t; rt.doorOpen = [0, 0];
  shakeScreen(state, 22, 10);
  playSound('slam'); playSound('crash', 0.7, -6);
  for (const side of [-1, 1] as const) {
    const x = side < 0 ? ROOM_L : ROOM_R;
    for (let i = 0; i < 18; i++) state.particles.push({ pos: { x: x - side * 4, y: FLOOR - Math.random() * DOOR_H }, vel: { x: -side * (1 + Math.random() * 3), y: -Math.random() * 2 }, life: 40 + Math.random() * 30, color: i % 2 ? 'rgba(168, 162, 158, 0.7)' : 'rgba(120, 113, 108, 0.6)', size: 5 + Math.random() * 7 });
    // (and they're shut for good: nobody's getting in or out)
    state.blocks.push({ x: side < 0 ? ROOM_L - 100 : ROOM_R, y: FLOOR - DOOR_H - 10, w: 100, h: DOOR_H + 10, type: 'wall', hidden: true });
  }
  queue(rt, 'alien', ALIEN_LINES.ALONE);
  // He's lost, and he knows it: the begging starts; and from here a pistol round does him real harm, sized so a few
  // finish him from whatever he's got left
  rt.pleadAt = rt.t;
  rt.pleadGun = Math.max(30, Math.ceil(boss.health / 4));
  rt.mode = 'plead'; rt.modeT = 0; rt.beam = null; rt.path = [];
  rt.boltT = 140; rt.pleaIdx = 0; rt.pleaWaitT = 30;
};

/** The begging: a plea, Meathead's answer; a breath; the next. (A hit brings the next one on sooner.) */
const beg = (ctx: FrameContext, rt: FinaleRuntime) => {
  if (rt.pleaWaitT > 0) rt.pleaWaitT--;
  if (rt.pleaWaitT > 0 || rt.lines.length || isTalking() || rt.t < rt.speakUntil || rt.pleaIdx >= ALIEN_LINES.PLEAS.length) return;
  const p = ALIEN_LINES.PLEAS[rt.pleaIdx++];
  queue(rt, 'alien', p.plea);
  queue(rt, 'meathead', p.reply, p.shat);
  rt.pleaWaitT = 50;
};

// ---------------------------------------------------------------------------
// What's left of the President on him
// ---------------------------------------------------------------------------

/** Bits of the President's skin and suit still stuck to him come off as he takes a beating, and drop to the floor. */
const shedSkin = (ctx: FrameContext, rt: FinaleRuntime, boss: Enemy) => {
  const want = Math.max(0, Math.min(1, (boss.health / boss.maxHealth - 0.5) / 0.5));
  // (a bit at every eighth of the way down)
  while (rt.skin - want > 0.125) {
    rt.skin -= 0.125;
    rt.shed.push({ x: boss.pos.x + boss.width / 2 + (Math.random() - 0.5) * 60, kind: rt.shed.length % 4, flip: Math.random() < 0.5 ? -1 : 1, y: boss.pos.y + 50, vy: -2 });
    ctx.fx.playGunSound('splat', 0.4);
  }
};
const fallingSkin = (rt: FinaleRuntime) => {
  for (const s of rt.shed) if (s.y < FLOOR - 3) { s.vy = Math.min(9, s.vy + 0.45); s.y = Math.min(FLOOR - 3, s.y + s.vy); }
};

// ---------------------------------------------------------------------------
// Talking: one line at a time, in order; the words up only while they're said
// ---------------------------------------------------------------------------

const pumpLines = (ctx: FrameContext, rt: FinaleRuntime) => {
  const { state } = ctx;
  if (!rt.lines.length || isTalking() || rt.t < rt.speakUntil) return;
  // (not with the alien dead: his last words are his last)
  const boss = state.enemies.find(e => e.type === 'boss');
  if (!boss || boss.health <= 0 || state.bossExplosionTimer > 0 || state.victoryString) { rt.lines = []; return; }
  const l = rt.lines.shift()!;
  const text = l.who === 'meathead' && l.shat && isShat(state) ? l.shat : l.text;
  // (unrecorded, the words stay up a fixed time: the next waits till they're down)
  const hold = 70 + text.length * 2;
  if (l.who === 'alien') {
    if (speakAsBoss(ALIEN_ID, text, ctx.bossHelpers, 'queue')) rt.speakUntil = rt.t + (isTalking() ? 20 : hold);
    return;
  }
  if (l.who === 'meathead') {
    say(text, MEATHEAD_VOICE, 'queue', {
      always: true,
      onShow: spoken => { state.playerLastVulgarity = text; state.playerVulgarityTimer = spoken ? SPOKEN_TEXT_HOLD : hold; if (!spoken) rt.speakUntil = rt.t + hold; },
      onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = 0; },
    });
    return;
  }
  say(text, RADIO_VOICE, 'queue', {
    always: true,
    onShow: spoken => { rt.radioText = text; rt.radioUntil = spoken ? Infinity : rt.t + hold; if (!spoken) rt.speakUntil = rt.t + hold; },
    onHide: () => { if (rt.radioText === text) rt.radioText = null; },
  });
};
