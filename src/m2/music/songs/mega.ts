// The Mega Man kit: the shared building blocks for the high-energy pass (the user's: "it sounds too cutesy overall.
// give it more of a high energy mega man vibe with the songs"). Mega Man 2/3 and X stage and boss themes: a pumping
// octave bass, sixteenth arpeggios, power-chord riffs, a rock kit with a fill into every section, the lead doubled by
// a harmony in thirds. The helpers here are on top of jungle.ts's (bars, chord, nt, hi...).

// (its own copies of jungle.ts's little helpers: jungle.ts imports this file, so this one can't import that)
type Bar = string | [string, string];
const bars = (prog: Bar[], f: (c: string, beats: 4 | 2) => string) => prog.map(b => (typeof b === 'string' ? f(b, 4) : `${f(b[0], 2)} ${f(b[1], 2)}`));
const rep = (bar: string, n: number) => Array.from({ length: n }, () => bar);
const hi = (n: string) => `${Number(n[0]) + 1}${n.slice(1)}`;
const nt = (n: string, len: string, pre = '') => `o${n[0]} ${pre}${n.slice(1)}${len}`;
const chord = (ns: string[], len: string) => {
  let o = Number(ns[0][0]);
  let s = `o${o} {`;
  for (const n of ns) { const k = Number(n[0]); s += '>'.repeat(Math.max(0, k - o)) + n.slice(1) + ' '; o = k; }
  return `${s.trim()}}${len}`;
};

// ---- Harmony: a line moved along a scale (a third under it, a sixth, an octave and a third...) ----

const PC: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const NAME = ['c', 'c+', 'd', 'e-', 'e', 'f', 'f+', 'g', 'a-', 'a', 'b-', 'b'];
/** A scale's pitch classes from its root ('e-') and its kind. */
export const scale = (root: string, kind: 'major' | 'minor' | 'harmonic' | 'dorian' | 'mixolydian' | 'phrygian' = 'minor') => {
  const r = (PC[root[0]] + (root.includes('+') || root.includes('#') ? 1 : 0) - (root.includes('-') ? 1 : 0) + 12) % 12;
  const steps = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  }[kind];
  return steps.map(s => (r + s) % 12);
};
/** A melody's bars (MML, one octave command or more each) moved `steps` along the scale (-2: a third under, -5: a sixth
 *  under, +2: a third over); notes off the scale move with the one under them. Chords and drums aren't for this. */
export const harm = (barsIn: string[], pcs: number[], steps: number) => {
  const all: number[] = [];
  for (let m = 0; m < 128; m++) if (pcs.includes(m % 12)) all.push(m);
  const move = (m: number) => {
    let k = all.indexOf(m), off = 0;
    if (k < 0) { k = all.indexOf(m - 1); off = 1; }
    if (k < 0) return m;
    return (all[Math.max(0, Math.min(all.length - 1, k + steps))] ?? m) + off;
  };
  return barsIn.map(src => {
    const s = src.toLowerCase();
    let out = '', i = 0, oct = 4;
    while (i < s.length) {
      const c = s[i];
      if (c === '_') { // a command: _x and its number, slash, comma
        let j = i + 2;
        while (j < s.length && /[-+0-9./,^]/.test(s[j])) j++;
        out += s.slice(i, j); i = j; continue;
      }
      if (c === 'o' && /[0-9]/.test(s[i + 1] ?? '')) { oct = Number(s[i + 1]); out += s.slice(i, i + 2); i += 2; continue; }
      if (c === '>') { oct++; out += c; i++; continue; }
      if (c === '<') { oct--; out += c; i++; continue; }
      if (c === '@') { let j = i + 1; while (j < s.length && /[a-z0-9]/.test(s[j])) j++; out += s.slice(i, j); i = j; continue; }
      if ((c === 'v' || c === 'q' || c === 'l') && /[0-9]/.test(s[i + 1] ?? '')) { let j = i + 1; while (j < s.length && /[0-9]/.test(s[j])) j++; out += s.slice(i, j); i = j; continue; }
      if (c in PC) {
        let j = i + 1, n = PC[c];
        while (s[j] === '+' || s[j] === '#' || s[j] === '-') { n += s[j] === '-' ? -1 : 1; j++; }
        const m = move((oct + 1) * 12 + n);
        out += `o${Math.floor(m / 12) - 1} ${NAME[m % 12]}`;
        let k = j;
        while (k < s.length && /[0-9.^]/.test(s[k])) k++;
        out += s.slice(j, k) + ` o${oct} `;
        i = k; continue;
      }
      out += c; i++;
    }
    return out;
  });
};

// ---- Accompaniment ----

/** The Mega Man bass: eighths on the root, the octave popped (root root OCT root root root OCT root). `r` gives a
 *  chord's root ('e-'), `o` the low octave. */
