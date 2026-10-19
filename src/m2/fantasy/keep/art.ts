// The castle's base and the runway, painted (the prototype first pass: crude but readable; peak-SNES later). He's AT
// the castle now, so the monument hands over: no castle on a far crag in this sky (no tiny castle over the real one);
// instead the same painter (monument.ts drawCastleAt) close up, its keep and the highest spire towering over the walls
// with its foot out of the picture, Piper's window lit up there; out on the runway the whole keep beside him, the
// window right up over the deck.
//
// Behind the play plane (dimmed, no lit edges: scenery): the barbican's walls, the gift shop's shelves along the
// gatehouse passage, the courtyard's far wall with its banners, the merlons behind the wall walk, the hoardings, the
// tower's inside, the postern's wall, the broom port's stands. In the play plane, lit along every top he can stand
// on: the flagstones, the wall walk, the breach's pillar, the landings, the gallery, the steps, the deck. The gatehouse's
// inside is veiled (its front wall drawn over the passage) till he's in it.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay, farTint } from '../../timeOfDay';
import { box, mix, hash, onScreen, storySign, fairySky, INK, type Ctx } from '../kit';
import { drawCastleAt } from '../monument';
import {
  X, Y, GY, x0, RUNWAY, MOAT, BARBICAN, GATEHOUSE, WALL, BREACH, PILLAR, LAND_B, LAND_C, GALLERY, TOWER_WALL, LEDGES,
  HOLES, PA_AT, DECK, SCENE, BOUTIQUE,
} from './layout';

const DIM = 0.4;
const T = (col: string, dim = DIM) => mix(farTint(col, 0.2, timeOfDay()), timeOfDay().haze, dim);
const STONE = ['#E6DEF2', '#C8BCDC', '#A898C4', '#86769E', '#5E5078'];

// ---------------------------------------------------------------------------------------------------------------
// The far layer

