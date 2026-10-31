// The cheap shot's own close-up for Perot (Phase F; punditKit.ts the routine): the little wiry man in the gray
// double-breasted suit, his pie chart held up over his head and his pointer out, mid-pitch, that grin full of teeth.
// The boot: DING! The chart flies off spinning, the pointer drops, and his huge jug ears flap like he's trying to take
// off (FLAP FLAP), red, purple, the wheeze, then he keels over.

import type { CloseUpPaint } from '../closeUp';
import { bakeOnce } from '../closeUp';
import { pieChart } from '../../cartoon/whitehouse1/punditArt';
import { punditCloseUp, part, flat, rp, mix, dith, INK, px, bands, vignette, paintLegs, paintTorso, arm, cupArms, tints3, drawTints, bakeProp, stampAt, shout, type Rp, type Ctx } from './punditKit';

const SKIN: Rp = ['#FFE4CE', '#F6C9A8', '#DFA484', '#BC7C60'];
const EAR: Rp = ['#FFD2C0', '#F5B7A0', '#E08E7A', '#BA6450'];
const GRAY: Rp = rp('#9CA3AF');
const BLUE: Rp = rp('#2F6BE6');
const S = 2.1, H = 3.0;

const ear = (g: Ctx) => {
  // (one jug ear, its root at the origin, out to the right: veined, a lit rim)
  part(g, () => g.ellipse(9, 0, 12, 16, 0, 0, Math.PI * 2), EAR, -3, 21, 1.5);
  part(g, () => g.ellipse(9, 1, 6, 10, 0, 0, Math.PI * 2), [EAR[2], EAR[2], EAR[3], mix(EAR[3], INK, 0.3)], 3, 15, 1);
  g.strokeStyle = '#D0707A'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(13, -8); g.quadraticCurveTo(16, 0, 14, 8); g.moveTo(15, -4); g.lineTo(18, -6); g.stroke();
  px(g, 4, -12, 3, 2, EAR[0]);
};

