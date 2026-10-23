// THE SUITORS: the other men who want Piper (the user's: "always male and they are beefy too"). Introduced round the
// bandstand at the loudspeaker (square/speaker.ts); the fairy wheel's carts and the broomstick deathmatch are full of
// them. Drawn here (the SNES finish from the square's pass: every limb, blob and torso in steps, lit from the upper left,
// shaded to the lower right, inked; everybody draws them from here), each his own man: a build out of
// a gym, a look, a voice (cast.json).
//
//   BRAXTON   a bodybuilder, oiled and tanned to leather, a red cape and a cardboard crown, posing trunks and a
//             spray tan line; flexes at everything
//   GUNNAR    a powerlifter in Viking cosplay: a horned helmet, a braided red beard, a fur over one shoulder, a belt
//             wide as a door, a gut like a keg
//   TREMAINE  a gym prince: a tank top cut to the navel, a PRINCE CHARMING sash, a man bun, gold chains, calves
//
// More come (the wheel's and the brooms' crowds): `suitorOf(seed)` makes one from a seed (a mix of the same parts).
// drawSuitor(c, x, feetY, facing, frame, look, pose, opts): feet at (x, feetY), facing 1 right / -1 left. Moving, pose
// 'walk' with opts.stride (how far he's walked): a six-frame stride cycle off the distance, so the feet don't skate.
//
// THE DETAIL PASS (the user's "make the suitors look more detailed"): every muscle in its steps (traps, pecs with their
// undercut and nipples, the ab grid lit along its tops, the serratus, the obliques' V into the trunks, delts with their
// striation, biceps and triceps swelling off the bone, forearm veins, quads and calves, kneecaps), each man's own hair
// (Braxton's oiled slick-back, Chad's frosted tips through his cap, Blake's mullet, Tremaine's man bun, Sebastian's
// pompadour...: `hairOf`), his own mug (smug, dumb or stern: `mugOf`), his facial hair (`facialOf`), and his gear in
// folds and highlights (the tank's creases, puka shells, gold chains and a medallion, Gunnar's fur tufts, strap, knotwork
// buckle and criss-crossed leg bindings, the knight's mail rings and tabard hem, the wizard's torn sleeves, rope belt
// and tassels, boots, sneakers, bracers, sweatbands). A pose with nothing moving in it is stamped (per look, pose,
// facing and the frame's few phases), so the detail costs one drawImage a frame.

import { knee, elbow } from '../art/limb';
import { stamp } from '../../m1/game/render/stamp';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];

export type SuitorPose = 'walk' | 'stand' | 'flex' | 'talk' | 'point' | 'cheer' | 'throw' | 'sit' | 'hurt' | 'dead' | 'ride';

export interface SuitorLook {
  name: string;
  /** Skin (light, base, shade), hair. */
  skin: [string, string, string]; hair: string;
  /** What he's got on: 'cape' (Braxton), 'viking' (Gunnar), 'prince' (Tremaine); (the fairy wheel's roster) 'tee' (a
   *  muscle tee and a backwards cap), 'knight' (cosplay: a tabard, chain, a helmet with the visor up), 'wizard' (a robe
   *  with the sleeves torn off, a pointy hat, a beard to his belt). */
  kit: 'cape' | 'viking' | 'prince' | 'tee' | 'knight' | 'wizard';
  /** His colors (the cape, the fur, the tank). */
  main: string; trim: string;
  /** His voice (cast.json). */
  voice: string;
  /** Extra belly (0..1). */
  gut: number;
}

export const SUITORS: Record<'braxton' | 'gunnar' | 'tremaine', SuitorLook> = {
  braxton: { name: 'BRAXTON', skin: ['#E8A070', '#C47A48', '#8E5230'], hair: '#2A1A0E', kit: 'cape', main: '#C81E3A', trim: '#F6D365', voice: 'm2.fantasy.suitor_braxton', gut: 0 },
  gunnar: { name: 'GUNNAR', skin: ['#FFE0CC', '#F2BFA0', '#C88E70'], hair: '#C2501E', kit: 'viking', main: '#7A5A3A', trim: '#B8B8C0', voice: 'm2.fantasy.suitor_gunnar', gut: 0.8 },
  tremaine: { name: 'TREMAINE', skin: ['#9A6644', '#6E4428', '#4A2A16'], hair: '#140A06', kit: 'prince', main: '#2A6ADC', trim: '#F6D365', voice: 'm2.fantasy.suitor_tremaine', gut: 0.1 },
};

const SKINS: [string, string, string][] = [['#FFE0CC', '#F2BFA0', '#C88E70'], ['#E8A070', '#C47A48', '#8E5230'], ['#9A6644', '#6E4428', '#4A2A16'], ['#F4C8A0', '#D8A478', '#A87650'], ['#6A4026', '#4A2A16', '#2E180A']];
const HAIRS = ['#140A06', '#2A1A0E', '#6A4020', '#C2501E', '#E8D090', '#5A5A60'];
const MAINS = ['#C81E3A', '#2A6ADC', '#1E8A4A', '#7A3AAA', '#E07A1E', '#222230'];
/** One of the crowd (the wheel's carts, the brooms): seeded, the same every time. */
export const suitorOf = (seed: number): SuitorLook => {
  const s = Math.abs(Math.round(seed));
  const kits: SuitorLook['kit'][] = ['cape', 'viking', 'prince'];
  return { name: 'SUITOR', skin: SKINS[s % SKINS.length], hair: HAIRS[Math.floor(s / 5) % HAIRS.length], kit: kits[Math.floor(s / 3) % 3], main: MAINS[Math.floor(s / 7) % MAINS.length], trim: s % 2 ? '#F6D365' : '#E4E4E7', voice: ['m2.fantasy.suitor_braxton', 'm2.fantasy.suitor_gunnar', 'm2.fantasy.suitor_tremaine'][s % 3], gut: (Math.floor(s / 11) % 3) * 0.4 };
};

// ---------------------------------------------------------------------------------------------------------------
// Each man's own: his hair, his mug, his facial hair (by name; a crowd suitor's picked off his look, the same every time)

