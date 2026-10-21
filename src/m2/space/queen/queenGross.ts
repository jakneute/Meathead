// THE QUEEN'S GROSS-UP (LEGALLY DISTINCT) (the user's rule for every close-up: "gross ren and stimpy style close ups";
// grossKit.ts): her fight's first look at her, dropped out of the ceiling, screeching. In profile, huge, facing in at
// him: XENOSCARE's knockoff animatronic, and cheap with it. The long latex dome, scuffed and greasy, the servo rig they
// wired into her skull showing through its shine (gears, a circuit board, wires); the fanned crest riveted on (a rivet
// missing, glue crusted down the seam); the lips peeled back off silver teeth (chrome over plastic: chipped, one gone,
// one rusted, grease in the gums); the jaw hanging open, the throat glowing their green; THREE inner jaws on chrome
// rods, one inside the next (one too many), snapping out; motor oil (her "acid") strung between the jaws and running
// off her chin, a dead moth stuck in it; her neck's hoses zip-tied, a tear in the latex with the yellow foam bulging
// out, a chrome ball joint, a serial plate. Every wet thing catching the disco's light.
// Live: the throat's glow pulsing, the inner jaws snapping in and out (two stamps), oil dripping, a wire sparking.

import {
  type Ctx, type Buf, GW, GH, R, hexU, mixU, WHITE, newBuf, cloneBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, poly, inkEdges, stamps, drawGrossStamp, grossBackdrop, hash2, bay, M_OTHER, M_METAL, M_MOUTH, M_CLOTH,
} from '../../grossKit';

const FX = 136, FY = 118;

const LATEX = R('#9AA8C8', '#6A7694', '#46506A', '#30364A', '#22263A', '#16182A', '#0C0C18', '#000000');
const CHROME = R('#FFFFFF', '#E4E6EE', '#C0C4CE', '#9A9EAA', '#727682', '#4A4C56', '#1E1E24');
const GUMQ = R('#E07AA4', '#C45A88', '#9A3A66', '#782650', '#561638', '#340A22', '#14020C');
const FOAM = R('#FFF6CC', '#FFE89A', '#EED27E', '#D6AE4A', '#A07B22', '#6A4E10', '#3A2A08');
const OIL = R('#B4A47A', '#7A6A44', '#4A3C20', '#2E2412', '#1A1408', '#0A0602');
const GREENR = R('#F4FFE0', '#C8FF9A', '#9BF25E', '#5CC22A', '#2F7A12', '#0B2A06');
const RUST = R('#E8A060', '#C47838', '#9A5420', '#703812', '#461E06', '#200C02');
const HOSE = R('#7A7A8A', '#56566A', '#3C3C4C', '#2A2A36', '#1A1A22', '#08080C');
const BOARD = R('#3A8A4A', '#2A6A38', '#1C4A28', '#10301A', '#081A0E');
const M_DOME = 11, M_CREST = 12;

type Key = 'a' | 'b';

/** The dome's outline: the snout at the left, up and back to the crown at the right (a point inside it). */
const inDome = (x: number, y: number) => {
  const t = (x - 30) / 230;
  if (t < 0) return false;
  const top = 116 - Math.sin(Math.min(1, t * 1.25) * Math.PI / 2) * 76 + t * 12;
  const bot = 128 - t * 24 + Math.max(0, t - 0.7) * 30;
  const nose = t < 0.06 ? (0.06 - t) * 300 : 0;
  return y > top + nose * 0.4 && y < bot - nose * 0.4;
};

