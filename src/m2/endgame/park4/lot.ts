// THE WATER PARK, level 4: the lot again (the same lot outside the water park, endgame/lot: its sky, its skyline, the
// aliens and the demons still going at each other up there, drawLotBackdrop), its far end, the stalls he never parked
// in: NED THE NECROMANCER's boss rush. The owner: "the end of the fight on stage 3 will take you to the parking lot
// where stage 4 will be ned the necromancer taunting you, disappearing and opening the 8 portals for a refight. all 8
// portals are next to a parking lot pylon that represents where you will go. like 'dinosaur'. you know how theme park
// parking lots use pictures of things to represent your parking area? it will be there. it will use a similar
// 'carousel' effect as the hub, as you walk to each portal for the refight."
//
// The carousel: the hub's (the world wrapped round the inside of a turning cylinder, a lap shifted back round as he
// walks off either end: hub/index.ts): eight stalls round the ring, each a pylon with its picture sign (DINOSAUR, BAT,
// ROCKET, STAR, LIBERTY, TRAIN, CASTLE, ANVIL, its number) and Ned's portal beside it. UP at one: through it, to its
// refight (park4/refight.ts). Any order. Each one's spent once its boss is down again (a scorched ring, shut).
//
//   First in (nothing done yet): Ned turns up in a poof ahead of him (his gross-up, a beat), his piece, Meathead's, gone
//   in another poof, and the portals open round the ring one after another. A short skippable cutscene (no input, no
//   HUD, all-or-nothing, bubbles), every line in its pants state.
//   All eight done: Ned's back (park4/ned.ts), his fight, here; after it, the last battle's stub (marked: not built).
// Hour 13 (level 3's boss dead); 14 once Ned is. The file: level 4, which refights are done (and Ned), CONTINUE back
// here with those skipped. No backtracking: the lot's a ring, nothing else.

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import { groundBlocks } from '../../../m1/game/core/terrain';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { GROUND_Y, CANVAS_WIDTH as W, CANVAS_HEIGHT as H, topBand } from '../../../m1/constants';
import { playSound, playMenuOk, playMenuBack } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { stamp } from '../../../m1/game/render/stamp';
import { arrived, isLeaving, carryGut, takeGut, setUi, takeStartCheckpoint, setStartCheckpoint, setEndgameAt, endgameAt, goTo } from '../../store';
import { saveProgress } from '../../save';
import { stopWeapons } from '../../weapons';
import { todLight, setEndgameHour } from '../../timeOfDay';
import { createGrab, updateGrab, drawGrab, grabbing, type Grab } from '../../moves/grab';
import { speak, meatheadSays, saidOver } from '../../adventure/section';
import { drawLotBackdrop } from '../lot/art';
import { setRefightOn } from './hook';
import { REFIGHTS } from './refights';
import type { RefightDef, SignPic } from './defs';
import { L4_ID, L4_STAGE, L4_HOUR, LOT_CP, NED_CP, AFTER_CP, REFIGHT_LANDS, refightId } from './where';
import { FINALE_ID, FIN_CP_START } from '../finale/where';
import { drawNed, drawPoof, type NedPose } from './nedArt';
import { drawNedGross, drawNedGrossBack, warmNedGross } from './nedGross';
import { type NedFight, startNed, updateNed, drawNedFight, drawNedHud } from './ned';
import { markBossFight } from '../../bossQuiet';
import * as L from './lines/ned';
import { updateCrash, drawCrash } from '../park3/ride';

type Ctx = CanvasRenderingContext2D;
type Dressed = 'clean' | 'shitty' | 'nude';
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The ring

export const RING = { x0: -60000, slot: 520, radius: 420, horizon: 330 } as const;
const N = REFIGHT_LANDS.length, CIRC = RING.slot * N;
const slotX = (i: number) => RING.x0 + (i + 0.5) * RING.slot;
/** Each stall's portal (a little right of its middle) and its pylon (left of it). */
const portalX = (i: number) => slotX(i) + 50;
const pylonX = (i: number) => slotX(i) - 90;
const BACK = GROUND_Y - 40;

