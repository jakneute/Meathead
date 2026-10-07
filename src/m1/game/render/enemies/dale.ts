// Dale's stage: the cartel (a sicario with an AK and a bandana over his face, an
// enforcer in a wife-beater who runs you down swinging a machete, a man behind a
// car door he tore off something), the desert's wildlife (a rattlesnake, a
// scorpion, a coyote), and the tourists in the old west town. (Dale's
// distributor, upstairs in the warehouse, is drawn by the stage.)
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { SNAKE_RATTLE } from '../../enemies/kinds/dale';
import { INK, ink, shaded, shadedTop, eye, limb, dark, lite } from '../npc/kit';

type Ctx = CanvasRenderingContext2D;

export const drawDaleKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'sicario': drawSicario(ctx, e, f); break;
    case 'enforcer': drawEnforcer(ctx, e, f); break;
    case 'cardoor': drawCardoor(ctx, e, f); break;
    case 'rattlesnake': drawRattlesnake(ctx, e, f); break;
    case 'scorpion': drawScorpion(ctx, e, f); break;
    case 'coyote': drawCoyote(ctx, e, f); break;
    case 'visitor': drawVisitor(ctx, e, f); break;
    case 'junkie': drawJunkieStandIn(ctx, f); break;
    case 'hawk': drawHawk(ctx, e, f); break;
  }
  void state;
};

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
// (Drawn the townsfolk's way, like Barry's goons and Hector's: an ink line round every part, each part shaded in
// steps, a face with eyes and brows and a mouth that does something, hands, boots with heels on them.)

const JEANS = '#1E3A8A', BOOT = '#5B3417', SKIN = '#B07A4F';

type Feet = 'cowboy' | 'work' | 'sandal';

/**
 * Two legs from the hips at hipY: in trousers all the way (or bare below `shorts`), and on the end of them pointed
 * cowboy boots (the stacked heel, the shaft's stitching), plain work boots, or socks pulled up in sandals.
 */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants = JEANS, feet: Feet = 'cowboy', skin = SKIN, shorts?: string) => {
  const s = Math.sin(f * 0.25) * stride;
  const knee = hipY + 12;
  for (const x of [-8 + s, 2 - s]) {
    const top = shorts ? knee - 1 : hipY;
    shaded(ctx, () => ctx.rect(x, top, 7, -top - 5), shorts ? skin : pants, x, top, 7, -top - 5);
    if (!shorts) { ctx.fillStyle = lite(pants, 0.3); ctx.fillRect(x + 5.4, top + 3, 0.6, -top - 10); } // the outseam
    if (feet === 'cowboy') {
      const boot = () => {
        ctx.moveTo(x - 0.6, -13); ctx.lineTo(x + 7.6, -13); ctx.lineTo(x + 7.8, -5.6);
        ctx.quadraticCurveTo(x + 10.6, -5, x + 13.4, -1.6); ctx.lineTo(x + 12.6, -0.6); ctx.lineTo(x + 3, -0.6); ctx.lineTo(x - 0.6, -2.4); ctx.closePath();
      };
      shaded(ctx, boot, BOOT, x - 0.6, -13, 14, 13);
      ink(ctx, () => ctx.rect(x - 1, -13.6, 8.8, 1.8), dark(BOOT, 0.25), 0.7);                       // the shaft's top
      ctx.strokeStyle = lite(BOOT, 0.4); ctx.lineWidth = 0.6; ctx.beginPath();                       // the stitching
      ctx.moveTo(x + 1, -10.6); ctx.lineTo(x + 3.4, -8); ctx.lineTo(x + 5.8, -10.6); ctx.moveTo(x + 1.6, -7.4); ctx.lineTo(x + 3.4, -5.6); ctx.lineTo(x + 5.2, -7.4); ctx.stroke();
      ctx.fillStyle = lite(BOOT, 0.3); ctx.fillRect(x + 8, -4.6, 2.6, 0.8);                           // the toe's shine
      ink(ctx, () => { ctx.moveTo(x - 0.8, -3); ctx.lineTo(x + 3.4, -3); ctx.lineTo(x + 3, 0); ctx.lineTo(x - 0.4, 0); ctx.closePath(); }, '#1C1917', 0.7); // the heel
      ctx.fillStyle = '#1C1917'; ctx.fillRect(x + 3, -1.2, 9.6, 0.8);                                // the sole
    } else if (feet === 'sandal') {
      ink(ctx, () => ctx.rect(x + 0.5, -11, 6, 7.5), '#F8FAFC', 0.8);                                  // white socks, pulled up
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 4.6, -10.6, 1.4, 6); ctx.fillStyle = '#E2E8F0'; ctx.fillRect(x + 0.9, -10, 5.2, 0.7);
      ink(ctx, () => ctx.roundRect(x - 1, -5, 10, 4, [2, 2.6, 0.6, 0.6]), '#F8FAFC', 0.9);
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(x + 0.6, -3, 7.4, 0.8);
      ink(ctx, () => ctx.rect(x + 1, -4.6, 6, 1.4), '#92400E', 0.6);
      ink(ctx, () => ctx.rect(x - 1.4, -1.6, 11, 1.6), '#78350F', 0.7);
    } else {
      ink(ctx, () => ctx.roundRect(x - 1, -8, 10, 8, [1.5, 3, 1, 1]), '#1C1917', 1);
      ctx.fillStyle = lite('#1C1917', 0.3); ctx.fillRect(x, -7.4, 3, 1);
      ctx.fillStyle = lite('#1C1917', 0.45); ctx.fillRect(x - 1, -1, 10, 1);
      ctx.fillStyle = dark('#1C1917', 0.4); ctx.fillRect(x - 0.4, -5, 9, 0.7);
    }
  }
  if (!shorts) return;
  // The shorts, split at the crotch, a pocket on the thigh, a hem
  shaded(ctx, () => { ctx.moveTo(-10, hipY); ctx.lineTo(10, hipY); ctx.lineTo(10.6, knee); ctx.lineTo(1, knee); ctx.lineTo(0, knee - 3.5); ctx.lineTo(-1, knee); ctx.lineTo(-10.6, knee); ctx.closePath(); },
    shorts, -10.6, hipY, 21.2, 12);
  ctx.fillStyle = dark(shorts, 0.3); ctx.fillRect(-10, knee - 2, 9.6, 0.8); ctx.fillRect(1.4, knee - 2, 8.8, 0.8);
  ctx.strokeStyle = dark(shorts, 0.4); ctx.lineWidth = 0.7; ctx.strokeRect(3.4, hipY + 4, 5, 4.4); ctx.fillStyle = dark(shorts, 0.25); ctx.fillRect(3.4, hipY + 4, 5, 1.2);
};

/** A tooled belt across at y, w wide, and a big shiny buckle. */
const belt = (ctx: Ctx, y: number, w: number) => {
  shadedTop(ctx, () => ctx.rect(-w / 2, y, w, 4), '#3F2410', -w / 2, y, w, 4, 0.8);
  ctx.fillStyle = lite('#3F2410', 0.25); for (let x = -w / 2 + 2; x < w / 2 - 1; x += 3) ctx.fillRect(x, y + 1.6, 1, 0.8);
  shaded(ctx, () => ctx.roundRect(-3.6, y - 1.4, 8, 6.8, 1.4), '#FACC15', -3.6, y - 1.4, 8, 6.8, 0.8);
  ink(ctx, () => ctx.roundRect(-1.6, y + 0.4, 4, 3.2, 0.8), '#CA8A04', 0.5);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-2.8, y - 0.6, 1.6, 1);
};

