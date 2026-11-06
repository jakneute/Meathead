// THE QUEEN's refight (the ROBOT): hell's knockoff of GALACTIC GROOVE, Space Land's own boss fight run whole
// (space/queen/fight.ts) at 999. The owner's: "the aliens have infiltrated hell and have reconstructed the queen. the
// aliens in the dj booth. meathead drops down and obliterates them. ned will be in the control booth instead during
// this fight, taunting you instead of the two aliens." No Ned card for her (INTROS has none: he's in her booth).
//
// In through Ned's portal (fresh: not a respawn): he comes down out of the dark over the DJ booth, right on top of the
// two aliens at her controls (their last words cut short), lands in the pod on what's left of them, his say; then on
// down to the dance floor, and it's on as it always is (the land's retry path: her entrance). Ned pops into the booth
// over the mess and drives her the whole fight: the booth's lines (births, the spotlights, her stunned, her death,
// out the back) are his now (space/queen/fight.ts gives the booth his voice in here; disco.ts draws him in their place:
// setBoothSwap), and now and then a taunt of his own. Dead in it: back outside the door (cp 74), walked in, Ned there.
// She's rebuilt, not raised: the plain death (her latex burnt off her) put right with a cheap new skin in patches over
// the skeleton, silver rivets; the mallet's (her head flattened) hammered back out, dented, riveted, a plate on it.
//
// The land's file: space/queen/index.ts asks bossGone (not isLandCleared) for the disco: whether it's on, how it's lit
// and whether her wreck's on the floor (the same thing outside a refight).

import type { GameState } from '../../../../m1/game/core/state';
import type { Block } from '../../../../m1/types';
import type { StageLayout } from '../../../../m1/game/stages/index';
import type { RefightDef } from '../defs';
import { spaceLayout } from '../../../space/index';
import { GY } from '../../../space/geometry';
import { hands } from '../../../space/section';
import { DISCO_L, DISCO_R, DJ } from '../../../space/queen/geo';
import { DISCO_CP } from '../../../space/queen/basement';
import { setBoothSwap, type BoothOps } from '../../../space/queen/disco';
import { drawAlien } from '../../../space/crater/aliens';
import * as Q from '../../../space/queen/lines';
import { speak, saidOver, meatheadSays } from '../../../adventure/section';
import { pickLine, cutVoice } from '../../../../m1/game/platform/speech';
import { playSound } from '../../../../m1/game/platform/audio';
import { shakeScreen } from '../../../../m1/game/core/state';
import { isShat, isNude } from '../../../../m1/game/player/gut';
import { bossDeath, setUi } from '../../../store';
import { inRefight, refightOn } from '../hook';
import { drawNed, drawPoof } from '../nedArt';
import { refightId, refightStage } from '../where';
import * as L from '../lines/space';
import { NED_VOICE } from '../lines/ned';

type Ctx = CanvasRenderingContext2D;
/** What of the queen section's state this reads (space/queen/index.ts's, its fight's). */
interface QFight { mode: string; x: number; y: number; facing: number; said: string | null; boothSaid: string | null; entrance: number; ops: BoothOps; e: unknown }
interface QState { fight: 'wait' | 'on' | 'won'; f: QFight | null }
const queenOf = (state: GameState) => ((state.stage as { s?: Record<string, unknown> } | null)?.s?.queen as QState | undefined) ?? null;
const dressed = (state: GameState) => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// The drop onto the booth's two (fresh only), and Ned in the booth

/** The pod's floor he lands on (a ledge there for the moment), where Ned stands in it. */
const POD_FLOOR = DJ.y + DJ.h - 6;
const NED_AT = { x: DJ.x + 64, feet: DJ.y + DJ.h + 44, s: 0.8 };
interface Drop { step: 'place' | 'fall' | 'splat' | 'drop'; t: number; ledge: Block | null; said: boolean }
let drop: Drop | null = null;
/** The two are squashed (the first time in this go: kept through his deaths). */
let squashed = false;
/** When Ned got into the booth (state.frame; -1: not yet), and his hello said this go at her. */
let nedIn = -1, helloDue = -1;
let tauntT = 0;
let alienSaid: string | null = null;
let liveF: QFight | null = null;