const base = (): Buf => {
  setSeed(4040);
  const b = newBuf();
  // ---- her neck: a ribbed column down and back, a hose round it zip-tied, a chrome ball joint, the latex torn (the
  // yellow foam bulging out), a serial plate riveted on
  poly(b, [176, 112, 272, 70, 272, 204, 140, 204], LATEX.slice(2), M_CLOTH, { tilt: 0.5 });
  for (let k = 0; k < 7; k++) {
    const x0 = 160 + k * 18;
    for (let y = 100; y < GH; y++) {
      const x = Math.round(x0 + (y - 100) * -0.25 + Math.sin(y * 0.05) * 2);
      if (matAt(b, x, y) !== M_CLOTH) continue;
      plot(b, x, y, LATEX[7]); plot(b, x + 1, y, LATEX[2]); plot(b, x + 2, y, LATEX[3]);
      if (bay(x + 3, y) < 0.5) plot(b, x + 3, y, LATEX[3]);
      plot(b, x - 1, y, LATEX[5]); plot(b, x - 2, y, LATEX[5]);
    }
  }
  const hose: number[] = [];
  for (let k = 0; k <= 20; k++) { const u = k / 20; hose.push(196 + u * 50 + Math.sin(u * 3) * 10, 124 + u * 84); }
  for (let d = -4; d <= 4; d++) path(b, hose.map((v, i) => (i % 2 ? v : v + d)), HOSE[Math.abs(d) === 4 ? 5 : d < -2 ? 0 : d < 0 ? 1 : d < 2 ? 2 : 3], 1, M_OTHER);
  for (const k of [6, 13]) { const x = hose[k * 2], y = hose[k * 2 + 1]; seg(b, x - 6, y - 1, x + 6, y + 1, hexU('#F0F0E8'), 2, M_OTHER); poly(b, [x + 6, y - 1, x + 11, y - 3, x + 11, y + 1, x + 6, y + 2], R('#FFFFFF', '#F0F0E8', '#D0D0C8', '#A0A098', '#606058'), M_OTHER); }
  ball(b, 176, 182, 10, 10, CHROME.slice(1), { mat: M_METAL, line: true });
  ball(b, 173, 179, 3, 2, R('#FFFFFF', '#FFFFFF', '#E4E6EE', '#C0C4CE', '#9A9EAA'), { soft: 0.3 });
  // (the tear: ragged lips of latex, the foam bulging out of it, crumbs of it)
  ball(b, 238, 156, 11, 8, FOAM, { mat: M_OTHER });
  for (let k = 0; k < 40; k++) { const x = 228 + rnd() * 22, y = 149 + rnd() * 15; if (matAt(b, x, y) === M_OTHER && hash2(Math.round(x), Math.round(y)) > 0.4) plot(b, x, y, FOAM[rnd() < 0.5 ? 5 : 0]); }
  path(b, [226, 152, 230, 147, 235, 151, 240, 146, 245, 150, 250, 148], LATEX[7], 2);
  path(b, [226, 160, 232, 164, 238, 162, 244, 166, 250, 162], LATEX[7], 2);
  path(b, [227, 151, 231, 146, 236, 150], LATEX[1], 1);
  for (const [x, y] of [[232, 170], [236, 174], [234, 180]] as const) plot(b, x, y, FOAM[2]);
  // (the serial plate)
  poly(b, [200, 182, 230, 176, 232, 192, 202, 198], CHROME, M_METAL);
  for (let k = 0; k < 10; k++) seg(b, 205 + k * 2.4, 183 - k * 0.5, 205 + k * 2.4, 191 - k * 0.5, k % 3 ? CHROME[6] : CHROME[4]);
  for (const [x, y] of [[202, 184], [229, 178], [203, 195], [230, 189]] as const) plot(b, x, y, CHROME[0]);
  // ---- the crest: a flat fan back over her head, ridged, scalloped, riveted on (one gone, glue crusted at the seam)
  {
    const px0 = 206, py0 = 74;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const dx = x - px0, dy = y - py0, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
      if (a > -0.15 || a < -Math.PI * 0.85) continue;
      const u = (a + Math.PI * 0.85) / (Math.PI * 0.7);
      const rim = 104 + Math.sin(u * Math.PI * 6) * 6 + u * 20;
      if (d > rim) continue;
      const rib = Math.abs(Math.sin(u * Math.PI * 9));
      const edge = d > rim - 1.5;
      const k = edge ? 7 : Math.max(0, Math.min(6, Math.round((1 - rib) * 3 + (d / rim) * 2.5 + (bay(x, y) - 0.5) * 0.9 + 1)));
      plot(b, x, y, LATEX[k], M_CREST);
    }
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI * 0.85 + ((k + 0.5) / 9) * Math.PI * 0.7;
      for (const d of [44, 70, 92]) { const x = px0 + Math.cos(a) * d, y = py0 + Math.sin(a) * d; if (k === 5 && d === 70) { ball(b, x, y, 2.6, 2.6, R('#2A2A30', '#16161A', '#0A0A0C', '#040406', '#000000')); continue; } ball(b, x, y, 2.4, 2.4, CHROME, { line: true, lw: 0.8 }); }
    }
    for (let k = 0; k < 6; k++) { const x = 150 + k * 16, y = 70 - k * 2; ball(b, x, y + rnd() * 3, 2.4, 3.4, R('#FFFCE8', '#F0E8C0', '#D8C890', '#B0A060', '#706030'), { line: true, lw: 0.7 }); }
  }
  // ---- the dome: long and glossy, the snout at the left
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (!inDome(x, y)) continue;
    // (a long cylinder's shading: lit along its top, dark under, a band of reflected light low down)
    let top = y, bot = y;
    while (top > 0 && inDome(x, top - 1)) top--;
    while (bot < GH - 1 && inDome(x, bot + 1)) bot++;
    const v = (y - top) / Math.max(1, bot - top);
    const lv = v < 0.12 ? 0.95 : v < 0.3 ? 0.7 - (v - 0.12) * 1.2 : v < 0.75 ? 0.45 - (v - 0.3) * 0.7 : 0.13 + (v - 0.75) * 0.6;
    const s = (1 - lv) * 6.3 - 0.4 + (bay(x, y) - 0.5) * 0.9;
    plot(b, x, y, LATEX[Math.max(0, Math.min(6, Math.round(s)))], M_DOME);
  }
  // (the rig through the latex: a gear or two, a circuit board, a bundle of wires; dithered, under the shine)
  const under = (x: number, y: number, col: number) => { if (matAt(b, x, y) === M_DOME && bay(x, y) < 0.55) plot(b, x, y, mixU(b.px[y * GW + x], col, 0.55)); };
  for (const [gx, gy, gr] of [[168, 84, 16], [196, 92, 10], [128, 96, 8]] as const) {
    for (let y = gy - gr - 3; y <= gy + gr + 3; y++) for (let x = gx - gr - 3; x <= gx + gr + 3; x++) {
      const d = Math.hypot(x - gx, y - gy), a = Math.atan2(y - gy, x - gx);
      const r = gr + (Math.cos(a * 10) > 0.3 ? 3 : 0);
      if (d < r && d > gr * 0.3 && !(d > gr * 0.55 && d < gr * 0.75 && Math.cos(a * 4) > 0.6)) under(x, y, hexU('#8A8A70'));
    }
  }
  for (let y = 98; y < 112; y++) for (let x = 140; x < 170; x++) under(x, y, BOARD[1]);
  for (let k = 0; k < 6; k++) { let x = 210, y = 80 + k * 4; for (let i = 0; i < 70; i++) { x -= 1; y += Math.sin(i * 0.15 + k) * 0.6; under(Math.round(x), Math.round(y), hexU(['#C83030', '#3060D0', '#D0B030'][k % 3])); } }
  // (the gloss: the long hard shine down the top, the specular glint, a smear of grease through it, dust in the grease)
  for (let x = 50; x < 250; x++) {
    let y = 0; while (y < GH && !inDome(x, y)) y++;
    const w = x < 80 ? 1 : x < 200 ? 3 : 2;
    for (let d = 2; d < 2 + w; d++) if (matAt(b, x, y + d) === M_DOME && !(x > 120 && x < 136)) plot(b, x, y + d, d === 2 ? WHITE : LATEX[0]);
  }
  ball(b, 150, 54, 6, 2.5, R('#FFFFFF', '#FFFFFF', '#EEF3FF', '#B9C6DE', '#9AA8C8'), { soft: 0.4 });
  for (let k = 0; k < 140; k++) { const x = 40 + rnd() * 220, y = 40 + rnd() * 90; if (matAt(b, x, y) === M_DOME) plot(b, x, y, rnd() < 0.5 ? LATEX[1] : hexU('#6A5A3A')); }
  // (the seam down the dome where the latex halves meet: glue crusted, drips)
  path(b, [230, 54, 200, 60, 160, 68, 120, 82, 80, 98, 44, 112], LATEX[7], 1, undefined, M_DOME);
  for (const x of [200, 162, 124, 92]) { const y = x === 200 ? 60 : x === 162 ? 68 : x === 124 ? 81 : 95; seg(b, x, y + 1, x - 1, y + 6, hexU('#D8C890'), 1, undefined, M_DOME); plot(b, x - 1, y + 7, hexU('#F0E8C0')); }
  // (scuffs, a gouge in it)
  for (let k = 0; k < 16; k++) { const x = 60 + rnd() * 180, y = 50 + rnd() * 70; if (matAt(b, x, y) === M_DOME) seg(b, x, y, x + 4 + rnd() * 8, y + (rnd() - 0.5) * 3, LATEX[1], 1, undefined, M_DOME); }
  inkEdges(b, M_DOME, LATEX[7]);
  inkEdges(b, M_CREST, LATEX[7], [M_DOME]);
  return b;
};

