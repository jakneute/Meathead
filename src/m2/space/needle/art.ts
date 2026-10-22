// Space Needle 2, painted (world space). A 1960s space-age interior in chrome and teal, walnut and cream, orange for
// the accents; every surface a stepped ramp lit from the upper left, inked edges, the steps dithered where they meet,
// bevels on the panels, shaded rivets, stepped glows round the lamps. Its signs are lettered by hand, in the park's
// alphabet (letters.ts: chrome Googie on the marquee, deco over the elevators, engraved brass plaques, LEDs, hand-painted
// cards; and the park's own styles from square/lettering.ts: neon tubes, the crews' stencils, enamel). Still art
// (the wall's slots, the bulkhead, the elevators' portals, the props, the big window's patches) goes down from stamps;
// what changes (the suit's case, the big window cracking, the car's readout) is drawn live.
//
//   the lobby       the ticket hall at the needle's foot: the way back out onto the drag, the elevator's doors
//   the car         the glass elevator car (riding up: the views out of it are sky.ts's)
//   the deck        the observation deck, a ring: the slots of the outer wall (windows; the suit's alcove; the elevator;
//                   the big window at the end), the bulkhead at its start, the props, the suit's case, the big window

import type { GameState } from '../../../m1/game/core/state';
import { stamp, checker, mix, tilePattern, bendFloor, steppedGlow, type Ctx } from '../../intro/art/kit';
import { GY, LOBBY0, LIFT_X, LOBBY1, CAR0, CAR1, CAR_X, D0, D1, CEIL, CASE_X, SLOT, SLOTS, slotX, slotKind, WIN_HW, WIN_TOP, WIN_BOT, WIN_R, SPEAKER_Y, type SlotKind } from './layout';
import { letters, type LetterStyle } from './letters';
import { lettering } from '../square/lettering';

const INK = '#0A0F1A';
const TEAL = ['#052A33', '#083B47', '#0D4F5D', '#126775', '#1A808C', '#2A9AA3', '#49B4B8'];
const CHROME = ['#1B2432', '#2E3A4D', '#4A5A70', '#74859C', '#A3B1C4', '#CDD6E2', '#EEF2F7'];
const ORANGE = ['#6B2410', '#A33A12', '#D2551A', '#F07A2E', '#FBA45E', '#FDCB94'];
const WALNUT = ['#24160B', '#3A2412', '#523419', '#6C4522', '#86592E', '#A0703C'];
const CREAM = ['#8F8672', '#B4AB93', '#D5CCB2', '#EAE3CD', '#F8F4E6'];
const BRASS = ['#4A3208', '#7A5614', '#A97B26', '#CC9D3C', '#E7C463', '#FBE9A6'];
const STEEL = ['#262B33', '#3A414C', '#555E6B', '#737D8B', '#97A0AC', '#C2C8D0'];
const TAPE = ['#5B6068', '#80868F', '#A5ABB3', '#C6CBD1', '#E3E6EA'];
const PUTTY = ['#6E6656', '#8E8570', '#ADA48C', '#C9C1A8'];

const box = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** Banded top to bottom through the colors (flat steps, never a smooth gradient). */
const bands = (c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length, bh = h / n;
  for (let i = 0; i < n; i++) box(c, x, y + i * bh, w, Math.ceil(bh) + 1, cols[i]);
  // (each seam dithered: a checker of the band under reaching up into the one over, where they're tall enough)
  if (bh >= 8) for (let i = 1; i < n; i++) if (cols[i] !== cols[i - 1]) checker(c, Math.round(x), Math.round(y + i * bh) - 2, Math.round(w), 2, cols[i], 0);
};
/** Banded left to right (a column lit from the left). */
const vbands = (c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length, bw = w / n;
  for (let i = 0; i < n; i++) box(c, x + i * bw, y, Math.ceil(bw) + 1, h, cols[i]);
  if (bw >= 8) for (let i = 1; i < n; i++) if (cols[i] !== cols[i - 1]) checker(c, Math.round(x + i * bw) - 2, Math.round(y), 2, Math.round(h), cols[i], 0);
};
/** A chrome column, lit down its left, inked either side; a cap and a base. */
const column = (c: Ctx, x: number, y: number, w: number, h: number) => {
  vbands(c, x, y, w, h, [CHROME[4], CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[2], CHROME[1]]);
  box(c, x - 1, y, 1, h, INK); box(c, x + w, y, 1, h, INK);
};
/** A rounded rectangle, as a path. */
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
/** A raised panel: inked, its face, lit along its top and left, shaded along its bottom and right, the seams dithered. */
const bevel = (c: Ctx, x: number, y: number, w: number, h: number, r: string[], e = 2) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK);
  box(c, x, y, w, h, r[2]);
  box(c, x, y, w, e, r[4]); box(c, x, y, e, h, r[3]);
  box(c, x, y + h - e, w, e, r[0]); box(c, x + w - e, y, e, h, r[1]);
  checker(c, x + e, y + e, w - e * 2, 2, r[3], 0); checker(c, x + e, y + h - e - 2, w - e * 2, 2, r[1], 1);
};
/** A rivet or screw head: lit upper left, dark lower right. */
const rivet = (c: Ctx, x: number, y: number, r = CHROME) => { box(c, x, y, 3, 3, r[1]); box(c, x, y, 2, 2, r[4]); box(c, x, y, 1, 1, r[6] ?? r[5]); };
/** A four-point starburst (the decals, the lamps). */
const burst = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = col; c.beginPath();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 - Math.PI / 2, d = k % 2 ? r * 0.28 : r; c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
  c.closePath(); c.fill();
};
/** An inked, shaded starburst: dark rim, the orange in steps toward its lit core. */
const star = (c: Ctx, x: number, y: number, r: number) => {
  burst(c, x, y, r + 2, INK); burst(c, x, y, r, ORANGE[1]); burst(c, x - 1, y - 1, r * 0.8, ORANGE[3]);
  burst(c, x - 1, y - 1, r * 0.5, ORANGE[4]); burst(c, x - 1, y - 1, r * 0.25, ORANGE[5]); box(c, x - 2, y - 2, 2, 2, '#FFFFFF');
};
/** Background stuff (benches, viewers, the cart) dimmed back toward the wall, so none of it reads as somewhere to stand. */
const dimc = (col: string) => mix(col, '#0D3440', 0.42);
/** A hazard band (x0..x1, from y down h): yellow and black stripes slanting, then shaded in steps down it (a lit lip,
 *  the paint's upper half catching the light, its foot in shadow and scuffed), the seams dithered. */
const hazard = (c: Ctx, x0: number, x1: number, y: number, h: number) => {
  c.save(); c.beginPath(); c.rect(x0, y, x1 - x0, h); c.clip();
  box(c, x0, y, x1 - x0, h, '#1C1917');
  for (let x = x0 - h; x < x1; x += 24) {
    c.fillStyle = '#EAB308'; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + h / 2, y); c.lineTo(x + h / 2 + 12, y); c.lineTo(x + 12, y + h); c.closePath(); c.fill();
    // (each yellow stripe's trailing edge a shade darker: the paint's thickness)
    c.fillStyle = '#A16207'; c.beginPath(); c.moveTo(x + 10, y + h); c.lineTo(x + h / 2 + 10, y); c.lineTo(x + h / 2 + 12, y); c.lineTo(x + 12, y + h); c.closePath(); c.fill();
  }
  const w = x1 - x0, a = Math.round(h * 0.3), b = Math.round(h * 0.7);
  box(c, x0, y, w, 2, 'rgba(255, 251, 220, 0.55)');
  box(c, x0, y + 2, w, a - 2, 'rgba(255, 255, 255, 0.12)'); checker(c, x0, y + a, w, 2, 'rgba(255, 255, 255, 0.12)', 0);
  checker(c, x0, y + b - 2, w, 2, 'rgba(0, 0, 0, 0.22)', 1); box(c, x0, y + b, w, h - b, 'rgba(0, 0, 0, 0.22)');
  checker(c, x0, y + h - 3, w, 3, 'rgba(0, 0, 0, 0.3)', 0);
  for (let x = x0 + 9; x < x1; x += 31) box(c, x + ((x * 7) % 11), y + b + ((x * 3) % Math.max(1, h - b - 1)), 3 + (x % 4), 1, 'rgba(255, 255, 255, 0.18)');
  c.restore();
};

// the sign families (letters.ts)
const DECO: LetterStyle = { family: 'deco', px: 2, py: 2, fill: [ORANGE[5], ORANGE[4], ORANGE[3], ORANGE[2]], ink: INK, shadow: ORANGE[0], drop: 1 };
const brassType = (fill = BRASS[0]): LetterStyle => ({ family: 'brass', px: 1, fill: [fill, mix(fill, BRASS[2], 0.3)], hi: BRASS[5] });
/** The crews' stencil (the park's, twice size), sprayed on steel: centered on x, sitting on the baseline y like letters(). */
const stencil = (c: Ctx, s: string, x: number, y: number, col = '#EAB308', bg: string = STEEL[1]) => lettering(c, s, x, y - 7, 'stencil2', col, bg);
/** The park's neon (lit: it's indoors), centered on x, sitting on the baseline y like letters(). */
const neon = (c: Ctx, s: string, x: number, y: number, big: boolean, col: string, bg: string) => lettering(c, s, x, y - 7, big ? 'neon2' : 'neon', col, bg, true);

/** A brass plaque on walnut: lines engraved (its middle at x, its top at y). */
const brassPlaque = (c: Ctx, x: number, y: number, w: number, lines: string[], dimmed = false) => {
  const h = 10 + lines.length * 11, d = dimmed ? dimc : (s: string) => s;
  rr(c, x - w / 2 - 4, y - 4, w + 8, h + 8, 3); c.fillStyle = INK; c.fill();
  rr(c, x - w / 2 - 3, y - 3, w + 6, h + 6, 3); c.fillStyle = d(WALNUT[2]); c.fill();
  box(c, x - w / 2 - 3, y - 3, w + 6, 1, d(WALNUT[4]));
  bevel(c, x - w / 2, y, w, h, BRASS.slice(1).map(d));
  checker(c, x - w / 2 + 2, y + h / 2, w - 4, 2, d(BRASS[2]), 0);
  for (const sx of [x - w / 2 + 3, x + w / 2 - 6]) { rivet(c, sx, y + 3, BRASS.map(d)); rivet(c, sx, y + h - 6, BRASS.map(d)); }
  lines.forEach((s, i) => letters(c, s, x, y + 13 + i * 11, brassType(d(BRASS[0]))));
};

// ---------------------------------------------------------------------------------------------------------------
// The deck's slab, its ceiling, its floor (common to every slot): from x0 to x1

