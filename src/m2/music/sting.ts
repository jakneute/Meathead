// The beatdown's sting (the user: "when a beatdown grab is successful, line everything up and play a short jingle
// before the smashing happens", "kinda like a fatality sting"): a dark one-shot played OVER whatever song is on, never in
// place of it (the music engine is one song at a time: see engine.ts). Two heavy low hits, then a third with a
// diminished chord, a boom, a gong and a short echo tail: about 0.9 s.
// Built live from oscillators in the sound effects' audio context (as playEngageSound is), out through the sfx bus, so
// the options' sound volume (and the master) apply. Nothing made at load: the one noise buffer it needs is made the
// first time it plays (a few thousand samples).

import { getAudioContext } from '../../m1/game/platform/audio';
import { mixOut } from '../../m1/game/platform/mixer';

/** Overall level (under the voices: they come out at full on their own bus). */
const LEVEL = 0.45;
/** When each hit lands (seconds) and how long it rings. */
const HITS: { at: number; dur: number; notes: number[]; big?: boolean }[] = [
  { at: 0, dur: 0.16, notes: [36.71, 73.42] },
  { at: 0.17, dur: 0.14, notes: [73.42] },
  // (D, F, A flat over a low D: diminished, ominous)
  { at: 0.33, dur: 0.58, notes: [36.71, 73.42, 87.31, 103.83], big: true },
];

let noise: AudioBuffer | null = null;
let noiseCtx: AudioContext | null = null;
const noiseFor = (c: AudioContext) => {
  if (noise && noiseCtx === c) return noise;
  const n = Math.floor(c.sampleRate * 0.4), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  noise = b; noiseCtx = c;
  return b;
};

/** Plays the beatdown's fatality sting, now. Best-effort: never throws. */
export const playBeatSting = () => {
  try {
    const c = getAudioContext();
    // (held back by the browser: dropped, not played late)
    if (c.state !== 'running') return;
    const t0 = c.currentTime + 0.01;
    const made: AudioNode[] = [];
    const keep = <T extends AudioNode>(n: T) => { made.push(n); return n; };
    // Out: the dry, plus a short dark echo for the tail
    const out = keep(c.createGain()); out.gain.value = LEVEL;
    out.connect(mixOut(c, 'sfx'));
    const echoIn = keep(c.createGain()); echoIn.gain.value = 0.35;
    const dl = keep(c.createDelay(0.5)); dl.delayTime.value = 0.13;
    const fb = keep(c.createGain()); fb.gain.value = 0.42;
    const dark = keep(c.createBiquadFilter()); dark.type = 'lowpass'; dark.frequency.value = 1300;
    echoIn.connect(dl); dl.connect(dark); dark.connect(fb); fb.connect(dl); dark.connect(out);
    const send = (n: AudioNode) => { n.connect(out); n.connect(echoIn); };

    for (const h of HITS) {
      const at = t0 + h.at, end = at + h.dur;
      // A brassy low stab: detuned saws through a lowpass that closes as it rings
      const lp = keep(c.createBiquadFilter()); lp.type = 'lowpass'; lp.Q.value = 3;
      lp.frequency.setValueAtTime(h.big ? 1500 : 1000, at);
      lp.frequency.exponentialRampToValueAtTime(h.big ? 220 : 260, end);
      const env = keep(c.createGain());
      env.gain.setValueAtTime(0.0001, at);
      env.gain.exponentialRampToValueAtTime(h.big ? 0.75 : 0.6, at + 0.008);
      env.gain.setValueAtTime(h.big ? 0.75 : 0.6, at + (h.big ? 0.12 : 0.04));
      env.gain.exponentialRampToValueAtTime(0.001, end);
      lp.connect(env); send(env);
      const per = 0.11 / Math.sqrt(h.notes.length);
      for (const f of h.notes) for (const det of [-9, 9]) {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        const g = keep(c.createGain()); g.gain.value = per;
        o.connect(g); g.connect(lp); o.start(at); o.stop(end + 0.02);
      }
      // A thump under each (the big one: a boom)
      const s = c.createOscillator(); s.type = 'sine';
      s.frequency.setValueAtTime(h.big ? 120 : 95, at); s.frequency.exponentialRampToValueAtTime(h.big ? 34 : 45, at + (h.big ? 0.5 : 0.13));
      const sg = keep(c.createGain());
      sg.gain.setValueAtTime(h.big ? 0.7 : 0.45, at); sg.gain.exponentialRampToValueAtTime(0.001, at + (h.big ? 0.55 : 0.15));
      s.connect(sg); sg.connect(out); s.start(at); s.stop(at + (h.big ? 0.56 : 0.16));
      if (!h.big) continue;
      // The big one's hit: a noise crash, falling dark
      const nz = c.createBufferSource(); nz.buffer = noiseFor(c);
      const nf = keep(c.createBiquadFilter()); nf.type = 'lowpass';
      nf.frequency.setValueAtTime(2600, at); nf.frequency.exponentialRampToValueAtTime(120, at + 0.35);
      const ng = keep(c.createGain()); ng.gain.setValueAtTime(0.28, at); ng.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
      nz.connect(nf); nf.connect(ng); send(ng); nz.start(at); nz.stop(at + 0.4);
      // ...and a gong: inharmonic partials, the high ones dying first
      [1, 1.47, 2.09, 2.56, 3.18].forEach((m, i) => {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 146.8 * m;
        const g = keep(c.createGain()), len = 0.6 - i * 0.08;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.07 / (1 + i * 0.4), at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.001, at + len);
        o.connect(g); send(g); o.start(at); o.stop(at + len + 0.02);
      });
    }
    // (the graph let go of once the tail's died away)
    setTimeout(() => { for (const n of made) { try { n.disconnect(); } catch { /* gone */ } } }, 2500);
  } catch { /* audio is best-effort; never let it break the game loop */ }
};
