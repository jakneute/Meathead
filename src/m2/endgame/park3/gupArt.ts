// GUPPLAX, drawn (the wave pool's boss: full detail even in the first pass, like the other water park bosses). An
// alien lifeguard, the alien widow's son, ZORZARBLAX's big brother: a bloated pear of translucent green flesh in steps (the light through
// it, the guts dimly showing), six nipples in two rows down his gut, rolls, a big head too heavy for the neck, four
// eyes (two on veiny stalks waving, two sunk in the face), gills on the neck flapping, a fat nose striped with zinc,
// buck teeth with gaps, a whistle on a lanyard he's always got in his mouth; red lifeguard trunks two sizes small
// (GUARD across the seat); flabby arms, webbed hands; stubby legs, webbed feet. Every elbow and knee from art/limb.ts.
//
// Origin: his waist (the trunks' waistband, middle), facing right; in the water that's at the surface. Poses below
// (SpriteKind): stamped per pose and frame.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { RENDER_SCALE } from '../../../m1/constants';
import { mix } from '../../intro/art/kit';
import { checker } from '../../../m1/game/render/pixelArt';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const INK = '#06100A';
/** His flesh, darkest first (translucent green: the light comes through at the edges). */
export const FLESH = ['#0E3A1E', '#1A5A2C', '#2A7E3C', '#3EA24E', '#62C46A', '#A6EAA0'];
const GUT = ['#3A5A1E', '#5A7A2A'];
const TRUNK = ['#5A0A0A', '#8A1414', '#C02020', '#E04A3A', '#F68A6A'];
const ell = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string, rot = 0, a0 = 0, a1 = Math.PI * 2) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, a0, a1); c.fill(); };
const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const line = (c: Ctx, pts: P[], w: number, col: string) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) c.lineTo(q[0], q[1]); c.stroke(); };
/** A blob in steps: inked, its body, lit up top-left, shaded under. */
const blob = (c: Ctx, x: number, y: number, rx: number, ry: number, L: string[], rot = 0) => {
  ell(c, x, y, rx + 2, ry + 2, INK, rot);
  ell(c, x, y, rx, ry, L[2], rot);
  ell(c, x + rx * 0.08, y + ry * 0.18, rx * 0.86, ry * 0.78, L[1], rot);
  ell(c, x - rx * 0.06, y - ry * 0.06, rx * 0.8, ry * 0.72, L[2], rot);
  ell(c, x - rx * 0.3, y - ry * 0.36, rx * 0.42, ry * 0.3, L[3], rot);
  ell(c, x - rx * 0.4, y - ry * 0.48, rx * 0.16, ry * 0.12, L[5], rot);
};

export type GupPose = 'idle' | 'swim' | 'whistle' | 'blow' | 'hork' | 'spit' | 'crouch' | 'leap' | 'flop' | 'dive' | 'breach' | 'hurt' | 'talk' | 'chair' | 'dead' | 'puffed' | 'skin'
  | 'glide' | 'ram' | 'bite' | 'sneeze' | 'slow';
export const GUP_POSES: GupPose[] = ['idle', 'swim', 'glide', 'ram', 'bite', 'sneeze', 'slow', 'whistle', 'blow', 'hork', 'spit', 'crouch', 'leap', 'flop', 'dive', 'breach', 'hurt', 'talk', 'chair', 'dead', 'puffed', 'skin'];
/** `arm`: the chlorine tanks burst so far (0: full armor, no hives ... 5: the armor all popped off him, swollen up with
 *  hives, his eyes puffed shut: the sitting duck). */
export interface GupLook { pose: GupPose; q: number; mouth?: boolean; crushed?: boolean; arm?: number }
/** His armor (scrap off the pool: a drain grate beaten into a breastplate, a stockpot of a helmet, a pauldron off a
 *  ladder's handrail), in steps; it goes green and pitted as the chlorine gets in. */
const STEEL = ['#1E242C', '#3A4450', '#5E6A78', '#8A96A4', '#BAC6D2', '#E8EEF4'];
const steelAt = (a: number) => STEEL.map(col => mix(col, '#4A7A2A', Math.min(0.45, a * 0.1)));
const HIVE = ['#7A1A2A', '#C8384A', '#F07A8A'];
/** Where the hives come up (body coords), in the order they do. */
const HIVES: P[] = [[-20, -40], [30, -20], [-34, -8], [12, -52], [40, -40], [-8, -24], [22, -14], [-40, -30], [0, -60], [30, -58], [-26, -20], [16, -34], [-12, -48], [44, -24], [-44, -16], [6, -44], [28, -50], [-30, -52], [38, -30], [-4, -12]];

