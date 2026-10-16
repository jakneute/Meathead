// CULTURES OF THE WORLD, the show (the sub-boss). He walks up the aisle and onto the stage; a few steps on, the house
// takes him for a volunteer: the stage-left wing slams shut behind him (the stage-right wing door is shut till the
// show's over: both sides locked), the spotlight finds him, the narrator makes a fuss (a cutscene beat: HUD hidden,
// SKIP >> for all of it), and the curtain goes up on SPAIN.
//
// THE CYCLE (the user's): each showpiece gets the stage clock (a big LED countdown hung off the proscenium); dead in
// time, it's CANCELLED (the narrator says so, the house cheers) and the curtain comes down; not dead in time, the
// curtain comes down on it anyway (the house boos) and goes up on the NEXT LIVING showpiece. Damage stays; the dead
// never come back (their wrecks stay on their set). The show's over when all eight are dead: the CURTAIN CALL (a
// cutscene beat: the curtain up on him alone, the house on its feet, confetti, the narrator's wrap), then the
// stage-right wing door opens on the way to the helicopters.
//
// Sub-boss rules: both sides locked once it starts till it's over; no i-frames on any of them (every hit lands; only
// the same move can't land twice); big total HP across the troupes; never again once it's done (SHOW_MEMO); dying
// mid-show it's all eight again, from the lobby's refill. The animatronics are only hitboxes to the engine (BIG health:
// what comes off it each frame is the hit, their real health is here), drawn by robots.ts.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import type { Controls } from '../../../m1/game/platform/input';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { CANVAS_WIDTH, topBand } from '../../../m1/constants';
import { registerM2Kind } from '../../kinds';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { solid, meatheadSays, hands, box, label } from '../section';
import { byPants } from '../cast';
import { registerHurts } from '../pavilion';
import { X, SA, SB, FY, GY, TRIGGER, L, R, MID, SHOW_MEMO } from './layout';
import { theaterOf as stateOf, type Theater, type Member, type Mood } from './state';
import { makeShows, resetTroupe, thinkMember, updateShots, setHooks, sparks, fluid, himOf } from './troupe';
import { narrate, chant, guestSay, quiet } from './talk';
import {
  HURT, CULTURE_NAME, PA_VOLUNTEER, PA_OPEN, INTRO, RETURN, SPIN, CANCEL, PA_HURT, PA_TIMEOUT, PA_HALF, PA_WRAP, PA_EXIT,
  MH_VOLUNTEER, MH_FIRST, MH_KILL, MH_TIMEOUT, MH_CALL, CHANT_CHEER, CHANT_BOO, CHANT_OLE, CHANT_OVATION, GUEST_HIM, GUEST_KILL, GUEST_HURT,
} from './lines';

registerHurts(HURT);

/** Each showpiece's time on the clock (frames). */
export const TIME = 25 * 60;
/** The curtain: down, held while the turntable turns, up (frames). */
const DROP = 40, TURN = 80, RISE = 50;
/** The engine's health for one (it never runs out). */
const BIG = 100000;
const BOT_KIND = 'm2:fl_th_bot', SHIELD_KIND = 'm2:fl_th_shield';

// (the hitboxes: they draw nothing and decide nothing; robots.ts and troupe.ts do it all)
const noAI = (_ctx: FrameContext, e: Enemy) => { e.vel.x = 0; e.vel.y = 0; return true; };
registerM2Kind({ kind: BOT_KIND, stats: { w: 40, h: 80, hp: BIG, contact: 0, mass: 2000, air: true }, ai: noAI, draw: (_c, e) => { e.pauseTimer = 0; }, head: { x: 0, y: -70, r: 12 }, gender: 'n', grab: 'none', midBoss: true });
// (the Spartans: their shields block shots from the front; their spears out front punish a charge into them)
registerM2Kind({
  kind: SHIELD_KIND, stats: { w: 36, h: 82, hp: BIG, contact: 0, mass: 2000, air: true }, ai: noAI, draw: (_c, e) => { e.pauseTimer = 0; },
  make: b => ({ ...b, enemyType: 'shield', isShieldActive: true }), head: { x: 0, y: -74, r: 10 }, gender: 'n', grab: 'none', midBoss: true,
  pointy: { source: 'm2:fl_th_spear', label: 'SPEARS!' },
});

