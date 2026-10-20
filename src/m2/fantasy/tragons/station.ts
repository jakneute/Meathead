// Truelling Tragons' load station and unload (world space, the scene's one eye). Both halls: a back wall at depth
// HALL_D (castle stone in courses, gothic windows of stained glass in the three dragons' colors, banners, lanterns on
// brackets, a crenellated cornice under a snowy slate roof, turrets at the ends), the platform's flagstones going back
// to it, the timber canopy's underside overhead out to its carved fascia at the play plane (lanterns hung off it), the
// end wall going back.
//
//   THE LOAD STATION   the three sculpted dragon heads over the hall breathing (fire, frost, sparks), the gilt name,
//                      the guests waiting behind the velvet ropes along the back (seeded, cheering), the dispatch
//                      booth (an operator in a headset at the console), the signs (TRUELLING TRAGONS, NO FIREARMS ON
//                      THE DRAGONS; RIDE CLOSED on a revisit, a rope across), the gate (iron, gilt spikes) shut till it
//                      goes. It slides off the left with the park once the trains are out.
//   THE UNLOAD         the decks one a lane, stepped down off the dragons' fronts (oak planks on stone piers, lit along
//                      their tops: somewhere to stand), the hall, UNLOAD / EXIT TO THY RIGHT, the yard's flagstones,
//                      the gate arch out to the castle's base (the castle through it), its sign.
//
// The still parts (the back walls, the crowd, the booth) are painted once per hour into stamps.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import {
  INK, mix, box, hash, still, ramp6, rampH, dimmed, warmGlass, lit, polyF, ballR, postR, slab, gilt, storySign, sideBack,
  STONE, TIMBER, SLATE, SNOW, GOLD, IRON, FLAG, LIP, type Ctx,
} from '../kit';
import { paintHead } from '../glen/sets';
import { GY, S0X, STATION_X, GATE_X, DECK_X0, DECK_X1, EXIT_X, END_S, TL, LANES, LANE_COL, wxOf, type Lane } from './layout';
import type { Tragons } from './state';
import { deckY } from './ride';
import { inView, scrollOf, at } from './scene';
import { guest, rails, lampPost, type GPose } from './scenery';
import type { Eye } from './track';

/** How far back the halls' back walls stand; how tall they are; the canopy's height. */
const HALL_D = 0.84, WALL_H = 600, ROOF_H = 640;
/** The heads' height on the wall (from its top), under the canopy where they're seen. */
const HEAD_Y = 140;
const D = (col: string) => rampH(ramp6(col), true);

// ---------------------------------------------------------------------------------------------------------------
// A hall's back wall (local: its foot's left end at 0, 0; w wide)

