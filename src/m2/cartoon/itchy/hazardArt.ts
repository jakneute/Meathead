// PUNCHY & KICKY's hazards, drawn (world space; crude-but-clean first pass). What he can stand on is lit along its
// top (an anvil sat on the path, a hammer's head lying there, the safe, the piano's wreck, the crates, the cannon's
// carriage); the machinery behind the path (the gantry, the animatronics' bodies, the crane, the lift) is dimmed
// scenery. Every tell drawn: the shadows growing under what's coming down, the hatch rattling, the hammer hauled back
// and the robot's eyes lit red, the rake's tines, the open jaws, the crate shaking, the rope fraying, the barrel
// dipping or rising and its touch hole fizzing, the spark crawling along the fuse.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { box, hour, dimmed, onScreen, INK, type Ctx } from '../kit';
import { GY } from '../geometry';
import { itchyOf, type Hammer, type Drop, type Cannon, type Fuse } from './state';
import {
  AW, AH, A_TELL, A_FALL, A_DOWN, H_PIVOT, H_HEAD_W, H_HEAD_H, RAKE_LEN, GLOVE_REACH, BALL_R, hammerHead, glovePos, fusePoint,
} from './hazards';
import { GANTRY, CRATES, SAFE, PIANO, CANNON, X, Y } from './layout';
import { catHead, mouseHead, cleaver, dynamiteStick, foldedHole } from './kindArt';

const LIP = '#FFFBEB';
const STEEL = '#52525B';

// ---------------------------------------------------------------------------------------------------------------
// Anvils

/** An anvil, its bottom's middle at (x, y): the horn out to the left, the face lit on top, the waist, the base. */
export const anvil = (c: Ctx, x: number, y: number, lit = true) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  const S = hour(STEEL), D = hour('#27272A'), L = hour('#A1A1AA');
  // (the base, the waist, the body, the horn)
  c.fillStyle = INK;
  c.beginPath(); c.moveTo(-24, 0); c.lineTo(24, 0); c.lineTo(18, -8); c.lineTo(10, -12); c.lineTo(12, -22); c.lineTo(26, -24); c.lineTo(26, -34); c.lineTo(-14, -34); c.quadraticCurveTo(-30, -32, -34, -26); c.quadraticCurveTo(-22, -24, -12, -22); c.lineTo(-10, -12); c.lineTo(-18, -8); c.closePath(); c.fill();
  c.fillStyle = S;
  c.beginPath(); c.moveTo(-21, -2); c.lineTo(21, -2); c.lineTo(16, -8); c.lineTo(8, -12); c.lineTo(10, -24); c.lineTo(24, -25); c.lineTo(24, -32); c.lineTo(-14, -32); c.quadraticCurveTo(-26, -30, -30, -26); c.quadraticCurveTo(-20, -25, -10, -23); c.lineTo(-8, -12); c.lineTo(-16, -8); c.closePath(); c.fill();
  box(c, -8, -22, 6, 10, D); box(c, 14, -30, 8, 6, D);
  box(c, -20, -6, 40, 2, D);
  // (the face: lit along the top where he stands)
  box(c, -14, -32, 38, 2, lit ? LIP : L);
  box(c, -24, -28, 8, 2, L);
  c.restore();
};
/** A shadow growing on the floor under something coming down (`k` 0..1 how close). */
const shadow = (c: Ctx, x: number, y: number, w: number, k: number) => {
  c.fillStyle = `rgba(20,10,30,${0.12 + k * 0.4})`;
  c.beginPath(); c.ellipse(x, y + 1, (w / 2) * (0.35 + k * 0.75), 4 + k * 3, 0, 0, Math.PI * 2); c.fill();
};
/** The GENERIC-CO gantry over ANVIL ALLEY: a truss on two towers, a crate of anvils on top, a hatch for each door,
 *  the winch's rope and hook down while it's hauling one back up. */
