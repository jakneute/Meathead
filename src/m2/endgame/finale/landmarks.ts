// THE KAIJU FINALE's landmarks, run: each stands on the ground where sections.ts puts it, painted once (stamped), till
// it comes down:
//   stepped on    (him walking into it, or a boss landing on it: every landmark but its section's throw target) it
//                 sinks into its own dust, in slices from the side it was hit, chunks flung, dust rolling out; a
//                 tower topples over instead (baked once into its own canvas so it can be drawn turned)
//   thrown into   (its section's throw target: throw.ts lands a boss in it) the same, harder: twice the chunks, the
//                 dust higher, a shake, fire after
// Then its rubble (painted once): a heap in its colors, fire on it a while if it burns (dimmed), then smoke.
// Culled by where it is on screen, its whole drawn size as margin (no pop-in). No per-frame painting.

import type { GameState } from '../../../m1/game/core/state';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { stamp } from '../../../m1/game/render/stamp';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { LANDMARKS, SECTIONS, AMERICA_RX, type LandmarkDef } from './sections';
import { SEC_X, floorY } from './geo';
import { debris, dustLine, puff, fireAt } from './fx';
import { INK } from './landmarkArt';

type Ctx = CanvasRenderingContext2D;

export interface Lm {
  def: LandmarkDef;
  x: number; foot: number;
  /** Its section (-1: AMERICA USA); whether it's that section's throw target (only a throw takes it down). */
  sec: number; target: boolean;
  st: 'up' | 'fall' | 'down';
  t: number;
  /** Which way it goes (from where it was hit): -1 left, 1 right. */
  dir: 1 | -1;
  /** Hard (a throw's). */
  hard: boolean;
  /** Its slices' delays (from where it was hit). */
  delay: number[];
  /** Toppling: its angle, how fast. */
  ang: number; va: number;
  /** Someone's said their callback for it (or it's had its chance). */
  said: boolean;
  /** Taken away whole (the water tower, ripped up for a club): not drawn at all. */
  gone?: boolean;
}

export const makeLandmarks = (): Lm[] => {
  const out: Lm[] = [];
  const add = (id: string, x: number, sec: number, target: boolean) => {
    const def = LANDMARKS[id];
    out.push({ def, x, foot: floorY(x), sec, target, st: 'up', t: 0, dir: 1, hard: false, delay: [], ang: 0, va: 0, said: false });
  };
  add('america', AMERICA_RX, -1, false);
  SECTIONS.forEach((s, i) => {
    for (const [id, rx] of s.stomps) add(id, SEC_X[i] + rx, i, false);
    if (s.throwAt) add(s.throwAt, SEC_X[i] + s.throwRx, i, true);
  });
  return out;
};

const slices = (d: LandmarkDef) => (d.fall === 'domino' ? 18 : Math.max(4, Math.min(16, Math.round(d.w / 22))));

/** Brings it down (`hard`: a throw's; `from`: the world x it was hit at). */
export const bringDown = (state: GameState, m: Lm, from: number, hard = false) => {
  if (m.st !== 'up') return;
  m.st = 'fall'; m.t = 0; m.hard = hard; m.dir = from <= m.x ? 1 : -1;
  const n = slices(m.def), d = m.def;
  m.delay = Array.from({ length: n }, (_, i) => {
    const sx = m.x - d.w / 2 + ((i + 0.5) / n) * d.w;
    // (dominoes: each one over into the next, a second and a half from end to end)
    if (d.fall === 'domino') return Math.round(Math.abs(sx - from) / d.w * 90);
    return Math.round(Math.abs(sx - from) / d.w * (hard ? 10 : 22) + ((i * 37) % 7));
  });
  m.ang = 0; m.va = hard ? 0.004 : 0.002;
  debris(m.x, m.foot - d.h * 0.6, hard ? 26 : 12, d.debris, hard ? 5 : 3, hard ? 7 : 4);
  dustLine(m.x - d.w / 2, m.x + d.w / 2, m.foot, Math.round(d.w / 18), '#C8BCA8', hard ? 1.6 : 1);
  playSound(hard ? 'boom' : 'crash', hard ? 0.9 : 0.6, hard ? -8 : -4 + Math.random() * 4);
  playSound('rumble', hard ? 0.7 : 0.4, -6);
  shakeScreen(state, hard ? 22 : 10, hard ? 5 : 2.5);
};

