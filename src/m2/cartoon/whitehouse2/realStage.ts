// THE REAL STAGE (the user's: "behind the projection it's a basic stage layout with NO hazards: a stage where an
// audience watched the actors projected as cartoon characters"). What the screen hid, once it's down: both halves of
// the White House drawn as what they were, a long black-box soundstage. No cartoon ink: plain shapes, real colors, under
// the work lights. Everything he stands on is what it was all along, plywood: boxes painted flat black with stenciled
// names (PIANO, PODIUM, DESK...), planks on stands for the ledges, scaffold stairs and a scaffold deck for the second
// floor; their tops lit along the edge (standable reads standable). Behind: black velour drapes in folds, the backs of
// scenery flats (raw lumber and muslin, stenciled) where the rooms changed, the pipe grid overhead with its lights hung
// off it, cable runs, the show's TV cameras on their pedestals in the wings. In front, under the stage's lip: the empty
// front row (the audience ran: popcorn, a foam finger). One eye, as the cartoon's (the middle of the screen).
//
// Each half hands its own plan (its boxes, planks, stairs, flats): whitehouse1/index.ts and whitehouse2/index.ts.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { box, mix, hash, onScreen, type Ctx } from '../kit';
import { GY } from '../geometry';

type P = { x: number; y: number };
const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };
const quad = (c: Ctx, pts: P[], fill: string) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = fill; c.fill(); };

const PLY = '#B88B5A', PLY_DK = '#8C6640', BLACK = '#1B1A1F', BLACK_LT = '#2C2A31', LIP = '#E7E2D6', STEEL = '#6B7280', STEEL_LT = '#9CA3AF';
const STENCIL = { sx: 1, sy: 1, stencil: true, fill: ['#E5E7EB', '#D1D5DB'] };
const STENCIL_DK = { sx: 1, sy: 1, stencil: true, fill: ['#1F2937', '#111827'] };

/** What a half's stage is made of (world x; heights as world y tops). */
export interface StagePlan {
  /** The span it covers (world x). */
  a: number; b: number;
  /** The floor's top under world x (the second floor's deck where there is one). */
  floorAt: (x: number) => number;
  /** Solid plywood boxes: [from, to, top y, its stenciled name]. */
  boxes: [number, number, number, string][];
  /** Planks on stands (the one-way ledges): [from, to, top y]. */
  planks: [number, number, number][];
  /** Scaffold stairs up from the stage floor to a deck: from, to, the steps, the deck's top y. */
  stairs?: { a: number; b: number; n: number; top: number };
  /** Scaffold decks (the second floor): [from, to, top y]. */
  decks: [number, number, number][];
  /** Scenery flats' backs (where the rooms changed): [x, their stencil]. */
  flats: [number, string][];
  /** Spike-tape names on the floor (where each room's set stood): [x, words]. */
  marks: [number, string][];
  /** The show's TV cameras in the wings: x. */
  cameras: number[];
}

// ---------------------------------------------------------------------------------------------------------------
// Behind

