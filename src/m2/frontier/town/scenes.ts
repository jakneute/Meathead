// Sawdust Gulch's scenes: the crash (crash.ts: its cutscene, in from the train: the wreck, Tucker thrown out face first
// into the dirt, the paramedics carrying him into FIRST AID; then its aftermath for the visit), the saloon's brawl and
// the showdown's duel, what he's got to say passing things (once each), and the townsfolk's barks and the announcer's
// words drawn over them.
//
// THE SALOON (the playtest: "the back door is locked and as soon as you initiate violence BRAWL pops up on screen and
// everyone fights everyone. last man alive can leave"): calm in there (harmless: cards, drinks, the kick line, the
// piano) till he starts something: any of them hurt, knocked about, or a shot of his in the room. Then BRAWL! goes up,
// the batwings are barred, and it's everybody at everybody (kinds.ts's saloon AI); the camera holds the whole room.
// The last man standing (him) gets out: the back door unlocks, the front one opens. If he starts nothing, the bouncer
// loses patience (a warning at 8 s, then at 16 s he starts it himself). Won, it stays won (the checkpoint past it, or a
// death after it this visit).
//
// THE SHOWDOWN (the playtest: "a brief scene comes up with 'draw' against the sheriff. a standard showdown"): into the
// Wild West Show's street, the gates shut and a cutscene (no controls, no HUD; SKIP >> skips all of it): the announcer,
// the rules, the sheriff's line, his; he's walked to his mark facing the sheriff down a clear street. Then the duel is
// his, only his trigger finger (no walking, no moves): a wait (the sheriff's hand twitching), then DRAW! Fire in time
// (DRAW_WINDOW) and the sheriff's outdrawn, done. Too slow: the sheriff's one shot, a hole clean through his face
// (duelDeath.ts). Fire before the DRAW: the sheriff's dead, but that's cheating: his posse comes after him (ordinary
// fighting: they don't one-shot him) and he has to put them all down. Done, it stays done like the saloon.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy, EnemyKind, Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hazardKill } from '../../hazardHit';
import { signText } from '../../signLetters';
import { meatheadSays, speak, byPants, saidOver, landVisit, label, teleport, type Said } from '../section';
import { painted } from '../kit';
import { crashed } from '../train/engine';
import type { ByPants } from '../talk';
import { townOf } from './state';
import { GY } from '../geometry';
import { X, Y, x0, SALOON, SALOON_CAST, SQUARE, POSSE, inSaloon, type TownKind } from './layout';
import { updateCrash, crashRunning, arriveSaid, drawCrashFront, drawCrashHud } from './crash';
import {
  ARRIVE, REVISIT, TOWN_IN, COFFIN, SALOON_IN, BRAWL_DONE, LOCKED, SALOON_OUT, BOUNCER_WAIT, BOUNCER_START,
  SHOWDOWN_IN, SHOWDOWN_DONE, CHEATED, POSSE_DONE, POSSE_BARK, POND, MILL, MINE, CANARY, FLOOD, QUEUE, SHOW_OPEN,
  DUEL_RULES, SHOW_CHEAT, SHOW_CLOSE, SHERIFF_BARK, SHERIFF_DRAW, TOWN_VOICES,
} from './lines';
import { SALOON_FOLK, bark, voiceOf } from './kinds';

const AWAY = -99999;
/** After DRAW!, how long he has to fire (frames): fair, but no dawdling. */
export const DRAW_WINDOW = 34;
/** The bouncer's patience with him starting nothing (frames): the warning, then he starts it. */
const BOUNCER_WARN = 480, BOUNCER_GO = 960;

/** One of the townsfolk, put down at (x from the section's start, height). */
export const spawnTown = (state: GameState, kind: TownKind, rx: number, h: number, variant = 0) => {
  const e = makeKindEnemy(`m2:fr_${kind}` as EnemyKind, X(rx), Y(h));
  e.homeX = e.pos.x; e.homeY = e.pos.y; e.variant = (Math.abs(rx) + variant) % 7; e.facing = -1;
  state.enemies.push(e);
  return e;
};

// ---------------------------------------------------------------------------------------------------------------
// The crash: is this the visit it happened in? (the town built before it, this visit: then the wreck's still there).
// The fights won this visit (a death after either doesn't put them back).

