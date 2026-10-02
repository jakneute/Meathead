// Victor's stage: his goons in heat gear (a silver proximity suit with a flare
// gun, a smokejumper in turnout gear with an axe, a guy in a bomb suit behind a
// riveted blast shield), and the volcano's wildlife (a fire salamander, a
// vulture, a fish that lives in the lava). Drawn like the rest: facing right
// from a point at the feet (centre bottom), flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFireball, drawFlameLicks } from '../fx/fireball';
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

// The goons are drawn the townsfolk's way (an ink line round every part, each part shaded in steps, a face that does
// something, hands), out of a few parts of their own: legs, a body, a head, arms, a glow.

/** Two legs in trousers, shaded, soled boots (on platforms `sole` tall); striding when `stride` is up. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, boot: string, sole = 0) => {
  const s = Math.sin(f * 0.25) * stride;
  for (const x of [-8 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, hipY, 7, -hipY - 5 - sole), pants, x, hipY, 7, -hipY - 5 - sole);
    if (sole) {
      ink(ctx, () => ctx.rect(x - 1.6, -sole, 11.6, sole), '#111827', 1);
      ctx.fillStyle = '#374151'; ctx.fillRect(x - 0.8, -sole + 0.8, 10, 0.8);
    }
    ink(ctx, () => ctx.roundRect(x - 1.6, -6 - sole, 11.4, 6, [2.5, 3.4, 1, 1]), boot, 1);
    ctx.fillStyle = lite(boot, 0.35); ctx.fillRect(x - 0.6, -5.2 - sole, 3, 1);
    if (!sole) { ctx.fillStyle = lite(boot, 0.5); ctx.fillRect(x - 1.6, -1.2, 11.4, 1); }
  }
};

/** Shading for a body that isn't a box: `path` filled with `color` in steps over (x, y, w, h), `detail` on it, inked. */
const part = (ctx: Ctx, path: () => void, color: string, x: number, y: number, w: number, h: number, detail?: () => void) => {
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
};

type Mouth = 'flat' | 'grin' | 'snarl' | 'none';
/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, an eye and its brow, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, o: { mouth?: Mouth; mad?: boolean; neck?: boolean } = {}) => {
  const sd = dark(skin, 0.2);
  if (o.neck !== false) ink(ctx, () => ctx.rect(x - 2.4, y + r - 2, 4.8, 5), sd, 0.8);
  const skull = () => ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 2.2);
  ctx.fillStyle = sd; ctx.fillRect(x - r, y - r * 1.1, r * 0.55, r * 2.2);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(x + r * 0.2, y - r * 0.85, r * 0.5, r * 0.45);
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(x - r + 2.4, y + 1, 1.8, 2.4, 0, 0, Math.PI * 2), sd, 0.7);
  const ey = y - 1;
  for (const [ex, back] of [[x + 1, true], [x + 5.5, false]] as const) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
    ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
    if (o.mad) { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
    else ctx.fillRect(ex - 1.5, ey - 3.6, 3, 1);
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  const mx = x + 3.4, my = y + r * 0.62;
  ctx.fillStyle = INK;
  switch (o.mouth ?? 'flat') {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'snarl': ctx.fillRect(mx - 2.6, my - 0.6, 5.6, 2.4); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(mx - 2 + k * 1.8, my - 0.4, 1.2, 1); break;
  }
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy), sleeved; the hand (or glove) at the end of it. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, hand: string, w = 5.5) => {
  limb(ctx, sx, sy, hx, hy, w, sleeve);
  ctx.strokeStyle = lite(sleeve, 0.25); ctx.lineWidth = 1; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx + (hx - sx) * 0.1, sy + (hy - sy) * 0.1 - w * 0.25); ctx.lineTo(sx + (hx - sx) * 0.7, sy + (hy - sy) * 0.7 - w * 0.25); ctx.stroke();
  ctx.lineCap = 'butt';
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), hand, 0.8);
};

