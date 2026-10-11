// The GRAND BALLROOM's doors, drawn: a pair of tufted purple vinyl doors (diamond-buttoned, nailhead studs round the
// edge, gilt kick plates, brass pulls) hung in a gilt frame a step back in the doorway's passage (passage.ts). In the
// passage's own perspective (the one eye): a point Z back from him is drawn d = Z0 / Z of the way from the eye, so
// a leaf swinging on its hinge goes back into the passage foreshortened, edge-on, till its free edge meets the
// passage's back wall; it swings shut the same way. Kicked in, they're torn off, lying flat on the passage floor (in
// perspective: you see down onto them), a boot print on one, the hinges bent off the frame, the header cracked where
// the bolt was, splinters about. Used at both ends: the shop's (all its states), and the ballroom's way in (kicked in).

import { GY } from '../geometry';
import { INK, box, slab, pole, ball, rampOf, checker, hash, stamp, at, quad, seg, inDepth, type Eye, type P } from './paint';

type Ctx = CanvasRenderingContext2D;

/** How far back his plane is (world units), for working out where a point Z back is drawn. */
const Z0 = 1600;
const zOf = (d: number) => Z0 / d, dOf = (z: number) => Z0 / z;
/** The frame's depth in the passage; the passage's back wall (passage.ts dp). */
export const FRAME_D = 0.965;
const ZF = zOf(FRAME_D), ZR = zOf(0.935);
/** A leaf: its width and height (world), the frame's opening (half its width) and its posts and header. */
const LW = 64, LH = 180, HALF = 64, POST = 12, HEAD = 14;
/** Swung open: its free edge just short of the passage's back wall. */
const OPEN = Math.asin(Math.min(1, (ZR - ZF - 3) / LW));

const VINYL = '#5B1E8E';

// ---------------------------------------------------------------------------------------------------------------
// A leaf's face, painted the once (twice the size, for slicing): tufted, studded, plated; the pull on its latch side

let tex: { l: HTMLCanvasElement; r: HTMLCanvasElement } | null = null;
const S = 2;
const paintLeaf = (g: Ctx) => {
  const r = rampOf(VINYL);
  slab(g, 0, 0, LW, LH, VINYL, { edge: 4 });
  // (the tufting: buttons on a diamond grid, the vinyl puffed between them (lit up its top left), pleats into each)
  const bx = (k: number, row: number) => 10 + k * 22 + (row % 2) * 11, by = (row: number) => 14 + row * 20;
  for (let row = 0; row < 8; row++) for (let k = 0; k < 3; k++) {
    const x = bx(k, row), y = by(row);
    if (x > LW - 8) continue;
    // (the puff below-right of the button: lit along its top, shadowed under)
    box(g, x + 1, y + 3, 9, 6, r[3]); checker(g, x + 1, y + 9, 9, 2, r[1]); box(g, x + 3, y + 4, 4, 2, r[4]);
  }
  for (let row = 0; row < 8; row++) for (let k = 0; k < 3; k++) {
    const x = bx(k, row), y = by(row);
    if (x > LW - 8) continue;
    g.strokeStyle = r[0]; g.lineWidth = 1; g.beginPath();
    g.moveTo(x, y); g.lineTo(x - 11, y + 10); g.moveTo(x, y); g.lineTo(x + 11, y + 10); g.moveTo(x, y); g.lineTo(x, y - 6);
    g.stroke();
    box(g, x - 2, y - 2, 4, 4, INK); box(g, x - 1, y - 1, 2, 2, '#C4B5FD');
  }
  // (nailheads round the edge, gold, a shadow pixel each)
  for (let y = 6; y < LH - 18; y += 8) for (const x of [4, LW - 6]) { box(g, x, y, 2, 2, '#FDE047'); box(g, x + 1, y + 2, 1, 1, '#3B0764'); }
  for (let x = 8; x < LW - 6; x += 8) { box(g, x, 4, 2, 2, '#FDE047'); box(g, x, LH - 22, 2, 2, '#FDE047'); }
  // (the gilt kick plate, the pull)
  slab(g, 2, LH - 16, LW - 4, 14, '#CA8A04', { edge: 2 });
  box(g, 6, LH - 10, LW - 12, 1, '#854D0E');
  pole(g, LW - 14, 74, 6, 34, '#EAB308');
  box(g, LW - 15, 72, 8, 3, '#A16207'); box(g, LW - 15, 107, 8, 3, '#A16207');
};
const texOf = (right: boolean) => {
  if (!tex) {
    const mk = (flip: boolean) => {
      const cv = document.createElement('canvas'); cv.width = LW * S; cv.height = LH * S;
      const g = cv.getContext('2d')!;
      g.setTransform(flip ? -S : S, 0, 0, S, flip ? LW * S : 0, 0);
      paintLeaf(g);
      return cv;
    };
    tex = { l: mk(false), r: mk(true) };
  }
  return right ? tex.r : tex.l;
};

