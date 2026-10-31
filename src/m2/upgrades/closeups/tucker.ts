// The cheap shot's own close-up for Tucker the conductor (Phase F; greed): gray pinstriped trousers, the navy frock
// coat's tails either side (gold piping, brass buttons), the burgundy vest's points and the brass watch chain swagged
// across. Through the lens, what he keeps down there besides the obvious: a fat leather money pouch on a drawstring,
// stuffed with gold. The boot bursts the lot: gold coins spray out spinning with the blood and ring down into the pool,
// the chain snaps and his pocket watch swings loose. KA-CHING.

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, PANEL_H, bakeOnce, rnd } from '../closeUp';
import { type Ramp, type Ctx, banded, bodyPath, paintBackdrop, paintCloth, paintWindow, paintTag, dither, runFlesh, BLOOD } from './fleshKit';

// (Tucker's ramps: frontier/tucker.ts)
const SKIN: Ramp = ['#FFE8D2', '#F6C9A6', '#E0A280', '#BC7A5C', '#6E3C28'];
const COAT: Ramp = ['#5A6CA2', '#36467E', '#283662', '#1A2446', '#0A0F22'];
const VEST: Ramp = ['#C25A58', '#982F35', '#76222A', '#54161C', '#28080C'];
const SHIRT: Ramp = ['#FFFFFF', '#F4F0E6', '#D8D2C4', '#B2AA9A', '#5E5A50'];
const TROUSER: Ramp = ['#9C9CA4', '#7A7A84', '#5E5E68', '#46464E', '#202024'];
const BRASS: Ramp = ['#FFF6BE', '#F4CC4E', '#CC9E2C', '#926E16', '#4A3608'];
const WALNUT: Ramp = ['#B07A46', '#7A4A24', '#5E3618', '#42240E', '#1E1006'];
const HAIR = '#B4642E'; // (ginger, all over)
const TAU = Math.PI * 2;

const scene = () => bakeOnce('tucker-scene', g => {
  // (the train car's plank floor behind his legs)
  paintBackdrop(g, ['#8A5A32', '#74492A', '#5E3A20', '#4A2C18', '#331E10']);
  g.fillStyle = '#24140A'; for (let x = 0; x < PANEL_W; x += 34) g.fillRect(x, 0, 2, PANEL_H);
  g.fillStyle = '#A8865A'; for (let x = 2; x < PANEL_W; x += 34) g.fillRect(x, 0, 1, PANEL_H);
  paintCloth(g, TROUSER, {});
  // (the pinstripes)
  g.save(); g.beginPath(); bodyPath(g); g.clip();
  g.fillStyle = TROUSER[4]; for (let x = 4; x < PANEL_W; x += 13) g.fillRect(x, 0, 1, PANEL_H);
  g.fillStyle = TROUSER[0]; for (let x = 10; x < PANEL_W; x += 26) dither(g, x, 0, 1, PANEL_H, TROUSER[0]);
  g.restore();
  // (the coat's tails either side: navy, gold piping, brass buttons)
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -10 : PANEL_W - 70;
    const tail = (p: Ctx) => { if (s < 0) { p.moveTo(-10, -10); p.lineTo(70, -10); p.quadraticCurveTo(84, 120, 46, 250); p.lineTo(-10, 260); p.closePath(); } else { p.moveTo(PANEL_W + 10, -10); p.lineTo(PANEL_W - 70, -10); p.quadraticCurveTo(PANEL_W - 84, 120, PANEL_W - 46, 250); p.lineTo(PANEL_W + 10, 260); p.closePath(); } };
    banded(g, tail, x0, -10, 80, 280, COAT, s < 0 ? [1, 2, 3] : [3, 2, 2], 'x', BRASS[2], 4);
    g.beginPath(); tail(g); g.strokeStyle = COAT[4]; g.lineWidth = 1; g.stroke();
    for (let i = 0; i < 3; i++) { const bx = s < 0 ? 50 : PANEL_W - 50, by = 70 + i * 50; banded(g, p => p.arc(bx, by, 7, 0, TAU), bx - 7, by - 7, 14, 14, BRASS, [0, 1, 2, 3], 'y', BRASS[4], 2); }
  }
  paintWindow(g, { skin: SKIN, cloth: TROUSER, hair: HAIR });
  paintTag(g, 'TUCKER');
});

