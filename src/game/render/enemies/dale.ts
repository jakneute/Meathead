// Dale's stage: the cartel (a sicario with an AK and a bandana over his face, an
// enforcer in a wife-beater who runs you down swinging a machete, a man behind a
// car door he tore off something), the desert's wildlife (a rattlesnake, a
// scorpion, a coyote), and the tourists in the old west town. (Dale's
// distributor, upstairs in the warehouse, is drawn by the stage.)
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { SNAKE_RATTLE } from '../../enemies/kinds/dale';

type Ctx = CanvasRenderingContext2D;

export const drawDaleKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'sicario': drawSicario(ctx, e, f); break;
    case 'enforcer': drawEnforcer(ctx, e, f); break;
    case 'cardoor': drawCardoor(ctx, e, f); break;
    case 'rattlesnake': drawRattlesnake(ctx, e, f); break;
    case 'scorpion': drawScorpion(ctx, e, f); break;
    case 'coyote': drawCoyote(ctx, e, f); break;
    case 'visitor': drawVisitor(ctx, e, f); break;
    case 'junkie': drawJunkieStandIn(ctx, f); break;
  }
  void state;
};

const JEANS = '#1E3A8A', BOOT = '#5B3417', BOOT_TOE = '#3F2410', SKIN = '#B07A4F', SKIN_DARK = '#8C5A36';

/** Jeans and pointed cowboy boots. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants = JEANS) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-8 + s, hipY, 7, -hipY - 7); ctx.fillRect(2 - s, hipY, 7, -hipY - 7);
  ctx.fillStyle = BOOT;
  ctx.fillRect(-9 + s, -8, 9, 8); ctx.fillRect(1 - s, -8, 9, 8);
  ctx.fillStyle = BOOT_TOE;
  ctx.beginPath(); ctx.moveTo(0 + s, -5); ctx.lineTo(4 + s, -1); ctx.lineTo(0 + s, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10 - s, -5); ctx.lineTo(14 - s, -1); ctx.lineTo(10 - s, 0); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-9 + s, -1, 10, 1); ctx.fillRect(1 - s, -1, 10, 1); // heels
};

/** A tooled belt with a big shiny buckle. */
const belt = (ctx: Ctx, y: number, w: number) => {
  ctx.fillStyle = '#3F2410'; ctx.fillRect(-w / 2, y, w, 4);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-3, y - 1, 7, 6);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(-1, y + 1, 3, 2);
};

