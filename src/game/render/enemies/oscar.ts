// Oscar's stage: the Texas oil field. Its security (Texas rangers with their
// revolvers, bikers coming at you with a chain, a deputy behind a riot
// shield pitching horseshoes), its wildlife (armadillos that roll up and come
// at you, longhorns), and the chase: union pickups with a man in the bed
// throwing whatever's in it, ranger cruisers with their lights going, and the
// bikers on their choppers.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { INK, ink, shaded, shadedTop, lite, dark, eye, limb } from '../npc/kit';
import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFire } from '../fx/fire';
import { pixelBlob } from '../pixelArt';

type Ctx = CanvasRenderingContext2D;

export const drawOscarKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  // (the chase's vehicles tip with the ground under them)
  if ((e.kind === 'pickup' || e.kind === 'cruiser' || e.kind === 'chopper') && !e.isBlownAway) ctx.rotate(e.rotation || 0);
  const bloodied = e.variant === 7 && (e.kind === 'ranger' || e.kind === 'biker' || e.kind === 'deputy');
  switch (e.kind) {
    case 'ranger': drawRanger(ctx, e, f); break;
    case 'biker': drawBiker(ctx, e, f); break;
    case 'deputy': drawDeputy(ctx, e, f); break;
    case 'armadillo': drawArmadillo(ctx, e, f); break;
    case 'longhorn': drawLonghorn(ctx, e, f); break;
    case 'grackle': drawGrackle(ctx, e, f); break;
    case 'pickup': drawPickup(ctx, e, f); break;
    case 'cruiser': drawCruiser(ctx, e, f); break;
    case 'chopper': drawChopperRider(ctx, e, f); break;
  }
  if (bloodied) drawBloodied(ctx, e, f);
  void state;
};

const SKINS = ['#F2C9A0', '#E0AC69', '#C68642', '#8D5524', '#F5D0A9'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round(e.homeX || 0)) % SKINS.length];
const pick = <T,>(e: Enemy, xs: T[]) => xs[Math.abs(Math.round((e.homeX || 0) / 7)) % xs.length];
/** The muzzle glow before a shot. */
const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);

const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, boot: string) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-9 + s, hipY, 8, -hipY - 6); ctx.fillRect(2 - s, hipY, 8, -hipY - 6);
  ctx.fillStyle = boot; ctx.fillRect(-10 + s, -7, 11, 7); ctx.fillRect(1 - s, -7, 12, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-10 + s, -2, 3, 2); ctx.fillRect(1 - s, -2, 3, 2); // heels
};

const face = (ctx: Ctx, x: number, y: number, skin: string, r = 8) => {
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(x + 3, y - 2, 2, 2);
};

/** A big cowboy hat: the brim wide and curled up at the sides, the crown pinched. */
const stetson = (ctx: Ctx, x: number, y: number, color: string, band = '#78350F') => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x - 15, y - 1); ctx.quadraticCurveTo(x, y + 4, x + 15, y - 1); ctx.lineTo(x + 16, y - 5); ctx.quadraticCurveTo(x, y, x - 16, y - 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 8, y - 2); ctx.lineTo(x - 7, y - 13); ctx.quadraticCurveTo(x, y - 9, x + 7, y - 13); ctx.lineTo(x + 8, y - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = band; ctx.fillRect(x - 8, y - 5, 16, 2);
};

/** A five-pointed badge. */
const star = (ctx: Ctx, x: number, y: number, r: number, color = '#E5E7EB') => {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
};

// ---------------------------------------------------------------------------
// On foot
// ---------------------------------------------------------------------------

/** A Texas ranger: a white stetson, a handlebar mustache, a star on his vest, the revolver out and level. */
const drawRanger = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1E3A8A', '#7C2D12');
  ctx.fillStyle = '#A16207'; ctx.fillRect(-12, -32, 24, 4); // the belt
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-4, -32, 8, 4); // a buckle the size of a plate
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-12, -58, 24, 27); // shirt
  ctx.fillStyle = '#92400E'; ctx.fillRect(-12, -58, 7, 26); ctx.fillRect(5, -58, 7, 26); // vest
  star(ctx, 8, -49, 4.5);
  ctx.fillStyle = '#111827'; ctx.fillRect(-1, -58, 2, 10); // bolo tie
  face(ctx, 2, -65, skin);
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, -61); ctx.quadraticCurveTo(4, -64, 10, -60); ctx.stroke(); // mustache
  stetson(ctx, 1, -70, '#F5F5F4');
  // The arm out, the revolver level
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(8, -52, 12, 6);
  ctx.fillStyle = skin; ctx.fillRect(19, -52, 5, 6);
  ctx.fillStyle = '#374151'; ctx.fillRect(22, -54, 14, 4); ctx.fillStyle = '#78350F'; ctx.fillRect(21, -51, 4, 7);
  ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(26, -52, 3, 0, Math.PI * 2); ctx.fill(); // the cylinder
  const c = charge(e);
  if (c > 0.6) { ctx.fillStyle = `rgba(254, 240, 138, ${c})`; ctx.beginPath(); ctx.arc(39, -52, 2 + c * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** A biker: huge, a leather vest with the club's skull on it, bare tattooed arms, a beard to his belly, a chain swinging. */
const drawBiker = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, '#1F2937', '#111827');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.2 : 0);
  // The gut, the vest over a black tee
  ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.ellipse(2, -16, 18, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-18, -36, 9, 34); ctx.fillRect(9, -36, 9, 30);
  ctx.fillStyle = '#E7E5E4'; ctx.beginPath(); ctx.arc(-14, -24, 3, 0, Math.PI * 2); ctx.fill(); // (the skull patch)
  // Tattooed arms
  ctx.fillStyle = skin; ctx.fillRect(-22, -34, 6, 20); ctx.fillRect(16, -34, 6, 18);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-21, -30, 4, 3); ctx.fillRect(17, -28, 4, 4);
  face(ctx, 4, -44, skin, 9);
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(-2, -40); ctx.lineTo(10, -40); ctx.lineTo(6, -24); ctx.lineTo(1, -27); ctx.closePath(); ctx.fill(); // the beard
  ctx.fillStyle = '#111827'; ctx.fillRect(2, -47, 10, 3); // shades
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-6, -54, 18, 6); ctx.fillRect(-9, -51, 4, 8); // bandana
  // The chain, swinging round as he comes
  const a = running ? f * 0.35 : -2.2;
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3; ctx.setLineDash([3, 2]);
  ctx.beginPath(); ctx.moveTo(19, -18); ctx.lineTo(19 + Math.cos(a) * 26, -18 + Math.sin(a) * 26); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