/** Screen space: the dark of the building (nothing of the sky: it's indoors). */
export const drawStageBackdrop = (c: Ctx, state: GameState) => {
  box(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#0C0B10');
  // (the far wall's drapes, barely seen, drifting with him a little)
  const off = -((state.camera.x * 0.3) % 40);
  for (let x = off; x < CANVAS_WIDTH; x += 40) { box(c, x, 0, 14, CANVAS_HEIGHT, '#111018'); box(c, x + 14, 0, 4, CANVAS_HEIGHT, '#15131D'); }
  return true;
};

/** The pipe grid, the drapes, the floor going back, the flats, the cameras (world, behind him). */
export const drawStageShell = (c: Ctx, state: GameState, plan: StagePlan) => {
  const E = eyeOf(state), D = 0.8;
  const v0 = state.camera.x - 200, v1 = state.camera.x + CANVAS_WIDTH + 200;
  const a = Math.max(plan.a, v0 - 600), b = Math.min(plan.b, v1 + 600);
  if (a >= b) return;
  const top = GY - 900;
  // (the drapes on the back wall: black velour in folds, the hems on the floor)
  atDepth(c, E, D, () => {
    box(c, a - 400, top, b - a + 800, GY - top, BLACK);
    for (let x = Math.floor((a - 400) / 46) * 46; x < b + 400; x += 46) { box(c, x, top, 18, GY - top, BLACK_LT); box(c, x + 18, top, 3, GY - top, '#35323B'); }
    box(c, a - 400, GY - 14, b - a + 800, 14, '#141318');
    // (the pipe grid up top, its lights: lekos and fresnels hung off it, cables looped)
    const gy = GY - 640;
    box(c, a - 400, gy, b - a + 800, 5, STEEL); box(c, a - 400, gy, b - a + 800, 1, STEEL_LT);
    for (let x = Math.floor(a / 160) * 160; x < b; x += 160) {
      const k = hash(x * 0.01);
      box(c, x - 1, gy + 5, 3, 10, STEEL);
      if (k < 0.5) { c.save(); c.translate(x, gy + 22); c.rotate(0.5 + k); box(c, -7, -6, 22, 12, '#27272A'); box(c, 15, -5, 4, 10, '#3F3F46'); box(c, 18, -3, 2, 6, '#FEF3C7'); c.restore(); }
      else { box(c, x - 9, gy + 14, 18, 16, '#27272A'); box(c, x - 7, gy + 30, 14, 3, '#FEF3C7'); }
      c.strokeStyle = '#0A0A0D'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, gy + 6); c.quadraticCurveTo(x + 80, gy + 60, x + 156, gy + 6); c.stroke();
    }
  });
  // (the stage floor going back: black plywood, scuffed, the spike tape)
  quad(c, [proj(E, a - 200, GY, D), proj(E, b + 200, GY, D), proj(E, b + 200, GY, 1), proj(E, a - 200, GY, 1)], '#232128');
  for (let x = Math.floor(a / 120) * 120; x < b; x += 120) {
    const p0 = proj(E, x, GY, D), p1 = proj(E, x, GY, 1);
    c.strokeStyle = '#2E2C34'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
  }
  for (const [x, words] of plan.marks) {
    if (x < v0 - 200 || x > v1 + 200) continue;
    const p = proj(E, x, GY, D + (1 - D) * 0.35);
    box(c, p.x - 34, p.y - 2, 68, 5, '#E5E7EB');
    c.save(); c.translate(p.x, p.y); c.scale(1, 0.6); signText(c, words, 0, 1, STENCIL_DK); c.restore();
    box(c, p.x - 44, p.y - 1, 6, 3, '#FDE047'); box(c, p.x + 38, p.y - 1, 6, 3, '#F472B6');
  }
  // (the scenery flats' backs: lumber frames, muslin, stenciled; propped on braces)
  atDepth(c, E, 0.88, () => {
    for (const [x, name] of plan.flats) {
      if (x < v0 - 300 || x > v1 + 300) continue;
      const h = 420, w = 150, fy = GY;
      box(c, x - w / 2, fy - h, w, h, '#C9BFA8');
      box(c, x - w / 2, fy - h, w, 8, PLY); box(c, x - w / 2, fy - 8, w, 8, PLY); box(c, x - w / 2, fy - h, 8, h, PLY); box(c, x + w / 2 - 8, fy - h, 8, h, PLY);
      box(c, x - w / 2, fy - h / 2 - 4, w, 8, PLY);
      c.strokeStyle = PLY_DK; c.lineWidth = 6; c.beginPath(); c.moveTo(x - w / 2 + 8, fy - 8); c.lineTo(x + w / 2 - 8, fy - h / 2); c.stroke();
      signText(c, name, x, fy - h + 70, STENCIL_DK);
      c.strokeStyle = PLY_DK; c.lineWidth = 5; c.beginPath(); c.moveTo(x + w / 2, fy - h * 0.6); c.lineTo(x + w / 2 + 70, fy); c.stroke();
      box(c, x + w / 2 + 56, fy - 14, 24, 14, '#4B5563');
    }
    // (the show's TV cameras on their pedestals, dark, abandoned)
    for (const x of plan.cameras) {
      if (x < v0 - 200 || x > v1 + 200) continue;
      tvCamera(c, x, GY);
    }
  });
};
const tvCamera = (c: Ctx, x: number, fy: number) => {
  box(c, x - 26, fy - 10, 52, 10, '#27272A');
  for (const dx of [-22, 18]) box(c, x + dx, fy - 4, 6, 4, '#0A0A0D');
  box(c, x - 4, fy - 110, 8, 100, STEEL);
  box(c, x - 34, fy - 160, 62, 44, '#3F3F46'); box(c, x - 34, fy - 160, 62, 4, '#52525B');
  box(c, x + 28, fy - 152, 22, 28, '#27272A'); box(c, x + 48, fy - 148, 4, 20, '#60A5FA');
  box(c, x - 46, fy - 154, 14, 18, '#18181B');
  c.strokeStyle = '#18181B'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 10, fy - 116); c.lineTo(x - 50, fy - 100); c.stroke();
  c.strokeStyle = '#0A0A0D'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, fy - 2); c.quadraticCurveTo(x - 60, fy + 2, x - 140, fy - 1); c.stroke();
  signText(c, 'CAM 2', x - 3, fy - 132, STENCIL);
};

