// The cheap shot's own close-up for HELICOPTER HARRY (wrath). His faded jeans, the peace-sign buckle, the gray happy trail
// over a tanned gut, a bandolier of M60 brass; through the X-ray, the pelvis and the nuts. His glove clamps on them and
// WRENCHES (ripKit.ts), and the wrath gets into them as he pulls: they stretch down red-hot, veins glowing, steam
// hissing off, the bone cracking... and they tear out with a BANG (the rage venting out of the hole: a banded fireball,
// a shockwave ring, gore and denim and brass for shrapnel, the pelvis cracked open). After: a scorched crater in his
// crotch, embers, smoke, and the sack held up in his fist, still glowing, sizzling the glove.
//
// Still layers baked once (closeUp.ts bakeOnce): the jeans and belly, the X-ray, the sack (cool and red-hot), the
// fireball, the crater, the shrapnel sheet. Per frame: those stamped, scaled and turned, plus a few dozen little shapes.

import { type CloseUpPaint, PANEL_W, PANEL_H, CX, bakeOnce, rnd, clamp } from '../closeUp';
import { GRIP, RIP, handAt, drawHand, drawTether, drawSnapped, effort, ripShake, ripFlash, gloveGore } from './ripKit';
import {
  type Ramp, INK, orb, shade, domeLit, inEllipse, bands, banded, clipTo, stroke, dith, vein, hairs, sweatBeads, scanlines,
  xrayWindow, winPath, tag, sheet, debris, drops, runs, sparks, smoke, bigWord,
} from './specialKit';

type Ctx = CanvasRenderingContext2D;

// (his own ramps, darkest first: harry/heli harryArt.ts's)
const DENIM: Ramp = ['#17233C', '#38507A', '#52709F', '#7393C2', '#A7BEDD'];
const SKIN: Ramp = ['#4A2616', '#9A6444', '#C68A62', '#E3AE86', '#F6D2B0'];
const LEATHER: Ramp = ['#24130A', '#4F2E13', '#734620', '#94602F', '#C99158'];
const BRASS: Ramp = ['#3A2002', '#7C4A03', '#B7791F', '#EAB308', '#FEF3A0'];
const BONE: Ramp = ['#3A4A66', '#7C8CA8', '#B8C4D8', '#E2E8F0', '#FFFFFF'];
const XRAY: Ramp = ['#020617', '#06142B', '#0A1F3D', '#0E2A52'];
const SACK: Ramp = ['#4E1C12', '#8A4A3A', '#B66E58', '#D8957A', '#EEB89C'];
const HOT: Ramp = ['#450A0A', '#991B1B', '#DC2626', '#F97316', '#FDE047'];
const FIRE: Ramp = ['#7A1A04', '#C2300A', '#E0420C', '#F98A1C', '#FDCB4A', '#FFF4C0'];
const BLOOD: Ramp = ['#5A0A0A', '#B91C1C', '#F87171'];

const WX = CX, WY = 140, WRX = 150, WRY = 96;
/** Frames after the boot lands that they blow. */

const thigh = (g: Ctx, s: number) => () => {
  g.moveTo(CX + s * 6, 34); g.lineTo(CX + s * 300, 34); g.lineTo(CX + s * 300, PANEL_H + 4); g.lineTo(CX + s * 74, PANEL_H + 4);
  g.quadraticCurveTo(CX + s * 24, 232, CX + s * 8, 198); g.closePath();
};