const paintWall = (g: Ctx, w: number, heads: boolean) => {
  const S = STONE.map(dimmed), Sl = SLATE.map(dimmed), Sn = SNOW.map(dimmed), G = warmGlass(), Gd = GOLD.map(dimmed), I = IRON.map(dimmed);
  // (the stone in courses, blocks picked out, a plinth)
  box(g, -1, -WALL_H, w + 2, WALL_H, INK); slab(g, 0, -WALL_H, w, WALL_H, S);
  for (let y = -WALL_H + 18, r = 0; y < 0; y += 20, r++) { box(g, 0, y, w, 1, S[1]); for (let x = (r % 2) * 26; x < w; x += 52) { box(g, x, y - 19, 1, 19, S[2]); if (hash(x * 0.3 + r) > 0.7) box(g, x + 4, y - 16, 20, 2, S[4]); } }
  box(g, 0, -26, w, 26, S[2]); box(g, 0, -26, w, 3, S[4]); box(g, 0, -3, w, 3, S[0]);
  // (the gothic windows: stained glass in the dragons' colors, lit from inside, their tracery and mullions)
  const cols = ['#C42828', '#3A8ED8', '#E2B21E'];
  for (let k = 0, x = 60; x < w - 90; k++, x += 150) {
    const ww = 64, top = -WALL_H + 150, bot = -150, C = D(cols[k % 3]);
    g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2, bot + 2); g.lineTo(x - 2, top + 30); g.quadraticCurveTo(x + ww / 2, top - 24, x + ww + 2, top + 30); g.lineTo(x + ww + 2, bot + 2); g.closePath(); g.fill();
    g.fillStyle = lit() ? mix(C[4], '#FFE8B0', 0.35) : C[2]; g.beginPath(); g.moveTo(x, bot); g.lineTo(x, top + 30); g.quadraticCurveTo(x + ww / 2, top - 20, x + ww, top + 30); g.lineTo(x + ww, bot); g.closePath(); g.fill();
    for (let y = top + 20; y < bot; y += 22) for (let q = 0; q < 4; q++) box(g, x + 2 + q * 16, y + (q % 2) * 6, 12, 8, lit() ? mix(C[5], '#FFF4D0', 0.3) : C[3]);
    box(g, x + ww / 2 - 1, top - 6, 3, bot - top + 6, I[1]); for (let y = top + 40; y < bot; y += 44) box(g, x, y, ww, 2, I[1]);
    g.strokeStyle = I[1]; g.lineWidth = 2; g.beginPath(); g.arc(x + ww / 2, top + 30, ww * 0.25, Math.PI, 0); g.stroke();
    box(g, x - 6, bot, ww + 12, 8, INK); box(g, x - 5, bot + 1, ww + 10, 6, S[4]);
    // (a banner between, its emblem; a lantern on a bracket)
    if (x + 150 < w - 90) {
      const bx = x + ww + 30, Bn = D(cols[(k + 1) % 3]);
      box(g, bx - 4, top - 4, 36, 4, Gd[3]); box(g, bx - 1, top, 30, 150, INK); box(g, bx, top, 28, 148, Bn[3]); box(g, bx, top, 5, 148, Bn[4]); box(g, bx + 23, top, 5, 148, Bn[2]);
      polyF(g, [[bx, top + 148], [bx + 14, top + 136], [bx + 28, top + 148], [bx + 28, top + 158], [bx + 14, top + 146], [bx, top + 158]], Bn[3]);
      ballR(g, bx + 14, top + 60, 8, Gd);
      box(g, bx + 8, bot + 30, 12, 3, I[2]); box(g, bx + 9, bot + 33, 10, 14, INK); box(g, bx + 10, bot + 34, 8, 12, lit() ? '#FFE0A0' : G[2]);
    }
  }
  // (the cornice, crenellations (dim), the slate roof with its snow, turrets at the ends)
  box(g, -6, -WALL_H - 10, w + 12, 12, INK); box(g, -5, -WALL_H - 9, w + 10, 10, S[4]); box(g, -5, -WALL_H - 1, w + 10, 2, S[1]);
  for (let x = 0; x < w; x += 34) { box(g, x - 1, -WALL_H - 34, 22, 25, INK); box(g, x, -WALL_H - 33, 20, 24, S[3]); box(g, x, -WALL_H - 33, 4, 24, S[4]); box(g, x, -WALL_H - 35, 20, 3, Sn[4]); }
  polyF(g, [[-10, -WALL_H - 34], [w * 0.5, -WALL_H - 150], [w + 10, -WALL_H - 34]], INK);
  polyF(g, [[-8, -WALL_H - 35], [w * 0.5, -WALL_H - 147], [w + 8, -WALL_H - 35]], Sl[3]);
  polyF(g, [[-8, -WALL_H - 35], [w * 0.5, -WALL_H - 147], [w * 0.5 - 40, -WALL_H - 35]], Sl[4]);
  for (let y = -WALL_H - 140; y < -WALL_H - 36; y += 10) { const u = (y + WALL_H + 147) / 112; box(g, w * 0.5 - (w * 0.5 + 8) * u, y, (w + 16) * u, 1, Sl[2]); }
  polyF(g, [[w * 0.2, -WALL_H - 86], [w * 0.5, -WALL_H - 150], [w * 0.8, -WALL_H - 86], [w * 0.5, -WALL_H - 120]], Sn[4]);
  for (const tx of [-30, w + 30]) {
    box(g, tx - 31, -WALL_H - 80, 62, WALL_H + 80, INK); slab(g, tx - 30, -WALL_H - 80, 60, WALL_H + 80, S);
    for (let y = -WALL_H - 60; y < 0; y += 20) box(g, tx - 30, y, 60, 1, S[1]);
    for (let k = 0; k < 5; k++) { box(g, tx - 6, -WALL_H - 50 + k * 110, 12, 26, INK); box(g, tx - 4, -WALL_H - 48 + k * 110, 8, 22, G[3]); }
    polyF(g, [[tx - 40, -WALL_H - 80], [tx, -WALL_H - 170], [tx + 40, -WALL_H - 80]], INK);
    polyF(g, [[tx - 38, -WALL_H - 81], [tx, -WALL_H - 168], [tx + 38, -WALL_H - 81]], D('#4A78D4')[3]); polyF(g, [[tx - 38, -WALL_H - 81], [tx, -WALL_H - 168], [tx - 8, -WALL_H - 81]], D('#4A78D4')[4]);
    box(g, tx - 40, -WALL_H - 84, 80, 4, Gd[3]); box(g, tx, -WALL_H - 186, 1, 18, I[3]); polyF(g, [[tx + 1, -WALL_H - 186], [tx + 16, -WALL_H - 182], [tx + 1, -WALL_H - 178]], D('#F49AC8')[3]);
  }
  if (!heads) return;
  // (the three dragon heads over the hall, the gilt name on its board over them)
  const mid = w * 0.5;
  for (const [ox, col, kind] of [[-230, '#C42828', 'fire'], [0, '#3A9AD8', 'ice'], [230, '#E0B020', 'bolt']] as const) { g.save(); g.translate(mid + ox - 20, -WALL_H + HEAD_Y); g.scale(1.2, 1.2); paintHead(g, col, kind); g.restore(); }
  const sy = -WALL_H + 40;
  box(g, mid - 236, sy - 26, 472, 52, INK); box(g, mid - 234, sy - 24, 468, 48, D('#3B0764')[3]); box(g, mid - 234, sy - 24, 468, 3, Gd[4]); box(g, mid - 234, sy + 21, 468, 3, Gd[2]);
  for (const x of [mid - 226, mid + 226]) ballR(g, x, sy, 3, Gd);
  signText(g, 'TRUELLING TRAGONS', mid, sy + 9, gilt(3));
};

