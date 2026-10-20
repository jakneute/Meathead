// THE SHOW: STUPID DAD LIVE!, playing on a loop till Meathead walks on (the user's: "a sad pathetic playback of him
// interacting with his tv family - who are cheap animatronics - as he sits on the couch and asks his kid to get him
// another beer so he can watch the football game ... he drinks actual beer during performances").
//
// A cycle (about 25 s): he watches the game (a swig now and then); he calls for the Boy ("BOY! GET ME ANOTHER BEER!");
// the laugh track; the Boy rolls jerkily off along his floor track to the kitchen door, a clatter, back with a can; his
// arm comes out in steps and the tape plays ("SURE THING, POP!"); STUPID DAD takes it, cracks it, drinks (a real
// swig, a belch now and then); then one more bit: a family member's tape and the laugh track, him at the TV (the
// football's the same tape every show), or him off script, mumbling about the dead cast to nobody (no laugh). Only once
// Meathead's down in the bowl does it run its lines (it's a PA: from the concourse it's the swigs, no words).
// The intro freezes it (the tape stopped, the laugh track cut; the family keeps going, wrong).
//
// stageLook(state): what everybody on the stage is doing this frame (art.ts draws it).

import type { GameState } from '../../../m1/game/core/state';
import { pickLine, pickFreshLine } from '../../../m1/game/platform/speech';
import { playSound, stopSound } from '../../../m1/game/platform/audio';
import { speak } from '../section';
import { isLandCleared } from '../../store';
import type { Amphi, Speaker, DadPose } from './state';
import type { DadFace } from './dad';
import type { Anim } from './family';
import { VOICES, SHOW_CALL, SHOW_TAKE, SHOW_ADLIB, SHOW_TV, MOM_TAPE, BOY_TAPE, SIS_TAPE, GRAMPS_TAPE } from './lines';
import { DAD_SEAT, DAD_FRONT } from './layout';

/** Frames he watches the game between calls; the laugh track's length; the Boy's step (every 8 frames). */
const WATCH_T = 420, LAUGH_T = 110, BOY_STEP = 0.05;

/** Somebody on stage says something (waits its turn; the words over them while it's said); `onDone` only if the show
 *  hasn't moved on (a token). */
export const stageSays = (s: Amphi, who: Speaker, text: string, onDone?: () => void) => {
  const tok = s.show.token;
  speak(VOICES[who], text, said => { if (said) s.said.set(who, said); else if (s.said.get(who)?.text === text) s.said.delete(who); }, true, () => { if (tok === s.show.token) onDone?.(); });
};
/** The laugh track (canned, too loud, too long); the APPLAUSE sign lit while it runs. */
let laughUntil = 0;
export const laughTrack = (state: GameState, vol = 1) => { playSound('laughtrack', vol); laughUntil = state.frame + LAUGH_T; };
export const cutLaughTrack = (state: GameState) => { stopSound('laughtrack'); laughUntil = state.frame; };
export const laughing = (state: GameState) => state.frame < laughUntil;

const say = (s: Amphi, who: Speaker, pool: readonly string[], then: () => void) => {
  s.show.waiting = true;
  if (who !== 'dad') s.show.tape = who;
  stageSays(s, who, pickLine(pool), () => { s.show.waiting = false; s.show.tape = null; then(); });
};
const go = (s: Amphi, phase: Amphi['show']['phase']) => { s.show.phase = phase; s.show.t = 0; };
const pose = (s: Amphi, p: DadPose) => { if (s.show.dad !== p) { s.show.dad = p; s.show.dadT = 0; } };

/** The show's frame. `near`: he's down in the bowl (its lines play); `quiet`: a scene's on (no new lines start: the
 *  show holds where it is till it's over); `onCall`: the first "BOY! BEER!" (his gag). */
