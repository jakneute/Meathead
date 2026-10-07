// Riggs's cab swinging round in the street: backed out of the curio shop flat out, then the wheel cranked over and
// the whole thing whipped round nose first (a rockford), drawn the way a SNES game would sell it. The camera pitches
// down over the turn, so the street opens out under it as a Mode 7 plane (scanline by scanline, world-fixed, in
// perspective, chunky pixels, its edge dithered off into the town); the cab's built out of pre-painted faces (its
// side, the front of the cab with Riggs grinning through the glass, the grille and bumper, the hood and the roof),
// each laid down column by column at its own depth and scale, so the side foreshortens away, the front comes round
// at you (headlights flaring) and the far side opens back out, mirrored. It leans out of the turn, its shadow swings
// under it, the tires lay black arcs in the dirt and the dust boils up off them.
//
// Drawing only: where the cab is, which way it's facing and when are all town.ts's (cab.x, the reverse/spin/go
// states and their frames); this just reads them.

import type { Town } from './town';
import { CAB } from './town';
import { GROUND_Y } from '../../../constants';
import { RIGGS } from './convoyDraw';
import { drawPerson } from '../../render/npc/person';
import { INK, ink } from '../../render/npc/kit';
import { pixelBlob, steppedGlow, checker } from '../../render/pixelArt';
import { slab, pipe, redPaint } from '../../render/bosses/daleTruck';

type Ctx = CanvasRenderingContext2D;
type Cab = Town['cab'];
const Y = GROUND_Y;

/** The turn, in frames from the moment he starts backing out: it starts swinging this far in, and it's round by here. */
const T0 = 12, T1 = 54;
/** Half the cab's width (it's a box this wide, for the faces), and how far forward of its middle the nose is. */
const HALF = 52, NOSE = CAB.w / 2;
/** Where the cab front stands (x 130 in the side view), the hood's and the roof's heights. */
const CAB_FRONT = 130 - CAB.w / 2, HOOD_H = 126, ROOF_H = CAB.h;
/** The side view's canvas: where the side's x 0 and the ground land on it (room for the rails, the beam, the stack). */
const SIDE = { w: 520, h: 330, ox: 92, oy: 316 };

/** Frames into the turnaround (from the start of the reverse), or -1 when it's not on. */
const turnFrame = (cab: Cab, phase: Town['phase']) =>
  phase !== 'revive' && phase !== 'chase' ? -1 : cab.state === 'reverse' ? cab.t : cab.state === 'spin' ? 31 + cab.t : cab.state === 'go' ? 47 + cab.t : -1;
/** How far it's come back from the wall by frame T (3.5 a frame backing out, then creeping 1 a frame round and off). */
const backed = (T: number) => (T <= 31 ? 3.5 * T : 108.5 + (T - 31));
const smooth = (p: number) => p * p * (3 - 2 * p);
/** How far round it is (0 nose left .. PI nose right): eased in and out, and hanging a moment nose-on to you. */
const yawAt = (T: number) => {
  const p = Math.max(0, Math.min(1, (T - T0) / (T1 - T0)));
  const halves = p < 0.5 ? smooth(p * 2) / 2 : 0.5 + smooth(p * 2 - 1) / 2;
  return Math.PI * (smooth(p) * 0.55 + halves * 0.45);
};

/** The view at a moment of the turn: where its middle is (x along the street, depth toward you), its yaw, the pitch. */
interface View { cx: number; zc: number; cs: number; sn: number; k: number; per: number }
const viewAt = (cx: number, th: number): View => {
  const sn = Math.sin(th);
  return { cx, zc: 30 * sn, cs: Math.cos(th), sn, k: 0.2 * sn, per: sn / 1500 };
};
/** A point on the ground (x along the street, depth toward you) on screen, and its scale. */
const proj = (v: View, gx: number, gz: number) => {
  const g = 1 / (1 - gz * v.per);
  return { x: v.cx + (gx - v.cx) * g, y: Y + v.k * gz * g, g, gz };
};
/** A point on the cab (u forward of its middle, w across it, toward you when it's nose left) on the ground. */
const world = (v: View, u: number, w: number) => ({ gx: v.cx - u * v.cs + w * v.sn, gz: v.zc + u * v.sn + w * v.cs });
const at = (v: View, u: number, w: number) => { const p = world(v, u, w); return proj(v, p.gx, p.gz); };

