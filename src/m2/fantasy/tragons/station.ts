// Truelling Tragons' load station and unload (world space, the scene's one eye). Both halls: a back wall at depth
// HALL_D (castle stone in courses, gothic windows of stained glass in the three dragons' colors, banners, lanterns on
// brackets, a crenellated cornice under a snowy slate roof, turrets at the ends), the platform's flagstones going back
// to it, the timber canopy's underside overhead out to its carved fascia at the play plane (lanterns hung off it), the
// end wall going back.
//
//   THE LOAD STATION   the three sculpted dragon heads over the hall breathing (fire, frost, sparks), the gilt name,
//                      the guests waiting behind the velvet ropes along the back (seeded, cheering), the dispatch
//                      booth (an operator in a headset at the console), THE MARQUEE hung low over the platform (the
//                      full name read whole as he comes in, its heads and bulbs), YOU MUST BE THIS TALL, the signs
//                      (HOLD ON IN THE LOOPS, NO FIREARMS ON THE DRAGONS; RIDE CLOSED on a revisit, a rope across),
//                      the gate (iron, gilt spikes) shut till it goes. It slides off the left with the park once the
//                      trains are out. Its play-plane things (and the unload's) are sorted in with the tracks (art.ts)
//                      so no support behind them draws over them.
//   THE UNLOAD         the decks one a lane, stepped down off the dragons' fronts (oak planks on stone piers, lit along
//                      their tops: somewhere to stand; gilt back rails), the exit stairs off the bottom deck, the hall,
//                      UNLOAD / EXIT TO THY RIGHT, the yard's flagstones, the castle garden's hedge along its back,
//                      the castle's gatehouse out (its towers, cone roofs, banners, the name; the courtyard through it).
//
// The still parts (the back walls, the crowd, the booth) are painted once per hour into stamps.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { paintedOn } from '../kit';
import {
  INK, mix, box, hash, checker, ramp6, rampH, dimmed, warmGlass, lit, polyF, ballR, postR, slab, gilt, storySign, sideBack,
  STONE, TIMBER, SLATE, SNOW, GOLD, IRON, FLAG, LIP, type Ctx,
} from '../kit';
import { paintHead } from '../glen/sets';
import { GY, S0X, STATION_X, GATE_X, DECK_X0, DECK_X1, EXIT_X, END_S, TL, LANES, LANE_COL, ROOF_H, wxOf, type Lane } from './layout';
import type { Tragons } from './state';
import { deckY, STAIR_N, STAIR_W, stairY } from './ride';
import { inView, scrollOf, at } from './scene';
import { guest, rails, lampPost, type GPose } from './scenery';
import type { Eye } from './track';
import { banded } from './cache';
import { paintLogo } from './logo';
import { timeOfDay } from '../../timeOfDay';

/** How far back the halls' back walls stand; how tall they are; the canopy's height. */
const HALL_D = 0.84, WALL_H = 600;
/** The heads' height on the wall (from its top), under the canopy where they're seen. */
const HEAD_Y = 176;
const D = (col: string) => rampH(ramp6(col), true);
/** Still art for the hour (and the sign font's arrival), cached at a whole device scale (cache.ts: the ride's zoom never
 *  repaints it). */