export const paintGup = (c: Ctx, L: GupLook, face: 1 | -1 = 1) => {
  const { pose, q } = L, ph = (q / 8) * Math.PI * 2, A = L.arm ?? 0, ST = steelAt(A);
  if (pose === 'skin') return paintSkin(c, q);
  if (pose === 'dead' || pose === 'puffed') return paintDead(c, pose === 'puffed', q, L.arm ?? 0);
  const puff = pose === 'blow' ? 1 : pose === 'whistle' ? 0.6 : 0;
  // ---- the skeleton (where the head, the hands and the feet go)
  let headY = -80, headX = 6, bodyTilt = 0, sq = 1;
  let hN: P = [46, -12], hF: P = [-40, -10], fN: P = [20, 62], fF: P = [-18, 62];
  switch (pose) {
    case 'swim': hN = [54, -4 + Math.sin(ph) * 14]; hF = [-48, -4 - Math.sin(ph) * 14]; fN = [24, 58 + Math.sin(ph) * 6]; fF = [-22, 58 - Math.sin(ph) * 6]; break;
    case 'whistle': hN = [30, -86]; hF = [-44, -20]; headY = -84; break;
    case 'blow': hN = [28, -88]; hF = [-56, -60]; headY = -86; break;
    case 'hork': hN = [40, -40]; hF = [-34, -8]; headY = -74; headX = 0; bodyTilt = -0.08; break;
    case 'spit': hN = [52, -26]; hF = [-46, -30]; headY = -82; headX = 14; bodyTilt = 0.1; break;
    case 'crouch': hN = [40, -96]; hF = [-40, -96]; headY = -70; sq = 0.86; fN = [26, 44]; fF = [-24, 44]; break;
    case 'leap': hN = [70, -60]; hF = [-70, -60]; fN = [40, 52]; fF = [-38, 52]; break;
    case 'flop': hN = [74, -8]; hF = [-74, -8]; fN = [50, 30]; fF = [-48, 30]; headY = -74; sq = 0.82; break;
    case 'dive': hN = [60, -110]; hF = [44, -116]; headY = -60; headX = 30; bodyTilt = 0.55; break;
    case 'breach': hN = [56, -120]; hF = [-40, -124]; headY = -88; break;
    case 'hurt': hN = [20, -70]; hF = [-50, -40]; headX = -6; bodyTilt = -0.14; break;
    case 'chair': hN = [44, -20]; hF = [-38, -24]; fN = [36, 40]; fF = [16, 44]; break;
    // (flat out, swimming: rolled forward onto his front, arms out ahead, the feet kicking)
    case 'glide': hN = [44 + Math.sin(ph) * 8, -110]; hF = [22 - Math.sin(ph) * 8, -114]; fN = [26, 58 + Math.sin(ph) * 12]; fF = [-18, 58 - Math.sin(ph) * 12]; bodyTilt = 1.2; break;
    // (the ram: flat out, head first, jaws open, arms swept back along him)
    case 'ram': hN = [44, 26]; hF = [-30, 30]; fN = [12, 62]; fF = [-4, 62]; bodyTilt = 1.3; headX = 10; break;
    // (the chomp: leaning in, arms out to grab, jaws wide)
    case 'bite': hN = [72, -66]; hF = [58, -84]; headX = 14; bodyTilt = 0.45; break;
    // (the sneeze: head thrown forward, arms flung, everything screwed shut)
    case 'sneeze': hN = [56, -30]; hF = [-60, -44]; headX = 16; headY = -76; bodyTilt = 0.22; break;
    // (the sitting duck: slumped, swollen, arms hanging, wheezing)
    case 'slow': hN = [50, 14]; hF = [-44, 16]; fN = [24, 58]; fF = [-20, 60]; headY = -72; headX = 6; sq = 0.94; bodyTilt = 0.08; break;
    default: hN = [46, -12 + Math.sin(ph) * 3]; hF = [-40, -10 - Math.sin(ph) * 3]; break;
  }
  c.save(); c.rotate(bodyTilt); c.scale(1, sq);
  const sN: P = [34, -50], sF: P = [-30, -50];
  // ---- the far arm and leg (darker)
  const arm = (s: P, h: P, near: boolean) => {
    const e = elbow(s[0], s[1], h[0], h[1], 28, 26, 1), end = reachTo(s[0], s[1], h[0], h[1], 28, 26);
    const col = near ? FLESH[2] : FLESH[1];
    line(c, [s, e, end], 17, INK); line(c, [s, e, end], 14, col); line(c, [[s[0] - 2, s[1] - 2], [e[0] - 2, e[1] - 2]], 4, near ? FLESH[3] : FLESH[2]);
    // (the flab hanging off the upper arm)
    ell(c, (s[0] + e[0]) / 2, (s[1] + e[1]) / 2 + 7, 8, 6, col);
    // (the hand: webbed, four fat fingers)
    ell(c, end[0], end[1], 9, 8, INK); ell(c, end[0], end[1], 7.5, 6.5, near ? FLESH[3] : FLESH[2]);
    for (let k = 0; k < 4; k++) { const a = -0.9 + k * 0.6; ell(c, end[0] + Math.cos(a) * 8, end[1] + Math.sin(a) * 8, 3, 2.4, near ? FLESH[3] : FLESH[2], a); }
    c.globalAlpha = 0.5; ell(c, end[0] + 5, end[1], 6, 5, FLESH[4]); c.globalAlpha = 1;
    return end;
  };
  const leg = (hip: P, f: P, near: boolean) => {
    const k = knee(hip[0], hip[1], f[0], f[1], 26, 24, 1), end = reachTo(hip[0], hip[1], f[0], f[1], 26, 24);
    const col = near ? FLESH[2] : FLESH[1];
    line(c, [hip, k, end], 19, INK); line(c, [hip, k, end], 16, col);
    // (the foot: webbed, flat, splayed)
    c.fillStyle = INK; c.beginPath(); c.moveTo(end[0] - 8, end[1] - 4); c.lineTo(end[0] + 22, end[1] + 2); c.lineTo(end[0] + 20, end[1] + 8); c.lineTo(end[0] - 8, end[1] + 6); c.closePath(); c.fill();
    c.fillStyle = near ? FLESH[3] : FLESH[2]; c.beginPath(); c.moveTo(end[0] - 6, end[1] - 2); c.lineTo(end[0] + 19, end[1] + 3); c.lineTo(end[0] + 17, end[1] + 6); c.lineTo(end[0] - 6, end[1] + 4); c.closePath(); c.fill();
  };
  arm(sF, hF, false);
  leg([-18, 14], fF, false);
  // ---- the body: the pear of him, his rolls, the guts dimly through, the six nipples, a navel
  blob(c, 0, -14, 54, 50, FLESH);
  c.globalAlpha = 0.35; ell(c, 6, -8, 26, 20, GUT[0]); ell(c, -8, 4, 16, 10, GUT[1]); line(c, [[-14, -2], [4, 8], [16, -4], [8, -16]], 4, GUT[1]); c.globalAlpha = 1;
  for (const y of [-34, 2]) { c.strokeStyle = FLESH[1]; c.lineWidth = 2; c.beginPath(); c.ellipse(4, y, 44, 6, 0, 0.2, Math.PI - 0.2); c.stroke(); }
  for (let r = 0; r < 3; r++) for (const sx of [-1, 1]) { const nx = 10 + sx * 18 - r * 2, ny = -38 + r * 14; ell(c, nx, ny, 3.6, 3, INK); ell(c, nx, ny, 2.6, 2.2, '#7A4A6A'); rect(c, nx - 1, ny - 1, 1, 1, '#D8A8C8'); }
  ell(c, 8, 4, 3, 2, INK);
  checker(c, -40, -10, 18, 20, FLESH[1], 0, 2);
  // ---- the trunks: two sizes small, red, a white stripe down the side, GUARD across the seat
  c.fillStyle = INK; c.beginPath(); c.moveTo(-46, -4); c.lineTo(48, -4); c.lineTo(42, 22); c.lineTo(8, 26); c.lineTo(-6, 26); c.lineTo(-40, 22); c.closePath(); c.fill();
  c.fillStyle = TRUNK[2]; c.beginPath(); c.moveTo(-44, -2); c.lineTo(46, -2); c.lineTo(40, 20); c.lineTo(8, 24); c.lineTo(-6, 24); c.lineTo(-38, 20); c.closePath(); c.fill();
  rect(c, -44, -2, 90, 4, TRUNK[3]); rect(c, -44, -2, 90, 1, TRUNK[4]); rect(c, -30, 10, 70, 4, TRUNK[1]);
  rect(c, 26, 0, 4, 20, '#F1EFEA');
  // (the letters the right way round whichever way he faces)
  c.save(); c.translate(-2, 10); c.scale(face, 1); c.font = '7px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#F1EFEA'; c.fillText('GUARD', 0, 4); c.textAlign = 'left'; c.restore();
  // (his gut hanging over the waistband)
  c.fillStyle = FLESH[2]; c.beginPath(); c.ellipse(4, -6, 46, 9, 0, Math.PI, 0); c.fill();
  // ---- the hives (the chlorine: more with every tank)
  for (let i = 0; i < Math.min(HIVES.length, A * 4); i++) { const [x, y] = HIVES[i]; ell(c, x, y, 5, 4, HIVE[0]); ell(c, x, y - 0.5, 4, 3, HIVE[1]); ell(c, x - 1, y - 1.5, 1.6, 1.2, HIVE[2]); }
  // ---- the breastplate (a drain grate beaten round him, strapped on); askew on one strap at 4 tanks; gone at 5
  if (A < 5) {
    c.save();
    if (A >= 4) { c.translate(-30, -58); c.rotate(-0.5); c.translate(30, 58); }
    c.fillStyle = INK; c.beginPath(); c.moveTo(-46, -58); c.quadraticCurveTo(2, -72, 48, -58); c.lineTo(46, -10); c.quadraticCurveTo(2, 2, -44, -10); c.closePath(); c.fill();
    for (let k = 0; k < 5; k++) { c.fillStyle = ST[[2, 4, 3, 2, 1][k]]; c.beginPath(); const y0 = -64 + k * 11; c.moveTo(-43, y0 + 6); c.quadraticCurveTo(2, y0 - 6, 45, y0 + 6); c.lineTo(45, y0 + 17); c.quadraticCurveTo(2, y0 + 5, -43, y0 + 17); c.closePath(); c.fill(); }
    c.fillStyle = ST[5]; c.fillRect(-36, -58, 20, 2);
    // (the grate's slots, the rivets)
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { rect(c, -30 + k * 14, -48 + r * 12, 9, 4, INK); rect(c, -30 + k * 14, -48 + r * 12, 9, 1, ST[0]); }
    for (const [x, y] of [[-40, -54], [42, -54], [-40, -16], [42, -16], [2, -62]] as P[]) { rect(c, x - 2, y - 2, 4, 4, INK); rect(c, x - 1, y - 1, 2, 2, ST[5]); }
    // (the chlorine eating it: green pits, fizzing)
    for (let i = 0; i < A * 3; i++) { const x = -34 + ((i * 29) % 72), y = -52 + ((i * 17) % 38); ell(c, x, y, 3, 2.4, '#3A6A1A'); rect(c, x - 1, y - 1, 1, 1, '#B8F070'); }
    // (the straps)
    line(c, [[-40, -56], [-26, -76]], 5, INK); line(c, [[-40, -56], [-26, -76]], 3, '#5A3A1A');
    if (A < 4) { line(c, [[42, -56], [30, -76]], 5, INK); line(c, [[42, -56], [30, -76]], 3, '#5A3A1A'); }
    c.restore();
  } else { line(c, [[-40, -56], [-30, -40], [-36, -24]], 4, INK); line(c, [[-40, -56], [-30, -40], [-36, -24]], 2, '#5A3A1A'); }
  leg([16, 14], fN, true);
  // ---- the head: too big, on a fat neck with gills
  const hx = headX, hy = headY;
  ell(c, hx - 4, hy + 30, 26, 16, INK); ell(c, hx - 4, hy + 30, 24, 14, FLESH[2]);
  for (let k = 0; k < 3; k++) { const fl = Math.sin(ph * 2 + k) * 1.5; c.strokeStyle = FLESH[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(hx - 22 + k * 5, hy + 22 + fl); c.lineTo(hx - 18 + k * 5, hy + 38 + fl); c.stroke(); c.strokeStyle = '#C04A6A'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - 21 + k * 5, hy + 24 + fl); c.lineTo(hx - 17 + k * 5, hy + 36 + fl); c.stroke(); }
  blob(c, hx, hy, 44 + puff * 6, 36 + puff * 3, FLESH);
  // (the double chin sagging off it; sweat beading; a wart with a hair in it)
  ell(c, hx + 8, hy + 30, 30, 10, INK); ell(c, hx + 8, hy + 29, 28, 8, FLESH[2]); ell(c, hx + 2, hy + 27, 18, 4, FLESH[3]);
  for (const [sx, sy] of [[-20, -18], [-30, 4], [14, -26], [-6, -30]] as P[]) { ell(c, hx + sx, hy + sy, 2.4, 3, '#E0FFE8'); rect(c, hx + sx - 1, hy + sy - 2, 1, 1, '#FFFFFF'); }
  ell(c, hx - 24, hy - 8, 3.5, 3, FLESH[1]); line(c, [[hx - 24, hy - 10], [hx - 27, hy - 17]], 1, INK);
  // (the cheeks, ballooned when he blows)
  if (puff > 0) { blob(c, hx + 24, hy + 10, 14 + puff * 10, 11 + puff * 8, FLESH); }
  // (the hives on his face; the helmet: a stockpot riveted round, holes for his stalks; dented at 2, split at 3, gone at 4)
  for (let i = 0; i < Math.min(6, A * 2); i++) { const x = hx - 30 + ((i * 23) % 56), y = hy - 14 + ((i * 13) % 26); ell(c, x, y, 4.5, 3.5, HIVE[0]); ell(c, x, y - 0.5, 3.5, 2.6, HIVE[1]); }
  if (A < 4) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx, hy - 12, 44, 30, 0, Math.PI, 0); c.closePath(); c.fill();
    for (let k = 0; k < 4; k++) { c.fillStyle = ST[[1, 2, 3, 4][k]]; c.beginPath(); c.ellipse(hx - k * 3, hy - 13 - k * 2, 42 - k * 9, 28 - k * 6, 0, Math.PI, 0); c.closePath(); c.fill(); }
    rect(c, hx - 46, hy - 16, 92, 8, INK); rect(c, hx - 45, hy - 15, 90, 6, ST[2]); rect(c, hx - 45, hy - 15, 90, 2, ST[4]);
    for (let k = 0; k < 7; k++) { rect(c, hx - 40 + k * 13, hy - 14, 3, 3, INK); rect(c, hx - 39 + k * 13, hy - 13, 1, 1, ST[5]); }
    // (the red cross painted on its side, flaking)
    rect(c, hx - 26, hy - 34, 12, 4, '#A01A1A'); rect(c, hx - 22, hy - 38, 4, 12, '#A01A1A');
    for (const sx of [-8, 12]) { ell(c, hx + sx, hy - 28, 7, 5, INK); }
    if (A >= 2) { c.fillStyle = ST[0]; c.beginPath(); c.ellipse(hx + 20, hy - 30, 9, 5, 0.4, 0, Math.PI * 2); c.fill(); rect(c, hx + 16, hy - 33, 6, 1, ST[4]); }
    if (A >= 3) line(c, [[hx - 4, hy - 40], [hx + 2, hy - 30], [hx - 2, hy - 22], [hx + 4, hy - 14]], 2, INK);
    for (let i = 0; i < A * 2; i++) { const x = hx - 34 + ((i * 19) % 64); ell(c, x, hy - 22 + (i % 3) * 3, 2.6, 2, '#3A6A1A'); }
  }
  // (the eyestalks: two, veiny, waving; the eyes on them yellow, slit-pupiled, bloodshot)
  for (const [k, sx] of [[0, -8], [1, 12]] as const) {
    const wave = Math.sin(ph + k * 2) * 6 + (pose === 'hurt' ? -8 : 0) + (pose === 'sneeze' ? -14 : 0) + (pose === 'ram' ? -10 : 0) + (pose === 'slow' ? (k ? 16 : -16) : 0);
    const tip: P = [hx + sx + wave, hy - 52 - k * 6 + (pose === 'blow' ? -8 : 0) + (pose === 'slow' ? 26 : 0) + (pose === 'sneeze' ? 8 : 0)];
    const shut = pose === 'sneeze' || (A >= 5 && k === 1);
    line(c, [[hx + sx, hy - 26], [hx + sx + wave * 0.5, hy - 40], tip], 8, INK); line(c, [[hx + sx, hy - 26], [hx + sx + wave * 0.5, hy - 40], tip], 5, FLESH[2]);
    line(c, [[hx + sx + 1, hy - 28], [tip[0] + 1, tip[1] + 6]], 1, '#C04A6A');
    ell(c, tip[0], tip[1], 10, 9, INK);
    if (shut) { ell(c, tip[0], tip[1], 8.5, 7.5, A >= 3 ? '#C85A6A' : FLESH[3]); line(c, [[tip[0] - 6, tip[1]], [tip[0] + 6, tip[1] + 1]], 2, INK); }
    else {
      ell(c, tip[0], tip[1], 8.5, 7.5, A >= 3 ? '#F0C080' : '#F4E86A'); ell(c, tip[0] - 2, tip[1] - 2, 3, 2, '#FFFBD0');
      line(c, [[tip[0] - 7, tip[1] + 2], [tip[0] - 3, tip[1] + 1]], 1, '#D03030'); line(c, [[tip[0] + 6, tip[1] - 3], [tip[0] + 3, tip[1] - 1]], 1, '#D03030');
      rect(c, tip[0] + 1, tip[1] - 5, 2, 9, INK);
      // (puffed up round it: the hives' swelling)
      if (A >= 3) { c.strokeStyle = HIVE[1]; c.lineWidth = 2; c.beginPath(); c.ellipse(tip[0], tip[1], 9, 8, 0, 0, Math.PI * 2); c.stroke(); }
    }
  }
  // (the two sunk in the face: little, mean, pink-rimmed)
  for (const ex of [10, 26]) {
    if (pose === 'sneeze' || A >= 4) { ell(c, hx + ex, hy - 4, 7, 5, A >= 3 ? HIVE[1] : FLESH[3]); line(c, [[hx + ex - 5, hy - 6], [hx + ex, hy - 3], [hx + ex + 5, hy - 6]], 1.5, INK); continue; }
    ell(c, hx + ex, hy - 4, 6, 5, INK); ell(c, hx + ex, hy - 4, 4.5, 3.5, '#F4E86A'); rect(c, hx + ex, hy - 6, 1.5, 4, INK); c.strokeStyle = '#D06080'; c.lineWidth = 1; c.beginPath(); c.ellipse(hx + ex, hy - 4, 6, 5, 0, 0, Math.PI * 2); c.stroke();
  }
  // (the nose: fat, a bulb, striped with zinc)
  ell(c, hx + 36, hy + 4, 11, 9, INK); ell(c, hx + 36, hy + 4, 9.5, 7.5, FLESH[3]); rect(c, hx + 30, hy, 13, 4, '#F8FAFC'); rect(c, hx + 31, hy + 4, 11, 2, '#E2E8F0');
  ell(c, hx + 40, hy + 9, 2, 1.5, INK);
  // (the mouth: buck teeth with gaps, the whistle in it (or not: open, spitting, talking), drool)
  const open = pose === 'spit' || pose === 'breach' || pose === 'ram' ? 14 : pose === 'bite' ? 18 : pose === 'sneeze' ? 12 : pose === 'slow' ? 8 : pose === 'hork' ? 4 : pose === 'hurt' ? 9 : L.mouth || pose === 'talk' ? 7 : 2;
  const mx = hx + 22, my = hy + 18;
  ell(c, mx, my + open / 2, 18, 4 + open / 2, INK);
  if (open > 3) { ell(c, mx, my + open / 2, 16, 2 + open / 2, '#4A0A1A'); ell(c, mx + 2, my + open - 2, 8, 3, '#C04A5A'); }
  for (const tx of [-8, -1, 8]) rect(c, mx + tx, my - 1, 5, 6, '#F0E6B8');
  rect(c, mx - 8, my + 4, 5, 1, '#A89A60'); rect(c, mx + 8, my + 4, 5, 1, '#A89A60');
  if (pose === 'breach' || pose === 'ram' || pose === 'bite') { for (let k = 0; k < 6; k++) rect(c, mx - 12 + k * 5, my + open - 4, 3, 5, '#F0E6B8'); }
  // (the sneeze's spray; the sitting duck's tongue lolling out)
  if (pose === 'sneeze') for (let k = 0; k < 7; k++) ell(c, mx + 22 + k * 6, my + 4 + Math.sin(k * 1.7) * 6, 3 - k * 0.3, 2.4 - k * 0.25, k % 2 ? '#C8F59A' : '#8AD050');
  if (pose === 'slow') { ell(c, mx + 4, my + open + 6, 6, 9, INK); ell(c, mx + 4, my + open + 5, 4.5, 7.5, '#C04A6A'); rect(c, mx + 3, my + open, 1, 9, '#7A1A3A'); }
  // (the throat's bulge, glowing, in the hork)
  if (pose === 'hork') { ell(c, hx - 2, hy + 32, 14, 10, INK); ell(c, hx - 2, hy + 32, 12, 8, '#8AF040'); ell(c, hx - 5, hy + 29, 4, 3, '#E0FFB0'); }
  // (the whistle: on its lanyard round the neck; in the mouth (whistle, blow, idle, swim, chair))
  const inMouth = pose === 'whistle' || pose === 'blow' || pose === 'idle' || pose === 'swim' || pose === 'chair' || pose === 'crouch';
  const wx = inMouth ? mx + 18 : hx + 16, wy = inMouth ? my + 2 : hy + 52;
  line(c, [[hx - 18, hy + 26], [hx, hy + 48], [wx - 4, wy]], 2, '#F8FAFC');
  rect(c, wx - 6, wy - 4, 14, 8, INK); rect(c, wx - 5, wy - 3, 12, 6, '#E8C020'); rect(c, wx - 5, wy - 3, 12, 2, '#FFF2A0'); rect(c, wx + 4, wy - 2, 2, 2, INK);
  if (pose !== 'blow' && pose !== 'whistle') { rect(c, mx - 12, my + 4 + open, 2, 6 + (q % 4), '#B8F0A0'); }
  arm(sN, hN, true);
  // (the pauldron on his near shoulder: three lames off a ladder's handrail; the first to go, at 2 tanks)
  if (A < 2) for (let k = 2; k >= 0; k--) { c.fillStyle = INK; c.beginPath(); c.ellipse(sN[0] + 2, sN[1] - 4 + k * 7, 20 - k * 2, 11, -0.2, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = ST[[4, 3, 2][k]]; c.beginPath(); c.ellipse(sN[0] + 2, sN[1] - 4 + k * 7, 18 - k * 2, 9, -0.2, Math.PI, 0); c.closePath(); c.fill(); rect(c, sN[0] - 8 + k * 2, sN[1] - 9 + k * 7, 3, 3, ST[5]); }
  c.restore();
};
/** Dead: belly up on the water, X'd eyes on their stalks drooping, tongue out; `puffed`: swollen up round, purple
 *  blotches, the whistle stuck in his throat. */
