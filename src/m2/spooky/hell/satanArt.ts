// Satan, painted: the best-drawn thing in Spooky Land (he's the land's big bad, even if he's only dropping in).
//
// Every form's shaded by its own outline (the outline's copy shifted toward the light and away from it, so the steps
// follow the form round instead of sitting on it in circles): lit from below by the lava (the hot rim along every
// underside, the planes facing down lit warm, the tops in shadow), a faint cold light from above-left on the tops of
// things; four or five steps to a material, dithered where the steps meet, crisp ink round everything, the creases
// between muscles inked with the light catching under them. Painted once into a stamp; the eyes (burning) and the
// mouth (a sly, lopsided grin that moves when he talks) live over it.
//
// Local: x 0 his middle; y 0 about the top of his head (the horns go up past it); the lake hides him below ~550.

import { type Ctx, INK, mix, checker, LAVA } from './paint';

type Pt = [number, number];
/** The skin: shadow up to highlight; the hot light off the lava. */
const SK = ['#260404', '#4A0A08', '#721410', '#982018', '#BE3424', '#DE5838'];
const HOT = ['#C8401C', '#E8662A', '#F89A48'];
const HORN = ['#080606', '#161010', '#261C1A', '#3A2C28', '#54423A', '#76604E'];
const HAIRC = ['#040303', '#0E0909', '#1A1212', '#2A1E1C'];
const MEM = ['#120303', '#200606', '#320B0A', '#481210', '#601C16'];
const CLAW = ['#0C0A0A', '#2A2422', '#4A403A', '#7A6C60'];

// ---------------------------------------------------------------------------------------------------------------
// Shapes from points (smooth: a curve through them)

/** A closed smooth outline through the points (quadratic curves through the midpoints). */
const smooth = (g: Ctx, p: Pt[], dx = 0, dy = 0) => {
  const n = p.length, m = (i: number): Pt => [(p[i % n][0] + p[(i + 1) % n][0]) / 2 + dx, (p[i % n][1] + p[(i + 1) % n][1]) / 2 + dy];
  g.moveTo(...m(n - 1));
  for (let i = 0; i < n; i++) g.quadraticCurveTo(p[i][0] + dx, p[i][1] + dy, ...m(i));
  g.closePath();
};
/** What's in the outline but not in its copy shifted (dx, dy): the band along the far side from the shift. */
const band = (g: Ctx, p: Pt[], dx: number, dy: number, col: string, dither = true) => {
  g.save(); g.beginPath(); smooth(g, p); g.clip();
  g.beginPath(); smooth(g, p); smooth(g, p, dx, dy); g.fillStyle = col; g.fill('evenodd');
  if (dither) {
    // (and a checker of it a step further in: the step's seam broken up)
    g.beginPath(); smooth(g, p, dx, dy); smooth(g, p, dx * 1.35, dy * 1.35); g.clip('evenodd');
    const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    checker(g, Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) - Math.min(...xs) + 8, Math.max(...ys) - Math.min(...ys) + 8, col, 0);
  }
  g.restore();
};
/**
 * A form, lit by the lava from below: its shadow, then the planes facing down lit in steps from the bottom edge up
 * (`lift`: how far up the light reaches), the hot rim right along the underside, a cold catch along its upper left;
 * inked.
 */
const form = (g: Ctx, p: Pt[], R: readonly string[], lift = 14, line = 2) => {
  g.beginPath(); smooth(g, p); g.fillStyle = R[2]; g.fill();
  // (the shadow: the top and the far side, turned from the lava; its darkest right at the edge)
  band(g, p, -lift * 0.45, lift * 0.8, R[1]);
  band(g, p, -2, 3, R[0], false);
  // (the planes facing down, lit from under, in steps up from the bottom edge; the hot rim)
  band(g, p, lift * 0.2, -lift * 0.7, R[3]);
  band(g, p, lift * 0.08, -lift * 0.32, R[4] ?? R[3]);
  band(g, p, 0, -2.5, mix(R[4] ?? R[3], HOT[1], 0.55), false);
  // (a cold catch-light along the upper left)
  band(g, p, 3, 3, mix(R[3], '#9AA0C8', 0.28));
  g.beginPath(); smooth(g, p); g.strokeStyle = INK; g.lineWidth = line; g.lineJoin = 'round'; g.stroke();
};
/** A crease between forms: an ink line, the light catching just under it. */
const crease = (g: Ctx, p: Pt[], w = 1.6, lit: string = SK[4]) => {
  const line = (dy: number, col: string, lw: number) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0][0], p[0][1] + dy); for (let i = 1; i < p.length - 1; i++) g.quadraticCurveTo(p[i][0], p[i][1] + dy, (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2 + dy); g.lineTo(p[p.length - 1][0], p[p.length - 1][1] + dy); g.stroke(); g.lineCap = 'butt'; };
  line(1.6, lit, w * 0.8); line(0, INK, w);
};
const mirror = (p: Pt[]): Pt[] => p.map(([x, y]) => [-x, y] as Pt).reverse();

