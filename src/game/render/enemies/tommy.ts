// Tommy's stage: Flint. The hood (a gangbanger with his pistol turned sideways,
// a bruiser with an aluminum bat, pit bulls, the lowriders on the bike run with
// the crew hanging out of the windows), and the sewer (Tommy's hazmat crew with
// their sprayers, bloated mutant sewer workers, a crew man behind a manhole
// cover with a pipe wrench to throw, sludgelings).
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { LOWRIDER_WINDOWS } from '../../enemies/kinds/tommy';
import { INK, ink, shaded, shadedTop, eye, limb, dark, lite } from '../npc/kit';
import { pixelBlob } from '../pixelArt';

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
  const chest = '#E7E5E4';
  // A leg, thick and short: the upper, the lower, a round paw with its toes
  const leg = (i: number, back: boolean) => {
    const c = back ? dark(coat, 0.22) : coat;
    const lx = i < 2 ? 14 + (i % 2) * 4 : -16 + (i % 2) * 4;
    const sw = running ? Math.sin(cycle + i * 1.7) * 6 : 0;
    const top = -16 + crouch, kx = lx + sw * 0.3 + (i < 2 ? 0 : 1.5), fx = lx + sw * 0.5;
    limb(ctx, lx, top, kx, -6, 5.5, c); limb(ctx, kx, -6, fx, -2, 4.2, c);
    ink(ctx, () => ctx.ellipse(fx + 1, -1.6, 3, 1.6, 0, 0, Math.PI * 2), i < 2 && !back ? chest : dark(c, 0.1), 0.8);
    ctx.fillStyle = INK; ctx.fillRect(fx + 2, -2.4, 0.7, 1.2);
  };
  for (const i of [1, 3]) leg(i, true);
  // The tail, a short whip
  const sw = Math.sin(f * (running ? 0.5 : 0.15)) * 3;
  limb(ctx, -20, -21 + crouch, -27, -24 + crouch + sw, 2.4, coat);
  // Body: a barrel of muscle, the chest broad and pale, the brindle in stripes, the shoulder's bulge
  const body = () => { ctx.moveTo(14, -28 + crouch); ctx.quadraticCurveTo(23, -25 + crouch, 21, -14 + crouch); ctx.quadraticCurveTo(18, -8 + crouch, 10, -9 + crouch); ctx.quadraticCurveTo(0, -11 + crouch, -8, -10 + crouch); ctx.quadraticCurveTo(-21, -8 + crouch, -22, -18 + crouch); ctx.quadraticCurveTo(-22, -27 + crouch, -10, -27 + crouch); ctx.quadraticCurveTo(2, -26 + crouch, 14, -28 + crouch); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = coat; ctx.fillRect(-24, -30 + crouch, 48, 24);
  ctx.fillStyle = lite(coat, 0.2); ctx.fillRect(-24, -30 + crouch, 48, 5);
  ctx.strokeStyle = dark(coat, 0.3); ctx.lineWidth = 1.4; // brindle
  for (let k = -16; k < 12; k += 5) { ctx.beginPath(); ctx.moveTo(k, -27 + crouch); ctx.quadraticCurveTo(k - 2, -19 + crouch, k + 1, -10 + crouch); ctx.stroke(); }
  ctx.fillStyle = dark(coat, 0.22); ctx.fillRect(-24, -14 + crouch, 48, 8);
  ctx.fillStyle = chest; ctx.beginPath(); ctx.ellipse(19, -16 + crouch, 5, 9, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark(coat, 0.35); ctx.beginPath(); ctx.arc(10, -18 + crouch, 6, -0.3, 1.6); ctx.fill(); // the shoulder's shadow
  ctx.fillStyle = coat; ctx.beginPath(); ctx.arc(9, -19 + crouch, 5.6, -0.3, 1.6); ctx.fill();
  ctx.fillStyle = dark(coat, 0.35); ctx.beginPath(); ctx.arc(-15, -17 + crouch, 5.6, -0.6, 1.4); ctx.fill(); // the haunch
  ctx.fillStyle = coat; ctx.beginPath(); ctx.arc(-16, -18 + crouch, 5.2, -0.6, 1.4); ctx.fill();
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  for (const i of [0, 2]) leg(i, false);
  // Head: wide, the cheeks bulging, a short muzzle and the black nose, rose ears; the jaw open when it's coming
  const open = running || e.aiState === 'bristle';
  const hx = 22, hy = -22 + crouch;
  ctx.save(); ctx.translate(hx, hy);
  ink(ctx, () => { ctx.moveTo(-6, -6); ctx.quadraticCurveTo(-8, -11, -3, -10); ctx.lineTo(-2, -6); ctx.closePath(); }, dark(coat, 0.3), 0.9);
  if (open) {
    // The lower jaw down, the red of the mouth, the teeth
    ink(ctx, () => { ctx.moveTo(-2, 3); ctx.lineTo(12, 4); ctx.quadraticCurveTo(13, 8, 10, 8); ctx.lineTo(-1, 7); ctx.closePath(); }, chest, 1);
    ink(ctx, () => { ctx.moveTo(1, 2); ctx.lineTo(12, 2); ctx.lineTo(11, 5); ctx.lineTo(1, 5); ctx.closePath(); }, '#7F1D1D', 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(3, 1.6, 1.6, 2); ctx.fillRect(9.4, 1.6, 1.6, 2); ctx.fillRect(4, 4.2, 1.4, 1.4); ctx.fillRect(9, 4.2, 1.4, 1.4);
    ctx.fillStyle = '#F87171'; ctx.fillRect(5, 4, 4, 1);
  }
  const head = () => { ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-9, -8, -2, -8.5); ctx.quadraticCurveTo(5, -9, 8, -5); ctx.lineTo(12.5, -3.5); ctx.quadraticCurveTo(14, 0, 12.5, open ? 2 : 4.5); ctx.quadraticCurveTo(6, open ? 3 : 7, 0, 6); ctx.quadraticCurveTo(-7, 5, -8, 0); ctx.closePath(); };
  shaded(ctx, head, coat, -9, -9, 23, 16);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  ctx.fillStyle = dark(coat, 0.28); ctx.beginPath(); ctx.arc(-1, 3, 5, 0.2, 2.6); ctx.fill(); // the jaw muscle's shadow
  ctx.restore();
  ctx.strokeStyle = dark(coat, 0.45); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(6, -5.5); ctx.lineTo(7.5, -3); ctx.stroke(); // the stop
  ink(ctx, () => ctx.ellipse(12.6, -2.6, 2, 1.6, 0, 0, Math.PI * 2), '#1F1A14', 0.6);
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(12, -3.6, 1, 0.8);
  if (!open) { ctx.fillStyle = INK; ctx.fillRect(5, 2.4, 7, 0.9); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10, 3.2, 1, 1); }
  eye(ctx, 3.5, -4.5, 1.6, 0.8, 0, open ? '#FCA5A5' : '#FFFFFF');
  ctx.fillStyle = INK; ctx.fillRect(1.6, open ? -7 : -6.8, 4.4, 1); // the brow, down
  ink(ctx, () => { ctx.moveTo(-5, -7); ctx.quadraticCurveTo(-4, -12, 1, -10); ctx.quadraticCurveTo(0, -7, -2, -6); ctx.closePath(); }, dark(coat, 0.12), 0.9);
  ctx.restore();
  // The spiked collar: the black strap, its steel studs
  ink(ctx, () => ctx.roundRect(12, -25 + crouch, 5, 11, 1.5), '#1C1917', 0.9);
  for (let k = 0; k < 3; k++) {
    const y = -23 + crouch + k * 3.4;
    ink(ctx, () => { ctx.moveTo(12.5, y - 1.2); ctx.lineTo(9.5, y); ctx.lineTo(12.5, y + 1.2); ctx.closePath(); }, '#D1D5DB', 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(11, y - 0.6, 1, 0.6);
  }
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
  const muck = '#4D7C0F';
  const lurking = !e.aiState || e.aiState === 'idle';
  if (lurking) {
    // (just its eyes above the muck, a hump of it round them, and bubbles)
    const blink = f % 120 < 6;
    shadedTop(ctx, () => ctx.ellipse(0.5, -16, 9, 3, 0, Math.PI, 0), muck, -9, -19, 19, 3, 0.9);
    for (const x of [-4, 5]) {
      if (blink) { ink(ctx, () => ctx.ellipse(x, -18, 2.6, 1, 0, 0, Math.PI * 2), dark(muck, 0.1), 0.8); continue; }
      eye(ctx, x, -18.5, 2.4, 0.6, 0.2, '#FEF08A');
      ctx.fillStyle = dark(muck, 0.1); ctx.fillRect(x - 2.6, -21.4, 5.2, 1); // the lid, heavy
    }
    if (f % 50 < 20) {
      const by = -16 - (f % 50) / 4;
      ink(ctx, () => ctx.arc(9, by, 1.8, 0, Math.PI * 2), 'rgba(132, 204, 22, 0.75)', 0.6);
      ctx.fillStyle = '#ECFCCB'; ctx.fillRect(8.2, by - 1.1, 0.8, 0.8);
    }
    return;
  }
  const squash = e.vel.y === 0 ? 1.15 : 0.85;
  const rw = 15 / squash, rh = 9 * squash, cy = -9 * squash;
  // The lump: its edge wobbling, lit on top, slumped dark at the bottom; the pockets and the junk stuck in it, a shine
  const blob = () => {
    for (let k = 0; k <= 24; k++) {
      const a = (k / 24) * Math.PI * 2, wob = 1 + Math.sin(a * 3 + f * 0.12) * 0.06 + Math.sin(a * 5 - f * 0.08) * 0.04;
      const x = Math.cos(a) * rw * wob, y = cy + Math.sin(a) * rh * (Math.sin(a) > 0 ? 1 : wob);
      if (k) ctx.lineTo(x, Math.min(0, y)); else ctx.moveTo(x, Math.min(0, y));
    }
    ctx.closePath();
  };
  shadedTop(ctx, blob, muck, -rw, cy - rh, rw * 2, rh * 2, 1);
  ctx.save(); ctx.beginPath(); blob(); ctx.clip();
  ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.ellipse(-5, -5, 7, 3.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, cy - 4, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A3A3A3'; ctx.fillRect(-9, cy - 2, 3, 2); ctx.fillStyle = '#E5E5E5'; ctx.fillRect(-9, cy - 2, 1, 1); // (a bottle cap)
  ctx.fillStyle = '#78350F'; ctx.save(); ctx.translate(-3, cy - rh * 0.5); ctx.rotate(-0.5); ctx.fillRect(0, 0, 6, 1.4); ctx.restore(); // (a twig)
  ctx.restore();
  ctx.fillStyle = lite(muck, 0.55); ctx.fillRect(-rw * 0.55, cy - rh * 0.7, 3, 1); ctx.fillRect(-rw * 0.62, cy - rh * 0.5, 1, 1);
  // Bubbles on its skin
  ctx.strokeStyle = lite(muck, 0.35); ctx.lineWidth = 0.8;
  for (const [bx, by] of [[-10, cy + 2], [1, cy - rh * 0.6]]) { ctx.beginPath(); ctx.arc(bx, by, 1.4, 0, Math.PI * 2); ctx.stroke(); }
  // Drips off it
  for (let k = -10; k <= 10; k += 7) {
    const len = 1.5 + ((f + k + 20) % 8) / 4;
    ink(ctx, () => { ctx.moveTo(k, -1.5); ctx.lineTo(k + 3, -1.5); ctx.lineTo(k + 2.4, -1.5 + len); ctx.arc(k + 1.5, -1.5 + len, 1, 0, Math.PI); ctx.closePath(); }, '#65A30D', 0.7);
  }
  // The eyes, the mouth (a slit, dribbling)
  eye(ctx, 5, -13 * squash, 2.2, 0.7, 0.1, '#FEF08A');
  eye(ctx, 11, -12 * squash, 2.2, 0.7, 0.1, '#FEF08A');
  ink(ctx, () => { ctx.moveTo(5, -7); ctx.quadraticCurveTo(10, -5, 14, -7.5); ctx.quadraticCurveTo(10, -6.5, 5, -7); ctx.closePath(); }, '#1A2E05', 0.8);
  ctx.fillStyle = '#65A30D'; ctx.fillRect(11, -6.2, 1, 2 + (f % 20) / 8);
};

/** A mutant sewer fish: bloated, patchy green and orange, three eyes, a sick glow to it, the bones showing at its tail. */
const drawMutantFish = (ctx: Ctx, e: Enemy, f: number) => {
  const lunge = Math.hypot(e.vel.x, e.vel.y) > 2.5;
  const wag = Math.sin(f * (lunge ? 0.6 : 0.25)) * (lunge ? 6 : 3);
  const skin = '#6B8E23';
  ctx.save(); ctx.translate(0, -13);
  pixelBlob(ctx, 0, 0, 32, 20, 'rgba(163, 230, 53, 0.16)');
  // The tail: the flesh gone off it, the spine and ribs bare, and a ragged fin
  const bone = (x1: number, y1: number, x2: number, y2: number) => { limb(ctx, x1, y1, x2, y2, 1.4, '#E7E5D6'); };
  bone(-14, 0, -26, wag * 0.5);
  for (let k = 0; k < 3; k++) { bone(-17 - k * 3, wag * 0.2, -18 - k * 3, -5); bone(-17 - k * 3, wag * 0.2, -18 - k * 3, 5); }
  const fin = () => { ctx.moveTo(-26, wag * 0.5); ctx.lineTo(-34, wag - 8); ctx.lineTo(-32, wag - 3); ctx.lineTo(-35, wag - 1); ctx.lineTo(-31, wag * 0.5 + 1); ctx.lineTo(-35, wag + 4); ctx.lineTo(-34, wag + 8); ctx.closePath(); };
  shaded(ctx, fin, '#84CC16', -35, wag - 8, 9, 16, 0.9);
  ctx.strokeStyle = dark('#84CC16', 0.3); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-27, wag * 0.5); ctx.lineTo(-33, wag - 6); ctx.moveTo(-27, wag * 0.5); ctx.lineTo(-33, wag + 6); ctx.stroke();
  // The dorsal: spines, the membrane torn between them
  ink(ctx, () => { ctx.moveTo(-8, -9); ctx.lineTo(-4, -17); ctx.lineTo(-2, -12); ctx.lineTo(1, -19); ctx.lineTo(3, -12); ctx.lineTo(6, -16); ctx.lineTo(9, -9); ctx.closePath(); }, '#4D7C0F', 0.9);
  ctx.strokeStyle = lite('#4D7C0F', 0.3); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(-4, -16); ctx.moveTo(0, -10); ctx.lineTo(1, -17); ctx.stroke();
  // The body: bloated, patchy, scaled; the sores, the pale belly glowing
  const body = () => { ctx.moveTo(22, -1); ctx.quadraticCurveTo(20, -11, 6, -12); ctx.quadraticCurveTo(-12, -12, -16, -2); ctx.quadraticCurveTo(-12, 12, 6, 12); ctx.quadraticCurveTo(20, 11, 22, -1); ctx.closePath(); };
  shaded(ctx, body, skin, -17, -12, 40, 24, 1.1);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = '#D9F99D'; ctx.beginPath(); ctx.ellipse(4, 8, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ECFCCB'; ctx.fillRect(-2, 4, 10, 1);
  ctx.strokeStyle = dark(skin, 0.3); ctx.lineWidth = 0.7;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) { const x = -10 + c * 5 + (r % 2) * 2.5, y = -8 + r * 4; ctx.beginPath(); ctx.arc(x, y, 2.4, 0.2, Math.PI - 0.2); ctx.stroke(); }
  ctx.restore();
  for (const [sx, sy, rx, ry] of [[-4, -4, 5, 3], [9, 5, 3.6, 2.4]]) {
    ink(ctx, () => ctx.ellipse(sx, sy, rx, ry, 0.3, 0, Math.PI * 2), '#EA580C', 0.8);
    ctx.fillStyle = '#FDBA74'; ctx.fillRect(sx - rx * 0.5, sy - ry * 0.5, 2, 1);
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(sx, sy, 1.2, 1.2);
  }
  // The gill, the pectoral fin
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(6, 0, 6, -0.9, 0.9); ctx.stroke();
  ink(ctx, () => { ctx.moveTo(4, 3); ctx.lineTo(-3, 8 + wag * 0.3); ctx.lineTo(-1, 3); ctx.closePath(); }, '#84CC16', 0.8);
  // Three eyes, none the same size
  for (const [ex, ey, r] of [[12, -5, 3], [17, -1, 2.4], [8, -8, 2]]) eye(ctx, ex, ey, r, 0.7, 0.1, '#FEF08A');
  // The mouth, jagged, open when it lunges
  ink(ctx, () => { ctx.moveTo(22, 1); ctx.lineTo(14, lunge ? 7 : 4); ctx.lineTo(22, lunge ? 9 : 5); ctx.closePath(); }, '#1A2E05', 0.8);
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = INK; ctx.lineWidth = 0.5;
  for (const tx of [16, 19]) { ctx.beginPath(); ctx.moveTo(tx, 2.5); ctx.lineTo(tx + 1.6, 2.5); ctx.lineTo(tx + 0.8, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (lunge) for (const tx of [17, 20]) { ctx.beginPath(); ctx.moveTo(tx, 8.4); ctx.lineTo(tx + 1.4, 8.4); ctx.lineTo(tx + 0.7, 6.4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
};
