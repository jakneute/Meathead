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
// (Drawn the townsfolk's way, like Barry's goons: an ink line round every part, each part shaded in steps, a face with
// eyes and brows and a mouth that does something, hands, feet with something on them or not.)

type Feet = 'shoe' | 'boot' | 'bare' | 'sandal';

/**
 * Two legs from the hips at hipY: bare below shorts (or in trousers all the way, `long`), and on the end of them
 * soled shoes, boots, bare feet or socks and sandals. Striding when `stride` is up.
 */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, skin: string, shorts: string, feet: Feet, shoe = '#111827', long = false) => {
  const s = Math.sin(f * 0.25) * stride;
  const knee = hipY + 12, top = long ? hipY : knee - 1;
  for (const x of [-8 + s, 2 - s]) {
    const leg = long ? shorts : skin;
    shaded(ctx, () => ctx.rect(x, top, 7, -top - 4), leg, x, top, 7, -top - 4);
    if (feet === 'bare') {
      ink(ctx, () => ctx.roundRect(x - 0.5, -4, 9.5, 4, [2, 2.6, 0.6, 0.6]), skin, 0.9);
      ctx.fillStyle = dark(skin, 0.3); ctx.fillRect(x + 6, -1.6, 0.7, 1.4); ctx.fillRect(x + 7.6, -1.6, 0.7, 1.4);
    } else if (feet === 'sandal') {
      // White socks pulled up, the sandal's straps and sole under them
      ink(ctx, () => ctx.rect(x + 0.5, -10, 6, 6.5), shoe, 0.8);
      ink(ctx, () => ctx.roundRect(x - 1, -5, 10, 4, [2, 2.6, 0.6, 0.6]), shoe, 0.9);
      ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 4.6, -9.6, 1.4, 5); ctx.fillRect(x + 0.6, -3, 7.4, 0.8);
      ink(ctx, () => ctx.rect(x + 1, -4.6, 6, 1.4), '#92400E', 0.6);
      ink(ctx, () => ctx.rect(x - 1.4, -1.6, 11, 1.6), '#78350F', 0.7);
    } else {
      const h = feet === 'boot' ? 8 : 5;
      ink(ctx, () => ctx.roundRect(x - 1, -h, 10, h, feet === 'boot' ? [1.5, 3, 1, 1] : [2.5, 3, 1, 1]), shoe, 1);
      ctx.fillStyle = lite(shoe, 0.35); ctx.fillRect(x, -h + 0.6, 3, 1);
      ctx.fillStyle = lite(shoe, 0.55); ctx.fillRect(x - 1, -1, 10, 1);
      if (feet === 'boot') { ctx.fillStyle = dark(shoe, 0.4); ctx.fillRect(x - 0.4, -5, 9, 0.7); }
    }
  }
  if (long) return;
  // The shorts, split at the crotch, a hem
  shaded(ctx, () => { ctx.moveTo(-10, hipY); ctx.lineTo(10, hipY); ctx.lineTo(10.6, knee); ctx.lineTo(1, knee); ctx.lineTo(0, knee - 3.5); ctx.lineTo(-1, knee); ctx.lineTo(-10.6, knee); ctx.closePath(); },
    shorts, -10.6, hipY, 21.2, 12);
  ctx.fillStyle = dark(shorts, 0.3); ctx.fillRect(-10, knee - 2, 9.6, 0.8); ctx.fillRect(1.4, knee - 2, 8.8, 0.8);
};

/** A body (a shirt, a vest): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
const body = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, detail?: () => void, r: number | number[] = [5, 5, 2, 2]) => {
  const path = () => ctx.roundRect(x, y, w, h, r);
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

type Mouth = 'flat' | 'smile' | 'grin' | 'frown' | 'open' | 'gag';
interface Face { mouth?: Mouth; brow?: 'flat' | 'mad' | 'up'; eyes?: boolean; tint?: string; shine?: boolean }

/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, eyes and brows, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, o: Face = {}) => {
  const sd = dark(skin, 0.2);
  ink(ctx, () => ctx.rect(x - 2.4, y + r - 2, 4.8, 5), sd, 0.8);
  const skull = () => ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 2.2);
  ctx.fillStyle = sd; ctx.fillRect(x - r, y - r * 1.1, r * 0.55, r * 2.2);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(x + r * 0.2, y - r * 0.85, r * 0.5, r * 0.45);
  if (o.shine) { ctx.fillStyle = lite(skin, 0.45); ctx.fillRect(x - r * 0.3, y - r * 0.98, r * 0.6, 1.4); ctx.fillRect(x - r * 0.1, y - r * 0.8, 1.4, 1.2); }
  if (o.tint) { ctx.fillStyle = o.tint; ctx.fillRect(x - r, y - r * 0.4, r * 2, r * 1.5); }
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(x - r + 2.4, y + 1, 1.8, 2.4, 0, 0, Math.PI * 2), sd, 0.7);
  const ey = y - 1, scared = o.brow === 'up';
  if (o.eyes !== false) {
    for (const [ex, back] of [[x + 1, true], [x + 5.5, false]] as const) {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - (scared ? 2 : 1.5), 3, scared ? 3.8 : 3);
      ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
      if (o.brow === 'mad') { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
      else ctx.fillRect(ex - 1.5, ey - (scared ? 5 : 3.6), 3, 1);
    }
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  // (the mouth)
  const mx = x + 3.4, my = y + r * 0.62;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (o.mouth ?? 'flat') {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'smile': ctx.beginPath(); ctx.arc(mx, my - 1.4, 2.4, 0.4, Math.PI - 0.4); ctx.stroke(); break;
    case 'frown': ctx.beginPath(); ctx.arc(mx, my + 1.8, 2.4, Math.PI + 0.3, -0.3); ctx.stroke(); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'open': ink(ctx, () => ctx.ellipse(mx, my + 0.6, 2.6, 2.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.7); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 1.6, my - 1.8, 3.2, 0.9); break;
    case 'gag':
      ink(ctx, () => ctx.ellipse(mx - 0.4, my + 0.4, 3, 1.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.7);
      ink(ctx, () => ctx.ellipse(mx + 0.6, my + 2, 1.6, 1.8, 0, 0, Math.PI * 2), '#F472B6', 0.6); // (tongue out)
      break;
  }
};

/** Hair over the top of a head at (x, y), r its size: inked, a lit streak. */
const hairCap = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ink(ctx, () => { ctx.ellipse(x - 0.6, y - r * 0.35, r + 0.6, r * 0.82, 0, Math.PI * 1.02, Math.PI * 2.06); ctx.lineTo(x + r - 2, y - r * 0.3); ctx.closePath(); }, color, 1);
  ctx.fillStyle = lite(color, 0.3); ctx.fillRect(x - 3, y - r * 0.95, 5, 1.2);
};

