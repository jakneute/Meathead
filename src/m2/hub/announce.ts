// The PA over the hub (the owner's, 2026-11-03: "when you clear all 8 lands and when you get 100 percent completion,
// there will be an announcement. you can get two annoucements or one annoucement if you happen to get all collectibles
// in one go. but for either of the annoucements the annoucer will say 'exit through america usa to finish your fun
// filled day'"; and "have a brief cutscene where the loudspeaker announces the 'neverending fireworks show'").
//
// Each once a file (saved: store.ts announcedLands / announcedAll), the first time he's in the hub with it earned:
//   lands  all eight lands cleared (finds still out there: the PA says so)
//   all    everything: the eight and all 24 hidden finds: the NEVERENDING FIREWORKS SHOW (the first shells go up on
//          the line that announces it: fireworks.ts, held till then)
//   both   the two at once (he had all 24 before the last boss): the eight's news, then the fireworks
// A cutscene: out of his hands, no HUD, the whole lot skippable (Start / Esc); the PA's words up only while said, in a
// bubble across the top (a cutscene's, skippable). Then Meathead's own word on it (hub/index.ts arriveIn).

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { say, cutVoice } from '../../m1/game/platform/speech';
import { voicesLoaded } from '../../m1/game/platform/voiceclips';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../../m1/game/platform/skip';
import {
  PA_VOICE, PA_ANNOUNCE_LANDS, PA_ANNOUNCE_LEFT, PA_ANNOUNCE_ALL, PA_ANNOUNCE_BOTH, PA_ANNOUNCE_FIREWORKS, PA_ANNOUNCE_EXIT,
} from '../intro/lines';
import { landsCleared, ALPHA_LAND_COUNT, findsFoundTotal, FINDS_TOTAL, announcedLands, announcedAll, setAnnounced } from '../store';
import { saveProgress } from '../save';
import { holdFireworks, fireworksVolley } from '../fireworks';

type Ctx = CanvasRenderingContext2D;
export type AnnounceKind = 'lands' | 'all' | 'both';

/** (the cheat menu's: hear them again) */
let replay = false;
export const replayAnnouncements = () => { replay = true; };

/** What's due on arriving at the hub now (null: nothing). */
// (dev: ?hubpa=lands|all|both plays that one on the first way into the hub, whatever's been done)
let devKind = import.meta.env.DEV && typeof location !== 'undefined' ? new URLSearchParams(location.search).get('hubpa') as AnnounceKind | null : null;
export const announcementDue = (): AnnounceKind | null => {
  if (devKind === 'lands' || devKind === 'all' || devKind === 'both') { const k = devKind; devKind = null; return k; }
  const lands = landsCleared() >= ALPHA_LAND_COUNT, all = lands && findsFoundTotal() >= FINDS_TOTAL;
  const needL = lands && (replay || !announcedLands()), needA = all && (replay || !announcedAll());
  return needL && needA ? 'both' : needA ? 'all' : needL ? 'lands' : null;
};

/** The lines for each, in order. */
export const announcementLines = (kind: AnnounceKind, findsLeft = findsFoundTotal() < FINDS_TOTAL): string[] =>
  kind === 'lands' ? [PA_ANNOUNCE_LANDS, ...(findsLeft ? [PA_ANNOUNCE_LEFT] : []), PA_ANNOUNCE_EXIT]
    : kind === 'all' ? [PA_ANNOUNCE_ALL, ...PA_ANNOUNCE_FIREWORKS, PA_ANNOUNCE_EXIT]
      : [PA_ANNOUNCE_LANDS, PA_ANNOUNCE_BOTH, ...PA_ANNOUNCE_FIREWORKS, PA_ANNOUNCE_EXIT];

export interface Announce {
  kind: AnnounceKind; lines: string[];
  t: number; line: number; said: string | null; nextAt: number; gap: boolean;
  /** The line the fireworks go up on (-1: none in this one). */
  fireAt: number;
  done: boolean;
}

/** The hub's built with one due: the fireworks held till the PA's line for them. */
export const prepareAnnouncement = (kind: AnnounceKind | null) => { holdFireworks(kind === 'all' || kind === 'both'); };

