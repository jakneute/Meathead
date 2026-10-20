// The people in the studio's tableaux (scenery: still, or barely moving), on Spooky Land's person drawer (costume.ts:
// every part in steps, inked; seeded, so no two the same, men and women, every skin, build and hair): the night shift
// at their light tables (tired, working, human: drawn with sympathy), the writers behind their table, the engineer,
// the camera operator, Dave the animatronic (tipped back, feet up, the mug jerked up to his mouth on a cylinder), the
// art director with his stamp, the voice star in the booth; and the show's cartoon cast as the model sheets and the
// promo draw them (Socks, Chelsea): flat cel color, fat ink, the way a 1994 Saturday-morning show looked.

import { part, px, ball, limb, dk, lt, bodyOf, headShape, faceOn, hairTop, hairBack, glasses, whiskers, INK as SINK } from '../../spooky/costume';
import { box, PAPER, slab, type Ctx } from './paint';

export const ASIAN_SKIN = ['#F3D2B3', '#EBC29C', '#E0B48A', '#D9A877', '#F0C8A2', '#E6BC94'];
export const ASIAN_HAIR = ['#141414', '#1F1611', '#2B1D14', '#18120E'];

/** An office chair (its seat's middle at 0, 0): a padded seat and back in steps, the gas lift, a five-star base. */
export const officeChair = (g: Ctx, col = '#3F3F46') => {
  part(g, () => g.roundRect(-15, -3, 26, 6, 2), col, -15, -3, 26, 6, 1);
  part(g, () => g.roundRect(-18, -36, 7, 34, 3), col, -18, -36, 7, 34, 1);
  limb(g, -1, 3, -1, 16, 3, '#52525B');
  limb(g, -12, 19, 10, 19, 2.6, '#27272A');
  ball(g, -12, 20, 1.8, '#18181B', 0.6); ball(g, 10, 20, 1.8, '#18181B', 0.6); ball(g, -1, 20, 1.8, '#18181B', 0.6);
};

/** Someone sat at a desk to their right, from the hip on the seat at (0, 0): hunched over, the near hand out on the
 *  desk (`reach` px), the head bent (`nod` 0..1; 1 asleep on the desk). `drawing` a pencil in the hand. */
