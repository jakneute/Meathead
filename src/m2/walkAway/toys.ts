// The walk-away's toys, big (his picture's own pixels, the size they are in his fist on the walk-away), each in its own
// frame: its origin where his fist goes on it, pointing +x, up -y. Drawn the way they look in the game and on the
// weapon wheel (weapons/*.ts drawHeld), done up: stepped ramps, inked, lit from the top left. Some have moving parts the
// acts work (walkAway/acts.ts): the slate's clapper, the book's covers and pages, the spawner's sac.

import { type Ctx, INK, box, lump, poly, mix, stipple } from './kit';

const CHROME = ['#3F3F46', '#71717A', '#A1A1AA', '#D4D4D8', '#F4F4F5'];
const STEEL = ['#27272A', '#3F3F46', '#52525B', '#A1A1AA', '#E5E7EB'];
const WOOD = ['#451A03', '#78350F', '#92400E', '#B45309', '#D97706'];
const BRASS = ['#713F12', '#A16207', '#CA8A04', '#EAB308', '#FDE68A'];
const PURPLE = ['#2E1065', '#4C1D95', '#7C3AED', '#A78BFA', '#DDD6FE'];

// ---------------------------------------------------------------------------------------------------------------

/** The ray gun: a fat chrome bulb, the alien's pink coils glowing round the barrel, a dish at the muzzle, a fin up top;
 *  the grip duct-taped, a red wire looping out of the bulb into it. Muzzle at (40, -11). */
export const RAY_MUZZLE: [number, number] = [40, -11];
export const rayGun = (c: Ctx, t: number) => {
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.2);
  // (the grip: duct tape round and round)
  box(c, -5, -6, 11, 17, INK); box(c, -4, -5, 9, 15, '#9CA3AF'); box(c, -4, -5, 2, 15, '#D4D4D8');
  for (const y of [-2, 2, 6]) box(c, -4, y, 9, 1, '#6B7280');
  // (the fin)
  poly(c, [[-4, -14], [6, -25], [12, -17], [6, -14]], CHROME[2]); box(c, 2, -19, 4, 1, CHROME[4]);
  // (the barrel, the coils round it)
  box(c, 20, -15, 17, 9, INK); box(c, 21, -14, 15, 7, CHROME[1]); box(c, 21, -14, 15, 2, CHROME[3]); box(c, 21, -9, 15, 1, CHROME[0]);
  const hot = mix('#9D174D', '#F9A8D4', pulse);
  for (const x of [23, 29]) {
    box(c, x - 1, -18, 5, 15, INK); box(c, x, -17, 3, 13, hot); box(c, x, -17, 1, 13, mix(hot, '#FFFFFF', 0.4));
    if (pulse > 0.55) { c.fillStyle = stipple(c, '#F472B6', x & 1); c.fillRect(x - 3, -20, 9, 19); }
  }
  // (the bulb)
  lump(c, 9, -11, 15, 9, CHROME);
  box(c, 0, -17, 12, 2, CHROME[4]); box(c, 13, -17, 3, 1, CHROME[3]);
  box(c, 2, -5, 16, 1, CHROME[1]);
  for (const x of [3, 9, 15]) box(c, x, -13, 1, 1, CHROME[0]);
  // (the dish)
  box(c, 36, -21, 6, 21, INK); box(c, 37, -20, 4, 19, CHROME[2]); box(c, 37, -20, 2, 19, CHROME[3]); box(c, 37, -20, 4, 2, CHROME[4]);
  box(c, 40, -14, 2, 6, pulse > 0.5 ? '#FBCFE8' : '#F472B6');
  // (the wire)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(14, -3); c.quadraticCurveTo(14, 12, 4, 7); c.stroke();
  c.strokeStyle = '#DC2626'; c.lineWidth = 1; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------

/** The laser-guided flintlock: a walnut stock curling down to a brass butt, the lock and its cocked flint, a long
 *  barrel banded in brass, a laser pointer gaffer-taped under it. Muzzle at (56, -11). */