/** Shades across the eyes of a head at (x, y): a wraparound pair, two glints, the arm back to the ear. */
const shades = (ctx: Ctx, x: number, y: number, color = '#111827') => {
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 1, y - 2); ctx.lineTo(x - 5, y - 1); ctx.stroke();
  ink(ctx, () => ctx.roundRect(x - 1, y - 3.6, 10.5, 3.8, [0.6, 1.6, 1.8, 0.8]), color, 0.8);
  ctx.fillStyle = lite(color, 0.35); ctx.fillRect(x - 0.4, y - 3, 9.4, 0.8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(x + 1, y - 2.6, 2, 0.8); ctx.fillRect(x + 6, y - 2.6, 2, 0.8);
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy): sleeved all the way (or short-sleeved), the hand (`hand` its colour). */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, short = false, w = 5.5, hand = skin) => {
  limb(ctx, sx, sy, hx, hy, w, short ? skin : sleeve);
  if (short) limb(ctx, sx, sy, sx + (hx - sx) * 0.4, sy + (hy - sy) * 0.4, w + 0.6, sleeve);
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), hand, 0.8);
};

/** A stepped glow (the muzzle about to go): an outer ring, a hot middle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, a: number) => {
  ctx.fillStyle = `rgba(254, 240, 138, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(254, 240, 138, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** The gun arm: out in front from the shoulder (sy its height), the fist round a pistol's grip, glowing at the muzzle before it fires. */