// ---------------------------------------------------------------------------------------------------------------
// A leaf hung on its hinge, `a` open (0 shut, OPEN against the back wall)

/** Hinge at hx (world x), the leaf reaching toward `dir` (1: the left leaf, its hinge on the left), `a` radians open. */
const leaf = (c: Ctx, eye: Eye, hx: number, dir: 1 | -1, a: number, shake = 0) => {
  const xOf = (u: number) => hx + dir * u * LW * Math.cos(a) + shake, zOfU = (u: number) => ZF + u * LW * Math.sin(a);
  const top = (u: number) => at(eye, xOf(u), GY - LH, dOf(zOfU(u))), bot = (u: number) => at(eye, xOf(u), GY, dOf(zOfU(u)));
  // (its shadow on the floor, thrown back and to the right of it)
  if (a > 0.05) {
    const s0 = bot(0), s1 = bot(1), b0 = at(eye, xOf(0) + 8, GY, dOf(zOfU(0) + 14)), b1 = at(eye, xOf(1) + 8, GY, dOf(zOfU(1) + 14));
    quad(c, 'rgba(8, 2, 14, 0.4)', s0, s1, b1, b0);
  }
  // (its face, a slice at a time: each slice of the painted leaf drawn where that part of it is)
  const t = texOf(dir < 0), N = 16;
  const smooth = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N;
    const p0 = top(u0), p1 = top(u1), q0 = bot(u0), q1 = bot(u1);
    const x0 = Math.min(p0[0], p1[0]), x1 = Math.max(p0[0], p1[0]);
    if (x1 - x0 < 0.05) continue;
    // (the texture's column for this slice: the right leaf's is mirrored, its hinge at the texture's right)
    const sx = (dir > 0 ? u0 : 1 - u1) * LW * S;
    c.drawImage(t, sx, 0, LW * S / N, LH * S, Math.floor(x0), Math.round((p0[1] + p1[1]) / 2), Math.ceil(x1 - x0) + 1, Math.round((q0[1] + q1[1]) / 2 - (p0[1] + p1[1]) / 2));
  }
  c.imageSmoothingEnabled = smooth;
  // (turned away from the light: darker, in steps)
  const shadeK = Math.round(Math.sin(a) * 3) / 3;
  if (shadeK > 0) quad(c, `rgba(14, 4, 26, ${(0.38 * shadeK).toFixed(2)})`, top(0), top(1), bot(1), bot(0));
  // (its edges: inked; the free edge's thickness, gilt, once it's turned)
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath();
  const pts = [top(0), top(1), bot(1), bot(0)]; c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.stroke();
  if (a > 0.1) { const e0 = top(1), e1 = bot(1); box(c, e0[0] - (dir > 0 ? 0 : 2), e0[1], 2, e1[1] - e0[1], '#A16207'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The frame (at FRAME_D: painted the once), whole or kicked in

const paintFrame = (g: Ctx, D: number, broken: boolean) => {
  const L = D - HALF - POST, R = D + HALF, T = GY - LH - HEAD;
  for (const x of [L, R]) {
    // (a post: gilt, a bead down its middle, a plinth at its foot)
    slab(g, x, T, POST, GY - T, '#CA8A04', { edge: 2 });
    box(g, x + 5, T + HEAD, 1, GY - T - HEAD - 18, '#FDE047'); box(g, x + 6, T + HEAD, 1, GY - T - HEAD - 18, '#854D0E');
    slab(g, x - 2, GY - 18, POST + 4, 18, '#A16207', { edge: 2 });
  }
  slab(g, L - 4, T - 4, R + POST - L + 8, HEAD + 4, '#D69E0C', { edge: 2 });
  box(g, L, T + HEAD - 5, R + POST - L, 1, '#854D0E'); box(g, L, T + 2, R + POST - L, 1, '#FDE68A');
  ball(g, L + POST / 2, T + 4, 3, '#EAB308'); ball(g, R + POST / 2, T + 4, 3, '#EAB308');
  // (the hinges: iron leaves on the posts' inner edges; bent out off them once the doors are torn away)
  for (const y of [GY - 160, GY - 96, GY - 34]) for (const [x, s] of [[L + POST, 1], [R, -1]] as const) {
    if (!broken) { box(g, s > 0 ? x : x - 4, y, 4, 14, INK); box(g, s > 0 ? x : x - 3, y + 1, 3, 12, '#52525B'); box(g, s > 0 ? x : x - 3, y + 1, 3, 1, '#A1A1AA'); }
    else {
      g.fillStyle = INK; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 9, y + 4); g.lineTo(x + s * 9, y + 14); g.lineTo(x, y + 12); g.closePath(); g.fill();
      g.fillStyle = '#71717A'; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + s * 8, y + 5); g.lineTo(x + s * 8, y + 12); g.lineTo(x, y + 11); g.closePath(); g.fill();
      box(g, x + s * 4 - 1, y + 7, 2, 2, '#27272A');
    }
  }
  if (broken) {
    // (the header split where the bolt was: a chunk gone, the raw plaster under the gilt, a crack running off it)
    g.fillStyle = INK; g.beginPath(); g.moveTo(D - 9, T + HEAD); g.lineTo(D - 5, T + 3); g.lineTo(D + 2, T + 6); g.lineTo(D + 8, T + 1); g.lineTo(D + 11, T + HEAD); g.closePath(); g.fill();
    g.fillStyle = '#D9C7A0'; g.beginPath(); g.moveTo(D - 7, T + HEAD); g.lineTo(D - 4, T + 5); g.lineTo(D + 2, T + 8); g.lineTo(D + 7, T + 4); g.lineTo(D + 9, T + HEAD); g.closePath(); g.fill();
    seg(g, [D + 8, T + 1], [D + 20, T - 3], INK, 1); seg(g, [D + 20, T - 3], [D + 30, T + 2], INK, 1);
    // (the latch post's crack, down from the top; splinters hanging off the header)
    for (const x of [L + POST - 2, R + 2]) { seg(g, [x, T + HEAD], [x - 2, T + 40], INK, 1); seg(g, [x - 2, T + 40], [x + 1, T + 66], INK, 1); }
    for (let i = 0; i < 4; i++) { const sx = D - 6 + i * 4; box(g, sx, T + HEAD, 2, 5 + (i % 2) * 4, INK); box(g, sx, T + HEAD, 1, 4 + (i % 2) * 4, '#E8D3A8'); }
  }
};