// ---------------------------------------------------------------------------------------------------------------
// In the play plane: what he stands on

const lit = (c: Ctx, x: number, y: number, w: number) => { box(c, x + 1, y, w - 2, 2, LIP); box(c, x + 4, y, w * 0.35, 1, '#FFFFFF'); };
/** A plywood box, painted black, its stencil, its lit top. */
export const stageBox = (c: Ctx, a: number, b: number, top: number, fy: number, name: string) => {
  const w = b - a;
  box(c, a, top, w, fy - top, BLACK_LT);
  box(c, a, top, w, 4, '#3A3740');
  box(c, a, top, 3, fy - top, '#36333C'); box(c, b - 3, top, 3, fy - top, '#18171B');
  // (the plywood showing at the scuffed corners, screws)
  box(c, a, fy - 6, 8, 6, PLY_DK); box(c, b - 7, top + 4, 7, 5, PLY_DK);
  c.fillStyle = '#6B7280'; for (const [dx, dy] of [[6, 8], [w - 8, 8], [6, fy - top - 10], [w - 8, fy - top - 10]]) if (dy > 6 && dy < fy - top) c.fillRect(a + dx, top + dy, 2, 2);
  if (name && fy - top > 26) signText(c, name, (a + b) / 2, Math.min(fy - 12, top + 24), STENCIL);
  lit(c, a, top, w);
};
/** A plank on two stands (a one-way ledge). */
export const stagePlank = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  for (const x of [a + 12, b - 16]) { box(c, x, top + 10, 4, fy - top - 10, STEEL); box(c, x - 8, fy - 3, 20, 3, '#3F3F46'); }
  box(c, a, top, b - a, 10, PLY); box(c, a, top + 8, b - a, 2, PLY_DK);
  lit(c, a, top, b - a);
};
/** Scaffold stairs (treads lit along their noses), a handrail. */
export const scaffoldStairs = (c: Ctx, a: number, b: number, n: number, fy: number, top: number) => {
  const w = (b - a) / n, rise = (fy - top) / n;
  c.strokeStyle = STEEL; c.lineWidth = 5; c.beginPath(); c.moveTo(a, fy); c.lineTo(b, top); c.stroke();
  c.strokeStyle = STEEL_LT; c.lineWidth = 2; c.beginPath(); c.moveTo(a, fy - 80); c.lineTo(b, top - 80); c.stroke();
  for (let k = 0; k <= n; k += 3) { const x = a + k * w, y = fy - k * rise; box(c, x - 1, y - 80, 3, 80, STEEL); }
  for (let k = 1; k <= n; k++) {
    const x = a + (k - 1) * w, y = fy - k * rise;
    box(c, x, y, w, 5, '#4B5563');
    box(c, x, y, w, 1.5, LIP);
    box(c, x, y + 5, 2, rise, '#1F2937');
  }
};
/** A scaffold deck (the second floor): plywood on a steel frame, cross braces under, lit along its edge. */
export const scaffoldDeck = (c: Ctx, a: number, b: number, top: number, fy: number) => {
  box(c, a, top, b - a, 12, PLY); box(c, a, top + 10, b - a, 3, PLY_DK);
  for (let x = a + 10; x < b; x += 110) {
    box(c, x, top + 12, 5, fy - top - 12, STEEL);
    if (x + 110 < b) { c.strokeStyle = STEEL; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, top + 16); c.lineTo(x + 110, fy - 6); c.moveTo(x + 4, fy - 6); c.lineTo(x + 110, top + 16); c.stroke(); }
  }
  lit(c, a, top, b - a);
};
/** The whole play plane of a half's plan (behind him). */
export const drawStageProps = (c: Ctx, state: GameState, plan: StagePlan) => {
  const ok = (a: number, b: number) => onScreen(state, a - 40, b + 40);
  for (const [a, b, top] of plan.decks) if (ok(a, b)) scaffoldDeck(c, a, b, top, GY);
  if (plan.stairs && ok(plan.stairs.a, plan.stairs.b)) scaffoldStairs(c, plan.stairs.a, plan.stairs.b, plan.stairs.n, GY, plan.stairs.top);
  for (const [a, b, top] of plan.planks) if (ok(a, b)) stagePlank(c, a, b, top, plan.floorAt((a + b) / 2));
  for (const [a, b, top, name] of plan.boxes) if (ok(a, b)) stageBox(c, a, b, top, plan.floorAt((a + b) / 2), name);
  // (the stage floor's lit front edge)
  const v0 = Math.max(plan.a, state.camera.x - 60), v1 = Math.min(plan.b, state.camera.x + CANVAS_WIDTH + 60);
  if (v0 < v1) { box(c, v0, GY, v1 - v0, 60, '#161519'); box(c, v0, GY, v1 - v0, 2, LIP); for (let x = Math.ceil(v0 / 300) * 300; x < v1; x += 300) box(c, x, GY + 6, 3, 8, '#38BDF8'); }
};