/** The dome's underside at x (the upper jaw's edge), and the lower jaw's top edge and underside, hanging open. */
const upper = (x: number) => { const t = (x - 30) / 230; return 127 - t * 24; };
const lowerTop = (x: number) => 136 + (190 - x) * 0.34;
const lowerBot = (x: number) => lowerTop(x) + 22 + (190 - x) * 0.04;

/** The jaws: the mouth (open), the gums, the teeth, the throat's glow, the inner jaws out `out` 0..1, the oil. */
const jaws = (b: Buf, out: number) => {
  setSeed(777);
  // (the lower jaw, hanging, its chin rounded; scuffed, greasy, its underside in shadow)
  for (let x = 40; x <= 196; x++) {
    const t0 = lowerTop(x), t1 = lowerBot(x) - (x < 52 ? (52 - x) ** 2 * 0.15 : 0);
    for (let y = Math.round(t0); y <= t1; y++) {
      const v = (y - t0) / Math.max(1, t1 - t0);
      const k = y >= t1 - 0.5 || x === 40 ? 7 : Math.max(0, Math.min(6, Math.round(1 + v * 5 + (bay(x, y) - 0.5) * 0.9)));
      plot(b, x, y, LATEX[k], M_OTHER);
    }
  }
  for (let x = 48; x < 190; x++) if (hash2(x, 9) > 0.55) plot(b, x, lowerTop(x) + 4, LATEX[0]);
  for (let k = 0; k < 40; k++) { const x = 50 + rnd() * 140, y = lowerTop(x) + 6 + rnd() * 14; if (matAt(b, x, y) === M_OTHER) plot(b, x, y, rnd() < 0.5 ? LATEX[1] : hexU('#6A5A3A')); }
  // (inside: the mouth, wet magenta-black, ribbed; the throat lit green at the back)
  for (let x = 40; x <= 192; x++) for (let y = Math.round(upper(x)); y < lowerTop(x); y++) {
    const v = (y - upper(x)) / Math.max(1, lowerTop(x) - upper(x));
    let k = 5 + Math.round(-(1 - Math.abs(v - 0.5) * 2) * 1.5 + (x - 40) / 80 + (bay(x, y) - 0.5));
    if (Math.sin(x * 0.35) > 0.85) k--;
    plot(b, x, y, GUMQ[Math.max(3, Math.min(6, k))], M_MOUTH);
  }
  for (let y = 100; y < 170; y++) for (let x = 140; x < 196; x++) if (matAt(b, x, y) === M_MOUTH) { const d = Math.hypot((x - 182) / 20, (y - 132) / 16); if (d < 1 && bay(x, y) < 1.1 - d) plot(b, x, y, GREENR[Math.min(5, 1 + Math.round(d * 4))]); }
  // (the gums: along the top (drawn back off the teeth), along the bottom; wet, a shine along them)
  for (let x = 34; x < 186; x++) { const t = Math.round(upper(x)); for (let d = 0; d < 7; d++) plot(b, x, t + d, GUMQ[d === 6 ? 5 : d < 2 ? (hash2(x, d) > 0.7 ? 0 : 1) : d < 4 ? 2 : 3], M_OTHER); }
  for (let x = 44; x < 190; x++) { const t = Math.round(lowerTop(x)) - 5; for (let d = 0; d < 6; d++) plot(b, x, t + d, GUMQ[d === 0 ? 5 : d < 2 ? (hash2(x, d + 7) > 0.7 ? 0 : 1) : 2], M_OTHER); }
  // (the silver teeth: chrome over plastic, long, curved back; chipped, one gone, one rusted; grease at their roots)
  for (let i = 0; i < 15; i++) {
    if (i === 4) continue;
    const x = 40 + i * 9.6, t = Math.round(upper(x)) + 6, len = 18 + (i % 3 === 0 ? 5 : 0) - i * 0.25;
    const ramp = i === 9 ? RUST : CHROME;
    for (let yy = 0; yy < len; yy++) {
      const w = Math.max(0.5, 3.6 * (1 - (yy / len) ** 2)), xc = x + (yy / len) ** 2 * 3.5;
      for (let xx = -Math.ceil(w); xx <= Math.ceil(w); xx++) {
        if (Math.abs(xx) > w) continue;
        if (i === 11 && yy > len * 0.55 && xx > -1) continue;
        const u = (xx + w) / (2 * w), k = Math.abs(xx) >= w - 0.5 ? 6 : u < 0.3 ? 0 : u < 0.55 ? 2 : u < 0.8 ? 3 : 4;
        plot(b, xc + xx, t + yy, ramp[Math.min(ramp.length - 1, k)], M_METAL);
      }
    }
    if (i !== 9) for (let yy = Math.round(len * 0.4); yy < len - 2; yy += 3) if (rnd() < 0.6) plot(b, x + 1, t + yy, hexU('#E8C8A0'));
    for (let xx = -2; xx <= 2; xx++) if (rnd() < 0.7) plot(b, x + xx, t, OIL[3]);
  }
  for (let i = 0; i < 14; i++) {
    const x = 50 + i * 10, t = Math.round(lowerTop(x)) - 5, len = 11 - i * 0.2;
    for (let yy = 0; yy < len; yy++) {
      const w = Math.max(0.5, 3 * (1 - (yy / len) ** 2));
      for (let xx = -Math.ceil(w); xx <= Math.ceil(w); xx++) { if (Math.abs(xx) > w) continue; const u = (xx + w) / (2 * w); plot(b, x + xx, t - yy, CHROME[Math.abs(xx) >= w - 0.5 ? 6 : u < 0.35 ? 1 : u < 0.7 ? 3 : 4], M_METAL); }
    }
  }
  // (the inner jaws: three, one inside the next, out on chrome rods; each a little latex mouth with its own teeth)
  const mid = (x: number) => (upper(x) + lowerTop(x)) / 2 + 3;
  const rod = (x0: number, y0: number, x1: number, y1: number, w: number) => { for (let d = -w; d <= w; d++) seg(b, x0, y0 + d, x1, y1 + d, CHROME[Math.abs(d) === w ? 6 : d < 0 ? 1 : d === 0 ? 2 : 4], 1, M_METAL); };
  const tips: [number, number, number][] = [];
  for (let j = 0; j < 3; j++) {
    const reach = (40 + j * 34) * (0.4 + 0.6 * out), x1 = 176 - reach, y1 = mid(x1) + (j - 1) * 3, sz = 13 - j * 2.8;
    rod(188, mid(188) + (j - 1) * 2, x1 + sz, y1, j === 0 ? 2 : 1);
    tips.push([x1, y1, sz]);
  }
  for (let j = 0; j < 3; j++) {
    const [x, y, sz] = tips[j];
    ball(b, x + sz * 0.3, y, sz, sz * 0.78, LATEX, { mat: M_OTHER, line: true });
    ball(b, x - sz * 0.38, y + 1, sz * 0.55, sz * 0.42, GUMQ.slice(3), { mat: M_OTHER });
    for (let k = 0; k < 4; k++) { const tx = x - sz * 0.75 + k * (sz * 0.32); seg(b, tx, y - sz * 0.36, tx, y - sz * 0.04, CHROME[1], 1); seg(b, tx, y + sz * 0.44, tx, y + sz * 0.14, CHROME[2], 1); }
    plot(b, x + sz * 0.1, y - sz * 0.6, WHITE); plot(b, x + sz * 0.1 + 1, y - sz * 0.6, WHITE);
    // (slime off it)
    for (let k = 0; k < 4 + j * 2; k++) plot(b, x - sz * 0.2, y + sz * 0.8 + k, OIL[k % 2 ? 1 : 2]);
  }
  // (the oil: strung between the jaws, thick, catching the light)
  for (const [x, a, k] of [[62, 0.2, 0], [92, -0.3, 1], [120, 0.4, 2], [146, 0, 3], [74, -0.1, 4]] as const) {
    const y0 = Math.round(upper(x)) + 22, y1 = Math.round(lowerTop(x)) - 6;
    for (let y = y0; y < y1; y++) {
      const xx = x + Math.sin((y - y0) * 0.25 + a * 5) * 1.5 + (y - y0) * a * 0.12;
      if (matAt(b, xx, y) === M_METAL) continue;
      plot(b, xx, y, OIL[k % 2 ? 2 : 1]); plot(b, xx + 1, y, OIL[3]);
      if ((y - y0) % 7 === 3) plot(b, xx, y, OIL[0]);
    }
  }
  // (running off her chin)
  for (const [x, n] of [[46, 12], [70, 16], [104, 9]] as const) {
    const y = Math.round(lowerBot(x)) - 1;
    for (let k = 0; k < n; k++) { plot(b, x + Math.sin(k * 0.5), y + k, OIL[2]); plot(b, x + 1 + Math.sin(k * 0.5), y + k, OIL[3]); }
    ball(b, x + 0.5, y + n + 1.5, 2, 2.6, OIL, { line: (_dx, dy) => dy > 0.3, lw: 0.6 }); plot(b, x, y + n, OIL[0]);
  }
  // (the moth, stuck in the slobber on her lower jaw: wings out, dusty)
  const mx = 128, my = lowerTop(128) + 9;
  ball(b, mx, my, 2, 4, R('#8A7A60', '#6A5A44', '#4A3E2C', '#2E2618', '#14100A'));
  for (const s2 of [-1, 1]) ball(b, mx + s2 * 5, my - 2, 5, 3.4, R('#D8C8A8', '#B8A684', '#968464', '#706048', '#3E3424'), { line: true, lw: 0.7 });
  tint(b, mx, my + 2, 9, 4, OIL[1], 0.5, M_OTHER, 0.5);
};

