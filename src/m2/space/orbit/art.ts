// The orbit's look, SNES style: space (banded, a nebula through it, stars at three depths, the moon) over the lit
// Earth (needle/sky.ts paints both, the same Earth and the same sky the deck looks out on), the top of Space Needle 2
// he came out of, and Zorblax's people in their ships (his species: olive-grey hide, a tiny cranium on a cinder block
// of a jaw with an under-bite, yellow peg teeth jutting up, beady yellow eyes, purple veins; their laser pink, as his
// was: scenes/alienLook.ts's colors). Every hull a stepped ramp lit from the upper left, inked, the steps dithered
// where they meet. Kinds are drawn at their feet (bottom middle), facing right; their still parts (hulls, bubbles,
// the pilots in them) go down from stamps, what moves (lights, flames, the guns) is drawn live over them.

import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { stamp, checker } from '../../intro/art/kit';
import { steppedGlow } from '../../../m1/game/render/pixelArt';
import { spaceBands, drawNebula, drawStars, drawMoonDisc, drawEarth, hash } from '../needle/sky';
import { W } from './geo';
import { lettering } from '../square/lettering';

type Ctx = CanvasRenderingContext2D;

const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const disc = (c: Ctx, x: number, y: number, rx: number, ry: number, col: string) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.fill(); };
const poly = (c: Ctx, pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };

export const HIDE = ALIEN.hide, BELLY = ALIEN.belly, LASER = ALIEN.laser, TEETH = ALIEN.teeth;
const INK = '#08090F';
/** Gunmetal (the fighters, the turrets, the mines), darkest first. */
const STEEL = ['#121419', '#22262E', '#363C48', '#4E5664', '#6C7686', '#929CAC', '#BCC4D0', '#E6EAF0'];
/** The cruisers' hull: a sick green-grey, theirs. */
const HULL = ['#121A16', '#1E2A24', '#2C3C32', '#3E5244', '#566C5A', '#748C76', '#9AB09A', '#C8D8C4'];
const WHITE = (n: number) => Array.from({ length: n }, () => '#FFFFFF');

/**
 * A ball in steps: inked, its darkest tone all over, then each lighter one smaller and pulled up to the upper left,
 * a checker of each just outside it (the steps dithered), a glint. `ramp` darkest first (5+ tones).
 */
const sphere = (c: Ctx, x: number, y: number, rx: number, ry: number, ramp: readonly string[], inked = true) => {
  if (inked) disc(c, x, y, rx + 1, ry + 1, INK);
  disc(c, x, y, rx, ry, ramp[0]);
  const n = ramp.length;
  for (let i = 1; i < n; i++) {
    const k = 1 - (i / n) * 0.82, ox = -rx * (1 - k) * 0.55, oy = -ry * (1 - k) * 0.6;
    c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.clip();
    c.beginPath(); c.ellipse(x + ox, y + oy, rx * k * 1.1, ry * k * 1.1, 0, 0, Math.PI * 2); c.clip();
    checker(c, x - rx - 2, y - ry - 2, rx * 2 + 4, ry * 2 + 4, ramp[i], i % 2);
    c.restore();
    disc(c, x + ox, y + oy, rx * k, ry * k, ramp[i]);
  }
};
/** A flat band across a shape (already clipped), top to bottom through `ramp` (lightest first), each seam dithered. */
const bandsIn = (c: Ctx, x: number, y: number, w: number, h: number, ramp: readonly string[]) => {
  const n = ramp.length, bh = h / n;
  for (let i = 0; i < n; i++) R(c, x, y + i * bh, w, Math.ceil(bh) + 1, ramp[i]);
  for (let i = 1; i < n; i++) checker(c, x, Math.round(y + i * bh) - 2, w, 2, ramp[i], 0);
};

/**
 * One of Zorblax's people, the head and the neck: its chin's bottom middle at (x, y), facing right, `s` its size (1:
 * about 24 px tall). `female`: a bow, lashes, lipstick on the cinder block. `open`: the mouth hanging open (yelling).
 */
export const alienHead = (c: Ctx, x: number, y: number, s: number, female = false, open = false, flash = false) => {
  const P = (dx: number, dy: number, w: number, h: number, col: string) => R(c, x + dx * s, y + dy * s, w * s, h * s, flash ? '#FFFFFF' : col);
  // (the ink round it all first: the neck, the jaw, the cranium)
  P(-12, -6, 22, 8, INK); P(-9, -16, 21, 14, INK); P(-8, -24, 12, 11, INK);
  // (the neck, wider than the head; lit down its left)
  P(-11, -5, 20, 6, HIDE[3]); P(-11, -5, 6, 6, HIDE[4]); P(4, -5, 5, 6, HIDE[2]);
  // (the jaw: a block, jutting forward, stepped from its lit top to the pale under it)
  P(-8, -15, 19, 12, HIDE[5]);
  P(-8, -15, 19, 3, HIDE[6]); P(-8, -15, 4, 12, HIDE[6]); P(-8, -15, 19, 1, HIDE[7]);
  P(6, -12, 5, 9, HIDE[4]);
  P(-6, -5, 16, 2, BELLY[3]); P(-6, -6, 16, 1, BELLY[4]);
  // (the mouth: a slot, or hanging open)
  if (open) { P(-1, -10, 12, 6, ALIEN.mouth); P(0, -6, 10, 2, ALIEN.gum); P(0, -10, 10, 1, ALIEN.gumDark); }
  else P(-1, -9, 12, 2, female ? '#DC2626' : ALIEN.mouth);
  // (the pegs of teeth, up out of the under-bite over the top lip: lit tops, brown roots)
  for (const tx of [1, 5, 9]) { P(tx, -12, 2, 3, TEETH[3]); P(tx, -12, 1, 1, TEETH[4]); P(tx, -10, 2, 1, TEETH[1]); }
  // (the little cranium, perched on the back of it; a raised vein: lit along its top, a shadow under)
  P(-7, -23, 10, 9, HIDE[6]);
  P(-7, -23, 10, 2, HIDE[7]); P(-7, -23, 2, 9, HIDE[7]); P(1, -21, 2, 7, HIDE[5]);
  P(-4, -21, 1, 6, ALIEN.vein); P(-3, -21, 1, 6, ALIEN.veinShadow); P(-4, -21, 1, 1, ALIEN.veinLight);
  // (the beady eye: yellow, a pinprick, red round it, a glint)
  P(1, -19, 4, 4, ALIEN.eyeRim);
  P(2, -18, 2, 2, ALIEN.sclera);
  P(3, -18, 1, 1, ALIEN.pupil);
  if (female) {
    P(0, -20, 6, 1, '#0A0A0A');
    // (a big pink bow on top)
    P(-11, -28, 7, 6, INK); P(-3, -28, 7, 6, INK);
    P(-10, -27, 5, 4, '#EC4899'); P(-10, -27, 5, 1, '#F9A8D4'); P(-5, -26, 3, 3, '#BE185D'); P(-2, -27, 5, 4, '#EC4899'); P(-2, -27, 5, 1, '#F9A8D4');
  }
};

