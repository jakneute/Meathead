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

// The people are drawn the townsfolk's way (an ink line round every part, each part shaded in steps, a face with eyes
// and brows and a mouth, hands), out of a few parts of their own.

/** Two legs, shaded; boots with a shaft `shaft` high (cowboy boots, engineer boots), a heel; striding by `stride`. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, boot: string, shaft = 0, w = 7) => {
  const s = Math.sin(f * 0.25) * stride;
  for (const x of [-1 - w + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, hipY, w, -hipY - 4), pants, x, hipY, w, -hipY - 4);
    if (shaft) {
      shaded(ctx, () => ctx.roundRect(x - 0.5, -4 - shaft, w + 1, shaft, [1, 1, 0, 0]), boot, x - 0.5, -4 - shaft, w + 1, shaft, 0.9);
      ctx.fillStyle = lite(boot, 0.3); ctx.fillRect(x + 0.6, -2.6 - shaft, w - 1.2, 0.8); // (the pull-on's top, the stitching)
      ctx.fillStyle = dark(boot, 0.3); ctx.fillRect(x + w * 0.5, -2 - shaft, 0.7, shaft - 3);
    }
    ink(ctx, () => ctx.roundRect(x - 1, -5, w + 4, 5, [2, 3, 1, 1]), boot, 1);
    ctx.fillStyle = lite(boot, 0.35); ctx.fillRect(x, -4.4, 3, 1);
    ink(ctx, () => ctx.rect(x - 1, -2, 3, 2), dark(boot, 0.35), 0.7); // the heel
    ctx.fillStyle = lite(boot, 0.55); ctx.fillRect(x + 2, -1, w + 1, 1);
  }
};

/** A body (a shirt, a tee): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
const body = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, detail?: () => void, r: number | number[] = [5, 5, 2, 2]) => {
  const path = () => ctx.roundRect(x, y, w, h, r);
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

type Mouth = 'flat' | 'smirk' | 'grin' | 'snarl' | 'none';

/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, eyes and brows, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, mouth: Mouth = 'flat', brow: 'flat' | 'mad' = 'flat', eyes: 'open' | 'shut' | 'none' = 'open') => {
  const sd = dark(skin, 0.2);
  ink(ctx, () => ctx.rect(x - 2.4, y + r - 2, 4.8, 5), sd, 0.8);
  const skull = () => ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 2.2);
  ctx.fillStyle = sd; ctx.fillRect(x - r, y - r * 1.1, r * 0.55, r * 2.2);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(x + r * 0.2, y - r * 0.85, r * 0.5, r * 0.45);
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(x - r + 2.4, y + 1, 1.8, 2.4, 0, 0, Math.PI * 2), sd, 0.7);
  const ey = y - 1;
  if (eyes !== 'none') for (const [ex, back] of [[x + 1, true], [x + 5.5, false]] as const) {
    ctx.fillStyle = INK;
    if (eyes === 'shut') { ctx.fillRect(ex - 1.5, ey, 3, 0.9); continue; }
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
    ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
    if (brow === 'mad') { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
    else ctx.fillRect(ex - 1.5, ey - 3.6, 3, 1);
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  const mx = x + 3.4, my = y + r * 0.62;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (mouth) {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(mx - 2, my + 0.6); ctx.lineTo(mx + 1, my + 0.4); ctx.lineTo(mx + 2.6, my - 0.8); ctx.stroke(); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'snarl': ctx.fillRect(mx - 2.6, my - 0.6, 5.6, 2.4); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(mx - 2 + k * 1.8, my - 0.4, 1.2, 1); break;
  }
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy): bare or sleeved (`short` for a short sleeve), the fist. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, short = false, w = 5.5) => {
  limb(ctx, sx, sy, hx, hy, w, short ? skin : sleeve);
  if (short) limb(ctx, sx, sy, sx + (hx - sx) * 0.4, sy + (hy - sy) * 0.4, w + 0.6, sleeve);
  fist(ctx, hx, hy, skin, w * 0.62);
};

/** A fist: inked, the knuckles' crease. */
const fist = (ctx: Ctx, x: number, y: number, skin: string, r = 3.4) => {
  ink(ctx, () => ctx.roundRect(x - r, y - r, r * 2, r * 2, r * 0.6), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.22); ctx.fillRect(x - r * 0.6, y, r * 1.3, 0.7);
  ctx.fillStyle = lite(skin, 0.25); ctx.fillRect(x - r * 0.7, y - r * 0.7, r * 0.8, 0.8);
};

/** A stepped glow at a muzzle: an outer ring, a hot middle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a: number) => {
  ctx.fillStyle = `rgba(${rgb}, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/**
 * A single-action revolver in the fist at (x, y), pointing `dir`: the long barrel and its ejector rod, the fluted
 * cylinder, the hammer back, the walnut grip; glowing at the muzzle by `c`.
 */
const revolver = (ctx: Ctx, x: number, y: number, c: number, skin: string, dir = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  const STEEL = '#374151';
  ink(ctx, () => { ctx.moveTo(0, 0); ctx.lineTo(4.4, 0.4); ctx.quadraticCurveTo(4, 5, 2.6, 7.4); ctx.lineTo(-1.2, 7); ctx.quadraticCurveTo(-0.6, 3, 0, 0); ctx.closePath(); }, '#78350F', 0.8);
  ctx.fillStyle = '#A16207'; ctx.fillRect(0.6, 1.6, 1, 4.4);
  shadedTop(ctx, () => ctx.rect(1, -3, 17, 2.6), STEEL, 1, -3, 17, 2.6, 0.8); // barrel
  ink(ctx, () => ctx.rect(9, -0.6, 8, 1.4), dark(STEEL, 0.2), 0.6); // ejector rod
  shadedTop(ctx, () => ctx.roundRect(2.6, -3.8, 6.4, 5.4, 1), '#6B7280', 2.6, -3.8, 6.4, 5.4, 0.8); // cylinder
  ctx.fillStyle = dark('#6B7280', 0.35); ctx.fillRect(4, -2.4, 0.7, 3); ctx.fillRect(6.4, -2.4, 0.7, 3);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(3.4, -3.2, 2.4, 0.8); ctx.fillRect(10, -2.6, 6, 0.6);
  ink(ctx, () => { ctx.moveTo(1, -2.4); ctx.lineTo(-1, -4.6); ctx.lineTo(0.4, -4.8); ctx.lineTo(2.6, -3); ctx.closePath(); }, STEEL, 0.6); // the hammer
  ctx.fillStyle = INK; ctx.fillRect(16.4, -4, 1.2, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(5, 1.4, 1.8, 0, Math.PI); ctx.stroke(); // the trigger guard
  fist(ctx, 1.8, 1.6, skin, 2.6);
  ctx.restore();
  if (c > 0.6) glow(ctx, x + dir * 20, y - 1.6, 2 + c * 3, '254, 240, 138', c);
};

/** A big cowboy hat: the brim wide and curled up at the sides, the crown pinched, the band. */
const stetson = (ctx: Ctx, x: number, y: number, color: string, band = '#78350F') => {
  const crown = () => { ctx.moveTo(x - 8, y - 2); ctx.lineTo(x - 7, y - 13); ctx.quadraticCurveTo(x - 3.4, y - 10.4, x, y - 11.4); ctx.quadraticCurveTo(x + 3.4, y - 10.4, x + 7, y - 13); ctx.lineTo(x + 8, y - 2); ctx.closePath(); };
  shaded(ctx, crown, color, x - 8, y - 13, 16, 11);
  ctx.strokeStyle = dark(color, 0.3); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x, y - 11); ctx.lineTo(x, y - 7); ctx.stroke(); // the crease
  ink(ctx, () => ctx.rect(x - 8, y - 5.4, 16, 2.6), band, 0.7);
  ctx.fillStyle = '#D1D5DB'; ctx.fillRect(x - 6, y - 4.8, 2, 1.4); // the band's buckle
  const brim = () => { ctx.moveTo(x - 15, y - 1); ctx.quadraticCurveTo(x, y + 4, x + 15, y - 1); ctx.lineTo(x + 16, y - 5); ctx.quadraticCurveTo(x, y, x - 16, y - 5); ctx.closePath(); };
  ink(ctx, brim, color, 1);
  ctx.save(); ctx.beginPath(); brim(); ctx.clip();
  ctx.fillStyle = dark(color, 0.18); ctx.beginPath(); ctx.moveTo(x - 15, y - 1); ctx.quadraticCurveTo(x, y + 4, x + 15, y - 1); ctx.lineTo(x + 15, y + 2); ctx.lineTo(x - 15, y + 2); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = lite(color, 0.5); ctx.fillRect(x - 13, y - 3.6, 5, 0.9); ctx.fillRect(x - 5, y - 12, 1.2, 4);
};

