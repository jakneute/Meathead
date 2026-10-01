// The gym's pencil necks: the department's interns, sent into the Iron Pit first to see what he'd do. Cheap black
// suits a size too big for them (the shoulders out past theirs, the cuffs down over their hands), necks like a
// broom handle with an Adam's apple halfway up, hair gelled flat, shades too big for their faces, a clip-on tie, a
// lanyard and a badge. Shaking. One with a service pistol he's scared of, one who runs at him with a clipboard, one
// behind a government-issue briefcase the size of a door (he drops it to throw his coffee).
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';

type Ctx = CanvasRenderingContext2D;

const SUIT = '#18181B', SUIT_LIT = '#3F3F46', SUIT_DARK = '#09090B', SHIRT = '#F4F4F5', TIE = '#1E3A8A', SHOE = '#0A0A0A';
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
  }
};

/** The shakes: a pencil neck within sight of Meathead never quite holds still. */
const tremble = (f: number, k = 1) => (Math.sin(f * 1.7) + Math.sin(f * 2.9)) * 0.45 * k;

/** Skinny legs in suit trousers bunched at the ankle, big shoes; striding when `stride` is up. */
const legs = (ctx: Ctx, f: number, stride: number) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = SUIT; ctx.fillRect(-6 + s, -28, 5, 23); ctx.fillRect(2 - s, -28, 5, 23);
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(-6 + s, -9, 5, 2); ctx.fillRect(2 - s, -9, 5, 2); // (bunched)
  ctx.fillStyle = SHOE; ctx.fillRect(-8 + s, -5, 10, 5); ctx.fillRect(1 - s, -5, 10, 5);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-6 + s, -5, 4, 1); ctx.fillRect(3 - s, -5, 4, 1); // (a shine on the toe)
};

/** The jacket: boxy and too big, the shoulders out past his, the shirt and the clip-on tie, the lanyard and badge. */
const jacket = (ctx: Ctx, top: number) => {
  // (the shoulder pads, sticking out over nothing)
  ctx.fillStyle = SUIT; ctx.beginPath(); ctx.moveTo(-15, top + 2); ctx.lineTo(15, top + 2); ctx.lineTo(12, top + 30); ctx.lineTo(-12, top + 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SUIT_LIT; ctx.fillRect(-15, top + 2, 30, 2); ctx.fillRect(-12, top + 4, 2, 24);
  ctx.fillStyle = SHIRT; ctx.beginPath(); ctx.moveTo(-4, top + 2); ctx.lineTo(4, top + 2); ctx.lineTo(0, top + 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = TIE; ctx.fillRect(-1, top + 3, 3, 13); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-1, top + 3, 3, 1); // (the clip)
  // (the lanyard, the badge on it: a photo, a stripe)
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, top + 2); ctx.lineTo(-5, top + 14); ctx.moveTo(3, top + 2); ctx.lineTo(-3, top + 14); ctx.stroke();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-7, top + 14, 6, 8); ctx.fillStyle = '#93C5FD'; ctx.fillRect(-6, top + 15, 4, 3); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-7, top + 20, 6, 1);
  ctx.fillStyle = SUIT_DARK; ctx.fillRect(-12, top + 28, 24, 2); // (the hem)
};

/**
 * The neck (long, thin, the Adam's apple bobbing when he swallows) and the head on it: gelled flat, shades too big
 * for him slipping down his nose, sweat. (x, y) is the bottom of the neck.
 */
