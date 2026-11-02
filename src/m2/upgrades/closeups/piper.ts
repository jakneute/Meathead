// The cheap shot's own close-up for PIPER THE PIXIE (lust). Her hot-pink sequined gown straining over the belly rolls, the
// slit up her thigh (cellulite, stretch marks, a red lace garter with a heart charm), her too-small gossamer wings at the
// top corners buzzing. Through the X-ray: the ovaries up in her pelvis, little hearts coming off them, and between them
// and his hand, LAYERS OF FAT (banded, lobed, a pink membrane between each). His arm plows up through the fat (the
// layers jiggling, bulging round it, globs flying), the glove clamps both ovaries together and WRENCHES them down
// through it all (ripKit.ts), the tubes stretched taut, till they tear out: blood full of GLITTER, hearts and her wand's
// gold stars in the gush. The garter snaps off, the wings droop; the pair held up in his fist, still glittering.
//
// Still layers baked once (closeUp.ts bakeOnce); per frame the fat is stamped in strips (each shifted: the jiggle).

import { type CloseUpPaint, PANEL_W, PANEL_H, CX, OPEN, bakeOnce, rnd, clamp, lerp } from '../closeUp';
import { GRIP, RIP, handAt, drawHand, drawTether, drawSnapped, effort, ripShake, ripFlash, gloveGore } from './ripKit';
import {
  type Ramp, INK, orb, bands, banded, clipTo, stroke, dith, vein, sweatBeads, scanlines, xrayWindow, winPath, tag,
  sheet, stampCell, debris, drops, runs, bigWord,
} from './specialKit';

type Ctx = CanvasRenderingContext2D;

// (her ramps, darkest first: fantasy/piper.ts's)
const SKIN: Ramp = ['#6E3A30', '#C47E6A', '#E8A68C', '#F8CDB4', '#FFEADC'];
const GOWN: Ramp = ['#4E0830', '#A01E64', '#D23488', '#F45AAE', '#FFB6DE'];
const SATIN_HI = '#FFE4F4';
const GOLD: Ramp = ['#4A3608', '#946E16', '#D0A02C', '#F6D24E', '#FFF8C4'];
const WING: Ramp = ['#4A3A8A', '#8A74D0', '#B8A4F0', '#DCD0FF', '#F8F4FF'];
const FAT: Ramp = ['#7A5A10', '#B8901E', '#E0BE4A', '#F6DE8A', '#FFF4C4'];
const PINK: Ramp = ['#6B1640', '#B0185A', '#E64395', '#F7A6D2', '#FFF0F8'];
const BONE: Ramp = ['#4A3A66', '#8C7CA8', '#C4B8D8', '#ECE6F4', '#FFFFFF'];
const XRAY: Ramp = ['#12041A', '#1E0A2E', '#2E1242', '#3E1A58'];
const BLOOD: Ramp = ['#5A0A1A', '#C0163A', '#FB7185'];

const WX = CX, WY = 126, WRX = 150, WRY = 104;
/** The fat's strip, the ovaries, the garter. */
const FAT_Y0 = 92, FAT_Y1 = 240, OV_Y = 64, OV_DX = 46, GX = CX + 214, GY = 212;

const split = (g: Ctx) => () => {
  g.moveTo(CX + 172, 62); g.quadraticCurveTo(CX + 148, 180, CX + 166, PANEL_H + 4); g.lineTo(PANEL_W + 4, PANEL_H + 4); g.lineTo(PANEL_W + 4, 84); g.quadraticCurveTo(CX + 220, 74, CX + 172, 62);
};