/** The faces are painted at the screen's resolution (two to a world pixel), the way everything else is. */
const RES = 2;
const canvas = (w: number, h: number, res = RES) => { const c = document.createElement('canvas'); c.width = w * res; c.height = h * res; return c; };
/** To the screen's pixel grid (the cab's built on a layer lined up with it, so the columns butt up with no seams). */
const snap = (n: number) => Math.round(n * RES) / RES;

/**
 * A pre-painted face stood up off the ground, column by column (each at its own depth, so its own scale): its columns
 * run along the ground from cab point a to cab point b, and `oy` is the canvas row at ground level.
 */
const standUp = (ctx: Ctx, v: View, img: HTMLCanvasElement, oy: number, a: [number, number], b: [number, number], step = 1) => {
  const w = img.width / RES, h = img.height / RES;
  let prev: ReturnType<typeof at> | null = null;
  for (let c = 0; c <= w; c += step) {
    const k = c / w;
    const p = at(v, a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k);
    if (prev) {
      const x0 = snap(Math.min(prev.x, p.x)), x1 = snap(Math.max(prev.x, p.x));
      const g = (prev.g + p.g) / 2, gy = (prev.y + p.y) / 2, top = snap(gy - oy * g);
      if (x1 > x0) ctx.drawImage(img, (c - step) * RES, 0, step * RES, img.height, x0, top, x1 - x0, snap(gy + (h - oy) * g) - top);
    }
    prev = p;
  }
};

/** A flat (the hood, the roof) at height h over the cab's u0..u1, the width of it, filled. */
const flat = (ctx: Ctx, v: View, u0: number, u1: number, h: number, fill: string, lip: string) => {
  const pts = [at(v, u0, -HALF), at(v, u1, -HALF), at(v, u1, HALF), at(v, u0, HALF)].map(p => ({ x: p.x, y: p.y - h * p.g }));
  ink(ctx, () => { ctx.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y); ctx.closePath(); }, fill, 1);
  // (lit along its front edge)
  ctx.strokeStyle = lip; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pts[1].x, pts[1].y + 1); ctx.lineTo(pts[2].x, pts[2].y + 1); ctx.stroke();
};

// ---------------------------------------------------------------------------
// The faces, painted once
// ---------------------------------------------------------------------------