/** A body (a shirt, a hoodie): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
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

/** A sicario: black cap, shades, a bandana over his face, a flannel over a white tank, gold chain, an AK; the muzzle glows before he fires. */
const drawSicario = (ctx: Ctx, e: Enemy, f: number) => {
  const FLANNEL = '#991B1B', WOOD = '#92400E', STEEL = '#1F2937';
  legs(ctx, -28, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0);
  // The far arm, reaching across under the handguard
  arm(ctx, -3, -52, 16, -41, FLANNEL, SKIN);
  // The flannel, open over the tank: the plaid in two weights, the lapels, the tank down the front
  body(ctx, -12, -56, 24, 28, FLANNEL, () => {
    ctx.fillStyle = dark(FLANNEL, 0.45); for (let y = -54; y < -28; y += 6) ctx.fillRect(-12, y, 24, 2); for (let x = -10; x < 12; x += 6) ctx.fillRect(x, -56, 2, 28);
    ctx.fillStyle = 'rgba(254, 202, 202, 0.35)'; for (let y = -51; y < -28; y += 6) ctx.fillRect(-12, y, 24, 0.7); for (let x = -7; x < 12; x += 6) ctx.fillRect(x, -56, 0.7, 28);
    shaded(ctx, () => ctx.rect(-4, -57, 8, 30), '#F8FAFC', -4, -57, 8, 30, 0.8);
    ctx.fillStyle = 'rgba(26, 11, 6, 0.1)'; for (let y = -50; y < -30; y += 3) ctx.fillRect(-3, y, 6, 0.6); // the ribbing
    ctx.fillStyle = dark(FLANNEL, 0.3);
    ctx.beginPath(); ctx.moveTo(-4, -57); ctx.lineTo(-8, -56); ctx.lineTo(-4, -46); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -57); ctx.lineTo(8, -56); ctx.lineTo(4, -46); ctx.fill();
  });
  belt(ctx, -31, 23);
  // The gold chain
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -56, 6, 0.3, Math.PI - 0.3);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  // Head: shades, the bandana up to the nose (paisley, knotted at the back), the cap pulled down, a gold logo on it
  head(ctx, 2, -64, SKIN, 8, { eyes: false });
  shades(ctx, 2.4, -64.4);
  ink(ctx, () => { ctx.moveTo(-6.4, -63); ctx.lineTo(10.6, -64.6); ctx.lineTo(10.2, -57.4); ctx.lineTo(4, -52.6); ctx.lineTo(-5.4, -56.4); ctx.closePath(); }, '#111827', 0.9);
  ctx.fillStyle = '#374151'; ctx.fillRect(-5, -62.4, 14.6, 1);
  ctx.fillStyle = '#F8FAFC';
  for (const [px, py] of [[0, -60], [5, -60.4], [2.4, -57], [7.6, -57.6], [-3.4, -58.6]]) { ctx.fillRect(px, py, 1.4, 1.4); ctx.fillRect(px + 1.2, py + 1.2, 0.8, 0.8); }
  ink(ctx, () => { ctx.moveTo(-6.4, -62); ctx.lineTo(-10.6, -59); ctx.lineTo(-9, -57.6); ctx.lineTo(-6, -60); ctx.closePath(); }, '#111827', 0.7);
  shaded(ctx, () => { ctx.moveTo(-8, -66); ctx.quadraticCurveTo(-8.4, -74.6, 1.6, -74.8); ctx.quadraticCurveTo(10, -74.6, 10.4, -67); ctx.closePath(); }, '#111827', -8.4, -75, 18.8, 9);
  ink(ctx, () => { ctx.moveTo(3, -68.4); ctx.lineTo(15.4, -68.8); ctx.quadraticCurveTo(17, -66.8, 13.4, -66); ctx.lineTo(3, -66.4); ctx.closePath(); }, '#0A0A0A', 0.8);
  ctx.fillStyle = '#374151'; ctx.fillRect(5, -68.2, 9, 0.7);
  ink(ctx, () => ctx.rect(0.6, -76, 2, 1.4), '#111827', 0.5);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(4, -72, 3.4, 2.4); ctx.fillStyle = '#A16207'; ctx.fillRect(5.2, -71.4, 1, 1.2);
  // The AK: the stock and pistol grip in wood, the stamped receiver, the handguard, the gas tube, the curved mag
  shaded(ctx, () => { ctx.moveTo(1, -45.6); ctx.lineTo(-12, -43.4); ctx.lineTo(-12, -37.6); ctx.lineTo(-9.4, -37.6); ctx.lineTo(1, -41.4); ctx.closePath(); }, WOOD, -12, -45.6, 13, 8, 0.8);
  ctx.fillStyle = dark(WOOD, 0.35); ctx.fillRect(-12, -43.2, 1.4, 5.4); // the butt plate
  ink(ctx, () => { ctx.moveTo(7, -41.6); ctx.lineTo(12, -41.6); ctx.quadraticCurveTo(12.6, -35, 16, -30.6); ctx.lineTo(11.6, -28.6); ctx.quadraticCurveTo(8.2, -34, 7, -41.6); ctx.closePath(); }, STEEL, 0.8);
  ctx.strokeStyle = lite(STEEL, 0.3); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(8.6, -40); ctx.quadraticCurveTo(9.6, -35, 12.4, -31); ctx.stroke();
  ink(ctx, () => { ctx.moveTo(1.6, -41.6); ctx.lineTo(5, -41.6); ctx.lineTo(4, -35.4); ctx.lineTo(0.8, -36); ctx.closePath(); }, dark(WOOD, 0.2), 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(6.2, -41, 1.8, 0, Math.PI); ctx.stroke(); // the trigger guard
  shadedTop(ctx, () => ctx.rect(0, -46.4, 13, 5), STEEL, 0, -46.4, 13, 5, 0.8);
  ctx.fillStyle = lite(STEEL, 0.35); ctx.fillRect(1, -45.6, 10, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(9, -44.4, 3, 1); ctx.fillRect(2, -43, 0.8, 0.8); ctx.fillRect(10.6, -43, 0.8, 0.8); // the bolt's slot, rivets
  shaded(ctx, () => ctx.roundRect(12.4, -46, 9.6, 4.6, 1), WOOD, 12.4, -46, 9.6, 4.6, 0.8);
  ctx.fillStyle = dark(WOOD, 0.3); ctx.fillRect(14.6, -45.4, 0.7, 3.6); ctx.fillRect(17.6, -45.4, 0.7, 3.6);
  ink(ctx, () => ctx.rect(12, -48.4, 12.6, 2), STEEL, 0.6);
  shadedTop(ctx, () => ctx.rect(22, -45.4, 10, 2.2), '#111827', 22, -45.4, 10, 2.2, 0.6);
  ink(ctx, () => ctx.rect(27, -49.4, 1.6, 4), STEEL, 0.5);
  ink(ctx, () => ctx.rect(31, -46.2, 3, 3.6), STEEL, 0.6);
  ctx.fillStyle = INK; ctx.fillRect(32, -45.4, 0.7, 2);
  // Hands: the far one under the handguard, the near one round the grip (the elbow out)
  ink(ctx, () => ctx.roundRect(14, -43.4, 5.4, 4.4, 1.6), SKIN, 0.8);
  limb(ctx, 2, -52, -3, -44, 5.5, FLANNEL); limb(ctx, -3, -44, 2.6, -39.4, 5.5, FLANNEL);
  ink(ctx, () => ctx.roundRect(0.4, -42, 5.2, 4.8, 1.6), SKIN, 0.8);
  ctx.fillStyle = dark(SKIN, 0.2); ctx.fillRect(1.2, -40, 3.6, 0.6);
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  if (charge > 0.8) glow(ctx, 36, -44.4, 2 + charge * 3, charge);
};

/** The enforcer: shaved head, tattoos everywhere, a stained wife-beater, a machete he swings as he runs you down. */
const drawEnforcer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const TATT = '#1E3A8A';
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#44403C', 'work');
  belt(ctx, -32, 26);
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.28 : 0);
  const pump = running ? Math.sin(f * 0.45) * 4 : 0;
  // The back arm, a slab of it, inked to the wrist
  arm(ctx, -12, -30, -16, -8 - pump, SKIN, SKIN, false, 8);
  ctx.fillStyle = TATT; ctx.fillRect(-15.4, -24, 3, 1.2); ctx.fillRect(-15.8, -19, 3.4, 1.2); ctx.fillRect(-14.6, -22, 1.2, 2);
  // Big slab of a torso, the tank top over it (stained), the neck and chest inked
  const torso = () => { ctx.moveTo(-17, 0); ctx.lineTo(-19, -34); ctx.quadraticCurveTo(0, -44, 19, -34); ctx.lineTo(17, 0); ctx.closePath(); };
  shaded(ctx, torso, SKIN, -19, -44, 38, 44);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  ctx.fillStyle = TATT; ctx.fillRect(-16, -30, 3, 10); ctx.fillRect(13, -28, 3, 8);
  ctx.strokeStyle = TATT; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-8, -37); ctx.quadraticCurveTo(0, -34, 8, -37); ctx.stroke(); // script across the collarbones
  ctx.fillStyle = TATT; for (let x = -7; x < 8; x += 2.4) ctx.fillRect(x, -36.6 + Math.abs(x) * 0.12, 1.2, 1);
  const tank = () => {
    ctx.moveTo(-12, -32); ctx.lineTo(-8, -33); ctx.quadraticCurveTo(0, -24, 8, -33); ctx.lineTo(12, -32);
    ctx.quadraticCurveTo(11, -22, 14, -18); ctx.lineTo(14, 2); ctx.lineTo(-14, 2); ctx.lineTo(-14, -18); ctx.quadraticCurveTo(-11, -22, -12, -32); ctx.closePath();
  };
  shaded(ctx, tank, '#F5F5F4', -14, -33, 28, 35);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.3)'; ctx.beginPath(); ctx.ellipse(4, -12, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); // a stain
  ctx.fillStyle = 'rgba(146, 64, 14, 0.45)'; ctx.beginPath(); ctx.ellipse(4.6, -12.4, 3.4, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(153, 27, 27, 0.6)'; for (const [x, y] of [[-6, -20], [-4.4, -22], [-7.6, -17.6], [-3, -18.6]]) ctx.fillRect(x, y, 1.2, 1.2); // (not ketchup)
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.22)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.moveTo(-5, -3); ctx.lineTo(5, -3); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); torso(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // Head: shaved, a teardrop tattoo, a horseshoe mustache, a scowl
  head(ctx, 3, -44, SKIN, 9.5, { brow: 'mad', mouth: 'frown', shine: true });
  ctx.fillStyle = TATT; ctx.fillRect(-4, -36, 8, 2); ctx.fillRect(-5, -34, 1.4, 1.4);
  ink(ctx, () => { ctx.moveTo(9.4, -42.4); ctx.quadraticCurveTo(10.6, -40.6, 9.4, -39.6); ctx.quadraticCurveTo(8.2, -40.6, 9.4, -42.4); ctx.closePath(); }, TATT, 0.4);
  ink(ctx, () => {
    ctx.moveTo(3.4, -40.8); ctx.quadraticCurveTo(7, -42, 10.6, -40.8); ctx.lineTo(10.6, -36.4); ctx.lineTo(9.8, -35.8); ctx.lineTo(9.4, -39.2);
    ctx.quadraticCurveTo(7, -39.8, 4.6, -39.2); ctx.lineTo(4.2, -35.8); ctx.lineTo(3.4, -36.4); ctx.closePath();
  }, '#1C1917', 0.5);
  ctx.fillStyle = '#57534E'; ctx.fillRect(5, -40.8, 4, 0.6);
  // Arm and the machete, swinging: the wooden grip and its rivets, the blade's edge bright, nicked, a smear on it
  const sw = running ? Math.sin(f * 0.45) * 0.7 : 0.2;
  ctx.save(); ctx.translate(12, -30); ctx.rotate(-0.6 + sw);
  limb(ctx, 0, 0, 15, 0, 8, SKIN);
  ctx.fillStyle = TATT; ctx.fillRect(3, -3.4, 1, 6.8); ctx.fillRect(10.4, -3.4, 1, 6.8); ctx.beginPath(); ctx.moveTo(7, -2.8); ctx.lineTo(8.6, 0); ctx.lineTo(7, 2.8); ctx.lineTo(5.4, 0); ctx.fill();
  shaded(ctx, () => ctx.roundRect(16, -2.6, 9, 5.2, 1.4), '#3F2410', 16, -2.6, 9, 5.2, 0.8);
  ctx.fillStyle = '#D97706'; ctx.fillRect(20.4, -0.6, 1.2, 1.2); ctx.fillRect(23, -0.6, 1.2, 1.2);
  const blade = () => { ctx.moveTo(24.6, -2.8); ctx.lineTo(50, -6); ctx.quadraticCurveTo(55, -1, 48, 4.2); ctx.lineTo(24.6, 3); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); blade(); ctx.clip();
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(24, -7, 32, 12);
  ctx.fillStyle = '#78716C'; ctx.fillRect(24, -7, 32, 3.4);                     // the spine
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(24, 0.6, 32, 1.6);                    // the bevel
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(24, 2.2, 32, 3);                      // the edge
  ctx.fillStyle = 'rgba(127, 29, 29, 0.55)'; ctx.beginPath(); ctx.ellipse(44, 1, 5, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.beginPath(); blade(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(26.4, -2.6, 0.7, 5.4); ctx.fillRect(34, 2.6, 1.4, 0.8); ctx.fillRect(40, 2.8, 1, 0.8); // the ricasso, nicks
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(30, -3.4, 6, 0.7);
  ink(ctx, () => ctx.roundRect(13, -4.6, 7, 9.2, 2.4), SKIN, 0.9);
  ctx.fillStyle = dark(SKIN, 0.3); ctx.fillRect(18, -3, 0.7, 6.4); ctx.fillRect(15.4, -1.4, 2.6, 0.6); ctx.fillRect(15.4, 1.4, 2.6, 0.6);
  ctx.restore();
  ctx.restore();
};

/** The door he tore off, its hinge side at x 10: sky blue, dented, the window empty but for a few teeth of glass, the handle, the mirror; holed by `damage`. */
const carDoor = (ctx: Ctx, damage: number) => {
  const BLUE = '#60A5FA';
  const door = () => { ctx.moveTo(10, -72); ctx.lineTo(30, -76); ctx.lineTo(30, -4); ctx.lineTo(10, -2); ctx.closePath(); };
  shaded(ctx, door, BLUE, 10, -76, 20, 74, 1.4);
  ctx.save(); ctx.beginPath(); door(); ctx.clip();
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(10, -31, 20, 1.4); ctx.fillStyle = '#2563EB'; ctx.fillRect(10, -29.6, 20, 1);   // the body line
  ctx.fillStyle = '#9A3412'; for (const [x, y] of [[12, -8], [14, -6], [26, -10]]) ctx.fillRect(x, y, 2, 1.4);           // rust
  if (damage > 0.4) { ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; ctx.beginPath(); ctx.ellipse(20, -20, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(15, -24, 5, 0.8); }
  ctx.restore();
  // The window, empty, its chrome trim, the glass that's left
  ink(ctx, () => ctx.rect(13, -68, 14, 18), '#0F172A', 1);
  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 0.8; ctx.strokeRect(13.6, -67.4, 12.8, 16.8);
  ctx.fillStyle = 'rgba(186, 230, 253, 0.6)';
  ctx.beginPath(); ctx.moveTo(14, -51); ctx.lineTo(17, -55); ctx.lineTo(18.4, -51); ctx.lineTo(21, -53.4); ctx.lineTo(23, -51); ctx.fill();
  ctx.beginPath(); ctx.moveTo(26, -67); ctx.lineTo(26, -62); ctx.lineTo(23.6, -67); ctx.fill();
  // The handle, the lock, the mirror on its arm
  ink(ctx, () => ctx.roundRect(14, -45, 9, 3, 1), '#CBD5E1', 0.7); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(15, -44.4, 6, 0.7);
  ink(ctx, () => ctx.arc(26, -47, 1, 0, Math.PI * 2), '#94A3B8', 0.5);
  ink(ctx, () => ctx.rect(28, -56, 3, 2), '#1F2937', 0.6);
  shaded(ctx, () => ctx.roundRect(30, -60, 5.4, 6.4, 1.4), '#1F2937', 30, -60, 5.4, 6.4, 0.8);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(33.6, -59, 1, 4.4);
  // The hinges, torn
  for (const y of [-62, -16]) ink(ctx, () => { ctx.moveTo(10, y); ctx.lineTo(7, y + 1); ctx.lineTo(8, y + 2.6); ctx.lineTo(6.6, y + 4); ctx.lineTo(10, y + 5); ctx.closePath(); }, '#9CA3AF', 0.6);
  // Bullet holes as it takes hits: punched through, a ring of bare metal, the paint cracked round it
  for (let i = 0; i < Math.floor(damage * 8) + 1; i++) {
    const hx = 14 + ((i * 7) % 14), hy = -40 + ((i * 13) % 34);
    ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.arc(hx, hy, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0F172A'; ctx.beginPath(); ctx.arc(hx, hy, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1E40AF'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(hx + 2, hy - 1); ctx.lineTo(hx + 3.6, hy - 2.4); ctx.moveTo(hx - 2, hy + 1); ctx.lineTo(hx - 3.2, hy + 2.8); ctx.stroke();
  }
};

/** A goon behind a car door he's torn off something (the window's gone, it's full of holes); he drops it to throw a bottle. */
const drawCardoor = (ctx: Ctx, e: Enemy, f: number) => {
  const HOOD = '#334155';
  const damage = 1 - e.health / e.maxHealth;
  legs(ctx, -26, f, 0, '#374151', 'work');
  // Door down at his side
  if (!e.isShieldActive) { ctx.save(); ctx.translate(-36, -1); ctx.scale(0.6, 0.52); carDoor(ctx, damage); ctx.restore(); }
  // The back arm (on the door, or hanging)
  arm(ctx, -5, -50, e.isShieldActive ? 6 : -9, e.isShieldActive ? -30 : -33, HOOD, SKIN);
  // Hoodie: the kangaroo pocket, the ribbed waistband, the drawstrings
  body(ctx, -13, -54, 26, 30, HOOD, () => {
    ctx.strokeStyle = dark(HOOD, 0.4); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-7, -30); ctx.lineTo(-5, -40); ctx.lineTo(5, -40); ctx.lineTo(7, -30); ctx.stroke();
    ctx.fillStyle = dark(HOOD, 0.3); ctx.fillRect(-13, -29, 26, 5);
    ctx.fillStyle = dark(HOOD, 0.5); for (let x = -12; x < 13; x += 2) ctx.fillRect(x, -28.4, 0.6, 4);
    ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-2, -54, 0.8, 9); ctx.fillRect(3, -54, 0.8, 7);
  });
  // Head: the hood up, a red bandana over his face, the eyes narrowed over it
  head(ctx, 2, -62, SKIN, 8, { brow: 'mad' });
  ink(ctx, () => { ctx.moveTo(-4, -61.4); ctx.lineTo(10.6, -62); ctx.lineTo(10.4, -55.6); ctx.lineTo(4, -51.4); ctx.lineTo(-3, -55); ctx.closePath(); }, '#B91C1C', 0.9);
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-2.6, -60.6, 12.4, 0.8);
  ctx.fillStyle = '#F8FAFC'; for (const [px, py] of [[1, -58.6], [6, -59], [3.6, -55.6]]) ctx.fillRect(px, py, 1.4, 1.4);
  shaded(ctx, () => {
    ctx.moveTo(-9, -53); ctx.lineTo(-10.4, -63); ctx.quadraticCurveTo(-9, -74.6, 2, -74.6); ctx.quadraticCurveTo(11.4, -74.4, 12.4, -66);
    ctx.lineTo(9.6, -66.6); ctx.quadraticCurveTo(7, -71, 1, -70.8); ctx.quadraticCurveTo(-4, -70.4, -4.6, -63); ctx.lineTo(-3.4, -53); ctx.closePath();
  }, HOOD, -10.4, -74.6, 22.8, 21.6);
  ctx.strokeStyle = dark(HOOD, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(9.4, -67.6); ctx.quadraticCurveTo(7, -71.8, 1, -71.8); ctx.quadraticCurveTo(-5, -71.4, -5.6, -63); ctx.stroke(); // the hood's lining
  if (e.isShieldActive) {
    // Holding the door up in front of him, his hands round its edge
    arm(ctx, 5, -50, 11, -45, HOOD, SKIN);
    carDoor(ctx, damage);
    ink(ctx, () => ctx.roundRect(8.4, -47.6, 4.6, 5, 1.6), SKIN, 0.8);
    ink(ctx, () => ctx.roundRect(8, -33, 4.6, 5, 1.6), SKIN, 0.8);
  } else {
    // Winding up to throw a bottle, by the neck
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const hx = -4.4 - wind * 12, hy = -54;
    arm(ctx, 5, -50, 9, -34, HOOD, SKIN);
    arm(ctx, 0, -50, hx, hy, HOOD, SKIN);
    shaded(ctx, () => ctx.roundRect(hx - 3, hy - 14, 6, 10, 2), '#65A30D', hx - 3, hy - 14, 6, 10, 0.8);
    ink(ctx, () => { ctx.moveTo(hx - 1.4, hy - 4.6); ctx.lineTo(hx + 1.4, hy - 4.6); ctx.lineTo(hx + 1, hy + 2); ctx.lineTo(hx - 1, hy + 2); ctx.closePath(); }, '#4D7C0F', 0.7);
    ink(ctx, () => ctx.rect(hx - 3, hy - 11, 6, 3.6), '#FDE68A', 0.5);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx - 1.6, hy - 10, 3, 1.4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(hx - 2, hy - 13, 1, 9);
    ink(ctx, () => ctx.roundRect(hx - 2.6, hy - 2.4, 5.2, 4.6, 1.6), SKIN, 0.8);
  }
};

/** A snake's body as a tube along `pts`: the ink line, the belly shadow, the scales, the lit back. */
const snakeTube = (ctx: Ctx, pts: [number, number][], w: number, color: string) => {
  const path = (dy: number) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + dy) : ctx.moveTo(x, y + dy))); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(0); ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.stroke();
  path(0); ctx.strokeStyle = dark(color, 0.25); ctx.lineWidth = w; ctx.stroke();
  path(-w * 0.15); ctx.strokeStyle = color; ctx.lineWidth = w * 0.7; ctx.stroke();
  path(-w * 0.3); ctx.strokeStyle = lite(color, 0.25); ctx.lineWidth = w * 0.25; ctx.stroke();
  ctx.lineCap = 'butt';
};