/** A glass bubble (a canopy) round a pilot: the glass tinted in bands, inked, a glare arc, a glint. */
const bubble = (c: Ctx, x: number, y: number, r: number, inside: () => void, flash: boolean) => {
  c.save(); c.beginPath(); c.arc(x, y, r, Math.PI, 0); c.lineTo(x + r, y + r * 0.35); c.lineTo(x - r, y + r * 0.35); c.closePath(); c.clip();
  if (!flash) { R(c, x - r, y - r, r * 2, r * 1.35, '#0E2238'); R(c, x - r, y - r * 0.2, r * 2, r * 0.55, '#16304A'); checker(c, x - r, y - r * 0.2 - 2, r * 2, 2, '#16304A', 0); }
  inside();
  // (the glass over him: its sheen in two steps)
  c.fillStyle = flash ? '#FFFFFF' : 'rgba(150, 220, 255, 0.16)'; c.fillRect(x - r, y - r, r * 2, r * 1.35);
  c.restore();
  c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, r + 0.5, Math.PI, 0); c.stroke();
  c.strokeStyle = flash ? '#FFFFFF' : '#CFEFFF'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r - 2.5, Math.PI * 1.1, Math.PI * 1.42); c.stroke();
  R(c, x + r * 0.35, y - r * 0.62, 2, 2, '#FFFFFF');
};

// ---------------------------------------------------------------------------------------------------------------
// Fighters: a little saucer, a glass bubble on it and the pilot in that. 56 x 30.

const paintFighter = (c: Ctx, female: boolean, flash: boolean, armed: boolean) => {
  const S = flash ? WHITE(8) : STEEL;
  // (the gun under its front)
  if (armed) { R(c, 14, -8, 16, 5, INK); R(c, 15, -7, 14, 3, S[2]); R(c, 15, -7, 14, 1, S[5]); R(c, 27, -8, 3, 5, S[1]); }
  // (the underside: dark, a hatch)
  disc(c, 0, -5, 18, 5, INK); disc(c, 0, -5, 17, 4, S[1]); disc(c, -3, -6, 12, 2, S[2]);
  // (the rim: inked, the deck stepped from its lit top-left round to the shade)
  disc(c, 0, -9, 29.5, 6.5, INK);
  disc(c, 0, -9, 28, 5, S[2]);
  disc(c, -1, -10, 26, 3.6, S[3]);
  c.save(); c.beginPath(); c.ellipse(0, -9, 28, 5, 0, 0, Math.PI * 2); c.clip(); checker(c, -28, -12, 56, 2, S[3], 1); c.restore();
  disc(c, -3, -11, 20, 2.4, S[4]);
  R(c, -26, -9, 52, 1, S[6]);
  R(c, -22, -8, 44, 1, S[1]);
  // (the top deck under the bubble: a collar)
  disc(c, 1, -13, 15, 3.5, INK); disc(c, 1, -13, 14, 2.6, S[3]); disc(c, -1, -14, 9, 1.4, S[5]);
  // (the bubble, the pilot in it)
  bubble(c, 2, -19, 12, () => alienHead(c, 3, -11, 0.6, female, false, flash), flash);
  // (the engine's bell behind)
  R(c, -33, -12, 6, 6, INK); R(c, -32, -11, 4, 4, S[2]); R(c, -32, -11, 4, 1, S[4]);
};
export const drawFighter = (c: Ctx, f: number, female: boolean, open: boolean, flash: boolean, armed: boolean) => {
  stamp(c, `orb-fighter-${+female}${+flash}${+armed}${+open}`, -36, -36, 72, 36, g => paintFighter(g, female, flash, armed));
  // (the rim's lights going round, the engine's glow behind: live)
  for (let i = 0; i < 5; i++) { const on = (f >> 3) % 5 === i; R(c, -22 + i * 10, -10, 4, 2, on ? LASER[6] : LASER[2]); if (on) R(c, -23 + i * 10, -11, 6, 1, LASER[4]); }
  const fl = f % 4 < 2;
  R(c, -38, -11, 5, 4, fl ? LASER[4] : LASER[3]); R(c, -36, -10, 3, 2, LASER[6]);
  if (fl) R(c, -41, -10, 3, 2, LASER[3]);
};

// ---------------------------------------------------------------------------------------------------------------
// Kamikazes: one of them hugging a rocket, nose first. 64 x 28.

const ROCKET = ['#6E7078', '#9A9CA6', '#C4C6CE', '#E4E6EA', '#FFFFFF'];
const RED = ['#4A0A0A', '#7A1212', '#B01C1C', '#DC3A2E', '#F47258'];
const paintKamikaze = (c: Ctx, female: boolean, flash: boolean) => {
  const K = flash ? WHITE(5) : ROCKET, Rd = flash ? WHITE(5) : RED;
  // (the fins: inked, shaded)
  poly(c, [-31, -20, -22, -14, -22, -12, -31, -12], INK); poly(c, [-30, -19, -23, -14, -30, -14], Rd[2]);
  poly(c, [-31, -2, -22, -6, -22, -4, -31, 0], INK); poly(c, [-30, -1, -23, -5, -30, -3], Rd[1]);
  // (the body: a cylinder, banded top (lit) to bottom; red bands round it)
  R(c, -29, -15, 48, 12, INK);
  c.save(); c.beginPath(); c.rect(-28, -14, 46, 10); c.clip();
  bandsIn(c, -28, -14, 46, 10, [K[4], K[3], K[2], K[2], K[1]]);
  for (const bx of [-12, 4]) { R(c, bx, -14, 4, 10, Rd[2]); R(c, bx, -14, 4, 2, Rd[4]); R(c, bx, -6, 4, 2, Rd[0]); }
  c.restore();
  // (the nose cone: red, lit along its top)
  poly(c, [18, -15, 31, -9, 18, -3], INK);
  poly(c, [18, -14, 29, -9, 18, -4], Rd[2]); poly(c, [18, -14, 29, -9, 18, -11], Rd[3]); R(c, 18, -13, 5, 1, Rd[4]);
  // (the nozzle)
  R(c, -32, -13, 4, 8, INK); R(c, -31, -12, 3, 6, flash ? '#FFFFFF' : '#3A3C44');
  // (him on it, hunched, arms round it: the back of him shaded, an arm over the rocket)
  R(c, -15, -27, 16, 14, INK);
  R(c, -14, -26, 14, 12, flash ? '#FFFFFF' : HIDE[4]); R(c, -14, -26, 14, 3, flash ? '#FFFFFF' : HIDE[5]); R(c, -14, -26, 3, 12, flash ? '#FFFFFF' : HIDE[6]); R(c, -4, -24, 4, 10, flash ? '#FFFFFF' : HIDE[3]);
  R(c, -3, -21, 12, 6, INK); R(c, -2, -20, 10, 4, flash ? '#FFFFFF' : HIDE[5]); R(c, -2, -20, 10, 1, flash ? '#FFFFFF' : HIDE[6]);
  R(c, 6, -20, 3, 4, flash ? '#FFFFFF' : ALIEN.claw[2]);
  alienHead(c, 2, -22, 0.6, female, true, flash);
};
export const drawKamikaze = (c: Ctx, f: number, female: boolean, flash: boolean, lit: boolean) => {
  // (the flame out the back, when it's going: stepped, flickering)
  if (lit) {
    const L = 14 + (f % 3) * 5;
    R(c, -32 - L, -13, L, 8, '#B91C1C'); R(c, -32 - L * 0.8, -12, L * 0.8, 6, '#F97316'); R(c, -32 - L * 0.55, -11, L * 0.55, 4, '#FDE047'); R(c, -32 - L * 0.25, -10, L * 0.25, 2, '#FFFFFF');
    if (f % 2) { R(c, -36 - L, -11, 3, 2, '#F97316'); R(c, -40 - L, -9, 2, 2, '#B91C1C'); }
  }
  stamp(c, `orb-kami-${+female}${+flash}`, -36, -34, 70, 36, g => paintKamikaze(g, female, flash));
};