export const drawKeepBackdrop = (c: Ctx, state: GameState) => {
  fairySky(c, state, null, { near: '#2E2A4A' });
  const mid = state.camera.x + CANVAS_WIDTH / 2 - x0;
  // (climbing: the castle sinks a little in the picture)
  const rise = (GY - 500 - state.camera.y) * 0.12;
  if (mid < RUNWAY - 150) {
    // (inside the walls: the keep and the spire towering up, a little drift as he goes)
    const k = Math.max(0, Math.min(1, mid / RUNWAY));
    drawCastleAt(c, Math.round(540 - 260 * k), Math.round(1250 + rise), 2.8, state.frame);
  } else {
    // (out on the runway: the keep beside him, its highest window lit right up over the deck)
    const k = Math.max(0, Math.min(1, (mid - RUNWAY) / 3000));
    drawCastleAt(c, Math.round(250 - 140 * k), Math.round(1000 + rise), 2.4, state.frame);
  }
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The pieces

/** Stone in the play plane: courses, a lit top (stood on) unless `unlit`. */
const stone = (c: Ctx, a: number, b: number, top: number, bot: number, unlit = false, dim = 0) => {
  const S = dim ? STONE.map(s => T(s, dim)) : STONE;
  box(c, a - 1, top - 1, b - a + 2, bot - top + 1, INK);
  box(c, a, top, b - a, bot - top, S[2]); box(c, a, top, 6, bot - top, S[1]); box(c, b - 8, top, 8, bot - top, S[3]);
  for (let y = top + 14; y < bot; y += 14) { box(c, a, y, b - a, 1, S[3]); for (let x = a + (((y - top) / 14) % 2) * 18; x < b - 4; x += 36) box(c, x, y - 13, 1, 13, S[3]); }
  if (!unlit) { box(c, a, top, b - a, 3, '#F6E7C0'); box(c, a, top + 3, b - a, 2, S[0]); }
};
/** A crenellated parapet behind a walk (dimmed: scenery). */
const merlons = (c: Ctx, a: number, b: number, floorY: number) => {
  const col = T(STONE[2], 0.5), dk = T(STONE[3], 0.5);
  box(c, a, floorY - 40, b - a, 40, col);
  for (let x = a; x < b; x += 40) { box(c, x, floorY - 64, 24, 24, col); box(c, x + 18, floorY - 64, 6, 24, dk); }
};
/** A wooden hoarding (scenery: dimmed, not stood on) at height h over a walk, from a to b. */
const hoarding = (c: Ctx, a: number, b: number, h: number) => {
  const y = Y(h), wood = T('#7A5230', 0.35), dk = T('#4A3018', 0.35);
  box(c, a - 1, y - 51, b - a + 2, 52, INK); box(c, a, y - 50, b - a, 50, wood);
  for (let x = a + 10; x < b; x += 16) box(c, x, y - 50, 2, 50, dk);
  c.fillStyle = T('#8A3A5A', 0.35); c.beginPath(); c.moveTo(a - 10, y - 50); c.lineTo((a + b) / 2, y - 80); c.lineTo(b + 10, y - 50); c.closePath(); c.fill();
  for (let x = a + 20; x < b - 10; x += 60) { box(c, x, y, 6, 16, dk); }
};
/** A banner hung off a wall (pink, a gold heart). */
const banner = (c: Ctx, x: number, top: number, len: number, f: number) => {
  const sway = Math.sin(f * 0.03 + x) * 2;
  box(c, x - 16, top - 4, 32, 4, T('#3A3448', 0.2));
  c.fillStyle = T('#D8609E', 0.3); c.beginPath(); c.moveTo(x - 14, top); c.lineTo(x + 14, top); c.lineTo(x + 14 + sway, top + len); c.lineTo(x + sway, top + len - 12); c.lineTo(x - 14 + sway, top + len); c.closePath(); c.fill();
  c.fillStyle = T('#F6D365', 0.3); c.beginPath(); c.arc(x - 3 + sway / 2, top + 24, 4, 0, Math.PI * 2); c.arc(x + 3 + sway / 2, top + 24, 4, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.moveTo(x - 7 + sway / 2, top + 26); c.lineTo(x + sway / 2, top + 34); c.lineTo(x + 7 + sway / 2, top + 26); c.closePath(); c.fill();
};
/** A wall torch (its flame soft). */
const torch = (c: Ctx, x: number, y: number, f: number) => {
  box(c, x - 2, y, 4, 14, '#3A3448');
  c.save(); c.globalAlpha = 0.18; c.fillStyle = '#FDBA74'; c.beginPath(); c.arc(x, y - 4, 16, 0, Math.PI * 2); c.fill(); c.restore();
  const fl = Math.floor(f / 5) % 2;
  c.fillStyle = '#F97316'; c.beginPath(); c.ellipse(x, y - 4, 4, 7 + fl, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(x, y - 3, 2, 4, 0, 0, Math.PI * 2); c.fill();
};
/** Piper's PA horn: brass, on a bracket off an iron pole (from `foot` up to `h`); sound rings out while she talks. */
const paHorn = (c: Ctx, x: number, foot: number, h: number, talking: boolean, f: number) => {
  const hy = Y(h), fy = Y(foot);
  box(c, x - 4, hy - 4, 8, fy - hy + 4, INK); box(c, x - 2, hy - 2, 4, fy - hy + 2, '#3A3448');
  box(c, x, hy - 2, 22, 4, INK);
  const jig = talking && f % 4 < 2 ? 1 : 0;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 18, hy - 5 + jig); c.lineTo(x + 46, hy - 20 + jig); c.lineTo(x + 46, hy + 16 + jig); c.lineTo(x + 18, hy + 5 + jig); c.closePath(); c.fill();
  c.fillStyle = '#E0AE3A'; c.beginPath(); c.moveTo(x + 19, hy - 3 + jig); c.lineTo(x + 44, hy - 17 + jig); c.lineTo(x + 44, hy + 13 + jig); c.lineTo(x + 19, hy + 3 + jig); c.closePath(); c.fill();
  c.fillStyle = '#FFF0A0'; c.fillRect(x + 20, hy - 3 + jig, 20, 2);
  c.fillStyle = '#F472B6'; c.beginPath(); c.arc(x + 8, hy - 9, 3, 0, Math.PI * 2); c.fill();
  if (talking) for (let k = 0; k < 3; k++) { const r = 10 + ((f * 1.5 + k * 14) % 42); c.strokeStyle = `rgba(244, 114, 182, ${Math.max(0, 1 - r / 52)})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 46, hy - 2, r, -0.7, 0.7); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The sections of it

const drawApproach = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(-200), X(GATEHOUSE.a + 300))) return;
  const f = state.frame;
  // (the barbican: the outer wall behind the approach, dimmed; banners)
  stone(c, X(-200), X(MOAT.a - 60), Y(260), GY, true, 0.45);
  for (const x of [120, 380, 640]) banner(c, X(x), Y(240), 90, f);
  // (the barbican's ledge: corbelled out of its tower over the moat; lit: it's stood on)
  stone(c, X(BARBICAN.a), X(BARBICAN.b), Y(BARBICAN.h), Y(BARBICAN.h) + 18);
  box(c, X(BARBICAN.a) + 10, Y(BARBICAN.h) + 18, 12, 30, STONE[3]); box(c, X(BARBICAN.b) - 22, Y(BARBICAN.h) + 18, 12, 30, STONE[3]);
  // (the moat: drained, stone-lined, a long way down; a puddle of green at the bottom far below)
  box(c, X(MOAT.a), GY, MOAT.b - MOAT.a, 1400, T('#2A2440', 0.2));
  box(c, X(MOAT.a), GY, 12, 1400, T(STONE[3], 0.3)); box(c, X(MOAT.b) - 12, GY, 12, 1400, T(STONE[3], 0.3));
  for (let y = GY + 30; y < GY + 600; y += 40) box(c, X(MOAT.a) + 12, y, MOAT.b - MOAT.a - 24, 1, T('#3A3458', 0.2));
  // (the gatehouse's front: two round towers, the arch, the portcullis up in it (its spikes showing))
  const ga = X(GATEHOUSE.a);
  stone(c, ga, ga + 200, Y(GATEHOUSE.roof + 60), Y(GATEHOUSE.ceil), true);
  for (const tx of [ga - 30, ga + 170]) { stone(c, tx, tx + 60, Y(GATEHOUSE.roof + 120), Y(GATEHOUSE.ceil), true); c.fillStyle = INK; c.beginPath(); c.moveTo(tx - 6, Y(GATEHOUSE.roof + 120)); c.lineTo(tx + 30, Y(GATEHOUSE.roof + 190)); c.lineTo(tx + 66, Y(GATEHOUSE.roof + 120)); c.closePath(); c.fill(); c.fillStyle = '#4A78D4'; c.beginPath(); c.moveTo(tx - 4, Y(GATEHOUSE.roof + 121)); c.lineTo(tx + 30, Y(GATEHOUSE.roof + 186)); c.lineTo(tx + 64, Y(GATEHOUSE.roof + 121)); c.closePath(); c.fill(); }
  for (let x = ga + 6; x < ga + 196; x += 10) box(c, x, Y(GATEHOUSE.ceil) - 2, 2, 22, '#3A3448');
  for (let x = ga + 6; x < ga + 196; x += 10) { c.fillStyle = '#3A3448'; c.beginPath(); c.moveTo(x - 2, Y(GATEHOUSE.ceil) + 20); c.lineTo(x + 1, Y(GATEHOUSE.ceil) + 28); c.lineTo(x + 4, Y(GATEHOUSE.ceil) + 20); c.closePath(); c.fill(); }
  box(c, ga + 70, Y(GATEHOUSE.roof + 30), 60, 30, '#D8609E'); box(c, ga + 96, Y(GATEHOUSE.roof + 26), 8, 22, '#F6D365');
};

const drawGatehouse = (c: Ctx, state: GameState) => {
  const a = X(GATEHOUSE.a), b = X(GATEHOUSE.b), f = state.frame;
  if (!onScreen(state, a - 100, b + 100)) return;
  // (the passage's back wall, the gift shop's shelves along it (dimmed: scenery))
  stone(c, a, b, Y(GATEHOUSE.ceil), GY, true, 0.5);
  for (let x = X(GATEHOUSE.shop.a); x < X(GATEHOUSE.shop.b); x += 130) {
    box(c, x, Y(140), 110, 120, T('#6A4A2A', 0.35));
    for (const sh of [130, 92, 54]) {
      box(c, x + 4, Y(sh), 102, 4, T('#8A6A3A', 0.35));
      for (let k = 0; k < 6; k++) {
        const it = Math.floor(hash(x + sh + k) * 4), ix = x + 8 + k * 16, iy = Y(sh);
        if (it === 0) { box(c, ix, iy - 10, 10, 10, T('#F49AC8', 0.3)); box(c, ix + 2, iy - 13, 6, 4, T('#F49AC8', 0.3)); }
        else if (it === 1) { box(c, ix, iy - 5, 12, 3, T('#F6D365', 0.3)); box(c, ix + 2, iy - 8, 2, 3, T('#F6D365', 0.3)); box(c, ix + 8, iy - 8, 2, 3, T('#F6D365', 0.3)); }
        else if (it === 2) box(c, ix + 4, iy - 14, 2, 14, T('#8A5A30', 0.3));
        else { box(c, ix, iy - 12, 11, 12, T('#A8C8F0', 0.3)); box(c, ix + 3, iy - 15, 5, 3, T('#A8C8F0', 0.3)); }
      }
    }
  }
  for (const x of [1340, 1900, 2460, 2860]) torch(c, X(x), Y(110), f);
  // (the ceiling: the gatehouse over the passage, its battlements dimmed (not stood on))
  stone(c, a, b, Y(GATEHOUSE.roof), Y(GATEHOUSE.ceil), true);
  merlons(c, a, b, Y(GATEHOUSE.roof));
  // (the far end: the inner arch, a second portcullis up)
  for (let x = b - 24; x < b; x += 8) box(c, x, Y(GATEHOUSE.ceil), 2, 18, '#3A3448');
};

/** The gatehouse's front wall over the passage: there till he's in it (the inside's veiled till it's entered). */
export const drawGatehouseVeil = (c: Ctx, state: GameState) => {
  const a = X(GATEHOUSE.a), b = X(GATEHOUSE.b), p = state.player, cx = p.pos.x + p.width / 2;
  if (!onScreen(state, a - 40, b + 40)) return;
  const inside = cx > a + 10 && cx < b - 10 && p.pos.y + p.height > Y(GATEHOUSE.ceil);
  const k = keepVeil.k = keepVeil.k + ((inside ? 0 : 1) - keepVeil.k) * 0.15;
  if (k < 0.02) return;
  c.save(); c.globalAlpha = k;
  stone(c, a + 200, b, Y(GATEHOUSE.ceil), GY, true);
  for (let x = a + 260; x < b - 60; x += 220) { box(c, x, Y(110), 14, 40, INK); box(c, x + 2, Y(108), 10, 36, '#2A2440'); }
  c.restore();
};
const keepVeil = { k: 1 };

const drawCourtyard = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(GATEHOUSE.b - 100), X(WALL.a + 200))) return;
  const f = state.frame;
  // (the far inner wall, banners, the keep's foot)
  stone(c, X(GATEHOUSE.b), X(WALL.a), Y(420), GY, true, 0.5);
  merlons(c, X(GATEHOUSE.b), X(WALL.a), Y(420));
  for (const x of [3000, 3700, 4250]) banner(c, X(x), Y(380), 120, f);
  for (const x of [3620, 3900]) torch(c, X(x), Y(120), f);
  // (the rose garden's trellis arch, dimmed)
  const ta = X(4060), tb = X(4610), tc = T('#F4F4F5', 0.45);
  for (const x of [ta, tb - 6]) box(c, x, Y(250), 6, 250, tc);
  c.strokeStyle = tc; c.lineWidth = 5; c.beginPath(); c.moveTo(ta + 3, Y(250)); c.quadraticCurveTo((ta + tb) / 2, Y(330), tb - 3, Y(250)); c.stroke();
};

const drawWall = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(WALL.a - 100), X(TOWER_WALL.b + 100))) return;
  // (the merlons behind the wall walk; the curtain wall itself, in the play plane, its walk lit; the breach's slot)
  merlons(c, X(WALL.a), X(WALL.b), Y(WALL.top));
  stone(c, X(WALL.a), X(BREACH.a), Y(WALL.top), GY);
  stone(c, X(BREACH.b), X(WALL.b), Y(WALL.top), GY);
  // (the breach: rubble down its sides, the pillar)
  box(c, X(BREACH.a), Y(WALL.top), BREACH.b - BREACH.a, WALL.top, T('#3A3048', 0.25));
  for (let y = Y(WALL.top) + 10; y < GY; y += 26) { box(c, X(BREACH.a) - 6 + (y % 3) * 2, y, 10, 8, STONE[3]); box(c, X(BREACH.b) - 4 - (y % 3) * 2, y, 10, 8, STONE[3]); }
  stone(c, X(PILLAR.a), X(PILLAR.b), Y(WALL.top), GY);
  // (the hoardings over the walk, the machicolations' holes in them (hazards.ts draws the pour))
  hoarding(c, X(4880), X(5180), 480);
  hoarding(c, X(5620), X(5780), 520);
};

const drawTower = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(6250), X(TOWER_WALL.b + 900))) return;
  const f = state.frame;
  // (the tower's inside, dimmed: up out of the picture)
  stone(c, X(6300), X(TOWER_WALL.a), Y(1300), Y(WALL.top), true, 0.5);
  for (const [x, h] of [[6400, 420], [7000, 560], [7300, 900], [6700, 980]]) { box(c, X(x), Y(h), 18, 44, T(INK, 0.3)); box(c, X(x) + 2, Y(h) + 2, 14, 40, T('#FFE9A8', 0.4)); }
  for (const [x, h] of [[6330, 400], [6950, 520], [7460, 640], [7200, 860]]) torch(c, X(x), Y(h), f);
  banner(c, X(7150), Y(1000), 160, f);
  // (the landings, the gallery, the tower's right wall; lit tops)
  stone(c, X(LAND_B.a), X(LAND_B.b), Y(LAND_B.h), Y(LAND_B.h) + 20);
  stone(c, X(LAND_C.a), X(LAND_C.b), Y(LAND_C.h), Y(LAND_C.h) + 20);
  stone(c, X(GALLERY.a), X(GALLERY.b), Y(GALLERY.h), Y(GALLERY.h) + 24);
  stone(c, X(TOWER_WALL.a), X(TOWER_WALL.b), Y(GALLERY.h), Y(WALL.top));
  // (the hoarding over landing C, its hole)
  const hc = HOLES[HOLES.length - 1];
  hoarding(c, X(hc[0] - 70), X(hc[0] + 70), hc[1]);
  // (the steps down the far side, the tower's outside wall behind them)
  stone(c, X(TOWER_WALL.b), X(8420), Y(GALLERY.h + 120), GY, true, 0.5);
  for (const [a, b, h] of LEDGES) if (a >= 7600) stone(c, X(a), X(b), Y(h), Y(h) + 16);
};

const drawPostern = (c: Ctx, state: GameState) => {
  if (!onScreen(state, X(8300), X(RUNWAY + 300))) return;
  stone(c, X(8420), X(RUNWAY - 40), Y(300), GY, true, 0.45);
  merlons(c, X(8420), X(RUNWAY - 40), Y(300));
  // (the postern gate: an arch in the wall at the end, open)
  const g = X(8900);
  box(c, g - 2, Y(150), 84, 150, INK); box(c, g, Y(148), 80, 148, T('#9AC8F0', 0.2));
  c.fillStyle = INK; c.beginPath(); c.arc(g + 40, Y(148), 42, Math.PI, 0); c.fill();
  c.fillStyle = T('#9AC8F0', 0.2); c.beginPath(); c.arc(g + 40, Y(148), 40, Math.PI, 0); c.fill();
  torch(c, g - 20, Y(130), state.frame); torch(c, g + 100, Y(130), state.frame);
};

const drawBroomPort = (c: Ctx, state: GameState, done: boolean) => {
  if (!onScreen(state, X(RUNWAY - 100), X(DECK.b + 400))) return;
  const f = state.frame;
  // (the stands behind the deck: tiers of seats, a crowd of dots, pennants; dimmed)
  for (let r = 0; r < 5; r++) {
    const y = Y(60 + r * 34), col = T(r % 2 ? '#5A4A7A' : '#6A5A8C', 0.4);
    box(c, X(9500), y, DECK.b - 9500 - 200, 34, col);
    for (let x = X(9510) + (r % 2) * 7; x < X(DECK.b - 210); x += 14) if (hash(x * 3 + r) > 0.35) box(c, x, y + 8, 6, 8, T(['#F472B6', '#FDE68A', '#A8C8F0', '#F4F4F5'][Math.floor(hash(x + r) * 4)], 0.4));
  }
  for (let x = X(9520); x < X(DECK.b - 200); x += 160) { box(c, x, Y(260), 2, 30, T('#3A3448', 0.3)); c.fillStyle = T(['#D8609E', '#2E52A8', '#F6D365'][Math.floor(x / 160) % 3], 0.3); c.beginPath(); c.moveTo(x + 2, Y(260)); c.lineTo(x + 26, Y(252)); c.lineTo(x + 2, Y(244)); c.closePath(); c.fill(); }
  // (the scoreboard over the stands)
  box(c, X(10900) - 2, Y(330) - 2, 304, 84, INK); box(c, X(10900), Y(330), 300, 80, T('#1A1028', 0.2));
  // (wind socks on their poles, blowing)
  for (const x of [9420, 11300, 11750]) {
    box(c, X(x), Y(180), 3, 180, '#3A3448');
    const w = Math.sin(f * 0.05 + x) * 4;
    for (let k = 0; k < 4; k++) { c.fillStyle = k % 2 ? '#F4F4F5' : '#F97316'; c.beginPath(); c.moveTo(X(x) + 3 + k * 12, Y(180) + k * 1 + w * k * 0.2); c.lineTo(X(x) + 15 + k * 12, Y(180) + 2 + k + w * (k + 1) * 0.2); c.lineTo(X(x) + 15 + k * 12, Y(166) - k + w * (k + 1) * 0.2); c.lineTo(X(x) + 3 + k * 12, Y(166) - k * 1 + w * k * 0.2); c.closePath(); c.fill(); }
  }
  // (the broom racks: full of brooms till the trial's flown; bare after)
  for (const x of [9300, 11500]) {
    box(c, X(x), Y(90), 120, 6, '#5A3A1E'); box(c, X(x), Y(30), 120, 6, '#5A3A1E');
    for (const dx of [0, 114]) box(c, X(x) + dx, Y(96), 6, 96, '#5A3A1E');
    if (!done) for (let k = 0; k < 6; k++) { const bx = X(x) + 12 + k * 18; box(c, bx, Y(110), 3, 90, '#8A5A30'); c.fillStyle = '#D8B060'; c.beginPath(); c.moveTo(bx - 5, Y(20)); c.lineTo(bx + 8, Y(20)); c.lineTo(bx + 4, Y(40)); c.lineTo(bx - 1, Y(40)); c.closePath(); c.fill(); }
  }
};

/** The ground: flagstones (cobbles out front), the deck's planks and its painted lines out on the runway; lit along the
 *  top (he stands on it). */
const drawGround = (c: Ctx, state: GameState) => {
  const L = Math.max(state.camera.x - 40, X(-200)), R = state.camera.x + CANVAS_WIDTH + 40;
  const runs: [number, number][] = [[-200, MOAT.a], [MOAT.b, DECK.a], [DECK.a, DECK.b + 400]];
  runs.forEach(([a, b], i) => {
    const xa = Math.max(L, X(a)), xb = Math.min(R, X(b));
    if (xb <= xa) return;
    const deck = i === 2;
    box(c, xa, GY, xb - xa, 600, deck ? '#6A4A2A' : '#7A6E8E');
    for (let x = Math.floor(xa / 40) * 40; x < xb; x += 40) box(c, x, GY + 2, 1, 18, deck ? '#4A3018' : '#5E5278');
    box(c, xa, GY + 20, xb - xa, 1, deck ? '#4A3018' : '#5E5278');
    if (deck) for (let x = Math.floor(xa / 80) * 80; x < xb; x += 80) box(c, x, GY + 8, 40, 3, '#F4F4F5');
    box(c, xa, GY, xb - xa, 3, '#F6E7C0');
  });
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. `piper`: the horn (x) she's talking out of, if she is; `runwayTalk`: she's talking
 *  out of the broom port's. */
export const drawKeepBack = (c: Ctx, state: GameState, piperX: number | null, runwayTalk: boolean, done: boolean) => {
  const f = state.frame;
  drawApproach(c, state);
  drawGatehouse(c, state);
  drawCourtyard(c, state);
  drawWall(c, state);
  drawTower(c, state);
  drawPostern(c, state);
  drawBroomPort(c, state, done);
  drawGround(c, state);
  for (const [x, h] of PA_AT) if (onScreen(state, X(x) - 60, X(x) + 80)) paHorn(c, X(x), x >= 6000 && x < 7600 ? WALL.top : 0, h, piperX === X(x), f);
  if (onScreen(state, X(SCENE.horn.x) - 60, X(SCENE.horn.x) + 80)) paHorn(c, X(SCENE.horn.x), 0, SCENE.horn.h, runwayTalk, f);
  // (the signs, on their posts)
  const signs: [number, number, string[], object?][] = [
    [460, 0, ["THE GREAT PIXIE'S CASTLE", 'STAFF AND SUITORS ONLY']],
    [640, 0, ['THE MOAT', 'DRAINED FOR CLEANING'], { warn: true }],
    [1560, 0, ['YE OLDE GIFT SHOPPE', 'TIARAS $40']],
    [(BOUTIQUE.a + BOUTIQUE.b) / 2 - 30, 0, ['PRINCESS MAKEOVER', 'BOUTIQUE'], { tall: 270, board: '#9A2A6A' }],
    [3960, 0, ['THE ROYAL ROSE GARDEN', 'DO NOT PICK THE ROSES']],
    [6200, WALL.top, ['THE TOWER STAIRS', 'MIND THE MOVING STEPS']],
    [8480, 0, ['THE POSTERN GATE', 'TO THE BROOM PORT >']],
    [9230, 0, done ? ['THE BROOM PORT', 'NO FLIGHTS TODAY'] : ['THE BROOM PORT', 'FINAL TRIAL TODAY'], { board: '#6E0E1C' }],
    [10720, 0, ['FASTPASS', 'SUITORS ONLY'], { board: '#3B0764' }],
  ];
  for (const [x, h, words, o] of signs) if (onScreen(state, X(x) - 170, X(x) + 170)) storySign(c, X(x), Y(h), words, o as { warn?: boolean });
};

/** The lamps after dark: torches, the boutique's window, the broom port's landing lights. */
export const keepLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  const at: [number, number, string][] = [[1340, 110, '#FDBA74'], [1900, 110, '#FDBA74'], [2460, 110, '#FDBA74'], [3360, 90, '#F9A8D4'], [3620, 120, '#FDBA74'], [6950, 520, '#FDBA74'], [7200, 860, '#FDBA74'], [8900, 130, '#FDBA74'], [9600, 20, '#FDE68A'], [10400, 20, '#FDE68A'], [11200, 20, '#FDE68A']];
  for (const [x, h, col] of at) if (onScreen(state, X(x) - 200, X(x) + 200)) out.push({ x: X(x), y: Y(h), r: 120, a: 0.45, color: col });
  return out;
};
