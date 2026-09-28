// Barry's stage: New York. The street (a pimp with a gold-plated pistol, a hooker
// with a purse she'll swing at you, a mugger with a switchblade, a bum behind his
// shopping cart with a forty to throw, rats), the skyscraper's lobby (a security
// guard, a commuter with a briefcase, a guy behind his newspaper with a coffee),
// the office (an exec with a desk-drawer revolver, an intern at a flat run, HR
// behind a rolling whiteboard with a stapler), maintenance (an exterminator with
// a bug-spray gun, a janitor with a mop, a custodian behind a WET FLOOR sign with
// a spray bottle), the lab (a lab tech with a ray gun, a test subject off his
// leash, a scientist behind a blast shield with a flask), the tenants in their
// windows and Barry's man in the power room.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';

type Ctx = CanvasRenderingContext2D;

export const drawBarryKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'pimp': drawPimp(ctx, e, f); break;
    case 'hooker': drawHooker(ctx, e, f); break;
    case 'mugger': drawMugger(ctx, e, f); break;
    case 'bum': drawBum(ctx, e, f); break;
    case 'rat': drawRat(ctx, e, f); break;
    case 'guard': drawGuard(ctx, e, f); break;
    case 'commuter': drawCommuter(ctx, e, f); break;
    case 'reader': drawReader(ctx, e, f); break;
    case 'exec': drawExec(ctx, e, f); break;
    case 'intern': drawIntern(ctx, e, f); break;
    case 'hr': drawHr(ctx, e, f); break;
    case 'exterminator': drawExterminator(ctx, e, f); break;
    case 'janitor': drawJanitor(ctx, e, f); break;
    case 'custodian': drawCustodian(ctx, e, f); break;
    case 'labtech': drawLabtech(ctx, e, f); break;
    case 'subject': drawSubject(ctx, e, f); break;
    case 'scientist': drawScientist(ctx, e, f); break;
    case 'tenant': drawTenant(ctx, e, f); break;
    case 'minion': drawMinion(ctx, e, f); break;
    case 'generator': drawGeneratorBox(ctx, e, f); break;
  }
  void state;
};

const SKINS = ['#F2C9A0', '#C68642', '#8D5524', '#E0AC69', '#5C3A21'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round(e.homeX || 0)) % SKINS.length];

/** Two legs in trousers, shoes; striding when `stride` is up. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe = '#111827') => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-8 + s, hipY, 7, -hipY - 5); ctx.fillRect(2 - s, hipY, 7, -hipY - 5);
  ctx.fillStyle = shoe; ctx.fillRect(-9 + s, -5, 10, 5); ctx.fillRect(1 - s, -5, 10, 5);
};

/** A head at (x, y), facing right: skin, eye, a line of mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8) => {
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 3, y - 2, 2, 2); ctx.fillRect(x + 2, y + 3, 5, 1);
};

/** A pistol out in front at chest height (x, y the grip), glowing at the muzzle before it fires. */
const pistol = (ctx: Ctx, x: number, y: number, e: Enemy, metal = '#1F2937') => {
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = metal; ctx.fillRect(x, y - 3, 16, 5); ctx.fillRect(x, y, 5, 7);
  if (charge > 0.6) { ctx.fillStyle = `rgba(254, 240, 138, ${charge})`; ctx.beginPath(); ctx.arc(x + 19, y - 1, 2 + charge * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** The wind-up behind the head with whatever he's going to throw (drawn by `item`), shield down at his side. */
const windUp = (ctx: Ctx, e: Enemy, arm: string, item: (x: number, y: number) => void) => {
  const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
  ctx.fillStyle = arm; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
  item(-3 - wind * 12, -60);
};

// ---------------------------------------------------------------------------
// The street
// ---------------------------------------------------------------------------

/** A pimp: a purple fur coat, a wide-brimmed hat with a feather, gold chains, shades, a gold-plated pistol. */
const drawPimp = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#6D28D9', '#F8FAFC');
  ctx.fillStyle = '#7C3AED'; ctx.fillRect(-15, -56, 30, 34);
  ctx.fillStyle = '#C4B5FD'; for (let y = -54; y < -22; y += 6) { ctx.fillRect(-15, y, 5, 4); ctx.fillRect(10, y + 3, 5, 4); } // the fur
  ctx.fillStyle = '#F5F3FF'; ctx.fillRect(-4, -54, 8, 26);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-5, -50, 10, 2); ctx.fillRect(-3, -46, 6, 2); ctx.fillRect(-1, -44, 3, 4); // chains, a medallion
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#111827'; ctx.fillRect(1, -67, 11, 3); // shades
  ctx.fillStyle = '#6D28D9'; ctx.beginPath(); ctx.ellipse(1, -71, 17, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-8, -81, 18, 10);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-8, -74, 18, 2);
  ctx.fillStyle = '#F472B6'; ctx.beginPath(); ctx.moveTo(-6, -76); ctx.quadraticCurveTo(-18, -92, -10, -96); ctx.quadraticCurveTo(-10, -84, -4, -78); ctx.fill(); // the feather
  ctx.fillStyle = skin; ctx.fillRect(8, -46, 10, 6);
  pistol(ctx, 16, -43, e, '#EAB308');
};

