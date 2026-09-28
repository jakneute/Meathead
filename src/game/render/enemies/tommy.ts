// Tommy's stage: Flint. The hood (a gangbanger with his pistol turned sideways,
// a bruiser with an aluminum bat, pit bulls, the lowriders on the bike run with
// the crew hanging out of the windows), and the sewer (Tommy's hazmat crew with
// their sprayers, bloated mutant sewer workers, a crew man behind a manhole
// cover with a pipe wrench to throw, sludgelings).
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { LOWRIDER_WINDOWS } from '../../enemies/kinds/tommy';

type Ctx = CanvasRenderingContext2D;

export const drawTommyKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'banger': drawBanger(ctx, e, f); break;
    case 'bruiser': drawBruiser(ctx, e, f); break;
    case 'pitbull': drawPitbull(ctx, e, f); break;
    case 'lowrider': drawLowrider(ctx, e, f); break;
    case 'hazmat': drawHazmat(ctx, e, f); break;
    case 'bloater': drawBloater(ctx, e, f); break;
    case 'manhole': drawManhole(ctx, e, f); break;
    case 'sludgeling': drawSludgeling(ctx, e, f); break;
    case 'mutantfish': drawMutantFish(ctx, e, f); break;
    case 'amalgam': ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.ellipse(0, -e.height / 2, e.width / 2, e.height / 2, 0, 0, Math.PI * 2); ctx.fill(); break;
  }
  void state;
};

const SKINS = ['#8D5524', '#C68642', '#5C3A21', '#F2C9A0', '#E0AC69'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round(e.homeX || 0)) % SKINS.length];
const pick = <T,>(e: Enemy, xs: T[]) => xs[Math.abs(Math.round((e.homeX || 0) / 7)) % xs.length];

const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe = '#F8FAFC') => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-9 + s, hipY, 8, -hipY - 5); ctx.fillRect(2 - s, hipY, 8, -hipY - 5);
  ctx.fillStyle = shoe; ctx.fillRect(-10 + s, -5, 11, 5); ctx.fillRect(1 - s, -5, 11, 5);
};

const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8) => {
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 3, y - 2, 2, 2); ctx.fillRect(x + 2, y + 3, 5, 1);
};

/** The muzzle glow before a shot. */
const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);

// ---------------------------------------------------------------------------
// The hood
// ---------------------------------------------------------------------------

/** A gangbanger: bandana over his face, a hoodie in his colors, a gold chain, jeans at half mast, the pistol turned sideways. */
const drawBanger = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  const colors = pick(e, ['#DC2626', '#1D4ED8', '#7C3AED', '#15803D']);
  legs(ctx, -26, f, 0, '#1E3A8A');
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-10, -30, 20, 4); // (his boxers, showing)
  ctx.fillStyle = colors; ctx.fillRect(-13, -56, 26, 28);
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-13, -38, 26, 2); ctx.fillRect(-6, -38, 12, 8); // the pocket
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-4, -54, 8, 2); ctx.fillRect(-1, -52, 2, 5);
  head(ctx, 2, -63, skin);
  ctx.fillStyle = colors; ctx.fillRect(-6, -63, 16, 6); // the bandana over his face
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(1, -68, 8.5, Math.PI, 0); ctx.fill(); // the hood up
  // The arm out, the pistol held flat on its side
  ctx.fillStyle = colors; ctx.fillRect(8, -48, 12, 7);
  ctx.fillStyle = skin; ctx.fillRect(19, -48, 5, 7);
  ctx.save(); ctx.translate(22, -45); ctx.rotate(-Math.PI / 2 + 0.1);
  ctx.fillStyle = '#111827'; ctx.fillRect(-3, 0, 6, 16); ctx.fillRect(-3, -2, 9, 5);
  ctx.restore();
  const c = charge(e);
  if (c > 0.6) { ctx.fillStyle = `rgba(254, 240, 138, ${c})`; ctx.beginPath(); ctx.arc(40, -45, 2 + c * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** A bruiser: huge, a wife-beater, cornrows, an aluminum bat back over his shoulder, and he's coming. */
const drawBruiser = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, '#44403C', '#111827');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.22 : 0);
  ctx.fillStyle = skin; ctx.fillRect(-16, -36, 32, 36);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-12, -34, 24, 32); // the tank top
  ctx.fillStyle = skin; ctx.fillRect(-7, -34, 14, 6);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-5, -30, 10, 2);
  head(ctx, 3, -44, skin, 9);
  ctx.fillStyle = '#111827'; for (let k = 0; k < 4; k++) ctx.fillRect(-5 + k * 3, -53, 2, 9); // cornrows
  // The bat: back over the shoulder, then swinging round as he closes
  const swing = running ? Math.sin(f * 0.35) * 0.4 : 0;
  ctx.save(); ctx.translate(8, -30); ctx.rotate(-2.3 + swing);
  ctx.fillStyle = skin; ctx.fillRect(0, -4, 14, 8);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(12, -3, 30, 5); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(12, -3, 30, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(10, -3, 5, 5);
  ctx.restore();
  ctx.restore();
};