const gunArm = (ctx: Ctx, e: Enemy, sy: number, sleeve: string, skin: string, metal: string, short = false) => {
  const x = 16, y = sy + 8;
  arm(ctx, 6, sy, x, y + 1, sleeve, skin, short);
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 5.4, y + 7); ctx.lineTo(x - 0.8, y + 7); ctx.closePath(); }, dark(metal, 0.2), 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x + 8, y + 1.2, 2, 0, Math.PI); ctx.stroke(); // the trigger guard
  shadedTop(ctx, () => ctx.rect(x, y - 3, 16, 4.4), metal, x, y - 3, 16, 4.4, 0.8);
  ctx.fillStyle = lite(metal, 0.5); ctx.fillRect(x + 1, y - 2.3, 12, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(x + 14, y - 4, 1.4, 1); ctx.fillRect(x + 15.2, y - 1.6, 0.8, 1.4);
  ink(ctx, () => ctx.roundRect(x - 1.8, y - 0.4, 5, 4.6, 1.6), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(x - 1, y + 1.6, 3.4, 0.6);
  const c = Math.max(0, (e.shootTimer - 40) / 20);
  if (c > 0.6) glow(ctx, x + 19, y - 1, 2 + c * 3, c);
};

/** A goon in a Hawaiian shirt, bucket hat, zinc on his nose, fanny pack, socks with sandals and a chrome pistol. */
const drawTourist = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = SKIN[0], SHIRT = '#F97316';
  legs(ctx, -28, f, 0, skin, '#78716C', 'sandal', '#F8FAFC');
  arm(ctx, -5, -50, -9, -33, SHIRT, skin, true);
  // The loud shirt: hibiscus and leaves, buttoned down the front
  body(ctx, -11, -54, 22, 28, SHIRT, () => {
    for (const [x, y] of [[-5, -38], [8, -32]]) {
      ctx.fillStyle = '#16A34A'; ctx.beginPath(); ctx.ellipse(x + 3, y + 2, 3, 1.3, 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#16A34A'; for (const [x, y] of [[-3, -51], [6, -43], [-10, -30]]) { ctx.beginPath(); ctx.ellipse(x, y, 3, 1.3, -0.5, 0, Math.PI * 2); ctx.fill(); }
    for (const [x, y] of [[-7, -47], [3, -46], [-4, -38], [8, -32], [-8, -30]]) {
      ctx.fillStyle = '#FDE047'; for (let k = 0; k < 5; k++) { const a = k * 1.257; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 1.8, y + Math.sin(a) * 1.8, 1.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
    }
    ctx.fillStyle = dark(SHIRT, 0.35); ctx.fillRect(0.6, -50, 0.8, 24);
    ctx.fillStyle = '#FEF3C7'; for (let y = -48; y < -30; y += 6) ctx.fillRect(1.8, y, 1.4, 1.4);
    ctx.fillStyle = dark(SHIRT, 0.3); ctx.beginPath(); ctx.moveTo(-4, -54); ctx.lineTo(0.6, -48); ctx.lineTo(-6, -51); ctx.fill(); // the collar, open
  });
  // The fanny pack, its zip, its buckle
  shaded(ctx, () => ctx.roundRect(-10, -30, 20, 6, 2), '#1F2937', -10, -30, 20, 6);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-8, -28.4, 15, 0.7);
  ink(ctx, () => ctx.rect(-12, -28.6, 3, 2.4), '#111827', 0.6);
  // A camera round his neck on its strap
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-3, -54); ctx.lineTo(4, -46); ctx.moveTo(4, -54); ctx.lineTo(5, -47); ctx.stroke();
  shaded(ctx, () => ctx.roundRect(1, -48, 9, 6, 1), '#374151', 1, -48, 9, 6, 0.8);
  ink(ctx, () => ctx.arc(6, -45, 2.1, 0, Math.PI * 2), '#111827', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(5.4, -46, 1.2, 1.2);
  head(ctx, 2, -60, skin, 8, { mouth: 'grin', eyes: false, tint: 'rgba(239, 68, 68, 0.18)' });
  ink(ctx, () => ctx.roundRect(6.6, -60.4, 3.6, 3, 1), '#F8FAFC', 0.6); // zinc on the nose
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(-6, -64, 3, 4); ctx.fillRect(-5, -60, 2, 2); // hair out under the hat
  shades(ctx, 2, -61);
  // The bucket hat: the brim turned down, the crown, a band
  shaded(ctx, () => { ctx.moveTo(-12, -62); ctx.quadraticCurveTo(-8, -67, -6, -66.5); ctx.lineTo(10, -66.5); ctx.quadraticCurveTo(13, -67, 16, -62); ctx.quadraticCurveTo(2, -64.6, -12, -62); ctx.closePath(); },
    '#D6D3D1', -12, -67, 28, 5);
  shaded(ctx, () => ctx.roundRect(-6, -73, 16, 7, [4, 4, 0, 0]), '#D6D3D1', -6, -73, 16, 7);
  ink(ctx, () => ctx.rect(-6, -68.6, 16, 2), '#A8A29E', 0.6);
  gunArm(ctx, e, -51, SHIRT, skin, '#E5E7EB', true);
};

/** A nightclub bouncer: bald, shades, earpiece, gold chains, a tank top stretched over a lot of man. */
const drawBouncer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = SKIN[2];
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, skin, '#111827', 'shoe');
  ctx.save();
  ctx.translate(0, -28);
  ctx.rotate(running ? 0.25 : 0);
  const pump = running ? Math.sin(f * 0.45) * 4 : 0;
  // The back arm, a slab of it
  arm(ctx, -10, -30, -15, -10 - pump, skin, skin, false, 9);
  // The torso, the tank top over it (the armholes cut deep, the neck scooped)
  const torso = () => { ctx.moveTo(-15, 0); ctx.lineTo(-16, -32); ctx.quadraticCurveTo(0, -42, 16, -32); ctx.lineTo(15, 0); ctx.closePath(); };
  shaded(ctx, torso, skin, -16, -42, 32, 42);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  const tank = () => {
    ctx.moveTo(-10, -40); ctx.lineTo(-6, -40); ctx.quadraticCurveTo(1, -26, 8, -40); ctx.lineTo(11, -39);
    ctx.quadraticCurveTo(10, -26, 17, -22); ctx.lineTo(17, 2); ctx.lineTo(-17, 2); ctx.lineTo(-17, -22); ctx.quadraticCurveTo(-11, -28, -10, -40); ctx.closePath();
  };
  shaded(ctx, tank, '#F8FAFC', -17, -40, 34, 42);
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.25)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-6, -18); ctx.quadraticCurveTo(0, -15, 5, -18); ctx.moveTo(-3, -9); ctx.lineTo(5, -9); ctx.moveTo(-3, -5); ctx.lineTo(5, -5); ctx.stroke(); // stretched over the pecs, the gut
  ctx.restore();
  ctx.beginPath(); torso(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // Gold chains, a medallion
  for (const [r, a] of [[8, 0.2], [11, 0.3]]) {
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(2, -34 + (r - 8) * 0.6, r, a, Math.PI - a);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  }
  ink(ctx, () => ctx.roundRect(0, -22, 4, 4.6, 1), '#FACC15', 0.8);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(0.8, -21.2, 1.2, 1.2);
  // Bald head, shades, the earpiece and its coiled wire
  head(ctx, 4, -44, skin, 9.5, { brow: 'mad', mouth: 'frown', eyes: false, shine: true });
  shades(ctx, 4.4, -44.4);
  ink(ctx, () => ctx.arc(-3, -43, 1.4, 0, Math.PI * 2), '#E5E7EB', 0.6);
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3, -41.6);
  for (let k = 1; k <= 6; k++) ctx.lineTo(-3 + (k % 2 ? -1.2 : 1.2) - k * 0.2, -41.6 + k * 1.5);
  ctx.stroke();
  // The front arm: the bicep bulging, the fist
  arm(ctx, 11, -30, 21, -10 + pump, skin, skin, false, 9);
  ink(ctx, () => ctx.ellipse(14.6, -24, 5.4, 6.6, -0.4, 0, Math.PI * 2), skin, 0.8);
  ctx.fillStyle = lite(skin, 0.2); ctx.fillRect(12, -28, 2, 4);
  ink(ctx, () => ctx.roundRect(18, -14 + pump, 8, 8, 2.4), skin, 0.9);
  ctx.fillStyle = dark(skin, 0.3); ctx.fillRect(19, -11 + pump, 6, 0.7); ctx.fillRect(22, -13 + pump, 0.7, 2);
  ctx.restore();
};