export const FLINT_MUZZLE: [number, number] = [56, -11];
export const flintlock = (c: Ctx, t: number) => {
  // (the stock: down and back to the butt)
  poly(c, [[-4, -15], [16, -15], [16, -6], [6, -5], [2, 6], [-4, 12], [-12, 10], [-7, -2]], WOOD[2]);
  box(c, -3, -14, 18, 2, WOOD[4]); box(c, -6, 0, 3, 8, WOOD[3]); box(c, 10, -8, 6, 2, WOOD[1]);
  for (let i = 0; i < 4; i++) box(c, -2 + i * 4, -11 + (i % 2), 3, 1, WOOD[1]);
  // (the butt cap)
  poly(c, [[-13, 9], [-4, 11], [-6, 15], [-14, 14]], BRASS[2]); box(c, -12, 10, 5, 1, BRASS[4]);
  // (the trigger guard)
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.ellipse(9, -4, 5, 4, 0, 0, Math.PI); c.stroke();
  c.strokeStyle = BRASS[3]; c.lineWidth = 1; c.stroke();
  box(c, 8, -5, 1, 4, INK);
  // (the barrel)
  box(c, 14, -15, 43, 8, INK); box(c, 15, -14, 41, 6, STEEL[2]); box(c, 15, -14, 41, 2, STEEL[3]); box(c, 15, -14, 41, 1, STEEL[4]); box(c, 15, -9, 41, 1, STEEL[0]);
  for (const x of [26, 42, 53]) { box(c, x, -15, 3, 8, INK); box(c, x, -14, 2, 6, BRASS[2]); box(c, x, -14, 2, 1, BRASS[4]); }
  // (the lock plate, the hammer cocked back, its flint)
  box(c, 8, -18, 10, 7, INK); box(c, 9, -17, 8, 5, STEEL[1]); box(c, 9, -17, 8, 1, STEEL[3]);
  poly(c, [[8, -18], [5, -25], [8, -27], [11, -21]], STEEL[2]); box(c, 5, -27, 4, 2, '#78716C');
  // (the laser: black, taped on twice, its red eye)
  box(c, 30, -8, 22, 6, INK); box(c, 31, -7, 20, 4, '#27272A'); box(c, 31, -7, 20, 1, '#52525B');
  for (const x of [35, 45]) box(c, x, -8, 3, 6, '#A1A1AA');
  box(c, 51, -7, 2, 4, (t >> 4) % 2 ? '#F87171' : '#DC2626');
};

// ---------------------------------------------------------------------------------------------------------------

/** The spellbook, shut, its cover to us: black leather, iron corners, a skull on it, the page edges glowing purple.
 *  His fist on its spine (the origin), the book out to +x. */
export const bookShut = (c: Ctx, t: number) => {
  const glow = (t >> 4) % 2 ? '#E9D5FF' : '#C084FC';
  box(c, -2, -18, 30, 36, INK);
  box(c, -1, -17, 28, 34, '#27272A'); box(c, -1, -17, 28, 2, '#3F3F46'); box(c, -1, -17, 2, 34, '#3F3F46'); box(c, 25, -17, 2, 34, '#18181B');
  box(c, 27, -16, 2, 32, glow); box(c, 27, -16, 1, 32, '#FFFFFF');
  for (const [x, y] of [[-1, -17], [21, -17], [-1, 11], [21, 11]]) { box(c, x, y, 6, 6, STEEL[2]); box(c, x, y, 6, 1, STEEL[4]); box(c, x + 2, y + 2, 2, 2, INK); }
  // (the skull)
  lump(c, 13, -3, 7, 6, ['#78716C', '#A8A29E', '#D6D3D1', '#E7E5E4', '#FFFFFF']);
  box(c, 10, 2, 7, 4, '#D6D3D1'); box(c, 10, 2, 7, 1, '#A8A29E');
  box(c, 9, -4, 3, 3, INK); box(c, 14, -4, 3, 3, INK); box(c, 12, 0, 2, 2, INK);
  for (const x of [11, 13, 15]) box(c, x, 4, 1, 2, INK);
  box(c, 10, -3, 1, 1, glow); box(c, 15, -3, 1, 1, glow);
};

/**
 * The spellbook open, held up to read, its covers to us (we see what he doesn't: the back of it), a V with the spine
 * toward us, the light off the pages spilling up over the top. `flip` 0..1: a page going over, up out of it. `open`
 * 0..1: shut (a slab) to wide. Origin: the spine's foot.
 */
