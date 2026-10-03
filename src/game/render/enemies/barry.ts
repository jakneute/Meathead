// Barry's stage: New York. The street (a pimp with a gold-plated pistol, a hooker
// with a purse she'll swing at you, a mugger with a switchblade, a bum behind his
// shopping cart with a forty to throw, rats), the skyscraper's lobby (a security
// guard, a commuter with a briefcase, a guy behind his newspaper with a coffee),
// the office (an exec with a desk-drawer revolver, an intern at a flat run, HR
// behind a rolling whiteboard with a stapler), maintenance (an exterminator with
// a bug-spray gun, a janitor with a mop, a custodian behind a WET FLOOR sign with
// a spray bottle), the lab (a lab tech with a ray gun, a test subject off his
// leash, a scientist behind a blast shield with a flask), the tenants in their
// windows and Barry's man in the power room.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { drawHouseholdItem } from '../projectiles';
import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { INK, ink, shaded, shadedTop, lite, dark, eye, limb } from '../npc/kit';
import { featherWing } from './hector';
import { drawPerson, type PersonSpec } from '../npc/person';

type Ctx = CanvasRenderingContext2D;

export const drawBarryKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'pimp': drawPimp(ctx, e, f); break;
    case 'hooker': drawHooker(ctx, e, f); break;
    case 'mugger': drawMugger(ctx, e, f); break;
    case 'bum': drawBum(ctx, e, f); break;
    case 'rat': drawRat(ctx, e, f); break;
    case 'pigeon': drawPigeon(ctx, e, f); break;
    case 'guard': drawGuard(ctx, e, f); break;
    case 'commuter': drawCommuter(ctx, e, f); break;
    case 'reader': drawReader(ctx, e, f); break;
    case 'exec': drawExec(ctx, e, f); break;
    case 'intern': drawIntern(ctx, e, f); break;
    case 'hr': drawHr(ctx, e, f); break;
    case 'exterminator': drawExterminator(ctx, e, f); break;
    case 'janitor': drawJanitor(ctx, e, f); break;
    case 'custodian': drawCustodian(ctx, e, f); break;
    case 'labtech': drawLabtech(ctx, e, f); break;
    case 'subject': drawSubject(ctx, e, f); break;
    case 'scientist': drawScientist(ctx, e, f); break;
    case 'tenant': drawTenant(ctx, e, f); break;
    case 'minion': drawMinion(ctx, e, f); break;
    case 'generator': drawGeneratorBox(ctx, e, f); break;
  }
  void state;
};

const SKINS = ['#F2C9A0', '#C68642', '#8D5524', '#E0AC69', '#5C3A21'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round(e.homeX || 0)) % SKINS.length];
const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);

// The goons are drawn the townsfolk's way (an ink line round every part, each part shaded in steps, a face with eyes
// and brows and a mouth that does something, hands), out of a few parts of their own: legs, a body, a head, hair, arms.

/** Two legs in trousers, shaded, soled shoes; striding when `stride` is up. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe = '#111827') => {
  const s = Math.sin(f * 0.25) * stride;
  for (const x of [-8 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, hipY, 7, -hipY - 4), pants, x, hipY, 7, -hipY - 4);
    ink(ctx, () => ctx.roundRect(x - 1, -5, 10, 5, [2.5, 3, 1, 1]), shoe, 1);
    ctx.fillStyle = lite(shoe, 0.35); ctx.fillRect(x, -4.4, 3, 1);
    ctx.fillStyle = lite(shoe, 0.55); ctx.fillRect(x - 1, -1, 10, 1);
  }
};

/** A body (a coat, a shirt, a gown): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
const body = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, detail?: () => void, r: number | number[] = [5, 5, 2, 2]) => {
  const path = () => ctx.roundRect(x, y, w, h, r);
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

type Mouth = 'flat' | 'frown' | 'smirk' | 'grin' | 'open' | 'o' | 'snarl' | 'none';
interface Face { mouth?: Mouth; brow?: 'flat' | 'mad' | 'up'; eyes?: boolean; lips?: string; glasses?: boolean; neck?: boolean }

/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, eyes and brows, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, o: Face = {}) => {
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
  const ey = y - 1, scared = o.brow === 'up';
  if (o.eyes !== false) {
    for (const [ex, back] of [[x + 1, true], [x + 5.5, false]] as const) {
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - (scared ? 2 : 1.5), 3, scared ? 3.8 : 3);
      ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
      if (o.brow === 'mad') { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
      else ctx.fillRect(ex - 1.5, ey - (scared ? 5 : 3.6), 3, 1);
    }
    if (o.glasses) { ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(x - 1, ey - 2.4, 4, 4); ctx.strokeRect(x + 3.6, ey - 2.4, 4, 4); ctx.beginPath(); ctx.moveTo(x - 1, ey - 1); ctx.lineTo(x - r + 3, ey - 0.4); ctx.stroke(); }
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  // (the mouth)
  const mx = x + 3.4, my = y + r * 0.62;
  if (o.lips) { ctx.fillStyle = o.lips; ctx.fillRect(mx - 2.4, my - 0.8, 5, 2.2); }
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (o.mouth ?? 'flat') {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'frown': ctx.beginPath(); ctx.arc(mx, my + 1.8, 2.4, Math.PI + 0.3, -0.3); ctx.stroke(); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(mx - 2, my + 0.6); ctx.lineTo(mx + 1, my + 0.4); ctx.lineTo(mx + 2.6, my - 0.8); ctx.stroke(); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'snarl': ctx.fillRect(mx - 2.6, my - 0.6, 5.6, 2.4); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(mx - 2 + k * 1.8, my - 0.4, 1.2, 1); break;
    case 'open': ink(ctx, () => ctx.ellipse(mx, my + 0.6, 2.6, 2.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.7); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 1.6, my - 1.8, 3.2, 0.9); break;
    case 'o': ink(ctx, () => ctx.ellipse(mx, my + 0.4, 1.5, 1.9, 0, 0, Math.PI * 2), '#450A0A', 0.6); break;
  }
};

/** Hair over the top of a head at (x, y), r its size: inked, a lit streak. */
const hairCap = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ink(ctx, () => { ctx.ellipse(x - 0.6, y - r * 0.35, r + 0.6, r * 0.82, 0, Math.PI * 1.02, Math.PI * 2.06); ctx.lineTo(x + r - 2, y - r * 0.3); ctx.closePath(); }, color, 1);
  ctx.fillStyle = lite(color, 0.3); ctx.fillRect(x - 3, y - r * 0.95, 5, 1.2);
};

/** A peaked cap on a head at (x, y): the crown, the bill out front, a lit edge. */
const cap = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ink(ctx, () => { ctx.ellipse(x - 0.5, y - r * 0.45, r + 0.8, r * 0.75, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, color, 1);
  ink(ctx, () => ctx.roundRect(x + r - 3.5, y - r * 0.55, 9, 2.6, 1), dark(color, 0.2), 0.8);
  ctx.fillStyle = lite(color, 0.35); ctx.fillRect(x - 3, y - r * 1.05, 5, 1.2);
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy): sleeved all the way (or short-sleeved), the hand. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, short = false, w = 5.5) => {
  limb(ctx, sx, sy, hx, hy, w, short ? skin : sleeve);
  if (short) limb(ctx, sx, sy, sx + (hx - sx) * 0.4, sy + (hy - sy) * 0.4, w + 0.6, sleeve);
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), skin, 0.8);
};

/** A stepped glow (the muzzle about to go, a ray gun's coil): an outer ring, a hot middle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a: number) => {
  ctx.fillStyle = `rgba(${rgb}, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** A pistol out in front at chest height (x, y the grip), glowing at the muzzle before it fires; a revolver's cylinder. */
const pistol = (ctx: Ctx, x: number, y: number, e: Enemy, metal = '#1F2937', revolver = false) => {
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 5.4, y + 7); ctx.lineTo(x - 0.8, y + 7); ctx.closePath(); }, dark(metal, 0.15), 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x + 8, y + 1.2, 2, 0, Math.PI); ctx.stroke(); // the trigger guard
  shadedTop(ctx, () => ctx.rect(x, y - 3, 16, 4.4), metal, x, y - 3, 16, 4.4, 0.8);
  ctx.fillStyle = lite(metal, 0.5); ctx.fillRect(x + 1, y - 2.3, 12, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(x + 14, y - 4, 1.4, 1); ctx.fillRect(x + 15.2, y - 1.6, 0.8, 1.4);
  if (revolver) { ink(ctx, () => ctx.roundRect(x + 4, y - 3.6, 6, 5.4, 1.4), lite(metal, 0.15), 0.8); ctx.fillStyle = dark(metal, 0.3); ctx.fillRect(x + 5, y - 1.4, 4, 0.8); }
  const c = charge(e);
  if (c > 0.6) glow(ctx, x + 19, y - 1, 2 + c * 3, '254, 240, 138', c);
};

/** The gun arm: out in front from the shoulder, the fist round the pistol's grip. */
const gunArm = (ctx: Ctx, e: Enemy, sleeve: string, skin: string, metal?: string, short = false, revolver = false) => {
  arm(ctx, 6, -51, 16, -42, sleeve, skin, short);
  pistol(ctx, 16, -43, e, metal, revolver);
  ink(ctx, () => ctx.roundRect(14.2, -43.4, 5, 4.6, 1.6), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(15, -41.4, 3.4, 0.6);
};

/** The wind-up behind the head with whatever he's going to throw (drawn by `item`, the hand round it), shield down at his side. */
const windUp = (ctx: Ctx, e: Enemy, sleeve: string, skin: string, item: (x: number, y: number) => void) => {
  const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
  const hx = -3 - wind * 12, hy = -60;
  arm(ctx, -1, -50, hx + 1, hy + 6, sleeve, skin);
  item(hx, hy);
  ink(ctx, () => ctx.ellipse(hx + 1.8, hy + 6.4, 2.4, 2, 0, 0, Math.PI * 2), skin, 0.7);
};

/** A thing to throw: a white cup with its lid and a band round it (a coffee); `band` its colour. */
const cup = (ctx: Ctx, x: number, y: number, band = '#15803D', h = 10) => {
  ink(ctx, () => { ctx.moveTo(x - 3.4, y); ctx.lineTo(x + 3.6, y); ctx.lineTo(x + 2.8, y + h); ctx.lineTo(x - 2.6, y + h); ctx.closePath(); }, '#F8FAFC', 0.8);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x + 1.6, y + 0.6, 1.4, h - 1);
  ink(ctx, () => ctx.rect(x - 3, y + h * 0.35, 6.4, h * 0.3), band, 0.6);
  ink(ctx, () => ctx.roundRect(x - 4, y - 1.8, 8.2, 2.2, 0.8), '#E7E5E4', 0.7);
};

// ---------------------------------------------------------------------------
// The street
// ---------------------------------------------------------------------------