const splat = (state: GameState) => {
  squashed = true;
  cutVoice('m2.space.alien'); alienSaid = null;
  playSound('splat', 1, -6); playSound('crash', 0.8, -4); playSound('glass', 0.7, 0); shakeScreen(state, 12, 6);
  const cx = DJ.x + DJ.w / 2, y = POD_FLOOR - 10;
  for (let i = 0; i < 40; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 80, y: y - Math.random() * 20 }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 50 + Math.random() * 30, color: ['#4ADE80', '#166534', '#A3E635', '#14532D'][i % 4], size: 3 + Math.random() * 5, grav: 0.3 });
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * DJ.w, y: DJ.y + Math.random() * DJ.h }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 3 }, life: 40, color: '#D9F99D', size: 2, grav: 0.35 });
};

const tickDrop = (state: GameState, q: QState | null) => {
  const d = drop;
  if (!d) return;
  const p = state.player;
  // (a cutscene: no input (the layout's hands, below), no HUD)
  p.inCutscene = true; setUi({ introCutscene: true });
  d.t++;
  if (d.step === 'place') {
    // (out of Ned's portal (the card done: the engine's put him at the checkpoint after the build, so it's done here):
    // over the DJ booth, up in the dark under the truss; a ledge in the pod to land in)
    p.pos.x = DJ.x + DJ.w / 2 - p.width / 2; p.pos.y = DJ.y - 150 - p.height; p.vel.x = 0; p.vel.y = 0;
    d.ledge = { x: DJ.x + 20, y: POD_FLOOR, w: DJ.w - 40, h: 16, type: 'platform', oneWay: true, hidden: true, tag: 'rf-queen-pod' } as Block;
    state.blocks.push(d.ledge);
    state.camera.x = DJ.x + DJ.w / 2 - 400;
    d.step = 'fall'; d.t = 0;
    playSound('whoosh', 0.9, -6);
    return;
  }
  if (d.step === 'fall') {
    p.vel.x = 0;
    if (d.t === 6) speak('m2.space.alien', pickLine(L.RF_ALIEN_SPLAT), x => { alienSaid = x?.text ?? null; }, false);
    if ((p.isGrounded && p.pos.y + p.height >= POD_FLOOR - 2) || d.t > 240) {
      splat(state);
      d.step = 'splat'; d.t = 0;
      meatheadSays(state, pickLine(L.RF_MH_SQUASH[dressed(state)]), true, () => { if (drop === d) d.said = true; });
    }
    return;
  }
  if (d.step === 'splat') {
    p.vel.x = 0;
    if ((d.said && d.t > 50) || d.t > 300) {
      if (d.ledge) state.blocks = state.blocks.filter(b => b !== d.ledge);
      d.ledge = null; d.step = 'drop'; d.t = 0;
      // (off the pod's lip, out onto the floor)
      p.vel.y = -3; p.vel.x = 2;
    }
    return;
  }
  // (down on the dance floor: the land's own takes it from here (in past its trigger: the fight's on, next frame))
  if ((p.isGrounded && p.pos.y + p.height >= GY - 2) || d.t > 300) { drop = null; p.inCutscene = false; setUi({ introCutscene: false }); }
  void q;
};

/** In the booth's glass, in the two's place (disco.ts): what's left of them, Ned over it. */
setBoothSwap((c, ops, f) => {
  if (!inRefight('space') || !squashed) return false;
  drawBoothNed(c, ops, f, nedIn, !!liveF?.boothSaid);
  return true;
});
/** The booth's inside, theirs squashed: them flat, the green, Ned (in since `inAt`; out the back on her death). */
export const drawBoothNed = (c: Ctx, ops: BoothOps | null, f: number, inAt: number, talking: boolean) => {
  // (them, flat: smeared across the pod's floor, their headsets; the green up the back wall)
  c.fillStyle = '#166534'; c.fillRect(DJ.x + 20, DJ.y + 14, 30, 6); c.fillRect(DJ.x + 120, DJ.y + 8, 8, 30); c.fillRect(DJ.x + 150, DJ.y + 20, 22, 5);
  c.fillStyle = '#4ADE80'; c.fillRect(DJ.x + 24, DJ.y + 15, 20, 3); c.fillRect(DJ.x + 121, DJ.y + 10, 4, 22); c.fillRect(DJ.x + 60, DJ.y + 30, 12, 4);
  for (let i = 0; i < 2; i++) {
    c.save(); c.translate(DJ.x + 50 + i * 90, DJ.y + DJ.h + 4); c.scale(1.5, 0.22);
    drawAlien(c, { seed: 201 + i * 7, headset: true, woman: i === 1 }, 'dead', 0, 0.85);
    c.restore();
  }
  // (Ned: popped in once it's on; out the back (a poof) when she's done)
  if (inAt < 0 || ops?.mode === 'gone') return;
  const since = f - inAt;
  const run = ops?.mode === 'run';
  const k = run ? Math.min(1, (ops?.t ?? 0) / 30) : 0;
  if (!run || k < 0.5) {
    const mad = ops?.mode === 'mad';
    const pose = mad ? ((ops!.t >> 3) % 2 ? 'point' : 'hurt') : talking ? 'talk' : Math.floor(f / 150) % 3 === 2 ? 'point' : 'idle';
    c.save(); c.translate(NED_AT.x + (mad ? Math.sin(ops!.t * 0.9) * 2 : 0), NED_AT.feet + (mad && (ops!.t >> 2) % 2 ? -3 : 0)); c.scale(NED_AT.s, NED_AT.s);
    drawNed(c, 0, 0, 1, { pose, q: 0, mouth: talking && Math.floor(f / 6) % 2 === 0 }, f, since < 16 ? since / 16 : run ? 1 - k * 2 : 1);
    c.restore();
  }
  if (since < 24) drawPoof(c, NED_AT.x, NED_AT.feet - 10, since / 24);
  if (run) drawPoof(c, NED_AT.x, NED_AT.feet - 10, k);
};

