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
    case 'lowrider': drawLowrider(ctx, e, f, state.frame); break;
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

// (People drawn the townsfolk's way, like Barry's and Hector's: an ink line round every part, each part shaded in steps,
// a face with eyes and brows, hands, something on the feet.)

/**
 * Two legs from the hips at hipY, trousered all the way, and on the end of them soled shoes (a stripe of `trim` down
 * the side, if any) or boots. Striding when `stride` is up.
 */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe = '#F8FAFC', boot = false, trim?: string) => {
  const s = Math.sin(f * 0.25) * stride;
  const light = shoe === '#F8FAFC';
  for (const x of [-8 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, hipY, 7, -hipY - 4), pants, x, hipY, 7, -hipY - 4);
    ctx.fillStyle = dark(pants, 0.3); ctx.fillRect(x + 1, hipY + 6, 3, 0.7); ctx.fillRect(x + 2, -11, 3, 0.7); // creases
    const h = boot ? 8 : 5;
    ink(ctx, () => ctx.roundRect(x - 1, -h, 10, h, boot ? [1.5, 3, 1, 1] : [2.5, 3, 1, 1]), shoe, 1);
    ctx.fillStyle = light ? '#FFFFFF' : lite(shoe, 0.35); ctx.fillRect(x, -h + 0.6, 3, 1);
    ctx.fillStyle = light ? '#A8A29E' : lite(shoe, 0.55); ctx.fillRect(x - 1, -1, 10, 1);
    if (boot) { ctx.fillStyle = dark(shoe, 0.4); ctx.fillRect(x - 0.4, -5, 9, 0.7); }
    if (trim) { ctx.fillStyle = trim; ctx.beginPath(); ctx.moveTo(x + 2, -1.6); ctx.lineTo(x + 7, -4); ctx.lineTo(x + 7.6, -2.6); ctx.lineTo(x + 3.6, -1.6); ctx.fill(); }
  }
};

/** A body (a hoodie, a vest): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
const body = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, detail?: () => void, r: number | number[] = [5, 5, 2, 2]) => {
  const path = () => ctx.roundRect(x, y, w, h, r);
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

type Mouth = 'flat' | 'grin' | 'frown' | 'none';
interface Face { mouth?: Mouth; brow?: 'flat' | 'mad'; tint?: string }

/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, eyes and brows, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, o: Face = {}) => {
  const sd = dark(skin, 0.2);
  ink(ctx, () => ctx.rect(x - 2.4, y + r - 2, 4.8, 5), sd, 0.8);
  const skull = () => ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 2.2);
  ctx.fillStyle = sd; ctx.fillRect(x - r, y - r * 1.1, r * 0.55, r * 2.2);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(x + r * 0.2, y - r * 0.85, r * 0.5, r * 0.45);
  if (o.tint) { ctx.fillStyle = o.tint; ctx.fillRect(x - r, y - r * 0.1, r * 2, r * 1.2); }
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(x - r + 2.4, y + 1, 1.8, 2.4, 0, 0, Math.PI * 2), sd, 0.7);
  const ey = y - 1, k = r / 8;
  for (const [ex, back] of [[x + k, true], [x + 5.5 * k, false]] as const) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
    ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
    if (o.brow === 'mad') { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
    else ctx.fillRect(ex - 1.5, ey - 3.6, 3, 1);
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  const mx = x + 3.4 * k, my = y + r * 0.62;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (o.mouth ?? 'flat') {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'frown': ctx.beginPath(); ctx.arc(mx, my + 1.8, 2.4, Math.PI + 0.3, -0.3); ctx.stroke(); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'none': break;
  }
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy): sleeved all the way (or short-sleeved), the hand (`hand` its colour). */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, short = false, w = 5.5, hand = skin) => {
  limb(ctx, sx, sy, hx, hy, w, short ? skin : sleeve);
  if (short) limb(ctx, sx, sy, sx + (hx - sx) * 0.4, sy + (hy - sy) * 0.4, w + 0.6, sleeve);
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), hand, 0.8);
};