export const bookOpen = (c: Ctx, t: number, open: number, flip: number) => {
  const wsp = 4 + open * 22, lift = open * 4;
  // (the light up off the pages)
  if (open > 0.3) {
    c.fillStyle = stipple(c, '#C084FC', (t >> 3) & 1);
    c.beginPath(); c.moveTo(-wsp + 3, -37 - lift); c.lineTo(-wsp - 2, -47 - lift); c.lineTo(wsp + 2, -47 - lift); c.lineTo(wsp - 3, -37 - lift); c.closePath(); c.fill();
  }
  // (the page going over: up out of it and across, its back to us, the writing showing through)
  if (flip > 0 && flip < 1) {
    const a = flip * Math.PI, dx = Math.cos(a) * wsp, up = Math.sin(a) * 18;
    poly(c, [[0, -34], [dx, -34 - lift * Math.abs(Math.cos(a)) - up], [dx, -6 - up * 0.4], [0, -4]], '#E7E5E4');
    for (let i = 0; i < 4; i++) box(c, Math.min(0, dx) + 2, -28 + i * 5 - up * 0.6, Math.abs(dx) - 4, 1, '#A8A29E');
  }
  // (the covers: each a slab angling back from the spine, its far edge up a touch)
  for (const s of [-1, 1]) {
    const pts = [[0, 0], [0, -36], [s * wsp, -36 - lift], [s * wsp, -lift]];
    poly(c, pts, s < 0 ? '#3F3F46' : '#27272A');
    // (the page block's edge, over the top, glowing)
    box(c, Math.min(0, s * wsp) + 1, -38 - lift, Math.max(1, wsp - 2), 2, (t >> 4) % 2 ? '#E9D5FF' : '#C084FC');
    // (iron corners)
    box(c, s * wsp - (s > 0 ? 5 : 0), -36 - lift, 5, 5, STEEL[2]); box(c, s * wsp - (s > 0 ? 5 : 0), -5 - lift, 5, 5, STEEL[2]);
  }
  // (the skull on the back cover, the spine's bands)
  if (open > 0.3) {
    lump(c, wsp * 0.5, -19, 5, 4, ['#78716C', '#A8A29E', '#D6D3D1', '#E7E5E4', '#FFFFFF']);
    box(c, wsp * 0.5 - 3, -20, 2, 2, INK); box(c, wsp * 0.5 + 1, -20, 2, 2, INK);
  }
  box(c, -2, -37, 4, 38, INK); box(c, -1, -36, 2, 36, '#52525B');
  for (const y of [-31, -18, -6]) box(c, -2, y, 4, 2, BRASS[2]);
};

// ---------------------------------------------------------------------------------------------------------------

/** The clapperboard, its face to us: the slate (chalked up), the striped sticks on top, the top one hinged at the left
 *  (`open` radians up). His fist on its foot (the origin). */
export const slate = (c: Ctx, _t: number, open: number) => {
  const L = -18, Wd = 36, top = -30;
  box(c, L - 1, top - 1, Wd + 2, 32, INK);
  box(c, L, top, Wd, 30, '#27272A'); box(c, L, top, Wd, 1, '#3F3F46'); box(c, L + Wd - 2, top, 2, 30, '#18181B');
  // (the chalk: the lines, the boxes, MEATHEAD 2 up top, the take)
  const CH = '#E5E7EB';
  box(c, L + 2, top + 9, Wd - 4, 1, CH); box(c, L + 2, top + 18, Wd - 4, 1, CH); box(c, L + Wd / 2, top + 9, 1, 19, CH);
  for (let i = 0; i < 8; i++) box(c, L + 4 + i * 4, top + 4 + (i % 3 === 1 ? 1 : 0), 3, 2, CH);
  box(c, L + 4, top + 12, 8, 1, CH); box(c, L + 4, top + 14, 4, 2, CH);
  box(c, L + 21, top + 12, 6, 1, CH); box(c, L + 24, top + 13, 2, 3, CH); box(c, L + 28, top + 13, 2, 3, CH);
  box(c, L + 4, top + 21, 12, 1, CH); box(c, L + 21, top + 21, 10, 1, CH); box(c, L + 4, top + 24, 6, 1, CH);
  // (the bottom stick: fixed)
  const stripes = (x: number, y: number, w: number) => {
    box(c, x - 1, y - 1, w + 2, 8, INK); box(c, x, y, w, 6, '#F8FAFC');
    for (let i = 0; i < w; i += 8) poly(c, [[x + i, y + 6], [x + i + 4, y], [x + i + 8, y], [x + i + 4, y + 6]].map(([px, py]) => [Math.min(px, x + w), py]), '#18181B', null);
  };
  stripes(L, top - 7, Wd);
  // (the top stick: on its hinge)
  c.save(); c.translate(L, top - 7); c.rotate(-open);
  stripes(0, -7, Wd);
  c.restore();
  box(c, L - 1, top - 9, 4, 4, STEEL[3]); box(c, L, top - 8, 2, 2, STEEL[1]);
};

