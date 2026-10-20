// The queue for TRUELLING TRAGONS (the glen's end): three new beefy suitors, the rivals through the ride and the
// broomsticks (job 4 and job 6 can draw them from RIVALS), stood in the queue's rails. He comes up on them and they
// have their say at him one at a time (the user's: never over each other), he answers, Piper calls trial two over the
// ride's PA horn, and they turn and go in through the ride's door ahead of him. Not a cutscene: he's his own man the
// whole time (no input taken). Shots bounce off them (it's the ride's job to settle them). Gone in for good once
// they've gone (RIVALS_MEMO).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { piperMust } from '../piperLines';
import { speak, meatheadSays, byPants, saidOver } from '../section';
import { PIPER_PA_VOICE } from '../talk';
import { drawSuitor, SUITOR_H, type SuitorLook } from '../suitors';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY } from '../geometry';
import { glenOf, RIVALS_MEMO, type Glen } from './state';
import { QUEUE, X } from './layout';
import { GLEN_VOICES, RIVAL_SAY, RIVAL_BOUNCE, RETORT, PIPER_GLEN } from './lines';
import type { Ctx } from '../kit';

/** The three: BLAKE (a muscle tee, blond, a jaw), RAFAEL (a gym prince, a sash), HANK (a big knight cosplayer, a gut). */
export const RIVALS: { id: 'blake' | 'rafael' | 'hank'; look: SuitorLook }[] = [
  { id: 'blake', look: { name: 'BLAKE', skin: ['#FFE0CC', '#F2BFA0', '#C88E70'], hair: '#E8D090', kit: 'tee', main: '#1E8A4A', trim: '#E4E4E7', voice: GLEN_VOICES.blake, gut: 0 } },
  { id: 'rafael', look: { name: 'RAFAEL', skin: ['#E8A070', '#C47A48', '#8E5230'], hair: '#140A06', kit: 'prince', main: '#7A3AAA', trim: '#F6D365', voice: GLEN_VOICES.rafael, gut: 0.1 } },
  { id: 'hank', look: { name: 'HANK', skin: ['#6A4026', '#4A2A16', '#2E180A'], hair: '#140A06', kit: 'knight', main: '#B91C1C', trim: '#E4E4E7', voice: GLEN_VOICES.hank, gut: 0.6 } },
];

/** The ride's PA (in over its door: Piper calls trial two from it). */
export const RIDE_HORN = () => X(QUEUE.door) + 10;

export const buildRivals = (state: GameState) => {
  const g = glenOf(state);
  if (state.stageMemo[RIVALS_MEMO]) { g.queue = 'done'; g.rivals = []; return; }
  g.queue = 'wait';
  g.rivals = QUEUE.spots.map(x => ({ x: X(x), face: -1 as const, said: null, walk: false, gone: false }));
};

/** Piper over a PA horn (the glen's, or the ride's). */
export const piperSays = (g: Glen, line: string | null, state: GameState, hornX: number, onDone?: () => void) => {
  if (!line) { onDone?.(); return; }
  g.piperAt = state.frame; g.piperX = hornX;
  speak(PIPER_PA_VOICE, line, s => { g.piper = s; }, true, onDone);
};

export const updateRivals = (ctx: FrameContext) => {
  const { state } = ctx, g = glenOf(state), p = state.player;
  const rx = p.pos.x + p.width / 2 - X(0);
  if (g.queue === 'wait' && rx > QUEUE.trigger && p.health > 0 && !p.inCutscene) {
    g.queue = 'talk';
    // (each in turn, never over each other: his, the next one's, then Meathead's, then Piper's)
    const say = (i: number) => {
      if (g.queue !== 'talk') return;
      if (i < RIVALS.length) {
        const r = RIVALS[i], R = g.rivals[i];
        speak(r.look.voice, pickLine(byPants(state, RIVAL_SAY[r.id])), s => { R.said = s; }, true, () => say(i + 1));
        return;
      }
      if (i === RIVALS.length) { meatheadSays(state, pickLine(byPants(state, RETORT)), true, () => say(i + 1)); return; }
      piperSays(g, piperMust(PIPER_GLEN.queue), state, RIDE_HORN(), () => { if (g.queue === 'talk') { g.queue = 'in'; g.queueT = 0; } });
    };
    say(0);
  }
  if (g.queue === 'in') {
    // (they turn and go in through the ride's door, one after the other)
    g.queueT++;
    g.rivals.forEach((R, i) => {
      if (R.gone || g.queueT < i * 24) return;
      R.walk = true; R.face = 1; R.x += 1.8;
      if (R.x > X(QUEUE.door) + 30) R.gone = true;
    });
    if (g.rivals.every(R => R.gone)) { g.queue = 'done'; state.stageMemo[RIVALS_MEMO] = '1'; }
  }
  // Shot at: it bounces off them
  if (g.rivals.some(R => !R.gone)) {
    state.projectiles = state.projectiles.filter(q => {
      if (q.owner !== 'player') return true;
      const qx = q.pos.x + (q.width ?? 0) / 2, qy = q.pos.y + (q.height ?? 0) / 2;
      const i = g.rivals.findIndex(R => !R.gone && Math.abs(qx - R.x) < 24 && qy > GY - SUITOR_H && qy < GY);
      if (i < 0) return true;
      playSound('clink', 0.7, 6);
      for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: qx, y: qy }, vel: { x: -Math.sign(q.vel.x || 1) * (1 + Math.random() * 3), y: -1 - Math.random() * 3 }, life: 16, color: k % 2 ? '#FEF08A' : '#FFFFFF', size: 2 });
      // (the once: one of them laughs it off, not while they're having their say)
      if (!g.said.bounce1 && g.queue !== 'talk') {
        g.said.bounce1 = true;
        const R = g.rivals[i], id = RIVALS[i].id;
        speak(RIVALS[i].look.voice, id === 'blake' ? RIVAL_BOUNCE[0] : id === 'hank' ? RIVAL_BOUNCE[1] : RIVAL_BOUNCE[Math.floor(Math.random() * 2)], s => { R.said = s; }, false);
      }
      return false;
    });
  }
};

/** In the queue's rails (behind him); clipped at the ride's door as they go in. */
export const drawRivals = (c: Ctx, state: GameState) => {
  const g = glenOf(state), f = state.frame;
  if (!g.rivals.some(R => !R.gone)) return;
  if (X(QUEUE.a) > state.camera.x + CANVAS_WIDTH + 100 || X(QUEUE.b) < state.camera.x - 100) return;
  c.save();
  c.beginPath(); c.rect(state.camera.x - 200, -4000, X(QUEUE.door) + 12 - (state.camera.x - 200), 8000); c.clip();
  g.rivals.forEach((R, i) => {
    if (R.gone) return;
    const bob = R.walk ? (Math.floor((f + i * 7) / 8) % 2) : 0;
    drawSuitor(c, R.x, GY - bob, R.face, f + i * 13, RIVALS[i].look, R.said ? 'talk' : R.walk ? 'stand' : i === 2 ? 'flex' : 'stand', { talking: !!R.said });
  });
  c.restore();
};
/** What they're saying, over their heads (in front of everything). */
export const drawRivalsFront = (c: Ctx, state: GameState) => {
  for (const R of glenOf(state).rivals) if (R.said && !R.gone) saidOver(c, R.said.text, R.x, GY - SUITOR_H - 14, '#FDE68A', 220);
};
