// A refight (Ned's boss rush, the water park's level 4): one wrapper for all eight. The owner's rules
// (necromancer-boss-rush.md): every refight boss at 999 HP, the same fight ("more attrition based": the mechanics as
// they were, more of him to get through), a hellish knockoff of where he died, the boss stitched up the way he died
// (the look only: never harder for how he died), Ned's spoken intro naming the sin (skippable), new lines.
//
// How: the land's own stage runs whole (its layout, its sections, its boss's real fight code), started at the boss's
// checkpoint, with park4/hook.ts switched on: the land runs its retry path (he walks in, the boss's short entrance),
// the boss at 999, his line pools swapped, his death not rewriting the first one's record, no walk-away. Over it, here:
//   - the hell: its light (graded red), its sky's haze, its props along the arena's back, the stitches on him;
//   - first (in through the portal, not a respawn): the cheats build's variant picker (always, in that build: never
//     the public one), then Ned's intro card (his gross-up, the place, the sin, his lines in the box at the bottom;
//     SKIP >> takes all of it). The world's held still meanwhile (holdTick), no HUD, no input;
//   - won: VICTORY (the land's own), then the file marks the rematch done and it's back to the lot (park4/lot.ts).
// Dying in it: the land's own respawn (outside the boss's door, walked back in), no intro again.

import type { StageLayout } from '../../../m1/game/stages/index';
import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../../../m1/constants';
import { say, silenceAll, setPoolSwap } from '../../../m1/game/platform/speech';
import { playSound, playMenuOk, playCursor } from '../../../m1/game/platform/audio';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../../m1/game/platform/skip';
import { getActiveGamepad, getGamepadMovement } from '../../../m1/game/platform/gamepad';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { isLeaving, setUi, takeStartCheckpoint, setEndgameAt, endgameAt, goTo, setStartCheckpoint } from '../../store';
import { saveProgress } from '../../save';
import { setEndgameHour } from '../../timeOfDay';
import { M2_PUBLIC } from '../../build';
import { pollM2, pressed, keyHeld } from '../../input';
import { voice } from '../../adventure/section';
import { setRefightOn, setRefightWon, swapLines, touchRefight, refightOn, refightPool } from './hook';
import { hellLight, drawHellSky, drawPlaceSky, drawHellProps } from './hell';
import { drawNedGrossBack, warmNedGross } from './nedGross';
import { drawIntroCard, SLAM_AT } from './card';
import type { RefightDef, Pool } from './defs';
import { INTROS, NED_VOICE } from './lines/ned';
import { L4_HOUR, L4_ID, LOT_CP } from './where';

type Ctx = CanvasRenderingContext2D;
type Dressed = 'clean' | 'shitty' | 'nude';
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');

// (the refight's line pools: m1 speech.ts's pickLine asks hook.ts first, only while one's on)
setPoolSwap(refightPool);

/** Ned's intro to this one, in order: the sin (named, and what he did), the punishment, why it fits, the kicker (by
 *  Meathead's pants). None for the Queen (she's the robot; Ned's up in her booth). */
export const introLines = (def: RefightDef, d: Dressed) => {
  const i = INTROS[def.land];
  if (!i) return [];
  return [i.sin, i.punish, i.why, i.kick[d][0]];
};

// ---------------------------------------------------------------------------------------------------------------
// The card: the cheats' picker, then Ned's intro (the world held still under it)

interface Card {
  step: 'pick' | 'intro' | 'done';
  /** The picker: which row, the look's index, the statue's. */
  row: number; look: number; statue: number;
  /** The intro: frames in, its lines, which is being said, what's up (only while it's said). */
  t: number; lines: string[]; at: number; said: string | null; tok: number;
  /** Real ticks (holdTick runs with no game time: its own count, for the input's frame and the gross-up's life). */
  n: number;
  /** A direction held last tick (the picker moves one a press). */
  held: string;
}
let card: Card | null = null;
let tokens = 0;