/** A surfboard (nose up) at (x, y), w by h: shaded, the stringer and a stripe, a fin; chipped by `dings`. */
const surfboard = (ctx: Ctx, x: number, y: number, w: number, h: number, dings = 0) => {
  const path = () => ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  shaded(ctx, path, '#F8FAFC', x - w, y - h, w * 2, h * 2, 1.2);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = '#F43F5E'; ctx.fillRect(x - 2, y - h, 4, h * 2);
  ctx.fillStyle = '#FDA4AF'; ctx.fillRect(x - 2, y - h, 1, h * 2);
  ctx.fillStyle = dark('#F43F5E', 0.3); ctx.fillRect(x + 1.2, y - h, 0.8, h * 2);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(x, y - h * 0.45, w * 0.5, 0, Math.PI * 2); ctx.fill(); // a sun decal
  ctx.fillStyle = '#EA580C'; ctx.fillRect(x - w * 0.5, y - h * 0.45, w, 1);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  for (let i = 0; i < dings; i++) {
    const dx = x - 5 + (i % 2) * 7, dy = y - h + 10 + i * 11;
    ink(ctx, () => { ctx.moveTo(dx, dy); ctx.lineTo(dx + 3, dy - 0.6); ctx.lineTo(dx + 3.4, dy + 2.4); ctx.lineTo(dx + 0.6, dy + 3.2); ctx.closePath(); }, '#FDE68A', 0.7);
    ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(dx + 3.4, dy + 2.4); ctx.lineTo(dx + 5, dy + 4.4); ctx.moveTo(dx, dy); ctx.lineTo(dx - 1.4, dy - 1.8); ctx.stroke();
  }
};

/** A coconut at (x, y): husky brown, its fibres, the three eyes. */
const coconut = (ctx: Ctx, x: number, y: number) => {
  shaded(ctx, () => ctx.arc(x, y, 6, 0, Math.PI * 2), '#78350F', x - 6, y - 6, 12, 12);
  ctx.strokeStyle = dark('#78350F', 0.4); ctx.lineWidth = 0.6; ctx.beginPath();
  for (const [a, b] of [[-3, -3], [2, -4], [-4, 1], [3, 2]]) { ctx.moveTo(x + a, y + b); ctx.lineTo(x + a + 1.6, y + b + 1); }
  ctx.stroke();
  ctx.fillStyle = INK; for (const [a, b] of [[1, -2], [3, -1.4], [2, 0.4]]) ctx.fillRect(x + a, y + b, 1, 1);
};

/** A surfer in a rash guard behind his board (it takes the shots); drops it to hurl a coconut. */
const drawSurfer = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = SKIN[3], RASH = '#0F766E', HAIR = '#FDE68A';
  legs(ctx, -28, f, 0, skin, '#2563EB', 'bare');
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-9.4, -24, 0.8, 7.6); ctx.fillRect(9, -24, 0.8, 7.6); // the boardshorts' piping
  if (!e.isShieldActive) {
    // Board down at his side
    ctx.save(); ctx.translate(-18, -30); ctx.rotate(0.2); surfboard(ctx, 0, 0, 5, 28); ctx.restore();
  }
  arm(ctx, -5, -50, -9, -33, RASH, skin);
  body(ctx, -11, -54, 22, 28, RASH, () => {
    ctx.fillStyle = '#FDE047'; ctx.fillRect(-11, -44, 22, 3);
    ctx.fillStyle = lite('#FDE047', 0.4); ctx.fillRect(-11, -44, 22, 0.8);
    ctx.fillStyle = dark(RASH, 0.3); ctx.fillRect(-4, -54, 8, 2); // the collar
  });
  head(ctx, 2, -62, skin, 8, { mouth: 'smile' });
  // Shaggy bleached hair, flopped over one eye
  ink(ctx, () => {
    ctx.moveTo(-7, -58); ctx.lineTo(-8, -66); ctx.quadraticCurveTo(-2, -73, 8, -70); ctx.lineTo(12, -67); ctx.lineTo(9, -66);
    ctx.lineTo(10, -61); ctx.lineTo(6, -64); ctx.lineTo(3, -62); ctx.lineTo(2, -65); ctx.lineTo(-3, -62); ctx.lineTo(-4, -57); ctx.closePath();
  }, HAIR, 1);
  ctx.fillStyle = lite(HAIR, 0.4); ctx.fillRect(-3, -70, 6, 1.2); ctx.fillRect(4, -68.6, 3, 1);
  ctx.fillStyle = dark(HAIR, 0.2); ctx.fillRect(-6, -63, 1, 4);
  if (e.isShieldActive) {
    // The board, stood on end in front of him, dinged up as it takes hits; his hand round its rail
    arm(ctx, 5, -51, 12, -44, RASH, skin);
    surfboard(ctx, 18, -40, 8, 40, Math.floor((1 - e.health / e.maxHealth) * 6));
    ink(ctx, () => ctx.roundRect(9, -46.4, 4.4, 4.4, 1.6), skin, 0.8);
  } else {
    // Winding up a coconut
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const hx = -2 - wind * 12, hy = -56;
    arm(ctx, 0, -50, hx + 1, hy + 5, RASH, skin);
    coconut(ctx, hx, hy);
    ink(ctx, () => ctx.ellipse(hx + 1.8, hy + 5.4, 2.4, 2, 0, 0, Math.PI * 2), skin, 0.7);
  }
};

