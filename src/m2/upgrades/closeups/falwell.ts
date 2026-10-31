// The cheap shot's own close-up for Falwell (Phase F; punditKit.ts the routine): the big round man in the navy
// three-piece, the gold watch chain and the cross on his lapel, the silver pompadour and the square glasses, mid-sermon
// under a stained-glass window, his Bible held up to heaven and a finger up beside it. The boot: BONG! (a church bell).
// The Bible flies straight up out of his hand and comes down on his head: BONK! a lump. The glasses jump and sit
// crooked, the eyes bulge past them; red, purple, the wheeze, then he keels over.

import type { CloseUpPaint } from '../closeUp';
import { punditCloseUp, part, partTop, flat, dith, INK, px, bands, vignette, paintLegs, paintTorso, arm, cupArms, bakeProp, stampAt, shout, type Rp, type Ctx } from './punditKit';

const SKIN: Rp = ['#FFE0CC', '#F6C3AA', '#E0A088', '#C07A62'];
const NAVY: Rp = ['#4A5874', '#26324A', '#1A2438', '#10182A'];
const RED: Rp = ['#EE7474', '#DC2626', '#AE1E1E', '#7E1818'];
const SILVER: Rp = ['#FFFFFF', '#E6E8EE', '#C4C8D2', '#9CA2B0'];
const BOOK: Rp = ['#4A4A58', '#22222C', '#16161E', '#0A0A10'];
const S = 2.0, H = 2.8;

const bible = (g: Ctx, x: number, y: number, a: number, s = 1) => {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  part(g, () => g.roundRect(-8, -10, 16, 20, 1.5), BOOK, -8, 8, 1.6);
  px(g, 6, -9, 2, 18, '#F2D06A'); px(g, 7, -9, 1, 18, '#FFF0A8');
  px(g, -1, -6, 2, 10, '#EAB308'); px(g, -4, -3, 8, 2, '#EAB308'); px(g, -1, -6, 1, 4, '#FFF0A8');
  px(g, -3, 9, 2, 5, '#DC2626');
  g.restore();
};