/** A sicario: black cap, shades, a bandana over his face, a flannel over a white tank, gold chain, an AK; the muzzle glows before he fires. */
const drawSicario = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0);
  belt(ctx, -30, 22);
  // Flannel, open over the tank top
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-12, -56, 24, 27);
  ctx.fillStyle = '#450A0A'; for (let y = -54; y < -30; y += 6) ctx.fillRect(-12, y, 24, 2); for (let x = -10; x < 12; x += 6) ctx.fillRect(x, -56, 2, 26);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-4, -56, 8, 26);
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -56, 6, 0.3, Math.PI - 0.3); ctx.stroke();
  // Head: skin, a black bandana up to the nose, shades, a black cap backward... no, forward, brim down
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -64, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-6, -63); ctx.lineTo(12, -64); ctx.lineTo(10, -55); ctx.lineTo(-5, -56); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; for (let i = 0; i < 3; i++) ctx.fillRect(1 + i * 3, -60, 1, 1); // paisley dots
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(1, -69, 11, 4);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(2, -70, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(4, -72, 12, 3);
  // The AK: wooden stock and grip, the curved magazine, held at the hip-shoulder
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#92400E'; ctx.fillRect(-12, -44, 14, 6); // stock
  ctx.fillStyle = '#1F2937'; ctx.fillRect(0, -46, 24, 5); // receiver
  ctx.fillStyle = '#92400E'; ctx.fillRect(10, -46, 9, 5); // handguard
  ctx.fillStyle = '#111827'; ctx.fillRect(24, -45, 8, 2); // barrel
  ctx.save(); ctx.translate(6, -41); ctx.rotate(0.35); ctx.fillStyle = '#1F2937'; ctx.fillRect(0, 0, 5, 11); ctx.restore(); // magazine
  ctx.fillStyle = SKIN_DARK; ctx.fillRect(2, -41, 5, 5); ctx.fillRect(14, -45, 5, 5); // hands
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(34, -44, 2 + charge * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** The enforcer: shaved head, tattoos everywhere, a stained wife-beater, a machete he swings as he runs you down. */
const drawEnforcer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#44403C');
  belt(ctx, -32, 26);
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.28 : 0);
  // Big slab of a torso in a tank top
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-19, -34); ctx.quadraticCurveTo(0, -44, 19, -34); ctx.lineTo(17, 0); ctx.fill();
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-12, -32, 24, 32);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.35)'; ctx.beginPath(); ctx.ellipse(4, -12, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); // a stain
  // Neck and chest tattoos
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-16, -30, 3, 10); ctx.fillRect(13, -28, 3, 8); ctx.fillRect(-4, -36, 8, 2);
  // Head: shaved, a teardrop tattoo, a mustache, a scowl
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(3, -44, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.arc(3, -48, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(6, -47, 6, 2); ctx.fillRect(5, -40, 8, 2);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(9, -44, 1, 2);
  // Arm and the machete, swinging
  const sw = running ? Math.sin(f * 0.45) * 0.7 : 0.2;
  ctx.save(); ctx.translate(12, -30); ctx.rotate(-0.6 + sw);
  ctx.fillStyle = SKIN; ctx.fillRect(0, -4, 16, 8);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(4, -3, 6, 2);
  ctx.fillStyle = '#3F2410'; ctx.fillRect(14, -3, 8, 6); // grip
  ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.moveTo(22, -3); ctx.lineTo(50, -6); ctx.quadraticCurveTo(54, 0, 48, 4); ctx.lineTo(22, 3); ctx.fill();
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(24, 1, 22, 1);
  ctx.restore();
  ctx.restore();
};

/** A goon behind a car door he's torn off something (the window's gone, it's full of holes); he drops it to throw a bottle. */
const drawCardoor = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -26, f, 0, '#374151');
  // Hoodie
  ctx.fillStyle = '#334155'; ctx.fillRect(-13, -54, 26, 30);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(-13, -30, 26, 4); ctx.fillRect(-6, -40, 12, 6);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -62, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(1, -64, 11, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); // the hood up
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-4, -61, 15, 7); // red bandana
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -66, 6, 2);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The door: sky blue, dented, a handle and a mirror, the window frame empty
    ctx.fillStyle = '#60A5FA'; ctx.beginPath(); ctx.moveTo(10, -72); ctx.lineTo(30, -76); ctx.lineTo(30, -4); ctx.lineTo(10, -2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1E40AF'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0F172A'; ctx.fillRect(13, -68, 14, 18); // empty window
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(14, -44, 8, 3); // handle
    ctx.fillStyle = '#1F2937'; ctx.fillRect(28, -58, 6, 5); // the mirror
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(12, -30, 16, 2);
    // Bullet holes and dents as it takes hits
    ctx.fillStyle = '#0F172A';
    for (let i = 0; i < Math.floor(damage * 8) + 1; i++) { ctx.beginPath(); ctx.arc(14 + ((i * 7) % 14), -40 + ((i * 13) % 34), 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'; if (damage > 0.4) { ctx.beginPath(); ctx.ellipse(20, -20, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill(); }
  } else {
    // Door down at his side, winding up to throw a bottle
    ctx.fillStyle = '#60A5FA'; ctx.fillRect(-30, -40, 12, 38);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#334155'; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
    ctx.fillStyle = '#65A30D'; ctx.fillRect(-7 - wind * 12, -66, 5, 13); ctx.fillStyle = '#FDE68A'; ctx.fillRect(-7 - wind * 12, -62, 5, 4);
  }
};

/** A western diamondback: tan with brown diamonds, coiled up with its head raised; the rattle a blur when it's warning you. */
const drawRattlesnake = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const striking = st === 'strike';
  const rattling = st === 'rattle';
  const body = '#C2A26B', dark = '#6B4A2A';
  if (striking || st === 'recoil') {
    // Stretched out along the ground in an S, head forward
    const reach = striking ? 1 : 0.6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = body; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-26, -4);
    for (let x = -26; x <= 14 * reach; x += 4) ctx.lineTo(x, -4 - Math.sin((x + f) * 0.35) * 3);
    ctx.stroke();
    ctx.fillStyle = dark; for (let x = -22; x < 12 * reach; x += 8) { ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x + 3, -7); ctx.lineTo(x + 6, -4); ctx.lineTo(x + 3, -1); ctx.fill(); }
    ctx.lineCap = 'butt';
    const hx = 16 * reach + 6;
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(hx, -6, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (striking) { ctx.fillStyle = '#FDF2F8'; ctx.beginPath(); ctx.moveTo(hx + 4, -6); ctx.lineTo(hx + 12, -10); ctx.lineTo(hx + 12, -2); ctx.fill(); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(hx + 7, -9, 1, 3); ctx.fillRect(hx + 10, -9, 1, 3); }
    ctx.fillStyle = '#111827'; ctx.fillRect(hx + 1, -9, 2, 2);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-32, -6, 6, 4);
    return;
  }
  // Coiled: stacked loops, the tail up with its rattle, the head raised on its neck
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i % 2 ? body : '#B08E57';
    ctx.beginPath(); ctx.ellipse(-4, -3 - i * 4, 16 - i * 3, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = dark; for (let i = 0; i < 5; i++) { const x = -16 + i * 7; ctx.beginPath(); ctx.moveTo(x, -4); ctx.lineTo(x + 3, -7); ctx.lineTo(x + 6, -4); ctx.lineTo(x + 3, -1); ctx.fill(); }
  // The rattle, shaking
  const shake = rattling ? Math.sin(f * 2.4) * 2 : 0;
  ctx.fillStyle = '#E7E5E4'; for (let i = 0; i < 3; i++) ctx.fillRect(-20 + shake, -16 - i * 3, 5, 3);
  if (rattling) { ctx.strokeStyle = 'rgba(231, 229, 228, 0.6)'; ctx.lineWidth = 1; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(-18, -18, 6 + i * 4 + (f % 6), -2.6, -1.2); ctx.stroke(); } }
  // Neck up in an S and the head, cocked back (further back just before it goes)
  const back = rattling ? Math.min(1, (e.aiTimer || 0) / SNAKE_RATTLE) * 4 : 0;
  ctx.strokeStyle = body; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(6, -12); ctx.quadraticCurveTo(14 - back, -18, 8 - back, -24); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(12 - back, -26, 7, 5, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(13 - back, -29, 2, 2);
  // Tongue flicking
  if (f % 30 < 8) { ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(18 - back, -25); ctx.lineTo(24 - back, -25); ctx.lineTo(26 - back, -27); ctx.moveTo(24 - back, -25); ctx.lineTo(26 - back, -23); ctx.stroke(); }
};

