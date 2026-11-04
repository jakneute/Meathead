// TEST YOUR PLUNGE's close shot (plunge.ts), the owner's: "a special view of the action as you're doing it. like a view
// from meathead from behind plunging a toilet, his ass crack showing as he works on the toilet. special frames of
// animation for it", then "it's like test your might from mortal kombat. the front of the toilet is seen while meathead
// is on his knees plunging it", "there should be a shitty and nude version", "and all armor combinations too".
//
// The whole screen while it's on: the camera low behind him, ON HIS KNEES on the Godfather's plinth, his back and his
// crack in the foreground, the FRONT of the Godfather's Clog beyond him (the avocado bowl, its foot, the shag-covered
// lid up, the tank, the orange and the cannoli on it), the plunger down in the murk in both his fists.
//
// The frames (PlungePose): READY (set), DOWN (the push: the cup squashed flat, the murk slopping, his back rounded over
// it), UP (the pull: the cup stretched on its suction, his back flexed, the jeans riding further down), WOBBLE left and
// right (fighting it), YANK (the big pull: the cup popped up out of it trailing gunk, him heaved back), FAIL (it blows
// back up in his face), WIN (the clog's gone: the plunger raised high). Each in three pants (clean: the jeans riding
// down, the crack; shitty: the seat soaked through, the stink coming up off it, the flies; nude: the full moon, white
// as the rest of him is brown), his glasses on, and whatever of Ben's armor he's got (upgrades/walkArmor.ts: the same
// back-view pieces as the walk-ins, at his size here; the cape splits down his spine and stops above the belt, so the
// crack's always out).
//
// The figure's in the walk-away's own units (walkAway/meatheadBack.ts: the same build, the same ramps, his limbs one
// mass each from walkAway/flesh.ts, elbows and knees from art/limb.ts), drawn 1.25x into the picture; the picture's
// 400 x 300, 2x on the screen. Painted once: a frame's painted the first time it's wanted (the pose, the pants, the
// armor he's got: so only the combinations he wears ever get painted), then kept; live only the flies and the shake.

import { type Ctx, INK, box, lump, poly, mix, stipple, hash } from '../../walkAway/kit';
import { SKIN, JEANS, BOOT, BELT, GOLD, HAIR, BAND } from '../../walkAway/meathead';
import { armOf, flesh, foreLines, upperLines, wristband, type Mass } from '../../walkAway/flesh';
import { walkBoot, walkShin, walkShoulder, walkForearm, walkFist, walkHelmet, walkAmulet, walkCapeBack } from '../../upgrades/walkArmor';
import { ownedPieces } from '../../upgrades/state';
import { kneeFront, elbowFront, elbow, type P2 } from '../../art/limb';

export type PlungePose = 'ready' | 'down' | 'up' | 'wobL' | 'wobR' | 'yank' | 'fail' | 'win';
export type PlungePants = 'clean' | 'shitty' | 'nude';
export const PLUNGE_POSES: PlungePose[] = ['ready', 'down', 'up', 'wobL', 'wobR', 'yank', 'fail', 'win'];

/** The picture (its own pixels), drawn 2x: the whole screen. */
export const VIEW_W = 400, VIEW_H = 300, VIEW_S = 2;
/** His figure's units into the picture; where his origin (the floor under his knees) sits. */
const FK = 1.25, OX = 150, OY = 292;

/** Where the sun never gets (walkAway/meatheadBack.ts's). */
const PALE = ['#A2704C', '#C9946A', '#E4B890', '#F3D0AC', '#FFE8CE'];
const SACK = ['#4A2812', '#7A4626', '#9A5C36', '#B4744A', '#CC8C60'];
const STAIN = ['#3A2208', '#5C3A16', '#7A5224', '#9A6A34'];
/** The Godfather's avocado (shrine.ts BODY[1]), the chrome, the murk, the shag. */
const AVO = ['#3A4416', '#5A6A22', '#7A8C30', '#9CAE3E', '#BCCC6A', '#DCE6A4'];
const CHR = ['#3F4650', '#6B7480', '#9AA3AE', '#C8D0DA', '#EEF2F6'];
const MURK = ['#2A2810', '#3E3C18', '#5E5628', '#7A7236', '#9A9250', '#BCB474'];
const SHAG = ['#3A2410', '#5A3818', '#7A4E22', '#8A5A26', '#A8743A', '#C89452'];
const POO = ['#1E1006', '#3A220C', '#5C3A16', '#7A4E1E', '#9A6A2E', '#BC8A48'];
const WOOD = ['#4A2C06', '#6E4410', '#A16207', '#C08020', '#DCA448'];
const RUB = ['#450A0A', '#7F1D1D', '#B91C1C', '#DC2626', '#F87171', '#FCA5A5'];
const SWEAT = '#DDF2FF';

interface Pose {
  /** The cup: how deep (+ down), how squashed (+ flat, - stretched); the handle's tilt. */
  cup: number; sq: number; tilt: number;
  /** His shoulders and head (dx, dy), his seat (dy), the jeans' extra slide, how hard he's straining (0..1). */
  lx: number; ly: number; hip: number; sag: number; strain: number;
  fx: 'none' | 'slosh' | 'pop' | 'burst' | 'win';
}
const POSES: Record<PlungePose, Pose> = {
  ready: { cup: 0, sq: 0, tilt: 0, lx: 0, ly: 0, hip: 0, sag: 0, strain: 0, fx: 'none' },
  down: { cup: 3, sq: 1, tilt: 0, lx: 3, ly: 6, hip: -2, sag: 0, strain: 0.3, fx: 'slosh' },
  up: { cup: -9, sq: -1, tilt: 0, lx: -2, ly: -5, hip: 2, sag: 3, strain: 0.7, fx: 'none' },
  wobL: { cup: -5, sq: -0.5, tilt: -0.16, lx: -6, ly: -2, hip: 1, sag: 2, strain: 0.6, fx: 'none' },
  wobR: { cup: -5, sq: -0.5, tilt: 0.16, lx: 6, ly: -2, hip: 1, sag: 2, strain: 0.6, fx: 'none' },
  yank: { cup: -24, sq: -1.4, tilt: -0.08, lx: -4, ly: -11, hip: 4, sag: 6, strain: 1, fx: 'pop' },
  fail: { cup: -6, sq: -0.4, tilt: -0.1, lx: -7, ly: -7, hip: 3, sag: 3, strain: 0.5, fx: 'burst' },
  win: { cup: 0, sq: 0, tilt: 0, lx: -2, ly: -10, hip: 2, sag: 4, strain: 0.8, fx: 'win' },
};

const ellF = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string | CanvasPattern) => { if (rx <= 0 || ry <= 0) return; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
const path = (g: Ctx, pts: number[][]) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };

// ---------------------------------------------------------------------------------------------------------------
// The backdrop (painted once): the shrine's back wall in the dark (velvet, banded down), the spotlight on the toilet,
// the marble plinth he's kneeling on (tiles going off, lit along its far edge)

