// DONNIE DRACULA's refight (GLUTTONY): hell's knockoff of his ballroom, Spooky Land's own boss fight run whole
// (spooky/ballroom/fight.ts) at 999. The owner's: "donny just gets extra excited because now he's a zombie vampire.
// satan shows up again and sounds exasperated, complaining to ned during the fight instead of talking to donnie. 'why
// did you resurrect him?'" His lines swapped (park4/lines/spooky.ts): Donnie thrilled; Satan's mid-fight beats (the
// fight's own queueBeat pairs: Satan, then Donnie back) now Satan complaining to Ned, Donnie butting in, ignored; and
// now and then Ned answers Satan from a little portal up in the corner (here: update, drawFront). The damned run
// through the ballroom in the guests' places.
// Stitched up the way he died: the usual way (he shat himself so hard it shot him up into the ceiling): his ass sewn
// shut (a cork in it), his dome seamed and stapled where it went through the ceiling; or by the little statue (burnt to
// ash): put back together out of the ash, bound with gravy, ashy gray, the gravy weeping out of his seams.
//
// The land's file: spooky/ballroom/index.ts asks bossGone (not isLandCleared) for whether the fight's on and the room's
// a revisit's: the same thing outside a refight.

import type { GameState } from '../../../../m1/game/core/state';
import type { RefightDef } from '../defs';
import { spookyLayout } from '../../../spooky/index';
import { GY } from '../../../spooky/geometry';
import { ARENA_L, RISER, CHANDELIERS } from '../../../spooky/ballroom/arena';
import * as B from '../../../spooky/ballroom/lines';
import { speak, saidOver } from '../../../adventure/section';
import { pickLine } from '../../../../m1/game/platform/speech';
import { isShat, isNude } from '../../../../m1/game/player/gut';
import { bossDeath } from '../../../store';
import { refightOn } from '../hook';
import { drawNed } from '../nedArt';
import { drawHellProps } from '../hell';
import { refightId, refightStage } from '../where';
import * as L from '../lines/spooky';
import { NED_VOICE } from '../lines/ned';

type Ctx = CanvasRenderingContext2D;
/** What of the ballroom's state this reads (spooky/ballroom/index.ts's, its fight's). */
interface BallFight { mode: string; x: number; y: number; facing: number; satanSaid: string | null }
const fightOf = (state: GameState): { fight: string; f: BallFight | null } | null =>
  ((state.stage as { s?: Record<string, unknown> } | null)?.s?.ballroom as { fight: string; f: BallFight | null } | undefined) ?? null;
const dressed = (state: GameState) => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// ---------------------------------------------------------------------------------------------------------------
// Ned, answering Satan (now and then, after one of Satan's beat lines: queued, so after Satan and before Donnie)

const SATAN_BEAT_LINES = new Set(L.RF_SATAN_BEATS.flatMap(b => [...b.clean, ...b.shitty, ...b.nude]));
let lastSatan: string | null = null;
let nedSaid: string | null = null;
/** Frames his portal's been open (0: shut), and frames since it shut. */
let nedOpen = 0, nedShut = 99;
const PORTAL = { x: ARENA_L + 96, feet: GY - 236 };

const update: RefightDef['update'] = ctx => {
  const b = fightOf(ctx.state), f = b?.f;
  if (nedSaid) nedOpen++; else { nedShut++; if (nedShut > 20) nedOpen = 0; }
  if (nedSaid) nedShut = 0;
  if (!f) return;
  const s = f.satanSaid ?? null;
  if (s && s !== lastSatan && SATAN_BEAT_LINES.has(s) && Math.random() < 0.6) speak(NED_VOICE, pickLine(L.RF_NED_ANSWER[dressed(ctx.state)]), x => { nedSaid = x?.text ?? null; }, true);
  lastSatan = s;
};

