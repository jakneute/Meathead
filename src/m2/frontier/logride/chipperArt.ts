// The end of the line, drawn (peak SNES): a REAL logging crew's gear, nothing of the park's. The crew's clearing (real
// dirt and duff under a lit grass lip (his to stand on), fresh-cut stumps with their saw kerfs, sawdust, slash, a red
// gas can, a cooler, the trail back to the park on a spray-painted sheet of ply), their truck (a mud-spattered old
// flatbed, dented, a ladder rack and a CB whip, its bed heaped with chips, red after him), the sluice's conveyor up out
// of the river (a steel frame on legs, its belt and cleats going, the rollers), and the big orange chipper on its
// trailer (stepped paint, louvers, decals, the feed hopper with its DANGER plate and the throat's knives, the chute out
// over the truck, exhaust when it runs) with its timing lamp on top: off, amber (READY), green flashing with JUMP!
// over the clearing (that cue stays: the jump's timing). The crew's warning on the riverbank.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { steppedGlow } from '../../intro/art/kit';
import { saidOver } from '../section';
import { onScreen, painted } from '../kit';
import { type Ctx, box, checker, mix, hash, stillAt, puff, INK, hr, crewSign, bands, ORANGE, STEEL, DIRT, GRASS, BARK, RINGS, LIP } from './paint';
import { rideOf } from './state';
import { X, waterY, CHIPPER, LAND_X, CLEARING, END } from './layout';
import { CHUTE } from './chipper';
import { drawGorePools, drawChuteBlood, drawHopperBlood, drawGoreFront, bloodyKnives, chipperJammed } from './chipperGore';