/** A deputy behind a riot shield (SHERIFF across it); he drops it to pitch a horseshoe. */
const drawDeputy = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#57534E', '#1C1917');
  ctx.fillStyle = '#D6C7A1'; ctx.fillRect(-13, -58, 26, 30); // khaki uniform
  ctx.fillStyle = '#A8956A'; ctx.fillRect(-13, -44, 26, 2);
  star(ctx, -6, -50, 3.5, '#FACC15');
  face(ctx, 2, -65, skin);
  // Campaign hat
  ctx.fillStyle = '#A16207'; ctx.fillRect(-12, -71, 26, 3);
  ctx.beginPath(); ctx.moveTo(-6, -71); ctx.lineTo(1, -82); ctx.lineTo(8, -71); ctx.closePath(); ctx.fill();
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.55)'; ctx.fillRect(10, -76, 18, 76);
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 2; ctx.strokeRect(10, -76, 18, 76);
    ctx.save(); ctx.translate(19, -36); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#FACC15'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('SHERIFF', 0, 3);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(damage * 6); i++) { const y0 = -68 + i * 11; ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(18, y0 + 5); ctx.lineTo(14, y0 + 9); ctx.lineTo(27, y0 + 11); ctx.stroke(); }
  } else {
    // Shield down at his side, a horseshoe back over his shoulder
    ctx.fillStyle = 'rgba(203, 213, 225, 0.5)'; ctx.fillRect(-30, -40, 12, 40);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#D6C7A1'; ctx.fillRect(-4 - wind * 10, -56, 7, 12);
    ctx.strokeStyle = '#78716C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-3 - wind * 12, -60, 5, Math.PI * 0.15, Math.PI * 1.85, true); ctx.stroke();
  }
};

