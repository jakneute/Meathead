// THE KAIJU FINALE (the water park's level 5, after Ned: the owner's brief 2026-11-06, verbatim in the memory's
// kaiju-finale-design.md). Giant Meathead against the embiggened widow (Zarblax) and Satan, at sunrise, one continuous
// run left to right: AMERICA USA on the way in, then 16 sections, two to a land (HOLLYWOOD, FAIRY, JUNGLE, FOREIGN,
// FUTURE, WILDERNESS, SPOOKY, CARTOON), every major landmark flattened (stepped on, or a boss thrown into it), the
// ending (the owner's, later) after the last.
//
//   sections.ts   the run as data: each section's throw target, the landmarks stomped, its weakness, ground, moves
//   geo.ts        where it all is; the ground's profile
//   landmarks.ts  the landmarks standing, coming down, the rubble (landmarkArt.ts paints them)
//   bosses.ts     the two of them: moving, their moves, the stagger meters (bossArt.ts draws them)
//   throw.ts      Y + B on a stunned one: the heave and the throw into the landmark
//   minions.ts    the tiny aliens and imps at his feet
//   tiny.ts       the guests and cars running for it; the callbacks (the land's people, as a landmark goes)
//   ben.ts        CON-FUCK-TIOUS (all eight pieces given): the weapon told, one of them tied up
//   intro.ts      the opening cutscene; needle.ts the Space Needle's fall to the cape (muskGross.ts)
//   backdrop.ts   the sunrise, the far skylines, the miniature park behind, the ground
//
// Meathead keeps every move and weapon he has (the owner's "giant kaiju but same mechanics": the world's the thing
// that's small). He's resilient, Meathead 1's finale's way (m1 core/resist.ts gritty): hits on him are small, and
// nothing knocks him back or out of what he's doing (hurt() here: health and a breather only). Minions do a tenth of
// a point. Small health after each section; one checkpoint in the fight, after FOREIGN (4 lands of 8).

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Block } from '../../../m1/types';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { groundBlocks } from '../../../m1/game/core/terrain';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H, topBand } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, isTalking, silenceAll } from '../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { hurtTaken } from '../../../m1/game/core/resist';
import { setDropTable } from '../../../m1/game/core/effects';
import { inputDevice, padFamily } from '../../../m1/game/platform/device';
import { keysFor, keyLabel } from '../../../m1/game/platform/keys';
import { drawPadFace } from '../../../m1/game/render/padGlyph';
import { tickScene, drawScene, type Scene } from '../../intro/gym/scene';
import { arrived, isLeaving, carryGut, takeGut, setUi, takeStartCheckpoint, setEndgameAt } from '../../store';
import { saveProgress } from '../../save';
import { stopWeapons } from '../../weapons';
import { setEndgameHour } from '../../timeOfDay';
import { createGrab, updateGrab, drawGrab, type Grab } from '../../moves/grab';
import { btn, pressed, pollM2 } from '../../input';
import { meatheadSays } from '../../adventure/section';
import { registerHurtLines } from '../../kinds';
import { drawKidGross, drawKidGrossBack, warmKidGross } from '../park1/kidGross';
import { drawSonGross, drawSonGrossBack, warmSonGross } from '../park2/sonGross';
import { FINALE_ID, FINALE_STAGE, FINALE_HOUR, FIN_CP_START, FIN_CP_MID } from './where';
import { SECTIONS, MID_AFTER, type SectionDef } from './sections';
import { SEC_X, secEnd, floorY, RUN_END, WORLD_END, GROUND_RUNS } from './geo';
import { makeLandmarks, bringDown, updateLandmarks, drawLandmarks, dropTurned, type Lm } from './landmarks';
import { newBosses, placeBoss, updateBosses, drawBoss, drawSaid, drawAttacks, clearShots, bossList, bossH, bossSays, type Bosses, type Boss, type Arena, STUN_T } from './bosses';
import { startThrow, updateThrow, drawThrow, throwDone, T_RELEASE, type Throw } from './throw';
import { newSwarm, updateSwarm, clearSwarm, spawnMini, ALIEN_MINI, type Swarm } from './minions';
import { scatter, updateTiny, drawTiny, callbackFor, updateCallbacks, drawCallback, callbackOn, clearTiny } from './tiny';
import { newBen, updateBen, benTell, drawBenGiant, drawBenSaid, benSays, type Ben } from './ben';
import { startIntro, grossBeat } from './intro';
import { startNeedle, needleGross } from './needle';
import { drawMuskGross, drawMuskGrossBack } from './muskGross';
import { updateFx, drawFx, drawDust, clearFx, debris, puff } from './fx';
import { drawFinaleBackdrop, drawFinaleGround, prewarmAhead, clearWarm } from './backdrop';
import { warmMuskGross } from './muskGross';
import { contactSheetFin } from './sheet';
import * as L from './lines';

