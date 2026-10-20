// THE GROUND: the mode 7 floor's one texture (2048 px, 6 units a texel: 12288 units across), the castle grounds seen
// from above at peak SNES (the A Link to the Past way: lit from the upper left (north-west), everything casting its
// shadow down and right, materials in stepped ramps, hard-edged rings, dithered seams). Painted once for the hour.
//
// Inside the MAGIC WALL it's both (the user's: "snowy and green. combination of both"): the Great Pixie's magic keeps
// the lawns green and the beds in bloom, but the land's winter gets in: patchy snow over the lawns (thawed green showing
// through, dithered edges, the mowing stripes still reading in the snow), drifts along the wall and the moat's rim,
// snow caps on the hedges, the topiary and every roof, the paths frosted, the moat's mud partly frozen, the blooms
// poking up through the snow. (The glen stays the summer gag it is.) Lawns mown in rings round the castle, the ring
// paths and avenues in gravel with kerbs, tree rows and lamp posts down them, crowds along them; the castle from above
// on its crag (the curtain wall's walk and merlons, round towers' cones, the courtyard's flags, the great hall's and the
// chapel's slates, the keep and the spire); the drained moat (mud in bands, puddles with the sky in them, the cleaning
// cart, footprints, a stranded rowboat, a WET FLOOR cone); eight gardens between the first two rings (THE HEDGE MAZE, a
// parterre, the rose garden, two spectator lawns by the broom port, the topiary garden and its swan pond, THE FLOWER
// CLOCK, Piper's heart garden); the broom port (the deck and its runway, the stands packed, the scoreboard, the hoops);
// the watchtowers' plazas; out to the wall the park's lands in plots (gift shops, teacups, carousels, food courts,
// queue mazes, cottages, ponds, spinning rides, show buildings with their backstage roofs) and the glen's forest
// (canopy on canopy, blossom, frosted pines, the brook, the gingerbread cottage, the meadow's rainbow, the mine's hill,
// the dragon lair); the park railway inside the wall with its train and station; the wall itself, its walk and merlons,
// the pink shimmer. Outside it's winter: THE PARK BEYOND (a tile: snowy pine woods, paths, cottages, a frozen pond),
// and on it Hogsmeat's snowy roofs and steeple, the frozen lake and its skaters, Truelling Tragons' three tracks and
// fake mountain, the fairy wheel, Rapunzel's tower, the beanstalk, a windmill. No volcanoes.
//
// After dark the lamps along the paths and the lit windows are painted on after the hour's light (they glow).
//
// It's painted in steps (paintGroundSteps, a generator) so the runway can paint it a few milliseconds a frame before
// he takes off (arena.ts primeGround); paintGround runs the steps straight through.

import { type TimeOfDay } from '../../timeOfDay';
import { hash, mix, SNOW, SLATE, BRICK, GOLD, STONE, FLAG } from '../kit';
import { PALE, ROOF, PINK, DECK, PLUM } from '../keep/paint';
import { WALL_R, RINGS, RAIL_R, TOWERS, GLEN, at } from './world';

type Ctx = CanvasRenderingContext2D;

export const TS = 2048, TEXEL = 6, HALF = (TS * TEXEL) / 2;
/** The park beyond's tile (repeats past the texture's edge, and under everything outside the wall). */
export const OS = 512;

const LAWN = ['#1A3616', '#24481E', '#305C26', '#3C702E', '#4A843A', '#62A04C'];
const GRAVEL = ['#5E4C30', '#7E6A46', '#9E8658', '#BCA270', '#D4BC88', '#EAD6A6'];
const HEDGE = ['#0A1E0E', '#123016', '#1C441E', '#285A28', '#387234', '#56904A'];
const MUD = ['#24180A', '#362412', '#4A321A', '#5E4224', '#74542E', '#906C40'];
const WATER = ['#16325E', '#20487E', '#2C609E', '#407ABA', '#62A0D8', '#A4CCEE'];
const ICE = ['#5C78A4', '#7C98C2', '#9CB8DC', '#BED4EE', '#DCEAF8', '#FFFFFF'];
const THATCH = ['#3E2A0C', '#5A4016', '#7A5A24', '#9A7834', '#BA9A4C', '#DABC70'];
const MOSS = ['#0C1C10', '#122816', '#1A361C', '#224424', '#2C542C', '#3C6838'];
const OAK = ['#0E2410', '#163618', '#204A20', '#2E6228', '#407C34', '#62A04C'];
const BLOSSOM = ['#5A1E3A', '#8A3060', '#B84A86', '#DA72AA', '#F2A2CA', '#FFD6EA'];
const LILAC = ['#2E1E4A', '#463270', '#604A96', '#7E68B8', '#A08ED4', '#C8BCEC'];
const FIR = ['#061410', '#0C221C', '#143228', '#1E4436', '#2C5A48', '#447A62'];
const FLOWERS = ['#F472B6', '#DC2626', '#FDE047', '#F4F4F5', '#A78BFA', '#FB923C', '#60A5FA', '#E11D48'];
const COATS = ['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A', '#7A3AAA', '#E86AA8', '#F4F0FA', '#3A3448', '#E07A1E', '#1E8A8A', '#F472B6', '#FDE047'];
const SHADOW = 'rgba(10,6,24,0.34)';
const D2R = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Painting in world units onto the texture (the context being painted, module-wide while it's painted)

let g: Ctx;
let lights: [number, number, number, string][] = [];
const U = (x: number) => (x + HALF) / TEXEL, V = (z: number) => (HALF - z) / TEXEL, L = (r: number) => r / TEXEL;
let seed = 1;
const rnd = () => { seed = (seed * 16807 + 11) % 2147483647; return seed / 2147483647; };

const fill = (col: string) => { g.fillStyle = col; };
const bx = (u: number, v: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(u), Math.round(v), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const dsc = (u: number, v: number, r: number, col: string) => { if (r <= 0.6) { bx(u - 0.5, v - 0.5, 1, 1, col); return; } g.fillStyle = col; g.beginPath(); g.arc(u, v, r, 0, Math.PI * 2); g.fill(); };
const el = (u: number, v: number, rx: number, ry: number, rot: number, col: string) => { g.fillStyle = col; g.beginPath(); g.ellipse(u, v, Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); g.fill(); };
const pl = (pts: number[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
const ln = (pts: number[], w: number, col: string) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.stroke(); };
/** Paint in a local frame at world (x, z) turned to bearing `deg` (local -y outward, texel units). */
let baseRot = 0;
const local = (x: number, z: number, deg: number, fn: (th: number) => void) => { const prev = baseRot; baseRot = deg * D2R; g.save(); g.translate(U(x), V(z)); g.rotate(baseRot); fn(baseRot); g.restore(); baseRot = prev; };
/** World south-east (the shadow's way) in a local frame turned th, `s` texels. */
const shOf = (th: number, s: number): [number, number] => [s * (Math.cos(th) + Math.sin(th)), s * (Math.cos(th) - Math.sin(th))];
/** Is a local direction (ax, ay) in a frame turned th facing the light (north-west)? */
const litDir = (th: number, ax: number, ay: number) => { const tx = ax * Math.cos(th) - ay * Math.sin(th), ty = ax * Math.sin(th) + ay * Math.cos(th); return -tx - ty > 0; };
const lamp = (u: number, v: number, warm = true) => { bx(u + 1, v + 1, 1, 1, SHADOW); bx(u, v, 1, 1, '#2A2638'); lights.push([u, v, 2.2, warm ? '#FFD88A' : '#FFB0D8']); };
/** Inside the wall (not the glen): the winter gets in (snow caps on trees, hedges, roofs, cones; beds in snow). */
let frost = false;
/** A patch of snow (a drift): a core in steps, lit up-left, its rim dithered out into what's under it. */
const snowPatch = (u: number, v: number, rx: number, ry: number, s: number) => {
  const n = Math.ceil((rx + ry) * 3);
  for (let k = 0; k < n; k++) { const a = (k / n) * 6.283, w = 1 + (hash(s + k * 0.7) - 0.5) * 0.3, x = Math.round(u + Math.cos(a) * (rx * w + 1)), y = Math.round(v + Math.sin(a) * (ry * w + 1)); if (((x + y) & 1) === 0) bx(x, y, 1, 1, SNOW[3]); }
  el(u, v, rx, ry, 0, SNOW[3]); el(u - rx * 0.12, v - ry * 0.12, rx * 0.82, ry * 0.8, 0, SNOW[4]); el(u - rx * 0.3, v - ry * 0.3, rx * 0.4, ry * 0.35, 0, SNOW[5]);
};

/** A guest from above (a dot of coat, a head, a shadow), seeded. */
const person = (u: number, v: number, s: number) => {
  bx(u + 1, v + 1, 1, 1, SHADOW);
  bx(u, v, 1, 1, COATS[Math.floor(hash(s) * COATS.length)]);
  if (hash(s * 1.9) > 0.55) bx(u, v - 1, 1, 1, ['#F2C8A0', '#D8A078', '#A8704A', '#7A4A2A', '#1A1010', '#E8C870'][Math.floor(hash(s * 2.7) * 6)]);
};
/** A crowd: n guests scattered in an ellipse (texel radii) round (u, v). */
const crowd = (u: number, v: number, rx: number, ry: number, n: number, s: number) => {
  for (let i = 0; i < n; i++) { const a = hash(s + i * 1.37) * Math.PI * 2, d = Math.sqrt(hash(s * 1.3 + i * 2.11)); person(u + Math.cos(a) * rx * d, v + Math.sin(a) * ry * d, s + i * 7.3); }
};
/** A broadleaf from above: its shadow down-right, the canopy in steps lit up-left, leaf speckle. `R` a ramp6. */
const treeTop = (u: number, v: number, r: number, R: string[], blossom = false) => {
  const [sx, sy] = shOf(baseRot, 1);
  dsc(u + r * 0.55 * sx, v + r * 0.55 * sy, r, SHADOW);
  dsc(u, v, r + 0.6, R[0]); dsc(u, v, r, R[1]); dsc(u - r * 0.14 * sx, v - r * 0.14 * sy, r * 0.82, R[2]); dsc(u - r * 0.3 * sx, v - r * 0.3 * sy, r * 0.56, R[3]); dsc(u - r * 0.44 * sx, v - r * 0.44 * sy, r * 0.26, R[4]);
  if (r > 3) for (let k = 0; k < r * 1.4; k++) { const a = hash(u * 3.1 + v + k) * Math.PI * 2, d = hash(u + v * 1.7 + k * 3.3) * r * 0.8; bx(u + Math.cos(a) * d, v + Math.sin(a) * d, 1, 1, k % 3 ? R[1] : R[4]); }
  if (blossom) for (let k = 0; k < r * 1.6; k++) { const a = hash(u * 1.3 + v * 2.1 + k) * Math.PI * 2, d = hash(u * 2.2 + v + k * 1.7) * r * 0.85; bx(u + Math.cos(a) * d, v + Math.sin(a) * d, 1, 1, k % 2 ? '#FFD6EA' : '#F49AC8'); }
  // (snow lying on the canopy's lit top, in clumps)
  if (frost) for (let k = 0; k < r * 1.3 + 1; k++) { const a = hash(u * 2.9 + v * 0.7 + k) * Math.PI * 2, d = hash(u * 0.9 + v * 3.1 + k * 2.3) * r * 0.5, x = u - r * 0.3 * sx + Math.cos(a) * d, y = v - r * 0.3 * sy + Math.sin(a) * d; bx(x, y, 1, 1, k % 3 ? SNOW[4] : SNOW[5]); if (r > 3 && k % 2 === 0) bx(x + 1, y, 1, 1, SNOW[3]); }
};
/** A conifer from above: a star of boughs, stepped, frosted with snow on its lit side if `snow`. */
const pineTop = (u: number, v: number, r: number, R: string[], snow: boolean) => {
  const [sx, sy] = shOf(baseRot, r * 0.7);
  dsc(u + sx, v + sy, r * 0.9, SHADOW);
  const star = (rr: number, col: string, ox = 0) => { const pts: number[] = []; for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, d = k % 2 ? rr * 0.55 : rr; pts.push(u + ox + Math.cos(a) * d, v + ox + Math.sin(a) * d); } pl(pts, col); };
  star(r + 0.7, R[0]); star(r, R[2]); star(r * 0.66, R[3], -r * 0.14); dsc(u - r * 0.2, v - r * 0.2, r * 0.25, R[4]);
  if (snow) { star(r * 0.5, SNOW[4], -r * 0.28); bx(u - r * 0.4, v - r * 0.4, 1, 1, SNOW[5]); }
};
/** A roof from above (w along its ridge, h across), turned th: ink, the two slopes (the one facing the light lit),
 *  courses across them, the ridge capped, its shadow; snow on it (outside the wall) if `snow`. */
const roof = (u: number, v: number, w: number, h: number, th: number, R: string[], opts: { snow?: boolean; ridge?: string; hip?: boolean; chimney?: boolean; dormers?: number } = {}) => {
  g.save(); g.translate(u, v); g.rotate(th);
  const tw = th + baseRot, litDir2 = (ax: number, ay: number) => litDir(tw, ax, ay);
  const [sx, sy] = shOf(tw, Math.max(1.5, h * 0.35));
  bx(-w / 2 + sx, -h / 2 + sy, w, h, SHADOW);
  bx(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, '#1A1028');
  const topLit = litDir2(0, -1);
  const A = opts.snow ? [SNOW[topLit ? 4 : 2], SNOW[topLit ? 2 : 4]] : [R[topLit ? 4 : 2], R[topLit ? 2 : 4]];
  if (opts.hip) {
    pl([-w / 2, -h / 2, w / 2, -h / 2, w / 2 - h / 2, 0, -w / 2 + h / 2, 0], A[0]); pl([-w / 2, h / 2, w / 2, h / 2, w / 2 - h / 2, 0, -w / 2 + h / 2, 0], A[1]);
    pl([-w / 2, -h / 2, -w / 2 + h / 2, 0, -w / 2, h / 2], litDir2(-1, 0) ? (opts.snow ? SNOW[5] : R[5]) : (opts.snow ? SNOW[1] : R[1]));
    pl([w / 2, -h / 2, w / 2 - h / 2, 0, w / 2, h / 2], litDir2(1, 0) ? (opts.snow ? SNOW[5] : R[5]) : (opts.snow ? SNOW[1] : R[1]));
  } else { bx(-w / 2, -h / 2, w, h / 2, A[0]); bx(-w / 2, 0, w, h / 2, A[1]); }
  if (!opts.snow) for (let y = -h / 2 + 2; y < h / 2 - 1; y += 2) if (Math.abs(y) > 1) bx(-w / 2 + (opts.hip ? Math.abs(Math.abs(y) - h / 2) : 0), y, w - (opts.hip ? 2 * Math.abs(Math.abs(y) - h / 2) : 0), 1, y < 0 ? (topLit ? R[3] : R[1]) : (topLit ? R[1] : R[3]));
  else { for (let x = -w / 2; x < w / 2; x += 2) if (hash(x + u) > 0.7) bx(x, -h / 2 + hash(x * 1.7 + v) * h, 1, 1, SNOW[3]); }
  // (inside the wall: the roof's own color at the eaves, snow lying over the rest, its lower edge dithered)
  if (frost && !opts.snow && w > 5 && h > 4) {
    const e = h > 9 ? 2 : 1, S0 = SNOW[topLit ? 4 : 2], S1 = SNOW[topLit ? 2 : 4];
    if (opts.hip) {
      pl([-w / 2 + e + 1, -h / 2 + e, w / 2 - e - 1, -h / 2 + e, w / 2 - h / 2, 0, -w / 2 + h / 2, 0], S0); pl([-w / 2 + e + 1, h / 2 - e, w / 2 - e - 1, h / 2 - e, w / 2 - h / 2, 0, -w / 2 + h / 2, 0], S1);
      pl([-w / 2 + e, -h / 2 + e + 1, -w / 2 + h / 2, 0, -w / 2 + e, h / 2 - e - 1], litDir2(-1, 0) ? SNOW[5] : SNOW[2]);
      pl([w / 2 - e, -h / 2 + e + 1, w / 2 - h / 2, 0, w / 2 - e, h / 2 - e - 1], litDir2(1, 0) ? SNOW[5] : SNOW[2]);
    } else { bx(-w / 2 + 1, -h / 2 + e, w - 2, h / 2 - e, S0); bx(-w / 2 + 1, 0, w - 2, h / 2 - e, S1); }
    for (let x = -w / 2 + 1; x < w / 2 - 1; x += 2) { bx(x, -h / 2 + e - 1, 1, 1, S0); bx(x + 1, h / 2 - e, 1, 1, S1); }
  }
  bx(-w / 2 + (opts.hip ? h / 2 : 0), -0.5, w - (opts.hip ? h : 0), 1, opts.ridge ?? (opts.snow ? SNOW[5] : R[5]));
  if (opts.dormers) for (let k = 0; k < opts.dormers; k++) { const dx = -w / 2 + ((k + 0.5) * w) / opts.dormers; bx(dx - 1.5, -h / 2 + 0.5, 3, h / 2 - 1.5, '#1A1028'); bx(dx - 1, -h / 2 + 1, 2, h / 2 - 2.5, A[0]); bx(dx - 0.5, -h / 2, 1, 1, '#FFE9A8'); }
  if (opts.chimney) { const cx = w * 0.28, cy = -h * 0.22; bx(cx - 1.5 + sx * 0.4, cy - 1.5 + sy * 0.4, 3, 3, SHADOW); bx(cx - 1.5, cy - 1.5, 3, 3, '#1A1028'); bx(cx - 1, cy - 1, 2, 2, BRICK[3]); bx(cx - 1, cy - 1, 1, 1, BRICK[5]); }
  g.restore();
};
/** A cone roof from above (a round tower's): wedges lit toward the light, a gilt finial, a pennant. */
const coneTop = (u: number, v: number, r: number, R: string[], pennant = '#F472B6') => {
  const [ox, oy] = shOf(baseRot, r * 0.8);
  dsc(u + ox, v + oy, r, SHADOW);
  dsc(u, v, r + 1, '#1A1028');
  const n = 12;
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2, mid = (a0 + a1) / 2 + baseRot, lt = -Math.cos(mid) - Math.sin(mid);
    g.fillStyle = R[lt > 0.9 ? 5 : lt > 0.3 ? 4 : lt > -0.3 ? 3 : lt > -0.9 ? 2 : 1];
    g.beginPath(); g.moveTo(u, v); g.arc(u, v, r, a0, a1); g.closePath(); g.fill();
  }
  // (inside the wall: snow lodged round the cone's skirt on its lit side, dithered toward the tip)
  if (frost && r > 3) for (let k = 0; k < r * 5; k++) {
    const a = (k / (r * 5)) * Math.PI * 2, lt = -Math.cos(a + baseRot) - Math.sin(a + baseRot);
    if (lt < -0.2) continue;
    for (const f of [0.92, 0.8, 0.68]) if (f > 0.75 || (k & 1)) bx(u + Math.cos(a) * r * f, v + Math.sin(a) * r * f, 1, 1, lt > 0.6 ? SNOW[5] : SNOW[3]);
  }
  g.strokeStyle = GOLD[3]; g.lineWidth = 1; g.beginPath(); g.arc(u, v, r * 0.62, 0, Math.PI * 2); g.stroke();
  dsc(u, v, Math.max(1, r * 0.16), GOLD[4]); bx(u, v, 1, 1, GOLD[5]);
  if (r > 4) pl([u, v, u + r * 0.9, v - r * 0.15, u + r * 0.5, v + r * 0.1], pennant);
};
/** A fountain from above: its stone rim, the water in rings, the spray, the jet. */
const fountain = (u: number, v: number, r: number) => {
  dsc(u + 1, v + 1, r + 1, SHADOW); dsc(u, v, r + 1, '#1A1028'); dsc(u, v, r, PALE[4]); dsc(u + 0.5, v + 0.5, r - 1, PALE[2]);
  dsc(u, v, r - 1.5, WATER[2]); dsc(u - r * 0.15, v - r * 0.15, r * 0.6, WATER[3]);
  g.strokeStyle = WATER[4]; g.lineWidth = 1; for (const k of [0.35, 0.6]) { g.beginPath(); g.arc(u, v, r * k, 0, Math.PI * 2); g.stroke(); }
  dsc(u, v, Math.max(1, r * 0.22), PALE[4]); dsc(u - 0.5, v - 0.5, Math.max(0.8, r * 0.12), '#FFFFFF');
  for (let k = 0; k < 8; k++) { const a = k * 0.785 + 0.3; bx(u + Math.cos(a) * r * 0.45, v + Math.sin(a) * r * 0.45, 1, 1, WATER[5]); }
};
/** A pond: banded water (deep middle), a reed edge, lily pads, glints; `swans` boats. */
const pond = (u: number, v: number, rx: number, ry: number, rot: number, swans: number, s: number) => {
  el(u + 1, v + 1, rx + 2, ry + 2, rot, SHADOW); el(u, v, rx + 2, ry + 2, rot, HEDGE[2]); el(u, v, rx + 1, ry + 1, rot, PALE[2]);
  el(u, v, rx, ry, rot, WATER[3]); el(u + 0.5, v + 0.5, rx * 0.75, ry * 0.75, rot, WATER[2]); el(u + 1, v + 1, rx * 0.45, ry * 0.45, rot, WATER[1]);
  for (let k = 0; k < 6; k++) { const a = hash(s + k) * 6.28, d = 0.4 + hash(s * 2 + k) * 0.5; bx(u + Math.cos(a) * rx * d, v + Math.sin(a) * ry * d, 2, 1, WATER[5]); }
  for (let k = 0; k < 8; k++) { const a = hash(s * 3 + k) * 6.28; dsc(u + Math.cos(a) * rx * 0.85, v + Math.sin(a) * ry * 0.85, 1.2, HEDGE[4]); if (k % 3 === 0) bx(u + Math.cos(a) * rx * 0.85, v + Math.sin(a) * ry * 0.85, 1, 1, '#F9A8D4'); }
  // (inside the wall: a skin of ice round its edge, cracked, the middle kept open by the magic)
  if (frost) { g.save(); g.strokeStyle = ICE[3]; g.lineWidth = 2; g.beginPath(); g.ellipse(u, v, Math.max(1, rx - 1), Math.max(1, ry - 1), rot, 0, Math.PI * 2); g.stroke(); g.strokeStyle = ICE[5]; g.lineWidth = 1; g.beginPath(); g.ellipse(u, v, Math.max(1, rx - 1.5), Math.max(1, ry - 1.5), rot, 3.4, 5.6); g.stroke(); g.restore(); for (let k = 0; k < 10; k++) { const a = hash(s * 11 + k) * 6.28; bx(u + Math.cos(a) * (rx - 2.5), v + Math.sin(a) * (ry - 2.5), 1, 1, ICE[1]); } }
  for (let k = 0; k < swans; k++) { const a = hash(s * 5 + k) * 6.28, d = 0.5 * hash(s * 7 + k); const x = u + Math.cos(a) * rx * d, y = v + Math.sin(a) * ry * d; bx(x - 1, y, 3, 2, '#F4F4F5'); bx(x + 1, y - 1, 1, 1, '#F4F4F5'); bx(x + 2, y - 1, 1, 1, '#FB923C'); bx(x - 1, y + 2, 3, 1, WATER[1]); }
};
/** A flower bed (a rounded rect of earth packed with blooms in rows), turned th. */
const bed = (u: number, v: number, w: number, h: number, th: number, cols: string[], s: number) => {
  g.save(); g.translate(u, v); g.rotate(th);
  // (inside the wall the bed's under snow, the blooms poking up through it: the park's magic)
  bx(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2, frost ? SNOW[2] : HEDGE[2]); bx(-w / 2, -h / 2, w, h, frost ? SNOW[4] : MUD[3]);
  if (frost) bx(-w / 2, -h / 2, w, 1, SNOW[5]);
  for (let y = -h / 2 + 0.5; y < h / 2; y += 1.5) for (let x = -w / 2 + 0.5; x < w / 2; x += 1.5) { const c = cols[(Math.floor((y + h) / 3) + (hash(s + x * 0.37 + y) > 0.85 ? 1 : 0)) % cols.length], t = hash(s + x + y * 3.1); if (frost && t < 0.4) continue; bx(x, y, 1, 1, t > 0.25 ? c : HEDGE[3]); if (frost && t > 0.8) bx(x, y + 1, 1, 1, HEDGE[3]); }
  g.restore();
};
/** A bench, a striped umbrella, a picnic blanket, a food cart. */
const umbrella = (u: number, v: number, r: number, a: string, b: string) => {
  dsc(u + 1.2, v + 1.2, r, SHADOW);
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? a : b; g.beginPath(); g.moveTo(u, v); g.arc(u, v, r, (k / 8) * 6.283, ((k + 1) / 8) * 6.283); g.closePath(); g.fill(); }
  bx(u, v, 1, 1, '#FFF6C8');
};
const blanket = (u: number, v: number, s: number) => {
  const c = ['#DC2626', '#2E5AAE', '#F472B6', '#E0AE3A'][Math.floor(hash(s) * 4)];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 5; x++) bx(u + x, v + y, 1, 1, (x + y) % 2 ? c : '#F4F0FA');
  person(u + 1, v - 1, s); person(u + 4, v + 4, s + 3);
};