// ---------------------------------------------------------------------------------------------------------------

/** A horn: from its root out along a curl, tapering, ridged (a ring every so often, lit from below). */
const horn = (g: Ctx, s: number) => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    // (out and up from the temple, sweeping back, the tip curling up and in)
    const a = -0.1 - t * 1.75;
    pts.push([s * (46 + Math.cos(a) * 70 * (0.4 + t) + t * 30), 64 + Math.sin(a) * 80 * (0.3 + t * 0.9) - t * 40]);
  }
  const w = (t: number) => 40 * Math.pow(1 - t, 0.8) + 3;
  const L: Pt[] = [], Rr: Pt[] = [];
  pts.forEach(([x, y], i) => {
    const a = pts[Math.min(14, i + 1)], b = pts[Math.max(0, i - 1)], tx = a[0] - b[0], ty = a[1] - b[1], d = Math.hypot(tx, ty) || 1;
    const nx = -ty / d, ny = tx / d, ww = w(i / 14) / 2;
    L.push([x + nx * ww, y + ny * ww]); Rr.push([x - nx * ww, y - ny * ww]);
  });
  const outline: Pt[] = [...L, ...Rr.reverse()];
  form(g, outline, HORN, 10);
  // (the ridges: rings round it, inked, lit along their under edges)
  for (let i = 1; i < 13; i++) {
    const a = L[i], b = Rr[Rr.length - 1 - i];
    g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + s * 3, (a[1] + b[1]) / 2 + 3, b[0], b[1]); g.stroke();
    g.strokeStyle = HORN[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1] + 2); g.quadraticCurveTo((a[0] + b[0]) / 2 + s * 3, (a[1] + b[1]) / 2 + 5, b[0], b[1] + 2); g.stroke();
  }
};

/** A wing: the arm of it up and out from behind his shoulder, the fingers fanning to claws, the membrane between
 *  (veined, torn through in places), scalloped between the fingertips. */
const wing = (g: Ctx, s: number) => {
  const root: Pt = [s * 150, 300], wrist: Pt = [s * 270, 30];
  const tips: Pt[] = [[s * 380, 40], [s * 420, 170], [s * 400, 300], [s * 340, 410], [s * 240, 470]];
  // (the membrane: from the root up the arm, out to each tip, scalloped in between)
  const mem: Pt[] = [root, [s * 200, 140], wrist];
  tips.forEach((t, i) => { mem.push(t); const nxt = tips[i + 1] ?? root; mem.push([(t[0] + nxt[0]) / 2 - s * 26, (t[1] + nxt[1]) / 2 - 6]); });
  form(g, mem, MEM, 30, 2.5);
  // (veins: dark, branching off the bones)
  g.strokeStyle = MEM[0]; g.lineWidth = 1.2;
  tips.forEach((t, i) => {
    for (let k = 1; k < 4; k++) {
      const u = k / 4, bx = wrist[0] + (t[0] - wrist[0]) * u, by = wrist[1] + (t[1] - wrist[1]) * u, n = tips[i + 1] ?? root;
      g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + (n[0] - bx) * 0.2, by + 18, bx + (n[0] - bx) * 0.3 - s * 6, by + (n[1] - by) * 0.3 + 10); g.stroke();
    }
  });
  // (tears: holes right through, ragged)
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (const [hx, hy, r] of [[s * 330, 230, 12], [s * 300, 360, 8], [s * 360, 120, 7]] as [number, number, number][]) {
    g.beginPath(); for (let i = 0; i < 9; i++) { const a = i * 0.7, rr = r * (i % 2 ? 0.55 : 1); g.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr * 1.4); } g.closePath(); g.fill();
  }
  g.restore();
  for (const [hx, hy, r] of [[s * 330, 230, 12], [s * 300, 360, 8], [s * 360, 120, 7]] as [number, number, number][]) {
    g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < 9; i++) { const a = i * 0.7, rr = r * (i % 2 ? 0.55 : 1); g.lineTo(hx + Math.cos(a) * rr, hy + Math.sin(a) * rr * 1.4); } g.closePath(); g.stroke();
  }
  // (the bones: the arm, the fingers; knuckles; claws at the tips and the thumb)
  const bone = (a: Pt, b: Pt, w0: number, w1: number) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
    form(g, [[a[0] + nx * w0, a[1] + ny * w0], [(a[0] + b[0]) / 2 + nx * (w0 + w1) * 0.4, (a[1] + b[1]) / 2 + ny * (w0 + w1) * 0.4], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [(a[0] + b[0]) / 2 - nx * (w0 + w1) * 0.4, (a[1] + b[1]) / 2 - ny * (w0 + w1) * 0.4], [a[0] - nx * w0, a[1] - ny * w0]], SK, 5, 1.5);
  };
  bone(root, [s * 210, 150], 16, 11); bone([s * 210, 150], wrist, 11, 8);
  for (const t of tips) bone(wrist, t, 6, 2.5);
  form(g, [[wrist[0] - 12, wrist[1] + 8], [wrist[0] + s * 4, wrist[1] - 14], [wrist[0] + 12, wrist[1] + 8]], SK, 6, 1.5);
  form(g, [[wrist[0] - s * 4, wrist[1] - 8], [wrist[0] - s * 18, wrist[1] - 34], [wrist[0] + s * 6, wrist[1] - 10]], CLAW, 4, 1.5);
  for (const t of tips) form(g, [[t[0] - 4, t[1]], [t[0] + s * 10, t[1] + 8], [t[0] + 2, t[1] + 4]], CLAW, 3, 1.2);
};