export { FINALE_STAGE };
for (const [source, l] of Object.entries(L.HURT)) registerHurtLines(source, l.hurt, l.death);
const NO_DROPS = { health: 0, ammo: 0 }, PARK_DROPS = { health: 0.06, ammo: 0.05 };

type Ctx = CanvasRenderingContext2D;
type Dress = 'clean' | 'shitty' | 'nude';
const dressed = (state: GameState): Dress => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

export interface Fin {
  grab: Grab; bs: Bosses; sw: Swarm; lms: Lm[]; ben: Ben;
  phase: 'intro' | 'run' | 'needle';
  scene: Scene | null;
  /** Sections done (the next to fight's this one); started (its start's been played). */
  cleared: number; started: number;
  throwing: Throw | null;
  /** The wall at the current section's end (moved on as each is won). */
  gate: Block;
  /** Said once a section: the weakness hint, the stun line. */
  weakSaid: Set<number>; stunSaid: Set<number>;
  /** The land's banner (its name across the top as he comes into it). */
  banner: { text: string; t: number } | null;
  /** The needle's fall's waiting to play (its tower's down). */
  needleDue: boolean;
  /** Frames since the section started (dev: its time), and the times of those done. */
  secT: number; times: number[];
  endSaid: boolean; americaSaid: boolean;
  scattered: Set<Lm>;
  /** The minions' last bite line (frames). */
  biteLineAt: number;
}
const finOf = (state: GameState) => state.stage as Fin | null;
let introSeen = false;
let devStarted = false;
const DEV_CP = (): number | null => { if (!import.meta.env.DEV || devStarted) return null; devStarted = true; const q = new URLSearchParams(location.search).get('finale'); return q !== null ? +q : null; };
/** (dev) Straight to a section (window.__finSec(k) before the stage's built, or ?finsec=k). */
let devSec: number | null = null;

const save = (cp: number) => { setEndgameAt({ stage: FINALE_ID, cp }); saveProgress(); };

// ---------------------------------------------------------------------------------------------------------------
// Him hurt (the finale's: resilient. Health and a breather, no knockback, no flinch: Meathead 1's finale's grit)

const hurt = (ctx: FrameContext, dmg: number, src: string, breather = true) => {
  const { state } = ctx, p = state.player;
  if (p.untouchable || p.inCutscene || p.health <= 0) return;
  if (!ctx.cheats.invincible) p.health -= hurtTaken(ctx.stageId, dmg);
  state.lastHurt = { source: src, at: state.frame };
  if (p.health <= 0) return;
  if (!breather) { p.hurtTimer = Math.max(p.hurtTimer ?? 0, 6); return; }
  p.invincibilityTimer = 75; p.hurtTimer = 75;
  ctx.fx.playGunSound('hurt');
  ctx.fx.speakVulgarity('hurt', src);
};

// ---------------------------------------------------------------------------------------------------------------
// The sections

const secOf = (fin: Fin): SectionDef | null => SECTIONS[fin.cleared] ?? null;
const gateX = (fin: Fin) => (fin.cleared < SECTIONS.length ? secEnd(fin.cleared) : WORLD_END);

/** Coming into the section he's on (its start): the banner, his line about the land, Ben's weapon. */
const startSection = (state: GameState, fin: Fin) => {
  const k = fin.cleared, s = SECTIONS[k];
  fin.started = k; fin.secT = 0;
  // (each section its own fight: both meters from empty)
  for (const b of bossList(fin.bs)) if (b.mode !== 'stunned') b.meter = 0;
  if (s.half === 1) { fin.banner = { text: s.title, t: 0 }; meatheadSays(state, pickLine(L.MH_LAND[s.land][dressed(state)]), true); }
  benTell(fin.ben, k, s.weak.ben);
  // (the rocket man's gross-up, painted in idle moments well before the needle comes down)
  if (s.set === 'needle' || SECTIONS[k + 1]?.set === 'needle') warmMuskGross();
};

