// Hector's stage: his goons dressed for Miami (a tourist with a chrome pistol, a
// nightclub bouncer, a surfer behind his board), Miami-Dade's finest, the
// beachgoers, and the Florida wildlife. Drawn like Artie's lot: facing right
// from a point at the feet (centre bottom), flipped by the caller.

import { Enemy } from '../../types';
import type { GameState } from '../state';

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
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)'; ctx.fillRect(10, -76, 16, 74);
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.strokeRect(10, -76, 16, 74);
    ctx.save(); ctx.translate(20, -36); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('POLICE', 0, 3);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(damage * 5); i++) { const y0 = -70 + i * 13; ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(18, y0 + 5); ctx.lineTo(25, y0 + 2); ctx.stroke(); }
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
  if (panicking) {
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

const GATOR = '#3F5B2A', GATOR_DARK = '#2A3D1C', GATOR_BELLY = '#B8B07A';

/** A gator: long and low, armored back, pale belly; jaws gape to hiss and lunge, the tail thrashes at rest. */
const drawGator = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  if (e.variant === 1 && st !== 'breach') {
    // In the water: just the eyes and nostrils breaking the surface
    ctx.fillStyle = GATOR;
    ctx.beginPath(); ctx.ellipse(-4, -6, 10, 5, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, -4, 8, 3.5, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#FDE047'; ctx.fillRect(-8, -9, 3, 3); ctx.fillRect(0, -9, 3, 3);
    ctx.fillStyle = '#111827'; ctx.fillRect(-7, -9, 1, 3); ctx.fillRect(1, -9, 1, 3);
    return;
  }
  const open = st === 'hiss' ? 0.5 : st === 'lunge' ? 0.35 + Math.abs(Math.sin(f * 0.5)) * 0.2 : st === 'breach' ? 0.55 : 0;
  const run = st === 'lunge' ? Math.sin(f * 0.8) * 4 : 0;
  const tail = st === 'rest' ? Math.sin(f * 0.35) * 8 : Math.sin(f * 0.05) * 2;
  // Tail
  ctx.fillStyle = GATOR;
  ctx.beginPath(); ctx.moveTo(-20, -18); ctx.quadraticCurveTo(-40, -14 + tail * 0.4, -52, -6 + tail); ctx.lineTo(-20, -6); ctx.fill();
  // Legs splayed out the sides
  ctx.fillStyle = GATOR_DARK;
  for (const [lx, ph] of [[-14, 0], [16, 1]] as [number, number][]) { ctx.fillRect(lx + (ph ? run : -run), -8, 6, 8); ctx.fillRect(lx - 2 + (ph ? run : -run), -2, 9, 2); }
  // Body: belly, then the armored back with ridges
  ctx.fillStyle = GATOR_BELLY; ctx.fillRect(-22, -10, 46, 4);
  ctx.fillStyle = GATOR; ctx.beginPath(); ctx.ellipse(0, -14, 26, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = GATOR_DARK; for (let x = -20; x < 20; x += 6) { ctx.beginPath(); ctx.moveTo(x, -21); ctx.lineTo(x + 3, -25); ctx.lineTo(x + 6, -21); ctx.fill(); }
  // Head and jaws (the top jaw hinges up)
  ctx.save();
  ctx.translate(24, -14);
  ctx.fillStyle = GATOR;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 4); ctx.lineTo(22, 8); ctx.lineTo(0, 8); ctx.fill();         // lower jaw
  ctx.rotate(-open);
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(24, -1); ctx.lineTo(24, 3); ctx.lineTo(0, 4); ctx.fill();      // upper jaw
  ctx.fillStyle = '#F8FAFC'; for (let x = 4; x < 22; x += 4) { ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x + 2, 7); ctx.lineTo(x + 3, 3); ctx.fill(); }
  ctx.fillStyle = '#FDE047'; ctx.fillRect(2, -7, 4, 3); ctx.fillStyle = '#111827'; ctx.fillRect(3, -7, 1, 3);
  ctx.restore();
  if (open > 0) { ctx.fillStyle = '#9F1239'; ctx.beginPath(); ctx.moveTo(24, -12); ctx.lineTo(40, -14 - open * 18); ctx.lineTo(42, -8); ctx.fill(); } // pink mouth
};

/** A brown pelican: grey-brown wings, white head, that huge orange pouch of a beak. */
const drawPelican = (ctx: Ctx, e: Enemy, f: number) => {
  const swooping = e.aiState === 'swoop';
  const flap = swooping ? Math.sin(f * 0.15) * 3 : Math.sin(f * 0.3) * 10;
  ctx.fillStyle = '#6B5B45';
  ctx.beginPath(); ctx.moveTo(-6, -14); ctx.lineTo(-28, -24 - flap); ctx.lineTo(-10, -12); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-2, -12, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4B3F30'; ctx.beginPath(); ctx.moveTo(-20, -12); ctx.lineTo(-30, -16); ctx.lineTo(-30, -8); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(14, -18, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(12, -24, 5, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(15, -20, 2, 2);
  // The beak and pouch
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(18, -19, 18, 3);
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.moveTo(18, -16); ctx.quadraticCurveTo(28, swooping ? -6 : -10, 36, -16); ctx.fill();
  ctx.fillStyle = '#6B5B45'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-18, -26 + flap); ctx.lineTo(8, -12); ctx.fill();
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(-4, -4, 2, 4); ctx.fillRect(2, -4, 2, 4);
};