// ---------------------------------------------------------------------------------------------------------------
// Turret pods (bolted onto a piece of junk): a dome, its gun turned to `aim`, a little window with one of them in it.

const paintTurret = (c: Ctx, female: boolean, flash: boolean) => {
  const S = flash ? WHITE(8) : STEEL;
  // (the base plate: inked, banded, rivets)
  R(c, -21, -9, 42, 10, INK);
  c.save(); c.beginPath(); c.rect(-20, -8, 40, 8); c.clip(); bandsIn(c, -20, -8, 40, 8, [S[5], S[4], S[3], S[2]]); c.restore();
  for (const rx of [-17, -9, 7, 15]) { R(c, rx, -6, 2, 2, S[6]); R(c, rx + 1, -5, 1, 1, INK); }
  // (the dome)
  sphere(c, 0, -14, 16, 12, flash ? WHITE(6) : [S[1], S[2], S[3], S[4], S[5], S[6]]);
  // (the window: one of them looking out)
  R(c, -9, -22, 16, 11, INK);
  R(c, -8, -21, 14, 9, flash ? '#FFFFFF' : '#0B1220');
  c.save(); c.beginPath(); c.rect(-8, -21, 14, 9); c.clip(); alienHead(c, -1, -10, 0.45, female, false, flash); c.restore();
  R(c, -8, -21, 14, 1, flash ? '#FFFFFF' : 'rgba(160, 220, 255, 0.5)'); R(c, 3, -20, 2, 2, 'rgba(255, 255, 255, 0.7)');
};
export const drawTurret = (c: Ctx, aim: number, female: boolean, flash: boolean, heat: number) => {
  const S = flash ? WHITE(8) : STEEL;
  // (the gun: a barrel in bands, its muzzle glowing when it's just fired)
  c.save(); c.translate(0, -18); c.rotate(aim);
  R(c, -1, -4, 32, 8, INK);
  R(c, 0, -3, 30, 6, S[2]); R(c, 0, -3, 30, 2, S[4]); R(c, 0, -3, 30, 1, S[6]); R(c, 0, 2, 30, 1, S[1]);
  for (const bx of [8, 16]) R(c, bx, -3, 2, 6, S[1]);
  R(c, 26, -5, 7, 10, INK); R(c, 27, -4, 5, 8, heat > 0 ? LASER[5] : S[3]); if (heat > 0) R(c, 28, -2, 3, 4, '#FFFFFF');
  c.restore();
  stamp(c, `orb-turret-${+female}${+flash}`, -24, -30, 48, 32, g => paintTurret(g, female, flash));
};

// ---------------------------------------------------------------------------------------------------------------
// Mines: a ball with spikes, its light blinking (fast, armed). 30 x 30.

const paintMine = (c: Ctx, flash: boolean) => {
  const cy = -15, S = flash ? WHITE(8) : STEEL;
  // (the spikes: inked, lit along one edge)
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + 0.2, ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    poly(c, [ca * 7 + px * 3.5, cy + sa * 7 + py * 3.5, ca * 16, cy + sa * 16, ca * 7 - px * 3.5, cy + sa * 7 - py * 3.5], INK);
    poly(c, [ca * 8 + px * 2.2, cy + sa * 8 + py * 2.2, ca * 14.5, cy + sa * 14.5, ca * 8 - px * 2.2, cy + sa * 8 - py * 2.2], S[3]);
    const lit = ca * -0.6 + sa * -0.8 > 0;
    poly(c, [ca * 8 + px * (lit ? 2.2 : -2.2), cy + sa * 8 + py * (lit ? 2.2 : -2.2), ca * 14.5, cy + sa * 14.5, ca * 8, cy + sa * 8], lit ? S[5] : S[2]);
    R(c, ca * 15 - 1, cy + sa * 15 - 1, 2, 2, S[6]);
  }
  sphere(c, 0, cy, 11, 11, flash ? WHITE(6) : [S[0], S[1], S[2], S[3], S[4], S[5]]);
  // (a band round its middle, and the lamp's socket)
  c.save(); c.beginPath(); c.arc(0, cy, 11, 0, Math.PI * 2); c.clip(); R(c, -11, cy + 1, 22, 2, INK); R(c, -11, cy + 3, 22, 1, S[4]); c.restore();
  disc(c, 0, cy, 4.5, 4.5, INK);
};
export const drawMine = (c: Ctx, f: number, armed: number, flash: boolean) => {
  const cy = -15;
  stamp(c, `orb-mine-${+flash}`, -18, -34, 36, 38, g => paintMine(g, flash));
  const blink = armed > 0 ? f % 6 < 3 : f % 40 < 6;
  disc(c, 0, cy, 3.4, 3.4, blink ? '#EF4444' : '#450A0A');
  if (blink) R(c, -1, cy - 2, 2, 1, '#FECACA');
  // (armed and blinking: a stepped red glow round it, so it reads as about to go)
  if (armed > 0 && blink) steppedGlow(c, 0, cy, 30, '#EF4444', 0.32, 0.06, 4);
};

// ---------------------------------------------------------------------------------------------------------------
// Cruisers: a long gunship, the beam's emitter in its nose, its bridge's bubble on top with the pilot in it. 180 x 58.

const paintCruiser = (c: Ctx, female: boolean, flash: boolean, open: boolean) => {
  const K = flash ? WHITE(8) : HULL;
  // (the fins, back: inked, shaded)
  poly(c, [-92, -40, -68, -40, -98, -60], INK); poly(c, [-90, -41, -71, -41, -95, -57], K[3]); poly(c, [-90, -41, -80, -41, -95, -57], K[5]);
  poly(c, [-92, -8, -68, -8, -98, 2], INK); poly(c, [-90, -7, -71, -7, -95, 0], K[1]);
  // (the bridge bubble, the pilot in it)
  bubble(c, -20, -42, 16, () => alienHead(c, -18, -31, 0.75, female, open, flash), flash);
  // (the hull: a long wedge, inked; banded lit top to dark belly; its panel seams; a stripe)
  const hull = [-90, -40, 60, -38, 92, -24, 60, -10, -90, -8];
  poly(c, [-92, -42, 61, -40, 95, -24, 61, -8, -92, -6], INK);
  c.save(); c.beginPath(); c.moveTo(hull[0], hull[1]); for (let i = 2; i < hull.length; i += 2) c.lineTo(hull[i], hull[i + 1]); c.closePath(); c.clip();
  bandsIn(c, -92, -40, 186, 32, [K[6], K[5], K[4], K[4], K[3], K[3], K[2], K[1]]);
  R(c, -90, -40, 150, 1, K[7]);
  for (let x = -70; x < 60; x += 26) { R(c, x, -38, 1, 28, K[1]); R(c, x + 1, -38, 1, 28, K[5]); }
  R(c, -90, -20, 180, 3, flash ? '#FFFFFF' : '#5E1A4E'); R(c, -90, -20, 180, 1, flash ? '#FFFFFF' : '#9A3A7E');
  // (the nose: the emitter's housing, darker, banded)
  poly(c, [60, -38, 92, -24, 60, -10], K[2]); poly(c, [60, -38, 92, -24, 60, -30], K[4]);
  c.restore();
  // (the window slots along it, sunk: the lights in them are drawn live)
  for (let i = 0; i < 6; i++) { R(c, -71 + i * 20, -31, 10, 6, INK); }
  // (the engines behind: bells)
  for (const [ey, eh] of [[-37, 12], [-21, 10]] as const) { R(c, -100, ey, 11, eh, INK); R(c, -99, ey + 1, 9, eh - 2, K[2]); R(c, -99, ey + 1, 9, 2, K[5]); }
  // (the emitter in the nose: a dark lens in a ring)
  disc(c, 86, -24, 8, 8, INK); disc(c, 86, -24, 7, 7, flash ? '#FFFFFF' : STEEL[2]); disc(c, 85, -25, 5, 5, flash ? '#FFFFFF' : STEEL[1]); R(c, 82, -28, 2, 2, STEEL[5]);
};
export const drawCruiser = (c: Ctx, f: number, female: boolean, flash: boolean, charge: number) => {
  stamp(c, `orb-cruiser-${+female}${+flash}${+(charge > 0.5)}`, -102, -66, 200, 70, g => paintCruiser(g, female, flash, charge > 0.5));
  for (let i = 0; i < 6; i++) { const on = (f >> 3) % 6 === i; R(c, -70 + i * 20, -30, 8, 4, on ? LASER[5] : '#2A0E24'); if (on) R(c, -70 + i * 20, -30, 8, 1, LASER[6]); }
  // (the engines' glow, flickering)
  const fl = f % 4 < 2;
  R(c, -106, -35, 6, 8, fl ? LASER[4] : LASER[3]); R(c, -104, -33, 4, 4, LASER[6]);
  R(c, -106, -19, 6, 6, fl ? LASER[3] : LASER[4]); R(c, -104, -18, 4, 3, LASER[5]);
  // (the emitter warming: a stepped glow, bigger as it charges)
  if (charge > 0) {
    steppedGlow(c, 88, -24, 8 + charge * 16, '#EC44C4', 0.75 * Math.min(1, charge), 0.1, 4);
    disc(c, 88, -24, 3 + charge * 4, 3 + charge * 4, LASER[5]); disc(c, 88, -24, 1.5 + charge * 2, 1.5 + charge * 2, '#FFFFFF');
  }
};