export const makeTheater = (): Theater => ({
  phase: 'wait', t: 0, cur: 0, clock: TIME, curtain: 1, set: 0, turn: 0, shows: makeShows(), shots: [], beam: null,
  lockL: null, lockR: null, lockK: 0, pa: null, paBusy: false, guest: null, chant: null, said: {},
  lastHp: -1, paHurtAt: -9999, guestAt: -9999, oleAt: -9999, killed: 0,
  mood: 'idle', moodT: 0, phones: 0.2, spot: 0, doneAtBuild: false, confetti: [],
});
export const theaterOf = (state: GameState) => stateOf(state, makeTheater);
export const showDone = (state: GameState) => !!state.stageMemo[SHOW_MEMO];
export const showOn = (T: Theater) => T.phase !== 'wait' && T.phase !== 'done';

/** The stage-right wing door (shut till the show's over) at the build; a revisit (or a start past it): done. */
export const buildShow = (state: GameState) => {
  const T = theaterOf(state);
  T.lockR = solid(state, X(SB), FY - 1000, 30, 1000, { hidden: true, tag: 'theater-wing' });
  retireIfPast(state, T);
};
/** Over already (done this go at the land, or a start past it: the checkpoint's only known once the stage is built, so
 *  it's asked again each frame till the show starts): the house empty, the stage struck, the wing door open. */
const retireIfPast = (state: GameState, T: Theater) => {
  if (state.checkpoint >= 102) state.stageMemo[SHOW_MEMO] = '1';
  if (!showDone(state)) return;
  T.phase = 'done'; T.doneAtBuild = true; T.curtain = 0.15; T.set = -1;
  for (const sp of T.shows) { sp.dead = true; for (const m of sp.members) { m.dead = true; m.deadT = 999; } }
  if (T.lockR) T.lockR.x = -1e7;
};

const mood = (T: Theater, m: Mood, t = 90) => { T.mood = m; T.moodT = t; };
const seatX = (state: GameState) => state.camera.x + 120 + Math.random() * (CANVAS_WIDTH - 240);

// ---------------------------------------------------------------------------------------------------------------
// Their health: what came off the hitbox is the hit (every hit lands: no breather), sparks and fluid; dead, it seizes

const damage = (ctx: FrameContext, m: Member, dmg: number, friendly = false) => {
  if (m.dead || dmg <= 0) return;
  const { state } = ctx, T = theaterOf(state);
  m.hp -= dmg; m.flash = 6;
  const cy = m.y - m.h * 0.6;
  if (Math.random() < 0.6) sparks(state, m.x + (Math.random() - 0.5) * m.w * 0.6, cy, 3);
  fluid(state, m.x + (Math.random() - 0.5) * m.w * 0.5, cy, friendly ? 6 : 2 + Math.min(4, Math.floor(dmg / 20)));
  if (friendly) { ctx.fx.spawnDamageNumber({ x: m.x - 10, y: m.y - m.h - 10 }, `${Math.round(dmg)}`, false, '#FCA5A5'); playSound('clang', 0.5, 6); }
  if (m.hp <= 0) kill(ctx, T, m);
};
setHooks({ damage });

