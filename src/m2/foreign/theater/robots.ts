// The animatronics, drawn (the first pass: crude but readable). Clearly machines doing a show: plastic faces with LED
// eyes, panel seams, servos at every joint, paint chipped to the metal; they move in steps (their poses tick over every
// few frames, with the odd twitch), flash white when they're hit, and when they're done they seize, fall over and lie
// in a spreading pool of red hydraulic fluid, sparking.

import type { Member } from './state';
import { FY } from './layout';

type Ctx = CanvasRenderingContext2D;
const INK = '#1C1014';

const bx = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ink = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { bx(c, x - 1, y - 1, w + 2, h + 2, INK); bx(c, x, y, w, h, col); };
const disc = (c: Ctx, x: number, y: number, r: number, col: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, pts: number[][], col: string, outline = true) => {
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
  c.fillStyle = col; c.fill(); if (outline) { c.strokeStyle = INK; c.lineWidth = 1; c.stroke(); }
};
const limb = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string) => {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
};
/** A servo at a joint: a steel disc, its hub, a bolt. */
const servo = (c: Ctx, x: number, y: number, r = 3.5) => { disc(c, x, y, r + 1, INK); disc(c, x, y, r, '#9CA3AF'); disc(c, x, y, r * 0.45, '#374151'); bx(c, x - r * 0.6, y - r * 0.7, 1, 1, '#E5E7EB'); };
/** A panel seam (dark), and a chip down to the metal. */
const seam = (c: Ctx, x: number, y: number, w: number, h: number) => bx(c, x, y, w, h, 'rgba(20, 10, 14, 0.55)');
const chip = (c: Ctx, x: number, y: number) => { bx(c, x, y, 3, 2, '#9CA3AF'); bx(c, x, y, 3, 1, '#D1D5DB'); };
/** LED eyes (a glow when it's about to do something). */
const leds = (c: Ctx, x: number, y: number, gap: number, col: string, hot = false) => {
  if (hot) { c.fillStyle = 'rgba(248, 113, 113, 0.35)'; c.beginPath(); c.arc(x + gap / 2, y, gap + 4, 0, Math.PI * 2); c.fill(); }
  bx(c, x - 1, y - 1, 3, 3, hot ? '#FEE2E2' : col); bx(c, x + gap - 1, y - 1, 3, 3, hot ? '#FEE2E2' : col);
};
/** A plastic face (a mask with its jaw on a hinge). */
const face = (c: Ctx, x: number, y: number, r: number, skin: string, eye = '#111827', hot = false, jaw = 0) => {
  disc(c, x, y, r + 1, INK); disc(c, x, y, r, skin);
  bx(c, x - r * 0.2, y - r, 1, r * 2, 'rgba(20, 10, 14, 0.3)');
  leds(c, x + 1, y - 2, 5, eye, hot);
  bx(c, x + 1, y + r * 0.45 + jaw, 6, 2, INK);
};

/** The pose clock: ticks over every 4 frames (they move like the machines they are), with a twitch now and then. */
const tick = (f: number, seed: number) => Math.floor(f / 4) + (((Math.floor(f / 4) * 7 + seed) % 23) === 0 ? 1 : 0);