// ---- the gown, the slit, the belly rolls
const body = () => bakeOnce('piper-body', g => {
  bands(g, 0, 0, PANEL_W, PANEL_H, [GOWN[3], GOWN[2], GOWN[2], GOWN[1]], false);
  // (the belly in rolls under the satin: a lit top, a deep crease under each)
  for (const y of [26, 70, 118]) {
    g.lineWidth = 6; stroke(g, () => { g.moveTo(-4, y - 6); g.quadraticCurveTo(CX, y + 14, PANEL_W + 4, y - 6); }, GOWN[0], 5);
    g.strokeStyle = dith(g, SATIN_HI); g.lineWidth = 4; g.beginPath(); g.moveTo(-4, y - 12); g.quadraticCurveTo(CX, y + 6, PANEL_W + 4, y - 12); g.stroke();
  }
  // (satin sheen down the folds)
  for (const x of [60, 150, 380]) { g.fillStyle = dith(g, SATIN_HI); g.fillRect(x, 0, 10, PANEL_H); g.fillStyle = GOWN[4]; g.fillRect(x + 3, 0, 3, PANEL_H); }
  // (the seam on the left straining: the stitches pulled long, her showing through between)
  for (let y = 10; y < PANEL_H; y += 16) {
    g.fillStyle = SKIN[3]; g.beginPath(); g.moveTo(60, y); g.lineTo(66, y + 8); g.lineTo(60, y + 16); g.lineTo(54, y + 8); g.closePath(); g.fill();
    stroke(g, () => { g.moveTo(52, y + 2); g.lineTo(68, y + 14); g.moveTo(68, y + 2); g.lineTo(52, y + 14); }, '#FFF0F8', 1.5);
  }
  // (the slit up her thigh: the thigh banded, a roll, cellulite, stretch marks)
  banded(g, split(g), CX + 146, 60, PANEL_W - CX - 146, PANEL_H, [SKIN[2], SKIN[3], SKIN[4], SKIN[3], SKIN[2], SKIN[1]], false, null);
  clipTo(g, split(g), () => {
    stroke(g, () => { g.moveTo(CX + 150, 150); g.quadraticCurveTo(CX + 210, 170, PANEL_W, 140); }, SKIN[1], 4);
    g.fillStyle = dith(g, SKIN[4]); g.beginPath(); g.moveTo(CX + 150, 144); g.quadraticCurveTo(CX + 210, 162, PANEL_W, 132); g.lineTo(PANEL_W, 126); g.quadraticCurveTo(CX + 210, 156, CX + 150, 138); g.fill();
    g.strokeStyle = SKIN[1]; g.lineWidth = 1.5; g.beginPath();
    for (let i = 0; i < 26; i++) { const x = CX + 170 + rnd(i * 3.3) * 90, y = 90 + rnd(i * 7.1) * 180; g.moveTo(x, y); g.quadraticCurveTo(x + 3, y + 3, x + 6, y); }
    g.stroke();
    g.strokeStyle = '#D88A9A'; g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 6; i++) { const x = CX + 180 + i * 12, y = 100 + i * 9; g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 16, x + 6, y + 34); }
    g.stroke();
    vein(g, CX + 230, 230, -1.3, 50, 4, '#8A6AC8', 2);
  });
  // (the slit's hem, sequined, both edges)
  stroke(g, split(g), GOWN[0], 4);
  for (let i = 0; i < 50; i++) { const k = i / 50, x = lerp(CX + 172, CX + 166, k) + Math.sin(k * 3) * -14, y = lerp(62, PANEL_H, k); g.fillStyle = i % 3 ? '#FFFFFF' : GOLD[3]; g.fillRect(Math.round(x) - 4, Math.round(y), 2, 2); }
  // (sequins everywhere, glitter coming off her)
  for (let i = 0; i < 260; i++) {
    const x = Math.round(rnd(i * 1.7) * PANEL_W), y = Math.round(rnd(i * 2.9 + 1) * PANEL_H);
    g.fillStyle = i % 5 === 0 ? GOLD[4] : i % 2 ? SATIN_HI : '#FFFFFF'; g.fillRect(x, y, 2, 2);
    if (i % 13 === 0) { g.fillRect(x - 2, y, 6, 1); g.fillRect(x, y - 2, 1, 6); }
  }
  sweatBeads(g, CX + 180, 90, 120, 150, 7, 12);
  tag(g, 'X-RAY', PANEL_W - 70, 270, '#F0ABFC');
});