/** A pimp: a purple fur coat, a wide-brimmed hat with a feather, gold chains, shades, a gold-plated pistol. */
const drawPimp = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#6D28D9', '#F8FAFC');
  // The coat, long; the shirt open under it
  body(ctx, -15, -56, 30, 34, '#7C3AED', () => {
    ctx.fillStyle = '#F5F3FF'; ctx.beginPath(); ctx.moveTo(-5, -56); ctx.lineTo(5, -56); ctx.lineTo(3, -30); ctx.lineTo(-3, -30); ctx.fill();
    ctx.fillStyle = '#DDD6FE'; ctx.fillRect(2, -56, 2, 26);
    ctx.fillStyle = dark('#7C3AED', 0.3); ctx.fillRect(-5.6, -56, 0.8, 26); ctx.fillRect(4.8, -56, 0.8, 26);
  });
  // The fur, down both edges of it, in tufts
  for (let y = -54; y < -22; y += 5) for (const fx of [-13, 13]) {
    const jx = fx + ((y / 5) % 2 ? 0.8 : -0.8);
    ink(ctx, () => ctx.ellipse(jx, y + 2, 3.6, 3, 0, 0, Math.PI * 2), '#C4B5FD', 0.7);
    ctx.fillStyle = '#EDE9FE'; ctx.fillRect(jx - 2, y + 0.6, 2, 1);
  }
  // Gold chains, a medallion
  for (const dy of [6, 10]) {
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-4.5, -55); ctx.quadraticCurveTo(0, -55 + dy * 1.4, 4.5, -55);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke(); ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.1; ctx.stroke(); ctx.lineCap = 'butt';
  }
  ink(ctx, () => ctx.arc(0, -40, 2.6, 0, Math.PI * 2), '#FACC15', 0.8);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-1, -41.4, 1.2, 1.2);
  head(ctx, 2, -64, skin, 8, { mouth: 'smirk', eyes: false });
  ctx.fillStyle = '#FACC15'; ctx.fillRect(6, -59.4, 1.2, 1); // a gold tooth
  ink(ctx, () => ctx.roundRect(1, -67.6, 11, 3.6, [0.6, 1.6, 1.6, 0.6]), '#111827', 0.7); // shades
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(3, -66.8, 2, 0.8); ctx.fillRect(8, -66.8, 2, 0.8);
  // The hat: wide brim, the crown, a gold band, the feather
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, -76); ctx.quadraticCurveTo(-18, -92, -10, -96); ctx.quadraticCurveTo(-11, -84, -4, -78);
  ctx.fillStyle = '#F472B6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.strokeStyle = '#FBCFE8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-6, -77); ctx.quadraticCurveTo(-14, -88, -10, -95); ctx.stroke(); ctx.lineCap = 'butt';
  ink(ctx, () => ctx.ellipse(1, -71, 17, 3.5, 0, 0, Math.PI * 2), '#6D28D9', 1);
  ctx.fillStyle = lite('#6D28D9', 0.3); ctx.fillRect(-12, -73, 10, 1);
  shaded(ctx, () => ctx.roundRect(-8, -81, 18, 10, [4, 4, 0, 0]), '#6D28D9', -8, -81, 18, 10);
  ink(ctx, () => ctx.rect(-8, -75, 18, 2.2), '#FACC15', 0.7);
  gunArm(ctx, e, '#7C3AED', skin, '#EAB308');
};

/** A hooker: platinum wig, a pink minidress and fishnets, platform heels, a big purse she swings at you. */
const drawHooker = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e);
  const c = ['#EC4899', '#A855F7', '#EF4444', '#22D3EE'][(e.variant ?? 0) % 4];
  const s = Math.sin(f * (running ? 0.45 : 0.2)) * (running ? 6 : 1);
  // Legs in fishnets, the platforms
  for (const x of [-7 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, -30, 6, 23), skin, x, -30, 6, 23);
    ctx.save(); ctx.beginPath(); ctx.rect(x, -30, 6, 23); ctx.clip();
    ctx.strokeStyle = 'rgba(26, 11, 6, 0.55)'; ctx.lineWidth = 0.6; ctx.beginPath();
    for (let y = -34; y < -4; y += 3) { ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 4); ctx.moveTo(x + 6, y); ctx.lineTo(x, y + 4); }
    ctx.stroke(); ctx.restore();
    ink(ctx, () => ctx.roundRect(x - 1, -8, 8, 5, [2, 2.6, 0, 0]), c, 0.9);
    ink(ctx, () => ctx.rect(x - 1, -3, 8, 3), dark(c, 0.4), 0.9);
    ctx.fillStyle = lite(c, 0.4); ctx.fillRect(x, -7, 3, 1);
  }
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.18 : 0);
  arm(ctx, -5, -24, -8, -6, skin, skin, false, 4.6);
  // The wig, behind; the shoulders; the dress
  ink(ctx, () => ctx.roundRect(-11, -46, 10, 20, 4), '#FEF9C3', 1);
  ink(ctx, () => ctx.roundRect(-8, -31, 16, 6, 3), skin, 0.9);
  const dress = () => { ctx.moveTo(-11, 0); ctx.lineTo(-9, -28); ctx.lineTo(9, -28); ctx.lineTo(11, 0); ctx.closePath(); };
  shaded(ctx, dress, c, -11, -28, 22, 28);
  ctx.fillStyle = lite(c, 0.55); for (const [x, y] of [[-6, -22], [-3, -14], [-7, -7], [2, -20], [-1, -5]]) ctx.fillRect(x, y, 1, 1); // sequins
  head(ctx, 2, -38, skin, 8, { mouth: 'smirk', lips: '#DC2626' });
  ctx.fillStyle = INK; ctx.fillRect(4.6, -41.6, 2.4, 0.8); ctx.fillRect(9.2, -41.6, 1.8, 0.8); // lashes
  hairCap(ctx, 2, -38, 9.4, '#FEF9C3');
  ink(ctx, () => ctx.ellipse(-6, -32, 2, 2.2, 0, 0, Math.PI * 2), '#FACC15', 0.6); // a big hoop
  // The purse, swinging round on its strap
  const sw = running ? Math.sin(f * 0.5) * 1.2 : 0.4;
  ctx.save(); ctx.translate(6, -24); ctx.rotate(-0.8 + sw);
  arm(ctx, 0, 0, 12, 0, skin, skin, false, 4.6);
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(22, -1);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke(); ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  shaded(ctx, () => ctx.roundRect(20, -6, 14, 12, [3, 3, 1.5, 1.5]), '#1F2937', 20, -6, 14, 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(22, -4, 4, 1);
  ink(ctx, () => ctx.rect(25, -2, 4, 3), '#FACC15', 0.6);
  ctx.restore();
  ctx.restore();
};

/** A mugger: ski mask, black hoodie, a switchblade, low and fast. */
const drawMugger = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = '#E0AC69', H = '#27272A';
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#3F3F46', '#F8FAFC');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0.05);
  const jab = running ? Math.sin(f * 0.6) * 5 : 0;
  arm(ctx, -6, -23, -10 - jab * 0.6, -6, dark(H, 0.2), skin);
  body(ctx, -12, -28, 24, 28, H, () => {
    ctx.fillStyle = '#18181B'; ctx.fillRect(-7, -12, 14, 6); ctx.fillStyle = INK; ctx.fillRect(-7, -12, 14, 0.8); // the pocket
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(2, -27, 0.9, 6); ctx.fillRect(5, -27, 0.9, 5); // the drawstrings
    ctx.fillStyle = '#18181B'; ctx.fillRect(-12, -4, 24, 4);
  });
  // The ski mask: holes for the eyes and the mouth, the knit
  head(ctx, 2, -35, H, 9, { eyes: false, mouth: 'none' });
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'; for (let x = -5; x < 10; x += 2.4) ctx.fillRect(x, -43, 0.8, 16);
  ink(ctx, () => ctx.roundRect(2.4, -39.4, 9.4, 4.4, 1.8), skin, 0.8);
  for (const ex of [4.6, 9]) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.2, -38.6, 2.6, 2.6); ctx.fillStyle = INK; ctx.fillRect(ex, -38, 1.3, 1.8); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, -39.6); ctx.lineTo(6, -38.6); ctx.moveTo(11, -39.6); ctx.lineTo(8, -38.6); ctx.stroke();
  ink(ctx, () => ctx.ellipse(7.6, -30.4, 2.6, 1.6, 0, 0, Math.PI * 2), skin, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(6, -30.6, 3.4, 0.8);
  // The knife arm
  arm(ctx, 6, -22, 20 + jab, -17, H, skin);
  ink(ctx, () => ctx.roundRect(22 + jab, -19, 5.4, 3.2, 1), '#1F2937', 0.7);
  ink(ctx, () => { ctx.moveTo(27 + jab, -19.2); ctx.lineTo(38 + jab, -18); ctx.lineTo(27 + jab, -15.8); ctx.closePath(); }, '#D4D4D8', 0.7);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(28 + jab, -18.6, 7, 0.8);
  ink(ctx, () => ctx.roundRect(18.4 + jab, -19.6, 4.8, 5, 1.6), skin, 0.8);
  ctx.restore();
};