/** The frame at D, a step back in the passage (stamped; `broken`: kicked in). */
const frame = (c: Ctx, eye: Eye, D: number, broken: boolean) => {
  inDepth(c, eye, FRAME_D, () => stamp(c, `ball-door-frame-${D}-${broken ? 'b' : 'w'}`, D - HALF - POST - 8, GY - LH - HEAD - 10, (HALF + POST) * 2 + 16, LH + HEAD + 12, g => paintFrame(g, D, broken)));
  // (its foot on the floor: a dark line where it meets it)
  const a = at(eye, D - HALF - POST - 2, GY, FRAME_D), b = at(eye, D + HALF + POST + 2, GY, FRAME_D);
  quad(c, 'rgba(8, 2, 14, 0.45)', a, b, at(eye, D + HALF + POST + 6, GY, dOf(ZF + 10)), at(eye, D - HALF - POST + 2, GY, dOf(ZF + 10)));
};

// ---------------------------------------------------------------------------------------------------------------
// Kicked in: the leaves torn off and lying flat on the passage's floor

/** A leaf lying flat (its middle at x, z back; turned `ang` in the floor's plane), you seeing down onto it. */
const flatLeaf = (c: Ctx, eye: Eye, cx: number, cz: number, ang: number, boot: boolean, seed: number) => {
  const ux = Math.cos(ang), uz = Math.sin(ang);
  const pt = (s: number, t: number, y = GY - 5): P => {
    // (s along its length, t across it, both -0.5..0.5)
    const x = cx + ux * s * LH - uz * t * LW, z = cz + uz * s * LH + ux * t * LW;
    return at(eye, x, y, dOf(z));
  };
  // (its shadow, its near edge (the thickness), its top)
  quad(c, 'rgba(8, 2, 14, 0.45)', pt(-0.52, -0.56, GY), pt(0.52, -0.56, GY), pt(0.52, 0.6, GY), pt(-0.52, 0.6, GY));
  quad(c, INK, pt(-0.5, -0.5, GY - 6), pt(0.5, -0.5, GY - 6), pt(0.5, -0.5, GY + 1), pt(-0.5, -0.5, GY + 1));
  quad(c, '#3B0764', pt(-0.5, -0.5), pt(0.5, -0.5), pt(0.5, -0.5, GY), pt(-0.5, -0.5, GY));
  const r = rampOf(VINYL);
  quad(c, INK, pt(-0.5, -0.5, GY - 6), pt(0.5, -0.5, GY - 6), pt(0.5, 0.5, GY - 6), pt(-0.5, 0.5, GY - 6));
  quad(c, r[2], pt(-0.495, -0.48), pt(0.495, -0.48), pt(0.495, 0.48), pt(-0.495, 0.48));
  // (the far half of it a step lighter: the light's on it; the kick plate gilt at one end)
  quad(c, r[3], pt(-0.495, 0.05), pt(0.495, 0.05), pt(0.495, 0.48), pt(-0.495, 0.48));
  quad(c, '#CA8A04', pt(0.41, -0.48), pt(0.495, -0.48), pt(0.495, 0.48), pt(0.41, 0.48));
  // (the tufting's buttons and the nailheads, where they've ended up)
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { const p = pt(-0.42 + i * 0.1, -0.33 + j * 0.33 + (i % 2) * 0.08); box(c, p[0] - 1, p[1], 2, 1, r[0]); box(c, p[0], p[1] - 1, 1, 1, '#C4B5FD'); }
  for (let i = 0; i < 12; i++) { const p = pt(-0.46 + i * 0.075, 0.45); box(c, p[0], p[1], 1, 1, '#FDE047'); const q = pt(-0.46 + i * 0.075, -0.45); box(c, q[0], q[1], 1, 1, '#FDE047'); }
  // (a bent hinge still on its edge; the boot print, dusty, where he put his foot through it)
  { const p = pt(-0.3, -0.5, GY - 4); box(c, p[0] - 2, p[1] - 1, 6, 4, INK); box(c, p[0] - 1, p[1], 4, 2, '#71717A'); }
  if (boot) {
    for (const [s, t, w] of [[-0.06, 0.02, 0.09], [0.06, 0.02, 0.05]] as const) {
      const a = pt(s - w / 2, t - 0.16), b = pt(s + w / 2, t - 0.16), cc = pt(s + w / 2, t + 0.16), d = pt(s - w / 2, t + 0.16);
      quad(c, 'rgba(120, 104, 84, 0.75)', a, b, cc, d);
      seg(c, pt(s, t - 0.12), pt(s, t + 0.12), 'rgba(60, 50, 40, 0.8)', 1);
    }
  }
  void seed;
};