// ---- the X-ray: the wide pelvis, the womb and its tubes (the ovaries go on live)
const xray = () => bakeOnce('piper-xray', g => {
  xrayWindow(g, WX, WY, WRX, WRY, XRAY, '#F0ABFC');
  clipTo(g, winPath(g, WX, WY, WRX, WRY), () => {
    const P = (x: number, y: number): [number, number] => [CX + x * 0.86, 14 + y * 0.72];
    const pelvis = () => {
      const m = (x: number, y: number) => { const p = P(x, y); g.moveTo(p[0], p[1]); };
      const l = (x: number, y: number) => { const p = P(x, y); g.lineTo(p[0], p[1]); };
      const q = (a: number, b: number, x: number, y: number) => { const p = P(a, b), r = P(x, y); g.quadraticCurveTo(p[0], p[1], r[0], r[1]); };
      m(-210, 10); q(-120, -6, -70, 34); q(-40, 66, -24, 92); l(24, 92); q(40, 66, 70, 34); q(120, -6, 210, 10);
      l(180, 66); q(110, 74, 66, 98); l(-66, 98); q(-110, 74, -180, 66); g.closePath();
    };
    banded(g, pelvis, CX - 190, 10, 380, 70, [BONE[4], BONE[3], BONE[2], BONE[1]], true, '#120628', 3);
    g.fillStyle = XRAY[2]; g.beginPath(); g.ellipse(CX, 50, 40, 18, 0, 0, Math.PI * 2); g.fill();
    // (the womb, the tubes curling out to where the ovaries sit)
    for (const s of [-1, 1]) {
      stroke(g, () => { g.moveTo(CX + s * 12, 70); g.bezierCurveTo(CX + s * 20, 44, CX + s * 50, 46, CX + s * (OV_DX + 6), OV_Y - 10); }, PINK[0], 7);
      stroke(g, () => { g.moveTo(CX + s * 12, 70); g.bezierCurveTo(CX + s * 20, 44, CX + s * 50, 46, CX + s * (OV_DX + 6), OV_Y - 10); }, PINK[2], 4);
      // (the fimbriae: the fringed ends reaching)
      for (let k = 0; k < 4; k++) stroke(g, () => { g.moveTo(CX + s * (OV_DX + 6), OV_Y - 10); g.lineTo(CX + s * (OV_DX + 14 + k * 3), OV_Y - 16 + k * 5); }, PINK[3], 2);
    }
    g.fillStyle = PINK[0]; g.beginPath(); g.moveTo(CX - 18, 64); g.bezierCurveTo(CX - 22, 90, CX - 6, 104, CX, 106); g.bezierCurveTo(CX + 6, 104, CX + 22, 90, CX + 18, 64); g.closePath(); g.fill();
    orb(g, CX, 78, 15, 18, PINK, PINK[0], true);
    scanlines(g, 0.16);
  });
});