let baseBuf: Buf | null = null;
const get = stamps<Key>((key) => {
  if (!baseBuf) baseBuf = base();
  const b = cloneBuf(baseBuf);
  jaws(b, key === 'a' ? 1 : 0.6);
  return b;
});

/** Her gross-up: (cx, cy) where her middle goes on the screen, `zoom` 1 at the hold; `jolt` a shake (the screech). */
export const drawQueenGross = (c: Ctx, cx: number, cy: number, zoom: number, f: number, jolt = 0) => {
  const snap = Math.floor(f / 7) % 3 === 0;
  const s = get(snap ? 'b' : 'a');
  drawGrossStamp(c, s.img, cx, cy, FX, FY, zoom, f, jolt, (box) => {
    // (the throat's glow, pulsing)
    const p = 0.5 + 0.5 * Math.sin(f * 0.2);
    c.globalAlpha = 0.25 + p * 0.35;
    box(160, 120, 18, 14, '#9BF25E'); box(164, 123, 10, 8, '#E4FFC8');
    c.globalAlpha = 1;
    // (oil dripping off her chin, a drop at a time)
    for (const [x, y, ph] of [[60, 203, 0], [96, 203, 23], [130, 191, 47]] as const) {
      const t = ((f + ph) % 60) / 60;
      if (t < 0.5) continue;
      const d = (t - 0.5) / 0.5;
      box(x, y + d * d * 40, 2, 3, '#2E2412'); box(x, y + d * d * 40, 1, 1, '#B4A47A');
    }
    // (a torn wire at the tear, sparking now and then)
    if (f % 50 < 6) { const k = f % 3; box(250 + k, 154 - k * 2, 2, 2, '#FFFFFF'); box(253 - k, 150, 1, 1, '#FDE047'); box(247, 151 + k, 1, 1, '#FDE047'); }
  });
};

/** Behind her: the disco's lights in bands. */
export const drawQueenGrossBack = (c: Ctx, W: number, H: number) => grossBackdrop(c, W, H, ['#12041E', '#22083A', '#360C56', '#4C1270', '#661A86']);
