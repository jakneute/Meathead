// THE PADDOCK GATE HACK: a minigame for a charge shard on the dino park's last stretch (the owner, 2026-11-01: "in jungle
// land, there's a control panel in one of the trees, a higher altitude one. the part after the t wrecks fight but before
// the temple. if you use the panel you gotta decode. let's iterate on this once you get it in and i can guide how to do
// it. once you 'hack' the panel, a shard comes out and you see the gates open and tons of animatronics run around and
// flay the audience watching them. it's basically a hacking minigame. don't make it too complicated, but it works in
// more of a 'puzzle' fashion. we'll figure out how it works later.").
//
//   THE TREE      past the paddock, between the last stretch's third tree and its fourth: a taller fake tree, three
//                 branch decks up it zigzagging (hackArt.ts HACK_LEDGES), off the ground way. The panel's on the top
//                 deck (hackArt.ts drawPanel).
//   THE PANEL     UP by it (the real prompt): Meathead's line (pants), then the shared ask (minigameConfirm.ts: A
//                 accept, B back, buffered).
//   THE TERMINAL  full screen, the HUD away, the player held (a cutscene to the engine: nothing touches him; only this
//                 reads the buttons). The CRT warms up, the boot text types out (a press skips it), then the puzzle
//                 (hackPuzzle.ts: swap it there; the first pass is a tumbler cipher). Its buttons shown up top (real,
//                 live). BACK quits (no penalty: try again whenever). Solved: ACCESS GRANTED.
//   THE MASSACRE  straight from ACCESS GRANTED, the cut (hackMassacre.ts): the feeding show's grandstand, the holding
//                 gates opening, the robots out and into the audience. The PA: PLEASE REMAIN SEATED. The screamers
//                 one at a time, a bubble over each (the owner, 2026-11-02: "they scream things like 'oh god, why? why
//                 would anyone release all these dinosaurs? all this life. lost. is it worth it.'"), each one got by
//                 the raptor waiting on them once they're done.
//   THE PULL      then the cut to him at the panel (hackPull.ts: "meathead who pulls the shard he now gets out of the
//                 fuse box that was hidden after solving the puzzle. he goes 'worth it'"): the keypad dropped open, the
//                 shard the fuse behind it; he yanks it, the panel dies; WORTH IT. (a bubble). Then the shared card
//                 (upgrades/shardAward.ts: once a save, buffered), then back in the world, control.
//                 The massacre and the pull are one cutscene: no input, no HUD; SKIP >> skips the lot (to the card).
//
// Kept: the shard in the save (Jungle Land's finds: 'shard-hack'); the panel dead and the grandstand a mess (art/zoo.ts:
// guests.ts massacred()) from then on, this run (stageMemo) and on any later visit (the find).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll, say, MEATHEAD_VOICE } from '../../../m1/game/platform/speech';
import { drawBubbleRows } from '../../../m1/game/render/speechStyle';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { getUi, setUi } from '../../store';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { onFloorish, upStart } from '../../upZone';
import { awardShard, shardWon, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import { pollM2, pressed } from '../../input';
import { minigamePausable, gamePaused } from '../../minigamePause';
import type { GameCue } from '../../music/moments';
import { ledge, meatheadSays, speak, type Said } from '../section';
import { box, text, INK } from './art/kit';
import type { ByPants } from './lines';
import { MASSACRE_MEMO } from './guests';
import { newPuzzle, type HackPuzzle, type PuzzleIn } from './hackPuzzle';
import { HACK_LEDGES, PANEL_X, PANEL_DECK, drawHackTree, drawTerminal, bootLength } from './hackArt';
import { makeMassacre, stepMassacre, drawMassacre, startTalk, doom, speakerDown, speakerHead, SPEAKER_WOMAN, OPEN_AT, FIRST_OUT, type Massacre } from './hackMassacre';
import { makePull, stepPull, drawPull, PULL_UP, type Pull } from './hackPull';
import { MH_PANEL, MH_QUIT, MH_WORTH, PA_SEATED, PA_MORE, PA_VOICE, GUEST_F, GUEST_M, GUEST_WHY, GUEST_LOST, GUEST_WORTH, GUEST_MORE_F, GUEST_MORE_M } from './hackLines';

/** The shard's id in the save (Jungle Land's finds). */
export const SHARD_LAND = 'adventure', SHARD_ID = 'shard-hack';
/** Frames: the CRT warming up, ACCESS GRANTED up, the cuts' fades, the gap between one line and the next. */
const WARM = 24, GRANTED_T = 110, FADE = 14, GAP = 12;

/** A line in the massacre: the PA's, or screamer `who`'s (hackMassacre.ts: in the order they speak). */
interface Beat { who: 'pa' | number; text: string; at: number }

type Phase = 'off' | 'line' | 'ask' | 'boot' | 'play' | 'granted' | 'cut' | 'pull' | 'card' | 'out';
interface Hack {
  phase: Phase; t: number; token: number;
  ask: Ask | null; card: ShardCard | null; puzzle: HackPuzzle | null; m: Massacre | null; pull: Pull | null;
  prompted: boolean; wasUp: boolean; upBuf?: number; was: Partial<Controls>; rep: Record<'left' | 'right' | 'up' | 'down', number>;
  /** The massacre's lines, the one up next, one being said; when the last one ended (the cut's clock). */
  beats: Beat[]; beat: number; busy: boolean; lastEnd: number;
  /** What's being said: the PA's words, a screamer's (and who), his. */
  pa: Said | null; gs: { i: number; text: string } | null; ms: Said | null;
  /** His line in the pull: said, done. When the panel blew; when the cut's ending. */
  mhSaid: boolean; lineDone: boolean; sparkAt: number; endAt: number;
}
const stores = new WeakMap<object, Hack>();
const hackOf = (state: GameState): Hack => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'off', t: 0, token: 0, ask: null, card: null, puzzle: null, m: null, pull: null, prompted: false, wasUp: false, was: {},
    rep: { left: 0, right: 0, up: 0, down: 0 }, beats: [], beat: 0, busy: false, lastEnd: 0, pa: null, gs: null, ms: null,
    mhSaid: false, lineDone: false, sparkAt: -999, endAt: -1,
  });
  return h;
};
let uiUp = false;

