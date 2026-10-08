// Meathead's body, part by part, shared by every pose he's drawn in (standing about, running, jumping, and the
// special moves: the charge, the slide, the uppercut, the divekick...), so they all have the same muscle, shading and
// kit on them. Drawn in his local frame, facing +x.

import { getGore, drawTorsoBlood, drawHeadBlood, drawBeatenUp } from './gore';
import { markEyes } from './spriteOutline';

type Ctx = CanvasRenderingContext2D;

export const skinTone = '#E0AC69';
export const skinShadow = '#C68B45';
export const skinHighlight = '#F5D0A9';
export const skinVein = '#EF4444';
const JEANS = '#1E3A8A', JEANS_SHADOW = '#172554';
// (the colors his legs are drawn in: his jeans', or, with them blown off him, his own: see setNude)
export let pantsColor = JEANS;
export let pantsShadow = JEANS_SHADOW;

/**
 * Naked from the waist down (Meathead 2: his pants blown clean off him, game/player/gut.ts): his legs his own skin, no
 * belt, no pockets, hairy, and swinging free. Set by the renderer every time he's drawn; `vx`, `vy` and `frame` keep
 * it all swinging the way he's going.
 */
let nude = false;
const dangle = { a: 0, va: 0, frame: -1 };
export const setNude = (on: boolean, vx = 0, vy = 0, frame = 0, facing = 1) => {
  nude = on;
  pantsColor = on ? skinTone : JEANS;
  pantsShadow = on ? skinShadow : JEANS_SHADOW;
  if (!on || dangle.frame === frame) return;
  // (a pendulum: it hangs back the way he's going, swings past and settles; walking, it bounces with his step)
  dangle.frame = frame;
  // (in his own frame, which is drawn turned round when he faces left: so by how fast he's going forward, not which way
  // on the screen, and it swings the same whichever way he faces)
  const fwd = vx * (facing < 0 ? -1 : 1);
  const want = Math.max(-0.7, Math.min(0.7, -fwd * 0.09 + vy * 0.03));
  dangle.va += (want - dangle.a) * 0.18 - dangle.va * 0.12;
  if (Math.abs(vx) > 0.5 && frame % 8 === 0) dangle.va += (Math.random() - 0.5) * 0.12 + Math.sign(fwd) * 0.04;
  dangle.a += dangle.va;
};
export const isNude = () => nude;
export const bootColor = '#18181B';
export const bootToe = '#94A3B8';
export const beltColor = '#78350F';
export const beltBuckle = '#FACC15';
export const wristbandColor = '#09090B';
export const backArmShade = '#A87038';
export const stubbleColor = 'rgba(60, 30, 10, 0.35)';

/**
 * His torso, front on: the lats flaring out, the serratus and obliques, a six-pack (four when he's crouched), the pecs
 * lit across the top and shadowed under, the traps rising behind his neck. `top` is the top of it, `pecY` the pecs'.
 */
