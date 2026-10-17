// HELICOPTER HARRY, drawn in full (he's the land's boss: job 5's arena can import this). Late forties, a gray ponytail
// out the back of a white flight helmet with a peace sign on it, round amber-tinted glasses, a gray goatee, a tie-dye
// shirt (a rainbow spiral) under an open olive flight jacket with a fleece collar, faded jeans, socks and sandals.
// Nice: the big easy smile, eyebrows up. Turned: red in the face, brows down, teeth bared, a vein. On his back, once
// he's turned, the ride's emergency jetpack (two silver tanks, the flames under them).
//
// Feet at the origin, facing right (`facing` -1 mirrors him), about 84 px tall at scale 1. Inked, lit from the upper
// left in flat steps (the SNES pass can push it further).

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

export type HarryPose = 'stand' | 'wave' | 'pilot' | 'shoved' | 'fall' | 'jet' | 'aim' | 'fire' | 'gloat' | 'run' | 'remote' | 'down';
/** burn: the jetpack's flames (a hop); remote: the ride's remote in his hand (keyed: its light on); aim: the launcher
 *  tipped up this far (radians). */
export interface HarryLook { pose: HarryPose; f: number; facing?: 1 | -1; mad?: boolean; talking?: boolean; jetpack?: boolean; rot?: number; scale?: number; launcher?: boolean; burn?: boolean; remote?: boolean; keyed?: boolean; aim?: number }