/** A bum behind his shopping cart (full of cans, a flag stuck in it); drops back to throw a forty in a paper bag. */
const drawBum = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), COAT = '#78716C';
  legs(ctx, -26, f, 0, '#57534E', '#44403C');
  // The overcoat: a rope for a belt, a patch, a torn hem
  body(ctx, -14, -56, 28, 32, COAT, () => {
    ctx.fillStyle = '#A16207'; ctx.fillRect(-14, -40, 28, 2.6); ctx.fillStyle = '#CA8A04'; for (let x = -13; x < 14; x += 3) ctx.fillRect(x, -40, 1.4, 1);
    ctx.fillStyle = dark(COAT, 0.3); ctx.fillRect(-1, -56, 1, 32);
    ctx.fillStyle = '#A8A29E'; for (let x = -14; x < 14; x += 4) ctx.fillRect(x, -25.6, 2, 1.6);
  });
  ink(ctx, () => ctx.rect(-8, -53, 6, 6), '#A8A29E', 0.8);
  ctx.fillStyle = INK; for (let k = 0; k < 4; k++) { ctx.fillRect(-8.6 + k * 2, -53.6, 0.8, 1.2); ctx.fillRect(-8.6 + k * 2, -47.6, 0.8, 1.2); } // stitched on
  head(ctx, 2, -62, skin, 8, { brow: 'mad', mouth: 'none' });
  // The beard, grey and scraggly; the mouth in it
  ink(ctx, () => { ctx.moveTo(-3, -60); ctx.quadraticCurveTo(4, -57, 10.4, -61); ctx.lineTo(9.6, -55); ctx.lineTo(8, -52.6); ctx.lineTo(6, -54); ctx.lineTo(4, -51.6); ctx.lineTo(2, -54); ctx.lineTo(-0.4, -52.4); ctx.lineTo(-2, -55.4); ctx.closePath(); }, '#A8A29E', 0.9);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(3, -58, 3, 0.8); ctx.fillRect(7, -56, 2, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(3.6, -58.6, 4, 1);
  // The beanie
  ink(ctx, () => { ctx.ellipse(2, -66, 9.4, 8, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, '#B91C1C', 1);
  ctx.fillStyle = lite('#B91C1C', 0.3); ctx.fillRect(-1, -73, 5, 1.2);
  ink(ctx, () => ctx.rect(-7.6, -67.4, 19.2, 3.4), dark('#B91C1C', 0.2), 0.8);
  ctx.fillStyle = INK; for (let x = -6; x < 11; x += 2.4) ctx.fillRect(x, -66.6, 0.6, 2);
  // (wire: an ink line, the chrome on it)
  const wire = (path: () => void) => {
    ctx.beginPath(); path(); ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); path(); ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineCap = 'butt';
  };
  const wheel = (x: number, y: number, r: number) => { ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#1C1917', 0.8); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 1, y - 1, 2, 2); };
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The cart, out in front of him: what's in it, piled up over the top; the wire basket; the flag
    ctx.save(); ctx.translate(10, 0);
    ink(ctx, () => ctx.rect(5, -84, 1.8, 28), '#DC2626', 0.6);
    ink(ctx, () => ctx.rect(6.8, -84, 11, 7), '#F8FAFC', 0.7);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(6.8, -83.4, 11, 1.2); ctx.fillRect(6.8, -81, 11, 1.2); ctx.fillRect(6.8, -78.6, 11, 1.2);
    ctx.fillStyle = '#1D4ED8'; ctx.fillRect(6.8, -84, 5, 4);
    for (let i = 0; i < 6; i++) {
      const x = 5 + (i * 7) % 24, y = -62 + (i % 2) * 4;
      shaded(ctx, () => ctx.rect(x, y, 5, 8), '#D1D5DB', x, y, 5, 8, 0.7);
      ctx.fillStyle = ['#DC2626', '#16A34A', '#2563EB'][i % 3]; ctx.fillRect(x + 0.4, y + 2.6, 4.2, 2.4);
    }
    shaded(ctx, () => ctx.ellipse(22, -60, 8, 6, 0, 0, Math.PI * 2), '#1F2937', 14, -66, 16, 12); // a garbage bag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(17, -63, 3, 1);
    ink(ctx, () => { ctx.moveTo(20, -66); ctx.lineTo(22, -64); ctx.lineTo(24, -67); ctx.closePath(); }, '#1F2937', 0.6);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.12)'; ctx.fillRect(2, -56, 30, 32);
    wire(() => { ctx.rect(2, -56, 30, 32); for (let x = 8; x < 32; x += 6) { ctx.moveTo(x, -56); ctx.lineTo(x, -24); } ctx.moveTo(2, -40); ctx.lineTo(32, -40); });
    wire(() => { ctx.moveTo(2, -24); ctx.lineTo(4, -10); ctx.lineTo(30, -10); ctx.lineTo(32, -24); ctx.moveTo(2, -56); ctx.lineTo(-1, -60); });
    wheel(8, -5, 4); wheel(28, -5, 4);
    for (let i = 0; i < Math.floor(damage * 5); i++) { const x = 6 + i * 5, y = -40 + (i % 2) * 6; ctx.fillStyle = 'rgba(17, 24, 39, 0.6)'; ctx.fillRect(x, y, 3, 3); ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(x, y, 3, 0.8); } // dents
    ctx.restore();
    arm(ctx, 6, -50, 9.6, -59, COAT, skin);
  } else {
    // The cart parked behind him
    wire(() => { ctx.rect(-40, -44, 22, 26); for (let x = -35; x < -18; x += 5) { ctx.moveTo(x, -44); ctx.lineTo(x, -18); } });
    wheel(-36, -4, 3); wheel(-22, -4, 3);
    wire(() => { ctx.moveTo(-40, -18); ctx.lineTo(-37, -7); ctx.lineTo(-21, -7); ctx.lineTo(-18, -18); });
    windUp(ctx, e, COAT, skin, (x, y) => {
      ink(ctx, () => ctx.rect(x - 1.2, y - 5, 3, 5.4), '#78350F', 0.7); ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 1.2, y - 5.6, 3, 1.2);
      shaded(ctx, () => { ctx.moveTo(x - 3.6, y + 1); ctx.lineTo(x - 1.6, y - 0.4); ctx.lineTo(x + 2, y + 0.6); ctx.lineTo(x + 4, y); ctx.lineTo(x + 4, y + 12); ctx.lineTo(x - 3.6, y + 12); ctx.closePath(); }, '#C8A26B', x - 4, y, 8, 12, 0.8);
      ctx.fillStyle = dark('#C8A26B', 0.25); ctx.fillRect(x - 3, y + 4, 6, 0.6); ctx.fillRect(x - 2, y + 8, 5, 0.6); // crumpled
    });
  }
};

const RAT = '#57534E', RAT_HEAD = '#6B6560', RAT_PINK = '#F9A8D4';

/** A New York rat: grey-brown, pink tail and ears, fat on pizza. */
const drawRat = (ctx: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.3 ? Math.sin(f * 0.7) * 2 : 0;
  // The tail: long, bald, pink, ringed
  const tail = () => { ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(-22, -10 + run, -28, -2); };
  ctx.lineCap = 'round';
  tail(); ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.stroke();
  tail(); ctx.strokeStyle = RAT_PINK; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = dark(RAT_PINK, 0.25);
  for (let t = 0.2; t < 0.9; t += 0.16) { const u = 1 - t; ctx.fillRect(u * u * -10 + 2 * u * t * -22 + t * t * -28, u * u * -5 + 2 * u * t * (-10 + run) + t * t * -2 - 0.8, 0.8, 1.6); }
  // A foot: the leg down, the pink foot, toes
  const foot = (x: number, back: boolean) => {
    limb(ctx, x, -4, x + 1, -1.4, 2, back ? dark(RAT, 0.25) : RAT);
    ink(ctx, () => ctx.ellipse(x + 2, -0.9, 2.1, 0.9, 0, 0, Math.PI * 2), back ? dark(RAT_PINK, 0.2) : RAT_PINK, 0.6);
  };
  foot(-4 - run, true); foot(7 + run, true);
  // The body: hunched, the fur ticked dark and lit along the back, the belly paler, the haunch
  const body = () => { ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-12, -14, -3, -14); ctx.quadraticCurveTo(6, -14, 9, -9); ctx.lineTo(10, -3); ctx.quadraticCurveTo(0, -1.4, -8, -2); ctx.quadraticCurveTo(-13, -3, -12, -6); ctx.closePath(); };
  shadedTop(ctx, body, RAT, -13, -14, 23, 13);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = lite(RAT, 0.3); ctx.fillRect(-8, -13.4, 4, 1); ctx.fillRect(-2, -13.6, 4, 1); ctx.fillRect(-10, -11, 1, 2);
  ctx.fillStyle = dark(RAT, 0.32); for (const [x, y] of [[-6, -11], [-1, -12], [3, -10], [-8, -8], [-3, -8.6]]) ctx.fillRect(x, y, 1.4, 1);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(-9, -3.6, 18, 2);
  ctx.strokeStyle = dark(RAT, 0.38); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(-6, -4.5, 4.4, Math.PI * 1.1, Math.PI * 1.85); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  // The head: pointed, the pink nose, whiskers, the ear, a black bead of an eye; the yellow incisors when it lunges
  const head = () => { ctx.moveTo(5, -11); ctx.quadraticCurveTo(10, -12.6, 14, -9); ctx.lineTo(18, -6.6); ctx.quadraticCurveTo(18.6, -5, 16, -4.6); ctx.lineTo(8, -3); ctx.quadraticCurveTo(4, -5, 5, -11); ctx.closePath(); };
  if (e.aiState === 'lunge') {
    ink(ctx, () => { ctx.rect(15, -5.2, 1.3, 2.4); ctx.rect(16.3, -5.2, 1.3, 2.4); }, '#FDE68A', 0.5); // teeth
  }
  shaded(ctx, head, RAT_HEAD, 4, -12.6, 15, 10);
  ink(ctx, () => ctx.ellipse(7.4, -12, 2.6, 3, -0.3, 0, Math.PI * 2), RAT_HEAD, 0.8);
  ctx.fillStyle = RAT_PINK; ctx.beginPath(); ctx.ellipse(7.7, -11.8, 1.4, 1.9, -0.3, 0, Math.PI * 2); ctx.fill();
  ink(ctx, () => ctx.arc(17.8, -6.2, 1.2, 0, Math.PI * 2), RAT_PINK, 0.6);
  ink(ctx, () => ctx.arc(12, -8.6, 1.3, 0, Math.PI * 2), '#0C0A09', 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(11.4, -9.4, 0.9, 0.9);
  ctx.strokeStyle = 'rgba(231, 229, 228, 0.8)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); for (const [x, y] of [[22, -8.4], [22.4, -5.6], [21.4, -3.4]]) { ctx.moveTo(16, -5.8); ctx.lineTo(x, y); } ctx.stroke();
  foot(-7 + run, false); foot(4 - run, false);
};

// ---------------------------------------------------------------------------
// The lobby
// ---------------------------------------------------------------------------

/** Lobby security: a navy blazer, a radio on the shoulder, a pistol. */
const drawGuard = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), NAVY = '#1E3A8A';
  legs(ctx, -28, f, 0, '#1E293B');
  body(ctx, -14, -56, 28, 30, NAVY, () => {
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-4, -56); ctx.lineTo(0, -44); ctx.lineTo(4, -56); ctx.fill();
    ctx.fillStyle = '#1E293B'; ctx.beginPath(); ctx.moveTo(-1.2, -55); ctx.lineTo(1.2, -55); ctx.lineTo(1.4, -45); ctx.lineTo(0, -43.4); ctx.lineTo(-1.4, -45); ctx.fill(); // the tie
    ctx.fillStyle = dark(NAVY, 0.35); ctx.beginPath(); ctx.moveTo(-4, -56); ctx.lineTo(0, -44); ctx.lineTo(-0.6, -42); ctx.lineTo(-6, -55); ctx.fill(); // a lapel
    ctx.fillStyle = INK; ctx.fillRect(-0.4, -42, 0.8, 16); ctx.fillStyle = '#CBD5E1'; ctx.fillRect(1.4, -38, 1.6, 1.6); ctx.fillRect(1.4, -32, 1.6, 1.6);
  });
  ink(ctx, () => { ctx.moveTo(-11, -51); ctx.lineTo(-6, -51); ctx.lineTo(-6, -48); ctx.lineTo(-8.5, -45.6); ctx.lineTo(-11, -48); ctx.closePath(); }, '#FACC15', 0.7); // badge
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-10, -50, 1.4, 1);
  // The radio on his shoulder, its aerial, a light on it
  ink(ctx, () => ctx.rect(9.6, -64, 1, 6), '#111827', 0.5);
  ink(ctx, () => ctx.roundRect(8, -58, 4.4, 8, 1), '#1F2937', 0.8);
  ctx.fillStyle = f % 40 < 20 ? '#4ADE80' : '#14532D'; ctx.fillRect(9, -57, 1.2, 1.2);
  ctx.fillStyle = '#6B7280'; for (let y = -55; y < -51; y += 1.4) ctx.fillRect(9, y, 2.4, 0.6);
  head(ctx, 2, -64, skin, 8, { brow: 'mad' });
  cap(ctx, 2, -64, 8, '#1E293B');
  ink(ctx, () => ctx.arc(5.6, -68.4, 1.4, 0, Math.PI * 2), '#FACC15', 0.5);
  gunArm(ctx, e, NAVY, skin);
};