const ceilingAndFloor = (c: Ctx, x0: number, x1: number) => {
  const w = x1 - x0;
  // the hull over the ceiling (what's above it on screen): dark, banded, panel seams, a riveted seam
  bands(c, x0, CEIL - 220, w, 220, [CHROME[0], '#141C28', CHROME[1], '#202C3C', CHROME[1], CHROME[2]]);
  for (let x = x0 + 37; x < x1; x += 75) { box(c, x, CEIL - 200, 1, 190, INK); box(c, x + 1, CEIL - 200, 1, 190, '#36445A'); }
  for (const y of [CEIL - 150, CEIL - 80]) { box(c, x0, y, w, 1, INK); box(c, x0, y + 1, w, 1, '#36445A'); }
  for (let x = x0 + 12; x < x1; x += 24) rivet(c, x, CEIL - 31);
  // the soffit: a chrome trim, lit along its bottom edge
  bands(c, x0, CEIL - 8, w, 26, [CHROME[2], CHROME[3], CHROME[4], CHROME[5]]);
  box(c, x0, CEIL - 9, w, 1, INK);
  box(c, x0, CEIL + 18, w, 2, CHROME[6]); box(c, x0, CEIL + 20, w, 1, INK);
  // (the cove light along under it: a warm band, its light falling down the wall in dithered steps)
  box(c, x0, CEIL + 21, w, 3, '#FDE68A'); box(c, x0, CEIL + 21, w, 1, '#FFFBEB');
  checker(c, x0, CEIL + 24, w, 2, 'rgba(253, 230, 138, 0.6)');
  box(c, x0, CEIL + 24, w, 6, 'rgba(253, 230, 138, 0.10)');
  // the floor: the lit lip (standable), terrazzo (brass divider strips, chips of stone), then the slab's face
  box(c, x0, GY, w, 3, '#F8FAFC'); box(c, x0, GY + 3, w, 2, CREAM[4]);
  bands(c, x0, GY + 5, w, 22, [CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
  for (let x = x0; x < x1; x += 7) { const k = (x * 13) % 17; box(c, x + (k % 5), GY + 8 + (k % 14), 2, 1, k % 3 ? ORANGE[3] : TEAL[4]); }
  for (let x = x0 + 50; x < x1; x += 100) { box(c, x, GY + 5, 1, 22, BRASS[2]); box(c, x + 1, GY + 5, 1, 22, BRASS[4]); }
  box(c, x0, GY + 27, w, 2, INK);
  bands(c, x0, GY + 29, w, 30, [CHROME[5], CHROME[4], CHROME[3], CHROME[2]]);
  for (let x = x0 + 20; x < x1; x += 40) rivet(c, x, GY + 42);
  box(c, x0, GY + 59, w, 4, ORANGE[3]); box(c, x0, GY + 59, w, 1, ORANGE[5]); box(c, x0, GY + 63, w, 2, ORANGE[1]);
  bands(c, x0, GY + 65, w, 140, [TEAL[2], TEAL[1], TEAL[1], TEAL[0], '#03161B', '#020D10']);
};

/** The window's chrome frame (the slot's middle at 0): a rounded ring in steps, the reveal inside it, its bolts. */
const windowFrame = (c: Ctx) => {
  const H = WIN_BOT - WIN_TOP;
  rr(c, -WIN_HW - 11, WIN_TOP - 11, WIN_HW * 2 + 22, H + 22, WIN_R + 9); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -WIN_HW - 10, WIN_TOP - 10, WIN_HW * 2 + 20, H + 20, WIN_R + 8); c.clip();
  bands(c, -WIN_HW - 10, WIN_TOP - 10, WIN_HW * 2 + 20, H + 20, [CHROME[6], CHROME[5], CHROME[5], CHROME[4], CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
  // (lit down its left side, shaded down its right)
  checker(c, -WIN_HW - 10, WIN_TOP - 10, 4, H + 20, CHROME[6], 0); checker(c, WIN_HW + 6, WIN_TOP - 10, 4, H + 20, CHROME[1], 0);
  c.restore();
  // the reveal: in shadow along its top and left (the frame's lip over it), lit along its bottom and right
  rr(c, -WIN_HW - 4, WIN_TOP - 4, WIN_HW * 2 + 8, H + 8, WIN_R + 3); c.fillStyle = CHROME[5]; c.fill();
  rr(c, -WIN_HW - 4, WIN_TOP - 4, WIN_HW * 2 + 6, H + 6, WIN_R + 3); c.fillStyle = CHROME[1]; c.fill();
  rr(c, -WIN_HW - 1, WIN_TOP - 1, WIN_HW * 2 + 2, H + 2, WIN_R + 1); c.fillStyle = INK; c.fill();
  c.save(); c.globalCompositeOperation = 'destination-out'; rr(c, -WIN_HW, WIN_TOP, WIN_HW * 2, H, WIN_R); c.fill(); c.restore();
  // (its bolts round the ring)
  for (const [bx, by] of [[-WIN_HW - 8, WIN_TOP + 60], [-WIN_HW - 8, WIN_BOT - 60], [WIN_HW + 5, WIN_TOP + 60], [WIN_HW + 5, WIN_BOT - 60], [-40, WIN_TOP - 8], [37, WIN_TOP - 8], [-40, WIN_BOT + 5], [37, WIN_BOT + 5]]) rivet(c, bx, by);
};
/** A speaker grille in the soffit band (the PA): chrome, slotted, two screws. */
const speaker = (c: Ctx) => {
  rr(c, -16, SPEAKER_Y - 8, 32, 14, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -15, SPEAKER_Y - 7, 30, 12, 5); c.clip(); bands(c, -15, SPEAKER_Y - 7, 30, 12, [CHROME[5], CHROME[4], CHROME[3], CHROME[2]]); c.restore();
  for (let k = -9; k <= 7; k += 4) { box(c, k, SPEAKER_Y - 4, 2, 7, INK); box(c, k, SPEAKER_Y + 3, 2, 1, CHROME[6]); }
  box(c, -13, SPEAKER_Y - 2, 2, 2, CHROME[1]); box(c, 11, SPEAKER_Y - 2, 2, 2, CHROME[1]);
};
/** The walnut dado and the handrail over it (the handrail dimmed: not somewhere to stand), the kick plate. */
const dado = (c: Ctx, L: number, w: number) => {
  bands(c, L, WIN_BOT + 14, w, GY - WIN_BOT - 14, [WALNUT[3], WALNUT[2], WALNUT[2], WALNUT[1]]);
  box(c, L, WIN_BOT + 14, w, 2, WALNUT[4]); box(c, L, WIN_BOT + 13, w, 1, INK);
  for (let x = L + 10; x < L + w; x += 20) {
    box(c, x, WIN_BOT + 18, 1, GY - WIN_BOT - 32, WALNUT[0]); box(c, x + 1, WIN_BOT + 18, 1, GY - WIN_BOT - 32, WALNUT[4]);
    // (the grain: a few dark streaks down each board, wavering)
    for (let k = 0; k < 3; k++) { const gx = x + 4 + k * 5, s = (x * 7 + k * 31) % 13; for (let y = WIN_BOT + 20 + s; y < GY - 16; y += 9) box(c, gx + (((y + s) / 9) % 2 > 1 ? 1 : 0), y, 1, 5, WALNUT[1]); }
  }
  // the handrail: a chrome tube in steps, on brackets
  for (let x = L + 30; x < L + w; x += 75) { box(c, x - 1, GY - 70, 4, 10, INK); box(c, x, GY - 70, 2, 9, dimc(CHROME[3])); }
  box(c, L, GY - 75, w, 7, INK);
  box(c, L, GY - 74, w, 2, dimc(CHROME[5])); box(c, L, GY - 72, w, 2, dimc(CHROME[4])); box(c, L, GY - 70, w, 1, dimc(CHROME[2]));
  // the kick plate: brushed steel, scuffed
  box(c, L, GY - 13, w, 1, INK);
  bands(c, L, GY - 12, w, 12, [CHROME[3], CHROME[2], CHROME[1]]);
  for (let x = L + 7; x < L + w; x += 23) box(c, x + ((x * 5) % 9), GY - 8 + ((x * 3) % 4), 4 + (x % 5), 1, CHROME[4]);
};

/** One slot's wall (CEIL+20 down to GY), centered on 0: its pilasters, its panels, and what's in it. */
const paintSlot = (c: Ctx, kind: SlotKind) => {
  const L = -SLOT / 2, R = SLOT / 2;
  const top = CEIL + 26, bot = GY;
  // the upper band: teal, banded, a pinstripe along its foot, starbursts either side, the speaker's grille
  bands(c, L, top, SLOT, WIN_TOP - top - 12, [TEAL[3], TEAL[3], TEAL[2]]);
  checker(c, L, top, SLOT, 2, TEAL[1], 0);
  for (const s of [-1, 1]) star(c, s * 78, top + 30, 10);
  speaker(c);
  if (kind === 'big') {
    // floor to ceiling glass: just its frame round the top and the sill along the floor (the glass itself, its
    // patches, its cracks, its glare: drawEndGlass, live)
    box(c, L, WIN_TOP - 13, SLOT, 1, INK);
    bands(c, L, WIN_TOP - 12, SLOT, 12, [CHROME[6], CHROME[5], CHROME[4], CHROME[2]]);
    box(c, L, GY - 15, SLOT, 1, INK);
    bands(c, L, GY - 14, SLOT, 14, [CHROME[5], CHROME[4], CHROME[3], CHROME[1]]);
    for (let x = L + 24; x < R; x += 40) { rivet(c, x, WIN_TOP - 8); rivet(c, x, GY - 9); }
    c.save(); c.globalCompositeOperation = 'destination-out'; box(c, L + 12, WIN_TOP, SLOT - 12, GY - 14 - WIN_TOP, '#000'); c.restore();
    column(c, L, top, 16, bot - top);
    return;
  }
  // the wall's panels, round whatever's in the slot: banded, seams between them
  bands(c, L, WIN_TOP - 12, SLOT, GY - WIN_TOP + 12, [TEAL[4], TEAL[3], TEAL[3], TEAL[2], TEAL[2]]);
  box(c, L, WIN_TOP - 13, SLOT, 1, TEAL[1]); box(c, L, WIN_TOP - 12, SLOT, 1, TEAL[5]);
  for (const sx of [L + 26, R - 27]) { box(c, sx, WIN_TOP - 10, 1, WIN_BOT - WIN_TOP + 22, TEAL[1]); box(c, sx + 1, WIN_TOP - 10, 1, WIN_BOT - WIN_TOP + 22, TEAL[5]); }
  dado(c, L, SLOT);
  if (kind === 'window') {
    windowFrame(c);
    c.save(); rr(c, -WIN_HW, WIN_TOP, WIN_HW * 2, WIN_BOT - WIN_TOP, WIN_R); c.clip();
    glare(c, -WIN_HW, WIN_TOP, WIN_HW * 2, WIN_BOT - WIN_TOP);
    c.restore();
    // (a chrome sill under it, a little lip of light: dimmed, not a ledge)
    box(c, -WIN_HW - 15, WIN_BOT + 7, WIN_HW * 2 + 30, 8, INK);
    box(c, -WIN_HW - 14, WIN_BOT + 8, WIN_HW * 2 + 28, 2, dimc(CHROME[6])); box(c, -WIN_HW - 14, WIN_BOT + 10, WIN_HW * 2 + 28, 4, dimc(CHROME[4]));
  } else if (kind === 'suit') {
    // the alcove for the case: a recess, cream, banded, lit from a lamp in its head; a spotlight cone down it
    rr(c, -97, WIN_TOP - 21, 194, GY - WIN_TOP + 9, 15); c.fillStyle = INK; c.fill();
    rr(c, -96, WIN_TOP - 20, 192, GY - WIN_TOP + 8, 14); c.fillStyle = CHROME[4]; c.fill();
    rr(c, -96, WIN_TOP - 20, 192, 30, 14); c.fillStyle = CHROME[6]; c.fill();
    c.save(); rr(c, -92, WIN_TOP - 16, 184, GY - WIN_TOP + 4, 11); c.clip();
    bands(c, -92, WIN_TOP - 16, 184, GY - WIN_TOP + 4, [CREAM[4], CREAM[3], CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
    // (the recess's inner edge: in shadow down the left and along the top, lit along the right)
    box(c, -92, WIN_TOP - 16, 5, GY - WIN_TOP + 4, CREAM[1]); checker(c, -87, WIN_TOP - 16, 2, GY - WIN_TOP + 4, CREAM[1], 0);
    box(c, 87, WIN_TOP - 16, 5, GY - WIN_TOP + 4, '#FFFDF5');
    // (the cone: stepped, two bands of it)
    for (const [a, wTop, wBot] of [[0.12, 22, 78], [0.12, 14, 52]] as const) {
      c.fillStyle = `rgba(255, 251, 235, ${a})`; c.beginPath(); c.moveTo(-wTop, WIN_TOP - 12); c.lineTo(wTop, WIN_TOP - 12); c.lineTo(wBot, GY); c.lineTo(-wBot, GY); c.closePath(); c.fill();
    }
    c.restore();
    // (the lamp: a chrome can, its lens lit)
    box(c, -17, WIN_TOP - 27, 34, 10, INK); bands(c, -16, WIN_TOP - 26, 32, 8, [CHROME[6], CHROME[5], CHROME[3]]);
    box(c, -12, WIN_TOP - 17, 24, 3, '#FFFBEB'); box(c, -12, WIN_TOP - 14, 24, 1, '#FDE68A');
    letters(c, 'THE REAL THING', 0, WIN_TOP + 22, { family: 'deco', px: 2, py: 2, fill: [ORANGE[3], ORANGE[2], ORANGE[1], ORANGE[0]], ink: WALNUT[0], shadow: CREAM[1], drop: 2 });
    box(c, -60, WIN_TOP + 27, 120, 1, ORANGE[2]); box(c, -60, WIN_TOP + 28, 120, 1, CREAM[4]);
  } else if (kind === 'lift') {
    elevatorPortal(c, 'ELEVATOR', null, 194, 128, 160);
    brassPlaque(c, 0, GY - 312, 98, ['ALTITUDE', '62 MILES']);
  }
  // the pilasters between the slots
  column(c, L, top, 16, bot - top);
};
/** An elevator's portal (centered on 0, its foot on GY): chrome, banded, inked, a header with its deco lettering, the
 *  doors shut (brushed, an etched starburst each), the starburst over it, the call panel with its lit buttons. */
const elevatorPortal = (c: Ctx, head: string, sub: string | null, h: number, w: number, doorH: number) => {
  const hw = w / 2, dw = hw - 12;
  rr(c, -hw - 2, GY - h - 2, w + 4, h + 2, 10); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -hw, GY - h, w, h, 9); c.clip();
  vbands(c, -hw, GY - h, w, h, [CHROME[5], CHROME[6], CHROME[5], CHROME[4], CHROME[4], CHROME[3], CHROME[2]]);
  bands(c, -hw, GY - h, w, h - doorH, [CHROME[6], CHROME[5], CHROME[5], CHROME[4]]);
  box(c, -hw, GY - doorH - 2, w, 1, CHROME[2]);
  c.restore();
  // (the header's lettering)
  if (sub) {
    letters(c, head, 0, GY - doorH - 17, DECO);
    letters(c, sub, 0, GY - doorH - 6, brassType(TEAL[0]));
  } else letters(c, head, 0, GY - doorH - 12, DECO);
  // the doors: brushed (fine streaks), the seam between them, etched starbursts, a lit edge on the left one
  box(c, -dw - 1, GY - doorH - 1, dw * 2 + 2, doorH + 1, INK);
  vbands(c, -dw, GY - doorH, dw, doorH, [CHROME[4], CHROME[5], CHROME[5], CHROME[4], CHROME[3]]);
  vbands(c, 0, GY - doorH, dw, doorH, [CHROME[4], CHROME[3], CHROME[3], CHROME[2], CHROME[2]]);
  for (let y = GY - doorH + 6; y < GY - 4; y += 7) { box(c, -dw + ((y * 7) % 11), y, 6 + (y % 9), 1, CHROME[6]); box(c, 4 + ((y * 5) % 13), y + 3, 5 + (y % 7), 1, CHROME[1]); }
  box(c, -1, GY - doorH, 2, doorH, INK); box(c, -3, GY - doorH, 1, doorH, CHROME[6]);
  for (const s of [-1, 1]) { burst(c, s * dw / 2, GY - doorH * 0.58, 13, INK); burst(c, s * dw / 2, GY - doorH * 0.58, 12, s < 0 ? CHROME[6] : CHROME[4]); burst(c, s * dw / 2 - 1, GY - doorH * 0.58 - 1, 5, s < 0 ? '#FFFFFF' : CHROME[5]); burst(c, s * dw / 2, GY - doorH * 0.58, 3, CHROME[2]); }
  box(c, -dw, GY - 6, dw * 2, 6, CHROME[1]); box(c, -dw, GY - 6, dw * 2, 1, CHROME[4]);
  // the starburst over it
  star(c, 0, GY - h - 20, 22);
  // the call panel: chrome, its up/down buttons (the up one lit, a glow), a screw either end
  const px = hw + 12;
  rr(c, px - 1, GY - 125, 18, 36, 3); c.fillStyle = INK; c.fill();
  c.save(); rr(c, px, GY - 124, 16, 34, 2); c.clip(); vbands(c, px, GY - 124, 16, 34, [CHROME[5], CHROME[4], CHROME[3], CHROME[2]]); c.restore();
  rivet(c, px + 6, GY - 122); rivet(c, px + 6, GY - 95);
  steppedGlow(c, px + 8, GY - 112, 9, '#FBA45E', 0.35, 0.05, 3);
  c.fillStyle = INK; c.beginPath(); c.arc(px + 8, GY - 112, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = ORANGE[3]; c.beginPath(); c.arc(px + 8, GY - 112, 3, 0, Math.PI * 2); c.fill(); box(c, px + 6, GY - 114, 2, 1, '#FFFFFF');
  c.fillStyle = INK; c.beginPath(); c.arc(px + 8, GY - 102, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(px + 8, GY - 102, 3, 0, Math.PI * 2); c.fill();
};
/** The glare across a pane: two pale diagonal bands, a glint, banded thin. */
const glare = (c: Ctx, x: number, y: number, w: number, h: number) => {
  c.fillStyle = 'rgba(186, 230, 253, 0.05)'; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(255, 255, 255, 0.07)';
  c.beginPath(); c.moveTo(x + w * 0.1, y); c.lineTo(x + w * 0.36, y); c.lineTo(x + w * 0.06, y + h); c.lineTo(x - w * 0.2, y + h); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.045)';
  c.beginPath(); c.moveTo(x + w * 0.46, y); c.lineTo(x + w * 0.54, y); c.lineTo(x + w * 0.24, y + h); c.lineTo(x + w * 0.16, y + h); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.5)'; c.fillRect(x + w * 0.78, y + 12, 6, 2); c.fillRect(x + w * 0.78 + 2, y + 10, 2, 6);
};

/** The bulkhead at the deck's start: the end of the ring (the outside of the deck past it), a heavy riveted wall. */
const paintBulkhead = (c: Ctx) => {
  // (from 0 to 320 left of the deck's start)
  const L = -320, w = 320;
  bands(c, L, CEIL - 220, w, GY + 440 - CEIL, [STEEL[1], STEEL[2], STEEL[2], STEEL[1], STEEL[1], STEEL[0]]);
  // its face: big plates, bevelled, riveted round, streaked with grime under the rivets
  for (let y = CEIL + 10; y < GY - 20; y += 110) for (let x = L + 20; x < -30; x += 120) {
    const pw = Math.min(108, -36 - x);
    if (pw < 20) continue;
    bevel(c, x, y, pw, 98, [STEEL[0], STEEL[1], STEEL[2], STEEL[3], STEEL[4]], 3);
    for (const [rx, ry] of [[6, 8], [pw - 9, 8], [6, 88], [pw - 9, 88], [Math.round(pw / 2) - 1, 8], [Math.round(pw / 2) - 1, 88]]) { rivet(c, x + rx, y + ry, STEEL); checker(c, x + rx, y + ry + 4, 2, 10, STEEL[1], 0); }
  }
  // the hatch that's welded shut: a round-cornered door outline, its wheel, the weld bead all the way round
  const hx = -196, hy = GY - 340;
  rr(c, hx - 46, hy, 92, 130, 18); c.fillStyle = INK; c.fill();
  c.save(); rr(c, hx - 45, hy + 1, 90, 128, 17); c.clip(); bands(c, hx - 45, hy + 1, 90, 128, [STEEL[4], STEEL[3], STEEL[3], STEEL[2], STEEL[2], STEEL[1]]); c.restore();
  for (let k = 0; k < 64; k++) {
    const t = k / 64, a = t * Math.PI * 2, ex = hx + Math.cos(a) * 46, ey = hy + 65 + Math.sin(a) * 66;
    box(c, Math.max(hx - 47, Math.min(hx + 44, ex)), Math.max(hy - 1, Math.min(hy + 128, ey)), 3, 3, k % 2 ? '#9C8B6E' : '#C8B48C');
  }
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(hx, hy + 62, 20, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = STEEL[4]; c.lineWidth = 2; c.beginPath(); c.arc(hx, hy + 62, 20, Math.PI, Math.PI * 1.9); c.stroke();
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.4; box(c, hx + Math.cos(a) * 20 - 2, hy + 62 + Math.sin(a) * 20 - 2, 4, 4, STEEL[1]); }
  box(c, hx - 3, hy + 59, 6, 6, STEEL[2]);
  // the hazard band along its foot: inked stripes, lit along their top
  hazard(c, L, 0, GY - 24, 24);
  box(c, L, GY - 26, w, 2, INK);
  // the deck's end: a thick chrome jamb where it meets the ring
  column(c, -34, CEIL - 220, 34, GY + 440 - CEIL);
  box(c, L, GY, w, 3, CHROME[5]);
  // the stencilled words, on a dark plate of their own
  bevel(c, -262, GY - 194, 184, 76, [STEEL[0], STEEL[0], STEEL[1], STEEL[2], STEEL[3]], 2);
  for (const [rx, ry] of [[4, 4], [175, 4], [4, 67], [175, 67]]) rivet(c, -262 + rx, GY - 194 + ry, STEEL);
  stencil(c, 'END OF DECK', -170, GY - 166);
  stencil(c, 'THANK YOU', -170, GY - 146, CHROME[5]);
  stencil(c, 'FOR ROTATING', -170, GY - 128, CHROME[5]);
};

/** A bench, mid-century: a walnut frame, an orange cushion tufted, hairpin legs (dimmed: background). */
const paintBench = (c: Ctx) => {
  const d = dimc;
  // (its shadow on the floor)
  checker(c, -68, GY - 3, 136, 3, 'rgba(0, 0, 0, 0.3)', 0);
  for (const x of [-60, -52, 50, 58]) { box(c, x - 1, GY - 25, 4, 25, INK); box(c, x, GY - 25, 1, 25, d(CHROME[5])); box(c, x + 1, GY - 25, 1, 25, d(CHROME[3])); }
  box(c, -73, GY - 31, 146, 8, INK);
  bands(c, -72, GY - 30, 144, 6, [d(WALNUT[4]), d(WALNUT[3]), d(WALNUT[2])]);
  box(c, -72, GY - 30, 144, 1, d(WALNUT[5]));
  rr(c, -71, GY - 42, 142, 13, 4); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -70, GY - 41, 140, 11, 3); c.clip(); bands(c, -70, GY - 41, 140, 11, [d(ORANGE[4]), d(ORANGE[3]), d(ORANGE[2]), d(ORANGE[1])]); c.restore();
  for (let x = -56; x <= 56; x += 16) { box(c, x, GY - 37, 2, 2, d(ORANGE[0])); box(c, x - 3, GY - 40, 2, 1, d(ORANGE[5])); }
};
/** A coin viewer on a post (the tower kind), turned to the window (dimmed). */
const paintViewer = (c: Ctx) => {
  const d = dimc;
  checker(c, -18, GY - 3, 36, 3, 'rgba(0, 0, 0, 0.3)', 0);
  // the post and its foot
  box(c, -5, GY - 97, 10, 92, INK); vbands(c, -4, GY - 97, 8, 92, [d(CHROME[5]), d(CHROME[4]), d(CHROME[3]), d(CHROME[2])]);
  rr(c, -17, GY - 8, 34, 8, 2); c.fillStyle = INK; c.fill();
  bands(c, -16, GY - 7, 32, 7, [d(CHROME[4]), d(CHROME[3]), d(CHROME[2])]);
  // the head: a rounded box in teal steps, its hood, the eyepieces (chrome rings, dark glass), the coin box
  rr(c, -21, GY - 134, 42, 38, 9); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -20, GY - 133, 40, 36, 8); c.clip();
  bands(c, -20, GY - 133, 40, 36, [d(TEAL[6]), d(TEAL[5]), d(TEAL[4]), d(TEAL[3]), d(TEAL[2])]);
  box(c, -20, GY - 133, 4, 36, d(TEAL[6])); box(c, 16, GY - 133, 4, 36, d(TEAL[2]));
  c.restore();
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.arc(s * 9, GY - 120, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = d(CHROME[5]); c.beginPath(); c.arc(s * 9, GY - 120, 6, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0B1220'; c.beginPath(); c.arc(s * 9, GY - 120, 4, 0, Math.PI * 2); c.fill();
    box(c, s * 9 - 2, GY - 122, 2, 2, '#7DD3FC');
  }
  box(c, -14, GY - 104, 28, 9, INK); bands(c, -13, GY - 103, 26, 7, [d(CHROME[4]), d(CHROME[3]), d(CHROME[2])]);
  box(c, -2, GY - 102, 4, 4, INK);
  letters(c, '25¢', 0, GY - 82, brassType(d(CHROME[0])));
};
/** The gift cart: a striped awning, the freezer, its hand-painted sign (dimmed). */
const paintCart = (c: Ctx) => {
  const d = dimc;
  checker(c, -66, GY - 3, 132, 3, 'rgba(0, 0, 0, 0.3)', 0);
  // the poles
  for (const s of [-1, 1]) { box(c, s * 62 - 3, GY - 160, 6, 110, INK); box(c, s * 62 - 2, GY - 160, 2, 110, d(CHROME[5])); box(c, s * 62, GY - 160, 2, 110, d(CHROME[3])); }
  // the awning: a chrome rail, the stripes scalloped, each scallop shaded along its curve
  box(c, -75, GY - 167, 150, 8, INK); bands(c, -74, GY - 166, 148, 6, [d(CHROME[6]), d(CHROME[4]), d(CHROME[2])]);
  for (let k = 0; k < 8; k++) {
    const x = -72 + k * 18, col = k % 2 ? CREAM : ORANGE.slice(1);
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 1, GY - 160); c.lineTo(x + 19, GY - 160); c.lineTo(x + 19, GY - 145); c.quadraticCurveTo(x + 9, GY - 135, x - 1, GY - 145); c.fill();
    c.fillStyle = d(col[3]); c.beginPath(); c.moveTo(x, GY - 160); c.lineTo(x + 18, GY - 160); c.lineTo(x + 18, GY - 146); c.quadraticCurveTo(x + 9, GY - 137, x, GY - 146); c.fill();
    box(c, x, GY - 160, 18, 4, d(col[4])); box(c, x + 13, GY - 156, 5, 9, d(col[1]));
  }
  // the freezer: inked, teal in steps, a chrome lid, the foil packets stacked on it
  rr(c, -67, GY - 65, 134, 54, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -66, GY - 64, 132, 52, 5); c.clip();
  bands(c, -66, GY - 64, 132, 52, [d(TEAL[6]), d(TEAL[5]), d(TEAL[4]), d(TEAL[4]), d(TEAL[3]), d(TEAL[2])]);
  box(c, -66, GY - 64, 4, 52, d(TEAL[6])); box(c, 62, GY - 64, 4, 52, d(TEAL[2]));
  c.restore();
  box(c, -68, GY - 68, 136, 6, INK); bands(c, -67, GY - 67, 134, 4, [d(CHROME[6]), d(CHROME[4])]);
  for (let k = 0; k < 5; k++) {
    const px = -52 + k * 22, ph = 11 + (k % 2) * 2;
    box(c, px - 1, GY - 68 - ph - 1, 16, ph + 1, INK);
    bands(c, px, GY - 68 - ph, 14, ph, [d(CHROME[6]), d(k % 2 ? CHROME[5] : '#C4B5FD'), d(CHROME[3])]);
    box(c, px + 3, GY - 68 - ph + 4, 8, 3, d(ORANGE[3]));
  }
  // the sign: a cream card taped on, hand-painted
  box(c, -55, GY - 57, 110, 32, INK);
  bands(c, -54, GY - 56, 108, 30, [d(CREAM[4]), d(CREAM[3]), d(CREAM[3])]);
  box(c, -50, GY - 59, 10, 5, d(TAPE[3])); box(c, 40, GY - 59, 10, 5, d(TAPE[3]));
  letters(c, 'ASTRONAUT', 0, GY - 43, { family: 'painted', px: 1, fill: d(TEAL[1]), seed: 3 });
  letters(c, 'ICE CREAM $14', 0, GY - 31, { family: 'painted', px: 1, fill: d('#B91C1C'), seed: 9 });
  // the wheels
  for (const s of [-1, 1]) {
    c.fillStyle = INK; c.beginPath(); c.arc(s * 44, GY - 8, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = d(CHROME[1]); c.beginPath(); c.arc(s * 44, GY - 8, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = d(CHROME[4]); c.beginPath(); c.arc(s * 44 - 1, GY - 9, 3, 0, Math.PI * 2); c.fill();
  }
};
/** A sputnik floor lamp: a chrome ball on a stem, spikes out of it each tipped with a lit bulb (dimmed; its bulbs lit). */
const paintSputnik = (c: Ctx) => {
  const d = dimc;
  checker(c, -18, GY - 3, 36, 3, 'rgba(0, 0, 0, 0.3)', 0);
  box(c, -3, GY - 140, 6, 140, INK); box(c, -2, GY - 140, 2, 140, d(CHROME[5])); box(c, 0, GY - 140, 2, 140, d(CHROME[3]));
  rr(c, -19, GY - 6, 38, 6, 3); c.fillStyle = INK; c.fill(); bands(c, -18, GY - 5, 36, 5, [d(CHROME[5]), d(CHROME[3])]);
  steppedGlow(c, 0, GY - 150, 48, '#FDE68A', 0.16, 0.02, 4);
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, x = Math.cos(a) * 30, y = GY - 150 + Math.sin(a) * 30;
    c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(0, GY - 150); c.lineTo(x, y); c.stroke();
    c.strokeStyle = d(CHROME[4]); c.lineWidth = 1; c.beginPath(); c.moveTo(0, GY - 150); c.lineTo(x, y); c.stroke();
  }
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, x = Math.cos(a) * 30, y = GY - 150 + Math.sin(a) * 30;
    box(c, x - 4, y - 4, 8, 8, INK); box(c, x - 3, y - 3, 6, 6, '#FDE68A'); box(c, x - 2, y - 2, 3, 3, '#FFFBEB'); box(c, x - 2, y - 2, 1, 1, '#FFFFFF');
  }
  c.fillStyle = INK; c.beginPath(); c.arc(0, GY - 150, 10, 0, Math.PI * 2); c.fill();
  for (const [r, dx, col] of [[9, 0, CHROME[3]], [7, -1, CHROME[4]], [4, -3, CHROME[5]], [2, -4, CHROME[6]]] as const) { c.fillStyle = d(col); c.beginPath(); c.arc(dx, GY - 150 + dx, r, 0, Math.PI * 2); c.fill(); }
};

/** What stands where along the deck (background props): slot index -> prop. */
const PROPS: [number, 'bench' | 'viewer' | 'cart' | 'sputnik', number][] = [
  [1, 'viewer', -60], [2, 'bench', 0], [3, 'sputnik', 120], [5, 'cart', 0], [6, 'bench', 0], [6, 'viewer', 110], [7, 'viewer', -40],
];
const PROP_PAINT = { bench: paintBench, viewer: paintViewer, cart: paintCart, sputnik: paintSputnik };

/** The deck: the slab, the slots, the bulkhead, the props (everything still). Then the live parts: see below. */
export const drawDeck = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x - 40, w: 880 };
  const vx0 = v.x - 20, vx1 = v.x + v.w + 20;
  if (vx1 < D0 - 320 || vx0 > D1 + 20) return;
  // the bulkhead
  if (vx0 < D0) { c.save(); c.translate(D0, 0); stamp(c, 'n2-bulkhead', -320, CEIL - 220, 320, GY + 440 - CEIL, paintBulkhead); c.restore(); }
  // each slot: its ceiling and floor, its wall, what's stood in it
  for (let k = 0; k < SLOTS; k++) {
    const sx = slotX(k);
    if (sx + SLOT / 2 < vx0 || sx - SLOT / 2 > vx1) continue;
    const kind = slotKind(k);
    c.save(); c.translate(sx, 0);
    stamp(c, `n2-slab`, -SLOT / 2, CEIL - 220, SLOT, GY + 425 - CEIL, g => ceilingAndFloor(g, -SLOT / 2, SLOT / 2));
    stamp(c, `n2-slot-${kind}`, -SLOT / 2, CEIL + 10, SLOT, GY - CEIL - 10, g => paintSlot(g, kind));
    for (const [pk, prop, dx] of PROPS) if (pk === k) { c.save(); c.translate(dx, 0); stamp(c, `n2-${prop}`, -80, GY - 200, 160, 200, PROP_PAINT[prop]); c.restore(); }
    c.restore();
  }
  // (the deck's floor ends at the big window: its slab's end cap)
  if (vx1 > D1 - 10) { column(c, D1 - 4, GY, 8, 205); }
};

