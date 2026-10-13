// The orbit's look, crude (the first pass: flat shapes, readable silhouettes): space and the Earth under it, the top of
// Space Needle 2 he came out of, and Zorblax's people in their ships (his species: olive-grey hide, a tiny cranium on
// a cinder block of a jaw with an under-bite, yellow peg teeth jutting up, beady yellow eyes, purple veins; their
// laser pink, as his was: scenes/alienLook.ts's colors). Kinds are drawn at their feet (bottom middle), facing right.

import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { W, H } from './geo';

type Ctx = CanvasRenderingContext2D;

const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const disc = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };

export const HIDE = ALIEN.hide, BELLY = ALIEN.belly, LASER = ALIEN.laser, TEETH = ALIEN.teeth;
const STEEL = ['#16181D', '#2B3039', '#454C58', '#68717F', '#97A1AE', '#CDD5DE'];
const HULL = ['#1B2420', '#2A3830', '#3E5244', '#587060', '#7E9886', '#B4C8B8'];

/**
 * One of Zorblax's people, the head and the neck: its chin's bottom middle at (x, y), facing right, `s` its size (1:
 * about 24 px tall). `female`: a bow, lashes, lipstick on the cinder block. `open`: the mouth hanging open (yelling).
 */
export const alienHead = (c: Ctx, x: number, y: number, s: number, female = false, open = false, flash = false) => {
  const P = (dx: number, dy: number, w: number, h: number, col: string) => R(c, x + dx * s, y + dy * s, w * s, h * s, flash ? '#FFFFFF' : col);
  // (the neck, wider than the head)
  P(-11, -5, 20, 6, HIDE[3]);
  // (the jaw: a block, jutting forward; pale under it)
  P(-8, -15, 19, 12, HIDE[5]);
  P(-6, -5, 16, 2, BELLY[3]);
  P(-8, -15, 19, 2, HIDE[6]);
  // (the mouth: a slot, or hanging open)
  if (open) { P(-1, -10, 12, 6, ALIEN.mouth); P(0, -6, 10, 2, ALIEN.gum); }
  else P(-1, -9, 12, 2, female ? '#DC2626' : ALIEN.mouth);
  // (the pegs of teeth, up out of the under-bite over the top lip)
  for (const tx of [1, 5, 9]) P(tx, open ? -12 : -12, 2, 3, TEETH[3]);
  // (the little cranium, perched on the back of it; a vein)
  P(-7, -23, 10, 9, HIDE[6]);
  P(-6, -23, 6, 2, HIDE[7]);
  P(-4, -21, 1, 6, ALIEN.vein);
  // (the beady eye: yellow, a pinprick, red round it)
  P(1, -19, 4, 4, ALIEN.eyeRim);
  P(2, -18, 2, 2, ALIEN.sclera);
  P(3, -18, 1, 1, ALIEN.pupil);
  if (female) {
    P(0, -20, 6, 1, '#0A0A0A');
    // (a big pink bow on top)
    P(-10, -27, 5, 4, '#EC4899'); P(-5, -26, 3, 3, '#BE185D'); P(-2, -27, 5, 4, '#EC4899');
  }
};

