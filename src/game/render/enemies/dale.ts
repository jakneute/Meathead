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

const JEANS = '#1E3A8A', BOOT = '#5B3417', BOOT_TOE = '#3F2410', SKIN = '#B07A4F', SKIN_DARK = '#8C5A36';

/** Jeans and pointed cowboy boots. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, pants = JEANS) => {
  const s = Math.sin(f * 0.25) * stride;
  ctx.fillStyle = pants; ctx.fillRect(-8 + s, hipY, 7, -hipY - 7); ctx.fillRect(2 - s, hipY, 7, -hipY - 7);
  ctx.fillStyle = BOOT;
  ctx.fillRect(-9 + s, -8, 9, 8); ctx.fillRect(1 - s, -8, 9, 8);
  ctx.fillStyle = BOOT_TOE;
  ctx.beginPath(); ctx.moveTo(0 + s, -5); ctx.lineTo(4 + s, -1); ctx.lineTo(0 + s, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10 - s, -5); ctx.lineTo(14 - s, -1); ctx.lineTo(10 - s, 0); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(-9 + s, -1, 10, 1); ctx.fillRect(1 - s, -1, 10, 1); // heels
};

/** A tooled belt with a big shiny buckle. */
const belt = (ctx: Ctx, y: number, w: number) => {
  ctx.fillStyle = '#3F2410'; ctx.fillRect(-w / 2, y, w, 4);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-3, y - 1, 7, 6);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(-1, y + 1, 3, 2);
};

/** A sicario: black cap, shades, a bandana over his face, a flannel over a white tank, gold chain, an AK; the muzzle glows before he fires. */
const drawSicario = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -28, f, Math.abs(e.vel.x) > 0.5 ? 5 : 0);
  belt(ctx, -30, 22);
  // Flannel, open over the tank top
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-12, -56, 24, 27);
  ctx.fillStyle = '#450A0A'; for (let y = -54; y < -30; y += 6) ctx.fillRect(-12, y, 24, 2); for (let x = -10; x < 12; x += 6) ctx.fillRect(x, -56, 2, 26);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-4, -56, 8, 26);
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -56, 6, 0.3, Math.PI - 0.3); ctx.stroke();
  // Head: skin, a black bandana up to the nose, shades, a black cap backward... no, forward, brim down
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -64, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.moveTo(-6, -63); ctx.lineTo(12, -64); ctx.lineTo(10, -55); ctx.lineTo(-5, -56); ctx.fill();
  ctx.fillStyle = '#F8FAFC'; for (let i = 0; i < 3; i++) ctx.fillRect(1 + i * 3, -60, 1, 1); // paisley dots
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(1, -69, 11, 4);
  ctx.fillStyle = '#111827'; ctx.beginPath(); ctx.arc(2, -70, 9, Math.PI, 0); ctx.fill(); ctx.fillRect(4, -72, 12, 3);
  // The AK: wooden stock and grip, the curved magazine, held at the hip-shoulder
  const charge = Math.max(0, (e.shootTimer - 40) / 20);
  ctx.fillStyle = '#92400E'; ctx.fillRect(-12, -44, 14, 6); // stock
  ctx.fillStyle = '#1F2937'; ctx.fillRect(0, -46, 24, 5); // receiver
  ctx.fillStyle = '#92400E'; ctx.fillRect(10, -46, 9, 5); // handguard
  ctx.fillStyle = '#111827'; ctx.fillRect(24, -45, 8, 2); // barrel
  ctx.save(); ctx.translate(6, -41); ctx.rotate(0.35); ctx.fillStyle = '#1F2937'; ctx.fillRect(0, 0, 5, 11); ctx.restore(); // magazine
  ctx.fillStyle = SKIN_DARK; ctx.fillRect(2, -41, 5, 5); ctx.fillRect(14, -45, 5, 5); // hands
  if (charge > 0.8) { ctx.fillStyle = '#FEF08A'; ctx.beginPath(); ctx.arc(34, -44, 2 + charge * 3, 0, Math.PI * 2); ctx.fill(); }
};

