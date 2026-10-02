// Victor's stage: his goons in heat gear (a silver proximity suit with a flare
// gun, a smokejumper in turnout gear with an axe, a guy in a bomb suit behind a
// riveted blast shield), and the volcano's wildlife (a fire salamander, a
// vulture, a fish that lives in the lava). Drawn like the rest: facing right
// from a point at the feet (centre bottom), flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFireball } from '../fx/fireball';
import { INK, ink, shaded, shadedTop, lite, dark, limb } from '../npc/kit';
import { drawPerson, type PersonSpec, type Pose } from '../npc/person';

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
  const skin = '#232328', blot = '#F59E0B', blotD = '#B45309';
  // A leg: splayed, the elbow out, the forearm down to a hand of four toes, orange-tipped
  const leg = (i: number) => {
    const back = i % 2 === 1, c = back ? '#141417' : skin;
    const lx = (i < 2 ? 12 : -7) + (back ? 3 : -2);
    const ph = cycle + i * 1.7, sw = Math.sin(ph) * 4, lift = cycle ? Math.max(0, Math.cos(ph)) * 2 : 0;
    const ex = lx + sw * 0.4 + (i < 2 ? 3 : -3), ey = -6.5 - lift, fx = lx + sw, fy = -1.4 - lift * 0.5;
    limb(ctx, lx, -9, ex, ey, 3.4, c);
    limb(ctx, ex, ey, fx, fy, 2.6, c);
    ctx.fillStyle = lite(c, 0.3); ctx.fillRect(ex - 1, ey - 1.4, 1.4, 0.8);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let k = -1.5; k <= 1.5; k++) { ctx.moveTo(fx, fy); ctx.lineTo(fx + 2.4 + k * 0.4, fy + 1 + k * 0.6); } ctx.stroke();
    ctx.strokeStyle = back ? blotD : blot; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let k = -1.5; k <= 1.5; k++) { ctx.moveTo(fx + 0.6, fy + 0.3); ctx.lineTo(fx + 2.2 + k * 0.4, fy + 0.9 + k * 0.6); } ctx.stroke();
  };
  leg(1); leg(3);
  // The tail: tapering, swishing, the blotches running down it
  const t1 = Math.sin(f * 0.3) * 5, t2 = Math.sin(f * 0.3 + 1) * 4;
  const tail = () => { ctx.moveTo(-9, -13); ctx.quadraticCurveTo(-24, -11 + t1, -35, -4 + t2); ctx.quadraticCurveTo(-23, -4.5 + t1 * 0.5, -9, -4.5); ctx.closePath(); };
  shadedTop(ctx, tail, skin, -36, -15, 28, 12);
  for (const [t, r] of [[0.3, 2.2], [0.62, 1.5]] as const) {
    const u = 1 - t, x = u * u * -9 + 2 * u * t * -24 + t * t * -35, y = u * u * -9 + 2 * u * t * (-8 + t1 * 0.75) + t * t * (-4 + t2);
    ink(ctx, () => ctx.ellipse(x, y - 0.6, r * 1.3, r, 0, 0, Math.PI * 2), blot, 0.6);
  }
  // The body: lit along the back, a gloss on it; the blotches, the belly glowing like coals underneath
  const body = () => ctx.ellipse(2, -9, 16, 6, 0, 0, Math.PI * 2);
  shadedTop(ctx, body, skin, -14, -15, 32, 12, 1.1);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  const glow = 0.55 + 0.3 * Math.sin(f * 0.15);
  ctx.fillStyle = `rgba(234, 88, 12, ${glow})`; ctx.fillRect(-14, -5.5, 32, 3);
  ctx.fillStyle = `rgba(253, 186, 116, ${glow})`; ctx.fillRect(-10, -4.5, 24, 1);
  for (const [x, y, r] of [[-8, -11, 3], [0, -12.4, 2.4], [8, -10.6, 3], [-3, -8, 2], [13, -12, 1.8]]) {
    ink(ctx, () => ctx.ellipse(x, y, r * 1.2, r, 0, 0, Math.PI * 2), blot, 0.6);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(x - r * 0.6, y - r * 0.6, Math.max(1, r * 0.5), 0.8);
    ctx.fillStyle = blotD; ctx.fillRect(x - r * 0.4, y + r * 0.35, r, 0.8);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(-4, -14.2, 4, 0.9); ctx.fillRect(4, -14.4, 2, 0.9);
  ctx.restore();
  leg(0); leg(2);
  // The head: broad and flat; a blotch behind the eye (the glands), the bulging gold eye with its slit, the nostril,
  // the long grin of a mouth
  const head = () => ctx.ellipse(20, -9.5, 7.6, 5, 0, 0, Math.PI * 2);
  shadedTop(ctx, head, skin, 12, -14.5, 16, 10, 1.1);
  ink(ctx, () => ctx.ellipse(15.6, -12, 2.6, 1.6, 0.2, 0, Math.PI * 2), blot, 0.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(15, -7.6); ctx.quadraticCurveTo(21, -6.4, 27.2, -8.4); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(25.6, -11.2, 1.2, 0.9);
  ink(ctx, () => ctx.arc(21.6, -12.4, 2.3, 0, Math.PI * 2), '#FACC15', 0.7);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(20.2, -11.6, 2.8, 1);
  ctx.fillStyle = INK; ctx.fillRect(21.6, -14, 1, 3.2);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(20.6, -13.6, 0.8, 0.8);
  if (Math.floor(f / 10) % 3 === 0 || lunging) {
    for (const [c, w] of [[INK, 2.4], ['#EF4444', 1.2]] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(26, -8); ctx.lineTo(33, -8); ctx.lineTo(35, -10); ctx.moveTo(33, -8); ctx.lineTo(35, -6); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
};

/** A vulture: sooty black wings, a bald red head, a ruff of white round its neck. */
const drawVulture = (ctx: Ctx, e: Enemy, f: number) => {
  const diving = e.aiState === 'dive';
  const flap = diving ? 0 : Math.sin(f * 0.22);
  const black = '#1C1917';
  // A wing from the shoulder: the coverts lit along the leading edge, the silver flight feathers along the trailing
  // edge (lined), the primaries fingered out at the tip; folded back along the body on the dive
  const wing = (sx: number, lift: number, span: number, c: string) => {
    const up = 6 + lift * 12; // (held up in a V, the way they soar)
    const tx = sx - span * 0.6, ty = -20 - up;
    const path = () => {
      ctx.moveTo(sx + 2, -18);
      if (diving) { ctx.lineTo(sx - span * 0.85, -21); ctx.lineTo(sx - span * 0.9, -15); ctx.lineTo(sx - 6, -10); ctx.closePath(); return; }
      ctx.quadraticCurveTo(sx - 6, -19 - up * 0.55, tx, ty);
      // (the primaries, splayed like fingers)
      for (let k = 0; k < 5; k++) { ctx.lineTo(tx - 5 - k * 2.2, ty + 1.5 + k * 3); ctx.lineTo(tx - 1.6 - k * 2.2, ty + 3.6 + k * 3); }
      ctx.lineTo(sx - span * 0.48, -9 - up * 0.4);
      ctx.quadraticCurveTo(sx - 8, -6, sx, -10);
      ctx.closePath();
    };
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    ctx.fillStyle = c; ctx.fillRect(sx - span - 14, -60, span + 20, 56);
    if (!diving) {
      // (the flight feathers: silvery along the back of the wing and out through the fingers, lined)
      ctx.fillStyle = '#57534E';
      ctx.beginPath(); ctx.moveTo(sx - 2, -11); ctx.lineTo(sx - span * 0.48, -9 - up * 0.4); ctx.lineTo(tx - 12, ty + 16); ctx.lineTo(tx - 6, ty + 2); ctx.lineTo(sx - span * 0.42, -15 - up * 0.62); ctx.lineTo(sx - 4, -13.5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 0.7;
      for (let k = 1; k < 6; k++) { const t = k / 6, x = sx - 2 + (sx - span * 0.5 - sx + 2) * t, y = -10 + (-9 - up * 0.4 + 10) * t; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1.2, y - 3.4); ctx.stroke(); }
      ctx.strokeStyle = INK; ctx.lineWidth = 0.6;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(tx - 1.6 - k * 2.2, ty + 3.6 + k * 3); ctx.lineTo(tx + 3 - k * 1.6, ty + 5 + k * 2.2); ctx.stroke(); }
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = lite(c, 0.2); ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(sx + 1, -18); if (diving) ctx.lineTo(sx - span * 0.85, -20.5); else ctx.quadraticCurveTo(sx - 6, -19 - up * 0.55, tx, ty + 1); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = lite(c, 0.38); ctx.fillRect(sx - 6, -20 - up * 0.4, 3, 0.9);
    ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  };
  wing(-4, flap * 0.8 + 0.25, 30, '#0F0D0C');
  // The tail: a dark wedge, the feathers lined
  ink(ctx, () => { ctx.moveTo(-16, -17); ctx.lineTo(-31, -19); ctx.lineTo(-32, -14); ctx.lineTo(-30, -10); ctx.lineTo(-16, -11); ctx.closePath(); }, black, 0.9);
  ctx.strokeStyle = '#44403C'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-18, -14.5); ctx.lineTo(-30, -15.6); ctx.moveTo(-18, -12.4); ctx.lineTo(-29, -12); ctx.stroke();
  // Talons: tucked, or out in front on the dive (grey legs, black hooks)
  const foot = (x: number, len: number) => {
    limb(ctx, x, -9, x + len * 0.35, -9 + len, 2, '#A8A29E');
    ctx.fillStyle = INK; ctx.fillRect(x + len * 0.35 - 1.6, -8.4 + len, 1.2, 1.6); ctx.fillRect(x + len * 0.35 + 0.6, -8.4 + len, 1.2, 1.6);
  };
  if (diving) { foot(2, 7); foot(7, 7); } else { foot(-4, 2); foot(0, 2); }
  // The body: sooty, lit along the back, the feathers scalloped
  const body = () => ctx.ellipse(-2, -14, 18, 8, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = '#292524'; ctx.fillRect(-20, -22, 36, 16);
  ctx.fillStyle = '#3F3A36'; ctx.fillRect(-20, -22, 36, 4);
  ctx.fillStyle = '#100E0D'; ctx.fillRect(-20, -10, 36, 4);
  ctx.fillStyle = '#100E0D'; for (let x = -14; x < 10; x += 4) { ctx.fillRect(x, -14 + (x % 8 ? 1 : 0), 2, 1); ctx.fillRect(x + 2, -17 + (x % 8 ? 0 : 1), 2, 1); }
  ctx.fillStyle = '#57534E'; ctx.fillRect(-6, -21, 6, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The ruff: a white ragged collar
  const ruff = () => { for (let k = 0; k <= 14; k++) { const a = (k / 14) * Math.PI * 2, r = k % 2 ? 4.4 : 5.6; ctx.lineTo(13 + Math.cos(a) * r, -18 + Math.sin(a) * r); } ctx.closePath(); };
  shaded(ctx, ruff, '#F5F5F4', 7, -24, 12, 12, 0.9);
  // The bald red head (wrinkled), the hooked ivory beak, the dark eye
  ink(ctx, () => { ctx.moveTo(22.5, -23.5); ctx.lineTo(27, -22.6); ctx.quadraticCurveTo(30.5, -21.5, 29.6, -17.8); ctx.lineTo(28.4, -16.4); ctx.lineTo(28.2, -18.4); ctx.quadraticCurveTo(25, -18, 22.5, -18.6); ctx.closePath(); }, '#FDE68A', 0.8);
  ctx.fillStyle = '#A16207'; ctx.fillRect(28.4, -18.4, 1.2, 1.6);
  ctx.fillStyle = INK; ctx.fillRect(24.5, -21.6, 1.8, 0.8);
  shaded(ctx, () => ctx.arc(19, -21, 5, 0, Math.PI * 2), '#DC2626', 14, -26, 10, 10, 1);
  ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(15.5, -19); ctx.lineTo(18, -18.4); ctx.moveTo(16, -23.6); ctx.lineTo(18, -24.4); ctx.moveTo(19, -17.4); ctx.lineTo(21.5, -17.8); ctx.stroke();
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(16.5, -25, 3, 0.9);
  ink(ctx, () => ctx.arc(20, -22.4, 1.4, 0, Math.PI * 2), '#451A03', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(20.2, -22.8, 0.9, 0.9); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(19.4, -23.2, 0.6, 0.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(18, -24.6); ctx.lineTo(22, -23.6); ctx.stroke();
  wing(-1, flap, 36, '#1C1917');
};

/** A fish that lives in the lava: a crust of black rock cracked with glowing orange, all teeth, dripping. Under the lava, just a glint. */
const drawMagmafish = (ctx: Ctx, e: Enemy, f: number) => {
  const pulse = 0.7 + 0.3 * Math.sin(f * 0.3);
  if (!e.aiState || e.aiState === 'idle') {
    // Just the ripple (in bands) and the fin's tip where it's cruising under the surface
    const w = 12 + Math.sin(f * 0.2) * 3;
    ctx.fillStyle = 'rgba(234, 88, 12, 0.85)'; ctx.beginPath(); ctx.ellipse(0, -14, w + 2, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(253, 186, 116, 0.9)'; ctx.beginPath(); ctx.ellipse(0, -14, w, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.9)'; ctx.fillRect(-w * 0.5, -14.6, w * 0.6, 1);
    ink(ctx, () => { ctx.moveTo(-6, -14); ctx.quadraticCurveTo(-3, -20, 1, -23); ctx.quadraticCurveTo(1.5, -18, 4, -14); ctx.closePath(); }, '#292524', 0.9);
    ctx.strokeStyle = `rgba(249, 115, 22, ${pulse})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3.5, -14.5); ctx.lineTo(0.4, -21); ctx.stroke();
    return;
  }
  const rock = '#292524';
  const rise = e.vel.y < 0;
  ctx.save();
  ctx.translate(0, -13);
  // (flopping about on the rocks, or arcing through the air)
  ctx.rotate(e.aiState === 'flop' ? Math.sin(f * 0.6) * 0.4 : rise ? -0.5 : 0.6);
  // A fin: rock, glowing along its rays
  const fin = (path: () => void, rays: [number, number, number, number][]) => {
    shaded(ctx, path, '#44403C', -32, -20, 64, 40, 0.9);
    ctx.strokeStyle = `rgba(249, 115, 22, ${pulse})`; ctx.lineWidth = 0.8;
    ctx.beginPath(); for (const [x0, y0, x1, y1] of rays) { ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); } ctx.stroke();
  };
  // The tail, forked
  fin(() => { ctx.moveTo(-17, -2); ctx.lineTo(-30, -10); ctx.lineTo(-26, 0); ctx.lineTo(-29, 9); ctx.lineTo(-17, 3); ctx.closePath(); }, [[-19, -1, -27, -7], [-19, 0.5, -25, 0], [-19, 2, -26, 6]]);
  // The dorsal fin, ragged
  fin(() => { ctx.moveTo(-6, -9.5); ctx.lineTo(-2, -17); ctx.lineTo(1, -14); ctx.lineTo(4, -19); ctx.lineTo(6, -15); ctx.lineTo(10, -8.4); ctx.closePath(); }, [[-2, -10, -2, -15.5], [3, -10, 4, -17.5], [7, -9.5, 6.4, -14]]);
  // The body: a crust of rock, lit from above, the plates picked out, the cracks between glowing
  const body = () => ctx.ellipse(0, 0, 22, 11, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = rock; ctx.fillRect(-22, -11, 44, 22);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-22, -11, 44, 6);
  ctx.fillStyle = '#57534E'; for (const [x, y] of [[-12, -8], [-2, -9], [6, -7], [-8, -2]]) ctx.fillRect(x, y, 3, 1);
  ctx.fillStyle = '#0C0A09'; ctx.fillRect(-22, 5, 44, 6);
  // (the belly: hot underneath)
  ctx.fillStyle = `rgba(234, 88, 12, ${0.55 * pulse})`; ctx.fillRect(-18, 7, 34, 4);
  const cracks = () => { ctx.beginPath(); ctx.moveTo(-14, -3); ctx.lineTo(-6, 2); ctx.lineTo(2, -4); ctx.lineTo(10, 3); ctx.lineTo(16, -1); ctx.moveTo(-8, -7); ctx.lineTo(-2, -3); ctx.moveTo(-6, 2); ctx.lineTo(-8, 8); ctx.moveTo(2, -4); ctx.lineTo(4, -10); ctx.moveTo(10, 3); ctx.lineTo(9, 9); };
  ctx.lineJoin = 'round';
  cracks(); ctx.strokeStyle = `rgba(234, 88, 12, ${pulse})`; ctx.lineWidth = 2.4; ctx.stroke();
  cracks(); ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  // The pectoral fin
  fin(() => { ctx.moveTo(4, 4); ctx.lineTo(-4, 10); ctx.lineTo(-1, 11); ctx.lineTo(8, 6); ctx.closePath(); }, [[4, 5.5, -2, 10]]);
  // The jaws: gaping, the mouth glowing inside, the fangs; the gill slit; the eye like a coal with a slit in it
  ink(ctx, () => { ctx.moveTo(13, -1.5); ctx.lineTo(26, -8); ctx.lineTo(25, -1); ctx.lineTo(26, 6); ctx.closePath(); }, '#7F1D1D', 1);
  ctx.fillStyle = `rgba(249, 115, 22, ${pulse})`; ctx.beginPath(); ctx.moveTo(15, -0.5); ctx.lineTo(23, -3); ctx.lineTo(23, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FEF3C7'; ctx.strokeStyle = INK; ctx.lineWidth = 0.5;
  for (let x = 16.5; x < 26; x += 3) {
    const tu = -1.5 - (x - 13) * 0.5, tl = 1 + (x - 13) * 0.38;
    ctx.beginPath(); ctx.moveTo(x - 0.9, tu); ctx.lineTo(x, tu + 3); ctx.lineTo(x + 0.9, tu); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 0.9, tl + 1); ctx.lineTo(x, tl - 2); ctx.lineTo(x + 0.9, tl + 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(6, -6); ctx.quadraticCurveTo(8.5, 0, 6, 6); ctx.stroke();
  ctx.strokeStyle = `rgba(249, 115, 22, ${pulse})`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(7, -4.5); ctx.quadraticCurveTo(9, 0, 7, 4.5); ctx.stroke();
  ink(ctx, () => ctx.arc(11.5, -4.6, 2.4, 0, Math.PI * 2), '#FDE047', 0.8);
  ctx.fillStyle = '#F97316'; ctx.fillRect(10, -3.8, 3, 1);
  ctx.fillStyle = INK; ctx.fillRect(11.6, -6.4, 1, 3.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10.4, -6, 0.8, 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(8.6, -7.4); ctx.lineTo(14, -6.2); ctx.stroke();
  ctx.restore();
  // Lava dripping off it
  for (let i = 0; i < 3; i++) {
    const dx = -10 + i * 9, dy = -2 + ((f * 2 + i * 7) % 12);
    ink(ctx, () => { ctx.moveTo(dx + 1, dy - 1.5); ctx.quadraticCurveTo(dx + 2.6, dy + 2, dx + 1, dy + 3); ctx.quadraticCurveTo(dx - 0.6, dy + 2, dx + 1, dy - 1.5); }, '#FB923C', 0.6);
    ctx.fillStyle = '#FEF08A'; ctx.fillRect(dx + 0.4, dy + 0.8, 0.8, 0.8);
  }
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
    // (a ball of fire, its tail streaming back round the way it's whirling)
    drawFireball(ctx, bx, by, 7, f, { seed: ph * 3 + 1, vx: -Math.sin(spin + ph), vy: Math.cos(spin + ph), tail: running ? 2.4 : 1.6 });
  }
};

const PARTY_SKIN = ['#E0AC69', '#8D5524', '#F1C27D', '#C68642'];
const PARTY_HAIR = ['#1C1917', '#FDE68A', '#78350F', '#1C1917'];
const PARTY_TOP = ['#7C3AED', '#DB2777', '#0EA5E9', '#F59E0B'];
/** The dance floor's moves, a few bars each. */
const PARTY_MOVES = ['up', 'point', 'wave', 'hips'] as const;
/** A partygoer: dressed for the VIP list (a shiny shirt, a sequin dress, sunglasses at night, a lanyard); dancing, or
 * running with their arms up and their mouth open. */
const drawPartygoer = (ctx: Ctx, e: Enemy, f: number) => {
  const v = (e.variant ?? 0) % 4, seed = Math.abs(Math.round(e.homeX || 0));
  const skin = PARTY_SKIN[(seed + v) % PARTY_SKIN.length];
  const panic = e.aiState === 'panic';
  const bop = panic ? 0 : Math.round(Math.abs(Math.sin(f * 0.2 + seed)) * 2);
  const dress = v === 1 || v === 3, col = PARTY_TOP[v];
  const spec: PersonSpec = {
    skin,
    hair: { style: dress ? 'long' : v === 2 ? 'curly' : 'short', color: PARTY_HAIR[v] },
    top: dress ? { style: 'dress', color: col, accent: dark(col, 0.3) } : { style: 'shirt', color: col, long: true },
    legs: dress ? { color: col, style: 'skirt' } : { color: '#1F2937' },
    shoes: dress ? '#111827' : '#44403C',
    eyes: 'shades',
    extra: (c) => {
      if (dress) {
        // (the sequins, glittering)
        for (let k = 0; k < 9; k++) {
          const sy = -48 + (k * 11) % 32, hw = 9 + 6 * (sy + 52) / 38, sx = -hw * 0.8 + ((k * 5) % 9) / 8 * hw * 1.6 - 1;
          c.fillStyle = (f + k * 7) % 20 < 6 ? '#FFFFFF' : lite(col, 0.35); c.fillRect(sx, sy, (f + k * 7) % 20 < 6 ? 2 : 1, (f + k * 7) % 20 < 6 ? 2 : 1);
        }
      } else {
        // (the sheen down the shirt; the collar open)
        c.fillStyle = lite(col, 0.45); c.fillRect(-6, -49, 1.4, 18); c.fillRect(-3.6, -46, 0.8, 8);
        ink(c, () => { c.moveTo(-3.4, -52); c.lineTo(3.4, -52); c.lineTo(0, -45); c.closePath(); }, skin, 0.7);
        c.fillStyle = '#FACC15'; c.fillRect(-1.6, -50, 3.2, 0.8);
      }
      // (the VIP lanyard, its pass)
      c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-4, -52); c.lineTo(0, -38); c.lineTo(4, -52); c.stroke();
      c.strokeStyle = '#FACC15'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(-4, -52); c.lineTo(0, -38); c.lineTo(4, -52); c.stroke();
      ink(c, () => c.rect(-2.6, -39, 5.2, 6), '#FACC15', 0.7);
      c.fillStyle = '#111827'; c.fillRect(-1.6, -37, 3.2, 0.8); c.fillRect(-1.6, -35.4, 2, 0.8);
    },
  };
  // Dancing (a move every few bars) or running for it, arms up, screaming
  const move = PARTY_MOVES[(Math.floor(f / 48) + seed + v) % PARTY_MOVES.length];
  const drink = !panic && v === 2;
  const pose: Pose = panic
    ? { arms: 'up', walk: f * 0.5, stride: 1, mouth: 'open', f }
    : { arms: drink ? 'up' : move, walk: f * 0.2 + seed, stride: 0.25, mouth: move === 'point' ? 'o' : 'grin', f };
  if (drink) {
    // (a drink held high)
    pose.prop = (c, hx, hy) => {
      ink(c, () => { c.moveTo(hx - 2.6, hy - 9); c.lineTo(hx + 2.6, hy - 9); c.lineTo(hx + 2, hy - 1); c.lineTo(hx - 2, hy - 1); c.closePath(); }, 'rgba(224, 242, 254, 0.75)', 0.7);
      c.fillStyle = '#FDE047'; c.fillRect(hx - 1.9, hy - 6, 3.8, 4.4);
      c.fillStyle = '#FFFFFF'; c.fillRect(hx - 2, hy - 8.4, 1, 6);
    };
  }
  drawPerson(ctx, 0, -bop, spec, pose, 0.94);
};