/** The grille face: bumper, grille, headlights, the fenders and the steer tires under them (cranked over). */
const GRILLE = { w: HALF * 2, h: HOOD_H + 4, oy: HOOD_H + 4 };
let grilleImg: HTMLCanvasElement | null = null;
const grille = () => {
  if (grilleImg) return grilleImg;
  const c = canvas(GRILLE.w, GRILLE.h), g = c.getContext('2d')!;
  g.scale(RES, RES); g.translate(HALF, GRILLE.oy);
  // The steer tires (turned hard over: tread and a slice of sidewall showing), the axle between them
  for (const s of [-1, 1]) {
    const x = s < 0 ? -HALF : HALF - 22;
    ink(g, () => g.roundRect(x, -54, 22, 54, 5), '#18181B', 1.5);
    g.fillStyle = '#3F3F46'; for (let y = -50; y < -2; y += 5) g.fillRect(x + 3, y, 12, 2);
    g.fillStyle = '#52525B'; g.fillRect(x + 16, -50, 4, 48); g.fillStyle = '#71717A'; g.fillRect(x + 17, -46, 2, 16);
  }
  pipe(g, -HALF + 20, -34, HALF * 2 - 40, 8, '#27272A');
  g.fillStyle = '#1C1917'; g.fillRect(-HALF + 22, -26, HALF * 2 - 44, 6);
  // Fenders over the tires, the hood front between, the grille in its chrome surround
  for (const s of [-1, 1]) redPaint(g, () => { const x = s < 0 ? -HALF : HALF - 26; g.moveTo(x, -50); g.lineTo(x, -66); g.quadraticCurveTo(x + 13, -80, x + 26, -66); g.lineTo(x + 26, -50); g.closePath(); }, s < 0 ? -HALF : HALF - 26, -80, 26, -50, 2);
  redPaint(g, () => g.rect(-HALF + 14, -HOOD_H, HALF * 2 - 28, HOOD_H - 46), -HALF + 14, -HOOD_H, HALF * 2 - 28, -46, 2);
  slab(g, -24, -120, 48, 66, '#E5E7EB', 2);
  g.fillStyle = '#374151'; g.fillRect(-20, -116, 40, 58);
  for (let y = -114; y < -58; y += 4) { g.fillStyle = '#6B7280'; g.fillRect(-20, y, 40, 1); g.fillStyle = '#9CA3AF'; g.fillRect(-20, y + 1, 40, 1); }
  g.fillStyle = '#D1D5DB'; g.fillRect(-1, -116, 2, 58);
  slab(g, -6, -126, 12, 5, '#D1D5DB', 1); // the badge on top
  // Headlights (blazing), the turn signals under them
  for (const s of [-1, 1]) {
    const x = s < 0 ? -HALF + 16 : HALF - 30;
    ink(g, () => g.rect(x, -118, 14, 11), '#FEF08A', 1); g.fillStyle = '#FFFFFF'; g.fillRect(x + 2, -116, 4, 3);
    ink(g, () => g.rect(x + 2, -102, 10, 5), '#F59E0B', 1);
  }
  // The bumper, chrome, right across (a step cut in each end), the plate
  slab(g, -HALF, -48, HALF * 2, 14, '#D1D5DB', 2);
  g.fillStyle = '#F8FAFC'; g.fillRect(-HALF + 3, -46, HALF * 2 - 6, 1);
  ink(g, () => g.rect(-9, -45, 18, 9), '#FDE68A', 0.8); g.fillStyle = '#7F1D1D'; g.fillRect(-6, -42, 12, 2);
  return (grilleImg = c);
};

/** The front of the cab above the hood: the windshield (Riggs goes in it each frame), visor, mirrors, marker lights. */
const CABF = { w: HALF * 2 + 28, h: ROOF_H - HOOD_H + 8, oy: ROOF_H + 6 };
let cabImg: HTMLCanvasElement | null = null, cabWork: HTMLCanvasElement | null = null;
const cabFront = () => {
  if (cabImg) return cabImg;
  const c = canvas(CABF.w, CABF.h), g = c.getContext('2d')!;
  g.scale(RES, RES); g.translate(CABF.w / 2, CABF.oy);
  redPaint(g, () => g.rect(-HALF, -ROOF_H, HALF * 2, ROOF_H - HOOD_H), -HALF, -ROOF_H, HALF * 2, -HOOD_H, 2);
  // Windshield, two panes, the post between
  for (const x of [-44, 2]) { g.fillStyle = '#1E3A5F'; g.fillRect(x, -180, 42, 44); g.fillStyle = '#2D5285'; g.fillRect(x, -180, 42, 8); }
  g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(-44.5, -180.5, 89, 45);
  g.fillStyle = '#991B1B'; g.fillRect(-2, -180, 4, 44);
  // The sun visor, the marker lights along the roof
  slab(g, -HALF + 2, -190, HALF * 2 - 4, 8, '#7F1D1D', 1);
  for (let k = 0; k < 5; k++) { ink(g, () => g.rect(-22 + k * 10, -ROOF_H - 4, 5, 4), '#F59E0B', 0.8); g.fillStyle = '#FDE68A'; g.fillRect(-21 + k * 10, -ROOF_H - 3, 2, 1); }
  // Mirrors out on their arms
  for (const s of [-1, 1]) { pipe(g, s < 0 ? -HALF - 10 : HALF, -166, 10, 3, '#9CA3AF'); slab(g, s < 0 ? -HALF - 14 : HALF + 8, -176, 6, 22, '#D1D5DB', 1); }
  return (cabImg = c);
};
/** The cab front this frame: Riggs behind the glass (bandaged, grinning, driving), the glare over him. */
const cabFrontNow = (f: number) => {
  const base = cabFront();
  const c = cabWork || (cabWork = canvas(CABF.w, CABF.h)), g = c.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); g.drawImage(base, 0, 0);
  g.scale(RES, RES);
  g.translate(CABF.w / 2, CABF.oy);
  g.save(); g.beginPath(); g.rect(2, -180, 42, 44); g.clip();
  drawPerson(g, 22, -87.8, RIGGS, { mouth: 'grin', f }, 1.1);
  ink(g, () => g.rect(12, -165, 21, 4), '#F8FAFC', 0.8);
  g.fillStyle = '#B91C1C'; g.fillRect(16, -165, 5, 4); g.fillStyle = '#7F1D1D'; g.fillRect(17, -161, 2, 3);
  slab(g, 8, -142, 30, 4, '#44403C', 1); // the wheel, cranked
  g.restore();
  g.fillStyle = 'rgba(255, 255, 255, 0.22)';
  for (const x of [-30, 16]) { g.beginPath(); g.moveTo(x + 14, -180); g.lineTo(x + 20, -180); g.lineTo(x + 2, -136); g.lineTo(x - 4, -136); g.fill(); }
  return c;
};