/** An armadillo: banded shell, a little pointed face, a tail. Rolls up into a ball to come at you. */
const drawArmadillo = (ctx: Ctx, e: Enemy, f: number) => {
  const shell = '#A8927A', band = '#6B5B4A', skin = '#C4AE92', skinD = '#8B7A66';
  const rolling = e.aiState === 'lunge';
  if (rolling) {
    // A ball, rolling: lit from the upper left whichever way it's turned, the bands going round under the light
    ctx.save(); ctx.translate(0, -11);
    const ball = () => ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.save(); ctx.beginPath(); ball(); ctx.clip();
    ctx.fillStyle = dark(shell, 0.25); ctx.fillRect(-11, -11, 22, 22);
    ctx.fillStyle = shell; ctx.beginPath(); ctx.arc(-1.5, -1.5, 9.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = lite(shell, 0.22); ctx.beginPath(); ctx.arc(-4, -4, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(f * 0.5 * (e.facing ?? 1));
    // (the bands, curled round from where the head and tail tuck in; the head's cap and the tail tip showing)
    for (let k = 1; k <= 4; k++) {
      const r = 3 + k * 4.4;
      ctx.strokeStyle = band; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-12, 0, r, -1.3, 1.3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-12, 0, r + 1.2, -1.1, 1.1); ctx.stroke();
    }
    ink(ctx, () => ctx.ellipse(-9, -1, 3, 4.5, 0, 0, Math.PI * 2), skinD, 0.8);
    limb(ctx, -10, 4, -6, 7, 1.6, skinD);
    ctx.restore();
    ctx.beginPath(); ball(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -7, 2, 1);
    ctx.restore();
    if (f % 6 < 3) pixelBlob(ctx, -12 - (f % 6), -2, 4, 2, 'rgba(214, 196, 160, 0.7)');
    return;
  }
  const walk = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.4) * 2 : 0;
  const hunch = e.aiState === 'bristle' ? 2 : 0;
  // A leg: stubby, shaded, a broad foot, the digging claws
  const leg = (lx: number, back: boolean) => {
    const c = back ? dark(skinD, 0.25) : skinD;
    shaded(ctx, () => ctx.roundRect(lx - 2.5, -7, 5, 6, 1.5), c, lx - 2.5, -7, 5, 6, 1);
    ink(ctx, () => ctx.ellipse(lx + 0.5, -1, 3.4, 1.4, 0, 0, Math.PI * 2), c, 0.8);
    ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(lx + 3, -1.6); ctx.lineTo(lx + 4.6, -0.3); ctx.moveTo(lx + 3.4, -0.9); ctx.lineTo(lx + 4.8, 0.2); ctx.stroke();
  };
  leg(-9 - walk, true); leg(11 + walk, true);
  // The tail: tapering, ringed
  shaded(ctx, () => { ctx.moveTo(-13, -11); ctx.quadraticCurveTo(-20, -8, -25, -3); ctx.lineTo(-24.5, -2); ctx.quadraticCurveTo(-19, -4, -13, -5.5); ctx.closePath(); }, shell, -25, -11, 12, 9);
  ctx.strokeStyle = band; ctx.lineWidth = 0.8;
  for (let k = 0; k < 4; k++) { const tx = -15.5 - k * 2.4, ty = -8.5 + k * 1.4; ctx.beginPath(); ctx.moveTo(tx, ty - 1.8 + k * 0.3); ctx.lineTo(tx - 0.5, ty + 1.6 - k * 0.3); ctx.stroke(); }
  // The shell: lit along the top, the belly in shadow; the shield over the shoulders, the bands across the middle,
  // the shield over the rump; the scutes picked out in the light, the skirt scalloped along the bottom
  const top = -19 - hunch * 2;
  const shellPath = () => { ctx.moveTo(-17, -5); ctx.lineTo(-17, -9); ctx.ellipse(0, -9 - hunch, 17, 10 + hunch, 0, Math.PI, 0); ctx.lineTo(17, -5); ctx.closePath(); };
  shadedTop(ctx, shellPath, shell, -17, top, 34, -5 - top);
  ctx.save(); ctx.beginPath(); shellPath(); ctx.clip();
  for (let x = -6; x <= 6; x += 3) {
    ctx.fillStyle = band; ctx.fillRect(x - 0.5, top, 1.2, 20);
    ctx.fillStyle = lite(shell, 0.3); ctx.fillRect(x + 0.7, top + 2 + hunch, 0.8, 4);
  }
  ctx.fillStyle = lite(shell, 0.35);
  for (const [sx, sy] of [[-14, -11], [-11, -15], [-12, -9], [-9, -12], [9, -14], [12, -11], [10, -9], [14, -8]]) ctx.fillRect(sx, sy - hunch, 1.2, 1.2);
  ctx.fillStyle = dark(shell, 0.3);
  for (const [sx, sy] of [[-13, -13], [-10, -9.5], [11, -12], [13, -9.5]]) ctx.fillRect(sx, sy - hunch, 1.2, 1.2);
  ctx.fillStyle = dark(shell, 0.35);
  for (let x = -16; x < 17; x += 3) ctx.fillRect(x, -6.6, 1, 1.6);
  ctx.restore();
  ctx.beginPath(); shellPath(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  leg(-12 + walk, false); leg(8 - walk, false);
  // The head: a long pointed snout, the bony cap on top, a big ear, the little eye
  ink(ctx, () => ctx.ellipse(14.5, -15, 2.2, 4.4, -0.3, 0, Math.PI * 2), skinD, 0.8);
  ctx.fillStyle = '#C08A7A'; ctx.fillRect(14.5, -17, 0.8, 3);
  shaded(ctx, () => { ctx.moveTo(13, -13.5); ctx.quadraticCurveTo(20, -12.5, 27, -6.5); ctx.lineTo(26.5, -4.8); ctx.quadraticCurveTo(20, -4, 13, -5); ctx.closePath(); }, skin, 13, -13.5, 14, 9);
  ink(ctx, () => { ctx.moveTo(13, -13.6); ctx.quadraticCurveTo(18, -13.4, 21.5, -10.4); ctx.lineTo(19, -10); ctx.quadraticCurveTo(16, -11.4, 13, -11.6); ctx.closePath(); }, shell, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(17, -10, 1.8, 1.8); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(17.3, -9.9, 0.7, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(25.6, -6.6, 1.4, 1.2);
  ctx.strokeStyle = dark(skin, 0.4); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(19, -5.2); ctx.lineTo(25, -5.4); ctx.stroke();
};

/** A Texas longhorn: a big rangy steer, patched red and white, horns out wider than it is long. */
const drawLonghorn = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const airborne = e.vel.y !== 0;
  const charging = st === 'charge';
  const cycle = charging && !airborne ? f * 0.45 : 0;
  const headDown = charging || st === 'paw' ? 8 : 0;
  const hide = '#9A3412', hideD = '#7C2D12', patch = '#F5F5F4', hoof = '#1C1917';
  // A leg: the upper (thick, shaded), the shin, the hoof (split, a glint on it)
  const leg = (lx: number, swing: number, lift: number, back: boolean) => {
    const c = back ? hideD : hide;
    const kx = lx + swing * 0.25, fx = lx + swing * 0.5;
    shaded(ctx, () => { ctx.moveTo(lx - 4, -30); ctx.lineTo(lx + 4, -30); ctx.lineTo(kx + 3, -14 - lift); ctx.lineTo(kx - 3, -14 - lift); ctx.closePath(); }, c, lx - 6, -30, 12, 18);
    shaded(ctx, () => { ctx.moveTo(kx - 3, -15 - lift); ctx.lineTo(kx + 3, -15 - lift); ctx.lineTo(fx + 2.6, -4 - lift); ctx.lineTo(fx - 2.6, -4 - lift); ctx.closePath(); }, c, kx - 4, -15 - lift, 8, 12);
    ink(ctx, () => ctx.roundRect(fx - 3.6, -5 - lift, 7.2, 5, [1, 1, 1.5, 1.5]), hoof, 1);
    ctx.fillStyle = '#57534E'; ctx.fillRect(fx - 2.6, -4.4 - lift, 2, 1); ctx.fillStyle = INK; ctx.fillRect(fx - 0.3, -4 - lift, 0.8, 3.6);
  };
  // The far legs (behind the body, darker)
  const legs = (back: boolean) => {
    for (let i = 0; i < 4; i++) {
      if ((i % 2 === 1) !== back) continue;
      const lx = i < 2 ? 22 + (i % 2) * 7 : -30 + (i % 2) * 7;
      if (airborne) { leg(lx, i < 2 ? 10 : -10, 8, back); continue; }
      const swing = Math.sin(cycle + i * 1.7) * 8;
      const pawing = st === 'paw' && i === 0 ? Math.max(0, Math.sin(f * 0.4)) * 7 : 0;
      leg(lx, swing, pawing, back);
    }
  };
  legs(true);
  // The tail, its tuft swinging
  const sw = Math.sin(f * 0.12) * 4;
  limb(ctx, -36, -44, -42 + sw * 0.3, -26, 3, hideD);
  ink(ctx, () => ctx.ellipse(-42 + sw * 0.3, -24, 3.4, 5, 0.2, 0, Math.PI * 2), '#292524', 0.8);
  // The body: a barrel of hide, lit along the back, the belly in shadow; the patches; the ribs and the hump over the
  // shoulders
  const body = () => { ctx.moveTo(-38, -42); ctx.quadraticCurveTo(-36, -54, -14, -52); ctx.quadraticCurveTo(10, -56, 24, -54); ctx.quadraticCurveTo(34, -50, 32, -36); ctx.quadraticCurveTo(30, -22, 14, -22); ctx.lineTo(-24, -22); ctx.quadraticCurveTo(-40, -24, -38, -42); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = hide; ctx.fillRect(-42, -58, 80, 40);
  ctx.fillStyle = lite(hide, 0.18); ctx.fillRect(-42, -58, 80, 8);
  ctx.fillStyle = dark(hide, 0.2); ctx.fillRect(-42, -30, 80, 10);
  ctx.fillStyle = patch; ctx.beginPath(); ctx.ellipse(-10, -44, 13, 8, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(14, -30, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.ellipse(-8, -40, 10, 4, 0.3, 0, Math.PI); ctx.fill();
  ctx.strokeStyle = dark(hide, 0.35); ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-2 + k * 6, -46); ctx.quadraticCurveTo(0 + k * 6, -38, -2 + k * 6, -30); ctx.stroke(); }
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  legs(false);
  // The head, lowered for the charge: a long face, the white blaze down it, the pink muzzle and its nostrils, an ear,
  // the eye (red when it's coming for you), and those horns, out wide, the tips sharp
  const hx = 36, hy = -42 + headDown;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(headDown ? 0.25 : 0);
  // (the horns, behind the face's top)
  for (const side of [-1, 1]) {
    const hornPath = () => { ctx.moveTo(-2, -6); ctx.quadraticCurveTo(side * 22, -10, side * 32, -24); ctx.lineTo(side * 30, -22); ctx.quadraticCurveTo(side * 20, -4, -2, -1); ctx.closePath(); };
    ink(ctx, hornPath, '#E7E5E4', 1);
    ctx.fillStyle = '#A8A29E'; ctx.beginPath(); ctx.moveTo(side * 26, -17); ctx.lineTo(side * 32, -24); ctx.lineTo(side * 30, -22); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(side > 0 ? 6 : -10, -8, 4, 1);
  }
  ink(ctx, () => ctx.ellipse(-4, -6, 5, 3, -0.5, 0, Math.PI * 2), hideD, 0.8); // the ear
  shaded(ctx, () => { ctx.moveTo(-8, -6); ctx.quadraticCurveTo(2, -10, 8, -4); ctx.lineTo(13, 10); ctx.quadraticCurveTo(6, 16, 0, 12); ctx.lineTo(-8, 4); ctx.closePath(); }, hide, -9, -10, 23, 26);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-1, -8); ctx.quadraticCurveTo(4, -4, 6, 4); ctx.lineTo(3, 6); ctx.quadraticCurveTo(0, 0, -3, -6); ctx.closePath(); ctx.fillStyle = patch; ctx.fill(); ctx.restore();
  ink(ctx, () => ctx.ellipse(8, 10, 6.4, 5, 0.3, 0, Math.PI * 2), '#FDA4AF', 1);
  ctx.fillStyle = '#9F1239'; ctx.fillRect(7, 9, 1.6, 2); ctx.fillRect(10.6, 10, 1.6, 2);
  ctx.fillStyle = lite('#FDA4AF', 0.4); ctx.fillRect(5, 7, 3, 1);
  const mad = charging || st === 'paw';
  eye(ctx, 3, -1, 2.4, 0.6, 0, mad ? '#FECACA' : '#FFFFFF');
  if (mad) { ctx.fillStyle = INK; ctx.fillRect(0, -4.6, 6, 1.2); }
  ctx.restore();
  // Snorting, pawing: a puff out of its nose, dust off the hoof
  if (st === 'paw' && f % 20 < 8) { pixelBlob(ctx, hx + 18 + (f % 20), hy + 12, 4 + (f % 20) * 0.4, 3 + (f % 20) * 0.2, 'rgba(214, 196, 160, 0.75)'); }
  if (mad && f % 30 < 6) { ctx.fillStyle = 'rgba(241, 245, 249, 0.8)'; ctx.fillRect(hx + 16 + (f % 30) * 2, hy + 10, 4, 2); ctx.fillRect(hx + 18 + (f % 30) * 2, hy + 13, 3, 2); }
};

// ---------------------------------------------------------------------------
// The chase
// ---------------------------------------------------------------------------

/** Wheels on a vehicle (turning with how far it's gone). */
const wheel = (ctx: Ctx, x: number, y: number, r: number, turn: number, hub = '#9CA3AF') => {
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) { const a = turn + k * 2.1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5); ctx.stroke(); }
};

