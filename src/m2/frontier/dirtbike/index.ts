// THE DIRT-BIKE CHASE: section 6 of Wilderness Land, the TEENAGERS sub-boss. The user's design (frontier-spec.md,
// verbatim there): made to look like Road Rash on the Genesis, not Mode 7, with the effects Genesis games used to fake
// a turning road. X / left click (shoot) attacks left, B / right click (charge) attacks right, A jumps. Trees, cows and
// other wildlife by the roadside to bail into (heavy damage, a quick respawn; it only kills him low on health). The
// teens have weapons; instead of stealing them, he PARRIES: attack as they swing and they're done (grab the bike chain,
// swing the teen over his head and toss them forward: a little human bomb ahead of him; and the others: chase.ts).
//
//   road.ts   the segment road (generated as he rides, by stretch), its projection, its drawing, the parallax
//   art.ts    the roadside sprites (crisp, outlined, in scale buckets), the riders from behind (him, the teens, Tucker)
//   chase.ts  the mode itself: riding, the teens' waves and swings, the parries, bails, Tucker glimpsed ahead, the
//             sub-boss bar, the speedo, the end; drawn over the whole screen from drawHud
//   lines.ts  every line, clean / shitty / naked; the new hurts and their death screens
//
// The side view (this file): a short stretch of dirt trail through the real woods (the woods' own far off, trees and
// ground: one eye for the scene). In off the bounty's ride (woods/scene.ts takeBountyHandoff) he's straight into the
// chase on the kid's bike; walked in on foot (a checkpoint before the bounty, say) the bike's parked there: walk onto it.
// Once it's on, there's no leaving it (the sub-boss rule) till the last teen goes down; then the cut to the arena
// (DOORS.arena.start, takeChaseHandoff for job 7's catch-up). Checkpoints 50-55, one a stretch: starting again at one
// puts him straight back on the bike there, the stretches before it beaten. Afterward (TEENS_MEMO, never again): the
// trail's empty but for the wrecks, walkable both ways (the woods behind, the arena ahead).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../../m1/constants';
import type { FrontierSection } from '../section';
import { layOwn, endWalls, runExits, frontierState, hands, type Exit } from '../section';
import { SECTIONS, DOORS, GY } from '../geometry';
import { onScreen, mix } from '../kit';
import { takeBountyHandoff } from '../woods/scene';
import { drawDirtBike } from '../woods/teens';
import { drawWoodsFar } from '../woods/far';
import { bendFloor } from '../../intro/art/kit';
import { markBossFight } from '../../bossQuiet';
import {
  type Ctx, type View, type TreeKind, box, checker, hash, bands, hr, INK, timeOfDay, skyAt, viewOf, at, atDepth, seen, stillAt,
  paintTree, treeBox, bush, FAR, DIRT, DUFF, LIP, GOLD, BROWN, GRANITE, BARK, NEEDLE, MOSS,
} from '../woods/paint';
import { WAVES, inChase, startChase, updateChase, drawChase, teensDone } from './chase';

export { takeChaseHandoff, TEENS_MEMO } from './chase';

const { x0 } = SECTIONS.dirtbike;
const x1 = SECTIONS.dirtbike.x1;
/** The side view's length (the rest of the section's x room is unused: the chase is its own view). */
const LEN = 1800;
const BIKE_X = x0 + 460, CP_X = x0 + 600;
DOORS.dirtbike.end = { x: x0 + LEN - 300, y: GY };

interface Side { pending: number | null; first: boolean }
/** (its own slot in the stage's section states, beside the chase's 'dirtbike') */
const sideOf = (state: GameState) => frontierState<Side>(state, 'dirtbike-side' as 'dirtbike', () => ({ pending: null, first: true }));

const exits = (done: boolean): Exit[] => [
  ...(done ? [{ x0: x0 + LEN - 60, x1: x0 + LEN, yTop: GY - 40, yBot: GY + 2, to: DOORS.arena.start }] : []),
];

// ---------------------------------------------------------------------------------------------------------------
// The side view's art (the final pass: the woods' kit, peak SNES): the woods' real far off (the sky, the Rockies, the
// clear-cut ridge, the ragged pines), the forest floor going back banded into the haze, the back rank as a cached tile,
// trees between (every one different, deepest first, culled by where they're drawn), big ones by the trail; the trail
// coming toward him (packed dirt, two ruts and the knobbies' tread down it, roots, stones, needles and turned leaves)
// stamped and bent, its lit lip; the bike parked on it, or after, the wrecks in the ditch.

