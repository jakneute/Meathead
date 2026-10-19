// The whole bank (bank/melodic.ts, bank/drums.ts) and making its samples: lazily, a song's own first, in idle time,
// a block at a time (never a stalled frame), each made once and kept (the samples are plain arrays, kept for the
// session; each audio context gets its buffers from them).
//
//   want(keys, urgent)    make these (instrument|root keys) soon: urgent ones before anything else, the rest when
//                         the page is idle. Resolves when they're all ready.
//   sampleAt(ctx, inst, note)   the buffer to play a note from (its zone's), or null if it isn't made yet.

import { MELODIC } from './melodic';
import { DRUMS, KITS, DRUM_LETTERS } from './drums';
import type { InstDef, ZoneJob } from './kit';

export const INSTRUMENTS: Record<string, InstDef> = { ...MELODIC, ...DRUMS };
export { KITS, DRUM_LETTERS };
export type { InstDef };

/** The instrument whose samples this one plays (itself, or what it's an alias of). */
const source = (name: string) => INSTRUMENTS[name]?.alias ?? name;
/** The zone (its root) a note on this instrument plays from: the nearest. */
export const zoneFor = (name: string, note: number) => {
  const z = INSTRUMENTS[name]?.zones;
  if (!z || z.length === 1) return z?.[0] ?? 60;
  let best = z[0];
  for (const r of z) if (Math.abs(r - note) < Math.abs(best - note)) best = r;
  return best;
};
/** A sample's key: the instrument it really is, and the zone. */
export const keyOf = (name: string, root: number) => `${source(name)}|${root}`;

interface Made { ch: Float32Array[]; sr: number; pitch: number; loop?: [number, number] }
const made = new Map<string, Made>();
const buffers = new WeakMap<BaseAudioContext, Map<string, { buf: AudioBuffer; pitch: number; loop?: [number, number] }>>();

interface Job { key: string; urgent: boolean; gen?: Generator<void, void, unknown>; spec?: ZoneJob; out?: Float32Array[]; waiters: (() => void)[] }
const queue: Job[] = [];
const byKey = new Map<string, Job>();
let pumping = false;

/** Normalizes a finished sample, crossfades its loop seam (or fades its tail), and keeps it. */
const finish = (job: Job) => {
  const { spec, out } = job;
  if (!spec || !out) return;
  let peak = 0;
  for (const c of out) for (let i = 0; i < c.length; i++) { const a = Math.abs(c[i]); if (a > peak) peak = a; }
  const g = peak > 0 ? 0.95 / peak : 1;
  for (const c of out) {
    for (let i = 0; i < c.length; i++) c[i] *= g;
    if (spec.loop) {
      // (belt and braces: the last 20 ms before the loop's end crossfaded into the 20 ms before its start, so even a
      // sound that isn't quite periodic loops without a click)
      const [a, b] = spec.loop, x = Math.min(Math.round(0.02 * spec.sr), a);
      for (let i = 0; i < x; i++) { const w = i / x; c[b - x + i] = c[b - x + i] * (1 - w) + c[a - x + i] * w; }
    } else {
      const f = Math.min(c.length, Math.round((spec.fade ?? 0.02) * spec.sr));
      for (let i = 0; i < f; i++) c[c.length - 1 - i] *= i / f;
    }
  }
  made.set(job.key, { ch: out, sr: spec.sr, pitch: spec.pitch, loop: spec.loop });
};

const start = (job: Job) => {
  const [name, root] = job.key.split('|');
  const def = INSTRUMENTS[name];
  const spec = def.job(Number(root), job.key);
  job.spec = spec;
  job.out = Array.from({ length: spec.ch }, () => new Float32Array(spec.len));
  job.gen = spec.render(job.out);
};

/** Works through the queue for `budget` ms (urgent ones first). */
const work = (budget: number) => {
  const end = performance.now() + budget;
  while (queue.length && performance.now() < end) {
    // (urgent first, then in the order asked)
    let k = queue.findIndex(j => j.urgent);
    if (k < 0) k = 0;
    const job = queue[k];
    try {
      if (!job.gen) start(job);
      while (performance.now() < end) { if (job.gen!.next().done) { finish(job); queue.splice(k, 1); byKey.delete(job.key); job.waiters.forEach(w => w()); job.waiters = []; break; } }
    } catch (err) {
      console.error('music: could not make', job.key, err);
      queue.splice(k, 1); byKey.delete(job.key); job.waiters.forEach(w => w());
    }
  }
};

type Idle = (cb: (d: { timeRemaining: () => number }) => void, o?: { timeout: number }) => number;
const pump = () => {
  if (pumping || !queue.length) return;
  pumping = true;
  const urgent = queue.some(j => j.urgent);
  const ric = (globalThis as unknown as { requestIdleCallback?: Idle }).requestIdleCallback;
  const next = () => { pumping = false; pump(); };
  // (urgent: a song's waiting on it: a few ms between frames; otherwise only in idle time, a little at a time)
  if (urgent || !ric) setTimeout(() => { work(urgent ? 9 : 4); next(); }, urgent ? 0 : 30);
  else ric(d => { work(Math.max(2, Math.min(8, d.timeRemaining() - 1))); next(); }, { timeout: 1500 });
};

/** Make these samples (instrument|root keys). `urgent`: a song's waiting. Resolves once they're all made. */
export const want = (keys: Iterable<string>, urgent: boolean): Promise<void> => {
  const waits: Promise<void>[] = [];
  for (const key of keys) {
    if (made.has(key)) continue;
    const name = key.split('|')[0];
    if (!INSTRUMENTS[name]) continue;
    let job = byKey.get(key);
    if (!job) { job = { key, urgent, waiters: [] }; byKey.set(key, job); queue.push(job); }
    else if (urgent) job.urgent = true;
    const j = job;
    waits.push(new Promise(res => j.waiters.push(res)));
  }
  pump();
  return Promise.all(waits).then(() => undefined);
};
export const isMade = (key: string) => made.has(key);

/** The buffer a note plays from (its zone's sample, in this context), its pitch and loop; null if not made yet. */
export const sampleAt = (ctx: BaseAudioContext, name: string, note: number) => {
  const key = keyOf(name, zoneFor(name, note));
  let m = buffers.get(ctx);
  if (!m) { m = new Map(); buffers.set(ctx, m); }
  const have = m.get(key);
  if (have) return have;
  const s = made.get(key);
  if (!s) return null;
  const buf = ctx.createBuffer(s.ch.length, s.ch[0].length, s.sr);
  s.ch.forEach((c, i) => buf.getChannelData(i).set(c));
  const out = { buf, pitch: s.pitch, loop: s.loop ? [s.loop[0] / s.sr, s.loop[1] / s.sr] as [number, number] : undefined };
  m.set(key, out);
  return out;
};