// ---------------------------------------------------------------------------------------------------------------

/** The Mallet of Pain: a stubby wooden handle, a fat red cartoon head banded in yellow, its faces pale. His fist near
 *  the handle's end (the origin), the head out at +x, its faces up and down (±y). */
export const MALLET_HEAD: [number, number] = [56, 0];
export const mallet = (c: Ctx) => {
  box(c, -9, -4, 52, 8, INK); box(c, -8, -3, 50, 6, '#D6A35C'); box(c, -8, -3, 50, 2, '#F2C27D'); box(c, -8, 2, 50, 1, '#A16207');
  for (const x of [6, 22]) box(c, x, -3, 1, 6, '#B7843E');
  const hx = 42, hw = 28, hh = 44;
  c.fillStyle = INK; c.beginPath(); c.roundRect(hx - 1, -hh / 2 - 1, hw + 2, hh + 2, 6); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.roundRect(hx, -hh / 2, hw, hh, 5); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(hx + 2, -hh / 2 + 1, hw - 8, hh - 2);
  c.fillStyle = '#F87171'; c.fillRect(hx + 3, -hh / 2 + 3, 5, hh - 6);
  box(c, hx + 4, -hh / 2 + 4, 2, 6, '#FECACA');
  for (const y of [-hh / 2 + 6, hh / 2 - 10]) { box(c, hx, y, hw, 4, '#FACC15'); box(c, hx, y, hw, 1, '#FEF08A'); box(c, hx, y + 3, hw, 1, '#CA8A04'); }
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.ellipse(hx + hw / 2, (s * hh) / 2, hw / 2 + 1, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FCA5A5'; c.beginPath(); c.ellipse(hx + hw / 2, (s * hh) / 2, hw / 2 - 1, 3.5, 0, 0, Math.PI * 2); c.fill();
    box(c, hx + 6, (s * hh) / 2 - 2, 8, 1, '#FEE2E2');
  }
};

// ---------------------------------------------------------------------------------------------------------------

/**
 * The Otherworldly Spawner: a fat lump of purple shell on a stubby grip, a see-through green sac on top with the litter
 * squirming in it, a puckered pink hole at the business end. `shake` 0..1: the litter thrown about in there; `squeeze`
 * 0..1: the sac clenching, the hole gaping. The hole's at SPAWN_HOLE.
 */
