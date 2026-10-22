// The sound effects, made the way the music's instruments are: each one's rendered once (the first time it's wanted,
// or in the background before then) into a short sample at a lowish rate (a little SNES grit), then played from that,
// a touch higher or lower each time so a gun fired twenty times doesn't sound like a tape loop. Every one's a
// designed sound (a pistol crack with a body under it, a wet splat, a metal clang, an explosion with its debris),
// all run through a common bus with a short room on it. A sound played again too soon after itself, or with too
// many of itself still going, is dropped (so a machine gun doesn't turn into white noise).

import { mixOut } from './mixer';
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
  alienCharge: {
    // The alien's ray gun winding up: a soft wobbling saucer whine climbing, a low hum growing under it (kept mellow:
    // it's heard a lot)
    gain: 0.18, vary: 0.4, gap: 300,
    make: () => { const lp = lowpass(); let ph = 0, ph2 = 0; return render(0.9, t => { const f = 200 + 480 * t * t + 18 * Math.sin(TAU * 7 * t); ph += f / SFX_SR; ph2 += (f * 0.5) / SFX_SR; return (Math.sin(TAU * ph) * 0.7 + lp(Math.sign(Math.sin(TAU * ph2)), 500 + 500 * t) * 0.22 * t) * Math.min(1, t / 0.08) * Math.min(1, (0.9 - t) / 0.12); }); },
  },
  alienBeam: {
    // The beam going: a fat buzzing roar with a hum through it (played over and over while it runs)
    gain: 0.34, vary: 0.6, gap: 160, voices: 2,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(0.32, t => { ph += (95 + 6 * Math.sin(TAU * 31 * t)) / SFX_SR; return (lp(Math.sign(Math.sin(TAU * ph)) + rnd() * 0.3, 1800) * 0.9 + bp(rnd(), 2600, 1.2) * 0.4) * Math.min(1, t / 0.01); }); },
  },
  raygun: {
    // Meathead 2's ray gun: a short soft zip, down from high (no buzz to it, no tail: it goes off a lot)
    gain: 0.16, vary: 1, gap: 40,
    make: () => { let ph = 0; return render(0.11, t => { ph += (1500 * ex(t, 30) + 520) / SFX_SR; return Math.sin(TAU * ph) * Math.min(1, t / 0.004) * ex(t, 26); }); },
  },
  hairball: {
    // Meathead 2's cat form spitting a hairball (the ray gun's place): a throaty hack (a rough growl rising), a wet
    // "ptoo" pop out of the mouth at the end (it goes off a lot: short, mid volume)
    gain: 0.3, vary: 1.2, gap: 40,
    make: () => { const bp = bandpass(), lp = lowpass(); let ph = 0; return render(0.2, t => { ph += (95 + 120 * t) / SFX_SR; const hack = t < 0.11 ? (bp(rnd(), 900 + 2400 * t, 0.7) * 0.9 + lp(Math.sign(Math.sin(TAU * ph)), 600) * 0.5) * Math.min(1, t / 0.01) * (0.6 + 0.4 * Math.sin(TAU * 40 * t)) : 0; const pop = t > 0.12 ? Math.sin(TAU * (700 - 2400 * (t - 0.12)) * (t - 0.12)) * ex(t - 0.12, 50) * 1.2 : 0; return hack + pop; }); },
  },
  hairsplat: {
    // ...and it landing: a soft wet slap
    gain: 0.3, vary: 2, gap: 40, voices: 3,
    make: () => { const bp = bandpass(); return render(0.14, t => bp(rnd(), 900 * ex(t, 12) + 300, 0.6) * ex(t, 26) * 1.3 + Math.sin(TAU * 140 * t) * ex(t, 30) * 0.5); },
  },
  poof: {
    // A cartoon puff of smoke (what's killed in the cartoon White House goes up in one): a soft airy burst with a
    // little pop at the front and a twinkle on the tail
    gain: 0.42, vary: 1.5, gap: 50, voices: 3,
    make: () => { const lp = lowpass(); return render(0.45, t => (t < 0.004 ? rnd() * 0.8 : 0) + lp(rnd(), 1800 * ex(t, 10) + 300) * Math.min(1, t / 0.01) * ex(t, 9) * 1.2 + (t > 0.12 ? (Math.sin(TAU * 2350 * t) + Math.sin(TAU * 3140 * t)) * 0.12 * ex(t - 0.12, 9) : 0)); },
  },
  scratch: {
    // Claws raked across somebody (the cat form's beatdown): three quick rips of noise, each swept down
    gain: 0.34, vary: 2, gap: 45, voices: 3,
    make: () => { const bp = bandpass(); return render(0.16, t => { const k = Math.floor(t / 0.05), u = t - k * 0.05; return k < 3 ? bp(rnd(), 4200 - 30000 * u, 1.4) * Math.sin(Math.PI * Math.min(1, u / 0.04)) : 0; }); },
  },
  souvenir: {
    // Meathead 2's souvenir launcher: a hollow pop out of a plastic pipe (a low thump, a puff of air), and the junk in
    // the bag rattling after it (cheap plastic clicks)
    gain: 0.42, vary: 0.8, gap: 80,
    make: () => { const bp = bandpass(); let ph = 0; const clicks = [0.07, 0.11, 0.16, 0.19, 0.24]; return render(0.32, t => { ph += (150 * ex(t, 18) + 70) / SFX_SR; return Math.sin(TAU * ph) * ex(t, 16) * 1.1 + bp(rnd(), 900, 0.8) * ex(t, 40) * 0.7 + clicks.reduce((v, at, k) => v + (t > at && t < at + 0.008 ? rnd() * (0.4 - k * 0.05) : 0), 0); }); },
  },
  suck: {
    // Meathead 2's soul sucker going: a vacuum's roar (filtered rushing air, a motor's hum under it), played back to back
    gain: 0.3, vary: 0.3, gap: 150, voices: 2,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(0.3, t => { ph += (110 + 4 * Math.sin(TAU * 9 * t)) / SFX_SR; return lp(rnd(), 1400) * 0.8 + bp(rnd(), 2600, 1.5) * 0.25 + Math.sign(Math.sin(TAU * ph)) * 0.18; }); },
  },
  grind: {
    // ...and what it gets: the grinder chewing somebody up (crunching, wet)
    gain: 0.55, vary: 0.6, gap: 90,
    make: () => { const lp = lowpass(), lp2 = lowpass(); let ph = 0; return render(0.55, t => { ph += (60 + 30 * Math.sin(TAU * 23 * t)) / SFX_SR; const crunch = (Math.floor(t * 40) % 2 ? rnd() : rnd() * 0.3); return (lp(crunch, 1800) * 0.9 + Math.sin(TAU * ph) * 0.6 + lp2(rnd(), 500) * 0.5) * Math.min(1, t / 0.01) * ex(Math.max(0, t - 0.3), 6); }); },
  },
  gorespray: {
    // ...and the gore bag emptying: a wet hissing gush
    gain: 0.35, vary: 0.4, gap: 120, voices: 2,
    make: () => { const bp = bandpass(), lp = lowpass(); return render(0.25, t => bp(rnd(), 1100 + 300 * Math.sin(TAU * 13 * t), 0.7) * 0.9 + lp(rnd(), 300) * 0.5); },
  },
  dry_gore: {
    // ...and the gore bag with nothing in it: a wet empty splutter (a squelch, a gasp of air, a last little drip)
    gain: 0.45, vary: 0.8, gap: 150,
    make: () => { const bp = bandpass(), lp = lowpass(); let ph = 0; return render(0.4, t => { ph += (90 + 60 * Math.sin(TAU * 31 * t)) / SFX_SR; const sput = Math.floor(t * 28) % 3 === 0 ? 1 : 0.15; return (Math.sign(Math.sin(TAU * ph)) * 0.35 * sput + bp(rnd(), 700, 0.9) * 0.6 * sput) * ex(t, 6) + (t > 0.3 && t < 0.33 ? lp(rnd(), 2500) * 0.5 : 0); }); },
  },
  flintlock: {
    // Meathead 2's laser-guided flintlock: the flint's snap, the pan going whff, then the charge: a big deep boom with
    // a crack on its front and a long rolling tail
    gain: 0.75, vary: 0.4, gap: 200,
    make: () => { const lp = lowpass(), lp2 = lowpass(), bp = bandpass(); return render(1.1, t => (t < 0.012 ? rnd() * 0.6 : 0) + (t > 0.02 && t < 0.07 ? bp(rnd(), 2600, 0.8) * 0.4 : 0) + (t > 0.07 ? (lp(rnd(), 1500 * ex(t - 0.07, 6) + 120) * 1.4 * ex(t - 0.07, 3.2) + (t < 0.085 ? rnd() * 0.9 : 0) + lp2(rnd(), 160) * ex(t - 0.07, 2) * 0.8) : 0)); },
  },
  primed: {
    // ...and ready: the hammer cocked all the way back (a heavy click-clack) and a bright little ring off the steel
    gain: 0.45, vary: 0.2, gap: 120,
    make: () => { let ph = 0; return render(0.4, t => (t < 0.008 ? rnd() * 0.8 : 0) + (t > 0.05 && t < 0.058 ? rnd() * 0.9 : 0) + (t > 0.06 ? (ph += 2350 / SFX_SR, Math.sin(TAU * ph) * 0.5 * ex(t - 0.06, 9)) : 0)); },
  },
  spell: {
    // Meathead 2's spellbook read out: a rising shimmer of bells over a low choir-ish hum, a whoosh up into it
    gain: 0.4, vary: 0.4, gap: 200,
    make: () => { const lp = lowpass(); let a = 0, b = 0, c = 0; return render(0.9, t => { a += (520 + 900 * t) / SFX_SR; b += (780 + 1300 * t) / SFX_SR; c += 110 / SFX_SR; return (Math.sin(TAU * a) * 0.35 + Math.sin(TAU * b) * 0.25 * (Math.floor(t * 24) % 2) + Math.sin(TAU * c) * 0.3 + lp(rnd(), 900 + 2400 * t) * 0.3) * Math.min(1, t / 0.05) * ex(Math.max(0, t - 0.4), 5); }); },
  },
  bolt: {
    // ...its lightning: a split-second crack right on top of you, then the thunder rolling off low
    gain: 0.6, vary: 0.5, gap: 90, voices: 2,
    make: () => { const lp = lowpass(), lp2 = lowpass(); return render(1.0, t => (t < 0.03 ? rnd() * (1 - t / 0.03) : 0) + lp(rnd(), 2200 * ex(t, 9) + 90) * 1.3 * ex(t, 2.6) + lp2(rnd(), 70) * Math.min(1, t / 0.1) * ex(t, 2) * 1.2); },
  },
  clap: {
    // Meathead 2's clapperboard: the sticks snapping shut, a sharp wooden clack
    gain: 0.6, vary: 0.4, gap: 100,
    make: () => { const bp = bandpass(); return render(0.12, t => (bp(rnd(), 1800, 1.2) * 1.4 + rnd() * 0.5) * ex(t, 60)); },
  },
  carroar: {
    // ...and the stunt car: an engine screaming up through the gears, coming in from nowhere, tires squealing
    gain: 0.5, vary: 0.3, gap: 300,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(1.6, t => { const gear = (t * 3) % 1; ph += (60 + 140 * gear + 40 * t) / SFX_SR; return (lp(Math.sign(Math.sin(TAU * ph)) + rnd() * 0.2, 1800) * 0.7 + bp(rnd(), 3200, 6) * 0.25 * Math.min(1, t / 0.4)) * Math.min(1, t / 0.15) * ex(Math.max(0, t - 1.1), 6); }); },
  },
  bonk: {
    // Meathead 2's mallet of pain: a big hollow cartoon BONK (a wooden knock with a pitch drop) and a spring after it
    gain: 0.6, vary: 0.6, gap: 60,
    make: () => { let a = 0, b = 0; return render(0.45, t => { a += (420 * ex(t, 14) + 120) / SFX_SR; b += (300 + 250 * Math.sin(TAU * 18 * t)) / SFX_SR; return Math.sin(TAU * a) * ex(t, 9) * 1.1 + (t < 0.01 ? rnd() * 0.8 : 0) + (t > 0.08 ? Math.sin(TAU * b) * 0.35 * ex(t - 0.08, 7) : 0); }); },
  },
  twinkle: {
    // ...one sent off into the distance: a bright little ding with a sparkle on it
    gain: 0.35, vary: 0.3, gap: 80,
    make: () => { let a = 0, b = 0; return render(0.6, t => { a += 2100 / SFX_SR; b += 3150 / SFX_SR; return (Math.sin(TAU * a) * 0.6 + Math.sin(TAU * b) * 0.35 * (Math.floor(t * 30) % 2)) * ex(t, 5); }); },
  },
  whirl: {
    // ...the tornado: a whooshing wobble round and round
    gain: 0.35, vary: 0.3, gap: 160, voices: 2,
    make: () => { const bp = bandpass(); return render(0.32, t => bp(rnd(), 500 + 400 * Math.sin(TAU * 9 * t), 1.2) * 1.2); },
  },
  spawn: {
    // Meathead 2's otherworldly spawner giving birth: a wet squelch opening up, and a tiny squeal out of it
    gain: 0.5, vary: 0.5, gap: 60,
    make: () => { const lp = lowpass(); let a = 0; return render(0.35, t => { a += (1900 + 900 * Math.sin(TAU * 14 * t)) / SFX_SR; return lp(rnd(), 500 + 2600 * t) * ex(t, 9) * 1.6 + (t > 0.12 ? Math.sin(TAU * a) * 0.22 * ex(t - 0.12, 10) : 0); }); },
  },
  chitter: {
    // ...its litter: a quick high chatter, little alien squeaks
    gain: 0.22, vary: 0.8, gap: 90, voices: 2,
    make: () => { let a = 0; return render(0.22, t => { a += (2600 + 1100 * Math.sign(Math.sin(TAU * 32 * t)) + 600 * Math.sin(TAU * 7 * t)) / SFX_SR; return Math.sin(TAU * a) * 0.6 * ex(t, 8) * (Math.floor(t * 40) % 3 ? 1 : 0.2); }); },
  },
  gnaw: {
    // ...chewing on somebody: a wet crunching, teeth going fast
    gain: 0.32, vary: 0.6, gap: 70, voices: 2,
    make: () => { const bp = bandpass(), lp = lowpass(); return render(0.2, t => (bp(rnd(), 1500, 1.4) * 1.3 + lp(rnd(), 400) * 0.6 + (t < 0.008 ? rnd() * 0.8 : 0)) * (Math.sin(TAU * 26 * t) > 0 ? 1 : 0.25) * ex(t, 12)); },
  },
  crumble: {
    // ...a skeleton falling to bits: bones clattering down in a heap, dry knocks one after another
    gain: 0.55, vary: 0.4, gap: 120,
    make: () => { const bp = bandpass(); const hits = Array.from({ length: 10 }, (_, i) => i * 0.045 + Math.random() * 0.04); return render(0.7, t => { let x = 0; for (const h of hits) if (t >= h && t < h + 0.004) x += rnd() * 6; return bp(x, 2300, 3) + bp(rnd(), 900, 0.7) * 0.06 * ex(t, 5); }); },
  },
  twang: {
    // Meathead 2's crossbow of plagues: the string let go, a tight little thwip
    gain: 0.4, vary: 0.4, gap: 40,
    make: () => { let a = 0; const bp = bandpass(); return render(0.12, t => { a += (420 - 900 * t) / SFX_SR; return (Math.sign(Math.sin(TAU * a)) * 0.35 + bp(rnd(), 3200, 1.5) * (t < 0.03 ? 1 : 0)) * ex(t, 30); }); },
  },
  retch: {
    // ...somebody's tolerance gone: a gag, a heave from the gut, a wet gurgle up the throat
    gain: 0.6, vary: 0.5, gap: 200,
    make: () => { const lp = lowpass(), bp = bandpass(); let a = 0; return render(0.6, t => { a += (110 + 60 * Math.sin(TAU * 4 * t) + 40 * rnd()) / SFX_SR; const env = t < 0.15 ? t / 0.15 : ex(t - 0.15, 4); return (Math.sign(Math.sin(TAU * a)) * 0.35 + lp(rnd(), 500) * 0.8 + bp(rnd(), 700 + 400 * Math.sin(TAU * 13 * t), 2) * 0.5) * env; }); },
  },
  gush: {
    // ...and up it comes: a splashing gush, gurgling, going on a while
    gain: 0.5, vary: 0.4, gap: 300,
    make: () => { const lp = lowpass(), bp = bandpass(); return render(0.65, t => (lp(rnd(), 1300) * 1.1 + bp(rnd(), 500 + 300 * Math.sin(TAU * 17 * t), 3) * 0.6) * Math.min(1, t / 0.03) * ex(Math.max(0, t - 0.35), 6)); },
  },
  burp: {
    // Meathead 2's Donnie Dracula after a drink: a long, low, rattling belch up out of a full gut (a croak in vocal fry,
    // an "urr" opening out to an "aap"), and a wet little pop off the end of it
    gain: 0.8, vary: 0.8, gap: 300, voices: 1,
    make: () => {
      const lp = lowpass(), f1 = bandpass(), f2 = bandpass(), air = lowpass();
      let ph = 0;
      return render(0.9, t => {
        ph += (80 + 14 * Math.sin(t * 9) + 10 * rnd() - 20 * t) / SFX_SR;
        // (the rattle: pulses, not a tone)
        const fry = Math.pow(Math.max(0, Math.sin(TAU * ph)), 6) * 2 - 0.3;
        const open = Math.min(1, t / 0.45);
        const v = f1(fry, 360 + 320 * open, 2.2) * 1.2 + f2(fry, 880 + 420 * open, 3) * 0.5 + air(rnd(), 300) * 0.3;
        const env = Math.min(1, t / 0.03) * (t < 0.62 ? 1 : Math.max(0, 1 - (t - 0.62) / 0.12));
        const u = t - 0.76, pop = u > 0 ? Math.sin(TAU * 240 * u * (1 + u * 10)) * ex(u, 40) * 0.6 : 0;
        return lp(v, 2400) * env + pop;
      });
    },
  },
  slurp: {
    // ...and the last of one up a straw: a hissing, gargling suck, bubbles breaking through it, sputtering at the end
    gain: 0.45, vary: 1, gap: 250, voices: 1,
    make: () => {
      const bp = bandpass(), bp2 = bandpass();
      let gate = 1;
      return render(0.7, (t, i) => {
        if (i % 160 === 0) gate = Math.random() < (t < 0.45 ? 0.75 : 0.4) ? 1 : 0.15;
        const hiss = bp(rnd(), 1800 + 900 * Math.sin(TAU * 3 * t), 2) * gate;
        const gurgle = bp2(rnd(), 500 + 250 * Math.sin(TAU * 23 * t), 3) * 0.7;
        return (hiss + gurgle) * Math.min(1, t / 0.04) * (t < 0.5 ? 1 : Math.max(0, 1 - (t - 0.5) / 0.2));
      });
    },
  },
  squish: {
    // ...somebody squashed flat: a flat splut and an accordion's wheeze
    gain: 0.5, vary: 0.5, gap: 100,
    make: () => { const lp = lowpass(); let a = 0; return render(0.7, t => { a += (180 + 90 * Math.sin(TAU * 7 * t)) / SFX_SR; return lp(rnd(), 700) * ex(t, 20) * 1.3 + (t > 0.1 ? (Math.sign(Math.sin(TAU * a)) * 0.25 + Math.sin(TAU * a * 1.5) * 0.2) * Math.min(1, (t - 0.1) / 0.1) * ex(t - 0.1, 3) : 0); }); },
  },
  sadBolt: {
    // A sad little laser: pew... wew (drooping), half-hearted
    gain: 0.3, vary: 1, gap: 120,
    make: () => { let ph = 0; return render(0.5, t => { ph += (900 * ex(t, 4) + 160) / SFX_SR; return (Math.sin(TAU * ph) * 0.7 + Math.sign(Math.sin(TAU * ph)) * 0.15) * Math.min(1, t / 0.01) * ex(t, 5); }); },
  },
  click: {
    gain: 0.35, vary: 1, gap: 40,
    make: () => render(0.05, t => (Math.sin(TAU * 3200 * t) * 0.6 + rnd() * 0.4) * ex(t, 120) + (t > 0.018 && t < 0.024 ? rnd() * 0.5 : 0)),
  },
  rayFizzle: {
    // The ray gun's bolt dying on a wall: a soft electric sizzle (a buzz sagging down, crackle on it) and it's gone,
    // no bright ring (a ping off a wall reads as the game saying no)
    gain: 0.3, vary: 1.5, gap: 60,
    make: () => { const bp = bandpass(), lp = lowpass(), sp = crackle(0.25); let ph = 0; return render(0.2, t => { ph += (240 * ex(t, 9) + 70) / SFX_SR; const buzz = Math.sign(Math.sin(TAU * ph)) * 0.35 + Math.sin(TAU * ph * 2) * 0.2; return lp(buzz, 1400) * Math.min(1, t / 0.004) * ex(t, 16) + bp(rnd(), 2600, 0.6) * ex(t, 22) * 0.6 + sp() * ex(t, 14) * 0.35; }); },
  },
  // ---- Dry fire: fire pressed with nothing left in it (combat/dryFire.ts), one apiece ----
  dry_lmg: {
    // The bolt slamming home on nothing (clack-clack), and one spent casing bouncing away on the floor (tink, tink, tik)
    gain: 0.5, vary: 1, gap: 150,
    make: () => { const bolt = metal(700, [1, 2.3, 3.9], 40), bolt2 = metal(520, [1, 2.5, 4.4], 34), tink = metal(3100, [1, 2.6, 4.3], 30), lp = lowpass(); const bounces = [0.2, 0.34, 0.43, 0.49]; return render(0.6, t => bolt(t) * (t < 0.06 ? 1 : 0) + (t < 0.003 ? rnd() : 0) + (t > 0.07 ? bolt2(t - 0.07) + lp(rnd(), 1500) * ex(t - 0.07, 60) * 0.6 : 0) + bounces.reduce((v, at, k) => v + (t > at ? tink(t - at) * 0.5 / (1 + k * 0.6) : 0), 0)); },
  },
  dry_ice: {
    // The ice gun: a hollow clunk (the pump on an empty tube), a frosty little hiss out of the barrel, one sad tinkle
    gain: 0.45, vary: 1, gap: 150,
    make: () => { const body = glide(210, 120, 20), lp = lowpass(), hp = highpass(); return render(0.5, t => body(t) * ex(t, 16) * 0.9 + lp(rnd(), 900) * ex(t, 45) * 0.8 + (t > 0.08 ? hp(rnd(), 5000) * Math.sin(Math.PI * Math.min(1, (t - 0.08) / 0.3)) * 0.4 : 0) + (t > 0.3 ? Math.sin(TAU * 4200 * t) * ex(t - 0.3, 22) * 0.25 : 0)); },
  },
  dry_flame: {
    // The pilot light catching on nothing: puh... puh-puh (little coughs of gas), and a thin hiss trailing off
    gain: 0.5, vary: 1.5, gap: 150,
    make: () => { const lp = lowpass(), bp = bandpass(); const coughs = [0, 0.16, 0.24]; return render(0.65, t => lp(rnd(), 500) * coughs.reduce((v, at, k) => { const u = t - at; return v + (u > 0 ? Math.min(1, u / 0.006) * ex(u, 28) * (1 - k * 0.25) : 0); }, 0) * 2 + (t > 0.25 ? bp(rnd(), 4500, 0.7) * Math.min(1, (t - 0.25) / 0.05) * ex(t - 0.25, 7) * 0.3 : 0)); },
  },
  dry_boulder: {
    // The blunderbuss with no rock in it: one pebble rattling out and down (tok, tok, tik) and a dribble of grit after it
    gain: 0.45, vary: 2, gap: 150,
    make: () => { const c = crackle(0.05), lp = lowpass(); const knocks = [[0, 900], [0.17, 1100], [0.27, 1250], [0.33, 1300]]; return render(0.65, t => knocks.reduce((v, [at, f], k) => v + (t > at ? Math.sin(TAU * f * (t - at)) * ex(t - at, 55) / (1 + k * 0.5) + (t - at < 0.002 ? rnd() * 0.5 : 0) : 0), 0) + lp(c(), 2500) * Math.sin(Math.PI * Math.min(1, t / 0.65)) * 2); },
  },
  dry_tsunami: {
    // Where a wall of water ought to be: plip... plip... plip (a sad little dribble, each drop a touch lower)
    gain: 0.4, vary: 1.5, gap: 200,
    make: () => { const drops = [[0.02, 900], [0.2, 760], [0.42, 620]]; return render(0.75, t => drops.reduce((v, [at, f]) => { const u = t - at; return v + (u > 0 && u < 0.12 ? Math.sin(TAU * f * u * (1 + u * 14)) * ex(u, 30) : 0); }, 0)); },
  },
  dry_needles: {
    // The plunger going down on an empty syringe: a thin rising hiss of air, then one drop landing (plip)
    gain: 0.35, vary: 1.5, gap: 150,
    make: () => { const bp = bandpass(); return render(0.45, t => (t < 0.25 ? bp(rnd(), 2200 + 4000 * (t / 0.25), 2) * Math.sin(Math.PI * t / 0.25) : 0) + (t > 0.32 ? Math.sin(TAU * 1300 * (t - 0.32) * (1 + (t - 0.32) * 12)) * ex(t - 0.32, 35) * 0.8 : 0)); },
  },
  dry_taser: {
    // Flat batteries: a weak buzz that sags and dies (bzzt... zt), a crackle or two in it
    gain: 0.3, vary: 1, gap: 150,
    make: () => { const bp = bandpass(); let ph = 0; return render(0.4, t => { ph += (118 - 70 * Math.min(1, t / 0.35)) / SFX_SR; const on = t < 0.12 || (t > 0.2 && t < 0.26); return bp(Math.sign(Math.sin(TAU * ph)) * (0.6 + 0.4 * rnd()) + (Math.random() < 0.05 ? rnd() * 2 : 0), 1400, 0.6) * (on ? 1 : 0.05) * ex(t, 5); }); },
  },
  dry_sludge: {
    // The barfer coming up empty: a small wet burp (a low reed, wobbling) and one drip off the end
    gain: 0.3, vary: 1.5, gap: 150,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(0.55, t => { ph += (95 + 25 * Math.sin(t * 40) - 60 * t) / SFX_SR; const burp = t < 0.3 ? lp(Math.tanh(4 * Math.sin(TAU * ph)), 900) * Math.min(1, t / 0.02) * Math.min(1, (0.3 - t) / 0.08) + bp(rnd(), 450, 1) * 0.3 * ex(t, 10) : 0; const u = t - 0.4; return burp + (u > 0 ? Math.sin(TAU * 700 * u * (1 + u * 16)) * ex(u, 32) * 0.6 : 0); }); },
  },
  dry_oil: {
    // The launcher with no rocket in it: the trigger's click, and a tiny limp pfft out of the tube
    gain: 0.45, vary: 1, gap: 150,
    make: () => { const bp = bandpass(); return render(0.3, t => (Math.sin(TAU * 2600 * t) * 0.6 + rnd() * 0.4) * ex(t, 140) + (t > 0.09 ? bp(rnd(), 1200, 0.8) * Math.sin(Math.PI * Math.min(1, (t - 0.09) / 0.14)) * 0.9 : 0)); },
  },
  // ---- Meathead 2's weapons with nothing left in them (m2/weapons/dry.ts), one apiece ----
  dry_souvenir: {
    // The souvenir launcher: the trigger's click, a hollow empty pop out of the drainpipe, and one bit of junk rattling down it (tink)
    gain: 0.45, vary: 1, gap: 150,
    make: () => { const lp = lowpass(), tink = metal(2400, [1, 2.7, 4.1], 35); return render(0.45, t => (Math.sin(TAU * 2800 * t) * 0.6 + rnd() * 0.4) * ex(t, 140) + (t > 0.06 ? lp(rnd(), 380) * Math.sin(Math.PI * Math.min(1, (t - 0.06) / 0.1)) * 1.2 : 0) + (t > 0.28 ? tink(t - 0.28) * 0.35 : 0)); },
  },
  dry_suck: {
    // The soul sucker out of juice: the motor trying (a wheezy, sagging whine), a thin asthmatic suck, and it dies
    gain: 0.4, vary: 1, gap: 200,
    make: () => { const bp = bandpass(), lp = lowpass(); let ph = 0; return render(0.6, t => { ph += (150 * ex(t, 3) + 30) / SFX_SR; const motor = lp(Math.sign(Math.sin(TAU * ph)), 700) * 0.4; const wheeze = bp(rnd(), 1800 + 500 * Math.sin(TAU * 3 * t), 2.5) * (0.6 + 0.4 * Math.sin(TAU * 11 * t)); return (motor + wheeze * 0.7) * Math.min(1, t / 0.03) * ex(Math.max(0, t - 0.2), 6); }); },
  },
  dry_flint: {
    // The flintlock with no ball: the hammer snapping down (a sharp click), the flint's weak spark, a puff off the pan
    gain: 0.45, vary: 1, gap: 150,
    make: () => { const hp = highpass(), lp = lowpass(); return render(0.35, t => (t < 0.006 ? rnd() : 0) + Math.sin(TAU * 2100 * t) * ex(t, 90) * 0.5 + (t > 0.01 && t < 0.05 ? hp(rnd(), 5000) * 0.5 : 0) + (t > 0.07 ? lp(rnd(), 900) * Math.sin(Math.PI * Math.min(1, (t - 0.07) / 0.2)) * 0.5 : 0)); },
  },
  dry_spell: {
    // The spellbook out of mana: a little magic shimmer going up that sags and fizzles out (a sad, sputtering hiss)
    gain: 0.35, vary: 1, gap: 150,
    make: () => { const hp = highpass(); let a = 0; return render(0.55, t => { a += (900 + 900 * Math.min(1, t / 0.12) - 1300 * Math.max(0, t - 0.12)) / SFX_SR; const sput = Math.floor(t * 34) % 2 ? 1 : 0.25; return Math.sin(TAU * a) * 0.45 * ex(t, 6) * sput + hp(rnd(), 4500) * 0.35 * Math.min(1, t / 0.1) * ex(t, 5) * sput; }); },
  },
  dry_clap: {
    // The clapperboard with no take left: a limp, dull little clack (the sticks barely meeting), nothing after it
    gain: 0.45, vary: 0.6, gap: 150,
    make: () => { const lp = lowpass(); return render(0.1, t => (lp(rnd(), 900) * 1.2 + Math.sin(TAU * 330 * t) * 0.5) * ex(t, 55)); },
  },
  dry_spawn: {
    // The spawner gone dry: a squeeze on nothing, a wet empty gurgle, and a little fart of air out the end
    gain: 0.4, vary: 1, gap: 150,
    make: () => { const lp = lowpass(), bp = bandpass(); let ph = 0; return render(0.45, t => { ph += (80 + 30 * Math.sin(TAU * 22 * t)) / SFX_SR; const gurgle = lp(Math.tanh(3 * Math.sin(TAU * ph)), 600) * (t < 0.25 ? 1 : 0) * Math.min(1, t / 0.02); return gurgle * 0.7 + (t > 0.27 ? bp(rnd(), 500, 1.2) * ex(t - 0.27, 14) * 0.8 : 0); }); },
  },
  dry_bow: {
    // The crossbow with no dart: the string let go on nothing, a slack, wobbly twang (low, flabby, buzzing out)
    gain: 0.45, vary: 0.8, gap: 150,
    make: () => { let a = 0; return render(0.5, t => { a += (150 + 25 * Math.sin(TAU * 7 * t)) / SFX_SR; return (Math.sign(Math.sin(TAU * a)) * 0.3 + Math.sin(TAU * a * 2) * 0.4) * ex(t, 7) + (t < 0.004 ? rnd() * 0.6 : 0); }); },
  },
  dry_stick: {
    // The mallet broken down to its stick: a dry, hollow little wooden tok (nothing like the bonk it used to make)
    gain: 0.4, vary: 1.5, gap: 120,
    make: () => { const bp = bandpass(); return render(0.12, t => (Math.sin(TAU * (900 - 2000 * t) * t) * 0.7 + bp(rnd(), 1300, 2) * 0.6) * ex(t, 45)); },
  },
  stick_snap: {
    // ...and the moment it goes: the handle cracking in two (a sharp splintering snap), the head thunking off
    gain: 0.6, vary: 0.5, gap: 200,
    make: () => { const bp = bandpass(), body = glide(180, 70, 20); const cracks = [0, 0.012, 0.03, 0.045]; return render(0.5, t => cracks.reduce((v, at) => v + (t > at && t < at + 0.004 ? rnd() * 1.3 : 0), 0) + bp(rnd(), 2600, 1.4) * ex(t, 25) * 0.7 + (t > 0.18 ? body(t - 0.18) * ex(t - 0.18, 14) * 0.9 : 0)); },
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
  gunhit: {
    // A round going into someone: a sharp crack of a hit, a wet slap of it, the thump of it in the body
    gain: 0.55, vary: 2, gap: 35, voices: 4,
    make: () => { const bp = bandpass(), lp = lowpass(), body = glide(150, 55, 30); return render(0.24, t => (t < 0.005 ? rnd() * 1.1 : 0) + bp(rnd(), 1500 - 950 * Math.min(1, t * 8), 0.8) * ex(t, 24) * 1.1 + lp(rnd(), 520) * ex(t, 16) * 0.8 + body(t) * ex(t, 28) * 0.9); },
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
  boing: {
    // A cartoon spring: a plucked twang that bends up and wobbles as it rings out
    gain: 0.4, vary: 1.5, gap: 60,
    make: () => { let ph = 0; return render(0.5, t => { const f = 150 + 230 * (1 - ex(t, 9)) + 40 * Math.sin(TAU * 17 * t) * ex(t, 5); ph += f / SFX_SR; const s = Math.sin(TAU * ph); return (s + 0.35 * Math.sin(TAU * ph * 2)) * Math.min(1, t / 0.006) * ex(t, 6); }); },
  },
  jump: {
    gain: 0.18, vary: 1.5, gap: 90,
    make: () => { const bp = bandpass(); return render(0.12, t => bp(rnd(), 500 + 1800 * (t / 0.12), 1) * Math.sin(Math.PI * t / 0.12)); },
  },
  land: {
    gain: 0.3, vary: 2, gap: 100,
    make: () => { const lp = lowpass(); return render(0.14, t => lp(rnd(), 700 * ex(t, 25) + 100) * ex(t, 22) * 1.5 + Math.sin(TAU * 80 * t) * ex(t, 30)); },
  },
  // ---- His footsteps (quiet: under everything) ----
  step_hard: {
    // A heel on concrete, tile, stone: a soft tick with a little weight under it
    gain: 0.11, vary: 3, gap: 90, voices: 2,
    make: () => { const lp = lowpass(), body = glide(140, 90, 30); return render(0.07, t => lp(rnd(), 2400 * ex(t, 60) + 300) * ex(t, 70) * 1.2 + body(t) * ex(t, 45) * 0.5); },
  },
  step_snow: {
    // Packed snow: a short squeaky crunch
    gain: 0.12, vary: 3, gap: 90, voices: 2,
    make: () => { const bp = bandpass(), c = crackle(0.25); return render(0.13, t => bp(rnd() * 0.5 + c(), 1500 + 900 * Math.sin(TAU * 9 * t), 0.9) * Math.sin(Math.PI * t / 0.13) * 1.3); },
  },
  step_metal: {
    // A catwalk, a fire escape: a dull little clank
    gain: 0.08, vary: 2.5, gap: 90, voices: 2,
    make: () => { const ring = metal(380, [1, 2.76, 5.4], 30), lp = lowpass(); return render(0.14, t => ring(t) * 0.8 + lp(rnd(), 1800) * ex(t, 80) * 0.8); },
  },
  step_wood: {
    // Boards: a hollow knock
    gain: 0.13, vary: 3, gap: 90, voices: 2,
    make: () => { const body = glide(230, 150, 40), bp = bandpass(); return render(0.09, t => body(t) * ex(t, 38) + bp(rnd(), 800, 0.8) * ex(t, 60) * 0.7); },
  },
  step_dirt: {
    // Dirt, gravel, ash: a soft gritty scuff
    gain: 0.1, vary: 3, gap: 90, voices: 2,
    make: () => { const lp = lowpass(), c = crackle(0.06); return render(0.1, t => (lp(rnd(), 1100) * 1.2 + c() * 0.6) * Math.min(1, t / 0.008) * ex(t, 32)); },
  },
  step_sand: {
    // Sand: a soft dry hiss
    gain: 0.07, vary: 3, gap: 90, voices: 2,
    make: () => { const bp = bandpass(); return render(0.12, t => bp(rnd(), 3200, 0.5) * Math.sin(Math.PI * Math.min(1, t / 0.12)) ** 2); },
  },
  step_wet: {
    // A wet floor, a puddle: a little slap
    gain: 0.1, vary: 3, gap: 90, voices: 2,
    make: () => { const bp = bandpass(); return render(0.1, t => bp(rnd(), 900 + 700 * ex(t, 30), 1.2) * Math.min(1, t / 0.004) * ex(t, 35) * 1.3); },
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
    // Chuco heading for the wall: a growl under his breath, not a buzz (the saw's low-passed, barely driven, eased in
    // and out, shorter)
    gain: 0.28, vary: 1, gap: 400,
    make: () => { const bp = bandpass(), lp = lowpass(); let ph = 0; return render(0.75, t => { ph += (95 + 12 * Math.sin(TAU * 6 * t)) / SFX_SR; const env = Math.min(1, t / 0.12) * Math.min(1, (0.75 - t) / 0.25); return (lp(Math.tanh(1.2 * (((ph % 1) * 2 - 1) + rnd() * 0.3)), 420) * 0.8 + bp(rnd(), 600, 0.6) * 0.3 * ex(t, 1.8)) * env; }); },
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

/** Meathead 2's STUPID DAD LIVE!: the canned sitcom laugh track (a studio audience off an old tape: a dozen and more
 *  voices, men's and women's, each its own "ha-ha-ha" at its own pace, swelling in and dying off, dulled like tape). */
SFX.laughtrack = {
  gain: 0.5, vary: 0.6, gap: 800, voices: 1,
  make: () => {
    const lp = lowpass();
    const V = Array.from({ length: 16 }, (_, i) => ({ at: Math.random() * 0.35, dur: 1.2 + Math.random() * 0.8, f0: i % 3 ? 140 + Math.random() * 90 : 240 + Math.random() * 120, rate: 4.4 + Math.random() * 2.4, sp: Math.random(), ph: 0, a: bandpass(), b: bandpass() }));
    return render(2.3, t => lp(V.reduce((v, s) => {
      const u = t - s.at;
      if (u < 0 || u > s.dur) return v;
      const syl = Math.sin(Math.PI * ((u * s.rate + s.sp) % 1)), pulse = syl * syl * syl;
      s.ph += (s.f0 * (1 + 0.08 * Math.sin(TAU * s.rate * u)) * (1 - 0.15 * u / s.dur)) / SFX_SR;
      const src = ((s.ph % 1) * 2 - 1) * 0.7 + rnd() * 0.5;
      return v + (s.a(src, 800, 2) + s.b(src, 1300, 3) * 0.5) * pulse * Math.min(1, u / 0.08) * (1 - u / s.dur);
    }, 0), 3400));
  },
};
/** ...a beer can cracked open: the tab's sharp pop, then the fizz. */
SFX.canopen = {
  gain: 0.5, vary: 1, gap: 200,
  make: () => { const hp = highpass(), bp = bandpass(); return render(0.45, t => (t < 0.004 ? rnd() : 0) * 1.2 + Math.sin(TAU * 2600 * t) * ex(t, 90) * 0.6 + (t > 0.01 ? hp(rnd(), 3500) * ex(t - 0.01, 7) * 0.8 + bp(rnd(), 6000, 2) * ex(t - 0.01, 12) * 0.4 : 0)); },
};
/** ...the show's tape stopping dead: its music winding down to nothing. */
SFX.tapestop = {
  gain: 0.45, gap: 500, voices: 1,
  make: () => { const lp = lowpass(); let p1 = 0, p2 = 0, p3 = 0; return render(0.9, t => { const k = Math.max(0, 1 - t / 0.8), sp = k * k; p1 += (220 * sp) / SFX_SR; p2 += (277 * sp) / SFX_SR; p3 += (330 * sp) / SFX_SR; const v = ((p1 % 1) * 2 - 1) + ((p2 % 1) * 2 - 1) * 0.7 + ((p3 % 1) * 2 - 1) * 0.6 + rnd() * 0.2 * sp; return lp(v, 300 + 2600 * sp) * Math.min(1, k * 4); }); },
};

// ---- Eating noises written into a line (*CRUNCH*, *GULP*...): never said by the voice, played as these (cues.ts)
/** A wet crunchy bite: teeth snapping through something crisp (a cracking burst of crackle), then a wet squelch. */
SFX.bite = {
  gain: 0.6, vary: 0.8, gap: 120, voices: 2,
  make: () => {
    const bp = bandpass(), lp = lowpass(), wet = bandpass();
    const cracks = Array.from({ length: 14 }, () => Math.random() * 0.12);
    return render(0.5, t => {
      let c = 0;
      for (const h of cracks) if (t >= h && t < h + 0.003) c += rnd() * 3;
      const crunch = bp(c + rnd() * 0.6 * ex(t, 18), 2400, 1.2) * (t < 0.16 ? 1 : ex(t - 0.16, 20));
      const thud = lp(rnd(), 350) * ex(t, 14) * 0.8;
      const u = t - 0.14, squelch = u > 0 ? wet(rnd(), 700 + 500 * Math.sin(TAU * 11 * u), 3) * ex(u, 9) * 0.7 : 0;
      return crunch * 1.3 + thud + squelch;
    });
  },
};
/** Chewing with his mouth open: two wet, smacking chews, squelchy, teeth clicking at the bottom of each. */
SFX.chew = {
  gain: 0.55, vary: 0.6, gap: 200, voices: 1,
  make: () => {
    const wet = bandpass(), lp = lowpass();
    return render(0.75, t => {
      const k = Math.floor(t / 0.36), u = t - k * 0.36;
      const open = Math.sin(Math.PI * Math.min(1, u / 0.3));
      const smack = u < 0.006 ? rnd() * 1.5 : 0;
      const click = u > 0.26 && u < 0.27 ? rnd() : 0;
      const squish = wet(rnd(), 600 + 900 * open, 2.5) * open * 0.9 + lp(rnd(), 300) * open * 0.4;
      return smack + click * 0.8 + squish;
    });
  },
};
/** A big swallow: the throat clicking shut, then a low wet gloop going down. */
SFX.gulp = {
  gain: 0.6, vary: 0.6, gap: 200, voices: 1,
  make: () => {
    const lp = lowpass(), bp = bandpass();
    return render(0.45, t => {
      const click = t < 0.012 ? bp(rnd(), 1800, 2) * 2 : 0;
      const u = t - 0.05;
      const gloop = u > 0 ? Math.sin(TAU * (260 - 160 * Math.min(1, u / 0.2)) * u) * Math.sin(Math.PI * Math.min(1, u / 0.3)) * 0.9 : 0;
      return click + lp(gloop + rnd() * 0.15 * ex(t, 8), 900);
    });
  },
};
/** A smoker's hack: three rough barks from the chest, the last one rattling. */
SFX.cough = {
  gain: 0.55, vary: 0.5, gap: 300, voices: 1,
  make: () => {
    const f1 = bandpass(), f2 = bandpass(), lp = lowpass();
    const at = [0, 0.2, 0.42];
    return render(0.75, t => {
      let v = 0;
      for (let k = 0; k < at.length; k++) {
        const u = t - at[k];
        if (u < 0 || u > 0.22) continue;
        const env = Math.min(1, u / 0.01) * ex(u, k === 2 ? 9 : 16);
        const n = rnd() * (1 + 0.6 * Math.sin(TAU * 70 * u));
        v += (f1(n, 500, 1.5) * 1.2 + f2(n, 1400, 2) * 0.6) * env * (k === 0 ? 1 : 0.8);
      }
      return lp(v, 3000);
    });
  },
};

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
  bus.connect(soft); soft.connect(limit); limit.connect(mixOut(c, 'sfx'));
  const send = c.createGain(); send.gain.value = 0.14;
  const room = c.createDelay(0.5); room.delayTime.value = 0.07;
  const fb = c.createGain(); fb.gain.value = 0.25;
  const dark = c.createBiquadFilter(); dark.type = 'lowpass'; dark.frequency.value = 3000;
  limit.connect(send); send.connect(room); room.connect(dark); dark.connect(fb); fb.connect(room); dark.connect(mixOut(c, 'sfx'));
  return bus;
};

const bufferOf = (c: AudioContext, name: string) => {
  let b = buffers[name];
  if (!b) { const d = SFX[name].make(); b = c.createBuffer(1, d.length, SFX_SR); b.getChannelData(0).set(d); buffers[name] = b; }
  return b;
};

/** A game's own volume for some of the sounds (Meathead 2's: the puking, turned well down); 1 for the rest. */
const scaled: Record<string, number> = {};
export const setSfxScale = (names: string[], k: number) => { for (const n of names) scaled[n] = k; };

/** Plays a sound effect (`vol` a multiplier, `pitch` in semitones). Dropped if it's playing too much already. `to`:
 *  somewhere else to send it than the sound effects' bus (a voice's own chain: a noise in a line, cues.ts). */
export const playSfx = (c: AudioContext, name: string, vol = 1, pitch = 0, to?: AudioNode) => {
  vol *= scaled[name] ?? 1;
  const def = SFX[name];
  if (!def) return;
  const now = performance.now();
  if (def.gap && now - (lastAt[name] ?? -1e9) < def.gap) return;
  if ((playing[name] ?? 0) >= (def.voices ?? 2)) return;
  lastAt[name] = now;
  const bus = busFor(c), out = to ?? bus;
  const src = c.createBufferSource();
  src.buffer = bufferOf(c, name);
  src.playbackRate.value = Math.pow(2, (pitch + (def.vary ? (Math.random() * 2 - 1) * def.vary : 0)) / 12);
  const g = c.createGain(); g.gain.value = def.gain * vol;
  src.connect(g); g.connect(out);
  playing[name] = (playing[name] ?? 0) + 1;
  const live = (sounding[name] ??= new Set());
  live.add(src);
  src.onended = () => { live.delete(src); playing[name] = Math.max(0, (playing[name] ?? 1) - 1); try { g.disconnect(); } catch { /* fine */ } };
  src.start();
};
/** Each sound's instances still going (so a scene's can be cut off when it ends). */
const sounding: Record<string, Set<AudioBufferSourceNode>> = {};
/** Cuts off every instance of a sound still going (an alarm left ringing when its scene ends). */
export const stopSfx = (name: string) => {
  const live = sounding[name];
  if (!live) return;
  for (const src of [...live]) try { src.stop(); } catch { /* already stopped */ }
};

/** Makes every sound's sample ahead of time, a few at a time (so none of them hitches the first time). */
export const warmSfx = (c: AudioContext) => {
  const names = Object.keys(SFX);
  const next = () => { const n = names.shift(); if (!n || c.state === 'closed') return; busFor(c); bufferOf(c, n); setTimeout(next, 20); };
  next();
};

/** Every sound effect's name (for checking them all). */
export const SFX_NAMES = () => Object.keys(SFX);
