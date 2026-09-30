// Ernie's stage: San Francisco's finest (a tech bro in a fleece vest with a
// pistol, a bike courier who runs you down swinging a U-lock, a protester
// behind his cardboard sign), the wildlife (a trash panda, a seagull), the
// drones, the goons on jet skis, and the poor souls on fire on the bridge. On
// Alcatraz: the tour's convict reenactor and the park rangers.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { DRONE_AIM } from '../../enemies/kinds/ernie';

type Ctx = CanvasRenderingContext2D;

export const drawErnieKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'techbro': drawTechbro(ctx, e, f); break;
    case 'courier': drawCourier(ctx, e, f); break;
    case 'protester': drawProtester(ctx, e, f); break;
    case 'raccoon': drawRaccoon(ctx, e, f); break;
    case 'seagull': drawSeagull(ctx, e, f); break;
    case 'drone': drawDrone(ctx, e, f, state); break;
    case 'jetskier': drawJetskier(ctx, e, f); break;
    case 'burning': drawBurning(ctx, e, f); break;
    case 'convict': drawConvict(ctx, e, f); break;
    case 'parkranger': drawParkRanger(ctx, e, f); break;
  }
};

/**
 * The tour's convict reenactor, still in character: striped prison suit and cap, a stubble, a number on his chest,
 * and the ball and chain off his ankle, swung round his head as he runs you down (it's a real iron ball; the tour
 * went all out).
 */
const drawConvict = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.6 : 0.6), running ? 7 : 1, '#E7E5E4', '#1C1917');
  ctx.fillStyle = '#1C1917'; for (let y = -26; y < -6; y += 6) { ctx.fillRect(-8, y, 7, 3); ctx.fillRect(2, y, 7, 3); }
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.22 : 0);
  // The suit: black and white stripes, the number
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-13, -32, 26, 32);
  ctx.fillStyle = '#1C1917'; for (let y = -30; y < 0; y += 6) ctx.fillRect(-13, y, 26, 3);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-7, -24, 14, 7);
  ctx.fillStyle = '#1C1917'; ctx.font = 'bold 5px monospace'; ctx.fillText('1259', -7, -18);
  head(ctx, -40, '#E0AC69');
  ctx.fillStyle = 'rgba(40, 30, 20, 0.45)'; ctx.fillRect(-4, -38, 14, 6); // stubble
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -43, 7, 2);
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-7, -52, 18, 6); ctx.fillStyle = '#1C1917'; ctx.fillRect(-7, -49, 18, 2); // the cap
  ctx.restore();
  // The chain from his ankle up to his hand, the ball whirling round his head when he's running
  const a = running ? f * 0.35 : Math.PI * 0.75;
  const hx = 8, hy = -58, bx = hx + Math.cos(a) * 30, by = hy - 8 + Math.sin(a) * 16;
  ctx.strokeStyle = '#52525B'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(4, -4); ctx.quadraticCurveTo(14, -30, hx, hy); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(hx - 3, hy - 3, 7, 7);
  ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#71717A'; ctx.beginPath(); ctx.arc(bx - 3, by - 3, 3, 0, Math.PI * 2); ctx.fill();
};

/** A park ranger: the flat hat, gray shirt and green trousers, the arrowhead patch, a service pistol; glows before he fires. */
const drawParkRanger = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -26, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0, '#3F6212', '#44403C');
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(-12, -54, 24, 30); // shirt
  ctx.fillStyle = '#78716C'; ctx.fillRect(-12, -54, 24, 3); ctx.fillRect(-1, -52, 2, 26);
  ctx.fillStyle = '#854D0E'; ctx.beginPath(); ctx.moveTo(-11, -48); ctx.lineTo(-5, -48); ctx.lineTo(-8, -40); ctx.fill(); // the arrowhead
  ctx.fillStyle = '#FACC15'; ctx.fillRect(4, -49, 5, 5); // badge
  ctx.fillStyle = '#44403C'; ctx.fillRect(-12, -28, 24, 4); // duty belt
  head(ctx, -64, '#C68642');
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -66, 7, 2);
  // The flat hat: the wide brim, the pinched crown, the band
  ctx.fillStyle = '#A16207'; ctx.fillRect(-12, -73, 28, 3);
  ctx.beginPath(); ctx.moveTo(-5, -73); ctx.lineTo(2, -84); ctx.lineTo(9, -73); ctx.fill();
  ctx.fillStyle = '#44403C'; ctx.fillRect(-5, -76, 14, 2);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#C68642'; ctx.fillRect(6, -46, 12, 5);
  ctx.fillStyle = '#18181B'; ctx.fillRect(16, -49, 12, 5); ctx.fillRect(16, -45, 4, 5);
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(30, -47, 2 + charge * 2, 0, Math.PI * 2); ctx.fill(); }
};