export const updateLandmarks = (state: GameState, ms: Lm[], onDown: (m: Lm) => void) => {
  for (const m of ms) {
    if (m.st !== 'fall') continue;
    m.t++;
    const d = m.def;
    if (d.fall === 'topple') {
      m.va += m.hard ? 0.0016 : 0.0011; m.ang += m.va;
      if (m.ang >= Math.PI / 2) {
        m.ang = Math.PI / 2; m.st = 'down'; m.t = 0;
        const x0 = m.x, x1 = m.x + m.dir * d.h;
        dustLine(Math.min(x0, x1), Math.max(x0, x1), m.foot, Math.min(30, Math.round(d.h / 14)), '#C8BCA8', 1.3);
        debris((x0 + x1) / 2, m.foot - 10, 16, d.debris, 5, 5);
        playSound('crash', 0.9, -10); playSound('boom', 0.6, -14); shakeScreen(state, 16, 4);
        onDown(m);
      }
      continue;
    }
    if (m.t % 6 === 0 && m.t < 60) { puff(m.x + (Math.random() - 0.5) * d.w, m.foot - Math.random() * d.h * 0.5, 8 + Math.random() * 6); }
    if (m.t > Math.max(...m.delay) + 40) {
      m.st = 'down'; m.t = 0;
      if (d.fire || m.hard) fireAt(m.x, m.foot, d.w * 0.6, m.hard ? 900 : 600);
      onDown(m);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** A landmark's rubble, painted once: a heap in its colors (its share of the height), chunks and beams out of it. */
const paintRubble = (g: Ctx, d: LandmarkDef, long: number) => {
  const w = long || d.w, h = long ? 8 : Math.max(6, Math.min(20, d.h * 0.2));
  const x0 = long ? 0 : -w / 2;
  g.beginPath(); g.moveTo(x0, 0);
  for (let k = 0; k <= 12; k++) { const x = x0 + (k / 12) * w, bump = Math.sin((k / 12) * Math.PI) * h * (0.7 + ((k * 7) % 5) / 10); g.lineTo(x, -bump); }
  g.lineTo(x0 + w, 0); g.closePath(); g.fillStyle = '#6A625A'; g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
  for (let k = 0; k < Math.round(w / 6); k++) {
    const x = x0 + ((k * 53) % 997) / 997 * w, top = Math.sin(((x - x0) / w) * Math.PI) * h * 0.8, y = -((k * 31) % 100) / 100 * top;
    const s = 2 + (k % 4);
    g.fillStyle = INK; g.fillRect(Math.round(x) - 1, Math.round(y - s) - 1, s + 2, s + 2);
    g.fillStyle = d.debris[k % d.debris.length]; g.fillRect(Math.round(x), Math.round(y - s), s, s);
  }
  for (let k = 0; k < Math.round(w / 40); k++) { const x = x0 + (k + 0.5) * (w / Math.max(1, Math.round(w / 40))); g.strokeStyle = d.debris[0]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, -h * 0.3); g.lineTo(x + 6, -h * 0.9 - 4); g.stroke(); }
};

/** A tower's own canvas (to be drawn turned as it topples), painted once (2 to the world's pixel: the screen's). */
const turned = new Map<string, HTMLCanvasElement>();
const RES = 2;
export const towerArt = (d: LandmarkDef) => towerCanvas(d);
const towerCanvas = (d: LandmarkDef) => {
  let cv = turned.get(d.id);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = (d.w + 8) * RES; cv.height = (d.h + 8) * RES;
    const g = cv.getContext('2d')!; g.scale(RES, RES); g.translate(d.w / 2 + 4, d.h + 4); d.paint(g);
    turned.set(d.id, cv);
  }
  return cv;
};
/** (the run's end, a death, the title: the towers' canvases let go) */
export const dropTurned = () => turned.clear();

const onScreen = (state: GameState, x0: number, x1: number) => x1 > state.camera.x - 20 && x0 < state.camera.x + W + 20;

export const drawLandmarks = (c: Ctx, state: GameState, ms: Lm[]) => {
  for (const m of ms) {
    if (m.gone) continue;
    const d = m.def;
    // (its whole drawn reach, fallen or standing: a toppled tower lies its height along the ground)
    const reach = d.fall === 'topple' && m.st !== 'up' ? d.h + d.w : d.w / 2 + 8;
    if (!onScreen(state, m.x - reach, m.x + reach)) continue;
    const X = Math.round(m.x), Y = m.foot;
    if (m.st === 'up') {
      c.save(); c.translate(X, Y);
      stamp(c, `fin-lm-${d.id}`, -d.w / 2 - 6, -d.h - 8, d.w + 12, d.h + 12, d.paint);
      c.restore();
      continue;
    }
    if (d.fall === 'topple') {
      if (m.st === 'down') { c.save(); c.translate(m.dir > 0 ? X : X - d.h, Y); stamp(c, `fin-rbl-${d.id}`, -2, -14, d.h + 4, 16, g => paintRubble(g, d, d.h)); c.restore(); continue; }
      const cv = towerCanvas(d);
      c.save(); c.translate(X, Y); c.rotate(m.dir * m.ang);
      c.drawImage(cv, -d.w / 2 - 4, -d.h - 4, d.w + 8, d.h + 8);
      c.restore();
      continue;
    }
    // (sinking, in slices: each its own way down, clipped at the ground; the rubble coming up under it)
    const n = m.delay.length, sw = (d.w + 12) / n;
    if (m.st === 'fall') {
      for (let i = 0; i < n; i++) {
        const t = Math.max(0, m.t - m.delay[i]), sink = Math.min(d.h + 10, t * t * (m.hard ? 0.09 : 0.05));
        if (sink >= d.h + 10) continue;
        const sx = -d.w / 2 - 6 + i * sw, wob = t > 0 ? Math.round(Math.sin(t * 0.9 + i) * 1.5) : 0;
        c.save(); c.translate(X, Y);
        c.beginPath(); c.rect(Math.floor(sx), -d.h - 10, Math.ceil(sw) + 1, d.h + 10); c.clip();
        c.translate(wob, Math.round(sink));
        stamp(c, `fin-lm-${d.id}`, -d.w / 2 - 6, -d.h - 8, d.w + 12, d.h + 12, d.paint);
        c.restore();
      }
    }
    c.save(); c.translate(X, Y);
    if (m.st === 'down' || m.t > 10) stamp(c, `fin-rb-${d.id}`, -d.w / 2 - 4, -26, d.w + 8, 28, g => paintRubble(g, d, 0));
    c.restore();
  }
};
