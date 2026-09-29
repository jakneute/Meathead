// The recorded voices: every line in the game, said by its own character (made ahead of time with a speech model,
// offline: see tools/voices), packed into one file that comes in with the game. A line that's been recorded plays
// from here; one that hasn't falls back to the browser's own speech (speech.ts).
//
// The pack: a little header (where each clip is, and how each voice is played back: a touch faster or slower,
// louder or quieter, through a radio, a respirator...), then the clips end to end (Ogg Opus). A clip's decoded when
// it's first wanted; the last few dozen are kept.

import { getAudioContext } from './audio';

interface VoiceSpec { rate: number; gain: number; fx: string }
interface Pack { buf: ArrayBuffer; base: number; clips: Record<string, [number, number]>; voices: Record<string, VoiceSpec> }

let pack: Pack | null = null;
const keyOf = (voice: string, text: string) => `${voice}|${text.trim()}`;

/** Loads the pack (from its URL: in the release, it's inside the page). */
export const loadVoicePack = async (url: string) => {
  try {
    const buf = await (await fetch(url)).arrayBuffer();
    const n = new DataView(buf).getUint32(0, true);
    const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n)));
    pack = { buf, base: 4 + n, clips: header.clips, voices: header.voices };
  } catch (err) {
    console.warn('voices: no pack', err);
  }
};

export const voicesLoaded = () => !!pack;
export const hasClip = (voice: string, text: string) => !!pack?.clips[keyOf(voice, text)];

// ---- decoding, and a small cache of what's been decoded
const decoded = new Map<string, AudioBuffer>();
const CACHE = 48;
const decode = async (ctx: AudioContext, key: string): Promise<AudioBuffer | null> => {
  const have = decoded.get(key);
  if (have) { decoded.delete(key); decoded.set(key, have); return have; }
  const at = pack?.clips[key];
  if (!pack || !at) return null;
  const bytes = pack.buf.slice(pack.base + at[0], pack.base + at[0] + at[1]);
  const audio = await ctx.decodeAudioData(bytes);
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
  input.connect(comp); comp.connect(make); make.connect(ctx.destination);
  bus = { ctx, input };
  return input;
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
  let stopped = false, src: AudioBufferSourceNode | null = null, ended = false;
  const end = () => { if (ended) return; ended = true; opts.onEnd?.(); };
  decode(ctx, key).then(audio => {
    if (stopped || !audio) { end(); return; }
    src = ctx.createBufferSource();
    src.buffer = audio;
    src.playbackRate.value = spec.rate;
    const g = ctx.createGain(); g.gain.value = spec.gain;
    src.connect(g);
    g.connect(fxChain(ctx, opts.radio ? 'radio' : spec.fx, busFor(ctx)));
    src.onended = () => { try { g.disconnect(); } catch { /* fine */ } end(); };
    src.start();
    // (a count of what's been said from the recordings, for checking: `window.__voicesPlayed`)
    const w = window as unknown as { __voicesPlayed?: string[] };
    (w.__voicesPlayed ??= []).push(`${voice}: ${text.slice(0, 40)} (${audio.duration.toFixed(1)}s)`);
    opts.onStart?.((audio.duration / spec.rate) * 1000);
  }).catch(() => end());
  return { stop: () => { stopped = true; try { src?.stop(); } catch { /* fine */ } end(); } };
};

/** Every voice that's been recorded, and its lines (for the voice test on the title screen's cheat panel). */
export const recordedVoices = (): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  if (!pack) return out;
  for (const k of Object.keys(pack.clips)) { const i = k.indexOf('|'); (out[k.slice(0, i)] ??= []).push(k.slice(i + 1)); }
  return out;
};
