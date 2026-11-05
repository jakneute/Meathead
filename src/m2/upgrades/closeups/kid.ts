// The cheap shot's own close-up for ZORZARBLAX (the water park's summit; Zorblax and Zarblax's twenty-six-year-old kid,
// still at home): mesh basketball shorts (purple, the white side stripes, the drawstring hanging), sagging off his
// plaid boxers' band, his skinny green thighs below the hem (warts, veins, a zit); his soft pot gut hanging over the
// top out from under the too-small GLORP tee, the belly button, its hair trail, Cheeto dust on it, the little chest
// arm's hand poking out under the shirt and grabbing at the air. Through the lens: what the family tree did to him, THREE
// nuts crammed in one bag. His glove tears all three out (fleshKit.ts runFlesh: the rip), the spray half green (he's half his dad).
// SPLORCH. The family line ends there: NO GRANDKIDS.

import type { CloseUpPaint } from '../closeUp';
import { CX, PANEL_W, bakeOnce, rnd } from '../closeUp';
import { type Ramp, type Ctx, banded, bodyPath, paintBackdrop, paintCloth, paintWindow, paintTag, dither, vein, hairs, runFlesh } from './fleshKit';

// (his ramps: endgame/park1/kidArt.ts)
const SKIN: Ramp = ['#C0D494', '#97B46A', '#74994E', '#587F40', '#15241A'];
const GUT: Ramp = ['#E6E0AE', '#CEC888', '#B0AA64', '#8E8A48', '#2E2E16'];
const SHORTS: Ramp = ['#C9B8FF', '#8B5CF6', '#6D28D9', '#4C1D95', '#160832'];
const SHIRT: Ramp = ['#FFF3B0', '#F6D445', '#D4A52A', '#A87818', '#3E2806'];
const HAIR = '#22160E';
const GOO = ['#D9F99D', '#A8E03A', '#5E8A18', '#3F6212'] as const;
const TAU = Math.PI * 2;

const scene = () => bakeOnce('kid-scene', g => {
  // (behind his legs: the summit's fake snow, packed and dirty, at night)
  paintBackdrop(g, ['#C8D4E8', '#AEBCD8', '#94A4C6', '#7A8AB0', '#5E6E96']);
  g.fillStyle = '#E8F0FA'; for (let i = 0; i < 18; i++) g.fillRect((i * 71) % PANEL_W, 170 + (i * 37) % 110, 10 + (i % 3) * 6, 2);
  paintCloth(g, SHORTS, { hem: 214, leg: SKIN });
  // (the mesh: rows of little holes; the white side stripes down the outsides of both legs; the drawstring's eyelets)
  g.save(); g.beginPath(); bodyPath(g); g.clip(); g.beginPath(); g.rect(0, 0, PANEL_W, 202); g.clip();
  for (let y = 4; y < 200; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < PANEL_W; x += 6) { g.fillStyle = SHORTS[3]; g.fillRect(x, y, 2, 2); }
  for (const s of [-1, 1]) { const x = s < 0 ? 24 : PANEL_W - 40; g.fillStyle = '#F4F4F5'; g.fillRect(x, 0, 14, 202); g.fillStyle = SHORTS[4]; g.fillRect(x - 1, 0, 1, 202); g.fillRect(x + 14, 0, 1, 202); dither(g, x + 10, 0, 4, 202, '#C8C8D0'); }
  // (a stain on the front: a dribble of something gone crusty)
  g.fillStyle = 'rgba(132,204,22,0.45)'; g.beginPath(); g.ellipse(CX - 70, 150, 22, 14, 0.3, 0, TAU); g.fill();
  dither(g, CX - 88, 140, 34, 20, '#4D7C0F');
  g.restore();
  // (his skinny green thighs below the hem: warts, a vein, a zit, a patch of hair)
  for (let i = 0; i < 10; i++) {
    const x = 30 + rnd(i * 3.3) * (PANEL_W - 60), y = 230 + rnd(i * 7.1) * 44;
    if (Math.abs(x - CX) < 70) continue;
    g.fillStyle = SKIN[4]; g.beginPath(); g.arc(x + 1, y + 1, 5, 0, TAU); g.fill();
    g.fillStyle = '#8A9A50'; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill(); g.fillStyle = '#B8C878'; g.fillRect(x - 3, y - 3, 3, 2);
  }
  for (let i = 0; i < 4; i++) vein(g, i < 2 ? 70 + i * 50 : PANEL_W - 90 - (i - 2) * 50, 278, 60, -Math.PI / 2 + (i % 2 ? 0.3 : -0.3), '#5B3A78', 3, i * 23);
  g.fillStyle = '#D2564A'; g.beginPath(); g.arc(CX + 150, 246, 5, 0, TAU); g.fill(); g.fillStyle = '#FFF7D6'; g.fillRect(CX + 148, 243, 4, 3);
  paintWindow(g, { skin: SKIN, cloth: SHORTS, hair: HAIR, fat: 10, veins: 'rgba(124,58,237,0.55)' });
  paintTag(g, 'ZORZARBLAX');
});

