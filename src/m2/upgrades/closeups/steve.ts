// The cheap shot's own close-up for Stuntman Steve (Phase F; envy): the faded yellow stunt jumpsuit, red racing stripes
// down the seams (white pinstripes), the black knee pads with their logo half peeled, the tooled belt and the big gold S
// buckle under the gut. Through the lens: his blue briefs, and a stuntman's protective cup, white plastic, taped up from
// forty years of falls, SAFETY FIRST on it. His glove clamps on cup and all and wrenches (fleshKit.ts runFlesh: the
// rip): the cup cracks and shatters as the rest tears out (the shards flying). And he's green with envy right through:
// bile in the blood, bile floating on the pool.

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, PANEL_H, bakeOnce, rnd } from '../closeUp';
import { type Ramp, type Ctx, banded, bodyPath, paintBackdrop, paintCloth, paintWindow, paintTag, dither, runFlesh, WX, WY, WRX, WRY, BLOOD } from './fleshKit';

// (Steve's ramps: hollywood/stunt/steve.ts)
const SUIT: Ramp = ['#FEF3A0', '#F5C518', '#D9A30F', '#A87A08', '#4E3504'];
const STRIPE: Ramp = ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3B0A0A'];
const SKIN: Ramp = ['#F3BE90', '#D88C5A', '#B66B3F', '#8B4A2A', '#45200F'];
const PAD: Ramp = ['#6B6B73', '#3A3A40', '#28282D', '#19191C', '#060607'];
const BELT: Ramp = ['#B57A45', '#8A5428', '#6A3D1A', '#4A280E', '#211005'];
const BRIEFS: Ramp = ['#93C5FD', '#2563EB', '#1D4ED8', '#1E3A8A', '#0B1A45'];
const GOLD: Ramp = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#5A3A06'];
const CUP: Ramp = ['#FFFFFF', '#F1F3F0', '#D5D9D0', '#A7AC9F', '#565A50'];
const BILE: Ramp = ['#D9F99D', '#A3E635', '#65A30D', '#3F6212', '#1A2E05'];
const HAIR = '#A39A91'; // (gone gray)
const TAU = Math.PI * 2;

const scene = () => bakeOnce('steve-scene', g => {
  paintBackdrop(g, ['#4B4B52', '#3D3D44', '#303036', '#24242A', '#18181C']);
  // (the stunt floor: a yellow lane line, skid marks)
  g.fillStyle = '#CA8A04'; g.fillRect(CX - 6, 0, 12, PANEL_H);
  g.fillStyle = '#111114'; for (let i = 0; i < 4; i++) g.fillRect(40 + i * 120, 200 + (i % 2) * 30, 90, 10);
  paintCloth(g, SUIT, {});
  // (the racing stripes down the outer seams, a white pinstripe either side)
  g.save(); g.beginPath(); bodyPath(g); g.clip();
  for (const x of [30, PANEL_W - 54]) { g.fillStyle = '#F4F1EA'; g.fillRect(x - 4, 0, 32, PANEL_H); banded(g, p => p.rect(x, 0, 24, PANEL_H), x, 0, 24, PANEL_H, STRIPE, [1, 0, 1, 2], 'x'); }
  // (the knee pads, black, the logo half peeled)
  for (const s of [-1, 1]) {
    const x = CX + s * 150 - 50;
    banded(g, p => p.roundRect(x, 226, 100, 70, 14), x, 226, 100, 70, PAD, [0, 1, 2, 3], 'y', PAD[4], 3);
    g.fillStyle = '#DC2626'; g.fillRect(x + 22, 246, 34, 12); g.fillStyle = PAD[2]; g.fillRect(x + 44, 246, 16, 12);
    g.fillStyle = '#FFFFFF'; g.font = '7px "Press Start 2P"'; g.fillText('STN', x + 24, 256);
  }
  // (a sponsor patch on the hip: the lightning bolt)
  banded(g, p => p.roundRect(40, 60, 70, 40, 4), 40, 60, 70, 40, CUP, [0, 1, 2], 'y', CUP[4], 2);
  g.fillStyle = '#2563EB'; g.beginPath(); g.moveTo(80, 64); g.lineTo(64, 82); g.lineTo(74, 82); g.lineTo(66, 98); g.lineTo(86, 76); g.lineTo(76, 76); g.closePath(); g.fill();
  g.restore();
  paintWindow(g, { skin: SKIN, cloth: SUIT, hair: HAIR });
  // (the briefs, ghosted in the lens)
  g.save(); g.beginPath(); g.ellipse(WX, WY, WRX - 2, WRY - 2, 0, 0, TAU); g.clip();
  const briefs = (p: Ctx) => { p.moveTo(CX - 150, 40); p.lineTo(CX + 150, 40); p.lineTo(CX + 120, 110); p.quadraticCurveTo(CX + 40, 150, CX + 26, 200); p.lineTo(CX - 26, 200); p.quadraticCurveTo(CX - 40, 150, CX - 120, 110); p.closePath(); };
  g.globalAlpha = 0.22; g.fillStyle = BRIEFS[1]; g.beginPath(); briefs(g); g.fill(); g.globalAlpha = 0.8; g.strokeStyle = BRIEFS[0]; g.lineWidth = 2; g.beginPath(); briefs(g); g.stroke();
  g.globalAlpha = 1; g.restore();
  paintTag(g, 'STUNTMAN STEVE');
});