export const startAnnouncement = (kind: AnnounceKind): Announce => {
  const lines = announcementLines(kind);
  // (heard: on the file now, so it's never again; skipping it counts)
  replay = false;
  setAnnounced(announcedLands() || kind !== 'all', announcedAll() || kind !== 'lands');
  saveProgress();
  return { kind, lines, t: 0, line: -1, said: null, nextAt: 40, gap: false, fireAt: lines.findIndex(l => l.includes('FIREWORKS SHOW')), done: false };
};

const finish = (a: Announce) => {
  a.done = true; a.said = null;
  holdFireworks(false);
};

const sayLine = (a: Announce, i: number) => {
  a.line = i; a.nextAt = Infinity;
  const text = a.lines[i];
  if (i === a.fireAt) { holdFireworks(false); fireworksVolley(); }
  let over = false;
  const done = () => { if (over) return; over = true; a.said = null; a.gap = true; };
  const shown = say(text, PA_VOICE, i === 0 ? 'urgent' : 'queue', {
    always: true,
    onShow: spoken => { if (!a.done) a.said = text; if (!spoken) setTimeout(done, Math.max(2200, text.length * 75)); },
    onHide: done, onDropped: done,
  });
  if (!shown) { a.said = text; setTimeout(done, Math.max(2200, text.length * 75)); }
};

/** A frame of it: him out of it the whole time. */
export const tickAnnouncement = (state: GameState, a: Announce) => {
  if (a.done) return;
  a.t++;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0;
  offerSkip();
  if (takeSkip() && a.t > 10) {
    cutVoice('m2.pa');
    if (a.fireAt >= 0 && a.line < a.fireAt) fireworksVolley();
    finish(a);
    return;
  }
  // (a line at a time, a breath between: no talking over)
  if (a.gap) { a.gap = false; a.nextAt = a.t + 22; }
  if (a.t >= a.nextAt && (a.line >= 0 || voicesLoaded() || a.t > 600)) {
    if (a.line + 1 < a.lines.length) sayLine(a, a.line + 1);
    else finish(a);
  }
};

const wrap = (c: Ctx, text: string, maxW: number) => {
  const words = text.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const next = cur ? `${cur} ${w}` : w; if (c.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next; }
  if (cur) lines.push(cur);
  return lines;
};

/** The PA's words (screen space, only while said): a bubble across the top, a little PA horn on its corner; SKIP. */
export const drawAnnouncement = (c: Ctx, a: Announce) => {
  if (a.done) return;
  if (a.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  if (!a.said) return;
  c.save();
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const rows = wrap(c, a.said, 560);
  const lh = 14, w = Math.max(...rows.map(r => c.measureText(r).width)) + 64, h = rows.length * lh + 18;
  const L = Math.round(CANVAS_WIDTH / 2 - w / 2), T = 104;
  c.fillStyle = '#111827'; c.fillRect(L - 2, T - 2, w + 4, h + 4);
  c.fillStyle = '#F8FAFC'; c.fillRect(L, T, w, h);
  c.fillStyle = '#CBD5E1'; c.fillRect(L, T + h - 3, w, 3);
  // (its tail up to the PA horns on the lamp posts, off the top)
  c.fillStyle = '#111827'; c.beginPath(); c.moveTo(L + 30, T - 1); c.lineTo(L + 44, T - 1); c.lineTo(L + 30, T - 14); c.closePath(); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(L + 32, T + 1); c.lineTo(L + 41, T + 1); c.lineTo(L + 32, T - 10); c.closePath(); c.fill();
  // (the horn: a stepped bell, its throat, a strap)
  const hx = L + 12, hy = T + 8;
  c.fillStyle = '#111827'; c.fillRect(hx - 1, hy - 1, 18, 14);
  c.fillStyle = '#9CA3AF'; c.fillRect(hx, hy + 3, 6, 6); c.fillStyle = '#D1D5DB'; c.fillRect(hx + 6, hy, 10, 12); c.fillStyle = '#F3F4F6'; c.fillRect(hx + 7, hy + 1, 3, 10);
  c.fillStyle = '#374151'; c.fillRect(hx + 12, hy + 3, 3, 6);
  c.fillStyle = '#111827';
  rows.forEach((r, i) => c.fillText(r, CANVAS_WIDTH / 2 + 12, T + 16 + i * lh));
  c.restore();
};