/** The platform's flagstones going back from the play plane to the wall (x0..x1 at the ground). */
const flags = (c: Ctx, e: Eye, x0: number, x1: number) => {
  const F = FLAG.map(dimmed);
  const ds = [HALL_D, 0.88, 0.92, 0.96, 1, 1.08, 1.18, 1.3];
  for (let i = 0; i < ds.length - 1; i++) {
    const a = ds[i], b = ds[i + 1];
    polyF(c, [at(e, x0, GY, a), at(e, x1, GY, a), at(e, x1, GY, b), at(e, x0, GY, b)], F[i < 4 ? 4 - (i % 2) : 2 + (i % 2)]);
    const [ax, ay] = at(e, x0, GY, a), [bx] = at(e, x1, GY, a);
    box(c, ax, ay, bx - ax, 1, F[1]);
  }
  c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
  for (let x = Math.ceil(x0 / 48) * 48; x < x1; x += 48) { const [ax, ay] = at(e, x, GY, HALL_D), [bx, by] = at(e, x, GY, 1.3); c.moveTo(ax, ay); c.lineTo(bx, by); }
  c.stroke();
  // (the platform's edge at the play plane: a lit kerb)
  box(c, x0, GY - 1, x1 - x0, 2, LIP[2]); box(c, x0, GY + 1, x1 - x0, 2, F[1]);
};

/** The canopy overhead: its underside going back from its fascia (at the play plane) to the wall, beams across, the
 *  fascia carved, lanterns hung off it. */
