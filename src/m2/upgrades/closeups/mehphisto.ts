// The cheap shot's own close-up for MEHPHISTO (the water park's level 2; Satan's other son, the goth stoner): skinny
// black jeans gone gray at the knees, a rip at one showing the lavender skin, a studded belt and a wallet chain looping
// down to the back pocket; the long black trench coat hanging open either side, its burn holes; the band tee's hem
// over the belt. His long bony hand's black nails clawing at the air over it all. His glove tears them out (fleshKit.ts
// runFlesh: the rip), the spray a demon's dark red with soot in it. SHLORK. WHATEVER.

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, bakeOnce } from '../closeUp';
import { type Ramp, type Ctx, banded, bodyPath, paintBackdrop, paintCloth, paintWindow, paintTag, dither } from './fleshKit';
import { runFlesh } from './fleshKit';

// (his ramps: endgame/park2/sonArt.ts)
const SKIN: Ramp = ['#ECE4F0', '#CFC4D6', '#AEA0B8', '#8A7A96', '#2A1E34'];
const JEAN: Ramp = ['#4A4852', '#2E2C36', '#1E1C24', '#141218', '#040306'];
const COAT: Ramp = ['#4A4452', '#2A2630', '#1C1A22', '#121016', '#030204'];
const TEE: Ramp = ['#5A5660', '#3A3840', '#2A282E', '#1E1C22', '#08070A'];
const HAIR = '#14101C';
const BLOOD = ['#E8605A', '#A61C1C', '#6E0E0E', '#2A0606'] as const;
const TAU = Math.PI * 2;

const scene = () => bakeOnce('mehphisto-scene', g => {
  // (behind him: his grotto's purple rock in the lava lamp's light)
  paintBackdrop(g, ['#4A2A5A', '#3A2048', '#2C183A', '#20122C', '#160C20']);
  paintCloth(g, JEAN, { hem: 214, leg: SKIN });
  g.save(); g.beginPath(); bodyPath(g); g.clip();
  // (worn gray down the fronts of the thighs; a rip, the skin through it, its threads)
  dither(g, 40, 120, 120, 70, '#55525E'); dither(g, PANEL_W - 160, 120, 120, 70, '#55525E');
  g.fillStyle = SKIN[2]; g.beginPath(); g.ellipse(CX + 140, 168, 26, 12, 0.2, 0, TAU); g.fill();
  g.fillStyle = '#E5E7EB'; for (let i = 0; i < 6; i++) g.fillRect(CX + 116 + i * 9, 160 + (i % 2) * 14, 7, 1);
  g.restore();
  // (the coat hanging open either side, long, burn holes in it)
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -10 : PANEL_W - 70;
    banded(g, p => p.rect(x0, -20, 80, 340), x0, -20, 80, 340, COAT, [1, 2, 3], 'x', COAT[4], 3);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#0A0604'; g.beginPath(); g.ellipse(x0 + 40, 60 + i * 80, 6, 5, 0, 0, TAU); g.fill(); g.strokeStyle = '#6A3A1A'; g.lineWidth = 2; g.stroke(); }
  }
  paintWindow(g, { skin: SKIN, cloth: JEAN, hair: HAIR, fat: 4, veins: 'rgba(124,58,237,0.5)' });
  paintTag(g, 'MEHPHISTO');
});

// (over the top: the tee's hem, the studded belt, the chain looping down)
const over = () => bakeOnce('mehphisto-over', g => {
  banded(g, p => { p.moveTo(-20, -20); p.lineTo(PANEL_W + 20, -20); p.lineTo(PANEL_W + 20, 30); p.quadraticCurveTo(CX, 40, -20, 30); p.closePath(); }, -20, -20, PANEL_W + 40, 60, TEE, [1, 2, 3], 'y', TEE[4], 3);
  banded(g, p => p.rect(-10, 36, PANEL_W + 20, 16), -10, 36, PANEL_W + 20, 16, ['#2A2830', '#1A1820', '#121016', '#0A080C', '#000000'], [0, 1, 2], 'y', '#000000', 2);
  for (let x = 14; x < PANEL_W; x += 26) { g.fillStyle = '#E5E7EB'; g.fillRect(x, 40, 6, 6); g.fillStyle = '#6B7280'; g.fillRect(x + 3, 43, 3, 3); }
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 3; g.setLineDash([5, 3]); g.beginPath(); g.moveTo(CX + 120, 50); g.quadraticCurveTo(CX + 180, 130, PANEL_W - 30, 60); g.stroke(); g.setLineDash([]);
});

/** His bony hand, black-nailed, clawing at the air over it (at the glove, after). */
const hand = (c: Ctx, t: number, rip: number) => {
  const panic = rip >= 0 ? 3 : 1, x = CX + 170 + Math.sin(t * 0.35 * panic) * 12, y = 10 + Math.cos(t * 0.45 * panic) * 8;
  c.strokeStyle = COAT[4]; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(PANEL_W + 20, -30); c.lineTo(x + 12, y - 12); c.stroke();
  c.strokeStyle = COAT[1]; c.lineWidth = 12; c.stroke();
  for (let i = -2; i <= 1; i++) {
    const a = Math.PI * 0.75 + i * 0.32 + Math.sin(t * 0.6 * panic + i) * 0.25;
    c.strokeStyle = SKIN[4]; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); c.stroke();
    c.strokeStyle = SKIN[1]; c.lineWidth = 4; c.stroke();
    c.fillStyle = '#0A0610'; c.fillRect(Math.round(x + Math.cos(a) * 22) - 2, Math.round(y + Math.sin(a) * 22) - 2, 4, 4);
  }
  c.lineCap = 'butt';
};

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'mehphisto', scene, over, skin: SKIN, hair: HAIR,
  word: 'SHLORK!', caption: 'WHATEVER', captionCol: '#D8B4FE',
  bloodCols: [BLOOD[0], BLOOD[1], BLOOD[2], BLOOD[3]],
  burstCols: [BLOOD[0], BLOOD[1], BLOOD[2], '#1A0A0A'],
  pool: [BLOOD[3], BLOOD[2], BLOOD[1]],
  top: (c, t, rip) => hand(c, t, rip),
});