export const drawTorso = (ctx: Ctx, torsoTop: number, torsoHeight: number, pecY: number, isDucking = false) => {
  // Torso Base: lit from the front, shadowed round the back, lats flaring out
  const torsoShade = ctx.createLinearGradient(-14, 0, 14, 0);
  torsoShade.addColorStop(0, skinShadow);
  torsoShade.addColorStop(0.3, skinTone);
  torsoShade.addColorStop(1, skinTone);
  ctx.fillStyle = torsoShade;
  ctx.fillRect(-14, torsoTop, 28, torsoHeight);
  ctx.beginPath();
  ctx.moveTo(-14, torsoTop + 4); ctx.lineTo(-16, torsoTop + 9); ctx.lineTo(-14, torsoTop + 16);
  ctx.moveTo(14, torsoTop + 4); ctx.lineTo(16, torsoTop + 9); ctx.lineTo(14, torsoTop + 16);
  ctx.fill();
  // Serratus ridges and obliques down the front side
  ctx.fillStyle = skinShadow;
  for (let i = 0; i < 3; i++) ctx.fillRect(9.5, torsoTop + 11 + i * 3, 3, 0.9);
  ctx.beginPath();
  ctx.moveTo(10, torsoTop + torsoHeight - 1); ctx.lineTo(13.5, torsoTop + torsoHeight - 7); ctx.lineTo(13.5, torsoTop + torsoHeight - 1);
  ctx.fill();

  // Chiseled 6-Pack Abs (compacted during crouch)
  ctx.fillStyle = skinShadow;
  // Linea alba (center vertical divider)
  ctx.fillRect(-0.75, torsoTop + 9, 1.5, isDucking ? 10 : 13);
  // Horizontal ab dividers
  ctx.fillRect(-8, torsoTop + 13, 16, 1.2);
  if (!isDucking) {
    ctx.fillRect(-7, torsoTop + 19, 14, 1.2);
  }
  // Six distinct rectus abdominis muscle blocks
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-6, torsoTop + 9.5, 4.5, 2.8);
  ctx.fillRect(1.5, torsoTop + 9.5, 4.5, 2.8);
  ctx.fillRect(-5.5, torsoTop + 14, 4, 3);
  ctx.fillRect(1.5, torsoTop + 14, 4, 3);
  if (!isDucking) {
    ctx.fillRect(-5, torsoTop + 20, 4, 2.5);
    ctx.fillRect(1, torsoTop + 20, 4, 2.5);
  }

  // Bulging Pectoral Chest Muscles
  ctx.fillStyle = skinTone;
  // Left pec
  ctx.beginPath();
  ctx.roundRect(-13, pecY, 12, isDucking ? 8.5 : 10, [3, 1, 3, 4]);
  ctx.fill();
  // Right pec
  ctx.beginPath();
  ctx.roundRect(1, pecY, 12, isDucking ? 8.5 : 10, [1, 3, 4, 3]);
  ctx.fill();

  // Pec separation shadow & under-pec cleft
  ctx.fillStyle = skinShadow;
  ctx.fillRect(-0.75, pecY, 1.5, isDucking ? 8.5 : 10);
  ctx.fillRect(-13, pecY + (isDucking ? 7.5 : 9), 26, 1.5);
  // Upper pec highlights, and the underside of each pec in shadow
  ctx.fillStyle = skinHighlight;
  ctx.fillRect(-11, pecY + 1.5, 8, 2);
  ctx.fillRect(3, pecY + 1.5, 8, 2);
  ctx.fillRect(5, pecY + 4, 4, 1.2);
  ctx.fillStyle = 'rgba(120, 70, 20, 0.35)';
  ctx.fillRect(-12, pecY + (isDucking ? 6 : 7.5), 11, 1.5);
  ctx.fillRect(2, pecY + (isDucking ? 6 : 7.5), 10, 1.5);
  // Sweat sheen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(6, pecY + 2, 1.5, 1);
  ctx.fillRect(3, torsoTop + 15, 1, 1);

  // Trapezius muscles rising behind neck
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.moveTo(-12, torsoTop + 2);
  ctx.lineTo(-6, torsoTop - 6);
  ctx.lineTo(6, torsoTop - 6);
  ctx.lineTo(12, torsoTop + 2);
  ctx.closePath();
  ctx.fill();
  drawTorsoBlood(ctx, torsoTop, torsoHeight, pecY);
  // In the finale he's still got the President's medal on: the blue ribbon round his neck (under his chin), the
  // medal on his chest between the pecs, a white star on gold
  if (singed) drawMedalOn(ctx, torsoTop, pecY);
};