export const sitter = (g: Ctx, seed: number, o: { shirt: string; pants?: string; reach?: number; nod?: number; asian?: boolean; drawing?: boolean; hand?: number; yawn?: boolean; cap?: string; cardigan?: string; chair?: string }) => {
  const B = bodyOf(seed, 'stand', 0);
  if (o.asian) { B.L.skin = ASIAN_SKIN[((Math.floor(seed) % ASIAN_SKIN.length) + ASIAN_SKIN.length) % ASIAN_SKIN.length]; B.L.hair = ASIAN_HAIR[((Math.floor(seed >> 2) % ASIAN_HAIR.length) + ASIAN_HAIR.length) % ASIAN_HAIR.length]; B.L.bald = false; if (B.L.face === 1 || B.L.face === 2) B.L.face = (seed % 2) ? 3 : 0; }
  const L = B.L, nod = o.nod ?? 0.3;
  g.save();
  officeChair(g, o.chair ?? '#3F3F46');
  // (legs: the thigh out along the seat, the shin down, a shoe)
  limb(g, 0, -2, 18, -2, B.legW, o.pants ?? '#334155'); limb(g, 18, -2, 20, 18, B.legW - 0.5, o.pants ?? '#334155');
  part(g, () => g.roundRect(18, 16, 10, 4, 1.5), '#1C1917', 18, 16, 10, 4, 1);
  // (the body hunched toward the desk)
  const lean = 6 + nod * 10;
  g.translate(0, -2); g.rotate(0.18 + nod * 0.35); g.translate(0, 2);
  // (the far arm, propping the head or flat on the desk)
  limb(g, -2, -22, 10 + (o.reach ?? 10) * 0.6, -16 + nod * 8, B.armW - 0.5, dk(o.cardigan ?? o.shirt, 0.15));
  part(g, () => { g.moveTo(-B.hipW / 2, 0); g.lineTo(-B.w / 2 + 2, -24); g.quadraticCurveTo(0, -28, B.w / 2, -24); g.lineTo(B.hipW / 2, 0); g.closePath(); }, o.shirt, -B.w / 2, -28, B.w, 28);
  // (a cardigan over it: open down the front, a button or two)
  if (o.cardigan) { part(g, () => { g.moveTo(-B.hipW / 2 - 1, 0); g.lineTo(-B.w / 2 + 1, -25); g.quadraticCurveTo(-4, -28, -2, -26); g.lineTo(2, 0); g.closePath(); }, o.cardigan, -B.w / 2, -28, B.w / 2 + 2, 28, 1); px(g, 1, -18, 2, 2, lt(o.cardigan, 0.4)); px(g, 1, -10, 2, 2, lt(o.cardigan, 0.4)); }
  const hb = { ...B, hx: 3 + lean * 0.3, hy: -34 + nod * 4 };
  hairBack(g, hb);
  headShape(g, hb, L.skin);
  faceOn(g, hb, { skin: L.skin, eyes: nod > 0.9 ? 'closed' : o.yawn ? 'closed' : 'tired', mouth: o.yawn ? 'o' : 'flat', look: 0.9 });
  // (the bags under their eyes: it's quarter to three)
  if (nod < 0.9) { px(g, hb.hx, hb.hy + 2, 3, 1, dk(L.skin, 0.22)); px(g, hb.hx + 5, hb.hy + 2, 3, 1, dk(L.skin, 0.22)); }
  glasses(g, hb); whiskers(g, hb); hairTop(g, hb);
  if (o.cap) { part(g, () => { g.moveTo(hb.hx - 9, hb.hy - 4); g.quadraticCurveTo(hb.hx, hb.hy - 15, hb.hx + 9, hb.hy - 4); g.closePath(); }, o.cap, hb.hx - 9, hb.hy - 15, 18, 11, 1); part(g, () => g.rect(hb.hx - 16, hb.hy - 6, 8, 3), o.cap, hb.hx - 16, hb.hy - 6, 8, 3, 1); }
  // (the near arm out on the desk, a pencil in the hand)
  const hx = 14 + (o.reach ?? 10) + (o.hand ?? 0), hy = -14 + nod * 6;
  limb(g, 4, -22, hx, hy, B.armW, o.cardigan ?? o.shirt); ball(g, hx, hy, 3.4, L.skin, 1);
  if (o.drawing && nod < 0.9) { px(g, hx - 1, hy - 8, 2, 8, '#F2C230'); px(g, hx - 1, hy - 1, 2, 2, '#3F3F46'); px(g, hx - 1, hy - 9, 2, 2, '#F49AB0'); }
  g.restore();
};

