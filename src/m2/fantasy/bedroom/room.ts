// THE GREAT PIXIE'S CHAMBERS, painted (the SNES pass): every material in a six-step ramp lit from the upper left,
// stepped shading with a checker dither where steps meet, inked edges, banded gradients. Still art is painted once into
// stamps (kit.ts still: the walls in 256-wide stretches, the wreck a stamp a stage, each piece of furniture its own) and
// only what moves is drawn live over it (candle flames, the mirror's glass and her in it, glints, drips, balloons).
//
//   THE HALL     the castle's top floor outside her door: the tall lancet he came in by (pink and lilac leaded glass, its
//                heart rose smashed through, shards hanging in the cames, the grounds and the sky by the hour out the
//                hole, a velvet drape torn), glass all over the runner; striped satin paper over a cream wainscot, pink
//                marble pilasters with gilt capitals carrying gilt sconces, painted lunettes (a pink sky, clouds, a gilt
//                heart) under a coffered vault; portraits of herself, her tapestry, a console with roses, the plaque
//                (DO NOT DISTURB / UNLESS YOU WON), and HER DOOR: tall, double, pink with gilt panels, heart knockers, a
//                crowned P over it. Kicked in, it's flat on her carpet.
//   HER BEDROOM  a princess's chambers: rose damask in panels framed in gilt between fluted pink marble pilasters, a rose
//                garland frieze, a deep crown molding (dentils, egg and dart), a cream wainscot of raised panels, a rose
//                carpet with gilt borders strewn with petals. THE TROPHY WALL (the suitors who died for her, their heads
//                mounted on walnut shields with their names: comic, X-eyed, tongues out) under the SCOREBOARD (MEN WHO
//                DIED FOR ME, chalked in fives, AND COUNTING). The VANITY (a tulle skirt, perfumes, a candelabra) under
//                a HUGE oval mirror in a crowned gilt frame ringed with bulbs (her reflection in it). Two rococo WARDROBES
//                (their tops ledges, lit), one ajar on her gowns. Her heart-backed CHAISE. The CANOPY BED (twisted gilt
//                posts, a valance with fringe and tassels, its top a ledge, lit) under a gilt crown corona with drapes
//                swept down behind it. PORTRAITS of herself. The VIEWING BALCONY (a marble slab, lit, on a balustrade
//                and gilt corbels) in front of tall arched doors open on the grounds by the hour; the footstool up to it.
//                Two crystal CHANDELIERS.
//   ABOVE IT     the dollhouse cut (seen when the camera pulls out, and the cork goes up through it): the ceiling's
//                joists, the park's service crawlspace (a duct, the water main and its valves, the lagged HEAT main, the
//                twin LIQUID NITROGEN lines frosted over, the FX POWER cable tray, work lights, stenciled plates), then
//                the inside of the spire's cone (rafters, purlins, a king post, stored merch, an oculus on the sky).
//   THE WRECK    each slam takes it further (up to MAX_STAGE): 1 cracks; 2 plaster down (holes through the cornice into
//                the crawlspace's mains, rubble under them), the mirror cracked; 3 the damask torn and hanging, the
//                canopy down, the portraits askew; 4 more holes, holes in the walls (studs, pink insulation, risers); 5 a
//                chandelier down, worse cracks, the portraits further gone; 6 cables hanging out of it all.

import type { GameState } from '../../../m1/game/core/state';
import { box, mix, hash, INK, gilt, checker, polyF, still, ballR, GOLD as GD, TIMBER, type Ctx } from '../kit';
import { signText } from '../../signLetters';
import { type PiperPose } from '../piper';
import { R as gR } from '../../grossKit';
import { bust as grossBust, drawBust } from '../../grossBust';
import { drawSuitor, type SuitorLook } from '../suitors';
import { timeOfDay, skyRamp } from '../../timeOfDay';
import { parkView } from './view';
import { ROOF, PALE, PINK, lip, sconce, flame, banner } from '../keep/paint';
import { GY, HALL_L, DOOR_X, ARENA_L, ARENA_R, ARENA_W, ARENA_MID, CEIL_Y, LEDGES, CHANDELIERS, CHAISE_X, VANITY_X, TROPHY_X, R } from './layout';

// ---------------------------------------------------------------------------------------------------------------
// Ramps (darkest first)

const DAM = ['#5A1A3E', '#8A2E5E', '#B44C82', '#D86EA4', '#EE98C2', '#FFC8E2'];
const STRIPE = ['#5E2448', '#8E3A68', '#BC5A8C', '#E084B0', '#F4AACC', '#FFD6EA'];
const CREAM = ['#4E3446', '#7E5E72', '#AE8EA2', '#D8C0CE', '#F0E2EA', '#FFFFFF'];
const MARB = ['#4A2440', '#7A4066', '#A86290', '#D08AB4', '#EEB4D2', '#FFE2F0'];
const CARP = ['#3A0A24', '#5E1438', '#86204E', '#AE3468', '#D05088', '#EE7AAA'];
const VELV = ['#4A0E2E', '#7A1E4C', '#A8326E', '#D04E90', '#EC7AB2', '#FFB0D4'];
const SATIN = ['#7A2A56', '#B04A82', '#DC70A8', '#F49AC6', '#FFC4E0', '#FFF0F8'];
const PLAST = ['#4A3E38', '#7A6A60', '#A89888', '#D0C2B0', '#EAE0D0', '#FAF4EA'];
const CONC = ['#141218', '#201E28', '#2E2C38', '#3E3C4A', '#545262', '#706E80'];
const STEEL = ['#1C1E26', '#30343E', '#4A505C', '#6A707E', '#9098A6', '#C4CAD6'];
const HEATC = ['#3A0E06', '#6A1E0E', '#9A3214', '#C84A1E', '#EE7A3A', '#FFB078'];
const LN2C = ['#0E2A4A', '#1E4A7A', '#3A72AA', '#5AA0D8', '#9ACCF0', '#E0F4FF'];
const LEAF = ['#123018', '#1E4826', '#2E6436', '#448248', '#64A460', '#94C886'];
const WALNUT = TIMBER;
const CAV = '#0C070B';

// ---------------------------------------------------------------------------------------------------------------
// Little painting helpers

const B = box;
const pmap = (g: Ctx, map: readonly string[], x: number, y: number, col: string, s = 1) => {
  for (let r = 0; r < map.length; r++) for (let k = 0; k < map[r].length; k++) if (map[r][k] === '#') B(g, x + k * s, y + r * s, s, s, col);
};
const disc = (g: Ctx, x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2); g.fill(); };
const ell = (g: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fill(); };
const FLEUR = ['...#...', '..###..', '...#...', '#.###.#', '##.#.##', '.#####.', '...#...', '..###..', '.#...#.'];
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const HEART5 = ['##.##', '#####', '.###.', '..#..'];
const CROWN = ['.....#.....', '#...###...#', '##..#.#..##', '#.#.#.#.#.#', '#..#...#..#', '###########', '#.#.#.#.#.#'];
const BOW = ['##...##', '###.###', '.##.##.', '..###..', '.#...#.', '#.....#'];

/** A gilt molding along x..x+w at y, h tall: lit along its top, shaded along its foot, beads down its middle. */
const giltBand = (g: Ctx, x: number, y: number, w: number, h: number, beads = true) => {
  B(g, x, y, w, h, GD[3]); B(g, x, y, w, 1, GD[5]); if (h > 3) B(g, x, y + 1, w, 1, GD[4]);
  B(g, x, y + h - 1, w, 1, GD[0]); if (h > 3) B(g, x, y + h - 2, w, 1, GD[1]);
  if (beads && h >= 6) { const my = y + Math.floor(h / 2) - 1; for (let k = Math.floor(x / 4) * 4; k < x + w - 1; k += 4) { if (k < x) continue; B(g, k, my, 2, 2, GD[4]); B(g, k, my, 1, 1, GD[5]); B(g, k + 1, my + 1, 1, 1, GD[1]); } }
};
/** A gilt frame round x, y, w, h, t thick: inked, lit top and left, shaded right and foot, a bead line inside. The
 *  field's the caller's. */
const giltFrame = (g: Ctx, x: number, y: number, w: number, h: number, t = 4) => {
  B(g, x - t - 1, y - t - 1, w + 2 * t + 2, h + 2 * t + 2, INK);
  B(g, x - t, y - t, w + 2 * t, h + 2 * t, GD[3]);
  B(g, x - t, y - t, w + 2 * t, 1, GD[5]); B(g, x - t, y - t, 1, h + 2 * t, GD[5]); B(g, x - t + 1, y - t + 1, w + 2 * t - 2, 1, GD[4]);
  B(g, x - t, y + h + t - 1, w + 2 * t, 1, GD[0]); B(g, x + w + t - 1, y - t, 1, h + 2 * t, GD[1]); B(g, x + w + t - 2, y - t + 1, 1, h + 2 * t - 2, GD[2]);
  if (t >= 4) for (let k = x - t + 3; k < x + w + t - 3; k += 3) { B(g, k, y - t + 2, 1, 1, GD[5]); B(g, k, y + h + t - 3, 1, 1, GD[2]); }
  B(g, x - 1, y - 1, w + 2, h + 2, GD[1]); B(g, x - 1, y - 1, w + 2, 1, GD[0]);
};
/** A rose (garlands, petals' source): a bloom in steps, two leaves. */
const rose = (g: Ctx, x: number, y: number, s = 1) => {
  B(g, x - 3 * s, y + s, 2 * s, s, LEAF[3]); B(g, x + s, y + s, 2 * s, s, LEAF[2]);
  disc(g, x, y, 2.4 * s, VELV[1]); disc(g, x - 0.4 * s, y - 0.4 * s, 1.8 * s, VELV[3]); B(g, x - s, y - s, s, s, VELV[5]);
};
/** A stepped crack from (x, y): a dark line with a lit lip under it, wandering `dir` (1 down, -1 up), a branch. */
const crack = (g: Ctx, x: number, y: number, dir: number, seed: number, n = 6, dark = DAM[0], litC = DAM[5]) => {
  for (let m = 0; m < n; m++) {
    const nx = x + (hash(seed * 13 + m) - 0.5) * 34, ny = y + dir * (10 + hash(seed + m * 3) * 18);
    const steps = Math.max(1, Math.round(Math.max(Math.abs(nx - x), Math.abs(ny - y)) / 2));
    for (let s = 0; s <= steps; s++) { const px = Math.round(x + ((nx - x) * s) / steps), py = Math.round(y + ((ny - y) * s) / steps); B(g, px, py, 2, 2, dark); B(g, px + 1, py + 2, 1, 1, litC); }
    if (m === 2 && hash(seed * 7) > 0.4) crack(g, nx, ny, dir, seed + 50, 2, dark, litC);
    x = nx; y = ny;
  }
};
/** A ragged outline round (x, y), w x h. */
const ragged = (x: number, y: number, w: number, h: number, seed: number, N = 16) => {
  const pts: [number, number][] = [];
  for (let k = 0; k < N; k++) { const a = (k / N) * Math.PI * 2, r = 0.7 + hash(seed * 3.1 + k * 1.7) * 0.38; pts.push([x + Math.cos(a) * (w / 2) * r, y + Math.sin(a) * (h / 2) * r]); }
  return pts;
};
const pathOf = (g: Ctx, pts: [number, number][], k = 1, cx = 0, cy = 0) => { g.beginPath(); pts.forEach(([px, py], i) => { const X = cx + (px - cx) * k, Y = cy + (py - cy) * k; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.closePath(); };

/** Still art painted in world coordinates (a stamp about (x, y), the box bx, by, bw, bh round it). */
const stillW = (c: Ctx, key: string, x: number, y: number, bx: number, by: number, bw: number, bh: number, paint: (g: Ctx) => void) => {
  const X = Math.round(x), Y = Math.round(y);
  still(c, `pp-${key}`, X, Y, bx, by, bw, bh, g => { g.save(); g.translate(-X, -Y); paint(g); g.restore(); });
};
/** A run of still art over world x a..b, top..bot, in 256-wide stretches (only the ones in view put down: the camera
 *  pulls out to the whole room at most, so a wide margin either side of the screen). */
const SEG = 256;
const runW = (c: Ctx, state: GameState, key: string, a: number, b: number, top: number, bot: number, paint: (g: Ctx, s0: number, s1: number) => void) => {
  const vx0 = state.camera.x - 920, vx1 = state.camera.x + 1800;
  for (let sx = Math.floor(a / SEG) * SEG; sx < b; sx += SEG) {
    const s0 = Math.max(a, sx), s1 = Math.min(b, sx + SEG);
    if (s1 <= s0 || s1 < vx0 || s0 > vx1) continue;
    stillW(c, `${key}-${s0}`, s0, top, 0, 0, s1 - s0, bot - top, g => { g.save(); g.beginPath(); g.rect(s0, top, s1 - s0, bot - top); g.clip(); paint(g, s0, s1); g.restore(); });
  }
};

export interface RoomLook {
  /** How wrecked (0 .. MAX_STAGE). */
  stage: number;
  /** The door: still up, or kicked in (frames since: it flies, then lies). */
  doorT: number | null;
  /** The rose barrier across the doorway (the fight's on: no way out). */
  barrier: boolean;
  /** The chandelier that's come down (its index), and its lying x; the hole she corked out through (x), or none. */
  chandelierDown: number | null;
  roofHole: number | null;
  /** Her reflection in the vanity's mirror (where she is now: her middle, her feet), if she's about. */
  piperX: number | null;
  piperY?: number;
  /** Her, exactly as she's drawn this frame (world space: her own draw, pose, frame, facing, mess and all), for the
   *  mirror to show. */
  reflect?: ((c: Ctx, fr: number) => void) | null;
}

// ---------------------------------------------------------------------------------------------------------------
// Behind the plaster: what every hole shows

/** The crawlspace over the ceiling, looked up into through a hole in the cornice: the dark, the mains across it in
 *  steps (the FX POWER tray, the twin LIQUID NITROGEN lines frosted, the lagged HEAT main, the water main and its
 *  flanges), hangers, a cable sagging. World x keeps the bands lined up hole to hole. */
const ceilInside = (g: Ctx, x0: number, x1: number, yTop: number, yBot: number) => {
  B(g, x0, yTop, x1 - x0, yBot - yTop, CAV);
  const h = yBot - yTop, y = (k: number) => Math.round(yTop + h * k);
  for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) { B(g, x, yTop, 1, h, CONC[1]); }
  for (let x = Math.floor(x0 / 90) * 90 + 30; x < x1; x += 90) B(g, x, yTop, 1, h * 0.7, STEEL[1]);
  // (the FX POWER tray)
  B(g, x0, y(0.14), x1 - x0, 5, '#14140E'); for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) B(g, x, y(0.14), 5, 5, '#C8A01A');
  B(g, x0, y(0.14), x1 - x0, 1, '#F0D050');
  // (the twin LN2 lines, frost on their tops)
  for (const k of [0.3, 0.4]) { B(g, x0, y(k), x1 - x0, 4, LN2C[2]); B(g, x0, y(k), x1 - x0, 1, LN2C[5]); B(g, x0, y(k) + 3, x1 - x0, 1, LN2C[0]); checker(g, x0, y(k) - 1, x1 - x0, 1, LN2C[5], 0, 1); }
  // (the HEAT main, lagged, banded)
  B(g, x0, y(0.52), x1 - x0, 8, HEATC[3]); B(g, x0, y(0.52), x1 - x0, 2, HEATC[4]); B(g, x0, y(0.52) + 6, x1 - x0, 2, HEATC[1]);
  for (let x = Math.floor(x0 / 30) * 30; x < x1; x += 30) { B(g, x, y(0.52), 2, 8, STEEL[4]); B(g, x, y(0.52), 1, 8, STEEL[5]); }
  // (the water main, flanged)
  B(g, x0, y(0.72), x1 - x0, 7, STEEL[2]); B(g, x0, y(0.72), x1 - x0, 2, STEEL[4]); B(g, x0, y(0.72) + 6, x1 - x0, 1, STEEL[0]);
  for (let x = Math.floor(x0 / 60) * 60; x < x1; x += 60) { B(g, x - 1, y(0.72) - 2, 4, 11, STEEL[1]); B(g, x - 1, y(0.72) - 2, 1, 11, STEEL[4]); }
  // (a cable sagging loose)
  g.strokeStyle = '#0A0A0A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y(0.2)); g.quadraticCurveTo((x0 + x1) / 2, y(0.95), x1, y(0.25)); g.stroke();
};
/** Behind the wall, through a hole in it: studs, pink insulation in its batts (dithered fluff), a riser pipe and a
 *  conduit down it, a wire. */
const wallInside = (g: Ctx, x0: number, x1: number, yTop: number, yBot: number) => {
  B(g, x0, yTop, x1 - x0, yBot - yTop, CAV);
  for (let x = Math.floor(x0 / 36) * 36; x < x1; x += 36) {
    // (the batt between two studs: pink fluff in steps)
    B(g, x + 5, yTop, 26, yBot - yTop, MARB[2]);
    for (let y = yTop; y < yBot; y += 3) for (let k = 0; k < 26; k += 3) { const t = hash(x * 0.37 + y * 1.31 + k); if (t > 0.62) B(g, x + 5 + k, y, 2, 2, MARB[4]); else if (t < 0.22) B(g, x + 5 + k, y, 2, 2, MARB[1]); else if (t > 0.94) B(g, x + 5 + k, y, 1, 1, MARB[5]); }
    // (the stud)
    B(g, x, yTop, 5, yBot - yTop, WALNUT[3]); B(g, x, yTop, 1, yBot - yTop, WALNUT[5]); B(g, x + 4, yTop, 1, yBot - yTop, WALNUT[1]);
  }
  const rx = Math.floor((x0 + x1) / 2 / 50) * 50 + 14;
  if (rx > x0 && rx < x1) { B(g, rx, yTop, 7, yBot - yTop, STEEL[3]); B(g, rx, yTop, 2, yBot - yTop, STEEL[5]); B(g, rx + 6, yTop, 1, yBot - yTop, STEEL[1]); for (let y = Math.floor(yTop / 40) * 40; y < yBot; y += 40) B(g, rx - 1, y, 9, 3, STEEL[1]); }
  if (rx - 22 > x0) { B(g, rx - 22, yTop, 3, yBot - yTop, '#C8A01A'); B(g, rx - 22, yTop, 1, yBot - yTop, '#F0D050'); }
  g.strokeStyle = '#0A0A0A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, yTop + 6); g.quadraticCurveTo(x1, (yTop + yBot) / 2, x0 + (x1 - x0) * 0.3, yBot); g.stroke();
};

/** A ragged hole (`ceil`: through the cornice into the crawlspace; else through the wall) at (x, y), w x h: the paper
 *  torn back off the plaster round it, the lath's broken ends, the inside, the edge inked and lit along its foot. */
