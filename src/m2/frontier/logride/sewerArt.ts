// Under the park, drawn (peak SNES): the SEWER (gross, dark, lit by what light gets in) and the culvert out of the bluff.
//
// The tunnel: a brick vault (the arch's ring in the dark over it, sooty courses banded darker toward the crown, moss and
// slime weeping below the high-water line, wet bricks under it, a cable conduit on its clamps, the old water main on its
// brackets with its collars, bolts and rust runs), painted in cached chunks; the sludge in its channel (banded, a sheen
// riding it downstream, scum and the park's flotsam drifting by: a rubber duck from the gift shop, a souvenir cup, a
// bottle), the rats' walkways (old concrete, dimmed: not his), storm grates in the crown with the day coming down through
// them in soft bands, caged bulbs, and where he came down, the vault broken through. In front: the sludge over the log's
// foot and the channel's near edge.
//
// The culvert: the bluff the park sits on (real rock and earth in its face, roots, a shrub hanging on), the storm
// drain's concrete headwall (form-board lines, rust bleeding from its rebar, a bent trash rack), the park's chain-link
// fence busted out across the mouth, PARK PROPERTY ENDS on its posts on the headwall (the park's last sign), the
// spillway's apron with the muck sheeting down it, and in the foam at its foot the first of the real world's junk: a
// shopping cart and a tire.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { steppedGlow } from '../../intro/art/kit';
import { onScreen, parkSign } from '../kit';
import { GY } from '../geometry';
import { type Ctx, box, checker, mix, hash, stillAt, INK, asIs, hr, bands, brickwork, BRICK, CONCRETE, SLUDGE, RUST, MOSS, STEEL, GRANITE, DIRT, GRASS, NEEDLE, BARK, clump } from './paint';
import { X, Y, waterY, WALKWAYS, CHASM } from './layout';
import { rideOf } from './state';
import { SLAM_AT } from './parkArt';

const SW_A = 5640, SW_B = 8460, CH = 160;