/** A commuter: suit, tie over the shoulder, briefcase swinging, earbuds in, a flat run and no time for you. */
const drawCommuter = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e), SUIT = '#4B5563';
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#374151');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.25 : 0);
  arm(ctx, -6, -24, -10 - (running ? Math.sin(f * 0.45) * 4 : 0), -6, dark(SUIT, 0.15), skin);
  body(ctx, -13, -28, 26, 28, SUIT, () => {
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(0, -16); ctx.lineTo(4, -28); ctx.fill();
    ctx.fillStyle = dark(SUIT, 0.35); ctx.beginPath(); ctx.moveTo(-4, -28); ctx.lineTo(0, -16); ctx.lineTo(-0.6, -14); ctx.lineTo(-6, -27); ctx.fill();
    ctx.fillStyle = INK; ctx.fillRect(-0.4, -14, 0.8, 14);
  });
  // The tie: flying back over his shoulder when he runs
  ink(ctx, () => { ctx.moveTo(-1.4, -26); ctx.lineTo(running ? -14 : 1.6, running ? -22 : -12); ctx.lineTo(running ? -12 : -1.6, running ? -19 : -12); ctx.lineTo(2, -26); ctx.closePath(); }, '#B91C1C', 0.7);
  ink(ctx, () => ctx.rect(-1.6, -27.6, 3.4, 2.4), '#991B1B', 0.6);
  head(ctx, 2, -36, skin, 8, { brow: 'mad', mouth: running ? 'o' : 'flat' });
  hairCap(ctx, 2, -36, 8.5, '#1C1917');
  ink(ctx, () => ctx.arc(-3.6, -35, 1.4, 0, Math.PI * 2), '#F8FAFC', 0.6); // an earbud
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-3.6, -33.6); ctx.quadraticCurveTo(-4, -29, -2, -26); ctx.stroke();
  // The briefcase
  const sw = running ? Math.sin(f * 0.45) * 0.8 : 0;
  ctx.save(); ctx.translate(6, -18); ctx.rotate(0.3 + sw);
  limb(ctx, 0, 0, 13, 0, 5.5, SUIT);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(17, -2); ctx.lineTo(17, -5); ctx.lineTo(22, -5); ctx.lineTo(22, -2); ctx.stroke();
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 1; ctx.stroke();
  shaded(ctx, () => ctx.roundRect(10, -2, 20, 15, 1.6), '#78350F', 10, -2, 20, 15);
  ctx.fillStyle = dark('#78350F', 0.35); ctx.fillRect(10.6, 2, 18.8, 0.8);
  for (const cx of [13, 25]) ink(ctx, () => ctx.rect(cx, 1, 2.4, 2.4), '#FACC15', 0.5);
  ink(ctx, () => ctx.arc(17.6, -2.2, 2.8, 0, Math.PI * 2), skin, 0.8);
  ctx.restore();
  ctx.restore();
};

/** A guy behind his newspaper (the Post: HEADLESS BODY...), who puts it down to throw his coffee. */
const drawReader = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), COAT = '#A16207';
  legs(ctx, -28, f, 0, '#78716C', '#3F2410');
  body(ctx, -13, -56, 26, 30, COAT, () => {
    ctx.fillStyle = dark(COAT, 0.3); ctx.beginPath(); ctx.moveTo(-5, -56); ctx.lineTo(0, -46); ctx.lineTo(5, -56); ctx.fill(); // the collar
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(-3, -56); ctx.lineTo(0, -50); ctx.lineTo(3, -56); ctx.fill(); // a scarf
    ctx.fillStyle = INK; for (const y of [-44, -37, -30]) ctx.fillRect(2, y, 1.6, 1.6);
  });
  head(ctx, 2, -64, skin, 8, { brow: 'mad' });
  // The trilby
  ink(ctx, () => ctx.ellipse(1, -70, 13, 3, 0, 0, Math.PI * 2), '#44403C', 1);
  shaded(ctx, () => { ctx.moveTo(-6, -70); ctx.lineTo(-5, -78); ctx.quadraticCurveTo(1, -76, 7, -78); ctx.lineTo(8, -70); ctx.closePath(); }, '#44403C', -6, -78, 14, 8);
  ink(ctx, () => ctx.rect(-6, -72.8, 14, 2), '#1C1917', 0.6);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    // The paper, held open: the masthead, the headline, columns, a photo, the crease; holes shot in it
    shaded(ctx, () => ctx.rect(0, -76, 22, 60), '#F5F5F4', 0, -76, 22, 60);
    ctx.fillStyle = '#111827'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center';
    { const t = ctx.getTransform(); ctx.save(); if (t.a * t.d - t.b * t.c < 0) { ctx.translate(11, 0); ctx.scale(-1, 1); ctx.translate(-11, 0); } ctx.fillText('POST', 11, -68); ctx.restore(); }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(2, -66, 18, 1);
    ctx.fillStyle = '#111827'; ctx.fillRect(2, -63, 18, 2.4); ctx.fillRect(2, -59.6, 13, 2.4);
    ctx.fillStyle = '#A8A29E'; for (let y = -55; y < -20; y += 3) { ctx.fillRect(2, y, 8, 1); if (y < -48 || y > -38) ctx.fillRect(12, y, 8, 1); }
    ink(ctx, () => ctx.rect(12, -47, 8, 8), '#78716C', 0.6); ctx.fillStyle = '#A8A29E'; ctx.fillRect(14, -45, 4, 4);
    ctx.fillStyle = 'rgba(26, 11, 6, 0.18)'; ctx.fillRect(10.6, -76, 0.8, 60);
    for (let i = 0; i < Math.floor(damage * 6) + 1; i++) { const x = 4 + (i * 5) % 16, y = -60 + (i * 11) % 38; ctx.fillStyle = '#D6D3D1'; ctx.fillRect(x - 0.6, y - 0.6, 3.2, 3.2); ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, 2, 2); }
    ctx.restore();
    // His hands round the edge of it
    arm(ctx, 6, -51, 10.4, -48, COAT, skin);
  } else {
    // The paper folded and put down; the coffee coming
    shaded(ctx, () => ctx.rect(-28, -40, 12, 20), '#F5F5F4', -28, -40, 12, 20);
    ctx.fillStyle = '#111827'; ctx.fillRect(-26, -37, 8, 2); ctx.fillStyle = '#A8A29E'; for (let y = -33; y < -22; y += 2.6) ctx.fillRect(-26, y, 8, 0.8);
    windUp(ctx, e, COAT, skin, (x, y) => cup(ctx, x, y));
  }
};

// ---------------------------------------------------------------------------
// The office
// ---------------------------------------------------------------------------

/** An exec: pinstripes, suspenders, slicked hair, a revolver out of his desk drawer. */
const drawExec = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -28, f, 0, '#1F2937', '#3F2410');
  ctx.fillStyle = 'rgba(203, 213, 225, 0.35)'; for (const x of [-6, -3, 4, 7]) ctx.fillRect(x, -28, 0.6, 22); // the pinstripes
  body(ctx, -13, -56, 26, 30, '#F8FAFC', () => {
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(2.6, -56, 0.8, 30);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-9, -56, 3, 30); ctx.fillRect(6, -56, 3, 30);
    ctx.fillStyle = '#991B1B'; ctx.fillRect(-7, -56, 1, 30); ctx.fillRect(8, -56, 1, 30);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-9, -36, 3, 1.6); ctx.fillRect(6, -36, 3, 1.6);
  });
  // The tie, a power tie
  ink(ctx, () => { ctx.moveTo(-2, -55); ctx.lineTo(2, -55); ctx.lineTo(2.6, -39); ctx.lineTo(0, -36); ctx.lineTo(-2.6, -39); ctx.closePath(); }, '#1E3A8A', 0.7);
  ctx.fillStyle = '#3B82F6'; for (let y = -52; y < -40; y += 4) ctx.fillRect(-1.6, y, 3.4, 0.8);
  ink(ctx, () => ctx.rect(-2, -57, 4, 2.6), '#1E3A8A', 0.6);
  head(ctx, 2, -64, skin, 8, { brow: 'mad', mouth: 'smirk' });
  // Slicked back: the hair swept back off his forehead to a point behind, shining
  ink(ctx, () => { ctx.moveTo(8.6, -68); ctx.quadraticCurveTo(6, -74.6, -1, -73.6); ctx.quadraticCurveTo(-8, -72, -10, -66); ctx.lineTo(-7.6, -63); ctx.quadraticCurveTo(-4, -67.6, 2, -68.4); ctx.closePath(); }, '#111827', 1);
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(5, -71.6); ctx.quadraticCurveTo(-1, -72.6, -6, -69); ctx.stroke();
  gunArm(ctx, e, '#F8FAFC', skin, '#9CA3AF', true, true);
};

/** An intern: lanyard, short sleeves, a tray of coffees, running at you like his job depends on it. */
const drawIntern = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e), SHIRT = '#93C5FD';
  legs(ctx, -28, f * (running ? 1.9 : 0.6), running ? 7 : 1, '#A8A29E', '#F8FAFC');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0);
  arm(ctx, -5, -22, -9 - (running ? Math.sin(f * 0.47) * 4 : 0), -6, dark(SHIRT, 0.15), dark(skin, 0.12), true, 5);
  body(ctx, -11, -26, 22, 26, SHIRT, () => {
    ctx.fillStyle = dark(SHIRT, 0.3); ctx.fillRect(1.6, -26, 0.8, 26);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(2.8, -21, 1.2, 1.2); ctx.fillRect(2.8, -14, 1.2, 1.2); ctx.fillRect(2.8, -7, 1.2, 1.2);
    ctx.fillStyle = dark(SHIRT, 0.2); ctx.fillRect(-8, -18, 6, 0.8);
  });
  // The lanyard, the badge on it
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, -26); ctx.lineTo(-0.6, -12); ctx.lineTo(3, -26); ctx.stroke();
  ink(ctx, () => ctx.roundRect(-3.4, -12.4, 6, 7.4, 1), '#F8FAFC', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-2.4, -11, 2.4, 2.6); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-2.4, -7.6, 4, 0.8);
  head(ctx, 2, -33, skin, 8, { brow: 'up', mouth: 'open' });
  hairCap(ctx, 2, -33, 8.5, '#78350F');
  ink(ctx, () => { ctx.moveTo(-2, -40); ctx.quadraticCurveTo(-1, -45, 3, -44.4); ctx.quadraticCurveTo(0, -43, 0, -40); ctx.closePath(); }, '#78350F', 0.7); // a cowlick
  // The tray, the coffees on it
  arm(ctx, 5, -22, 21, -20, SHIRT, skin, true, 5);
  for (let k = 0; k < 3; k++) cup(ctx, 21.5 + k * 6, -32, '#15803D', 8);
  shadedTop(ctx, () => ctx.roundRect(18, -24, 18, 3, 1), '#A16207', 18, -24, 18, 3, 0.8);
  ctx.restore();
};