/** A hooker: platinum wig, a pink minidress and fishnets, platform heels, a big purse she swings at you. */
const drawHooker = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  const s = Math.sin(f * (running ? 0.45 : 0.2)) * (running ? 6 : 1);
  ctx.fillStyle = skin; ctx.fillRect(-7 + s, -30, 6, 24); ctx.fillRect(2 - s, -30, 6, 24);
  ctx.strokeStyle = 'rgba(17,24,39,0.6)'; ctx.lineWidth = 1; for (let y = -28; y < -8; y += 4) { ctx.beginPath(); ctx.moveTo(-7 + s, y); ctx.lineTo(-1 + s, y + 3); ctx.moveTo(2 - s, y); ctx.lineTo(8 - s, y + 3); ctx.stroke(); } // fishnets
  ctx.fillStyle = ['#EC4899', '#A855F7', '#EF4444', '#22D3EE'][(e.variant ?? 0) % 4];
  ctx.fillRect(-8 + s, -8, 8, 8); ctx.fillRect(1 - s, -8, 8, 8); // platforms
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.18 : 0);
  ctx.fillStyle = ['#EC4899', '#A855F7', '#EF4444', '#22D3EE'][(e.variant ?? 0) % 4];
  ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-9, -28); ctx.lineTo(9, -28); ctx.lineTo(11, 0); ctx.fill();
  ctx.fillStyle = skin; ctx.fillRect(-5, -32, 10, 5);
  head(ctx, 2, -38, skin);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(6, -34, 4, 2); // lipstick
  ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(0, -42, 11, Math.PI, 0); ctx.fill(); ctx.fillRect(-11, -42, 8, 16); // the wig
  // The purse, swinging round on its strap
  const sw = running ? Math.sin(f * 0.5) * 1.2 : 0.4;
  ctx.save(); ctx.translate(6, -24); ctx.rotate(-0.8 + sw);
  ctx.fillStyle = skin; ctx.fillRect(0, -2, 12, 4);
  ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(22, 0); ctx.stroke();
  ctx.fillStyle = '#111827'; ctx.fillRect(20, -6, 14, 12); ctx.fillStyle = '#FACC15'; ctx.fillRect(25, -2, 4, 3);
  ctx.restore();
  ctx.restore();
};

/** A mugger: ski mask, black hoodie, a switchblade, low and fast. */
const drawMugger = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#27272A', '#F8FAFC');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0.05);
  ctx.fillStyle = '#18181B'; ctx.fillRect(-12, -28, 24, 28);
  ctx.fillStyle = '#27272A'; ctx.fillRect(-7, -12, 14, 6);
  ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(2, -35, 9, 0, Math.PI * 2); ctx.fill(); // the mask
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(3, -38, 8, 3); ctx.fillRect(5, -31, 5, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(6, -38, 2, 2);
  const jab = running ? Math.sin(f * 0.6) * 5 : 0;
  ctx.fillStyle = '#18181B'; ctx.fillRect(8, -20, 12 + jab, 6);
  ctx.fillStyle = '#E0AC69'; ctx.fillRect(18 + jab, -20, 5, 6);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(22 + jab, -19, 5, 3);
  ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.moveTo(27 + jab, -19); ctx.lineTo(38 + jab, -18); ctx.lineTo(27 + jab, -16); ctx.fill();
  ctx.restore();
};