const drawPortal = (c: Ctx, frame: number) => drawNedPortal(c, PORTAL.x, PORTAL.feet, nedSaid ? Math.min(1, nedOpen / 10) : Math.max(0, 1 - nedShut / 12), frame, nedSaid);
/** His portal (opening `k` 0..1), him in it to the chest, talking while there's `said`. */
export const drawNedPortal = (c: Ctx, x: number, feet: number, k: number, frame: number, said: string | null) => {
  if (k <= 0) return;
  const cy = feet - 56;
  c.save();
  // (the ring: stepped greens, a dark middle; him in it, up to his chest)
  const rings = ['#14532D', '#15803D', '#22C55E', '#86EFAC'];
  rings.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, cy, (58 - i * 4) * k, (72 - i * 4) * k, 0, 0, Math.PI * 2); c.fill(); });
  c.fillStyle = '#05140A'; c.beginPath(); c.ellipse(x, cy, 44 * k, 58 * k, 0, 0, Math.PI * 2); c.fill();
  if (k > 0.6) {
    c.beginPath(); c.ellipse(x, cy, 44 * k, 58 * k, 0, 0, Math.PI * 2); c.clip();
    drawNed(c, x, feet + 40, 1, { pose: 'talk', q: 0, mouth: !!said && Math.floor(frame / 6) % 2 === 0 }, frame);
  }
  c.restore();
  // (sparks round the ring)
  c.fillStyle = '#BBF7D0';
  for (let i = 0; i < 6; i++) { const a = frame * 0.08 + i * 1.05; c.fillRect(Math.round(x + Math.cos(a) * 60 * k), Math.round(cy + Math.sin(a) * 74 * k), 2, 2); }
  if (said) saidOver(c, said, x + 30, feet - 140, '#C4B5FD', 260);
};

// ---------------------------------------------------------------------------------------------------------------
// The look over the stitches

/** His box (his feet, how tall, facing), while he's up and about. */
const bossAt = (state: GameState) => {
  const b = fightOf(state), f = b?.f;
  if (!b || b.fight !== 'on' || !f || f.mode === 'dead') return null;
  return { x: f.x, feet: f.y, w: 46, h: 90, face: f.facing };
};

/** The extras the stitches can't do: the cork in his sewn-up ass; the gravy weeping out of the ash. */
export const drawDonnieLook = (c: Ctx, at: { x: number; feet: number; w: number; h: number; face: number }, look: string, fr: number) => {
  const back = -at.face;
  if (look === 'weakness') {
    // (gravy: brown runs down out of his seams, a drip falling now and then)
    for (const [fx, fy, len] of [[-0.1, 0.28, 10], [0.18, 0.5, 14], [-0.22, 0.56, 8], [0.05, 0.3, 6]] as const) {
      const x = at.x + fx * at.w * at.face, y = at.feet - at.h + fy * at.h;
      c.fillStyle = '#5C3A1A'; c.fillRect(Math.round(x) - 1, Math.round(y), 3, len);
      c.fillStyle = '#8A5A2A'; c.fillRect(Math.round(x), Math.round(y), 1, len - 2);
      const u = (fr + fx * 97 + fy * 61) % 50;
      if (u < 30) { c.fillStyle = '#6B4420'; c.fillRect(Math.round(x), Math.round(y + len + u * 1.2), 2, 3); }
    }
  } else {
    // (the cork, stuck in the seat of his trousers, the seam crossed over it)
    const x = at.x + back * at.w * 0.38, y = at.feet - 26;
    c.fillStyle = '#3A2410'; c.fillRect(Math.round(x) - 5, Math.round(y) - 4, 10, 8);
    c.fillStyle = '#B07A3A'; c.fillRect(Math.round(x) - 4, Math.round(y) - 3, 8, 6);
    c.fillStyle = '#D8A060'; c.fillRect(Math.round(x) - 4, Math.round(y) - 3, 8, 2);
  }
};

const lookNow = () => bossDeath('spooky') ?? 'normal';
const drawLook = (c: Ctx, state: GameState) => {
  const at = bossAt(state);
  if (at) drawDonnieLook(c, at, refightOn()?.look ?? lookNow(), state.frame);
};

