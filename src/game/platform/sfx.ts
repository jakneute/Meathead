// The sound effects, made the way the music's instruments are: each one's rendered once (the first time it's wanted,
// or in the background before then) into a short sample at a lowish rate (a little SNES grit), then played from that,
// a touch higher or lower each time so a gun fired twenty times doesn't sound like a tape loop. Every one's a
// designed sound (a pistol crack with a body under it, a wet splat, a metal clang, an explosion with its debris),
// all run through a common bus with a short room on it. A sound played again too soon after itself, or with too
// many of itself still going, is dropped (so a machine gun doesn't turn into white noise).

export const SFX_SR = 32000;
const TAU = Math.PI * 2;
const rnd = () => Math.random() * 2 - 1;
const ex = (t: number, k: number) => Math.exp(-t * k);

/** Samples of `len` seconds from `f(t, i)`, normalized, with a short fade at the end. */
const render = (len: number, f: (t: number, i: number) => number) => {
  const n = Math.max(1, Math.round(len * SFX_SR));
  const d = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = f(i / SFX_SR, i); d[i] = v; if (Math.abs(v) > peak) peak = Math.abs(v); }
  const fade = Math.min(n, Math.round(0.015 * SFX_SR));
  for (let i = 0; i < n; i++) d[i] = (d[i] / (peak || 1)) * (i > n - fade ? (n - i) / fade : 1);
  return d;
};

/** A one-pole low-pass (its cutoff can move: pass it each sample). */
const lowpass = () => { let y = 0; return (x: number, hz: number) => { const a = 1 - Math.exp(-TAU * Math.max(10, hz) / SFX_SR); y += a * (x - y); return y; }; };
/** A one-pole high-pass. */
const highpass = () => { const lp = lowpass(); return (x: number, hz: number) => x - lp(x, hz); };
/** A band-pass (state-variable), q about 0.3 (wide) to 4 (narrow). */
const bandpass = () => { let low = 0, band = 0; return (x: number, hz: number, q = 1) => { const f = 2 * Math.sin(Math.PI * Math.min(0.24, hz / SFX_SR)); const high = x - low - band / q; band += f * high; low += f * band; return band; }; };
/** A sine whose frequency glides from a to b with rate k (exponentially). */
const glide = (a: number, b: number, k: number) => { let ph = 0; return (t: number) => { ph += (b + (a - b) * ex(t, k)) / SFX_SR; return Math.sin(TAU * ph); }; };
/** Metal: inharmonic partials, each dying at its own rate. */
const metal = (f: number, ratios: number[], decay: number) => (t: number) => ratios.reduce((v, r, k) => v + Math.sin(TAU * f * r * t + k) * ex(t, decay * (1 + k * 0.6)) / (1 + k * 0.5), 0);
/** Sparse random crackles (grit, debris, fire). */
const crackle = (density: number) => () => (Math.random() < density ? rnd() : 0);

interface SfxDef {
  make: () => Float32Array;
  gain: number;
  /** Random pitch either way (semitones). */
  vary?: number;
  /** Not again within this long (ms), and not with this many of itself already going. */
  gap?: number;
  voices?: number;
}

