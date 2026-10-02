// Ernie's stage: San Francisco's finest (a tech bro in a fleece vest with a
// pistol, a bike courier who runs you down swinging a U-lock, a protester
// behind his cardboard sign), the wildlife (a trash panda, a seagull), the
// drones, the goons on jet skis, and the poor souls on fire on the bridge. On
// Alcatraz: the tour's convict reenactor and the park rangers.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFlameLicks } from '../fx/fireball';
import { INK, ink, shaded, shadedTop, lite, dark, limb } from '../npc/kit';
import { DRONE_AIM } from '../../enemies/kinds/ernie';

type Ctx = CanvasRenderingContext2D;

export const drawErnieKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'techbro': drawTechbro(ctx, e, f); break;
    case 'courier': drawCourier(ctx, e, f); break;
    case 'protester': drawProtester(ctx, e, f); break;
    case 'raccoon': drawRaccoon(ctx, e, f); break;
    case 'seagull': drawSeagull(ctx, e, f); break;
    case 'drone': drawDrone(ctx, e, f, state); break;
    case 'jetskier': drawJetskier(ctx, e, f); break;
    case 'burning': drawBurning(ctx, e, f); break;
    case 'convict': drawConvict(ctx, e, f); break;
    case 'parkranger': drawParkRanger(ctx, e, f); break;
  }
};

// The people are drawn the townsfolk's way (an ink line round every part, each part shaded in steps, a face with eyes
// and brows and a mouth that does something, hands), out of a few parts of their own: legs, a body, a head, hair, arms.

/** Two legs in trousers, shaded, soled shoes; striding when `stride` is up; `over` drawn on each leg (stripes). */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants: string, shoe = '#111827', over?: (x: number) => void) => {
  const s = Math.sin(f * 0.25) * stride;
  const white = shoe === '#F8FAFC';
  for (const x of [-8 + s, 2 - s]) {
    const leg = () => ctx.rect(x, hipY, 7, -hipY - 4);
    shaded(ctx, leg, pants, x, hipY, 7, -hipY - 4);
    if (over) { ctx.save(); ctx.beginPath(); leg(); ctx.clip(); over(x); ctx.restore(); ctx.beginPath(); leg(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); }
    ink(ctx, () => ctx.roundRect(x - 1, -5, 10, 5, [2.5, 3, 1, 1]), shoe, 1);
    ctx.fillStyle = white ? '#FFFFFF' : lite(shoe, 0.35); ctx.fillRect(x, -4.4, 3, 1);
    ctx.fillStyle = white ? '#94A3B8' : lite(shoe, 0.55); ctx.fillRect(x - 1, -1, 10, 1);
  }
};

/** A body (a shirt, a jersey): shaded, inked, the shoulders rounded; `detail` drawn on it, inside its line. */
const body = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, detail?: () => void, r: number | number[] = [5, 5, 2, 2]) => {
  const path = () => ctx.roundRect(x, y, w, h, r);
  shaded(ctx, path, color, x, y, w, h);
  if (!detail) return;
  ctx.save(); ctx.beginPath(); path(); ctx.clip(); detail(); ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

type Mouth = 'flat' | 'smirk' | 'grin' | 'snarl' | 'o' | 'none';
interface Face { mouth?: Mouth; brow?: 'flat' | 'mad' | 'up'; eyes?: boolean }

/** A head at (x, y), facing right: the neck, the skull (the back of it in shadow), an ear, eyes and brows, a nose, a mouth. */
const head = (ctx: Ctx, x: number, y: number, skin: string, r = 8, o: Face = {}) => {
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
  const ey = y - 1, scared = o.brow === 'up';
  if (o.eyes !== false) for (const [ex, back] of [[x + 1, true], [x + 5.5, false]] as const) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - (scared ? 2 : 1.5), 3, scared ? 3.8 : 3);
    ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
    if (o.brow === 'mad') { ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(ex - 2, ey - (back ? 4.2 : 2.6)); ctx.lineTo(ex + 2, ey - (back ? 2.6 : 4.2)); ctx.stroke(); }
    else ctx.fillRect(ex - 1.5, ey - (scared ? 5 : 3.6), 3, 1);
  }
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 1, 2, 2.4);
  // (the mouth)
  const mx = x + 3.4, my = y + r * 0.62;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (o.mouth ?? 'flat') {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(mx - 2, my + 0.6); ctx.lineTo(mx + 1, my + 0.4); ctx.lineTo(mx + 2.6, my - 0.8); ctx.stroke(); break;
    case 'grin': ctx.fillRect(mx - 3, my - 0.6, 6.4, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(mx - 2.4, my - 0.4, 5.2, 1.2); break;
    case 'snarl': ctx.fillRect(mx - 2.6, my - 0.6, 5.6, 2.4); ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) ctx.fillRect(mx - 2 + k * 1.8, my - 0.4, 1.2, 1); break;
    case 'o': ink(ctx, () => ctx.ellipse(mx, my + 0.4, 1.5, 1.9, 0, 0, Math.PI * 2), '#450A0A', 0.6); break;
  }
};

/** Hair over the top of a head at (x, y), r its size: inked, a lit streak. */
const hairCap = (ctx: Ctx, x: number, y: number, r: number, color: string) => {
  ink(ctx, () => { ctx.ellipse(x - 0.6, y - r * 0.35, r + 0.6, r * 0.82, 0, Math.PI * 1.02, Math.PI * 2.06); ctx.lineTo(x + r - 2, y - r * 0.3); ctx.closePath(); }, color, 1);
  ctx.fillStyle = lite(color, 0.3); ctx.fillRect(x - 3, y - r * 0.95, 5, 1.2);
};

/** An arm from the shoulder (sx, sy) to the hand (hx, hy): sleeved all the way (or short-sleeved), the hand. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, short = false, w = 5.5) => {
  limb(ctx, sx, sy, hx, hy, w, short ? skin : sleeve);
  if (short) limb(ctx, sx, sy, sx + (hx - sx) * 0.4, sy + (hy - sy) * 0.4, w + 0.6, sleeve);
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), skin, 0.8);
};

/** How near a gun is to going (0 to 1). */
const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);

/** A stepped glow at a muzzle: an outer ring, a hot middle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, rgb: string, a: number) => {
  ctx.fillStyle = `rgba(${rgb}, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** A pistol (x, y the grip): the slide lit along the top, the sights; glowing at the muzzle by `c`. */
const pistol = (ctx: Ctx, x: number, y: number, c: number, metal = '#1F2937') => {
  ink(ctx, () => { ctx.moveTo(x, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 5.4, y + 7); ctx.lineTo(x - 0.8, y + 7); ctx.closePath(); }, dark(metal, 0.15), 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x + 8, y + 1.2, 2, 0, Math.PI); ctx.stroke(); // the trigger guard
  shadedTop(ctx, () => ctx.rect(x, y - 3, 16, 4.4), metal, x, y - 3, 16, 4.4, 0.8);
  ctx.fillStyle = lite(metal, 0.5); ctx.fillRect(x + 1, y - 2.3, 12, 0.8);
  ctx.fillStyle = INK; ctx.fillRect(x + 14, y - 4, 1.4, 1); ctx.fillRect(x + 15.2, y - 1.6, 0.8, 1.4);
  if (c > 0.6) glow(ctx, x + 19, y - 1, 2 + c * 3, '254, 240, 138', c);
};