export type HairStyle = 'slick' | 'buzz' | 'frosted' | 'mullet' | 'curls' | 'pony' | 'bun' | 'waves' | 'pomp';
export type Mug = 'smug' | 'dumb' | 'stern';
export type Facial = 'none' | 'goatee' | 'stache' | 'braid' | 'beard' | 'long' | 'forked';
const bare = (L: SuitorLook) => L.name.replace(/^(SIR|WIZARD) /, '');
const lookHash = (L: SuitorLook) => { let h = 7; for (const ch of L.name + L.hair + L.main + L.skin[1]) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const HAIR_OF: Record<string, HairStyle> = { BRAXTON: 'slick', DMITRI: 'buzz', CHAD: 'frosted', BLAKE: 'mullet', CHET: 'curls', BRODY: 'pony', DUANE: 'buzz', TREMAINE: 'bun', RAFAEL: 'waves', SEBASTIAN: 'pomp', LORENZO: 'pomp' };
const MUG_OF: Record<string, Mug> = { BRAXTON: 'smug', TREMAINE: 'smug', RAFAEL: 'smug', SEBASTIAN: 'smug', DMITRI: 'smug', LORENZO: 'smug', DEREK: 'smug', CHAD: 'dumb', BRODY: 'dumb', GUNNAR: 'dumb', CHET: 'dumb', DUANE: 'dumb', SVEN: 'dumb', HANK: 'stern', BLAKE: 'stern', WAYNE: 'stern', THADDEUS: 'stern' };
const FACIAL_OF: Record<string, Facial> = { GUNNAR: 'braid', SVEN: 'beard', HANK: 'stache', DEREK: 'goatee', WAYNE: 'long', THADDEUS: 'forked', DMITRI: 'goatee', BLAKE: 'stache' };
/** His hair (under whatever's on his head). */
export const hairOf = (L: SuitorLook): HairStyle => {
  const n = HAIR_OF[bare(L)]; if (n) return n;
  const pool: HairStyle[] = L.kit === 'cape' ? ['slick', 'buzz', 'pomp'] : L.kit === 'tee' ? ['frosted', 'mullet', 'curls', 'pony', 'buzz'] : L.kit === 'prince' ? ['bun', 'waves', 'pomp'] : ['slick', 'mullet'];
  return pool[lookHash(L) % pool.length];
};
/** His look on his face, at rest. */
export const mugOf = (L: SuitorLook): Mug => MUG_OF[bare(L)] ?? (['smug', 'dumb', 'stern'] as Mug[])[(lookHash(L) >> 3) % 3];
/** His facial hair. */
export const facialOf = (L: SuitorLook): Facial => {
  const n = FACIAL_OF[bare(L)]; if (n) return n;
  if (L.kit === 'viking') return 'braid';
  if (L.kit === 'wizard') return 'long';
  return (['none', 'none', 'goatee', 'stache'] as Facial[])[(lookHash(L) >> 5) % 4];
};

/** Slumped (dead in his seat, draped on a post, upside down through a floor): drawn with 'sit' legs, everything above
 *  the hips tipped `lean` about them (+ forward), the head lolled `loll` on the neck, the arms hanging dead toward the
 *  world's down (`grav`: how far the caller's turned him, radians, so they hang straight whichever way he's lying),
 *  `arm` their length (shorter lying on the ground). */
export interface Slump { lean: number; loll: number; grav?: number; arm?: number }

/** How tall one is (feet to the top of his head), for words over him. */
export const SUITOR_H = 92;

const INK = '#1A1028';
const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
// (the SNES finish: every part in steps, lit from the upper left, shaded to the lower right, inked)
const hx2 = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mixS = (a: string, b: string, k: number) => { const A = hx2(a), B = hx2(b); return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`; };
const shadeOf = (col: string, k = 0.28) => mixS(col, INK, k);
const liteOf = (col: string, k = 0.28) => mixS(col, '#FFFFFF', k);
const oval = (c: Ctx, x: number, y: number, rx: number, ry: number, a: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), a, 0, Math.PI * 2); c.fill(); };
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, line = true) => {
  if (line) oval(c, x, y, rx + 1, ry + 1, 0, INK);
  rx = Math.max(0.5, rx); ry = Math.max(0.5, ry);
  oval(c, x, y, rx, ry, 0, shadeOf(col, 0.3));
  oval(c, x - rx * 0.12, y - ry * 0.12, rx * 0.86, ry * 0.86, 0, col);
  if (rx > 3) oval(c, x - rx * 0.38, y - ry * 0.38, rx * 0.32, ry * 0.26, 0, liteOf(col, 0.3));
};
/** A flat shape: inked (a 1 px rim outside it), filled. */
const shape = (c: Ctx, pts: number[], col: string, line = true) => {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.closePath();
  if (line) { c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 2; c.stroke(); }
  c.fillStyle = col; c.fill();
};
const line1 = (c: Ctx, pts: number[], col: string, w = 1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) c.lineTo(pts[k], pts[k + 1]); c.stroke(); };
/** A jointed limb (shoulder, elbow, wrist; hip, knee, ankle): inked round as ONE piece (so no ink cuts across a joint),
 *  each bone in its steps, the crook of each bend creased and its point lit. */
const chain = (c: Ctx, pts: P[], ws: number[], col: string, lit?: string) => {
  const n = pts.length - 1;
  c.lineCap = 'round'; c.strokeStyle = INK;
  for (let i = 0; i < n; i++) { c.lineWidth = ws[i] + 2; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); }
  c.strokeStyle = col;
  for (let i = 0; i < n; i++) { c.lineWidth = ws[i]; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[i + 1][0], pts[i + 1][1]); c.stroke(); }
  c.lineCap = 'butt';
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], w = ws[i], dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d;
    if (nx < -0.01 || (Math.abs(nx) <= 0.01 && ny < 0)) { nx = -nx; ny = -ny; }
    const o = w * 0.3, a = Math.min(0.3, (w * 0.42) / d), b = 1 - a;
    const ax = x1 + dx * a, ay = y1 + dy * a, bx = x1 + dx * b, by = y1 + dy * b;
    c.strokeStyle = shadeOf(col, 0.26); c.lineWidth = w * 0.36; c.beginPath(); c.moveTo(ax + nx * o, ay + ny * o); c.lineTo(bx + nx * o, by + ny * o); c.stroke();
    c.strokeStyle = lit ?? liteOf(col, 0.22); c.lineWidth = Math.max(1, w * 0.22); c.beginPath(); c.moveTo(ax - nx * o, ay - ny * o); c.lineTo(bx - nx * o, by - ny * o); c.stroke();
  }
  for (let i = 1; i < n; i++) {
    const [jx, jy] = pts[i], mx = (pts[i - 1][0] + pts[i + 1][0]) / 2 - jx, my = (pts[i - 1][1] + pts[i + 1][1]) / 2 - jy, md = Math.hypot(mx, my);
    if (md < 1) continue;
    const ux = mx / md, uy = my / md, w = Math.min(ws[i - 1], ws[i]);
    // (the crease in the crook: a short dark tick across it; the point of the bend lit)
    c.strokeStyle = shadeOf(col, 0.45); c.lineWidth = 1; c.beginPath();
    c.moveTo(jx + ux * w * 0.15 - uy * w * 0.22, jy + uy * w * 0.15 + ux * w * 0.22); c.lineTo(jx + ux * w * 0.42, jy + uy * w * 0.42); c.stroke();
    box(c, jx - ux * w * 0.32 - 0.5, jy - uy * w * 0.32 - 0.5, 1, 1, liteOf(col, 0.35));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// MUSCLES: swellings on a limb's bones (a bicep off the upper arm toward the hand, the tricep behind it, the forearm's
// meat by the elbow; a quad down the front of the thigh, a calf off the back of the shin), inked first (so the ink only
// shows where they swell past the limb), the limb over that, then each filled in its steps; veins down a bare forearm.

interface Bulge { x: number; y: number; rx: number; ry: number; a: number }
const bulgeOn = (p: P, q: P, t: number, side: P, w: number, along: number, across: number, push: number): Bulge => {
  const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
  let nx = -dy / d, ny = dx / d; if (nx * side[0] + ny * side[1] < 0) { nx = -nx; ny = -ny; }
  return { x: p[0] + dx * t + nx * w * push, y: p[1] + dy * t + ny * w * push, rx: Math.max(2, d * along), ry: w * 0.5 * across, a: Math.atan2(dy, dx) };
};
/** A limb with its muscles. `arm`: shoulder, elbow, hand (bicep toward the hand); else hip, knee, ankle. `bare`: skin
 *  (veins, the shine), not cloth. */
const muscled = (c: Ctx, pts: P[], ws: number[], col: string, lit: string | undefined, arm: boolean, bare: boolean, oiled = false) => {
  const [a, b, e] = pts;
  const bs: Bulge[] = [];
  if (arm) {
    const toward: P = [e[0] - a[0] + 2, e[1] - a[1]];
    bs.push(bulgeOn(a, b, 0.5, toward, ws[0], 0.32, 0.95, 0.2));
    bs.push(bulgeOn(a, b, 0.42, [-toward[0], -toward[1]], ws[0], 0.28, 0.75, 0.16));
    bs.push(bulgeOn(b, e, 0.3, toward, ws[1], 0.3, 0.85, 0.1));
  } else {
    bs.push(bulgeOn(a, b, 0.48, [1, -1], ws[0], 0.34, 0.95, 0.18));
    bs.push(bulgeOn(b, e, 0.32, [-1, -0.5], ws[1], 0.28, 0.95, 0.24));
  }
  for (const g of bs) oval(c, g.x, g.y, g.rx + 1, g.ry + 1, g.a, INK);
  chain(c, pts, ws, col, lit);
  const L = lit ?? liteOf(col, 0.22);
  for (const g of bs) {
    oval(c, g.x, g.y, g.rx, g.ry, g.a, shadeOf(col, 0.2));
    oval(c, g.x - 0.6, g.y - 0.7, g.rx * 0.84, g.ry * 0.78, g.a, col);
    oval(c, g.x - g.ry * 0.3, g.y - g.ry * 0.36, g.rx * 0.48, g.ry * 0.36, g.a, L);
    box(c, g.x - g.ry * 0.42, g.y - g.ry * 0.5, 1, 1, oiled ? '#FFF6E8' : liteOf(L, 0.3));
  }
  // (the kneecap, lit, on the front of the knee)
  if (!arm) { box(c, b[0] + 1, b[1] - 2, 3, 3, shadeOf(col, 0.25)); box(c, b[0] + 1, b[1] - 2, 2, 2, L); }
  if (bare && arm) {
    // (a vein down the forearm's lit side: a raised cord, lit along its top, a shade under it, a fork near the wrist)
    const dx = e[0] - b[0], dy = e[1] - b[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d, o = ws[1] * 0.18;
    const pt = (t: number, k = 0): P => [b[0] + dx * t - nx * (o + k), b[1] + dy * t - ny * (o + k)];
    const v = [pt(0.22), pt(0.45, 1), pt(0.7, -0.5), pt(0.88)];
    line1(c, v.flatMap(p => [p[0] + 0.5, p[1] + 0.5]), shadeOf(col, 0.22));
    line1(c, v.flatMap(p => [p[0] - 0.5, p[1] - 0.5]), liteOf(col, 0.2));
    const f0 = pt(0.7, -0.5), f1 = pt(0.9, 2);
    line1(c, [f0[0], f0[1], f1[0], f1[1]], shadeOf(col, 0.18));
    // (and one over the bicep, on the oiled)
    if (oiled) { const m = bs[0]; line1(c, [m.x - m.rx * 0.6 * Math.cos(m.a), m.y - m.rx * 0.6 * Math.sin(m.a), m.x, m.y + 1, m.x + m.rx * 0.7 * Math.cos(m.a), m.y + m.rx * 0.7 * Math.sin(m.a) - 1], liteOf(col, 0.25)); }
  }
};
/** Something round the forearm (a bracer, a sweatband, a watch): from t0 to t1 along it. */
const cuff = (c: Ctx, b: P, e: P, t0: number, t1: number, w: number, col: string, stud?: string) => {
  const p0: P = [b[0] + (e[0] - b[0]) * t0, b[1] + (e[1] - b[1]) * t0], p1: P = [b[0] + (e[0] - b[0]) * t1, b[1] + (e[1] - b[1]) * t1];
  c.lineCap = 'butt';
  line1(c, [p0[0], p0[1], p1[0], p1[1]], INK, w + 2);
  line1(c, [p0[0], p0[1], p1[0], p1[1]], col, w);
  line1(c, [p0[0] - 1, p0[1] - 1, p1[0] - 1, p1[1] - 1], liteOf(col, 0.3), 1);
  if (stud) for (const t of [0.3, 0.7]) box(c, p0[0] + (p1[0] - p0[0]) * t - 0.5, p0[1] + (p1[1] - p0[1]) * t - 0.5, 1, 1, stud);
};
/** A fist: the ball of it, the knuckles lit along the top, the finger creases, the thumb wrapped over. */
const fist = (c: Ctx, x: number, y: number, r: number, col: string) => {
  blob(c, x, y, r, r, col);
  box(c, x - r + 1.5, y - 1, r * 2 - 3, 1, shadeOf(col, 0.4));
  for (let k = 0; k < 3; k++) box(c, x - r * 0.6 + k * r * 0.55, y - r * 0.55, 1, 1, liteOf(col, 0.35));
  box(c, x + r * 0.2, y + 0.5, r * 0.6, 1, shadeOf(col, 0.3));
};

/** The elbow between a shoulder and a hand, the arm's bones a set length (longer only reaching), bent toward (ox, oy). */
const elbowOf = (sx: number, sy: number, hx: number, hy: number, ox: number, oy: number): P => {
  const dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 1, L = Math.max(16, (d / 2) * 1.03);
  const h = Math.sqrt(Math.max(0, L * L - (d / 2) * (d / 2)));
  let nx = -dy / d, ny = dx / d; if (nx * ox + ny * oy < 0) { nx = -nx; ny = -ny; }
  return [(sx + hx) / 2 + nx * h, (sy + hy) / 2 + ny * h];
};
/** WALKING: one stride cycle (two steps) per this much ground, in WALK_FRAMES frames: picked from how far he's gone,
 *  so the planted foot keeps pace with the ground (no skating). */
const WALK_CYCLE = 48, WALK_FRAMES = 6, STEP = 12;
/** The walk cycle's frame for `dist` walked. */
const walkFrame = (dist: number) => Math.floor((((dist % WALK_CYCLE) + WALK_CYCLE) % WALK_CYCLE) / (WALK_CYCLE / WALK_FRAMES)) % WALK_FRAMES;
/** A walking leg's ankle at phase `ph` (sin > 0: ahead), off its hip's rest spot: planted and sliding back under him,
 *  then lifted and swung through. */
const footAt = (bx: number, ph: number): P => [bx + Math.sin(ph) * STEP, -4 - Math.max(0, Math.cos(ph)) * 7];
/** A walking arm's hand at swing `s` (-1 back .. 1 forward): out off the lats, coming up as it swings ahead. */
const handAt = (bx: number, hipY: number, s: number): P => [bx + s * 11, hipY - 6 - Math.max(0, s) * 9 + Math.max(0, -s) * 2];

/** A shoulder: the round deltoid cap over the arm's root, rounding the torso's corner off into the arm; its three heads
 *  split by a groove, lit on top. */
const deltoid = (c: Ctx, x: number, y: number, side: number, col: string, r = 8, oiled = false) => {
  blob(c, x, y, r, r * 0.86, col);
  box(c, x - side * 1 - 2, y + r * 0.55, 5, 1, shadeOf(col, 0.4));
  line1(c, [x + side * 1.5, y - r * 0.5, x + side * 2.5, y + r * 0.4], shadeOf(col, 0.22));
  box(c, x - r * 0.45, y - r * 0.55, 2, 1, oiled ? '#FFF6E8' : liteOf(col, 0.4));
};

/** A boot (or sneaker, slipper) round the ankle at (x, y): its sole, its toe lit, its laces or cuff. */
const boot = (c: Ctx, x: number, y: number, L: SuitorLook) => {
  const k = L.kit;
  const col = k === 'viking' ? '#6A4A2A' : k === 'prince' ? '#F4F4F5' : k === 'tee' ? '#F4F4F5' : k === 'cape' ? L.main : k === 'knight' ? '#9A9AA6' : k === 'wizard' ? L.main : '#3A2A1A';
  if (k === 'wizard') {
    // (curled-toe slippers)
    shape(c, [x - 5, y - 2, x + 6, y - 1, x + 11, y - 4, x + 9, y + 3, x - 5, y + 3], col);
    box(c, x - 4, y - 1, 8, 1, liteOf(col, 0.3)); box(c, x + 9, y - 4, 2, 2, L.trim);
    return;
  }
  box(c, x - 6, y - 2, 14, 6, INK); box(c, x - 5, y - 1, 12, 5, col);
  box(c, x - 5, y + 2, 12, 2, k === 'tee' || k === 'prince' ? '#C8C8D0' : shadeOf(col, 0.5));
  box(c, x + 3, y - 1, 3, 2, liteOf(col, 0.35)); box(c, x - 5, y - 1, 12, 1, liteOf(col, 0.2));
  if (k === 'tee') { box(c, x - 3, y, 6, 1, L.main); box(c, x + 1, y - 1, 1, 1, INK); box(c, x + 3, y - 1, 1, 1, INK); }
  if (k === 'prince') { box(c, x - 5, y - 2, 12, 1, L.trim); box(c, x + 4, y - 1, 1, 1, liteOf(L.trim, 0.5)); }
  if (k === 'cape') for (let i = 0; i < 3; i++) box(c, x - 3 + i * 3, y - 1, 1, 1, L.trim);
  if (k === 'viking') for (let i = 0; i < 4; i++) { box(c, x - 6 + i * 3.5, y - 4, 3, 3, INK); box(c, x - 5.5 + i * 3.5, y - 3.5, 2, 2, i % 2 ? '#C8B898' : '#A89878'); }
  if (k === 'knight') for (let i = 0; i < 3; i++) box(c, x - 4 + i * 4, y, 1, 2, shadeOf(col, 0.4));
};

/**
 * A suitor, standing (or sat in a cart: 'sit', his feet at feetY as if stood, cut off by whatever's in front of him;
 * or astride a broom: 'ride', its shaft 34 over feetY, fists on it ahead).
 * `opts.talking`: his mouth going; `opts.hold`: what's in his throwing hand ('throw').
 */
export const drawSuitor = (c: Ctx, x: number, feetY: number, facing: 1 | -1, f: number, L: SuitorLook, pose: SuitorPose, opts: SuitorOpts = {}) => {
  const lk = `${L.name}|${L.kit}|${L.skin[1]}|${L.hair}|${L.main}|${L.trim}|${L.gut}`;
  // (a walk frame with his mouth shut is still art: stamped the once per look, frame and facing, painted when first
  // wanted twice (the stamp cache's way), put down after)
  if (pose === 'walk' && !opts.talking && !opts.slump && !opts.dead) {
    const wf = walkFrame(opts.stride ?? 0);
    c.save(); c.translate(Math.round(x), Math.round(feetY));
    stamp(c, `m2suitorWalk|${lk}|${facing}|${wf}`, -64, -142, 128, 150,
      g => drawSuitorLive(g, 0, 0, facing, PH0, L, 'walk', { stride: wf * (WALK_CYCLE / WALK_FRAMES) }));
    c.restore();
    return;
  }
  // (the frame only ever shows up as a few phases (the flex's bob, the mouth open or shut, the talking or throwing
  // arm's beat): any pose not slumped is stamped per those, so the detail's one drawImage a frame)
  const ph: Phases = {
    bob: pose === 'flex' || pose === 'cheer' ? (Math.floor(f / 10) % 2) : 0,
    open: !!opts.talking && Math.floor(f / 5) % 2 === 0,
    arm: pose === 'throw' ? Math.floor(f / 6) % 2 : pose === 'talk' ? Math.floor(f / 8) % 2 : 0,
  };
  if (!opts.slump && pose !== 'walk') {
    c.save(); c.translate(Math.round(x), Math.round(feetY));
    const dead = pose === 'dead';
    stamp(c, `m2suitor|${lk}|${pose}|${facing}|${ph.bob}|${ph.open ? 1 : 0}|${ph.arm}|${opts.dead ? 1 : 0}|${opts.talking ? 1 : 0}`, dead ? -165 : -64, dead ? -50 : -142, dead ? 330 : 128, dead ? 100 : 150,
      g => drawSuitorLive(g, 0, 0, facing, ph, L, pose, { talking: opts.talking, dead: opts.dead }));
    c.restore();
    return;
  }
  drawSuitorLive(c, x, feetY, facing, ph, L, pose, opts);
};

/** drawSuitor's options: `talking` his mouth going; `slump` / `dead` (above); `stride` (pose 'walk') how far he's walked
 *  (the ground covered the way he faces: the cycle's frame is picked from it, so the feet keep pace with the ground). */
export interface SuitorOpts { talking?: boolean; slump?: Slump; dead?: boolean; stride?: number }

/** What of the frame count shows: the flex's bob, the talking mouth open, the talking or throwing arm's beat. */
interface Phases { bob: number; open: boolean; arm: number }
const PH0: Phases = { bob: 0, open: false, arm: 0 };

const drawSuitorLive = (c: Ctx, x: number, feetY: number, facing: 1 | -1, ph: Phases, L: SuitorLook, pose: SuitorPose, opts: SuitorOpts) => {
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale(facing, 1);
  if (pose === 'dead') { c.rotate(-Math.PI / 2); c.translate(-8, -20); }
  const sp = opts.slump, dead = !!opts.dead || pose === 'dead';
  const [sl, sb, sd] = L.skin;
  const oiled = L.kit === 'cape';
  const bob = ph.bob;
  // (walking: the cycle's phase (the near leg's; the far leg half a cycle on), the body dipping a touch as each foot
  // lands and riding up as the legs pass)
  const walking = pose === 'walk', wph = walking ? (walkFrame(opts.stride ?? 0) / WALK_FRAMES) * Math.PI * 2 : 0;
  const wb = walking ? Math.round(Math.abs(Math.sin(wph)) * 2) : 0;
  const hipY = -40 + wb, shY = -72 + bob + wb, gut = L.gut;
  // THE CAPE (behind his torso, down his back, and behind his legs: the user's "the caped guy's cape is in front of his
  // leg, not behind it"): put down before the legs, unless he's slumped (then it tips with his top half, below)
  const cape = () => { c.fillStyle = INK; c.beginPath(); c.moveTo(-18, shY); c.lineTo(-30, -10); c.lineTo(-4, -16); c.lineTo(8, shY); c.closePath(); c.fill(); c.fillStyle = L.main; c.beginPath(); c.moveTo(-17, shY + 1); c.lineTo(-28, -12); c.lineTo(-5, -17); c.lineTo(6, shY + 1); c.closePath(); c.fill();
    // (its folds: shaded troughs, lit crests, the lining's edge in gold, its hem scalloped by the folds)
    c.strokeStyle = shadeOf(L.main, 0.35); c.lineWidth = 2; c.beginPath(); c.moveTo(-12, shY + 4); c.lineTo(-20, -14); c.moveTo(-4, shY + 4); c.lineTo(-11, -16); c.moveTo(-17, shY + 6); c.lineTo(-26, -13); c.stroke();
    c.strokeStyle = liteOf(L.main, 0.25); c.lineWidth = 1; c.beginPath(); c.moveTo(-15, shY + 4); c.lineTo(-24, -13); c.moveTo(-7, shY + 5); c.lineTo(-15, -15); c.stroke();
    c.strokeStyle = shadeOf(L.main, 0.5); c.beginPath(); c.moveTo(0, shY + 3); c.lineTo(-6, -16); c.stroke();
    c.strokeStyle = L.trim; c.beginPath(); c.moveTo(-28, -12); c.lineTo(-5, -17); c.stroke();
    c.strokeStyle = liteOf(L.trim, 0.5); c.beginPath(); c.moveTo(-27, -12.5); c.lineTo(-18, -14.5); c.stroke(); };
  if (L.kit === 'cape' && !sp) cape();
  // LEGS: thick, the trunks or trousers (a muscle tee's cargo shorts: skin from the knee down)
  const legCol = L.kit === 'cape' ? sb : L.kit === 'viking' ? '#5A4A3A' : L.kit === 'tee' ? '#3A4A6A' : L.kit === 'knight' ? '#8A8A94' : L.kit === 'wizard' ? L.main : '#2A2A34';
  const legBare = L.kit === 'cape';
  /** One leg (hip, knee, ankle): muscled; the tee's shorts over the thigh; the viking's bindings round the shin; the
   *  prince's trouser crease; the knight's knee cop. */
  const leg = (pts: P[], ws: number[], far: boolean) => {
    const base = far ? shadeOf(legCol, 0.14) : legCol;
    const skinC = far ? sd : sb;
    if (L.kit === 'tee') {
      muscled(c, pts, ws, skinC, far ? undefined : sl, false, true);
      // (the cargo shorts over the thigh, to just over the knee: a pocket flap, a hem rolled)
      const [h, k] = pts, ex: P = [h[0] + (k[0] - h[0]) * 1.08, h[1] + (k[1] - h[1]) * 1.08];
      c.lineCap = 'butt';
      line1(c, [h[0], h[1], ex[0], ex[1]], INK, ws[0] + 5);
      line1(c, [h[0], h[1], ex[0], ex[1]], base, ws[0] + 3);
      line1(c, [h[0] - 2, h[1], ex[0] - 2, ex[1]], liteOf(base, 0.15), 2);
      const m: P = [(h[0] + ex[0]) / 2, (h[1] + ex[1]) / 2];
      box(c, m[0] + 1, m[1] - 2, 5, 5, shadeOf(base, 0.3)); box(c, m[0] + 1, m[1] - 2, 5, 1, liteOf(base, 0.25));
      box(c, ex[0] - ws[0] / 2 - 1, ex[1] - 2, ws[0] + 3, 2, shadeOf(base, 0.3));
      return;
    }
    muscled(c, pts, ws, base, !far && legBare ? sl : undefined, false, legBare, oiled && !far);
    const [h, k, a] = pts;
    if (L.kit === 'viking') {
      // (the leg bindings: leather straps criss-crossed down the shin, each lit along its top, inked)
      for (let i = 0; i < 4; i++) {
        const t0 = 0.12 + i * 0.2, t1 = t0 + 0.2;
        const p0: P = [k[0] + (a[0] - k[0]) * t0, k[1] + (a[1] - k[1]) * t0], p1: P = [k[0] + (a[0] - k[0]) * t1, k[1] + (a[1] - k[1]) * t1];
        const s = i % 2 ? 1 : -1, w = ws[1] * 0.5;
        line1(c, [p0[0] - s * w, p0[1], p1[0] + s * w, p1[1]], INK, 3);
        line1(c, [p0[0] - s * w, p0[1], p1[0] + s * w, p1[1]], '#8A7A60', 2);
        line1(c, [p0[0] - s * w, p0[1] - 0.5, p1[0] + s * w, p1[1] - 0.5], '#B8A884', 1);
      }
    }
    if (L.kit === 'prince') line1(c, [h[0] + 1, h[1] + 3, k[0] + 1, k[1], a[0] + 1, a[1] - 3], liteOf(base, 0.18));
    if (L.kit === 'knight') { blob(c, k[0] + 2, k[1], 4, 3.5, far ? '#7A7A86' : '#B8B8C4'); box(c, k[0] + 1, k[1] - 1, 1, 1, '#FFFFFF'); }
    if (L.kit === 'wizard') line1(c, [h[0] + 2, h[1] + 4, k[0] + 2, k[1] + 2], shadeOf(base, 0.2));
  };
  if (pose === 'ride') {
    // (astride a broom (its shaft 6 under his hips): knees bent forward, boots tucked back toward the bristles; the
    // far leg in shadow; his upper body leaned forward over the shaft, both fists on it ahead: see below)
    leg([[-4, hipY], [8, hipY + 13], [-7, hipY + 27]], [11, 10], true);
    leg([[2, hipY], [14, hipY + 14], [-1, hipY + 30]], [12, 11], false);
    boot(c, -4, hipY + 28, L);
    c.translate(0, hipY); c.rotate(0.2); c.translate(0, -hipY);
  } else if (walking) {
    // (striding: each leg hip, knee (always forward: limb.ts), ankle; the far one in shadow and half a cycle on; the
    // boots following the feet, the swinging one lifted clear)
    for (const [hx0, ph2, w, far] of [[-7, wph + Math.PI, 11, true], [7, wph, 12, false]] as [number, number, number, boolean][]) {
      const ft = footAt(hx0 + 2, ph2), kn = knee(hx0, hipY, ft[0], ft[1], 19, 19, 1);
      leg([[hx0, hipY], kn, ft], [w, w - 1], far);
      boot(c, ft[0], ft[1], L);
    }
  } else if (pose !== 'sit' && !sp) {
    // (hip, knee (a touch forward), ankle into the boot)
    leg([[-7, hipY], [-7.5, (hipY - 4) / 2 + 1], [-10, -4]], [11, 10], true);
    leg([[7, hipY], [9.5, (hipY - 4) / 2 + 1], [10, -4]], [12, 11], false);
    for (const fx of [-10, 10]) boot(c, fx, -4, L);
  } else {
    // (sat: thighs out in front on the bench, shins down)
    leg([[-4, hipY], [14, hipY + 2], [16, -4]], [12, 11], false);
    boot(c, 16, -4, L);
  }
  // (slumped: the whole of him above the hips tipped over about them, his weight gone out of it)
  if (sp) { c.translate(0, hipY); c.rotate(sp.lean); c.translate(0, -hipY); }
  // (and his arms hanging dead from the shoulders, straight down whichever way he's tipped (the world's down, here),
  // a little bend at the elbow, swinging with what he's riding)
  const hang = (sx: number, sy: number, len: number): [P, P] => {
    const g = sp?.grav ?? 0, l = sp?.lean ?? 0;
    const wx = Math.sin(g) * facing, wy = Math.cos(g);
    const dx = wx * Math.cos(l) + wy * Math.sin(l), dy = -wx * Math.sin(l) + wy * Math.cos(l);
    return [[sx + dx * len * 0.5 + 2, sy + dy * len * 0.5], [sx + dx * len, sy + dy * len]];
  };
  // TRUNKS / BELT
  if (L.kit === 'cape') {
    // (posing trunks: the waistband in gold, a lit top, shaded down the right, the seam; the spray tan's line just over it)
    box(c, -14, hipY - 6, 28, 10, INK); box(c, -13, hipY - 5, 26, 8, L.main); box(c, -13, hipY - 5, 26, 2, L.trim);
    box(c, -13, hipY - 3, 26, 1, liteOf(L.main, 0.25)); box(c, 6, hipY - 3, 7, 6, shadeOf(L.main, 0.25)); box(c, 0, hipY - 2, 1, 5, shadeOf(L.main, 0.4));
    box(c, -12, hipY - 5, 5, 1, liteOf(L.trim, 0.5));
    box(c, -13, hipY - 7, 26, 1, liteOf(sl, 0.25));
  }
  if (L.kit === 'viking') {
    // (the belt, wide as a door: tooled leather, a knotwork plate)
    box(c, -17, hipY - 9, 34, 12, INK); box(c, -16, hipY - 8, 32, 10, '#4A3018'); box(c, -16, hipY - 8, 32, 1, '#6E4A28'); box(c, -16, hipY, 32, 2, '#2E1C0C');
    for (let k = -14; k < 14; k += 4) box(c, k, hipY - 5, 2, 1, '#2E1C0C');
    box(c, -5, hipY - 8, 10, 10, INK); box(c, -4, hipY - 7, 8, 8, '#B8B8C0'); box(c, -4, hipY - 7, 8, 1, '#E4E4EC'); box(c, 3, hipY - 6, 1, 7, '#7A7A84');
    box(c, -2, hipY - 5, 4, 1, '#5A5A64'); box(c, -2, hipY - 2, 4, 1, '#5A5A64'); box(c, -2, hipY - 5, 1, 4, '#5A5A64'); box(c, 1, hipY - 5, 1, 4, '#5A5A64'); box(c, -1, hipY - 4, 2, 2, '#E4E4EC');
  }
  if (L.kit === 'prince') { box(c, -14, hipY - 5, 28, 8, INK); box(c, -13, hipY - 4, 26, 6, '#2A2A34'); box(c, -13, hipY - 4, 26, 1, '#4A4A58'); box(c, -3, hipY - 4, 6, 4, L.trim); box(c, -2, hipY - 3, 2, 1, liteOf(L.trim, 0.5)); }
  if (L.kit === 'tee') { box(c, -14, hipY - 5, 28, 9, INK); box(c, -13, hipY - 4, 26, 7, '#3A4A6A'); box(c, -13, hipY - 4, 26, 2, '#E4E4E7'); box(c, -13, hipY - 4, 26, 1, '#FFFFFF'); for (let k = -10; k < 12; k += 5) box(c, k, hipY - 4, 1, 2, '#9A9AA4'); }
  if (L.kit === 'knight') { box(c, -15, hipY - 6, 30, 10, INK); box(c, -14, hipY - 5, 28, 8, '#8A8A94'); box(c, -14, hipY - 5, 28, 1, '#B8B8C4'); }
  // (the wizard's robe, to the floor: over his legs, the sleeves torn off; its folds, its stars, the hem's trim)
  if (L.kit === 'wizard' && pose !== 'sit' && pose !== 'ride') {
    shape(c, [-18, hipY - 17, 18, hipY - 17, 23, -3, -23, -3], L.main);
    c.save(); c.beginPath(); c.moveTo(-18, hipY - 17); c.lineTo(18, hipY - 17); c.lineTo(23, -3); c.lineTo(-23, -3); c.closePath(); c.clip();
    for (const fx of [-12, -3, 7, 15]) { line1(c, [fx, hipY - 12, fx + (fx > 0 ? 3 : -3), -3], shadeOf(L.main, 0.3), 2); line1(c, [fx - 2, hipY - 12, fx - 2 + (fx > 0 ? 3 : -3), -3], liteOf(L.main, 0.18)); }
    box(c, 10, hipY - 17, 14, 40, shadeOf(L.main, 0.2));
    box(c, -24, -7, 48, 4, L.trim); box(c, -24, -7, 48, 1, liteOf(L.trim, 0.4));
    c.restore();
    for (let k = 0; k < 4; k++) { const sx = -14 + k * 9, sy = -16 + (k % 2) * 8; box(c, sx, sy, 2, 2, L.trim); box(c, sx - 1, sy + 0.5, 4, 1, L.trim); box(c, sx, sy, 1, 1, '#FFFFFF'); }
  }
  // THE BACK ARM (far)
  const throwing = pose === 'throw', flexing = pose === 'flex' || pose === 'cheer';
  const farHand: P = walking ? handAt(-20, hipY, Math.sin(wph)) : pose === 'ride' ? [32, hipY - 3] : flexing ? [-26, shY - 18] : throwing ? [-30, shY - 14] : [-22, hipY - 4];
  const armCuff = (sh: P, el: P, hd: P, far: boolean) => {
    void sh;
    if (L.kit === 'viking') cuff(c, el, hd, 0.4, 0.9, 7, far ? '#4A3018' : '#6A4A2A', '#C8C8D0');
    else if (L.kit === 'tee') cuff(c, el, hd, 0.72, 0.9, 6, L.trim);
    else if (L.kit === 'prince' && !far) cuff(c, el, hd, 0.78, 0.9, 5, L.trim, '#FFFFFF');
    else if (L.kit === 'knight') cuff(c, el, hd, 0.5, 0.95, 8, far ? '#6A6A74' : '#9A9AA6', '#E4E4EC');
  };
  if (sp) {
    const [el, hd] = hang(-16, shY + 6, sp.arm ?? 30);
    muscled(c, [[-16, shY + 6], el, hd], [12, 11], sd, undefined, true, true);
    armCuff([-16, shY + 6], el, hd, true);
    fist(c, hd[0], hd[1], 5, sd);
  } else {
    const fe: P = flexing ? [-28, shY + 4] : walking ? elbow(-16, shY + 6, farHand[0], farHand[1], 17, 16, 1) : elbowOf(-16, shY + 6, farHand[0], farHand[1], -1, 0.7);
    muscled(c, [[-16, shY + 6], fe, farHand], [12, 11], sd, undefined, true, true);
    armCuff([-16, shY + 6], fe, farHand, true);
    fist(c, farHand[0], farHand[1], 5, sd);
  }
  if (L.kit === 'cape' && sp) cape();
  // THE TORSO: a V of shoulders, pecs, abs (or the gut)
  const torso = () => { c.beginPath(); c.moveTo(-24, shY + 6); c.quadraticCurveTo(-24, shY, -18, shY); c.lineTo(18, shY); c.quadraticCurveTo(24, shY, 24, shY + 6); c.quadraticCurveTo(20 + gut * 8, (shY + hipY) / 2 + 4, 13 + gut * 4, hipY); c.lineTo(-13 - gut * 2, hipY); c.quadraticCurveTo(-20, (shY + hipY) / 2, -24, shY + 6); c.closePath(); };
  c.fillStyle = INK; c.beginPath(); c.moveTo(-25, shY + 6); c.quadraticCurveTo(-25, shY - 1, -18, shY - 1); c.lineTo(18, shY - 1); c.quadraticCurveTo(25, shY - 1, 25, shY + 6); c.quadraticCurveTo(21 + gut * 8, (shY + hipY) / 2 + 4, 14 + gut * 4, hipY + 1); c.lineTo(-14 - gut * 2, hipY + 1); c.quadraticCurveTo(-21, (shY + hipY) / 2, -25, shY + 6); c.closePath(); c.fill();
  torso(); c.fillStyle = sb; c.fill();
  // (the torso in steps: lit down the left, shaded down the right and under the pecs, dithered where they meet)
  c.save(); torso(); c.clip();
  box(c, 12, shY, 16, hipY - shY, sd); box(c, 18, shY, 12, hipY - shY, shadeOf(sd, 0.2));
  for (let y = Math.floor(shY); y < hipY; y += 2) { box(c, 11, y, 1, 1, sd); box(c, 17, y + 1, 1, 1, shadeOf(sd, 0.2)); box(c, -15, y, 1, 1, sl); }
  box(c, -24, hipY - 5, 48, 5, sd);
  // (the traps sloping up into the neck, lit)
  box(c, -12, shY, 7, 2, sl); box(c, 5, shY, 6, 2, mixS(sb, sd, 0.3));
  // (pecs: each a slab with its undercut shadow, lit up top toward the light, a nipple; the far one in the light)
  for (const [cx, base, lit] of [[-9, sb, sl], [9, mixS(sb, sd, 0.3), sb]] as [number, string, string][]) {
    oval(c, cx + 1, shY + 10, 9.5, 5.5, 0, sd);
    oval(c, cx, shY + 8.5, 9, 5.5, 0, base);
    oval(c, cx - 2.5, shY + 6.5, 5, 2.6, 0, lit);
    box(c, cx - 5, shY + 5, 3, 1, liteOf(lit, 0.35));
    box(c, cx + 3, shY + 10, 2, 1, shadeOf(sd, 0.15));
  }
  box(c, -12, shY + 14, 11, 1, shadeOf(sd, 0.3)); box(c, 3, shY + 14, 11, 1, shadeOf(sd, 0.3));
  box(c, 0, shY + 3, 1, 12, sd);
  if (gut < 0.5) {
    // (the ab grid: three rows of two, each lit along its top and shaded under; the line down the middle; the
    // serratus's fingers under the near pec; the obliques' V down into the trunks)
    for (let k = 0; k < 3; k++) {
      const y = shY + 17 + k * 5.5;
      for (const [x0, w, lt] of [[-7, 6, sl], [1, 6, mixS(sb, sl, 0.4)]] as [number, number, string][]) {
        box(c, x0, y, w, 4, sb); box(c, x0, y, w, 1, lt); box(c, x0, y + 4, w, 1, sd); box(c, x0 + w - 1, y + 1, 1, 3, mixS(sb, sd, 0.5));
      }
    }
    box(c, 0, shY + 15, 1, hipY - shY - 20, sd);
    for (let k = 0; k < 3; k++) { box(c, 14, shY + 15 + k * 3, 3, 1, shadeOf(sd, 0.15)); box(c, 14, shY + 14 + k * 3, 2, 1, mixS(sb, sd, 0.3)); }
    line1(c, [12, shY + 17, 6, hipY - 1], shadeOf(sd, 0.1)); line1(c, [-11, shY + 17, -6, hipY - 1], sd);
    box(c, 0, hipY - 8, 1, 2, shadeOf(sd, 0.35));
  } else {
    // (the gut: a keg, lit up its top left, shaded under, the navel, a trail of hair)
    blob(c, 6, hipY - 10, 14 + gut * 4, 10, sb, false);
    oval(c, 8, hipY - 3, 13 + gut * 3, 3, 0, sd);
    box(c, 4, hipY - 9, 2, 2, shadeOf(sd, 0.35));
    for (let y = shY + 16; y < hipY - 4; y += 2) box(c, 4 + ((y >> 1) % 2), y, 1, 1, shadeOf(L.hair, 0.1));
  }
  // (chest hair: the viking's, the wizard's)
  if (L.kit === 'viking' || L.kit === 'wizard') for (let y = shY + 4; y < shY + 15; y += 2) for (let x = -5 + ((y >> 1) % 2); x < 6; x += 3) box(c, x, y, 1, 1, shadeOf(L.hair, 0.15));
  // (the oil: specular glints off every swell)
  if (oiled) for (const [gx, gy] of [[-12, 6], [-11, 7], [8, 7], [-6, 18], [3, 18], [-6, 23.5], [-6, 29]] as P[]) box(c, gx, shY + gy, gx === -12 ? 3 : 2, 1, '#FFF6E8');
  c.restore();
  box(c, -22, shY + 1, 4, 18, sl); box(c, -21, shY + 2, 2, 7, liteOf(sl, 0.3));
  if (L.kit === 'viking') {
    // (the fur over the near shoulder: tufted along its edge, each tuft lit; the strap down across his chest, riveted)
    c.lineCap = 'butt';
    line1(c, [12, shY + 4, -10, hipY - 6], INK, 6); line1(c, [12, shY + 4, -10, hipY - 6], '#4A3018', 4); line1(c, [11, shY + 3, -11, hipY - 7], '#6E4A28', 1);
    for (let k = 1; k < 4; k++) box(c, 12 - k * 5.5, shY + 4 + k * ((hipY - 10 - shY) / 4), 1, 1, '#E4E4EC');
    c.fillStyle = INK; c.beginPath(); c.ellipse(10, shY + 4, 16, 9, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = shadeOf(L.main, 0.25); c.beginPath(); c.ellipse(10, shY + 4, 15, 8, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = L.main; c.beginPath(); c.ellipse(8, shY + 2, 12, 6, 0.3, 0, Math.PI * 2); c.fill();
    c.fillStyle = liteOf(L.main, 0.2); c.beginPath(); c.ellipse(4, shY, 6, 3, 0.3, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 7; k++) { const tx = -2 + k * 4, ty = shY + 8 + (k % 2) * 2 + k * 0.6; box(c, tx, ty, 3, 4, INK); box(c, tx, ty, 2, 3, k % 2 ? L.main : shadeOf(L.main, 0.2)); box(c, tx, ty, 1, 1, liteOf(L.main, 0.3)); }
    for (let k = 0; k < 5; k++) box(c, 0 + k * 4, shY - 1 + (k % 2), 1, 2, liteOf(L.main, 0.35));
  }
  if (L.kit === 'prince') {
    // (the tank top, cut low to the navel: its edges hemmed, its creases; the sash across it (PRINCE CHARMING in little
    // gold dots); gold chains, a medallion on the long one)
    shape(c, [-18, shY + 1, -8, shY + 1, -4, hipY - 12, 4, hipY - 12, 8, shY + 1, 18, shY + 1, 13, hipY, -13, hipY], L.main, false);
    line1(c, [-8, shY + 1, -4, hipY - 12, 4, hipY - 12, 8, shY + 1], shadeOf(L.main, 0.45));
    line1(c, [-7, shY + 2, -3.5, hipY - 13], liteOf(L.main, 0.3));
    for (const fx of [-14, 11]) line1(c, [fx, shY + 10, fx + (fx < 0 ? 2 : -1), hipY - 2], shadeOf(L.main, 0.3));
    box(c, 10, shY + 2, 6, hipY - shY - 2, shadeOf(L.main, 0.18));
    c.strokeStyle = '#FFF6E8'; c.lineWidth = 5; c.beginPath(); c.moveTo(-18, shY + 2); c.lineTo(14, hipY - 2); c.stroke();
    c.strokeStyle = '#E8B4C8'; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, shY + 2); c.lineTo(14, hipY - 2); c.stroke();
    for (let k = 0; k < 8; k++) { const t = 0.12 + k * 0.1; box(c, -18 + 32 * t, shY + 2 + (hipY - 4 - shY) * t, 1, 1, k === 3 ? '#E8B4C8' : L.trim); }
    c.strokeStyle = L.trim; c.lineWidth = 1.5; c.beginPath(); c.arc(0, shY + 2, 9, 0.3, Math.PI - 0.3); c.stroke(); c.beginPath(); c.arc(0, shY + 4, 12, 0.4, Math.PI - 0.4); c.stroke();
    c.strokeStyle = liteOf(L.trim, 0.5); c.lineWidth = 1; c.beginPath(); c.arc(0, shY + 2, 9, 1.6, 2.2); c.stroke();
    blob(c, 0, shY + 16, 2.5, 2.5, L.trim); box(c, -1, shY + 15, 1, 1, '#FFFFFF');
  }
  if (L.kit === 'tee') {
    // (a muscle tee, the arm holes cut to his hips: its creases pulled across the pecs, the stripe, a puka shell
    // necklace round his neck)
    shape(c, [-17, shY + 1, -6, shY + 1, 0, shY + 6, 6, shY + 1, 17, shY + 1, 14, hipY, -14, hipY], L.main, false);
    box(c, 8, shY + 2, 8, hipY - shY - 2, shadeOf(L.main, 0.2));
    line1(c, [-6, shY + 1, 0, shY + 6, 6, shY + 1], shadeOf(L.main, 0.45));
    for (const [x0, y0, x1, y1] of [[-12, shY + 8, -3, shY + 12], [3, shY + 12, 12, shY + 7], [-10, shY + 22, -2, shY + 24], [2, shY + 25, 11, shY + 21]]) { line1(c, [x0, y0, x1, y1], shadeOf(L.main, 0.3)); line1(c, [x0, y0 - 1, x1, y1 - 1], liteOf(L.main, 0.2)); }
    box(c, -13, shY + 16, 26, 3, L.trim); box(c, -13, shY + 16, 26, 1, liteOf(L.trim, 0.4)); box(c, 8, shY + 16, 5, 3, shadeOf(L.trim, 0.2));
    for (let k = 0; k < 9; k++) { const a = 0.35 + k * 0.3; box(c, Math.cos(a) * 8 - 0.5, shY - 1 + Math.sin(a) * 5, 2, 1, k % 2 ? '#FFFFFF' : '#E8DCC8'); }
  }
  if (L.kit === 'knight') {
    // (mail on the shoulders, ring by ring; the tabard down the front to below his hips, its folds, a gold hem, a cross)
    box(c, -24, shY, 48, 9, '#8A8A94');
    for (let y = shY; y < shY + 9; y += 2) for (let x = -23 + ((y - shY) % 4 ? 1 : 0); x < 23; x += 2) { box(c, x, y, 1, 1, '#5A5A64'); }
    for (let x = -23; x < 23; x += 4) box(c, x, shY, 1, 1, '#D8D8E4');
    box(c, 12, shY, 12, 9, 'rgba(26, 16, 40, 0.25)');
    box(c, -15, shY + 6, 30, hipY - shY + 10, INK); box(c, -14, shY + 7, 28, hipY - shY + 8, L.main);
    for (const fx of [-9, 6]) { box(c, fx, shY + 12, 2, hipY - shY + 2, shadeOf(L.main, 0.3)); box(c, fx - 1, shY + 12, 1, hipY - shY + 2, liteOf(L.main, 0.2)); }
    box(c, 8, shY + 7, 6, hipY - shY + 8, shadeOf(L.main, 0.15));
    box(c, -14, hipY + 12, 28, 2, L.trim); box(c, -14, hipY + 12, 28, 1, liteOf(L.trim, 0.4));
    box(c, -2, shY + 10, 4, 26, L.trim); box(c, -9, shY + 18, 18, 4, L.trim); box(c, -2, shY + 10, 1, 26, liteOf(L.trim, 0.45)); box(c, -9, shY + 18, 18, 1, liteOf(L.trim, 0.45)); box(c, 1, shY + 10, 1, 26, shadeOf(L.trim, 0.3));
    box(c, -15, hipY - 4, 30, 3, '#3A2A1A'); box(c, -2, hipY - 5, 4, 5, '#C8C8D0');
  }
  if (L.kit === 'wizard') {
    // (the robe's top, over his chest, open to the belt; a rope belt, knotted, its tassels hanging)
    shape(c, [-20, shY + 1, -6, shY + 1, 0, shY + 14, 6, shY + 1, 20, shY + 1, 15, hipY, -15, hipY], L.main, false);
    line1(c, [-6, shY + 1, 0, shY + 14, 6, shY + 1], L.trim);
    box(c, 9, shY + 2, 8, hipY - shY - 2, shadeOf(L.main, 0.2));
    for (const fx of [-13, 11]) line1(c, [fx, shY + 6, fx + 1, hipY - 2], shadeOf(L.main, 0.3));
    box(c, -15, hipY - 6, 30, 3, '#D8C890'); for (let k = -14; k < 15; k += 3) box(c, k, hipY - 6, 1, 3, '#A89860');
    blob(c, -4, hipY - 5, 2.5, 2, '#D8C890');
    for (const tx of [-6, -2]) { box(c, tx, hipY - 3, 2, 9, INK); box(c, tx, hipY - 3, 1, 8, '#D8C890'); box(c, tx - 1, hipY + 5, 3, 2, '#A89860'); }
    box(c, -10, shY + 8, 2, 2, L.trim); box(c, 12, shY + 16, 2, 2, L.trim);
  }
  // (the far shoulder's cap over the torso's corner, in its shade; the torn sleeve's fringe on the wizard)
  deltoid(c, -19, shY + 5, -1, L.kit === 'knight' ? '#6A6A74' : sd, 7);
  if (L.kit === 'wizard') for (let k = 0; k < 4; k++) shape(c, [-25 + k * 3, shY - 1, -22 + k * 3, shY - 1, -23.5 + k * 3, shY + 3 + (k % 2) * 2], shadeOf(L.main, 0.15));
  // THE HEAD (slumped: lolled over on the neck, dropped a little)
  c.save();
  if (sp) { c.translate(0, shY - 2); c.rotate(sp.loll); c.translate(0, -(shY - 2) + 3); }
  drawHead(c, L, shY, pose, dead, ph.open);
  c.restore();
  // THE NEAR ARM: a bicep the size of his head
  if (sp) {
    const [el, hd] = hang(16, shY + 6, sp.arm ?? 30);
    muscled(c, [[16, shY + 6], el, hd], [13, 11], sb, sl, true, true, oiled);
    armCuff([16, shY + 6], el, hd, false);
    fist(c, hd[0], hd[1], 5.5, sb);
    deltoid(c, 18, shY + 5, 1, L.kit === 'knight' ? '#8A8A94' : sb, 8, oiled);
    c.restore();
    return;
  }
  const nearHand: P = walking ? handAt(21, hipY, -Math.sin(wph)) : pose === 'ride' ? [26, hipY - 2] : flexing ? [24, shY - 20] : throwing ? [30, shY - 30 + ph.arm * 8] : pose === 'point' ? [36, shY + 2] : pose === 'talk' ? [24, shY + 8 + ph.arm * 3] : [20, hipY - 4];
  const ne: P = flexing ? [28, shY + 4] : walking ? elbow(16, shY + 6, nearHand[0], nearHand[1], 17, 16, 1) : elbowOf(16, shY + 6, nearHand[0], nearHand[1], 1, 0.7);
  muscled(c, [[16, shY + 6], ne, nearHand], [13, 11], sb, sl, true, true, oiled);
  armCuff([16, shY + 6], ne, nearHand, false);
  if (flexing) { blob(c, 24, shY - 4, 8, 7, sb); line1(c, [20, shY - 5, 23, shY - 8, 27, shY - 6], shadeOf(sb, 0.22)); box(c, 21, shY - 9, 2, 1, oiled ? '#FFF6E8' : liteOf(sb, 0.4)); }
  deltoid(c, 18, shY + 5, 1, L.kit === 'knight' ? '#8A8A94' : sb, 8, oiled);
  if (L.kit === 'wizard') for (let k = 0; k < 4; k++) shape(c, [12 + k * 3, shY - 1, 15 + k * 3, shY - 1, 13.5 + k * 3, shY + 3 + (k % 2) * 2], L.main);
  fist(c, nearHand[0], nearHand[1], 5.5, sb);
  if (pose === 'point') { box(c, nearHand[0] + 4, nearHand[1] - 2, 8, 4, INK); box(c, nearHand[0] + 4, nearHand[1] - 1, 7, 2, sb); box(c, nearHand[0] + 4, nearHand[1] - 1, 6, 1, sl); }
  c.restore();
};

/** The head: the neck and its traps, the ear, a square jaw, his mug, his hair, his hat (in the body's frame, facing +x:
 *  its middle at (2, shY - 17)). */
const drawHead = (c: Ctx, L: SuitorLook, shY: number, pose: SuitorPose, dead: boolean, open: boolean) => {
  const [sl, sb, sd] = L.skin;
  const hx = 2, hy = shY - 17;
  const mug = mugOf(L), hs = hairOf(L), fh = facialOf(L);
  const H = L.hair, HL = liteOf(H, H === '#140A06' || H === '#2A1A0E' ? 0.22 : 0.35), HD = shadeOf(H, 0.3);
  // (the neck, thick as his head: the trap slopes, the cords down its side, the Adam's apple)
  shape(c, [-11, shY + 1, -6, shY - 9, 7, shY - 9, 12, shY + 1], sb, false);
  line1(c, [-11.5, shY + 1, -6.5, shY - 9.5], INK, 1.5); line1(c, [12.5, shY + 1, 7.5, shY - 9.5], INK, 1.5);
  box(c, 3, shY - 8, 8, 9, sd); box(c, -6, shY - 8, 3, 8, sl);
  line1(c, [-1, shY - 8, 4, shY], mixS(sb, sd, 0.6));
  box(c, 6, shY - 5, 2, 2, sb); box(c, 6, shY - 5, 1, 1, sl);
  // (the ear, behind the jaw: its rim lit, its hole)
  blob(c, hx - 8, hy + 1, 2.5, 3.5, sb); box(c, hx - 8, hy + 1, 1, 2, shadeOf(sd, 0.3));
  // (the skull and the jaw: a square jaw jutting forward, a cleft in the chin)
  const jaw = [hx - 7, hy + 2, hx - 3, hy + 11, hx + 9, hy + 12, hx + 11, hy + 8, hx + 11, hy + 1];
  oval(c, hx, hy, 11, 12, 0, INK); shape(c, jaw, INK);
  blob(c, hx, hy, 10, 11, sb, false); shape(c, jaw, sb, false);
  box(c, hx - 9, hy - 4, 5, 10, sl); box(c, hx - 8, hy - 3, 2, 4, liteOf(sl, 0.3));
  box(c, hx - 5, hy + 8, 15, 4, sd); box(c, hx - 3, hy + 11, 12, 1, shadeOf(sd, 0.25));
  box(c, hx + 2, hy + 4, 1, 3, mixS(sb, sd, 0.5));
  box(c, hx + 4, hy + 2, 3, 1, sl);
  if (mug !== 'dumb') box(c, hx + 9, hy + 9, 1, 2, shadeOf(sd, 0.3));
  // (five o'clock shadow, dithered, on the ones who don't shave their faces off)
  if (L.kit !== 'cape' && L.kit !== 'prince' && fh !== 'long' && fh !== 'braid') for (let y = hy + 5; y < hy + 12; y++) for (let x = hx + 1 + (y % 2); x < hx + 10; x += 2) box(c, x, y, 1, 1, mixS(sd, H, 0.35));
  // (the nose: a bump off the face, its bridge lit, the nostril)
  box(c, hx + 9, hy - 2, 5, 6, INK); box(c, hx + 10, hy - 1, 3, 4, sb); box(c, hx + 10, hy - 1, 1, 3, sl); box(c, hx + 11, hy + 2, 2, 1, sd); box(c, hx + 12, hy, 1, 1, liteOf(sl, 0.4));
  // (the brow: a shelf, its shadow under it)
  box(c, hx + 1, hy - 2, 9, 1, mixS(sb, sd, 0.5));
  // EYES (dead: X'd out)
  if (dead) {
    for (const ex of [hx + 2, hx + 7]) { box(c, ex - 1, hy - 2, 1, 1, INK); box(c, ex + 2, hy - 2, 1, 1, INK); box(c, ex, hy - 1, 2, 2, INK); box(c, ex - 1, hy + 1, 1, 1, INK); box(c, ex + 2, hy + 1, 1, 1, INK); }
  } else if (pose === 'hurt') {
    for (const ex of [hx + 1, hx + 6]) { box(c, ex, hy - 1, 3, 1, INK); box(c, ex + 1, hy, 1, 1, INK); }
  } else if (mug === 'dumb') {
    for (const ex of [hx + 1, hx + 6]) { box(c, ex, hy - 2, 3, 3, INK); box(c, ex, hy - 2, 3, 2, '#FFFFFF'); box(c, ex + 1, hy - 1, 1, 1, INK); }
  } else if (mug === 'smug') {
    for (const ex of [hx + 1, hx + 6]) { box(c, ex, hy - 1, 3, 2, '#FFFFFF'); box(c, ex + 2, hy - 1, 1, 2, INK); box(c, ex, hy - 2, 3, 1, INK); box(c, ex, hy - 1, 3, 1, mixS(sb, sd, 0.4)); }
  } else {
    for (const ex of [hx + 1, hx + 6]) { box(c, ex, hy - 1, 3, 1, '#FFFFFF'); box(c, ex + 1, hy - 1, 2, 1, INK); box(c, ex, hy - 2, 3, 1, INK); }
  }
  // (the brows: thick, his hair's color; low and knotted (stern), cocked (smug), up and stupid (dumb))
  const bc = shadeOf(H, 0.2);
  if (mug === 'stern' || pose === 'hurt') { box(c, hx, hy - 4, 4, 2, bc); box(c, hx + 5, hy - 3, 2, 2, bc); box(c, hx + 7, hy - 4, 3, 2, bc); }
  else if (mug === 'smug') { box(c, hx, hy - 4, 4, 2, bc); box(c, hx + 6, hy - 5, 4, 2, bc); box(c, hx + 5, hy - 4, 1, 1, bc); }
  else { box(c, hx, hy - 5, 4, 2, bc); box(c, hx + 6, hy - 5, 4, 2, bc); }
  // MOUTH
  if (dead) { box(c, hx + 3, hy + 5, 6, 5, INK); box(c, hx + 5, hy + 8, 4, 3, '#E0607A'); box(c, hx + 5, hy + 8, 2, 1, '#F49AAE'); }
  else if (pose === 'hurt') { box(c, hx + 3, hy + 5, 7, 4, INK); box(c, hx + 4, hy + 6, 5, 2, '#FFFFFF'); box(c, hx + 6, hy + 6, 1, 2, INK); }
  else if (open) { box(c, hx + 3, hy + 5, 7, 4, INK); box(c, hx + 4, hy + 5, 5, 1, '#FFFFFF'); box(c, hx + 4, hy + 7, 4, 1, '#C83A50'); }
  else if (mug === 'smug') { box(c, hx + 3, hy + 6, 7, 1, INK); box(c, hx + 9, hy + 5, 2, 1, INK); box(c, hx + 6, hy + 5, 3, 1, '#FFFFFF'); box(c, hx + 4, hy + 7, 5, 1, mixS(sb, '#C04050', 0.3)); }
  else if (mug === 'dumb') { box(c, hx + 4, hy + 5, 5, 4, INK); box(c, hx + 5, hy + 5, 3, 1, '#FFFFFF'); box(c, hx + 5, hy + 7, 3, 1, '#C83A50'); }
  else { box(c, hx + 3, hy + 6, 7, 1, INK); box(c, hx + 4, hy + 7, 5, 1, mixS(sb, '#C04050', 0.25)); }
  // FACIAL HAIR (under the hats; the viking's and the wizard's beards with their hats, below)
  if (fh === 'goatee') { box(c, hx + 5, hy + 8, 6, 5, INK); box(c, hx + 6, hy + 8, 4, 4, H); box(c, hx + 6, hy + 8, 1, 2, HL); box(c, hx + 4, hy + 4, 7, 1, H); }
  if (fh === 'stache') { box(c, hx + 3, hy + 3, 10, 3, INK); box(c, hx + 4, hy + 3, 8, 2, H); box(c, hx + 4, hy + 3, 3, 1, HL); box(c, hx + 3, hy + 5, 2, 3, H); box(c, hx + 11, hy + 5, 2, 3, H); }
  // HAIR (under whatever he wears on his head)
  hair(c, L, hs, hx, hy, H, HL, HD);
  // HATS
  if (L.kit === 'cape') {
    // (the cardboard crown, crooked: its corrugated cut edge, paste jewels, a strip of tape holding a point on)
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 9, hy - 10); c.lineTo(hx - 9, hy - 21); c.lineTo(hx - 4, hy - 15); c.lineTo(hx + 1, hy - 23); c.lineTo(hx + 6, hy - 15); c.lineTo(hx + 11, hy - 21); c.lineTo(hx + 11, hy - 10); c.closePath(); c.fill();
    c.fillStyle = L.trim; c.beginPath(); c.moveTo(hx - 8, hy - 11); c.lineTo(hx - 8, hy - 19); c.lineTo(hx - 4, hy - 14); c.lineTo(hx + 1, hy - 21); c.lineTo(hx + 6, hy - 14); c.lineTo(hx + 10, hy - 19); c.lineTo(hx + 10, hy - 11); c.closePath(); c.fill();
    box(c, hx + 5, hy - 15, 5, 4, shadeOf(L.trim, 0.25)); box(c, hx - 8, hy - 17, 2, 6, liteOf(L.trim, 0.4)); box(c, hx, hy - 19, 1, 4, liteOf(L.trim, 0.4));
    box(c, hx - 8, hy - 12, 18, 1, shadeOf(L.trim, 0.35));
    for (const [jx, col] of [[hx - 5, '#DC2626'], [hx + 1, '#2563EB'], [hx + 7, '#16A34A']] as [number, string][]) { box(c, jx, hy - 14, 2, 2, col); box(c, jx, hy - 14, 1, 1, '#FFFFFF'); }
    box(c, hx + 8, hy - 20, 3, 4, '#C8C8C0'); box(c, hx + 8, hy - 20, 1, 4, '#E8E8E0');
  }
  if (L.kit === 'viking') {
    // (the beard in braids, banded; the horned helmet: riveted band, a nasal down the nose, ringed horns)
    const beard = fh === 'beard' ? 14 : 22;
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 7, hy + 2); c.lineTo(hx + 11, hy + 2); c.lineTo(hx + 6, hy + beard); c.lineTo(hx, hy + beard); c.closePath(); c.fill();
    c.fillStyle = H; c.beginPath(); c.moveTo(hx - 6, hy + 3); c.lineTo(hx + 10, hy + 3); c.lineTo(hx + 5, hy + beard - 1); c.lineTo(hx + 1, hy + beard - 1); c.closePath(); c.fill();
    for (let y = hy + 5; y < hy + beard - 2; y += 2) { box(c, hx + 1 + ((y >> 1) % 2), y, 1, 1, HD); box(c, hx + 5 - ((y >> 1) % 2), y, 1, 1, HL); }
    box(c, hx - 5, hy + 4, 3, 6, HL);
    if (fh === 'braid') for (const by of [hy + 13, hy + 18]) { box(c, hx + 1, by, 5, 2, L.trim); box(c, hx + 1, by, 2, 1, '#FFFFFF'); }
    box(c, hx + 3, hy + 5, 6, 1, INK); box(c, hx + 3, hy + 3, 9, 2, H); box(c, hx + 4, hy + 3, 3, 1, HL);
    if (fh === 'beard') for (const bx of [hx - 9, hx - 6]) { box(c, bx, hy - 2, 3, 14, INK); box(c, bx + 0.5, hy - 1, 2, 12, H); box(c, bx + 0.5, hy + 4, 2, 1, L.trim); }
    blob(c, hx, hy - 7, 11, 7, L.trim);
    box(c, hx - 10, hy - 3, 21, 3, INK); box(c, hx - 9, hy - 3, 19, 2, shadeOf(L.trim, 0.15)); for (let k = -8; k < 10; k += 4) box(c, hx + k, hy - 3, 1, 1, '#FFFFFF');
    box(c, hx + 9, hy - 6, 3, 8, INK); box(c, hx + 10, hy - 5, 1, 6, liteOf(L.trim, 0.3));
    for (const s of [-1, 1]) {
      c.fillStyle = INK; c.beginPath(); c.moveTo(hx + s * 9, hy - 8); c.quadraticCurveTo(hx + s * 22, hy - 12, hx + s * 20, hy - 26); c.lineTo(hx + s * 14, hy - 12); c.closePath(); c.fill();
      c.fillStyle = '#F2EAD0'; c.beginPath(); c.moveTo(hx + s * 9, hy - 9); c.quadraticCurveTo(hx + s * 20, hy - 12, hx + s * 19, hy - 23); c.lineTo(hx + s * 13, hy - 12); c.closePath(); c.fill();
      for (let k = 0; k < 3; k++) box(c, hx + s * (12 + k * 2.5) - 1, hy - 11 - k * 3.5, 2, 1, '#B8A888');
      box(c, hx + s * 18 - 0.5, hy - 21, 1, 2, '#FFFFFF');
    }
  }
  if (L.kit === 'tee') {
    // (a backwards cap: the dome, its seams, the button up top, the brim out behind; through the strap's gap over his
    // forehead, his hair (frosted tips poke out of it))
    blob(c, hx + 1, hy - 8, 11, 6, L.main); box(c, hx - 18, hy - 7, 10, 4, INK); box(c, hx - 17, hy - 6, 9, 2, L.main); box(c, hx - 17, hy - 6, 9, 1, liteOf(L.main, 0.25));
    box(c, hx + 6, hy - 13, 4, 6, shadeOf(L.main, 0.22)); line1(c, [hx + 1, hy - 14, hx + 1, hy - 5], shadeOf(L.main, 0.3)); line1(c, [hx - 5, hy - 12, hx - 3, hy - 5], shadeOf(L.main, 0.25));
    box(c, hx, hy - 15, 2, 1, liteOf(L.main, 0.4));
    box(c, hx - 9, hy - 5, 20, 2, L.trim); box(c, hx - 9, hy - 5, 20, 1, liteOf(L.trim, 0.4));
    box(c, hx + 5, hy - 7, 4, 2, INK); box(c, hx + 6, hy - 7, 2, 2, hs === 'frosted' ? '#FFF2B0' : H);
    if (hs === 'frosted') for (const [sx, sy] of [[hx + 5, hy - 10], [hx + 8, hy - 9], [hx + 10, hy - 7]] as P[]) { shape(c, [sx, sy + 3, sx + 1.5, sy - 1, sx + 3, sy + 3], H); box(c, sx + 1, sy - 1, 1, 2, '#FFF2B0'); }
  }
  if (L.kit === 'knight') {
    // (the helmet, the visor up off his face (its slits), a cheek guard, rivets, a plume)
    blob(c, hx, hy - 6, 12, 9, '#A8A8B4'); box(c, hx - 11, hy - 6, 4, 14, INK); box(c, hx - 10, hy - 5, 3, 12, '#8A8A94'); box(c, hx - 10, hy - 5, 1, 12, '#B8B8C4');
    box(c, hx - 2, hy - 13, 14, 4, INK); box(c, hx - 1, hy - 12, 13, 2, '#C8C8D4'); box(c, hx - 1, hy - 12, 13, 1, '#E8E8F0');
    for (let k = 0; k < 4; k++) box(c, hx + 1 + k * 3, hy - 11, 2, 1, INK);
    box(c, hx - 11, hy - 4, 22, 1, '#6A6A74'); for (const rx of [hx - 8, hx - 2, hx + 4]) box(c, rx, hy - 5, 1, 1, '#FFFFFF');
    box(c, hx - 5, hy - 12, 3, 2, '#E8E8F0');
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx - 4, hy - 18, 9, 5, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = L.trim; c.beginPath(); c.ellipse(hx - 4, hy - 18, 8, 4, -0.4, 0, Math.PI * 2); c.fill();
    c.fillStyle = shadeOf(L.trim, 0.2); c.beginPath(); c.ellipse(hx - 2, hy - 16.5, 5, 2, -0.4, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 4; k++) line1(c, [hx - 10 + k * 3, hy - 20 + k * 1.5, hx - 7 + k * 3, hy - 17 + k], liteOf(L.trim, 0.4));
    if (fh === 'none') { box(c, hx + 6, hy + 4, 4, 5, H); }
  }
  if (L.kit === 'wizard') {
    // (a beard to his belt, strand by strand (forked, on Thaddeus); a pointy hat, crumpled at the tip, with stars)
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 8, hy + 2); c.lineTo(hx + 12, hy + 2);
    if (fh === 'forked') { c.lineTo(hx + 8, hy + 30); c.lineTo(hx + 4, hy + 20); c.lineTo(hx, hy + 30); } else c.lineTo(hx + 4, hy + 34);
    c.closePath(); c.fill();
    c.fillStyle = H; c.beginPath(); c.moveTo(hx - 7, hy + 3); c.lineTo(hx + 11, hy + 3);
    if (fh === 'forked') { c.lineTo(hx + 7.5, hy + 28); c.lineTo(hx + 4, hy + 18); c.lineTo(hx + 0.5, hy + 28); } else c.lineTo(hx + 4, hy + 32);
    c.closePath(); c.fill();
    for (let k = 0; k < 5; k++) line1(c, [hx - 3 + k * 3, hy + 6, hx + 1 + k * 1.2, hy + 16 + k * 2], k % 2 ? HD : HL);
    box(c, hx + 3, hy + 5, 6, 1, INK); box(c, hx + 3, hy + 3, 9, 2, H); box(c, hx + 4, hy + 3, 3, 1, liteOf(H, 0.4));
    box(c, hx - 11, hy - 8, 4, 16, INK); box(c, hx - 10, hy - 7, 3, 14, H); box(c, hx - 10, hy - 7, 1, 14, HL);
    box(c, hx - 14, hy - 10, 30, 4, INK); box(c, hx - 13, hy - 9, 28, 2, L.main); box(c, hx - 13, hy - 9, 28, 1, liteOf(L.main, 0.25));
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 9, hy - 9); c.lineTo(hx - 6, hy - 40); c.lineTo(hx + 11, hy - 9); c.closePath(); c.fill();
    c.fillStyle = L.main; c.beginPath(); c.moveTo(hx - 8, hy - 10); c.lineTo(hx - 6, hy - 37); c.lineTo(hx + 10, hy - 10); c.closePath(); c.fill();
    c.fillStyle = shadeOf(L.main, 0.25); c.beginPath(); c.moveTo(hx + 1, hy - 10); c.lineTo(hx - 5, hy - 34); c.lineTo(hx + 10, hy - 10); c.closePath(); c.fill();
    line1(c, [hx - 7, hy - 22, hx - 1, hy - 24], shadeOf(L.main, 0.4)); line1(c, [hx - 7, hy - 23, hx - 2, hy - 25], liteOf(L.main, 0.25));
    box(c, hx - 7, hy - 14, 2, 3, liteOf(L.main, 0.2));
    for (const [sx, sy] of [[hx - 3, hy - 22], [hx + 2, hy - 15], [hx - 6, hy - 30]] as P[]) { box(c, sx, sy, 2, 2, L.trim); box(c, sx - 1, sy + 0.5, 4, 1, L.trim); box(c, sx, sy, 1, 1, '#FFFFFF'); }
  }
};

/** His hair, by its style (the cap, the crown, the helmet and the hat go on over it). */
const hair = (c: Ctx, L: SuitorLook, hs: HairStyle, hx: number, hy: number, H: string, HL: string, HD: string) => {
  const k = L.kit;
  if (k === 'knight' || k === 'viking' || k === 'wizard') return;
  if (k === 'tee') {
    // (out from under the cap: the sideburn, and the style where it shows (the back, the sides))
    box(c, hx - 9, hy - 6, 3, 6, H);
    if (hs === 'mullet') { shape(c, [hx - 11, hy - 5, hx - 6, hy - 4, hx - 7, hy + 10, hx - 12, hy + 12, hx - 13, hy + 4], H); line1(c, [hx - 10, hy - 3, hx - 10, hy + 9], HL); line1(c, [hx - 8, hy - 2, hx - 9, hy + 8], HD); }
    if (hs === 'pony') { box(c, hx - 12, hy - 5, 3, 3, L.trim); shape(c, [hx - 12, hy - 3, hx - 9, hy - 3, hx - 12, hy + 10, hx - 15, hy + 9], H); line1(c, [hx - 12, hy - 1, hx - 13, hy + 7], HL); }
    if (hs === 'curls') for (const [cx, cy] of [[hx - 10, hy - 4], [hx - 11, hy], [hx - 8, hy + 2], [hx + 9, hy - 6]] as P[]) { blob(c, cx, cy, 2.2, 2.2, H); }
    if (hs === 'buzz') box(c, hx - 9, hy - 6, 2, 4, HD);
    return;
  }
  if (hs === 'slick') {
    // (oiled straight back: its comb lines lit, the ends flipped up at the nape)
    shape(c, [hx - 10, hy - 4, hx - 9, hy - 10, hx - 3, hy - 12, hx + 6, hy - 12, hx + 10, hy - 8, hx + 9, hy - 5, hx + 1, hy - 7, hx - 7, hy - 4, hx - 9, hy + 1, hx - 12, hy], H);
    for (let i = 0; i < 4; i++) line1(c, [hx + 7 - i * 2, hy - 11 + i * 0.3, hx - 6 - i, hy - 8 + i * 1.5], i % 2 ? HD : HL);
    box(c, hx + 2, hy - 11, 3, 1, liteOf(HL, 0.5));
  } else if (hs === 'buzz') {
    // (cropped to the scalp: the hair's dark dithered over the skin, the hairline square)
    c.save(); c.beginPath(); c.ellipse(hx, hy, 10, 11, 0, 0, Math.PI * 2); c.clip();
    for (let y = hy - 11; y < hy - 4; y++) for (let x = hx - 10 + (y % 2); x < hx + 9; x += 2) box(c, x, y, 1, 1, H);
    for (let y = hy - 4; y < hy + 2; y++) for (let x = hx - 10 + (y % 2); x < hx - 5; x += 2) box(c, x, y, 1, 1, H);
    c.restore();
    box(c, hx - 9, hy - 6, 18, 1, mixS(H, L.skin[2], 0.4));
  } else if (hs === 'pomp') {
    // (a pompadour: swept up and over in a big roll off the forehead, lit along its crest)
    shape(c, [hx - 10, hy - 3, hx - 9, hy - 10, hx - 2, hy - 13, hx + 4, hy - 18, hx + 11, hy - 17, hx + 12, hy - 12, hx + 9, hy - 7, hx - 7, hy - 5, hx - 9, hy + 1], H);
    for (let i = 0; i < 3; i++) line1(c, [hx - 6 + i * 2, hy - 8 - i, hx + 3 + i * 2, hy - 15 - i * 0.6, hx + 10, hy - 14 + i], i === 1 ? HL : HD);
    box(c, hx + 5, hy - 17, 4, 1, liteOf(HL, 0.4));
  } else if (hs === 'waves') {
    // (long and wavy, to the jaw at the back: the waves lit in bands)
    shape(c, [hx - 11, hy + 8, hx - 12, hy - 4, hx - 8, hy - 11, hx, hy - 13, hx + 8, hy - 11, hx + 10, hy - 6, hx + 3, hy - 7, hx - 5, hy - 5, hx - 6, hy + 2, hx - 8, hy + 9], H);
    for (let i = 0; i < 4; i++) { const y = hy - 9 + i * 4; line1(c, [hx - 10, y + 1, hx - 8, y - 1, hx - 6, y + 1], HL); }
    line1(c, [hx - 2, hy - 11, hx + 6, hy - 10], HL);
  } else if (hs === 'bun' || hs === 'frosted' || hs === 'mullet' || hs === 'curls' || hs === 'pony') {
    // (a man bun: slicked tight back to a knot on top, a band round it, a loose strand)
    box(c, hx - 8, hy - 11, 18, 6, INK); box(c, hx - 8, hy - 11, 18, 5, H); box(c, hx - 7, hy - 11, 15, 1, HL); line1(c, [hx + 7, hy - 9, hx - 5, hy - 8], HD);
    blob(c, hx - 6, hy - 14, 5, 4, H); line1(c, [hx - 9, hy - 15, hx - 4, hy - 17], HL); line1(c, [hx - 8, hy - 12, hx - 3, hy - 14], HD);
    box(c, hx - 3, hy - 13, 2, 3, L.trim);
    line1(c, [hx + 8, hy - 6, hx + 9, hy - 1], H);
  }
};