/** A hand, gripping (over the far arm): fingers wrapped, black claws digging in. */
const hand = (g: Ctx, x: number, y: number, s: number) => {
  form(g, [[x - s * 30, y - 18], [x + s * 4, y - 26], [x + s * 30, y - 10], [x + s * 30, y + 18], [x - s * 10, y + 24], [x - s * 34, y + 6]], SK, 10);
  for (let i = 0; i < 4; i++) {
    const fx = x + s * (24 - i * 3), fy = y - 14 + i * 10;
    crease(g, [[fx - s * 14, fy], [fx, fy - 2], [fx + s * 6, fy + 2]], 1.4);
    form(g, [[fx + s * 4, fy - 3], [fx + s * 16, fy + 4], [fx + s * 4, fy + 4]], CLAW, 3, 1.2);
  }
};

/** The still part of him, painted once. */
export const paintSatan = (g: Ctx) => {
  // The wings, behind everything
  wing(g, -1); wing(g, 1);
  // The body: traps up the neck, the shoulders' great deltoids, the chest
  const chest: Pt[] = [[-60, 250], [-150, 282], [-250, 320], [-292, 420], [-300, 640], [300, 640], [292, 420], [250, 320], [150, 282], [60, 250]];
  form(g, chest, SK, 30, 3);
  const trapL: Pt[] = [[-46, 236], [-120, 268], [-200, 300], [-120, 300], [-60, 290]];
  form(g, trapL, SK, 10); form(g, mirror(trapL), SK, 10);
  const delt: Pt[] = [[-200, 296], [-262, 300], [-302, 350], [-310, 420], [-280, 470], [-238, 430], [-210, 360]];
  form(g, delt, SK, 26, 2.5); form(g, mirror(delt), SK, 26, 2.5);
  // (the pecs: heavy, squared, their undersides hot)
  const pec: Pt[] = [[-6, 304], [-60, 294], [-150, 304], [-212, 340], [-206, 400], [-170, 440], [-100, 456], [-30, 446], [-10, 420], [-6, 360]];
  form(g, pec, SK, 30, 2.5); form(g, mirror(pec), SK, 30, 2.5);
  for (const s2 of [-1, 1]) for (let i = 0; i < 4; i++) crease(g, [[s2 * (150 + i * 8), 330 + i * 18], [s2 * (120 + i * 6), 340 + i * 22], [s2 * (96 + i * 4), 350 + i * 26]], 1, SK[3]);
  // (the collarbones; the breastbone; the abs going down under the arms)
  crease(g, [[-40, 284], [-110, 290], [-190, 306]], 1.8); crease(g, mirror([[-40, 284], [-110, 290], [-190, 306]]), 1.8);
  crease(g, [[0, 300], [0, 380], [0, 460]], 2);
  for (const y of [478, 520]) { crease(g, [[-70, y], [-36, y + 4], [-6, y]], 1.6); crease(g, [[6, y], [36, y + 4], [70, y]], 1.6); }
  // The arms, folded: the upper arms down from the shoulders to the elbows out at his sides; the far forearm across
  // under, the near over it, tapering to the wrists; the hands gripping the arms, claws in
  for (const s2 of [-1, 1]) {
    const up: Pt[] = [[s2 * 210, 380], [s2 * 300, 400], [s2 * 316, 470], [s2 * 300, 548], [s2 * 250, 560], [s2 * 222, 500]];
    form(g, s2 < 0 ? up : up.reverse(), s2 < 0 ? SK.map(c => mix(c, INK, 0.1)) : SK, 26, 2.5);
    crease(g, [[s2 * 236, 410], [s2 * 270, 450], [s2 * 280, 500]], 1.4, SK[3]);
  }
  const farArm: Pt[] = [[-290, 500], [-200, 486], [-40, 478], [120, 470], [176, 476], [180, 506], [120, 512], [-40, 520], [-210, 532], [-296, 540]];
  form(g, farArm, SK.map(c => mix(c, INK, 0.14)), 22, 2.5);
  hand(g, 196, 490, 1);
  const nearArm: Pt[] = [[296, 520], [210, 504], [40, 512], [-120, 520], [-176, 518], [-182, 548], [-120, 556], [40, 560], [200, 566], [300, 572]];
  form(g, nearArm, SK, 24, 2.5);
  crease(g, [[200, 530], [80, 534], [-60, 538]], 1.3, SK[3]);
  crease(g, [[120, 516], [110, 540]], 1.2, SK[3]);
  hand(g, -196, 532, -1);
  // The neck: thick, the cords of it standing out
  const neck: Pt[] = [[-58, 300], [-52, 220], [52, 220], [58, 300], [0, 312]];
  form(g, neck, SK, 22);
  crease(g, [[-34, 232], [-44, 296]], 1.6); crease(g, [[34, 232], [44, 296]], 1.6); crease(g, [[-8, 286], [0, 296], [8, 286]], 1.4);
  // The ears: long, pointed back
  for (const s of [-1, 1]) { form(g, [[s * 68, 120], [s * 128, 82], [s * 104, 140], [s * 78, 184]], SK, 10); crease(g, [[s * 78, 128], [s * 102, 112], [s * 86, 160]], 1.2, SK[2]); }
  // The horns
  horn(g, -1); horn(g, 1);
  // The head: a long, gaunt face, cheekbones out, a narrow jaw
  const face: Pt[] = [[0, 30], [56, 40], [80, 90], [82, 140], [70, 180], [52, 226], [26, 254], [0, 262], [-26, 254], [-52, 226], [-70, 180], [-82, 140], [-80, 90], [-56, 40]];
  form(g, face, SK, 34, 3);
  // (the cheekbones' hollows, the temples, the jaw's line)
  for (const s of [-1, 1]) {
    g.save(); g.beginPath(); smooth(g, face); g.clip();
    g.beginPath(); smooth(g, [[s * 70, 158], [s * 48, 180], [s * 56, 222], [s * 74, 196]]); g.fillStyle = SK[1]; g.fill();
    checker(g, s < 0 ? -76 : 44, 150, 32, 76, SK[0], 0);
    g.restore();
    crease(g, [[s * 76, 150], [s * 52, 168], [s * 30, 176]], 1.6, HOT[0]);
    crease(g, [[s * 58, 230], [s * 36, 246]], 1.2, HOT[0]);
  }
  // (the hair: slicked back off a deep widow's peak)
  const hair: Pt[] = [[0, 82], [-28, 56], [-64, 64], [-84, 104], [-86, 60], [-60, 22], [0, 10], [60, 22], [86, 60], [84, 104], [64, 64], [28, 56]];
  form(g, hair, HAIRC, 6, 2.5);
  for (let i = 0; i < 6; i++) { const x = -60 + i * 24; g.strokeStyle = HAIRC[3]; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x * 0.4, 50); g.quadraticCurveTo(x * 0.8, 30, x, 20); g.stroke(); }
  // (the brow: a heavy ridge, down hard in the middle; the deep sockets under it)
  for (const s of [-1, 1]) {
    form(g, [[s * 4, 116], [s * 40, 98], [s * 74, 100], [s * 76, 112], [s * 40, 114], [s * 10, 130]], SK, 6, 2);
    g.beginPath(); smooth(g, [[s * 12, 130], [s * 40, 118], [s * 66, 120], [s * 58, 148], [s * 30, 150]]); g.fillStyle = SK[0]; g.fill();
  }
  crease(g, [[-6, 104], [-2, 118]], 1.4); crease(g, [[6, 104], [2, 118]], 1.4);
  // (the nose: long, hooked, its underside lit)
  form(g, [[-6, 126], [6, 126], [14, 176], [18, 190], [6, 196], [-6, 196], [-18, 190], [-14, 176]], SK, 12, 2);
  g.fillStyle = INK; g.fillRect(-12, 188, 6, 3); g.fillRect(6, 188, 6, 3);
  // (the smile lines, the mustache curled up at the ends, the goatee to a point)
  crease(g, [[-22, 196], [-38, 212], [-44, 232]], 1.6, HOT[0]); crease(g, [[22, 196], [40, 210], [48, 226]], 1.6, HOT[0]);
  const stache: Pt[] = [[0, 198], [-24, 200], [-50, 206], [-66, 190], [-58, 210], [-24, 212], [0, 208], [24, 212], [58, 210], [72, 186], [54, 206], [24, 200]];
  form(g, stache, HAIRC, 4, 1.8);
  const goatee: Pt[] = [[-22, 240], [0, 236], [22, 240], [14, 290], [4, 334], [0, 350], [-4, 330], [-12, 290]];
  form(g, goatee, HAIRC, 8, 2);
  for (let i = 0; i < 4; i++) { g.strokeStyle = HAIRC[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(-10 + i * 6, 246); g.lineTo(-4 + i * 2, 320 - i * 6); g.stroke(); }
};