/** A pit bull: stocky, brindle, a spiked collar, all jaw. Legs going flat out when it runs. */
const drawPitbull = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1.5 || e.aiState === 'lunge' || e.aiState === 'leap';
  const cycle = running ? f * 0.6 : f * 0.2;
  const crouch = e.aiState === 'bristle' ? 3 : 0;
  const coat = pick(e, ['#78716C', '#A8A29E', '#57534E', '#D6D3D1']);
  ctx.fillStyle = coat;
  for (let i = 0; i < 4; i++) {
    const lx = i < 2 ? 14 + (i % 2) * 4 : -16 + (i % 2) * 4;
    const sw = running ? Math.sin(cycle + i * 1.7) * 6 : 0;
    ctx.fillRect(lx + sw * 0.5 - 2, -12 + crouch, 5, 12 - crouch);
  }
  ctx.beginPath(); ctx.ellipse(0, -17 + crouch, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = -14; k < 14; k += 6) ctx.fillRect(k, -24 + crouch, 2, 12); // brindle
  ctx.fillStyle = coat; ctx.fillRect(-26, -21 + crouch, 7, 3); // the tail
  // Head: wide, the jaw
  const open = running || e.aiState === 'bristle';
  ctx.beginPath(); ctx.ellipse(22, -22 + crouch, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(24, -20 + crouch, 10, open ? 5 : 7);
  if (open) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(25, -15 + crouch, 9, 3); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(26, -16 + crouch, 2, 2); ctx.fillRect(31, -16 + crouch, 2, 2); }
  ctx.fillStyle = '#111827'; ctx.fillRect(25, -25 + crouch, 2, 2); ctx.fillRect(33, -21 + crouch, 3, 2);
  ctx.fillStyle = coat; ctx.beginPath(); ctx.moveTo(16, -29 + crouch); ctx.lineTo(19, -34 + crouch); ctx.lineTo(21, -28 + crouch); ctx.fill(); // an ear
  // The spiked collar
  ctx.fillStyle = '#111827'; ctx.fillRect(12, -24 + crouch, 5, 10);
  ctx.fillStyle = '#E5E7EB'; for (let k = 0; k < 3; k++) ctx.fillRect(11, -23 + crouch + k * 3, 2, 2);
};

/**
 * A lowrider: a long candy-painted 60s sedan, chrome and whitewalls and wire wheels, riding low; two of the crew
 * hanging out of the windows with pistols, turned to wherever he is (the car always faces the way it's driving).
 */
