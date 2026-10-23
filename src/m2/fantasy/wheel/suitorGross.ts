// THE SUITORS' HEADS AS GROSS-UPS, on the Fairy Wheel's close-ups (the user: "make the suitors look more detailed...
// the closeup beatdowns on the fairy wheel"; the standing rule: a close-up singling a man out is a Ren & Stimpy gross-up,
// grossKit.ts). closeup.ts's picture is painted at the screen's own resolution under its 2x blow-up, so each suitor's
// head goes in as a stamp painted per pixel in the kit's buffer at 2.3 px a head unit (the head drawn 1.15x in the
// picture: one buffer pixel a screen pixel): lumpy skin in a long ramp off his own three tones, pores thick on the nose,
// blackheads, grease shining (Braxton's oil), stubble, bags under bloodshot eyes with their threads, a rayed iris, wet
// glints, sweat beads, veins up the temple and the neck when he strains, cracked lips, gums, yellowed teeth with plaque
// (Braxton's veneers, Gunnar's rot, Wayne's gold one), spit strung across a scream, a tongue lolling out of a slack mouth,
// drool; his own hair strand by strand (Chad's frosted tips through his backwards cap, Braxton's slick-back under the
// cardboard crown, Tremaine's bun, Gunnar's braided beard under the horned helmet, Wayne's beard to his belt under the
// hat, Derek's goatee under the visor), the same man as the side view (suitors.ts's hairOf / facialOf / mugOf).
//
// THE BEATING (`dmg` 0..5): 1 a red welt and a nosebleed; 2 a black eye swelling the near lid shut, a split lip, a tooth
// out; 3 the nose broken crooked and purple, the far eye swollen shut, a goose egg on the forehead, more teeth; 4 the
// brow split open and running, blood down the chin; 5 everything, the face a lumpy mess, most of his teeth gone.
// `purp` 0..4: choking (the face going purple, veins up).
//
// Each (man, face, beating, purple) is painted once and kept (a 140 x 204 canvas); the tussle's set is painted ahead in
// idle moments when the wheel comes up, a fight's kill set when his QTE starts (warmSuitorGross), so no close-up waits.

import { idleJob } from '../../../m1/game/scenes/art/raster';
import {
  type Buf, type BallO, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, plot, path, ball, tint, poly, bead, vein, hairs, stubble, inkEdges,
  skinPost, eyeball, teeth, stepper, bay, hash2, GW, GH, M_SKIN, M_HAIR, M_LIP, M_MOUTH, M_OTHER, M_METAL, M_CLOTH, SCLERA, SCLERA_R, SCLERA_Y,
  MOUTH, TONGUE, GUM, BLOOD, VEIN, matAt,
} from '../../grossKit';
import { hairOf, facialOf, type SuitorLook } from '../suitors';

type Ctx = CanvasRenderingContext2D;
export type GrossFace = 'grit' | 'pain' | 'sneer' | 'smug' | 'scream' | 'shock' | 'dazed' | 'dead' | 'choke';

// ---------------------------------------------------------------------------------------------------------------
// The grid: U buffer px a head unit (closeup.ts's head units: the head's middle at 0, facing +x), the buffer's (0, 0)
// at (OX, OY); only the left CW px of it are kept (the head never reaches further right).

const U = 2.3, OX = -38, OY = -44, CW = 140;
/** Where and how big the stamp goes, in head units (drawn in the head's frame). */
export const GROSS_BOX = { x: OX, y: OY, w: CW / U, h: GH / U };
const X = (u: number) => (u - OX) * U, Y = (v: number) => (v - OY) * U, Ln = (n: number) => n * U;
const P = (pts: number[]) => pts.map((p, i) => (i % 2 ? Y(p) : X(p)));
const uball = (b: Buf, u: number, v: number, ru: number, rv: number, ramp: number[], o?: BallO) => ball(b, X(u), Y(v), Ln(ru), Ln(rv), ramp, o);
const upath = (b: Buf, pts: number[], col: number, w = 1, mat?: number, onMat?: number) => path(b, P(pts), col, w, mat, onMat);
const upoly = (b: Buf, pts: number[], ramp: number[], mat?: number, o?: { line?: boolean; tilt?: number; only?: (x: number, y: number) => boolean }) => poly(b, P(pts), ramp, mat, o);
const utint = (b: Buf, u: number, v: number, ru: number, rv: number, col: number, k: number, onMat?: number, soft = 0.5) => tint(b, X(u), Y(v), Ln(ru), Ln(rv), col, k, onMat, soft);
/** Back to head units, from a buffer pixel. */
const uOf = (x: number) => x / U + OX, vOf = (y: number) => y / U + OY;

// ---------------------------------------------------------------------------------------------------------------
// Colors

const INKH = '#1A1028';
const mixH = (a: string, b: string, k: number) => {
  const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
};
/** A long ramp (light .. deep, then the line) off one color. */
const rampOf = (c: string, lift = 0.5) => R(mixH(c, '#FFFFFF', lift), mixH(c, '#FFFFFF', lift * 0.6), mixH(c, '#FFFFFF', lift * 0.25), c, mixH(c, INKH, 0.25), mixH(c, INKH, 0.48), mixH(c, '#000000', 0.72));
const skinRamp = (L: SuitorLook) => { const [sl, sb, sd] = L.skin; return R(mixH(sl, '#FFFFFF', 0.35), sl, mixH(sl, sb, 0.5), sb, mixH(sb, sd, 0.5), sd, mixH(sd, INKH, 0.4), mixH(sd, '#000000', 0.72)); };
const lipRamp = (L: SuitorLook) => rampOf(mixH(L.skin[1], '#C0505A', 0.45), 0.4);
const STEEL = R('#FFFFFF', '#E2E6EC', '#C4C8CE', '#A2A6AE', '#7A7E86', '#52565E', '#2A2C32');
const CREAM = R('#FFFFF4', '#F6F0DC', '#E8DEC0', '#CCBE9C', '#A89878', '#7A6A50', '#3E3426');
const BLEACH = R('#FFFFF0', '#FFF8C8', '#F6E8A0', '#E0CC80', '#B8A060', '#6A5A30');
const BRUISE = R('#C8A0C8', '#A47AAE', '#7E5490', '#5E3A74', '#422456', '#28103A', '#120418');
const VENEER = R('#FFFFFF', '#FAFCFF', '#EEF2FA', '#D6DEEC', '#A8B4CA', '#5A6478');
const TOOTHY = R('#FFFDEC', '#F4EAC0', '#E0CE94', '#C4AC6C', '#9A8048', '#4E3E1E');
const IRISES = [
  R('#B8DCF8', '#7CAEE0', '#4A7AB0', '#2E5486', '#18325A', '#081428'),
  R('#C8F0B0', '#8CCC70', '#5A9A44', '#3A6E2C', '#20441A', '#0A1E08'),
  R('#E0C890', '#B89A58', '#8A6E34', '#5E4A1E', '#3A2C10', '#181004'),
  R('#D8A878', '#A87444', '#7A4C26', '#563216', '#321C0A', '#140A04'),
];
const DROOL = hexU('#E6F2FF'), DROOL_D = hexU('#9AB4D0');
const B = (i: number) => BLOOD[i];
const bare = (L: SuitorLook) => L.name.replace(/^(SIR|WIZARD) /, '');
const hashL = (s: string) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