/** A stepped glow (a muzzle about to go, a glowstick): an outer ring, a hot middle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a: number) => {
  ctx.fillStyle = `rgba(${rgb}, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);

/** A silver aluminized proximity suit, hood and gold mirrored visor; a flare gun that glows before it fires. */
const drawHeatsuit = (ctx: Ctx, e: Enemy, f: number) => {
  const walking = Math.abs(e.vel.x) > 0.5;
  const SILVER = '#C7CCD4', GLOVE = '#9CA3AF';
  legs(ctx, -26, f, walking ? 5 : 0, SILVER, '#3F3F46');
  arm(ctx, -9, -46, -12, -30, dark(SILVER, 0.15), GLOVE, 6);
  // The suit: baggy, shiny, stiff; the sheen down it in hard steps, crinkles across, the flap down the front, the seams
  const suit = () => { ctx.moveTo(-14, -22); ctx.lineTo(-13, -50); ctx.quadraticCurveTo(0, -58, 13, -50); ctx.lineTo(14, -22); ctx.closePath(); };
  part(ctx, suit, SILVER, -14, -56, 28, 34, () => {
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-11, -56, 6, 34);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-9.4, -56, 2, 34);
    ctx.fillStyle = '#9CA3AF'; for (const [x, y] of [[-3, -46], [5, -43], [-6, -33], [7, -31], [0, -36]]) { ctx.fillRect(x, y, 3, 0.8); ctx.fillRect(x + 1, y + 0.8, 2, 0.6); }
    ctx.fillStyle = dark(SILVER, 0.3); ctx.fillRect(3, -54, 0.8, 28);
    ctx.fillStyle = dark(SILVER, 0.18); ctx.fillRect(3.8, -54, 2.6, 28);
    for (let y = -50; y < -28; y += 5) { ctx.fillStyle = '#6B7280'; ctx.fillRect(4.4, y, 1.4, 1.4); }
    ctx.fillStyle = dark(SILVER, 0.32); ctx.fillRect(-14, -38, 28, 1);
  });
  // (the belt: a band of the stuff, buckled)
  shadedTop(ctx, () => ctx.rect(-14, -26.6, 28, 3.6), '#9CA3AF', -14, -26.6, 28, 3.6, 0.8);
  ink(ctx, () => ctx.rect(-2, -27, 4.4, 4.4), '#52525B', 0.7);
  // The hood: a stiff box over the whole head, its bib out over the shoulders; the gold visor, a glint sliding over it,
  // the frame round it, the vent under it
  part(ctx, () => { ctx.moveTo(-13, -48); ctx.lineTo(-11, -54); ctx.lineTo(13, -54); ctx.lineTo(14, -48); ctx.closePath(); }, '#D1D5DB', -13, -54, 27, 6);
  part(ctx, () => ctx.roundRect(-9, -72, 20, 20, [6, 6, 2, 2]), '#E5E7EB', -9, -72, 20, 20, () => {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-7, -70, 2, 16);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-9, -55, 20, 3);
  });
  const visor = () => ctx.roundRect(-0.4, -68.6, 12, 10, [2, 3, 3, 2]);
  ink(ctx, () => ctx.roundRect(-1.6, -69.8, 14.4, 12.4, [3, 4, 4, 3]), '#52525B', 0.8);
  ctx.save(); ctx.beginPath(); visor(); ctx.clip();
  ctx.fillStyle = '#B45309'; ctx.fillRect(-1, -69, 13, 11);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(-1, -67.4, 13, 6.6);
  ctx.fillStyle = '#FBBF24'; ctx.fillRect(-1, -67.4, 13, 3);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(-1, -68.2, 13, 0.9);
  const glint = (f * 0.08) % 12;
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath(); ctx.moveTo(-2 + glint, -59); ctx.lineTo(1 + glint, -69); ctx.lineTo(3.2 + glint, -69); ctx.lineTo(0.2 + glint, -59); ctx.fill();
  ctx.fillRect(4 + glint * 0.5, -68, 1, 1);
  ctx.restore();
  ctx.beginPath(); visor(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = '#6B7280'; for (let k = 0; k < 3; k++) ctx.fillRect(3 + k * 2.4, -56.4, 1.4, 1.6);
  // Flare gun: the fat orange barrel, its muzzle ring, the grip in his glove; it glows up before it goes
  const c = charge(e);
  arm(ctx, 4, -48, 12, -41, SILVER, GLOVE, 6);
  ink(ctx, () => { ctx.moveTo(11.4, -41); ctx.lineTo(17, -41); ctx.lineTo(16.2, -33.6); ctx.lineTo(11, -33.6); ctx.closePath(); }, '#9A3412', 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(19, -39.4, 2, 0, Math.PI); ctx.stroke();
  shadedTop(ctx, () => ctx.roundRect(10, -47, 15, 8, 1.4), '#EA580C', 10, -47, 15, 8);
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(11.4, -45.8, 11, 1);
  shaded(ctx, () => ctx.roundRect(23.6, -48.2, 3.6, 10.4, 1), '#C2410C', 23.6, -48.2, 3.6, 10.4, 0.8);
  ink(ctx, () => ctx.rect(9, -48.6, 2.4, 2.4), '#52525B', 0.6); // the hammer
  ink(ctx, () => ctx.roundRect(10.2, -42.4, 5.6, 5, 1.6), GLOVE, 0.8);
  ctx.fillStyle = dark(GLOVE, 0.2); ctx.fillRect(11, -40.4, 4, 0.6);
  if (c > 0.5) glow(ctx, 29, -43, 2 + c * 3, '253, 224, 71', c);
};

/** Turnout gear (tan coat, reflective stripes), a black helmet with a shield, air tank on his back, an axe; he runs you down. */
const drawSmokejumper = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const COAT = '#C7A36B', GLOVE = '#1C1917', SKIN = '#D6A77A';
  const lf = f * (running ? 1.8 : 0.6), stride = running ? 7 : 1;
  legs(ctx, -28, lf, stride, '#B08D57', GLOVE);
  // (the reflective cuffs, one on each leg)
  const s = Math.sin(lf * 0.25) * stride;
  for (const x of [-8 + s, 2 - s]) { ink(ctx, () => ctx.rect(x, -14, 7, 3), '#FDE047', 0.6); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x + 0.4, -13, 6.2, 1); }
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(running ? 0.25 : 0);
  // Air tank on his back: the bottle, its valve and wheel, the hose round to his mask
  shaded(ctx, () => ctx.roundRect(-24, -40, 9, 30, [3, 3, 2, 2]), '#9CA3AF', -24, -40, 9, 30);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-23.4, -30, 7.8, 2.4); ctx.fillStyle = INK; ctx.fillRect(-23.4, -27.6, 7.8, 0.6);
  ink(ctx, () => ctx.rect(-22, -44, 5, 4), '#6B7280', 0.8);
  ink(ctx, () => ctx.rect(-24, -45.6, 9, 1.8), '#111827', 0.6);
  ctx.beginPath(); ctx.moveTo(-17, -42); ctx.quadraticCurveTo(-6, -52, 6, -36);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.4; ctx.stroke();
  // The back arm, swinging when he runs
  const sw = running ? Math.sin(f * 0.45) * 5 : 0;
  arm(ctx, -10, -28, -12 - sw, -12, dark(COAT, 0.15), GLOVE, 6);
  // The coat: the stripes round it (yellow, the silver down the middle), the closure, the pockets, the collar up
  const coat = () => { ctx.moveTo(-18, 2); ctx.lineTo(-19, -32); ctx.quadraticCurveTo(0, -44, 19, -32); ctx.lineTo(18, 2); ctx.closePath(); };
  part(ctx, coat, COAT, -19, -42, 38, 44, () => {
    for (const y of [-20, -6]) {
      ctx.fillStyle = INK; ctx.fillRect(-19, y - 0.6, 38, 4.2);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(-19, y, 38, 3);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-19, y + 1, 38, 1);
    }
    ctx.fillStyle = dark(COAT, 0.35); ctx.fillRect(4, -40, 0.8, 42);
    ctx.fillStyle = dark(COAT, 0.2); ctx.fillRect(4.8, -40, 2.4, 42);
    ctx.fillStyle = '#1C1917'; for (const y of [-27, -13, 0]) ctx.fillRect(5.4, y, 2.4, 1.6);
    ctx.fillStyle = dark(COAT, 0.3); ctx.fillRect(-14, -16, 8, 0.8); ctx.fillRect(-14, -16, 0.8, 9);
  });
  part(ctx, () => ctx.roundRect(-6, -40, 14, 6, [3, 3, 1, 1]), dark(COAT, 0.1), -6, -40, 14, 6);
  // The axe, over his far shoulder (the head up behind his helmet, out of his face): the haft, the red head
  // blade-back, the steel edge, the pick forward
  const swing = running ? Math.sin(f * 0.45) * 0.3 : 0;
  ctx.save(); ctx.translate(12, -16); ctx.rotate(-0.52 + swing);
  shaded(ctx, () => ctx.roundRect(-2, -27, 4, 35, 1.4), '#92400E', -2, -27, 4, 35, 0.9);
  ctx.fillStyle = '#B45309'; ctx.fillRect(-1.2, -14, 0.8, 6); ctx.fillRect(0.2, 0, 0.8, 5);
  shaded(ctx, () => { ctx.moveTo(-1.6, -27); ctx.lineTo(-13, -31); ctx.lineTo(-13, -15); ctx.lineTo(-1.6, -18); ctx.closePath(); }, '#DC2626', -13, -31, 12, 16, 0.9);
  ink(ctx, () => { ctx.moveTo(1.6, -26); ctx.lineTo(10, -22.6); ctx.lineTo(1.6, -20); ctx.closePath(); }, '#DC2626', 0.9);
  ink(ctx, () => { ctx.moveTo(-12.4, -31.4); ctx.lineTo(-15.4, -32); ctx.lineTo(-15.4, -14); ctx.lineTo(-12.4, -14.6); ctx.closePath(); }, '#D1D5DB', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-14.4, -30, 1, 10);
  ink(ctx, () => ctx.rect(-2.4, -27.8, 4.8, 2.4), '#374151', 0.6);
  ctx.restore();
  // The face under it all: soot on him, his eye, the mask over his mouth and its filter, the strap round
  head(ctx, 6, -40, SKIN, 7, { mad: true, mouth: 'none', neck: false });
  ctx.fillStyle = 'rgba(41, 37, 36, 0.45)'; ctx.fillRect(1, -42, 3, 2); ctx.fillRect(8, -44, 2, 1.4); ctx.fillRect(2, -37, 2, 1.4);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(6, -36); ctx.lineTo(0, -38); ctx.stroke();
  shaded(ctx, () => ctx.roundRect(6, -39, 8, 6.4, 2.4), '#1F2937', 6, -39, 8, 6.4, 0.9);
  ink(ctx, () => ctx.arc(14.6, -35.4, 2.6, 0, Math.PI * 2), '#374151', 0.8);
  ctx.fillStyle = '#9CA3AF'; for (const [dx, dy] of [[-0.8, -0.8], [0.8, -0.8], [0, 0.8]]) ctx.fillRect(14.6 + dx - 0.4, -35.4 + dy - 0.4, 0.8, 0.8);
  // Helmet: black, a long brim out the back, the comb along the top, a leather shield on the front with its badge
  shaded(ctx, () => ctx.roundRect(-14, -47.4, 30, 4.4, [1, 1, 3, 2]), '#111827', -14, -47.4, 30, 4.4);
  shadedTop(ctx, () => { ctx.arc(4, -46, 12, Math.PI, 0); ctx.closePath(); }, '#1F2937', -8, -58, 24, 12);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-2, -55, 6, 1); ctx.fillRect(-5, -52, 2, 3);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(4, -46, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  shaded(ctx, () => ctx.roundRect(8, -56, 7.6, 9.4, [3, 3, 1, 1]), '#B91C1C', 8, -56, 7.6, 9.4, 0.9);
  ink(ctx, () => ctx.rect(9.8, -53, 3.8, 3.6), '#FACC15', 0.6);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(11.2, -52.4, 1, 2.4);
  // His fist round the haft
  arm(ctx, 4, -32, 13, -17, COAT, GLOVE, 6);
  ink(ctx, () => ctx.roundRect(9.6, -20.4, 8.4, 7.4, 2.2), GLOVE, 1);
  ctx.fillStyle = '#44403C'; ctx.fillRect(11, -19.4, 5.4, 1); ctx.fillRect(15.6, -18.4, 1, 3);
  ctx.restore();
};