let sawUncrashed = -1, wonSaloon = -1, wonDuel = -1;
export const wreckHere = (state: GameState) => crashed(state) && sawUncrashed === landVisit();

// ---------------------------------------------------------------------------------------------------------------
// Building: the walls (away till they shut), the saloon's folk and the duel's sheriff (unless they're done)

const wall = (state: GameState, x: number, w: number, h: number): Block => {
  const b: Block = { x, y: AWAY, w, h, type: 'wall', hidden: true, tag: 'fr-gate' } as Block;
  state.blocks.push(b);
  return b;
};
export const buildScenes = (state: GameState) => {
  if (!crashed(state)) sawUncrashed = landVisit();
  const tw = townOf(state);
  // (the saloon: [0] the batwings, barred in the brawl; [1] the back door, locked till it's won)
  tw.saloon.walls = [wall(state, SALOON.a - 8, 16, GY - SALOON.doorTop), wall(state, SALOON.b - 8, 16, GY - SALOON.doorTop)];
  tw.showdown.walls = [wall(state, SQUARE.a - 16, 16, 800), wall(state, SQUARE.b, 16, 800)];
  STASH.length = 0;
  const saloonWon = state.checkpoint >= 23 || wonSaloon === landVisit();
  tw.saloon.state = saloonWon ? 'done' : 'wait';
  tw.saloon.walls[1].y = saloonWon ? AWAY : SALOON.doorTop;
  if (!saloonWon) for (const [k, rx, h] of SALOON_CAST) {
    const e = spawnTown(state, k, rx, h);
    e.facing = k === 'bouncer' ? 1 : rx < 4400 ? 1 : -1;
    SALOON_FOLK.add(e); tw.saloon.foes.add(e);
  }
  const duelDone = state.checkpoint >= 24 || wonDuel === landVisit();
  tw.showdown.state = duelDone ? 'done' : 'wait';
  tw.duel.phase = duelDone ? 'done' : 'wait';
  if (!duelDone) { const s = spawnTown(state, 'sheriff', SQUARE.his - x0, 0); s.facing = -1; tw.duel.sheriff = s; }
};

const hold = (e: Enemy) => { e.puppet = true; e.pauseTimer = Math.max(e.pauseTimer ?? 0, 2); e.vel.x = 0; };
const shutSquare = (state: GameState, on: boolean) => { for (const w of townOf(state).showdown.walls) w.y = on ? GY - 800 : AWAY; };

// ---------------------------------------------------------------------------------------------------------------
// The saloon

/** INSIDE IS INSIDE (the playtest, as on the train: "you cannot kill indoor enemies when outdoors"): while he's out of
 *  the saloon its folk are out of the world (nothing of his reaches them: shots, specials, anything), back where they
 *  were as he comes in; and no shot crosses its walls or doors, his or anybody's. */
const STASH: Enemy[] = [];
const BORN = new WeakMap<object, boolean>();
const saloonWalls = (state: GameState, inside: boolean) => {
  if (!inside) {
    const keep = state.enemies.filter(e => !(SALOON_FOLK.has(e) && e.health > 0 && !e.isBlownAway && inSaloon(e.pos.x + e.width / 2, e.pos.y + e.height)) || !STASH.push(e));
    if (keep.length !== state.enemies.length) state.enemies = keep;
  } else if (STASH.length) {
    for (const e of STASH.splice(0)) { e.vel.x = 0; if (!state.enemies.includes(e)) state.enemies.push(e); }
  }
  let cut = false;
  for (const q of state.projectiles) {
    const r = inSaloon(q.pos.x + q.width / 2, q.pos.y + q.height / 2), born = BORN.get(q);
    if (born === undefined) BORN.set(q, r);
    else if (born !== r) cut = true;
  }
  if (cut) state.projectiles = state.projectiles.filter(q => {
    if (BORN.get(q) === inSaloon(q.pos.x + q.width / 2, q.pos.y + q.height / 2)) return true;
    for (let n = 0; n < 4; n++) state.particles.push({ pos: { x: q.pos.x, y: q.pos.y }, vel: { x: -Math.sign(q.vel.x) * Math.random() * 3, y: -Math.random() * 3 }, life: 14, color: '#8A5A30', size: 2 });
    playSound('thud', 0.3, 10);
    return false;
  });
};