/** A diamondback's diamond: dark brown, edged in cream. */
const diamond = (ctx: Ctx, x: number, y: number, r: number, a = 0) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = '#EDE0C0'; ctx.beginPath(); ctx.moveTo(-r - 1, 0); ctx.lineTo(0, -r * 0.7 - 1); ctx.lineTo(r + 1, 0); ctx.lineTo(0, r * 0.7 + 1); ctx.fill();
  ctx.fillStyle = '#5A3A1E'; ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(0, -r * 0.7); ctx.lineTo(r, 0); ctx.lineTo(0, r * 0.7); ctx.fill();
  ctx.fillStyle = '#7A5530'; ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
};

/** A pit viper's head (wide at the jaws, the dark mask through the eye, the heat pit); its jaws open on the strike. */
const snakeHead = (ctx: Ctx, x: number, y: number, rot: number, color: string, open: boolean) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if (open) {
    // The lower jaw dropped, the pink inside, the fangs down
    ink(ctx, () => { ctx.moveTo(-4, 1); ctx.lineTo(9, 7); ctx.lineTo(7, 9); ctx.lineTo(-3, 4); ctx.closePath(); }, color, 1);
    ink(ctx, () => { ctx.moveTo(-2, 1); ctx.lineTo(10, 0); ctx.lineTo(8, 6); ctx.closePath(); }, '#F9A8D4', 0.8);
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 0.6;
    for (const fx of [5, 8]) { ctx.beginPath(); ctx.moveTo(fx, 0.5); ctx.lineTo(fx + 1.4, 0.5); ctx.lineTo(fx + 0.4, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  }
  shaded(ctx, () => { ctx.moveTo(-5, -1); ctx.quadraticCurveTo(-4, -5, 1, -5); ctx.quadraticCurveTo(8, -5, 10, -2); ctx.quadraticCurveTo(11, 1, 8, 1); ctx.lineTo(open ? -1 : 4, open ? 1 : 3); ctx.quadraticCurveTo(-3, 4, -5, -1); ctx.closePath(); }, color, -6, -6, 17, 10);
  // (the mask, the cream lip under it)
  ctx.fillStyle = '#5A3A1E'; ctx.beginPath(); ctx.moveTo(-3, -1); ctx.lineTo(4, -2.4); ctx.lineTo(6, -1); ctx.lineTo(-2, 1.5); ctx.fill();
  if (!open) { ctx.fillStyle = '#EDE0C0'; ctx.fillRect(0, 1, 6, 1); }
  eye(ctx, 3.4, -2.2, 1.5, 0.6, 0, '#FDE68A');
  ctx.fillStyle = INK; ctx.fillRect(1.6, -4.6, 4, 1); // the brow scale
  ctx.fillRect(8.4, -2.4, 1, 1); ctx.fillRect(6.6, -1, 1, 1); // nostril, pit
  ctx.restore();
};

/** A western diamondback: tan with brown diamonds, coiled up with its head raised; the rattle a blur when it's warning you. */
const drawRattlesnake = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const striking = st === 'strike';
  const rattling = st === 'rattle';
  const body = '#C2A26B';
  if (striking || st === 'recoil') {
    // Stretched out along the ground in an S, head forward
    const reach = striking ? 1 : 0.6;
    const pts: [number, number][] = [];
    for (let x = -26; x <= 14 * reach; x += 2) pts.push([x, -4 - Math.sin((x + f) * 0.35) * 3]);
    // (the rattle on the end)
    for (let i = 0; i < 3; i++) ink(ctx, () => ctx.roundRect(-33 + i * 2.4, -6.5, 3, 5, 1), i % 2 ? '#D6CDB8' : '#EDE6D6', 0.8);
    snakeTube(ctx, pts, 7, body);
    for (let x = -22; x < 12 * reach; x += 7) diamond(ctx, x, -5 - Math.sin((x + f) * 0.35) * 3, 2.6, Math.cos((x + f) * 0.35) * -0.9);
    const hx = 16 * reach + 6;
    snakeHead(ctx, hx - 2, -5, -0.1, body, striking);
    return;
  }
  // Coiled: stacked loops, the tail up with its rattle, the head raised on its neck
  const shake = rattling ? Math.sin(f * 2.4) * 2 : 0;
  // The tail up off the top coil, the rattle on it (its rings, buzzing)
  snakeTube(ctx, [[-10, -11], [-15, -13], [-17 + shake * 0.5, -15]], 4, body);
  for (let i = 0; i < 3; i++) {
    ink(ctx, () => ctx.roundRect(-20.5 + shake, -18.5 - i * 3, 5, 3.4, 1.2), i % 2 ? '#D6CDB8' : '#EDE6D6', 0.8);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-19.5 + shake, -17.6 - i * 3, 1.5, 1);
  }
  if (rattling) { ctx.strokeStyle = 'rgba(237, 230, 214, 0.7)'; ctx.lineWidth = 1; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(-18, -20, 6 + i * 4 + (f % 6), -2.6, -1.2); ctx.stroke(); } }
  for (let i = 0; i < 3; i++) {
    const cy = -3 - i * 4, rx = 16 - i * 3;
    const coil = () => ctx.ellipse(-4, cy, rx, 4.5, 0, 0, Math.PI * 2);
    shadedTop(ctx, coil, i % 2 ? body : '#B08E57', -4 - rx, cy - 4.5, rx * 2, 9);
    ctx.save(); ctx.beginPath(); coil(); ctx.clip();
    for (let x = -4 - rx + 4 + (i % 2) * 3; x < -4 + rx - 2; x += 7) diamond(ctx, x, cy - 0.5, 2.4);
    if (i === 0) { ctx.fillStyle = '#EDE0C0'; ctx.fillRect(-4 - rx, cy + 2.6, rx * 2, 2); } // the belly scales
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-4, cy, rx, 4.5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Neck up in an S and the head, cocked back (further back just before it goes)
  const back = rattling ? Math.min(1, (e.aiTimer || 0) / SNAKE_RATTLE) * 4 : 0;
  const neck: [number, number][] = [];
  for (let t = 0; t <= 1.001; t += 0.125) {
    const u = 1 - t;
    neck.push([u * u * 6 + 2 * u * t * (14 - back) + t * t * (8 - back), u * u * -12 + 2 * u * t * -18 + t * t * -24]);
  }
  snakeTube(ctx, neck, 6, body);
  diamond(ctx, 11 - back * 0.5, -17, 2, 1.2);
  snakeHead(ctx, 10 - back, -25.5, 0.2, body, false);
  // Tongue flicking
  if (f % 30 < 8) { ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(20 - back, -23.5); ctx.lineTo(25 - back, -23.5); ctx.lineTo(27 - back, -25.5); ctx.moveTo(25 - back, -23.5); ctx.lineTo(27 - back, -21.5); ctx.stroke(); }
};