// ---- the jeans, the belt, the gut
const body = () => bakeOnce('harry-body', g => {
  // (the gut: tanned, banded, the bottom of the six-pack's V, the gray happy trail)
  bands(g, 0, 0, PANEL_W, 20, [SKIN[3], SKIN[2]]);
  g.strokeStyle = SKIN[1]; g.lineWidth = 2;
  g.beginPath(); g.moveTo(CX - 170, -2); g.quadraticCurveTo(CX - 90, 8, CX - 40, 20); g.moveTo(CX + 170, -2); g.quadraticCurveTo(CX + 90, 8, CX + 40, 20); g.stroke();
  hairs(g, CX - 18, -6, 36, 26, 34, 5, '#7A7A84', 6); hairs(g, CX - 16, -6, 32, 24, 26, 11, '#D4D4D8', 6);
  sweatBeads(g, 40, 2, 440, 12, 9, 3);
  // (the jeans: dark in the creases, each thigh a cylinder lit from the upper left)
  g.fillStyle = DENIM[0]; g.fillRect(0, 30, PANEL_W, PANEL_H);
  banded(g, thigh(g, -1), CX - 300, 34, 306, 260, [DENIM[1], DENIM[2], DENIM[3], DENIM[4], DENIM[3], DENIM[2]], false, INK, 3);
  banded(g, thigh(g, 1), CX, 34, 300, 260, [DENIM[2], DENIM[3], DENIM[3], DENIM[2], DENIM[1], DENIM[0]], false, INK, 3);
  // (the faded whiskers fanned out from the crotch)
  g.lineWidth = 3;
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
    g.strokeStyle = dith(g, DENIM[4]); g.beginPath();
    g.moveTo(CX + s * 30, 120 + i * 18); g.quadraticCurveTo(CX + s * 70, 104 + i * 18, CX + s * (120 + i * 6), 96 + i * 22); g.stroke();
  }
  // (the pockets' seams and stitching)
  g.setLineDash([4, 3]);
  for (const s of [-1, 1]) {
    stroke(g, () => { g.moveTo(CX + s * 140, 36); g.quadraticCurveTo(CX + s * 160, 96, CX + s * 250, 110); }, INK, 3);
    stroke(g, () => { g.moveTo(CX + s * 146, 36); g.quadraticCurveTo(CX + s * 166, 92, CX + s * 250, 104); }, '#D9A441', 1);
  }
  // (the fly: the placket, the J of stitching, a copper rivet)
  banded(g, () => g.rect(CX - 14, 34, 18, 164), CX - 14, 34, 18, 164, [DENIM[3], DENIM[2]], false, INK, 2);
  stroke(g, () => { g.moveTo(CX + 8, 38); g.lineTo(CX + 8, 172); g.quadraticCurveTo(CX + 8, 194, CX - 14, 196); }, '#D9A441', 1.5);
  g.setLineDash([]);
  orb(g, CX + 18, 44, 3, 3, BRASS);
  // (the belt: banded leather, loops, holes; the brass peace-sign buckle)
  banded(g, () => g.rect(-4, 16, PANEL_W + 8, 20), 0, 16, PANEL_W, 20, [LEATHER[4], LEATHER[3], LEATHER[2], LEATHER[1]], true, INK, 2);
  for (const x of [CX - 210, CX - 120, CX + 120, CX + 210]) banded(g, () => g.rect(x - 7, 12, 14, 28), x - 7, 12, 14, 28, [DENIM[3], DENIM[2], DENIM[1]], false, INK, 2);
  for (let i = 0; i < 4; i++) { g.fillStyle = INK; g.fillRect(CX + 44 + i * 14, 24, 4, 4); }
  orb(g, CX, 26, 19, 17, BRASS);
  stroke(g, () => { g.arc(CX, 26, 11, 0, Math.PI * 2); g.moveTo(CX, 15); g.lineTo(CX, 37); g.moveTo(CX, 27); g.lineTo(CX - 8, 34); g.moveTo(CX, 27); g.lineTo(CX + 8, 34); }, BRASS[0], 3);
  // (the bandolier: a strap of M60 brass down across his hip)
  g.save(); g.translate(70, 40); g.rotate(-0.42);
  banded(g, () => g.rect(-120, 0, 260, 16), -120, 0, 260, 16, [LEATHER[3], LEATHER[2], LEATHER[1]], true, INK, 2);
  for (let x = -110; x < 130; x += 13) {
    banded(g, () => g.rect(x, -14, 8, 18), x, -14, 8, 18, [BRASS[4], BRASS[3], BRASS[2], BRASS[1]], false, INK, 1.5);
    g.fillStyle = '#B45309'; g.fillRect(x + 1, -18, 6, 5); g.fillStyle = '#FDBA74'; g.fillRect(x + 2, -18, 2, 2);
  }
  g.restore();
  tag(g, 'X-RAY', PANEL_W - 70, 270, '#7DD3FC');
});