// (the gut over the belt, the belt, the big gold S buckle)
const over = () => bakeOnce('steve-over', g => {
  banded(g, p => p.ellipse(CX + 10, -30, 250, 70, 0, 0, TAU), -240, -100, PANEL_W + 480, 110, SUIT, [0, 1, 1, 2, 3], 'y', SUIT[4], 4);
  dither(g, CX - 70, 10, 140, 26, SUIT[3]);
  for (const x of [30, PANEL_W - 54]) { g.save(); g.beginPath(); g.ellipse(CX + 10, -30, 248, 68, 0, 0, TAU); g.clip(); g.fillStyle = STRIPE[1]; g.fillRect(x, 0, 24, 60); g.restore(); }
  banded(g, p => { p.moveTo(-10, 30); p.quadraticCurveTo(CX, 48, PANEL_W + 10, 30); p.lineTo(PANEL_W + 10, 48); p.quadraticCurveTo(CX, 66, -10, 48); p.closePath(); }, -10, 30, PANEL_W + 20, 40, BELT, [0, 1, 2, 3], 'y', BELT[4], 2);
  // (tooling on the leather)
  g.strokeStyle = BELT[3]; g.lineWidth = 1; for (let x = 10; x < PANEL_W; x += 16) { g.beginPath(); g.arc(x, 42 + Math.sin(x / PANEL_W * Math.PI) * 14, 4, 0, TAU); g.stroke(); }
  banded(g, p => p.roundRect(CX - 40, 30, 80, 46, 8), CX - 40, 30, 80, 46, GOLD, [0, 1, 2, 3], 'y', GOLD[4], 3);
  g.font = '28px "Press Start 2P"'; g.fillStyle = GOLD[4]; g.fillText('S', CX - 14, 68); g.fillStyle = GOLD[0]; g.fillText('S', CX - 16, 66);
  g.fillStyle = '#FFFFFF'; g.fillRect(CX - 34, 34, 20, 2);
});