const neckAndHead = (ctx: Ctx, e: Enemy, f: number, x: number, y: number) => {
  const skin = skinOf(e);
  ctx.fillStyle = skin; ctx.fillRect(x - 2, y - 12, 4, 13);
  const gulp = (f % 90) < 8 ? -2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + 1, y - 7 + gulp, 2, 3); // (the Adam's apple)
  const hx = x + 1, hy = y - 19;
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(hx, hy, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(hx - 6, hy + 2, 12, 2);
  // (gelled flat and parted, a lick of it sticking up at the back)
  ctx.fillStyle = hairOf(e); ctx.beginPath(); ctx.ellipse(hx - 1, hy - 5, 8, 4, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(hx - 8, hy - 6, 3, 6);
  ctx.fillRect(hx - 6, hy - 11, 2, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(hx - 3, hy - 9, 6, 1);
  // (the shades: too big, slipping, his eyes over the top of them, wide)
  const slip = 1 + ((f >> 5) % 3 === 0 ? 1 : 0);
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(hx - 1, hy - 1 + slip, 10, 4);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(hx + 2, hy - 3, 3, 2); ctx.fillStyle = '#111827'; ctx.fillRect(hx + 3, hy - 3, 1, 1);
  // (the mouth: a nervous little o)
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx + 4, hy + 5, 2, 2);
  // (sweat, running off him)
  const d = (f * 0.6 + (e.homeX || 0)) % 24;
  ctx.fillStyle = 'rgba(186, 230, 253, 0.85)'; ctx.fillRect(hx - 4, hy - 4 + d * 0.6, 1.5, 2.5);
};

/** A sleeve down over his hand (the cuffs are past his knuckles), from the shoulder at (sx, sy) to (hx, hy). */
const sleeve = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number) => {
  ctx.strokeStyle = SUIT; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.lineCap = 'butt';
};

/** The pencil neck with the pistol: both hands on it, held out at arm's length and shaking, his head turned away. */
const drawSuit = (ctx: Ctx, e: Enemy, f: number) => {
  const tr = tremble(f, 1.4);
  legs(ctx, f, 0);
  ctx.save(); ctx.translate(tr * 0.3, 0);
  jacket(ctx, -58);
  neckAndHead(ctx, e, f, 0, -57);
  // (both arms out straight, the pistol at the end of them, wobbling; it flashes before he fires)
  const gy = -46 + tr;
  sleeve(ctx, 4, -54, 18, gy); sleeve(ctx, -2, -52, 16, gy + 1);
  ctx.fillStyle = skinOf(e); ctx.fillRect(17, gy - 2, 4, 4);
  ctx.fillStyle = '#27272A'; ctx.fillRect(19, gy - 3, 11, 4); ctx.fillRect(19, gy, 3, 5);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  if (charge > 0.6) { ctx.fillStyle = `rgba(254, 240, 138, ${charge})`; ctx.beginPath(); ctx.arc(32, gy - 1, 2 + charge * 3, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

/** The pencil neck who runs at him: head down, clipboard out in front like a shield, papers coming off it, tie over his shoulder. */
const drawTemp = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, f * (running ? 1.9 : 0.6), running ? 7 : 1);
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.28 : 0); ctx.translate(0, 28);
  jacket(ctx, -58);
  // (running, his tie's blown back over his shoulder)
  if (running) { ctx.fillStyle = TIE; ctx.save(); ctx.translate(0, -55); ctx.rotate(-2.2 + Math.sin(f * 0.6) * 0.2); ctx.fillRect(-1, 0, 3, 12); ctx.restore(); }
  neckAndHead(ctx, e, f, 0, -57);
  // (the clipboard, out in front at arm's length)
  sleeve(ctx, 3, -52, 14, -44);
  ctx.fillStyle = '#A16207'; ctx.fillRect(14, -54, 4, 20); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(16, -52, 3, 16); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(14, -55, 4, 2);
  // (a sheet coming off it, going back over his head)
  if (running) { const k = (f * 0.08) % 1; ctx.fillStyle = `rgba(248,250,252,${1 - k})`; ctx.save(); ctx.translate(10 - k * 40, -60 - k * 18); ctx.rotate(k * 6); ctx.fillRect(-3, -4, 6, 8); ctx.restore(); }
  ctx.restore();
};

