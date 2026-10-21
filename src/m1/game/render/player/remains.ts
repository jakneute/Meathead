// What's left of him after the third one (Meathead 2: game/player/gut.ts): blown to bits from the inside out, and the
// bits come down in a heap where he was squatting. His legs (his boots still on), his arms, a hunk of his torso (the
// abs still showing), his ribs, a rope of gut, his head on top (X'd out, tongue out), and on the very top of the heap,
// his dick and balls. All of it brown with what did it, and red, and steaming. World space.

import { glassesOn } from './body';
import { skinTone, skinShadow, skinHighlight, bootColor, bootToe } from './body';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';
/** The bits a touch bigger than life, so the heap reads for what it is. */
const S = 1.35;
const BLOOD = '#991B1B', BLOOD_DK = '#5B0B0B', SHIT = '#5C3A16', SHIT_LT = '#7A4E22';

interface Part { kind: 'leg' | 'arm' | 'torso' | 'ribs' | 'gut' | 'head' | 'dick' | 'chunk'; dx: number; dy: number; rot: number; flip: number; T: number; arc: number; spin: number }
/** Each bit: where it lands in the heap (from the middle of it, up off the floor), how it lies, how long it's up. */
const PARTS: Part[] = [
  { kind: 'leg', dx: -12, dy: 3, rot: -0.1, flip: 1, T: 44, arc: 70, spin: 0.3 },
  { kind: 'leg', dx: 10, dy: 3, rot: 0.15, flip: -1, T: 52, arc: 90, spin: -0.35 },
  { kind: 'torso', dx: -1, dy: 7, rot: 0.08, flip: 1, T: 40, arc: 50, spin: 0.2 },
  { kind: 'arm', dx: -16, dy: 9, rot: -0.5, flip: 1, T: 56, arc: 110, spin: 0.5 },
  { kind: 'arm', dx: 14, dy: 10, rot: 0.6, flip: -1, T: 60, arc: 120, spin: -0.45 },
  { kind: 'ribs', dx: 4, dy: 12, rot: -0.2, flip: 1, T: 48, arc: 80, spin: 0.4 },
  { kind: 'gut', dx: -6, dy: 13, rot: 0.1, flip: 1, T: 50, arc: 60, spin: 0.25 },
  { kind: 'chunk', dx: 20, dy: 2, rot: 0.4, flip: 1, T: 38, arc: 50, spin: 0.6 },
  { kind: 'chunk', dx: -21, dy: 2, rot: -0.3, flip: -1, T: 42, arc: 56, spin: -0.6 },
  { kind: 'head', dx: 2, dy: 19, rot: -0.35, flip: 1, T: 70, arc: 160, spin: 0.3 },
  { kind: 'dick', dx: -3, dy: 27, rot: 0.25, flip: 1, T: 84, arc: 190, spin: 0.55 },
];