/** A bum behind his shopping cart (full of cans, a flag stuck in it); drops back to throw a forty in a paper bag. */
const drawBum = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -26, f, 0, '#57534E', '#44403C');
  ctx.fillStyle = '#78716C'; ctx.fillRect(-14, -56, 28, 32); // an overcoat
  ctx.fillStyle = '#57534E'; ctx.fillRect(-14, -40, 28, 3); ctx.fillStyle = '#A8A29E'; ctx.fillRect(-6, -52, 5, 5); // a patch
  head(ctx, 2, -62, skin);
  ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.ellipse(4, -56, 8, 6, 0, 0, Math.PI); ctx.fill(); // the beard
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(2, -67, 9, Math.PI, 0); ctx.fill(); // a beanie
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The cart, out in front of him: wire basket, full of cans and bags
    ctx.save(); ctx.translate(10, 0);
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2;
    ctx.strokeRect(2, -56, 30, 32); for (let x = 8; x < 32; x += 6) { ctx.beginPath(); ctx.moveTo(x, -56); ctx.lineTo(x, -24); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(2, -24); ctx.lineTo(4, -10); ctx.lineTo(30, -10); ctx.lineTo(32, -24); ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(8, -5, 4, 0, Math.PI * 2); ctx.arc(28, -5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D1D5DB'; for (let i = 0; i < 6; i++) ctx.fillRect(5 + (i * 7) % 24, -62 + (i % 2) * 4, 5, 8); // cans
    ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.ellipse(22, -60, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); // a garbage bag
    ctx.fillStyle = '#DC2626'; ctx.fillRect(4, -84, 2, 26); ctx.fillStyle = '#1D4ED8'; ctx.fillRect(6, -84, 10, 6); // the flag
    ctx.fillStyle = 'rgba(17,24,39,0.5)'; for (let i = 0; i < Math.floor(damage * 5); i++) ctx.fillRect(6 + i * 5, -40 + (i % 2) * 6, 3, 3); // dents
    ctx.restore();
  } else {
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.strokeRect(-40, -44, 22, 26);
    windUp(ctx, e, '#78716C', (x, y) => { ctx.fillStyle = '#C8A26B'; ctx.fillRect(x - 3, y, 7, 12); ctx.fillStyle = '#78350F'; ctx.fillRect(x - 1, y - 5, 3, 5); });
  }
};

/** A New York rat: grey-brown, pink tail and ears, fat on pizza. */
const drawRat = (ctx: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.7) * 2 : 0;
  ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(-22, -10 + run, -28, -2); ctx.stroke();
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.ellipse(-1, -7, 12, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B6560'; ctx.beginPath(); ctx.ellipse(11, -7, 6, 4.5, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F9A8D4'; ctx.beginPath(); ctx.arc(7, -12, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(16, -7, 2, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(12, -9, 2, 2);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-6 + run, -2, 3, 2); ctx.fillRect(5 - run, -2, 3, 2);
  if (e.aiState === 'lunge') { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(16, -5, 2, 2); } // teeth
};

// ---------------------------------------------------------------------------
// The lobby
// ---------------------------------------------------------------------------

/** Lobby security: a navy blazer, a radio on the shoulder, a pistol. */
const drawGuard = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1E293B');
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-14, -56, 28, 30);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-3, -56, 6, 18); ctx.fillStyle = '#1E293B'; ctx.fillRect(-1, -54, 2, 14);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-11, -50, 5, 4); // badge
  ctx.fillStyle = '#111827'; ctx.fillRect(8, -58, 4, 8); // radio
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.arc(2, -68, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = skin; ctx.fillRect(10, -46, 8, 6);
  pistol(ctx, 16, -43, e);
};

/** A commuter: suit, tie over the shoulder, briefcase swinging, earbuds in, a flat run and no time for you. */
const drawCommuter = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#374151');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.25 : 0);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-13, -28, 26, 28);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-3, -28, 6, 12);
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(-1, -26); ctx.lineTo(running ? -14 : 2, running ? -22 : -12); ctx.lineTo(3, -26); ctx.fill(); // the tie, flying
  head(ctx, 2, -36, skin);
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(1, -40, 8.5, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-2, -37, 2, 3); // an earbud
  const sw = running ? Math.sin(f * 0.45) * 0.8 : 0;
  ctx.save(); ctx.translate(6, -18); ctx.rotate(0.3 + sw);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(0, -3, 12, 6);
  ctx.fillStyle = '#78350F'; ctx.fillRect(10, -2, 20, 15); ctx.fillStyle = '#D6D3D1'; ctx.fillRect(18, -5, 5, 3);
  ctx.restore();
  ctx.restore();
};