/** A beam out of a nose at (x, y), `len` long to the right: a thin aiming line (`warn`) or the beam itself (`k` its
 *  width, 0..1). Drawn facing right, in the kind's own drawing (the engine turns it round with it). */
export const drawBeam = (c: Ctx, x: number, y: number, len: number, f: number, warn: boolean, k = 1) => {
  if (warn) {
    if (f % 6 < 4) { R(c, x, y - 1, len, 2, 'rgba(255, 140, 228, 0.75)'); checker(c, x, y - 3, len, 2, 'rgba(255, 140, 228, 0.4)', (f >> 1) % 2); checker(c, x, y + 1, len, 2, 'rgba(255, 140, 228, 0.4)', (f >> 1) % 2); }
    return;
  }
  const w = 10 + 16 * k + (f % 3);
  R(c, x, y - w / 2 - 6, len, w + 12, 'rgba(236, 68, 196, 0.18)');
  checker(c, x, y - w / 2 - 6, len, 2, 'rgba(236, 68, 196, 0.5)', f % 2); checker(c, x, y + w / 2 + 4, len, 2, 'rgba(236, 68, 196, 0.5)', f % 2);
  R(c, x, y - w / 2, len, w, LASER[3]);
  R(c, x, y - w / 3, len, w * 0.66, LASER[4]);
  R(c, x, y - w / 6, len, w / 3, LASER[5]);
  R(c, x, y - 2, len, 4, LASER[6]);
  // (ripples going down it)
  for (let i = 0; i < 10; i++) { const rx = x + ((f * 17 + i * 91) % len); R(c, rx, y - w / 2 + (i % 3) * (w / 3), 18, 2, LASER[6]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The flying saucer: a big classic one, its dome tinted so nobody sees in. 260 x 96. `red`: pissed (0..1).

const DOME = ['#0C0A26', '#16123C', '#211A54', '#2E246C', '#3E3484', '#5A4EA2', '#8478C4'];
const paintSaucer = (c: Ctx, flash: boolean) => {
  const S = flash ? WHITE(8) : STEEL;
  // (the dome: dark mirrored glass in steps, the stars and the Earth caught in it)
  sphere(c, 0, -58, 62, 38, flash ? WHITE(7) : DOME);
  if (!flash) {
    c.save(); c.beginPath(); c.ellipse(0, -58, 62, 38, 0, 0, Math.PI * 2); c.clip();
    // (the Earth's blue in the glass, low down; the reflections' arcs; stars)
    R(c, -62, -34, 124, 6, '#1A3A7A'); checker(c, -62, -36, 124, 2, '#1A3A7A', 0); R(c, -62, -32, 124, 2, '#2E5AA8');
    for (let k = 0; k < 14; k++) R(c, -50 + hash(k) * 100, -90 + hash(k + 5) * 44, 2, 2, k % 3 ? '#B8B0E8' : '#FFFFFF');
    c.restore();
    c.strokeStyle = 'rgba(255, 255, 255, 0.4)'; c.lineWidth = 4; c.beginPath(); c.arc(0, -58, 52, Math.PI * 1.15, Math.PI * 1.45); c.stroke();
    c.strokeStyle = 'rgba(255, 255, 255, 0.18)'; c.lineWidth = 2; c.beginPath(); c.arc(0, -58, 44, Math.PI * 1.2, Math.PI * 1.38); c.stroke();
  }
  // (the antenna)
  R(c, 34, -110, 3, 22, INK); R(c, 35, -110, 1, 22, S[5]); disc(c, 35, -112, 3, 3, INK); disc(c, 35, -112, 2, 2, S[6]);
  // (the top deck: inked, banded)
  disc(c, 0, -36, 112, 17, INK);
  disc(c, 0, -36, 110, 16, S[3]); disc(c, -6, -39, 96, 11, S[4]); disc(c, -14, -42, 70, 6, S[5]);
  c.save(); c.beginPath(); c.ellipse(0, -36, 110, 16, 0, 0, Math.PI * 2); c.clip(); checker(c, -110, -46, 220, 2, S[4], 0); c.restore();
  // (the rim: the widest part, inked, a bright lip and the lights' strip)
  disc(c, 0, -32, 130, 15, INK);
  disc(c, 0, -32, 128, 14, S[2]);
  c.save(); c.beginPath(); c.ellipse(0, -32, 128, 14, 0, 0, Math.PI * 2); c.clip();
  bandsIn(c, -128, -46, 256, 28, [S[2], S[3], S[6], S[5], S[2], S[1], S[1]]);
  c.restore();
  R(c, -126, -34, 252, 2, S[7]);
  R(c, -118, -31, 236, 6, INK);
  // (the underside: dark, banded down to the hatch)
  disc(c, 0, -20, 86, 13, INK); disc(c, 0, -20, 84, 12, S[1]); disc(c, -4, -22, 66, 7, S[2]);
  c.save(); c.beginPath(); c.ellipse(0, -20, 84, 12, 0, 0, Math.PI * 2); c.clip(); checker(c, -84, -26, 168, 2, S[2], 1); c.restore();
  // (the beam hatch underneath)
  disc(c, 0, -12, 27, 7, INK); disc(c, 0, -12, 26, 6, S[0]); disc(c, 0, -12, 18, 3, S[1]);
};
export const drawSaucer = (c: Ctx, f: number, flash: boolean, red: number, open: number) => {
  stamp(c, `orb-saucer-${+flash}`, -134, -126, 268, 128, g => paintSaucer(g, flash));
  // (the rim's lights going round: pink, or red when she's pissed)
  for (let i = 0; i < 12; i++) {
    const lit = (i + (f >> 2)) % 4 === 0;
    const col = red > 0.5 ? (lit ? '#FCA5A5' : '#B91C1C') : lit ? LASER[6] : LASER[3];
    R(c, -112 + i * 20, -30, 8, 4, col);
    if (lit) R(c, -113 + i * 20, -31, 10, 1, red > 0.5 ? '#FEE2E2' : LASER[5]);
  }
  // (the hatch opening: the light inside, in steps)
  if (open > 0) { disc(c, 0, -12, 24 * open, 5 * open, '#FDE68A'); disc(c, 0, -12, 16 * open, 3 * open, '#FEF9C3'); disc(c, 0, -12, 8 * open, 1.5 * open, '#FFFFFF'); }
  // (pissed: red all over it, pulsing, in a checker over the hull so it stays chunky)
  if (red > 0) {
    const a = red * (0.28 + 0.16 * Math.sin(f * 0.3));
    c.save(); c.beginPath(); c.ellipse(0, -36, 132, 30, 0, 0, Math.PI * 2); c.ellipse(0, -58, 62, 38, 0, 0, Math.PI * 2); c.clip();
    checker(c, -134, -98, 268, 100, `rgba(239, 68, 68, ${Math.min(0.6, a * 1.3).toFixed(3)})`, (f >> 2) % 2);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Rocks: lumpy, cratered, lit from the upper left whichever way they've turned (each painted a pixel at a time, at a
// set of turns, the once: the craters turn with the rock, the light doesn't)

const ROCK = ['#141110', '#241E1B', '#38302B', '#4E443D', '#665A51', '#837567', '#A39482', '#C6B8A4'];
const ROCK_TURNS = 32;
const rockSprites = new Map<string, HTMLCanvasElement>();
const paintRock = (r: number, rot: number, seed: number, flash: boolean) => {
  const P = 2, n = Math.ceil((r * 2.1) / P) + 2, c = document.createElement('canvas');
  c.width = n; c.height = n;
  const g = c.getContext('2d')!, img = g.createImageData(n, n), d = img.data;
  const shape = (a: number) => 0.8 + 0.11 * Math.sin(3 * a + seed) + 0.07 * Math.sin(5 * a + seed * 2.3) + 0.04 * Math.sin(9 * a + seed * 0.7);
  const craters: [number, number, number][] = [];
  for (let k = 0; k < 6; k++) craters.push([(hash(seed + k * 3) - 0.5) * 1.1, (hash(seed + k * 7 + 1) - 0.5) * 1.1, 0.13 + hash(seed + k * 5 + 2) * 0.17]);
  const cs = Math.cos(-rot), sn = Math.sin(-rot);
  const inside = (i: number, j: number) => {
    const x = ((i + 0.5) * P - n * P / 2) / r, y = ((j + 0.5) * P - n * P / 2) / r;
    const u = x * cs - y * sn, v = x * sn + y * cs;
    const k = shape(Math.atan2(v, u));
    return { x, y, u, v, k, d: Math.hypot(u, v) / k };
  };
  const toRgb = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const p = inside(i, j);
    if (p.d >= 1) continue;
    const o = (j * n + i) * 4;
    // (its rim inked: a pixel with outside next to it)
    const edge = inside(i + 1, j).d >= 1 || inside(i - 1, j).d >= 1 || inside(i, j + 1).d >= 1 || inside(i, j - 1).d >= 1;
    let col: string;
    if (flash) col = '#FFFFFF';
    else if (edge) col = INK;
    else {
      const z = Math.sqrt(Math.max(0, 1 - p.d * p.d));
      let l = (-p.x * 0.55 - p.y * 0.62) / p.k * 0.8 + z * 0.55 + 0.05;
      // (its craters: a dark floor, the rim lit on the side away from the light, shaded on the near side)
      for (const [cx, cy, cr] of craters) {
        const du = p.u - cx, dv = p.v - cy, dd = Math.hypot(du, dv) / cr;
        if (dd >= 1) continue;
        // (which way the crater's wall here faces, in screen terms)
        const wx = du * Math.cos(rot) - dv * Math.sin(rot), wy = du * Math.sin(rot) + dv * Math.cos(rot);
        const face = (wx * 0.55 + wy * 0.62) / (cr * dd + 1e-3);
        l += dd < 0.72 ? -0.2 - face * 0.12 : face * 0.22;
      }
      // (grain: a little noise, a pixel at a time)
      l += (hash(i * 31 + j * 17 + seed) - 0.5) * 0.08;
      const f = Math.max(0, Math.min(0.999, l)) * (ROCK.length - 1), s = Math.floor(f), t = f - s;
      col = ROCK[Math.min(ROCK.length - 1, s + (t > 0.62 || (t > 0.38 && (i + j) % 2 === 0) ? 1 : 0))];
    }
    const v = toRgb(col);
    d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
};
/** A rock, round-ish and lumpy (`seed` picks its lumps), radius r, turned `rot`, at its middle. */
export const drawRock = (c: Ctx, x: number, y: number, r: number, rot: number, seed: number, flash: boolean) => {
  if (typeof document === 'undefined') return;
  const turn = ((Math.round((rot / (Math.PI * 2)) * ROCK_TURNS) % ROCK_TURNS) + ROCK_TURNS) % ROCK_TURNS;
  const rr = Math.round(r), sd = Math.round(seed * 10) / 10;
  const key = `${sd}|${rr}|${turn}|${+flash}`;
  let img = rockSprites.get(key);
  if (!img) {
    if (rockSprites.size > 900) rockSprites.clear();
    img = paintRock(rr, (turn / ROCK_TURNS) * Math.PI * 2, sd, flash);
    rockSprites.set(key, img);
  }
  const s = img.width * 2;
  c.save(); c.imageSmoothingEnabled = false;
  c.drawImage(img, Math.round((x - s / 2) / 2) * 2, Math.round((y - s / 2) / 2) * 2, s, s);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Space junk: `what` 0 an old satellite, 1 a busted fuel tank, 2 a porta-potty (somebody's), 3 a piece of Space
// Needle 2's deck (blown out with him), 4 a Star Sled car (off the ride), 5 the gift shop's big sign. At its middle.
// `left`: its health left (0..1: the sign crumbles by it); `flash`: just hit.

export const drawJunk = (c: Ctx, x: number, y: number, w: number, h: number, rot: number, what: number, left = 1, flash = false) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  if (what === 5) drawGiftSign(c, w, h, left < 1 / 3 ? 2 : left < 2 / 3 ? 1 : 0, flash);
  else if (what === 4) drawSledCar(c, w, h, flash);
  else if (what === 3) drawDeckChunk(c, w, h, flash);
  else if (what === 0) {
    // (the solar panels on their arms: cells in a grid, a glint going down them)
    R(c, -w * 0.32, -2, w * 0.64, 4, INK); R(c, -w * 0.32, -1, w * 0.64, 2, '#8A8E98');
    for (const sx of [-w / 2, w * 0.2]) {
      R(c, sx - 1, -h * 0.16 - 1, w * 0.3 + 2, h * 0.32 + 2, INK);
      R(c, sx, -h * 0.16, w * 0.3, h * 0.32, '#16285E');
      R(c, sx, -h * 0.16, w * 0.3, h * 0.08, '#2448A0');
      for (let i = 1; i < 4; i++) R(c, sx + i * w * 0.075, -h * 0.16, 1, h * 0.32, '#0A1430');
      R(c, sx, -1, w * 0.3, 1, '#0A1430');
      R(c, sx + 2, -h * 0.16 + 1, w * 0.06, 2, '#9CC4FF');
    }
    // (the body: a drum, banded, lit down its left; gold foil round its middle)
    R(c, -w * 0.18 - 1, -h / 2 - 1, w * 0.36 + 2, h + 2, INK);
    const bw = w * 0.36, bx = -w * 0.18;
    for (const [k, col] of [[0, '#E4E4EA'], [0.15, '#C2C4CC'], [0.45, '#A0A3AE'], [0.75, '#7C808C'], [0.9, '#5A5E6A']] as const) R(c, bx + bw * k, -h / 2, bw * (1 - k), h, col);
    R(c, bx, -h * 0.12, bw, h * 0.3, '#B8892A'); R(c, bx, -h * 0.12, bw, 2, '#F0C860'); checker(c, bx, -h * 0.12 + 2, bw, h * 0.3 - 2, '#8A621A', 0);
    // (the dish on top)
    R(c, -2, -h / 2 - 14, 4, 14, INK); R(c, -1, -h / 2 - 14, 2, 14, '#A0A3AE');
    disc(c, 0, -h / 2 - 16, 9, 5, INK); disc(c, 0, -h / 2 - 16, 8, 4, '#C2C4CC'); disc(c, -2, -h / 2 - 17, 5, 2, '#F0F0F4');
    // (somebody's flag, a little faded)
    R(c, -w * 0.12, -h * 0.4, 14, 9, '#E8E6E0'); R(c, -w * 0.12, -h * 0.4, 6, 5, '#2448A0'); R(c, -w * 0.12 + 6, -h * 0.4 + 1, 8, 1, '#C83030'); R(c, -w * 0.12, -h * 0.4 + 6, 14, 1, '#C83030'); R(c, -w * 0.12, -h * 0.4 + 3, 14, 1, '#C83030');
  } else if (what === 1) {
    // (the tank: an orange capsule, banded top to bottom, rust in a checker, the split in its side, its hoses)
    disc(c, 0, 0, w / 2 + 1, h / 2 + 1, INK);
    c.save(); c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.clip();
    bandsIn(c, -w / 2, -h / 2, w, h, ['#FDBA74', '#F97316', '#EA580C', '#C2410C', '#9A3412', '#7C2D12']);
    for (const [ry, rcol] of [[-h * 0.1, '#7C2D12'], [h * 0.22, '#5A1E0A']] as const) R(c, -w / 2, ry, w, 3, rcol);
    checker(c, w * 0.05, -h * 0.3, w * 0.3, h * 0.25, '#7C2D12', 0);
    c.restore();
    poly(c, [w * 0.15, -h * 0.18, w * 0.38, -h * 0.02, w * 0.2, h * 0.2, w * 0.28, 0], INK);
    R(c, -w * 0.36, -h * 0.34, w * 0.2, 2, '#FFF1E0');
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-w / 2 + 4, 0); c.quadraticCurveTo(-w / 2 - 10, 10, -w / 2 - 4, 22); c.stroke();
    c.strokeStyle = '#52525B'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-w / 2 + 4, 0); c.quadraticCurveTo(-w / 2 - 10, 10, -w / 2 - 4, 22); c.stroke();
  } else {
    // (the porta-potty: blue plastic, its roof vent, the door with its moon, OCCUPIED in its little window)
    R(c, -w / 2 - 1, -h / 2 - 7, w + 2, h + 8, INK);
    for (const [k, col] of [[0, '#5B8CF0'], [0.12, '#3B6FE0'], [0.5, '#2A58C4'], [0.82, '#1E40A0']] as const) R(c, -w / 2 + w * k, -h / 2, w * (1 - k), h, col);
    R(c, -w / 2, -h / 2 - 6, w, 7, '#1E3A8A'); R(c, -w / 2, -h / 2 - 6, w, 2, '#4570D0');
    R(c, -w * 0.3, -h * 0.32, w * 0.6, h * 0.78, INK); R(c, -w * 0.28, -h * 0.3, w * 0.56, h * 0.75, '#2448B0'); R(c, -w * 0.28, -h * 0.3, 2, h * 0.75, '#4A78E0');
    disc(c, 0, -h * 0.18, 5, 5, '#FDE047'); disc(c, 2, -h * 0.2, 4, 4, '#2448B0');
    R(c, w * 0.12, -h * 0.02, 4, 8, '#E5E7EB'); R(c, w * 0.12, -h * 0.02, 4, 2, '#FFFFFF');
    R(c, -w * 0.2, h * 0.12, w * 0.32, 6, INK); R(c, -w * 0.2 + 1, h * 0.12 + 1, w * 0.16, 4, '#DC2626'); R(c, -w * 0.2 + 1 + w * 0.16, h * 0.12 + 1, w * 0.16 - 2, 4, '#F5F5F4');
    for (let i = 0; i < 3; i++) R(c, -w / 2 + 4, -h * 0.3 + i * 5, 4, 2, '#13286E');
  }
  c.restore();
};

/** Space Needle 2's teal, its chrome, its orange rings (the same needle the lobby, the deck and the blowout show). */
const NEEDLE_TEAL = ['#0B3B38', '#0F5C56', '#0F766E', '#14B8A6', '#5EEAD4'];
const NEEDLE_CHROME = ['#5A5E6A', '#8A8E98', '#C2C4CC', '#F0F0F4'];
/** A torn edge down one end of a piece (x the end, `dir` which way the tears point), inked. */
const torn = (c: Ctx, x: number, h: number, dir: number) => {
  const pts = [x, -h / 2 - 1];
  for (let i = 0; i <= 6; i++) pts.push(x + dir * (i % 2 ? 9 : 2) + dir * ((i * 5) % 3), -h / 2 + (i / 6) * h);
  pts.push(x, h / 2 + 1, x - dir * 4, h / 2 + 1, x - dir * 4, -h / 2 - 1);
  poly(c, pts, INK);
};
/** A curved slab of Space Needle 2's deck, torn off in the blowout: its chrome rim, the windows, the teal band, the orange
 *  ring under, the rebar sticking out of both torn ends. */
const drawDeckChunk = (c: Ctx, w: number, h: number, flash: boolean) => {
  const x0 = -w / 2, y0 = -h / 2;
  // (the rebar out of the ends)
  for (const [ex, dir] of [[x0, -1], [-x0, 1]] as const) for (const ry of [-h * 0.25, h * 0.15]) { R(c, ex, ry - 1, dir * 16, 3, INK); R(c, ex, ry, dir * 15, 1, '#8A5A3A'); }
  R(c, x0 - 1, y0 - 1, w + 2, h + 2, INK);
  // (the chrome rim along the top, the window strip, the teal band, the orange ring)
  for (let i = 0; i < 4; i++) R(c, x0, y0 + i * 2, w, 2, NEEDLE_CHROME[3 - i]);
  R(c, x0, y0 + 8, w, h * 0.34, '#0A1430');
  for (let i = 0; i * 18 < w; i++) { const px = x0 + 3 + i * 18; R(c, px, y0 + 10, 14, h * 0.34 - 4, i % 3 === 1 ? '#16285E' : '#1E3A8A'); R(c, px + 1, y0 + 11, 4, 2, '#9CC4FF'); }
  const ty = y0 + 8 + h * 0.34;
  const band = (h * 0.66 - 14) / 4;
  for (let i = 0; i < 4; i++) R(c, x0, ty + i * band, w, band + 1, NEEDLE_TEAL[4 - i]);
  checker(c, x0, ty + band * 2 - 1, w, 2, NEEDLE_TEAL[2], 0);
  R(c, x0, h / 2 - 6, w, 6, '#C2410C'); R(c, x0, h / 2 - 6, w, 2, '#F97316');
  // (the torn ends)
  torn(c, x0 + 6, h, 1); torn(c, -x0 - 6, h, -1);
  if (flash) for (let i = 0; i < 5; i++) R(c, x0 + 20 + i * 28, y0 + 2, 6, 2, '#FFFFFF');
};
/** A Star Sled car off the ride: a red rocket sled, a white racing stripe, chrome fins, its empty seat and lap bar. */
const drawSledCar = (c: Ctx, w: number, h: number, flash: boolean) => {
  const RED_SLED = ['#F47258', '#DC3A2E', '#B01C1C', '#7A1212'];
  // (the fins, chrome)
  poly(c, [-w / 2 - 3, -h / 2 - 8, -w / 2 + 22, -h / 2 + 4, -w / 2 + 2, -h / 2 + 6], INK);
  poly(c, [-w / 2 - 1, -h / 2 - 5, -w / 2 + 18, -h / 2 + 4, -w / 2 + 3, -h / 2 + 4], NEEDLE_CHROME[2]);
  // (the body: a long capsule, nose to the right, banded)
  disc(c, 0, 0, w / 2 + 1, h / 2 + 1, INK);
  c.save(); c.beginPath(); c.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2); c.clip();
  bandsIn(c, -w / 2, -h / 2, w, h, RED_SLED);
  R(c, -w / 2, -2, w, 5, '#F5F5F4'); R(c, -w / 2, 3, w, 1, '#A8A29E');
  c.restore();
  // (the seat, the lap bar up)
  R(c, -w * 0.18 - 1, -h / 2 - 5, w * 0.3 + 2, 8, INK); R(c, -w * 0.18, -h / 2 - 4, w * 0.3, 6, '#27272A');
  R(c, -w * 0.12, -h / 2 - 14, 3, 11, INK); R(c, -w * 0.12, -h / 2 - 14, w * 0.22, 3, INK); R(c, -w * 0.12 + 1, -h / 2 - 13, w * 0.2, 1, NEEDLE_CHROME[3]);
  // (its exhaust cone, dead)
  R(c, -w / 2 - 6, -5, 7, 10, INK); R(c, -w / 2 - 5, -4, 5, 8, '#52525B');
  // (the number, painted on its side)
  for (const [i, dots] of [[0, '111101101101111'], [1, '111001001001001']] as const) for (let d = 0; d < 15; d++) if (dots[d] === '1') R(c, w * 0.12 + i * 8 + (d % 3) * 2, -h * 0.4 + Math.floor(d / 3) * 2, 2, 2, '#18181B');
  if (flash) R(c, -w * 0.3, -h / 2 + 3, w * 0.5, 2, '#FFFFFF');
};

/** The gift shop's big sign, torn off its pylon in the blowout: painted once a crumble stage (0 whole, 1 a corner off,
 *  2 holes all through it), drawn from that. */
const signSprites: HTMLCanvasElement[] = [];
const SIGN_PAD = 14;
const drawGiftSign = (c: Ctx, w: number, h: number, stage: number, flash: boolean) => {
  if (typeof document === 'undefined') return;
  let img = signSprites[stage];
  if (!img) { img = paintGiftSign(w, h, stage); signSprites[stage] = img; }
  c.drawImage(img, -w / 2 - SIGN_PAD, -h / 2 - SIGN_PAD);
  if (flash) { c.globalAlpha = 0.35; R(c, -w / 2, -h / 2, w, 3, '#FFFFFF'); c.globalAlpha = 1; }
};
const paintGiftSign = (w: number, h: number, stage: number) => {
  const cv = document.createElement('canvas');
  cv.width = w + SIGN_PAD * 2; cv.height = h + SIGN_PAD * 2;
  const g = cv.getContext('2d')!;
  g.translate(SIGN_PAD + w / 2, SIGN_PAD + h / 2);
  // (the stub of its pylon, snapped, under it)
  R(g, -9, h / 2 - 2, 18, 14, INK); R(g, -8, h / 2 - 2, 16, 10, '#4E5664'); R(g, -8, h / 2 - 2, 4, 10, '#929CAC');
  poly(g, [-8, h / 2 + 8, -4, h / 2 + 13, 0, h / 2 + 9, 4, h / 2 + 13, 8, h / 2 + 8], '#4E5664');
  // (the board: a chrome frame, the navy face, a row of bulbs top and bottom)
  R(g, -w / 2 - 1, -h / 2 - 1, w + 2, h + 2, INK);
  for (let i = 0; i < 4; i++) R(g, -w / 2 + i, -h / 2 + i, w - i * 2, h - i * 2, NEEDLE_CHROME[3 - i]);
  R(g, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, '#0F172A');
  R(g, -w / 2 + 4, -h / 2 + 4, w - 8, 3, '#1E293B');
  for (let i = 0; i < 15; i++) { const bx = -w / 2 + 10 + i * ((w - 20) / 14); for (const by of [-h / 2 + 9, h / 2 - 9]) { R(g, bx - 2, by - 2, 4, 4, '#3A2A0A'); R(g, bx - 1, by - 1, 2, 2, i % 2 ? '#FDE047' : '#FEF9C3'); } }
  lettering(g, 'GIFT SHOP', 0, -7, 'chrome2', '#DCEBFF', '#0F172A');
  lettering(g, 'SOUVENIRS', 0, 16, 'neon', '#F472B6', '#0F172A', true);
  // (crumbling: corners off, holes through it, cracks)
  g.globalCompositeOperation = 'destination-out';
  if (stage >= 1) poly(g, [w / 2 + 2, -h / 2 - 2, w / 2 - 34, -h / 2 - 2, w / 2 - 22, -h / 2 + 12, w / 2 - 30, -h / 2 + 24, w / 2 - 6, -h / 2 + 30, w / 2 + 2, -h / 2 + 34], '#000');
  if (stage >= 2) {
    poly(g, [-w / 2 - 2, h / 2 + 2, -w / 2 - 2, h / 2 - 30, -w / 2 + 14, h / 2 - 22, -w / 2 + 26, h / 2 - 34, -w / 2 + 40, h / 2 - 12, -w / 2 + 34, h / 2 + 2], '#000');
    poly(g, [-20, -h / 2 - 2, -2, -h / 2 + 10, -14, -h / 2 + 16, -30, -h / 2 + 6], '#000');
    poly(g, [30, h / 2 - 20, 44, h / 2 - 26, 52, h / 2 - 14, 38, h / 2 - 8], '#000');
  }
  g.globalCompositeOperation = 'source-over';
  if (stage >= 1) {
    // (the cracks running off the breaks)
    g.strokeStyle = INK; g.lineWidth = 2;
    g.beginPath(); g.moveTo(w / 2 - 30, -h / 2 + 22); g.lineTo(w / 2 - 52, -h / 2 + 30); g.lineTo(w / 2 - 60, -h / 2 + 46); g.stroke();
    if (stage >= 2) { g.beginPath(); g.moveTo(-w / 2 + 34, h / 2 - 20); g.lineTo(-w / 2 + 60, h / 2 - 34); g.lineTo(-w / 2 + 70, -h / 2 + 20); g.moveTo(-14, -h / 2 + 14); g.lineTo(-6, 4); g.stroke(); }
  }
  return cv;
};

/** A bit of scrap off something broken: a bent plate in its color, inked, lit along one edge, turning. */
export const drawScrap = (c: Ctx, x: number, y: number, r: number, rot: number, col: string) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  const w = r * 1.7, h = r * 0.9;
  poly(c, [-w / 2 - 1, -h / 2 - 1, w / 2 + 1, -h / 2 + 2, w / 2 - 3, h / 2 + 1, -w / 2 + 4, h / 2 + 1], INK);
  poly(c, [-w / 2, -h / 2, w / 2, -h / 2 + 3, w / 2 - 4, h / 2, -w / 2 + 4, h / 2], col);
  R(c, -w / 2 + 1, -h / 2 + 1, w * 0.6, 2, '#FFFFFF');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Space (screen space): banded black to a faint blue over the Earth, the nebulae, three depths of stars going by at
// their own pace, the moon, the Earth's curve under it, lit, its sea catching the sun

/** The orbit's own space bands: blacker than the deck's, a deeper blue down by the limb. */
const ORBIT_SPACE = ['#010107', '#02030B', '#040612', '#060918', '#080D20', '#0B122A', '#101A38', '#16244A'];
export const drawSpace = (c: Ctx, camX: number, f: number, earthY = 470) => {
  spaceBands(c, 0, earthY + 30, ORBIT_SPACE);
  drawNebula(c, camX * 0.3, 230, 0.75);
  drawStars(c, camX * 0.25, f);
  // (the moon, way off; it hardly moves)
  drawMoonDisc(c, 660 - (camX * 0.01) % 200, 104, 0.5);
  // (the nearest stars: streaks going by, so it's going somewhere)
  for (let i = 0; i < 26; i++) {
    const x = ((hash(i * 3 + 1) * W * 1.2 - camX * 0.5) % (W * 1.2) + W * 1.2) % (W * 1.2) - W * 0.1, y = Math.round(hash(i * 5 + 2) * (earthY - 20) / 2) * 2;
    const b = hash(i + 9);
    R(c, Math.round(x / 2) * 2, y, b > 0.7 ? 6 : 4, 2, b > 0.7 ? '#FFFFFF' : '#9FB4D8');
    if (b > 0.7) R(c, Math.round(x / 2) * 2 + 6, y, 4, 2, '#5A6A90');
  }
  drawEarth(c, earthY, camX * 0.12, 210);
};

// ---------------------------------------------------------------------------------------------------------------
// The top of Space Needle 2, where he came out: the halo ring of its deck (the windows lit warm round it), the teal
// dome over it, the spire and its beacon, the shaft down to the Earth; the window on its right busted out. World
// space, its deck's middle at (x, y). The same needle the decompression's outside shot shows (death.ts), nearer.

const TEAL = ['#052A33', '#083B47', '#0D4F5D', '#126775', '#1A808C', '#2A9AA3', '#49B4B8'];
const CHROME = ['#1B2432', '#2E3A4D', '#4A5A70', '#74859C', '#A3B1C4', '#CDD6E2', '#EEF2F7'];
const paintNeedleTop = (c: Ctx) => {
  // (the shaft: down out of sight, banded across, orange rings, lit down its left)
  R(c, -16, 28, 32, 900, INK);
  for (const [k, col] of [[0, CHROME[4]], [0.12, CHROME[6]], [0.28, CHROME[5]], [0.5, CHROME[4]], [0.72, CHROME[3]], [0.88, CHROME[2]]] as const) R(c, -15 + 30 * k, 28, 30 * (1 - k), 900, col);
  for (let y = 60; y < 920; y += 60) { R(c, -15, y, 30, 4, '#D2551A'); R(c, -15, y, 30, 1, '#FBA45E'); R(c, -15, y + 4, 30, 1, INK); }
  // (the underside of the ring: teal, darker toward its bottom; the collar round the shaft)
  for (const [r, col] of [[146, INK], [144, TEAL[3]], [124, TEAL[2]], [96, TEAL[1]], [60, TEAL[0]]] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(0, 8, r, r * 0.24, 0, 0, Math.PI); c.fill(); }
  R(c, -24, 34, 48, 8, INK); R(c, -23, 34, 46, 6, CHROME[4]); R(c, -23, 34, 46, 2, CHROME[6]);
  // (the dome on top: teal, banded, chrome ribs)
  for (const [r, col] of [[96, INK], [94, TEAL[2]], [84, TEAL[3]], [66, TEAL[4]], [42, TEAL[5]], [22, TEAL[6]]] as const) { c.fillStyle = col; c.beginPath(); c.ellipse(-(94 - r) * 0.3, -22, r, r * 0.42, 0, Math.PI, 0); c.fill(); }
  c.strokeStyle = 'rgba(10, 15, 26, 0.6)'; c.lineWidth = 1;
  for (const k of [-0.66, -0.33, 0, 0.33, 0.66]) { c.beginPath(); c.moveTo(k * 94, -22); c.quadraticCurveTo(k * 70, -50, k * 30, -62); c.stroke(); }
  // (the spire)
  R(c, -4, -172, 8, 140, INK); R(c, -3, -172, 3, 140, CHROME[5]); R(c, 0, -172, 3, 140, CHROME[3]);
  for (let y = -160; y < -40; y += 30) R(c, -3, y, 6, 2, CHROME[2]);
  // (the halo ring: chrome, inked, banded; the windows round it lit warm, the far ones dimmer)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 150, 26, 0, 0, Math.PI * 2); c.fill();
  const ring = [CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[2], CHROME[1]];
  for (let i = 0; i < ring.length; i++) { c.fillStyle = ring[i]; c.beginPath(); c.ellipse(0, -2 + i * 1.6, 148 - i * 2, 23 - i * 3, 0, 0, Math.PI * 2); c.fill(); }
  R(c, -140, -6, 280, 12, CHROME[0]);
  for (let k = -12; k <= 12; k++) {
    const wx = k * 11, far = Math.abs(k) > 9;
    R(c, wx - 4, -4, 8, 8, far ? '#B45309' : '#FDE68A'); R(c, wx - 4, -4, 8, 2, far ? '#D97706' : '#FFFBEB');
  }
  // (his window: smashed out, black inside, the edges of the glass left in the frame)
  R(c, 92, -6, 30, 14, INK);
  c.fillStyle = '#BAE6FD'; c.beginPath(); c.moveTo(92, -6); c.lineTo(102, -6); c.lineTo(94, 2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(122, 8); c.lineTo(112, 8); c.lineTo(121, 0); c.closePath(); c.fill();
  // (the sign on the dome's foot: in its own panel, nothing over it)
  R(c, -64, -40, 128, 14, INK); R(c, -63, -39, 126, 12, TEAL[1]); R(c, -63, -39, 126, 2, TEAL[3]);
  c.font = '8px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = INK; c.fillText('SPACE NEEDLE 2', 1, -28); c.fillStyle = '#FDE68A'; c.fillText('SPACE NEEDLE 2', 0, -29); c.textAlign = 'left';
};
export const drawNeedleTop = (c: Ctx, x: number, y: number, f = 0) => {
  c.save(); c.translate(x, y);
  stamp(c, 'orb-needle-top', -160, -180, 320, 1110, paintNeedleTop);
  // (the beacon: blinking)
  if (f % 60 < 30) { steppedGlow(c, 0, -176, 14, '#EF4444', 0.5, 0.08, 3); disc(c, 0, -176, 4, 4, '#FCA5A5'); }
  else disc(c, 0, -176, 4, 4, '#7F1D1D');
  c.restore();
};

export { STEEL, INK, sphere };
