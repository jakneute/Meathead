// Victor's stage: his goons in heat gear (a silver proximity suit with a flare
// gun, a smokejumper in turnout gear with an axe, a guy in a bomb suit behind a
// riveted blast shield), and the volcano's wildlife (a fire salamander, a
// vulture, a fish that lives in the lava). Drawn like the rest: facing right
// from a point at the feet (centre bottom), flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';

type Ctx = CanvasRenderingContext2D;

export const drawVictorKind = (ctx: Ctx, e: Enemy, f: number, _state: GameState) => {
  switch (e.kind) {
    case 'heatsuit': drawHeatsuit(ctx, e, f); break;
    case 'smokejumper': drawSmokejumper(ctx, e, f); break;
    case 'blastshield': drawBlastshield(ctx, e, f); break;
    case 'salamander': drawSalamander(ctx, e, f); break;
    case 'vulture': drawVulture(ctx, e, f); break;
    case 'magmafish': drawMagmafish(ctx, e, f); break;
    case 'raver': drawRaver(ctx, e, f); break;
    case 'firedancer': drawFiredancer(ctx, e, f); break;
    case 'partygoer': drawPartygoer(ctx, e, f); break;
  }
};

const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, boot: string) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants;
  ctx.fillRect(-8 + s, hipY, 7, -hipY - 5);
  ctx.fillRect(2 - s, hipY, 7, -hipY - 5);
  ctx.fillStyle = boot;
  ctx.fillRect(-10 + s, -6, 11, 6);
  ctx.fillRect(1 - s, -6, 11, 6);
};

/** A silver aluminized proximity suit, hood and gold mirrored visor; a flare gun that glows before it fires. */
const drawHeatsuit = (ctx: Ctx, e: Enemy, f: number) => {
  const walking = Math.abs(e.vel.x) > 0.5;
  legs(ctx, -26, f, walking ? 5 : 0, '#C7CCD4', '#3F3F46');
  // The suit: baggy, shiny, stiff
  ctx.fillStyle = '#D1D5DB';
  ctx.beginPath(); ctx.moveTo(-14, -22); ctx.lineTo(-13, -50); ctx.quadraticCurveTo(0, -58, 13, -50); ctx.lineTo(14, -22); ctx.fill();
  ctx.fillStyle = '#F3F4F6'; ctx.fillRect(-9, -50, 3, 26); // the sheen
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-14, -26, 28, 3); ctx.fillRect(-14, -38, 28, 2); // seams
  // Hood (a box over the whole head) with the gold visor
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-9, -72, 20, 22);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-9, -52, 20, 3);
  const glint = (f * 0.08) % 12;
  ctx.fillStyle = '#B45309'; ctx.fillRect(0, -68, 11, 9);
  ctx.fillStyle = '#FBBF24'; ctx.fillRect(1, -67, 9, 7);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(1 + glint * 0.6, -67, 2, 7);
  // Flare gun, fat orange barrel; it glows up before it goes
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(2, -44, 10, 6);
  ctx.fillStyle = '#EA580C'; ctx.fillRect(10, -47, 16, 8);
  ctx.fillStyle = '#9A3412'; ctx.fillRect(12, -41, 5, 7);
  if (charge > 0.5) { ctx.fillStyle = `rgba(253, 224, 71, ${charge})`; ctx.beginPath(); ctx.arc(28, -43, 2 + charge * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** Turnout gear (tan coat, reflective stripes), a black helmet with a shield, air tank on his back, an axe; he runs you down. */
const drawSmokejumper = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#B08D57', '#1C1917');
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-9, -14, 20, 3); // reflective cuffs
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(running ? 0.25 : 0);
  // Air tank on his back
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-24, -40, 9, 30); ctx.fillStyle = '#6B7280'; ctx.fillRect(-23, -44, 7, 5);
  // Coat
  ctx.fillStyle = '#C7A36B';
  ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-19, -32); ctx.quadraticCurveTo(0, -44, 19, -32); ctx.lineTo(18, 2); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-18, -6, 36, 3); ctx.fillRect(-18, -20, 36, 3);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-18, -5, 36, 1); ctx.fillRect(-18, -19, 36, 1);
  // Helmet: black, a long brim at the back, a leather shield on the front
  ctx.fillStyle = '#111827';
  ctx.beginPath(); ctx.arc(4, -46, 12, Math.PI, 0); ctx.fill();
  ctx.fillRect(-14, -47, 30, 4);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(8, -55, 7, 8);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(10, -52, 3, 3);
  // Face: soot, a breathing mask
  ctx.fillStyle = '#D6A77A'; ctx.fillRect(0, -43, 12, 9);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(6, -39, 8, 6); ctx.fillStyle = '#374151'; ctx.fillRect(12, -37, 4, 3);
  ctx.fillStyle = '#111827'; ctx.fillRect(3, -42, 3, 2);
  // The axe, held across in front
  const swing = running ? Math.sin(f * 0.45) * 0.3 : 0;
  ctx.save(); ctx.translate(12, -16); ctx.rotate(-0.9 + swing);
  ctx.fillStyle = '#92400E'; ctx.fillRect(-2, -26, 4, 34);
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(2, -26); ctx.lineTo(14, -30); ctx.lineTo(14, -16); ctx.lineTo(2, -18); ctx.fill();
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(12, -30, 3, 14);
  ctx.restore();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(10, -20, 8, 7); // glove
  ctx.restore();
};