const fontOk = () => (typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"') ? 'f' : 'n');
const pic = (c: Ctx, key: string, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) =>
  banded(c, `${key}-${timeOfDay().key}-${fontOk()}`, bx, by, bw, bh, paint);

// ---------------------------------------------------------------------------------------------------------------
// A hall's back wall (local: its foot's left end at 0, 0; w wide)

const paintWall = (g: Ctx, w: number, heads: boolean) => {
  const S = STONE.map(dimmed), Sl = SLATE.map(dimmed), Sn = SNOW.map(dimmed), G = warmGlass(), Gd = GOLD.map(dimmed), I = IRON.map(dimmed);
  // (the stone in courses, blocks picked out, a plinth)
  box(g, -1, -WALL_H, w + 2, WALL_H, INK); slab(g, 0, -WALL_H, w, WALL_H, S);
  for (let y = -WALL_H + 18, r = 0; y < 0; y += 20, r++) {
    box(g, 0, y, w, 1, S[1]); box(g, 0, y + 1, w, 1, S[4]);
    for (let x = (r % 2) * 26; x < w; x += 52) {
      // (each block its own: a tone picked by its place, lit along its top and left, its shade under, a chip or a crack)
      const k = hash(x * 0.37 + r * 7.1), bw = Math.min(52, w - x);
      if (k > 0.66) box(g, x + 1, y - 19, bw - 1, 19, S[k > 0.88 ? 4 : 2]);
      box(g, x + 1, y - 19, bw - 2, 1, S[4]); box(g, x + 1, y - 18, 1, 17, S[4]); box(g, x + 1, y - 3, bw - 2, 2, S[2]);
      box(g, x, y - 19, 1, 19, S[1]);
      if (k < 0.12) { g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 12, y - 19); g.lineTo(x + 16, y - 12); g.lineTo(x + 13, y - 6); g.stroke(); }
      else if (k > 0.45 && k < 0.5) { box(g, x + bw - 8, y - 19, 6, 4, S[1]); box(g, x + bw - 8, y - 15, 6, 1, S[4]); }
      if (hash(x * 0.3 + r) > 0.7) box(g, x + 4, y - 16, 20, 2, S[4]);
    }
  }
  // (grime up from the plinth, dithered; damp under the windows' sills)
  for (let y = -70; y < -26; y += 2) checker(g, 0, y, w, 2, 'rgba(20,24,30,' + (0.18 * (1 + y / 70)).toFixed(3) + ')', (y / 2) & 1, 2);
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
  // (the three dragon heads over the hall, the ride's crest over them: logo.ts, stood off the wall on iron brackets)
  const mid = w * 0.5;
  for (const [ox, col, kind] of [[-230, '#C42828', 'fire'], [0, '#3A9AD8', 'ice'], [230, '#E0B020', 'bolt']] as const) { g.save(); g.translate(mid + ox - 20, -WALL_H + HEAD_Y); g.scale(1.2, 1.2); paintHead(g, col, kind); g.restore(); }
  paintLogo(g, mid, -WALL_H + 62, { dim: true, wall: true, glow: lit() });
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
  // (the flags' joints: staggered by band, so each stone's its own; a lit edge along each joint, a worn dip, grit)
  c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
  for (let i = 0; i < ds.length - 1; i++) {
    const a = ds[i], b = ds[i + 1], off = (i % 2) * 24;
    for (let x = Math.ceil((x0 - off) / 48) * 48 + off; x < x1; x += 48) { const [ax, ay] = at(e, x, GY, a), [bx, by] = at(e, x, GY, b); c.moveTo(ax, ay); c.lineTo(bx, by); }
  }
  c.stroke();
  for (let i = 0; i < ds.length - 1; i++) {
    const a = ds[i], b = ds[i + 1], off = (i % 2) * 24;
    for (let x = Math.ceil((x0 - off) / 48) * 48 + off; x < x1; x += 48) {
      const k = hash(x * 0.13 + i * 9), m = (a + b) / 2, [px, py] = at(e, x + 24, GY, m), sc = m;
      if (k > 0.75) { box(c, px - 10 * sc, py - 1, 20 * sc, 2, F[i < 4 ? 5 : 4]); }
      else if (k < 0.15) { box(c, px - 6 * sc, py, 12 * sc, 1, F[1]); box(c, px - 2 * sc, py - 1, 4 * sc, 1, F[0]); }
      const [qx, qy] = at(e, x + 1, GY, m); box(c, qx, qy, 1, 2 * sc, F[5]);
    }
  }
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
  pic(c, `tg-hall-load-${Math.round(w)}`, -80, -WALL_H - 200, w + 160, WALL_H + 204, g => paintWall(g, w, true));
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
    pic(c, `tg-hall-crowd-${Math.round(qw)}-${up}`, -40, -140, qw / qd + 80, 150, g => {
      const n = Math.floor(qw / qd / 30);
      for (let r = 0; r < 2; r++) for (let k = 0; k < n; k++) guest(g, 14 + k * 30 + r * 15, -r * 8, 500 + k * 5 + r * 3, (['stand', 'cheer', 'point', 'phone', 'stand'] as GPose[])[(k + r * 2) % 5], up === 1);
      rails(g, 0, qw / qd, 2);
    });
    c.restore();
  }
  const bd = 0.92, [bx, by] = at(e, GATE_X - 40 - sh, GY, bd);
  c.save(); c.translate(bx, by); c.scale(bd, bd);
  pic(c, 'tg-booth', -60, -170, 120, 174, g => {
    const Tb = TIMBER.map(dimmed), G = warmGlass();
    box(g, -40, -120, 80, 120, INK); slab(g, -39, -119, 78, 119, Tb);
    box(g, -32, -104, 64, 40, INK); box(g, -30, -102, 60, 36, G[3]); box(g, -30, -102, 60, 6, G[4]); box(g, -1, -102, 2, 36, Tb[1]);
    guest(g, -10, -66, 77, 'stand'); box(g, -18, -98, 2, 10, INK); box(g, -18, -90, 6, 2, INK);
    box(g, -36, -60, 72, 14, INK); box(g, -35, -59, 70, 12, Tb[2]); box(g, -35, -59, 70, 2, Tb[4]);
    polyF(g, [[-50, -120], [0, -160], [50, -120]], INK); polyF(g, [[-48, -121], [0, -158], [48, -121]], SLATE.map(dimmed)[3]); polyF(g, [[-48, -121], [0, -158], [-6, -121]], SLATE.map(dimmed)[4]);
    polyF(g, [[-30, -132], [0, -158], [30, -132], [0, -146]], SNOW.map(dimmed)[4]);
  });
  // (put back: this restore was missing, so every frame the station was on screen the booth's translate and scale
  // stayed on, the save stack went one out of step and the engine's own restore popped the wrong state: everything
  // drawn after it (the tracks, the dragons, the ground, him) landed a world away off the screen, a blank void)
  c.restore();
  // (the console's lights, live)
  for (let k = 0; k < 5; k++) box(c, bx + (-30 + k * 13) * bd, by - 56 * bd, 4 * bd, 3 * bd, (f / 8 + k) % 5 < 2 ? ['#4ADE80', '#F87171', '#FDE047', '#60A5FA', '#4ADE80'][k] : '#1A1028');
  canopy(c, state, e, x0, x1 + 140);
};