const kill = (ctx: FrameContext, T: Theater, m: Member) => {
  const { state } = ctx;
  m.dead = true; m.deadT = 0; m.hp = 0; m.vx = 0; m.vy = 0;
  if (m.y < FY && m.type !== 'leprechaun') m.y = FY;
  if (m.e) { const e = m.e; state.enemies = state.enemies.filter(q => q !== e); m.e = null; }
  sparks(state, m.x, m.y - m.h * 0.6, 16); fluid(state, m.x, m.y - m.h * 0.5, 22, 6);
  playSound('crunch', 1, -6); playSound('clang', 0.9, -10); shakeScreen(state, 6, 3);
  // (lean drops: now and then a small one)
  const r = Math.random();
  if (r < 0.11) state.pickups.push({ id: `th-drop-${state.frame}-${m.k}`, pos: { x: m.x - 10, y: FY - 24 }, vel: { x: 0, y: -3 }, width: 20, height: 20, type: r < 0.06 ? 'small_health' : 'small_ammo', life: 900 });
  const sp = T.shows[m.sp];
  if (sp.members.every(o => o.dead)) { sp.dead = true; T.phase = 'cancel'; T.t = 0; T.shots = []; return; }
  mood(T, 'cheer', 70);
  if (Math.random() < 0.35) guestSay(state, T, GUEST_KILL, seatX(state));
};

const shrugOff = (e: Enemy) => {
  e.frozenTimer = 0; e.isTased = false; e.pauseTimer = 0; e.sludgeTimer = 0; e.isOiled = false; e.isOnFire = false;
  e.fireTimer = 0; e.needleCount = 0; e.shockedUntil = undefined; e.runFrom = undefined; e.puppet = false;
  e.pose = undefined; e.frozeAt = undefined; e.returnHome = false; e.vel.x = 0; e.vel.y = 0;
};

/** The hitboxes of the showpiece that's up: put over the drawing, what came off each read as its hit. `on` false: off
 *  the stage altogether (the curtain's down). */
