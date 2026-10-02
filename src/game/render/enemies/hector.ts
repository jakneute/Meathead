// Hector's stage: his goons dressed for Miami (a tourist with a chrome pistol, a
// nightclub bouncer, a surfer behind his board), Miami-Dade's finest, the
// beachgoers, and the Florida wildlife. Drawn like Artie's lot: facing right
// from a point at the feet (centre bottom), flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { INK, ink, shaded, shadedTop, lite, dark, eye, limb } from '../npc/kit';

type Ctx = CanvasRenderingContext2D;

const SKIN = ['#F2C9A0', '#C68642', '#8D5524', '#E0AC69'];
const SHIRTS = ['#F472B6', '#22D3EE', '#FACC15', '#A3E635'];

export const drawHectorKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'tourist': drawTourist(ctx, e, f); break;
    case 'bouncer': drawBouncer(ctx, e, f); break;
    case 'surfer': drawSurfer(ctx, e, f); break;
    case 'cop': drawCop(ctx, e, f); break;
    case 'riotcop': drawRiotCop(ctx, e, f); break;
    case 'civilian': drawCivilian(ctx, e, f); break;
    case 'gator': drawGator(ctx, e, f); break;
    case 'pelican': drawPelican(ctx, e, f); break;
    case 'iguana': drawIguana(ctx, e, f); break;
    case 'crab': drawCrab(ctx, e, f); break;
    case 'shark': drawShark(ctx, e, f, state); break;
  }
};

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

/** Bare legs in shorts, feet in whatever they've got on. Hips at hipY. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, skin: string, shorts: string, shoes: string) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = shorts;
  ctx.fillRect(-9, hipY, 18, 12);
  ctx.fillStyle = skin;
  ctx.fillRect(-7 + s, hipY + 12, 5, -hipY - 16);
  ctx.fillRect(2 - s, hipY + 12, 5, -hipY - 16);
  ctx.fillStyle = shoes;
  ctx.fillRect(-9 + s, -4, 9, 4);
  ctx.fillRect(1 - s, -4, 9, 4);
};

/** A round head at (0, y) with hair on top; looking right. */
const head = (ctx: Ctx, y: number, skin: string, hair: string) => {
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, y, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(1, y - 3, 9, Math.PI, 0); ctx.fill();
};
const shades = (ctx: Ctx, y: number, color = '#111827') => {
  ctx.fillStyle = color; ctx.fillRect(2, y - 2, 10, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(3, y - 2, 2, 1);
};

/** A goon in a Hawaiian shirt, bucket hat, zinc on his nose, fanny pack, socks with sandals and a chrome pistol. */
const drawTourist = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, 0, SKIN[0], '#78716C', '#F8FAFC');
  ctx.fillStyle = '#92400E'; ctx.fillRect(-10, -4, 20, 4); // sandals over the socks
  // Loud shirt
  ctx.fillStyle = '#F97316'; ctx.fillRect(-11, -52, 22, 26);
  ctx.fillStyle = '#FDE047';
  for (const [x, y] of [[-8, -48], [2, -44], [-4, -36], [5, -32]]) { ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#16A34A'; for (const [x, y] of [[-2, -50], [7, -40], [-9, -30]]) ctx.fillRect(x, y, 4, 2);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-10, -29, 20, 5); // fanny pack
  head(ctx, -60, SKIN[0], '#FDE68A');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(9, -60, 3, 3);  // zinc on the nose
  shades(ctx, -62);
  // Bucket hat
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(-9, -72, 20, 7); ctx.fillRect(-13, -66, 28, 3);
  // Chrome pistol held out, flashing before it fires
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = SKIN[0]; ctx.fillRect(4, -44, 12, 5);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(14, -47, 14, 5);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(14, -43, 4, 6);
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(30, -45, 2 + charge * 2, 0, Math.PI * 2); ctx.fill(); }
};

/** A nightclub bouncer: bald, shades, earpiece, gold chains, a tank top stretched over a lot of man. */
const drawBouncer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, SKIN[2], '#111827', '#111827');
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(running ? 0.25 : 0);
  // Tank top and huge arms
  ctx.fillStyle = SKIN[2];
  ctx.beginPath(); ctx.ellipse(-14, -26, 8, 11, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -24, 8, 11, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-16, -32); ctx.quadraticCurveTo(0, -42, 16, -32); ctx.lineTo(15, 0); ctx.fill();
  ctx.fillStyle = '#FACC15'; // chains
  ctx.beginPath(); ctx.arc(2, -32, 8, 0.2, Math.PI - 0.2); ctx.lineWidth = 2; ctx.strokeStyle = '#FACC15'; ctx.stroke();
  ctx.beginPath(); ctx.arc(2, -30, 11, 0.3, Math.PI - 0.3); ctx.stroke();
  ctx.fillRect(0, -21, 4, 4);
  // Bald head, shades, earpiece
  ctx.fillStyle = SKIN[2]; ctx.beginPath(); ctx.arc(4, -44, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-1, -52, 5, 2);
  shades(ctx, -45);
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -44); ctx.quadraticCurveTo(-6, -36, -2, -32); ctx.stroke();
  // Fists
  ctx.fillStyle = SKIN[2]; ctx.fillRect(18, -14 + (running ? Math.sin(f * 0.45) * 4 : 0), 8, 8);
  ctx.restore();
};