/** A five-pointed badge: inked, the balls on its tips, lit. */
const star = (ctx: Ctx, x: number, y: number, r: number, color = '#E5E7EB') => {
  const pts = () => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); };
  ink(ctx, pts, color, 0.7);
  ctx.fillStyle = color; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 0.4; ctx.fillRect(x + Math.cos(a) * r - 0.7, y + Math.sin(a) * r - 0.7, 1.4, 1.4); }
  ctx.fillStyle = dark(color, 0.3); ctx.fillRect(x, y - r * 0.2, r * 0.5, r * 0.5);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - r * 0.3, y - r * 0.4, 1, 1);
};

/** A chain from (x1, y1) to (x2, y2): the links, every other one face on. */
const chain = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number) => {
  const len = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1), n = Math.max(2, Math.round(len / 3.2));
  ctx.lineCap = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.lineCap = 'butt';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, cx = x1 + (x2 - x1) * t, cy = y1 + (y2 - y1) * t;
    if (i % 2) { ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(cx, cy, 2, 1.1, a, 0, Math.PI * 2); ctx.stroke(); }
    else { ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * 1.8, cy - Math.sin(a) * 1.8); ctx.lineTo(cx + Math.cos(a) * 1.8, cy + Math.sin(a) * 1.8); ctx.stroke(); }
  }
};

/** A handlebar mustache under the nose of a head at (x, y). */
const mustache = (ctx: Ctx, x: number, y: number, color: string) => {
  ink(ctx, () => { ctx.moveTo(x - 2, y + 4.4); ctx.quadraticCurveTo(x - 3.4, y + 2.2, x - 1.4, y + 2.6); ctx.quadraticCurveTo(x + 3.4, y + 2, x + 8.4, y + 2.8); ctx.quadraticCurveTo(x + 10.6, y + 3.4, x + 9.6, y + 5.8); ctx.quadraticCurveTo(x + 8.6, y + 4.2, x + 3.4, y + 4); ctx.quadraticCurveTo(x, y + 3.8, x - 2, y + 4.4); ctx.closePath(); }, color, 0.7);
  ctx.fillStyle = lite(color, 0.3); ctx.fillRect(x + 1, y + 2.8, 4, 0.7);
};

/** A biker's beard, down from the jaw of a head at (x, y) to (x + tx, y + ty): gray, the strands picked out. */
const beard = (ctx: Ctx, x: number, y: number, len: number, color = '#78716C') => {
  ink(ctx, () => { ctx.moveTo(x - 6, y + 2); ctx.quadraticCurveTo(x - 5, y + 8, x - 2, y + len * 0.7); ctx.lineTo(x + 0.6, y + len); ctx.lineTo(x + 2.4, y + len * 0.8); ctx.lineTo(x + 4.4, y + len * 0.9); ctx.quadraticCurveTo(x + 8, y + 8, x + 7.6, y + 3); ctx.quadraticCurveTo(x + 4, y + 5.4, x + 1, y + 4.4); ctx.closePath(); }, color, 0.9);
  ctx.strokeStyle = lite(color, 0.35); ctx.lineWidth = 0.7;
  for (const k of [-1.6, 1.4, 4]) { ctx.beginPath(); ctx.moveTo(x + k, y + 6); ctx.quadraticCurveTo(x + k + 0.6, y + len * 0.5, x + k * 0.4 + 0.6, y + len * 0.8); ctx.stroke(); }
  ctx.fillStyle = dark(color, 0.3); ctx.fillRect(x + 2, y + 5.4, 3.6, 1); // the mouth in it
};

/** Wraparound shades across the eyes of a head at (x, y): the lenses banded, a glint. */
const shades = (ctx: Ctx, x: number, y: number) => {
  ink(ctx, () => ctx.roundRect(x - 1.4, y - 3, 10.4, 3.4, [0.6, 1.4, 1.4, 0.6]), '#111827', 0.7);
  ctx.fillStyle = '#374151'; ctx.fillRect(x - 0.6, y - 1.6, 9, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(x + 5, y - 2.4, 2, 0.7);
};

/** A bandana tied over a head at (x, y), r its size: red, the paisley dotted, the knot's tails out the back. */
const bandana = (ctx: Ctx, x: number, y: number, r: number) => {
  const RED = '#B91C1C';
  ink(ctx, () => { ctx.moveTo(x - r - 2, y - r * 0.6); ctx.lineTo(x - r - 4.4, y - r * 0.6 + 7); ctx.lineTo(x - r - 1.4, y - r * 0.6 + 6); ctx.lineTo(x - r, y - r * 0.6 + 2); ctx.closePath(); }, dark(RED, 0.15), 0.8);
  ink(ctx, () => { ctx.ellipse(x, y - r * 0.32, r + 0.8, r * 0.86, 0, Math.PI * 1.02, Math.PI * 2.02); ctx.lineTo(x + r - 1, y - r * 0.25); ctx.lineTo(x - r - 0.6, y - r * 0.2); ctx.closePath(); }, RED, 1);
  ctx.fillStyle = lite(RED, 0.3); ctx.fillRect(x - r * 0.5, y - r * 1.05, r * 0.8, 1);
  ctx.fillStyle = '#FEE2E2'; for (const [dx, dy] of [[-4, -0.62], [0, -0.85], [4, -0.6], [-1, -0.4]]) ctx.fillRect(x + dx, y + dy * r, 1, 1);
  ctx.fillStyle = dark(RED, 0.35); ctx.fillRect(x - r, y - r * 0.32, r * 1.9, 0.8);
};

// ---------------------------------------------------------------------------
// On foot
// ---------------------------------------------------------------------------

/** A Texas ranger: a white stetson, a handlebar mustache, a star on his vest, the revolver out and level. */
const drawRanger = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), SHIRT = '#F8FAFC', VEST = '#92400E';
  legs(ctx, -28, f, 0, '#1E3A8A', '#7C2D12', 12);
  // The shirt, the vest over it (its lapels, the stitching), the bolo tie
  body(ctx, -12, -58, 24, 28, SHIRT, () => {
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-1, -58, 2, 28);
    for (const [x, r] of [[-12, [5, 0, 0, 2]], [5, [0, 5, 2, 0]]] as [number, number[]][]) {
      shaded(ctx, () => ctx.roundRect(x, -58, 7, 28, r), VEST, x, -58, 7, 28, 0.9);
      ctx.fillStyle = lite(VEST, 0.35); ctx.fillRect(x + (x < 0 ? 5.4 : 0.6), -56, 0.7, 24);
    }
    ctx.fillStyle = dark(VEST, 0.3); ctx.fillRect(-11, -42, 5, 0.8); ctx.fillRect(6, -42, 5, 0.8); // the pocket welts
  });
  star(ctx, 8.6, -49, 4.5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1.6, -58); ctx.lineTo(0, -54); ctx.lineTo(1.6, -58); ctx.moveTo(-0.6, -54); ctx.lineTo(-0.8, -47); ctx.moveTo(0.6, -54); ctx.lineTo(0.8, -47); ctx.stroke();
  ink(ctx, () => ctx.ellipse(0, -54.6, 2, 1.6, 0, 0, Math.PI * 2), '#0E7490', 0.6); // the bolo's turquoise
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-1.6, -47.4, 1.2, 1.4); ctx.fillRect(0.4, -47.4, 1.2, 1.4);
  // The belt, a buckle the size of a plate
  ink(ctx, () => ctx.rect(-12, -32, 24, 4), '#A16207', 0.8);
  ctx.fillStyle = lite('#A16207', 0.3); ctx.fillRect(-11, -31.4, 22, 0.7);
  ink(ctx, () => ctx.roundRect(-4.4, -33, 8.8, 6, 1.6), '#E5E7EB', 0.8);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-2.6, -31.2, 5.2, 2.4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3.4, -32.2, 2, 0.8);
  head(ctx, 2, -65, skin, 8, 'none', 'mad');
  mustache(ctx, 2, -65, '#57534E');
  stetson(ctx, 1, -70, '#F5F5F4');
  // The arm out, the revolver level
  arm(ctx, 6, -54, 21, -50, SHIRT, skin, false, 5.5);
  revolver(ctx, 21, -51, charge(e), skin);
};