/** HR behind a rolling whiteboard (SYNERGY), who comes out from behind it to throw a stapler. */
const drawHr = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), CARDI = '#BE185D', HAIR = '#44403C';
  legs(ctx, -28, f, 0, '#6B7280', '#111827');
  ink(ctx, () => ctx.arc(-6, -70, 5, 0, Math.PI * 2), HAIR, 1); // the bun
  ctx.fillStyle = lite(HAIR, 0.3); ctx.fillRect(-8, -73, 3, 1);
  body(ctx, -13, -56, 26, 30, CARDI, () => {
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-4, -56); ctx.lineTo(0, -45); ctx.lineTo(4, -56); ctx.fill();
    ctx.fillStyle = dark(CARDI, 0.3); ctx.fillRect(-0.4, -45, 0.8, 20);
    ctx.fillStyle = '#FBCFE8'; for (const y of [-42, -36, -30]) ctx.fillRect(1, y, 1.6, 1.6);
    ctx.fillStyle = dark(CARDI, 0.2); for (let y = -54; y < -26; y += 3) ctx.fillRect(-13, y, 26, 0.6); // the knit
  });
  head(ctx, 2, -64, skin, 8, { brow: 'mad', glasses: true });
  hairCap(ctx, 2, -64, 8.5, HAIR);
  ink(ctx, () => ctx.arc(-6.6, -59, 1.4, 0, Math.PI * 2), '#E5E7EB', 0.5); // a pearl earring
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    // The stand on its casters; the board in its frame: SYNERGY, a chart going up, the marker tray; holes in it
    ink(ctx, () => ctx.rect(11, -12, 3, 9), '#9CA3AF', 0.7);
    ink(ctx, () => ctx.rect(1, -5, 23, 2.4), '#6B7280', 0.7);
    for (const cx of [4, 21]) { ink(ctx, () => ctx.arc(cx, -2.4, 2.4, 0, Math.PI * 2), '#111827', 0.6); ctx.fillStyle = '#6B7280'; ctx.fillRect(cx - 0.6, -3, 1.2, 1.2); }
    shaded(ctx, () => ctx.rect(0, -78, 26, 68), '#9CA3AF', 0, -78, 26, 68);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(2, -76, 22, 62);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.5)'; ctx.beginPath(); ctx.moveTo(14, -76); ctx.lineTo(20, -76); ctx.lineTo(6, -14); ctx.lineTo(2, -14); ctx.lineTo(2, -24); ctx.fill(); // the shine
    ink(ctx, () => ctx.rect(0, -14, 26, 2.4), '#6B7280', 0.6);
    ctx.fillStyle = '#2563EB'; ctx.fillRect(16, -15.4, 5, 1.4); ctx.fillStyle = '#DC2626'; ctx.fillRect(9, -15.4, 5, 1.4); // markers
    ctx.save(); ctx.translate(13, -44); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#2563EB'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SYNERGY', 0, 2); ctx.restore();
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(4, -20); ctx.lineTo(10, -28); ctx.lineTo(16, -24); ctx.lineTo(22, -34); ctx.moveTo(19, -33); ctx.lineTo(22, -34); ctx.lineTo(22, -31); ctx.stroke(); // a chart, going up
    for (let i = 0; i < Math.floor(damage * 6) + 1; i++) { const x = 3 + (i * 7) % 20, y = -70 + (i * 13) % 50; ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x - 0.6, y - 0.6, 3.2, 3.2); ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, 2, 2); }
    ctx.restore();
    arm(ctx, 6, -51, 10.4, -46, CARDI, skin);
  } else {
    // The board turned edge-on beside her; the stapler coming
    shaded(ctx, () => ctx.rect(-34, -64, 16, 54), '#F8FAFC', -34, -64, 16, 54);
    ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.6; ctx.strokeRect(-33, -63, 14, 52);
    windUp(ctx, e, CARDI, skin, (x, y) => {
      shadedTop(ctx, () => ctx.roundRect(x - 6, y + 3, 12, 3, 1), '#111827', x - 6, y + 3, 12, 3, 0.7);
      shadedTop(ctx, () => ctx.roundRect(x - 6, y, 11, 3.2, [1.6, 1, 1, 1]), '#DC2626', x - 6, y, 11, 3.2, 0.7);
    });
  }
};

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

/** An exterminator: coveralls, a respirator, a pump tank on his back and the spray wand; it hisses before it goes. */
const drawExterminator = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = '#E0AC69', GREEN = '#65A30D';
  legs(ctx, -28, f, 0, GREEN, '#111827');
  // The tank on his back, its pump
  ink(ctx, () => ctx.rect(-16.6, -66, 1.6, 6), '#374151', 0.5); ink(ctx, () => ctx.rect(-19, -67.4, 6.4, 1.8), '#111827', 0.5);
  ink(ctx, () => ctx.rect(-19, -62, 8, 4), '#6B7280', 0.8);
  shaded(ctx, () => ctx.roundRect(-20, -58, 10, 28, 3), '#9CA3AF', -20, -58, 10, 28);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-19.4, -48, 8.8, 4); ctx.fillStyle = INK; ctx.fillRect(-17, -47, 4, 0.8); ctx.fillRect(-17, -45.6, 3, 0.8); // its label
  body(ctx, -12, -56, 26, 30, GREEN, () => {
    ctx.fillStyle = dark(GREEN, 0.35); ctx.fillRect(1.6, -56, 0.8, 30);
    ctx.fillStyle = '#3F6212'; ctx.fillRect(-12, -54, 4, 30); // the tank's strap
    ctx.fillStyle = dark(GREEN, 0.25); ctx.fillRect(-12, -30, 26, 0.8);
  });
  // The patch: a bug, crossed out
  ink(ctx, () => ctx.rect(-6, -51, 7, 6), '#F8FAFC', 0.7);
  ctx.fillStyle = '#111827'; ctx.fillRect(-3.6, -49.4, 2.4, 3);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(-2.5, -48, 2.4, 0, Math.PI * 2); ctx.moveTo(-4.2, -49.8); ctx.lineTo(-0.8, -46.2); ctx.stroke();
  head(ctx, 2, -64, skin, 8, { brow: 'mad', mouth: 'none' });
  // Goggles over the eyes; the respirator, its filter; the cap
  ink(ctx, () => ctx.roundRect(0.6, -68, 11, 4.6, 1.8), '#FACC15', 0.8);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; ctx.fillRect(1.6, -67, 4, 2.6); ctx.fillRect(6.6, -67, 4, 2.6);
  ctx.fillStyle = INK; ctx.fillRect(3.4, -66.4, 1.4, 1.6); ctx.fillRect(8, -66.4, 1.4, 1.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(2, -66.8, 1, 0.8); ctx.fillRect(7, -66.8, 1, 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, -61); ctx.lineTo(-5, -63); ctx.stroke();
  shaded(ctx, () => ctx.roundRect(2, -63.4, 9, 7.4, 2.4), '#374151', 2, -63.4, 9, 7.4);
  ink(ctx, () => ctx.arc(10.4, -58.6, 3.2, 0, Math.PI * 2), '#111827', 0.8);
  ctx.fillStyle = '#6B7280'; for (const [dx, dy] of [[-1, -1], [1, -1], [0, 1]]) ctx.fillRect(10.4 + dx - 0.4, -58.6 + dy - 0.4, 0.8, 0.8);
  cap(ctx, 2, -64, 8, GREEN);
  // The hose round to the wand, his hand on it; the hiss building at its nozzle
  ctx.beginPath(); ctx.moveTo(-12, -44); ctx.quadraticCurveTo(0, -30, 12, -42);
  ctx.strokeStyle = INK; ctx.lineWidth = 3.2; ctx.stroke(); ctx.strokeStyle = '#27272A'; ctx.lineWidth = 1.6; ctx.stroke();
  arm(ctx, 6, -51, 14, -43, GREEN, skin);
  shadedTop(ctx, () => ctx.rect(10, -45, 22, 4), '#374151', 10, -45, 22, 4, 0.8);
  ink(ctx, () => ctx.rect(30, -46, 3, 6), '#9CA3AF', 0.7);
  ink(ctx, () => ctx.roundRect(12, -45.6, 5, 5, 1.6), skin, 0.8);
  const c = charge(e);
  if (c > 0.5) glow(ctx, 35, -43, 2 + c * 4, '190, 242, 100', c * 0.7);
};

/** The janitor: grey work shirt, name patch, a big mop he swings like a claymore. */
const drawJanitor = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e), SHIRT = '#6B7280';
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, '#57534E');
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.25 : 0);
  arm(ctx, -6, -26, -10 - (running ? Math.sin(f * 0.42) * 4 : 0), -8, dark(SHIRT, 0.15), skin);
  body(ctx, -14, -30, 28, 30, SHIRT, () => {
    ctx.fillStyle = dark(SHIRT, 0.3); ctx.fillRect(-0.4, -30, 0.8, 30);
    ctx.fillStyle = dark(SHIRT, 0.2); ctx.fillRect(-10, -20, 7, 0.8); ctx.fillRect(-14, -4, 28, 4);
  });
  ink(ctx, () => ctx.roundRect(4, -26, 8, 4.4, 1.4), '#F8FAFC', 0.6); // the name patch
  ctx.fillStyle = '#DC2626'; ctx.fillRect(5, -24.6, 6, 0.8); ctx.fillRect(5.4, -23.6, 2, 0.8);
  // Keys on his belt
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-11, -4, 2.6, 0, Math.PI * 2); ctx.stroke();
  for (const [kx, kr] of [[-13, 0.3], [-10.6, -0.2], [-9, 0.5]]) { ctx.save(); ctx.translate(kx, -2); ctx.rotate(kr); ink(ctx, () => ctx.rect(-0.8, 0, 1.8, 6), kx === -10.6 ? '#FACC15' : '#9CA3AF', 0.5); ctx.restore(); }
  head(ctx, 2, -38, skin, 8, { brow: 'mad', mouth: 'none' });
  ink(ctx, () => { ctx.moveTo(1.6, -34.8); ctx.lineTo(10.4, -34.8); ctx.lineTo(10.6, -32); ctx.lineTo(8, -32.8); ctx.lineTo(6, -32); ctx.lineTo(4, -32.8); ctx.lineTo(1.4, -32); ctx.closePath(); }, '#9CA3AF', 0.6); // a grey mustache
  cap(ctx, 2, -38, 8, '#1E3A8A');
  // The mop
  const sw = running ? Math.sin(f * 0.4) * 0.9 : 0.1;
  ctx.save(); ctx.translate(8, -20); ctx.rotate(-1.2 + sw);
  shadedTop(ctx, () => ctx.roundRect(0, -2, 46, 4, 2), '#A16207', 0, -2, 46, 4, 0.8);
  ink(ctx, () => ctx.rect(40, -2.6, 5, 5.2), '#9CA3AF', 0.6);
  for (let k = 0; k < 7; k++) { const sx = 44 + (k % 2) * 2; ink(ctx, () => ctx.roundRect(sx, -9 + k * 3, 12, 3.2, 1.6), k % 3 === 1 ? '#D6D3D1' : '#E7E5E4', 0.6); }
  ctx.fillStyle = '#A8A29E'; for (let k = 0; k < 7; k += 2) ctx.fillRect(48 + (k % 2) * 2, -8 + k * 3, 6, 0.6);
  ctx.restore();
  arm(ctx, 4, -24, 9, -19, SHIRT, skin);
  ctx.restore();
};