const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe: string) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-8 + s, hipY, 7, -hipY - 5); ctx.fillRect(2 - s, hipY, 7, -hipY - 5);
  ctx.fillStyle = shoe; ctx.fillRect(-10 + s, -6, 11, 6); ctx.fillRect(1 - s, -6, 11, 6);
};
const head = (ctx: Ctx, y: number, skin: string) => { ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, y, 9, 0, Math.PI * 2); ctx.fill(); };

/** A fleece vest over a gingham shirt, chinos, AirPods, a company lanyard, a pistol; glows before he fires. */
const drawTechbro = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -26, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0, '#A8A29E', '#F8FAFC');
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-12, -54, 24, 30); // shirt
  ctx.fillStyle = '#FFFFFF'; for (let y = -52; y < -26; y += 4) ctx.fillRect(-12, y, 24, 1);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-13, -54, 8, 28); ctx.fillRect(5, -54, 8, 28); // the vest
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-12, -48, 4, 2); // logo
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-3, -54); ctx.lineTo(1, -40); ctx.lineTo(5, -54); ctx.stroke(); // lanyard
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-1, -41, 5, 6);
  head(ctx, -64, '#F2C9A0');
  ctx.fillStyle = '#78350F'; ctx.fillRect(-7, -74, 18, 5); // swoop of hair
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-7, -64, 2, 4); // AirPod
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -66, 7, 2);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#F2C9A0'; ctx.fillRect(6, -46, 12, 5);
  ctx.fillStyle = '#18181B'; ctx.fillRect(16, -49, 12, 5); ctx.fillRect(16, -45, 4, 5);
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(30, -47, 2 + charge * 2, 0, Math.PI * 2); ctx.fill(); }
};

/** A bike courier: cycling cap, messenger bag, tights, and a U-lock he swings as he runs you down. */
const drawCourier = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#111827', '#DC2626');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0);
  ctx.fillStyle = '#16A34A'; ctx.fillRect(-12, -30, 24, 30);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -22, 24, 3);
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(10, -4); ctx.stroke();
  ctx.fillStyle = '#44403C'; ctx.fillRect(-20, -14, 14, 12); // the bag
  head(ctx, -38, '#C68642');
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(2, -42, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(2, -44, 13, 3); // cap and its brim
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-7, -48, 18, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -40, 7, 2);
  // The U-lock, swinging
  const sw = running ? Math.sin(f * 0.45) * 0.6 : 0;
  ctx.save(); ctx.translate(10, -22); ctx.rotate(-0.8 + sw);
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(22, 0, 8, Math.PI * 0.5, Math.PI * 1.5); ctx.moveTo(22, -8); ctx.lineTo(8, -8); ctx.moveTo(22, 8); ctx.lineTo(8, 8); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(4, -10, 5, 20);
  ctx.restore();
  ctx.restore();
};

