// The recorded voices: every line in the game, said by its own character (made ahead of time with a speech model,
// offline: see tools/voices), packed into one file that comes in with the game. A line that's been recorded plays
// from here; one that hasn't is only shown, never said (speech.ts).
//
// The pack: a little header (where each clip is, and how each voice is played back: a touch faster or slower,
// louder or quieter, through a radio, a respirator...), then the clips end to end (Ogg Opus). A clip's decoded when
// it's first wanted; the last few dozen are kept.

import { mixOut } from './mixer';
import { getAudioContext } from './audio';

interface VoiceSpec { rate: number; gain: number; fx: string }
/** A clip: where it is in the file, how long, and (a line of more than one sentence) when each sentence after the first starts, in seconds. */
interface Pack { buf: ArrayBuffer; base: number; clips: Record<string, [number, number, number[]?]>; voices: Record<string, VoiceSpec> }

let pack: Pack | null = null;
const keyOf = (voice: string, text: string) => `${voice}|${text.trim()}`;

/** Loads the pack (from its URL: in the release, it's inside the page). */
export const loadVoicePack = async (url: string) => {
  try {
    const buf = await (await fetch(url)).arrayBuffer();
    const n = new DataView(buf).getUint32(0, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n)));
    pack = { buf, base: 4 + n, clips: header.clips, voices: header.voices };
    // (the announcer's clips, decoded now, a few at a time, so none of them has to wait later)
    const keys = Object.keys(pack.clips).filter(k => KEEP_READY.some(v => k.startsWith(`${v}|`)));
    const warm = async () => {
      let ctx: AudioContext;
      try { ctx = getAudioContext(); } catch { return; }
      for (const k of keys) { if (!ready.has(k)) { try { await decode(ctx, k); } catch { /* skip it */ } await new Promise(r => setTimeout(r, 15)); } }
    };
    setTimeout(warm, 1500);
  } catch (err) {
    console.warn('voices: no pack', err);
  }
};

export const voicesLoaded = () => !!pack;
export const hasClip = (voice: string, text: string) => !!pack?.clips[keyOf(voice, text)];
/** When each sentence after the first starts in a recorded line, in ms as it's played (empty for one sentence). */
export const sentenceTimes = (voice: string, text: string): number[] => {
  const starts = pack?.clips[keyOf(voice, text)]?.[2];
  const rate = pack?.voices[voice]?.rate ?? 1;
  return starts ? starts.map(s => (s / rate) * 1000) : [];
};

// ---- decoding, and a small cache of what's been decoded
const decoded = new Map<string, AudioBuffer>();
const CACHE = 48;
/** Voices whose every clip is decoded ahead of time and kept (the announcer: his call has to land the moment the
 * words go up, with no wait for decoding). */
const KEEP_READY = ['announcer'];
const ready = new Map<string, AudioBuffer>();
const decode = async (ctx: AudioContext, key: string): Promise<AudioBuffer | null> => {
  const r = ready.get(key);
  if (r) return r;
  const have = decoded.get(key);
  if (have) { decoded.delete(key); decoded.set(key, have); return have; }
  const at = pack?.clips[key];
  if (!pack || !at) return null;
  const bytes = pack.buf.slice(pack.base + at[0], pack.base + at[0] + at[1]);
  const audio = await ctx.decodeAudioData(bytes);
  if (KEEP_READY.some(v => key.startsWith(`${v}|`))) { ready.set(key, audio); return audio; }
  decoded.set(key, audio);
  while (decoded.size > CACHE) decoded.delete(decoded.keys().next().value!);
  return audio;
};

// ---- where voices play: their own bus (evened out a little), into the speakers
let bus: { ctx: AudioContext; input: GainNode } | null = null;
const busFor = (ctx: AudioContext) => {
  if (bus && bus.ctx === ctx) return bus.input;
  const input = ctx.createGain(); input.gain.value = 1;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.15;
  const make = ctx.createGain(); make.gain.value = 1.25;
  input.connect(comp); comp.connect(make); make.connect(mixOut(ctx, 'voice'));
  bus = { ctx, input };
  return input;
};

/** A big dark hall's reverb (made once): noise dying away over a few seconds, the top end going first. */
let hall: { ctx: AudioContext; buf: AudioBuffer } | null = null;
const hallFor = (ctx: AudioContext) => {
  if (hall && hall.ctx === ctx) return hall.buf;
  const len = Math.floor(ctx.sampleRate * 3.2);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const k = i / len;
      const a = 0.08 + 0.6 * k;                       // (smoother, darker, as it dies)
      lp += a * ((Math.random() * 2 - 1) - lp);
      d[i] = lp * Math.pow(1 - k, 2.4) * (i < ctx.sampleRate * 0.02 ? i / (ctx.sampleRate * 0.02) : 1);
    }
  }
  hall = { ctx, buf };
  return buf;
};