/** A custodian behind a yellow WET FLOOR sign, who ducks out from behind it to throw a spray bottle. */
const drawCustodian = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), BLUE = '#2563EB';
  legs(ctx, -28, f, 0, '#1E3A8A');
  body(ctx, -13, -56, 26, 30, BLUE, () => {
    ctx.fillStyle = '#1E40AF'; ctx.fillRect(-13, -40, 26, 3);
    ctx.fillStyle = dark(BLUE, 0.3); ctx.fillRect(-0.4, -56, 0.8, 16); ctx.fillRect(-9, -52, 6, 0.8);
  });
  head(ctx, 2, -64, skin, 8, { brow: 'mad', mouth: 'frown' });
  hairCap(ctx, 2, -64, 8.5, '#111827');
  ctx.save(); ctx.translate(-8, -61); ctx.rotate(-0.5); // a pencil behind the ear
  ink(ctx, () => ctx.rect(-1, -5, 2.4, 8), '#FACC15', 0.5); ctx.fillStyle = '#F9A8D4'; ctx.fillRect(-1, -5, 2.4, 1.6);
  ctx.restore();
  // (the sign: a yellow A-frame, the caution triangle, WET FLOOR down it)
  const sign = (x0: number, w: number, h: number) => {
    shaded(ctx, () => { ctx.moveTo(x0, 0); ctx.lineTo(x0 + w * 0.33, -h); ctx.lineTo(x0 + w * 0.67, -h); ctx.lineTo(x0 + w, 0); ctx.closePath(); }, '#FACC15', x0, -h, w, h);
  };
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    sign(4, 24, 74);
    ctx.strokeStyle = '#CA8A04'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(7, -2); ctx.lineTo(13, -72); ctx.lineTo(19, -72); ctx.lineTo(25, -2); ctx.stroke();
    ink(ctx, () => { ctx.moveTo(16, -61); ctx.lineTo(9.6, -48); ctx.lineTo(22.4, -48); ctx.closePath(); }, '#111827', 0.6);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(15, -57, 2, 5); ctx.fillRect(15, -50.6, 2, 1.6);
    ctx.save(); ctx.translate(16, -26); ctx.rotate(-Math.PI / 2); ctx.fillStyle = '#111827'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WET FLOOR', 0, 2); ctx.restore();
    ctx.textAlign = 'left';
    for (let i = 0; i < Math.floor(damage * 6) + 1; i++) { const x = 10 + (i * 5) % 12, y = -40 + (i * 11) % 34; ctx.fillStyle = '#CA8A04'; ctx.fillRect(x - 0.6, y - 0.6, 3.2, 3.2); ctx.fillStyle = '#0F172A'; ctx.fillRect(x, y, 2, 2); }
    ctx.restore();
    arm(ctx, 6, -51, 13, -44, BLUE, skin);
  } else {
    sign(-34, 18, 50);
    windUp(ctx, e, BLUE, skin, (x, y) => {
      shaded(ctx, () => ctx.roundRect(x - 3.4, y + 2, 7, 10, [1.6, 1.6, 1, 1]), BLUE, x - 3.4, y + 2, 7, 10, 0.8);
      ctx.fillStyle = 'rgba(191, 219, 254, 0.8)'; ctx.fillRect(x - 2, y + 6, 4, 3);
      ink(ctx, () => { ctx.moveTo(x - 2.4, y + 2); ctx.lineTo(x - 2.4, y - 3); ctx.lineTo(x + 4.6, y - 3); ctx.lineTo(x + 4.6, y - 1); ctx.lineTo(x + 2.6, y - 1); ctx.lineTo(x + 2.6, y + 2); ctx.closePath(); }, '#F8FAFC', 0.7);
      ink(ctx, () => ctx.rect(x + 1.4, y - 0.6, 1.4, 3), '#E5E7EB', 0.5);
    });
  }
};

// ---------------------------------------------------------------------------
// The lab
// ---------------------------------------------------------------------------

/** A lab coat, long, open at the bottom; pens in the pocket. */
const labCoat = (ctx: Ctx) => {
  body(ctx, -14, -56, 28, 40, '#F8FAFC', () => {
    ctx.fillStyle = '#E5E7EB'; ctx.beginPath(); ctx.moveTo(-5, -56); ctx.lineTo(0, -44); ctx.lineTo(5, -56); ctx.fill();
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(1.4, -44, 0.8, 28); ctx.fillRect(-5.6, -56, 0.8, 12);
    ctx.fillStyle = '#9CA3AF'; ctx.beginPath(); ctx.moveTo(-1, -16); ctx.lineTo(1.8, -22); ctx.lineTo(4, -16); ctx.fill();
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(5, -46, 7, 0.8);
  });
  ink(ctx, () => ctx.rect(6.4, -50.6, 1.4, 5), '#2563EB', 0.4); ink(ctx, () => ctx.rect(8.6, -50, 1.4, 4.4), '#DC2626', 0.4);
};

/** A lab tech: lab coat, safety goggles, a chunky prototype ray gun that glows green before it fires. */
const drawLabtech = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -26, f, 0, '#374151');
  labCoat(ctx);
  head(ctx, 2, -64, skin, 8, { mouth: 'grin' });
  hairCap(ctx, 2, -64, 8.5, '#44403C');
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(-6, -67); ctx.stroke();
  ink(ctx, () => ctx.roundRect(0.4, -68.4, 11.4, 5.4, 2), 'rgba(186, 230, 253, 0.55)', 0.9); // goggles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(1.6, -67.4, 2, 1);
  // The ray gun: the body, the barrel and its fins, the coil glowing in it
  const c = charge(e);
  arm(ctx, 6, -51, 17, -41, '#F8FAFC', skin);
  shaded(ctx, () => ctx.roundRect(14, -48, 14, 9, 2), '#6B7280', 14, -48, 14, 9);
  shadedTop(ctx, () => ctx.rect(26, -46, 8, 4), '#374151', 26, -46, 8, 4, 0.8);
  for (const fy of [-50, -41]) ink(ctx, () => ctx.rect(28, fy, 2, 3), '#9CA3AF', 0.5);
  ink(ctx, () => ctx.arc(19, -44, 3, 0, Math.PI * 2), c > 0.4 && f % 4 < 2 ? '#D9F99D' : '#84CC16', 0.8);
  ctx.fillStyle = '#ECFCCB'; ctx.fillRect(17.6, -45.6, 1.2, 1.2);
  ink(ctx, () => ctx.roundRect(15, -42, 5, 5, 1.6), skin, 0.8);
  if (c > 0.4) glow(ctx, 37, -44, 2 + c * 4, '190, 242, 100', c);
};

/** A test subject: hospital gown, a shaved head with the electrodes still stuck on, glowing green veins, an IV line trailing. */
const drawSubject = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = '#C7D2B8';
  legs(ctx, -32, f * (running ? 1.6 : 0.6), running ? 8 : 1, skin, '#9CA3AF');
  ctx.save(); ctx.translate(0, -32); ctx.rotate(running ? 0.3 : 0.05);
  // The IV line trailing off him
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-20, -14); ctx.quadraticCurveTo(-32, -4 + Math.sin(f * 0.3) * 4, -40, 6); ctx.stroke();
  // The gown, its pattern, the ties
  body(ctx, -17, -36, 34, 36, '#BAE6FD', () => {
    ctx.fillStyle = '#7DD3FC'; for (let y = -34; y < 0; y += 5) for (let x = -15 + ((y / 5) % 2) * 3; x < 17; x += 6) ctx.fillRect(x, y, 1.6, 1.6);
    ctx.fillStyle = dark('#BAE6FD', 0.2); ctx.fillRect(-17, -2, 34, 2);
  }, [6, 6, 2, 2]);
  // Arms like hams, the veins in them glowing
  for (const [x, w] of [[-22, 8], [14, 10]] as const) {
    shaded(ctx, () => ctx.roundRect(x, -32, w, 22, 4), skin, x, -32, w, 22);
    ink(ctx, () => ctx.arc(x + w / 2, -9, w * 0.55, 0, Math.PI * 2), skin, 0.9);
  }
  const pulse = 0.6 + Math.sin(f * 0.2) * 0.3;
  ctx.lineCap = 'round';
  for (const [lw, col] of [[3, `rgba(132, 204, 22, ${(pulse * 0.4).toFixed(3)})`], [1.2, '#BEF264']] as const) {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-19, -30); ctx.lineTo(-17, -20); ctx.lineTo(-19, -12); ctx.moveTo(18, -30); ctx.lineTo(20, -18); ctx.lineTo(18.4, -13); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  // The head: shaved, stitched, one eye bigger than the other, a grin full of teeth; the electrodes and their wire
  head(ctx, 3, -46, skin, 12, { eyes: false, mouth: 'none', neck: false });
  ctx.fillStyle = 'rgba(87, 83, 78, 0.25)'; ctx.fillRect(-4, -57, 14, 4); // stubble
  ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-6, -50); ctx.quadraticCurveTo(0, -56, 8, -55);
  for (let k = 0; k < 5; k++) { const sx = -5 + k * 3; ctx.moveTo(sx, -52.6 - k * 0.6); ctx.lineTo(sx + 0.6, -50 - k * 0.6); }
  ctx.stroke();
  eye(ctx, 7, -49, 2.8, 0.3, 0.2);
  eye(ctx, 12.4, -48.6, 1.8, 0.4, 0);
  ctx.fillStyle = '#84CC16'; ctx.fillRect(7.6, -48.6, 1, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -53.6); ctx.lineTo(9.4, -52.4); ctx.stroke();
  ink(ctx, () => ctx.roundRect(5, -42, 9, 4.2, 1.2), '#111827', 0.7);
  ctx.fillStyle = '#FEF9C3'; for (let k = 0; k < 4; k++) ctx.fillRect(5.8 + k * 2.1, -41.6, 1.4, 1.6 + (k % 2) * 1.2);
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -55); ctx.quadraticCurveTo(-16, -60, -24, -44); ctx.moveTo(5, -57); ctx.quadraticCurveTo(-6, -64, -14, -58); ctx.stroke();
  for (const [x, y] of [[-4, -56], [4, -58], [10, -54]]) { ink(ctx, () => ctx.rect(x, y, 3.4, 3.4), '#DC2626', 0.6); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(x + 0.6, y + 0.6, 1, 1); }
  ctx.restore();
};