/** A bomb-disposal suit, a welder's mask, and a riveted steel blast shield; he drops it to lob a lump of hot rock. */
const drawBlastshield = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -24, f, 0, '#3F4A3C', '#1C1917');
  // Padded bomb suit
  ctx.fillStyle = '#4B5A46';
  ctx.beginPath(); ctx.moveTo(-15, -22); ctx.lineTo(-15, -52); ctx.quadraticCurveTo(0, -60, 15, -52); ctx.lineTo(15, -22); ctx.fill();
  ctx.fillStyle = '#394535'; for (let y = -48; y < -24; y += 7) ctx.fillRect(-15, y, 30, 2);
  // Welding mask
  ctx.fillStyle = '#27272A'; ctx.fillRect(-8, -74, 20, 20);
  ctx.fillStyle = '#16A34A'; ctx.fillRect(2, -68, 9, 4);
  ctx.fillStyle = '#86EFAC'; ctx.fillRect(3 + (f * 0.06) % 6, -68, 2, 4);
  const up = !!e.isShieldActive;
  if (up) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.fillStyle = '#6B7280'; ctx.fillRect(10, -76, 18, 76);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(11, -75, 4, 74);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.strokeRect(10, -76, 18, 76);
    // Rivets, and a band of hazard stripes
    ctx.fillStyle = '#374151'; for (let y = -70; y < -4; y += 12) { ctx.fillRect(12, y, 2, 2); ctx.fillRect(24, y, 2, 2); }
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#111827' : '#FACC15'; ctx.fillRect(10, -44 + i * 4, 18, 4); }
    // Glowing where it's been hit hard
    if (damage > 0.3) { ctx.fillStyle = `rgba(249, 115, 22, ${Math.min(0.7, damage)})`; ctx.beginPath(); ctx.arc(20, -58, 5 + damage * 5, 0, Math.PI * 2); ctx.fill(); }
  } else {
    // Shield down at his side; arm back with a glowing rock
    ctx.fillStyle = '#6B7280'; ctx.fillRect(-28, -36, 12, 36);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#394535'; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
    ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.arc(-2 - wind * 12, -56, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F97316'; ctx.fillRect(-4 - wind * 12, -58, 3, 3);
  }
};

