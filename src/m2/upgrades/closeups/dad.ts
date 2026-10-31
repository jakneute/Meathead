// The cheap shot's own close-up for Dad Guy (Phase F; sloth): sat on his orange couch, striped boxers with the fly
// gaping, liver-spotted varicose old legs, a hairy gut hanging out under the stained tank top, cheese-puff crumbs on it
// and a can of SWILL LITE parked on top. Through the lens the gut's a stomach full of sloshing beer. The boot lands and
// squashes him flat and... nothing. Too lazy to react. The cracks creep, the dots tick by, and a second and a half later
// it finally gets through to him: the burst, the shake, the beer going over, crumbs flying. "...OW."

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, PANEL_H, bakeOnce, rnd, clamp } from '../closeUp';
import { type Ramp, type Ctx, banded, paintBackdrop, paintCloth, paintWindow, paintTag, dither, hairs, vein, bodyPath, runFlesh, WX, WY, WRX, WRY, BLOOD } from './fleshKit';

// (Dad Guy's ramps: cartoon/amphi/dad.ts)
const SKIN: Ramp = ['#FCE0CF', '#EFBFA6', '#D59B82', '#B27461', '#5E3026'];
const TANK: Ramp = ['#FFFFFF', '#EEEBE2', '#D2CDBF', '#ABA596', '#5A564C'];
const BOXER: Ramp = ['#EAF2FC', '#C7DCF3', '#9CBAE0', '#7393BE', '#2C3E66'];
const CAN: Ramp = ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'];
const COUCH: Ramp = ['#F7A15A', '#E0752E', '#B9561A', '#8E3F12', '#3E1606'];
const STRIPE = '#3B6FB6', STAIN = '#DCC67C', SPOT = '#C99474', VEIN = '#8A92C4';
const BEER: Ramp = ['#FFFBEB', '#FDE68A', '#F5C542', '#C98A12', '#6B4306'];
const PUFF = '#F97316';
const HAIR = '#C4C4C4'; // (gone white)
const TAU = Math.PI * 2;
/** How long before it gets through to him. */
const LAG = 34;

const scene = () => bakeOnce('dad-scene', g => {
  // (the couch under him: the cushions, their seams, a stain)
  paintBackdrop(g, [COUCH[0], COUCH[1], COUCH[1], COUCH[2], COUCH[3]]);
  g.fillStyle = COUCH[4]; g.fillRect(0, 150, PANEL_W, 3); g.fillRect(CX - 2, 150, 4, PANEL_H);
  g.fillStyle = COUCH[0]; g.fillRect(0, 153, PANEL_W, 2);
  g.fillStyle = 'rgba(62,22,6,0.5)'; g.beginPath(); g.ellipse(CX + 70, 230, 50, 20, 0, 0, TAU); g.fill();
  g.fillStyle = PUFF; for (let i = 0; i < 12; i++) g.fillRect((i * 67) % PANEL_W, 170 + (i * 29) % 100, 6, 4);
  paintCloth(g, BOXER, { hem: 196, leg: SKIN, legHair: HAIR });
  // (the boxers' stripes, the fly gaping, a button hanging by a thread)
  g.save(); g.beginPath(); bodyPath(g); g.clip(); g.beginPath(); g.rect(0, 0, PANEL_W, 186); g.clip();
  g.fillStyle = STRIPE; for (let x = 10; x < PANEL_W; x += 30) g.fillRect(x, 0, 5, 186);
  g.fillStyle = BOXER[4]; for (let x = 15; x < PANEL_W; x += 30) g.fillRect(x, 0, 1, 186);
  g.fillStyle = STAIN; dither(g, CX - 40, 120, 70, 40, STAIN);
  g.restore();
  // (the old legs: liver spots, varicose veins)
  for (let i = 0; i < 14; i++) { g.fillStyle = SPOT; g.beginPath(); g.ellipse(20 + rnd(i * 3) * (PANEL_W - 40), 210 + rnd(i * 7) * 60, 4 + (i % 3) * 2, 3 + (i % 2) * 2, 0, 0, TAU); g.fill(); }
  for (let i = 0; i < 4; i++) vein(g, i < 2 ? 50 + i * 60 : PANEL_W - 70 - (i - 2) * 60, 278, 70, -Math.PI / 2 + (i % 2 ? 0.3 : -0.3), VEIN, 3, i * 19);
  paintWindow(g, { skin: SKIN, cloth: BOXER, hair: HAIR, fat: 16 });
  paintTag(g, 'DAD GUY');
});

