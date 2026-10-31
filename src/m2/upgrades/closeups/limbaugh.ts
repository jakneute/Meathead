// The cheap shot's own close-up for Limbaugh (Phase F; punditKit.ts the routine): the big round man in the navy
// double-breasted suit straining at its buttons, the loud paisley tie, the studio headphones round his neck, the
// slicked-back hair, the cigar clamped in his teeth and the golden EIB mic in his fist, in his studio under the ON AIR
// light. The boot: BOING! The mic drops, the cigar droops and falls out of his mouth end over end, steam blows out of
// his ears, red, purple, the wheeze, then he keels over.

import type { CloseUpPaint } from '../closeUp';
import { cigar, goldMic } from '../../cartoon/whitehouse2/punditArt';
import { punditCloseUp, part, partTop, flat, rp, dith, INK, px, bands, vignette, paintLegs, paintTorso, arm, cupArms, bakeProp, stampAt, GOLD, type Rp, type Ctx } from './punditKit';

const SKIN: Rp = ['#FFE0CC', '#F6C3AA', '#E0A088', '#C07A62'];
const NAVY: Rp = ['#4A5874', '#26324A', '#1A2438', '#10182A'];
const HAIR: Rp = ['#7C5A44', '#3F2A1E', '#2A1A12', '#1A100A'];
const TIE: Rp = rp('#F59E0B');
const S = 2.0, H = 2.8;

const headphones = (g: Ctx) => {
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, -80, 13, 0.2, Math.PI - 0.2); g.stroke();
  g.strokeStyle = '#5A5866'; g.lineWidth = 2; g.stroke();
  for (const sx of [-17, 9]) part(g, () => g.roundRect(sx, -78, 8, 10, 2.5), ['#5A5866', '#2A2830', '#1A1820', '#0C0B10'], sx, sx + 8, 1.2);
};
const cigarProp = () => bakeProp('limbaugh-cu-cigar', 90, 50, H, g => cigar(g, 0, 0, 0));