/** A surfer in a rash guard behind his board (it takes the shots); drops it to hurl a coconut. */
const drawSurfer = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, 0, SKIN[3], '#2563EB', SKIN[3]);
  ctx.fillStyle = '#0F766E'; ctx.fillRect(-11, -54, 22, 28);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-11, -44, 22, 3);
  head(ctx, -62, SKIN[3], '#FDE68A');
  // Shaggy bleached hair over one eye
  ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.moveTo(-8, -66); ctx.lineTo(12, -68); ctx.lineTo(10, -60); ctx.lineTo(0, -62); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(7, -62, 2, 2);
  if (e.isShieldActive) {
    // The board, stood on end in front of him, dinged up as it takes hits
    const damage = 1 - e.health / e.maxHealth;
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.ellipse(18, -40, 8, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F43F5E'; ctx.fillRect(16, -78, 4, 76);
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(18, -40, 8, 40, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#1F2937';
    for (let i = 0; i < Math.floor(damage * 6); i++) ctx.fillRect(13 + (i % 2) * 7, -70 + i * 11, 3, 3);
  } else {
    // Board down at his side, winding up a coconut
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(-18, -30, 5, 28, 0.2, 0, Math.PI * 2); ctx.fill();
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = SKIN[3]; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
    ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.arc(-2 - wind * 12, -56, 6, 0, Math.PI * 2); ctx.fill();
  }
};

/** Miami-Dade police: navy uniform, cap, mirrored aviators, badge, sidearm. */
const drawCop = (ctx: Ctx, e: Enemy, f: number) => {
  ctx.fillStyle = '#1E293B';
  const s = Math.sin(f * 0.25) * (Math.abs(e.vel.x) > 0.5 ? 5 : 0);
  ctx.fillRect(-8 + s, -30, 7, 26); ctx.fillRect(2 - s, -30, 7, 26);
  ctx.fillStyle = '#0B0F19'; ctx.fillRect(-10 + s, -5, 11, 5); ctx.fillRect(1 - s, -5, 11, 5);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-11, -56, 22, 28);
  ctx.fillStyle = '#111827'; ctx.fillRect(-11, -32, 22, 4); // duty belt
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-7, -50, 4, 5);   // badge
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-11, -54, 4, 3);  // shoulder patch
  head(ctx, -64, SKIN[1], '#1F2937');
  shades(ctx, -65, '#B45309');
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-9, -76, 20, 6); ctx.fillRect(-4, -71, 18, 3);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(1, -74, 3, 3);
  if (e.melee) {
    // The nightstick: raised back over his head (the tell), brought down hard, then hanging
    const m = e.melee;
    const a = m.state === 'windup' ? -0.6 - Math.min(1, m.t / 10) * 1.7 : m.state === 'strike' ? -2.3 + Math.min(1, m.t / 3) * 3.1 : 0.9;
    ctx.save(); ctx.translate(4, -50); ctx.rotate(a);
    ctx.fillStyle = SKIN[1]; ctx.fillRect(0, -3, 12, 6);
    ctx.fillStyle = '#111827'; ctx.fillRect(10, -2.5, 26, 5); ctx.fillRect(14, -2.5, 3, 9);
    ctx.restore();
    if (m.state === 'strike' && m.t < 5) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(4, -50, 36, -1.9, 0.6); ctx.stroke(); }
    return;
  }
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = SKIN[1]; ctx.fillRect(4, -47, 12, 5);
  ctx.fillStyle = '#111827'; ctx.fillRect(14, -50, 12, 5); ctx.fillRect(14, -46, 4, 5);
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(28, -48, 2 + charge * 2, 0, Math.PI * 2); ctx.fill(); }
};

/** Riot police: helmet and visor, and a big clear POLICE shield. */
const drawRiotCop = (ctx: Ctx, e: Enemy, f: number) => {
  ctx.fillStyle = '#111827';
  ctx.fillRect(-8, -30, 7, 26); ctx.fillRect(2, -30, 7, 26);
  ctx.fillRect(-10, -5, 11, 5); ctx.fillRect(1, -5, 11, 5);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-13, -58, 26, 30);
  ctx.fillStyle = '#374151'; ctx.fillRect(-13, -58, 26, 6);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(2, -66, 11, Math.PI, 0); ctx.fill(); ctx.fillRect(-9, -66, 22, 8);
  ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; ctx.fillRect(1, -66, 13, 8);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // (drawn back for a bash, then rammed forward)
    const m = e.melee;
    const push = !m ? 0 : m.state === 'windup' ? -Math.min(1, m.t / 10) * 8 : m.state === 'strike' ? 12 : 3;
    ctx.save(); ctx.translate(push, 0);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)'; ctx.fillRect(10, -76, 16, 74);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(10, -76, 16, 74);
    ctx.save(); ctx.translate(20, -36); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('POLICE', 0, 3);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(damage * 5); i++) { const y0 = -70 + i * 13; ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(18, y0 + 5); ctx.lineTo(25, y0 + 2); ctx.stroke(); }
    if (m?.state === 'strike' && m.t < 6) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; for (const y of [-60, -38, -16]) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(44, y); ctx.stroke(); } }
    ctx.restore();
  } else {
    // Shield lowered: a tear gas canister wound back to lob
    ctx.fillStyle = 'rgba(203, 213, 225, 0.5)'; ctx.fillRect(-26, -40, 12, 40);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-4 - wind * 10, -56, 7, 12);
    ctx.fillStyle = '#65A30D'; ctx.fillRect(-6 - wind * 12, -62, 6, 9);
  }
};

/**
 * Beachgoers, by pastime (variant): 0 sunbathing on a towel, 1 jogging in neon,
 * 2 volleyball, 3 an old boy with a metal detector, 4 the ice cream man.
 * Running for their lives, it's arms up and mouth open, whoever they are.
 */
