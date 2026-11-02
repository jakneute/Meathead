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
//   THE SHARD     back in the world: the panel blows (smashed, sparking, for good), the CHARGE SHARD pops out of its
//                 coin return into his hands, his line; the shared card (upgrades/shardAward.ts: once a save, buffered).
//   THE MASSACRE  then the cut (hackMassacre.ts): the feeding show's grandstand, the holding gates opening, the robots
//                 out and into the audience. The PA: PLEASE REMAIN SEATED. No input, no HUD; SKIP >> skips the lot
//                 (the cut and his line after). Back on him up the tree: his line (a bubble), then control.
//
// Kept: the shard in the save (Jungle Land's finds: 'shard-hack'); the panel dead and the grandstand a mess (art/zoo.ts:
// guests.ts massacred()) from then on, this run (stageMemo) and on any later visit (the find).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { getUi, setUi } from '../../store';
import { openAsk, tickAsk, closeAsk, type Ask } from '../../minigameConfirm';
import { awardShard, shardWon, openShardCard, tickShardCard, closeShardCard, type ShardCard } from '../../upgrades/shardAward';
import { pollM2, pressed } from '../../input';
import { minigamePausable, gamePaused } from '../../minigamePause';
import { ledge, meatheadSays, speak, type Said } from '../section';
import { box, text, INK } from './art/kit';
import type { ByPants } from './lines';
import { MASSACRE_MEMO } from './guests';
import { newPuzzle, type HackPuzzle, type PuzzleIn } from './hackPuzzle';
import { HACK_LEDGES, PANEL_X, PANEL_DECK, panelSlot, drawHackTree, drawShardGem, drawTerminal, bootLength } from './hackArt';
import { makeMassacre, stepMassacre, drawMassacre, massacreDone, OPEN_AT, type Massacre } from './hackMassacre';
import { MH_PANEL, MH_QUIT, MH_SHARD, MH_AFTER, PA_SEATED, PA_MORE, PA_VOICE } from './hackLines';

/** The shard's id in the save (Jungle Land's finds). */
export const SHARD_LAND = 'adventure', SHARD_ID = 'shard-hack';
/** Frames: the CRT warming up, ACCESS GRANTED up, the shard's flight, the cut's fades. */
const WARM = 24, GRANTED_T = 110, POP_FLY = 44, FADE = 14;

type Phase = 'off' | 'line' | 'ask' | 'boot' | 'play' | 'granted' | 'pop' | 'card' | 'cut' | 'react';
interface Hack {
  phase: Phase; t: number; token: number;
  ask: Ask | null; card: ShardCard | null; puzzle: HackPuzzle | null; m: Massacre | null;
  prompted: boolean; wasUp: boolean; was: Partial<Controls>; rep: Record<'left' | 'right' | 'up' | 'down', number>;
  /** The PA in the cut: what it's saying, its two lines said. */
  pa: Said | null; paStep: number;
  /** The shard flying out of the panel (where it is), landed; his line after it done; when the panel blew. */
  sx: number; sy: number; landed: boolean; lineDone: boolean; sparkAt: number; endAt: number;
}
const stores = new WeakMap<object, Hack>();
const hackOf = (state: GameState): Hack => {
  const key = (state.stage ?? state) as object;
  let h = stores.get(key);
  if (!h) stores.set(key, h = {
    phase: 'off', t: 0, token: 0, ask: null, card: null, puzzle: null, m: null, prompted: false, wasUp: false, was: {},
    rep: { left: 0, right: 0, up: 0, down: 0 }, pa: null, paStep: 0, sx: 0, sy: 0, landed: false, lineDone: false, sparkAt: -999, endAt: -1,
  });
  return h;
};
let uiUp = false;

