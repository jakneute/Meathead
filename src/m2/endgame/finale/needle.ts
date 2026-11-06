// SPACE NEEDLE 2's fall (the owner's: "when space needle two falls, show a brief minicutscene of an overhead shot of
// central florida as the thing falls down from central florida to port canaveral, it interrupts a space launch at the
// last second. cut to a gross up shot of a pissed off elon musk shaking his fist"). A few seconds, no input, no HUD,
// skippable all at once (the scene player's): the map from over Florida (SNES-ish: the sea in bands, the peninsula,
// the lakes, Orlando's dot), the tower's line growing east out of the park all the way to the cape; the rocket on its
// pad and the countdown; the tip on it at the last second; then his gross-up (screen space: finale index.ts), the rage.

import { createScene, type Beat, type Scene } from '../../intro/gym/scene';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { warmMuskGross } from './muskGross';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const INK = '#0B0A10';

/** Where things are on the map (art px): the park (Orlando), the pad (the cape). */
const PARK: [number, number] = [118, 66], PAD: [number, number] = [176, 56];
export const needleClip = { impactAt: -1 };

let mapCv: HTMLCanvasElement | null = null;
const map = () => {
  if (mapCv) return mapCv;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 144;
  const g = cv.getContext('2d')!;
  // (the sea: banded, deep to shallow off the coasts)
  const SEA = ['#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6'];
  for (let i = 0; i < 4; i++) R(g, 0, 0, 256, 144, SEA[0]);
  // (the peninsula, its shallows round it in steps)
  const shape = [60, 0, 210, 0, 196, 30, 186, 52, 196, 70, 204, 100, 214, 130, 206, 144, 150, 144, 126, 120, 110, 96, 96, 70, 72, 46, 40, 30, 20, 20, 0, 18, 0, 0];
  for (const [grow, col] of [[6, SEA[3]], [3, SEA[2]], [0, '#5E9A4A']] as [number, string][]) {
    g.fillStyle = col; g.beginPath();
    for (let i = 0; i < shape.length; i += 2) { const x = shape[i] + (shape[i] > 128 ? grow : -grow), y = shape[i + 1]; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath(); g.fill();
  }
  // (the green in steps, darker inland; the lakes; Okeechobee)
  g.fillStyle = '#4E8A3E'; g.beginPath(); g.ellipse(140, 70, 40, 60, 0.2, 0, Math.PI * 2); g.fill();
  for (const [x, y, rx, ry] of [[150, 112, 12, 9], [120, 80, 3, 2], [128, 58, 2, 2], [108, 74, 2, 3]] as const) { g.fillStyle = '#3B82F6'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); }
  // (roads, a dither of towns; the cape's hook)
  g.fillStyle = '#C8B89A'; for (let k = 0; k < 40; k++) g.fillRect(100 + ((k * 37) % 90), 20 + ((k * 53) % 110), 1, 1);
  R(g, 186, 50, 6, 10, '#5E9A4A'); R(g, 190, 48, 3, 4, '#D8C89A');
  // (the park: Happy Land's dot, a ring; the pad: the gantry and the rocket)
  R(g, PARK[0] - 4, PARK[1] - 4, 8, 8, INK); R(g, PARK[0] - 3, PARK[1] - 3, 6, 6, '#F472B6');
  R(g, PAD[0] - 3, PAD[1] - 3, 6, 6, '#9CA3AF');
  g.font = '5px "Press Start 2P"'; g.fillStyle = '#F8FAFC'; g.fillText('ORLANDO', PARK[0] - 18, PARK[1] + 12); g.fillText('THE CAPE', PAD[0] - 12, PAD[1] - 10);
  mapCv = cv;
  return cv;
};