export const closeUp: CloseUpPaint = punditCloseUp({
  id: 'falwell', S, H, head: [0, -88], chin: 20, top: 28, hip: 32, fall: 1, skin: SKIN,
  bang: 'BONG!', bangCol: '#FDE047',
  bg: g => {
    bands(g, ['#2A1240', '#34184E', '#3E1E5C', '#48246A', '#522A76']);
    // (the stained-glass window behind him: an arch of colored panes in black leading, a gold cross in the middle)
    const arch = () => { g.moveTo(130, 270); g.lineTo(130, 110); g.quadraticCurveTo(130, 14, 260, 14); g.quadraticCurveTo(390, 14, 390, 110); g.lineTo(390, 270); g.closePath(); };
    g.save(); g.beginPath(); arch(); g.clip();
    const panes = ['#7C3AED', '#2563EB', '#DC2626', '#16A34A', '#F59E0B', '#0EA5E9'];
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) { g.fillStyle = panes[(x * 5 + y * 3) % 6]; g.fillRect(130 + x * 44, 14 + y * 44, 44, 44); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(132 + x * 44, 16 + y * 44, 14, 4); }
    g.fillStyle = dith(g, 'rgba(20,6,30,0.45)'); g.fillRect(130, 14, 260, 270);
    g.strokeStyle = INK; g.lineWidth = 4;
    for (let x = 1; x < 6; x++) { g.beginPath(); g.moveTo(130 + x * 44, 0); g.lineTo(130 + x * 44, 280); g.stroke(); }
    for (let y = 1; y < 6; y++) { g.beginPath(); g.moveTo(130, 14 + y * 44); g.lineTo(390, 14 + y * 44); g.stroke(); }
    g.restore();
    g.beginPath(); arch(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.strokeStyle = '#8A6A4A'; g.lineWidth = 4; g.stroke();
    // (organ pipes either side, dimmed)
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const x = s < 0 ? 40 + i * 20 : 400 + i * 20, h = 120 + (s < 0 ? i : 3 - i) * 24; g.fillStyle = '#7A6A4C'; g.fillRect(x, 280 - h, 14, h); g.fillStyle = '#A8946C'; g.fillRect(x, 280 - h, 4, h); g.fillStyle = INK; g.fillRect(x + 3, 290 - h, 8, 4); }
    vignette(g);
  },
  legs: (g, knock) => paintLegs(g, knock, { r: NAVY, hip: 32, hipX: 7, foot: 11, w: 10, shoeW: 14 }),
  body: (g, cup) => {
    paintTorso(g, { r: NAVY, top: 72, hip: 32, sw: 14, ww: 15, belly: 8, tie: RED, btn: '#C8A030' });
    // (the vest's points under the jacket, the gold watch chain, the gold cross on his lapel)
    flat(g, () => { g.moveTo(-8, -46); g.lineTo(9, -46); g.lineTo(6, -36); g.lineTo(-5, -36); g.closePath(); }, '#2E3A56', 1);
    g.strokeStyle = '#E8C040'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-7, -42); g.quadraticCurveTo(1, -36, 10, -42); g.stroke();
    px(g, -12, -64, 2, 6, '#FACC15'); px(g, -14, -62, 6, 2, '#FACC15'); px(g, -12, -64, 1, 2, '#FFF0A8');
    if (cup) cupArms(g, { sw: 14, top: 72, hip: 32, w: 9, r: NAVY, skin: SKIN, bone: 20 });
    else {
      // (preaching: a finger up to heaven; the Bible held up in the other)
      arm(g, -14, -66, -24, -100, 9, NAVY, SKIN, -1, 21);
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-24, -102); g.lineTo(-23, -111); g.stroke(); g.strokeStyle = SKIN[1]; g.lineWidth = 2; g.stroke(); g.lineCap = 'butt';
      arm(g, 14, -66, 24, -100, 9, NAVY, SKIN, 1, 21);
      bible(g, 25, -110, 0.12, 1.1);
    }
  },
  face: g => {
    for (const s of [-1, 1]) part(g, () => g.ellipse(s * 16, 1, 4, 6, 0, 0, Math.PI * 2), SKIN, s * 16 - 4, s * 16 + 4, 1.3);
    const head = () => { g.moveTo(-16, -6); g.quadraticCurveTo(-16, -22, 0, -22); g.quadraticCurveTo(17, -22, 16, -6); g.quadraticCurveTo(20, 16, 4, 20); g.quadraticCurveTo(-12, 21, -17, 10); g.closePath(); };
    part(g, head, SKIN, -17, 20, 1.6);
    g.save(); g.beginPath(); head(); g.clip();
    g.fillStyle = dith(g, SKIN[2]); g.fillRect(-14, 9, 30, 3);
    g.fillStyle = SKIN[2]; g.fillRect(-14, 14, 34, 8);
    g.fillStyle = '#F2A8A0'; g.globalAlpha = 0.6; g.beginPath(); g.ellipse(10, 6, 4, 2.5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.restore();
    g.strokeStyle = '#C07A62'; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, 12); g.quadraticCurveTo(2, 18, 13, 11); g.stroke();
    part(g, () => g.ellipse(9, 3, 4.5, 3.6, 0, 0, Math.PI * 2), ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], 4, 14, 1.2);
  },
  hair: g => {
    // (the silver pompadour, swept back in a swoop, combed lines, a shine)
    const hair = () => { g.moveTo(-17, -4); g.quadraticCurveTo(-20, -28, 2, -27); g.quadraticCurveTo(19, -26, 16, -12); g.quadraticCurveTo(4, -20, -8, -14); g.quadraticCurveTo(-12, -10, -17, -4); g.closePath(); };
    partTop(g, hair, SILVER, -28, -6, 1.4);
    g.strokeStyle = '#9CA2B0'; g.lineWidth = 0.8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-12 + k * 6, -22); g.quadraticCurveTo(-2 + k * 6, -26, 4 + k * 4, -18); g.stroke(); }
    px(g, -6, -25, 8, 1.5, '#FFFFFF');
  },
  eyes: [[-5, -3], [8, -3]], eyeR: 2.6, brow: '#9CA2B0', browY: -10, glasses: true,
  mouth: [4, 12],
  mouthPre: (c, t) => {
    // (preaching, wide)
    const o = [5, 7, 6, 8][(t >> 2) % 4];
    flat(c, () => c.ellipse(4, 11, 7, o / 2 + 1, 0, 0, Math.PI * 2), '#5A0E14', 1.3); px(c, -1, 9, 10, 1.6, '#FFFFFF');
  },
  overHead: (c, f) => {
    // (the lump where the Bible came down)
    if (f.hit < 28) return;
    const g = Math.min(1, (f.hit - 28) / 4);
    c.save(); c.scale(H, H);
    flat(c, () => c.ellipse(-3, -27 - g * 3, 4 * g + 0.5, 4 * g + 0.5, 0, Math.PI, 0), '#F6A0A0', 1.2);
    c.restore();
  },
  front: (c, f) => {
    if (f.hit < 0) return;
    // (the Bible: straight up out of his hand, spinning, and back down on his head; off it, away)
    const book = bakeProp('falwell-cu-bible', 80, 80, S * 1.1, g => bible(g, 0, 0, 0));
    const k = f.hit, x0 = 25 * S, y0 = -110 * S, topY = f.hy - 28 * H - 20;
    if (k <= 28) { const u = k / 28; stampAt(c, book, x0 + (f.hx - x0) * u, y0 + (topY - y0) * u - Math.sin(u * Math.PI) * 150, k * 0.45); }
    else { const u = k - 28; stampAt(c, book, f.hx - u * 9, topY - u * 7 + u * u * 0.8, -u * 0.5); }
    if (k >= 28 && k < 42) shout(c, 'BONK!', f.hx + 70, f.hy - 34 * H, 14, '#F87171', 0.15);
  },
});