/** Behind him: the clearing, the truck, the conveyor, the chipper's body and chute, the lamp, the signs. */
export const drawChipperBack = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(10480), X(11960))) return;
  const r = rideOf(state), ch = r.chip, f = state.frame, g = CHIPPER.ground;
  // (the river's sign before it: the crew's own, spray-painted)
  if (onScreen(state, X(10480), X(10640))) crewSign(c, X(10560), waterY(10560) - 60, ['WOODCHIPPER', 'AHEAD. NO LOGS PAST HERE'], { seed: 3 });
  if (!onScreen(state, X(10600), X(11960))) return;
  // ---- the clearing: real dirt and duff, its grass lip lit (his to stand on), stumps, sawdust, slash, the crew's things
  const ca = X(CLEARING.a) - 40, cw = X(CLEARING.b) - X(CLEARING.a) + 80;
  for (let x = ca, i = 0; x < ca + cw; x += 200, i++) if (onScreen(state, x, x + 200)) stillAt(c, `lr-clearing-${i}`, x, g, 0, -4, Math.min(200, ca + cw - x), 224, gg => {
    const D = hr('dirt', DIRT, 0.18), G = hr('grass', GRASS, 0.18), L = hr('lip', LIP, 0.18), w = Math.min(200, ca + cw - x);
    bands(gg, 0, 0, w, 220, [D[3], D[3], D[2], D[2], D[1], D[1], D[0]]);
    for (let n = 0; n < 30; n++) { const px = hash(i * 31 + n) * w, py = 6 + hash(i * 17 + n * 3) * 200, rr = 1 + hash(n + i) * 4; box(gg, px, py, rr * 2, rr, D[1]); box(gg, px, py, rr, 1, D[5]); }
    for (let px = 0; px < w; px += 4) { const k = hash(i * 7 + px); box(gg, px, 4, 4, 3 + k * 4, k > 0.6 ? G[3] : D[4]); }
    for (let px = 0; px < w; px += 3) if (hash(i * 13 + px) > 0.55) box(gg, px, 1 - Math.floor(hash(px + i) * 4), 1, 4, hash(px * 3) > 0.5 ? G[4] : G[6]);
    box(gg, 0, 0, w, 1, L[3]); box(gg, 0, 1, w, 1, L[2]); box(gg, 0, 2, w, 1, L[1]);
    // (sawdust and chips drifted over it)
    for (let n = 0; n < 40; n++) box(gg, hash(i * 3 + n * 1.7) * w, 3 + hash(n * 2.3 + i) * 10, 2, 1, hash(n) > 0.5 ? '#D8B878' : '#B8904E');
  });
  // (the fresh stumps: kerf lines across their tops, bark stepped, sawdust at their feet)
  for (const sx of [11420, 11520]) if (onScreen(state, X(sx) - 20, X(sx) + 20)) stillAt(c, 'lr-stump', X(sx), g, -16, -18, 32, 20, gg => {
    const B = hr('bark', BARK), Rg = hr('rings', RINGS);
    box(gg, -13, -15, 26, 15, INK); box(gg, -12, -14, 24, 14, B[3]); box(gg, -12, -14, 6, 14, B[5]); box(gg, 6, -14, 6, 14, B[1]);
    for (let y = -12; y < 0; y += 4) box(gg, -10 + ((y * 3) & 7), y, 2, 3, B[2]);
    gg.fillStyle = INK; gg.beginPath(); gg.ellipse(0, -15, 13, 4, 0, 0, Math.PI * 2); gg.fill();
    gg.fillStyle = Rg[4]; gg.beginPath(); gg.ellipse(0, -15, 12, 3, 0, 0, Math.PI * 2); gg.fill();
    gg.strokeStyle = Rg[2]; gg.lineWidth = 1; gg.beginPath(); gg.ellipse(0, -15, 7, 1.8, 0, 0, Math.PI * 2); gg.stroke();
    box(gg, -9, -16, 18, 1, Rg[1]); box(gg, -15, -2, 30, 2, '#D8B878');
  });
  // (a red gas can and a cooler by the truck; the trail back to the park, on a sheet of ply)
  if (onScreen(state, X(11600), X(11720))) stillAt(c, 'lr-crewkit', X(11640), g, -30, -24, 80, 26, gg => {
    box(gg, -26, -18, 16, 18, INK); box(gg, -25, -17, 14, 17, '#C81E1E'); box(gg, -25, -17, 4, 17, '#E8503A'); box(gg, -15, -22, 4, 6, INK); box(gg, -14, -21, 2, 4, '#F2C21A');
    box(gg, 0, -16, 34, 16, INK); box(gg, 1, -15, 32, 15, '#E8E8E0'); box(gg, 1, -15, 32, 5, '#2E6A3A'); box(gg, 1, -10, 32, 1, '#1E4A2A'); box(gg, 10, -19, 14, 3, INK);
  });
  crewSign(c, X(CLEARING.a) + 82, g, ['< TRAIL', 'TO PARK'], { col: '#1E3A8A', seed: 5, tall: 66 });
  // ---- the crew's truck: an old flatbed, mud up its sides, dented, a ladder rack, a CB whip; its bed heaped with chips
  const tx = CHIPPER.x + 200, mulch = ch.state === 'mulch';
  stillAt(c, `lr-truck-${mulch ? 1 : 0}`, tx, g, -4, -120, 222, 122, gg => {
    const Gt = ['#14200F', '#1E3018', '#2A4222', '#38562E', '#4A6E3C', '#628A50', '#82A86C'], S = hr('steel', STEEL);
    // (the bed: stake sides, chips heaped over them (red where he went))
    box(gg, -1, -71, 152, 52, INK); box(gg, 0, -70, 150, 50, Gt[2]); box(gg, 0, -70, 150, 3, Gt[4]); box(gg, 0, -24, 150, 4, Gt[1]);
    for (let x = 6; x < 150; x += 24) { box(gg, x, -70, 4, 46, Gt[1]); box(gg, x, -70, 1, 46, Gt[3]); }
    gg.fillStyle = INK; gg.beginPath(); gg.moveTo(2, -69); gg.quadraticCurveTo(75, -100, 148, -69); gg.closePath(); gg.fill();
    gg.fillStyle = '#C8A070'; gg.beginPath(); gg.moveTo(4, -69); gg.quadraticCurveTo(75, -97, 146, -69); gg.closePath(); gg.fill();
    for (let n = 0; n < 40; n++) { const u = hash(n * 2.1), px = 6 + u * 138, py = -70 - Math.sin(u * Math.PI) * 22 * hash(n * 3.3); box(gg, px, py, 3, 2, hash(n) > 0.5 ? '#E8C890' : '#9A7448'); }
    if (mulch) { gg.fillStyle = '#7F1D1D'; gg.beginPath(); gg.moveTo(30, -72); gg.quadraticCurveTo(80, -94, 130, -70); gg.closePath(); gg.fill(); for (let n = 0; n < 12; n++) box(gg, 30 + hash(n) * 100, -84 + hash(n * 2) * 14, 3, 2, n % 2 ? '#B91C1C' : '#F2A8B0'); }
    // (the cab: rounded, its window by the hour, a dent, a ladder rack over it, the CB whip)
    gg.fillStyle = INK; gg.beginPath(); gg.roundRect(149, -91, 62, 72, [10, 6, 0, 0]); gg.fill();
    gg.fillStyle = Gt[3]; gg.beginPath(); gg.roundRect(150, -90, 60, 70, [9, 5, 0, 0]); gg.fill();
    box(gg, 150, -90, 60, 3, Gt[5]); box(gg, 150, -46, 60, 2, Gt[1]);
    box(gg, 168, -85, 36, 26, INK); box(gg, 169, -84, 34, 24, '#5A7A98'); box(gg, 169, -84, 12, 24, '#7A9AB4'); box(gg, 171, -82, 3, 12, '#B8D0E0');
    box(gg, 156, -54, 8, 3, INK); gg.fillStyle = Gt[1]; gg.beginPath(); gg.ellipse(186, -40, 9, 4, 0, 0, Math.PI * 2); gg.fill();
    box(gg, 210, -40, 6, 14, INK); box(gg, 210, -40, 5, 6, '#F2E6A8');
    box(gg, 150, -100, 62, 3, S[3]); for (const lx of [154, 204]) box(gg, lx, -100, 3, 12, S[2]);
    box(gg, 200, -120, 1, 30, S[4]);
    // (mud up its sides)
    for (let n = 0; n < 50; n++) { const px = hash(n * 1.3) * 210, py = -34 + hash(n * 2.9) * 14; box(gg, px, py, 2 + hash(n) * 4, 2, hash(n * 5) > 0.5 ? '#5A4430' : '#3A2C1E'); }
    // (the wheels)
    for (const wx of [30, 120, 180]) {
      gg.fillStyle = INK; gg.beginPath(); gg.arc(wx, -14, 16, 0, Math.PI * 2); gg.fill();
      gg.fillStyle = '#26262C'; gg.beginPath(); gg.arc(wx, -14, 14, 0, Math.PI * 2); gg.fill();
      gg.fillStyle = S[3]; gg.beginPath(); gg.arc(wx, -14, 7, 0, Math.PI * 2); gg.fill(); box(gg, wx - 3, -18, 3, 3, S[5]);
      for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; box(gg, wx + Math.cos(a) * 12 - 1, -14 + Math.sin(a) * 12 - 1, 2, 2, '#3F3F46'); }
    }
  });
  // ---- the conveyor up out of the water: a steel frame on legs, rollers, its belt moving, cleats
  const a = END - 300, wa = waterY(a), wb = waterY(END), S = hr('steel', STEEL);
  for (const u of [0.1, 0.4, 0.7, 0.95]) {
    const cx = X(a) + (X(END) - X(a)) * u, cy = wa + (wb - wa) * u;
    box(c, cx - 4, cy + 8, 8, g - cy - 8 + 120, INK); box(c, cx - 3, cy + 8, 6, g - cy - 8 + 120, S[3]); box(c, cx - 3, cy + 8, 2, g - cy - 8 + 120, S[5]);
    c.strokeStyle = S[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy + 30); c.lineTo(cx + 40, cy + 90); c.stroke();
  }
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = 18; c.beginPath(); c.moveTo(X(a), wa + 4); c.lineTo(X(END), wb + 4); c.stroke();
  c.strokeStyle = S[2]; c.lineWidth = 14; c.stroke();
  c.strokeStyle = '#26262C'; c.lineWidth = 6; c.beginPath(); c.moveTo(X(a), wa); c.lineTo(X(END), wb); c.stroke();
  c.strokeStyle = S[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(X(a), wa + 5); c.lineTo(X(END), wb + 5); c.stroke();
  for (let k = 0; k < 14; k++) { const u = ((k / 14) + f * 0.004) % 1, cx = X(a) + (X(END) - X(a)) * u, cy = wa + (wb - wa) * u; box(c, cx - 2, cy - 5, 4, 7, INK); box(c, cx - 1, cy - 4, 2, 5, S[5]); }
  for (let k = 0; k <= 6; k++) { const u = k / 6, cx = X(a) + (X(END) - X(a)) * u, cy = wa + (wb - wa) * u + 6; c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = S[4]; c.beginPath(); c.arc(cx, cy, 2.5, 0, Math.PI * 2); c.fill(); }
  // ---- the chipper: its body on its trailer (stepped orange, louvers, decals), the chute up and out over the truck
  // (choking on a big one: the whole machine bucking)
  const bx = CHIPPER.x + (chipperJammed(state) ? ((f >> 1) % 2 ? 2 : -2) : 0), O = hr('orange', ORANGE);
  stillAt(c, 'lr-chipper', bx, g, -36, -130, 176, 132, gg => {
    box(gg, -31, -121, 162, 102, INK);
    box(gg, -30, -120, 160, 100, O[4]); box(gg, -30, -120, 160, 3, O[6]); box(gg, -30, -117, 160, 6, O[5]); box(gg, 90, -120, 40, 100, O[3]); box(gg, 124, -120, 6, 100, O[2]); box(gg, -30, -26, 160, 6, O[2]);
    checker(gg, 86, -120, 4, 100, O[3], 0);
    for (let k = 0; k < 6; k++) { box(gg, 96, -106 + k * 8, 26, 3, INK); box(gg, 96, -105 + k * 8, 26, 1, O[1]); }
    box(gg, -30, -82, 120, 2, O[2]); box(gg, -30, -80, 120, 1, O[5]);
    for (let x = -24; x < 128; x += 20) { box(gg, x, -118, 2, 2, INK); box(gg, x, -24, 2, 2, INK); }
    box(gg, 4, -77, 92, 14, INK); box(gg, 5, -76, 90, 12, '#1C1917');
    signText(gg, 'CHIP-O-MATIC 9000', 50, -66, painted(1, '#F2C21A', '#1C1917'));
    box(gg, 4, -58, 28, 18, INK); box(gg, 5, -57, 26, 16, '#F2C21A'); gg.fillStyle = INK; gg.beginPath(); gg.moveTo(18, -55); gg.lineTo(28, -43); gg.lineTo(8, -43); gg.closePath(); gg.fill(); box(gg, 17, -52, 2, 6, '#F2C21A');
    // (the trailer's frame and tongue, its wheels)
    box(gg, -36, -22, 172, 6, INK); box(gg, -35, -21, 170, 4, '#3F3F46');
    for (const wx of [10, 100]) { gg.fillStyle = INK; gg.beginPath(); gg.arc(wx, -14, 16, 0, Math.PI * 2); gg.fill(); gg.fillStyle = '#26262C'; gg.beginPath(); gg.arc(wx, -14, 14, 0, Math.PI * 2); gg.fill(); gg.fillStyle = '#6A6A72'; gg.beginPath(); gg.arc(wx, -14, 6, 0, Math.PI * 2); gg.fill(); box(gg, wx - 2, -17, 2, 2, '#C4CCD6'); }
  });
  // (the chute: up and over to the right, its mouth over the truck's bed: banded)
  c.lineCap = 'butt';
  for (const [col, lw] of [[INK, 26], [O[3], 22], [O[4], 14], [O[6], 3]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(bx + 100, g - 110 - (lw < 10 ? 6 : 0)); c.quadraticCurveTo(bx + 110, CHUTE.y - 30 - (lw < 10 ? 6 : 0), CHUTE.x, CHUTE.y - (lw < 10 ? 6 : 0)); c.stroke(); }
  box(c, CHUTE.x - 4, CHUTE.y - 14, 10, 28, INK); box(c, CHUTE.x - 3, CHUTE.y - 13, 8, 26, O[2]);
  drawChuteBlood(c, state);
  // (running: it shakes, exhaust puffs)
  const running = ch.state !== 'idle';
  box(c, bx + 116, g - 142, 6, 22, INK); box(c, bx + 117, g - 142, 4, 22, '#3F3F46');
  if (running) for (let i = 0; i < 3; i++) { const t = ((f * 0.03 + i / 3) % 1); puff(c, bx + 119 + t * 10, g - 146 - t * 40, 4 + t * 8, ['#3F3F46', '#5A5A62', '#7A7A82'], 0.6 * (1 - t)); }
  // ---- the lamp on its top: off, amber (ready), flashing green (now): the jump's timing
  const lamp = ch.state === 'open' ? (f % 10 < 5 ? '#22C55E' : '#14532D') : ch.state === 'ready' ? '#F59E0B' : '#3F3F46';
  box(c, bx + 38, g - 140, 24, 22, INK); box(c, bx + 40, g - 138, 20, 18, '#26262C'); box(c, bx + 42, g - 136, 16, 14, lamp);
  if (lamp !== '#3F3F46' && lamp !== '#14532D') { box(c, bx + 44, g - 134, 5, 4, '#FFFFFF'); steppedGlow(c, bx + 50, g - 129, 36, lamp, 0.04, 0.35, 4); }
  // (where the chipper's gore came down: pools on the clearing and the truck's bed)
  drawGorePools(c, state);
  void mix;
};

/** In front of him: the hopper's front (it swallows him), the chips flying, JUMP!, the crew's words. */
export const drawChipperFront = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(10600), X(11800))) return;
  const r = rideOf(state), ch = r.chip, f = state.frame, g = CHIPPER.ground, O = hr('orange', ORANGE), S = hr('steel', STEEL);
  // ---- the hopper: a big funnel mouth at the top of the conveyor, its throat going down into the body
  const hx = CHIPPER.x, hy = CHIPPER.hopperY;
  stillAt(c, 'lr-hopper', hx, hy, -54, -28, 92, 102, gg => {
    gg.fillStyle = INK; gg.beginPath(); gg.moveTo(-50, -20); gg.lineTo(34, -20); gg.lineTo(22, 70); gg.lineTo(-30, 70); gg.closePath(); gg.fill();
    gg.save(); gg.beginPath(); gg.moveTo(-47, -17); gg.lineTo(31, -17); gg.lineTo(20, 67); gg.lineTo(-28, 67); gg.closePath(); gg.clip();
    box(gg, -50, -20, 90, 90, O[4]); box(gg, -50, -20, 30, 90, O[5]); box(gg, 8, -20, 30, 90, O[3]); box(gg, 18, -20, 20, 90, O[2]);
    for (const y of [30, 50]) { box(gg, -50, y, 90, 2, O[2]); box(gg, -50, y + 2, 90, 1, O[6]); }
    gg.restore();
    box(gg, -47, -17, 78, 5, O[6]); box(gg, -47, -12, 78, 1, O[3]);
    box(gg, -31, 3, 52, 16, INK); box(gg, -30, 4, 50, 14, '#1C1917');
    signText(gg, 'DANGER', -5, 15, painted(1, '#F2C21A', '#1C1917'));
    box(gg, -47, -24, 78, 6, mix(O[2], '#000000', 0.3)); box(gg, -47, -24, 78, 1, O[3]);
  });
  drawHopperBlood(c, state);
  // (the throat's knives, glimpsed, turning (red, once somebody's been through))
  const red = bloodyKnives(state);
  if (ch.state !== 'idle') for (let i = 0; i < 5; i++) { const kx = hx - 36 + ((f * 4 + i * 16) % 70); box(c, kx - 1, hy - 23, 6, 6, INK); box(c, kx, hy - 22, 4, 4, red && i % 2 ? '#B91C1C' : S[5]); box(c, kx, hy - 22, 2, 1, red ? '#F87171' : S[6]); }
  // ---- the chips and the bits out of the chute
  for (const q of ch.chips) { box(c, q.x - q.s / 2 - 0.5, q.y - q.s / 2 - 0.5, q.s + 1, q.s * 0.7 + 1, INK); box(c, q.x - q.s / 2, q.y - q.s / 2, q.s, q.s * 0.7, q.c); if (q.s > 2.5) box(c, q.x - q.s / 2, q.y - q.s / 2, Math.max(1, q.s * 0.4), 1, mix(q.c, '#FFFFFF', 0.35)); }
  // ---- the gore: the choke's smoke, the bits, the red mist, the screen's splats
  drawGoreFront(c, state);
  // ---- READY / JUMP! over the clearing, big, and an arrow from the log over to the landing (the timing cue: kept)
  if (ch.state === 'ready' || ch.state === 'open') {
    const lx = X(LAND_X), ly = g - 210;
    if (ch.state === 'open') {
      if (f % 12 < 8) {
        c.font = 'bold 22px "Press Start 2P"'; c.textAlign = 'center';
        c.fillStyle = '#000'; c.fillText('JUMP!', lx + 3, ly + 3); c.fillStyle = '#4ADE80'; c.fillText('JUMP!', lx, ly); c.textAlign = 'left';
      }
      c.strokeStyle = '#4ADE80'; c.lineWidth = 4; c.setLineDash([8, 8]); c.lineDashOffset = -f;
      c.beginPath(); c.moveTo(X(r.log.rx), waterY(r.log.rx) - 80); c.quadraticCurveTo((X(r.log.rx) + lx) / 2, ly - 30, lx, g - 20); c.stroke(); c.setLineDash([]);
    } else {
      c.font = 'bold 14px "Press Start 2P"'; c.textAlign = 'center';
      c.fillStyle = '#000'; c.fillText('READY...', lx + 2, ly + 2); c.fillStyle = '#FBBF24'; c.fillText('READY...', lx, ly); c.textAlign = 'left';
    }
  }
  if (ch.crew) { const by = ch.crewBy; saidOver(c, ch.crew.text, by ? by.pos.x + by.width / 2 : X(11460), (by ? by.pos.y : g - 72) - 30, '#E0F2FE', 240); }
};