const paintDead = (c: Ctx, puffed: boolean, q: number, A = 0) => {
  const k = puffed ? 1.25 : 1;
  blob(c, 0, -10, 64 * k, 34 * k, puffed ? FLESH.map(col => mix(col, '#7A3A8A', 0.3)) : FLESH);
  if (puffed) for (let i = 0; i < 6; i++) ell(c, -40 + i * 16, -14 + (i % 2) * 10, 6, 5, '#6A2A7A');
  for (let i = 0; i < A * 3; i++) { const x = -54 + ((i * 37) % 108) * k, y = -30 + ((i * 23) % 36); ell(c, x, y, 5, 4, HIVE[0]); ell(c, x, y - 0.5, 4, 3, HIVE[1]); }
  for (let r = 0; r < 3; r++) ell(c, -20 + r * 18, -30 * k, 3, 2.4, '#7A4A6A');
  // (the trunks up top, the head off to the side, upside down)
  rect(c, -10, -44 * k, 34, 12, INK); rect(c, -9, -43 * k, 32, 10, TRUNK[2]);
  blob(c, 66 * k, -6, 30, 24, FLESH);
  for (const s of [-1, 1]) { line(c, [[60 * k, -20], [60 * k + s * 14, -40 - (q % 3)], [60 * k + s * 20, -44]], 5, INK); ell(c, 60 * k + s * 20, -46, 7, 6, '#F4E86A'); line(c, [[60 * k + s * 20 - 4, -50], [60 * k + s * 20 + 4, -42]], 2, INK); line(c, [[60 * k + s * 20 + 4, -50], [60 * k + s * 20 - 4, -42]], 2, INK); }
  ell(c, 80 * k, 8, 8, 5, '#C04A5A');
  if (puffed) { rect(c, 74 * k, -4, 12, 8, INK); rect(c, 75 * k, -3, 10, 6, '#E8C020'); }
  // (arms and legs stuck up stiff)
  for (const [x, y] of [[-40, -38], [-10, -46], [24, -44], [44, -36]] as P[]) { line(c, [[x * k, y * 0.6], [x * k + 4, y * k - 10]], 12, INK); line(c, [[x * k, y * 0.6], [x * k + 4, y * k - 10]], 9, FLESH[2]); }
};
/** What's left once he's let all his air out: a limp skin flat on the water, the trunks, the whistle. */
const paintSkin = (c: Ctx, q: number) => {
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 70, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = FLESH[2]; c.beginPath(); c.ellipse(0, -1, 68, 8, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 5; i++) ell(c, -50 + i * 25, -1 + (i % 2) * 2, 10, 3, FLESH[1]);
  rect(c, -12, -6, 30, 8, TRUNK[2]);
  for (const s of [-1, 1]) line(c, [[54, -4], [60 + s * 4, -10 - (q % 2)], [64 + s * 8, -6]], 3, FLESH[1]);
  rect(c, 66, -8, 10, 6, '#E8C020');
};