/** Smoke and fire off a vehicle that's taken a big hit (it's on its last legs). */
export const drawCriticalSmoke = (ctx: Ctx, x: number, y: number, f: number) => {
  // Black smoke trailing back off the engine
  for (let k = 0; k < 5; k++) {
    const t = ((f * 2 + k * 17) % 60) / 60;
    pixelBlob(ctx, x - t * 40, y - t * 50, 6 + t * 16, 5 + t * 13, `rgba(41, 37, 36, ${(0.6 * (1 - t)).toFixed(3)})`);
  }
  // Flames licking up out of it
  drawFire(ctx, x, y + 4, 16, 22, f, { seed: 7, glow: 0.6 });
};

/**
 * A union pickup: an old full-size truck, a union decal on the door, the driver in the cab with his hard hat on, and one
 * of the boys stood up in the bed with an arm back to throw whatever's in there.
 */
export const drawPickupBody = (ctx: Ctx, paint: string, turn: number, wind: number, f: number, opts: { critical?: boolean; slumped?: boolean; noThrower?: boolean } = {}) => {
  wheel(ctx, -48, -13, 13, turn); wheel(ctx, 50, -13, 13, turn);
  // The bed and the cab
  ctx.fillStyle = paint;
  ctx.fillRect(-74, -40, 76, 26); // bed
  ctx.beginPath(); ctx.moveTo(2, -14); ctx.lineTo(2, -64); ctx.lineTo(40, -64); ctx.lineTo(54, -42); ctx.lineTo(76, -40); ctx.lineTo(76, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-74, -40, 76, 4); ctx.fillRect(-74, -18, 150, 4);
  // Window, the driver
  ctx.fillStyle = '#93C5FD'; ctx.beginPath(); ctx.moveTo(8, -60); ctx.lineTo(38, -60); ctx.lineTo(50, -44); ctx.lineTo(8, -44); ctx.closePath(); ctx.fill();
  if (opts.slumped) {
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(34, -47, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(34, -50, 6, Math.PI, 0); ctx.fill();
  } else {
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(26, -52, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(26, -55, 7, Math.PI, 0); ctx.fill(); ctx.fillRect(18, -56, 16, 2);
  }
  // The decal, chrome, lights
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.arc(24, -30, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 5px monospace'; ctx.textAlign = 'center'; ctx.fillText('LOCAL', 24, -31); ctx.fillText('69', 24, -26); ctx.textAlign = 'left';
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(72, -26, 6, 10); ctx.fillStyle = '#FEF08A'; ctx.fillRect(72, -38, 5, 5);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-76, -36, 4, 6);
  // The man in the bed: hard hat, hi-vis vest, winding up to throw
  if (!opts.noThrower) {
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-46, -58, 14, 20);
    ctx.fillStyle = '#F97316'; ctx.fillRect(-47, -70, 16, 16); ctx.fillStyle = '#FDE047'; ctx.fillRect(-47, -63, 16, 2);
    ctx.fillStyle = '#E0AC69'; ctx.beginPath(); ctx.arc(-38, -76, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(-38, -79, 7, Math.PI, 0); ctx.fill(); ctx.fillRect(-46, -80, 16, 2);
    const a = -0.6 - wind * 2.2;
    ctx.save(); ctx.translate(-34, -66); ctx.rotate(a);
    ctx.fillStyle = '#F97316'; ctx.fillRect(0, -3, 14, 6);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(13, -5, 9, 8); // whatever he's about to throw
    ctx.restore();
  }
  if (opts.critical) {
    // Stove in, a headlight hanging off, smoking and burning
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(40, -40); ctx.lineTo(60, -30); ctx.lineTo(48, -20); ctx.closePath(); ctx.fill();
    drawCriticalSmoke(ctx, 60, -44, f);
  }
};

const drawPickup = (ctx: Ctx, e: Enemy, f: number) => {
  const paint = pick(e, ['#B91C1C', '#1D4ED8', '#F5F5F4', '#166534']);
  const wind = e.aiState === 'windup' ? Math.min(1, (e.aiTimer || 0) / 24) : 0;
  const bounce = Math.abs(Math.sin(f * 0.2 + (e.homeX || 0))) * 1.5;
  ctx.translate(0, -bounce);
  drawPickupBody(ctx, paint, e.pos.x / 13, wind, f, { critical: e.health <= e.maxHealth / 2 });
};

/** A ranger's cruiser: black and white, TEXAS on the door, the lights going, a ranger leaning out of the window with a revolver. */
export const drawCruiserBody = (ctx: Ctx, turn: number, f: number, aim: number, opts: { critical?: boolean; slumped?: boolean; shooting?: number } = {}) => {
  wheel(ctx, -46, -12, 12, turn, '#E5E7EB'); wheel(ctx, 48, -12, 12, turn, '#E5E7EB');
  ctx.fillStyle = '#111827';
  ctx.beginPath(); ctx.moveTo(-75, -14); ctx.lineTo(-73, -32); ctx.lineTo(-40, -34); ctx.lineTo(-28, -50); ctx.lineTo(24, -50); ctx.lineTo(40, -34); ctx.lineTo(75, -30); ctx.lineTo(76, -14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-40, -34, 80, 20); // the white doors
  ctx.fillStyle = '#111827'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillText('TEXAS', 0, -20); ctx.textAlign = 'left';
  star(ctx, -24, -24, 5, '#CA8A04');
  ctx.fillStyle = '#93C5FD'; ctx.beginPath(); ctx.moveTo(-24, -47); ctx.lineTo(20, -47); ctx.lineTo(32, -35); ctx.lineTo(-34, -35); ctx.closePath(); ctx.fill();
  // The light bar, going
  const on = Math.floor(f / 6) % 2 === 0;
  ctx.fillStyle = on ? '#EF4444' : '#7F1D1D'; ctx.fillRect(-14, -55, 12, 5);
  ctx.fillStyle = on ? '#1E3A8A' : '#3B82F6'; ctx.fillRect(-2, -55, 12, 5);
  if (on) { ctx.fillStyle = 'rgba(239, 68, 68, 0.25)'; ctx.beginPath(); ctx.arc(-8, -53, 16, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.fillStyle = 'rgba(59, 130, 246, 0.25)'; ctx.beginPath(); ctx.arc(4, -53, 16, 0, Math.PI * 2); ctx.fill(); }
  if (opts.slumped) {
    ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(14, -38, 6, 0, Math.PI * 2); ctx.fill();
    stetson(ctx, 15, -41, '#F5F5F4');
  } else {
    // The ranger, leaning out the window, revolver on whichever side he's at
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(4, -58, 12, 16);
    ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(10, -63, 6, 0, Math.PI * 2); ctx.fill();
    stetson(ctx, 10, -67, '#F5F5F4');
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(aim > 0 ? 14 : -6, -54, 12, 5);
    ctx.fillStyle = '#374151'; ctx.fillRect(aim > 0 ? 25 : -17, -56, 12, 4);
    if ((opts.shooting ?? 0) > 0.6) { ctx.fillStyle = `rgba(254, 240, 138, ${opts.shooting})`; ctx.beginPath(); ctx.arc(aim > 0 ? 40 : -20, -54, 3 + (opts.shooting ?? 0) * 3, 0, Math.PI * 2); ctx.fill(); }
  }
  if (opts.critical) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo(36, -34); ctx.lineTo(62, -24); ctx.lineTo(44, -16); ctx.closePath(); ctx.fill();
    drawCriticalSmoke(ctx, 58, -34, f);
  }
};

const drawCruiser = (ctx: Ctx, e: Enemy, f: number) => {
  // (it sits behind him or out in front: the ranger leans out the side he's on)
  drawCruiserBody(ctx, e.pos.x / 12, f, (e.aiX ?? 0) < 0 ? 1 : -1, { critical: e.health <= e.maxHealth / 2, shooting: Math.max(0, (e.shootTimer - 90) / 20) });
};

/** A chopper: long raked forks, ape-hanger bars, a teardrop tank with flames on it. `tilt` leans it back (a wheelie) or forward. */
export const drawChopperBike = (ctx: Ctx, x: number, y: number, tilt: number, turn: number, tank = '#111827') => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const back = { x: -26, y: -13 }, front = { x: 34, y: -13 };
  wheel(ctx, back.x, back.y, 13, turn, '#D1D5DB'); wheel(ctx, front.x, front.y, 12, turn, '#D1D5DB');
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(front.x, front.y); ctx.lineTo(16, -46); ctx.stroke(); // the forks, raked way out
  ctx.beginPath(); ctx.moveTo(16, -46); ctx.lineTo(12, -58); ctx.lineTo(4, -58); ctx.stroke(); // ape hangers
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(back.x, back.y); ctx.lineTo(-4, -18); ctx.lineTo(16, -40); ctx.stroke(); // frame
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-8, -26, 18, 12); // engine
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-6, -30, 5, 6); ctx.fillRect(2, -30, 5, 6);
  ctx.strokeStyle = '#D1D5DB'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-36, -18); ctx.stroke(); // pipes
  ctx.fillStyle = tank; ctx.beginPath(); ctx.ellipse(6, -38, 12, 6, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(10, -41); ctx.lineTo(6, -37); ctx.lineTo(14, -38); ctx.lineTo(4, -34); ctx.closePath(); ctx.fill(); // flames on it
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-22, -32, 20, 5); // seat
  ctx.fillStyle = '#374151'; ctx.fillRect(-30, -24, 10, 3); // fender
  ctx.restore();
};

