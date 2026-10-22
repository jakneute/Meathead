// THE CIRCUS LION. The user's (verbatim): "jumping off the train onto the tracks should kill you like jumping off the
// truck in meathead 1 in dale's stage. meathead will stumble onto the tracks and twitch. he'll get up and be like 'i'm
// okay', only for a wild circus lion to come out of nowhere and maul meathead to death. put in circus lion display right
// away so they don't come from nowhere"
//
// THE DISPLAY: the first flatcar's load (layout.ts CIRCUS) is a circus cage wagon (red and gold, sunburst wheels, CIRCUS
// on its header, MAN-EATER and DO NOT FEED on the bars) with the lion in it: a maned circus lion in a little red fez and a
// studded collar, pacing; with him near it follows him along under the bars and roars up at him (he stands on the cage's
// roof crossing the car: the logs' height). Tucker cuts that car loose (the first cut): it blows, and the lion leaps out
// of the fire and off down the bank, THE LION'S LOOSE! Back at the end of the line (a revisit) the cage is there again,
// bent open, empty, ESCAPED.
//
// THE TRACKS (Dale's fall off the truck, Meathead 1, convoy.ts): down on the ties while the train's moving (off the back
// of what's left of it, once cars have been cut loose) is a cutscene from the first frame of it (no controls, no HUD,
// SKIP >> straight to the death screen): the world stands still and the train rolls on away (drawn moved on: `off`); he
// tumbles along the ties, bouncing, smearing, and lies there face down, twitching; gets up, swaying; he's okay (his line,
// by the state of his pants); and the lion comes in from behind at a dead run, leaps on his back and mauls him to death,
// face down on the ties (the gore, CHOMP!, his scream), then lies down on what's left, chewing. The death screen.
// (Down there in the middle of a cut, the cut-off end still rolling behind him, it runs him over: cars.ts, as before.)

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { shakeScreen } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { killPlayer, skipDying, clearForDoom } from '../../../m1/game/player/player';
import { drawPlayer } from '../../../m1/game/render/player/player';
import { drawBloodPool } from '../../../m1/game/render/spatter';
import { stamp } from '../../../m1/game/render/stamp';
import { PARTICLE_PALETTES } from '../../../m1/constants';
import { signText } from '../../signLetters';
import { meatheadSays, byPants, hands, label } from '../section';
import { GY } from '../geometry';
import { CARS, CAR_X, DECK, END, TOP, CIRCUS } from './layout';
import { trainOf, type Maul } from './state';
import { carXNow } from './where';
import { viewOf, inView, inDrawn } from './view';
import { type Ctx, box, checker, mix, hash, INK, N, boards, lip, stillAt, BRASS, RED, VARNISH, HAY } from './paint';
import { LION_CAGE, IM_OKAY, HURT } from './lines';

const GORE = PARTICLE_PALETTES.GORE;
const LION_SRC = 'm2:fr_lion';

// ---------------------------------------------------------------------------------------------------------------
// The lion: a maned circus lion, about 115 nose to rump, 46 at the shoulder, the mane's top ~66 up; a little red fez
// (its gold tassel swinging) and a red studded collar. Drawn at (x, feetY) facing right; `t` its own frame count.

export type LionPose = 'stand' | 'walk' | 'run' | 'pounce' | 'roar' | 'maul' | 'chew';

type R5 = readonly string[];
const TAWNY: R5 = ['#F4D898', '#DDAE62', '#BC8A42', '#8E6028', '#3C240C'];
const TAWNY_FAR: R5 = TAWNY.map(c => mix(c, '#3C240C', 0.28));
const PALE: R5 = ['#FFF6E2', '#F2DEB8', '#D8BC8C', '#B09468', '#5A4630'];
const MANE: R5 = ['#E09440', '#B8682A', '#8E481A', '#64300E', '#2A1206'];
const FEZ: R5 = ['#F87171', '#DC2626', '#991B1B', '#5F0F0F', '#2A0606'];
const GOLD: R5 = ['#FFF0A8', '#F2C84A', '#C8962E', '#8A5E14', '#3A2408'];
const BLOOD = ['#5F0F0F', '#7F1D1D', '#B91C1C', '#DC2626'];

