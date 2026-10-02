// The gym's pencil necks: the department's interns, sent into the Iron Pit first to see what he'd do. Cheap black
// suits a size too big for them (the shoulders out past theirs, the cuffs down over their hands), necks like a
// broom handle with an Adam's apple halfway up, hair gelled flat, shades too big for their faces, a clip-on tie, a
// lanyard and a badge. Shaking. One with a service pistol he's scared of, one who runs at him with a clipboard, one
// behind a government-issue briefcase the size of a door (he drops it to throw his coffee).
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import { INK, ink, shaded, shadedTop, limb, dark, lite } from '../npc/kit';

type Ctx = CanvasRenderingContext2D;

const SUIT = '#1C1C22', SUIT_LIT = '#3F3F4A', SUIT_DARK = '#09090B', SHIRT = '#F4F4F5', TIE = '#1E3A8A', SHOE = '#0A0A0A';
const SKINS = ['#F2D3B3', '#E8B98C', '#C68E5E', '#8D5524', '#F5DCC4'];
const HAIR = ['#3F2A14', '#111827', '#B45309', '#57534E', '#1C1917'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round(e.homeX || 0)) % SKINS.length];
const hairOf = (e: Enemy) => HAIR[Math.abs(Math.round((e.homeX || 0) / 7)) % HAIR.length];

export const drawGymKind = (ctx: Ctx, e: Enemy, f: number) => {
  switch (e.kind) {
    case 'suit': drawSuit(ctx, e, f); break;
    case 'temp': drawTemp(ctx, e, f); break;
    case 'clerk': drawClerk(ctx, e, f); break;
    case 'bob': drawDummy(ctx, e); break;
    case 'cower': drawCower(ctx, e, f); break;
  }
};

/** The shakes: a pencil neck within sight of Meathead never quite holds still. */
const tremble = (f: number, k = 1) => (Math.sin(f * 1.7) + Math.sin(f * 2.9)) * 0.45 * k;

/** Skinny legs in suit trousers bunched at the ankle, big shoes; striding when `stride` is up. */
const legs = (ctx: Ctx, f: number, stride: number) => {
  const s = Math.sin(f * 0.25) * stride;
  for (const x of [-6 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, -28, 5, 23), SUIT, x, -28, 5, 23, 0.9);
    ctx.fillStyle = SUIT_DARK; ctx.fillRect(x + 0.6, -9, 3.8, 0.8); ctx.fillRect(x + 1, -11, 3, 0.7); // (bunched)
    ctx.fillStyle = SUIT_LIT; ctx.fillRect(x + 1.6, -26, 0.7, 12); // (the crease)
    // (the shoes: too long for him, a shine on the toe)
    ink(ctx, () => ctx.roundRect(x - 2, -5, 10, 5, [2, 3, 1, 1]), SHOE, 0.9);
    ctx.fillStyle = '#52525B'; ctx.fillRect(x + 4, -4.2, 3, 0.9);
    ctx.fillStyle = '#27272A'; ctx.fillRect(x - 2, -1, 10, 1);
  }
};

