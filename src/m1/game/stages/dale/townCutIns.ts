// The two cut-ins at the jail, Ren and Stimpy close-ups held a beat each (in far more detail than anything else on
// the street): the ninja's sword up in the sky on its way down to Sheriff Dan, turning over and over, every nick in
// it, his blood on it, the wrap on the hilt, the guard, speed lines, a gleam running up it; then Riggs, coming
// straight at the camera: the grille filling the screen, chrome and bugs and tourist, the headlights flaring, him
// through the windshield, bandaged up where the bullet went through, veins up, teeth bared, spit flying,
// bloodshot, white knuckles on the wheel, his lizard on the dash, the heat coming off it and the camera shaking.
//
// Both are painted in pixels at half the screen's resolution (400 x 300), SNES fashion: ramps, banded gradients,
// stepped shading, dither. Whatever doesn't move is painted once and kept.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { bandedGradient, checker } from '../../render/pixelArt';
import { ramp } from '../../render/backdrops/core';

type Ctx = CanvasRenderingContext2D;
const LW = 400, LH = 300;

/** How long each is held (frames). */
export const CUT_SWORD = 96, CUT_RIGGS = 104;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const cache = new Map<string, HTMLCanvasElement>();
/** Painted once, kept. */
const painted = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let c = cache.get(key);
  if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; paint(g); cache.set(key, c); }
  return c;
};
let buf: HTMLCanvasElement | null = null;
const lowres = () => { if (!buf) { buf = document.createElement('canvas'); buf.width = LW; buf.height = LH; } const g = buf.getContext('2d')!; g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, 0); return g; };