/** A fire salamander: glossy black with orange blotches, a glowing belly, a flicking tongue. Low to the ground. */
const drawSalamander = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const lunging = st === 'lunge';
  const cycle = Math.abs(e.vel.x) > 0.3 ? f * (lunging ? 0.6 : 0.3) : 0;
  const shake = st === 'bristle' ? (f % 4 < 2 ? 1 : -1) : 0;
  ctx.translate(shake, 0);
  // Tail, swishing
  ctx.fillStyle = '#18181B';
  ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(-26, -8 + Math.sin(f * 0.3) * 5, -34, -4 + Math.sin(f * 0.3 + 1) * 4); ctx.lineTo(-10, -4); ctx.fill();
  // Splayed legs
  for (let i = 0; i < 4; i++) {
    const lx = (i < 2 ? 12 : -6) + (i % 2 ? 3 : -3), sw = Math.sin(cycle + i * 1.7) * 4;
    ctx.fillStyle = '#18181B'; ctx.fillRect(lx + sw - 2, -6, 4, 6);
    ctx.fillStyle = '#F97316'; ctx.fillRect(lx + sw - 3, -1, 6, 1.5);
  }
  // Body, belly glow, blotches
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(2, -9, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(251, 146, 60, ${0.5 + 0.3 * Math.sin(f * 0.15)})`; ctx.fillRect(-10, -5, 24, 2);
  ctx.fillStyle = '#F59E0B';
  for (const [x, y, r] of [[-8, -11, 3], [0, -12, 2.5], [8, -10, 3], [-3, -8, 2]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  // Head, eye, tongue
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.ellipse(20, -9, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDE047'; ctx.fillRect(21, -12, 3, 3); ctx.fillStyle = '#000'; ctx.fillRect(22, -12, 1, 3);
  if (Math.floor(f / 10) % 3 === 0 || lunging) { ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(26, -8); ctx.lineTo(33, -8); ctx.lineTo(35, -10); ctx.moveTo(33, -8); ctx.lineTo(35, -6); ctx.stroke(); }
};

/** A vulture: sooty black wings, a bald red head, a ruff of white round its neck. */
const drawVulture = (ctx: Ctx, e: Enemy, f: number) => {
  const diving = e.aiState === 'dive';
  const flap = diving ? 2 : Math.sin(f * 0.22) * 12;
  ctx.fillStyle = '#1C1917';
  // Far wing
  ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-24, -28 - flap); ctx.lineTo(-30, -22 - flap); ctx.lineTo(-8, -12); ctx.fill();
  // Body and tail
  ctx.beginPath(); ctx.ellipse(-2, -14, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-18, -14); ctx.lineTo(-30, -18); ctx.lineTo(-30, -10); ctx.fill();
  // Ruff, bald head, hooked beak
  ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.ellipse(13, -18, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(19, -21, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(23, -22); ctx.lineTo(30, -20); ctx.lineTo(25, -17); ctx.fill();
  ctx.fillStyle = '#000'; ctx.fillRect(19, -23, 2, 2);
  // Near wing (primary feathers fingered at the tip)
  ctx.fillStyle = '#292524';
  ctx.beginPath(); ctx.moveTo(-2, -14); ctx.lineTo(-14, -30 + flap); ctx.lineTo(-26, -32 + flap); ctx.lineTo(-20, -26 + flap); ctx.lineTo(-10, -10); ctx.fill();
  // Talons out on the dive
  if (diving) { ctx.fillStyle = '#FDE68A'; ctx.fillRect(2, -6, 3, 6); ctx.fillRect(8, -6, 3, 6); }
};

/** A fish that lives in the lava: a crust of black rock cracked with glowing orange, all teeth, dripping. Under the lava, just a glint. */
const drawMagmafish = (ctx: Ctx, e: Enemy, f: number) => {
  if (!e.aiState || e.aiState === 'idle') {
    // Just the ripple and a glint where it's cruising under the surface
    ctx.fillStyle = 'rgba(253, 224, 71, 0.8)';
    ctx.beginPath(); ctx.ellipse(0, -14, 12 + Math.sin(f * 0.2) * 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(0, -22); ctx.lineTo(4, -14); ctx.fill();
    return;
  }
  const rise = e.vel.y < 0;
  ctx.save();
  ctx.translate(0, -13);
  // (flopping about on the rocks, or arcing through the air)
  ctx.rotate(e.aiState === 'flop' ? Math.sin(f * 0.6) * 0.4 : rise ? -0.5 : 0.6);
  // Tail
  ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-30, -9); ctx.lineTo(-28, 9); ctx.fill();
  // Body: rock crust, glowing cracks
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `rgba(249, 115, 22, ${0.7 + 0.3 * Math.sin(f * 0.3)})`; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-14, -3); ctx.lineTo(-6, 2); ctx.lineTo(2, -4); ctx.lineTo(10, 3); ctx.moveTo(-8, -7); ctx.lineTo(-2, -3); ctx.stroke();
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(-4, -10); ctx.lineTo(4, -18); ctx.lineTo(8, -9); ctx.fill(); // dorsal fin
  // Jaws and teeth
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(14, -2); ctx.lineTo(26, -8); ctx.lineTo(26, 6); ctx.fill();
  ctx.fillStyle = '#FEF3C7'; for (let x = 16; x < 26; x += 3) { ctx.fillRect(x, -5, 1.5, 3); ctx.fillRect(x, 2, 1.5, 3); }
  ctx.fillStyle = '#FDE047'; ctx.fillRect(10, -6, 3, 3);
  ctx.restore();
  // Lava dripping off it
  ctx.fillStyle = '#FB923C'; for (let i = 0; i < 3; i++) ctx.fillRect(-10 + i * 9, -2 + ((f * 2 + i * 7) % 12), 2, 4);
};

// ---------------------------------------------------------------------------
// Club Caldera's crowd
// ---------------------------------------------------------------------------

/** A raver: a neon mesh top in lava orange, glow goggles up on the head, platform boots; flings flaming shots. */
const drawRaver = (ctx: Ctx, e: Enemy, f: number) => {
  const walking = Math.abs(e.vel.x) > 0.5;
  const bop = Math.round(Math.abs(Math.sin(f * 0.18)) * 2);
  legs(ctx, -26, f, walking ? 5 : 0, '#18181B', '#F97316');
  ctx.fillStyle = '#111827'; ctx.fillRect(-11, -8, 11, 4); ctx.fillRect(1, -8, 11, 4); // (the platforms)
  // Mesh top over the torso, glowing seams
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(-12, -52 - bop, 24, 28);
  ctx.strokeStyle = '#FB923C'; ctx.lineWidth = 1;
  for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-12, -50 + k * 6 - bop); ctx.lineTo(12, -46 + k * 6 - bop); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12 + k * 6, -52 - bop); ctx.lineTo(-10 + k * 6, -24 - bop); ctx.stroke(); }
  ctx.fillStyle = '#F43F5E'; ctx.fillRect(-12, -28 - bop, 24, 4);
  // Head, a buzz cut dyed orange, the goggles up on it glowing, a pacifier
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(2, -62 - bop, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#EA580C'; ctx.fillRect(-7, -72 - bop, 18, 5);
  ctx.fillStyle = `rgba(52, 211, 153, ${0.7 + 0.3 * Math.sin(f * 0.3)})`; ctx.fillRect(-6, -70 - bop, 16, 4);
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -64 - bop, 2, 2);
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.arc(10, -57 - bop, 3, 0, Math.PI * 2); ctx.fill();
  // An arm up with a glowstick, the other with the shot glass, flaming, before it goes
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(-15, -66 - bop, 4, 16);
  ctx.fillStyle = f % 20 < 10 ? '#A3E635' : '#22D3EE'; ctx.fillRect(-16, -78 - bop, 4, 12);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(8, -46, 12, 4);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(18, -50, 6, 8);
  if (charge > 0.2 || f % 16 < 8) { ctx.fillStyle = `rgba(251, 146, 60, ${0.6 + charge * 0.4})`; ctx.beginPath(); ctx.moveTo(18, -50); ctx.quadraticCurveTo(21, -60 - charge * 6, 24, -50); ctx.fill(); }
};

/** A fire dancer: bare-chested, lava-red body paint, a flaming poi on a chain in each hand, spinning; he runs at you with them. */
const drawFiredancer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#7C2D12', '#1C1917');
  ctx.fillStyle = '#B45309'; ctx.fillRect(-12, -30, 24, 5); // sash
  ctx.fillStyle = '#C68B45'; ctx.fillRect(-13, -54, 26, 25);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(0, -40); ctx.lineTo(10, -50); ctx.moveTo(-8, -36); ctx.lineTo(8, -36); ctx.stroke();
  ctx.fillStyle = '#C68B45'; ctx.beginPath(); ctx.arc(2, -64, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-7, -74, 18, 6); ctx.fillRect(5, -66, 2, 2);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-4, -62, 12, 1);
  // The poi: a chain from each hand out to a ball of fire, whirling
  const spin = f * (running ? 0.45 : 0.22);
  for (const [hx, hy, ph] of [[-14, -48, 0], [16, -48, Math.PI]] as const) {
    const bx = hx + Math.cos(spin + ph) * 20, by = hy + Math.sin(spin + ph) * 20;
    ctx.fillStyle = '#C68B45'; ctx.fillRect(hx - 2, hy - 2, 4, 8);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(bx, by); ctx.stroke();
    const g = ctx.createRadialGradient(bx, by, 1, bx, by, 9);
    g.addColorStop(0, '#FEF9C3'); g.addColorStop(0.5, '#F97316'); g.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill();
    // (a trail of fire behind it)
    for (let k = 1; k < 4; k++) { const tx = hx + Math.cos(spin + ph - k * 0.3) * 20, ty = hy + Math.sin(spin + ph - k * 0.3) * 20; ctx.fillStyle = `rgba(249, 115, 22, ${0.35 - k * 0.08})`; ctx.beginPath(); ctx.arc(tx, ty, 6 - k, 0, Math.PI * 2); ctx.fill(); }
  }
};

const PARTY_SKIN = ['#E0AC69', '#8D5524', '#F1C27D', '#C68642'];
/** A partygoer: dressed for the VIP list (a shiny shirt, a sequin dress, sunglasses at night, a lanyard); dancing, or
 * running with their arms up and their mouth open. */
const drawPartygoer = (ctx: Ctx, e: Enemy, f: number) => {
  const v = e.variant ?? 0, seed = Math.abs(Math.round(e.homeX || 0));
  const skin = PARTY_SKIN[(seed + v) % PARTY_SKIN.length];
  const panic = e.aiState === 'panic';
  const bop = panic ? 0 : Math.round(Math.abs(Math.sin(f * 0.2 + seed)) * 3);
  const run = panic ? 7 : 1.5;
  const s = Math.sin(f * (panic ? 0.5 : 0.2)) * run;
  const dress = v === 1 || v === 3;
  if (dress) {
    // Legs, heels, a sequin dress (glittering)
    ctx.fillStyle = skin; ctx.fillRect(-6 + s, -22, 5, 18); ctx.fillRect(2 - s, -22, 5, 18);
    ctx.fillStyle = '#111827'; ctx.fillRect(-7 + s, -4, 7, 4); ctx.fillRect(1 - s, -4, 7, 4);
    const col = v === 1 ? '#DB2777' : '#F59E0B';
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-9, -48 - bop); ctx.lineTo(9, -48 - bop); ctx.lineTo(12, -20); ctx.lineTo(-12, -20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 5; k++) if ((f + k * 7) % 20 < 6) ctx.fillRect(-8 + k * 4, -44 + (k % 3) * 8 - bop, 2, 2);
  } else {
    // Slacks, loafers, a shiny shirt open at the collar
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-8 + s, -26, 7, 22); ctx.fillRect(2 - s, -26, 7, 22);
    ctx.fillStyle = '#44403C'; ctx.fillRect(-9 + s, -4, 9, 4); ctx.fillRect(1 - s, -4, 9, 4);
    const col = v === 0 ? '#7C3AED' : '#0EA5E9';
    ctx.fillStyle = col; ctx.fillRect(-11, -50 - bop, 22, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-9, -48 - bop, 3, 22);
    ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(-3, -50 - bop); ctx.lineTo(3, -50 - bop); ctx.lineTo(0, -42 - bop); ctx.fill();
  }
  // The VIP lanyard
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, -50 - bop); ctx.lineTo(0, -36 - bop); ctx.lineTo(4, -50 - bop); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-2, -37 - bop, 4, 5);
  // Head: hair, sunglasses at night; the mouth open, screaming, when it's all gone wrong
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, -58 - bop, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = ['#1C1917', '#FDE68A', '#78350F', '#1C1917'][v];
  if (dress) { ctx.beginPath(); ctx.arc(1, -60 - bop, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(-8, -60 - bop, 4, 14); }
  else ctx.fillRect(-6, -67 - bop, 16, 5);
  ctx.fillStyle = '#111827'; ctx.fillRect(0, -61 - bop, 10, 3);
  if (panic) { ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(5, -53, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); }
  // Arms: up in the air dancing, up in the air running
  ctx.fillStyle = skin;
  const wave = Math.sin(f * (panic ? 0.7 : 0.25) + seed) * (panic ? 6 : 4);
  ctx.fillRect(-13, -70 + wave - bop, 4, 18); ctx.fillRect(9, -70 - wave - bop, 4, 18);
  if (!panic && v === 2) { ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(9, -76 - wave - bop, 5, 7); ctx.fillStyle = '#FDE047'; ctx.fillRect(9, -73 - wave - bop, 5, 4); } // (a drink held high)
};
