// The music player: eight-ish parts at once, the instruments from instruments.ts, and the SNES's sound on top of it
// all (the slightly muffled playback, and that echo). It plays one song at a time, looping, and a song can have
// arrangements of itself (the same tune on different instruments, some parts in or out) that it can swap between
// mid-song without losing its place, crossfading part by part (the way Banjo-Kazooie's tunes change as you go from
// one area to the next). Muffled (a low filter over everything) when the game's paused, or he's under water;
// quieter (ducked) while anyone's talking.

import { INSTRUMENTS, sampleFor } from './instruments';
import { parseMML, NoteEvent } from './mml';

export interface Part {
  inst: string;
  mml: string;
  drums?: boolean;
  vol?: number;
  /** -1 (left) .. 1 (right). */
  pan?: number;
  /** Only in these arrangements (all of them if not given). */
  only?: string[];
  /** Not in these. */
  not?: string[];
}
export interface Arrangement {
  /** A part played on a different instrument in this arrangement. */
  inst?: Record<string, string>;
  /** Parts left out. */
  mute?: string[];
  /** Parts louder or quieter (a multiplier). */
  vol?: Record<string, number>;
}
export interface Song {
  bpm: number;
  parts: Record<string, Part>;
  arrangements?: Record<string, Arrangement>;
  /** Plays once (a jingle, a fanfare) instead of looping. */
  once?: boolean;
  /** Overall level (a multiplier). */
  vol?: number;
}

/** How far ahead notes are put in (seconds), and how often the scheduler looks. */
const AHEAD = 0.25, TICK_MS = 40;
/** How long an arrangement change crossfades, and how long a song fades out when another comes in. */
const XFADE = 1.4, FADE_OUT = 0.9;
/** How loud the music sits under the sound effects, and how much it ducks while someone's talking. */
const MUSIC_LEVEL = 0.32, DUCKED = 0.42;
/** The SNES-ish playback (its interpolation rounded the highs off), and the pause / underwater muffle. */
const OPEN_CUTOFF = 9000, MUFFLED_CUTOFF = 520;