/** The load station's play-plane things (its signs, the gate): sorted in with the tracks at the play plane (art.ts),
 *  so no support behind them draws over them. */
export const drawStationNear = (c: Ctx, state: GameState, t: Tragons) => {
  const sh = scrollOf(t), x0 = STATION_X - 500 - sh, x1 = GATE_X + 60 - sh;
  if (!inView(state, x0 - 300, x1 + 300)) return;
  drawMarquee(c, state, S0X - 620 - sh);
  heightBoard(c, S0X - 330 - sh);
  storySign(c, STATION_X - 300 - sh, GY, ['HOLD ON IN THE LOOPS', 'OR FALL. ALL THE WAY.'], { warn: true, tall: 110, big: 1 });
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

// ---------------------------------------------------------------------------------------------------------------
// The marquee: hung on chains from the canopy over the platform, low enough to be read whole as he comes in (under the
// HUD band, left of the dragons): a gilt-framed velvet board, the ride's crest on it whole (logo.ts: the name, the
// three dragons at each other), its tag line, the FIRE and LIGHTNING heads off its ends, a chase of bulbs round the
// frame (live). Not to stand on: no lit top.

const MQ_TOP = -404, MQ_BOT = -234;
const mqW = () => 560;
const paintMarquee = (g: Ctx, w: number) => {
  const Gd = GOLD, I = IRON, V = D('#4A1478'), h = MQ_BOT - MQ_TOP, x0 = -w / 2;
  // (the chains up into the canopy)
  for (const cx of [x0 + 60, -x0 - 60]) for (let y = MQ_TOP - 300; y < MQ_TOP; y += 8) { box(g, cx - 2, y, 4, 6, INK); box(g, cx - 1, y + 1, 2, 4, Math.floor(y / 8) & 1 ? I[3] : I[4]); }
  // (the board: an ink edge, a gilt frame in steps, the velvet field, its nap banded, rivets)
  box(g, x0 - 3, MQ_TOP - 3, w + 6, h + 6, INK);
  box(g, x0 - 2, MQ_TOP - 2, w + 4, h + 4, Gd[1]); box(g, x0, MQ_TOP, w, h, Gd[3]); box(g, x0, MQ_TOP, w, 2, Gd[5]); box(g, x0, MQ_BOT - 2, w, 2, Gd[1]);
  box(g, x0 + 7, MQ_TOP + 7, w - 14, h - 14, INK); box(g, x0 + 8, MQ_TOP + 8, w - 16, h - 16, V[2]);
  for (let y = MQ_TOP + 10; y < MQ_BOT - 10; y += 6) box(g, x0 + 8, y, w - 16, 2, V[(y / 6) % 2 ? 3 : 2]);
  box(g, x0 + 8, MQ_TOP + 8, w - 16, 3, V[4]); box(g, x0 + 8, MQ_BOT - 12, w - 16, 4, V[1]);
  for (let x = x0 + 14; x < -x0 - 10; x += 32) { box(g, x, MQ_TOP + 3, 2, 2, Gd[5]); box(g, x, MQ_BOT - 5, 2, 2, Gd[0]); }
  // (the ride's crest on it, whole (logo.ts), and its tag line under)
  paintLogo(g, 0, MQ_TOP + 80, { glow: lit() });
  signText(g, 'THREE DRAGONS. THREE TRACKS. NO SEATS.', 0, MQ_BOT - 13, gilt(1));
  // (the FIRE head off the left end facing out, the LIGHTNING head off the right)
  g.save(); g.translate(x0 - 14, MQ_TOP + h / 2); g.scale(-1.3, 1.3); paintHead(g, '#C42828', 'fire'); g.restore();
  g.save(); g.translate(-x0 + 14, MQ_TOP + h / 2); g.scale(1.3, 1.3); paintHead(g, '#E0B020', 'bolt'); g.restore();
};
const drawMarquee = (c: Ctx, state: GameState, cx: number) => {
  const w = mqW(), f = state.frame;
  c.save(); c.translate(Math.round(cx), GY);
  pic(c, `tg-marquee-${Math.round(w)}`, -w / 2 - 110, MQ_TOP - 310, w + 220, MQ_BOT - MQ_TOP + 380, g => paintMarquee(g, w));
  c.restore();
  // (the chase of bulbs round the frame, live: warm by day, bright after dark)
  const x0 = cx - w / 2, n = Math.floor(w / 20), on = lit();
  for (let k = 0; k <= n; k++) {
    const hot = (k + (f >> 3)) % 3 === 0, col = hot ? (on ? '#FFF8D8' : '#FFE9A8') : on ? '#F0A83E' : '#B08848';
    box(c, x0 + k * (w / n) - 1.5, GY + MQ_TOP - 5, 3, 3, col); box(c, x0 + k * (w / n) - 1.5, GY + MQ_BOT + 2, 3, 3, col);
  }
  // (the heads' breath: the fire one's flicker, the lightning one's spark)
  const fx = cx - w / 2 - 14 - 70, fy = GY + MQ_TOP + (MQ_BOT - MQ_TOP) / 2 + 12;
  for (let k = 0; k < 4; k++) box(c, fx - k * 9, fy - 4 + (((f + k * 3) % 6) - 3), 8 - k, 6 - (k >> 1), ['#FDE047', '#F97316', '#DC2626', '#7A1A1A'][(Math.floor(f / 4) + k) % 4]);
  if (f % 46 < 8) {
    const lx = cx + w / 2 + 14 + 76, ly = fy;
    c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 12, ly + 8); c.lineTo(lx + 5, ly + 13); c.lineTo(lx + 22, ly + 24); c.stroke(); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.stroke();
  }
};