// ---------------------------------------------------------------------------------------------------------------
// In front: the empty front row under the stage's lip

/** The front row's seat backs (world, in front of him, below the stage's lip): red velour, empty; what the audience
 *  dropped running. */
export const drawSeats = (c: Ctx, state: GameState, a: number, b: number) => {
  const v0 = Math.max(a, state.camera.x - 40), v1 = Math.min(b, state.camera.x + CANVAS_WIDTH + 40);
  if (v0 >= v1) return;
  const y = GY + 26;
  box(c, v0, y + 14, v1 - v0, 60, '#0D0C10');
  for (let x = Math.floor(v0 / 54) * 54; x < v1; x += 54) {
    box(c, x + 4, y, 44, 30, '#5A1A22'); box(c, x + 4, y, 44, 4, '#7A2A33'); box(c, x + 6, y + 4, 2, 24, '#6B222B');
    const k = hash(x * 0.013);
    // (popcorn, a foam finger, a juice box, a balloon on a string: dropped running)
    if (k < 0.12) { box(c, x + 18, y - 10, 12, 12, '#F8FAFC'); box(c, x + 18, y - 10, 3, 12, '#DC2626'); box(c, x + 24, y - 10, 3, 12, '#DC2626'); box(c, x + 18, y - 13, 12, 3, '#FDE68A'); }
    else if (k < 0.2) { c.save(); c.translate(x + 28, y - 2); c.rotate(-0.5); box(c, -5, -22, 10, 24, '#8B5CF6'); box(c, -2, -30, 4, 9, '#8B5CF6'); c.restore(); }
    else if (k < 0.26) { box(c, x + 20, y - 8, 9, 10, '#22C55E'); box(c, x + 26, y - 13, 1.5, 6, '#F8FAFC'); }
    else if (k < 0.3) { c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 26, y); c.quadraticCurveTo(x + 20, y - 40, x + 30, y - 70); c.stroke(); c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(x + 30, y - 80, 9, 11, 0, 0, Math.PI * 2); c.fill(); }
  }
};

/** The stage door (the way out, far right): a steel door, a push bar, the EXIT sign lit red over it, STAGE DOOR
 *  stenciled. */
export const drawStageDoor = (c: Ctx, a: number, b: number, fy: number) => {
  const w = b - a;
  box(c, a - 10, fy - 220, w + 20, 220, '#2A2830');
  box(c, a, fy - 200, w, 200, '#4B5563'); box(c, a, fy - 200, w, 4, '#6B7280'); box(c, a + w / 2 - 1, fy - 200, 2, 200, '#374151');
  box(c, a + 12, fy - 100, w - 24, 8, '#9CA3AF'); box(c, a + 12, fy - 100, w - 24, 2, '#D1D5DB');
  signText(c, 'STAGE DOOR', a + w / 2, fy - 150, STENCIL);
  // (the EXIT sign: a lit red box over it)
  box(c, a + w / 2 - 34, fy - 262, 68, 28, '#7F1D1D'); box(c, a + w / 2 - 31, fy - 259, 62, 22, '#B91C1C');
  signText(c, 'EXIT', a + w / 2, fy - 243, { sx: 2, sy: 2, fill: ['#FEE2E2', '#FCA5A5'] });
};

/** The fallen screen: its aluminum frame bent, the white fabric heaped over the stage's lip into the pit (world, in
 *  front). */