const paintCavity = (g: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  const ceil = y < CEIL_Y + 60;
  const pts = ragged(x, y, w, h, seed);
  // (the paper torn back (the plaster bare), the plaster broken (lath))
  pathOf(g, pts, 1.3, x, y); g.fillStyle = PLAST[3]; g.fill();
  pathOf(g, pts, 1.3, x, y); g.strokeStyle = DAM[1]; g.lineWidth = 1; g.stroke();
  pathOf(g, pts, 1.12, x, y); g.fillStyle = WALNUT[3]; g.fill();
  for (let k = 0; k < 6; k++) { const a = hash(seed + k * 2.2) * Math.PI * 2; B(g, x + Math.cos(a) * w * 0.52, y + Math.sin(a) * h * 0.52, 5, 2, WALNUT[4]); }
  g.save(); pathOf(g, pts); g.clip();
  if (ceil) ceilInside(g, x - w, x + w, y - h, y + h); else wallInside(g, x - w, x + w, y - h, y + h);
  // (dark at the rim: the depth of it)
  g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 4; pathOf(g, pts); g.stroke();
  g.restore();
  pathOf(g, pts); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  // (the lit lip of broken plaster along its foot)
  for (let k = 0; k < pts.length; k++) { const [px, py] = pts[k]; if (py > y + h * 0.15) B(g, px - 1, py, 3, 1, PLAST[5]); }
};
/** A hole (the fight's mains come out of these): painted once where it is, a drip live. */
export const drawCavity = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, f: number) => {
  stillW(c, `cav-${seed}-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`, x, y, -w, -h, w * 2, h * 2, g => paintCavity(g, x, y, w, h, seed));
  if ((f + seed * 7) % 60 < 30 && y < CEIL_Y + 60) { const t = (f + seed * 7) % 30; B(c, x + w * 0.1, y + h * 0.36 + t * 2, 1, 3, LN2C[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// Her bedroom: the walls (painted once, in stretches)

/** The pilasters (x from her room's left wall). */
const PIL = [36, 400, 750, 1316, 1508];
const RAIL = GY - 124, WAIN_T = GY - 116, BASE_T = GY - 12, CORN_B = CEIL_Y + 28, FRIEZE_B = CEIL_Y + 48;

/** A fluted pink marble pilaster (x its middle), its gilt capital at `top` and base at `bot`. */
const pilaster = (g: Ctx, x: number, top: number, bot: number, M = MARB) => {
  const w = 24, l = x - 12, s0 = top + 16, len = bot - 10 - s0;
  B(g, l - 4, bot - 10, w + 8, 10, INK); B(g, l - 3, bot - 9, w + 6, 8, GD[3]); B(g, l - 3, bot - 9, w + 6, 1, GD[5]); B(g, l - 3, bot - 5, w + 6, 1, GD[1]); B(g, l - 3, bot - 2, w + 6, 1, GD[0]);
  B(g, l - 1, s0, w + 2, len, INK);
  B(g, l, s0, w, len, M[3]); B(g, l, s0, 3, len, M[4]); B(g, l + 1, s0, 1, len, M[5]); B(g, l + w - 4, s0, 4, len, M[2]); B(g, l + w - 1, s0, 1, len, M[1]); checker(g, l + w - 6, s0, 2, len, M[2], 0, 1);
  for (let k = 0; k < 4; k++) { const fx = l + 5 + k * 4; B(g, fx, s0 + 6, 1, len - 12, M[2]); B(g, fx + 1, s0 + 6, 1, len - 12, M[4]); }
  for (let k = 0; k < 7; k++) { let vx = l + 3 + Math.floor(hash(x + k) * (w - 6)), vy = s0 + 10 + hash(x * 2 + k) * (len - 30); for (let s = 0; s < 7; s++) { B(g, vx, vy, 1, 2, M[2]); vx += hash(x + k * 7 + s) > 0.5 ? 1 : -1; vy += 2; } }
  // (the capital: an abacus, volutes, acanthus)
  B(g, l - 6, top, w + 12, 6, INK); B(g, l - 5, top + 1, w + 10, 4, GD[3]); B(g, l - 5, top + 1, w + 10, 1, GD[5]); B(g, l - 5, top + 4, w + 10, 1, GD[1]);
  for (const s of [-1, 1]) { const vx = x + s * 11; disc(g, vx, top + 10, 4.5, INK); disc(g, vx, top + 10, 3.5, GD[2]); disc(g, vx - 1, top + 9, 2, GD[4]); B(g, vx, top + 10, 1, 1, GD[0]); }
  for (let k = 0; k < 3; k++) { polyF(g, [[x - 9 + k * 6, top + 17], [x - 6 + k * 6, top + 7], [x - 3 + k * 6, top + 17]], k === 1 ? GD[4] : GD[3]); B(g, x - 7 + k * 6, top + 12, 1, 4, GD[1]); }
  B(g, l - 1, top + 16, w + 2, 2, GD[1]);
};

/** A panel of rose damask (an ogee lattice, fleurs in it, hearts where it meets; satin sheen) in an inset gilt frame. */
const damask = (g: Ctx, x: number, y: number, w: number, h: number, D = DAM) => {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  B(g, x, y, w, h, D[3]);
  const CW = 32, CH = 44;
  for (let ty = Math.floor(y / CH) * CH - CH; ty < y + h + CH; ty += CH) {
    const row = Math.round(ty / CH);
    for (let tx = Math.floor(x / CW) * CW - CW; tx < x + w + CW; tx += CW) {
      const cx = tx + (row & 1 ? CW / 2 : 0);
      for (let r = 0; r <= CH; r += 2) { const hw = Math.round((CW / 2 - 2) * Math.sin((Math.PI * r) / CH)); B(g, cx - hw, ty + r, 1, 2, D[2]); B(g, cx + hw, ty + r, 1, 2, D[2]); B(g, cx - hw + 1, ty + r, 1, 2, D[4]); }
      pmap(g, FLEUR, cx - 2, ty + CH / 2 - 3, D[2]); pmap(g, FLEUR, cx - 3, ty + CH / 2 - 4, D[4]); B(g, cx, ty + CH / 2 - 4, 1, 2, D[5]);
      pmap(g, HEART5, cx + CW / 2 - 2, ty - 2, D[4]); B(g, cx + CW / 2 - 2, ty - 2, 1, 1, D[5]);
    }
  }
  // (the satin's sheen: a soft lighter band down the panel's left, dithered off)
  checker(g, x, y, Math.min(10, w), h, D[4], 0, 1);
  g.restore();
  // (the inset frame)
  const fx = x + 8, fy = y + 8, fw = w - 16, fh = h - 16;
  if (fw > 20 && fh > 20) {
    B(g, fx - 1, fy - 1, fw + 2, 3, GD[1]); B(g, fx - 1, fy - 1, 3, fh + 2, GD[1]);
    B(g, fx, fy, fw, 2, GD[4]); B(g, fx, fy, 2, fh, GD[4]); B(g, fx, fy + fh - 2, fw, 2, GD[2]); B(g, fx + fw - 2, fy, 2, fh, GD[2]);
    for (const [cx, cy] of [[fx, fy], [fx + fw, fy], [fx, fy + fh], [fx + fw, fy + fh]]) { disc(g, cx, cy, 3, GD[1]); disc(g, cx - 0.5, cy - 0.5, 2, GD[4]); }
  }
};

/** The wainscot: rails and stiles in cream, raised fields (a pink inset with a gilt bead, a rosette), pedestals under
 *  the pilasters; the chair rail over it, the baseboard under. `pil` the pilasters' world x. */
const wainscot = (g: Ctx, a: number, b: number, pil: number[], C = CREAM, inset = MARB) => {
  giltBand(g, a, RAIL, b - a, 8);
  B(g, a, WAIN_T, b - a, BASE_T - WAIN_T, C[3]); B(g, a, WAIN_T, b - a, 1, C[1]);
  for (let x = Math.floor(a / 72) * 72; x < b; x += 72) {
    if (pil.some(p => Math.abs(p - (x + 36)) < 46)) continue;
    const px = x + 8, py = WAIN_T + 10, pw = 56, ph = BASE_T - WAIN_T - 20;
    B(g, px - 1, py - 1, pw + 2, ph + 2, C[1]);
    B(g, px, py, pw, ph, C[4]); B(g, px, py, pw, 2, C[5]); B(g, px, py, 2, ph, C[5]); B(g, px, py + ph - 2, pw, 2, C[2]); B(g, px + pw - 2, py, 2, ph, C[2]);
    B(g, px + 7, py + 7, pw - 14, ph - 14, inset[3]); B(g, px + 7, py + 7, pw - 14, 1, inset[1]); B(g, px + 7, py + 7, 1, ph - 14, inset[1]); B(g, px + 7, py + ph - 8, pw - 14, 1, inset[4]);
    for (let k = px + 9; k < px + pw - 9; k += 3) { B(g, k, py + 9, 1, 1, GD[4]); B(g, k, py + ph - 10, 1, 1, GD[3]); }
    disc(g, px + pw / 2, py + ph / 2, 4, GD[1]); disc(g, px + pw / 2 - 0.5, py + ph / 2 - 0.5, 3, GD[3]); B(g, px + pw / 2 - 2, py + ph / 2 - 2, 1, 1, GD[5]);
  }
  for (const p of pil) {
    if (p < a - 30 || p > b + 30) continue;
    B(g, p - 17, WAIN_T, 34, BASE_T - WAIN_T, INK); B(g, p - 16, WAIN_T, 32, BASE_T - WAIN_T, C[4]); B(g, p - 16, WAIN_T, 2, BASE_T - WAIN_T, C[5]); B(g, p + 12, WAIN_T, 4, BASE_T - WAIN_T, C[2]);
    polyF(g, [[p, WAIN_T + 30], [p + 8, WAIN_T + 52], [p, WAIN_T + 74], [p - 8, WAIN_T + 52]], GD[2]); polyF(g, [[p, WAIN_T + 33], [p + 5, WAIN_T + 52], [p, WAIN_T + 56], [p - 5, WAIN_T + 52]], GD[4]);
  }
  B(g, a, BASE_T, b - a, GY - BASE_T, C[2]); B(g, a, BASE_T, b - a, 2, GD[3]); B(g, a, BASE_T, b - a, 1, GD[5]); B(g, a, GY - 3, b - a, 3, C[1]); B(g, a, GY - 1, b - a, 1, C[0]);
};

/** The carpet going toward us from the wall: the lit lip, a gilt border with hearts, the rose field in bands darker
 *  nearer, medallions squashed by the angle, a second border, petals strewn. */
const carpet = (g: Ctx, a: number, b: number, C = CARP, petals = true) => {
  lip(g, a, GY, b - a);
  B(g, a, GY + 6, b - a, 10, GD[2]); B(g, a, GY + 6, b - a, 1, GD[4]); B(g, a, GY + 15, b - a, 1, GD[0]);
  for (let x = Math.floor(a / 18) * 18; x < b; x += 18) { pmap(g, HEART5, x + 6, GY + 9, C[2]); B(g, x + 6, GY + 9, 1, 1, C[4]); }
  const bands: [number, number, string][] = [[GY + 16, GY + 30, C[4]], [GY + 30, GY + 48, C[3]], [GY + 48, GY + 56, GD[2]], [GY + 56, GY + 76, C[2]], [GY + 76, GY + 140, C[1]]];
  for (const [y0, y1, col] of bands) { B(g, a, y0, b - a, y1 - y0, col); if (col !== GD[2]) checker(g, a, y1 - 1, b - a, 2, mix(col, '#000000', 0.15), 0, 1); }
  B(g, a, GY + 48, b - a, 1, GD[4]); B(g, a, GY + 55, b - a, 1, GD[0]);
  for (let x = Math.floor(a / 60) * 60; x < b; x += 60) {
    ell(g, x + 30, GY + 23, 14, 4, C[2]); ell(g, x + 30, GY + 23, 10, 2.6, C[5]); B(g, x + 29, GY + 22, 3, 1, '#FFFFFF');
    ell(g, x + 0, GY + 39, 18, 6, C[2]); ell(g, x, GY + 39, 12, 3.6, C[4]); pmap(g, HEART5, x - 2, GY + 37, C[1]);
    ell(g, x + 30, GY + 66, 24, 7, C[1]); ell(g, x + 30, GY + 66, 16, 4.5, C[3]); ell(g, x + 30, GY + 66, 7, 2, C[5]);
  }
  if (petals) for (let x = Math.floor(a / 9) * 9; x < b; x += 9) {
    const h = hash(x * 0.37);
    if (h < 0.42) { const y = GY + 5 + hash(x * 1.7) * 70, big = y > GY + 40 ? 2 : 1; B(g, x, y, 2 + big * 2, 1 + big, h < 0.2 ? '#E8204E' : '#FF7AA4'); B(g, x, y, 1 + big, 1, h < 0.2 ? '#FF6A8A' : '#FFC4D4'); }
  }
};

/** The crown molding (a gilt band, a cream cove, dentils, egg and dart) and the frieze of rose garlands. */
const crown = (g: Ctx, a: number, b: number) => {
  B(g, a, CEIL_Y, b - a, 28, CREAM[3]);
  B(g, a, CEIL_Y, b - a, 2, GD[1]); B(g, a, CEIL_Y + 2, b - a, 4, GD[3]); B(g, a, CEIL_Y + 2, b - a, 1, GD[5]);
  B(g, a, CEIL_Y + 6, b - a, 3, CREAM[1]); B(g, a, CEIL_Y + 9, b - a, 3, CREAM[2]); checker(g, a, CEIL_Y + 8, b - a, 2, CREAM[1], 0, 1);
  for (let x = Math.floor(a / 6) * 6; x < b; x += 6) { B(g, x, CEIL_Y + 12, 4, 6, CREAM[4]); B(g, x, CEIL_Y + 12, 1, 6, CREAM[5]); B(g, x + 3, CEIL_Y + 13, 1, 5, CREAM[2]); B(g, x + 4, CEIL_Y + 12, 2, 6, CREAM[1]); }
  B(g, a, CEIL_Y + 18, b - a, 8, GD[2]);
  for (let x = Math.floor(a / 8) * 8; x < b; x += 8) { B(g, x + 1, CEIL_Y + 19, 5, 6, GD[3]); B(g, x + 1, CEIL_Y + 19, 2, 3, GD[5]); B(g, x + 5, CEIL_Y + 22, 1, 3, GD[1]); B(g, x + 7, CEIL_Y + 19, 1, 5, GD[0]); }
  giltBand(g, a, CEIL_Y + 26, b - a, 3, false);
  // (the frieze: cream, rose garlands swagged from gilt bows)
  B(g, a, CORN_B, b - a, FRIEZE_B - CORN_B, CREAM[4]); B(g, a, CORN_B + 1, b - a, 1, CREAM[5]); B(g, a, FRIEZE_B - 3, b - a, 1, CREAM[2]);
  for (let x0 = Math.floor(a / 64) * 64 - 64; x0 < b + 64; x0 += 64) {
    for (let k = 0; k <= 8; k++) { const t = k / 8, x = x0 + t * 64, y = CORN_B + 5 + Math.sin(t * Math.PI) * 8; B(g, x - 3, y + 1, 6, 2, LEAF[k % 2 ? 2 : 3]); if (k % 2 === 0) rose(g, x, y, 1); }
    pmap(g, BOW, x0 - 3, CORN_B + 1, GD[1]); pmap(g, BOW, x0 - 3, CORN_B, GD[4]);
  }
  giltBand(g, a, FRIEZE_B - 2, b - a, 3, false);
};

/** Her room's back wall over world a..b: the crown, the frieze, damask panels between the pilasters, the wainscot, the
 *  carpet. */
const paintWall = (g: Ctx, a: number, b: number) => {
  crown(g, a, b);
  const edges = [R(-60), ...PIL.map(R), ARENA_R + 300];
  for (let i = 0; i < edges.length - 1; i++) {
    const pa = edges[i] + (i ? 12 : 0), pb = edges[i + 1] - (i + 1 < edges.length - 1 ? 12 : 0);
    if (pb < a - 40 || pa > b + 40) continue;
    damask(g, pa, FRIEZE_B + 1, pb - pa, RAIL - FRIEZE_B - 1);
  }
  wainscot(g, a, b, PIL.map(R));
  for (const p of PIL) if (R(p) > a - 30 && R(p) < b + 30) pilaster(g, R(p), FRIEZE_B, RAIL);
  carpet(g, a, b);
};

// ---------------------------------------------------------------------------------------------------------------
// The wreck (a stamp a stage)

const ceilHoles = (s: number) => (s >= 2 ? (s >= 4 ? 6 : 3) + (s >= 6 ? 3 : 0) : 0);
const holeAt = (k: number) => ({ x: R(90 + hash(k * 5.3) * 1500), w: 70 + hash(k) * 70 });
const wallHoleAt = (k: number) => ({ x: R(120 + hash(k * 9.1 + 4) * 1430), y: GY - 200 - hash(k * 2.2) * 130, w: 60 + hash(k * 4) * 50, h: 70 + hash(k * 6) * 40 });

const paintWreck = (g: Ctx, a: number, b: number, s: number) => {
  const near = (x: number, m = 160) => x > a - m && x < b + m;
  // (1: cracks from the cornice and the pilasters' feet, wandering; 5 on: big ones, gashes)
  const nCracks = s >= 5 ? 26 : s >= 3 ? 20 : 14;
  for (let k = 0; k < nCracks; k++) {
    const x = R(20 + hash(k * 7.7) * 1660), up = k % 3 === 0;
    if (!near(x)) continue;
    crack(g, x, up ? RAIL - 4 : FRIEZE_B + 2, up ? -1 : 1, k + 1, s >= 5 ? 9 : 6);
  }
  if (s >= 5) for (let k = 0; k < 3; k++) { const x = R(200 + hash(k * 3.7 + 1) * 1250); if (near(x)) { const pts = ragged(x, CEIL_Y + 120 + k * 60, 16, 90, k + 90, 10); pathOf(g, pts); g.fillStyle = PLAST[2]; g.fill(); g.strokeStyle = DAM[0]; g.lineWidth = 1; g.stroke(); } }
  // (2: plaster down: holes through the cornice, a streak of dust down the wall under each, rubble on the floor)
  for (let k = 0; k < ceilHoles(s); k++) {
    const { x, w } = holeAt(k);
    if (!near(x, w + 40)) continue;
    g.globalAlpha = 0.35; for (let y = CEIL_Y + 40; y < GY - 130; y += 3) B(g, x - w * 0.2 + Math.sin(y * 0.05 + k) * 3, y, w * 0.4 * (1 - (y - CEIL_Y) / 600), 2, PLAST[4]); g.globalAlpha = 1;
    paintCavity(g, x, CEIL_Y + 22, w, 40, k + 1);
    for (let m = 0; m < 4; m++) { const rx = x + (hash(k * 11 + m) - 0.5) * w, rw = 8 + hash(k + m * 5) * 12; polyF(g, [[rx - rw, GY + 4], [rx - rw * 0.4, GY - rw * 0.6 + 4], [rx + rw * 0.5, GY - rw * 0.4 + 4], [rx + rw, GY + 4]], PLAST[3]); B(g, rx - rw * 0.4, GY - rw * 0.6 + 4, rw * 0.6, 1, PLAST[5]); B(g, rx - rw, GY + 3, rw * 2, 2, PLAST[1]); }
  }
  // (3: the damask torn and hanging in strips: the plaster bare where it was, the paper's back curling)
  if (s >= 3) for (let k = 0; k < (s >= 6 ? 20 : 12); k++) {
    const x = R(40 + hash(k * 11.3 + 2) * 1610), y = FRIEZE_B + 4 + hash(k * 2.9) * 150, w = 12 + hash(k * 4.1) * 12, len = 40 + hash(k) * 70;
    if (!near(x)) continue;
    B(g, x, y, w, len * 0.8, PLAST[3]); B(g, x, y, w, 1, PLAST[1]); B(g, x, y, 1, len * 0.8, PLAST[4]); checker(g, x + 1, y + len * 0.8 - 2, w - 1, 2, PLAST[2], 0, 1);
    const lean = (hash(k * 3) - 0.5) * 12;
    polyF(g, [[x, y], [x + w, y], [x + w * 0.8 + lean, y + len], [x + w * 0.25 + lean, y + len - 6]], CREAM[3]);
    polyF(g, [[x + w * 0.6, y], [x + w, y], [x + w * 0.8 + lean, y + len], [x + w * 0.65 + lean, y + len - 2]], CREAM[2]);
    polyF(g, [[x + w * 0.25 + lean, y + len - 6], [x + w * 0.8 + lean, y + len], [x + w * 0.55 + lean, y + len + 5]], DAM[3]);
    B(g, x, y - 1, w, 2, DAM[0]);
  }
  // (4: holes in the walls)
  if (s >= 4) for (let k = 0; k < (s >= 6 ? 6 : 3); k++) { const H = wallHoleAt(k); if (near(H.x, H.w + 40)) paintCavity(g, H.x, H.y, H.w, H.h, k + 31); }
  // (6: cables hanging out of the ceiling holes, in loops, their ends bare)
  if (s >= 6) for (let k = 0; k < ceilHoles(s); k++) {
    const { x } = holeAt(k);
    if (!near(x)) continue;
    for (let m = 0; m < 2; m++) {
      const x0 = x + (m ? 10 : -12), end = 70 + hash(k * 3.3 + m) * 90;
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, CEIL_Y + 30); g.quadraticCurveTo(x0 + (m ? 26 : -22), CEIL_Y + end * 0.6, x0 + (m ? 8 : -6), CEIL_Y + 30 + end); g.stroke();
      g.strokeStyle = m ? '#C8A01A' : '#3A3A44'; g.lineWidth = 1.5; g.stroke();
      B(g, x0 + (m ? 7 : -7), CEIL_Y + 30 + end, 3, 4, '#D88A3A'); B(g, x0 + (m ? 7 : -7), CEIL_Y + 33 + end, 1, 2, '#FFD08A');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Above it: the dollhouse cut (the ceiling's joists, the crawlspace, the spire's cone)

const PLATE = CEIL_Y - 150, PEAK = PLATE - 430, CONE_HW = ARENA_W / 2 + 170;
const coneY = (x: number) => PLATE - (PLATE - PEAK) * Math.max(0, 1 - Math.abs(x - ARENA_MID) / CONE_HW);

const paintCut = (g: Ctx, a: number, b: number) => {
  // (the cone's inside: its far half, boards in bands up it, rafters to the peak, purlins, a king post)
  g.save(); g.beginPath(); g.moveTo(ARENA_MID - CONE_HW, PLATE); g.lineTo(ARENA_MID, PEAK); g.lineTo(ARENA_MID + CONE_HW, PLATE); g.closePath(); g.clip();
  const bands = [WALNUT[0], WALNUT[1], WALNUT[1], WALNUT[2]];
  for (let i = 0; i < 4; i++) { const y0 = PEAK + ((PLATE - PEAK) * i) / 4; B(g, a, y0, b - a, (PLATE - PEAK) / 4 + 1, bands[i]); checker(g, a, y0, b - a, 2, bands[Math.max(0, i - 1)], 0, 1); }
  for (let y = PEAK + 6; y < PLATE; y += 9) B(g, a, y, b - a, 1, WALNUT[0]);
  // (an oculus on the sky, high up the far side)
  const ox = ARENA_MID + 260, oy = PEAK + 210;
  if (ox > a - 40 && ox < b + 40) {
    const tod = timeOfDay(), S = skyRamp(['#3A55B4', '#6E8EDC', '#A8C4F0'], tod);
    disc(g, ox, oy, 25, INK); disc(g, ox, oy, 23, PALE[3]); disc(g, ox, oy, 18, S[0]); B(g, ox - 18, oy - 4, 36, 22, S[1]); B(g, ox - 18, oy + 6, 36, 12, S[2]);
    g.save(); g.beginPath(); g.arc(ox, oy, 18, 0, Math.PI * 2); g.clip(); for (let k = 0; k < 6; k++) { const a2 = (k / 6) * Math.PI; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(ox - Math.cos(a2) * 20, oy - Math.sin(a2) * 20); g.lineTo(ox + Math.cos(a2) * 20, oy + Math.sin(a2) * 20); g.stroke(); } if (tod.stars > 0.3) for (let k = 0; k < 5; k++) B(g, ox - 12 + hash(k) * 24, oy - 12 + hash(k * 3) * 20, 1, 1, '#FFFFFF'); g.restore();
    disc(g, ox, oy, 4, PALE[2]);
  }
  // (rafters to the peak)
  for (let k = -7; k <= 7; k++) {
    const bx = ARENA_MID + (k / 7) * CONE_HW;
    g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(ARENA_MID, PEAK); g.lineTo(bx, PLATE); g.stroke();
    g.strokeStyle = WALNUT[3]; g.lineWidth = 6; g.stroke();
    g.strokeStyle = WALNUT[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(ARENA_MID - 2, PEAK); g.lineTo(bx - 2, PLATE); g.stroke();
  }
  // (purlins across, a collar tie, the king post, its struts)
  for (const t of [0.3, 0.55, 0.8]) { const y = PEAK + (PLATE - PEAK) * t; B(g, a, y - 5, b - a, 10, INK); B(g, a, y - 4, b - a, 8, WALNUT[3]); B(g, a, y - 4, b - a, 2, WALNUT[5]); B(g, a, y + 2, b - a, 2, WALNUT[1]); }
  B(g, ARENA_MID - 7, PEAK, 14, PLATE - PEAK, INK); B(g, ARENA_MID - 6, PEAK, 12, PLATE - PEAK, WALNUT[3]); B(g, ARENA_MID - 6, PEAK, 3, PLATE - PEAK, WALNUT[5]); B(g, ARENA_MID + 3, PEAK, 3, PLATE - PEAK, WALNUT[1]);
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(ARENA_MID, PLATE - 40); g.lineTo(ARENA_MID + s * 240, PEAK + (PLATE - PEAK) * 0.55); g.stroke(); g.strokeStyle = WALNUT[2]; g.lineWidth = 5; g.stroke(); }
  // (what's stored up here: crates of her merch, a rolled carpet, a wreath, a dress form in a spare gown, cobwebs)
  const crate = (x: number, w: number, h: number, word: string) => {
    if (x + w < a - 20 || x > b + 20) return;
    B(g, x - 1, PLATE - 10 - h - 1, w + 2, h + 2, INK); B(g, x, PLATE - 10 - h, w, h, WALNUT[4]); B(g, x, PLATE - 10 - h, w, 2, WALNUT[5]); B(g, x + w - 3, PLATE - 10 - h, 3, h, WALNUT[2]);
    for (let y = PLATE - 10 - h + 8; y < PLATE - 10; y += 8) B(g, x, y, w, 1, WALNUT[2]);
    signText(g, word, x + w / 2, PLATE - 10 - h / 2 + 3, { sx: 1, sy: 1, gap: 1, fill: '#3A1A10' });
  };
  crate(ARENA_MID - 560, 70, 34, 'PLUSH'); crate(ARENA_MID - 486, 52, 24, 'WANDS'); crate(ARENA_MID + 420, 74, 30, 'TIARAS'); crate(ARENA_MID + 500, 48, 46, 'GLITTER');
  if (ARENA_MID - 300 > a - 60 && ARENA_MID - 300 < b + 60) { const x = ARENA_MID - 300; ell(g, x, PLATE - 22, 50, 12, INK); ell(g, x, PLATE - 22, 48, 10, CARP[3]); for (let k = -40; k < 44; k += 8) B(g, x + k, PLATE - 30, 2, 16, CARP[2]); ell(g, x + 46, PLATE - 22, 6, 10, CARP[5]); }
  if (ARENA_MID + 200 > a - 60 && ARENA_MID + 200 < b + 60) { const x = ARENA_MID + 200, y = PLATE - 10; B(g, x - 1, y - 96, 3, 90, STEEL[2]); ell(g, x, y - 4, 16, 4, STEEL[1]); polyF(g, [[x - 14, y - 70], [x + 14, y - 70], [x + 24, y - 10], [x - 24, y - 10]], SATIN[3]); polyF(g, [[x + 4, y - 70], [x + 14, y - 70], [x + 24, y - 10], [x + 10, y - 10]], SATIN[2]); ell(g, x, y - 82, 10, 14, SATIN[4]); B(g, x - 10, y - 72, 20, 2, GD[3]); }
  if (ARENA_MID - 120 > a - 40 && ARENA_MID - 120 < b + 40) { const x = ARENA_MID - 120, y = PEAK + (PLATE - PEAK) * 0.3 + 24; g.strokeStyle = LEAF[1]; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.stroke(); g.strokeStyle = LEAF[3]; g.lineWidth = 2; g.stroke(); for (let k = 0; k < 6; k++) disc(g, x + Math.cos(k) * 14, y + Math.sin(k) * 14, 1.6, k % 2 ? '#E8204E' : GD[4]); pmap(g, BOW, x - 3, y + 10, '#C81E3A'); }
  g.strokeStyle = 'rgba(220, 220, 230, 0.35)'; g.lineWidth = 1;
  for (const [cx, cy, s] of [[ARENA_MID, PEAK + 40, 1], [ARENA_MID - CONE_HW * 0.55, PLATE - 30, -1], [ARENA_MID + CONE_HW * 0.55, PLATE - 30, 1]] as const) { if (cx < a - 60 || cx > b + 60) continue; for (let r = 8; r < 34; r += 8) { g.beginPath(); g.arc(cx, cy, r, s > 0 ? 0.2 : Math.PI - 1.2, s > 0 ? 1.2 : Math.PI - 0.2); g.stroke(); } for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + s * Math.cos(0.2 + k * 0.35) * 36, cy + Math.sin(0.2 + k * 0.35) * 36); g.stroke(); } }
  g.restore();
  // (the cone's skin, cut: slate courses on the outside edge, sarking under, snow on the slope, a gilt band at its foot)
  for (const s of [-1, 1]) {
    const x0 = ARENA_MID + s * CONE_HW;
    g.strokeStyle = INK; g.lineWidth = 16; g.beginPath(); g.moveTo(x0 + s * 6, PLATE + 6); g.lineTo(ARENA_MID, PEAK - 8); g.stroke();
    g.strokeStyle = ROOF[2]; g.lineWidth = 12; g.stroke();
    g.strokeStyle = ROOF[4]; g.lineWidth = 4; g.beginPath(); g.moveTo(x0 + s * 10, PLATE + 2); g.lineTo(ARENA_MID, PEAK - 12); g.stroke();
    g.strokeStyle = WALNUT[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, PLATE + 6); g.lineTo(ARENA_MID, PEAK + 2); g.stroke();
    for (let t = 0.04; t < 0.98; t += 0.035) { const x = x0 + (ARENA_MID - x0) * t, y = PLATE + (PEAK - PLATE) * t; B(g, x + s * 2, y - 7, 3, 3, ROOF[1]); if (t < 0.8 && hash(t * 99 + s) > 0.45) B(g, x + s * 5, y - 12, 5, 3, '#ECF2FC'); }
  }
  B(g, ARENA_MID - 2, PEAK - 40, 4, 34, GD[2]); B(g, ARENA_MID - 2, PEAK - 40, 1, 34, GD[5]); ballR(g, ARENA_MID, PEAK - 42, 5, GD);
  polyF(g, [[ARENA_MID + 2, PEAK - 70], [ARENA_MID + 34, PEAK - 62], [ARENA_MID + 18, PEAK - 58], [ARENA_MID + 30, PEAK - 52], [ARENA_MID + 2, PEAK - 50]], PINK[3]); B(g, ARENA_MID, PEAK - 72, 2, 32, INK); B(g, ARENA_MID + 3, PEAK - 70, 16, 2, PINK[5]);
  // (the wall plate: a beam on the masonry, ashlar out to the cone's foot either side)
  B(g, a, PLATE - 4, b - a, 12, INK); B(g, a, PLATE - 3, b - a, 10, WALNUT[3]); B(g, a, PLATE - 3, b - a, 2, WALNUT[5]); B(g, a, PLATE + 5, b - a, 2, WALNUT[1]);
  // (the crawlspace: the park's backstage, block wall, the mains)
  const top = PLATE + 8, bot = CEIL_Y - 16;
  B(g, a, top, b - a, bot - top, CONC[2]);
  for (let y = top, r = 0; y < bot; y += 10, r++) { B(g, a, y, b - a, 1, CONC[0]); for (let x = Math.floor(a / 24) * 24 + (r % 2) * 12; x < b; x += 24) { B(g, x, y, 1, 10, CONC[0]); B(g, x + 1, y + 1, 22, 1, CONC[3]); if (hash(x * 0.3 + y) > 0.85) B(g, x + 2, y + 2, 20, 7, CONC[1]); } }
  const yD = top + 8, yW = top + 40, yH = top + 58, yN = top + 80, yF = top + 96;
  // (hangers: threaded rods)
  for (let x = Math.floor(a / 120) * 120 + 40; x < b; x += 120) { B(g, x, top, 1, bot - top - 12, STEEL[3]); B(g, x - 4, yW + 12, 9, 2, STEEL[1]); B(g, x - 4, yH + 16, 9, 2, STEEL[1]); B(g, x - 4, yF + 8, 9, 2, STEEL[1]); }
  // (the duct)
  B(g, a, yD - 1, b - a, 26, INK); B(g, a, yD, b - a, 24, STEEL[3]); B(g, a, yD, b - a, 3, STEEL[5]); B(g, a, yD + 3, b - a, 3, STEEL[4]); B(g, a, yD + 19, b - a, 5, STEEL[2]); checker(g, a, yD + 17, b - a, 2, STEEL[2], 0, 1);
  for (let x = Math.floor(a / 48) * 48; x < b; x += 48) { B(g, x, yD, 2, 24, STEEL[1]); B(g, x + 2, yD, 1, 24, STEEL[5]); for (let y = yD + 4; y < yD + 22; y += 6) B(g, x + 4, y, 1, 1, STEEL[0]); }
  // (the water main, flanged, valve wheels)
  B(g, a, yW - 1, b - a, 14, INK); B(g, a, yW, b - a, 12, STEEL[2]); B(g, a, yW, b - a, 2, STEEL[4]); B(g, a, yW + 2, b - a, 1, STEEL[5]); B(g, a, yW + 10, b - a, 2, STEEL[0]);
  for (let x = Math.floor(a / 80) * 80; x < b; x += 80) { B(g, x - 2, yW - 3, 6, 18, INK); B(g, x - 1, yW - 2, 4, 16, STEEL[3]); B(g, x - 1, yW - 2, 1, 16, STEEL[5]); }
  for (let x = Math.floor(a / 320) * 320 + 160; x < b; x += 320) { B(g, x - 1, yW - 12, 3, 12, STEEL[1]); disc(g, x, yW - 14, 8, INK); disc(g, x, yW - 14, 7, '#B81E2E'); disc(g, x, yW - 14, 4, CONC[2]); B(g, x - 7, yW - 15, 14, 2, '#E04A5A'); B(g, x - 1, yW - 21, 2, 14, '#E04A5A'); }
  // (the HEAT main: lagged, silver bands, HEAT stencils)
  B(g, a, yH - 1, b - a, 18, INK); B(g, a, yH, b - a, 16, HEATC[3]); B(g, a, yH, b - a, 3, HEATC[5]); B(g, a, yH + 3, b - a, 2, HEATC[4]); B(g, a, yH + 12, b - a, 4, HEATC[1]); checker(g, a, yH + 10, b - a, 2, HEATC[2], 0, 1);
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) { B(g, x, yH, 3, 16, STEEL[4]); B(g, x, yH, 1, 16, STEEL[5]); B(g, x + 2, yH, 1, 16, STEEL[2]); }
  for (let x = Math.floor(a / 400) * 400 + 100; x < b; x += 400) signText(g, 'HEAT 400°F', x + 20, yH + 11, { sx: 1, sy: 1, gap: 1, fill: '#FFF0D0' });
  // (the twin LN2 lines, frost crusted)
  for (const dy of [0, 9]) { const y = yN + dy; B(g, a, y - 1, b - a, 8, INK); B(g, a, y, b - a, 6, LN2C[2]); B(g, a, y, b - a, 2, LN2C[4]); B(g, a, y + 4, b - a, 2, LN2C[0]); for (let x = Math.floor(a / 5) * 5; x < b; x += 5) if (hash(x * 0.7 + dy) > 0.45) B(g, x, y - 2, 3, 2, LN2C[5]); }
  for (let x = Math.floor(a / 400) * 400 + 300; x < b; x += 400) { B(g, x - 30, yN - 12, 60, 9, '#E8F4FF'); B(g, x - 30, yN - 12, 60, 1, '#FFFFFF'); signText(g, 'LN2 DO NOT LICK', x, yN - 5, { sx: 1, sy: 1, gap: 1, fill: '#1E3A6E' }); }
  // (the FX POWER tray, cables sagging between its hangers, a junction box)
  B(g, a, yF - 1, b - a, 9, INK); for (let x = Math.floor(a / 12) * 12; x < b; x += 12) { B(g, x, yF, 6, 7, '#E8C020'); B(g, x + 6, yF, 6, 7, '#1A1A14'); }
  B(g, a, yF, b - a, 1, '#FFF0A0');
  for (let x = Math.floor(a / 120) * 120 + 40; x < b; x += 120) { g.strokeStyle = '#0A0A0A'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, yF + 7); g.quadraticCurveTo(x + 60, yF + 22, x + 120, yF + 7); g.stroke(); }
  for (let x = Math.floor(a / 500) * 500 + 240; x < b; x += 500) { B(g, x - 22, yF - 30, 44, 26, INK); B(g, x - 21, yF - 29, 42, 24, STEEL[3]); B(g, x - 21, yF - 29, 42, 2, STEEL[5]); B(g, x - 18, yF - 24, 36, 10, '#E8C020'); signText(g, 'FX 480V', x, yF - 16, { sx: 1, sy: 1, gap: 1, fill: '#1A1A14' }); pmap(g, ['..#..', '.##..', '#####', '..##.', '..#..'], x - 3, yF - 12, '#1A1A14'); }
  // (work lights: caged bulbs, a soft glow)
  for (let x = Math.floor(a / 420) * 420 + 60; x < b; x += 420) { g.globalAlpha = 0.12; disc(g, x, top + 34, 30, '#FFE9A8'); g.globalAlpha = 0.18; disc(g, x, top + 34, 16, '#FFE9A8'); g.globalAlpha = 1; B(g, x - 1, top + 22, 2, 8, STEEL[1]); disc(g, x, top + 34, 5, '#FFF4C8'); for (let k = -4; k <= 4; k += 4) B(g, x + k, top + 29, 1, 10, STEEL[1]); }
  // (the ceiling, cut: floorboards, joists end on, insulation, the plaster's underside)
  B(g, a, bot, b - a, 3, WALNUT[4]); B(g, a, bot, b - a, 1, WALNUT[5]);
  B(g, a, bot + 3, b - a, 10, CAV);
  for (let x = Math.floor(a / 6) * 6; x < b; x += 6) if (hash(x * 1.3) > 0.4) B(g, x, bot + 4 + hash(x) * 5, 4, 3, MARB[hash(x * 2) > 0.5 ? 3 : 2]);
  for (let x = Math.floor(a / 40) * 40; x < b; x += 40) { B(g, x, bot + 3, 7, 10, WALNUT[3]); B(g, x, bot + 3, 7, 1, WALNUT[5]); B(g, x + 2, bot + 6, 3, 4, WALNUT[2]); B(g, x + 3, bot + 7, 1, 2, WALNUT[4]); }
  B(g, a, bot + 13, b - a, 3, PLAST[4]); B(g, a, bot + 15, b - a, 1, PLAST[2]);
};

/** The hole the cork left: through the ceiling (joists snapped, the plaster's ragged edge), the mains bent aside, the
 *  cone's skin and rafters broken open on the sky. World x `hx`. */
const paintRoofHole = (g: Ctx, hx: number) => {
  const tod = timeOfDay(), S = skyRamp(['#23307A', '#3A55B4', '#6E8EDC', '#A8C4F0'], tod);
  // (the shaft she punched: a ragged column up through it all, the sky at its top)
  const top = coneY(hx) - 20;
  const col: [number, number][] = [];
  for (let y = CEIL_Y + 30; y >= top; y -= 20) col.push([hx - 50 - hash(y * 0.3) * 18, y]);
  for (let y = top; y <= CEIL_Y + 30; y += 20) col.push([hx + 50 + hash(y * 0.7) * 18, y]);
  g.save(); pathOf(g, col); g.clip();
  for (let i = 0; i < 4; i++) B(g, hx - 80, top - 20 + i * 30, 160, 31, S[i]);
  B(g, hx - 80, top + 100, 160, CEIL_Y - top, S[3]);
  if (tod.stars > 0.3) for (let k = 0; k < 8; k++) B(g, hx - 60 + hash(k * 3.1) * 120, top + hash(k) * 60, 1, 1, '#FFFFFF');
  g.restore();
  pathOf(g, col); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
  // (the snapped ends either side: joists, pipes bent up and away, slates)
  for (const s of [-1, 1]) {
    const ex = hx + s * 52;
    B(g, ex - (s < 0 ? 14 : 0), CEIL_Y - 16, 14, 16, WALNUT[3]); polyF(g, [[ex, CEIL_Y - 16], [ex + s * 10, CEIL_Y - 30], [ex + s * 4, CEIL_Y - 14]], WALNUT[4]);
    for (const [y, R6] of [[PLATE + 48, STEEL], [PLATE + 66, HEATC], [PLATE + 88, LN2C]] as const) { polyF(g, [[ex, y], [ex + s * 18, y - 22], [ex + s * 26, y - 18], [ex + s * 8, y + 8]], R6[3]); B(g, ex + s * 18, y - 22, 4, 2, R6[5]); }
    const cy = coneY(ex);
    polyF(g, [[ex, cy], [ex + s * 20, cy - 26], [ex + s * 30, cy - 18], [ex + s * 6, cy + 10]], ROOF[3]); B(g, ex + s * 20, cy - 26, 4, 3, '#ECF2FC');
    g.strokeStyle = WALNUT[3]; g.lineWidth = 5; g.beginPath(); g.moveTo(ex, PLATE - 60); g.lineTo(ex + s * 24, PLATE - 120); g.stroke();
  }
  // (the plaster's broken edge where it went through the cornice)
  const pts = ragged(hx, CEIL_Y + 16, 150, 34, 77);
  pathOf(g, pts, 1.1, hx, CEIL_Y + 16); g.strokeStyle = PLAST[4]; g.lineWidth = 3; g.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The decor on her walls (painted once)

/** Her portrait (a painted backdrop, her posed in it from piper.ts, an ornate gilt frame with a crest, a brass plate),
 *  hung off a nail by a cord; `tilt` once the room's shaking. World x is its middle, y its top. */
const portraitArt = (g: Ctx, x: number, y: number, w: number, h: number, k: number, pose: PiperPose, bg: 'garden' | 'sky' | 'throne', tilt: number) => {
  // (the nail and the cord)
  B(g, x - 1, y - 30, 3, 3, GD[1]); g.strokeStyle = GD[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - w * 0.3, y); g.lineTo(x, y - 29); g.lineTo(x + w * 0.3, y); g.stroke();
  g.save(); g.translate(x, y - 29); g.rotate(tilt); g.translate(-x, -(y - 29));
  const l = x - w / 2;
  giltFrame(g, l, y, w, h, 7);
  // (corner rosettes, a crest on top: a crown over a heart)
  for (const [cx, cy] of [[l - 4, y - 4], [l + w + 4, y - 4], [l - 4, y + h + 4], [l + w + 4, y + h + 4]]) { disc(g, cx, cy, 5, INK); disc(g, cx, cy, 4, GD[2]); disc(g, cx - 1, cy - 1, 2.5, GD[4]); }
  pmap(g, CROWN, x - 5, y - 18, INK); pmap(g, CROWN, x - 6, y - 19, GD[4]); B(g, x - 1, y - 18, 2, 2, PINK[4]);
  g.save(); g.beginPath(); g.rect(l, y, w, h); g.clip();
  // (the backdrop: painted)
  if (bg === 'garden') { const S = ['#4A5AA8', '#6E86C8', '#9AB4E4', '#E8C4DC']; S.forEach((col, i) => B(g, l, y + (i * h * 0.6) / 4, w, h * 0.15 + 1, col)); B(g, l, y + h * 0.6, w, h * 0.4, LEAF[2]); for (let i = 0; i < w; i += 6) { disc(g, l + i, y + h * 0.6, 5, LEAF[3]); if (hash(i + x) > 0.5) rose(g, l + i, y + h * 0.62, 1); } }
  else if (bg === 'sky') { const S = ['#7A3A7A', '#B05A9A', '#E08AB8', '#F8C4D8']; S.forEach((col, i) => B(g, l, y + (i * h) / 4, w, h / 4 + 1, col)); for (let i = 0; i < 4; i++) { ell(g, l + hash(i + x) * w, y + h * (0.2 + i * 0.18), 18, 5, '#FFE4F0'); ell(g, l + hash(i + x) * w - 6, y + h * (0.2 + i * 0.18) - 2, 10, 4, '#FFFFFF'); } }
  else { B(g, l, y, w, h, '#4A1030'); for (let i = 0; i < w; i += 10) { B(g, l + i, y, 5, h, '#5A1A3E'); } B(g, l, y + h * 0.7, w, h * 0.3, '#7A2A4A'); }
  // (her: a gross-up in oils (grossBust.ts), as her own close-up has her (piperGross.ts): the caked foundation, the
  // mascara, the chins, the wart; a pout, a smirk or a gloat by the pose)
  void k;
  drawBust(g, piperBust(pose), l + 2, y + 2, w - 4, h - 2, w > h ? 130 : 150);
  g.restore();
  // (the varnish's sheen)
  g.globalAlpha = 0.18; polyF(g, [[l, y + h * 0.3], [l + w * 0.4, y], [l + w * 0.55, y], [l, y + h * 0.5]], '#FFFFFF'); g.globalAlpha = 1;
  B(g, x - 16, y + h + 8, 32, 7, INK); B(g, x - 15, y + h + 9, 30, 5, GD[3]); B(g, x - 15, y + h + 9, 30, 1, GD[5]); signText(g, 'PIPER', x, y + h + 14, { sx: 1, sy: 1, gap: 1, fill: '#3A2208' });
  g.restore();
};

/** Piper as her portraits (and the photo on her vanity) have her: a gross-up, matching her close-up. */
const PIPER_HAIR = gR('#FFFFF4', '#FAF0C4', '#ECD894', '#D4BA6A', '#B09450', '#86703A', '#4E3E1A');
const PIPER_SKIN = gR('#FFEAD4', '#FCD6B4', '#F4BE98', '#E8A67E', '#D68A66', '#BA6E52', '#94523E', '#5A2A1E');
const PIPER_GOWN = gR('#FFC4E6', '#FF8CC8', '#F45AAE', '#D63A92', '#B02474', '#841656', '#460828');
const PIPER_EYE = gR('#A8F0C4', '#6ED49A', '#3CAA6E', '#22804E', '#105434', '#04200E');
const PIPER_LIP = gR('#FF94AE', '#F4587E', '#D82450', '#B4143A', '#8A0A28', '#4A0412');
const piperBust = (pose: PiperPose) => {
  const mouth = pose === 'lounge' ? 'smirk' : pose === 'gloat' ? 'grin' : 'pout';
  return grossBust(`piper-${mouth}`, {
    seed: 1999, skin: PIPER_SKIN, hair: 'beehive', hairRamp: PIPER_HAIR, iris: PIPER_EYE, sclera: 'red', mouth, lips: PIPER_LIP, coat: PIPER_GOWN,
    extras: ['lashes', 'tiara', 'wart', 'pearls', 'sweaty', 'zits'], jowl: 1.5, wide: 1.05, look: [0.3, 0],
  }, 'oil');
};

const PORTRAITS: { x: number; y: number; w: number; h: number; k: number; pose: PiperPose; bg: 'garden' | 'sky' | 'throne'; tilt: [number, number, number] }[] = [
  { x: 650, y: GY - 432, w: 84, h: 112, k: 0.5, pose: 'stand', bg: 'garden', tilt: [0, 0.1, 0.24] },
  { x: 850, y: GY - 424, w: 150, h: 88, k: 0.4, pose: 'lounge', bg: 'sky', tilt: [0, -0.05, -0.11] },
  { x: 1398, y: GY - 432, w: 84, h: 112, k: 0.5, pose: 'gloat', bg: 'throne', tilt: [0, -0.12, 0.3] },
];

/** The dead suitors, their heads mounted: who and how (a gag each). Looks copied from where they died. */
const PALE_S: SuitorLook['skin'] = ['#FFE0CC', '#F2BFA0', '#C88E70'], BROWN_S: SuitorLook['skin'] = ['#9A6644', '#6E4428', '#4A2A16'], OLIVE_S: SuitorLook['skin'] = ['#F4C8A0', '#D8A478', '#A87650'], DEEP_S: SuitorLook['skin'] = ['#6A4026', '#4A2A16', '#2E180A'];
const look = (name: string, kit: SuitorLook['kit'], skin: SuitorLook['skin'], hair: string, main: string, trim: string, gut = 0): SuitorLook => ({ name, kit, skin, hair, main, trim, voice: '', gut });
const TROPHIES: { look: SuitorLook; gag: 'tongue' | 'lance' | 'shaker' | 'broom' | 'apple' | 'tiara' }[] = [
  { look: look('CHAD', 'tee', PALE_S, '#E8D090', '#E07A1E', '#FFFFFF'), gag: 'tongue' },
  { look: look('SIR DEREK', 'knight', BROWN_S, '#140A06', '#2A6ADC', '#F6D365', 0.4), gag: 'apple' },
  { look: look('WAYNE', 'wizard', OLIVE_S, '#B8B8C0', '#5A2A9A', '#FEF08A', 0.4), gag: 'tongue' },
  { look: look('HANK', 'knight', DEEP_S, '#140A06', '#B91C1C', '#E4E4E7', 0.6), gag: 'lance' },
  { look: look('BLAKE', 'tee', PALE_S, '#E8D090', '#1E8A4A', '#E4E4E7'), gag: 'shaker' },
  { look: look('THADDEUS', 'wizard', PALE_S, '#5A5A60', '#1E3678', '#F6D365', 0.5), gag: 'broom' },
];

/** A head on a walnut shield (x, y the shield's middle), his name on a brass plate, X-eyed, a gag. */
const trophyArt = (g: Ctx, x: number, y: number, T: (typeof TROPHIES)[number], i: number) => {
  // (what's crossed behind the shield)
  if (T.gag === 'lance') { g.save(); g.translate(x, y); g.rotate(-0.6); B(g, -44, -3, 88, 6, INK); B(g, -43, -2, 86, 4, '#E8E0D0'); for (let k = -40; k < 40; k += 10) B(g, k, -2, 5, 4, '#C8203A'); polyF(g, [[43, -5], [54, 0], [43, 5]], '#C8203A'); g.restore(); }
  if (T.gag === 'broom') { g.save(); g.translate(x, y); g.rotate(0.55); B(g, -46, -2, 70, 4, INK); B(g, -45, -1, 68, 2, '#8A5A2A'); polyF(g, [[22, -7], [46, -11], [46, 11], [22, 7]], '#C8A060'); for (let k = 0; k < 6; k++) B(g, 26 + k * 3, -8 + k, 1, 16 - k * 2, '#8A6A30'); g.restore(); }
  // (the shield: walnut, bevelled, a gilt rim)
  const sh = (k: number): [number, number][] => [[x - 26 * k, y - 30 * k], [x + 26 * k, y - 30 * k], [x + 26 * k, y + 8 * k], [x, y + 32 * k], [x - 26 * k, y + 8 * k]];
  polyF(g, sh(1.06), INK); polyF(g, sh(1), GD[2]); polyF(g, sh(0.9), WALNUT[2]); polyF(g, sh(0.82), WALNUT[3]);
  polyF(g, [[x - 21, y - 24], [x - 4, y - 24], [x - 21, y + 4]], WALNUT[4]); B(g, x - 23, y - 27, 46, 1, GD[5]);
  // (the head, cut off at the neck, the stump in a felt collar)
  g.save(); g.beginPath(); g.rect(x - 30, y - 58, 60, 62); g.clip();
  drawSuitor(g, x - 2, y + 73, 1, 0, T.look, 'hurt');
  g.restore();
  ell(g, x + 1, y + 2, 11, 4, INK); ell(g, x + 1, y + 2, 10, 3, '#2E7A3A'); B(g, x - 8, y + 1, 18, 1, '#5AAA5A');
  // (X eyes; the gag)
  const ex = x + 2, ey = y - 18;
  for (const dx of [0, 5]) { B(g, ex + dx - 1, ey - 1, 4, 4, '#F4F0E8'); B(g, ex + dx - 1, ey - 1, 1, 1, INK); B(g, ex + dx + 2, ey - 1, 1, 1, INK); B(g, ex + dx, ey, 2, 2, INK); B(g, ex + dx - 1, ey + 2, 1, 1, INK); B(g, ex + dx + 2, ey + 2, 1, 1, INK); }
  if (T.gag === 'tongue' || T.gag === 'lance' || T.gag === 'broom') { B(g, x + 4, y - 11, 5, 7, INK); B(g, x + 5, y - 11, 3, 6, '#E86A8A'); B(g, x + 5, y - 11, 1, 5, '#FFA0B8'); }
  if (T.gag === 'apple') { ballR(g, x + 7, y - 9, 5, ['#3A0A0A', '#6A1010', '#A81E1E', '#D83A2E', '#F06A50', '#FFB0A0']); B(g, x + 7, y - 16, 1, 3, WALNUT[2]); B(g, x + 8, y - 16, 3, 2, LEAF[3]); }
  if (T.gag === 'shaker') { B(g, x + 3, y - 13, 12, 8, INK); B(g, x + 4, y - 12, 10, 6, '#4A9AE8'); B(g, x + 4, y - 12, 10, 1, '#9AD0FF'); B(g, x + 13, y - 13, 3, 8, '#2A2A2A'); }
  if (i === 3 || i === 4) { pmap(g, CROWN, x - 6, y - 50 + (i === 3 ? 4 : 0), INK); pmap(g, CROWN, x - 7, y - 51 + (i === 3 ? 4 : 0), '#E8E8F4'); B(g, x - 2, y - 50 + (i === 3 ? 4 : 0), 2, 2, PINK[4]); }
  // (the brass plate)
  const nw = Math.max(40, T.look.name.length * 6 + 8);
  B(g, x - nw / 2 - 1, y + 35, nw + 2, 11, INK); B(g, x - nw / 2, y + 36, nw, 9, GD[3]); B(g, x - nw / 2, y + 36, nw, 1, GD[5]); B(g, x - nw / 2, y + 44, nw, 1, GD[1]);
  B(g, x - nw / 2 + 1, y + 39, 1, 1, GD[1]); B(g, x + nw / 2 - 2, y + 39, 1, 1, GD[1]);
  signText(g, T.look.name, x, y + 43, { sx: 1, sy: 1, gap: 1, fill: '#3A2208' });
};

/** THE SCOREBOARD over the trophies: a gilt-framed slate (MEN WHO DIED FOR ME on a gilt header, chalk tallies in fives,
 *  AND COUNTING, a chalk heart), a chalk ledge with chalk and a duster. Center x, top y. */
const scoreboard = (g: Ctx, x: number, y: number) => {
  const w = 216, h = 58, l = x - w / 2;
  giltFrame(g, l, y + 12, w, h - 12, 5);
  const S = ['#122018', '#1A2E22', '#22382A'];
  B(g, l, y + 12, w, h - 12, S[1]); B(g, l, y + 12, w, 10, S[2]); B(g, l, y + h - 8, w, 8, S[0]); checker(g, l, y + 21, w, 2, S[2], 0, 1);
  // (the gilt header plate, scrolled ends)
  B(g, l + 10, y - 6, w - 20, 18, INK); B(g, l + 11, y - 5, w - 22, 16, '#6E1E4E'); B(g, l + 11, y - 5, w - 22, 2, GD[4]); B(g, l + 11, y + 9, w - 22, 2, GD[1]);
  for (const s of [-1, 1]) { disc(g, x + s * (w / 2 - 10), y + 3, 7, INK); disc(g, x + s * (w / 2 - 10), y + 3, 6, GD[3]); disc(g, x + s * (w / 2 - 10) - 1, y + 2, 3, GD[5]); disc(g, x + s * (w / 2 - 10), y + 3, 2, GD[1]); }
  signText(g, 'MEN WHO DIED FOR ME', x, y + 7, gilt(1));
  // (the tallies, in chalk)
  const chalk = '#E8ECE0', dim = 'rgba(232, 236, 224, 0.35)';
  for (let k = 0; k < 9; k++) {
    const gx = l + 14 + k * 21, gy = y + 20;
    for (let m = 0; m < 4; m++) { B(g, gx + m * 4, gy + (m % 2), 1, 16, chalk); B(g, gx + m * 4 + 1, gy + 2, 1, 12, dim); }
    for (let s = 0; s < 16; s++) B(g, gx - 2 + s, gy + 14 - s * 0.85, 1, 1, chalk);
  }
  B(g, l + 14, y + 39, 3, 12, chalk); B(g, l + 18, y + 40, 1, 11, dim);
  signText(g, 'AND COUNTING', x + 20, y + 50, { sx: 1, sy: 1, gap: 1, fill: chalk });
  pmap(g, HEART, l + w - 24, y + 40, chalk); B(g, l + w - 22, y + 41, 2, 2, '#122018');
  // (the chalk ledge)
  B(g, l - 4, y + h + 4, w + 8, 4, INK); B(g, l - 3, y + h + 4, w + 6, 3, WALNUT[2]); B(g, l - 3, y + h + 4, w + 6, 1, WALNUT[3]);
  B(g, l + 30, y + h + 1, 10, 3, '#F4F4EC'); B(g, l + 46, y + h + 2, 6, 2, '#F4C4D8'); B(g, l + w - 50, y + h - 1, 22, 5, '#3A2A2A'); B(g, l + w - 50, y + h - 1, 22, 2, '#8A7A7A');
};

/** The gilt crown corona over her bed, the drapes swept from it down behind the canopy to its corners, a sheer between. */
const corona = (g: Ctx) => {
  const cx = R(1150), cy = GY - 440, bl = R(986), br = R(1314), foot = GY - 196;
  // (the sheer: pink tulle behind, folds)
  g.globalAlpha = 0.55; polyF(g, [[cx - 26, cy + 18], [cx + 26, cy + 18], [br - 30, foot], [bl + 30, foot]], SATIN[4]); g.globalAlpha = 1;
  for (let k = 0; k < 12; k++) { const t = k / 11; g.globalAlpha = 0.4; g.strokeStyle = SATIN[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 24 + t * 48, cy + 20); g.lineTo(bl + 30 + t * (br - bl - 60), foot); g.stroke(); g.globalAlpha = 1; }
  // (the two drapes: velvet in stepped folds, a gold fringe on the inner edge, a tassel)
  for (const s of [-1, 1]) {
    const ex = s < 0 ? bl : br, mid = cx + s * 40;
    const outer: [number, number][] = [[cx + s * 22, cy + 16], [cx + s * 34, cy + 16], [mid + s * 60, cy + 120], [ex + s * 2, foot], [ex - s * 34, foot], [mid + s * 14, cy + 130]];
    polyF(g, outer.map(([px, py]) => [px + s * 1, py + 1] as [number, number]), INK); polyF(g, outer, VELV[3]);
    for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.2; g.strokeStyle = k % 2 ? VELV[2] : VELV[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + s * (24 + t * 10), cy + 18); g.quadraticCurveTo(mid + s * (14 + t * 46), cy + 126, ex - s * (34 - t * 36), foot - 2); g.stroke(); }
    g.strokeStyle = GD[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + s * 22, cy + 16); g.quadraticCurveTo(mid + s * 14, cy + 130, ex - s * 34, foot); g.stroke();
    g.strokeStyle = GD[5]; g.lineWidth = 1; g.stroke();
    B(g, mid + s * 30 - 3, cy + 110, 6, 12, GD[2]); B(g, mid + s * 30 - 4, cy + 120, 8, 10, GD[3]); B(g, mid + s * 30 - 4, cy + 120, 2, 10, GD[5]);
  }
  // (the crown: a velvet cushion band, gilt points with pearls, a jewel)
  B(g, cx - 38, cy + 8, 76, 14, INK); B(g, cx - 37, cy + 9, 74, 12, VELV[3]); B(g, cx - 37, cy + 9, 74, 3, VELV[5]); B(g, cx - 37, cy + 18, 74, 3, VELV[1]);
  giltBand(g, cx - 40, cy + 20, 80, 6);
  for (let k = 0; k < 5; k++) { const px = cx - 32 + k * 16, ph = k % 2 ? 18 : 28; polyF(g, [[px - 7, cy + 9], [px, cy + 9 - ph], [px + 7, cy + 9]], INK); polyF(g, [[px - 6, cy + 9], [px, cy + 10 - ph], [px + 6, cy + 9]], GD[3]); polyF(g, [[px - 6, cy + 9], [px, cy + 10 - ph], [px - 1, cy + 9]], GD[5]); disc(g, px, cy + 8 - ph, 2.5, '#FFF8F0'); B(g, px - 1, cy + 7 - ph, 1, 1, '#FFFFFF'); }
  disc(g, cx, cy + 14, 4, INK); disc(g, cx, cy + 14, 3, '#E8205A'); B(g, cx - 1, cy + 12, 1, 1, '#FFC0D0');
};

// ---------------------------------------------------------------------------------------------------------------
// The furniture (each painted once)

/** The canopy bed (local: its left at 0, the floor at 0): a padded heart headboard, a ruffled skirt, the mattress
 *  quilted, a satin duvet in folds, a mountain of pillows and a plush of her; twisted gilt posts; the canopy (its top
 *  the ledge, lit) with a scalloped valance, fringe and tassels; sheer curtains tied back. Wrecked: the canopy down
 *  across it, a post snapped, the curtains in a heap, plaster on the duvet. */
const bedArt = (g: Ctx, w: number, h: number, wrecked: boolean) => {
  const post = (px: number, top: number, bot: number) => {
    B(g, px - 1, top, 9, bot - top, INK); B(g, px, top, 7, bot - top, GD[3]);
    for (let y = top; y < bot; y += 6) { polyF(g, [[px, y], [px + 7, y + 3], [px + 7, y + 5], [px, y + 2]], GD[5]); polyF(g, [[px, y + 3], [px + 7, y + 6], [px + 7, y + 7], [px, y + 4]], GD[1]); }
    B(g, px - 3, bot - 8, 13, 8, INK); B(g, px - 2, bot - 7, 11, 6, GD[3]); B(g, px - 2, bot - 7, 11, 1, GD[5]);
  };
  // (the headboard: a padded heart, tufted, a gilt rim, a little crown)
  const hx = 40, hy = -128;
  const heart = (k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(hx - 18 * k, hy, 24 * k, Math.PI * 0.75, Math.PI * 2); g.arc(hx + 18 * k, hy, 24 * k, Math.PI, Math.PI * 2.25); g.lineTo(hx, hy + 50 * k); g.closePath(); g.fill(); };
  heart(1.08, INK); heart(1.02, GD[3]); heart(0.94, VELV[2]); heart(0.86, VELV[3]);
  g.save(); heart(0.86, VELV[3]); g.clip(); disc(g, hx - 22, hy - 10, 14, VELV[4]); disc(g, hx - 26, hy - 14, 6, VELV[5]); g.restore();
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - (r > 2 ? 1 : 0); k++) { const bx = hx - 24 + k * 16 + (r % 2) * 8, by = hy - 14 + r * 13; if (r === 0 && (k === 1 || k === 2)) continue; B(g, bx, by, 2, 2, VELV[0]); B(g, bx, by - 1, 1, 1, VELV[5]); }
  pmap(g, CROWN, hx - 6, hy - 34, INK); pmap(g, CROWN, hx - 7, hy - 35, GD[4]);
  // (the footboard)
  B(g, w - 34, -104, 30, 70, INK); B(g, w - 33, -103, 28, 68, VELV[3]); B(g, w - 33, -103, 28, 3, VELV[5]); B(g, w - 8, -103, 3, 68, VELV[1]);
  for (let k = 0; k < 3; k++) B(g, w - 26 + (k % 2) * 8, -90 + k * 16, 2, 2, VELV[0]);
  g.strokeStyle = GD[3]; g.lineWidth = 3; g.beginPath(); g.moveTo(w - 36, -102); g.quadraticCurveTo(w - 20, -122, w - 2, -102); g.stroke(); disc(g, w - 19, -114, 3, GD[4]);
  // (the skirt, ruffled, a gold fringe, gilt feet)
  B(g, 2, -40, w - 4, 34, INK);
  for (let x = 3; x < w - 3; x += 6) { B(g, x, -39, 3, 32, SATIN[3]); B(g, x + 3, -39, 2, 32, SATIN[2]); B(g, x, -39, 1, 32, SATIN[4]); polyF(g, [[x, -7], [x + 3, -4], [x + 6, -7]], SATIN[2]); }
  for (let x = 3; x < w - 3; x += 2) B(g, x, -6, 1, 3 + (x % 4 ? 0 : 1), GD[x % 4 ? 3 : 4]);
  for (const fx of [8, w / 2, w - 16]) { B(g, fx - 1, -6, 10, 6, INK); B(g, fx, -6, 8, 5, GD[3]); B(g, fx, -6, 3, 5, GD[5]); }
  // (the mattress, quilted, piped)
  B(g, 0, -66, w, 28, INK); B(g, 1, -65, w - 2, 26, SATIN[4]); B(g, 1, -65, w - 2, 2, SATIN[5]); B(g, 1, -42, w - 2, 3, SATIN[2]);
  for (let x = 6; x < w - 4; x += 12) { B(g, x, -58, 1, 12, SATIN[2]); B(g, x + 6, -54, 1, 1, SATIN[1]); }
  if (!wrecked) {
    // (the duvet: satin over its far two-thirds, hanging in scallops over the side, hearts, the sheen)
    polyF(g, [[90, -72], [w - 2, -72], [w - 2, -34], [90, -40]], INK);
    polyF(g, [[91, -71], [w - 3, -71], [w - 3, -36], [91, -42]], SATIN[3]);
    for (let x = 92; x < w - 4; x += 14) { B(g, x, -70, 5, 32, SATIN[4]); B(g, x + 10, -70, 3, 32, SATIN[2]); ell(g, x + 7, -36, 7, 3, SATIN[3]); }
    B(g, 91, -71, w - 94, 3, SATIN[5]);
    for (let x = 110; x < w - 20; x += 40) { pmap(g, HEART5, x, -58, SATIN[1]); pmap(g, HEART5, x - 1, -59, SATIN[5]); }
    // (a fur throw across the foot)
    B(g, w - 90, -76, 50, 10, '#F8F0F4'); for (let x = w - 90; x < w - 40; x += 3) B(g, x, -78 + (x % 6 ? 0 : 1), 2, 3, '#FFFFFF'); B(g, w - 90, -68, 50, 2, '#C8B8C4');
    // (the pillows: big ones stacked, a heart, a bolster)
    const pill = (px: number, py: number, rw: number, rh: number, R6: string[]) => { ell(g, px, py, rw + 1, rh + 1, INK); ell(g, px, py, rw, rh, R6[3]); ell(g, px - rw * 0.2, py - rh * 0.25, rw * 0.7, rh * 0.5, R6[4]); B(g, px - rw * 0.5, py - rh * 0.5, 3, 1, R6[5]); };
    pill(62, -78, 24, 10, CREAM); pill(84, -80, 22, 10, SATIN); pill(70, -90, 20, 9, CREAM);
    g.fillStyle = INK; g.beginPath(); g.arc(102, -88, 7, 0, Math.PI * 2); g.arc(114, -88, 7, 0, Math.PI * 2); g.fill(); polyF(g, [[95, -86], [108, -72], [121, -86]], INK);
    g.fillStyle = VELV[3]; g.beginPath(); g.arc(102, -88, 6, 0, Math.PI * 2); g.arc(114, -88, 6, 0, Math.PI * 2); g.fill(); polyF(g, [[96, -86], [108, -73], [120, -86]], VELV[3]); B(g, 99, -92, 3, 2, VELV[5]);
    // (a plush of her on the pillows: pink, round, a beehive)
    ell(g, 134, -80, 9, 8, INK); ell(g, 134, -80, 8, 7, '#F45AAE'); ell(g, 134, -92, 5, 5, '#F8CDB4'); ell(g, 134, -100, 4, 5, '#F6E8B0'); B(g, 132, -93, 1, 1, INK); B(g, 135, -93, 1, 1, INK); B(g, 133, -90, 2, 1, '#D21E4A');
    // (the posts, the canopy: cornice, its lit top (the ledge), the valance in scallops, fringe, tassels)
    post(4, -h, 0); post(w - 11, -h, 0);
    B(g, -7, -h - 5, w + 14, 22, INK);
    B(g, -6, -h, w + 12, 16, VELV[3]); B(g, -6, -h + 2, w + 12, 2, VELV[4]); B(g, -6, -h + 12, w + 12, 4, VELV[1]);
    giltBand(g, -6, -h + 5, w + 12, 5);
    lip(g, -6, -h, w + 12);
    for (let k = 0; k < 10; k++) {
      const sx = -4 + k * ((w + 8) / 10), sw = (w + 8) / 10;
      g.fillStyle = INK; g.beginPath(); g.moveTo(sx, -h + 15); g.quadraticCurveTo(sx + sw / 2, -h + 36, sx + sw, -h + 15); g.closePath(); g.fill();
      g.fillStyle = k % 2 ? VELV[3] : VELV[4]; g.beginPath(); g.moveTo(sx + 1, -h + 15); g.quadraticCurveTo(sx + sw / 2, -h + 34, sx + sw - 1, -h + 15); g.closePath(); g.fill();
      for (let t = 0.1; t < 0.95; t += 0.12) { const fx = sx + sw * t, fy = -h + 15 + Math.sin(t * Math.PI) * 18; B(g, fx, fy, 1, 4, GD[4]); }
      B(g, sx - 1, -h + 16, 3, 9, GD[2]); B(g, sx - 2, -h + 24, 5, 6, GD[3]); B(g, sx - 2, -h + 24, 1, 6, GD[5]);
    }
    // (the sheer curtains: gathered under the valance, tied back to the posts with gold, falling to the floor)
    for (const s of [-1, 1]) {
      const px = s < 0 ? 8 : w - 7;
      g.globalAlpha = 0.6;
      polyF(g, [[px - s * 2, -h + 16], [px + s * 36, -h + 16], [px + s * 6, -108], [px + s * 30, 0], [px - s * 4, 0], [px - s * 4, -108]], '#FFE4F2');
      g.globalAlpha = 1;
      for (let k = 0; k < 4; k++) { g.strokeStyle = SATIN[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(px + s * (4 + k * 8), -h + 18); g.quadraticCurveTo(px + s * 4, -108, px + s * (2 + k * 7), 0); g.stroke(); }
      B(g, px - 6, -112, 12, 5, GD[3]); B(g, px - 6, -112, 12, 1, GD[5]); B(g, px + s * 4 - 2, -108, 4, 12, GD[2]);
    }
  } else {
    // (wrecked: plaster all over the duvet, the canopy slumped across from a snapped post, the curtains heaped)
    polyF(g, [[60, -72], [w - 2, -72], [w - 2, -36], [60, -40]], SATIN[2]);
    for (let x = 62; x < w - 4; x += 14) { B(g, x, -70, 4, 32, SATIN[3]); B(g, x + 9, -70, 3, 32, SATIN[1]); }
    post(4, -118, 0); polyF(g, [[3, -118], [7, -128], [9, -120], [12, -126], [12, -118]], GD[2]);
    g.save(); g.translate(w - 8, 0); g.rotate(0.22); post(-3, -h + 10, 0); g.restore();
    g.save(); g.translate(w / 2, -88); g.rotate(-0.16);
    B(g, -w / 2 - 10, -12, w + 20, 22, INK); B(g, -w / 2 - 9, -11, w + 18, 20, VELV[2]); B(g, -w / 2 - 9, -11, w + 18, 3, VELV[4]); giltBand(g, -w / 2 - 9, -6, w + 18, 4, false);
    for (let k = 0; k < 9; k++) { const sx = -w / 2 - 6 + k * ((w + 12) / 9), sw = (w + 12) / 9; g.fillStyle = k % 2 ? VELV[1] : VELV[3]; g.beginPath(); g.moveTo(sx, 9); g.quadraticCurveTo(sx + sw / 2, 24 + (k % 3) * 4, sx + sw, 9); g.closePath(); g.fill(); B(g, sx, 9, 2, 6, GD[2]); }
    polyF(g, [[30, 9], [44, 9], [36, 20]], VELV[0]);
    g.restore();
    g.globalAlpha = 0.7; for (const s of [0, 1]) { const px = s ? w - 40 : -10; polyF(g, [[px, 0], [px + 10, -24], [px + 30, -30], [px + 48, -14], [px + 52, 0]], '#FFE4F2'); } g.globalAlpha = 1;
    for (let k = 0; k < 12; k++) { const rx = 40 + hash(k * 3.7) * (w - 70), rw = 4 + hash(k) * 8; polyF(g, [[rx - rw, -64], [rx - rw * 0.3, -64 - rw * 0.7], [rx + rw, -64]], PLAST[3]); B(g, rx - rw * 0.3, -64 - rw * 0.7, rw * 0.6, 1, PLAST[5]); }
    for (let k = 0; k < 10; k++) B(g, 70 + hash(k * 9.1) * 200, -96 - hash(k * 2.3) * 40, 3, 1, '#FFFFFF');
  }
};

/** A rococo wardrobe (local: its left at 0, the floor at 0): cabriole feet, a scalloped apron, two doors of raised
 *  panels with gilt beading and a painted rose medallion each, escutcheons, a stepped cornice with its top lit (the
 *  ledge). `ajar`: the right door swung open on her gowns, a boa trailing out, a glass slipper; else a tiara on the
 *  knob and a sock in the door. */
const wardrobeArt = (g: Ctx, w: number, h: number, ajar: boolean) => {
  const top = -h, C = CREAM;
  for (const fx of [4, w - 12]) { B(g, fx - 1, -16, 10, 16, INK); polyF(g, [[fx, -16], [fx + 8, -16], [fx + 6, -4], [fx + 9, 0], [fx, 0], [fx + 2, -4]], GD[3]); B(g, fx, -16, 2, 12, GD[5]); }
  B(g, 1, -28, w - 2, 13, INK); B(g, 2, -27, w - 4, 11, C[3]);
  for (let k = 0; k < 3; k++) { const sx = 2 + k * ((w - 4) / 3); g.fillStyle = C[3]; g.beginPath(); g.moveTo(sx, -17); g.quadraticCurveTo(sx + (w - 4) / 6, -10, sx + (w - 4) / 3, -17); g.fill(); }
  pmap(g, HEART5, w / 2 - 2, -24, GD[3]);
  B(g, 0, top + 12, w, h - 40, INK); B(g, 1, top + 13, w - 2, h - 42, C[3]); B(g, 1, top + 13, 4, h - 42, C[4]); B(g, 1, top + 13, 1, h - 42, C[5]); B(g, w - 7, top + 13, 6, h - 42, C[2]); checker(g, w - 9, top + 13, 2, h - 42, C[2], 0, 1);
  const door = (dx: number, dw: number) => {
    const py = top + 22, ph = h - 62;
    B(g, dx, py, dw, ph, C[1]); B(g, dx + 1, py + 1, dw - 2, ph - 2, C[4]); B(g, dx + 1, py + 1, dw - 2, 1, C[5]); B(g, dx + dw - 2, py + 1, 1, ph - 2, C[2]);
    // (the raised panels: an arched top one, a lower one)
    const ix = dx + 6, iw = dw - 12;
    g.fillStyle = C[1]; g.beginPath(); g.moveTo(ix, py + ph * 0.58); g.lineTo(ix, py + 18); g.quadraticCurveTo(ix + iw / 2, py + 2, ix + iw, py + 18); g.lineTo(ix + iw, py + ph * 0.58); g.closePath(); g.fill();
    g.fillStyle = C[3]; g.beginPath(); g.moveTo(ix + 2, py + ph * 0.58 - 2); g.lineTo(ix + 2, py + 19); g.quadraticCurveTo(ix + iw / 2, py + 5, ix + iw - 2, py + 19); g.lineTo(ix + iw - 2, py + ph * 0.58 - 2); g.closePath(); g.fill();
    B(g, ix + 2, py + 19, 1, ph * 0.58 - 21, C[5]);
    for (let y = py + 20; y < py + ph * 0.58 - 4; y += 3) { B(g, ix + 4, y, 1, 1, GD[4]); B(g, ix + iw - 5, y, 1, 1, GD[2]); }
    const my = py + ph * 0.3;
    ell(g, ix + iw / 2, my, 11, 14, INK); ell(g, ix + iw / 2, my, 10, 13, GD[3]); ell(g, ix + iw / 2, my, 8, 11, '#F8EEF4'); rose(g, ix + iw / 2, my - 1, 1.6); B(g, ix + iw / 2 - 6, my - 9, 2, 1, GD[5]);
    B(g, ix, py + ph * 0.64, iw, ph * 0.3, C[1]); B(g, ix + 2, py + ph * 0.64 + 2, iw - 4, ph * 0.3 - 4, C[3]); B(g, ix + 2, py + ph * 0.64 + 2, iw - 4, 1, C[5]);
    pmap(g, FLEUR, ix + iw / 2 - 3, py + ph * 0.64 + ph * 0.15 - 4, GD[3]);
  };
  const dw = (w - 10) / 2;
  door(5, dw);
  if (ajar) {
    // (inside: dark, the rail, her gowns, a boa trailing out, a glass slipper on the floor of it)
    const ix = 5 + dw, iy = top + 22, ih = h - 62;
    B(g, ix, iy, dw, ih, '#1A0814'); B(g, ix, iy + 6, dw, 2, GD[2]);
    const gowns = ['#F45AAE', '#B892D8', '#F2C84A', '#FF8AC8'];
    for (let k = 0; k < 4; k++) { const gx = ix + 4 + k * (dw - 8) / 4; B(g, gx + 4, iy + 6, 1, 6, GD[3]); polyF(g, [[gx + 1, iy + 12], [gx + 8, iy + 12], [gx + 12, iy + ih - 14], [gx - 3, iy + ih - 14]], gowns[k]); B(g, gx + 1, iy + 12, 2, ih - 26, mix(gowns[k], '#FFFFFF', 0.35)); B(g, gx + 7, iy + 12, 2, ih - 26, mix(gowns[k], '#000000', 0.3)); }
    polyF(g, [[ix + dw - 10, iy + ih - 6], [ix + dw - 2, iy + ih - 10], [ix + dw, iy + ih - 4], [ix + dw - 10, iy + ih - 2]], '#C8EEFF'); B(g, ix + dw - 8, iy + ih - 8, 2, 1, '#FFFFFF');
    // (the door swung out toward us: narrow, its edge lit)
    B(g, w - 2, top + 20, 14, h - 58, INK); B(g, w - 1, top + 21, 12, h - 60, C[4]); B(g, w - 1, top + 21, 2, h - 60, C[5]); B(g, w + 8, top + 21, 3, h - 60, C[2]);
    ell(g, w + 5, top + 21 + (h - 60) * 0.3, 3, 8, GD[3]);
    // (the boa: pink feathers draped out over the sill and down)
    for (let k = 0; k < 18; k++) { const t = k / 17, bx = ix + dw * 0.4 + t * 30, by = iy + ih * 0.5 + Math.sin(t * Math.PI) * 30 + t * 40; disc(g, bx, by, 4, k % 2 ? '#FF7AC0' : '#FFB0DC'); B(g, bx - 1, by - 2, 2, 1, '#FFE4F2'); }
  } else {
    door(5 + dw, dw);
    B(g, 5 + dw - 1, top + 22, 2, h - 62, C[1]);
    for (const dx of [-6, 4]) { B(g, 5 + dw + dx, top + 22 + (h - 62) * 0.5 - 6, 3, 12, INK); B(g, 5 + dw + dx, top + 22 + (h - 62) * 0.5 - 5, 2, 10, GD[3]); }
    pmap(g, CROWN, 5 + dw + 2, top + 22 + (h - 62) * 0.5 + 8, '#E8E8F4');
    B(g, 5 + dw - 2, top + 22 + (h - 62) * 0.8, 3, 12, '#FFFFFF'); B(g, 5 + dw - 2, top + 22 + (h - 62) * 0.8 + 10, 6, 3, '#FFFFFF'); B(g, 5 + dw - 1, top + 22 + (h - 62) * 0.8 + 2, 1, 6, '#C81E3A');
  }
  if (ajar) for (const dx of [-6]) { B(g, 5 + dw + dx, top + 22 + (h - 62) * 0.5 - 6, 3, 12, INK); B(g, 5 + dw + dx, top + 22 + (h - 62) * 0.5 - 5, 2, 10, GD[3]); }
  // (the cornice: stepped out, a gilt band, its top lit: you can stand on it)
  B(g, -6, top - 1, w + 12, 14, INK);
  B(g, -5, top, w + 10, 12, C[3]); B(g, -5, top + 3, w + 10, 2, C[5]); B(g, -3, top + 8, w + 6, 4, C[2]); B(g, -1, top + 11, w + 2, 2, C[1]);
  giltBand(g, -5, top + 5, w + 10, 3, false);
  for (let x = -3; x < w + 3; x += 5) B(g, x, top + 9, 3, 2, C[4]);
  lip(g, -5, top, w + 10);
};

/** The vanity (local: its left at 0, the floor at 0): the table in a tulle skirt of stepped folds, a bow, gilt feet;
 *  its top (not lit: you can't stand on it) crowded: perfumes, a candelabra, a powder compact, lipsticks, hairspray,
 *  bonbons, a photo of herself. The mirror's frame over it (the glass is live: vanityGlass). */
const MIR = { dx: 62, dy: -262, rx: 50, ry: 90 };
const vanityArt = (g: Ctx) => {
  const { dx: mx, dy: my, rx, ry } = MIR;
  // (the frame: an oval of gilt in steps, beads round it, a crest of a crown over a heart, scrolls, bulbs)
  ell(g, mx, my, rx + 12, ry + 12, INK); ell(g, mx, my, rx + 11, ry + 11, GD[1]); ell(g, mx - 1, my - 1, rx + 10, ry + 10, GD[3]); ell(g, mx - 2, my - 3, rx + 7, ry + 6, GD[4]);
  ell(g, mx, my, rx + 6, ry + 6, GD[2]); ell(g, mx, my, rx + 3, ry + 3, GD[1]); ell(g, mx, my, rx + 1, ry + 1, INK);
  for (let k = 0; k < 40; k++) { const a = (k / 40) * Math.PI * 2; B(g, mx + Math.cos(a) * (rx + 8) - 1, my + Math.sin(a) * (ry + 8) - 1, 2, 2, a > Math.PI * 0.8 && a < Math.PI * 1.7 ? GD[5] : GD[2]); }
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(mx + s * (rx + 8), my + 30, 10, s < 0 ? 0.5 : Math.PI - 3.6, s < 0 ? 3.6 : Math.PI - 0.5); g.stroke(); g.strokeStyle = GD[3]; g.lineWidth = 3; g.stroke(); }
  pmap(g, HEART, mx - 7, my - ry - 22, INK, 2); pmap(g, HEART, mx - 8, my - ry - 23, GD[3], 2); B(g, mx - 6, my - ry - 21, 2, 2, GD[5]);
  pmap(g, CROWN, mx - 11, my - ry - 38, INK, 2); pmap(g, CROWN, mx - 12, my - ry - 39, GD[4], 2); disc(g, mx, my - ry - 33, 2, '#E8205A');
  for (let k = 0; k < 14; k++) { const a = Math.PI * 0.1 + (k / 13) * Math.PI * 1.8 - Math.PI * 0.5 + Math.PI; const bx = mx + Math.cos(a) * (rx + 14), by = my + Math.sin(a) * (ry + 14); if (by > my + ry - 6) continue; disc(g, bx, by, 3.5, INK); disc(g, bx, by, 2.6, '#FFF0C0'); B(g, bx - 1, by - 1, 1, 1, '#FFFFFF'); }
  // (the table top: cream marble, a gilt edge; not lit)
  B(g, -4, -86, 148, 8, INK); B(g, -3, -85, 146, 6, CREAM[3]); B(g, -3, -85, 146, 1, CREAM[4]); B(g, -3, -80, 146, 1, GD[2]);
  // (the skirt: tulle in folds, stepped, a scalloped hem, a satin bow)
  B(g, 0, -78, 140, 74, INK);
  for (let x = 1; x < 139; x += 7) { B(g, x, -78, 4, 72, SATIN[4]); B(g, x + 4, -78, 3, 72, SATIN[3]); B(g, x, -78, 1, 72, SATIN[5]); polyF(g, [[x, -6], [x + 3.5, -2], [x + 7, -6]], SATIN[3]); }
  g.globalAlpha = 0.5; for (let x = 1; x < 139; x += 5) B(g, x, -40 + Math.sin(x * 0.3) * 4, 2, 32, '#FFFFFF'); g.globalAlpha = 1;
  pmap(g, BOW, 66, -76, INK, 2); pmap(g, BOW, 65, -77, VELV[3], 2); B(g, 70, -73, 2, 3, VELV[5]);
  for (const fx of [4, 128]) { B(g, fx - 1, -6, 10, 6, INK); B(g, fx, -6, 8, 6, GD[3]); B(g, fx, -6, 2, 6, GD[5]); }
  // (on it: perfumes, a candelabra (its flames live), a compact, lipsticks, hairspray, bonbons, a photo of her)
  const bottle = (bx: number, bh: number, col: string, ato: boolean) => {
    const R6 = [mix(col, INK, 0.5), mix(col, INK, 0.25), col, mix(col, '#FFFFFF', 0.25), mix(col, '#FFFFFF', 0.55), '#FFFFFF'];
    polyF(g, [[bx - 6, -86], [bx - 7, -86 - bh * 0.6], [bx - 3, -86 - bh], [bx + 3, -86 - bh], [bx + 7, -86 - bh * 0.6], [bx + 6, -86]], INK);
    polyF(g, [[bx - 5, -87], [bx - 6, -86 - bh * 0.6], [bx - 2, -85 - bh], [bx + 2, -85 - bh], [bx + 6, -86 - bh * 0.6], [bx + 5, -87]], R6[2]);
    B(g, bx - 4, -84 - bh * 0.8, 2, bh * 0.6, R6[4]); B(g, bx + 2, -84 - bh * 0.7, 2, bh * 0.5, R6[1]); B(g, bx - 3, -84 - bh * 0.75, 1, 2, R6[5]);
    B(g, bx - 2, -90 - bh, 4, 5, INK); B(g, bx - 1, -89 - bh, 2, 4, GD[3]);
    if (ato) { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(bx + 2, -88 - bh); g.quadraticCurveTo(bx + 10, -92 - bh, bx + 12, -84 - bh); g.stroke(); ell(g, bx + 13, -82 - bh, 4, 5, '#F45AAE'); B(g, bx + 12, -84 - bh, 1, 1, '#FFC0E0'); B(g, bx + 13, -77 - bh, 1, 6, GD[3]); }
  };
  bottle(14, 18, '#F43F8E', true); bottle(32, 12, '#A78BFA', false); bottle(118, 16, '#67E8F9', true); bottle(132, 10, '#FDE68A', false);
  // (the candelabra)
  const cx = 52; B(g, cx - 6, -88, 12, 3, GD[2]); B(g, cx - 1, -110, 3, 22, GD[3]); B(g, cx - 1, -110, 1, 22, GD[5]);
  g.strokeStyle = GD[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 12, -112); g.quadraticCurveTo(cx, -100, cx + 12, -112); g.stroke();
  for (const dx of [-12, 0, 12]) { B(g, cx + dx - 3, -114, 7, 3, GD[3]); B(g, cx + dx - 1, -124, 3, 10, '#FFF8E8'); B(g, cx + dx - 1, -124, 1, 10, '#FFFFFF'); B(g, cx + dx + 1, -120, 1, 3, '#E8DCC8'); }
  // (the compact, lipsticks, hairspray, bonbons, her photo)
  ell(g, 70, -88, 8, 3, INK); ell(g, 70, -89, 7, 2, GD[3]); B(g, 66, -90, 3, 1, GD[5]);
  for (let k = 0; k < 3; k++) { B(g, 80 + k * 4, -96, 3, 10, INK); B(g, 80 + k * 4, -95, 2, 6, GD[3]); B(g, 80 + k * 4, -99, 2, 4, ['#D21E4A', '#F43F8E', '#A01E64'][k]); }
  B(g, 94, -110, 10, 24, INK); B(g, 95, -109, 8, 22, '#F472B6'); B(g, 95, -109, 2, 22, '#FFB0D8'); B(g, 95, -104, 8, 6, '#FFFFFF'); signText(g, 'HOLD', 99, -99, { sx: 1, sy: 1, gap: 0, fill: '#A01E64' }); B(g, 96, -114, 6, 5, '#E4E4E7');
  ell(g, 108, -91, 7, 5, '#E0F0FF'); for (let k = 0; k < 4; k++) disc(g, 105 + (k % 2) * 5, -91 - Math.floor(k / 2) * 3, 2, ['#6A3A1E', '#F45AAE', '#8A4A2A', '#FDE68A'][k]); B(g, 102, -97, 12, 2, '#C8E4F4');
  B(g, 18, -112, 16, 20, INK); B(g, 19, -111, 14, 18, GD[3]); B(g, 21, -109, 10, 14, '#E08AB8'); drawBust(g, piperBust('stand'), 21, -109, 10, 14, 150);
};
/** The mirror's glass, live: banded silver with the room in it soft, her in it when she's near, cracked (stage 2 on),
 *  a piece out (stage 5 on); the bulbs' soft glow. */
const vanityGlass = (c: Ctx, x: number, f: number, stage: number, look: RoomLook) => {
  const piperX = look.piperX;
  const mx = x + MIR.dx, my = GY + MIR.dy, { rx, ry } = MIR;
  c.save(); c.beginPath(); c.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2); c.clip();
  const bands = ['#7A6A94', '#968ABA', '#B4A8D4', '#C8BEE4', '#B4A8D4', '#9A8EBE'];
  bands.forEach((col, i) => B(c, mx - rx, my - ry + (i * 2 * ry) / bands.length, rx * 2, (2 * ry) / bands.length + 1, col));
  // (the room in it: the far wall's rose, the window's light, a chandelier's glow)
  B(c, mx - rx, my + ry * 0.45, rx * 2, ry, '#8A5A84'); B(c, mx - rx, my + ry * 0.45, rx * 2, 2, '#B07AA4');
  c.globalAlpha = 0.35; B(c, mx + 10, my - 60, 22, 70, '#E8E4FF'); c.globalAlpha = 0.2; c.fillStyle = '#FFF0C0'; c.beginPath(); c.arc(mx - 20, my - 62, 16, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  if (piperX !== null && look.reflect && Math.abs(piperX - mx) < 280) {
    // (her, as she is this very frame (her own drawing, moved and shrunk into the glass: a mirror on the wall behind
    // her flips her front to back, not left to right, so she faces the way she does), then the glass's tint over her)
    const wy = look.piperY ?? GY;
    c.save();
    c.translate(mx + (piperX - mx) * 0.35, my + 118 + (wy - GY) * 0.35); c.scale(0.9, 0.9); c.translate(-piperX, -wy);
    look.reflect(c, f);
    c.restore();
    c.globalAlpha = 0.3; B(c, mx - rx, my - ry, rx * 2, ry * 2, '#B4A8D4'); c.globalAlpha = 1;
  }
  c.restore();
  c.save(); c.beginPath(); c.ellipse(mx, my, rx, ry, 0, 0, Math.PI * 2); c.clip();
  c.globalAlpha = 0.5; polyF(c, [[mx - rx, my - 10], [mx - 6, my - ry], [mx + 10, my - ry], [mx - rx, my + 18]], '#FFFFFF'); polyF(c, [[mx - rx, my + 34], [mx + 20, my - ry], [mx + 26, my - ry], [mx - rx, my + 44]], '#FFFFFF'); c.globalAlpha = 1;
  if (stage >= 2) {
    const ix = mx + 12, iy = my + 6;
    c.strokeStyle = '#3A3050'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 9; k++) { const a = k * 0.72 + 0.3; c.moveTo(ix, iy); c.lineTo(ix + Math.cos(a) * 70, iy + Math.sin(a) * 100); } c.stroke();
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 9; k++) { const a = k * 0.72 + 0.3; c.moveTo(ix + 1, iy); c.lineTo(ix + 1 + Math.cos(a) * 70, iy + Math.sin(a) * 100); } c.stroke();
    c.strokeStyle = '#E8E4FF'; c.lineWidth = 1; c.beginPath(); for (const r of [10, 22]) { for (let k = 0; k <= 9; k++) { const a = k * 0.72 + 0.3, px = ix + Math.cos(a) * r, py = iy + Math.sin(a) * r * 1.3; if (k) c.lineTo(px, py); else c.moveTo(px, py); } } c.stroke();
    if (stage >= 5) polyF(c, [[ix, iy], [ix + Math.cos(1.02) * 80, iy + Math.sin(1.02) * 110], [ix + Math.cos(1.74) * 80, iy + Math.sin(1.74) * 110]], '#1A0814');
  }
  c.restore();
  // (the bulbs' glow, soft)
  c.globalAlpha = 0.07 + 0.02 * Math.sin(f * 0.05); c.fillStyle = '#FFE9A8'; c.beginPath(); c.ellipse(mx, my - 20, rx + 30, ry + 26, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  // (the candelabra's flames)
  for (const dx of [-12, 0, 12]) { const fl = Math.floor((f + dx * 3) / 5) % 3; const fx = x + 52 + dx, fy = GY - 124; B(c, fx - 1, fy - 5 - fl, 3, 5 + fl, '#F97316'); B(c, fx, fy - 4 - fl, 1, 4, '#FDE68A'); }
  c.globalAlpha = 0.1; c.fillStyle = '#FFD878'; c.beginPath(); c.arc(x + 52, GY - 128, 26, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
};

/** Her chaise (local: its middle at 0, the floor at 0; the heart at the right end, as piper.ts's lounge has it
 *  facing the door): pink velvet buttoned in a diamond grid, piping, a gilt rail, cabriole feet, a fur throw and a box
 *  of bonbons on it. Not lit (not somewhere to stand). */
const chaiseArt = (g: Ctx) => {
  const S = (pts: [number, number][], col: string) => polyF(g, pts, col);
  // (the heart back, right end)
  const hx = 96, hy = -64;
  g.fillStyle = INK; g.beginPath(); g.arc(hx - 12, hy - 8, 19, 0, Math.PI * 2); g.arc(hx + 12, hy - 8, 19, 0, Math.PI * 2); g.fill(); S([[hx - 30, hy], [hx, hy + 38], [hx + 30, hy]], INK);
  g.fillStyle = VELV[3]; g.beginPath(); g.arc(hx - 12, hy - 8, 17, 0, Math.PI * 2); g.arc(hx + 12, hy - 8, 17, 0, Math.PI * 2); g.fill(); S([[hx - 28, hy - 2], [hx, hy + 35], [hx + 28, hy - 2]], VELV[3]);
  disc(g, hx - 16, hy - 14, 8, VELV[4]); disc(g, hx - 19, hy - 17, 3, VELV[5]); S([[hx + 6, hy + 6], [hx + 24, hy - 4], [hx, hy + 30]], VELV[2]);
  for (const [bx, by] of [[-10, -12], [10, -12], [0, 0], [-16, 2], [16, 2], [0, 14]]) { B(g, hx + bx, hy + by, 2, 2, VELV[0]); B(g, hx + bx, hy + by - 1, 1, 1, VELV[5]); }
  g.strokeStyle = GD[3]; g.lineWidth = 2; g.beginPath(); g.arc(hx - 12, hy - 8, 18, Math.PI * 0.85, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(hx + 12, hy - 8, 18, Math.PI * 1.1, Math.PI * 2.15); g.stroke();
  // (the seat: a long cushion, buttoned, piped; the scroll arm at the left)
  B(g, -94, -44, 190, 32, INK); B(g, -93, -43, 188, 30, VELV[3]); B(g, -93, -43, 188, 4, VELV[5]); B(g, -93, -39, 188, 3, VELV[4]); B(g, -93, -18, 188, 5, VELV[1]); checker(g, -93, -20, 188, 2, VELV[2], 0, 1);
  for (let k = 0; k < 7; k++) for (let r = 0; r < 2; r++) { const bx = -84 + k * 26 + r * 13, by = -34 + r * 8; B(g, bx, by, 2, 2, VELV[0]); B(g, bx - 4, by - 2, 4, 1, VELV[2]); B(g, bx + 2, by + 2, 4, 1, VELV[4]); }
  disc(g, -94, -42, 12, INK); disc(g, -94, -42, 11, VELV[3]); disc(g, -96, -44, 6, VELV[4]); disc(g, -94, -42, 4, GD[3]); disc(g, -95, -43, 2, GD[5]);
  B(g, -95, -13, 192, 4, INK); B(g, -94, -12, 190, 3, GD[3]); B(g, -94, -12, 190, 1, GD[5]);
  for (const fx of [-86, -6, 80]) { B(g, fx - 1, -10, 10, 10, INK); S([[fx, -10], [fx + 8, -10], [fx + 6, -3], [fx + 9, 0], [fx, 0], [fx + 2, -4]], GD[3]); B(g, fx, -10, 2, 7, GD[5]); }
  // (a fur throw over the arm, the bonbons)
  B(g, -88, -48, 38, 18, '#F8F0F4'); for (let x = -88; x < -50; x += 3) B(g, x, -50 + (x % 6 ? 0 : 1), 2, 3, '#FFFFFF'); B(g, -88, -32, 38, 2, '#C8B8C4');
  polyF(g, [[30, -50], [44, -54], [52, -48], [48, -42], [32, -42]], INK); g.fillStyle = '#E8205A'; g.beginPath(); g.arc(38, -49, 5, 0, Math.PI * 2); g.arc(45, -49, 5, 0, Math.PI * 2); g.fill(); polyF(g, [[33, -47], [41, -40], [50, -47]], '#E8205A'); B(g, 36, -51, 2, 1, '#FF8AA4');
};

/** The footstool and THE VIEWING BALCONY (world): the stool tufted, its top lit; the balcony a marble slab, its top lit,
 *  over a balustrade and gilt corbels; the arched doors over it open on the grounds (the view by the hour), the doors'
 *  leaves folded back, heavy drapes swagged either side. */
const WIN = { l: 1560, r: 1694, top: GY - 458, bot: GY - 235 };
const windowView = (g: Ctx) => {
  // (the whole park laid out below, from up here: view.ts)
  const l = R(WIN.l) + 8, r = R(WIN.r) - 8, top = WIN.top + 8, bot = WIN.bot;
  parkView(g, l, r, top, bot, Math.round(top + (bot - top) * 0.48));
};
const balconyArt = (g: Ctx) => {
  const l = R(WIN.l), r = R(WIN.r), top = WIN.top, bot = WIN.bot, w = r - l;
  // (the arched opening: its moulded frame, gilt, the view (windowView) inside it, the leaded leaves folded back)
  const arch = (ins: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(l + ins, bot); g.lineTo(l + ins, top + w / 2); g.arc(l + w / 2, top + w / 2, w / 2 - ins, Math.PI, 0); g.lineTo(r - ins, bot); g.closePath(); g.fill(); };
  arch(-6, INK); arch(-5, CREAM[3]); arch(-2, GD[3]); arch(1, CREAM[2]); arch(7, INK);
  g.save(); arch(8, '#000'); g.clip(); windowView(g); g.restore();
  for (const s of [-1, 1]) {
    const ex = s < 0 ? l + 8 : r - 8, lw = 16;
    B(g, ex - (s < 0 ? 0 : lw), top + w / 2 - 20, lw, bot - top - w / 2 + 20, INK);
    B(g, ex - (s < 0 ? -1 : lw - 1), top + w / 2 - 19, lw - 2, bot - top - w / 2 + 18, GD[2]);
    for (let y = top + w / 2 - 16; y < bot - 4; y += 10) { B(g, ex - (s < 0 ? -3 : lw - 3), y, lw - 6, 8, '#9AB8E8'); B(g, ex - (s < 0 ? -3 : lw - 3), y, 2, 8, '#E0F0FF'); }
  }
  for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(l + w / 2, top + w / 2 + 6); g.lineTo(l + w / 2 + Math.cos(a) * (w / 2 - 8), top + w / 2 + Math.sin(a) * (w / 2 - 8)); g.stroke(); }
  pmap(g, HEART, l + w / 2 - 7, top + w / 2 - 20, INK, 2); pmap(g, HEART, l + w / 2 - 6, top + w / 2 - 19, '#F45AAE', 2);
  // (the drapes either side, swagged, gold tassels; a valance over)
  for (const s of [-1, 1]) {
    const ex = s < 0 ? l - 4 : r + 4;
    polyF(g, [[ex, top + 10], [ex + s * -22, top + 10], [ex + s * -10, bot - 90], [ex + s * -18, bot + 30], [ex + s * 8, bot + 30], [ex + s * 2, bot - 90]], INK);
    polyF(g, [[ex, top + 11], [ex + s * -20, top + 11], [ex + s * -9, bot - 90], [ex + s * -16, bot + 28], [ex + s * 7, bot + 28], [ex + s * 1, bot - 90]], VELV[3]);
    for (let k = 0; k < 3; k++) { g.strokeStyle = k % 2 ? VELV[4] : VELV[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(ex + s * (-4 - k * 6), top + 12); g.quadraticCurveTo(ex + s * -4, bot - 90, ex + s * (-14 + k * 7), bot + 26); g.stroke(); }
    B(g, ex + s * -10 - 4, bot - 96, 8, 6, GD[3]); B(g, ex + s * -10 - 2, bot - 90, 4, 14, GD[2]); B(g, ex + s * -10 - 3, bot - 78, 6, 8, GD[3]);
  }
  B(g, l - 24, top - 4, w + 48, 16, INK); B(g, l - 23, top - 3, w + 46, 14, VELV[3]); B(g, l - 23, top - 3, w + 46, 3, VELV[5]); giltBand(g, l - 23, top + 8, w + 46, 3, false);
  for (let k = 0; k < 6; k++) { const sx = l - 22 + k * ((w + 44) / 6); g.fillStyle = VELV[k % 2 ? 2 : 4]; g.beginPath(); g.moveTo(sx, top + 11); g.quadraticCurveTo(sx + (w + 44) / 12, top + 24, sx + (w + 44) / 6, top + 11); g.fill(); B(g, sx, top + 11, 2, 8, GD[3]); }
  // (the balcony: the slab (lit: you stand on it), a frieze, balusters, a bottom rail, corbels)
  const [, , bh] = LEDGES[4], sTop = GY - bh, bl = R(LEDGES[4][0]), bw = LEDGES[4][1];
  B(g, bl - 4, sTop - 1, bw + 8, 16, INK); B(g, bl - 3, sTop, bw + 6, 14, PALE[4]); B(g, bl - 3, sTop + 10, bw + 6, 4, PALE[2]); for (let x = bl; x < bl + bw; x += 14) B(g, x, sTop + 6, 1, 4, PALE[2]);
  lip(g, bl - 3, sTop, bw + 6);
  B(g, bl - 2, sTop + 14, bw + 4, 8, INK); B(g, bl - 1, sTop + 15, bw + 2, 6, PALE[3]); for (let x = bl + 4; x < bl + bw; x += 10) pmap(g, HEART5, x, sTop + 16, PINK[3]);
  for (let bx = bl + 4; bx < bl + bw - 6; bx += 12) {
    B(g, bx - 1, sTop + 22, 10, 40, INK);
    B(g, bx, sTop + 22, 8, 4, PALE[3]); ell(g, bx + 4, sTop + 34, 4, 7, PALE[3]); ell(g, bx + 3, sTop + 32, 2, 5, PALE[5]); B(g, bx + 2, sTop + 40, 4, 14, PALE[3]); B(g, bx + 2, sTop + 40, 1, 14, PALE[5]); B(g, bx + 5, sTop + 40, 1, 14, PALE[1]); B(g, bx, sTop + 54, 8, 6, PALE[2]);
  }
  B(g, bl - 2, sTop + 60, bw + 4, 8, INK); B(g, bl - 1, sTop + 61, bw + 2, 6, PALE[3]); B(g, bl - 1, sTop + 61, bw + 2, 1, PALE[5]);
  for (const ex of [bl + 8, bl + bw - 30]) { polyF(g, [[ex - 1, sTop + 68], [ex + 23, sTop + 68], [ex + 13, sTop + 118], [ex + 9, sTop + 118]], INK); polyF(g, [[ex, sTop + 68], [ex + 22, sTop + 68], [ex + 12, sTop + 116], [ex + 10, sTop + 116]], GD[3]); polyF(g, [[ex, sTop + 68], [ex + 6, sTop + 68], [ex + 10, sTop + 116]], GD[5]); disc(g, ex + 11, sTop + 80, 4, GD[1]); disc(g, ex + 10, sTop + 79, 2, GD[4]); }
  // (the footstool: tufted velvet, a fringe, gilt feet, its top lit)
  const [ox, ow, oh] = LEDGES[3], o = R(ox);
  B(g, o - 2, GY - oh - 1, ow + 4, oh - 8, INK); B(g, o - 1, GY - oh, ow + 2, oh - 12, VELV[3]); B(g, o - 1, GY - oh + 4, ow + 2, 3, VELV[4]); B(g, o + ow - 4, GY - oh, 4, oh - 12, VELV[1]);
  for (let k = 0; k < 3; k++) for (let r = 0; r < 2; r++) { const bx = o + 10 + k * 18 + r * 9, by = GY - oh + 14 + r * 12; B(g, bx, by, 2, 2, VELV[0]); B(g, bx, by - 1, 1, 1, VELV[5]); }
  for (let x = o - 1; x < o + ow + 1; x += 2) B(g, x, GY - 14, 1, 4 + (x % 4 ? 0 : 1), GD[x % 4 ? 3 : 4]);
  for (const fx of [o + 2, o + ow - 10]) { B(g, fx - 1, GY - 10, 10, 10, INK); polyF(g, [[fx, -10 + GY], [fx + 8, GY - 10], [fx + 6, GY - 3], [fx + 9, GY], [fx, GY], [fx + 2, GY - 4]], GD[3]); }
  lip(g, o - 1, GY - oh, ow + 2);
};

// ---------------------------------------------------------------------------------------------------------------
// The chandeliers

export const CHANDELIER_Y = CEIL_Y + 120;
/** A crystal chandelier's still parts (x its middle, y its ring): the ceiling rose, the chain link by link, a crown of
 *  crystal swags, the gilt baluster, two tiers of arms curling out to candle cups, candles, crystal drops on every arm,
 *  bead swags between, a big prism under. */
const chandArt = (g: Ctx, x: number, y: number, chain = true) => {
  if (chain) {
    disc(g, x, CEIL_Y + 6, 12, INK); disc(g, x, CEIL_Y + 6, 11, GD[2]); disc(g, x - 1, CEIL_Y + 5, 8, GD[3]); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; disc(g, x + Math.cos(a) * 7, CEIL_Y + 6 + Math.sin(a) * 7, 2, GD[4]); } disc(g, x, CEIL_Y + 6, 3, GD[5]);
    for (let cy = CEIL_Y + 16; cy < y - 60; cy += 7) { const odd = ((cy - CEIL_Y) / 7) % 2 < 1; if (odd) { B(g, x - 2, cy, 5, 7, INK); B(g, x - 1, cy + 1, 3, 5, GD[3]); B(g, x - 1, cy + 1, 1, 5, GD[5]); } else { B(g, x - 1, cy, 3, 7, INK); B(g, x, cy + 1, 1, 5, GD[4]); } }
  }
  // (the crown: a little ring, crystal swags off it)
  B(g, x - 14, y - 62, 28, 5, INK); B(g, x - 13, y - 61, 26, 3, GD[3]); B(g, x - 13, y - 61, 26, 1, GD[5]);
  for (let k = 0; k < 6; k++) { const sx = x - 13 + k * 5.2; for (let d = 0; d < 4; d++) B(g, sx, y - 56 + d * 4, 2, 3, d % 2 ? '#C8E4FF' : '#FFFFFF'); }
  // (the baluster)
  B(g, x - 4, y - 58, 9, 70, INK); B(g, x - 3, y - 57, 7, 68, GD[3]); B(g, x - 3, y - 57, 2, 68, GD[5]); B(g, x + 2, y - 57, 2, 68, GD[1]);
  ballR(g, x, y - 30, 7, GD); ballR(g, x, y + 4, 9, GD);
  // (the arms: two tiers, curling out, cups and candles on them, drops hanging off)
  const tier = (n: number, span: number, ay: number, cupY: number) => {
    for (let k = 0; k < n; k++) {
      const t = n === 1 ? 0 : k / (n - 1) - 0.5, ex = x + t * span * 2;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x, ay); g.quadraticCurveTo(x + t * span * 1.6, ay + 22, ex, cupY + 4); g.stroke();
      g.strokeStyle = GD[3]; g.lineWidth = 3; g.stroke(); g.strokeStyle = GD[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, ay - 1); g.quadraticCurveTo(x + t * span * 1.6, ay + 21, ex, cupY + 3); g.stroke();
      B(g, ex - 6, cupY, 12, 4, INK); B(g, ex - 5, cupY, 10, 3, GD[3]); B(g, ex - 5, cupY, 10, 1, GD[5]);
      B(g, ex - 2, cupY - 13, 5, 13, INK); B(g, ex - 1, cupY - 12, 3, 12, '#FFF8E8'); B(g, ex - 1, cupY - 12, 1, 12, '#FFFFFF'); B(g, ex + 1, cupY - 8, 1, 4, '#E8DCC8');
      for (let d = 0; d < 4; d++) B(g, ex - 1, cupY + 5 + d * 4, 2, 3, d % 2 ? '#B8D8F8' : '#FFFFFF');
      polyF(g, [[ex - 3, cupY + 21], [ex, cupY + 28], [ex + 3, cupY + 21], [ex, cupY + 19]], '#E8F4FF'); B(g, ex - 1, cupY + 21, 1, 3, '#FFFFFF');
    }
  };
  tier(5, 46, y - 2, y - 14); tier(3, 24, y - 34, y - 42);
  // (bead swags between the lower arms)
  for (let k = 0; k < 4; k++) { const a = x - 46 + k * 23; for (let s = 0; s <= 6; s++) { const t = s / 6; B(g, a + t * 23, y - 6 + Math.sin(t * Math.PI) * 12, 2, 2, s % 2 ? '#C8E4FF' : '#FFFFFF'); } }
  // (the big prism under)
  polyF(g, [[x - 7, y + 14], [x + 7, y + 14], [x, y + 36]], INK); polyF(g, [[x - 6, y + 15], [x + 6, y + 15], [x, y + 34]], '#C8E4FF'); polyF(g, [[x - 6, y + 15], [x, y + 15], [x, y + 34]], '#FFFFFF'); B(g, x - 1, y + 16, 1, 6, '#F0C8F0');
};
/** A chandelier hanging (its still parts a stamp; candle flames, glints and a soft glow live), or down on the carpet
 *  (the ring crumpled on its side, the arms bent, candles snapped, crystals everywhere, the chain in a heap). */