const canopy = (c: Ctx, state: GameState, e: Eye, x0: number, x1: number) => {
  const Tb = TIMBER.map(dimmed), y = GY - ROOF_H, f = state.frame;
  if (e.y > y) {
    polyF(c, [at(e, x0, y, HALL_D), at(e, x1, y, HALL_D), at(e, x1, y, 1), at(e, x0, y, 1)], Tb[1]);
    c.strokeStyle = Tb[0]; c.lineWidth = 3; c.beginPath();
    for (let x = Math.ceil(x0 / 90) * 90; x < x1; x += 90) { const [ax, ay] = at(e, x, y, HALL_D), [bx, by] = at(e, x, y, 1); c.moveTo(ax, ay); c.lineTo(bx, by); }
    c.stroke();
  }
  box(c, x0 - 8, y - 22, x1 - x0 + 16, 26, INK); box(c, x0 - 7, y - 21, x1 - x0 + 14, 24, Tb[3]); box(c, x0 - 7, y - 21, x1 - x0 + 14, 3, Tb[4]); box(c, x0 - 7, y, x1 - x0 + 14, 2, Tb[1]);
  for (let x = x0; x < x1; x += 24) { box(c, x, y - 15, 12, 10, Tb[2]); box(c, x + 1, y - 14, 3, 8, Tb[4]); }
  box(c, x0 - 7, y - 25, x1 - x0 + 14, 4, SNOW.map(dimmed)[4]);
  for (let x = x0 + 60; x < x1 - 20; x += 160) {
    box(c, x - 1, y + 2, 2, 34, IRON.map(dimmed)[2]);
    box(c, x - 7, y + 36, 14, 18, INK); box(c, x - 6, y + 37, 12, 16, lit() ? '#FFE6A0' : mix('#E8D8A8', '#7A6A5A', 0.3)); box(c, x - 6, y + 37, 3, 16, lit() ? '#FFF8D8' : '#E8D8A8');
    if (lit()) { c.globalAlpha = 0.14 + 0.03 * Math.sin(f * 0.1 + x); c.fillStyle = '#FFE6A0'; c.beginPath(); c.arc(x, y + 46, 30, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The load station

export const drawStation = (c: Ctx, state: GameState, t: Tragons, e: Eye) => {
  const sh = scrollOf(t), x0 = STATION_X - 500 - sh, x1 = GATE_X + 60 - sh, f = state.frame;
  if (!inView(state, x0 - 300, x1 + 300)) return;
  const w = x1 - x0;
  // (the end wall going back on the left; the back wall; the floor)
  sideBack(c, e, x0, 1, GY - WALL_H, GY, 1, HALL_D, STONE.map(dimmed), 3);
  const [wx, wy] = at(e, x0, GY, HALL_D);
  c.save(); c.translate(wx, wy); c.scale(HALL_D, HALL_D);
  still(c, `tg-hall-load-${Math.round(w)}`, 0, 0, -80, -WALL_H - 200, w + 160, WALL_H + 204, g => paintWall(g, w, true));
  c.restore();
  // (the heads' breath, live: fire flickering, frost glittering, sparks)
  const mid = x0 + w * 0.5;
  for (const [ox, kind] of [[-230, 'fire'], [0, 'ice'], [230, 'bolt']] as const) {
    const [mx, my] = at(e, mid + ox - 20 + 70, GY - WALL_H + HEAD_Y + 10, HALL_D);
    const s = HALL_D;
    if (kind === 'fire') for (let k = 0; k < 5; k++) box(c, mx + k * 9 * s, my - 4 * s + (((f + k * 3) % 6) - 3) * s, (9 - k) * s, (7 - (k >> 1)) * s, ['#FFF6B0', '#FDE047', '#F97316', '#DC2626', '#7A1A1A'][(Math.floor(f / 4) + k) % 5]);
    else if (kind === 'ice') for (let k = 0; k < 6; k++) { box(c, mx + k * 8 * s, my + (6 + ((f * 0.5 + k * 7) % 16)) * s, 2, 2, '#E0F2FE'); if ((f + k * 9) % 30 < 4) { box(c, mx + k * 8 * s - 1, my - 2, 4, 1, '#FFFFFF'); box(c, mx + k * 8 * s, my - 3, 1, 3, '#FFFFFF'); } }
    else if (f % 40 < 8) { c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + 12 * s, my + 9 * s); c.lineTo(mx + 5 * s, my + 14 * s); c.lineTo(mx + 22 * s, my + 26 * s); c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.stroke(); }
  }
  flags(c, e, x0, x1 + 200);
  // (the guests waiting behind the ropes along the back of the platform; the dispatch booth by the gate)
  const qd = 0.9, [qx, qy] = at(e, x0 + 160, GY, qd), qw = Math.max(0, S0X - 220 - sh - (x0 + 160));
  if (qw > 60) {
    const up = (f >> 4) & 1;
    c.save(); c.translate(qx, qy); c.scale(qd, qd);
    still(c, `tg-hall-crowd-${Math.round(qw)}-${up}`, 0, 0, -40, -140, qw / qd + 80, 150, g => {
      const n = Math.floor(qw / qd / 30);
      for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) guest(g, 14 + k * 30 + r * 15, -r * 8, 500 + k * 5 + r * 3, (['stand', 'cheer', 'point', 'phone', 'stand'] as GPose[])[(k + r * 2) % 5], up === 1);
      rails(g, 0, qw / qd, 2);
    });
    c.restore();
  }
  const bd = 0.92, [bx, by] = at(e, GATE_X - 40 - sh, GY, bd);
  c.save(); c.translate(bx, by); c.scale(bd, bd);
  still(c, 'tg-booth', 0, 0, -60, -170, 120, 174, g => {
    const Tb = TIMBER.map(dimmed), G = warmGlass();
    box(g, -40, -120, 80, 120, INK); slab(g, -39, -119, 78, 119, Tb);
    box(g, -32, -104, 64, 40, INK); box(g, -30, -102, 60, 36, G[3]); box(g, -30, -102, 60, 6, G[4]); box(g, -1, -102, 2, 36, Tb[1]);
    guest(g, -10, -66, 77, 'stand'); box(g, -18, -98, 2, 10, INK); box(g, -18, -90, 6, 2, INK);
    box(g, -36, -60, 72, 14, INK); box(g, -35, -59, 70, 12, Tb[2]); box(g, -35, -59, 70, 2, Tb[4]);
    polyF(g, [[-50, -120], [0, -160], [50, -120]], INK); polyF(g, [[-48, -121], [0, -158], [48, -121]], SLATE.map(dimmed)[3]); polyF(g, [[-48, -121], [0, -158], [-6, -121]], SLATE.map(dimmed)[4]);
    polyF(g, [[-30, -132], [0, -158], [30, -132], [0, -146]], SNOW.map(dimmed)[4]);
  });
  // (the console's lights, live)
  for (let k = 0; k < 5; k++) box(c, bx + (-30 + k * 13) * bd, by - 56 * bd, 4 * bd, 3 * bd, (f / 8 + k) % 5 < 2 ? ['#4ADE80', '#F87171', '#FDE047', '#60A5FA', '#4ADE80'][k] : '#1A1028');
  canopy(c, state, e, x0, x1 + 140);
  storySign(c, STATION_X + 60 - sh, GY, ['TRUELLING TRAGONS', 'THREE DRAGONS. NO SEATS.'], { tall: 170 });
  if (t.phase === 'done') storySign(c, S0X + 140 - sh, GY, ['RIDE CLOSED', 'TRACK DAMAGE'], { warn: true, tall: 120, big: 1 });
  else storySign(c, S0X - 150 - sh, GY, ['NO FIREARMS', 'ON THE DRAGONS'], { warn: true, tall: 120, big: 1 });
  // The gate: iron bars with gilt spikes and a crossbar, shut till the ride goes; open, swung back against its post.
  const gx = GATE_X - sh, open = t.phase !== 'load', I = IRON, Gd = GOLD;
  postR(c, gx - 6, GY - 340, GY, 10, I); ballR(c, gx - 6, GY - 346, 6, Gd);
  if (!open) {
    box(c, gx, GY - 322, 20, 322, INK);
    for (let k = 0; k < 4; k++) { box(c, gx + 1 + k * 5, GY - 330, 3, 330, I[3]); box(c, gx + 1 + k * 5, GY - 330, 1, 330, I[5]); polyF(c, [[gx + 2.5 + k * 5, GY - 340], [gx + k * 5, GY - 330], [gx + 5 + k * 5, GY - 330]], Gd[4]); }
    for (const y of [GY - 300, GY - 160, GY - 20]) { box(c, gx - 1, y, 22, 6, INK); box(c, gx, y + 1, 20, 4, I[2]); box(c, gx, y + 1, 20, 1, I[4]); }
    ballR(c, gx + 10, GY - 230, 6, Gd);
  } else { box(c, gx - 2, GY - 322, 6, 322, INK); box(c, gx - 1, GY - 320, 4, 318, I[3]); }
  if (t.phase === 'done') {
    // (a velvet rope across the way onto the track: closed)
    g2rope(c, gx - 60, gx + 60, GY);
  }
};
const g2rope = (c: Ctx, x0: number, x1: number, y: number) => {
  for (const x of [x0, x1]) { postR(c, x, y - 34, y, 5, GOLD); ballR(c, x, y - 37, 4, GOLD); }
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y - 30); c.quadraticCurveTo((x0 + x1) / 2, y - 12, x1, y - 30); c.stroke(); c.strokeStyle = '#8A1A4A'; c.lineWidth = 3; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The unload

export const drawUnload = (c: Ctx, state: GameState, t: Tragons, e: Eye) => {
  const ux = wxOf(t.dist, END_S + TL) + 2, off = ux - DECK_X0;
  if (!inView(state, ux - 400, EXIT_X + off + 400)) return;
  const w = DECK_X1 - DECK_X0 + 240, hx0 = ux - 120, hx1 = hx0 + w;
  sideBack(c, e, hx0, 1, GY - WALL_H, GY, 1, HALL_D, STONE.map(dimmed), 3);
  const [wx, wy] = at(e, hx0, GY, HALL_D);
  c.save(); c.translate(wx, wy); c.scale(HALL_D, HALL_D);
  still(c, `tg-hall-unload-${Math.round(w)}`, 0, 0, -80, -WALL_H - 200, w + 160, WALL_H + 204, g => paintWall(g, w, false));
  c.restore();
  // (the yard's flagstones out to the gate)
  flags(c, e, hx0, EXIT_X + off + 260);
  canopy(c, state, e, hx0, hx1);
  // The decks: oak planks on stone piers, stepped down off the dragons' fronts, lit along their tops
  const S = STONE.map(dimmed), Tb = TIMBER;
  for (const lane of LANES as Lane[]) {
    const dw = DECK_X1 - DECK_X0 - (2 - lane) * 80, y = deckY(lane), [, , dark] = LANE_COL[lane];
    for (const px of [ux + 24, ux + dw - 30]) { box(c, px - 1, y + 14, 18, GY - y - 14, INK); slab(c, px, y + 14, 16, GY - y - 14, S); for (let yy = y + 30; yy < GY; yy += 18) box(c, px, yy, 16, 1, S[1]); }
    box(c, ux - 1, y - 1, dw + 2, 18, INK); box(c, ux, y, dw, 16, Tb[3]); box(c, ux, y + 12, dw, 4, Tb[1]);
    for (let x = ux + 12; x < ux + dw; x += 22) box(c, x, y + 2, 1, 12, Tb[1]);
    box(c, ux, y + 4, dw, 2, mix(dark, Tb[3], 0.6));
    box(c, ux, y, dw, 2, LIP[2]); box(c, ux, y, dw, 1, LIP[3]);
  }
  storySign(c, ux + 360, GY, ['UNLOAD', 'EXIT TO THY RIGHT'], { tall: 130 });
  storySign(c, EXIT_X - 200 + off, GY, ["THE GREAT PIXIE'S CASTLE", 'THIS WAY >'], { tall: 150, board: '#2E5A3A' });
  // The gate arch out: stone, a portcullis up, the lane up to the castle through it
  const ex = EXIT_X + off, St = STONE;
  box(c, ex - 30, GY - 300, 180, 300, INK); slab(c, ex - 29, GY - 299, 178, 299, St);
  for (let y = GY - 280; y < GY; y += 20) box(c, ex - 29, y, 178, 1, St[1]);
  for (let x = ex - 30; x < ex + 150; x += 30) { box(c, x, GY - 322, 20, 23, INK); box(c, x + 1, GY - 321, 18, 22, St[3]); box(c, x + 1, GY - 321, 4, 22, St[4]); }
  c.fillStyle = INK; c.beginPath(); c.moveTo(ex + 14, GY); c.lineTo(ex + 14, GY - 180); c.arc(ex + 60, GY - 180, 46, Math.PI, 0); c.lineTo(ex + 106, GY); c.closePath(); c.fill();
  c.fillStyle = '#7A8AC8'; c.beginPath(); c.moveTo(ex + 18, GY); c.lineTo(ex + 18, GY - 180); c.arc(ex + 60, GY - 180, 42, Math.PI, 0); c.lineTo(ex + 102, GY); c.closePath(); c.fill();
  box(c, ex + 18, GY - 60, 84, 60, FLAG[3]); box(c, ex + 18, GY - 120, 84, 60, '#9AA8D8');
  polyF(c, [[ex + 40, GY - 120], [ex + 60, GY - 200], [ex + 80, GY - 120]], '#C8BCD8'); polyF(c, [[ex + 48, GY - 170], [ex + 60, GY - 210], [ex + 72, GY - 170]], '#4A78D4');
  for (let x = ex + 22; x < ex + 100; x += 10) { box(c, x, GY - 232, 3, 30, IRON[3]); polyF(c, [[x - 1, GY - 202], [x + 4, GY - 202], [x + 1.5, GY - 196]], IRON[4]); }
  lampPostAt(c, ex - 50, GY); lampPostAt(c, ex + 170, GY);
};
const lampPostAt = (c: Ctx, x: number, y: number) => { c.save(); c.translate(x, y); lampPost(c, 0, 120); c.restore(); };