/** A run of blood down along `pts` (head units), `w` px wide at its head and tapering, a drop hanging off its foot. */
const run = (b: Buf, pts: number[], w: number) => {
  const q = P(pts);
  let len = 0;
  for (let i = 2; i < q.length; i += 2) len += Math.hypot(q[i] - q[i - 2], q[i + 1] - q[i - 1]);
  let done = 0, lx = q[0], ly = q[1];
  for (let i = 2; i < q.length; i += 2) {
    const x0 = q[i - 2], y0 = q[i - 1], x1 = q[i], y1 = q[i + 1], d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d));
    for (let j = 0; j <= n; j++) {
      const x = x0 + ((x1 - x0) * j) / n, y = y0 + ((y1 - y0) * j) / n, t = (done + (d * j) / n) / Math.max(1, len);
      const ww = Math.max(1, Math.round(w * (1 - 0.45 * t)));
      for (let k = 0; k < ww; k++) plot(b, x - ww / 2 + k, y, ww === 1 ? B(3) : k === 0 ? B(1) : k === ww - 1 ? B(5) : k === 1 ? B(2) : B(3), M_OTHER);
      lx = x; ly = y;
    }
    done += d;
  }
  const r = Math.max(1, w * 0.45);
  ball(b, lx, ly + r * 0.9, r, r * 1.3, [B(1), B(2), B(3), B(4), B(5)], { mat: M_OTHER, line: (_dx, dy) => dy > 0.2, lw: 0.8 });
  plot(b, lx - r * 0.3, ly + r * 0.5, B(0));
};
/** A splat of blood: a flat blob, flecks round it, a wet glint. */
const clot = (b: Buf, u: number, v: number, r: number) => {
  uball(b, u, v, r, r * 0.72, [B(1), B(2), B(3), B(4), B(5)], { mat: M_OTHER, line: (_dx, dy) => dy > 0.35, lw: 0.8, flat: 0.4 });
  for (let k = 0; k < 5; k++) { const a = rnd() * Math.PI * 2, d = r * (1.25 + rnd() * 0.9); plot(b, X(u + Math.cos(a) * d), Y(v + Math.sin(a) * d * 0.75), B(3)); }
  plot(b, X(u - r * 0.4), Y(v - r * 0.3), B(0));
};
/** Strands over a hair mass (only on it): long dark and light hairs along `ang`. */
const strands = (b: Buf, x0: number, y0: number, x1: number, y1: number, n: number, len: number, ang: number, HR: number[], wob = 0.5) => {
  const at = (): [number, number] | null => { const x = X(x0 + rnd() * (x1 - x0)), y = Y(y0 + rnd() * (y1 - y0)); return matAt(b, x, y) === M_HAIR ? [x, y] : null; };
  hairs(b, n, at, Ln(len), ang, HR[5], M_HAIR, wob);
  hairs(b, Math.round(n * 0.7), at, Ln(len * 0.8), ang, HR[1], M_HAIR, wob);
  hairs(b, Math.round(n * 0.3), at, Ln(len * 0.5), ang, HR[0], M_HAIR, wob);
};
/** A hair mass: a shape in his hair's ramp, shaded round (banded), its strands. */
const hairMass = (b: Buf, pts: number[], HR: number[], ang: number, len = 4, n = 60) => {
  upoly(b, pts, HR, M_HAIR, { tilt: 0.5 });
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < pts.length; i += 2) { x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]); y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]); }
  strands(b, x0, y0, x1, y1, n, len, ang, HR);
};

// ---------------------------------------------------------------------------------------------------------------
// The painting

interface Eye { cx: number; cy: number; rx: number; ry: number }
const NEAR: Eye = { cx: 8.6, cy: -3.2, rx: 3.3, ry: 2.6 }, FAR: Eye = { cx: 2.4, cy: -3.4, rx: 2.5, ry: 2.4 };