/** YOU MUST BE THIS TALL: a carved post, a dragon's claw out at the line, the board over it. */
const heightBoard = (c: Ctx, x: number) => {
  c.save(); c.translate(Math.round(x), GY);
  pic(c, 'tg-tall', -70, -190, 150, 194, g => {
    const W = D('#6A4428'), Gd = GOLD, R = D('#C42828');
    postR(g, 0, -180, 0, 10, W);
    for (let y = -170; y < 0; y += 20) box(g, -5, y, 10, 1, W[1]);
    // (the claw at the line: an arm out, three talons down)
    polyF(g, [[4, -122], [52, -128], [56, -118], [4, -112]], INK); polyF(g, [[5, -121], [51, -126], [54, -119], [5, -113]], R[3]); box(g, 6, -121, 44, 2, R[4]);
    for (let k = 0; k < 3; k++) polyF(g, [[42 + k * 5, -118], [46 + k * 5, -118], [44 + k * 5, -108]], D('#F2EAD0')[4]);
    box(g, 4, -112, 60, 1, '#FFFFFF');
    // (the board: red, gilt edged, painted on)
    box(g, -62, -192, 124, 52, INK); box(g, -61, -191, 122, 50, Gd[3]); box(g, -58, -188, 116, 44, D('#9B1C1C')[3]); box(g, -58, -188, 116, 3, D('#9B1C1C')[4]);
    signText(g, 'YOU MUST BE', 0, -174, paintedOn(1));
    signText(g, 'THIS TALL', 0, -162, paintedOn(1));
    signText(g, 'TO RIDE', 0, -150, paintedOn(1, '#FDE68A'));
  });
  c.restore();
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
  pic(c, `tg-hall-unload-${Math.round(w)}`, -80, -WALL_H - 200, w + 160, WALL_H + 204, g => paintWall(g, w, false));
  c.restore();
  // (the yard's flagstones out to the gate)
  flags(c, e, hx0, EXIT_X + off + 260);
  // (along the back of the yard from the hall to the gatehouse: the castle's garden hedge, topiary, a flower bed)
  const gx0 = hx1 + 60, gw = Math.round(EXIT_X + off - 130 - gx0);
  if (gw > 40) {
    const [gx, gy] = at(e, gx0, GY, HALL_D);
    c.save(); c.translate(gx, gy); c.scale(HALL_D, HALL_D);
    pic(c, `tg-hedge-${gw}`, -10, -190, gw + 20, 194, g => paintHedge(g, gw));
    c.restore();
  }
  canopy(c, state, e, hx0, hx1);
};