/** The jacket: boxy and too big, the shoulders out past his, the shirt and the clip-on tie, the lanyard and badge. */
const jacket = (ctx: Ctx, top: number) => {
  // (the shoulder pads, sticking out over nothing)
  const coat = () => { ctx.moveTo(-15, top + 3); ctx.quadraticCurveTo(-15, top + 1, -12, top + 1); ctx.lineTo(12, top + 1); ctx.quadraticCurveTo(15, top + 1, 15, top + 3); ctx.lineTo(12, top + 30); ctx.lineTo(-12, top + 30); ctx.closePath(); };
  shaded(ctx, coat, SUIT, -15, top + 1, 30, 29);
  // (the shirt in the V, the lapels either side of it)
  ink(ctx, () => { ctx.moveTo(-4, top + 1.5); ctx.lineTo(4, top + 1.5); ctx.lineTo(0, top + 16); ctx.closePath(); }, SHIRT, 0.8);
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(1.4, top + 2, 1.4, 8);
  for (const sx of [-1, 1]) ink(ctx, () => { ctx.moveTo(sx * 4, top + 1.5); ctx.lineTo(sx * 6.5, top + 7); ctx.lineTo(sx * 4.4, top + 8); ctx.lineTo(0, top + 16); ctx.closePath(); }, sx < 0 ? SUIT_LIT : SUIT, 0.7);
  // (the clip-on tie, the clip catching the light)
  ink(ctx, () => { ctx.moveTo(-1, top + 3.5); ctx.lineTo(2, top + 3.5); ctx.lineTo(2.4, top + 13); ctx.lineTo(0.5, top + 15); ctx.lineTo(-1.4, top + 13); ctx.closePath(); }, TIE, 0.7);
  ctx.fillStyle = lite(TIE, 0.3); ctx.fillRect(-0.6, top + 5, 1, 7);
  ink(ctx, () => ctx.rect(-1.6, top + 2.2, 4.2, 1.6), '#9CA3AF', 0.5);
  // (the buttons, the breast pocket)
  ctx.fillStyle = INK; ctx.fillRect(1, top + 19, 1.4, 1.4); ctx.fillRect(1, top + 24, 1.4, 1.4);
  ctx.fillStyle = SUIT_LIT; ctx.fillRect(5, top + 9, 5, 0.8);
  // (the lanyard, the badge on it: a photo, a stripe)
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, top + 2); ctx.lineTo(-5, top + 14); ctx.moveTo(3, top + 2); ctx.lineTo(-3, top + 14); ctx.stroke();
  ink(ctx, () => ctx.rect(-7.5, top + 14, 6.5, 8.5), '#F8FAFC', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-6.5, top + 15, 2.6, 3); ctx.fillStyle = '#A16207'; ctx.fillRect(-6.5, top + 15, 2.6, 1);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(-3.4, top + 15.4, 1.6, 0.6); ctx.fillRect(-3.4, top + 17, 1.6, 0.6);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-7, top + 20, 5.6, 1.2);
};

/**
 * The neck (long, thin, the Adam's apple bobbing when he swallows) and the head on it: gelled flat, shades too big
 * for him slipping down his nose, sweat. (x, y) is the bottom of the neck.
 */