/** A stepped glow (the muzzle about to go): an outer ring, a hot middle. `rgb` its colour. */
const glow = (ctx: Ctx, x: number, y: number, r: number, a: number, rgb = '254, 240, 138') => {
  ctx.fillStyle = `rgba(${rgb}, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** A gold chain hung round the neck at (x, y), r across. */
const chain = (ctx: Ctx, x: number, y: number, r: number, a = 0.35) => {
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, a, Math.PI - a);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(x - r * 0.5, y + r * 0.8, 1, 0.8);
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
  const JEANS = '#1E3A8A';
  legs(ctx, -26, f, 0, JEANS, '#F8FAFC', false, colors);
  // The jeans' seat, sagged halfway to his knees; the belt slung under his boxers
  shaded(ctx, () => { ctx.moveTo(-10, -26); ctx.lineTo(10, -26); ctx.lineTo(10.4, -13); ctx.lineTo(1, -13); ctx.lineTo(0, -16); ctx.lineTo(-1, -13); ctx.lineTo(-10.4, -13); ctx.closePath(); }, JEANS, -10.4, -26, 20.8, 13);
  ctx.fillStyle = dark(JEANS, 0.35); ctx.fillRect(-9, -19, 7, 0.7); ctx.fillRect(3, -18, 6, 0.7); ctx.fillRect(-4, -15.6, 3, 0.7);
  ctx.fillStyle = lite(JEANS, 0.3); ctx.fillRect(5, -24, 0.8, 9); // a seam
  ink(ctx, () => ctx.rect(-10, -30, 20, 4.4), '#F8FAFC', 0.8); // (his boxers, showing)
  ctx.fillStyle = '#93C5FD'; for (let x = -8; x < 10; x += 4) ctx.fillRect(x, -29.6, 0.8, 3.6);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-10, -28.4, 20, 0.7);
  ink(ctx, () => ctx.rect(-10.6, -26.4, 21.2, 2), '#111827', 0.7);
  ink(ctx, () => ctx.rect(-1.6, -26.6, 3.4, 2.4), '#D1D5DB', 0.5);
  arm(ctx, -5, -50, -9, -33, colors, skin);
  // The hoodie: the kangaroo pocket, the ribbed hem, the drawstrings
  body(ctx, -13, -56, 26, 28, colors, () => {
    ctx.fillStyle = dark(colors, 0.22); ctx.beginPath(); ctx.moveTo(-7, -41); ctx.lineTo(7, -41); ctx.lineTo(9.5, -31); ctx.lineTo(-9.5, -31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark(colors, 0.45); ctx.fillRect(-7, -41, 14, 0.8); ctx.fillRect(-7.6, -40, 0.8, 7); ctx.fillRect(6.8, -40, 0.8, 7);
    ctx.fillStyle = dark(colors, 0.3); ctx.fillRect(-13, -31, 26, 3);
    ctx.fillStyle = dark(colors, 0.5); for (let x = -12; x < 13; x += 2) ctx.fillRect(x, -31, 0.7, 3);
    ctx.fillStyle = dark(colors, 0.35); ctx.fillRect(-13, -50, 26, 0.7); // (the hood bunched behind his neck)
  });
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-2.6, -55, 0.9, 8); ctx.fillRect(3, -55, 0.9, 6.4);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(-2.8, -47.4, 1.3, 1.6); ctx.fillRect(2.8, -49, 1.3, 1.6);
  // The chain, a cross on it
  chain(ctx, 1, -58, 7.4);
  ink(ctx, () => { ctx.rect(0.2, -52, 1.8, 6); ctx.rect(-1.4, -50.4, 5, 1.6); }, '#FACC15', 0.6);
  head(ctx, 2, -63, skin, 8, { brow: 'mad', mouth: 'none' });
  // The bandana over his face: paisley on it, the knot at the back
  const band = () => { ctx.moveTo(-5, -62.4); ctx.lineTo(10.6, -63); ctx.quadraticCurveTo(10.8, -58, 9, -57); ctx.lineTo(4, -53.6); ctx.lineTo(-5.4, -57.4); ctx.closePath(); };
  shaded(ctx, band, colors, -5.4, -63, 16.2, 9.4, 0.9);
  ctx.fillStyle = '#F8FAFC';
  for (const [x, y] of [[0, -60.6], [5, -61], [8, -59], [2.6, -57.4], [-3, -59]]) { ctx.fillRect(x, y, 1, 1); ctx.fillRect(x + 1, y + 1, 0.8, 0.8); }
  ctx.fillStyle = dark(colors, 0.3); ctx.fillRect(1, -62.4, 9, 0.7); // (over his nose)
  ink(ctx, () => { ctx.moveTo(-5.4, -61); ctx.lineTo(-10, -59); ctx.lineTo(-9, -56.6); ctx.lineTo(-5, -58.6); ctx.closePath(); }, dark(colors, 0.15), 0.7);
  // The hood up, framing his face
  const hood = () => { ctx.moveTo(-9.4, -54); ctx.lineTo(-10.4, -64); ctx.quadraticCurveTo(-9.6, -73.6, 1, -73.8); ctx.quadraticCurveTo(10.4, -73.6, 11.4, -66.4); ctx.lineTo(8.6, -67); ctx.quadraticCurveTo(2, -70.4, -2.6, -66); ctx.quadraticCurveTo(-5.4, -61, -4.4, -54); ctx.closePath(); };
  shaded(ctx, hood, '#111827', -10.4, -74, 21.8, 20);
  ctx.fillStyle = '#374151'; ctx.fillRect(-6, -72.4, 8, 1); ctx.fillRect(-8.6, -69, 1, 6);
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(8.4, -66.4); ctx.quadraticCurveTo(2, -69.4, -2, -65.4); ctx.stroke(); // (its lining, in shadow)
  // The arm out, the pistol turned flat on its side: the slide's top to us, the grip up out of his fist
  arm(ctx, 6, -50, 20, -45.4, colors, skin);
  ink(ctx, () => { ctx.moveTo(18.6, -47); ctx.lineTo(23, -47); ctx.lineTo(21.6, -53.4); ctx.lineTo(17.4, -53); ctx.closePath(); }, '#1F2937', 0.8);
  ctx.fillStyle = '#4B5563'; for (let y = -52; y < -47.6; y += 1.6) ctx.fillRect(18.4, y, 3, 0.6);
  shadedTop(ctx, () => ctx.rect(19, -47.6, 18.4, 4.6), '#1F2937', 19, -47.6, 18.4, 4.6, 0.8);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(20, -46.8, 15, 0.8);
  ctx.fillStyle = INK; for (let x = 23; x < 29; x += 1.6) ctx.fillRect(x, -45.6, 0.7, 2); // the serrations
  ctx.fillRect(36.6, -46, 0.8, 1.6);
  ink(ctx, () => ctx.roundRect(16.6, -48.6, 6, 5.6, 1.8), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.25); ctx.fillRect(17.4, -46.4, 4.4, 0.6);
  const c = charge(e);
  if (c > 0.6) glow(ctx, 40, -45, 2 + c * 3, c);
};

/** A bruiser: huge, a wife-beater, cornrows, an aluminum bat back over his shoulder, and he's coming. */
const drawBruiser = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, '#44403C', '#111827');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.22 : 0);
  const pump = running ? Math.sin(f * 0.45) * 4 : 0;
  // The back arm, a slab of it
  arm(ctx, -11, -30, -15, -9 - pump, skin, skin, false, 8.5);
  // The torso, the wife-beater stretched over it (the armholes cut deep, the neck scooped, a stain)
  const torso = () => { ctx.moveTo(-15, 0); ctx.lineTo(-16, -30); ctx.quadraticCurveTo(0, -40, 16, -30); ctx.lineTo(15, 0); ctx.closePath(); };
  shaded(ctx, torso, skin, -16, -36, 32, 36);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  const tank = () => {
    ctx.moveTo(-10, -37); ctx.lineTo(-6, -37); ctx.quadraticCurveTo(0, -23, 6, -37); ctx.lineTo(10, -37);
    ctx.quadraticCurveTo(10, -24, 17, -20); ctx.lineTo(17, 2); ctx.lineTo(-17, 2); ctx.lineTo(-17, -20); ctx.quadraticCurveTo(-10, -24, -10, -37); ctx.closePath();
  };
  shaded(ctx, tank, '#F8FAFC', -17, -37, 34, 39);
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.25)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-6, -17); ctx.quadraticCurveTo(0, -14, 5, -17); ctx.moveTo(-3, -8); ctx.lineTo(5, -8); ctx.moveTo(-3, -4); ctx.lineTo(5, -4); ctx.stroke();
  ctx.fillStyle = 'rgba(202, 138, 4, 0.35)'; ctx.beginPath(); ctx.ellipse(-4, -10, 3, 2, 0.4, 0, Math.PI * 2); ctx.fill(); // (a stain)
  ctx.restore();
  ctx.beginPath(); torso(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The belt over the top of his trousers
  shadedTop(ctx, () => ctx.rect(-15, -3, 30, 4), '#292524', -15, -3, 30, 4, 0.8);
  ink(ctx, () => ctx.rect(-2, -3.4, 4.4, 4.6), '#D1D5DB', 0.6);
  chain(ctx, 1, -32, 6, 0.3);
  head(ctx, 3, -44, skin, 9, { brow: 'mad', mouth: running ? 'grin' : 'frown' });
  // Cornrows: braided tight front to back over the scalp
  ctx.save(); ctx.beginPath(); ctx.ellipse(3, -44, 9, 9.72, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(-7, -46); ctx.lineTo(-7, -56); ctx.lineTo(14, -56); ctx.lineTo(12.4, -49.6); ctx.quadraticCurveTo(5, -51.4, -1, -47.6); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 3; k++) {
    const r = 8.4 - k * 2.6;
    ctx.strokeStyle = '#44403C'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(3, -44 + k * 0.6, r, Math.PI * 1.08, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = '#78716C';
    for (let a = Math.PI * 1.12; a < Math.PI * 1.88; a += 0.22) ctx.fillRect(3 + Math.cos(a) * r - 0.4, -44 + k * 0.6 + Math.sin(a) * r - 0.4, 0.8, 0.8);
  }
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(3, -44, 9, 9.72, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The bat: back over the shoulder, then swinging round as he closes; aluminum, taped at the grip
  const swing = running ? Math.sin(f * 0.35) * 0.4 : 0;
  ctx.save(); ctx.translate(8, -30); ctx.rotate(-2.3 + swing);
  limb(ctx, 0, 0, 12, 0, 7, skin);
  const bat = () => { ctx.moveTo(12, -1.5); ctx.lineTo(24, -1.6); ctx.quadraticCurveTo(29, -3.4, 40, -3.4); ctx.quadraticCurveTo(43, -3.4, 43, 0); ctx.quadraticCurveTo(43, 3.4, 40, 3.4); ctx.quadraticCurveTo(29, 3.4, 24, 1.6); ctx.lineTo(12, 1.5); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); bat(); ctx.clip();
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(10, -4, 34, 8);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(10, -4, 34, 2.8);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(28, -2.6, 12, 0.9);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(10, 1.6, 34, 3);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(10, -4, 9, 8); // the grip tape
  ctx.fillStyle = '#4B5563'; for (let x = 11; x < 19; x += 2) ctx.fillRect(x, -2, 0.7, 4);
  ctx.restore();
  ctx.beginPath(); bat(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  ink(ctx, () => ctx.ellipse(11.4, 0, 1.6, 2.8, 0, 0, Math.PI * 2), '#1F2937', 0.7); // the knob
  ink(ctx, () => ctx.roundRect(12.6, -3.8, 6, 7.6, 2.2), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.25); ctx.fillRect(14.4, -3, 0.6, 6);
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
const drawLowrider = (ctx: Ctx, e: Enemy, f: number, frame: number) => {
  const paint = pick(e, ['#9D174D', '#6D28D9', '#B91C1C', '#0F766E']);
  const aim = e.aiX === -1 ? -1 : 1;
  // (the hop, as its AI has it: the shadow left on the road, the body riding up off its wheels at the top)
  const hop = Math.abs(Math.sin(frame * 0.16 + (e.homeX || 0)));
  ctx.fillStyle = 'rgba(26, 11, 6, 0.28)'; ctx.fillRect(-70 + hop * 6, hop * 6 - 1.5, 140 - hop * 12, 3);
  ctx.fillStyle = 'rgba(26, 11, 6, 0.18)'; ctx.fillRect(-76 + hop * 6, hop * 6 - 1, 152 - hop * 12, 2);
  const lift = -hop * 2.5;
  // The wheel wells, dark; the hydraulic rams in them, chrome, stretched as it hops
  for (const wx of [-48, 48]) {
    ctx.fillStyle = '#0B0F19'; ctx.beginPath(); ctx.arc(wx, -14 + lift, 13, Math.PI, 0); ctx.fill();
    ink(ctx, () => ctx.rect(wx - 1.4, -24 + lift, 2.8, 13 - lift), '#D1D5DB', 0.6);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(wx - 0.8, -23 + lift, 0.8, 11 - lift);
  }
  // Wheels: fat whitewalls, the wire wheels' spokes crossing (turning), the chrome knock-off spinner
  for (const wx of [-48, 48]) {
    ink(ctx, () => ctx.arc(wx, -11, 11, 0, Math.PI * 2), '#111827', 1);
    ctx.fillStyle = '#374151'; ctx.beginPath(); ctx.arc(wx, -11, 10, Math.PI * 1.1, Math.PI * 1.6); ctx.lineTo(wx, -11); ctx.fill();
    ink(ctx, () => ctx.arc(wx, -11, 8.4, 0, Math.PI * 2), '#F8FAFC', 0.7);
    ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.arc(wx, -11, 8.4, 0.2, Math.PI - 0.2); ctx.arc(wx, -11, 6.6, Math.PI - 0.2, 0.2, true); ctx.fill();
    ink(ctx, () => ctx.arc(wx, -11, 6.6, 0, Math.PI * 2), '#9CA3AF', 0.7);
    ctx.lineWidth = 0.6;
    for (let k = 0; k < 12; k++) {
      const a = f * 0.4 + k * Math.PI / 6;
      ctx.strokeStyle = k % 2 ? '#F8FAFC' : '#6B7280';
      ctx.beginPath(); ctx.moveTo(wx + Math.cos(a + 0.5) * 1.8, -11 + Math.sin(a + 0.5) * 1.8); ctx.lineTo(wx + Math.cos(a) * 6.2, -11 + Math.sin(a) * 6.2); ctx.stroke();
    }
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(wx, -11, 5.8, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
    ink(ctx, () => ctx.arc(wx, -11, 2.2, 0, Math.PI * 2), '#E5E7EB', 0.6);
    const s = f * 0.4;
    ink(ctx, () => { ctx.moveTo(wx + Math.cos(s) * 4.4, -11 + Math.sin(s) * 4.4); ctx.lineTo(wx + Math.cos(s + 0.4) * 1.6, -11 + Math.sin(s + 0.4) * 1.6); ctx.lineTo(wx - Math.cos(s) * 4.4, -11 - Math.sin(s) * 4.4); ctx.lineTo(wx - Math.cos(s + 0.4) * 1.6, -11 - Math.sin(s + 0.4) * 1.6); ctx.closePath(); }, '#F1F5F9', 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(wx - 1, -12.4, 1, 1);
  }
  ctx.save(); ctx.translate(0, lift);
  // The body, long and low: the rear deck with its fins, the roof, the hood out front; arched over the wheels
  const car = () => {
    ctx.moveTo(-77, -15); ctx.lineTo(-77, -28); ctx.quadraticCurveTo(-76.6, -32.6, -71, -32); ctx.lineTo(-40, -32.6);
    ctx.lineTo(-31.4, -46); ctx.quadraticCurveTo(-29.6, -48.6, -25, -48.6); ctx.lineTo(26, -48.6); ctx.quadraticCurveTo(30.4, -48.6, 32.4, -46);
    ctx.lineTo(44, -33); ctx.lineTo(72, -31.4); ctx.quadraticCurveTo(76.6, -31, 77, -27); ctx.lineTo(77.6, -15);
    ctx.lineTo(61, -14); ctx.arc(48, -14, 13, 0, Math.PI, true); ctx.lineTo(-35, -14); ctx.arc(-48, -14, 13, 0, Math.PI, true); ctx.lineTo(-77, -15); ctx.closePath();
  };
  // Candy paint, in steps: lit along the shoulder and the roof, the flank, the shadow down the rocker; metal flake winking in it
  ctx.save(); ctx.beginPath(); car(); ctx.clip();
  ctx.fillStyle = paint; ctx.fillRect(-80, -50, 160, 40);
  ctx.fillStyle = lite(paint, 0.22); ctx.fillRect(-80, -50, 160, 4); ctx.fillRect(-80, -33, 160, 4);
  ctx.fillStyle = lite(paint, 0.42); ctx.fillRect(-80, -33, 160, 1.2); ctx.fillRect(-24, -48.6, 48, 1);
  ctx.fillStyle = dark(paint, 0.18); ctx.fillRect(-80, -22, 160, 4);
  ctx.fillStyle = dark(paint, 0.36); ctx.fillRect(-80, -18, 160, 8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'; // (the shine sliding along it, a diagonal pair)
  for (const x0 of [-52, 30]) { ctx.beginPath(); ctx.moveTo(x0, -50); ctx.lineTo(x0 + 6, -50); ctx.lineTo(x0 - 10, -10); ctx.lineTo(x0 - 16, -10); ctx.fill(); ctx.fillRect(x0 + 8, -50, 2, 40); }
  ctx.fillStyle = lite(paint, 0.6);
  for (let k = 0; k < 14; k++) { if ((k * 7 + Math.floor(f / 6)) % 5) continue; ctx.fillRect(-70 + ((k * 37) % 140), -30 + ((k * 13) % 14), 1, 1); }
  ctx.restore();
  ctx.beginPath(); car(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
  // Windows: smoked glass, a glint across, chrome round them
  const back = () => { ctx.moveTo(-28, -45.6); ctx.lineTo(-3, -45.6); ctx.lineTo(-3, -34.4); ctx.lineTo(-36.4, -34.4); ctx.closePath(); };
  const front = () => { ctx.moveTo(1, -45.6); ctx.lineTo(29.4, -45.6); ctx.lineTo(39.4, -34.4); ctx.lineTo(1, -34.4); ctx.closePath(); };
  for (const w of [back, front]) {
    ctx.save(); ctx.beginPath(); w(); ctx.clip();
    ctx.fillStyle = '#1E293B'; ctx.fillRect(-40, -46, 82, 12);
    ctx.fillStyle = '#334155'; ctx.fillRect(-40, -46, 82, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (const x0 of [-20, 12]) { ctx.beginPath(); ctx.moveTo(x0, -46); ctx.lineTo(x0 + 4, -46); ctx.lineTo(x0 - 4, -34); ctx.lineTo(x0 - 8, -34); ctx.fill(); }
    ctx.restore();
    ctx.beginPath(); w(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  // The doors' seams, the handles
  ctx.strokeStyle = dark(paint, 0.5); ctx.lineWidth = 0.8; ctx.beginPath();
  ctx.moveTo(-3, -33); ctx.lineTo(-3, -16); ctx.moveTo(-37, -32.4); ctx.lineTo(-36, -16); ctx.moveTo(38, -33); ctx.lineTo(37, -16); ctx.stroke();
  for (const x of [-10, 30]) { ink(ctx, () => ctx.rect(x, -30, 5, 1.6), '#E5E7EB', 0.5); }
  // A pinstripe down the flank, curling out at the front door
  ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-72, -27.4); ctx.lineTo(18, -27.4);
  ctx.quadraticCurveTo(25, -27.4, 26, -24); ctx.quadraticCurveTo(26, -21.6, 23.6, -22.4); ctx.moveTo(18, -27.4); ctx.quadraticCurveTo(24, -29.6, 28, -28); ctx.stroke();
  // Chrome: the spear down the side, the rocker, the bumpers, the grille
  shadedTop(ctx, () => ctx.rect(-75, -24.4, 150, 2.4), '#D1D5DB', -75, -24.4, 150, 2.4, 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-73, -24, 146, 0.7);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-35, -16.4, 70, 1.6); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-35, -15.2, 70, 0.6);
  for (const [x, w] of [[73.4, 6], [-80.4, 6]]) {
    shadedTop(ctx, () => ctx.roundRect(x, -21, w, 7.4, 1.6), '#D1D5DB', x, -21, w, 7.4, 0.9);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 1, -20.2, w - 2, 0.8);
  }
  ink(ctx, () => ctx.rect(74.6, -29.6, 2.8, 8), '#9CA3AF', 0.6);
  ctx.fillStyle = '#4B5563'; for (let y = -28.6; y < -22; y += 1.6) ctx.fillRect(74.8, y, 2.4, 0.6);
  // The lights: a headlight, the taillights in their fins
  glow(ctx, 77.4, -26.4, 1.6, 0.35);
  ink(ctx, () => ctx.ellipse(75.6, -26.4, 1.4, 2.2, 0, 0, Math.PI * 2), '#FDE68A', 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(75.2, -27.6, 0.8, 0.8);
  for (const y of [-29.6, -25.6]) { ink(ctx, () => ctx.roundRect(-78.4, y, 2.8, 3, 0.8), '#DC2626', 0.6); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-78, y + 0.5, 1, 0.8); }
  // The crew, leaning out toward him with their pistols
  for (const w of LOWRIDER_WINDOWS) {
    if (e.health <= 0 || e.isBlownAway) break;
    ctx.save(); ctx.translate(w.x, w.y); ctx.scale(aim, 1);
    gunman(ctx, pick(e, ['#DC2626', '#1D4ED8', '#F8FAFC']));
    ctx.restore();
  }
  ctx.restore();
  // Hydraulics hiss
  if (f % 40 < 3) {
    ctx.fillStyle = 'rgba(229, 231, 235, 0.45)'; ctx.beginPath(); ctx.arc(0, -4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(248, 250, 252, 0.7)'; ctx.beginPath(); ctx.arc(-3, -4, 4, 0, Math.PI * 2); ctx.arc(4, -6, 3, 0, Math.PI * 2); ctx.fill();
  }
};

/** One of a lowrider's crew out of it (thrown out: see gunDeaths.ts): his legs under him, his top half as in the window;
 * his feet at (x, feetY). */
export const drawCrewman = (ctx: Ctx, x: number, feetY: number, facing: 1 | -1, shirt: string) => {
  ctx.save(); ctx.translate(x, feetY); ctx.scale(facing, 1);
  legs(ctx, -20, 0, 0, '#1E3A8A', '#F8FAFC');
  ctx.translate(-1, -18);
  gunman(ctx, shirt);
  ctx.restore();
};

/** One of the crew in a lowrider's window: a tee in his colors, a cap on backwards, an arm out with a pistol. Facing right. */
const gunman = (ctx: Ctx, shirt: string) => {
  const skin = '#8D5524';
  body(ctx, -5, -14, 12, 14, shirt, () => { ctx.fillStyle = dark(shirt, 0.3); ctx.fillRect(-1, -14, 6, 1.4); }, [4, 4, 0, 0]);
  head(ctx, 4, -19.6, skin, 6.4, { brow: 'mad', mouth: 'grin' });
  // The cap, on backwards: the crown, the bill out over the back of his neck, the snap strap
  shaded(ctx, () => { ctx.ellipse(3.6, -21.6, 7, 4.8, 0, Math.PI, 0); ctx.closePath(); }, '#111827', -3.4, -26.4, 14, 5, 0.9);
  ink(ctx, () => ctx.roundRect(-6.6, -23, 5, 2, 0.8), '#111827', 0.8);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(1, -26, 4, 0.8);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(4.6, -22, 2, 0.8);
  // The arm out, the pistol
  arm(ctx, 3, -10, 16, -8, shirt, skin, true, 4.4);
  ink(ctx, () => { ctx.moveTo(16, -9); ctx.lineTo(19.4, -9); ctx.lineTo(19, -4); ctx.lineTo(15.4, -4); ctx.closePath(); }, '#1F2937', 0.7);
  shadedTop(ctx, () => ctx.rect(16, -12.2, 9, 3.4), '#1F2937', 16, -12.2, 9, 3.4, 0.7);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(17, -11.6, 6, 0.6);
  ink(ctx, () => ctx.roundRect(14.4, -10.2, 4, 3.8, 1.2), skin, 0.7);
};

// ---------------------------------------------------------------------------
// The sewer
// ---------------------------------------------------------------------------

/** Tommy's hazmat crew: a yellow suit, a gas mask with a big filter, a tank on the back, a spray wand of his muck. */
const drawHazmat = (ctx: Ctx, e: Enemy, f: number) => {
  const SUIT = '#FACC15', GLOVE = '#1C1917';
  legs(ctx, -28, f, 0, '#EAB308', GLOVE, true);
  for (const x of [-8, 2]) { ink(ctx, () => ctx.rect(x - 0.6, -10.4, 8.2, 2.6), '#9CA3AF', 0.6); ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x, -10, 7, 0.7); } // taped at the boots
  // The tank on his back: a gauge (green, full of it), the valve
  shaded(ctx, () => ctx.roundRect(-19, -55, 9, 26, 3), '#374151', -19, -55, 9, 26, 0.9);
  ink(ctx, () => ctx.rect(-16.4, -58, 4, 3), '#6B7280', 0.6);
  ink(ctx, () => ctx.arc(-14.5, -47, 2.8, 0, Math.PI * 2), '#65A30D', 0.7);
  ctx.fillStyle = '#D9F99D'; ctx.fillRect(-15.6, -48.4, 1.2, 1); ctx.fillStyle = INK; ctx.fillRect(-14.8, -47.6, 2.2, 0.7);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-19, -40, 9, 1); ctx.fillRect(-19, -34, 9, 1);
  // The hose, from the tank round under his arm to the wand
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14.5, -30); ctx.quadraticCurveTo(2, -16, 17, -41);
  ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.stroke(); ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineCap = 'butt';
  arm(ctx, -5, -51, -9, -34, SUIT, GLOVE);
  // The suit: the zip, the elastic at the waist puckering it, creases; Tommy's badge (the biohazard)
  body(ctx, -13, -58, 26, 32, SUIT, () => {
    ctx.fillStyle = dark(SUIT, 0.25); ctx.fillRect(-13, -40, 26, 2.4);
    ctx.fillStyle = dark(SUIT, 0.4); for (let x = -12; x < 13; x += 3) ctx.fillRect(x, -40.4, 0.7, 3.2);
    ctx.fillStyle = dark(SUIT, 0.35); ctx.fillRect(4.6, -56, 0.8, 30);
    ink(ctx, () => ctx.rect(4, -53.4, 2, 2.6), '#9CA3AF', 0.5);
    ctx.strokeStyle = dark(SUIT, 0.3); ctx.lineWidth = 0.7; ctx.beginPath();
    ctx.moveTo(-10, -34); ctx.lineTo(-6, -31); ctx.moveTo(8, -36); ctx.lineTo(11, -32); ctx.moveTo(-11, -52); ctx.lineTo(-8, -49); ctx.stroke();
  });
  ink(ctx, () => ctx.arc(-2, -48, 4, 0, Math.PI * 2), '#15803D', 0.8);
  ctx.fillStyle = '#BEF264';
  for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * 2.094; ctx.beginPath(); ctx.arc(-2 + Math.cos(a) * 1.6, -48 + Math.sin(a) * 1.6, 1.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.arc(-2, -48, 0.8, 0, Math.PI * 2); ctx.fill();
  // The hood: drawn tight, a seam over the crown
  shaded(ctx, () => ctx.arc(1, -66, 10, 0, Math.PI * 2), SUIT, -9, -76, 20, 20);
  ctx.strokeStyle = dark(SUIT, 0.35); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(1, -66, 7, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
  ctx.fillStyle = dark(SUIT, 0.3); ctx.fillRect(-6, -58, 12, 1); // (gathered at the neck)
  // The visor: smoked, green in it, a glint; his eyes just there behind it
  const visor = () => ctx.roundRect(0.4, -71, 12, 7.4, [1, 3, 3, 1]);
  ctx.save(); ctx.beginPath(); visor(); ctx.clip();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(0, -72, 13, 9);
  ctx.fillStyle = 'rgba(163, 230, 53, 0.35)'; ctx.fillRect(0, -69.4, 13, 3);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.55)'; ctx.fillRect(4, -68, 1.4, 1.2); ctx.fillRect(8.6, -68, 1.4, 1.2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.beginPath(); ctx.moveTo(5, -72); ctx.lineTo(8, -72); ctx.lineTo(4, -63); ctx.lineTo(1, -63); ctx.fill();
  ctx.restore();
  ctx.beginPath(); visor(); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke(); ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 0.6; ctx.stroke();
  // The mask's snout, the filter on it: ridged, holed
  ink(ctx, () => ctx.roundRect(3.6, -64.4, 6, 5.4, 2), '#4B5563', 0.8);
  shadedTop(ctx, () => ctx.arc(10, -60, 4.5, 0, Math.PI * 2), '#374151', 5.5, -64.5, 9, 9, 0.9);
  ink(ctx, () => ctx.arc(10, -60, 2.8, 0, Math.PI * 2), '#1F2937', 0.6);
  ctx.fillStyle = '#9CA3AF'; for (const [a, b] of [[-1, -1], [1, -1], [0, 0.4], [-1, 1.6], [1, 1.6]]) ctx.fillRect(10 + a - 0.4, -60 + b - 0.6, 0.8, 0.8);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(7, -63.6, 4, 0.8);
  // The wand: the pipe, its pistol grip, the nozzle (dribbling)
  shadedTop(ctx, () => ctx.rect(15, -45.6, 18, 3.2), '#4B5563', 15, -45.6, 18, 3.2, 0.8);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(16, -45, 15, 0.7);
  ink(ctx, () => { ctx.moveTo(32, -46.4); ctx.lineTo(36, -47.4); ctx.lineTo(36, -41.6); ctx.lineTo(32, -42.6); ctx.closePath(); }, '#6B7280', 0.7);
  ink(ctx, () => { ctx.moveTo(14, -43); ctx.lineTo(18, -43); ctx.lineTo(17, -37); ctx.lineTo(13.4, -37.6); ctx.closePath(); }, '#1F2937', 0.7);
  if (f % 60 < 24) { const d = (f % 60) / 6; ink(ctx, () => ctx.ellipse(35, -41 + d, 1, 1.4, 0, 0, Math.PI * 2), '#84CC16', 0.5); }
  arm(ctx, 5, -51, 14, -43, SUIT, GLOVE, false, 5.5);
  const c = charge(e);
  if (c > 0.4) glow(ctx, 37, -44.4, 2 + c * 4, c, '132, 204, 22');
};

/** A bloater: a sewer worker who's been down here too long. Swollen grey-green, his orange overalls splitting, boils, drool. */
const drawBloater = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const wob = Math.sin(f * 0.3) * (running ? 2 : 1);
  const FLESH = '#84A98C', OVERALL = '#EA580C';
  legs(ctx, -24, f * (running ? 1.3 : 0.5), running ? 6 : 1, OVERALL, '#1C1917', true);
  ctx.save(); ctx.translate(0, -24); ctx.rotate(running ? 0.18 : 0);
  // The far arm out, grabbing, behind the gut
  const hand = (x: number, y: number, c: string) => {
    ink(ctx, () => ctx.ellipse(x, y, 4.2, 3.8, 0, 0, Math.PI * 2), c, 0.8);
    for (const d of [-2.4, 0, 2.4]) ink(ctx, () => ctx.roundRect(x + 2.6, y + d - 1, 3.4, 2, 1), c, 0.6);
  };
  arm(ctx, 14, -31 + wob, 33, -31 + wob, dark(FLESH, 0.15), dark(FLESH, 0.15), false, 7, dark(FLESH, 0.15));
  hand(34, -31 + wob, dark(FLESH, 0.15));
  // The gut: swollen, rolls in it, veins; the overalls splitting over it (the seam gone, threads), the straps and their brass
  const gut = () => ctx.ellipse(0, -24, 26 + wob, 26 - wob, 0, 0, Math.PI * 2);
  shaded(ctx, gut, FLESH, -27 - wob, -50 + wob, 54 + wob * 2, 52 - wob * 2, 1.2);
  ctx.save(); ctx.beginPath(); gut(); ctx.clip();
  ctx.strokeStyle = 'rgba(88, 28, 135, 0.35)'; ctx.lineWidth = 0.7; ctx.beginPath();
  ctx.moveTo(-18, -40); ctx.lineTo(-14, -36); ctx.lineTo(-15, -31); ctx.moveTo(14, -44); ctx.lineTo(10, -41); ctx.lineTo(11, -37); ctx.stroke();
  ctx.strokeStyle = dark(FLESH, 0.3); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(2, -46, 14, 0.4, Math.PI - 0.4); ctx.stroke(); // a roll
  shaded(ctx, () => ctx.rect(-30, -15, 60, 17), OVERALL, -30, -15, 60, 17);
  for (const x of [-12, 6]) {
    shaded(ctx, () => ctx.rect(x, -36, 6, 22), OVERALL, x, -36, 6, 22, 0.9);
    ink(ctx, () => ctx.arc(x + 3, -16.4, 1.6, 0, Math.PI * 2), '#FBBF24', 0.6);
  }
  ctx.fillStyle = dark(OVERALL, 0.35); ctx.fillRect(-30, -12, 60, 0.7); ctx.fillRect(-18, -7, 8, 0.7);
  ctx.restore();
  ctx.beginPath(); gut(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  ink(ctx, () => ctx.ellipse(0, -10.4, 5, 4, 0, 0, Math.PI * 2), FLESH, 0.8); // (splitting at the seam)
  ctx.fillStyle = lite(FLESH, 0.25); ctx.fillRect(-3, -13, 3, 1);
  ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 0.5; ctx.beginPath();
  for (const y of [-12.4, -10, -7.6]) { ctx.moveTo(-5.6, y); ctx.lineTo(-3.6, y + 0.6); ctx.moveTo(5.6, y); ctx.lineTo(3.6, y + 0.6); }
  ctx.stroke();
  // Boils: risen, shining, one weeping
  for (const [bx, by, r] of [[-14, -30, 4], [12, -38, 3], [18, -22, 5], [-6, -44, 3]]) {
    ink(ctx, () => ctx.arc(bx, by, r, 0, Math.PI * 2), '#D9F99D', 0.8);
    ctx.fillStyle = '#A3E635'; ctx.beginPath(); ctx.arc(bx + r * 0.25, by + r * 0.25, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(bx - r * 0.5, by - r * 0.6, Math.max(1, r * 0.4), 1);
  }
  ink(ctx, () => { ctx.moveTo(17, -17); ctx.lineTo(19, -17); ctx.lineTo(18.6, -13 + (f % 30) / 10); ctx.lineTo(17.4, -13 + (f % 30) / 10); ctx.closePath(); }, '#BEF264', 0.5);
  // Head, sunk into it: the chins, a few hairs, one eye bulging and one gone lazy, the mouth hung open, drool
  const hd = '#6B8F71';
  shaded(ctx, () => ctx.arc(6, -50, 9, 0, Math.PI * 2), hd, -3, -59, 18, 18);
  ctx.strokeStyle = dark(hd, 0.35); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(7, -45, 6.4, 0.3, Math.PI - 0.6); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(3, -59); ctx.quadraticCurveTo(2, -63, 5, -64); ctx.moveTo(6, -59); ctx.quadraticCurveTo(7, -62, 9, -62); ctx.stroke();
  ink(ctx, () => ctx.ellipse(-0.6, -49, 1.6, 2.4, 0, 0, Math.PI * 2), dark(hd, 0.2), 0.6);
  eye(ctx, 11, -52.6, 2.4, 0.5, 0.2, '#FEF08A');
  ink(ctx, () => ctx.ellipse(5.4, -52.4, 1.6, 1.3, 0, 0, Math.PI * 2), '#FEF08A', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(5, -52.2, 1, 1); ctx.fillStyle = dark(hd, 0.2); ctx.fillRect(3.6, -54, 3.6, 1.2); // (the lid down)
  ink(ctx, () => ctx.roundRect(7.4, -47, 7.6, 4, [1, 2, 2, 1]), '#1C1917', 0.7);
  ctx.fillStyle = '#FEF3C7'; ctx.fillRect(9, -47, 1.4, 1.2); ctx.fillRect(12.4, -47, 1.2, 1);
  const drool = 4 + (f % 20) / 4;
  ink(ctx, () => { ctx.moveTo(12, -43.4); ctx.lineTo(14, -43.4); ctx.lineTo(13.6, -43 + drool); ctx.arc(13, -43 + drool, 0.8, 0, Math.PI); ctx.closePath(); }, 'rgba(163, 230, 53, 0.85)', 0.5);
  // The near arm out, grabbing
  arm(ctx, 13, -21 - wob, 31, -21 - wob, FLESH, FLESH, false, 7.4);
  hand(32, -21 - wob, FLESH);
  ctx.restore();
};

/** A sewer crew man: orange vest, a hard hat, a manhole cover for a shield (FLINT on it), a pipe wrench to throw. */
const drawManhole = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), VEST = '#F97316', TEE = '#374151', IRON = '#57534E';
  legs(ctx, -28, f, 0, '#1E3A8A', '#78350F', true);
  ink(ctx, () => ctx.rect(-10.6, -30, 21.2, 3), '#292524', 0.7); // (his belt)
  if (!e.isShieldActive) {
    // The cover down at his side, stood on its edge: the rim, a sliver of its face
    ink(ctx, () => ctx.ellipse(-16, -20, 6, 18, 0, 0, Math.PI * 2), '#44403C', 1);
    ctx.save(); ctx.beginPath(); ctx.ellipse(-15, -20, 4, 16, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = IRON; ctx.fillRect(-20, -37, 10, 34);
    ctx.fillStyle = dark(IRON, 0.35); for (let y = -33; y < -6; y += 4) ctx.fillRect(-19, y, 8, 1.2);
    ctx.fillStyle = lite(IRON, 0.25); ctx.fillRect(-18, -34, 1, 26);
    ctx.restore();
    arm(ctx, -6, -51, -14, -36, TEE, skin, true);
  } else arm(ctx, -5, -51, -9, -34, TEE, skin, true);
  // The hi-vis vest over a tee: the reflective bands (a silver strip down each), the radio clipped on
  body(ctx, -13, -56, 26, 30, VEST, () => {
    for (const y of [-46, -38]) {
      ctx.fillStyle = '#FDE047'; ctx.fillRect(-13, y, 26, 3);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-13, y + 1, 26, 1);
      ctx.fillStyle = dark('#FDE047', 0.25); ctx.fillRect(-13, y + 2.4, 26, 0.6);
    }
    ctx.fillStyle = TEE; ctx.beginPath(); ctx.moveTo(-4, -56); ctx.lineTo(1, -49); ctx.lineTo(6, -56); ctx.fill(); // (the tee at the neck)
    ctx.fillStyle = dark(VEST, 0.35); ctx.fillRect(1, -49, 0.8, 23);
  });
  ink(ctx, () => ctx.roundRect(-10, -54, 4, 6, 1), '#111827', 0.7);
  ctx.fillStyle = '#111827'; ctx.fillRect(-9.4, -57.6, 0.8, 3.6); ctx.fillStyle = '#EF4444'; ctx.fillRect(-9, -52.6, 1, 1);
  head(ctx, 2, -63, skin, 8, { brow: 'mad', mouth: 'frown', tint: 'rgba(26, 11, 6, 0.12)' });
  ink(ctx, () => ctx.roundRect(3, -60.4, 7, 2.2, 1), '#44403C', 0.7); ctx.fillStyle = '#78716C'; ctx.fillRect(4, -60, 4, 0.6); // the mustache
  // The hard hat: the dome, the ridge over it, the brim; a sticker
  shaded(ctx, () => { ctx.arc(1, -67, 10, Math.PI, 0); ctx.closePath(); }, '#FACC15', -9, -77, 20, 10);
  ctx.fillStyle = lite('#FACC15', 0.4); ctx.fillRect(-3, -76, 6, 1);
  ctx.strokeStyle = dark('#FACC15', 0.3); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(1, -67, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  shadedTop(ctx, () => ctx.roundRect(-11, -68.4, 25, 3, 1.2), '#EAB308', -11, -68.4, 25, 3, 0.8);
  ink(ctx, () => ctx.rect(-5, -72, 3.6, 2.6), '#15803D', 0.5);
  if (e.isShieldActive) {
    // The cover held up in front of him: cast iron, the rim, the grid of it, FLINT cast across it; rust
    arm(ctx, 5, -51, 12, -44, TEE, skin, true);
    const cover = () => ctx.arc(18, -40, 22, 0, Math.PI * 2);
    shaded(ctx, cover, '#44403C', -4, -62, 44, 44, 1.2);
    ctx.save(); ctx.beginPath(); ctx.arc(18, -40, 19, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = IRON; ctx.fillRect(-1, -59, 38, 38);
    ctx.fillStyle = dark(IRON, 0.4);
    for (let k = -16; k <= 16; k += 5) { ctx.fillRect(18 + k, -59, 1.4, 38); ctx.fillRect(-1, -40 + k, 38, 1.4); }
    ctx.fillStyle = lite(IRON, 0.25);
    for (let k = -16; k <= 16; k += 5) { ctx.fillRect(18 + k - 0.8, -59, 0.8, 38); ctx.fillRect(-1, -40 + k - 0.8, 38, 0.8); }
    ctx.fillStyle = 'rgba(180, 83, 9, 0.45)'; ctx.beginPath(); ctx.ellipse(10, -30, 5, 3, 0.4, 0, Math.PI * 2); ctx.ellipse(27, -50, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.beginPath(); ctx.arc(18, -40, 19, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.strokeStyle = lite('#44403C', 0.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(18, -40, 20.6, Math.PI * 0.95, Math.PI * 1.55); ctx.stroke();
    shadedTop(ctx, () => ctx.rect(2, -44.4, 32, 8), '#44403C', 2, -44.4, 32, 8, 0.8);
    ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillStyle = INK; ctx.fillText('FLINT', 18.6, -37.4);
    ctx.fillStyle = '#A8A29E'; ctx.fillText('FLINT', 18, -38); ctx.textAlign = 'left';
    for (const x of [8, 28]) { ctx.fillStyle = '#1C1917'; ctx.fillRect(x, -55, 2.4, 1.2); } // the pick holes
    // His fingers over its rim
    for (const x of [9, 12.4]) ink(ctx, () => ctx.roundRect(x, -61.6, 3, 4, 1.2), skin, 0.6);
  } else {
    // Winding up with the pipe wrench: the I-beam handle, the knurled nut, the hook jaw and its teeth
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const hx = -3 - wind * 12, hy = -60;
    arm(ctx, 1, -51, hx, hy + 1, TEE, skin, true);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.8);
    shaded(ctx, () => ctx.roundRect(-2, -13, 4, 16, 1), '#6B7280', -2, -13, 4, 16, 0.8);
    ctx.fillStyle = dark('#6B7280', 0.35); ctx.fillRect(-0.4, -12, 0.8, 14);
    ink(ctx, () => ctx.rect(-2.6, -15, 5.2, 2.6), '#9CA3AF', 0.6);
    ctx.fillStyle = '#4B5563'; for (let x = -2; x < 2.4; x += 1.2) ctx.fillRect(x, -14.6, 0.5, 1.8);
    ink(ctx, () => { ctx.moveTo(-4, -15); ctx.lineTo(4, -15); ctx.lineTo(4, -19); ctx.lineTo(-1.6, -19); ctx.lineTo(-1.6, -17.4); ctx.lineTo(-4, -17.4); ctx.closePath(); }, '#9CA3AF', 0.8);
    ink(ctx, () => { ctx.moveTo(-4, -21); ctx.lineTo(4, -21); ctx.lineTo(4, -23); ctx.lineTo(-3, -23); ctx.closePath(); ctx.moveTo(2, -21); ctx.lineTo(4, -21); ctx.lineTo(4, -19); ctx.lineTo(2, -19); ctx.closePath(); }, '#9CA3AF', 0.8);
    ctx.fillStyle = INK; for (let x = -3; x < 2; x += 1.4) { ctx.fillRect(x, -19.6, 0.7, 0.7); ctx.fillRect(x + 0.6, -21.2, 0.7, 0.7); }
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-3.4, -22.6, 4, 0.6);
    ink(ctx, () => ctx.roundRect(-3, -2.4, 6, 5, 1.6), skin, 0.8);
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
