// The fairy wheel's QTEs (the user's: "when you do, various qte sequences start that you need to pass"). In a
// suitor's cart he's locked up with him, and it's a run of beats, each one of four kinds:
//
//   MASH       one button (a face button), as fast as he can: the meter fills with each press and drains on its own;
//              fill it before the time's out.
//   PRESS      the button shown, each in turn, before its time's out; the wrong one's a miss.
//   ALTERNATE  left, right, left, right (a tug of war): the same one twice does nothing; enough before the time's out.
//   RING       a ring closes on the button: press it as the ring's on the target band; early, late or the wrong one's
//              a miss.
//
// Harder the further through the roster he is (more beats, more presses, less time; the first one's a mash, to learn
// on); a dazed suitor (hit by a rival's throw, a body) one beat fewer and slower. The panel's React's (QtePanel.tsx:
// the real buttons, pad or keys, live); this is the game's side: the beats, his presses, the result.

import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { setUi, type QteKey, type QteUi } from '../../store';

type Kind = QteUi['kind'];
interface Beat {
  kind: Kind;
  /** The button (mash, press: the one now; ring), the run of them (press). */
  key: QteKey; seq: QteKey[];
  /** How many presses (mash, alternate), presses or rings (press, ring); done so far; the meter (mash). */
  need: number; got: number; fill: number;
  /** Frames in (the whole beat: mash, alternate; this press or ring: press, ring), how long it gets. */
  t: number; dur: number;
  /** (alternate) which of the two's due. */
  next: number;
}
export interface Qte {
  /** Whose cart (roster index); his name. */
  i: number; name: string;
  phase: 'lock' | 'beat' | 'pause' | 'won' | 'lost';
  t: number;
  beats: Beat[]; at: number;
  flash: 'good' | 'bad' | null;
  prev: Controls;
}

const FACE: QteKey[] = ['A', 'B', 'X', 'Y'];
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const held = (c: Controls, k: QteKey) => !!(k === 'A' ? c.jump : k === 'B' ? c.special : k === 'X' ? c.shoot : k === 'Y' ? c.secondary : k === 'LEFT' ? c.left : c.right);
/** Which of the QTE's buttons went down this frame. */
const downs = (c: Controls, prev: Controls) => (['A', 'B', 'X', 'Y', 'LEFT', 'RIGHT'] as QteKey[]).filter(k => held(c, k) && !held(prev, k));

/** The beats for one fight: `level` how many he's killed (0..7), `dazed` the suitor's reeling. (Eased a step: the user's.) */
const beatsFor = (level: number, dazed: boolean): Beat[] => {
  const n = Math.max(1, 1 + Math.floor(level / 3) - (dazed ? 1 : 0));
  const slow = dazed ? 1.2 : 1;
  const out: Beat[] = [];
  let last: Kind | null = null;
  for (let s = 0; s < n; s++) {
    const kinds = (['mash', 'press', 'alternate', 'ring'] as Kind[]).filter(k => k !== last);
    const kind: Kind = level === 0 && s === 0 ? 'mash' : pick(kinds);
    last = kind;
    const b: Beat = { kind, key: pick(FACE), seq: [], need: 0, got: 0, fill: 0, t: 0, dur: 0, next: 0 };
    if (kind === 'mash') { b.need = 10 + Math.round(level * 1.5); b.dur = Math.round(190 * slow); }
    if (kind === 'press') { b.need = 3 + Math.floor(level / 2); b.seq = Array.from({ length: b.need }, () => pick(FACE)); b.key = b.seq[0]; b.dur = Math.round(Math.max(46, 86 - level * 4) * slow); }
    if (kind === 'alternate') { b.need = 12 + Math.round(level * 1.5); b.dur = Math.round(200 * slow); }
    if (kind === 'ring') { b.need = 2 + Math.floor(level / 3); b.dur = Math.round(Math.max(58, 98 - level * 4) * slow); }
    out.push(b);
  }
  return out;
};

/** The ring's target band (how shut the ring is when it counts). */
const BAND: [number, number] = [0.04, 0.32];
const LOCK = 30, PAUSE = 22;

export const startQte = (i: number, name: string, level: number, dazed: boolean, prev: Controls): Qte =>
  ({ i, name, phase: 'lock', t: 0, beats: beatsFor(level, dazed), at: 0, flash: null, prev });