// ---------------------------------------------------------------------------------------------------------------
// The suit's case (live: it gets smashed, and the suit taken)

/** The plinth and its plaque (still). */
const paintPlinth = (c: Ctx) => {
  bevel(c, -75, GY - 45, 150, 45, [TEAL[1], TEAL[2], TEAL[3], TEAL[5], TEAL[6]], 3);
  checker(c, -72, GY - 30, 144, 2, TEAL[2], 0);
  box(c, -78, GY - 49, 156, 5, INK); bands(c, -77, GY - 48, 154, 4, [CHROME[6], CHROME[4]]);
  bevel(c, -66, GY - 39, 132, 30, BRASS.slice(1));
  for (const sx of [-63, 60]) { rivet(c, sx, GY - 36, BRASS); rivet(c, sx, GY - 15, BRASS); }
  letters(c, 'REAL ASTRONAUT', 0, GY - 26, brassType(WALNUT[1]));
  letters(c, 'SUIT. DO NOT TOUCH.', 0, GY - 15, brassType('#5C1010'));
};
/** The case: the plinth, the glass box, the suit in it on its stand (or just the bald mannequin, the glass smashed). */
export const drawSuitCase = (c: Ctx, state: GameState, taken: boolean, smashT: number) => {
  const x = CASE_X;
  c.save(); c.translate(x, 0); stamp(c, 'n2-plinth', -80, GY - 52, 160, 52, paintPlinth); c.restore();
  // the mannequin, and the suit on it
  const fy = GY - 46;
  if (!taken) drawSuitFigure(c, x, fy, state.frame);
  else {
    // (bald, white, naked, its arms out: the suit's gone off it)
    // (fiberglass white in steps: lit down its left, shaded down its right, inked; the joints' seams; a stand peg)
    const M = ['#7A818C', '#A3AAB5', '#C6CBD3', '#E2E5EA', '#F8FAFC', '#FFFFFF'];
    box(c, x - 2, fy - 4, 4, 4, INK); box(c, x - 1, fy - 4, 1, 4, CHROME[4]);
    const limb = (lx: number, ly: number, w: number, h: number) => {
      box(c, lx - 1, ly - 1, w + 2, h + 2, INK);
      vbands(c, lx, ly, w, h, w >= 6 ? [M[4], M[3], M[3], M[2]] : [M[4], M[3], M[2]]);
      box(c, lx, ly + h - 3, w, 3, M[2]); box(c, lx, ly + h - 1, w, 1, M[1]);
    };
    for (const s of [-1, 1]) { limb(x + s * 6 - 3, fy - 34, 6, 30); limb(x + s * 12 - 2, fy - 64, 4, 26); box(c, x + s * 6 - 3, fy - 20, 6, 1, M[1]); }
    rr(c, x - 13, fy - 71, 26, 40, 7); c.fillStyle = INK; c.fill();
    c.save(); rr(c, x - 12, fy - 70, 24, 38, 6); c.clip();
    vbands(c, x - 12, fy - 70, 24, 38, [M[5], M[4], M[3], M[3], M[2], M[1]]);
    box(c, x - 12, fy - 46, 24, 1, M[1]); box(c, x - 12, fy - 45, 24, 1, M[4]);
    c.restore();
    c.fillStyle = INK; c.beginPath(); c.arc(x, fy - 80, 10, 0, Math.PI * 2); c.fill();
    for (const [r, d, col] of [[9, 0, M[2]], [7, -1, M[3]], [5, -2, M[4]], [2, -4, M[5]]] as const) { c.fillStyle = col; c.beginPath(); c.arc(x + d, fy - 80 + d, r, 0, Math.PI * 2); c.fill(); }
  }
  // the glass box over it (or what's left of it)
  const gx = x - 46, gy = GY - 196, gw = 92, gh = 150;
  if (!taken) {
    // (the glass: a faint tint, its edges thick and bright where you see through more of it, two glare bands, a glint)
    c.fillStyle = 'rgba(165, 243, 252, 0.1)'; c.fillRect(gx, gy, gw, gh);
    checker(c, gx, gy, gw, gh, 'rgba(207, 250, 254, 0.08)', 0);
    box(c, gx, gy, 3, gh, 'rgba(207, 250, 254, 0.55)'); box(c, gx + gw - 3, gy, 3, gh, 'rgba(14, 116, 144, 0.5)');
    box(c, gx - 1, gy, 1, gh, INK); box(c, gx + gw, gy, 1, gh, INK);
    c.fillStyle = 'rgba(255, 255, 255, 0.2)'; c.beginPath(); c.moveTo(gx + 8, gy); c.lineTo(gx + 30, gy); c.lineTo(gx + 8, gy + 56); c.lineTo(gx + 3, gy + 56); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255, 255, 255, 0.1)'; c.beginPath(); c.moveTo(gx + 40, gy); c.lineTo(gx + 48, gy); c.lineTo(gx + 20, gy + 70); c.lineTo(gx + 12, gy + 70); c.closePath(); c.fill();
    box(c, gx + gw - 14, gy + 10, 6, 2, '#FFFFFF'); box(c, gx + gw - 12, gy + 8, 2, 6, '#FFFFFF');
    box(c, gx - 3, gy - 7, gw + 6, 8, INK); bands(c, gx - 2, gy - 6, gw + 4, 6, [CHROME[6], CHROME[4], CHROME[2]]);
  } else {
    // (jagged: shards left in the frame top and bottom, the rest on the floor)
    box(c, gx - 3, gy - 7, gw + 6, 8, INK); bands(c, gx - 2, gy - 6, gw + 4, 6, [CHROME[6], CHROME[4], CHROME[2]]);
    for (let k = 0; k < 6; k++) {
      c.fillStyle = 'rgba(165, 243, 252, 0.4)'; c.beginPath(); c.moveTo(gx + k * 16, gy); c.lineTo(gx + k * 16 + 14, gy); c.lineTo(gx + k * 16 + 6, gy + 10 + ((k * 7) % 13)); c.closePath(); c.fill();
      box(c, gx + k * 16 + 1, gy, 1, 6, 'rgba(255, 255, 255, 0.7)');
    }
    c.fillStyle = 'rgba(165, 243, 252, 0.4)';
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(gx + k * 16, gy + gh); c.lineTo(gx + k * 16 + 14, gy + gh); c.lineTo(gx + k * 16 + 8, gy + gh - 6 - ((k * 5) % 9)); c.closePath(); c.fill(); }
    for (let k = 0; k < 9; k++) { const sx = x - 70 + ((k * 37) % 140); box(c, sx, GY - 3, 4 + (k % 3), 2, '#CFFAFE'); box(c, sx, GY - 3, 1, 1, '#FFFFFF'); }
    if (smashT > 0 && smashT < 40) { c.fillStyle = `rgba(255, 255, 255, ${(0.5 * (1 - smashT / 40)).toFixed(3)})`; c.fillRect(gx - 10, gy - 10, gw + 20, gh + 20); }
  }
};
/** The suit's whites (off-white fabric in steps), its metal rings, its gloves' rubber, its visor's gold. */
const SUIT = ['#3E4858', '#5E6A7E', '#8A96A8', '#B4BDCA', '#D6DCE4', '#EEF0EE', '#FFFFFF'];
const RING = ['#14306E', '#1F4BA8', '#3B76D6', '#7FAEEA', '#D8E6F8'];
const GLOVE = ['#2C3442', '#4A5568', '#6E7B90', '#98A4B6', '#C2CAD6'];
const GOLD = ['#3A2406', '#5E3C0A', '#8A5A12', '#B7791F', '#E0B634', '#F6E05E', '#FFF6C2'];
/** The visor's middle (from the suit's feet). */
const VISOR_Y = -101;
/**
 * The display suit (painted once, its feet at 0,0; drawn live over it: the visor's glint, the panel's blinking lamp):
 * off-white fabric in steps, lit from the left, every turn dithered; quilted seams stitched down it, folds at the knees
 * and elbows; metal rings (anodized blue) at the neck, the waist and the wrists; the chest control box with its lamps,
 * dials and switches, the hoses round to the pack; the pack (vents, valves) behind; a flag on the right shoulder, the
 * park's mission patch on the left; gloves with fingers, the rubber at their tips; boots with treads; the helmet, its
 * lamps, the gold visor with the deck reflected in it and a streak of light across. All inked.
 */
