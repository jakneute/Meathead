// The walk-away from THE QUEEN (LEGALLY DISTINCT), Future Land's boss: back down Future Land's main drag toward the
// camera at whatever hour it is now (timeOfDay.ts), away from GALACTIC GROOVE. The drag: the park's pastel terrazzo
// (star inlays, chrome strips set in it, the runway lights along its edges), the Googie lamp pylons down both sides
// (boomerang fins, neon rings, a lit globe each), fiberglass planters of alien plants, rocket-shaped trash cans. Far
// off: the skyline of 1990's future (SPACE NEEDLE 2, the giant atom, the monorail with a train going over, the rocket
// spinner), hazed at its foot. At the drag's end, the space disco he's just come out of: the saucer roof on its glass
// drum, the boomerang pylon sign (GALACTIC GROOVE, its neon chasing, one letter gone), the door kicked in flat and the
// dance floor's colors spilling out of it, the searchlights off its roof sweeping the sky, smoke off the vents; beside
// it XENOSCARE's fiberglass alien head (the haunted spaceship he came through), its eyes still lit green.
// In the drag, the mess he's left: glitter, the mirror ball's tiles glinting, records, her acid oil in glowing puddles
// and drips down the path, the fire extinguisher, the DJ's headset, the inner jaw on its rod (the one too many),
// her offspring belly up and bleeding (machines bleed); killed by the mallet, her head, flattened. His new toy: the
// OTHERWORLDLY SPAWNER.

import { type Ctx, type Prop, type SceneDef, INK, HOR, F, CAM_H, VP_X, ME_X, box, hash, lump, poly, smoke, mix, stipple, rampOf } from './kit';
import { timeOfDay, hourMix } from '../timeOfDay';
import { spawner as drawSpawner } from './toys';

// ---------------------------------------------------------------------------------------------------------------
// The palette