/** A protester: tie-dye, beanie, beard; a big cardboard sign as his shield. He drops it to lob a (reusable) water bottle. */
const SIGNS = ['NO!', 'EAT THE RICH', 'RENT IS THEFT', 'SAVE THE BAY', 'HONK'];
const drawProtester = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -24, f, 0, '#3F6212', '#78350F');
  ctx.fillStyle = '#F472B6'; ctx.fillRect(-13, -54, 26, 32);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-2, -40, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22D3EE'; ctx.beginPath(); ctx.arc(4, -32, 5, 0, Math.PI * 2); ctx.fill();
  head(ctx, -62, '#E0AC69');
  ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.ellipse(4, -56, 8, 6, 0, 0, Math.PI); ctx.fill(); // beard
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(2, -68, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-8, -70, 20, 4); // beanie
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -64, 7, 2);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The sign on its stick, held out in front
    ctx.fillStyle = '#92400E'; ctx.fillRect(16, -40, 4, 40);
    ctx.fillStyle = '#D6B98C'; ctx.fillRect(8, -80, 22, 46);
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.strokeRect(8, -80, 22, 46);
    ctx.save(); ctx.translate(19, -57); ctx.rotate(-Math.PI / 2);
    // (the lettering reads the right way round whichever way he's facing)
    const t = ctx.getTransform(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(1, -1);
    ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(SIGNS[Math.abs(Math.round(e.homeX || 0)) % SIGNS.length], 0, 2, 44);
    ctx.restore();
    // Torn up as it takes hits
    ctx.fillStyle = '#1C1917'; for (let i = 0; i < Math.floor(damage * 5); i++) ctx.fillRect(10 + ((i * 7) % 16), -76 + i * 9, 4, 3);
  } else {
    ctx.fillStyle = '#D6B98C'; ctx.fillRect(-28, -40, 12, 36);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#F472B6'; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
    ctx.fillStyle = '#0EA5E9'; ctx.fillRect(-7 - wind * 12, -64, 6, 12); // the water bottle
  }
};

/** A raccoon: bandit mask, ringed tail, into the trash and into your ankles. */
const drawRaccoon = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, lunging = st === 'lunge';
  const cycle = Math.abs(e.vel.x) > 0.3 ? f * (lunging ? 0.55 : 0.25) : 0;
  if (st === 'bristle') ctx.translate(f % 4 < 2 ? 1 : -1, 0);
  // Ringed tail
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#1F2937' : '#9CA3AF'; ctx.beginPath(); ctx.ellipse(-20 - i * 5, -14 + i * 1.5 + Math.sin(f * 0.2) * 2, 5, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  // Legs
  ctx.fillStyle = '#1F2937'; for (let i = 0; i < 4; i++) { const lx = (i < 2 ? 12 : -10) + (i % 2 ? 3 : -3); ctx.fillRect(lx + Math.sin(cycle + i * 1.6) * 3 - 2, -8, 4, 8); }
  // Body and head
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.ellipse(0, -14, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.ellipse(18, -16, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(14, -19, 12, 4); // the mask
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(18, -18, 2, 2); ctx.fillRect(23, -18, 2, 2);
  ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.moveTo(12, -22); ctx.lineTo(14, -28); ctx.lineTo(17, -22); ctx.fill(); // ear
  ctx.fillStyle = '#111827'; ctx.fillRect(26, -15, 3, 2);
  if (lunging) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(24, -13, 2, 3); ctx.fillRect(27, -13, 2, 3); }
};