const BOX = { x: -150, y: -200, w: 300, h: 290 };
/** Him, at (x, y: his waist), facing. Stamped per pose and frame; `alpha` (his breather's flicker). */
export const drawGup = (c: Ctx, x: number, y: number, face: 1 | -1, L: GupLook, f: number, alpha = 1) => {
  const q = L.pose === 'swim' || L.pose === 'glide' ? Math.floor(f / 6) % 8 : L.pose === 'idle' || L.pose === 'talk' || L.pose === 'chair' ? Math.floor(f / 10) % 8 : L.pose === 'dead' || L.pose === 'skin' ? Math.floor(f / 16) % 3 : 0;
  c.save(); c.translate(Math.round(x), Math.round(y));
  if (alpha < 1) c.globalAlpha = alpha;
  stamp(c, `wp3-gup-${L.pose}-${q}-${L.mouth ? 1 : 0}-${face}-a${L.arm ?? 0}`, BOX.x, BOX.y, BOX.w, BOX.h, g => { g.scale(face, 1); paintGup(g, { ...L, q }, face); });
  c.restore();
};
export const GUP_W = 110, GUP_H = 150;

// ---------------------------------------------------------------------------------------------------------------
// BURST: what the chlorine left of him (the owner's: "endgame boss 3 should explode in the wave pool and meathead rides
// his dead body in the air, as it flies to the parking lot"). Belly up, head first (to the right), blown open: the
// back end's a ragged crater with the skin peeled back round it in petals and his guts streaming out behind on the
// wind; swollen purple and blistered with hives (the allergy, all of it at once); the head thrown back, the tongue
// out a foot and flapping, the whistle still in his teeth; one stalk eye snapped and swinging on its nerve, the other
// stalk bent back in the wind; the drain-grate breastplate still strapped round his chest: Meathead's saddle. The
// trunks blown half off, round one knee. Arms and legs trailing, every joint from art/limb.ts (a body on its back,
// head right, is a figure facing left turned a quarter: facing -1 to the helper).
//
// Origin: the saddle (where Meathead's sat). Baked once per frame of the flap (4), at the render scale, and drawn
// turned with drawImage (the stamp cache won't take a rotation: bake once, draw turned).

