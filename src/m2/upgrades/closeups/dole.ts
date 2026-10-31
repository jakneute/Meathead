// The cheap shot's own close-up for Dole (Phase F; punditKit.ts the routine): the tall lean man in the gray suit, the
// red tie with its dots and the flag pin, the long face with its cleft chin, the gray hair combed flat, the heavy dark
// brows, the wry lopsided grin; his right fist at his side closed round his pen as always, his left giving a thumbs up,
// in front of the flag. The boot: CLANG! His fist clenches so hard the pen snaps in two (SNAP!) and squirts ink, red,
// purple, the wheeze, then he keels over.

import type { CloseUpPaint } from '../closeUp';
import { punditCloseUp, part, partTop, rp, dith, INK, px, bands, vignette, paintLegs, paintTorso, arm, cupArms, shout, GOLD, type Rp, type Ctx } from './punditKit';

const SKIN: Rp = ['#FFE4CE', '#F2C4A4', '#D8A080', '#B47C60'];
const GRAY: Rp = rp('#7A808C');
const HAIR: Rp = ['#F2F4F8', '#D1D5DB', '#A8AEB8', '#7E8490'];
const RED: Rp = rp('#C81E2E');
const S = 2.0, H = 2.8;

/** The pen: a black barrel, a gold clip. */
const pen = (g: Ctx, x0: number, y0: number, x1: number, y1: number) => {
  g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 3.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = '#1F2937'; g.lineWidth = 2; g.stroke(); g.lineCap = 'butt';
  px(g, x0 + (x1 - x0) * 0.15 - 1, y0 + (y1 - y0) * 0.15 - 1, 2, 2, GOLD[1]);
};