function* paintSuitor(L: SuitorLook, face: GrossFace, dmg: number, purp: number): Generator<void, Buf> {
  setSeed(hashL(`${L.name}|${face}|${dmg}|${purp}`) | 1);
  const b = newBuf();
  const SK = skinRamp(L), HR = rampOf(L.hair, L.hair === '#140A06' || L.hair === '#2A1A0E' ? 0.32 : 0.5), MR = rampOf(L.main, 0.45), TR = rampOf(L.trim, 0.4), LIP = lipRamp(L);
  const fh = facialOf(L), hs = hairOf(L), who = bare(L), kit = L.kit;
  const oiled = kit === 'cape';
  const strain = face === 'grit' || face === 'pain' || face === 'scream' || face === 'choke';
  const S = (i: number) => SK[i];

  // NECK (its bottom dithered off into the picture's torso at the end), its cords, the Adam's apple
  uball(b, 0.5, 9.5, 9.5, 7.5, SK, { mat: M_SKIN });
  // EAR, its rim and bowl, the hole
  uball(b, -11, 1, 3.6, 5, SK, { mat: M_SKIN, lit: 0.9 });
  // SKULL, JAW, CHIN (lumps of one skin: inked round only where they meet nothing)
  uball(b, 0, -3, 13, 12.5, SK, { mat: M_SKIN });
  uball(b, 2.5, 6, 11, 8.5, SK, { mat: M_SKIN, lit: 1.05 });
  uball(b, -4.6, 6.4, 5, 4.8, SK, { mat: M_SKIN, lit: 0.95, flat: 0.55 });
  uball(b, 8.5, 11, 6, 4.8, SK, { mat: M_SKIN, lit: 1.1 });
  uball(b, 7, 1.5, 6, 5, SK, { mat: M_SKIN, lit: 1.15, flat: 0.6 });
  // (choking: the cheeks blown out round what's stuffed in)
  if (face === 'choke') uball(b, 7, 6, 6.6, 5.4, SK, { mat: M_SKIN, lit: 1.2 });
  // NOSE: a fleshy wedge off the face, a bulb on the end; broken (3+): bent off to the side, swollen
  const broke = dmg >= 3;
  uball(b, 14.2, 0.5, 3.4, 5.2, SK, { mat: M_SKIN, lit: 1.1 });
  uball(b, broke ? 16.4 : 15.3, broke ? 3.8 : 3.2, broke ? 3.9 : 3.3, broke ? 3.1 : 2.7, SK, { mat: M_SKIN, lit: 1.15 });
  inkEdges(b, M_SKIN, S(7));
  // (the ear's bowl and hole; the nostril; the folds: the nose's into the cheek, the jaw's shadow on the neck)
  uball(b, -10.6, 1.4, 1.9, 3.2, SK.slice(2), { mat: M_SKIN, line: true, lw: 0.8 });
  uball(b, -10.2, 2.2, 0.8, 1.2, [S(6), S(7), S(7)], { mat: M_SKIN });
  uball(b, broke ? 16 : 14.9, broke ? 5.2 : 4.6, 1.6, 0.9, [S(6), S(7), S(7)], { mat: M_SKIN });
  upath(b, [12.4, 3.6, 13, 6, 12.6, 8.6, 12, 10.4], S(6), 1, undefined, M_SKIN);
  upath(b, [12.8, 3.8, 13.4, 6.2], S(2), 1, undefined, M_SKIN);
  utint(b, 1, 13.6, 10, 2.6, hexU(INKH), 0.38, M_SKIN);
  upath(b, [-2, 12, 1, 15, 4, 17], S(5), 1, undefined, M_SKIN);
  uball(b, 8.6, 13.4, 1.6, 2, SK, { mat: M_SKIN, only: (x, y) => vOf(y) > 13.2 });
  if (who !== 'CHAD' && who !== 'BRODY' && face !== 'choke') upath(b, [10.6, 13.2, 10.8, 15.2], S(5), 1, undefined, M_SKIN);
  yield;
  // (purple: choking, deeper every fistful)
  if (purp > 0) for (let i = 0; i < GW * GH; i++) if (b.mat[i] === M_SKIN) b.px[i] = mixU(b.px[i], hexU('#6E2898'), purp * 0.11);
  // (the cheeks flushed, redder as he's beaten)
  utint(b, 7.5, 3.5, 4.5, 3, hexU('#E05050'), 0.18 + (strain ? 0.08 : 0), M_SKIN);
  utint(b, 15.4, 3.2, 3, 2.4, hexU('#D84A5A'), 0.22, M_SKIN);
  // PORES (thick on the nose and the cheeks), blackheads on the nose, the grease (Braxton's oil, gleaming)
  skinPost(b, S(6), (x, y) => {
    const u = uOf(x), v = vOf(y), dn = Math.hypot(u - 15, v - 2), dc = Math.hypot(u - 7, v - 3);
    return 0.05 + Math.max(0, 0.22 - dn * 0.04) + Math.max(0, 0.1 - dc * 0.018);
  }, { blackheads: (x, y) => Math.hypot(uOf(x) - 15, vOf(y) - 2) < 3.5, shine: oiled ? 0.16 : 0.1, shineCol: oiled ? WHITE : SK[0] });
  // STUBBLE (the smooth-shaven still get a shadow)
  const stub = kit === 'cape' || kit === 'prince' ? 0.16 : 0.5;
  stubble(b, (x, y) => {
    const u = uOf(x), v = vOf(y);
    if (u < -8 || v > 16.5) return 0;
    const jaw = Math.max(0, Math.min(1, (v - 3) / 3)), lip = v > 3.6 && v < 5.6 && u > 4 && u < 14.5 ? 1 : 0;
    return Math.max(jaw * (u > 11 && v < 9 ? 0.3 : 1), lip);
  }, hexU(mixH(L.skin[2], L.hair === '#E8D090' ? '#A08850' : L.hair, 0.55)), stub);
  yield;
  // (the forehead's creases: shocked up, knotted in a strain; the crow's feet)
  if (face === 'scream' || face === 'shock' || face === 'choke' || face === 'dazed') for (let k = 0; k < 3; k++) { const v = -12.6 + k * 1.5; upath(b, [-3, v + 0.4, 2, v - 0.3, 7, v, 11, v + 0.6], S(6), 1, undefined, M_SKIN); upath(b, [-2.5, v + 1.2, 2, v + 0.5, 7, v + 0.8, 10.5, v + 1.4], S(1), 1, undefined, M_SKIN); }
  if (face === 'grit' || face === 'pain' || face === 'sneer') { upath(b, [5.2, -10.5, 5.6, -7], S(6), 1, undefined, M_SKIN); upath(b, [6.4, -10.8, 6.6, -7.4], S(6), 1, undefined, M_SKIN); upath(b, [5.8, -10.6, 6, -7.2], S(1), 1, undefined, M_SKIN); }
  for (let k = 0; k < 3; k++) upath(b, [12.2, -3.5 + k * 1.2, 13.6, -4.2 + k * 1.8], S(5), 1, undefined, M_SKIN);
  // (the bags under his eyes)
  for (const e of [NEAR, FAR]) { utint(b, e.cx, e.cy + e.ry + 1, e.rx * 1.1, 1.3, hexU('#6A3A5A'), 0.26, M_SKIN); upath(b, [e.cx - e.rx * 0.8, e.cy + e.ry + 1.4, e.cx, e.cy + e.ry + 2.1, e.cx + e.rx * 0.9, e.cy + e.ry + 1.3], S(5), 1, undefined, M_SKIN); }

  // FACIAL HAIR UNDER THE MOUTH (the beards, the goatee: the mouth's painted into them)
  if (kit === 'viking' && fh === 'braid') {
    hairMass(b, [-8, 3, -4, 9, 3, 12, 14, 11, 15.6, 13.6, 13, 22, 10.5, 36, 6.5, 30, 4, 22, -3, 16, -8.5, 10], HR, Math.PI / 2 + 0.15, 5, 140);
    // (braided: the crossings ticked in down the middle, the bands)
    for (let v = 16; v < 34; v += 2.2) { upath(b, [7.5, v, 10, v + 1.4], HR[5], 1, undefined, M_HAIR); upath(b, [10.4, v + 1.1, 12, v], HR[1], 1, undefined, M_HAIR); }
    for (const v of [20, 28]) upoly(b, [7, v, 12.4, v - 0.4, 12, v + 1.8, 7.2, v + 2], TR, M_METAL);
  } else if (kit === 'viking') {
    hairMass(b, [-8, 3, -4, 9, 3, 12, 14, 11, 15.6, 13.4, 13, 19, 8, 23.5, 2, 20, -5, 13], HR, Math.PI / 2 + 0.2, 4, 110);
  } else if (fh === 'long' || fh === 'forked') {
    hairMass(b, fh === 'forked' ? [-6, 3, -2, 9, 3, 11, 14, 10, 15.6, 12.6, 12, 22, 9.6, 38, 6.6, 28, 3.6, 38, 1, 24, -3, 15] : [-6, 3, -2, 9, 3, 11, 14, 10, 15.6, 12.6, 12, 22, 7, 42, 3, 26, -3, 15], HR, Math.PI / 2 + 0.1, 6, 160);
  } else if (fh === 'goatee') {
    hairMass(b, [5.6, 10.6, 12.4, 10.4, 12, 15.6, 8.6, 17.4, 5.8, 14.6], HR, Math.PI / 2, 2.2, 40);
  }
  yield;

  // THE MOUTH
  const gaps = [[], [], [2], [1, 3], [1, 2, 3], [0, 1, 3, 4]][Math.min(5, dmg)];
  const gapsB = dmg >= 5 ? [1, 2] : dmg >= 4 ? [1] : [];
  const tRamp = who === 'BRAXTON' ? VENEER : TOOTHY;
  const tOpts = { gaps, tw: 5, ramp: tRamp, rot: who === 'GUNNAR' ? [3] : who === 'CHET' ? [4] : [], gold: who === 'WAYNE' ? [3] : [] };
  const hole = (pts: number[]) => upoly(b, pts, MOUTH, M_MOUTH, { tilt: 0.2 });
  /** The rows of teeth in a hole: the top row's gum line `top` (head units, at x) down, the bottom's `bot` up. */
  const rows = (x0: number, x1: number, top: ((u: number) => number) | null, bot: ((u: number) => number) | null, th: number, bh: number, long?: number[]) => {
    // (the gums showing over the top row)
    if (top) for (let x = Math.floor(X(x0)); x <= X(x1); x++) for (let k = 0; k < 2; k++) { const y = Math.round(Y(top(uOf(x)))) + k; if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[k + 2]); }
    if (top) teeth(b, Math.round(X(x0)), Math.round(X(x1)), x => Y(top(uOf(x))) + 2, 1, Ln(th), { ...tOpts, long });
    if (bot) teeth(b, Math.round(X(x0)) + 2, Math.round(X(x1)), x => Y(bot(uOf(x))), -1, Ln(bh), { ...tOpts, gaps: gapsB, gold: [] });
  };
  const lipTop = (pts: number[]) => { upath(b, pts, LIP[4], 3, M_LIP); upath(b, pts.map((p, i) => (i % 2 ? p - 0.45 : p)), LIP[1], 1, M_LIP); };
  const lipBot = (u: number, v: number, ru: number, rv: number) => {
    uball(b, u, v, ru, rv, LIP, { mat: M_LIP, line: (_dx, dy) => dy > 0, lw: 0.8 });
    // (cracked: dry splits across it, a wet glint)
    for (let k = 0; k < 4; k++) { const x = u - ru * 0.6 + k * ru * 0.4; upath(b, [x, v - rv * 0.5, x + 0.3, v + rv * 0.3], LIP[5], 1, undefined, M_LIP); }
    plot(b, X(u - ru * 0.3), Y(v - rv * 0.3), WHITE); plot(b, X(u - ru * 0.3) + 1, Y(v - rv * 0.3), LIP[0]);
  };
  const spit = (x: number, v0: number, v1: number) => { upath(b, [x, v0, x + 0.3, (v0 + v1) / 2 + 0.6, x, v1], DROOL, 1); plot(b, X(x), Y((v0 + v1) / 2 + 0.6), WHITE); };
  const ellE = (cx: number, cy: number, rx: number, ry: number, top: boolean) => (u: number) => { const d = Math.max(0, 1 - ((u - cx) / rx) ** 2); return cy + (top ? -1 : 1) * ry * Math.sqrt(d); };
  if (face === 'grit' || face === 'pain') {
    // (clenched: the lips peeled back off both rows, the gums, spit strung across the corner)
    const dn = face === 'pain' ? 0.8 : 0;
    hole([2.6, 6 + dn, 8.5, 5.4 + dn, 13.6, 5.8 + dn, 14.4, 8 + dn, 13.6, 10 + dn * 1.5, 8.5, 10.4 + dn, 3, 9.8 + dn * 1.6, 2, 8 + dn]);
    rows(2.8, 14, u => 5.6 + dn + Math.abs(u - 8.5) * 0.03, u => 10.1 + dn + (u < 5 || u > 12 ? 0.6 * dn : 0), 2.2, 2.0);
    lipTop([2.2, 6.4 + dn, 5, 5.4 + dn, 8.5, 4.9 + dn, 12, 5.2 + dn, 14.6, 6.4 + dn]);
    lipBot(8.4, 11.2 + dn, 5.4, 1.5);
    spit(3.6, 6.6 + dn, 9.6 + dn); spit(13.2, 6.4 + dn, 9.6 + dn);
    upath(b, [1.4, 6.5 + dn, 0.6, 9.5 + dn * 2], S(6), 1, undefined, M_SKIN); upath(b, [15, 6.4 + dn, 15.6, 9.4 + dn * 2], S(6), 1, undefined, M_SKIN);
  } else if (face === 'sneer') {
    // (the lip curled up off a long canine on the near side, the rest shut)
    hole([6.6, 6.8, 10, 5.6, 13.8, 4.6, 14.4, 7.2, 10, 8.3, 6.6, 8]);
    rows(6.6, 14.2, u => 5.6 - (u - 6.6) * 0.12, null, 2.0, 0, [1]);
    upath(b, [2.4, 7.7, 4.5, 7.9, 6.6, 7.7], MOUTH[3], 2);
    lipTop([2.2, 7, 5, 6.6, 8, 5.8, 11, 4.6, 14.4, 3.6]);
    uball(b, 11.6, 4.2, 3.2, 1.3, LIP, { mat: M_LIP, line: (_dx, dy) => dy < 0, lw: 0.8 });
    lipBot(7.6, 9.4, 4.8, 1.5);
    upath(b, [14.2, 2.6, 15, 4.8], S(6), 1, undefined, M_SKIN);
  } else if (face === 'smug') {
    // (the smirk: shut, the near corner hitched up into the cheek, a dimple; the pout)
    uball(b, 8.4, 6.8, 5.2, 1.3, LIP, { mat: M_LIP });
    lipBot(8, 9, 4.6, 1.6);
    upath(b, [2.6, 7.9, 6, 8.1, 9, 7.9, 12, 7.2, 13.8, 6], MOUTH[2], 2);
    upath(b, [14.2, 5.2, 15, 7.4], S(6), 1, undefined, M_SKIN); upath(b, [14.6, 5.2, 15.3, 7.2], S(1), 1, undefined, M_SKIN);
  } else if (face === 'scream') {
    // (wide open: the throat dark, the tongue, both rows, spit strung top to bottom)
    uball(b, 9, 9.2, 6, 5.4, MOUTH, { mat: M_MOUTH, line: true, lw: 1.2 });
    uball(b, 8.6, 8.4, 2.8, 2.2, [MOUTH[4], MOUTH[5], MOUTH[5]], { mat: M_MOUTH });
    uball(b, 9.4, 12.6, 4.4, 2.2, TONGUE, { mat: M_OTHER, only: (x, y) => matAt(b, x, y) === M_MOUTH || matAt(b, x, y) === M_OTHER, line: (_dx, dy) => dy < 0, lw: 0.8 });
    upath(b, [9.4, 11.2, 9.6, 13.6], TONGUE[4], 1, undefined, M_OTHER);
    rows(3.4, 14.6, ellE(9, 9.2, 6, 5.4, true), ellE(9, 9.2, 6, 5.4, false), 1.9, 1.6);
    spit(5.4, 5.8, 12.4); spit(12.4, 5.6, 12.2); spit(8, 4.6, 8.6);
    lipTop([3.2, 6.4, 6, 4.2, 9, 3.6, 12, 4.2, 14.8, 6.4]);
    lipBot(9, 14.8, 5.2, 1.4);
  } else if (face === 'shock') {
    uball(b, 9, 8.8, 2.5, 3.1, MOUTH, { mat: M_MOUTH, line: true, lw: 1 });
    uball(b, 9, 8.8, 3.4, 4, LIP, { mat: M_LIP, only: (x, y) => matAt(b, x, y) !== M_MOUTH, line: true, lw: 0.8 });
    uball(b, 9, 8.8, 2.5, 3.1, MOUTH, { mat: M_MOUTH });
    rows(7, 11, null, ellE(9, 8.8, 2.5, 3.1, false), 0, 1.2);
  } else if (face === 'dazed' || face === 'dead') {
    // (slack: hung open, the tongue lolled out of the corner and down the chin, drool off it)
    uball(b, 8.4, 9, 4.6, 2.8, MOUTH, { mat: M_MOUTH, line: true, lw: 1 });
    rows(4, 12.8, ellE(8.4, 9, 4.6, 2.8, true), null, 1.5, 0);
    lipTop([3.4, 7.2, 6, 6, 9, 5.8, 12, 6.4, 13.4, 7.8]);
    lipBot(8, 12.2, 4.4, 1.4);
    const tl = face === 'dead' ? 1.35 : 1;
    uball(b, 12.6, 11.6 + tl * 1.2, 2.5 * tl, 3.5 * tl, TONGUE, { mat: M_OTHER, line: true, lw: 1 });
    upath(b, [12.4, 10, 12.6, 11.6 + tl * 3], TONGUE[4], 1, undefined, M_OTHER);
    const dv = 11.6 + tl * 4.6;
    upath(b, [12.8, dv, 13, dv + 3, 12.8, dv + 6], DROOL, 2); upath(b, [13.4, dv, 13.6, dv + 5.5], DROOL_D, 1); plot(b, X(12.8), Y(dv + 2), WHITE);
    uball(b, 12.9, dv + 6.8, 1, 1.3, [DROOL, DROOL, DROOL_D, DROOL_D, DROOL_D], { line: true, lw: 0.6 });
  } else if (face === 'choke') {
    // (the lips stretched round the hole his own roses are going down; spit at the corners)
    uball(b, 11, 7.6, 3.6, 3.2, LIP, { mat: M_LIP, line: true, lw: 1 });
    uball(b, 11.2, 7.6, 2.3, 2, MOUTH, { mat: M_MOUTH, line: true, lw: 0.8 });
    spit(8, 7.4, 10);
  }
  // (a split lip and blood in the mouth: the beating)
  if (dmg >= 2 && face !== 'choke') { upath(b, [7, 10.4, 7.6, 12], B(3), 2); plot(b, X(7.2), Y(10.6), B(0)); }
  if (dmg >= 3) for (let i = 0; i < GW * GH; i++) if ((b.mat[i] === M_MOUTH || b.mat[i] === M_OTHER) && hash2(i % GW, (i / GW) | 0) < 0.35 + dmg * 0.06) b.px[i] = mixU(b.px[i], B(2), 0.55);
  yield;

  // MUSTACHES (over the mouth)
  if (kit === 'viking') { hairMass(b, [2.6, 4.2, 9, 3.4, 15.2, 4.4, 15.6, 6.8, 14, 11, 12.6, 6.8, 9, 5.8, 5, 6.8, 3.6, 10.4, 2.2, 6.4], HR, Math.PI * 0.62, 3, 50); }
  else if (fh === 'long' || fh === 'forked') { hairMass(b, [2.6, 4.2, 9, 3.4, 15.2, 4.4, 15.4, 6.8, 14.6, 14, 12.6, 6.8, 9, 5.6, 5, 6.8, 3.2, 13, 2.2, 6.4], HR, Math.PI * 0.55, 4, 60); }
  else if (fh === 'stache') { hairMass(b, [2.8, 4.4, 9, 3.6, 15, 4.4, 15.6, 6.6, 14.6, 9.6, 13, 6.4, 9, 5.8, 4.6, 6.6, 3, 9.4, 2, 6.2], HR, Math.PI * 0.6, 2.6, 50); }
  else if (fh === 'goatee') { hairMass(b, [4, 4.6, 9, 4, 14, 4.6, 13.8, 5.8, 9, 5.4, 4.4, 5.8], HR, Math.PI * 0.85, 1.6, 20); }
  yield;

  // EYES
  const sclera = dmg >= 1 || strain ? SCLERA_R : face === 'dead' ? SCLERA_Y : SCLERA;
  const iris = IRISES[['#6E4428', '#4A2A16', '#C47A48'].includes(L.skin[1]) ? 3 : hashL(L.name) % 4];
  /** How far open (1 all the way, 0.5 the lid at the middle), where he's looking, how big the pupil. */
  const open = { grit: 0.55, pain: 0, sneer: 0.45, smug: 0.4, scream: 1.15, shock: 1.2, dazed: 0.7, dead: 0.5, choke: 1.25 }[face];
  const nearShut = dmg >= 5, farShut = dmg >= 3;
  for (const [e, near] of [[FAR, false], [NEAR, true]] as [Eye, boolean][]) {
    const shutUp = near ? nearShut : farShut;
    if (open === 0 || shutUp) {
      // (squeezed shut (pain), or swollen shut: a slit in a fold of lid, crow's feet; the swollen one a purple egg)
      if (shutUp) { uball(b, e.cx, e.cy, e.rx * 1.25, e.ry * 1.35, BRUISE, { mat: M_SKIN, soft: 0.25 }); utint(b, e.cx - 0.6, e.cy - 0.8, e.rx * 0.6, e.ry * 0.5, WHITE, 0.25, M_SKIN); }
      upath(b, [e.cx - e.rx, e.cy + 0.4, e.cx - e.rx * 0.3, e.cy + 0.9, e.cx + e.rx * 0.4, e.cy + 0.8, e.cx + e.rx, e.cy - 0.2], shutUp ? BRUISE[6] : S(7), 2);
      if (!shutUp) { upath(b, [e.cx - e.rx * 0.9, e.cy - 0.8, e.cx, e.cy - 1.2, e.cx + e.rx * 0.9, e.cy - 1], S(5), 1); for (let k = 0; k < 3; k++) upath(b, [e.cx + e.rx + 0.4, e.cy - 0.6 + k * 0.9, e.cx + e.rx + 2, e.cy - 1.6 + k * 1.6], S(6), 1); bead(b, X(e.cx + e.rx * 0.7), Y(e.cy + 2.2), 1.4, SK); }
      continue;
    }
    let o = open;
    if (near && dmg >= 2) o = Math.min(o, 0.42);
    const k = face === 'choke' ? 1.15 : face === 'shock' || face === 'scream' ? 1.06 : 1;
    const rx = Ln(e.rx * k), ry = Ln(e.ry * k), cx = X(e.cx), cy = Y(e.cy);
    const look = face === 'dazed' ? (near ? [-0.35, -0.4] : [0.35, 0.45]) : face === 'dead' ? [0.1, -1.05] : face === 'smug' || face === 'sneer' ? [0.3, 0.15] : [0.32, 0];
    const ir = Math.min(rx, ry) * (face === 'shock' ? 0.48 : 0.6);
    const pr = face === 'scream' || face === 'shock' || face === 'choke' ? ir * 0.22 : face === 'dazed' ? ir * 0.68 : ir * 0.42;
    const topY = cy - ry + (1 - Math.min(1, o)) * 2 * ry * 0.82;
    const slope = face === 'sneer' || face === 'smug' ? 0.12 : face === 'grit' ? -0.18 : 0;
    eyeball(b, cx, cy, {
      rx, ry, sclera, iris, ir, pr, idx: look[0] * rx, idy: look[1] * ry, veins: 6 + dmg * 2 + (strain ? 5 : 0),
      top: o < 1 ? (x => topY + (x - cx) * slope) : undefined, bot: near && dmg >= 2 ? (() => cy + ry * 0.55) : undefined, lid: SK,
    });
    // (the lid's crease over it, its lashes)
    upath(b, [e.cx - e.rx, e.cy - e.ry * 0.3, e.cx, e.cy - e.ry * (o >= 1 ? 1.5 : 1.1), e.cx + e.rx, e.cy - e.ry * 0.4], S(6), 1, undefined, M_SKIN);
    if (o < 1) for (let x = cx - rx + 2; x < cx + rx - 1; x += 3) plot(b, x, topY + (x - cx) * slope, HR[6]);
  }
  // (a black eye round the near one (2+), yellowing at its rim)
  if (dmg >= 2) { utint(b, NEAR.cx, NEAR.cy + 0.4, NEAR.rx * 1.7, NEAR.ry * 2, hexU('#4A1A50'), 0.5, M_SKIN, 0.4); utint(b, NEAR.cx + 0.4, NEAR.cy + 1, NEAR.rx * 2.1, NEAR.ry * 2.5, hexU('#9AA040'), 0.16, M_SKIN, 0.6); uball(b, NEAR.cx, NEAR.cy - NEAR.ry * 0.9, NEAR.rx * 1.05, 1.4, BRUISE.slice(1), { mat: M_SKIN, only: (x, y) => matAt(b, x, y) === M_SKIN, flat: 0.5 }); }
  yield;

  // BROWS: thick bars of his hair, strand by strand
  const brows: Record<GrossFace, [number[], number[]]> = {
    grit: [[5, -6.4, 8.5, -7.6, 12, -8.6], [-0.5, -8.4, 2.5, -7.4, 4.6, -6.2]], pain: [[5, -6.6, 8.5, -7.4, 12, -8], [-0.5, -8, 2.5, -7.2, 4.6, -6.4]],
    scream: [[5, -9.6, 8.5, -10.8, 12, -10], [-0.5, -9.8, 2.5, -10.6, 4.5, -9.6]], shock: [[5, -9.6, 8.5, -10.9, 12, -10.2], [-0.5, -9.8, 2.5, -10.6, 4.5, -9.6]],
    choke: [[5, -9.8, 8.5, -11, 12, -10.2], [-0.5, -10, 2.5, -10.8, 4.5, -9.8]],
    sneer: [[5, -8.4, 8.5, -10.4, 12, -9.6], [-0.5, -7.6, 2.5, -7.2, 4.5, -6.8]], smug: [[5, -8.2, 8.5, -10, 12, -9.4], [-0.5, -7.6, 2.5, -7.4, 4.5, -7]],
    dazed: [[5, -9, 8.5, -9.4, 12, -8.4], [-0.5, -7.4, 2.5, -8, 4.5, -7.8]], dead: [[5, -7.6, 8.5, -8, 12, -7.4], [-0.5, -8, 2.5, -8, 4.5, -7.4]],
  };
  const BR = L.hair === '#E8D090' ? rampOf('#B89A58', 0.4) : HR;
  for (const pts of brows[face]) {
    upath(b, pts, BR[5], 4, M_HAIR); upath(b, pts.map((p, i) => (i % 2 ? p - 0.3 : p)), BR[3], 2, M_HAIR); upath(b, pts.map((p, i) => (i % 2 ? p - 0.7 : p)), BR[1], 1, M_HAIR);
    for (let k = 0; k < 10; k++) { const t = rnd(), i = t < 0.5 ? 0 : 2, a = t < 0.5 ? t * 2 : (t - 0.5) * 2, x = pts[i] + (pts[i + 2] - pts[i]) * a, y = pts[i + 1] + (pts[i + 3] - pts[i + 1]) * a; upath(b, [x, y, x + 0.8, y - 0.7 - rnd()], BR[rnd() < 0.5 ? 5 : 0], 1); }
  }
  yield;

  // THE BEATING
  if (dmg >= 1) {
    utint(b, 4, 2, 5, 4, hexU('#D04848'), 0.32, M_SKIN);
    run(b, [broke ? 15.8 : 14.9, broke ? 5.8 : 5.2, broke ? 15.4 : 14.6, 7, 14.2, 8.6 + (dmg >= 3 ? 3 : 0)], 3 + Math.min(2, dmg));
  }
  if (dmg >= 3) {
    // (the nose: purple, the bridge kinked; a goose egg on the forehead; blood off the far eye's split)
    utint(b, 15.6, 2.6, 3.6, 3.6, hexU('#5A2060'), 0.4, M_SKIN);
    upath(b, [13.2, -2.8, 14.4, -0.6, 13.8, 1.2], S(6), 1);
    uball(b, 2, -10, 4.2, 3.2, SK, { mat: M_SKIN, line: (_dx, dy) => dy < 0.3, lw: 0.8, lit: 1.2 });
    utint(b, 2.4, -9.6, 3.4, 2.6, hexU('#7A2A5A'), 0.35, M_SKIN);
    utint(b, -5, 7, 4, 3.5, hexU('#4A1A50'), 0.3, M_SKIN);
  }
  if (dmg >= 4) {
    // (the brow split open, running down past the eye; blood down off the chin)
    upath(b, [8.6, -9, 10.4, -7.6, 12.2, -7.2], B(5), 2); upath(b, [8.8, -9.2, 10.6, -7.9], B(1), 1);
    run(b, [11.4, -6.8, 12.4, -4, 12.8, -1, 12.2, 2.4], 3);
    run(b, [9, 11.6, 9.4, 14.6, 9, 17.6], 3);
    clot(b, 4, -1, 1.4);
  }
  if (dmg >= 5) {
    uball(b, -2, 4, 3.6, 3, BRUISE, { mat: M_SKIN, soft: 0.3 });
    run(b, [3, -9, 2.6, -5, 1.6, -1], 3); run(b, [13.2, 11, 13.6, 14, 13.2, 17], 2);
    clot(b, 13.6, -9, 1.6); clot(b, -6, -6, 1.2);
  }
  // SWEAT: beads on the forehead and the temple, the lip; more as he strains and as he's beaten
  const beads: [number, number][] = [[-3, -8.5], [4, -11], [10.8, -6.4], [-7.4, -2.4], [13.4, 1], [-1, -13], [6.5, -13.4], [11.6, 4.2]];
  const nb = Math.min(beads.length, 2 + (strain ? 3 : 0) + Math.min(3, dmg));
  for (let k = 0; k < nb; k++) bead(b, X(beads[k][0]), Y(beads[k][1]), Ln(0.55 + (k % 3) * 0.15), SK);
  // VEINS: up the temple and the forehead, down the neck, straining
  if (strain || purp > 1) {
    vein(b, P([-5.4, -10.4, -4.6, -8, -6, -5.6]), VEIN, 2);
    vein(b, P([-3.4, 11.4, -1.8, 13.4, -2.4, 15.6]), VEIN, 2);
    if (face === 'scream' || face === 'choke') vein(b, P([3, -13.4, 4.2, -10.6, 3.2, -8.2]), VEIN, 2);
  }
  yield;

  // HAIR AND HATS
  if (kit === 'tee') {
    // (what pokes out from under the backwards cap: the sideburn and his style)
    hairMass(b, [-10.4, -8.6, -7, -8.6, -7.2, -1, -9.6, 0.4], HR, Math.PI / 2, 2, 20);
    if (hs === 'mullet') hairMass(b, [-13.6, -8.4, -8.4, -8.4, -6.4, 4, -7, 14, -12, 16.6, -15.4, 9], HR, Math.PI / 2 + 0.2, 6, 90);
    if (hs === 'pony') { hairMass(b, [-14.4, -8.4, -11, -8.4, -12.6, 8, -17, 10.4, -18, 4], HR, Math.PI / 2 + 0.4, 6, 70); upoly(b, [-14.6, -7.8, -10.8, -7.8, -11, -5.8, -14.4, -5.8], TR, M_CLOTH); }
    if (hs === 'curls') for (const [u, v] of [[-11, -6.6], [-13, -2.6], [-12, 1.6], [-9.2, -8.6], [11.4, -8.4], [-14.4, -6]] as [number, number][]) { uball(b, u, v, 2.3, 2.2, HR, { mat: M_HAIR, line: true, lw: 0.8 }); upath(b, [u - 0.8, v - 0.4, u, v + 0.5, u + 0.8, v - 0.2], HR[5], 1, undefined, M_HAIR); }
    // (the cap: the dome in its panels, the seams and their stitching, the button, the brim out the back, the strap's gap
    // over his forehead)
    uball(b, 0, -13.4, 13.6, 7.8, MR, { mat: M_CLOTH, line: true, lw: 1.2, only: (_x, y) => y <= Y(-8.3) });
    upoly(b, [-25.6, -13.6, -12, -12.6, -12, -8.4, -25.6, -9.6], MR, M_CLOTH, { tilt: 0.1 });
    upath(b, [-25, -9.4, -12.6, -8.8], MR[5], 1);
    for (const [u1, v1] of [[-8, -9], [5, -9], [-13, -10.6], [12, -10.4]] as [number, number][]) { upath(b, [0, -20.6, (u1) * 0.6, -16, u1, v1], MR[5], 1, undefined, M_CLOTH); upath(b, [0.8, -20.6, u1 * 0.6 + 0.8, -16, u1 + 0.8, v1], MR[1], 1, undefined, M_CLOTH); }
    uball(b, 0, -20.8, 1.9, 1.2, MR, { mat: M_CLOTH, line: true, lw: 0.8 });
    upath(b, [-13.4, -8.8, 13.4, -8.8], TR[3], 2, M_CLOTH); upath(b, [-13.4, -9.3, 13.4, -9.3], TR[1], 1, M_CLOTH);
    utint(b, -4, -9.4, 6, 1.2, hexU('#8A6A20'), 0.35, M_CLOTH);
    upoly(b, [6, -8.4, 6.6, -11.6, 10.4, -11.6, 11, -8.4], [HR[2], HR[3], HR[4], HR[5], HR[6]], M_HAIR, { line: true });
    if (hs === 'frosted') for (const [u, v, a] of [[6, -10, -2], [8, -10.6, -1.6], [10, -10.2, -1.2], [11.6, -9.4, -0.8], [-9.4, -8, -2.6], [13.4, -8.6, -0.5]] as [number, number, number][]) {
      // (frosted tips: a gelled spike, dark at the root, bleached to the point)
      const tx = u + Math.cos(a) * 4.4, ty = v + Math.sin(a) * 4.4, nx = -Math.sin(a) * 1.1, ny = Math.cos(a) * 1.1;
      upoly(b, [u - nx, v - ny, tx, ty, u + nx, v + ny], HR, M_HAIR);
      upoly(b, [u + (tx - u) * 0.45 - nx * 0.6, v + (ty - v) * 0.45 - ny * 0.6, tx, ty, u + (tx - u) * 0.45 + nx * 0.6, v + (ty - v) * 0.45 + ny * 0.6], BLEACH, M_HAIR, { line: false });
    }
  } else if (kit === 'cape' || kit === 'prince') {
    if (hs === 'slick') {
      // (oiled straight back: comb furrows, a wet gleam along the roll)
      hairMass(b, [-12.6, -2, -12.2, -9, -6, -14.6, 3, -15.6, 11, -12.2, 12.6, -8.8, 6, -10.2, -1, -9.6, -7, -6.6, -9.6, 0.4], HR, Math.PI + 0.35, 6, 120);
      for (let k = 0; k < 6; k++) upath(b, [11 - k * 0.6, -11.6 + k * 0.5, 4 - k, -12.6 + k * 1.1, -4 - k, -10.6 + k * 1.4, -10.6, -6 + k * 1.2], k % 2 ? HR[5] : HR[1], 1, undefined, M_HAIR);
      for (let u = -8; u < 9; u += 1) if (bay(X(u) | 0, 3) < 0.6) plot(b, X(u), Y(-13.2 + Math.abs(u) * 0.12), WHITE);
    } else if (hs === 'buzz') {
      for (let y = 0; y < GH; y++) for (let x = 0; x < CW; x++) { const u = uOf(x), v = vOf(y); if (b.mat[y * GW + x] === M_SKIN && v < -8.4 + (u < -6 ? 6 : 0) && Math.hypot(u, v + 3) < 12.6 && hash2(x, y) < 0.55) b.px[y * GW + x] = mixU(b.px[y * GW + x], HR[4], 0.75); }
      upath(b, [-7, -8.4, 2, -9.2, 10.6, -8.6], HR[5], 1, undefined, M_SKIN);
    } else if (hs === 'pomp') {
      hairMass(b, [-12.6, -2, -12.2, -10, -5, -15.2, 2, -20.2, 11, -21.2, 14.2, -16.4, 12.4, -10.6, 4, -10.4, -6, -7.4, -9.6, 0.4], HR, Math.PI + 0.6, 6, 130);
      for (let k = 0; k < 4; k++) upath(b, [-6 + k * 2, -9.8 - k, 2 + k * 2, -16.6 - k * 0.8, 11, -18.6 + k * 1.4], k % 2 ? HR[1] : HR[5], 1, undefined, M_HAIR);
    } else if (hs === 'waves') {
      hairMass(b, [-12.6, 10, -14.2, -2, -11, -11.4, -3, -15.2, 6, -14.6, 12.2, -11.2, 7, -11.2, 0, -10.6, -6, -8.4, -8, 2, -9, 10], HR, Math.PI / 2 + 0.6, 6, 140);
      for (let k = 0; k < 5; k++) { const v = -9 + k * 3.6; upath(b, [-13, v + 1, -11, v - 0.8, -9, v + 1], HR[0], 1, undefined, M_HAIR); upath(b, [-13, v + 2, -11, v + 0.2, -9, v + 2], HR[5], 1, undefined, M_HAIR); }
    } else {
      // (the man bun: dragged tight back over the skull to a knot on top, a band round it, a loose strand)
      hairMass(b, [-12.6, -1, -12.2, -9, -6, -13.6, 2, -14.6, 9, -13.2, 12.2, -10.6, 5, -11.2, -2, -10.4, -8, -7.4, -10, 0.4], HR, Math.PI + 0.25, 7, 110);
      uball(b, -8.6, -17.2, 5, 4.2, HR, { mat: M_HAIR, line: true, lw: 1 });
      strands(b, -13.6, -21.4, -3.6, -13, 40, 3, -0.6, HR, 1.4);
      upoly(b, [-6.4, -16.4, -4.6, -17.2, -3.4, -14.2, -5.2, -13.4], TR, M_CLOTH);
      upath(b, [11.4, -10.4, 12.6, -6, 11.8, -2], HR[4], 1); upath(b, [11.8, -10.4, 13, -6.2], HR[1], 1);
    }
    if (kit === 'prince') uball(b, -10.8, 5.2, 1, 1, R('#FFFAD0', '#FBE27A', '#F2C444', '#D4A02A', '#7A520E'), { mat: M_METAL, line: true, lw: 0.6 });
    if (kit === 'cape') {
      // (the cardboard crown, crooked: gold paint over corrugated card (the flutes show at its cut edge), paste jewels, a
      // strip of tape holding a point on)
      const a = -0.18, ca = Math.cos(a), sa = Math.sin(a);
      const rotp = (pts: number[]) => { const o: number[] = []; for (let i = 0; i < pts.length; i += 2) { const x = pts[i], y = pts[i + 1]; o.push(x * ca - y * sa, x * sa + y * ca - 14); } return o; };
      upoly(b, rotp([-11.6, 0.6, -11.6, -11.6, -6, -5.2, -1, -14.6, 4, -5.2, 9.6, -11.6, 9.6, 0.6]), R('#FFF4B0', '#F8DA6A', '#E8BC40', '#C89A28', '#9A7418', '#6A4E10', '#3A2806'), M_METAL, { tilt: 0.6 });
      upath(b, rotp([-11, 0, 9, 0]), hexU('#C8A060'), 1); for (let u = -10.6; u < 9; u += 1.4) plot(b, ...(rotp([u, -0.6]).map((p, i) => (i ? Y(p) : X(p))) as [number, number]), hexU('#8A6A30'));
      for (const [u, v, col] of [[-6, -3.2, '#DC2626'], [-1, -5.4, '#2563EB'], [4, -3.2, '#16A34A']] as [number, number, string][]) { const [x, y] = rotp([u, v]); uball(b, x, y, 1.5, 1.3, rampOf(col, 0.5), { mat: M_OTHER, line: true, lw: 0.6 }); plot(b, X(x - 0.5), Y(y - 0.5), WHITE); }
      upoly(b, rotp([7, -9.6, 10.6, -10.2, 10.8, -6.4, 7.2, -5.8]), R('#F4F4EC', '#E4E4DA', '#CFCFC4', '#B4B4A8', '#8A8A80', '#5A5A54'), M_OTHER);
      for (let k = 0; k < 6; k++) { const [x, y] = rotp([-8 + k * 3.2, -1.6]); plot(b, X(x), Y(y), WHITE); }
    }
  } else if (kit === 'knight') {
    // (the helmet down to his brows, the cheek guard down the back of his jaw, rivets round the rim, the visor up, its
    // slits, the plume)
    uball(b, -12.4, -20.4, 8.6, 4.4, TR, { mat: M_CLOTH, line: true, lw: 1 });
    for (let k = 0; k < 9; k++) upath(b, [-19.6 + k * 1.7, -20.6 + (k % 3) - 1, -15.6 + k * 1.5, -17.4 + (k % 2)], k % 2 ? TR[5] : TR[0], 1, undefined, M_CLOTH);
    uball(b, 0, -9, 14.6, 11.6, STEEL, { mat: M_METAL, line: true, lw: 1.2, only: (x, y) => y < Y(-6.2) || x < X(-7.4) });
    upoly(b, [-14.4, -6.6, -7.4, -6.6, -7.2, 8.6, -13, 6.8], STEEL, M_METAL);
    upoly(b, [-14.8, -7.8, 13.6, -7.8, 13.8, -6, -14.8, -6], STEEL.slice(2), M_METAL);
    for (let u = -12.6; u < 13; u += 3.4) { uball(b, u, -6.9, 0.7, 0.7, STEEL, { mat: M_METAL }); plot(b, X(u - 0.3), Y(-7.2), WHITE); }
    // (the visor swung up, lying over the dome's front)
    upoly(b, [2.4, -21, 9.6, -18.6, 14.2, -13.6, 15.2, -9.6, 12.4, -9.4, 11.2, -12.6, 8, -15.4, 1.6, -17.4], STEEL, M_METAL, { tilt: -0.3 });
    for (let k = 0; k < 4; k++) { const t = 0.15 + k * 0.22, u0 = 2.4 + t * 11.8, v0 = -19.6 + t * 8.4; upath(b, [u0 - 0.6, v0 + 0.8, u0 + 0.6, v0 + 1.8], hexU('#16161C'), 2); }
    for (const [u, v] of [[-4, -16], [-9, -12], [6, -17]] as [number, number][]) { plot(b, X(u), Y(v), WHITE); plot(b, X(u) + 1, Y(v), WHITE); }
  } else if (kit === 'viking') {
    // (Sven's braids hanging off the helmet; the helmet, its band riveted, the nasal down the bridge; the horns, ringed)
    if (fh === 'beard') for (const u of [-12.6, -8.6]) { hairMass(b, [u - 1.4, -8, u + 1.4, -8, u + 1.2, 8, u - 1.2, 8], HR, Math.PI / 2, 3, 26); for (let v = -6; v < 7; v += 2) upath(b, [u - 1.2, v, u + 1.2, v + 1], HR[5], 1, undefined, M_HAIR); upoly(b, [u - 1.6, 6, u + 1.6, 6, u + 1.6, 7.6, u - 1.6, 7.6], TR, M_METAL); }
    for (const s of [-1, 1]) {
      const x0 = s > 0 ? 9 : -10;
      upoly(b, [x0, -10.4, x0 + s * 11, -16.4, x0 + s * 10, -31, x0 + s * 5, -14.4], CREAM, M_OTHER, { tilt: s * 0.4 });
      for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.17, u = x0 + s * (2 + t * 9), v = -11.4 - t * 15; upath(b, [u - s * 2.2, v + 1.4, u + s * 1.8, v - 0.6], CREAM[5], 1, undefined, M_OTHER); }
      plot(b, X(x0 + s * 9.6), Y(-28.4), WHITE);
    }
    uball(b, 0, -11.4, 13.6, 9.6, STEEL, { mat: M_METAL, line: true, lw: 1.2, only: (_x, y) => y < Y(-8.2) });
    upoly(b, [-13.8, -9.8, 13.8, -9.8, 13.8, -7.6, -13.8, -7.6], STEEL.slice(1), M_METAL);
    for (let u = -11.6; u < 13; u += 3.2) { uball(b, u, -8.7, 0.7, 0.7, STEEL, { mat: M_METAL }); plot(b, X(u - 0.3), Y(-9), WHITE); }
    upoly(b, [10.6, -9, 12.8, -9, 12.6, -1.4, 11, -1.4], STEEL, M_METAL);
    for (const [u, v] of [[-5, -16], [3, -18]] as [number, number][]) { plot(b, X(u), Y(v), WHITE); plot(b, X(u) + 1, Y(v), WHITE); }
  } else if (kit === 'wizard') {
    // (long hair out the back under the hat; the brim, the cone crumpled near its tip, its band, its stars)
    hairMass(b, [-15.2, -10, -9, -10, -8, 12, -12, 20, -17, 14], HR, Math.PI / 2 + 0.15, 7, 90);
    upoly(b, [-11, -15.6, 11, -15.6, 4, -29, -8, -43, -4, -29], MR, M_CLOTH, { tilt: -0.4 });
    upath(b, [-6, -30, -1, -31.4, 3, -29.6], MR[5], 1, undefined, M_CLOTH); upath(b, [-6, -31, -1, -32.4], MR[1], 1, undefined, M_CLOTH);
    upoly(b, [-11, -17.2, 11, -17.2, 11, -15.4, -11, -15.4], TR, M_CLOTH);
    uball(b, 0, -13.6, 19, 4.6, MR, { mat: M_CLOTH, line: true, lw: 1, flat: 0.4 });
    for (const [u, v] of [[-3, -22], [2, -18.6], [-5, -32], [5, -24], [-12, -13]] as [number, number][]) { upath(b, [u - 1.2, v, u + 1.2, v], TR[2], 1); upath(b, [u, v - 1.2, u, v + 1.2], TR[2], 1); plot(b, X(u), Y(v), WHITE); }
  }
  yield;

  // (the silhouette of each material inked where it meets nothing; the hair edged where it meets the skin)
  const others = (m: number) => [M_SKIN, M_HAIR, M_LIP, M_MOUTH, M_OTHER, M_METAL, M_CLOTH, 3, 4, 10].filter(v => v !== m);
  inkEdges(b, M_HAIR, HR[6], others(M_HAIR));
  inkEdges(b, M_CLOTH, MR[6], others(M_CLOTH));
  inkEdges(b, M_METAL, STEEL[6], others(M_METAL));
  inkEdges(b, M_HAIR, HR[5], [M_HAIR, M_LIP, M_MOUTH, M_OTHER, M_METAL, M_CLOTH, 3, 4, 10]);
  // (the neck's foot dithered away into the torso under it)
  const y0 = Y(13.4), y1 = Y(16.6);
  for (let y = Math.floor(y0); y < GH; y++) for (let x = 0; x < CW; x++) {
    const i = y * GW + x;
    if (b.mat[i] !== M_SKIN) continue;
    const u = uOf(x), v = vOf(y);
    if (((u - 8.5) / 6) ** 2 + ((v - 11) / 4.8) ** 2 <= 1.02 || ((u - 2.5) / 11) ** 2 + ((v - 6) / 8.5) ** 2 <= 1.02) continue;
    const t = (y - y0) / (y1 - y0);
    if (t >= 1 || bay(x, y) < t) { b.px[i] = 0; b.mat[i] = 0; }
  }
  return b;
}

