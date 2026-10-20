// PUNCHY & KICKY's hazards, drawn (world space; the SNES pass: every material in its steps, the tells crisp). What he
// can stand on is lit along its top (an anvil sat on the path, a hammer's head lying there, the safe, the piano's wreck,
// the crates, the cannon's carriage); the machinery behind the path (the gantry, the animatronics' bodies, the crane,
// the lift) is dimmed scenery. Every tell drawn: the shadows growing under what's coming down (banded), the hatch
// rattling, the hammer hauled back and the robot's eyes lit red, the rake's tines glinting, the open jaws, the crate
// shaking, the rope fraying, the barrel dipping or rising and its touch hole fizzing, the spark crawling along the fuse.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { box, hour, dimmed, onScreen, ballR, eggR, postR, checker, INK, type Ctx } from '../kit';
import { GY } from '../geometry';
import { itchyOf, type Hammer, type Drop, type Cannon, type Fuse } from './state';
import {
  AW, AH, A_TELL, A_FALL, A_DOWN, H_PIVOT, H_HEAD_W, H_HEAD_H, RAKE_LEN, GLOVE_REACH, BALL_R, hammerHead, glovePos, fusePoint,
} from './hazards';
import { GANTRY, CRATES, SAFE, PIANO, CANNON, X, Y } from './layout';
import { catHead, mouseHead, cleaver, dynamiteStick, foldedHole } from './kindArt';
import { NR, DR, NC, DC, STEELP, BLOOD, MUSTARD, TAR, CRATE, GINGER, MOUSEY, BONE, PLY, plate, planks, hazard, gore, small, stencil } from './paint';

const LIP = '#FFFFFF', LIP2 = '#FFE8F2';

// ---------------------------------------------------------------------------------------------------------------
// Anvils

/** An anvil, its bottom's middle at (x, y): the horn out to the left, the face lit on top, the waist, the base. */
export const anvil = (c: Ctx, x: number, y: number, lit = true) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  const S = NR(STEELP);
  const shape = (grow: number) => { c.beginPath(); c.moveTo(-24 - grow, 0); c.lineTo(24 + grow, 0); c.lineTo(18 + grow, -8); c.lineTo(10 + grow, -12); c.lineTo(12 + grow, -22); c.lineTo(26 + grow, -24); c.lineTo(26 + grow, -34 - grow); c.lineTo(-14, -34 - grow); c.quadraticCurveTo(-30 - grow, -32, -34 - grow, -26); c.quadraticCurveTo(-22, -24 + grow, -12 - grow, -22); c.lineTo(-10 - grow, -12); c.lineTo(-18 - grow, -8); c.closePath(); };
  c.fillStyle = INK; shape(1.5); c.fill();
  c.save(); shape(0); c.clip();
  // (lit from the upper left: the face and the horn's top bright, the waist in shade, the base's foot darker)
  box(c, -40, -40, 80, 44, S[3]);
  box(c, -40, -34, 80, 8, S[4]); box(c, -40, -34, 80, 2, S[5]);
  box(c, -40, -24, 80, 12, S[2]); checker(c, -40, -26, 80, 2, S[2], 0, 1);
  box(c, -10, -24, 4, 12, S[1]); box(c, 6, -24, 6, 12, S[1]);
  box(c, -40, -12, 80, 12, S[3]); box(c, -40, -12, 80, 2, S[4]); box(c, -40, -4, 80, 4, S[1]);
  box(c, 16, -34, 10, 22, S[1]); box(c, 22, -12, 8, 12, S[0]);
  box(c, -32, -28, 12, 2, S[5]);
  c.restore();
  // (GENERIC-CO stamped on the waist; the hardy hole on the face)
  box(c, -6, -20, 14, 5, S[0]); box(c, -5, -19, 12, 3, hour('#E8B424'));
  box(c, 14, -33, 4, 2, S[0]);
  box(c, -14, -34, 38, 2, lit ? LIP : S[4]);
  if (lit) box(c, -12, -32, 34, 1, LIP2);
  c.restore();
};
/** A shadow growing on the floor under something coming down (`k` 0..1 how close): banded, a dithered rim. */
const shadow = (c: Ctx, x: number, y: number, w: number, k: number) => {
  const rx = (w / 2) * (0.35 + k * 0.75), ry = 4 + k * 3;
  for (const [s, a] of [[1.25, 0.08 + k * 0.12], [1, 0.12 + k * 0.22], [0.6, 0.1 + k * 0.2]] as [number, number][]) { c.fillStyle = `rgba(20,10,30,${a})`; c.beginPath(); c.ellipse(x, y + 1, rx * s, ry * s, 0, 0, Math.PI * 2); c.fill(); }
};
/** The GENERIC-CO gantry over ANVIL ALLEY: a truss on two lattice towers, the beam hazard-striped, crates of anvils on
 *  top, a hatch for each door, the winch's drum at one end, the rope and hook down while it's hauling one back up. */