const drawCivilian = (ctx: Ctx, e: Enemy, f: number) => {
  const v = e.variant ?? 0;
  const skin = SKIN[Math.abs(Math.round(e.homeX || 0)) % SKIN.length];
  const shirt = SHIRTS[(v + Math.abs(Math.round(e.homeX || 0))) % SHIRTS.length];
  const panicking = e.aiState === 'flee' || e.aiState === 'shelter';
  if (v === 0 && !panicking) {
    // Lying on a towel, shades on, one knee up
    ctx.fillStyle = '#F43F5E'; ctx.fillRect(-34, -3, 68, 3);
    ctx.fillStyle = '#F8FAFC'; for (let x = -30; x < 34; x += 10) ctx.fillRect(x, -3, 4, 3);
    ctx.fillStyle = skin;
    ctx.fillRect(-26, -10, 36, 7);                                // body
    ctx.beginPath(); ctx.moveTo(8, -9); ctx.lineTo(16, -18); ctx.lineTo(24, -6); ctx.lineTo(20, -5); ctx.lineTo(16, -12); ctx.lineTo(10, -5); ctx.fill(); // knee up
    ctx.beginPath(); ctx.arc(-28, -9, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shirt; ctx.fillRect(-16, -11, 10, 5); ctx.fillRect(-4, -11, 8, 5);
    ctx.fillStyle = '#111827'; ctx.fillRect(-32, -12, 6, 2);
    return;
  }
  const running = panicking || Math.abs(e.vel.x) > 1;
  const stride = running ? 7 : v === 3 ? 2 : 0;
  legs(ctx, -28, f * (running ? 1.8 : 0.8), stride, skin, v === 1 ? '#111827' : '#0EA5E9', v === 1 ? '#F8FAFC' : skin);
  // Body
  ctx.fillStyle = v === 4 ? '#F8FAFC' : shirt;
  ctx.fillRect(-10, -52, 20, 25);
  if (v === 1) { ctx.fillStyle = '#A3E635'; ctx.fillRect(-10, -44, 20, 3); }            // neon stripe
  if (v === 4) { ctx.fillStyle = '#EF4444'; ctx.fillRect(-10, -52, 20, 4); }            // ice cream man's apron trim
  head(ctx, -60, skin, v === 3 ? '#E5E7EB' : ['#1F2937', '#78350F', '#FDE68A'][Math.abs(Math.round(e.homeX || 0)) % 3]);
  if (v === 4) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8, -73, 18, 6); }            // paper hat
  if (v === 1) { ctx.fillStyle = '#22D3EE'; ctx.fillRect(-8, -66, 18, 3); }            // sweatband
  // Arms: flailing up if running for it, otherwise what they're doing
  ctx.fillStyle = skin;
  if (panicking && e.disgusted) {
    // Running from the smell: gone green, gagging, one hand pinching the nose, the other waving it away
    ctx.fillStyle = 'rgba(132, 204, 22, 0.4)'; ctx.fillRect(-7, -69, 15, 14);
    ctx.fillStyle = skin;
    const wave = Math.sin(f * 0.7) * 6;
    ctx.fillRect(8, -56, 4, 8); ctx.fillRect(5, -62, 6, 4);               // up to the nose, pinching it
    ctx.fillRect(-12, -66 + wave, 4, 16);                                  // waving it away
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(2, -56, 6, 2);                  // gagging
    ctx.fillStyle = '#F472B6'; ctx.fillRect(4, -54, 3, 2);                  // (tongue out)
  } else if (panicking) {
    const flail = Math.sin(f * 0.6) * 5;
    ctx.fillRect(-12, -70 + flail, 4, 18); ctx.fillRect(8, -70 - flail, 4, 18);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(6, -56, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); // screaming
  } else if (v === 2) {
    ctx.fillRect(-10, -72, 4, 20); ctx.fillRect(7, -72, 4, 20);                            // hands up for the ball
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(1, -84 + Math.abs(Math.sin(f * 0.09)) * -20, 5, 0, Math.PI * 2); ctx.fill();
  } else if (v === 3) {
    // Metal detector swinging low in front
    ctx.fillRect(6, -48, 10, 4);
    const sweep = Math.sin(f * 0.1) * 6;
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(14, -46); ctx.lineTo(26 + sweep, -4); ctx.stroke();
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.ellipse(27 + sweep, -3, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (v === 4) {
    // Holding out a cone
    ctx.fillRect(6, -46, 12, 4);
    ctx.fillStyle = '#D97706'; ctx.beginPath(); ctx.moveTo(16, -48); ctx.lineTo(20, -48); ctx.lineTo(18, -40); ctx.fill();
    ctx.fillStyle = '#F9A8D4'; ctx.beginPath(); ctx.arc(18, -50, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    const swing = running ? Math.sin(f * 0.45) * 6 : 0;
    ctx.fillRect(-12, -50 + swing, 4, 16); ctx.fillRect(8, -50 - swing, 4, 16);
  }
};

// ---------------------------------------------------------------------------
// Wildlife
// ---------------------------------------------------------------------------
// (Drawn in the kit's look, like the longhorn: an ink line round every part, each part shaded in steps.)

/** A point t of the way along a quadratic curve. */
const qb = (a: number, b: number, c: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;

/** A croc's eye: yellow, the slit pupil, a glint. */
const slitEye = (ctx: Ctx, x: number, y: number, r: number, iris = '#FDE047') => {
  ink(ctx, () => ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2), iris, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(x - 0.4, y - r * 0.7, 0.9, r * 1.4);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - r * 0.7, y - r * 0.55, 0.9, 0.9);
};

/** A tooth: a little inked white fang from (x, y), w wide, h long (h < 0 points it up). */
export const fang = (ctx: Ctx, x: number, y: number, w: number, h: number, color = '#F8FAFC') =>
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x + w, y); ctx.closePath(); }, color, 0.5);

/**
 * A wing from (rx, ry) along its leading edge (bowed) out to the tip (tx, ty), and back in along the trailing edge
 * (notched into n feathers) to (bx, by): shaded, the primaries at the tip darker; `bars` lays two bars across it.
 */
export const featherWing = (ctx: Ctx, rx: number, ry: number, tx: number, ty: number, bx: number, by: number, color: string, n = 4, bars?: string) => {
  // (the trailing edge's outward normal, and the leading edge's)
  const dx = bx - tx, dy = by - ty;
  let nx = -dy, ny = dx; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
  if (nx * (rx - tx) + ny * (ry - ty) > 0) { nx = -nx; ny = -ny; }
  let mx = -(ty - ry), my = tx - rx; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
  if (mx * (bx - rx) + my * (by - ry) > 0) { mx = -mx; my = -my; }
  const path = () => {
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo((rx + tx) / 2 + mx * 3, (ry + ty) / 2 + my * 3, tx, ty);
    for (let k = 1; k <= n; k++) {
      const t0 = (k - 0.5) / n, t1 = k / n;
      ctx.lineTo(tx + dx * t0 + nx * 2.2, ty + dy * t0 + ny * 2.2); ctx.lineTo(tx + dx * t1, ty + dy * t1);
    }
    ctx.closePath();
  };
  const x0 = Math.min(rx, tx, bx) - 3, y0 = Math.min(ry, ty, by) - 3, x1 = Math.max(rx, tx, bx) + 3, y1 = Math.max(ry, ty, by) + 3;
  shaded(ctx, path, color, x0, y0, x1 - x0, y1 - y0);
  const span = Math.hypot(tx - rx, ty - ry);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  // The primaries, darker at the tip; the feathers' lines running in from the notches
  ctx.fillStyle = dark(color, 0.3); ctx.beginPath(); ctx.arc(tx, ty, span * 0.38, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = dark(color, 0.45); ctx.lineWidth = 0.6;
  for (let k = 1; k < n; k++) { const ex = tx + dx * (k / n), ey = ty + dy * (k / n); ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + (rx - ex) * 0.45, ey + (ry - ey) * 0.45); ctx.stroke(); }
  // The coverts: a lit edge along the front
  ctx.strokeStyle = lite(color, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rx + mx * 0.2, ry + my * 0.2);
  ctx.quadraticCurveTo((rx + tx) / 2 + mx * 2, (ry + ty) / 2 + my * 2, rx + (tx - rx) * 0.7 + mx * 0.8, ry + (ty - ry) * 0.7 + my * 0.8); ctx.stroke();
  if (bars) {
    ctx.strokeStyle = bars; ctx.lineWidth = 1.4;
    for (const fr of [0.3, 0.48]) {
      const cx = rx + (tx - rx) * fr, cy = ry + (ty - ry) * fr;
      ctx.beginPath(); ctx.moveTo(cx - mx * 1, cy - my * 1); ctx.lineTo(cx - mx * 9, cy - my * 9); ctx.stroke();
    }
  }
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
};