const runSaloon = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), g = tw.saloon, br = tw.brawl, p = state.player;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, inside = inSaloon(cx, feet), free = p.health > 0 && !p.inCutscene;
  saloonWalls(state, inside);
  if (br.pop > 0) br.pop++;
  if (g.state === 'done') {
    if (!tw.said.saloonOut && free && cx > SALOON.b + 40 && cx < SALOON.b + 200 && feet > GY - 10) { tw.said.saloonOut = true; meatheadSays(state, pickLine(byPants(state, SALOON_OUT)), false); }
    return;
  }
  const folk = [...g.foes];
  if (g.state === 'wait') {
    if (!inside || !free) return;
    if (!tw.said.saloonIn && cx > SALOON.a + 60) { tw.said.saloonIn = true; meatheadSays(state, pickLine(byPants(state, SALOON_IN)), false); }
    if (!tw.said.locked && cx > SALOON.b - 70 && feet > GY - 10) { tw.said.locked = true; meatheadSays(state, pickLine(byPants(state, LOCKED)), false); }
    br.calmT++;
    // (violence: any of them hurt or knocked about, or a shot of his in the room)
    const violence = folk.some(e => e.health < e.maxHealth || e.isBlownAway || (e.hitFlash ?? 0) > 0 || e.meleeFlung || e.uppercutFlung || (!e.puppet && (e.pauseTimer ?? 0) > 3))
      || state.projectiles.some(q => q.owner === 'player' && q.pos.x > SALOON.a && q.pos.x < SALOON.b && q.pos.y > SALOON.top && q.pos.y < GY);
    const bouncer = folk.find(e => e.kind === 'm2:fr_bouncer' && e.health > 0);
    if (br.calmT === BOUNCER_WARN && bouncer && !violence) bark(state, bouncer, voiceOf(bouncer), BOUNCER_WAIT, 1, true);
    if (violence || br.calmT >= BOUNCER_GO) {
      // BRAWL!
      g.state = 'on'; g.t = 0; br.pop = 1;
      g.walls[0].y = SALOON.doorTop;
      playSound('slam', 1, -6); playSound('crash', 0.6, 2); shakeScreen(state, 5, 3);
      if (!violence && bouncer) bark(state, bouncer, voiceOf(bouncer), BOUNCER_START, 1, true);
    }
    return;
  }
  // (on: the last man standing gets out)
  g.t++;
  if (g.t > 30 && folk.every(e => e.health <= 0 || e.isBlownAway)) {
    g.state = 'done'; wonSaloon = landVisit();
    for (const w of g.walls) w.y = AWAY;
    playSound('ding', 0.8, 0); playSound('slam', 0.6, 4);
    meatheadSays(state, pickLine(byPants(state, BRAWL_DONE)), false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The showdown

const announce = (state: GameState, pool: ByPants, then?: () => void) => {
  const tw = townOf(state);
  speak(TOWN_VOICES.announcer, pickLine(byPants(state, pool)), s => { tw.pa = s; }, true, then);
};
const card = (state: GameState, words: string, frames = 70) => { const d = townOf(state).duel; d.card = words; d.cardT = frames; };

const startIntro = (state: GameState) => {
  const tw = townOf(state), d = tw.duel, p = state.player;
  d.phase = 'intro'; d.t = 0; d.step = 0;
  const tok = ++d.token, ok = () => d.token === tok && d.phase === 'intro';
  p.inCutscene = true;
  // (the user's: the ray gun's his for the duel, whatever he had out; he's left with it after, as the land's other
  // forced weapons leave him)
  state.lockWeapon = 'GUN'; p.currentWeapon = 'GUN';
  shutSquare(state, true);
  playSound('slam', 1, -6);
  announce(state, SHOW_OPEN, () => {
    if (!ok()) return;
    announce(state, DUEL_RULES, () => {
      if (!ok()) return;
      const s = d.sheriff;
      const then = () => { if (ok()) meatheadSays(state, pickLine(byPants(state, SHOWDOWN_IN)), true, () => { if (ok()) d.step = 1; }); };
      if (s && s.health > 0) speak(voiceOf(s), pickLine(byPants(state, SHERIFF_BARK)), x => { if (x) tw.barks.set(s, x); else tw.barks.delete(s); }, true, then);
      else then();
    });
  });
};

const beginDuel = (state: GameState, controls: Controls) => {
  const d = townOf(state).duel, p = state.player;
  d.phase = 'duel'; d.t = 0; d.token++;
  d.drawAt = 160 + Math.floor(Math.random() * 170);
  d.wasShooting = !!controls.shoot;
  p.inCutscene = false; p.facing = 1; p.gunslinger = true;
};

/** Out of the duel's stance, the ray gun his to put away (or keep). */
const unsquare = (state: GameState) => { state.player.gunslinger = false; state.lockWeapon = undefined; };

/** The duel settled: the sheriff down, the gates open, the crowd. */
const settle = (state: GameState) => {
  const tw = townOf(state);
  unsquare(state);
  tw.showdown.state = 'done'; tw.duel.phase = 'done'; wonDuel = landVisit();
  shutSquare(state, false);
  playSound('ding', 0.8, 0);
};

/** The sheriff shot down (outdrawn, or before he ever drew). */
const dropSheriff = (ctx: FrameContext, call: string) => {
  const s = townOf(ctx.state).duel.sheriff;
  if (!s || s.health <= 0) return;
  s.puppet = false; s.harmless = false; s.seen = true; s.pauseTimer = 0;
  hazardKill(ctx, s, ctx.state.player.pos.x, call, { fling: { x: 6, y: -7 }, sound: 'gun' });
};

const win = (ctx: FrameContext) => {
  const { state } = ctx;
  dropSheriff(ctx, 'OUTDRAWN!');
  settle(state);
  townOf(state).duel.phase = 'won';
  announce(state, SHOW_CLOSE, () => meatheadSays(state, pickLine(byPants(state, SHOWDOWN_DONE)), true));
};

/** A deputy out of the woodwork (the user's: shoot before the DRAW and they pop out after him for cheating): a burst
 *  of splinters where he comes out, a crack. */
const woodwork = (state: GameState, e: Enemy) => {
  const x = e.pos.x + e.width / 2, y = e.pos.y + e.height / 2;
  for (let n = 0; n < 16; n++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * e.width, y: y + (Math.random() - 0.5) * e.height }, vel: { x: (Math.random() - 0.5) * 8, y: -1 - Math.random() * 6 }, life: 26 + Math.random() * 20, color: n % 3 ? '#8A5A30' : '#C8A070', size: 2 + Math.random() * 3 });
  playSound('crack', 0.7, Math.random() * 6);
};

