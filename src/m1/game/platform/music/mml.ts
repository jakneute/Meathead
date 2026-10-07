// The songs are written in a little music notation (MML, the way old game music often was), one line per part:
//
//   o4        octave 4 (o4 c is middle C)        >  <   up / down an octave
//   l8        notes are eighths unless they say otherwise
//   c d e f g a b, with + or # (sharp) or - (flat), a length (1 2 4 8 16 32, 4. dotted) and ^ to tie more on
//   r         a rest (same lengths)
//   {ceg}4    a chord (the notes all at once)
//   [ ... ]3  play what's inside three times
//   v12       loudness, 0 to 15                   q6  hold each note 6/8 of its length (staccato is q3 or so)
//   |         a bar line (just for reading; it's ignored)
//
// Drum parts use letters for the drums instead of notes (see DRUM_KEYS), and {kh}8 hits two at once.

import { DRUM_KEYS } from './instruments';

export interface NoteEvent { t: number; d: number; n: number | string; v: number; gate: number }
export interface Parsed { events: NoteEvent[]; length: number }

const NOTE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export const parseMML = (src: string, drums = false): Parsed => {
  const s = src.toLowerCase();
  let i = 0;
  let octave = 4, len = 8, vel = 12, gate = 7;
  let t = 0;
  const events: NoteEvent[] = [];
  const num = () => { let v = ''; while (i < s.length && /[0-9]/.test(s[i])) v += s[i++]; return v ? Number(v) : NaN; };
  /** A length after a note: 4, 8., and any ^ties; in beats (a quarter note is one). */
  const length = () => {
    const readOne = () => {
      const n = num();
      let beats = 4 / (Number.isNaN(n) ? len : n);
      let add = beats / 2;
      while (s[i] === '.') { beats += add; add /= 2; i++; }
      return beats;
    };
    let beats = readOne();
    while (s[i] === '^') { i++; beats += readOne(); }
    return beats;
  };
  const pitch = () => {
    let n = NOTE[s[i++]];
    while (s[i] === '+' || s[i] === '#' || s[i] === '-') { n += s[i] === '-' ? -1 : 1; i++; }
    return (octave + 1) * 12 + n;
  };
  const stack: { at: number; count: number }[] = [];
  const body = (): void => {
    while (i < s.length) {
      const ch = s[i];
      if (/\s|\|/.test(ch)) { i++; continue; }
      if (ch === '[') { i++; stack.push({ at: i, count: 0 }); continue; }
      if (ch === ']') {
        i++;
        const times = num();
        const top = stack[stack.length - 1];
        top.count++;
        if (top.count < (Number.isNaN(times) ? 2 : times)) { i = top.at; continue; }
        stack.pop();
        continue;
      }
      if (drums && DRUM_KEYS[ch]) { i++; const d = length(); events.push({ t, d, n: DRUM_KEYS[ch], v: vel / 15, gate: 1 }); t += d; continue; }
      if (ch === 'o') { i++; octave = num(); continue; }
      if (ch === '>') { i++; octave++; continue; }
      if (ch === '<') { i++; octave--; continue; }
      if (ch === 'l') { i++; len = num(); continue; }
      if (ch === 'v') { i++; vel = num(); continue; }
      if (ch === 'q') { i++; gate = num(); continue; }
      if (ch === 'r') { i++; t += length(); continue; }
      if (ch === '{') {
        i++;
        const notes: (number | string)[] = [];
        const saved = octave;
        while (i < s.length && s[i] !== '}') {
          const c = s[i];
          if (/\s/.test(c)) { i++; continue; }
          if (c === '>') { octave++; i++; continue; }
          if (c === '<') { octave--; i++; continue; }
          if (drums) { const d = DRUM_KEYS[c]; i++; if (d) notes.push(d); continue; }
          if (c in NOTE) { notes.push(pitch()); continue; }
          i++;
        }
        i++;
        octave = saved;
        const d = length();
        for (const n of notes) events.push({ t, d, n, v: vel / 15, gate: gate / 8 });
        t += d;
        continue;
      }
      if (!drums && ch in NOTE) { const n = pitch(); const d = length(); events.push({ t, d, n, v: vel / 15, gate: gate / 8 }); t += d; continue; }
      i++; // (anything else: skipped)
    }
  };
  body();
  return { events, length: t };
};