/** The castle garden's hedge (local: its foot's left at 0, 0; w wide): clipped yew in steps, lit along the top, cone
 *  topiaries standing up out of it in gilt pots, a bed of pink and lilac flowers along its foot. */
const paintHedge = (g: Ctx, w: number) => {
  const H = D('#2E6A3A'), Fl = ['#F49AC8', '#C8A0E8', '#FFFFFF', '#F9C8E0'].map(col => dimmed(col)), Gd = GOLD.map(dimmed);
  box(g, -1, -91, w + 2, 91, INK); box(g, 0, -90, w, 90, H[2]); box(g, 0, -90, w, 6, H[4]); box(g, 0, -84, w, 2, H[3]); box(g, 0, -10, w, 10, H[1]);
  for (let x = 4; x < w - 4; x += 11) for (let y = -76; y < -14; y += 13) box(g, x + ((y / 13) & 1) * 5, y, 4, 3, H[(x + y) % 3 ? 3 : 1]);
  for (let x = 70; x < w - 40; x += 150) {
    polyF(g, [[x - 22, -88], [x, -176], [x + 22, -88]], INK); polyF(g, [[x - 20, -89], [x, -172], [x + 20, -89]], H[3]); polyF(g, [[x - 20, -89], [x, -172], [x - 4, -89]], H[4]);
    for (let k = 1; k < 4; k++) box(g, x - 20 + k * 5, -89 - k * 20, 40 - k * 10, 2, H[2]);
    ballR(g, x, -178, 4, Gd);
  }
  box(g, 0, -8, w, 8, dimmed('#5A3A2A'));
  for (let x = 3; x < w - 3; x += 7) box(g, x, -12 + (x % 3), 4, 4, Fl[(x * 13) % 4]);
};

/** The unload's play-plane things (the decks, its signs, the gate arch out, the lamps): sorted in with the tracks at the
 *  play plane (art.ts), so no support behind them draws over them (the castle's sign was half behind one). */
