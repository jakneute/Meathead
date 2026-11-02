// The cheap shot's own close-up for Safari Artie (Phase F; pride): his baggy khaki cargo shorts and sunburned knees
// round the lens, the belt and the big gold "#1 SKIPPER" buckle he bought himself, and inside, the vanity: a rolled-up
// tube sock (his own red-and-green-striped) stuffed down the front of tiny little balls. His glove clamps on the lot
// and wrenches it out (fleshKit.ts runFlesh: the rip): the sock blows out first, the bone cracks, the buckle splits in
// two, and the tiny real ones come out held up in his fist: HUMBLED!

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, PANEL_H, bakeOnce, clamp } from '../closeUp';
import { type Ramp, type Ctx, banded, paintBackdrop, paintCloth, paintWindow, paintTag, dither, hairs, runFlesh } from './fleshKit';

// (Artie's ramps: adventure/river/artie.ts)
const SKIN: Ramp = ['#FCE2C8', '#F0C29C', '#D89C76', '#B47454', '#6E3C26'];
const BURNT: Ramp = ['#F8C4A4', '#EAA080', '#D47A60', '#B05A46', '#6E3022'];
const KHAKI: Ramp = ['#E4D49E', '#CAB47C', '#A99058', '#80693E', '#4A3C20'];
const SHORTS: Ramp = ['#B4A06A', '#968252', '#78663C', '#5A4A2C', '#33291A'];
const LEATHER: Ramp = ['#9A6438', '#784C2A', '#5A381E', '#402614', '#22140A'];
const GOLD: Ramp = ['#FEF9C3', '#FACC15', '#CA8A04', '#A16207', '#5A3A06'];
const SOCK: Ramp = ['#FFFFFF', '#F2F0E6', '#D2CFBE', '#ABA896', '#5E5C50'];
const HAIR = '#4A341E';

const scene = () => bakeOnce('artie-scene', g => {
  paintBackdrop(g, ['#2E6B34', '#1F5228', '#173F22', '#0F2E18', '#08200F']);
  // (jungle leaves behind his legs)
  for (let i = 0; i < 14; i++) {
    const x = (i * 97) % PANEL_W, y = 150 + (i * 53) % 130;
    g.fillStyle = i % 2 ? '#14532D' : '#166534'; g.beginPath(); g.ellipse(x, y, 30, 10, (i % 5) * 0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#22C55E'; g.fillRect(x - 10, y - 2, 18, 1);
  }
  paintCloth(g, SHORTS, { hem: 236, leg: BURNT, legHair: HAIR });
  // (the cargo pockets on the outer thighs: a flap each, a button, bulging with junk)
  for (const s of [-1, 1]) {
    const x = s < 0 ? 18 : PANEL_W - 108;
    banded(g, p => p.roundRect(x, 116, 90, 96, 6), x, 116, 90, 96, SHORTS, [1, 1, 2, 3], 'y', SHORTS[4], 3);
    banded(g, p => p.roundRect(x - 4, 108, 98, 26, 4), x - 4, 108, 98, 26, SHORTS, [0, 1, 2], 'y', SHORTS[4], 3);
    g.fillStyle = '#F5F0DC'; g.fillRect(x + 41, 124, 8, 6);
    g.fillStyle = SHORTS[3]; g.fillRect(x + 10, 150, 60, 3); g.fillRect(x + 20, 176, 50, 3);
  }
  // (the knobby sunburned knees, peeling)
  for (const s of [-1, 1]) { const x = CX + s * 150; g.fillStyle = BURNT[3]; g.beginPath(); g.arc(x, 268, 22, Math.PI, 0); g.fill(); g.fillStyle = BURNT[1]; g.beginPath(); g.arc(x - 3, 270, 16, Math.PI, 0); g.fill(); g.fillStyle = '#FFF4E8'; g.fillRect(x - 8, 258, 6, 3); g.fillRect(x + 4, 262, 4, 2); }
  paintWindow(g, { skin: SKIN, cloth: SHORTS, hair: HAIR });
  paintTag(g, 'SAFARI ARTIE');
});

// (the shirt bloused over the belt, the belt, the canteen; the buckle's drawn live, it splits)
const over = () => bakeOnce('artie-over', g => {
  const shirt = (p: Ctx) => { p.moveTo(-10, -10); p.lineTo(PANEL_W + 10, -10); p.lineTo(PANEL_W + 10, 18); p.quadraticCurveTo(CX, 30, -10, 18); p.closePath(); };
  banded(g, shirt, -10, -10, PANEL_W + 20, 40, KHAKI, [1, 2, 3], 'y', KHAKI[4], 3);
  dither(g, CX - 120, 0, 240, 16, KHAKI[3]);
  banded(g, p => p.rect(-10, 18, PANEL_W + 20, 16), -10, 18, PANEL_W + 20, 16, LEATHER, [0, 1, 2, 3], 'y', LEATHER[4], 2);
  for (let x = 6; x < PANEL_W; x += 22) { g.fillStyle = LEATHER[4]; g.fillRect(x, 24, 8, 2); }
  // (the canteen on the left, the radio on the right)
  banded(g, p => p.ellipse(70, 46, 26, 22, 0, 0, Math.PI * 2), 44, 24, 52, 44, ['#8A9A5B', '#6B7A44', '#525E32', '#3C4524', '#1F2512'], [0, 1, 2, 3], 'y', '#1F2512', 3);
  banded(g, p => p.roundRect(PANEL_W - 96, 26, 34, 46, 3), PANEL_W - 96, 26, 34, 46, ['#52525B', '#3F3F46', '#2A2A30', '#1C1C21', '#09090B'], [0, 1, 2], 'x', '#09090B', 2);
  g.fillStyle = '#09090B'; g.fillRect(PANEL_W - 70, 0, 4, 26);
  g.fillStyle = '#22C55E'; g.fillRect(PANEL_W - 90, 32, 4, 3);
  hairs(g, CX - 60, 30, 120, 8, 16, HAIR, 61);
});

const buckle = (g: Ctx, half: -1 | 0 | 1) => {
  // (the gold buckle, bigger than his belt: "#1 SKIPPER", a star, polished; half = which half, after it splits)
  g.save();
  if (half) { g.beginPath(); g.rect(half < 0 ? 0 : 50, 0, 50, 40); g.clip(); }
  banded(g, p => p.roundRect(4, 4, 92, 32, 6), 4, 4, 92, 32, GOLD, [0, 1, 2, 3], 'y', GOLD[4], 3);
  g.fillStyle = GOLD[4]; g.font = '8px "Press Start 2P"'; g.fillText('#1', 12, 20); g.fillText('SKIPPER', 22, 32);
  g.fillStyle = GOLD[0]; g.fillRect(8, 7, 30, 2);
  g.fillStyle = GOLD[0];
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9; g.lineTo(76 + Math.cos(a) * r, 16 + Math.sin(a) * r); } g.fill();
  g.restore();
};
const buckleL = () => bakeOnce('artie-buckleL', g => buckle(g, -1), 100, 40);
const buckleR = () => bakeOnce('artie-buckleR', g => buckle(g, 1), 100, 40);
const buckleW = () => bakeOnce('artie-buckle', g => buckle(g, 0), 100, 40);