/** The pencil neck behind his briefcase: a government-issue attaché the size of a door, held up in front of him with both shaking arms. */
const drawClerk = (ctx: Ctx, e: Enemy, f: number) => {
  const tr = tremble(f);
  legs(ctx, f, 0);
  jacket(ctx, -58);
  neckAndHead(ctx, e, f, 0, -57);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(11 + tr * 0.4, 0);
    // (the case: leather, a seam round it, brass latches, the handle on top, GOVERNMENT PROPERTY stenciled on it, dents)
    ctx.fillStyle = '#3B2414'; ctx.fillRect(0, -76, 14, 66);
    ctx.fillStyle = '#5B3A1E'; ctx.fillRect(1, -75, 12, 64);
    ctx.fillStyle = '#7C4A24'; ctx.fillRect(2, -74, 2, 62);
    ctx.strokeStyle = '#2A1A0C'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 1.5]); ctx.strokeRect(2.5, -73.5, 9, 61); ctx.setLineDash([]);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(5, -70, 4, 3); ctx.fillRect(5, -18, 4, 3);
    ctx.fillStyle = '#2A1A0C'; ctx.fillRect(14, -50, 3, 12);
    ctx.save(); ctx.translate(8, -44); ctx.rotate(-Math.PI / 2); ctx.fillStyle = 'rgba(253, 230, 138, 0.8)'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('GOVT PROPERTY', 0, 1.5); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; for (let i = 0; i < Math.floor(damage * 6); i++) ctx.fillRect(3 + (i * 5) % 8, -66 + (i * 17) % 50, 3, 2);
    ctx.restore();
    // (his fingers round the edge of it)
    ctx.fillStyle = skinOf(e); ctx.fillRect(9, -56 + tr, 3, 3); ctx.fillRect(9, -30 - tr, 3, 3);
  } else {
    // (the case down at his side, his arm back to throw a coffee: the cup, the lid, a sleeve on it)
    ctx.fillStyle = '#5B3A1E'; ctx.fillRect(-24, -40, 10, 30);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    sleeve(ctx, -2, -54, -6 - wind * 10, -60);
    const cx = -7 - wind * 11, cy = -66;
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(cx - 3, cy, 6, 8); ctx.fillStyle = '#15803D'; ctx.fillRect(cx - 3, cy + 3, 6, 2); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(cx - 4, cy - 1, 8, 2);
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
  // (the base: a squat black tub, water sloshing in it when it rocks)
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(0, -8, 20, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-20, -14, 40, 8);
  ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.ellipse(0, -14, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.ellipse(0, -14, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(0, -14); ctx.rotate(tilt);
  // (the post)
  ctx.fillStyle = '#52525B'; ctx.fillRect(-4, -20, 8, 20);
  // (the torso: the pecs and abs moulded into it, the rubber shine, scuffs where it's been hit)
  ctx.fillStyle = '#C2410C'; ctx.beginPath(); ctx.moveTo(-14, -20); ctx.lineTo(-17, -46); ctx.quadraticCurveTo(0, -54, 17, -46); ctx.lineTo(14, -20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.ellipse(-7, -44, 7, 4, 0, 0, Math.PI * 2); ctx.ellipse(7, -44, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9A3412'; for (let r = 0; r < 3; r++) { ctx.fillRect(-7, -36 + r * 5, 6, 4); ctx.fillRect(1, -36 + r * 5, 6, 4); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-13, -45, 2, 22);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(4, -30, 4, 2); ctx.fillRect(-9, -40, 3, 2);
  // (the neck, the head: bald, the scowl drawn on in marker)
  ctx.fillStyle = '#C2410C'; ctx.fillRect(-4, -54, 8, 6);
  ctx.beginPath(); ctx.ellipse(0, -62, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-5, -68, 2, 6);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(1, -65); ctx.lineTo(6, -64); ctx.moveTo(1, -59); ctx.lineTo(6, -60); ctx.stroke();
  ctx.fillStyle = '#111'; ctx.fillRect(3, -63, 2, 2);
  ctx.restore();
};