/** The throw's landed: the landmark comes down hard, the section's won. */
const throwLanded = (state: GameState, fin: Fin, th: Throw) => {
  bringDown(state, th.m, th.x, true);
  const b = th.b;
  b.mode = 'wreck'; b.wreckT = 0; b.meter = 0; b.x = th.m.x; b.y = th.m.foot;
  debris(th.m.x, th.m.foot - 30, 20, th.m.def.debris, 6, 8);
  if (fin.ben.on && Math.random() < 0.5) setTimeout(() => benSays(fin.ben, L.BEN_NICE, true), 900);
  const k = fin.cleared;
  fin.times[k] = fin.secT;
  fin.cleared++;
  fin.gate.x = gateX(fin);
  // (a little health for the next: in front of him, never under a boss)
  const p = state.player, px = p.pos.x + p.width / 2;
  state.pickups.push({ id: `fin-hp-${k}`, pos: { x: px + 70 - 10, y: floorY(px + 70) - 24 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'small_health', life: 1e9 });
  // (the checkpoint: four lands flat)
  if (k === MID_AFTER) { state.checkpoint = FIN_CP_MID; save(FIN_CP_MID); setTimeout(() => meatheadSays(state, pickLine(L.MH_HALF[dressed(state)]), true), 2500); }
  if (SECTIONS[k].set === 'needle') fin.needleDue = true;
};

/** Both of them off ahead into the next section (out of the wreck, the other leaping on). */
const leaveFor = (state: GameState, fin: Fin, b: Boss) => {
  const k = fin.cleared;
  const x = k < SECTIONS.length ? SEC_X[k] + 340 + (b.who === 'satan' ? 0 : 160) : RUN_END + 500 + (b.who === 'satan' ? 0 : 150);
  b.mode = 'leave'; b.move = null;
  b.air = true; b.tx = x; b.vx = (x - b.x) / 70; b.vy = -0.36 * 35; b.face = 1;
  playSound('whoosh', 0.6, -10);
};

// ---------------------------------------------------------------------------------------------------------------
// The layout

const startAt = (cp: number) => (cp === FIN_CP_MID ? SEC_X[MID_AFTER + 1] + 120 : 200);

export const finaleLayout: StageLayout = {
  left: -600,
  get startX() { return startAt(FIN_CP_START) - 150; },
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    arrived(); stopWeapons();
    { const g = takeGut(); if (g) state.player.gut = g; }
    setDropTable(NO_DROPS);
    { const pick = takeStartCheckpoint(); if (pick !== null) state.checkpoint = pick; }
    { const d = DEV_CP(); if (d !== null) state.checkpoint = d; }
    if (state.checkpoint !== FIN_CP_MID) state.checkpoint = FIN_CP_START;
    setEndgameHour(FINALE_HOUR);
    clearFx(); clearTiny(); dropTurned(); clearWarm();
    // ---- the ground, a wall at the far left, the gate at the section's end
    state.groundRuns = GROUND_RUNS.map(r => ({ ...r }));
    state.blocks = groundBlocks(state.groundRuns);
    state.blocks.push({ x: -560, y: -2000, w: 40, h: 4000, type: 'wall', hidden: true, tag: 'fin-l' } as Block);
    // (the gate: his alone, kept in update (a wall block would have every flung minion splatted on thin air))
    const gate = { x: 0, y: -2000, w: 40, h: 4000, type: 'wall', hidden: true, tag: 'fin-gate' } as Block;
    state.cameraMinX = -500;
    // ---- what's done already (the mid checkpoint: four lands flat), the landmarks of it down
    let cleared = state.checkpoint === FIN_CP_MID ? MID_AFTER + 1 : 0;
    if (import.meta.env.DEV && devSec !== null) { cleared = devSec; devSec = null; }
    const lms = makeLandmarks();
    for (const m of lms) if (m.sec < cleared && (m.sec >= 0 || cleared > 0)) { m.st = 'down'; m.said = true; if (m.def.fall === 'topple') m.ang = Math.PI / 2; }
    const x = cleared > 0 ? SEC_X[cleared] + 120 : startAt(FIN_CP_START);
    const p = state.player;
    p.pos = { x: x - p.width / 2, y: floorY(x) - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1; p.hidden = false; p.inCutscene = false; p.untouchable = false;
    const intro = cleared === 0 && !introSeen;
    const fin: Fin = {
      grab: createGrab(state), bs: newBosses(), sw: newSwarm(), lms, ben: newBen(x - 70),
      phase: intro ? 'intro' : 'run', scene: null, cleared, started: cleared - 1, throwing: null, gate,
      weakSaid: new Set(), stunSaid: new Set(), banner: null, needleDue: false, secT: 0, times: [], endSaid: false, americaSaid: cleared > 0,
      scattered: new Set(), biteLineAt: 0,
    };
    gate.x = gateX(fin);
    state.stage = fin;
    // (the two of them ahead, walking on into the park)
    const bx = cleared > 0 ? SEC_X[cleared] + 420 : 640;
    placeBoss(fin.bs.satan, bx, -1); placeBoss(fin.bs.widow, bx + 170, -1);
    if (intro) { p.inCutscene = true; setUi({ introCutscene: true }); fin.scene = startIntro(state, fin.ben.on); warmKidGross(); warmSonGross(); }
    else setUi({ introCutscene: false });
    state.camera.x = x - W / 2;
    save(state.checkpoint);
    if (import.meta.env.DEV && typeof window !== 'undefined') { const w = window as unknown as Record<string, unknown>; w.__m2 = state; w.__fin = fin; w.__finSheet = contactSheetFin; w.__finSec = (k: number) => { devSec = k; }; w.__finWeak = () => SECTIONS[fin.cleared]?.weak.w ?? null; }
    return { x, y: floorY(x) };
  },
  update: (ctx: FrameContext, controls: Controls) => {
    const { state } = ctx;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; setDropTable(PARK_DROPS); return { ...NO_CONTROLS }; }
    const fin = finOf(state);
    if (!fin) return controls;
    const p = state.player;
    setUi({ near: null, map: null, nearExit: false, upPrompt: null });
    // ---- the opening, the needle's fall: cutscenes (no input, no HUD)
    if (fin.phase === 'intro' || fin.phase === 'needle') {
      p.inCutscene = true; p.vel.x = 0; setUi({ introCutscene: true });
      if (fin.scene && tickScene(fin.scene)) {
        const skipped = fin.scene.skipped;
        if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; }
        if (fin.phase === 'intro') introSeen = true;
        const was = fin.phase;
        fin.scene = null; fin.phase = 'run'; p.inCutscene = false; setUi({ introCutscene: false });
        if (was === 'needle') setTimeout(() => meatheadSays(state, pickLine(L.MH_OOPS[dressed(state)]), true), 400);
      }
      return { ...NO_CONTROLS };
    }
    fin.secT++;
    // (the gate at the section's end: him held short of it)
    if (p.pos.x + p.width > fin.gate.x) { p.pos.x = fin.gate.x - p.width; if (p.vel.x > 0) p.vel.x = 0; }
    const px = p.pos.x + p.width / 2;
    // ---- into the next section
    if (fin.cleared < SECTIONS.length && fin.started < fin.cleared && px > SEC_X[fin.cleared] - 60) startSection(state, fin);
    if (fin.banner && ++fin.banner.t > 200) fin.banner = null;
    if (!fin.americaSaid && px > 420) { fin.americaSaid = true; meatheadSays(state, pickLine(L.MH_AMERICA[dressed(state)]), true); }
    const sec = secOf(fin), fighting = !!sec && fin.started === fin.cleared && !fin.throwing;
    // ---- the throw under way
    let out: Controls = controls;
    let frozen = false;
    if (fin.throwing) {
      const th = fin.throwing;
      const held = updateThrow(state, th, t => throwLanded(state, fin, t));
      frozen = th.t < T_RELEASE;
      if (held) { p.hidden = true; p.untouchable = true; p.vel.x = 0; out = { ...NO_CONTROLS }; }
      else { p.hidden = false; p.untouchable = false; }
      if (throwDone(th)) { fin.throwing = null; state.cameraOverride = null; }
    }
    // ---- Ben, the bosses
    const heldWho = updateBen(state, fin.ben, fin.bs, fighting, frozen);
    const ar: Arena = {
      sec, a: fin.cleared < SECTIONS.length ? SEC_X[fin.cleared] : RUN_END, b: gateX(fin) - 60, held: heldWho,
      frozen, calm: !fighting,
      crush: (x0, x1) => { for (const m of fin.lms) if (m.st === 'up' && !m.target && m.x + m.def.w / 2 > x0 && m.x - m.def.w / 2 < x1) bringDown(state, m, (x0 + x1) / 2); },
      hurt: (d, s) => hurt(ctx, d, s),
      minion: x => spawnMini(state, fin.sw, ALIEN_MINI, x),
    };
    // (the section won: out of the wreck and on, the other one with them)
    for (const b of bossList(fin.bs)) {
      if (b.mode === 'wreck' && b.wreckT > 100) leaveFor(state, fin, b);
      if (!fighting && !fin.throwing && (b.mode === 'walk') && fin.cleared > 0 && b.x < SEC_X[Math.min(fin.cleared, SECTIONS.length - 1)] && fin.cleared < SECTIONS.length) leaveFor(state, fin, b);
      if (fin.cleared >= SECTIONS.length && b.mode === 'walk' && b.x < RUN_END) leaveFor(state, fin, b);
    }
    updateBosses(ctx, fin.bs, ar, sec?.weak ?? { w: 'GUN', ben: 'GUN' }, b => {
      // (the first weakness hit of a section: his hint, if he's got the weapon and Ben's not there to have said it)
      if (fin.weakSaid.has(fin.cleared) || fin.ben.on || !p.availableWeapons?.includes(p.currentWeapon)) return;
      fin.weakSaid.add(fin.cleared); if (!isTalking()) meatheadSays(state, pickLine(L.MH_WEAK[dressed(state)]), false);
      void b;
    }, b => {
      if (fin.stunSaid.has(fin.cleared)) return;
      fin.stunSaid.add(fin.cleared); setTimeout(() => { if (!isTalking()) meatheadSays(state, pickLine(L.MH_STUNNED[dressed(state)]), false); }, 1400);
      void b;
    });
    // ---- the landmarks: stepped on, the people out of them, the wreckage
    const feet = p.pos.y + p.height;
    for (const m of fin.lms) {
      if (m.st !== 'up') continue;
      const d = m.def;
      if (!fin.scattered.has(m) && Math.abs(px - m.x) < 460) { fin.scattered.add(m); scatter(state, m.x, d.w, Math.min(14, 4 + Math.round(d.w / 30))); }
      if (m.target || p.hidden) continue;
      if (px > m.x - d.w / 2 + 6 && px < m.x + d.w / 2 - 6 && feet > m.foot - Math.min(d.h, 90)) bringDown(state, m, px);
    }
    updateLandmarks(state, fin.lms, m => {
      callbackFor(state, m);
      if (m.def.id === 'needle') fin.needleDue = true;
      else if (!m.target && Math.random() < 0.15 && !isTalking() && !callbackOn()) meatheadSays(state, pickLine(L.MH_STOMP[dressed(state)]), false);
    });
    // (the needle's down: its fall, as soon as it's flat and nothing's mid-throw)
    if (fin.needleDue && !fin.throwing && fin.lms.find(m => m.def.id === 'needle')?.st === 'down') {
      fin.needleDue = false; fin.phase = 'needle'; fin.scene = startNeedle();
      clearShots(fin.bs); p.inCutscene = true; setUi({ introCutscene: true });
      return { ...NO_CONTROLS };
    }
    updateFx(state);
    // (what's coming, painted ahead a piece a frame: the next tiles, the next landmarks up to a screen and a half off)
    prewarmAhead(state, fin.lms.filter(m => m.st === 'up' && m.x - m.def.w / 2 > state.camera.x + W - 40 && m.x - m.def.w / 2 < state.camera.x + W * 2.5).map(m => ({ key: `fin-lm-${m.def.id}`, x: -m.def.w / 2 - 6, y: -m.def.h - 8, w: m.def.w + 12, h: m.def.h + 12, paint: m.def.paint })));
    const bossFeet = bossList(fin.bs).filter(b => b.mode !== 'off' && b.mode !== 'flying' && b.mode !== 'carried').map(b => ({ x0: b.x - 22, x1: b.x + 22 }));
    updateTiny(state, [{ x0: p.pos.x + 6, x1: p.pos.x + p.width - 6 }, ...bossFeet], (x, y) => { state.particles.push({ pos: { x, y: y - 2 }, vel: { x: 0, y: -1 }, life: 20, color: '#B91C1C', size: 2 } as never); });
    updateCallbacks(state, !!fin.throwing && fin.throwing.t < T_RELEASE + 20);
    // ---- the minions
    if (!frozen) updateSwarm(ctx, fin.sw, fighting, fin.cleared, dmg => {
      hurt(ctx, dmg, 'm2:fin_minion', false);
      // (a line about them now and then, only when nobody's talking: there's too many to yell at each)
      if (state.frame - fin.biteLineAt > 1500 && !isTalking() && !callbackOn()) { fin.biteLineAt = state.frame; ctx.fx.speakVulgarity('hurt', 'm2:fin_minion'); }
    }, (x, y, blood) => { for (let k = 0; k < 4; k++) state.particles.push({ pos: { x, y: y - 2 }, vel: { x: (Math.random() - 0.5) * 2, y: -1 - Math.random() }, life: 24, color: blood, size: 2 } as never); puff(x, y, 3, '#C8BCA8', 0, -0.3, 16); });
    if (!fighting && fin.throwing === null && fin.sw.list.length && fin.cleared >= SECTIONS.length) clearSwarm(state, fin.sw);
    // ---- Y + B on a stunned one, close enough: the throw
    if (!fin.throwing && fighting && sec && p.isGrounded && p.health > 0) {
      pollM2(state.frame);
      const chord = pressed('beatKey') || (btn('y') && pressed('b')) || (pressed('y') && btn('b'));
      const near = bossList(fin.bs).find(b => b.mode === 'stunned' && Math.abs(b.x - px) < 34 + 80);
      if (near && (chord || (import.meta.env.DEV && (window as unknown as { __finAuto?: boolean }).__finAuto))) {
        const m = fin.lms.find(q => q.target && q.sec === fin.cleared);
        if (m) {
          fin.throwing = startThrow(state, near, m);
          clearShots(fin.bs);
          if (fin.ben.mode === 'hold' && fin.ben.on_) { fin.ben.on_.mode = 'walk'; fin.ben.mode = 'off'; fin.ben.on_ = null; fin.ben.t = 0; }
          near.said = null; bossSays(state, near, near.who === 'satan' ? L.SATAN_THROWN : L.WIDOW_THROWN);
          setTimeout(() => { if (!isTalking()) meatheadSays(state, pickLine(L.MH_THROW[dressed(state)]), false); }, 900);
          fin.grab.pend = null;
          return { ...NO_CONTROLS };
        }
      }
    }
    // ---- the run's end (the owner's ending goes here)
    if (fin.cleared >= SECTIONS.length && !fin.endSaid && px > RUN_END + 200) {
      fin.endSaid = true;
      meatheadSays(state, pickLine(L.MH_END[dressed(state)]), true);
      setUi({ notice: { text: 'THE ENDING GOES HERE. (NOT BUILT YET.)', at: performance.now(), ms: 8000 } });
    }
    // ---- the camera: along, never past the gate by more than shows its landmark
    if (!fin.throwing) state.cameraMaxX = Math.min(WORLD_END, gateX(fin) + 260) - W;
    if (import.meta.env.DEV) out = autopilot(state, fin, out);
    setUi({ introCutscene: false });
    if (fin.throwing && out === NO_CONTROLS) return out;
    return updateGrab(ctx, fin.grab, out);
  },
  drawBackdrop: (c, state) => { drawFinaleBackdrop(c, state); return true; },
  drawBack: (c, state) => {
    const fin = finOf(state);
    drawFinaleGround(c, state);
    if (!fin) return;
    drawLandmarks(c, state, fin.lms);
    drawFx(c, state);
    drawTiny(c, state);
  },
  drawMid: (c, state) => {
    const fin = finOf(state);
    if (!fin) return;
    for (const b of bossList(fin.bs)) if (b.mode !== 'carried' && b.mode !== 'flying') drawBoss(c, state, b);
    drawBenGiant(c, state, fin.ben);
  },
  drawFront: (c, state) => {
    const fin = finOf(state);
    if (!fin) return;
    drawAttacks(c, state, fin.bs);
    if (fin.throwing) drawThrow(c, state, fin.throwing);
    drawDust(c, state);
    drawGrab(c, state, fin.grab);
    for (const b of bossList(fin.bs)) { drawSaid(c, b); if (b.mode === 'stunned' && !fin.throwing) drawPrompt(c, state, b); }
    drawBenSaid(c, fin.ben);
    drawCallback(c);
  },
  drawHud: (c, state) => {
    const fin = finOf(state);
    if (!fin) return;
    if (fin.scene) {
      drawScene(c, fin.scene);
      const g = fin.phase === 'intro' ? grossBeat(fin.scene) : null;
      if (g) drawDeadGross(c, g, fin.scene.shotT, state.frame);
      if (fin.phase === 'needle' && needleGross(fin.scene)) { drawMuskGrossBack(c, W, H); drawMuskGross(c, W / 2, H / 2 + 10, 0.95, fin.scene.shotT); redrawBubble(c, fin.scene); }
      return;
    }
    if (fin.banner) drawBanner(c, fin.banner);
    drawMeters(c, fin);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The HUD bits

/** The gross-ups of their dead boys (over the scene's black picture): gray, cold, the flies at them. */
const drawDeadGross = (c: Ctx, who: 'kid' | 'son', t: number, f: number) => {
  c.save();
  if (who === 'kid') { drawKidGrossBack(c, W, H); drawKidGross(c, W / 2, H / 2 + 6, 0.92, 0, true, 0); }
  else { drawSonGrossBack(c, W, H); drawSonGross(c, W / 2, H / 2 + 6, 0.92, 0, true, 0); }
  // (dead: the color gone out of them, a cold cast over it)
  c.globalCompositeOperation = 'saturation'; c.fillStyle = 'rgba(128, 128, 128, 0.75)'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = '#B8C4C8'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  // (the flies)
  for (let k = 0; k < 9; k++) {
    const a = f * 0.09 + k * 2.1, x = W / 2 + Math.cos(a * (1 + (k % 3) * 0.3)) * (120 + k * 18), y = H / 2 - 40 + Math.sin(a * 1.7 + k) * (70 + k * 6);
    c.fillStyle = '#0A0A0A'; c.fillRect(Math.round(x), Math.round(y), 4, 3); c.fillStyle = 'rgba(220, 230, 240, 0.7)'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 3, 2);
  }
  c.font = '14px "Press Start 2P"'; c.textAlign = 'center';
  const name = who === 'kid' ? 'ZORZARBLAX' : 'MEHPHISTO';
  c.fillStyle = '#000'; c.fillText(name, W / 2 + 2, H - 40 + 2); c.fillStyle = '#DC2626'; c.fillText(name, W / 2, H - 40);
  c.textAlign = 'left';
  c.restore();
  void t;
};
/** The scene's bubble, again, over a gross-up drawn over the scene (the needle's rocket man). */
const redrawBubble = (c: Ctx, s: Scene) => { if (s.said) { c.save(); c.font = '10px "Press Start 2P"'; c.textAlign = 'center'; const tx = s.said.text; c.fillStyle = '#000'; c.fillRect(40, H - 92, W - 80, 54); c.fillStyle = '#F8FAFC'; c.fillRect(42, H - 90, W - 84, 50); c.fillStyle = '#111'; wrapAt(c, tx, W / 2, H - 70, W - 110); c.restore(); } };
const wrapAt = (c: Ctx, t: string, x: number, y: number, wide: number) => {
  const rows: string[] = []; let cur = '';
  for (const w of t.split(' ')) { const n = cur ? `${cur} ${w}` : w; if (c.measureText(n).width > wide && cur) { rows.push(cur); cur = w; } else cur = n; }
  if (cur) rows.push(cur);
  rows.forEach((r, i) => c.fillText(r, x, y + i * 15 - (rows.length - 1) * 7));
};