/** The live parts: the eyes burning (no glow round them: the color's the heat), the grin (open when he talks). */
export const drawSatanFace = (c: Ctx, f: number, talking: boolean) => {
  for (const s of [-1, 1]) {
    const ex = s * 38, ey = 136;
    const eye: Pt[] = [[ex - s * 20, ey + 2], [ex - s * 4, ey - 6], [ex + s * 18, ey - 6], [ex + s * 14, ey + 4], [ex, ey + 7]];
    c.beginPath(); smooth(c, eye); c.fillStyle = HOT[0]; c.fill();
    c.beginPath(); smooth(c, eye.map(([x, y]) => [ex + (x - ex) * 0.72, ey + (y - ey) * 0.66 - 0.5] as Pt)); c.fillStyle = f % 40 < 20 ? LAVA[6] : LAVA[5]; c.fill();
    c.fillStyle = LAVA[7]; c.fillRect(Math.round(ex - 6), ey - 2, 9, 3);
    c.fillStyle = INK; c.fillRect(Math.round(ex + s * 2 - 1), ey - 6, 3, 12);
    c.beginPath(); smooth(c, eye); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
  }
  // (the grin: lopsided, up at his left; the teeth, fangs; open, talking, the forked tongue)
  const open = talking ? 4 + Math.round(Math.abs(Math.sin(f * 0.35)) * 12) : 2;
  const top: Pt[] = [[-40, 214], [-14, 218], [12, 216], [46, 202]];
  c.beginPath(); c.moveTo(top[0][0], top[0][1]);
  c.bezierCurveTo(top[1][0], top[1][1], top[2][0], top[2][1], top[3][0], top[3][1]);
  c.bezierCurveTo(30, 216 + open, 0, 224 + open, -40, 214);
  c.closePath(); c.fillStyle = '#160202'; c.fill(); c.strokeStyle = INK; c.lineWidth = 2.2; c.stroke();
  c.save(); c.clip();
  for (let i = 0; i < 9; i++) { const x = -34 + i * 9, y = 214 - (x > 0 ? x * 0.22 : 0) + 2; c.fillStyle = '#EADBB8'; c.fillRect(x, y, 7, 5); c.fillStyle = '#B8A684'; c.fillRect(x, y + 4, 7, 1); }
  if (open > 8) { c.fillStyle = '#8E2232'; c.fillRect(-14, 216 + open, 26, 6); c.fillStyle = '#B84452'; c.fillRect(-10, 216 + open, 8, 2); }
  c.restore();
  for (const [x, y] of [[-28, 216], [26, 210]] as Pt[]) { c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x, y + 13); c.lineTo(x + 4, y); c.fill(); c.fillStyle = '#F2E6C8'; c.beginPath(); c.moveTo(x - 2.5, y); c.lineTo(x, y + 10); c.lineTo(x + 2.5, y); c.fill(); }
  // (the corner of it, dug in: the smug side)
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(46, 202); c.quadraticCurveTo(54, 198, 56, 190); c.stroke();
};