/** A biker: huge, a leather vest with the club's skull on it, bare tattooed arms, a beard to his belly, a chain swinging. */
const drawBiker = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = skinOf(e), TEE = '#1F2937', LEATHER = '#18181B';
  legs(ctx, -30, f * (running ? 1.7 : 0.6), running ? 7 : 1, TEE, '#111827', 10, 8);
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.2 : 0);
  // The back arm, behind him
  limb(ctx, -19, -32, -19, -15, 6, dark(skin, 0.15)); fist(ctx, -19, -14, dark(skin, 0.15), 3.6);
  // The gut in a black tee; the belt under it, a wallet chain off it
  const gut = () => ctx.ellipse(2, -16, 18, 19, 0, 0, Math.PI * 2);
  shaded(ctx, gut, TEE, -16, -35, 36, 38);
  ctx.fillStyle = lite(TEE, 0.3); ctx.fillRect(4, -30, 6, 1); ctx.fillRect(10, -26, 3, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(10, -1); ctx.quadraticCurveTo(14, 6, 18, 0); ctx.stroke();
  ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 0.6; ctx.setLineDash([1.2, 0.8]); ctx.stroke(); ctx.setLineDash([]);
  // The vest: two leather panels, the stitching down the edges, the snaps; the club's skull on the back one
  for (const [x, h] of [[-18, 34], [9, 30]]) {
    shaded(ctx, () => ctx.roundRect(x, -36, 9, h, [3, 3, 1, 1]), LEATHER, x, -36, 9, h);
    ctx.fillStyle = '#52525B'; ctx.fillRect(x + (x < 0 ? 7.4 : 1), -34, 0.7, h - 4);
    ctx.fillStyle = '#D4D4D8'; for (let y = -30; y < -36 + h - 4; y += 8) ctx.fillRect(x + (x < 0 ? 6 : 2), y, 1.2, 1.2);
  }
  ink(ctx, () => ctx.ellipse(-13.6, -25, 3.6, 3.4, 0, 0, Math.PI * 2), '#E7E5E4', 0.7);
  ink(ctx, () => ctx.rect(-15.4, -22.6, 3.6, 2.2), '#E7E5E4', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(-15.4, -26, 1.4, 1.6); ctx.fillRect(-12.8, -26, 1.4, 1.6); ctx.fillRect(-14.4, -21.8, 0.6, 1.4); ctx.fillRect(-13, -21.8, 0.6, 1.4);
  ink(ctx, () => ctx.roundRect(-18.4, -18, 10, 2.6, 1), '#B91C1C', 0.6); // the rocker under it
  // The front arm: bare, a tattoo (an anchor, a heart), the fist round the chain
  limb(ctx, 19, -32, 19, -19, 6, skin);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(18, -29, 2.4, 3.6); ctx.fillRect(16.8, -29, 4.8, 1); ctx.fillStyle = '#B91C1C'; ctx.fillRect(18, -24, 2.4, 1.6);
  head(ctx, 4, -44, skin, 9, 'none', 'mad');
  beard(ctx, 4, -44, 20);
  shades(ctx, 4, -44);
  bandana(ctx, 4, -44, 9);
  // The chain, swinging round as he comes
  const a = running ? f * 0.35 : -2.2;
  chain(ctx, 19, -18, 19 + Math.cos(a) * 26, -18 + Math.sin(a) * 26);
  fist(ctx, 19, -18, skin, 3.8);
  ctx.restore();
};

/** A deputy behind a riot shield (SHERIFF across it); he drops it to pitch a horseshoe. */
const drawDeputy = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), KHAKI = '#D6C7A1', HAT = '#A16207';
  const shield = (x: number, y: number, w: number, h: number, a: number) => {
    ctx.fillStyle = `rgba(203, 213, 225, ${a})`; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.5})`; ctx.fillRect(x + 2, y + 2, 3, h - 4);
    ctx.fillStyle = `rgba(100, 116, 139, ${a * 0.6})`; ctx.fillRect(x + w - 3, y + 2, 2, h - 4);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 1.4; ctx.strokeRect(x + 1.2, y + 1.2, w - 2.4, h - 2.4); // the rubber edge
  };
  if (!e.isShieldActive) shield(-30, -40, 12, 40, 0.5); // (put down at his side)
  legs(ctx, -28, f, 0, '#57534E', '#1C1917', 6);
  // The khaki shirt: the placket, the pockets and their flaps, the epaulet; the duty belt
  body(ctx, -13, -58, 26, 30, KHAKI, () => {
    ctx.fillStyle = dark(KHAKI, 0.25); ctx.fillRect(-0.6, -56, 1.2, 26);
    ctx.fillStyle = '#78350F'; for (const y of [-52, -46, -40, -34]) ctx.fillRect(0.8, y, 1.2, 1.2);
    for (const px of [-11, 3]) { ink(ctx, () => ctx.rect(px, -51, 7, 7), dark(KHAKI, 0.06), 0.6); ink(ctx, () => ctx.roundRect(px - 0.4, -52, 7.8, 2.6, [0, 0, 1.4, 1.4]), dark(KHAKI, 0.18), 0.6); }
    ink(ctx, () => ctx.rect(-13, -58, 10, 2.4), dark(KHAKI, 0.12), 0.6);
    ink(ctx, () => ctx.rect(-13, -31, 26, 4), '#1C1917', 0.8);
    ctx.fillStyle = '#44403C'; ctx.fillRect(-13, -30.4, 26, 0.8);
    ink(ctx, () => ctx.rect(-2, -31.4, 4, 4.6), '#CA8A04', 0.6);
  });
  star(ctx, -6, -50, 3.5, '#FACC15');
  ink(ctx, () => ctx.rect(4, -55, 6, 2), '#1C1917', 0.5); // the name tag
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(5, -54.4, 4, 0.7);
  head(ctx, 2, -65, skin, 8, 'flat', 'flat');
  // The campaign hat: the Montana pinch, the strap and its acorns, the flat brim
  const crown = () => { ctx.moveTo(-6, -71); ctx.lineTo(-1, -81); ctx.lineTo(1, -82.4); ctx.lineTo(3, -81); ctx.lineTo(8, -71); ctx.closePath(); };
  shaded(ctx, crown, HAT, -6, -82.4, 14, 11.4);
  ctx.strokeStyle = dark(HAT, 0.35); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(1, -82); ctx.lineTo(-1.4, -75); ctx.moveTo(1, -82); ctx.lineTo(3.4, -75); ctx.stroke();
  ink(ctx, () => ctx.rect(-5.4, -73.6, 12.8, 2), '#44403C', 0.6);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(5.4, -73.2, 1.2, 1.2);
  ink(ctx, () => ctx.ellipse(1, -70.6, 13.4, 2.2, 0, 0, Math.PI * 2), HAT, 1);
  ctx.fillStyle = lite(HAT, 0.3); ctx.fillRect(-10, -72, 10, 0.8); ctx.fillStyle = dark(HAT, 0.3); ctx.fillRect(-6, -69.4, 16, 0.7);
  if (e.isShieldActive) {
    // His arm through the straps, the shield up: clear, its edge rubbered, SHERIFF down it, cracking as it's hit
    arm(ctx, 7, -54, 15, -44, KHAKI, skin);
    const damage = 1 - e.health / e.maxHealth;
    shield(10, -76, 18, 76, 0.55);
    ctx.save(); ctx.translate(19, -36); ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = INK; ctx.fillText('SHERIFF', 0.6, 3.6); ctx.fillStyle = '#FACC15'; ctx.fillText('SHERIFF', 0, 3);
    ctx.textAlign = 'left'; ctx.restore();
    ctx.lineJoin = 'round';
    for (let i = 0; i < Math.floor(damage * 6); i++) {
      const y0 = -68 + i * 11;
      const crack = () => { ctx.beginPath(); ctx.moveTo(11, y0); ctx.lineTo(18, y0 + 5); ctx.lineTo(14, y0 + 9); ctx.lineTo(27, y0 + 11); };
      crack(); ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)'; ctx.lineWidth = 1.6; ctx.stroke();
      crack(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'; ctx.lineWidth = 0.8; ctx.stroke();
    }
  } else {
    // A horseshoe back over his shoulder
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    // (at rest it hangs at his side, gripped by the top; it comes up over his shoulder as he winds up)
    const up = Math.min(1, wind * 4), mixv = (a: number, b: number) => a + (b - a) * up;
    const hx = mixv(-11, -3 - wind * 12), hy = mixv(-21, -60);
    const fx = mixv(-11, hx - 1), fy = mixv(-26.4, hy + 4.6), ex = mixv(-10, -7 - wind * 7), ey = mixv(-40, -46);
    limb(ctx, -3, -53, ex, ey, 5.5, KHAKI); limb(ctx, ex, ey, fx, fy, 5, KHAKI);
    const shoe = () => { ctx.beginPath(); ctx.arc(hx, hy, 5, Math.PI * 0.15, Math.PI * 1.85); };
    ctx.lineCap = 'round';
    shoe(); ctx.strokeStyle = INK; ctx.lineWidth = 4.6; ctx.stroke();
    shoe(); ctx.strokeStyle = '#78716C'; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy, 5.6, Math.PI * 1.1, Math.PI * 1.5); ctx.strokeStyle = '#D6D3D1'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = INK; for (const k of [0.45, 0.8, 1.2, 1.55]) ctx.fillRect(hx + Math.cos(Math.PI * k) * 5 - 0.5, hy + Math.sin(Math.PI * k) * 5 - 0.5, 1, 1);
    fist(ctx, fx, fy, skin, 3.2);
    arm(ctx, 7, -54, 9, -38, KHAKI, skin);
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

/**
 * A wheel (turning with how far it's gone): the tire and its tread, the sidewall lit, the rim lit from the upper left,
 * the lug nuts; or (`spoked`) a chopper's chrome rim and spokes.
 */
const wheel = (ctx: Ctx, x: number, y: number, r: number, turn: number, hub = '#9CA3AF', spoked = false) => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), '#1C1917', 1.2);
  ctx.strokeStyle = '#0C0A09'; ctx.lineWidth = 1.4;
  for (let k = 0; k < 14; k++) { const a = turn + k * Math.PI / 7; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - 2.2), y + Math.sin(a) * (r - 2.2)); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); }
  ctx.strokeStyle = '#44403C'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r * 0.78, Math.PI * 0.95, Math.PI * 1.55); ctx.stroke();
  if (spoked) {
    ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, y, r * 0.72, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = hub; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = lite(hub, 0.5); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, r * 0.72, Math.PI * 1, Math.PI * 1.45); ctx.stroke();
    ctx.strokeStyle = dark(hub, 0.2); ctx.lineWidth = 0.6;
    for (let k = 0; k < 12; k++) { const a = turn + k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.18, y + Math.sin(a) * r * 0.18); ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.68, y + Math.sin(a + 0.3) * r * 0.68); ctx.stroke(); }
    ink(ctx, () => ctx.arc(x, y, r * 0.2, 0, Math.PI * 2), hub, 0.8);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - r * 0.12, y - r * 0.14, 1, 1);
    return;
  }
  ink(ctx, () => ctx.arc(x, y, r * 0.55, 0, Math.PI * 2), dark(hub, 0.25), 0.9);
  ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(x - r * 0.06, y - r * 0.06, r * 0.45, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(hub, 0.4); ctx.beginPath(); ctx.arc(x - r * 0.16, y - r * 0.16, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; for (let k = 0; k < 5; k++) { const a = turn + k * Math.PI * 0.4; ctx.fillRect(x + Math.cos(a) * r * 0.32 - 0.7, y + Math.sin(a) * r * 0.32 - 0.7, 1.4, 1.4); }
  ink(ctx, () => ctx.arc(x, y, r * 0.13, 0, Math.PI * 2), dark(hub, 0.4), 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - r * 0.3, y - r * 0.34, 1.4, 1);
};

/** A dark wheel well over a wheel at (x, y), r the wheel's size. */
const well = (ctx: Ctx, x: number, y: number, r: number) => ink(ctx, () => { ctx.arc(x, y, r + 2.4, Math.PI, 0); ctx.closePath(); }, '#0C0A09', 1);

/** Glass (`path`, its box x0..x1, y0..y1): banded sky, darker toward the bottom; then the glints across it. */
const glass = (ctx: Ctx, path: () => void, x0: number, y0: number, x1: number, y1: number) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  const h = y1 - y0;
  ctx.fillStyle = '#BFDBFE'; ctx.fillRect(x0, y0, x1 - x0, h);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(x0, y0 + h * 0.35, x1 - x0, h);
  ctx.fillStyle = '#60A5FA'; ctx.fillRect(x0, y0 + h * 0.72, x1 - x0, h);
  ctx.restore();
};
const glints = (ctx: Ctx, path: () => void, x: number, y0: number, y1: number) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x + 8, y0); ctx.lineTo(x + 12, y0); ctx.lineTo(x + 4, y1); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 7, y1); ctx.lineTo(x + 15, y0); ctx.lineTo(x + 16.4, y0); ctx.lineTo(x + 8.4, y1); ctx.fill();
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
};

/** Chrome (a bumper, a bar): inked, the sky in its top half, the ground in its bottom, a hot line between. */
const chrome = (ctx: Ctx, path: () => void, x: number, y: number, w: number, h: number) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(x, y + h * 0.55, w, h);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y + h * 0.42, w, Math.max(0.8, h * 0.12));
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
};

/** A painted panel (`path`, its box): the paint, the top lit, a bottom band in shadow, `hi` a lit line (the swage). */
const paintwork = (ctx: Ctx, path: () => void, paint: string, x: number, y: number, w: number, h: number, extra?: () => void) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = paint; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(paint, 0.28); ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = dark(paint, 0.25); ctx.fillRect(x, y + h - 5, w, 5);
  extra?.();
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
};

/** A lamp: inked, the lens, a glint. */
const lamp = (ctx: Ctx, x: number, y: number, w: number, h: number, lens: string) => {
  ink(ctx, () => ctx.roundRect(x, y, w, h, 1), lens, 0.8);
  ctx.fillStyle = dark(lens, 0.2); ctx.fillRect(x + 0.6, y + h * 0.6, w - 1.2, h * 0.34);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 1, y + 1, Math.max(1, w * 0.3), 1);
};

/** A hard hat on a head at (x, y), r its size, tipped by `tip`: yellow, the ridge, the brim lit. */
const hardHat = (ctx: Ctx, x: number, y: number, r: number, tip = 0) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tip);
  ink(ctx, () => { ctx.ellipse(0, -r * 0.35, r + 0.8, r * 0.9, 0, Math.PI, 0); ctx.closePath(); }, '#FACC15', 0.9);
  ctx.fillStyle = lite('#FACC15', 0.4); ctx.fillRect(-r * 0.5, -r * 1.05, r * 0.7, 1);
  ctx.fillStyle = dark('#FACC15', 0.2); ctx.fillRect(-0.6, -r * 1.2, 1.4, r * 0.85);
  ink(ctx, () => ctx.roundRect(-r - 2, -r * 0.4, r * 2 + 5, 2, 1), '#EAB308', 0.8);
  ctx.restore();
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

/** A stove-in front end: the panel crumpled in, its creases, a headlight hanging off on its wire. */
const stoveIn = (ctx: Ctx, x: number, y: number, f: number) => {
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + 8, y + 4); ctx.lineTo(x + 6, y + 9); ctx.lineTo(x + 20, y + 10); ctx.lineTo(x + 8, y + 20); ctx.lineTo(x + 2, y + 14); ctx.closePath(); }, 'rgba(12, 10, 9, 0.55)', 0.8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(x + 8, y + 6); ctx.moveTo(x + 7, y + 11); ctx.lineTo(x + 16, y + 11); ctx.stroke();
  const sw = Math.sin(f * 0.15) * 1.5;
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + 18, y + 10); ctx.quadraticCurveTo(x + 22, y + 14, x + 21 + sw, y + 18); ctx.stroke();
  lamp(ctx, x + 18.6 + sw, y + 17.6, 4.6, 4, '#FEF08A');
};

/**
 * A union pickup: an old full-size truck, a union decal on the door, the driver in the cab with his hard hat on, and one
 * of the boys stood up in the bed with an arm back to throw whatever's in it.
 */
export const drawPickupBody = (ctx: Ctx, paint: string, turn: number, wind: number, f: number, opts: { critical?: boolean; slumped?: boolean; noThrower?: boolean } = {}) => {
  // The man in the bed (drawn first: the bed's side hides his legs): jeans, hi-vis vest, hard hat, winding up to throw
  if (!opts.noThrower) {
    const skin = '#E0AC69', VIS = '#F97316';
    shaded(ctx, () => ctx.rect(-46, -58, 14, 20), '#1E3A8A', -46, -58, 14, 20);
    body(ctx, -47, -70, 16, 16, VIS, () => {
      ctx.fillStyle = '#FDE047'; ctx.fillRect(-47, -63, 16, 2); ctx.fillRect(-43, -70, 2, 16);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-47, -62.6, 16, 0.6);
    }, [4, 4, 1, 1]);
    head(ctx, -38, -76, skin, 6, 'grin', 'mad');
    hardHat(ctx, -38, -78, 6);
    const a = -0.6 - wind * 2.2;
    ctx.save(); ctx.translate(-34, -66); ctx.rotate(a);
    limb(ctx, 0, 0, 13, 0, 5.4, VIS);
    // (whatever he's about to throw: a brick out of the bed)
    ink(ctx, () => ctx.rect(13, -5, 9, 8), '#B91C1C', 0.9);
    ctx.fillStyle = lite('#B91C1C', 0.3); ctx.fillRect(13.6, -4.4, 7.8, 1.4);
    ctx.fillStyle = dark('#B91C1C', 0.3); ctx.fillRect(13.6, 1.4, 7.8, 1); ctx.fillRect(16, -1, 3, 1.6);
    fist(ctx, 13, 0, skin, 3);
    ctx.restore();
  }
  // The bed: the rail along the top, the stake pockets, the tailgate's seam, rust coming through
  const bed = () => ctx.rect(-74, -40, 76, 26);
  paintwork(ctx, bed, paint, -74, -40, 76, 26, () => {
    ctx.fillStyle = dark(paint, 0.4); for (const x of [-60, -30, -8]) ctx.fillRect(x, -39, 3, 2);
    ctx.fillStyle = dark(paint, 0.15); ctx.fillRect(-74, -29, 76, 1); ctx.fillStyle = lite(paint, 0.2); ctx.fillRect(-74, -28, 76, 1);
    ctx.fillStyle = '#7C2D12'; for (const [x, y] of [[-66, -18], [-64, -17], [-12, -19], [-10, -18], [-11, -17]]) ctx.fillRect(x, y, 1.4, 1.4);
  });
  ctx.fillStyle = INK; ctx.fillRect(-71, -38, 0.8, 22);
  // The cab: the roof lit, the hood sloping down to the grille, the swage line down the side
  const cab = () => { ctx.moveTo(2, -14); ctx.lineTo(2, -64); ctx.lineTo(40, -64); ctx.lineTo(54, -42); ctx.lineTo(76, -40); ctx.lineTo(76, -14); ctx.closePath(); };
  paintwork(ctx, cab, paint, 2, -64, 74, 50, () => {
    ctx.fillStyle = lite(paint, 0.28); ctx.beginPath(); ctx.moveTo(54, -42); ctx.lineTo(76, -40); ctx.lineTo(76, -37.6); ctx.lineTo(52, -39.6); ctx.fill();
    ctx.fillStyle = dark(paint, 0.15); ctx.fillRect(2, -29, 74, 1); ctx.fillStyle = lite(paint, 0.2); ctx.fillRect(2, -28, 74, 1);
    ctx.fillStyle = dark(paint, 0.2); ctx.fillRect(2, -64, 3, 50);
  });
  // The door: its seam, the handle, the mirror
  ctx.strokeStyle = dark(paint, 0.5); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(6, -44); ctx.lineTo(6, -16); ctx.lineTo(48, -16); ctx.lineTo(48, -41); ctx.stroke();
  ink(ctx, () => ctx.rect(9, -40, 5, 1.6), '#D1D5DB', 0.6);
  ink(ctx, () => ctx.roundRect(48, -50, 4, 6, 1), dark(paint, 0.2), 0.8);
  // The window: the driver in it, behind the glass
  const win = () => { ctx.moveTo(8, -60); ctx.lineTo(38, -60); ctx.lineTo(50, -44); ctx.lineTo(8, -44); ctx.closePath(); };
  glass(ctx, win, 8, -60, 50, -44);
  ctx.save(); ctx.beginPath(); win(); ctx.clip();
  if (opts.slumped) { head(ctx, 34, -47, '#E0AC69', 6, 'flat', 'flat', 'shut'); hardHat(ctx, 34, -49, 6, 0.5); }
  else { head(ctx, 26, -52, '#E0AC69', 6, 'flat', 'mad'); hardHat(ctx, 26, -54, 6); }
  ctx.restore();
  glints(ctx, win, 12, -60, -44);
  // The decal, chrome, lights
  ink(ctx, () => ctx.arc(24, -30, 9, 0, Math.PI * 2), '#F8FAFC', 0.8);
  ctx.strokeStyle = '#1D4ED8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(24, -30, 7.8, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 4px monospace'; ctx.textAlign = 'center'; ctx.fillText('LOCAL', 24, -30.6); ctx.fillText('69', 24, -26.2); ctx.textAlign = 'left';
  chrome(ctx, () => ctx.roundRect(72, -26, 6, 10, 1.4), 72, -26, 6, 10);
  ink(ctx, () => ctx.rect(74, -36, 2.4, 9), '#27272A', 0.6); // the grille's edge
  lamp(ctx, 72, -38, 5, 5, '#FEF08A');
  chrome(ctx, () => ctx.roundRect(-77, -20, 6, 6, 1), -77, -20, 6, 6);
  lamp(ctx, -76, -36, 4, 6, '#DC2626');
  well(ctx, -48, -13, 13); well(ctx, 50, -13, 13);
  wheel(ctx, -48, -13, 13, turn); wheel(ctx, 50, -13, 13, turn);
  if (opts.critical) {
    // Stove in, a headlight hanging off, smoking and burning
    stoveIn(ctx, 40, -40, f);
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
  const BLACK = '#1F2937';
  const shell = () => { ctx.moveTo(-75, -14); ctx.lineTo(-73, -32); ctx.lineTo(-40, -34); ctx.lineTo(-28, -50); ctx.lineTo(24, -50); ctx.lineTo(40, -34); ctx.lineTo(75, -30); ctx.lineTo(76, -14); ctx.closePath(); };
  paintwork(ctx, shell, BLACK, -76, -50, 152, 36, () => {
    // (the hood and trunk lit, the white doors, their seam, the swage)
    ctx.fillStyle = lite(BLACK, 0.3); ctx.fillRect(40, -34, 36, 2.4); ctx.fillRect(-73, -33, 33, 2.4);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-40, -34, 80, 20);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-40, -34, 80, 2);
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-40, -19, 80, 5); ctx.fillRect(28, -34, 12, 20);
    ctx.fillStyle = dark(BLACK, 0.3); ctx.fillRect(-76, -19, 36, 5); ctx.fillRect(40, -19, 36, 5);
  });
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-40, -34); ctx.lineTo(-40, -14); ctx.moveTo(-4, -34); ctx.lineTo(-4, -14); ctx.moveTo(40, -34); ctx.lineTo(40, -14); ctx.stroke();
  ink(ctx, () => ctx.rect(-34, -31, 5, 1.6), '#9CA3AF', 0.5); ink(ctx, () => ctx.rect(2, -31, 5, 1.6), '#9CA3AF', 0.5);
  ctx.fillStyle = INK; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillText('TEXAS', 0.6, -19.4); ctx.fillStyle = '#111827'; ctx.fillText('TEXAS', 0, -20); ctx.textAlign = 'left';
  star(ctx, -24, -24, 5, '#CA8A04');
  ink(ctx, () => ctx.arc(-24, -24, 6.6, 0, Math.PI * 2), 'rgba(0,0,0,0)', 0.7);
  // The windows, the post between
  const win = () => { ctx.moveTo(-24, -47); ctx.lineTo(20, -47); ctx.lineTo(32, -35); ctx.lineTo(-34, -35); ctx.closePath(); };
  glass(ctx, win, -34, -47, 32, -35);
  ctx.save(); ctx.beginPath(); win(); ctx.clip();
  if (opts.slumped) { head(ctx, 14, -38, '#F2C9A0', 6, 'flat', 'flat', 'shut'); }
  ctx.restore();
  glints(ctx, win, -20, -47, -35);
  ink(ctx, () => ctx.rect(-5, -47, 3, 12), BLACK, 0.8);
  // The push bar and bumpers, the lights
  chrome(ctx, () => ctx.roundRect(72, -24, 6, 10, 1.4), 72, -24, 6, 10);
  ink(ctx, () => { ctx.moveTo(74, -30); ctx.lineTo(80, -28); ctx.lineTo(80, -14); ctx.lineTo(77, -14); ctx.lineTo(77, -26); ctx.lineTo(74, -27); ctx.closePath(); }, '#27272A', 0.8);
  ctx.fillStyle = '#52525B'; ctx.fillRect(78, -27, 1, 12);
  lamp(ctx, 69, -30, 5, 4, '#FEF08A');
  chrome(ctx, () => ctx.roundRect(-78, -22, 6, 8, 1.4), -78, -22, 6, 8);
  lamp(ctx, -75, -30, 4, 6, '#DC2626');
  ink(ctx, () => ctx.roundRect(28, -40, 3.4, 5, 1), BLACK, 0.7); // the spotlight on the post
  // The light bar, going
  const on = Math.floor(f / 6) % 2 === 0;
  ink(ctx, () => ctx.rect(-15, -51.4, 26, 2), '#27272A', 0.7);
  for (const [x, lit, off, rgb] of [[-14, '#EF4444', '#7F1D1D', '239, 68, 68'], [-2, '#3B82F6', '#1E3A8A', '59, 130, 246']] as const) {
    const go = (x < 0) === on;
    ink(ctx, () => ctx.roundRect(x, -55, 12, 5, [2, 2, 0, 0]), go ? lit : off, 0.8);
    ctx.fillStyle = go ? '#FFFFFF' : lite(off, 0.3); ctx.fillRect(x + 2, -54, 4, 1);
    if (go) {
      ctx.fillStyle = `rgba(${rgb}, 0.14)`; ctx.beginPath(); ctx.arc(x + 6, -53, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${rgb}, 0.26)`; ctx.beginPath(); ctx.arc(x + 6, -53, 12, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (opts.slumped) {
    stetson(ctx, 15, -41, '#F5F5F4');
  } else {
    // The ranger, leaning out the window, revolver on whichever side he's at
    const skin = '#F2C9A0';
    body(ctx, 4, -58, 12, 16, '#F8FAFC', () => {
      ctx.fillStyle = '#92400E'; ctx.fillRect(4, -58, 3.4, 16); ctx.fillRect(12.6, -58, 3.4, 16);
    }, [4, 4, 1, 1]);
    star(ctx, 14.4, -52, 2.4);
    head(ctx, 10, -63, skin, 6, 'none', 'mad');
    mustache(ctx, 9, -64, '#57534E');
    stetson(ctx, 10, -67, '#F5F5F4');
    const d = aim > 0 ? 1 : -1;
    arm(ctx, d > 0 ? 13 : 7, -54, d > 0 ? 24 : -4, -52, '#F8FAFC', skin, false, 5);
    revolver(ctx, d > 0 ? 24 : -4, -53, opts.shooting ?? 0, skin, d);
  }
  well(ctx, -46, -12, 12); well(ctx, 48, -12, 12);
  wheel(ctx, -46, -12, 12, turn, '#E5E7EB'); wheel(ctx, 48, -12, 12, turn, '#E5E7EB');
  if (opts.critical) {
    stoveIn(ctx, 36, -34, f);
    drawCriticalSmoke(ctx, 58, -34, f);
  }
};