const neckAndHead = (ctx: Ctx, e: Enemy, f: number, x: number, y: number) => {
  const skin = skinOf(e), sd = dark(skin, 0.2), hair = hairOf(e);
  shaded(ctx, () => ctx.rect(x - 2, y - 12, 4, 13), skin, x - 2, y - 12, 4, 13, 0.8);
  const gulp = (f % 90) < 8 ? -2 : 0;
  ink(ctx, () => ctx.ellipse(x + 2, y - 6 + gulp, 1.2, 1.6, 0, 0, Math.PI * 2), skin, 0.6); // (the Adam's apple)
  const hx = x + 1, hy = y - 19;
  const skull = () => ctx.ellipse(hx, hy, 7, 8, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(hx - 7, hy - 8, 14, 16);
  ctx.fillStyle = sd; ctx.fillRect(hx - 7, hy - 8, 3.6, 16); ctx.fillRect(hx - 7, hy + 5, 14, 3);
  ctx.fillStyle = lite(skin, 0.2); ctx.fillRect(hx + 1, hy - 6, 3, 3);
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // (the ear, sticking out)
  ink(ctx, () => ctx.ellipse(hx - 4.4, hy + 0.5, 1.6, 2.6, 0, 0, Math.PI * 2), skin, 0.7);
  ctx.fillStyle = sd; ctx.fillRect(hx - 4.8, hy - 0.4, 0.8, 1.8);
  // (gelled flat and parted, a lick of it sticking up at the back, the shine on it)
  ink(ctx, () => { ctx.ellipse(hx - 0.6, hy - 4.4, 8, 4.2, 0, Math.PI, 0); ctx.lineTo(hx + 6, hy - 4); ctx.lineTo(hx - 5, hy - 4.4); ctx.lineTo(hx - 6, hy + 1); ctx.lineTo(hx - 8.4, hy - 1); ctx.closePath(); }, hair, 0.9);
  ink(ctx, () => { ctx.moveTo(hx - 6, hy - 7); ctx.lineTo(hx - 6.4, hy - 9.6); ctx.lineTo(hx - 4.4, hy - 7.8); ctx.closePath(); }, hair, 0.6);
  ctx.fillStyle = lite(hair, 0.45); ctx.fillRect(hx - 3, hy - 7.6, 6, 1); ctx.fillRect(hx - 5.6, hy - 6.4, 2, 0.8);
  ctx.fillStyle = dark(hair, 0.4); ctx.fillRect(hx + 1, hy - 8.4, 0.8, 3); // (the part)
  // (the shades: too big, slipping, his eyes over the top of them, wide)
  const slip = 1 + ((f >> 5) % 3 === 0 ? 1 : 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 2, hy - 3.4, 3, 2.4); ctx.fillRect(hx + 6, hy - 3.4, 2, 2.4);
  ctx.fillStyle = INK; ctx.fillRect(hx + 3.4, hy - 3, 1.2, 1.4); ctx.fillRect(hx + 6.8, hy - 3, 1, 1.4);
  ctx.fillRect(hx + 1.6, hy - 5.4, 3.4, 0.8); ctx.fillRect(hx + 5.8, hy - 5.6, 2.4, 0.8); // (brows up)
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(hx - 1, hy - 0.4 + slip); ctx.lineTo(hx - 4, hy + 0.2 + slip); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(hx + 4, hy - 0.2 + slip, 2, 0.9); // (the bridge)
  for (const [lx, lw] of [[-1, 5.4], [5.6, 4.2]] as const) {
    ink(ctx, () => ctx.roundRect(hx + lx, hy - 0.8 + slip, lw, 3, [0.4, 0.4, 1.6, 1.6]), '#0A0A0A', 0.8);
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(hx + lx + 0.6, hy - 0.2 + slip, lw - 1.4, 0.7);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(hx + lx + 1, hy + 0.8 + slip, 1.2, 0.7);
  }
  // (the nose the shades are sliding down, the mouth: a nervous little o)
  ctx.fillStyle = sd; ctx.fillRect(hx + 6.4, hy + 3, 1.2, 1.4);
  ink(ctx, () => ctx.ellipse(hx + 4.2, hy + 5.8, 1.1, 1.3, 0, 0, Math.PI * 2), '#7F1D1D', 0.6);
  // (sweat, running off him)
  const d = (f * 0.6 + (e.homeX || 0)) % 24;
  ctx.fillStyle = 'rgba(186, 230, 253, 0.9)'; ctx.fillRect(hx - 3, hy - 4 + d * 0.6, 1.4, 2.4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(hx - 3, hy - 4 + d * 0.6, 0.7, 0.8);
};

/** A sleeve down over his hand (the cuffs are past his knuckles), from the shoulder at (sx, sy) to (hx, hy). */
const sleeve = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number) => {
  limb(ctx, sx, sy, hx, hy, 5, SUIT);
  ctx.lineCap = 'round'; ctx.strokeStyle = SUIT_LIT; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sx + (hx - sx) * 0.15, sy + (hy - sy) * 0.15 - 1.2); ctx.lineTo(sx + (hx - sx) * 0.75, sy + (hy - sy) * 0.75 - 1.2); ctx.stroke();
  ctx.lineCap = 'butt';
};

/** A few fingers poking out of the end of a sleeve at (x, y). */
const fingers = (ctx: Ctx, e: Enemy, x: number, y: number) => {
  ink(ctx, () => ctx.roundRect(x, y, 3.4, 3.4, 1.2), skinOf(e), 0.7);
  ctx.fillStyle = dark(skinOf(e), 0.3); ctx.fillRect(x + 0.6, y + 1.6, 2.2, 0.5);
};