/** A bark scorpion: straw colored, pincers out, its tail curled over its back with the stinger poised. */
const drawScorpion = (ctx: Ctx, e: Enemy, f: number) => {
  const moving = Math.abs(e.vel.x) > 0.3;
  const pinch = e.aiState === 'pinch';
  const body = '#D4A95C', far = dark(body, 0.25);
  // Legs, four a side, jointed (the far side's darker, behind)
  const leg = (i: number, side: number, c: string) => {
    const lx = -6 + i * 4 + side, sw = moving ? Math.sin(f * 0.6 + i * 1.3 + side) * 2 : 0;
    const spread = (i - 1.5) * 3.5 + sw, kx = lx + spread * 0.5, fx = lx + spread;
    const path = () => { ctx.beginPath(); ctx.moveTo(lx, -5); ctx.lineTo(kx, -9.5); ctx.lineTo(fx, 0); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    path(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke();
    path(); ctx.strokeStyle = c; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = lite(c, 0.4); ctx.fillRect(kx - 0.4, -9.8, 0.8, 0.8);
  };
  for (let i = 0; i < 4; i++) leg(i, 1.5, far);
  // The pincers' arms (the far one behind)
  const open = pinch ? Math.abs(Math.sin(f * 0.5)) * 3 : 1;
  const claw = (ox: number, oy: number, c: string) => {
    limb(ctx, 9 + ox, -6 + oy, 12 + ox, -10 + oy, 1.6, c); limb(ctx, 12 + ox, -10 + oy, 15 + ox, -9 + oy, 1.8, c);
    // (the fixed finger, the moving one opening under it, then the swollen hand)
    ink(ctx, () => { ctx.moveTo(17 + ox, -11 + oy); ctx.quadraticCurveTo(21 + ox, -12 - open + oy, 23 + ox, -10 - open + oy); ctx.quadraticCurveTo(21 + ox, -10 + oy, 18 + ox, -9 + oy); ctx.closePath(); }, c, 0.8);
    ink(ctx, () => { ctx.moveTo(18 + ox, -8 + oy); ctx.quadraticCurveTo(21 + ox, -8 + oy, 23 + ox, -7 + open + oy); ctx.quadraticCurveTo(20 + ox, -6 + open * 0.5 + oy, 17 + ox, -7 + oy); ctx.closePath(); }, dark(c, 0.1), 0.8);
    shaded(ctx, () => ctx.ellipse(16.5 + ox, -9 + oy, 3.8, 2.8, 0, 0, Math.PI * 2), c, 12.7 + ox, -11.8 + oy, 7.6, 5.6, 0.8);
    ctx.fillStyle = lite(c, 0.45); ctx.fillRect(15 + ox, -10.6 + oy, 2, 1);
  };
  claw(-2, -1, far);
  // Body: the segmented back (lit along the top, the plates' edges), the head plate in front with its eyes
  const meso = () => ctx.ellipse(-2, -6, 10, 4.2, 0, 0, Math.PI * 2);
  shadedTop(ctx, meso, body, -12, -10.2, 20, 8.4, 0.9);
  ctx.save(); ctx.beginPath(); meso(); ctx.clip();
  ctx.strokeStyle = dark(body, 0.35); ctx.lineWidth = 0.8;
  for (let x = -9; x < 8; x += 3.4) { ctx.beginPath(); ctx.moveTo(x, -10.5); ctx.quadraticCurveTo(x + 1, -6, x, -1.5); ctx.stroke(); }
  ctx.restore();
  shaded(ctx, () => { ctx.moveTo(5, -9.5); ctx.quadraticCurveTo(11, -10.5, 13, -7); ctx.quadraticCurveTo(12, -3, 6, -3); ctx.closePath(); }, body, 5, -10.5, 8, 7.5, 0.9);
  ctx.fillStyle = INK; ctx.fillRect(9, -10, 1.2, 1.2); ctx.fillRect(11.6, -8.4, 1, 1);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(9, -10, 0.6, 0.6);
  for (let i = 0; i < 4; i++) leg(i, 0, body);
  claw(0, 0, body);
  // Tail arching over the back in beaded segments, the bulb and the stinger toward the front
  const flick = pinch ? Math.sin(f * 0.8) * 3 : 0;
  const q = (t: number, a: number[], b: number[], c: number[]) => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]; };
  const segs = [q(0.3, [-10, -6], [-18, -16], [-8, -20 + flick]), q(0.7, [-10, -6], [-18, -16], [-8, -20 + flick]), q(0, [-8, -20 + flick], [0, -22 + flick], [2, -16 + flick]), q(0.4, [-8, -20 + flick], [0, -22 + flick], [2, -16 + flick]), q(0.75, [-8, -20 + flick], [0, -22 + flick], [2, -16 + flick])];
  segs.forEach(([x, y], i) => {
    const r = 3 - i * 0.2;
    shaded(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), body, x - r, y - r, r * 2, r * 2, 0.9);
    ctx.fillStyle = lite(body, 0.45); ctx.fillRect(x - r * 0.6, y - r * 0.6, 1.2, 1);
  });
  const [bx, by] = q(1, [-8, -20 + flick], [0, -22 + flick], [2, -16 + flick]);
  shaded(ctx, () => ctx.ellipse(bx, by, 2.8, 2.2, 0.6, 0, Math.PI * 2), '#C08A3E', bx - 3, by - 3, 6, 5, 0.9);
  ink(ctx, () => { ctx.moveTo(bx + 1.5, by + 0.5); ctx.quadraticCurveTo(bx + 5, by + 2, bx + 5, by + 5); ctx.quadraticCurveTo(bx + 3, by + 3, bx, by + 2); ctx.closePath(); }, '#3F2A10', 0.7);
  ctx.fillStyle = '#A8865A'; ctx.fillRect(bx + 2.4, by + 1.6, 1, 1);
};