/** A guy behind his newspaper (the Post: HEADLESS BODY...), who puts it down to throw his coffee. */
const drawReader = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#78716C', '#3F2410');
  ctx.fillStyle = '#A16207'; ctx.fillRect(-13, -56, 26, 30); // a camel coat
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(1, -70, 13, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-6, -78, 14, 8); // a trilby
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(0, -76, 22, 60);
    ctx.fillStyle = '#111827'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center';
    { const t = ctx.getTransform(); ctx.save(); if (t.a * t.d - t.b * t.c < 0) { ctx.translate(11, 0); ctx.scale(-1, 1); ctx.translate(-11, 0); } ctx.fillText('POST', 11, -68); ctx.restore(); }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9CA3AF'; for (let y = -62; y < -20; y += 4) ctx.fillRect(2, y, 18, 1);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(3, -50, 8, 10);
    ctx.fillStyle = '#0F172A'; for (let i = 0; i < Math.floor(damage * 6) + 1; i++) ctx.fillRect(4 + (i * 5) % 16, -60 + (i * 11) % 38, 2, 2); // holes in it
    ctx.restore();
  } else {
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-28, -40, 12, 20);
    windUp(ctx, e, '#A16207', (x, y) => { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 3, y, 7, 10); ctx.fillStyle = '#15803D'; ctx.fillRect(x - 1, y + 3, 3, 3); });
  }
};

// ---------------------------------------------------------------------------
// The office
// ---------------------------------------------------------------------------

/** An exec: pinstripes, suspenders, slicked hair, a revolver out of his desk drawer. */
const drawExec = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1F2937', '#3F2410');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-13, -56, 26, 30);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-9, -56, 3, 30); ctx.fillRect(6, -56, 3, 30); // suspenders
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-2, -56, 4, 20); // tie
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(0, -68, 9, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); ctx.fillRect(-8, -70, 14, 3); // slicked back
  ctx.fillStyle = skin; ctx.fillRect(10, -46, 8, 6);
  pistol(ctx, 16, -43, e, '#9CA3AF');
};

/** An intern: lanyard, short sleeves, a tray of coffees, running at you like his job depends on it. */
const drawIntern = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -28, f * (running ? 1.9 : 0.6), running ? 7 : 1, '#A8A29E', '#F8FAFC');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-11, -26, 22, 26);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-1, -26, 2, 16); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-3, -12, 6, 7); // the lanyard, the badge
  head(ctx, 2, -33, skin);
  ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.arc(2, -37, 8.5, Math.PI, 0); ctx.fill();
  ctx.fillStyle = skin; ctx.fillRect(6, -20, 16, 5);
  ctx.fillStyle = '#A16207'; ctx.fillRect(18, -24, 18, 3); // the tray
  for (let k = 0; k < 3; k++) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(19 + k * 6, -32, 5, 8); ctx.fillStyle = '#15803D'; ctx.fillRect(20 + k * 6, -29, 3, 2); }
  ctx.restore();
};

/** HR behind a rolling whiteboard (SYNERGY), who comes out from behind it to throw a stapler. */
const drawHr = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#6B7280', '#111827');
  ctx.fillStyle = '#BE185D'; ctx.fillRect(-13, -56, 26, 30); // a cardigan
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-4, -56, 8, 10);
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.arc(1, -66, 9.5, Math.PI * 0.9, Math.PI * 2.1); ctx.fill(); ctx.beginPath(); ctx.arc(-6, -70, 5, 0, Math.PI * 2); ctx.fill(); // a bun
  ctx.fillStyle = '#111827'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.strokeRect(2, -67, 5, 3); ctx.strokeRect(7, -67, 4, 3); // glasses
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(10, -10, 3, 10); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(4, -2, 3, 0, Math.PI * 2); ctx.arc(20, -2, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(0, -78, 26, 68); ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.strokeRect(0, -78, 26, 68);
    ctx.save(); ctx.translate(13, -44); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#2563EB'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SYNERGY', 0, 2); ctx.restore();
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -20); ctx.lineTo(10, -28); ctx.lineTo(16, -24); ctx.lineTo(22, -34); ctx.stroke(); // a chart, going up
    ctx.fillStyle = '#0F172A'; for (let i = 0; i < Math.floor(damage * 6) + 1; i++) ctx.fillRect(3 + (i * 7) % 20, -70 + (i * 13) % 50, 2, 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-34, -64, 16, 54);
    windUp(ctx, e, '#BE185D', (x, y) => { ctx.fillStyle = '#111827'; ctx.fillRect(x - 6, y + 3, 12, 3); ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 6, y, 11, 3); });
  }
};

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