/** Someone seen behind a table (from the chest up over its edge, at (0, 0) the table's top), facing right-ish. */
export const behind = (g: Ctx, seed: number, o: { shirt: string; cap?: string; asleep?: boolean; phone?: boolean; arms?: number; mouth?: 'grin' | 'flat' | 'o' | 'smirk' | 'talk'; plaid?: string }) => {
  const B = bodyOf(seed, 'stand', 0), L = B.L;
  g.save();
  const hb = { ...B, hy: o.asleep ? -10 : -44 };
  if (o.asleep) { part(g, () => g.ellipse(-4, 2, 18, 5, 0, 0, Math.PI * 2), o.shirt, -22, -3, 36, 10, 1); }
  if (!o.asleep) {
    part(g, () => { g.moveTo(-B.w / 2 - 2, -30); g.quadraticCurveTo(0, -36, B.w / 2 + 2, -30); g.lineTo(B.w / 2 + 4, 0); g.lineTo(-B.w / 2 - 4, 0); g.closePath(); }, o.shirt, -B.w / 2 - 4, -36, B.w + 8, 36);
    // (flannel: the check over it)
    if (o.plaid) { for (let k = -B.w / 2; k < B.w / 2; k += 6) px(g, k, -30, 2, 30, o.plaid); for (let k = -28; k < 0; k += 6) px(g, -B.w / 2 - 2, k, B.w + 4, 1, o.plaid); }
    // (the arms on the table, the hands out in front)
    limb(g, -B.w / 2, -24, -B.w / 2 + 6, -2, B.armW, o.shirt); limb(g, B.w / 2, -24, B.w / 2 + 10, -2, B.armW, o.shirt);
    ball(g, B.w / 2 + 12, -3, 3.2, L.skin, 1);
  }
  hairBack(g, hb); headShape(g, hb, L.skin);
  faceOn(g, hb, { skin: L.skin, eyes: o.asleep ? 'closed' : 'smug', mouth: o.asleep ? 'o' : o.mouth ?? 'grin' });
  glasses(g, hb); whiskers(g, hb); hairTop(g, hb);
  if (o.cap) { part(g, () => { g.moveTo(hb.hx - 9, hb.hy - 4); g.quadraticCurveTo(hb.hx, hb.hy - 15, hb.hx + 9, hb.hy - 4); g.closePath(); }, o.cap, hb.hx - 9, hb.hy - 15, 18, 11, 1); part(g, () => g.rect(hb.hx - 17, hb.hy - 6, 9, 3), o.cap, hb.hx - 17, hb.hy - 6, 9, 3, 1); }
  if (o.phone) { part(g, () => g.roundRect(hb.hx + 6, hb.hy - 4, 6, 18, 1), '#18181B', hb.hx + 6, hb.hy - 4, 6, 18, 1); px(g, hb.hx + 9, hb.hy - 13, 1.5, 9, '#18181B'); px(g, hb.hx + 7, hb.hy + 4, 4, 1, '#5CF06A'); }
  if (o.asleep) { /* (a Z or two over him: the room's live bits) */ }
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dave, the animatronic

/** Dave's chair and the half of him that doesn't move (the legs up on the desk, the soles at us): painted once. */
export const paintDaveStill = (g: Ctx, dx: number, gy: number) => {
  // (his chair: a big executive one in oxblood leather, buttoned, tipped back)
  g.save(); g.translate(dx - 48, gy - 60); g.rotate(-0.28);
  part(g, () => g.roundRect(-26, -96, 46, 100, 10), '#5A1A1A', -26, -96, 46, 100, 1.6);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { ball(g, -12 + j * 18, -78 + i * 22, 1.6, '#2A0A0A', 0); px(g, -13 + j * 18, -79 + i * 22, 1, 1, '#B04A4A'); }
  g.restore();
  part(g, () => g.roundRect(dx - 74, gy - 66, 58, 14, 4), '#5A1A1A', dx - 74, gy - 66, 58, 14, 1.4);
  limb(g, dx - 46, gy - 52, dx - 46, gy - 14, 4, '#52525B');
  limb(g, dx - 70, gy - 10, dx - 20, gy - 10, 3.4, '#27272A');
  for (const wx of [-68, -46, -22]) ball(g, dx + wx, gy - 7, 3, '#18181B', 0.8);
  // (the legs up on the desk: pleated chinos, loafers, no socks)
  limb(g, dx - 30, gy - 72, dx + 40, gy - 92, 10, '#C8B48A'); limb(g, dx + 40, gy - 92, dx + 92, gy - 94, 9, '#C8B48A');
  part(g, () => g.roundRect(dx + 88, gy - 108, 12, 18, 3), '#5A2A12', dx + 88, gy - 108, 12, 18, 1);
  px(g, dx + 90, gy - 104, 3, 10, '#8A4A22'); px(g, dx + 86, gy - 92, 5, 3, '#F0C8A2');
};
/** The live half: the turtleneck body tipped back, the head on its pivot, the mug arm (down on his chest, then jerked
 *  up to his mouth: an animatronic, no easing; held; back down). */
export const drawDave = (c: Ctx, dx: number, gy: number, f: number) => {
  const sx = dx - 40, sy = gy - 66;
  c.save(); c.translate(sx, sy); c.rotate(-0.35);
  part(c, () => { c.moveTo(-13, 0); c.lineTo(-13, -38); c.quadraticCurveTo(0, -45, 13, -38); c.lineTo(15, 0); c.closePath(); }, '#141414', -13, -45, 28, 45, 1.2);
  // (the turtleneck's roll at the neck; a seam where the head turns)
  part(c, () => c.roundRect(-6, -46, 14, 6, 2), '#1E1E1E', -6, -46, 14, 6, 1);
  const t = f % 260, up = t > 20 && t < 90, nodK = t > 20 && t < 26 ? 1 : 0;
  const B = bodyOf(4, 'stand', 0); B.L.skin = '#F0C8A2'; B.L.hair = '#5B4636'; B.L.bald = false;
  const hb = { ...B, hx: 2, hy: -54 - nodK };
  part(c, () => c.ellipse(-9, -48, 3.5, 10, 0.4, 0, Math.PI * 2), '#5B4636', -12, -58, 7, 20, 1);
  px(c, -11, -42, 4, 2, '#B91C1C');
  headShape(c, hb, B.L.skin);
  faceOn(c, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'smirk' });
  for (const ex of [1, 7]) { c.strokeStyle = SINK; c.lineWidth = 1.4; c.beginPath(); c.arc(hb.hx + ex, hb.hy - 1, 3, 0, Math.PI * 2); c.stroke(); }
  px(c, hb.hx, hb.hy - 3, 1, 1, '#FFFFFF'); px(c, hb.hx + 6, hb.hy - 3, 1, 1, '#FFFFFF');
  part(c, () => c.ellipse(hb.hx + 4, hb.hy + 8, 4, 3, 0, 0, Math.PI * 2), '#5B4636', hb.hx, hb.hy + 5, 8, 6, 0.8);
  hairTop(c, hb, '#5B4636');
  px(c, hb.hx - 6, hb.hy + 6, 12, 1, dk(B.L.skin, 0.3));
  const hx = up ? hb.hx + 10 : 12, hy = up ? hb.hy + 4 : -24;
  limb(c, 6, -36, hx, hy, 6, '#141414'); ball(c, hx, hy, 3.5, B.L.skin, 1);
  // (the mug: WORLD'S #1 VISIONARY)
  part(c, () => c.rect(hx - 1, hy - 11, 12, 13), '#F8FAFC', hx - 1, hy - 11, 12, 13, 1);
  c.strokeStyle = SINK; c.lineWidth = 1.4; c.beginPath(); c.arc(hx + 12, hy - 5, 3, -1.2, 1.2); c.stroke();
  px(c, hx + 1, hy - 8, 8, 2, '#B91C1C'); px(c, hx + 2, hy - 4, 6, 1, '#1D4ED8');
  c.restore();
  // (the cylinder's hiss as the arm goes: a puff of air off his elbow)
  if (t > 20 && t < 30) { c.fillStyle = 'rgba(240,240,250,0.5)'; c.beginPath(); c.arc(sx + 18 + (t - 20), sy - 30 - (t - 20), 3 + (t - 20) * 0.4, 0, Math.PI * 2); c.fill(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The show's cast, cel style

/** A cartoon Socks (a tuxedo cat in a little bow tie): its feet at (x, y), `k` big, `view` 0 front, 1 side, 2 back. */
export const socks = (g: Ctx, x: number, y: number, k: number, view = 0) => {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.lineWidth = 3; g.lineJoin = 'round';
  g.fillStyle = '#18181B'; g.strokeStyle = '#000'; g.beginPath(); g.ellipse(0, -22, 16, 22, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // (the cel's one shade: a darker band down the far side)
  g.save(); g.beginPath(); g.ellipse(0, -22, 15, 21, 0, 0, Math.PI * 2); g.clip(); g.fillStyle = '#2A2A33'; g.fillRect(-15, -44, 9, 44); g.restore();
  if (view !== 2) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(view ? 6 : 0, -18, 8, 14, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#FFFFFF'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 8, -2, 6, 3.5, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
  g.fillStyle = '#18181B'; g.beginPath(); g.arc(view === 1 ? 4 : 0, -54, 16, 0, Math.PI * 2); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 5, -66); g.lineTo(s * 14, -78); g.lineTo(s * 15, -60); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#F9A8D4'; g.beginPath(); g.moveTo(s * 8, -66); g.lineTo(s * 13, -74); g.lineTo(s * 13, -64); g.closePath(); g.fill(); g.fillStyle = '#18181B'; }
  if (view !== 2) {
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(view ? 12 : 0, -48, 9, 6, 0, 0, Math.PI * 2); g.fill();
    for (const s of view ? [1] : [-1, 1]) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse((view ? 10 : 0) + s * 6, -58, 4, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc((view ? 11 : 0) + s * 6, -57, 2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect((view ? 11 : 0) + s * 6 - 1, -59, 1, 1); }
    g.fillStyle = '#F472B6'; g.beginPath(); g.arc(view ? 18 : 0, -50, 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(-7, -42); g.lineTo(0, -38); g.lineTo(-7, -34); g.closePath(); g.moveTo(7, -42); g.lineTo(0, -38); g.lineTo(7, -34); g.closePath(); g.fill();
    g.fillStyle = '#991B1B'; g.fillRect(-1.5, -40, 3, 4);
  }
  g.strokeStyle = '#000'; g.lineWidth = 6; g.beginPath(); g.moveTo(-14, -14); g.quadraticCurveTo(-30, -20, -26, -40); g.stroke();
  g.strokeStyle = '#18181B'; g.lineWidth = 3; g.stroke();
  g.restore();
};
/** A cartoon Chelsea (curly hair, braces, a big smile): her feet at (x, y), `k` big. */
export const chelsea = (g: Ctx, x: number, y: number, k: number, wave = false) => {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = '#000';
  for (const s of [-1, 1]) { g.fillStyle = '#F0C8A2'; g.fillRect(s * 6 - 2, -22, 5, 20); g.fillStyle = '#1E3A8A'; g.fillRect(s * 6 - 4, -4, 9, 4); }
  g.fillStyle = '#7C3AED'; g.beginPath(); g.moveTo(-14, -20); g.lineTo(14, -20); g.lineTo(8, -58); g.lineTo(-8, -58); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#5B21B6'; g.beginPath(); g.moveTo(4, -20); g.lineTo(14, -20); g.lineTo(8, -58); g.lineTo(4, -58); g.closePath(); g.fill();
  g.fillStyle = '#FFFFFF'; g.fillRect(-5, -56, 10, 3);
  g.strokeStyle = '#000'; g.lineWidth = 5; g.beginPath(); g.moveTo(8, -52); g.lineTo(wave ? 22 : 14, wave ? -74 : -34); g.stroke(); g.strokeStyle = '#F0C8A2'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#F0C8A2'; g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.arc(0, -72, 13, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#A0522D';
  for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI * 1.2 - 0.1; g.beginPath(); g.arc(Math.cos(a) * 14, -74 + Math.sin(a) * 12, 6, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#C2703A'; for (let i = 0; i < 5; i++) { const a = Math.PI + (i / 4) * Math.PI * 0.9; g.beginPath(); g.arc(Math.cos(a) * 12 - 1, -76 + Math.sin(a) * 10, 2, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#000'; g.beginPath(); g.arc(-4, -74, 1.8, 0, Math.PI * 2); g.arc(5, -74, 1.8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.fillRect(-6, -67, 12, 5); g.fillStyle = '#9CA3AF'; g.fillRect(-6, -65, 12, 1.4);
  g.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The live ones

/** The art director (live): a pink sweater over his shoulders, the rubber stamp up and down. */
export const drawArtDirector = (c: Ctx, x: number, feet: number, f: number) => {
  const B = bodyOf(33, 'stand', 0); B.L.skin = '#F6DCC8'; B.L.hair = '#A16207'; B.L.bald = false;
  c.save(); c.translate(x, feet);
  limb(c, -4, -31, -5, -2, B.legW, '#C8B48A'); limb(c, 4, -31, 5, -2, B.legW, '#C8B48A');
  part(c, () => c.roundRect(-10, -4, 9, 4, 1.5), '#5A2A12', -10, -4, 9, 4, 1); part(c, () => c.roundRect(2, -4, 9, 4, 1.5), '#5A2A12', 2, -4, 9, 4, 1);
  part(c, () => { c.moveTo(-11, -30); c.lineTo(-12, -55); c.quadraticCurveTo(0, -58, 12, -55); c.lineTo(11, -30); c.closePath(); }, '#F8FAFC', -12, -58, 24, 28, 1.2);
  px(c, -1, -52, 2, 22, '#E2E8F0'); for (let k = 0; k < 3; k++) px(c, 1, -48 + k * 7, 1.5, 1.5, '#94A3B8');
  part(c, () => { c.moveTo(-13, -56); c.quadraticCurveTo(0, -60, 13, -56); c.lineTo(13, -50); c.quadraticCurveTo(0, -54, -13, -50); c.closePath(); }, '#F9A8D4', -13, -60, 26, 10, 1);
  limb(c, -6, -50, 2, -44, 3.4, '#F9A8D4'); limb(c, 6, -50, -2, -44, 3.4, '#F9A8D4');
  ball(c, 0, -45, 3, '#F472B6', 1);
  const hb = { ...B, hx: 2, hy: -66 };
  headShape(c, hb, B.L.skin); faceOn(c, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'smirk' }); hairTop(c, hb);
  px(c, hb.hx - 7, hb.hy - 10, 10, 2, lt(B.L.hair, 0.35));
  const t = f % 80, up = t < 50, sy = up ? -86 + Math.min(1, t / 20) * -6 : -72 + (t - 50) * 0.2;
  limb(c, 8, -52, 26, sy + 14, 6, '#F8FAFC'); ball(c, 26, sy + 14, 3.5, B.L.skin, 1);
  part(c, () => c.rect(20, sy, 14, 12), '#7A4F2A', 20, sy, 14, 12, 1); part(c, () => c.rect(18, sy + 12, 18, 5), '#B91C1C', 18, sy + 12, 18, 5, 1);
  c.restore();
  if (t === 50 || t === 51) { c.fillStyle = 'rgba(220,38,38,0.5)'; c.fillRect(x + 36, feet - 80, 20, 3); }
};

/** The voice star in the booth (still): big 90s hair, shades, a leather jacket, a gold chain, headphones, at the mic. */
export const paintStar = (g: Ctx, sx: number, sy: number) => {
  const B = bodyOf(17, 'stand', 0); B.L.skin = '#D9A877'; B.L.hair = '#141414';
  part(g, () => { g.moveTo(sx - 22, sy); g.lineTo(sx - 20, sy - 60); g.quadraticCurveTo(sx, sy - 70, sx + 20, sy - 60); g.lineTo(sx + 22, sy); g.closePath(); }, '#1C1917', sx - 22, sy - 70, 44, 70, 1.4);
  // (the jacket's lapels, a white tee under it, the zip)
  part(g, () => { g.moveTo(sx - 8, sy - 62); g.lineTo(sx + 8, sy - 62); g.lineTo(sx + 4, sy - 30); g.lineTo(sx - 4, sy - 30); g.closePath(); }, '#F8FAFC', sx - 8, sy - 62, 16, 32, 1);
  px(g, sx - 14, sy - 58, 3, 40, '#3A3A3A'); px(g, sx + 11, sy - 58, 3, 40, '#3A3A3A');
  const hb = { ...B, hx: sx + 2, hy: sy - 80 };
  ball(g, sx - 2, sy - 90, 19, '#141414', 1.2); ball(g, sx + 8, sy - 94, 12, '#141414', 1); px(g, sx - 10, sy - 104, 8, 2, '#3A3A3A');
  headShape(g, hb, B.L.skin);
  faceOn(g, hb, { skin: B.L.skin, eyes: 'smug', mouth: 'o' });
  part(g, () => g.roundRect(hb.hx - 5, hb.hy - 4, 17, 5, 2), '#0B0B0B', hb.hx - 5, hb.hy - 4, 17, 5, 0.9); px(g, hb.hx - 3, hb.hy - 3, 3, 1, '#7A7A9A');
  g.strokeStyle = '#E5B53A'; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy - 62, 9, 0.3, Math.PI - 0.3); g.stroke();
  px(g, sx - 2, sy - 54, 4, 4, '#F2C84A');
  g.strokeStyle = SINK; g.lineWidth = 2.4; g.beginPath(); g.arc(hb.hx, hb.hy - 2, 11, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  part(g, () => g.roundRect(hb.hx - 13, hb.hy - 5, 6, 10, 2), '#27272A', hb.hx - 13, hb.hy - 5, 6, 10, 1);
  // (the mic on its boom, the pop filter in front; the script on its stand: MEOW. TAKE 40)
  limb(g, sx + 44, sy - 90, sx + 44, sy, 2.2, '#71717A'); limb(g, sx + 44, sy - 96, sx + 32, sy - 96, 2, '#71717A');
  part(g, () => g.roundRect(sx + 24, sy - 104, 10, 18, 4), '#3F3F46', sx + 24, sy - 104, 10, 18, 1);
  for (let k = 0; k < 4; k++) px(g, sx + 26, sy - 101 + k * 3, 6, 1, '#71717A');
  g.fillStyle = 'rgba(40,40,46,0.5)'; g.beginPath(); g.arc(sx + 18, sy - 94, 9, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#A1A1AA'; g.lineWidth = 1.4; g.beginPath(); g.arc(sx + 18, sy - 94, 9, 0, Math.PI * 2); g.stroke();
  limb(g, sx + 84, sy - 60, sx + 84, sy, 2, '#71717A');
  slab(g, sx + 62, sy - 94, 44, 34, PAPER);
};

/** A sleeping Z over somebody (live): drifting up, three of them. */
export const zees = (c: Ctx, x: number, y: number, f: number) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 40) % 120) / 120, zx = x + t * 14 + i * 2, zy = y - t * 30;
    c.globalAlpha = 1 - t; box(c, zx, zy, 5, 1, '#F6F4EC'); box(c, zx + 3, zy + 1, 1, 1, '#F6F4EC'); box(c, zx + 2, zy + 2, 1, 1, '#F6F4EC'); box(c, zx + 1, zy + 3, 1, 1, '#F6F4EC'); box(c, zx, zy + 4, 5, 1, '#F6F4EC');
  }
  c.globalAlpha = 1;
};

/** Steam off a noodle cup or a coffee (live). */
export const steam = (c: Ctx, x: number, y: number, f: number, k = 0) => {
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 23 + k * 11) % 70) / 70;
    c.fillStyle = `rgba(240,240,248,${(0.4 * (1 - t)).toFixed(2)})`;
    c.fillRect(Math.round(x + Math.sin(t * 6 + i + k) * 3), Math.round(y - t * 22), 2, 2);
  }
};