const drawCruiser = (ctx: Ctx, e: Enemy, f: number) => {
  // (it sits behind him or out in front: the ranger leans out the side he's on)
  drawCruiserBody(ctx, e.pos.x / 12, f, (e.aiX ?? 0) < 0 ? 1 : -1, { critical: e.health <= e.maxHealth / 2, shooting: Math.max(0, (e.shootTimer - 90) / 20) });
};

/** A tube (a fork, a pipe, a bar) from point to point: inked, its colour, the lit line along it. */
const tube = (ctx: Ctx, pts: [number, number][], w: number, color: string) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) ctx.lineTo(x, y); };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.stroke();
  path(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  ctx.save(); ctx.translate(-w * 0.2, -w * 0.25); path(); ctx.strokeStyle = lite(color, 0.55); ctx.lineWidth = Math.max(0.7, w * 0.3); ctx.stroke(); ctx.restore();
  ctx.lineCap = 'butt';
};

/** A chopper: long raked forks, ape-hanger bars, a teardrop tank with flames on it. `tilt` leans it back (a wheelie) or forward. */
export const drawChopperBike = (ctx: Ctx, x: number, y: number, tilt: number, turn: number, tank = '#111827') => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const back = { x: -26, y: -13 }, front = { x: 34, y: -13 };
  const CHROME = '#D1D5DB';
  wheel(ctx, back.x, back.y, 13, turn, CHROME, true); wheel(ctx, front.x, front.y, 12, turn, CHROME, true);
  // The rear fender over the back wheel
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(back.x, back.y, 15, Math.PI * 1.02, Math.PI * 1.62); ctx.strokeStyle = INK; ctx.lineWidth = 4.6; ctx.stroke();
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(back.x, back.y, 15.6, Math.PI * 1.1, Math.PI * 1.4); ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.lineCap = 'butt';
  // The frame; the forks, raked way out; the ape hangers, the grip
  tube(ctx, [[back.x, back.y], [-4, -18], [16, -40]], 3, '#374151');
  tube(ctx, [[-4, -18], [-14, -30], [16, -42]], 2, '#374151');
  tube(ctx, [[front.x + 1.4, front.y], [17.4, -46]], 2, CHROME);
  tube(ctx, [[front.x - 1.4, front.y], [15, -46]], 2, CHROME);
  tube(ctx, [[16, -46], [12, -58], [6, -58]], 1.8, CHROME);
  ink(ctx, () => ctx.roundRect(3, -59.6, 5, 3.2, 1), '#18181B', 0.7);
  // The headlight on the forks
  ink(ctx, () => ctx.ellipse(19.4, -44, 3.6, 3, 0, 0, Math.PI * 2), CHROME, 0.8);
  ink(ctx, () => ctx.ellipse(22, -44, 1.2, 2.4, 0, 0, Math.PI * 2), '#FEF08A', 0.6);
  // The engine: the V-twin's finned jugs, the crankcase, the chrome covers
  shaded(ctx, () => ctx.roundRect(-8, -26, 18, 12, 2), '#4B5563', -8, -26, 18, 12);
  ink(ctx, () => ctx.arc(-2, -19, 3.4, 0, Math.PI * 2), CHROME, 0.7);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3.6, -21, 1.4, 1);
  for (const [cx, r] of [[-3.5, -0.3], [4.5, 0.3]] as [number, number][]) {
    ctx.save(); ctx.translate(cx, -27); ctx.rotate(r);
    shaded(ctx, () => ctx.rect(-3, -5, 6, 7), '#9CA3AF', -3, -5, 6, 7, 0.8);
    ctx.fillStyle = '#4B5563'; for (let k = -4; k < 2; k += 1.6) ctx.fillRect(-3, k, 6, 0.7);
    ink(ctx, () => ctx.rect(-3.4, -6.6, 6.8, 2), CHROME, 0.6);
    ctx.restore();
  }
  // The pipes, back past the wheel, fishtailed
  tube(ctx, [[-4, -16], [-36, -18]], 2.4, CHROME);
  tube(ctx, [[-2, -20], [-12, -22], [-35, -22]], 2, CHROME);
  ink(ctx, () => { ctx.moveTo(-36, -20); ctx.lineTo(-41, -21.6); ctx.lineTo(-41, -15.4); ctx.lineTo(-36, -16.4); ctx.closePath(); }, '#9CA3AF', 0.7);
  // The tank: a teardrop, lit along the top, the flames on it, the filler cap
  const tankPath = () => ctx.ellipse(6, -38, 12, 6, -0.25, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); tankPath(); ctx.clip();
  ctx.fillStyle = tank; ctx.fillRect(-7, -48, 26, 18);
  ctx.fillStyle = lite(tank, 0.25); ctx.save(); ctx.translate(6, -38); ctx.rotate(-0.25); ctx.fillRect(-12, -6, 24, 2.4); ctx.fillStyle = dark(tank, 0.3); ctx.fillRect(-12, 3, 24, 3); ctx.restore();
  ink(ctx, () => { ctx.moveTo(-2, -36); ctx.lineTo(10, -42); ctx.lineTo(7, -38.4); ctx.lineTo(16, -41); ctx.lineTo(11, -36.6); ctx.lineTo(17, -37); ctx.lineTo(4, -33); ctx.closePath(); }, '#F97316', 0.6);
  ctx.fillStyle = '#FDE047'; ctx.beginPath(); ctx.moveTo(0, -35.6); ctx.lineTo(8, -39.4); ctx.lineTo(6, -37); ctx.lineTo(12, -37.6); ctx.lineTo(4, -34.6); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, -42, 4, 1);
  ctx.restore();
  ctx.beginPath(); tankPath(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(8, -44, 2, 1, -0.25, 0, Math.PI * 2), CHROME, 0.6);
  // The seat: stitched, low; the footpeg
  ink(ctx, () => ctx.roundRect(-22, -32, 20, 5, [1, 3, 1, 1]), '#1C1917', 1);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-20, -31.4, 15, 1); ctx.fillStyle = '#57534E'; for (let k = -19; k < -4; k += 2.4) ctx.fillRect(k, -29.4, 1, 0.6);
  ink(ctx, () => ctx.roundRect(8, -15, 6, 2, 0.8), '#27272A', 0.6);
  ctx.restore();
};