/** Hacked already: the panel's dead (this run, or won on this save). */
export const panelDead = (state: GameState) => !!state.stageMemo[MASSACRE_MEMO] || shardWon(SHARD_LAND, SHARD_ID);
/** Something of it's on (the dino park holds its own goings-on). */
export const hackOn = (state: GameState) => hackOf(state).phase !== 'off';
/** The music's (cues.ts): the terminal's own song from the boot (the ask's the land's), ACCESS GRANTED's sting (its ring
 *  carrying into the massacre's cut, the land's after). */
export const hackMusic = (state: GameState): GameCue | null => {
  const ph = hackOf(state).phase;
  return ph === 'boot' || ph === 'play' ? { song: 'game:hack' } : ph === 'granted' ? { song: null, sting: 'game:hack-granted' } : null;
};

const byPants = (state: GameState, b: ByPants) => (isNude(state) ? b.nude : isShat(state) ? b.shitty : b.clean);
const hands = (): Controls => ({ ...NO_CONTROLS });

// ---------------------------------------------------------------------------------------------------------------
// The mouse (on the game's canvas, in its 800 x 600): a click on a wheel turns it

let click: { x: number; y: number } | null = null;
let canvasEl: HTMLCanvasElement | null = null;
const gameCanvas = () => {
  if (canvasEl && canvasEl.isConnected) return canvasEl;
  let best: HTMLCanvasElement | null = null, area = 0;
  document.querySelectorAll('canvas').forEach(c => { const r = c.getBoundingClientRect(), a = r.width * r.height; if (a > area && Math.abs(r.width / Math.max(1, r.height) - 4 / 3) < 0.05) { area = a; best = c; } });
  canvasEl = best;
  return best as HTMLCanvasElement | null;
};
if (typeof window !== 'undefined') window.addEventListener('mousedown', e => {
  // (a click on the pause menu isn't one on a wheel: minigamePause.ts)
  if (e.button !== 0 || gamePaused()) return;
  const cv = gameCanvas();
  if (!cv) return;
  const r = cv.getBoundingClientRect();
  click = { x: ((e.clientX - r.left) / r.width) * CANVAS_WIDTH, y: ((e.clientY - r.top) / r.height) * CANVAS_HEIGHT };
});

// ---------------------------------------------------------------------------------------------------------------
// Holding him, letting go

