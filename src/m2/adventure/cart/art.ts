// The mine, painted: a real cavern under the temple, in depth. Far back, the cavern's wall in its rock layers (crystals
// glinting in it), then the great columns where the stalactites met the floor, a far-off trestle with a cart crossing
// it, then the wall behind the track timbered along its length (posts, a cap beam, knee braces, lanterns hung off
// it, flickering); a cool haze over each step back. At his level, the track on its trestle (the bents going down into
// the dark, ties seen from above, two rails going back), the gaps where it's just gone (splintered, a red lantern
// either side, nothing under), the low beams (timber sets across the track, striped), the station's rock shelf and
// its portal, the guest scanner (a gantry, its eyes, its readout), the fork (the switch stand, the signs, the friendly
// track curving off into IT'S A FRIENDLY WORLD), and the ramp at the end, straight up into the temple's floor. The
// ride's tricks along it (the idols, the serpents' rocks, the catapults' walls, the big one's doors) are trickArt.ts.
//
// Depth is the temple's (temple/art.ts: inDepth). Indoors (underground): no time of day, its own lighting
// (cartLighting); but the daylight through the cracks at the top of the ramp is the hour's.

import type { GameState } from '../../../m1/game/core/state';
import type { SceneLight, Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { isNude, isShat } from '../../../m1/game/player/gut';
import { skyAt } from '../../timeOfDay';
import { eyeOf, inDepth, at, spanAt, floorAt, type Eye } from '../temple/art';
import { INK, box, text, slab, pole, ball, sign, rampOf, dark, lite, mix, checker, bandedGradient, hazeBands, steppedGlow, stamp, hash } from '../../intro/art/kit';
import {
  X, x1, RUNS, RAMP_X, RAMP_R, RAMP_Y, RAIL_TOP, BEAMS, SCANNER_X, FORK_X, BEAM_CLEAR, trackY, artieTrackY,
} from './layout';
import type { Cart } from './index';
import { drawTrickSets, drawTrickActors, trickLights } from './trickArt';

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

const quad = (c: Ctx, col: string, a: Pt, b: Pt, cc: Pt, dd: Pt) => {
  c.fillStyle = col; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(cc[0], cc[1]); c.lineTo(dd[0], dd[1]); c.closePath(); c.fill();
};
const seg = (c: Ctx, a: Pt, b: Pt, col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

const TIMBER = '#7A5530', ROCK = '#4A3A30';
const FAR_D = 0.3, PILLAR_D = 0.5, DISTANT_D = 0.42, WALL_D = 0.7, SET_D = 0.84;
/** The rail's far side and near side (how far back each runs). */
const RAIL_FAR = 0.955, RAIL_NEAR = 1;
/** The station's rock shelf (the friendly track runs on it). */
const SHELF_X0 = X - 400, SHELF_X1 = X + 2450;
const FRIENDLY_END = X + 2400;
const HAZE_COL = 'rgba(8, 10, 20, 0.32)';

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (screen): the cavern's dark

export const drawCartBackdrop = (c: Ctx, _state: GameState) => {
  bandedGradient(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#05060A', '#0B0B12', '#120E10'], 10);
};

// ---------------------------------------------------------------------------------------------------------------
// Rock: in layers (the strata), each band its own shade, the seams between them wavering, stepped

const STRATA = ['#2A2026', '#30242A', '#261E26', '#33282A', '#2B2230', '#3A2C2A'];
const TILE = 512;
const paintRock = (g: Ctx, x0: number, y0: number, base: number, bright: number) => {
  for (let x = x0; x < x0 + TILE; x += 8) {
    let y = y0;
    while (y < y0 + TILE) {
      const band = Math.floor((y + Math.sin(x * 0.01 + base) * 18 + Math.sin(x * 0.043) * 6) / 70);
      const nextEdge = (band + 1) * 70 - Math.sin(x * 0.01 + base) * 18 - Math.sin(x * 0.043) * 6;
      const y1 = Math.min(y0 + TILE, Math.max(y + 2, Math.ceil(nextEdge / 2) * 2));
      const col = STRATA[((band % STRATA.length) + STRATA.length) % STRATA.length];
      box(g, x, y, 8, y1 - y, bright ? lite(col, bright) : col);
      // (the band's top lit, its seam dark)
      box(g, x, y1 - 2, 8, 2, dark(col, 0.35));
      y = y1;
    }
  }
  // (cracks, chips, the odd lit edge)
  for (let k = 0; k < 40; k++) {
    const hx = x0 + hash(x0 * 0.13 + y0 * 0.7 + k) * TILE, hy = y0 + hash(x0 * 0.31 + y0 * 0.17 + k * 3.3) * TILE;
    box(g, hx, hy, 2 + hash(k + x0) * 10, 2, 'rgba(0, 0, 0, 0.35)');
    box(g, hx, hy - 2, 2 + hash(k + x0) * 8, 1, `rgba(255, 220, 190, ${0.04 + bright * 0.1})`);
  }
};
/** A wall of rock at depth d, tiled (stamped) over what's on screen there. */
const rockWall = (c: Ctx, eye: Eye, d: number, key: string, base: number, bright: number, ridge?: (x: number) => number) => {
  const [s0, s1] = spanAt(eye, d, 0);
  const t0 = eye.y - (CANVAS_HEIGHT * 0.42) / d - 20, t1 = eye.y + (CANVAS_HEIGHT * 0.58) / d + 20;
  inDepth(c, eye, d, () => {
    if (ridge) {
      // (only up to its top: a ragged edge, stepped, the cavern open over it; the edge lit)
      c.beginPath(); c.moveTo(s0, t1);
      for (let x = Math.floor(s0 / 16) * 16; x <= s1 + 16; x += 16) { const y = Math.round(ridge(x) / 4) * 4; c.lineTo(x, y); c.lineTo(x + 16, y); }
      c.lineTo(s1 + 16, t1); c.closePath();
      c.save(); c.clip();
    }
    for (let i = Math.floor(s0 / TILE); i * TILE < s1; i++) for (let j = Math.floor(t0 / TILE); j * TILE < t1; j++) {
      stamp(c, `${key}-${i}-${j}`, i * TILE, j * TILE, TILE, TILE, g => paintRock(g, i * TILE, j * TILE, base, bright));
    }
    if (ridge) {
      c.restore();
      for (let x = Math.floor(s0 / 16) * 16; x <= s1; x += 16) { const y = Math.round(ridge(x) / 4) * 4; box(c, x, y, 16, 4, '#5A4A48'); box(c, x, y + 4, 16, 2, '#3A2E30'); }
    }
  });
};
/** The top of the rock behind the track: well over his head, ragged. */
const wallRidge = (x: number) => artieTrackY(x) - 390 + Math.sin(x * 0.006) * 50 + Math.sin(x * 0.023) * 18 + (hash(Math.floor(x / 48)) - 0.5) * 24;

const haze = (c: Ctx, state: GameState) => { c.fillStyle = HAZE_COL; c.fillRect(state.camera.x - 10, state.camera.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20); };

// ---------------------------------------------------------------------------------------------------------------
// The far cavern: crystals glinting in its wall; the columns; a distant trestle, a cart going over it now and then

const crystals = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, FAR_D, 0);
  inDepth(c, eye, FAR_D, () => {
    for (let x = Math.floor(s0 / 140) * 140; x < s1; x += 140) for (let k = 0; k < 3; k++) {
      const h = hash(x * 0.11 + k * 7.7);
      const y = eye.y - 900 + hash(x * 0.37 + k) * 1900;
      const tw = Math.sin(f * 0.05 + h * 40);
      if (tw < 0.4) continue;
      const col = h < 0.5 ? '#7DD3FC' : '#C4B5FD';
      box(c, x + h * 120, y, 4, 4, col); if (tw > 0.85) { box(c, x + h * 120 - 4, y + 1, 12, 2, lite(col, 0.4)); box(c, x + h * 120 + 1, y - 4, 2, 12, lite(col, 0.4)); }
    }
  });
};

const paintPillar = (g: Ctx, x: number, k: number) => {
  const top = GY - 1500, bot = GY + 1000;
  const r = rampOf(mix(ROCK, '#2A2430', 0.5));
  // (wide at the roof and the floor, waisted where they met; stepped in 8s)
  for (let y = top; y < bot; y += 8) {
    const u = (y - top) / (bot - top);
    const w = 40 + 110 * Math.pow(Math.abs(u - 0.45 - k * 0.05) * 2, 1.6) + Math.sin(y * 0.02 + k) * 8;
    box(g, x - w / 2 - 2, y, w + 4, 8, INK);
    box(g, x - w / 2, y, w, 8, r[2]);
    box(g, x - w / 2, y, w * 0.25, 8, r[3]);
    box(g, x + w * 0.2, y, w * 0.3, 8, r[1]);
    if ((y / 8) % 9 === 0) box(g, x - w / 2, y, w, 2, r[1]);
  }
  // (drips: the flowstone's ridges)
  for (let q = 0; q < 6; q++) box(g, x - 30 + q * 12, top + 200 + hash(q + k) * 400, 2, 120, r[3]);
};
const pillars = (c: Ctx, eye: Eye) => {
  const [s0, s1] = spanAt(eye, PILLAR_D, 200);
  inDepth(c, eye, PILLAR_D, () => {
    for (let x = Math.floor(s0 / 700) * 700; x < s1; x += 700) {
      const k = hash(x * 0.013);
      if (k < 0.3) continue;
      const px = x + k * 300, v = Math.floor(k * 3);
      stamp(c, `cart-pillar-${Math.round(px)}`, px - 200, GY - 1500, 400, 2500, g => paintPillar(g, px, v), );
    }
  });
};

const distantTrestle = (c: Ctx, eye: Eye, f: number) => {
  const [s0, s1] = spanAt(eye, DISTANT_D, 40);
  const ty = GY - 120;
  inDepth(c, eye, DISTANT_D, () => {
    const a = Math.floor(s0 / 80) * 80;
    for (let x = a; x < s1; x += 80) {
      box(c, x, ty, 6, 900, '#2A2026'); box(c, x, ty, 2, 900, '#3A2E30');
      c.strokeStyle = '#241C22'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, ty + 10); c.lineTo(x + 80, ty + 120); c.moveTo(x + 80, ty + 10); c.lineTo(x, ty + 120); c.stroke();
    }
    box(c, s0, ty - 6, s1 - s0, 8, '#3A2C26'); box(c, s0, ty - 8, s1 - s0, 2, '#6A5A50');
    // (its lanterns)
    for (let x = Math.floor(s0 / 480) * 480; x < s1; x += 480) { steppedGlow(c, x, ty - 30, 40, '#F59E0B', 0.2, 0.02, 3); box(c, x - 3, ty - 34, 6, 8, '#FCD34D'); }
    // (a cart going over, now and then, tiny)
    const period = 4200, p = (f * 3) % period;
    const cx = Math.floor(eye.x / period) * period + p - 1000;
    if (cx > s0 && cx < s1) { slab(c, cx - 40, ty - 40, 80, 30, '#7C2D12', { edge: 2 }); for (const w of [cx - 24, cx + 24]) ball(c, w, ty - 10, 8, '#2A2A2E'); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The wall behind the track, timbered: posts, the cap beam, knee braces, lanterns

/** Where the timber sets stand (front-plane x), and the rail height they're set to there. */
const setsOn = (eye: Eye) => {
  const out: { x: number; y: number }[] = [];
  // (one more set past each edge of what's on screen: the cap beam and lagging run from each set to the next, so the
  // span either side of the screen's edge needs both its ends, or it pops in as the next set comes into view)
  const [s0, s1] = spanAt(eye, SET_D, 120 + 320);
  for (let x = Math.floor(s0 / 320) * 320; x < s1; x += 320) {
    if (x < X - 200 || x > RAMP_X - 100) continue;
    out.push({ x, y: artieTrackY(x) });
  }
  return out;
};
const lanternFlicker = (x: number, f: number) => 0.85 + 0.1 * Math.sin(f * 0.21 + x) + (hash(Math.floor(f / 3) + x) < 0.08 ? -0.25 : 0);

const drawLantern = (c: Ctx, x: number, y: number, f: number, col = '#F59E0B') => {
  const fl = lanternFlicker(x, f);
  steppedGlow(c, x, y + 10, 34 * fl, col, 0.22, 0.02, 4);
  box(c, x - 1, y - 8, 2, 8, '#2A2A2E');
  box(c, x - 6, y, 12, 3, INK); box(c, x - 5, y + 1, 10, 1, '#5A5E66');
  box(c, x - 6, y + 3, 12, 14, INK);
  box(c, x - 5, y + 4, 10, 12, mix(col, '#FFF4C8', 0.3 * fl));
  box(c, x - 2, y + 7, 4, 7, '#FFFBEA');
  box(c, x - 1, y + 4, 2, 12, INK); box(c, x - 5, y + 9, 10, 1, INK);
  box(c, x - 6, y + 17, 12, 3, INK); box(c, x - 5, y + 17, 10, 1, '#5A5E66');
};

const timberSets = (c: Ctx, eye: Eye, f: number) => {
  const sets = setsOn(eye);
  inDepth(c, eye, SET_D, () => {
    const r = rampOf(dark(TIMBER, 0.15));
    for (let i = 0; i < sets.length; i++) {
      const { x, y } = sets[i];
      const capY = y - 250;
      // (the post, from the cap down into the dark)
      box(c, x - 9, capY, 18, 900, INK);
      box(c, x - 8, capY, 16, 900, r[2]); box(c, x - 8, capY, 4, 900, r[3]); box(c, x + 4, capY, 4, 900, r[1]);
      for (let k = 0; k < 6; k++) box(c, x - 8, capY + 60 + k * 140, 16, 2, r[0]);
      // (the cap to the next one: a beam along the wall, stepped round; sloping with the track)
      if (i + 1 < sets.length) {
        const n = sets[i + 1], ny = n.y - 250;
        c.fillStyle = INK; c.beginPath(); c.moveTo(x, capY - 13); c.lineTo(n.x, ny - 13); c.lineTo(n.x, ny + 13); c.lineTo(x, capY + 13); c.closePath(); c.fill();
        c.fillStyle = r[2]; c.beginPath(); c.moveTo(x, capY - 12); c.lineTo(n.x, ny - 12); c.lineTo(n.x, ny + 12); c.lineTo(x, capY + 12); c.closePath(); c.fill();
        c.fillStyle = r[3]; c.beginPath(); c.moveTo(x, capY - 12); c.lineTo(n.x, ny - 12); c.lineTo(n.x, ny - 7); c.lineTo(x, capY - 7); c.closePath(); c.fill();
        c.fillStyle = r[1]; c.beginPath(); c.moveTo(x, capY + 7); c.lineTo(n.x, ny + 7); c.lineTo(n.x, ny + 12); c.lineTo(x, capY + 12); c.closePath(); c.fill();
        // (lagging boards behind, between the posts, up over the cap)
        for (let k = 0; k < 6; k++) {
          const u0 = k / 6, u1 = (k + 1) / 6, xa = x + (n.x - x) * u0 + 10, xb = x + (n.x - x) * u1 - 2;
          const ya = capY + (ny - capY) * u0, yb = capY + (ny - capY) * u1;
          c.fillStyle = k % 2 ? '#3A2A1E' : '#33251A'; c.beginPath(); c.moveTo(xa, ya - 120); c.lineTo(xb, yb - 120); c.lineTo(xb, yb - 14); c.lineTo(xa, ya - 14); c.closePath(); c.fill();
        }
      }
      // (knee braces)
      c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.moveTo(x - 40, capY + 12); c.lineTo(x - 8, capY + 50); c.moveTo(x + 40, capY + 12); c.lineTo(x + 8, capY + 50); c.stroke();
      c.strokeStyle = r[2]; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 40, capY + 12); c.lineTo(x - 8, capY + 50); c.moveTo(x + 40, capY + 12); c.lineTo(x + 8, capY + 50); c.stroke();
      // (an iron strap and its bolts)
      box(c, x - 10, capY - 6, 20, 12, '#3A3E44'); box(c, x - 6, capY - 2, 3, 3, '#9CA3AF'); box(c, x + 3, capY - 2, 3, 3, '#9CA3AF');
      // (the lantern, hung off the cap)
      if (hash(x * 0.07) < 0.75) drawLantern(c, x + 24, capY + 20, f);
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The station's rock shelf (the friendly track runs on along it), the portal out of the station

const drawShelf = (c: Ctx, eye: Eye, L: number, R: number) => {
  if (R < SHELF_X0 || L > SHELF_X1 + 300) return;
  const r = rampOf('#4A3A32');
  // (the floor of it, going back to the wall: banded, darker the further)
  const ds = [WALL_D, 0.8, 0.88, 0.95, 1.02, 1.08];
  for (let i = 0; i < ds.length - 1; i++) {
    const col = [r[0], mix(r[0], r[1], 0.5), r[1], mix(r[1], r[2], 0.5), r[2]][i];
    quad(c, col, at(eye, SHELF_X0, GY, ds[i]), at(eye, SHELF_X1, GY, ds[i]), at(eye, SHELF_X1, GY, ds[i + 1]), at(eye, SHELF_X0, GY, ds[i + 1]));
  }
  // (grit on it: as far back as 0.75, so culled by where that lands on screen, not by his plane's edges)
  const [g0, g1] = spanAt(eye, 0.75, 10);
  for (let x = Math.floor(Math.max(g0, SHELF_X0) / 40) * 40; x < Math.min(g1, SHELF_X1); x += 40) {
    const d = 0.75 + hash(x * 0.3) * 0.3, p = at(eye, x, GY, d);
    box(c, p[0], p[1], 4 * d, 2, r[3]); box(c, p[0] + 6, p[1] + 1, 2, 1, r[0]);
  }
  // (its near edge, then the cliff down into the dark)
  const e0 = at(eye, SHELF_X0, GY, 1.08), e1 = at(eye, SHELF_X1, GY, 1.08);
  box(c, e0[0], e0[1], e1[0] - e0[0], 3, r[3]);
  bandedGradient(c, e0[0], e0[1] + 3, e1[0] - e0[0], 520, [r[1], dark(r[0], 0.4), '#06060A'], 8);
  for (let x = Math.floor(Math.max(L, SHELF_X0) / 60) * 60; x < Math.min(R, SHELF_X1); x += 60) box(c, x + hash(x) * 30, e0[1] + 10 + hash(x * 2) * 40, 2, 30 + hash(x * 3) * 60, 'rgba(0, 0, 0, 0.35)');
  // (the shelf's end: its side face, the edge of it lit, falling away)
  if (eye.x > SHELF_X1) {
    const a = at(eye, SHELF_X1, GY, WALL_D), b = at(eye, SHELF_X1, GY, 1.08);
    quad(c, r[1], a, b, [b[0], b[1] + 500], [a[0], a[1] + 500]);
    seg(c, a, b, r[4], 2);
  }
};

const drawPortal = (c: Ctx, eye: Eye) => {
  // the tunnel out of the station (he came through it): a timber portal in the rock, black inside, the sign over it
  inDepth(c, eye, 0.9, () => stamp(c, 'cart-portal', X - 180, GY - 260, 300, 262, g => {
    const px = X - 150;
    box(g, px, GY - 200, 220, 200, '#06060A');
    for (const [x0, w] of [[px - 22, 22], [px + 220, 22]]) { slab(g, x0, GY - 210, w, 210, TIMBER, { edge: 2 }); }
    slab(g, px - 30, GY - 232, 280, 26, TIMBER, { edge: 4 });
    sign(g, px + 20, GY - 256, 180, 16, '#5A1A0C', 'LOADING STATION', '#F2C14E', 6, '#7A5224');
    // (the bit of the station you can see back in there: a lamp, the platform's yellow edge)
    box(g, px + 30, GY - 6, 160, 3, '#8A7020'); box(g, px + 90, GY - 150, 4, 30, '#2A2A2E'); box(g, px + 86, GY - 120, 12, 6, '#FCD34D');
  }));
};

// ---------------------------------------------------------------------------------------------------------------
// The track: the trestle under it, the ties (from above), the two rails; the gaps

const tie = (c: Ctx, eye: Eye, x: number, y: number, col: string) => {
  const a = at(eye, x - 6, y + 1, RAIL_FAR - 0.02), b = at(eye, x + 6, y + 1, RAIL_FAR - 0.02), cc = at(eye, x + 6, y + 1, RAIL_NEAR + 0.025), d = at(eye, x - 6, y + 1, RAIL_NEAR + 0.025);
  quad(c, col, a, b, cc, d);
  box(c, d[0], d[1], cc[0] - d[0], 3, dark(col, 0.4));
};

/** The trestle down from x (one bent: two legs, going down into the dark, a brace or two). */
const bent = (c: Ctx, eye: Eye, x: number, y: number, floor: number | null) => {
  const bot = floor ?? y + 700;
  for (const d of [RAIL_FAR - 0.01, RAIL_NEAR + 0.02]) {
    const a = at(eye, x, y + 4, d), b = at(eye, x, bot, d);
    const col = d < 1 ? '#3A2818' : '#5A3E24';
    box(c, a[0] - 4, a[1], 8, b[1] - a[1], INK);
    box(c, a[0] - 3, a[1], 6, b[1] - a[1], col);
    box(c, a[0] - 3, a[1], 2, b[1] - a[1], lite(col, 0.2));
  }
  // (the cross-tie across the bent, under the rails)
  const p = at(eye, x, y + 30, RAIL_FAR - 0.01), q = at(eye, x, y + 30, RAIL_NEAR + 0.02);
  seg(c, p, q, '#4A3420', 4);
};

const drawTrack = (c: Ctx, eye: Eye, L: number, R: number) => {
  // (the bents first: trestles under every run, braced between, the floor under them where the shelf is)
  for (const [a, b, ya, yb] of RUNS) {
    if (b < L - 60 || a > R + 60) continue;
    const yAt = (x: number) => ya + ((x - a) / (b - a)) * (yb - ya);
    let prev: Pt | null = null;
    for (let x = Math.max(a + 10, Math.floor((L - 60) / 64) * 64); x <= Math.min(b - 6, R + 60); x += 64) {
      const y = yAt(x);
      const onShelf = x > SHELF_X0 && x < SHELF_X1;
      if (onShelf && y >= GY - 2) { prev = null; continue; }
      bent(c, eye, x, y, onShelf ? GY : null);
      // (X-bracing between this bent and the last, near rail side)
      const here = at(eye, x, y + 10, RAIL_NEAR + 0.02);
      if (prev) {
        const lo = at(eye, x, y + 110, RAIL_NEAR + 0.02);
        c.strokeStyle = '#4A3420'; c.lineWidth = 3; c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(lo[0], lo[1]); c.moveTo(here[0], here[1]); c.lineTo(prev[0], prev[1] + (lo[1] - here[1])); c.stroke();
      }
      prev = here;
    }
  }
  // (the ties, seen from above, then the rails: the far one dimmer, the near one lit along its top: it's what he's on)
  for (const [a, b, ya, yb] of RUNS) {
    if (b < L || a > R) continue;
    const yAt = (x: number) => ya + ((x - a) / (b - a)) * (yb - ya);
    for (let x = Math.max(a + 4, Math.floor(L / 20) * 20); x <= Math.min(b - 4, R); x += 20) tie(c, eye, x, yAt(x), hash(x * 0.17) < 0.15 ? '#4A3220' : '#5E4028');
    for (const d of [RAIL_FAR, RAIL_NEAR]) {
      const p = at(eye, a, ya - 1, d), q = at(eye, b, yb - 1, d);
      seg(c, [p[0], p[1] + 2], [q[0], q[1] + 2], INK, 3);
      seg(c, p, q, d < 1 ? '#6A7280' : '#A8B0BA', 2);
      seg(c, [p[0], p[1] - 1], [q[0], q[1] - 1], d < 1 ? '#9CA3AF' : '#F1F5F9', 1);
    }
  }
  // the gaps: the ends splintered (a stub of tie, a rail end bent down), a red lantern on a post either side
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const g0 = RUNS[i][1], g1 = RUNS[i + 1][0];
    if (g1 - g0 < 20 || g1 < L - 100 || g0 > R + 100) continue;
    for (const [ex, ey, dir] of [[g0, RUNS[i][3], 1], [g1, RUNS[i + 1][2], -1]] as const) {
      for (const d of [RAIL_FAR, RAIL_NEAR]) {
        const p = at(eye, ex, ey - 1, d), q = at(eye, ex + dir * 10, ey + 6, d);
        seg(c, p, q, d < 1 ? '#6A7280' : '#A8B0BA', 2);
      }
      // (splinters)
      for (let k = 0; k < 4; k++) { const sp = at(eye, ex + dir * (2 + k * 3), ey + 2 + k * 2, 0.97 + k * 0.012); box(c, sp[0], sp[1], 3, 6 + k * 2, k % 2 ? '#7A5530' : '#A07A48'); }
      // (the lantern on its post, red: keep off)
      const lp = at(eye, ex - dir * 14, ey, 0.94);
      box(c, lp[0] - 2, lp[1] - 60, 4, 60, '#3A2818');
      drawLantern(c, lp[0], lp[1] - 76, 0, '#EF4444');
    }
    // (and the drop: the void, a little darker, a glint of water way down)
    const top = Math.min(RUNS[i][3], RUNS[i + 1][2]);
    c.fillStyle = 'rgba(0, 0, 0, 0.35)'; c.fillRect(g0, top + 8, g1 - g0, 900);
    const wy = top + 520 + Math.sin(g0) * 40;
    box(c, g0 + (g1 - g0) * 0.3, wy, (g1 - g0) * 0.4, 1, 'rgba(125, 211, 252, 0.25)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The fork: the friendly track curving off back into IT'S A FRIENDLY WORLD; the switch stand; the signs

/** Along the friendly track: how far back it goes (it bends away from the camera, off into the background). */
const friendlyD = (x: number) => 1 - 0.14 * Math.min(1, Math.max(0, (x - FORK_X) / 700)) ** 1.5;
const drawFriendly = (c: Ctx, eye: Eye, f: number, L: number, R: number) => {
  if (R < FORK_X || L > FRIENDLY_END + 400) return;
  // the arch at the end of it: pastel, a rainbow, its marquee, and the dolls out front welcoming everybody
  const ad = friendlyD(FRIENDLY_END);
  inDepth(c, eye, ad - 0.02, () => {
    const ax = FRIENDLY_END - 300;
    stamp(c, 'cart-friendly-arch', ax - 40, GY - 300, 380, 302, g => {
      slab(g, ax, GY - 200, 300, 200, '#F9C8E0', { edge: 4 });
      for (let k = 0; k < 6; k++) { g.strokeStyle = ['#F87171', '#FB923C', '#FDE047', '#4ADE80', '#60A5FA', '#C084FC'][k]; g.lineWidth = 6; g.beginPath(); g.arc(ax + 150, GY - 60, 130 - k * 6, Math.PI, 0); g.stroke(); }
      box(g, ax + 60, GY - 110, 180, 110, '#1E1B4B');
      g.fillStyle = '#1E1B4B'; g.beginPath(); g.arc(ax + 150, GY - 110, 90, Math.PI, 0); g.fill();
      for (const tx of [ax - 20, ax + 290]) { slab(g, tx, GY - 260, 30, 260, '#FDE68A', { edge: 2 }); ball(g, tx + 15, GY - 268, 12, '#F472B6'); }
      sign(g, ax + 20, GY - 290, 260, 26, '#FDF2F8', "IT'S A FRIENDLY WORLD", '#BE185D', 8, '#F472B6');
    });
    // (the light inside, going round the colors)
    const col = ['#F472B6', '#60A5FA', '#FDE047', '#4ADE80'][Math.floor(f / 40) % 4];
    steppedGlow(c, ax + 150, GY - 70, 80, col, 0.3, 0.03, 4);
    for (let k = 0; k < 8; k++) { const on = (Math.floor(f / 8) + k) % 3 === 0; box(c, ax + 12 + k * 38, GY - 296, 6, 6, on ? '#FFFFFF' : '#F9A8D4'); }
  });
  // (the rails and ties of it, bending back)
  const [t0, t1] = spanAt(eye, 0.79, 20);
  for (let x = Math.max(FORK_X, Math.floor(t0 / 20) * 20); x < Math.min(FRIENDLY_END - 150, t1); x += 20) {
    const d = friendlyD(x);
    quad(c, '#5E4028', at(eye, x - 5, GY + 1, d - 0.065), at(eye, x + 5, GY + 1, d - 0.065), at(eye, x + 5, GY + 1, d + 0.005), at(eye, x - 5, GY + 1, d + 0.005));
  }
  for (const off of [-0.045, 0]) {
    c.strokeStyle = '#A8B0BA'; c.lineWidth = 2; c.beginPath();
    for (let x = FORK_X; x <= FRIENDLY_END - 150; x += 20) { const p = at(eye, x, GY - 1, friendlyD(x) + off); if (x === FORK_X) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
    c.stroke();
  }
  // the dolls, out along it, bobbing and singing
  for (let i = 0; i < 5; i++) {
    const bx = X + 1560 + i * 110, d = friendlyD(bx) - 0.08;
    inDepth(c, eye, d, () => {
      const bob = Math.round(Math.sin(f * 0.12 + i * 1.3) * 3);
      const dress = ['#F472B6', '#60A5FA', '#FDE047', '#4ADE80', '#C084FC'][i];
      const y = GY - 6 + bob;
      // (a little stand, the doll on it: a dress, a round head, a bonnet, a mouth open singing)
      slab(c, bx - 14, GY - 8, 28, 8, '#D6D3D1', { edge: 2 });
      c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 14, y); c.lineTo(bx + 14, y); c.lineTo(bx + 6, y - 30); c.lineTo(bx - 6, y - 30); c.closePath(); c.fill();
      c.fillStyle = dress; c.beginPath(); c.moveTo(bx - 12, y - 1); c.lineTo(bx + 12, y - 1); c.lineTo(bx + 5, y - 29); c.lineTo(bx - 5, y - 29); c.closePath(); c.fill();
      ball(c, bx, y - 40, 11, '#F6DCC8');
      box(c, bx - 12, y - 52, 24, 6, dark(dress, 0.1)); box(c, bx - 9, y - 56, 18, 6, dress);
      box(c, bx - 5, y - 42, 2, 2, INK); box(c, bx + 3, y - 42, 2, 2, INK);
      const sing = Math.sin(f * 0.2 + i) > 0;
      box(c, bx - 2, y - 36, 4, sing ? 4 : 1, '#7F1D1D');
      box(c, bx - 8, y - 38, 3, 2, '#F9A8D4'); box(c, bx + 5, y - 38, 3, 2, '#F9A8D4');
    });
  }
};

/** A sign on a post (or two), the board on top: mounted, the words on it. */
const postSign = (c: Ctx, x: number, foot: number, h: number, w: number, words: string, face: string, ink: string, size = 7, arrow: 'right' | 'up' | null = null) => {
  const top = foot - h;
  for (const px of [x - w / 2 + 10, x + w / 2 - 14]) pole(c, px, top, 4, h, '#6A4A2A');
  sign(c, x - w / 2, top - 22, w, 20, face, words, ink, size, '#4A3420');
  if (arrow === 'right') {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x + w / 2 + 8, top - 24); c.lineTo(x + w / 2 + 26, top - 12); c.lineTo(x + w / 2 + 8, top); c.closePath(); c.fill();
    c.fillStyle = ink; c.beginPath(); c.moveTo(x + w / 2 + 10, top - 20); c.lineTo(x + w / 2 + 22, top - 12); c.lineTo(x + w / 2 + 10, top - 4); c.closePath(); c.fill();
  } else if (arrow === 'up') {
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 14, top - 26); c.lineTo(x, top - 46); c.lineTo(x + 14, top - 26); c.closePath(); c.fill();
    c.fillStyle = ink; c.beginPath(); c.moveTo(x - 10, top - 28); c.lineTo(x, top - 42); c.lineTo(x + 10, top - 28); c.closePath(); c.fill();
  }
};

const drawFork = (c: Ctx, eye: Eye, cart: Cart) => {
  // the switch stand: a post, the throw lever, the target (green straight on, red for the siding) and its lamp
  const up = cart.scanT >= 40 || cart.x > FORK_X;
  inDepth(c, eye, 0.95, () => {
    const sx = FORK_X - 40;
    slab(c, sx - 14, GY - 16, 28, 16, '#3A3E44', { edge: 2 });
    pole(c, sx - 2, GY - 70, 5, 56, '#4A4E56');
    const col = up ? '#DC2626' : '#16A34A';
    ball(c, sx + 1, GY - 78, 10, col);
    box(c, sx - 3, GY - 82, 8, 8, lite(col, 0.5));
    c.save(); c.translate(sx, GY - 14); c.rotate(up ? -0.9 : 0.9);
    box(c, -2, -28, 4, 28, '#A1A1AA'); ball(c, 0, -30, 4, '#E8C130');
    c.restore();
  });
  inDepth(c, eye, 0.93, () => {
    postSign(c, FORK_X + 120, GY, 50, 150, 'FRIENDLY GUESTS', '#14532D', '#BBF7D0', 6, 'right');
    postSign(c, FORK_X + 330, GY, 190, 170, 'UNFRIENDLY GUESTS', '#450A0A', '#FCA5A5', 6, 'up');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The guest scanner: a gantry over the track, its eyes, its fan of red light, its readout up top

const drawScanner = (c: Ctx, eye: Eye, state: GameState, cart: Cart) => {
  const f = state.frame, S = SCANNER_X;
  const scanning = cart.scanT > 0 && cart.scanT < 400;
  // (the frame: posts either end, behind the track)
  inDepth(c, eye, 0.93, () => {
    for (const px of [S - 66, S + 50]) { pole(c, px, GY - 200, 14, 200, '#5A5E66'); box(c, px - 4, GY - 6, 22, 6, '#3A3E44'); }
    // (the readout up on top: a dot-matrix board)
    slab(c, S - 140, GY - 300, 280, 70, '#18181B', { edge: 4 });
    box(c, S - 132, GY - 292, 264, 54, '#0A0A0C');
    // (its dots: a faint grid)
    checker(c, S - 132, GY - 292, 264, 54, 'rgba(255, 80, 60, 0.05)');
    if (scanning) {
      const flash = Math.floor(cart.scanT / 8) % 2 === 0;
      const what = isNude(state) ? 'UNFRIENDLY (NO PANTS)' : isShat(state) ? 'UNFRIENDLY (SOILED)' : 'UNFRIENDLY';
      if (cart.scanT < 30) text(c, 'SCANNING' + '.'.repeat(1 + Math.floor(cart.scanT / 8) % 3), S, GY - 260, '#FCD34D', 8, 'center', null);
      else {
        text(c, 'GUEST STATUS:', S, GY - 270, '#E5E7EB', 8, 'center', null);
        text(c, what, S, GY - 250, flash ? '#F87171' : '#B91C1C', 8, 'center', null);
      }
    } else {
      const msg = ['PLEASE REMAIN SEATED', 'SMILE!', 'HAVE A FRIENDLY DAY'][Math.floor(f / 150) % 3];
      text(c, msg, S, GY - 262, '#4ADE80', 7, 'center', null);
    }
    for (const bx of [S - 120, S + 110]) box(c, bx, GY - 230, 6, 30, '#3A3E44');
  });
  // (the head across the track: its top going back, its front, the name on it, the eyes underneath)
  const hy = GY - 200;
  const a = at(eye, S - 72, hy, 0.93), b = at(eye, S + 72, hy, 0.93);
  if (eye.y < hy) quad(c, '#6A7078', [S - 72, hy], [S + 72, hy], b, a);
  slab(c, S - 72, hy, 144, 26, '#4A4E56', { edge: 2 });
  text(c, 'GUEST SCANNER', S, hy + 16, '#A5F3FC', 6, 'center', INK);
  for (let k = 0; k < 3; k++) {
    const ex = S - 40 + k * 40;
    box(c, ex - 6, hy + 26, 12, 6, INK);
    box(c, ex - 4, hy + 27, 8, 4, scanning ? (f % 6 < 3 ? '#F87171' : '#B91C1C') : (f + k * 20) % 90 < 6 ? '#F87171' : '#3F1414');
  }
  // (the fan of light down over him, sweeping)
  if (scanning) {
    const sw = Math.sin(cart.scanT * 0.25) * 40;
    for (let k = 0; k < 3; k++) {
      c.fillStyle = `rgba(248, 113, 113, ${0.09 - k * 0.025})`;
      c.beginPath(); c.moveTo(S - 6, hy + 32); c.lineTo(S + 6, hy + 32); c.lineTo(S + sw + 30 + k * 16, GY); c.lineTo(S + sw - 30 - k * 16, GY); c.closePath(); c.fill();
    }
    box(c, S + sw - 30, GY - 70 + Math.sin(cart.scanT * 0.5) * 50, 60, 2, 'rgba(255, 120, 120, 0.7)');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The low beams: a timber set right across the track, at head height, striped; a lamp on it, blinking

/**
 * Each low beam is the foot of a bulkhead: a timbered wall across the track from the wall behind it (SET_D) to past
 * the camera (BULK_NEAR), solid from the beam right up out of sight, the gap under it all there is. Seen from the side
 * it's its end (cut at the near side) and the face of it toward the eye, going back.
 */
const BULK_NEAR = 1.1, BULK_W = 22;
/** Up out of sight at every depth it's drawn at (however high the camera is). */
const bulkTop = (eye: Eye) => eye.y - (CANVAS_HEIGHT * 0.42 + 60) / SET_D;
const bulkSide = (c: Ctx, eye: Eye, b: number, d0: number, d1: number) => {
  const rail = trackY(b) ?? GY, by = rail - BEAM_CLEAR - 22, top = bulkTop(eye);
  const sx = eye.x < b - BULK_W ? b - BULK_W : eye.x > b + BULK_W ? b + BULK_W : null;
  if (sx === null) return;
  const r = rampOf(dark(TIMBER, 0.25));
  // (in steps going back, darker the further: the lagging planks' ends)
  const steps = [d0, d0 + (d1 - d0) * 0.34, d0 + (d1 - d0) * 0.67, d1];
  for (let i = 0; i < 3; i++) {
    const a = steps[i], z = steps[i + 1], col = [r[1], mix(r[1], r[2], 0.5), r[2]][d1 > 1 ? 2 : i];
    quad(c, col, at(eye, sx, top, a), at(eye, sx, top, z), at(eye, sx, by, z), at(eye, sx, by, a));
  }
  // (the planks, one over the next all the way up: their seams going back)
  c.strokeStyle = r[0]; c.lineWidth = 1; c.beginPath();
  for (let y = by - 18; y > top; y -= 18) { const p = at(eye, sx, y, d0), q = at(eye, sx, y, d1); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); }
  c.stroke();
  // (its bottom edge, over the gap, lit)
  seg(c, at(eye, sx, by, d0), at(eye, sx, by, d1), r[3], 2);
};
const drawBeam = (c: Ctx, eye: Eye, b: number, f: number) => {
  const rail = trackY(b) ?? GY, by = rail - BEAM_CLEAR;
  // (the bulkhead's face toward the eye, from the wall behind out to his plane)
  bulkSide(c, eye, b, SET_D, 1);
  // (the beam itself: end on, going back across the track; its top seen from above, its underside's shadow)
  const f0 = at(eye, b - 22, by - 22, 1.1), f1 = at(eye, b + 22, by - 22, 1.1);
  const lo0 = at(eye, b - 22, by, 1.1);
  // (its front end: hazard stripes painted on it)
  box(c, f0[0] - 1, f0[1] - 1, f1[0] - f0[0] + 2, lo0[1] - f0[1] + 2, INK);
  c.save(); c.beginPath(); c.rect(f0[0], f0[1], f1[0] - f0[0], lo0[1] - f0[1]); c.clip();
  box(c, f0[0], f0[1], f1[0] - f0[0], lo0[1] - f0[1], '#E8C130');
  c.fillStyle = '#1A1A1A';
  for (let k = -40; k < 60; k += 12) { c.beginPath(); c.moveTo(f0[0] + k, f0[1]); c.lineTo(f0[0] + k + 6, f0[1]); c.lineTo(f0[0] + k + 6 - 24, lo0[1]); c.lineTo(f0[0] + k - 24, lo0[1]); c.closePath(); c.fill(); }
  box(c, f0[0], f0[1], f1[0] - f0[0], 2, 'rgba(255,255,255,0.35)');
  c.restore();
  void f;
};
/** The bulkhead's near part: its face toward the eye from his plane on out, and its cut end; the lamp on it. */
const beamFrontPost = (c: Ctx, eye: Eye, b: number, f: number) => {
  const rail = trackY(b) ?? GY, by = rail - BEAM_CLEAR - 22, top = bulkTop(eye);
  bulkSide(c, eye, b, 1, BULK_NEAR);
  const a = at(eye, b - BULK_W, top, BULK_NEAR), z = at(eye, b + BULK_W, by, BULK_NEAR);
  const w = z[0] - a[0], h = z[1] - a[1];
  const r = rampOf(dark(TIMBER, 0.35));
  box(c, a[0] - 2, a[1], w + 4, h, INK);
  box(c, a[0], a[1], w, h, r[1]);
  // (its planks' ends, stepped: one in three a shade lighter; the posts either side of it)
  for (let k = 0; ; k++) { const y = z[1] - (k + 1) * 20; if (y < a[1]) break; box(c, a[0], y, w, 1, r[0]); if (k % 3 === 1) box(c, a[0] + 6, y + 1, w - 12, 19, r[2]); }
  box(c, a[0], a[1], 6, h, r[2]); box(c, a[0] + w - 6, a[1], 6, h, r[0]);
  // (the lamp on it, over the beam: amber, blinking)
  const on = f % 40 < 24, lx = a[0] + w / 2, ly = z[1] - 14;
  box(c, lx - 7, ly - 7, 14, 14, INK);
  ball(c, lx, ly, 5, on ? '#F59E0B' : '#78350F');
  if (on) steppedGlow(c, lx, ly, 26, '#F59E0B', 0.25, 0.02, 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The ramp at the end: round and straight up, on a lattice tower, the sign bolted to it, the stop at the top; up there,
// the temple's floor, the day through the cracks in it

const drawRamp = (c: Ctx, eye: Eye, f: number) => {
  // (the tower: timbers up from the dark, cross-braced)
  const tx = RAMP_X + RAMP_R + 2;
  for (const d of [0.94, 1.02]) {
    for (const lx of [tx, tx + 40]) {
      const a = at(eye, lx, RAIL_TOP - 20, d), b = at(eye, lx, RAMP_Y + 700, d);
      box(c, a[0] - 4, a[1], 8 * d, b[1] - a[1], INK); box(c, a[0] - 3, a[1], 6 * d, b[1] - a[1], d < 1 ? '#3A2818' : '#5A3E24');
    }
  }
  for (let y = RAIL_TOP; y < RAMP_Y + 600; y += 80) {
    seg(c, at(eye, tx, y, 1.02), at(eye, tx + 40, y + 80, 1.02), '#4A3420', 3);
    seg(c, at(eye, tx + 40, y, 1.02), at(eye, tx, y + 80, 1.02), '#4A3420', 3);
  }
  // (the curve's bents, under the arc)
  for (let a = 0.15; a < Math.PI / 2; a += 0.3) {
    const x = RAMP_X + Math.sin(a) * RAMP_R, y = RAMP_Y - (1 - Math.cos(a)) * RAMP_R;
    bent(c, eye, x, y, null);
  }
  // (the ties round the curve and up, radial; then the two rails)
  const pt = (s: number): [number, number, number] => {
    const arc = (Math.PI / 2) * RAMP_R;
    if (s < arc) { const a = s / RAMP_R; return [RAMP_X + Math.sin(a) * RAMP_R, RAMP_Y - (1 - Math.cos(a)) * RAMP_R, a]; }
    return [RAMP_X + RAMP_R, RAMP_Y - RAMP_R - (s - arc), Math.PI / 2];
  };
  const total = (Math.PI / 2) * RAMP_R + (RAMP_Y - RAMP_R - RAIL_TOP);
  for (let s = 0; s < total; s += 20) {
    const [x, y, a] = pt(s);
    const nx = Math.sin(a), ny = Math.cos(a);
    // (a tie: across the rail's depth, its thickness out from the rail's underside)
    const p0 = at(eye, x + nx * 2, y + ny * 2, RAIL_FAR - 0.02), p1 = at(eye, x + nx * 2, y + ny * 2, RAIL_NEAR + 0.025);
    seg(c, p0, p1, '#5E4028', 6);
  }
  for (const d of [RAIL_FAR, RAIL_NEAR]) {
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath();
    for (let s = 0; s <= total; s += 10) { const [x, y] = pt(s); const p = at(eye, x, y, d); if (!s) c.moveTo(p[0], p[1]); else c.lineTo(p[0], p[1]); }
    c.stroke();
    c.strokeStyle = d < 1 ? '#6A7280' : '#C8D0DA'; c.lineWidth = 2; c.stroke();
  }
  // (the stop at the top: a bumper, bent back, a flag on it)
  const top = at(eye, RAMP_X + RAMP_R, RAIL_TOP, 1);
  slab(c, top[0] - 12, top[1] - 10, 50, 10, '#7C2D12', { edge: 2 });
  box(c, top[0] + 30, top[1] - 30, 2, 20, '#A1A1AA'); box(c, top[0] + 32, top[1] - 30, 12, 8, f % 20 < 10 ? '#DC2626' : '#B91C1C');
  // (the sign, bolted to the tower on brackets: it's the end)
  const sy = RAMP_Y - 250;
  box(c, tx - 12, sy + 6, 14, 4, '#3A3E44'); box(c, tx - 12, sy + 40, 14, 4, '#3A3E44');
  sign(c, tx - 150, sy, 140, 24, '#7F1D1D', 'END OF LINE', '#FEE2E2', 8, '#3A3E44');
  sign(c, tx - 150, sy + 34, 140, 16, '#F1EFEA', 'NO RIDERS PAST THIS POINT', '#7F1D1D', 4, '#3A3E44');
  // (and up top: the temple's floor from under, its joists, the day through its cracks)
  const ceil = RAIL_TOP - 160;
  const L = RAMP_X - 700, R = RAMP_X + RAMP_R + 700;
  box(c, L, ceil - 400, R - L, 400, '#140E0A');
  for (let x = L; x < R; x += 60) { box(c, x, ceil - 30, 18, 40, '#3A2818'); box(c, x, ceil - 30, 4, 40, '#4E3826'); }
  box(c, L, ceil - 36, R - L, 8, '#2A1C12');
  const day = skyAt(0.6);
  for (let k = 0; k < 6; k++) {
    const cx = RAMP_X - 300 + k * 170 + hash(k) * 60;
    box(c, cx, ceil - 36, 3 + hash(k * 3) * 6, 8, day);
    c.fillStyle = mix(day, '#000000', 0.2).replace('#', '#') ; c.globalAlpha = 0.08; c.beginPath(); c.moveTo(cx, ceil - 28); c.lineTo(cx + 6, ceil - 28); c.lineTo(cx + 40, ceil + 300); c.lineTo(cx - 20, ceil + 300); c.closePath(); c.fill(); c.globalAlpha = 1;
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lot, back to front

export const drawCartTrack = (c: Ctx, state: GameState, cart: Cart) => {
  const L = state.camera.x - 100, R = state.camera.x + CANVAS_WIDTH + 100;
  if (R < X - 400 || L > x1) return;
  const f = state.frame, eye = eyeOf(state);
  rockWall(c, eye, FAR_D, 'cart-far', 0, 0);
  crystals(c, eye, f);
  haze(c, state);
  distantTrestle(c, eye, f);
  haze(c, state);
  pillars(c, eye);
  haze(c, state);
  rockWall(c, eye, WALL_D, 'cart-wall', 2, 0.12, wallRidge);
  timberSets(c, eye, f);
  c.fillStyle = 'rgba(8, 10, 20, 0.18)'; c.fillRect(state.camera.x - 10, state.camera.y - 10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
  drawShelf(c, eye, L, R);
  if (L < X + 200) drawPortal(c, eye);
  drawFriendly(c, eye, f, L, R);
  if (R > SCANNER_X - 200 && L < FORK_X + 600) { drawScanner(c, eye, state, cart); drawFork(c, eye, cart); }
  drawTrickSets(c, eye, state, cart.tricks);
  drawTrack(c, eye, L, R);
  // (the first gap and the first beam, signed: to teach)
  inDepth(c, eye, 0.94, () => {
    if (L < X + 2900 && R > X + 2600) postSign(c, X + 2760, (trackY(X + 2760) ?? GY), 60, 110, 'GAP AHEAD', '#1C1917', '#FDE047', 6);
    if (L < X + 3400 && R > X + 3100) postSign(c, X + 3300, (trackY(X + 3300) ?? GY), 60, 110, 'LOW BEAM', '#1C1917', '#FCA5A5', 6);
    if (L < X + 600 && R > X + 200) postSign(c, X + 470, GY, 60, 170, 'KEEP SEATED', '#14532D', '#BBF7D0', 6);
  });
  for (const b of BEAMS) if (b > L - 60 && b < R + 60) drawBeam(c, eye, b, f);
  drawTrickActors(c, eye, state, cart.tricks);
  // (the ramp's overhead (the temple's floor from under) starts 700 short of it)
  if (R > RAMP_X - 720) drawRamp(c, eye, f);
  // (and the dark coming up out of the depths under it all)
  const rail = cart.mode === 'ride' ? cart.railY : eye.y + 182;
  hazeBands(c, state.camera.x - 10, rail + 70, CANVAS_WIDTH + 20, 420, '#04050A', 0, 0.8, 6);
  c.fillStyle = 'rgba(4, 5, 10, 0.8)'; c.fillRect(state.camera.x - 10, rail + 490, CANVAS_WIDTH + 20, 2000);
};

/** Nearer than him: the beams' front posts, now and then a stalactite hung down past the camera. */
export const drawCartFront = (c: Ctx, state: GameState) => {
  const L = state.camera.x - 100, R = state.camera.x + CANVAS_WIDTH + 100;
  if (R < X - 400 || L > x1) return;
  const eye = eyeOf(state);
  for (const b of BEAMS) if (b > L - 60 && b < R + 60) beamFrontPost(c, eye, b, state.frame);
  const d = 1.4;
  const [s0, s1] = spanAt(eye, d, 100);
  inDepth(c, eye, d, () => {
    for (let x = Math.floor(s0 / 700) * 700; x < s1; x += 700) {
      const k = hash(x * 0.29);
      if (k < 0.45) continue;
      const sx = x + k * 300, top = eye.y - CANVAS_HEIGHT * 0.42 / d - 10, len = 40 + k * 70;
      c.fillStyle = '#07070B'; c.beginPath(); c.moveTo(sx - 40, top); c.lineTo(sx + 40, top); c.lineTo(sx + 8, top + len); c.lineTo(sx, top + len + 30); c.lineTo(sx - 10, top + len * 0.7); c.closePath(); c.fill();
      c.fillStyle = '#16141C'; c.beginPath(); c.moveTo(sx - 40, top); c.lineTo(sx - 30, top); c.lineTo(sx - 6, top + len * 0.75); c.lineTo(sx - 10, top + len * 0.7); c.closePath(); c.fill();
      box(c, sx + 1, top + len + 22, 3, 4, '#2A3040');
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The light: dark underground, the lanterns flickering, the scanner's red, the friendly world's glow, a red lantern at
// every gap, a lamp on every beam, the cart's own headlamp and the light round him

export const cartLighting = (state: GameState, cart: Cart): SceneLight => {
  const eye = eyeOf(state), f = state.frame;
  const lights: Light[] = [];
  const cam = state.camera.x;
  const near = (x: number) => x > cam - 300 && x < cam + CANVAS_WIDTH + 300;
  for (const s of setsOn(eye)) {
    if (hash(s.x * 0.07) >= 0.75) continue;
    const [lx, ly] = at(eye, s.x + 24, s.y - 250 + 30, SET_D);
    if (near(lx)) lights.push({ x: lx, y: ly, r: 190, a: 0.75 * lanternFlicker(s.x + 24, f), color: 'rgba(255, 170, 80, 0.12)' });
  }
  for (let i = 0; i + 1 < RUNS.length; i++) {
    const g0 = RUNS[i][1], g1 = RUNS[i + 1][0];
    if (g1 - g0 < 20) continue;
    if (near(g0)) lights.push({ x: g0 - 14, y: RUNS[i][3] - 70, r: 110, a: 0.7, color: 'rgba(239, 68, 68, 0.12)' });
    if (near(g1)) lights.push({ x: g1 + 14, y: RUNS[i + 1][2] - 70, r: 110, a: 0.7, color: 'rgba(239, 68, 68, 0.12)' });
  }
  for (const b of BEAMS) if (near(b)) lights.push({ x: b, y: (trackY(b) ?? GY) - BEAM_CLEAR - 30, r: 140, a: f % 40 < 24 ? 0.8 : 0.55, color: 'rgba(245, 158, 11, 0.12)' });
  if (near(SCANNER_X)) {
    lights.push({ x: SCANNER_X, y: GY - 265, r: 160, a: 0.6, color: 'rgba(248, 113, 113, 0.08)' });
    if (cart.scanT > 0 && cart.scanT < 400) lights.push({ x: SCANNER_X, y: GY - 170, r: 200, a: 0.8, cone: 70, color: 'rgba(248, 113, 113, 0.14)' });
  }
  if (near(FRIENDLY_END - 150)) lights.push({ x: at(eye, FRIENDLY_END - 150, GY - 80, 0.86)[0], y: at(eye, FRIENDLY_END - 150, GY - 80, 0.86)[1], r: 260, a: 0.8, color: 'rgba(244, 114, 182, 0.12)' });
  if (near(X)) lights.push({ x: X - 40, y: GY - 120, r: 200, a: 0.6, color: 'rgba(252, 211, 77, 0.08)' });
  if (near(RAMP_X)) { lights.push({ x: RAMP_X + RAMP_R - 80, y: RAMP_Y - 240, r: 180, a: 0.7, color: 'rgba(254, 226, 226, 0.06)' }); lights.push({ x: RAMP_X + RAMP_R, y: RAIL_TOP - 100, r: 400, a: 0.6, color: 'rgba(255, 240, 200, 0.06)' }); }
  // (the cart: its lamp ahead, and enough round it that he's never lost)
  if (cart.mode === 'ride' || cart.mode === 'outro') {
    lights.push({ x: cart.x, y: cart.y - 50, r: 170, a: 0.6 });
    if (cart.mode === 'ride') lights.push({ x: cart.x + 170, y: cart.y - 40, r: 150, a: 0.55, color: 'rgba(255, 244, 200, 0.08)' });
  }
  lights.push(...trickLights(state, eye, cart.tricks));
  if (cart.artie.on) lights.push({ x: cart.artie.x, y: artieTrackY(cart.artie.x) - 50, r: 140, a: 0.5 });
  return { dark: 0.55, shade: [4, 6, 14], lights, rim: 0.5 };
};

void floorAt; void RAIL_FAR;