/** A chunk of the tunnel's back wall (local: the waterline at y 0, the crown at -240). */
const paintTunnel = (g: Ctx, v: number, rx: number) => {
  const B = asIs(BRICK), M = asIs(CONCRETE).map(c => mix(c, '#1A140C', 0.45)), Sl = asIs(SLUDGE), Ms = asIs(MOSS), Ru = asIs(RUST), S = asIs(STEEL);
  // (the courses, banded darker up toward the crown and down at the wet)
  brickwork(g, 0, -240, CH, 300, B, M, v * 97 + 3, 8, 20);
  const shade = ['rgba(0,0,0,0.62)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.38)', 'rgba(0,0,0,0.26)', 'rgba(0,0,0,0.14)'];
  shade.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, -240 + i * 10, CH, 10); });
  // (the arch's ring: a course of headers on end along the crown, its edge)
  for (let x = 0; x < CH; x += 8) { box(g, x, -240, 7, 14, mix(B[2], INK, 0.5)); box(g, x, -240, 7, 1, mix(B[3], INK, 0.3)); }
  box(g, 0, -226, CH, 2, INK);
  // (a cable conduit on clamps)
  box(g, 0, -199, CH, 5, INK); box(g, 0, -198, CH, 3, S[2]); box(g, 0, -198, CH, 1, S[4]);
  for (let x = 20; x < CH; x += 60) { box(g, x, -201, 4, 9, S[1]); box(g, x + 1, -201, 1, 9, S[4]); }
  // (the water main: a fat pipe, lit along its top, dark under, its collars and their bolts, rust weeping from them)
  const py = -160;
  box(g, 0, py - 1, CH, 20, INK); box(g, 0, py, CH, 18, '#4C4C40'); box(g, 0, py + 1, CH, 3, '#7A7A64'); box(g, 0, py + 4, CH, 3, '#5E5E4E'); box(g, 0, py + 12, CH, 6, '#34342A'); checker(g, 0, py + 10, CH, 2, '#4C4C40', 0);
  for (const cx of [0, CH / 2]) {
    box(g, cx - 4, py - 4, 10, 26, INK); box(g, cx - 3, py - 3, 8, 24, '#626250'); box(g, cx - 3, py - 3, 2, 24, '#8A8A70');
    for (let k = 0; k < 3; k++) box(g, cx - 1, py + 1 + k * 7, 3, 2, '#2A2A22');
    box(g, cx + 2, py + 22, 2, 14 + hash(rx + cx) * 20, Ru[4]); box(g, cx + 2, py + 22, 1, 10, Ru[5]);
    if ((rx / CH + cx) % 3 === 0) { box(g, cx + 14, py - 40, 4, 40, Ru[2]); box(g, cx + 8, py + 18, 16, 3, Ru[2]); }
  }
  // (the high-water mark: slime and moss weeping down from it; the wet bricks under, darker)
  g.fillStyle = 'rgba(10, 14, 4, 0.45)'; g.fillRect(0, -40, CH, 40);
  box(g, 0, -42, CH, 4, Ms[3]); box(g, 0, -42, CH, 1, Ms[5]); checker(g, 0, -38, CH, 2, Ms[2], v % 2);
  for (let x = 2; x < CH; x += 6) { const len = 4 + hash(rx + x) * 26; box(g, x, -38, 2, len, hash(x + rx) > 0.5 ? Ms[2] : Sl[4]); box(g, x, -38 + len, 2, 2, Sl[5]); }
  // (a stain run down from a weep hole)
  const wx = 30 + hash(rx) * 100; box(g, wx - 3, -120, 6, 4, INK); g.fillStyle = 'rgba(70, 60, 20, 0.35)'; g.fillRect(wx - 3, -116, 6, 76);
  // (the sludge in its channel: banded deeper, scum on it)
  bands(g, 0, -4, CH, 64, [Sl[6], Sl[5], Sl[4], Sl[4], Sl[3], Sl[3], Sl[2], Sl[1]]);
  for (let x = 0; x < CH; x += 7) if (hash(rx + x * 1.3) > 0.6) box(g, x, -3 + hash(x + rx) * 4, 5, 1, mix(Sl[5], '#6A5A28', 0.5));
};

/** The sewer's water level at x (its channel starts at the chasm's foot). */
const swY = (rx: number) => waterY(Math.max(rx, 5840));