/** How a voice sounds on its way out: through a radio, a respirator, gargled, or just as it is. */
const fxChain = (ctx: AudioContext, fx: string, out: AudioNode): AudioNode => {
  if (fx === 'radio') {
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 420;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
    const drive = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(2.6 * x) * 0.9; }
    drive.curve = curve;
    const g = ctx.createGain(); g.gain.value = 1.2;
    hp.connect(lp); lp.connect(drive); drive.connect(g); g.connect(out);
    return hp;
  }
  if (fx === 'announcer') {
    // The arena announcer: a touch of grit, and a big hall throwing it back
    const drive = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(1.8 * x) / Math.tanh(1.8); }
    drive.curve = curve;
    const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 200; low.gain.value = 5;
    drive.connect(low); low.connect(out);
    for (const [at, level] of [[0.11, 0.35], [0.23, 0.22], [0.37, 0.12]] as const) {
      const d = ctx.createDelay(1); d.delayTime.value = at;
      const g = ctx.createGain(); g.gain.value = level;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
      low.connect(d); d.connect(lp); lp.connect(g); g.connect(out);
    }
    return drive;
  }
  if (fx === 'doom') {
    // The voice of death: deep, and a vast dark hall answering back (a long reverb and a slow echo)
    const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 180; low.gain.value = 8;
    const top = ctx.createBiquadFilter(); top.type = 'lowpass'; top.frequency.value = 4200;
    const drive = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; curve[i] = Math.tanh(1.4 * x) / Math.tanh(1.4); }
    drive.curve = curve;
    low.connect(top); top.connect(drive); drive.connect(out);
    const hall = ctx.createConvolver(); hall.buffer = hallFor(ctx);
    const wet = ctx.createGain(); wet.gain.value = 0.55;
    drive.connect(hall); hall.connect(wet); wet.connect(out);
    const echo = ctx.createDelay(2); echo.delayTime.value = 0.42;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dark = ctx.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 1500;
    const eg = ctx.createGain(); eg.gain.value = 0.45;
    drive.connect(echo); echo.connect(dark); dark.connect(fb); fb.connect(echo); dark.connect(eg); eg.connect(out);
    return low;
  }
  if (fx === 'radio_mild') {
    // A handheld radio, quietly: just the phone band, no crunch
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 320;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400;
    const g = ctx.createGain(); g.gain.value = 1.3;
    hp.connect(lp); lp.connect(g); g.connect(out);
    return hp;
  }
  if (fx === 'mask') {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.6;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    const g = ctx.createGain(); g.gain.value = 1.8;
    bp.connect(lp); lp.connect(g); g.connect(out);
    return bp;
  }
  if (fx === 'wet') {
    // Gargling it: a low wobble in the level and the top end dulled
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800;
    const trem = ctx.createGain(); trem.gain.value = 0.85;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 14;
    const depth = ctx.createGain(); depth.gain.value = 0.15;
    lfo.connect(depth); depth.connect(trem.gain); lfo.start();
    lp.connect(trem); trem.connect(out);
    setTimeout(() => { try { lfo.stop(); } catch { /* fine */ } }, 20000);
    return lp;
  }
  if (fx === 'chorus') {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
    lp.connect(out);
    return lp;
  }
  return out;
};

export interface ClipHandle { stop: () => void }

/** What's playing right now, and the speed each is meant to go at (so they can all be held, and let go again). */
const live = new Map<AudioBufferSourceNode, number>();
let held = false;
/**
 * Every recorded line playing is held where it is (the game's paused), or let go to carry on from there. Done by
 * the playback speed: a held line just doesn't move (its echoes ring out); the sound effects and the menus aren't
 * touched.
 */
export const holdVoices = (on: boolean) => {
  if (held === on) return;
  held = on;
  for (const [src, rate] of live) { try { src.playbackRate.value = on ? 0 : rate; } catch { /* fine */ } }
};
export const voicesHeld = () => held;

/**
 * Plays a recorded line (null if there isn't one). `onStart` when it's actually going (with how long it is, in ms),
 * `onEnd` when it's done or stopped. `radio`: through a radio whatever the voice is.
 */
export const playClip = (voice: string, text: string, opts: { radio?: boolean; onStart?: (ms: number) => void; onEnd?: () => void } = {}): ClipHandle | null => {
  if (!pack) return null;
  const key = keyOf(voice, text);
  if (!pack.clips[key]) return null;
  let ctx: AudioContext;
  try { ctx = getAudioContext(); } catch { return null; }
  const spec = pack.voices[voice] ?? { rate: 1, gain: 1, fx: '' };
  let stopped = false, src: AudioBufferSourceNode | null = null, post: GainNode | null = null, ended = false;
  const end = () => { if (ended) return; ended = true; opts.onEnd?.(); };
  decode(ctx, key).then(audio => {
    if (stopped || !audio) { end(); return; }
    src = ctx.createBufferSource();
    src.buffer = audio;
    src.playbackRate.value = held ? 0 : spec.rate;
    live.set(src, spec.rate);
    const g = ctx.createGain(); g.gain.value = spec.gain;
    post = ctx.createGain(); post.connect(busFor(ctx));
    src.connect(g);
    g.connect(fxChain(ctx, opts.radio ? 'radio' : spec.fx, post));
    const me = src;
    src.onended = () => { live.delete(me); try { g.disconnect(); } catch { /* fine */ } end(); };
    src.start();
    // (a count of what's been said from the recordings, for checking: `window.__voicesPlayed`)
    const w = window as unknown as { __voicesPlayed?: string[] };
    (w.__voicesPlayed ??= []).push(`${voice}: ${text.slice(0, 40)} (${(audio.duration / spec.rate).toFixed(1)}s @${Math.round(performance.now())})`);
    opts.onStart?.((audio.duration / spec.rate) * 1000);
  }).catch(() => end());
  return {
    stop: () => {
      stopped = true;
      if (src) live.delete(src);
      try { src?.stop(); } catch { /* fine */ }
      // (its echoes and reverb go quiet with it)
      if (post) { const p = post; p.gain.setTargetAtTime(0, ctx.currentTime, 0.03); setTimeout(() => { try { p.disconnect(); } catch { /* fine */ } }, 400); }
      end();
    },
  };
};

/** Every voice that's been recorded, and its lines (for the voice test on the title screen's cheat panel). */
export const recordedVoices = (): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  if (!pack) return out;
  for (const k of Object.keys(pack.clips)) { const i = k.indexOf('|'); (out[k.slice(0, i)] ??= []).push(k.slice(i + 1)); }
  return out;
};