const hold = (state: GameState) => {
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.vel.y = Math.max(0, p.vel.y);
  state.projectiles = state.projectiles.filter(q => q.owner !== 'player');
  if (!uiUp) { setUi({ hudOff: true, upPrompt: null }); uiUp = true; }
};
const release = (state: GameState, h: Hack) => {
  const p = state.player;
  p.inCutscene = false;
  h.phase = 'off'; h.t = 0; h.puzzle = null; h.m = null; h.pull = null; h.pa = null; h.gs = null; h.ms = null; h.token++;
  p.facing = PANEL_X < p.pos.x + p.width / 2 ? -1 : 1;
  if (h.ask) { closeAsk(); h.ask = null; }
  if (h.card) { closeShardCard(); h.card = null; }
  setUi({ hudOff: false, chordTips: null }); uiUp = false;
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (the dino park's update calls it first: null when it's off and he's not starting it)

export const buildHack = (state: GameState) => {
  for (const [x, y, w] of HACK_LEDGES) ledge(state, x, y, w, { hidden: true, tag: 'dino' });
};

export const updateHack = (ctx: FrameContext, controls: Controls): Controls | null => {
  const { state } = ctx, p = state.player, h = hackOf(state);
  const upNow = !!controls.up;
  if (h.phase === 'off') {
    if (uiUp) { setUi({ hudOff: false, chordTips: null }); uiUp = false; }
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    const free = !p.inCutscene && p.health > 0 && state.deathTimer <= 0;
    // (UP's zone: anywhere on the panel's ledge (the top one, the panel on it), on it or hopping (the owner's,
    // 2026-11-02: "i really don't want players to miss it. same for all"): upZone.ts)
    const [lx, , lw] = HACK_LEDGES[2];
    const near = free && !panelDead(state) && onFloorish(feet, PANEL_DECK) && cx > lx - 16 && cx < lx + lw + 16;
    if (near) { if (!h.prompted || getUi().upPrompt !== 'HACK THE PANEL') setUi({ upPrompt: 'HACK THE PANEL' }); h.prompted = true; }
    else if (h.prompted) { setUi({ upPrompt: null }); h.prompted = false; }
    const go = upStart(h, upNow && !h.wasUp, near, p.isGrounded);
    h.wasUp = upNow;
    if (!go) return null;
    h.prompted = false;
    startLine(state, h);
    return hands();
  }
  h.wasUp = upNow;
  h.t++;
  switch (h.phase) {
    case 'line': {
      hold(state);
      if (h.t > 600) toAsk(h);
      break;
    }
    case 'ask': {
      hold(state);
      const r = tickAsk(h.ask!, state.frame);
      if (r === 'accept') {
        h.ask = null; h.phase = 'boot'; h.t = 0; h.puzzle = newPuzzle(); h.was = { ...controls };
        playSound('click', 0.8); playSound('beep', 0.5, -12);
      } else if (r === 'back') {
        h.ask = null;
        release(state, h);
        meatheadSays(state, pickLine(byPants(state, MH_QUIT)), false);
      }
      break;
    }
    case 'boot': {
      hold(state);
      pollM2(state.frame);
      if (h.t === WARM) playSound('beep', 0.4, 6);
      if (h.t > WARM && h.t % 4 === 0 && h.t < WARM + bootLength()) playSound('click', 0.12, 8);
      const any = fresh(h, controls, 'jump') || fresh(h, controls, 'shoot') || pressed('ok');
      h.was = { ...controls };
      if (h.t > WARM + bootLength() + 50 || (h.t > WARM + 20 && any)) { h.phase = 'play'; h.t = 0; playSound('menuok', 0.5); h.was = { ...controls }; }
      break;
    }
    case 'play': {
      hold(state);
      pollM2(state.frame);
      if (pressed('back')) {
        playSound('menuback', 0.6);
        release(state, h);
        meatheadSays(state, pickLine(byPants(state, MH_QUIT)), false);
        break;
      }
      const inp: PuzzleIn = {
        left: rep(h, 'left', !!controls.left), right: rep(h, 'right', !!controls.right),
        up: rep(h, 'up', !!controls.up), down: rep(h, 'down', !!controls.down),
        ok: fresh(h, controls, 'jump') || pressed('ok'),
        click,
      };
      click = null;
      h.was = { ...controls };
      const ev = h.puzzle!.step(inp);
      if (ev === 'move') playSound('click', 0.35, 4);
      if (ev === 'turn') { playSound('click', 0.5, -2); playSound('grind', 0.12, 14); }
      setUi({ chordTips: [
        { pad: ['DPAD', 'LSTICK'], join: '/', kb: ['@left', '@right'], label: 'PICK A WHEEL' },
        { pad: ['DPAD_UP', 'DPAD_DOWN'], join: '/', kb: ['@up', '@down'], mouse: 'left', label: 'TURN IT' },
        { pad: ['BACK'], join: '/', kb: ['BKSP'], label: 'QUIT' },
      ] });
      if (ev === 'solved') {
        h.phase = 'granted'; h.t = 0;
        setUi({ chordTips: null });
        state.stageMemo[MASSACRE_MEMO] = '1';
        playSound('ding', 0.9); playSound('powerup', 0.7, 4); playSound('alarm', 0.3, 8);
      }
      break;
    }
    case 'granted': {
      hold(state);
      // Straight into the massacre
      if (h.t >= GRANTED_T) startCut(h);
      break;
    }
    case 'cut': {
      hold(state);
      const m = h.m!;
      stepMassacre(m);
      if (h.t > SKIP_AFTER) offerSkip();
      if (h.t > SKIP_AFTER && takeSkip()) { skipAll(state, h); break; }
      // The lines, one at a time, each after the last's done (no talk-over)
      const tok = h.token, bt = h.beats[h.beat];
      if (bt && !h.busy && m.t >= bt.at && m.t >= h.lastEnd + GAP) {
        h.busy = true; h.beat++;
        const done = () => { if (h.token !== tok) return; h.busy = false; if (h.m) h.lastEnd = h.m.t; };
        if (bt.who === 'pa') speak(PA_VOICE, bt.text, s => { h.pa = s; }, true, done);
        else {
          const i = bt.who;
          startTalk(m, i);
          speak(SPEAKER_WOMAN[i] ? GUEST_F : GUEST_M, bt.text, s => { h.gs = s ? { i, text: s.text } : null; }, true, () => { if (h.token === tok && h.m) doom(h.m, i); done(); });
        }
      }
      // (the last one said and got: a beat on it, then out)
      const last = h.beats.length - 1, lastWho = h.beats[last].who;
      const allSaid = h.beat > last && !h.busy;
      if (h.endAt < 0 && ((allSaid && (typeof lastWho !== 'number' || speakerDown(m, lastWho)) && m.t >= h.lastEnd + 40) || (allSaid && m.t >= h.lastEnd + 150) || h.t > 2700)) h.endAt = h.t;
      if (h.endAt >= 0 && h.t >= h.endAt + FADE + 6) {
        silenceAll();
        h.phase = 'pull'; h.t = 0; h.m = null; h.pa = null; h.gs = null; h.endAt = -1;
        h.pull = makePull(); h.mhSaid = false; h.lineDone = false;
      }
      break;
    }
    case 'pull': {
      hold(state);
      offerSkip();
      if (takeSkip()) { skipAll(state, h); break; }
      const pl = h.pull!;
      if (stepPull(pl) === 'yank') {
        h.sparkAt = state.frame;
        playSound('boom', 0.5, 8); playSound('glass', 0.5, 4); playSound('taser', 0.6); playSound('pickup', 0.8);
      }
      const tok = h.token;
      if (!h.mhSaid && pl.t >= PULL_UP + 10) {
        h.mhSaid = true;
        mhSay(pickLine(byPants(state, MH_WORTH)), s => { h.ms = s; }, () => { if (h.token === tok) h.lineDone = true; });
      }
      if (h.mhSaid && (h.lineDone || pl.t > PULL_UP + 420) && h.endAt < 0) h.endAt = h.t;
      if (h.endAt >= 0 && h.t >= h.endAt + 20) { h.endAt = -1; toCard(state, h); }
      break;
    }
    case 'card': {
      hold(state);
      if (!h.card || tickShardCard(h.card, state.frame)) { h.card = null; h.phase = 'out'; h.t = 0; }
      break;
    }
    case 'out': {
      hold(state);
      if (!h.pull || h.t >= FADE) release(state, h);
      break;
    }
  }
  // (on the terminal, START pauses it (ESC on the keys: BACKSPACE quits), the pause menu showing its controls:
  // minigamePause.ts; not on the ask, the shard's card or the cut)
  if (h.phase === 'boot' || h.phase === 'play' || h.phase === 'granted') minigamePausable(state, 'hack', quitHack);
  return hands();
};

/** QUIT MINIGAME (the pause menu: minigamePause.ts): as BACK on the terminal goes, his line, free on the deck by the
 *  panel. Quit on ACCESS GRANTED, before the gates go: not hacked after all (the panel live, try again whenever). */
const quitHack = (state: GameState) => {
  const h = hackOf(state);
  if (h.phase !== 'boot' && h.phase !== 'play' && h.phase !== 'granted') return;
  silenceAll();
  if (h.phase === 'granted') delete state.stageMemo[MASSACRE_MEMO];
  click = null;
  release(state, h);
  meatheadSays(state, pickLine(byPants(state, MH_QUIT)), false);
};

const startLine = (state: GameState, h: Hack) => {
  const p = state.player;
  h.token++; h.phase = 'line'; h.t = 0;
  hold(state);
  p.facing = PANEL_X < p.pos.x + p.width / 2 ? -1 : 1;
  const tok = h.token;
  meatheadSays(state, pickLine(byPants(state, MH_PANEL)), true, () => { if (h.token === tok && h.phase === 'line') toAsk(h); });
};
const toAsk = (h: Hack) => {
  h.phase = 'ask'; h.t = 0;
  h.ask = openAsk('HACK THE PANEL?', 'DECODE THE GATE PASSWORD. WHAT COULD GO WRONG?');
};
const startCut = (h: Hack) => {
  h.phase = 'cut'; h.t = 0; h.m = makeMassacre(); h.pa = null; h.gs = null; h.endAt = -1;
  h.beat = 0; h.busy = false; h.lastEnd = 0;
  // (the owner's three in order, the last the setup for his WORTH IT.; one more of each between, the PA's second)
  h.beats = [
    { who: 'pa', text: PA_SEATED, at: OPEN_AT + 16 },
    { who: 0, text: GUEST_WHY, at: FIRST_OUT + 40 },
    { who: 1, text: pickLine(GUEST_MORE_M), at: 0 },
    { who: 'pa', text: pickLine(PA_MORE), at: 0 },
    { who: 2, text: pickLine(GUEST_MORE_F), at: 0 },
    { who: 3, text: GUEST_LOST, at: 0 },
    { who: 4, text: GUEST_WORTH, at: 0 },
  ];
};
/** The shard's card (once a save), or straight on. */
const toCard = (state: GameState, h: Hack) => {
  if (awardShard(SHARD_LAND, SHARD_ID)) { h.card = openShardCard(); h.phase = 'card'; h.t = 0; }
  else { h.phase = 'out'; h.t = 0; }
  void state;
};
/** SKIP >>: the lot (the massacre and the pull), on to the card. */
const skipAll = (state: GameState, h: Hack) => {
  silenceAll();
  h.token++; h.m = null; h.pull = null; h.pa = null; h.gs = null; h.ms = null; h.endAt = -1;
  toCard(state, h);
};
/** His line in the pull, in his voice: `set` gets what's shown (null when it's done: drawn in a bubble, full screen). */
const mhSay = (text: string, set: (s: Said | null) => void, onDone: () => void) => {
  const s = { text };
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    always: true,
    onShow: spoken => { set(s); if (!spoken) setTimeout(() => { set(null); onDone(); }, Math.max(1800, text.length * 70)); },
    onHide: () => { set(null); onDone(); },
    onDropped: () => { set(null); onDone(); },
  });
  if (!shown) setTimeout(onDone, 0);
};