interface Lot4 {
  grab: Grab;
  /** What's done (lands, and 'ned'). */
  done: Set<string>;
  scene: 'intro' | 'free' | 'enter' | 'nedIn' | 'fight' | 'after';
  t: number; skipT: number; step: number;
  /** Ned in the intro: where, his pose, what he's saying (only while it's said), the poof; the gross-up's frames. */
  nedX: number; nedPose: NedPose; nedShown: boolean; said: string | null; poof: { x: number; t: number } | null; gross: number;
  /** How many portals are open (the intro opens them one by one). */
  open: number;
  /** Going through one: which, frames. */
  into: number;
  upWas: boolean;
  fight: NedFight | null;
  /** The stub's notice shown. */
  stubbed: boolean;
  /** Back from a refight: frames till his line about it (0: none). */
  backIn: number;
  tok: number;
}
const lotOf = (state: GameState) => state.stage as Lot4 | null;
let introSeen = false;
let token = 0;

const shiftLap = (state: GameState, dx: number) => {
  state.player.pos.x += dx; state.camera.x += dx;
  for (const p of state.particles) p.pos.x += dx;
  for (const p of state.projectiles) p.pos.x += dx;
  for (const p of state.pickups) p.pos.x += dx;
  for (const d of state.damageNumbers) d.pos.x += dx;
};
const defAt = (i: number): RefightDef => REFIGHTS[REFIGHT_LANDS[i]];

const save = (state: GameState, lot: Lot4, cp: number) => {
  const rem = [...lot.done];
  setEndgameAt({ stage: L4_ID, cp, rematches: rem });
  saveProgress();
  void state;
};
const nedSays = (lot: Lot4, text: string, onDone: () => void) => {
  const tok = ++token; lot.tok = tok;
  speak(L.NED_VOICE, text, s => { if (lot.tok === tok) lot.said = s?.text ?? null; }, true, () => { if (lot.tok === tok) onDone(); });
};

// ---------------------------------------------------------------------------------------------------------------
// The intro: Ned, the portals

const endIntro = (state: GameState, lot: Lot4, skipped: boolean) => {
  if (skipped) { silenceAll(); state.playerVulgarityTimer = 0; }
  token++; lot.said = null; lot.nedShown = false; lot.poof = null; lot.gross = -1;
  lot.open = N; lot.scene = 'free'; introSeen = true;
  state.player.inCutscene = false; setUi({ introCutscene: false });
};
const runIntro = (state: GameState, lot: Lot4) => {
  const p = state.player, d = dressed(state);
  lot.t++; lot.skipT++;
  p.inCutscene = true; p.vel.x = 0; p.facing = 1;
  setUi({ introCutscene: true });
  if (lot.skipT > SKIP_AFTER) offerSkip();
  if (lot.skipT > SKIP_AFTER && takeSkip()) { endIntro(state, lot, true); return; }
  if (lot.poof) { lot.poof.t++; if (lot.poof.t > 30) lot.poof = null; }
  // 0: a beat; in he poofs, ahead of him
  if (lot.step === 0 && lot.t > 40) { lot.step = 1; lot.nedX = p.pos.x + p.width / 2 + 170; lot.poof = { x: lot.nedX, t: 0 }; lot.nedShown = true; lot.nedPose = 'float'; playSound('poof', 0.9); playSound('whoosh', 0.6, -6); lot.t = 0; }
  // 1: his gross-up, a beat, silent
  if (lot.step === 1 && lot.t === 30) { lot.step = 2; lot.gross = 0; lot.t = 0; playSound('ding', 0.6, -6); warmNedGross(); }
  if (lot.step === 2) { lot.gross++; if (lot.gross > 100) { lot.gross = -1; lot.step = 3; lot.nedPose = 'point';
    nedSays(lot, pickLine(L.NED_APPEAR), () => meatheadSays(state, pickLine(L.MH_WHO[d]), true, () => { lot.nedPose = 'cast'; nedSays(lot, pickLine(L.NED_TAUNT[d]), () => { lot.nedPose = 'idle'; nedSays(lot, pickLine(L.NED_BYE), () => { lot.step = 4; lot.t = 0; }); }); }));
  } }
  // 4: gone in a poof; the portals open round the ring, one after another
  if (lot.step === 4 && lot.t === 1) { lot.poof = { x: lot.nedX, t: 0 }; lot.nedShown = false; playSound('poof', 0.9); }
  if (lot.step === 4 && lot.t > 20 && lot.t % 14 === 0 && lot.open < N) { lot.open++; playSound('whoosh', 0.5, -10 + lot.open); playSound('ignite', 0.3, -12); }
  if (lot.step === 4 && lot.open >= N && lot.t > 150) { lot.step = 5; meatheadSays(state, pickLine(L.MH_AFTER[d]), true, () => endIntro(state, lot, false)); }
  if (lot.t > 60 * 40) endIntro(state, lot, false);
};