const GATOR = '#3F5B2A', GATOR_DARK = '#2A3D1C', GATOR_BELLY = '#B8B07A';

/** A gator: long and low, armored back, pale belly; jaws gape to hiss and lunge, the tail thrashes at rest. */
const drawGator = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  if (e.variant === 1 && (!st || st === 'idle')) {
    // In the water: just the bony eye bumps and the nostrils breaking the surface, the water lapping round them
    shadedTop(ctx, () => { ctx.ellipse(-4, -6, 10, 5, 0, Math.PI, 0); ctx.closePath(); }, GATOR, -14, -11, 20, 5);
    ctx.fillStyle = dark(GATOR, 0.3); for (const x of [-12, -2, 4]) ctx.fillRect(x, -8, 2, 1.4);
    slitEye(ctx, -6.5, -8, 2); slitEye(ctx, 1.5, -8, 2);
    shadedTop(ctx, () => { ctx.ellipse(22, -4, 8, 3.5, 0, Math.PI, 0); ctx.closePath(); }, GATOR, 14, -7.5, 16, 3.5);
    ctx.fillStyle = INK; ctx.fillRect(23, -6.4, 1.2, 1); ctx.fillRect(26, -6, 1.2, 1);
    ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    for (const [x, w] of [[-17, 4], [8, 4], [11, 2], [31, 4]] as [number, number][]) ctx.fillRect(x, -6.6, w, 1);
    return;
  }
  // (feeding: going for a goon in the water, jaws wide; then clamped on and rolling him under, jaws working)
  if (st === 'chomp') { ctx.translate(0, -14); ctx.rotate(Math.sin(f * 0.35) * 0.7); ctx.translate(0, 14); }
  const open = st === 'hiss' || st === 'ashore-hiss' ? 0.5 : st === 'lunge' || st === 'ashore-lunge' ? 0.35 + Math.abs(Math.sin(f * 0.5)) * 0.2 : st === 'breach' ? 0.55
    : st === 'hunt' ? 0.2 + Math.abs(Math.sin(f * 0.25)) * 0.4 : st === 'feed' ? 0.55 : st === 'chomp' ? Math.abs(Math.sin(f * 0.6)) * 0.3 : 0;
  const run = st === 'lunge' || st === 'ashore-lunge' ? Math.sin(f * 0.8) * 4 : st === 'ashore' ? Math.sin(f * 0.35) * 3 : 0;
  const tail = st === 'rest' || st === 'hunt' || st === 'feed' ? Math.sin(f * 0.35) * 8 : st === 'chomp' ? Math.sin(f * 0.7) * 12 : Math.sin(f * 0.05) * 2;
  // The tail: tapering away, banded, the row of scutes up its top
  const tx = -52, ty = -6 + tail, cy = -16 + tail * 0.4;
  const tailPath = () => { ctx.moveTo(-16, -21); ctx.quadraticCurveTo(-38, cy, tx, ty); ctx.quadraticCurveTo(-38, cy + 9, -16, -6); ctx.closePath(); };
  shadedTop(ctx, tailPath, GATOR, -54, Math.min(-22, ty - 2), 40, Math.max(18, Math.abs(tail) + 18));
  ctx.save(); ctx.beginPath(); tailPath(); ctx.clip();
  ctx.strokeStyle = dark(GATOR, 0.35); ctx.lineWidth = 1.2;
  for (let k = 1; k < 5; k++) { const t = k / 5.5; ctx.beginPath(); ctx.moveTo(qb(-16, -38, tx, t), qb(-21, cy, ty, t)); ctx.lineTo(qb(-16, -38, tx, t) - 1, qb(-6, cy + 9, ty, t)); ctx.stroke(); }
  ctx.restore();
  for (let k = 0; k < 6; k++) {
    const t = 0.06 + k * 0.14, x = qb(-16, -38, tx, t), y = qb(-21, cy, ty, t) + 0.6, h = 3.2 - k * 0.4;
    ink(ctx, () => { ctx.moveTo(x - 2, y); ctx.lineTo(x - 0.6, y - h); ctx.lineTo(x + 1, y); ctx.closePath(); }, GATOR_DARK, 0.6);
  }
  // A leg, splayed out the side: the thigh (the hind ones' knees forward, the front ones' elbows back), the shin, the
  // foot flat with its toes spread and pale claws
  const leg = (lx: number, back: boolean, hind: boolean) => {
    const c = back ? GATOR_DARK : GATOR, k = hind ? 3 : -3;
    shaded(ctx, () => { ctx.moveTo(lx - 3.5, -13); ctx.lineTo(lx + 3.5, -13); ctx.lineTo(lx + k + 2.6, -7); ctx.lineTo(lx + k - 2.6, -7); ctx.closePath(); }, c, lx - 4, -13, 8, 7);
    shaded(ctx, () => { ctx.moveTo(lx + k - 2.6, -7.6); ctx.lineTo(lx + k + 2.6, -7.6); ctx.lineTo(lx + 2.4, -2.4); ctx.lineTo(lx - 2.4, -2.4); ctx.closePath(); }, c, lx - 3, -8, 7, 6);
    ink(ctx, () => { ctx.moveTo(lx - 3, -0.2); ctx.lineTo(lx - 2.6, -3.4); ctx.lineTo(lx + 3, -3.4); ctx.lineTo(lx + 7, -1.6); ctx.lineTo(lx + 7.6, -0.2); ctx.closePath(); }, dark(c, 0.12), 0.8);
    ctx.fillStyle = INK; ctx.fillRect(lx + 2.6, -1.6, 0.7, 1.4); ctx.fillRect(lx + 4.8, -1.4, 0.7, 1.2);
    ctx.fillStyle = '#E7E5CF'; ctx.fillRect(lx + 7.4, -1.2, 1.4, 1); ctx.fillRect(lx + 5.6, -0.8, 1.2, 0.8);
    ctx.fillStyle = lite(c, 0.3); ctx.fillRect(lx - 2, -12, 2, 1);
  };
  leg(-10 + run, true, true); leg(20 - run, true, false);
  // The body: the armored back (rows of bony scutes, lit along the top), the pale belly in its scales
  const body = () => { ctx.moveTo(-24, -12); ctx.quadraticCurveTo(-23, -23, 0, -23); ctx.quadraticCurveTo(22, -23, 27, -15); ctx.quadraticCurveTo(26, -6, 14, -5); ctx.lineTo(-16, -5); ctx.quadraticCurveTo(-25, -6, -24, -12); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = GATOR; ctx.fillRect(-26, -24, 54, 20);
  ctx.fillStyle = lite(GATOR, 0.2); ctx.fillRect(-26, -24, 54, 4);
  ctx.fillStyle = dark(GATOR, 0.18); ctx.fillRect(-26, -12, 54, 3);
  for (const [ry, off] of [[-20, 0], [-16.5, 2.5]] as [number, number][]) {
    for (let x = -22 + off; x < 24; x += 5) {
      ctx.fillStyle = dark(GATOR, 0.3); ctx.fillRect(x, ry, 4, 2.6);
      ctx.fillStyle = lite(GATOR, 0.28); ctx.fillRect(x, ry, 1.5, 1);
    }
  }
  ctx.fillStyle = GATOR_BELLY; ctx.fillRect(-26, -9, 54, 5);
  ctx.fillStyle = dark(GATOR_BELLY, 0.18); ctx.fillRect(-26, -6.5, 54, 3);
  ctx.fillStyle = dark(GATOR_BELLY, 0.3); for (let x = -22; x < 26; x += 3) ctx.fillRect(x, -9, 0.8, 4);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  // (the ridge up the back)
  for (let x = -20; x < 20; x += 6) {
    const y = -14 - 9 * Math.sqrt(Math.max(0, 1 - (x / 26) ** 2)) + 1.4;
    ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + 2.6, y - 3.4); ctx.lineTo(x + 5.2, y); ctx.closePath(); }, GATOR_DARK, 0.6);
    ctx.fillStyle = lite(GATOR_DARK, 0.3); ctx.fillRect(x + 1.6, y - 2, 1, 1);
  }
  leg(-14 - run, false, true); leg(16 + run, false, false);
  // The head: the lower jaw (pale under), the pink mouth as the top jaw lifts, the top jaw hinging up with its bony
  // brow and the eye under it, the nostrils on the knob at the end, teeth all along
  ctx.save();
  ctx.translate(24, -14);
  if (open > 0) {
    const ux = 23 * Math.cos(open) + 2 * Math.sin(open), uy = -23 * Math.sin(open) + 2 * Math.cos(open);
    ink(ctx, () => { ctx.moveTo(-1, 0); ctx.lineTo(ux, uy); ctx.lineTo(21, 4.5); ctx.closePath(); }, '#9F1239', 0.8);
    ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.ellipse(9, 3, 7, 1.4, 0.08, 0, Math.PI * 2); ctx.fill(); // the tongue
  }
  const lower = () => { ctx.moveTo(-2, 1); ctx.lineTo(20, 3.4); ctx.quadraticCurveTo(23.5, 4, 22.6, 6.6); ctx.quadraticCurveTo(21, 8.6, 15, 8.6); ctx.lineTo(-2, 9); ctx.closePath(); };
  for (let x = 5; x < 20; x += 4) fang(ctx, x, 1.6 + (x + 2) * 0.1, 1.8, -2.4);
  ctx.save(); ctx.beginPath(); lower(); ctx.clip();
  ctx.fillStyle = GATOR; ctx.fillRect(-2, 0, 26, 10);
  ctx.fillStyle = lite(GATOR, 0.2); ctx.fillRect(-2, 0, 26, 2.6);
  ctx.fillStyle = GATOR_BELLY; ctx.fillRect(-2, 6, 26, 4);
  ctx.fillStyle = dark(GATOR_BELLY, 0.2); ctx.fillRect(-2, 7.8, 26, 2);
  ctx.restore();
  ctx.beginPath(); lower(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.rotate(-open);
  for (let x = 3; x < 22; x += 4) fang(ctx, x, 3.4 - x * 0.04, 1.8, x === 15 ? 3.4 : 2.4);
  const upper = () => { ctx.moveTo(-4, -7); ctx.quadraticCurveTo(6, -9.5, 12, -5); ctx.quadraticCurveTo(20, -3, 23.5, -2.4); ctx.quadraticCurveTo(26.5, -0.6, 24.6, 3); ctx.lineTo(-1, 4.2); ctx.closePath(); };
  shadedTop(ctx, upper, GATOR, -4, -9.5, 30, 14);
  ctx.fillStyle = dark(GATOR, 0.3); for (const [x, y] of [[9, -3], [13, -2], [17, -1], [11, 0], [15, 1]]) ctx.fillRect(x, y, 1.2, 1);
  ink(ctx, () => ctx.ellipse(23, -2.2, 2, 1.5, 0, 0, Math.PI * 2), GATOR, 0.7); // the nostril knob
  ctx.fillStyle = INK; ctx.fillRect(22.6, -2.8, 1.2, 0.9);
  ink(ctx, () => { ctx.ellipse(4, -7.4, 4.2, 2.6, 0, Math.PI, 0); ctx.closePath(); }, GATOR_DARK, 0.8); // the brow
  slitEye(ctx, 4.4, -6.8, 1.9);
  ctx.restore();
};