/** The side, this frame (the town's own side view of the cab, nose right), on its canvas. */
let sideImg: HTMLCanvasElement | null = null;
const sideNow = (paint: (g: Ctx) => void) => {
  const c = sideImg || (sideImg = canvas(SIDE.w, SIDE.h)), g = c.getContext('2d')!;
  g.setTransform(RES, 0, 0, RES, 0, 0); g.clearRect(0, 0, SIDE.w, SIDE.h);
  g.translate(SIDE.ox, SIDE.oy - Y);
  paint(g);
  return c;
};

// ---------------------------------------------------------------------------
// The street, Mode 7
// ---------------------------------------------------------------------------

/** The plane's buffer: half resolution (chunky), from a little above the street line to the bottom of the screen. */
const M7 = { w: 420, h: 60, top: Y - 70 };
let m7: { c: HTMLCanvasElement; img: ImageData } | null = null;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(n => (n + 0.5) / 16);
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
/** The dirt in bands, sunlit far off to shadowed close up; grit and pebbles; the ruts (dark, their far lips lit). */
const BANDS = ['#B07B45', '#A0703F', '#93653A', '#865B34'].map(rgb), GRIT = [rgb('#C49260'), rgb('#6E4626'), rgb('#8A8178')];
const RUT = rgb('#7A4A24'), RUT_LIP = rgb('#C49260');
const cellHash = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const dirt = (gx: number, gz: number) => {
  const cx = Math.floor(gx / 2), cz = Math.floor(gz / 2);
  for (const r of [-70, 46]) { const d = gz - r; if (d >= -3 && d < 2) return d >= 0 ? RUT_LIP : RUT; }
  const h = cellHash(cx, cz);
  if (h < 0.025) return GRIT[0]; if (h < 0.045) return GRIT[1]; if (h < 0.05) return GRIT[2];
  // (a row of dither either side of each band's seam)
  const band = gz + ((cx + cz) & 1 ? 3 : -3);
  return BANDS[band < -90 ? 0 : band < 0 ? 1 : band < 80 ? 2 : 3];
};
const drawStreetPlane = (ctx: Ctx, v: View, fade: number) => {
  if (!m7) { const c = canvas(M7.w, M7.h, 1); m7 = { c, img: c.getContext('2d')!.createImageData(M7.w, M7.h) }; }
  const d = m7.img.data, x0 = v.cx - M7.w;
  for (let by = 0; by < M7.h; by++) {
    const q = M7.top + by * 2 + 1 - Y, den = v.k + q * v.per;
    const gz = den > 0.005 ? q / den : NaN, g = 1 / (1 - gz * v.per);
    for (let bx = 0; bx < M7.w; bx++) {
      const i = (by * M7.w + bx) * 4;
      if (!(g > 0)) { d[i + 3] = 0; continue; }
      const gx = v.cx + (x0 + bx * 2 + 1 - v.cx) / g;
      // (round the cab, its edge dithered off into the town; there as much as the camera's tipped down)
      const ex = (gx - v.cx) / 330, ez = (gz - v.zc) / 190, edge = Math.min(1, (1 - ex * ex - ez * ez) / 0.4) * fade;
      if (edge <= BAYER[(bx & 3) + (by & 3) * 4]) { d[i + 3] = 0; continue; }
      const col = dirt(gx, gz);
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
  }
  m7.c.getContext('2d')!.putImageData(m7.img, 0, 0);
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(m7.c, x0, M7.top, M7.w * 2, M7.h * 2);
  ctx.imageSmoothingEnabled = smoothing;
};

// ---------------------------------------------------------------------------
// The turn
// ---------------------------------------------------------------------------

/** The layer the cab's built on: wide enough for it end to end and its beam, from over its stack to under its nose. */
const LAYER = { w: 780, h: 440, up: 370 };
let layer: HTMLCanvasElement | null = null;
/** How long a puff of dust hangs about, frames. */
const DUST_LIFE = 26;
/** The tires (u forward of the middle, w across): the drive axles' duals (between the two), the steer axle. */
const TIRES: [number, number][] = [[-147, HALF - 8], [-147, -HALF + 8], [85, HALF - 8], [85, -HALF + 8]];

/**
 * Riggs's cab mid-turnaround, if it is: drawn here (the street plane, the skids, the shadow, the dust, the cab) and
 * true; false when it isn't turning (draw it the usual way). `side` paints the town's side view of it, nose right,
 * at x 0 on the ground (wheels rolling, Riggs and all).
 */
export const drawCabTurn = (ctx: Ctx, cab: Cab, phase: Town['phase'], f: number, side: (g: Ctx) => void, gore = 0) => {
  const T = turnFrame(cab, phase);
  if (T < T0 || T >= T1 + DUST_LIFE || typeof document === 'undefined') return false;
  const cxNow = cab.x + CAB.w / 2;
  const v = viewAt(cxNow, yawAt(T));
  const fade = Math.max(0, Math.min(1, (v.sn - 0.12) * 1.8));
  const was = (t: number) => viewAt(cxNow - (backed(T) - backed(t)), yawAt(t));
  ctx.save();
  // The street opening out under it, and the black it's laying down (where each tire's been, world-fixed)
  if (fade > 0) drawStreetPlane(ctx, v, fade);
  ctx.globalAlpha = 0.8 * fade; ctx.fillStyle = '#3B2210';
  if (fade > 0) for (let t = T0 + 3; t <= Math.min(T, T1); t += 0.5) {
    const vt = was(t);
    for (const [u, w] of TIRES) { const pt = world(vt, u, w), p = proj(v, pt.gx, pt.gz); ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 1, Math.round(8 * p.g), Math.max(2, Math.round(3 * p.g))); }
  }
  // Its shadow under it, dithered
  ctx.globalAlpha = fade;
  const foot = [at(v, -NOSE - 82, -HALF), at(v, NOSE, -HALF), at(v, NOSE, HALF), at(v, -NOSE - 82, HALF)];
  if (fade > 0) { ctx.save(); ctx.beginPath(); ctx.moveTo(foot[0].x, foot[0].y); for (const p of foot.slice(1)) ctx.lineTo(p.x, p.y); ctx.closePath(); ctx.clip();
  checker(ctx, v.cx - 300, Y - 80, 600, 160, 'rgba(26, 11, 6, 0.6)');
  ctx.restore(); }
  ctx.globalAlpha = 1;
  // The dust off the tires (behind it first, then what's this side of it once it's drawn)
  const puffs: { x: number; y: number; r: number; a: number; gz: number }[] = [];
  for (let b = T0 + 2; b <= Math.min(T, T1 - 2); b += 2) {
    const age = T - b; if (age > DUST_LIFE) continue;
    const vb = was(b);
    for (const [u, w] of TIRES.slice(0, 2)) {
      const pt = world(vb, u, w + Math.sign(w) * 6), p = proj(v, pt.gx + age * 0.6, pt.gz + Math.sign(w) * age * 0.8);
      puffs.push({ x: p.x, y: p.y - (6 + age * 1.3) * p.g, r: (6 + age * 1.15) * p.g, a: (1 - age / (DUST_LIFE + 1)) * 0.75, gz: pt.gz });
    }
  }
  const dust = (front: boolean) => { for (const d of puffs) if ((d.gz > v.zc) === front) {
    pixelBlob(ctx, d.x + d.r * 0.2, d.y + d.r * 0.15, d.r, d.r * 0.75, `rgba(150, 112, 70, ${(d.a * 0.8).toFixed(3)})`);
    pixelBlob(ctx, d.x - d.r * 0.15, d.y - d.r * 0.15, d.r * 0.75, d.r * 0.55, `rgba(222, 196, 150, ${d.a.toFixed(3)})`);
  } };
  dust(false);
  // (round: the dust settling behind it as it goes, the cab side on again, the usual way)
  if (T >= T1) { ctx.restore(); return false; }
  // The cab, built on its own layer (the roof, the side toward you, the front of the cab, the hood, the grille), then
  // laid down leaning out of the turn
  const lx = Math.round(v.cx) - LAYER.w / 2, ly = Y - LAYER.up;
  const L = layer || (layer = canvas(LAYER.w, LAYER.h)), lg = L.getContext('2d')!;
  lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, L.width, L.height);
  lg.setTransform(RES, 0, 0, RES, -lx * RES, -ly * RES); lg.imageSmoothingEnabled = false;
  flat(lg, v, -NOSE, CAB_FRONT, ROOF_H, '#DC2626', '#F87171');
  const near = v.cs >= 0 ? HALF : -HALF;
  standUp(lg, v, sideNow(side), SIDE.oy, [-SIDE.ox - NOSE, near], [SIDE.w - SIDE.ox - NOSE, near]);
  standUp(lg, v, cabFrontNow(f), CABF.oy, [CAB_FRONT, -CABF.w / 2], [CAB_FRONT, CABF.w / 2]);
  flat(lg, v, CAB_FRONT, NOSE, HOOD_H, '#DC2626', '#FCA5A5');
  standUp(lg, v, grille(), GRILLE.oy, [NOSE, -HALF], [NOSE, HALF]);
  const mid = at(v, 0, 0);
  ctx.translate(mid.x, mid.y); ctx.rotate(0.06 * v.sn * v.sn); ctx.translate(-mid.x, -mid.y);
  const smoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(L, lx, ly, LAYER.w, LAYER.h);
  ctx.imageSmoothingEnabled = smoothing;
  // (what's left of the tourists, on the front of it)
  if (gore > 0) { const p = at(v, NOSE, 0); ctx.fillStyle = `rgba(153, 27, 27, ${(0.5 + gore * 0.4) * v.sn})`; for (let k = 0; k < Math.ceil(gore * 10); k++) ctx.fillRect(p.x + (((k * 13) % 60) - 30) * v.sn * p.g, p.y - (40 + ((k * 23) % 80)) * p.g, 5, 6 + (k % 4) * 4); }
  // The headlights flaring as they come round at you
  const flare = Math.pow(v.sn, 6);
  if (flare > 0.05) for (const w of [-HALF + 23, HALF - 23]) { const p = at(v, NOSE, w); steppedGlow(ctx, p.x, p.y - 112 * p.g, 34 * flare * p.g, '#FEF9C3', 0.55 * flare, 0, 4); ctx.fillStyle = `rgba(255, 255, 255, ${flare.toFixed(3)})`; ctx.fillRect(p.x - 3, p.y - 115 * p.g, 6, 6); }
  ctx.restore();
  dust(true);
  return true;
};