/** A heavy steel blast shield at (x, y), w by h: the plate bevelled, an inner frame, a view slot, a band of hazard
 * stripes, rivets round it; dented and scorched, and glowing, as it takes a beating. */
const blastPlate = (ctx: Ctx, x: number, y: number, w: number, h: number, damage: number, slot: boolean) => {
  const STEEL = '#6B7280';
  const plate = () => ctx.roundRect(x, y, w, h, [2, 2, 1, 1]);
  ctx.save(); ctx.beginPath(); plate(); ctx.clip();
  ctx.fillStyle = STEEL; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y, 3, h); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x + 0.8, y, 1, h);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x + w - 3, y, 3, h); ctx.fillRect(x, y + h - 2.4, w, 2.4);
  // (the inner frame: a lit edge, a shadowed one)
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x + 4, y + 4, w - 8, 0.8); ctx.fillRect(x + 4, y + 4, 0.8, h - 8);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 4, y + h - 4.8, w - 8, 0.8); ctx.fillRect(x + w - 4.8, y + 4, 0.8, h - 8);
  // (the hazard band: yellow, the black stripes slanting across, inked top and bottom)
  const hy = y + h * 0.42, hh = Math.max(6, h * 0.21);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x, hy, w, hh);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(x, hy, w, 1);
  ctx.fillStyle = '#111827';
  for (let sx = x - hh; sx < x + w; sx += 7) { ctx.beginPath(); ctx.moveTo(sx, hy + hh); ctx.lineTo(sx + 3.5, hy + hh); ctx.lineTo(sx + 3.5 + hh, hy); ctx.lineTo(sx + hh, hy); ctx.fill(); }
  ctx.fillStyle = INK; ctx.fillRect(x, hy - 0.8, w, 0.8); ctx.fillRect(x, hy + hh, w, 0.8);
  // (dents where it's been hit: a dark pit, a lit rim; scorch round the worst)
  const n = Math.floor(damage * 6);
  for (let i = 0; i < n; i++) {
    const dx = x + 5 + ((i * 7) % Math.max(1, w - 10)), dy = y + 8 + ((i * 23) % Math.max(1, h - 16));
    ctx.fillStyle = 'rgba(17, 24, 39, 0.35)'; ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D1D5DB'; ctx.fillRect(dx - 2, dy + 1.4, 2.4, 0.8);
  }
  ctx.restore();
  ctx.beginPath(); plate(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  // (the view slot: a strip of smoked glass in a frame)
  if (slot) {
    ink(ctx, () => ctx.roundRect(x + 4, y + 8, w - 8, 4, 1), '#14532D', 1);
    ctx.fillStyle = '#4ADE80'; ctx.fillRect(x + 5, y + 8.8, 3, 0.8);
  }
  // (rivets down both sides)
  for (let ry = y + 3; ry < y + h - 2; ry += 12) for (const rx of [x + 2.2, x + w - 2.2]) {
    if (ry > hy - 2 && ry < hy + hh + 2) continue;
    ink(ctx, () => ctx.arc(rx, ry, 1.2, 0, Math.PI * 2), '#9CA3AF', 0.6);
    ctx.fillStyle = '#F3F4F6'; ctx.fillRect(rx - 0.8, ry - 0.8, 0.8, 0.8);
  }
};