/** A fighter: a little saucer, a glass bubble on it and the pilot in that. 56 x 30. */
export const drawFighter = (c: Ctx, f: number, female: boolean, open: boolean, flash: boolean, armed: boolean) => {
  const S = flash ? STEEL.map(() => '#FFFFFF') : STEEL;
  // (the glass bubble, the pilot in it)
  disc(c, 2, -21, 13, 13, 'rgba(125, 211, 252, 0.22)');
  alienHead(c, 3, -12, 0.62, female, open, flash);
  c.strokeStyle = 'rgba(224, 242, 254, 0.7)'; c.lineWidth = 1; c.beginPath(); c.arc(2, -21, 13, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  // (the saucer: its top, the rim with its lights, the underside)
  disc(c, 0, -12, 24, 5, S[3]);
  disc(c, 0, -9, 28, 5, S[2]);
  R(c, -28, -10, 56, 2, S[4]);
  for (let i = 0; i < 5; i++) R(c, -22 + i * 10, -9, 3, 2, (f >> 3) % 5 === i ? LASER[6] : LASER[3]);
  disc(c, 0, -5, 16, 4, S[1]);
  // (the gun under its front, and the engine's glow behind)
  if (armed) R(c, 18, -6, 10, 3, S[0]);
  R(c, -31, -11, 3, 4, f % 4 < 2 ? LASER[4] : LASER[5]);
};

/** A kamikaze: one of them hugging a rocket, nose first. 64 x 28. */
export const drawKamikaze = (c: Ctx, f: number, female: boolean, flash: boolean, lit: boolean) => {
  const F = flash ? '#FFFFFF' : null;
  // (the flame out the back, when it's going)
  if (lit) {
    const L = 14 + (f % 3) * 5;
    R(c, -30 - L, -12, L, 6, '#F97316'); R(c, -30 - L * 0.6, -11, L * 0.6, 4, '#FDE047');
  }
  // (the rocket: white, red bands, a red nose, fins)
  R(c, -28, -14, 46, 10, F ?? '#D4D4D8'); R(c, -28, -14, 46, 3, F ?? '#F4F4F5');
  R(c, -12, -14, 4, 10, F ?? '#DC2626'); R(c, 4, -14, 4, 10, F ?? '#DC2626');
  c.fillStyle = F ?? '#B91C1C'; c.beginPath(); c.moveTo(18, -14); c.lineTo(30, -9); c.lineTo(18, -4); c.fill();
  R(c, -30, -19, 6, 5, F ?? '#71717A'); R(c, -30, -4, 6, 5, F ?? '#71717A');
  // (him on it, hunched, arms round it)
  R(c, -14, -26, 14, 12, F ?? HIDE[4]); R(c, -2, -20, 10, 4, F ?? HIDE[5]);
  alienHead(c, 2, -22, 0.6, female, true, flash);
};

/** A turret pod (bolted onto a piece of junk): a dome, its gun turned to `aim` (radians, 0 dead ahead to the right),
 *  a little window with one of them in it. 40 x 32. */
export const drawTurret = (c: Ctx, aim: number, female: boolean, flash: boolean, heat: number) => {
  const S = flash ? STEEL.map(() => '#FFFFFF') : STEEL;
  // (the gun)
  c.save(); c.translate(0, -18); c.rotate(aim);
  R(c, 0, -3, 30, 6, S[1]); R(c, 0, -3, 30, 2, S[3]); R(c, 26, -4, 6, 8, heat > 0 ? LASER[5] : S[0]);
  c.restore();
  // (the base and the dome)
  R(c, -20, -8, 40, 8, S[2]); R(c, -20, -8, 40, 2, S[4]);
  disc(c, 0, -14, 16, 12, S[3]);
  disc(c, -3, -18, 9, 6, S[4]);
  // (the window: one of them looking out)
  R(c, -8, -21, 14, 9, '#0B1220');
  c.save(); c.beginPath(); c.rect(-8, -21, 14, 9); c.clip(); alienHead(c, -1, -10, 0.45, female, false, flash); c.restore();
};

/** A space mine: a ball with spikes, its light blinking (fast, armed). 30 x 30. */
export const drawMine = (c: Ctx, f: number, armed: number, flash: boolean) => {
  const cy = -15;
  c.strokeStyle = flash ? '#FFFFFF' : STEEL[3]; c.lineWidth = 3;
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; c.beginPath(); c.moveTo(Math.cos(a) * 8, cy + Math.sin(a) * 8); c.lineTo(Math.cos(a) * 15, cy + Math.sin(a) * 15); c.stroke(); }
  disc(c, 0, cy, 11, 11, flash ? '#FFFFFF' : STEEL[1]);
  disc(c, -3, cy - 3, 5, 5, STEEL[2]);
  const blink = armed > 0 ? f % 6 < 3 : f % 40 < 6;
  disc(c, 0, cy, 3, 3, blink ? '#EF4444' : '#450A0A');
  if (armed > 0 && blink) { c.globalAlpha = 0.35; disc(c, 0, cy, 26, 26, '#EF4444'); c.globalAlpha = 1; }
};