const drawLowrider = (ctx: Ctx, e: Enemy, f: number) => {
  const paint = pick(e, ['#9D174D', '#6D28D9', '#B91C1C', '#0F766E']);
  const aim = e.aiX === -1 ? -1 : 1;
  // Wheels
  for (const wx of [-48, 48]) {
    ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(wx, -11, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(wx, -11, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D1D5DB'; ctx.beginPath(); ctx.arc(wx, -11, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1;
    for (let k = 0; k < 6; k++) { const a = f * 0.4 + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(wx, -11); ctx.lineTo(wx + Math.cos(a) * 6, -11 + Math.sin(a) * 6); ctx.stroke(); }
  }
  // The body, long and low
  ctx.fillStyle = paint;
  ctx.beginPath(); ctx.moveTo(-75, -14); ctx.lineTo(-74, -30); ctx.lineTo(-40, -32); ctx.lineTo(-30, -48); ctx.lineTo(30, -48); ctx.lineTo(44, -32); ctx.lineTo(74, -30); ctx.lineTo(76, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-72, -29, 146, 3);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-76, -16, 152, 3); // the chrome strip
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(72, -26, 4, 4); ctx.fillStyle = '#DC2626'; ctx.fillRect(-76, -26, 3, 4);
  // Windows
  ctx.fillStyle = '#1E293B'; ctx.fillRect(-26, -45, 24, 12); ctx.fillRect(2, -45, 26, 12);
  // The crew, leaning out toward him with their pistols
  for (const w of LOWRIDER_WINDOWS) {
    if (e.health <= 0) break;
    const x = w.x, y = w.y;
    ctx.save(); ctx.translate(x, y); ctx.scale(aim, 1);
    ctx.fillStyle = pick(e, ['#DC2626', '#1D4ED8', '#F8FAFC']); ctx.fillRect(-5, -14, 12, 14);
    ctx.fillStyle = '#8D5524'; ctx.beginPath(); ctx.arc(4, -19, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; ctx.fillRect(-2, -26, 12, 4); // a cap, backwards
    ctx.fillStyle = '#8D5524'; ctx.fillRect(6, -10, 12, 4);
    ctx.fillStyle = '#111827'; ctx.fillRect(16, -12, 3, 8); ctx.fillRect(16, -12, 8, 3);
    ctx.restore();
  }
  // Hydraulics hiss
  if (f % 40 < 3) { ctx.fillStyle = 'rgba(229,231,235,0.6)'; ctx.beginPath(); ctx.arc(0, -4, 6, 0, Math.PI * 2); ctx.fill(); }
};

// ---------------------------------------------------------------------------
// The sewer
// ---------------------------------------------------------------------------

/** Tommy's hazmat crew: a yellow suit, a gas mask with a big filter, a tank on the back, a spray wand of his muck. */
const drawHazmat = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, 0, '#EAB308', '#1C1917');
  ctx.fillStyle = '#374151'; ctx.fillRect(-18, -54, 8, 24); ctx.fillStyle = '#65A30D'; ctx.fillRect(-17, -50, 6, 6); // the tank
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.roundRect(-13, -58, 26, 32, 4); ctx.fill();
  ctx.fillStyle = '#EAB308'; ctx.fillRect(-13, -40, 26, 2);
  ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.arc(0, -48, 4, 0, Math.PI * 2); ctx.fill(); // Tommy's badge
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(1, -66, 10, 0, Math.PI * 2); ctx.fill(); // hood
  ctx.fillStyle = '#1F2937'; ctx.fillRect(1, -70, 11, 6); // the visor
  ctx.fillStyle = 'rgba(163, 230, 53, 0.35)'; ctx.fillRect(2, -69, 9, 3);
  ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(10, -60, 4.5, 0, Math.PI * 2); ctx.fill(); // the filter
  // The wand
  ctx.fillStyle = '#FACC15'; ctx.fillRect(8, -46, 10, 6);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(16, -45, 18, 3);
  const c = charge(e);
  if (c > 0.4) { ctx.fillStyle = `rgba(132, 204, 22, ${c})`; ctx.beginPath(); ctx.arc(36, -44, 2 + c * 4, 0, Math.PI * 2); ctx.fill(); }
};

/** A bloater: a sewer worker who's been down here too long. Swollen grey-green, his orange overalls splitting, boils, drool. */
const drawBloater = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const wob = Math.sin(f * 0.3) * (running ? 2 : 1);
  legs(ctx, -24, f * (running ? 1.3 : 0.5), running ? 6 : 1, '#EA580C', '#1C1917');
  ctx.save(); ctx.translate(0, -24); ctx.rotate(running ? 0.18 : 0);
  ctx.fillStyle = '#84A98C'; ctx.beginPath(); ctx.ellipse(0, -24, 26 + wob, 26 - wob, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#EA580C'; ctx.fillRect(-22, -14, 44, 14); ctx.fillRect(-12, -34, 6, 22); ctx.fillRect(6, -34, 6, 22); // overalls, straps
  ctx.fillStyle = '#84A98C'; ctx.fillRect(-4, -12, 8, 6); // (splitting at the seam)
  ctx.fillStyle = '#D9F99D'; for (const [bx, by, r] of [[-14, -30, 4], [12, -38, 3], [18, -22, 5], [-6, -44, 3]]) { ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); } // boils
  // Head, sunk into it
  ctx.fillStyle = '#6B8F71'; ctx.beginPath(); ctx.arc(6, -50, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(8, -54, 4, 3); ctx.fillStyle = '#111827'; ctx.fillRect(10, -53, 2, 2);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(7, -46, 8, 3);
  ctx.fillStyle = 'rgba(163, 230, 53, 0.8)'; ctx.fillRect(12, -43, 2, 4 + (f % 20) / 4); // drool
  // Arms out, grabbing
  ctx.fillStyle = '#84A98C'; ctx.fillRect(18, -34 + wob, 16, 7); ctx.fillRect(18, -24 - wob, 14, 7);
  ctx.restore();
};