// (the gut over the top: out from under the shirt's hem, over the shorts' sagging band and the plaid boxers)
const gutPath = (p: Ctx) => { p.ellipse(CX + 10, -30, 250, 84, 0, 0, TAU); };
const over = () => bakeOnce('kid-over', g => {
  // (the plaid boxers' band, peeking out above the shorts, under the gut)
  g.fillStyle = '#F4F0E6'; g.fillRect(0, 34, PANEL_W, 14);
  for (let x = 0; x < PANEL_W; x += 14) { g.fillStyle = '#E23A3A'; g.fillRect(x, 34, 5, 14); }
  g.fillStyle = '#2A4AA8'; g.fillRect(0, 40, PANEL_W, 2);
  g.fillStyle = '#3E2806'; g.fillRect(0, 47, PANEL_W, 2);
  // (the shorts' own band, its drawstring hanging, an aglet gone)
  banded(g, p => p.rect(-10, 46, PANEL_W + 20, 12), -10, 46, PANEL_W + 20, 12, SHORTS, [0, 1, 3], 'y', SHORTS[4], 2);
  g.strokeStyle = '#F8FAFC'; g.lineWidth = 3; g.beginPath(); g.moveTo(CX - 8, 52); g.quadraticCurveTo(CX - 16, 74, CX - 10, 92); g.moveTo(CX + 8, 52); g.quadraticCurveTo(CX + 14, 70, CX + 22, 80); g.stroke();
  g.fillStyle = '#A1A1AA'; g.fillRect(CX - 13, 90, 6, 8);
  // (the gut, its trail, the belly button, stretch marks, Cheeto dust; the shirt's hem riding up off it)
  banded(g, gutPath, -260, -120, PANEL_W + 520, 210, GUT, [0, 1, 1, 2, 3], 'y', GUT[4], 4);
  g.save(); g.beginPath(); gutPath(g); g.clip();
  g.fillStyle = GUT[4]; g.beginPath(); g.ellipse(CX + 20, 34, 9, 11, 0, 0, TAU); g.fill(); g.fillStyle = '#9CA3AF'; g.fillRect(CX + 17, 36, 5, 3);
  hairs(g, CX + 10, 40, 22, 14, 14, HAIR, 41, 1.2); hairs(g, CX + 4, 10, 30, 20, 16, HAIR, 43, 1.2);
  g.strokeStyle = GUT[0]; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = 60 + i * 74; g.beginPath(); g.moveTo(x, 22); g.quadraticCurveTo(x + 6, 34, x + 4, 46); g.stroke(); }
  g.fillStyle = '#F08A1C'; for (let i = 0; i < 4; i++) { g.fillRect(CX + 90 + i * 12, 8 + (i % 2) * 6, 8, 20); g.fillStyle = i % 2 ? '#F08A1C' : '#FDBA74'; }
  banded(g, p => { p.moveTo(-20, -20); p.lineTo(PANEL_W + 20, -20); p.lineTo(PANEL_W + 20, 2); p.quadraticCurveTo(CX, 16, -20, 2); p.closePath(); }, -20, -20, PANEL_W + 40, 40, SHIRT, [1, 2, 3], 'y', SHIRT[4], 3);
  dither(g, 60, 0, 120, 8, '#B89420');
  g.restore();
});

/** His little chest arm's hand, out under the shirt, grabbing at the air (and at the glove, after). */
const kidHand = (c: Ctx, t: number, rip: number) => {
  const panic = rip >= 0 ? 3 : 1, x = CX - 150 + Math.sin(t * 0.4 * panic) * 10, y = 26 + Math.cos(t * 0.5 * panic) * 6;
  c.strokeStyle = SKIN[4]; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(CX - 160, -6); c.lineTo(x, y); c.stroke();
  c.strokeStyle = SKIN[1]; c.lineWidth = 6; c.stroke();
  for (let i = -1; i <= 1; i++) { const a = Math.PI / 2 + i * 0.5 + Math.sin(t * 0.6 * panic + i) * 0.3; c.strokeStyle = SKIN[4]; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 12, y + Math.sin(a) * 12); c.stroke(); c.strokeStyle = SKIN[1]; c.lineWidth = 3; c.stroke(); }
  c.lineCap = 'butt';
};

export const closeUp: CloseUpPaint = (c, t, look) => runFlesh(c, t, look, {
  id: 'kid', scene, over, skin: SKIN, hair: HAIR, three: true, sacScale: 1.05,
  word: 'SPLORCH!', caption: 'NO GRANDKIDS', captionCol: GOO[1],
  bloodCols: [GOO[1], GOO[2], GOO[3], '#B91C1C'],
  burstCols: [GOO[0], GOO[1], GOO[2], GOO[3]],
  pool: [GOO[3], GOO[2], GOO[1]],
  top: (c, t, rip) => kidHand(c, t, rip),
});