/** Every sound effect there is. */
const SFX: Record<string, SfxDef> = {
  // ---- Guns and weapons ----
  gun: {
    gain: 0.5, vary: 1.2, gap: 30, voices: 4,
    make: () => { const bp = bandpass(), lp = lowpass(), body = glide(190, 55, 30); return render(0.28, t => (t < 0.003 ? rnd() : 0) * 0.8 + bp(rnd(), 3200 - 2600 * (1 - ex(t, 30)), 0.8) * ex(t, 32) * 1.3 + body(t) * ex(t, 22) * 0.9 + lp(rnd(), 1400) * ex(t, 10) * 0.6); },
  },
  lmg: {
    gain: 0.42, vary: 1.5, gap: 25, voices: 5,
    make: () => { const bp = bandpass(), lp = lowpass(), body = glide(150, 45, 34); return render(0.18, t => (t < 0.003 ? rnd() : 0) + bp(rnd(), 2400, 0.7) * ex(t, 40) * 1.2 + body(t) * ex(t, 26) + lp(rnd(), 900) * ex(t, 16) * 0.7); },
  },
  ice: {
    // The ice shotgun: a boom, and ice going everywhere (bright, glassy)
    gain: 0.5, vary: 1, gap: 60, voices: 3,
    make: () => { const lp = lowpass(); const shards = Array.from({ length: 9 }, () => [2200 + Math.random() * 4200, 8 + Math.random() * 10]); return render(0.7, t => lp(rnd(), 2600 * ex(t, 6) + 250) * ex(t, 9) * 1.4 + shards.reduce((v, [f, k]) => v + Math.sin(TAU * f * t) * ex(t, k), 0) * 0.16 * (t > 0.01 ? 1 : 0)); },
  },
  flame: {
    gain: 0.3, vary: 2, gap: 40, voices: 3,
    make: () => { const bp = bandpass(), c = crackle(0.02); return render(0.22, t => (bp(rnd(), 700 + 400 * Math.sin(t * 40), 0.5) * 0.9 + c() * 0.8) * Math.sin(Math.PI * Math.min(1, t / 0.22))); },
  },
  ignite: {
    // Whoomp: fire catching all at once
    gain: 0.6, vary: 1, gap: 80,
    make: () => { const lp = lowpass(), sub = glide(90, 40, 6), c = crackle(0.03); return render(0.9, t => lp(rnd(), 200 + 3200 * Math.min(1, t / 0.12) * ex(Math.max(0, t - 0.12), 3)) * (Math.min(1, t / 0.05)) * ex(t, 3.2) * 1.2 + sub(t) * ex(t, 6) * 0.8 + c() * ex(t, 4) * 0.6); },
  },
  barf: {
    // A big wet heave of the stuff
    gain: 0.55, vary: 1.5, gap: 90,
    make: () => { const bp = bandpass(), lp = lowpass(); let ph = 0; return render(0.55, t => { ph += (160 * ex(t, 3) + 70) / SFX_SR; const gurgle = 0.6 + 0.4 * Math.sin(TAU * 28 * t); return (bp(rnd(), 500 + 300 * Math.sin(TAU * 7 * t), 0.7) * 1.1 + lp(Math.sign(Math.sin(TAU * ph)), 700) * 0.7) * gurgle * Math.min(1, t / 0.03) * ex(t, 4.5); }); },
  },
  oil: {
    // The oil rocket going: a hollow thoomp and a hiss
    gain: 0.5, vary: 1, gap: 80,
    make: () => { const hp = highpass(), sub = glide(110, 45, 10); return render(0.6, t => sub(t) * ex(t, 7) * 1.1 + hp(rnd(), 2500) * ex(t, 6) * 0.5 * Math.min(1, t / 0.04)); },
  },
  dart: {
    gain: 0.35, vary: 2, gap: 40, voices: 3,
    make: () => { const bp = bandpass(); return render(0.09, t => bp(rnd(), 2600, 1.5) * ex(t, 45) + (t < 0.002 ? rnd() * 0.5 : 0) + Math.sin(TAU * 1800 * t) * ex(t, 80) * 0.3); },
  },
  taser: {
    gain: 0.3, vary: 1, gap: 45, voices: 2,
    make: () => { const bp = bandpass(); return render(0.13, t => bp(Math.sign(Math.sin(TAU * 118 * t)) * (0.6 + 0.4 * rnd()) + (Math.random() < 0.08 ? rnd() * 2 : 0), 1800, 0.6) * Math.min(1, t / 0.005)); },
  },
  tsunami: {
    // A wall of water: a swell, the crash, and it all draining away
    gain: 0.7, vary: 0.5, gap: 300,
    make: () => { const lp = lowpass(), lp2 = lowpass(); return render(2.2, t => lp(rnd(), 3200 * ex(Math.max(0, t - 0.25), 1.6) + 250) * Math.min(1, t / 0.2) * ex(Math.max(0, t - 0.2), 1.3) * 1.2 + lp2(rnd(), 120) * ex(t, 1) * 2); },
  },
  click: {
    gain: 0.35, vary: 1, gap: 40,
    make: () => render(0.05, t => (Math.sin(TAU * 3200 * t) * 0.6 + rnd() * 0.4) * ex(t, 120) + (t > 0.018 && t < 0.024 ? rnd() * 0.5 : 0)),
  },
  // ---- Bodies ----
  punch: {
    gain: 0.6, vary: 2, gap: 35, voices: 3,
    make: () => { const lp = lowpass(), body = glide(160, 55, 25); return render(0.22, t => body(t) * ex(t, 18) + lp(rnd(), 2200 * ex(t, 20) + 200) * ex(t, 30) * 1.2 + (t < 0.002 ? rnd() : 0)); },
  },
  stomp: {
    gain: 0.65, vary: 2, gap: 40,
    make: () => { const lp = lowpass(), body = glide(130, 40, 16), bp = bandpass(); return render(0.32, t => body(t) * ex(t, 12) * 1.2 + lp(rnd(), 1500 * ex(t, 14) + 150) * ex(t, 16) + bp(rnd(), 900, 0.8) * ex(t, 35) * 0.6); },
  },
  splat: {
    gain: 0.5, vary: 2.5, gap: 45, voices: 3,
    make: () => { const bp = bandpass(), body = glide(110, 50, 20); return render(0.32, t => bp(rnd(), 650 + 500 * ex(t, 20), 0.6) * ex(t, 14) * 1.2 * (0.7 + 0.3 * Math.sin(TAU * 60 * t)) + body(t) * ex(t, 22) * 0.6); },
  },
  crunch: {
    gain: 0.6, vary: 1.5, gap: 60,
    make: () => { const bp = bandpass(), body = glide(120, 40, 14); return render(0.4, t => bp(rnd(), 1100, 0.5) * (Math.random() < 0.35 ? 1.5 : 0.2) * ex(t, 9) + body(t) * ex(t, 10) * 0.9); },
  },
  hurt: {
    // Meathead taking one: an "oof" of an impact
    gain: 0.55, vary: 1.5, gap: 120,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(0.28, t => { ph += (240 * ex(t, 8) + 110) / SFX_SR; return lp(Math.sign(Math.sin(TAU * ph)), 900) * ex(t, 10) * 0.7 + bp(rnd(), 1400, 0.8) * ex(t, 30) * 0.8; }); },
  },
  whoosh: {
    gain: 0.35, vary: 2, gap: 80,
    make: () => { const bp = bandpass(); return render(0.28, t => bp(rnd(), 400 + 2600 * (t / 0.28), 1.2) * Math.sin(Math.PI * Math.min(1, t / 0.28))); },
  },
  jump: {
    gain: 0.18, vary: 1.5, gap: 90,
    make: () => { const bp = bandpass(); return render(0.12, t => bp(rnd(), 500 + 1800 * (t / 0.12), 1) * Math.sin(Math.PI * t / 0.12)); },
  },
  land: {
    gain: 0.3, vary: 2, gap: 100,
    make: () => { const lp = lowpass(); return render(0.14, t => lp(rnd(), 700 * ex(t, 25) + 100) * ex(t, 22) * 1.5 + Math.sin(TAU * 80 * t) * ex(t, 30)); },
  },
  thud: {
    gain: 0.5, vary: 2, gap: 70,
    make: () => { const lp = lowpass(), body = glide(95, 38, 12); return render(0.3, t => body(t) * ex(t, 11) * 1.1 + lp(rnd(), 600) * ex(t, 18) * 0.6); },
  },
  slam: {
    // Something very heavy hitting the ground (him, out of the sky)
    gain: 0.8, vary: 1, gap: 150,
    make: () => { const lp = lowpass(), body = glide(110, 30, 7), c = crackle(0.02); return render(1.1, t => body(t) * ex(t, 4) * 1.3 + lp(rnd(), 1800 * ex(t, 6) + 120) * ex(t, 5) + c() * ex(t, 3) * 0.7); },
  },
  // ---- Things breaking ----
  clang: {
    gain: 0.4, vary: 1.5, gap: 50, voices: 3,
    make: () => { const m = metal(420, [1, 2.71, 5.1, 8.3, 11.9], 5); return render(0.7, t => m(t) + (t < 0.004 ? rnd() * 1.5 : 0)); },
  },
  clink: {
    gain: 0.3, vary: 3, gap: 40, voices: 3,
    make: () => { const m = metal(1800, [1, 2.4, 4.1], 18); return render(0.2, t => m(t) + (t < 0.002 ? rnd() : 0)); },
  },
  crack: {
    gain: 0.5, vary: 2, gap: 60,
    make: () => { const hp = highpass(), c = crackle(0.05); return render(0.35, t => hp(rnd(), 1500) * ex(t, 40) * 1.2 + c() * ex(t, 8) + Math.sin(TAU * 240 * t) * ex(t, 25) * 0.5); },
  },
  glass: {
    gain: 0.4, vary: 1.5, gap: 60, voices: 3,
    make: () => { const hp = highpass(); const pings = Array.from({ length: 16 }, () => [2600 + Math.random() * 6000, Math.random() * 0.2, 12 + Math.random() * 20]); return render(0.7, t => hp(rnd(), 3000) * ex(t, 18) * 0.9 + pings.reduce((v, [f, at, k]) => v + (t > at ? Math.sin(TAU * f * (t - at)) * ex(t - at, k) : 0), 0) * 0.2); },
  },
  crash: {
    // A vehicle (or anything big) smashing into something: metal crumpling, glass, bits coming down
    gain: 0.7, vary: 1, gap: 150,
    make: () => { const lp = lowpass(), m = metal(180, [1, 2.3, 3.9, 6.1], 4), c = crackle(0.06); const pings = Array.from({ length: 10 }, () => [3000 + Math.random() * 5000, 0.1 + Math.random() * 0.5]); return render(1.3, t => lp(rnd(), 2500 * ex(t, 5) + 150) * ex(t, 4) * 1.2 + m(t) * 0.8 + c() * ex(t, 2.5) * 0.8 + pings.reduce((v, [f, at]) => v + (t > at ? Math.sin(TAU * f * (t - at)) * ex(t - at, 25) : 0), 0) * 0.15); },
  },
  boom: {
    // An explosion (a barrel, a car, a truck)
    gain: 0.75, vary: 1.5, gap: 120, voices: 3,
    make: () => { const lp = lowpass(), lp2 = lowpass(), sub = glide(80, 28, 4), c = crackle(0.04); return render(1.6, t => (t < 0.004 ? rnd() * 1.5 : 0) + lp(rnd(), 3200 * ex(t, 4) + 90) * ex(t, 2.8) * 1.3 + sub(t) * ex(t, 3) * 1.1 + c() * ex(t, 2) * 0.6 + lp2(rnd(), 200) * ex(t, 1.5) * 0.8); },
  },
  nuke: {
    // Everything going up at once
    gain: 0.85, vary: 0.8, gap: 250, voices: 2,
    make: () => { const lp = lowpass(), lp2 = lowpass(), sub = glide(70, 22, 1.6), c = crackle(0.05); return render(3.2, t => (t < 0.006 ? rnd() * 2 : 0) + lp(rnd(), 3000 * ex(t, 1.6) + 70) * ex(t, 1.2) * 1.3 + sub(t) * ex(t, 1.1) * 1.2 + c() * ex(t, 1.2) * 0.6 + lp2(rnd(), 120) * ex(t, 0.8) * 1.2); },
  },
  // ---- Water ----
  splash: {
    gain: 0.5, vary: 2, gap: 80,
    make: () => { const bp = bandpass(), lp = lowpass(); const drops = Array.from({ length: 8 }, () => [900 + Math.random() * 1800, 0.05 + Math.random() * 0.4]); return render(0.8, t => bp(rnd(), 1500 * ex(t, 3) + 400, 0.5) * ex(t, 5) * 1.2 + lp(rnd(), 300) * ex(t, 8) + drops.reduce((v, [f, at]) => v + (t > at ? Math.sin(TAU * f * (t - at) * (1 + (t - at) * 6)) * ex(t - at, 30) : 0), 0) * 0.25); },
  },
  glug: {
    gain: 0.4, vary: 2, gap: 200,
    make: () => render(0.8, t => { const k = Math.floor(t / 0.13), u = t - k * 0.13; return Math.sin(TAU * (180 + k * 30) * u * (1 + u * 8)) * ex(u, 25); }),
  },
  tinkle: {
    gain: 0.18, vary: 4, gap: 30, voices: 4,
    make: () => render(0.08, t => Math.sin(TAU * (1500 + 1800 * Math.min(1, t / 0.04)) * t) * ex(t, 40)),
  },
  // ---- Signals, machines, the world ----
  // The menus' cursor: a short punchy CHUNK (a square blip falling an octave, a click on the front of it, a thump under it)
  cursor: {
    gain: 0.3, vary: 0.5, gap: 25,
    make: () => render(0.07, t => {
      const f = 1500 * Math.pow(0.5, t / 0.03);
      const sq = Math.sign(Math.sin(TAU * f * t)) * 0.45 * ex(t, 55);
      const thump = Math.sin(TAU * 110 * t) * 0.7 * ex(t, 70);
      return sq + thump + (t < 0.003 ? rnd() * 0.8 : 0);
    }),
  },
  // ...and the menus' OK (the same chunk, rising, with a bright tick on top) and BACK (falling, duller, a soft thud)
  menuok: {
    gain: 0.32, gap: 40,
    make: () => render(0.11, t => {
      const f = 700 * Math.pow(2, Math.min(t, 0.04) / 0.04);
      const sq = Math.sign(Math.sin(TAU * f * t)) * 0.4 * ex(t, 30);
      const tick = t > 0.035 && t < 0.075 ? Math.sin(TAU * 2100 * t) * 0.35 * ex(t - 0.035, 50) : 0;
      return sq + tick + Math.sin(TAU * 120 * t) * 0.7 * ex(t, 45) + (t < 0.003 ? rnd() * 0.8 : 0);
    }),
  },
  menuback: {
    gain: 0.3, gap: 40,
    make: () => { const lp = lowpass(); return render(0.12, t => {
      const f = 900 * Math.pow(0.4, t / 0.08);
      return lp(Math.sign(Math.sin(TAU * f * t)) * 0.5, 2400) * ex(t, 28) + Math.sin(TAU * 85 * t) * 0.8 * ex(t, 40);
    }); },
  },
  beep: {
    gain: 0.22, gap: 150,
    make: () => render(0.09, t => (Math.sign(Math.sin(TAU * 1046 * t)) * 0.5 + Math.sin(TAU * 1046 * t) * 0.5) * (t < 0.08 ? 1 : 0)),
  },
  alert: {
    gain: 0.25, gap: 300,
    make: () => render(0.32, t => (t < 0.12 ? Math.sin(TAU * 880 * t) : t > 0.16 && t < 0.3 ? Math.sin(TAU * 1175 * t) : 0) * (0.7 + 0.3 * Math.sign(Math.sin(TAU * 880 * t)))),
  },
  ding: {
    gain: 0.3, gap: 300,
    make: () => { const m = metal(1318, [1, 2.0, 3.01, 4.2], 1.5); return render(1.3, t => m(t)); },
  },
  pickup: {
    gain: 0.3, gap: 60,
    make: () => render(0.28, t => { const f = t < 0.07 ? 1046 : 1568; return (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)) * ex(t < 0.07 ? t : t - 0.07, 9); }),
  },
  reload: {
    gain: 0.35, gap: 60,
    make: () => { const m1 = metal(900, [1, 2.2, 3.7], 30), m2 = metal(620, [1, 2.5, 4.2], 22); return render(0.3, t => m1(t) * (t < 0.1 ? 1 : 0) + (t > 0.12 ? m2(t - 0.12) : 0) + (t < 0.003 || (t > 0.12 && t < 0.125) ? rnd() : 0)); },
  },
  powerup: {
    gain: 0.3, gap: 300,
    make: () => render(0.6, t => { const k = Math.min(3, Math.floor(t / 0.09)); const f = [523, 659, 784, 1046][k]; const u = t - k * 0.09; return (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2 * t)) * ex(u, k === 3 ? 4 : 12); }),
  },
  alarm: {
    gain: 0.3, gap: 400,
    make: () => { const lp = lowpass(); return render(0.9, t => lp(Math.sign(Math.sin(TAU * (Math.floor(t / 0.22) % 2 ? 620 : 830) * t)), 3000) * (t % 0.22 < 0.19 ? 1 : 0)); },
  },
  siren: {
    gain: 0.22, gap: 1500,
    make: () => { let ph = 0; return render(3.2, t => { ph += (800 + 180 * Math.sin(TAU * t / 0.8 - Math.PI / 2)) / SFX_SR; return (Math.sin(TAU * ph) * 0.6 + Math.sign(Math.sin(TAU * ph)) * 0.25) * Math.min(1, t / 0.3) * Math.min(1, (3.2 - t) / 0.6); }); },
  },
  horn: {
    // A car horn
    gain: 0.3, vary: 0.5, gap: 200,
    make: () => { const lp = lowpass(); return render(0.55, t => lp(Math.sign(Math.sin(TAU * 415 * t)) + Math.sign(Math.sin(TAU * 523 * t)), 2400) * Math.min(1, t / 0.01) * (t < 0.48 ? 1 : 0)); },
  },
  truckhorn: {
    // A semi's air horn: big, low, two notes
    gain: 0.35, gap: 300,
    make: () => { const lp = lowpass(); let a = 0, b2 = 0; return render(1.0, t => { a += 220 / SFX_SR; b2 += 277 / SFX_SR; return lp(((a % 1) * 2 - 1) + ((b2 % 1) * 2 - 1), 1600) * Math.min(1, t / 0.02) * (t < 0.9 ? 1 : (1 - t) * 10); }); },
  },
  engine: {
    // A motorcycle opening up
    gain: 0.45, gap: 300,
    make: () => { const lp = lowpass(); let ph = 0; return render(1.0, t => { ph += (55 + 90 * Math.min(1, t / 0.5)) / SFX_SR; return lp(((ph % 1) * 2 - 1) * (0.6 + 0.4 * Math.sign(Math.sin(TAU * ph * 0.5))) + rnd() * 0.2, 1200) * Math.min(1, t / 0.05) * (1 - t * 0.4); }); },
  },
  fart: {
    // A long, wet one: a buzzing low reed that wobbles and sags in pitch, flapping, then sputtering out in bursts
    gain: 0.7, vary: 0.6, gap: 400, voices: 1,
    make: () => {
      const lp = lowpass(), bp = bandpass(), wet = crackle(0.08);
      let ph = 0;
      return render(1.5, t => {
        const f = 104 + 22 * Math.sin(t * 6.3) + 9 * Math.sin(t * 23) - 34 * t;
        ph += f / SFX_SR;
        const reed = Math.tanh(5 * Math.sin(TAU * ph)) * (0.65 + 0.35 * Math.sin(TAU * 13 * t));
        // (the sputter at the end: it cuts in and out)
        const gate = t < 1.0 ? 1 : (Math.sin(TAU * (9 + (t - 1) * 14) * t) > 0.1 ? 1 : 0.08);
        const env = Math.min(1, t / 0.02) * (t < 1.25 ? 1 : Math.max(0, 1 - (t - 1.25) / 0.25));
        return lp(reed * 0.9 + bp(rnd(), 420, 1.4) * 0.35 + wet() * 0.5, 1300) * env * gate;
      });
    },
  },
  poopflight: {
    // A log of it flying: a wet, flapping whoosh (a sodden rag in a gale), something squelching and burbling in it,
    // drips coming off it
    gain: 0.55, vary: 1.2, gap: 250, voices: 3,
    make: () => {
      const bp = bandpass(), lp = lowpass(), wet = crackle(0.05);
      let ph = 0;
      return render(1.0, t => {
        const swell = Math.min(1, t / 0.25) * Math.max(0, 1 - Math.max(0, t - 0.7) / 0.3);
        const flap = 0.55 + 0.45 * Math.sin(TAU * (19 + 6 * Math.sin(t * 4)) * t);
        const whoosh = bp(rnd(), 500 + 900 * Math.sin(Math.PI * Math.min(1, t)), 0.7) * flap;
        ph += (62 + 18 * Math.sin(t * 17) + 9 * Math.sin(t * 41)) / SFX_SR;
        const burble = Math.tanh(4 * Math.sin(TAU * ph)) * (0.5 + 0.5 * Math.sin(TAU * 7 * t)) * 0.45;
        return lp(whoosh * 1.3 + burble + wet() * 0.6, 1700) * swell;
      });
    },
  },
  poopsplat: {
    // It hitting the vortex: a big, thick, wet SPLAT (a low slap, a squelch tearing down through it), then it going
    // everywhere: gloopy plops falling, a slurp, a last drip
    gain: 0.8, vary: 0.8, gap: 120, voices: 3,
    make: () => {
      const bp = bandpass(), lp = lowpass(), slap = glide(150, 40, 18);
      const plops = Array.from({ length: 7 }, (_, k) => ({ at: 0.12 + k * 0.1 + Math.random() * 0.05, f: 300 + Math.random() * 400 }));
      return render(1.3, t => {
        const hit = (t < 0.004 ? rnd() : 0) + slap(t) * ex(t, 14) * 1.2;
        const squelch = bp(rnd(), 1800 * ex(t, 9) + 220, 1.2) * ex(t, 7) * 1.4;
        let gloop = 0;
        for (const p of plops) { const u = t - p.at; if (u > 0 && u < 0.09) gloop += Math.sin(TAU * (p.f * ex(u, 25) + 120) * u) * ex(u, 40) * 0.5; }
        const slurp = t > 0.75 ? bp(rnd(), 900 - 500 * (t - 0.75), 3) * Math.max(0, Math.sin(Math.PI * (t - 0.75) / 0.4)) * 0.6 : 0;
        return lp(hit + squelch + gloop + slurp, 3200);
      });
    },
  },
  rumble: {
    gain: 0.55, gap: 400,
    make: () => { const lp = lowpass(), c = crackle(0.01); return render(1.8, t => lp(rnd(), 140) * 3 * (0.6 + 0.4 * Math.sin(TAU * 7 * t)) * Math.min(1, t / 0.2) * ex(t, 1.2) + c() * ex(t, 1.5) * 0.4); },
  },
  thunder: {
    gain: 0.6, vary: 1, gap: 500,
    make: () => { const hp = highpass(), lp = lowpass(); return render(2.6, t => hp(rnd(), 2500) * ex(t, 30) * 1.2 + lp(rnd(), 1600 * ex(t, 2) + 70) * ex(t, 1.1) * (0.7 + 0.3 * Math.sin(TAU * 3 * t)) * 1.4); },
  },
  roar: {
    gain: 0.5, vary: 1, gap: 400,
    make: () => { const bp = bandpass(); let ph = 0; return render(1.1, t => { ph += (95 + 12 * Math.sin(TAU * 6 * t)) / SFX_SR; return Math.tanh(3 * (((ph % 1) * 2 - 1) + rnd() * 0.3)) * 0.5 + bp(rnd(), 700, 0.6) * 0.5 * Math.min(1, t / 0.08) * ex(t, 1.8); }); },
  },
  bellow: {
    // The moose
    gain: 0.5, gap: 600,
    make: () => { const bp = bandpass(); let ph = 0; return render(1.4, t => { ph += (120 - 30 * t / 1.4 + 4 * Math.sin(TAU * 5 * t)) / SFX_SR; return bp(((ph % 1) * 2 - 1), 380, 1.5) * 1.6 * Math.min(1, t / 0.15) * Math.min(1, (1.4 - t) / 0.3); }); },
  },
  snort: {
    gain: 0.45, gap: 400,
    make: () => { const bp = bandpass(); return render(0.6, t => bp(rnd(), 900 + 900 * (t / 0.6), 2) * Math.min(1, t / 0.1) * (t < 0.5 ? 1 : (0.6 - t) * 10) * 1.3); },
  },
  screams: {
    // Screaming, a long way off
    gain: 0.4, gap: 1500,
    make: () => {
      const lp = lowpass();
      const voices = Array.from({ length: 7 }, () => ({ at: Math.random() * 1.2, dur: 0.9 + Math.random() * 0.8, base: 420 + Math.random() * 420, vib: 6 + Math.random() * 3, ph: 0, form: bandpass() }));
      return render(2.6, t => lp(voices.reduce((v, s) => {
        const u = t - s.at;
        if (u < 0 || u > s.dur) return v;
        const f = s.base * (u < s.dur * 0.3 ? 0.8 + 0.55 * (u / (s.dur * 0.3)) : 1.35 - 0.65 * ((u - s.dur * 0.3) / (s.dur * 0.7))) * (1 + 0.05 * Math.sin(TAU * s.vib * u));
        s.ph += f / SFX_SR;
        return v + s.form(((s.ph % 1) * 2 - 1), 1000, 1.5) * Math.min(1, u / 0.1) * (1 - u / s.dur);
      }, 0), 700));
    },
  },
};