/** A biker on his chopper: sat back, boots up on the pegs, one hand on the bars, the other swinging a chain. */
const drawChopperRider = (ctx: Ctx, e: Enemy, f: number) => {
  const swing = e.aiState === 'swing' ? (e.aiTimer || 0) / 18 : 0;
  const tilt = e.aiState === 'swing' ? -0.08 : 0;
  drawChopperBike(ctx, 0, 0, tilt, e.pos.x / 11, pick(e, ['#111827', '#7F1D1D', '#1E3A8A']));
  const skin = skinOf(e), TEE = '#1F2937', LEATHER = '#18181B';
  ctx.save(); ctx.rotate(tilt);
  // The leg out to the peg: the thigh along the seat, the shin down, the engineer boot
  limb(ctx, -12, -32, 6, -32, 8, TEE);
  limb(ctx, 7, -32, 7, -18, 6.5, TEE);
  ink(ctx, () => ctx.roundRect(2, -20, 12, 7, [2, 3, 1, 1]), '#111827', 0.9);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4, -19, 3, 1.2); ctx.fillStyle = '#374151'; ctx.fillRect(3, -14.2, 11, 1);
  // The gut, the vest
  const gut = () => ctx.ellipse(-6, -50, 13, 15, -0.15, 0, Math.PI * 2);
  shaded(ctx, gut, TEE, -19, -65, 26, 30);
  ctx.fillStyle = lite(TEE, 0.3); ctx.fillRect(-2, -56, 4, 1);
  shaded(ctx, () => ctx.roundRect(-18, -64, 7, 26, [3, 2, 1, 1]), LEATHER, -18, -64, 7, 26);
  ctx.fillStyle = '#52525B'; ctx.fillRect(-12.6, -62, 0.7, 22);
  ink(ctx, () => ctx.ellipse(-14.6, -52, 2.6, 2.4, 0, 0, Math.PI * 2), '#E7E5E4', 0.6);
  ctx.fillStyle = INK; ctx.fillRect(-15.8, -52.8, 1, 1.2); ctx.fillRect(-14, -52.8, 1, 1.2);
  ctx.save(); ctx.beginPath(); gut(); ctx.clip();
  shaded(ctx, () => ctx.rect(-1, -66, 5, 30), LEATHER, -1, -66, 5, 30, 0.8);
  ctx.restore();
  // The arm out to the bars
  arm(ctx, -2, -58, 6, -57, skin, skin, false, 5);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(0, -59, 2.4, 2);
  head(ctx, -3, -70, skin, 8, 'none', 'mad');
  beard(ctx, -3, -70, 18);
  shades(ctx, -3, -70);
  bandana(ctx, -3, -70, 8);
  // The chain
  const a = e.aiState === 'swing' ? -2.6 + swing * 3.2 : -2.2 + Math.sin(f * 0.2) * 0.3;
  limb(ctx, -13, -59, -13, -50, 6, skin);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-14.4, -57, 2.4, 2.4);
  chain(ctx, -13, -50, -13 + Math.cos(a) * 34, -50 + Math.sin(a) * 34);
  fist(ctx, -13, -50, skin, 3.4);
  ctx.restore();
};