/** The gun arm: out in front from the shoulder, the fist round the pistol's grip. */
const gunArm = (ctx: Ctx, e: Enemy, sleeve: string, skin: string, short = false) => {
  arm(ctx, 6, -51, 16, -42, sleeve, skin, short);
  pistol(ctx, 16, -43, charge(e));
  ink(ctx, () => ctx.roundRect(14.2, -43.4, 5, 4.6, 1.6), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(15, -41.4, 3.4, 0.6);
};

// ---------------------------------------------------------------------------
// Alcatraz
// ---------------------------------------------------------------------------

/**
 * The tour's convict reenactor, still in character: striped prison suit and cap, a stubble, a number on his chest,
 * and the ball and chain off his ankle, swung round his head as he runs you down (it's a real iron ball; the tour
 * went all out).
 */
const drawConvict = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = '#E0AC69', SUIT = '#F5F5F4', STRIPE = '#1C1917';
  // (the stripes, shaded with whatever they're on: lit down the left, in shadow down the right)
  const stripes = (x: number, y0: number, y1: number, w: number) => {
    for (let y = y0; y < y1; y += 6) { ctx.fillStyle = STRIPE; ctx.fillRect(x, y, w, 3); ctx.fillStyle = '#3F3A36'; ctx.fillRect(x, y, w * 0.3, 3); }
    ctx.fillStyle = 'rgba(26, 11, 6, 0.16)'; ctx.fillRect(x + w * 0.72, y0 - 6, w * 0.28, y1 - y0 + 12);
  };
  legs(ctx, -28, f * (running ? 1.6 : 0.6), running ? 7 : 1, SUIT, STRIPE, x => stripes(x, -26, -4, 7));
  const rot = running ? 0.22 : 0;
  ctx.save(); ctx.translate(0, -28); ctx.rotate(rot);
  // The suit: black and white stripes, the number
  body(ctx, -13, -32, 26, 32, SUIT, () => {
    stripes(-13, -30, 0, 26);
    ink(ctx, () => ctx.rect(-7, -24, 14, 7), '#F5F5F4', 0.7);
    ctx.fillStyle = STRIPE; ctx.font = 'bold 5px monospace'; ctx.fillText('1259', -6.6, -18.6);
    ctx.fillStyle = dark(SUIT, 0.3); ctx.beginPath(); ctx.moveTo(-3, -32); ctx.lineTo(1, -27); ctx.lineTo(5, -32); ctx.fill(); // the open collar
  });
  head(ctx, 2, -40, skin, 8, { brow: 'mad', mouth: running ? 'grin' : 'smirk' });
  // (a stubble, dithered over the jaw)
  ctx.save(); ctx.beginPath(); ctx.ellipse(2, -40, 8, 8.64, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'rgba(40, 30, 20, 0.5)';
  for (let j = 0; j < 5; j++) for (let x = -2 + (j % 2) * 0.7; x < 10; x += 1.4) { const y = -37.6 + j * 1.4; if (j > 1 || x < 1 || x > 8) ctx.fillRect(x, y, 0.7, 0.7); }
  ctx.restore();
  // The cap: a striped pillbox
  ink(ctx, () => ctx.roundRect(-7, -52, 17, 6.4, [2.4, 2.4, 0.6, 0.6]), SUIT, 0.9);
  ctx.fillStyle = STRIPE; ctx.fillRect(-6.5, -49.4, 16, 2.2);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4, -51.4, 6, 0.9);
  ctx.restore();
  // The arm up to the chain (from the shoulder, wherever the lean puts it)
  const sx = 5 * Math.cos(rot) + 26 * Math.sin(rot), sy = -28 + 5 * Math.sin(rot) - 26 * Math.cos(rot);
  const hx = 8, hy = -58;
  limb(ctx, sx, sy, 13, -51, 5.5, SUIT); limb(ctx, 13, -51, hx, hy, 5, SUIT);
  // The chain from his ankle up to his hand, the ball whirling round his head when he's running
  const a = running ? f * 0.35 : Math.PI * 0.75;
  const bx = hx + Math.cos(a) * 30, by = hy - 8 + Math.sin(a) * 16;
  const chain = () => { ctx.beginPath(); ctx.moveTo(4, -4); ctx.quadraticCurveTo(14, -30, hx, hy); ctx.lineTo(bx, by); };
  ink(ctx, () => ctx.roundRect(1, -7, 7, 3.6, 1), '#52525B', 0.8); // the shackle
  chain(); ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.stroke();
  chain(); ctx.setLineDash([2.4, 1.4]); ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.setLineDash([]);
  // (the ball: iron, the light on it in steps, a glint)
  ink(ctx, () => ctx.arc(bx, by, 9, 0, Math.PI * 2), '#1C1C20', 1.2);
  ctx.fillStyle = '#2E2E33'; ctx.beginPath(); ctx.arc(bx - 1.4, by - 1.4, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#45454D'; ctx.beginPath(); ctx.arc(bx - 2.6, by - 2.6, 4.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6B6B75'; ctx.beginPath(); ctx.arc(bx - 3.4, by - 3.4, 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(bx - 4.4, by - 4.6, 1.4, 1.4);
  ink(ctx, () => ctx.roundRect(hx - 3.4, hy - 3.4, 7, 7, 2), skin, 0.9); // the fist round the chain
  ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(hx - 2, hy, 4.6, 0.7);
};

/** A park ranger: the flat hat, gray shirt and green trousers, the arrowhead patch, a service pistol; glows before he fires. */
const drawParkRanger = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = '#C68642', SHIRT = '#A8A29E', HAT = '#A16207';
  legs(ctx, -26, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0, '#3F6212', '#44403C');
  body(ctx, -12, -54, 24, 30, SHIRT, () => {
    ctx.fillStyle = dark(SHIRT, 0.3); ctx.fillRect(-0.6, -52, 1.2, 26); // the placket, its buttons
    ctx.fillStyle = '#E7E5E4'; for (const y of [-47, -41, -35]) ctx.fillRect(1, y, 1.4, 1.4);
    ink(ctx, () => ctx.rect(3, -47, 6.4, 6.4), dark(SHIRT, 0.06), 0.6); // a pocket, its flap
    ink(ctx, () => ctx.roundRect(2.6, -48, 7.2, 2.6, [0, 0, 1.4, 1.4]), dark(SHIRT, 0.2), 0.6);
    // The arrowhead patch: the sequoia, the snowy peak
    ink(ctx, () => { ctx.moveTo(-11, -49); ctx.lineTo(-4, -49); ctx.lineTo(-4.6, -44); ctx.lineTo(-7.5, -40); ctx.lineTo(-10.4, -44); ctx.closePath(); }, '#854D0E', 0.7);
    ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(-9.4, -43); ctx.lineTo(-8.4, -47.6); ctx.lineTo(-7.4, -43); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-7.4, -45.4); ctx.lineTo(-6, -47.6); ctx.lineTo(-4.8, -45.4); ctx.fill();
    // The duty belt: the buckle, a pouch
    ink(ctx, () => ctx.rect(-12, -28, 24, 4), '#44403C', 0.8);
    ctx.fillStyle = lite('#44403C', 0.3); ctx.fillRect(-12, -27.4, 24, 0.8);
    ink(ctx, () => ctx.rect(-1.6, -28.4, 4, 4.8), '#CA8A04', 0.6);
    ink(ctx, () => ctx.roundRect(-11, -27, 5, 6, 1), '#292524', 0.7);
  });
  ink(ctx, () => { ctx.moveTo(4.4, -50.6); ctx.lineTo(8.6, -50.6); ctx.lineTo(8.6, -47.6); ctx.lineTo(6.5, -45.6); ctx.lineTo(4.4, -47.6); ctx.closePath(); }, '#FACC15', 0.7); // the badge
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(5.2, -49.8, 1.4, 1);
  head(ctx, 2, -64, skin, 8, { brow: 'flat', mouth: 'flat' });
  // The flat hat: the pinched crown, the band and its acorns, the wide brim
  const crown = () => { ctx.moveTo(-5, -71); ctx.lineTo(-3.4, -80); ctx.quadraticCurveTo(2, -86.5, 7.4, -80); ctx.lineTo(9, -71); ctx.closePath(); };
  shaded(ctx, crown, HAT, -5, -85, 14, 14);
  ctx.strokeStyle = dark(HAT, 0.35); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(0, -82); ctx.lineTo(0.6, -77); ctx.moveTo(4.4, -82); ctx.lineTo(3.8, -77); ctx.stroke();
  ink(ctx, () => ctx.rect(-4.6, -75, 13.2, 2.4), '#44403C', 0.7);
  ctx.fillStyle = '#CA8A04'; for (const x of [-2.6, 1.4, 5.4]) ctx.fillRect(x, -74.4, 1.2, 1.2);
  ink(ctx, () => ctx.ellipse(2, -71.6, 14.4, 2.4, 0, 0, Math.PI * 2), HAT, 1);
  ctx.fillStyle = lite(HAT, 0.3); ctx.fillRect(-9, -73.2, 12, 0.9);
  ctx.fillStyle = dark(HAT, 0.3); ctx.fillRect(-6, -70.4, 16, 0.8);
  gunArm(ctx, e, SHIRT, skin, true);
};