// ---------------------------------------------------------------------------------------------------------------
// After Ned: the last battle's stub

/** The last battle: the kaiju finale (endgame/finale), level 5, from its start (Ned's dead: his line, then on). */
export const startLastBattle = (state: GameState, lot: Lot4) => {
  if (lot.stubbed) return;
  lot.stubbed = true;
  meatheadSays(state, pickLine(L.MH_LAST[dressed(state)]), false, () => { setStartCheckpoint(FIN_CP_START); goTo(FINALE_ID); });
};

// ---------------------------------------------------------------------------------------------------------------
// The layout

const startAt = () => {
  const r = endgameAt()?.rematches?.filter(l => l !== 'ned') ?? [];
  const last = r.length ? REFIGHT_LANDS.indexOf(r[r.length - 1] as typeof REFIGHT_LANDS[number]) : -1;
  return last >= 0 ? portalX(last) - 70 : slotX(0) - 160;
};

export const lot4Layout: StageLayout = {
  left: RING.x0 - CIRC - 600,
  // (the engine puts him at startX + 150: back out of the portal he went through last, else at the first stall)
  get startX() { return startAt() - 150; },
  verticalCamera: false,
  startsStanding: true,
  build: (state) => {
    const fresh = isLeaving();
    arrived(); stopWeapons();
    setRefightOn(null);
    { const g = takeGut(); if (g) state.player.gut = g; }
    const runs = [{ x1: RING.x0 - CIRC, y1: GROUND_Y, x2: RING.x0 + CIRC * 2, y2: GROUND_Y, surface: 'concrete' }];
    state.groundRuns = runs;
    state.blocks.push(...groundBlocks(runs));
    state.cameraMinX = RING.x0 - CIRC;
    const rec = endgameAt();
    const done = new Set(rec?.rematches ?? []);
    let cp = takeStartCheckpoint() ?? state.checkpoint ?? LOT_CP;
    if (![LOT_CP, NED_CP, AFTER_CP].includes(cp)) cp = LOT_CP;
    // (the test picker straight to Ned, or past him: as if the eight were done)
    if (cp >= NED_CP) for (const l of REFIGHT_LANDS) done.add(l);
    if (cp === AFTER_CP) done.add('ned');
    const all = REFIGHT_LANDS.every(l => done.has(l));
    const nedDead = done.has('ned');
    state.checkpoint = nedDead ? AFTER_CP : all ? NED_CP : LOT_CP;
    setEndgameHour(nedDead ? L4_HOUR + 1 : L4_HOUR);
    // (where he stands: back out of the portal he went through last; else at the first stall)
    const x = startAt();
    const p = state.player;
    p.pos = { x: x - p.width / 2, y: GROUND_Y - p.height }; p.vel = { x: 0, y: 0 }; p.facing = 1; p.hidden = false; p.inCutscene = false;
    const intro = !all && !nedDead && done.size === 0 && !introSeen;
    const lot: Lot4 = {
      grab: createGrab(state), done, scene: nedDead ? 'after' : all ? 'nedIn' : intro ? 'intro' : 'free', t: 0, skipT: 0, step: 0,
      nedX: 0, nedPose: 'idle', nedShown: false, said: null, poof: null, gross: -1, open: intro ? 0 : N, into: -1, upWas: true, fight: null, stubbed: false, tok: 0, backIn: fresh && done.size > 0 && !all ? 50 : 0,
    };
    state.stage = lot;
    if (intro || all) { p.inCutscene = true; setUi({ introCutscene: true }); }
    state.camera.x = x - W / 2;
    save(state, lot, state.checkpoint);
    if (import.meta.env.DEV) (window as unknown as { __lot4: Lot4 }).__lot4 = lot;
    return { x, y: GROUND_Y };
  },
  update: (ctx: FrameContext, controls: Controls) => {
    const { state } = ctx;
    if (import.meta.env.DEV) (window as unknown as { __m2: GameState }).__m2 = state;
    if (isLeaving()) { stopWeapons(); carryGut(state.player); state.player.vel.x = 0; return { ...NO_CONTROLS }; }
    const lot = lotOf(state);
    if (!lot) return controls;
    // (in from level 3 on GUPPLAX's corpse: the crash landing first (park3/ride.ts), then on as ever)
    if (updateCrash(state)) return { ...NO_CONTROLS };
    const p = state.player;
    let cx = p.pos.x + p.width / 2;
    // (round the lap: never runs out of ring; not in Ned's fight, his arena's held still)
    if (!lot.fight) {
      if (cx < RING.x0) { shiftLap(state, CIRC); cx += CIRC; }
      else if (cx > RING.x0 + CIRC) { shiftLap(state, -CIRC); cx -= CIRC; }
    }
    setUi({ near: null, map: null, nearExit: false, upPrompt: null });
    if (lot.scene === 'intro') { runIntro(state, lot); return { ...NO_CONTROLS }; }
    // ---- through a portal: a beat (pulled in, a whoosh, the swirl), then off to its refight
    if (lot.scene === 'enter') {
      lot.t++; p.inCutscene = true; p.vel.x = 0;
      setUi({ introCutscene: true });
      const px = portalX(lot.into);
      p.pos.x += (px - cx) * 0.15;
      if (lot.t === 1) { playSound('whoosh', 0.8, -8); playSound('ignite', 0.5, -14); }
      if (lot.t === 22) p.hidden = true;
      if (lot.t === 40) { const d = defAt(lot.into); setStartCheckpoint(d.cp); goTo(refightId(d.land)); }
      return { ...NO_CONTROLS };
    }
    // ---- all eight done: Ned's back; his fight
    if (lot.scene === 'nedIn') {
      lot.t++;
      p.inCutscene = true; p.vel.x = 0; setUi({ introCutscene: true });
      if (lot.t === 40) {
        // (the arena short of the screen's edges: the view's bent round the ring there, words said at the very edge
        // would be cut off)
        const L0 = cx - 300, R0 = cx + 300, cam = cx - W / 2;
        lot.fight = startNed(state, L0, R0, GROUND_Y);
        lot.scene = 'fight';
        state.cameraMinX = cam; state.cameraMaxX = cam;
        state.camera.x = cam;
      }
      return { ...NO_CONTROLS };
    }
    if (lot.scene === 'fight' && lot.fight) {
      const f = lot.fight;
      markBossFight(state, 'ned', { l: f.l, r: f.r });
      let out = updateNed(ctx, f, controls, () => {
        // (dead: the hour on (14), on the file; control back; the last battle's stub)
        lot.done.add('ned'); setEndgameHour(L4_HOUR + 1); save(state, lot, AFTER_CP); state.checkpoint = AFTER_CP;
        lot.scene = 'after'; lot.t = 0;
        state.cameraMinX = RING.x0 - CIRC; state.cameraMaxX = Infinity;
      });
      setUi({ introCutscene: !!p.inCutscene });
      if (!p.inCutscene) out = updateGrab(ctx, lot.grab, out);
      return out;
    }
    if (lot.scene === 'after') {
      lot.t++;
      if (lot.t === 60) startLastBattle(state, lot);
    }
    if (lot.backIn > 0 && --lot.backIn === 0) meatheadSays(state, pickLine(L.MH_BACK[dressed(state)]), false);
    // ---- free: walking the ring; UP at a portal
    let near = -1;
    for (let i = 0; i < N; i++) for (const k of [0, -CIRC, CIRC]) if (Math.abs(cx - (portalX(i) + k)) < 52 && p.isGrounded) near = i;
    const def = near >= 0 ? defAt(near) : null, spent = !!def && lot.done.has(def.land);
    if (def && !spent && lot.scene === 'free') setUi({ upPrompt: `${def.sign.word}: ${def.boss}` });
    const up = !!controls.up && !lot.upWas;
    lot.upWas = !!controls.up;
    controls = updateGrab(ctx, lot.grab, controls);
    if (def && up && !grabbing(lot.grab)) {
      if (spent || lot.scene !== 'free') { playMenuBack(); meatheadSays(state, pickLine(L.MH_SPENT), false); }
      else { playMenuOk(); lot.scene = 'enter'; lot.into = near; lot.t = 0; return { ...NO_CONTROLS }; }
    }
    return controls;
  },
  cylinder: () => ({ radius: RING.radius, inside: { horizon: RING.horizon } }),
  drawBackdrop: (c, state) => { drawLotBackdrop(c, state); return true; },
  lighting: (state) => {
    const lot = lotOf(state);
    const lights = [];
    for (let i = 0; i < N; i++) for (const k of [0, -CIRC, CIRC]) {
      const x = portalX(i) + k;
      if (Math.abs(x - (state.camera.x + W / 2)) > W) continue;
      const shut = !!lot && (lot.done.has(defAt(i).land) || i >= (lot.open ?? N));
      lights.push({ x, y: BACK - 56, r: shut ? 60 : 150, a: shut ? 0.25 : 0.75, color: shut ? '#7F1D1D' : '#F43F5E' });
      lights.push({ x: pylonX(i) + k, y: GROUND_Y - 200, r: 120, a: 0.35, color: '#FDE68A' });
    }
    return todLight(lights, 1);
  },
  drawBack: (c, state) => { drawRing(c, state); drawCrash(c, state); },
  drawFront: (c, state) => {
    const lot = lotOf(state);
    if (!lot) return;
    if (lot.nedShown) drawNed(c, lot.nedX, GROUND_Y - (lot.nedPose === 'float' ? 10 : 0), -1, { pose: lot.nedPose, q: Math.floor(state.frame / 10) % 8, mouth: !!lot.said && Math.floor(state.frame / 6) % 2 === 0 }, state.frame);
    if (lot.poof) drawPoof(c, lot.poof.x, GROUND_Y, lot.poof.t / 30);
    if (lot.said && lot.nedShown) saidOver(c, lot.said, lot.nedX, GROUND_Y - 160, '#C4B5FD');
    if (lot.fight) drawNedFight(c, state, lot.fight);
    drawGrab(c, state, lot.grab);
  },
  drawHud: (c, state) => {
    const lot = lotOf(state);
    if (!lot) return;
    if (lot.scene === 'intro') {
      if (lot.gross >= 0) { drawNedGrossBack(c, W, H); drawNedGross(c, W / 2, H / 2, 0.9 + 0.1 * Math.min(1, lot.gross / 10), state.frame, false, lot.gross < 12 ? 2 : 0); }
      const bar = Math.round(Math.min(1, lot.skipT / 20) * 44);
      c.fillStyle = '#000'; c.fillRect(0, 0, W, bar); c.fillRect(0, H - bar, W, bar);
      if (lot.skipT > SKIP_AFTER) drawSkipPrompt(c, W);
    }
    if (lot.fight) drawNedHud(c, state, lot.fight, topBand());
  },
};
export const LOT4_STAGE = L4_STAGE;