const PELICAN = '#6B5B45', PELICAN_DARK = '#4B3F30';

/** A brown pelican: grey-brown wings, white head, that huge orange pouch of a beak. */
const drawPelican = (ctx: Ctx, e: Enemy, f: number) => {
  const swooping = e.aiState === 'swoop';
  const flap = swooping ? Math.sin(f * 0.15) * 3 : Math.sin(f * 0.3) * 10;
  // The far wing, in shadow
  featherWing(ctx, -10, -12, -28, -24 - flap, -6, -14, PELICAN_DARK, 4);
  // The tail, two feathers to it; the feet tucked under, webbed
  ink(ctx, () => { ctx.moveTo(-17, -14); ctx.lineTo(-30, -16); ctx.lineTo(-27.5, -12); ctx.lineTo(-30, -8); ctx.lineTo(-17, -9); ctx.closePath(); }, PELICAN_DARK, 1);
  ctx.fillStyle = lite(PELICAN_DARK, 0.25); ctx.fillRect(-27, -15, 8, 1);
  for (const x of [-3, 3]) {
    limb(ctx, x, -6, x, -2, 1.4, '#F59E0B');
    ink(ctx, () => { ctx.moveTo(x - 2.5, 0); ctx.lineTo(x + 2.5, 0); ctx.lineTo(x, -2); ctx.closePath(); }, '#EA8A0B', 0.6);
  }
  // The body: grey-brown, lit along the back, the feathers' edges picked out
  const body = () => ctx.ellipse(-2, -12, 18, 8, 0, 0, Math.PI * 2);
  shadedTop(ctx, body, PELICAN, -20, -20, 36, 16);
  ctx.fillStyle = lite(PELICAN, 0.3); for (const [x, y] of [[-12, -17], [-6, -18], [0, -17], [-9, -14], [-3, -15], [3, -14]]) ctx.fillRect(x, y, 2, 1);
  ctx.fillStyle = dark(PELICAN, 0.3); for (const [x, y] of [[-12, -16], [-6, -17], [0, -16], [-9, -13], [-3, -14], [3, -13]]) ctx.fillRect(x, y, 2, 0.8);
  // The neck: chestnut down the back of it, a white stripe down the front
  const neck = () => { ctx.moveTo(6, -17); ctx.quadraticCurveTo(9, -22, 12, -22); ctx.lineTo(17, -15); ctx.quadraticCurveTo(14, -9, 9, -7); ctx.quadraticCurveTo(5, -11, 6, -17); ctx.closePath(); };
  shaded(ctx, neck, '#6B3A1E', 5, -22, 13, 15);
  ctx.save(); ctx.beginPath(); neck(); ctx.clip();
  ctx.fillStyle = '#E7E5E4'; ctx.beginPath(); ctx.moveTo(13, -20); ctx.quadraticCurveTo(15, -14, 11, -7); ctx.lineTo(14, -7); ctx.quadraticCurveTo(18, -14, 15, -20); ctx.fill();
  ctx.restore();
  // The head: white, the yellow crown, a pale eye
  const head = () => ctx.arc(14, -18, 6, 0, Math.PI * 2);
  shaded(ctx, head, '#F8FAFC', 8, -24, 12, 12);
  ctx.save(); ctx.beginPath(); head(); ctx.clip(); ctx.fillStyle = '#FDE68A'; ctx.fillRect(8, -24, 12, 2.6); ctx.fillStyle = lite('#FDE68A', 0.4); ctx.fillRect(10, -24, 4, 1.4); ctx.restore();
  ctx.beginPath(); head(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  eye(ctx, 15.5, -19, 1.6, 0.6, 0, '#E0F2FE');
  // The pouch (sagging lower when it swoops, a fold in it), the bill over it, hooked red at the tip
  const pouch = () => { ctx.moveTo(17, -17.5); ctx.quadraticCurveTo(27, swooping ? -5 : -9, 35, -17.5); ctx.closePath(); };
  shaded(ctx, pouch, '#EA580C', 17, -18, 18, swooping ? 8 : 6);
  ctx.strokeStyle = dark('#EA580C', 0.3); ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(20, -16); ctx.quadraticCurveTo(26, swooping ? -9 : -12, 31, -16.5); ctx.stroke();
  const bill = () => { ctx.moveTo(17, -21); ctx.lineTo(34, -19.4); ctx.quadraticCurveTo(37.5, -19, 36.4, -16.4); ctx.lineTo(34.6, -17.4); ctx.lineTo(17, -17.2); ctx.closePath(); };
  shaded(ctx, bill, '#F59E0B', 17, -21, 20, 5);
  ctx.fillStyle = lite('#F59E0B', 0.45); ctx.fillRect(19, -20.4, 12, 0.9);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(34.6, -18.6, 1.8, 1.6);
  // The near wing, beating
  featherWing(ctx, 8, -12, -18, -26 + flap, 0, -10, PELICAN, 4);
};

const IGUANA = '#65A30D', IGUANA_DARK = '#4D7C0F', IGUANA_DEEP = '#365314';

/** A green iguana: spiky crest, dewlap, a tail twice its length. Clings to the palm, spins as it falls. */
const drawIguana = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  ctx.save();
  if (st === 'drop') { ctx.translate(0, -8); ctx.rotate(f * 0.3); ctx.translate(0, 8); }
  const whip = st === 'whip' ? Math.sin(f * 0.7) * 12 : Math.sin(f * 0.1) * 2;
  const run = st === 'scurry' ? Math.sin(f * 0.9) * 3 : 0;
  // The tail: tapering to a whip, banded dark
  const ty = -2 + whip, cy = -7 + whip * 0.3;
  const tailPath = () => { ctx.moveTo(-6, -11); ctx.quadraticCurveTo(-24, cy - 1, -38, ty); ctx.quadraticCurveTo(-22, cy + 4, -6, -4); ctx.closePath(); };
  shadedTop(ctx, tailPath, IGUANA_DARK, -40, Math.min(-12, ty - 2), 36, 14 + Math.abs(whip));
  ctx.save(); ctx.beginPath(); tailPath(); ctx.clip();
  ctx.strokeStyle = IGUANA_DEEP; ctx.lineWidth = 1.6;
  for (let k = 0; k < 5; k++) { const t = 0.15 + k * 0.17; ctx.beginPath(); ctx.moveTo(qb(-6, -24, -38, t), qb(-11, cy - 1, ty, t) - 1); ctx.lineTo(qb(-6, -22, -38, t) - 1.5, qb(-4, cy + 4, ty, t) + 1); ctx.stroke(); }
  ctx.restore();
  // A leg: bent out at the elbow, the foot splayed, its claws pale
  const leg = (x: number, back: boolean) => {
    const c = back ? IGUANA_DEEP : IGUANA_DARK;
    limb(ctx, x + 1, -7, x - 1.5, -3.5, 2.2, c);
    limb(ctx, x - 1.5, -3.5, x + 0.5, -1.2, 1.6, c);
    ink(ctx, () => ctx.ellipse(x + 1.6, -0.9, 2.2, 0.9, 0, 0, Math.PI * 2), c, 0.6);
    ctx.fillStyle = '#E7E5CF'; ctx.fillRect(x + 3.4, -1.2, 1, 0.8); ctx.fillRect(x + 3, -0.3, 1, 0.6);
  };
  leg(-3 - run, true); leg(13 + run, true);
  // The body: shaded, freckled with scales, the pale stripe down the flank, the crest of spikes down the back
  const body = () => ctx.ellipse(2, -8, 12, 5, 0, 0, Math.PI * 2);
  shaded(ctx, body, IGUANA, -10, -13, 24, 10);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = lite(IGUANA, 0.3); for (let x = -8; x < 12; x += 3) ctx.fillRect(x + ((x / 3) & 1 ? 1.5 : 0), -11 + ((x / 3) & 1), 1, 1);
  ctx.fillStyle = dark(IGUANA, 0.25); for (let x = -7; x < 13; x += 3) ctx.fillRect(x, -8 + ((x / 3) & 1), 1, 1);
  ctx.fillStyle = '#A3E635'; ctx.fillRect(-8, -5, 18, 1.2);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  for (let x = -7; x <= 11; x += 3) {
    const y = -8 - 5 * Math.sqrt(Math.max(0, 1 - ((x - 2) / 12) ** 2)) + 0.8, h = 2 + (x + 7) / 18 * 2.4;
    ink(ctx, () => { ctx.moveTo(x - 1.2, y); ctx.lineTo(x + 0.4, y - h); ctx.lineTo(x + 1.4, y); ctx.closePath(); }, IGUANA_DEEP, 0.6);
  }
  leg(-7 + run, false); leg(9 - run, false);
  // The head: the dewlap hanging, the big round scale on the jowl, the eye, a nostril
  ink(ctx, () => { ctx.moveTo(12.4, -7); ctx.quadraticCurveTo(13.6, -2.6, 15.4, -2); ctx.quadraticCurveTo(17.6, -4, 18, -7); ctx.closePath(); }, '#A3E635', 0.8);
  ctx.fillStyle = dark('#A3E635', 0.25); ctx.fillRect(14.4, -5.4, 2.2, 0.7); ctx.fillRect(15, -4, 1.6, 0.7);
  const head = () => { ctx.moveTo(9.5, -11); ctx.quadraticCurveTo(13.5, -15, 18.5, -12.4); ctx.quadraticCurveTo(21.6, -10.6, 21, -8.4); ctx.lineTo(13, -6.6); ctx.quadraticCurveTo(9, -7.4, 9.5, -11); ctx.closePath(); };
  shaded(ctx, head, '#84CC16', 9, -14, 13, 8);
  ink(ctx, () => ctx.arc(13.2, -8.2, 1.1, 0, Math.PI * 2), '#D9F99D', 0.5);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(12.7, -8.9, 0.7, 0.7);
  eye(ctx, 17.2, -11.2, 1.4, 0.6, 0, '#FDE047');
  ctx.fillStyle = INK; ctx.fillRect(20, -10.2, 0.9, 0.9);
  ctx.restore();
};