/** An exterminator: coveralls, a respirator, a pump tank on his back and the spray wand; it hisses before it goes. */
const drawExterminator = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, 0, '#65A30D', '#111827');
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-20, -58, 10, 28); ctx.fillStyle = '#6B7280'; ctx.fillRect(-19, -62, 8, 4); // the tank
  ctx.fillStyle = '#65A30D'; ctx.fillRect(-12, -56, 26, 30);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8, -50, 10, 5); ctx.fillStyle = '#DC2626'; ctx.fillRect(-7, -49, 3, 3); // BUGS OUT patch
  ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(2, -64, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#374151'; ctx.fillRect(2, -63, 9, 7); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(10, -59, 3, 0, Math.PI * 2); ctx.fill(); // respirator
  ctx.fillStyle = '#FACC15'; ctx.fillRect(3, -69, 8, 3); // goggles
  ctx.fillStyle = '#65A30D'; ctx.fillRect(-7, -76, 16, 6);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-12, -44); ctx.quadraticCurveTo(0, -30, 12, -42); ctx.stroke(); // the hose
  ctx.fillStyle = '#374151'; ctx.fillRect(10, -45, 22, 4);
  if (charge > 0.5) { ctx.fillStyle = `rgba(190, 242, 100, ${charge * 0.7})`; ctx.beginPath(); ctx.arc(34, -43, 2 + charge * 4, 0, Math.PI * 2); ctx.fill(); }
};

/** The janitor: grey work shirt, name patch, a big mop he swings like a claymore. */
const drawJanitor = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, '#57534E');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.25 : 0);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(-14, -30, 28, 30);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(4, -26, 8, 4); ctx.fillStyle = '#DC2626'; ctx.fillRect(5, -25, 6, 1);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-14, -8, 6, 6); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-12, -6, 2, 10); // keys on his belt
  head(ctx, 2, -38, skin);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(2, -34, 8, 3); // a grey mustache
  ctx.fillStyle = '#1E3A8A'; ctx.beginPath(); ctx.arc(2, -42, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(4, -43, 12, 3); // cap
  const sw = running ? Math.sin(f * 0.4) * 0.9 : 0.1;
  ctx.save(); ctx.translate(8, -20); ctx.rotate(-1.2 + sw);
  ctx.fillStyle = '#A16207'; ctx.fillRect(0, -2, 46, 4);
  ctx.fillStyle = '#E7E5E4'; for (let k = 0; k < 7; k++) ctx.fillRect(44 + (k % 2) * 2, -9 + k * 3, 12, 3); // the mop head
  ctx.restore();
  ctx.restore();
};

/** A custodian behind a yellow WET FLOOR sign, who ducks out from behind it to throw a spray bottle. */
const drawCustodian = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1E3A8A');
  ctx.fillStyle = '#2563EB'; ctx.fillRect(-13, -56, 26, 30);
  ctx.fillStyle = '#1E40AF'; ctx.fillRect(-13, -40, 26, 3);
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(1, -67, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-9, -64, 3, 6); // earbuds' cord... a pencil behind the ear
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(12, -74); ctx.lineTo(20, -74); ctx.lineTo(28, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(16, -60); ctx.lineTo(10, -48); ctx.lineTo(22, -48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(15, -57, 2, 5);
    ctx.save(); ctx.translate(16, -26); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WET FLOOR', 0, 2); ctx.restore();
    ctx.fillStyle = '#0F172A'; for (let i = 0; i < Math.floor(damage * 6) + 1; i++) ctx.fillRect(10 + (i * 5) % 12, -40 + (i * 11) % 34, 2, 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-28, -50); ctx.lineTo(-22, -50); ctx.lineTo(-16, 0); ctx.fill();
    windUp(ctx, e, '#2563EB', (x, y) => { ctx.fillStyle = '#2563EB'; ctx.fillRect(x - 3, y + 2, 7, 10); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 2, y - 3, 5, 5); });
  }
};