export const drawUnloadNear = (c: Ctx, state: GameState, t: Tragons) => {
  const ux = wxOf(t.dist, END_S + TL) + 2, off = ux - DECK_X0;
  if (!inView(state, ux - 400, EXIT_X + off + 400)) return;
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
  // The exit stairs down off the bottom deck to the yard (each step a real one: ride.ts), a handrail along them
  const sx0 = DECK_X1 + off;
  for (let k = 0; k < STAIR_N; k++) {
    const x = sx0 + k * STAIR_W, y = stairY(k);
    box(c, x - 1, y - 1, STAIR_W + 2, GY - y + 1, INK); slab(c, x, y, STAIR_W, GY - y, S);
    box(c, x, y, STAIR_W, 2, LIP[2]); box(c, x, y, STAIR_W, 1, LIP[3]); box(c, x, y + 10, STAIR_W, 1, S[1]);
  }
  const rail = (x0: number, y0: number, x1: number, y1: number) => {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x0, y0 - 34); c.lineTo(x1, y1 - 34); c.stroke();
    c.strokeStyle = GOLD[3]; c.lineWidth = 2; c.stroke();
  };
  const sEnd = sx0 + STAIR_N * STAIR_W;
  rail(sx0 + 4, deckY(2), sEnd - 6, GY - 8);
  for (let k = 0; k <= STAIR_N; k += 2) {
    const x = sx0 + 4 + ((sEnd - 10 - sx0) * k) / STAIR_N, y = deckY(2) + ((GY - 8 - deckY(2)) * k) / STAIR_N;
    postR(c, x, y - 36, k ? Math.min(GY, stairY(Math.min(STAIR_N - 1, k - 1))) : y, 3, GOLD);
  }
  // (the decks' back rails: gilt, posts and a top rail, clear of the dragons' heads)
  for (const lane of LANES as Lane[]) {
    const dw = DECK_X1 - DECK_X0 - (2 - lane) * 80, y = deckY(lane), x0 = ux + 120, x1 = ux + dw - 6;
    if (x1 - x0 < 40) continue;
    rail(x0, y, x1, y);
    for (let x = x0; x <= x1; x += 56) postR(c, x, y - 36, y, 3, GOLD);
  }
  // The castle's gatehouse: out of the yard into the castle's grounds (cached art)
  const ex = EXIT_X + off;
  c.save(); c.translate(Math.round(ex), GY);
  pic(c, 'tg-gatehouse', -150, -580, 420, 584, paintGatehouse);
  c.restore();
  lampPostAt(c, ex - 150, GY);
};

/** The Great Pixie's castle's gatehouse at the unload's yard end (local: the arch's left at 18, the ground at 0): the
 *  castle's own lavender stone and blue cone roofs banded in gold, pink pennants, two round towers with their banners
 *  and crenellations, the gilt name over the arch, the portcullis up, and through the arch the castle's courtyard (a
 *  path between hedges up to the keep's door, a tower over it), box hedges at its feet. */