const gantry = (c: Ctx, state: GameState) => {
  const k = itchyOf(state), a = X(GANTRY.a), b = X(GANTRY.b), top = Y(GANTRY.h);
  if (!onScreen(state, a - 40, b + 40)) return;
  const D = dimmed(INK), M = dimmed('#B91C1C'), Y2 = dimmed('#FACC15');
  for (const px of [a, b - 22]) { box(c, px, top - 10, 22, GY - top + 10, D); box(c, px + 3, top - 8, 16, GY - top + 8, M); for (let y = top; y < GY; y += 26) { c.strokeStyle = D; c.lineWidth = 2; c.beginPath(); c.moveTo(px + 3, y); c.lineTo(px + 19, y + 26); c.stroke(); } }
  box(c, a - 10, top - 26, b - a + 20, 26, D); box(c, a - 8, top - 24, b - a + 16, 22, Y2);
  for (let x = a; x < b; x += 30) { c.strokeStyle = D; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top - 24); c.lineTo(x + 15, top - 2); c.lineTo(x + 30, top - 24); c.stroke(); }
  // (the crates of anvils up on top, GENERIC-CO stenciled)
  for (let x = a + 40; x < b - 60; x += 170) { box(c, x, top - 70, 90, 44, D); box(c, x + 2, top - 68, 86, 40, dimmed('#A16207')); signText(c, 'GENERIC-CO', x + 45, top - 46, { sx: 1, sy: 1, stencil: true, fill: dimmed('#1F2937') }); signText(c, 'ANVILS', x + 45, top - 36, { sx: 1, sy: 1, stencil: true, fill: dimmed('#7F1D1D') }); }
  // (each door's hatch: shut, rattling (the tell), hanging open)
  for (const an of k.anvils) {
    if (an.door === undefined) continue;
    const x = an.x, rattle = an.phase === 'tell' ? ((state.frame >> 1) % 2 ? 1 : -1) : 0, open = an.phase === 'fall' || an.phase === 'down' || an.phase === 'lift';
    box(c, x - AW / 2 - 6, top - 4, AW + 12, 6, D);
    if (open) { box(c, x - AW / 2 - 4, top, 6, 30, dimmed('#3F3F46')); box(c, x + AW / 2 - 2, top, 6, 30, dimmed('#3F3F46')); }
    else box(c, x - AW / 2 - 4, top - 3 + rattle, AW + 8, 5, dimmed('#3F3F46'));
    // (the winch's rope and hook, down to it, hauling it back up)
    const cyc = an.cyc ?? -1;
    if (an.phase === 'lift' || (an.phase === 'down' && cyc > A_TELL + A_FALL + A_DOWN - 18)) {
      const hy = an.phase === 'lift' ? an.y - AH : GY - AH - Math.max(0, A_TELL + A_FALL + A_DOWN - cyc) * 14;
      c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, top); c.lineTo(x, hy); c.stroke();
      c.strokeStyle = hour('#A1A1AA'); c.lineWidth = 2; c.beginPath(); c.arc(x + 3, hy + 3, 4, Math.PI, Math.PI * 2.4); c.stroke();
    }
  }
};
const drawAnvilsBack = (c: Ctx, state: GameState) => {
  for (const a of itchyOf(state).anvils) {
    if (!onScreen(state, a.x - 60, a.x + 60)) continue;
    if (a.phase === 'tell' || a.phase === 'fall') {
      const land = a.land ?? GY;
      const k = a.host ? (a.phase === 'tell' ? Math.min(0.6, a.t / 60) : 0.6 + Math.min(0.4, a.t / 30)) : a.phase === 'tell' ? 0.12 + Math.max(0, a.cyc ?? 0) / A_TELL * 0.2 : Math.max(0.3, Math.min(1, (a.y - Y(GANTRY.h)) / (GY - Y(GANTRY.h))));
      if (a.land !== null || !a.host) shadow(c, a.x, land, AW + 20, Math.max(0.1, k));
    }
  }
};
const drawAnvilsFront = (c: Ctx, state: GameState) => {
  for (const a of itchyOf(state).anvils) {
    if (!onScreen(state, a.x - 60, a.x + 60)) continue;
    if (a.phase === 'fall' || a.phase === 'lift') {
      anvil(c, a.x, a.y, false);
      // (speed lines over it as it drops)
      if (a.phase === 'fall') { c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2; for (const dx of [-18, 0, 18]) { c.beginPath(); c.moveTo(a.x + dx, a.y - AH - 8); c.lineTo(a.x + dx, a.y - AH - 34); c.stroke(); } }
    } else if (a.phase === 'down') anvil(c, a.x, a.y, true);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The KILL-O-RAMA's giant animatronics and their hammers

/** The robot behind the path (dimmed: it's scenery, its plinth too), its free arm, its eyes lit red in the wind-up. */
const animatronic = (c: Ctx, state: GameState, h: Hammer, broken: boolean) => {
  const x = X(h.d.x), s = h.d.side, cat = h.d.who === 'punchy', wind = h.phase === 'wind';
  const fur = dimmed(cat ? '#EA8A2E' : '#A8A29E'), D = dimmed(INK);
  // (the plinth: a red drum, the name on it)
  box(c, x - 70, Y(70), 140, 70, D); box(c, x - 67, Y(67), 134, 67, dimmed('#7F1D1D'));
  box(c, x - 70, Y(74), 140, 8, dimmed('#FACC15'));
  signText(c, cat ? 'PUNCHY' : 'KICKY', x, Y(36), { sx: 2, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink: D });
  // (the body: a barrel of a torso, stubby legs on the plinth, the free arm on its hip)
  for (const lx of [-22, 10]) { box(c, x + lx, Y(150), 14, 78, D); box(c, x + lx + 2, Y(148), 10, 74, fur); }
  c.fillStyle = D; c.beginPath(); c.ellipse(x, Y(190), 46, 60, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = fur; c.beginPath(); c.ellipse(x, Y(190), 43, 57, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = dimmed('#FFF4E0'); c.beginPath(); c.ellipse(x + s * 6, Y(180), 22, 34, 0, 0, Math.PI * 2); c.fill();
  // (the seams and bolts of a cheap robot; a splat of red on it)
  c.strokeStyle = D; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 40, Y(200)); c.lineTo(x + 40, Y(200)); c.stroke();
  for (const bx of [-30, -10, 10, 30]) box(c, x + bx, Y(203), 3, 3, D);
  c.fillStyle = dimmed('#B91C1C'); c.beginPath(); c.arc(x - s * 18, Y(170), 7, 0, Math.PI * 2); c.fill();
  // (the head: the show's own, big, on a neck of pistons; broken on a later visit: drooped off, wires out, sparking)
  const hx = x + s * 4, hy = broken && !cat ? Y(150) : Y(268);
  c.save(); c.translate(hx, hy); if (s < 0) c.scale(-1, 1);
  if (broken && !cat) c.rotate(1.2);
  (cat ? catHead : mouseHead)(c, 0, 0, 34, wind ? -0.08 : 0);
  // (the eyes lit red in the wind-up: the tell)
  if (wind || (broken && (state.frame >> 3) % 5 === 0)) { c.fillStyle = 'rgba(255,40,40,0.85)'; c.beginPath(); c.arc(cat ? 17 : 19, cat ? -5 : -9, 6, 0, Math.PI * 2); c.arc(cat ? -2 : 5, cat ? -4 : -8, 4.5, 0, Math.PI * 2); c.fill(); }
  c.restore();
  if (broken && !cat) {
    c.strokeStyle = '#18181B'; c.lineWidth = 2; for (const k of [-6, 0, 6]) { c.beginPath(); c.moveTo(x + k, Y(246)); c.quadraticCurveTo(x + k * 3, Y(200), hx + k, hy - 20); c.stroke(); }
    if ((state.frame >> 2) % 6 === 0) { c.fillStyle = '#FDE047'; for (let i = 0; i < 4; i++) c.fillRect(x - 8 + i * 5, Y(250) - (i % 2) * 6, 2, 2); }
  } else { box(c, x - 6, Y(252), 12, 16, D); box(c, x - 4, Y(250), 8, 14, dimmed('#71717A')); }
};
/** The hammer arm and mallet: from the shoulder out to the head (in front of him when it's down on the path). */
const hammerArm = (c: Ctx, h: Hammer) => {
  const s = h.d.side, px = X(h.d.x), py = Y(H_PIVOT), hd = hammerHead(h, h.ang);
  const cat = h.d.who === 'punchy';
  // (the arm: a fat furry tube to a white glove round the handle, the handle on to the head)
  const gx = px + (hd.x - px) * 0.42, gy = py + (hd.y - py) * 0.42;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 26; c.beginPath(); c.moveTo(px, py); c.lineTo(gx, gy); c.stroke();
  c.strokeStyle = hour(cat ? '#EA8A2E' : '#A8A29E'); c.lineWidth = 21; c.stroke();
  c.strokeStyle = INK; c.lineWidth = 14; c.beginPath(); c.moveTo(gx, gy); c.lineTo(hd.x, hd.y); c.stroke();
  c.strokeStyle = hour('#C2853F'); c.lineWidth = 10; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(gx, gy, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#FAFAFA'); c.beginPath(); c.arc(gx, gy, 13, 0, Math.PI * 2); c.fill();
  // (the head: a barrel on the handle's end, its striking face (blood on it) turning to come down flat on the path)
  const a = Math.atan2(hd.y - py, hd.x - px), down = hammerHead(h, hd.down), aDown = Math.atan2(down.y - py, down.x - px);
  c.save(); c.translate(hd.x, hd.y); c.rotate(a - aDown);
  const W = H_HEAD_W, Hh = H_HEAD_H;
  c.fillStyle = INK; c.beginPath(); c.roundRect(-W / 2 - 3, -Hh / 2 - 3, W + 6, Hh + 6, 10); c.fill();
  c.fillStyle = hour('#D9A066'); c.beginPath(); c.roundRect(-W / 2, -Hh / 2, W, Hh, 8); c.fill();
  c.fillStyle = hour('#EBC08E'); c.fillRect(-W / 2 + 4, -Hh / 2 + 3, 8, Hh - 6);
  c.fillStyle = hour('#B07A45'); c.fillRect(W / 2 - 14, -Hh / 2 + 3, 10, Hh - 6);
  for (const by of [-Hh / 2 + 10, Hh / 2 - 16]) { c.fillStyle = hour('#8B5A2B'); c.fillRect(-W / 2, by, W, 6); }
  c.fillStyle = '#B91C1C'; c.fillRect(-W / 2 + 4, Hh / 2 - 6, W - 8, 4); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-W / 2 + 10 + i * 13, Hh / 2 - 6 - (i % 2) * 4, 3 + (i % 2), 0, Math.PI * 2); c.fill(); }
  c.restore();
  void s;
  // (down on the path: its top lit (stand on it))
  if (h.phase === 'down') { box(c, hd.x - W / 2 + 6, GY - Hh - 1, W - 12, 2, LIP); }
};

// ---------------------------------------------------------------------------------------------------------------
// Rakes, bear traps, the crates

const rake = (c: Ctx, x: number, dir: -1 | 1, up: number) => {
  // (the tines at x, the handle lying off along `dir`; up: swung up about the tines, into a face, and back down)
  const k = up > 0 ? Math.sin(Math.min(1, (44 - up) / 10) * Math.PI / 2) * (up < 14 ? up / 14 : 1) : 0;
  const ang = dir > 0 ? -k * 1.45 : Math.PI + k * 1.45;
  const ex = x + Math.cos(ang) * RAKE_LEN, ey = GY - 3 + Math.sin(ang) * RAKE_LEN;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x, GY - 3); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = hour('#C2853F'); c.lineWidth = 3; c.stroke();
  // (the head: a steel bar across, the tines pointing up, glinting)
  box(c, x - 12, GY - 5, 24, 4, INK); box(c, x - 11, GY - 4, 22, 2, hour('#A1A1AA'));
  for (let i = 0; i < 6; i++) { box(c, x - 11 + i * 4, GY - 12, 2, 8, INK); box(c, x - 10.5 + i * 4, GY - 11, 1, 7, hour('#E4E4E7')); }
};
const trap = (c: Ctx, x: number, sprung: boolean, t: number) => {
  // (a steel bear trap: the plate, the chain to a stake; open: two jaws flat out, teeth up; sprung: jaws shut)
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 18, GY - 2); c.quadraticCurveTo(x + 30, GY + 2, x + 38, GY - 2); c.stroke();
  box(c, x + 36, GY - 8, 3, 8, hour('#57534E'));
  box(c, x - 6, GY - 4, 12, 4, INK); box(c, x - 5, GY - 3, 10, 2, hour('#A16207'));
  if (!sprung) {
    for (const s of [-1, 1]) {
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(x + s * 10, GY - 1, 10, s > 0 ? Math.PI : Math.PI * 2, s > 0 ? Math.PI * 2 : Math.PI, s < 0); c.stroke();
      c.strokeStyle = hour('#A1A1AA'); c.lineWidth = 2; c.stroke();
      for (let i = 0; i < 4; i++) { const tx = x + s * (4 + i * 4.5); box(c, tx - 1, GY - 6 - (i % 2) * 2, 2, 5, hour('#F4F4F5')); }
    }
  } else {
    const sh = t < 6 ? (t % 2 ? 1 : -1) : 0;
    c.fillStyle = INK; c.beginPath(); c.ellipse(x + sh, GY - 9, 13, 10, 0, Math.PI, 0); c.fill();
    c.fillStyle = hour('#71717A'); c.beginPath(); c.ellipse(x + sh, GY - 9, 11, 8, 0, Math.PI, 0); c.fill();
    for (let i = -3; i <= 3; i++) box(c, x + sh + i * 3 - 1, GY - 12, 2, 5, hour('#F4F4F5'));
  }
};
/** A GENERIC-CO crate (solid: lit along its top). The punching ones: a flap on each side, the glove out on its spring. */
const crate = (c: Ctx, state: GameState, i: number) => {
  const [a, b, h] = CRATES[i], xa = X(a), w = X(b) - xa, top = Y(h);
  const g = itchyOf(state).gloves.find(q => q.i === i);
  const shake = g && g.phase === 'rattle' ? ((state.frame >> 1) % 2 ? 1.5 : -1.5) : 0;
  c.save(); c.translate(shake, 0);
  box(c, xa, top, w, h, INK); box(c, xa + 2, top + 2, w - 4, h - 3, hour('#C8963E'));
  for (let y = top + 12; y < GY - 4; y += 14) box(c, xa + 2, y, w - 4, 2, hour('#A16207'));
  c.strokeStyle = hour('#A16207'); c.lineWidth = 3; c.beginPath(); c.moveTo(xa + 4, top + 4); c.lineTo(xa + w - 4, GY - 4); c.stroke();
  signText(c, 'GENERIC-CO', xa + w / 2, top + Math.min(h / 2, 30), { sx: 1, sy: 1, stencil: true, fill: hour('#1F2937') });
  if (g) signText(c, 'THIS SIDE UP', xa + w / 2, top + Math.min(h / 2, 30) + 10, { sx: 1, sy: 1, fill: hour('#7F1D1D'), gap: 0, space: 2 });
  box(c, xa, top, w, 2, LIP);
  c.restore();
  if (g && g.ext > 0) {
    const gp = glovePos(g), cy = Y(h) + 18;
    // (the flap knocked open, the spring (an accordion), the glove)
    box(c, gp.root + (g.dir < 0 ? -4 : 0), cy - 16, 4, 32, hour('#A16207'));
    c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath();
    const n = 7; for (let k = 0; k <= n; k++) { const sx = gp.root + (gp.x - gp.root - g.dir * 12) * (k / n); c.lineTo(sx, cy + (k % 2 ? -7 : 7)); } c.stroke();
    c.strokeStyle = hour('#D4D4D8'); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = INK; c.beginPath(); c.ellipse(gp.x, cy, 16, 14, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(gp.x, cy, 13.5, 11.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#F87171'; c.beginPath(); c.ellipse(gp.x - 3, cy - 5, 6, 3, -0.3, 0, Math.PI * 2); c.fill();
    box(c, gp.x - g.dir * 14 - 4, cy - 6, 8, 12, '#F5F5F4');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The safe, the piano

const safeArt = (c: Ctx, x: number, bottom: number, open: boolean, lit: boolean) => {
  const w = SAFE.w, h = SAFE.h, top = bottom - h;
  box(c, x - w / 2, top, w, h, INK); box(c, x - w / 2 + 2, top + 2, w - 4, h - 4, hour('#374151'));
  box(c, x - w / 2 + 6, top + 6, w - 12, h - 12, hour('#1F2937'));
  c.fillStyle = INK; c.beginPath(); c.arc(x + 6, top + h / 2, 10, 0, Math.PI * 2); c.fill();
  c.fillStyle = hour('#D4D4D8'); c.beginPath(); c.arc(x + 6, top + h / 2, 8, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; box(c, x + 6 + Math.cos(a) * 6 - 0.5, top + h / 2 + Math.sin(a) * 6 - 0.5, 1, 1, INK); }
  box(c, x - w / 2 + 10, top + h / 2 - 2, 10, 4, hour('#A1A1AA'));
  signText(c, 'GENERIC-CO', x, top + 14, { sx: 1, sy: 1, fill: hour('#FACC15') });
  if (open) {
    // (down: the door's sprung open; a single moth flutters out of it)
    box(c, x + w / 2 - 4, top + 6, 22, h - 10, INK); box(c, x + w / 2 - 2, top + 8, 18, h - 14, hour('#4B5563'));
  }
  if (lit) box(c, x - w / 2 + 2, top, w - 4, 2, LIP);
};
const pianoArt = (c: Ctx, x: number, bottom: number, wrecked: boolean, lit: boolean, f: number) => {
  const w = PIANO.w;
  if (!wrecked) {
    // (a baby grand on its side as movers hang it: the body, the lid shut, the legs up, the keys along the front)
    const h = 64, top = bottom - h;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - w / 2, bottom); c.lineTo(x - w / 2, top + 10); c.quadraticCurveTo(x - w / 2, top, x - w / 2 + 14, top); c.lineTo(x + w / 2 - 30, top); c.quadraticCurveTo(x + w / 2, top + 4, x + w / 2, bottom); c.closePath(); c.fill();
    c.fillStyle = hour('#18181B'); c.beginPath(); c.moveTo(x - w / 2 + 3, bottom - 3); c.lineTo(x - w / 2 + 3, top + 10); c.quadraticCurveTo(x - w / 2 + 3, top + 3, x - w / 2 + 14, top + 3); c.lineTo(x + w / 2 - 30, top + 3); c.quadraticCurveTo(x + w / 2 - 3, top + 6, x + w / 2 - 3, bottom - 3); c.closePath(); c.fill();
    box(c, x - w / 2 + 8, top + 8, w * 0.45, 3, hour('#52525B'));
    box(c, x - w / 2 + 6, bottom - 18, w - 12, 12, INK); box(c, x - w / 2 + 7, bottom - 17, w - 14, 10, '#FAFAFA');
    for (let k = x - w / 2 + 10; k < x + w / 2 - 8; k += 7) box(c, k, bottom - 17, 3, 6, '#18181B');
    for (const lx of [-w / 2 + 10, w / 2 - 20]) { box(c, x + lx, bottom, 8, 6, INK); }
    return;
  }
  // (the wreck: a heap of black boards and the lid, the keys spilled, a string sprung out curling; its top lit)
  const h = PIANO.h, top = bottom - h;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - w / 2, bottom); c.lineTo(x - w / 2 + 6, top + 8); c.lineTo(x - 10, top); c.lineTo(x + 20, top + 4); c.lineTo(x + w / 2, top + 14); c.lineTo(x + w / 2 + 4, bottom); c.closePath(); c.fill();
  c.fillStyle = hour('#18181B'); c.beginPath(); c.moveTo(x - w / 2 + 3, bottom - 2); c.lineTo(x - w / 2 + 8, top + 10); c.lineTo(x - 10, top + 3); c.lineTo(x + 20, top + 7); c.lineTo(x + w / 2 - 2, top + 16); c.lineTo(x + w / 2 + 1, bottom - 2); c.closePath(); c.fill();
  for (let k = 0; k < 9; k++) { c.save(); c.translate(x - w / 2 + 6 + k * 12, bottom - 6 - (k % 3) * 3); c.rotate((k % 2 ? 0.4 : -0.3)); box(c, -3, -2, 7, 4, k % 3 ? '#FAFAFA' : '#18181B'); c.restore(); }
  c.strokeStyle = hour('#D4D4D8'); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 10, top + 4); c.bezierCurveTo(x + 20, top - 30, x + 50, top - 10, x + 40 + Math.sin(f * 0.05) * 2, top - 26); c.stroke();
  if (lit) box(c, x - w / 2 + 10, top + 4, w - 30, 2, LIP);
};
/** The rope it hangs from, up to the jib/pulley; fraying (strands sprung loose, it jiggles). */
const hung = (c: Ctx, d: Drop, topY: number, f: number) => {
  const fray = d.phase === 'fray', jig = fray ? Math.sin(f * 1.3) * 2 : Math.sin(f * 0.04) * 1;
  const objTop = d.y - (d.id === 'safe' ? SAFE.h : 64);
  c.strokeStyle = INK; c.lineWidth = fray ? 2 : 3; c.beginPath(); c.moveTo(d.x, topY); c.lineTo(d.x + jig, objTop); c.stroke();
  c.strokeStyle = hour('#D6B97C'); c.lineWidth = fray ? 1 : 1.6; c.stroke();
  if (fray) { const fy = topY + (objTop - topY) * 0.35; c.strokeStyle = hour('#D6B97C'); c.lineWidth = 1; for (const s of [-1, 1, -1]) { c.beginPath(); c.moveTo(d.x, fy); c.quadraticCurveTo(d.x + s * 8, fy + 4, d.x + s * 12, fy - 6 + d.t % 5); c.stroke(); } }
  // (the slings round it)
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(d.x + jig, objTop); c.lineTo(d.x - d.w / 2 + 6, objTop + 6); c.moveTo(d.x + jig, objTop); c.lineTo(d.x + d.w / 2 - 6, objTop + 6); c.stroke();
};
/** The dock crane (behind the path: a steel mast, the jib out over the path, the pulley), and the piano's hoist (a
 *  beam out of the big top's mast with a pulley, two animatronic movers' gloves on the rope). */
const crane = (c: Ctx, x: number, topY: number, back: number) => {
  const D = dimmed(INK), M = dimmed('#FACC15');
  box(c, back - 10, topY - 10, 20, GY - topY + 10, D); box(c, back - 7, topY - 8, 14, GY - topY + 8, M);
  for (let y = topY; y < GY; y += 24) { c.strokeStyle = D; c.lineWidth = 2; c.beginPath(); c.moveTo(back - 7, y); c.lineTo(back + 7, y + 24); c.stroke(); }
  box(c, Math.min(back, x) - 10, topY - 14, Math.abs(x - back) + 30, 14, D); box(c, Math.min(back, x) - 8, topY - 12, Math.abs(x - back) + 26, 10, M);
  c.fillStyle = D; c.beginPath(); c.arc(x, topY, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = dimmed('#A1A1AA'); c.beginPath(); c.arc(x, topY, 5, 0, Math.PI * 2); c.fill();
};
const drawDrops = (c: Ctx, state: GameState, front: boolean) => {
  const k = itchyOf(state), f = state.frame;
  for (const d of k.drops) {
    if (!onScreen(state, d.x - 160, d.x + 160)) continue;
    const topY = Y((d.id === 'safe' ? SAFE.hang : PIANO.hang) + 150);
    if (!front) {
      crane(c, d.x, topY, d.x + (d.id === 'safe' ? -120 : -130));
      if (d.phase === 'fray' || d.phase === 'fall' || d.phase === 'hang') shadow(c, d.x, GY, d.w + 20, d.phase === 'hang' ? 0.15 : d.phase === 'fray' ? 0.3 + d.t / 80 : 0.6 + Math.min(0.4, (d.y - Y(300)) / 300));
      if (d.phase === 'down') { if (d.id === 'safe') safeArt(c, d.x, GY, true, true); else pianoArt(c, d.x, GY, true, true, f); }
      continue;
    }
    if (d.phase === 'down') continue;
    if (d.phase !== 'fall') hung(c, d, topY, f);
    if (d.id === 'safe') safeArt(c, d.x, d.y, false, false); else pianoArt(c, d.x, d.y, false, false, f);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Cannons and their balls

/** The circus cannon on its carriage (red, gold stars, big spoked wheels; the barrel's elevation: low or high), facing
 *  left; the carriage's top lit (a step over it). */
const cannonArt = (c: Ctx, state: GameState, cn: Cannon, x: number, bottom: number, barrelY: number, lit: boolean) => {
  const f = state.frame, tell = cn.phase === 'tell', r = cn.recoil;
  // (the barrel: from its trunnion on the carriage to its mouth at the muzzle, aimed at the ball's height)
  const tx = x + 10 + r, ty = bottom - CANNON.h + 6, mx = cn.muzzle + r, my = barrelY;
  const a = Math.atan2(my - ty, mx - tx), L = Math.hypot(mx - tx, my - ty);
  c.save(); c.translate(tx, ty); c.rotate(a);
  c.fillStyle = INK; c.beginPath(); c.moveTo(-14, -18); c.lineTo(L, -15); c.lineTo(L, 15); c.lineTo(-14, 18); c.quadraticCurveTo(-28, 0, -14, -18); c.fill();
  c.fillStyle = hour('#DC2626'); c.beginPath(); c.moveTo(-12, -15); c.lineTo(L - 3, -12); c.lineTo(L - 3, 12); c.lineTo(-12, 15); c.quadraticCurveTo(-24, 0, -12, -15); c.fill();
  c.fillStyle = hour('#F87171'); c.fillRect(-6, -13, L - 12, 5);
  for (const bx of [10, L - 26]) { c.fillStyle = hour('#FACC15'); c.fillRect(bx, -14, 6, 28); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(L, 0, 5, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0A0A0A'; c.beginPath(); c.ellipse(L + 1, 0, 3, 11, 0, 0, Math.PI * 2); c.fill();
  c.restore();
  // (the touch hole fizzing: the tell)
  if (tell) { c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; c.beginPath(); c.arc(tx + 6, ty - 18, 3 + (f % 3), 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(200,200,200,0.5)'; c.beginPath(); c.arc(tx + 10, ty - 30 - (f % 12), 6, 0, Math.PI * 2); c.fill(); }
  // (the carriage: a red box with gold stars, big wheels; its top lit)
  const cx0 = x - CANNON.w / 2, top = bottom - CANNON.h;
  if (lit) {
    box(c, cx0, top, CANNON.w, CANNON.h, INK); box(c, cx0 + 2, top + 2, CANNON.w - 4, CANNON.h - 3, hour('#991B1B'));
    for (const [sx, sy] of [[cx0 + 20, top + 20], [cx0 + 50, top + 34], [cx0 + 80, top + 18]] as [number, number][]) { c.fillStyle = hour('#FACC15'); c.beginPath(); for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 - Math.PI / 2, ra = i % 2 ? 3 : 7; c.lineTo(sx + Math.cos(an) * ra, sy + Math.sin(an) * ra); } c.closePath(); c.fill(); }
    for (const wx of [cx0 + 22, cx0 + CANNON.w - 22]) {
      c.fillStyle = INK; c.beginPath(); c.arc(wx, bottom - 18, 19, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#FACC15'); c.beginPath(); c.arc(wx, bottom - 18, 16, 0, Math.PI * 2); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI; c.beginPath(); c.moveTo(wx + Math.cos(an) * 15, bottom - 18 + Math.sin(an) * 15); c.lineTo(wx - Math.cos(an) * 15, bottom - 18 - Math.sin(an) * 15); c.stroke(); }
      c.fillStyle = INK; c.beginPath(); c.arc(wx, bottom - 18, 4, 0, Math.PI * 2); c.fill();
    }
    box(c, cx0, top, CANNON.w, 2, LIP);
  }
};
/** The canyon's cannon on its scissor lift behind the far rim (the lift's height: up to his). */
const liftArt = (c: Ctx, state: GameState) => {
  const k = itchyOf(state), cn = k.lift, x = cn.x;
  if (!onScreen(state, x - 140, x + 140)) return;
  const topY = Y(cn.lift) + 16, D = dimmed(INK);
  // (the scissor arms, the base)
  box(c, x - 50, GY - 20, 100, 20, D); box(c, x - 48, GY - 18, 96, 16, dimmed('#FACC15'));
  const n = Math.max(2, Math.round((GY - 20 - topY) / 50));
  c.strokeStyle = D; c.lineWidth = 6;
  for (let i = 0; i < n; i++) { const y0 = GY - 20 - ((GY - 20 - topY) * i) / n, y1 = GY - 20 - ((GY - 20 - topY) * (i + 1)) / n; c.beginPath(); c.moveTo(x - 36, y0); c.lineTo(x + 36, y1); c.moveTo(x + 36, y0); c.lineTo(x - 36, y1); c.stroke(); }
  c.strokeStyle = dimmed('#A1A1AA'); c.lineWidth = 3;
  for (let i = 0; i < n; i++) { const y0 = GY - 20 - ((GY - 20 - topY) * i) / n, y1 = GY - 20 - ((GY - 20 - topY) * (i + 1)) / n; c.beginPath(); c.moveTo(x - 36, y0); c.lineTo(x + 36, y1); c.moveTo(x + 36, y0); c.lineTo(x - 36, y1); c.stroke(); }
  box(c, x - 46, topY, 92, 10, D); box(c, x - 44, topY + 2, 88, 6, dimmed('#7F1D1D'));
  // (the cannon on top, barrel level at the lift's height: the ball comes out at its middle)
  cannonArt(c, state, cn, x, topY + CANNON.h - 30, Y(cn.lift), false);
};
const ball = (c: Ctx, x: number, y: number) => {
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, BALL_R + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#27272A'; c.beginPath(); c.arc(x, y, BALL_R, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#A1A1AA'; c.beginPath(); c.arc(x - 4, y - 4, 3.5, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = 2; for (const dy of [-7, 0, 7]) { c.beginPath(); c.moveTo(x + BALL_R + 4, y + dy); c.lineTo(x + BALL_R + 22, y + dy); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Fuses, TNT, holes, throws, blasts

const tnt = (c: Ctx, x: number, bottom: number, rise = 1) => {
  // (a bundle of six red sticks strapped together, TNT on the band; rising out of its trapdoor)
  const h = 50 * rise;
  if (h < 2) return;
  c.save(); c.beginPath(); c.rect(x - 30, bottom - 60, 60, 60); c.clip();
  c.translate(0, 50 - h);
  for (let i = 0; i < 6; i++) { const sx = x - 21 + i * 7; box(c, sx - 1, bottom - 50, 9, 50, INK); box(c, sx, bottom - 49, 7, 48, '#DC2626'); box(c, sx + 1, bottom - 48, 2, 46, '#F87171'); }
  box(c, x - 23, bottom - 32, 46, 14, INK); box(c, x - 22, bottom - 31, 44, 12, '#FEF3C7');
  signText(c, 'TNT', x, bottom - 22, { sx: 1, sy: 1, bold: true, fill: '#B91C1C' });
  c.restore();
};
/** The fuse along its line (unburnt: a tan cord; burnt: a black smudge of ash), the spark at its head. */
const fuseLine = (c: Ctx, state: GameState, fz: Fuse) => {
  const burnt = fz.phase === 'burn' ? fz.s : fz.phase === 'boom' || (fz.phase === 'reset' && fz.t < 70) ? fz.len : 0;
  const steps = Math.ceil(fz.len / 6);
  for (let i = 0; i < steps; i++) {
    const s0 = (i / steps) * fz.len, s1 = ((i + 1) / steps) * fz.len, p0 = fusePoint(fz, s0), p1 = fusePoint(fz, s1);
    if (!onScreen(state, Math.min(p0.x, p1.x) - 10, Math.max(p0.x, p1.x) + 10)) continue;
    const gone = s1 <= burnt;
    c.strokeStyle = INK; c.lineWidth = gone ? 2 : 4; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
    if (!gone) { c.strokeStyle = hour('#D6B97C'); c.lineWidth = 2; c.stroke(); }
  }
  if (fz.phase === 'burn') {
    const sp = fusePoint(fz, fz.s), f = state.frame;
    c.fillStyle = 'rgba(255,200,80,0.35)'; c.beginPath(); c.arc(sp.x, sp.y, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; c.beginPath();
    for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 + f * 0.5, ra = i % 2 ? 3 : 8; c.lineTo(sp.x + Math.cos(an) * ra, sp.y + Math.sin(an) * ra); }
    c.closePath(); c.fill();
  }
};
/** The giant animatronic Kicky crouched behind the path with the giant match (struck: the tell). */
const matchKicky = (c: Ctx, state: GameState, fz: Fuse, x: number) => {
  const D = dimmed(INK), fur = dimmed('#A8A29E');
  const strike = fz.phase === 'strike', u = strike ? fz.t / 34 : fz.phase === 'burn' ? 1 : 0;
  // (crouched on his haunches on a red plinth, leaning out over the path with the match)
  box(c, x - 60, Y(40), 120, 40, D); box(c, x - 58, Y(38), 116, 38, dimmed('#7F1D1D'));
  c.fillStyle = D; c.beginPath(); c.ellipse(x - 6, Y(110), 44, 56, -0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = fur; c.beginPath(); c.ellipse(x - 6, Y(110), 41, 53, -0.2, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(x + 10, Y(186)); mouseHead(c, 0, 0, 30, 0.12); c.restore();
  // (the arm with the match: up and back while striking, then out over the fuse's end)
  const hx = x + 30 + u * 40, hy = Y(100) + (strike ? Math.sin(u * Math.PI) * -30 : 30);
  c.lineCap = 'round'; c.strokeStyle = D; c.lineWidth = 18; c.beginPath(); c.moveTo(x + 10, Y(130)); c.lineTo(hx, hy); c.stroke();
  c.strokeStyle = fur; c.lineWidth = 14; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(hx, hy, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FAFAFA'; c.beginPath(); c.arc(hx, hy, 8, 0, Math.PI * 2); c.fill();
  // (the match: a long stick, a red head; lit, a flame)
  const mx = hx + 8, my = hy + 40;
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(hx, hy); c.lineTo(mx, my); c.stroke(); c.strokeStyle = hour('#F5D0A9'); c.lineWidth = 3.5; c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(mx, my, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#DC2626'; c.beginPath(); c.arc(mx, my, 4.5, 0, Math.PI * 2); c.fill();
  if ((strike && fz.t > 14) || fz.phase === 'burn') { const f = state.frame; c.fillStyle = '#FB923C'; c.beginPath(); c.ellipse(mx, my - 8, 6 + (f % 3), 11 + (f % 4), 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE047'; c.beginPath(); c.ellipse(mx, my - 6, 3, 6, 0, 0, Math.PI * 2); c.fill(); }
};
/** The set's igniter on the fly rail (a GENERIC-CO clockwork box that strikes its own match). */
const igniter = (c: Ctx, state: GameState, fz: Fuse) => {
  const p = fusePoint(fz, 0);
  box(c, p.x - 4, p.y - 18, 34, 22, INK); box(c, p.x - 2, p.y - 16, 30, 18, hour('#A16207'));
  signText(c, 'GC', p.x + 13, p.y - 6, { sx: 1, sy: 1, bold: true, fill: hour('#1F2937') });
  const a = fz.phase === 'strike' ? fz.t * 0.4 : state.frame * 0.02;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x + 13, p.y - 18); c.lineTo(p.x + 13 + Math.cos(a) * 9, p.y - 18 + Math.sin(a) * 9); c.stroke();
  if (fz.phase === 'strike' && fz.t > 14) { c.fillStyle = '#FB923C'; c.beginPath(); c.arc(p.x, p.y - 4, 5, 0, Math.PI * 2); c.fill(); }
};
const drawFuses = (c: Ctx, state: GameState) => {
  for (const fz of itchyOf(state).fuses) {
    const tx = X(fz.d.tnt[0]), ty = Y(fz.d.tnt[1]);
    if (fz.d.kicky !== undefined && onScreen(state, X(fz.d.kicky) - 120, X(fz.d.kicky) + 120)) matchKicky(c, state, fz, X(fz.d.kicky));
    if (fz.d.kicky === undefined) { const p0 = fusePoint(fz, 0); if (onScreen(state, p0.x - 40, p0.x + 40)) igniter(c, state, fz); }
    fuseLine(c, state, fz);
    if (onScreen(state, tx - 40, tx + 40)) {
      // (the trapdoor under the TNT; the pile rising out of it again after)
      box(c, tx - 28, ty - 2, 56, 4, INK); box(c, tx - 26, ty - 1, 52, 2, hour('#57534E'));
      const rise = fz.phase === 'boom' ? 0 : fz.phase === 'reset' ? Math.max(0, Math.min(1, (fz.t - 60) / 40)) : 1;
      tnt(c, tx, ty, rise);
      if (fz.phase === 'boom' || (fz.phase === 'reset' && fz.t < 60)) { c.fillStyle = 'rgba(30,25,20,0.55)'; c.beginPath(); c.ellipse(tx, ty, 40, 6, 0, 0, Math.PI * 2); c.fill(); }
    }
  }
};
/** A portable hole: on the floor (a black ellipse, spreading out flat, peeling back up at the end), or up in the air
 *  (the one he drops out of: dead black, ragged sheen). */
const holeArt = (c: Ctx, x: number, y: number, w: number, k: number, sky: boolean) => {
  if (k <= 0.02) return;
  const rx = (w / 2) * k, ry = sky ? (w / 2.4) * k : 9 * k;
  c.fillStyle = '#050505'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(150,150,200,0.55)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, rx - 1, ry - 1, 0, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
  if (!sky) { c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(x, y - 1, rx * 0.8, ry * 0.55, 0, 0, Math.PI * 2); c.fill(); }
};
const drawHoles = (c: Ctx, state: GameState, sky: boolean) => {
  for (const h of itchyOf(state).holes) {
    if (!!h.sky !== sky || !onScreen(state, h.x - h.w, h.x + h.w)) continue;
    const k = sky ? Math.min(1, h.t / 6) * Math.min(1, (h.life - h.t) / 12) : Math.min(1, h.t / 18) * Math.min(1, (h.life - h.t) / 16);
    holeArt(c, h.x, h.y, h.w, k, sky);
  }
};
const drawThrows = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const s of itchyOf(state).throws) {
    if (!onScreen(state, s.x - 30, s.x + 30)) continue;
    if (s.kind === 'cleaver') cleaver(c, s.x, s.y + (s.down ? 10 : 0), s.down ? 2.8 : s.t * 0.55 * Math.sign(s.vx || 1));
    else if (s.kind === 'dynamite') dynamiteStick(c, s.x, s.y - 4, s.down ? 1.5 : s.t * 0.25, true, f, Math.max(0.05, (s.fuse ?? 0) / 90));
    else foldedHole(c, s.x, s.y, s.t * 0.4, 22);
  }
};
const drawBlasts = (c: Ctx, state: GameState) => {
  for (const b of itchyOf(state).blasts) {
    const u = b.t / 30, r = b.r * (0.4 + u * 0.8);
    c.fillStyle = `rgba(255,250,220,${0.75 * (1 - u)})`; c.beginPath(); c.arc(b.x, b.y, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(249,115,22,${0.6 * (1 - u)})`; c.beginPath(); for (let i = 0; i < 16; i++) { const an = (i / 16) * Math.PI * 2, ra = i % 2 ? r * 0.6 : r * 0.95; c.lineTo(b.x + Math.cos(an) * ra, b.y + Math.sin(an) * ra); } c.closePath(); c.fill();
  }
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind him (after the backdrop and the ground). */
export const drawHazardsBack = (c: Ctx, state: GameState, broken: boolean) => {
  const k = itchyOf(state);
  gantry(c, state);
  for (const h of k.hammers) if (onScreen(state, X(h.d.x) - 150, X(h.d.x) + 150)) animatronic(c, state, h, broken);
  liftArt(c, state);
  drawFuses(c, state);
  drawDrops(c, state, false);
  drawHoles(c, state, false);
  for (const r of k.rakes) if (onScreen(state, r.x - 90, r.x + 90)) rake(c, r.x, r.dir, r.up);
  for (const t of k.traps) if (onScreen(state, t.x - 40, t.x + 50)) trap(c, t.x, t.sprung, t.t);
  for (let i = 0; i < CRATES.length; i++) if (onScreen(state, X(CRATES[i][0]) - GLOVE_REACH - 30, X(CRATES[i][1]) + GLOVE_REACH + 30)) crate(c, state, i);
  if (onScreen(state, X(CANNON.x) - 200, X(CANNON.x) + 100)) { const cn = k.cannon; cannonArt(c, state, cn, X(CANNON.x), GY, Y(cn.phase === 'tell' || cn.phase === 'aim' ? cn.aim : cn.lift || 20), true); }
  drawAnvilsBack(c, state);
};
/** In front of him. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const k = itchyOf(state);
  for (const h of k.hammers) if (onScreen(state, Math.min(X(h.d.hit), X(h.d.x)) - 280, Math.max(X(h.d.hit), X(h.d.x)) + 280)) hammerArm(c, h);
  drawDrops(c, state, true);
  drawAnvilsFront(c, state);
  for (const b of k.balls) if (onScreen(state, b.x - 30, b.x + 30)) ball(c, b.x, b.y);
  drawThrows(c, state);
  drawHoles(c, state, true);
  drawBlasts(c, state);
};