/** The map: the tower's line out of the park toward the cape (growing as it falls), the rocket, the countdown, the hit. */
const shotMap = (c: Ctx, t: number) => {
  c.drawImage(map(), 0, 0);
  const imp = needleClip.impactAt;
  // (the fall: most of the way slowly, the last stretch quick once the beat's on it)
  const fall = imp < 0 ? Math.min(0.85, t / 160) : Math.min(1, 0.85 + (t - imp) / 12 * 0.15);
  const ex = PARK[0] + (PAD[0] - PARK[0]) * fall, ey = PARK[1] + (PAD[1] - PARK[1]) * fall;
  // (its shadow, then it: a white line, the decks' rings along it)
  c.strokeStyle = 'rgba(0, 0, 0, 0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(PARK[0] + 2, PARK[1] + 3); c.lineTo(ex + 2, ey + 3); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(PARK[0], PARK[1]); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = '#F1F5F9'; c.lineWidth = 1.5; c.stroke();
  for (let k = 1; k <= 4; k++) { const u = (k / 5) * fall, x = PARK[0] + (PAD[0] - PARK[0]) * u, y = PARK[1] + (PAD[1] - PARK[1]) * u; R(c, x - 2, y - 1, 4, 2, '#38BDF8'); }
  const hit = imp >= 0 && t - imp >= 12;
  if (!hit) {
    // (the rocket on its pad, venting, ready)
    R(c, PAD[0] - 1, PAD[1] - 9, 3, 9, '#F8FAFC'); R(c, PAD[0] - 1, PAD[1] - 10, 3, 1, '#DC2626');
    if ((t >> 2) % 2) R(c, PAD[0] - 3, PAD[1], 7, 2, '#E5E7EB');
  } else {
    // (the hit: the fireball in stepped rings, chunks off it)
    const k = Math.min(1, (t - imp - 12) / 30);
    for (const [r, col] of [[18, '#7F1D1D'], [13, '#EA580C'], [8, '#FDE047'], [3, '#FFFFFF']] as [number, string][]) { c.fillStyle = col; c.beginPath(); c.arc(PAD[0], PAD[1], r * (0.4 + k), 0, Math.PI * 2); c.fill(); }
    for (let i = 0; i < 8; i++) { const a = i * 0.8, d = k * 26; R(c, PAD[0] + Math.cos(a) * d, PAD[1] + Math.sin(a) * d, 2, 2, '#9CA3AF'); }
  }
  // (the countdown, on the map by the pad)
  if (!hit) { c.font = '7px "Press Start 2P"'; c.fillStyle = INK; const n = imp >= 0 ? 'T-1' : t < 70 ? 'T-3' : 'T-2'; c.fillText(n, PAD[0] + 9, PAD[1] + 4); c.fillStyle = '#FDE047'; c.fillText(n, PAD[0] + 8, PAD[1] + 3); }
};
const shotBlack = (c: Ctx) => { R(c, 0, 0, 256, 144, '#000'); };

export const startNeedle = (): Scene => {
  needleClip.impactAt = -1;
  warmMuskGross();
  let shotT = 0;
  const map2 = (c: Ctx, t: number, talking: boolean) => { shotT = t; shotMap(c, t); void talking; };
  const beats: (Beat & { gross?: 'musk' })[] = [
    { shot: map2, hold: 50, enter: () => { playSound('rumble', 0.8, -12); playSound('whoosh', 0.7, -16); } },
    { shot: map2, who: 'LAUNCH CONTROL', voice: 'm2.space.needle', text: pickLine(L.NEEDLE_COUNT), at: [PAD[0], PAD[1] - 12], hold: 4 },
    { shot: map2, hold: 70, enter: () => { needleClip.impactAt = shotT; setTimeout(() => { playSound('boom', 1, -10); playSound('nuke', 0.6, -6); }, 200); } },
    { shot: shotBlack, who: 'ROCKET GUY', voice: L.MUSK_VOICE, text: pickLine(L.MUSK_RAGE), at: [128, 112], hold: 30, gross: 'musk' },
  ];
  return createScene(beats);
};
export const needleGross = (s: Scene) => (s.beats[s.i] as Beat & { gross?: 'musk' })?.gross === 'musk';