const applyPick = (def: RefightDef, c: Card) => {
  setRefightOn({ land: def.land, look: def.looks[c.look] ?? def.lookNow(), statue: def.statueNow ? (c.statue ? 'fell' : 'shot') : undefined });
  installSwaps(def);
};
const installSwaps = (def: RefightDef) => {
  const ways = ['clean', 'shitty', 'nude'] as const;
  const arr = (p: Pool, w: typeof ways[number]): readonly string[] => (Array.isArray(p) ? (p as readonly string[]) : (p as Exclude<Pool, readonly string[]>)[w]);
  for (const [from, to] of def.swaps()) {
    if (Array.isArray(from)) { swapLines(from as readonly string[], Array.isArray(to) ? (to as readonly string[]) : [...arr(to, 'clean'), ...arr(to, 'shitty'), ...arr(to, 'nude')]); continue; }
    for (const w of ways) swapLines(arr(from, w), arr(to, w));
  }
};

const nextLine = (c: Card) => {
  if (c.at >= c.lines.length) { c.step = 'done'; return; }
  const text = c.lines[c.at], tok = ++tokens;
  c.tok = tok;
  const end = () => { if (card !== c || c.tok !== tok) return; c.said = null; c.at++; nextLine(c); };
  const shown = say(text, voice(NED_VOICE), 'queue', {
    always: true,
    onShow: spoken => { if (card !== c || c.tok !== tok) return; c.said = text; if (!spoken) setTimeout(end, Math.max(1800, text.length * 70)); },
    onHide: end, onDropped: end,
  });
  if (!shown) setTimeout(end, 0);
};

const startCard = (def: RefightDef, state: GameState, fresh: boolean) => {
  const pick = fresh && !M2_PUBLIC;
  const hasIntro = fresh && !!INTROS[def.land];
  if (!pick && !hasIntro) { card = null; return; }
  const look = Math.max(0, def.looks.indexOf(def.lookNow()));
  card = { step: pick ? 'pick' : 'intro', row: 0, look, statue: def.statueNow?.() === 'fell' ? 1 : 0, t: 0, lines: [], at: 0, said: null, tok: 0, n: 0, held: 'none' };
  warmNedGross();
  if (!pick) beginIntro(def, state, card);
};
const beginIntro = (def: RefightDef, state: GameState, c: Card) => {
  if (!INTROS[def.land]) { c.step = 'done'; return; }
  c.step = 'intro'; c.t = 0; c.at = 0; c.lines = introLines(def, dressed(state));
  // (the sting: a cymbal-ish crash, a low hit, a whoosh in; his first line after a beat)
  playSound('whoosh', 0.7, -8); playSound('thud', 0.6, -14); playSound('ding', 0.5, -12);
  warmNedGross();
  setTimeout(() => { if (card === c) nextLine(c); }, 350);
};
const endCard = (state: GameState) => {
  card = null; tokens++;
  const p = state.player; p.inCutscene = false;
  setUi({ introCutscene: false });
};

/** The picker's input: a direction pressed this tick, and confirm. */
const dirNow = () => {
  const gp = getActiveGamepad(), m = gp ? getGamepadMovement(gp, 0.4) : null;
  if (keyHeld('arrowup') || keyHeld('keyw') || m?.up) return 'up';
  if (keyHeld('arrowdown') || keyHeld('keys') || m?.down) return 'down';
  if (keyHeld('arrowleft') || keyHeld('keya') || m?.left) return 'left';
  if (keyHeld('arrowright') || keyHeld('keyd') || m?.right) return 'right';
  return 'none';
};