/** A sewer crew man: orange vest, a hard hat, a manhole cover for a shield (FLINT on it), a pipe wrench to throw. */
const drawManhole = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1E3A8A', '#78350F');
  ctx.fillStyle = '#F97316'; ctx.fillRect(-13, -56, 26, 30);
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-13, -46, 26, 3); ctx.fillRect(-13, -38, 26, 3);
  head(ctx, 2, -63, skin);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(1, -67, 10, Math.PI, 0); ctx.fill(); ctx.fillRect(-11, -68, 24, 3); // hard hat
  if (e.isShieldActive) {
    // The cover held up in front of him
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.arc(18, -40, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.arc(18, -40, 19, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#292524'; ctx.lineWidth = 1;
    for (let k = -14; k <= 14; k += 5) { ctx.beginPath(); ctx.moveTo(18 + k, -58); ctx.lineTo(18 + k, -22); ctx.stroke(); }
    ctx.fillStyle = '#A8A29E'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('FLINT', 18, -38); ctx.textAlign = 'left';
  } else {
    // Cover down at his side, winding up with the wrench
    ctx.fillStyle = '#44403C'; ctx.beginPath(); ctx.ellipse(-16, -20, 6, 18, 0, 0, Math.PI * 2); ctx.fill();
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = skin; ctx.fillRect(-4 - wind * 10, -56, 7, 12);
    ctx.save(); ctx.translate(-3 - wind * 12, -60); ctx.rotate(-0.8);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(-2, -14, 4, 16); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-4, -18, 8, 5);
    ctx.restore();
  }
};

/** A sludgeling: a lump of sewer muck with eyes. Under the surface it's just the eyes, blinking. */
const drawSludgeling = (ctx: Ctx, e: Enemy, f: number) => {
  const lurking = !e.aiState || e.aiState === 'idle';
  if (lurking) {
    // (just its eyes above the muck, and bubbles)
    const blink = f % 120 < 6;
    ctx.fillStyle = '#FEF08A'; if (!blink) { ctx.fillRect(-6, -20, 4, 4); ctx.fillRect(3, -20, 4, 4); }
    ctx.fillStyle = '#111827'; if (!blink) { ctx.fillRect(-5, -19, 2, 2); ctx.fillRect(4, -19, 2, 2); }
    if (f % 50 < 20) { ctx.fillStyle = 'rgba(101, 163, 13, 0.7)'; ctx.beginPath(); ctx.arc(8, -16 - (f % 50) / 4, 2, 0, Math.PI * 2); ctx.fill(); }
    return;
  }
  const squash = e.vel.y === 0 ? 1.15 : 0.85;
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(0, -9 * squash, 15 / squash, 9 * squash, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.ellipse(-4, -6, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#65A30D'; for (let k = -10; k <= 10; k += 7) ctx.fillRect(k, -2, 3, 3 + ((f + k) % 8) / 2); // drips
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(3, -15 * squash, 4, 4); ctx.fillRect(9, -14 * squash, 4, 4);
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -14 * squash, 2, 2); ctx.fillRect(11, -13 * squash, 2, 2);
  ctx.fillStyle = '#1A2E05'; ctx.fillRect(6, -8, 8, 2);
};

/** A mutant sewer fish: bloated, patchy green and orange, three eyes, a sick glow to it, the bones showing at its tail. */
const drawMutantFish = (ctx: Ctx, e: Enemy, f: number) => {
  const lunge = Math.hypot(e.vel.x, e.vel.y) > 2.5;
  const wag = Math.sin(f * (lunge ? 0.6 : 0.25)) * (lunge ? 6 : 3);
  ctx.save(); ctx.translate(0, -13);
  ctx.fillStyle = 'rgba(163, 230, 53, 0.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2); ctx.fill();
  // The tail: the flesh gone off it, bones and a ragged fin
  ctx.strokeStyle = '#E7E5D6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-26, wag * 0.5); ctx.stroke();
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-17 - k * 3, wag * 0.2); ctx.lineTo(-18 - k * 3, -5); ctx.moveTo(-17 - k * 3, wag * 0.2); ctx.lineTo(-18 - k * 3, 5); ctx.stroke(); }
  ctx.fillStyle = 'rgba(132, 204, 22, 0.8)'; ctx.beginPath(); ctx.moveTo(-26, wag * 0.5); ctx.lineTo(-34, wag - 8); ctx.lineTo(-31, wag * 0.5); ctx.lineTo(-34, wag + 8); ctx.fill();
  // The body: bloated, patchy
  ctx.fillStyle = '#6B8E23'; ctx.beginPath(); ctx.ellipse(2, 0, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#EA580C'; ctx.beginPath(); ctx.ellipse(-4, -4, 7, 4, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, 5, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D9F99D'; ctx.beginPath(); ctx.ellipse(4, 6, 12, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(2, -18); ctx.lineTo(8, -10); ctx.fill();
  // Three eyes
  for (const [ex, ey] of [[12, -5], [17, -1], [8, -8]]) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111827'; ctx.fillRect(ex, ey - 1, 2, 2); }
  // The mouth, jagged, open when it lunges
  ctx.fillStyle = '#1A2E05'; ctx.beginPath(); ctx.moveTo(22, 1); ctx.lineTo(14, lunge ? 7 : 4); ctx.lineTo(22, lunge ? 9 : 5); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(16, 4, 1.5, 2); ctx.fillRect(19, 4, 1.5, 2);
  ctx.restore();
};