// ---------------------------------------------------------------------------------------------------------------
// Keeping them, painting ahead, putting them down

const crop = (b: Buf): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas'); cv.width = CW; cv.height = GH;
  const g = cv.getContext('2d')!;
  const img = g.createImageData(CW, GH), out = new Uint32Array(img.data.buffer);
  for (let y = 0; y < GH; y++) out.set(b.px.subarray(y * GW, y * GW + CW), y * CW);
  g.putImageData(img, 0, 0);
  return cv;
};
const kept = new Map<string, HTMLCanvasElement | null>();
const going = new Map<string, ReturnType<typeof stepper<Buf>>>();
const keyOf = (L: SuitorLook, face: GrossFace, dmg: number, purp: number) => `${L.name}|${L.kit}|${L.hair}|${L.main}|${L.trim}|${L.skin[1]}|${face}|${dmg}|${purp}`;
const jobOf = (L: SuitorLook, face: GrossFace, dmg: number, purp: number) => {
  const k = keyOf(L, face, dmg, purp);
  let j = going.get(k);
  if (!j) { j = stepper(() => paintSuitor(L, face, dmg, purp)); going.set(k, j); }
  return j;
};
const keep = (L: SuitorLook, face: GrossFace, dmg: number, purp: number, b: Buf) => { const k = keyOf(L, face, dmg, purp), cv = crop(b); kept.set(k, cv); going.delete(k); return cv; };