/** The pencil neck with the pistol: both hands on it, held out at arm's length and shaking, his head turned away. */
const drawSuit = (ctx: Ctx, e: Enemy, f: number) => {
  const tr = tremble(f, 1.4);
  legs(ctx, f, 0);
  ctx.save(); ctx.translate(tr * 0.3, 0);
  sleeve(ctx, -2, -52, 16, -45 + tr);
  jacket(ctx, -58);
  neckAndHead(ctx, e, f, 0, -57);
  // (both arms out straight, the pistol at the end of them, wobbling; it flashes before he fires)
  const gy = -46 + tr;
  sleeve(ctx, 4, -54, 18, gy);
  ink(ctx, () => { ctx.moveTo(19, gy - 0.4); ctx.lineTo(23, gy - 0.4); ctx.lineTo(22.6, gy + 5); ctx.lineTo(18.6, gy + 5); ctx.closePath(); }, '#18181B', 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(24.4, gy + 0.6, 1.6, 0, Math.PI); ctx.stroke();
  shadedTop(ctx, () => ctx.rect(19, gy - 3.4, 12, 3.6), '#3F3F46', 19, gy - 3.4, 12, 3.6, 0.8);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(20, gy - 2.8, 9, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(29.6, gy - 4.2, 1, 0.9);
  fingers(ctx, e, 16.4, gy - 1.6);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  if (charge > 0.6) {
    ctx.fillStyle = `rgba(254, 240, 138, ${(charge * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(33, gy - 1.6, 4 + charge * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(254, 240, 138, ${charge.toFixed(3)})`; ctx.beginPath(); ctx.arc(33, gy - 1.6, 2 + charge * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${charge.toFixed(3)})`; ctx.beginPath(); ctx.arc(33, gy - 1.6, 1 + charge, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

/** A clipboard at (x, y) (its top left), w x h: the board, the sheet on it, the clip. */
const clipboard = (ctx: Ctx, x: number, y: number, w: number, h: number) => {
  shaded(ctx, () => ctx.roundRect(x, y, w, h, 0.8), '#A16207', x, y, w, h, 0.9);
  ink(ctx, () => ctx.rect(x + 1.4, y + 2, w - 1.4, h - 4), '#F8FAFC', 0.6);
  ctx.fillStyle = '#94A3B8'; for (let k = 0; k < 4; k++) ctx.fillRect(x + w - 1, y + 4 + k * 3.4, 0.7, 2);
  shadedTop(ctx, () => ctx.rect(x - 0.4, y - 1.2, w + 0.8, 2.6), '#A1A1AA', x - 0.4, y - 1.2, w + 0.8, 2.6, 0.6);
};

/** The pencil neck who runs at him: head down, clipboard out in front like a shield, papers coming off it, tie over his shoulder. */
const drawTemp = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, f * (running ? 1.9 : 0.6), running ? 7 : 1);
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.28 : 0); ctx.translate(0, 28);
  jacket(ctx, -58);
  // (running, his tie's blown back over his shoulder)
  if (running) { ctx.save(); ctx.translate(0, -55); ctx.rotate(-2.2 + Math.sin(f * 0.6) * 0.2); ink(ctx, () => { ctx.moveTo(-1.4, 0); ctx.lineTo(1.6, 0); ctx.lineTo(2, 10); ctx.lineTo(0, 12); ctx.lineTo(-1.8, 10); ctx.closePath(); }, TIE, 0.7); ctx.restore(); }
  neckAndHead(ctx, e, f, 0, -57);
  // (the clipboard, out in front at arm's length)
  sleeve(ctx, 3, -52, 14, -44);
  clipboard(ctx, 14, -54, 5, 20);
  fingers(ctx, e, 12.4, -45.6);
  // (a sheet coming off it, going back over his head)
  if (running) {
    const k = (f * 0.08) % 1;
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.translate(10 - k * 40, -60 - k * 18); ctx.rotate(k * 6);
    ink(ctx, () => ctx.rect(-3, -4, 6, 8), '#F8FAFC', 0.6);
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(-2, -2, 4, 0.6); ctx.fillRect(-2, 0, 4, 0.6); ctx.fillRect(-2, 2, 3, 0.6);
    ctx.restore();
  }
  ctx.restore();
};

/** The briefcase at (x, y) (its top left), w x h, stood on end: leather, the seam round it, scuffs, dents as it's hit. */
const briefcase = (ctx: Ctx, x: number, y: number, w: number, h: number, damage = 0) => {
  const LEATHER = '#5B3A1E';
  shaded(ctx, () => ctx.roundRect(x, y, w, h, 2), LEATHER, x, y, w, h);
  ctx.strokeStyle = dark(LEATHER, 0.45); ctx.lineWidth = 0.8; ctx.setLineDash([2, 1.5]); ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5); ctx.setLineDash([]);
  ctx.fillStyle = lite(LEATHER, 0.25); for (let i = 0; i < 4; i++) ctx.fillRect(x + 3 + (i * 7) % (w - 6), y + 8 + (i * 23) % (h - 16), 2, 0.8);
  for (let i = 0; i < Math.floor(damage * 6); i++) {
    const dx = x + 3 + (i * 5) % (w - 6), dy = y + 10 + (i * 17) % (h - 20);
    ctx.fillStyle = dark(LEATHER, 0.55); ctx.fillRect(dx, dy, 3, 2);
    ctx.fillStyle = lite(LEATHER, 0.35); ctx.fillRect(dx, dy + 2, 3, 0.7);
  }
};
/** A brass latch at (x, y). */
const latch = (ctx: Ctx, x: number, y: number) => {
  ink(ctx, () => ctx.rect(x, y, 4, 3), '#EAB308', 0.6);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(x + 0.6, y + 0.5, 1.4, 0.8);
};

/** The pencil neck behind his briefcase: a government-issue attaché the size of a door, held up in front of him with both shaking arms. */
const drawClerk = (ctx: Ctx, e: Enemy, f: number) => {
  const tr = tremble(f);
  legs(ctx, f, 0);
  if (!e.isShieldActive) {
    // (the case down at his side, its handle)
    briefcase(ctx, -24, -40, 10, 30); latch(ctx, -21, -38);
    ink(ctx, () => ctx.roundRect(-14.4, -30, 2.4, 10, [0, 1.4, 1.4, 0]), '#2A1A0C', 0.6);
  }
  jacket(ctx, -58);
  neckAndHead(ctx, e, f, 0, -57);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(11 + tr * 0.4, 0);
    // (the case: the handle on top, brass latches, GOVERNMENT PROPERTY stenciled on it, dents)
    ink(ctx, () => ctx.roundRect(13, -51, 4, 14, [0, 2, 2, 0]), '#2A1A0C', 0.8);
    briefcase(ctx, 0, -76, 14, 66, damage);
    latch(ctx, 5, -71); latch(ctx, 5, -18);
    ctx.save(); ctx.translate(8, -44); ctx.rotate(-Math.PI / 2); ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(26, 11, 6, 0.6)'; ctx.fillText('GOVT PROPERTY', 0.5, 2);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.85)'; ctx.fillText('GOVT PROPERTY', 0, 1.5); ctx.restore();
    ctx.restore();
    // (his fingers round the edge of it)
    fingers(ctx, e, 9, -56 + tr); fingers(ctx, e, 9, -30 - tr);
  } else {
    // (his arm back to throw a coffee: the cup, the lid, a sleeve on it)
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    sleeve(ctx, -2, -54, -6 - wind * 10, -60);
    const cx = -7 - wind * 11, cy = -66;
    shaded(ctx, () => { ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy); ctx.lineTo(cx + 2.4, cy + 8); ctx.lineTo(cx - 2.4, cy + 8); ctx.closePath(); }, '#F8FAFC', cx - 3, cy, 6, 8, 0.8);
    ink(ctx, () => ctx.rect(cx - 3, cy + 2.6, 6, 2.6), '#A16207', 0.6);
    ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.arc(cx, cy + 3.9, 0.9, 0, Math.PI * 2); ctx.fill();
    shadedTop(ctx, () => ctx.roundRect(cx - 4, cy - 1.8, 8, 2.4, 1), '#E5E7EB', cx - 4, cy - 1.8, 8, 2.4, 0.7);
    fingers(ctx, e, cx - 1.6, cy + 4.4);
  }
};

/**
 * The striking dummy: a rubber man (a torso, a head, no arms, abs moulded in, a scowl somebody's drawn on it in
 * marker) on a post on a round black base full of water. Hit, it rocks back on the base and comes back up (the stage
 * keeps the time since: aiTimer counts down from the hit).
 */
const drawDummy = (ctx: Ctx, e: Enemy) => {
  const k = Math.max(0, e.aiTimer || 0) / 40;
  const tilt = Math.sin((40 - (e.aiTimer || 0)) * 0.45) * 0.45 * k;
  const RUB = '#C2410C';
  // (the base: a squat black tub, its rim, the water sloshing in it when it rocks)
  shaded(ctx, () => { ctx.moveTo(-20, -14); ctx.lineTo(20, -14); ctx.lineTo(20, -8); ctx.ellipse(0, -8, 20, 8, 0, 0, Math.PI); ctx.closePath(); }, '#27272A', -20, -14, 40, 14);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-14, -6, 4, 1); ctx.fillRect(-16, -9, 2, 4);
  ink(ctx, () => ctx.ellipse(0, -14, 20, 6, 0, 0, Math.PI * 2), '#3F3F46', 1);
  ink(ctx, () => ctx.ellipse(0, -14, 15, 4, 0, 0, Math.PI * 2), '#18181B', 0.8);
  ctx.fillStyle = '#52525B'; ctx.fillRect(-12, -18.4, 10, 1);
  if (k > 0.1) { ctx.fillStyle = 'rgba(147, 197, 253, 0.5)'; ctx.fillRect(-10 + tilt * 12, -15, 6, 1); }
  ctx.save(); ctx.translate(0, -14); ctx.rotate(tilt);
  // (the post, the collar where it meets the body)
  shaded(ctx, () => ctx.rect(-4, -20, 8, 20), '#71717A', -4, -20, 8, 20, 0.9);
  // (the torso: the pecs and abs moulded into it, the rubber shine, scuffs where it's been hit)
  const torso = () => { ctx.moveTo(-14, -20); ctx.lineTo(-17, -46); ctx.quadraticCurveTo(0, -54, 17, -46); ctx.lineTo(14, -20); ctx.closePath(); };
  shaded(ctx, torso, RUB, -17, -54, 34, 34);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  for (const px of [-7, 7]) {
    ctx.fillStyle = dark(RUB, 0.35); ctx.beginPath(); ctx.ellipse(px, -43, 7, 4.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lite(RUB, 0.2); ctx.beginPath(); ctx.ellipse(px - 0.6, -44, 6.2, 3.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lite(RUB, 0.45); ctx.fillRect(px - 4, -46, 3, 1);
  }
  for (let r = 0; r < 3; r++) for (const ax of [-7, 1]) {
    ctx.fillStyle = dark(RUB, 0.38); ctx.fillRect(ax, -36 + r * 5, 6, 4);
    ctx.fillStyle = RUB; ctx.fillRect(ax, -36 + r * 5, 5, 3);
    ctx.fillStyle = lite(RUB, 0.3); ctx.fillRect(ax, -36 + r * 5, 3, 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-13, -45, 2, 20); ctx.fillRect(-11, -47, 2, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(4, -30, 4, 2); ctx.fillRect(-9, -40, 3, 2); ctx.fillRect(10, -24, 2, 2);
  ctx.restore();
  // (the neck, the head: bald, the shine, the scowl drawn on in marker)
  shaded(ctx, () => ctx.rect(-4, -55, 8, 7), RUB, -4, -55, 8, 7, 0.9);
  shaded(ctx, () => ctx.ellipse(0, -62, 8, 9, 0, 0, Math.PI * 2), RUB, -8, -71, 16, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-5, -68, 2, 5); ctx.fillRect(-3, -69.6, 2, 1.4);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(1, -65); ctx.lineTo(6, -64); ctx.moveTo(1, -59); ctx.lineTo(6, -60); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.fillRect(3, -63, 2, 2);
  ctx.restore();
};

/**
 * The one who won't come out: down on his knees behind a folded blue gym mat stood on end, both arms round it, his
 * head down behind it and just the top of his gelled hair and his eyes showing over it now and then, shaking so hard
 * the mat rattles. He never drops it, and nothing gets through it.
 */
const drawCower = (ctx: Ctx, e: Enemy, f: number) => {
  const tr = tremble(f, 2.2);
  const peek = Math.sin(f * 0.05) > 0.6;
  // (him: on his knees, hunched, the jacket bunched up his back, the soles of his shoes)
  shaded(ctx, () => ctx.roundRect(-14, -12, 16, 12, 2), SUIT, -14, -12, 16, 12, 0.9);
  ink(ctx, () => ctx.roundRect(-21, -6, 9, 6, [1, 1, 2, 2]), SHOE, 0.9);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-21, -5, 1.4, 4);
  ctx.save(); ctx.translate(tr * 0.4, 0);
  const back = () => { ctx.moveTo(-16, -12); ctx.quadraticCurveTo(-18, -38, -2, -42); ctx.lineTo(6, -40); ctx.lineTo(6, -12); ctx.closePath(); };
  shaded(ctx, back, SUIT, -18, -42, 24, 30);
  ctx.strokeStyle = SUIT_DARK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-12, -30); ctx.quadraticCurveTo(-6, -28, -3, -32); ctx.moveTo(-14, -22); ctx.quadraticCurveTo(-8, -20, -4, -24); ctx.stroke(); // (bunched)
  // (his head, down behind the mat; the eyes over the top of it, now and then)
  const skin = skinOf(e), hair = hairOf(e);
  const hy = peek ? -50 : -44;
  shaded(ctx, () => ctx.ellipse(2, hy, 7, 7, 0, 0, Math.PI * 2), skin, -5, hy - 7, 14, 14);
  ink(ctx, () => ctx.ellipse(1, hy - 3.4, 7.6, 4.4, 0, Math.PI, 0), hair, 0.9);
  ctx.fillStyle = lite(hair, 0.45); ctx.fillRect(-2, hy - 6.6, 5, 1);
  if (peek) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(4, hy - 1.4, 2.6, 2.6); ctx.fillRect(7, hy - 1.4, 2, 2.6);
    ctx.fillStyle = INK; ctx.fillRect(5.4, hy - 0.6, 1.2, 1.4); ctx.fillRect(7.8, hy - 0.6, 1, 1.4); ctx.fillRect(3.8, hy - 3, 2.8, 0.7); ctx.fillRect(6.8, hy - 3.2, 2.2, 0.7);
  }
  // (sweat flying off him)
  if (f % 16 < 8) { ctx.fillStyle = 'rgba(186, 230, 253, 0.9)'; ctx.fillRect(-6 - (f % 16), hy - 6 - (f % 16) * 0.5, 1.5, 2); }
  ctx.restore();
  // The mat, stood on end in front of him: blue vinyl, the folds across it, the handle, scuffed (rattling as he shakes)
  ctx.save(); ctx.translate(14 + tr * 0.6, 0);
  const MAT = '#2563EB';
  ink(ctx, () => ctx.roundRect(12.6, -41, 4, 10, [0, 2, 2, 0]), '#111827', 0.8);
  for (let p = 0; p < 4; p++) {
    const y0 = -58 + p * 14.5, h = 14.5;
    shaded(ctx, () => ctx.roundRect(0, y0, 14, h, 2), MAT, 0, y0, 14, h, 0.9);
    ctx.fillStyle = lite(MAT, 0.4); ctx.fillRect(1.6, y0 + 1, 2, h - 3);
    ctx.fillStyle = dark(MAT, 0.35); ctx.fillRect(1, y0 + h - 2, 12, 1);
    // (the stitching round each panel)
    ctx.strokeStyle = lite(MAT, 0.25); ctx.lineWidth = 0.5; ctx.setLineDash([1, 1]); ctx.strokeRect(2.4, y0 + 2, 9.2, h - 4.4); ctx.setLineDash([]);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(6, -50, 4, 2); ctx.fillRect(4, -22, 5, 1.4);
  ctx.fillStyle = '#C0C7D0'; ctx.fillRect(8, -10, 3, 3); // (duct tape over a split)
  ctx.restore();
  // (his fingers round the edge of it)
  fingers(ctx, e, 11 + tr * 0.6, -39); fingers(ctx, e, 11 + tr * 0.6, -23);
};