export const closeUp: CloseUpPaint = punditCloseUp({
  id: 'perot', S, H, head: [0, -80], chin: 18, top: 21, hip: 30, fall: -1, skin: SKIN,
  bang: 'DING!', bangCol: '#FACC15',
  bg: g => {
    bands(g, ['#14205A', '#1A2A72', '#22388C', '#2A46A4', '#3454B8']);
    // (his flip chart on its easel: a bar graph going down, a red arrow off the bottom of it)
    g.fillStyle = '#4A2E14'; g.fillRect(70, 60, 6, 220); g.fillRect(170, 60, 6, 220);
    flat(g, () => g.rect(52, 30, 142, 150), '#F1F0E8', 3);
    g.fillStyle = '#D8D6CA'; g.fillRect(52, 150, 142, 30);
    g.fillStyle = dith(g, '#D8D6CA'); g.fillRect(52, 142, 142, 8);
    for (let i = 0; i < 5; i++) { const h = 100 - i * 18; flat(g, () => g.rect(66 + i * 24, 166 - h, 16, h), ['#3B82F6', '#22C55E', '#FACC15', '#F97316', '#EF4444'][i], 2); }
    g.strokeStyle = '#DC2626'; g.lineWidth = 5; g.beginPath(); g.moveTo(66, 60); g.lineTo(186, 150); g.stroke();
    flat(g, () => { g.moveTo(192, 160); g.lineTo(176, 154); g.lineTo(188, 140); g.closePath(); }, '#DC2626', 2);
    g.font = '14px "Press Start 2P"'; g.fillStyle = INK; g.fillText('$$$', 92, 52);
    // (studio lights, a dithered glow)
    for (const x of [320, 430]) { g.fillStyle = dith(g, 'rgba(255,255,220,0.25)'); g.beginPath(); g.ellipse(x, 30, 50, 24, 0, 0, Math.PI * 2); g.fill(); flat(g, () => g.rect(x - 12, 0, 24, 14), '#1F2937', 2); }
    vignette(g);
  },
  legs: (g, knock) => paintLegs(g, knock, { r: GRAY, hip: 30, hipX: 5, foot: 9, w: 6.5, shoeW: 11 }),
  body: (g, cup) => {
    if (!cup) {
      // (the pointer arm, out to his side, the stick up)
      arm(g, -12, -54, -30, -58, 6, [GRAY[1], GRAY[2], GRAY[3], mix(GRAY[3], INK, 0.3)], SKIN, -1, 11);
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-30, -58); g.lineTo(-40, -86); g.stroke(); g.strokeStyle = '#D6A86A'; g.lineWidth = 1.6; g.stroke(); g.lineCap = 'butt';
      flat(g, () => g.arc(-40.5, -87, 1.8, 0, Math.PI * 2), '#1A1A22', 1);
    }
    paintTorso(g, { r: GRAY, top: 59, hip: 30, sw: 12, ww: 10, belly: 1, tie: BLUE, db: true });
    px(g, -2, -50, 6, 1.5, '#E8C860');
    flat(g, () => { g.moveTo(-10, -50); g.lineTo(-6, -53); g.lineTo(-5, -49); g.closePath(); }, '#FFFFFF', 0.8);
    if (cup) cupArms(g, { sw: 12, top: 59, hip: 30, w: 6, r: GRAY, skin: SKIN, bone: 15 });
    else {
      // (the pie chart up over his head: the tell)
      arm(g, 12, -54, 14, -92, 6, GRAY, SKIN, 1, 21);
      pieChart(g, 12, -106, 14, 0.3);
    }
  },
  face: g => {
    // (the head: big, square jawed, stepped across; the jaw's shadow; the big pink-tipped nose)
    part(g, () => g.roundRect(-17, -20, 34, 38, [14, 14, 12, 12]), SKIN, -17, 17, 1.6);
    g.fillStyle = dith(g, SKIN[2]); g.fillRect(-12, 12, 26, 4);
    part(g, () => g.ellipse(12, 3, 5.5, 4.4, 0.2, 0, Math.PI * 2), ['#FFD2C0', '#F2B08E', '#E08A72', '#C06A58'], 6, 18, 1.3);
    px(g, 10, 1, 2, 1, '#FFFFFF');
    g.strokeStyle = SKIN[3]; g.lineWidth = 0.9; g.beginPath(); g.arc(-11, 10, 2, -0.5, 1.4); g.moveTo(15, 9); g.arc(13, 10, 2, 1.7, 3.6); g.stroke();
  },
  hair: g => {
    // (the buzz cut gone thin on top: stubble sides in steps, a few stragglers over the shine)
    for (const [x0, w] of [[-15, 5], [10, 5]] as [number, number][]) { px(g, x0, -18, w, 13, '#8A909E'); px(g, x0 + (x0 < 0 ? 0 : w - 2), -18, 2, 13, '#6A707E'); g.fillStyle = dith(g, '#B8BEC8'); g.fillRect(x0, -18, w, 13); }
    for (let k = 0; k < 6; k++) px(g, -9 + k * 3.5, -19, 1.4, 3, '#8A909E');
    px(g, -8, -17, 10, 2, '#FFF2E4'); px(g, -6, -15, 4, 1, '#FFFFFF');
  },
  eyes: [[-6, -3], [7, -3]], eyeR: 3.4, brow: '#6B7280', browY: -10,
  mouth: [1, 12],
  mouthPre: (c) => {
    // (the grin full of teeth, the dimples)
    flat(c, () => c.roundRect(-9, 8, 20, 7, 3.5), '#5A0E14', 1.3);
    px(c, -7, 9, 16, 3, '#FFFFFF'); c.fillStyle = INK; for (let k = -4; k <= 6; k += 3.4) c.fillRect(k, 9, 0.5, 3);
    px(c, -6, 13, 14, 1.4, '#C8344A');
  },
  behindHead: (c, f) => {
    // (the ears: flapping like wings after it, then drooped)
    const t3 = tints3('perot-cu-earT', bakeOnce('perot-cu-ear', g => { g.translate(20, 60); g.scale(H, H); ear(g); }, 100, 120));
    const flap = f.hit < 0 ? 0 : f.hit < 40 ? Math.sin(f.hit * 1.3) * 0.65 * (1 - f.hit / 60) : 0.55;
    for (const s of [-1, 1]) {
      c.save(); c.translate(s * 16 * H, 2 * H); c.scale(s, 1); c.rotate(0.15 + flap);
      drawTints(c, t3, -20, -60, f.kr, f.kp);
      c.restore();
    }
  },
  overHead: (c, f) => {
    if (f.hit >= 6 && f.hit < 36 && (f.hit >> 2) % 2 === 0) { shout(c, 'FLAP', -30 * H, -14 * H, 10, '#FBCFE8', -0.2); shout(c, 'FLAP', 30 * H, -12 * H, 10, '#FBCFE8', 0.2); }
  },
  front: (c, f) => {
    if (f.hit < 0) return;
    // (the chart flies off spinning; the pointer drops, end over end)
    const chart = bakeProp('perot-cu-chart', 80, 80, S, g => pieChart(g, 0, 0, 14, 0.3));
    const k = f.hit;
    stampAt(c, chart, 12 * S + k * 7, -106 * S - k * 9 + k * k * 0.45, k * 0.35);
    const stick = bakeProp('perot-cu-stick', 90, 20, S, g => { g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 3.4; g.beginPath(); g.moveTo(-14, 0); g.lineTo(14, 0); g.stroke(); g.strokeStyle = '#D6A86A'; g.lineWidth = 1.6; g.stroke(); flat(g, () => g.arc(15, 0, 1.8, 0, Math.PI * 2), '#1A1A22', 1); });
    if (k < 30) stampAt(c, stick, -35 * S - k * 2, -72 * S + k * k * 0.9, -1.2 + k * 0.4);
  },
});