/** A bomb-disposal suit, a welder's mask, and a riveted steel blast shield; he drops it to lob a lump of hot rock. */
const drawBlastshield = (ctx: Ctx, e: Enemy, f: number) => {
  const OLIVE = '#4B5A46', GLOVE = '#1C1917';
  legs(ctx, -24, f, 0, '#3F4A3C', GLOVE);
  // (the knee pads)
  for (const x of [-8, 2]) ink(ctx, () => ctx.roundRect(x - 0.6, -17, 8.2, 5, 2), '#394535', 0.8);
  // Padded bomb suit: quilted in rows (a puff lit along the top of each), the seam down the middle, the collar ring
  const suit = () => { ctx.moveTo(-15, -22); ctx.lineTo(-15, -52); ctx.quadraticCurveTo(0, -60, 15, -52); ctx.lineTo(15, -22); ctx.closePath(); };
  part(ctx, suit, OLIVE, -15, -58, 30, 36, () => {
    for (let y = -48; y < -24; y += 7) {
      ctx.fillStyle = '#2F382C'; ctx.fillRect(-15, y, 30, 1.6);
      ctx.fillStyle = lite(OLIVE, 0.18); ctx.fillRect(-15, y + 1.6, 30, 1);
    }
    ctx.fillStyle = '#2F382C'; ctx.fillRect(1, -56, 1, 34);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -40, 6, 3); ctx.fillStyle = INK; ctx.fillRect(-11, -39, 4, 0.8);
  });
  part(ctx, () => ctx.roundRect(-11, -56, 22, 5, 2.4), '#55654F', -11, -56, 22, 5);
  // Welding mask: the shell, the pivot bolt, the green lens with its glint, the vent at the chin
  part(ctx, () => ctx.roundRect(-8, -74, 20, 20, [7, 7, 3, 4]), '#27272A', -8, -74, 20, 20, () => {
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(-8, -74, 20, 2);
  });
  ink(ctx, () => ctx.arc(-4, -63, 2, 0, Math.PI * 2), '#52525B', 0.7);
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-4.6, -63.6, 0.8, 0.8);
  const lens = () => ctx.rect(2, -69, 9, 5);
  ink(ctx, () => ctx.rect(1, -70, 11, 7), '#18181B', 0.8);
  ctx.save(); ctx.beginPath(); lens(); ctx.clip();
  ctx.fillStyle = '#15803D'; ctx.fillRect(2, -69, 9, 5);
  ctx.fillStyle = '#16A34A'; ctx.fillRect(2, -69, 9, 2.4);
  ctx.fillStyle = '#86EFAC'; ctx.fillRect(3 + (f * 0.06) % 6, -69, 2, 5);
  ctx.restore();
  ctx.fillStyle = '#52525B'; for (let k = 0; k < 3; k++) ctx.fillRect(4 + k * 2.4, -58, 1.4, 2);
  const up = !!e.isShieldActive;
  if (up) {
    const damage = 1 - e.health / e.maxHealth;
    arm(ctx, 6, -50, 12, -44, OLIVE, GLOVE, 6.5);
    blastPlate(ctx, 10, -76, 18, 76, damage, true);
    // (the foot it stands on)
    ink(ctx, () => ctx.rect(8, -3, 22, 3), '#374151', 0.9);
    // Glowing where it's been hit hard
    if (damage > 0.3) {
      const a = Math.min(0.7, damage);
      glow(ctx, 20, -58, 3 + damage * 4, '249, 115, 22', a);
    }
  } else {
    // Shield down at his side; arm back with a glowing rock
    blastPlate(ctx, -28, -36, 12, 36, 0, false);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const rx = -2 - wind * 12, ry = -56;
    arm(ctx, -2, -46, rx + 1, ry + 5, OLIVE, GLOVE, 6.5);
    shaded(ctx, () => { ctx.moveTo(rx - 6, ry); ctx.lineTo(rx - 3, ry - 5.4); ctx.lineTo(rx + 3, ry - 5.6); ctx.lineTo(rx + 6, ry - 1); ctx.lineTo(rx + 4, ry + 5); ctx.lineTo(rx - 3, ry + 5.6); ctx.closePath(); }, '#7C2D12', rx - 6, ry - 6, 12, 12, 1);
    ctx.lineJoin = 'round';
    for (const [col, lw] of [['#F97316', 1.6], ['#FDE047', 0.6]] as const) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(rx - 4, ry - 2); ctx.lineTo(rx - 1, ry); ctx.lineTo(rx + 1, ry - 3); ctx.moveTo(rx - 1, ry); ctx.lineTo(rx + 1, ry + 3); ctx.lineTo(rx + 4, ry + 2); ctx.stroke();
    }
    ctx.fillStyle = '#FDBA74'; ctx.fillRect(rx - 3, ry - 4, 2, 1);
    ink(ctx, () => ctx.ellipse(rx + 1.6, ry + 5, 3, 2.4, 0, 0, Math.PI * 2), GLOVE, 0.8);
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
  const SKIN = '#E0AC69';
  legs(ctx, -26, f, walking ? 5 : 0, '#18181B', '#F97316', 4);
  // An arm up with a glowstick (glowing round it), the other out with the shot glass
  const stick = f % 20 < 10 ? '#A3E635' : '#22D3EE';
  arm(ctx, -9, -49 - bop, -14, -66 - bop, SKIN, SKIN, 5);
  glow(ctx, -14, -72 - bop, 4, f % 20 < 10 ? '163, 230, 53' : '34, 211, 238', 0.3);
  ink(ctx, () => ctx.roundRect(-16, -78 - bop, 4, 12, 1.8), stick, 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-15, -76 - bop, 1, 8);
  ink(ctx, () => ctx.ellipse(-14, -66.6 - bop, 3, 2.4, 0, 0, Math.PI * 2), SKIN, 0.8);
  // The body under the mesh top: the mesh glowing over it, the waistband, a navel
  part(ctx, () => ctx.roundRect(-12, -52 - bop, 24, 28, [5, 5, 1, 1]), SKIN, -12, -52 - bop, 24, 28, () => {
    ctx.fillStyle = dark(SKIN, 0.2); ctx.fillRect(-0.4, -46 - bop, 0.8, 8); ctx.fillRect(-7, -44 - bop, 5, 0.8); ctx.fillRect(2, -44 - bop, 5, 0.8);
    for (const [col, lw] of [['rgba(234, 88, 12, 0.55)', 2], ['#FDBA74', 0.8]] as const) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath(); ctx.moveTo(-12, -50 + k * 6 - bop); ctx.lineTo(12, -46 + k * 6 - bop); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12 + k * 6, -52 - bop); ctx.lineTo(-10 + k * 6, -24 - bop); ctx.stroke();
      }
    }
    ctx.fillStyle = dark(SKIN, 0.35); ctx.fillRect(0, -31 - bop, 1.2, 1.2);
  });
  shadedTop(ctx, () => ctx.rect(-12, -28 - bop, 24, 4), '#F43F5E', -12, -28 - bop, 24, 4, 0.8);
  ctx.fillStyle = '#FDA4AF'; ctx.fillRect(-11, -27.4 - bop, 22, 0.8);
  // Head: a buzz cut dyed orange, the goggles up on it glowing, a pacifier on a cord
  const hy = -62 - bop;
  head(ctx, 2, hy, SKIN, 8, { mouth: 'none' });
  ink(ctx, () => { ctx.ellipse(1.4, hy - 2.8, 8.6, 6.4, 0, Math.PI * 1.02, Math.PI * 2.02); ctx.closePath(); }, '#EA580C', 0.9);
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(-2, hy - 8.4, 6, 1);
  ctx.fillStyle = '#9A3412'; for (let k = 0; k < 5; k++) ctx.fillRect(-5 + k * 2.6, hy - 5 + (k % 2), 0.8, 0.8);
  const gl = (0.7 + 0.3 * Math.sin(f * 0.3)).toFixed(3);
  ink(ctx, () => ctx.rect(-6.6, hy - 7.4, 16, 1.6), '#111827', 0.5);
  for (const gx of [-1, 5]) {
    ink(ctx, () => ctx.roundRect(gx, hy - 9.4, 5.6, 4.4, 1.6), '#111827', 0.8);
    ctx.fillStyle = `rgba(52, 211, 153, ${gl})`; ctx.fillRect(gx + 0.9, hy - 8.5, 3.8, 2.6);
    ctx.fillStyle = '#D1FAE5'; ctx.fillRect(gx + 1.2, hy - 8.2, 1.2, 0.8);
  }
  ctx.strokeStyle = '#F472B6'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(8, hy + 7); ctx.quadraticCurveTo(3, hy + 12, -2, hy + 11); ctx.stroke();
  ink(ctx, () => ctx.ellipse(8.6, hy + 5, 1.6, 3, 0, 0, Math.PI * 2), '#F472B6', 0.7);
  ink(ctx, () => ctx.arc(10.6, hy + 5, 1.8, 0, Math.PI * 2), '#F9A8D4', 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(10, hy + 4.2, 0.8, 0.8);
  // The shot glass, flaming, before it goes
  const c = charge(e);
  arm(ctx, 7, -49 - bop, 19, -44, SKIN, SKIN, 5);
  if (c > 0.2 || f % 16 < 8) drawFlameLicks(ctx, 21, -49, 6, 9 + c * 7, f, { n: 2, k: 0.6 + c * 0.4 });
  ink(ctx, () => { ctx.moveTo(18, -50); ctx.lineTo(24, -50); ctx.lineTo(23.4, -42); ctx.lineTo(18.6, -42); ctx.closePath(); }, 'rgba(224, 242, 254, 0.8)', 0.8);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(18.8, -48.4, 4.4, 4); ctx.fillStyle = '#FDE68A'; ctx.fillRect(18.8, -48.4, 4.4, 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(19, -49.4, 0.8, 6);
  ink(ctx, () => ctx.ellipse(19, -43.6, 2.8, 2.2, 0, 0, Math.PI * 2), SKIN, 0.8);
};

/** A fire dancer: bare-chested, lava-red body paint, a flaming poi on a chain in each hand, spinning; he runs at you with them. */
const drawFiredancer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const SKIN = '#C68B45', PAINT = '#DC2626';
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#7C2D12', '#1C1917');
  // Bare chest: the pecs, the abs, the paint (a chevron, a bar) in red, inked dark at the edges
  part(ctx, () => ctx.roundRect(-13, -54, 26, 25, [6, 6, 2, 2]), SKIN, -13, -54, 26, 25, () => {
    ctx.fillStyle = dark(SKIN, 0.22); ctx.fillRect(-9, -44.6, 7, 1); ctx.fillRect(2, -44.6, 7, 1); ctx.fillRect(-0.4, -50, 0.8, 20);
    ctx.fillRect(-4, -38, 3, 0.8); ctx.fillRect(1, -38, 3, 0.8); ctx.fillRect(-4, -34, 3, 0.8); ctx.fillRect(1, -34, 3, 0.8);
    ctx.fillStyle = lite(SKIN, 0.2); ctx.fillRect(-8, -49, 4, 1); ctx.fillRect(3, -49, 4, 1);
    ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
    for (const [col, lw] of [[dark(PAINT, 0.4), 3], [PAINT, 2], ['#F87171', 0.6]] as const) {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(0, -40); ctx.lineTo(10, -50); ctx.moveTo(-8, -36); ctx.lineTo(8, -36); ctx.stroke();
    }
  });
  // The sash: wound round, knotted, the ends hanging
  shadedTop(ctx, () => ctx.rect(-12, -30, 24, 5), '#B45309', -12, -30, 24, 5, 0.9);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(-11, -29.2, 22, 0.8);
  ink(ctx, () => { ctx.moveTo(-9, -26); ctx.lineTo(-12, -16); ctx.lineTo(-8, -17); ctx.lineTo(-6, -26); ctx.closePath(); }, '#92400E', 0.7);
  ink(ctx, () => ctx.ellipse(-7.4, -27.6, 2.6, 2.2, 0, 0, Math.PI * 2), '#B45309', 0.7);
  // Head: black hair, a red headband, its tails out the back; red paint across the eyes
  head(ctx, 2, -64, SKIN, 9, { mad: true, mouth: 'grin' });
  ctx.fillStyle = 'rgba(220, 38, 38, 0.85)'; ctx.fillRect(-1, -66.6, 11, 1.4); ctx.fillRect(-3, -62, 13, 1);
  ink(ctx, () => { ctx.ellipse(1.4, -66, 9.6, 8, 0, Math.PI * 1.02, Math.PI * 2.02); ctx.closePath(); }, '#1C1917', 0.9);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-3, -73, 6, 1);
  shadedTop(ctx, () => ctx.rect(-8, -70, 19, 3), '#B91C1C', -8, -70, 19, 3, 0.8);
  const flut = Math.sin(f * (running ? 0.6 : 0.25)) * 2;
  ink(ctx, () => { ctx.moveTo(-7, -69.6); ctx.lineTo(-15, -67 + flut); ctx.lineTo(-14, -64.6 + flut); ctx.lineTo(-7, -67.6); ctx.closePath(); }, '#991B1B', 0.7);
  ink(ctx, () => { ctx.moveTo(-7, -68.6); ctx.lineTo(-13, -62 - flut); ctx.lineTo(-11, -61 - flut); ctx.lineTo(-7, -67); ctx.closePath(); }, '#991B1B', 0.7);
  // The poi: an arm out to each, the chain (links) out to a ball of fire, whirling
  const spin = f * (running ? 0.45 : 0.22);
  for (const [hx, hy, ph, sx] of [[-14, -48, 0, -9], [16, -48, Math.PI, 9]] as const) {
    const bx = hx + Math.cos(spin + ph) * 20, by = hy + Math.sin(spin + ph) * 20;
    arm(ctx, sx, -50, hx, hy, SKIN, SKIN, 5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.setLineDash([1.6, 1.2]); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineCap = 'butt';
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