// ---------------------------------------------------------------------------
// The lab
// ---------------------------------------------------------------------------

/** A lab tech: lab coat, safety goggles, a chunky prototype ray gun that glows green before it fires. */
const drawLabtech = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -26, f, 0, '#374151');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-14, -56, 28, 40);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-2, -56, 4, 40); ctx.fillStyle = '#2563EB'; ctx.fillRect(6, -50, 5, 6); // pens in the pocket
  head(ctx, 2, -64, skin);
  ctx.fillStyle = 'rgba(186, 230, 253, 0.8)'; ctx.fillRect(1, -68, 11, 5); // goggles
  ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.arc(1, -67, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = skin; ctx.fillRect(10, -46, 8, 6);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(14, -48, 14, 9); ctx.fillStyle = '#374151'; ctx.fillRect(26, -46, 8, 4);
  ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.arc(19, -44, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(28, -50, 2, 3); ctx.fillRect(28, -41, 2, 3); // fins
  if (charge > 0.4) { ctx.fillStyle = `rgba(190, 242, 100, ${charge})`; ctx.beginPath(); ctx.arc(36, -44, 2 + charge * 4, 0, Math.PI * 2); ctx.fill(); }
};

/** A test subject: hospital gown, a shaved head with the electrodes still stuck on, glowing green veins, an IV line trailing. */
const drawSubject = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = '#C7D2B8';
  legs(ctx, -32, f * (running ? 1.6 : 0.6), running ? 8 : 1, skin, '#9CA3AF');
  ctx.save(); ctx.translate(0, -32); ctx.rotate(running ? 0.3 : 0.05);
  ctx.fillStyle = '#BAE6FD'; ctx.fillRect(-17, -36, 34, 36); // the gown
  ctx.fillStyle = '#7DD3FC'; for (let k = 0; k < 5; k++) ctx.fillRect(-15 + k * 7, -34, 2, 2);
  ctx.fillStyle = skin; ctx.fillRect(-22, -32, 8, 22); ctx.fillRect(14, -32, 10, 22); // arms like hams
  ctx.strokeStyle = '#84CC16'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-19, -30); ctx.lineTo(-17, -20); ctx.lineTo(-19, -12); ctx.moveTo(18, -30); ctx.lineTo(20, -18); ctx.stroke(); // veins glowing
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(3, -46, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(7, -49, 3, 3); ctx.fillStyle = '#84CC16'; ctx.fillRect(8, -48, 1, 1);
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -41, 8, 3); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(6, -41, 1, 2); ctx.fillRect(9, -41, 1, 2);
  ctx.fillStyle = '#DC2626'; for (const [x, y] of [[-4, -56], [4, -58], [10, -54]]) { ctx.fillRect(x, y, 3, 3); } // electrodes
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -55); ctx.quadraticCurveTo(-16, -60, -24, -44); ctx.stroke();
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)'; ctx.beginPath(); ctx.moveTo(-20, -14); ctx.quadraticCurveTo(-32, -4 + Math.sin(f * 0.3) * 4, -40, 6); ctx.stroke(); // the IV line trailing
  ctx.restore();
};