/** How far toward him the floor under his feet comes (bent); under that, the earth. */
const BAND = 150, SOIL = 420;
/** The trees stood back: [x along the stub, depth, kind, height]; deepest first. */
const TREES: { rx: number; d: number; k: TreeKind; h: number }[] = (() => {
  const kinds: TreeKind[] = ['fir', 'spruce', 'fir', 'aspen', 'gold', 'spruce', 'snag', 'fir', 'gold', 'lean'];
  const out: { rx: number; d: number; k: TreeKind; h: number }[] = [];
  for (let i = 0; i < 44; i++) out.push({ rx: -160 + i * 48 + hash(i * 3.7) * 30, d: 0.76 + hash(i * 1.9) * 0.18, k: kinds[Math.floor(hash(i * 5.3) * kinds.length)], h: 200 + hash(i * 2.9) * 170 });
  // (the big ones by the trail)
  for (let i = 0; i < 7; i++) out.push({ rx: 90 + i * 290 + hash(i * 7.1) * 80, d: 0.965, k: i % 3 === 1 ? 'gold' : i % 2 ? 'spruce' : 'fir', h: 380 + hash(i * 4.3) * 90 });
  return out.sort((a, b) => a.d - b.d);
})();

const TW = 640;
const paintBackRank = (g: Ctx) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod);
  const dim = (R: string[], k = 0.3) => R.map(col => mix(mix(col, '#1A2430', 0.14), haze, k));
  const N = dim(hr('needle', NEEDLE, 0.4)), B = dim(hr('bark', BARK, 0.4));
  // (a wall of real woods: the dark under it, firs and spruce crowding, gold aspens among them, a snag, brush at their feet)
  box(g, -120, -170, TW + 240, 172, N[1]);
  for (let i = 0; i < 26; i++) {
    const tx = -100 + i * ((TW + 200) / 26) + hash(i * 2.3) * 20, th = 220 + hash(i * 4.1) * 180, k = hash(i * 6.7);
    g.save(); g.translate(tx, 0);
    if (k < 0.12) { const A = dim(hr('gold', GOLD, 0.4)); box(g, -3, -th * 0.7, 6, th * 0.7, dim(['#D8D4C8'])[0]); for (let n = 0; n < 5; n++) { g.fillStyle = A[2 + (n % 3)]; g.beginPath(); g.ellipse((hash(i + n) - 0.5) * 30, -th * 0.7 - n * 9, 18, 14, 0, 0, Math.PI * 2); g.fill(); } }
    else if (k < 0.18) { box(g, -4, -th * 0.75, 8, th * 0.75, dim(['#8E887E'])[0]); for (let n = 0; n < 5; n++) box(g, n % 2 ? 4 : -14, -th * 0.65 + n * 22, 10, 3, dim(['#6E6860'])[0]); }
    else {
      box(g, -3, -th * 0.4, 6, th * 0.4, B[2]);
      for (let t = 0; t < 7; t++) { const u = t / 6, y0 = -th + u * th * 0.82, half = 8 + u * th * 0.16; g.fillStyle = N[1 + (t % 2)]; g.beginPath(); g.moveTo(0, y0 - 6); g.lineTo(half, y0 + th * 0.16); g.lineTo(-half, y0 + th * 0.16); g.closePath(); g.fill(); g.fillStyle = N[3]; g.beginPath(); g.moveTo(0, y0 - 4); g.lineTo(-half, y0 + th * 0.15); g.lineTo(-half * 0.4, y0 + th * 0.15); g.closePath(); g.fill(); }
    }
    g.restore();
  }
  for (let x = -120; x < TW + 120; x += 18) { g.fillStyle = N[(x / 18) % 2 ? 1 : 2]; g.beginPath(); g.ellipse(x, -8, 16, 12, 0, Math.PI, 0); g.fill(); }
};