export const drawChandelier = (c: Ctx, x: number, y: number, f: number, down: boolean) => {
  if (down) {
    stillW(c, `chand-down-${Math.round(x)}`, x, GY, -90, -50, 180, 60, g => {
      for (let k = 0; k < 26; k++) { const px = x - 80 + hash(k * 1.7) * 160, py = GY - 2 - hash(k) * 6; polyF(g, [[px - 2, py], [px, py - 3], [px + 2, py], [px, py + 2]], k % 3 ? '#E8F4FF' : '#C8E4FF'); B(g, px - 1, py - 1, 1, 1, '#FFFFFF'); }
      for (let k = 0; k < 10; k++) { const px = x - 50 + k * 5, py = GY - 4 - Math.abs(Math.sin(k)) * 4; B(g, px, py, 4, 3, GD[k % 2 ? 2 : 3]); }
      ell(g, x, GY - 14, 34, 12, INK); ell(g, x, GY - 14, 32, 10, GD[2]); ell(g, x, GY - 14, 24, 6, INK); ell(g, x - 4, GY - 17, 22, 3, GD[4]);
      for (const [dx, a] of [[-30, -2.4], [-12, -1.9], [14, -1.2], [32, -0.6]] as const) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x + dx * 0.5, GY - 16); g.quadraticCurveTo(x + dx, GY - 30, x + dx + Math.cos(a) * 14, GY - 26 + Math.sin(a) * 10); g.stroke(); g.strokeStyle = GD[3]; g.lineWidth = 3; g.stroke(); }
      B(g, x - 44, GY - 10, 12, 4, '#FFF8E8'); B(g, x + 30, GY - 8, 4, 10, '#FFF8E8'); B(g, x + 36, GY - 6, 10, 4, '#FFF8E8');
      ballR(g, x + 4, GY - 22, 7, GD); polyF(g, [[x + 40, GY - 2], [x + 52, GY - 6], [x + 50, GY]], '#C8E4FF');
    });
    if (f % 50 < 3) B(c, x - 40 + ((f * 7) % 80), GY - 6, 1, 1, '#FFFFFF');
    return;
  }
  stillW(c, `chand-${Math.round(x)}`, x, y, -60, CEIL_Y - y - 8, 120, y - CEIL_Y + 50, g => chandArt(g, x, y));
  // (the flames, the glow, a crystal catching it now and then)
  c.globalAlpha = 0.08; c.fillStyle = '#FFE9A8'; c.beginPath(); c.arc(x, y - 20, 90, 0, Math.PI * 2); c.fill(); c.globalAlpha = 0.1; c.beginPath(); c.arc(x, y - 20, 52, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
  const flames = (n: number, span: number, cupY: number) => { for (let k = 0; k < n; k++) { const t = n === 1 ? 0 : k / (n - 1) - 0.5, ex = x + t * span * 2, fl = Math.floor((f + k * 7) / 5) % 3; B(c, ex - 1, cupY - 18 - fl, 3, 5 + fl, '#F97316'); B(c, ex, cupY - 17 - fl, 1, 4 + fl, '#FDE68A'); B(c, ex, cupY - 14, 1, 1, '#FFFFFF'); } };
  flames(5, 46, y - 14); flames(3, 24, y - 42);
  for (let k = 0; k < 3; k++) { const ph = (f + k * 37 + x) % 90; if (ph < 4) { const gx = x - 46 + hash(k * 3.1 + Math.floor((f + k * 37) / 90)) * 92, gy = y - 6 + hash(k * 7.7 + Math.floor(f / 90)) * 30; B(c, gx - 2, gy, 5, 1, '#FFFFFF'); B(c, gx, gy - 2, 1, 5, '#FFFFFF'); } }
};
/** The fallen chandelier on the carpet (in front of her drawn, after its fall). */
export const drawFallenChandelier = (c: Ctx, x: number, f: number) => drawChandelier(c, x, GY, f, true);