/** A scientist behind a wheeled blast shield (BIOHAZARD), who ducks out to lob a flask of something green. */
const drawScientist = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -26, f, 0, '#1F2937');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-14, -56, 28, 40);
  head(ctx, 2, -64, skin);
  ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(-2, -66, 7, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(8, -69, 5, 0, Math.PI * 2); ctx.fill(); // wild white hair
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(7, -65, 3, 0, Math.PI * 2); ctx.stroke();
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    ctx.fillStyle = '#374151'; ctx.fillRect(0, -8, 26, 4); ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(4, -3, 3, 0, Math.PI * 2); ctx.arc(22, -3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.55)'; ctx.fillRect(2, -80, 22, 72);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(2, -80, 22, 72);
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.moveTo(13, -56); ctx.lineTo(6, -44); ctx.lineTo(20, -44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(13, -48, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(damage * 5); i++) { const y0 = -74 + i * 14; ctx.beginPath(); ctx.moveTo(3, y0); ctx.lineTo(12, y0 + 5); ctx.lineTo(23, y0 + 2); ctx.stroke(); }
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.5)'; ctx.fillRect(-34, -60, 14, 52);
    windUp(ctx, e, '#F8FAFC', (x, y) => { ctx.fillStyle = 'rgba(224, 242, 254, 0.8)'; ctx.fillRect(x - 1, y - 4, 3, 5); ctx.beginPath(); ctx.arc(x, y + 5, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#84CC16'; ctx.fillRect(x - 4, y + 5, 8, 3); });
  }
};

// ---------------------------------------------------------------------------
// The tenants, and Barry's man in the power room
// ---------------------------------------------------------------------------

/**
 * A tenant, out of his window from the waist up (the stage draws the window round him): an undershirt and a
 * scowl, a housecoat and curlers, whatever's in his hand going back to throw. Hidden inside, not drawn.
 */
const drawTenant = (ctx: Ctx, e: Enemy, f: number) => {
  if (e.aiState === 'hidden') return;
  const skin = skinOf(e);
  const v = (e.variant ?? 0) % 3;
  const out = e.aiState === 'lean' ? Math.min(1, e.aiTimer / 10) : 1;
  ctx.save(); ctx.translate(0, (1 - out) * 30);
  // (his top half: from the sill up)
  ctx.fillStyle = v === 0 ? '#F8FAFC' : v === 1 ? '#F9A8D4' : '#92400E';
  ctx.fillRect(-12, -30, 24, 30);
  if (v === 0) { ctx.fillStyle = skin; ctx.fillRect(-12, -30, 5, 14); ctx.fillRect(7, -30, 5, 14); } // an undershirt
  head(ctx, 2, -38, skin, 9);
  if (v === 1) { ctx.fillStyle = '#F472B6'; for (const [x, y] of [[-6, -46], [0, -48], [6, -46]]) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); } } // curlers
  else { ctx.fillStyle = v === 0 ? '#44403C' : '#9CA3AF'; ctx.beginPath(); ctx.arc(1, -41, 9, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -41, 5, 1); // the brow, furrowed
  // Arm back with the thing he's about to throw
  if (e.aiState === 'throw' || e.aiState === 'lean') {
    const wind = e.aiState === 'throw' ? Math.min(1, e.aiTimer / 14) : 0;
    ctx.fillStyle = skin; ctx.fillRect(-10 - wind * 6, -40, 6, 14);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(-14 - wind * 8, -48, 10, 8);
  }
  ctx.restore();
  void f;
};

/**
 * Barry's man on the grid: a jumpsuit with BARRY on the back, a headset, a clipboard, big anxious eyes; strutting
 * and taunting, or running round in a panic with his hands on his head.
 */
const drawMinion = (ctx: Ctx, e: Enemy, f: number) => {
  const panic = e.aiState === 'panic';
  const running = Math.abs(e.vel.x) > 0.8;
  legs(ctx, -26, f * (running ? 1.8 : 0.5), running ? 7 : 0.5, '#FACC15', '#111827');
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -52, 24, 28);
  ctx.fillStyle = '#111827'; ctx.fillRect(-12, -38, 24, 3);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-6, -50, 12, 6); ctx.fillStyle = '#FACC15'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('B', 0, -46); ctx.textAlign = 'left';
  ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(2, -60, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(4, -62, 3, 0, Math.PI * 2); ctx.arc(9, -62, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(4, -62, 1.5, 1.5); ctx.fillRect(9, -62, 1.5, 1.5);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(2, -63, 10, Math.PI * 1.05, Math.PI * 1.9); ctx.stroke(); ctx.fillRect(-9, -62, 3, 6); // headset
  if (panic) {
    // Hands on his head, mouth wide open
    const flail = Math.sin(f * 0.7) * 3;
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-14, -66 + flail, 5, 16); ctx.fillRect(10, -66 - flail, 5, 16);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(6, -56, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(147, 197, 253, 0.8)'; ctx.fillRect(-4, -62 + (f % 12), 2, 3); // sweat
  } else {
    ctx.fillStyle = '#111827'; ctx.fillRect(4, -56, 6, 1);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(8, -48, 12, 5);
    ctx.fillStyle = '#A16207'; ctx.fillRect(16, -54, 10, 13); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(17, -52, 8, 10); // the clipboard
  }
};

/** A generator (the stage draws the real thing: this is for its box). */
const drawGeneratorBox = (ctx: Ctx, e: Enemy, f: number) => {
  ctx.fillStyle = '#374151'; ctx.fillRect(-e.width / 2, -e.height, e.width, e.height);
  void f;
};