export const drawFallenScreen = (c: Ctx, a: number, b: number, fy: number) => {
  const w = b - a;
  // (the frame: bent bars sticking up out of it)
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(a + 20, fy + 30); c.lineTo(a + 60, fy - 30); c.lineTo(a + 90, fy - 22); c.stroke();
  c.beginPath(); c.moveTo(b - 40, fy + 26); c.lineTo(b - 20, fy - 40); c.stroke();
  // (the fabric heaped, its folds)
  c.fillStyle = '#C9C6CF'; c.beginPath(); c.moveTo(a - 20, fy + 50);
  for (let k = 0; k <= 16; k++) { const x = a - 20 + (k / 16) * (w + 40), hh = 10 + hash(k * 3.3) * 22; c.quadraticCurveTo(x - (w + 40) / 32, fy - hh, x, fy + 2 - hh * 0.3); }
  c.lineTo(b + 20, fy + 50); c.closePath(); c.fill();
  c.fillStyle = '#E8E6EC'; for (let k = 0; k < 14; k++) { const x = a + (k / 14) * w + hash(k) * 20, hh = 8 + hash(k * 7) * 16; c.beginPath(); c.ellipse(x, fy - hh * 0.5, 16, hh * 0.5, 0, Math.PI, 0); c.fill(); }
  c.fillStyle = '#A9A5B2'; for (let k = 0; k < 10; k++) { const x = a + hash(k * 13) * w; box(c, x, fy - 4, 3, 30, '#A9A5B2'); }
  // (a torn corner of the picture still on it: a bit of the cartoon's wallpaper)
  c.fillStyle = 'rgba(253, 230, 138, 0.35)'; c.beginPath(); c.ellipse(a + w * 0.3, fy - 6, 40, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(29, 78, 216, 0.25)'; c.beginPath(); c.ellipse(a + w * 0.7, fy - 4, 50, 7, 0, 0, Math.PI * 2); c.fill();
};

/** The projector rig: a truss tower at the stage's corner, the 1994 three-lens video projector up on it (red, green,
 *  blue). `on` its lenses lit; `broken` knocked crooked and smoking. */
export const drawProjectorRig = (c: Ctx, x: number, fy: number, f: number, on: boolean, broken: boolean) => {
  const h = 380;
  // (the truss tower)
  for (const dx of [-16, 16]) box(c, x + dx - 2, fy - h, 4, h, STEEL_LT);
  c.strokeStyle = STEEL; c.lineWidth = 2; c.beginPath();
  for (let y = fy; y > fy - h; y -= 30) { c.moveTo(x - 16, y); c.lineTo(x + 16, y - 30); c.moveTo(x + 16, y); c.lineTo(x - 16, y - 30); }
  c.stroke();
  box(c, x - 26, fy - 8, 52, 8, '#3F3F46');
  // (the projector: a big black box on a yoke, three fat lenses in a row)
  c.save(); c.translate(x, fy - h - 30); c.rotate(broken ? 0.35 : 0.12);
  box(c, -40, -26, 90, 52, '#1C1B20'); box(c, -40, -26, 90, 5, '#2E2C34');
  for (let k = 0; k < 3; k++) {
    const ly = -14 + k * 14, col = ['#EF4444', '#22C55E', '#3B82F6'][k];
    box(c, 50, ly - 6, 12, 12, '#0A0A0D');
    c.fillStyle = on ? col : mix(col, '#0A0A0D', 0.75); c.beginPath(); c.arc(60, ly, 5, 0, Math.PI * 2); c.fill();
    if (on) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(61, ly - 1, 1.5, 0, Math.PI * 2); c.fill(); }
  }
  signText(c, 'VIDEO-MAX 3000', 4, 16, STENCIL);
  c.restore();
  if (broken) {
    // (smoke off it, a spark now and then)
    for (let k = 0; k < 4; k++) { const t = ((f + k * 17) % 68) / 68; c.fillStyle = `rgba(120,116,128,${0.5 * (1 - t)})`; c.beginPath(); c.arc(x + 20 + Math.sin(t * 4 + k) * 8, fy - h - 50 - t * 90, 6 + t * 14, 0, Math.PI * 2); c.fill(); }
    if (f % 90 < 4) { c.fillStyle = '#FDE68A'; for (let k = 0; k < 5; k++) c.fillRect(x + 50 + hash(f + k) * 20, fy - h - 40 + hash(f * 3 + k) * 20, 2, 2); }
  }
};

/** The real stage's lighting (the work lights up: soft, all over; a glow about him). */
export const realLight = (state: GameState, lights: Light[]) => {
  const p = state.player;
  return { dark: 0.44, shade: [10, 9, 14] as [number, number, number], rim: 0.5, lights: [...lights, { x: p.pos.x + p.width / 2, y: p.pos.y + 10, r: 150, a: 0.35 }] };
};
/** The work lights' and the exit sign's lights (the real stage's lighting: soft, all over). */
export const stageLights = (state: GameState, a: number, b: number, extra: Light[] = []): Light[] => {
  const out: Light[] = [];
  const v0 = state.camera.x - 500, v1 = state.camera.x + CANVAS_WIDTH + 500;
  for (let x = Math.ceil(Math.max(a, v0) / 320) * 320; x < Math.min(b, v1); x += 320) out.push({ x, y: GY - 560, r: 520, a: 0.5, color: '#FFF1D6' });
  return [...out, ...extra];
};