// ---- the X-ray: the pelvis, the femurs, the cords
const pelvisPath = (g: Ctx) => () => {
  const P = (x: number, y: number): [number, number] => [CX + x * 0.85, 40 + y * 0.9];
  const m = (x: number, y: number) => { const p = P(x, y); g.moveTo(p[0], p[1]); };
  const l = (x: number, y: number) => { const p = P(x, y); g.lineTo(p[0], p[1]); };
  const q = (a: number, b: number, x: number, y: number) => { const p = P(a, b), r = P(x, y); g.quadraticCurveTo(p[0], p[1], r[0], r[1]); };
  m(-200, 6); q(-120, -4, -60, 30); q(-30, 60, -18, 88); l(18, 88); q(30, 60, 60, 30); q(120, -4, 200, 6);
  l(170, 60); q(100, 70, 60, 94); l(-60, 94); q(-100, 70, -170, 60); g.closePath();
};
const xray = () => bakeOnce('harry-xray', g => {
  xrayWindow(g, WX, WY, WRX, WRY, XRAY, '#7DD3FC');
  clipTo(g, winPath(g, WX, WY, WRX, WRY), () => {
    g.fillStyle = 'rgba(125,211,252,0.10)';
    for (const s of [-1, 1]) { g.beginPath(); thigh(g, s)(); g.fill(); }
    // (the femurs, the heads in their sockets)
    for (const s of [-1, 1]) {
      g.save(); g.translate(CX + s * 112, 120); g.rotate(s * 0.16);
      banded(g, () => g.rect(-12, 0, 24, 200), -12, 0, 24, 200, [BONE[2], BONE[4], BONE[3], BONE[1]], false, '#0B1830', 3);
      g.restore();
      orb(g, CX + s * 112, 120, 18, 16, BONE, '#0B1830');
    }
    banded(g, pelvisPath(g), CX - 180, 40, 360, 90, [BONE[4], BONE[3], BONE[3], BONE[2], BONE[1]], true, '#0B1830', 3);
    g.fillStyle = XRAY[3]; g.beginPath(); g.ellipse(CX, 87, 30, 22, 0, 0, Math.PI * 2); g.fill();
    for (const s of [-1, 1]) { g.fillStyle = XRAY[2]; g.beginPath(); g.ellipse(CX + s * 38, 110, 13, 8, 0, 0, Math.PI * 2); g.fill(); }
    banded(g, () => g.rect(CX - 20, 118, 40, 12), CX - 20, 118, 40, 12, [BONE[4], BONE[2]], true, '#0B1830', 2);
    // (the cords up into him)
    for (const s of [-1, 1]) stroke(g, () => { g.moveTo(CX + s * 22, 150); g.bezierCurveTo(CX + s * 30, 120, CX + s * 70, 130, CX + s * 60, 96); }, 'rgba(249,168,212,0.55)', 3);
    scanlines(g, 0.2);
  });
});