/** Miami-Dade police: navy uniform, cap, mirrored aviators, badge, sidearm. */
const drawCop = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = SKIN[1], NAVY = '#1E3A8A';
  legs(ctx, -30, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0, skin, '#1E293B', 'shoe', '#0B0F19', true);
  arm(ctx, -6, -52, -11, -34, NAVY, skin, true);
  body(ctx, -11, -56, 22, 28, NAVY, () => {
    ctx.fillStyle = dark(NAVY, 0.35); ctx.fillRect(0.4, -52, 0.8, 22);                       // the placket
    ctx.fillStyle = '#CBD5E1'; for (let y = -49; y < -33; y += 5) ctx.fillRect(1.6, y, 1.2, 1.2);
    ctx.fillStyle = dark(NAVY, 0.35); ctx.beginPath(); ctx.moveTo(-5, -56); ctx.lineTo(0.6, -51); ctx.lineTo(-7, -53); ctx.fill(); // the collar
    ctx.beginPath(); ctx.moveTo(5, -56); ctx.lineTo(0.6, -51); ctx.lineTo(7, -53); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.strokeRect(3, -47, 5.6, 4.6); // a pocket flap
  });
  ink(ctx, () => ctx.roundRect(-12, -54, 4, 5, 1), '#93C5FD', 0.6); // shoulder patch
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-11, -52.6, 2, 1.4);
  // Badge
  ink(ctx, () => { ctx.moveTo(-7.6, -51); ctx.lineTo(-2.4, -51); ctx.lineTo(-2.4, -47.6); ctx.lineTo(-5, -45); ctx.lineTo(-7.6, -47.6); ctx.closePath(); }, '#FACC15', 0.7);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-6.8, -50.2, 1.4, 1); ctx.fillStyle = '#A16207'; ctx.fillRect(-5.6, -49, 1.2, 1.2);
  // Duty belt: buckle, cuff case, holster
  shadedTop(ctx, () => ctx.rect(-11.5, -32, 23, 4), '#111827', -11.5, -32, 23, 4);
  ink(ctx, () => ctx.rect(-1.4, -31.6, 3.4, 3.2), '#CBD5E1', 0.5);
  ink(ctx, () => ctx.roundRect(4.6, -31.4, 4, 4, 1), '#1F2937', 0.6);
  ink(ctx, () => ctx.roundRect(-13, -31, 5, 9, 1.4), '#0B0F19', 0.8);
  head(ctx, 2, -64, skin, 8, { mouth: 'frown', eyes: false });
  ink(ctx, () => ctx.roundRect(3, -61.2, 7, 2.2, 1), '#1F2937', 0.7); ctx.fillStyle = '#4B5563'; ctx.fillRect(4, -60.8, 4, 0.6); // the mustache
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-5.6, -66, 2.6, 4); // hair cut short under the cap
  // Mirrored aviators
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(1, -66); ctx.lineTo(-4.4, -65.2); ctx.moveTo(5, -66); ctx.lineTo(6, -66); ctx.stroke();
  for (const lx of [3, 8]) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(lx, -64.6, 2.4, 2.2, 0, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#B45309'; ctx.fillRect(lx - 3, -67, 6, 5);
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(lx - 3, -67, 6, 1.6);
    ctx.fillStyle = '#78350F'; ctx.fillRect(lx - 3, -63.6, 6, 1.4);
    ctx.restore();
    ctx.beginPath(); ctx.ellipse(lx, -64.6, 2.4, 2.2, 0, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 0.4; ctx.stroke();
  }
  // The cap: crown, band, the peak, its badge
  shaded(ctx, () => { ctx.moveTo(-8, -70.6); ctx.lineTo(-9.6, -76); ctx.quadraticCurveTo(1, -78.4, 12, -76); ctx.lineTo(10.6, -70.6); ctx.closePath(); }, NAVY, -9.6, -78, 21.6, 7.4);
  ink(ctx, () => ctx.rect(-8, -71.6, 18.6, 2), '#111827', 0.6);
  ink(ctx, () => { ctx.moveTo(3, -70); ctx.lineTo(13.6, -70); ctx.quadraticCurveTo(14.6, -68, 11, -67.4); ctx.lineTo(3, -68.4); ctx.closePath(); }, '#0B0F19', 0.8);
  ctx.fillStyle = '#475569'; ctx.fillRect(5, -69.6, 7, 0.7);
  ink(ctx, () => { ctx.moveTo(1, -76); ctx.lineTo(4.4, -76); ctx.lineTo(4.4, -73.6); ctx.lineTo(2.7, -72.2); ctx.lineTo(1, -73.6); ctx.closePath(); }, '#FACC15', 0.5);
  if (e.melee) {
    // The nightstick: raised back over his head (the tell), brought down hard, then hanging
    const m = e.melee;
    const a = m.state === 'windup' ? -0.6 - Math.min(1, m.t / 10) * 1.7 : m.state === 'strike' ? -2.3 + Math.min(1, m.t / 3) * 3.1 : 0.9;
    ctx.save(); ctx.translate(4, -50); ctx.rotate(a);
    limb(ctx, 0, 0, 11, 0, 5.5, NAVY);
    shadedTop(ctx, () => ctx.roundRect(10, -2.5, 26, 5, 1.6), '#1F2937', 10, -2.5, 26, 5, 0.9);
    ctx.fillStyle = '#64748B'; ctx.fillRect(12, -1.8, 22, 0.7);
    ink(ctx, () => ctx.roundRect(14, -1, 3, 10, 1), '#111827', 0.8);
    ink(ctx, () => ctx.arc(12, 0, 3.4, 0, Math.PI * 2), skin, 0.8);
    ctx.restore();
    if (m.state === 'strike' && m.t < 5) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(4, -50, 34, -1.9, 0.6); ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(4, -50, 36, -1.6, 0.6); ctx.stroke();
    }
    return;
  }
  gunArm(ctx, e, -52, NAVY, skin, '#111827', true);
};