const CRAB = '#DC2626', CRAB_LEG = '#B91C1C';

/** A red crab: eyes on stalks, pincers up, legs a blur when it scuttles. */
const drawCrab = (ctx: Ctx, e: Enemy, f: number) => {
  const moving = Math.abs(e.vel.x) > 0.3;
  const leg = moving ? Math.sin(f * 1.1) * 3 : 0;
  // The legs: three a side, jointed, pointed at the tips (the back ones darker)
  for (let i = 2; i >= 0; i--) {
    for (const s of [-1, 1]) {
      const kx = s * (12 + i * 2), ky = -6 + (i % 2 ? leg : -leg) * -s, tx = s * (14 + i * 2);
      limb(ctx, s * 6, -8, kx, ky, 2, dark(CRAB_LEG, 0.1 * i));
      limb(ctx, kx, ky, tx, -1.4, 1.4, dark(CRAB_LEG, 0.1 * i));
      ctx.fillStyle = lite(CRAB_LEG, 0.35); ctx.fillRect(kx - 0.5, ky - 1, 1, 1);
    }
  }
  // The shell: lit across the top, the grooves in it, the speckles, a tooth either side of its edge; the mouthparts
  const shell = () => { ctx.moveTo(-11, -8); ctx.quadraticCurveTo(-12, -15, -5, -15.4); ctx.lineTo(5, -15.4); ctx.quadraticCurveTo(12, -15, 11, -8); ctx.quadraticCurveTo(10, -3.6, 0, -3.4); ctx.quadraticCurveTo(-10, -3.6, -11, -8); ctx.closePath(); };
  for (const s of [-1, 1]) ink(ctx, () => { ctx.moveTo(s * 10.6, -12.6); ctx.lineTo(s * 12.6, -12.6); ctx.lineTo(s * 11, -10.6); ctx.closePath(); }, CRAB, 0.6);
  shadedTop(ctx, shell, CRAB, -12, -15.4, 24, 12);
  ctx.fillStyle = lite(CRAB, 0.3); ctx.fillRect(-8, -14, 4, 1); ctx.fillRect(-9, -13, 1.5, 1);
  ctx.fillStyle = '#F87171'; for (const [x, y] of [[-6, -11], [4, -12], [6, -9], [-3, -8], [1, -10]]) ctx.fillRect(x, y, 1.2, 1);
  ctx.strokeStyle = dark(CRAB, 0.35); ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-4, -14); ctx.quadraticCurveTo(-1, -10, -3, -6); ctx.moveTo(4, -14); ctx.quadraticCurveTo(1, -10, 3, -6); ctx.stroke();
  ctx.fillStyle = dark(CRAB, 0.4); ctx.fillRect(-3, -5.6, 6, 1.8); ctx.fillStyle = lite(CRAB, 0.2); ctx.fillRect(-1, -5.6, 0.8, 1.8); ctx.fillRect(1, -5.6, 0.8, 1.8);
  // The eyes, up on their stalks
  for (const s of [-1, 1]) {
    limb(ctx, s * 3, -14, s * 3.6, -17.6, 1, CRAB_LEG);
    ink(ctx, () => ctx.arc(s * 3.6, -18.4, 1.7, 0, Math.PI * 2), '#111827', 0.6);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(s * 3.6 - 1, -19.4, 1, 1);
  }
  // The claws, up: the arm, the palm, the fixed finger and the one that opens when it pinches; pale at the tips
  const pinch = e.aiState === 'pinch' ? Math.abs(Math.sin(f * 0.6)) * 4 : 0;
  for (const s of [-1, 1]) {
    limb(ctx, s * 7, -10, s * 9.6, -15, 2.6, CRAB_LEG);
    ctx.save(); ctx.translate(s * 10, -19); ctx.scale(s, 1);
    const finger = () => { ctx.moveTo(0.4, -3.4); ctx.quadraticCurveTo(4.2, -5.4, 2.6, -9.4); ctx.lineTo(1, -8.8); ctx.quadraticCurveTo(1.6, -5.6, -0.8, -3.8); ctx.closePath(); };
    ink(ctx, finger, CRAB_LEG, 0.8);
    ctx.save(); ctx.beginPath(); finger(); ctx.clip(); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(0, -10, 4, 3.6); ctx.restore();
    ctx.save(); ctx.translate(-1, -3.4); ctx.rotate(-pinch * 0.12);
    const dactyl = () => { ctx.moveTo(-0.6, 0.4); ctx.quadraticCurveTo(-3.2, -3, -0.8, -6.2); ctx.lineTo(0.6, -5.6); ctx.quadraticCurveTo(-1, -3, 1.4, 0.4); ctx.closePath(); };
    ink(ctx, dactyl, CRAB_LEG, 0.8);
    ctx.save(); ctx.beginPath(); dactyl(); ctx.clip(); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-3, -7, 4, 3); ctx.restore();
    ctx.restore();
    shaded(ctx, () => ctx.ellipse(0, 0, 4.2, 4.4, 0, 0, Math.PI * 2), CRAB_LEG, -4.2, -4.4, 8.4, 8.8);
    ctx.fillStyle = lite(CRAB_LEG, 0.4); ctx.fillRect(-2.6, -2.6, 1.6, 1);
    ctx.restore();
  }
};