// (the vest's points and the shirt between, over the waist; the chain's drawn live)
const over = () => bakeOnce('tucker-over', g => {
  const vest = (p: Ctx) => { p.moveTo(40, -10); p.lineTo(PANEL_W - 40, -10); p.lineTo(PANEL_W - 70, 30); p.lineTo(CX + 30, 58); p.lineTo(CX + 8, 34); p.lineTo(CX - 8, 34); p.lineTo(CX - 30, 58); p.lineTo(70, 30); p.closePath(); };
  banded(g, p => p.rect(CX - 30, -10, 60, 50), CX - 30, -10, 60, 50, SHIRT, [1, 2, 3], 'y', SHIRT[4], 2);
  banded(g, vest, 40, -10, PANEL_W - 80, 70, VEST, [0, 1, 2, 3], 'y', VEST[4], 3);
  for (let i = 0; i < 3; i++) banded(g, p => p.arc(CX - 18 + i * 0, 6 + i * 12, 4, 0, TAU), CX - 22, 2 + i * 12, 8, 8, BRASS, [0, 2, 3], 'y', BRASS[4], 1);
  // (the watch pocket and the chain's bar)
  g.fillStyle = VEST[4]; g.fillRect(100, 12, 44, 3); g.fillRect(PANEL_W - 144, 12, 44, 3);
  dither(g, 120, 0, 280, 20, VEST[3]);
});

const pouch = () => bakeOnce('tucker-pouch', g => {
  // (the drawstring up out of the top, the pouch bulging, coins showing at the neck, a $ stitched on)
  g.strokeStyle = WALNUT[4]; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 22); g.quadraticCurveTo(30, 6, 44, 0); g.stroke();
  const path = (p: Ctx) => { p.moveTo(30, 20); p.quadraticCurveTo(0, 40, 8, 64); p.quadraticCurveTo(20, 84, 44, 82); p.quadraticCurveTo(76, 80, 78, 56); p.quadraticCurveTo(76, 36, 52, 20); p.closePath(); };
  banded(g, path, 0, 16, 80, 70, WALNUT, [0, 1, 2, 3], 'y', WALNUT[4], 3);
  banded(g, p => p.ellipse(41, 22, 14, 6, 0, 0, TAU), 27, 16, 28, 12, BRASS, [0, 1, 3], 'y', BRASS[4], 2);
  g.strokeStyle = WALNUT[3]; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(32 + i * 4, 26); g.lineTo(26 + i * 6, 38); g.stroke(); }
  g.font = '14px "Press Start 2P"'; g.fillStyle = BRASS[1]; g.fillText('$', 32, 66); g.fillStyle = BRASS[4]; g.fillRect(31, 68, 16, 1);
  g.fillStyle = WALNUT[0]; g.fillRect(14, 44, 3, 12);
}, 84, 90);

const watch = () => bakeOnce('tucker-watch', g => {
  banded(g, p => p.arc(16, 18, 13, 0, TAU), 3, 5, 26, 26, BRASS, [0, 1, 2, 3], 'y', BRASS[4], 2);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(16, 18, 9, 0, TAU); g.fill();
  g.strokeStyle = '#111'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(16, 18); g.lineTo(16, 11); g.moveTo(16, 18); g.lineTo(21, 20); g.stroke();
  g.fillStyle = BRASS[2]; g.fillRect(14, 0, 4, 5);
}, 32, 34);