/** A cruiser: a long gunship, the beam's emitter in its nose, its bridge's bubble on top with the pilot in it. 180 x 58. */
export const drawCruiser = (c: Ctx, f: number, female: boolean, flash: boolean, charge: number) => {
  const K = flash ? HULL.map(() => '#FFFFFF') : HULL;
  // (the bridge bubble)
  disc(c, -20, -44, 18, 14, 'rgba(125, 211, 252, 0.22)');
  alienHead(c, -18, -33, 0.75, female, charge > 0.5, flash);
  // (the hull: a long wedge, its belly, the fins)
  c.fillStyle = K[2]; c.beginPath(); c.moveTo(-90, -40); c.lineTo(60, -38); c.lineTo(92, -24); c.lineTo(60, -10); c.lineTo(-90, -8); c.closePath(); c.fill();
  R(c, -88, -40, 146, 4, K[4]);
  R(c, -86, -14, 140, 6, K[1]);
  c.fillStyle = K[1]; c.beginPath(); c.moveTo(-90, -40); c.lineTo(-70, -40); c.lineTo(-96, -58); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-90, -8); c.lineTo(-70, -8); c.lineTo(-96, 0); c.closePath(); c.fill();
  for (let i = 0; i < 6; i++) R(c, -70 + i * 20, -30, 8, 4, (f >> 3) % 6 === i ? LASER[5] : K[0]);
  // (the engines behind)
  R(c, -98, -36, 8, 10, f % 4 < 2 ? LASER[4] : LASER[3]); R(c, -98, -20, 8, 8, f % 4 < 2 ? LASER[3] : LASER[4]);
  // (the emitter in the nose: glowing up as it charges)
  disc(c, 86, -24, 7, 7, STEEL[1]);
  if (charge > 0) { c.globalAlpha = Math.min(1, charge); disc(c, 88, -24, 5 + charge * 8, 5 + charge * 8, LASER[4]); disc(c, 88, -24, 3 + charge * 4, 3 + charge * 4, LASER[6]); c.globalAlpha = 1; }
};

/** A beam out of a nose at (x, y), `len` long to the right: a thin aiming line (`warn`) or the beam itself (`k` its
 *  width, 0..1). Drawn facing right, in the kind's own drawing (the engine turns it round with it). */
export const drawBeam = (c: Ctx, x: number, y: number, len: number, f: number, warn: boolean, k = 1) => {
  if (warn) {
    if (f % 6 < 4) R(c, x, y - 1, len, 2, 'rgba(255, 140, 228, 0.7)');
    return;
  }
  const w = 10 + 16 * k + (f % 3);
  R(c, x, y - w / 2 - 4, len, w + 8, 'rgba(236, 68, 196, 0.28)');
  R(c, x, y - w / 2, len, w, LASER[4]);
  R(c, x, y - w / 4, len, w / 2, LASER[5]);
  R(c, x, y - 2, len, 4, LASER[6]);
};

/** The flying saucer: a big classic one, its dome tinted so nobody sees in. 260 x 96. `red`: pissed (0..1). */
export const drawSaucer = (c: Ctx, f: number, flash: boolean, red: number, open: number) => {
  const S = flash ? STEEL.map(() => '#FFFFFF') : STEEL;
  // (the dome: dark mirrored glass, a glare across it)
  disc(c, 0, -58, 62, 38, flash ? '#FFFFFF' : '#1E1B4B');
  disc(c, -8, -64, 50, 28, flash ? '#FFFFFF' : '#312E81');
  c.strokeStyle = 'rgba(255, 255, 255, 0.35)'; c.lineWidth = 4; c.beginPath(); c.arc(0, -58, 52, Math.PI * 1.15, Math.PI * 1.45); c.stroke();
  // (the body: top deck, the rim and its lights going round, the underside)
  disc(c, 0, -36, 110, 16, S[3]);
  disc(c, 0, -32, 128, 14, S[2]);
  R(c, -128, -34, 256, 3, S[4]);
  for (let i = 0; i < 12; i++) {
    const lit = (i + (f >> 2)) % 4 === 0;
    const col = red > 0.5 ? (lit ? '#FCA5A5' : '#B91C1C') : lit ? LASER[6] : LASER[3];
    R(c, -112 + i * 20, -30, 8, 4, col);
  }
  disc(c, 0, -20, 84, 12, S[1]);
  // (the beam hatch underneath: shut, or opening)
  disc(c, 0, -12, 26, 6, S[0]);
  if (open > 0) disc(c, 0, -12, 24 * open, 5 * open, '#FEF9C3');
  // (pissed: red all over it, pulsing)
  if (red > 0) { c.globalAlpha = red * (0.25 + 0.15 * Math.sin(f * 0.3)); disc(c, 0, -36, 132, 30, '#EF4444'); c.globalAlpha = 1; }
};