// ---- the fat: banded layers, lobed, a pink membrane between, the skin's cut edge at the bottom
const fat = () => bakeOnce('piper-fat', g => {
  clipTo(g, winPath(g, WX, WY, WRX - 1, WRY - 1), () => {
    // (the skin's edge, under it all)
    banded(g, () => { g.moveTo(0, FAT_Y1); g.quadraticCurveTo(CX, FAT_Y1 + 30, PANEL_W, FAT_Y1); g.lineTo(PANEL_W, PANEL_H); g.lineTo(0, PANEL_H); g.closePath(); }, 0, FAT_Y1, PANEL_W, 40, [SKIN[3], SKIN[2], SKIN[1]], true, INK, 2);
    const N = 5, H = (FAT_Y1 - FAT_Y0) / N;
    for (let i = 0; i < N; i++) {
      const lo = FAT_Y1 - i * H, hi = lo - H;
      const band = () => { g.moveTo(0, lo); g.quadraticCurveTo(CX, lo + 30, PANEL_W, lo); g.lineTo(PANEL_W, hi); g.quadraticCurveTo(CX, hi + 30, 0, hi); g.closePath(); };
      const R = i % 2 ? [FAT[4], FAT[3], FAT[2]] : [FAT[3], FAT[2], FAT[1]];
      clipTo(g, band, () => {
        bands(g, 0, hi, PANEL_W, H + 16, R, true);
        // (lobules: little bags of grease, each lit)
        for (let k = 0; k < 40; k++) {
          const x = rnd(i * 50 + k) * PANEL_W, y = hi + 4 + rnd(i * 50 + k * 1.3 + 2) * (H + 10), r = 5 + rnd(i * 9 + k) * 5;
          g.strokeStyle = FAT[0]; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
          g.fillStyle = FAT[4]; g.fillRect(Math.round(x - r * 0.5), Math.round(y - r * 0.5), 2, 2);
        }
        vein(g, rnd(i * 3) * PANEL_W, hi + H * 0.6, rnd(i) > 0.5 ? 0.2 : Math.PI - 0.2, 70, i * 7, '#B91C1C', 2, '#FCA5A5');
      });
      // (the membrane between: pink, shiny)
      stroke(g, () => { g.moveTo(0, hi); g.quadraticCurveTo(CX, hi + 30, PANEL_W, hi); }, '#9D174D', 4);
      stroke(g, () => { g.moveTo(0, hi - 1); g.quadraticCurveTo(CX, hi + 29, PANEL_W, hi - 1); }, '#F9A8D4', 1.5);
    }
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < PANEL_H; y += 3) g.fillRect(0, y, PANEL_W, 1);
  });
});