const fresh = (h: Hack, c: Controls, k: keyof Controls) => !!c[k] && !h.was[k];
/** A direction: a fresh press, then repeating while it's held. */
const rep = (h: Hack, k: 'left' | 'right' | 'up' | 'down', held: boolean) => {
  if (!held) { h.rep[k] = 0; return false; }
  const n = ++h.rep[k];
  // (one held into the terminal from before doesn't count till it's let go)
  if (n === 1 && h.was[k]) { h.rep[k] = -9999; return false; }
  return n === 1 || (n > 18 && (n - 18) % 6 === 0);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the tree and the panel (the world), the terminal and the cut (full screen, from the HUD pass)

export const drawHackWorld = (c: CanvasRenderingContext2D, state: GameState) => {
  const h = hackOf(state), f = state.frame || 0;
  const dead = panelDead(state) && !(h.phase === 'boot' || h.phase === 'play' || h.phase === 'granted');
  drawHackTree(c, state, f, { dead, using: h.phase !== 'off', sparkAt: h.sparkAt });
};

export const drawHackHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const h = hackOf(state), f = state.frame || 0;
  if (h.phase === 'boot' || h.phase === 'play' || h.phase === 'granted') {
    drawTerminal(c, f, { on: h.phase === 'boot' ? Math.min(1, h.t / WARM) : 1, t: h.phase === 'boot' ? h.t - WARM : 9999, puzzle: h.phase === 'boot' ? null : h.puzzle, granted: h.phase === 'granted' ? h.t : -1 });
    return;
  }
  if (h.phase === 'cut' && h.m) {
    drawMassacre(c, h.m, f);
    // (the PA's words, up top, from a horn; a screamer's in a bubble over them: each only while it's said)
    if (h.pa) paCaption(c, h.pa.text);
    if (h.gs) { const [x, y] = speakerHead(h.m, h.gs.i); bubble(c, h.gs.text, x, y); }
    // (in from black, out to it)
    const k = h.t < FADE ? 1 - h.t / FADE : h.endAt >= 0 ? Math.min(1, (h.t - h.endAt) / FADE) : 0;
    if (k > 0) { c.fillStyle = `rgba(0, 0, 0, ${k.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  }
  if (h.pull && (h.phase === 'pull' || h.phase === 'card' || h.phase === 'out')) {
    const at = drawPull(c, h.pull, f, { nude: isNude(state), shat: isShat(state), talking: !!h.ms });
    if (h.ms && h.phase === 'pull') bubble(c, h.ms.text, at.head[0], at.head[1], at.mouth[0]);
    const k = h.phase === 'pull' && h.t < FADE ? 1 - h.t / FADE : h.phase === 'out' ? Math.min(1, h.t / FADE) : 0;
    if (k > 0) { c.fillStyle = `rgba(0, 0, 0, ${k.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  }
  if ((h.phase === 'cut' && h.t > SKIP_AFTER) || h.phase === 'pull') drawSkipPrompt(c, CANVAS_WIDTH);
};

/** A speech bubble, full screen (a skippable cutscene's): its tail down to (tip, y), kept whole on screen. */
const bubble = (c: CanvasRenderingContext2D, s: string, x: number, y: number, tip = x) => {
  const font = '8px "Press Start 2P"';
  c.font = font;
  const words = s.split(' '), rows: string[] = [];
  let cur = '';
  for (const w of words) { const tt = cur ? `${cur} ${w}` : w; if (c.measureText(tt).width > 300 && cur) { rows.push(cur); cur = w; } else cur = tt; }
  if (cur) rows.push(cur);
  const half = Math.max(...rows.map(r => c.measureText(r).width)) / 2 + 12;
  const bx = Math.max(half + 6, Math.min(CANVAS_WIDTH - half - 6, x));
  const by = Math.max((rows.length - 1) * 12 + 22, y - 12);
  drawBubbleRows(c, rows, bx, by, tip, 12, font);
};

const paCaption = (c: CanvasRenderingContext2D, s: string) => {
  c.font = '8px "Press Start 2P"';
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const tt = cur ? `${cur} ${w}` : w; if (c.measureText(tt).width > 520 && cur) { lines.push(cur); cur = w; } else cur = tt; }
  if (cur) lines.push(cur);
  const wMax = Math.max(...lines.map(l => c.measureText(l).width)), bw = wMax + 64, bh = lines.length * 14 + 14, bx = (CANVAS_WIDTH - bw) / 2, by = 54;
  box(c, bx - 2, by - 2, bw + 4, bh + 4, INK); box(c, bx, by, bw, bh, '#1E293B'); box(c, bx, by, bw, 2, '#475569');
  // (a PA horn)
  box(c, bx + 10, by + bh / 2 - 4, 6, 8, '#9AA0A6'); c.fillStyle = '#CBD5E1'; c.beginPath(); c.moveTo(bx + 16, by + bh / 2 - 4); c.lineTo(bx + 30, by + bh / 2 - 10); c.lineTo(bx + 30, by + bh / 2 + 10); c.lineTo(bx + 16, by + bh / 2 + 4); c.closePath(); c.fill();
  lines.forEach((l, i) => text(c, l, bx + 40 + wMax / 2, by + 18 + i * 14, '#FDE047', 8, 'center', INK));
};