// ---------------------------------------------------------------------------------------------------------------
// The base, a texel at a time (hard-edged rings, no smoothing): the lawn mown in rings, the gravel, the moat, the walls

const pack = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16); };
const P = (R: string[]) => R.map(pack);
const hh = (i: number, j: number) => { let h = (i * 374761393 + j * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** THE SNOW's lie (where it's lying over the grounds, where it's thawed): smooth noise in three octaves at half the
 *  texture's resolution (0..255), made once (it doesn't change with the hour), a step at a time. */
const SM = TS >> 1;
let snowMask: Uint8Array | null = null;
function* makeSnowMask(): Generator<void> {
  if (snowMask) return;
  const acc = new Float32Array(SM * SM);
  for (const [n, w, s] of [[20, 0.62, 1], [56, 0.28, 2], [150, 0.1, 3]] as const) {
    const step = SM / n, N = n + 2, grid = new Float32Array(N * N), fxs = new Float32Array(SM), x0s = new Int32Array(SM);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) grid[y * N + x] = hh(x + s * 1013, y);
    for (let i = 0; i < SM; i++) { const gx = i / step, x0 = gx | 0, f = gx - x0; x0s[i] = x0; fxs[i] = f * f * (3 - 2 * f); }
    for (let j = 0; j < SM; j++) {
      const gy = j / step, y0 = gy | 0, fy0 = gy - y0, fy = fy0 * fy0 * (3 - 2 * fy0), r0 = y0 * N, r1 = r0 + N, o = j * SM;
      for (let i = 0; i < SM; i++) {
        const x0 = x0s[i], fx = fxs[i], a = grid[r0 + x0], b = grid[r0 + x0 + 1], c = grid[r1 + x0], e = grid[r1 + x0 + 1];
        acc[o + i] += w * ((a + (b - a) * fx) * (1 - fy) + (c + (e - c) * fx) * fy);
      }
      if ((j & 255) === 255) yield;
    }
  }
  // (stretched out so it's lying or thawed in clear patches, not a gray middle everywhere)
  const m = new Uint8Array(SM * SM);
  for (let k = 0; k < SM * SM; k++) m[k] = Math.max(0, Math.min(255, Math.round((0.5 + (acc[k] - 0.5) * 2.4) * 255)));
  snowMask = m;
}