// ---- the wings, the garter, the bits
const wing = () => bakeOnce('piper-wing', g => {
  g.globalAlpha = 0.82;
  for (const [cx, cy, rx, ry, rot] of [[70, 40, 62, 30, -0.35], [56, 78, 40, 20, 0.3]] as const) {
    g.save(); g.translate(cx, cy); g.rotate(rot);
    WING.forEach((col, i) => { const k = 1 - i / WING.length; g.fillStyle = i ? dith(g, col) : col; g.beginPath(); g.ellipse(-rx * (1 - k) * 0.3, 0, rx * k + 2, ry * k + 2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.ellipse(-rx * (1 - k) * 0.3, 0, rx * k, ry * k, 0, 0, Math.PI * 2); g.fill(); });
    g.strokeStyle = WING[0]; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 5; k++) { g.moveTo(-rx, 0); g.quadraticCurveTo(0, (k - 2) * ry * 0.3, rx * 0.9, (k - 2) * ry * 0.4); } g.stroke();
    g.restore();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#FFFFFF' : '#FFF0A0'; g.fillRect(Math.round(20 + rnd(i * 4) * 100), Math.round(20 + rnd(i * 6) * 70), 2, 2); }
}, 140, 104);

const garter = () => bakeOnce('piper-garter', g => {
  // (red lace: a band, a scalloped edge, holes, a bow, a heart charm)
  banded(g, () => g.rect(4, 8, 92, 12), 4, 8, 92, 12, ['#F87171', '#DC2626', '#991B1B'], true, '#2A0505', 2);
  g.fillStyle = '#1A0508'; for (let x = 6; x < 94; x += 8) { g.beginPath(); g.arc(x + 4, 22, 4, 0, Math.PI); g.fill(); }
  g.fillStyle = '#FCA5A5'; for (let x = 8; x < 94; x += 6) g.fillRect(x, 12, 2, 2);
  for (const s of [-1, 1]) banded(g, () => { g.moveTo(50, 14); g.lineTo(50 + s * 14, 6); g.lineTo(50 + s * 14, 22); g.closePath(); }, 34, 6, 32, 16, ['#F87171', '#B91C1C'], true, '#2A0505', 1.5);
  heartPath(g, 50, 28, 6); g.fillStyle = GOLD[3]; g.fill(); g.strokeStyle = GOLD[0]; g.lineWidth = 1.5; g.stroke();
}, 100, 40);

const heartPath = (g: Ctx, x: number, y: number, r: number) => {
  g.beginPath(); g.moveTo(x, y + r * 0.9);
  g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45);
  g.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.closePath();
};
const ovary = () => bakeOnce('piper-ovary', g => {
  orb(g, 22, 18, 17, 13, PINK);
  for (let i = 0; i < 6; i++) { const x = 10 + rnd(i * 3) * 24, y = 10 + rnd(i * 5) * 14; orb(g, x, y, 3, 3, ['#9D174D', '#F472B6', '#FBCFE8', '#FFFFFF'], '#6B1640', false); }
  vein(g, 8, 22, -0.3, 18, 3, '#7C3AED', 1);
}, 44, 36);
const bits = () => sheet('piper-gore', 8, 26, (g, i) => {
  if (i < 2) {
    const pts = Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2, r = 5 + rnd(i * 5 + k) * 5; return [Math.cos(a) * r, Math.sin(a) * r] as const; });
    banded(g, () => { pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }, -10, -10, 20, 20, [PINK[3], PINK[2], PINK[1]], true, INK, 2);
  } else if (i < 4) {
    orb(g, 0, 0, 7 + i, 6 + i * 0.5, FAT, FAT[0]);
  } else if (i < 6) {
    heartPath(g, 0, 1, 8); g.fillStyle = i === 4 ? '#DC2626' : '#F472B6'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFFFFF'; g.fillRect(-5, -4, 2, 2);
  } else if (i === 6) {
    g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * Math.PI * 2, r = k % 2 ? 4 : 10; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = GOLD[3]; g.fill(); g.strokeStyle = GOLD[0]; g.lineWidth = 2; g.stroke(); g.fillStyle = GOLD[4]; g.fillRect(-2, -5, 2, 3);
  } else {
    // (a broken heart: the two halves apart, the crack)
    g.save(); g.translate(-2, 0); g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-12, -1, -6, -10, 0, -4); g.lineTo(-2, 0); g.lineTo(1, 3); g.closePath(); g.fillStyle = '#DC2626'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.restore();
    g.save(); g.translate(3, 1); g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(12, -1, 6, -10, 0, -4); g.lineTo(-2, 0); g.lineTo(1, 3); g.closePath(); g.fillStyle = '#DC2626'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.restore();
  }
});

/** Glitter: twinkling crosses flung out like the blood, pink and gold. */
const glitter = (c: Ctx, t: number, x0: number, y0: number, n: number, seed: number) => {
  if (t < 0) return;
  for (let i = 0; i < n; i++) {
    const k = t - Math.floor(rnd(seed + i * 5) * 10);
    if (k < 0) continue;
    const a = -Math.PI / 2 + (rnd(seed + i) - 0.5) * 3.4, v = 2 + rnd(seed + i * 2) * 10;
    const x = Math.round(x0 + Math.cos(a) * v * k), y = Math.round(y0 + Math.sin(a) * v * k + 0.15 * k * k);
    if (y > PANEL_H || x < 0 || x > PANEL_W) continue;
    c.fillStyle = i % 3 === 0 ? '#FDE047' : i % 3 === 1 ? '#F0ABFC' : '#FFFFFF';
    if ((t + i) % 5 < 2) { c.fillRect(x - 3, y, 7, 1); c.fillRect(x, y - 3, 1, 7); } else c.fillRect(x, y, 2, 2);
  }
};