// ---------------------------------------------------------------------------------------------------------------
// Her bedroom, put together

/** The bedroom, behind everything: the cut above, the walls, the wreck as far as it's gone, her portraits and trophies,
 *  the furniture, the chandeliers, the hole she went out through. */
export const drawChamber = (c: Ctx, state: GameState, look: RoomLook) => {
  const f = state.frame, s = look.stage;
  if (state.camera.x + 1800 < ARENA_L - 100 || state.camera.x - 920 > ARENA_R + 300) return;
  const x0 = ARENA_L - 60, x1 = ARENA_R + 120;
  runW(c, state, 'cut', ARENA_MID - CONE_HW - 30, ARENA_MID + CONE_HW + 30, PEAK - 80, CEIL_Y, (g, a, b) => paintCut(g, a, b));
  runW(c, state, 'wall', x0, x1, CEIL_Y, GY + 140, (g, a, b) => paintWall(g, a, b));
  if (s >= 1) runW(c, state, `wreck${s}`, x0, x1, CEIL_Y, GY + 30, (g, a, b) => paintWreck(g, a, b, s));
  // (the drip from the holes, live)
  if (s >= 2) for (let k = 0; k < ceilHoles(s); k++) { const { x } = holeAt(k), t = (f + k * 23) % 70; if (t < 40) B(c, x + 6, CEIL_Y + 34 + t * 3, 1, 3, '#9ACCE8'); if (t > 66) B(c, x + 4, GY - 1, 4, 1, '#9ACCE8'); }
  // (the trophy wall and its scoreboard; the portraits, askew as it goes; the corona over the bed)
  stillW(c, 'trophies', TROPHY_X, GY, -120, -464, 300, 304, g => {
    scoreboard(g, TROPHY_X + 45, GY - 450);
    TROPHIES.forEach((T, i) => trophyArt(g, TROPHY_X - 30 + (i % 3) * 75, GY - 328 + Math.floor(i / 3) * 114, T, i));
  });
  const ti = s >= 5 ? 2 : s >= 3 ? 1 : 0;
  for (const P of PORTRAITS) stillW(c, `portrait-${P.x}-${ti}`, R(P.x), P.y, -P.w, -40, P.w * 2, P.h + 70, g => portraitArt(g, R(P.x), P.y, P.w, P.h, P.k, P.pose, P.bg, P.tilt[ti]));
  stillW(c, 'corona', R(1150), GY - 440, -200, -40, 400, 260, g => corona(g));
  stillW(c, 'balcony', R(WIN.l), GY, -70,WIN.top - GY - 20, WIN.r - WIN.l + 110, GY - WIN.top + 24, g => balconyArt(g));
  // (balloons drifting past out there)
  c.save(); c.beginPath(); c.rect(R(WIN.l) + 8, WIN.top + 70, WIN.r - WIN.l - 16, WIN.bot - WIN.top - 70); c.clip();
  for (let k = 0; k < 2; k++) { const bx = R(WIN.l) + 20 + ((f * 0.15 + k * 70) % (WIN.r - WIN.l)), by = WIN.top + 150 - k * 40 + Math.sin(f * 0.02 + k) * 5; ballR(c, bx, by, 4, k ? ['#3A0A24', '#6A1440', '#A8206A', '#F43F8E', '#FF8AC0', '#FFFFFF'] : ['#3A2A08', '#6A4A10', '#A07A1C', '#F2C84A', '#FFE08A', '#FFFFFF']); B(c, bx, by + 4, 1, 8, '#E4E4E7'); }
  c.restore();
  // (the furniture)
  const [blx, bw, bh] = LEDGES[0];
  stillW(c, `bed-${s >= 3 ? 1 : 0}`, R(blx), GY, -24, -bh - 12, bw + 66, bh + 16, g => { g.translate(R(blx), GY); bedArt(g, bw, bh, s >= 3); });
  stillW(c, 'vanity', VANITY_X, GY, -20, MIR.dy - MIR.ry - 50, 180, -MIR.dy + MIR.ry + 52, g => { g.translate(VANITY_X, GY); vanityArt(g); });
  vanityGlass(c, VANITY_X, f, s, look);
  const w1 = LEDGES[1], w2 = LEDGES[2];
  stillW(c, 'wardrobe1', R(w1[0]), GY, -10, -w1[2] - 4, w1[1] + 30, w1[2] + 6, g => { g.translate(R(w1[0]), GY); wardrobeArt(g, w1[1], w1[2], true); });
  stillW(c, 'chaise', CHAISE_X, GY, -112, -110, 246, 112, g => { g.translate(CHAISE_X, GY); chaiseArt(g); });
  stillW(c, 'wardrobe2', R(w2[0]), GY, -10, -w2[2] - 4, w2[1] + 20, w2[2] + 6, g => { g.translate(R(w2[0]), GY); wardrobeArt(g, w2[1], w2[2], false); });
  // (the chandeliers: up, or the one that's come down; the hole she went out through)
  CHANDELIERS.forEach((cx, i) => drawChandelier(c, R(cx), look.chandelierDown === i ? GY : CHANDELIER_Y, f + i * 17, look.chandelierDown === i));
  if (look.roofHole !== null) { const hx = Math.round(look.roofHole); stillW(c, `roofhole-${hx}`, hx, CEIL_Y, -120, PEAK - CEIL_Y - 60, 240, CEIL_Y - PEAK + 120, g => paintRoofHole(g, hx)); if (f % 6 < 3) B(c, hx - 30 + ((f * 13) % 60), CEIL_Y + 10 + ((f * 7) % 40), 1, 1, '#FDE68A'); }
};

