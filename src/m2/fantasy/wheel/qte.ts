// The fairy wheel's QTEs (the user's: "when you do, various qte sequences start that you need to pass"). In a
// suitor's cart he's locked up with him, and it's a run of beats, each one of four kinds:
//
//   MASH       one button (a face button), as fast as he can: the meter fills with each press and drains on its own;
//              fill it before the time's out.
//   PRESS      the button shown, each in turn, before its time's out; a wrong one costs time, a second's a miss.
//   ALTERNATE  left, right, left, right (a tug of war): the same one twice does nothing; enough before the time's out.
//   RING       a ring closes on the button: press it as the ring's on the target band; early or the wrong one costs
//              time (a second's a miss), late's a miss.
//
// Harder the further through the roster he is (more beats, more presses, less time; the first one's a mash, to learn
// on); a dazed suitor (hit by a rival's throw, a body) one beat fewer and slower. The panel's React's (QtePanel.tsx:
// the real buttons, pad or keys, live); this is the game's side: the beats, his presses, the result.

import type { Controls } from '../../../m1/game/platform/input';
import { playSound } from '../../../m1/game/platform/audio';
import { inputDevice } from '../../../m1/game/platform/device';
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
  /** (press, ring) wrong buttons or a ring pressed off its band so far: one's forgiven (it costs time), the next's a miss. */
  flubs: number;
}
export interface Qte {
  /** Whose cart (roster index); his name. */
  i: number; name: string;
  phase: 'lock' | 'beat' | 'pause' | 'won' | 'lost';
  t: number;
  beats: Beat[]; at: number;
  /** Beats of his won in earlier goes (counted in the panel's step: 2/3 picks up where it left off). */
  base: number;
  flash: 'good' | 'bad' | null;
  prev: Controls;
}

const FACE: QteKey[] = ['A', 'B', 'X', 'Y'];
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
// (on the keyboard the four are the directions, laid out like a pad's face buttons: down A, right B, left X, up Y
// (WASD or the arrows, as bound); all under one hand, not space, F and the mouse's two (the user's))
const held = (c: Controls, k: QteKey) => {
  if (inputDevice() === 'kbm' && k !== 'LEFT' && k !== 'RIGHT') return !!(k === 'A' ? c.down : k === 'B' ? c.right : k === 'X' ? c.left : c.up);
  return !!(k === 'A' ? c.jump : k === 'B' ? c.special : k === 'X' ? c.shoot : k === 'Y' ? c.secondary : k === 'LEFT' ? c.left : c.right);
};
/** Which of the QTE's buttons went down this frame. */
const downs = (c: Controls, prev: Controls) => (['A', 'B', 'X', 'Y', 'LEFT', 'RIGHT'] as QteKey[]).filter(k => held(c, k) && !held(prev, k));

/** The beats for one fight: `level` how many he's killed (0..7), `dazed` the suitor's reeling. (Eased a step: the user's.) */
const beatsFor = (level: number, dazed: boolean): Beat[] => {
  // (mixed up, the user's: not just bashing. Two beats, three for the last suitors; every fight has a run of
  // buttons in turn or a timed ring in it, and a mash no more than once)
  const n = Math.max(dazed ? 1 : 2, 2 + Math.floor(level / 4) - (dazed ? 1 : 0));
  const slow = dazed ? 1.2 : 1;
  const out: Beat[] = [];
  const kinds: Kind[] = level === 0 ? ['mash', 'press'] : [pick(['press', 'ring'] as Kind[])];
  while (kinds.length < n) {
    const last = kinds[kinds.length - 1];
    kinds.push(pick((['press', 'ring', 'alternate', 'mash'] as Kind[]).filter(k => k !== last && !(k === 'mash' && kinds.includes('mash')))));
  }
  for (let s = 0; s < n; s++) {
    const kind = kinds[s];
    const b: Beat = { kind, key: pick(FACE), seq: [], need: 0, got: 0, fill: 0, t: 0, dur: 0, next: 0, flubs: 0 };
    if (kind === 'mash') { b.need = 6 + Math.floor(level / 2); b.dur = Math.round(230 * slow); }
    if (kind === 'press') { b.need = 3 + Math.floor(level / 3); b.seq = Array.from({ length: b.need }, () => pick(FACE)); b.key = b.seq[0]; b.dur = Math.round(Math.max(60, 100 - level * 3) * slow); }
    if (kind === 'alternate') { b.need = 9 + Math.floor(level / 2); b.dur = Math.round(240 * slow); }
    if (kind === 'ring') { b.need = 2 + Math.floor(level / 4); b.dur = Math.round(Math.max(72, 112 - level * 3) * slow); }
    out.push(b);
  }
  return out;
};