/** Their guns (the same crack, further off: quieter, and it doesn't crowd his own out). */
SFX.egun = { ...SFX.gun, gain: 0.28, gap: 50, voices: 3 };

// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
const buffers: Record<string, AudioBuffer> = {};
const lastAt: Record<string, number> = {};
const playing: Record<string, number> = {};

/** The bus (a touch of SNES softness, and a short room), in the context the rest of the audio uses. */
const busFor = (c: AudioContext) => {
  if (ctx === c && bus) return bus;
  ctx = c;
  for (const k of Object.keys(buffers)) delete buffers[k];
  bus = c.createGain(); bus.gain.value = 1;
  const soft = c.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 12000;
  // (a lot going off at once gets held in, rather than clipping)
  const limit = c.createDynamicsCompressor(); limit.threshold.value = -10; limit.ratio.value = 6; limit.attack.value = 0.003; limit.release.value = 0.2;
  bus.connect(soft); soft.connect(limit); limit.connect(c.destination);
  const send = c.createGain(); send.gain.value = 0.14;
  const room = c.createDelay(0.5); room.delayTime.value = 0.07;
  const fb = c.createGain(); fb.gain.value = 0.25;
  const dark = c.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 3000;
  limit.connect(send); send.connect(room); room.connect(dark); dark.connect(fb); fb.connect(room); dark.connect(c.destination);
  return bus;
};