// (the stuffed tube sock, rolled: white, the red and green stripes, a bit gray at the toe)
const sock = () => bakeOnce('artie-sock', g => {
  banded(g, p => p.roundRect(4, 6, 72, 28, 13), 4, 6, 72, 28, SOCK, [0, 1, 2, 3], 'y', SOCK[4], 2);
  g.fillStyle = '#DC2626'; g.fillRect(14, 8, 4, 24); g.fillStyle = '#15803D'; g.fillRect(22, 8, 4, 24);
  g.fillStyle = SOCK[3]; g.fillRect(50, 10, 2, 20); g.fillRect(60, 9, 2, 22);
  dither(g, 56, 10, 16, 20, '#A8A29E');
}, 80, 40);

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'artie', scene, over, skin: SKIN, hair: HAIR, sacScale: 0.6, sacY: 152,
  word: 'HUMBLED!', caption: 'PRIDE: SHATTERED',
  front: (c, t, hit) => {
    // (the sock: in front of the tiny ones, then blown out the top, tumbling, soaked)
    const sk = sock();
    if (hit < 0) { c.drawImage(sk, CX - 40, 112 + Math.sin(t * 0.25) * 1.5); return; }
    const k = hit;
    if (k > 40) return;
    c.save(); c.translate(CX + k * 9, 130 - k * 12 + 0.45 * k * k); c.rotate(k * 0.5);
    c.drawImage(sk, -40, -20);
    if (k > 3) { c.globalAlpha = clamp((k - 3) / 6) * 0.7; c.fillStyle = '#991B1B'; c.fillRect(-36, -12, 50, 22); c.globalAlpha = 1; }
    c.restore();
  },
  overBoot: (c, t, hit) => {
    // (the buckle: whole, then split down the middle, the halves sagging apart, a chip of gold dropping)
    if (hit < 2) { c.drawImage(buckleW(), CX - 50, 8); return; }
    const k = Math.min(10, hit - 2);
    c.drawImage(buckleL(), CX - 50 - k * 0.6, 8 + k * 0.4);
    c.drawImage(buckleR(), CX - 50 + k * 0.6, 8 + k * 0.8);
    c.fillStyle = '#000'; c.fillRect(CX - 1, 10, 2, 28);
    const cy = 30 + (hit - 2) * 4 + 0.3 * (hit - 2) ** 2;
    if (cy < PANEL_H) { c.fillStyle = GOLD[4]; c.fillRect(CX - 3, cy - 1, 8, 7); c.fillStyle = GOLD[1]; c.fillRect(CX - 2, cy, 6, 5); }
  },
  top: (c, t, hit) => {
    // (the anticipation: a glint off the buckle, him none the wiser)
    if (hit < 0 && t > 6 && t % 8 < 3) { c.fillStyle = '#FFFFFF'; c.fillRect(CX - 40 + (t % 16) * 4, 13, 3, 3); c.fillRect(CX - 41 + (t % 16) * 4, 14, 5, 1); }
  },
});