export const pump = (prog: Bar[], r: (c: string) => string, o = 2) => bars(prog, (c, b) => {
  const x = r(c), t = [`o${o} ${x}8`, `${x}8`, `o${o + 1} ${x}8`, `o${o} ${x}8`, `${x}8`, `${x}8`, `o${o + 1} ${x}8`, `o${o} ${x}8`];
  return t.slice(0, b * 2).join(' ');
});
/** The bass in straight octaves, eighths (root, octave, root, octave). */
export const octs = (prog: Bar[], r: (c: string) => string, o = 2) => bars(prog, (c, b) => Array.from({ length: b }, () => `o${o} ${r(c)}8 o${o + 1} ${r(c)}8`).join(' '));
/** Galloping (an eighth and two sixteenths a beat). */
export const gallop = (prog: Bar[], r: (c: string) => string, o = 2) => bars(prog, (c, b) => `o${o} ${Array.from({ length: b }, () => `${r(c)}8 ${r(c)}16 ${r(c)}16`).join(' ')}`);
/** Sixteenth arpeggios up and down the chord, an octave over the voicing (`v`: octave-notes, lowest first). */
export const arp16 = (prog: Bar[], v: (c: string) => string[], lift = 1) => bars(prog, (c, b) => {
  let ns = v(c).slice(0, 3);
  for (let k = 0; k < lift; k++) ns = ns.map(hi);
  const n = [ns[0], ns[1], ns[2], hi(ns[0]), hi(ns[1]), hi(ns[0]), ns[2], ns[1]];
  return [...n, ...n].slice(0, b * 4).map(x => nt(x, '16')).join(' ');
});
/** A power-chord riff: `pat` eight tokens a bar ('x' a hit, '!' an accented one, '.' a rest, '-' tied on), the root
 *  at octave `o` (the powerchord / chug instruments play the root). */
export const riff = (prog: Bar[], r: (c: string) => string, pat = 'x x . x x . x x', o = 2) => bars(prog, (c, b) => {
  const toks = pat.split(' ').slice(0, b * 2), out: string[] = [];
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t === '.') { out.push('r8'); continue; }
    if (t === '-') continue;
    let len = 1;
    while (toks[k + len] === '-') len++;
    const l = len === 1 ? '8' : len === 2 ? '4' : len === 3 ? '4.' : len === 4 ? '2' : len === 6 ? '2.' : '1';
    out.push(`${t === '!' ? '!' : ''}${r(c)}${l}`);
  }
  return `o${o} ${out.join(' ')}`;
});
/** Chord stabs on a rhythm (eight tokens a bar, as riff()). */
export const stabs = (prog: Bar[], v: (c: string) => string[], pat = '! . . x . x . .') => bars(prog, (c, b) => {
  const toks = pat.split(' ').slice(0, b * 2), out: string[] = [];
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t === '.') { out.push('r8'); continue; }
    if (t === '-') continue;
    let len = 1;
    while (toks[k + len] === '-') len++;
    const l = len === 1 ? '8' : len === 2 ? '4' : len === 3 ? '4.' : len === 4 ? '2' : len === 6 ? '2.' : '1';
    out.push((t === '!' ? '!' : '') + chord(v(c), l));
  }
  return out.join(' ');
});
/** Held chords, a bar or two a bar. */
export const held = (prog: Bar[], v: (c: string) => string[]) => bars(prog, (c, b) => chord(v(c), b === 4 ? '1' : '2'));

// ---- The kit ----

/** The rock beat: kick on 1 and the and of 2... snare on 2 and 4, eighth hats. */
export const BEAT = '{kh}8 h8 {sh}8 h8 {kh}8 {kh}8 {sh}8 h8';
/** Busier: sixteenth hats, the kick pushing. */
export const BEAT16 = '{kh}16 h16 ?h16 h16 {sh}16 h16 ?h16 {kh}16 ?h16 h16 {kh}16 h16 {sh}16 h16 ?h16 h16';
/** Driving: kick on every beat, the snare on 2 and 4. */
export const DRIVE = '{kh}8 h8 {ksh}8 h8 {kh}8 h8 {ksh}8 h8';
/** The Mega Man 2 gallop: kick-kick-snare. */
export const MM2 = '{kh}8 {kh}8 {sh}8 h8 {kh}8 {kh}8 {sh}8 {kh}8';
/** Half time (the snare on 3). */
export const HALF = '{kh}8 h8 h8 h8 {sh}8 h8 {kh}8 h8';
/** Ride instead of hats. */
export const RIDE = '{k(ride)}8 (ride)8 {s(ride)}8 (ride)8 {k(ride)}8 {k(ride)}8 {s(ride)}8 (ride)8';
/** The same with a crash on the one (a section's first bar). */
export const X = (groove: string) => groove.replace(/^\{k([a-z()]*)\}/, '{kx}').replace(/^\{kh\}/, '{kx}');
export const FILL = '{kh}8 h8 {sh}8 h8 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom3)16 (tom4)8';
export const FILL2 = '{kh}8 h8 s16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16';
export const FILL_BIG = 's16 s16 s16 s16 (tom1)16 (tom1)16 (tom2)16 (tom2)16 (tom3)16 (tom3)16 (tom4)16 (tom4)16 {ks}8 {ks}8';
export const ROLL_UP = '_v55 s16 s16 s16 s16 _v70 s16 s16 s16 s16 _v90 s16 s16 s16 s16 _v110 s16 s16 (tom1)16 (tom4)16';
/** n bars of a groove: the crash on the first, the fill on the last. */
export const sec = (groove: string, n = 8, fill = FILL, open = X(groove)) => [open, ...rep(groove, n - 2), fill];