// (exported for job 5's arena: harry/rambo.ts draws him jacked with the same pieces)
export const SKIN = ['#8A5A3C', '#C98E66', '#E2AC84', '#F2C9A6'];
const JACKET = ['#2F3A1E', '#4B5A2C', '#66773C', '#83954F'];
export const DENIM = ['#2A3E66', '#3D5A8A', '#5677AA', '#7D9AC4'];
export const GRAY = ['#6B6B6B', '#9CA3AF', '#C7CCD3', '#E5E7EB'];
export const TIEDYE = ['#DC2626', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'];

/** Two hex colors mixed (k of the second). */
export const mixHex = (a: string, b: string, k: number) => {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const ch = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(1)}${ch(2)}`;
};

export const fill = (c: Ctx, col: string, path: () => void, line = 1.4) => {
  c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke();
};
export const rect = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

/** A limb: a fat inked line from (x0, y0) to (x1, y1), then its lit edge. */
export const limb = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, col: string, lit: string) => {
  c.lineCap = 'round';
  c.strokeStyle = INK; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.strokeStyle = lit; c.lineWidth = Math.max(1, w * 0.3); c.beginPath(); c.moveTo(x0 - w * 0.2, y0 - w * 0.15); c.lineTo(x1 - w * 0.2, y1 - w * 0.15); c.stroke();
};
export const hand = (c: Ctx, x: number, y: number, fist = false) => {
  fill(c, SKIN[2], () => c.arc(x, y, fist ? 4.2 : 3.8, 0, Math.PI * 2), 1.2);
  rect(c, x - 2, y - 2.5, 2, 2, SKIN[3]);
  if (!fist) { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 2, y - 3); c.lineTo(x + 5, y - 6); c.moveTo(x + 3, y - 1); c.lineTo(x + 6, y - 3); c.stroke(); }
};

/** The emergency jetpack (behind him): two tanks, straps, the nozzles; flames when `burn`. */
const jetpack = (c: Ctx, f: number, burn: boolean) => {
  for (const dx of [-17, -9]) {
    fill(c, GRAY[1], () => { c.roundRect(dx - 4, -66, 9, 30, 4); });
    rect(c, dx - 3, -64, 2, 26, GRAY[3]); rect(c, dx + 2, -64, 2, 26, GRAY[0]);
    rect(c, dx - 4, -58, 9, 2, '#DC2626');
    fill(c, '#3F3F46', () => { c.moveTo(dx - 3, -36); c.lineTo(dx + 4, -36); c.lineTo(dx + 5, -31); c.lineTo(dx - 4, -31); c.closePath(); }, 1);
    if (burn) {
      const l = 12 + ((f >> 1) % 3) * 4;
      c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(dx - 5, -31); c.lineTo(dx + 0.5, -31 + l + 6); c.lineTo(dx + 6, -31); c.fill();
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(dx - 4, -31); c.lineTo(dx + 0.5, -31 + l); c.lineTo(dx + 5, -31); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.moveTo(dx - 2, -31); c.lineTo(dx + 0.5, -31 + l * 0.6); c.lineTo(dx + 3, -31); c.fill();
      c.fillStyle = '#FFFFFF'; c.fillRect(dx - 1, -31, 3, 3);
    }
  }
};

/** The ride's remote (the one that runs the landmarks): a black brick, a long antenna, a big red button, its light. */
const remoteAt = (c: Ctx, x: number, y: number, f: number, keyed: boolean) => {
  fill(c, '#27272A', () => c.roundRect(x - 4, y - 9, 9, 13, 2), 1.1);
  rect(c, x - 3, y - 8, 7, 2, '#52525B');
  fill(c, keyed && (f >> 2) % 2 ? '#EF4444' : '#991B1B', () => c.arc(x + 0.5, y - 2, 2.2, 0, Math.PI * 2), 0.8);
  c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 3, y - 9); c.lineTo(x + 7, y - 26); c.stroke();
  fill(c, keyed && (f >> 3) % 2 ? '#FDE047' : '#A1A1AA', () => c.arc(x + 7, y - 27, 2, 0, Math.PI * 2), 0.8);
  if (keyed) { c.strokeStyle = 'rgba(253,224,71,0.8)'; c.lineWidth = 1.2; const k = (f % 12) / 12; c.beginPath(); c.arc(x + 7, y - 27, 4 + k * 10, -2.4, -0.7); c.stroke(); }
};

/** The rocket launcher on his shoulder (a fat olive tube, a sight, a grip), pointing right; a rocket's nose in it. */
const launcher = (c: Ctx, firing: boolean) => {
  fill(c, '#4D5B2A', () => c.rect(-26, -64, 60, 11));
  rect(c, -26, -63, 60, 3, '#6B7E3A'); rect(c, -26, -56, 60, 2, '#323C1A');
  rect(c, -28, -66, 6, 15, INK); rect(c, 30, -66, 6, 15, INK);
  fill(c, '#18181B', () => c.rect(4, -71, 8, 7), 1);
  if (!firing) { fill(c, '#DC2626', () => { c.moveTo(34, -62); c.lineTo(41, -58.5); c.lineTo(34, -55); c.closePath(); }, 1); }
  else for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#FDE047' : '#F97316'; c.beginPath(); c.arc(40 + i * 5, -58.5 + (i % 2 ? 2 : -2), 7 - i, 0, Math.PI * 2); c.fill(); }
};

/** His head (the helmet, the ponytail, the glasses, the goatee, his face by his mood). `bandana`: the helmet off (job
 *  5's arena: the Rambo reveal), his gray hair swept back under a red bandana, its tails flying out behind; `green`
 *  (0..1): airsick. */
export const head = (c: Ctx, f: number, mad: boolean, talking: boolean, hx: number, hy: number, o: { bandana?: boolean; green?: number } = {}) => {
  // (the ponytail out the back of the helmet, swinging)
  const sw = Math.sin(f * 0.15) * 2;
  fill(c, GRAY[1], () => { c.moveTo(hx - 8, hy - 6); c.quadraticCurveTo(hx - 18, hy - 2 + sw, hx - 17, hy + 12 + sw); c.lineTo(hx - 13, hy + 13 + sw); c.quadraticCurveTo(hx - 12, hy, hx - 5, hy - 2); c.closePath(); }, 1.2);
  rect(c, hx - 14, hy + 2 + sw, 4, 2, '#DC2626');
  // (the face)
  const g = o.green ?? 0, sick = (col: string) => (g > 0 ? mixHex(col, '#84CC16', g * 0.55) : col);
  const skin = sick(mad ? '#E89A7A' : SKIN[2]);
  fill(c, skin, () => c.ellipse(hx + 1, hy, 10, 11, 0, 0, Math.PI * 2));
  rect(c, hx + 5, hy - 4, 4, 6, sick(mad ? '#F0B49A' : SKIN[3]));
  rect(c, hx - 8, hy + 2, 3, 6, SKIN[1]);
  // (an ear)
  fill(c, SKIN[1], () => c.ellipse(hx - 6, hy + 1, 2.5, 3.5, 0, 0, Math.PI * 2), 1);
  // (the goatee, gray, and the stubble)
  fill(c, GRAY[2], () => { c.moveTo(hx + 3, hy + 6); c.quadraticCurveTo(hx + 7, hy + 14, hx + 10, hy + 6); c.closePath(); }, 1);
  c.fillStyle = 'rgba(80,80,80,0.35)'; for (let i = 0; i < 6; i++) c.fillRect(hx - 2 + i * 2, hy + 5 + (i % 2), 1, 1);
  // (the mouth: the easy smile, or teeth bared, open when he's talking)
  const open = talking && (f >> 2) % 2 === 0;
  if (mad) {
    fill(c, '#7F1D1D', () => c.rect(hx + 2, hy + 4, 8, open ? 5 : 3), 1);
    rect(c, hx + 3, hy + 4, 6, 1.5, '#F8FAFC'); if (open) rect(c, hx + 3, hy + 7.5, 6, 1.2, '#F8FAFC');
  } else if (open) fill(c, '#7F1D1D', () => c.ellipse(hx + 6, hy + 5.5, 3.5, 2.5, 0, 0, Math.PI * 2), 1);
  else { c.strokeStyle = INK; c.lineWidth = 1.3; c.beginPath(); c.arc(hx + 6, hy + 2.5, 4, 0.3, Math.PI - 0.6); c.stroke(); }
  // (the glasses: round, amber tinted, a wire bridge)
  for (const gx of [hx + 2, hx + 9]) { fill(c, mad ? 'rgba(234, 88, 12, 0.85)' : 'rgba(245, 158, 11, 0.75)', () => c.arc(gx, hy - 2, 3.6, 0, Math.PI * 2), 1.1); rect(c, gx - 2, hy - 4, 1.5, 1.5, '#FEF3C7'); }
  c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + 5.6, hy - 2.5); c.lineTo(hx + 5.6, hy - 2.5); c.moveTo(hx - 1.6, hy - 2); c.lineTo(hx - 6, hy - 1); c.stroke();
  // (the brows: up and friendly, or down hard; a vein when he's mad)
  c.strokeStyle = GRAY[0]; c.lineWidth = 1.6; c.beginPath();
  if (mad) { c.moveTo(hx - 1, hy - 9); c.lineTo(hx + 4, hy - 6.5); c.moveTo(hx + 7, hy - 6.5); c.lineTo(hx + 12, hy - 9); }
  else { c.moveTo(hx - 1, hy - 8); c.quadraticCurveTo(hx + 2, hy - 10, hx + 4, hy - 8.5); c.moveTo(hx + 7, hy - 8.5); c.quadraticCurveTo(hx + 9, hy - 10, hx + 12, hy - 8); }
  c.stroke();
  if (mad) { c.strokeStyle = '#B91C1C'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(hx - 3, hy - 12); c.lineTo(hx - 1, hy - 9); c.lineTo(hx - 3, hy - 7); c.stroke(); }
  if (o.bandana) {
    // (gray hair swept back over the top, the red bandana tied round his forehead, the knot and its tails flying)
    fill(c, GRAY[1], () => { c.moveTo(hx - 10, hy - 4); c.quadraticCurveTo(hx - 11, hy - 15, hx + 1, hy - 14); c.quadraticCurveTo(hx + 11, hy - 14, hx + 11, hy - 8); c.lineTo(hx - 9, hy - 6); c.closePath(); }, 1.1);
    rect(c, hx - 6, hy - 13, 9, 2, GRAY[3]); rect(c, hx - 8, hy - 10, 3, 2, GRAY[2]);
    fill(c, '#B91C1C', () => { c.moveTo(hx - 10, hy - 9); c.lineTo(hx + 11, hy - 10); c.lineTo(hx + 11, hy - 6); c.lineTo(hx - 10, hy - 4); c.closePath(); }, 1.1);
    rect(c, hx - 8, hy - 9, 18, 1.5, '#EF4444'); rect(c, hx - 6, hy - 6, 2, 1, '#7F1D1D'); rect(c, hx + 2, hy - 7, 2, 1, '#7F1D1D');
    const fl = Math.sin(f * 0.3) * 3, fl2 = Math.sin(f * 0.3 + 1.3) * 3;
    fill(c, '#991B1B', () => c.ellipse(hx - 11, hy - 7, 2.6, 2.2, 0, 0, Math.PI * 2), 1);
    fill(c, '#B91C1C', () => { c.moveTo(hx - 12, hy - 8); c.quadraticCurveTo(hx - 20, hy - 9 + fl, hx - 25, hy - 6 + fl); c.lineTo(hx - 23, hy - 3 + fl); c.quadraticCurveTo(hx - 18, hy - 5 + fl, hx - 12, hy - 6); c.closePath(); }, 1);
    fill(c, '#991B1B', () => { c.moveTo(hx - 12, hy - 6); c.quadraticCurveTo(hx - 18, hy - 2 + fl2, hx - 22, hy + 2 + fl2); c.lineTo(hx - 19, hy + 3 + fl2); c.quadraticCurveTo(hx - 16, hy - 1 + fl2, hx - 11, hy - 5); c.closePath(); }, 1);
    return;
  }
  // (the helmet: white, the visor flipped up, the peace sign on its side)
  fill(c, '#F8FAFC', () => { c.moveTo(hx - 11, hy - 3); c.quadraticCurveTo(hx - 12, hy - 17, hx + 1, hy - 17); c.quadraticCurveTo(hx + 13, hy - 17, hx + 12, hy - 7); c.lineTo(hx - 11, hy - 6); c.closePath(); });
  rect(c, hx - 9, hy - 15, 6, 3, '#FFFFFF'); rect(c, hx + 5, hy - 10, 6, 3, '#CBD5E1');
  fill(c, '#1E3A8A', () => { c.moveTo(hx - 1, hy - 16); c.quadraticCurveTo(hx + 8, hy - 18, hx + 13, hy - 12); c.lineTo(hx + 10, hy - 11); c.quadraticCurveTo(hx + 6, hy - 14, hx - 1, hy - 13); c.closePath(); }, 1);
  c.strokeStyle = '#16A34A'; c.lineWidth = 1.3; c.beginPath(); c.arc(hx - 4, hy - 9, 3.6, 0, Math.PI * 2); c.moveTo(hx - 4, hy - 12.6); c.lineTo(hx - 4, hy - 5.4); c.moveTo(hx - 4, hy - 9); c.lineTo(hx - 6.5, hy - 6.4); c.moveTo(hx - 4, hy - 9); c.lineTo(hx - 1.5, hy - 6.4); c.stroke();
};

/** The tie-dye shirt: a rainbow spiral of bands, clipped to the torso. */
export const tieDye =(c: Ctx, path: () => void, cx: number, cy: number, f: number) => {
  c.save(); c.beginPath(); path(); c.clip();
  for (let r = 22, i = 0; r > 0; r -= 3.2, i++) { c.fillStyle = TIEDYE[(i + (f >> 5)) % TIEDYE.length]; c.beginPath(); c.ellipse(cx + Math.sin(i) * 1.5, cy + Math.cos(i) * 1.5, r, r * 0.9, 0.4, 0, Math.PI * 2); c.fill(); }
  c.restore();
  c.beginPath(); path(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
};

export const drawHarry = (c: Ctx, x: number, y: number, L: HarryLook) => {
  const { pose, f } = L, mad = !!L.mad;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale((L.facing ?? 1) * (L.scale ?? 1), L.scale ?? 1);
  if (L.rot) { c.translate(0, -42); c.rotate(L.rot); c.translate(0, 42); }
  // (flat on his back where he came down: legs in the air, kicking)
  if (pose === 'down') {
    c.rotate(-Math.PI / 2); c.translate(-6, 10);
  }
  const seated = pose === 'pilot';
  const air = pose === 'jet' || pose === 'aim' || pose === 'fire' || pose === 'gloat' || pose === 'fall' || pose === 'shoved';
  const bob = air ? Math.sin(f * 0.12) * 1.5 : 0;
  c.translate(0, bob);
  if (L.jetpack) jetpack(c, f, air || !!L.burn);
  const run = pose === 'run';
  const stride = run ? Math.sin(f * 0.45) : 0;
  // Legs (jeans; socks and sandals): stood, sat, dangling, kicking
  const kick = pose === 'fall' || pose === 'shoved' ? Math.sin(f * 0.5) * 8 : 0;
  const legs: [number, number, number, number][] = seated
    ? [[-2, -34, 16, -32], [4, -34, 22, -32]]
    : air ? [[-4, -34, -6 + kick, -4], [3, -34, 7 - kick, -6]]
    : run ? [[-4, -34, -4 + stride * 10, -3 - Math.max(0, stride) * 6], [4, -34, 5 - stride * 10, -3 - Math.max(0, -stride) * 6]]
    : [[-4, -34, -5, -3], [4, -34, 6, -3]];
  const shins: [number, number][] = seated ? [[16, -14], [22, -14]] : [];
  legs.forEach(([a, b, cx, cy], i) => {
    limb(c, a, b, cx, cy, 8, DENIM[i ? 2 : 1], DENIM[3]);
    if (seated) limb(c, cx, cy, shins[i][0], shins[i][1], 7, DENIM[i ? 2 : 1], DENIM[3]);
    const fx = seated ? shins[i][0] : cx, fy = seated ? shins[i][1] : cy;
    // (white socks, brown sandals)
    fill(c, '#F8FAFC', () => c.rect(fx - 3, fy - 1, 6, 4), 1);
    fill(c, '#92400E', () => c.rect(fx - 3, fy + 2, 10, 3), 1);
  });
  // (running: dust kicked up off the road behind him, in stepped puffs)
  if (run) for (let k = 0; k < 3; k++) {
    const ph = ((f * 0.9 + k * 9) % 27) / 27, x = -6 - ph * 20 - k * 3, y = -2 - ph * 8;
    c.globalAlpha = 0.55 * (1 - ph);
    c.fillStyle = '#8A7860'; c.beginPath(); c.arc(x + 1, y + 1, 3 + ph * 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8B898'; c.beginPath(); c.arc(x - 0.5, y - 0.5, 2 + ph * 4, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  // Torso: the tie-dye under the open jacket (the jacket a step darker down its shadow side)
  const tx = 0, ty = -34;
  const torso = () => { c.moveTo(tx - 9, ty); c.lineTo(tx + 9, ty); c.lineTo(tx + 11, ty - 26); c.lineTo(tx - 10, ty - 26); c.closePath(); };
  fill(c, JACKET[1], torso);
  c.save(); c.beginPath(); torso(); c.clip(); rect(c, tx + 6, ty - 27, 6, 28, JACKET[0]); rect(c, tx - 10, ty - 6, 21, 6, JACKET[0]); c.restore();
  c.beginPath(); torso(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
  tieDye(c, () => { c.moveTo(tx - 3, ty - 1); c.lineTo(tx + 8, ty - 1); c.lineTo(tx + 9, ty - 25); c.lineTo(tx - 2, ty - 25); c.closePath(); }, tx + 3, ty - 13, f);
  // (the jacket's open fronts, its lit edge, the fleece collar, a wings patch)
  fill(c, JACKET[2], () => { c.moveTo(tx - 10, ty - 26); c.lineTo(tx - 2, ty - 26); c.lineTo(tx - 3, ty); c.lineTo(tx - 9, ty); c.closePath(); });
  rect(c, tx - 9, ty - 24, 2, 22, JACKET[3]);
  fill(c, JACKET[2], () => { c.moveTo(tx + 8, ty - 26); c.lineTo(tx + 11, ty - 26); c.lineTo(tx + 9.5, ty); c.lineTo(tx + 8, ty); c.closePath(); }, 1);
  fill(c, '#E7D8B8', () => { c.moveTo(tx - 10, ty - 26); c.lineTo(tx - 2, ty - 26); c.lineTo(tx - 4, ty - 20); c.closePath(); }, 1);
  fill(c, '#E7D8B8', () => { c.moveTo(tx + 11, ty - 26); c.lineTo(tx + 6, ty - 26); c.lineTo(tx + 9, ty - 20); c.closePath(); }, 1);
  rect(c, tx - 8, ty - 16, 4, 2, '#FDE047');
  rect(c, tx - 10, ty - 1, 20, 2, '#3F2A1C');
  // Head
  head(c, f, mad, !!L.talking, tx + 1, ty - 37);
  // (yelling mad: steam blowing off the top of his head in stepped puffs (it reads from way up there))
  if (mad && L.talking && pose !== 'pilot') for (let k = 0; k < 2; k++) {
    const ph = ((f * 0.7 + k * 14) % 28) / 28, sx = tx + 1 + (k ? 9 : -9) + (k ? 1 : -1) * ph * 6, sy = ty - 55 - ph * 12;
    c.globalAlpha = 0.85 * (1 - ph);
    c.fillStyle = '#CBD5E1'; c.beginPath(); c.arc(sx + 0.8, sy + 0.8, 2.5 + ph * 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(sx - 0.5, sy - 0.5, 1.8 + ph * 3, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1;
  }
  // Arms: by pose
  const shX = tx - 4, shY = ty - 22, sh2X = tx + 6;
  const armTo = (sx: number, sy: number, ex: number, ey: number, hx: number, hy: number, fist = false) => {
    limb(c, sx, sy, ex, ey, 6.5, JACKET[1], JACKET[3]);
    limb(c, ex, ey, hx, hy, 6, JACKET[2], JACKET[3]);
    hand(c, hx, hy, fist);
  };
  if (L.launcher || pose === 'aim' || pose === 'fire') {
    // (tipped up about his shoulder: he's shooting up at the sky)
    c.save(); c.translate(tx + 4, ty - 26); c.rotate(-(L.aim ?? 0)); c.translate(-(tx + 4), -(ty - 26));
    armTo(shX, shY, shX - 2, shY + 10, tx + 6, ty - 26 + 2);
    launcher(c, pose === 'fire');
    armTo(sh2X, shY, sh2X + 8, shY + 6, tx + 16, ty - 26 + 1, true);
    c.restore();
  } else if (pose === 'remote') {
    // (the remote held up high at the landmark, keyed; the other fist shaking)
    const s = Math.sin(f * 0.5) * 3;
    armTo(shX, shY, shX - 3, shY + 12, tx - 6, ty - 4 + s, true);
    armTo(sh2X, shY, sh2X + 8, shY - 12, tx + 14, ty - 46, true);
    remoteAt(c, tx + 14, ty - 46, f, true);
  } else if (pose === 'run') {
    // (arms pumping, the remote in one hand)
    armTo(shX, shY, shX - 2 - stride * 6, shY + 10, tx - 4 - stride * 10, ty - 6, true);
    armTo(sh2X, shY, sh2X + 2 + stride * 6, shY + 10, tx + 10 + stride * 10, ty - 8, true);
    if (L.remote) remoteAt(c, tx + 12 + stride * 10, ty - 6, f, !!L.keyed);
  } else if (pose === 'down') {
    armTo(shX, shY, shX - 10, shY + 6, tx - 14, ty + 4);
    armTo(sh2X, shY, sh2X + 10, shY + 6, tx + 18, ty + 2);
  } else if (pose === 'pilot') {
    armTo(shX, shY, shX + 6, shY + 10, tx + 18, ty - 6, true);
    armTo(sh2X, shY, sh2X + 8, shY + 8, tx + 20, ty - 8, true);
  } else if (pose === 'wave') {
    const w = Math.sin(f * 0.25) * 5;
    armTo(shX, shY, shX - 3, shY + 12, tx - 4, ty - 2);
    armTo(sh2X, shY, sh2X + 9, shY - 9, tx + 13 + w, ty - 44, false);
  } else if (pose === 'fall' || pose === 'shoved') {
    const w = Math.sin(f * 0.6) * 10;
    armTo(shX, shY, shX - 9, shY - 8, tx - 12 + w * 0.3, ty - 40 - w);
    armTo(sh2X, shY, sh2X + 9, shY - 8, tx + 16 - w * 0.3, ty - 40 + w);
  } else if (pose === 'jet' || pose === 'gloat') {
    // (shaking his fist at him, the other hand on the jetpack's throttle)
    const s = pose === 'gloat' ? Math.sin(f * 0.4) * 4 : Math.sin(f * 0.7) * 3;
    armTo(shX, shY, shX - 3, shY + 12, tx - 6, ty - 4, true);
    armTo(sh2X, shY, sh2X + 10, shY - 4, tx + 18, ty - 34 + s, true);
    if (pose === 'gloat') { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + 18, ty - 38 + s); c.lineTo(tx + 18, ty - 46 + s); c.stroke(); }
  } else {
    armTo(shX, shY, shX - 3, shY + 12, tx - 5, ty - 2);
    armTo(sh2X, shY, sh2X + 3, shY + 12, tx + 9, ty - 2);
  }
  c.restore();
};