const syncHitboxes = (ctx: FrameContext, T: Theater, on: boolean) => {
  const { state } = ctx;
  T.shows.forEach((sp, i) => {
    for (const m of sp.members) {
      const want = on && i === T.cur && !m.dead;
      if (!want) { if (m.e) { const e = m.e; state.enemies = state.enemies.filter(q => q !== e); m.e = null; } continue; }
      if (!m.e) {
        const e = makeKindEnemy((m.type === 'hoplite' ? SHIELD_KIND : BOT_KIND) as EnemyKind, m.x, m.y);
        e.health = e.maxHealth = BIG; e.harmless = true; e.unshakeable = true; e.noCrowd = true; e.seen = true; e.noHeal = true;
        m.e = e; state.enemies.push(e);
      }
      const e = m.e;
      // (killed outright by something (blown away, taken out of the world): it's a heavy hit, never a kill)
      const gone = e.health <= 0 || !!e.isBlownAway || !state.enemies.includes(e);
      const lost = Math.max(0, BIG - e.health);
      e.health = BIG; shrugOff(e);
      if (gone) { e.isBlownAway = false; e.meleeFlung = false; e.uppercutFlung = false; e.rotation = 0; if (!state.enemies.includes(e)) state.enemies.push(e); }
      const dmg = gone ? 150 : Math.min(lost, 400);
      e.width = m.w; e.height = m.h; e.pos.x = m.x - m.w / 2; e.pos.y = m.y - m.h; e.facing = m.f;
      if (m.type === 'windmill') { e.width = 70; e.pos.x = m.x - 35; e.height = 210; e.pos.y = m.y - 210; }
      if (m.type === 'leprechaun') { e.height = m.h + 30; }
      if (dmg > 0.01) damage(ctx, m, dmg);
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The cycle

const nextLiving = (T: Theater) => {
  for (let k = 1; k <= T.shows.length; k++) { const i = (T.cur + k) % T.shows.length; if (!T.shows[i].dead) return i; }
  return -1;
};

const start = (state: GameState, T: Theater) => {
  const p = state.player;
  T.phase = 'intro'; T.t = 0; T.spot = 0;
  T.lockL = solid(state, X(SA) - 30, FY - 1000, 30, 1000, { hidden: true, tag: 'theater-lock' });
  if (p.pos.x < X(SA) + 4) p.pos.x = X(SA) + 4;
  p.inCutscene = true; p.vel.x = 0;
  playSound('slam', 1, -10); playSound('rumble', 0.6, -6); shakeScreen(state, 6, 3);
  mood(T, 'cheer', 120);
  narrate(T, pickLine(byPants(state, PA_VOLUNTEER)), () => meatheadSays(state, pickLine(MH_VOLUNTEER), true, () => narrate(T, pickLine(PA_OPEN), () => { T.said.introDone = true; })));
};

const rise = (state: GameState, T: Theater, i: number) => {
  const sp = T.shows[i];
  T.phase = 'rise'; T.t = 0; T.cur = i; T.set = i; T.clock = TIME; T.shots = []; T.beam = null;
  sp.visits++;
  resetTroupe(sp, himOf(state).x);
  playSound('whoosh', 0.6, -12);
  const first = sp.visits === 1;
  narrate(T, pickLine(first ? INTRO[sp.id] : RETURN[sp.id]), () => narrate(T, pickLine(SPIN), () => {
    if (first && Math.random() < 0.6 && state.player.health > 0) meatheadSays(state, pickLine(MH_FIRST[sp.id]), false);
  }));
};

const drop = (T: Theater) => { T.phase = 'drop'; T.t = 0; T.shots = []; T.beam = null; playSound('whoosh', 0.7, -16); };

const call = (state: GameState, T: Theater) => {
  const p = state.player;
  T.phase = 'call'; T.t = 0; T.shots = []; T.beam = null;
  p.inCutscene = true; p.vel.x = 0;
  narrate(T, pickLine(byPants(state, PA_WRAP)), () => meatheadSays(state, pickLine(MH_CALL), true, () => narrate(T, pickLine(PA_EXIT), () => { T.said.callDone = true; })));
};
const finish = (state: GameState, T: Theater, skipped: boolean) => {
  const p = state.player;
  if (skipped) { silenceAll(); T.pa = null; T.paBusy = false; T.chant = null; T.guest = null; }
  T.phase = 'done'; T.t = 0; T.curtain = 0; T.spot = 0;
  p.inCutscene = false;
  state.stageMemo[SHOW_MEMO] = '1';
  if (T.lockL) T.lockL.x = -1e7;
  if (T.lockR) T.lockR.x = -1e7;
  playSound('clang', 0.8, -4);
};

/** Each frame: the show. Returns the controls while a cutscene beat has them. */
export const updateShow = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, T = theaterOf(state), p = state.player, him = himOf(state);
  T.t++;
  if (T.moodT > 0 && --T.moodT === 0) T.mood = 'idle';
  // (the house's phones: up for anything good, way up for him naked)
  const want = T.mood === 'cheer' || T.mood === 'ovation' ? 0.8 : isNude(state) ? 0.9 : isShat(state) ? 0.35 : 0.25;
  T.phones += (want - T.phones) * 0.02;
  T.lockK += ((T.lockL && T.lockL.x > 0 ? 1 : 0) - T.lockK) * 0.25;
  for (const sp of T.shows) for (const m of sp.members) if (m.dead) m.deadT++;
  for (const c of T.confetti) { c.t++; c.x += c.vx + Math.sin(c.t * 0.1) * 0.4; c.y += c.vy; c.vy = Math.min(1.6, c.vy + 0.03); }
  T.confetti = T.confetti.filter(c => c.y < FY + 4 && c.t < 400);
  // (the turntable turns while the curtain's down)
  if (T.phase === 'turn' || T.phase === 'drop') T.turn += 0.02;

  if (T.phase === 'done') return null;
  if (T.phase === 'wait') {
    retireIfPast(state, T);
    if (T.phase !== 'wait') return null;
    if (p.health > 0 && !p.inCutscene && him.x > X(TRIGGER) && him.x < X(SB) && him.feet <= FY + 2) start(state, T);
    else return null;
  }
  // His getting hurt: the house laughs; the narrator, now and then, about him
  if (T.lastHp >= 0 && p.health < T.lastHp && p.health > 0 && showOn(T)) {
    mood(T, 'laugh', 50);
    if (state.frame - T.paHurtAt > 1200 && Math.random() < 0.35 && quiet(T)) { T.paHurtAt = state.frame; narrate(T, pickLine(byPants(state, PA_HURT)), undefined, false); }
    else if (Math.random() < 0.25) guestSay(state, T, GUEST_HURT, seatX(state));
  }
  T.lastHp = p.health;

  const skip = (go: () => void) => { if (T.t > SKIP_AFTER) { offerSkip(); if (takeSkip()) go(); } };

  switch (T.phase) {
    case 'intro': {
      p.inCutscene = true; p.vel.x = 0;
      T.spot = Math.min(1, T.spot + 0.04);
      const done = (skipped: boolean) => {
        if (skipped) { silenceAll(); T.pa = null; T.paBusy = false; T.chant = null; T.guest = null; }
        p.inCutscene = false; rise(state, T, 0);
      };
      if (T.t === 70) chant(T, CHANT_CHEER);
      let out: Controls | null = hands();
      skip(() => { done(true); out = hands(); });
      if (T.phase === 'intro' && (T.said.introDone || T.t > 1500)) done(false);
      syncHitboxes(ctx, T, false);
      return out;
    }
    case 'rise': {
      T.curtain = Math.max(0, 1 - T.t / RISE);
      T.spot = Math.max(0, T.spot - 0.03);
      syncHitboxes(ctx, T, T.curtain < 0.4);
      if (T.t >= RISE) { T.phase = 'play'; T.t = 0; }
      break;
    }
    case 'play': {
      T.clock--;
      if (T.clock > 0 && T.clock <= 300 && T.clock % 60 === 0) playSound('beep', 0.7, T.clock <= 120 ? 6 : 0);
      const sp = T.shows[T.cur];
      T.beam = null;
      for (const m of sp.members) if (!m.dead) thinkMember(ctx, T, sp, m);
      updateShots(ctx, T, sp);
      // (the bull went by him, and he's still standing: OLAY)
      if (T.said.ole) { T.said.ole = false; if (state.frame - T.oleAt > 600) { T.oleAt = state.frame; mood(T, 'cheer', 50); chant(T, CHANT_OLE); } }
      // (somebody in the seats about him, now and then)
      if (T.t % 900 === 450 && Math.random() < 0.5) guestSay(state, T, byPants(state, GUEST_HIM), seatX(state));
      syncHitboxes(ctx, T, true);
      if (T.phase === 'play' && T.clock <= 0) { T.phase = 'timeout'; T.t = 0; }
      break;
    }
    case 'cancel': {
      syncHitboxes(ctx, T, false);
      const sp = T.shows[T.cur];
      if (T.t === 1) {
        T.killed++;
        mood(T, 'cheer', 120);
        chant(T, CHANT_CHEER);
        narrate(T, pickLine(CANCEL[sp.id]), () => {
          if (T.killed === 4) narrate(T, pickLine(byPants(state, PA_HALF)));
          else if (Math.random() < 0.35 && p.health > 0) meatheadSays(state, pickLine(MH_KILL), false);
        });
      }
      if (T.t >= 110) { if (nextLiving(T) < 0) { call(state, T); } else drop(T); }
      break;
    }
    case 'timeout': {
      syncHitboxes(ctx, T, false);
      if (T.t === 1) {
        mood(T, 'boo', 100);
        playSound('alarm', 0.5, 0);
        chant(T, CHANT_BOO);
        narrate(T, pickLine(byPants(state, PA_TIMEOUT)), () => { if (Math.random() < 0.4 && p.health > 0) meatheadSays(state, pickLine(MH_TIMEOUT), false); });
      }
      if (T.t >= 40) drop(T);
      break;
    }
    case 'drop': {
      T.curtain = Math.min(1, T.t / DROP);
      syncHitboxes(ctx, T, false);
      if (T.t >= DROP) { T.phase = 'turn'; T.t = 0; playSound('rumble', 0.7, -10); playSound('thud', 0.6, -12); }
      break;
    }
    case 'turn': {
      T.curtain = 1;
      syncHitboxes(ctx, T, false);
      const nx = nextLiving(T);
      if (T.t === Math.floor(TURN / 2)) T.set = nx;
      if (T.t >= TURN) rise(state, T, nx);
      break;
    }
    case 'call': {
      p.inCutscene = true; p.vel.x = 0;
      syncHitboxes(ctx, T, false);
      // (down, the turntable round to a bare stage, up on him alone: the house on its feet)
      T.curtain = T.t < DROP ? T.t / DROP : T.t < DROP + 50 ? 1 : Math.max(0, 1 - (T.t - DROP - 50) / RISE);
      if (T.t === DROP + 25) T.set = -1;
      if (T.t > DROP + 50) T.spot = Math.min(1, T.spot + 0.04);
      if (T.t === DROP + 60) { mood(T, 'ovation', 99999); chant(T, CHANT_OVATION); playSound('boom', 0.5, 8); }
      if (T.t > DROP + 60 && T.t % 3 === 0 && T.confetti.length < 160) for (let k = 0; k < 3; k++) T.confetti.push({ x: L + Math.random() * (R - L), y: FY - 460, vx: (Math.random() - 0.5) * 1.5, vy: Math.random(), col: ['#DC2626', '#F8FAFC', '#2563EB', '#FDE047'][k % 4], t: 0 });
      // (applause)
      if (T.mood === 'ovation' && T.t % 2 === 0) playSound('clap', 0.12, -6 + Math.random() * 14);
      let out: Controls | null = hands();
      skip(() => { finish(state, T, true); out = null; });
      if (T.phase === 'call' && (T.said.callDone || T.t > 1800)) finish(state, T, false);
      return out;
    }
  }
  // (applause and booing, under it all)
  if ((T.mood === 'cheer' || T.mood === 'laugh') && T.t % 3 === 0) playSound('clap', 0.08, -4 + Math.random() * 14);
  return null;
};

/** The camera held on the stage while the show's on. */
export const showCam = (state: GameState) => (showOn(theaterOf(state)) ? { min: X(SA), max: X(SA) } : undefined);

// ---------------------------------------------------------------------------------------------------------------
// The bars: all of them, and the one that's up (top band, clear of the HUD; none in the cutscene beats)

export const drawShowHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const T = theaterOf(state);
  if ((T.phase === 'intro' || T.phase === 'call') && T.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  if (!showOn(T) || T.phase === 'intro' || T.phase === 'call' || state.player.inCutscene) return;
  const band = topBand(), w = band.x2 - band.x1;
  let hp = 0, all = 0;
  for (const sp of T.shows) for (const m of sp.members) { all += m.max; hp += Math.max(0, m.hp); }
  const sp = T.shows[T.cur], flash = sp.members.some(m => m.flash > 0 && !m.dead);
  box(c, band.x1, 18, w, 12, '#18181B'); box(c, band.x1 + 2, 20, (w - 4) * Math.max(0, Math.min(1, hp / Math.max(1, all))), 8, flash ? '#FECACA' : '#DC2626');
  label(c, `CULTURES OF THE WORLD: ${T.shows.filter(s => !s.dead).length} OF 8 LEFT`, band.mid, 42, '#FDE68A', 8);
  let h1 = 0, a1 = 0;
  for (const m of sp.members) { a1 += m.max; h1 += Math.max(0, m.hp); }
  if (T.phase === 'play' || T.phase === 'rise') {
    box(c, band.x1 + 60, 50, w - 120, 8, '#18181B'); box(c, band.x1 + 61, 51, (w - 122) * Math.max(0, h1 / Math.max(1, a1)), 6, '#F59E0B');
    label(c, CULTURE_NAME[sp.id], band.mid, 70, '#F8FAFC', 7);
  }
};

void GY; void MID;