const paintSuitFigure = (c: Ctx) => {
  const S = SUIT;
  /** A puffy part: inked, its middle tone, lit down its left (a highlight sliver), shaded down its right, the turns
   *  dithered; its top lit, its underside in shadow. */
  const puff = (px: number, py: number, w: number, h: number, r: number, base = 4) => {
    rr(c, px - 1, py - 1, w + 2, h + 2, r + 1); c.fillStyle = INK; c.fill();
    c.save(); rr(c, px, py, w, h, r); c.clip();
    box(c, px, py, w, h, S[base]);
    const lw = Math.max(2, Math.round(w * 0.3)), dw = Math.max(2, Math.round(w * 0.26));
    box(c, px, py, lw, h, S[base + 1]); box(c, px + 1, py + 1, Math.max(1, Math.round(w * 0.1)), h - 2, S[Math.min(6, base + 2)]);
    checker(c, px + lw, py, 2, h, S[base + 1], 0);
    box(c, px + w - dw, py, dw, h, S[base - 1]); checker(c, px + w - dw - 2, py, 2, h, S[base - 1], 1);
    box(c, px + w - 2, py, 2, h, S[base - 2]);
    box(c, px, py, w, 1, S[Math.min(6, base + 1)]); box(c, px, py + h - 2, w, 2, S[base - 1]);
    c.restore();
  };
  /** A fold across a part: a dark crease, the fabric lit under it, short of the edges (the part's round). */
  const fold = (px: number, y: number, w: number) => {
    box(c, px + 2, y, w - 4, 1, S[1]); box(c, px + 2, y + 1, w - 4, 1, S[5]);
    box(c, px + 1, y - 1, 2, 1, S[2]); box(c, px + w - 3, y - 1, 2, 1, S[2]);
  };
  /** A quilted seam: a stitched line down a part. */
  const seam = (x: number, y0: number, y1: number) => { for (let y = y0; y < y1; y += 3) box(c, x, y, 1, 2, S[2]); };
  /** A metal ring round a part: inked, anodized blue banded top to bottom, a bright lip, bolts. */
  const ring = (px: number, py: number, w: number, h: number) => {
    box(c, px - 1, py - 1, w + 2, h + 2, INK);
    bands(c, px, py, w, h, h >= 4 ? [RING[3], RING[2], RING[1], RING[0]] : [RING[3], RING[1]]);
    box(c, px, py, w, 1, RING[4]);
    for (let k = px + 2; k < px + w - 1; k += 5) box(c, k, py + Math.floor(h / 2), 1, 1, CHROME[6]);
  };
  /** A point along a hose (`s` the side, `t` 0 at the control box .. 1 behind the arm). */
  const hose = (s: number, t: number) => [Math.round(s * (9 + Math.sin(t * Math.PI) * 6 + t * 6)), Math.round(-60 + Math.sin(t * Math.PI) * 6 - t * 4)];

  // the pack behind (its top over the shoulders, its sides past the body): its vents, its valves
  puff(-21, -90, 42, 46, 4, 3);
  for (const vx of [-17, 7]) for (let k = 0; k < 4; k++) { box(c, vx + k * 3, -86, 2, 8, INK); box(c, vx + k * 3, -86, 1, 8, S[1]); }
  box(c, -21, -62, 3, 4, INK); box(c, -20, -61, 2, 2, '#2563EB'); box(c, 18, -62, 3, 4, INK); box(c, 18, -61, 2, 2, '#DC2626');

  // the legs: thighs, knees (bellows), shins, the boots with their treads
  for (const s of [-1, 1]) {
    const lx = s * 8 - 7;
    puff(lx, -48, 14, 20, 5);
    seam(lx + 4, -46, -30);
    puff(lx, -29, 14, 7, 3, 3);
    for (const y of [-27, -25]) box(c, lx + 1, y, 12, 1, S[1]);
    puff(lx + 1, -23, 12, 15, 4);
    fold(lx + 1, -17, 12); seam(lx + 4, -21, -10);
    // (the boot: a white upper, a strap with its buckle, the dark sole notched for its tread)
    const bx = s * 8 - 8;
    puff(bx, -10, 16, 8, 3, 4);
    box(c, bx + 1, -7, 14, 2, GLOVE[1]); box(c, bx + 1, -7, 14, 1, GLOVE[3]); box(c, bx + (s < 0 ? 3 : 10), -8, 3, 4, CHROME[5]);
    box(c, bx - 1, -3, 18, 3, INK); box(c, bx, -3, 16, 2, '#2A2F38');
    for (let k = bx + 1; k < bx + 15; k += 3) box(c, k, -2, 2, 2, '#4A515E');
    box(c, bx, -3, 16, 1, '#5A6270');
  }

  // the body: puffy, quilted, its waist ring
  puff(-17, -82, 34, 38, 8, 4);
  seam(-11, -78, -50); seam(10, -78, -50);
  for (const y of [-74, -66]) { box(c, -15, y, 4, 1, S[2]); box(c, 12, y, 4, 1, S[2]); }
  fold(-16, -52, 32);
  ring(-16, -48, 32, 4);
  // (the hoses: from the control box's sides out and round behind the arms, ribbed, blue and red; their connectors)
  for (const [s, col, lit] of [[-1, '#1D4ED8', '#60A5FA'], [1, '#B91C1C', '#F87171']] as const) {
    for (let k = 0; k <= 16; k++) { const [hx, hy] = hose(s, k / 16); box(c, hx - 2, hy - 2, 4, 4, INK); }
    for (let k = 0; k <= 16; k++) { const [hx, hy] = hose(s, k / 16); box(c, hx - 1, hy - 1, 2, 2, k % 2 ? col : lit); }
    box(c, s < 0 ? -12 : 9, -62, 3, 4, INK); box(c, s < 0 ? -11 : 9, -61, 2, 2, CHROME[5]);
  }
  // (the chest control box: grey, bezeled; a row of lamps, two dials, a toggle, switches; its straps up to the shoulders)
  box(c, -11, -76, 1, 6, S[1]); box(c, 10, -76, 1, 6, S[1]);
  rr(c, -10, -71, 20, 15, 2); c.fillStyle = INK; c.fill();
  rr(c, -9, -70, 18, 13, 2); c.fillStyle = GLOVE[2]; c.fill();
  box(c, -9, -70, 18, 1, GLOVE[4]); box(c, -9, -58, 18, 1, GLOVE[0]); box(c, 8, -70, 1, 13, GLOVE[1]);
  for (const [k, col] of [[0, '#DC2626'], [1, '#F59E0B'], [2, '#16A34A'], [3, '#2563EB']] as const) { box(c, -7 + k * 4, -68, 3, 2, INK); box(c, -7 + k * 4, -68, 2, 1, col); }
  for (const dx of [-4, 4]) {
    c.fillStyle = INK; c.beginPath(); c.arc(dx, -62, 3, 0, Math.PI * 2); c.fill();
    c.fillStyle = CREAM[3]; c.beginPath(); c.arc(dx, -62, 2, 0, Math.PI * 2); c.fill();
    box(c, dx, -63, 1, 1, '#B91C1C'); box(c, dx - 1, -62, 1, 1, INK);
  }
  box(c, -1, -64, 2, 4, INK); box(c, -1, -64, 1, 2, CHROME[6]);
  for (const dx of [-7, -5, 4, 6]) box(c, dx, -59, 1, 1, CHROME[6]);
  // (the name tape over it: a white strip, a few dark letter strokes)
  box(c, -8, -78, 16, 4, INK); box(c, -7, -77, 14, 2, S[6]);
  for (let k = -6; k < 6; k += 2) box(c, k, -77, 1, 2, k % 4 ? S[1] : S[2]);

  // the arms: the shoulder's bearing ring, the upper arm, the elbow folded, the forearm, the wrist ring, the glove
  for (const s of [-1, 1]) {
    const ax = s * 22 - 5;
    ring(ax, -81, 10, 3);
    puff(ax, -77, 10, 19, 4);
    seam(ax + 3, -75, -60);
    fold(ax, -60, 10); fold(ax, -57, 10);
    puff(ax, -55, 10, 15, 4);
    fold(ax, -47, 10);
    ring(ax - 1, -40, 12, 3);
    // (the glove: the back of the hand, its knuckles, four fingers, the thumb on the inside, rubber at the tips)
    box(c, ax - 1, -37, 12, 8, INK); box(c, ax, -37, 10, 7, GLOVE[3]); box(c, ax, -37, 3, 7, GLOVE[4]); box(c, ax + 8, -37, 2, 7, GLOVE[2]);
    box(c, ax + 1, -33, 8, 1, GLOVE[2]);
    box(c, ax - 1, -30, 12, 6, INK);
    for (let k = 0; k < 4; k++) {
      const fx = ax + Math.round(k * 2.5);
      box(c, fx, -30, 2, 4, k === 0 ? GLOVE[3] : GLOVE[2]); box(c, fx, -27, 2, 1, GLOVE[0]); box(c, fx, -30, 1, 1, GLOVE[4]);
    }
    const tx = s < 0 ? ax + 10 : ax - 3;
    box(c, tx, -35, 3, 6, INK); box(c, tx + (s < 0 ? 0 : 1), -34, 2, 4, GLOVE[2]); box(c, tx + (s < 0 ? 0 : 1), -31, 2, 1, GLOVE[0]);
  }
  // (the flag on his right shoulder (on the left, from here): stripes, the canton with stars a dither of white)
  {
    const fx = -26, fy = -76;
    box(c, fx - 1, fy - 1, 10, 7, INK);
    for (let k = 0; k < 5; k++) box(c, fx, fy + k, 8, 1, k % 2 ? '#F8FAFC' : '#C8102E');
    box(c, fx, fy, 4, 3, '#1E3A8A');
    for (const [dx, dy] of [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2]]) box(c, fx + dx, fy + dy, 1, 1, '#F8FAFC');
  }
  // (the park's mission patch on the other: a round badge, its border orange, a rocket going up through a ring of
  // orbit over a dark blue sky)
  {
    const px = 22, py = -71;
    c.fillStyle = INK; c.beginPath(); c.arc(px, py, 5.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = ORANGE[3]; c.beginPath(); c.arc(px, py, 4.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#1E2A6E'; c.beginPath(); c.arc(px, py, 3.2, 0, Math.PI * 2); c.fill();
    box(c, px - 3, py, 6, 1, TEAL[6]); box(c, px - 2, py + 1, 1, 1, TEAL[5]); box(c, px + 2, py - 1, 1, 1, TEAL[5]);
    box(c, px, py - 3, 1, 5, '#FFFFFF'); box(c, px - 1, py + 1, 1, 1, '#FFFFFF'); box(c, px + 1, py + 1, 1, 1, '#FFFFFF'); box(c, px, py + 2, 1, 1, ORANGE[4]);
    box(c, px - 2, py - 4, 1, 1, ORANGE[5]);
  }

  // the helmet: the neck ring (its locking lugs), the shell in steps, its lamps, the visor
  ring(-13, -86, 26, 5);
  for (const dx of [-11, 8]) { box(c, dx, -87, 3, 7, INK); box(c, dx + 1, -86, 1, 5, CHROME[5]); }
  const hy = VISOR_Y;
  c.fillStyle = INK; c.beginPath(); c.arc(0, hy, 17, 0, Math.PI * 2); c.fill();
  for (const [r, d, col] of [[16, 0, S[2]], [15, -0.5, S[3]], [13, -1.5, S[4]], [10, -3, S[5]], [5, -6, S[6]]] as const) { c.fillStyle = col; c.beginPath(); c.arc(d, hy + d, r, 0, Math.PI * 2); c.fill(); }
  // (the lamps, either side up top)
  for (const s of [-1, 1]) {
    const lx = s * 15 - 2;
    box(c, lx - 1, hy - 10, 6, 7, INK); box(c, lx, hy - 9, 4, 5, CHROME[4]); box(c, lx, hy - 9, 4, 1, CHROME[6]);
    box(c, lx + 1, hy - 7, 2, 2, '#FFF6C2');
  }
  // (the visor: inked, gold banded down it; the deck reflected bent across its middle: the windows' dark band, their
  // frames, the floor's edge a bright line under it; a streak of light across its top)
  c.fillStyle = INK; c.beginPath(); c.ellipse(1, hy + 1, 13, 11, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.ellipse(1, hy + 1, 12, 10, 0, 0, Math.PI * 2); c.clip();
  bands(c, -12, hy - 10, 26, 22, [GOLD[5], GOLD[4], GOLD[4], GOLD[3], GOLD[3], GOLD[2], GOLD[1]]);
  c.fillStyle = GOLD[1];
  c.beginPath(); c.moveTo(-12, hy - 1); c.quadraticCurveTo(1, hy - 5, 14, hy - 1); c.lineTo(14, hy + 3); c.quadraticCurveTo(1, hy - 1, -12, hy + 3); c.closePath(); c.fill();
  for (const dx of [-7, -1, 5, 10]) box(c, dx, hy - 4 + Math.round(Math.abs(dx - 1) * 0.2), 1, 5, GOLD[3]);
  c.fillStyle = GOLD[5];
  c.beginPath(); c.moveTo(-12, hy + 4); c.quadraticCurveTo(1, hy, 14, hy + 4); c.lineTo(14, hy + 5); c.quadraticCurveTo(1, hy + 1, -12, hy + 5); c.closePath(); c.fill();
  checker(c, -12, hy + 6, 26, 2, GOLD[3], 0);
  checker(c, -12, hy - 4, 26, 2, GOLD[3], 1);
  c.fillStyle = GOLD[6]; c.beginPath(); c.moveTo(-8, hy - 6); c.lineTo(-4, hy - 9); c.lineTo(-3, hy - 8); c.lineTo(-7, hy - 5); c.closePath(); c.fill();
  box(c, -9, hy - 3, 2, 1, '#FFFFFF'); box(c, -5, hy - 8, 2, 1, '#FFFFFF');
  checker(c, -2, hy - 9, 3, 2, GOLD[6], 0);
  c.restore();
  // (the hood's lip over the visor: the shell's rim, lit; the visor's hinges either side)
  c.save(); c.beginPath(); c.ellipse(1, hy + 1, 14, 12, 0, Math.PI * 1.08, Math.PI * 1.92); c.lineWidth = 2; c.strokeStyle = S[5]; c.stroke(); c.restore();
  box(c, -14, hy, 2, 4, S[2]); box(c, 14, hy, 2, 4, S[2]); box(c, -14, hy + 1, 1, 1, CHROME[6]); box(c, 15, hy + 1, 1, 1, CHROME[6]);
};
/** The suit itself, on its stand (feet at y): the painting, and what moves on it (a glint across the visor, the lamp
 *  on its control box blinking). */
export const drawSuitFigure = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, 'n2-suitfig', -34, -120, 68, 121, paintSuitFigure);
  if (f % 80 < 40) { box(c, 1, -68, 2, 1, '#86EFAC'); box(c, 1, -68, 1, 1, '#FFFFFF'); }
  const g = (f % 240) / 240;
  if (g < 0.16) {
    c.save(); c.beginPath(); c.ellipse(1, VISOR_Y + 1, 12, 10, 0, 0, Math.PI * 2); c.clip();
    const gx = -12 + g * 170;
    box(c, gx, VISOR_Y - 11, 2, 24, 'rgba(255, 255, 255, 0.75)'); box(c, gx + 3, VISOR_Y - 11, 1, 24, 'rgba(255, 255, 255, 0.4)');
    c.restore();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The big window at the end (live: it cracks, it goes; after, the emergency seal)

/** The big window's pane as it's drawn (world): from the pilaster at the big slot's left to the deck's end, from the
 *  frame along its top to the sill along its foot. Its patches, its sign, its cracks all sit inside this. */
const PANE = { x0: D1 - SLOT + 16, x1: D1, y0: WIN_TOP, y1: GY - 14 };
const PW = PANE.x1 - PANE.x0, PH = PANE.y1 - PANE.y0;
/** The end glass: a thick slab of it at the deck's end, seen edge on. */
const SLAB = { x0: D1, x1: D1 + 18, y0: WIN_TOP - 6, y1: GY - 16 };
/** The warning plaque (pane space): on the room's side of the glass, hung off the frame's header on two steel straps
 *  (bolted to the header, screwed to the plaque), between the PA's words over it and the heads under it. */
const SIGN = { x: 142, y: 64, w: 140, h: 76 };
/** Its straps' x (from its middle), and how far up the header their bolt plates sit (over the pane's top). */
const STRAP_DX = SIGN.w / 2 - 18, HEADER = 12;
/** The patches (pane space): the replacement pane down the left, the riveted plate low down. The impact's cracks stay
 *  out of both (a crack stops at a pane's edge; the plate's steel). */
const REPL = { x: 8, y: 16, w: 58, h: 150 };
const PLATE = { x: 150, y: PH - 112, w: 66, h: 52 };
/** The old patched star break (pane space). */
const STAR = { x: 244, y: 200 };

/** A strip of duct tape (pane space), from (x0, y0) to (x1, y1), `w` wide: silver in steps, its torn ends. */
const tape = (c: Ctx, x0: number, y0: number, x1: number, y1: number, w = 8) => {
  const len = Math.hypot(x1 - x0, y1 - y0);
  c.save(); c.translate(x0, y0); c.rotate(Math.atan2(y1 - y0, x1 - x0));
  box(c, 0, -w / 2 - 1, len, w + 2, 'rgba(10, 15, 26, 0.55)');
  bands(c, 0, -w / 2, len, w, [TAPE[4], TAPE[3], TAPE[2], TAPE[1]]);
  for (let k = 3; k < len - 2; k += 5) box(c, k, -w / 2 + 1, 1, w - 2, TAPE[2]);
  // (the torn ends: notched)
  c.globalCompositeOperation = 'destination-out';
  for (const ex of [0, len - 2]) for (let k = -w / 2; k < w / 2; k += 3) box(c, ex, k, 2, 1, '#000');
  c.restore();
};
/** An old crack (pane space): a thin pale line, wandering, with a dark side, from (x, y) by `n` steps in direction a. */
const oldCrack = (c: Ctx, x: number, y: number, a: number, n: number, seed: number) => {
  let px = x, py = y;
  for (let s = 0; s < n; s++) {
    const da = (((seed * 7 + s * 13) % 9) - 4) * 0.12, nx = px + Math.cos(a + da) * 9, ny = py + Math.sin(a + da) * 9;
    c.strokeStyle = 'rgba(10, 15, 26, 0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px + 1, py + 1); c.lineTo(nx + 1, ny + 1); c.stroke();
    c.strokeStyle = 'rgba(226, 244, 255, 0.55)'; c.beginPath(); c.moveTo(px, py); c.lineTo(nx, ny); c.stroke();
    px = nx; py = ny;
  }
};
/** The warning plaque's face (its top-left at 0,0): porcelain enamel on steel, high-visibility yellow banded down it,
 *  in a pressed steel frame, a screw in each corner, the enamel chipped back to the steel at one; the park's enamel
 *  lettering. */
const warningPlaque = (c: Ctx, w: number, h: number) => {
  // (the frame: pressed steel, lit along its top and left)
  bevel(c, 0, 0, w, h, STEEL.slice(1), 2);
  // (the face: yellow in steps, the enamel's sheen along the top, its foot gone a shade dirtier, dithered seams)
  bands(c, 3, 3, w - 6, h - 6, ['#FEF08A', '#FDE047', '#FACC15', '#FACC15', '#EAB308', '#CA8A04']);
  box(c, 3, 3, w - 6, 1, '#FEF9C3'); box(c, 3, 3, 1, h - 6, '#FEF08A');
  box(c, 3, h - 4, w - 6, 1, '#A16207'); box(c, w - 4, 3, 1, h - 6, '#A16207');
  // (the red border, fired on: a band, its inner edge a shade darker)
  for (const [x, y, bw, bh] of [[6, 6, w - 12, 2], [6, h - 8, w - 12, 2], [6, 6, 2, h - 12], [w - 8, 6, 2, h - 12]]) box(c, x, y, bw, bh, '#B91C1C');
  box(c, 8, 8, w - 16, 1, '#7F1D1D'); box(c, 8, 8, 1, h - 16, '#7F1D1D');
  lettering(c, 'DO NOT LEAN', w / 2, 19, 'enamel', '#C81E1E', '#FACC15');
  lettering(c, 'ON GLASS', w / 2, 37, 'enamel', '#C81E1E', '#FACC15');
  lettering(c, 'WINDOW RATED', w / 2, 54, 'small', '#1C1917', '#EAB308');
  lettering(c, 'FOR 60 LBS', w / 2, 64, 'small', '#1C1917', '#EAB308');
  // (the chip: the enamel gone at the lower left corner, the dark steel under it, its broken edge lit)
  c.fillStyle = INK; c.beginPath(); c.moveTo(3, h - 15); c.lineTo(11, h - 9); c.lineTo(9, h - 3); c.lineTo(3, h - 3); c.closePath(); c.fill();
  c.fillStyle = STEEL[1]; c.beginPath(); c.moveTo(3, h - 13); c.lineTo(9, h - 9); c.lineTo(8, h - 4); c.lineTo(3, h - 4); c.closePath(); c.fill();
  box(c, 4, h - 13, 2, 1, '#FEF9C3'); box(c, 9, h - 9, 1, 2, '#FEF9C3');
  // (the corner screws)
  for (const [sx, sy] of [[3, 3], [w - 6, 3], [3, h - 6], [w - 6, h - 6]]) { box(c, sx - 1, sy - 1, 5, 5, INK); rivet(c, sx, sy, STEEL); box(c, sx, sy + 1, 3, 1, STEEL[1]); }
};
/** One strap (pane space, its middle at x): a steel flat bar from its bolt plate on the header (`y0`) down to `y1`. */
const strap = (c: Ctx, x: number, y0: number, y1: number) => {
  box(c, x - 4, y0, 8, y1 - y0, INK);
  vbands(c, x - 3, y0, 6, y1 - y0, [STEEL[5], STEEL[4], STEEL[3], STEEL[2]]);
  checker(c, x - 3, y0 + 10, 6, y1 - y0 - 10, STEEL[3], 0);
  // (the bolt plate on the header: bevelled, two hex bolts)
  bevel(c, x - 9, y0 - 2, 18, 9, STEEL.slice(1), 1);
  for (const dx of [-6, 4]) { box(c, x + dx - 1, y0, 4, 4, INK); box(c, x + dx, y0 + 1, 2, 2, STEEL[4]); box(c, x + dx, y0 + 1, 1, 1, STEEL[5]); }
};
/** A strap's foot, lapped over the plaque's frame at (x, y) and screwed through it. */
const strapFoot = (c: Ctx, x: number, y: number) => {
  box(c, x - 4, y - 1, 8, 11, INK); vbands(c, x - 3, y - 1, 6, 10, [STEEL[5], STEEL[4], STEEL[3], STEEL[2]]);
  for (const dy of [1, 5]) rivet(c, x - 1, y + dy, STEEL);
};
/** The glass's patchwork (pane space): it's been fixed before, cheaply, more than once. */
const paintPatches = (c: Ctx) => {
  // a replacement pane down the left, the wrong glass (green, gone a bit yellow), puttied in, its gasket
  const rx = REPL.x, ry = REPL.y, rw = REPL.w, rh = REPL.h;
  c.fillStyle = 'rgba(190, 214, 120, 0.2)'; c.fillRect(rx, ry, rw, rh);
  checker(c, rx, ry + rh - 40, rw, 40, 'rgba(214, 196, 110, 0.14)', 0);
  box(c, rx + 6, ry + 8, 3, rh - 30, 'rgba(255, 255, 255, 0.14)');
  box(c, rx - 1, ry - 1, rw + 2, 1, INK); box(c, rx - 1, ry + rh, rw + 2, 1, INK); box(c, rx - 1, ry, 1, rh, INK); box(c, rx + rw, ry, 1, rh, INK);
  for (let k = 0; k < rw + rh; k += 3) {
    const along = k < rw, px = along ? rx + k : rx + rw + 1, py = along ? ry - 3 : ry + (k - rw);
    const bump = (k * 7) % 5 < 2 ? 1 : 0;
    box(c, px, py, 3, 2 + bump, PUTTY[(k / 3) % 3 | 0]);
    if (along) box(c, px, ry + rh + 1, 3, 2 + bump, PUTTY[((k / 3) + 1) % 3 | 0]); else box(c, rx - 3 - bump, py, 2 + bump, 3, PUTTY[((k / 3) + 2) % 3 | 0]);
  }
  // (the replacement's own sticker, never peeled)
  box(c, rx + 36, ry + rh - 18, 16, 10, INK); box(c, rx + 37, ry + rh - 17, 14, 8, '#F8FAFC'); box(c, rx + 39, ry + rh - 15, 10, 1, '#2563EB'); box(c, rx + 39, ry + rh - 12, 7, 1, '#94A3B8');
  // (the old cracks: all in the main pane, stopped at its edges and at the replacement's)
  c.save(); c.beginPath(); c.rect(rx + rw + 5, 3, PW - rx - rw - 8, PH - 8); c.clip();
  // an old star break, taped over in an X (right of the plaque, under it), a dab of putty pushed into its middle
  const sx = STAR.x, sy = STAR.y;
  for (let k = 0; k < 7; k++) oldCrack(c, sx, sy, (k / 7) * Math.PI * 2 + 0.4, 3 + (k % 3), k + 3);
  tape(c, sx - 24, sy - 20, sx + 24, sy + 20, 9); tape(c, sx - 24, sy + 20, sx + 24, sy - 20, 9);
  box(c, sx - 4, sy - 3, 8, 6, PUTTY[1]); box(c, sx - 3, sy - 3, 6, 2, PUTTY[3]); box(c, sx - 4, sy + 2, 8, 1, PUTTY[0]);
  // a long crack running up the glass, a strip of tape across it every so often
  oldCrack(c, 84, PH - 30, -1.05, 18, 5);
  for (const [tx, ty] of [[95, PH - 50], [115, PH - 84], [135, PH - 118], [154, PH - 152]]) tape(c, tx - 13, ty - 7, tx + 13, ty + 7, 7);
  c.restore();
  // a riveted steel plate low down (where something went through once), streaked with rust, puttied round
  const qx = PLATE.x, qy = PLATE.y, qw = PLATE.w, qh = PLATE.h;
  for (let k = -2; k < qw + 2; k += 3) { box(c, qx + k, qy - 3, 3, 3, PUTTY[(k + 9) % 3]); box(c, qx + k, qy + qh, 3, 3, PUTTY[(k + 10) % 3]); }
  bevel(c, qx, qy, qw, qh, STEEL.slice(1), 2);
  for (let x = qx + 5; x < qx + qw - 4; x += 14) { rivet(c, x, qy + 3, STEEL); rivet(c, x, qy + qh - 6, STEEL); }
  rivet(c, qx + 3, qy + qh / 2 - 1, STEEL); rivet(c, qx + qw - 6, qy + qh / 2 - 1, STEEL);
  for (const [x, len] of [[qx + 12, 22], [qx + 31, 30], [qx + 49, 16]]) { checker(c, x, qy + 8, 3, len, '#8A4B1E', 0); box(c, x + 1, qy + 8, 1, Math.round(len * 0.6), '#7C3A12'); }
  // putty smeared along the foot of the glass, and a thumbprint of it on the pane
  for (let x = 4; x < PW - 4; x += 4) box(c, x, PH - 3 - ((x * 7) % 3), 4, 3 + ((x * 7) % 3), PUTTY[(x / 4) % 4 | 0]);
  box(c, 120, PH - 20, 5, 4, PUTTY[2]); box(c, 121, PH - 21, 3, 1, PUTTY[3]);
};
/** The plaque on its straps (pane space): drawn over the glass and its cracks (it's on this side of them). */
const paintPlaque = (c: Ctx) => {
  for (const s of [-1, 1]) strap(c, SIGN.x + s * STRAP_DX, -HEADER + 2, SIGN.y);
  // (its shadow on the glass behind, dithered)
  checker(c, SIGN.x - SIGN.w / 2 + 4, SIGN.y + SIGN.h, SIGN.w - 4, 4, 'rgba(10, 15, 26, 0.35)', 0);
  c.save(); c.translate(SIGN.x - SIGN.w / 2, SIGN.y); warningPlaque(c, SIGN.w, SIGN.h); c.restore();
  for (const s of [-1, 1]) strapFoot(c, SIGN.x + s * STRAP_DX, SIGN.y);
};
/** Where the impact sits in from the pane's right edge (its mullion with the end slab). */
const HIT_IN = 14;
/** The cracks, out from where he hit it (world): a spiderweb across the big pane from just inside its right edge at
 *  (D1 - HIT_IN, hy), rings between its spokes; all of it inside that one pane, stopped at its frame and mullion, at
 *  the replacement pane's putty and at the steel plate (clipped: the pane, less those two). */
const drawCracks = (c: Ctx, crack: number, hy: number) => {
  c.save();
  c.beginPath(); c.rect(PANE.x0 + 2, PANE.y0 + 2, PW - 5, PH - 4);
  c.rect(PANE.x0 + REPL.x - 4, PANE.y0 + REPL.y - 4, REPL.w + 8, REPL.h + 8);
  c.rect(PANE.x0 + PLATE.x - 4, PANE.y0 + PLATE.y - 4, PLATE.w + 8, PLATE.h + 8);
  c.clip('evenodd');
  const x = D1 - HIT_IN, spread = Math.min(1, crack * 1.4);
  const N = 11, pts: [number, number][][] = [];
  for (let k = 0; k < N; k++) {
    // (the spokes fan out into the pane, from straight up the edge round to straight down it)
    const a = Math.PI / 2 + (k / (N - 1)) * Math.PI + (((k * 37) % 7) - 3) * 0.03;
    const len = (60 + ((k * 53) % 140)) * spread * 1.6;
    const line: [number, number][] = [[x, hy]];
    for (let s = 1; s <= 6; s++) { const d = len * (s / 6), j = (((s * 7 + k * 3) % 5) - 2) * 2.5; line.push([x + Math.cos(a) * d - Math.sin(a) * j, hy + Math.sin(a) * d + Math.cos(a) * j]); }
    pts.push(line);
  }
  const stroke = (l: [number, number][], col: string, dx: number) => { c.strokeStyle = col; c.beginPath(); c.moveTo(l[0][0] + dx, l[0][1] + dx); for (const [px, py] of l.slice(1)) c.lineTo(px + dx, py + dx); c.stroke(); };
  c.lineWidth = 1;
  for (const l of pts) stroke(l, 'rgba(10, 15, 26, 0.45)', 1);
  for (const l of pts) stroke(l, 'rgba(255, 255, 255, 0.92)', 0);
  // (the rings: joining neighboring spokes partway out)
  for (const s of [2, 4]) for (let k = 0; k < N - 1; k++) {
    const a = pts[k][s], b = pts[k + 1][s];
    stroke([a, [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2], b], 'rgba(10, 15, 26, 0.35)', 1);
    stroke([a, [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2], b], 'rgba(226, 244, 255, 0.8)', 0);
  }
  // (the impact: a crushed white star in the glass)
  steppedGlow(c, x, hy, 10 + spread * 10, '#FFFFFF', 0.55, 0.08, 3);
  box(c, x - 6, hy - 3, 12, 6, 'rgba(255, 255, 255, 0.85)'); box(c, x - 3, hy - 6, 6, 12, 'rgba(255, 255, 255, 0.85)');
  c.restore();
};

/** The glass wall at the deck's end: whole (cracking from `hit` by `crack` 0..1), gone (jagged at the frames), or
 *  sealed (the emergency shutter down over it, an airlock door in it). */
export const drawEndGlass = (c: Ctx, state: GameState, mode: 'whole' | 'gone' | 'sealed', crack: number, hitY: number) => {
  const x = D1, top = WIN_TOP - 12, bot = GY;
  if (mode === 'sealed') {
    // (the shutter: steel slats in steps, hazard-striped along its top, filling the big slot's glass; the airlock in it)
    const L = D1 - SLOT + 12;
    stamp(c, 'n2-shutter', L, top, D1 + 20 - L, bot - top, g => {
      bands(g, L, top, D1 + 20 - L, bot - top, [STEEL[3], STEEL[2], STEEL[2], STEEL[1]]);
      for (let y = top + 30; y < bot; y += 20) { box(g, L, y, D1 + 20 - L, 1, INK); box(g, L, y + 1, D1 + 20 - L, 2, STEEL[4]); box(g, L, y + 3, D1 + 20 - L, 1, STEEL[3]); }
      hazard(g, L, D1 + 20, top, 24);
      box(g, L, top + 24, D1 + 20 - L, 2, INK);
      rr(g, D1 - 121, GY - 171, 92, 171, 10); g.fillStyle = INK; g.fill();
      g.save(); rr(g, D1 - 119, GY - 169, 88, 169, 9); g.clip(); vbands(g, D1 - 119, GY - 169, 88, 169, [CHROME[5], CHROME[4], CHROME[4], CHROME[3], CHROME[2]]); g.restore();
      for (const [rx, ry] of [[-114, -164], [-40, -164], [-114, -8], [-40, -8]]) rivet(g, D1 + rx, GY + ry);
      g.fillStyle = INK; g.beginPath(); g.arc(D1 - 75, GY - 120, 19, 0, Math.PI * 2); g.fill();
      g.fillStyle = CHROME[5]; g.beginPath(); g.arc(D1 - 75, GY - 120, 17, 0, Math.PI * 2); g.fill();
      // (the porthole's glass: space through it, banded dark from its rim in, a star or two, a crescent of glare)
      g.save(); g.beginPath(); g.arc(D1 - 75, GY - 120, 14, 0, Math.PI * 2); g.clip();
      bands(g, D1 - 89, GY - 134, 28, 28, ['#1E2A5A', '#162048', '#101838', '#0B1026', '#070A1A']);
      for (const [sx, sy] of [[-6, 4], [5, -2], [2, 8]]) box(g, D1 - 75 + sx, GY - 120 + sy, 1, 1, '#E0E7FF');
      g.strokeStyle = 'rgba(207, 250, 254, 0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(D1 - 75, GY - 120, 11, Math.PI * 1.05, Math.PI * 1.45); g.stroke();
      g.restore();
      box(g, D1 - 84, GY - 128, 4, 4, '#F8FAFC'); box(g, D1 - 80, GY - 130, 2, 2, '#F8FAFC');
      stencil(g, 'AIRLOCK', D1 - 75, GY - 178, '#EAB308', STEEL[2]);
      stencil(g, 'EMERGENCY SEAL', D1 - 160, top + 56, '#EAB308', STEEL[3]);
    });
    return;
  }
  // the end slab's frame top and bottom, either way
  box(c, x - 7, top - 7, 32, 14, INK); bands(c, x - 6, top - 6, 30, 12, [CHROME[6], CHROME[4], CHROME[2]]);
  box(c, x - 7, bot - 17, 32, 17, INK); bands(c, x - 6, bot - 16, 30, 16, [CHROME[5], CHROME[3], CHROME[1]]);
  if (mode === 'gone') {
    // (the big pane: jagged teeth left all round its frame)
    c.save(); c.beginPath(); c.rect(PANE.x0, PANE.y0, PW, PH); c.clip();
    const tooth = (x0: number, y0: number, x1: number, y1: number, tx: number, ty: number) => {
      c.fillStyle = 'rgba(165, 243, 252, 0.4)'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(tx, ty); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255, 255, 255, 0.75)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(tx, ty); c.stroke();
    };
    for (let k = 0; k < PW; k += 18) { tooth(PANE.x0 + k, PANE.y0, PANE.x0 + k + 18, PANE.y0, PANE.x0 + k + 7, PANE.y0 + 10 + ((k * 13) % 26)); tooth(PANE.x0 + k, PANE.y1, PANE.x0 + k + 18, PANE.y1, PANE.x0 + k + 9, PANE.y1 - 6 - ((k * 7) % 16)); }
    for (let k = 0; k < PH; k += 22) tooth(PANE.x0, PANE.y0 + k, PANE.x0, PANE.y0 + k + 22, PANE.x0 + 8 + ((k * 11) % 20), PANE.y0 + k + 10);
    c.restore();
    // (the plaque: its right strap sheared off at the header, a stub left bent; it swings off the left one by its
    // last screw)
    mullion(c);
    const sw = Math.sin(state.frame * 0.09) * 0.12, ax = PANE.x0 + SIGN.x - STRAP_DX, rx = PANE.x0 + SIGN.x + STRAP_DX;
    c.save(); c.translate(PANE.x0, PANE.y0); strap(c, SIGN.x - STRAP_DX, -HEADER + 2, SIGN.y); c.restore();
    c.save(); c.translate(rx, PANE.y0 - HEADER + 2); strap(c, 0, 0, 14); c.rotate(-0.5); box(c, -4, 13, 8, 9, INK); box(c, -3, 13, 6, 8, STEEL[3]); box(c, -3, 13, 2, 8, STEEL[4]); c.restore();
    c.save(); c.translate(ax, PANE.y0 + SIGN.y + 3); c.rotate(1.05 + sw); c.translate(-(SIGN.w / 2 - STRAP_DX), -3);
    stamp(c, 'n2-warning', -2, -2, SIGN.w + 4, SIGN.h + 4, g => warningPlaque(g, SIGN.w, SIGN.h)); c.restore();
    box(c, ax - 4, PANE.y0 + SIGN.y - 1, 8, 7, INK); box(c, ax - 3, PANE.y0 + SIGN.y - 1, 6, 6, STEEL[3]); rivet(c, ax - 1, PANE.y0 + SIGN.y + 2, STEEL);
    c.fillStyle = 'rgba(165, 243, 252, 0.5)';
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x, top + 6); c.lineTo(x + 18, top + 6); c.lineTo(x + 8, top + 18 + ((k * 13) % 30)); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(x, bot - 16); c.lineTo(x + 18, bot - 16); c.lineTo(x + 6, bot - 40); c.closePath(); c.fill();
    return;
  }
  // the big pane: its glare, its patches, its sign (still: a stamp); then the end slab of glass, edge on
  c.save(); c.beginPath(); c.rect(PANE.x0, PANE.y0, PW, PH); c.clip();
  glare(c, PANE.x0, PANE.y0, PW, PH);
  c.restore();
  c.save(); c.translate(PANE.x0, PANE.y0); stamp(c, 'n2-patches', 0, 0, PW, PH, paintPatches); c.restore();
  slabGlass(c);
  // (the cracks: out from where he hit it, in the big pane; then the plaque on its straps, this side of them)
  if (crack > 0) drawCracks(c, crack, Math.max(PANE.y0 + 10, Math.min(PANE.y1 - 10, hitY)));
  mullion(c);
  c.save(); c.translate(PANE.x0, PANE.y0); stamp(c, 'n2-plaque', SIGN.x - SIGN.w / 2 - 4, -HEADER - 2, SIGN.w + 8, SIGN.y + SIGN.h + HEADER + 8, paintPlaque); c.restore();
};
/** The end slab of glass, edge on (world): banded across its thickness, bright at its near face, deep teal through it,
 *  dark at its far face, dithered between. */