export const spookyRefight: RefightDef = {
  land: 'spooky', id: refightId('spooky'), stage: refightStage('spooky'),
  boss: 'DONNIE DRACULA', sin: 'GLUTTONY',
  // (cp 62: DONNIE DRACULA, just outside the ballroom's doors, the big refill by it: the land's retry checkpoint)
  inner: spookyLayout, cp: 62,
  sign: { pic: 'bat', word: 'BAT', color: '#7C3AED' },
  looks: ['normal', 'weakness'],
  lookNow,
  lookName: l => (l === 'weakness' ? 'BURNT BY THE LITTLE JESUS (WEAKNESS)' : 'SHAT HIMSELF INTO THE CEILING'),
  swaps: () => [
    [B.DONNIE_ENTRANCE, L.RF_DONNIE_ENTRANCE], [B.DONNIE_TAUNT, L.RF_DONNIE_TAUNT], [B.DONNIE_DIVE, L.RF_DONNIE_DIVE],
    [B.DONNIE_DRAIN, L.RF_DONNIE_DRAIN], [B.DONNIE_ESCAPED, L.RF_DONNIE_ESCAPED], [B.DONNIE_GREASED, L.RF_DONNIE_GREASED],
    [B.DONNIE_TEMPTED, L.RF_DONNIE_TEMPTED], [B.DONNIE_SNATCH, L.RF_DONNIE_SNATCH], [B.DONNIE_SPEW, L.RF_DONNIE_SPEW],
    [B.DONNIE_HURT, L.RF_DONNIE_HURT], [B.DONNIE_REDEEMER, L.RF_DONNIE_REDEEMER], [B.DONNIE_DIES, L.RF_DONNIE_DIES],
    [B.DONNIE_GURGLE, L.RF_DONNIE_GURGLE], [B.DONNIE_BURNS, L.RF_DONNIE_BURNS],
    [B.DONNIE_SHOWOFF, L.RF_DONNIE_SHOWOFF], [B.DONNIE_SATAN_PANIC, L.RF_DONNIE_SATAN_PANIC], [B.DONNIE_GUEST, L.RF_DONNIE_GUEST],
    [B.DONNIE_STUN, L.RF_DONNIE_STUN], [B.DONNIE_LOW, L.RF_DONNIE_LOW],
    [B.SATAN_NAG, L.RF_SATAN_NAG], [B.SATAN_SOUL, L.RF_SATAN_SOUL], [B.SATAN_GUEST, L.RF_SATAN_GUEST], [B.SATAN_STUN, L.RF_SATAN_STUN],
    [B.SATAN_LOW, L.RF_SATAN_LOW], [B.SATAN_STUCK, L.RF_SATAN_STUCK], [B.SATAN_CLAIM, L.RF_SATAN_CLAIM],
    [B.GUEST_SCREAM, L.RF_DAMNED_SCREAM],
  ],
  // (the props: drawn here (drawBack), not by the wrapper, so the chandeliers (stood on) stay in front of them)
  arena: () => null,
  drawBack: (c, state) => {
    // (the dance floor, the gate to the stage wall; kept off the bandstand's riser (stood on) at the far end, and cut out
    // round the two chandeliers: the rock's behind them, not over them)
    c.save(); c.beginPath(); c.rect(ARENA_L - 400, GY - 600, 1800, 640);
    for (const ch of CHANDELIERS) c.rect(ch.x + ch.w + 14, GY - ch.h - 48, -(ch.w + 28), 104);
    c.clip('evenodd');
    drawHellProps(c, state, 'GLUTTONY', { l: ARENA_L, r: RISER.x - 130, floor: GY });
    c.restore();
  },
  bossAt,
  stitches: look => look === 'weakness'
    // (out of the ash: ashy-gray patches where he'd crumbled most (face, chest, a thigh), dark thread, gravy for glue)
    ? { thread: '#2A1A0A', patch: '#8E8A86', seams: [[0.2, 0.24, 0.8, 0.27], [0.15, 0.48, 0.85, 0.45], [0.42, 0.64, 0.46, 0.92]], patches: [[0.62, 0.12, 0.2, 0.08], [0.3, 0.32, 0.26, 0.1], [0.2, 0.74, 0.18, 0.12]], staples: [[0.5, 0.2], [0.3, 0.46]] }
    // (the usual way: his ass sewn shut in a big X, his dome seamed and stapled where it went through the ceiling)
    : { thread: '#F5F5F4', patch: '#7F1D1D', seams: [[0.02, 0.62, 0.3, 0.8], [0.02, 0.8, 0.3, 0.62], [0.32, 0.12, 0.8, 0.17]], staples: [[0.44, 0.14], [0.66, 0.16], [0.55, 0.4]], stain: { col: '#5C3A12', k: 0.18 } },
  update,
  drawFront: (c, state) => { drawLook(c, state); drawPortal(c, state.frame); },
  build: () => { lastSatan = null; nedSaid = null; nedOpen = 0; nedShut = 99; },
};
