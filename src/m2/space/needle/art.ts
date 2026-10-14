// Space Needle 2, painted (world space). The user wants the deck pretty now: a 1960s space-age interior in chrome and
// teal, walnut and cream, orange for the accents; every surface a stepped ramp lit from the upper left, inked edges,
// the steps dithered where they meet. Still art (the wall's slots, the bulkhead, the lift's portal, the props) goes
// down from stamps; what changes (the suit's case, the big window, the lift's readout) is drawn live.
//
//   the lobby       the ticket hall at the needle's foot: the way back out onto the drag, the lift's doors
//   the car         the glass lift car (riding up: the views out of it are sky.ts's)
//   the deck        the observation deck, a ring: the slots of the outer wall (windows; the suit's alcove; the lift; the
//                   big window at the end), the bulkhead at its start, the props, the suit's case, the end glass

import type { GameState } from '../../../m1/game/core/state';
import { stamp, checker, mix, tilePattern, bendFloor, type Ctx } from '../../intro/art/kit';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { GY, LOBBY0, LIFT_X, LOBBY1, CAR0, CAR1, CAR_X, D0, D1, CEIL, CASE_X, SLOT, SLOTS, slotX, slotKind, WIN_HW, WIN_TOP, WIN_BOT, WIN_R, SPEAKER_Y, type SlotKind } from './layout';

const INK = '#0A0F1A';
const TEAL = ['#052A33', '#083B47', '#0D4F5D', '#126775', '#1A808C', '#2A9AA3', '#49B4B8'];
const CHROME = ['#1B2432', '#2E3A4D', '#4A5A70', '#74859C', '#A3B1C4', '#CDD6E2', '#EEF2F7'];
const ORANGE = ['#6B2410', '#A33A12', '#D2551A', '#F07A2E', '#FBA45E', '#FDCB94'];
const WALNUT = ['#24160B', '#3A2412', '#523419', '#6C4522', '#86592E'];
const CREAM = ['#8F8672', '#B4AB93', '#D5CCB2', '#EAE3CD', '#F8F4E6'];

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
/** A chrome column, lit down its left, inked either side. */
const column = (c: Ctx, x: number, y: number, w: number, h: number) => {
  vbands(c, x, y, w, h, [CHROME[4], CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[2], CHROME[1]]);
  box(c, x - 1, y, 1, h, INK); box(c, x + w, y, 1, h, INK);
};
/** A rounded rectangle, as a path. */
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
/** Words on a sign (the pixel font), centered. */
const words = (c: Ctx, s: string, x: number, y: number, col: string, size = 8, shadow = INK) => {
  c.font = `${size}px "Press Start 2P"`; c.textAlign = 'center';
  c.fillStyle = shadow; c.fillText(s, Math.round(x) + 1, Math.round(y) + 1);
  c.fillStyle = col; c.fillText(s, Math.round(x), Math.round(y));
  c.textAlign = 'left';
};
/** A four-point starburst (the decals, the lamps). */
const burst = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = col; c.beginPath();
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 - Math.PI / 2, d = k % 2 ? r * 0.28 : r; c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d); }
  c.closePath(); c.fill();
};
/** Background stuff (benches, viewers, the cart) dimmed back toward the wall, so none of it reads as somewhere to stand. */
const dimc = (col: string) => mix(col, '#0D3440', 0.42);

// ---------------------------------------------------------------------------------------------------------------
// The deck's slab, its ceiling, its floor (common to every slot): from x0 to x1