/** Dirty Dan's light machine gun, lying about (across his bars, flung onto a pile): long, black, a belt of brass hanging off it. */
export const drawLmgProp = (ctx: Ctx, x: number, y: number, rot: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ink(ctx, () => { ctx.moveTo(-30, -3); ctx.lineTo(-22, -4); ctx.lineTo(-22, 4); ctx.lineTo(-30, 5); ctx.closePath(); }, '#18181B', 0.8); // the stock
  shadedTop(ctx, () => ctx.rect(-22, -4, 26, 8), '#27272A', -22, -4, 26, 8, 0.9); // the receiver
  shadedTop(ctx, () => ctx.rect(4, -3, 22, 5), '#3F3F46', 4, -3, 22, 5, 0.8); // the barrel shroud, its vents
  ctx.fillStyle = '#18181B'; for (const vx of [7, 12, 17, 22]) ctx.fillRect(vx, -2, 2, 3);
  ink(ctx, () => ctx.rect(26, -2, 4, 3), '#18181B', 0.6);
  ink(ctx, () => ctx.roundRect(-10, 4, 4, 7, 1), '#18181B', 0.7); // the grip
  ink(ctx, () => ctx.rect(-6, 4, 11, 9), '#3F3F2E', 0.8); // the ammo box
  ctx.fillStyle = lite('#3F3F2E', 0.25); ctx.fillRect(-5.4, 4.6, 9.8, 1);
  for (let k = 0; k < 5; k++) { ink(ctx, () => ctx.rect(4 + k * 2, 3 + k * 2, 2, 3), '#CA8A04', 0.4); ctx.fillStyle = '#FDE68A'; ctx.fillRect(4 + k * 2, 3 + k * 2, 0.8, 1); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(20, 2); ctx.lineTo(16, 12); ctx.moveTo(20, 2); ctx.lineTo(25, 12); ctx.stroke();
  ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.stroke(); // the bipod
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-20, -3.4, 22, 0.8);
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
  // Soot, dithered over him
  ctx.fillStyle = 'rgba(28, 25, 23, 0.55)';
  for (const [x0, y0, w, h] of [[-12, top + 16, 10, 14], [4, top + 40, 10, 10]]) for (let y = 0; y < h; y += 1.4) for (let x = (y / 1.4) % 2 ? 0.7 : 0; x < w; x += 1.4) ctx.fillRect(x0 + x, y0 + y, 0.7, 0.7);
  // Blood down the front (a dark edge, the wet shine), splashes on the arms
  const blood = (path: () => void) => { ctx.beginPath(); path(); ctx.fillStyle = '#7F1D1D'; ctx.fill(); };
  blood(() => { ctx.moveTo(-6, top + 22); ctx.lineTo(2, top + 22); ctx.lineTo(1.6, top + 42); ctx.lineTo(0, top + 52); ctx.lineTo(-2, top + 52); ctx.lineTo(-4, top + 42); ctx.lineTo(-6, top + 38); ctx.closePath(); });
  blood(() => ctx.arc(8, top + 30, 5, 0, Math.PI * 2)); blood(() => ctx.arc(-10, top + 36, 4, 0, Math.PI * 2));
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-4.6, top + 23, 5, 14); ctx.fillRect(-2.4, top + 37, 3, 12); ctx.beginPath(); ctx.arc(7.4, top + 29.4, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-10.4, top + 35.4, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-4, top + 24, 1, 4); ctx.fillRect(6, top + 27.4, 1.4, 1); ctx.fillRect(-11.4, top + 34, 1, 1);
  ctx.fillStyle = '#7F1D1D'; for (const [dx, dy] of [[12, 22], [-14, 28], [10, 40]]) ctx.fillRect(dx, top + dy, 1.4, 1.4);
  // A bloody bandage round the head (wrapped, its tail loose), blood down the face, red eyes
  ink(ctx, () => ctx.rect(hx - 9, hy - 6, 18, 4), '#F5F5F4', 0.8);
  ctx.fillStyle = '#D6D3D1'; ctx.fillRect(hx - 9, hy - 3, 18, 1); ctx.fillRect(hx - 3, hy - 6, 0.7, 4); ctx.fillRect(hx + 4, hy - 6, 0.7, 4);
  ink(ctx, () => { ctx.moveTo(hx - 9, hy - 5); ctx.lineTo(hx - 14, hy - 1 + Math.sin(f * 0.2)); ctx.lineTo(hx - 12.6, hy + 1 + Math.sin(f * 0.2)); ctx.lineTo(hx - 9, hy - 3); ctx.closePath(); }, '#E7E5E4', 0.7);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(hx + 2, hy - 6, 5, 4); ctx.fillStyle = '#DC2626'; ctx.fillRect(hx + 2.8, hy - 5.4, 3, 2.4);
  ctx.fillStyle = '#991B1B'; ctx.fillRect(hx - 5, hy - 2, 2, 8); ctx.fillRect(hx - 5.4, hy + 6, 1.4, 1.4);
  if (e.kind !== 'biker') {
    ctx.fillStyle = '#EF4444'; ctx.fillRect(hx - 0.5, hy - 2.5, 3, 3); ctx.fillRect(hx + 4, hy - 2.5, 3, 3);
    ctx.fillStyle = INK; ctx.fillRect(hx + 1, hy - 1.8, 1.4, 1.8); ctx.fillRect(hx + 5.5, hy - 1.8, 1.4, 1.8);
  } else { ctx.fillStyle = '#EF4444'; ctx.fillRect(hx + 1, hy - 2.6, 2, 1); ctx.fillRect(hx + 5.4, hy - 2.6, 2, 1); }
  // Steaming mad: puffs off either side, in steps
  const q = (f % 36) / 36, a = 0.7 * (1 - q);
  for (const [sx, d] of [[hx - 6, -1], [hx + 8, 1]]) {
    const px = sx + d * q * 6, py = hy - 14 - q * 16, r = 3 + q * 5;
    ctx.fillStyle = `rgba(168, 162, 158, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(231, 229, 228, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(px - r * 0.25, py - r * 0.25, r * 0.65, 0, Math.PI * 2); ctx.fill();
  }
};