const leg = (c: Ctx) => {
  // (lying along the floor: the bare thigh torn off at the top, the knee, the shin, the boot)
  c.fillStyle = INK; c.fillRect(-15, -5, 24, 9);
  c.fillStyle = skinTone; c.fillRect(-14, -4, 14, 7); c.fillStyle = skinShadow; c.fillRect(-14, 1, 14, 2); c.fillStyle = skinHighlight; c.fillRect(-12, -4, 10, 1);
  for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(60, 35, 15, 0.6)'; c.fillRect(-12 + i * 3, -2 + (i % 2), 1, 1); }
  // (the torn end: ragged, red, a knob of bone)
  c.fillStyle = BLOOD; c.beginPath(); c.moveTo(-15, -5); c.lineTo(-17, -2); c.lineTo(-15, 0); c.lineTo(-17, 3); c.lineTo(-14, 4); c.lineTo(-13, -5); c.fill();
  c.fillStyle = '#F1EFEA'; c.fillRect(-17, -1, 3, 2);
  // (the boot)
  c.fillStyle = INK; c.fillRect(0, -6, 11, 11);
  c.fillStyle = bootColor; c.fillRect(1, -5, 9, 9); c.fillStyle = '#3F3F46'; c.fillRect(1, -5, 9, 1); c.fillStyle = bootToe; c.fillRect(8, 1, 2, 3);
  c.fillStyle = '#52525B'; c.fillRect(2, -3, 5, 1); c.fillRect(2, -1, 5, 1);
};
const arm = (c: Ctx) => {
  // (the arm, torn off at the shoulder, the fist still balled up)
  c.fillStyle = INK; c.fillRect(-12, -4, 18, 8); c.beginPath(); c.arc(8, 0, 5.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinTone; c.fillRect(-11, -3, 16, 6); c.fillStyle = skinShadow; c.fillRect(-11, 1, 16, 2); c.fillStyle = skinHighlight; c.fillRect(-9, -3, 9, 1);
  c.fillStyle = '#EF4444'; c.fillRect(-6, -1, 6, 1);
  c.fillStyle = skinTone; c.beginPath(); c.arc(8, 0, 4.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinShadow; for (let k = 0; k < 3; k++) c.fillRect(10, -2.5 + k * 2, 2, 1);
  c.fillStyle = BLOOD; c.beginPath(); c.moveTo(-12, -4); c.lineTo(-14, -1); c.lineTo(-12, 1); c.lineTo(-14, 4); c.lineTo(-10, 4); c.lineTo(-10, -4); c.fill();
  c.fillStyle = '#F1EFEA'; c.fillRect(-14, -1, 2, 2);
};
const torso = (c: Ctx) => {
  // (a hunk of his middle: the abs, a nipple, torn all round)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinTone; c.beginPath(); c.ellipse(0, -0.5, 12, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinShadow; c.fillRect(-1, -6, 1, 11); c.fillRect(-7, -2, 14, 1); c.fillRect(-7, 2, 14, 1);
  c.fillStyle = skinHighlight; c.fillRect(-6, -5, 4, 2); c.fillRect(2, -5, 4, 2);
  c.fillStyle = '#C06A5A'; c.fillRect(-8, -4, 2, 2);
  c.fillStyle = BLOOD; for (const [x, y, w] of [[-13, -1, 3], [10, -2, 3], [-4, 6, 8], [4, -8, 5]]) c.fillRect(x, y, w, 2);
};
const ribs = (c: Ctx) => {
  c.fillStyle = BLOOD_DK; c.beginPath(); c.ellipse(0, 1, 10, 5, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#F1EFEA'; c.lineWidth = 1.6;
  for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(0, 6, 4 + k * 2.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.fillStyle = '#F1EFEA'; c.fillRect(-1, -4, 2, 9);
};
const gutRope = (c: Ctx) => {
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(-12, 0); c.bezierCurveTo(-6, -8, 0, 8, 6, -2); c.bezierCurveTo(9, -6, 12, 2, 14, 0); c.stroke();
  c.strokeStyle = '#D9707A'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-12, 0); c.bezierCurveTo(-6, -8, 0, 8, 6, -2); c.bezierCurveTo(9, -6, 12, 2, 14, 0); c.stroke();
  c.strokeStyle = '#F2A0A8'; c.lineWidth = 1; c.beginPath(); c.moveTo(-11, -1); c.bezierCurveTo(-6, -8, 0, 7, 6, -3); c.stroke();
};
const head = (c: Ctx) => {
  // (his head, on its side: the flat-top, the stubble, X'd out, his tongue out the side; the neck torn)
  c.fillStyle = INK; c.fillRect(-9, -10, 18, 19);
  c.fillStyle = skinTone; c.fillRect(-8, -6, 16, 14); c.fillStyle = skinShadow; c.fillRect(-8, 4, 16, 4); c.fillStyle = skinHighlight; c.fillRect(-6, -6, 6, 1);
  c.fillStyle = '#18181C'; c.fillRect(-9, -11, 18, 6); c.fillStyle = '#3A3A44'; c.fillRect(-8, -11, 16, 1);
  c.fillStyle = 'rgba(40, 30, 20, 0.35)'; c.fillRect(-8, 3, 16, 5);
  c.strokeStyle = INK; c.lineWidth = 1.2;
  for (const ex of [-4, 3]) { c.beginPath(); c.moveTo(ex - 1.8, -3); c.lineTo(ex + 1.8, 0.5); c.moveTo(ex + 1.8, -3); c.lineTo(ex - 1.8, 0.5); c.stroke(); }
  c.fillStyle = INK; c.fillRect(-4, 3, 8, 3); c.fillStyle = '#E36A7A'; c.fillRect(1, 4, 3, 4); c.fillStyle = '#B8455A'; c.fillRect(2, 5, 1, 2);
  if (glassesOn()) {
    // (Meathead 2's glasses, still on him, blown crooked: the lenses webbed, the bridge snapped)
    c.save(); c.rotate(0.15);
    for (const ex of [-4, 3]) {
      c.fillStyle = 'rgba(190, 220, 248, 0.24)'; c.fillRect(ex - 2.6, -3.4, 5.2, 4.2);
      c.strokeStyle = 'rgba(244, 250, 255, 0.9)'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(ex - 2, -2.6); c.lineTo(ex, -1); c.lineTo(ex + 2, -3); c.moveTo(ex, -1); c.lineTo(ex + 0.6, 0.6); c.stroke();
      c.strokeStyle = INK; c.lineWidth = 1.3; c.strokeRect(ex - 3, -4, 6, 5);
    }
    c.fillStyle = INK; c.fillRect(-9.5, -3, 3, 1.2);
    c.restore();
  }
  c.fillStyle = BLOOD; c.beginPath(); c.moveTo(-6, 9); c.lineTo(-3, 11); c.lineTo(0, 9); c.lineTo(3, 11); c.lineTo(6, 9); c.fill();
};
const dick = (c: Ctx) => {
  // (on top of it all: the dick and balls, hairy, a bit of the thatch still on)
  c.fillStyle = INK; c.beginPath(); c.ellipse(-3, 2, 5.5, 4.5, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.roundRect(-1, -3, 12, 6, 3); c.fill();
  c.fillStyle = skinShadow; c.beginPath(); c.ellipse(-3, 2, 4.5, 3.6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinTone; c.beginPath(); c.roundRect(0, -2, 10, 4, 2); c.fill();
  c.fillStyle = '#D9907A'; c.beginPath(); c.ellipse(9.5, 0, 2, 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = skinHighlight; c.fillRect(1, -2, 6, 1);
  c.fillStyle = '#3B2414'; c.beginPath(); c.ellipse(-4, -2, 4, 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD; c.fillRect(-8, -1, 2, 3);
};
const chunk = (c: Ctx) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = BLOOD; c.beginPath(); c.ellipse(0, -0.5, 5, 3, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#C0392B'; c.fillRect(-3, -2, 3, 1); c.fillStyle = '#F1EFEA'; c.fillRect(2, -1, 2, 2);
};
const DRAW: Record<Part['kind'], (c: Ctx) => void> = { leg, arm, torso, ribs, gut: gutRope, head, dick, chunk };

/** The heap (x the middle of it, y the floor), `t` frames since he went. */
export const drawRemains = (c: Ctx, r: { x: number; y: number; dir: number; at: number }, frame: number) => {
  const t = frame - r.at;
  // (the floor round it: blood and the rest, spreading)
  const spread = Math.min(1, t / 50);
  c.fillStyle = BLOOD_DK; c.beginPath(); c.ellipse(r.x, r.y - 0.5, 10 + spread * 26, 2 + spread * 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = SHIT; c.beginPath(); c.ellipse(r.x - r.dir * 6, r.y - 0.5, 6 + spread * 16, 1.5 + spread * 2.5, 0, 0, Math.PI * 2); c.fill();
  for (const p of PARTS) {
    const k = Math.min(1, t / p.T), landed = t >= p.T;
    // (up out of him, tumbling, and down onto the heap; a little bounce where it lands)
    const sx = r.x, sy = r.y - 34;
    const tx = r.x + p.dx * S * r.dir, ty = r.y - p.dy * S;
    const bounce = landed && t < p.T + 10 ? Math.sin(((t - p.T) / 10) * Math.PI) * 3 : 0;
    const x = sx + (tx - sx) * k + (landed ? 0 : Math.sin(k * Math.PI) * p.dx * 1.5 * r.dir);
    const y = sy + (ty - sy) * k - Math.sin(k * Math.PI) * p.arc - bounce;
    const rot = landed ? p.rot : p.rot + (1 - k) * p.spin * 30;
    c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot); c.scale(p.flip * r.dir * S, S);
    DRAW[p.kind](c);
    // (brown and red over it, once it's down)
    if (landed) { c.fillStyle = 'rgba(92, 58, 22, 0.55)'; c.fillRect(-4, -2, 5, 2); c.fillStyle = 'rgba(153, 27, 27, 0.45)'; c.fillRect(2, 1, 4, 2); }
    c.restore();
  }
  // (steam off it, and the flies arriving)
  if (t > 60) {
    for (let i = 0; i < 3; i++) {
      const k = ((frame * 0.015 + i * 0.33) % 1);
      c.strokeStyle = `rgba(150, 175, 70, ${(0.5 * (1 - k)).toFixed(2)})`; c.lineWidth = 1.4;
      const sx = r.x - 10 + i * 10, sy = r.y - 30 - k * 22;
      c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + 3, sy - 4, sx, sy - 8); c.stroke();
    }
    for (let i = 0; i < Math.min(4, Math.floor((t - 60) / 30) + 1); i++) {
      const a = frame * (0.13 + i * 0.03) + i * 1.9, fx = r.x + Math.cos(a) * (18 + i * 4), fy = r.y - 24 + Math.sin(a * 1.6) * 8;
      c.fillStyle = '#111827'; c.fillRect(fx - 1, fy - 1, 2.5, 2.5);
      if ((frame + i) % 4 < 2) { c.fillStyle = 'rgba(226, 232, 240, 0.7)'; c.fillRect(fx - 2, fy - 3, 2, 1.5); c.fillRect(fx + 1, fy - 3, 2, 1.5); }
    }
  }
  void SHIT_LT;
};