/** The land's name across the top as he comes into it. */
const drawBanner = (c: Ctx, b: { text: string; t: number }) => {
  const k = Math.min(1, b.t / 20, (200 - b.t) / 20), y = 150;
  c.save(); c.globalAlpha = Math.max(0, k);
  c.font = '20px "Press Start 2P"'; c.textAlign = 'center';
  c.fillStyle = '#000'; c.fillText(b.text, W / 2 + 3, y + 3); c.fillStyle = '#FDE047'; c.fillText(b.text, W / 2, y);
  c.restore();
};

/** The two stagger meters (clear of the HUD's corner: topBand). */
const drawMeters = (c: Ctx, fin: Fin) => {
  const band = topBand(), w = Math.min(200, (band.x2 - band.x1 - 20) / 2), y = 22;
  const list = bossList(fin.bs);
  list.forEach((b, i) => {
    if (b.mode === 'off') return;
    const x = band.x1 + 10 + i * (w + 20);
    c.font = '8px "Press Start 2P"'; c.fillStyle = '#000'; c.fillText(b.who === 'satan' ? 'SATAN' : 'ZARBLAX', x + 1, y + 1); c.fillStyle = '#F8FAFC'; c.fillText(b.who === 'satan' ? 'SATAN' : 'ZARBLAX', x, y);
    c.fillStyle = '#000'; c.fillRect(x - 1, y + 5, w + 2, 12);
    c.fillStyle = '#3A1A1A'; c.fillRect(x, y + 6, w, 10);
    const stun = b.mode === 'stunned', k = stun ? 1 - b.stunT / STUN_T : b.meter / 100;
    c.fillStyle = stun ? ((b.stunT >> 3) % 2 ? '#FDE047' : '#F97316') : '#F59E0B'; c.fillRect(x, y + 6, Math.round(w * k), 10);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, y + 6, Math.round(w * k), 2);
    if (stun) { c.fillStyle = '#000'; c.fillText('STUNNED', x + w / 2 - 27, y + 15); }
  });
  c.font = '6px "Press Start 2P"'; c.fillStyle = '#F8FAFC'; c.fillText('STAGGER', band.x1 + 10, y + 26);
};