export const drawSewerBack = (c: Ctx, state: GameState) => {
  const f = state.frame, r = rideOf(state), Sl = asIs(SLUDGE), Cn = asIs(CONCRETE).map(col => mix(col, '#14100A', 0.5));
  const cl = state.camera.x - 40, cr = state.camera.x + CANVAS_WIDTH + 40;
  // ---- the tunnel, in chunks (each at its own waterline: the sewer falls 20 px along its length)
  for (let rx = Math.max(SW_A, Math.floor((cl - X(0)) / CH) * CH); rx < Math.min(SW_B, cr - X(0)); rx += CH) {
    const v = (rx / CH) % 4, wy = swY(rx + CH / 2);
    stillAt(c, `lr-tunnel-${v}-${rx}`, X(rx), wy, 0, -242, CH + 1, 304, g => paintTunnel(g, v, rx));
  }
  // ---- the sludge's sheen riding downstream
  for (let rx = Math.max(SW_A, Math.floor((cl - X(0)) / 40) * 40); rx < Math.min(SW_B, cr - X(0)); rx += 40) {
    const wy = swY(rx), x = X(rx);
    if ((rx + Math.floor(f * 1.2)) % 80 < 12) { box(c, x + 6, wy - 3, 14, 1, Sl[7]); box(c, x + 10, wy - 2, 8, 1, Sl[6]); }
    if ((rx * 7 + Math.floor(f * 0.9)) % 120 < 8) box(c, x + 22, wy + 2, 9, 2, mix(Sl[5], '#6A5A28', 0.5));
  }
  // (the flotsam drifting by, downstream: a rubber duck from the gift shop, a souvenir cup, a bottle)
  for (let i = 0; i < 6; i++) {
    const span = SW_B - 5900, rx = 5900 + ((hash(i * 7.3) * span + f * (0.35 + hash(i) * 0.2)) % span), x = X(rx), wy = swY(rx) - 1 + Math.sin(f * 0.07 + i) * 1;
    if (x < cl || x > cr) continue;
    const kind = i % 3;
    if (kind === 0) { box(c, x - 5, wy - 6, 11, 7, INK); box(c, x - 4, wy - 5, 9, 5, '#F2C82A'); box(c, x + 1, wy - 9, 6, 5, INK); box(c, x + 2, wy - 8, 4, 3, '#F2C82A'); box(c, x + 6, wy - 7, 3, 2, '#E8641E'); box(c, x + 3, wy - 8, 1, 1, INK); box(c, x - 3, wy - 5, 4, 1, '#FFF0A0'); }
    else if (kind === 1) { box(c, x - 4, wy - 7, 8, 8, INK); box(c, x - 3, wy - 6, 6, 6, '#E8E4D8'); box(c, x - 3, wy - 4, 6, 2, '#B91C1C'); box(c, x, wy - 11, 1, 5, '#F4F4F0'); }
    else { box(c, x - 7, wy - 4, 14, 5, INK); box(c, x - 6, wy - 3, 12, 3, '#3A6A3A'); box(c, x - 6, wy - 3, 12, 1, '#7AB07A'); box(c, x + 6, wy - 2, 3, 1, '#2A4A2A'); }
  }
  // ---- the rats' walkways along the back wall: old concrete, dimmed (they're not his)
  for (const [a, b, h] of WALKWAYS) if (onScreen(state, X(a), X(b))) {
    const y = Y(h), w = X(b) - X(a);
    box(c, X(a), y - 1, w, 14, INK); box(c, X(a), y, w, 12, Cn[3]); box(c, X(a), y, w, 2, Cn[4]); box(c, X(a), y + 10, w, 2, Cn[1]);
    for (let x = X(a) + 30; x < X(b); x += 60) { box(c, x, y + 2, 1, 8, Cn[1]); }
    for (let x = X(a) + 10; x < X(b); x += 50) { box(c, x, y + 12, 6, 30, INK); box(c, x + 1, y + 12, 4, 29, Cn[2]); }
  }
  // ---- the storm grates up in the crown, the day coming down through them in soft bands; drips off the bars
  for (let rx = 6000; rx < 8400; rx += 520) if (onScreen(state, X(rx) - 70, X(rx) + 70)) {
    const top = swY(rx) - 240, x = X(rx), wy = swY(rx);
    for (let k = 0; k < 3; k++) { c.globalAlpha = 0.06 + k * 0.03; c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(x - 26 + k * 7, top); c.lineTo(x + 26 - k * 7, top); c.lineTo(x + 60 - k * 16, wy); c.lineTo(x - 60 + k * 16, wy); c.closePath(); c.fill(); }
    c.globalAlpha = 1;
    box(c, x - 32, top - 8, 64, 12, INK); box(c, x - 30, top - 6, 60, 8, '#F8F2C8');
    for (let k = 0; k < 6; k++) { box(c, x - 30 + k * 11, top - 6, 4, 8, '#26262C'); box(c, x - 30 + k * 11, top - 6, 1, 8, '#52525B'); }
    box(c, x - 32, top + 2, 64, 3, '#3F3F46');
    const d = (f + rx) % 60; if (d < 50) box(c, x - 12 + (rx % 3) * 10, top + 6 + d * 4.4, 2, 4, '#C8C890');
  }
  // ---- the vault broken through where he came down: the hole up into the chasm, the day through it, rubble
  if (r.cutT >= SLAM_AT + 20 && onScreen(state, X(CHASM.a) - 40, X(CHASM.b) + 40)) {
    const top = waterY(5850) - 240, a = X(CHASM.a) + 10, b = X(CHASM.b) - 10, B = asIs(BRICK);
    c.fillStyle = '#060402'; c.beginPath(); c.moveTo(a, top - 6); for (let k = 0; k <= 6; k++) c.lineTo(a + ((b - a) * k) / 6, top + 14 + hash(k + 9) * 18); c.lineTo(b, top - 6); c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) { c.globalAlpha = 0.07 + k * 0.04; c.fillStyle = '#FEF9C3'; c.beginPath(); c.moveTo(a + 10 + k * 8, top); c.lineTo(b - 10 - k * 8, top); c.lineTo(b + 30 - k * 14, waterY(5850)); c.lineTo(a - 30 + k * 14, waterY(5850)); c.closePath(); c.fill(); }
    c.globalAlpha = 1;
    for (let k = 0; k < 7; k++) { const rx = a - 10 + k * 26, ry = top + 22 + hash(k) * 12; box(c, rx - 1, ry - 1, 14, 10, INK); box(c, rx, ry, 12, 8, k % 2 ? B[3] : '#6A5A44'); box(c, rx, ry, 12, 2, k % 2 ? B[5] : '#8A7A60'); }
  }
  // ---- the caged bulbs now and then
  for (let rx = 5980; rx < 8400; rx += 400) if (onScreen(state, X(rx) - 20, X(rx) + 20)) {
    const x = X(rx), y = swY(rx) - 186;
    steppedGlow(c, x, y, 30, '#FDE68A', 0.02, 0.2, 4);
    box(c, x - 6, y - 16, 12, 6, INK); box(c, x - 5, y - 15, 10, 4, '#3F3F46');
    c.fillStyle = INK; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(x, y, 4.5, 0, Math.PI * 2); c.fill(); box(c, x - 2, y - 3, 2, 2, '#FFFBE0');
    for (let k = -1; k <= 1; k++) box(c, x + k * 4, y - 6, 1, 12, '#26262C'); box(c, x - 6, y, 12, 1, '#26262C');
  }
};