let bgCv: HTMLCanvasElement | null = null;
const backdrop = (): HTMLCanvasElement => {
  if (bgCv) return bgCv;
  const cv = document.createElement('canvas'); cv.width = VIEW_W; cv.height = VIEW_H;
  const g = cv.getContext('2d')!;
  // (the velvet: maroon, banded darker up toward the dark, its folds)
  const V = ['#12040A', '#1E0810', '#2C0C16', '#3C121E', '#4E1A28', '#622434'];
  for (let k = 0; k < 6; k++) box(g, 0, k * 26, VIEW_W, 27, V[k]);
  for (let k = 0; k < 5; k++) { g.fillStyle = stipple(g, V[k + 1], k & 1); g.fillRect(0, k * 26 + 22, VIEW_W, 4); }
  for (let x = 6; x < VIEW_W; x += 22) { box(g, x, 0, 3, 158, 'rgba(0,0,0,0.25)'); box(g, x + 3, 0, 1, 158, 'rgba(255,180,200,0.06)'); }
  // (the spotlight, stepped, on the toilet's spot)
  for (const [r, a] of [[150, 0.06], [118, 0.07], [88, 0.08], [60, 0.09]] as const) { g.fillStyle = `rgba(255, 232, 170, ${a})`; g.beginPath(); g.ellipse(OX + TX * FK, 120, r, r * 0.9, 0, 0, Math.PI * 2); g.fill(); }
  // (the gold molding along the wall's foot)
  box(g, 0, 152, VIEW_W, 6, '#5A3A06'); box(g, 0, 152, VIEW_W, 2, '#C08414'); box(g, 0, 152, VIEW_W, 1, '#FDE047');
  // (the plinth: marble tiles off into the distance, banded lighter toward us, the veins, the far edge lit)
  const M = ['#6E6660', '#867E76', '#9E968C', '#B6AEA2', '#CEC6BA', '#E4DED2'];
  for (let k = 0; k < 6; k++) box(g, 0, 158 + k * 24, VIEW_W, 25, M[k]);
  for (let k = 0; k < 5; k++) { g.fillStyle = stipple(g, M[k + 1], k & 1); g.fillRect(0, 158 + k * 24 + 21, VIEW_W, 3); }
  box(g, 0, 158, VIEW_W, 1, '#F4EEE2');
  // (the tile lines: going off to the toilet's middle)
  g.strokeStyle = 'rgba(60, 50, 44, 0.45)'; g.lineWidth = 1;
  const vx = OX + TX * FK;
  for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(vx + k * 22, 158); g.lineTo(vx + k * 80, VIEW_H); g.stroke(); }
  for (const y of [166, 180, 200, 228, 266]) { g.beginPath(); g.moveTo(0, y); g.lineTo(VIEW_W, y); g.stroke(); }
  for (let i = 0; i < 14; i++) { const x = hash(i * 3.1) * VIEW_W, y = 170 + hash(i * 7.7) * 120; g.strokeStyle = 'rgba(80, 70, 66, 0.35)'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y + 4, x + 26, y - 2); g.stroke(); }
  bgCv = cv;
  return cv;
};

// ---------------------------------------------------------------------------------------------------------------
// The Godfather's Clog, front on (his units: its middle at TX, its foot on the floor at TF, further off than him)

const TX = 88, TF = -52, RIM_Y = -112;
/** It painted smaller and lower than that (further off than him, its rim down at his belly), its foot on the floor at
 *  TFW: the rim at RIMW. */