// ---- the sack: cool, then red-hot
const paintSack = (g: Ctx, R: Ramp, veinCol: string, hair: string, hot: boolean) => {
  // (the neck up into him)
  banded(g, () => { g.moveTo(52, 0); g.lineTo(92, 0); g.lineTo(96, 26); g.lineTo(48, 26); g.closePath(); }, 48, 0, 50, 26, [R[3], R[2], R[1]], false, INK, 2);
  g.fillStyle = INK; g.beginPath(); g.ellipse(72, 62, 62, 40, 0, 0, Math.PI * 2); g.fill();
  shade(g, 10, 22, 124, 80, inEllipse(72, 62, 60, 38), domeLit(72, 56, 60, 40, 0.12), R);
  // (the two of them bulging through)
  for (const [x, y] of [[50, 60], [94, 62]]) shade(g, x - 26, y - 28, 52, 56, inEllipse(x, y, 24, 26), (px, py) => 0.25 + 0.75 * domeLit(x, y, 24, 26)(px, py), R);
  // (the seam down the middle, the wrinkles, the veins, the hair)
  stroke(g, () => { g.moveTo(72, 26); for (let y = 30; y < 100; y += 6) g.lineTo(72 + (y % 12 ? 2 : -2), y); }, R[0], 2);
  g.strokeStyle = R[1]; g.lineWidth = 1.5; g.beginPath();
  for (let i = 0; i < 22; i++) { const x = 18 + rnd(i * 3.1) * 108, y = 34 + rnd(i * 5.7) * 56; g.moveTo(x, y); g.quadraticCurveTo(x + 4, y - 3, x + 9, y); }
  g.stroke();
  for (let i = 0; i < 5; i++) vein(g, 30 + i * 22, 40 + (i % 2) * 20, 1.2 + (i % 3) * 0.8, 30, 40 + i * 9, veinCol, hot ? 3 : 2, hot ? '#FFF4C0' : undefined);
  hairs(g, 12, 26, 120, 72, hot ? 18 : 46, 3, hair, 9);
  if (hot) { // (the hair singed into little black curls, the skin crazed)
    g.strokeStyle = '#2A0505'; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 8; i++) { const x = 24 + rnd(i * 9.1) * 96, y = 36 + rnd(i * 4.3) * 50; g.moveTo(x, y); g.lineTo(x + 8, y + 5); g.lineTo(x + 4, y + 12); }
    g.stroke();
  }
};
const sack = () => bakeOnce('harry-sack', g => paintSack(g, SACK, '#6B2A5A', '#C8C8D0', false), 144, 108);
const sackHot = () => bakeOnce('harry-sack-hot', g => paintSack(g, HOT, '#FDE047', '#1A0505', true), 144, 108);

// ---- the fireball and the crater
const fireball = () => bakeOnce('harry-fire', g => {
  const lumps = (r0: number, n: number, seed: number, dist: number) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.6, d = dist * (0.6 + rnd(seed + i * 2) * 0.5);
    return [90 + Math.cos(a) * d, 90 + Math.sin(a) * d * 0.9, r0 * (0.7 + rnd(seed + i * 3) * 0.6)] as const;
  });
  FIRE.forEach((col, i) => {
    const ls = lumps(40 - i * 6, 9 - i, i * 10, 46 - i * 8);
    if (i > 0) { g.fillStyle = dith(g, col); for (const [x, y, r] of ls) { g.beginPath(); g.arc(x, y, r + 3, 0, Math.PI * 2); g.fill(); } }
    g.fillStyle = col; for (const [x, y, r] of ls) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  });
}, 180, 180);