// ---------------------------------------------------------------------------------------------------------------
// Drawing the ring (world space): the asphalt, the stalls' lines, the light poles, the pylons with their signs, the
// portals (open: swirling red; spent or not open yet: a scorched ring). Still art stamped; the swirl live.

const viewOf = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: W, h: H };
const each = (state: GameState, x: number, r: number, draw: (x: number) => void) => {
  const v = viewOf(state);
  for (let k = -1; k <= 1; k++) { const lx = x + k * CIRC; if (lx + r > v.x && lx - r < v.x + v.w) draw(lx); }
};

const paintSlot = (g: Ctx, i: number) => {
  // (asphalt: banded, specked; the stall lines going back; the wheel stops)
  const x0 = -RING.slot / 2;
  g.fillStyle = '#1E1E24'; g.fillRect(x0, BACK - 30, RING.slot, 140);
  g.fillStyle = '#26262E'; g.fillRect(x0, BACK + 10, RING.slot, 20);
  g.fillStyle = '#2E2E36'; g.fillRect(x0, BACK + 50, RING.slot, 60);
  for (let k = 0; k < 60; k++) { g.fillStyle = k % 3 ? '#34343C' : '#16161C'; g.fillRect(x0 + ((k * 97 + i * 31) % RING.slot), BACK - 20 + ((k * 53) % 120), 2, 2); }
  g.fillStyle = '#D6D3C4';
  for (let s = 0; s < 4; s++) { const sx = x0 + 30 + s * 130; g.fillRect(sx, BACK - 24, 3, 30); g.fillRect(sx - 2, BACK + 6, 4, 2); }
  g.fillStyle = '#6B6B70'; for (let s = 0; s < 3; s++) g.fillRect(x0 + 70 + s * 130, BACK - 2, 40, 6);
  // (the oil stains, a crushed cup)
  g.fillStyle = '#121216'; g.beginPath(); g.ellipse(x0 + 180 + (i % 3) * 40, BACK - 8, 22, 5, 0, 0, Math.PI * 2); g.fill();
  // (the back fence, chain link, dimmed (nothing to stand on))
  g.fillStyle = '#2A2A30'; g.fillRect(x0, BACK - 110, RING.slot, 3);
  g.strokeStyle = 'rgba(120,120,130,0.35)'; g.lineWidth = 1;
  for (let k = 0; k < RING.slot; k += 8) { g.beginPath(); g.moveTo(x0 + k, BACK - 108); g.lineTo(x0 + k + 8, BACK - 30); g.moveTo(x0 + k + 8, BACK - 108); g.lineTo(x0 + k, BACK - 30); g.stroke(); }
  for (let k = 0; k <= RING.slot; k += 130) { g.fillStyle = '#3A3A42'; g.fillRect(x0 + k, BACK - 112, 3, 84); }
};
/** The picture on a pylon's sign (theme-park lot style: a cartoon of the land's thing, flat colors). */
const paintPic = (g: Ctx, pic: SignPic, x: number, y: number, col: string) => {
  g.fillStyle = col; g.strokeStyle = '#0A0A0C'; g.lineWidth = 2;
  const ell = (cx: number, cy: number, rx: number, ry: number) => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke(); };
  switch (pic) {
    case 'dinosaur': ell(x + 2, y + 6, 16, 10); g.fillRect(x - 6, y + 12, 5, 10); g.fillRect(x + 8, y + 12, 5, 10); g.beginPath(); g.moveTo(x + 14, y + 2); g.quadraticCurveTo(x + 22, y - 18, x + 16, y - 22); g.lineTo(x + 10, y - 18); g.lineTo(x + 10, y); g.fill(); g.stroke(); ell(x + 16, y - 20, 6, 4); g.beginPath(); g.moveTo(x - 14, y + 6); g.lineTo(x - 24, y + 14); g.lineTo(x - 12, y + 12); g.fill(); g.stroke(); break;
    case 'bat': g.beginPath(); g.moveTo(x, y - 4); g.quadraticCurveTo(x - 10, y - 16, x - 26, y - 10); g.quadraticCurveTo(x - 20, y, x - 22, y + 8); g.quadraticCurveTo(x - 10, y + 2, x, y + 8); g.quadraticCurveTo(x + 10, y + 2, x + 22, y + 8); g.quadraticCurveTo(x + 20, y, x + 26, y - 10); g.quadraticCurveTo(x + 10, y - 16, x, y - 4); g.fill(); g.stroke(); ell(x, y, 6, 7); g.fillStyle = '#FDE047'; g.fillRect(x - 4, y - 2, 2, 2); g.fillRect(x + 2, y - 2, 2, 2); break;
    case 'rocket': g.beginPath(); g.moveTo(x, y - 24); g.quadraticCurveTo(x + 10, y - 10, x + 8, y + 12); g.lineTo(x - 8, y + 12); g.quadraticCurveTo(x - 10, y - 10, x, y - 24); g.fill(); g.stroke(); g.fillStyle = '#F8FAFC'; ell(x, y - 6, 4, 4); g.fillStyle = '#F97316'; g.beginPath(); g.moveTo(x - 6, y + 12); g.lineTo(x, y + 24); g.lineTo(x + 6, y + 12); g.fill(); break;
    case 'star': g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 10 : 24; g.lineTo(x + Math.cos(a) * r, y + 2 + Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); break;
    case 'statue': g.fillRect(x - 6, y - 4, 12, 26); g.strokeRect(x - 6, y - 4, 12, 26); ell(x, y - 10, 6, 6); g.fillRect(x + 6, y - 26, 4, 22); g.fillStyle = '#FDE047'; ell(x + 8, y - 28, 4, 4); g.fillStyle = col; for (let k = 0; k < 5; k++) g.fillRect(x - 8 + k * 4, y - 20, 2, 5); break;
    case 'train': g.fillRect(x - 22, y - 6, 30, 18); g.strokeRect(x - 22, y - 6, 30, 18); g.fillRect(x + 8, y - 14, 12, 26); g.strokeRect(x + 8, y - 14, 12, 26); g.fillRect(x - 16, y - 18, 7, 12); g.fillStyle = '#0A0A0C'; for (const wx of [-16, -2, 14]) ell(x + wx, y + 14, 5, 5); break;
    case 'castle': g.fillRect(x - 20, y - 6, 40, 26); g.strokeRect(x - 20, y - 6, 40, 26); for (const tx of [-20, 12]) { g.fillRect(x + tx, y - 22, 8, 16); g.strokeRect(x + tx, y - 22, 8, 16); g.beginPath(); g.moveTo(x + tx - 2, y - 22); g.lineTo(x + tx + 4, y - 32); g.lineTo(x + tx + 10, y - 22); g.fill(); g.stroke(); } g.fillStyle = '#0A0A0C'; g.fillRect(x - 5, y + 6, 10, 14); break;
    case 'anvil': g.beginPath(); g.moveTo(x - 24, y - 10); g.lineTo(x + 18, y - 10); g.lineTo(x + 24, y - 4); g.lineTo(x + 8, y); g.lineTo(x + 8, y + 10); g.lineTo(x + 16, y + 16); g.lineTo(x - 16, y + 16); g.lineTo(x - 8, y + 10); g.lineTo(x - 8, y); g.lineTo(x - 20, y - 2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#F8FAFC'; g.fillRect(x - 18, y - 9, 30, 2); break;
  }
};
/** A pylon: a lamp pole (its light at the top), the round sign on it with the picture, the word and the number. */
const paintPylon = (g: Ctx, d: RefightDef, i: number) => {
  g.fillStyle = '#3A3A42'; g.fillRect(-4, BACK - 280, 8, 280);
  g.fillStyle = '#5A5A64'; g.fillRect(-4, BACK - 280, 2, 280);
  g.fillStyle = '#26262C'; g.fillRect(-12, BACK - 6, 24, 8);
  // (the lamp head)
  g.fillStyle = '#4A4A52'; g.fillRect(-2, BACK - 290, 34, 6); g.fillStyle = '#FDE68A'; g.fillRect(22, BACK - 284, 12, 4);
  // (the sign: a big disc in the stall's color, a white ring, the picture, the word on a band under it, the number)
  const sy = BACK - 210;
  g.fillStyle = '#0A0A0C'; g.beginPath(); g.arc(0, sy, 46, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(0, sy, 43, 0, Math.PI * 2); g.fill();
  g.fillStyle = d.sign.color; g.beginPath(); g.arc(0, sy, 38, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(-8, sy - 10, 24, 0, Math.PI * 2); g.fill();
  paintPic(g, d.sign.pic, 0, sy - 4, '#F8FAFC');
  g.fillStyle = '#0A0A0C'; g.fillRect(-46, sy + 46, 92, 20); g.fillStyle = '#F8FAFC'; g.fillRect(-44, sy + 48, 88, 16);
  g.font = '8px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = '#0A0A0C'; g.fillText(d.sign.word, 0, sy + 60);
  g.fillStyle = d.sign.color; g.fillRect(-14, sy + 68, 28, 18); g.fillStyle = '#F8FAFC'; g.font = '10px "Press Start 2P"'; g.fillText(String(i + 1), 0, sy + 82);
  g.textAlign = 'left';
};
/** A portal's still part: its scorched ring in the asphalt, the rim of burnt-in runes. */
const paintPortalBase = (g: Ctx) => {
  g.fillStyle = '#0A0406'; g.beginPath(); g.ellipse(0, BACK + 6, 52, 10, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#4A0A12'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, BACK + 6, 48, 8, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#7F1D1D'; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; g.fillRect(Math.round(Math.cos(a) * 44) - 2, Math.round(BACK + 6 + Math.sin(a) * 7) - 1, 4, 2); }
};
const drawPortal = (c: Ctx, x: number, f: number, state: 'open' | 'spent' | 'shut') => {
  c.save(); c.translate(Math.round(x), 0);
  stamp(c, 'wp4-portal-base', -60, BACK - 10, 120, 30, g => paintPortalBase(g));
  const cy = BACK - 58;
  if (state === 'open') {
    // (the swirl: rings of red and purple turning, a black heart, embers off it)
    for (let k = 0; k < 5; k++) {
      const rx = 40 - k * 7, ry = 62 - k * 11, a = f * 0.04 * (k % 2 ? -1 : 1) + k;
      c.fillStyle = ['#450A0A', '#7F1D1D', '#B91C1C', '#7C3AED', '#1A0206'][k];
      c.beginPath(); c.ellipse(Math.sin(a) * 2, cy, rx, ry, 0, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#F97316';
    for (let k = 0; k < 6; k++) { const a = f * 0.05 + k; c.fillRect(Math.round(Math.cos(a) * 38), Math.round(cy + Math.sin(a) * 58), 3, 3); }
  } else if (state === 'spent') {
    // (spent: the hole closed over, a puff of smoke off the scorch)
    c.fillStyle = 'rgba(60,56,60,0.5)';
    for (let k = 0; k < 3; k++) { const t = ((f + k * 40) % 120) / 120; c.beginPath(); c.arc(Math.sin(t * 6 + k) * 8, BACK - t * 60, 6 + t * 10, 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
};
const drawRing = (c: Ctx, state: GameState) => {
  const lot = lotOf(state), f = state.frame;
  for (let i = 0; i < N; i++) {
    const d = defAt(i);
    each(state, slotX(i), RING.slot / 2 + 4, x => { c.save(); c.translate(Math.round(x), 0); stamp(c, `wp4-slot-${i}`, -RING.slot / 2 - 2, BACK - 120, RING.slot + 4, 240, g => paintSlot(g, i)); c.restore(); });
    each(state, pylonX(i), 60, x => { c.save(); c.translate(Math.round(x), 0); stamp(c, `wp4-pylon-${i}`, -50, BACK - 300, 100, 310, g => paintPylon(g, d, i)); c.restore(); });
    const st = !lot ? 'open' : lot.done.has(d.land) ? 'spent' : i < lot.open ? 'open' : 'shut';
    each(state, portalX(i), 60, x => drawPortal(c, x, f + i * 17, st));
  }
};
// (dev: straight into level 4 at a checkpoint, for tools: window.__l4Go(cp))
if (import.meta.env.DEV && typeof window !== 'undefined') (window as unknown as { __l4Go: (cp: number) => void }).__l4Go = cp => { setStartCheckpoint(cp); goTo(L4_ID); };