/** Hacked already: the panel's dead (this run, or won on this save). */
export const panelDead = (state: GameState) => !!state.stageMemo[MASSACRE_MEMO] || shardWon(SHARD_LAND, SHARD_ID);
/** Something of it's on (the dino park holds its own goings-on). */
export const hackOn = (state: GameState) => hackOf(state).phase !== 'off';

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
  h.phase = 'off'; h.t = 0; h.puzzle = null; h.m = null; h.pa = null; h.token++;
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
    const near = free && !panelDead(state) && p.isGrounded && Math.abs(feet - PANEL_DECK) < 6 && cx > PANEL_X - 34 && cx < PANEL_X + 64;
    if (near) { if (!h.prompted || getUi().upPrompt !== 'HACK THE PANEL') setUi({ upPrompt: 'HACK THE PANEL' }); h.prompted = true; }
    else if (h.prompted) { setUi({ upPrompt: null }); h.prompted = false; }
    const go = near && upNow && !h.wasUp;
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
      if (h.t >= GRANTED_T) {
        // Back in the world: the panel blows, the shard pops out of its coin return
        h.phase = 'pop'; h.t = 0; h.sparkAt = state.frame;
        const s = panelSlot(); h.sx = s.x; h.sy = s.y; h.landed = false; h.lineDone = false;
        playSound('boom', 0.6, 6); playSound('glass', 0.6); playSound('taser', 0.5);
        for (let i = 0; i < 20; i++) state.particles.push({ pos: { x: PANEL_X - 6 + Math.random() * 12, y: PANEL_DECK - 70 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 20 + Math.random() * 20, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 2, grav: 0.25 });
      }
      break;
    }
    case 'pop': {
      hold(state);
      const s = panelSlot(), u = Math.min(1, h.t / POP_FLY);
      const hx = p.pos.x + p.width / 2, hy = p.pos.y + p.height * 0.45;
      h.sx = s.x + (hx - s.x) * u; h.sy = s.y + (hy - s.y) * u - Math.sin(Math.PI * u) * 60;
      if (h.t === 2) playSound('twinkle', 0.7);
      if (u >= 1 && !h.landed) {
        h.landed = true; playSound('pickup', 0.8);
        const tok = h.token;
        meatheadSays(state, pickLine(byPants(state, MH_SHARD)), true, () => { if (h.token === tok) h.lineDone = true; });
      }
      if (h.landed && (h.lineDone || h.t > POP_FLY + 300)) {
        if (awardShard(SHARD_LAND, SHARD_ID)) { h.card = openShardCard(); h.phase = 'card'; h.t = 0; }
        else startCut(h);
      }
      break;
    }
    case 'card': {
      hold(state);
      if (h.card && tickShardCard(h.card, state.frame)) { h.card = null; startCut(h); }
      break;
    }
    case 'cut': {
      hold(state);
      const m = h.m!;
      stepMassacre(m);
      if (h.t > SKIP_AFTER) offerSkip();
      if (h.t > SKIP_AFTER && takeSkip()) { silenceAll(); release(state, h); break; }
      // The PA: the owner's line as the gates go, then one more once that's done
      const tok = h.token;
      if (h.paStep === 0 && m.t >= OPEN_AT + 16) { h.paStep = 1; speak(PA_VOICE, PA_SEATED, s => { h.pa = s; }, true, () => { if (h.token === tok) h.paStep = 2; }); }
      if (h.paStep === 2 && m.t >= 260) { h.paStep = 3; speak(PA_VOICE, pickLine(PA_MORE), s => { h.pa = s; }, true, () => { if (h.token === tok) h.paStep = 4; }); }
      if (h.endAt < 0 && ((massacreDone(m) && h.paStep >= 4) || h.t > 1500)) h.endAt = h.t;
      if (h.endAt >= 0 && h.t >= h.endAt + FADE + 20) {
        h.phase = 'react'; h.t = 0; h.m = null; h.pa = null; h.endAt = -1;
        p.facing = -1;
      }
      break;
    }
    case 'react': {
      hold(state);
      offerSkip();
      if (takeSkip()) { silenceAll(); release(state, h); break; }
      if (h.t === FADE) { const tok = h.token; meatheadSays(state, pickLine(byPants(state, MH_AFTER)), true, () => { if (h.token === tok) h.endAt = -2; }); }
      if (h.endAt === -2 || h.t > 500) { h.endAt = -1; release(state, h); }
      break;
    }
  }
  // (on the terminal, START pauses it (ESC on the keys: BACKSPACE quits), the pause menu showing its controls:
  // minigamePause.ts; not on the ask, the shard's card or the cut)
  if (h.phase === 'boot' || h.phase === 'play' || h.phase === 'granted') minigamePausable(state, 'hack');
  return hands();
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
  h.phase = 'cut'; h.t = 0; h.m = makeMassacre(); h.paStep = 0; h.pa = null; h.endAt = -1;
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
  if (h.phase === 'pop' && !h.landed) drawShardGem(c, h.sx, h.sy, 1, f);
};

export const drawHackHud = (c: CanvasRenderingContext2D, state: GameState) => {
  const h = hackOf(state), f = state.frame || 0;
  if (h.phase === 'boot' || h.phase === 'play' || h.phase === 'granted') {
    drawTerminal(c, f, { on: h.phase === 'boot' ? Math.min(1, h.t / WARM) : 1, t: h.phase === 'boot' ? h.t - WARM : 9999, puzzle: h.phase === 'boot' ? null : h.puzzle, granted: h.phase === 'granted' ? h.t : -1 });
    return;
  }
  if (h.phase === 'cut' && h.m) {
    drawMassacre(c, h.m, f);
    // (the PA's words, up top, from a horn, only while it's saying them)
    if (h.pa) paCaption(c, h.pa.text);
    // (in from black, out to it)
    const k = h.t < FADE ? 1 - h.t / FADE : h.endAt >= 0 ? Math.min(1, (h.t - h.endAt) / FADE) : 0;
    if (k > 0) { c.fillStyle = `rgba(0, 0, 0, ${k.toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  }
  if (h.phase === 'react' && h.t < FADE) { c.fillStyle = `rgba(0, 0, 0, ${(1 - h.t / FADE).toFixed(2)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
  if ((h.phase === 'cut' && h.t > SKIP_AFTER) || h.phase === 'react') drawSkipPrompt(c, CANVAS_WIDTH);
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