/** A biker on his chopper: sat back, boots up on the pegs, one hand on the bars, the other swinging a chain. */
const drawChopperRider = (ctx: Ctx, e: Enemy, f: number) => {
  const swing = e.aiState === 'swing' ? (e.aiTimer || 0) / 18 : 0;
  const tilt = e.aiState === 'swing' ? -0.08 : 0;
  drawChopperBike(ctx, 0, 0, tilt, e.pos.x / 11, pick(e, ['#111827', '#7F1D1D', '#1E3A8A']));
  const skin = skinOf(e);
  ctx.save(); ctx.rotate(tilt);
  // Legs out to the pegs, the gut, the vest, the beard, the bandana
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-14, -36, 22, 8); ctx.fillRect(4, -34, 6, 18);
  ctx.fillStyle = '#111827'; ctx.fillRect(2, -18, 12, 6);
  ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.ellipse(-6, -50, 13, 15, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-18, -64, 7, 26);
  ctx.fillStyle = skin; ctx.fillRect(0, -58, 14, 5); // arm to the bars
  face(ctx, -3, -70, skin, 8);
  ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.moveTo(-8, -66); ctx.lineTo(4, -66); ctx.lineTo(0, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-4, -73, 10, 3);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-12, -80, 18, 6);
  // The chain
  const a = e.aiState === 'swing' ? -2.6 + swing * 3.2 : -2.2 + Math.sin(f * 0.2) * 0.3;
  ctx.fillStyle = skin; ctx.fillRect(-16, -60, 6, 12);
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3; ctx.setLineDash([3, 2]);
  ctx.beginPath(); ctx.moveTo(-13, -50); ctx.lineTo(-13 + Math.cos(a) * 34, -50 + Math.sin(a) * 34); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};