/** The ring's target band (how shut the ring is when it counts). */
const BAND: [number, number] = [0.03, 0.38];
const LOCK = 30, PAUSE = 22;
/** The first frames of a press or a ring: nothing counts (a press still coming off the mash before it isn't a miss). */
const GRACE = 10;
/** A forgiven flub's cost: this many frames off the press's or the ring's time. */
const FLUB_COST = 14;

/** `done`: beats of his already won in an earlier go (only the rest now, one at least). */
export const startQte = (i: number, name: string, level: number, dazed: boolean, prev: Controls, done = 0): Qte =>
  ({ i, name, phase: 'lock', t: 0, ...(b => { const k = Math.min(done, b.length - 1); return { beats: b.slice(k), base: k }; })(beatsFor(level, dazed)), at: 0, flash: null, prev });

/** Each frame of it: his presses (the raw controls), and the panel. Returns what's become of it. */
export const updateQte = (q: Qte, controls: Controls): 'on' | 'won' | 'lost' => {
  const presses = downs(controls, q.prev);
  q.prev = controls;
  q.t++;
  const b = q.beats[q.at];
  const good = () => { q.flash = 'good'; playSound('ding', 0.5, 6); };
  const miss = () => { q.flash = 'bad'; q.phase = 'lost'; q.t = 0; playSound('alert', 0.6, -6); };
  // (a wrong button, or a ring pressed off its band: the first's forgiven, it costs time; the second's a miss)
  const flub = () => { b.flubs++; if (b.flubs > 1) { miss(); return; } b.t += FLUB_COST; q.flash = 'bad'; playSound('alert', 0.35, 4); };
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
        for (const k of presses) if (k === b.key) { b.got++; b.fill += 1 / b.need; playSound('punch', 0.25, 6 + Math.random() * 4); }
        // (full counts before it drains: drained first, a full meter was always a hair short of full and could never win)
        if (b.fill >= 1 - 1e-6) { b.fill = 1; beatDone(); }
        else { b.fill = Math.max(0, b.fill - 0.0018); if (b.t >= b.dur) miss(); }
      } else if (b.kind === 'press') {
        const face = b.t > GRACE || b.got > 0 ? presses.filter(k => FACE.includes(k)) : [];
        if (face.length) {
          if (face.includes(b.key)) { b.got++; b.t = 0; q.flash = null; playSound('punch', 0.4, 4); if (b.got >= b.need) beatDone(); else b.key = b.seq[b.got]; }
          else flub();
        } else if (b.t >= b.dur) miss();
        b.fill = b.got / b.need;
      } else if (b.kind === 'alternate') {
        const want: QteKey = b.next === 0 ? 'LEFT' : 'RIGHT';
        for (const k of presses) if (k === want) { b.got++; b.next = 1 - b.next; playSound('punch', 0.22, b.next ? 2 : 8); break; }
        b.fill = b.got / b.need;
        if (b.got >= b.need) beatDone(); else if (b.t >= b.dur) miss();
      } else {
        const r = 1 - b.t / b.dur;
        const face = b.t > GRACE ? presses.filter(k => FACE.includes(k)) : [];
        if (face.length) {
          if (face.includes(b.key) && r >= BAND[0] && r <= BAND[1]) { b.got++; b.t = 0; playSound('punch', 0.5, 2); b.key = pick(FACE); if (b.got >= b.need) beatDone(); else { q.flash = 'good'; } }
          else flub();
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
    step: q.base + Math.min(q.at + 1, q.beats.length), steps: q.base + q.beats.length, name: q.name, flash: q.flash,
  };
  setUi({ qte: ui });
  return 'on';
};

/** How hard he's winning it, 0..1 (for the struggle's look: who's leaning on whom). */
export const qteEdge = (q: Qte) => {
  const b = q.beats[Math.min(q.at, q.beats.length - 1)];
  return Math.min(1, (q.at + (b.kind === 'mash' ? b.fill : b.got / Math.max(1, b.need))) / q.beats.length);
};