const bufferOf = (c: AudioContext, name: string) => {
  let b = buffers[name];
  if (!b) { const d = SFX[name].make(); b = c.createBuffer(1, d.length, SFX_SR); b.getChannelData(0).set(d); buffers[name] = b; }
  return b;
};

/** Plays a sound effect (`vol` a multiplier, `pitch` in semitones). Dropped if it's playing too much already. */
export const playSfx = (c: AudioContext, name: string, vol = 1, pitch = 0) => {
  const def = SFX[name];
  if (!def) return;
  const now = performance.now();
  if (def.gap && now - (lastAt[name] ?? -1e9) < def.gap) return;
  if ((playing[name] ?? 0) >= (def.voices ?? 2)) return;
  lastAt[name] = now;
  const out = busFor(c);
  const src = c.createBufferSource();
  src.buffer = bufferOf(c, name);
  src.playbackRate.value = Math.pow(2, (pitch + (def.vary ? (Math.random() * 2 - 1) * def.vary : 0)) / 12);
  const g = c.createGain(); g.gain.value = def.gain * vol;
  src.connect(g); g.connect(out);
  playing[name] = (playing[name] ?? 0) + 1;
  src.onended = () => { playing[name] = Math.max(0, (playing[name] ?? 1) - 1); try { g.disconnect(); } catch { /* fine */ } };
  src.start();
};

/** Makes every sound's sample ahead of time, a few at a time (so none of them hitches the first time). */
export const warmSfx = (c: AudioContext) => {
  const names = Object.keys(SFX);
  const next = () => { const n = names.shift(); if (!n || c.state === 'closed') return; busFor(c); bufferOf(c, n); setTimeout(next, 20); };
  next();
};

/** Every sound effect's name (for checking them all). */
export const SFX_NAMES = () => Object.keys(SFX);