const CHUNK = 512;
const paintFloor = (g: Ctx, wx: number, w: number) => {
  const D = hr('dirt', DIRT, 0.2), Df = hr('duff', DUFF, 0.2), L = hr('lip', LIP, 0.2), G = hr('gold', GOLD, 0.2), Br = hr('brown', BROWN, 0.2), R = hr('granite', GRANITE, 0.2), B = hr('bark', BARK, 0.2), Ms = hr('moss', MOSS, 0.2);
  // (the earth: the trail's packed dirt banded down into the dark soil)
  bands(g, 0, 0, w, BAND, [D[4], D[4], D[3], D[3], D[3], D[2]]);
  bands(g, 0, BAND, w, SOIL - BAND, [D[2], D[1], D[1], D[0], D[0]]);
  // (duff drifted over the trail's edge)
  for (let x = 0; x < w; x += 2) { const k = hash((wx + x) * 0.37); box(g, x, 0, 2, 5 + k * 8, k > 0.6 ? Df[4] : Df[3]); if (k > 0.8) box(g, x, 5 + k * 8, 2, 2, Df[2]); }
  // (two ruts worn down it, lit along their far lips, the knobbies' tread pressed in them)
  for (const [ry, rh] of [[30, 7], [74, 9]] as const) {
    box(g, 0, ry, w, rh, D[2]); box(g, 0, ry, w, 1, D[1]); box(g, 0, ry + rh, w, 1, D[5]);
    checker(g, 0, ry + rh - 2, w, 2, D[3], ry % 2);
    for (let x = (ry % 7); x < w; x += 6) box(g, x, ry + 2, 3, 2, D[1]);
  }
  // (stones, a root across the trail, leaves and needles on it, moss at its edge)
  for (let n = 0; n < w / 7; n++) {
    const x = hash(wx * 0.01 + n * 1.3) * w, y = 8 + hash(wx * 0.02 + n * 2.9) * (BAND + 60), r = 1 + hash(n + wx) * 4;
    box(g, x - r, y - r * 0.6, r * 2, r * 1.2, INK); box(g, x - r + 1, y - r * 0.6 + 1, r * 2 - 2, r * 1.2 - 2, R[3 + (n % 2)]); box(g, x - r + 1, y - r * 0.6 + 1, r, 1, R[6]);
  }
  for (let n = 0; n < w / 90; n++) {
    const x = hash(wx + n * 7.1) * w, y = 4 + hash(n * 3.7 + wx) * 30;
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 30, y + 20); g.quadraticCurveTo(x, y - 4, x + 34, y + 16); g.stroke();
    g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 28, y + 18); g.quadraticCurveTo(x, y - 5, x + 32, y + 14); g.stroke();
  }
  for (let n = 0; n < w / 5; n++) {
    const x = hash(wx * 0.03 + n * 0.71) * w, y = 2 + hash(n * 1.37 + wx * 0.05) * 130, k = hash(n * 4.9 + wx);
    if (k < 0.5) { box(g, x, y, 3, 2, k < 0.28 ? G[4] : Br[4]); box(g, x, y, 1, 1, G[6]); } else box(g, x, y, 4, 1, Df[5]);
  }
  for (let n = 0; n < w / 60; n++) { const x = hash(wx + n * 11.1) * w; box(g, x, 2, 8, 2, Ms[4]); box(g, x + 2, 1, 4, 1, Ms[5]); }
  // (the lit lip along the top: his to stand on, tufts up over it)
  for (let x = 0; x < w; x += 2) {
    box(g, x, -1, 2, 1, INK); box(g, x, 0, 2, 3, L[1]); box(g, x, 0, 2, 2, L[2]); box(g, x, 0, 2, 1, L[3]);
    const k = hash((wx + x) * 0.71);
    if (k > 0.62) { const gh = 3 + hash(x + wx) * 6; box(g, x, -gh, 1, gh, k > 0.85 ? G[5] : L[2]); box(g, x + 1, -gh + 2, 1, gh - 2, L[1]); }
  }
};

/** The forest floor going back from the trail to the back rank: duff banded darker and hazier the further, stones and
 *  turned leaves on it (one eye: each band where its depth puts it). */
const drawGoingBack = (c: Ctx, v: View) => {
  const tod = timeOfDay(), haze = skyAt(0.9, tod), Df = hr('duff', DUFF, 0.2), eye = v.eye;
  const xa = Math.max(x0 - 300, v.v0 - 200), xb = Math.min(x0 + LEN + 300, v.v1 + 200);
  const steps = [FAR, 0.76, 0.82, 0.88, 0.93, 0.97, 1];
  for (let i = 0; i < steps.length - 1; i++) {
    const [, ya] = at(eye, 0, GY, steps[i]), [, yb] = at(eye, 0, GY, steps[i + 1]);
    const col = mix(Df[3 + Math.min(2, i >> 1)], haze, 0.36 * (1 - i / (steps.length - 1)));
    box(c, xa, ya, xb - xa, yb - ya + 1, col);
    if (i) checker(c, xa, ya - 1, xb - xa, 2, col, i % 2);
    for (let n = 0; n < (xb - xa) / 40; n++) { const x = xa + hash(i * 31 + n * 1.7 + Math.floor(xa / 40)) * (xb - xa), y = ya + hash(n * 2.3 + i) * (yb - ya); box(c, x, y, 2, 1, i < 3 ? mix(Df[5], haze, 0.3) : (n % 3 ? Df[5] : hr('gold', GOLD, 0.2)[4])); }
  }
};

