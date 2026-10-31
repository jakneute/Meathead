// The cheap shot's own close-up for Donnie Dracula (Phase F; gluttony): shiny polyester tux trousers with their satin
// stripes, the red cummerbund lost under a gut straining a ruffled tux shirt (buttons gapping, belly hair through the
// gaps). Through the lens the gut's nothing but FAT, banded yellow, and a fat apron hangs down over the balls: the boot
// has to sink up through it (the fat dents round the toe and ripples out in waves, the gut wobbles for seconds) before
// it finds anything to crush. Fat globs in the blood; the chicken leg he was working on drops out of his hand.

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, PANEL_H, bakeOnce, rnd } from '../closeUp';
import { type Ramp, type Ctx, banded, bodyPath, paintBackdrop, paintCloth, paintWindow, paintTag, dither, hairs, runFlesh, WX, WY, WRX, WRY, BLOOD } from './fleshKit';

// (Donnie's ramps: spooky/donnie.ts)
const SKIN: Ramp = ['#FBE3D6', '#F2C6AE', '#DCA48A', '#B97E66', '#6E4234'];
const SHIRT: Ramp = ['#FFFFFF', '#F1EEE6', '#D6D1C2', '#ADA796', '#5E5A4E'];
const POLY: Ramp = ['#4A4A58', '#26262E', '#18181E', '#0E0E12', '#000000'];
const SATIN: Ramp = ['#6B6B7A', '#3F3F4C', '#2A2A34', '#1C1C24', '#08080C'];
const LINING: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
const FRIED: Ramp = ['#F6C877', '#E09A3A', '#B8701E', '#8A4A10', '#4A2406'];
const BONEY: Ramp = ['#FFFBEB', '#F1E6C8', '#D8C8A0', '#B8A478', '#6E5E3E'];
const FAT: Ramp = ['#FEF3C7', '#FDE68A', '#FBBF24', '#D97706', '#78350F'];
const HAIR = '#3C3228';
const TAU = Math.PI * 2;

const scene = () => bakeOnce('donnie-scene', g => {
  paintBackdrop(g, ['#3B2A4E', '#2E2040', '#231833', '#181026', '#0E0818']);
  // (the castle's stone behind his legs)
  g.fillStyle = '#0B0614';
  for (let y = 0; y < PANEL_H; y += 26) { g.fillRect(0, y, PANEL_W, 2); for (let x = (y / 26) % 2 * 30; x < PANEL_W; x += 60) g.fillRect(x, y, 2, 26); }
  paintCloth(g, POLY, {});
  // (the satin stripes down the outer seams, shiny)
  g.save(); g.beginPath(); bodyPath(g); g.clip();
  for (const x of [26, PANEL_W - 46]) { banded(g, p => p.rect(x, 0, 20, PANEL_H), x, 0, 20, PANEL_H, SATIN, [2, 1, 0, 1, 3], 'x'); }
  // (the polyester's sheen: a hard white glint down each thigh)
  g.fillStyle = POLY[0]; g.fillRect(96, 120, 4, 140); g.fillRect(PANEL_W - 150, 140, 3, 120);
  g.restore();
  paintWindow(g, { skin: SKIN, cloth: POLY, hair: HAIR, fat: 22, veins: 'rgba(220,38,38,0.4)' });
  paintTag(g, 'DONNIE DRACULA');
});