const slabGlass = (c: Ctx) => {
  const h = SLAB.y1 - SLAB.y0;
  const cols = ['rgba(255, 255, 255, 0.4)', 'rgba(207, 250, 254, 0.3)', 'rgba(103, 232, 249, 0.24)', 'rgba(56, 189, 248, 0.2)', 'rgba(14, 116, 144, 0.32)', 'rgba(8, 72, 96, 0.5)'];
  cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(SLAB.x0 + i * 3, SLAB.y0, 3, h); });
  checker(c, SLAB.x0 + 5, SLAB.y0, 2, h, 'rgba(207, 250, 254, 0.18)', 0); checker(c, SLAB.x0 + 11, SLAB.y0, 2, h, 'rgba(8, 72, 96, 0.25)', 1);
};
/** The mullion between the big pane and the end slab (world): a chrome bar, lit down its left, inked either side. */
const mullion = (c: Ctx) => {
  box(c, D1 - 3, PANE.y0, 1, PH, INK); box(c, D1 + 2, PANE.y0, 1, PH, INK);
  box(c, D1 - 2, PANE.y0, 2, PH, CHROME[5]); box(c, D1, PANE.y0, 2, PH, CHROME[3]); box(c, D1 - 2, PANE.y0, 1, PH, CHROME[6]);
  for (let y = PANE.y0 + 30; y < PANE.y1 - 10; y += 60) { box(c, D1 - 2, y, 4, 3, INK); box(c, D1 - 1, y, 2, 2, CHROME[4]); }
};