/** The cup: white plastic, air holes, duct tape on its cracks, SAFETY FIRST. 120x90. */
const cupPath = (p: Ctx) => { p.moveTo(8, 6); p.quadraticCurveTo(60, -4, 112, 6); p.quadraticCurveTo(108, 50, 74, 84); p.quadraticCurveTo(60, 92, 46, 84); p.quadraticCurveTo(12, 50, 8, 6); p.closePath(); };
const cup = () => bakeOnce('steve-cup', g => {
  g.globalAlpha = 0.9; banded(g, cupPath, 0, 0, 120, 90, CUP, [0, 1, 1, 2, 3], 'x'); g.globalAlpha = 1;
  g.beginPath(); cupPath(g); g.strokeStyle = CUP[4]; g.lineWidth = 3; g.stroke();
  g.fillStyle = CUP[0]; g.fillRect(20, 12, 4, 40);
  for (let i = 0; i < 6; i++) { g.fillStyle = CUP[4]; g.beginPath(); g.arc(36 + (i % 3) * 24, 30 + Math.floor(i / 3) * 18, 3, 0, TAU); g.fill(); }
  // (old tape: two gray strips, the edges curling)
  g.fillStyle = '#9CA3AF'; g.save(); g.translate(78, 58); g.rotate(-0.5); g.fillRect(-18, -6, 36, 12); g.fillStyle = '#6B7280'; g.fillRect(-18, -6, 36, 2); g.restore();
  g.font = '6px "Press Start 2P"'; g.fillStyle = '#B91C1C'; g.fillText('SAFETY', 34, 70); g.fillText('FIRST', 38, 78);
}, 120, 90);
const cupCracked = () => bakeOnce('steve-cupX', g => {
  g.drawImage(cup(), 0, 0);
  g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 7; i++) { const a = rnd(i * 4 + 1) * TAU; g.moveTo(60, 74); g.lineTo(60 + Math.cos(a) * 30, 74 + Math.sin(a) * 26); g.lineTo(60 + Math.cos(a + 0.3) * 60, 74 + Math.sin(a + 0.3) * 50); }
  g.stroke();
}, 120, 90);

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'steve', scene, over, skin: SKIN, hair: HAIR, sacScale: 0.95, sacY: 156,
  word: 'CRACK!', caption: 'GREEN WITH ENVY', captionCol: BILE[1],
  bloodCols: [BLOOD[1], BILE[1], BLOOD[2], BILE[2], BLOOD[3]],
  burstCols: [BILE[1], '#F7A1BC', BLOOD[2], BILE[2]],
  pool: [BLOOD[3], BILE[2], BILE[0]],
  front: (c, t, hit, toe) => {
    // (the cup: on the hit it cracks and rides up on the toe; two frames on it goes to shards)
    const cx = CX - 60;
    if (hit < 0) { c.drawImage(cup(), cx, 112 + Math.sin(t * 0.25) * 1.5); return; }
    if (hit < 3) { c.drawImage(cupCracked(), cx, 52 + hit * 10); return; }
    const k = hit - 3, cy = 72;
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (rnd(i * 3.1 + 7) - 0.5) * 3.6, v = 5 + rnd(i * 1.3) * 8;
      const x = cx + 60 + Math.cos(a) * v * k, y = cy + 50 + Math.sin(a) * v * k + 0.4 * k * k;
      if (y > PANEL_H + 20) continue;
      c.save(); c.translate(x, y); c.rotate(k * (0.3 + rnd(i) * 0.4) * (i % 2 ? 1 : -1));
      // (each shard a bit of the cup itself, its edge dark)
      c.drawImage(cupCracked(), (i % 4) * 30, Math.floor(i / 4) * 30, 30, 30, -15, -15, 30, 30);
      c.restore();
    }
  },
  top: (c, t, hit) => {
    // (envy rising: a green tint creeping over him, after)
    if (hit > 10) { c.fillStyle = `rgba(101,163,13,${Math.min(0.16, (hit - 10) * 0.006).toFixed(3)})`; c.fillRect(0, 0, PANEL_W, PANEL_H); }
    // (and the bile frothing up out of the wound, bubbles)
    if (hit > 8) for (let i = 0; i < 8; i++) { const y = 150 - ((hit * 2 + i * 23) % 90), x = CX - 30 + rnd(i * 2) * 60; c.fillStyle = BILE[3]; c.fillRect(x - 1, y - 1, 8, 8); c.fillStyle = BILE[1]; c.fillRect(x, y, 6, 6); c.fillStyle = BILE[0]; c.fillRect(x + 1, y + 1, 2, 2); }
  },
});