const ceilingAndFloor = (c: Ctx, x0: number, x1: number) => {
  const w = x1 - x0;
  // the hull over the ceiling (what's above it on screen): dark, banded, a riveted seam
  bands(c, x0, CEIL - 220, w, 220, [CHROME[0], '#141C28', CHROME[1], '#202C3C', CHROME[1], CHROME[2]]);
  for (let x = x0 + 12; x < x1; x += 24) box(c, x, CEIL - 30, 2, 2, CHROME[3]);
  // the soffit: a chrome trim, lit along its bottom edge
  bands(c, x0, CEIL - 8, w, 26, [CHROME[2], CHROME[3], CHROME[4], CHROME[5]]);
  box(c, x0, CEIL + 18, w, 2, CHROME[6]); box(c, x0, CEIL + 20, w, 1, INK);
  // (the cove light along under it: a warm band)
  box(c, x0, CEIL + 21, w, 3, '#FDE68A'); checker(c, x0, CEIL + 24, w, 2, 'rgba(253, 230, 138, 0.5)');
  // the floor: the lit lip (standable), terrazzo, then the slab's face
  box(c, x0, GY, w, 3, '#F8FAFC'); box(c, x0, GY + 3, w, 2, CREAM[4]);
  bands(c, x0, GY + 5, w, 22, [CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
  for (let x = x0; x < x1; x += 7) { const k = (x * 13) % 17; box(c, x + (k % 5), GY + 8 + (k % 14), 2, 1, k % 3 ? ORANGE[3] : TEAL[4]); }
  box(c, x0, GY + 27, w, 2, INK);
  bands(c, x0, GY + 29, w, 30, [CHROME[5], CHROME[4], CHROME[3], CHROME[2]]);
  box(c, x0, GY + 59, w, 4, ORANGE[3]); box(c, x0, GY + 63, w, 2, ORANGE[1]);
  bands(c, x0, GY + 65, w, 140, [TEAL[2], TEAL[1], TEAL[1], TEAL[0], '#03161B', '#020D10']);
};

/** One slot's wall (CEIL+20 down to GY), centered on 0: its pilasters, its panels, and what's in it. */
const paintSlot = (c: Ctx, kind: SlotKind) => {
  const L = -SLOT / 2, R = SLOT / 2;
  const top = CEIL + 26, bot = GY;
  // the upper band: teal, a starburst decal either side, the speaker's grille
  bands(c, L, top, SLOT, WIN_TOP - top - 12, [TEAL[3], TEAL[3], TEAL[2]]);
  for (const s of [-1, 1]) { burst(c, s * 78, top + 30, 11, ORANGE[3]); burst(c, s * 78, top + 30, 5, ORANGE[5]); }
  rr(c, -14, SPEAKER_Y - 2 - 4, 28, 12, 5); c.fillStyle = CHROME[3]; c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
  for (let k = -10; k <= 8; k += 4) box(c, k, SPEAKER_Y - 3, 2, 6, CHROME[1]);
  if (kind === 'big') {
    // floor to ceiling glass: just its frame round the top and the sill along the floor
    bands(c, L, WIN_TOP - 12, SLOT, 12, [CHROME[5], CHROME[4], CHROME[2]]);
    bands(c, L, GY - 14, SLOT, 14, [CHROME[5], CHROME[3], CHROME[1]]);
    c.save(); c.globalCompositeOperation = 'destination-out'; box(c, L + 12, WIN_TOP, SLOT - 12, GY - 14 - WIN_TOP, '#000'); c.restore();
    glare(c, L + 12, WIN_TOP, SLOT - 12, GY - 14 - WIN_TOP);
    column(c, L, top, 16, bot - top);
    return;
  }
  // the wall's panels, round whatever's in the slot
  bands(c, L, WIN_TOP - 12, SLOT, GY - WIN_TOP + 12, [TEAL[4], TEAL[3], TEAL[3], TEAL[2], TEAL[2]]);
  // the dado under it: walnut, grooved, the dimmed handrail (not somewhere to stand), the kick plate
  bands(c, L, WIN_BOT + 14, SLOT, GY - WIN_BOT - 14, [WALNUT[3], WALNUT[2], WALNUT[2], WALNUT[1]]);
  for (let x = L + 10; x < R; x += 20) { box(c, x, WIN_BOT + 18, 1, GY - WIN_BOT - 32, WALNUT[0]); box(c, x + 1, WIN_BOT + 18, 1, GY - WIN_BOT - 32, WALNUT[4]); }
  box(c, L, GY - 74, SLOT, 5, dimc(CHROME[4])); box(c, L, GY - 74, SLOT, 1, dimc(CHROME[5])); box(c, L, GY - 69, SLOT, 1, INK);
  bands(c, L, GY - 12, SLOT, 12, [CHROME[3], CHROME[2], CHROME[1]]);
  if (kind === 'window') {
    // the window: a chrome frame, rounded, round a hole (space, through it); the glare across the glass
    rr(c, -WIN_HW - 10, WIN_TOP - 10, WIN_HW * 2 + 20, WIN_BOT - WIN_TOP + 20, WIN_R + 8);
    c.fillStyle = INK; c.fill();
    rr(c, -WIN_HW - 8, WIN_TOP - 8, WIN_HW * 2 + 16, WIN_BOT - WIN_TOP + 16, WIN_R + 6);
    c.fillStyle = CHROME[3]; c.fill();
    rr(c, -WIN_HW - 8, WIN_TOP - 8, WIN_HW * 2 + 16, (WIN_BOT - WIN_TOP) / 2, WIN_R + 6); c.fillStyle = CHROME[5]; c.fill();
    rr(c, -WIN_HW - 3, WIN_TOP - 3, WIN_HW * 2 + 6, WIN_BOT - WIN_TOP + 6, WIN_R + 2); c.fillStyle = CHROME[1]; c.fill();
    c.save(); c.globalCompositeOperation = 'destination-out';
    rr(c, -WIN_HW, WIN_TOP, WIN_HW * 2, WIN_BOT - WIN_TOP, WIN_R); c.fill();
    c.restore();
    c.save(); rr(c, -WIN_HW, WIN_TOP, WIN_HW * 2, WIN_BOT - WIN_TOP, WIN_R); c.clip();
    glare(c, -WIN_HW, WIN_TOP, WIN_HW * 2, WIN_BOT - WIN_TOP);
    c.restore();
    // (a chrome sill under it, a little lip of light)
    box(c, -WIN_HW - 14, WIN_BOT + 8, WIN_HW * 2 + 28, 6, dimc(CHROME[5])); box(c, -WIN_HW - 14, WIN_BOT + 14, WIN_HW * 2 + 28, 1, INK);
  } else if (kind === 'suit') {
    // the alcove for the case: lit from above, cream, banded; a spotlight cone down it
    rr(c, -96, WIN_TOP - 20, 192, GY - WIN_TOP + 8, 14); c.fillStyle = INK; c.fill();
    c.save(); rr(c, -94, WIN_TOP - 18, 188, GY - WIN_TOP + 6, 12); c.clip();
    bands(c, -94, WIN_TOP - 18, 188, GY - WIN_TOP + 6, [CREAM[4], CREAM[3], CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
    c.fillStyle = 'rgba(255, 251, 235, 0.22)'; c.beginPath(); c.moveTo(-20, WIN_TOP - 18); c.lineTo(20, WIN_TOP - 18); c.lineTo(70, GY); c.lineTo(-70, GY); c.closePath(); c.fill();
    c.restore();
    box(c, -16, WIN_TOP - 26, 32, 8, CHROME[5]); box(c, -12, WIN_TOP - 18, 24, 3, '#FFFBEB');
    // (in the alcove's head, under its lamp: up over it, the PA's grille sat on the words)
    words(c, 'THE REAL THING', 0, WIN_TOP + 12, ORANGE[1], 7, '#FFFBEB');
  } else if (kind === 'lift') {
    // the lift's portal: chrome round a starburst header, the doors shut, its arrows
    rr(c, -66, GY - 196, 132, 196, 10); c.fillStyle = INK; c.fill();
    rr(c, -64, GY - 194, 128, 194, 9); c.fillStyle = CHROME[4]; c.fill();
    rr(c, -64, GY - 194, 128, 40, 9); c.fillStyle = CHROME[5]; c.fill();
    vbands(c, -52, GY - 160, 52, 160, [CHROME[4], CHROME[5], CHROME[4], CHROME[3]]);
    vbands(c, 0, GY - 160, 52, 160, [CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
    box(c, -1, GY - 160, 2, 160, INK);
    for (const s of [-1, 1]) box(c, s * 26 - 4, GY - 96, 8, 30, CHROME[2]);
    burst(c, 0, GY - 214, 22, ORANGE[3]); burst(c, 0, GY - 214, 12, ORANGE[5]); burst(c, 0, GY - 214, 5, '#FFFFFF');
    box(c, 74, GY - 120, 14, 30, CHROME[1]); box(c, 77, GY - 116, 8, 8, ORANGE[4]); box(c, 77, GY - 104, 8, 8, '#3F3F46');
    words(c, 'LIFT', 0, GY - 172, CHROME[1], 8, CHROME[6]);
    wallPlaque(c, 0, GY - 290, 'ALTITUDE', '62 MILES');
  }
  // the pilasters between the slots
  column(c, L, top, 16, bot - top);
};
/** A brass-and-walnut plaque on the wall: two lines (its left at x). */
const wallPlaque = (c: Ctx, x: number, y: number, a: string, b: string) => {
  rr(c, x - 52, y - 16, 104, 40, 4); c.fillStyle = INK; c.fill();
  rr(c, x - 51, y - 15, 102, 38, 3); c.fillStyle = WALNUT[2]; c.fill();
  rr(c, x - 47, y - 11, 94, 30, 2); c.fillStyle = '#B88A2E'; c.fill();
  box(c, x - 47, y - 11, 94, 3, '#E7C463');
  words(c, a, x, y + 2, WALNUT[1], 7, '#E7C463'); words(c, b, x, y + 14, WALNUT[1], 7, '#E7C463');
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
  bands(c, L, CEIL - 220, w, GY + 440 - CEIL, [CHROME[1], CHROME[2], CHROME[2], CHROME[1], CHROME[1], CHROME[0]]);
  // its face: big panels, riveted, a hazard band along its foot, the hatch outline that's welded shut
  for (let y = CEIL + 10; y < GY - 20; y += 110) for (let x = L + 20; x < -30; x += 120) {
    rr(c, x, y, 108, 98, 6); c.fillStyle = INK; c.fill();
    rr(c, x + 1, y + 1, 106, 96, 5); c.fillStyle = CHROME[2]; c.fill();
    box(c, x + 3, y + 3, 102, 3, CHROME[3]);
    for (const [rx, ry] of [[6, 8], [98, 8], [6, 88], [98, 88]]) { box(c, x + rx, y + ry, 3, 3, CHROME[4]); box(c, x + rx + 1, y + ry + 2, 2, 1, INK); }
  }
  for (let x = L; x < 0; x += 24) { c.fillStyle = '#EAB308'; c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 12, GY - 24); c.lineTo(x + 24, GY - 24); c.lineTo(x + 12, GY); c.fill(); c.fillStyle = INK; c.beginPath(); c.moveTo(x + 12, GY); c.lineTo(x + 24, GY - 24); c.lineTo(x + 36, GY - 24); c.lineTo(x + 24, GY); c.fill(); }
  box(c, L, GY - 26, w, 2, INK);
  // the deck's end: a thick chrome jamb where it meets the ring
  column(c, -34, CEIL - 220, 34, GY + 440 - CEIL);
  box(c, L, GY, w, 3, CHROME[5]);
  words(c, 'END OF DECK', -170, GY - 160, '#EAB308', 8);
  words(c, 'THANK YOU', -170, GY - 140, CHROME[5], 7);
  words(c, 'FOR ROTATING', -170, GY - 126, CHROME[5], 7);
};

/** A bench, mid-century: a walnut frame, an orange cushion, hairpin legs (dimmed: background). */
const paintBench = (c: Ctx) => {
  box(c, -70, GY - 40, 140, 10, dimc(ORANGE[2])); box(c, -70, GY - 40, 140, 3, dimc(ORANGE[4]));
  box(c, -72, GY - 30, 144, 6, dimc(WALNUT[3])); box(c, -72, GY - 24, 144, 1, INK);
  for (const x of [-60, -50, 50, 60]) box(c, x, GY - 24, 2, 24, dimc(CHROME[3]));
};
/** A coin viewer on a post (the tower kind), turned to the window (dimmed). */
const paintViewer = (c: Ctx) => {
  box(c, -4, GY - 96, 8, 96, dimc(CHROME[3])); box(c, -4, GY - 96, 2, 96, dimc(CHROME[5]));
  box(c, -16, GY - 6, 32, 6, dimc(CHROME[2]));
  rr(c, -20, GY - 132, 40, 36, 8); c.fillStyle = INK; c.fill();
  rr(c, -19, GY - 131, 38, 34, 7); c.fillStyle = dimc(TEAL[4]); c.fill();
  box(c, -19, GY - 131, 38, 6, dimc(TEAL[5]));
  for (const s of [-1, 1]) { box(c, s * 9 - 5, GY - 126, 10, 10, INK); box(c, s * 9 - 3, GY - 124, 6, 6, '#0EA5E9'); }
  box(c, 12, GY - 108, 6, 8, dimc(ORANGE[3]));
  words(c, '25¢', 0, GY - 82, dimc(CREAM[4]), 6);
};
/** The gift cart: a striped awning, the freezer, its sign (dimmed). */
const paintCart = (c: Ctx) => {
  for (const s of [-1, 1]) box(c, s * 62 - 2, GY - 150, 4, 110, dimc(CHROME[4]));
  for (let k = 0; k < 8; k++) { c.fillStyle = dimc(k % 2 ? CREAM[4] : ORANGE[3]); c.beginPath(); c.moveTo(-72 + k * 18, GY - 160); c.lineTo(-54 + k * 18, GY - 160); c.lineTo(-54 + k * 18, GY - 146); c.quadraticCurveTo(-63 + k * 18, GY - 138, -72 + k * 18, GY - 146); c.fill(); }
  box(c, -74, GY - 166, 148, 6, dimc(CHROME[4]));
  rr(c, -66, GY - 64, 132, 52, 6); c.fillStyle = INK; c.fill();
  rr(c, -65, GY - 63, 130, 50, 5); c.fillStyle = dimc(TEAL[4]); c.fill();
  box(c, -65, GY - 63, 130, 6, dimc(TEAL[6]));
  for (const s of [-1, 1]) { c.fillStyle = dimc(CHROME[2]); c.beginPath(); c.arc(s * 44, GY - 8, 8, 0, Math.PI * 2); c.fill(); }
  words(c, 'ASTRONAUT', 0, GY - 44, dimc(CREAM[4]), 6);
  words(c, 'ICE CREAM $14', 0, GY - 32, dimc(ORANGE[5]), 6);
  // (the stock on top: foil packets)
  for (let k = 0; k < 5; k++) box(c, -50 + k * 22, GY - 76, 14, 12, dimc(k % 2 ? CHROME[5] : CHROME[4]));
};
/** A sputnik floor lamp: a chrome ball on a stem, spikes out of it each tipped with a bulb (dimmed; its bulbs lit). */
const paintSputnik = (c: Ctx) => {
  box(c, -2, GY - 140, 4, 140, dimc(CHROME[3])); box(c, -18, GY - 4, 36, 4, dimc(CHROME[2]));
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2, x = Math.cos(a) * 30, y = GY - 150 + Math.sin(a) * 30;
    c.strokeStyle = dimc(CHROME[4]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, GY - 150); c.lineTo(x, y); c.stroke();
    box(c, x - 3, y - 3, 6, 6, '#FDE68A'); box(c, x - 1, y - 1, 2, 2, '#FFFFFF');
  }
  c.fillStyle = dimc(CHROME[5]); c.beginPath(); c.arc(0, GY - 150, 9, 0, Math.PI * 2); c.fill();
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

/** The case: the plinth, the glass box, the suit in it on its stand (or just the bald mannequin, the glass smashed). */
export const drawSuitCase = (c: Ctx, state: GameState, taken: boolean, smashT: number) => {
  const x = CASE_X;
  // the plinth, its plaque
  // (wide enough for its plaque's words: 6 px a letter, the longest line 19 of them)
  rr(c, x - 76, GY - 46, 152, 46, 3); c.fillStyle = INK; c.fill();
  bands(c, x - 75, GY - 45, 150, 45, [TEAL[5], TEAL[4], TEAL[3], TEAL[3], TEAL[2]]);
  box(c, x - 75, GY - 45, 150, 2, TEAL[6]);
  rr(c, x - 66, GY - 38, 132, 30, 2); c.fillStyle = '#B88A2E'; c.fill(); box(c, x - 66, GY - 38, 132, 2, '#E7C463');
  words(c, 'REAL ASTRONAUT', x, GY - 27, WALNUT[1], 6, '#E7C463');
  words(c, 'SUIT. DO NOT TOUCH.', x, GY - 15, '#7F1D1D', 6, '#E7C463');
  // the mannequin, and the suit on it
  const fy = GY - 46;
  if (!taken) drawSuitFigure(c, x, fy, state.frame);
  else {
    // (bald, white, naked, its arms out: the suit's gone off it)
    c.fillStyle = INK; c.fillRect(x - 2, fy - 4, 4, 4);
    c.fillStyle = '#E5E7EB';
    for (const s of [-1, 1]) { c.fillRect(x + s * 6 - 3, fy - 34, 6, 30); c.fillRect(x + s * 12 - 2, fy - 64, 4, 26); }
    rr(c, x - 12, fy - 70, 24, 38, 6); c.fill(); c.strokeStyle = INK; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.arc(x, fy - 80, 9, 0, Math.PI * 2); c.fill(); c.stroke();
    box(c, x - 12, fy - 70, 6, 34, '#F8FAFC');
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
    box(c, gx - 2, gy - 6, gw + 4, 6, CHROME[4]);
    c.fillStyle = 'rgba(165, 243, 252, 0.35)';
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(gx + k * 16, gy); c.lineTo(gx + k * 16 + 14, gy); c.lineTo(gx + k * 16 + 6, gy + 10 + ((k * 7) % 13)); c.closePath(); c.fill(); }
    for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(gx + k * 16, gy + gh); c.lineTo(gx + k * 16 + 14, gy + gh); c.lineTo(gx + k * 16 + 8, gy + gh - 6 - ((k * 5) % 9)); c.closePath(); c.fill(); }
    for (let k = 0; k < 9; k++) box(c, x - 70 + ((k * 37) % 140), GY - 3, 4 + (k % 3), 2, '#CFFAFE');
    if (smashT > 0 && smashT < 40) { c.fillStyle = `rgba(255, 255, 255, ${(0.5 * (1 - smashT / 40)).toFixed(3)})`; c.fillRect(gx - 10, gy - 10, gw + 20, gh + 20); }
  }
};
/** The suit itself, on its stand (feet at y): white, puffy, ringed at the joints, its pack, the gold-visored helmet. */
export const drawSuitFigure = (c: Ctx, x: number, y: number, f: number) => {
  const S = ['#4E5A6C', '#7C8AA0', '#A8B4C6', '#CCD5E1', '#E8EDF3', '#FFFFFF'];
  /** A puffy limb or body part: inked, its middle tone, lit down its left, shaded down its right. */
  const part = (px: number, py: number, w: number, h: number, r: number, base = 3) => {
    rr(c, px - 1, py - 1, w + 2, h + 2, r + 1); c.fillStyle = INK; c.fill();
    c.save(); rr(c, px, py, w, h, r); c.clip();
    box(c, px, py, w, h, S[base]);
    box(c, px, py, Math.max(2, w * 0.3), h, S[base + 1]); box(c, px + 1, py + 1, Math.max(1, w * 0.12), h - 2, S[Math.min(5, base + 2)]);
    box(c, px + w * 0.72, py, w * 0.28, h, S[base - 1]); checker(c, px + w * 0.6, py, 2, h, S[base - 1], 0);
    c.restore();
  };
  // the pack behind
  part(x - 18, y - 76, 36, 40, 4, 2);
  box(c, x - 14, y - 70, 6, 4, '#3B82F6'); box(c, x - 6, y - 70, 6, 4, '#DC2626');
  // legs, their rings, the boots
  for (const s of [-1, 1]) {
    part(x + s * 7 - 6, y - 36, 12, 32, 4);
    box(c, x + s * 7 - 6, y - 22, 12, 2, S[1]); box(c, x + s * 7 - 6, y - 20, 12, 1, S[4]);
    part(x + s * 7 - 8, y - 7, 16, 7, 2, 1);
  }
  // the body, its control box, the patch
  part(x - 15, y - 72, 30, 40, 7, 3);
  rr(c, x - 8, y - 61, 16, 12, 2); c.fillStyle = INK; c.fill();
  rr(c, x - 7, y - 60, 14, 10, 2); c.fillStyle = S[2]; c.fill(); box(c, x - 7, y - 60, 14, 2, S[4]);
  box(c, x - 5, y - 57, 3, 3, '#DC2626'); box(c, x + 1, y - 57, 3, 3, '#2563EB'); box(c, x - 2, y - 53, 4, 2, '#16A34A');
  box(c, x + 5, y - 69, 7, 7, INK); box(c, x + 6, y - 68, 5, 5, ORANGE[3]); box(c, x + 6, y - 68, 5, 1, ORANGE[5]);
  // arms, their rings, gloves
  for (const s of [-1, 1]) {
    part(x + s * 19 - 5, y - 70, 10, 30, 4);
    box(c, x + s * 19 - 5, y - 54, 10, 2, S[1]);
    part(x + s * 19 - 5, y - 42, 10, 8, 3, 1);
  }
  // the helmet: the neck ring, the shell in steps, the gold visor (banded, a glint going across it)
  box(c, x - 12, y - 77, 24, 6, INK); box(c, x - 11, y - 76, 22, 4, S[2]); box(c, x - 11, y - 76, 22, 1, S[4]);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y - 90, 16, 0, Math.PI * 2); c.fill();
  for (const [r, dx, col] of [[15, 0, S[2]], [13, -1.5, S[3]], [10, -3, S[4]], [5, -6, S[5]]] as const) { c.fillStyle = col; c.beginPath(); c.arc(x + dx, y - 90 + dx, r, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = INK; c.beginPath(); c.ellipse(x + 2, y - 90, 12, 10, 0, 0, Math.PI * 2); c.fill();
  c.save(); c.beginPath(); c.ellipse(x + 2, y - 90, 11, 9, 0, 0, Math.PI * 2); c.clip();
  for (const [yy, col] of [[-99, '#F6E05E'], [-95, '#E0B634'], [-91, '#B7791F'], [-87, '#8A5A12'], [-84, '#5E3C0A']] as const) box(c, x - 10, y + yy, 24, 5, col);
  checker(c, x - 10, y - 92, 24, 2, '#B7791F', 0);
  c.restore();
  box(c, x - 4, y - 96, 5, 2, '#FFFBEB');
  const g = (f % 240) / 240;
  if (g < 0.2) { c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fillRect(x - 8 + g * 80, y - 98, 2, 12); }
};

// ---------------------------------------------------------------------------------------------------------------
// The big window at the end (live: it cracks, it goes; after, the emergency seal)

/** The glass wall at the deck's end: whole (cracking from `hit` by `crack` 0..1), gone (jagged at the frames), or
 *  sealed (the emergency shutter down over it, an airlock door in it). */
export const drawEndGlass = (c: Ctx, state: GameState, mode: 'whole' | 'gone' | 'sealed', crack: number, hitY: number) => {
  const x = D1, top = WIN_TOP - 12, bot = GY;
  if (mode === 'sealed') {
    // (the shutter: steel, hazard-striped, filling the big slot's glass; and the end; the airlock in it)
    const L = D1 - SLOT + 12;
    bands(c, L, top, D1 + 20 - L, bot - top, [CHROME[3], CHROME[2], CHROME[2], CHROME[1]]);
    for (let y = top + 40; y < bot; y += 60) box(c, L, y, D1 + 20 - L, 2, INK);
    for (let xx = L; xx < D1 + 20; xx += 24) { c.fillStyle = '#EAB308'; c.beginPath(); c.moveTo(xx, top + 24); c.lineTo(xx + 12, top); c.lineTo(xx + 24, top); c.lineTo(xx + 12, top + 24); c.fill(); }
    rr(c, D1 - 120, GY - 170, 90, 170, 10); c.fillStyle = INK; c.fill();
    rr(c, D1 - 118, GY - 168, 86, 168, 9); c.fillStyle = CHROME[4]; c.fill();
    c.fillStyle = INK; c.beginPath(); c.arc(D1 - 75, GY - 120, 18, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0B1026'; c.beginPath(); c.arc(D1 - 75, GY - 120, 15, 0, Math.PI * 2); c.fill();
    box(c, D1 - 84, GY - 128, 4, 4, '#F8FAFC');
    words(c, 'AIRLOCK', D1 - 75, GY - 182, '#EAB308', 8);
    words(c, 'EMERGENCY SEAL', D1 - 160, top + 50, INK, 7, '#EAB308');
    return;
  }
  // the frame top and bottom, either way
  bands(c, x - 6, top - 6, 30, 12, [CHROME[5], CHROME[3], CHROME[1]]);
  bands(c, x - 6, bot - 16, 30, 16, [CHROME[5], CHROME[3], CHROME[1]]);
  if (mode === 'gone') {
    c.fillStyle = 'rgba(165, 243, 252, 0.5)';
    for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x, top + 6); c.lineTo(x + 18, top + 6); c.lineTo(x + 8, top + 18 + ((k * 13) % 30)); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(x, bot - 16); c.lineTo(x + 18, bot - 16); c.lineTo(x + 6, bot - 40); c.closePath(); c.fill();
    return;
  }
  // the glass: a thick slab of it, seen from the side, cyan, the light down its face; the sign on it
  c.fillStyle = 'rgba(103, 232, 249, 0.22)'; c.fillRect(x, top + 6, 18, bot - 16 - top - 6);
  c.fillStyle = 'rgba(255, 255, 255, 0.35)'; c.fillRect(x + 2, top + 6, 3, bot - 22 - top);
  c.fillStyle = 'rgba(14, 116, 144, 0.5)'; c.fillRect(x + 15, top + 6, 3, bot - 22 - top);
  // (the sign stuck on it, at eye level: a decal)
  c.save(); c.translate(x + 9, GY - 120); c.rotate(-Math.PI / 2);
  words(c, 'DO NOT LEAN ON GLASS', 0, 3, '#F8FAFC', 6, '#0E7490');
  c.restore();
  // (the cracks: out from where he hit it, a spiderweb)
  if (crack > 0) {
    c.strokeStyle = 'rgba(255, 255, 255, 0.9)'; c.lineWidth = 1;
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + 0.3, len = (30 + ((k * 37) % 60)) * crack * 2.2;
      c.beginPath(); c.moveTo(x + 9, hitY);
      let px = x + 9, py = hitY;
      for (let s = 1; s <= 4; s++) { px = x + 9 + Math.cos(a) * 9 * (s / 4) * Math.min(1, crack * 2); py = hitY + Math.sin(a) * len * (s / 4) + ((s * k) % 3 - 1) * 4; c.lineTo(px, py); }
      c.stroke();
    }
    c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fillRect(x + 4, hitY - 4, 10, 8);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The lobby, and the lift car

/** The ticket hall at the needle's foot: a 1960s space-age lobby gone a bit tired. From the top: the coffered ceiling and
 *  its recessed lights, the clerestory (the sky through it), the cream upper wall papered in boomerangs, the chrome and
 *  orange stripes, the fluted teal wainscot, the terrazzo floor (an atomic starburst inlaid in it). The exit at the
 *  left, the ticket booth, the marquee, the posters, the queue's ropes, the lift. */
const paintLobby = (c: Ctx) => {
  const L = LOBBY0, R = LOBBY1 + 40, w = R - L;
  // the ceiling: dark coffers, chrome ribs, round recessed lights glowing down
  bands(c, L, GY - 760, w, 270, [CHROME[0], '#141C28', CHROME[1], '#202C3C', CHROME[1]]);
  for (let x = L + 30; x < R; x += 120) {
    rr(c, x, GY - 620, 100, 112, 6); c.fillStyle = INK; c.fill();
    rr(c, x + 2, GY - 618, 96, 108, 5); c.fillStyle = '#18202E'; c.fill();
    box(c, x + 2, GY - 618, 96, 4, CHROME[2]); box(c, x + 2, GY - 618, 4, 108, CHROME[2]);
    // (its lamp: a chrome can, the bulb's glow in steps)
    c.fillStyle = INK; c.beginPath(); c.ellipse(x + 50, GY - 530, 20, 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FDE68A'; c.beginPath(); c.ellipse(x + 50, GY - 530, 17, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFBEB'; c.beginPath(); c.ellipse(x + 48, GY - 531, 9, 2.5, 0, 0, Math.PI * 2); c.fill();
  }
  // (the fascia over the clerestory: chrome, lit along its bottom edge)
  bands(c, L, GY - 496, w, 16, [CHROME[2], CHROME[3], CHROME[4], CHROME[5]]);
  box(c, L, GY - 482, w, 2, CHROME[6]); box(c, L, GY - 480, w, 1, INK);
  // the clerestory: the sky through it (the backdrop), its chrome mullions; the sill under it (dimmed: out of reach)
  for (let x = L + 140; x < R; x += 90) column(c, x, GY - 480, 10, 118);
  box(c, L, GY - 364, w, 8, dimc(CHROME[4])); box(c, L, GY - 364, w, 2, dimc(CHROME[6])); box(c, L, GY - 356, w, 1, INK);
  // the upper wall: cream, papered in a faint pattern of boomerangs and four-point stars, darker toward its foot
  bands(c, L, GY - 355, w, 159, [CREAM[3], CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
  c.fillStyle = tilePattern(c, 'n2-boomerang', 64, 48, g => {
    g.fillStyle = 'rgba(122, 104, 70, 0.22)';
    g.beginPath(); g.moveTo(6, 30); g.quadraticCurveTo(16, 14, 28, 22); g.quadraticCurveTo(18, 22, 10, 34); g.closePath(); g.fill();
    g.fillStyle = 'rgba(210, 85, 26, 0.18)';
    for (const [sx, sy, sr] of [[46, 12, 5], [40, 38, 3]] as const) { g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, d = k % 2 ? sr * 0.3 : sr; g.lineTo(sx + Math.cos(a) * d, sy + Math.sin(a) * d); } g.closePath(); g.fill(); }
  });
  c.fillRect(L, GY - 355, w, 159);
  // (the chrome stripe, the orange pinstripe)
  bands(c, L, GY - 196, w, 6, [CHROME[6], CHROME[4]]); box(c, L, GY - 190, w, 3, ORANGE[3]); box(c, L, GY - 187, w, 1, ORANGE[1]);
  // the wainscot: fluted teal panels, each rib lit down its left, shaded down its right; the kick plate
  bands(c, L, GY - 186, w, 174, [TEAL[3], TEAL[3], TEAL[2], TEAL[2], TEAL[1]]);
  for (let x = L + 4; x < R; x += 16) { box(c, x, GY - 180, 2, 166, TEAL[4]); box(c, x + 11, GY - 180, 2, 166, TEAL[1]); box(c, x + 13, GY - 180, 1, 166, INK); }
  bands(c, L, GY - 14, w, 14, [CHROME[4], CHROME[3], CHROME[2], CHROME[1]]);
  ceilingAndFloorLobby(c, L, R);
  // the doorway out (left): open, the light from outside; its chrome jamb, the EXIT box over it
  c.save(); c.globalCompositeOperation = 'destination-out'; box(c, L, GY - 220, 90, 220, '#000'); c.restore();
  column(c, L + 90, GY - 230, 14, 230);
  box(c, L, GY - 232, 104, 12, INK); bands(c, L, GY - 231, 103, 10, [CHROME[5], CHROME[4], CHROME[3]]);
  rr(c, L + 18, GY - 262, 56, 22, 3); c.fillStyle = INK; c.fill();
  rr(c, L + 20, GY - 260, 52, 18, 2); c.fillStyle = '#3B0A0A'; c.fill();
  words(c, 'EXIT', L + 46, GY - 247, '#F87171', 8, '#1A0505');
  // the marquee: the name, what it is, inside a ring of bulbs
  const mx = L + 360, my = GY - 340, mw = 380, mh = 120;
  rr(c, mx - 6, my - 6, mw + 12, mh + 12, 12); c.fillStyle = INK; c.fill();
  rr(c, mx - 4, my - 4, mw + 8, mh + 8, 11); c.fillStyle = CHROME[4]; c.fill();
  rr(c, mx - 4, my - 4, mw + 8, (mh + 8) / 2, 11); c.fillStyle = CHROME[5]; c.fill();
  rr(c, mx + 4, my + 4, mw - 8, mh - 8, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, mx + 5, my + 5, mw - 10, mh - 10, 5); c.clip(); bands(c, mx + 5, my + 5, mw - 10, mh - 10, [TEAL[2], TEAL[1], TEAL[1], TEAL[0]]); c.restore();
  for (let k = 0; k < 24; k++) { const bx = mx + 6 + k * ((mw - 12) / 23); for (const by of [my, my + mh]) { box(c, bx - 2, by - 2, 4, 4, '#FDE68A'); box(c, bx - 1, by - 2, 2, 1, '#FFFFFF'); } }
  for (let k = 1; k < 6; k++) { const by = my + k * (mh / 6); for (const bx of [mx, mx + mw]) { box(c, bx - 2, by - 2, 4, 4, '#FDE68A'); box(c, bx - 1, by - 2, 2, 1, '#FFFFFF'); } }
  burst(c, mx + 40, my + 40, 26, ORANGE[3]); burst(c, mx + 40, my + 40, 12, ORANGE[5]); burst(c, mx + 40, my + 40, 4, '#FFFFFF');
  words(c, 'SPACE NEEDLE 2', mx + 210, my + 40, '#F8FAFC', 14, INK);
  words(c, 'THE ONLY OBSERVATION DECK', mx + 210, my + 70, CREAM[4], 7);
  words(c, 'IN ACTUAL OUTER SPACE', mx + 210, my + 84, CREAM[4], 7);
  words(c, '541 TIMES TALLER THAN THE ORIGINAL', mx + 210, my + 106, ORANGE[4], 6);
  // the ticket booth: round, chrome-capped, a boomerang sign on it, nobody in it
  const bx = L + 240;
  rr(c, bx - 61, GY - 151, 122, 151, 31); c.fillStyle = INK; c.fill();
  c.save(); rr(c, bx - 59, GY - 149, 118, 149, 29); c.clip();
  vbands(c, bx - 59, GY - 149, 118, 149, [TEAL[5], TEAL[6], TEAL[5], TEAL[4], TEAL[4], TEAL[3], TEAL[2]]);
  bands(c, bx - 59, GY - 149, 118, 12, [CHROME[6], CHROME[4]]);
  box(c, bx - 59, GY - 30, 118, 4, ORANGE[3]); box(c, bx - 59, GY - 26, 118, 26, TEAL[2]);
  c.restore();
  rr(c, bx - 41, GY - 127, 82, 52, 6); c.fillStyle = INK; c.fill();
  c.save(); rr(c, bx - 40, GY - 126, 80, 50, 6); c.clip(); bands(c, bx - 40, GY - 126, 80, 50, ['#1E2A44', '#16203A', '#101830', '#0B1220']);
  c.fillStyle = 'rgba(255, 255, 255, 0.12)'; c.beginPath(); c.moveTo(bx - 34, GY - 126); c.lineTo(bx - 18, GY - 126); c.lineTo(bx - 40, GY - 86); c.lineTo(bx - 40, GY - 110); c.closePath(); c.fill(); c.restore();
  box(c, bx - 44, GY - 76, 88, 5, CHROME[5]); box(c, bx - 44, GY - 71, 88, 1, INK);
  rr(c, bx - 31, GY - 69, 62, 18, 2); c.fillStyle = INK; c.fill();
  rr(c, bx - 30, GY - 68, 60, 16, 2); c.fillStyle = CREAM[4]; c.fill();
  words(c, 'BACK IN 5', bx, GY - 57, '#7F1D1D', 6, CREAM[4]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(bx - 60, GY - 156); c.quadraticCurveTo(bx, GY - 196, bx + 66, GY - 172); c.lineTo(bx + 60, GY - 156); c.quadraticCurveTo(bx, GY - 176, bx - 56, GY - 150); c.closePath(); c.fill();
  c.fillStyle = ORANGE[3]; c.beginPath(); c.moveTo(bx - 56, GY - 157); c.quadraticCurveTo(bx, GY - 193, bx + 62, GY - 171); c.lineTo(bx + 57, GY - 158); c.quadraticCurveTo(bx, GY - 178, bx - 53, GY - 153); c.closePath(); c.fill();
  rr(c, bx - 38, GY - 196, 76, 20, 3); c.fillStyle = INK; c.fill();
  rr(c, bx - 37, GY - 195, 74, 18, 3); c.fillStyle = TEAL[1]; c.fill();
  words(c, 'TICKETS', bx, GY - 182, ORANGE[4], 8);
  // the poster: the needle, a lot of reassurance
  poster(c, L + 415, GY - 176, 112, 104, [['NOW 40%', '#FDE68A'], ['LESS', '#FDE68A'], ['DECOM-', '#F8FAFC'], ['PRESSION', '#F8FAFC']]);
  // the height sign by the lift: a rocket on a stick, its hand out at the mark
  heightSign(c, L + 805);
  // the lift's portal at the far end
  c.save(); c.translate(LIFT_X, 0); paintLiftPortal(c); c.restore();
  // stanchions and the rope (an empty queue): dimmed, chrome posts, a velvet rope sagging between
  for (let k = 0; k < 4; k++) {
    const x = L + 500 + k * 80;
    box(c, x - 13, GY - 4, 26, 4, dimc(CHROME[3])); box(c, x - 13, GY - 4, 26, 1, dimc(CHROME[5]));
    box(c, x - 3, GY - 44, 6, 40, INK); box(c, x - 2, GY - 44, 2, 40, dimc(CHROME[6])); box(c, x, GY - 44, 2, 40, dimc(CHROME[3]));
    c.fillStyle = INK; c.beginPath(); c.arc(x, GY - 47, 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = dimc(CHROME[5]); c.beginPath(); c.arc(x, GY - 47, 4, 0, Math.PI * 2); c.fill();
    if (k < 3) {
      c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(x, GY - 42); c.quadraticCurveTo(x + 40, GY - 28, x + 80, GY - 42); c.stroke();
      c.strokeStyle = dimc('#B91C1C'); c.lineWidth = 3; c.beginPath(); c.moveTo(x, GY - 42); c.quadraticCurveTo(x + 40, GY - 28, x + 80, GY - 42); c.stroke();
      c.strokeStyle = dimc('#F87171'); c.lineWidth = 1; c.beginPath(); c.moveTo(x, GY - 43); c.quadraticCurveTo(x + 40, GY - 29, x + 80, GY - 43); c.stroke();
    }
  }
};
/** A framed poster on the wall (its middle at x, its top at y): a chrome frame, a banded night-blue field, the needle
 *  on it going up into a starburst, the words under. */
const poster = (c: Ctx, x: number, y: number, w: number, h: number, lines: [string, string][]) => {
  const L = x - w / 2;
  rr(c, L - 3, y - 3, w + 6, h + 6, 3); c.fillStyle = INK; c.fill();
  bands(c, L - 2, y - 2, w + 4, h + 4, [CHROME[5], CHROME[4], CHROME[3]]);
  bands(c, L + 3, y + 3, w - 6, h - 6, ['#1A1F52', '#232C6E', '#2D3A86', '#3A4A9A']);
  burst(c, x, y + 14, 10, ORANGE[4]); burst(c, x, y + 14, 4, '#FFFFFF');
  box(c, x - 1, y + 18, 2, 22, CHROME[5]); c.fillStyle = TEAL[4]; c.beginPath(); c.ellipse(x, y + 26, 10, 3, 0, 0, Math.PI * 2); c.fill();
  lines.forEach(([s, col], i) => words(c, s, x, y + 52 + i * 12, col, 6));
};
/** "YOU MUST BE THIS TALL TO GO TO SPACE": a board, a rocket on a stick at the mark, its little hand out. */
const heightSign = (c: Ctx, x: number) => {
  rr(c, x - 47, GY - 182, 94, 60, 4); c.fillStyle = INK; c.fill();
  rr(c, x - 46, GY - 181, 92, 58, 3); c.fillStyle = CREAM[4]; c.fill();
  box(c, x - 46, GY - 181, 92, 3, '#FFFFFF'); box(c, x - 46, GY - 126, 92, 3, CREAM[1]);
  words(c, 'YOU MUST BE', x, GY - 167, TEAL[1], 6, CREAM[4]);
  words(c, 'THIS TALL', x, GY - 155, TEAL[1], 6, CREAM[4]);
  words(c, 'TO GO TO', x, GY - 143, TEAL[1], 6, CREAM[4]);
  words(c, 'SPACE', x, GY - 131, ORANGE[1], 6, CREAM[4]);
  // (the stick: ruled, under the board; the rocket at the top of it with its hand out over the mark)
  box(c, x - 4, GY - 118, 8, 118, INK); box(c, x - 3, GY - 118, 3, 118, CREAM[4]); box(c, x, GY - 118, 3, 118, CREAM[2]);
  for (let y = GY - 112; y < GY; y += 8) box(c, x - 3, y, (y / 8) % 2 ? 3 : 5, 1, WALNUT[2]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(x + 6, GY - 92); c.lineTo(x + 30, GY - 92); c.lineTo(x + 30, GY - 88); c.lineTo(x + 6, GY - 88); c.fill();
  box(c, x + 7, GY - 91, 22, 2, ORANGE[3]);
  box(c, x + 28, GY - 94, 4, 8, CREAM[4]);
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
  burst(c, 0, 0, 120, INK); burst(c, 0, 0, 116, ORANGE[2]); burst(c, 0, 0, 80, TEAL[3]); burst(c, 0, 0, 44, ORANGE[4]);
  c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill(); c.fillStyle = CHROME[4]; c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill();
  c.restore();
  // the ceiling's top edge
  bands(c, L, GY - 760, w, 120, [CHROME[0], CHROME[1], CHROME[1], CHROME[2]]);
};
/** The lift's doors in the lobby (centered on 0): the portal, the doors, its sign, the call button. */
const paintLiftPortal = (c: Ctx) => {
  rr(c, -70, GY - 210, 140, 210, 10); c.fillStyle = INK; c.fill();
  c.save(); rr(c, -68, GY - 208, 136, 208, 9); c.clip();
  vbands(c, -68, GY - 208, 136, 208, [CHROME[5], CHROME[6], CHROME[5], CHROME[4], CHROME[4], CHROME[3], CHROME[2]]);
  bands(c, -68, GY - 208, 136, 40, [CHROME[6], CHROME[5], CHROME[5], CHROME[4]]);
  c.restore();
  box(c, -55, GY - 171, 110, 171, INK);
  vbands(c, -54, GY - 170, 54, 170, [CHROME[4], CHROME[5], CHROME[4], CHROME[3]]);
  vbands(c, 0, GY - 170, 54, 170, [CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
  box(c, -1, GY - 170, 2, 170, INK);
  // (the doors' etched starbursts)
  for (const s of [-1, 1]) { burst(c, s * 27, GY - 100, 12, s < 0 ? CHROME[6] : CHROME[4]); burst(c, s * 27, GY - 100, 5, CHROME[2]); }
  burst(c, 0, GY - 232, 26, INK); burst(c, 0, GY - 232, 24, ORANGE[3]); burst(c, 0, GY - 232, 12, ORANGE[5]); burst(c, 0, GY - 232, 5, '#FFFFFF');
  words(c, 'LIFT TO SPACE', 0, GY - 180, CHROME[1], 7, CHROME[6]);
  box(c, 79, GY - 121, 16, 24, INK); box(c, 80, GY - 120, 14, 22, CHROME[2]); box(c, 83, GY - 116, 8, 8, ORANGE[4]); box(c, 84, GY - 116, 3, 2, '#FFFFFF');
  words(c, '62 MILES', 0, GY - 262, ORANGE[4], 7);
};
export const drawLobby = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, w: 800 };
  if (v.x > LOBBY1 + 60 || v.x + v.w < LOBBY0 - 40) return;
  stamp(c, 'n2-lobby', LOBBY0, GY - 760, LOBBY1 + 40 - LOBBY0, 967, paintLobby);
  // (the floor in perspective, from where the camera's looking: the joints and the inlay fan out toward him)
  bendFloor(c, { x: state.camera.x + CANVAS_WIDTH / 2 }, GY + 3, GY + 3, GY + 207, LOBBY0, LOBBY1 + 40);
};

/** The lift car going up (centered on CAR_X): its floor and roof slabs, its chrome ribs, the guide rails outside it,
 *  the altitude readout on its rib (`alt`: what it says), the speaker. The glass is the view (sky.ts). */
export const drawCar = (c: Ctx, state: GameState, alt: string) => {
  const v = state.view ?? { x: state.camera.x, w: 800 };
  if (v.x > CAR1 + 400 || v.x + v.w < CAR0 - 400) return;
  stamp(c, 'n2-car', CAR0 - 120, GY - 700, CAR1 - CAR0 + 240, 900, paintCar);
  // the readout (live)
  rr(c, CAR0 + 22, GY - 150, 92, 40, 3); c.fillStyle = INK; c.fill();
  box(c, CAR0 + 25, GY - 147, 86, 34, '#120A02');
  words(c, 'ALTITUDE', CAR0 + 68, GY - 134, '#B45309', 6, '#120A02');
  words(c, alt, CAR0 + 68, GY - 118, '#FBBF24', 7, '#120A02');
};
const paintCar = (c: Ctx) => {
  // the guide rails, up and down out of sight
  for (const x of [CAR0 - 70, CAR1 + 54]) { vbands(c, x, GY - 700, 16, 900, [CHROME[4], CHROME[5], CHROME[3], CHROME[2]]); box(c, x - 1, GY - 700, 1, 900, INK); box(c, x + 16, GY - 700, 1, 900, INK); }
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
  c.fillStyle = INK; c.beginPath(); c.arc(CAR_X, GY - 279, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#EF4444'; c.beginPath(); c.arc(CAR_X, GY - 279, 4, 0, Math.PI * 2); c.fill(); box(c, CAR_X - 2, GY - 282, 2, 2, '#FECACA');
  bands(c, CAR0 - 6, GY - 218, CAR1 - CAR0 + 12, 22, [CHROME[6], CHROME[5], CHROME[4], CHROME[3], CHROME[1]]);
  box(c, CAR0 - 6, GY - 218, CAR1 - CAR0 + 12, 1, INK); box(c, CAR0 - 6, GY - 196, CAR1 - CAR0 + 12, 1, INK);
  box(c, CAR_X - 26, GY - 196, 52, 6, INK); box(c, CAR_X - 24, GY - 196, 48, 4, '#FDE68A'); box(c, CAR_X - 20, GY - 196, 24, 2, '#FFFBEB');
  rr(c, CAR_X + 60, GY - 194, 24, 8, 3); c.fillStyle = CHROME[2]; c.fill();
  // the floor slab: its lit lip, banded chrome and an orange band, the underside tapering in teal steps to its clamp
  box(c, CAR0 - 6, GY, CAR1 - CAR0 + 12, 3, '#F8FAFC');
  bands(c, CAR0 - 6, GY + 3, CAR1 - CAR0 + 12, 26, [CHROME[5], CHROME[4], CHROME[3], ORANGE[3], CHROME[1]]);
  box(c, CAR0 - 6, GY + 18, CAR1 - CAR0 + 12, 1, ORANGE[5]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(CAR0 - 6, GY + 29); c.lineTo(CAR1 + 6, GY + 29); c.lineTo(CAR_X + 50, GY + 90); c.lineTo(CAR_X - 50, GY + 90); c.closePath(); c.fill();
  c.save(); c.beginPath(); c.moveTo(CAR0 - 3, GY + 30); c.lineTo(CAR1 + 3, GY + 30); c.lineTo(CAR_X + 48, GY + 88); c.lineTo(CAR_X - 48, GY + 88); c.closePath(); c.clip();
  vbands(c, CAR0 - 3, GY + 30, CAR1 - CAR0 + 6, 58, [TEAL[4], TEAL[3], TEAL[3], TEAL[2], TEAL[2], TEAL[1], TEAL[1], TEAL[0]]);
  bands(c, CAR0 - 3, GY + 30, CAR1 - CAR0 + 6, 58, ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(3, 18, 22, 0.25)', 'rgba(3, 18, 22, 0.45)']);
  c.restore();
  // (the underside's emblem: the needle in a starburst)
  burst(c, CAR_X, GY + 52, 14, ORANGE[3]); burst(c, CAR_X, GY + 52, 6, ORANGE[5]);
  box(c, CAR_X - 31, GY + 88, 62, 12, INK); bands(c, CAR_X - 30, GY + 88, 60, 10, [CHROME[5], CHROME[3], CHROME[2]]);
  // the clamps out to the rails
  for (const [x0, x1] of [[CAR0 - 54, CAR0 - 6], [CAR1 + 6, CAR1 + 54]]) { bands(c, x0, GY - 40, x1 - x0, 14, [CHROME[5], CHROME[3], CHROME[1]]); bands(c, x0, GY - 200, x1 - x0, 14, [CHROME[5], CHROME[3], CHROME[1]]); }
  // the ribs, the glass's frame, the handrail (dimmed)
  column(c, CAR0 - 6, GY - 200, 16, 200); column(c, CAR1 - 10, GY - 200, 16, 200);
  box(c, CAR0 + 10, GY - 70, CAR1 - CAR0 - 20, 4, dimc(CHROME[5]));
  // the glass's glare
  glare(c, CAR0 + 10, GY - 196, CAR1 - CAR0 - 20, 196);
};

/** A lift's doors opening (over its stamped shut ones), at x, its gap `hw` either side of the middle and `h` tall, `o`
 *  how far open (0..1): the lit car inside, the two doors drawn back into the frame. */
export const drawLiftDoors = (c: Ctx, x: number, hw: number, h: number, o: number) => {
  if (o <= 0) return;
  // the car inside: cream, lit from its ceiling, a handrail, the floor's lit lip
  bands(c, x - hw, GY - h, hw * 2, h, [CREAM[4], CREAM[3], CREAM[3], CREAM[2], CREAM[1]]);
  box(c, x - hw, GY - h, hw * 2, 3, '#FFFBEB');
  box(c, x - hw, GY - 66, hw * 2, 3, dimc(CHROME[5]));
  box(c, x - hw, GY - 3, hw * 2, 3, CHROME[5]);
  // the doors, slid back
  const w = hw * (1 - o);
  if (w > 0.5) {
    vbands(c, x - hw, GY - h, w, h, [CHROME[4], CHROME[5], CHROME[4], CHROME[3]]);
    vbands(c, x + hw - w, GY - h, w, h, [CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
    box(c, x - hw + w - 1, GY - h, 1, h, INK); box(c, x + hw - w, GY - h, 1, h, INK);
  }
};