const update: RefightDef['update'] = ctx => {
  const { state } = ctx, q = queenOf(state), f = q?.f ?? null;
  liveF = f;
  tickDrop(state, q);
  if (!q || !f) return;
  // (it's on: Ned into the booth (the first time), his hello after her entrance line)
  if (q.fight === 'on' && f.mode !== 'dead' && helloDue < 0) {
    helloDue = state.frame + 40;
    if (nedIn < 0) { nedIn = state.frame; playSound('whoosh', 0.7, 4); }
  }
  if (q.fight !== 'on') { helloDue = -1; return; }
  if (helloDue > 0 && state.frame >= helloDue && f.mode !== 'dead' && f.entrance <= 0 && !f.said && !f.boothSaid) {
    // (said: 0 till the next go at her)
    helloDue = 0;
    speak(NED_VOICE, pickLine(L.RF_NED_BOOTH_HELLO[dressed(state)]), x => { if (liveF === f) f.boothSaid = x?.text ?? null; }, true);
    tauntT = 0;
  }
  // (and his taunts now and then, through it: when nobody's talking)
  if (f.mode !== 'dead' && f.entrance <= 0 && ++tauntT > 900 && !f.said && !f.boothSaid) {
    tauntT = Math.floor(Math.random() * 200);
    speak(NED_VOICE, pickLine(L.RF_NED_BOOTH_TAUNT[dressed(state)]), x => { if (liveF === f) f.boothSaid = x?.text ?? null; }, false);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The look over the stitches

const bossAt = (state: GameState) => {
  const q = queenOf(state), f = q?.f;
  if (!q || q.fight !== 'on' || !f || !f.e || f.mode === 'dead') return null;
  return { x: f.x, feet: GY - f.y, w: 110, h: 240, face: f.facing };
};

/** The mallet's: her head hammered back out, dents in it, a plate bolted over the worst. */
const drawLook = (c: Ctx, state: GameState) => {
  const at = bossAt(state);
  if (at && (refightOn()?.look ?? lookNow()) === 'weakness') drawQueenDents(c, at);
};
export const drawQueenDents = (c: Ctx, at: { x: number; feet: number; face: number }) => {
  const hx = at.x + at.face * 40, hy = at.feet - 250;
  c.save();
  c.fillStyle = '#6B7280'; c.fillRect(Math.round(hx - 12), Math.round(hy - 16), 24, 10);
  c.fillStyle = '#9CA3AF'; c.fillRect(Math.round(hx - 12), Math.round(hy - 16), 24, 3);
  c.fillStyle = '#D1D5DB'; for (const dx of [-9, 0, 9]) c.fillRect(Math.round(hx + dx - 1), Math.round(hy - 12), 2, 2);
  c.fillStyle = 'rgba(10, 10, 14, 0.7)';
  for (const [dx, dy, r] of [[-14, 0, 5], [8, 8, 4], [-4, 14, 3]] as const) { c.beginPath(); c.ellipse(hx + dx * at.face, hy + dy, r, r * 0.6, 0.4, 0, Math.PI * 2); c.fill(); }
  c.restore();
};

const lookNow = () => bossDeath('space') ?? 'normal';

/** Her land's layout, with the drop's hold on him (no input from the portal till he's on the floor). */
const inner: StageLayout = {
  ...spaceLayout,
  update: (ctx, controls) => {
    // (the land's own held off while he's coming down: not on in the pod, only once he's on the floor)
    if (drop && drop.step !== 'place') return hands();
    const out = spaceLayout.update ? spaceLayout.update(ctx, controls) : controls;
    return drop ? hands() : out;
  },
};

export const spaceRefight: RefightDef = {
  land: 'space', id: refightId('space'), stage: refightStage('space'),
  boss: 'THE QUEEN', sin: 'ROBOT',
  // (DISCO_CP, 74: GALACTIC GROOVE, out on the landing by the disco's door and the big refill: the land's retry
  // checkpoint, past the basement's stalking)
  inner, cp: DISCO_CP,
  sign: { pic: 'rocket', word: 'ROCKET', color: '#4338CA' },
  looks: ['normal', 'weakness'],
  lookNow,
  lookName: l => (l === 'weakness' ? 'FLATTENED BY THE MALLET (WEAKNESS)' : 'BURNT TO THE SKELETON'),
  swaps: () => [
    [Q.QUEEN_ENTRANCE, L.RF_QUEEN_ENTRANCE], [Q.QUEEN_TAUNT, L.RF_QUEEN_TAUNT], [Q.QUEEN_BIRTH, L.RF_QUEEN_BIRTH],
    [Q.QUEEN_LEAP, L.RF_QUEEN_LEAP], [Q.QUEEN_FLAIL, L.RF_QUEEN_FLAIL], [Q.QUEEN_STUN, L.RF_QUEEN_STUN],
    [Q.QUEEN_MALLET, L.RF_QUEEN_MALLET], [Q.QUEEN_DIES, L.RF_QUEEN_DIES], [Q.QUEEN_BURNS, L.RF_QUEEN_BURNS],
    [Q.QUEEN_MORE_FATAL, L.RF_QUEEN_MORE_FATAL],
    [Q.BOOTH_BIRTH, L.RF_NED_BIRTH], [Q.BOOTH_DROP, L.RF_NED_DROP], [Q.BOOTH_MATING, L.RF_NED_MATING],
    [Q.BOOTH_CURSES, L.RF_NED_CURSES], [Q.BOOTH_EXIT, L.RF_NED_EXIT],
    [Q.MH_OPS_GONE, L.RF_MH_NED_GONE],
  ],
  // (the hall wall to wall, the props kept in from both ends: nothing in it to stand on)
  arena: () => ({ l: DISCO_L + 120, r: DISCO_R - 120, floor: GY }),
  bossAt,
  stitches: look => look === 'weakness'
    // (the mallet's: her head (up at the top, out front) seamed back together, riveted; a seam down her neck)
    ? { thread: '#D1D5DB', patch: '#4B5563', seams: [[0.62, -0.06, 0.98, 0.02], [0.66, 0.06, 0.96, 0.12], [0.72, 0.12, 0.6, 0.3]], patches: [[0.7, -0.04, 0.22, 0.08]], staples: [[0.7, 0.0], [0.86, 0.04], [0.78, 0.1], [0.64, 0.22]] }
    // (her latex burnt off: rebuilt with cheap new skin, a dollar store's peach latex in patches over the black, riveted)
    : { thread: '#E5E7EB', patch: '#D9A08A', seams: [[0.2, 0.3, 0.8, 0.34], [0.3, 0.6, 0.75, 0.56], [0.5, 0.34, 0.48, 0.56]], patches: [[0.3, 0.18, 0.3, 0.1], [0.55, 0.4, 0.25, 0.12], [0.25, 0.66, 0.22, 0.12], [0.72, 0.02, 0.18, 0.06]], staples: [[0.3, 0.32], [0.7, 0.33], [0.4, 0.58], [0.66, 0.57]] },
  update,
  drawFront: (c, state) => {
    drawLook(c, state);
    // (the two's last words, cut short)
    if (alienSaid) saidOver(c, alienSaid, DJ.x + DJ.w / 2, DJ.y - 30, '#D9F99D', 220);
  },
  build: (state, fresh) => {
    drop = null; nedIn = -1; helloDue = -1; tauntT = 0; alienSaid = null; liveF = null;
    squashed = !fresh;
    if (fresh) { drop = { step: 'place', t: 0, ledge: null, said: false }; state.player.inCutscene = true; }
  },
};