/** The back rank and the trees between, deepest first, up to depth `dMax`. */
const drawTrees = (c: Ctx, v: View, dMax: number) => {
  const eye = v.eye;
  atDepth(c, eye, FAR, () => {
    for (let tx = Math.floor((v.v0 - 400) / TW) * TW; tx < v.v1 + 400; tx += TW) {
      if (!seen(v, tx - 120, tx + TW + 120, FAR)) continue;
      stillAt(c, 'db-backrank', tx, GY, -120, -420, TW + 240, 422, paintBackRank);
    }
  });
  for (const t of TREES) {
    if (t.d >= dMax) continue;
    const X = x0 + t.rx, [bx, by, bw, bh] = treeBox(t.k, t.h);
    if (!seen(v, X + bx, X + bx + bw, t.d)) continue;
    atDepth(c, eye, t.d, () => {
      stillAt(c, `db-tree-${t.k}-${Math.round(t.rx)}`, X, GY, bx, by, bw, bh, g => paintTree(g, t.k, Math.round(t.rx), t.h));
      if (t.d > 0.9) bush(c, X + 30, GY, 60, 36, Math.round(t.rx));
    });
  }
};

export const dirtbike: FrontierSection = {
  id: 'dirtbike', x0, x1,
  checkpoints: [
    { name: WAVES[0].name, cp: 50, x: DOORS.dirtbike.start.x, y: GY },
    ...WAVES.slice(1).map((w, i) => ({ name: w.name, cp: 51 + i, x: CP_X, y: GY, manual: true })),
  ],
  build: (state) => {
    layOwn(state, [{ x1: x0 - 200, y1: GY, x2: x0 + LEN + 200, y2: GY, surface: 'dirt' }]);
    endWalls(state, 'dirtbike', { right: false });
    state.blocks.push({ x: x0 + LEN, y: -6000, w: 40, h: 8000, type: 'wall', hidden: true, tag: 'dirtbike-end' });
    const s = sideOf(state);
    s.first = true;
    // (starting again inside the chase: straight back on the bike at that stretch)
    s.pending = !teensDone(state) && state.checkpoint >= 50 && state.checkpoint <= 50 + WAVES.length - 1 ? state.checkpoint - 50 : null;
  },
  update: (ctx, controls) => {
    const { state } = ctx, p = state.player, s = sideOf(state);
    if (inChase(state)) { markBossFight(state); return updateChase(ctx, controls); }
    if (s.first) {
      s.first = false;
      const fromBounty = takeBountyHandoff();
      if (!teensDone(state) && (fromBounty || s.pending !== null)) { startChase(state, fromBounty ? 0 : s.pending ?? 0, fromBounty); s.pending = null; return hands(); }
    }
    const done = teensDone(state);
    // (walked in on foot: the bike's parked there; onto it and off he goes)
    if (!done && p.health > 0 && !p.inCutscene && Math.abs(p.pos.x + p.width / 2 - BIKE_X) < 30 && p.isGrounded) { startChase(state, 0, false); return hands(); }
    runExits(state, exits(done));
    return controls;
  },
  cameraX: () => ({ min: x0, max: x0 + LEN - CANVAS_WIDTH }),
  drawBackdrop: (c, state) => (inChase(state) ? true : drawWoodsFar(c, state)),
  drawBack: (c, state) => {
    if (inChase(state)) return;
    const f = state.frame, v = viewOf(state);
    // (deepest first: the floor going back, the back rank and the trees, then the trail under his feet)
    drawGoingBack(c, v);
    drawTrees(c, v, 1.01);
    for (let x = x0 - 200, i = 0; x < x0 + LEN + 200; x += CHUNK, i++) {
      const w = Math.min(CHUNK, x0 + LEN + 200 - x);
      if (x + w < v.v0 || x > v.v1) continue;
      stillAt(c, `db-floor-${i}`, x, GY, 0, -10, w, SOIL + 10, g => paintFloor(g, x, w));
    }
    bendFloor(c, v.eye, GY, GY, GY + BAND, Math.max(x0 - 200, v.v0 - 40), Math.min(x0 + LEN + 200, v.v1 + 40));
    if (!teensDone(state)) {
      // (the kid's bike he rode in on, parked, ticking over)
      if (onScreen(state, BIKE_X - 60, BIKE_X + 60)) drawDirtBike(c, BIKE_X, GY, 1, 1, 0, 0, '#DC2626', 7);
    } else {
      // (after: the wrecks they left, bikes on their sides in the ditch)
      for (const [dx, col, rot] of [[700, '#2563EB', 1.4], [980, '#16A34A', -1.5], [1260, '#F59E0B', 1.6]] as const) {
        const bx = x0 + dx;
        if (!onScreen(state, bx - 60, bx + 60)) continue;
        c.save(); c.translate(bx, GY - 6); c.rotate(rot * 0.2); drawDirtBike(c, 0, 6, rot > 0 ? 1 : -1, 1, rot * 0.6, f * 0, col, 3 + dx % 9); c.restore();
      }
    }
  },
  drawHud: (c, state) => { if (inChase(state)) drawChase(c, state); },
  outdoors: () => 1,
};