const H = (day: string, sundown: string, night: string) => hourMix(day, sundown, night);
const CHROME = ['#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
const PINK = ['#500724', '#9D174D', '#DB2777', '#F472B6', '#FBCFE8'];
const TEAL = ['#042F2E', '#0F766E', '#14B8A6', '#5EEAD4', '#CCFBF1'];
const PURP = ['#2E1065', '#5B21B6', '#7C3AED', '#A78BFA', '#DDD6FE'];
const LAT = ['#06070B', '#1D1F29', '#353A4B', '#6E7A96', '#B9C6DE'];
const OIL = ['#050302', '#1A0F06', '#3A2410', '#84CC16', '#D9F99D'];
const NEON = ['#F472B6', '#22D3EE', '#FDE047', '#A78BFA', '#4ADE80'];

/** The drag's measures (m): the path's half-width; the lamps' line; how far apart. */
const PATH = 3.2, LAMP_X = 4.6, LAMP_GAP = 8;
/** The disco at the drag's end (m off), its width. */
const D_DISCO = 30;

// ---------------------------------------------------------------------------------------------------------------
// The ground: the drag's terrazzo down the middle (speckled, star inlays, chrome strips across, runway lights along
// its edges), teal curbs lit along the top, hex pavers out to the sides; glitter; her oil dripped down it

const ground = (g: Ctx, w: number, h: number) => {
  const m = w / 2, p = PATH * 16;
  // (the pavers: lavender hexes, each its own tone, seamed)
  box(g, 0, 0, w, h, '#5E5A78');
  for (let r = 0; r < h / 9 + 1; r++) for (let k = 0; k < w / 14 + 1; k++) {
    const x = k * 14 + (r % 2) * 7, y = r * 9, tone = ['#8C86A8', '#9D97B8', '#827C9E', '#A6A0C2'][(k * 3 + r * 5) % 4];
    box(g, x + 1, y + 1, 12, 7, tone); box(g, x + 1, y + 1, 12, 1, '#B8B2D2'); box(g, x + 1, y + 7, 12, 1, '#6E6890');
  }
  // (the terrazzo: peach, speckled in four colors)
  box(g, m - p, 0, p * 2, h, '#E8B8A8');
  for (let y = 0; y < h; y += 2) for (let x = m - p; x < m + p; x += 2) if (((x >> 1) + (y >> 1)) % 2 === 0) box(g, x, y, 1, 1, '#F0C6B6');
  for (let i = 0; i < 900; i++) box(g, m - p + hash(i * 1.37) * p * 2, hash(i * 2.91) * h, 1, 1, ['#B08070', '#FFFFFF', '#7DA0B8', '#C890B0'][i % 4]);
  // (chrome strips across it every 4 m; a star inlaid between, yellow, its points lit)
  for (let y = 0; y < h; y += 64) { box(g, m - p, y, p * 2, 2, CHROME[2]); box(g, m - p, y, p * 2, 1, CHROME[4]); }
  for (let y = 32; y < h; y += 64) {
    const sx = m + ((y / 64) % 2 ? -14 : 14), sy = y;
    const pts: number[][] = [];
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 4 : 10; pts.push([sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.9]); }
    poly(g, pts, '#FACC15', '#A16207'); box(g, sx - 1, sy - 6, 2, 3, '#FEF9C3');
  }
  // (the curbs: teal, lit along the top; the runway lights set in the path's edges)
  for (const sd of [-1, 1]) {
    const cx = sd < 0 ? m - p - 6 : m + p;
    box(g, cx, 0, 6, h, TEAL[1]); box(g, sd < 0 ? cx + 3 : cx, 0, 3, h, TEAL[2]); box(g, sd < 0 ? cx + 5 : cx, 0, 1, h, TEAL[3]);
    for (let y = 8; y < h; y += 16) { const lx = sd < 0 ? m - p + 3 : m + p - 6; box(g, lx, y, 3, 3, '#7C2D12'); box(g, lx, y, 3, 2, '#FDBA74'); box(g, lx, y, 1, 1, '#FFFFFF'); }
  }
  // (glitter: off his boots, out of the disco: specks of every color down the path)
  for (let i = 0; i < 260; i++) box(g, m - p + hash(i * 4.1 + 9) * p * 2, hash(i * 7.3) * h, 1, 1, NEON[i % 5]);
  // (her oil, dripped down the path in a trail: black-brown spots, a green sizzle round each)
  for (let i = 0; i < 26; i++) {
    const x = m - 10 + Math.sin(i * 0.9) * 8 + hash(i) * 6, y = (i * 10 + hash(i * 3) * 6) % h, r = 1 + hash(i * 5) * 2.5;
    g.fillStyle = OIL[3]; g.beginPath(); g.ellipse(x, y, r + 1, r * 0.7 + 1, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = OIL[0]; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2); g.fill();
    box(g, x - 1, y - 1, 1, 1, '#C084FC');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The far off: Future Land's skyline, the monorail, the searchlights; the disco at the drag's end, XENOSCARE beside it

/** The skyline's tones (the hour's): its body, lit side, shade; the haze at its foot. */
const sky3 = () => [H('#7C83A8', '#6A3F6E', '#1E2240'), H('#A7AECF', '#A35A6E', '#2E3460'), H('#5A6088', '#4A2A54', '#141830')];

const skyline = (c: Ctx, t: number, sway: number) => {
  const [body, lit, shade] = sky3();
  const ox = sway * 0.15;
  const tod = timeOfDay();
  // (SPACE NEEDLE 2: three legs tapering in, the saucer, the spire; its beacon blinking)
  const nx = Math.round(372 + ox), ny = HOR - 6;
  for (const [a, b] of [[-7, -2], [7, 2], [0, 0]]) { c.strokeStyle = a === 0 ? lit : body; c.lineWidth = a === 0 ? 2 : 1; c.beginPath(); c.moveTo(nx + a, ny); c.quadraticCurveTo(nx + b * 0.5, ny - 30, nx + b, ny - 58); c.stroke(); }
  box(c, nx - 13, ny - 64, 26, 4, body); box(c, nx - 11, ny - 66, 22, 2, lit); box(c, nx - 12, ny - 60, 24, 2, shade);
  for (let k = 0; k < 6; k++) box(c, nx - 10 + k * 4, ny - 63, 2, 1, tod.lamps > 0.3 ? '#FDE68A' : shade);
  box(c, nx - 1, ny - 80, 2, 14, body); box(c, nx, ny - 80, 1, 14, lit);
  if (t % 50 < 25) box(c, nx - 1, ny - 82, 3, 2, '#EF4444');
  // (the giant atom: its ball, three orbits, the electrons going round; on its column)
  const ax = Math.round(64 + ox), ay = HOR - 40;
  box(c, ax - 2, ay + 8, 4, HOR - ay - 8, body); box(c, ax - 2, ay + 8, 1, HOR - ay - 8, lit);
  for (let k = 0; k < 3; k++) {
    const rot = (k * Math.PI) / 3;
    c.strokeStyle = k === 1 ? lit : body; c.lineWidth = 1; c.beginPath(); c.ellipse(ax, ay, 22, 7, rot, 0, Math.PI * 2); c.stroke();
    const e = t * 0.03 + k * 2.1, ex = Math.cos(e) * 22, ey = Math.sin(e) * 7;
    box(c, ax + ex * Math.cos(rot) - ey * Math.sin(rot) - 1, ay + ex * Math.sin(rot) + ey * Math.cos(rot) - 1, 2, 2, tod.lamps > 0.3 ? '#93C5FD' : lit);
  }
  c.fillStyle = shade; c.beginPath(); c.arc(ax, ay, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = body; c.beginPath(); c.arc(ax - 1, ay - 1, 6, 0, Math.PI * 2); c.fill();
  c.fillStyle = lit; c.beginPath(); c.arc(ax - 2, ay - 3, 3, 0, Math.PI * 2); c.fill();
  // (the rocket spinner: a mast, its arms out, little rockets on their ends going round)
  const rx = Math.round(122 + ox);
  box(c, rx - 1, HOR - 34, 3, 34, body); box(c, rx - 1, HOR - 34, 1, 34, lit);
  for (let k = 0; k < 4; k++) { const a = t * 0.04 + k * Math.PI / 2, ex = Math.cos(a) * 16, ez = Math.sin(a); box(c, rx + ex - 2, HOR - 30 + ez * 2, 5, 2, ez > 0 ? lit : body); c.strokeStyle = body; c.lineWidth = 1; c.beginPath(); c.moveTo(rx, HOR - 34); c.lineTo(rx + ex, HOR - 30 + ez * 2); c.stroke(); }
  // (low blocks of the park between: Googie roofs, flat, a fin or two)
  c.fillStyle = shade;
  for (let i = 0; i < 9; i++) { const bx = ((i * 53 + 11) % 420) - 10 + ox, bw = 26 + (i % 3) * 10, bh = 6 + (i % 4) * 3; c.fillRect(Math.round(bx), HOR - bh, bw, bh); box(c, bx, HOR - bh, bw, 1, body); if (i % 3 === 0) { poly(c, [[bx + 4, HOR - bh], [bx + 10, HOR - bh - 8], [bx + 12, HOR - bh]], body, null); } }
  // (the monorail: its beam across on T pylons, a train going over)
  const my = HOR - 20;
  box(c, 0, my, 400, 3, body); box(c, 0, my, 400, 1, lit); box(c, 0, my + 3, 400, 1, shade);
  for (let x = ((ox % 46) + 46) % 46 - 46; x < 400; x += 46) { box(c, x, my + 3, 2, HOR - my - 3, shade); box(c, x - 3, my + 3, 8, 1, body); }
  const tx = ((t * 0.5) % 560) - 120 + ox;
  for (let k = 0; k < 3; k++) {
    const cx = Math.round(tx + k * 20);
    c.fillStyle = H('#E2E8F0', '#C9A0B0', '#3A4068'); c.beginPath(); c.roundRect(cx, my - 6, 19, 6, k === 2 ? [0, 4, 2, 0] : k === 0 ? [4, 0, 0, 2] : 0); c.fill();
    box(c, cx + 1, my - 6, 17, 1, H('#FFFFFF', '#F0C8D0', '#5A6290'));
    box(c, cx, my - 2, 19, 1, H('#DC2626', '#B02040', '#7F1D1D'));
    for (let w = 0; w < 4; w++) box(c, cx + 3 + w * 4, my - 5, 2, 2, tod.lamps > 0.3 ? '#FEF3C7' : '#475569');
  }
  // (the haze at its foot)
  const hz = tod.haze;
  for (let i = 0; i < 4; i++) { c.fillStyle = stipple(c, hz, i % 2); c.fillRect(0, HOR - 10 + i * 3, 400, 3); }
};

/** The searchlights off the disco's roof: two pale beams sweeping the sky (stippled: see-through), brighter by night. */
const searchlights = (c: Ctx, t: number, x: number, y: number) => {
  const tod = timeOfDay();
  const col = tod.lamps > 0.3 ? '#E0E7FF' : '#F8FAFC';
  for (let k = 0; k < 2; k++) {
    const a = -Math.PI / 2 + Math.sin(t * 0.012 + k * 2.4) * 0.7, len = 140, sp = 0.05;
    const ex1 = x + Math.cos(a - sp) * len, ey1 = y + Math.sin(a - sp) * len, ex2 = x + Math.cos(a + sp) * len, ey2 = y + Math.sin(a + sp) * len;
    c.save(); c.globalAlpha = 0.25 + 0.45 * tod.lamps;
    c.fillStyle = stipple(c, col, k); c.beginPath(); c.moveTo(x - 1, y); c.lineTo(ex1, ey1); c.lineTo(ex2, ey2); c.lineTo(x + 1, y); c.closePath(); c.fill();
    c.restore();
  }
};

/** GALACTIC GROOVE, painted once by the hour (its live bits drawn over it): 120 x 70 picture px, its foot's middle at
 *  (60, 70). */
let disco: { key: string; cv: HTMLCanvasElement } | null = null;
const DW = 150, DH = 76;
const discoArt = () => {
  const key = timeOfDay().key;
  if (disco && disco.key === key) return disco.cv;
  const cv = document.createElement('canvas'); cv.width = DW; cv.height = DH;
  const g = cv.getContext('2d')!;
  const wall = [H('#3B2A5C', '#3A1E48', '#181030'), H('#5B4590', '#5A2E62', '#2A1E4C'), H('#7E66B8', '#8A4E7E', '#3A2E66'), H('#A894DA', '#B87A92', '#4C4080')];
  const m = DW / 2, foot = DH;
  // (the glass drum: the hall's lights through it, colored panes, mullions)
  box(g, m - 46, foot - 26, 92, 26, INK);
  for (let i = 0; i < 15; i++) { const x = m - 45 + i * 6; box(g, x, foot - 25, 5, 24, ['#3B0764', '#1E3A8A', '#701A75', '#134E4A'][i % 4]); box(g, x, foot - 25, 5, 2, '#C4B5FD'); g.fillStyle = stipple(g, NEON[i % 5]); g.fillRect(x, foot - 14, 5, 13); }
  for (let i = 0; i <= 15; i++) box(g, m - 46 + i * 6, foot - 26, 1, 26, CHROME[2]);
  // (the saucer roof: a wide flattened cap, banded light to dark down its rim, a ring of bulbs)
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, foot - 30, 62, 12, 0, 0, Math.PI * 2); g.fill();
  const bands = [wall[3], wall[2], wall[1], wall[0]];
  for (let i = 0; i < 4; i++) { g.save(); g.beginPath(); g.ellipse(m, foot - 30, 61, 11, 0, 0, Math.PI * 2); g.clip(); box(g, m - 62, foot - 41 + i * 5.5, 124, 6, bands[i]); g.restore(); }
  for (let i = 0; i < 3; i++) { g.fillStyle = stipple(g, bands[i + 1], i % 2); g.save(); g.beginPath(); g.ellipse(m, foot - 30, 61, 11, 0, 0, Math.PI * 2); g.clip(); g.fillRect(m - 62, foot - 36 + i * 5.5, 124, 1); g.restore(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, foot - 40, 24, 8, 0, Math.PI, 0); g.fill();
  g.fillStyle = wall[2]; g.beginPath(); g.ellipse(m, foot - 40, 23, 7, 0, Math.PI, 0); g.fill();
  g.fillStyle = wall[3]; g.beginPath(); g.ellipse(m - 4, foot - 42, 12, 3, 0, Math.PI, 0); g.fill();
  box(g, m - 1, foot - 56, 2, 10, CHROME[2]); box(g, m - 1, foot - 56, 1, 10, CHROME[4]);
  lump(g, m, foot - 57, 3, 3, CHROME);
  // (the vents on the roof the smoke comes off)
  for (const vx of [-30, 26]) { box(g, m + vx, foot - 44, 6, 5, INK); box(g, m + vx + 1, foot - 43, 4, 3, CHROME[1]); box(g, m + vx + 1, foot - 43, 4, 1, CHROME[3]); }
  // (the doorway: dark, the door kicked in, flat on the floor in it)
  box(g, m - 7, foot - 18, 14, 18, INK); box(g, m - 6, foot - 17, 12, 17, '#0A0510');
  box(g, m - 9, foot - 2, 18, 2, '#7E22CE'); box(g, m - 9, foot - 2, 18, 1, '#C084FC');
  // (the boomerang pylon sign at the left: a swept fin up, the sign board on it)
  poly(g, [[m + 54, foot], [m + 48, foot], [m + 40, foot - 60], [m + 30, foot - 74], [m + 44, foot - 66], [m + 54, foot - 40]], PINK[2]);
  poly(g, [[m + 51, foot - 2], [m + 49, foot - 2], [m + 42, foot - 58], [m + 36, foot - 68], [m + 44, foot - 62]], PINK[3], null);
  box(g, m + 12, foot - 62, 62, 26, INK); box(g, m + 13, foot - 61, 60, 24, '#1E0B33'); box(g, m + 13, foot - 61, 60, 1, PURP[3]);
  // (the starburst on top of it)
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.strokeStyle = '#FDE047'; g.lineWidth = 1; g.beginPath(); g.moveTo(m + 30, foot - 72); g.lineTo(m + 30 + Math.cos(a) * 6, foot - 72 + Math.sin(a) * 6); g.stroke(); }
  // (XENOSCARE's sign's back is next door: a strip of chase bulbs down the drum's foot)
  for (let i = 0; i < 14; i++) box(g, m - 44 + i * 6.5, foot - 27, 2, 1, '#78350F');
  disco = { key, cv };
  return cv;
};

/** XENOSCARE's front, beside the disco: the fiberglass head of a crashed alien ship (its mouth the way in), painted
 *  once by the hour: 90 x 52, its foot's middle at (45, 52). */
let xeno: { key: string; cv: HTMLCanvasElement } | null = null;
const xenoArt = () => {
  const key = timeOfDay().key;
  if (xeno && xeno.key === key) return xeno.cv;
  const cv = document.createElement('canvas'); cv.width = 90; cv.height = 52;
  const g = cv.getContext('2d')!;
  const hull = [H('#1E2A2A', '#24202E', '#0C1016'), H('#34484A', '#3A3044', '#161E26'), H('#4E6A66', '#584660', '#22303A'), H('#7EA098', '#8A6A82', '#34485A')];
  // (the head: a long ridged dome, low, nose down into the ground at the right, its jaw open: the entrance)
  g.fillStyle = INK; g.beginPath(); g.moveTo(2, 52); g.quadraticCurveTo(6, 10, 48, 8); g.quadraticCurveTo(84, 10, 88, 52); g.closePath(); g.fill();
  g.fillStyle = hull[1]; g.beginPath(); g.moveTo(4, 51); g.quadraticCurveTo(8, 12, 48, 10); g.quadraticCurveTo(82, 12, 86, 51); g.closePath(); g.fill();
  g.fillStyle = hull[2]; g.beginPath(); g.moveTo(14, 40); g.quadraticCurveTo(16, 16, 46, 14); g.quadraticCurveTo(66, 15, 70, 30); g.closePath(); g.fill();
  g.fillStyle = stipple(g, hull[3]); g.beginPath(); g.ellipse(36, 20, 18, 5, -0.1, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 7; i++) { g.strokeStyle = hull[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(12 + i * 10, 48); g.quadraticCurveTo(16 + i * 9, 24, 30 + i * 6, 12); g.stroke(); }
  // (the mouth: the way in, dark, teeth round it, the queue rail)
  g.fillStyle = INK; g.beginPath(); g.ellipse(48, 46, 18, 10, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#04080A'; g.beginPath(); g.ellipse(48, 47, 16, 9, 0, Math.PI, 0); g.fill();
  for (let i = 0; i < 8; i++) poly(g, [[34 + i * 4, 38 + Math.abs(i - 3.5) * 0.8], [36 + i * 4, 43], [38 + i * 4, 38 + Math.abs(i - 3.5) * 0.8]], '#D6D3D1', null);
  // (its sign over the mouth)
  box(g, 16, 25, 60, 11, INK); box(g, 17, 26, 58, 9, '#14532D');
  g.font = '6px "Press Start 2P"'; g.fillStyle = '#86EFAC'; g.fillText('XENOSCARE', 19, 34);
  xeno = { key, cv };
  return cv;
};

const back = (c: Ctx, t: number, sway: number) => {
  const tod = timeOfDay();
  skyline(c, t, sway);
  // The disco at the drag's end (and XENOSCARE beside it): where they stand
  // (off to the right of the drag's end, clear of him: in sight over his shoulder)
  const s = F / D_DISCO, gx = Math.round(VP_X + 8 + sway * 0.6 + F * ME_X / D_DISCO), gy = HOR + Math.round((F * CAM_H) / D_DISCO);
  const dx = Math.round(gx - DW / 2), dy = gy - DH;
  searchlights(c, t, dx + DW / 2 - 2, dy + 18);
  searchlights(c, t + 400, dx + DW / 2 + 22, dy + 30);
  // (XENOSCARE, across the drag from it, off to the left)
  const xc = xenoArt(), xx = Math.round(12 + sway * 0.6), xy = gy - 52;
  c.drawImage(xc, xx, xy);
  // (its eyes, lit green, blinking slow)
  if (t % 140 < 132) { box(c, xx + 20, xy + 18, 4, 2, '#84FF50'); box(c, xx + 52, xy + 18, 4, 2, '#84FF50'); }
  // (the disco's spill on the ground in front of it, first: the dance floor's colors, cycling)
  const k = Math.floor(t / 10);
  for (let i = 0; i < 5; i++) { const w = 12 + i * 10; c.fillStyle = stipple(c, NEON[(k + i) % 5], i % 2); c.fillRect(Math.round(gx - w / 2), gy + i * 2, w, 2); }
  c.drawImage(discoArt(), dx, dy);
  // (the door's light: colors through the doorway, the dance floor beyond)
  for (let i = 0; i < 4; i++) box(c, gx - 6 + i * 3, gy - 17, 3, 15, NEON[(k + i) % 5]);
  c.fillStyle = stipple(c, '#0A0510'); c.fillRect(gx - 6, gy - 17, 12, 15);
  // (the drum's chase bulbs, marching)
  for (let i = 0; i < 14; i++) if ((i + (t >> 3)) % 3 === 0) box(c, dx + DW / 2 - 44 + i * 6.5, gy - 27, 2, 1, '#FDE047');
  // (the sign: GALACTIC GROOVE in neon, chasing; one letter out (the second O), flickering)
  c.font = '7px "Press Start 2P"'; c.textBaseline = 'alphabetic';
  const sxl = dx + DW / 2 + 14, line = (word: string, y: number, base: string) => {
    for (let i = 0; i < word.length; i++) {
      const dead = word === 'GROOVE' && i === 3 && (t % 90 < 70 || t % 6 < 3);
      const lit = (i + (t >> 3)) % 5 === 0 ? '#FFFFFF' : base;
      c.fillStyle = dead ? '#3F1D38' : lit; c.fillText(word[i], sxl + i * 7, y);
    }
  };
  line('GALACTIC', dy + DH - 50, '#F472B6');
  line('GROOVE', dy + DH - 40, '#22D3EE');
  c.fillStyle = stipple(c, '#F472B6'); c.fillRect(sxl - 2, dy + DH - 60, 60, 1); c.fillRect(sxl - 2, dy + DH - 37, 60, 1);
  // (the starburst's bulb blinking)
  if (t % 30 < 15) box(c, dx + DW / 2 + 29, dy + 3, 3, 3, '#FEF9C3');
  // (smoke off its roof vents: thin, drifting off)
  smoke(c, dx + DW / 2 - 27, dy + 32, 1.6, t, 3, { n: 5, rise: 0.025, drift: 0.06, size: 0.5, col: ['#4A3E5A', '#5A4E6A', '#6A5E7A', '#7A6E8A'] });
  smoke(c, dx + DW / 2 + 29, dy + 32, 1.4, t, 8, { n: 4, rise: 0.02, drift: 0.08, size: 0.45, col: ['#4A3E5A', '#5A4E6A', '#6A5E7A'] });
  // (the glow round it after dark: stepped, the neon's pink)
  if (tod.lamps > 0.05) for (let r = 3; r >= 1; r--) { c.fillStyle = `rgba(244, 114, 182, ${(0.04 * tod.lamps * (4 - r)).toFixed(3)})`; c.beginPath(); c.ellipse(gx, gy - 24, 30 + r * 18, 16 + r * 10, 0, 0, Math.PI * 2); c.fill(); }
  void s;
};

// ---------------------------------------------------------------------------------------------------------------
// Down the drag: the Googie lamp pylons, the planters, the trash rockets

const paintLamp = (g: Ctx, w: number, h: number) => {
  const m = Math.round(w / 2);
  // (the base: a chrome flare on a teal plinth)
  box(g, m - 9, h - 6, 18, 6, INK); box(g, m - 8, h - 5, 16, 5, TEAL[2]); box(g, m - 8, h - 5, 16, 1, TEAL[3]); box(g, m + 4, h - 4, 4, 4, TEAL[1]);
  poly(g, [[m - 6, h - 6], [m + 6, h - 6], [m + 2, h - 16], [m - 2, h - 16]], CHROME[2]); box(g, m - 3, h - 14, 2, 8, CHROME[4]);
  // (the pole: chrome, shaded round)
  box(g, m - 3, 22, 6, h - 38, INK); box(g, m - 2, 22, 4, h - 38, CHROME[1]); box(g, m - 1, 22, 2, h - 38, CHROME[2]); box(g, m - 1, 22, 1, h - 38, CHROME[4]);
  // (the neon ring round it, near the top, and lower: rings of tube)
  for (const ry of [40, 58]) { box(g, m - 8, ry, 16, 3, INK); box(g, m - 7, ry + 1, 14, 1, '#22D3EE'); box(g, m - 7, ry, 14, 1, '#A5F3FC'); }
  // (the boomerang fin through the top, pink, swept)
  poly(g, [[m - 20, 30], [m - 2, 14], [m + 2, 14], [m + 22, 6], [m + 4, 24], [m - 2, 24]], PINK[2]);
  poly(g, [[m - 16, 28], [m - 2, 16], [m + 2, 16], [m + 16, 9], [m + 2, 20], [m - 2, 20]], PINK[3], null);
  box(g, m + 6, 12, 8, 1, PINK[4]);
  // (the globe on top: milk glass, lit)
  lump(g, m, 8, 7, 7, ['#7C6A3A', '#E2D6B0', '#F8F0D8', '#FFFBEB', '#FFFFFF']);
};
const paintPlanter = (g: Ctx, w: number, h: number) => {
  const m = w / 2;
  // (the alien plants: purple tendrils, yellow bulbs on their ends, a big leaf or two)
  for (let i = 0; i < 7; i++) {
    const bx = m - 10 + i * 3.5, top = 4 + hash(i * 3) * 12, lean = (i - 3) * 2.5;
    g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, h - 14); g.quadraticCurveTo(bx + lean * 0.3, (top + h) / 2, bx + lean, top); g.stroke();
    g.strokeStyle = PURP[i % 2 ? 2 : 3]; g.lineWidth = 1.5; g.stroke();
    lump(g, bx + lean, top, 2.5, 2.5, ['#713F12', '#CA8A04', '#FACC15', '#FEF08A', '#FFFFFF']);
  }
  poly(g, [[m - 14, h - 14], [m - 22, h - 26], [m - 8, h - 20]], '#15803D'); poly(g, [[m + 12, h - 14], [m + 22, h - 24], [m + 6, h - 20]], '#16A34A');
  // (the pod: fiberglass, teal, banded, its rim lit)
  g.fillStyle = INK; g.beginPath(); g.ellipse(m, h - 10, w / 2 - 1, 10, 0, 0, Math.PI); g.fill(); box(g, 1, h - 16, w - 2, 7, INK);
  g.fillStyle = TEAL[2]; g.beginPath(); g.ellipse(m, h - 10, w / 2 - 2, 9, 0, 0, Math.PI); g.fill(); box(g, 2, h - 15, w - 4, 6, TEAL[2]);
  box(g, 2, h - 15, w - 4, 2, TEAL[3]); box(g, 2, h - 15, w - 4, 1, TEAL[4]);
  g.fillStyle = TEAL[1]; g.beginPath(); g.ellipse(m + 4, h - 6, w / 2 - 8, 5, 0, 0, Math.PI); g.fill();
  g.fillStyle = stipple(g, TEAL[1]); g.fillRect(m, h - 10, w / 2 - 4, 4);
  box(g, m - 8, h - 11, 6, 1, TEAL[4]);
};
const paintTrash = (g: Ctx, w: number, h: number) => {
  const m = w / 2;
  // (a trash can made to look like a rocket: red fins, a silver body, a porthole, THANK YOU on it)
  poly(g, [[m - 6, h], [m - 10, h], [m - 7, h - 10]], PINK[1]); poly(g, [[m + 6, h], [m + 10, h], [m + 7, h - 10]], PINK[1]);
  box(g, m - 6, 8, 12, h - 10, INK); box(g, m - 5, 9, 10, h - 12, CHROME[2]); box(g, m - 5, 9, 3, h - 12, CHROME[3]); box(g, m + 3, 9, 2, h - 12, CHROME[1]);
  poly(g, [[m - 6, 9], [m, 0], [m + 6, 9]], PINK[2]); box(g, m - 2, 3, 2, 4, PINK[4]);
  box(g, m - 4, 13, 8, 3, INK); box(g, m - 3, 14, 6, 1, '#18181B');
  lump(g, m, 22, 3, 3, ['#0C4A6E', '#0369A1', '#38BDF8', '#BAE6FD', '#FFFFFF']);
  // (stuffed: a cup sticking out of the slot)
  box(g, m + 1, 11, 3, 3, '#F8FAFC'); box(g, m + 1, 11, 3, 1, '#DC2626');
};

// ---------------------------------------------------------------------------------------------------------------
// The mess he's left: her oil, the ball's tiles, records, the extinguisher, the headset, the jaw, her young, her head

const paintPuddle = (g: Ctx, w: number, h: number) => {
  g.fillStyle = OIL[3]; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = OIL[0]; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 1.5, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = OIL[1]; g.beginPath(); g.ellipse(w / 2 + 2, h / 2 + 1, w / 3, h / 4, 0, 0, Math.PI * 2); g.fill();
  // (the sheen across it in bands: purple, blue, teal, yellow)
  ['#7C3AED', '#2563EB', '#14B8A6', '#FACC15'].forEach((col, i) => box(g, w * 0.25 + i * 3, h / 2 - 2, 3, 1, col));
  box(g, w * 0.3, h * 0.3, 2, 1, '#FFFFFF');
};
const livePuddle = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  // (its sizzle: a bubble up and popping; a little sick-green glow)
  const b = (t + Math.round(sx)) % 30;
  if (b < 20 && s > 6) box(c, sx + s * 0.2 - 1, sy - s * 0.1 - b * s * 0.004, Math.max(1, s * 0.08), Math.max(1, s * 0.08), b < 14 ? '#BEF264' : '#ECFCCB');
};
const paintTile = (g: Ctx, w: number, h: number) => {
  // (a tile off the mirror ball: a little square of mirror, its glue on the back side up, or face up)
  box(g, 0, 0, w, h, INK); box(g, 1, 1, w - 2, h - 2, '#CBD5E1'); box(g, 1, 1, w - 3, 1, '#FFFFFF'); box(g, w - 2, 2, 1, h - 3, '#64748B');
};
const liveTile = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  // (it catches the light: a twinkle, now and then)
  const k = (t + Math.round(sx * 7)) % 70;
  if (k < 6 && s > 3) { const r = Math.max(1, Math.round(s * 0.18)); box(c, sx - r, sy - s * 0.12, r * 2 + 1, 1, '#FFFFFF'); box(c, sx, sy - s * 0.12 - r, 1, r * 2 + 1, '#FFFFFF'); }
};
const paintRecord = (g: Ctx, w: number, h: number) => {
  g.fillStyle = INK; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#18181B'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3F3F46'; g.lineWidth = 1; g.beginPath(); g.ellipse(w / 2, h / 2, w / 3, h / 3, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#F472B6'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 6, h / 6, 0, 0, Math.PI * 2); g.fill();
  box(g, w * 0.25, h * 0.25, 3, 1, '#71717A');
  // (snapped in half: a wedge out of it)
  g.fillStyle = 'rgba(0,0,0,0)'; g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w, h * 0.2); g.lineTo(w, h * 0.6); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over';
};
const paintExtinguisher = (g: Ctx, w: number, h: number) => {
  // (lying on its side, dented, the hose off it, foam dribbled out)
  g.save(); g.translate(w / 2, h - 7); g.rotate(-0.12);
  box(g, -15, -6, 28, 12, INK);
  box(g, -14, -5, 26, 10, '#B91C1C'); box(g, -14, -5, 26, 3, '#EF4444'); box(g, -14, -4, 26, 1, '#FCA5A5'); box(g, -14, 2, 26, 3, '#7F1D1D');
  box(g, -2, -5, 4, 3, '#7F1D1D');
  box(g, -6, -3, 9, 5, '#F8FAFC'); box(g, -5, -2, 3, 1, '#18181B');
  box(g, 12, -4, 6, 8, INK); box(g, 13, -3, 4, 6, '#3F3F46'); box(g, 13, -3, 4, 1, '#A1A1AA');
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(17, 0); g.quadraticCurveTo(24, 8, 16, 8); g.stroke();
  g.restore();
  for (let i = 0; i < 4; i++) lump(g, w - 8 - i * 4, h - 3, 3 - i * 0.4, 2, ['#64748B', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#FFFFFF'], false);
};
const paintHeadset = (g: Ctx, w: number, h: number) => {
  // (the DJ's: a band over, two cups, a little mic; green from their slime on it)
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, h - 3, w / 2 - 4, Math.PI, 0); g.stroke();
  g.strokeStyle = '#71717A'; g.lineWidth = 1; g.stroke();
  for (const x of [4, w - 4]) lump(g, x, h - 4, 3.5, 3.5, ['#18181B', '#27272A', '#3F3F46', '#71717A', '#A1A1AA']);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(w - 4, h - 4); g.quadraticCurveTo(w - 10, h, w - 14, h - 3); g.stroke();
  box(g, w - 16, h - 4, 3, 2, '#F472B6');
  box(g, w / 2 - 2, h - 9, 4, 2, '#84CC16'); box(g, w / 2 + 3, h - 6, 2, 3, '#4D7C0F');
};
const paintJaw = (g: Ctx, w: number, h: number) => {
  // (the third inner jaw (the one too many), torn out on its chrome rod, wires off its end)
  const y = h / 2;
  box(g, 0, y - 2, w * 0.55, 4, INK); box(g, 1, y - 1, w * 0.55 - 2, 2, CHROME[2]); box(g, 1, y - 1, w * 0.55 - 2, 1, CHROME[4]);
  for (let k = 0; k < 3; k++) { g.strokeStyle = ['#B91C1C', '#1D4ED8', '#CA8A04'][k]; g.lineWidth = 1; g.beginPath(); g.moveTo(1, y); g.quadraticCurveTo(-2, y + 4 + k, 3 + k * 2, h - 1); g.stroke(); }
  const jx = w * 0.5;
  box(g, jx, y - 5, w * 0.5 - 1, 10, INK); box(g, jx + 1, y - 4, w * 0.5 - 3, 8, LAT[2]); box(g, jx + 1, y - 4, w * 0.5 - 3, 2, LAT[3]); box(g, jx + 2, y - 4, 4, 1, LAT[4]);
  for (let k = 0; k < 4; k++) box(g, w - 4, y - 4 + k * 2, 3, 1, '#F3F4F6');
  box(g, jx + 2, y + 2, w * 0.5 - 6, 2, '#1C0610');
};
/** One of her young (a biter), belly up, legs in the air, bleeding (they're machines: they bleed anyway) and leaking
 *  her oil. */
const paintKin = (g: Ctx, w: number, h: number) => {
  const m = w / 2, y = h - 6;
  // (the blood and the oil under it)
  g.fillStyle = '#7F1D1D'; g.beginPath(); g.ellipse(m + 2, h - 3, w / 2 - 1, 3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#B91C1C'; g.beginPath(); g.ellipse(m - 2, h - 3.5, w / 3, 2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = OIL[0]; g.beginPath(); g.ellipse(m + 10, h - 3, 6, 2, 0, 0, Math.PI * 2); g.fill(); box(g, m + 7, h - 4, 2, 1, OIL[3]);
  // (the legs, up, bent, stiff)
  for (let i = 0; i < 3; i++) { const lx = m - 8 + i * 7; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, y - 4); g.lineTo(lx - 2, y - 12); g.lineTo(lx + 2, y - 16); g.stroke(); g.strokeStyle = CHROME[2]; g.lineWidth = 1.5; g.stroke(); }
  // (the body: chrome, a dent in it)
  lump(g, m - 2, y - 2, 12, 6, CHROME);
  box(g, m + 2, y - 4, 3, 2, CHROME[1]);
  // (its head off to the side, the black latex, the teeth, the slit gone dark)
  lump(g, m + 14, y, 6, 4, LAT);
  box(g, m + 12, y + 2, 7, 1, '#E5E7EB'); box(g, m + 10, y - 1, 3, 1, '#14532D');
};
/** Her head, flattened by the mallet: the dome stove in, the crest folded over, teeth out of it all over, her fluid. */
const paintHerHead = (g: Ctx, w: number, h: number) => {
  const m = w / 2;
  g.fillStyle = '#14532D'; g.beginPath(); g.ellipse(m, h - 3, w / 2 - 1, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#4D7C0F'; g.beginPath(); g.ellipse(m - 4, h - 4, w / 3, 2.5, 0, 0, Math.PI * 2); g.fill();
  box(g, m - 10, h - 5, 8, 1, '#BEF264');
  // (the crest, bent over, ridged)
  poly(g, [[m - 22, h - 6], [m - 30, h - 16], [m - 6, h - 22], [m + 4, h - 10]], LAT[1]);
  for (let i = 0; i < 4; i++) box(g, m - 24 + i * 6, h - 16 + i, 4, 1, LAT[3]);
  // (the dome, flat as a plate, cracked, the rig spilling out of it)
  g.fillStyle = INK; g.beginPath(); g.ellipse(m + 4, h - 7, 22, 6, 0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = LAT[2]; g.beginPath(); g.ellipse(m + 4, h - 8, 21, 5, 0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = LAT[3]; g.beginPath(); g.ellipse(m, h - 10, 12, 2, 0.05, 0, Math.PI * 2); g.fill();
  box(g, m - 4, h - 11, 8, 1, LAT[4]);
  g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(m + 2, h - 12); g.lineTo(m + 6, h - 8); g.lineTo(m + 3, h - 5); g.stroke();
  box(g, m + 10, h - 9, 5, 3, '#166534'); box(g, m + 11, h - 9, 1, 1, '#84FF50');
  // (teeth, knocked out all round it)
  for (let i = 0; i < 7; i++) box(g, m - 18 + hash(i * 2.2) * 44, h - 4 - hash(i * 5.5) * 6, 2, 3, '#F3F4F6');
};
const liveSpark = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  if (t % 46 < 5) { box(c, sx + s * 0.4, sy - s * 0.45, 2, 2, '#FDE047'); box(c, sx + s * 0.4 - 2, sy - s * 0.45 + 1, 1, 1, '#FFFFFF'); box(c, sx + s * 0.4 + 3, sy - s * 0.45 - 1, 1, 1, '#FFFFFF'); }
};

const props = (weakness: boolean): Prop[] => {
  const out: Prop[] = [];
  // The drag's furniture, both sides, coming on from behind the eye as he goes (lamps, between them planters and
  // trash rockets)
  for (let k = -3; k < 10; k++) for (const side of [-1, 1]) {
    const z = k * LAMP_GAP + (side < 0 ? 0 : LAMP_GAP / 2);
    out.push({ id: 'wq-lamp', x: ME_X + side * LAMP_X, z, w: 2.4, h: 6, ppm: 18, paint: paintLamp, live: liveLamp });
    const n = ((k * 2 + (side < 0 ? 0 : 1)) % 3 + 3) % 3;
    if (n === 0) out.push({ id: 'wq-plant', x: ME_X + side * (LAMP_X + 0.6), z: z + LAMP_GAP / 2, w: 2.2, h: 1.6, ppm: 22, paint: paintPlanter });
    else if (n === 1) out.push({ id: 'wq-trash', x: ME_X + side * (LAMP_X - 0.2), z: z + LAMP_GAP / 2, w: 1, h: 1.5, ppm: 22, paint: paintTrash });
  }
  // The mess down the path (litter that keeps coming: low things)
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1, x = ME_X + side * (0.6 + hash(i * 3.3) * 2.2), z = 2 + hash(i * 7.1) * 26, k = i % 4;
    if (k === 0) out.push({ id: 'wq-puddle', x, z, w: 1.1, h: 0.35, ppm: 30, paint: paintPuddle, live: livePuddle, wrap: true });
    else if (k === 1) out.push({ id: 'wq-tile', x, z, w: 0.22, h: 0.16, ppm: 40, paint: paintTile, live: liveTile, wrap: true });
    else if (k === 2) out.push({ id: 'wq-record', x, z, w: 0.5, h: 0.22, ppm: 40, paint: paintRecord, wrap: true });
    else out.push({ id: 'wq-tile', x: x * 0.9, z: z + 1.3, w: 0.22, h: 0.16, ppm: 40, paint: paintTile, live: liveTile, wrap: true });
  }
  // What's left of the fight, once each
  out.push({ id: 'wq-ext', x: ME_X + 1.7, z: 4.5, w: 1.2, h: 0.6, ppm: 30, paint: paintExtinguisher });
  out.push({ id: 'wq-headset', x: ME_X - 1.4, z: 8.5, w: 0.7, h: 0.4, ppm: 40, paint: paintHeadset });
  out.push({ id: 'wq-jaw', x: ME_X + 1.2, z: 12, w: 1, h: 0.4, ppm: 30, paint: paintJaw, live: liveSpark });
  out.push({ id: 'wq-kin', x: ME_X - 2, z: 6, w: 1.4, h: 0.8, ppm: 30, paint: paintKin });
  out.push({ id: 'wq-kin', x: ME_X + 2.3, z: 16, w: 1.4, h: 0.8, ppm: 30, paint: paintKin });
  out.push({ id: 'wq-kin', x: ME_X - 1.1, z: 22, w: 1.4, h: 0.8, ppm: 30, paint: paintKin });
  // (killed by the mallet: her head, flattened, in the middle of the path behind him, still sparking)
  if (weakness) out.push({ id: 'wq-head', x: ME_X + 2.4, z: 6, w: 2, h: 0.8, ppm: 30, paint: paintHerHead, live: liveSpark });
  return out;
};
/** A lamp's neon after dark: its rings and globe glowing, stepped. */
const liveLamp = (c: Ctx, sx: number, sy: number, s: number, t: number) => {
  const g = timeOfDay().lamps;
  if (g < 0.05 || s < 2) return;
  for (let r = 2; r >= 1; r--) { c.fillStyle = `rgba(255, 240, 200, ${(0.06 * g * (3 - r)).toFixed(3)})`; c.beginPath(); c.arc(Math.round(sx), Math.round(sy - s * 5.6), s * 0.45 * r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = `rgba(34, 211, 238, ${(0.1 * g * (0.8 + 0.2 * Math.sin(t * 0.2 + sx))).toFixed(3)})`; c.beginPath(); c.ellipse(Math.round(sx), Math.round(sy - s * 3.7), s * 0.7, s * 0.3, 0, 0, Math.PI * 2); c.fill();
};

/** The spawner, side on, its middle at the origin (the bottom bar's icon; the walk itself is walkAway/acts.ts's). */
const spawner = (c: Ctx, t: number) => { c.save(); c.translate(-18, 12); drawSpawner(c, t); c.restore(); };

void mix; void rampOf;

export const SPACE_QUEEN: SceneDef = {
  land: 'FUTURE LAND',
  weapon: 'SPAWNER',
  sky: ['#1E1B4B', '#312E81', '#3730A3', '#4338CA', '#6366F1', '#818CF8', '#A5B4FC'],
  haze: '#8B7FB8',
  ground, back, props,
  drawWeapon: spawner,
  grip: [[-10, 8], [16, 0]],
  rim: '#F472B6',
  // (the glitter in the air off the disco, every color)
  embers: ['#F472B6', '#22D3EE', '#FDE047', '#A78BFA', '#FFFFFF'],
  ripple: false,
};