const crater = () => bakeOnce('harry-crater', g => {
  const ragged = (rx: number, ry: number, seed: number, jag: number) => () => {
    for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI * 2, k = 1 + (rnd(seed + (i % 28)) - 0.5) * jag; const x = 110 + Math.cos(a) * rx * k, y = 76 + Math.sin(a) * ry * k; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.closePath();
  };
  // (the denim burnt back in a ragged hole, frayed, glowing at the edge)
  g.beginPath(); ragged(104, 70, 3, 0.35)(); g.fillStyle = '#1C1008'; g.fill();
  g.beginPath(); ragged(96, 64, 3, 0.35)(); g.fillStyle = dith(g, '#3A2410'); g.fill();
  g.strokeStyle = '#A7BEDD'; g.lineWidth = 1;
  g.beginPath(); for (let i = 0; i < 40; i++) { const a = rnd(i * 2.2) * Math.PI * 2, x = 110 + Math.cos(a) * 98, y = 76 + Math.sin(a) * 66; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); } g.stroke();
  // (the raw cooked meat, banded in to the pit)
  const MEAT = ['#2A0505', '#5A0F0A', '#8A1A10', '#B8321C', '#E0583A'];
  clipTo(g, ragged(80, 54, 7, 0.3), () => {
    for (let i = 0; i < 5; i++) {
      const k = 1 - i / 5;
      if (i) { g.fillStyle = dith(g, MEAT[4 - i]); g.beginPath(); g.ellipse(110, 80, 84 * k + 3, 58 * k + 3, 0, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = MEAT[4 - i]; g.beginPath(); g.ellipse(110, 80, 84 * k, 58 * k, 0, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#050202'; g.beginPath(); g.ellipse(110, 82, 34, 20, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7F1D1D'; g.fillRect(84, 94, 52, 3);
    // (blisters, bubbling)
    for (let i = 0; i < 18; i++) { const x = 46 + rnd(i * 6.6) * 128, y = 40 + rnd(i * 2.9) * 76; g.fillStyle = '#F4A08A'; g.fillRect(Math.round(x), Math.round(y), 4, 3); g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
  });
  stroke(g, ragged(80, 54, 7, 0.3), INK, 3);
  // (the pubic bone snapped off, jagged, up out of the pit)
  for (const s of [-1, 1]) {
    banded(g, () => { g.moveTo(110 + s * 54, 40); g.lineTo(110 + s * 20, 52); g.lineTo(110 + s * 14, 44); g.lineTo(110 + s * 6, 58); g.lineTo(110 + s * 50, 52); g.closePath(); }, 60, 36, 100, 26, ['#FFFFFF', '#E2E8F0', '#B8C4D8'], true, '#3A0A0A', 2);
  }
  // (embers along the burnt edge)
  for (let i = 0; i < 30; i++) { const a = rnd(i * 4.4) * Math.PI * 2, x = 110 + Math.cos(a) * 92, y = 76 + Math.sin(a) * 60; g.fillStyle = i % 3 ? '#F97316' : '#FDE047'; g.fillRect(Math.round(x), Math.round(y), 3, 2); }
}, 220, 152);

// ---- the shrapnel: meat, sack, denim, bone, brass
const gore = () => sheet('harry-gore', 8, 30, (g, i) => {
  if (i <= 3) {
    const R = i < 2 ? ['#450A0A', '#991B1B', '#DC2626', '#FCA5A5'] : [SACK[0], SACK[1], SACK[2], SACK[4]];
    const pts = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2, r = 6 + rnd(i * 7 + k) * 6; return [Math.cos(a) * r, Math.sin(a) * r * 0.8] as const; });
    const path = () => { pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
    banded(g, path, -12, -12, 24, 24, [R[3], R[2], R[1], R[0]], true, INK, 2);
    if (i >= 2) hairs(g, -8, -8, 16, 12, 5, i, '#C8C8D0', 5);
    else { g.fillStyle = '#FFFFFF'; g.fillRect(-4, -5, 2, 2); }
  } else if (i === 4) {
    banded(g, () => { g.moveTo(-11, -7); g.lineTo(10, -9); g.lineTo(12, 6); g.lineTo(4, 4); g.lineTo(-2, 9); g.lineTo(-10, 5); g.closePath(); }, -12, -10, 24, 20, [DENIM[3], DENIM[2], DENIM[1]], true, INK, 2);
    g.setLineDash([2, 2]); stroke(g, () => { g.moveTo(-8, -4); g.lineTo(8, -6); }, '#D9A441', 1); g.setLineDash([]);
  } else if (i === 5) {
    banded(g, () => { g.moveTo(-9, -3); g.lineTo(-2, -8); g.lineTo(10, -2); g.lineTo(4, 3); g.lineTo(8, 8); g.lineTo(-6, 4); g.closePath(); }, -10, -9, 20, 18, ['#FFFFFF', '#E2E8F0', '#B8C4D8'], true, '#3A0A0A', 2);
  } else if (i === 6) {
    banded(g, () => g.rect(-3, -9, 7, 16), -3, -9, 7, 16, [BRASS[4], BRASS[3], BRASS[2]], false, INK, 1.5);
  } else {
    banded(g, () => { g.moveTo(-10, -6); g.quadraticCurveTo(0, -12, 11, -4); g.lineTo(8, 7); g.quadraticCurveTo(0, 3, -9, 8); g.closePath(); }, -11, -12, 22, 20, [SKIN[3], SKIN[2], SKIN[1]], true, INK, 2);
    hairs(g, -8, -8, 16, 12, 6, 9, '#D4D4D8', 5);
  }
});

export const closeUp: CloseUpPaint = (c, t) => {
  const rip = t - RIP, h = handAt(t, CX, 166, { pull: 50 });
  c.save();
  c.fillStyle = INK; c.fillRect(0, 0, PANEL_W, PANEL_H);
  ripShake(c, t, 18);
  c.drawImage(body(), 0, 0);
  c.drawImage(xray(), 0, 0);
  // (the pelvis cracking with the strain, then blown wide)
  const ck = t - GRIP - 8;
  if (ck >= 0) {
    const n = Math.min(7, 1 + Math.floor(ck / 3)), reach = rip >= 0 ? 1.6 : 1;
    c.beginPath();
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i + 3) - 0.5) * 3; c.moveTo(CX, 122); c.lineTo(CX + Math.cos(a) * 34 * reach, 122 + Math.sin(a) * 22 * reach); c.lineTo(CX + Math.cos(a + 0.4) * 64 * reach, 122 + Math.sin(a + 0.4) * 38 * reach); }
    c.strokeStyle = '#000'; c.lineWidth = 3; c.stroke();
    if (ck >= 6) { c.strokeStyle = '#F97316'; c.lineWidth = 1; c.stroke(); }
  }
  if (rip < 0) {
    // (the sack: hangs; clamped and dragged down long, and the wrath gets into it as he pulls: red-hot, veins glowing,
    // steam hissing off it)
    const hot = h.shut ? clamp(h.strain * 1.3) : 0;
    const sx = h.shut ? 1 - 0.2 * h.strain + Math.sin(t * 1.9) * 0.04 * hot : 1 + Math.sin(t * 0.5) * 0.03;
    const sy = h.shut ? Math.max(1, (h.y + 10 - 100) / 70) : 1, x = h.shut ? CX + (h.x - CX) * 0.5 : CX;
    if (hot > 0) { c.fillStyle = `rgba(255,90,20,${(0.3 * hot).toFixed(2)})`; c.beginPath(); c.ellipse(x, 100 + 54 * sy, 90 * sx, 64 * sy, 0, 0, Math.PI * 2); c.fill(); }
    if (h.shut) drawTether(c, t, CX, 108, h.x, h.y - 40, h.strain, ['#2A0A06', hot > 0.5 ? HOT[2] : SACK[2], hot > 0.5 ? HOT[4] : SACK[4]], 2, 10, 18);
    c.save(); c.translate(x, 100); c.scale(sx, sy);
    c.drawImage(sack(), -72, 0);
    if (hot > 0) { c.globalAlpha = hot; c.drawImage(sackHot(), -72, 0); c.globalAlpha = 1; }
    c.restore();
    smoke(c, t - GRIP - 6, x, 110, 6, 21, { steam: true, rise: 2.6, every: 2, life: 22, alpha: 0.7, grow: 0.04 });
  } else {
    c.drawImage(crater(), CX - 110, 150 - 76);
    for (let i = 0; i < 8; i++) { if ((t + i * 3) % 5 < 2) continue; const a = rnd(i * 9.3) * Math.PI * 2; c.fillStyle = i % 2 ? '#FDE047' : '#FB923C'; c.fillRect(CX + Math.cos(a) * 90, 150 + Math.sin(a) * 58, 4, 3); }
    drawSnapped(c, rip, CX, 104, ['#2A0A06', HOT[2], HOT[4]], BLOOD[1], 2, 9, 36, 18);
    runs(c, rip - 6, [[CX - 50, 186], [CX - 20, 196], [CX + 14, 198], [CX + 46, 188], [CX - 70, 170], [CX + 72, 172]], BLOOD, 90, 2.2, 6);
  }
  // (held up after: the sack in his fist, still glowing, cooling to char, smoking, sizzling his glove)
  if (h.held) {
    const cool = clamp(rip / 40);
    c.save(); c.translate(h.x, h.y - 4); c.rotate(h.rot); c.scale(0.62, 0.62);
    c.drawImage(sack(), -72, -96);
    c.globalAlpha = 1 - cool * 0.7; c.drawImage(sackHot(), -72, -96); c.globalAlpha = 1;
    c.fillStyle = `rgba(20,10,4,${(cool * 0.5).toFixed(2)})`; c.beginPath(); c.ellipse(0, -44, 60, 40, 0, 0, Math.PI * 2); c.fill();
    c.restore();
    smoke(c, rip, h.x, h.y - 40, 6, 13, { steam: rip < 20, rise: 1.8, every: 4, life: 26, alpha: 0.6 });
  }
  drawHand(c, h, t);
  gloveGore(c, h, ['#1C1410', BLOOD[1], '#3A2A20']);
  if (h.held && rip < 30) { c.save(); c.translate((t % 2) * 2, 0); bigWord(c, rip, 'TSSSS!', h.x + 60, h.y + 30, 10, '#F97316', '#000', 0.1); c.restore(); }
  // (the tear: the wrath vented out of the hole: the fireball up out of him, the shockwave, gore and denim and brass)
  if (rip >= 0) {
    smoke(c, rip - 4, CX, 130, 14, 33, { rise: 1.6, every: 4, life: 60, alpha: 0.85, grow: 0.03 });
    if (rip < 24) {
      const s = rip < 5 ? 0.35 + rip * 0.22 : 1.45 + (rip - 5) * 0.03, al = rip < 10 ? 1 : Math.max(0, 1 - (rip - 10) / 14);
      c.globalAlpha = al;
      c.save(); c.translate(CX, 140 - rip * 1.6); c.rotate(rip * 0.04); c.scale(s, s * 0.85); c.drawImage(fireball(), -90, -90); c.restore();
      c.save(); c.translate(CX + 20, 120 - rip * 2.2); c.rotate(2 - rip * 0.05); c.scale(s * 0.7, s * 0.6); c.drawImage(fireball(), -90, -90); c.restore();
      c.globalAlpha = 1;
    }
    if (rip < 14) {
      const rx = 30 + rip * 26;
      c.strokeStyle = `rgba(255,240,200,${(1 - rip / 14).toFixed(2)})`; c.lineWidth = Math.max(1, 10 - rip * 0.7);
      c.beginPath(); c.ellipse(CX, 150, rx, rx * 0.45, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = `rgba(249,115,22,${(0.8 - rip / 18).toFixed(2)})`; c.lineWidth = 3;
      c.beginPath(); c.ellipse(CX, 150, rx * 0.8, rx * 0.36, 0, 0, Math.PI * 2); c.stroke();
    }
    debris(c, gore(), 30, rip, CX, 145, { seed: 7, ang: -Math.PI / 2, spread: Math.PI * 2, v0: 5, v1: 15, grav: 0.42, delay: 3, scale: 1.3, spin: 0.5 });
    drops(c, rip, CX, 145, 50, 3, BLOOD, { spread: Math.PI * 2, v0: 4, v1: 14, delay: 6 });
    sparks(c, rip, CX, 145, 26, 5, 22, ['#FDE047', '#F97316', '#FFFFFF'], 11);
  }
  c.restore();
  effort(c, t);
  if (t >= GRIP + 6 && rip < 0) { c.save(); c.translate((t % 2) * 3, 0); bigWord(c, t - GRIP - 6, 'SSSSSS...', CX + 150, 92, 14, '#F97316', '#000', -0.08); c.restore(); }
  bigWord(c, rip, 'KA-BOOOM!', CX + 100, 64, 30, '#FB923C');
  ripFlash(c, t, '255,200,120', PANEL_W, PANEL_H);
  if (rip > 22) tag(c, 'WRATH: NUTS TORN OUT', 12, 268, '#FCA5A5');
};