/** Her room's far end wall (no way on: the end of the land): the castle's own pale ashlar past the room's last corner. */
export const drawEndWall = (c: Ctx, state?: GameState) => {
  if (state && state.camera.x + 1800 < ARENA_R) return;
  stillW(c, 'endwall', ARENA_R, CEIL_Y, 0, -160, 420, GY - CEIL_Y + 300, g => {
    B(g, ARENA_R, CEIL_Y - 160, 420, GY - CEIL_Y + 300, PALE[2]);
    for (let y = CEIL_Y - 160, r = 0; y < GY + 140; y += 16, r++) { B(g, ARENA_R, y, 420, 1, PALE[0]); for (let x = ARENA_R + (r % 2) * 18; x < ARENA_R + 420; x += 36) { B(g, x, y, 1, 16, PALE[0]); B(g, x + 1, y + 1, 34, 1, PALE[3]); } }
    B(g, ARENA_R, CEIL_Y - 160, 6, GY - CEIL_Y + 300, INK); B(g, ARENA_R + 6, CEIL_Y - 160, 3, GY - CEIL_Y + 300, PALE[1]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The hall

const HALL_PIL = [150, 330, 510, 690, 870];
const HALL_CORN = GY - 430, LUN_T = GY - 510, VAULT_T = GY - 700;
const WIN_X = HALL_L + 60, WIN_W = 108, WIN_TOP = GY - 386, WIN_BOT = GY - 104;

/** The view out the hall's window, by the hour: the sky, the castle's other spires, the Alps, snow. */
const hallView = (g: Ctx, l: number, r: number, top: number, bot: number) => {
  const tod = timeOfDay();
  // (the whole park laid out below, from up here: view.ts)
  parkView(g, l, r, top, bot, Math.round(top + (bot - top) * 0.5));
  // (two of the castle's spires near: pale drums under blue cones, a lit window)
  for (const [sx, sw, sh] of [[l + 24, 18, 120], [r - 22, 14, 90]] as const) {
    const foot = bot + 10; B(g, sx - sw / 2 - 1, foot - sh, sw + 2, sh, INK); B(g, sx - sw / 2, foot - sh, sw, sh, PALE[3]); B(g, sx - sw / 2, foot - sh, 3, sh, PALE[4]); B(g, sx + sw / 2 - 4, foot - sh, 4, sh, PALE[1]);
    polyF(g, [[sx - sw / 2 - 4, foot - sh], [sx, foot - sh - sw * 2.2], [sx + sw / 2 + 4, foot - sh]], ROOF[3]); polyF(g, [[sx - sw / 2 - 4, foot - sh], [sx, foot - sh - sw * 2.2], [sx - 2, foot - sh]], ROOF[4]);
    B(g, sx - 2, foot - sh + 20, 4, 8, tod.lamps > 0.35 ? '#FFD88A' : '#3A3452'); polyF(g, [[sx, foot - sh - sw * 2.2], [sx + 12, foot - sh - sw * 2.2 + 3], [sx, foot - sh - sw * 2.2 + 6]], PINK[3]);
  }
};

/** The hall's walls over world a..b (it ends at her room's wall): striped satin paper, the wainscot, pilasters, the
 *  cornice, painted lunettes, the coffered vault, the marble floor and its runner, her portraits and tapestry, the
 *  console, the plaque, the window he came in by and the glass all over. */
const paintHall = (g: Ctx, a: number, b: number) => {
  const pil = HALL_PIL.map(p => HALL_L + p);
  // (the vault: a coffered soffit in bands, gilt ribs up from the pilasters, rosettes)
  B(g, a, VAULT_T, b - a, LUN_T - VAULT_T, DAM[1]);
  const vb = [[VAULT_T, VAULT_T + 60, DAM[0]], [VAULT_T + 60, VAULT_T + 110, DAM[1]], [VAULT_T + 110, LUN_T, DAM[2]]] as const;
  for (const [y0, y1, col] of vb) { B(g, a, y0, b - a, y1 - y0, col); checker(g, a, y1 - 1, b - a, 2, col, 0, 1); }
  for (let x = Math.floor(a / 45) * 45; x < b; x += 45) for (const [y, s] of [[VAULT_T + 30, 14], [VAULT_T + 84, 18], [VAULT_T + 150, 22]] as const) {
    B(g, x + 22 - s, y - s * 0.7, s * 2, s * 1.4, DAM[0]); B(g, x + 23 - s, y - s * 0.7 + 1, s * 2 - 2, s * 1.4 - 2, DAM[2]); B(g, x + 23 - s, y - s * 0.7 + 1, s * 2 - 2, 2, DAM[3]);
    disc(g, x + 22, y, s * 0.35, GD[2]); disc(g, x + 21, y - 1, s * 0.22, GD[4]);
  }
  for (const p of pil) if (p > a - 20 && p < b + 20) { B(g, p - 7, VAULT_T, 14, LUN_T - VAULT_T, INK); B(g, p - 6, VAULT_T, 12, LUN_T - VAULT_T, GD[2]); B(g, p - 6, VAULT_T, 3, LUN_T - VAULT_T, GD[4]); B(g, p + 3, VAULT_T, 3, LUN_T - VAULT_T, GD[1]); }
  // (the lunettes between the pilasters: arches framed in gilt, a painted sky in them, clouds, a gilt heart)
  B(g, a, LUN_T, b - a, HALL_CORN - LUN_T, CREAM[3]);
  const edges = [HALL_L - 210, ...pil, ARENA_L];
  for (let i = 0; i < edges.length - 1; i++) {
    const la = edges[i] + 14, lb = edges[i + 1] - 14, cx = (la + lb) / 2, rr = (lb - la) / 2, cy = HALL_CORN;
    if (lb < a - 20 || la > b + 20) continue;
    const ar = (k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx - rr * k, cy); g.ellipse(cx, cy, rr * k, (HALL_CORN - LUN_T) * k, 0, Math.PI, 0); g.closePath(); g.fill(); };
    ar(1.04, INK); ar(1, GD[3]); ar(0.95, GD[1]); ar(0.92, '#8AA0E0');
    g.save(); ar(0.92, '#000'); g.clip();
    const sky = ['#6A7CC8', '#8AA0E0', '#B4C4F0', '#F0C8DC', '#F8D8E4'];
    sky.forEach((col, k) => B(g, cx - rr, LUN_T + (k * (HALL_CORN - LUN_T)) / 5, rr * 2, (HALL_CORN - LUN_T) / 5 + 1, col));
    for (let k = 0; k < 3; k++) { const ex = cx - rr * 0.6 + k * rr * 0.6, ey = HALL_CORN - 18 - (k % 2) * 16; ell(g, ex, ey, 18, 6, '#FFF0F6'); ell(g, ex - 5, ey - 3, 9, 5, '#FFFFFF'); B(g, ex - 16, ey + 4, 32, 2, '#E8C8DC'); }
    pmap(g, HEART, cx - 7, HALL_CORN - 52, INK, 2); pmap(g, HEART, cx - 8, HALL_CORN - 53, GD[3], 2); B(g, cx - 6, HALL_CORN - 51, 2, 2, GD[5]);
    g.restore();
    for (let k = 0; k < 11; k++) { const t = Math.PI + (k / 10) * Math.PI; B(g, cx + Math.cos(t) * rr * 0.98 - 1, cy + Math.sin(t) * (HALL_CORN - LUN_T) * 0.98 - 1, 2, 2, GD[5]); }
  }
  // (the cornice)
  B(g, a, HALL_CORN, b - a, 22, CREAM[3]); giltBand(g, a, HALL_CORN, b - a, 5);
  for (let x = Math.floor(a / 6) * 6; x < b; x += 6) { B(g, x, HALL_CORN + 7, 4, 6, CREAM[4]); B(g, x, HALL_CORN + 7, 1, 6, CREAM[5]); B(g, x + 4, HALL_CORN + 7, 2, 6, CREAM[1]); }
  B(g, a, HALL_CORN + 14, b - a, 5, GD[2]); for (let x = Math.floor(a / 8) * 8; x < b; x += 8) { B(g, x + 1, HALL_CORN + 14, 5, 5, GD[3]); B(g, x + 1, HALL_CORN + 14, 2, 2, GD[5]); }
  giltBand(g, a, HALL_CORN + 19, b - a, 3, false);
  // (the striped satin paper)
  const top = HALL_CORN + 22;
  B(g, a, top, b - a, RAIL - top, STRIPE[3]);
  for (let x = Math.floor(a / 26) * 26; x < b; x += 26) {
    B(g, x, top, 9, RAIL - top, STRIPE[4]); B(g, x, top, 1, RAIL - top, STRIPE[5]); B(g, x + 9, top, 1, RAIL - top, STRIPE[2]); B(g, x + 17, top, 1, RAIL - top, STRIPE[2]); checker(g, x + 10, top, 2, RAIL - top, STRIPE[4], 0, 1);
    for (let y = top + 14 + (x / 26 % 2) * 22; y < RAIL - 8; y += 44) { pmap(g, ['.#.', '###', '.#.'], x + 3, y, GD[3]); B(g, x + 4, y, 1, 1, GD[5]); }
  }
  B(g, a, top, b - a, 3, STRIPE[1]); checker(g, a, top + 3, b - a, 2, STRIPE[1], 0, 1);
  wainscot(g, a, b, pil, CREAM, STRIPE);
  for (const p of pil) if (p > a - 30 && p < b + 30) { pilaster(g, p, top, RAIL); sconce(g, p, GY - 262, GD); }
  // (the floor: pink and cream marble, the runner down it (a gilt border, hearts), glass on it near the window)
  B(g, a, GY, b - a, 140, MARB[3]);
  for (let y = GY + 4, r = 0; y < GY + 140; y += r < 2 ? 10 : 16, r++) for (let x = Math.floor(a / 40) * 40 + (r % 2) * 20; x < b; x += 40) { B(g, x, y, 20, r < 2 ? 10 : 16, r % 2 ? CREAM[4] : MARB[2]); B(g, x, y, 20, 1, r % 2 ? CREAM[5] : MARB[4]); }
  lip(g, a, GY, b - a);
  B(g, a, GY + 14, b - a, 34, CARP[3]); B(g, a, GY + 14, b - a, 4, GD[3]); B(g, a, GY + 14, b - a, 1, GD[5]); B(g, a, GY + 44, b - a, 4, GD[2]); B(g, a, GY + 47, b - a, 1, GD[0]);
  for (let x = Math.floor(a / 24) * 24; x < b; x += 24) { pmap(g, HEART5, x + 9, GY + 26, CARP[1]); pmap(g, HEART5, x + 9, GY + 25, CARP[5]); B(g, x, GY + 20, 24, 1, CARP[4]); }
  for (let k = 0; k < 60; k++) { const sx = WIN_X - 60 + hash(k * 1.3) * 360, sy = GY + 3 + hash(k * 2.7) * 44; if (sx < a - 6 || sx > b + 6) continue; polyF(g, [[sx, sy], [sx + 3, sy - 2], [sx + 5, sy + 1], [sx + 1, sy + 2]], k % 3 ? '#D8EEFF' : '#F9A8D4'); B(g, sx + 1, sy - 1, 1, 1, '#FFFFFF'); }
  // (the window he came in by: a tall lancet, leaded panes in pink and lilac, the rose in its head; smashed through)
  if (WIN_X + WIN_W > a - 40 && WIN_X - WIN_W < b + 40) {
    const l = WIN_X - WIN_W / 2, r = WIN_X + WIN_W / 2;
    const lan = (ins: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(l + ins, WIN_BOT); g.lineTo(l + ins, WIN_TOP + WIN_W * 0.6); g.quadraticCurveTo(l + ins, WIN_TOP + ins, WIN_X, WIN_TOP - WIN_W * 0.2 + ins * 1.3); g.quadraticCurveTo(r - ins, WIN_TOP + ins, r - ins, WIN_TOP + WIN_W * 0.6); g.lineTo(r - ins, WIN_BOT); g.closePath(); g.fill(); };
    lan(-8, INK); lan(-7, PALE[3]); lan(-3, PALE[4]); lan(0, PALE[2]); lan(5, INK);
    g.save(); lan(6, '#000'); g.clip();
    hallView(g, l, r, WIN_TOP - 40, WIN_BOT);
    const hole = ragged(WIN_X, WIN_TOP + 130, 84, 170, 13, 22);
    g.save(); g.beginPath(); g.rect(l - 10, WIN_TOP - 60, WIN_W + 20, WIN_BOT - WIN_TOP + 60); hole.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.clip('evenodd');
    for (let py = WIN_TOP - 40; py < WIN_BOT; py += 9) for (let pxx = l; pxx < r; pxx += 8) { const t = hash(py * 0.37 + pxx * 1.13); const col = t > 0.75 ? '#F45AAE' : t > 0.5 ? '#C8A8F0' : t > 0.25 ? '#F8B4D8' : '#9AB8E8'; B(g, pxx, py, 8, 9, col); B(g, pxx, py, 8, 2, mix(col, '#FFFFFF', 0.35)); B(g, pxx + 6, py + 2, 2, 7, mix(col, '#000000', 0.25)); }
    for (let py = WIN_TOP - 40; py < WIN_BOT; py += 9) B(g, l, py, WIN_W, 1, '#2A2238');
    for (let pxx = l; pxx < r; pxx += 8) B(g, pxx, WIN_TOP - 40, 1, WIN_BOT - WIN_TOP + 40, '#2A2238');
    disc(g, WIN_X, WIN_TOP + 34, 24, '#2A2238'); for (let k = 0; k < 8; k++) { const a2 = (k / 8) * Math.PI * 2; disc(g, WIN_X + Math.cos(a2) * 14, WIN_TOP + 34 + Math.sin(a2) * 14, 7, k % 2 ? '#F45AAE' : '#FFB0DC'); } disc(g, WIN_X, WIN_TOP + 34, 7, GD[3]);
    g.restore();
    pathOf(g, hole); g.strokeStyle = '#2A2238'; g.lineWidth = 2; g.stroke();
    for (let k = 0; k < hole.length; k += 2) { const [px, py] = hole[k]; const dx = (WIN_X - px) * 0.25, dy = (WIN_TOP + 130 - py) * 0.2; polyF(g, [[px, py], [px + dx + 3, py + dy], [px + dx * 0.4, py + dy + 6]], k % 4 ? '#E0F2FE' : '#F9A8D4'); }
    g.restore();
    B(g, l - 12, WIN_BOT, WIN_W + 24, 8, INK); B(g, l - 11, WIN_BOT + 1, WIN_W + 22, 6, PALE[2]); B(g, l - 11, WIN_BOT + 1, WIN_W + 22, 1, PALE[3]); B(g, l - 11, WIN_BOT + 5, WIN_W + 22, 2, PALE[1]);
    // (the drape, the right one torn half down by the broom)
    polyF(g, [[l - 28, WIN_TOP - 30], [l - 6, WIN_TOP - 30], [l - 2, GY - 60], [l - 30, GY]], VELV[3]); for (let k = 0; k < 3; k++) B(g, l - 24 + k * 7, WIN_TOP - 28, 2, WIN_BOT - WIN_TOP + 60, k % 2 ? VELV[4] : VELV[1]);
    polyF(g, [[r + 6, WIN_TOP - 30], [r + 26, WIN_TOP - 30], [r + 30, WIN_TOP + 40], [r + 40, GY - 8], [r + 10, GY], [r + 4, WIN_TOP + 60]], VELV[2]); polyF(g, [[r + 30, WIN_TOP + 40], [r + 24, WIN_TOP + 54], [r + 36, WIN_TOP + 50]], VELV[0]);
    B(g, l - 34, WIN_TOP - 36, WIN_W + 70, 8, INK); B(g, l - 33, WIN_TOP - 35, WIN_W + 68, 6, GD[3]); B(g, l - 33, WIN_TOP - 35, WIN_W + 68, 1, GD[5]); ballR(g, l - 36, WIN_TOP - 32, 5, GD); ballR(g, r + 36, WIN_TOP - 32, 5, GD);
  }
  // (her portraits, the tapestry, the console with roses, the plaque and a little oval of her over it)
  const bay = (k: number) => HALL_L + (HALL_PIL[k] + HALL_PIL[k + 1]) / 2;
  if (bay(0) > a - 120 && bay(0) < b + 120) portraitArt(g, bay(0), GY - 384, 92, 124, 0.56, 'talk', 'throne', 0);
  if (bay(1) > a - 120 && bay(1) < b + 120) portraitArt(g, bay(1), GY - 372, 80, 104, 0.48, 'gloat', 'garden', 0);
  if (bay(2) > a - 120 && bay(2) < b + 120) {
    const x = bay(2);
    banner(g, x, GY - 404, 62, 210, PINK, GD, 'crown');
    // (the console: gilt legs, a marble top (not lit), a vase of roses)
    B(g, x - 44, GY - 84, 88, 7, INK); B(g, x - 43, GY - 83, 86, 5, CREAM[3]); B(g, x - 43, GY - 83, 86, 1, CREAM[4]);
    for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x + s * 38, GY - 77); g.quadraticCurveTo(x + s * 30, GY - 40, x + s * 40, GY); g.stroke(); g.strokeStyle = GD[3]; g.lineWidth = 3; g.stroke(); }
    B(g, x - 30, GY - 77, 60, 10, GD[2]); pmap(g, HEART5, x - 2, GY - 75, GD[4]);
    polyF(g, [[x - 10, GY - 84], [x - 13, GY - 104], [x - 6, GY - 114], [x + 6, GY - 114], [x + 13, GY - 104], [x + 10, GY - 84]], INK);
    polyF(g, [[x - 9, GY - 85], [x - 12, GY - 104], [x - 5, GY - 113], [x + 5, GY - 113], [x + 12, GY - 104], [x + 9, GY - 85]], '#E0ECFF'); B(g, x - 8, GY - 108, 3, 18, '#FFFFFF');
    for (let k = 0; k < 9; k++) { const rx = x - 16 + hash(k * 3.1) * 32, ry = GY - 118 - hash(k * 1.9) * 26; B(g, rx, ry + 4, 1, GY - 112 - ry, LEAF[2]); rose(g, rx, ry, 1.4); }
  }
  if (bay(3) > a - 120 && bay(3) < b + 120) {
    const x = bay(3);
    portraitArt(g, x, GY - 360, 56, 70, 0.32, 'stand', 'sky', 0);
    B(g, x - 64, GY - 216, 128, 50, INK); B(g, x - 63, GY - 215, 126, 48, GD[2]); B(g, x - 60, GY - 212, 120, 42, '#6E1E4E'); B(g, x - 60, GY - 212, 120, 2, GD[4]); B(g, x - 60, GY - 172, 120, 2, GD[0]);
    for (const [px, py] of [[x - 58, GY - 210], [x + 56, GY - 210], [x - 58, GY - 175], [x + 56, GY - 175]]) { B(g, px, py, 2, 2, GD[5]); }
    signText(g, 'DO NOT DISTURB', x, GY - 196, gilt(1));
    signText(g, 'UNLESS YOU WON', x, GY - 180, gilt(1));
  }
};

/** A leaf of her door (local: its top-left at 0, 0, w across, 212 tall): pink lacquer, gilt mouldings, an arched top
 *  panel, a heart panel, a lower panel, the hinges (`hingeLeft`). */
const LEAF_H = 212;
const leafArt = (g: Ctx, w: number, hingeLeft: boolean) => {
  B(g, -1, -1, w + 2, LEAF_H + 2, INK);
  B(g, 0, 0, w, LEAF_H, VELV[3]); B(g, 0, 0, 3, LEAF_H, VELV[4]); B(g, 0, 0, 1, LEAF_H, VELV[5]); B(g, w - 4, 0, 4, LEAF_H, VELV[1]); checker(g, w - 6, 0, 2, LEAF_H, VELV[2], 0, 1);
  const panel = (py: number, ph: number, arch: boolean) => {
    const ix = 7, iw = w - 14;
    g.fillStyle = GD[1]; g.beginPath(); g.moveTo(ix - 1, py + ph + 1); g.lineTo(ix - 1, py + (arch ? 12 : -1)); if (arch) g.quadraticCurveTo(ix + iw / 2, py - 10, ix + iw + 1, py + 12); else g.lineTo(ix + iw + 1, py - 1); g.lineTo(ix + iw + 1, py + ph + 1); g.closePath(); g.fill();
    g.fillStyle = GD[4]; g.beginPath(); g.moveTo(ix, py + ph); g.lineTo(ix, py + (arch ? 12 : 0)); if (arch) g.quadraticCurveTo(ix + iw / 2, py - 8, ix + iw, py + 12); else g.lineTo(ix + iw, py); g.lineTo(ix + iw, py + ph); g.closePath(); g.fill();
    B(g, ix + 2, py + (arch ? 12 : 2), iw - 4, ph - (arch ? 14 : 4), VELV[2]); B(g, ix + 2, py + (arch ? 12 : 2), iw - 4, 2, VELV[1]); B(g, ix + 2, py + ph - 3, iw - 4, 1, VELV[4]);
  };
  panel(14, 66, true); panel(92, 46, false); panel(150, 50, false);
  pmap(g, HEART, w / 2 - 7, 108, INK, 2); pmap(g, HEART, w / 2 - 8, 107, GD[3], 2); B(g, w / 2 - 6, 109, 2, 2, GD[5]);
  pmap(g, FLEUR, w / 2 - 3, 40, GD[3]); pmap(g, FLEUR, w / 2 - 3, 168, GD[3]);
  for (const hy of [24, 184]) { const hx = hingeLeft ? 0 : w - 18; B(g, hx - 1, hy - 1, 20, 9, INK); B(g, hx, hy, 18, 7, GD[3]); B(g, hx, hy, 18, 2, GD[5]); disc(g, hingeLeft ? hx + 2 : hx + 16, hy + 3, 3, GD[2]); }
};
/** The door's frame (pink marble jambs with gilt capitals, a lintel, a pediment with a crowned P) and, shut, its two
 *  leaves with the heart knockers. */
const doorFrameArt = (g: Ctx, shut: boolean) => {
  const l = DOOR_X - 60, r = DOOR_X + 60;
  B(g, DOOR_X - 48, GY - 214, 96, 214, '#2A0E20');
  for (const jx of [l + 6, r - 6]) pilaster(g, jx, GY - 252, GY);
  B(g, l - 6, GY - 254, r - l + 12, 24, INK); B(g, l - 5, GY - 253, r - l + 10, 22, CREAM[3]); B(g, l - 5, GY - 253, r - l + 10, 3, CREAM[5]); giltBand(g, l - 5, GY - 238, r - l + 10, 6);
  // (the pediment: a broken arch in gilt scrolls, a cartouche with a crowned P)
  for (const s of [-1, 1]) { g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.arc(DOOR_X + s * 34, GY - 256, 24, s < 0 ? Math.PI * 1.05 : Math.PI * 1.55, s < 0 ? Math.PI * 1.45 : Math.PI * 1.95); g.stroke(); g.strokeStyle = GD[3]; g.lineWidth = 5; g.stroke(); g.strokeStyle = GD[5]; g.lineWidth = 1; g.stroke(); }
  ell(g, DOOR_X, GY - 286, 22, 26, INK); ell(g, DOOR_X, GY - 286, 20, 24, GD[3]); ell(g, DOOR_X, GY - 286, 15, 19, '#6E1E4E'); ell(g, DOOR_X - 3, GY - 290, 6, 8, '#8E2E66');
  signText(g, 'P', DOOR_X, GY - 278, gilt(2));
  pmap(g, CROWN, DOOR_X - 11, GY - 324, INK, 2); pmap(g, CROWN, DOOR_X - 12, GY - 325, GD[4], 2); disc(g, DOOR_X, GY - 319, 2, '#E8205A');
  if (shut) {
    g.save(); g.translate(DOOR_X - 47, GY - LEAF_H); leafArt(g, 46, true); g.restore();
    g.save(); g.translate(DOOR_X + 1, GY - LEAF_H); leafArt(g, 46, false); g.restore();
    for (const kx of [DOOR_X - 10, DOOR_X + 10]) { disc(g, kx, GY - 112, 4, INK); disc(g, kx, GY - 112, 3, GD[3]); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(kx, GY - 104); g.arc(kx - 3, GY - 100, 4, 0, Math.PI, true); g.arc(kx + 3, GY - 100, 4, 0, Math.PI, true); g.lineTo(kx, GY - 88); g.closePath(); g.stroke(); g.strokeStyle = GD[4]; g.lineWidth = 1.5; g.stroke(); }
  }
};

/** Her door: the frame; shut, or both leaves flying in off their hinges and then flat on her carpet (t frames). */
const door = (c: Ctx, t: number | null) => {
  stillW(c, `door-${t === null ? 1 : 0}`, DOOR_X, GY, -80, -340, 160, 344, g => doorFrameArt(g, t === null));
  if (t === null) return;
  const k = Math.min(1, t / 16);
  for (const i of [0, 1]) {
    const lx = DOOR_X + 40 + i * 70 + k * (90 + i * 40), rot = k * (Math.PI / 2) * (1 + i * 0.05);
    c.save(); c.translate(lx, GY - (1 - k) * 100 - 4); c.rotate(rot); c.translate(-23, -LEAF_H);
    if (k >= 1) stillW(c, `leaf-flat-${i}`, 0, 0, -4, -4, 54, LEAF_H + 8, g => leafArt(g, 46, i === 0)); else leafArt(c, 46, i === 0);
    c.restore();
  }
};

/** The rose barrier across the doorway (her magic: no way out till one of you's dead): a soft pink shimmer in bands,
 *  thorny stems up the frame in steps, roses on them stepped, sparkles. */
const barrier = (c: Ctx, f: number) => {
  for (let i = 0; i < 4; i++) { c.globalAlpha = (0.12 + 0.06 * Math.sin(f * 0.1 + i)) * (1 - i * 0.18); B(c, DOOR_X - 48, GY - 214 + i * 54, 96, 54, ['#FF8AC8', '#FFA0D4', '#FFB8E0', '#FFD0EA'][i]); }
  c.globalAlpha = 1;
  for (let k = 0; k < 5; k++) {
    const x = DOOR_X - 40 + k * 20, at = (y: number) => x + Math.sin(y * 0.08 + k) * 8;
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, GY); for (let y = GY; y > GY - 214; y -= 9) c.lineTo(at(y), y); c.stroke();
    c.strokeStyle = LEAF[2]; c.lineWidth = 2; c.stroke();
    for (let y = GY - 10; y > GY - 214; y -= 18) {
      B(c, at(y) + 3, y - 2, 3, 2, LEAF[0]); B(c, at(y) - 5, y + 6, 3, 2, LEAF[0]);
      if ((y + k * 7) % 54 < 18) { const rx = at(y); disc(c, rx, y, 6, INK); disc(c, rx, y, 5, '#A8102E'); disc(c, rx - 1, y - 1, 3.5, '#E8205A'); B(c, rx - 2, y - 2, 2, 1, '#FF8AA4'); B(c, rx - 6, y + 3, 4, 2, LEAF[3]); }
    }
  }
  if (f % 8 < 4) B(c, DOOR_X - 40 + ((f * 13) % 80), GY - 20 - ((f * 7) % 190), 1, 1, '#FFFFFF');
};

export const drawHall = (c: Ctx, state: GameState, look: RoomLook) => {
  const f = state.frame, x0 = HALL_L - 210;
  if (state.camera.x > DOOR_X + 200 || state.camera.x + 1580 < x0) return;
  runW(c, state, 'hall', x0, ARENA_L, VAULT_T, GY + 140, (g, a, b) => paintHall(g, a, b));
  // (the sconces' flames; glints in the glass on the runner)
  for (const p of HALL_PIL) flame(c, HALL_L + p, GY - 262, f, 0.18);
  for (let k = 0; k < 4; k++) { const ph = (f + k * 41) % 80; if (ph < 5) { const sx = WIN_X - 60 + hash(k * 9.1 + Math.floor((f + k * 41) / 80)) * 360, sy = GY + 4 + hash(k * 2.3 + Math.floor(f / 80)) * 40; B(c, sx - 2, sy, 5, 1, '#FFFFFF'); B(c, sx, sy - 2, 1, 5, '#FFFFFF'); } }
  door(c, look.doorT);
  if (look.barrier) barrier(c, f);
};
