// The cheap shot's own close-up for Newt (Phase F; punditKit.ts the routine): the stout man in the navy suit and the
// red tie, the big round pink-cheeked face, the little eyes, the puffy white helmet of hair; the Contract with America
// rolled under one arm and the Speaker's gavel raised in the other ("ORDER!"), the Capitol dome behind. The boot: BONK!
// The gavel flies, the Contract drops, his helmet of hair pops clean off his head (POP!) and lands back crooked; red,
// purple, the wheeze, then he keels over.

import type { CloseUpPaint } from '../closeUp';
import { gavel, contract } from '../../cartoon/whitehouse2/punditArt';
import { punditCloseUp, part, partTop, flat, dith, px, bands, vignette, paintLegs, paintTorso, arm, cupArms, bakeProp, stampAt, shout, type Rp } from './punditKit';

const SKIN: Rp = ['#FFE2D6', '#F5BFA5', '#E09A84', '#BC765E'];
const NAVY: Rp = ['#4A64B4', '#22408E', '#182E6A', '#0E1E4A'];
const HAIR: Rp = ['#FFFFFF', '#F1F5F9', '#CBD5E1', '#94A3B8'];
const RED: Rp = ['#E46A74', '#C81E2E', '#9C1824', '#70121A'];
const S = 2.0, H = 2.8;

export const closeUp: CloseUpPaint = punditCloseUp({
  id: 'newt', S, H, head: [0, -94], chin: 22, top: 29, hip: 32, fall: -1, skin: SKIN,
  bang: 'BONK!', bangCol: '#F87171',
  bg: g => {
    bands(g, ['#3E6EB4', '#4A7EC2', '#5A8ECE', '#6C9ED8', '#80AEE0', '#96BEE6']);
    // (the Capitol: the dome on its drum, columns, the wings, dimmed back)
    const W = '#C8CEDC', Wd = '#A4ACC0', Wl = '#E4E8F0';
    g.fillStyle = Wd; g.fillRect(60, 196, 400, 84);
    g.fillStyle = W; g.fillRect(60, 196, 400, 8);
    for (let x = 70; x < 460; x += 16) { g.fillStyle = Wl; g.fillRect(x, 208, 6, 72); g.fillStyle = Wd; g.fillRect(x + 4, 208, 2, 72); }
    g.fillStyle = W; g.fillRect(170, 150, 180, 46); for (let x = 176; x < 346; x += 14) { g.fillStyle = Wl; g.fillRect(x, 156, 5, 40); }
    g.fillStyle = W; g.beginPath(); g.ellipse(260, 150, 80, 76, 0, Math.PI, 0); g.fill();
    g.fillStyle = Wl; g.beginPath(); g.ellipse(240, 150, 46, 70, 0, Math.PI, Math.PI * 1.5); g.lineTo(240, 150); g.fill();
    g.strokeStyle = Wd; g.lineWidth = 2; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(260 + i * 22, 150); g.quadraticCurveTo(260 + i * 14, 100, 260, 76); g.stroke(); }
    g.fillStyle = W; g.fillRect(250, 50, 20, 28); g.fillStyle = Wd; g.fillRect(256, 30, 8, 22);
    g.fillStyle = dith(g, 'rgba(60,100,170,0.35)'); g.fillRect(0, 0, 520, 280);
    vignette(g);
  },
  legs: (g, knock) => paintLegs(g, knock, { r: NAVY, hip: 32, hipX: 8, foot: 11, w: 10, shoeW: 14 }),
  body: (g, cup) => {
    if (!cup) contract(g, -22, -54, -0.5);
    paintTorso(g, { r: NAVY, top: 74, hip: 32, sw: 15, ww: 16, belly: 10, tie: RED, btn: '#0E1E4A' });
    px(g, -11, -66, 4, 3, '#1D4ED8'); px(g, -11, -64, 4, 1, '#DC2626');
    if (cup) cupArms(g, { sw: 15, top: 74, hip: 32, w: 9, r: NAVY, skin: SKIN, bone: 21 });
    else {
      // (the Contract clamped under his arm; the gavel raised: ORDER!)
      arm(g, -15, -68, -16, -48, 9, NAVY, SKIN, -1, 12);
      gavel(g, 26, -98, -0.6);
      arm(g, 15, -68, 26, -98, 9, NAVY, SKIN, 1, 18);
    }
  },
  face: g => {
    const face = () => g.ellipse(0, 2, 19, 20, 0, 0, Math.PI * 2);
    part(g, face, SKIN, -19, 19, 1.6);
    g.save(); g.beginPath(); face(); g.clip();
    g.fillStyle = dith(g, SKIN[2]); g.fillRect(-18, 13, 36, 3);
    g.fillStyle = SKIN[2]; g.fillRect(-18, 16, 36, 8);
    g.fillStyle = '#F29A8A'; g.globalAlpha = 0.6; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 10 + 2, 7, 5.5, 3.6, 0, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1;
    g.restore();
    part(g, () => g.ellipse(3, 4, 4.5, 3.8, 0, 0, Math.PI * 2), ['#FFD2C0', '#EFA48E', '#D88A72', '#B86A58'], -2, 8, 1.2);
  },
  hair: g => {
    // (the white helmet: puffed, in curls, stepped from above)
    const hair = () => { g.moveTo(-20, 2); g.quadraticCurveTo(-27, -27, 0, -29); g.quadraticCurveTo(27, -27, 20, -2); g.quadraticCurveTo(12, -14, 0, -14); g.quadraticCurveTo(-14, -14, -20, 2); g.closePath(); };
    partTop(g, hair, HAIR, -29, 0, 1.5);
    g.strokeStyle = HAIR[3]; g.lineWidth = 1; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(-15 + k * 7.5, -20 + Math.abs(k - 2) * 2, 4.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    px(g, -8, -27, 10, 1.5, '#FFFFFF');
  },
  eyes: [[-5, -2], [8, -2]], eyeR: 2.4, brow: HAIR[3], browY: -8,
  mouth: [2, 12],
  mouthPre: (c, t) => {
    // (ORDER! ORDER!)
    const o = [4, 7, 5, 8][(t >> 2) % 4];
    flat(c, () => c.ellipse(2, 12, 6, o / 2 + 1.5, 0, 0, Math.PI * 2), '#5A0E14', 1.3); px(c, -3, 10, 10, 1.4, '#FFFFFF');
  },
  hairOff: f => {
    // (the helmet pops straight up off his head, and lands back on crooked)
    if (f.hit < 0) return [0, 0, 0];
    if (f.hit < 20) { const u = f.hit; return [u * 0.2, -(u * 4.2 - u * u * 0.21), u * 0.05]; }
    return [3, 0.5, 0.22];
  },
  overHead: (c, f) => {
    if (f.hit >= 2 && f.hit < 16) shout(c, 'POP!', -24 * H, -40 * H, 13, '#FFFFFF', -0.2);
  },
  front: (c, f) => {
    if (f.hit < 0) return;
    // (the gavel flies end over end; the Contract drops)
    const k = f.hit;
    const gv = bakeProp('newt-cu-gavel', 80, 80, S, g => gavel(g, 0, 0, 0, true));
    stampAt(c, gv, 26 * S + k * 6, -112 * S - k * 6 + k * k * 0.5, -0.6 + k * 0.5);
    const ct = bakeProp('newt-cu-contract', 80, 40, S, g => contract(g, 0, 0, 0));
    if (k < 30) stampAt(c, ct, -22 * S - k * 1.5, -54 * S + k * k * 0.6, -0.5 - k * 0.2);
  },
});
