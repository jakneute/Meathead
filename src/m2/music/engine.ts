// Meathead 2's music player: a late-90s sound (a PS1 / high-end N64 game's) where Meathead 1's was a SNES's. It plays
// one song at a time (looping, or once: a jingle), up to two dozen parts, from the bank's multi-sampled instruments
// (bank/), through a real effects chain: a convolution reverb (the song's room: fx.ts), a tempo-synced ping-pong
// delay and a stereo chorus (each part sends to them as much as it likes), then the bus compressor and a limiter.
//
// A song can have ARRANGEMENTS: the same tune with parts in or out, on other instruments, louder or quieter, sent
// to the room more or less, muffled; it swaps between them mid-song without losing its place, each part
// crossfading (Banjo-Kazooie's way: the land's theme changes as he goes from one section into the next). A song can
// have an intro (loopFrom: where it goes back to). Notes carry velocity (louder and, for some instruments, brighter),
// pan, bends, falls, portamento, vibrato, slurs (mml.ts). Muffled when the game's paused or he's under water; ducked
// while anyone's talking; quieter in a cutscene.
//
// The samples are made in idle time (bank/index.ts); a song that's asked for before its instruments are ready starts
// as soon as they are (a song's own first, so it's a beat at most).

import { mixOut } from '../../m1/game/platform/mixer';
import { INSTRUMENTS, sampleAt, keyOf, zoneFor, want, isMade } from './bank/index';
import { parseMML, type NoteEv, type CtrlEv } from './mml';
import { reverbIR, type ReverbKind } from './fx';

export interface Part {
  /** The instrument (bank/: MUSIC.md lists them). */
  inst: string;
  mml: string;
  /** A drum part: letters (and (name)s) for drums, not notes. */
  drums?: boolean;
  /** Which drum each letter plays ('acoustic', '808', '909', 'brush', 'orchestra'). */
  kit?: string;
  vol?: number;
  /** -1 (left) .. 1 (right). */
  pan?: number;
  /** How much goes to the reverb, the delay, the chorus (0..1; MML's _r _d _c change them as it goes). */
  rev?: number; dly?: number; cho?: number;
  /** Only in these arrangements (all of them if not given); not in these. */
  only?: string[]; not?: string[];
  /** This part's swing (0..1) and its grid (8 or 16), if not the song's. */
  swing?: number; grid?: 8 | 16;
  /** Vibrato: rate (Hz), depth (cents), delay (s): instead of the instrument's. */
  vib?: [number, number, number?];
  /** Most notes ringing at once. */
  poly?: number;
  /** Transposed (semitones). */
  tr?: number;
}
export interface Arrangement {
  /** Parts played on another instrument here. */
  inst?: Record<string, string>;
  /** Parts out. */
  mute?: string[];
  /** Only these parts (the rest out). */
  solo?: string[];
  /** Parts louder or quieter (a multiplier). */
  vol?: Record<string, number>;
  /** Parts' reverb sends here (0..1). */
  rev?: Record<string, number>;
  /** The whole song through a low-pass at this many Hz (heard through a wall, from under the water, far off). */
  lowpass?: number;
  /** The whole song's level here (a multiplier). */
  level?: number;
}
export interface Song {
  /** For the sound test. */
  title: string;
  bpm: number;
  parts: Record<string, Part>;
  arrangements?: Record<string, Arrangement>;
  /** Plays once (a jingle) instead of looping. */
  once?: boolean;
  /** Beats: where the loop goes back to (after an intro). 0 if not given. */
  loopFrom?: number;
  /** Beats: the song's length (the longest part's if not given). */
  length?: number;
  /** Overall level (a multiplier). */
  vol?: number;
  /** Swing (0..1: a full triplet shuffle at 1) on a grid of 8ths or 16ths. */
  swing?: number; grid?: 8 | 16;
  /** The room: its kind, and how much of it comes back (default 1). */
  reverb?: ReverbKind; reverbMix?: number;
  /** The delay: its time (beats: 0.75 is a dotted eighth), feedback, and the tone of its repeats (Hz). */
  delay?: { beats: number; feedback?: number; tone?: number };
}

/** How far ahead notes are put in (seconds), and how often it looks. */
const AHEAD = 0.3, TICK_MS = 40;
/** Arrangement crossfades, and a song's fade when another comes in. */
const XFADE = 1.5, FADE_OUT = 1.0;
/** The music's level under the effects and voices; ducked while anyone talks; in a cutscene. */
const MUSIC_LEVEL = 0.24, DUCKED = 0.42, QUIET = 0.6;
const OPEN_CUTOFF = 20000, MUFFLED_CUTOFF = 480;
const DEFAULT_REV = 0.22;