/** The Presidential Medal of Freedom, as he wears it in the finale (torso frame). */
const drawMedalOn = (ctx: Ctx, torsoTop: number, pecY: number) => {
  const my = pecY + 6;
  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath(); ctx.moveTo(-7, torsoTop - 5); ctx.lineTo(-4.5, torsoTop - 5); ctx.lineTo(0.6, my - 2); ctx.lineTo(-1.6, my - 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(7, torsoTop - 5); ctx.lineTo(4.5, torsoTop - 5); ctx.lineTo(-0.6, my - 2); ctx.lineTo(1.6, my - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3B82F6'; ctx.fillRect(-6, torsoTop - 4, 1, 3); ctx.fillRect(5.5, torsoTop - 4, 1, 3);
  // (the medal: a gold rim, a red-and-white star, a glint)
  ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.arc(0, my + 0.5, 3.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(0, my, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 1 : 2.4; ctx.lineTo(Math.cos(a) * r, my + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-0.5, my - 0.5, 1, 1);
  ctx.fillStyle = '#FEF9C3'; ctx.fillRect(-2.4, my - 2.4, 1, 1);
};

/** The lifting belt across his waist at `beltY`: the strap, the gold buckle, studs, stitching. */
export const drawBelt = (ctx: Ctx, beltY: number, beltH: number) => {
  if (nude) { drawBareHips(ctx, beltY, beltH); return; }
  // Heavy brown leather strap
  ctx.fillStyle = beltColor;
  ctx.fillRect(-13, beltY, 26, beltH);
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 1;
  ctx.strokeRect(-13, beltY, 26, beltH);
  // Heavy gold weightlifting buckle
  ctx.fillStyle = beltBuckle;
  ctx.fillRect(-5, beltY - 1, 10, beltH + 2);
  ctx.strokeStyle = '#B45309';
  ctx.strokeRect(-5, beltY - 1, 10, beltH + 2);
  // Buckle cutout center
  ctx.fillStyle = '#451A03';
  ctx.fillRect(-2, beltY + 1, 4, beltH - 2);
  // Silver studs
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(-10, beltY + 2, 2, 2);
  ctx.fillRect(8, beltY + 2, 2, 2);
  // Stitching along both edges, and a glint on the buckle
  ctx.fillStyle = '#D97706';
  for (let sx = -12; sx < 12; sx += 2.5) {
    if (sx > -6 && sx < 5) continue;
    ctx.fillRect(sx, beltY + 0.8, 1.3, 0.6);
    ctx.fillRect(sx, beltY + beltH - 1.3, 1.3, 0.6);
  }
  ctx.fillStyle = '#FEF9C3';
  ctx.fillRect(-4, beltY, 2.5, 1.2);
};

/**
 * An arm, shoulder (sx, sy) to elbow (ex, ey) to wrist (wx, wy): a deltoid capping the shoulder, the upper arm with
 * the bicep bulging out the side the forearm bends toward, the forearm thicker by the elbow and tapering to the wrist,
 * a spiked wristband, and a fist (at `fistX` along the forearm's line if given, else just past the wrist). Shaded:
 * `shade` down the back of each part, `light` along the top of the deltoid and the bicep.
 */
export const drawArm = (ctx: Ctx, sx: number, sy: number, ex: number, ey: number, wx: number, wy: number, skin: string, shade: string, light: string, fistX?: number, fistR = 5) => {
  const seg = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number, color: string) => {
    const a = Math.atan2(by - ay, bx - ax), nx = -Math.sin(a), ny = Math.cos(a);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax + nx * ra, ay + ny * ra); ctx.lineTo(bx + nx * rb, by + ny * rb);
    ctx.lineTo(bx - nx * rb, by - ny * rb); ctx.lineTo(ax - nx * ra, ay - ny * ra); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(ax, ay, ra, 0, Math.PI * 2); ctx.arc(bx, by, rb, 0, Math.PI * 2); ctx.fill();
  };
  // Which way the elbow bends (the bicep's on the inside of the bend)
  const ux = ex - sx, uy = ey - sy, fx = wx - ex, fy = wy - ey;
  const side = Math.sign(ux * fy - uy * fx) || 1;
  const ul = Math.hypot(ux, uy) || 1, nx = (-uy / ul) * side, ny = (ux / ul) * side;
  // Forearm (behind the upper arm at the elbow)
  seg(ex, ey, wx, wy, 4.4, 3.3, skin);
  const fl = Math.hypot(fx, fy) || 1, fnx = -fy / fl, fny = fx / fl;
  ctx.fillStyle = shade; ctx.beginPath(); ctx.moveTo(ex + fnx * 4, ey + fny * 4); ctx.lineTo(wx + fnx * 3.1, wy + fny * 3.1); ctx.lineTo(wx + fnx * 1.5, wy + fny * 1.5); ctx.lineTo(ex + fnx * 1.8, ey + fny * 1.8); ctx.fill();
  // Upper arm, the bicep bulging out on the inside of the bend, the tricep's shadow down the back
  seg(sx, sy, ex, ey, 5, 4.2, skin);
  const mx = sx + ux * 0.55, my = sy + uy * 0.55;
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(mx + nx * 2.4, my + ny * 2.4, 4.4, ul * 0.4, Math.atan2(uy, ux) - Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = shade; ctx.beginPath(); ctx.ellipse(mx - nx * 3.8, my - ny * 3.8, 1.4, ul * 0.32, Math.atan2(uy, ux) - Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light; ctx.beginPath(); ctx.ellipse(mx + nx * 3.6, my + ny * 3.6 - 1, 1.3, ul * 0.22, Math.atan2(uy, ux) - Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  // (the crease at the elbow)
  ctx.fillStyle = shade; ctx.fillRect(ex + nx * 1.5 - 1, ey + ny * 1.5 - 0.5, 2, 1);
  // Deltoid: a cap over the top of the shoulder, lit on top
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(sx, sy, 6, 5.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = shade; ctx.beginPath(); ctx.ellipse(sx, sy + 4, 4.6, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = light; ctx.beginPath(); ctx.ellipse(sx + 1, sy - 1.8, 2.6, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  // Spiked wristband, square to the forearm
  const bx = wx - (fx / fl) * 1.5, by = wy - (fy / fl) * 1.5;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.atan2(fy, fx));
  ctx.fillStyle = wristbandColor; ctx.fillRect(-2.5, -5, 5, 10);
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-1, -3, 2, 2); ctx.fillRect(-1, 1, 2, 2);
  ctx.restore();
  // Fist
  const reach = fistR - 0.5;
  const hx = fistX ?? wx + (fx / fl) * reach, hy = fistX !== undefined ? wy : wy + (fy / fl) * reach;
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, fistR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = shade; ctx.beginPath(); ctx.arc(hx, hy, fistR, Math.PI * 0.15, Math.PI * 0.85); ctx.lineTo(hx, hy); ctx.fill();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy - fistR * 0.12, fistR * 0.84, 0, Math.PI * 2); ctx.fill();
  // (the knuckles, across the front of it)
  const ka = Math.atan2(fy, fx), kx = Math.cos(ka), ky = Math.sin(ka);
  ctx.fillStyle = shade;
  for (let k = -1; k <= 1; k++) ctx.fillRect(hx + kx * fistR * 0.55 - ky * k * fistR * 0.45 - 0.4, hy + ky * fistR * 0.55 + kx * k * fistR * 0.45 - 0.4, 0.9, 0.9);
};

/** The alien's ray gun went through his jeans at the shin in the ending's cutscene: in the finale, the hole's there
 * (and he's still wearing the medal the President gave him). */
let singed = false;
export const setLegSinge = (on: boolean) => { singed = on; };

/**
 * The hole the alien's laser burned in his jeans, on the near shin (`at` its middle, in the leg's own frame): a halo
 * of scorch on the denim, the frayed edge charred black, his skin showing through, a couple of curled-up leg hairs.
 */
const drawSinge = (ctx: Ctx, x: number, y: number) => {
  ctx.fillStyle = 'rgba(70, 36, 12, 0.55)'; ctx.beginPath(); ctx.ellipse(x, y, 3.6, 3, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#140a04'; ctx.beginPath(); ctx.ellipse(x, y, 2.6, 2.1, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.ellipse(x + 0.2, y - 0.1, 1.7, 1.3, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#C68B45'; ctx.fillRect(x - 1, y + 0.4, 2.2, 0.7);
  ctx.fillStyle = '#2a1608'; ctx.fillRect(x - 0.6, y - 0.9, 0.6, 0.6); ctx.fillRect(x + 0.5, y - 0.4, 0.6, 0.6);
  // (the edge: a bright ember or two still in it)
  ctx.fillStyle = '#F97316'; ctx.fillRect(x + 2, y - 1, 0.7, 0.7);
};

/**
 * Where the belt goes, with nothing on: his bare hips (the back of them his backside, a crack down it), a thatch of
 * hair at the front, and hanging from under it, swinging, his dick and balls.
 */
const drawBareHips = (ctx: Ctx, y: number, h: number) => {
  ctx.fillStyle = skinTone; ctx.fillRect(-13, y, 26, h + 1);
  ctx.fillStyle = skinShadow; ctx.fillRect(-13, y, 8, h + 1);
  ctx.fillStyle = skinHighlight; ctx.fillRect(4, y + 1, 7, 1);
  // (his backside: rounded off at the back, the crack)
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(-11, y + h * 0.7, 4, h * 0.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(110, 60, 25, 0.7)'; ctx.fillRect(-12.5, y + 1, 1, h);
  // (hair)
  ctx.fillStyle = '#3B2414'; ctx.beginPath(); ctx.ellipse(6, y + h - 0.5, 4.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2A190D'; for (const [hx, hy] of [[3, -1.5], [5.5, -2.2], [8, -1.6], [9.5, -0.3], [2.4, 0.4]]) ctx.fillRect(6 + hx - 6, y + h - 0.5 + hy, 1, 1);
  // (and swinging free)
  ctx.save(); ctx.translate(6.5, y + h + 0.5); ctx.rotate(dangle.a);
  ctx.fillStyle = backArmShade; ctx.beginPath(); ctx.ellipse(-1.6, 3.6, 3.6, 3.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(-1.3, 3.3, 2.8, 2.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.roundRect(-0.4, -0.5, 3.6, 9, 1.8); ctx.fill();
  ctx.fillStyle = skinShadow; ctx.fillRect(-0.4, 0.5, 1, 7.5);
  ctx.fillStyle = '#D9907A'; ctx.beginPath(); ctx.ellipse(1.4, 8.6, 2, 1.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinHighlight; ctx.fillRect(2.2, 1, 0.8, 5);
  ctx.restore();
};

/** A trouser leg: shaded down the back, a crease at the knee and (on the near leg) a cargo pocket. `singeAt`: on the
 * near shin, how far down it the laser's hole is (in the finale only). */
export const drawPantLeg = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string, pocket = false, singeAt?: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  if (nude) {
    // (a bare leg: shaded down the back, lit down the front, hairy)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; ctx.fillRect(x, y, w * 0.3, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'; ctx.fillRect(x + w - 2, y + 1, 1.2, h - 2);
    ctx.fillStyle = 'rgba(60, 35, 15, 0.55)';
    for (let i = 0; i < Math.floor(h / 4); i++) ctx.fillRect(x + 1.5 + ((i * 3.7) % (w - 3)), y + 2 + i * 4, 1, 1.4);
    return;
  }
  // Blood soaking into the fabric as he takes a beating
  const gore = getGore();
  if (gore > 0.5) {
    ctx.fillStyle = 'rgba(60, 5, 10, 0.55)';
    ctx.beginPath(); ctx.ellipse(x + w * 0.6, y + h * 0.25, w * 0.3, h * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  if (gore > 0.8) {
    ctx.fillStyle = 'rgba(60, 5, 10, 0.5)';
    ctx.beginPath(); ctx.ellipse(x + w * 0.35, y + h * 0.7, w * 0.35, h * 0.22, -0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(x, y, w * 0.3, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(x + w - 2, y + 1, 1.2, h - 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(x + 1, y + h * 0.58, w - 2, 0.9);
  if (pocket) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + w * 0.35, y + 2, w * 0.5, h * 0.35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x + w * 0.35, y + 2, w * 0.5, 0.8);
  }
  if (singed && singeAt !== undefined) drawSinge(ctx, x + w * 0.6, y + h * singeAt);
};

/** A combat boot: laces, a thick sole and (on the near foot) a shiny steel toe. */
export const drawBoot = (ctx: Ctx, x: number, y: number, w: number, h: number, steelToe: boolean) => {
  ctx.fillStyle = bootColor;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, [2, 3, 1, 1]); ctx.fill();
  ctx.fillStyle = '#3F3F46';
  ctx.fillRect(x + 1, y + 0.8, w * 0.45, 0.9);
  ctx.fillStyle = '#71717A';
  for (let i = 0; i < 2; i++) ctx.fillRect(x + 2 + i * 3, y + 2, 1.6, 0.8);
  ctx.fillStyle = '#09090B';
  ctx.fillRect(x, y + h - 1.6, w, 1.6);
  if (steelToe) {
    ctx.fillStyle = bootToe;
    ctx.beginPath(); ctx.roundRect(x + w - 6, y + 1, 6, h - 2.6, [1, 2.5, 0, 0]); ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x + w - 4.5, y + 1.6, 2, 1.2);
  }
};

/** A leg bent at the knee: thigh from the hip, then the shin (angles from straight down; negative = forward). */
export const drawJointedLeg = (ctx: Ctx, hipX: number, hipY: number, thighAngle: number, kneeBend: number, color: string, near: boolean) => {
  const w = near ? 10 : 9;
  ctx.save();
  ctx.translate(hipX, hipY);
  ctx.rotate(thighAngle);
  drawPantLeg(ctx, -w / 2 - 1, 0, w + 2, 12, color, near);
  ctx.translate(0, 11);
  ctx.rotate(kneeBend);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, Math.PI * 2); ctx.fill();
  drawPantLeg(ctx, -w / 2 + 0.5, 0, w - 1, 10, color, false, near ? 0.45 : undefined);
  drawBoot(ctx, -w / 2, 9, w + 4, 7, near);
  ctx.restore();
};

/** An arm whose fist lands on (fx, fy): `back` for the far arm (in his shadow). */
export const drawArmTo = (ctx: Ctx, shoulder: [number, number], elbow: [number, number], fist: [number, number], back: boolean, fistR = 5) => {
  const dx = fist[0] - elbow[0], dy = fist[1] - elbow[1], len = Math.hypot(dx, dy) || 1;
  const reach = fistR - 0.5;
  drawArm(ctx, shoulder[0], shoulder[1], elbow[0], elbow[1], fist[0] - (dx / len) * reach, fist[1] - (dy / len) * reach,
    back ? skinShadow : skinTone, back ? backArmShade : skinShadow, back ? skinTone : skinHighlight, undefined, fistR);
};

/**
 * A leg from the hip through the knee to the foot: the thigh and the shin as trouser legs (shaded down the back, a
 * crease, blood soaking in as he takes a beating), a round knee between them, and a combat boot at the foot pointing
 * along `toeAngle` (steel toe on the near foot).
 */
export const drawLeg = (ctx: Ctx, hip: [number, number], knee: [number, number], foot: [number, number], toeAngle: number, back: boolean) => {
  const color = back ? pantsShadow : pantsColor, w = back ? 10 : 11;
  const seg = (a: [number, number], b: [number, number], width: number, pocket: boolean, singeAt?: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2);
    drawPantLeg(ctx, -width / 2, 0, width, len + 1, color, pocket, singeAt);
    ctx.restore();
  };
  seg(knee, foot, w - 1, false, back ? undefined : 0.45);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(knee[0], knee[1], w / 2, 0, Math.PI * 2); ctx.fill();
  // (the thigh thicker than the shin: he doesn't skip leg day)
  seg(hip, knee, w + 1.5, !back);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(knee[0], knee[1], w / 2 - 0.5, 0, Math.PI * 2); ctx.fill();
  // (the knee's lit edge)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.beginPath(); ctx.arc(knee[0], knee[1], w / 2 - 1, -Math.PI * 0.9, -Math.PI * 0.4); ctx.lineTo(knee[0], knee[1]); ctx.fill();
  ctx.save(); ctx.translate(foot[0], foot[1]); ctx.rotate(toeAngle);
  drawBoot(ctx, -5, -4.5, 15, 8, !back);
  ctx.restore();
};

export type Mood = 'grit' | 'roar' | 'yell' | 'scowl';

/**
 * His head centred on (hx, hy), as it's drawn standing: the square jaw, the back of it in shadow, an ear, the
 * cheekbone, stubble, a cleft chin, the nose, the flat-top with its bristles, the rage vein, heavy brows; the eyes and
 * mouth by `mood` (gritted teeth, a roar, a yell, or a scowl locked on).
 */
/** He's talking (set for each frame he's drawn): whatever pose he's in, his jaw works with it. */
let talking = false;
export const setTalking = (on: boolean) => { talking = on; };

/** The talking mouth, at (hx, my): open, shut, wider, the top teeth, the tongue down in it when it's wide. */
export const drawTalkingMouth = (ctx: Ctx, hx: number, my: number, frame: number) => {
  const open = [3.6, 1.6, 4.6, 2.4][Math.floor(frame / 4) % 4];
  ctx.fillStyle = '#18181B';
  ctx.beginPath(); ctx.roundRect(hx - 5.5, my - 0.5, 11, open + 1.5, 1.5); ctx.fill();
  ctx.fillStyle = '#450A0A';
  ctx.beginPath(); ctx.roundRect(hx - 4.5, my + 0.3, 9, open, 1.2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - 4.2, my + 0.3, 8.4, 1.3);
  if (open > 3) { ctx.fillStyle = '#DC2626'; ctx.fillRect(hx - 2.5, my + open - 0.8, 5, 1.2); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(hx - 3.8, my + open - 0.3, 7.6, 0.8); }
};

export const drawHead = (ctx: Ctx, hx: number, hy: number, mood: Mood, frame: number) => {
  ctx.fillStyle = skinTone;
  ctx.beginPath(); ctx.roundRect(hx - 10, hy - 12, 20, 20, [4, 4, 3, 3]); ctx.fill();
  ctx.fillStyle = 'rgba(150, 90, 35, 0.35)'; ctx.fillRect(hx - 10, hy - 11, 3.5, 18);
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.roundRect(hx - 12, hy - 7, 3.5, 7, 1.5); ctx.fill();
  ctx.fillStyle = '#A0662E'; ctx.fillRect(hx - 11.2, hy - 5, 1.2, 3);
  ctx.fillStyle = skinHighlight; ctx.fillRect(hx + 4, hy - 1, 4.5, 1.2); ctx.fillRect(hx + 7.5, hy - 10, 1.2, 5);
  ctx.fillStyle = 'rgba(120, 53, 15, 0.25)'; ctx.fillRect(hx - 9, hy + 1, 18, 7);
  ctx.fillStyle = stubbleColor;
  for (let i = 0; i < 14; i++) ctx.fillRect(hx - 8.5 + (i * 3.7) % 17, hy + 2 + (i * 2.3) % 5.5, 0.8, 0.8);
  ctx.fillStyle = '#A0662E'; ctx.fillRect(hx - 8, hy + 7.2, 16, 0.8); ctx.fillRect(hx + 0.8, hy + 5.5, 0.7, 2);
  ctx.fillStyle = skinShadow; ctx.fillRect(hx + 1.2, hy - 3, 1.1, 4); ctx.fillRect(hx + 0.2, hy + 0.8, 3.5, 1);
  // The flat-top
  ctx.fillStyle = '#18181B';
  ctx.fillRect(hx - 10, hy - 16, 20, 5); ctx.fillRect(hx - 11, hy - 14, 2, 7); ctx.fillRect(hx + 9, hy - 14, 2, 7);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(hx - 8, hy - 15.5, 13, 1);
  ctx.fillStyle = '#52525B'; for (let i = 0; i < 6; i++) ctx.fillRect(hx - 8 + i * 3, hy - 16.8, 1, 1.3);
  // The rage vein
  ctx.strokeStyle = skinVein; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(hx - 6, hy - 10); ctx.lineTo(hx - 3, hy - 8); ctx.lineTo(hx - 4, hy - 5); ctx.stroke();
  // Brows: crushed down into a V
  ctx.fillStyle = '#09090B';
  const deep = mood === 'scowl' || mood === 'yell';
  ctx.beginPath(); ctx.moveTo(hx - 9, hy - (deep ? 10 : 9)); ctx.lineTo(hx - 0.5, hy - (deep ? 4.5 : 6)); ctx.lineTo(hx - 0.5, hy - (deep ? 2.5 : 4)); ctx.lineTo(hx - 9, hy - (deep ? 7.5 : 7)); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 9, hy - (deep ? 10 : 9)); ctx.lineTo(hx + 0.5, hy - (deep ? 4.5 : 6)); ctx.lineTo(hx + 0.5, hy - (deep ? 2.5 : 4)); ctx.lineTo(hx + 9, hy - (deep ? 7.5 : 7)); ctx.fill();
  if (deep) { ctx.fillStyle = '#A0662E'; ctx.fillRect(hx - 1.2, hy - 9, 0.8, 3.5); ctx.fillRect(hx + 0.6, hy - 9, 0.8, 3.5); }
  // Eyes
  const ey = hy - 4, lx = hx - 5, rx = hx + 4;
  markEyes(ctx, (lx + rx) / 2, ey);
  if (deep) {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx - 2.5, ey - 0.5, 5, 2.2); ctx.fillRect(rx - 2.5, ey - 0.5, 5, 2.2);
    ctx.fillStyle = '#09090B'; ctx.fillRect(lx + 0.3, ey - 0.3, 1.6, 1.8); ctx.fillRect(rx + 0.3, ey - 0.3, 1.6, 1.8);
  } else {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx - 2.5, ey - 1.5, 5, 3); ctx.fillRect(rx - 2.5, ey - 1.5, 5, 3);
    ctx.fillStyle = '#09090B'; ctx.fillRect(lx, ey - 1, 2.5, 2.5); ctx.fillRect(rx, ey - 1, 2.5, 2.5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx + 1.4, ey - 0.8, 0.8, 0.8); ctx.fillRect(rx + 1.4, ey - 0.8, 0.8, 0.8);
    ctx.fillStyle = skinShadow; ctx.fillRect(lx - 2.5, ey + 1.5, 5, 0.8); ctx.fillRect(rx - 2.5, ey + 1.5, 5, 0.8);
  }
  // Mouth (talking: that, whatever the mood)
  const my = hy + 3;
  if (talking) {
    drawTalkingMouth(ctx, hx, my, frame);
  } else if (mood === 'roar' || mood === 'yell') {
    const big = mood === 'roar' ? 1 : 0.8;
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(hx + 0.5, my + 1, 5 * big, 4 * big, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(hx + 0.5, my + 2.6 * big, 3 * big, 1.4 * big, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 3 * big, my - 1.6 * big, 7 * big, 1.6);
  } else if (mood === 'scowl') {
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.roundRect(hx - 7, my - 1, 14, 5.5, 1.5); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 6, my - 0.2, 12, 1.8); ctx.fillRect(hx - 6, my + 1.9, 12, 1.8);
    ctx.fillStyle = '#18181B'; for (let k = -4; k <= 4; k += 2.6) ctx.fillRect(hx + k, my - 0.2, 0.6, 3.9);
    ctx.fillRect(hx - 6, my + 1.6, 12, 0.4);
  } else {
    ctx.fillStyle = '#18181B'; ctx.fillRect(hx - 6, my, 12, 3);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(hx - 5, my + 0.5, 10, 2);
    ctx.fillStyle = '#18181B'; ctx.fillRect(hx - 2, my + 0.5, 0.8, 2); ctx.fillRect(hx + 1, my + 0.5, 0.8, 2);
  }
  drawHeadBlood(ctx, hx, hy, frame);
  drawBeatenUp(ctx, hx, hy, frame);
};

/** The torso from the hips (0,0) up to the shoulders (y = -26), with the belt: the same body as standing, set on his hips. */
export const drawTorsoFromHips = (ctx: Ctx) => {
  ctx.save(); ctx.translate(0, 24);
  drawTorso(ctx, -50, 24, -48);
  drawBelt(ctx, -27, 7);
  ctx.restore();
};

/** The big leading shoulder of the charge: a swollen deltoid, lit round the top, shaded under, a vein down it. */
export const drawRamDelt = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.9, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(x - r * 0.15, y + r * 0.55, r * 0.75, r * 0.3, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinTone; ctx.beginPath(); ctx.ellipse(x, y - r * 0.08, r * 0.85, r * 0.7, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinHighlight; ctx.beginPath(); ctx.ellipse(x + r * 0.25, y - r * 0.35, r * 0.4, r * 0.22, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(x + r * 0.3, y - r * 0.45, 1.5, 1);
  // (the striations down the front of it)
  ctx.fillStyle = skinShadow; for (let k = 0; k < 3; k++) ctx.fillRect(x - r * 0.4 + k * r * 0.3, y + r * 0.05, 0.8, r * 0.35);
};