export const SPAWN_HOLE: [number, number] = [47, -13];
export const spawner = (c: Ctx, t: number, shake = 0, squeeze = 0) => {
  // (the grip)
  box(c, -6, -8, 12, 20, INK); box(c, -5, -7, 10, 18, '#581C87'); box(c, -5, -7, 3, 18, '#7E22CE');
  for (const y of [-3, 2, 7]) box(c, -5, y, 10, 1, '#3B0764');
  // (the shell)
  lump(c, 21, -13, 27, 13, PURPLE);
  box(c, 4, -22, 26, 2, PURPLE[4]); box(c, 2, -3, 36, 2, PURPLE[0]);
  for (const x of [8, 18, 28, 36]) box(c, x, -9, 2, 1, PURPLE[1]);
  c.strokeStyle = '#9F1239'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, -12); c.quadraticCurveTo(14, -6, 26, -12); c.quadraticCurveTo(34, -16, 41, -10); c.stroke();
  c.strokeStyle = '#E11D48'; c.lineWidth = 1; c.stroke();
  // (the sac: swelling and clenching, the litter in it)
  const rx = 14 * (1 - squeeze * 0.25), ry = 11 * (1 - squeeze * 0.3) + Math.sin(t * 0.12) * 0.6;
  const sx = 17, sy = -27 + squeeze * 2;
  c.fillStyle = INK; c.beginPath(); c.ellipse(sx, sy, rx + 1, ry + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#4D7C0F'; c.beginPath(); c.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#84CC16'; c.beginPath(); c.ellipse(sx - 1, sy - 1, rx - 2, ry - 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = stipple(c, '#BEF264'); c.beginPath(); c.ellipse(sx - 3, sy - 3, rx * 0.6, ry * 0.55, 0, 0, Math.PI * 2); c.fill();
  // (the litter: little goblins, a yellow eye each, squirming; shaken, flung all over)
  for (let i = 0; i < 4; i++) {
    const a = t * (0.08 + shake * 0.5) + i * 1.7, k = 0.45 + shake * 0.35;
    const gx = Math.round(sx + Math.cos(a * (1 + i * 0.13)) * rx * k), gy = Math.round(sy + Math.sin(a * 1.3 + i) * ry * k);
    box(c, gx - 2, gy - 1, 5, 3, '#1A2E05'); box(c, gx - 1, gy - 2, 1, 1, '#1A2E05'); box(c, gx + 1, gy - 2, 1, 1, '#1A2E05');
    box(c, gx + ((i + (t >> 3)) % 2), gy - 1, 1, 1, '#FDE047');
  }
  box(c, sx - 8, sy - 7, 5, 2, '#ECFCCB'); box(c, sx - 9, sy - 5, 2, 1, '#ECFCCB');
  // (the hole: puckered, pink, wet)
  const r = 6 + Math.sin(t * 0.25) * 0.7 + squeeze * 3;
  const [hx, hy] = SPAWN_HOLE;
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx, hy, r * 0.7 + 1, r + 1, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DB2777'; c.beginPath(); c.ellipse(hx, hy, r * 0.7, r, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#F472B6'; c.beginPath(); c.ellipse(hx - 1, hy - 1, r * 0.5, r * 0.75, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#450A0A'; c.beginPath(); c.ellipse(hx + 0.5, hy, r * 0.25, r * 0.5, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; box(c, hx + Math.cos(a) * r * 0.55, hy + Math.sin(a) * r * 0.8, 1, 1, '#9D174D'); }
  box(c, hx - 2, hy - r + 1, 2, 1, '#FBCFE8');
};

// ---------------------------------------------------------------------------------------------------------------

/** The souvenir launcher: a white drainpipe taped twice, a pink squirt-gun grip under it, a red mesh bag of gift shop
 *  junk strapped on top (the Eiffel Tower and a pyramid poking out of it, jiggling). His fist on the grip (the origin). */
export const souvenir = (c: Ctx, t: number, jiggle = 0) => {
  // (the grip)
  box(c, -5, -9, 10, 18, INK); box(c, -4, -8, 8, 16, '#DB2777'); box(c, -4, -8, 2, 16, '#F472B6'); box(c, 2, -8, 2, 16, '#9D174D');
  // (the pipe)
  box(c, -16, -20, 62, 13, INK); box(c, -15, -19, 60, 11, '#E4E4E7'); box(c, -15, -19, 60, 3, '#FFFFFF'); box(c, -15, -10, 60, 2, '#A1A1AA');
  for (const x of [-4, 26]) { box(c, x, -20, 6, 13, '#9CA3AF'); box(c, x, -19, 6, 2, '#D4D4D8'); box(c, x + 1, -16, 1, 4, '#6B7280'); }
  box(c, 42, -21, 5, 15, INK); box(c, 43, -20, 3, 13, '#71717A'); box(c, -17, -21, 4, 15, INK); box(c, -16, -20, 2, 13, '#D4D4D8');
  // (the bag, bulging, jiggling; what's poking out of it)
  const j = Math.round(Math.sin(t * 0.3) * 0.6 + jiggle);
  box(c, 9, -46 + j, 2, 14, INK); box(c, 10, -45 + j, 1, 12, '#EAB308');
  poly(c, [[6, -33 + j], [10, -46 + j], [14, -33 + j]], '#CA8A04'); box(c, 7, -38 + j, 7, 1, '#FDE047');
  poly(c, [[20, -30 + j], [25, -40 + j], [30, -30 + j]], '#FCD34D'); box(c, 23, -37 + j, 2, 1, '#FEF3C7');
  c.fillStyle = INK; c.beginPath(); c.ellipse(15, -26 + j * 0.5, 17, 8, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.ellipse(15, -26 + j * 0.5, 16, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.ellipse(13, -28 + j * 0.5, 11, 4, 0, 0, Math.PI * 2); c.fill();
  for (let x = 0; x < 31; x += 3) for (let y = -32; y < -19; y += 3) if (((x + y) & 3) === 0) box(c, x, y + j * 0.5, 1, 1, '#7F1D1D');
  box(c, 4, -22, 22, 2, '#3F3F46');
};

// ---------------------------------------------------------------------------------------------------------------

/**
 * The soul sucker, carried by its handle (the origin, his fist round it), hanging under it: the purple shop vac with
 * its ghost decal, the meat grinder bolted on its top (its crank turning), the gore bag under it sloshing (`slosh`:
 * which way the blood's thrown). The hose comes off it at SUCK_HOSE; its nozzle's drawn on its own (sucker nozzle).
 */
export const SUCK_HOSE: [number, number] = [20, 24];
export const suckerBody = (c: Ctx, t: number, slosh: number) => {
  // (the gore bag under it: the blood sloshing)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, 42, 13, 9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7F1D1D'; c.beginPath(); c.ellipse(0, 42, 12, 8, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.ellipse(0, 42, 12, 8, 0, 0, Math.PI * 2); c.clip();
  c.fillStyle = '#B91C1C'; c.beginPath(); c.moveTo(-13, 41 + slosh * 4); c.lineTo(13, 41 - slosh * 4); c.lineTo(13, 52); c.lineTo(-13, 52); c.closePath(); c.fill();
  box(c, -12, 40 + Math.round(slosh * 3), 7, 1, '#EF4444'); box(c, 2, 39 - Math.round(slosh * 2), 6, 1, '#F87171');
  c.restore();
  box(c, -6, 37, 3, 2, '#FCA5A5');
  // (the handle)
  box(c, -9, -4, 18, 8, INK); box(c, -8, -3, 16, 6, '#52525B'); box(c, -8, -3, 16, 1, '#A1A1AA');
  box(c, -9, 2, 4, 6, INK); box(c, 5, 2, 4, 6, INK);
  // (the vac)
  box(c, -19, 6, 38, 30, INK); box(c, -18, 7, 36, 28, '#6D28D9'); box(c, -18, 7, 36, 4, '#8B5CF6'); box(c, -18, 7, 3, 28, '#8B5CF6');
  box(c, -18, 30, 36, 5, '#4C1D95'); box(c, 15, 7, 3, 28, '#4C1D95');
  // (the ghost decal)
  poly(c, [[-9, 26], [-9, 16], [-6, 13], [-1, 13], [2, 16], [2, 26], [0, 24], [-2, 26], [-4, 24], [-6, 26]], '#F8FAFC', '#A78BFA');
  box(c, -7, 17, 2, 2, INK); box(c, -3, 17, 2, 2, INK); box(c, -5, 21, 2, 2, INK);
  // (the grinder: a steel can on its side, the crank going round)
  box(c, 6, 9, 10, 8, INK); box(c, 7, 10, 8, 6, STEEL[2]); box(c, 7, 10, 8, 2, STEEL[4]);
  const a = t * 0.2, kx = 11 + Math.cos(a) * 5, ky = 13 + Math.sin(a) * 3;
  c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(11, 13); c.lineTo(kx, ky); c.stroke();
  box(c, kx - 1, ky - 1, 3, 3, '#A16207');
  // (the hose's coupling)
  box(c, 16, 20, 6, 8, INK); box(c, 17, 21, 4, 6, '#3F3F46');
};
/** The nozzle, at its tip (the origin), pointing `a` (radians, 0: +x). */
export const suckerNozzle = (c: Ctx, a: number) => {
  c.save(); c.rotate(a);
  box(c, -14, -4, 10, 8, INK); box(c, -13, -3, 8, 6, '#52525B'); box(c, -13, -3, 8, 1, '#A1A1AA');
  box(c, -5, -8, 6, 16, INK); box(c, -4, -7, 4, 14, '#A1A1AA'); box(c, -4, -7, 4, 2, '#E5E7EB'); box(c, -1, -7, 1, 14, '#3F3F46');
  c.restore();
};
/** The hose, from (x0, y0) to (x1, y1) (his frame), sagging. */
export const suckerHose = (c: Ctx, x0: number, y0: number, x1: number, y1: number, sag = 14) => {
  const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + sag;
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(mx, my, x1, y1); c.stroke();
  c.strokeStyle = '#52525B'; c.lineWidth = 5; c.stroke();
  c.strokeStyle = '#71717A'; c.lineWidth = 1; c.setLineDash([2, 3]); c.stroke(); c.setLineDash([]);
};