const paintGatehouse = (g: Ctx) => {
  const St = D('#BCAED6'), Rf = D('#4A78D4'), Pk = D('#F49AC8'), Gd = GOLD.map(dimmed), Ir = IRON.map(dimmed), Hg = D('#2E7A3A'), Fl = FLAG.map(dimmed);
  const night = timeOfDay().lamps > 0.3;
  const sky = timeOfDay().lamps > 0.5 ? ['#1E2448', '#2A3060', '#3A4278'] : ['#8AB4F0', '#A8C8F4', '#C8DCF8'];
  // (the view through the arch, first: the sky, the keep's wall and door, a tower over it, the path between hedges)
  g.save(); g.beginPath(); g.moveTo(18, 0); g.lineTo(18, -180); g.arc(60, -180, 42, Math.PI, 0); g.lineTo(102, 0); g.closePath(); g.clip();
  sky.forEach((col, i) => box(g, 18, -224 + i * 30, 84, 30, dimmed(col)));
  const Fw = D('#9484B4');
  box(g, 18, -134, 84, 90, Fw[3]); for (let y = -126; y < -44; y += 10) box(g, 18, y, 84, 1, Fw[2]);
  for (let x = 18; x < 102; x += 12) { box(g, x, -142, 8, 8, Fw[3]); box(g, x, -142, 8, 2, Fw[4]); }
  box(g, 64, -200, 24, 70, Fw[4]); box(g, 64, -200, 4, 70, Fw[5]); box(g, 84, -200, 4, 70, Fw[2]);
  polyF(g, [[60, -200], [76, -240], [92, -200]], Rf[3]); polyF(g, [[60, -200], [76, -240], [72, -200]], Rf[4]); box(g, 60, -202, 32, 3, Gd[3]);
  box(g, 76, -252, 1, 12, Ir[3]); polyF(g, [[77, -252], [88, -249], [77, -246]], Pk[3]);
  box(g, 72, -186, 8, 12, night ? '#FFE6A0' : Fw[1]);
  g.fillStyle = INK; g.beginPath(); g.moveTo(48, -44); g.lineTo(48, -76); g.arc(60, -76, 12, Math.PI, 0); g.lineTo(72, -44); g.closePath(); g.fill();
  g.fillStyle = dimmed('#5A3A2A'); g.beginPath(); g.moveTo(50, -44); g.lineTo(50, -76); g.arc(60, -76, 10, Math.PI, 0); g.lineTo(70, -44); g.closePath(); g.fill();
  box(g, 18, -44, 84, 44, Hg[2]);
  polyF(g, [[50, -44], [70, -44], [96, 0], [24, 0]], Fl[3]);
  for (let y = -36; y < 0; y += 9) { const u = (y + 44) / 44; box(g, 60 - (10 + 36 * u), y, 20 + 72 * u, 1, Fl[1]); }
  for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) {
    const u = k / 4, x = 60 + sd * (16 + 30 * u), h = 8 + 10 * u;
    box(g, x - 4 - 4 * u, -44 + 44 * u - h, 8 + 8 * u, h, Hg[3]); box(g, x - 4 - 4 * u, -44 + 44 * u - h, 8 + 8 * u, 2, Hg[4]);
  }
  g.restore();
  // (the gate wall: ashlar courses, blocks picked out by place, lit left and top; its merlons)
  box(g, -31, -301, 182, 301, INK); slab(g, -30, -300, 180, 300, St);
  for (let y = -280, r = 0; y < 0; y += 20, r++) {
    box(g, -30, y, 180, 1, St[1]);
    for (let bx = -30 + (r % 2) * 14; bx < 150; bx += 28) { box(g, bx, y - 19, 1, 19, St[1]); if (hash(bx * 0.31 + r * 5.7) > 0.7) box(g, bx + 1, y - 18, Math.min(27, 149 - bx), 2, St[4]); }
  }
  for (let mx = -30; mx < 146; mx += 24) { box(g, mx - 1, -323, 18, 24, INK); box(g, mx, -322, 16, 22, St[3]); box(g, mx, -322, 4, 22, St[4]); box(g, mx, -322, 16, 2, St[5]); }
  // (the arch cut through it: its voussoirs, the portcullis up in its slot)
  g.fillStyle = INK; g.beginPath(); g.moveTo(12, 0); g.lineTo(12, -180); g.arc(60, -180, 48, Math.PI, 0); g.lineTo(108, 0); g.lineTo(102, 0); g.lineTo(102, -180); g.arc(60, -180, 42, 0, Math.PI, true); g.lineTo(18, 0); g.closePath(); g.fill();
  for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI, x = 60 + Math.cos(a) * 45, y = -180 + Math.sin(a) * 45; box(g, x - 3, y - 3, 6, 6, k % 2 ? St[5] : St[4]); }
  for (let x = 22; x < 100; x += 10) { box(g, x, -226, 3, 26, Ir[2]); polyF(g, [[x - 1, -200], [x + 4, -200], [x + 1.5, -194]], Ir[4]); }
  box(g, 18, -222, 84, 3, Ir[1]); box(g, 18, -210, 84, 2, Ir[2]);
  // (the name over the arch, on a gilt-edged board)
  box(g, -12, -296, 144, 56, INK); box(g, -11, -295, 142, 54, Gd[3]); box(g, -8, -292, 136, 48, dimmed('#3B0764')); box(g, -8, -292, 136, 2, D('#3B0764')[4]);
  signText(g, "THE GREAT PIXIE'S", 60, -270, gilt(1)); signText(g, 'CASTLE', 60, -252, gilt(1));
  // (the round towers either side: shaded round in steps, courses, slit windows, a corbelled ring, crenellations, the
  // blue cone roof banded in gold, a pink pennant; a long pink banner down each; box hedges at the foot)
  for (const tx of [-76, 196]) {
    const r = 46, top = -380;
    box(g, tx - r - 1, top - 1, r * 2 + 2, -top + 1, INK);
    const cols = [St[2], St[3], St[4], St[4], St[3], St[3], St[2], St[1]];
    cols.forEach((col, i) => box(g, tx - r + (i * r * 2) / cols.length, top, (r * 2) / cols.length + 1, -top, col));
    for (let y = top + 22; y < 0; y += 22) box(g, tx - r, y, r * 2, 1, St[1]);
    for (let y = top + 40; y < -60; y += 90) { box(g, tx + 18, y, 8, 26, INK); box(g, tx + 19, y + 1, 6, 24, night ? '#FFE6A0' : St[0]); }
    box(g, tx - r - 7, top - 14, r * 2 + 14, 16, INK); box(g, tx - r - 6, top - 13, r * 2 + 12, 14, St[3]); box(g, tx - r - 6, top - 13, r * 2 + 12, 2, St[5]);
    for (let k = 0; k < 6; k++) box(g, tx - r - 4 + k * 18, top + 1, 8, 6, St[1]);
    for (let mx = tx - r - 6; mx < tx + r; mx += 20) { box(g, mx - 1, top - 34, 14, 21, INK); box(g, mx, top - 33, 12, 20, St[3]); box(g, mx, top - 33, 3, 20, St[5]); }
    polyF(g, [[tx - r - 10, top - 34], [tx, top - 170], [tx + r + 10, top - 34]], INK);
    polyF(g, [[tx - r - 8, top - 35], [tx, top - 167], [tx + r + 8, top - 35]], Rf[3]);
    polyF(g, [[tx - r - 8, top - 35], [tx, top - 167], [tx - 12, top - 35]], Rf[4]);
    polyF(g, [[tx + 16, top - 35], [tx, top - 167], [tx + r + 8, top - 35]], Rf[2]);
    box(g, tx - r - 10, top - 38, (r + 10) * 2, 4, Gd[3]); box(g, tx - 33, top - 90, 66, 4, Gd[3]);
    box(g, tx, top - 192, 1, 26, Ir[3]); polyF(g, [[tx + 1, top - 192], [tx + 22, top - 186], [tx + 1, top - 180]], Pk[3]); polyF(g, [[tx + 1, top - 192], [tx + 22, top - 186], [tx + 1, top - 189]], Pk[4]);
    const bx = tx - 22;
    box(g, bx - 3, top + 10, 32, 4, Gd[3]); box(g, bx - 1, top + 14, 28, 150, INK); box(g, bx, top + 14, 26, 148, Pk[3]); box(g, bx, top + 14, 5, 148, Pk[4]); box(g, bx + 21, top + 14, 5, 148, Pk[2]);
    polyF(g, [[bx, top + 162], [bx + 13, top + 150], [bx + 26, top + 162], [bx + 26, top + 172], [bx + 13, top + 160], [bx, top + 172]], Pk[3]);
    ballR(g, bx + 13, top + 60, 7, Gd);
    box(g, tx - r - 8, -30, r * 2 + 16, 30, INK); box(g, tx - r - 7, -29, r * 2 + 14, 29, Hg[2]); box(g, tx - r - 7, -29, r * 2 + 14, 4, Hg[4]);
    for (let x = tx - r - 4; x < tx + r + 4; x += 9) box(g, x, -22 + ((x * 7) % 5), 3, 3, Hg[3]);
  }
};
const lampPostAt = (c: Ctx, x: number, y: number) => { c.save(); c.translate(x, y); lampPost(c, 0, 120); c.restore(); };
