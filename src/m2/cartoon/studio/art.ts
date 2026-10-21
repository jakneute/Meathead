// LEARN THE MAGIC OF HOW CARTOONS ARE MADE, painted (the SNES pass). One long building cut away along its back: the
// path in front (theater carpet, a lit lip, little blue aisle lights along it), behind a velvet rope the rooms as
// dioramas going back to their back walls, every room's walls, floor and drop ceiling drawn to the one eye (the middle
// of the screen: straight walls, one shared eye, the far things smaller and nearer the middle; back to front, nothing
// deeper drawn over anything nearer), culled by where they land on screen. Each room's tableau (rooms.ts): its back
// wall, then the people and things in it; the engine's lighting does the rest (each room dim till he walks in, then
// soft fills come up on it: studioLights below, never a spotlight; the troffers in its ceiling come on with it).
//
// On the path, bright and inked, everything he stands on lit along its top: the flat file, the drafting table, the
// rolling storyboard wall and the box of pencils; the drying rack's track and its cel; the light tables at the reject
// pile's ends and the STACKS OF DRAWINGS in it (the land's towers, sway.ts, in paper: reams and bundles, rubber bands,
// scene labels); the paint vat and the cels on their overhead track; the camera crane and its seat, the wall of film
// cans and the crate; the projection screen at the end (in front of him once he's in behind it: his shadow on it).
// What the staff throw (coffee, souvenir plates) and the puddles the coffee leaves. The PA's horns on the ceiling
// (buzzing while it's on).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { px, ball, limb } from '../../spooky/costume';
import type { Tower } from '../sway';
import { GY } from '../geometry';
import { studioOf } from './state';
import { moverAt, paintAt } from './props';
import {
  ROOMS, CEIL, CEIL_H, D_BACK, D_PROPS, D_RAIL, REJECTS, VAT, GROUND, FLATFILE, STORYWALL, PENCILBOX, DRAFTING, SHELF,
  NEAR_DESK, FAR_DESK, FILMCANS, CRATE, MOVERS, TRACK_H, SCREEN, X, Y, type Room,
} from './layout';
import {
  box, mix, hash, INK, checker, type Ctx, slab, bands, lip, PRINT, txt, R6, PANEL, CORK, PAPER, STEEL, CHARCOAL, CHROME,
  GOLD, VELVET, LIP, PURPLE, TEAL,
} from './paint';
import { socks, drawDave, drawArtDirector, steam } from './people';
import {
  SHELLS, BACKS, PROPS, backKey, park, drawWritersLive, drawVoiceLive, OVERSEAS_ROWS, lightTable, nightShift, paintBanner,
  PROMO, paintPromo, drawPromoBulbs, paintPaparazzi, drawPaparazziLive, placardX, placardW, paintPlacard, paintMarquee,
  MARQUEE,
} from './rooms';
import { NEAR, D_NEAR, drawClutterLive } from './clutter';
import { grossSocks, grossChelsea, grossBack } from './gross';

// ---------------------------------------------------------------------------------------------------------------
// The eye

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
/** Draws `fn` (in world coordinates) pushed back to depth s about the eye. */
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
/** Does world x0..x1 at depth s land on screen? */
const seen = (state: GameState, E: P, x0: number, x1: number, s: number, m = 40) => { const a = proj(E, x0, 0, s).x, b = proj(E, x1, 0, s).x; return b > state.camera.x - m && a < state.camera.x + CANVAS_WIDTH + m; };
const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };
/** A strip of a horizontal plane at height y, between x0..x1 and depths d0..d1. */
const strip = (c: Ctx, E: P, x0: number, x1: number, y: number, d0: number, d1: number, fill: string) => quad(c, [proj(E, x0, y, d0), proj(E, x1, y, d0), proj(E, x1, y, d1), proj(E, x0, y, d1)], fill);

// ---------------------------------------------------------------------------------------------------------------
// The rooms' shells: the drop ceiling going back (tiles on a T-bar grid, the troffers in it lit with the room), the
// floor going back (each room's own: carpet tile, linoleum, rubber, concrete, the red carpet), the partitions