const cheat = (ctx: FrameContext) => {
  const { state } = ctx, tw = townOf(state), d = tw.duel, g = tw.showdown;
  dropSheriff(ctx, 'SHOT FIRST!');
  unsquare(state);
  card(state, 'NO DRAW!', 80);
  d.phase = 'posse'; g.state = 'on'; g.wave = 0; g.t = 0;
  playSound('slam', 0.8, -2);
  for (const [k, rx, h] of POSSE[0]) { const e = spawnTown(state, k, rx, h); g.foes.add(e); woodwork(state, e); }
  announce(state, SHOW_CHEAT, () => {
    meatheadSays(state, pickLine(byPants(state, CHEATED)), true);
    const one = [...g.foes].find(e => e.health > 0);
    if (one) bark(state, one, voiceOf(one), POSSE_BARK, 1, true);
  });
};

const lose = (ctx: FrameContext) => {
  const { state } = ctx, d = townOf(state).duel, s = d.sheriff, p = state.player;
  d.phase = 'lost';
  p.gunslinger = false;
  card(state, 'TOO SLOW!', 90);
  if (s) {
    s.aiState = 'fan';
    playSound('gun', 1, -10);
    const hx = s.pos.x + s.width / 2 - 24, hy = s.pos.y + 28;
    for (let n = 0; n < 8; n++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: -(1 + Math.random() * 3), y: (Math.random() - 0.5) * 2 }, life: 12, color: n % 2 ? '#FDE047' : '#E7E5E4', size: 2 + Math.random() * 2 });
  }
  p.invincibilityTimer = 0; p.untouchable = false;
  hurtPlayer(ctx, 9999, 'm2:fr_duel', { x: 0, y: 0 });
  // (too slow is dead, always (the playtest: he only got hurt): whatever kept him up, the hole's through his face)
  if (p.health > 0) p.health = 0;
};