function* paintBase(img: ImageData): Generator<void> {
  yield* makeSnowMask();
  const sm = snowMask!;
  const d = new Uint32Array(img.data.buffer);
  const Lw = P(LAWN), Gr = P(GRAVEL), Md = P(MUD), St = P(STONE), Fl = P(FLAG), Ms = P(MOSS), Bl = P(['#2A2420', '#3E3630', '#544A40', '#6A5E52', '#867868', '#A69886']);
  const Sn = P(SNOW), Ic = P(ICE);
  const steel = pack('#9AA2B8'), steelD = pack('#4A4E62'), tie = pack('#4A3420'), tieL = pack('#6A4C30');
  const lx = -Math.SQRT1_2, lz = Math.SQRT1_2;
  const avA = [0, 1, 2, 3, 4, 5, 6].map(k => [Math.sin((k * Math.PI) / 4), Math.cos((k * Math.PI) / 4)]);
  const R1 = WALL_R + 70, i0 = Math.max(0, Math.floor(U(-R1))), i1 = Math.min(TS, Math.ceil(U(R1))), j0 = Math.max(0, Math.floor(V(R1))), j1 = Math.min(TS, Math.ceil(V(-R1)));
  /** Snow lying at `v` against a threshold `t`: 2 solid, 1 a dithered texel of its thin edge (checker, then sparser), 0 none. */
  const lay = (v: number, t: number, i: number, j: number) => (v > t ? 2 : v > t - 0.05 ? ((i + j) & 1) : v > t - 0.09 ? (i & j & 1) : 0);
  for (let j = j0; j < j1; j++) {
    const z = HALF - (j + 0.5) * TEXEL;
    if (((j - j0) & 63) === 63) yield;
    for (let i = i0; i < i1; i++) {
      const x = (i + 0.5) * TEXEL - HALF, r = Math.sqrt(x * x + z * z);
      if (r > R1) continue;
      const n = hh(i, j), o = j * TS + i, sv = sm[(j >> 1) * SM + (i >> 1)] / 255;
      if (r < 588) { const lo = hh(i >> 2, j >> 2); d[o] = St[(lo > 0.7 ? 2 : 1) + (n > 0.85 ? 1 : n < 0.1 ? -1 : 0)]; continue; }
      const nx = x / r, nz = z / r, face = nx * lx + nz * lz;
      // (the moat: its inner revetment (snow along its top), the mud in bands deeper in the middle, partly frozen over
      // (ice in bands, cracked, its edge dithered into the mud), the outer revetment (snow along its top))
      if (r < 604) { d[o] = r < 596 ? St[n > 0.9 ? 5 : 4] : face > 0 ? St[3] : St[1]; if (((Math.atan2(x, z) * 640) | 0) % 7 === 0 && r < 596) d[o] = St[2]; if (r < 596) { const s = lay(sv + 0.2, 0.5, i, j); if (s) d[o] = Sn[s === 2 ? (n > 0.9 ? 5 : 4) : 3]; } continue; }
      if (r < 716) {
        const k = Math.abs(r - 660) / 56, iv = sm[(i >> 1) * SM + (j >> 1)] / 255, s = lay(iv, 0.52, i, j);
        if (s === 2) { let c = k < 0.3 ? 1 : k < 0.65 ? 2 : 3; if (iv < 0.56) c = 4; if (n > 0.975) c = 5; else if (hh(i >> 2, j) < 0.025 || hh(i, j >> 2) < 0.025) c = 0; d[o] = Ic[c]; continue; }
        if (s === 1) { d[o] = Ic[4]; continue; }
        let c = k < 0.3 ? 1 : k < 0.65 ? 2 : 3; if (n < 0.12) c--; else if (n > 0.93) c++; if (hh(i >> 3, j >> 1) < 0.05) c = 5; d[o] = Md[Math.max(0, Math.min(5, c))]; continue;
      }
      if (r < 732) { d[o] = r < 724 ? (face < 0 ? St[3] : St[1]) : St[n > 0.9 ? 5 : 4]; if (((Math.atan2(x, z) * 900) | 0) % 9 === 0 && r >= 724) d[o] = St[2]; if (r >= 724) { const s = lay(sv + 0.25, 0.5, i, j); if (s) d[o] = Sn[s === 2 ? (n > 0.9 ? 5 : 4) : 3]; } continue; }
      // (the park's wall: its inner face, the walk along its top (snow lying on its flags), the merlons capped in snow)
      if (r > WALL_R - 10) {
        if (r < WALL_R) { d[o] = face < 0 ? St[3] : St[1]; continue; }
        if (r < WALL_R + 46) { const bl = ((Math.atan2(x, z) * WALL_R) / 36) | 0, rr = (((r - WALL_R) / 12) | 0), s = lay(sv + 0.2, 0.5, i, j); d[o] = s === 2 ? Sn[(n > 0.9 ? 5 : 4) - ((bl + rr) % 2)] : s ? Sn[3] : Fl[(n > 0.9 ? 4 : 3) - ((bl + rr) % 2)]; if (r > WALL_R + 42) d[o] = Fl[1]; continue; }
        const m = (((Math.atan2(x, z) * WALL_R) / 40) | 0) % 2 === 0;
        d[o] = m ? (r < WALL_R + 52 ? Sn[5] : Sn[3]) : St[1];
        continue;
      }
      // (the park railway: ballast (snow in it), sleepers, two steel rails)
      if (Math.abs(r - RAIL_R) < 26) {
        const q = Math.abs(r - RAIL_R), tieOn = (((Math.atan2(x, z) * RAIL_R) / 15) | 0) % 2 === 0, s = lay(sv + 0.1, 0.5, i, j);
        if (q > 20) d[o] = s === 2 ? Sn[n > 0.6 ? 3 : 2] : Bl[n > 0.6 ? 2 : 1];
        else if (Math.abs(q - 9) < 3) d[o] = r > RAIL_R ? steelD : steel;
        else d[o] = tieOn ? (n > 0.5 ? tieL : tie) : s ? Sn[n > 0.5 ? 3 : 2] : Bl[n > 0.7 ? 4 : n > 0.3 ? 3 : 2];
        continue;
      }
      // (drifts: deeper along the park's wall and against the moat's outer rim)
      const drift = (r > WALL_R - 260 ? ((r - (WALL_R - 260)) / 250) * 0.5 : 0) + (r < 900 ? (1 - (r - 732) / 168) * 0.42 : 0);
      // (the ring paths and the avenues: gravel, a darker edge, a stone kerb)
      let path = -1;
      for (const R of RINGS) { const hw = R === 960 ? 60 : R === 2450 ? 46 : 40, q = Math.abs(r - R); if (q < hw) { path = q > hw - 4 ? 0 : q > hw - 12 ? 2 : 4; break; } }
      if (path < 0 && r < WALL_R - 20) for (const [sa, ca] of avA) {
        if (x * sa + z * ca <= 0) continue;
        const q = Math.abs(x * ca - z * sa);
        if (q < 55) { path = q > 51 ? 0 : q > 43 ? 2 : 4; break; }
      }
      if (path >= 0) {
        // (frosted: snow banked on the kerbs where it's been shoveled off, trodden snow where it hasn't, frost in the gravel)
        const s = lay(sv + drift, 0.68, i, j);
        if (path === 0) d[o] = Sn[n > 0.5 ? 4 : 3];
        else if (path === 2 && lay(sv + drift + 0.25, 0.5, i, j)) d[o] = Sn[n > 0.6 ? 3 : 2];
        else if (s === 2) d[o] = n < 0.12 ? Gr[path] : Sn[n > 0.85 ? 3 : 2];
        else if (s === 1) d[o] = Sn[2];
        else { let c = path; if (n < 0.14) c--; else if (n > 0.9) c++; else if (n > 0.47 && n < 0.49) c -= 2; d[o] = n > 0.82 && n < 0.9 ? Sn[3] : Gr[Math.max(0, Math.min(5, c))]; }
        continue;
      }
      // (the glen's forest floor: moss and leaf litter, under the canopy painted on later)
      if (r > RINGS[1] + 46 && x < 0) {
        const b = Math.atan2(x, z) / D2R;
        if (b > GLEN.a0 && b < GLEN.a1) { const lo = hh(i >> 2, j >> 2); d[o] = Ms[(lo > 0.6 ? 3 : 2) + (n > 0.88 ? 1 : n < 0.12 ? -1 : 0)]; continue; }
      }
      // (THE LAWN: mown in rings round the castle, a dithered seam between them; tufts and clover patches)
      // Under patchy snow: lying deep (the stripes still reading in it), thinning to its edge in steps and a dither,
      // thawed green between
      const stripe = ((r / 48) | 0) & 1, seam = r % 48 < 2.5 && ((i + j) & 1) === 1, lit = stripe ^ (seam ? 1 : 0), sw = sv + drift;
      const s = lay(sw, 0.55, i, j);
      if (s === 2) { d[o] = sw > 0.62 ? Sn[n > 0.975 ? 5 : n < 0.03 ? 2 : lit ? 4 : 3] : Sn[lit ? 3 : 2]; continue; }
      if (s === 1) { d[o] = Sn[2]; continue; }
      let c = lit ? 4 : 3;
      if (hh(i >> 3, j >> 3) < 0.09) c--;
      if (n < 0.06) c--; else if (n > 0.965) c++;
      d[o] = Lw[c];
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The castle from above

const castleTop = () => {
  const cu = U(0), cv = V(0);
  // (its long shadow down and right, over the moat and the lawn)
  g.save(); g.globalAlpha = 0.3; fill('#0A0618'); g.beginPath(); g.ellipse(cu + L(380), cv + L(380), L(560), L(260), Math.PI / 4, 0, Math.PI * 2); g.fill(); g.restore();
  // (the crag: rock in steps, cracks, ledges)
  for (let k = 0; k < 60; k++) { const a = hash(k * 2.3) * 6.28, d = L(470 + hash(k * 1.1) * 110); const u = cu + Math.cos(a) * d, v = cv + Math.sin(a) * d, r = 2 + hash(k * 3.7) * 5; dsc(u + 1, v + 1, r, STONE[0]); dsc(u, v, r, STONE[2]); dsc(u - r * 0.3, v - r * 0.3, r * 0.5, STONE[3]); }
  for (let k = 0; k < 30; k++) { const a = hash(k * 5.1) * 6.28, d0 = L(480 + hash(k) * 40), d1 = d0 + L(30 + hash(k * 2) * 50); ln([cu + Math.cos(a) * d0, cv + Math.sin(a) * d0, cu + Math.cos(a + 0.05) * d1, cv + Math.sin(a + 0.05) * d1], 1, STONE[0]); }
  // (THE CURTAIN WALL from above: its walk in flags, the merlons along its outer edge, round its ring)
  g.strokeStyle = '#1A1028'; g.lineWidth = L(70); g.beginPath(); g.arc(cu, cv, L(540), 0, 6.283); g.stroke();
  g.strokeStyle = PALE[3]; g.lineWidth = L(60); g.stroke();
  g.strokeStyle = PALE[4]; g.lineWidth = L(30); g.beginPath(); g.arc(cu, cv, L(532), 0, 6.283); g.stroke();
  for (let k = 0; k < 96; k++) { const a = (k / 96) * 6.283, u = cu + Math.cos(a) * L(566), v = cv + Math.sin(a) * L(566); if (k % 2 === 0) { bx(u - 1, v - 1, 2, 2, PALE[5]); bx(u, v, 1, 1, PALE[2]); } }
  for (let k = 0; k < 48; k++) { const a = (k / 48) * 6.283; bx(cu + Math.cos(a) * L(520), cv + Math.sin(a) * L(520), 1, 1, PALE[2]); }
  // (snow along the walk: lying deep in stretches, swept in others, the merlons capped)
  for (let k = 0; k < 360; k++) { const a = (k / 360) * 6.283, t = hash(Math.floor(k / 9) * 3.7); if (t < 0.35) continue; for (const rr of [548, 540, 532, 556]) if (t > 0.6 || ((k + rr / 8) & 1)) bx(cu + Math.cos(a) * L(rr), cv + Math.sin(a) * L(rr), 1, 1, rr === 556 ? SNOW[3] : SNOW[4]); }
  for (let k = 0; k < 96; k += 2) { const a = (k / 96) * 6.283; bx(cu + Math.cos(a) * L(566) - 1, cv + Math.sin(a) * L(566) - 1, 1, 1, SNOW[5]); }
  // (the courtyard: flagstones in courses, a well, banners' shadows; guards on the walk)
  dsc(cu, cv, L(505), PALE[1]); dsc(cu, cv, L(500), FLAG[3]);
  for (let y = -L(500); y < L(500); y += 3) for (let x = -L(500); x < L(500); x += 4) { if (x * x + y * y > L(495) ** 2) continue; const o = ((y / 3) | 0) % 2 ? 2 : 0; bx(cu + x + o, cv + y, 1, 3, FLAG[2]); bx(cu + x + o, cv + y, 4, 1, FLAG[2]); if (hash(x * 1.3 + y) > 0.85) bx(cu + x + o + 1, cv + y + 1, 3, 2, FLAG[4]); }
  // (snow in the courtyard: drifted against the curtain wall's foot all round, patches across the flags)
  for (let k = 0; k < 220; k++) { const a = (k / 220) * 6.283; for (let q = 0; q < 3; q++) if (q < 2 || (k & 1)) bx(cu + Math.cos(a) * (L(500) - 1 - q), cv + Math.sin(a) * (L(500) - 1 - q), 1, 1, q ? SNOW[4] : SNOW[3]); }
  for (let k = 0; k < 9; k++) { const a = hash(k * 6.1 + 2) * 6.28, d = L(150 + hash(k * 2.7) * 300); snowPatch(cu + Math.cos(a) * d, cv + Math.sin(a) * d, 3 + hash(k * 1.9) * 5, 2 + hash(k * 3.1) * 3, k * 5.3); }
  for (let k = 0; k < 14; k++) { const a = hash(k * 4.4) * 6.28; person(cu + Math.cos(a) * L(540), cv + Math.sin(a) * L(540), k * 3.3); }
  crowd(cu - L(250), cv + L(250), L(60), L(60), 26, 11.1);
  fountain(cu + L(300), cv + L(150), 4);
  // (the inner ward's roofs: the great hall's slates, the chapel's, the gatehouse's)
  roof(cu - L(220), cv - L(40), L(320), L(110), -0.35, SLATE, { dormers: 4, chimney: true });
  roof(cu + L(230), cv - L(120), L(220), L(80), 0.8, SLATE, { ridge: GOLD[4] });
  roof(cu + L(60), cv + L(330), L(180), L(90), 0.1, ROOF, { hip: true });
  roof(cu - L(120), cv + L(300), L(140), L(70), -0.6, PINK, { hip: true });
  // (THE KEEP: its square roof inside a crenellated parapet, its corner turrets, and the spire's cone in the middle)
  bx(cu - L(170) + 4, cv - L(170) + 4, L(340), L(340), SHADOW);
  bx(cu - L(170) - 1, cv - L(170) - 1, L(340) + 2, L(340) + 2, '#1A1028');
  bx(cu - L(170), cv - L(170), L(340), L(340), PALE[4]);
  bx(cu - L(150), cv - L(150), L(300), L(300), SLATE[2]);
  for (let y = -L(150); y < L(150); y += 2) bx(cu - L(150), cv + y, L(300), 1, SLATE[y < 0 ? 3 : 1]);
  // (snow on the keep's roof: lying over the slates, their courses showing through toward the parapet, drifted at its foot)
  for (let y = -L(146); y < L(146); y++) { const e = Math.min(y + L(146), L(146) - y); bx(cu - L(146) + (e < 3 ? (y & 1) : 0), cv + y, L(292), 1, e < 3 && (y & 1) ? SLATE[2] : y < 0 ? SNOW[4] : SNOW[2]); }
  for (let k = 0; k < L(292); k += 2) { bx(cu - L(146) + k, cv - L(146), 1, 1, SNOW[5]); bx(cu - L(146), cv - L(146) + k, 1, 1, SNOW[5]); }
  for (let k = 0; k < L(340); k += 3) { bx(cu - L(170) + k, cv - L(170), 2, 2, PALE[5]); bx(cu - L(170) + k, cv + L(170) - 2, 2, 2, PALE[3]); bx(cu - L(170), cv - L(170) + k, 2, 2, PALE[5]); bx(cu + L(170) - 2, cv - L(170) + k, 2, 2, PALE[3]); }
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) coneTop(cu + sx * L(165), cv + sy * L(165), L(55), ROOF, sx < 0 ? '#F472B6' : '#FDE047');
  for (let k = 0; k < 6; k++) { const a = ((k * 60 + 30 - 90) * Math.PI) / 180; coneTop(cu + Math.cos(a) * L(530), cv + Math.sin(a) * L(530), L(72), ROOF, k % 2 ? '#F472B6' : '#FDE047'); }
  coneTop(cu, cv, L(105), ROOF, '#F472B6');
  // (the gatehouse and its drawbridge across the moat, south)
  bx(cu - L(50), cv + L(540), L(100), L(190), '#1A1028'); bx(cu - L(46), cv + L(560), L(92), L(170), DECK[3]);
  for (let y = 0; y < L(170); y += 2) bx(cu - L(46), cv + L(560) + y, L(92), 1, DECK[2]);
  bx(cu - L(46), cv + L(560), L(92), 1, DECK[5]);
  crowd(cu, cv + L(650), L(30), L(70), 14, 5.5);
};

// ---------------------------------------------------------------------------------------------------------------
// The moat's dressing, the lawn by it, the ring paths' and avenues' furniture

const moatAndPaths = () => {
  const cu = U(0), cv = V(0);
  // (the moat: puddles with the sky in them, the cleaning cart, footprints, a stranded rowboat, a ladder, a WET FLOOR cone)
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * 6.283 + hash(i) * 0.1, r = L(630 + hash(i * 2.2) * 60), u = cu + Math.cos(a) * r, v = cv + Math.sin(a) * r, rx = 2 + hash(i * 3) * 5, ry = 1 + hash(i * 4) * 2;
    // (every third iced over, a crack across it)
    const iced = i % 3 === 0;
    el(u, v, rx + 1, ry + 1, a + 1.57, MUD[1]); el(u, v, rx, ry, a + 1.57, iced ? ICE[3] : WATER[3]); el(u - 0.5, v - 0.5, rx * 0.6, ry * 0.5, a + 1.57, iced ? ICE[5] : WATER[5]);
    if (iced && rx > 3) ln([u - Math.cos(a + 1.57) * rx * 0.7, v - Math.sin(a + 1.57) * rx * 0.7, u + 0.5, v - 0.5, u + Math.cos(a + 1.57) * rx * 0.6, v + Math.sin(a + 1.57) * rx * 0.6], 0.6, ICE[1]);
  }
  for (let k = 0; k < 220; k += 2) { const a = 2.2 + k * 0.006, r = L(660) + Math.sin(k * 0.5) * 0.8; bx(cu + Math.cos(a) * r, cv + Math.sin(a) * r, 1, 1, MUD[0]); }
  local(at(130, 660).x, at(130, 660).z, 130, th => { const [sx, sy] = shOf(th, 2); bx(-5 + sx, -4 + sy, 10, 8, SHADOW); bx(-5, -4, 10, 8, '#1A1028'); bx(-4, -3, 8, 6, '#F2C84A'); bx(-4, -3, 8, 1, '#FFF0A8'); bx(-3, -1, 3, 3, '#4A84C4'); bx(1, -1, 2, 2, '#9AA2B8'); for (const wx of [-4, 3]) { bx(wx, 3, 2, 2, '#1A1028'); bx(wx, -5, 2, 2, '#1A1028'); } });
  local(at(255, 650).x, at(255, 650).z, 75, th => { const [sx, sy] = shOf(th, 2); el(sx, sy, 9, 4, 0, SHADOW); el(0, 0, 9, 4, 0, '#1A1028'); el(0, 0, 8, 3, 0, DECK[3]); el(0, 0, 6, 2, 0, DECK[1]); for (const x of [-3, 0, 3]) bx(x, -2, 1, 4, DECK[4]); bx(6, -3, 1, 6, DECK[5]); });
  for (const b of [40, 200, 310]) { const p = at(b, 672); local(p.x, p.z, b, () => { pl([0, -3, 2, 2, -2, 2], '#F2C84A'); bx(-1, 0, 2, 1, '#1A1028'); }); }
  for (const b of [95, 330]) { const p = at(b, 608); local(p.x, p.z, b, () => { for (let k = 0; k < 6; k++) bx(-2, -k * 2, 4, 1, DECK[4]); bx(-2, -11, 1, 12, DECK[2]); bx(1, -11, 1, 12, DECK[2]); }); }
  for (let i = 0; i < 18; i++) { const a = hash(i * 9.1) * 6.283, r = L(620 + hash(i * 1.4) * 80); bx(cu + Math.cos(a) * r, cv + Math.sin(a) * r, 2, 1, i % 2 ? '#C8D0DA' : '#E8A030'); }
  // (the lawn by the moat: a flower border round it in bands, benches facing the castle)
  // (the border under snow, the blooms poking up through it)
  for (let k = 0; k < 900; k++) { const a = (k / 900) * 6.283, r = L(752 + (k % 3) * 6), u = cu + Math.cos(a) * r, v = cv + Math.sin(a) * r; if (hash(k * 0.37) < 0.3) { bx(u, v, 1, 1, SNOW[k % 2 ? 4 : 3]); continue; } bx(u, v, 1, 1, FLOWERS[(Math.floor(k / 9) + (k % 3)) % FLOWERS.length]); if (k % 4 === 0) bx(u + 1, v, 1, 1, SNOW[4]); }
  g.strokeStyle = HEDGE[3]; g.lineWidth = 1; g.beginPath(); g.arc(cu, cv, L(744), 0, 6.283); g.stroke(); g.beginPath(); g.arc(cu, cv, L(778), 0, 6.283); g.stroke();
  for (let k = 0; k < 24; k++) { const b = k * 15 + 7.5, p = at(b, 820); local(p.x, p.z, b, () => { bx(-3, 0, 6, 2, DECK[3]); bx(-3, 0, 6, 1, DECK[5]); bx(-3, 2, 6, 1, SHADOW); }); if (k % 3 === 0) person(U(p.x), V(p.z) + 1, k); }
  // (the ring paths: lamp posts along both kerbs, guests strolling)
  for (const R of RINGS) {
    const hw = R === 960 ? 60 : R === 2450 ? 46 : 40, n = Math.round((R * 6.283) / 150);
    for (let k = 0; k < n; k++) { const a = (k / n) * 6.283; for (const s of [-1, 1]) lamp(cu + Math.cos(a) * L(R + s * (hw + 6)), cv + Math.sin(a) * L(R + s * (hw + 6))); }
    const m = Math.round((R * 6.283) / 40);
    for (let k = 0; k < m; k++) { if (hash(k * 1.7 + R) > 0.45) continue; const a = (k / m) * 6.283 + hash(k + R) * 0.01, r = L(R + (hash(k * 3.3 + R) - 0.5) * hw * 1.4); person(cu + Math.cos(a) * r, cv + Math.sin(a) * r, k + R); }
  }
  // (the avenues: a row of round trees down each side, lamps between, guests on the gravel)
  for (let k = 0; k < 7; k++) {
    const b = k * 45;
    for (let r = 1060; r < WALL_R - 120; r += 130) {
      if (RINGS.some(R => Math.abs(r - R) < 90) || Math.abs(r - RAIL_R) < 70) continue;
      if (k === 4 && r > 2380 && r < 3120) continue;
      if (TOWERS.some(t => Math.hypot(t.x - at(b, r).x, t.z - at(b, r).z) < 260)) continue;
      for (const s of [-1, 1]) {
        const off = s * 98, x = at(b, r).x + Math.cos(b * D2R) * off, z = at(b, r).z - Math.sin(b * D2R) * off;
        const inGlen = k === 6 && s < 0 && r > 2500;
        treeTop(U(x), V(z), 4 + hash(r + s + k) * 1.5, inGlen ? FIR : hash(r * 1.1 + k) > 0.8 ? BLOSSOM : OAK, false);
        const lx = at(b, r + 65).x + Math.cos(b * D2R) * s * 62, lz = at(b, r + 65).z - Math.sin(b * D2R) * s * 62;
        lamp(U(lx), V(lz));
      }
      for (let n = 0; n < 4; n++) if (hash(r * 0.3 + n + k * 9) > 0.4) { const rr = r + hash(r + n * 2.1 + k) * 130, off = (hash(r * 1.9 + n + k) - 0.5) * 80, x = at(b, rr).x + Math.cos(b * D2R) * off, z = at(b, rr).z - Math.sin(b * D2R) * off; person(U(x), V(z), rr + n + k); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The eight gardens between the first two rings

/** A maze (a recursive backtracker on a grid, seeded): true where the hedge stands. */
const mazeGrid = (n: number, s: number) => {
  const N = n * 2 + 1, wall: boolean[] = new Array(N * N).fill(true), seen = new Array(n * n).fill(false);
  let sd = s;
  const rr = () => { sd = (sd * 16807 + 11) % 2147483647; return sd / 2147483647; };
  const stack = [0]; seen[0] = true; wall[N + 1] = false;
  while (stack.length) {
    const c = stack[stack.length - 1], cx = c % n, cy = (c / n) | 0;
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => cx + dx >= 0 && cx + dx < n && cy + dy >= 0 && cy + dy < n && !seen[(cy + dy) * n + cx + dx]);
    if (!nb.length) { stack.pop(); continue; }
    const [dx, dy] = nb[Math.floor(rr() * nb.length)], nx = cx + dx, ny = cy + dy;
    seen[ny * n + nx] = true; wall[(cy * 2 + 1 + dy) * N + cx * 2 + 1 + dx] = false; wall[(ny * 2 + 1) * N + nx * 2 + 1] = false;
    stack.push(ny * n + nx);
  }
  // (an open heart round the fountain, two ways in)
  const m = n; for (let y = m - 2; y <= m + 2; y++) for (let x = m - 2; x <= m + 2; x++) wall[y * N + x] = false;
  wall[(N - 1) * N + m + 1] = false; wall[(m + 1) * N] = false; wall[(m + 1) * N + N - 1] = false; wall[m + 1] = false;
  return { N, wall };
};

const gardens = () => {
  // THE HEDGE MAZE (22.5 degrees): hedges a cell thick, lit along their tops, shadows down and right; gravel between;
  // a fountain in its open heart; lost guests
  {
    const p = at(22.5, 1680), cu = U(p.x), cv = V(p.z), cell = 5, { N, wall } = mazeGrid(12, 77), half = (N * cell) / 2;
    bx(cu - half - 3, cv - half - 3, N * cell + 6, N * cell + 6, GRAVEL[3]);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (wall[y * N + x]) bx(cu - half + x * cell + 2, cv - half + y * cell + 2, cell, cell, SHADOW);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!wall[y * N + x]) { if (hash(x * 3.1 + y * 7.7) > 0.9) person(cu - half + x * cell + 2, cv - half + y * cell + 2, x + y * 31); continue; }
      const u = cu - half + x * cell, v = cv - half + y * cell;
      bx(u, v, cell, cell, HEDGE[3]);
      // (snow capping the hedge tops: thick along the lit edges, clumps across, the shaded edge left green)
      const topOpen = y === 0 || !wall[(y - 1) * N + x], leftOpen = x === 0 || !wall[y * N + x - 1];
      bx(u, v, cell, 1, topOpen ? SNOW[5] : SNOW[4]); if (topOpen) bx(u, v + 1, cell, 1, SNOW[4]);
      if (leftOpen) bx(u, v, 1, cell - 1, SNOW[4]);
      for (let k = 0; k < 3; k++) if (hash(x * 3.3 + y * 1.1 + k) > 0.45) bx(u + 1 + hash(x + y * 5 + k) * (cell - 2), v + 2 + hash(x * 2 + y + k) * (cell - 3), 1, 1, SNOW[k ? 3 : 4]);
      if (y === N - 1 || !wall[(y + 1) * N + x]) bx(u, v + cell - 1, cell, 1, HEDGE[1]);
      if (hash(x * 1.7 + y * 2.9) > 0.6) bx(u + 3, v + 3, 1, 1, HEDGE[4]);
    }
    // (drifts in the lanes, piled against the hedges' south-east sides)
    for (let y = 0; y < N - 1; y++) for (let x = 0; x < N - 1; x++) {
      if (!wall[y * N + x]) continue;
      const u = cu - half + x * cell, v = cv - half + y * cell;
      if (!wall[(y + 1) * N + x]) { bx(u + 2, v + cell + 2, cell - 2, 1, SNOW[3]); for (let k = 0; k < cell; k += 2) bx(u + 2 + k, v + cell + 3, 1, 1, SNOW[3]); }
      if (!wall[y * N + x + 1]) bx(u + cell + 2, v + 2, 1, cell - 2, SNOW[3]);
    }
    fountain(cu + 2, cv + 2, 7);
    crowd(cu - half - 8, cv + half, 6, 4, 14, 3.1);
  }
  // THE PARTERRE (67.5): box hedges in scrolls, mirrored four ways, coloured gravels and blooms inside them
  {
    const p = at(67.5, 1680), cu = U(p.x), cv = V(p.z), s = 60;
    bx(cu - s - 2, cv - s - 2, s * 2 + 4, s * 2 + 4, GRAVEL[4]);
    for (const [mx, my] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      g.save(); g.translate(cu, cv); g.scale(mx, my);
      fill('#B84A3A'); g.beginPath(); g.arc(s * 0.5, s * 0.5, s * 0.34, 0, 6.283); g.fill();
      fill(FLOWERS[mx > 0 ? 0 : 6]); g.beginPath(); g.arc(s * 0.5, s * 0.5, s * 0.2, 0, 6.283); g.fill();
      fill('#E8E0D0'); g.beginPath(); g.moveTo(8, s * 0.85); g.quadraticCurveTo(s * 0.2, s * 0.2, s * 0.85, 8); g.lineTo(s * 0.85, 14); g.quadraticCurveTo(s * 0.28, s * 0.28, 14, s * 0.85); g.closePath(); g.fill();
      g.strokeStyle = HEDGE[3]; g.lineWidth = 2;
      g.beginPath(); g.arc(s * 0.5, s * 0.5, s * 0.36, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(6, s * 0.95); g.quadraticCurveTo(s * 0.18, s * 0.18, s * 0.95, 6); g.stroke();
      g.beginPath(); g.moveTo(s * 0.2, s * 0.98); g.bezierCurveTo(s * 0.4, s * 0.7, s * 0.7, s * 1.0, s * 0.98, s * 0.6); g.stroke();
      g.beginPath(); g.moveTo(s * 0.98, s * 0.2); g.bezierCurveTo(s * 0.7, s * 0.4, s * 1.0, s * 0.7, s * 0.6, s * 0.98); g.stroke();
      g.strokeStyle = SNOW[5]; g.lineWidth = 0.8; g.beginPath(); g.arc(s * 0.5 - 0.6, s * 0.5 - 0.6, s * 0.36, 3.4, 5.6); g.stroke();
      // (snow lying on the box hedges' scrolls, dotted along their tops)
      for (let k = 0; k < 40; k++) { const t = k / 40, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t; bx(a * 6 + b * s * 0.18 + c * s * 0.95 - 0.5, a * s * 0.95 + b * s * 0.18 + c * 6 - 0.5, 1, 1, k % 3 ? SNOW[4] : SNOW[5]); }
      for (let k = 0; k < 6; k++) { const a = k * 1.05; bx(s * 0.5 + Math.cos(a) * s * 0.27, s * 0.5 + Math.sin(a) * s * 0.27, 1, 1, '#FDE047'); }
      g.restore();
    }
    g.strokeStyle = HEDGE[2]; g.lineWidth = 2; g.strokeRect(cu - s, cv - s, s * 2, s * 2);
    fountain(cu, cv, 6);
    for (const [dx, dy] of [[-s, -s], [s, -s], [-s, s], [s, s]]) treeTop(cu + dx, cv + dy, 3, HEDGE);
  }
  // THE ROSE GARDEN (112.5): rings of rose beds round a fountain, gilt arbors across the paths
  {
    const p = at(112.5, 1680), cu = U(p.x), cv = V(p.z);
    dsc(cu, cv, 62, GRAVEL[3]);
    for (let k = 0; k < 420; k++) { const a = hash(k * 1.71) * 6.283, d = Math.sqrt(hash(k * 2.33)) * 61; bx(cu + Math.cos(a) * d, cv + Math.sin(a) * d, 1, 1, k % 4 ? SNOW[3] : SNOW[4]); }
    for (const [r, cols] of [[56, ['#DC2626', '#F472B6']], [44, ['#F4F4F5', '#FDE047']], [32, ['#E11D48', '#F9A8D4']], [20, ['#FB923C', '#DC2626']]] as const) {
      g.strokeStyle = HEDGE[2]; g.lineWidth = 6; g.beginPath(); g.arc(cu, cv, r, 0, 6.283); g.stroke();
      g.strokeStyle = HEDGE[3]; g.lineWidth = 4; g.stroke();
      // (snow along the hedge ring's top, thickest on its lit side)
      g.strokeStyle = SNOW[4]; g.lineWidth = 1.4; g.beginPath(); g.arc(cu - 0.5, cv - 0.5, r - 0.8, 2.8, 6.0); g.stroke();
      for (let k = 0; k < r * 2; k++) { const a = (k / (r * 2)) * 6.283; if (k % 3 === 0) bx(cu + Math.cos(a) * (r + 1), cv + Math.sin(a) * (r + 1), 1, 1, SNOW[3]); }
      for (let k = 0; k < r * 5; k++) { const a = (k / (r * 5)) * 6.283; if (Math.abs(((a * 4 / 6.283) % 1) - 0.5) < 0.04) continue; const rr = r + (hash(k + r) - 0.5) * 3.6; bx(cu + Math.cos(a) * rr, cv + Math.sin(a) * rr, 1, 1, hash(k * 1.3 + r) > 0.35 ? cols[k % 2] : HEDGE[4]); }
    }
    for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.785; for (const r of [26, 38, 50]) { const u = cu + Math.cos(a) * r, v = cv + Math.sin(a) * r; g.save(); g.translate(u, v); g.rotate(a); bx(-1, -3, 3, 7, SHADOW); bx(-1.5, -3.5, 3, 7, GOLD[3]); bx(-1.5, -3.5, 1, 7, GOLD[5]); bx(-0.5, -2.5, 1, 5, '#F472B6'); g.restore(); } }
    fountain(cu, cv, 8);
    crowd(cu, cv, 58, 58, 22, 4.4);
  }
  // THE SPECTATOR LAWNS (157.5 and 202.5) by the broom port: picnic blankets, umbrellas, a queue maze, food carts, a
  // bandstand on the second
  for (const b of [157.5, 202.5]) {
    const p = at(b, 1700), cu = U(p.x), cv = V(p.z);
    for (let i = 0; i < 46; i++) blanket(cu + (hash(i * 3.3 + b) - 0.5) * 120, cv + (hash(i * 1.9 + b) - 0.5) * 120, i + b);
    for (let i = 0; i < 10; i++) { const a = hash(i * 7.3 + b) * 6.28, d = 30 + hash(i + b) * 30; umbrella(cu + Math.cos(a) * d, cv + Math.sin(a) * d, 4, ['#DC2626', '#2E5AAE', '#F472B6', '#E0AE3A'][i % 4], '#F4F0FA'); }
    crowd(cu, cv, 66, 66, 160, b);
    local(p.x, p.z, b, th => {
      if (b < 180) {
        // (the queue maze: switchback rails, a line of guests along each lane)
        const [sx, sy] = shOf(th, 1);
        for (let k = 0; k < 7; k++) { bx(-28 + sx, -30 + k * 5 + sy, 56, 1, SHADOW); bx(-28, -30 + k * 5, 56, 1, '#9AA2B8'); for (let x = -26; x < 26; x += 2) if (hash(x + k * 13) > 0.3) person(x, -28 + k * 5, x * 3 + k); }
        bx(-29, -30, 1, 31, '#9AA2B8'); bx(28, -30, 1, 31, '#9AA2B8');
      } else {
        // (the bandstand: an octagonal roof in stripes, a gilt finial; the band's audience round it)
        const r = 12, [sx, sy] = shOf(th, 3);
        const oct = (rr: number, ox: number, oy: number) => { const pts: number[] = []; for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + 0.39; pts.push(ox + Math.cos(a) * rr, oy + Math.sin(a) * rr); } return pts; };
        pl(oct(r, sx, sy), SHADOW); pl(oct(r + 1, 0, 0), '#1A1028');
        for (let k = 0; k < 8; k++) { const a0 = (k / 8) * 6.283 + 0.39, a1 = ((k + 1) / 8) * 6.283 + 0.39; pl([0, 0, Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r], k % 2 ? '#F4F0FA' : '#D8609E'); }
        dsc(0, 0, 2, GOLD[4]); bx(0, 0, 1, 1, GOLD[5]);
      }
      // (food carts: striped canopies)
      for (const x of [-40, 40]) { const [sx, sy] = shOf(th, 1.5); bx(x - 4 + sx, 30 + sy, 8, 5, SHADOW); for (let k = 0; k < 8; k++) bx(x - 4 + k, 30, 1, 5, k % 2 ? '#F4F0FA' : '#DC2626'); crowd(x, 38, 6, 3, 8, x * 1.3 + b); }
    });
  }
  // THE TOPIARY GARDEN (247.5) and its swan pond
  {
    const p = at(247.5, 1680), cu = U(p.x), cv = V(p.z);
    pond(cu + 18, cv - 6, 32, 20, 0.6, 5, 9.9);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 6.283, u = cu + 18 + Math.cos(a) * 46, v = cv - 6 + Math.sin(a) * 34;
      const kind = i % 3;
      if (kind === 0) treeTop(u, v, 3.5, HEDGE);
      else if (kind === 1) { dsc(u - 1.5 + 1, v + 1, 2.4, SHADOW); dsc(u + 1.5 + 1, v + 1, 2.4, SHADOW); dsc(u - 1.5, v, 2.4, HEDGE[3]); dsc(u + 1.5, v, 2.4, HEDGE[3]); pl([u - 3.8, v + 0.5, u, v + 4.5, u + 3.8, v + 0.5], HEDGE[3]); bx(u - 2, v - 2, 2, 1, SNOW[5]); bx(u + 1, v - 2, 2, 1, SNOW[4]); bx(u - 3, v - 1, 1, 1, SNOW[4]); }
      else { bx(u - 3 + 1, v - 1 + 1, 6, 3, SHADOW); bx(u - 3, v - 1, 6, 3, HEDGE[3]); bx(u + 2, v - 3, 2, 3, HEDGE[3]); bx(u + 3, v - 4, 1, 1, '#F6D365'); bx(u - 3, v - 1, 6, 1, SNOW[5]); bx(u + 2, v - 3, 1, 1, SNOW[4]); bx(u - 3, v, 1, 1, SNOW[4]); }
    }
    crowd(cu + 18, cv - 6, 54, 42, 30, 8.8);
  }
  // THE FLOWER CLOCK (292.5): a clock face planted in flowers, its numerals, its hands (a quarter past something)
  {
    const p = at(292.5, 1680), cu = U(p.x), cv = V(p.z), r = 48;
    dsc(cu + 2, cv + 2, r + 3, SHADOW); dsc(cu, cv, r + 3, PALE[1]); dsc(cu, cv, r + 2, PALE[4]);
    for (const [rr, cols] of [[r, ['#FDE047', '#FB923C']], [r * 0.8, ['#F4F4F5', '#A78BFA']], [r * 0.55, ['#F472B6', '#DC2626']], [r * 0.3, ['#60A5FA', '#F4F4F5']]] as const) {
      dsc(cu, cv, rr, HEDGE[3]);
      for (let y = -rr; y < rr; y += 1.5) for (let x = -rr; x < rr; x += 1.5) { const q = x * x + y * y; if (q > rr * rr || q < (rr - 9) * (rr - 9)) continue; const t = hash(x * 1.3 + y * 2.7 + rr); if (t > 0.3) bx(cu + x, cv + y, 1, 1, cols[(Math.floor((Math.atan2(y, x) + 3.15) * 6 / 3.1416)) % 2]); else if (t < 0.2) bx(cu + x, cv + y, 1, 1, SNOW[t < 0.08 ? 5 : 4]); }
    }
    for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283 - 1.571, u = cu + Math.cos(a) * r * 0.9, v = cv + Math.sin(a) * r * 0.9; bx(u - 1.5, v - 1.5, 3, 3, '#1A1028'); bx(u - 1, v - 1, 2, 2, GOLD[4]); }
    ln([cu, cv, cu + Math.cos(-1.571 + 0.52) * r * 0.5, cv + Math.sin(-1.571 + 0.52) * r * 0.5], 3, '#1A1028');
    ln([cu, cv, cu + Math.cos(0) * r * 0.78, cv + Math.sin(0) * r * 0.78], 2, '#1A1028');
    dsc(cu, cv, 3, GOLD[3]); bx(cu - 1, cv - 1, 1, 1, GOLD[5]);
    crowd(cu, cv + r + 8, 26, 5, 30, 6.6);
  }
  // PIPER'S HEART GARDEN (337.5): a heart hedge full of pink, a gazebo, benches, a fountain of a pixie
  {
    const p = at(337.5, 1680), cu = U(p.x), cv = V(p.z), s = 3.2;
    const heart = (k: number, col: string, ox = 0, oy = 0) => { g.save(); g.translate(cu + ox, cv + oy); g.scale(s * k, s * k); fill(col); g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -2, -10, -14, 0, -7); g.bezierCurveTo(10, -14, 14, -2, 0, 6); g.fill(); g.restore(); };
    heart(1.08, SHADOW, 3, 3); heart(1.08, HEDGE[1]); heart(1, HEDGE[3]);
    // (snow lying on the heart hedge's top, its lit side thickest)
    heart(0.97, SNOW[3], -0.6, -0.6); heart(0.93, HEDGE[3], 0.6, 0.6); heart(0.86, '#F472B6'); heart(0.7, '#F9A8D4'); heart(0.5, '#DC2626'); heart(0.32, '#FFE4F2');
    for (let k = 0; k < 120; k++) { const u = cu + (hash(k * 1.1) - 0.5) * 60, v = cv + (hash(k * 2.3) - 0.5) * 50; bx(u, v, 1, 1, '#FFD0E8'); }
    fountain(cu, cv - 2, 5);
    roof(cu + 46, cv + 30, 12, 12, 0.3, PINK, { hip: true });
    crowd(cu, cv, 50, 46, 26, 7.7);
  }
  // (the rest of the gardens' ground: lawns with trees here and there, benches, beds along the paths)
  for (let k = 0; k < 8; k++) {
    for (let i = 0; i < 26; i++) {
      const b = k * 45 + 6 + hash(i * 3.7 + k) * 33, r = 1120 + hash(i * 1.9 + k * 4) * 1220, p = at(b, r);
      if (Math.hypot(p.x - at(k * 45 + 22.5, 1680).x, p.z - at(k * 45 + 22.5, 1680).z) < 520) continue;
      if (TOWERS.some(t => Math.hypot(t.x - p.x, t.z - p.z) < 260)) continue;
      const t = hash(i * 5.3 + k);
      if (t < 0.55) treeTop(U(p.x), V(p.z), 3 + hash(i + k) * 3, t < 0.12 ? BLOSSOM : t < 0.2 ? LILAC : OAK, t < 0.12);
      else if (t < 0.8) bed(U(p.x), V(p.z), 10, 4, b * D2R, [FLOWERS[i % 8], FLOWERS[(i + 3) % 8]], i + k);
      else crowd(U(p.x), V(p.z), 6, 6, 9, i * 3 + k);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The broom port (south), the watchtowers' plazas

const port = () => {
  const cu = U(0), cv = V(-2750);
  // (the stands either side: stepped seats packed with guests in the houses' colors, hoardings, a striped canopy)
  for (const s of [-1, 1]) {
    const x0 = cu + s * L(400), w = L(150);
    bx(x0 - w / 2 + 3, cv - L(230) + 3, w, L(460), SHADOW);
    bx(x0 - w / 2 - 1, cv - L(230) - 1, w + 2, L(460) + 2, '#1A1028');
    for (let r = 0; r < 8; r++) { const xx = s < 0 ? x0 - w / 2 + r * (w / 8) : x0 + w / 2 - (r + 1) * (w / 8); bx(xx, cv - L(230), w / 8, L(460), r % 2 ? PLUM[2] : PLUM[3]); for (let y = 0; y < L(460); y += 1.5) if (hash(r * 31 + y) > 0.12) bx(xx + 1 + hash(y + r) * (w / 8 - 2), cv - L(230) + y, 1, 1, COATS[Math.floor(hash(y * 1.7 + r) * COATS.length)]); }
    const cx = s < 0 ? x0 - w / 2 - 3 : x0 + w / 2;
    for (let y = 0; y < L(460); y += 4) bx(cx, cv - L(230) + y, 3, 4, ['#C8283E', '#2E5AAE', '#E0AE3A', '#2E8A5A'][Math.floor(y / 4) % 4]);
    for (let y = -L(230); y < L(230); y += 3) bx(s < 0 ? x0 - w / 2 : x0 + w / 2 - 6, cv + y, 6, 3, (y / 3) % 2 ? '#F4F0FA' : '#D8609E');
  }
  // (THE DECK: planks across, a red carpet runway down the middle, a dashed line, chevrons toward the castle, landing lights)
  bx(cu - L(380) + 3, cv - L(210) + 3, L(760), L(420), SHADOW);
  bx(cu - L(381), cv - L(211), L(762), L(422), '#1A1028');
  bx(cu - L(380), cv - L(210), L(760), L(420), DECK[3]);
  for (let y = 0; y < L(420); y += 2) { bx(cu - L(380), cv - L(210) + y, L(760), 1, DECK[y % 4 ? 2 : 4]); for (let x = (y * 7) % 19; x < L(760); x += 19) bx(cu - L(380) + x, cv - L(210) + y, 1, 2, DECK[1]); }
  bx(cu - L(60), cv - L(210), L(120), L(420), '#7F1D1D'); bx(cu - L(50), cv - L(210), L(100), L(420), '#B91C1C'); bx(cu - L(50), cv - L(210), 1, L(420), '#DC2626');
  for (let y = 0; y < L(420); y += 8) bx(cu - 0.5, cv - L(210) + y, 1, 4, '#FFF6C8');
  for (let k = 0; k < 4; k++) { const y = cv - L(200) + k * 6; ln([cu - 6, y + 4, cu, y, cu + 6, y + 4], 1.2, '#F6D365'); }
  // (the deck's swept, the snow shoveled into banks along its edges)
  for (let y = 0; y < L(420); y++) for (const [x, s] of [[-L(380), 1], [L(380) - 2, -1]] as const) { bx(cu + x, cv - L(210) + y, 2, 1, SNOW[4]); if ((y + (s > 0 ? 0 : 1)) & 1) bx(cu + x + (s > 0 ? 2 : -1), cv - L(210) + y, 1, 1, SNOW[3]); }
  for (let y = 0; y < L(420); y += 6) for (const x of [-L(70), L(70)]) { bx(cu + x - 1, cv - L(210) + y, 2, 2, '#1A1028'); bx(cu + x - 0.5, cv - L(210) + y + 0.5, 1, 1, '#FDE68A'); lights.push([cu + x, cv - L(210) + y, 2, '#FDE68A']); }
  // (the scoreboard at its far end, the hoops, wind socks, broom racks; officials and riders milling)
  bx(cu - L(120), cv + L(214), L(240), L(30), '#1A1028'); bx(cu - L(118), cv + L(216), L(236), L(26), '#2A1A3A');
  for (let x = 2; x < L(236) - 2; x += 2) bx(cu - L(118) + x, cv + L(220), 1, 2, hash(x) > 0.5 ? '#FDE68A' : '#F472B6');
  for (const [x, y] of [[-200, 120], [200, 120], [-200, -120], [200, -120]]) { g.strokeStyle = GOLD[4]; g.lineWidth = 1.2; g.beginPath(); g.ellipse(cu + L(x), cv + L(y), 4, 1.5, 0, 0, 6.283); g.stroke(); }
  for (const x of [-330, 330]) { bx(cu + L(x), cv - L(190), 1, 1, '#1A1028'); bx(cu + L(x) + 1, cv - L(190), 4, 1, '#FB923C'); bx(cu + L(x) + 5, cv - L(190), 2, 1, '#F4F4F5'); }
  for (const x of [-300, 300]) for (let k = 0; k < 8; k++) bx(cu + L(x) - 4 + k, cv + L(170), 1, 4, k % 2 ? DECK[5] : '#D8B060');
  crowd(cu, cv + L(160), L(260), L(30), 30, 2.2);
  crowd(cu, cv + L(330), L(300), L(60), 90, 2.9);
};

const towerPlazas = () => {
  for (const t of TOWERS) {
    const u = U(t.x), v = V(t.z), r = L(200);
    // (the tower's long shadow down and right across the lawn)
    g.save(); g.globalAlpha = 0.28; fill('#0A0618'); g.beginPath(); g.ellipse(u + L(330), v + L(330), L(360), L(70), Math.PI / 4, 0, 6.283); g.fill(); g.restore();
    dsc(u, v, r + 1, '#1A1028'); dsc(u, v, r, FLAG[3]);
    for (let k = 0; k < 4; k++) { g.strokeStyle = FLAG[2]; g.lineWidth = 1; g.beginPath(); g.arc(u, v, r * (0.35 + k * 0.17), 0, 6.283); g.stroke(); }
    for (let k = 0; k < 24; k++) { const a = (k / 24) * 6.283; ln([u + Math.cos(a) * r * 0.35, v + Math.sin(a) * r * 0.35, u + Math.cos(a) * r, v + Math.sin(a) * r], 1, FLAG[2]); }
    // (snow swept to the plaza's rim in a bank, dithered in)
    g.strokeStyle = SNOW[3]; g.lineWidth = 2; g.beginPath(); g.arc(u, v, r - 1.5, 0, 6.283); g.stroke();
    for (let k = 0; k < r * 6; k++) { const a = (k / (r * 6)) * 6.283; if (k & 1) bx(u + Math.cos(a) * (r - 3.5), v + Math.sin(a) * (r - 3.5), 1, 1, SNOW[3]); }
    g.strokeStyle = FLAG[5]; g.lineWidth = 1; g.beginPath(); g.arc(u, v, r - 0.5, 3.4, 5.9); g.stroke();
    // (its foot: the drum's top seen in steps, the roof's cone from above)
    coneTop(u, v, L(122), ROOF, t.i % 2 ? '#F472B6' : '#FDE047');
    for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + t.i; lamp(u + Math.cos(a) * (r - 2), v + Math.sin(a) * (r - 2)); }
    crowd(u, v, r * 0.9, r * 0.9, 16, t.i * 13.3);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lands out to the wall (plots along the outer rings), and the glen's forest

type Plot = (th: number, s: number) => void;
const giftShop: Plot = (th, s) => {
  const cols = [PINK, ROOF, SLATE, PLUM, BRICK][Math.floor(hash(s) * 5)];
  roof(0, -4, 36, 20, 0, cols, { dormers: 3, chimney: hash(s * 2) > 0.5, ridge: GOLD[4] });
  const [sx, sy] = shOf(th, 1);
  for (let k = 0; k < 36; k += 2) { bx(-18 + k + sx, 7 + sy, 2, 3, SHADOW); bx(-18 + k, 7, 1, 3, '#F4F0FA'); bx(-17 + k, 7, 1, 3, cols[3]); }
  for (let k = 0; k < 4; k++) roof(-24 + k * 16, 22, 10, 7, 0, [THATCH, PINK, ROOF, SLATE][(k + Math.floor(s)) % 4], { hip: true });
  crowd(0, 14, 18, 3, 22, s);
};
const teacups: Plot = (_th, s) => {
  dsc(1, 1, 26, SHADOW); dsc(0, 0, 26, '#1A1028'); dsc(0, 0, 25, PALE[4]); dsc(0, 0, 23, '#E8D8F0');
  for (let k = 0; k < 24; k++) { const a = (k / 24) * 6.283; bx(Math.cos(a) * 24, Math.sin(a) * 24, 1, 1, k % 2 ? '#F472B6' : '#FDE047'); }
  for (let t = 0; t < 3; t++) {
    const a = t * 2.094 + s, cx = Math.cos(a) * 11, cy = Math.sin(a) * 11;
    dsc(cx, cy, 9, '#C8B8E0'); dsc(cx, cy, 8, '#B8A4D8');
    for (let c = 0; c < 4; c++) { const b = c * 1.571 + s * 2 + t, ux = cx + Math.cos(b) * 5, uy = cy + Math.sin(b) * 5, col = ['#F472B6', '#60A5FA', '#FDE047', '#4ADE80', '#A78BFA'][(c + t) % 5]; dsc(ux + 0.6, uy + 0.6, 3, SHADOW); dsc(ux, uy, 3, '#1A1028'); dsc(ux, uy, 2.4, col); dsc(ux - 0.4, uy - 0.4, 1.4, mix(col, '#1A1028', 0.4)); person(ux, uy, c + t * 7 + s); }
  }
  dsc(0, 0, 3, GOLD[4]);
  crowd(0, 32, 20, 4, 24, s + 1);
};
const carousel: Plot = (_th, s) => {
  coneTop(0, 0, 22, ['#5A1E3A', '#8A3060', '#B84A86', '#DA72AA', '#F2A2CA', '#FFD6EA'], '#FDE047');
  for (let k = 0; k < 16; k++) { const a0 = (k / 16) * 6.283; if (k % 2) { g.fillStyle = 'rgba(255,246,236,0.75)'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 22, a0, a0 + 0.39); g.closePath(); g.fill(); } }
  for (let k = 0; k < 32; k++) { const a = (k / 32) * 6.283; bx(Math.cos(a) * 23, Math.sin(a) * 23, 1, 1, k % 2 ? '#FDE047' : '#FFF6C8'); }
  dsc(0, 0, 4, GOLD[3]); dsc(-1, -1, 2, GOLD[5]);
  crowd(0, 0, 32, 32, 30, s);
};
const foodCourt: Plot = (th, s) => {
  roof(0, -16, 30, 14, 0, [RED_R, PINK, ROOF][Math.floor(hash(s) * 3)], { chimney: true, ridge: '#FFF6C8' });
  for (let y = 0; y < 3; y++) for (let x = 0; x < 5; x++) umbrella(-20 + x * 10, 2 + y * 10, 3.6, ['#DC2626', '#2E5AAE', '#F472B6', '#E0AE3A', '#2E8A5A'][(x + y + Math.floor(s)) % 5], '#F4F0FA');
  crowd(0, 8, 28, 16, 50, s);
  void th;
};
const queueMaze: Plot = (th, s) => {
  roof(0, -22, 40, 16, 0, [PLUM, SLATE, ROOF][Math.floor(hash(s) * 3)], { hip: true, ridge: GOLD[4] });
  const [sx, sy] = shOf(th, 1);
  for (let k = 0; k < 8; k++) { bx(-26 + sx, -8 + k * 4 + sy, 52, 1, SHADOW); bx(-26, -8 + k * 4, 52, 1, '#9AA2B8'); for (let x = -24; x < 24; x += 2) if (hash(x + k * 13 + s) > 0.35) person(x, -6 + k * 4, x * 3 + k + s); }
  for (let k = 0; k < 52; k += 4) { bx(-26 + k, -10, 4, 2, k % 8 ? '#F4F0FA' : '#D8609E'); }
};
const cottages: Plot = (th, s) => {
  for (let k = 0; k < 4; k++) {
    const x = -18 + (k % 2) * 30 + hash(s + k) * 6, y = -14 + Math.floor(k / 2) * 26 + hash(s * 2 + k) * 4, R = [THATCH, BRICK, PINK, ROOF][(k + Math.floor(s * 3)) % 4];
    bx(x - 9, y - 7, 18, 16, LAWN[4]); snowPatch(x - 3, y + 2, 5, 3, s + k * 3); for (let px = x - 9; px < x + 9; px += 2) { bx(px, y - 8, 1, 1, '#F4F0FA'); bx(px, y + 9, 1, 1, '#F4F0FA'); }
    for (let f = 0; f < 10; f++) bx(x - 8 + hash(f + k + s) * 16, y + 5 + hash(f * 2 + k) * 3, 1, 1, FLOWERS[f % 8]);
    roof(x, y - 1, 12, 9, hash(s + k * 3) > 0.5 ? 0 : 1.571, R, { chimney: true });
    person(x + 6, y + 6, k + s);
  }
  ln([-30, 30, -10, 10, 10, 6, 30, -20], 2, GRAVEL[4]);
  void th;
};
const pondPlot: Plot = (_th, s) => { pond(0, 0, 26, 17, hash(s) * 3, 3, s); ln([-24, 2, -12, 0], 2, DECK[4]); crowd(0, 20, 22, 4, 16, s); for (let k = 0; k < 5; k++) treeTop(-28 + k * 14, -24 + hash(k + s) * 4, 4, hash(k * 2 + s) > 0.6 ? BLOSSOM : OAK, hash(k * 2 + s) > 0.6); };
const spinner: Plot = (th, s) => {
  // (THE FLYING UNICORNS: a hub, eight arms out to a unicorn each, its queue)
  const [sx, sy] = shOf(th, 2);
  dsc(sx, sy, 26, SHADOW); dsc(0, 0, 26, '#1A1028'); dsc(0, 0, 25, '#9CC8E8'); dsc(0, 0, 21, '#B8DCF2');
  for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + s; ln([0, 0, Math.cos(a) * 19, Math.sin(a) * 19], 1.4, GOLD[3]); const ux = Math.cos(a) * 19, uy = Math.sin(a) * 19; bx(ux - 2 + 1, uy - 1 + 1, 4, 2, SHADOW); bx(ux - 2, uy - 1, 4, 2, '#F4F0FA'); bx(ux + 1, uy - 2, 1, 1, '#F6D365'); bx(ux - 2, uy - 1, 1, 2, ['#F472B6', '#A78BFA', '#60A5FA', '#FDE047'][k % 4]); }
  coneTop(0, 0, 6, ROOF, '#F472B6');
  crowd(0, 32, 22, 4, 26, s);
};
const showBuilding: Plot = (th, s) => {
  // (a dark ride's show building: a big flat roof (backstage: air handlers, ducts, a hatch), its storybook front facade)
  const [sx, sy] = shOf(th, 3);
  bx(-30 + sx, -26 + sy, 60, 40, SHADOW); bx(-31, -27, 62, 42, '#1A1028'); bx(-30, -26, 60, 40, '#8A8494'); bx(-30, -26, 60, 1, '#B8B2C2');
  for (let y = -24; y < 14; y += 4) bx(-29, y, 58, 1, '#7A7484');
  for (const [x, y] of [[-20, -18], [-6, -18], [10, -10], [20, 2]]) { bx(x - 3 + 1, y - 2 + 1, 6, 4, SHADOW); bx(x - 3, y - 2, 6, 4, '#C8C6D6'); bx(x - 3, y - 2, 6, 1, '#E8E6F2'); dsc(x, y, 1.2, '#5A5868'); }
  ln([-24, -10, 18, -10, 18, 2], 1.2, '#A8A6B6'); bx(-26, 4, 4, 4, '#5A5868');
  roof(0, 18, 64, 8, 0, [PINK, PLUM, ROOF][Math.floor(hash(s) * 3)], { ridge: GOLD[4], dormers: 5 });
  crowd(0, 28, 26, 4, 30, s);
};
const RED_R = ['#2E0810', '#561020', '#821C30', '#B02A42', '#D2506A', '#EE8A9E'];
const PLOTS: Plot[] = [giftShop, teacups, carousel, foodCourt, queueMaze, cottages, pondPlot, spinner, showBuilding, giftShop, carousel, foodCourt];

function* lands(): Generator<void> {
  for (const [r, step] of [[2800, 520], [3200, 560], [3920, 560], [4320, 560], [4790, 580]] as const) {
    yield;
    const n = Math.floor((r * 6.283) / step);
    for (let k = 0; k < n; k++) {
      const b = (k / n) * 360 + (r % 7) * 3;
      const bb = ((b % 360) + 360) % 360;
      if (bb > 360 + GLEN.a0 - 4 && bb < 360 + GLEN.a1 + 4) continue;
      if (bb > 163 && bb < 197 && r < 3300) continue;
      if (r > 4700 && Math.abs(bb - 205) < 9) continue;
      if ([0, 45, 90, 135, 180, 225, 270].some(a => Math.abs(((bb - a + 540) % 360) - 180) < (130 / r) * 57.3 + 3)) continue;
      const p = at(bb, r);
      if (TOWERS.some(t => Math.hypot(t.x - p.x, t.z - p.z) < 420)) continue;
      const s = k * 7.7 + r;
      local(p.x, p.z, bb, th => {
        // (the plot's own ground: a paved apron, the lawn round it, a little path to the ring)
        bx(-36, -32, 72, 64, LAWN[3]);
        // (snow lying in patches on it, drifted along its back edge; the path to the ring trodden through)
        for (let x = -36; x < 36; x++) { const dh = 2 + Math.round(hash(s + x * 0.3) * 2); bx(x, -32, 1, dh, SNOW[x & 1 ? 4 : 3]); if (x & 1) bx(x, -32 + dh, 1, 1, SNOW[3]); }
        for (let k = 0; k < 3; k++) snowPatch(-26 + hash(s * 3 + k) * 52, -16 + hash(s * 5 + k) * 40, 5 + hash(s + k * 7) * 6, 3 + hash(s * 2 + k) * 4, s + k * 13);
        ln([0, 30, 0, 44], 3, SNOW[2]);
        ln([0, 30, 0, 44], 1.5, GRAVEL[4]);
        PLOTS[Math.floor(hash(s) * PLOTS.length)](th, s);
        for (const [x, y] of [[-34, -30], [34, -30], [-34, 30], [34, 30]]) treeTop(x, y, 3.4, hash(x + y + s) > 0.75 ? BLOSSOM : OAK, hash(x + y + s) > 0.75);
      });
    }
  }
  // (between the plots: little paths, beds and trees so there's no bare lawn)
  for (let i = 0; i < 950; i++) {
    if (i % 240 === 0) yield;
    const b = hash(i * 1.37) * 360, r = 2520 + hash(i * 2.71) * 2420, p = at(b, r);
    if (Math.abs(r - RAIL_R) < 40) continue;
    if (b > 360 + GLEN.a0 && b < 360 + GLEN.a1) continue;
    if (TOWERS.some(t => Math.hypot(t.x - p.x, t.z - p.z) < 240)) continue;
    if (b > 165 && b < 195 && r < 3150) continue;
    const t = hash(i * 3.9);
    if (t < 0.5) treeTop(U(p.x), V(p.z), 3 + hash(i) * 2.5, t < 0.1 ? BLOSSOM : t < 0.16 ? LILAC : OAK, t < 0.1);
    else if (t < 0.7) crowd(U(p.x), V(p.z), 5, 5, 7, i);
    else if (t < 0.85) bed(U(p.x), V(p.z), 8, 3, b * D2R, [FLOWERS[i % 8], FLOWERS[(i + 2) % 8]], i);
    else umbrella(U(p.x), V(p.z), 2.6, FLOWERS[i % 8], '#F4F0FA');
  }
}

/** The glen's forest from above: canopy on canopy (oaks, blossom, lilac, frosted pines and spire trees), the brook
 *  winding through it, clearings (a toadstool ring, the gingerbread cottage, the meadow's plywood rainbow, the mine's
 *  hill and its head frame, the dragon lair's fiberglass skull). */
function* glen(): Generator<void> {
  // (the brook first, under the canopy's edges)
  const brook: number[] = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40, b = GLEN.a0 + 6 + t * (GLEN.a1 - GLEN.a0 - 12), r = 3800 + Math.sin(t * 9) * 420; const p = at(b, r); brook.push(U(p.x), V(p.z)); }
  ln(brook, 6, MUD[2]); ln(brook, 4.5, WATER[2]); ln(brook, 2.5, WATER[3]);
  for (let k = 0; k < brook.length; k += 6) bx(brook[k], brook[k + 1], 1, 1, WATER[5]);
  // (clearings, kept clear of trees)
  const clear: [number, number, number][] = [];
  const meadow = at(-46, 3300), cottage = at(-70, 4000), mine = at(-22, 4300), lair = at(-80, 2900), ring = at(-30, 2800), bridge = at(-50, 3800 + Math.sin(((-50 - GLEN.a0 - 6) / (GLEN.a1 - GLEN.a0 - 12)) * 9) * 420);
  clear.push([meadow.x, meadow.z, 330], [cottage.x, cottage.z, 200], [mine.x, mine.z, 260], [lair.x, lair.z, 230], [ring.x, ring.z, 120]);
  // (the meadow: grass, flowers, the plywood rainbow on its cloud plinths, unicorn photo boards, guests)
  { const u = U(meadow.x), v = V(meadow.z), r = L(330); dsc(u, v, r, LAWN[4]); for (let k = 0; k < 400; k++) { const a = hash(k * 1.3) * 6.28, d = Math.sqrt(hash(k * 2.9)) * r; bx(u + Math.cos(a) * d, v + Math.sin(a) * d, 1, 1, k % 4 ? LAWN[5] : FLOWERS[k % 8]); }
    for (const [k, col] of ['#DC2626', '#FB923C', '#FDE047', '#4ADE80', '#60A5FA', '#A78BFA'].entries()) { g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(u, v + 10, 26 - k * 2, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    for (const sx of [-27, 27]) { dsc(u + sx, v + 10, 5, '#F4F4F5'); dsc(u + sx - 2, v + 8, 3, '#FFFFFF'); }
    crowd(u, v + 18, 30, 8, 40, 4.1); }
  // (the gingerbread cottage: an iced roof, a candy-cane chimney, sweets round it)
  { const u = U(cottage.x), v = V(cottage.z); dsc(u, v, L(200), MOSS[4]); roof(u, v, 18, 13, 0.4, ['#3A1A08', '#5E2E12', '#86461E', '#A8642E', '#C88446', '#E8AC6E'], { chimney: true, ridge: '#FFFFFF' }); for (let k = 0; k < 18; k += 2) { bx(u - 9 + k, v - 9, 1, 1, '#F472B6'); bx(u - 9 + k, v + 9, 1, 1, '#4ADE80'); } }
  // (the mine's hill: rock in steps, the head frame's shadow, rails, an ore cart)
  { const u = U(mine.x), v = V(mine.z); dsc(u + 3, v + 3, 30, SHADOW); for (let k = 0; k < 5; k++) dsc(u - k * 1.5, v - k * 1.5, 30 - k * 5, STONE[1 + k]); ln([u + 10, v + 30, u + 2, v + 10], 2, '#4A3420'); ln([u + 9, v + 30, u + 1, v + 10], 0.8, '#9AA2B8'); bx(u + 6, v + 22, 4, 3, '#1A1028'); bx(u + 6, v + 22, 4, 1, '#C084FC'); }
  // (the dragon lair: a fiberglass skull from above, ribs, foam gold)
  { const u = U(lair.x), v = V(lair.z); dsc(u, v, L(230), MOSS[3]); el(u + 2, v + 2, 14, 10, 0.3, SHADOW); el(u, v, 14, 10, 0.3, '#E8E0CC'); el(u - 2, v - 2, 9, 6, 0.3, '#FFFFF0'); for (const s of [-1, 1]) { dsc(u + s * 5, v - 2, 2.5, '#1A1028'); } for (let k = 0; k < 6; k++) ln([u - 12 + k * 5, v + 10, u - 14 + k * 5, v + 18], 1.5, '#E8E0CC'); for (let k = 0; k < 14; k++) bx(u - 8 + hash(k) * 16, v + 12 + hash(k * 2) * 8, 1, 1, '#F6D365'); }
  // (the toadstool ring)
  { const u = U(ring.x), v = V(ring.z); dsc(u, v, L(120), MOSS[4]); for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; dsc(u + Math.cos(a) * 10, v + Math.sin(a) * 10, 2, '#DC2626'); bx(u + Math.cos(a) * 10 - 1, v + Math.sin(a) * 10 - 1, 1, 1, '#FFFFFF'); } crowd(u, v, 6, 6, 8, 1.1); }
  // (the brook's footbridge)
  { local(bridge.x, bridge.z, -50, () => { bx(-3, -9, 6, 18, '#1A1028'); bx(-2, -9, 4, 18, DECK[3]); for (let y = -9; y < 9; y += 2) bx(-2, y, 4, 1, DECK[2]); }); }
  // (the canopy: thousands of trees, the big ones first, never in the clearings)
  for (let i = 0; i < 3400; i++) {
    if (i % 600 === 0) yield;
    const b = GLEN.a0 + 1 + hash(i * 2.7) * (GLEN.a1 - GLEN.a0 - 2), r = GLEN.r0 + 20 + hash(i * 1.3) * (WALL_R - 80 - GLEN.r0 - 20), p = at(b, r);
    if (clear.some(([x, z, rr]) => Math.hypot(p.x - x, p.z - z) < rr)) continue;
    if (Math.abs(r - RAIL_R) < 40) continue;
    const t = hash(i * 5.1), rr = 3 + hash(i * 3.3) * 6;
    if (t < 0.34) pineTop(U(p.x), V(p.z), rr * 0.8, FIR, hash(i * 7.7) > 0.4);
    else if (t < 0.46) treeTop(U(p.x), V(p.z), rr, BLOSSOM, true);
    else if (t < 0.54) treeTop(U(p.x), V(p.z), rr, LILAC, false);
    else treeTop(U(p.x), V(p.z), rr, OAK, hash(i * 9.3) > 0.85);
  }
  // (fairy lights strung in the canopy along the brook (lit after dark), lanterns at the clearings)
  for (let k = 0; k < brook.length; k += 2) lights.push([brook[k] + (hash(k) - 0.5) * 8, brook[k + 1] + (hash(k * 3) - 0.5) * 8, 1.6, k % 4 ? '#FFE9A8' : '#FFB0D8']);
  for (const [x, z, rr] of clear) for (let k = 0; k < 6; k++) { const a = k * 1.05; lamp(U(x) + Math.cos(a) * L(rr - 20), V(z) + Math.sin(a) * L(rr - 20)); }
}

/** The park railway's train and its station; the wall's pink shimmer. */
const railAndWall = () => {
  const cu = U(0), cv = V(0);
  // (the station (by Hogsmeat's side): a long platform canopy, guests waiting)
  local(at(205, RAIL_R).x, at(205, RAIL_R).z, 205, () => { roof(0, -10, 60, 9, 0, PINK, { ridge: GOLD[4] }); bx(-30, -6, 60, 3, FLAG[4]); crowd(0, -4, 26, 1, 24, 3.7); roof(0, -24, 30, 14, 0, SLATE, { chimney: true, dormers: 3 }); });
  // (the FAIRY LAND EXPRESS on the rails: the engine and four coaches round the curve)
  for (let k = 0; k < 5; k++) {
    const b = 118 - k * 1.25, p = at(b, RAIL_R);
    local(p.x, p.z, b + 90, th => { const [sx, sy] = shOf(th, 2); bx(-9 + sx, -3 + sy, 18, 6, SHADOW); bx(-9, -3, 18, 6, '#1A1028'); bx(-8, -2, 16, 4, k ? ['#B91C1C', '#2E5AAE', '#2E8A5A', '#7A3AAA'][k - 1] : '#1A1A28'); bx(-8, -2, 16, 1, k ? '#F4F0FA' : '#4A4A5A'); if (!k) { dsc(5, 0, 1.5, '#2A2A38'); bx(-8, -2, 3, 4, GOLD[3]); } else for (let x = -6; x < 7; x += 3) bx(x, -1, 1, 1, '#FFE9A8'); });
  }
  // (THE MAGIC WALL's shimmer: pink rings either side of it, stepped out)
  g.save();
  for (const [r, w, a] of [[WALL_R + 26, 110, 0.12], [WALL_R + 26, 60, 0.16], [WALL_R + 26, 24, 0.22]] as const) { g.globalAlpha = a; g.strokeStyle = '#F9A8D4'; g.lineWidth = L(w); g.beginPath(); g.arc(cu, cv, L(r), 0, 6.283); g.stroke(); }
  g.globalAlpha = 0.5; g.strokeStyle = '#FFE4F2'; g.lineWidth = 1; g.beginPath(); g.arc(cu, cv, L(WALL_R + 26), 0, 6.283); g.stroke();
  g.restore();
  for (let k = 0; k < 360; k++) { const a = (k / 360) * 6.283, r = L(WALL_R + 26 + (hash(k) - 0.5) * 70); if (k % 3 === 0) bx(cu + Math.cos(a) * r, cv + Math.sin(a) * r, 1, 1, k % 2 ? '#FFE4F2' : '#FFF6C8'); }
  for (let k = 0; k < 120; k++) { const a = (k / 120) * 6.283; lights.push([cu + Math.cos(a) * L(WALL_R + 26), cv + Math.sin(a) * L(WALL_R + 26), 2, '#FFB0D8']); }
};

// ---------------------------------------------------------------------------------------------------------------
// The park beyond the wall (winter): the tile, and its landmarks

/** The tile: snowy ground with drifts, frosted pine woods, a winding path and a crossing one with guests, a few
 *  snowed-in cottages, a frozen pond. Repeats seamlessly (everything drawn wrapped). */
export const paintOutside = (gg: Ctx) => {
  g = gg;
  const img = g.createImageData(OS, OS), d = new Uint32Array(img.data.buffer), Sn = P(SNOW);
  for (let j = 0; j < OS; j++) for (let i = 0; i < OS; i++) {
    const n = hh(i, j), lo = hh(i >> 4, j >> 4), drift = Math.sin((i + j * 0.6) * 0.05 + Math.sin(j * 0.03) * 2);
    let c = drift > 0.6 ? 4 : drift > -0.4 ? 3 : 2;
    if (lo < 0.2) c--; if (n < 0.05) c--; else if (n > 0.97) c++;
    d[j * OS + i] = Sn[Math.max(0, Math.min(5, c))];
  }
  g.putImageData(img, 0, 0);
  const wrap = (fn: (ox: number, oy: number) => void) => { for (const ox of [-OS, 0, OS]) for (const oy of [-OS, 0, OS]) fn(ox, oy); };
  // (the paths: one winding across, one down; trodden snow, guests)
  const path = (pts: number[]) => { ln(pts, 7, SNOW[2]); ln(pts, 5, '#B8B2C2'); ln(pts, 2, '#CAC4D2'); };
  wrap((ox, oy) => {
    const a: number[] = [], b: number[] = [];
    for (let k = 0; k <= 32; k++) { const t = k / 32; a.push(ox + t * OS, oy + 300 + Math.sin(t * 6.283 * 2) * 40); b.push(ox + 140 + Math.sin(t * 6.283) * 50, oy + t * OS); }
    path(a); path(b);
  });
  seed = 4242;
  for (let i = 0; i < 160; i++) { const t = rnd(); const u = t * OS, v = 300 + Math.sin(t * 6.283 * 2) * 40 + (rnd() - 0.5) * 4; wrap((ox, oy) => person(u + ox, v + oy, i)); }
  for (let i = 0; i < 100; i++) { const t = rnd(); const v = t * OS, u = 140 + Math.sin(t * 6.283) * 50 + (rnd() - 0.5) * 4; wrap((ox, oy) => person(u + ox, v + oy, i + 400)); }
  // (the frozen pond)
  wrap((ox, oy) => { el(ox + 380, oy + 120, 46, 28, 0.3, SNOW[1]); el(ox + 380, oy + 120, 44, 26, 0.3, ICE[2]); el(ox + 376, oy + 116, 30, 16, 0.3, ICE[3]); for (let k = 0; k < 8; k++) ln([ox + 350 + k * 7, oy + 110 + (k % 3) * 6, ox + 360 + k * 7, oy + 118 + (k % 2) * 5], 0.7, ICE[5]); });
  for (let i = 0; i < 18; i++) { const u = 350 + rnd() * 60, v = 105 + rnd() * 30; wrap((ox, oy) => person(u + ox, v + oy, i * 9)); }
  // (snowed-in cottages, chimneys smoking)
  for (const [u, v, w, h, th] of [[60, 80, 18, 12, 0.3], [90, 110, 14, 10, -0.4], [430, 420, 20, 13, 0.1], [260, 200, 16, 11, 1.2], [300, 460, 16, 12, -0.8]] as const) wrap((ox, oy) => { roof(u + ox, v + oy, w, h, th, SLATE, { snow: true, chimney: true }); lights.push([u + ox + 2, v + oy + h / 2 + 2, 1.6, '#FFD88A']); });
  // (frosted pine woods, in clumps, never on the paths)
  for (let i = 0; i < 900; i++) {
    const cl = Math.floor(rnd() * 9), cx = [40, 230, 320, 470, 200, 90, 400, 260, 30][cl], cy = [180, 60, 380, 240, 470, 420, 20, 300, 330][cl];
    const u = (cx + (rnd() - 0.5) * 140 + OS) % OS, v = (cy + (rnd() - 0.5) * 120 + OS) % OS, r = 2.5 + rnd() * 4;
    const pv = 300 + Math.sin((u / OS) * 6.283 * 2) * 40, pu = 140 + Math.sin((v / OS) * 6.283) * 50;
    if (Math.abs(v - pv) < 10 || Math.abs(u - pu) < 10) continue;
    if (Math.hypot(u - 380, v - 120) < 52) continue;
    wrap((ox, oy) => { if (u + ox > -10 && u + ox < OS + 10 && v + oy > -10 && v + oy < OS + 10) pineTop(u + ox, v + oy, r, FIR, true); });
  }
};

const beyond = () => {
  // THE FROZEN LAKE (north): ice in bands, skate trails, skaters, a warming hut
  { const u = U(-400), v = V(5800); el(u + 3, v + 3, L(1520), L(400), 0, SHADOW); el(u, v, L(1520), L(400), 0, SNOW[1]); el(u, v, L(1500), L(380), 0, ICE[2]); el(u - 6, v - 4, L(1200), L(280), 0, ICE[3]); el(u - 14, v - 8, L(700), L(150), 0, ICE[4]);
    for (let k = 0; k < 30; k++) { const a = hash(k) * 6.28, r1 = 20 + hash(k * 2) * 160; g.strokeStyle = ICE[5]; g.lineWidth = 0.7; g.beginPath(); g.ellipse(u + Math.cos(a) * r1 * 0.5, v + Math.sin(a) * 20, 10 + hash(k * 3) * 30, 4 + hash(k * 4) * 8, hash(k * 5), 0, 4); g.stroke(); }
    crowd(u, v, L(1300), L(300), 220, 5.8);
    roof(u + L(1350), v - L(150), 14, 10, 0.2, BRICK, { snow: true, chimney: true }); }
  // HOGSMEAT (south-west): crooked snowy roofs along crooked streets, chimneys, the steeple and its church, the clock tower
  { seed = 1999;
    for (let i = 0; i < 220; i++) {
      const a = 196 + rnd() * 52, r = 5200 + rnd() * 1000, p = at(a, r), w = 12 + rnd() * 16, h = 8 + rnd() * 8;
      roof(U(p.x), V(p.z), w, h, (a + 90) * D2R + (rnd() - 0.5) * 0.5, rnd() < 0.2 ? BRICK : SLATE, { snow: true, chimney: rnd() < 0.7 });
      if (rnd() < 0.5) lights.push([U(p.x) + (rnd() - 0.5) * w, V(p.z) + (rnd() - 0.5) * h, 1.5, '#FFD88A']);
    }
    for (let i = 0; i < 6; i++) { const pts: number[] = []; for (let k = 0; k <= 10; k++) { const p = at(196 + k * 5.2, 5250 + i * 170 + Math.sin(k + i) * 40); pts.push(U(p.x), V(p.z)); } ln(pts, 2, '#B8B2C2'); }
    for (let i = 0; i < 160; i++) { const p = at(196 + rnd() * 52, 5250 + Math.floor(rnd() * 6) * 170); person(U(p.x), V(p.z), i); }
    const ch = at(222, 5650); roof(U(ch.x), V(ch.z), 34, 14, (222 + 90) * D2R, SLATE, { snow: true, ridge: GOLD[4] }); coneTop(U(ch.x) - 18, V(ch.z) - 4, 6, SLATE, '#F472B6');
    const ct = at(208, 5900); bx(U(ct.x) - 5 + 3, V(ct.z) - 5 + 3, 10, 10, SHADOW); bx(U(ct.x) - 5, V(ct.z) - 5, 10, 10, '#1A1028'); pl([U(ct.x) - 4, V(ct.z) - 4, U(ct.x) + 4, V(ct.z) - 4, U(ct.x), V(ct.z)], SNOW[5]); pl([U(ct.x) + 4, V(ct.z) - 4, U(ct.x) + 4, V(ct.z) + 4, U(ct.x), V(ct.z)], SNOW[3]); pl([U(ct.x) - 4, V(ct.z) + 4, U(ct.x) + 4, V(ct.z) + 4, U(ct.x), V(ct.z)], SNOW[2]); pl([U(ct.x) - 4, V(ct.z) - 4, U(ct.x) - 4, V(ct.z) + 4, U(ct.x), V(ct.z)], SNOW[4]);
  }
  // TRUELLING TRAGONS (east): three tracks (never crossing) on their supports, their loops from above, the fake mountain,
  // the station, the lagoon
  { const cols = ['#FACC15', '#EF4444', '#60A5FA'];
    el(U(6100), V(500), L(500), L(300), 0.4, WATER[2]); el(U(6080), V(520), L(380), L(200), 0.4, WATER[3]);
    for (let k = 0; k < 6; k++) dsc(U(5700) + k * 3 - 6, V(-200) - k * 3 + 6, L(420) - k * 9, STONE[k]);
    pl([U(5700) - 4, V(-200) - L(420) + 6, U(5700) + 8, V(-200) - L(200), U(5700) - 10, V(-200) - L(180)], SNOW[5]);
    cols.forEach((col, k) => {
      const pts: number[] = [];
      for (let s = 0; s <= 80; s++) { const z = -1400 + s * 45, x = 5480 + k * 190 + Math.sin(s * 0.22 + k) * 150; pts.push(U(x), V(z)); }
      const sh = pts.map((p, i) => p + (i % 2 ? 4 : 4));
      ln(sh, 3, SHADOW); ln(pts, 3.4, '#1A1028'); ln(pts, 2.2, '#C8C6D6'); ln(pts, 1, col);
      for (let s = 0; s < pts.length; s += 8) { bx(pts[s] + 3, pts[s + 1] + 3, 2, 2, '#4A4658'); }
      for (const zz of [-600, 600, 1500]) { const x = 5480 + k * 190, u = U(x), v = V(zz + k * 120); g.strokeStyle = '#1A1028'; g.lineWidth = 3; g.beginPath(); g.ellipse(u, v, 9, 4, 0, 0, 6.283); g.stroke(); g.strokeStyle = col; g.lineWidth = 1.4; g.stroke(); }
    });
    roof(U(5600), V(-1500), 40, 16, 0, ROOF, { snow: true, dormers: 4 }); crowd(U(5600), V(-1500) + 14, 20, 4, 30, 6.1); }
  // THE FAIRY WHEEL (south-east): its rim edge-on from above (a long bar with gondolas), the A-frame's legs, its long
  // shadow over its plaza, queues
  { const u = U(4300), v = V(-4400); dsc(u, v, L(420), FLAG[3]); for (let k = 0; k < 5; k++) { g.strokeStyle = FLAG[2]; g.lineWidth = 1; g.beginPath(); g.arc(u, v, L(100 + k * 70), 0, 6.283); g.stroke(); }
    g.save(); g.globalAlpha = 0.35; fill('#0A0618'); g.beginPath(); g.ellipse(u + L(500), v + L(300), L(560), L(40), 0.5, 0, 6.283); g.fill(); g.restore();
    bx(u - L(560), v - 4, L(1120), 8, '#1A1028'); bx(u - L(556), v - 3, L(1112), 6, '#E8A8D8'); bx(u - L(556), v - 3, L(1112), 1, '#FFD0EC');
    for (let k = 0; k < 16; k++) { const x = u - L(540) + (k * L(1080)) / 15; bx(x - 2, v - 5, 4, 10, '#1A1028'); bx(x - 1.5, v - 4.5, 3, 9, ['#F472B6', '#FDE047', '#60A5FA', '#4ADE80', '#A78BFA'][k % 5]); }
    for (const s of [-1, 1]) ln([u - 6, v + s * 22, u, v, u + 6, v + s * 22], 2, '#5A4E7A');
    dsc(u, v, 4, GOLD[3]); crowd(u, v + 30, 40, 10, 70, 4.3); crowd(u - 50, v, 10, 30, 40, 4.4); }
  // RAPUNZEL'S TOWER (north-east), THE BEANSTALK (south-east), A WINDMILL (north)
  { const p = at(48, 5700), u = U(p.x), v = V(p.z); g.save(); g.globalAlpha = 0.3; fill('#0A0618'); g.beginPath(); g.ellipse(u + 40, v + 40, 46, 8, Math.PI / 4, 0, 6.283); g.fill(); g.restore(); coneTop(u, v, 12, PINK, '#FDE047'); ln([u + 8, v, u + 20, v + 30, u + 16, v + 50], 2, '#F6D365'); }
  { const p = at(150, 5600), u = U(p.x), v = V(p.z); for (let k = 0; k < 40; k++) { const a = k * 0.5, r = 2 + k * 0.4; dsc(u + Math.cos(a) * r, v + Math.sin(a) * r, 3.4 - k * 0.04, k % 2 ? OAK[3] : OAK[4]); } el(u + 6, v - 6, 26, 18, 0.2, 'rgba(255,255,255,0.75)'); el(u + 2, v - 10, 18, 12, 0.2, '#FFFFFF'); }
  { const p = at(14, 5550), u = U(p.x), v = V(p.z); roof(u, v, 10, 10, 0, THATCH, { hip: true, snow: true }); for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.4; ln([u, v, u + Math.cos(a) * 18, v + Math.sin(a) * 18], 2.4, '#1A1028'); ln([u, v, u + Math.cos(a) * 18, v + Math.sin(a) * 18], 1.2, DECK[4]); } }
};