/** Each frame of it: his presses (the raw controls), and the panel. Returns what's become of it. */
export const updateQte = (q: Qte, controls: Controls): 'on' | 'won' | 'lost' => {
  const presses = downs(controls, q.prev);
  q.prev = controls;
  q.t++;
  const b = q.beats[q.at];
  const good = () => { q.flash = 'good'; playSound('ding', 0.5, 6); };
  const miss = () => { q.flash = 'bad'; q.phase = 'lost'; q.t = 0; playSound('alert', 0.6, -6); };
  const beatDone = () => {
    good();
    q.at++;
    if (q.at >= q.beats.length) { q.phase = 'won'; q.t = 0; return; }
    q.phase = 'pause'; q.t = 0;
  };
  switch (q.phase) {
    case 'lock': if (q.t >= LOCK) { q.phase = 'beat'; q.t = 0; q.flash = null; } break;
    case 'pause': if (q.t >= PAUSE) { q.phase = 'beat'; q.t = 0; q.flash = null; } break;
    case 'beat': {
      b.t++;
      if (b.kind === 'mash') {
        for (const k of presses) if (k === b.key) { b.got++; b.fill = Math.min(1, b.fill + 1 / b.need); playSound('punch', 0.25, 6 + Math.random() * 4); }
        b.fill = Math.max(0, b.fill - 0.0032);
        if (b.fill >= 1) beatDone(); else if (b.t >= b.dur) miss();
      } else if (b.kind === 'press') {
        const face = presses.filter(k => FACE.includes(k));
        if (face.length) {
          if (face.includes(b.key) && face.length === 1) { b.got++; b.t = 0; playSound('punch', 0.4, 4); if (b.got >= b.need) beatDone(); else b.key = b.seq[b.got]; }
          else miss();
        } else if (b.t >= b.dur) miss();
        b.fill = b.got / b.need;
      } else if (b.kind === 'alternate') {
        const want: QteKey = b.next === 0 ? 'LEFT' : 'RIGHT';
        for (const k of presses) if (k === want) { b.got++; b.next = 1 - b.next; playSound('punch', 0.22, b.next ? 2 : 8); break; }
        b.fill = b.got / b.need;
        if (b.got >= b.need) beatDone(); else if (b.t >= b.dur) miss();
      } else {
        const r = 1 - b.t / b.dur;
        const face = presses.filter(k => FACE.includes(k));
        if (face.length) {
          if (face.length === 1 && face[0] === b.key && r >= BAND[0] && r <= BAND[1]) { b.got++; b.t = 0; playSound('punch', 0.5, 2); b.key = pick(FACE); if (b.got >= b.need) beatDone(); else { q.flash = 'good'; } }
          else miss();
        } else if (r <= 0) miss();
        b.fill = b.got / b.need;
      }
      break;
    }
  }
  // (the panel)
  const cur = q.beats[Math.min(q.at, q.beats.length - 1)];
  if (q.phase === 'won' || q.phase === 'lost') { setUi({ qte: null }); return q.phase; }
  const time = q.phase === 'beat' ? 1 - cur.t / cur.dur : 1;
  const ui: QteUi = {
    kind: cur.kind, keys: cur.kind === 'alternate' ? ['LEFT', 'RIGHT'] : [cur.key], next: cur.kind === 'alternate' ? cur.next : undefined,
    fill: cur.kind === 'mash' ? cur.fill : cur.got / cur.need, time: Math.max(0, time),
    ring: cur.kind === 'ring' ? (q.phase === 'beat' ? Math.max(0, 1 - cur.t / cur.dur) : 1) : undefined, band: cur.kind === 'ring' ? BAND : undefined,
    step: Math.min(q.at + 1, q.beats.length), steps: q.beats.length, name: q.name, flash: q.flash,
  };
  setUi({ qte: ui });
  return 'on';
};

/** How hard he's winning it, 0..1 (for the struggle's look: who's leaning on whom). */
export const qteEdge = (q: Qte) => {
  const b = q.beats[Math.min(q.at, q.beats.length - 1)];
  return Math.min(1, (q.at + (b.kind === 'mash' ? b.fill : b.got / Math.max(1, b.need))) / q.beats.length);
};