/** A scientist behind a wheeled blast shield (BIOHAZARD), who ducks out to lob a flask of something green. */
const drawScientist = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  legs(ctx, -26, f, 0, '#1F2937');
  ink(ctx, () => ctx.arc(-3, -66, 7, 0, Math.PI * 2), '#E5E7EB', 0.9); // the hair, wild, out the back
  labCoat(ctx);
  head(ctx, 2, -64, skin, 8, { brow: 'up', mouth: 'grin' });
  for (const [x, y, r] of [[-4, -69, 4], [1, -72, 4.4], [7, -71.6, 3.6], [-7, -63, 3.4]]) ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#E5E7EB', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-1, -75, 3, 1); ctx.fillRect(5, -74, 2, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(6.5, -65, 3, 0, Math.PI * 2); ctx.stroke(); // the monocle, its chain
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(6.5, -62); ctx.quadraticCurveTo(4, -56, 6, -50); ctx.stroke();
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    ctx.save(); ctx.translate(10, 0);
    // The shield on its trolley: glass in a frame, a glare across it, the biohazard sign; cracks in it
    shadedTop(ctx, () => ctx.rect(0, -8, 26, 4), '#374151', 0, -8, 26, 4, 0.8);
    for (const cx of [4, 22]) { ink(ctx, () => ctx.arc(cx, -3, 3, 0, Math.PI * 2), '#111827', 0.6); ctx.fillStyle = '#6B7280'; ctx.fillRect(cx - 0.6, -3.6, 1.2, 1.2); }
    ctx.fillStyle = 'rgba(186, 230, 253, 0.55)'; ctx.fillRect(2, -80, 22, 72);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.moveTo(6, -80); ctx.lineTo(12, -80); ctx.lineTo(2, -60); ctx.lineTo(2, -72); ctx.fill(); ctx.beginPath(); ctx.moveTo(24, -40); ctx.lineTo(24, -30); ctx.lineTo(14, -8); ctx.lineTo(10, -8); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.strokeRect(2, -80, 22, 72);
    ctx.strokeStyle = '#64748B'; ctx.lineWidth = 1.6; ctx.strokeRect(2, -80, 22, 72);
    ink(ctx, () => { ctx.moveTo(13, -57); ctx.lineTo(5.6, -43.4); ctx.lineTo(20.4, -43.4); ctx.closePath(); }, '#FACC15', 0.8);
    ink(ctx, () => ctx.arc(13, -47.6, 2.6, 0, Math.PI * 2), '#111827', 0.5);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(12.4, -48.2, 1.2, 1.2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(damage * 5); i++) { const y0 = -74 + i * 14; ctx.beginPath(); ctx.moveTo(3, y0); ctx.lineTo(12, y0 + 5); ctx.lineTo(23, y0 + 2); ctx.moveTo(12, y0 + 5); ctx.lineTo(14, y0 + 10); ctx.stroke(); }
    ctx.restore();
    arm(ctx, 6, -51, 11.4, -44, '#F8FAFC', skin);
  } else {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.5)'; ctx.fillRect(-34, -60, 14, 52);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(-34, -60, 14, 52); ctx.strokeStyle = '#64748B'; ctx.lineWidth = 1.4; ctx.strokeRect(-34, -60, 14, 52);
    windUp(ctx, e, '#F8FAFC', skin, (x, y) => {
      ink(ctx, () => ctx.rect(x - 1.4, y - 4, 3.4, 5), 'rgba(224, 242, 254, 0.85)', 0.7);
      ink(ctx, () => ctx.rect(x - 1.6, y - 6, 3.8, 2.4), '#A16207', 0.6); // the cork
      ink(ctx, () => ctx.arc(x + 0.2, y + 5, 5, 0, Math.PI * 2), 'rgba(224, 242, 254, 0.85)', 0.8);
      ctx.save(); ctx.beginPath(); ctx.arc(x + 0.2, y + 5, 4.4, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#84CC16'; ctx.fillRect(x - 5, y + 5, 10, 5); ctx.fillStyle = '#BEF264'; ctx.fillRect(x - 5, y + 5, 10, 1.2);
      ctx.restore();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2.6, y + 2, 1.4, 1.4);
    });
  }
};

// ---------------------------------------------------------------------------
// The tenants, and Barry's man in the power room
// ---------------------------------------------------------------------------

/** The tenants' three: an undershirt and boxers, a housecoat and curlers, a bathrobe and slippers (top, bottom, hair). */
const tenantLook = (v: number) => v === 0 ? { top: '#F8FAFC', bottom: '#60A5FA', hair: '#44403C' } : v === 1 ? { top: '#F9A8D4', bottom: '#F9A8D4', hair: '#78350F' } : { top: '#92400E', bottom: '#92400E', hair: '#9CA3AF' };

/** Curlers in a row over the top of a head at (x, y). */
const curlers = (ctx: Ctx, x: number, y: number, r: number) => {
  for (let k = 0; k < 4; k++) {
    const a = Math.PI * (1.12 + k * 0.25), cx = x + Math.cos(a) * r * 0.95, cy = y + Math.sin(a) * r * 0.95;
    ink(ctx, () => ctx.roundRect(cx - 2, cy - 2.4, 4, 4.8, 1.6), k % 2 ? '#60A5FA' : '#F472B6', 0.6);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.fillRect(cx - 1.2, cy - 1.6, 1, 2);
  }
};

/**
 * A tenant, out of his window from the waist up (the stage draws the window round him): an undershirt and a
 * scowl, a housecoat and curlers, whatever's in his hand going back to throw. Hidden inside, not drawn.
 */
const drawTenant = (ctx: Ctx, e: Enemy, f: number) => {
  if (e.aiState === 'hidden') return;
  const skin = skinOf(e);
  const v = (e.variant ?? 0) % 3, look = tenantLook(v);
  const sleeve = v === 0 ? skin : look.top;
  const out = e.aiState === 'lean' ? Math.min(1, e.aiTimer / 10) : 1;
  ctx.save(); ctx.translate(0, (1 - out) * 30);
  // (his top half: from the sill up; the other hand on the sill)
  arm(ctx, -8, -25, -12, -3, dark(sleeve, 0.12), dark(skin, 0.12));
  body(ctx, -12, -30, 24, 30, look.top, () => {
    if (v === 0) { ctx.fillStyle = skin; ctx.fillRect(-12, -30, 5, 14); ctx.fillRect(7, -30, 5, 14); ctx.fillStyle = 'rgba(202, 138, 4, 0.25)'; ctx.fillRect(-4, -14, 6, 5); } // an undershirt, a stain on it
    else { ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(-4, -30); ctx.lineTo(1, -20); ctx.lineTo(5, -30); ctx.fill(); ctx.fillStyle = dark(look.top, 0.3); ctx.beginPath(); ctx.moveTo(-4, -30); ctx.lineTo(1, -20); ctx.lineTo(0, -18); ctx.lineTo(-7, -29); ctx.fill(); } // a robe, its lapel
    if (v === 1) { ctx.fillStyle = '#FBCFE8'; for (let y = -26; y < 0; y += 6) for (let x = -10 + ((y / 6) % 2) * 3; x < 12; x += 7) ctx.fillRect(x, y, 2, 2); }
    if (v === 2) { ctx.fillStyle = dark(skin, 0.4); for (const [x, y] of [[0, -27], [2, -25], [1, -23]]) ctx.fillRect(x, y, 0.8, 1.4); } // chest hair
  });
  const throwing = e.aiState === 'throw';
  head(ctx, 2, -38, skin, 9, { brow: 'mad', mouth: throwing ? 'open' : 'frown' });
  if (v === 0) { ctx.fillStyle = 'rgba(41, 37, 36, 0.3)'; ctx.fillRect(-2, -36, 10, 5); } // stubble
  hairCap(ctx, 2, -38, 9, look.hair);
  if (v === 1) curlers(ctx, 1.4, -40, 9);
  // The throwing arm: out of the window with it held up in front of him (so you can see what's coming), then back over
  // his head with it, winding up; then it whips over, lets go, and follows through, empty. (The arm's angle off
  // straight down: forward's positive.)
  const t = e.aiTimer || 0;
  const WIND = 16;
  let ang = 1.6, held = true;
  if (e.aiState === 'lean') ang = 1.6 + Math.sin(t * 0.5) * 0.08;
  else if (e.aiState === 'throw' && t < WIND) { const k = t / WIND; ang = 1.6 + k * k * 2.2; }
  else if (e.aiState === 'throw') { const u = t - WIND; ang = u < 5 ? 3.8 - (u / 5) * 2.6 : 1.2 - Math.min(1, (u - 5) / 20) * 0.3; held = false; }
  ctx.save(); ctx.translate(6, -27); ctx.rotate(-ang);
  limb(ctx, 0, 0, 0, 16, 6, sleeve);
  ink(ctx, () => ctx.arc(0, 17, 3.6, 0, Math.PI * 2), skin, 0.8);
  if (held) {
    // (held up big and clear, a light edge round it so it reads against the dark of the window)
    ctx.save(); ctx.translate(0, 22); ctx.rotate(ang); ctx.scale(1.35, 1.35);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'; ctx.shadowBlur = 3;
    drawHouseholdItem(ctx, e.heldItem ?? 0);
    ctx.restore();
  }
  ctx.restore();
  // (the swoosh as it goes)
  if (e.aiState === 'throw' && t >= WIND && t < WIND + 6) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(6, -27, 22, -Math.PI * 0.75, -Math.PI * 0.05); ctx.stroke(); }
  ctx.restore();
  void f;
};

/**
 * A tenant, dead: out of his window and falling, all of him (undershirt and boxers, a housecoat and curlers, a
 * bathrobe and slippers), arms and legs going, eyes like saucers, mouth wide open; or face down on the street
 * where he landed, flat, in a pool of it. (e.pos is his box, e.rotation his spin on the way down.)
 */