const SHARK = '#64748B', SHARK_BELLY = '#E2E8F0', SHARK_FIN = '#475569';

/** A shark, flying round in the storm: grey back, white belly, jaws wide when it lunges. */
const drawShark = (ctx: Ctx, e: Enemy, f: number, _state: GameState) => {
  const biting = e.aiState === 'bite';
  const sway = Math.sin(f * 0.25) * 4;
  const gape = biting ? 7 + Math.abs(Math.sin(f * 0.6)) * 4 : 2;
  // The tail: the top lobe long and swept back, the bottom one short; swishing
  const tailPath = () => { ctx.moveTo(-38, -21 + sway * 0.3); ctx.quadraticCurveTo(-48, -26 + sway, -57, -32 + sway); ctx.quadraticCurveTo(-53, -22 + sway, -50, -17 + sway); ctx.quadraticCurveTo(-53, -11 + sway, -55, -5 + sway); ctx.quadraticCurveTo(-46, -10 + sway, -38, -14 + sway * 0.3); ctx.closePath(); };
  shaded(ctx, tailPath, SHARK, -58, -33 + sway, 22, 30);
  // The fins with their bases behind the body: the dorsal (a lit leading edge), the second dorsal, the anal fin
  const dorsal = () => { ctx.moveTo(-10, -26); ctx.quadraticCurveTo(-4, -35, 1, -46); ctx.quadraticCurveTo(2, -35, 12, -27); ctx.closePath(); };
  shaded(ctx, dorsal, SHARK, -10, -46, 22, 20);
  ctx.strokeStyle = lite(SHARK, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-7, -29); ctx.quadraticCurveTo(-3, -36, 0, -43); ctx.stroke();
  ink(ctx, () => { ctx.moveTo(-30, -23); ctx.lineTo(-25, -29); ctx.lineTo(-22, -23); ctx.closePath(); }, SHARK, 0.8);
  ink(ctx, () => { ctx.moveTo(-27, -12); ctx.lineTo(-25, -6); ctx.lineTo(-20, -11); ctx.closePath(); }, SHARK_FIN, 0.8);
  // The lower jaw, hinged back under the eye, dropping open: the mouth's red inside, its teeth
  const a = gape * 0.05;
  const jx = 16 * Math.cos(a) + 3 * Math.sin(a), jy = 16 * Math.sin(a) - 3 * Math.cos(a);
  ink(ctx, () => { ctx.moveTo(20, -12.6); ctx.lineTo(38, -15); ctx.lineTo(22 + jx, -12 + jy); ctx.lineTo(22, -11); ctx.closePath(); }, '#7F1D1D', 0.8);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(22, -12.4, 6, 1.2 + gape * 0.3);
  ctx.save(); ctx.translate(22, -12); ctx.rotate(a);
  for (let x = 2; x < 15; x += 2.4) fang(ctx, x, -1.2 - x * 0.12, 1.6, -2.4);
  const jaw = () => { ctx.moveTo(-3, -1); ctx.lineTo(16, -3); ctx.quadraticCurveTo(17.4, 0, 13, 2.4); ctx.quadraticCurveTo(6, 4.4, -3, 4); ctx.closePath(); };
  shaded(ctx, jaw, SHARK_BELLY, -3, -3, 20, 8);
  ctx.restore();
  // The body: a torpedo, the snout overhanging; grey above, white below (the line between them ragged), lit along
  // the back
  const body = () => {
    ctx.moveTo(42, -19); ctx.quadraticCurveTo(38, -28, 24, -29); ctx.quadraticCurveTo(0, -32, -20, -27); ctx.quadraticCurveTo(-32, -24, -40, -20);
    ctx.lineTo(-40, -15); ctx.quadraticCurveTo(-20, -4, 0, -4); ctx.quadraticCurveTo(14, -4, 22, -11.4); ctx.lineTo(37, -15); ctx.quadraticCurveTo(41, -16, 42, -19); ctx.closePath();
  };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = SHARK; ctx.fillRect(-44, -34, 90, 34);
  ctx.fillStyle = lite(SHARK, 0.22); ctx.fillRect(-44, -34, 90, 7);
  ctx.fillStyle = dark(SHARK, 0.15); ctx.fillRect(-44, -20, 90, 4);
  ctx.fillStyle = SHARK_BELLY; ctx.beginPath(); ctx.moveTo(-44, -16); ctx.lineTo(-24, -13); ctx.lineTo(-8, -16); ctx.lineTo(6, -13.5); ctx.lineTo(20, -16); ctx.lineTo(30, -14.5); ctx.lineTo(44, -16); ctx.lineTo(44, 0); ctx.lineTo(-44, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark(SHARK_BELLY, 0.14); ctx.fillRect(-44, -7.5, 90, 8);
  ctx.fillStyle = lite(SHARK, 0.4); ctx.fillRect(-14, -30, 18, 1); ctx.fillRect(28, -27, 6, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
  // The top teeth, the gills, the flat black eye, a nostril
  for (let x = 23; x < 36; x += 2.4) fang(ctx, x, -11.6 - (x - 22) * 0.2, 1.6, biting ? 3 : 2.4);
  ctx.strokeStyle = dark(SHARK, 0.45); ctx.lineWidth = 1;
  for (let g = 0; g < 5; g++) { const x = 11 + g * 2.6; ctx.beginPath(); ctx.moveTo(x, -24); ctx.quadraticCurveTo(x + 1.6, -20, x, -15.5); ctx.stroke(); }
  ink(ctx, () => ctx.arc(29, -22, 2.2, 0, Math.PI * 2), '#0F172A', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(28, -23, 1, 1);
  ctx.fillStyle = INK; ctx.fillRect(38, -19.6, 1.6, 0.8);
  // The pectoral fin
  shaded(ctx, () => { ctx.moveTo(3, -12); ctx.quadraticCurveTo(-1, -4, -6, 3); ctx.quadraticCurveTo(4, -1, 14, -9); ctx.closePath(); }, SHARK_FIN, -6, -12, 20, 15);
};