// ---------------------------------------------------------------------------
// The city
// ---------------------------------------------------------------------------

/** A fleece vest over a gingham shirt, chinos, AirPods, a company lanyard, a pistol; glows before he fires. */
const drawTechbro = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = '#F2C9A0', SHIRT = '#93C5FD', VEST = '#1F2937';
  legs(ctx, -26, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0, '#A8A29E', '#F8FAFC');
  // The gingham: white bands across, blue down
  body(ctx, -12, -54, 24, 30, SHIRT, () => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; for (let y = -53; y < -24; y += 4) ctx.fillRect(-12, y, 24, 1.6);
    ctx.fillStyle = 'rgba(30, 64, 175, 0.3)'; for (let x = -11; x < 12; x += 4) ctx.fillRect(x, -54, 1.6, 30);
  });
  // The vest: two quilted fleece panels, the zip, the logo on the chest
  for (const [x, r] of [[-13, [4, 1, 1, 1]], [4, [1, 4, 1, 1]]] as [number, number[]][]) {
    shaded(ctx, () => ctx.roundRect(x, -54, 9, 29, r), VEST, x, -54, 9, 29);
    ctx.fillStyle = lite(VEST, 0.12); for (let y = -48; y < -26; y += 6) ctx.fillRect(x + 1, y, 7, 0.8);
  }
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4.6, -53, 0.8, 27); ctx.fillRect(4, -53.6, 2, 2);
  ink(ctx, () => ctx.rect(-11.4, -49, 5, 3), '#E5E7EB', 0.6);
  ctx.fillStyle = '#3B82F6'; ctx.beginPath(); ctx.moveTo(-10.6, -46.6); ctx.lineTo(-9, -48.4); ctx.lineTo(-7.2, -46.6); ctx.fill();
  // The lanyard, his badge on it
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-3, -54); ctx.lineTo(1, -41); ctx.lineTo(5, -54);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.lineCap = 'butt';
  ink(ctx, () => ctx.roundRect(-1.4, -42, 6, 7.4, 0.8), '#F8FAFC', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-0.6, -40.6, 2.4, 2.6); ctx.fillStyle = '#6B7280'; ctx.fillRect(-0.6, -37.2, 4.4, 0.7);
  head(ctx, 2, -64, skin, 8, { mouth: 'smirk' });
  // The hair: short back and sides, the swoop up front
  hairCap(ctx, 2, -64, 8.5, '#78350F');
  ink(ctx, () => { ctx.moveTo(-3, -71); ctx.quadraticCurveTo(4, -77, 11, -74); ctx.quadraticCurveTo(12, -71.6, 9.6, -69.6); ctx.quadraticCurveTo(5, -71.6, -1, -69.4); ctx.closePath(); }, '#78350F', 0.9);
  ctx.fillStyle = lite('#78350F', 0.35); ctx.fillRect(2, -74, 5, 1);
  ink(ctx, () => ctx.roundRect(-5, -64.6, 2.6, 2.8, 1), '#FFFFFF', 0.6); // an AirPod
  ink(ctx, () => ctx.rect(-4.4, -62.2, 1.2, 3.2), '#FFFFFF', 0.5);
  gunArm(ctx, e, SHIRT, skin);
};

/** A bike courier: cycling cap, messenger bag, tights, and a U-lock he swings as he runs you down. */
const drawCourier = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  const skin = '#C68642', JERSEY = '#16A34A';
  legs(ctx, -28, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#111827', '#DC2626');
  ctx.save(); ctx.translate(0, -28); ctx.rotate(running ? 0.3 : 0);
  arm(ctx, -6, -24, -10 - (running ? Math.sin(f * 0.45) * 4 : 0), -8, dark(JERSEY, 0.2), skin, true, 5);
  // The jersey: the stripe round it, the zip
  body(ctx, -12, -30, 24, 30, JERSEY, () => {
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -22, 24, 3); ctx.fillStyle = '#FEF08A'; ctx.fillRect(-12, -22, 8, 1);
    ctx.fillStyle = INK; ctx.fillRect(-12, -22.6, 24, 0.6); ctx.fillRect(-12, -19, 24, 0.6);
    ctx.fillStyle = dark(JERSEY, 0.35); ctx.fillRect(3.6, -30, 0.8, 12);
    ctx.fillStyle = '#111827'; ctx.fillRect(-12, -3, 24, 3);
  });
  // The strap across his chest, the bag on his hip (its flap, a reflector)
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -30); ctx.lineTo(10, -4);
  ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.stroke(); ctx.strokeStyle = '#292524'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-3, -21.6, 2, 2.4); // the buckle
  shaded(ctx, () => ctx.roundRect(-20, -14, 14, 12, 2), '#44403C', -20, -14, 14, 12);
  ink(ctx, () => ctx.roundRect(-20.4, -14.4, 14.8, 6.4, [2, 2, 1.4, 1.4]), '#57534E', 0.8);
  ctx.fillStyle = lite('#57534E', 0.3); ctx.fillRect(-19, -13.4, 6, 0.9);
  ink(ctx, () => ctx.rect(-15.4, -10.4, 5, 2), '#F97316', 0.5);
  head(ctx, 2, -38, skin, 8, { brow: 'mad', mouth: running ? 'snarl' : 'flat' });
  // The cycling cap: white, the stripes over it, the short bill
  ink(ctx, () => { ctx.ellipse(1.5, -41.6, 8.8, 6, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, '#F8FAFC', 1);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-5.6, -45.6, 14.4, 1.6); ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-6.6, -43.6, 16.4, 0.9);
  ink(ctx, () => ctx.roundRect(8, -44, 7, 2.6, 1), '#E2E8F0', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2, -47, 5, 1);
  // The U-lock, swinging: the steel shackle, the rubbered crossbar, the fist round it
  const sw = running ? Math.sin(f * 0.45) * 0.6 : 0;
  ctx.save(); ctx.translate(10, -22); ctx.rotate(-0.8 + sw);
  arm(ctx, -2, -5, 6.5, 0, JERSEY, skin, true, 5);
  const shackle = () => { ctx.beginPath(); ctx.moveTo(6, -7); ctx.lineTo(22, -7); ctx.arc(22, 0, 7, -Math.PI / 2, Math.PI / 2); ctx.lineTo(6, 7); };
  ctx.lineCap = 'round';
  shackle(); ctx.strokeStyle = INK; ctx.lineWidth = 5.4; ctx.stroke();
  shackle(); ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 3.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7, -7.8); ctx.lineTo(22, -7.8); ctx.arc(22, 0, 7.8, -Math.PI / 2, -0.2); ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.stroke();
  ctx.lineCap = 'butt';
  shaded(ctx, () => ctx.roundRect(3.5, -10, 6, 20, 2), '#FACC15', 3.5, -10, 6, 20);
  ink(ctx, () => ctx.rect(5.6, 5.4, 1.8, 2), '#374151', 0.5); // the keyhole
  ink(ctx, () => ctx.roundRect(2.6, -3.4, 7.4, 6.4, 2), skin, 0.9);
  ctx.fillStyle = dark(skin, 0.2); ctx.fillRect(4, -0.6, 4.6, 0.7); ctx.fillRect(4, 1.2, 4.6, 0.7);
  ctx.restore();
  ctx.restore();
};