const gutPath = (p: Ctx) => { p.ellipse(CX + 6, -16, 262, 112, 0, 0, TAU); };
/** The gut: the shirt and cummerbund outside the lens; inside it, the same gut as fat, banded, see-through. */
const gut = () => bakeOnce('donnie-gut', g => {
  // (the cummerbund sagging out from under the overhang at the sides)
  banded(g, p => { p.moveTo(-10, 60); p.quadraticCurveTo(CX, 140, PANEL_W + 10, 60); p.lineTo(PANEL_W + 10, 90); p.quadraticCurveTo(CX, 170, -10, 90); p.closePath(); }, -10, 60, PANEL_W + 20, 110, LINING, [1, 2, 2, 3], 'y', LINING[4], 3);
  for (let i = 0; i < 6; i++) { g.strokeStyle = LINING[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, 68 + i * 4); g.quadraticCurveTo(CX, 148 + i * 4, PANEL_W + 10, 68 + i * 4); g.stroke(); }
  // (the shirt over the gut: banded round, ruffles down the front, buttons gapping, hair through the gaps, sweat)
  banded(g, gutPath, -260, -130, PANEL_W + 520, 230, SHIRT, [0, 0, 1, 1, 2, 3], 'y', SHIRT[4], 4);
  g.save(); g.beginPath(); gutPath(g); g.clip();
  for (let i = 0; i < 5; i++) { g.strokeStyle = SHIRT[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(CX - 40 + i * 20, -10); g.quadraticCurveTo(CX - 46 + i * 20, 40, CX - 38 + i * 20, 92); g.stroke(); }
  for (let y = 10; y < 90; y += 26) {
    g.fillStyle = SKIN[2]; g.beginPath(); g.ellipse(CX + 6, y + 10, 10, 6, 0, 0, TAU); g.fill();
    hairs(g, CX - 4, y + 4, 20, 12, 8, HAIR, y);
    g.fillStyle = SHIRT[4]; g.fillRect(CX + 2, y, 8, 6); g.fillStyle = '#FFFFFF'; g.fillRect(CX + 3, y + 1, 3, 2);
  }
  dither(g, 30, 30, 120, 60, SHIRT[3]); dither(g, PANEL_W - 150, 30, 120, 60, SHIRT[3]);
  g.restore();
  // (inside the lens the gut's X-rayed: wipe the shirt, paint the fat)
  g.save(); g.beginPath(); g.ellipse(WX, WY, WRX - 1, WRY - 1, 0, 0, TAU); g.clip();
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(0, 0, PANEL_W, PANEL_H); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 0.72;
  for (let i = 0; i < 4; i++) { g.fillStyle = FAT[3 - i]; g.beginPath(); g.ellipse(CX + 6, -16, 262 - i * 22, 112 - i * 16, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  // (the fat's lumps, its stretch marks; the skin's lit edge; the gaps' hair)
  g.fillStyle = FAT[0]; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(CX - 130 + rnd(i * 3.7) * 260, 4 + rnd(i * 5.3 + 40) * 70, 8, 5, 0, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(190,24,93,0.6)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { const x = CX - 110 + i * 30; g.beginPath(); g.moveTo(x, 50 + (i % 3) * 6); g.lineTo(x + 6, 80 + (i % 2) * 6); g.stroke(); }
  g.strokeStyle = '#7DD3FC'; g.lineWidth = 2; g.beginPath(); g.ellipse(CX + 6, -16, 260, 110, 0, 0.1, Math.PI - 0.1); g.stroke();
  g.restore();
  paintTag(g, 'DONNIE DRACULA');
});

/** The fat apron hanging over the balls: banded yellow fat, see-through, lumpy, the bush through it. 220x80. */
const apron = () => bakeOnce('donnie-apron', g => {
  const path = (p: Ctx) => { p.moveTo(6, 0); p.lineTo(214, 0); p.quadraticCurveTo(222, 40, 180, 64); p.quadraticCurveTo(140, 82, 110, 74); p.quadraticCurveTo(80, 82, 40, 64); p.quadraticCurveTo(-2, 40, 6, 0); p.closePath(); };
  g.globalAlpha = 0.78; banded(g, path, 0, 0, 220, 80, FAT, [0, 1, 1, 2, 3], 'y'); g.globalAlpha = 1;
  g.beginPath(); path(g); g.strokeStyle = FAT[4]; g.lineWidth = 3; g.stroke();
  for (let i = 0; i < 9; i++) { g.fillStyle = FAT[0]; g.beginPath(); g.ellipse(20 + i * 22, 20 + (i % 3) * 12, 7, 4, 0, 0, TAU); g.fill(); }
  g.strokeStyle = FAT[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 40); g.quadraticCurveTo(110, 60, 190, 40); g.stroke();
  hairs(g, 30, 30, 160, 44, 40, HAIR, 33, 1.4);
}, 220, 80);

const drumstick = () => bakeOnce('donnie-drum', g => {
  banded(g, p => p.rect(40, 14, 30, 8), 40, 14, 30, 8, BONEY, [0, 1, 2], 'y', BONEY[4], 2);
  for (const y of [12, 24]) { g.fillStyle = BONEY[1]; g.beginPath(); g.arc(70, y, 5, 0, TAU); g.fill(); g.strokeStyle = BONEY[4]; g.lineWidth = 2; g.stroke(); }
  banded(g, p => p.ellipse(26, 18, 24, 15, 0, 0, TAU), 2, 3, 48, 30, FRIED, [0, 1, 2, 3], 'y', FRIED[4], 2);
  g.fillStyle = FRIED[0]; for (let i = 0; i < 7; i++) g.fillRect(8 + i * 5, 8 + (i % 3) * 6, 3, 2);
  g.fillStyle = '#F5F0DC'; g.fillRect(14, 12, 10, 6); // (bitten)
}, 80, 36);

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'donnie', scene, skin: SKIN, hair: HAIR, sacScale: 1.05, sacY: 158,
  burstAt: 8, shakeAmp: 9, word: 'SQUELCH!', caption: 'THROUGH THE FAT',
  bloodCols: [BLOOD[1], BLOOD[2], FAT[1], BLOOD[3], FAT[0]],
  burstCols: [FAT[1], '#F7A1BC', BLOOD[2], FAT[2]],
  front: (c, t, hit, toe) => {
    // (the apron: ten slices, each dented up by the toe near it, rippling out after the hit)
    const ap = apron(), ax = CX - 110, ay = 118;
    const bottom = ay + 74, dentAt = Math.max(0, bottom - (toe - 30));
    for (let i = 0; i < 10; i++) {
      const sx = i * 22, mid = ax + sx + 11, d = Math.abs(mid - CX);
      const dent = dentAt * Math.exp(-(d * d) / 2400);
      const rip = hit >= 0 ? Math.sin(d * 0.08 - hit * 0.7) * 7 * Math.max(0, 1 - hit / 50) : Math.sin(t * 0.2 + i) * 0.8;
      const h = Math.max(10, 80 - dent * 0.6);
      c.drawImage(ap, sx, 0, 22, 80, ax + sx, ay + rip - dent * 0.35, 22.5, h);
    }
  },
  overBoot: (c, t, hit) => {
    // (the gut, wobbling: breathing before; after the hit, waves through it for seconds)
    const gt = gut();
    const amp = hit < 0 ? 1.5 : 10 * Math.max(0, 1 - hit / 70);
    for (let i = 0; i < 10; i++) {
      const sx = i * 52, dy = Math.sin(sx * 0.025 - (hit < 0 ? t * 0.15 : hit * 0.55)) * amp + (hit < 0 ? 0 : Math.max(0, 6 - hit) * -2);
      c.drawImage(gt, sx, 0, 52, 150, sx, dy, 52, 150);
    }
    // (sweat off the gut)
    for (let i = 0; i < 5; i++) { const y = ((t * 3 + i * 41) % 120) + 40; c.fillStyle = '#BFDBFE'; c.fillRect(60 + i * 96, y, 3, 5); c.fillStyle = '#FFFFFF'; c.fillRect(60 + i * 96, y, 1, 2); }
  },
  top: (c, t, hit) => {
    // (the chicken leg: dropped on the hit, tumbling down through the lot)
    if (hit < 2) return;
    const k = hit - 2, y = -30 + k * 3 + 0.35 * k * k;
    if (y > PANEL_H + 40) return;
    c.save(); c.translate(CX + 150 - k * 2, y); c.rotate(k * 0.3); c.drawImage(drumstick(), -40, -18); c.restore();
  },
});
