// THE QUEEN (LEGALLY DISTINCT), drawn: XENOSCARE's big finale animatronic, a knockoff (plainly) of a certain movie
// monster's queen, so the signs insist. A robot under latex: the long glossy dome (and, through its shine, the servo
// rig they've wired into her skull), the fanned crest riveted on, the silver teeth, the inner jaws on chrome rods (three
// here: one too many), the ribbed exoskeleton, chrome ball joints and pistons at every bend, the dorsal pipes, the
// vertebrae of her tail down to its blade, a speaker grille in her chest (NOW ENTERING LESS FATAL MODE comes out of
// it). Cheap behind the shine: seams, glued ribs, torn spots showing the yellow foam, zip ties, hydraulic lines; mounted
// on her stand, the hydraulic arm she lunges on and the egg sac on its dolly. Mind-controlled: their green under her
// crest and in her mouth.
//
// Every pose a fight wants: dormant, wake, idle, stalk, roar, tell, swipe, spit, grab, birth, leap (in the air: legs
// tucked, the tail streaming), flail (all four arms going), hurt, stunned (sparking, smoking), dead (slumped, the
// crest bent, her fluid out). Drawn facing right from her middle on the floor (flipped to face left).

import { GY } from '../geometry';
import { stencil } from './letters';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { type Ramp, LAT, GLOSS, SPEC, CHROME, STEELR, SACR, FOAMR, GUM, TOOTH, GREEN, dith, tube, hose, quad, blob, shapeShade, rings } from './paint';
import { elbow } from '../../art/limb';

type Ctx = CanvasRenderingContext2D;

export type QueenPose = 'dormant' | 'wake' | 'idle' | 'roar' | 'tell' | 'swipe' | 'spit' | 'hurt' | 'stunned' | 'birth' | 'dead' | 'stalk' | 'grab' | 'leap' | 'flail';
export interface QueenDraw {
  pose: QueenPose; t: number;
  /** How far out on her arm she's lunged (px, toward where she faces). */
  ext: number;
  /** Mind-controlled: her glow lit (0..1). */
  alive: number;
  /** Damage showing (0..1): more tears, sparks, a hanging plate. */
  beat: number;
  /** Torn off her stand (the basement, the disco): on her own feet, no plinth, no sac, her lines hanging torn. */
  free?: boolean;
  /** Walking: how far through her stride (radians; free only). */
  stride?: number;
  /** Foam on her (the extinguisher: 0..1). */
  foam?: number;
  /** Her outer jaws open this far (0..1), whatever the pose (the kill's slow opening). */
  jaw?: number;
  /** Her inner jaws out this far (0..1.6), whatever the pose (0: kept in; the kill draws its own strike). */
  inner?: number;
  /** Mallet hits she's taken (her weakness): a dent for each, crumpled in, the foam showing (up to DENTS). */
  dents?: number;
}

/** Where the mallet's dents go (torso-local, the first ones on her chest and hips, the later ones up her dome). */
const DENTS: [number, number, number][] = [[4, -196, 9], [-20, -168, 8], [24, -140, 7], [-8, -128, 8], [14, -220, 7], [-26, -206, 7], [30, -180, 6], [-4, -150, 9]];
/** A dent: the latex crumpled in (a dark hollow, a lit rim on its lower lip, the yellow foam split through), a scrape. */
const dent = (c: Ctx, x: number, y: number, r: number, i: number) => {
  c.fillStyle = LAT[0]; c.beginPath(); c.ellipse(x, y, r + 1.5, r * 0.75 + 1.5, 0.3 * (i % 3 - 1), 0, Math.PI * 2); c.fill();
  c.fillStyle = LAT[1]; c.beginPath(); c.ellipse(x - 1, y - 1, r, r * 0.7, 0.3 * (i % 3 - 1), 0, Math.PI * 2); c.fill();
  c.strokeStyle = LAT[4]; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, r, r * 0.72, 0.3 * (i % 3 - 1), 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  px(c, x - r * 0.4, y - 1, r * 0.8, 2, FOAMR[2]); px(c, x - r * 0.3, y - 1, r * 0.4, 1, FOAMR[4]);
  c.strokeStyle = CHROME[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + r * 0.6, y - r * 0.9); c.lineTo(x + r * 1.5, y - r * 1.4); c.stroke();
};

/** How tall she stands (plinth to the crest's top). */
export const QUEEN_H = 300;
/** Where her head is (the beam's mark), for her at (x, ext), facing. */
export const queenHead = (x: number, facing: 1 | -1, ext: number) => ({ x: x + facing * (ext + 40), y: GY - 260 });

/** The far side of her (the far leg, the far arm): a step darker. */
const LATF: Ramp = ['#040508', '#0A0B10', '#13141B', '#222531', '#3C4356'];
const RED: Ramp = ['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5'];
const BLUE: Ramp = ['#06122E', '#1E3A8A', '#1D4ED8', '#60A5FA', '#BFDBFE'];
const YEL: Ramp = ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A'];
const LINES = [RED, BLUE, YEL];
/** The rim light on her back edges (the hall's violet). */
const RIM = '#9D7CC8';