const GUTS = ['#240E28', '#46224E', '#6E3A7A', '#9A62A6', '#C89AD0'];
const SICK = FLESH.map(col => mix(col, '#7A3A8A', 0.28));
const PETAL = ['#3A0A14', '#7A1A2A', '#B83A4A', '#E07A7A'];
/** The burst corpse, painted (q: the flap's frame, 0..3). */
export const paintBurst = (c: Ctx, q: number) => {
  const ph = (q / 4) * Math.PI * 2, wv = (k: number) => Math.sin(ph + k) * 6;
  // ---- the guts out of the back end, streaming behind on the wind (three loops, wavering)
  for (let g = 0; g < 3; g++) {
    const pts: P[] = [];
    for (let i = 0; i <= 8; i++) { const x = -70 - i * 17, y = 30 + (g - 1) * 10 + Math.sin(ph + i * 0.9 + g * 2) * (3 + i * 1.3) + i * (g - 1) * 2; pts.push([x, y]); }
    line(c, pts, 13 - g * 2, INK); line(c, pts, 10 - g * 2, GUTS[2 + (g % 2)]);
    line(c, pts.map(([x, y]) => [x, y - 2] as P), 3, GUTS[4]);
    for (let i = 1; i < 8; i += 2) ell(c, pts[i][0], pts[i][1] + 2, 3, 2, GUTS[1]);
  }
  // (a drip of green off the end of each)
  for (let g = 0; g < 3; g++) { const x = -206 - g * 6, y = 34 + (g - 1) * 18 + wv(g); ell(c, x, y, 4, 3, INK); ell(c, x, y, 3, 2, '#7ADA4A'); }
  // ---- the far arm and leg (behind him, darker): trailing back
  const limb = (a: P, e: P, w: number, col: string, kneeJ: boolean, len: [number, number]) => {
    const j = kneeJ ? knee(a[0], a[1], e[0], e[1], len[0], len[1], -1) : elbow(a[0], a[1], e[0], e[1], len[0], len[1], -1);
    const end = reachTo(a[0], a[1], e[0], e[1], len[0], len[1]);
    line(c, [a, j, end], w + 3, INK); line(c, [a, j, end], w, col); line(c, [[a[0], a[1] - w * 0.25], [j[0], j[1] - w * 0.25]], Math.max(2, w * 0.3), mix(col, '#FFFFFF', 0.25));
    return end;
  };
  { const h = limb([40, 18], [-14, 62 + wv(1)], 11, SICK[1], false, [30, 28]); blob(c, h[0], h[1], 8, 6, SICK.map(x => mix(x, '#000000', 0.25))); }
  { const f = limb([-58, 28], [-104, 66 + wv(2)], 13, SICK[1], true, [28, 26]); blob(c, f[0] - 6, f[1] + 2, 11, 5, SICK.map(x => mix(x, '#000000', 0.25))); }
  // ---- the body: swollen, purple-mottled, banded light to dark down it
  blob(c, -8, 30, 82, 32, SICK);
  // (the stepped shade under him, dithered into the body)
  c.save(); c.beginPath(); c.ellipse(-8, 30, 82, 32, 0, 0, Math.PI * 2); c.clip();
  rect(c, -92, 42, 170, 22, SICK[1]); checker(c, -92, 38, 170, 4, SICK[1], 0, 2); rect(c, -92, 54, 170, 12, SICK[0]); checker(c, -92, 50, 170, 4, SICK[0], 0, 2);
  // (the mottling: bruise-purple blotches; the hives, everywhere; blisters lit on top)
  for (let i = 0; i < 9; i++) ell(c, -70 + i * 17, 20 + ((i * 7) % 3) * 9, 7, 4, '#5A2A6A');
  for (let i = 0; i < 26; i++) { const x = -80 + ((i * 37) % 150), y = 6 + ((i * 23) % 40); ell(c, x, y, 4, 3, HIVE[0]); ell(c, x, y - 0.5, 3, 2, HIVE[1]); rect(c, x - 1, y - 2, 2, 1, HIVE[2]); }
  for (let i = 0; i < 7; i++) { const x = -60 + i * 22, y = 4 + (i % 2) * 6; ell(c, x, y, 5, 4, INK); ell(c, x, y, 4, 3, '#D8F0B0'); rect(c, x - 2, y - 2, 2, 1, '#FFFFFF'); }
  // (his six nipples, two rows, up top: belly up)
  for (const [x, y] of [[-40, 6], [-14, 3], [12, 4], [-36, 16], [-10, 14], [16, 15]] as P[]) { ell(c, x, y, 3, 2, INK); ell(c, x, y, 2, 1.4, '#C86A7A'); }
  c.restore();
  // ---- the crater at the back end: ragged, dark inside, the skin peeled back in petals round it
  ell(c, -78, 28, 22, 26, INK);
  ell(c, -78, 28, 19, 23, PETAL[0]); ell(c, -76, 26, 13, 16, PETAL[1]); ell(c, -80, 34, 8, 9, GUTS[1]);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.2, r0 = 20, r1 = 34 + (i % 3) * 6, bx = -78 + Math.cos(a) * r0, by = 28 + Math.sin(a) * r0 * 1.1;
    const tx = -78 + Math.cos(a) * r1 + wv(i) * 0.3, ty = 28 + Math.sin(a) * r1 * 1.1;
    const nx = -Math.sin(a) * 6, ny = Math.cos(a) * 6;
    c.fillStyle = INK; c.beginPath(); c.moveTo(bx + nx * 1.3, by + ny * 1.3); c.lineTo(tx, ty); c.lineTo(bx - nx * 1.3, by - ny * 1.3); c.closePath(); c.fill();
    c.fillStyle = i % 2 ? SICK[2] : SICK[3]; c.beginPath(); c.moveTo(bx + nx, by + ny); c.lineTo(tx - Math.cos(a) * 2, ty - Math.sin(a) * 2); c.lineTo(bx - nx, by - ny); c.closePath(); c.fill();
    c.fillStyle = PETAL[2]; c.beginPath(); c.moveTo(bx + nx * 0.5, by + ny * 0.5); c.lineTo(bx + Math.cos(a) * 8, by + Math.sin(a) * 8); c.lineTo(bx - nx * 0.5, by - ny * 0.5); c.closePath(); c.fill();
  }
  // (a second split along his side, gaping: the seam he gave way at)
  line(c, [[-40, 46], [-20, 52], [4, 49], [26, 54]], 7, INK); line(c, [[-38, 46], [-20, 51], [4, 48], [24, 53]], 4, PETAL[1]); line(c, [[-36, 45], [-20, 49], [4, 46]], 1.5, PETAL[3]);
  // (green blood dribbling out of both)
  for (const [x, y, l] of [[-90, 50, 14], [-66, 52, 10], [-10, 54, 12], [14, 56, 8]] as [number, number, number][]) { line(c, [[x, y], [x - 2, y + l]], 4, INK); line(c, [[x, y], [x - 2, y + l]], 2.4, '#5ACA3A'); ell(c, x - 2, y + l + 1, 2.5, 2.5, '#7ADA4A'); }
  // ---- the near leg (trailing, the foot webbed; the trunks blown down round its knee), then the near arm
  {
    const f = limb([-54, 40], [-98, 82 + wv(3)], 15, SICK[2], true, [28, 26]);
    const k = knee(-54, 40, -98, 82 + wv(3), 28, 26, -1);
    rect(c, k[0] - 14, k[1] - 8, 28, 12, INK); rect(c, k[0] - 13, k[1] - 7, 26, 10, TRUNK[2]); rect(c, k[0] - 13, k[1] - 7, 26, 3, TRUNK[3]); rect(c, k[0] - 13, k[1] + 1, 26, 2, TRUNK[1]);
    for (let t = -1; t <= 1; t++) line(c, [[f[0], f[1]], [f[0] - 14, f[1] + 4 + t * 5]], 4, INK);
    ell(c, f[0] - 8, f[1] + 3, 10, 5, SICK[3]);
  }
  { const h = limb([48, 26], [0, 72 + wv(4)], 13, SICK[2], false, [30, 28]); ell(c, h[0], h[1], 9, 7, INK); ell(c, h[0], h[1], 7.5, 5.5, SICK[3]); for (let t = 0; t < 3; t++) line(c, [[h[0], h[1]], [h[0] - 9 + t * 4, h[1] + 9]], 3, SICK[2]); }
  // ---- the saddle: the drain-grate breastplate still strapped round his chest (bent, chlorine-green), its straps
  const ST = steelAt(5);
  line(c, [[-14, 2], [-18, 54]], 5, INK); line(c, [[-14, 2], [-18, 54]], 3, '#5A3A1A'); line(c, [[22, 2], [26, 54]], 5, INK); line(c, [[22, 2], [26, 54]], 3, '#5A3A1A');
  c.fillStyle = INK; c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(4, -10, 34, 4); c.lineTo(32, 14); c.quadraticCurveTo(4, 2, -24, 14); c.closePath(); c.fill();
  c.fillStyle = ST[3]; c.beginPath(); c.moveTo(-23, 5); c.quadraticCurveTo(4, -7, 31, 5); c.lineTo(30, 11); c.quadraticCurveTo(4, 0, -22, 11); c.closePath(); c.fill();
  for (let i = 0; i < 7; i++) rect(c, -18 + i * 7, -1 + Math.abs(i - 3) * 1.2, 2, 8, ST[1]);
  line(c, [[-22, 5], [4, -5], [30, 5]], 1.2, ST[5]);
  // ---- the head: thrown back, mouth gaping up, the tongue out and flapping back over him, the whistle in his teeth
  blob(c, 96, 22, 34, 27, SICK);
  // (the gills, burst open)
  for (let i = 0; i < 3; i++) { line(c, [[66 + i * 6, 6], [64 + i * 6, 34]], 4, INK); line(c, [[66 + i * 6, 8], [64 + i * 6, 32]], 2, PETAL[1]); }
  // (the mouth: a gaping hole up top, the buck teeth)
  ell(c, 108, 4, 18, 9, INK); ell(c, 108, 5, 15, 7, '#3A0A14'); for (let t = 0; t < 3; t++) { rect(c, 98 + t * 8, -2, 5, 6, INK); rect(c, 99 + t * 8, -1, 3, 4, '#F4ECC8'); }
  // (the tongue: out a foot, back along over his face on the wind)
  { const pts: P[] = []; for (let i = 0; i <= 6; i++) pts.push([106 - i * 12, 2 - i * 3 - Math.sin(ph + i * 0.8) * (1 + i * 1.6)]); line(c, pts, 12, INK); line(c, pts, 9, '#C04A5A'); line(c, pts.map(([x, y]) => [x, y - 2] as P), 2, '#F08A9A'); }
  // (the whistle, still clamped in his teeth, the lanyard flapping)
  rect(c, 118, -6, 14, 8, INK); rect(c, 119, -5, 12, 6, '#E8C020'); rect(c, 119, -5, 12, 2, '#FFF2A0');
  line(c, [[124, 2], [112, 18 + wv(5) * 0.5], [96, 30 + wv(6) * 0.6]], 2, '#F8FAFC');
  // (the nose, zinc-striped; the sunk eyes, X'd)
  ell(c, 124, 16, 9, 7, INK); ell(c, 124, 16, 7.5, 5.5, SICK[3]); rect(c, 119, 13, 10, 2, '#F8FAFC');
  for (const [x, y] of [[104, 26], [118, 30]] as P[]) { ell(c, x, y, 6, 5, INK); ell(c, x, y, 5, 4, '#F4E86A'); line(c, [[x - 3, y - 3], [x + 3, y + 3]], 2, INK); line(c, [[x + 3, y - 3], [x - 3, y + 3]], 2, INK); }
  // (the stalks: one bent back flat in the wind, its eye bulging; one snapped, the eye swinging on its nerve)
  { const ey = -20 + wv(7) * 0.4;
    line(c, [[90, 4], [72, -14], [52, ey]], 6, INK); line(c, [[90, 4], [72, -14], [52, ey]], 3.5, SICK[2]);
    ell(c, 48, ey - 1, 9, 8, INK); ell(c, 48, ey - 1, 7.5, 6.5, '#F4E86A'); ell(c, 45, ey - 1, 3, 3, INK); rect(c, 50, ey - 5, 2, 2, '#FFFFFF');
    for (let i = 0; i < 4; i++) line(c, [[43 + i * 3, ey + 3], [42 + i * 3, ey + 7]], 1, '#C83A3A'); }
  line(c, [[100, 0], [96, -10]], 6, INK); line(c, [[100, 0], [96, -10]], 3.5, SICK[2]); ell(c, 96, -11, 4, 3, PETAL[1]);
  { const sw = Math.sin(ph) * 10, ex = 92 + sw, ey = 48 + Math.cos(ph) * 3; line(c, [[96, -10], [86, 10], [ex, ey]], 1.5, '#C83A3A'); ell(c, ex, ey, 7, 6, INK); ell(c, ex, ey, 6, 5, '#F4E86A'); ell(c, ex + 2, ey + 1, 2.5, 2.5, INK); }
  // ---- smoke curling off the crater's edge (painted wisps: the live smoke's particles)
  for (let i = 0; i < 3; i++) { const x = -96 - i * 6, y = 4 - i * 9 + wv(i) * 0.4; ell(c, x, y, 7 - i, 5 - i, mix('#4A4A50', '#9A9AA0', i / 3)); }
};