export const closeUp: CloseUpPaint = punditCloseUp({
  id: 'limbaugh', S, H, head: [0, -94], chin: 23, top: 27, hip: 32, fall: -1, skin: SKIN,
  bang: 'BOING!', bangCol: '#FB923C',
  bg: g => {
    bands(g, ['#3A0C14', '#4A1018', '#5A141C', '#681A22', '#76202A']);
    // (the studio's foam on the walls, dimmed; the ON AIR light lit; the EIB banner)
    for (let y = 0; y < 280; y += 28) for (let x = (y / 28) % 2 * 14; x < 520; x += 28) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x, y, 14, 14); }
    flat(g, () => g.roundRect(34, 22, 132, 40, 6), '#DC2626', 4);
    g.fillStyle = '#F87171'; g.fillRect(40, 26, 120, 6);
    g.fillStyle = dith(g, 'rgba(255,120,120,0.35)'); g.fillRect(22, 10, 156, 64);
    g.font = '16px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('ON AIR', 102, 52); g.fillStyle = '#FFFFFF'; g.fillText('ON AIR', 100, 50);
    flat(g, () => g.rect(370, 30, 110, 46), '#1D4ED8', 4);
    g.font = '20px "Press Start 2P"'; g.fillStyle = '#7A4A06'; g.fillText('EIB', 427, 66); g.fillStyle = '#FDE047'; g.fillText('EIB', 425, 64);
    g.textAlign = 'left';
    vignette(g);
  },
  legs: (g, knock) => paintLegs(g, knock, { r: NAVY, hip: 32, hipX: 8, foot: 12, w: 11, shoeW: 14 }),
  body: (g, cup) => {
    paintTorso(g, { r: NAVY, top: 79, hip: 32, sw: 16, ww: 18, belly: 13, tie: TIE, db: true, btn: GOLD[2] });
    // (the paisley on the tie, the strain lines round the buttons, the pocket square, the headphones)
    for (const [dx, dy, col] of [[0, -72, '#DC2626'], [2, -65, '#7C3AED'], [-1, -59, '#DC2626'], [2, -53, '#16A34A']] as [number, number, string][]) { px(g, dx - 1, dy - 1, 3, 2, col); px(g, dx + 1, dy, 1, 2, col); }
    g.strokeStyle = NAVY[0]; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-4, -46); g.lineTo(-11, -42); g.moveTo(6, -46); g.lineTo(13, -42); g.stroke();
    flat(g, () => { g.moveTo(-15, -66); g.lineTo(-10, -70); g.lineTo(-9, -65); g.closePath(); }, '#F59E0B', 0.8);
    headphones(g);
    if (cup) cupArms(g, { sw: 16, top: 79, hip: 32, w: 10, r: NAVY, skin: SKIN, bone: 22 });
    else {
      // (one hand on the belly; the golden mic in the other)
      arm(g, -16, -73, -22, -46, 10, NAVY, SKIN, -1, 15);
      arm(g, 16, -73, 30, -70, 10, NAVY, SKIN, 1, 12);
      goldMic(g, 32, -82, 0.1);
    }
  },
  face: g => {
    for (const s of [-1, 1]) part(g, () => g.ellipse(s * 18, 2, 4, 6, 0, 0, Math.PI * 2), SKIN, s * 18 - 4, s * 18 + 4, 1.3);
    const face = () => { g.moveTo(-18, -6); g.quadraticCurveTo(-18, -22, 0, -22); g.quadraticCurveTo(19, -22, 18, -6); g.quadraticCurveTo(23, 18, 4, 23); g.quadraticCurveTo(-14, 24, -19, 10); g.closePath(); };
    part(g, face, SKIN, -19, 23, 1.6);
    g.save(); g.beginPath(); face(); g.clip();
    g.fillStyle = dith(g, SKIN[2]); g.fillRect(-16, 12, 36, 3);
    g.fillStyle = SKIN[2]; g.fillRect(-16, 17, 40, 8);
    g.fillStyle = '#F2A8A0'; g.globalAlpha = 0.55; g.beginPath(); g.ellipse(11, 7, 4.5, 2.6, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(-8, 7, 3.5, 2.2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.restore();
    g.strokeStyle = SKIN[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(-12, 15); g.quadraticCurveTo(2, 21, 15, 14); g.stroke();
    part(g, () => g.ellipse(10, 3, 5.2, 4.2, 0.2, 0, Math.PI * 2), ['#FFD2C0', '#EDA88E', '#D88A72', '#B86A58'], 5, 15, 1.2);
    px(g, 8, 1, 2, 1, '#FFFFFF');
  },
  hair: g => {
    // (slicked back, dark, the comb lines, a shine)
    const hair = () => { g.moveTo(-18, -4); g.quadraticCurveTo(-21, -27, 2, -27); g.quadraticCurveTo(19, -27, 17, -12); g.quadraticCurveTo(4, -19, -10, -14); g.closePath(); };
    partTop(g, hair, HAIR, -27, -6, 1.4);
    g.strokeStyle = HAIR[3]; g.lineWidth = 0.8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-14 + k * 7, -22); g.quadraticCurveTo(-6 + k * 7, -26, 2 + k * 6, -20); g.stroke(); }
    px(g, -6, -25, 12, 1.5, '#A88A70');
  },
  eyes: [[-5, -4], [8, -4]], eyeR: 3, brow: HAIR[2], browY: -11,
  mouth: [4, 11],
  mouthPre: (c, t) => {
    // (the smirk round the cigar, smoke off its tip)
    c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.arc(3, 7, 6, 0.3, Math.PI - 0.4); c.stroke();
    stampAt(c, cigarProp(), 18, 13, 0.42, H);
    for (let k = 0; k < 3; k++) { const u = ((t + k * 14) % 42) / 42; c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.arc(27 + Math.sin(u * 6 + k) * 3, 14 - u * 26, 1.2 + u * 2.4, 0, Math.PI * 2); c.stroke(); }
  },
  overHead: (c, f) => {
    if (f.hit < 0) return;
    c.save(); c.scale(H, H);
    // (the cigar: droops, then drops out of his mouth end over end)
    const k = f.hit;
    if (k < 6) stampAt(c, cigarProp(), 14 + k * 0.4, 13 + k * 0.8, 0.42 + k * 0.2, H);
    else if (k < 40) { const u = k - 6; stampAt(c, cigarProp(), 17 + u * 0.8, 18 + u * u * 0.12, 1.6 + u * 0.4, H); }
    // (steam out of his ears)
    if (k >= 14 && k < 44) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const u = ((k * 1.5 + i * 8) % 24) / 24;
      c.fillStyle = `rgba(243,244,246,${(0.9 * (1 - u)).toFixed(2)})`; c.beginPath(); c.arc(s * (22 + u * 14), 2 - u * 12, 2 + u * 4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  },
  front: (c, f) => {
    if (f.hit < 0) return;
    // (the mic, dropped)
    const mic = bakeProp('limbaugh-cu-mic', 70, 90, S, g => goldMic(g, 0, 0, 0));
    const k = f.hit;
    if (k < 26) stampAt(c, mic, 32 * S + k * 1.5, -82 * S + k * k * 0.7, 0.1 + k * 0.3);
  },
});