/** Over a stunned one's head: the beatdown's buttons (Y + B on a pad, as the pad is; the beatdown key on the keys). */
const drawPrompt = (c: Ctx, state: GameState, b: Boss) => {
  const x = Math.round(b.x), y = Math.round(b.y - bossH(b) - 4), pulse = Math.floor(state.frame / 8) % 2;
  if (inputDevice() === 'pad') {
    drawPadFace(c, x - 16, y, pulse ? 10 : 9, 'Y', padFamily());
    c.font = '10px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('+', x + 1, y + 5); c.fillStyle = '#F8FAFC'; c.fillText('+', x, y + 4); c.textAlign = 'left';
    drawPadFace(c, x + 16, y, pulse ? 10 : 9, 'B', padFamily());
  } else {
    const key = keyLabel(keysFor('beatdown')[0] ?? 'keyr');
    c.font = '8px "Press Start 2P"';
    const w = Math.max(20, c.measureText(key).width + 12);
    c.fillStyle = '#18181B'; c.fillRect(x - w / 2 - 1, y - 10 - pulse, w + 2, 20);
    c.fillStyle = '#E4E4E7'; c.fillRect(x - w / 2, y - 9 - pulse, w, 18); c.fillStyle = '#A1A1AA'; c.fillRect(x - w / 2, y + 6 - pulse, w, 3);
    c.textAlign = 'center'; c.fillStyle = '#18181B'; c.fillText(key, x, y + 3 - pulse); c.textAlign = 'left';
  }
};