/** A bark scorpion: straw colored, pincers out, its tail curled over its back with the stinger poised. */
const drawScorpion = (ctx: Ctx, e: Enemy, f: number) => {
  const moving = Math.abs(e.vel.x) > 0.3;
  const pinch = e.aiState === 'pinch';
  const body = '#D4A95C', dark = '#8A6A30';
  // Legs, four a side
  ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const lx = -8 + i * 5, sw = moving ? Math.sin(f * 0.6 + i * 1.3) * 2 : 0;
    ctx.beginPath(); ctx.moveTo(lx, -5); ctx.lineTo(lx - 3 + sw, -1); ctx.lineTo(lx - 4 + sw, 0); ctx.stroke();
  }
  // Body segments
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -6, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark; for (let i = -8; i < 10; i += 4) ctx.fillRect(i, -9, 1, 6);
  // Pincers
  const open = pinch ? Math.abs(Math.sin(f * 0.5)) * 3 : 1;
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(14, -8, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(16, -9); ctx.lineTo(22, -10 - open); ctx.lineTo(18, -8); ctx.lineTo(22, -6 + open); ctx.lineTo(16, -7); ctx.fill();
  // Tail arching over the back, stinger toward the front
  const flick = pinch ? Math.sin(f * 0.8) * 3 : 0;
  ctx.strokeStyle = body; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-18, -16, -8, -20 + flick); ctx.quadraticCurveTo(0, -22 + flick, 2, -16 + flick); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#3F2A10'; ctx.beginPath(); ctx.moveTo(2, -17 + flick); ctx.lineTo(6, -13 + flick); ctx.lineTo(1, -14 + flick); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(9, -8, 1, 1);
};