/** His gross-up stamp (painted now if it wasn't painted ahead). */
export const suitorGross = (L: SuitorLook, face: GrossFace, dmg: number, purp: number) => {
  const d = Math.max(0, Math.min(5, Math.round(dmg))), p = Math.max(0, Math.min(4, Math.round(purp)));
  const k = keyOf(L, face, d, p), have = kept.get(k);
  if (have !== undefined) return have;
  return keep(L, face, d, p, jobOf(L, face, d, p).finish());
};

/** Paint these ahead, a few ms an idle moment (each a step at a time: never a long frame). */
export type GrossWant = [SuitorLook, GrossFace, number, number];
export const warmSuitorGross = (want: GrossWant[]) => {
  if (typeof document === 'undefined') return;
  const q = want.filter(([L, f, d, p]) => !kept.has(keyOf(L, f, d, p)));
  if (!q.length) return;
  idleJob(until => {
    while (q.length) {
      const [L, f, d, p] = q[0];
      if (kept.has(keyOf(L, f, d, p))) { q.shift(); continue; }
      const j = jobOf(L, f, d, p);
      if (!j.run(until)) return false;
      keep(L, f, d, p, j.finish()); q.shift();
      if (performance.now() >= until) return !q.length;
    }
    return true;
  });
};

/** His head put down in the head's frame (its middle at the origin, facing +x, closeup.ts's head units). */
export const drawSuitorGross = (g: Ctx, L: SuitorLook, face: GrossFace, dmg: number, purp: number) => {
  const img = suitorGross(L, face, dmg, purp);
  if (!img) return false;
  const sm = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = false;
  g.drawImage(img, GROSS_BOX.x, GROSS_BOX.y, GROSS_BOX.w, GROSS_BOX.h);
  g.imageSmoothingEnabled = sm;
  return true;
};