export const closeUp: CloseUpPaint = (c, t) => {
  const rip = t - RIP, h = handAt(t, CX, OV_Y + 8, { pull: 96, showY: 184 });
  c.save();
  c.fillStyle = INK; c.fillRect(0, 0, PANEL_W, PANEL_H);
  ripShake(c, t, 14);
  c.drawImage(body(), 0, 0);
  // (the garter: on her thigh, then snapped off and flying)
  if (rip < 0) c.drawImage(garter(), GX - 50, GY - 16);
  else if (rip < 40) { c.save(); c.translate(GX + rip * 5, GY - rip * 9 + 0.35 * rip * rip); c.rotate(rip * 0.35); c.drawImage(garter(), -50, -16); c.restore(); }
  // (the wings: buzzing like mad, frantic as he pulls, then drooped)
  for (const s of [-1, 1]) {
    const droop = rip < 0 ? 0 : Math.min(0.9, rip * 0.06), flap = rip < 0 ? 0.75 + Math.abs(Math.sin(t * (h.shut ? 2.6 : 1.3))) * 0.3 : 0.9;
    c.save(); c.translate(s < 0 ? -24 : PANEL_W + 24, 8); c.scale(s < 0 ? 1 : -1, 1); c.rotate(0.15 + droop); c.scale(1, flap); c.drawImage(wing(), -10, -40); c.restore();
  }
  c.drawImage(xray(), 0, 0);
  // (the fat: in strips, each shoved over a little: the jiggle running through it as his arm plows up through it, and
  // every yank, and the tear)
  const reach = t >= OPEN && t < GRIP + 4 ? 9 : 0;
  const amp = reach + (h.shut && rip < 0 ? h.jerk * 7 : 0) + (rip < 0 ? 0 : 12 * Math.exp(-rip / 10));
  c.save(); c.beginPath(); c.ellipse(WX, WY, WRX, WRY, 0, 0, Math.PI * 2); c.clip();
  // (the ovaries: little hearts coming off them; clamped together in his fist and dragged down through the fat, the
  // tubes stretched taut; then only the torn shreds left hanging off the tubes)
  const ovaries = () => {
    if (h.shut) drawTether(c, t, CX, OV_Y - 18, h.x, h.y - 30, h.strain, [PINK[0], PINK[2], PINK[3]], 2, 6, OV_DX + 10);
    for (const s of [-1, 1]) {
      const k = h.shut ? clamp(h.strain * 4 + 0.3) : 0;
      const x = lerp(CX + s * OV_DX, h.x + s * 16, k), y = h.shut ? Math.max(OV_Y, h.y - 28) : OV_Y;
      c.save(); c.translate(x, y); c.scale(1 - k * 0.2, 1 + k * 0.3); c.drawImage(ovary(), -22, -18); c.restore();
      if (!h.shut) for (let i = 0; i < 3; i++) { const u = (t * 1.2 + i * 17 + (s > 0 ? 8 : 0)) % 50; c.globalAlpha = 1 - u / 50; stampCell(c, bits(), 5, x + Math.sin(u * 0.2 + i) * 6, OV_Y - 10 - u, 0, 0.55); c.globalAlpha = 1; }
    }
  };
  if (rip < 0) {
    if (!h.shut) ovaries();
  } else {
    drawSnapped(c, rip, CX, OV_Y - 18, [PINK[0], PINK[2], PINK[3]], BLOOD[1], 2, 6, 30, OV_DX + 10);
  }
  const fc = fat();
  for (let y = FAT_Y0 - 30; y < PANEL_H; y += 10) {
    const dx = amp * Math.sin(y * 0.09 - t * 0.9);
    c.drawImage(fc, WX - WRX, y, WRX * 2, 10, WX - WRX + dx, y, WRX * 2, 10);
  }
  // (the hole his arm's torn through the fat: the layers bulging round it, a ripple off each yank)
  if (t >= OPEN + 4 && h.y < PANEL_H + 40) {
    const hy = Math.max(FAT_Y0, h.y + 40);
    for (const s of [-1, 1]) { c.fillStyle = FAT[2]; c.beginPath(); c.ellipse(h.x + s * 46, hy, 16, 26, s * 0.4, 0, Math.PI * 2); c.fill(); c.fillStyle = FAT[4]; c.fillRect(h.x + s * 46 - 6, hy - 18, 5, 4); c.strokeStyle = FAT[0]; c.lineWidth = 2; c.stroke(); }
    if (h.jerk > 0.3 || t < GRIP) { c.strokeStyle = 'rgba(255,244,196,0.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(h.x, hy, 60 + h.jerk * 30, 14 + h.jerk * 6, 0, Math.PI, Math.PI * 2); c.stroke(); }
  }
  // (once he's got them, dragged down through the fat with his fist, in front of it)
  if (rip < 0 && h.shut) ovaries();
  c.restore();
  // (blood and glitter running down the inside after)
  runs(c, rip - 4, [[CX - 60, 80], [CX - 30, 92], [CX + 30, 92], [CX + 62, 80], [CX - 90, 100], [CX + 96, 104]], BLOOD, 150, 3, 6);
  if (rip > 6) for (let i = 0; i < 10; i++) { const y = 90 + ((t * 2 + i * 23) % 150), x = CX - 90 + i * 20; if ((t + i) % 4 < 2) { c.fillStyle = i % 2 ? '#FDE047' : '#F0ABFC'; c.fillRect(x - 2, y, 5, 1); c.fillRect(x, y - 2, 1, 5); } }
  // (held up after: the pair in his fist, glittering, a heart or two still coming off them, dripping)
  if (h.held) {
    c.save(); c.translate(h.x, h.y - 16); c.rotate(h.rot);
    c.drawImage(ovary(), -40, -26); c.drawImage(ovary(), -4, -28);
    c.restore();
    glitter(c, rip % 20, h.x, h.y - 20, 8, 40 + (rip >> 2));
  }
  drawHand(c, h, t);
  gloveGore(c, h, [BLOOD[1], '#F472B6', FAT[2]]);
  if (h.held) drops(c, rip % 24, h.x, h.y + 10, 6, 4 + (rip >> 3), BLOOD, { spread: 0.8, ang: Math.PI / 2, v0: 1, v1: 3, delay: 10 });
  // (fat globs thrown off his arm going in)
  debris(c, bits(), 10, t - OPEN - 4, h.x, Math.max(FAT_Y0, h.y + 30), { seed: 41, ang: -Math.PI / 2, spread: 2.6, v0: 3, v1: 7, grav: 0.5, delay: 8, first: 2, cells: 2, scale: 1 });
  // (the tear: a gush of blood with glitter in it, hearts, stars, bits of her, fat flying)
  for (const s of [-1, 1]) {
    drops(c, rip, CX + s * OV_DX * 0.5, OV_Y + 30, 30, 11 + s, BLOOD, { spread: 3.6, v0: 3, v1: 12 });
    glitter(c, rip, CX + s * OV_DX * 0.5, OV_Y + 30, 34, 21 + s);
  }
  debris(c, bits(), 26, rip, CX, OV_Y + 40, { seed: 13, ang: -Math.PI / 2, spread: 3.8, v0: 3, v1: 11, grav: 0.3, delay: 4, scale: 1.2, first: 0, cells: 7 });
  if (rip > 8) for (let i = 0; i < 4; i++) { const u = (rip - 8 + i * 14) % 56; c.globalAlpha = 1 - u / 56; stampCell(c, bits(), 7, CX - 120 + i * 80, 120 - u * 1.4, Math.sin(u * 0.2) * 0.3, 1.2); c.globalAlpha = 1; }
  c.restore();
  effort(c, t);
  if (t >= OPEN + 4 && t < GRIP + 6) bigWord(c, t - OPEN - 4, 'SQUELCH...', CX + 140, 150, 12, FAT[3], '#3A2A04', 0.1);
  bigWord(c, rip, 'POP! POP!', CX + 110, 62, 26, '#F472B6', '#3A0620');
  ripFlash(c, t, '255,182,222', PANEL_W, PANEL_H);
  if (rip > 20) tag(c, 'LUST: OUT OF ORDER', 12, 268, '#F9A8D4');
};