/** A rock, round-ish and lumpy (`seed` picks its lumps), radius r, turned `rot`, at its middle. */
export const drawRock = (c: Ctx, x: number, y: number, r: number, rot: number, seed: number, flash: boolean) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = flash ? '#FFFFFF' : '#57534E';
  c.beginPath();
  for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9, k = 0.78 + 0.22 * Math.abs(Math.sin(seed * 7.3 + i * 2.1)); c.lineTo(Math.cos(a) * r * k, Math.sin(a) * r * k); }
  c.closePath(); c.fill();
  c.fillStyle = flash ? '#FFFFFF' : '#78716C'; c.beginPath(); c.arc(-r * 0.2, -r * 0.25, r * 0.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#44403C'; c.beginPath(); c.arc(r * 0.3, r * 0.2, r * 0.18, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(-r * 0.35, r * 0.35, r * 0.12, 0, Math.PI * 2); c.fill();
  c.restore();
};

/** A piece of space junk: `what` 0 an old satellite, 1 a busted fuel tank, 2 a porta-potty (somebody's). At its middle. */
export const drawJunk = (c: Ctx, x: number, y: number, w: number, h: number, rot: number, what: number) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (what === 0) {
    R(c, -w * 0.18, -h / 2, w * 0.36, h, '#A1A1AA'); R(c, -w * 0.18, -h / 2, w * 0.36, 4, '#E4E4E7');
    R(c, -w / 2, -h * 0.16, w * 0.3, h * 0.32, '#1E3A8A'); R(c, w * 0.2, -h * 0.16, w * 0.3, h * 0.32, '#1E3A8A');
    for (let i = 0; i < 3; i++) { R(c, -w / 2 + i * w * 0.1, -h * 0.16, 1, h * 0.32, '#60A5FA'); R(c, w * 0.2 + i * w * 0.1, -h * 0.16, 1, h * 0.32, '#60A5FA'); }
    R(c, -2, -h / 2 - 14, 4, 14, '#71717A'); disc(c, 0, -h / 2 - 16, 8, 4, '#D4D4D8');
    // (somebody's flag, a little faded)
    R(c, -w * 0.12, -h * 0.3, 14, 9, '#F5F5F4'); R(c, -w * 0.12, -h * 0.3, 6, 5, '#1D4ED8'); R(c, -w * 0.12 + 6, -h * 0.3 + 1, 8, 1, '#DC2626'); R(c, -w * 0.12, -h * 0.3 + 6, 14, 1, '#DC2626');
  } else if (what === 1) {
    disc(c, 0, 0, w / 2, h / 2, '#C2410C'); disc(c, -w * 0.1, -h * 0.12, w * 0.36, h * 0.28, '#EA580C');
    R(c, -w / 2 + 6, -2, w - 12, 4, '#7C2D12');
    c.fillStyle = '#0A0A0A'; c.beginPath(); c.moveTo(w * 0.2, -h * 0.1); c.lineTo(w * 0.35, 0); c.lineTo(w * 0.22, h * 0.15); c.closePath(); c.fill();
  } else {
    R(c, -w / 2, -h / 2, w, h, '#1D4ED8'); R(c, -w / 2, -h / 2, w, 6, '#3B82F6'); R(c, -w / 2, -h / 2 - 6, w, 8, '#1E3A8A');
    R(c, -w * 0.28, -h * 0.3, w * 0.56, h * 0.75, '#1E40AF'); R(c, w * 0.12, -h * 0.05, 4, 8, '#E5E7EB');
    // (the moon on the door)
    disc(c, 0, -h * 0.18, 5, 5, '#FDE047'); disc(c, 2, -h * 0.2, 4, 4, '#1E40AF');
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Space (screen space): black, three depths of stars going by at their own pace, the moon, the Earth's curve under it

const STARS: { x: number; y: number; d: number; b: number }[] = [];
for (let i = 0; i < 170; i++) STARS.push({ x: (i * 397.13) % W, y: (i * 151.7 + (i % 7) * 37) % 470, d: i % 3, b: i % 9 });
const CONT = [
  { x: 0, y: 40, w: 340, h: 70 }, { x: 520, y: 18, w: 220, h: 50 }, { x: 900, y: 60, w: 400, h: 90 }, { x: 1450, y: 30, w: 260, h: 60 },
  { x: 1850, y: 80, w: 320, h: 70 },
];
const CONT_SPAN = 2300;

export const drawSpace = (c: Ctx, camX: number, f: number, earthY = 470) => {
  // (black, a little blue toward the Earth: bands)
  const bands = ['#02030A', '#03040E', '#040613', '#060918', '#080D1F', '#0B1228'];
  for (let i = 0; i < bands.length; i++) R(c, 0, i * (H / bands.length), W, H / bands.length + 1, bands[i]);
  // (the stars: the far ones barely move, the near ones go by)
  for (const s of STARS) {
    const k = [0.02, 0.06, 0.14][s.d];
    const x = ((s.x - camX * k) % W + W) % W;
    const tw = s.b === 0 && (f + s.x) % 90 < 8;
    R(c, x, s.y, s.d === 2 ? 2 : 1, s.d === 2 ? 2 : 1, tw ? '#FFFFFF' : s.d === 0 ? '#475569' : s.d === 1 ? '#94A3B8' : '#E2E8F0');
  }
  // (the moon, way off)
  const mx = 660 - camX * 0.01 % 200;
  disc(c, mx, 96, 24, 24, '#CBD5E1'); disc(c, mx + 5, 92, 20, 20, '#E2E8F0');
  disc(c, mx - 6, 100, 5, 4, '#94A3B8'); disc(c, mx + 8, 104, 3, 3, '#94A3B8'); disc(c, mx + 2, 86, 4, 3, '#CBD5E1');
  // (the Earth: a huge curve along the bottom, its glow, the oceans, the land going by under, the clouds)
  const ex = W / 2, er = 1700, ey = earthY + er;
  c.globalAlpha = 0.25; disc(c, ex, ey, er + 18, er + 18, '#38BDF8'); c.globalAlpha = 0.4; disc(c, ex, ey, er + 7, er + 7, '#7DD3FC'); c.globalAlpha = 1;
  disc(c, ex, ey, er, er, '#1D4ED8');
  c.save(); c.beginPath(); c.ellipse(ex, ey, er, er, 0, 0, Math.PI * 2); c.clip();
  R(c, 0, earthY + 8, W, 30, '#1E40AF'); R(c, 0, earthY + 38, W, 200, '#1E3A8A');
  const off = (camX * 0.035) % CONT_SPAN;
  for (const k of [-1, 0, 1]) for (const ct of CONT) {
    const x = ct.x - off + k * CONT_SPAN;
    if (x > W || x + ct.w < 0) continue;
    disc(c, x + ct.w / 2, earthY + ct.y, ct.w / 2, ct.h / 2, '#15803D');
    disc(c, x + ct.w * 0.4, earthY + ct.y - ct.h * 0.1, ct.w * 0.28, ct.h * 0.3, '#A16207');
  }
  const coff = (camX * 0.05 + f * 0.05) % 900;
  for (let i = 0; i < 5; i++) { const x = ((i * 230 - coff) % 1100 + 1100) % 1100 - 150; disc(c, x, earthY + 30 + (i % 3) * 22, 70, 9, 'rgba(255,255,255,0.75)'); }
  c.restore();
};

/** The top of Space Needle 2, where he came out: its saucer of a deck, the spire, the shaft down to the Earth, the
 *  window on its right busted out. World space, its deck's middle at (x, y). */
export const drawNeedleTop = (c: Ctx, x: number, y: number) => {
  R(c, x - 14, y + 30, 28, 900, '#CBD5E1'); R(c, x - 14, y + 30, 6, 900, '#F1F5F9'); R(c, x + 8, y + 30, 6, 900, '#94A3B8');
  R(c, x - 3, y - 170, 6, 120, '#E2E8F0'); disc(c, x, y - 172, 5, 5, '#EF4444');
  disc(c, x, y - 40, 110, 22, '#F8FAFC'); disc(c, x, y - 34, 112, 14, '#CBD5E1');
  disc(c, x, y + 4, 140, 30, '#E2E8F0'); disc(c, x, y + 14, 120, 18, '#94A3B8');
  R(c, x - 120, y - 24, 240, 26, '#0F172A');
  for (let i = 0; i < 8; i++) R(c, x - 116 + i * 30, y - 22, 24, 22, '#1E293B');
  // (his window: smashed out, the edges of the glass left)
  R(c, x + 92, y - 24, 30, 26, '#000000');
  c.fillStyle = '#BAE6FD'; c.beginPath(); c.moveTo(x + 92, y - 24); c.lineTo(x + 104, y - 24); c.lineTo(x + 94, y - 10); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x + 122, y + 2); c.lineTo(x + 110, y + 2); c.lineTo(x + 121, y - 12); c.closePath(); c.fill();
  // (the sign on its rim)
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#1E293B'; c.fillText('SPACE NEEDLE 2', x, y + 22); c.textAlign = 'left';
};