/** A tick of the card (holdTick): true while it's up (no game time passes under it). */
const tickCard = (def: RefightDef, state: GameState): boolean => {
  const c = card;
  if (!c) return false;
  touchRefight();
  c.n++;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  setUi({ introCutscene: true });
  pollM2(-1000 - c.n);
  if (c.step === 'pick') {
    const d = dirNow(), press = d !== c.held && d !== 'none';
    c.held = d;
    const rows = def.statueNow ? 2 : 1;
    if (press && (d === 'up' || d === 'down')) { c.row = (c.row + (d === 'down' ? 1 : rows - 1)) % rows; playCursor(); }
    if (press && (d === 'left' || d === 'right')) {
      const k = d === 'right' ? 1 : -1;
      if (c.row === 0) c.look = (c.look + k + def.looks.length) % def.looks.length; else c.statue = 1 - c.statue;
      playCursor();
    }
    if (c.n > 12 && (pressed('ok') || pressed('a'))) { playMenuOk(); applyPick(def, c); beginIntro(def, state, c); if ((c.step as Card['step']) === 'done') endCard(state); }
    return true;
  }
  if (c.step === 'intro') {
    c.t++;
    if (c.t === SLAM_AT) { playSound('crash', 0.7, -6); playSound('thud', 0.8, -18); }
    if (c.t > SKIP_AFTER) offerSkip();
    if (c.t > SKIP_AFTER && (takeSkip() || pressed('back'))) { silenceAll(); c.step = 'done'; }
    // (a line that never ends (nothing heard back): on after a long while anyway)
    if (c.t > 60 * 40) c.step = 'done';
  }
  if (c.step === 'done') { endCard(state); return false; }
  return true;
};