const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fill(); };
const line = (g: Ctx, pts: number[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
/** A shape in its ramp, lit from above: the lit band, the base, the shade and the deep (dithered seams), inked. */
const banded = (g: Ctx, path: () => void, R: R5, y0: number, y1: number, lw = 1.2) => {
  g.beginPath(); path(); g.fillStyle = R[1]; g.fill();
  g.save(); g.beginPath(); path(); g.clip();
  const h = y1 - y0;
  box(g, -300, y0 - 20, 600, h * 0.24 + 20, R[0]); checker(g, -300, y0 + h * 0.24, 600, 2, R[0], 0, 1);
  checker(g, -300, y0 + h * 0.58, 600, 2, R[2], 0, 1); box(g, -300, y0 + h * 0.58 + 2, 600, h + 20, R[2]);
  checker(g, -300, y0 + h * 0.84, 600, 2, R[3], 0, 1); box(g, -300, y0 + h * 0.84 + 2, 600, h + 20, R[3]);
  g.restore();
  g.beginPath(); path(); g.strokeStyle = R[4]; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
};

type Pt = [number, number];
interface Geo { tilt: number; hip: Pt; sh: Pt; head: Pt; open: number; ry: number; tail: number[]; legs: number[][]; shake: number }

/** Where everything is, by pose and the cycle's phase (legs: far back, far front, near back, near front, each hip ->
 *  knee -> paw). */
const geo = (pose: LionPose, ph: number): Geo => {
  const a = Math.sin(ph), b = Math.sin(ph + Math.PI), lift = (s: number) => -Math.max(0, s) * 5;
  switch (pose) {
    case 'run': {
      const ra = Math.sin(ph), rb = Math.sin(ph + 1.6), bob = Math.sin(ph * 2) * 2;
      return { tilt: 0, hip: [-42, -40 + bob], sh: [32, -42 - bob], head: [54, -46 - bob], open: 0.35, ry: 15, shake: 0,
        tail: [-52, -40, -74, -48 + bob * 2, -92, -44],
        legs: [[-40, -34, -48 - ra * 8, -16, -44 - ra * 20, lift(ra) * 1.2], [30, -34, 36 + rb * 9, -16, 38 + rb * 22, lift(-rb)],
          [-36, -32, -44 - ra * 9, -14, -38 - ra * 22, lift(ra)], [34, -32, 42 + rb * 10, -14, 44 + rb * 22, lift(-rb) * 1.2]] };
    }
    case 'pounce':
      return { tilt: -0.22, hip: [-40, -42], sh: [30, -46], head: [52, -50], open: 1, ry: 15, shake: 0,
        tail: [-50, -44, -72, -60, -90, -58],
        legs: [[-38, -36, -56, -28, -74, -22], [28, -40, 46, -48, 64, -52], [-34, -34, -54, -24, -70, -16], [32, -38, 52, -42, 70, -44]] };
    case 'roar': {
      const o = 0.55 + 0.45 * Math.abs(Math.sin(ph));
      return { tilt: -0.05, hip: [-38, -40], sh: [28, -46], head: [44, -56], open: o, ry: 16, shake: 0,
        tail: [-48, -40, -66, -30 + a * 4, -76, -14 + a * 4],
        legs: [[-36, -34, -38, -16, -36, 0], [26, -36, 30, -16, 30, 0], [-32, -32, -34, -14, -30, 0], [30, -34, 34, -14, 36, 0]] };
    }
    case 'maul': {
      const k = Math.sin(ph * 2) * 4, w = Math.sin(ph) * 3;
      return { tilt: 0.1, hip: [-38, -38], sh: [24, -30 + w], head: [50 + k, -22 + Math.abs(k) * 0.5], open: 0.25 + 0.75 * Math.abs(Math.sin(ph * 2)), ry: 15, shake: k,
        tail: [-48, -38, -68, -50 + w * 3, -84, -44 + w * 4],
        legs: [[-36, -32, -46, -18, -40, 0], [22, -26, 34, -18, 44 + w, -10], [-32, -30, -42, -14, -34, 0], [26, -24, 40, -14, 52 - w, -8]] };
    }
    case 'chew': {
      const ch = Math.abs(Math.sin(ph)) * 0.3;
      return { tilt: 0, hip: [-36, -20], sh: [24, -22], head: [44, -28], open: ch, ry: 13, shake: 0,
        tail: [-46, -16, -64, -6 + a * 3, -80, -4 + a * 5],
        legs: [[-34, -14, -24, -6, -12, -2], [22, -14, 38, -6, 56, -4], [-30, -12, -20, -4, -8, 0], [26, -12, 42, -4, 60, -2]] };
    }
    default: {
      // (walking, or stood: the legs in their walk, half a beat apart near to far)
      const bob = pose === 'walk' ? Math.sin(ph * 2) : 0;
      return { tilt: 0, hip: [-38, -40 + bob], sh: [28, -44 + bob], head: [46, -48 + bob], open: 0, ry: 16, shake: 0,
        tail: [-48, -40, -66, -30 + a * 6, -74, -12 + a * 6],
        legs: [[-36, -34, -40 + b * 5, -16, -38 + b * 10, lift(Math.cos(ph + Math.PI))], [26, -36, 28 + a * 5, -16, 30 + a * 10, lift(Math.cos(ph))],
          [-32, -32, -36 + a * 5, -14, -32 + a * 10, lift(Math.cos(ph))], [30, -34, 32 + b * 5, -14, 34 + b * 10, lift(Math.cos(ph + Math.PI))]] };
    }
  }
};

const paintLion = (g: Ctx, pose: LionPose, fr: number, n: number, bloody: number) => {
  const ph = (fr / n) * Math.PI * 2, G = geo(pose, ph);
  const [hx, hy] = G.head;
  g.save();
  g.rotate(G.tilt);
  // (the tail: a whip of it, the dark tuft at its end)
  line(g, G.tail, 5.4, TAWNY[4]); line(g, G.tail, 3.6, TAWNY[2]);
  ell(g, G.tail[4], G.tail[5], 5.2, 4.2, MANE[4]); ell(g, G.tail[4], G.tail[5], 4.2, 3.2, MANE[3]); ell(g, G.tail[4] - 1, G.tail[5] - 1, 2, 1.4, MANE[1]);
  // (the legs: the far pair darker, behind)
  const leg = (L: number[], R: R5, w: number) => {
    line(g, L, w + 2.4, R[4]); line(g, L, w, R[2]); line(g, [L[0] - 1, L[1], L[2] - 1, L[3]], w * 0.35, R[1]);
    ell(g, L[4] + 2, L[5] - 2.6, w * 0.7 + 1, 3.6, R[4]); ell(g, L[4] + 2, L[5] - 2.8, w * 0.7, 2.8, R[1]);
    if (pose === 'pounce' || pose === 'maul') for (let k = 0; k < 3; k++) line(g, [L[4] + 4 + k * 1.6, L[5] - 1, L[4] + 6 + k * 1.6, L[5] + 2], 0.8, '#F2EAD8');
  };
  leg(G.legs[0], TAWNY_FAR, 6.5); leg(G.legs[1], TAWNY_FAR, 7);
  // (the body: barrel and haunch, the chest heavier, the belly paler)
  const [hpx, hpy] = G.hip, [shx, shy] = G.sh;
  const cx = (hpx + shx) / 2, cy = (hpy + shy) / 2 + 8, len = Math.hypot(shx - hpx, shy - hpy), ang = Math.atan2(shy - hpy, shx - hpx);
  banded(g, () => { g.ellipse(cx, cy, len / 2 + 14, G.ry, ang, 0, Math.PI * 2); g.moveTo(hpx + 14, hpy + 8); g.ellipse(hpx + 2, hpy + 8, 15, 15, 0, 0, Math.PI * 2); }, TAWNY, Math.min(hpy, shy) - 8, cy + G.ry + 2);
  ell(g, cx + 2, cy + G.ry * 0.62, len / 2 - 4, 3.2, PALE[2], ang);
  // (the near legs)
  leg(G.legs[2], TAWNY, 7); leg(G.legs[3], TAWNY, 7.6);
  // (the mane: a shaggy ruff round the head, two layers, dark to the outside; the collar across the bottom of it)
  const mx = hx - 7, my = hy + 3;
  const ruff = (r: number, spikes: number, jag: number, seed: number) => () => {
    for (let i = 0; i <= spikes * 2; i++) {
      const t = (i / (spikes * 2)) * Math.PI * 2, rr = i % 2 ? r - jag : r + jag * 0.4 + hash(seed + i) * 3;
      const x = mx + Math.cos(t) * rr, y = my + Math.sin(t) * rr * 1.08;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
  };
  banded(g, ruff(22, 14, 6, 3), MANE, my - 26, my + 24);
  banded(g, ruff(16, 11, 4, 9), MANE.map(c => mix(c, '#F0B060', 0.18)), my - 18, my + 16, 0.8);
  g.strokeStyle = FEZ[4]; g.lineWidth = 6.4; g.beginPath(); g.arc(mx + 1, my + 2, 15, Math.PI * 0.18, Math.PI * 0.8); g.stroke();
  g.strokeStyle = FEZ[1]; g.lineWidth = 4.4; g.stroke();
  g.strokeStyle = FEZ[0]; g.lineWidth = 1; g.beginPath(); g.arc(mx + 1, my + 2, 13.6, Math.PI * 0.22, Math.PI * 0.6); g.stroke();
  for (let k = 0; k < 5; k++) { const t = Math.PI * (0.24 + k * 0.13); box(g, mx + 1 + Math.cos(t) * 15 - 1, my + 2 + Math.sin(t) * 15 - 1, 2, 2, GOLD[1]); }
  // (the ears peeking over the mane, the face, the muzzle)
  for (const [ex, ey] of [[hx - 4, hy - 11], [hx + 5, hy - 12]] as Pt[]) { ell(g, ex, ey, 4, 3.6, TAWNY[4]); ell(g, ex, ey, 3, 2.6, TAWNY[2]); ell(g, ex + 0.4, ey + 0.6, 1.4, 1.2, '#5A3418'); }
  banded(g, () => g.ellipse(hx + 3, hy, 11, 10.5, 0, 0, Math.PI * 2), TAWNY, hy - 10, hy + 10);
  // (the jaw: dropped open, the fangs, the tongue)
  const o = G.open;
  if (o > 0.12) {
    ell(g, hx + 13, hy + 7 + o * 3, 6, 1 + o * 4, '#3A0A10'); ell(g, hx + 12, hy + 8 + o * 4, 4, 0.6 + o * 2, '#D8606A');
    g.save(); g.translate(hx + 6, hy + 7); g.rotate(o * 0.5);
    banded(g, () => { g.moveTo(-3, 0); g.lineTo(13, 0); g.quadraticCurveTo(14, 4, 10, 4.6); g.lineTo(-2, 4); g.closePath(); }, PALE, 0, 5, 0.8);
    for (const fx of [10, 5.6]) { g.fillStyle = '#FBF6E8'; g.beginPath(); g.moveTo(fx, 0.4); g.lineTo(fx + 1, -3); g.lineTo(fx + 2, 0.4); g.closePath(); g.fill(); }
    g.restore();
  }
  banded(g, () => g.ellipse(hx + 11, hy + 3.5, 7.6, 5, 0, 0, Math.PI * 2), PALE, hy - 1.5, hy + 8.5, 0.9);
  if (o > 0.12) for (const fx of [14.6, 10]) { g.fillStyle = '#FBF6E8'; g.beginPath(); g.moveTo(hx + fx, hy + 6.6); g.lineTo(hx + fx + 1, hy + 10 + o * 1.6); g.lineTo(hx + fx + 2, hy + 6.6); g.closePath(); g.fill(); }
  else line(g, [hx + 8, hy + 7, hx + 12, hy + 8, hx + 16, hy + 7], 0.8, '#3A1A0C');
  for (let i = 0; i < 3; i++) box(g, hx + 9 + i * 2, hy + 3.4, 1, 1, '#6A5034');
  g.fillStyle = '#3A1A10'; g.beginPath(); g.moveTo(hx + 15, hy - 0.6); g.lineTo(hx + 19.4, hy - 0.2); g.lineTo(hx + 17.4, hy + 3); g.closePath(); g.fill();
  line(g, [hx + 3, hy - 7, hx + 14, hy - 2.4], 1.4, TAWNY[0]);
  // (the eye: amber, narrowed under a heavy brow)
  ell(g, hx + 6.4, hy - 3, 2.8, 1.6, '#1A0E06'); ell(g, hx + 6.8, hy - 3, 2, 1.1, '#E8A830'); ell(g, hx + 7.2, hy - 3, 0.6, 1, '#0A0604'); box(g, hx + 6, hy - 3.8, 1, 1, '#FFFFFF');
  line(g, [hx + 2.6, hy - 5.6, hx + 9.4, hy - 4.8], 1.3, TAWNY[4]);
  // (the fez: tipped jauntily, its band, the tassel swinging off the back)
  g.save(); g.translate(hx + 2, hy - 9); g.rotate(-0.28);
  g.fillStyle = FEZ[4]; g.beginPath(); g.moveTo(-7.4, 1); g.lineTo(7.4, 1); g.lineTo(5.4, -11); g.lineTo(-5.4, -11); g.closePath(); g.fill();
  g.fillStyle = FEZ[1]; g.beginPath(); g.moveTo(-6.4, 0); g.lineTo(6.4, 0); g.lineTo(4.6, -10); g.lineTo(-4.6, -10); g.closePath(); g.fill();
  box(g, -4.4, -10, 3, 10, FEZ[0]); box(g, 2.6, -10, 2.4, 10, FEZ[2]); box(g, -6.4, -2.4, 12.8, 2.4, GOLD[2]); box(g, -6.4, -2.4, 12.8, 1, GOLD[0]);
  box(g, -4.6, -11, 9.2, 1.4, FEZ[3]);
  const sw = Math.sin(ph) * 2 + (pose === 'run' || pose === 'pounce' ? -3 : 0);
  line(g, [0, -10.6, -4, -10 + 1, -8 + sw, -4], 0.9, '#1A0E06');
  ell(g, -8 + sw, -2.4, 1.8, 2.8, GOLD[3]); ell(g, -8.4 + sw, -3, 1, 1.8, GOLD[1]);
  g.restore();
  // (the blood: over its muzzle, down its chin and the bottom of its mane, on its front paws)
  if (bloody > 0) {
    g.globalAlpha = Math.min(1, bloody);
    ell(g, hx + 12, hy + 7, 7, 3.4, BLOOD[1]); ell(g, hx + 14, hy + 5, 3.4, 1.8, BLOOD[2]); line(g, [hx + 8, hy + 9, hx + 7, hy + 14, hx + 8, hy + 17], 1.4, BLOOD[1]);
    ell(g, mx + 6, my + 18, 7, 3, BLOOD[0]); ell(g, mx + 8, my + 17, 3, 1.6, BLOOD[2]);
    for (const L of [G.legs[1], G.legs[3]]) { ell(g, L[4] + 2, L[5] - 3, 5, 2.4, BLOOD[1]); ell(g, L[4] + 3, L[5] - 3.4, 2, 1, BLOOD[3]); }
    g.globalAlpha = 1;
  }
  g.restore();
};

/** The lion at (x, feetY), facing (1 right), its own frame `t`, in a pose (scaled `s`). */
export const drawCircusLion = (c: Ctx, x: number, feetY: number, facing: number, t: number, pose: LionPose, o: { bloody?: number; s?: number } = {}) => {
  const per = pose === 'run' ? 0.45 : pose === 'walk' ? 0.11 : pose === 'maul' ? 0.32 : pose === 'chew' ? 0.14 : pose === 'roar' ? 0.12 : 0;
  const n = pose === 'run' || pose === 'walk' ? 8 : pose === 'maul' || pose === 'roar' ? 6 : pose === 'chew' ? 4 : 1;
  const fr = per ? Math.floor(((((t * per) / (Math.PI * 2)) % 1 + 1) % 1) * n) : 0;
  const bloody = Math.round((o.bloody ?? 0) * 2) / 2, s = o.s ?? 1;
  c.save(); c.translate(Math.round(x), Math.round(feetY)); c.scale((facing < 0 ? -1 : 1) * s, s);
  stamp(c, `fr-circlion-${pose}-${fr}-${bloody}`, -100, -112, 200, 124, g => paintLion(g, pose, fr, n, bloody));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The cage wagon on the circus flat (in place of the logs; its roof at the logs' height, to stand on)

const Dk = DECK - GY;
const TP = (TOP.flat ?? DECK - 132) - GY;
/** The cage's inside: its floor (the straw) and its top (under the header). */
const FLOOR = Dk - 38, HEAD_B = TP + 26;

const paintCageBack = (g: Ctx, len: number) => {
  const a = END, w = len - 2 * END;
  // (the flat's deck)
  box(g, a - 1, Dk - 8, w + 2, 9, INK); boards(g, a, Dk - 7, w, 7, N(VARNISH), 7, 5);
  // (the inside: dark boards, the straw on the floor)
  box(g, a + 6, HEAD_B - 2, w - 12, FLOOR - HEAD_B + 4, '#160A08');
  for (let x = a + 10; x < a + w - 10; x += 18) { box(g, x, HEAD_B, 1, FLOOR - HEAD_B, '#241410'); box(g, x + 1, HEAD_B, 1, FLOOR - HEAD_B, '#0C0604'); }
  checker(g, a + 6, HEAD_B, w - 12, 10, '#0A0404', 0, 2);
  const Hy = N(HAY);
  box(g, a + 6, FLOOR - 6, w - 12, 6, Hy[2]);
  for (let i = 0; i < 60; i++) { const x = a + 8 + hash(i * 3.3) * (w - 18), h2 = 2 + hash(i * 1.7) * 5; box(g, x, FLOOR - h2, 1, h2, i % 3 ? Hy[4] : Hy[5]); }
  // (a gnawed bone in the straw)
  box(g, a + w * 0.7, FLOOR - 4, 14, 3, '#E8E0CC'); box(g, a + w * 0.7 - 2, FLOOR - 5, 3, 5, '#F4ECD8'); box(g, a + w * 0.7 + 13, FLOOR - 5, 3, 5, '#F4ECD8');
};

const paintCageFront = (g: Ctx, len: number, open: boolean) => {
  const a = END, w = len - 2 * END, R = N(RED), B = N(BRASS);
  // (the sunburst wheels under it, on the deck)
  for (const wx of [a + 44, a + 104, a + w - 104, a + w - 44]) {
    const cy = Dk - 21, r = 13;
    ell(g, wx, cy, r + 1.4, r + 1.4, INK); ell(g, wx, cy, r, r, B[3]); ell(g, wx, cy, r - 2.4, r - 2.4, R[2]);
    for (let k = 0; k < 12; k++) { const t = (k / 12) * Math.PI * 2; line(g, [wx, cy, wx + Math.cos(t) * (r - 2), cy + Math.sin(t) * (r - 2)], 1.6, k % 2 ? R[4] : B[4]); }
    ell(g, wx, cy, 3.4, 3.4, INK); ell(g, wx, cy, 2.4, 2.4, B[5]);
  }
  // (the chassis rail along the bottom: red, a gold stripe and scrolls)
  box(g, a - 1, FLOOR - 1, w + 2, 14, INK); box(g, a, FLOOR, w, 12, R[3]); box(g, a, FLOOR, w, 2, R[5]); box(g, a, FLOOR + 10, w, 2, R[1]);
  box(g, a + 4, FLOOR + 5, w - 8, 2, B[4]);
  for (let x = a + 30; x < a + w - 20; x += 60) { g.strokeStyle = B[4]; g.lineWidth = 1; g.beginPath(); g.arc(x, FLOOR + 6, 4, Math.PI * 0.2, Math.PI * 1.8); g.stroke(); }
  // (the bars: brass, lit down their left; the middle ones bent out and apart when it's broken open)
  const bars: number[] = [];
  for (let x = a + 16; x < a + w - 14; x += 15) bars.push(x);
  const midI = Math.floor(bars.length / 2);
  bars.forEach((x, i) => {
    const bent = open && Math.abs(i - midI) <= 1 && i !== midI;
    if (open && i === midI) return;
    if (bent) {
      const dir = i < midI ? -1 : 1;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, HEAD_B); g.quadraticCurveTo(x + dir * 22, (HEAD_B + FLOOR) / 2, x, FLOOR); g.stroke();
      g.strokeStyle = B[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = B[5]; g.lineWidth = 1; g.stroke();
      return;
    }
    box(g, x - 1, HEAD_B, 5, FLOOR - HEAD_B, INK); box(g, x, HEAD_B, 3, FLOOR - HEAD_B, B[3]); box(g, x, HEAD_B, 1, FLOOR - HEAD_B, B[5]); box(g, x + 2, HEAD_B, 1, FLOOR - HEAD_B, B[1]);
  });
  // (the corner posts: carved, gilt)
  for (const px of [a, a + w - 12]) { box(g, px - 1, TP - 1, 14, FLOOR - TP + 14, INK); box(g, px, TP, 12, FLOOR - TP + 12, B[3]); box(g, px, TP, 3, FLOOR - TP + 12, B[5]); box(g, px + 9, TP, 3, FLOOR - TP + 12, B[1]); for (let y = TP + 34; y < FLOOR; y += 12) box(g, px + 3, y, 6, 2, B[2]); }
  // (the header: red, gold-edged, CIRCUS, stars either side; the cornice over it, its top lit: he stands on it)
  box(g, a - 5, TP - 1, w + 10, 28, INK); box(g, a - 4, TP, w + 8, 26, R[3]); box(g, a - 4, TP + 6, w + 8, 2, B[4]); box(g, a - 4, TP + 22, w + 8, 2, B[3]);
  checker(g, a - 4, TP + 8, w + 8, 2, R[4], 0, 1);
  box(g, a - 6, TP - 1, w + 12, 7, INK); box(g, a - 5, TP, w + 10, 5, R[2]); box(g, a - 5, TP + 4, w + 10, 1, R[1]);
  lip(g, a - 5, TP, w + 10, ['#3A0A0C', '#A3262A', '#F09070', '#FFD0B0']);
  signText(g, 'CIRCUS', a + w / 2, TP + 21, { sx: 2, sy: 2, fill: [GOLD[0], GOLD[1], GOLD[2]], shadow: R[0] });
  for (const sx of [a + w / 2 - 80, a + w / 2 + 80, a + 40, a + w - 40]) { g.fillStyle = B[5]; g.beginPath(); for (let k = 0; k < 10; k++) { const t = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? 2.4 : 6; if (k) g.lineTo(sx + Math.cos(t) * rr, TP + 15 + Math.sin(t) * rr); else g.moveTo(sx + Math.cos(t) * rr, TP + 15 + Math.sin(t) * rr); } g.closePath(); g.fill(); }
  // (the plaques wired to the bars)
  const plaque = (x: number, text: string, ink: string, col: string) => {
    const pw = text.length * 6 + 10;
    box(g, x - pw / 2 - 1, HEAD_B + 5, pw + 2, 13, INK); box(g, x - pw / 2, HEAD_B + 6, pw, 11, ink); box(g, x - pw / 2, HEAD_B + 6, pw, 1, mix(ink, '#FFFFFF', 0.25));
    line(g, [x - pw / 2 + 4, HEAD_B + 6, x - pw / 2 + 8, HEAD_B], 1, '#9A9AA2'); line(g, [x + pw / 2 - 4, HEAD_B + 6, x + pw / 2 - 8, HEAD_B], 1, '#9A9AA2');
    signText(g, text, x, HEAD_B + 15, { sx: 1, sy: 1, fill: col });
  };
  plaque(a + w * 0.24, 'MAN-EATER', '#3A2410', '#F2E4C4');
  plaque(a + w * 0.78, open ? 'ESCAPED' : 'DO NOT FEED', open ? '#F2E4C4' : '#3A2410', open ? '#B91C1C' : '#F2E4C4');
};

/** The cage wagon on car `CIRCUS` at x (its left end): `live` with the lion in it (by tr.cage), `open` broken open and
 *  empty (the end of the line, the wreck). */
export const drawCage = (c: Ctx, state: GameState, x: number, len: number, mode: 'live' | 'open') => {
  stillAt(c, `tr-cage-back-${len}`, x, GY, END - 4, TP - 4, len - 2 * END + 8, Dk - TP + 8, g => paintCageBack(g, len));
  if (mode === 'live') {
    const cg = trainOf(state).cage;
    const pose: LionPose = cg.roar > 0 ? 'roar' : cg.walk ? 'walk' : 'stand';
    drawCircusLion(c, x + cg.rx, GY + FLOOR, cg.facing, cg.t, pose, { s: 0.9 });
  }
  stillAt(c, `tr-cage-front-${len}-${mode}`, x, GY, END - 8, TP - 4, len - 2 * END + 16, Dk - TP + 8, g => paintCageFront(g, len, mode === 'open'));
};

// ---------------------------------------------------------------------------------------------------------------
// The lion in its cage (each frame), and out of it

/** Each frame: the caged lion pacing (following him along under the bars while he's near, roaring up at him); his
 *  line the first time he sees it; the lion out of the wreck and away. */
export const updateCage = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player, cg = tr.cage;
  const cx = p.pos.x + p.width / 2;
  updateEscape(state);
  if (CIRCUS < 0 || tr.cars[CIRCUS]?.gone || tr.phase === 'still' || tr.lion) return;
  cg.t++;
  const x = carXNow(tr, CIRCUS), len = CARS[CIRCUS].len, lo = END + 80, hi = len - END - 80;
  const near = p.health > 0 && Math.abs(cx - (x + len / 2)) < len / 2 + 260;
  const target = near ? Math.max(lo, Math.min(hi, cx - x)) : Math.floor(cg.t / 420) % 2 ? lo + 20 : hi - 20;
  const d = target - cg.rx;
  cg.walk = Math.abs(d) > 3 && cg.roar <= 0;
  if (cg.walk) { cg.rx += Math.sign(d) * Math.min(near ? 2.2 : 0.9, Math.abs(d)); cg.facing = d > 0 ? 1 : -1; }
  else if (near) cg.facing = cx >= x + cg.rx ? 1 : -1;
  if (cg.roar > 0) cg.roar--;
  const seen = inView(state, x + END, x + len - END, 0);
  if (--cg.roarCd <= 0 && near && seen && !p.inCutscene) { cg.roar = 54; cg.roarCd = 170 + Math.floor(Math.random() * 90); playSound('roar', 0.5, -3); }
  // (his line about it: once he's off the caboose (the boarding's said), with it on screen)
  if (!tr.said.lionCage && tr.phase === 'ride' && seen && cx > CAR_X[1] && p.health > 0 && !p.inCutscene) { tr.said.lionCage = true; meatheadSays(state, pickLine(byPants(state, LION_CAGE))); }
};

/** Its car's blown (cars.ts derail): the lion leaps out of the fire, lands on the near bank and is off back down the
 *  line (his line on it is cars.ts's, if he made it across). */
export const lionEscapes = (state: GameState, x: number) => {
  const tr = trainOf(state);
  tr.escape = { x, y: DECK - 50, vx: -2.4, vy: -11, t: 0 };
  playSound('roar', 1, 0);
};
/** The ground the escape lands on: the near lane (the robbers' (kinds.ts FG_GROUND), nearer, so bigger). */
const BANK = GY + 40;
const updateEscape = (state: GameState) => {
  const tr = trainOf(state), e = tr.escape;
  if (!e) return;
  e.t++;
  if (e.y < BANK) { e.vy += 0.6; e.y = Math.min(BANK, e.y + e.vy); e.x += e.vx; if (e.y >= BANK) { playSound('thud', 0.6, -6); shakeScreen(state, 4, 2); } }
  else e.x += -9 - tr.v * 1.25;
  if (e.t > 600 || (e.y >= BANK && e.x < viewOf(state).x - 300)) tr.escape = null;
};
export const drawEscape = (c: Ctx, state: GameState) => {
  const e = trainOf(state).escape;
  if (!e || !inDrawn(state, e.x - 120, e.x + 120)) return;
  const air = e.y < BANK;
  drawCircusLion(c, e.x, e.y, -1, e.t, air ? 'pounce' : 'run', { s: 1.2 });
  if (e.t < 120 && (e.t >> 3) % 4 !== 3) label(c, "THE LION'S LOOSE!", e.x, e.y - 96, '#FDE047', 8);
};

// ---------------------------------------------------------------------------------------------------------------
// Off the train onto the tracks

/** How long he lies there twitching once he's stopped; getting up; when he says he's okay (frames from stopping). */
const TWITCH = 84, RISE = 28, OK_AT = TWITCH + RISE + 12;
/** The maul (frames from the lion landing on him), and the least time it lies on him chewing before that's it. */
const MAUL = 150, CHEW = 56;
const MAUL_POPS = ['CHOMP!', 'RIP!', 'SHAKE!', 'GNAW!', 'SPLORT!'];

/** Down on the ties while it's moving: the scene, from this frame on. */
export const startMaul = (ctx: FrameContext) => {
  const { state } = ctx, tr = trainOf(state), p = state.player;
  if (tr.lion) return;
  const cx = p.pos.x + p.width / 2;
  tr.lion = {
    t: 0, x: cx, h: Math.max(0, GY - (p.pos.y + p.height)), vx: Math.max(3.5, Math.min(7.5, 5.5 + p.vel.x * 0.3)), vh: -5, rot: 0, spin: 0.32,
    stoppedAt: -1, okAt: -1, saidOk: false, off: 0, trainV: Math.max(6, tr.v), smears: [], lion: null, hitAt: -1, screamDone: -1, kill: '',
  };
  p.inCutscene = true; p.hidden = true; p.vel = { x: 0, y: 0 }; p.invincibilityTimer = 0; p.facing = 1;
  // (it's sealed: nobody else gets in on it; what's on the train goes with the train; a cut being warned of is off)
  clearForDoom(state);
  tr.riders = []; tr.horses = []; tr.shots = []; tr.stash = []; tr.tube = null; tr.tubeBusy = false;
  if (tr.cut && tr.cut.phase === 'tell') tr.cut = null;
  state.pickups = state.pickups.filter(q => !q.id.startsWith('train-'));
  playSound('slam', 1, -4); playSound('crunch', 0.6, -2); shakeScreen(state, 14, 7);
  for (let n = 0; n < 14; n++) state.particles.push({ pos: { x: cx, y: GY - 8 }, vel: { x: 1 + Math.random() * 5, y: -Math.random() * 5 }, life: 30, color: n % 2 ? '#8A8278' : GORE[n % GORE.length], size: 2 + Math.random() * 3 });
};

/** How far the train's gone on since he came off it (it's drawn moved on by that). */
export const trainOff = (state: GameState) => trainOf(state).lion?.off ?? 0;

/** Each frame of it (the train section's update hands over to this). */
export const updateMaul = (ctx: FrameContext): Controls => {
  const { state, fx } = ctx, tr = trainOf(state), p = state.player, m = tr.lion!;
  if (state.deathTimer > 0) return hands();
  m.t++;
  if (skipDying(ctx, m.t, () => (m.kill = pickLine(HURT[LION_SRC].death)))) return hands();
  p.inCutscene = true; p.hidden = true; p.vel = { x: 0, y: 0 }; p.facing = 1;
  // (the world's stood still under him; the train goes on without him)
  tr.v = 0; tr.vTarget = 0;
  m.off += m.trainV;
  if (m.stoppedAt < 0) tumble(state, fx, m);
  else afterTumble(ctx, m);
  // (his words go up over where he is: the real him is hidden, his feet kept on the ties (never down through them))
  p.pos = { x: m.x - p.width / 2, y: GY - m.h - p.height };
  return hands();
};

/** Off the train along the ties: bouncing, spinning, smearing, slowing; stopped, face down. */
const tumble = (state: GameState, fx: FrameContext['fx'], m: Maul) => {
  m.vh += 0.75; m.h -= m.vh;
  if (m.h <= 0) {
    m.h = 0;
    if (m.vh > 3 && m.vx > 1.5) {
      m.vh = -m.vh * 0.5; m.spin = (Math.random() < 0.5 ? -1 : 1) * (0.22 + m.vx * 0.03);
      shakeScreen(state, 8, 4); playSound('thud', 1, -4);
      fx.spawnDeathShower({ x: m.x, y: GY - 10 }, 1, 0.3);
      m.smears.push({ x: m.x, w: 16 + m.vx * 3 });
      // (the once: he's not under the wheels, but he's on the tracks)
      if (m.t > 3 && m.smears.length === 1) meatheadSays(state, pickLine(HURT['m2:fr_tracks'].hurt.slice(0, 1)), false);
    } else m.vh = 0;
  }
  const scraping = m.h <= 0.5;
  m.vx = Math.max(0, m.vx - (scraping ? 0.2 : 0.05));
  m.x += m.vx;
  m.rot += m.vx > 0.4 ? m.spin * (m.h > 0 ? 1 : 0.5) : 0;
  if (scraping && m.vx > 0.5 && m.t % 3 === 0) m.smears.push({ x: m.x, w: 6 + m.vx * 2 });
  if (m.vx <= 0 && m.h <= 0) { m.stoppedAt = m.t; playSound('thud', 0.6, -8); }
};

/** Stopped: twitching; up; okay; the lion. */
const afterTumble = (ctx: FrameContext, m: Maul) => {
  const { state, fx } = ctx;
  const s = m.t - m.stoppedAt;
  if (s === TWITCH) playSound('land', 0.5, 2);
  // (he's okay: said in full before anything else happens (no talking over it))
  if (s === OK_AT) { m.saidOk = true; meatheadSays(state, pickLine(byPants(state, IM_OKAY)), true, () => { if (m.okAt < 0) m.okAt = m.t; }); }
  if (m.saidOk && m.okAt < 0 && s > OK_AT + 480) m.okAt = m.t;
  // (a beat; then it comes in from behind at a dead run)
  if (m.okAt >= 0 && !m.lion && m.t >= m.okAt + 16) {
    m.lion = { x: viewOf(state).x - 140, h: 0, vx: 14, vh: 0, t: 0, mode: 'run' };
    playSound('roar', 1, -2); shakeScreen(state, 6, 3);
  }
  const L = m.lion;
  if (!L) return;
  L.t++;
  if (L.mode === 'run') {
    L.x += L.vx;
    if (L.t % 8 === 0) playSound('stomp', 0.5, 4);
    if (L.x >= m.x - 210) { L.mode = 'leap'; L.vx = 7; L.vh = -8.5; playSound('roar', 1, 2); }
  } else if (L.mode === 'leap') {
    L.x += L.vx; L.vh += 0.7; L.h = Math.max(0, L.h - L.vh);
    if (L.h <= 0 && L.vh > 0) {
      // (on his back: down he goes, face first onto the ties)
      L.mode = 'maul'; L.t = 0; L.h = 0; L.x = m.x - 40; m.hitAt = m.t;
      shakeScreen(state, 20, 10); playSound('crunch', 1, -4); playSound('splat', 1, -2); playSound('roar', 1, -6);
      fx.spawnDeathShower({ x: m.x + 10, y: GY - 30 }, 1, 0.7);
    }
  } else if (L.mode === 'maul') {
    if (L.t === 8) meatheadSays(state, pickLine(HURT[LION_SRC].hurt), false, () => { if (m.screamDone < 0) m.screamDone = m.t; });
    if (L.t % 7 === 0) playSound(L.t % 21 === 0 ? 'crunch' : 'gnaw', 0.85, (Math.random() - 0.5) * 6);
    if (L.t % 2 === 0) for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: m.x + 2 + (Math.random() - 0.5) * 34, y: GY - 18 - Math.random() * 6 }, vel: { x: (Math.random() - 0.4) * 6, y: -2 - Math.random() * 6 }, life: 40, color: GORE[(L.t + k) % GORE.length], size: 2 + Math.random() * 4, grav: 0.35 });
    if (L.t % 30 === 15) {
      fx.spawnDamageNumber({ x: m.x - 30 + Math.random() * 30, y: GY - 120 }, MAUL_POPS[Math.floor(L.t / 30) % MAUL_POPS.length], true, '#F87171');
      fx.spawnDeathShower({ x: m.x + 6, y: GY - 24 }, Math.random() < 0.5 ? -1 : 1, 0.25);
      shakeScreen(state, 8, 4);
    }
    if (L.t >= MAUL) { L.mode = 'chew'; L.t = 0; playSound('roar', 0.5, -9); }
  } else if (L.mode === 'chew') {
    if (L.t % 18 === 0) playSound('gnaw', 0.5, -4);
    // (that's it, once his scream's done (it's never talked over))
    const quiet = m.screamDone >= 0 || L.t > 300;
    if (L.t >= CHEW && quiet && state.deathTimer <= 0) {
      m.kill = pickLine(HURT[LION_SRC].death);
      state.lastHurt = { source: LION_SRC, at: state.frame };
      killPlayer(ctx, m.kill, false);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing it (world, in front of the train; the train itself is drawn moved on by `off`, index.ts)

const drawBody = (c: Ctx, state: GameState, cx: number, cy: number, rot: number, extra: Record<string, unknown>) => {
  const p = state.player;
  c.save(); c.translate(cx, cy); c.rotate(rot);
  const b = {
    ...p, pos: { x: -p.width / 2, y: -p.height / 2 }, facing: 1, hidden: false, headless: 0, shownDead: false, isGrounded: true,
    vel: { x: 0, y: 0 }, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0, isCharging: false, isSliding: false, isUppercutting: false,
    isDivekicking: false, isDucking: false, squash: 0, hurtForm: null, hurtFormTimer: 0, filthShieldTimer: 0, ...extra,
  };
  drawPlayer(c, b as typeof p, { ...state, blocks: [], groundRuns: [], deathTimer: 0, playerVulgarityTimer: extra.talking ? state.playerVulgarityTimer : 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  c.restore();
};

export const drawMaul = (c: Ctx, state: GameState) => {
  const m = trainOf(state).lion;
  if (!m) return;
  const f = state.frame;
  // (what he's left on the ties)
  for (const s of m.smears) { box(c, s.x - s.w, GY - 6, s.w, 4, 'rgba(127, 29, 29, 0.85)'); box(c, s.x - s.w * 0.7, GY - 5, s.w * 0.6, 2, 'rgba(185, 28, 28, 0.9)'); }
  const stopped = m.stoppedAt >= 0, s = stopped ? m.t - m.stoppedAt : 0, hit = m.hitAt >= 0 ? m.t - m.hitAt : -1;
  if (stopped) drawBloodPool(c, Math.round(m.x), GY - 2, Math.round(Math.min(hit >= 0 ? 90 : 30, 12 + s * 0.25 + Math.max(0, hit) * 0.5)), 731, { dx: -0.3 });
  const L = m.lion;
  const LYING = Math.PI / 2, lieY = GY - 13, standY = GY - 32;
  if (!stopped) {
    drawBody(c, state, m.x, GY - m.h - 30, m.rot, { deathFace: 'scream', hurtTimer: 30, vel: { x: -3, y: 4 }, isGrounded: false });
  } else if (hit >= 0) {
    // (knocked flat under it, face down; kicking, then not)
    const k = Math.min(1, hit / 8), kick = hit < MAUL && ((hit >> 2) & 1) && hit % 40 < 26;
    const jit = hit < MAUL ? Math.sin(hit * 1.7) * 0.05 : 0;
    drawBody(c, state, m.x + k * 14, standY + (lieY - standY) * k, LYING * k + jit, { deathFace: hit < 60 ? 'scream' : hit < MAUL ? 'agony' : 'dead', vel: { x: kick ? 3 : 0, y: 0 } });
    // (torn up: blood all over his back, more and more)
    const torn = Math.min(1, hit / 90);
    for (let i = 0; i < 9; i++) {
      if (hash(i * 3.7) > torn) continue;
      const bx = m.x + 14 - 26 + hash(i * 1.3) * 52, by = lieY - 10 + hash(i * 5.1) * 9;
      c.fillStyle = BLOOD[i % 3]; c.beginPath(); c.ellipse(bx, by, 4 + hash(i) * 6, 2 + hash(i * 2) * 2, 0, 0, Math.PI * 2); c.fill();
    }
  } else if (s < TWITCH) {
    // (face down on the ties, twitching)
    const tw = s % 37 < 4 || s % 59 < 3 ? (Math.random() - 0.5) * 0.3 : 0;
    drawBody(c, state, m.x + (tw ? Math.random() * 2 - 1 : 0), lieY, LYING + tw, { deathFace: 'agony' });
    if (s % 37 < 4) box(c, m.x + 34, GY - 10 - (s % 4), 8, 3, '#E0AC69');
  } else {
    // (up on his feet, swaying, a twitch now and then: he's okay)
    const up = Math.min(1, (s - TWITCH) / RISE), jerk = s % 23 < 2 || s % 41 < 2 ? (Math.random() - 0.5) * 4 : 0;
    drawBody(c, state, m.x + jerk, lieY + (standY - lieY) * up, LYING * (1 - up) + up * (Math.sin(s * 0.08) * 0.08 + jerk * 0.02), { talking: up >= 1, hurtTimer: up < 1 ? 20 : 0 });
  }
  if (L) {
    const pose: LionPose = L.mode === 'run' ? 'run' : L.mode === 'leap' ? 'pounce' : L.mode;
    const feet = L.mode === 'chew' ? GY - 10 : L.mode === 'maul' ? GY - 4 : GY - L.h;
    drawCircusLion(c, L.x, feet, 1, L.mode === 'maul' || L.mode === 'chew' ? L.t : f, pose, { bloody: L.mode === 'maul' ? Math.min(1, L.t / 30) : L.mode === 'chew' ? 1 : 0 });
  }
};