/** A coyote: rangy, tan and grey, big ears, a bushy black-tipped tail; hackles up and teeth out when it comes for you. */
const drawCoyote = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const lunging = st === 'lunge';
  const moving = Math.abs(e.vel.x) > 0.3;
  const cycle = moving ? f * (lunging ? 0.5 : 0.22) : 0;
  const crouch = st === 'bristle' ? 4 : 0;
  if (st === 'bristle') ctx.translate(f % 4 < 2 ? 1 : -1, 0);
  const coat = '#B48A5A', shade = '#8A6A45', belly = '#E7D5B5';
  // Legs, long and thin
  ctx.fillStyle = shade;
  for (let i = 0; i < 4; i++) {
    const lx = (i < 2 ? 14 : -14) + (i % 2 ? 3 : -3);
    const swing = Math.sin(cycle + i * 1.6) * (lunging ? 8 : 4);
    ctx.fillRect(lx + swing * 0.5 - 2, -16 + crouch * 0.5, 4, 16 - crouch * 0.5);
  }
  // Tail, bushy, the tip black (tucked low when it's slinking about, straight out on the lunge)
  ctx.fillStyle = coat;
  ctx.save(); ctx.translate(-22, -20 + crouch); ctx.rotate(lunging ? -0.2 : 0.7 + Math.sin(f * 0.1) * 0.1);
  ctx.beginPath(); ctx.ellipse(-10, 0, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1F1A14'; ctx.beginPath(); ctx.ellipse(-20, 0, 4, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Body
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(0, -21 + crouch, 22, 9 - crouch * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(2, -16 + crouch, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.ellipse(-4, -27 + crouch, 14, 3, 0, 0, Math.PI * 2); ctx.fill(); // grizzled back
  if (st === 'bristle' || lunging) { ctx.fillStyle = shade; for (let i = -12; i < 10; i += 5) { ctx.beginPath(); ctx.moveTo(i, -29 + crouch); ctx.lineTo(i + 2.5, -34 + crouch); ctx.lineTo(i + 5, -29 + crouch); ctx.fill(); } }
  // Head: long muzzle, big pointed ears
  const hx = 22, hy = -28 + crouch + (lunging ? 3 : 0);
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(hx, hy, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 4, hy - 3); ctx.lineTo(hx + 16, hy + 1); ctx.lineTo(hx + 4, hy + 5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx - 5, hy - 4); ctx.lineTo(hx - 3, hy - 15); ctx.lineTo(hx + 1, hy - 5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx, hy - 5); ctx.lineTo(hx + 3, hy - 15); ctx.lineTo(hx + 5, hy - 4); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(hx + 15, hy, 2, 2); ctx.fillRect(hx + 3, hy - 2, 2, 2);
  if (lunging || st === 'bristle') { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx + 6, hy + 3, 9, 2); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(hx + 8, hy + 2, 1, 2); ctx.fillRect(hx + 12, hy + 3, 1, 2); }
};

/** Tourists in the old west town: a gift-shop cowboy hat, a souvenir tee, a fanny pack; what they're up to is their variant. */
const TEES = ['#F97316', '#22D3EE', '#F472B6', '#A3E635', '#FDE047', '#E5E7EB'];
const TOURIST_SKIN = ['#F2C9A0', '#E0AC69', '#C68642', '#8D5524', '#FBD5B0'];
const drawVisitor = (ctx: Ctx, e: Enemy, f: number) => {
  const seed = Math.abs(Math.round(e.homeX || 0));
  const v = e.variant ?? 0;
  const skin = TOURIST_SKIN[seed % TOURIST_SKIN.length], tee = TEES[(v + seed) % TEES.length];
  const panicking = e.aiState === 'flee' || e.aiState === 'shelter';
  const running = panicking || Math.abs(e.vel.x) > 1;
  const s = Math.sin(f * (running ? 0.45 : 0.2)) * (running ? 7 : Math.abs(e.vel.x) > 0.2 ? 3 : 0);
  // Cargo shorts, white socks pulled up, sandals
  ctx.fillStyle = skin; ctx.fillRect(-8 + s, -24, 6, 20); ctx.fillRect(2 - s, -24, 6, 20);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8 + s, -12, 6, 8); ctx.fillRect(2 - s, -12, 6, 8);
  ctx.fillStyle = '#78350F'; ctx.fillRect(-9 + s, -3, 8, 3); ctx.fillRect(1 - s, -3, 8, 3);
  ctx.fillStyle = '#A3A38A'; ctx.fillRect(-10, -32, 20, 10);
  // The souvenir tee, a fanny pack
  ctx.fillStyle = tee; ctx.fillRect(-11, -54, 22, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center';
  { const t = ctx.getTransform(); ctx.save(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(-1, 1); ctx.fillText('NM', 0, -42); ctx.restore(); }
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -33, 16, 6); ctx.fillStyle = '#111827'; ctx.fillRect(-10, -31, 20, 1);
  // Head, sunburnt nose, the hat
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, -62, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.fillRect(8, -62, 3, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -64, 2, 2);
  ctx.fillStyle = ['#D6B98C', '#1C1917', '#F8FAFC'][seed % 3];
  ctx.beginPath(); ctx.ellipse(1, -68, 15, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-7, -77, 16, 9); ctx.fillStyle = '#7C2D12'; ctx.fillRect(-7, -70, 16, 2);
  ctx.fillStyle = skin;
  if (panicking) {
    const flail = Math.sin(f * 0.6) * 5;
    ctx.fillRect(-12, -72 + flail, 4, 18); ctx.fillRect(8, -72 - flail, 4, 18);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(6, -58, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (v === 0 || v === 2) {
    // A camera up to the face, snapping away (a flash now and then)
    ctx.fillRect(6, -60, 10, 4);
    ctx.fillStyle = '#111827'; ctx.fillRect(12, -66, 8, 7); ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(20, -62, 2.5, 0, Math.PI * 2); ctx.fill();
    if (f % 140 < 4) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(22, -64, 7, 0, Math.PI * 2); ctx.fill(); }
  } else if (v === 4) {
    // A churro
    ctx.fillRect(6, -46, 10, 4);
    ctx.save(); ctx.translate(15, -48); ctx.rotate(-0.8); ctx.fillStyle = '#B45309'; ctx.fillRect(0, -2, 16, 4); ctx.fillStyle = '#FDE68A'; for (let i = 2; i < 16; i += 3) ctx.fillRect(i, -2, 1, 4); ctx.restore();
  } else {
    // Swinging arms, a map in one hand
    ctx.fillRect(6, -50, 4, 16);
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(8, -38, 10, 8); ctx.fillStyle = '#DC2626'; ctx.fillRect(11, -35, 3, 1);
  }
};

/** (Dale's distributor is drawn by the stage: this is only for anything that draws him out of context.) */
const drawJunkieStandIn = (ctx: Ctx, f: number) => {
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-14, -70, 28, 40);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-12, -30, 24, 30);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -80, 10, 0, Math.PI * 2); ctx.fill();
  void f;
};