export const drawTenantDeath = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e);
  const v = (e.variant ?? 0) % 3, { top, bottom, hair } = tenantLook(v);
  const cx = e.pos.x + e.width / 2, cy = e.pos.y + e.height / 2;
  ctx.save();
  if (e.aiState === 'splat') {
    // Flat on the street: the pool spreading out under him, him squashed flat in it, a slipper off to one side
    const t = Math.min(1, (e.aiTimer || 0) / 60);
    const gy = e.pos.y + e.height;
    ctx.fillStyle = 'rgba(69, 10, 10, 0.9)'; ctx.beginPath(); ctx.ellipse(cx, gy - 2, 27 + t * 30, 5.6 + t * 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(127, 29, 29, 0.95)'; ctx.beginPath(); ctx.ellipse(cx, gy - 2.4, 24 + t * 28, 4.4 + t * 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(248, 113, 113, 0.5)'; ctx.fillRect(cx - 14 - t * 16, gy - 5 - t * 2, 10 + t * 8, 1);
    ctx.fillStyle = '#B91C1C'; for (let k = 0; k < 6; k++) ctx.fillRect(cx - 40 + k * 15, gy - 3 - (k % 2) * 2, 5, 3);
    ctx.translate(cx, gy - 5); ctx.scale(1.25, 0.55);
    for (const ly of [-4, 2.4]) { shaded(ctx, () => ctx.rect(-26, ly, 16, 6), bottom, -26, ly, 16, 6); ink(ctx, () => ctx.ellipse(-27, ly + 3, 3, 3, 0, 0, Math.PI * 2), skin, 1); } // legs, splayed
    shaded(ctx, () => ctx.roundRect(-12, -7, 24, 14, 3), top, -12, -7, 24, 14);
    for (const [ay, hy] of [[-16, -13.6], [10, 12.4]]) { shaded(ctx, () => ctx.rect(12, ay, 12, 5), v === 0 ? skin : top, 12, ay, 12, 5); ink(ctx, () => ctx.arc(25, hy, 3, 0, Math.PI * 2), skin, 1); } // arms, flung out
    shaded(ctx, () => ctx.arc(18, 0, 8, 0, Math.PI * 2), skin, 10, -8, 16, 16);
    if (v === 1) { for (const dy of [-5, 0, 5]) ink(ctx, () => ctx.rect(24, dy - 2, 4, 4), dy ? '#F472B6' : '#60A5FA', 0.8); }
    else ink(ctx, () => { ctx.arc(18, 0, 8, -Math.PI / 2, Math.PI / 2); ctx.closePath(); }, hair, 1);
    ctx.fillStyle = INK; ctx.fillRect(14, -3.6, 5, 1.6); ctx.fillRect(14, 2, 5, 1.6); ctx.fillRect(15.6, -5, 1.6, 4.4); ctx.fillRect(15.6, 0.6, 1.6, 4.4); // x'd out
    ctx.restore();
    ink(ctx, () => ctx.roundRect(cx + 34, e.pos.y + e.height - 5, 9, 4, [2, 2, 1, 1]), '#7C2D12', 0.8); // the slipper
    ctx.fillStyle = '#FDF2F8'; ctx.fillRect(cx + 35, e.pos.y + e.height - 5, 3, 1.4);
    return;
  }
  // Falling: spinning, flailing, terrified
  ctx.translate(cx, cy); ctx.rotate(e.rotation || 0);
  const flail = Math.sin(f * 0.8) * 0.6, kick = Math.sin(f * 0.6 + 1) * 0.5;
  // Legs kicking: boxers (or the robe) to the knee, bare shins, a slipper hanging on
  for (const [x, a] of [[-5, kick], [5, -kick]] as const) {
    ctx.save(); ctx.translate(x, 8); ctx.rotate(a);
    limb(ctx, 0, 12, 0, 18, 5, skin);
    shaded(ctx, () => ctx.rect(-3.4, 0, 6.8, 14), bottom, -3.4, 0, 6.8, 14);
    if (v === 0) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-2, 3, 1.2, 1.2); ctx.fillRect(1, 8, 1.2, 1.2); }
    ink(ctx, () => ctx.roundRect(-3.6, 17, 7.2, 4, 1.6), v === 2 ? '#7C2D12' : skin, 0.8);
    ctx.restore();
  }
  shaded(ctx, () => ctx.roundRect(-11, -14, 22, 24, [4, 4, 2, 2]), top, -11, -14, 22, 24);
  if (v === 1) { ctx.fillStyle = '#FBCFE8'; ctx.fillRect(-2, -13.4, 4, 23); }
  if (v === 2) ink(ctx, () => ctx.rect(-11, 0, 22, 2.4), dark(top, 0.3), 0.6);
  // Arms up over his head, waving
  for (const [x, a] of [[-10, -2.4 + flail], [10, 2.4 - flail]] as const) {
    ctx.save(); ctx.translate(x, -10); ctx.rotate(a);
    limb(ctx, 0, 0, 0, 17, 5, v === 0 ? skin : top);
    if (v !== 0) limb(ctx, 0, 13, 0, 17, 4.4, skin);
    ink(ctx, () => ctx.arc(0, 19, 3.4, 0, Math.PI * 2), skin, 0.8);
    ctx.restore();
  }
  // The head: eyes like saucers, mouth wide open screaming
  ink(ctx, () => ctx.rect(-2.6, -16, 5.2, 4), dark(skin, 0.2), 0.8);
  shaded(ctx, () => ctx.arc(0, -24, 10, 0, Math.PI * 2), skin, -10, -34, 20, 20);
  if (v === 1) curlers(ctx, 0, -25, 10);
  else ink(ctx, () => { ctx.arc(0, -25, 10.4, Math.PI * 1.08, Math.PI * 1.92); ctx.quadraticCurveTo(0, -31, -8.6, -30.6); ctx.closePath(); }, hair, 1);
  for (const ex of [-4, 4]) {
    ink(ctx, () => ctx.arc(ex, -25.6, 3.6, 0, Math.PI * 2), '#FFFFFF', 0.8);
    ctx.fillStyle = INK; ctx.fillRect(ex - 0.8, -26.4, 1.6, 1.6);
    ctx.fillRect(ex - 2.6, -31.4, 5, 1);
  }
  ink(ctx, () => ctx.ellipse(0, -17.6, 3.6, 4.6 + Math.sin(f * 0.9), 0, 0, Math.PI * 2), '#450A0A', 0.8);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-2.2, -21.4, 4.4, 1.2);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-1.6, -15.6, 3.2, 1.6);
  ink(ctx, () => ctx.ellipse(10, -28 + (f % 8), 1.4, 2, 0, 0, Math.PI * 2), 'rgba(147, 197, 253, 0.95)', 0.5); // sweat, flying off
  ctx.restore();
};

/**
 * Barry's man on the grid (one of the townsfolk, drawn the same way): a jumpsuit with BARRY's B on it, a headset, a
 * clipboard, big anxious eyes; strutting and taunting, or running round in a panic with his hands on his head.
 */
const MINION: PersonSpec = {
  skin: '#F2C9A0', hair: { style: 'short', color: '#A16207' },
  top: { style: 'shirt', color: '#FACC15', long: true }, legs: { color: '#FACC15' }, shoes: '#111827',
  extra: c => {
    ink(c, () => c.roundRect(-7.6, -50, 7, 6, 1), '#1E3A8A', 0.7);
    c.fillStyle = '#FACC15'; c.fillRect(-5.4, -48.8, 1.2, 3.6); c.fillRect(-5.4, -48.8, 2.6, 1); c.fillRect(-5.4, -47.4, 2.6, 0.8); c.fillRect(-5.4, -46, 2.6, 0.8); c.fillRect(-3, -48.2, 0.8, 1); c.fillRect(-3, -46.8, 0.8, 1);
    c.fillStyle = '#111827'; c.fillRect(-9, -38, 18, 2.4); // a stripe round him
  },
};
const drawMinion = (ctx: Ctx, e: Enemy, f: number) => {
  const panic = e.aiState === 'panic';
  const running = Math.abs(e.vel.x) > 0.8;
  drawPerson(ctx, 0, 0, MINION, {
    f, walk: running ? f * 0.45 : undefined, stride: running ? 1 : 0,
    arms: panic ? 'panic' : 'hold', mouth: panic ? 'open' : 'grin',
    prop: panic ? undefined : (c, hx, hy) => {
      // The clipboard, its clip, the sheet on it, his thumb over the edge
      shaded(c, () => c.roundRect(hx - 2, hy - 11, 10, 13, 1), '#A16207', hx - 2, hy - 11, 10, 13);
      c.fillStyle = '#F8FAFC'; c.fillRect(hx - 1, hy - 9, 8, 10);
      c.fillStyle = '#9CA3AF'; for (let y = hy - 7; y < hy; y += 2) c.fillRect(hx, y, 6, 0.6);
      ink(c, () => c.rect(hx + 1, hy - 12, 4, 2.4), '#9CA3AF', 0.6);
      ink(c, () => c.arc(hx - 1, hy - 3, 2.4, 0, Math.PI * 2), MINION.skin, 0.7);
    },
  });
  // The big anxious eyes over his own; the headset: the band over the top, the cup on his ear, the mic round to his mouth
  const look = panic ? -0.4 : 0.5;
  eye(ctx, 3.2, -63.4, 2.7, look, panic ? -0.5 : 0); eye(ctx, 8.6, -63.4, 2.7, look, panic ? -0.5 : 0);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); // (brows up in the middle, worried)
  ctx.moveTo(1, -66.6); ctx.lineTo(4.6, -68 - (panic ? 1 : 0)); ctx.moveTo(7.2, -68 - (panic ? 1 : 0)); ctx.lineTo(10.4, -66.6); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.6, -63, 10, 10.6, 0, Math.PI * 1.05, Math.PI * 1.75);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.stroke(); ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.2; ctx.stroke();
  // (panicking, the mic's knocked down off his mouth, so you can see him screaming)
  const micX = panic ? 1.5 : 5.4, micY = panic ? -51.6 : -55.6;
  ctx.beginPath(); ctx.moveTo(-6.6, -59); ctx.quadraticCurveTo(-3, -53.6 + (panic ? 2 : 0), micX - 0.4, micY);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke(); ctx.strokeStyle = '#374151'; ctx.lineWidth = 0.7; ctx.stroke();
  ink(ctx, () => ctx.roundRect(-9.6, -64, 5, 7, 2), '#1F2937', 0.8);
  ink(ctx, () => ctx.arc(micX, micY, 1.4, 0, Math.PI * 2), '#111827', 0.5);
  if (panic) ink(ctx, () => ctx.ellipse(-3, -61 + (f % 12), 1.2, 1.8, 0, 0, Math.PI * 2), 'rgba(147, 197, 253, 0.95)', 0.5); // sweat
};

/** A generator (the stage draws the real thing: this is for its box). */
const drawGeneratorBox = (ctx: Ctx, e: Enemy, f: number) => {
  ctx.fillStyle = '#374151'; ctx.fillRect(-e.width / 2, -e.height, e.width, e.height);
  void f;
};

const PIGEON = '#9CA3AF', PIGEON_DARK = '#6B7280', PIGEON_HEAD = '#4B5563';

/** A New York pigeon: fat, grey, the green-and-purple sheen on its neck, orange eye, beating away (swooping at you). */
const drawPigeon = (ctx: Ctx, e: Enemy, f: number) => {
  const swoop = e.aiState === 'swoop';
  const flap = swoop ? Math.sin(f * 0.2) * 3 : Math.sin(f * 0.45) * 9;
  // The far wing, in shadow
  featherWing(ctx, -8, -9, -20, -20 - flap, -4, -11, PIGEON_DARK, 3);
  // The tail, the black band across its end; the feet, red
  const tail = () => { ctx.moveTo(-11, -12.5); ctx.lineTo(-21, -14); ctx.lineTo(-21, -6.5); ctx.lineTo(-11, -8); ctx.closePath(); };
  shaded(ctx, tail, PIGEON_DARK, -21, -14, 10, 8);
  ctx.save(); ctx.beginPath(); tail(); ctx.clip(); ctx.fillStyle = '#1F2937'; ctx.fillRect(-21, -15, 3, 10); ctx.restore();
  ctx.beginPath(); tail(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  for (const x of [-1, 4]) {
    limb(ctx, x, -5, x, -1.4, 1.4, '#F87171');
    ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - 2, 0); ctx.lineTo(x + 2.4, 0); ctx.stroke();
  }
  // The body: plump, lit across the top, the breast puffed
  const body = () => ctx.ellipse(0, -10, 14, 7, 0, 0, Math.PI * 2);
  shaded(ctx, body, PIGEON, -14, -17, 28, 14);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = lite(PIGEON, 0.3); ctx.fillRect(-8, -16.4, 10, 1.4);
  // The sheen on the neck, green over purple, stepped
  ctx.fillStyle = '#3E9A82'; ctx.fillRect(4, -14, 10, 3); ctx.fillStyle = '#6FC7AE'; ctx.fillRect(6, -13.6, 3, 1);
  ctx.fillStyle = '#7C5AA8'; ctx.fillRect(3, -11, 11, 2.6); ctx.fillStyle = '#A78BCF'; ctx.fillRect(5, -10.6, 3, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The head: small, slate grey, the orange eye; the bill dark with the white cere at its base
  const head = () => ctx.arc(11, -13, 5, 0, Math.PI * 2);
  shaded(ctx, head, PIGEON_HEAD, 6, -18, 10, 10);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  ctx.fillStyle = '#3E9A82'; ctx.fillRect(5, -11, 12, 2); ctx.fillStyle = '#7C5AA8'; ctx.fillRect(5, -9, 12, 2); ctx.fillStyle = '#6FC7AE'; ctx.fillRect(8, -10.8, 2, 0.8);
  ctx.restore(); ctx.beginPath(); head(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => { ctx.moveTo(15.4, -14.2); ctx.lineTo(20, -12.6); ctx.lineTo(15.4, -11.6); ctx.closePath(); }, '#1F2937', 0.7);
  ink(ctx, () => ctx.ellipse(16.2, -13.6, 1.3, 0.8, 0.2, 0, Math.PI * 2), '#F1F5F9', 0.5);
  eye(ctx, 12.2, -14.4, 1.5, 0.4, 0, '#F97316');
  // The near wing, beating: the two black bars across it
  featherWing(ctx, 6, -11, -14, -22 + flap, 0, -9, PIGEON, 3, '#1F2937');
};