/** A protester: tie-dye, beanie, beard; a big cardboard sign as his shield. He drops it to lob a (reusable) water bottle. */
const SIGNS = ['NO!', 'EAT THE RICH', 'RENT IS THEFT', 'SAVE THE BAY', 'HONK'];
const drawProtester = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = '#E0AC69', TIE = '#F472B6', CARD = '#D6B98C';
  // (the sign, put down behind him)
  if (!e.isShieldActive) {
    shaded(ctx, () => ctx.rect(-28, -40, 12, 36), CARD, -28, -40, 12, 36);
    ctx.fillStyle = dark(CARD, 0.2); for (let y = -37; y < -6; y += 3) ctx.fillRect(-27, y, 10, 0.6);
  }
  legs(ctx, -24, f, 0, '#3F6212', '#78350F');
  // The tie-dye: rings of colour out from two spirals; a peace button
  body(ctx, -13, -54, 26, 32, TIE, () => {
    for (const [r, c] of [[12, '#C084FC'], [9.4, '#FACC15'], [6.6, '#FB923C'], [4, '#FEF08A'], [1.8, TIE]] as [number, string][]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(-2, -40, r, 0, Math.PI * 2); ctx.fill(); }
    for (const [r, c] of [[6.4, '#22D3EE'], [4, '#A5F3FC'], [1.8, '#0EA5E9']] as [number, string][]) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(5, -31, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'; ctx.fillRect(-13, -54, 8, 32);
    ctx.fillStyle = 'rgba(26, 11, 6, 0.2)'; ctx.fillRect(5.7, -54, 7.3, 32); ctx.fillRect(-13, -27.8, 26, 6);
  });
  ink(ctx, () => ctx.arc(7, -48, 2.4, 0, Math.PI * 2), '#F8FAFC', 0.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(7, -50); ctx.lineTo(7, -46); ctx.moveTo(7, -48); ctx.lineTo(5.6, -46.6); ctx.moveTo(7, -48); ctx.lineTo(8.4, -46.6); ctx.stroke();
  head(ctx, 2, -62, skin, 8, { mouth: 'none' });
  // The beard: bushy, ragged at the bottom, the mouth shouting out of it
  const BEARD = '#7C2D12';
  ink(ctx, () => { ctx.moveTo(-4, -61); ctx.quadraticCurveTo(-3, -57, -1, -54); ctx.lineTo(1, -52); ctx.lineTo(3, -53.6); ctx.lineTo(5, -51.4); ctx.lineTo(7, -53.4); ctx.lineTo(9.6, -52.6); ctx.quadraticCurveTo(11.6, -56, 10.6, -59.4); ctx.lineTo(8.4, -59); ctx.quadraticCurveTo(5, -60.4, 2, -58.6); ctx.lineTo(0, -61.6); ctx.closePath(); }, BEARD, 0.9);
  ctx.fillStyle = lite(BEARD, 0.25); ctx.fillRect(1, -57, 1, 3); ctx.fillRect(4, -56.4, 1, 3); ctx.fillRect(7.6, -57, 1, 3);
  ink(ctx, () => ctx.ellipse(6, -56.6, 2, 1.5, 0, 0, Math.PI * 2), '#450A0A', 0.6);
  // The beanie: the knit dome, the ribbed cuff
  ink(ctx, () => { ctx.ellipse(2, -68, 10, 9.6, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, '#B91C1C', 1);
  ctx.fillStyle = lite('#B91C1C', 0.3); ctx.fillRect(-3, -76, 6, 1.2);
  ink(ctx, () => ctx.roundRect(-8.6, -70.6, 21, 4.6, 1.4), dark('#B91C1C', 0.12), 0.9);
  ctx.fillStyle = dark('#B91C1C', 0.4); for (let x = -6.6; x < 12; x += 2.2) ctx.fillRect(x, -70, 0.7, 3.4);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The sign on its stick (taped on), held out in front
    shaded(ctx, () => ctx.rect(16, -40, 4, 40), '#92400E', 16, -40, 4, 40);
    arm(ctx, 6, -50, 18, -30, TIE, skin);
    shaded(ctx, () => ctx.rect(8, -80, 22, 46), CARD, 8, -80, 22, 46, 1.4);
    ctx.fillStyle = dark(CARD, 0.18); for (let x = 9.4; x < 29; x += 2.4) ctx.fillRect(x, -79.4, 0.7, 1.6); // the corrugation at its edge
    ctx.fillStyle = 'rgba(203, 213, 225, 0.85)'; ctx.fillRect(15, -38, 6, 3.4); // the tape
    ctx.save(); ctx.translate(19, -57); ctx.rotate(-Math.PI / 2);
    // (the lettering reads the right way round whichever way he's facing)
    const t = ctx.getTransform(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(1, -1);
    ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center';
    ctx.fillText(SIGNS[Math.abs(Math.round(e.homeX || 0)) % SIGNS.length], 0, 2, 44);
    ctx.restore();
    // Torn up as it takes hits: holes, the cardboard's insides showing round them
    for (let i = 0; i < Math.floor(damage * 5); i++) {
      const tx = 10 + ((i * 7) % 16), ty = -76 + i * 9;
      ink(ctx, () => { ctx.moveTo(tx, ty); ctx.lineTo(tx + 2.4, ty - 0.8); ctx.lineTo(tx + 4.6, ty + 0.6); ctx.lineTo(tx + 3.6, ty + 3.4); ctx.lineTo(tx + 0.6, ty + 3); ctx.closePath(); }, '#2A1D14', 0.6);
      ctx.fillStyle = '#EBD9B4'; ctx.fillRect(tx + 0.4, ty - 1.2, 2, 0.7); ctx.fillRect(tx + 3.8, ty + 3.4, 1.4, 0.7);
    }
  } else {
    arm(ctx, 6, -50, 9, -32, TIE, skin);
    // The wind-up behind his head with the bottle: steel, the screw cap and its loop
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    const bx = -4 - wind * 12, by = -64;
    arm(ctx, -1, -50, bx + 0.6, by + 8, TIE, skin);
    shaded(ctx, () => ctx.roundRect(bx - 3, by, 6, 12, 1.6), '#0EA5E9', bx - 3, by, 6, 12);
    ctx.fillStyle = '#E0F2FE'; ctx.fillRect(bx - 2, by + 1.4, 1, 8);
    ink(ctx, () => ctx.roundRect(bx - 2.4, by - 3, 4.8, 3.2, 0.8), '#334155', 0.7);
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(bx, by - 4, 1.6, Math.PI, 0); ctx.stroke();
    ink(ctx, () => ctx.ellipse(bx + 0.6, by + 7.4, 3, 2.4, 0, 0, Math.PI * 2), skin, 0.7);
  }
};

/** A raccoon: bandit mask, ringed tail, into the trash and into your ankles. */
const drawRaccoon = (ctx: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, lunging = st === 'lunge';
  const cycle = Math.abs(e.vel.x) > 0.3 ? f * (lunging ? 0.55 : 0.25) : 0;
  if (st === 'bristle') ctx.translate(f % 4 < 2 ? 1 : -1, 0);
  const fur = '#7C7F86', furD = '#4B4F57', pale = '#D6D3D1', mask = '#16181D';
  const crouch = st === 'bristle' ? 2 : 0;
  // A leg: the furry upper, the dark forearm, the little black hand with its fingers
  const leg = (i: number) => {
    const back = i % 2 === 1, c = back ? furD : '#62666E';
    const lx = (i < 2 ? 11 : -11) + (back ? 3 : -2);
    const swing = Math.sin(cycle + i * 1.6) * (lunging ? 5 : 3);
    const kx = lx + swing * 0.3, fx = lx + swing * 0.6;
    limb(ctx, lx, -11 + crouch, kx, -5 + crouch * 0.5, 5, c);
    limb(ctx, kx, -5 + crouch * 0.5, fx, -2, 3.6, back ? '#111317' : '#26292F');
    ink(ctx, () => ctx.ellipse(fx + 1, -1.3, 2.8, 1.4, 0, 0, Math.PI * 2), back ? '#111317' : '#26292F', 0.8);
    ctx.fillStyle = '#4B5563'; ctx.fillRect(fx + 2.2, -1.8, 1, 0.7); ctx.fillRect(fx + 2.6, -0.9, 1, 0.7);
  };
  leg(1); leg(3);
  // The tail: bushy, ringed, lit along the top, swishing
  ctx.save(); ctx.translate(-16, -15 + crouch); ctx.rotate(0.12 + Math.sin(f * 0.2) * 0.12 - (st === 'bristle' ? 0.4 : 0));
  const tail = () => { ctx.moveTo(0, -4); ctx.quadraticCurveTo(-14, -7, -24, -3); ctx.quadraticCurveTo(-28, 0, -24, 3.5); ctx.quadraticCurveTo(-12, 5, 0, 4); ctx.closePath(); };
  ctx.save(); ctx.beginPath(); tail(); ctx.clip();
  ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-30, -8, 32, 16);
  ctx.fillStyle = mask; for (let k = 0; k < 4; k++) ctx.fillRect(-7 - k * 5.4, -8, 2.8, 16);
  ctx.fillStyle = mask; ctx.fillRect(-30, -8, 4.6, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'; ctx.fillRect(-30, -8, 32, 3.4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'; ctx.fillRect(-30, 1.6, 32, 6);
  ctx.restore();
  ctx.beginPath(); tail(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
  // Hackles up
  if (st === 'bristle' || lunging) for (let i = -12; i < 8; i += 4.5) ink(ctx, () => { ctx.moveTo(i, -20 + crouch + Math.abs(i) * 0.12); ctx.lineTo(i + 2.2, -26 + crouch + Math.abs(i) * 0.12); ctx.lineTo(i + 4.4, -20 + crouch + Math.abs(i) * 0.12); ctx.closePath(); }, furD, 0.8);
  // The body: grizzled grey, a hunch to it, lit along the back, the belly pale and in shadow; the fur ticked in
  const body = () => { for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 2, s = Math.sin(a); const r = s > 0 && k % 2 ? 0.93 : 1; ctx.lineTo(Math.cos(a) * 18 * r, -14 + crouch * 0.5 + s * 9 * r - (s < 0 ? Math.cos(a) * -1.5 : 0)); } ctx.closePath(); };
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = fur; ctx.fillRect(-19, -25, 38, 22);
  ctx.fillStyle = lite(fur, 0.2); ctx.fillRect(-19, -25, 38, 5);
  ctx.fillStyle = dark(fur, 0.28); ctx.fillRect(-19, -10 + crouch, 38, 6);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(-12, -7.6 + crouch, 26, 2);
  ctx.fillStyle = dark(fur, 0.4); for (let x = -14; x < 14; x += 5) ctx.fillRect(x, -18 + (x % 2 ? 2 : 0) + crouch, 1, 2.4);
  ctx.fillStyle = lite(fur, 0.4); for (let x = -12; x < 14; x += 6) ctx.fillRect(x, -21 + crouch, 2, 1);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
  leg(0); leg(2);
  // The head: round ears with pale rims, the pale face, the bandit mask with the eye shining in it, the pointed
  // muzzle, the black nose; snarling on the lunge
  const hx = 18, hy = -16 + crouch;
  for (const [ex, ey] of [[hx - 6, hy - 6], [hx - 1, hy - 7.5]]) { ink(ctx, () => ctx.arc(ex, ey, 2.8, 0, Math.PI * 2), pale, 0.8); ctx.fillStyle = furD; ctx.beginPath(); ctx.arc(ex + 0.3, ey + 0.4, 1.5, 0, Math.PI * 2); ctx.fill(); }
  shaded(ctx, () => ctx.ellipse(hx, hy, 8.4, 6.6, 0.05, 0, Math.PI * 2), '#9CA3AF', hx - 9, hy - 7, 18, 14);
  const gape = lunging ? 2.6 : st === 'bristle' ? 1.2 : 0;
  // (the lower jaw)
  ink(ctx, () => { ctx.moveTo(hx + 3, hy + 2.6); ctx.lineTo(hx + 10, hy + 2.4 + gape); ctx.lineTo(hx + 9, hy + 4.4 + gape); ctx.quadraticCurveTo(hx + 5, hy + 5.4, hx + 2.6, hy + 4.4); ctx.closePath(); }, pale, 0.8);
  if (gape) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx + 4, hy + 2.6, 5, gape * 0.7); }
  ink(ctx, () => { ctx.moveTo(hx + 1, hy - 2.4); ctx.quadraticCurveTo(hx + 8, hy - 2.6, hx + 12, hy + 0.4); ctx.lineTo(hx + 11.4, hy + 2.2); ctx.quadraticCurveTo(hx + 6, hy + 3.4, hx + 1, hy + 3); ctx.closePath(); }, '#E7E5E4', 0.8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 3, hy - 2, 4, 0.9);
  // (the white brow over the mask, the mask across both eyes)
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(hx - 2, hy - 5, 8, 1.4);
  ink(ctx, () => { ctx.moveTo(hx - 7, hy - 1); ctx.quadraticCurveTo(hx - 2, hy - 5, hx + 3, hy - 3.6); ctx.quadraticCurveTo(hx + 6, hy - 4.4, hx + 8.4, hy - 1.6); ctx.quadraticCurveTo(hx + 6, hy + 0.6, hx + 2.6, hy - 0.4); ctx.quadraticCurveTo(hx - 2, hy + 2, hx - 7, hy - 1); ctx.closePath(); }, mask, 0.7);
  ink(ctx, () => ctx.arc(hx + 4.2, hy - 2, 1.4, 0, Math.PI * 2), '#1F2937', 0.5);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx + 3.6, hy - 2.8, 0.9, 0.9);
  ink(ctx, () => ctx.ellipse(hx + 11.6, hy + 0.6, 1.8, 1.4, 0, 0, Math.PI * 2), '#111111', 0.6);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(hx + 11, hy - 0.4, 1, 0.7);
  if (gape) {
    ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = INK; ctx.lineWidth = 0.5;
    for (const tx of [hx + 6.5, hx + 9]) { ctx.beginPath(); ctx.moveTo(tx - 0.8, hy + 2.4); ctx.lineTo(tx, hy + 2.4 + gape * 0.9); ctx.lineTo(tx + 0.8, hy + 2.4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(hx + 2, hy - 4.6); ctx.lineTo(hx + 6, hy - 3.4); ctx.stroke();
  }
};

/** A seagull: white, grey wings, a yellow beak with a red spot, a mean little eye. */
const drawSeagull = (ctx: Ctx, e: Enemy, f: number) => {
  const swoop = e.aiState === 'swoop';
  const flap = swoop ? Math.sin(f * 0.15) * 3 : Math.sin(f * 0.3) * 9;
  const gull = '#A3ADB8';
  // A wing from the shoulder: the grey mantle (lit along the leading edge), the black tip with its white spots
  const wing = (sx: number, lift: number, span: number, c: string) => {
    const tx = sx - span, ty = -20 - lift;
    const path = () => { ctx.moveTo(sx + 3, -12.5); ctx.quadraticCurveTo(sx - span * 0.4, -16 - lift * 0.7, tx, ty); ctx.lineTo(tx + 2, ty + 4); ctx.quadraticCurveTo(sx - span * 0.45, -8 - lift * 0.4, sx - 4, -8); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); path(); ctx.clip();
    ctx.fillStyle = c; ctx.fillRect(tx - 4, -40, span + 10, 36);
    ctx.fillStyle = dark(c, 0.2); ctx.beginPath(); ctx.moveTo(sx - 4, -8); ctx.quadraticCurveTo(sx - span * 0.45, -8 - lift * 0.4, tx + 2, ty + 4); ctx.lineTo(tx + 6, ty + 5); ctx.quadraticCurveTo(sx - span * 0.45, -10.5 - lift * 0.45, sx - 4, -10.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lite(c, 0.3); ctx.beginPath(); ctx.moveTo(sx + 3, -13.5); ctx.quadraticCurveTo(sx - span * 0.4, -17 - lift * 0.7, tx, ty - 1); ctx.lineTo(tx + 1, ty + 0.6); ctx.quadraticCurveTo(sx - span * 0.4, -15 - lift * 0.65, sx + 2, -11.6); ctx.closePath(); ctx.fill();
    // (the black tip, its white mirrors)
    ctx.fillStyle = '#18181B'; ctx.beginPath(); ctx.arc(tx, ty, span * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(tx + span * 0.16, ty + 1 + lift * 0.1, 1.4, 1.2); ctx.fillRect(tx + 1.6, ty + 0.6, 1.2, 1);
    ctx.restore();
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.lineJoin = 'round'; ctx.stroke();
  };
  wing(-2, flap, 20, dark(gull, 0.15));
  // The tail: white, the black band across its end
  ink(ctx, () => { ctx.moveTo(-12, -13); ctx.lineTo(-22, -14); ctx.lineTo(-22, -8.5); ctx.lineTo(-12, -9); ctx.closePath(); }, '#F1F5F9', 0.9);
  ctx.fillStyle = '#18181B'; ctx.fillRect(-21.5, -13.6, 3, 4.8);
  // The feet, tucked up (pink)
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-5, -4); ctx.moveTo(1, -6); ctx.lineTo(-2, -4); ctx.stroke();
  ctx.strokeStyle = '#F9A8D4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-5, -4); ctx.moveTo(1, -6); ctx.lineTo(-2, -4); ctx.stroke();
  // The body: white, the back grey, the belly in shadow
  const body = () => ctx.ellipse(0, -11, 15, 6, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-15, -17, 30, 12);
  ctx.fillStyle = gull; ctx.fillRect(-15, -17, 22, 3.6);
  ctx.fillStyle = lite(gull, 0.3); ctx.fillRect(-8, -16.6, 8, 1);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-15, -8, 30, 3);
  ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-15, -9.6, 30, 1.6);
  ctx.restore();
  ctx.beginPath(); body(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The head: the yellow beak (hooked, the red spot on the lower bill; gaping on the swoop), the pale mean eye with
  // its red ring, the scowl
  const gape = swoop ? 2 : 0;
  ink(ctx, () => { ctx.moveTo(16.5, -12.6); ctx.lineTo(24, -12.4 + gape); ctx.lineTo(23, -10.6 + gape); ctx.lineTo(16.5, -11); ctx.closePath(); }, '#EAB308', 0.7);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(21, -11.8 + gape, 1.8, 1.2);
  shaded(ctx, () => ctx.arc(13, -14, 5, 0, Math.PI * 2), '#F8FAFC', 8, -19, 10, 10, 1);
  ink(ctx, () => { ctx.moveTo(16.5, -15.6); ctx.lineTo(23.6, -14.4); ctx.quadraticCurveTo(25.6, -13.8, 25, -11.8); ctx.lineTo(24, -12.6); ctx.lineTo(16.5, -12.6); ctx.closePath(); }, '#FACC15', 0.8);
  ctx.fillStyle = '#FEF08A'; ctx.fillRect(18, -15, 3.6, 0.8);
  ink(ctx, () => ctx.arc(14.6, -15.4, 1.5, 0, Math.PI * 2), '#FEF9C3', 0.6);
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(14.6, -15.4, 1.9, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(14.8, -15.8, 0.9, 0.9);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(12.4, -17.6); ctx.lineTo(16.6, -16.4); ctx.stroke();
  wing(1, -flap, 22, gull);
};

/** A quadcopter: four rotors blurring, a camera pod, a blinking light; a red laser dot on you before it fires. */
const drawDrone = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  const tilt = Math.max(-0.35, Math.min(0.35, e.vel.x * 0.06)) * (e.facing === -1 ? -1 : 1);
  ctx.save(); ctx.translate(0, -15); ctx.rotate(tilt);
  // (a good size, inked and in safety orange, with lights blinking: easy to pick out against the sky)
  ctx.scale(1.35, 1.35);
  const ORANGE = '#F97316', ARM = '#374151', blink = Math.floor(f / 8) % 2;
  // A rotor on an arm's end: the motor drum, the prop's blur seen edge-on (banded), a blade catching the light
  const rotor = (rx: number, ry: number, far: boolean) => {
    if (far) ink(ctx, () => ctx.rect(rx - 1, ry - 7.6, 2, 6), '#111827', 0.6);
    else {
      shadedTop(ctx, () => ctx.roundRect(rx - 2.8, ry - 5.6, 5.6, 5, 1), '#1F2937', rx - 2.8, ry - 5.6, 5.6, 5, 0.8);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(rx - 2, ry - 4.4, 4, 0.7);
      ink(ctx, () => ctx.rect(rx - 0.8, ry - 7.6, 1.6, 2), '#6B7280', 0.5);
    }
    ctx.fillStyle = far ? 'rgba(203, 213, 225, 0.22)' : 'rgba(226, 232, 240, 0.3)'; ctx.beginPath(); ctx.ellipse(rx, ry - 8, 12, 1.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = far ? 'rgba(226, 232, 240, 0.3)' : 'rgba(241, 245, 249, 0.5)'; ctx.beginPath(); ctx.ellipse(rx, ry - 8, 7.4, 1.1, 0, 0, Math.PI * 2); ctx.fill();
    const w = 12 * Math.abs(Math.cos(f * 1.3 + rx));
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(rx - w, ry - 8); ctx.lineTo(rx + w, ry - 8);
    ctx.strokeStyle = INK; ctx.lineWidth = 2.2; ctx.stroke(); ctx.strokeStyle = far ? '#94A3B8' : '#E2E8F0'; ctx.lineWidth = 1; ctx.stroke(); ctx.lineCap = 'butt';
  };
  // The far pair, behind it (a touch higher, in shadow)
  shadedTop(ctx, () => ctx.rect(-14, -4.6, 28, 2.4), dark(ARM, 0.3), -14, -4.6, 28, 2.4, 0.8);
  rotor(-14, -3, true); rotor(14, -3, true);
  // The near arms, lit along the top, a light blinking under each motor (green to port, red to starboard)
  shadedTop(ctx, () => ctx.roundRect(-19, -2, 38, 4, 1.4), ARM, -19, -2, 38, 4, 1);
  for (const rx of [-19, 19]) {
    rotor(rx, -1, false);
    const c = rx < 0 ? '74, 222, 128' : '248, 113, 113';
    if (blink) { ctx.fillStyle = `rgba(${c}, 0.45)`; ctx.beginPath(); ctx.arc(rx, 0, 2.6, 0, Math.PI * 2); ctx.fill(); }
    ink(ctx, () => ctx.rect(rx - 1, -1, 2, 2), blink ? `rgb(${c})` : '#1F2937', 0.5);
  }
  // The body: the orange shell lit across the top, the canopy, a seam, the vents, the sensor up front
  shadedTop(ctx, () => ctx.roundRect(-10, -7, 20, 12, 3), ORANGE, -10, -7, 20, 12, 1.2);
  ink(ctx, () => ctx.roundRect(-7, -9, 14, 3.4, [2, 2, 0, 0]), lite(ORANGE, 0.3), 0.9);
  ctx.fillStyle = lite(ORANGE, 0.6); ctx.fillRect(-5, -8.2, 6, 0.8);
  ctx.fillStyle = dark(ORANGE, 0.4); ctx.fillRect(-9, -0.2, 18, 0.8);
  ctx.fillStyle = INK; for (let x = -7; x < -1; x += 2) ctx.fillRect(x, 1.6, 1, 2);
  ink(ctx, () => ctx.roundRect(5.4, -4.8, 3.6, 3, 1), '#0F172A', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(6, -4.2, 1.2, 0.8);
  // (the light on top)
  if (blink) { ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; ctx.beginPath(); ctx.arc(0, -10, 3.4, 0, Math.PI * 2); ctx.fill(); }
  ink(ctx, () => ctx.roundRect(-1.6, -11.4, 3.2, 2.6, [1.2, 1.2, 0, 0]), blink ? '#EF4444' : '#7F1D1D', 0.6);
  if (blink) { ctx.fillStyle = '#FECACA'; ctx.fillRect(-0.8, -10.8, 1, 0.8); }
  // The camera, slung under the nose on its gimbal: the lens (red when it's got him)
  ink(ctx, () => ctx.rect(2.6, 3.6, 3, 2.4), '#111827', 0.6);
  shaded(ctx, () => ctx.arc(4, 7, 4.5, 0, Math.PI * 2), '#1F2937', -0.5, 2.5, 9, 9, 1);
  const aiming = e.aiState === 'aim';
  ink(ctx, () => ctx.arc(6.2, 7.2, 2.2, 0, Math.PI * 2), '#0F172A', 0.6);
  ctx.fillStyle = aiming ? '#EF4444' : '#2563EB'; ctx.beginPath(); ctx.arc(6.4, 7.2, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(5.6, 6.2, 0.8, 0.8);
  ctx.restore();
  // Aiming: a red line down to a dot on him
  if (aiming) {
    const p = state.player;
    const dir = e.facing === -1 ? -1 : 1;
    const tx = (p.pos.x + p.width / 2 - (e.pos.x + e.width / 2)) * dir, ty = p.pos.y + p.height / 2 - (e.pos.y + e.height);
    const k = Math.min(1, (e.aiTimer || 0) / DRONE_AIM);
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + k * 0.6})`; ctx.lineWidth = 1 + k;
    ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(tx, ty, 3 + k * 2, 0, Math.PI * 2); ctx.fill();
  }
};

/** A goon in a wetsuit and aviators on a red jet ski, a pistol in one hand. Leaning in when he goes to ram you, sat back on the brakes. */
const drawJetskier = (ctx: Ctx, e: Enemy, f: number) => {
  if (e.aiState === 'ram') ctx.rotate(-0.08);
  if (e.aiState === 'brake') ctx.rotate(0.12);
  const RED = '#DC2626', SUIT = '#1E3A8A', skin = '#E0AC69';
  // The hull: white glassfibre below the rub rail (grimy at the waterline, a stripe down it), the jet nozzle astern
  ink(ctx, () => ctx.roundRect(-39, -9.6, 4, 4, 1), '#27272A', 0.8);
  const hull = () => { ctx.moveTo(-36, -11); ctx.lineTo(-35, -4); ctx.lineTo(26, -4); ctx.quadraticCurveTo(34, -5, 39, -14); ctx.closePath(); };
  shadedTop(ctx, hull, '#F1F5F9', -36, -14, 76, 10, 1.1);
  ctx.save(); ctx.beginPath(); hull(); ctx.clip();
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(-36, -5.6, 76, 1.6);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-26, -8.4); ctx.lineTo(24, -10.2); ctx.lineTo(22, -8.6); ctx.lineTo(-26, -7.2); ctx.fill();
  ctx.restore();
  // The deck: red, lit along the top, the seat well, the hood rising to the bars
  const deck = () => { ctx.moveTo(-36, -11); ctx.lineTo(-33, -17); ctx.lineTo(-4, -18.4); ctx.lineTo(6, -21); ctx.lineTo(20, -20); ctx.quadraticCurveTo(32, -18, 39, -14); ctx.closePath(); };
  shadedTop(ctx, deck, RED, -36, -21, 76, 10, 1.1);
  ctx.fillStyle = lite(RED, 0.4); ctx.fillRect(8, -19.6, 12, 0.9); ctx.fillRect(-30, -16, 10, 0.9);
  // (the rub rail, the bumper on the bow)
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-36, -11); ctx.lineTo(39, -14);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.stroke(); ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 1.1; ctx.stroke(); ctx.lineCap = 'butt';
  ink(ctx, () => ctx.roundRect(36.4, -15.6, 4.2, 3.6, 1.4), '#27272A', 0.7);
  // The seat: black, padded, the stitching, the grab strap
  ink(ctx, () => ctx.roundRect(-31, -22, 27, 5, [2.6, 2.6, 1, 1]), '#1F2937', 1);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(-29, -21.2, 22, 1);
  ctx.fillStyle = '#111827'; ctx.fillRect(-19, -21.6, 0.8, 4);
  // The bars: the steering column, the windshield, the bars and their grip
  shaded(ctx, () => { ctx.moveTo(8, -20); ctx.lineTo(9.6, -31); ctx.lineTo(12.4, -31); ctx.lineTo(13, -20); ctx.closePath(); }, '#27272A', 8, -31, 5, 11, 0.8);
  ink(ctx, () => { ctx.moveTo(13, -21); ctx.lineTo(16, -30); ctx.lineTo(19, -29); ctx.lineTo(19, -20.4); ctx.closePath(); }, 'rgba(147, 197, 253, 0.6)', 0.8);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; ctx.fillRect(16, -27.6, 1, 4);
  ink(ctx, () => ctx.roundRect(6, -33, 14, 2.8, 1), '#374151', 0.8);
  // The rider, sat astride: the back arm out to the grip, the wetsuit (its stripe), the leg over the seat
  arm(ctx, -4, -43, 15, -31.6, dark(SUIT, 0.25), skin, false, 5);
  body(ctx, -12, -46, 18, 24, SUIT, () => {
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-12, -40, 18, 2.4); ctx.fillStyle = '#FEF08A'; ctx.fillRect(-12, -40, 6, 0.8);
    ctx.fillStyle = INK; ctx.fillRect(-12, -40.6, 18, 0.6); ctx.fillRect(-12, -37.6, 18, 0.6);
    ctx.fillStyle = dark(SUIT, 0.4); ctx.fillRect(-8, -46, 0.8, 22);
  });
  limb(ctx, -6, -24, 6, -23, 7, dark(SUIT, 0.1));
  limb(ctx, 6, -23, 3, -15, 6, dark(SUIT, 0.1));
  ink(ctx, () => ctx.roundRect(1, -16, 8, 3.6, [1, 2, 1, 1]), '#111827', 0.8); // the bootie
  // The head: slicked back, the aviators (gold frames, the lenses banded)
  head(ctx, -2, -52, skin, 7, { eyes: false, mouth: 'smirk' });
  hairCap(ctx, -2, -52, 7.4, '#1C1917');
  for (const lx of [0.2, 4.8]) {
    ink(ctx, () => { ctx.moveTo(lx, -55.4); ctx.lineTo(lx + 4, -55.4); ctx.quadraticCurveTo(lx + 4.2, -51.4, lx + 2.2, -51.6); ctx.quadraticCurveTo(lx, -52, lx, -55.4); ctx.closePath(); }, '#1F2937', 0.7);
    ctx.fillStyle = '#4B5563'; ctx.fillRect(lx + 0.6, -53.8, 3, 1.2); ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(lx + 0.8, -54.8, 1.4, 0.7);
  }
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(-1.6, -55.6, 11, 0.8);
  // The gun hand
  arm(ctx, 2, -42, 14, -39, SUIT, skin, false, 5);
  pistol(ctx, 14, -40, 0, '#18181B');
  ink(ctx, () => ctx.roundRect(12.4, -40.4, 4.8, 4.4, 1.6), skin, 0.8);
  // Spray off the bow
  for (let i = 0; i < 3; i++) {
    const sy = -8 - ((f * 3 + i * 5) % 10);
    ctx.fillStyle = '#7DD3FC'; ctx.fillRect(36 + i * 4, sy + 1, 2.4, 2.4);
    ctx.fillStyle = '#F0F9FF'; ctx.fillRect(36 + i * 4, sy, 2, 2);
  }
};

/** Somebody on fire: charred black in the flames, embers glowing in the cracks, arms flailing over their head. */
const drawBurning = (ctx: Ctx, e: Enemy, f: number) => {
  const run = Math.abs(e.vel.x) > 0.5 ? Math.sin(f * 0.5) * 6 : 0;
  const CHAR = '#292524';
  // An arm from the shoulder, flailing: the charred limb, the splayed hand
  const flail = (sx: number, a: number) => {
    const hx = sx + Math.cos(a) * 18, hy = -54 + Math.sin(a) * 18;
    limb(ctx, sx, -54, hx, hy, 5, CHAR);
    ink(ctx, () => ctx.arc(hx, hy, 2.8, 0, Math.PI * 2), CHAR, 0.8);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const d of [-0.6, 0, 0.6]) { ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a + d) * 5, hy + Math.sin(a + d) * 5); }
    ctx.stroke();
  };
  flail(-9, -2.4 + Math.sin(f * 0.7) * 0.5);
  // The legs, running blind; the shoes
  for (const x of [-5 + run * 0.5, 5 - run * 0.5]) {
    limb(ctx, x, -27, x, -4, 6, CHAR);
    ink(ctx, () => ctx.roundRect(x - 4, -5, 9, 5, [2, 2.6, 1, 1]), '#1C1917', 0.9);
  }
  // The body: what's left of the clothes, black, the embers glowing in the cracks
  body(ctx, -11, -56, 22, 30, CHAR, () => {
    ctx.fillStyle = '#7C2D12'; ctx.fillRect(-6, -48, 1.4, 6); ctx.fillRect(3, -40, 5, 1.4); ctx.fillRect(-2, -33, 1.4, 5);
    const hot = f % 10 < 5;
    ctx.fillStyle = hot ? '#FDBA74' : '#F97316'; ctx.fillRect(-5.6, -46, 0.7, 3); ctx.fillRect(4, -39.6, 3, 0.7); ctx.fillRect(-1.6, -31.6, 0.7, 2.4);
    ctx.fillStyle = INK; ctx.fillRect(-11, -29, 22, 1); for (let x = -10; x < 11; x += 4) ctx.fillRect(x, -28, 2, 2); // the hem, burnt ragged
  });
  // The head: charred, the eyes wide, the mouth open, screaming
  head(ctx, 1, -64, CHAR, 8, { brow: 'up', mouth: 'none' });
  ink(ctx, () => ctx.ellipse(5, -60, 2.5, 3, 0, 0, Math.PI * 2), '#450A0A', 0.7);
  ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.ellipse(5, -59.4, 1.2, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  flail(9, -0.7 + Math.sin(f * 0.8 + 1) * 0.5);
  // The flames all over them: up off their middle, and up off their shoulders and head
  const seed = Math.abs(Math.round(e.homeX || 0));
  drawFlameLicks(ctx, 0, -12, 30, 62, f, { seed, n: 5 });
};