/** Dirty Dan's light machine gun, lying about (across his bars, flung onto a pile): long, black, a belt of brass hanging off it. */
export const drawLmgProp = (ctx: Ctx, x: number, y: number, rot: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#27272A'; ctx.fillRect(-22, -4, 26, 8);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(4, -3, 22, 5);
  ctx.fillStyle = '#18181B'; for (const vx of [7, 12, 17, 22]) ctx.fillRect(vx, -2, 2, 3);
  ctx.fillRect(-30, -3, 9, 7); ctx.fillRect(-10, 4, 4, 7);
  ctx.fillStyle = '#3F3F2E'; ctx.fillRect(-6, 4, 11, 9);
  ctx.fillStyle = '#CA8A04'; for (let k = 0; k < 5; k++) ctx.fillRect(4 + k * 2, 3 + k * 2, 2, 3);
  ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(20, 2); ctx.lineTo(16, 12); ctx.moveTo(20, 2); ctx.lineTo(25, 12); ctx.stroke(); // bipod
  ctx.fillStyle = '#6B7280'; ctx.fillRect(-22, -4, 26, 1);
  ctx.restore();
};

/** A great-tailed grackle: glossy blue-black, a long keeled tail, a mean yellow eye; swooping in low, beak first. */
const drawGrackle = (ctx: Ctx, e: Enemy, f: number) => {
  const swooping = e.aiState === 'swoop' || e.aiState === 'skim';
  ctx.translate(0, -e.height / 2);
  const flap = Math.sin(f * (swooping ? 0.5 : 0.35)) * 10;
  const black = '#16142B', gloss = '#3730A3', sheen = '#818CF8';
  // A wing from the shoulder (sx): the glossed coverts along the front, the primaries fingered at the back
  const wing = (sx: number, lift: number, c: string) => {
    const B = [sx - 10, -13 + lift], C = [sx - 20, -10 + lift], D = [sx - 6, 3];
    const path = () => {
      ctx.moveTo(sx, -3); ctx.quadraticCurveTo(sx - 3, B[1] - 1, B[0], B[1]); ctx.lineTo(C[0], C[1]);
      // (the primaries, each one rounded off)
      const dx = D[0] - C[0], dy = D[1] - C[1], n = Math.hypot(dx, dy) || 1, ox = -dy / n * 2.2, oy = dx / n * 2.2;
      for (let k = 1; k <= 4; k++) {
        const t0 = (k - 1) / 4, t1 = k / 4, tm = (t0 + t1) / 2;
        ctx.quadraticCurveTo(C[0] + dx * tm + ox, C[1] + dy * tm + oy, C[0] + dx * t1, C[1] + dy * t1);
      }
      ctx.closePath();
    };
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    ctx.fillStyle = dark(c, 0.3); ctx.fillRect(sx - 24, -26, 30, 32);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(sx + 1, -4); ctx.lineTo(B[0], B[1] - 1); ctx.lineTo((B[0] + C[0]) / 2, (B[1] + C[1]) / 2 + 3); ctx.lineTo(sx - 4, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = sheen; ctx.fillRect((sx + B[0]) / 2 - 1, (B[1] - 3) / 2, 2, 1); ctx.fillRect(B[0] + 1, B[1] + 1, 1.5, 1);
    ctx.strokeStyle = INK; ctx.lineWidth = 0.6;
    for (let k = 1; k <= 3; k++) { const t = k / 4; ctx.beginPath(); ctx.moveTo(C[0] + (D[0] - C[0]) * t, C[1] + (D[1] - C[1]) * t); ctx.lineTo(B[0] + (sx - B[0]) * t * 0.6 - 1, B[1] + 4 + (-3 - B[1]) * t * 0.5); ctx.stroke(); }
    ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.lineJoin = 'round'; ctx.stroke();
  };
  wing(2, -flap, '#1E1B4B');
  // The long keeled tail: the two vanes folded up into a V, the crease down it, the tips notched
  ink(ctx, () => { ctx.moveTo(-8, -1); ctx.lineTo(-27, -6); ctx.lineTo(-25.5, -2); ctx.lineTo(-28, 3.5); ctx.lineTo(-25.5, 3); ctx.lineTo(-8, 3); ctx.closePath(); }, black, 0.9);
  ctx.fillStyle = gloss; ctx.beginPath(); ctx.moveTo(-9, -0.6); ctx.lineTo(-25, -4.8); ctx.lineTo(-24, -2.6); ctx.lineTo(-9, 0.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = lite(black, 0.25); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-9, 1); ctx.lineTo(-25, 0.5); ctx.stroke();
  // The feet, tucked up
  ctx.strokeStyle = '#27272A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, 5); ctx.lineTo(0, 7.5); ctx.lineTo(2.5, 8); ctx.moveTo(-2, 5); ctx.lineTo(-3, 7.5); ctx.lineTo(-0.5, 8); ctx.stroke();
  // The body: blue-black, the gloss along the back, the shine picked out, the belly near black
  const body = () => ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = black; ctx.fillRect(-11, -6, 22, 12);
  ctx.fillStyle = gloss; ctx.fillRect(-11, -6, 22, 4);
  ctx.fillStyle = '#4F46E5'; ctx.fillRect(-4, -6, 10, 2);
  ctx.fillStyle = '#0A0914'; ctx.fillRect(-11, 3, 22, 3);
  ctx.fillStyle = sheen; ctx.fillRect(0, -5, 3, 1); ctx.fillRect(5, -4, 1, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The head (a purple sheen to it), the beak (open on the swoop), that eye, a scowl over it
  const gape = swooping ? 1.6 : 0;
  ink(ctx, () => { ctx.moveTo(14, -1); ctx.lineTo(21, -0.8 + gape); ctx.lineTo(14, 0.8); ctx.closePath(); }, '#3F3F46', 0.8);
  const head = () => ctx.arc(11, -3, 4.5, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  ctx.fillStyle = black; ctx.fillRect(6, -8, 10, 10);
  ctx.fillStyle = '#4C1D95'; ctx.fillRect(6, -8, 10, 3.5);
  ctx.fillStyle = '#A78BFA'; ctx.fillRect(9, -7, 2, 1);
  ctx.restore();
  ctx.beginPath(); head(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => { ctx.moveTo(14, -4.6); ctx.lineTo(22, -1.8); ctx.lineTo(14, -1); ctx.closePath(); }, '#27272A', 0.8);
  ctx.fillStyle = '#71717A'; ctx.fillRect(15, -4, 3, 0.8);
  ink(ctx, () => ctx.arc(12.8, -4, 1.5, 0, Math.PI * 2), '#FDE047', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(13, -4.4, 0.9, 0.9);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(10.8, -6.6); ctx.lineTo(14.6, -5.2); ctx.stroke();
  wing(4, flap, '#312E81');
};

/** What's left of the mob that came after him: bloodied, singed, a bandage round the head, eyes red, steaming mad. */
const drawBloodied = (ctx: Ctx, e: Enemy, f: number) => {
  const top = -e.height;
  const hx = e.kind === 'biker' ? 4 : 2, hy = e.kind === 'biker' ? -74 : -65;
  // Blood down the front, splashes on the arms, soot
  ctx.fillStyle = 'rgba(127, 29, 29, 0.85)';
  ctx.fillRect(-6, top + 22, 8, 20); ctx.fillRect(-4, top + 42, 4, 10);
  ctx.beginPath(); ctx.arc(8, top + 30, 5, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-10, top + 36, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(28, 25, 23, 0.45)'; ctx.fillRect(-12, top + 16, 10, 14); ctx.fillRect(4, top + 40, 10, 10);
  // A bloody bandage round the head, blood down the face, red eyes
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(hx - 9, hy - 6, 18, 4);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx + 2, hy - 6, 5, 4); ctx.fillRect(hx - 5, hy - 2, 2, 8);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(hx + 3, hy - 2, 3, 2);
  // Steaming mad
  const q = (f % 36) / 36;
  ctx.fillStyle = `rgba(214, 211, 209, ${0.7 * (1 - q)})`; ctx.beginPath(); ctx.arc(hx - 6 - q * 6, hy - 14 - q * 16, 3 + q * 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + 8 + q * 6, hy - 14 - q * 16, 3 + q * 5, 0, Math.PI * 2); ctx.fill();
};