/** Riot police: helmet and visor, and a big clear POLICE shield. */
const drawRiotCop = (ctx: Ctx, e: Enemy, f: number) => {
  void f;
  const skin = SKIN[1], KIT = '#1F2937', GLOVE = '#111827';
  legs(ctx, -30, 0, 0, skin, '#111827', 'boot', '#0B0F19', true);
  for (const x of [-8, 2]) { shaded(ctx, () => ctx.roundRect(x - 0.6, -20, 8.2, 7, 2), '#374151', x - 0.6, -20, 8.2, 7, 0.8); } // knee pads
  if (!e.isShieldActive) {
    // Shield lowered, slung at his back
    ctx.save(); ctx.beginPath(); ctx.roundRect(-26, -40, 12, 40, 1.4);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.5)'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(-25, -39, 10, 38);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.fillRect(-24, -38, 2, 30);
    ctx.restore();
  }
  // The armour: chest plates, the shoulder pad, a belt of pouches
  body(ctx, -13, -58, 26, 30, KIT, () => {
    ctx.fillStyle = dark(KIT, 0.4); for (const y of [-46, -38]) ctx.fillRect(-13, y, 26, 0.8);
    ctx.fillStyle = lite(KIT, 0.2); for (const y of [-45.2, -37.2]) ctx.fillRect(-13, y, 26, 0.6);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-9, -54, 9, 2.4); // a POLICE strip
    ctx.fillStyle = INK; for (let k = 0; k < 4; k++) ctx.fillRect(-8.4 + k * 2.2, -53.4, 1.2, 1.2);
  });
  shadedTop(ctx, () => ctx.rect(-13, -32, 26, 4), '#111827', -13, -32, 26, 4);
  for (const x of [-10, 5]) ink(ctx, () => ctx.roundRect(x, -31.4, 5, 5, 1), '#374151', 0.6);
  shadedTop(ctx, () => { ctx.ellipse(3, -56, 10, 5, 0, Math.PI, Math.PI * 2); ctx.lineTo(13, -52); ctx.lineTo(-7, -52); ctx.closePath(); }, '#374151', -7, -61, 20, 9);
  // The face, behind the visor; the helmet over it, the neck guard
  head(ctx, 2, -64, skin, 9, { brow: 'mad', mouth: 'frown' });
  ink(ctx, () => ctx.roundRect(-12, -62, 6, 9, 1.4), '#111827', 0.8);
  shadedTop(ctx, () => { ctx.moveTo(-9.6, -57); ctx.lineTo(-9.6, -66); ctx.arc(2, -66, 11.6, Math.PI, 0); ctx.lineTo(1, -66); ctx.lineTo(1, -57); ctx.closePath(); }, '#111827', -9.6, -78, 25, 21);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-4, -76.4, 8, 1.2);
  ctx.save(); ctx.beginPath(); ctx.roundRect(0.4, -67.4, 14, 10.4, [0, 2, 3, 0]); ctx.clip();
  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)'; ctx.fillRect(0, -68, 15, 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; ctx.beginPath(); ctx.moveTo(6, -68); ctx.lineTo(9, -68); ctx.lineTo(4, -56); ctx.lineTo(1, -56); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(10.4, -68, 1.2, 12);
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(0.4, -67.4, 14, 10.4, [0, 2, 3, 0]); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  ink(ctx, () => ctx.arc(1, -66, 1.4, 0, Math.PI * 2), '#9CA3AF', 0.6); // the visor's hinge
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // (drawn back for a bash, then rammed forward)
    const m = e.melee;
    const push = !m ? 0 : m.state === 'windup' ? -Math.min(1, m.t / 10) * 8 : m.state === 'strike' ? 12 : 3;
    ctx.save(); ctx.translate(push, 0);
    arm(ctx, 6, -52, 14, -42, KIT, skin, false, 6, GLOVE);
    // The shield: clear, glints across it, a rim; POLICE down it
    const sh = () => ctx.roundRect(10, -76, 16, 74, 2);
    ctx.save(); ctx.beginPath(); sh(); ctx.clip();
    ctx.fillStyle = 'rgba(203, 213, 225, 0.45)'; ctx.fillRect(10, -76, 16, 74);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (const y0 of [-70, -24]) { ctx.beginPath(); ctx.moveTo(10, y0 + 10); ctx.lineTo(26, y0 - 4); ctx.lineTo(26, y0 + 2); ctx.lineTo(10, y0 + 16); ctx.fill(); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(11.4, -74, 1.2, 70);
    ctx.fillStyle = 'rgba(71, 85, 105, 0.35)'; ctx.fillRect(23.4, -74, 1.6, 70);
    ctx.restore();
    ctx.beginPath(); sh(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke(); ctx.strokeStyle = '#64748B'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.save(); ctx.translate(18.6, -36); ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.strokeText('POLICE', 0, 3);
    ctx.fillStyle = '#F8FAFC'; ctx.fillText('POLICE', 0, 3);
    ctx.restore();
    for (let i = 0; i < Math.floor(damage * 5); i++) {
      const y0 = -70 + i * 13;
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(26, 11, 6, 0.5)'; ctx.beginPath(); ctx.moveTo(11, y0 + 1); ctx.lineTo(18, y0 + 6); ctx.lineTo(25, y0 + 3); ctx.moveTo(18, y0 + 6); ctx.lineTo(17, y0 + 10); ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(18, y0 + 5); ctx.lineTo(25, y0 + 2); ctx.moveTo(18, y0 + 5); ctx.lineTo(17, y0 + 9); ctx.stroke();
    }
    if (m?.state === 'strike' && m.t < 6) {
      for (const y of [-60, -38, -16]) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(42, y); ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(46, y); ctx.stroke();
      }
    }
    ctx.restore();
  } else {
    // A tear gas canister wound back to lob, wisping
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const hx = -3 - wind * 12, hy = -58;
    arm(ctx, -1, -51, hx + 1, hy + 5, KIT, skin, false, 6, GLOVE);
    shaded(ctx, () => ctx.roundRect(hx - 3, hy - 5, 6, 10, 1.2), '#65A30D', hx - 3, hy - 5, 6, 10, 0.9);
    ink(ctx, () => ctx.rect(hx - 3, hy - 6.4, 6, 2), '#9CA3AF', 0.6);
    ctx.fillStyle = '#1A2E05'; ctx.fillRect(hx - 2.4, hy - 1, 4.8, 1.2);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.6)'; ctx.beginPath(); ctx.arc(hx + 0.6, hy - 9, 1.8, 0, Math.PI * 2); ctx.arc(hx - 1, hy - 12, 1.3, 0, Math.PI * 2); ctx.fill();
    ink(ctx, () => ctx.ellipse(hx + 1.8, hy + 5.4, 2.6, 2.2, 0, 0, Math.PI * 2), GLOVE, 0.7);
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
  const hair = v === 3 ? '#E5E7EB' : ['#1F2937', '#78350F', '#FDE68A'][Math.abs(Math.round(e.homeX || 0)) % 3];
  const panicking = e.aiState === 'flee' || e.aiState === 'shelter';
  if (v === 0 && !panicking) {
    // Lying on a towel, shades on, one knee up, an arm behind the head
    ink(ctx, () => ctx.rect(-34, -3, 68, 3), '#F43F5E', 0.8);
    ctx.fillStyle = '#F8FAFC'; for (let x = -30; x < 34; x += 10) ctx.fillRect(x, -2.6, 4, 2.2);
    ctx.fillStyle = '#FDA4AF'; ctx.fillRect(-33.6, -2.6, 67, 0.7);
    limb(ctx, 4, -6, 26, -5, 4.6, skin);                                                // the leg out straight
    ink(ctx, () => ctx.roundRect(25, -8, 3.4, 5, 1.4), skin, 0.7);
    limb(ctx, 4, -7, 15, -17, 4.8, skin); limb(ctx, 15, -17, 22, -5, 4.4, skin);         // the knee up
    ink(ctx, () => ctx.roundRect(20, -6, 5.6, 3, [1.4, 1.6, 0.4, 0.4]), skin, 0.7);
    shaded(ctx, () => ctx.roundRect(-24, -11, 26, 8, 3), skin, -24, -11, 26, 8);        // the body
    shaded(ctx, () => ctx.roundRect(-2, -11, 8, 8, 2), shirt, -2, -11, 8, 8);           // the swimsuit
    ink(ctx, () => ctx.roundRect(-16, -12, 9, 4, 2), shirt, 0.7);
    limb(ctx, -20, -9, -34, -14, 4, skin);                                              // the arm behind the head
    const hx = -28, hy = -9;
    ink(ctx, () => ctx.ellipse(hx, hy, 6, 5.6, 0, 0, Math.PI * 2), skin, 0.9);
    ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(hx - 5, hy, 10, 3);
    ink(ctx, () => { ctx.ellipse(hx - 2, hy, 4.6, 5.6, 0, Math.PI * 0.5, Math.PI * 1.5); ctx.closePath(); }, hair, 0.8);
    ink(ctx, () => ctx.roundRect(hx - 1, hy - 7, 5, 2.4, 1), '#111827', 0.6);           // shades, face to the sun
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(hx, hy - 6.6, 1.6, 0.7);
    ctx.fillStyle = dark(skin, 0.25); ctx.fillRect(hx + 4.6, hy - 5, 1.4, 1.6);           // the nose
    ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(hx + 4.4, hy - 1, 1.6, -0.6, 1); ctx.stroke(); // smiling
    return;
  }
  const running = panicking || Math.abs(e.vel.x) > 1;
  const stride = running ? 7 : v === 3 ? 2 : 0;
  legs(ctx, -28, f * (running ? 1.8 : 0.8), stride, skin, v === 1 ? '#111827' : '#0EA5E9', v === 1 ? 'shoe' : 'bare', '#F8FAFC');
  // Body
  const top = v === 4 ? '#F8FAFC' : shirt;
  const swing = running && !panicking ? Math.sin(f * 0.45) * 6 : 0;
  if (!panicking && v !== 2 && v !== 3 && v !== 4) arm(ctx, -5, -49, -10, -34 + swing, top, skin, true);
  body(ctx, -10, -52, 20, 25, top, () => {
    if (v === 1) { ctx.fillStyle = '#A3E635'; ctx.fillRect(-10, -44, 20, 3); ctx.fillStyle = lite('#A3E635', 0.4); ctx.fillRect(-10, -44, 20, 0.8); } // neon stripe
    if (v === 4) {
      ctx.fillStyle = '#EF4444'; ctx.fillRect(-10, -52, 20, 4);                    // the ice cream man's trim
      ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-10, -52, 20, 0.8);
      ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 0.7; ctx.strokeRect(-6, -44, 12, 10); // the apron's pocket
    }
    if (v !== 4) { ctx.fillStyle = dark(top, 0.3); ctx.beginPath(); ctx.arc(1, -52, 3, 0, Math.PI); ctx.fill(); } // the neck
  });
  const tint = panicking && e.disgusted ? 'rgba(132, 204, 22, 0.4)' : undefined;
  head(ctx, 2, -60, skin, 8, panicking ? { brow: 'up', mouth: e.disgusted ? 'gag' : 'open', tint } : { mouth: v === 1 ? 'flat' : 'smile' });
  if (v === 3) {
    // The old boy: bald on top, a grey fringe, headphones on for the beeps
    ink(ctx, () => ctx.ellipse(-3.6, -61, 3.6, 4.6, 0.3, 0, Math.PI * 2), hair, 0.8);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(-1, -61, 8.6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1.2; ctx.stroke();
    ink(ctx, () => ctx.roundRect(-6.4, -63, 4.6, 6, 1.6), '#374151', 0.8);
  } else {
    hairCap(ctx, 2, -60, 8.5, hair);
  }
  if (v === 4) {
    // Paper hat
    ink(ctx, () => { ctx.moveTo(-8, -66); ctx.lineTo(10, -66); ctx.lineTo(8, -73); ctx.lineTo(-6, -73); ctx.closePath(); }, '#F8FAFC', 0.8);
    ctx.fillStyle = '#EF4444'; ctx.fillRect(-7.4, -68.4, 16.8, 1.2);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(5, -72.4, 2.6, 6);
  }
  if (v === 1) { ink(ctx, () => ctx.rect(-7.6, -66.4, 18, 3), '#22D3EE', 0.6); ctx.fillStyle = lite('#22D3EE', 0.4); ctx.fillRect(-7, -65.8, 16.8, 0.7); } // sweatband
  // Arms: flailing up if running for it, otherwise what they're doing
  if (panicking && e.disgusted) {
    // Running from the smell: gone green, gagging, one hand pinching the nose, the other waving it away
    const wave = Math.sin(f * 0.7) * 6;
    arm(ctx, -5, -49, -10, -64 + wave, top, skin, true);
    arm(ctx, 5, -49, 10, -58, top, skin, true);
  } else if (panicking) {
    const flail = Math.sin(f * 0.6) * 5;
    arm(ctx, -5, -49, -10, -70 + flail, top, skin, true);
    arm(ctx, 5, -49, 10, -70 - flail, top, skin, true);
  } else if (v === 2) {
    // Hands up for the ball
    arm(ctx, -5, -49, -8, -71, top, skin, true);
    arm(ctx, 5, -49, 9, -71, top, skin, true);
    const by = -84 + Math.abs(Math.sin(f * 0.09)) * -20;
    shaded(ctx, () => ctx.arc(1, by, 5, 0, Math.PI * 2), '#F8FAFC', -4, by - 5, 10, 10);
    ctx.strokeStyle = '#2563EB'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(-3, by - 3, 6, 0.2, 1.3); ctx.moveTo(6, by); ctx.arc(1, by + 6, 6, -0.6, -2.6, true); ctx.stroke();
  } else if (v === 3) {
    // Metal detector swinging low in front
    const sweep = Math.sin(f * 0.1) * 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(14, -46); ctx.lineTo(26 + sweep, -4); ctx.stroke();
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.lineCap = 'butt';
    ink(ctx, () => ctx.roundRect(15, -42, 6, 4, 1), '#374151', 0.7);                    // the control box
    ctx.fillStyle = f % 30 < 15 ? '#4ADE80' : '#14532D'; ctx.fillRect(16.4, -41, 1.4, 1.4);
    ink(ctx, () => ctx.ellipse(27 + sweep, -3, 7, 2.5, 0, 0, Math.PI * 2), '#374151', 0.9);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(22 + sweep, -4.4, 10, 0.8);
    arm(ctx, 5, -49, 14, -46, top, skin, true);
  } else if (v === 4) {
    // Holding out a cone
    arm(ctx, 5, -49, 16, -45, top, skin, true);
    ink(ctx, () => ctx.arc(18, -50, 3.4, 0, Math.PI * 2), '#F9A8D4', 0.7);
    ctx.fillStyle = '#FBCFE8'; ctx.fillRect(16.4, -52, 1.6, 1);
    ink(ctx, () => { ctx.moveTo(15, -48); ctx.lineTo(21, -48); ctx.lineTo(18, -39); ctx.closePath(); }, '#D97706', 0.7);
    ctx.strokeStyle = '#92400E'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(16, -46); ctx.lineTo(19.6, -43); ctx.moveTo(20, -46); ctx.lineTo(16.6, -43); ctx.stroke();
    ink(ctx, () => ctx.roundRect(15.4, -47.6, 3.6, 3.4, 1.4), skin, 0.6);
  } else {
    arm(ctx, 5, -49, 10, -34 - swing, top, skin, true);
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