export const updateShow = (state: GameState, s: Amphi, near: boolean, quiet: boolean, onCall: () => void) => {
  const sh = s.show;
  sh.dadT++;
  if (sh.phase === 'frozen') return;
  if (sh.waiting) return;
  sh.t++;
  const t = sh.t;
  switch (sh.phase) {
    case 'watch': {
      // (a swig now and then; the can goes empty)
      const k = t % 260;
      if (k === 120) { pose(s, 'sip'); playSound('glug', 0.35, -4); }
      if (k === 190) { pose(s, 'sit'); if (t > 400) sh.canFull = false; }
      if (near && !quiet && t > WATCH_T && sh.dad === 'sit') {
        go(s, 'call'); pose(s, 'call'); onCall();
        say(s, 'dad', SHOW_CALL, () => { pose(s, 'sit'); laughTrack(state); go(s, 'laugh'); });
      }
      break;
    }
    case 'laugh': if (t > LAUGH_T - 20) go(s, 'fetch'); break;
    case 'fetch':
      if (t % 8 === 0) sh.boyU = Math.min(1, sh.boyU + BOY_STEP);
      if (sh.boyU >= 1) go(s, 'kitchen');
      break;
    case 'kitchen':
      if (t === 18) playSound('clink', 0.5, -3);
      if (t === 30) playSound('clink', 0.4, 2);
      if (t >= 56) { sh.boyBeer = true; go(s, 'back'); }
      break;
    case 'back':
      if (t % 8 === 0) sh.boyU = Math.max(0, sh.boyU - BOY_STEP);
      if (sh.boyU <= 0) go(s, 'hand');
      break;
    case 'hand':
      if (t % 8 === 0) sh.boyArm = Math.min(1, sh.boyArm + 0.25);
      if (t === 32) { if (quiet) { sh.t--; break; } say(s, 'boy', BOY_TAPE, () => { go(s, 'take'); pose(s, 'reach'); }); }
      break;
    case 'take':
      if (t === 22) { sh.boyBeer = false; sh.canFull = true; playSound('canopen', 0.8); }
      if (t > 22 && t % 8 === 0) sh.boyArm = Math.max(0, sh.boyArm - 0.25);
      if (t === 30) { go(s, 'drink'); pose(s, 'sip'); playSound('glug', 0.5, -4); }
      break;
    case 'drink':
      if (t === 40) playSound('glug', 0.45, -6);
      if (t === 80) {
        pose(s, 'sit');
        if (Math.random() < 0.45) playSound('burp', 0.7, -2);
        go(s, 'tag');
      }
      break;
    case 'tag': {
      if (t < 30) break;
      if (quiet) { sh.t--; break; }
      const back =() => { pose(s, 'sit'); go(s, 'watch'); };
      const r = Math.random();
      if (r < 0.32) {
        const adlib = pickFreshLine(SHOW_ADLIB);
        if (adlib) { sh.waiting = true; stageSays(s, 'dad', adlib, () => { sh.waiting = false; back(); }); break; }
      }
      if (r < 0.58) { pose(s, 'tv'); say(s, 'dad', SHOW_TV, () => { laughTrack(state, 0.8); back(); }); break; }
      const who: Speaker = (['mom', 'sis', 'gramps'] as const)[Math.floor(Math.random() * 3)];
      const pool = who === 'mom' ? MOM_TAPE : who === 'sis' ? SIS_TAPE : GRAMPS_TAPE;
      // (a tag line of the dad's straight after it, now and then: ATTABOY to nobody)
      say(s, who, pool, () => { laughTrack(state); if (Math.random() < 0.3) { const l = pickFreshLine(SHOW_TAKE); if (l) { sh.waiting = true; stageSays(s, 'dad', l, () => { sh.waiting = false; back(); }); return; } } back(); });
      break;
    }
    default: break;
  }
};

/** The intro stops it: the tape stops, the laugh track's cut, the TV rolls; the family's left going, wrong. */
export const freezeShow = (state: GameState, s: Amphi) => {
  s.show.token++; s.show.waiting = false; s.show.tape = null;
  s.show.phase = 'frozen'; s.show.dad = 'sit';
  cutLaughTrack(state);
  playSound('tapestop', 0.9);
};

// ---------------------------------------------------------------------------------------------------------------
// What everybody on the stage is doing this frame

export interface DadLook { pose: DadPose; t: number; x: number; d: number; face?: DadFace; talking: boolean; can: 'near' | 'far' | null; canFull: boolean; crushed: number; facing: -1 | 1 }
export interface StageLook {
  dad: DadLook | null;
  mom: Anim; sis: Anim; gramps: Anim; boy: Anim & { u: number; beer: boolean; arm: number };
  /** The TV: the game (the same tape), rolling (the show stopped), off. */
  tv: 'game' | 'roll' | 'off';
  applause: boolean;
  /** The crowd's still in its seats. */
  crowd: boolean;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const stageLook = (state: GameState, s: Amphi): StageLook => {
  const f = state.frame, sh = s.show, intro = s.intro;
  const over = isLandCleared('cartoon') || !!intro?.emptied;
  const glitch = intro && !over ? (intro.step === 'walk' ? 0.4 : 1) : 0;
  const mode: Anim['mode'] = over ? 'off' : glitch >= 0.4 ? 'glitch' : 'run';
  const anim = (who: Speaker, seedF = 0): Anim => ({ mode: mode === 'glitch' && who === 'sis' && glitch < 1 ? 'run' : mode, f: f + seedF, talking: s.said.has(who) });
  let dad: DadLook | null = null;
  if (!over) {
    const talking = s.said.has('dad');
    if (intro) {
      const u = intro.dadU;
      const x = lerp(DAD_SEAT.x, DAD_FRONT, u), d = lerp(DAD_SEAT.d, 1, u);
      let p: DadPose = 'squint', t = 0;
      switch (intro.step) {
        case 'walk': p = 'sit'; break;
        case 'notice': case 'close': case 'sees': case 'glitch': p = 'squint'; break;
        case 'rise': p = 'rise'; t = Math.min(1, intro.t / 100); break;
        case 'crush': p = 'crush'; t = Math.min(1, intro.t / 50); break;
        default: p = u < 1 ? 'shuffle' : 'stand';
      }
      dad = { pose: p, t, x: p === 'rise' || p === 'squint' || p === 'sit' ? DAD_SEAT.x : x, d: p === 'rise' || p === 'squint' || p === 'sit' ? DAD_SEAT.d : d, talking, can: intro.crushed && intro.step !== 'crush' ? null : 'near', canFull: false, crushed: intro.step === 'crush' ? Math.max(0, (intro.t - 18) / 14) : 0, facing: -1 };
    } else {
      const p = sh.dad;
      dad = { pose: p, t: Math.min(1, sh.dadT / 22), x: DAD_SEAT.x, d: DAD_SEAT.d, talking, can: 'near', canFull: sh.canFull, crushed: 0, facing: -1 };
      if (p === 'call' && !talking) dad.face = 'bleary';
    }
  }
  return {
    dad,
    mom: anim('mom', 11), sis: anim('sis', 37), gramps: anim('gramps', 71),
    boy: { ...anim('boy', 5), u: sh.boyU, beer: sh.boyBeer, arm: sh.boyArm },
    tv: over ? 'off' : intro ? 'roll' : 'game',
    applause: !over && !intro && laughing(state),
    crowd: !isLandCleared('cartoon'),
  };
};