/** A seagull: white, grey wings, a yellow beak with a red spot, a mean little eye. */
const drawSeagull = (ctx: Ctx, e: Enemy, f: number) => {
  const swoop = e.aiState === 'swoop';
  const flap = swoop ? Math.sin(f * 0.15) * 3 : Math.sin(f * 0.3) * 9;
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.moveTo(-4, -12); ctx.lineTo(-24, -22 - flap); ctx.lineTo(-8, -10); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(0, -11, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-15, -11); ctx.lineTo(-22, -14); ctx.lineTo(-22, -8); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(13, -14, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(17, -14, 8, 2); ctx.fillStyle = '#DC2626'; ctx.fillRect(22, -13, 2, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(14, -16, 2, 2);
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-16, -24 + flap); ctx.lineTo(6, -12); ctx.fill();
};

/** A quadcopter: four rotors blurring, a camera pod, a blinking light; a red laser dot on you before it fires. */
const drawDrone = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  const tilt = Math.max(-0.35, Math.min(0.35, e.vel.x * 0.06)) * (e.facing === -1 ? -1 : 1);
  ctx.save(); ctx.translate(0, -15); ctx.rotate(tilt);
  // (a good size, dark-outlined and in safety orange, with lights blinking: easy to pick out against the sky)
  ctx.scale(1.35, 1.35);
  ctx.strokeStyle = '#0B0F19'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.roundRect(-10, -7, 20, 12, 3); ctx.stroke();
  ctx.fillStyle = '#374151'; ctx.fillRect(-19, -2, 38, 4); // arms
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.roundRect(-10, -7, 20, 12, 3); ctx.fill();
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(-8, -6, 16, 2);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(4, 7, 4.5, 0, Math.PI * 2); ctx.fill(); // camera
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(4, 6, 2, 2);
  const blink = Math.floor(f / 8) % 2;
  ctx.fillStyle = blink ? '#EF4444' : '#7F1D1D'; ctx.fillRect(-2, -9, 4, 3);
  // Rotors, spinning, with a blinking light on each arm
  for (const rx of [-19, 19]) {
    ctx.fillStyle = '#1F2937'; ctx.fillRect(rx - 2.5, -7, 5, 5);
    ctx.fillStyle = blink ? (rx < 0 ? '#22C55E' : '#EF4444') : '#1F2937'; ctx.fillRect(rx - 1, -1, 2, 2);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)'; ctx.lineWidth = 2;
    const w = 12 * Math.abs(Math.cos(f * 1.3 + rx));
    ctx.beginPath(); ctx.moveTo(rx - w, -8); ctx.lineTo(rx + w, -8); ctx.stroke();
  }
  ctx.restore();
  // Aiming: a red line down to a dot on him
  if (e.aiState === 'aim') {
    const p = state.player;
    const dir = e.facing === -1 ? -1 : 1;
    const tx = (p.pos.x + p.width / 2 - (e.pos.x + e.width / 2)) * dir, ty = p.pos.y + p.height / 2 - (e.pos.y + e.height);
    const k = Math.min(1, (e.aiTimer || 0) / DRONE_AIM);
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + k * 0.6})`; ctx.lineWidth = 1 + k;
    ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(tx, ty, 3 + k * 2, 0, Math.PI * 2); ctx.fill();
  }
};

/** A goon in a wetsuit and aviators on a red jet ski, a pistol in one hand. Leaning in when he goes to ram you, sat back on the brakes. */
const drawJetskier = (ctx: Ctx, e: Enemy, f: number) => {
  if (e.aiState === 'ram') ctx.rotate(-0.08);
  if (e.aiState === 'brake') ctx.rotate(0.12);
  // The ski
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(-36, -4); ctx.lineTo(34, -4); ctx.lineTo(38, -14); ctx.lineTo(10, -20); ctx.lineTo(-30, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-30, -10, 58, 3);
  ctx.fillStyle = '#111827'; ctx.fillRect(8, -30, 4, 12); ctx.fillRect(6, -32, 14, 3); // handlebars
  // The rider, sat astride
  ctx.fillStyle = '#111827'; ctx.fillRect(-12, -24, 12, 10); ctx.fillRect(-4, -20, 14, 6); // legs
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-12, -46, 18, 24); // wetsuit
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -40, 18, 2);
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(-2, -52, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(0, -55, 9, 3); // aviators
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(4, -40, 12, 4);
  ctx.fillStyle = '#18181B'; ctx.fillRect(14, -43, 11, 4);
  // Spray off the bow
  ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; for (let i = 0; i < 3; i++) ctx.fillRect(36 + i * 4, -8 - ((f * 3 + i * 5) % 10), 2, 3);
};

/** Somebody on fire: a black silhouette in the flames, arms flailing over their head. */
const drawBurning = (ctx: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.5 ? Math.sin(f * 0.5) * 6 : 0;
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(-8 + run * 0.5, -28, 6, 28); ctx.fillRect(2 - run * 0.5, -28, 6, 28);
  ctx.fillRect(-11, -56, 22, 30);
  ctx.beginPath(); ctx.arc(1, -64, 8, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(-9, -54); ctx.rotate(-2.4 + Math.sin(f * 0.7) * 0.5); ctx.fillRect(0, -3, 20, 5); ctx.restore();
  ctx.save(); ctx.translate(9, -54); ctx.rotate(-0.7 + Math.sin(f * 0.8 + 1) * 0.5); ctx.fillRect(0, -3, 20, 5); ctx.restore();
  // Mouth open, screaming
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.ellipse(5, -62, 2.5, 3, 0, 0, Math.PI * 2); ctx.fill();
  // The flames all over them
  for (let i = 0; i < 6; i++) {
    const x = -12 + i * 5, h = 16 + Math.sin(f * 0.6 + i * 1.7) * 8;
    const y = -20 - (i % 3) * 18;
    ctx.fillStyle = i % 2 ? 'rgba(249, 115, 22, 0.9)' : 'rgba(253, 224, 71, 0.9)';
    ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.quadraticCurveTo(x + Math.sin(f * 0.4 + i) * 4, y - h, x + 5, y); ctx.fill();
  }
};