const coin = (c: Ctx, x: number, y: number, spin: number) => {
  const w = Math.max(1, Math.abs(Math.cos(spin)) * 7);
  c.fillStyle = BRASS[4]; c.beginPath(); c.ellipse(x, y, w + 1, 8, 0, 0, TAU); c.fill();
  c.fillStyle = BRASS[1]; c.beginPath(); c.ellipse(x, y, w, 7, 0, 0, TAU); c.fill();
  if (w > 3) { c.fillStyle = BRASS[0]; c.fillRect(x - w * 0.5, y - 4, 2, 3); c.fillStyle = BRASS[3]; c.fillRect(x - 1, y - 2, 2, 5); }
};

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'tucker', scene, over, skin: SKIN, hair: HAIR, sacScale: 0.95,
  word: 'KA-CHING!', caption: 'PAID IN FULL', captionCol: BRASS[1],
  bloodCols: [BLOOD[1], BLOOD[2], BLOOD[3], BRASS[1]],
  behind: (c, t, hit) => {
    // (the pouch, tucked in beside them; squashed then torn open on the hit)
    if (hit >= 3) return;
    const sq = hit < 0 ? 0 : (hit + 1) / 3;
    c.drawImage(pouch(), CX + 24 - sq * 6, 108 + sq * 20 + (hit < 0 ? Math.sin(t * 0.2) * 1.5 : 0), 84 * (1 + sq * 0.5), 90 * (1 - sq * 0.45));
  },
  front: (c, t, hit, toe) => {
    // (the coins: out of the pouch on the hit, spinning, falling, rolling into the pool and settling in a pile)
    if (hit < 3) return;
    const k = hit - 3;
    for (let i = 0; i < 26; i++) {
      const st = Math.floor(rnd(i * 5.5) * 6), kk = k - st;
      if (kk < 0) continue;
      const a = -Math.PI / 2 + (rnd(i * 2.2 + 1) - 0.5) * 3.2, v = 4 + rnd(i * 3.7) * 8;
      let x = CX + 50 + Math.cos(a) * v * kk, y = toe - 60 + Math.sin(a) * v * kk + 0.4 * kk * kk;
      const floor = PANEL_H - 12 - (i % 4) * 5;
      let spin = kk * (0.4 + rnd(i) * 0.5);
      if (y > floor) { const B = v * Math.sin(a), C = toe - 60 - floor, tl = (-B + Math.sqrt(Math.max(0, B * B - 1.6 * C))) / 0.8; y = floor; x = CX + 50 + Math.cos(a) * v * tl; spin = 0; }
      if (x < -10 || x > PANEL_W + 10) continue;
      coin(c, x, y, spin);
    }
    // (the pouch's empty rag, flapping)
    c.fillStyle = WALNUT[3]; c.beginPath(); c.moveTo(CX + 30, toe - 40); c.quadraticCurveTo(CX + 70 + Math.sin(hit * 0.4) * 6, toe - 50, CX + 66, toe - 10); c.lineTo(CX + 30, toe - 22); c.fill();
    c.fillStyle = WALNUT[1]; c.fillRect(CX + 40, toe - 36, 18, 4);
  },
  overBoot: (c, t, hit) => {
    // (the watch chain: swagged across, then snapped on the hit, the watch swinging down on its end, then dropping)
    const w = watch();
    if (hit < 2) {
      c.strokeStyle = BRASS[3]; c.lineWidth = 4; c.beginPath(); c.moveTo(120, 14); c.quadraticCurveTo(CX, 80, PANEL_W - 122, 14); c.stroke();
      c.strokeStyle = BRASS[1]; c.lineWidth = 2; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]);
      c.drawImage(w, PANEL_W - 140, 10);
      return;
    }
    const k = hit - 2, ang = Math.sin(k * 0.25) * 1.2 * Math.max(0.2, 1 - k / 70);
    const ex = 120 + Math.sin(ang) * 110, ey = 14 + Math.cos(ang) * 110;
    c.strokeStyle = BRASS[3]; c.lineWidth = 4; c.beginPath(); c.moveTo(120, 14); c.quadraticCurveTo(120 + Math.sin(ang) * 40, 70, ex, ey); c.stroke();
    c.strokeStyle = BRASS[1]; c.lineWidth = 2; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]);
    if (k < 40) c.drawImage(w, ex - 16, ey - 4);
    else { const fk = k - 40, fy = ey + fk * 4 + 0.4 * fk * fk; if (fy < PANEL_H) c.drawImage(w, ex - 16, fy); }
    // (the other end, dangling off the far pocket)
    c.strokeStyle = BRASS[3]; c.lineWidth = 4; c.beginPath(); c.moveTo(PANEL_W - 122, 14); c.lineTo(PANEL_W - 126 + Math.sin(k * 0.3) * 4, 46); c.stroke();
  },
});