export const drawMember = (c: Ctx, m: Member, f: number) => {
  c.save();
  c.translate(Math.round(m.x), Math.round(m.y));
  if (m.dead) {
    // (seized, over on its back, in its own fluid)
    const k = Math.min(1, m.deadT / 14), pool = Math.min(1, m.deadT / 120);
    c.fillStyle = 'rgba(127, 29, 29, 0.85)'; c.beginPath(); c.ellipse(0, (FY - m.y) - 1, 14 + m.w * 0.55 * pool, 3 + 3 * pool, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(220, 38, 38, 0.6)'; c.beginPath(); c.ellipse(-4, (FY - m.y) - 2, 8 + m.w * 0.3 * pool, 2 + pool, 0, 0, Math.PI * 2); c.fill();
    if (m.type !== 'windmill' && m.type !== 'sphinx' && m.type !== 'float') c.rotate(-m.f * k * (Math.PI / 2) * (m.h > m.w ? 1 : 0.15));
    c.filter = 'brightness(0.55) saturate(0.6)';
  } else if (m.flash > 0) c.filter = 'brightness(2.3)';
  if (m.type !== 'windmill') c.scale(m.f, 1);
  const t = m.dead ? 0 : tick(f, m.seed), hot = m.st === 'tell' || m.st === 'paw' || m.st === 'charge' || m.st === 'lean' || m.st === 'jabtell';
  switch (m.type) {
    case 'bull': drawBull(c, m, t, hot); break;
    case 'matador': drawMatador(c, m, t); break;
    case 'dancer': drawDancer(c, m, t); break;
    case 'leprechaun': drawLeprechaun(c, m, t); break;
    case 'mummy': drawMummy(c, m, t); break;
    case 'sphinx': drawSphinx(c, m, t); break;
    case 'bear': drawBear(c, m, t, f); break;
    case 'cossack': drawCossack(c, m, t); break;
    case 'windmill': drawWindmill(c, m); break;
    case 'maid': drawMaid(c, m, t); break;
    case 'kangaroo': drawKangaroo(c, m, t); break;
    case 'croc': drawCroc(c, m, t); break;
    case 'wrangler': drawWrangler(c, m, t); break;
    case 'minotaur': drawMinotaur(c, m, t, hot); break;
    case 'hoplite': drawHoplite(c, m, t); break;
    case 'samba': drawSamba(c, m, t); break;
    case 'float': drawFloat(c, m, t); break;
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

const drawBull = (c: Ctx, m: Member, t: number, hot: boolean) => {
  const run = m.st === 'charge' || (m.st === 'idle' && Math.abs(m.vx) > 0.3), step = run ? (t % 2) * 6 - 3 : 0, low = m.st === 'charge' || m.st === 'paw' ? 6 : 0;
  // (legs: the near pair over the far, stepping)
  for (const [lx, s] of [[-40, 1], [28, -1]] as const) { limb(c, lx + 4, -30, lx + 4 - step * s, -2, 7, '#1F1410'); }
  bx(c, -60, -24, 8, 4, '#1F1410');
  limb(c, -56, -58, -70, -40 + (t % 3) * 2, 3, '#1F1410');
  ink(c, -54, -72 + low / 2, 104, 44, '#2B1B14');
  bx(c, -54, -72 + low / 2, 104, 6, '#3F2A1E');
  seam(c, -10, -72 + low / 2, 2, 44); seam(c, 22, -72 + low / 2, 2, 44); chip(c, -30, -50); chip(c, 34, -40);
  servo(c, -40, -36); servo(c, 30, -36); servo(c, 44, -62 + low);
  for (const [lx, s] of [[-34, -1], [34, 1]] as const) { limb(c, lx, -30, lx + step * s, -2, 8, '#2B1B14'); bx(c, lx + step * s - 5, -4, 10, 4, '#111'); }
  // (the head, down for the charge; the horns)
  c.save(); c.translate(52, -60 + low); c.rotate(low ? 0.35 : 0.1);
  ink(c, -6, -14, 34, 28, '#2B1B14'); bx(c, 18, -2, 10, 10, '#3F2A1E');
  leds(c, 10, -6, 6, '#7F1D1D', hot);
  poly(c, [[2, -14], [-4, -30], [6, -36], [10, -18]], '#F5F5DC'); poly(c, [[14, -14], [18, -32], [28, -36], [22, -16]], '#F5F5DC');
  bx(c, 24, 6, 3, 3, '#9CA3AF');
  c.restore();
  // (the banderillas' ribbons on its back: the show's)
  bx(c, -6, -82 + low / 2, 2, 12, '#FDE047'); bx(c, 4, -84 + low / 2, 2, 14, '#DC2626');
};

const drawMatador = (c: Ctx, m: Member, t: number) => {
  const thrust = m.st === 'thrust', tell = m.st === 'tell', walk = Math.abs(m.vx) > 0.3, st = walk ? (t % 2) * 4 - 2 : 0;
  limb(c, -5, -38, -6 - st, -2, 6, '#F9A8D4'); limb(c, 5, -38, 6 + st, -2, 6, '#F9A8D4');
  bx(c, -9, -4, 7, 4, '#111'); bx(c, 3, -4, 7, 4, '#111');
  // (the suit of lights)
  ink(c, -10, -66, 20, 30, '#0F766E'); bx(c, -10, -66, 3, 30, '#FCD34D'); bx(c, 7, -66, 3, 30, '#FCD34D'); bx(c, -10, -42, 20, 3, '#FCD34D');
  seam(c, -1, -66, 1, 30); servo(c, -9, -62, 3); servo(c, 9, -62, 3);
  // (the cape in the far hand: a flourish)
  const cs = (t % 4) - 2;
  poly(c, [[-10, -60], [-34 + cs * 3, -54], [-38 + cs * 2, -16], [-14, -22]], '#DC2626');
  face(c, 0, -76, 9, '#FDE4CF');
  bx(c, -10, -88, 20, 6, '#111'); disc(c, -9, -85, 4, '#111'); disc(c, 9, -85, 4, '#111');
  // (the sword: back for the tell, out for the thrust)
  const hx = thrust ? 22 : tell ? -6 : 12, hy = thrust ? -56 : tell ? -74 : -46;
  limb(c, 8, -62, hx, hy, 4, '#0F766E'); servo(c, (8 + hx) / 2, (-62 + hy) / 2, 2.5);
  const tip = thrust ? 74 : tell ? 10 : 36, ty = thrust ? -56 : tell ? -96 : -34;
  limb(c, hx, hy, hx + tip * (thrust ? 1 : tell ? 0.4 : 0.6), ty, 2, '#E5E7EB');
  if (tell) bx(c, hx + 2, -98, 3, 3, '#FFFFFF');
};

const drawDancer = (c: Ctx, m: Member, t: number) => {
  const kick = m.st === 'kick', stomp = m.st === 'stomp', st = (t + m.k) % 2;
  // (legs: everything's in them; arms dead straight at the sides)
  if (kick) { limb(c, -3, -40, -4, -2, 5, '#F5F5F4'); limb(c, 3, -40, 40, -52, 5, '#F5F5F4'); bx(c, 38, -56, 8, 5, '#111'); }
  else { const a = stomp ? st * 8 : st * 4; limb(c, -3, -40, -4, -2 - a, 5, '#F5F5F4'); limb(c, 3, -40, 4, -2 - (4 - a / 2), 5, '#F5F5F4'); }
  bx(c, -7, -4, 6, 4, '#111'); if (!kick) bx(c, 1, -4, 6, 4, '#111');
  // (the dress: embroidered, stiff)
  poly(c, [[-9, -66], [9, -66], [14, -38], [-14, -38]], '#15803D');
  bx(c, -8, -60, 16, 2, '#FCD34D'); bx(c, -12, -42, 24, 2, '#FCD34D'); bx(c, -3, -56, 6, 6, '#F8FAFC');
  seam(c, 0, -66, 1, 28);
  limb(c, -9, -64, -10, -38, 3, '#15803D'); limb(c, 9, -64, 10, -38, 3, '#15803D'); servo(c, -9, -63, 2.5); servo(c, 9, -63, 2.5);
  face(c, 0, -74, 8, '#FDE4CF');
  // (the curly wig)
  for (let k = 0; k < 6; k++) disc(c, -8 + k * 3, -82 + (k % 2) * 2, 3.5, m.k % 2 ? '#B45309' : '#7C2D12');
  for (let k = 0; k < 3; k++) disc(c, -10, -76 + k * 5, 3, m.k % 2 ? '#B45309' : '#7C2D12');
};

const drawLeprechaun = (c: Ctx, m: Member, t: number) => {
  // (the pot of gold under him)
  ink(c, -16, 4, 32, 26, '#1F2937'); bx(c, -18, 2, 36, 4, '#111827'); for (let k = 0; k < 5; k++) disc(c, -12 + k * 6, 2 - (k % 2) * 2, 3, '#FCD34D');
  const throwing = m.st === 'tell';
  limb(c, -3, -18, -6, -1, 4, '#166534'); limb(c, 3, -18, 6, -1, 4, '#166534'); bx(c, -9, -3, 6, 3, '#111'); bx(c, 4, -3, 6, 3, '#111');
  ink(c, -8, -34, 16, 18, '#16A34A'); bx(c, -8, -22, 16, 3, '#111'); bx(c, -2, -22, 4, 3, '#FCD34D');
  servo(c, -7, -31, 2); servo(c, 7, -31, 2);
  limb(c, 7, -30, throwing ? (t % 2 ? 14 : -4) : 12, throwing ? -46 : -22, 3, '#16A34A');
  face(c, 0, -40, 7, '#FDE4CF');
  poly(c, [[-6, -38], [8, -38], [4, -28], [-2, -28]], '#EA580C');
  bx(c, -9, -50, 18, 3, '#14532D'); ink(c, -6, -64, 12, 14, '#15803D'); bx(c, -6, -54, 12, 3, '#111'); bx(c, -2, -55, 4, 4, '#FCD34D');
};

const drawMummy = (c: Ctx, m: Member, t: number) => {
  const walk = Math.abs(m.vx) > 0.3, st = walk ? (t % 2) * 5 - 2 : 0;
  limb(c, -6, -42, -7 - st, -2, 8, '#E7DCC0'); limb(c, 6, -42, 7 + st, -2, 8, '#E7DCC0');
  ink(c, -14, -72, 28, 34, '#E7DCC0');
  for (let k = 0; k < 6; k++) bx(c, -14, -70 + k * 6, 28, 1, '#A8987A');
  bx(c, -14, -50, 28, 2, '#FCD34D'); chip(c, 6, -64);
  // (the bandage arm out for the lash, both arms out shambling)
  const lash = m.st === 'lash', tell = m.st === 'tell';
  limb(c, 10, -66, tell ? -8 : 30, tell ? -84 : -60, 6, '#E7DCC0'); servo(c, 10, -66, 3);
  limb(c, -8, -66, 24, -58, 5, '#D6C9A8');
  if (lash && m.a > 0) { c.strokeStyle = '#E7DCC0'; c.lineWidth = 4; c.beginPath(); c.moveTo(28, -60); for (let k = 0; k <= 8; k++) c.lineTo(28 + (m.a * k) / 8, -56 + Math.sin(k * 1.4 + t) * 4); c.stroke(); bx(c, 26 + m.a, -60, 8, 6, '#A8987A'); }
  // (the pharaoh's headdress, striped)
  poly(c, [[-14, -78], [14, -78], [18, -60], [10, -66], [-10, -66], [-18, -60]], '#1D4ED8');
  for (let k = 0; k < 4; k++) bx(c, -14 + k * 8, -78, 3, 14, '#FCD34D');
  disc(c, 0, -84, 11, '#E7DCC0'); disc(c, 0, -84, 10, '#E7DCC0'); bx(c, -10, -88, 20, 1, '#A8987A'); bx(c, -10, -82, 20, 1, '#A8987A');
  leds(c, 1, -85, 5, '#16A34A', tell);
  bx(c, -12, -96, 24, 8, '#1D4ED8'); bx(c, -2, -100, 4, 6, '#FCD34D');
};

const drawSphinx = (c: Ctx, m: Member, t: number) => {
  const stone = '#D6B370', sh = '#A88A4E', hot = m.st === 'charge' || m.st === 'fire';
  // (the lion body lying down, the paws out front)
  ink(c, -82, -44, 120, 44, stone); bx(c, -82, -10, 120, 10, sh);
  ink(c, 30, -16, 52, 16, stone); seam(c, 54, -16, 1, 16); for (let k = 0; k < 3; k++) bx(c, 72 + k * 3, -6, 1, 6, sh);
  limb(c, -86, -30, -100, -10 + (t % 3), 4, stone);
  seam(c, -40, -44, 1, 44); seam(c, 0, -44, 1, 44); chip(c, -60, -30); chip(c, 10, -20);
  // (the head: the headdress, the face, the eyes)
  poly(c, [[24, -48], [62, -48], [66, -86], [44, -108], [20, -86]], '#1D4ED8');
  for (let k = 0; k < 5; k++) bx(c, 22 + k * 9, -86, 3, 38, '#FCD34D');
  ink(c, 32, -98, 26, 30, stone); bx(c, 32, -98, 3, 30, sh);
  servo(c, 44, -48, 4);
  if (hot) { c.fillStyle = `rgba(248, 113, 113, ${0.25 + 0.2 * (t % 2)})`; c.beginPath(); c.arc(48, -100, 16, 0, Math.PI * 2); c.fill(); }
  bx(c, 40, -94, 4, 3, hot ? '#FEE2E2' : '#7F1D1D'); bx(c, 50, -94, 4, 3, hot ? '#FEE2E2' : '#7F1D1D');
  bx(c, 42, -80, 10, 2, sh); bx(c, 40, -72, 14, 4, '#78350F');
};

const drawBear = (c: Ctx, m: Member, t: number, f: number) => {
  const wob = Math.sin(f * 0.15) * 0.08 + (t % 5 === 0 ? 0.04 : 0);
  // (the unicycle: the wheel turning, the post)
  const r = 22, sp = (m.x * 0.08) % (Math.PI * 2);
  disc(c, 0, -r, r + 1, INK); disc(c, 0, -r, r, '#374151'); disc(c, 0, -r, r - 4, '#9CA3AF');
  for (let k = 0; k < 4; k++) { const a = sp + (k * Math.PI) / 4; limb(c, Math.cos(a) * (r - 4), -r + Math.sin(a) * (r - 4), -Math.cos(a) * (r - 4), -r - Math.sin(a) * (r - 4), 1, '#4B5563'); }
  limb(c, 0, -r, 0, -52, 3, '#9CA3AF');
  c.save(); c.translate(0, -52); c.rotate(wob);
  const ped = Math.sin(sp) * 8;
  limb(c, -6, -6, -4 + ped, 26, 8, '#5B3A1E'); limb(c, 6, -6, 4 - ped, 26, 8, '#5B3A1E');
  ink(c, -20, -50, 40, 46, '#6B4423'); bx(c, -12, -40, 24, 30, '#8B5E34');
  seam(c, -1, -50, 2, 46); servo(c, -18, -44); servo(c, 18, -44);
  // (arms out for the balance, flapping in steps)
  const flap = (t % 4) * 4;
  limb(c, -18, -44, -36, -50 - flap, 7, '#6B4423'); limb(c, 18, -44, 36, -38 + flap, 7, '#6B4423');
  disc(c, 2, -60, 14, INK); disc(c, 2, -60, 13, '#6B4423'); disc(c, 14, -56, 6, '#8B5E34'); bx(c, 17, -58, 3, 3, INK);
  disc(c, -8, -72, 4, '#6B4423'); disc(c, 10, -72, 4, '#6B4423');
  leds(c, 2, -64, 6, '#111827');
  // (the hat: an ushanka)
  ink(c, -12, -80, 26, 8, '#3F3F46'); bx(c, -14, -74, 6, 10, '#52525B'); bx(c, 12, -74, 6, 10, '#52525B'); bx(c, -2, -79, 4, 4, '#DC2626');
  c.restore();
};

const drawCossack = (c: Ctx, m: Member, t: number) => {
  const leap = m.st === 'leap', tell = m.st === 'tell', st = t % 2;
  if (leap) { limb(c, -4, -30, -30, -24, 6, '#111827'); limb(c, 4, -30, 34, -26, 6, '#111827'); bx(c, -36, -28, 8, 6, '#111'); bx(c, 32, -30, 8, 6, '#111'); }
  else if (tell) { limb(c, -4, -30, -6, -2, 6, '#111827'); limb(c, 4, -30, 6, -2, 6, '#111827'); }
  else {
    // (the squat kick: down on his heels, one leg out, then the other)
    limb(c, -6, -26, -10, -6, 7, '#111827'); bx(c, -14, -8, 10, 8, '#111');
    limb(c, 6, -26, st ? 26 : 10, st ? -10 : -6, 7, '#111827'); bx(c, st ? 22 : 6, st ? -14 : -8, 10, 8, '#111');
  }
  const up = tell || leap ? -14 : 0;
  ink(c, -12, -54 + up, 24, 28, '#B91C1C'); bx(c, -12, -32 + up, 24, 3, '#FCD34D'); seam(c, -1, -54 + up, 1, 28);
  // (arms crossed, high)
  limb(c, -11, -48 + up, 10, -44 + up, 5, '#B91C1C'); limb(c, 11, -48 + up, -10, -42 + up, 5, '#991B1B'); servo(c, -11, -50 + up, 2.5); servo(c, 11, -50 + up, 2.5);
  face(c, 0, -62 + up, 8, '#FDE4CF');
  bx(c, -6, -58 + up, 12, 2, '#1C1917');
  ink(c, -9, -80 + up, 18, 12, '#111827'); for (let k = 0; k < 4; k++) bx(c, -8 + k * 5, -80 + up, 2, 12, '#27272A');
};

const drawWindmill = (c: Ctx, m: Member) => {
  // (the tower: tapered, boarded, a door and a window; the cap; the sails round the hub)
  poly(c, [[-50, 0], [50, 0], [34, -200], [-34, -200]], '#7C2D12');
  for (let k = 0; k < 8; k++) bx(c, -46 + k * 3, -k * 25 - 3, 92 - k * 6, 1, '#5C1F0C');
  ink(c, -12, -44, 24, 44, '#3F2A1E'); bx(c, -8, -150, 16, 16, '#1C1917'); bx(c, -7, -149, 14, 14, '#FDE68A');
  poly(c, [[-40, -200], [40, -200], [24, -230], [-24, -230]], '#1C1917');
  seam(c, 0, -200, 1, 200); servo(c, -30, -100, 4); servo(c, 30, -100, 4);
  // (hydraulic lines down its side: the show's)
  bx(c, 28, -196, 2, 190, '#4B5563');
  const hx = 0, hy = -210, r = 175;
  for (let b = 0; b < 4; b++) {
    const a = m.a + (b * Math.PI) / 2, cx = Math.cos(a), sy = Math.sin(a), nx = -sy, ny = cx;
    limb(c, hx, hy, hx + cx * r, hy + sy * r, 4, '#57534E');
    // (the sail: a lattice frame along the outer two thirds)
    const p0 = [hx + cx * r * 0.32, hy + sy * r * 0.32], p1 = [hx + cx * r, hy + sy * r];
    poly(c, [p0, p1, [p1[0] + nx * 22, p1[1] + ny * 22], [p0[0] + nx * 22, p0[1] + ny * 22]], 'rgba(245, 245, 244, 0.85)');
    for (let k = 1; k < 5; k++) { const q = 0.32 + (0.68 * k) / 5; limb(c, hx + cx * r * q, hy + sy * r * q, hx + cx * r * q + nx * 22, hy + sy * r * q + ny * 22, 1, '#78716C'); }
  }
  disc(c, hx, hy, 9, INK); disc(c, hx, hy, 8, '#9CA3AF'); disc(c, hx, hy, 3, '#374151');
};

const drawMaid = (c: Ctx, m: Member, t: number) => {
  const st = t % 2, tell = m.st === 'tell';
  limb(c, -4, -36, -5, -6, 5, '#FDE4CF'); limb(c, 4, -36, 5, -6 - st * 3, 5, '#FDE4CF');
  // (the clogs)
  ink(c, -11, -7, 10, 7, '#D97706'); ink(c, 1, -7 - st * 3, 10, 7, '#D97706');
  poly(c, [[-10, -62], [10, -62], [16, -30], [-16, -30]], '#1D4ED8');
  bx(c, -8, -56, 16, 24, '#F8FAFC'); seam(c, 0, -62, 1, 32);
  limb(c, -9, -60, -12, -38, 4, '#1D4ED8'); servo(c, -9, -60, 2.5); servo(c, 9, -60, 2.5);
  limb(c, 9, -60, tell ? 2 : 14, tell ? -84 : -42, 4, '#1D4ED8');
  if (tell) ink(c, -4, -92, 12, 8, '#D97706');
  face(c, 0, -70, 8, '#FDE4CF');
  // (the winged bonnet, the braids)
  poly(c, [[-12, -74], [12, -74], [18, -84], [0, -82], [-18, -84]], '#F8FAFC');
  limb(c, -8, -68, -10, -52, 3, '#FCD34D'); limb(c, 8, -68, 10, -52, 3, '#FCD34D');
};

const drawKangaroo = (c: Ctx, m: Member, t: number) => {
  const lean = m.st === 'lean', kick = m.st === 'kick', jab = m.st === 'jab', air = m.vy !== 0;
  const body = '#B45309', light = '#D6A15E';
  // (the tail, the big feet)
  limb(c, -12, -24, lean || kick ? -44 : -40, -2, 8, body);
  if (kick) { limb(c, -2, -40, 40, -34, 8, body); limb(c, 2, -36, 44, -26, 8, body); bx(c, 40, -40, 12, 6, '#7C2D12'); }
  else { const k = air ? -10 : 0; limb(c, -4, -36, -8, -4 + k, 9, body); limb(c, 4, -34, 14, -4 + k, 9, body); bx(c, 8, -6 + k, 18, 6, '#7C2D12'); }
  c.save(); c.translate(0, -40); c.rotate(lean ? -0.35 : kick ? -0.5 : 0);
  ink(c, -12, -46, 26, 46, body); bx(c, -6, -38, 14, 34, light); seam(c, 0, -46, 1, 46); servo(c, -10, -40); servo(c, 12, -40);
  // (the gloves: up, out for a jab)
  const j = jab ? (t % 2 ? 26 : 8) : 0;
  limb(c, 10, -40, 20 + j, -36, 5, body); ink(c, 18 + j, -42, 12, 12, '#DC2626');
  limb(c, -8, -40, 8, -30, 5, body); ink(c, 6, -36, 11, 11, '#B91C1C');
  // (the head: long, ears up)
  ink(c, 2, -64, 22, 16, body); bx(c, 20, -58, 6, 6, light); bx(c, 23, -58, 3, 2, INK);
  poly(c, [[4, -64], [0, -82], [8, -66]], body); poly(c, [[10, -64], [10, -84], [16, -66]], body);
  leds(c, 12, -59, 5, '#111827', lean);
  c.restore();
};

const drawCroc = (c: Ctx, m: Member, t: number) => {
  const tell = m.st === 'tell', snap = m.st === 'snap', open = tell ? 0.55 + 0.08 * (t % 2) : snap && m.t < 6 ? 0.3 : 0.05;
  const green = '#3F6212', dark = '#1A2E05';
  // (the tail back to the wrangler, the body, the legs out the sides)
  poly(c, [[-65, -14], [-20, -24], [-20, -4], [-65, -8]], green);
  ink(c, -22, -28, 70, 24, green);
  for (let k = 0; k < 8; k++) poly(c, [[-56 + k * 12, -22 + (k < 4 ? 4 : 0)], [-50 + k * 12, -30 + (k < 4 ? 4 : 0)], [-44 + k * 12, -22 + (k < 4 ? 4 : 0)]], dark, false);
  for (const lx of [-12, 30]) { limb(c, lx, -8, lx - 4 + (t % 2) * 4, 0, 5, green); }
  seam(c, 10, -28, 1, 24); servo(c, 40, -16, 3.5);
  // (the jaws: the upper on its hinge)
  ink(c, 44, -12, 22, 8, green); for (let k = 0; k < 4; k++) bx(c, 46 + k * 5, -14, 2, 3, '#F8FAFC');
  c.save(); c.translate(44, -12); c.rotate(-open);
  ink(c, 0, -10, 24, 10, green); for (let k = 0; k < 4; k++) bx(c, 2 + k * 5, 0, 2, 3, '#F8FAFC');
  leds(c, 4, -7, 5, '#FDE047', tell);
  c.restore();
};

const drawWrangler = (c: Ctx, m: Member, t: number) => {
  const tell = m.st === 'tell', walk = Math.abs(m.vx) > 0.3, st = walk ? (t % 2) * 4 - 2 : 0;
  limb(c, -4, -36, -5 - st, -2, 6, '#D6A15E'); limb(c, 4, -36, 5 + st, -2, 6, '#D6A15E');
  bx(c, -9, -4, 7, 4, '#3F2A1E'); bx(c, 3, -4, 7, 4, '#3F2A1E');
  ink(c, -8, -40, 16, 8, '#A16207');
  ink(c, -10, -66, 20, 28, '#CA8A04'); bx(c, -2, -66, 4, 28, '#A16207'); seam(c, -10, -52, 20, 1);
  servo(c, -9, -62, 2.5); servo(c, 9, -62, 2.5);
  // (both hands on the croc's tail, low in front; or the boomerang back over the shoulder)
  if (tell) { limb(c, 9, -62, -2, -82, 4, '#CA8A04'); poly(c, [[-8, -92], [4, -86], [-4, -80]], '#92400E'); }
  else { limb(c, 9, -62, 24, -44, 4, '#CA8A04'); limb(c, -9, -62, 20, -40, 4, '#A16207'); }
  face(c, 0, -74, 8, '#FDE4CF');
  // (the bush hat, its brim turned up one side)
  bx(c, -15, -82, 30, 3, '#78350F'); ink(c, -8, -90, 16, 8, '#92400E'); bx(c, 10, -88, 5, 6, '#78350F');
};

const drawMinotaur = (c: Ctx, m: Member, t: number, hot: boolean) => {
  const run = m.st === 'charge', walk = Math.abs(m.vx) > 0.3, st = walk || run ? (t % 2) * 6 - 3 : 0, chop = m.st === 'chop', tell = m.st === 'tell';
  const hide = '#7C2D12', skin = '#A16207';
  limb(c, -8, -50, -10 - st, -6, 11, hide); limb(c, 8, -50, 10 + st, -6, 11, hide);
  bx(c, -16, -6, 12, 6, '#1C1917'); bx(c, 4, -6, 12, 6, '#1C1917');
  ink(c, -14, -56, 28, 14, '#57534E');
  ink(c, -20, -92, 40, 38, skin); bx(c, -12, -84, 10, 10, '#B45309'); bx(c, 2, -84, 10, 10, '#B45309');
  seam(c, -1, -92, 1, 38); servo(c, -18, -88, 4); servo(c, 18, -88, 4); chip(c, 8, -70);
  // (the double axe: high for the tell, down in front for the chop)
  const ax = chop ? 46 : tell ? -6 : 22, ay = chop ? -20 : tell ? -136 : -70;
  limb(c, 16, -86, ax * 0.6, (ay - 86) / 2, 7, skin);
  limb(c, ax * 0.6, (ay - 86) / 2, ax, ay, 3, '#78350F');
  c.save(); c.translate(ax, ay);
  poly(c, [[-14, -10], [0, -2], [14, -10], [14, 10], [0, 2], [-14, 10]], '#D1D5DB');
  c.restore();
  // (the bull head, down for the charge)
  const low = run || m.st === 'paw' ? 8 : 0;
  ink(c, -6, -112 + low, 30, 22, hide); bx(c, 18, -102 + low, 10, 10, '#92400E'); bx(c, 24, -100 + low, 2, 2, INK);
  poly(c, [[-4, -110 + low], [-16, -126 + low], [-6, -130 + low], [2, -112 + low]], '#F5F5DC');
  poly(c, [[14, -110 + low], [18, -128 + low], [28, -130 + low], [22, -110 + low]], '#F5F5DC');
  leds(c, 6, -104 + low, 7, '#7F1D1D', hot);
};

const drawHoplite = (c: Ctx, m: Member, t: number) => {
  const thrust = m.st === 'thrust', tell = m.st === 'tell', st = (t + m.k) % 2;
  limb(c, -4, -38, -6, -2, 6, '#FDE4CF'); limb(c, 4, -38, 6, -2 - st * 2, 6, '#FDE4CF');
  bx(c, -9, -4, 7, 4, '#78350F'); bx(c, 3, -4, 7, 4, '#78350F');
  poly(c, [[-10, -66], [-24, -60], [-26, -20], [-10, -30]], '#B91C1C');
  ink(c, -10, -66, 20, 26, '#B45309'); for (let k = 0; k < 4; k++) bx(c, -10 + k * 5, -42, 3, 6, '#78350F');
  servo(c, -9, -62, 2.5);
  face(c, 0, -74, 8, '#FDE4CF');
  // (the bronze helmet, the crest)
  ink(c, -9, -86, 18, 14, '#CA8A04'); bx(c, 4, -80, 5, 8, '#1C1917');
  poly(c, [[-12, -86], [-8, -100], [10, -100], [12, -86]], '#DC2626');
  // (the spear over the shield: drawn back for the tell, out for the thrust)
  const sx = thrust ? 30 : tell ? -14 : 6;
  limb(c, sx - 30, -66, sx + 50, -64, 2, '#78350F'); poly(c, [[sx + 50, -68], [sx + 62, -64], [sx + 50, -60]], '#D1D5DB');
  // (the round shield out in front)
  disc(c, 14, -48, 21, INK); disc(c, 14, -48, 20, '#CA8A04'); disc(c, 14, -48, 15, '#A16207');
  poly(c, [[8, -38], [14, -58], [20, -38]], '#B91C1C', false);
};

const drawSamba = (c: Ctx, m: Member, t: number) => {
  const spin = m.st === 'spin', tell = m.st === 'tell', sway = spin ? 0 : ((t + m.k) % 4) - 1.5;
  const cols = [['#DB2777', '#FDE047'], ['#16A34A', '#F97316'], ['#7C3AED', '#22D3EE']][m.k % 3];
  // (the feather backpiece: a fan; whipping round on the spin)
  const n = 9, spr = spin ? Math.cos(m.t * 0.5) : 1;
  for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + ((k - (n - 1) / 2) / n) * 2.4 * spr; limb(c, 0, -60, Math.cos(a) * 46, -60 + Math.sin(a) * 46, 4, k % 2 ? cols[0] : cols[1]); }
  limb(c, -4, -40, -5 + sway, -2, 5, '#C08457'); limb(c, 4, -40, 5 + sway, -2, 5, '#C08457');
  bx(c, -8, -4, 6, 4, '#FDE047'); bx(c, 2, -4, 6, 4, '#FDE047');
  ink(c, -9 + sway, -48, 18, 8, cols[0]); for (let k = 0; k < 4; k++) bx(c, -8 + sway + k * 4, -40, 2, 6, cols[1]);
  bx(c, -7 + sway, -64, 14, 16, '#C08457'); ink(c, -8 + sway, -64, 16, 6, cols[0]);
  seam(c, sway, -58, 1, 10); servo(c, -8 + sway, -62, 2.5); servo(c, 8 + sway, -62, 2.5);
  const up = tell || spin;
  limb(c, -8 + sway, -62, up ? -20 : -14, up ? -86 : -46, 3, '#C08457'); limb(c, 8 + sway, -62, up ? 20 : 14, up ? -86 : -46, 3, '#C08457');
  face(c, sway, -72, 8, '#C08457');
  // (the headdress)
  for (let k = 0; k < 5; k++) limb(c, sway, -80, sway + (k - 2) * 7, -100 - Math.abs(2 - k) * -3, 3, k % 2 ? cols[1] : cols[0]);
  bx(c, -8 + sway, -82, 16, 4, '#FDE047');
};

const drawFloat = (c: Ctx, m: Member, t: number) => {
  const W = m.w / 2, tell = m.st === 'tell', peck = m.st === 'peck';
  // (the wheels, the skirt (fringe: it's what runs you over), the deck)
  for (const wx of [-W + 26, W - 26]) { disc(c, wx, -14, 15, INK); disc(c, wx, -14, 14, '#374151'); disc(c, wx, -14, 5, '#9CA3AF'); }
  ink(c, -W, -50, m.w, 24, '#F59E0B'); for (let k = 0; k < m.w / 8; k++) bx(c, -W + k * 8, -28, 4, 8 + (k + t) % 2 * 2, ['#DB2777', '#16A34A', '#2563EB'][k % 3]);
  bx(c, -W, -50, m.w, 4, '#FDE047');
  // (the parrot: the body up on the deck, the wings, the tail down the back)
  poly(c, [[-W + 10, -50], [-W - 20, -40], [-W + 30, -90]], '#2563EB');
  ink(c, -50, -140, 90, 90, '#DC2626'); bx(c, -50, -140, 90, 10, '#EF4444');
  poly(c, [[-40, -120], [-80, -70 - (t % 2) * 6], [-20, -70]], '#2563EB'); poly(c, [[-36, -112], [-70, -80 - (t % 2) * 6], [-24, -84]], '#FDE047');
  seam(c, -6, -140, 1, 90); servo(c, 30, -132, 5); chip(c, -20, -100);
  // (the head: back for the tell, down for the peck)
  const hx = peck ? 90 : tell ? 10 : 40, hy = peck ? -60 : tell ? -184 : -158;
  limb(c, 30, -132, hx, hy + 10, 18, '#DC2626');
  ink(c, hx - 16, hy - 16, 34, 30, '#DC2626'); bx(c, hx - 8, hy - 10, 14, 12, '#F8FAFC'); disc(c, hx, hy - 4, 3, INK);
  poly(c, [[hx + 16, hy - 10], [hx + 40, hy + (peck ? 14 : 2)], [hx + 16, hy + 12]], '#1C1917');
  if (tell) bx(c, hx - 2, hy - 6, 3, 3, '#FDE047');
};