// ---------------------------------------------------------------------------------------------------------------
// The lobby, and the elevator car

/** The ticket hall at the needle's foot: a 1960s space-age lobby gone a bit tired. From the top: the coffered ceiling and
 *  its recessed lights, the clerestory (the sky through it), the cream upper wall papered in boomerangs, the chrome and
 *  orange stripes, the fluted teal wainscot, the terrazzo floor (an atomic starburst inlaid in it). The exit at the
 *  left, the ticket booth, the marquee, the poster, the line's ropes, the elevator. */
const paintLobby = (c: Ctx) => {
  const L = LOBBY0, R = LOBBY1 + 40, w = R - L;
  // the ceiling: dark coffers, bevelled, chrome ribs between, round recessed lights glowing down into them
  bands(c, L, GY - 760, w, 270, [CHROME[0], '#141C28', CHROME[1], '#202C3C', CHROME[1]]);
  for (let x = L + 30; x < R; x += 120) {
    rr(c, x, GY - 620, 100, 112, 6); c.fillStyle = INK; c.fill();
    rr(c, x + 2, GY - 618, 96, 108, 5); c.fillStyle = '#18202E'; c.fill();
    // (the coffer's sides: the top one lit by the lamp under it, the near ones in shadow, stepped)
    box(c, x + 2, GY - 618, 96, 6, '#2A3446'); box(c, x + 2, GY - 612, 96, 2, '#222B3B');
    box(c, x + 2, GY - 618, 6, 108, '#202838'); box(c, x + 92, GY - 618, 6, 108, '#202838');
    box(c, x + 2, GY - 516, 96, 6, CHROME[2]); box(c, x + 2, GY - 516, 96, 1, CHROME[4]);
    steppedGlow(c, x + 50, GY - 560, 40, '#FDE68A', 0.14, 0.02, 4);
    // (its lamp: a chrome can, the bulb's glow in steps)
    c.fillStyle = INK; c.beginPath(); c.ellipse(x + 50, GY - 530, 21, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = CHROME[4]; c.beginPath(); c.ellipse(x + 50, GY - 530, 19, 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(x + 50, GY - 529, 15, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFBEB'; c.beginPath(); c.ellipse(x + 48, GY - 530, 8, 2, 0, 0, Math.PI * 2); c.fill();
  }
  // (the fascia over the clerestory: chrome, lit along its bottom edge, riveted)
  bands(c, L, GY - 496, w, 16, [CHROME[2], CHROME[3], CHROME[4], CHROME[5]]);
  box(c, L, GY - 497, w, 1, INK);
  box(c, L, GY - 482, w, 2, CHROME[6]); box(c, L, GY - 480, w, 1, INK);
  for (let x = L + 15; x < R; x += 30) rivet(c, x, GY - 491);
  // the clerestory: the sky through it (the backdrop), its chrome mullions; the sill under it (dimmed: out of reach)
  for (let x = L + 140; x < R; x += 90) column(c, x, GY - 480, 10, 118);
  box(c, L, GY - 365, w, 1, INK);
  box(c, L, GY - 364, w, 8, dimc(CHROME[4])); box(c, L, GY - 364, w, 2, dimc(CHROME[6])); box(c, L, GY - 357, w, 1, dimc(CHROME[2])); box(c, L, GY - 356, w, 1, INK);
  // the upper wall: cream, papered in a faint pattern of boomerangs and four-point stars, darker toward its foot
  bands(c, L, GY - 355, w, 159, [CREAM[3], CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
  c.fillStyle = tilePattern(c, 'n2-boomerang', 64, 48, g => {
    g.fillStyle = 'rgba(122, 104, 70, 0.22)';
    g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(16, 14, 28, 22); g.quadraticCurveTo(18, 22, 10, 34); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255, 255, 255, 0.18)'; g.fillRect(14, 20, 6, 1);
    g.fillStyle = 'rgba(210, 85, 26, 0.18)';
    for (const [sx, sy, sr] of [[46, 12, 5], [40, 38, 3]] as const) { g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, d = k % 2 ? sr * 0.3 : sr; g.lineTo(sx + Math.cos(a) * d, sy + Math.sin(a) * d); } g.closePath(); g.fill(); }
  });
  c.fillRect(L, GY - 355, w, 159);
  // (the chrome stripe, the orange pinstripe)
  box(c, L, GY - 197, w, 1, INK);
  bands(c, L, GY - 196, w, 6, [CHROME[6], CHROME[4]]); box(c, L, GY - 190, w, 3, ORANGE[3]); box(c, L, GY - 190, w, 1, ORANGE[4]); box(c, L, GY - 187, w, 1, ORANGE[1]);
  // the wainscot: fluted teal panels, each rib lit down its left, shaded down its right; the kick plate
  bands(c, L, GY - 186, w, 174, [TEAL[3], TEAL[3], TEAL[2], TEAL[2], TEAL[1]]);
  for (let x = L + 4; x < R; x += 16) { box(c, x, GY - 180, 2, 166, TEAL[4]); box(c, x + 2, GY - 180, 1, 166, TEAL[5]); box(c, x + 11, GY - 180, 2, 166, TEAL[1]); box(c, x + 13, GY - 180, 1, 166, INK); }
  box(c, L, GY - 186, w, 6, TEAL[4]); box(c, L, GY - 186, w, 1, TEAL[6]); box(c, L, GY - 181, w, 1, TEAL[1]);
  box(c, L, GY - 15, w, 1, INK);
  bands(c, L, GY - 14, w, 14, [CHROME[4], CHROME[3], CHROME[2], CHROME[1]]);
  for (let x = L + 9; x < R; x += 27) box(c, x + ((x * 3) % 7), GY - 9 + ((x * 5) % 4), 5 + (x % 4), 1, CHROME[5]);
  ceilingAndFloorLobby(c, L, R);
  // the doorway out (left): open, the light from outside; its chrome jamb, the EXIT box over it
  c.save(); c.globalCompositeOperation = 'destination-out'; box(c, L, GY - 220, 90, 220, '#000'); c.restore();
  column(c, L + 90, GY - 230, 14, 230);
  box(c, L, GY - 232, 104, 12, INK); bands(c, L, GY - 231, 103, 10, [CHROME[6], CHROME[5], CHROME[4], CHROME[3]]);
  rr(c, L + 13, GY - 269, 66, 30, 4); c.fillStyle = INK; c.fill();
  c.save(); rr(c, L + 14, GY - 268, 64, 28, 3); c.clip(); bands(c, L + 14, GY - 268, 64, 28, [CHROME[5], CHROME[4], CHROME[3]]); c.restore();
  box(c, L + 18, GY - 264, 56, 20, INK); box(c, L + 19, GY - 263, 54, 18, '#1A0505');
  steppedGlow(c, L + 46, GY - 254, 26, '#F87171', 0.12, 0.02, 3);
  letters(c, 'EXIT', L + 46, GY - 247, { family: 'led', px: 2, py: 2, fill: ['#FECACA', '#F87171', '#EF4444'], hi: '#3B0C0C', shadow: 'rgba(248, 113, 113, 0.25)' });
  // the marquee: the name, what it is, inside a ring of bulbs
  const mx = L + 360, my = GY - 340, mw = 380, mh = 120;
  rr(c, mx - 6, my - 6, mw + 12, mh + 12, 12); c.fillStyle = INK; c.fill();
  c.save(); rr(c, mx - 4, my - 4, mw + 8, mh + 8, 11); c.clip(); bands(c, mx - 4, my - 4, mw + 8, mh + 8, [CHROME[6], CHROME[5], CHROME[4], CHROME[4], CHROME[3], CHROME[2]]); c.restore();
  rr(c, mx + 4, my + 4, mw - 8, mh - 8, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, mx + 5, my + 5, mw - 10, mh - 10, 5); c.clip(); bands(c, mx + 5, my + 5, mw - 10, mh - 10, [TEAL[2], TEAL[1], TEAL[1], TEAL[0]]);
  // (a sweep of orbit lines behind the name, Googie style)
  c.strokeStyle = TEAL[3]; c.lineWidth = 2; c.beginPath(); c.ellipse(mx + 210, my + 40, 150, 22, -0.08, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = TEAL[2]; c.lineWidth = 1; c.beginPath(); c.ellipse(mx + 210, my + 42, 170, 30, -0.08, 0, Math.PI * 2); c.stroke();
  c.restore();
  const bulb = (bx: number, by: number) => { steppedGlow(c, bx, by, 6, '#FDE68A', 0.35, 0.05, 2); box(c, bx - 3, by - 3, 6, 6, INK); box(c, bx - 2, by - 2, 4, 4, '#FDE68A'); box(c, bx - 2, by - 2, 2, 1, '#FFFFFF'); };
  for (let k = 0; k < 24; k++) { const bx = mx + 6 + k * ((mw - 12) / 23); for (const by of [my, my + mh]) bulb(bx, by); }
  for (let k = 1; k < 6; k++) { const by = my + k * (mh / 6); for (const bx of [mx, mx + mw]) bulb(bx, by); }
  star(c, mx + 46, my + 40, 26);
  letters(c, 'SPACE NEEDLE 2', mx + 214, my + 54, { family: 'googie', px: 3, py: 4, fill: ['#FFFFFF', CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[4]], ink: INK, shadow: ORANGE[2], drop: 3 });
  letters(c, 'THE ONLY OBSERVATION DECK', mx + 210, my + 75, { family: 'googie', px: 1, fill: [CREAM[4], CREAM[3]], shadow: INK });
  letters(c, 'IN ACTUAL OUTER SPACE', mx + 210, my + 87, { family: 'googie', px: 1, fill: [CREAM[4], CREAM[3]], shadow: INK });
  neon(c, '541 TIMES TALLER THAN THE ORIGINAL', mx + 210, my + 108, false, ORANGE[4], TEAL[0]);
  // the ticket booth: round, chrome-capped, a boomerang sign on it, nobody in it
  const bx = L + 240;
  rr(c, bx - 61, GY - 151, 122, 151, 31); c.fillStyle = INK; c.fill();
  c.save(); rr(c, bx - 59, GY - 149, 118, 149, 29); c.clip();
  vbands(c, bx - 59, GY - 149, 118, 149, [TEAL[5], TEAL[6], TEAL[5], TEAL[4], TEAL[4], TEAL[3], TEAL[2]]);
  bands(c, bx - 59, GY - 149, 118, 12, [CHROME[6], CHROME[4]]);
  for (let x = bx - 50; x < bx + 59; x += 12) { box(c, x, GY - 136, 1, 106, mix(TEAL[2], TEAL[4], 0.5)); }
  box(c, bx - 59, GY - 30, 118, 4, ORANGE[3]); box(c, bx - 59, GY - 30, 118, 1, ORANGE[5]); box(c, bx - 59, GY - 26, 118, 26, TEAL[2]); box(c, bx - 59, GY - 26, 118, 1, TEAL[0]);
  c.restore();
  rr(c, bx - 41, GY - 127, 82, 52, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, bx - 40, GY - 126, 80, 50, 6); c.clip(); bands(c, bx - 40, GY - 126, 80, 50, ['#1E2A44', '#16203A', '#101830', '#0B1220']);
  // (inside: the empty stool, the roll of tickets, a cold coffee)
  box(c, bx + 4, GY - 92, 16, 3, '#3F3F46'); box(c, bx + 4, GY - 92, 16, 1, '#71717A'); box(c, bx + 10, GY - 89, 3, 13, '#27272A'); box(c, bx + 10, GY - 89, 1, 13, '#52525B');
  box(c, bx - 24, GY - 84, 10, 8, '#B91C1C'); box(c, bx - 24, GY - 84, 10, 2, '#EF4444');
  box(c, bx - 8, GY - 84, 6, 8, CREAM[4]); box(c, bx - 2, GY - 82, 2, 3, CREAM[2]);
  c.fillStyle = 'rgba(255, 255, 255, 0.12)'; c.beginPath(); c.moveTo(bx - 34, GY - 126); c.lineTo(bx - 18, GY - 126); c.lineTo(bx - 40, GY - 86); c.lineTo(bx - 40, GY - 110); c.closePath(); c.fill(); c.restore();
  box(c, bx - 45, GY - 77, 90, 7, INK); bands(c, bx - 44, GY - 76, 88, 5, [CHROME[6], CHROME[5], CHROME[3]]);
  // (the speaking grille in the glass, the bell on the counter)
  c.fillStyle = INK; c.beginPath(); c.arc(bx + 22, GY - 102, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = CHROME[3]; c.beginPath(); c.arc(bx + 22, GY - 102, 5, 0, Math.PI * 2); c.fill();
  for (let k = -3; k <= 3; k += 2) box(c, bx + 22 + k, GY - 105, 1, 6, CHROME[1]);
  c.fillStyle = INK; c.beginPath(); c.arc(bx + 30, GY - 77, 6, Math.PI, 0); c.fill(); c.fillStyle = BRASS[3]; c.beginPath(); c.arc(bx + 30, GY - 78, 5, Math.PI, 0); c.fill(); box(c, bx + 27, GY - 82, 2, 1, BRASS[5]); box(c, bx + 29, GY - 85, 2, 2, BRASS[2]);
  // (the card in the window: hand-written)
  box(c, bx - 31, GY - 70, 62, 19, INK);
  bands(c, bx - 30, GY - 69, 60, 17, [CREAM[4], CREAM[3]]);
  box(c, bx - 2, GY - 72, 4, 3, CHROME[4]);
  letters(c, 'BACK IN 5', bx, GY - 56, { family: 'painted', px: 1, fill: '#7F1D1D', seed: 21 });
  // the boomerang over the booth, and the TICKETS sign on it in neon
  c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 60, GY - 156); c.quadraticCurveTo(bx, GY - 196, bx + 66, GY - 172); c.lineTo(bx + 60, GY - 156); c.quadraticCurveTo(bx, GY - 176, bx - 56, GY - 150); c.closePath(); c.fill();
  c.fillStyle = ORANGE[2]; c.beginPath(); c.moveTo(bx - 56, GY - 157); c.quadraticCurveTo(bx, GY - 193, bx + 62, GY - 171); c.lineTo(bx + 57, GY - 158); c.quadraticCurveTo(bx, GY - 178, bx - 53, GY - 153); c.closePath(); c.fill();
  c.fillStyle = ORANGE[4]; c.beginPath(); c.moveTo(bx - 56, GY - 157); c.quadraticCurveTo(bx, GY - 193, bx + 62, GY - 171); c.lineTo(bx + 60, GY - 168); c.quadraticCurveTo(bx, GY - 188, bx - 55, GY - 154); c.closePath(); c.fill();
  rr(c, bx - 48, GY - 201, 96, 26, 4); c.fillStyle = INK; c.fill();
  c.save(); rr(c, bx - 47, GY - 200, 94, 24, 3); c.clip(); bands(c, bx - 47, GY - 200, 94, 24, [TEAL[1], TEAL[0], TEAL[0]]); c.restore();
  neon(c, 'TICKETS', bx, GY - 181, true, ORANGE[4], TEAL[0]);
  // the poster: the needle, a lot of reassurance
  poster(c, L + 415, GY - 180, 112, 120);
  // the height sign by the elevator: a rocket on a stick, its hand out at the mark
  heightSign(c, L + 805);
  // the elevator's portal at the far end
  c.save(); c.translate(LIFT_X, 0); elevatorPortal(c, 'ELEVATOR', 'TO SPACE', 210, 136, 170);
  brassPlaque(c, 0, GY - 284, 62, ['62 MILES']);
  c.restore();
  // stanchions and the rope (an empty line): dimmed, chrome posts, a velvet rope sagging between
  for (let k = 0; k < 4; k++) {
    const x = L + 500 + k * 80;
    checker(c, x - 14, GY - 2, 28, 2, 'rgba(0, 0, 0, 0.3)', 0);
    rr(c, x - 14, GY - 6, 28, 6, 2); c.fillStyle = INK; c.fill(); bands(c, x - 13, GY - 5, 26, 5, [dimc(CHROME[5]), dimc(CHROME[3])]);
    box(c, x - 3, GY - 44, 6, 40, INK); box(c, x - 2, GY - 44, 2, 40, dimc(CHROME[6])); box(c, x, GY - 44, 2, 40, dimc(CHROME[3]));
    c.fillStyle = INK; c.beginPath(); c.arc(x, GY - 47, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = dimc(CHROME[4]); c.beginPath(); c.arc(x, GY - 47, 4, 0, Math.PI * 2); c.fill();
    box(c, x - 2, GY - 50, 2, 2, dimc(CHROME[6]));
    if (k < 3) {
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x, GY - 42); c.quadraticCurveTo(x + 40, GY - 28, x + 80, GY - 42); c.stroke();
      c.strokeStyle = dimc('#7F1D1D'); c.lineWidth = 3; c.beginPath(); c.moveTo(x, GY - 42); c.quadraticCurveTo(x + 40, GY - 28, x + 80, GY - 42); c.stroke();
      c.strokeStyle = dimc('#DC2626'); c.lineWidth = 1; c.beginPath(); c.moveTo(x, GY - 43); c.quadraticCurveTo(x + 40, GY - 29, x + 80, GY - 43); c.stroke();
    }
  }
};
/** A framed poster on the wall (its middle at x, its top at y): a chrome frame, a banded night-blue field, the needle
 *  going up out of the clouds into a starburst, period poster type under it. */
const poster = (c: Ctx, x: number, y: number, w: number, h: number) => {
  const L = x - w / 2;
  rr(c, L - 4, y - 4, w + 8, h + 8, 3); c.fillStyle = INK; c.fill();
  bands(c, L - 3, y - 3, w + 6, h + 6, [CHROME[6], CHROME[5], CHROME[4], CHROME[3]]);
  box(c, L + 2, y + 2, w - 4, h - 4, INK);
  bands(c, L + 3, y + 3, w - 6, h - 6, ['#141846', '#1A1F52', '#232C6E', '#2D3A86', '#3A4A9A', '#4A5AA8']);
  // (stars, the burst, the needle: its stalk lit down one side, the saucer, the rays)
  for (let k = 0; k < 12; k++) box(c, L + 6 + ((k * 41) % (w - 12)), y + 5 + ((k * 23) % 30), 1, 1, '#E0E7FF');
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; c.strokeStyle = 'rgba(251, 164, 94, 0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x + Math.cos(a) * 26, y + 14 + Math.sin(a) * 18); c.stroke(); }
  star(c, x, y + 14, 9);
  box(c, x - 2, y + 18, 4, 26, INK); box(c, x - 1, y + 18, 1, 26, CHROME[6]); box(c, x, y + 18, 1, 26, CHROME[3]);
  c.fillStyle = INK; c.beginPath(); c.ellipse(x, y + 27, 12, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = TEAL[4]; c.beginPath(); c.ellipse(x, y + 27, 11, 3, 0, 0, Math.PI * 2); c.fill(); box(c, x - 8, y + 26, 8, 1, TEAL[6]);
  for (const [cx, cw] of [[x - 28, 26], [x + 22, 30]]) { box(c, cx - cw / 2, y + 42, cw, 4, '#C7D2FE'); box(c, cx - cw / 2 + 4, y + 39, cw - 10, 3, '#E0E7FF'); }
  letters(c, 'NOW 40%', x, y + 62, { family: 'poster', px: 2, py: 2, fill: ['#FEF08A', '#FACC15', '#EAB308'], shadow: ORANGE[1], drop: 2 });
  letters(c, 'LESS', x, y + 80, { family: 'poster', px: 2, py: 2, fill: ['#FEF08A', '#FACC15', '#EAB308'], shadow: ORANGE[1], drop: 2 });
  letters(c, 'DECOM-', x, y + 94, { family: 'poster', px: 1, fill: ['#FFFFFF', '#E0E7FF'], shadow: INK });
  letters(c, 'PRESSION', x, y + 105, { family: 'poster', px: 1, fill: ['#FFFFFF', '#E0E7FF'], shadow: INK });
  // (a corner of it peeling, taped back up)
  c.fillStyle = INK; c.beginPath(); c.moveTo(L + w - 3, y + h - 15); c.lineTo(L + w - 3, y + h - 3); c.lineTo(L + w - 15, y + h - 3); c.closePath(); c.fill();
  c.fillStyle = CREAM[3]; c.beginPath(); c.moveTo(L + w - 4, y + h - 13); c.lineTo(L + w - 4, y + h - 4); c.lineTo(L + w - 13, y + h - 4); c.closePath(); c.fill();
  box(c, L + w - 14, y + h - 12, 8, 4, TAPE[3]);
};
/** "YOU MUST BE THIS TALL TO GO TO SPACE": a hand-painted board, a rocket on a stick at the mark, its little hand out. */
const heightSign = (c: Ctx, x: number) => {
  rr(c, x - 48, GY - 183, 96, 62, 4); c.fillStyle = INK; c.fill();
  c.save(); rr(c, x - 47, GY - 182, 94, 60, 3); c.clip(); bands(c, x - 47, GY - 182, 94, 60, [CREAM[4], CREAM[4], CREAM[3], CREAM[2]]);
  box(c, x - 47, GY - 182, 94, 2, '#FFFFFF'); box(c, x + 44, GY - 182, 3, 60, CREAM[1]); c.restore();
  letters(c, 'YOU MUST BE', x, GY - 166, { family: 'painted', px: 1, fill: TEAL[1], seed: 31 });
  letters(c, 'THIS TALL', x, GY - 154, { family: 'painted', px: 1, fill: TEAL[1], seed: 37 });
  letters(c, 'TO GO TO', x, GY - 142, { family: 'painted', px: 1, fill: TEAL[1], seed: 41 });
  letters(c, 'SPACE', x, GY - 129, { family: 'painted', px: 2, py: 1, fill: ORANGE[1], seed: 43 });
  // (the stick: ruled, under the board; the rocket at the top of it with its hand out over the mark)
  box(c, x - 4, GY - 120, 8, 120, INK); box(c, x - 3, GY - 120, 3, 120, CREAM[4]); box(c, x, GY - 120, 3, 120, CREAM[2]);
  for (let y = GY - 112; y < GY; y += 8) box(c, x - 3, y, (y / 8) % 2 ? 3 : 5, 1, WALNUT[2]);
  // the rocket: a little red-and-white one clamped on the stick, its arm out flat at the mark
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 4, GY - 116); c.lineTo(x + 12, GY - 104); c.lineTo(x + 12, GY - 90); c.lineTo(x - 4, GY - 90); c.lineTo(x - 4, GY - 104); c.closePath(); c.fill();
  c.fillStyle = '#F8FAFC'; c.beginPath(); c.moveTo(x + 4, GY - 114); c.lineTo(x + 10, GY - 104); c.lineTo(x + 10, GY - 92); c.lineTo(x - 2, GY - 92); c.lineTo(x - 2, GY - 104); c.closePath(); c.fill();
  box(c, x + 6, GY - 104, 4, 12, '#CBD5E1'); box(c, x - 2, GY - 100, 12, 3, '#DC2626');
  box(c, x + 2, GY - 108, 4, 4, INK); box(c, x + 3, GY - 107, 2, 2, '#7DD3FC');
  box(c, x + 10, GY - 92, 22, 4, INK); box(c, x + 11, GY - 91, 20, 2, ORANGE[3]);
  box(c, x + 29, GY - 95, 4, 8, CREAM[4]); box(c, x + 28, GY - 96, 6, 1, INK);
};
const ceilingAndFloorLobby = (c: Ctx, L: number, R: number) => {
  const w = R - L;
  // the terrazzo, a plane going toward the viewer: the lit lip, cream in steps (lighter far, a shade darker near), the
  // joints of its slabs, the chips of stone in it, and the starburst inlaid in the middle (all of it bent in perspective
  // by drawLobby)
  box(c, L, GY, w, 3, '#F8FAFC');
  const TERRAZZO = ['#E2DBC8', '#D6CEB8', '#CAC1A9', '#BDB39A', '#B0A58B', '#A3977C'];
  box(c, L, GY + 3, w, 2, TERRAZZO[0]);
  bands(c, L, GY + 5, w, 202, TERRAZZO.slice(1));
  for (const y of [GY + 14, GY + 30, GY + 52, GY + 84, GY + 130]) { box(c, L, y, w, 1, '#857A62'); box(c, L, y + 1, w, 1, '#EEE8D8'); }
  for (let x = L + 32; x < R; x += 64) { box(c, x, GY + 3, 1, 204, '#857A62'); box(c, x + 1, GY + 3, 1, 204, '#EEE8D8'); }
  for (let x = L; x < R; x += 5) for (let k = 0; k < 4; k++) {
    const h = ((x * 13 + k * 71) % 997) / 997, y = GY + 5 + Math.floor(h * 198);
    box(c, x + (k * 3) % 5, y, 2, 1, k % 3 === 0 ? ORANGE[3] : k % 3 === 1 ? TEAL[4] : CREAM[0]);
  }
  // (the inlay: an atomic starburst, orange and teal, flattened on the floor)
  const ix = L + 600, iy = GY + 22;
  c.save(); c.translate(ix, iy); c.scale(1, 0.16);
  burst(c, 0, 0, 120, INK); burst(c, 0, 0, 116, ORANGE[2]); burst(c, -2, -6, 100, ORANGE[3]); burst(c, 0, 0, 80, TEAL[3]); burst(c, -2, -4, 66, TEAL[4]); burst(c, 0, 0, 44, ORANGE[4]);
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = CHROME[4]; c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill();
  c.fillStyle = CHROME[6]; c.beginPath(); c.arc(-4, -4, 7, 0, Math.PI * 2); c.fill();
  c.restore();
  // the ceiling's top edge
  bands(c, L, GY - 760, w, 120, [CHROME[0], CHROME[1], CHROME[1], CHROME[2]]);
};
export const drawLobby = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, w: 800 };
  if (v.x > LOBBY1 + 60 || v.x + v.w < LOBBY0 - 40) return;
  stamp(c, 'n2-lobby', LOBBY0, GY - 760, LOBBY1 + 40 - LOBBY0, 967, paintLobby);
  // (the floor in perspective, from where the camera's looking (the middle of what's on screen, zoomed or not: the one
  // eye): the joints and the inlay fan out toward him)
  bendFloor(c, { x: v.x + v.w / 2 }, GY + 3, GY + 3, GY + 207, LOBBY0, LOBBY1 + 40);
};

/** The elevator car going up (centered on CAR_X): its floor and roof slabs, its chrome ribs, the guide rails outside
 *  it, the altitude readout on its rib (`alt`: what it says), the speaker. The glass is the view (sky.ts). */
export const drawCar = (c: Ctx, state: GameState, alt: string) => {
  const v = state.view ?? { x: state.camera.x, w: 800 };
  if (v.x > CAR1 + 400 || v.x + v.w < CAR0 - 400) return;
  stamp(c, 'n2-car', CAR0 - 120, GY - 700, CAR1 - CAR0 + 240, 900, paintCar);
  // the readout (live: an amber dot-matrix)
  letters(c, alt, CAR0 + 68, GY - 116, { family: 'led', px: 2, py: 2, fill: ['#FDE68A', '#FBBF24', '#F59E0B'], hi: '#2A1804', shadow: 'rgba(251, 191, 36, 0.22)' });
};
const paintCar = (c: Ctx) => {
  // the guide rails, up and down out of sight
  for (const x of [CAR0 - 70, CAR1 + 54]) {
    vbands(c, x, GY - 700, 16, 900, [CHROME[4], CHROME[5], CHROME[3], CHROME[2]]); box(c, x - 1, GY - 700, 1, 900, INK); box(c, x + 16, GY - 700, 1, 900, INK);
    for (let y = GY - 690; y < GY + 200; y += 30) rivet(c, x + 6, y);
  }
  // the roof: a dome in teal steps (lit from the upper left, each step dithered into the next), chrome ribs over it, a
  // beacon on top; the lamp under it
  const hw = (CAR1 - CAR0) / 2;
  c.fillStyle = INK; c.beginPath(); c.ellipse(CAR_X, GY - 214, hw + 4, 52, 0, Math.PI, 0); c.fill();
  c.save(); c.beginPath(); c.ellipse(CAR_X, GY - 214, hw, 48, 0, Math.PI, 0); c.clip();
  box(c, CAR0 - 10, GY - 270, hw * 2 + 20, 60, TEAL[2]);
  const steps: [number, number, number, string][] = [[-6, -4, 0.92, TEAL[3]], [-16, -9, 0.74, TEAL[4]], [-30, -15, 0.52, TEAL[5]], [-44, -21, 0.3, TEAL[6]]];
  for (const [dx, dy, k, col] of steps) {
    c.save(); c.beginPath(); c.ellipse(CAR_X + dx, GY - 214 + dy, hw * k + 4, 48 * k + 3, 0, 0, Math.PI * 2); c.clip(); checker(c, CAR0 - 10, GY - 270, hw * 2 + 20, 60, col, 0); c.restore();
    c.fillStyle = col; c.beginPath(); c.ellipse(CAR_X + dx, GY - 214 + dy, hw * k, 48 * k, 0, 0, Math.PI * 2); c.fill();
  }
  c.restore();
  for (const k of [-0.6, 0.6]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(CAR_X + k * hw, GY - 214); c.quadraticCurveTo(CAR_X + k * hw * 0.8, GY - 250, CAR_X + k * 20, GY - 262); c.stroke(); c.strokeStyle = CHROME[5]; c.lineWidth = 1; c.stroke(); }
  box(c, CAR_X - 4, GY - 276, 8, 14, INK); box(c, CAR_X - 3, GY - 276, 6, 13, CHROME[4]); box(c, CAR_X - 3, GY - 276, 2, 13, CHROME[6]);
  steppedGlow(c, CAR_X, GY - 279, 12, '#EF4444', 0.3, 0.04, 3);
  c.fillStyle = INK; c.beginPath(); c.arc(CAR_X, GY - 279, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#EF4444'; c.beginPath(); c.arc(CAR_X, GY - 279, 4, 0, Math.PI * 2); c.fill(); box(c, CAR_X - 2, GY - 282, 2, 2, '#FECACA');
  bands(c, CAR0 - 6, GY - 218, CAR1 - CAR0 + 12, 22, [CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[1]]);
  box(c, CAR0 - 6, GY - 218, CAR1 - CAR0 + 12, 1, INK); box(c, CAR0 - 6, GY - 196, CAR1 - CAR0 + 12, 1, INK);
  for (let x = CAR0 + 4; x < CAR1; x += 24) rivet(c, x, GY - 213);
  // (the ceiling lamp, its light falling in steps; the speaker's grille)
  box(c, CAR_X - 26, GY - 196, 52, 6, INK); box(c, CAR_X - 24, GY - 196, 48, 4, '#FDE68A'); box(c, CAR_X - 20, GY - 196, 24, 2, '#FFFBEB');
  for (const [a, wd, hh] of [[0.07, 70, 30], [0.05, 110, 60]] as const) { c.fillStyle = `rgba(253, 230, 138, ${a})`; c.beginPath(); c.moveTo(CAR_X - 24, GY - 192); c.lineTo(CAR_X + 24, GY - 192); c.lineTo(CAR_X + wd, GY - 192 + hh); c.lineTo(CAR_X - wd, GY - 192 + hh); c.closePath(); c.fill(); }
  rr(c, CAR_X + 59, GY - 195, 26, 10, 4); c.fillStyle = INK; c.fill();
  rr(c, CAR_X + 60, GY - 194, 24, 8, 3); c.fillStyle = CHROME[3]; c.fill();
  for (let k = 0; k < 5; k++) box(c, CAR_X + 63 + k * 4, GY - 192, 2, 4, CHROME[1]);
  // the floor slab: its lit lip, banded chrome and an orange band, the underside tapering in teal steps to its clamp
  box(c, CAR0 - 6, GY, CAR1 - CAR0 + 12, 3, '#F8FAFC');
  bands(c, CAR0 - 6, GY + 3, CAR1 - CAR0 + 12, 26, [CHROME[5], CHROME[4], CHROME[3], ORANGE[3], CHROME[1]]);
  box(c, CAR0 - 6, GY + 18, CAR1 - CAR0 + 12, 1, ORANGE[5]);
  for (let x = CAR0 + 6; x < CAR1; x += 30) rivet(c, x, GY + 7);
  c.fillStyle = INK; c.beginPath(); c.moveTo(CAR0 - 6, GY + 29); c.lineTo(CAR1 + 6, GY + 29); c.lineTo(CAR_X + 50, GY + 90); c.lineTo(CAR_X - 50, GY + 90); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(CAR0 - 3, GY + 30); c.lineTo(CAR1 + 3, GY + 30); c.lineTo(CAR_X + 48, GY + 88); c.lineTo(CAR_X - 48, GY + 88); c.closePath(); c.clip();
  vbands(c, CAR0 - 3, GY + 30, CAR1 - CAR0 + 6, 58, [TEAL[4], TEAL[3], TEAL[3], TEAL[2], TEAL[2], TEAL[1], TEAL[1], TEAL[0]]);
  bands(c, CAR0 - 3, GY + 30, CAR1 - CAR0 + 6, 58, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(3, 18, 22, 0.25)', 'rgba(3, 18, 22, 0.45)']);
  for (let k = -3; k <= 3; k++) { box(c, CAR_X + k * 40, GY + 30, 1, 58, TEAL[1]); box(c, CAR_X + k * 40 + 1, GY + 30, 1, 58, TEAL[4]); }
  c.restore();
  // (the underside's emblem: the needle in a starburst)
  star(c, CAR_X, GY + 52, 13);
  box(c, CAR_X - 31, GY + 88, 62, 12, INK); bands(c, CAR_X - 30, GY + 88, 60, 10, [CHROME[5], CHROME[3], CHROME[2]]);
  // the clamps out to the rails
  for (const [x0, x1] of [[CAR0 - 54, CAR0 - 6], [CAR1 + 6, CAR1 + 54]]) for (const y of [GY - 40, GY - 200]) {
    box(c, x0, y - 1, x1 - x0, 16, INK); bands(c, x0, y, x1 - x0, 14, [CHROME[6], CHROME[4], CHROME[3], CHROME[1]]); rivet(c, (x0 + x1) / 2 - 1, y + 5);
  }
  // the ribs, the glass's frame, the handrail on its brackets (dimmed)
  column(c, CAR0 - 6, GY - 200, 16, 200); column(c, CAR1 - 10, GY - 200, 16, 200);
  for (const x of [CAR0 + 40, CAR_X, CAR1 - 40]) { box(c, x - 2, GY - 68, 4, 10, INK); box(c, x - 1, GY - 68, 2, 9, dimc(CHROME[4])); }
  box(c, CAR0 + 10, GY - 72, CAR1 - CAR0 - 20, 6, INK); box(c, CAR0 + 10, GY - 71, CAR1 - CAR0 - 20, 2, dimc(CHROME[6])); box(c, CAR0 + 10, GY - 69, CAR1 - CAR0 - 20, 2, dimc(CHROME[4]));
  // the readout's housing on the rib (its words: live), the inspection plaque under it
  rr(c, CAR0 + 14, GY - 154, 108, 48, 4); c.fillStyle = INK; c.fill();
  c.save(); rr(c, CAR0 + 15, GY - 153, 106, 46, 3); c.clip(); bands(c, CAR0 + 15, GY - 153, 106, 46, [CHROME[5], CHROME[4], CHROME[3], CHROME[2]]); c.restore();
  box(c, CAR0 + 19, GY - 149, 98, 38, INK); box(c, CAR0 + 20, GY - 148, 96, 36, '#120A02');
  letters(c, 'ALTITUDE', CAR0 + 68, GY - 136, { family: 'led', px: 1, fill: '#B45309' });
  box(c, CAR0 + 20, GY - 148, 96, 1, '#2A1804');
  brassPlaque(c, CAR0 + 68, GY - 98, 92, ['INSPECTED 1971']);
  // the glass's glare
  glare(c, CAR0 + 10, GY - 196, CAR1 - CAR0 - 20, 196);
};

/** An elevator's doors opening (over its stamped shut ones), at x, its gap `hw` either side of the middle and `h` tall,
 *  `o` how far open (0..1): the lit car inside, the two doors drawn back into the frame. */
export const drawLiftDoors = (c: Ctx, x: number, hw: number, h: number, o: number) => {
  if (o <= 0) return;
  // the car inside: cream panels, lit from its ceiling (a lamp, its light in steps), a handrail, the floor's lit lip
  bands(c, x - hw, GY - h, hw * 2, h, [CREAM[4], CREAM[3], CREAM[3], CREAM[2], CREAM[1]]);
  for (const px of [x - hw + hw * 0.5, x + hw * 0.5]) { box(c, px, GY - h + 8, 1, h - 20, CREAM[0]); box(c, px + 1, GY - h + 8, 1, h - 20, '#FFFDF5'); }
  box(c, x - hw, GY - h, hw * 2, 4, '#FFFBEB'); box(c, x - 16, GY - h + 4, 32, 3, '#FDE68A');
  c.fillStyle = 'rgba(255, 251, 235, 0.25)'; c.beginPath(); c.moveTo(x - 16, GY - h + 7); c.lineTo(x + 16, GY - h + 7); c.lineTo(x + hw, GY - h + 50); c.lineTo(x - hw, GY - h + 50); c.closePath(); c.fill();
  box(c, x - hw, GY - 68, hw * 2, 5, INK); box(c, x - hw, GY - 67, hw * 2, 2, dimc(CHROME[6])); box(c, x - hw, GY - 65, hw * 2, 1, dimc(CHROME[3]));
  box(c, x - hw, GY - 6, hw * 2, 6, WALNUT[2]); box(c, x - hw, GY - 6, hw * 2, 1, WALNUT[4]);
  box(c, x - hw, GY - 3, hw * 2, 3, CHROME[5]);
  // the doors, slid back
  const w = hw * (1 - o);
  if (w > 0.5) {
    vbands(c, x - hw, GY - h, w, h, [CHROME[4], CHROME[5], CHROME[4], CHROME[3]]);
    vbands(c, x + hw - w, GY - h, w, h, [CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
    box(c, x - hw + w - 1, GY - h, 1, h, INK); box(c, x + hw - w, GY - h, 1, h, INK);
  }
};
