// The bikers' bar, if he walks in having shit himself (or does it in there): a cutscene kill. His controls go the
// moment it starts. The room goes quiet, somebody says what they're all thinking, Meathead has a word on it, and Dan
// calls it: take out the trash. Three of them pick him up over their heads and carry him into the HOGS, stuff him
// head first into the toilet and hold him there kicking, and flush; and they stuff him so hard he goes down with it.
// The last of it's a cutaway of the pipes under the bar: what's left of him going by in the brown water, in chunks,
// his head still paddling. Then the death screen's callout.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import type { Controls } from '../../platform/input';
import { NO_CONTROLS } from '../../platform/input';
import { playSound } from '../../platform/audio';
import { shakeScreen } from '../../core/state';
import { killPlayer } from '../../player/player';
import { GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import type { Bar } from './bar';
import { Talk, queueLines, quiet, hush } from './script';

const Y = GROUND_Y;

export type SwirlyPhase = 'react' | 'grab' | 'carry' | 'stuff' | 'flush' | 'pipes';
export interface Swirly {
  phase: SwirlyPhase;
  t: number;
  /** Which of the bar's bikers do the carrying (their index in Bar.bikers), and where each of them is. */
  carriers: number[];
  x: number[];
  /** Where he is, carried (his middle), and how far he's gone down the bowl (0..1). */
  mx: number;
  down: number;
}

/** The toilet: in the middle of the bathroom, its bowl's rim this high off the floor. */
export const toiletX = () => COURSE.bar.bathroom.x1 + 80;
export const TOILET_RIM = 26;

/** How long the stuffing and the flush take, and the pipes after (frames). */
const STUFF_FRAMES = 150, FLUSH_FRAMES = 60;
export const PIPES_FRAMES = 300;

/** What the death screen says (read out at the end of it). */
const SWIRLY_DEATHS = [
  'TAKEN OUT WITH THE TRASH',
  'FLUSHED LIKE THE TURD YOU ARE',
  "DON'T SHIT YOURSELF IN A BIKER BAR",
  'TWO FLUSHES. MAYBE THREE.',
];

/** He's walked in like that, or done it in there: it starts (`onSpot`: he's just done it, so his line waits a moment). */
export const startSwirly = (ctx: FrameContext, b: Bar, talk: Talk, onSpot: boolean) => {
  const { state } = ctx;
  const p = state.player;
  hush(state, talk);
  p.inCutscene = true;
  p.vel.x = 0;
  // The three nearest of them that are up and about (not the band, not the one passed out in the booth)
  const px = p.pos.x + p.width / 2;
  const able = b.bikers.map((k, i) => ({ k, i })).filter(({ k }) => k.look !== 'band' && k.look !== 'booth');
  able.sort((a, c) => Math.abs(a.k.x - px) - Math.abs(c.k.x - px));
  const carriers = able.slice(0, 3).map(({ i }) => i);
  b.swirly = { phase: 'react', t: 0, carriers, x: carriers.map(i => b.bikers[i].x), mx: px, down: 0 };
  // (walked in like that: they smell him coming through the door; did it in here: they all heard it)
  queueLines(state, talk, onSpot ? [
    { who: 'biker', text: 'DID HE JUST... IN HERE? IN FRONT OF EVERYBODY?' },
    { who: 'dan', text: 'SOMEBODY JUST SHIT THEMSELF IN MY BAR.' },
    { who: 'meathead', text: "...THAT ONE'S ON ME." },
    { who: 'dan', text: "THAT'S A NEW LOW. EVEN FOR THIS PLACE. BOYS? TAKE OUT THE TRASH." },
  ] : [
    { who: 'biker', text: 'WHOA. WHOA. WHAT IS THAT SMELL?' },
    { who: 'dan', text: 'DID YOU WALK IN HERE LIKE THAT? INTO MY BAR?' },
    { who: 'meathead', text: '...I CAN EXPLAIN.' },
    { who: 'dan', text: 'THIS IS A CLEAN ESTABLISHMENT. BOYS? TAKE OUT THE TRASH.' },
  ], onSpot ? 150 : 20);
};

/** Each frame of it, until the flush: his controls are gone the whole way. */
export const updateSwirly = (ctx: FrameContext, b: Bar, talk: Talk): Controls => {
  const { state } = ctx;
  const p = state.player;
  const s = b.swirly!;
  s.t++;
  p.inCutscene = true;
  p.invincibilityTimer = Math.max(p.invincibilityTimer, 2);
  p.vel.x = 0;
  const tx = toiletX();
  switch (s.phase) {
    case 'react':
      if (s.t > 30 && quiet(talk)) { s.phase = 'grab'; s.t = 0; }
      break;
    case 'grab': {
      // They close in round him, from both sides
      let there = 0;
      s.carriers.forEach((_, k) => {
        const want = s.mx + (k - 1) * 26;
        s.x[k] += Math.sign(want - s.x[k]) * Math.min(6, Math.abs(want - s.x[k]));
        if (Math.abs(want - s.x[k]) < 2) there++;
      });
      if (there === s.carriers.length) {
        s.phase = 'carry'; s.t = 0;
        p.hidden = true;
        playSound('thud', 0.7, -3);
        queueLines(state, talk, [{ who: 'meathead', text: "HEY! PUT ME DOWN! I'M NOT DONE!" }, { who: 'biker', text: 'TO THE HOGS!' }]);
      }
      break;
    }
    case 'carry': {
      // Over their heads, head first, into the bathroom
      const step = Math.sign(tx - s.mx) * Math.min(4, Math.abs(tx - s.mx));
      s.mx += step;
      s.carriers.forEach((_, k) => { s.x[k] = s.mx + (k - 1) * 26; });
      p.pos.x = s.mx - p.width / 2;
      if (Math.abs(tx - s.mx) < 1 && s.t > 20) { s.phase = 'stuff'; s.t = 0; queueLines(state, talk, [{ who: 'dan', text: "AND WHAT DO WE DO WITH A TURD, BOYS?" }, { who: 'biker', text: 'FLUSH IT!' }]); }
      break;
    }
    case 'stuff':
      // Head first into the bowl, held down by the three of them, his legs kicking; it splashes
      s.carriers.forEach((_, k) => { s.x[k] = tx + [-40, 38, -68][k] + Math.sin(s.t * 0.4 + k) * 2; });
      if (s.t % 14 === 0) { playSound('splash', 0.5, -2 + Math.random() * 4); for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: tx + (Math.random() - 0.5) * 20, y: Y - TOILET_RIM }, vel: { x: (Math.random() - 0.5) * 4, y: -2 - Math.random() * 3 }, life: 30, color: 'rgba(186, 230, 253, 0.8)', size: 3 }); }
      if (s.t % 30 === 0) shakeScreen(state, 6, 3);
      if (s.t >= STUFF_FRAMES && quiet(talk)) { s.phase = 'flush'; s.t = 0; playSound('glug', 1, -6); playSound('whoosh', 0.8, -8); }
      break;
    case 'flush':
      // The handle, the roar of it, and him going down with it: smaller and smaller, round and round, gone
      s.down = Math.min(1, s.t / FLUSH_FRAMES);
      if (s.t % 10 === 0) playSound('glug', 0.6, -4 - s.t / 10);
      if (s.t >= FLUSH_FRAMES) {
        s.phase = 'pipes'; s.t = 0;
        state.deathScene = { t: 0, len: PIPES_FRAMES, voiced: false };
        killPlayer(ctx, SWIRLY_DEATHS[Math.floor(Math.random() * SWIRLY_DEATHS.length)], false);
      }
      break;
  }
  return { ...NO_CONTROLS };
};

/** The pipes, under the death scene: gurgling as what's left of him goes by. */
export const tickSwirlyPipes = (t: number) => {
  if (t % 40 === 1) playSound('glug', 0.45, -8 + Math.random() * 4);
  if (t === 150) playSound('splat', 0.4, -10);
};

/** He's down there in bits, in the pipes, for the death scene (not his sprite: see drawSwirlyPipes). */
export const inPipes = (state: GameState, b: Bar) => b.swirly?.phase === 'pipes' && !!state.deathScene;