/** Splinters of the frame and the doors about the floor. */
const splinters = (c: Ctx, eye: Eye, D: number) => {
  for (let i = 0; i < 12; i++) {
    const x = D - 70 + hash(i * 3.7 + D * 0.01) * 150, z = ZF - 40 + hash(i * 5.3) * 90, p = at(eye, x, GY - 1, dOf(z));
    const w = 3 + Math.round(hash(i * 1.9) * 4);
    box(c, p[0] - 1, p[1] - 1, w + 2, 3, INK); box(c, p[0], p[1], w, 1, i % 3 ? '#E8D3A8' : '#CA8A04');
  }
};

// ---------------------------------------------------------------------------------------------------------------

export type DoorLook = { kind: 'open' } | { kind: 'shutting'; k: number } | { kind: 'shut'; shake: number } | { kind: 'down' };

/** The doors at D, in the passage (behind him: after the passage's back wall and floor, before its lintel). */
export const drawBallDoors = (c: Ctx, eye: Eye, D: number, look: DoorLook) => {
  if (look.kind === 'down') {
    // (the far leaf first: it skidded further, turned; the near one over it, his boot print on it)
    flatLeaf(c, eye, D + 120, ZF + 22, -0.22, false, 1);
    flatLeaf(c, eye, D + 52, ZF - 6, 0.08, true, 2);
    splinters(c, eye, D);
    frame(c, eye, D, true);
    return;
  }
  const a = look.kind === 'open' ? OPEN : look.kind === 'shutting' ? OPEN * (1 - look.k) : 0;
  const shake = look.kind === 'shut' ? look.shake : 0;
  if (a === 0) {
    // (shut: their foot's shadow across the floor in front, where they meet the floor)
    quad(c, 'rgba(8, 2, 14, 0.35)', at(eye, D - HALF, GY, FRAME_D), at(eye, D + HALF, GY, FRAME_D), at(eye, D + HALF, GY, dOf(ZF - 10)), at(eye, D - HALF, GY, dOf(ZF - 10)));
  }
  leaf(c, eye, D - HALF, 1, a, shake);
  leaf(c, eye, D + HALF, -1, a, shake);
  frame(c, eye, D, false);
};

/** The doorway's light, when it's open (the far room's light through it, for the scene lighting). */
export const ballDoorsZ = { ZF, ZR };
void pole;