const gutPath = (p: Ctx) => { p.ellipse(CX - 10, -24, 268, 116, 0, 0, TAU); };
/** The gut: the tank top riding up over it, the hairy skin hanging out, the button; inside the lens, the stomach. */
const gut = () => bakeOnce('dad-gut', g => {
  banded(g, gutPath, -280, -140, PANEL_W + 560, 232, SKIN, [0, 1, 1, 2, 3], 'y', SKIN[4], 4);
  g.save(); g.beginPath(); gutPath(g); g.clip();
  hairs(g, 20, 10, PANEL_W - 40, 76, 120, HAIR, 7, 1.3);
  for (let i = 0; i < 10; i++) { g.fillStyle = SPOT; g.beginPath(); g.ellipse(40 + rnd(i * 5 + 3) * 440, 10 + rnd(i * 9) * 60, 5, 3, 0, 0, TAU); g.fill(); }
  // (the belly button, deep, lint in it)
  g.fillStyle = SKIN[4]; g.beginPath(); g.ellipse(CX + 10, 56, 9, 12, 0, 0, TAU); g.fill(); g.fillStyle = '#9CA3AF'; g.fillRect(CX + 7, 58, 5, 3);
  // (the tank top, riding up, stained)
  banded(g, p => { p.moveTo(-20, -20); p.lineTo(PANEL_W + 20, -20); p.lineTo(PANEL_W + 20, 14); p.quadraticCurveTo(CX, 36, -20, 14); p.closePath(); }, -20, -20, PANEL_W + 40, 60, TANK, [1, 2, 3], 'y', TANK[4], 3);
  g.fillStyle = STAIN; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(60 + i * 80, 6 + (i % 2) * 6, 12, 6, 0, 0, TAU); g.fill(); }
  g.restore();
  // (the lens: the gut X-rayed: wipe it, the fat ring, the stomach's outline)
  g.save(); g.beginPath(); g.ellipse(WX, WY, WRX - 1, WRY - 1, 0, 0, TAU); g.clip();
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(0, 0, PANEL_W, PANEL_H); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 0.55; g.fillStyle = '#FDE68A'; g.beginPath(); gutPath(g); g.fill();
  g.globalAlpha = 0.5; g.fillStyle = SKIN[3]; g.beginPath(); g.ellipse(CX - 10, -24, 240, 96, 0, 0, TAU); g.fill();
  g.globalAlpha = 1;
  g.strokeStyle = '#7DD3FC'; g.lineWidth = 2; g.beginPath(); g.ellipse(CX - 10, -24, 266, 114, 0, 0.1, Math.PI - 0.1); g.stroke();
  g.strokeStyle = '#F9A8D4'; g.lineWidth = 3; g.beginPath(); g.ellipse(CX + 40, 30, 70, 38, 0, 0, TAU); g.stroke();
  g.restore();
  paintTag(g, 'DAD GUY');
});