/** The enforcer: shaved head, tattoos everywhere, a stained wife-beater, a machete he swings as he runs you down. */
const drawEnforcer = (ctx: Ctx, e: Enemy, f: number) => {
  const running = Math.abs(e.vel.x) > 1;
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 7 : 1, '#44403C');
  belt(ctx, -32, 26);
  ctx.save(); ctx.translate(0, -30); ctx.rotate(running ? 0.28 : 0);
  // Big slab of a torso in a tank top
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.lineTo(-19, -34); ctx.quadraticCurveTo(0, -44, 19, -34); ctx.lineTo(17, 0); ctx.fill();
  ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-12, -32, 24, 32);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.35)'; ctx.beginPath(); ctx.ellipse(4, -12, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); // a stain
  // Neck and chest tattoos
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-16, -30, 3, 10); ctx.fillRect(13, -28, 3, 8); ctx.fillRect(-4, -36, 8, 2);
  // Head: shaved, a teardrop tattoo, a mustache, a scowl
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(3, -44, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.arc(3, -48, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#111827'; ctx.fillRect(6, -47, 6, 2); ctx.fillRect(5, -40, 8, 2);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(9, -44, 1, 2);
  // Arm and the machete, swinging
  const sw = running ? Math.sin(f * 0.45) * 0.7 : 0.2;
  ctx.save(); ctx.translate(12, -30); ctx.rotate(-0.6 + sw);
  ctx.fillStyle = SKIN; ctx.fillRect(0, -4, 16, 8);
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(4, -3, 6, 2);
  ctx.fillStyle = '#3F2410'; ctx.fillRect(14, -3, 8, 6); // grip
  ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.moveTo(22, -3); ctx.lineTo(50, -6); ctx.quadraticCurveTo(54, 0, 48, 4); ctx.lineTo(22, 3); ctx.fill();
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(24, 1, 22, 1);
  ctx.restore();
  ctx.restore();
};

/** A goon behind a car door he's torn off something (the window's gone, it's full of holes); he drops it to throw a bottle. */
const drawCardoor = (ctx: Ctx, e: Enemy, f: number) => {
  legs(ctx, -26, f, 0, '#374151');
  // Hoodie
  ctx.fillStyle = '#334155'; ctx.fillRect(-13, -54, 26, 30);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(-13, -30, 26, 4); ctx.fillRect(-6, -40, 12, 6);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -62, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(1, -64, 11, Math.PI * 0.95, Math.PI * 2.05); ctx.fill(); // the hood up
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(-4, -61, 15, 7); // red bandana
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -66, 6, 2);
  if (e.isShieldActive) {
    const damage = 1 - e.health / e.maxHealth;
    // The door: sky blue, dented, a handle and a mirror, the window frame empty
    ctx.fillStyle = '#60A5FA'; ctx.beginPath(); ctx.moveTo(10, -72); ctx.lineTo(30, -76); ctx.lineTo(30, -4); ctx.lineTo(10, -2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#1E40AF'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#0F172A'; ctx.fillRect(13, -68, 14, 18); // empty window
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(14, -44, 8, 3); // handle
    ctx.fillStyle = '#1F2937'; ctx.fillRect(28, -58, 6, 5); // the mirror
    ctx.fillStyle = '#93C5FD'; ctx.fillRect(12, -30, 16, 2);
    // Bullet holes and dents as it takes hits
    ctx.fillStyle = '#0F172A';
    for (let i = 0; i < Math.floor(damage * 8) + 1; i++) { ctx.beginPath(); ctx.arc(14 + ((i * 7) % 14), -40 + ((i * 13) % 34), 1.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'; if (damage > 0.4) { ctx.beginPath(); ctx.ellipse(20, -20, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill(); }
  } else {
    // Door down at his side, winding up to throw a bottle
    ctx.fillStyle = '#60A5FA'; ctx.fillRect(-30, -40, 12, 38);
    const wind = Math.min(1, Math.max(0, (e.shootTimer - 80) / 40));
    ctx.fillStyle = '#334155'; ctx.fillRect(-4 - wind * 10, -54, 7, 12);
    ctx.fillStyle = '#65A30D'; ctx.fillRect(-7 - wind * 12, -66, 5, 13); ctx.fillStyle = '#FDE68A'; ctx.fillRect(-7 - wind * 12, -62, 5, 4);
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

/** Tourists in the old west town: a gift-shop cowboy hat, a souvenir tee, a fanny pack; what they're up to is their variant. */
const TEES = ['#F97316', '#22D3EE', '#F472B6', '#A3E635', '#FDE047', '#E5E7EB'];
const TOURIST_SKIN = ['#F2C9A0', '#E0AC69', '#C68642', '#8D5524', '#FBD5B0'];
const drawVisitor = (ctx: Ctx, e: Enemy, f: number) => {
  const seed = Math.abs(Math.round(e.homeX || 0));
  const v = e.variant ?? 0;
  const skin = TOURIST_SKIN[seed % TOURIST_SKIN.length], tee = TEES[(v + seed) % TEES.length];
  const panicking = e.aiState === 'flee' || e.aiState === 'shelter';
  const running = panicking || Math.abs(e.vel.x) > 1;
  const s = Math.sin(f * (running ? 0.45 : 0.2)) * (running ? 7 : Math.abs(e.vel.x) > 0.2 ? 3 : 0);
  // Cargo shorts, white socks pulled up, sandals
  ctx.fillStyle = skin; ctx.fillRect(-8 + s, -24, 6, 20); ctx.fillRect(2 - s, -24, 6, 20);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8 + s, -12, 6, 8); ctx.fillRect(2 - s, -12, 6, 8);
  ctx.fillStyle = '#78350F'; ctx.fillRect(-9 + s, -3, 8, 3); ctx.fillRect(1 - s, -3, 8, 3);
  ctx.fillStyle = '#A3A38A'; ctx.fillRect(-10, -32, 20, 10);
  // The souvenir tee, a fanny pack
  ctx.fillStyle = tee; ctx.fillRect(-11, -54, 22, 24);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center';
  { const t = ctx.getTransform(); ctx.save(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(-1, 1); ctx.fillText('NM', 0, -42); ctx.restore(); }
  ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-8, -33, 16, 6); ctx.fillStyle = '#111827'; ctx.fillRect(-10, -31, 20, 1);
  // Head, sunburnt nose, the hat
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(2, -62, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F87171'; ctx.fillRect(8, -62, 3, 2);
  ctx.fillStyle = '#111827'; ctx.fillRect(5, -64, 2, 2);
  ctx.fillStyle = ['#D6B98C', '#1C1917', '#F8FAFC'][seed % 3];
  ctx.beginPath(); ctx.ellipse(1, -68, 15, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-7, -77, 16, 9); ctx.fillStyle = '#7C2D12'; ctx.fillRect(-7, -70, 16, 2);
  ctx.fillStyle = skin;
  if (panicking) {
    const flail = Math.sin(f * 0.6) * 5;
    ctx.fillRect(-12, -72 + flail, 4, 18); ctx.fillRect(8, -72 - flail, 4, 18);
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(6, -58, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  } else if (v === 0 || v === 2) {
    // A camera up to the face, snapping away (a flash now and then)
    ctx.fillRect(6, -60, 10, 4);
    ctx.fillStyle = '#111827'; ctx.fillRect(12, -66, 8, 7); ctx.fillStyle = '#6B7280'; ctx.beginPath(); ctx.arc(20, -62, 2.5, 0, Math.PI * 2); ctx.fill();
    if (f % 140 < 4) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(22, -64, 7, 0, Math.PI * 2); ctx.fill(); }
  } else if (v === 4) {
    // A churro
    ctx.fillRect(6, -46, 10, 4);
    ctx.save(); ctx.translate(15, -48); ctx.rotate(-0.8); ctx.fillStyle = '#B45309'; ctx.fillRect(0, -2, 16, 4); ctx.fillStyle = '#FDE68A'; for (let i = 2; i < 16; i += 3) ctx.fillRect(i, -2, 1, 4); ctx.restore();
  } else {
    // Swinging arms, a map in one hand
    ctx.fillRect(6, -50, 4, 16);
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(8, -38, 10, 8); ctx.fillStyle = '#DC2626'; ctx.fillRect(11, -35, 3, 1);
  }
};

/** (Dale's distributor is drawn by the stage: this is only for anything that draws him out of context.) */
const drawJunkieStandIn = (ctx: Ctx, f: number) => {
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-14, -70, 28, 40);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-12, -30, 24, 30);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(2, -80, 10, 0, Math.PI * 2); ctx.fill();
  void f;
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