export const drawSewerFront = (c: Ctx, state: GameState) => {
  const f = state.frame, Sl = asIs(SLUDGE), B = asIs(BRICK);
  const cl = state.camera.x - 40, cr = state.camera.x + CANVAS_WIDTH + 40;
  for (let rx = Math.max(5840, Math.floor((cl - X(0)) / 40) * 40); rx < Math.min(8440, cr - X(0)); rx += 40) {
    const wy = swY(rx), x = X(rx);
    // (the sludge over the log's foot: see-through, its lit line lapping)
    c.globalAlpha = 0.72; box(c, x, wy - 2, 41, 30, Sl[3]); c.globalAlpha = 1;
    for (let k = 0; k < 41; k += 8) box(c, x + k, wy - 2 + Math.round(Math.sin(f * 0.08 + (rx + k) * 0.07)), 8, 1, Sl[6]);
    // (the channel's near edge: dark brick, no lip (he's never off the log down here))
    box(c, x, wy + 26, 41, 1, INK);
    for (let r = 0; r < 5; r++) for (let k = -(r % 2) * 10; k < 41; k += 20) { box(c, x + k + 1, wy + 27 + r * 8, 18, 7, mix(B[1], INK, 0.3)); box(c, x + k + 1, wy + 27 + r * 8, 18, 1, B[2]); }
    box(c, x, wy + 67, 41, 140, mix(B[0], INK, 0.5));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The culvert

export const drawCulvert = (c: Ctx, state: GameState) => {
  const f = state.frame, cy = waterY(8440) - 100, G = hr('granite', GRANITE), D = hr('dirt', DIRT), Gr = hr('grass', GRASS), Cn = hr('concrete', CONCRETE), Ru = hr('rust', RUST), Sl = asIs(SLUDGE);
  // ---- the bluff's face: earth over real rock, broken in blocks, roots, a shrub hanging on
  stillAt(c, 'lr-bluff', X(8300), GY, 0, -10, 200, 1112, g => {
    box(g, 0, 0, 170, 1100, D[2]);
    for (let y = 0; y < 1100; y += 30) {
      const right = 140 + Math.sin(y * 0.02) * 16 + hash(y) * 14;
      for (let x = 0; x < right; x += 24) { const k = hash(x * 3 + y); box(g, x + 1, y + 1, 22, 28, k < 0.3 ? G[2] : k > 0.8 ? G[4] : G[3]); box(g, x + 1, y + 1, 22, 2, G[5]); box(g, x + 1, y + 27, 22, 2, G[1]); }
      box(g, right, y, 3, 30, INK);
    }
    bands(g, 0, 0, 170, 120, [D[3], D[3], D[2], D[2], D[1]]);
    box(g, 0, -2, 170, 4, Gr[4]); box(g, 0, -4, 170, 2, Gr[5]);
    for (let k = 0; k < 8; k++) { let x = 20 + k * 18, y = 6; g.strokeStyle = D[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 5; s++) { x += (hash(k + s) - 0.4) * 10; y += 14; g.lineTo(x, y); } g.stroke(); }
    clump(g, 150, 4, 22, 14, 41, hr('needle', NEEDLE), 0);
  });
  // ---- the storm drain's headwall: poured concrete (form-board lines), rust bleeding from its rebar, a bent trash rack
  stillAt(c, 'lr-headwall', X(8400), cy, -4, -136, 72, 272, g => {
    box(g, -2, -132, 64, 264, INK);
    for (let y = -130; y < 130; y += 20) { box(g, 0, y, 60, 20, y % 40 ? Cn[4] : Cn[3]); box(g, 0, y, 60, 1, Cn[5]); box(g, 0, y + 19, 60, 1, Cn[2]); }
    box(g, 0, -130, 60, 6, Cn[6]); box(g, 52, -130, 8, 260, Cn[2]); checker(g, 48, -130, 4, 260, Cn[3], 0);
    for (const [rx, ry] of [[12, -90], [44, -40], [20, 70]] as const) { box(g, rx, ry, 3, 3, Ru[2]); g.fillStyle = 'rgba(146, 58, 22, 0.45)'; g.fillRect(rx, ry + 3, 3, 30 + rx); }
    g.fillStyle = 'rgba(240, 236, 220, 0.25)'; g.fillRect(4, -60, 40, 6);
    // (the mouth: the dark of the pipe going back, a brick ring round it)
    g.fillStyle = INK; g.beginPath(); g.ellipse(40, 20, 30, 104, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = mix(BRICK[2], INK, 0.3); g.beginPath(); g.ellipse(40, 20, 27, 100, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0A0806'; g.beginPath(); g.ellipse(40, 20, 21, 92, 0, 0, Math.PI * 2); g.fill();
    for (let a = 0; a < Math.PI * 2; a += 0.35) box(g, 40 + Math.cos(a) * 24 - 1, 20 + Math.sin(a) * 96 - 1, 3, 3, mix(BRICK[4], INK, 0.3));
  });
  // (the trash rack: bars bent out of the mouth by whatever came through)
  for (let k = 0; k < 5; k++) { const bx = X(8426) + k * 7, a = 0.15 + k * 0.12; c.save(); c.translate(bx, cy - 70); c.rotate(-a); box(c, -2, 0, 4, 130 - k * 8, INK); box(c, -1, 0, 2, 130 - k * 8, Ru[4]); box(c, -1, 0, 1, 130 - k * 8, Ru[6]); c.restore(); }
  // ---- the park's fence across the mouth, busted out: posts on the headwall, the mesh torn and peeled back
  const S = hr('steel', STEEL), ft = cy - 130;
  for (const px of [X(8404), X(8456)]) { box(c, px - 2, ft - 60, 5, 60, INK); box(c, px - 1, ft - 60, 3, 60, S[4]); box(c, px - 1, ft - 60, 1, 60, S[6]); }
  box(c, X(8404), ft - 58, 52, 3, S[4]);
  c.strokeStyle = S[5]; c.globalAlpha = 0.7; c.lineWidth = 1;
  for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(X(8462), cy - 70 + k * 20); c.quadraticCurveTo(X(8480) + k * 2, cy - 60 + k * 22, X(8492) + k * 3, cy - 40 + k * 26); c.stroke(); }
  for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(X(8404), ft - 54 + k * 14); c.lineTo(X(8456), ft - 40 + k * 14); c.moveTo(X(8456), ft - 54 + k * 14); c.lineTo(X(8404), ft - 40 + k * 14); c.stroke(); }
  c.globalAlpha = 1;
  // (PARK PROPERTY ENDS: the park's last sign, on its posts on the headwall)
  parkSign(c, X(8545), ft, ['PARK PROPERTY ENDS', 'NOT RESPONSIBLE PAST HERE'], { warn: true, seed: 8545, tall: 66 });
  // ---- the spillway: a concrete apron down to the river, the muck sheeting down it, foam at its foot
  const a0 = 8440, a1 = 8640, ya = waterY(a0), yb = waterY(a1);
  // (the rock under it, down out of sight)
  c.fillStyle = mix(G[1], INK, 0.3); c.beginPath(); c.moveTo(X(a0 - 10), ya + 80); c.lineTo(X(a1 + 10), yb + 80); c.lineTo(X(a1 + 10), yb + 320); c.lineTo(X(a0 - 10), yb + 320); c.closePath(); c.fill();
  for (let k = 0; k < 10; k++) { const u = k / 10, x = X(a0) + (X(a1) - X(a0)) * u, y = ya + (yb - ya) * u + 96 + (k % 3) * 30; box(c, x, y, 18, 12, G[2]); box(c, x, y, 18, 2, G[4]); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(X(a0), ya + 28); c.lineTo(X(a1), yb + 28); c.lineTo(X(a1), yb + 84); c.lineTo(X(a0), ya + 84); c.closePath(); c.fill();
  c.fillStyle = Cn[3]; c.beginPath(); c.moveTo(X(a0), ya + 30); c.lineTo(X(a1), yb + 30); c.lineTo(X(a1), yb + 80); c.lineTo(X(a0), ya + 80); c.closePath(); c.fill();
  c.strokeStyle = Cn[5]; c.lineWidth = 2; c.beginPath(); c.moveTo(X(a0), ya + 31); c.lineTo(X(a1), yb + 31); c.stroke();
  for (let k = 0; k < 9; k++) { const u = ((k / 9 + f * 0.012) % 1), x = X(a0) + (X(a1) - X(a0)) * u, y = ya + (yb - ya) * u; box(c, x, y - 2, 10, 2, mix(Sl[6], '#C8D8D0', u)); }
  // ---- in the foam at its foot, the real world's first junk: a shopping cart on its side, a tire
  // (over in the far side's shallows, not in his way)
  if (onScreen(state, X(8600), X(8760))) stillAt(c, 'lr-cart', X(8700), yb - 16, -40, -40, 110, 50, g => {
    const S2 = hr('steel', STEEL);
    // (the cart: wire basket on its side, a wheel up)
    box(g, -30, -28, 44, 26, INK); g.strokeStyle = S2[5]; g.lineWidth = 1;
    for (let x = -28; x < 14; x += 5) { g.beginPath(); g.moveTo(x, -26); g.lineTo(x, -4); g.stroke(); }
    for (let y = -26; y < -4; y += 5) { g.beginPath(); g.moveTo(-28, y); g.lineTo(12, y); g.stroke(); }
    box(g, -32, -30, 48, 3, S2[4]); box(g, 12, -36, 3, 10, S2[3]); box(g, 8, -38, 14, 3, '#B91C1C');
    g.fillStyle = INK; g.beginPath(); g.arc(-26, -32, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3F3F46'; g.beginPath(); g.arc(-26, -32, 2.5, 0, Math.PI * 2); g.fill();
    // (a tire, half sunk)
    g.fillStyle = INK; g.beginPath(); g.ellipse(46, -6, 20, 12, 0, Math.PI, 0); g.fill(); g.fillStyle = '#26262C'; g.beginPath(); g.ellipse(46, -6, 18, 10, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#0A0A0C'; g.beginPath(); g.ellipse(46, -4, 9, 5, 0, Math.PI, 0); g.fill(); for (let k = 0; k < 6; k++) box(g, 32 + k * 5, -14 + Math.abs(k - 2.5) * 1.6, 2, 2, '#3F3F46');
  });
  void BARK; void Gr;
};