/** A solid ellipse in whole pixels (no soft edge), row by row. */
const disc = (g: Ctx, cx: number, cy: number, rx: number, ry: number, c: string) => {
  g.fillStyle = c;
  for (let y = Math.ceil(-ry); y <= ry; y++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); if (hw > 0) g.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2, 1); }
};
const R = (g: Ctx, x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** Up to the screen at twice the size, with a strip-by-strip wobble (`shimmer(y)`: how far a row's pushed over). */
const blit = (ctx: Ctx, shake: { x: number; y: number }, zoom: number, shimmer?: (y: number) => number) => {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.translate(CANVAS_WIDTH / 2 + shake.x, CANVAS_HEIGHT / 2 + shake.y); ctx.scale(2 * zoom, 2 * zoom); ctx.translate(-LW / 2, -LH / 2);
  if (!shimmer) ctx.drawImage(buf!, 0, 0);
  else for (let y = 0; y < LH; y += 2) ctx.drawImage(buf!, 0, y, LW, 2, Math.round(shimmer(y)), y, LW, 2);
  ctx.restore();
};

/** The painted grain over the lot (it crawls), and dark round the edges in dithered steps. */
const finish = (g: Ctx, t: number) => {
  const seed = Math.floor(t / 3);
  for (let i = 0; i < 340; i++) { g.fillStyle = i % 2 ? 'rgba(255,250,235,0.10)' : 'rgba(0,0,0,0.14)'; g.fillRect(Math.floor(hash(i * 3.1 + seed) * LW), Math.floor(hash(i * 7.7 + seed * 1.3) * LH), 1, 1); }
  for (let k = 0; k < 4; k++) {
    const m = 4 + k * 6;
    checker(g, 0, 0, LW, m, `rgba(0,0,0,${0.35 - k * 0.07})`, k % 2, 1); checker(g, 0, LH - m, LW, m, `rgba(0,0,0,${0.35 - k * 0.07})`, k % 2, 1);
    checker(g, 0, 0, m, LH, `rgba(0,0,0,${0.35 - k * 0.07})`, k % 2, 1); checker(g, LW - m, 0, m, LH, `rgba(0,0,0,${0.35 - k * 0.07})`, k % 2, 1);
  }
};

/** A cut-in's way in and out: a white frame as it cuts, a lurch, and a white frame out. */
const cutFlash = (ctx: Ctx, t: number, len: number) => {
  const a = t < 3 ? 0.9 - t * 0.3 : t > len - 3 ? 0.9 - (len - t) * 0.3 : 0;
  if (a > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.restore(); }
};

// ---------------------------------------------------------------------------
// The sword
// ---------------------------------------------------------------------------

const SW_W = 330, SW_H = 64, SW_MID = 30;
/** The sword along its own length (pommel at the left, the point at the right), its middle at SW_MID. */
const swordSprite = () => painted('dale-cut-sword', SW_W, SW_H, g => {
  // The handle: ray skin under the wrap (white, beaded), the wrap over it in diamonds (red silk, black lacquer
  // edges, blood soaked into it), the ornament under the wrap, the pommel cap
  const t0 = 8, t1 = 92;
  R(g, t0, SW_MID - 9, t1 - t0, 18, '#E7E5E4');
  for (let x = t0; x < t1; x += 2) for (let y = SW_MID - 8; y < SW_MID + 9; y += 2) if (hash(x * 3 + y) < 0.5) R(g, x + (y % 4 ? 1 : 0), y, 1, 1, '#C8C3BD');
  for (let x = t0 + 2; x < t1 - 4; x += 12) {
    // (each crossing of the wrap: two bands over each other, lit along one edge, the diamond of skin between)
    g.fillStyle = '#7F1D1D'; g.beginPath(); g.moveTo(x, SW_MID - 9); g.lineTo(x + 8, SW_MID - 9); g.lineTo(x + 14, SW_MID + 9); g.lineTo(x + 6, SW_MID + 9); g.closePath(); g.fill();
    g.fillStyle = '#991B1B'; g.beginPath(); g.moveTo(x + 6, SW_MID - 9); g.lineTo(x + 14, SW_MID - 9); g.lineTo(x + 8, SW_MID + 9); g.lineTo(x, SW_MID + 9); g.closePath(); g.fill();
    R(g, x + 7, SW_MID - 9, 2, 18, '#B91C1C'); R(g, x + 1, SW_MID - 9, 1, 18, '#DC2626');
    R(g, x + 5, SW_MID - 2, 4, 4, '#E7E5E4'); R(g, x + 6, SW_MID - 1, 2, 2, '#FFFFFF');
  }
  // (soaked through, the half nearest the guard: darker, a drip off it)
  for (let x = t1 - 30; x < t1; x++) for (let y = SW_MID - 9; y < SW_MID + 9; y++) if (hash(x * 13 + y * 7) < 0.35 + (x - (t1 - 30)) / 60) R(g, x, y, 1, 1, hash(x + y) < 0.5 ? '#450A0A' : '#5F1010');
  R(g, t0, SW_MID - 9, t1 - t0, 1, '#1C1917'); R(g, t0, SW_MID + 8, t1 - t0, 1, '#1C1917');
  // the ornament (a gold dragon's back, just showing)
  R(g, 44, SW_MID - 4, 12, 6, '#A16207'); R(g, 45, SW_MID - 4, 10, 2, '#FACC15'); R(g, 47, SW_MID - 1, 2, 2, '#713F12'); R(g, 51, SW_MID - 1, 2, 2, '#713F12');
  // the pommel cap and the collar at the guard end: black iron, a gold rim
  R(g, 0, SW_MID - 10, 9, 20, '#1C1917'); R(g, 1, SW_MID - 9, 3, 18, '#44403C'); R(g, 0, SW_MID - 10, 9, 2, '#57534E'); R(g, 8, SW_MID - 10, 1, 20, '#CA8A04');
  R(g, 4, SW_MID - 3, 3, 6, '#A16207'); R(g, 5, SW_MID - 2, 1, 2, '#FDE68A');
  R(g, t1, SW_MID - 10, 6, 20, '#292524'); R(g, t1, SW_MID - 10, 6, 2, '#57534E'); R(g, t1 + 5, SW_MID - 10, 1, 20, '#CA8A04');
  // The guard: iron, round, seen three quarters on (an oval), stepped down its face, cut through in a pattern, gold rim
  const gx = t1 + 12;
  for (let k = 0; k < 4; k++) disc(g, gx, SW_MID, 9 - k * 0.5, 27 - k * 2, ['#0C0A09', '#1C1917', '#292524', '#3F3A36'][k]);
  disc(g, gx - 2, SW_MID - 8, 3, 9, '#57534E');
  for (const dy of [-16, 14]) { disc(g, gx, SW_MID + dy, 2, 4, '#0C0A09'); R(g, gx - 1, SW_MID + dy - 3, 1, 1, '#78716C'); }
  for (let y = -26; y <= 26; y += 4) R(g, gx + Math.round(9 * Math.sqrt(1 - (y * y) / 729)) - 1, SW_MID + y, 1, 2, '#CA8A04');
  // The collar on the blade: gold, banded
  const hb = gx + 8;
  R(g, hb, SW_MID - 9, 10, 17, '#A16207'); R(g, hb, SW_MID - 9, 10, 3, '#FDE68A'); R(g, hb, SW_MID - 6, 10, 3, '#FACC15'); R(g, hb, SW_MID + 5, 10, 3, '#713F12');
  for (let y = SW_MID - 6; y < SW_MID + 6; y += 3) R(g, hb + 2, y, 6, 1, '#CA8A04');
  // The blade, column by column: the back (dark), the flat (banded steel), the ridge line, the temper line wandering
  // along it, the edge (bright), with the curve on it and the point at the end
  const b0 = hb + 10, b1 = SW_W - 4, len = b1 - b0;
  const curve = (x: number) => -Math.pow((x - b0) / len, 2) * 7;
  const nicks = [b0 + 40, b0 + 41, b0 + 92, b0 + 93, b0 + 94, b0 + 150, b0 + 151, b0 + 178];
  for (let x = b0; x < b1; x++) {
    const u = (x - b0) / len, cy = SW_MID + curve(x);
    const point = u > 0.9 ? (u - 0.9) / 0.1 : 0;
    const w = 15 - u * 3 - point * point * 11;
    if (w < 1) continue;
    const top = cy - w / 2, bot = cy + w / 2;
    // (the point's own shape: the edge sweeps up to it)
    const lift = point * point * w * 0.55;
    R(g, x, top + lift * 0.2, 1, 2, '#3F3F46');
    R(g, x, top + 2 + lift * 0.2, 1, Math.max(1, w * 0.28), '#71717A');
    R(g, x, top + 2 + w * 0.28 + lift * 0.2, 1, 1, '#E4E4E7'); // the ridge
    const flat = top + 3 + w * 0.28 + lift * 0.2, edge = bot - lift;
    for (let y = flat; y < edge; y++) { const k = (y - flat) / Math.max(1, edge - flat); R(g, x, y, 1, 1, ramp(['#A1A1AA', '#D4D4D8', '#9CA3AF', '#C4C4CC'], k)); }
    // (the temper line: frosty white, in clouds)
    const hamon = edge - 3 - (Math.sin(x * 0.35) + Math.sin(x * 0.13)) * 1.2;
    R(g, x, hamon, 1, edge - hamon, '#E5E7EB'); R(g, x, hamon, 1, 1, '#FFFFFF');
    R(g, x, edge - 1, 1, 1, '#F8FAFC');
    // (nicks out of the edge, and scratches across the flat)
    if (nicks.includes(x)) g.clearRect(x, edge - 2 - (x % 2), 1, 3);
    if (hash(x * 1.7) < 0.05) R(g, x, flat + 1, 1, 3, '#71717A');
  }
  // the yokote: the line across where the point starts
  R(g, b0 + Math.round(len * 0.9), SW_MID - 7, 1, 12, '#52525B');
  // His blood on it: smeared along the flat from the collar out, thinning, beaded on the edge, drips hanging off it
  for (let x = b0; x < b0 + len * 0.45; x++) {
    const u = (x - b0) / (len * 0.45), cy = SW_MID + curve(x);
    // (in runs along it, the way it was wiped going in: thick by the collar, broken up and gone further out)
    for (let y = cy - 3; y < cy + 6; y++) if (Math.sin(y * 1.7 + x * 0.05) > 0.1 + u * 0.8 && hash(x * 5.3 + y * 2.1) < 0.85 - u * 0.6) R(g, x, y, 1, 1, hash(x + y * 3) < 0.4 ? '#7F1D1D' : hash(x * y) < 0.5 ? '#991B1B' : '#B91C1C');
  }
  for (const [dx, l] of [[18, 7], [46, 11], [73, 5], [104, 9], [131, 4]]) {
    const x = b0 + dx, cy = SW_MID + curve(x) + 7;
    R(g, x, cy, 1, l, '#991B1B'); disc(g, x + 0.5, cy + l + 1, 1.6, 2, '#B91C1C'); R(g, x, cy + l, 1, 1, '#FCA5A5');
  }
  for (let k = 0; k < 9; k++) { const x = b0 + 10 + k * 17; R(g, x, SW_MID + curve(x) - 2, 2, 1, '#FCA5A5'); }
});

/** The sky behind it: Dale's evening, banded and dithered, clouds streaming by. */
const swordSky = () => painted('dale-cut-sky', LW, LH, g => {
  bandedGradient(g, 0, 0, LW, LH, ['#140C2E', '#2E1A55', '#5C2A6E', '#A8406E', '#E0666A', '#F4A261', '#F9D28B'], 14, 1);
});

export const drawSwordCloseUp = (ctx: Ctx, t: number, f: number) => {
  const g = lowres();
  g.drawImage(swordSky(), 0, 0);
  // (clouds streaking past, the way it's going: down to the right, fast)
  for (let i = 0; i < 9; i++) {
    const y = (i * 37 + 20) % LH, x = ((i * 113 - t * (14 + i % 3 * 6)) % (LW + 200) + LW + 200) % (LW + 200) - 100;
    g.fillStyle = i % 2 ? 'rgba(249, 210, 139, 0.35)' : 'rgba(244, 162, 97, 0.3)';
    g.fillRect(Math.round(x), y, 90 + (i % 4) * 30, 3); g.fillRect(Math.round(x) + 20, y + 3, 60, 2);
  }
  // Speed lines out from behind it
  g.fillStyle = 'rgba(255, 247, 237, 0.55)';
  for (let i = 0; i < 26; i++) {
    const y = Math.floor(hash(i * 3.3 + Math.floor(t / 2)) * LH), l = 40 + hash(i) * 120, x = Math.floor(hash(i * 9.1 + Math.floor(t / 2)) * LW) - 60;
    g.fillRect(x, y, l, 1);
  }
  // It: across the frame, turning over slowly, pushing in
  const z = 1.0 + Math.min(t, CUT_SWORD) / CUT_SWORD * 0.12;
  const rot = -0.5 + t * 0.045;
  g.save(); g.translate(LW / 2 + Math.sin(t * 0.07) * 6, LH / 2 + Math.cos(t * 0.05) * 4); g.rotate(rot); g.scale(z * 0.92, z * 0.92);
  // (a smear of it behind, where it's just been)
  g.globalAlpha = 0.18; g.rotate(-0.09); g.drawImage(swordSprite(), -SW_W / 2, -SW_MID); g.rotate(0.09); g.globalAlpha = 1;
  g.drawImage(swordSprite(), -SW_W / 2, -SW_MID);
  // The gleam: a star of light running up the blade and off the point
  const gl = ((t * 5) % 260) - 20;
  if (gl > 0 && gl < 200) {
    const gx = -SW_W / 2 + 130 + gl, gy = -SW_MID + SW_MID - 3 - Math.pow(gl / 200, 2) * 7;
    g.fillStyle = '#FFFFFF'; g.fillRect(gx - 1, gy - 9, 2, 18); g.fillRect(gx - 9, gy - 1, 18, 2); g.fillRect(gx - 3, gy - 3, 6, 6);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(gx - 5, gy - 5, 10, 10);
  }
  g.restore();
  // (the noise of it: WHUP, WHUP, WHUP)
  g.font = 'bold 16px "Press Start 2P"'; g.textAlign = 'right';
  const n = Math.min(3, Math.floor(t / 22) + 1);
  for (let i = 0; i < n; i++) { g.fillStyle = '#1C1917'; g.fillText('WHUP!', LW - 22 + 2, LH - 30 - i * 26 + 2); g.fillStyle = i % 2 ? '#FDE68A' : '#FFFFFF'; g.fillText('WHUP!', LW - 22, LH - 30 - i * 26); }
  g.textAlign = 'left';
  finish(g, t);
  blit(ctx, { x: 0, y: 0 }, 1 + 0.04 * Math.exp(-t / 4));
  cutFlash(ctx, t, CUT_SWORD);
  void f;
};

// ---------------------------------------------------------------------------
// Riggs
// ---------------------------------------------------------------------------

/** The cab head on, and him in it, painted once (what moves goes on over it). */
const riggsBase = () => painted('dale-cut-riggs', LW, LH, g => {
  // The street behind it: the evening sky, the false fronts down it in silhouette, the dirt
  bandedGradient(g, 0, 0, LW, 120, ['#2E1A55', '#5C2A6E', '#A8406E', '#E0666A', '#F4A261'], 9, 1);
  for (let x = 0; x < LW; x += 46) { const h = 30 + hash(x) * 40; R(g, x, 120 - h, 44, h, '#3B1F3A'); R(g, x, 120 - h, 44, 2, '#5C2A4E'); }
  bandedGradient(g, 0, 120, LW, 180, ['#8B5A2B', '#A0703F', '#C08A55'], 6, 1);
  // The cab: red, the roof lights, the windshield, the grille under it, the headlights either side, the bumper
  const cx0 = 26, cx1 = 374;
  bandedGradient(g, cx0, 20, cx1 - cx0, 270, ['#7F1D1D', '#B91C1C', '#DC2626', '#B91C1C', '#991B1B'], 10, 1);
  R(g, cx0, 20, cx1 - cx0, 2, '#FCA5A5'); R(g, cx0, 20, 3, 270, '#EF4444'); R(g, cx1 - 3, 20, 3, 270, '#5F1010');
  for (let k = 0; k < 5; k++) { disc(g, 140 + k * 30, 15, 7, 4, '#B45309'); disc(g, 139 + k * 30, 14, 4, 2, '#FDE68A'); }
  R(g, cx0 - 8, 70, 10, 30, '#292524'); R(g, cx1 - 2, 70, 10, 30, '#292524'); // the mirrors
  // (the windshield: dark glass with the cab's inside in it)
  R(g, 42, 34, 316, 120, '#0F172A'); R(g, 42, 34, 316, 3, '#1E293B');
  R(g, 40, 32, 320, 2, '#1C1917'); R(g, 40, 154, 320, 3, '#1C1917');
  // Him: the flannel shoulders, the neck, the head (big, red, sweating), the bandage round it over both ears
  const hx = 226, hy = 96;
  bandedGradient(g, 120, 128, 210, 26, ['#991B1B', '#7F1D1D'], 3, 1);
  for (let x = 120; x < 330; x += 12) { R(g, x, 128, 3, 26, '#1C1917'); } R(g, 120, 138, 210, 3, '#1C1917');
  disc(g, hx, hy + 38, 30, 14, '#C68A4E');
  for (let k = 0; k < 5; k++) disc(g, hx - k * 1.5, hy - k * 1.2, 48 - k * 6, 54 - k * 7, ['#9A5B2E', '#B8723C', '#D08A4E', '#DE9C60', '#E8AE74'][k]);
  // (stubble down the jaw, dithered)
  for (let y = hy + 18; y < hy + 52; y++) for (let x = hx - 44; x < hx + 46; x++) if ((x + y) % 2 === 0 && Math.hypot((x - hx) / 48, (y - hy) / 54) < 1 && hash(x * 3 + y) < 0.45) R(g, x, y, 1, 1, '#6B4A2E');
  // the bandage: gauze round the top of the head and down over the ears, stepped, the weave in it, blood come through
  // where it went in and where it came out
  for (let k = 0; k < 3; k++) R(g, hx - 50 + k, hy - 34 + k * 7, 100 - k * 2, 8, ['#E7E5E4', '#F5F5F4', '#D6D3D1'][k]);
  for (const s of [-1, 1]) { R(g, hx + s * 44 - 7, hy - 30, 14, 34, '#E7E5E4'); R(g, hx + s * 44 - 7, hy - 30, 3, 34, '#FFFFFF'); R(g, hx + s * 44 + 4, hy - 30, 3, 34, '#A8A29E'); disc(g, hx + s * 44, hy - 12, 6, 8, '#B91C1C'); disc(g, hx + s * 44 - 1, hy - 13, 3, 4, '#DC2626'); R(g, hx + s * 44, hy - 4, 2, 10, '#991B1B'); }
  for (let x = hx - 48; x < hx + 48; x += 3) for (let y = hy - 34; y < hy - 14; y += 3) R(g, x, y, 1, 1, 'rgba(120,113,108,0.35)');
  // the cap on top, pushed back, the bill up
  disc(g, hx, hy - 40, 40, 14, '#1E3A8A'); R(g, hx - 40, hy - 44, 80, 4, '#3B5BB5'); disc(g, hx, hy - 30, 46, 5, '#172554');
  // (the brows, down hard; the nose; the mustache)
  for (const s of [-1, 1]) { g.fillStyle = '#3F2410'; g.beginPath(); g.moveTo(hx + s * 6, hy - 6); g.lineTo(hx + s * 34, hy - 18); g.lineTo(hx + s * 36, hy - 12); g.lineTo(hx + s * 8, hy); g.closePath(); g.fill(); }
  disc(g, hx, hy + 12, 9, 10, '#C67B42'); disc(g, hx - 2, hy + 9, 4, 4, '#F0B888'); disc(g, hx - 4, hy + 18, 3, 2, '#5B3413'); disc(g, hx + 4, hy + 18, 3, 2, '#5B3413');
  for (let k = 0; k < 3; k++) disc(g, hx, hy + 26 - k, 28 - k * 4, 6 - k, ['#3F2410', '#5B3413', '#6E4220'][k]);
  // The mouth: open, square, the teeth bared top and bottom, the gums, the dark in it
  R(g, hx - 24, hy + 31, 48, 20, '#2B0A0A'); R(g, hx - 24, hy + 31, 48, 3, '#B45454');
  for (let k = 0; k < 8; k++) { R(g, hx - 23 + k * 6, hy + 33, 5, 7, k % 3 ? '#FEF3C7' : '#E7D9A8'); R(g, hx - 23 + k * 6, hy + 33, 5, 1, '#FFFFFF'); R(g, hx - 23 + k * 6, hy + 43, 5, 6, k % 2 ? '#E7D9A8' : '#D6C38A'); }
  R(g, hx - 24, hy + 49, 48, 2, '#B45454');
  // The windshield over him: a tint, the glare across it, the tourists on it (smeared, a sandal)
  checker(g, 42, 34, 316, 120, 'rgba(147, 197, 253, 0.07)', 0, 1);
  g.fillStyle = 'rgba(255,255,255,0.13)'; g.beginPath(); g.moveTo(60, 34); g.lineTo(110, 34); g.lineTo(60, 154); g.lineTo(42, 154); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(300, 34); g.lineTo(318, 34); g.lineTo(270, 154); g.lineTo(252, 154); g.closePath(); g.fill();
  for (let k = 0; k < 6; k++) {
    // (a splat: a lump of it with spatter round, and runs down off it, each with a bead on the end)
    const x = 56 + hash(k * 11) * 290, y = 42 + hash(k * 5) * 26, r = 4 + hash(k) * 5;
    disc(g, x, y, r, r * 0.8, '#7F1D1D'); disc(g, x - 1, y - 1, r * 0.6, r * 0.45, '#991B1B'); R(g, x - r * 0.4, y - r * 0.4, 2, 1, '#F87171');
    for (let q = 0; q < 6; q++) { const a = hash(k * 7 + q) * 6.28, d = r + 2 + hash(q + k) * 6; R(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 1 + (q % 2), 1 + (q % 2), '#991B1B'); }
    for (let q = 0; q < 3; q++) { const rx = x - r * 0.6 + q * r * 0.6, l = 8 + hash(k * 3 + q) * 26; R(g, rx, y, 2, l, '#7F1D1D'); R(g, rx, y, 1, l, '#991B1B'); disc(g, rx + 1, y + l + 1, 1.6, 2, '#991B1B'); }
  }
  R(g, 330, 132, 14, 5, '#F8FAFC'); R(g, 330, 136, 14, 1, '#94A3B8'); // (the sandal)
  // The dash: the ledge under the windshield, the wheel's rim across the bottom of him, his hands round it
  R(g, 42, 146, 316, 8, '#1C1917'); R(g, 42, 146, 316, 1, '#44403C');
  g.fillStyle = '#0C0A09'; g.fillRect(150, 140, 160, 7); g.fillStyle = '#292524'; g.fillRect(150, 140, 160, 2);
  // (the rim of the wheel, black, worn shiny where he grips it)
  for (let k = 0; k < 3; k++) R(g, 130, 141 + k * 2, 200, 2, ['#3F3F46', '#18181B', '#0C0A09'][k]);
  for (const hx2 of [178, 282]) {
    // his fists round it: four fingers over the top, rolled, each knuckle white with it; the thumb across
    disc(g, hx2, 146, 16, 7, '#B8723C');
    for (let k = 0; k < 4; k++) {
      const fx = hx2 - 12 + k * 7.5;
      disc(g, fx, 138, 4, 5, '#9A5B2E'); disc(g, fx - 0.5, 137, 3.4, 4, '#D08A4E'); disc(g, fx - 1, 135, 2.2, 2, '#F5F5F4'); R(g, fx - 2, 134, 1, 1, '#FFFFFF');
      R(g, fx + 3, 135, 1, 7, '#6B3A1E');
    }
    disc(g, hx2 + (hx2 < 230 ? 14 : -14), 145, 6, 3, '#C67B42');
  }
  // The grille: chrome bars, banded down each, the badge, the bugs (and a bit of tourist) on it
  R(g, 96, 164, 208, 96, '#1C1917');
  for (let x = 100; x < 300; x += 10) for (let k = 0; k < 4; k++) R(g, x + k, 166, 1, 92, ['#F8FAFC', '#CBD5E1', '#94A3B8', '#64748B'][k]);
  R(g, 96, 162, 208, 4, '#E2E8F0'); R(g, 96, 258, 208, 4, '#475569');
  disc(g, 200, 176, 16, 6, '#CA8A04'); disc(g, 200, 175, 12, 3, '#FDE68A');
  for (let k = 0; k < 40; k++) { const x = 100 + hash(k * 7.3) * 200, y = 168 + hash(k * 3.9) * 88; R(g, x, y, 2, 2, ['#84CC16', '#FACC15', '#1C1917', '#65A30D'][k % 4]); if (k % 5 === 0) R(g, x + 1, y + 2, 1, 4, '#A3E635'); }
  for (let k = 0; k < 5; k++) { const x = 120 + hash(k * 31) * 160, y = 190 + hash(k * 17) * 50; disc(g, x, y, 5, 4, '#991B1B'); R(g, x - 1, y, 2, 12, '#7F1D1D'); }
  // The headlight housings (the lights go on over, lit), the bumper: chrome, banded, the dents in it
  for (const lx of [62, 338]) { disc(g, lx, 210, 30, 30, '#1C1917'); disc(g, lx, 210, 26, 26, '#94A3B8'); disc(g, lx, 210, 22, 22, '#FEF9C3'); }
  for (let k = 0; k < 5; k++) R(g, 20, 266 + k * 4, 360, 4, ['#F8FAFC', '#E2E8F0', '#CBD5E1', '#94A3B8', '#475569'][k]);
  for (const dx of [80, 240, 300]) { disc(g, dx, 276, 9, 4, '#64748B'); disc(g, dx - 2, 274, 4, 2, '#F8FAFC'); }
  R(g, 20, 265, 360, 1, '#1C1917'); R(g, 20, 286, 360, 1, '#1C1917');
});

export const drawRiggsCloseUp = (ctx: Ctx, t: number, f: number) => {
  const g = lowres();
  g.drawImage(riggsBase(), 0, 0);
  const hx = 226, hy = 96;
  const rage = Math.min(1, t / 40);
  // The eyes: bulging, bloodshot (veins wriggling across them), the pupils pinned
  for (const s of [-1, 1]) {
    const ex = hx + s * 18, ey = hy - 2;
    disc(g, ex, ey, 11, 9, '#1C1917'); disc(g, ex, ey, 10, 8, '#FEF2F2'); disc(g, ex - 2, ey - 2, 6, 4, '#FFFFFF');
    g.fillStyle = '#DC2626';
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.3, l = 5 + (k % 3); for (let d = 4; d < 4 + l; d++) g.fillRect(Math.round(ex + Math.cos(a) * d + Math.sin(f * 0.3 + k) * 0.6), Math.round(ey + Math.sin(a) * d * 0.8), 1, 1); }
    const jit = f % 4 < 2 ? 1 : 0;
    disc(g, ex + jit, ey, 2.5, 2.5, '#1C1917'); R(g, ex + jit - 1, ey - 1, 1, 1, '#FFFFFF');
  }
  // The veins: up his forehead, down his temples, out on his neck, throbbing
  const th = 1 + (Math.sin(f * 0.6) > 0 ? 1 : 0) * rage;
  g.fillStyle = '#7E22CE';
  for (const [x0, y0, dx, dy, n] of [[hx - 10, hy - 14, 1, -1, 10], [hx + 14, hy - 14, -1, -1, 9], [hx - 36, hy - 4, -1, 1, 10], [hx + 36, hy - 4, 1, 1, 10], [hx - 20, hy + 44, -1, 1, 8], [hx + 18, hy + 44, 1, 1, 8]] as const) {
    for (let k = 0; k < n; k++) { const x = x0 + dx * k * 0.6 + ((k >> 1) % 2 ? 1 : -1), y = y0 + dy * k; g.fillRect(Math.round(x), Math.round(y), Math.round(1 + th), 1); }
  }
  g.fillStyle = '#C084FC'; g.fillRect(hx - 10, hy - 20, 1, 3); g.fillRect(hx + 13, hy - 19, 1, 3);
  // The sweat beading and running
  for (let b = 0; b < 6; b++) { const run = ((t * (0.8 + hash(b) * 0.6) + b * 23) % 50) / 50, bx = hx - 40 + hash(b * 3) * 80, by = hy - 12 + run * 40; disc(g, bx, by, 1.5, 2, '#BAE6FD'); R(g, bx - 1, by - 1, 1, 1, '#FFFFFF'); }
  // The spit: off his teeth and at the glass, strings of it
  for (let k = 0; k < 10; k++) {
    const life = ((t * 1.3 + k * 9) % 26) / 26, a = -Math.PI / 2 + (hash(k) - 0.5) * 2.4;
    const x = hx + Math.cos(a) * life * 70, y = hy + 40 + Math.sin(a) * life * 50 + life * life * 30;
    disc(g, x, y, 1 + life * 2.5, 1 + life * 2, 'rgba(240, 249, 255, 0.85)'); R(g, x - 1, y - 1, 1, 1, '#FFFFFF');
  }
  if (t % 30 < 18) { R(g, hx - 6, hy + 40, 1, 8, 'rgba(240,249,255,0.8)'); R(g, hx + 9, hy + 41, 1, 6, 'rgba(240,249,255,0.8)'); }
  // His lizard on the dash, head going, its throat going
  const lx = 92, ly = 140, bob = Math.floor(f / 5) % 2;
  disc(g, lx, ly, 14, 5, '#15803D'); disc(g, lx - 2, ly - 2, 10, 3, '#22C55E'); disc(g, lx + 14, ly - 3 - bob, 7, 5, '#16A34A'); R(g, lx + 16, ly - 6 - bob, 2, 2, '#FDE047'); R(g, lx + 17, ly - 5 - bob, 1, 1, '#1C1917');
  disc(g, lx + 12, ly + 1 - bob, 4, 2 + (f % 6 < 3 ? 1 : 0), '#F97316');
  g.fillStyle = '#15803D'; for (let k = 0; k < 12; k++) g.fillRect(lx - 14 - k, ly + 1 + Math.round(Math.sin(k * 0.6 + f * 0.2)), 1, 2);
  for (const dx of [-8, 6]) R(g, lx + dx, ly + 3, 2, 4, '#166534');
  // (a band-aid on the lizard, too)
  R(g, lx - 4, ly - 4, 6, 3, '#E7E5E4'); R(g, lx - 2, ly - 3, 2, 1, '#B91C1C');
  // The headlights: on full, flaring, the rays off them
  for (const cx of [62, 338]) {
    const fl = 0.75 + 0.25 * Math.sin(f * 0.8 + cx);
    for (let k = 0; k < 5; k++) { g.fillStyle = `rgba(254, 249, 195, ${(0.16 * fl * (5 - k) / 5).toFixed(3)})`; g.beginPath(); g.arc(cx, 210, 30 + k * 14 * fl, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = `rgba(255, 255, 240, ${(0.55 * fl).toFixed(3)})`;
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + t * 0.02; g.save(); g.translate(cx, 210); g.rotate(a); g.fillRect(0, -1, 60 + 30 * fl, 2); g.restore(); }
    disc(g, cx, 210, 12, 12, '#FFFFFF');
  }
  finish(g, t);
  // Bearing down: pushing in, the shake getting worse, the heat coming up off it in waves
  const k = Math.min(1, t / CUT_RIGGS);
  const shake = { x: (hash(f * 1.3) - 0.5) * (4 + k * 14), y: (hash(f * 2.7) - 0.5) * (4 + k * 14) };
  blit(ctx, shake, 1 + k * k * 0.18, y => y > 160 ? Math.round(Math.sin(y * 0.21 + t * 0.6) * (0.5 + (y - 160) / 110)) : 0);
  // (and the horn, written up the side of it)
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t % 24 < 16) { ctx.font = 'bold 22px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillStyle = '#1C1917'; ctx.fillText('HOOOONK!', 44, CANVAS_HEIGHT - 36); ctx.fillStyle = '#FDE047'; ctx.fillText('HOOOONK!', 41, CANVAS_HEIGHT - 39); }
  ctx.restore();
  cutFlash(ctx, t, CUT_RIGGS);
};