export const closeUp: CloseUpPaint = punditCloseUp({
  id: 'dole', S, H, head: [0, -98], chin: 24, top: 25, hip: 38, fall: 1, skin: SKIN,
  bang: 'CLANG!', bangCol: '#E5E7EB',
  bg: g => {
    // (the flag, big and dimmed: the stripes, the blue canton, its stars)
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#C9C3CF' : '#8E2A36'; g.fillRect(0, i * 22, 520, 22); if (i) { g.fillStyle = dith(g, i % 2 ? '#C9C3CF' : '#8E2A36'); g.fillRect(0, i * 22 - 2, 520, 2); } }
    g.fillStyle = '#1E2A5E'; g.fillRect(0, 0, 210, 154);
    for (let y = 0; y < 6; y++) for (let x = 0; x < (y % 2 ? 5 : 6); x++) { const sx = 18 + x * 34 + (y % 2) * 17, sy = 16 + y * 24; g.fillStyle = '#C9C3CF'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 2.6 : 6; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.fill(); }
    bands(g, ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.12)', 'rgba(0,0,0,0.2)']);
    vignette(g);
  },
  legs: (g, knock) => paintLegs(g, knock, { r: GRAY, hip: 38, hipX: 6, foot: 10, w: 8, shoeW: 12 }),
  body: (g, cup) => {
    paintTorso(g, { r: GRAY, top: 80, hip: 38, sw: 14, ww: 12, belly: 0, tie: RED });
    for (let k = 0; k < 4; k++) px(g, -1 + (k % 2) * 2, -76 + k * 5, 1, 1, '#FFFFFF');
    px(g, -11, -72, 5, 3, '#1D4ED8'); px(g, -11, -69, 5, 1, '#DC2626'); px(g, -11, -70, 5, 1, '#FFFFFF');
    if (cup) cupArms(g, { sw: 14, top: 80, hip: 38, w: 7, r: GRAY, skin: SKIN, bone: 23 });
    else {
      // (his right at his side, the fist round the pen; his left, a thumbs up)
      arm(g, -14, -74, -16, -46, 7, GRAY, SKIN, -1, 15);
      pen(g, -18, -49, -13, -37);
      arm(g, 14, -74, 24, -82, 7, GRAY, SKIN, 1, 12);
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(24, -83); g.lineTo(25, -91); g.stroke(); g.strokeStyle = SKIN[1]; g.lineWidth = 2; g.stroke(); g.lineCap = 'butt';
    }
  },
  face: g => {
    for (const s of [-1, 1]) part(g, () => g.ellipse(s * 14, 0, 3.6, 5.6, 0, 0, Math.PI * 2), SKIN, s * 14 - 4, s * 14 + 4, 1.2);
    const face = () => { g.moveTo(-13, -8); g.quadraticCurveTo(-14, -22, 0, -22); g.quadraticCurveTo(14, -22, 14, -6); g.quadraticCurveTo(16, 14, 8, 23); g.quadraticCurveTo(-2, 27, -10, 16); g.closePath(); };
    part(g, face, SKIN, -14, 16, 1.6);
    g.save(); g.beginPath(); face(); g.clip();
    g.fillStyle = dith(g, SKIN[2]); g.fillRect(6, -2, 6, 12);
    g.fillStyle = SKIN[2]; g.fillRect(-12, 18, 30, 10);
    g.restore();
    g.strokeStyle = SKIN[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(4, 20); g.lineTo(5, 24); g.moveTo(-6, 4); g.quadraticCurveTo(-8, 12, -4, 16); g.stroke();
    part(g, () => { g.moveTo(9, -5); g.lineTo(17, 6); g.lineTo(10, 8); g.closePath(); }, ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], 9, 17, 1.2);
  },
  hair: g => {
    const hair = () => { g.moveTo(-14, -8); g.quadraticCurveTo(-15, -25, 2, -25); g.quadraticCurveTo(16, -25, 15, -10); g.lineTo(8, -16); g.quadraticCurveTo(-2, -18, -14, -8); g.closePath(); };
    partTop(g, hair, HAIR, -25, -8, 1.4);
    g.strokeStyle = HAIR[3]; g.lineWidth = 0.8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-10 + k * 5, -22); g.lineTo(-5 + k * 6, -16); g.stroke(); }
    px(g, -8, -24, 1, 6, HAIR[3]);
  },
  eyes: [[-4, -4], [8, -4]], eyeR: 2.8, brow: '#2A2A36', browY: -11,
  mouth: [4, 12],
  mouthPre: (c) => {
    // (the wry lopsided grin)
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-2, 12); c.quadraticCurveTo(5, 14, 11, 9); c.stroke();
  },
  front: (c, f) => {
    if (f.hit < 0) return;
    // (the pen snapped in his fist: the halves flying, the ink squirting up)
    const k = f.hit, fx = -3.5 * S, fy = (-38 + 1) * S + 4;
    if (k >= 4) {
      const u = k - 4;
      c.save(); c.translate(fx - u * 4, fy - u * 8 + u * u * 0.6); c.rotate(-u * 0.5); c.scale(S, S); pen(c, -5, 0, 5, 0); c.restore();
      c.save(); c.translate(fx + u * 5, fy - u * 6 + u * u * 0.6); c.rotate(u * 0.6); c.scale(S, S); pen(c, -5, 0, 5, 0); c.restore();
      if (u < 26) {
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 + (i - 4) * 0.16, v = 9 + (i % 3) * 2.5, d = u - (i % 4);
          if (d < 0) continue;
          const x = fx + Math.cos(a) * v * d, y = fy + Math.sin(a) * v * d + 0.55 * d * d;
          c.fillStyle = INK; c.fillRect(x - 3.5, y - 3.5, 7, 7); c.fillStyle = '#1E40AF'; c.fillRect(x - 2.5, y - 2.5, 5, 5); c.fillStyle = '#60A5FA'; c.fillRect(x - 2.5, y - 2.5, 2, 1);
        }
      }
      if (u < 16) shout(c, 'SNAP!', fx - 60, fy - 70, 12, '#93C5FD', -0.12);
    }
  },
});