const drawCard = (def: RefightDef, c: Ctx, state: GameState) => {
  const k = card;
  if (!k) return;
  c.save();
  drawNedGrossBack(c, W, H);
  if (k.step === 'pick') {
    // (the cheats build's: which of his looks, always asked here, never in the public game)
    c.fillStyle = 'rgba(0,0,0,0.75)'; c.fillRect(120, 150, 560, 300);
    c.strokeStyle = '#DC2626'; c.lineWidth = 4; c.strokeRect(120, 150, 560, 300);
    c.font = '8px "Press Start 2P"'; c.textAlign = 'center';
    c.fillStyle = '#F87171'; c.fillText('REFIGHT VARIANT (CHEATS BUILD)', 400, 182);
    c.font = '12px "Press Start 2P"'; c.fillStyle = '#FDE047'; c.fillText(def.boss, 400, 214);
    const row = (y: number, on: boolean, label: string, value: string) => {
      c.fillStyle = on ? '#FDE047' : '#3F3F46'; c.fillRect(150, y - 18, 500, 30);
      c.fillStyle = on ? '#000' : '#FFF'; c.font = '8px "Press Start 2P"';
      c.textAlign = 'left'; c.fillText(label, 162, y + 2);
      c.textAlign = 'right'; c.fillText(`< ${value} >`, 638, y + 2);
    };
    row(266, k.row === 0, 'HOW HE DIED', def.lookName(def.looks[k.look]));
    if (def.statueNow) row(310, k.row === 1, 'THE STATUE', k.statue ? 'FELL APART' : 'SHOT HERSELF');
    c.textAlign = 'center'; c.fillStyle = '#A1A1AA'; c.font = '7px "Press Start 2P"';
    c.fillText(`THIS FILE: ${def.lookName(def.lookNow())}${def.statueNow ? ` / ${def.statueNow() === 'fell' ? 'FELL APART' : 'SHOT HERSELF'}` : ''}`, 400, 370);
    c.fillStyle = '#FFF'; c.fillText('UP/DOWN: ROW   LEFT/RIGHT: CHANGE   CONFIRM: GO', 400, 420);
    c.restore();
    return;
  }
  // (the title card: the sin slammed on, the sinner stitched up in his frame, his hell behind it, Ned the MC: card.ts)
  drawIntroCard(c, def, { n: k.n, t: k.t, at: k.at, said: k.said, look: refightOn()?.look ?? def.lookNow() }, state, INTROS[def.land]?.place ?? '');
  // (the black bars, the box at the bottom: his words, only while they're said)
  c.fillStyle = '#000'; c.fillRect(0, 0, W, 40); c.fillRect(0, H - 120, W, 120);
  c.strokeStyle = '#7F1D1D'; c.lineWidth = 3; c.strokeRect(10, H - 112, W - 20, 100);
  if (k.said) {
    c.font = '9px "Press Start 2P"'; c.textAlign = 'left';
    c.fillStyle = '#F87171'; c.fillText('NED:', 26, H - 88);
    const words = k.said.split(' '), lines: string[] = []; let cur = '';
    for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > W - 70 && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    c.fillStyle = '#FFF'; lines.slice(0, 4).forEach((l, i) => c.fillText(l, 26, H - 66 + i * 16));
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The layout

/** Back to the lot, the rematch done (on the file: a reload skips it). */
const won = (def: RefightDef) => {
  const done = new Set(endgameAt()?.rematches ?? []);
  done.add(def.land);
  setEndgameAt({ stage: L4_ID, cp: LOT_CP, rematches: [...done] });
  saveProgress();
  setRefightWon(null);
  setStartCheckpoint(LOT_CP);
  goTo(L4_ID);
};

/** The owner's "be sure to drop a big health and ammo refill before each refight too": the big health and the big
 *  ammo by where he starts (in through the portal or back after dying), unless the land's own boss-door refill is
 *  already there. */
const bigRefill = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const near = (t: string) => state.pickups.some(k => k.type === t && Math.abs(k.pos.x - cx) < 600 && Math.abs(k.pos.y - feet) < 300);
  const f = p.facing || 1;
  if (!near('large_health')) state.pickups.push({ id: 'rf-refill-health', pos: { x: cx + f * 70 - 10, y: feet - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_health', life: 1e9 });
  if (!near('large_ammo')) state.pickups.push({ id: 'rf-refill-ammo', pos: { x: cx + f * 110 - 10, y: feet - 20 }, vel: { x: 0, y: 0 }, width: 20, height: 20, type: 'large_ammo', life: 1e9 });
};
export const refightLayout = (def: RefightDef): StageLayout => {
  const inner = def.inner;
  const t = () => touchRefight();
  return {
    ...inner,
    build: (state, skipToBoss) => {
      // (in through Ned's portal (or the test picker), or back after dying in it)
      const fresh = isLeaving();
      takeStartCheckpoint();
      if (fresh) { state.checkpoint = def.cp; }
      setRefightOn({ land: def.land, look: refightOn()?.land === def.land && !fresh ? refightOn()!.look : def.lookNow(), statue: def.statueNow?.() });
      installSwaps(def);
      setRefightWon(() => won(def));
      setEndgameHour(L4_HOUR);
      const at = inner.build(state, skipToBoss);
      // (the hour again: the land's build may have set its own)
      setEndgameHour(L4_HOUR);
      def.build?.(state, fresh);
      bigRefill(state);
      // (on the file: still level 4 (CONTINUE puts him in the lot, his rematches kept))
      if (fresh) { setEndgameAt({ stage: L4_ID, cp: LOT_CP }); saveProgress(); }
      startCard(def, state, fresh);
      if (card) { state.player.inCutscene = true; setUi({ introCutscene: true }); }
      return at;
    },
    update: (ctx, controls) => {
      t();
      const out = inner.update ? inner.update(ctx, controls) : controls;
      def.update?.(ctx);
      return out;
    },
    holdTick: (ctx: FrameContext) => {
      t();
      if (card) return tickCard(def, ctx.state);
      return inner.holdTick?.(ctx) ?? false;
    },
    lighting: (state) => { t(); return hellLight(inner.lighting?.(state), def.place); },
    drawBackdrop: (c, state) => {
      t();
      const r = inner.drawBackdrop ? inner.drawBackdrop(c, state) : false;
      if (!r) { c.fillStyle = '#1A0206'; c.fillRect(0, 0, W, H); }
      if (def.place) drawPlaceSky(c, state, def.land, def.place); else drawHellSky(c, state.frame);
      return true;
    },
    drawBack: (c, state) => {
      t();
      inner.drawBack?.(c, state);
      const a = def.arena(state);
      if (a) drawHellProps(c, state, def.sin, a);
      def.drawBack?.(c, state);
    },
    drawFront: (c, state) => {
      inner.drawFront?.(c, state);
      // (him stitched up the way he died: in his own art (park4/looks.ts, through each boss's own draw))
      def.drawFront?.(c, state);
    },
    drawHud: (c, state) => {
      t();
      inner.drawHud?.(c, state);
      def.drawHud?.(c, state);
      if (card) drawCard(def, c, state);
    },
  };
};