const can = () => bakeOnce('dad-can', g => {
  banded(g, p => p.roundRect(4, 6, 30, 50, 4), 4, 6, 30, 50, CAN, [0, 1, 1, 2, 3], 'x', CAN[4], 2);
  g.fillStyle = '#E5E7EB'; g.fillRect(4, 4, 30, 6); g.fillStyle = '#9CA3AF'; g.fillRect(4, 8, 30, 2);
  g.font = '6px "Press Start 2P"'; g.fillStyle = '#FFFFFF'; g.fillText('SWILL', 5, 30); g.fillText('LITE', 8, 40);
}, 40, 60);

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'dad', scene, skin: SKIN, hair: HAIR, sacScale: 1.15, sacY: 160,
  burstAt: LAG, shakeAt: LAG, shakeAmp: 16, word: '...OW.', wordAt: LAG + 2,
  caption: 'DELAYED REACTION', captionAt: LAG + 18,
  bloodCols: [BLOOD[1], BLOOD[2], BEER[1], BLOOD[3]],
  pool: [BLOOD[3], BLOOD[2], BEER[0]],
  overBoot: (c, t, hit) => {
    // (the stomach's beer, sloshing (slow: a lazy belly), then the gut over it all, sagging)
    const late = hit - LAG;
    const slosh = late >= 0 ? Math.sin(late * 0.4) * 14 * Math.max(0, 1 - late / 40) : Math.sin(t * 0.08) * 3;
    c.save(); c.beginPath(); c.ellipse(CX + 40, 30, 68, 36, 0, 0, TAU); c.clip();
    c.fillStyle = BEER[2]; c.beginPath(); c.moveTo(CX - 30, 30 - slosh); c.lineTo(CX + 110, 30 + slosh); c.lineTo(CX + 110, 70); c.lineTo(CX - 30, 70); c.fill();
    c.fillStyle = BEER[0]; c.beginPath(); c.moveTo(CX - 30, 30 - slosh); c.lineTo(CX + 110, 30 + slosh); c.lineTo(CX + 110, 36 + slosh); c.lineTo(CX - 30, 36 - slosh); c.fill();
    c.fillStyle = BEER[3]; for (let i = 0; i < 5; i++) { const by = 64 - ((t * 1.5 + i * 13) % 30); c.fillRect(CX + i * 20, by, 3, 3); }
    c.restore();
    const sag = late >= 0 ? Math.sin(late * 0.5) * 6 * Math.max(0, 1 - late / 30) : 0;
    c.drawImage(gut(), 0, sag);
    // (the can on the gut: tipping over when it gets through to him, foam pouring)
    const ck = cn(late), cx = 70, cy = -6 + sag;
    c.save(); c.translate(cx + 20, cy + 56); c.rotate(-ck * 1.6); c.drawImage(can(), -20, -56); c.restore();
    if (late > 3 && late < 50) { const n = Math.min(10, late - 3); for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? BEER[0] : BEER[1]; c.fillRect(cx + 46 + Math.sin(i + late * 0.3) * 3, cy + 46 + i * 9, 8, 9); } }
    // (cheese-puff crumbs on the gut: bounced off on the late reaction)
    for (let i = 0; i < 9; i++) {
      const bx = 120 + i * 34, by = 50 + (i % 3) * 8 + sag;
      const k = late, y = k < 0 ? by : by - k * (3 + (i % 3)) + 0.35 * k * k, x = k < 0 ? bx : bx + (i % 2 ? 1 : -1) * k * 2;
      if (y < PANEL_H) { c.fillStyle = '#9A3412'; c.fillRect(x - 1, y - 1, 8, 6); c.fillStyle = PUFF; c.fillRect(x, y, 6, 4); }
    }
  },
  top: (c, t, hit) => {
    // (the wait: dots ticking by over his gut, a fly buzzing, while it travels up the nerves)
    if (hit >= 2 && hit < LAG) {
      const n = Math.min(3, 1 + Math.floor((hit - 2) / 8));
      c.font = '20px "Press Start 2P"'; c.fillStyle = '#000'; c.fillText('.'.repeat(n), CX + 92, 74); c.fillStyle = '#FFFFFF'; c.fillText('.'.repeat(n), CX + 90, 72);
    }
    const fx = CX - 120 + Math.sin(t * 0.21) * 60, fy = 150 + Math.sin(t * 0.37) * 30;
    c.fillStyle = '#111'; c.fillRect(fx, fy, 4, 3); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(fx - 2, fy - 3 + (t % 2) * 2, 3, 2); c.fillRect(fx + 3, fy - 3 + (t % 2) * 2, 3, 2);
  },
});
/** The can's tip: 0 upright .. 1 over. */
const cn = (late: number) => clamp(late / 8);