/** The duel's frame; what he can do (in the intro, only what it walks him; in the duel, only his trigger). */
const runDuel = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, tw = townOf(state), d = tw.duel, g = tw.showdown, p = state.player, s = d.sheriff;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  if (d.cardT > 0) d.cardT--;
  // (the sheriff: held to his mark, untouchable, till it's settled)
  if (s && s.health > 0 && (d.phase === 'wait' || d.phase === 'intro' || d.phase === 'duel' || d.phase === 'lost')) {
    hold(s); s.harmless = true; s.health = s.maxHealth; s.facing = -1;
    s.aiState = d.phase === 'lost' || (d.phase === 'duel' && d.t >= d.drawAt) ? 'fan' : 'stand';
  }
  switch (d.phase) {
    case 'wait':
      if (cx > SQUARE.a + 50 && cx < SQUARE.b - 50 && feet > GY - 20 && p.isGrounded && p.health > 0 && !p.inCutscene) startIntro(state);
      return controls;
    case 'intro': {
      d.t++;
      // (walked to his mark, facing down the street)
      const to = SQUARE.mine - cx, at = Math.abs(to) < 6;
      const out: Controls = { ...NO_CONTROLS, right: !at && to > 0, left: !at && to < 0 };
      // (at his mark: squared up)
      if (at) p.facing = 1;
      p.gunslinger = at;
      if (d.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); tw.pa = null; tw.barks.clear(); teleport(state, SQUARE.mine, GY); beginDuel(state, controls); return { ...NO_CONTROLS }; } }
      if ((d.step === 1 && at) || d.t > 1800) { if (!at) teleport(state, SQUARE.mine, GY); beginDuel(state, controls); return { ...NO_CONTROLS }; }
      return out;
    }
    case 'duel': {
      d.t++;
      p.facing = 1;
      const shooting = !!controls.shoot, pressed = shooting && !d.wasShooting;
      d.wasShooting = shooting;
      if (d.t === d.drawAt) {
        card(state, 'DRAW!', 60);
        playSound('clang', 1, 12); playSound('click', 0.8, -4);
        if (s) bark(state, s, voiceOf(s), SHERIFF_DRAW, 1, true);
      }
      // (his shot: he snaps out of the stance into firing (the engine's shot, the ray gun); then it's settled)
      if (p.health > 0 && pressed) { p.gunslinger = false; if (d.t < d.drawAt) cheat(ctx); else win(ctx); }
      else if (p.health > 0 && d.t >= d.drawAt + DRAW_WINDOW) lose(ctx);
      // (only his trigger finger: no walking, no moves, no turning away)
      return { ...NO_CONTROLS, shoot: controls.shoot };
    }
    case 'posse': {
      g.t++;
      const alive = [...g.foes].filter(e => e.health > 0 && !e.isBlownAway).length;
      if (alive <= 1 && g.wave + 1 < POSSE.length && g.t > 60) {
        g.wave++;
        for (const [k, rx, h] of POSSE[g.wave]) { const e = spawnTown(state, k, rx, h, g.wave * 3); g.foes.add(e); woodwork(state, e); }
        playSound('slam', 0.7, -2);
      } else if (alive === 0 && g.wave + 1 >= POSSE.length) {
        settle(state);
        meatheadSays(state, pickLine(byPants(state, POSSE_DONE)), true);
      }
      return controls;
    }
    default: return controls;
  }
};

/** The camera on the showdown's street (its gates shut). */
export const squareShut = (state: GameState) => { const ph = townOf(state).duel.phase; return ph === 'intro' || ph === 'duel' || ph === 'posse' || ph === 'lost'; };

// ---------------------------------------------------------------------------------------------------------------
// The frame