// ---------------------------------------------------------------------------------------------------------------
// (dev) The autopilot: window.__finAuto = true plays it as a decent player would, for timing the sections and the
// perf runs: the section's weakness in hand, walking up on the nearer one, firing; jumping waves and low beams;
// ducking the chest laser; the throw when one's down.

const autopilot = (state: GameState, fin: Fin, c: Controls): Controls => {
  if (!(window as unknown as { __finAuto?: boolean }).__finAuto || fin.throwing) return c;
  const p = state.player, px = p.pos.x + p.width / 2, sec = secOf(fin);
  const live = bossList(fin.bs).filter(b => b.mode !== 'off' && b.mode !== 'wreck' && b.mode !== 'leave' && b.mode !== 'flying' && b.mode !== 'carried');
  const stunned = live.find(b => b.mode === 'stunned');
  const target = stunned ?? live.sort((a, b) => Math.abs(a.x - px) - Math.abs(b.x - px))[0];
  const out: Controls = { ...c, left: false, right: false, shoot: false, jump: false, down: false };
  if (!target || !sec || fin.started !== fin.cleared) { out.right = true; return out; }
  const dx = target.x - px, want = stunned ? 40 : 180;
  if (Math.abs(dx) > want + 30) { if (dx > 0) out.right = true; else out.left = true; }
  else if (Math.abs(dx) < want - 60 && !stunned) { if (dx > 0) out.left = true; else out.right = true; }
  else p.facing = dx > 0 ? 1 : -1;
  if (!stunned) out.shoot = state.frame % 2 === 0 || sec.weak.w === 'FLINTLOCK' || sec.weak.w === 'SOUL_SUCKER' || sec.weak.w === 'CROSSBOW';
  if (sec.weak.w === 'FLINTLOCK' && state.frame % 70 > 60) out.shoot = false;
  // (dodges)
  const bs = fin.bs;
  if (bs.shots.some(s => s.on && s.kind === 'wave' && Math.abs(s.x - px) < 60 && Math.sign(px - s.x) === Math.sign(s.vx))) out.jump = true;
  if (bs.beam.on && bs.beam.low && Math.abs(bs.beam.x1 - px) < 60) out.jump = true;
  if (bs.beam.on && !bs.beam.low) out.down = true;
  return out;
};