const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** The queen at (x, the floor), facing `facing`. */
export const drawQueen = (c: Ctx, x: number, facing: 1 | -1, q: QueenDraw) => {
  const { pose, t } = q;
  const glow = q.alive > 0 && pose !== 'dead' ? q.alive * (0.8 + 0.2 * Math.sin(t * 0.2)) : 0;
  c.save(); c.translate(Math.round(x), GY); c.scale(facing, 1);
  if (!q.free) stand(c, q, facing);
  c.translate(q.ext, q.free ? 36 : 0);
  const stride = q.free ? q.stride ?? 0 : 0;
  const sway = pose === 'idle' ? Math.sin(t * 0.05) * 3 : 0;
  const twitch = pose === 'wake' || pose === 'stunned' ? (t % 6 < 3 ? 2 : -2) : pose === 'flail' ? (t % 4 < 2 ? 2 : -2) : 0;
  const sag = pose === 'dead' ? 1 : pose === 'stunned' ? 0.4 : pose === 'dormant' ? 0.12 : 0;
  const lean = pose === 'swipe' ? 0.24 : pose === 'spit' ? 0.14 : pose === 'roar' ? -0.14 : pose === 'hurt' ? -0.16 : pose === 'tell' ? -0.08 : pose === 'stalk' ? 0.42 : pose === 'grab' ? 0.18 : pose === 'leap' ? 0.32 : pose === 'flail' ? 0.06 : 0;
  c.translate(sway + twitch, 0);
  // (dead: her hydraulic fluid out of her, a green pool spreading on the floor under her)
  if (pose === 'dead' && q.free) {
    c.fillStyle = GREEN[0]; c.beginPath(); c.ellipse(10, -36, 120, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = GREEN[1]; c.beginPath(); c.ellipse(8, -37, 110, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = dith(c, GREEN[2]); c.beginPath(); c.ellipse(4, -38, 80, 4, 0, 0, Math.PI * 2); c.fill();
    px(c, -30, -40, 22, 1, GREEN[4]); px(c, 40, -39, 10, 1, GREEN[3]);
  }
  tail(c, t, pose, !!q.free);
  c.save(); c.translate(0, -110); c.rotate(lean + sag * 0.35); c.translate(0, 110);
  legs(c, pose, stride);
  // --- The dorsal pipes off her back: four tubes up and back (one bent where it's been leant on), capped ---
  for (let i = 3; i >= 0; i--) {
    const bx = -34 + i * 9, by = -200 + i * 10, ex = bx - 34 - i * 4, ey = by - 46 + i * 8 + (i === 2 ? 10 : 0);
    tube(c, bx, by, ex, ey, 9, LAT);
    for (let k = 1; k < 4; k++) { const u = k / 4; px(c, bx + (ex - bx) * u - 2, by + (ey - by) * u - 1, 4, 1, LAT[0]); }
    blob(c, ex, ey, 6, 5, LAT); c.fillStyle = LAT[0]; c.beginPath(); c.ellipse(ex - 1, ey, 3, 2.4, 0, 0, Math.PI * 2); c.fill();
  }
  // --- The hydraulic lines: red, blue, yellow, out of her back (to the plinth; or torn off it, hanging, dripping) ---
  for (let i = 0; i < 3; i++) {
    if (q.free) {
      const sw = Math.sin(t * 0.08 + i) * 6, ex = -56 + sw - i * 6, ey = -100 + i * 10;
      hose(c, quad(-30, -180 + i * 8, -60 + sw, -150, ex, ey, 7), 3, LINES[i]);
      px(c, ex - 3, ey - 1, 6, 4, CHROME[2]); px(c, ex - 3, ey - 1, 6, 1, CHROME[4]);
      const d = (t + i * 13) % 30; if (d < 20) px(c, ex - 1, ey + 3 + d * 0.6, 2, 3, LINES[i][3]);
    } else hose(c, quad(-30, -180 + i * 8, -70, -90, -30 - q.ext + i * 10, -30, 8), 3, LINES[i]);
  }
  // --- The far arm (behind her) ---
  const A = armsOf(pose, t, stride);
  arm(c, A[1], LATF, pose);
  torso(c, q, t);
  // --- The small arms, out of her chest ---
  const smallUp = pose === 'tell' || pose === 'roar' ? -24 : pose === 'flail' ? Math.sin(t * 0.9) * 16 : 0;
  tube(c, 18, -196, 40, -176 + smallUp, 6, LAT); tube(c, 40, -176 + smallUp, 48, -190 + smallUp, 5, LAT);
  blob(c, 40, -176 + smallUp, 3, 3, CHROME);
  for (let i = 0; i < 3; i++) tube(c, 48, -190 + smallUp, 54 + i * 2, -196 + smallUp + i * 4, 2, LAT);
  head(c, q, t, sag, glow);
  // --- The near arm ---
  arm(c, A[0], LAT, pose);
  // (sparking: stunned, dead, or knocked about)
  if (pose === 'stunned' || pose === 'dead' || (q.beat > 0.5 && t % 50 < 4)) for (let i = 0; i < 5; i++) {
    const a = t * 0.7 + i * 1.6, sx = 20 + Math.cos(a) * 30, sy = -210 + Math.sin(a * 1.3) * 40;
    px(c, sx - 1, sy - 1, 3, 3, i % 2 ? '#FDE047' : '#FFFFFF');
    if (i % 2 === 0) { px(c, sx - 4, sy, 2, 1, '#FDE047'); px(c, sx + 3, sy, 2, 1, '#FDE047'); px(c, sx, sy - 4, 1, 2, '#FFFFFF'); }
  }
  // (stunned or dying: smoke out of her neck joint, stippled, rising)
  if (pose === 'stunned' || pose === 'dead') for (let i = 0; i < 4; i++) {
    const u = ((t * 0.02 + i * 0.25) % 1), sx = 4 + Math.sin(u * 6 + i) * 6 - u * 10, sy = -236 - u * 70;
    c.fillStyle = u < 0.5 ? '#4B4B57' : dith(c, '#6B6B78', 2, i % 2); c.beginPath(); c.ellipse(sx, sy, 5 + u * 10, 4 + u * 8, 0, 0, Math.PI * 2); c.fill();
  }
  // (the extinguisher's foam all over her, in clumps: white, blue-gray in its shade)
  if (q.foam && q.foam > 0) for (let i = 0; i < Math.round(14 * q.foam); i++) {
    const fx = -30 + ((i * 37) % 90), fy = -280 + ((i * 53) % 220), r = 9 + (i % 3) * 3;
    blob(c, fx, fy, r, 7, ['#64748B', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF'], false);
  }
  c.restore();
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The stand: the plinth, the hydraulic arm she's mounted on, the egg sac on its dolly, the hose

const stand = (c: Ctx, q: QueenDraw, facing: 1 | -1) => {
  const { ext, pose, t } = q;
  // (the plinth: a steel box, its top lit, its face banded, a hazard strip, bolts, its tag)
  px(c, -92, -28, 184, 28, STEELR[0]);
  px(c, -90, -26, 180, 24, STEELR[2]);
  px(c, -90, -26, 180, 3, STEELR[3]); px(c, -90, -26, 180, 1, STEELR[4]);
  px(c, -90, -16, 180, 2, dith(c, STEELR[1])); px(c, -90, -14, 180, 4, STEELR[1]);
  for (let i = 0; i < 30; i++) { c.fillStyle = i % 2 ? '#18181B' : '#FACC15'; c.beginPath(); c.moveTo(-90 + i * 6, -10); c.lineTo(-84 + i * 6, -10); c.lineTo(-87 + i * 6, -4); c.lineTo(-93 + i * 6, -4); c.closePath(); c.fill(); }
  px(c, -90, -4, 180, 2, STEELR[0]);
  for (let i = 0; i < 5; i++) { px(c, -80 + i * 38, -22, 4, 4, CHROME[1]); px(c, -80 + i * 38, -22, 2, 2, CHROME[4]); }
  c.save(); c.scale(facing, 1); stencil(c, 'LD-1', -60 * facing, -24, 1, '#D4D4D8', { seed: 2, spray: '', runs: false }); c.restore();
  // (the hydraulic arm: steel boom, a chrome ram along it, the pivots)
  tube(c, -30, -26, ext * 0.5 - 20, -62, 5, CHROME);
  tube(c, -20, -30, ext * 0.5 - 10, -70, 16, STEELR);
  tube(c, ext * 0.5 - 10, -70, ext, -96, 12, CHROME);
  blob(c, -20, -30, 11, 11, CHROME); px(c, -22, -32, 4, 4, CHROME[0]);
  blob(c, ext * 0.5 - 10, -70, 8, 8, CHROME);
  // --- The egg sac, behind her on its dolly (it stays put: the arm carries her off it on a hose) ---
  const heave = pose === 'birth' ? Math.sin(t * 0.3) * 8 : Math.sin(t * 0.04) * 2;
  px(c, -252, -42, 134, 18, STEELR[0]); px(c, -250, -40, 130, 14, STEELR[2]); px(c, -250, -40, 130, 2, STEELR[4]);
  for (const wx of [-236, -140]) { blob(c, wx, -22, 10, 10, STEELR); blob(c, wx, -22, 4, 4, CHROME, false); }
  const sx = -185, sy = -96, rx = 92 + heave, ry = 60 + heave * 0.6;
  shapeShade(c, () => c.ellipse(sx, sy, rx, ry, -0.1, 0, Math.PI * 2), SACR, -4, -4, 2, sx, sy);
  // (the eggs through it: dark ovals, each lit on its rim)
  c.save(); c.beginPath(); c.ellipse(sx, sy, rx - 3, ry - 3, -0.1, 0, Math.PI * 2); c.clip();
  for (let i = 0; i < 6; i++) {
    const ex = -236 + (i % 3) * 46, ey = -116 + Math.floor(i / 3) * 40;
    c.fillStyle = dith(c, '#57534E'); c.beginPath(); c.ellipse(ex, ey, 15, 19, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(68, 64, 60, 0.55)'; c.beginPath(); c.ellipse(ex, ey, 12, 16, 0, 0, Math.PI * 2); c.fill();
    px(c, ex - 6, ey - 12, 5, 2, SACR[4]);
    if (pose === 'birth') { const k = (t + i * 7) % 20 < 10 ? 1 : 0; px(c, ex - 2 + k, ey - 2, 4, 4, '#1C0610'); }
  }
  // (the veins over it)
  c.strokeStyle = '#6B3A3A'; c.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(sx - 80 + i * 36, sy + 30); c.quadraticCurveTo(sx - 60 + i * 30, sy - 10, sx - 70 + i * 34, sy - 50); c.stroke(); }
  c.restore();
  // (the latex ribs over it, the seam it was cast in, glued)
  for (let i = 0; i < 6; i++) hose(c, quad(-262 + i * 28, -148 + Math.abs(i - 2.5) * 6, -250 + i * 28, -96, -258 + i * 28, -44, 6), 4, LAT);
  px(c, -186, -156, 2, 120, SACR[0]); for (let k = 0; k < 8; k++) px(c, -189, -148 + k * 14, 8, 1, SACR[1]);
  px(c, -230, -140, 2, 2, SPEC); px(c, -160, -150, 2, 2, SPEC);
  if (pose === 'birth') { blob(c, -104, -90, 16, 24, GUM); c.fillStyle = '#0A0206'; c.beginPath(); c.ellipse(-102, -88, 10, 17, 0, 0, Math.PI * 2); c.fill(); px(c, -110, -100, 12, 4, ALIEN.slime); px(c, -108, -96, 3, 10, ALIEN.slime); }
  // (the hose from the sac to her: ribbed, sagging)
  for (let i = 7; i >= 0; i--) { const u = i / 7, hx = -110 + (ext - 30 + 110) * u, hy = -96 + Math.sin(u * Math.PI) * 18 - u * 30; blob(c, hx, hy, 9, 11, LAT); }
};

// ---------------------------------------------------------------------------------------------------------------
// The tail: vertebrae out behind and round along the floor, a spine on each, the blade on the end (it swishes)

const tail = (c: Ctx, t: number, pose: QueenPose, free: boolean) => {
  const pts: [number, number, number][] = [];
  let x = -30, y = -110;
  const leap = pose === 'leap', dead = pose === 'dead';
  for (let i = 0; i < 14; i++) {
    const u = i / 13;
    const a = leap ? Math.PI * 0.97 + Math.sin(t * 0.3 + i * 0.5) * 0.08 * u : Math.PI * 0.85 - u * 1.6 + Math.sin(t * 0.06 + i * 0.4) * (dead ? 0 : 0.1) * u;
    const nx = x + Math.cos(a) * 18, ny = leap ? y + Math.sin(a) * 14 + 2 : Math.min(free ? -42 : -8, y + Math.sin(a) * 14 + 9);
    pts.push([nx, ny, 14 - u * 9]); x = nx; y = ny;
  }
  // (the blade: a long chrome-edged spade)
  const [tx, ty] = pts[pts.length - 1], [px0, py0] = pts[pts.length - 2], ang = Math.atan2(ty - py0, tx - px0);
  c.save(); c.translate(tx, ty); c.rotate(ang);
  shapeShade(c, () => { c.moveTo(-2, -4); c.lineTo(24, -10); c.lineTo(32, 0); c.lineTo(24, 8); c.lineTo(-2, 4); c.closePath(); }, LAT, 0, -1.4, 1.5, 14, 0);
  c.strokeStyle = CHROME[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(4, -6); c.lineTo(24, -10); c.lineTo(31, 0); c.stroke();
  px(c, 22, -9, 2, 2, SPEC);
  c.restore();
  // (the bones, from the tip in: each overlapping the next one out)
  let prev: [number, number] = [-30, -110];
  const segs = pts.map(p => { const s = { x0: prev[0], y0: prev[1], x1: p[0], y1: p[1], w: p[2] }; prev = [p[0], p[1]]; return s; });
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i], mx = (s.x0 + s.x1) / 2, my = (s.y0 + s.y1) / 2, a = Math.atan2(s.y1 - s.y0, s.x1 - s.x0);
    blob(c, mx, my, 11 - i * 0.35, s.w * 0.55, i % 2 ? LAT : LATF, true, a);
    // (a spine off its top)
    const nx = Math.sin(a), ny = -Math.cos(a), up = ny < 0 ? 1 : -1, sl = s.w * 0.5 + 5 - i * 0.2;
    c.fillStyle = LAT[0]; c.beginPath(); c.moveTo(mx - Math.cos(a) * 4, my - Math.sin(a) * 4); c.lineTo(mx + nx * sl * up - Math.cos(a) * 3, my + ny * sl * up - Math.sin(a) * 3); c.lineTo(mx + Math.cos(a) * 4, my + Math.sin(a) * 4); c.closePath(); c.fill();
    px(c, mx + nx * (sl - 3) * up - Math.cos(a) * 2 - 1, my + ny * (sl - 3) * up - Math.sin(a) * 2 - 1, 2, 2, LAT[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The legs: bent back the wrong way, a chrome knee, a long shank, clawed feet

const legs = (c: Ctx, pose: QueenPose, stride: number) => {
  for (const s of [-1, 1]) {
    const r = s < 0 ? LATF : LAT, ph = stride + (s < 0 ? Math.PI : 0);
    let w = Math.sin(ph) * 16, up = Math.max(0, Math.cos(ph)) * 8;
    if (pose === 'leap') { w = -14 + s * 4; up = 26; }
    const hip = [s * 14, -118], knee = [s * 10 - 24 + w * 0.5, -84 + (pose === 'leap' ? -10 : 0)], ankle = [s * 14 + 6 + w, -56 - up], heel = [s * 14 - 6 + w, -40 - up];
    tube(c, hip[0], hip[1], knee[0], knee[1], 18, r);
    tube(c, knee[0], knee[1], ankle[0], ankle[1], 12, r);
    blob(c, knee[0], knee[1], 6, 6, CHROME); px(c, knee[0] - 1, knee[1] - 1, 2, 2, CHROME[0]);
    // (the piston behind the shank: the robot under her, plain to see)
    tube(c, knee[0] - 4, knee[1] + 6, ankle[0] - 8, ankle[1] + 4, 3, CHROME);
    tube(c, ankle[0], ankle[1], heel[0], heel[1], 10, r);
    blob(c, ankle[0], ankle[1], 4, 4, CHROME);
    // (the foot: a long pad, three claws out front, a spur behind)
    tube(c, heel[0] - 8, heel[1], heel[0] + 16, heel[1], 8, r);
    for (let k = 0; k < 3; k++) { const cx = heel[0] + 18 + k * 2, cy = heel[1] - 2 + k * 2; c.fillStyle = CHROME[0]; c.beginPath(); c.moveTo(cx - 3, cy - 2); c.lineTo(cx + 8, cy + 3); c.lineTo(cx - 2, cy + 3); c.closePath(); c.fill(); px(c, cx, cy - 1, 4, 1, CHROME[3]); }
    c.fillStyle = r[2]; c.beginPath(); c.moveTo(heel[0] - 8, heel[1] - 3); c.lineTo(heel[0] - 18, heel[1] + 2); c.lineTo(heel[0] - 8, heel[1] + 3); c.closePath(); c.fill();
  }
  // (the hips: a plate over where the legs go in, a bellows of chrome at the waist)
  shapeShade(c, () => c.ellipse(0, -114, 24, 13, 0, 0, Math.PI * 2), LAT, 1.4, -1.6, 2, 0, -114);
  for (let k = 0; k < 3; k++) { px(c, -12 + k, -128 + k * 4, 24 - k * 2, 3, CHROME[1]); px(c, -12 + k, -128 + k * 4, 24 - k * 2, 1, CHROME[3]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The torso: narrow waist, ribbed chest, glossy, the speaker grille, the seam, the tears

const torso = (c: Ctx, q: QueenDraw, t: number) => {
  const body = () => { c.moveTo(-18, -110); c.lineTo(-38, -170); c.quadraticCurveTo(-30, -236, 18, -238); c.quadraticCurveTo(48, -210, 34, -168); c.lineTo(16, -110); c.closePath(); };
  shapeShade(c, body, LAT, 2.4, -2.6, 2.5, 2, -180);
  c.save(); c.beginPath(); body(); c.clip();
  // (the ribs: each a ridge, inked under, lit along its top, the shine where it bends toward the light)
  for (let i = 0; i < 7; i++) {
    const y = -222 + i * 14, rib = (oy: number) => { c.beginPath(); c.moveTo(-28 + i, y + oy); c.quadraticCurveTo(4, y + 8 + oy, 34 - i * 2, y - 2 + oy); };
    c.strokeStyle = LAT[0]; c.lineWidth = 3; rib(2); c.stroke();
    c.strokeStyle = LAT[3]; c.lineWidth = 2.5; rib(0); c.stroke();
    c.strokeStyle = LAT[4]; c.lineWidth = 1; rib(-1); c.stroke();
    px(c, 12 - i, y + 3, 4, 1, GLOSS);
  }
  // (the seam down her side, the spine's plates down her back)
  px(c, -36, -200, 2, 80, LAT[0]);
  for (let k = 0; k < 6; k++) { const yy = -226 + k * 18; c.fillStyle = LAT[3]; c.beginPath(); c.moveTo(-34 + k * 0.6, yy); c.lineTo(-24, yy + 4); c.lineTo(-34 + k * 0.6, yy + 12); c.closePath(); c.fill(); px(c, -33 + k * 0.6, yy + 1, 3, 1, LAT[4]); }
  c.restore();
  // (the rim light down her back: the hall's colors caught on her latex edge)
  c.strokeStyle = RIM; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-16.5, -114); c.lineTo(-35.5, -170); c.quadraticCurveTo(-28, -232, 16, -235); c.stroke();
  // (the speaker grille in her chest: where her words come out)
  c.fillStyle = LAT[0]; c.beginPath(); c.roundRect(6, -166, 22, 18, 4); c.fill();
  px(c, 8, -164, 18, 14, '#0B0C10');
  for (let k = 0; k < 4; k++) { px(c, 9, -162 + k * 3.5, 16, 1.5, CHROME[1]); px(c, 9, -162 + k * 3.5, 16, 0.5, CHROME[3]); }
  px(c, 8, -164, 18, 1, LAT[4]);
  // (the latex torn: the yellow foam; a zip tie; more torn the more she's been hit)
  const tear = (x: number, y: number, w: number, h: number) => {
    c.fillStyle = FOAMR[0]; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + w * 0.3, y - 1); c.lineTo(x + w * 0.7, y + 1); c.lineTo(x + w + 1, y - 1); c.lineTo(x + w, y + h); c.lineTo(x + w * 0.5, y + h + 2); c.lineTo(x - 1, y + h); c.closePath(); c.fill();
    px(c, x + 1, y + 2, w - 2, h - 2, FOAMR[2]); px(c, x + 1, y + 2, w - 2, 2, FOAMR[3]); px(c, x + 2, y + 2, 2, 1, FOAMR[4]);
    c.fillStyle = dith(c, FOAMR[1]); c.fillRect(x + 1, y + h - 3, w - 2, 2);
  };
  tear(-26, -146, 12, 8);
  px(c, -10, -196, 12, 3, '#E5E7EB'); px(c, 0, -197, 3, 5, '#D4D4D8');
  if (q.beat > 0.4) { tear(-20, -192, 18, 12); }
  if (q.beat > 0.55) {
    // (a plate of her chest hanging off, the wiring under it)
    c.fillStyle = LAT[0]; c.beginPath(); c.moveTo(20, -182); c.lineTo(44, -178); c.lineTo(32, -150); c.closePath(); c.fill();
    c.fillStyle = LAT[3]; c.beginPath(); c.moveTo(22, -180); c.lineTo(41, -177); c.lineTo(32, -154); c.closePath(); c.fill();
    px(c, 23, -180, 14, 1, LAT[4]);
    for (let k = 0; k < 3; k++) hose(c, quad(14, -186 + k * 4, 22, -170 + k * 3, 18 + k * 5, -160), 1.5, LINES[k], false);
  }
  if (q.beat > 0.7) { tear(22, -220, 12, 8); tear(-30, -132, 10, 10); if (t % 24 < 3) px(c, 16, -164, 4, 4, '#FDE047'); }
  // (the mallet's dents, one a hit)
  for (let i = 0; i < Math.min(DENTS.length, q.dents ?? 0); i++) dent(c, DENTS[i][0], DENTS[i][1], DENTS[i][2], i);
};

// ---------------------------------------------------------------------------------------------------------------
// The head: the fanned crest, the long dome (the rig through its gloss), the silver teeth, the jaws

const head = (c: Ctx, q: QueenDraw, t: number, sag: number, glow: number) => {
  const { pose } = q;
  const headDrop = sag * 60, hx = 30 + (pose === 'spit' || pose === 'leap' ? 22 : pose === 'swipe' ? 12 : 0), hy = -256 + headDrop;
  tube(c, 10, -228, hx - 6, hy + 8, 22, LAT);
  for (let k = 1; k < 4; k++) { const u = k / 4; px(c, 10 + (hx - 16) * u - 6, -228 + (hy + 36) * u - 3, 12, 1, LAT[0]); }
  c.save(); c.translate(hx, hy); c.rotate(sag * 0.7 + (pose === 'roar' ? -0.25 : 0) + (pose === 'wake' ? Math.sin(t * 0.9) * 0.08 : 0));
  const bend = pose === 'dead' ? 0.25 : 0;
  // (the crest: a flat fan back over the head, ridged, its rim scalloped, riveted on)
  const crest = () => { c.moveTo(-6, -2); c.quadraticCurveTo(-30, -70 - bend * 40, -110, -54 + bend * 40); c.quadraticCurveTo(-120, -24, -96, 4); c.quadraticCurveTo(-60, 10, -6, 6); c.closePath(); };
  shapeShade(c, crest, LAT, 2, -2.6, 2.5, -56, -22);
  c.save(); c.beginPath(); crest(); c.clip();
  for (let i = 0; i < 6; i++) {
    const ex = -40 - i * 13, ey = -54 + i * 8 + bend * 30;
    c.strokeStyle = LAT[0]; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, 0); c.lineTo(ex, ey + 2); c.stroke();
    c.strokeStyle = LAT[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, -2); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = LAT[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(-14, -3); c.lineTo(ex + 3, ey - 1); c.stroke();
  }
  // (its underside, in shadow)
  c.fillStyle = LAT[0]; c.beginPath(); c.moveTo(-100, 2); c.quadraticCurveTo(-60, 12, -6, 8); c.lineTo(-6, 2); c.quadraticCurveTo(-60, 4, -100, -4); c.closePath(); c.fill();
  c.restore();
  c.strokeStyle = RIM; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, -14); c.quadraticCurveTo(-31, -67 - bend * 40, -107, -52 + bend * 40); c.stroke();
  // (the scallops along its rim: knobs, each lit; a rivet at each)
  for (let i = 0; i < 6; i++) { const kx = -40 - i * 13, ky = -56 + i * 9 + bend * 30; blob(c, kx, ky, 4.5, 4, LAT); px(c, kx - 1, ky - 1, 2, 2, CHROME[3]); }
  // (the green from under the crest rim: their rig in her head)
  if (glow > 0) {
    rings(c, -50, 2, 60, 12, '132, 255, 80', 0.35 * glow, 0.05 * glow, 3);
    c.strokeStyle = GREEN[3]; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(-60, 4, -96, 2); c.stroke();
    c.strokeStyle = GREEN[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(-14, -4); c.quadraticCurveTo(-60, 3, -90, 1); c.stroke();
  }
  // (the dome: long, smooth, forward to the snout, eyeless; under its gloss the rig they've wired into her skull)
  const dome = () => { c.moveTo(-14, -8); c.quadraticCurveTo(8, -30, 56, -10); c.quadraticCurveTo(70, 0, 60, 10); c.lineTo(-10, 14); c.closePath(); };
  shapeShade(c, dome, LAT, 1.6, -2.2, 2.5, 24, 0);
  c.save(); c.beginPath(); dome(); c.clip();
  // (the rig, faint through the latex: a servo's ring, a board, its wires; its LED the green)
  c.strokeStyle = LAT[3]; c.lineWidth = 1.5; c.beginPath(); c.arc(8, -4, 7, 0, Math.PI * 2); c.stroke();
  px(c, 18, -8, 14, 6, LAT[2]); px(c, 18, -8, 14, 1, LAT[3]); for (let k = 0; k < 4; k++) px(c, 19 + k * 3, -5, 1, 2, LAT[4]);
  if (glow > 0) { px(c, 7, -5, 3, 3, GREEN[t % 30 < 15 ? 4 : 3]); px(c, 28, -7, 2, 2, GREEN[3]); }
  c.restore();
  // (the gloss: the long shine down the dome, the specular glint)
  c.strokeStyle = LAT[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(-8, -14); c.quadraticCurveTo(18, -26, 50, -12); c.stroke();
  c.strokeStyle = GLOSS; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-4, -15); c.quadraticCurveTo(18, -25, 46, -13); c.stroke();
  px(c, 22, -22, 4, 2, SPEC); px(c, 23, -23, 2, 1, '#FFFFFF');
  // (a crack in it, the more she's been hit)
  if (q.beat > 0.7) { c.strokeStyle = LAT[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(30, -18); c.lineTo(26, -10); c.lineTo(32, -6); c.lineTo(28, 2); c.stroke(); }
  // (past the chest's dents, the dome's: crumpled in, the rig showing through)
  const dd = (q.dents ?? 0) - DENTS.length;
  if (dd > 0) dent(c, 22, -12, 7, 1);
  if (dd > 1) dent(c, 4, -6, 6, 2);
  if (dd > 2) dent(c, 40, -6, 5, 0);
  // (the lips drawn back off the silver teeth; the lower jaw dropping)
  const jaw = q.jaw !== undefined ? Math.round(q.jaw * 20) : pose === 'roar' || pose === 'grab' ? 16 : pose === 'spit' || pose === 'leap' ? 14 : pose === 'tell' ? 8 : pose === 'hurt' ? 10 : pose === 'birth' ? 4 : pose === 'flail' ? 12 : 0;
  if (jaw > 0) {
    // (the mouth: dark, deeper in, gums up top)
    px(c, 12, 8, 46, jaw + 4, GUM[0]); px(c, 14, 8, 42, 3, GUM[2]); px(c, 14, 8, 42, 1, GUM[3]);
    c.fillStyle = dith(c, GUM[1]); c.fillRect(14, 11, 42, Math.max(0, jaw - 4));
    // (the inner jaws: three, one inside the next, out on chrome rods)
    const out = q.inner !== undefined ? q.inner : pose === 'grab' ? Math.min(1.6, (t % 24) / 5) : pose === 'roar' || pose === 'spit' || pose === 'leap' ? Math.min(1, (t % 40) / 10) : 0.3;
    for (let j = 2; j >= 0; j--) {
      const jx = 22 + out * (14 + j * 12), jy = 10 + jaw / 2 - 3, w = 12 - j * 3;
      tube(c, 18, jy + 3, jx, jy + 3, 4 - j, CHROME);
      c.fillStyle = LAT[0]; c.beginPath(); c.roundRect(jx - 1, jy - 1, w + 2, 9 - j, 2); c.fill();
      px(c, jx, jy, w, 7 - j, j % 2 ? LAT[3] : LAT[2]); px(c, jx, jy, w, 1, LAT[4]);
      for (let k = 0; k < 3; k++) px(c, jx + w - 1, jy + 1 + k * 2, 2, 1, TOOTH[4]);
    }
    if (glow > 0) { px(c, 18, 12, 6, Math.max(1, jaw - 4), `rgba(132, 255, 80, ${(0.6 * glow).toFixed(2)})`); }
  }
  // (the upper teeth: a row of silver fangs, each lit at its root, shaded at its tip)
  px(c, 12, 4, 48, 3, GUM[1]); px(c, 12, 4, 48, 1, GUM[3]);
  for (let i = 0; i < 9; i++) { const tx = 14 + i * 5; px(c, tx, 6, 3, 6, TOOTH[0]); px(c, tx, 6, 3, 4, TOOTH[2]); px(c, tx, 6, 2, 2, TOOTH[4]); px(c, tx + 1, 10, 1, 1, TOOTH[1]); }
  // (the lower jaw)
  const lj = () => c.roundRect(10, 12 + jaw, 50, 9, 3);
  shapeShade(c, lj, LAT, 0.8, -1.2, 2, 35, 16 + jaw);
  for (let i = 0; i < 8; i++) { const tx = 15 + i * 5; px(c, tx, 9 + jaw, 3, 4, TOOTH[0]); px(c, tx, 10 + jaw, 3, 3, TOOTH[2]); px(c, tx, 10 + jaw, 1, 1, TOOTH[4]); }
  // (the drool: it leaks, a glinting drop)
  const dr = t % 24;
  px(c, 50, 20 + jaw, 2, 2 + dr * 0.3, '#A3E635'); px(c, 49, 22 + jaw + dr, 4, 4, '#BEF264'); px(c, 49, 22 + jaw + dr, 1, 1, '#F7FEE7');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The big arms: long, thin, many-jointed (chrome at the bends); long fingers, claws

type Arm = { ex: number; ey: number; hx: number; hy: number; fa: number; ox: number; oy: number };
const armsOf = (pose: QueenPose, t: number, stride: number): [Arm, Arm] => {
  const base = (k: 0 | 1): Arm => {
    const ox = k ? -18 : 0, oy = k ? -8 : 0;
    if (pose === 'flail') {
      // (all four going at once: windmilling, out of step)
      const a = t * 0.55 + k * Math.PI;
      const ex = 22 + Math.cos(a) * 44, ey = -222 + Math.sin(a) * 40, b = a + 0.9;
      return { ex: ex + ox, ey: ey + oy, hx: ex + Math.cos(b) * 50 + ox, hy: ey + Math.sin(b) * 46 + oy, fa: b, ox, oy };
    }
    const [ex, ey, hx, hy] =
      pose === 'tell' || pose === 'roar' ? [50, -270, 30, -320] :
      pose === 'stalk' ? [70, -170, 110, -120 + Math.sin(stride + k) * 8] :
      pose === 'grab' ? [80, -230, 100, -250] :
      pose === 'leap' ? [76, -230, 132, -224] :
      pose === 'swipe' ? [76, -196, 140, -150] :
      pose === 'spit' ? [46, -170, 56, -130] :
      pose === 'hurt' ? [26, -232, 6, -266] :
      pose === 'dead' || pose === 'stunned' || pose === 'dormant' ? [36, -160, 40, -110] :
      [52, -176, 64, -134 + Math.sin(t * 0.08 + k) * 6];
    const fa = pose === 'swipe' || pose === 'leap' ? -0.2 : pose === 'tell' || pose === 'roar' ? -1.4 : 1.0;
    return { ex: ex + ox, ey: ey + oy, hx: hx + ox, hy: hy + oy, fa, ox, oy };
  };
  return [base(0), base(1)];
};
const arm = (c: Ctx, a0: Arm, r: Ramp, pose: QueenPose) => {
  const sx = 22 + a0.ox, sy = -222 + a0.oy;
  // (the elbow by anatomy, src/m2/art/limb.ts: her keyed elbows sat a few degrees the wrong side of the shoulder-to-hand
  // line in most poses (idle, stalk, swipe, spit, dead), so the arm hyperextended. Same bones, same hand, the elbow
  // put on the side where the forearm folds toward the front of the upper arm; she's drawn facing right)
  const [ex, ey] = elbow(sx, sy, a0.hx, a0.hy, Math.hypot(a0.ex - sx, a0.ey - sy), Math.hypot(a0.hx - a0.ex, a0.hy - a0.ey) + 0.01, 1);
  const a: Arm = { ...a0, ex, ey };
  blob(c, sx, sy, 8, 8, r);
  tube(c, sx, sy, a.ex, a.ey, 10, r);
  tube(c, a.ex, a.ey, a.hx, a.hy, 8, r);
  // (the forearm's piston, the robot under the latex)
  tube(c, a.ex + 3, a.ey + 3, (a.ex + a.hx) / 2 + 3, (a.ey + a.hy) / 2 + 3, 2.5, CHROME);
  blob(c, a.ex, a.ey, 6, 6, CHROME); px(c, a.ex - 1, a.ey - 1, 2, 2, CHROME[0]);
  blob(c, a.hx, a.hy, 6, 5, r);
  for (let i = 0; i < 4; i++) {
    const an = a.fa + (i - 1.5) * 0.32, mx = a.hx + Math.cos(an) * 14, my = a.hy + Math.sin(an) * 14, bn = an + (pose === 'grab' ? 0.6 : 0.25);
    const tx = mx + Math.cos(bn) * 12, ty = my + Math.sin(bn) * 12;
    tube(c, a.hx, a.hy, mx, my, 3.5, r);
    tube(c, mx, my, tx, ty, 3, r);
    // (the claw: chrome, hooked, a glint)
    const cx = tx + Math.cos(bn + 0.4) * 6, cy = ty + Math.sin(bn + 0.4) * 6;
    tube(c, tx, ty, cx, cy, 2, CHROME);
    px(c, cx - 1, cy - 1, 2, 2, SPEC);
  }
};