type Gag = [key: string, from: number, to: number, pool: ByPants];
const GAGS: Gag[] = [
  ['town', 1000, 1400, TOWN_IN], ['coffin', 3250, 3650, COFFIN], ['pond', 8280, 8500, POND], ['mill', 9820, 10100, MILL],
  ['mine', 11310, 11600, MINE], ['canary', 12650, 12760, CANARY], ['flood', 12960, 13100, FLOOD], ['queue', 14760, 15060, QUEUE],
];

export const updateScenes = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, tw = townOf(state), p = state.player;
  const cx = p.pos.x + p.width / 2, rx = cx - X(0);
  const free = p.health > 0 && !p.inCutscene;
  const once = (k: string, pool: ByPants) => { if (!tw.said[k] && free) { tw.said[k] = true; meatheadSays(state, pickLine(byPants(state, pool)), false); } };
  // ---- the crash (crash.ts: its cutscene, in from the train), then its aftermath
  const crashOut = updateCrash(ctx, controls);
  if (crashRunning()) return crashOut;
  const wreck = wreckHere(state);
  if (state.checkpoint === 20 && rx < 700 && state.frame > 30 && !(wreck && arriveSaid())) once('arrive', wreck ? ARRIVE : REVISIT);
  // ---- passing things
  for (const [k, a, b, pool] of GAGS) if (rx > a && rx < b) once(k, pool);
  runSaloon(ctx);
  return runDuel(ctx, controls);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: who's saying what, over their heads; the sheriff's tell; the cards (BRAWL!, DRAW!) and the skip

export const drawScenesFront = (c: CanvasRenderingContext2D, state: GameState) => {
  const tw = townOf(state), d = tw.duel;
  drawCrashFront(c, state);
  for (const [e, s] of tw.barks) if (e.health > 0 || s) saidOver(c, s.text, e.pos.x + e.width / 2, e.pos.y - 22, '#FDE68A');
  if (tw.pa) saidOver(c, (tw.pa as Said).text, (SQUARE.a + SQUARE.b) / 2, Y(330), '#F5F5F4');
  for (const e of state.enemies) {
    if (e.kind === 'm2:fr_sheriff' && e.aiState === 'draw' && e.health > 0 && state.frame % 10 < 7) label(c, 'DRAW!', e.pos.x + e.width / 2, e.pos.y - 8, '#F87171', 10);
  }
  // (the duel: the sheriff's fingers twitching over his holster as the DRAW comes)
  const s = d.sheriff;
  if (s && s.health > 0 && d.phase === 'duel' && d.t < d.drawAt && d.drawAt - d.t < 70 && state.frame % 6 < 3) {
    const hx = s.pos.x + s.width / 2 - 14, hy = s.pos.y + s.height - 30;
    c.fillStyle = '#FDE68A'; c.fillRect(Math.round(hx), Math.round(hy), 2, 2); c.fillRect(Math.round(hx - 4), Math.round(hy + 3), 2, 2);
  }
};

/** Over everything, on the screen: BRAWL! (it goes up the moment it starts), the duel's DRAW! (and the rest), SKIP >>. */
export const drawScenesHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const tw = townOf(state), d = tw.duel, br = tw.brawl;
  const big = (words: string, t: number, life: number, col: string, y: number) => {
    const grow = Math.max(0, 1 - t / 10), a = Math.min(1, (life - t) / 20);
    if (a <= 0) return;
    const cell = Math.round(7 + grow * 6);
    c.save(); c.globalAlpha = a;
    const shake = t < 14 ? (t % 2 ? 2 : -2) : 0;
    signText(c, words, CANVAS_WIDTH / 2 + shake, y + cell * 3.5, painted(cell, col, '#1C1209'));
    c.restore();
  };
  if (br.pop > 0 && br.pop < 110) big('BRAWL!', br.pop, 110, '#F87171', 150);
  if (d.cardT > 0) big(d.card, (d.card === 'DRAW!' ? 60 : d.card === 'NO DRAW!' ? 80 : 90) - d.cardT, d.card === 'DRAW!' ? 60 : d.card === 'NO DRAW!' ? 80 : 90, d.card === 'DRAW!' ? '#FDE047' : '#F87171', 170);
  if (d.phase === 'intro' && d.t > SKIP_AFTER && state.player.inCutscene) drawSkipPrompt(c, CANVAS_WIDTH);
  drawCrashHud(c, state);
};