const gantry = (c: Ctx, state: GameState) => {
  const k = itchyOf(state), a = X(GANTRY.a), b = X(GANTRY.b), top = Y(GANTRY.h);
  if (!onScreen(state, a - 40, b + 40)) return;
  const D = dimmed(INK), R = DR(BLOOD), M = DR(MUSTARD), Cr = DR(CRATE), S = DR(STEELP);
  // (the towers: red lattice, each leg stepped, the X-bracing, a foot plate)
  for (const px of [a, b - 22]) {
    box(c, px, top - 10, 22, GY - top + 10, D);
    for (const lx of [px + 3, px + 15]) { box(c, lx, top - 8, 4, GY - top + 8, R[3]); box(c, lx, top - 8, 1, GY - top + 8, R[5]); box(c, lx + 3, top - 8, 1, GY - top + 8, R[1]); }
    c.strokeStyle = R[2]; c.lineWidth = 2; c.beginPath(); for (let y = top; y < GY; y += 26) { c.moveTo(px + 5, y); c.lineTo(px + 17, y + 26); c.moveTo(px + 17, y); c.lineTo(px + 5, y + 26); } c.stroke();
    box(c, px - 6, GY - 6, 34, 6, D); box(c, px - 5, GY - 5, 32, 4, S[3]); box(c, px - 5, GY - 5, 32, 1, S[5]);
  }
  // (the beam: a mustard box girder, hazard stripes along its foot, rivets)
  box(c, a - 10, top - 26, b - a + 20, 26, D);
  box(c, a - 8, top - 24, b - a + 16, 16, M[3]); box(c, a - 8, top - 24, b - a + 16, 2, M[5]); box(c, a - 8, top - 10, b - a + 16, 2, M[1]);
  hazard(c, a - 8, top - 8, b - a + 16, 6, M[3], D, 6);
  for (let x = a; x < b; x += 30) { c.strokeStyle = M[1]; c.lineWidth = 2; c.beginPath(); c.moveTo(x, top - 22); c.lineTo(x + 15, top - 11); c.lineTo(x + 30, top - 22); c.stroke(); box(c, x + 14, top - 21, 2, 2, M[5]); }
  // (the crates of anvils up on top, GENERIC-CO stenciled; the winch's drum and motor on the left)
  for (let x = a + 40; x < b - 60; x += 170) { box(c, x - 1, top - 71, 92, 46, D); planks(c, x, top - 70, 90, 44, Cr, 11, true, x); box(c, x, top - 70, 4, 44, Cr[4]); box(c, x + 86, top - 70, 4, 44, Cr[1]); signText(c, 'GENERIC-CO', x + 45, top - 48, stencil(dimmed('#1F2937'))); signText(c, 'ANVILS', x + 45, top - 37, stencil(dimmed('#7F1D1D'))); }
  { const wx = a + 8; box(c, wx - 1, top - 51, 30, 26, D); plate(c, wx, top - 50, 28, 24, S, true); box(c, wx + 4, top - 46, 20, 3, M[3]); ballR(c, wx + 14, top - 36, 7, S); c.strokeStyle = D; c.lineWidth = 1; for (let k2 = 0; k2 < 5; k2++) { c.beginPath(); c.moveTo(wx + 7 + k2 * 3, top - 42); c.lineTo(wx + 7 + k2 * 3, top - 30); c.stroke(); } }
  // (each door's hatch: shut, rattling (the tell), hanging open)
  for (const an of k.anvils) {
    if (an.door === undefined) continue;
    const x = an.x, rattle = an.phase === 'tell' ? ((state.frame >> 1) % 2 ? 1 : -1) : 0, open = an.phase === 'fall' || an.phase === 'down' || an.phase === 'lift';
    box(c, x - AW / 2 - 6, top - 4, AW + 12, 6, D);
    if (open) { for (const hx of [x - AW / 2 - 4, x + AW / 2 - 2]) { box(c, hx, top, 6, 30, D); box(c, hx + 1, top + 1, 4, 28, S[3]); box(c, hx + 1, top + 1, 1, 28, S[5]); } }
    else { box(c, x - AW / 2 - 4, top - 3 + rattle, AW + 8, 5, S[2]); box(c, x - AW / 2 - 4, top - 3 + rattle, AW + 8, 1, S[4]); box(c, x - 2, top - 2 + rattle, 4, 3, S[0]); if (rattle) { box(c, x - AW / 2 - 8, top + 4, 2, 2, dimmed('#A1A1AA')); box(c, x + AW / 2 + 6, top + 6, 2, 2, dimmed('#A1A1AA')); } }
    const cyc = an.cyc ?? -1;
    if (an.phase === 'lift' || (an.phase === 'down' && cyc > A_TELL + A_FALL + A_DOWN - 18)) {
      const hy = an.phase === 'lift' ? an.y - AH : GY - AH - Math.max(0, A_TELL + A_FALL + A_DOWN - cyc) * 14;
      c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, top); c.lineTo(x, hy); c.stroke();
      c.strokeStyle = hour('#A1A1AA'); c.lineWidth = 1; c.setLineDash([2, 2]); c.stroke(); c.setLineDash([]);
      c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.arc(x + 3, hy + 3, 4, Math.PI, Math.PI * 2.4); c.stroke();
      c.strokeStyle = hour('#C4CCD6'); c.lineWidth = 2; c.stroke();
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
      if (a.phase === 'fall') for (const dx of [-18, 0, 18]) { box(c, a.x + dx - 1, a.y - AH - 34, 3, 26, 'rgba(255,255,255,0.55)'); box(c, a.x + dx, a.y - AH - 44, 1, 8, 'rgba(255,255,255,0.35)'); }
    } else if (a.phase === 'down') anvil(c, a.x, a.y, true);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The KILL-O-RAMA's giant animatronics and their hammers

/** The robot behind the path (dimmed: it's scenery, its plinth too): big and mean: a riveted drum of a plinth, fur
 *  worn through to the steel at its joints, pistons for knees, hoses, a chest panel hanging open on its wires, the
 *  show's head on a neck of pistons, a steel jaw bolted on; its eyes lit red in the wind-up. */
const animatronic = (c: Ctx, state: GameState, h: Hammer, broken: boolean) => {
  const x = X(h.d.x), s = h.d.side, cat = h.d.who === 'punchy', wind = h.phase === 'wind';
  const F = DR(cat ? GINGER : MOUSEY), D = dimmed(INK), S = DR(STEELP), R = DR(BLOOD), M = DR(MUSTARD);
  // (the plinth: a red drum, riveted, a mustard band with the name, the top's rim)
  box(c, x - 72, Y(72), 144, 72, D);
  for (let k = 0; k < 6; k++) { const bx = x - 70 + k * 23.3; box(c, bx, Y(70), 23, 70, R[[4, 3, 3, 2, 2, 1][k]]); }
  box(c, x - 70, Y(70), 140, 3, R[5]); box(c, x - 74, Y(78), 148, 10, D); box(c, x - 72, Y(76), 144, 6, M[3]); box(c, x - 72, Y(76), 144, 2, M[5]);
  for (let k = 0; k < 7; k++) box(c, x - 66 + k * 22, Y(60), 2, 2, R[5]);
  signText(c, cat ? 'PUNCHY' : 'KICKY', x, Y(34), { sx: 2, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink: D, shadow: R[0], drop: 1 });
  // (the legs: fur thighs, steel pistons for knees and shins, big cartoon feet)
  for (const lx of [-24, 10]) {
    box(c, x + lx, Y(150), 16, 40, D); box(c, x + lx + 2, Y(148), 12, 36, F[3]); box(c, x + lx + 2, Y(148), 3, 36, F[4]);
    postR(c, x + lx + 8, Y(112), Y(84), 8, S); box(c, x + lx + 4, Y(114), 8, 4, S[5]);
    eggR(c, x + lx + 10, Y(80), 16, 7, F, true);
  }
  // (the body: a barrel, stepped round, the belly patch; the fur worn through to steel at a seam; a chest panel hanging
  // open on its wires; bolts; a splat of red)
  c.fillStyle = D; c.beginPath(); c.ellipse(x, Y(190), 48, 62, 0, 0, Math.PI * 2); c.fill();
  eggR(c, x, Y(190), 46, 60, F, false);
  eggR(c, x + s * 6, Y(180), 22, 34, DR(['#8A7A60', '#B4A486', '#D8CAA8', '#FFF4E0', '#FFFAF0', '#FFFFFF']), false);
  c.strokeStyle = D; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 42, Y(200)); c.lineTo(x + 42, Y(200)); c.stroke();
  for (const bx of [-32, -12, 8, 28]) { box(c, x + bx, Y(203), 3, 3, S[1]); box(c, x + bx, Y(203), 1, 1, S[5]); }
  const px = x - s * 26;
  box(c, px - 12, Y(176), 24, 28, D); plate(c, px - 11, Y(175), 22, 26, S, false);
  for (let k = 0; k < 3; k++) { c.strokeStyle = [dimmed('#DC2626'), dimmed('#FDE047'), dimmed('#2563EB')][k]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px - 6 + k * 5, Y(170)); c.quadraticCurveTo(px - 10 + k * 6, Y(150), px - 4 + k * 5, Y(142)); c.stroke(); }
  c.save(); c.translate(px - s * 14, Y(150)); c.rotate(s * 0.5); box(c, -10, -12, 20, 24, D); box(c, -9, -11, 18, 22, F[2]); c.restore();
  box(c, x + s * 30 - 4, Y(232), 8, 14, D); box(c, x + s * 30 - 3, Y(231), 6, 12, S[3]);
  gore(c, x - s * 18, Y(162), 7, x, R);
  // (hoses from the back to the shoulder)
  c.strokeStyle = D; c.lineWidth = 4; c.beginPath(); c.moveTo(x - s * 40, Y(220)); c.quadraticCurveTo(x - s * 64, Y(250), x - s * 20, Y(254)); c.stroke(); c.strokeStyle = dimmed('#3F3F46'); c.lineWidth = 2; c.stroke();
  // (the head: the show's own, big, on a neck of pistons; a steel jaw bolted on; broken on a later visit: drooped off,
  // wires out, sparking)
  const hx = x + s * 4, hy = broken && !cat ? Y(150) : Y(268);
  if (!(broken && !cat)) { postR(c, x - 4, Y(256), Y(236), 6, S); postR(c, x + 6, Y(256), Y(236), 6, S); box(c, x - 10, Y(240), 22, 4, S[1]); }
  c.save(); c.translate(hx, hy); if (s < 0) c.scale(-1, 1);
  if (broken && !cat) c.rotate(1.2);
  (cat ? catHead : mouseHead)(c, 0, 0, 34, wind ? -0.08 : 0);
  // (the jaw's steel plate and its bolts, the neck's collar)
  box(c, cat ? 4 : 12, cat ? 26 : 22, 32, 8, D); box(c, cat ? 5 : 13, cat ? 27 : 23, 30, 6, S[3]); box(c, cat ? 5 : 13, cat ? 27 : 23, 30, 1, S[5]);
  for (const bx of [8, 18, 28]) box(c, (cat ? 0 : 8) + bx, cat ? 29 : 25, 2, 2, S[0]);
  // (the haze over the scenery)
  c.fillStyle = dimmed('#8E86B4'); c.globalAlpha = 0.16; c.beginPath(); c.arc(0, -6, 52, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // (the eyes lit red in the wind-up: the tell; a glow round them)
  if (wind || (broken && (state.frame >> 3) % 5 === 0)) {
    const ex1 = cat ? 17 : 19, ey1 = cat ? -5 : -9, ex2 = cat ? -2 : 5, ey2 = cat ? -4 : -8;
    for (const [r, col] of [[12, 'rgba(255,40,40,0.18)'], [8, 'rgba(255,40,40,0.35)'], [6, 'rgba(255,40,40,0.9)'], [3, '#FFD0D0']] as [number, string][]) { c.fillStyle = col; c.beginPath(); c.arc(ex1, ey1, r, 0, Math.PI * 2); c.arc(ex2, ey2, r * 0.75, 0, Math.PI * 2); c.fill(); }
  }
  c.restore();
  if (broken && !cat) {
    c.strokeStyle = '#18181B'; c.lineWidth = 2; for (const k of [-6, 0, 6]) { c.beginPath(); c.moveTo(x + k, Y(246)); c.quadraticCurveTo(x + k * 3, Y(200), hx + k, hy - 20); c.stroke(); }
    c.strokeStyle = dimmed('#DC2626'); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 2, Y(246)); c.quadraticCurveTo(x + 8, Y(200), hx + 4, hy - 18); c.stroke();
    postR(c, x, Y(256), Y(240), 6, S);
    if ((state.frame >> 2) % 6 === 0) { c.fillStyle = '#FDE047'; for (let i = 0; i < 5; i++) c.fillRect(x - 8 + i * 5, Y(250) - (i % 2) * 6, 2, 2); c.fillStyle = '#FFFFFF'; c.fillRect(x, Y(252), 2, 2); }
  }
};
/** The hammer arm and mallet: from the shoulder out to the head (in front of him when it's down on the path). */
const hammerArm = (c: Ctx, h: Hammer) => {
  const px = X(h.d.x), py = Y(H_PIVOT), hd = hammerHead(h, h.ang);
  const cat = h.d.who === 'punchy', F = NR(cat ? GINGER : MOUSEY), Wd = NR(PLY);
  // (the arm: a fat furry tube, lit along its top edge, to a white glove round the handle, the handle on to the head)
  const gx = px + (hd.x - px) * 0.42, gy = py + (hd.y - py) * 0.42;
  const nx = -(gy - py), ny = gx - px, nl = Math.hypot(nx, ny) || 1, ox = (nx / nl) * 5, oy = (ny / nl) * 5;
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 26; c.beginPath(); c.moveTo(px, py); c.lineTo(gx, gy); c.stroke();
  c.strokeStyle = F[2]; c.lineWidth = 21; c.stroke();
  c.strokeStyle = F[3]; c.lineWidth = 13; c.beginPath(); c.moveTo(px - ox * 0.6, py - oy * 0.6); c.lineTo(gx - ox * 0.6, gy - oy * 0.6); c.stroke();
  c.strokeStyle = F[4]; c.lineWidth = 4; c.beginPath(); c.moveTo(px - ox * 1.3, py - oy * 1.3); c.lineTo(gx - ox * 1.3, gy - oy * 1.3); c.stroke();
  // (the shoulder's steel joint)
  ballR(c, px, py, 12, NR(STEELP));
  c.strokeStyle = INK; c.lineWidth = 14; c.beginPath(); c.moveTo(gx, gy); c.lineTo(hd.x, hd.y); c.stroke();
  c.strokeStyle = Wd[3]; c.lineWidth = 10; c.stroke();
  c.strokeStyle = Wd[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(gx - ox * 0.6, gy - oy * 0.6); c.lineTo(hd.x - ox * 0.6, hd.y - oy * 0.6); c.stroke();
  ballR(c, gx, gy, 15, NR(['#8A8A8A', '#B4B4B4', '#D8D8D8', '#F4F4F4', '#FFFFFF', '#FFFFFF']));
  box(c, gx - 8, gy - 2, 16, 1, hour('#A1A1AA')); box(c, gx - 6, gy + 3, 12, 1, hour('#A1A1AA'));
  // (the head: a barrel on the handle's end, banded, stepped, its striking face (blood on it) turning to come down flat)
  const a = Math.atan2(hd.y - py, hd.x - px), down = hammerHead(h, hd.down), aDown = Math.atan2(down.y - py, down.x - px);
  c.save(); c.translate(hd.x, hd.y); c.rotate(a - aDown);
  const W = H_HEAD_W, Hh = H_HEAD_H, B = NR(['#5A3410', '#8B5A2B', '#B07A45', '#D9A066', '#EBC08E', '#FFE2B8']);
  c.fillStyle = INK; c.beginPath(); c.roundRect(-W / 2 - 3, -Hh / 2 - 3, W + 6, Hh + 6, 10); c.fill();
  c.save(); c.beginPath(); c.roundRect(-W / 2, -Hh / 2, W, Hh, 8); c.clip();
  box(c, -W / 2, -Hh / 2, W, Hh, B[3]);
  box(c, -W / 2, -Hh / 2, 14, Hh, B[4]); box(c, -W / 2 + 3, -Hh / 2, 4, Hh, B[5]); box(c, W / 2 - 22, -Hh / 2, 10, Hh, B[2]); box(c, W / 2 - 12, -Hh / 2, 12, Hh, B[1]);
  checker(c, -W / 2 + 14, -Hh / 2, 2, Hh, B[4], 0, 1); checker(c, W / 2 - 24, -Hh / 2, 2, Hh, B[2], 0, 1);
  for (let k = 0; k < 6; k++) box(c, -W / 2 + 18 + k * 8, -Hh / 2 + 6 + ((k * 7) % 20), 6, 1, B[2]);
  for (const by of [-Hh / 2 + 10, Hh / 2 - 16]) { box(c, -W / 2, by, W, 6, B[1]); box(c, -W / 2, by, W, 1, B[2]); box(c, -W / 2, by + 5, W, 1, B[0]); for (let k = 0; k < 6; k++) box(c, -W / 2 + 6 + k * 12, by + 2, 2, 2, B[5]); }
  c.restore();
  const Rb = NR(BLOOD);
  box(c, -W / 2 + 4, Hh / 2 - 6, W - 8, 4, Rb[3]); box(c, -W / 2 + 4, Hh / 2 - 6, W - 8, 1, Rb[4]);
  for (let i = 0; i < 5; i++) { c.fillStyle = Rb[3]; c.beginPath(); c.arc(-W / 2 + 10 + i * 13, Hh / 2 - 6 - (i % 2) * 4, 3 + (i % 2), 0, Math.PI * 2); c.fill(); box(c, -W / 2 + 9 + i * 13, Hh / 2 - 8 - (i % 2) * 4, 1, 1, Rb[5]); }
  c.restore();
  // (down on the path: its top lit (stand on it))
  if (h.phase === 'down') { box(c, hd.x - W / 2 + 6, GY - Hh - 1, W - 12, 2, LIP); box(c, hd.x - W / 2 + 8, GY - Hh + 1, W - 16, 1, LIP2); }
};

// ---------------------------------------------------------------------------------------------------------------
// Rakes, bear traps, the crates

const rake = (c: Ctx, x: number, dir: -1 | 1, up: number) => {
  // (the tines at x, the handle lying off along `dir`; up: swung up about the tines, into a face, and back down)
  const k = up > 0 ? Math.sin(Math.min(1, (44 - up) / 10) * Math.PI / 2) * (up < 14 ? up / 14 : 1) : 0;
  const ang = dir > 0 ? -k * 1.45 : Math.PI + k * 1.45;
  const ex = x + Math.cos(ang) * RAKE_LEN, ey = GY - 3 + Math.sin(ang) * RAKE_LEN, Wd = NR(PLY), S = NR(STEELP);
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x, GY - 3); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = Wd[3]; c.lineWidth = 4; c.stroke();
  c.strokeStyle = Wd[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, GY - 4.5); c.lineTo(ex, ey - 1.5); c.stroke();
  // (a grip of tape near the end)
  const tx = x + Math.cos(ang) * (RAKE_LEN - 10), ty = GY - 3 + Math.sin(ang) * (RAKE_LEN - 10);
  c.strokeStyle = hour('#DC2626'); c.lineWidth = 5; c.beginPath(); c.moveTo(tx, ty); c.lineTo(ex, ey); c.stroke();
  // (the head: a steel bar across, the tines pointing up, glinting: the tell)
  box(c, x - 13, GY - 6, 26, 5, INK); box(c, x - 12, GY - 5, 24, 3, S[3]); box(c, x - 12, GY - 5, 24, 1, S[5]);
  for (let i = 0; i < 6; i++) { box(c, x - 11 + i * 4, GY - 13, 3, 8, INK); box(c, x - 10.5 + i * 4, GY - 12, 1, 7, S[5]); box(c, x - 9.5 + i * 4, GY - 12, 1, 7, S[3]); }
  box(c, x - 10, GY - 13, 1, 1, '#FFFFFF');
};
const trap = (c: Ctx, x: number, sprung: boolean, t: number) => {
  // (a steel bear trap: the plate, the springs, the chain to a stake; open: two jaws flat out, teeth up; sprung: shut)
  const S = NR(STEELP), Rs = NR(['#3A1606', '#5E260C', '#8A3A14', '#B4561E', '#D47C3E', '#F0AE7A']);
  for (let k = 0; k < 5; k++) { const cx = x + 18 + k * 4, cy = GY - 1 + (k % 2); c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy, 2.5, 1.5, 0, 0, Math.PI * 2); c.stroke(); box(c, cx - 1, cy - 1, 2, 1, S[4]); }
  box(c, x + 36, GY - 10, 4, 10, INK); box(c, x + 37, GY - 9, 2, 9, Rs[3]); box(c, x + 35, GY - 11, 6, 2, Rs[4]);
  box(c, x - 7, GY - 5, 14, 5, INK); box(c, x - 6, GY - 4, 12, 3, hour('#A16207')); box(c, x - 6, GY - 4, 12, 1, hour('#E8B424'));
  for (const s of [-1, 1]) { box(c, x + s * 22 - 3, GY - 4, 6, 4, INK); box(c, x + s * 22 - 2, GY - 3, 4, 2, S[3]); }
  if (!sprung) {
    for (const s of [-1, 1]) {
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(x + s * 10, GY - 1, 10, s > 0 ? Math.PI : Math.PI * 2, s > 0 ? Math.PI * 2 : Math.PI, s < 0); c.stroke();
      c.strokeStyle = S[3]; c.lineWidth = 3; c.stroke();
      c.strokeStyle = S[5]; c.lineWidth = 1; c.beginPath(); c.arc(x + s * 10, GY - 2, 10, s > 0 ? Math.PI * 1.1 : Math.PI * 1.6, s > 0 ? Math.PI * 1.4 : Math.PI * 1.9); c.stroke();
      for (let i = 0; i < 4; i++) { const tx = x + s * (4 + i * 4.5); box(c, tx - 1.5, GY - 7 - (i % 2) * 2, 3, 6, INK); box(c, tx - 0.5, GY - 6 - (i % 2) * 2, 1, 4, '#FFFFFF'); }
    }
  } else {
    const sh = t < 6 ? (t % 2 ? 1 : -1) : 0;
    c.fillStyle = INK; c.beginPath(); c.ellipse(x + sh, GY - 9, 14, 11, 0, Math.PI, 0); c.fill();
    c.fillStyle = S[2]; c.beginPath(); c.ellipse(x + sh, GY - 9, 12, 9, 0, Math.PI, 0); c.fill();
    c.fillStyle = S[4]; c.beginPath(); c.ellipse(x + sh - 3, GY - 12, 6, 4, 0, Math.PI, 0); c.fill();
    for (let i = -3; i <= 3; i++) { box(c, x + sh + i * 3 - 1, GY - 12, 2, 5, INK); box(c, x + sh + i * 3 - 0.5, GY - 11, 1, 3, '#FFFFFF'); }
  }
};
/** A GENERIC-CO crate (solid: lit along its top). The punching ones: a flap on each side, the glove out on its spring. */
const crate = (c: Ctx, state: GameState, i: number) => {
  const [a, b, h] = CRATES[i], xa = X(a), w = X(b) - xa, top = Y(h);
  const g = itchyOf(state).gloves.find(q => q.i === i);
  const shake = g && g.phase === 'rattle' ? ((state.frame >> 1) % 2 ? 1.5 : -1.5) : 0;
  const Cr = NR(CRATE);
  c.save(); c.translate(shake, 0);
  box(c, xa, top, w, h, INK);
  planks(c, xa + 2, top + 2, w - 4, h - 3, Cr, 12, true, i * 31);
  // (the frame: corner battens lit and shaded, the cross brace, steel corner caps)
  box(c, xa + 2, top + 2, 6, h - 3, Cr[4]); box(c, xa + 2, top + 2, 1, h - 3, Cr[5]); box(c, xa + w - 8, top + 2, 6, h - 3, Cr[1]);
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(xa + 6, top + 6); c.lineTo(xa + w - 6, GY - 5); c.stroke();
  c.strokeStyle = Cr[2]; c.lineWidth = 3; c.stroke();
  c.strokeStyle = Cr[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(xa + 6, top + 5); c.lineTo(xa + w - 6, GY - 6); c.stroke();
  const S = NR(STEELP);
  for (const [cx, cy] of [[xa + 2, top + 2], [xa + w - 10, top + 2], [xa + 2, GY - 9], [xa + w - 10, GY - 9]]) { box(c, cx, cy, 8, 8, S[2]); box(c, cx, cy, 8, 1, S[5]); box(c, cx + 3, cy + 3, 2, 2, S[0]); }
  signText(c, 'GENERIC-CO', xa + w / 2, top + Math.min(h / 2, 30), stencil(hour('#1F2937')));
  if (g) signText(c, 'THIS SIDE UP', xa + w / 2, top + Math.min(h / 2, 30) + 10, { sx: 1, sy: 1, fill: hour('#7F1D1D'), gap: 0, space: 2 });
  if (g && g.phase === 'rattle') for (const s of [-1, 1]) { box(c, (s < 0 ? xa - 6 : xa + w + 3) , top + 8, 3, 1, INK); box(c, (s < 0 ? xa - 8 : xa + w + 5), top + 14, 3, 1, INK); }
  box(c, xa, top, w, 2, LIP); box(c, xa + 2, top + 2, w - 4, 1, LIP2);
  c.restore();
  if (g && g.ext > 0) {
    const gp = glovePos(g), cy = Y(h) + 18, Rg = NR(BLOOD);
    // (the flap knocked open, the spring (an accordion, stepped), the glove: red leather in steps, its laces, the cuff)
    box(c, gp.root + (g.dir < 0 ? -5 : 0), cy - 17, 5, 34, INK); box(c, gp.root + (g.dir < 0 ? -4 : 1), cy - 16, 3, 32, Cr[2]);
    const n = 7, pts: [number, number][] = [];
    for (let k = 0; k <= n; k++) pts.push([gp.root + (gp.x - gp.root - g.dir * 12) * (k / n), cy + (k % 2 ? -7 : 7)]);
    c.lineJoin = 'round';
    c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); pts.forEach(([px, py], k) => (k ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
    c.strokeStyle = S[3]; c.lineWidth = 1.8; c.stroke();
    c.strokeStyle = S[5]; c.lineWidth = 0.8; c.beginPath(); pts.forEach(([px, py], k) => (k ? c.lineTo(px, py - 1) : c.moveTo(px, py - 1))); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.ellipse(gp.x, cy, 17, 15, 0, 0, Math.PI * 2); c.fill();
    eggR(c, gp.x, cy, 15, 13, Rg, false);
    c.fillStyle = Rg[2]; c.beginPath(); c.ellipse(gp.x + g.dir * 6, cy + 3, 6, 8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(gp.x + g.dir * 2, cy - 10); c.quadraticCurveTo(gp.x + g.dir * 8, cy - 2, gp.x + g.dir * 2, cy + 8); c.stroke();
    box(c, gp.x - g.dir * 15 - 5, cy - 7, 10, 14, INK); box(c, gp.x - g.dir * 15 - 4, cy - 6, 8, 12, '#F5F5F4'); box(c, gp.x - g.dir * 15 - 4, cy - 6, 8, 2, '#FFFFFF');
    for (let k = 0; k < 3; k++) box(c, gp.x - g.dir * 9 - 1, cy - 5 + k * 4, 3, 1, '#F5F5F4');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The safe, the piano

const safeArt = (c: Ctx, x: number, bottom: number, open: boolean, lit: boolean) => {
  const w = SAFE.w, h = SAFE.h, top = bottom - h, S = NC('#3A4A60'), Gd = NR(MUSTARD);
  box(c, x - w / 2, top, w, h, INK);
  plate(c, x - w / 2 + 2, top + 2, w - 4, h - 4, S, true);
  box(c, x - w / 2 + 7, top + 7, w - 14, h - 14, INK); plate(c, x - w / 2 + 8, top + 8, w - 16, h - 16, S, false);
  box(c, x - w / 2 + 8, top + 8, w - 16, 9, S[1]);
  // (the dial: chrome in steps, its ticks; the handle; gilt lettering; the hinges)
  ballR(c, x + 6, top + h / 2 + 2, 10, NR(STEELP)); ballR(c, x + 6, top + h / 2 + 2, 5, NR(['#3A3A3A', '#6A6A6A', '#9A9A9A', '#D4D4D8', '#F4F4F5', '#FFFFFF']), false);
  for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2; box(c, x + 6 + Math.cos(an) * 8 - 0.5, top + h / 2 + 2 + Math.sin(an) * 8 - 0.5, 1, 1, INK); }
  box(c, x - w / 2 + 12, top + h / 2, 12, 5, INK); box(c, x - w / 2 + 13, top + h / 2 + 1, 10, 3, NR(STEELP)[4]);
  signText(c, 'GENERIC-CO', x, top + 15, { sx: 1, sy: 1, fill: [Gd[5], Gd[3]] });
  for (const hy of [top + 12, bottom - 18]) { box(c, x + w / 2 - 6, hy, 6, 8, INK); box(c, x + w / 2 - 5, hy + 1, 4, 6, NR(STEELP)[3]); }
  // (its feet)
  for (const fx of [x - w / 2 + 4, x + w / 2 - 12]) { box(c, fx, bottom - 2, 8, 2, INK); }
  if (open) {
    // (down: the door's sprung open, the empty inside; a single moth flutters out of it)
    box(c, x + w / 2 - 4, top + 6, 22, h - 10, INK); plate(c, x + w / 2 - 2, top + 8, 18, h - 14, S, false);
    box(c, x + w / 2 + 6, top + h / 2 - 2, 4, 6, NR(STEELP)[4]);
  }
  if (lit) { box(c, x - w / 2 + 2, top, w - 4, 2, LIP); box(c, x - w / 2 + 3, top + 2, w - 6, 1, LIP2); }
};
const pianoArt = (c: Ctx, x: number, bottom: number, wrecked: boolean, lit: boolean, f: number) => {
  const w = PIANO.w, K = NR(TAR);
  if (!wrecked) {
    // (a baby grand on its side as movers hang it: lacquer in steps with its sheen, the lid shut, the keys along the
    // front, its legs)
    const h = 64, top = bottom - h;
    const body = (grow: number) => { c.beginPath(); c.moveTo(x - w / 2 - grow, bottom + grow); c.lineTo(x - w / 2 - grow, top + 10); c.quadraticCurveTo(x - w / 2 - grow, top - grow, x - w / 2 + 14, top - grow); c.lineTo(x + w / 2 - 30, top - grow); c.quadraticCurveTo(x + w / 2 + grow, top + 4, x + w / 2 + grow, bottom + grow); c.closePath(); };
    c.fillStyle = INK; body(1.5); c.fill();
    c.save(); body(0); c.clip();
    box(c, x - w / 2 - 2, top - 2, w + 4, h + 4, K[3]); box(c, x - w / 2 - 2, top - 2, w + 4, 12, K[4]); box(c, x + w / 2 - 20, top, 22, h, K[1]);
    box(c, x - w / 2 + 8, top + 6, w * 0.45, 2, K[5]); box(c, x - w / 2 + 12, top + 10, w * 0.25, 1, K[5]);
    c.restore();
    box(c, x - w / 2 + 6, bottom - 19, w - 12, 13, INK); box(c, x - w / 2 + 7, bottom - 18, w - 14, 11, '#FAFAFA'); box(c, x - w / 2 + 7, bottom - 9, w - 14, 2, '#D4D4D8');
    for (let k = x - w / 2 + 10; k < x + w / 2 - 8; k += 7) { box(c, k, bottom - 18, 3, 6, '#18181B'); box(c, k + 3, bottom - 18, 1, 10, '#A1A1AA'); }
    signText(c, 'GENERIC-CO', x - 6, top + 26, { sx: 1, sy: 1, fill: NR(MUSTARD)[4] });
    for (const lx of [-w / 2 + 10, w / 2 - 20]) { box(c, x + lx, bottom, 8, 8, INK); box(c, x + lx + 1, bottom, 6, 6, K[3]); box(c, x + lx + 1, bottom + 5, 6, 2, NR(MUSTARD)[3]); }
    return;
  }
  // (the wreck: a heap of black boards and the lid, the keys spilled, the harp's strings sprung out curling; its top lit)
  const h = PIANO.h, top = bottom - h;
  const heap = (grow: number) => { c.beginPath(); c.moveTo(x - w / 2 - grow, bottom); c.lineTo(x - w / 2 + 6 - grow, top + 8 - grow); c.lineTo(x - 10, top - grow); c.lineTo(x + 20, top + 4 - grow); c.lineTo(x + w / 2 + grow, top + 14 - grow); c.lineTo(x + w / 2 + 4 + grow, bottom); c.closePath(); };
  c.fillStyle = INK; heap(1.5); c.fill();
  c.save(); heap(0); c.clip();
  box(c, x - w / 2 - 4, top - 4, w + 12, h + 8, K[2]);
  for (let k = 0; k < 6; k++) { c.save(); c.translate(x - w / 2 + 10 + k * 18, top + 10 + (k % 3) * 8); c.rotate(-0.4 + k * 0.17); box(c, -14, -3, 28, 6, K[3 + (k % 2)]); box(c, -14, -3, 28, 1, K[5]); c.restore(); }
  box(c, x + 6, top + 6, 40, 14, NR(MUSTARD)[2]); box(c, x + 6, top + 6, 40, 2, NR(MUSTARD)[4]);
  c.restore();
  for (let k = 0; k < 9; k++) { c.save(); c.translate(x - w / 2 + 6 + k * 12, bottom - 6 - (k % 3) * 3); c.rotate((k % 2 ? 0.4 : -0.3)); box(c, -4, -3, 8, 5, INK); box(c, -3, -2, 7, 3, k % 3 ? '#FAFAFA' : '#18181B'); c.restore(); }
  c.strokeStyle = hour('#E4E4E7'); c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + 10 + k * 6, top + 4); c.bezierCurveTo(x + 20 + k * 6, top - 30, x + 50 + k * 4, top - 10, x + 40 + k * 5 + Math.sin(f * 0.05 + k) * 2, top - 26 + k * 4); c.stroke(); }
  if (lit) { box(c, x - w / 2 + 10, top + 4, w - 30, 2, LIP); box(c, x - w / 2 + 12, top + 6, w - 34, 1, LIP2); }
};
/** The rope it hangs from, up to the jib/pulley (twisted, two-tone); fraying (strands sprung loose, it jiggles). */
const hung = (c: Ctx, d: Drop, topY: number, f: number) => {
  const fray = d.phase === 'fray', jig = fray ? Math.sin(f * 1.3) * 2 : Math.sin(f * 0.04) * 1;
  const objTop = d.y - (d.id === 'safe' ? SAFE.h : 64);
  c.strokeStyle = INK; c.lineWidth = fray ? 2.5 : 4; c.beginPath(); c.moveTo(d.x, topY); c.lineTo(d.x + jig, objTop); c.stroke();
  c.strokeStyle = hour('#D6B97C'); c.lineWidth = fray ? 1 : 2; c.stroke();
  if (!fray) { c.strokeStyle = hour('#8A6A3A'); c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(d.x + 0.5, topY); c.lineTo(d.x + jig + 0.5, objTop); c.stroke(); c.setLineDash([]); }
  if (fray) { const fy = topY + (objTop - topY) * 0.35; c.strokeStyle = hour('#D6B97C'); c.lineWidth = 1; for (const s of [-1, 1, -1, 1]) { c.beginPath(); c.moveTo(d.x, fy); c.quadraticCurveTo(d.x + s * 8, fy + 4, d.x + s * 12, fy - 6 + (d.t % 5)); c.stroke(); } box(c, d.x - 1, fy - 1, 3, 3, hour('#FFF0C8')); }
  // (the slings round it, the hook)
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(d.x + jig, objTop - 4); c.lineTo(d.x - d.w / 2 + 6, objTop + 6); c.moveTo(d.x + jig, objTop - 4); c.lineTo(d.x + d.w / 2 - 6, objTop + 6); c.stroke();
  c.strokeStyle = hour('#C4CCD6'); c.lineWidth = 1; c.stroke();
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(d.x + jig, objTop - 6, 4, 0, Math.PI * 1.5); c.stroke(); c.strokeStyle = hour('#C4CCD6'); c.lineWidth = 1.5; c.stroke();
};
/** The dock crane (behind the path: a mustard lattice mast, the jib out over the path, the pulley), and the piano's
 *  hoist. */
const crane = (c: Ctx, x: number, topY: number, back: number) => {
  const D = dimmed(INK), M = DR(MUSTARD), S = DR(STEELP);
  box(c, back - 10, topY - 10, 20, GY - topY + 10, D);
  for (const lx of [back - 8, back + 4]) { box(c, lx, topY - 8, 4, GY - topY + 8, M[3]); box(c, lx, topY - 8, 1, GY - topY + 8, M[5]); }
  c.strokeStyle = M[1]; c.lineWidth = 2; c.beginPath(); for (let y = topY; y < GY; y += 24) { c.moveTo(back - 6, y); c.lineTo(back + 6, y + 24); } c.stroke();
  box(c, back - 18, GY - 12, 36, 12, D); box(c, back - 16, GY - 10, 32, 8, S[3]); box(c, back - 16, GY - 10, 32, 2, S[5]);
  box(c, Math.min(back, x) - 10, topY - 14, Math.abs(x - back) + 30, 14, D);
  box(c, Math.min(back, x) - 8, topY - 12, Math.abs(x - back) + 26, 10, M[3]); box(c, Math.min(back, x) - 8, topY - 12, Math.abs(x - back) + 26, 2, M[5]); box(c, Math.min(back, x) - 8, topY - 4, Math.abs(x - back) + 26, 2, M[1]);
  for (let k = Math.min(back, x); k < Math.max(back, x); k += 14) { c.strokeStyle = M[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(k, topY - 11); c.lineTo(k + 7, topY - 4); c.lineTo(k + 14, topY - 11); c.stroke(); }
  ballR(c, x, topY, 8, S);
  box(c, back - 14, topY - 34, 28, 22, D); box(c, back - 12, topY - 32, 24, 18, M[2]); box(c, back - 8, topY - 28, 10, 8, dimmed('#BAE6FD'));
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
    if (d.phase === 'fall') for (const dx of [-d.w / 3, 0, d.w / 3]) box(c, d.x + dx - 1, d.y - (d.id === 'safe' ? SAFE.h : 64) - 30, 3, 22, 'rgba(255,255,255,0.5)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Cannons and their balls

/** The circus cannon on its carriage (red barrel banded in gold, stars, big spoked wheels; the barrel's elevation: low
 *  or high), facing left; the carriage's top lit (a step over it). */
const cannonArt = (c: Ctx, state: GameState, cn: Cannon, x: number, bottom: number, barrelY: number, lit: boolean) => {
  const f = state.frame, tell = cn.phase === 'tell', r = cn.recoil, R = NR(BLOOD), Gd = NR(MUSTARD);
  const tx = x + 10 + r, ty = bottom - CANNON.h + 6, mx = cn.muzzle + r, my = barrelY;
  const a = Math.atan2(my - ty, mx - tx), L = Math.hypot(mx - tx, my - ty);
  c.save(); c.translate(tx, ty); c.rotate(a);
  const barrel = (g: number) => { c.beginPath(); c.moveTo(-14 - g, -18 - g); c.lineTo(L + g, -15 - g); c.lineTo(L + g, 15 + g); c.lineTo(-14 - g, 18 + g); c.quadraticCurveTo(-28 - g, 0, -14 - g, -18 - g); };
  c.fillStyle = INK; barrel(2); c.fill();
  c.save(); barrel(0); c.clip();
  // (banded round: lit along its top, shade along its belly)
  const bandsY: [number, number, string][] = [[-20, 6, R[5]], [-14, 6, R[4]], [-8, 10, R[3]], [2, 6, R[2]], [8, 6, R[1]], [14, 8, R[0]]];
  for (const [y0, hh, col] of bandsY) box(c, -30, y0, L + 40, hh, col);
  for (const by of [-14, 2]) checker(c, -30, by - 1, L + 40, 2, by < 0 ? R[4] : R[2], 0, 1);
  c.restore();
  for (const bx of [10, L - 26]) { box(c, bx - 1, -16, 8, 32, INK); box(c, bx, -15, 6, 30, Gd[3]); box(c, bx, -15, 6, 4, Gd[5]); box(c, bx, 9, 6, 6, Gd[1]); }
  box(c, L - 6, -17, 6, 34, INK); box(c, L - 5, -16, 4, 32, Gd[3]); box(c, L - 5, -16, 4, 5, Gd[5]);
  c.fillStyle = INK; c.beginPath(); c.ellipse(L, 0, 5, 15, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#0A0A0A'; c.beginPath(); c.ellipse(L + 1, 0, 3, 11, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 3; i++) { const sx = 26 + i * 18; if (sx > L - 34) break; c.fillStyle = Gd[4]; c.beginPath(); for (let k = 0; k < 10; k++) { const an = (k / 10) * Math.PI * 2 - Math.PI / 2, ra = k % 2 ? 2 : 4.5; c.lineTo(sx + Math.cos(an) * ra, -2 + Math.sin(an) * ra); } c.closePath(); c.fill(); }
  c.restore();
  // (the touch hole fizzing: the tell; sparks and smoke)
  if (tell) {
    for (const [rr, col] of [[9, 'rgba(255,200,80,0.3)'], [5 + (f % 3), (f >> 1) % 2 ? '#FDE047' : '#FFFFFF']] as [number, string][]) { c.fillStyle = col; c.beginPath(); c.arc(tx + 6, ty - 18, rr, 0, Math.PI * 2); c.fill(); }
    for (let k = 0; k < 4; k++) { const an = f * 0.7 + k * 1.6; box(c, tx + 6 + Math.cos(an) * 9, ty - 18 + Math.sin(an) * 7, 2, 2, k % 2 ? '#FDE047' : '#FFFFFF'); }
    c.fillStyle = 'rgba(200,200,200,0.5)'; c.beginPath(); c.arc(tx + 10, ty - 30 - (f % 12), 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(230,230,230,0.35)'; c.beginPath(); c.arc(tx + 14, ty - 42 - (f % 16), 8, 0, Math.PI * 2); c.fill();
  }
  // (the carriage: a red box in steps with gold stars, big spoked wheels in steps; its top lit)
  const cx0 = x - CANNON.w / 2, top = bottom - CANNON.h;
  if (lit) {
    box(c, cx0, top, CANNON.w, CANNON.h, INK);
    plate(c, cx0 + 2, top + 2, CANNON.w - 4, CANNON.h - 3, R, false);
    box(c, cx0 + 2, top + 2, CANNON.w - 4, 6, Gd[3]); box(c, cx0 + 2, top + 2, CANNON.w - 4, 1, Gd[5]); box(c, cx0 + 2, top + 7, CANNON.w - 4, 1, Gd[1]);
    for (const [sx, sy] of [[cx0 + 20, top + 22], [cx0 + 50, top + 36], [cx0 + 80, top + 20]] as [number, number][]) { c.fillStyle = INK; c.beginPath(); for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 - Math.PI / 2, ra = i % 2 ? 4 : 8.5; c.lineTo(sx + Math.cos(an) * ra, sy + Math.sin(an) * ra); } c.closePath(); c.fill(); c.fillStyle = Gd[3]; c.beginPath(); for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 - Math.PI / 2, ra = i % 2 ? 3 : 7; c.lineTo(sx + Math.cos(an) * ra, sy + Math.sin(an) * ra); } c.closePath(); c.fill(); box(c, sx - 2, sy - 3, 2, 2, Gd[5]); }
    for (const wx of [cx0 + 22, cx0 + CANNON.w - 22]) {
      c.fillStyle = INK; c.beginPath(); c.arc(wx, bottom - 18, 20, 0, Math.PI * 2); c.fill();
      c.strokeStyle = Gd[2]; c.lineWidth = 4; c.beginPath(); c.arc(wx, bottom - 18, 16, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = Gd[4]; c.lineWidth = 1.5; c.beginPath(); c.arc(wx, bottom - 18, 17, Math.PI * 1.0, Math.PI * 1.6); c.stroke();
      c.strokeStyle = INK; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI; c.beginPath(); c.moveTo(wx + Math.cos(an) * 14, bottom - 18 + Math.sin(an) * 14); c.lineTo(wx - Math.cos(an) * 14, bottom - 18 - Math.sin(an) * 14); c.stroke(); }
      c.strokeStyle = Gd[3]; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI; c.beginPath(); c.moveTo(wx + Math.cos(an) * 13, bottom - 18 + Math.sin(an) * 13); c.lineTo(wx - Math.cos(an) * 13, bottom - 18 - Math.sin(an) * 13); c.stroke(); }
      ballR(c, wx, bottom - 18, 5, Gd);
    }
    box(c, cx0, top, CANNON.w, 2, LIP); box(c, cx0 + 2, top + 2, CANNON.w - 4, 1, LIP2);
  }
};
/** The canyon's cannon on its scissor lift behind the far rim (the lift's height: up to his). */
const liftArt = (c: Ctx, state: GameState) => {
  const k = itchyOf(state), cn = k.lift, x = cn.x;
  if (!onScreen(state, x - 140, x + 140)) return;
  const topY = Y(cn.lift) + 16, D = dimmed(INK), M = DR(MUSTARD), S = DR(STEELP);
  box(c, x - 52, GY - 22, 104, 22, D); box(c, x - 50, GY - 20, 100, 18, M[3]); box(c, x - 50, GY - 20, 100, 3, M[5]); hazard(c, x - 50, GY - 8, 100, 6, M[3], D, 6);
  for (const wx of [x - 38, x + 38]) ballR(c, wx, GY - 2, 5, S);
  const n = Math.max(2, Math.round((GY - 22 - topY) / 50));
  for (const [lw, col] of [[7, D], [4, S[3]], [1, S[5]]] as [number, string][]) {
    c.strokeStyle = col; c.lineWidth = lw;
    for (let i = 0; i < n; i++) { const y0 = GY - 22 - ((GY - 22 - topY) * i) / n, y1 = GY - 22 - ((GY - 22 - topY) * (i + 1)) / n; c.beginPath(); c.moveTo(x - 36, y0 - (lw === 1 ? 1 : 0)); c.lineTo(x + 36, y1 - (lw === 1 ? 1 : 0)); c.moveTo(x + 36, y0); c.lineTo(x - 36, y1); c.stroke(); }
  }
  for (let i = 0; i <= n; i++) { const y = GY - 22 - ((GY - 22 - topY) * i) / n; for (const s of [-1, 1]) ballR(c, x + s * 36, y, 3, S); }
  box(c, x - 48, topY - 2, 96, 12, D); box(c, x - 46, topY, 92, 8, DR(BLOOD)[3]); box(c, x - 46, topY, 92, 2, DR(BLOOD)[5]);
  cannonArt(c, state, cn, x, topY + CANNON.h - 30, Y(cn.lift), false);
};
const ball = (c: Ctx, x: number, y: number) => {
  for (const dy of [-7, 0, 7]) { box(c, x + BALL_R + 4, y + dy - 1, 22, 2, 'rgba(255,255,255,0.6)'); box(c, x + BALL_R + 28, y + dy - 1, 8, 2, 'rgba(255,255,255,0.3)'); }
  ballR(c, x, y, BALL_R + 1, NR(TAR));
  box(c, x - 6, y - 7, 3, 2, '#C4CCD6');
};

// ---------------------------------------------------------------------------------------------------------------
// Fuses, TNT, holes, throws, blasts

const tnt = (c: Ctx, x: number, bottom: number, rise = 1) => {
  // (a bundle of six red sticks strapped together, TNT on the band; rising out of its trapdoor)
  const h = 50 * rise;
  if (h < 2) return;
  const R = NR(BLOOD), Cr = NR(['#8A7A60', '#B4A486', '#D8CAA8', '#FEF3C7', '#FFFAE8', '#FFFFFF']);
  c.save(); c.beginPath(); c.rect(x - 30, bottom - 70, 60, 70); c.clip();
  c.translate(0, 50 - h);
  for (let i = 0; i < 6; i++) { const sx = x - 21 + i * 7; box(c, sx - 1, bottom - 50, 9, 50, INK); box(c, sx, bottom - 49, 7, 48, R[3]); box(c, sx, bottom - 49, 2, 48, R[4]); box(c, sx + 5, bottom - 49, 2, 48, R[2]); box(c, sx, bottom - 49, 7, 2, R[5]); }
  for (let i = 0; i < 6; i++) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 18 + i * 7, bottom - 50); c.quadraticCurveTo(x - 16 + i * 6, bottom - 58, x - 10 + i * 4, bottom - 60 + (i % 2) * 3); c.stroke(); }
  box(c, x - 23, bottom - 32, 46, 14, INK); box(c, x - 22, bottom - 31, 44, 12, Cr[3]); box(c, x - 22, bottom - 31, 44, 2, Cr[5]); box(c, x - 22, bottom - 21, 44, 2, Cr[1]);
  signText(c, 'TNT', x, bottom - 22, small([R[4], R[2]]));
  c.restore();
};
/** The fuse along its line (unburnt: a tan cord, twisted; burnt: a black smudge of ash), the spark at its head. */
const fuseLine = (c: Ctx, state: GameState, fz: Fuse) => {
  const burnt = fz.phase === 'burn' ? fz.s : fz.phase === 'boom' || (fz.phase === 'reset' && fz.t < 70) ? fz.len : 0;
  const steps = Math.ceil(fz.len / 6);
  for (let i = 0; i < steps; i++) {
    const s0 = (i / steps) * fz.len, s1 = ((i + 1) / steps) * fz.len, p0 = fusePoint(fz, s0), p1 = fusePoint(fz, s1);
    if (!onScreen(state, Math.min(p0.x, p1.x) - 10, Math.max(p0.x, p1.x) + 10)) continue;
    const gone = s1 <= burnt;
    c.strokeStyle = INK; c.lineWidth = gone ? 2 : 4; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
    if (!gone) { c.strokeStyle = hour('#D6B97C'); c.lineWidth = 2; c.stroke(); if (i % 2) { c.strokeStyle = hour('#8A6A3A'); c.lineWidth = 1; c.beginPath(); c.moveTo((p0.x + p1.x) / 2 - 1, (p0.y + p1.y) / 2 - 1); c.lineTo((p0.x + p1.x) / 2 + 1, (p0.y + p1.y) / 2 + 1); c.stroke(); } }
    else if (i % 3 === 0) box(c, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + 1, 2, 1, '#5A5050');
  }
  if (fz.phase === 'burn') {
    const sp = fusePoint(fz, fz.s), f = state.frame;
    for (const [rr, a] of [[18, 0.16], [12, 0.3]] as [number, number][]) { c.fillStyle = `rgba(255,200,80,${a})`; c.beginPath(); c.arc(sp.x, sp.y, rr, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; c.beginPath();
    for (let i = 0; i < 10; i++) { const an = (i / 10) * Math.PI * 2 + f * 0.5, ra = i % 2 ? 3 : 8; c.lineTo(sp.x + Math.cos(an) * ra, sp.y + Math.sin(an) * ra); }
    c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) { const an = f * 0.9 + k * 2.1; box(c, sp.x + Math.cos(an) * 12, sp.y + Math.sin(an) * 10 - 2, 2, 2, '#FDBA74'); }
    c.fillStyle = 'rgba(160,160,160,0.35)'; c.beginPath(); c.arc(sp.x - 4, sp.y - 12 - (f % 10), 4, 0, Math.PI * 2); c.fill();
  }
};
/** The giant animatronic Kicky crouched behind the path with the giant match (struck: the tell): big and mean, his
 *  steel showing at the joints, a piston for a forearm. */
const matchKicky = (c: Ctx, state: GameState, fz: Fuse, x: number) => {
  const D = dimmed(INK), F = DR(MOUSEY), S = DR(STEELP), R = DR(BLOOD);
  const strike = fz.phase === 'strike', u = strike ? fz.t / 34 : fz.phase === 'burn' ? 1 : 0;
  // (the plinth: a red block in steps, a mustard band, KICKY)
  box(c, x - 62, Y(42), 124, 42, D); box(c, x - 60, Y(40), 120, 40, R[3]); box(c, x - 60, Y(40), 120, 3, R[5]); box(c, x + 40, Y(40), 20, 40, R[1]);
  box(c, x - 60, Y(30), 120, 6, DR(MUSTARD)[3]);
  // (crouched on his haunches: a leg folded, the big foot in its red high-top; the body stepped round; a hose)
  eggR(c, x - 30, Y(52), 28, 14, F, true);
  eggR(c, x - 10, Y(48), 26, 10, DR(BLOOD), true); box(c, x - 30, Y(44), 40, 3, DR(BONE)[4]);
  c.fillStyle = D; c.beginPath(); c.ellipse(x - 6, Y(110), 46, 58, -0.2, 0, Math.PI * 2); c.fill();
  eggR(c, x - 6, Y(110), 44, 56, F, false, -0.2);
  eggR(c, x + 2, Y(102), 18, 30, DR(['#8A8480', '#B4AEA8', '#D8D2CC', '#F5F5F4', '#FFFFFF', '#FFFFFF']), false, -0.2);
  plate(c, x - 40, Y(128), 18, 22, S, true);
  c.strokeStyle = D; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 46, Y(100)); c.quadraticCurveTo(x - 70, Y(130), x - 30, Y(150)); c.stroke(); c.strokeStyle = dimmed('#3F3F46'); c.lineWidth = 2; c.stroke();
  // (the tail: a long pink cable, curling round the plinth)
  c.strokeStyle = D; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 46, Y(70)); c.bezierCurveTo(x - 90, Y(60), x - 80, Y(10), x - 50, Y(20)); c.stroke(); c.strokeStyle = dimmed('#F9A8D4'); c.lineWidth = 3; c.stroke();
  c.save(); c.translate(x + 10, Y(186)); mouseHead(c, 0, 0, 30, 0.12);
  c.fillStyle = dimmed('#8E86B4'); c.globalAlpha = 0.16; c.beginPath(); c.arc(0, -8, 48, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  if (strike || fz.phase === 'burn') { c.fillStyle = 'rgba(255,40,40,0.8)'; c.beginPath(); c.arc(16, -8, 4, 0, Math.PI * 2); c.arc(4, -7, 3, 0, Math.PI * 2); c.fill(); }
  c.restore();
  // (the arm: up and back while striking, then out over the fuse's end: fur to the elbow, a piston forearm, the glove)
  const hx = x + 30 + u * 40, hy = Y(100) + (strike ? Math.sin(u * Math.PI) * -30 : 30);
  const ex = (x + 10 + hx) / 2, ey = (Y(130) + hy) / 2 - 6;
  c.lineCap = 'round';
  c.strokeStyle = D; c.lineWidth = 19; c.beginPath(); c.moveTo(x + 10, Y(130)); c.lineTo(ex, ey); c.stroke(); c.strokeStyle = F[3]; c.lineWidth = 15; c.stroke(); c.strokeStyle = F[4]; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 8, Y(134)); c.lineTo(ex - 2, ey - 4); c.stroke();
  c.strokeStyle = D; c.lineWidth = 9; c.beginPath(); c.moveTo(ex, ey); c.lineTo(hx, hy); c.stroke(); c.strokeStyle = S[3]; c.lineWidth = 6; c.stroke(); c.strokeStyle = S[5]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex, ey - 2); c.lineTo(hx, hy - 2); c.stroke();
  ballR(c, ex, ey, 6, S);
  ballR(c, hx, hy, 10, DR(['#8A8A8A', '#B4B4B4', '#D8D8D8', '#F4F4F4', '#FFFFFF', '#FFFFFF']));
  // (the match: a long stick in steps, a red head; lit, a flame in steps)
  const mx = hx + 8, my = hy + 40, Wd = NR(['#7A5A3A', '#A07A50', '#C8A070', '#F5D0A9', '#FFE8CC', '#FFFFFF']);
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(hx, hy); c.lineTo(mx, my); c.stroke(); c.strokeStyle = Wd[3]; c.lineWidth = 4.5; c.stroke(); c.strokeStyle = Wd[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 1.5, hy); c.lineTo(mx - 1.5, my); c.stroke();
  ballR(c, mx, my, 6, NR(BLOOD));
  if ((strike && fz.t > 14) || fz.phase === 'burn') { const f = state.frame; for (const [rx, ry, col, dy] of [[8 + (f % 3), 14 + (f % 4), 'rgba(251,146,60,0.45)', -10], [6 + (f % 3), 11 + (f % 4), '#FB923C', -8], [4, 8, '#FDE047', -7], [2, 4, '#FFFFFF', -5]] as [number, number, string, number][]) { c.fillStyle = col; c.beginPath(); c.ellipse(mx, my + dy, rx, ry, 0, 0, Math.PI * 2); c.fill(); } }
  if (strike && fz.t < 14) for (let k = 0; k < 4; k++) box(c, mx + (k - 2) * 4, my - 6 - k * 2, 2, 2, '#FDE047');
};
/** The set's igniter on the fly rail (a GENERIC-CO clockwork box that strikes its own match). */
const igniter = (c: Ctx, state: GameState, fz: Fuse) => {
  const p = fusePoint(fz, 0), Cr = NR(CRATE);
  box(c, p.x - 5, p.y - 19, 36, 24, INK); plate(c, p.x - 4, p.y - 18, 34, 22, Cr, true);
  signText(c, 'GC', p.x + 13, p.y - 5, small(hour('#1F2937'), Cr[4]));
  ballR(c, p.x + 13, p.y - 20, 4, NR(STEELP));
  const a = fz.phase === 'strike' ? fz.t * 0.4 : state.frame * 0.02;
  c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(p.x + 13, p.y - 20); c.lineTo(p.x + 13 + Math.cos(a) * 10, p.y - 20 + Math.sin(a) * 10); c.stroke();
  c.strokeStyle = hour('#C4CCD6'); c.lineWidth = 1; c.stroke();
  if (fz.phase === 'strike' && fz.t > 14) { c.fillStyle = 'rgba(251,146,60,0.4)'; c.beginPath(); c.arc(p.x, p.y - 4, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FB923C'; c.beginPath(); c.arc(p.x, p.y - 4, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE047'; c.beginPath(); c.arc(p.x, p.y - 4, 2.5, 0, Math.PI * 2); c.fill(); }
};
const drawFuses = (c: Ctx, state: GameState) => {
  for (const fz of itchyOf(state).fuses) {
    const tx = X(fz.d.tnt[0]), ty = Y(fz.d.tnt[1]);
    if (fz.d.kicky !== undefined && onScreen(state, X(fz.d.kicky) - 120, X(fz.d.kicky) + 120)) matchKicky(c, state, fz, X(fz.d.kicky));
    if (fz.d.kicky === undefined) { const p0 = fusePoint(fz, 0); if (onScreen(state, p0.x - 40, p0.x + 40)) igniter(c, state, fz); }
    fuseLine(c, state, fz);
    if (onScreen(state, tx - 40, tx + 40)) {
      // (the trapdoor under the TNT, hazard-striped; the pile rising out of it again after)
      const S = NR(STEELP);
      box(c, tx - 30, ty - 3, 60, 6, INK); hazard(c, tx - 29, ty - 2, 58, 4, NR(MUSTARD)[3], S[0], 4);
      const rise = fz.phase === 'boom' ? 0 : fz.phase === 'reset' ? Math.max(0, Math.min(1, (fz.t - 60) / 40)) : 1;
      if (rise < 1 && rise > 0) { box(c, tx - 26, ty - 2, 52, 3, '#050505'); }
      tnt(c, tx, ty, rise);
      if (fz.phase === 'boom' || (fz.phase === 'reset' && fz.t < 60)) { for (const [rx, a] of [[46, 0.3], [36, 0.45], [22, 0.55]] as [number, number][]) { c.fillStyle = `rgba(30,25,20,${a})`; c.beginPath(); c.ellipse(tx, ty, rx, 6, 0, 0, Math.PI * 2); c.fill(); } }
    }
  }
};
/** A portable hole: on the floor (a black ellipse, spreading out flat, peeling back up at the end), or up in the air
 *  (the one he drops out of: dead black, ragged sheen). */
const holeArt = (c: Ctx, x: number, y: number, w: number, k: number, sky: boolean) => {
  if (k <= 0.02) return;
  const rx = (w / 2) * k, ry = sky ? (w / 2.4) * k : 9 * k;
  c.fillStyle = 'rgba(20,10,30,0.3)'; c.beginPath(); c.ellipse(x + 2, y + 2, rx + 2, ry + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#050505'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(150,150,200,0.55)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, rx - 1, ry - 1, 0, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
  c.strokeStyle = 'rgba(230,230,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, rx - 1, ry - 1, 0, Math.PI * 1.2, Math.PI * 1.4); c.stroke();
  if (!sky) { c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(x, y - 1, rx * 0.8, ry * 0.55, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#050505'; c.beginPath(); c.ellipse(x, y, rx * 0.55, ry * 0.4, 0, 0, Math.PI * 2); c.fill(); }
  else { c.strokeStyle = 'rgba(120,120,180,0.4)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, rx * 0.7, ry * 0.7, 0.3, 0, Math.PI * 2); c.stroke(); }
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
    if (s.kind === 'cleaver') { cleaver(c, s.x, s.y + (s.down ? 10 : 0), s.down ? 2.8 : s.t * 0.55 * Math.sign(s.vx || 1)); if (!s.down) for (let k = 1; k < 3; k++) box(c, s.x - Math.sign(s.vx || 1) * k * 8, s.y - 8 + k, 5, 1, 'rgba(255,255,255,0.5)'); }
    else if (s.kind === 'dynamite') dynamiteStick(c, s.x, s.y - 4, s.down ? 1.5 : s.t * 0.25, true, f, Math.max(0.05, (s.fuse ?? 0) / 90));
    else foldedHole(c, s.x, s.y, s.t * 0.4, 22);
  }
};
const drawBlasts = (c: Ctx, state: GameState) => {
  for (const b of itchyOf(state).blasts) {
    const u = b.t / 30, r = b.r * (0.4 + u * 0.8), a = 1 - u;
    // (the fireball in bands: a hot white heart, yellow, orange, a red rim; smoke puffs rolling out; bits flung)
    for (const [k, col] of [[1.05, `rgba(120,30,20,${0.5 * a})`], [0.95, `rgba(249,115,22,${0.65 * a})`], [0.7, `rgba(253,224,71,${0.75 * a})`], [0.4, `rgba(255,250,230,${0.85 * a})`]] as [number, string][]) {
      c.fillStyle = col; c.beginPath(); for (let i = 0; i < 16; i++) { const an = (i / 16) * Math.PI * 2 + b.t * 0.05, ra = (i % 2 ? r * 0.72 : r) * k; c.lineTo(b.x + Math.cos(an) * ra, b.y + Math.sin(an) * ra); } c.closePath(); c.fill();
    }
    if (u > 0.3) for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI * 2, d = r * (0.9 + u * 0.4); c.fillStyle = `rgba(70,60,60,${0.45 * a})`; c.beginPath(); c.arc(b.x + Math.cos(an) * d, b.y + Math.sin(an) * d * 0.7 - u * 20, 8 + u * 10, 0, Math.PI * 2); c.fill(); }
    if (u < 0.6) for (let i = 0; i < 8; i++) { const an = (i / 8) * Math.PI * 2 + 0.3, d = r * (0.6 + u * 1.4); box(c, b.x + Math.cos(an) * d, b.y + Math.sin(an) * d, 3, 3, i % 2 ? '#3F3F46' : '#B01C22'); }
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
void DC; void BONE; void gore;