/** A coyote: rangy, tan and grey, big ears, a bushy black-tipped tail; hackles up and teeth out when it comes for you. */
const drawCoyote = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState;
  const lunging = st === 'lunge';
  const moving = Math.abs(e.vel.x) > 0.3;
  const cycle = moving ? f * (lunging ? 0.5 : 0.22) : 0;
  const crouch = st === 'bristle' ? 4 : 0;
  if (st === 'bristle') ctx.translate(f % 4 < 2 ? 1 : -1, 0);
  const coat = '#B48A5A', belly = '#E7D5B5', grizzle = '#9C9A94', nose = '#1F1A14';
  // A leg, long and thin: the forelegs straight down, the hind ones bent back at the hock; a paw with its toes
  const leg = (i: number, back: boolean) => {
    const c = back ? dark(coat, 0.2) : coat;
    const hind = i >= 2;
    const lx = (hind ? -14 : 14) + (i % 2 ? 3 : -3);
    const swing = Math.sin(cycle + i * 1.6) * (lunging ? 8 : 4) * (moving ? 1 : 0);
    const top = -18 + crouch;
    const fx = lx + swing * 0.5;
    if (hind) {
      const kx = lx + 3 + swing * 0.2, hx = lx - 2 + swing * 0.35;
      limb(ctx, lx, top, kx, -10 + crouch * 0.5, 4.4, c); limb(ctx, kx, -10 + crouch * 0.5, hx, -5, 2.6, c); limb(ctx, hx, -5, fx, -1.5, 2.2, c);
    } else {
      const kx = lx + swing * 0.3;
      limb(ctx, lx, top, kx, -8, 3.6, c); limb(ctx, kx, -8, fx, -1.5, 2.4, c);
    }
    ink(ctx, () => ctx.ellipse(fx + 1, -1.2, 2.2, 1.2, 0, 0, Math.PI * 2), dark(c, 0.15), 0.8);
  };
  for (const i of [1, 3]) leg(i, true);
  // Tail, bushy, the tip black (tucked low when it's slinking about, straight out on the lunge)
  ctx.save(); ctx.translate(-20, -21 + crouch); ctx.rotate(lunging ? -0.2 : 0.7 + Math.sin(f * 0.1) * 0.1);
  const tail = () => { ctx.moveTo(1, -3); ctx.quadraticCurveTo(-10, -8, -20, -4); ctx.lineTo(-24, -1); ctx.lineTo(-21, 0); ctx.lineTo(-24, 2); ctx.quadraticCurveTo(-12, 7, 1, 3); ctx.closePath(); };
  shadedTop(ctx, tail, coat, -25, -8, 27, 14);
  ctx.save(); ctx.beginPath(); tail(); ctx.clip(); ctx.fillStyle = nose; ctx.fillRect(-26, -9, 7, 18); ctx.fillStyle = grizzle; ctx.fillRect(-18, -8, 14, 3); ctx.restore();
  ctx.beginPath(); tail(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  // Body: deep in the chest, tucked at the waist; the grizzled saddle along the back, the pale belly
  const cy = crouch;
  const bodyPath = () => { ctx.moveTo(22, -26 + cy); ctx.quadraticCurveTo(24, -15 + cy, 16, -12 + cy); ctx.quadraticCurveTo(4, -13 + cy, -6, -15 + cy); ctx.quadraticCurveTo(-18, -12 + cy, -22, -18 + cy); ctx.quadraticCurveTo(-24, -28 + cy, -14, -29 + cy); ctx.quadraticCurveTo(2, -31 + cy, 14, -30 + cy); ctx.quadraticCurveTo(20, -30 + cy, 22, -26 + cy); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); bodyPath(); ctx.clip();
  ctx.fillStyle = coat; ctx.fillRect(-26, -34 + cy, 52, 24);
  ctx.fillStyle = grizzle; ctx.beginPath(); ctx.ellipse(-3, -30 + cy, 18, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(grizzle, 0.3); ctx.fillRect(-16, -31 + cy, 26, 1);
  ctx.fillStyle = dark(grizzle, 0.3); for (const [x, y] of [[-12, -28], [-5, -27], [3, -28.5], [8, -27]]) ctx.fillRect(x, y + cy, 2, 1); // the grizzle's dark tips
  ctx.fillStyle = dark(coat, 0.18); ctx.fillRect(-26, -18 + cy, 52, 8);
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(10, -14 + cy, 12, 3.5, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark(coat, 0.3); ctx.fillRect(-20, -22 + cy, 1, 6); ctx.fillRect(-17, -24 + cy, 1, 7); // the haunch's fold
  ctx.restore();
  ctx.beginPath(); bodyPath(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.stroke();
  // (a ragged fringe on the belly)
  ctx.fillStyle = belly; ctx.strokeStyle = INK; ctx.lineWidth = 0.7;
  for (let x = 2; x < 16; x += 4) { ctx.beginPath(); ctx.moveTo(x, -13 + cy); ctx.lineTo(x + 1.5, -10.5 + cy); ctx.lineTo(x + 3, -13 + cy); ctx.fill(); ctx.stroke(); }
  if (st === 'bristle' || lunging) {
    // Hackles up along the back
    for (let i = -12; i < 12; i += 4) ink(ctx, () => { ctx.moveTo(i, -29 + cy); ctx.lineTo(i + 2, -35 + cy); ctx.lineTo(i + 4, -29.5 + cy); ctx.closePath(); }, grizzle, 0.8);
  }
  for (const i of [0, 2]) leg(i, false);
  // Head: the far ear, the skull and its long muzzle, the near ear (dark inside), the black nose, an amber eye
  const hx = 22, hy = -28 + crouch + (lunging ? 3 : 0);
  ctx.save(); ctx.translate(hx, hy);
  const snarl = lunging || st === 'bristle';
  ink(ctx, () => { ctx.moveTo(-5, -4); ctx.lineTo(-4, -15); ctx.lineTo(0, -5); ctx.closePath(); }, dark(coat, 0.25), 1);
  if (snarl) {
    // The jaw dropped, the red of the mouth, fangs
    ink(ctx, () => { ctx.moveTo(4, 2); ctx.lineTo(14, 4); ctx.lineTo(13, 7); ctx.lineTo(3, 6); ctx.closePath(); }, belly, 1);
    ink(ctx, () => { ctx.moveTo(5, 2); ctx.lineTo(15, 1); ctx.lineTo(13, 4.5); ctx.lineTo(5, 4); ctx.closePath(); }, '#7F1D1D', 0.6);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(12, 1.4, 1, 2); ctx.fillRect(9, 1.4, 1, 1.4); ctx.fillRect(11, 3.6, 1, 1.4);
  }
  const headPath = () => { ctx.moveTo(-7, -1); ctx.quadraticCurveTo(-6, -7, 1, -7); ctx.quadraticCurveTo(5, -6.5, 7, -3.5); ctx.lineTo(15.5, -1); ctx.quadraticCurveTo(17.5, 0.5, 15.5, 1.8); ctx.lineTo(snarl ? 5 : 6, snarl ? 2 : 4); ctx.quadraticCurveTo(-3, 7, -7, -1); ctx.closePath(); };
  shaded(ctx, headPath, coat, -7, -7, 24, 13);
  ctx.save(); ctx.beginPath(); headPath(); ctx.clip();
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(4, 4, 9, 3.2, -0.15, 0, Math.PI * 2); ctx.fill(); // the pale cheek and throat
  ctx.fillStyle = grizzle; ctx.fillRect(-7, -8, 9, 2.4); // the grey crown
  ctx.restore();
  ink(ctx, () => { ctx.moveTo(-1, -6); ctx.lineTo(2, -16); ctx.lineTo(5, -5); ctx.closePath(); }, coat, 1);
  ctx.fillStyle = '#4A3424'; ctx.beginPath(); ctx.moveTo(1, -6); ctx.lineTo(2.3, -13); ctx.lineTo(3.8, -6); ctx.fill();
  ink(ctx, () => ctx.ellipse(15.6, 0, 1.8, 1.5, 0, 0, Math.PI * 2), nose, 0.6);
  ctx.fillStyle = '#6B6B6B'; ctx.fillRect(15, -0.8, 1, 0.8);
  eye(ctx, 4, -3, 1.6, 0.8, 0, snarl ? '#FDBA74' : '#FBBF24');
  ctx.fillStyle = INK; ctx.fillRect(1.6, snarl ? -5.4 : -5.2, 5, 0.9); // the brow (down when it means it)
  if (!snarl) { ctx.fillRect(9, 2.2, 6, 0.8); }
  ctx.restore();
};

/** Tourists in the old west town: a gift-shop cowboy hat (the tag still on), a souvenir tee, a fanny pack, socks and sandals; what they're up to is their variant. */
const TEES = ['#F97316', '#22D3EE', '#F472B6', '#A3E635', '#FDE047', '#E5E7EB'];
const TOURIST_SKIN = ['#F2C9A0', '#E0AC69', '#C68642', '#8D5524', '#FBD5B0'];
const drawVisitor = (ctx: Ctx, e: Enemy, f: number) => {
  const seed = Math.abs(Math.round(e.homeX || 0));
  const v = e.variant ?? 0;
  const skin = TOURIST_SKIN[seed % TOURIST_SKIN.length], tee = TEES[(v + seed) % TEES.length];
  const panicking = e.aiState === 'flee' || e.aiState === 'shelter';
  const running = panicking || Math.abs(e.vel.x) > 1;
  // Cargo shorts, white socks pulled up, sandals
  legs(ctx, -32, f * (running ? 1.8 : 0.8), running ? 7 : Math.abs(e.vel.x) > 0.2 ? 3 : 0, '#A3A38A', 'sandal', skin, '#A3A38A');
  const swing = running && !panicking ? Math.sin(f * 0.45) * 6 : 0;
  if (!panicking) arm(ctx, -5, -50, -9, -35 + swing, tee, skin, true);
  // The souvenir tee: a Zia sun over NM, the collar
  body(ctx, -11, -54, 22, 24, tee, () => {
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-1.4, -50.4, 2.8, 2.8);
    for (const [dx, dy, w, h] of [[-4.6, -49.6, 2.4, 0.7], [-4.6, -48.4, 2.4, 0.7], [2.2, -49.6, 2.4, 0.7], [2.2, -48.4, 2.4, 0.7], [-0.6, -53.4, 0.7, 2.4], [0.6, -53.4, 0.7, 2.4], [-0.6, -47, 0.7, 2.4], [0.6, -47, 0.7, 2.4]]) ctx.fillRect(dx, dy, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center';
    { const t = ctx.getTransform(); ctx.save(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(-1, 1); ctx.fillText('NM', 0, -38); ctx.restore(); }
    ctx.fillStyle = dark(tee, 0.3); ctx.beginPath(); ctx.arc(1, -54, 3, 0, Math.PI); ctx.fill();
  });
  // The fanny pack, its zip, its buckle
  shaded(ctx, () => ctx.roundRect(-8, -34, 16, 6, 2), '#1E3A8A', -8, -34, 16, 6);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-6, -32.4, 12, 0.7);
  ink(ctx, () => ctx.rect(-11.4, -32.4, 3, 2.4), '#111827', 0.6);
  // Head, the sunburn, the hat (the brim curled, the crown pinched, a band, the price tag)
  const tint = panicking && e.disgusted ? 'rgba(132, 204, 22, 0.4)' : 'rgba(239, 68, 68, 0.15)';
  head(ctx, 2, -62, skin, 8, panicking ? { brow: 'up', mouth: e.disgusted ? 'gag' : 'open', tint } : { mouth: 'smile', tint });
  ink(ctx, () => ctx.ellipse(8.4, -60.4, 1.8, 1.4, 0, 0, Math.PI * 2), '#F87171', 0.6);
  ctx.fillStyle = '#FECACA'; ctx.fillRect(7.6, -61.2, 0.8, 0.6);
  const hat = ['#D6B98C', '#1C1917', '#F8FAFC'][seed % 3];
  shaded(ctx, () => { ctx.moveTo(-6, -67.6); ctx.lineTo(-7, -75); ctx.quadraticCurveTo(-6, -78, -2, -77); ctx.quadraticCurveTo(1, -75.6, 4, -77); ctx.quadraticCurveTo(9, -78, 9.6, -75); ctx.lineTo(9, -67.6); ctx.closePath(); },
    hat, -7, -78, 16.6, 10.4);
  ink(ctx, () => ctx.rect(-6.4, -70.6, 15.8, 2), '#7C2D12', 0.6);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-4, -70.2, 1.2, 1.2);
  shaded(ctx, () => {
    ctx.moveTo(-14, -71.4); ctx.quadraticCurveTo(-11, -67.6, -5, -68); ctx.lineTo(9, -68); ctx.quadraticCurveTo(15, -67.6, 17, -71.4);
    ctx.quadraticCurveTo(16.4, -65.4, 2, -65.2); ctx.quadraticCurveTo(-12.4, -65.4, -14, -71.4); ctx.closePath();
  }, hat, -14, -71.4, 31, 6.2);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(14, -67); ctx.lineTo(15, -63.4); ctx.stroke();
  ink(ctx, () => ctx.rect(14, -63.6, 3, 2.4), '#F8FAFC', 0.5);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(14.8, -62.8, 1.4, 0.7);
  if (panicking && e.disgusted) {
    // Running from the smell: gone green, gagging, one hand pinching the nose, the other waving it away
    const wave = Math.sin(f * 0.7) * 6;
    arm(ctx, -5, -50, -10, -66 + wave, tee, skin, true);
    arm(ctx, 5, -50, 10, -60, tee, skin, true);
  } else if (panicking) {
    const flail = Math.sin(f * 0.6) * 5;
    arm(ctx, -5, -50, -10, -72 + flail, tee, skin, true);
    arm(ctx, 5, -50, 10, -72 - flail, tee, skin, true);
  } else if (v === 0 || v === 2) {
    // A camera up to the face, snapping away (a flash now and then)
    arm(ctx, 5, -50, 12, -59, tee, skin, true);
    shaded(ctx, () => ctx.roundRect(11, -66.6, 9, 7, 1.2), '#1F2937', 11, -66.6, 9, 7, 0.8);
    ink(ctx, () => ctx.rect(12, -68.4, 3.6, 1.8), '#374151', 0.5);
    ink(ctx, () => ctx.arc(20.4, -63, 2.8, 0, Math.PI * 2), '#4B5563', 0.8);
    ctx.fillStyle = '#93C5FD'; ctx.beginPath(); ctx.arc(20.6, -63, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(19.8, -64, 0.8, 0.8);
    ink(ctx, () => ctx.roundRect(10, -61.6, 4.4, 4.4, 1.4), skin, 0.7);
    if (f % 140 < 4) glow(ctx, 22, -64, 5, 0.9);
  } else if (v === 4) {
    // A churro, sugared, a bite out of it
    arm(ctx, 5, -50, 14, -45, tee, skin, true);
    ctx.save(); ctx.translate(15, -47); ctx.rotate(-0.8);
    shaded(ctx, () => { ctx.moveTo(0, -2); ctx.lineTo(16, -2); ctx.arc(16, 0, 2, -Math.PI / 2, -0.4); ctx.lineTo(15, 2); ctx.lineTo(0, 2); ctx.closePath(); }, '#B45309', 0, -2, 18, 4, 0.7);
    ctx.fillStyle = dark('#B45309', 0.35); for (let i = 2; i < 15; i += 3) ctx.fillRect(i, -1.6, 0.7, 3.2);
    ctx.fillStyle = '#FEF3C7'; for (let i = 1; i < 15; i += 2.2) ctx.fillRect(i, -1.8 + (i % 3) * 0.8, 0.8, 0.8);
    ctx.restore();
    ink(ctx, () => ctx.roundRect(12, -47.6, 5, 4.6, 1.6), skin, 0.7);
  } else {
    // Arm out with a map, unfolded, the route in red, the town circled
    arm(ctx, 5, -50, 11, -35 - swing, tee, skin, true);
    ink(ctx, () => ctx.rect(8, -40, 12, 9), '#FEF3C7', 0.7);
    ctx.fillStyle = dark('#FEF3C7', 0.15); ctx.fillRect(12, -40, 0.7, 9); ctx.fillRect(16, -40, 0.7, 9);
    ctx.fillStyle = '#86EFAC'; ctx.fillRect(9, -37, 3, 2);
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(9, -33); ctx.lineTo(13, -36); ctx.lineTo(16, -34); ctx.stroke();
    ctx.beginPath(); ctx.arc(17, -35.4, 1.6, 0, Math.PI * 2); ctx.stroke();
    ink(ctx, () => ctx.roundRect(8.6, -37, 4.4, 4.4, 1.4), skin, 0.7);
  }
};

/** (Dale's distributor is drawn by the stage: this is only for anything that draws him out of context: shaved, goatee, gold grill, the tank top, the chains.) */
const drawJunkieStandIn = (ctx: Ctx, f: number) => {
  const JSKIN = '#C08457';
  legs(ctx, -30, f, 0, '#A89F80', 'work');
  arm(ctx, -12, -66, -16, -38, JSKIN, JSKIN, false, 6.4);
  const torso = () => ctx.roundRect(-14, -72, 28, 44, [8, 8, 2, 2]);
  shaded(ctx, torso, JSKIN, -14, -72, 28, 44);
  ctx.save(); ctx.beginPath(); torso(); ctx.clip();
  shaded(ctx, () => { ctx.moveTo(-12, -28); ctx.lineTo(-11, -64); ctx.lineTo(-6, -72); ctx.quadraticCurveTo(0, -62, 6, -72); ctx.lineTo(11, -64); ctx.lineTo(12, -28); ctx.closePath(); }, '#F5F5F4', -12, -72, 24, 44);
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.18)'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let i = 0; i < 3; i++) { ctx.moveTo(-7, -54 + i * 6); ctx.lineTo(7, -54 + i * 6); } ctx.stroke(); // the ribs
  ctx.restore();
  ctx.beginPath(); torso(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  belt(ctx, -32, 26);
  for (const [r, a] of [[9, 0.3], [13, 0.4]]) {
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(1, -72 + (r - 9) * 0.5, r, a, Math.PI - a);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  }
  head(ctx, 3, -82, JSKIN, 10, { mouth: 'grin', brow: 'mad', shine: true });
  ctx.fillStyle = '#FACC15'; ctx.fillRect(4, -76.2, 5.2, 1.2); ctx.fillStyle = '#A16207'; ctx.fillRect(5.6, -76.2, 0.7, 1.2); // the grill
  ink(ctx, () => ctx.roundRect(3.4, -78.2, 7, 1.6, 0.6), '#1C1917', 0.4);                                                      // the mustache
  ink(ctx, () => { ctx.moveTo(4.4, -73.6); ctx.lineTo(8.8, -73.6); ctx.lineTo(7.4, -69.6); ctx.lineTo(5.6, -69.6); ctx.closePath(); }, '#1C1917', 0.5); // the goatee
  ink(ctx, () => ctx.rect(-1.6, -73, 6, 2), '#1E3A8A', 0.4);                                                                   // the neck tattoo
  arm(ctx, 11, -66, 15, -38, JSKIN, JSKIN, false, 6.4);
};

/** A red-tailed hawk: brown back, a pale streaked belly, the brick-red tail fanned out, a hooked beak; talons out on the stoop. */
const drawHawk = (ctx: Ctx, e: Enemy, f: number) => {
  const diving = e.aiState === 'dive';
  ctx.translate(0, -e.height / 2);
  if (diving) ctx.rotate(Math.atan2(e.vel.y, Math.abs(e.vel.x)) * 0.8);
  const flap = diving ? 0 : Math.sin(f * 0.25);
  // A wing: the arm lit along its leading edge, the coverts' band, the flight feathers fingered out at the tip
  const wing = (color: string, lift: number) => {
    const up = lift * 22;
    const path = () => {
      ctx.moveTo(6, -3);
      if (diving) { ctx.lineTo(-24, -6); ctx.lineTo(-27, -3.5); ctx.lineTo(-24, -2.5); ctx.lineTo(-26, 0); ctx.lineTo(-4, 3); }
      else {
        ctx.lineTo(-6, -3 - up * 0.8); ctx.lineTo(-22, -5 - up);
        // (the fingers)
        const ax = -22, ay = -5 - up, bx = -30, by = -2 - up * 0.9;
        for (let k = 1; k < 4; k++) { const t = k / 4, x = ax + (bx - ax) * t, y = ay + (by - ay) * t; ctx.lineTo(x - 2, y - 1.5); ctx.lineTo(x + 0.5, y + 0.6); }
        ctx.lineTo(-30, -2 - up * 0.9); ctx.lineTo(-20, 2 - up * 0.4);
        // (the trailing edge, scalloped feather by feather)
        for (let k = 1; k <= 4; k++) { const t = k / 4, x = -20 + 12 * t, y = 2 - up * 0.4 * (1 - t) + t; ctx.lineTo(x - 1.5, y + 1.2); ctx.lineTo(x, y); }
      }
      ctx.closePath();
    };
    const top = Math.min(-8, -6 - up), bot = Math.max(4, -2 - up * 0.9, 3.5 - up * 0.4);
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    ctx.fillStyle = color; ctx.fillRect(-32, top - 2, 40, bot - top + 4);
    ctx.fillStyle = lite(color, 0.22); ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(-6, -4 - up * 0.8); ctx.lineTo(-22, -6 - up); ctx.lineTo(-22, -3 - up); ctx.lineTo(-6, -1 - up * 0.8); ctx.lineTo(6, -1); ctx.fill();
    ctx.fillStyle = dark(color, 0.35); ctx.fillRect(-34, top - 2, diving ? 10 : 12, bot - top + 4); // the dark primaries
    ctx.strokeStyle = dark(color, 0.3); ctx.lineWidth = 0.8;
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-6 - k * 4, -1 - up * (0.55 - k * 0.02)); ctx.lineTo(-8 - k * 4, 3 - up * 0.3); ctx.stroke(); }
    ctx.fillStyle = dark(color, 0.18); ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-6, -1 - up * 0.7); ctx.lineTo(-20, -2 - up * 0.92); ctx.lineTo(-20, 0 - up * 0.8); ctx.lineTo(-6, 1 - up * 0.55); ctx.lineTo(4, 2); ctx.fill(); // the coverts' edge
    ctx.fillStyle = '#F5E6D3'; ctx.fillRect(-14, -1.6 - up * 0.6, 1, 1); ctx.fillRect(-10, -1.2 - up * 0.65, 1, 1);
    ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  };
  wing('#4E321A', flap * 0.8 + 0.2);
  // The fanned red tail, its dark band and pale tip
  const tail = () => { ctx.moveTo(-12, -2.5); ctx.lineTo(-26, -8); ctx.quadraticCurveTo(-29, -1, -27, 6); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); tail(); ctx.clip();
  ctx.fillStyle = '#B45309'; ctx.fillRect(-30, -9, 20, 16);
  ctx.fillStyle = lite('#B45309', 0.2); ctx.fillRect(-30, -9, 20, 4);
  ctx.fillStyle = '#5A2A0A'; ctx.fillRect(-26, -9, 2, 16);
  ctx.fillStyle = '#F5E6D3'; ctx.fillRect(-30, -9, 2.6, 16);
  ctx.restore();
  ctx.beginPath(); tail(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // Body: brown above, pale streaked below
  const bodyPath = () => { ctx.moveTo(14, -6); ctx.quadraticCurveTo(4, -9, -8, -6); ctx.quadraticCurveTo(-15, -3, -13, 1); ctx.quadraticCurveTo(-4, 7, 8, 5); ctx.quadraticCurveTo(15, 3, 14, -6); ctx.closePath(); };
  shadedTop(ctx, bodyPath, '#6B4423', -15, -9, 30, 15);
  ctx.save(); ctx.beginPath(); bodyPath(); ctx.clip();
  ctx.fillStyle = '#F5E6D3'; ctx.beginPath(); ctx.ellipse(3, 3.5, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D9C4A8'; ctx.fillRect(-8, 5, 20, 2);
  ctx.fillStyle = '#6B4423'; for (let k = -4; k <= 8; k += 3) ctx.fillRect(k, 1.5 + (k % 2 ? 1 : 0), 1, 2.5); // the belly band's streaks
  ctx.restore();
  ctx.beginPath(); bodyPath(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  if (diving) {
    // The talons out: feathered legs, yellow feet, the black hooks
    for (const lx of [6, 10]) {
      ink(ctx, () => ctx.ellipse(lx, 4, 2.4, 3, 0, 0, Math.PI * 2), '#D9C4A8', 0.8);
      limb(ctx, lx, 6, lx + 1, 11, 2, '#FACC15');
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(lx - 1, 11); ctx.quadraticCurveTo(lx - 2, 13, lx - 1, 14); ctx.moveTo(lx + 2, 11); ctx.quadraticCurveTo(lx + 4, 12, lx + 4, 14); ctx.stroke();
    }
  }
  wing('#7C4A24', flap);
  // Head: the dark crown, a pale throat, the yellow cere, the hooked beak, a fierce eye under its brow
  const headPath = () => { ctx.moveTo(9, -6); ctx.quadraticCurveTo(13, -9, 17, -7); ctx.quadraticCurveTo(20, -5, 19, -1); ctx.quadraticCurveTo(16, 3, 11, 2); ctx.quadraticCurveTo(8, 0, 9, -6); ctx.closePath(); };
  shaded(ctx, headPath, '#6B4423', 8, -9, 12, 11);
  ctx.save(); ctx.beginPath(); headPath(); ctx.clip(); ctx.fillStyle = '#F5E6D3'; ctx.beginPath(); ctx.ellipse(14, 1.5, 4, 2.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ink(ctx, () => { ctx.moveTo(18, -4.5); ctx.quadraticCurveTo(23, -5, 24, -1.5); ctx.quadraticCurveTo(24, 1.5, 22, 2); ctx.quadraticCurveTo(22.5, 0, 21, -0.4); ctx.lineTo(18.5, -1); ctx.closePath(); }, '#2A2420', 0.8);
  ctx.fillStyle = '#78716C'; ctx.fillRect(20, -3.6, 2, 0.9);
  ink(ctx, () => ctx.roundRect(17.4, -5, 2.4, 3, 0.8), '#FACC15', 0.6);
  eye(ctx, 15.5, -4, 1.5, 0.7, 0, '#FDE68A');
  ctx.fillStyle = INK; ctx.fillRect(13.6, -6.3, 4.6, 1.1);
};