interface Lane { key: string; gain: GainNode; expr: GainNode; pan: StereoPannerNode; sends: GainNode[]; lfo?: OscillatorNode }
interface Voice { src: AudioBufferSourceNode; env: GainNode; end: number; n: number | string; name: string; choke?: string; cut: boolean }
interface PartPlay {
  name: string; def: Part;
  notes: NoteEv[]; ctrl: CtrlEv[];
  ni: number; npass: number; ci: number; cpass: number; nLoop: number; cLoop: number;
  lane: Lane | null; voices: Voice[];
  /** Where its expression and sends are (as last scheduled). */
  expr: number; send: number[];
}
interface Playing {
  id: string; song: Song;
  out: GainNode; tone: BiquadFilterNode; bus: GainNode; fxIn: GainNode[];
  start: number; spb: number; length: number; loopFrom: number;
  parts: PartPlay[]; arrangement: string; done: boolean; fading: boolean;
  extra: AudioNode[]; oscs: OscillatorNode[];
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muffleF: BiquadFilterNode | null = null;
let current: Playing | null = null;
let pending: { id: string; token: number } | null = null;
let token = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let duck = false, muffle = false, quiet = false;
let getCtx: (() => AudioContext) | null = null;

/** The audio context (the sound effects', so they share it). */
export const useContext = (get: () => AudioContext) => { getCtx = get; };

// ---- Parsing (cached per part) ----

const parsedCache = new Map<string, ReturnType<typeof parseMML>>();
const parse = (song: Song, p: Part) => {
  const swing = p.swing ?? song.swing ?? 0, grid = p.grid ?? song.grid ?? 8;
  const key = `${p.drums ? 'D' : 'M'}${p.kit ?? ''}|${swing}|${grid}|${p.mml}`;
  let r = parsedCache.get(key);
  if (!r) { r = parseMML(p.mml, { drums: p.drums, kit: p.kit, swing, grid }); parsedCache.set(key, r); }
  return r;
};
const songLength = (song: Song) => song.length ?? Math.max(...Object.values(song.parts).map(p => parse(song, p).length), 0.0001);

/** Every sample a song needs (each instrument it uses, at each zone its notes fall in): in one arrangement, or in
 *  every one of them. */
const needCache = new WeakMap<Song, Map<string, Set<string>>>();
export const samplesFor = (song: Song, arr?: string): Set<string> => {
  let bySong = needCache.get(song);
  if (!bySong) { bySong = new Map(); needCache.set(song, bySong); }
  const have = bySong.get(arr ?? '*');
  if (have) return have;
  const keys = new Set<string>();
  for (const [name, p] of Object.entries(song.parts)) {
    const cfg = arr !== undefined ? partIn(song, name, arr) : null;
    if (arr !== undefined && !cfg) continue;
    const insts = cfg ? new Set([cfg.inst]) : new Set([p.inst, ...Object.values(song.arrangements ?? {}).map(a => a.inst?.[name]).filter((x): x is string => !!x)]);
    for (const e of parse(song, p).notes) {
      const list = e.inst ? [e.inst] : typeof e.n === 'string' ? [e.n] : [...insts];
      for (const inst of list) {
        if (!INSTRUMENTS[inst]) continue;
        const n = typeof e.n === 'number' ? e.n + (p.tr ?? 0) : 60;
        keys.add(keyOf(inst, zoneFor(inst, n)));
      }
    }
  }
  bySong.set(arr ?? '*', keys);
  return keys;
};
/** Starts making a song's samples in idle time (so it's ready when it's wanted). */
export const prewarm = (song: Song) => { void want(samplesFor(song), false); };
export const isReady = (song: Song) => [...samplesFor(song)].every(isMade);

// ---- The chain ----

const ensureChain = (): AudioContext | null => {
  if (!getCtx) return null;
  const c = getCtx();
  if (c.state === 'closed') return null;
  if (ctx === c && master) return c;
  ctx = c;
  current = null;
  master = c.createGain();
  master.gain.value = MUSIC_LEVEL;
  muffleF = c.createBiquadFilter();
  muffleF.type = 'lowpass'; muffleF.frequency.value = OPEN_CUTOFF; muffleF.Q.value = 0.5;
  // (the bus compressor: 2.5:1 on the peaks, slow enough not to pump: glue; then a limiter so nothing ever clips)
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 2.5; comp.attack.value = 0.015; comp.release.value = 0.3;
  const lim = c.createDynamicsCompressor();
  lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.12;
  master.connect(muffleF); muffleF.connect(comp); comp.connect(lim); lim.connect(mixOut(c, 'music'));
  return c;
};

/** A song's own effects: its room (convolution), the ping-pong delay, the chorus; each fed by the parts' sends. */
const buildFx = (c: AudioContext, song: Song, spb: number, out: AudioNode) => {
  const extra: AudioNode[] = [], oscs: OscillatorNode[] = [];
  const keep = <T extends AudioNode>(n: T) => { extra.push(n); return n; };
  // Reverb
  const revIn = keep(c.createGain());
  const preD = keep(c.createDelay(0.1)); preD.delayTime.value = 0.01;
  const conv = keep(c.createConvolver()); conv.buffer = reverbIR(c, song.reverb ?? 'hall');
  const thin = keep(c.createBiquadFilter()); thin.type = 'highpass'; thin.frequency.value = 170;
  const revOut = keep(c.createGain()); revOut.gain.value = song.reverbMix ?? 1;
  revIn.connect(preD); preD.connect(conv); conv.connect(thin); thin.connect(revOut); revOut.connect(out);
  // Delay (ping-pong: left, then right, then left...)
  const dIn = keep(c.createGain());
  const t = Math.min(1.9, (song.delay?.beats ?? 0.75) * spb);
  const dl = keep(c.createDelay(2)), dr = keep(c.createDelay(2));
  dl.delayTime.value = t; dr.delayTime.value = t;
  const fb = keep(c.createGain()); fb.gain.value = song.delay?.feedback ?? 0.35;
  const tl = keep(c.createBiquadFilter()), trr = keep(c.createBiquadFilter());
  for (const f of [tl, trr]) { f.type = 'lowpass'; f.frequency.value = song.delay?.tone ?? 3200; }
  const dHp = keep(c.createBiquadFilter()); dHp.type = 'highpass'; dHp.frequency.value = 220;
  const merge = keep(c.createChannelMerger(2));
  const dOut = keep(c.createGain()); dOut.gain.value = 0.7;
  dIn.connect(dHp); dHp.connect(dl); dl.connect(tl); tl.connect(merge, 0, 0); tl.connect(dr); dr.connect(trr); trr.connect(merge, 0, 1); trr.connect(fb); fb.connect(dl);
  merge.connect(dOut); dOut.connect(out);
  // Chorus (two modulated delays, one an ear)
  const cIn = keep(c.createGain());
  const cm = keep(c.createChannelMerger(2));
  const cOut = keep(c.createGain()); cOut.gain.value = 0.8;
  for (let ch = 0; ch < 2; ch++) {
    const d = keep(c.createDelay(0.05)); d.delayTime.value = ch ? 0.0145 : 0.0115;
    const lfo = c.createOscillator(); lfo.frequency.value = ch ? 0.93 : 0.71;
    const depth = keep(c.createGain()); depth.gain.value = 0.0028;
    lfo.connect(depth); depth.connect(d.delayTime); lfo.start(); oscs.push(lfo);
    cIn.connect(d); d.connect(cm, 0, ch);
  }
  cm.connect(cOut); cOut.connect(out);
  return { fxIn: [revIn, dIn, cIn], extra, oscs };
};

// ---- Lanes (a part's way out, one per instrument; an instrument change crossfades lane to lane) ----

const laneFor = (p: Playing, part: PartPlay, inst: string, level: number, fadeIn: number): Lane => {
  const c = ctx!;
  const expr = c.createGain(); expr.gain.value = part.expr;
  const gain = c.createGain(); gain.gain.value = fadeIn > 0 ? 0 : level;
  const pan = c.createStereoPanner(); pan.pan.value = part.def.pan ?? 0;
  expr.connect(gain); gain.connect(pan); pan.connect(p.bus);
  const sends = p.fxIn.map((fx, k) => { const g = c.createGain(); g.gain.value = part.send[k]; pan.connect(g); g.connect(fx); return g; });
  if (fadeIn > 0) gain.gain.setTargetAtTime(level, c.currentTime, fadeIn / 4);
  const lane: Lane = { key: inst, gain, expr, pan, sends };
  const def = INSTRUMENTS[inst];
  if (def && !def.drum) {
    const lfo = c.createOscillator(); lfo.frequency.value = part.def.vib?.[0] ?? def.vib?.[0] ?? 5.5;
    lfo.start(); lane.lfo = lfo;
  }
  return lane;
};
const dropLane = (lane: Lane, fade: number) => {
  const c = ctx!;
  lane.gain.gain.cancelScheduledValues(c.currentTime);
  lane.gain.gain.setTargetAtTime(0, c.currentTime, fade / 4);
  setTimeout(() => { try { lane.expr.disconnect(); lane.gain.disconnect(); lane.pan.disconnect(); lane.sends.forEach(s => s.disconnect()); lane.lfo?.stop(); lane.lfo?.disconnect(); } catch { /* gone */ } }, (fade + 5) * 1000);
};

/** What a part is in an arrangement: its instrument and level (or null: it's out), and its reverb send. */
const partIn = (song: Song, name: string, arr: string): { inst: string; level: number; rev?: number } | null => {
  const def = song.parts[name];
  const a = song.arrangements?.[arr];
  if (def.only && !def.only.includes(arr)) return null;
  if (def.not && def.not.includes(arr)) return null;
  if (a?.mute?.includes(name)) return null;
  if (a?.solo && !a.solo.includes(name)) return null;
  const inst = a?.inst?.[name] ?? def.inst;
  if (!INSTRUMENTS[inst]) return null;
  return { inst, level: (def.vol ?? 1) * (a?.vol?.[name] ?? 1) * INSTRUMENTS[inst].gain, rev: a?.rev?.[name] };
};

// ---- Notes ----

const hold = (param: AudioParam, at: number) => {
  const p = param as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
  if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(at); else param.cancelScheduledValues(at);
};
/** Lets a ringing voice go, quickly, at `at`. */
const cutVoice = (v: Voice, at: number, fade = 0.012) => {
  if (v.cut) return;
  v.cut = true;
  try { hold(v.env.gain, at); v.env.gain.setTargetAtTime(0, at, fade); v.src.stop(at + fade * 8); } catch { /* already stopped */ }
  v.end = Math.min(v.end, at + fade * 8);
};

const playNote = (p: Playing, part: PartPlay, e: NoteEv, when: number) => {
  const c = ctx!;
  const lane = part.lane;
  if (!lane) return;
  const name = e.inst && INSTRUMENTS[e.inst] ? e.inst : typeof e.n === 'string' ? e.n : lane.key;
  const def = INSTRUMENTS[name];
  if (!def) return;
  const note = typeof e.n === 'number' ? e.n + (part.def.tr ?? 0) : 60;
  const smp = sampleAt(c, name, note);
  if (!smp) return;
  const now = c.currentTime;
  // (the voices still ringing: the done ones dropped; a mono part's or a choke group's cut; past the polyphony, the oldest)
  part.voices = part.voices.filter(v => v.end > now);
  for (const v of part.voices) {
    if (def.mono && !def.drum && !v.cut && typeof v.n === 'number') cutVoice(v, when, e.slur ? 0.03 : 0.015);
    else if (def.choke && v.choke === def.choke) cutVoice(v, when, 0.01);
    else if (!def.drum && !INSTRUMENTS[name].mono && v.n === note && v.end > when && smp.loop === undefined) cutVoice(v, when, 0.06);
  }
  // (counted per instrument: a drum part's hats never cut its crash's tail short)
  const poly = part.def.poly ?? def.poly ?? 8;
  const live = part.voices.filter(v => !v.cut && v.name === name);
  for (let k = 0; k <= live.length - poly; k++) cutVoice(live[k], when, 0.03);

  const src = c.createBufferSource();
  src.buffer = smp.buf;
  const rate = def.drum ? 1 : Math.pow(2, (note - smp.pitch) / 12);
  src.playbackRate.value = rate;
  if (smp.loop) { src.loop = true; src.loopStart = smp.loop[0]; src.loopEnd = smp.loop[1]; }
  const env = c.createGain();
  const { a, d, s, r } = def.env;
  // (a part's lane has its own instrument's gain in it: a note on another instrument swaps that for its own)
  const rel = name !== lane.key ? def.gain / (INSTRUMENTS[lane.key]?.gain || 1) : 1;
  const peak = Math.pow(e.v, 1.4) * rel;
  const heldFor = def.drum ? smp.buf.duration : Math.max(0.025, e.d * p.spb * e.gate);
  env.gain.setValueAtTime(0, when);
  if (e.slur) { env.gain.linearRampToValueAtTime(peak * s, when + 0.012); }
  else {
    env.gain.linearRampToValueAtTime(peak, when + a);
    if (d > 0 && s < 1) env.gain.setTargetAtTime(peak * s, when + a, d / 3);
  }
  const off = when + Math.max(heldFor, a);
  if (!def.drum) env.gain.setTargetAtTime(0, off, r / 3);
  // (soft notes darker, on the instruments that are)
  let head: AudioNode = src;
  if (def.velBright && e.v < 0.97) {
    const f0 = 440 * Math.pow(2, (note - 69) / 12);
    const cut = Math.max(f0 * 3, 18000 * Math.pow(2, -def.velBright * 6 * (1 - e.v)));
    if (cut < 15000) { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; lp.Q.value = 0.5; src.connect(lp); head = lp; }
  }
  head.connect(env);
  let tail: AudioNode = env;
  if (e.pan !== undefined) { const pn = c.createStereoPanner(); pn.pan.value = e.pan; env.connect(pn); tail = pn; }
  tail.connect(lane.expr);
  // Pitch: a bend into it, a fall off its end, vibrato on a held note
  if (!def.drum) {
    const dt = src.detune;
    let bendEnd = when;
    if (e.bend) { bendEnd = when + (e.bendT ?? 0.25) * p.spb; dt.setValueAtTime(e.bend * 100, when); dt.linearRampToValueAtTime(0, bendEnd); }
    if (e.fall) { const fs = Math.max(bendEnd, off - (e.fallT ?? 0.5) * p.spb); dt.setValueAtTime(0, fs); dt.linearRampToValueAtTime(e.fall * 100, off + r * 0.5); }
    const depth = e.vib ?? part.def.vib?.[1] ?? def.vib?.[1] ?? 0;
    const delay = part.def.vib?.[2] ?? def.vib?.[2] ?? 0.2;
    if (depth > 0 && lane.lfo && heldFor > delay + 0.12) {
      const vg = c.createGain();
      vg.gain.setValueAtTime(0, when); vg.gain.setValueAtTime(0, when + delay); vg.gain.linearRampToValueAtTime(depth, when + delay + 0.3);
      lane.lfo.connect(vg); vg.connect(dt);
      const lfo = lane.lfo;
      src.addEventListener('ended', () => { try { lfo.disconnect(vg); vg.disconnect(); } catch { /* fine */ } });
    }
  }
  src.start(when);
  const end = smp.loop || def.drum ? (def.drum ? when + smp.buf.duration : off + r * 3 + 0.05) : Math.min(when + smp.buf.duration / rate, off + r * 3 + 0.05);
  src.stop(end);
  src.onended = () => { try { env.disconnect(); tail.disconnect(); head.disconnect(); } catch { /* fine */ } };
  part.voices.push({ src, env, end, n: note, name, choke: def.choke, cut: false });
};

/** A control change on a part (its expression, a send), scheduled. */
const playCtrl = (p: Playing, part: PartPlay, e: CtrlEv, when: number) => {
  const c = ctx!;
  const lane = part.lane;
  const k = e.k === 'expr' ? -1 : e.k === 'rev' ? 0 : e.k === 'dly' ? 1 : 2;
  const from = k < 0 ? part.expr : part.send[k];
  if (k < 0) part.expr = e.v; else part.send[k] = e.v;
  if (!lane) return;
  const param = k < 0 ? lane.expr.gain : lane.sends[k].gain;
  const at = Math.max(when, c.currentTime);
  if (e.ramp > 0) { param.setValueAtTime(from, at); param.linearRampToValueAtTime(e.v, at + e.ramp * p.spb); }
  else param.setTargetAtTime(e.v, at, 0.015);
};

/** Where (seconds) a beat of a part's lands on its pass (the first from the top, the rest from loopFrom). */
const timeOf = (p: Playing, pass: number, beat: number) => p.start + p.spb * (pass === 0 ? beat : p.length + (pass - 1) * (p.length - p.loopFrom) + (beat - p.loopFrom));

const tick = () => {
  const p = current;
  if (!p || !ctx || p.done) return;
  const now = ctx.currentTime, horizon = now + AHEAD;
  let allDone = true;
  for (const part of p.parts) {
    // Notes
    if (part.notes.length) {
      for (;;) {
        if (p.song.once && part.npass > 0) break;
        if (part.ni >= part.notes.length) { part.npass++; part.ni = part.nLoop; if (part.ni >= part.notes.length || p.song.once) break; continue; }
        const e = part.notes[part.ni];
        const when = timeOf(p, part.npass, e.t);
        if (when > horizon) { allDone = false; break; }
        if (when >= now - 0.05) playNote(p, part, e, Math.max(when, now));
        part.ni++;
      }
      if (!(p.song.once && part.npass > 0)) allDone = false;
    }
    // Control changes
    if (part.ctrl.length) {
      for (;;) {
        if (p.song.once && part.cpass > 0) break;
        if (part.ci >= part.ctrl.length) { part.cpass++; part.ci = part.cLoop; if (part.ci >= part.ctrl.length || p.song.once) break; continue; }
        const e = part.ctrl[part.ci];
        const when = timeOf(p, part.cpass, e.t);
        if (when > horizon) break;
        playCtrl(p, part, e, when);
        part.ci++;
      }
    }
  }
  if (p.song.once && allDone) p.done = true;
};

/** A part's notes spread over the whole song (a short pattern repeats till the longest part's done). */
const fill = <T extends { t: number }>(events: T[], length: number, total: number): T[] => {
  if (!events.length || length <= 0) return [];
  if (length >= total - 1e-6) return events.filter(e => e.t < total - 1e-6);
  const out: T[] = [];
  for (let k = 0; k * length < total - 1e-6; k++) for (const e of events) { const t = e.t + k * length; if (t < total - 1e-6) out.push({ ...e, t }); }
  return out;
};

const begin = (id: string, song: Song, arrangement: string) => {
  const c = ensureChain();
  if (!c) return;
  const total = songLength(song);
  const spb = 60 / song.bpm;
  const out = c.createGain(); out.gain.value = (song.vol ?? 1) * (song.arrangements?.[arrangement]?.level ?? 1);
  const tone = c.createBiquadFilter(); tone.type = 'lowpass'; tone.Q.value = 0.5; tone.frequency.value = song.arrangements?.[arrangement]?.lowpass ?? 20000;
  const bus = c.createGain();
  bus.connect(tone); tone.connect(out); out.connect(master!);
  const fx = buildFx(c, song, spb, tone);
  const loopFrom = song.once ? 0 : Math.max(0, Math.min(total - 0.25, song.loopFrom ?? 0));
  const p: Playing = { id, song, out, tone, bus, fxIn: fx.fxIn, start: c.currentTime + 0.1, spb, length: total, loopFrom, parts: [], arrangement, done: false, fading: false, extra: fx.extra, oscs: fx.oscs };
  for (const [name, def] of Object.entries(song.parts)) {
    const r = parse(song, def);
    // (a part that isn't the song's length, or a whole fraction of it, would come round out of step: tell the composer)
    if (import.meta.env.DEV && r.length > 0 && Math.abs(total / r.length - Math.round(total / r.length)) > 1e-6) console.warn(`music: ${id}.${name} is ${r.length} beats; the song is ${total}`);
    const notes = song.once ? r.notes : fill(r.notes, r.length, total);
    const ctrl = song.once ? r.ctrl : fill(r.ctrl, r.length, total);
    const nLoop = notes.findIndex(e => e.t >= loopFrom - 1e-6), cLoop = ctrl.findIndex(e => e.t >= loopFrom - 1e-6);
    const part: PartPlay = {
      name, def, notes, ctrl, ni: 0, npass: 0, ci: 0, cpass: 0, nLoop: nLoop < 0 ? notes.length : nLoop, cLoop: cLoop < 0 ? ctrl.length : cLoop,
      lane: null, voices: [], expr: 1, send: [def.rev ?? DEFAULT_REV, def.dly ?? 0, def.cho ?? 0],
    };
    const cfg = partIn(song, name, arrangement);
    if (cfg) { if (cfg.rev !== undefined) part.send[0] = cfg.rev; part.lane = laneFor(p, part, cfg.inst, cfg.level, 0); }
    p.parts.push(part);
  }
  current = p;
  if (!timer) timer = setInterval(tick, TICK_MS);
  tick();
};

/** Plays a song (from the top), fading out whatever was on; already on, it just changes arrangement. Waits (a beat,
 *  at most) for any of its instruments not made yet. */
export const play = (id: string, song: Song, arrangement = 'main') => {
  const c = ensureChain();
  if (!c) return;
  if (current && current.id === id && !current.fading) { pending = null; setArrangement(arrangement); return; }
  if (pending?.id === id) return;
  stop(FADE_OUT);
  // (what this arrangement plays, first; the song's other arrangements' instruments after, in idle time)
  const keys = samplesFor(song, arrangement);
  const my = ++token;
  pending = { id, token: my };
  const go = () => { if (pending?.token !== my) return; pending = null; begin(id, song, arrangement); prewarm(song); };
  if ([...keys].every(isMade)) go();
  else void want(keys, true).then(go);
};

/** Switches the playing song to another of its arrangements, part by part, without losing its place. */
export const setArrangement = (arr: string) => {
  const p = current;
  if (!p || !ctx || p.arrangement === arr) return;
  p.arrangement = arr;
  // (anything it plays that isn't made yet, made next: its notes come in as soon as it is)
  void want(samplesFor(p.song, arr), true);
  const a = p.song.arrangements?.[arr];
  const t = ctx.currentTime;
  p.out.gain.setTargetAtTime((p.song.vol ?? 1) * (a?.level ?? 1), t, XFADE / 4);
  p.tone.frequency.setTargetAtTime(a?.lowpass ?? 20000, t, XFADE / 4);
  for (const part of p.parts) {
    const cfg = partIn(p.song, part.name, arr);
    if (cfg?.rev !== undefined) part.send[0] = cfg.rev;
    else if (cfg) part.send[0] = part.def.rev ?? DEFAULT_REV;
    const lane = part.lane;
    if (cfg && lane && lane.key === cfg.inst) {
      lane.gain.gain.setTargetAtTime(cfg.level, t, XFADE / 4);
      lane.sends[0].gain.setTargetAtTime(part.send[0], t, XFADE / 4);
      continue;
    }
    if (lane) dropLane(lane, XFADE);
    part.lane = cfg ? laneFor(p, part, cfg.inst, cfg.level, XFADE) : null;
  }
};

/** Fades out whatever's playing. */
export const stop = (fade = FADE_OUT) => {
  pending = null;
  const p = current;
  current = null;
  if (!p || !ctx) return;
  p.fading = true; p.done = true;
  p.out.gain.cancelScheduledValues(ctx.currentTime);
  p.out.gain.setTargetAtTime(0, ctx.currentTime, fade / 4);
  setTimeout(() => {
    try {
      for (const part of p.parts) { for (const v of part.voices) { try { v.src.stop(); } catch { /* done */ } } if (part.lane) { part.lane.lfo?.stop(); part.lane.expr.disconnect(); part.lane.gain.disconnect(); part.lane.pan.disconnect(); part.lane.sends.forEach(s => s.disconnect()); } }
      p.oscs.forEach(o => { o.stop(); o.disconnect(); });
      p.extra.forEach(n => n.disconnect());
      p.bus.disconnect(); p.tone.disconnect(); p.out.disconnect();
    } catch { /* gone */ }
  }, (fade + 5) * 1000);
};

/** What's playing (its id and arrangement), or null. */
export const nowPlaying = () => (current ? { id: current.id, arr: current.arrangement, done: current.done } : null);

/** Where song `id` is, in beats from its top (its first pass; below 0 just before its first note), while it's the
 *  one on; null otherwise. (The title's intro lands its hits on the theme's.) */
export const songBeat = (id: string) => (current && ctx && current.id === id && !current.fading ? (ctx.currentTime - current.start) / current.spb : null);

/** Ducked while somebody's talking; muffled while paused (or under water); quieter in a cutscene. */
export const setMix = (talking: boolean, muffled: boolean, inCutscene = false) => {
  if (!ctx || !master || !muffleF) return;
  if (talking !== duck || inCutscene !== quiet) {
    const slower = !talking && duck;
    duck = talking; quiet = inCutscene;
    master.gain.setTargetAtTime(MUSIC_LEVEL * (talking ? DUCKED : 1) * (inCutscene ? QUIET : 1), ctx.currentTime, slower ? 0.4 : 0.1);
  }
  if (muffled !== muffle) { muffle = muffled; muffleF.frequency.setTargetAtTime(muffled ? MUFFLED_CUTOFF : OPEN_CUTOFF, ctx.currentTime, 0.12); }
};