// ---------------------------------------------------------------------------------------------------------------

/** Paints the whole texture onto `gg` (TS square) for the hour: the park beyond's tile under it all, the base a texel at
 *  a time, everything on it, the hour's light multiplied over, then the lamps glowing after dark. */
export function* paintGroundSteps(gg: Ctx, tile: HTMLCanvasElement, tod: TimeOfDay): Generator<void> {
  const mine: typeof lights = [];
  // (between steps something else may have painted with this module (the park beyond's tile): take it back)
  const back = () => { g = gg; lights = mine; };
  back(); seed = 1; frost = false;
  g.imageSmoothingEnabled = false;
  g.fillStyle = g.createPattern(tile, 'repeat')!; g.fillRect(0, 0, TS, TS);
  const img = g.getImageData(0, 0, TS, TS);
  yield; back();
  for (const _ of paintBase(img)) { yield; back(); }
  g.putImageData(img, 0, 0);
  yield; back();
  beyond();
  yield; back(); frost = true;
  railAndWall();
  frost = false;
  for (const _ of glen()) { yield; back(); }
  frost = true;
  for (const _ of lands()) { yield; back(); frost = true; }
  towerPlazas();
  yield; back(); frost = true;
  gardens();
  yield; back(); frost = true;
  port();
  moatAndPaths();
  yield; back(); frost = true;
  castleTop();
  frost = false;
  if (tod.mul && tod.mul.toUpperCase() !== '#FFFFFF') { g.globalCompositeOperation = 'multiply'; g.fillStyle = tod.mul; g.fillRect(0, 0, TS, TS); g.globalCompositeOperation = 'source-over'; }
  if (tod.lamps > 0.3) {
    for (const [u, v, r, col] of lights) { g.globalAlpha = 0.25 * tod.lamps; dsc(u, v, r * 1.6, col); g.globalAlpha = 1; bx(u - 0.5, v - 0.5, 1, 1, col); }
  }
}
/** The whole texture in one go (paintGroundSteps straight through). */
export const paintGround = (gg: Ctx, tile: HTMLCanvasElement, tod: TimeOfDay) => { const it = paintGroundSteps(gg, tile, tod); while (!it.next().done); };