const TKS = 0.8, TFW = -40, RIMW = TFW + TKS * (RIM_Y - TF);
const toilet = (g: Ctx, clear: boolean) => {
  // (its shadow on the plinth)
  ellF(g, TX, TF, 34, 5, 'rgba(20, 10, 14, 0.35)');
  // The tank: rounded, banded across from the lit left, its lid overhanging, the flush lever on its left
  g.fillStyle = INK; g.beginPath(); g.roundRect(TX - 37, -190, 74, 66, 4); g.fill();
  g.save(); g.beginPath(); g.roundRect(TX - 36, -189, 72, 64, 3); g.clip();
  box(g, TX - 36, -190, 72, 66, AVO[3]);
  box(g, TX - 36, -190, 12, 66, AVO[4]); g.fillStyle = stipple(g, AVO[4], 1); g.fillRect(TX - 24, -190, 3, 66);
  box(g, TX - 33, -184, 2, 40, AVO[5]);
  box(g, TX + 22, -190, 14, 66, AVO[2]); g.fillStyle = stipple(g, AVO[2]); g.fillRect(TX + 19, -190, 3, 66);
  box(g, TX + 32, -190, 4, 66, AVO[1]);
  g.restore();
  g.fillStyle = INK; g.beginPath(); g.roundRect(TX - 41, -199, 82, 12, 3); g.fill();
  box(g, TX - 40, -198, 80, 10, AVO[3]); box(g, TX - 40, -198, 80, 2, AVO[5]); box(g, TX - 40, -196, 80, 2, AVO[4]); box(g, TX - 40, -190, 80, 2, AVO[1]);
  box(g, TX - 40, -198, 10, 10, AVO[4]); box(g, TX + 30, -198, 10, 10, AVO[2]);
  // (the flush lever: a chrome escutcheon, the handle off it)
  ellF(g, TX - 28, -178, 4, 4, INK); ellF(g, TX - 28, -178, 3, 3, CHR[2]); box(g, TX - 29, -179, 1, 1, CHR[4]);
  box(g, TX - 26, -180, 9, 4, INK); box(g, TX - 25, -179, 7, 2, CHR[3]); box(g, TX - 25, -179, 7, 1, CHR[4]);
  // (on the tank lid: an orange (1972), a cannoli)
  ellF(g, TX - 12, -205, 7, 7, INK); ellF(g, TX - 12, -205, 6, 6, '#C2410C'); ellF(g, TX - 14, -207, 4, 3.5, '#EA580C'); box(g, TX - 16, -209, 2, 2, '#FDBA74'); box(g, TX - 12, -212, 2, 2, '#365314');
  g.fillStyle = INK; g.beginPath(); g.roundRect(TX + 6, -205, 24, 8, 4); g.fill();
  box(g, TX + 7, -204, 22, 6, '#D6A25A'); box(g, TX + 7, -204, 22, 2, '#F0C888'); box(g, TX + 7, -200, 22, 1, '#9A6A2E');
  ellF(g, TX + 6, -201, 3, 3, '#FFF7E6'); ellF(g, TX + 30, -201, 3, 3, '#FFF7E6'); box(g, TX + 14, -203, 1, 1, '#3A220C'); box(g, TX + 20, -202, 1, 1, '#3A220C');

  // The lid, up against the tank: in its shag cover (1972), the fibers dithered, its rim lit
  const lid = () => { g.beginPath(); g.moveTo(TX - 28, RIM_Y - 4); g.lineTo(TX - 30, -152); g.quadraticCurveTo(TX - 28, -182, TX, -184); g.quadraticCurveTo(TX + 28, -182, TX + 30, -152); g.lineTo(TX + 28, RIM_Y - 4); g.closePath(); };
  lid(); g.fillStyle = INK; g.fill();
  g.save(); g.beginPath(); g.moveTo(TX - 27, RIM_Y - 4); g.lineTo(TX - 29, -152); g.quadraticCurveTo(TX - 27, -181, TX, -183); g.quadraticCurveTo(TX + 27, -181, TX + 29, -152); g.lineTo(TX + 27, RIM_Y - 4); g.closePath(); g.clip();
  box(g, TX - 32, -186, 64, 76, SHAG[2]);
  box(g, TX - 32, -186, 14, 76, SHAG[3]); box(g, TX + 18, -186, 14, 76, SHAG[1]);
  for (let y = -184; y < RIM_Y - 3; y++) for (let x = TX - 30; x < TX + 30; x += 1) { const h = hash(x * 7.1 + y * 3.3); if (h < 0.18) box(g, x, y, 1, 1, SHAG[0]); else if (h > 0.86) box(g, x, y, 1, 1, SHAG[4]); else if (h > 0.97) box(g, x, y, 1, 1, SHAG[5]); }
  g.restore();

  // The seat and rim: an avocado ring seen from just above, the bowl's opening, the murk brimming up in it
  ellF(g, TX, RIM_Y, 45, 11, INK);
  ellF(g, TX, RIM_Y, 44, 10, AVO[2]); ellF(g, TX - 3, RIM_Y - 1, 40, 8, AVO[3]); ellF(g, TX - 10, RIM_Y - 3, 24, 4, AVO[4]); box(g, TX - 26, RIM_Y - 7, 12, 1, AVO[5]);
  ellF(g, TX, RIM_Y - 1, 32, 6.5, INK);
  if (clear) {
    ellF(g, TX, RIM_Y - 1, 31, 5.6, '#9EC2B4'); ellF(g, TX - 6, RIM_Y - 2, 18, 2.6, '#C8E6DA'); box(g, TX - 18, RIM_Y - 3, 8, 1, '#F0FFF8');
    g.strokeStyle = '#6A5222'; g.lineWidth = 1; g.beginPath(); g.ellipse(TX, RIM_Y - 1, 30, 5, 0, Math.PI, Math.PI * 2); g.stroke();
  } else {
    ellF(g, TX, RIM_Y - 1, 31, 5.6, MURK[2]); ellF(g, TX - 4, RIM_Y - 2, 22, 3.2, MURK[3]);
    g.fillStyle = stipple(g, MURK[4], 1); g.fillRect(TX - 24, RIM_Y - 4, 30, 2);
    // (floaters, the sodden wad of paper)
    for (const [fx, fy, r] of [[TX + 14, RIM_Y - 1, 3.4], [TX - 18, RIM_Y, 2.6], [TX + 22, RIM_Y - 3, 2]] as const) { ellF(g, fx, fy, r + 1, r * 0.6 + 1, INK); ellF(g, fx, fy, r, r * 0.6, POO[2]); box(g, fx - r * 0.5, fy - r * 0.4, 1, 1, POO[4]); }
    ellF(g, TX - 6, RIM_Y + 1, 5, 2.6, INK); ellF(g, TX - 6, RIM_Y + 0.6, 4, 1.8, '#C8C0B0'); box(g, TX - 8, RIM_Y, 2, 1, '#F4F0E6');
  }
  // The bowl's front: an egg, banded round to the light, the shade under the rim, light bounced up under its belly
  const bowl = () => { g.beginPath(); g.moveTo(TX - 44, RIM_Y + 2); g.quadraticCurveTo(TX - 42, RIM_Y + 30, TX - 20, RIM_Y + 36); g.lineTo(TX + 20, RIM_Y + 36); g.quadraticCurveTo(TX + 42, RIM_Y + 30, TX + 44, RIM_Y + 2); g.quadraticCurveTo(TX, RIM_Y + 14, TX - 44, RIM_Y + 2); g.closePath(); };
  bowl(); g.fillStyle = INK; g.fill();
  g.save(); bowl(); g.clip();
  box(g, TX - 46, RIM_Y, 92, 40, AVO[2]);
  ellF(g, TX - 8, RIM_Y + 16, 30, 14, AVO[3]); ellF(g, TX - 16, RIM_Y + 13, 14, 7, AVO[4]); box(g, TX - 26, RIM_Y + 10, 8, 1, AVO[5]);
  box(g, TX + 30, RIM_Y, 16, 40, AVO[1]); g.fillStyle = stipple(g, AVO[1]); g.fillRect(TX + 24, RIM_Y, 6, 40);
  box(g, TX - 46, RIM_Y + 2, 92, 3, AVO[1]); g.fillStyle = stipple(g, AVO[1], 1); g.fillRect(TX - 46, RIM_Y + 5, 92, 2);
  box(g, TX - 30, RIM_Y + 33, 60, 3, AVO[1]);
  g.restore();
  bowl(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  // The foot: a pedestal down to the floor, banded, flared at the bottom, its bolt caps
  const foot = () => { g.beginPath(); g.moveTo(TX - 18, RIM_Y + 35); g.lineTo(TX - 16, TF - 8); g.quadraticCurveTo(TX - 26, TF - 4, TX - 26, TF); g.lineTo(TX + 26, TF); g.quadraticCurveTo(TX + 26, TF - 4, TX + 16, TF - 8); g.lineTo(TX + 18, RIM_Y + 35); g.closePath(); };
  foot(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = AVO[2]; g.fill();
  g.save(); foot(); g.clip();
  box(g, TX - 26, RIM_Y + 30, 14, 60, AVO[3]); box(g, TX - 20, RIM_Y + 34, 4, 30, AVO[4]); box(g, TX + 10, RIM_Y + 30, 16, 60, AVO[1]);
  g.fillStyle = stipple(g, AVO[1]); g.fillRect(TX + 6, RIM_Y + 30, 4, 60);
  box(g, TX - 26, RIM_Y + 35, 52, 3, AVO[0]);
  g.restore();
  for (const bx of [TX - 20, TX + 20]) { ellF(g, bx, TF - 3, 3.4, 2.8, INK); ellF(g, bx, TF - 3.2, 2.5, 2, CHR[2]); box(g, bx - 1, TF - 4.5, 1, 1, CHR[4]); }
  if (!clear) {
    // (it's been over the rim and down the front: runs of it, a puddle at its foot)
    for (const [x, len] of [[TX - 30, 18], [TX + 6, 26], [TX + 26, 14]] as const) { box(g, x - 1, RIM_Y + 4, 4, len, INK); box(g, x, RIM_Y + 4, 2, len, MURK[2]); box(g, x, RIM_Y + 4, 1, len, MURK[4]); ellF(g, x + 1, RIM_Y + 4 + len, 2.4, 2, MURK[2]); }
    ellF(g, TX + 6, TF + 1, 22, 3.4, INK); ellF(g, TX + 6, TF + 0.6, 21, 2.6, MURK[2]); box(g, TX - 6, TF, 8, 1, MURK[4]);
  }
  // (a rose across the seat's near edge)
  g.strokeStyle = '#14532D'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(TX + 18, RIM_Y + 8); g.lineTo(TX + 38, RIM_Y + 3); g.stroke();
  ellF(g, TX + 17, RIM_Y + 8, 4, 3.4, INK); ellF(g, TX + 17, RIM_Y + 8, 3, 2.6, '#B91C1C'); box(g, TX + 16, RIM_Y + 7, 2, 1, '#F87171');
};

// ---------------------------------------------------------------------------------------------------------------
// The plunger: the red cup down in the murk (squashed or stretched), the wooden handle up out of it to his fists

interface Plunger { C: P2; v: P2; top: P2; hl: P2; hr: P2 }
const plungerOf = (P: Pose): Plunger => {
  const C: P2 = [TX - 6, RIMW - 1 + P.cup];
  const a = -2.6 + P.tilt, v: P2 = [Math.cos(a), Math.sin(a)];
  const at = (k: number): P2 => [C[0] + v[0] * k, C[1] + v[1] * k];
  return { C, v, top: at(68), hl: at(60), hr: at(16) };
};
const drawCup = (g: Ctx, C: P2, sq: number, a: number) => {
  // (a dome: wider and flatter on a push, taller and narrower on the pull, sucked in at its waist)
  const w = 15 + sq * 4, h = 13 - sq * 4;
  g.save(); g.translate(C[0], C[1]); g.rotate(a);
  const cup = (grow: number) => { g.beginPath(); g.moveTo(-w - grow, grow); g.quadraticCurveTo(-w * 0.8 - grow, -h * 0.6 - grow, -w * 0.3, -h - grow); g.lineTo(w * 0.3, -h - grow); g.quadraticCurveTo(w * 0.8 + grow, -h * 0.6 - grow, w + grow, grow); g.closePath(); };
  cup(1.2); g.fillStyle = INK; g.fill();
  cup(0); g.fillStyle = RUB[2]; g.fill();
  g.save(); cup(0); g.clip();
  box(g, -w - 2, -h - 2, w * 0.7, h + 4, RUB[3]); box(g, -w * 0.62, -h + 1, 3, h * 0.6, RUB[4]); box(g, -w * 0.55, -h + 2, 1, h * 0.4, RUB[5]);
  box(g, w * 0.45, -h - 2, w, h + 4, RUB[1]); g.fillStyle = stipple(g, RUB[1]); g.fillRect(w * 0.3, -h - 2, 3, h + 4);
  for (let k = 1; k < 3; k++) box(g, -w, -h * k / 3, w * 2, 1, RUB[1]);
  g.restore();
  g.restore();
};
const drawHandle = (g: Ctx, pl: Plunger, from: P2) => {
  const [x0, y0] = from, [x1, y1] = pl.top;
  g.lineCap = 'round';
  for (const [w, col, o] of [[7, INK, 0], [5, WOOD[2], 0], [2, WOOD[3], -1], [1, WOOD[4], -1.5]] as const) {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0 + o * 0.3, y0 + o); g.lineTo(x1 + o * 0.3, y1 + o); g.stroke();
  }
  g.lineCap = 'butt';
  // (the hang hole at its end, the grain)
  ellF(g, x1, y1, 1.2, 1.2, INK);
  for (let k = 0.2; k < 0.9; k += 0.17) box(g, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + 1, 2, 1, WOOD[1]);
};
/** The murk round the cup's foot (back over it: the cup's down in it), slopping on a push. */
const murkLip = (g: Ctx, C: P2, fx: Pose['fx'], clear: boolean) => {
  const M = clear ? ['#4E7A6E', '#6E9A8E', '#9EC2B4', '#C8E6DA', '#F0FFF8', '#FFFFFF'] : MURK;
  ellF(g, C[0], C[1] + 1, 20, 3.2, M[2]); ellF(g, C[0] - 3, C[1] + 0.5, 12, 1.6, M[3]); box(g, C[0] - 14, C[1], 5, 1, M[4]);
  if (fx === 'slosh') {
    // (slopping up round it: gobs thrown up and out, a ring of it)
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.ellipse(C[0], C[1] - 1, 24, 5, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    for (const [dx, dy, r] of [[-22, -8, 2.6], [-14, -14, 2], [18, -10, 2.4], [26, -4, 1.8], [6, -16, 1.6], [-28, -2, 2]] as const) { ellF(g, C[0] + dx, C[1] + dy, r + 1, r + 1, INK); ellF(g, C[0] + dx, C[1] + dy, r, r, M[3]); box(g, C[0] + dx - 1, C[1] + dy - 1, 1, 1, M[5]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Him

/** A two-bone leg's mass, hip to knee to ankle (the knee off limb.ts), thick: kneeling, mostly his calves from behind. */
const legMass = (H: P2, K: P2, A: P2, bare: boolean): Mass => {
  const mid = (a: P2, b: P2, k: number): [number, number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 0];
  const t1 = mid(H, K, 0.5), c1 = mid(K, A, 0.42);
  return {
    chain: [[H[0], H[1], 13], [t1[0], t1[1], 13.5], [K[0], K[1], 11.5], [c1[0], c1[1], bare ? 12 : 11.5], [A[0], A[1], 8.5]],
    blobs: [], peaks: [[c1[0], c1[1], 11]],
  };
};
/** A boot from behind, him kneeling: the toe dug in, the heel and the sole tipped up at us (the tread, the heel block). */
const kneelBoot = (g: Ctx, x: number, y: number, side: number) => {
  const bw = 22, bh = 20, bx = Math.round(x - bw / 2), by = Math.round(y - 6);
  // (the shaft round his ankle)
  box(g, bx, by - 8, bw, 10, INK); box(g, bx + 1, by - 7, bw - 2, 8, BOOT[2]); box(g, bx + 1, by - 7, 3, 8, BOOT[3]); box(g, bx + bw - 4, by - 7, 3, 8, BOOT[1]);
  // (the sole, up at us: rubber, the tread across it, the heel block at the top, the instep worn)
  g.fillStyle = INK; g.beginPath(); g.roundRect(bx - 1, by, bw + 2, bh + 2, 5); g.fill();
  box(g, bx + 1, by + 1, bw - 2, bh, '#2A2A2E');
  box(g, bx + 2, by + 2, bw - 4, 7, '#3A3A40'); box(g, bx + 2, by + 2, bw - 4, 1, '#55555E'); box(g, bx + 2, by + 9, bw - 4, 1, '#121214');
  for (let k = by + 12; k < by + bh - 1; k += 2) box(g, bx + 3, k, bw - 6, 1, '#121214');
  box(g, bx + (side < 0 ? 3 : bw - 7), by + 13, 4, 2, '#5A5A62');
  // (gum stuck to it)
  if (side > 0) { ellF(g, bx + 8, by + 16, 2.4, 1.6, '#F472B6'); box(g, bx + 7, by + 15, 1, 1, '#FBCFE8'); }
  walkBoot(g, bx, by - 8, bw, bh + 8, side, false, 0);
};

/** His back and the rest above the waist, in walkAway's units (his kneeling `ty` already in), the forward lean squashing
 *  it down over his belt. Mirrors meatheadBack.ts's back (the same build, colors, bacne). */
const back = (c: Ctx, ty: number, strain: number, curl: number) => {
  const S = SKIN;
  const torso = [[-25, -84 + ty], [-38, -118 + ty], [-42, -131 + ty], [-30, -141 + ty], [-12, -147 + ty], [12, -147 + ty], [30, -141 + ty], [42, -131 + ty], [38, -118 + ty], [25, -84 + ty]];
  poly(c, torso, S[2]);
  c.save(); path(c, torso); c.clip();
  box(c, -44, -150 + ty, 8, 70, S[3]); c.fillStyle = stipple(c, S[3]); c.fillRect(-36, -150 + ty, 2, 70);
  box(c, 34, -150 + ty, 10, 70, S[1]); c.fillStyle = stipple(c, S[1], 1); c.fillRect(32, -150 + ty, 2, 70);
  for (const side of [-1, 1]) { c.strokeStyle = side < 0 ? S[1] : S[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(side * 37, -124 + ty); c.quadraticCurveTo(side * 22, -108 + ty, side * 17, -88 + ty); c.stroke(); }
  // (the traps, bunched up round his neck as he curls over it)
  poly(c, [[-12, -147 + ty], [12, -147 + ty], [32, -140 + ty], [0, -116 + ty + curl], [-32, -140 + ty]], S[2], null);
  poly(c, [[-12, -147 + ty], [12, -147 + ty], [26, -142 + ty], [-26, -142 + ty]], S[3], null);
  box(c, -10, -147 + ty, 8, 1, S[4]);
  // (the shoulder blades: pinched in toward the spine on a pull, spread on a push)
  const pinch = Math.round(strain * 4);
  for (const side of [-1, 1]) {
    c.strokeStyle = S[1]; c.lineWidth = 1;
    c.beginPath(); c.moveTo(side * (11 - pinch * 0.5), -134 + ty); c.lineTo(side * (15 - pinch), -114 + ty); c.lineTo(side * (27 - pinch), -112 + ty); c.stroke();
    c.strokeStyle = side < 0 ? S[4] : S[3]; c.beginPath(); c.moveTo(side * 12, -137 + ty); c.lineTo(side * 34, -139 + ty); c.stroke();
    if (strain > 0.5) { box(c, side * (8 - pinch * 0.4) - (side > 0 ? 3 : 0), -132 + ty, 3, 16, side < 0 ? S[4] : S[3]); box(c, side * (16 - pinch) - (side > 0 ? 1 : 0), -128 + ty, 1, 12, S[0]); }
    lump(c, side * 33, -124 + ty, 6, 5, side < 0 ? S : [S[0], S[1], S[2], S[2], S[3]], false);
  }
  // (the spine's groove, the muscle ridges either side, standing out harder the more he strains)
  box(c, -1, -145 + ty, 2, 30, S[1]); box(c, -1, -115 + ty, 2, 31, S[0]);
  for (const side of [-1, 1]) { box(c, side * 5 - (side > 0 ? 3 : 0), -112 + ty, 3, 24, side < 0 ? S[3] : S[2]); box(c, side * 9 - (side > 0 ? 1 : 0), -110 + ty, 1, 22, S[1]); }
  if (strain > 0.6) {
    // (veins up his back, standing out)
    c.strokeStyle = '#8A4A2A'; c.lineWidth = 1;
    for (const side of [-1, 1]) { c.beginPath(); c.moveTo(side * 22, -96 + ty); c.lineTo(side * 26, -106 + ty); c.lineTo(side * 24, -114 + ty); c.lineTo(side * 29, -122 + ty); c.stroke(); }
  }
  // (bacne: what the gear does)
  for (let i = 0; i < 14; i++) { const bx = -30 + hash(i * 3.7) * 60, byy = -142 + hash(i * 5.3) * 40; if (Math.abs(bx) < 4) continue; box(c, bx, byy + ty, 1, 1, '#B4532A'); if (i % 3 === 0) box(c, bx + 1, byy + ty, 1, 1, '#E8A070'); }
  c.restore();
};

/** The back of his head (meatheadBack.ts's: the fade, the flat-top, the ears, the glasses' arms hooked behind them),
 *  turned a touch toward the bowl: the corner of his glasses' frame peeking past his cheek on the right. */
const head = (c: Ctx, hy: number) => {
  const S = SKIN;
  poly(c, [[-13, -140 + hy], [13, -140 + hy], [12, -152 + hy], [-12, -152 + hy]], S[2]);
  box(c, -12, -150 + hy, 4, 9, S[3]); box(c, 8, -150 + hy, 4, 9, S[1]); box(c, -1, -150 + hy, 2, 8, S[1]);
  const hd = [[-13, -174 + hy], [13, -174 + hy], [14, -160 + hy], [12, -151 + hy], [-12, -151 + hy], [-14, -160 + hy]];
  lump(c, -15, -163 + hy, 3, 4, S); lump(c, 15, -163 + hy, 3, 4, [S[0], S[1], S[1], S[2], S[2]]);
  // (the frame's corner past his right cheek, the lens' edge catching the light)
  box(c, 14, -168 + hy, 5, 8, INK); box(c, 15, -167 + hy, 3, 6, '#8EC5E8'); box(c, 15, -167 + hy, 1, 3, '#FFFFFF');
  poly(c, hd, S[2]);
  box(c, -13, -172 + hy, 4, 18, S[3]); box(c, 9, -172 + hy, 4, 18, S[1]);
  c.fillStyle = stipple(c, mix(S[1], HAIR[2], 0.55)); c.fillRect(-13, -173 + hy, 26, 14);
  c.fillStyle = stipple(c, mix(S[1], HAIR[2], 0.35), 1); c.fillRect(-13, -173 + hy, 26, 8);
  box(c, -12, -173 + hy, 24, 3, mix(S[1], HAIR[2], 0.6));
  box(c, -9, -153 + hy, 18, 1, S[0]); box(c, -8, -152 + hy, 16, 1, S[3]); box(c, -10, -156 + hy, 20, 1, S[1]);
  box(c, -15, -186 + hy, 30, 14, INK); box(c, -14, -185 + hy, 28, 12, HAIR[2]); box(c, -14, -185 + hy, 28, 2, HAIR[4]);
  for (let i = 0; i < 12; i++) box(c, -13 + i * 2.3, -183 + hy + (i % 2) * 4, 1, 3, HAIR[3]);
  box(c, -14, -175 + hy, 28, 2, HAIR[1]);
  walkHelmet(c, hy, false);
  for (const side of [-1, 1]) {
    const ax = side < 0 ? -18 : 13;
    box(c, ax, -167 + hy, 5, 2, INK); box(c, side < 0 ? ax : ax + 4, -165 + hy, 1, 4, INK);
    box(c, ax + 1, -167 + hy, 3, 1, BAND[3]); box(c, side < 0 ? ax + 1 : ax + 3, -167 + hy, 1, 1, BAND[4]);
  }
};

/** A fist round the handle (the back of his hand, the knuckles' ridge), the glove over it if he's got the hands. */
const gripFist = (c: Ctx, x: number, y: number, a: number) => {
  lump(c, x, y, 7, 7.5, SKIN);
  box(c, x - 5, y - 4, 10, 1, SKIN[3]); box(c, x - 5, y + 2, 9, 1, SKIN[1]); box(c, x - 4, y + 4, 8, 1, SKIN[1]);
  walkFist(c, x, y, 7, a);
};

/** His seat, the belt, the crack (the jeans riding down by `sag` more), by pants; `hy` the seat's middle. */
const seat = (c: Ctx, hy: number, waist: number, sag: number, pants: PlungePants, t: number) => {
  const S = SKIN;
  // (his lower back down to the jeans: bare skin, the dimples either side of his spine)
  const wb = waist + 7 + sag * 1.3;
  poly(c, [[-26, waist - 4], [26, waist - 4], [29, wb + 4], [-29, wb + 4]], S[2], null);
  box(c, -26, waist - 4, 4, wb - waist + 8, S[3]); box(c, 23, waist - 4, 4, wb - waist + 8, S[1]);
  box(c, -9, waist + 1, 3, 2, S[1]); box(c, 6, waist + 1, 3, 2, S[1]);
  if (pants === 'nude') {
    // THE FULL MOON: white as the rest of him isn't, two great cheeks, the crack top to bottom, hairy; between his
    // thighs, under them, the lot hanging
    const R = PALE;
    c.fillStyle = stipple(c, PALE[2]); c.fillRect(-28, wb - 2, 56, 3);
    poly(c, [[-5, hy + 12], [5, hy + 12], [6, hy + 30], [-6, hy + 30]], '#2A160A', null);
    const by = hy + 22;
    c.fillStyle = '#1C0E06'; c.beginPath(); c.ellipse(0, hy + 18, 6, 3, 0, 0, Math.PI * 2); c.fill();
    lump(c, -3.5, by, 6, 7, SACK); lump(c, 4, by + 1, 6, 7, [SACK[0], SACK[1], SACK[2], SACK[2], SACK[3]]);
    for (let k = 0; k < 3; k++) box(c, -6 + k * 3, by - 1 + k * 2, 3, 1, SACK[1]);
    box(c, -7, by - 6, 1, 2, INK); box(c, 6, by - 5, 1, 2, INK); box(c, 1, by + 7, 1, 2, INK);
    for (const side of [-1, 1]) {
      lump(c, side * 15, hy + 4, 17, 16, side < 0 ? R : [R[0], R[1], R[2], R[2], R[3]], true);
      box(c, side * 15 - 12, hy + 19, 24, 1, R[0]); box(c, side * 15 - 10, hy + 18, 20, 1, R[1]);
      // (the hair on it)
      for (let i = 0; i < 9; i++) box(c, side * 15 - 11 + hash(i * 2.3 + side) * 22, hy - 8 + hash(i * 4.1 + side) * 22, 1, 2, R[0]);
      // (a zit)
      if (side > 0) { box(c, 18, hy - 2, 2, 2, '#D9534F'); box(c, 18, hy - 2, 1, 1, '#FFF1E0'); }
    }
    // (the crack, top to bottom, deepening as it goes)
    box(c, -1, wb - 2, 2, 6, R[1]); box(c, -1, wb + 4, 3, hy + 18 - wb - 4, R[0]); box(c, 0, wb + 4, 1, hy + 16 - wb - 4, INK);
    for (let i = 0; i < 6; i++) box(c, -3 + (i % 2) * 5, wb + 2 + i * 3, 1, 2, '#3A2414');
    return;
  }
  // The jeans, ridden down: the seat, the cheeks lit, the back pockets, the yoke, a crack's worth of him above them
  const R = JEANS;
  const top = wb, bot = hy + 20;
  const jean = [[-30, top], [-2, top + 3], [2, top + 3], [30, top], [32, hy + 6], [28, bot - 2], [16, bot + 1], [4, bot - 2], [0, bot - 4], [-4, bot - 2], [-16, bot + 1], [-28, bot - 2], [-32, hy + 6]];
  poly(c, jean, R[2]);
  c.save(); path(c, jean); c.clip();
  for (const side of [-1, 1]) {
    ellF(c, side * 15 - 4, hy + 2, 10, 8, R[3]); ellF(c, side * 15 - 6, hy - 1, 4, 3, R[4]);
    box(c, side * 15 - 12, bot - 3, 24, 1, R[1]);
    const px = side * 15, py = top + 7;
    const pk = [[px - 9, py], [px + 9, py], [px + 8, py + 12], [px, py + 15], [px - 8, py + 12]];
    poly(c, pk, R[2], R[0]);
    c.fillStyle = GOLD[1]; for (let k = -6; k <= 6; k += 2) c.fillRect(Math.round(px + k), Math.round(py + 4 - Math.abs(k) * 0.35), 1, 1);
    box(c, px - 9, py + 1, 18, 1, R[3]);
  }
  c.strokeStyle = R[4]; c.lineWidth = 1; c.beginPath(); c.arc(15, top + 14, 4, 0, Math.PI * 2); c.stroke();
  box(c, -1, top + 3, 2, bot - top - 6, R[0]); box(c, 1, top + 3, 1, bot - top - 8, GOLD[0]);
  box(c, -32, top, 4, 30, R[3]); box(c, 28, top, 4, 30, R[1]);
  if (pants === 'shitty') {
    // (the seat soaked through: dark in the middle, a wet shine, stippled out round its edge, running)
    c.fillStyle = stipple(c, STAIN[1], 1); c.beginPath(); c.ellipse(0, hy + 10, 26, 15, 0, 0, Math.PI * 2); c.fill();
    ellF(c, 0, hy + 11, 19, 11, STAIN[1]); ellF(c, 0, hy + 13, 10, 7, STAIN[0]);
    box(c, -8, hy + 4, 4, 1, STAIN[3]); box(c, 5, hy + 6, 2, 1, STAIN[3]); box(c, -5, hy + 5, 1, 1, '#C8A070');
    for (const [x, l] of [[-12, 9], [7, 12], [16, 6]] as const) box(c, x, hy + 18, 2, l, STAIN[1]);
  }
  c.restore();
  // (the belt, ridden down with them, sagging at the middle; the crack up out of it)
  const belt = [[-31, top - 7], [0, top - 4], [31, top - 7], [31, top + 2], [0, top + 5], [-31, top + 2]];
  poly(c, belt, BELT[2]);
  c.save(); path(c, belt); c.clip();
  box(c, -32, top - 7, 64, 2, BELT[3]); box(c, -32, top + 1, 64, 4, BELT[1]);
  for (let i = -28; i < 28; i += 3) box(c, i, top - 4 + Math.abs(i) * -0.1, 1, 1, BELT[4]);
  box(c, -28, top - 7, 6, 10, BELT[1]);
  c.restore();
  // THE CRACK: up out of the belt, a dark cleft, hair round it
  const ch = 10 + sag * 1.6;
  box(c, -2, top - 6 - ch, 4, ch + 2, S[1]); box(c, -1, top - 6 - ch + 1, 2, ch + 1, S[0]); box(c, 0, top - 6 - ch + 3, 1, ch - 1, INK);
  for (const side of [-1, 1]) { lump(c, side * 6, top - 7, 7, 4, side < 0 ? S : [S[0], S[1], S[2], S[2], S[3]], false); }
  for (let i = 0; i < 7; i++) box(c, -4 + (i % 3) * 3 + (i > 3 ? 1 : 0), top - 7 - ch + i * (ch / 7), 1, 2, '#3A2414');
  if (pants === 'shitty') {
    // (it's up out of the crack too)
    box(c, -1, top - 8, 3, 3, STAIN[1]); box(c, 0, top - 8, 1, 1, STAIN[3]);
  }
  void t;
};

/** The stink coming up off his seat (shitty pants), painted in its frame: wavy lines going up, greenish brown. */
const stinkLines = (c: Ctx, x: number, y: number) => {
  for (let k = 0; k < 3; k++) {
    const x0 = x - 10 + k * 10;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath();
    for (let i = 0; i <= 12; i++) { const yy = y - i * 3, xx = x0 + Math.sin(i * 0.9 + k) * 3; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.stroke();
    c.strokeStyle = k % 2 ? '#7C8A3A' : '#8A7A3A'; c.lineWidth = 1.5; c.stroke();
  }
};

/** One frame: the backdrop, the toilet, him, the plunger, whatever's flying. */
const paintFrame = (pose: PlungePose, pants: PlungePants): HTMLCanvasElement => {
  const P = POSES[pose];
  const cv = document.createElement('canvas'); cv.width = VIEW_W; cv.height = VIEW_H;
  const g = cv.getContext('2d')!;
  g.drawImage(backdrop(), 0, 0);
  g.save(); g.translate(OX, OY); g.scale(FK, FK);
  const clear = pose === 'win';
  g.save(); g.translate(TX, TFW); g.scale(TKS, TKS); g.translate(-TX, -TF); toilet(g, clear); g.restore();
  const pl = plungerOf(P);
  const ang = Math.atan2(pl.v[1], pl.v[0]) + Math.PI / 2;
  if (pose !== 'win') {
    // (the cup: popped up out of it on the yank, gunk strung off it back into the bowl)
    if (P.fx === 'pop') {
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(pl.C[0] - 6, pl.C[1]); g.quadraticCurveTo(pl.C[0], pl.C[1] + 14, pl.C[0] + 2, RIMW); g.stroke();
      g.strokeStyle = POO[3]; g.lineWidth = 2; g.stroke();
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(pl.C[0] + 8, pl.C[1]); g.quadraticCurveTo(pl.C[0] + 12, pl.C[1] + 10, pl.C[0] + 10, RIMW); g.stroke();
      g.strokeStyle = MURK[3]; g.lineWidth = 1.5; g.stroke();
      ellF(g, pl.C[0], RIMW - 1, 14, 3, MURK[1]);
    }
    drawCup(g, pl.C, P.sq, ang);
    if (P.fx === 'pop') { ellF(g, pl.C[0] - 2, pl.C[1] + 1, 9, 3, INK); ellF(g, pl.C[0] - 2, pl.C[1] + 0.5, 8, 2.2, POO[2]); box(g, pl.C[0] - 6, pl.C[1], 3, 1, POO[4]); }
    else murkLip(g, pl.C, P.fx, clear);
  }

  // Him: kneeling (his walk-away figure dropped by his thighs), leaning in over it
  const ty = 34 + P.ly * 0.6 + P.hip * 0.3;
  const hipY = -42 + P.hip;
  // Legs: calves from behind under him, the knees out on the plinth (limb.ts), the boots' soles up at us
  for (const side of [-1, 1]) {
    const H: P2 = [side * 13, hipY + 4], A: P2 = [side * 22, -10];
    const Kn = kneeFront(H[0], H[1], A[0], A[1], 22, 24, side) as P2;
    const bare = pants === 'nude';
    flesh(g, legMass(H, Kn, A, bare), bare ? SKIN : JEANS);
    if (!bare) { for (let i = 0; i < 3; i++) box(g, A[0] - 8 + i, A[1] - 12 + i * 3, 15 - i * 2, 1, JEANS[1]); }
    else for (let i = 0; i < 6; i++) box(g, A[0] - 8 + ((i * 5) % 14), A[1] - 18 + ((i * 7) % 12), 1, 2, SKIN[1]);
    if (pants === 'shitty') { g.fillStyle = stipple(g, STAIN[1], 0); g.fillRect(A[0] - side * 8 - 3, hipY + 10, 7, 18); box(g, A[0] - side * 6, hipY + 12, 2, 12, STAIN[1]); }
    walkShin(g, A[0], Kn[1] - 2, A[1] - 2, side, false);
    kneelBoot(g, A[0], A[1] + 6, side);
  }
  // The back (leaning over: squashed down onto his belt), his shoulders shifted with the pose
  const waist = -90 + ty;
  const lx = P.lx, curl = Math.max(0, P.ly) * 0.8;
  const squash = 0.86 - Math.max(0, P.ly) * 0.012;
  const sL: P2 = [-44 + lx, -128 + ty + P.ly * 0.4], sR: P2 = [44 + lx, -128 + ty + P.ly * 0.4];
  // (the arms: shoulders to the fists on the handle; the far one behind his back, the near one round past his head)
  const win = pose === 'win';
  const hl: P2 = win ? [-40 + lx, -192 + ty] : [pl.hl[0], pl.hl[1]];
  const hr: P2 = win ? [52 + lx, -188 + ty] : [pl.hr[0], pl.hr[1]];
  // (an arm: the bones off the reach, the elbow from limb.ts: reaching in across his chest to the handle, it points
  // down (elbow(), side on, reaching +x); out to his side or up, it points out (elbowFront))
  const armAt = (S: P2, F: P2, side: number, across: boolean) => {
    const bone = Math.max(30, Math.hypot(F[0] - S[0], F[1] - S[1]) / 2 * 1.02);
    const hint = (across ? elbow(S[0], S[1], F[0], F[1], bone, bone, 1) : elbowFront(S[0], S[1], F[0], F[1], bone, bone, side)) as P2;
    return armOf(S, F, hint, side);
  };
  const shoulderY = (s: P2): P2 => [s[0], waist + (s[1] - waist) * squash];
  const aL = armAt(shoulderY(sL), hl, -1, !win), aR = armAt(shoulderY(sR), hr, 1, false);
  const drawArm = (a: ReturnType<typeof armOf>) => {
    const S = a.side < 0 ? SKIN : [SKIN[0], SKIN[1], SKIN[2], SKIN[3], SKIN[3]];
    flesh(g, a.mass, S, undefined, undefined, cc => { upperLines(a, S, true)(cc); foreLines(a, S, true)(cc); });
    if (P.strain > 0.6) { g.strokeStyle = '#8A4A2A'; g.lineWidth = 1; g.beginPath(); g.moveTo(a.E[0], a.E[1]); g.lineTo((a.E[0] + a.W[0]) / 2 + 2, (a.E[1] + a.W[1]) / 2 - 1); g.lineTo(a.W[0], a.W[1]); g.stroke(); }
    wristband(g, a, BAND);
    walkForearm(g, a.E, a.W, 0);
  };
  // (plunging: his left's reached in across his chest, behind his back (only the fist showing, up on the handle past
  // his head); the right's out round his side to the handle's foot)
  if (!win) drawArm(aL);
  // (his seat)
  seat(g, hipY - 2, waist + 16, P.sag, pants, 0);
  g.save(); g.translate(0, waist); g.scale(1, squash); g.translate(0, -waist);
  back(g, ty, P.strain, curl);
  walkAmulet(g, ty, false, 0);
  walkCapeBack(g, ty, 0.5, 0);
  g.restore();
  // (his head, bowed down between his shoulders over the bowl: the flat-top and the back of his skull over his traps)
  const hy = waist + (-147 + ty - waist) * squash + 147 + 6 + Math.max(0, P.ly) * 0.8;
  g.save(); g.translate(lx * 1.3, -140 + hy); g.scale(1.08, 0.74); g.translate(0, 140 - hy); head(g, hy); g.restore();
  // (the handle, up out of the murk past his right shoulder to his fists)
  if (!win) drawHandle(g, pl, [pl.C[0] + pl.v[0] * 8, pl.C[1] + pl.v[1] * 8]);
  // (the win: the plunger held up high in his left, the cup dripping)
  if (win) {
    const top: P2 = [hl[0] + 4, hl[1] - 54];
    drawHandle(g, { C: [0, 0], v: [0, -1], top, hl, hr }, [hl[0] + 2, hl[1] + 14]);
    drawCup(g, [top[0] + 1, top[1] - 4], 0, Math.PI);
    for (let k = 0; k < 4; k++) box(g, top[0] - 8 + k * 5, top[1] + 2 + (k % 2) * 6, 2, 3 + k, MURK[2]);
    drawArm(aL);
  }
  gripFist(g, aL.F[0], aL.F[1], Math.atan2(aL.dir[1], aL.dir[0]));
  drawArm(aR);
  gripFist(g, aR.F[0], aR.F[1], Math.atan2(aR.dir[1], aR.dir[0]));
  walkShoulder(g, aL.S[0], aL.S[1], -1);
  walkShoulder(g, aR.S[0], aR.S[1], 1);
  if (pants === 'shitty') { stinkLines(g, -44, hipY + 4); stinkLines(g, 44, hipY + 4); }
  // (sweat: beads on his back, flicked off his head on the big pulls)
  if (P.strain >= 0.6) for (let i = 0; i < 5; i++) { const x = -30 + hash(i * 9.1 + P.strain) * 60, y = -130 + ty + hash(i * 3.3) * 40; ellF(g, x, y, 1.4, 2, SWEAT); box(g, x, y - 1, 1, 1, '#FFFFFF'); }
  if (pose === 'yank' || pose === 'win') for (const [dx, dy] of [[-26, -200], [28, -196], [-34, -188], [36, -182]] as const) { ellF(g, dx + lx, dy + ty, 1.6, 2.4, SWEAT); box(g, dx + lx, dy + ty - 2, 1, 1, '#FFFFFF'); }
  if (P.fx === 'burst') {
    // IT BLOWS BACK: up out of the bowl into his face and all over him, chunks of 1994, splats on his back and the wall
    const bx = pl.C[0], by = RIMW - 4;
    for (const [dx, dy, r] of [[-10, -20, 9], [-24, -38, 8], [-4, -44, 7], [-36, -56, 6], [8, -30, 6], [-18, -64, 5], [16, -52, 5], [-44, -36, 5]] as const) { ellF(g, bx + dx, by + dy, r + 1.5, r + 1.5, INK); ellF(g, bx + dx, by + dy, r, r, MURK[2]); ellF(g, bx + dx - r * 0.3, by + dy - r * 0.3, r * 0.5, r * 0.4, MURK[4]); }
    for (const [dx, dy, r] of [[-30, -46, 3], [-14, -58, 2.6], [4, -40, 2.4]] as const) { ellF(g, bx + dx, by + dy, r + 1, r + 1, INK); ellF(g, bx + dx, by + dy, r, r, POO[2]); }
    for (let i = 0; i < 8; i++) { const x = -32 + hash(i * 4.7) * 64, y = -140 + ty + hash(i * 2.9) * 44; ellF(g, x, y, 3, 2.4, MURK[2]); box(g, x - 1, y - 1, 1, 1, MURK[4]); box(g, x, y + 2, 1, 3 + (i % 3), MURK[2]); }
  }
  if (P.fx === 'win') {
    // (the clog blown: a brown geyser up out of the bowl behind him)
    const gx = TX - 4;
    g.fillStyle = INK; g.beginPath(); g.moveTo(gx - 10, RIMW); g.quadraticCurveTo(gx - 16, -190, gx - 4, -250); g.lineTo(gx + 6, -250); g.quadraticCurveTo(gx + 16, -190, gx + 10, RIMW); g.fill();
    g.fillStyle = POO[2]; g.beginPath(); g.moveTo(gx - 8, RIMW); g.quadraticCurveTo(gx - 13, -190, gx - 3, -248); g.lineTo(gx + 5, -248); g.quadraticCurveTo(gx + 13, -190, gx + 8, RIMW); g.fill();
    box(g, gx - 4, -240, 3, 120, POO[4]);
    for (const [dx, dy, r] of [[-20, -236, 5], [18, -228, 4], [-26, -210, 3], [24, -200, 4], [0, -256, 6]] as const) { ellF(g, gx + dx, dy, r + 1, r + 1, INK); ellF(g, gx + dx, dy, r, r, POO[3]); }
    box(g, gx + 10, -222, 8, 5, '#F4F0E6'); box(g, gx - 22, -246, 6, 4, '#F4F0E6');
  }
  g.restore();
  // (the edges crushed to the dark: the shot's vignette, in steps)
  for (const [w, a] of [[24, 0.35], [12, 0.3]] as const) { g.fillStyle = `rgba(6, 2, 8, ${a})`; g.fillRect(0, 0, VIEW_W, w); g.fillRect(0, VIEW_H - w * 0.5, VIEW_W, w * 0.5); g.fillRect(0, 0, w, VIEW_H); g.fillRect(VIEW_W - w, 0, w, VIEW_H); }
  return cv;
};

const frames = new Map<string, HTMLCanvasElement>();
/** A frame, painted the first time it's wanted (by the pose, the pants and the armor he has on), then kept. */
export const plungeFrame = (pose: PlungePose, pants: PlungePants): HTMLCanvasElement => {
  const key = `${pose}|${pants}|${ownedPieces().join(',')}`;
  let cv = frames.get(key);
  if (!cv) { cv = paintFrame(pose, pants); frames.set(key, cv); }
  return cv;
};
/** Let the kept frames go (the minigame over: painted again next time, the armor as it is then). */
export const dropPlungeFrames = () => frames.clear();

/** The shot on the screen: the frame (2x), shaken; the flies round his seat in shitty pants (live: a few pixels). */
export const drawPlungeView = (c: Ctx, pose: PlungePose, pants: PlungePants, f: number, shake: number) => {
  const jx = shake > 0.5 ? Math.round((Math.random() - 0.5) * shake) : 0, jy = shake > 0.5 ? Math.round((Math.random() - 0.5) * shake) : 0;
  const was = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false;
  c.drawImage(plungeFrame(pose, pants), jx - 4, jy - 4, VIEW_W * VIEW_S + 8, VIEW_H * VIEW_S + 8);
  c.imageSmoothingEnabled = was;
  if (pants !== 'clean') {
    const P = POSES[pose], hx = OX * VIEW_S + jx, hy = (OY + (-42 + P.hip - 6) * FK) * VIEW_S + jy;
    for (let k = 0; k < (pants === 'shitty' ? 4 : 2); k++) {
      const a = f * (0.13 + k * 0.03) + k * 1.7, x = hx + Math.cos(a) * (40 + k * 12), y = hy - 20 + Math.sin(a * 1.4) * 22;
      box(c, x - 2, y - 2, 4, 4, INK); box(c, x - 1, y - 1, 2, 2, '#3F3F46');
      if (f % 4 < 2) { box(c, x - 4, y - 4, 3, 2, 'rgba(220,230,255,0.7)'); box(c, x + 1, y - 4, 3, 2, 'rgba(220,230,255,0.7)'); }
    }
  }
};
/** Where the bowl's mouth is on the screen (the shard coming up out of it). */
export const viewBowl = (): [number, number] => [(OX + (TX - 6) * FK) * VIEW_S - 4, (OY + RIMW * FK) * VIEW_S - 4];