/** A green iguana: spiky crest, dewlap, a tail twice its length. Clings to the palm, spins as it falls. */
const drawIguana = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  ctx.save();
  if (st === 'drop') { ctx.translate(0, -8); ctx.rotate(f * 0.3); ctx.translate(0, 8); }
  const whip = st === 'whip' ? Math.sin(f * 0.7) * 12 : Math.sin(f * 0.1) * 2;
  const run = st === 'scurry' ? Math.sin(f * 0.9) * 3 : 0;
  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath(); ctx.moveTo(-8, -8); ctx.quadraticCurveTo(-24, -6 + whip * 0.3, -38, -2 + whip); ctx.lineTo(-8, -4); ctx.fill();
  ctx.fillStyle = '#365314'; for (let x = -34; x < -10; x += 5) ctx.fillRect(x, -5 + ((x / 5) % 2 ? 1 : 0), 2, 2); // tail bands
  ctx.fillStyle = '#3F6212'; ctx.fillRect(-8 + run, -3, 4, 3); ctx.fillRect(8 - run, -3, 4, 3);
  ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(2, -8, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(15, -10, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A3E635'; ctx.beginPath(); ctx.moveTo(12, -7); ctx.lineTo(16, -2); ctx.lineTo(18, -7); ctx.fill(); // dewlap
  ctx.fillStyle = '#365314'; for (let x = -6; x < 14; x += 4) { ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x + 2, -16); ctx.lineTo(x + 4, -12); ctx.fill(); }
  ctx.fillStyle = '#FDE047'; ctx.fillRect(17, -12, 2, 2);
  ctx.restore();
};

/** A red crab: eyes on stalks, pincers up, legs a blur when it scuttles. */
const drawCrab = (ctx: Ctx, e: Enemy, f: number) => {
  const moving = Math.abs(e.vel.x) > 0.3;
  const leg = moving ? Math.sin(f * 1.1) * 3 : 0;
  ctx.strokeStyle = '#991B1B'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(-12 - i * 2, -6 + (i % 2 ? leg : -leg)); ctx.lineTo(-14 - i * 2, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(12 + i * 2, -6 + (i % 2 ? -leg : leg)); ctx.lineTo(14 + i * 2, 0); ctx.stroke();
  }
  ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.ellipse(0, -9, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.fillRect(-6, -13, 6, 2);
  const pinch = e.aiState === 'pinch' ? Math.abs(Math.sin(f * 0.6)) * 4 : 0;
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(s * 9 - 2, -18, 4, 8);
    ctx.beginPath(); ctx.arc(s * 10, -20, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FCA5A5'; ctx.fillRect(s * 10 - 1, -25 - pinch, 2, 5);
  }
  ctx.fillStyle = '#111827'; ctx.fillRect(-4, -18, 2, 5); ctx.fillRect(3, -18, 2, 5);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-4, -19, 2, 2); ctx.fillRect(3, -19, 2, 2);
};

/** A shark, flying round in the storm: grey back, white belly, jaws wide when it lunges. */
const drawShark = (ctx: Ctx, e: Enemy, f: number, _state: GameState) => {
  const biting = e.aiState === 'bite';
  const sway = Math.sin(f * 0.25) * 4;
  ctx.fillStyle = '#64748B';
  ctx.beginPath(); ctx.moveTo(-40, -17 + sway); ctx.lineTo(-56, -30 + sway); ctx.lineTo(-50, -17 + sway); ctx.lineTo(-56, -4 + sway); ctx.fill(); // tail
  ctx.beginPath(); ctx.ellipse(-2, -17, 40, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -28); ctx.lineTo(0, -46); ctx.lineTo(10, -28); ctx.fill();                     // dorsal fin
  ctx.fillStyle = '#E2E8F0'; ctx.beginPath(); ctx.ellipse(4, -10, 32, 6, 0, 0, Math.PI); ctx.fill();          // belly
  ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.moveTo(4, -10); ctx.lineTo(-4, 2); ctx.lineTo(14, -8); ctx.fill(); // pectoral fin
  for (let g = 0; g < 3; g++) ctx.fillRect(16 + g * 4, -22, 1.5, 8);                                           // gills
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(28, -21, 2.5, 0, Math.PI * 2); ctx.fill();
  // Mouth
  const gape = biting ? 7 + Math.abs(Math.sin(f * 0.6)) * 4 : 2;
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(24, -13); ctx.lineTo(40, -16 - gape * 0.4); ctx.lineTo(40, -13 + gape * 0.6); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; for (let x = 26; x < 40; x += 3) { ctx.fillRect(x, -15 - gape * 0.2, 1.5, 3); ctx.fillRect(x, -13 + gape * 0.3, 1.5, 2); }
};