interface Lane { key: string; gain: GainNode; pan: StereoPannerNode; lfo?: OscillatorNode; lfoGain?: GainNode }
interface PartPlay { name: string; def: Part; events: NoteEvent[]; length: number; idx: number; loop: number; lane: Lane | null }
interface Playing {
  id: string;
  song: Song;
  bus: GainNode;
  start: number;
  spb: number;
  length: number;
  parts: PartPlay[];
  arrangement: string;
  done: boolean;
  fading: boolean;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let current: Playing | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let duck = false, muffle = false;
let getCtx: (() => AudioContext) | null = null;

/** The audio context to use (the sound effects' own, so they share the one). */
export const useContext = (get: () => AudioContext) => { getCtx = get; };

const parsed = new Map<string, { events: NoteEvent[]; length: number }>();
const parse = (p: Part) => {
  const key = (p.drums ? 'D' : 'M') + p.mml;
  let r = parsed.get(key);
  if (!r) { r = parseMML(p.mml, p.drums); parsed.set(key, r); }
  return r;
};

/** The chain everything plays through: the parts' buses into the master, a low-pass (the SNES softness, and the muffle), the echo. */
const ensureChain = (): AudioContext | null => {
  if (!getCtx) return null;
  const c = getCtx();
  if (c.state === 'closed') return null;
  if (ctx === c && master) return c;
  ctx = c;
  current = null;
  master = c.createGain();
  master.gain.value = MUSIC_LEVEL;
  filter = c.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = OPEN_CUTOFF; filter.Q.value = 0.4;
  master.connect(filter);
  // The echo: a delay feeding back on itself through a dark filter, mixed in under the dry
  const send = c.createGain(); send.gain.value = 0.28;
  const delay = c.createDelay(1); delay.delayTime.value = 0.24;
  const fb = c.createGain(); fb.gain.value = 0.38;
  const dark = c.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 2600;
  filter.connect(c.destination);
  filter.connect(send); send.connect(delay); delay.connect(dark); dark.connect(fb); fb.connect(delay); dark.connect(c.destination);
  return c;
};

/** Where a part's notes go: one lane per part per instrument (a change of instrument crossfades lane to lane). */
const laneFor = (p: Playing, part: PartPlay, inst: string, level: number): Lane => {
  const c = ctx!;
  const gain = c.createGain(); gain.gain.value = 0;
  const pan = c.createStereoPanner(); pan.pan.value = part.def.pan ?? 0;
  gain.connect(pan); pan.connect(p.bus);
  gain.gain.setTargetAtTime(level, c.currentTime, 0.05);
  const lane: Lane = { key: inst, gain, pan };
  const vib = INSTRUMENTS[inst]?.vib;
  if (vib) {
    const lfo = c.createOscillator(); lfo.frequency.value = vib[0];
    const lg = c.createGain(); lg.gain.value = vib[1];
    lfo.connect(lg); lfo.start();
    lane.lfo = lfo; lane.lfoGain = lg;
  }
  return lane;
};

const dropLane = (lane: Lane, fade: number) => {
  const c = ctx!;
  lane.gain.gain.cancelScheduledValues(c.currentTime);
  lane.gain.gain.setTargetAtTime(0, c.currentTime, fade / 4);
  setTimeout(() => { try { lane.gain.disconnect(); lane.pan.disconnect(); lane.lfo?.stop(); lane.lfo?.disconnect(); lane.lfoGain?.disconnect(); } catch { /* gone */ } }, (fade + 4) * 1000);
};

/** What a part is in an arrangement: its instrument and level, or null if it's out of it. */
const partIn = (song: Song, name: string, arr: string): { inst: string; level: number } | null => {
  const def = song.parts[name];
  const a = song.arrangements?.[arr];
  if (def.only && !def.only.includes(arr)) return null;
  if (def.not && def.not.includes(arr)) return null;
  if (a?.mute?.includes(name)) return null;
  return { inst: a?.inst?.[name] ?? def.inst, level: (def.vol ?? 1) * (a?.vol?.[name] ?? 1) * INSTRUMENTS[a?.inst?.[name] ?? def.inst].gain };
};

const playNote = (p: Playing, part: PartPlay, e: NoteEvent, when: number) => {
  const c = ctx!;
  const lane = part.lane;
  if (!lane) return;
  const name = lane.key;
  const def = INSTRUMENTS[name];
  const { buf, loop } = sampleFor(c, name);
  const src = c.createBufferSource();
  src.buffer = buf;
  if (!def.drum) src.playbackRate.value = Math.pow(2, ((e.n as number) - def.base) / 12);
  if (loop) { src.loop = true; src.loopStart = loop[0]; src.loopEnd = loop[1]; }
  if (lane.lfoGain && e.d * p.spb > 0.35) lane.lfoGain.connect(src.detune);
  const env = c.createGain();
  const { a, d, s, r } = def.env;
  const peak = e.v;
  const held = def.drum ? buf.duration : Math.max(0.03, e.d * p.spb * e.gate);
  env.gain.setValueAtTime(0, when);
  env.gain.linearRampToValueAtTime(peak, when + a);
  if (d > 0) env.gain.setTargetAtTime(peak * s, when + a, d / 3);
  const off = when + Math.max(held, a);
  env.gain.setTargetAtTime(0, off, r / 3);
  src.connect(env); env.connect(lane.gain);
  src.start(when);
  // (a one-shot that runs out on its own stops when it's done)
  src.stop(loop ? off + r * 2 + 0.05 : Math.min(when + buf.duration / src.playbackRate.value, off + r * 2 + 0.05));
  src.onended = () => { try { env.disconnect(); if (lane.lfoGain) lane.lfoGain.disconnect(src.detune); } catch { /* fine */ } };
};

const tick = () => {
  const p = current;
  if (!p || !ctx || p.done) return;
  const horizon = ctx.currentTime + AHEAD;
  let allDone = true;
  for (const part of p.parts) {
    if (!part.events.length) continue;
    for (;;) {
      if (p.song.once && part.loop > 0) break;
      const e = part.events[part.idx];
      const when = p.start + (part.loop * p.length + e.t) * p.spb;
      if (when > horizon) { allDone = false; break; }
      if (when >= ctx.currentTime - 0.05) playNote(p, part, e, when);
      part.idx++;
      if (part.idx >= part.events.length) { part.idx = 0; part.loop++; }
    }
    if (!(p.song.once && part.loop > 0)) allDone = false;
  }
  if (p.song.once && allDone) p.done = true;
};

/** A part's notes spread over the whole song (a short pattern repeats till the longest part's done). */
const fill = (events: NoteEvent[], length: number, total: number): NoteEvent[] => {
  if (!events.length || length <= 0) return [];
  const out: NoteEvent[] = [];
  for (let k = 0; k * length < total - 1e-6; k++) for (const e of events) { const t = e.t + k * length; if (t < total - 1e-6) out.push({ ...e, t }); }
  return out;
};

/** Plays a song (from the top), fading out whatever was on. Does nothing if it's already the one playing (it just changes arrangement). */
export const play = (id: string, song: Song, arrangement = 'main') => {
  const c = ensureChain();
  if (!c) return;
  if (current && current.id === id && !current.fading) { setArrangement(arrangement); return; }
  stop(FADE_OUT);
  const total = Math.max(...Object.values(song.parts).map(pt => parse(pt).length));
  const bus = c.createGain();
  bus.gain.value = song.vol ?? 1;
  bus.connect(master!);
  const p: Playing = { id, song, bus, start: c.currentTime + 0.08, spb: 60 / song.bpm, length: total, parts: [], arrangement, done: false, fading: false };
  for (const [name, def] of Object.entries(song.parts)) {
    const r = parse(def);
    // (a jingle plays each part once, as written; a looping song repeats a short part till the longest one's done)
    const part: PartPlay = { name, def, events: song.once ? r.events : fill(r.events, r.length, total), length: total, idx: 0, loop: 0, lane: null };
    const cfg = partIn(song, name, arrangement);
    if (cfg) part.lane = laneFor(p, part, cfg.inst, cfg.level);
    p.parts.push(part);
  }
  current = p;
  if (!timer) timer = setInterval(tick, TICK_MS);
  tick();
};

/** Switches the playing song to another of its arrangements, part by part, without losing its place. */
export const setArrangement = (arr: string) => {
  const p = current;
  if (!p || !ctx || p.arrangement === arr) return;
  p.arrangement = arr;
  for (const part of p.parts) {
    const cfg = partIn(p.song, part.name, arr);
    const lane = part.lane;
    if (cfg && lane && lane.key === cfg.inst) { lane.gain.gain.setTargetAtTime(cfg.level, ctx.currentTime, XFADE / 4); continue; }
    if (lane) dropLane(lane, XFADE);
    part.lane = null;
    if (cfg) {
      part.lane = laneFor(p, part, cfg.inst, 0);
      part.lane.gain.gain.setTargetAtTime(cfg.level, ctx.currentTime, XFADE / 4);
    }
  }
};

/** Fades out whatever's playing. */
export const stop = (fade = FADE_OUT) => {
  const p = current;
  if (!p || !ctx) { current = null; return; }
  p.fading = true;
  p.done = true;
  p.bus.gain.cancelScheduledValues(ctx.currentTime);
  p.bus.gain.setTargetAtTime(0, ctx.currentTime, fade / 4);
  const bus = p.bus;
  setTimeout(() => { try { bus.disconnect(); } catch { /* gone */ } }, (fade + 3) * 1000);
  current = null;
};

/** Quieter while somebody's talking; muffled while paused (or under water). */
export const setMix = (talking: boolean, muffled: boolean) => {
  if (!ctx || !master || !filter) return;
  if (talking !== duck) { duck = talking; master.gain.setTargetAtTime(MUSIC_LEVEL * (talking ? DUCKED : 1), ctx.currentTime, talking ? 0.08 : 0.4); }
  if (muffled !== muffle) { muffle = muffled; filter.frequency.setTargetAtTime(muffled ? MUFFLED_CUTOFF : OPEN_CUTOFF, ctx.currentTime, 0.12); }
};

/**
 * Renders a song (in an arrangement) to audio, offline: the same instruments, the same chain, `seconds` of it. For
 * checking levels, and for listening to one outside the game.
 */
export const renderSong = async (song: Song, arrangement: string, seconds: number): Promise<AudioBuffer> => {
  const off = new OfflineAudioContext(2, Math.round(44100 * seconds), 44100);
  const saved = { ctx, master, filter, current, getCtx };
  getCtx = () => off as unknown as AudioContext;
  ctx = null; master = null; filter = null; current = null;
  try {
    ensureChain();
    play('render', song, arrangement);
    const p = current as Playing | null;
    if (p) {
      p.start = 0.05;
      // Everything, up front
      for (const part of p.parts) {
        if (!part.events.length) continue;
        for (;;) {
          if (song.once && part.loop > 0) break;
          const e = part.events[part.idx];
          const when = p.start + (part.loop * p.length + e.t) * p.spb;
          if (when > seconds) break;
          playNote(p, part, e, when);
          part.idx++;
          if (part.idx >= part.events.length) { part.idx = 0; part.loop++; }
        }
      }
      p.done = true;
    }
    return await off.startRendering();
  } finally {
    ({ ctx, master, filter, current, getCtx } = saved);
  }
};

/** Makes every instrument's sample now, one every little while (so the first note of each doesn't hitch). */
export const warmUp = () => {
  const names = Object.keys(INSTRUMENTS);
  const next = () => {
    const c = getCtx?.();
    const name = names.shift();
    if (!c || !name || c.state === 'closed') return;
    sampleFor(c, name);
    setTimeout(next, 25);
  };
  next();
};