/** The outside tile's own copy for the hour (multiplied by its light). */
export const outsideFor = (tod: TimeOfDay) => {
  const cv = document.createElement('canvas'); cv.width = OS; cv.height = OS;
  const gg = cv.getContext('2d', { willReadFrequently: true })!;
  gg.imageSmoothingEnabled = false;
  const keep = lights; lights = [];
  paintOutside(gg);
  if (tod.mul && tod.mul.toUpperCase() !== '#FFFFFF') { gg.globalCompositeOperation = 'multiply'; gg.fillStyle = tod.mul; gg.fillRect(0, 0, OS, OS); gg.globalCompositeOperation = 'source-over'; }
  if (tod.lamps > 0.3) for (const [u, v, r, col] of lights) { gg.globalAlpha = 0.25 * tod.lamps; gg.fillStyle = col; gg.beginPath(); gg.arc(u, v, r * 1.6, 0, 6.283); gg.fill(); gg.globalAlpha = 1; gg.fillRect(Math.round(u), Math.round(v), 1, 1); }
  lights = keep;
  return cv;
};
/** The tile unlit (the base the whole texture's painted over, before the hour's light goes on it). */
export const outsideRaw = () => {
  const cv = document.createElement('canvas'); cv.width = OS; cv.height = OS;
  const gg = cv.getContext('2d')!;
  gg.imageSmoothingEnabled = false;
  const keep = lights; lights = [];
  paintOutside(gg);
  lights = keep;
  return cv;
};