const CEIL_DS = [D_BACK, 0.82, 0.86, 0.9, 0.94, 0.97, 1];
const shellBack = (c: Ctx, E: P, r: Room, lit: number) => {
  const S = SHELLS[r.id], a = X(r.a), b = X(r.b);
  // (the ceiling: rows of tiles, darker toward the back, the T-bar grid between)
  for (let i = 0; i < CEIL_DS.length - 1; i++) strip(c, E, a, b, CEIL, CEIL_DS[i], CEIL_DS[i + 1], S.ceil[i < 2 ? 2 : i < 4 ? 3 : 4]);
  c.strokeStyle = S.ceil[1]; c.lineWidth = 1;
  for (const d of CEIL_DS.slice(1, -1)) { const p0 = proj(E, a, CEIL, d), p1 = proj(E, b, CEIL, d); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  for (let x = r.a + 60; x < r.b; x += 60) { const p0 = proj(E, X(x), CEIL, D_BACK), p1 = proj(E, X(x), CEIL, 1); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
  // (the troffers: a pair of tiles in every few, their diffusers lit when the room is)
  if (r.id !== 'camera' && r.id !== 'premiere' && r.id !== 'voice') {
    const on = lit > 0.5, fill = on ? '#F2FFF6' : mix(S.ceil[2], '#8A9890', 0.4), rim = on ? '#C8F0DA' : S.ceil[1];
    for (let x = r.a + 120; x < r.b - 60; x += 240) for (const [d0, d1] of [[0.86, 0.9], [0.94, 0.97]]) {
      strip(c, E, X(x), X(x + 60), CEIL, d0, d1, rim);
      strip(c, E, X(x + 4), X(x + 56), CEIL, d0 + 0.006, d1 - 0.006, fill);
    }
  }
  // (the floor in the room, going back to the rope)
  const F = S.floor, kind = S.floorKind;
  strip(c, E, a, b, GY, D_BACK, D_RAIL, F[3]);
  if (kind === 'lino') {
    const ds = [D_BACK, 0.8, 0.825, 0.85, 0.875, 0.9, 0.925, D_RAIL];
    for (let i = 0; i < ds.length - 1; i++) for (let x = r.a, k = 0; x < r.b; x += 50, k++) if ((k + i) % 2) strip(c, E, X(x), X(Math.min(r.b, x + 50)), GY, ds[i], ds[i + 1], F[2]);
  } else if (kind === 'red') {
    strip(c, E, a, b, GY, D_BACK, D_RAIL, VELVET[3]);
    strip(c, E, a, b, GY, 0.9, 0.91, GOLD[4]);
  } else {
    c.strokeStyle = kind === 'rubber' ? F[1] : F[2]; c.lineWidth = 1;
    for (const d of kind === 'rubber' ? [0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94] : [0.82, 0.86, 0.9]) { const p0 = proj(E, a, GY, d), p1 = proj(E, b, GY, d); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
    if (kind === 'carpet') for (let x = r.a + 100; x < r.b; x += 100) { const p0 = proj(E, X(x), GY, D_BACK), p1 = proj(E, X(x), GY, D_RAIL); c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke(); }
    if (kind === 'concrete') for (let i = 0; i < 6; i++) { const p = proj(E, X(r.a + 80 + i * 160), GY, 0.84 + (i % 3) * 0.03); c.fillStyle = ['rgba(220,38,38,0.35)', 'rgba(37,99,235,0.3)', 'rgba(250,204,21,0.35)'][i % 3]; c.beginPath(); c.ellipse(p.x, p.y, 10, 2.5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // (the shadow along the back wall's foot, in two steps)
  strip(c, E, a, b, GY, D_BACK, 0.795, 'rgba(10,6,20,0.45)'); strip(c, E, a, b, GY, 0.795, 0.81, 'rgba(10,6,20,0.2)');
};
/** A partition between two rooms at world x (from depth d0 to d1), the face toward the eye in the color of the room it
 *  faces: stepped bands going back, a baseboard, a door frame's trim at the near end. */
const partition = (c: Ctx, E: P, x: number, d0: number, d1: number, faces: Room) => {
  const W = SHELLS[faces.id].wall, n = 4;
  for (let i = 0; i < n; i++) {
    const a = d0 + ((d1 - d0) * i) / n, b = d0 + ((d1 - d0) * (i + 1)) / n;
    quad(c, [proj(E, x, CEIL, a), proj(E, x, GY, a), proj(E, x, GY, b), proj(E, x, CEIL, b)], W[1 + Math.min(2, Math.floor(((b - D_BACK) / (1 - D_BACK)) * 3))]);
  }
  const t0 = proj(E, x, GY - 14, d0), t1 = proj(E, x, GY - 14, d1), b0 = proj(E, x, GY, d0), b1 = proj(E, x, GY, d1);
  c.fillStyle = W[0]; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.lineTo(b1.x, b1.y); c.lineTo(b0.x, b0.y); c.closePath(); c.fill();
  c.strokeStyle = W[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t1.x, t1.y); c.stroke();
  // (the edge's trim, where it ends nearest the eye)
  if (d1 >= D_RAIL - 0.001) { const e0 = proj(E, x, CEIL, d1), e1 = proj(E, x, GY, d1); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(e0.x, e0.y); c.lineTo(e1.x, e1.y); c.stroke(); c.strokeStyle = W[4]; c.lineWidth = 1; c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The play plane

/** The theater carpet along the path (a 1994 multiplex's: purple, teal squiggles, gold confetti): one tile, repeated. */
let carpet: CanvasPattern | null = null;
const carpetOf = (c: Ctx) => {
  if (carpet || typeof document === 'undefined') return carpet;
  const t = document.createElement('canvas'); t.width = 64; t.height = 32;
  const g = t.getContext('2d')!;
  g.fillStyle = PURPLE[1]; g.fillRect(0, 0, 64, 32);
  checker(g, 0, 0, 64, 32, PURPLE[0], 0, 2);
  g.strokeStyle = TEAL[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(4, 8); g.quadraticCurveTo(12, 0, 20, 8); g.quadraticCurveTo(28, 16, 36, 8); g.stroke();
  g.strokeStyle = '#C8306E'; g.beginPath(); g.moveTo(34, 26); g.quadraticCurveTo(42, 18, 50, 26); g.quadraticCurveTo(56, 32, 62, 24); g.stroke();
  for (const [x, y, col] of [[44, 6, '#F2C84A'], [12, 22, '#F2C84A'], [26, 26, TEAL[4]], [56, 14, '#C8306E'], [6, 14, '#F2C84A']] as [number, number, string][]) { g.fillStyle = col; g.fillRect(x, y, 3, 3); }
  carpet = c.createPattern(t, 'repeat');
  return carpet;
};
const drawPath = (c: Ctx, state: GameState) => {
  for (const [ga, gb] of GROUND) {
    const a = Math.max(X(ga), state.camera.x - 20), b = Math.min(X(gb), state.camera.x + CANVAS_WIDTH + 20);
    if (b <= a) continue;
    const pat = carpetOf(c);
    c.fillStyle = pat ?? PURPLE[1]; c.fillRect(a, GY, b - a, 400);
    // (deeper down, darker: banded off into the dark under the path)
    box(c, a, GY + 60, b - a, 340, 'rgba(8,4,18,0.35)'); checker(c, a, GY + 56, b - a, 4, 'rgba(8,4,18,0.35)', 0, 2);
    box(c, a, GY + 120, b - a, 280, 'rgba(8,4,18,0.35)'); checker(c, a, GY + 116, b - a, 4, 'rgba(8,4,18,0.35)', 1, 2);
    // (the brass nosing along its front, lit)
    lip(c, a, GY, b - a);
    // (the red carpet in the premiere room: gold edged)
    const pa = Math.max(a, X(9200));
    if (b > pa) { box(c, pa, GY + 4, b - pa, 28, VELVET[3]); box(c, pa, GY + 4, b - pa, 2, VELVET[5]); checker(c, pa, GY + 26, b - pa, 6, VELVET[1], 0, 1); box(c, pa, GY + 32, b - pa, 2, GOLD[4]); }
    for (let x = Math.ceil((a - X(0)) / 160) * 160; X(x) < b; x += 160) { box(c, X(x) - 4, GY + 6, 8, 5, INK); box(c, X(x) - 3, GY + 7, 6, 3, '#1E3A8A'); box(c, X(x) - 2, GY + 7, 4, 2, '#93C5FD'); }
  }
};

const playProps = (c0: Ctx, state: GameState) => {
  const on = (a: number, b: number) => X(b) > state.camera.x - 80 && X(a) < state.camera.x + CANVAS_WIDTH + 80;
  if (on(FLATFILE.a, PENCILBOX.b)) stamp(c0, 'ct-st2-pp-story', X(FLATFILE.a) - 10, Y(STORYWALL.h) - 6, PENCILBOX.b - FLATFILE.a + 20, STORYWALL.h + 10, c => {
    // (the flat file: a steel cabinet of wide shallow drawers, label slots, pulls)
    const fa = X(FLATFILE.a), fw = FLATFILE.b - FLATFILE.a;
    slab(c, fa, Y(FLATFILE.h), fw, FLATFILE.h, STEEL);
    for (let i = 0; i < 5; i++) { const dy = Y(FLATFILE.h) + 8 + i * 19; box(c, fa + 4, dy, fw - 8, 16, STEEL[2]); box(c, fa + 4, dy, fw - 8, 1, STEEL[4]); box(c, fa + 4, dy + 15, fw - 8, 1, STEEL[0]); slab(c, fa + 38, dy + 6, 24, 4, CHROME); box(c, fa + 10, dy + 4, 18, 7, PAPER[4]); }
    lip(c, fa, Y(FLATFILE.h), fw);
    // (the drafting table: a white top on a steel stand, a parallel bar across it, a sheet taped down)
    const da = X(DRAFTING.a), dw = DRAFTING.b - DRAFTING.a;
    limb(c, da + 10, Y(DRAFTING.h) + 10, X(DRAFTING.b) - 14, GY, 4, STEEL[3]); limb(c, X(DRAFTING.b) - 10, Y(DRAFTING.h) + 10, da + 14, GY, 4, STEEL[3]);
    slab(c, da, Y(DRAFTING.h), dw, 10, PAPER);
    box(c, da + 4, Y(DRAFTING.h) + 3, dw - 8, 2, STEEL[3]);
    lip(c, da, Y(DRAFTING.h), dw);
    // (the rolling storyboard wall: two cork panels in an oak frame on casters, panels pinned to it, too tall to jump)
    const wa = X(STORYWALL.a), ww = STORYWALL.b - STORYWALL.a, wt = Y(STORYWALL.h);
    slab(c, wa, wt, ww, STORYWALL.h - 14, PANEL);
    box(c, wa + 5, wt + 12, ww - 10, STORYWALL.h - 34, CORK[3]); checker(c, wa + 5, wt + 12, ww - 10, STORYWALL.h - 34, CORK[2], 0, 2);
    box(c, wa + 5, wt + 12 + (STORYWALL.h - 34) / 2, ww - 10, 3, PANEL[1]);
    for (let i = 0; i < 6; i++) { const px0 = wa + 8 + (i % 2) * 34, py0 = wt + 18 + Math.floor(i / 2) * 64; box(c, px0 - 1, py0 - 1, 30, 24, INK); box(c, px0, py0, 28, 22, PAPER[4]); c.strokeStyle = '#334155'; c.lineWidth = 1; c.beginPath(); c.arc(px0 + 14, py0 + 10, 4, 0, Math.PI * 2); c.moveTo(px0 + 14, py0 + 14); c.lineTo(px0 + 14, py0 + 20); c.stroke(); box(c, px0 + 12, py0 - 2, 4, 4, '#DC2626'); }
    for (const cx of [wa + 12, wa + ww - 12]) { limb(c, cx, GY - 14, cx, GY - 8, 3, STEEL[3]); ball(c, cx, GY - 6, 6, '#27272A', 1.2); px(c, cx - 2, GY - 8, 2, 2, STEEL[4]); }
    slab(c, wa - 3, wt, ww + 6, 10, PANEL);
    lip(c, wa - 3, wt, ww + 6);
    // (the box of pencils: a giant cardboard case, NO. 2, the end flap open, pencils poking out)
    const pa = X(PENCILBOX.a), pw = PENCILBOX.b - PENCILBOX.a, pt = Y(PENCILBOX.h);
    slab(c, pa, pt, pw, PENCILBOX.h, R6('#E2B04A'));
    box(c, pa + 2, pt + 12, pw - 4, 18, '#1E7A3A'); box(c, pa + 2, pt + 12, pw - 4, 2, '#3AAA5A');
    txt(c, 'BIG CHIEF', pa + pw / 2, pt + 25, PRINT('#FDE68A'));
    txt(c, 'PENCILS', pa + pw / 2, pt + 46, PRINT('#3B2A10'));
    txt(c, 'NO. 2', pa + pw / 2, pt + 60, { sx: 2, sy: 2, fill: '#3B2A10', gap: 1 });
    txt(c, 'X 10,000', pa + pw / 2, pt + 82, PRINT('#3B2A10'));
    for (let i = 0; i < 5; i++) { const ty = pt + 92 + (i % 2) * 2; box(c, pa + 4 + i * 15, ty - 1, 12, 2, INK); }
    lip(c, pa, pt, pw);
  });
  // (the maquette shelf on its brackets: Socks figures in a row)
  if (on(SHELF.a, SHELF.b)) stamp(c0, 'ct-st2-pp-shelf', X(SHELF.a) - 4, Y(SHELF.h) - 40, SHELF.b - SHELF.a + 12, SHELF.h + 42, c => {
    const sa = X(SHELF.a), sw = SHELF.b - SHELF.a, st = Y(SHELF.h);
    for (const bx of [SHELF.a + 16, SHELF.b - 20]) { limb(c, X(bx), st + 12, X(bx) + 4, st + 50, 4, STEEL[3]); }
    slab(c, X(SHELF.b) - 6, st + 12, 6, SHELF.h - 12, STEEL);
    slab(c, sa, st, sw, 12, R6('#8B6B4A'));
    lip(c, sa, st, sw);
    socks(c, sa + 14, st - 1, 0.32, 0); socks(c, sa + 124, st - 1, 0.32, 1);
  });
  // (the light tables at the pile's ends: steel legs, the glowing top lit along its edge)
  for (const d of [NEAR_DESK, FAR_DESK]) if (on(d.a, d.b)) stamp(c0, `ct-st2-pp-desk-${d.a}`, X(d.a) - 4, Y(d.h) - 4, d.b - d.a + 8, d.h + 50, c => {
    const top = Y(d.h), w = d.b - d.a;
    for (const lx of [d.a + 8, d.b - 14]) slab(c, X(lx), top + 14, 6, GY - top + 40, STEEL);
    box(c, X(d.a) + 8, top + 60, w - 16, 4, STEEL[2]);
    slab(c, X(d.a), top, w, 14, R6('#C9C4AE'));
    box(c, X(d.a) + 6, top + 3, w - 12, 7, '#FFF8DA'); box(c, X(d.a) + 6, top + 3, (w - 12) * 0.5, 7, '#FFFDF0');
    lip(c, X(d.a), top, w);
  });
  // (the wall of film cans: round silver cans stacked, labeled; the crate)
  if (on(FILMCANS.a - 160, CRATE.b)) stamp(c0, 'ct-st2-pp-cans', X(FILMCANS.a) - 8, Y(FILMCANS.h) - 6, CRATE.b - FILMCANS.a + 16, FILMCANS.h + 10, c => {
    const fa = X(FILMCANS.a), fw = FILMCANS.b - FILMCANS.a;
    for (let i = 0; i < 14; i++) {
      const y = GY - 20 - i * 20, ox = i % 2 ? 2 : -2;
      c.fillStyle = INK; c.beginPath(); c.roundRect(fa + ox - 1, y - 1, fw + 2, 22, 7); c.fill();
      c.fillStyle = CHROME[3]; c.beginPath(); c.roundRect(fa + ox, y, fw, 20, 6); c.fill();
      box(c, fa + ox + 4, y + 2, fw - 8, 2, CHROME[5]); box(c, fa + ox + 4, y + 15, fw - 8, 3, CHROME[1]); box(c, fa + ox + fw - 10, y + 3, 6, 13, CHROME[2]);
      box(c, fa + 28, y + 6, 44, 9, PAPER[5]); box(c, fa + 28, y + 6, 44, 1, '#FFFFFF');
      txt(c, `EP ${(i % 13) + 1}`, fa + 50, y + 13, PRINT('#1F2937'));
    }
    lip(c, fa, Y(FILMCANS.h), fw);
    const ca = X(CRATE.a), cw = CRATE.b - CRATE.a, ct = Y(CRATE.h);
    slab(c, ca, ct, cw, CRATE.h, R6('#A47148'));
    for (let k = 0; k < 4; k++) box(c, ca + 3, ct + 8 + k * 36, cw - 6, 1, '#7A4F2A');
    limb(c, ca + 6, ct + 6, ca + cw - 6, GY - 6, 4, '#7A4F2A', false); limb(c, ca + cw - 6, ct + 6, ca + 6, GY - 6, 4, '#7A4F2A', false);
    slab(c, ca + 10, ct + 22, cw - 20, 18, PAPER); txt(c, 'FRAGILE', ca + cw / 2, ct + 34, PRINT('#7F1D1D'));
    txt(c, 'THIS SIDE UP', ca + cw / 2, ct + 60, PRINT('#3B2A10'));
    lip(c, ca, ct, cw);
  });
};

/** The reject pile (crumpled drawings heaped in a trough) and the paint vat (three runs of color, stirring), behind. */
const pitsBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const [ra, rb] = REJECTS;
  if (X(rb) > state.camera.x - 40 && X(ra) < state.camera.x + CANVAS_WIDTH + 40) {
    bands(c, X(ra), GY + 4, rb - ra, 400, [PAPER[2], PAPER[1], PAPER[0], '#5E584C', '#3A362E']);
    stamp(c, 'ct-st2-rejects', X(ra) - 8, GY - 8, rb - ra + 16, 76, g => {
      for (let row = 0; row < 3; row++) for (let x = ra + 8; x < rb - 4; x += 16) {
        const k = hash(x * 3.1 + row), cx = X(x + (row % 2) * 8), cy = GY + 10 + row * 14 - k * 4, rr = 8 + k * 3;
        const R = row === 0 ? PAPER : R6(['#F5F0E1', '#ECE6D6', '#FDF6E3'][(x / 16 + row) % 3 | 0]);
        g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, rr + 1, 0, Math.PI * 2); g.fill();
        g.fillStyle = R[2]; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill();
        g.fillStyle = R[4]; g.beginPath(); g.arc(cx - 2, cy - 2, rr * 0.65, 0, Math.PI * 2); g.fill();
        // (the crumples: creases in it, a drawing's line showing)
        g.strokeStyle = R[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - rr * 0.5, cy - 1); g.lineTo(cx, cy + rr * 0.3); g.lineTo(cx + rr * 0.4, cy - rr * 0.3); g.stroke();
        if (k > 0.6) { g.strokeStyle = '#64748B'; g.beginPath(); g.arc(cx - 1, cy - 1, 3, 0, 4); g.stroke(); }
        if (k < 0.12) { g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(cx - 4, cy - 4); g.lineTo(cx + 4, cy + 4); g.moveTo(cx + 4, cy - 4); g.lineTo(cx - 4, cy + 4); g.stroke(); }
      }
      for (const ex of [X(ra) - 6, X(rb)]) slab(g, ex, GY - 4, 6, 70, STEEL);
    });
  }
  const [va, vb] = VAT;
  if (X(vb) > state.camera.x - 40 && X(va) < state.camera.x + CANVAS_WIDTH + 40) {
    box(c, X(va), GY + 8, vb - va, 400, '#18181B');
    for (let x = va; x < vb; x += 4) {
      const col = paintAt(X(x)), R = R6(col), y = GY + 10 + Math.sin(x * 0.05 + f * 0.04) * 2;
      box(c, X(x), y, 4, 8, R[3]); box(c, X(x), y + 8, 4, 14, R[2]); box(c, X(x), y + 22, 4, 40, R[1]);
      if ((x + (f >> 2)) % 24 === 0) box(c, X(x), y + 2, 8, 2, R[5]);
      if ((x * 7 + (f >> 3)) % 40 === 0) box(c, X(x), y + 1, 2, 1, '#FFFFFF');
    }
    checker(c, X(va), GY + 16, vb - va, 2, 'rgba(0,0,0,0.3)', 0, 1);
    // (the stirring paddles, turning slowly)
    for (let i = 0; i < 3; i++) {
      const cx = X(va + (i + 0.5) * ((vb - va) / 3)), a = f * 0.02 + i * 2;
      limb(c, cx, GY - 70, cx + Math.cos(a) * 6, GY + 14, 3, STEEL[3]);
    }
    for (const ex of [X(va) - 8, X(vb)]) slab(c, ex, GY - 8, 8, 70, CHROME);
  }
};
/** In front: the pile's near lip of crumpled balls (over his feet as he sinks), the vat's front rim. */
const pitsFront = (c: Ctx, state: GameState) => {
  const [ra, rb] = REJECTS;
  if (X(rb) > state.camera.x - 40 && X(ra) < state.camera.x + CANVAS_WIDTH + 40) {
    stamp(c, 'ct-st2-rejects-lip', X(ra), GY + 2, rb - ra, 32, g => {
      for (let x = ra + 6; x < rb - 4; x += 13) {
        const k = hash(x * 1.7), cx = X(x), cy = GY + 18 - k * 3, rr = 7 + k * 2;
        g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, rr + 1, 0, Math.PI * 2); g.fill();
        g.fillStyle = PAPER[3]; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill();
        g.fillStyle = PAPER[5]; g.beginPath(); g.arc(cx - 2, cy - 2, rr * 0.55, 0, Math.PI * 2); g.fill();
        g.strokeStyle = PAPER[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 3, cy); g.lineTo(cx + 1, cy + 3); g.lineTo(cx + 4, cy - 2); g.stroke();
      }
    });
  }
  const [va, vb] = VAT;
  if (X(vb) > state.camera.x - 40 && X(va) < state.camera.x + CANVAS_WIDTH + 40) {
    slab(c, X(va) - 8, GY + 16, vb - va + 16, 14, CHROME);
    for (let x = va + 30; x < vb; x += 80) { box(c, X(x), GY + 19, 3, 3, CHROME[1]); box(c, X(x), GY + 19, 1, 1, CHROME[5]); }
    slab(c, X((va + vb) / 2) - 60, GY + 17, 120, 11, PAPER, false); txt(c, 'CEL VINYL PAINT', X((va + vb) / 2), GY + 26, PRINT('#1F2937'));
    // (the drips down the rim)
    for (let i = 0; i < 9; i++) { const x = X(va + 20 + i * 56), col = paintAt(x); box(c, x, GY + 16, 3, 4 + (i % 3) * 3, col); }
  }
};

/** The stacks of drawings (the land's towers, in paper): reams and bundles along the bending spine, rubber bands and
 *  twine, a scene label here and there, a flat board on top (lit along its top: stand on it), rising out of the pile. */
const drawStacks = (c: Ctx, state: GameState, list: Tower[]) => {
  for (const t of list) {
    const d = t.d, top = { x: d.x + Math.sin(t.ang) * d.h, y: d.y - Math.cos(t.ang) * d.h }, half = (d.w ?? 96) / 2;
    if (Math.max(d.x, top.x) + half + 40 < state.camera.x || Math.min(d.x, top.x) - half - 40 > state.camera.x + CANVAS_WIDTH) continue;
    const n = Math.max(4, Math.round(d.h / 30));
    const at = (u: number) => ({ x: d.x + Math.sin(t.ang) * d.h * Math.pow(u, 1.6), y: d.y - d.h * u * (1 - (1 - Math.cos(t.ang)) * u), a: t.ang * Math.pow(u, 1.6) });
    for (let i = 0; i < n; i++) {
      const p0 = at(i / n), p1 = at((i + 1) / n), k = hash(d.x * 0.01 + i);
      const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2, hh = Math.hypot(p1.x - p0.x, p1.y - p0.y) + 1.5;
      const ww = Math.round(58 + k * 16 - i * 1.2);
      c.save(); c.translate(cx + (k - 0.5) * 6, cy); c.rotate((p0.a + p1.a) / 2 + (k - 0.5) * 0.08);
      // (a ream: a stepped block of sheets, each edge a line, lit on top and left, shaded right; a few sheets sticking out)
      const R = R6(['#FFFFFF', '#F5F0E1', '#FDF6E3', '#EDE7D6'][i % 4]);
      box(c, -ww / 2 - 1, -hh / 2 - 1, ww + 2, hh + 2, INK);
      box(c, -ww / 2, -hh / 2, ww, hh, R[3]);
      for (let s = -hh / 2 + 2; s < hh / 2 - 1; s += 3) box(c, -ww / 2 + 1, s, ww - 2, 1, R[2]);
      box(c, -ww / 2, -hh / 2, 3, hh, R[4]); box(c, ww / 2 - 4, -hh / 2, 4, hh, R[1]); box(c, -ww / 2, -hh / 2, ww, 1, R[5]);
      if (k > 0.55) { box(c, ww / 2 - 2, -hh / 2 + 4, 6, 2, INK); box(c, ww / 2 - 2, -hh / 2 + 4, 5, 1, R[4]); }
      if (k < 0.3) { box(c, -ww / 2 - 4, hh / 2 - 6, 6, 2, INK); box(c, -ww / 2 - 3, hh / 2 - 6, 5, 1, R[4]); }
      // (a rubber band, or twine, round it; a label on some)
      if (i % 2) { box(c, -ww / 2 + ww * 0.3 - 1, -hh / 2, 6, hh, INK); box(c, -ww / 2 + ww * 0.3, -hh / 2, 4, hh, '#B45309'); box(c, -ww / 2 + ww * 0.3, -hh / 2, 1, hh, '#E08A3A'); }
      else { box(c, -ww / 2, -2, ww, 3, INK); box(c, -ww / 2, -1, ww, 1, '#C8A06A'); }
      if (i % 3 === 1) { slab(c, 4, -hh / 2 + 3, 24, 10, R6('#FEF08A'), true); txt(c, `SC ${(i * 7 + Math.round(d.x / 10)) % 40 + 1}`, 16, -hh / 2 + 11, PRINT('#1F2937')); }
      c.restore();
    }
    // (the board on top, tilting a little with the lean, its top lit)
    c.save(); c.translate(top.x, top.y); c.rotate(t.ang * 0.3);
    slab(c, -half, 0, half * 2, 12, R6('#8B6B4A'));
    box(c, -half + 2, 0, half * 2 - 4, 3, LIP[2]); box(c, -half + 2, 0, half * 2 - 4, 1, LIP[3]);
    txt(c, 'DRAWINGS', 0, 10, PRINT('#3B2A10'));
    c.restore();
    // (the tell: wobble lines off it, sheets fluttering loose off the top)
    if (Math.abs(t.vel) > 0.004) {
      c.strokeStyle = INK; c.lineWidth = 2; c.lineCap = 'round';
      const m = at(0.6), side = t.vel > 0 ? -1 : 1;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.arc(m.x + side * (34 + k * 8), m.y, 8 + k * 6, side > 0 ? -0.6 : Math.PI - 0.6, side > 0 ? 0.6 : Math.PI + 0.6); c.stroke(); }
      c.lineCap = 'butt';
      if (state.frame % 9 === 0) state.particles.push({ pos: { x: top.x + (Math.random() - 0.5) * half * 2, y: top.y - 2 }, vel: { x: -side * 1.4, y: -0.6 }, life: 40, color: '#FFFFFF', size: 3 });
    }
  }
};

/** The movers: the overhead tracks, the cels on their trolleys (a painted Socks on each), the crane. */
const drawMovers = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const d of MOVERS) {
    const at = moverAt(d, f), half = d.w / 2;
    if (at.x + 200 < state.camera.x || at.x - 200 > state.camera.x + CANVAS_WIDTH) continue;
    if (d.id === 'crane') {
      // (the dolly on the floor, its column, the boom from its pivot out to the seat; a counterweight; the seat's deck)
      const bx = X(8615), py = Y(170);
      slab(c, bx - 32, GY - 24, 64, 20, CHARCOAL);
      for (const wx of [bx - 22, bx + 22]) { ball(c, wx, GY - 6, 7, '#18181B', 1.2); ball(c, wx, GY - 6, 2.5, CHROME[3], 0); }
      slab(c, bx - 6, py, 12, GY - 24 - py, STEEL);
      for (let y = py + 10; y < GY - 30; y += 18) box(c, bx - 3, y, 6, 1, STEEL[1]);
      const ex = at.x - half + 6, ey = at.y + 6, ang = Math.atan2(ey - py, ex - bx);
      limb(c, bx - Math.cos(ang) * 50, py - Math.sin(ang) * 50, ex, ey, 8, CHROME[2]);
      limb(c, bx - Math.cos(ang) * 50, py - Math.sin(ang) * 50 + 4, ex, ey + 4, 2, STEEL[1], false);
      const wx0 = bx - Math.cos(ang) * 56, wy0 = py - Math.sin(ang) * 56;
      slab(c, wx0 - 13, wy0 - 11, 26, 22, CHARCOAL); for (let k = 0; k < 3; k++) box(c, wx0 - 10, wy0 - 7 + k * 6, 20, 1, CHARCOAL[4]);
      ball(c, bx, py, 7, CHROME[4], 1.2); ball(c, bx, py, 2.5, INK, 0);
      // (the seat's deck: steel, a rail at its back, the seat, the camera slung under its front)
      slab(c, at.x - half, at.y, d.w, 12, STEEL);
      limb(c, at.x - half + 8, at.y, at.x - half + 8, at.y - 26, 2.4, CHROME[3]); limb(c, at.x - half + 8, at.y - 26, at.x - half + 26, at.y - 26, 2.4, CHROME[3]);
      if (at.y + 32 < GY) { slab(c, at.x + half - 30, at.y + 12, 28, 18, CHARCOAL); ball(c, at.x + half - 2, at.y + 21, 6, '#3F3F46', 1); ball(c, at.x + half - 2, at.y + 21, 2.5, '#1E3A8A', 0); }
      lip(c, at.x - half + 2, at.y, d.w - 4);
      continue;
    }
    // (the track overhead: an I-beam hung off the ceiling on rods; the trolley on it, two rods down to the cel's clamp bar)
    const ta = X(Math.min(d.xa, d.xb) - 70), tb = X(Math.max(d.xa, d.xb) + 70), ty = Y(TRACK_H);
    for (let x = ta + 30; x < tb; x += 160) { box(c, x - 1, CEIL, 4, ty - 8 - CEIL, INK); box(c, x, CEIL, 2, ty - 8 - CEIL, STEEL[3]); }
    slab(c, ta, ty - 10, tb - ta, 4, STEEL); slab(c, ta + 6, ty - 6, tb - ta - 12, 3, STEEL); slab(c, ta, ty - 3, tb - ta, 4, STEEL);
    for (const ex of [ta, tb - 6]) slab(c, ex, ty - 14, 6, 16, CHARCOAL);
    slab(c, at.x - 24, ty - 14, 48, 14, CHARCOAL);
    for (const wx of [at.x - 14, at.x + 14]) { ball(c, wx, ty - 11, 4, CHROME[3], 1); px(c, wx - 1, ty - 13, 1, 1, CHROME[5]); }
    for (const rx2 of [at.x - half + 8, at.x + half - 8]) limb(c, at.x + (rx2 > at.x ? 12 : -12), ty, rx2, at.y, 2.2, CHROME[3]);
    // (the cel: clear acetate hanging under the bar, a Socks painted on it, the peg holes; the bar he stands on)
    c.fillStyle = 'rgba(219,234,254,0.4)'; c.fillRect(at.x - half + 4, at.y + 10, d.w - 8, 70);
    box(c, at.x - half + 4, at.y + 10, 1, 70, 'rgba(255,255,255,0.8)'); box(c, at.x + half - 5, at.y + 10, 1, 70, 'rgba(255,255,255,0.5)'); box(c, at.x - half + 4, at.y + 79, d.w - 8, 1, 'rgba(255,255,255,0.6)');
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(at.x - half + 12, at.y + 10); c.lineTo(at.x - half + 22, at.y + 10); c.lineTo(at.x - half + 8, at.y + 60); c.lineTo(at.x - half + 4, at.y + 60); c.closePath(); c.fill();
    socks(c, at.x, at.y + 74, 0.62, d.id === 'celB' ? 1 : 0);
    for (let k = 0; k < 3; k++) { box(c, at.x - half + 10 + k * 34, at.y + 76, 6, 3, INK); }
    slab(c, at.x - half, at.y, d.w, 10, CHROME);
    for (const cx of [at.x - half + 6, at.x + half - 14]) slab(c, cx, at.y + 8, 8, 6, CHARCOAL);
    lip(c, at.x - half + 2, at.y, d.w - 4);
  }
};

/** The screen's title card: the gross-up (gross.ts) under the show's name and SATURDAY MORNINGS!, in the park's letters. */
const paintScreenCard = (g: Ctx, a: number, top: number, w: number, h: number) => {
  const hx = a + w / 2, bot = top + h;
  grossBack(g, a, top, w, h);
  grossSocks(g, hx - 16, top + 150, 70);
  grossChelsea(g, a + w - 40, bot - 66, 30);
  bands(g, a, top, w, 56, ['#2E1065', '#4C1D95', '#5B21B6']); box(g, a, top + 56, w, 2, INK); checker(g, a, top + 54, w, 2, '#2E1065', 0, 1);
  txt(g, 'CHELSEA AND SOCKS', hx, top + 22, park(1));
  txt(g, 'WACKY!', hx, top + 48, park(2, ['#FFFFFF', '#FDF2F8', '#F9A8D4', '#EC4899']));
  box(g, a, bot - 24, w, 24, INK); bands(g, a, bot - 22, w, 22, ['#DC4A40', '#BA2222', '#8E1616']);
  txt(g, 'SATURDAY MORNINGS!', hx, bot - 8, park(1, ['#FFFFFF', '#FFFFFF', '#FEF3C7', '#FDE68A']));
};
/** THE SCREEN: a big white projection screen on its frame and legs, the show's title card thrown up on it; with him
 *  behind it, his shadow on it. */
const drawScreen = (c: Ctx, state: GameState, behindIt: boolean) => {
  const a = X(SCREEN.a), b = X(SCREEN.b), top = Y(SCREEN.h), bot = Y(70), f = state.frame;
  if (b < state.camera.x - 40 || a > state.camera.x + CANVAS_WIDTH + 40) return;
  for (const lx of [a + 10, b - 16]) slab(c, lx, bot, 6, GY - bot, CHARCOAL);
  for (const lx of [a + 13, b - 13]) { limb(c, lx, GY - 2, lx - 22, GY - 2, 4, '#27272A'); limb(c, lx, GY - 2, lx + 22, GY - 2, 4, '#27272A'); }
  slab(c, a - 8, top - 8, b - a + 16, bot - top + 16, CHARCOAL);
  box(c, a - 3, top - 3, b - a + 6, bot - top + 6, '#0A0A0E');
  box(c, a, top, b - a, bot - top, '#F1F5F9');
  // (the title card on it, a little washed out the way projections are, flickering)
  const w = b - a, h = bot - top, k = 0.88 + 0.06 * Math.sin(f * 0.9) * Math.sin(f * 0.13);
  c.save(); c.beginPath(); c.rect(a, top, w, h); c.clip();
  const hx = a + w / 2;
  // (the show stopped dead on a gross-up: Socks lovingly over-rendered, Chelsea's grin in an inset; still, stamped)
  stamp(c, 'ct-st2-screen-gross', a, top, w, h, g => paintScreenCard(g, a, top, w, h));
  // (washed out the way projections are, flickering: the screen's white over it, a touch more or less)
  c.fillStyle = `rgba(241,245,249,${(1 - k).toFixed(3)})`; c.fillRect(a, top, w, h);
  // (the projector's hot spot in the middle, and the vignette round the edges)
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.ellipse(hx, top + h / 2, w * 0.3, h * 0.3, 0, 0, Math.PI * 2); c.fill();
  checker(c, a, top, w, 4, 'rgba(10,10,20,0.35)', 0, 2); checker(c, a, bot - 4, w, 4, 'rgba(10,10,20,0.35)', 0, 2);
  // (him, behind it: his shadow, soft at the edges)
  if (behindIt) {
    const p = state.player, sx = p.pos.x + p.width / 2;
    c.globalAlpha = 0.55; c.fillStyle = '#1E293B';
    c.beginPath(); c.ellipse(sx, p.pos.y + 14, 13, 14, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.roundRect(p.pos.x + 2, p.pos.y + 24, p.width - 4, p.height - 24, 8); c.fill();
  }
  c.restore();
  // (the dust in the beam's light, drifting across it)
  for (let i = 0; i < 6; i++) { const dx = ((i * 53 + f * 0.3) % w), dy = (i * 37 + f * 0.17) % h; c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(a + dx, top + dy, 1.5, 1.5); }
};

/** What the staff throw: the interns' coffees (lobbed, spilling), the puddles they leave (steaming), the guides' plates
 *  (flat, spinning: an ellipse squashing and turning). */
const drawThrows = (c: Ctx, state: GameState, puddles: boolean) => {
  const f = state.frame;
  for (const t of studioOf(state).throws) {
    if (t.x < state.camera.x - 40 || t.x > state.camera.x + CANVAS_WIDTH + 40) continue;
    if (t.kind === 'puddle') {
      if (!puddles) continue;
      const fade = Math.max(0, Math.min(1, (240 - t.t) / 60));
      c.globalAlpha = fade;
      c.fillStyle = INK; c.beginPath(); c.ellipse(t.x, t.y - 1, 15, 3.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#6A3A16'; c.beginPath(); c.ellipse(t.x, t.y - 1, 14, 2.6, 0, 0, Math.PI * 2); c.fill();
      box(c, t.x - 8, t.y - 3, 6, 1, '#B07A4A');
      c.globalAlpha = 1;
      if (fade > 0.3) steam(c, t.x - 4, t.y - 4, f, Math.round(t.x));
      continue;
    }
    if (puddles) continue;
    if (t.kind === 'plate') {
      const sq = 0.35 + 0.25 * Math.abs(Math.sin(t.t * 0.5)), rx = 11, ry = 11 * sq;
      c.fillStyle = INK; c.beginPath(); c.ellipse(t.x, t.y, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F8FAFC'; c.beginPath(); c.ellipse(t.x, t.y, rx, ry, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#2563EB'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(t.x, t.y, rx * 0.72, ry * 0.72, 0, 0, Math.PI * 2); c.stroke();
      box(c, t.x - 1, t.y - 1, 3, 2, '#F59E0B'); box(c, t.x - 7, t.y - ry * 0.6, 4, 1, '#FFFFFF');
      // (the whirl lines behind it)
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1;
      for (let k = 0; k < 2; k++) { const bx = t.x - Math.sign(t.vx || 1) * (16 + k * 7); c.beginPath(); c.moveTo(bx, t.y - 3 + k * 4); c.lineTo(bx - Math.sign(t.vx || 1) * 8, t.y - 3 + k * 4); c.stroke(); }
      continue;
    }
    // (a coffee: a paper cup tumbling, its lid gone, a tongue of coffee off it)
    c.save(); c.translate(t.x, t.y); c.rotate(t.t * 0.25);
    c.fillStyle = INK; c.beginPath(); c.moveTo(-5, -6); c.lineTo(5, -6); c.lineTo(4, 7); c.lineTo(-4, 7); c.closePath(); c.fill();
    c.fillStyle = '#F5F5F4'; c.beginPath(); c.moveTo(-4, -5); c.lineTo(4, -5); c.lineTo(3, 6); c.lineTo(-3, 6); c.closePath(); c.fill();
    box(c, -4, -1, 8, 3, '#B45309'); box(c, -4, -5, 2, 11, '#FFFFFF');
    box(c, -4, -6, 8, 2, '#5B3A1E');
    c.restore();
    c.fillStyle = '#7C4A1E'; c.beginPath(); c.ellipse(t.x - t.vx * 1.4, t.y - t.vy * 1.4, 4, 2, Math.atan2(t.vy, t.vx), 0, Math.PI * 2); c.fill();
  }
};

/** A PA horn speaker hanging off the ceiling at x (sound arcs off it while the narrator's on). */
const horn = (c: Ctx, x: number, talking: boolean, f: number) => {
  box(c, x - 2, CEIL, 4, 30, INK); box(c, x - 1, CEIL, 2, 30, STEEL[3]);
  slab(c, x - 5, CEIL + 22, 10, 7, STEEL);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x - 7, CEIL + 28); c.lineTo(x + 7, CEIL + 28); c.lineTo(x + 19, CEIL + 53); c.lineTo(x - 19, CEIL + 53); c.closePath(); c.fill();
  c.fillStyle = CHROME[3]; c.beginPath(); c.moveTo(x - 5, CEIL + 30); c.lineTo(x + 5, CEIL + 30); c.lineTo(x + 16, CEIL + 51); c.lineTo(x - 16, CEIL + 51); c.closePath(); c.fill();
  c.fillStyle = CHROME[4]; c.beginPath(); c.moveTo(x - 5, CEIL + 30); c.lineTo(x - 1, CEIL + 30); c.lineTo(x - 6, CEIL + 51); c.lineTo(x - 16, CEIL + 51); c.closePath(); c.fill();
  box(c, x - 16, CEIL + 49, 32, 2, CHROME[1]);
  if (talking) { c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.5; for (let k = 0; k < 2; k++) { const r0 = 8 + k * 8 + (f % 12) * 0.6; c.beginPath(); c.arc(x, CEIL + 52, r0, 0.3, Math.PI - 0.3); c.stroke(); } }
};

// ---------------------------------------------------------------------------------------------------------------
// Putting it together

export const drawStudioBackdrop = (c: Ctx) => { box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0B0814'); return true; };

export const drawStudioBack = (c: Ctx, state: GameState, talking: boolean) => {
  const E = eyeOf(state), f = state.frame, s = studioOf(state);
  const vis = ROOMS.filter(r => seen(state, E, X(r.a), X(r.b), D_BACK) || seen(state, E, X(r.a), X(r.b), 1));
  // (above the ceiling: the roof's dark)
  box(c, state.camera.x - 20, state.camera.y - 20, CANVAS_WIDTH + 40, CEIL - state.camera.y + 20, '#0B0814');
  // The rooms, back to front: shells; the back walls' tableaux; the partitions' far halves; the props; their near halves
  for (const r of vis) {
    shellBack(c, E, r, s.light[ROOMS.indexOf(r)]);
    atDepth(c, E, D_BACK, () => stamp(c, `ct-st2-back-${r.id}-${backKey(r.id)}`, X(r.a), CEIL, r.b - r.a, CEIL_H, g => BACKS[r.id](g, r)));
  }
  const walls = ROOMS.slice(1).map((r, i) => ({ x: X(r.a), left: ROOMS[i], right: r }));
  const facing = (w: typeof walls[number]) => (w.x < E.x ? w.right : w.left);
  for (const w of walls) if (seen(state, E, w.x - 4, w.x + 4, D_BACK) || seen(state, E, w.x - 4, w.x + 4, D_RAIL)) partition(c, E, w.x, D_BACK, D_PROPS, facing(w));
  // (the section's own end walls)
  partition(c, E, X(ROOMS[0].a), D_BACK, 1, ROOMS[0]);
  partition(c, E, X(ROOMS[ROOMS.length - 1].b), D_BACK, 1, ROOMS[ROOMS.length - 1]);
  // (the night shift: rows of light tables going back, the people at them, back row first)
  if (vis.some(r => r.id === 'overseas')) for (const row of OVERSEAS_ROWS) atDepth(c, E, row.d, () => {
    for (let i = 0; i < row.xs.length; i++) {
      const x = X(row.xs[i]), k = i * 7 + Math.round(row.d * 100);
      if (!seen(state, E, x - 60, x + 100, row.d)) continue;
      stamp(c, `ct-st2-desk-${k}`, x - 4, GY - 132, 96, 136, g => lightTable(g, x, k));
      nightShift(c, x, k, f);
      if (k % 3 === 0) steam(c, x + 19, GY - 106, f, k);
    }
  });
  for (const r of vis) {
    const props = PROPS[r.id];
    atDepth(c, E, D_PROPS, () => {
      if (props) stamp(c, `ct-st2-props-${r.id}`, X(r.a), CEIL, r.b - r.a, CEIL_H, g => props(g));
      if (r.id === 'vision') drawDave(c, X(1400), GY, f);
      else if (r.id === 'writers') drawWritersLive(c, f);
      else if (r.id === 'voice') drawVoiceLive(c, f);
      else if (r.id === 'models') drawArtDirector(c, X(5120), GY, f);
      else if (r.id === 'premiere') { stamp(c, 'ct-st2-promo', PROMO.x - 10, PROMO.y - 20, PROMO.w + 20, GY - PROMO.y + 24, g => paintPromo(g)); drawPromoBulbs(c, f); }
      drawClutterLive(c, r.id, f);
    });
  }
  // (the low clutter just behind the rope: crumpled drawings, cables taped down, cans, a putting green)
  for (const r of vis) { const near = NEAR[r.id]; if (near && seen(state, E, X(r.a), X(r.b), D_NEAR)) atDepth(c, E, D_NEAR, () => stamp(c, `ct-st2-near-${r.id}`, X(r.a), GY - 90, r.b - r.a, 92, g => near(g))); }
  // (the press, cardboard, behind the rope along the red carpet, flashing)
  if (vis.some(r => r.id === 'premiere')) atDepth(c, E, 0.91, () => { stamp(c, 'ct-st2-papz', X(9330), GY - 100, 330, 104, g => paintPaparazzi(g)); drawPaparazziLive(c, f); });
  for (const w of walls) if (seen(state, E, w.x - 4, w.x + 4, D_PROPS) || seen(state, E, w.x - 4, w.x + 4, D_RAIL)) partition(c, E, w.x, D_PROPS, D_RAIL, facing(w));
  // The rope along the path's back edge (brass posts and a sagging velvet rope: dim, nothing to stand on)
  atDepth(c, E, D_RAIL, () => {
    for (let rx = 0; rx < 10000; rx += 140) {
      if (rx > 6100 && rx < 7200) continue;
      const x = X(rx);
      if (!seen(state, E, x - 10, x + 150, D_RAIL)) continue;
      box(c, x - 4, GY - 64, 8, 64, INK); box(c, x - 3, GY - 63, 6, 63, GOLD[1]); box(c, x - 3, GY - 63, 2, 63, GOLD[3]);
      c.fillStyle = INK; c.beginPath(); c.arc(x, GY - 66, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = GOLD[2]; c.beginPath(); c.arc(x, GY - 66, 5, 0, Math.PI * 2); c.fill(); box(c, x - 2, GY - 69, 2, 2, GOLD[4]);
      c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(x, GY - 58); c.quadraticCurveTo(x + 70, GY - 34, x + 140, GY - 58); c.stroke();
      c.strokeStyle = VELVET[1]; c.lineWidth = 4; c.stroke();
      c.strokeStyle = VELVET[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 6, GY - 58); c.quadraticCurveTo(x + 70, GY - 37, x + 134, GY - 58); c.stroke();
    }
  });
  for (const r of vis) if (r.num) atDepth(c, E, D_RAIL, () => {
    const x = placardX(r), w = placardW(r);
    c.save(); c.translate(x, GY);
    stamp(c, `ct-st2-placard-${r.id}`, -w / 2 - 6, -200, w + 12, 204, g => paintPlacard(g, r));
    c.restore();
  });
  if (vis.some(r => r.id === 'lobby')) atDepth(c, E, D_RAIL, () => {
    for (const sx of [MARQUEE.x - 150, MARQUEE.x + 150]) for (let yy = CEIL; yy < MARQUEE.y; yy += 8) { box(c, sx - 3, yy, 6, 6, INK); box(c, sx - 2, yy + 1, 4, 4, STEEL[3]); box(c, sx - 1, yy + 2, 2, 2, STEEL[0]); }
    c.save(); c.translate(MARQUEE.x, MARQUEE.y);
    stamp(c, 'ct-st2-marquee', -200, -6, 400, 110, g => paintMarquee(g));
    c.restore();
  });
  if (vis.some(r => r.id === 'overseas')) atDepth(c, E, D_RAIL, () => stamp(c, 'ct-st2-banner', X(6380), CEIL, 440, Y(300) - CEIL, g => paintBanner(g)));
  // The path: carpet, its lit lip, the aisle lights along it (the red carpet in the premiere room); the pits
  drawPath(c, state);
  pitsBack(c, state);
  drawThrows(c, state, true);
  playProps(c, state);
  drawStacks(c, state, s.towers);
  drawMovers(c, state);
  // (the screen behind him, unless he's in behind it)
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (!(cx > X(SCREEN.a) + 6 && cx < X(SCREEN.b) + 40)) drawScreen(c, state, false);
  // The ceiling's front edge: the soffit beams over each doorway, the PA horns
  for (const w of walls) if (w.x > state.camera.x - 60 && w.x < state.camera.x + CANVAS_WIDTH + 60) { slab(c, w.x - 24, CEIL, 48, 34, CHARCOAL); box(c, w.x - 22, CEIL + 30, 44, 2, CHARCOAL[4]); }
  for (const r of vis) { const hx = X(r.a + 320); if (hx > state.camera.x - 40 && hx < state.camera.x + CANVAS_WIDTH + 40) horn(c, hx, talking && r === vis.find(q => X(q.a) <= p.pos.x && X(q.b) > p.pos.x), f); }
};

export const drawStudioFront = (c: Ctx, state: GameState) => {
  pitsFront(c, state);
  drawThrows(c, state, false);
  const p = state.player, cx = p.pos.x + p.width / 2;
  if (cx > X(SCREEN.a) + 6 && cx < X(SCREEN.b) + 40) drawScreen(c, state, true);
};

// ---------------------------------------------------------------------------------------------------------------
// The lights (soft fills: never a spotlight)

export const studioLights = (state: GameState): Light[] => {
  const s = studioOf(state), E = eyeOf(state), out: Light[] = [];
  ROOMS.forEach((r, i) => {
    const L = s.light[i];
    if (L < 0.02) return;
    if (!seen(state, E, X(r.a) - 400, X(r.b) + 400, 1)) return;
    const n = Math.max(2, Math.round((r.b - r.a) / 380));
    for (let k = 0; k < n; k++) {
      const x = X(r.a + (k + 0.5) * ((r.b - r.a) / n));
      const back = proj(E, x, GY - 260, D_PROPS);
      out.push({ x: back.x, y: back.y, r: 430, a: 0.9 * L, color: 'rgba(255,224,178,0.10)' });
      out.push({ x, y: GY - 110, r: 300, a: 0.6 * L });
    }
  });
  // (the aisle lights along the path, always on)
  for (let x = Math.floor((state.camera.x - X(0)) / 160) * 160; X(x) < state.camera.x + CANVAS_WIDTH + 80; x += 160) {
    if (x < 0 || x > 10000) continue;
    out.push({ x: X(x), y: GY + 6, r: 70, a: 0.5, color: 'rgba(96,165,250,0.12)' });
  }
  // (the night shift's light tables, glowing in the dark before the room's lights come up)
  const oi = ROOMS.findIndex(r => r.id === 'overseas');
  if (s.light[oi] < 1 && seen(state, E, X(5600), X(7600), 0.84)) for (const row of OVERSEAS_ROWS) for (const rx of row.xs) {
    const p = proj(E, X(rx) + 42, GY - 82, row.d);
    if (p.x > state.camera.x - 60 && p.x < state.camera.x + CANVAS_WIDTH + 60) out.push({ x: p.x, y: p.y, r: 46, a: 0.7 * (1 - s.light[oi]), color: 'rgba(255,244,200,0.10)' });
  }
  // (the screen, glowing; the promo board's bulbs; the RECORDING lamp; the lobby's TV bank and its EXIT sign)
  out.push({ x: X((SCREEN.a + SCREEN.b) / 2), y: Y(200), r: 280, a: 0.75, color: 'rgba(191,219,254,0.10)' });
  { const p = proj(E, PROMO.x + PROMO.w / 2, GY - 300, D_PROPS); out.push({ x: p.x, y: p.y, r: 260, a: 0.5, color: 'rgba(253,224,71,0.10)' }); }
  { const p = proj(E, X(4150), GY - 322, D_PROPS); out.push({ x: p.x, y: p.y, r: 70, a: 0.6, color: 'rgba(248,113,113,0.14)' }); }
  if (seen(state, E, X(0), X(800), D_BACK)) {
    { const p = proj(E, X(700), CEIL + 74, D_BACK); out.push({ x: p.x, y: p.y, r: 90, a: 0.45, color: 'rgba(147,197,253,0.12)' }); }
    { const p = proj(E, X(130), GY - 285, D_BACK); out.push({ x: p.x, y: p.y, r: 60, a: 0.5, color: 'rgba(248,113,113,0.14)' }); }
  }
  return out;
};