/** The burst corpse's box (round the saddle) and its baked frames. */
export const BURST_BOX = { x: -232, y: -48, w: 380, h: 150 };
const burstCv: (HTMLCanvasElement | null)[] = [null, null, null, null];
const bakeBurst = (q: number) => {
  let cv = burstCv[q];
  if (cv) return cv;
  cv = document.createElement('canvas');
  cv.width = BURST_BOX.w * RENDER_SCALE; cv.height = BURST_BOX.h * RENDER_SCALE;
  const g = cv.getContext('2d')!;
  g.scale(RENDER_SCALE, RENDER_SCALE); g.translate(-BURST_BOX.x, -BURST_BOX.y);
  paintBurst(g, q);
  burstCv[q] = cv;
  return cv;
};
/** (paint them ahead, one a call: during the swell, so the flight never paints) */
export const warmBurst = () => { const q = burstCv.findIndex(v => !v); if (q >= 0) bakeBurst(q); };
/** The burst corpse at (x, y: the saddle), turned `rot`, its flap by the frame, scaled `s`. */
export const drawBurst = (c: Ctx, x: number, y: number, rot: number, f: number, s = 1) => {
  const cv = bakeBurst(Math.floor(f / 5) % 4);
  c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s);
  c.drawImage(cv, BURST_BOX.x, BURST_BOX.y, BURST_BOX.w, BURST_BOX.h);
  c.restore();
};
