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
import { stamp, checker, mix, type Ctx } from '../../intro/art/kit';
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
};
/** Banded left to right (a column lit from the left). */
const vbands = (c: Ctx, x: number, y: number, w: number, h: number, cols: string[]) => {
  const n = cols.length, bw = w / n;
  for (let i = 0; i < n; i++) box(c, x + i * bw, y, Math.ceil(bw) + 1, h, cols[i]);
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
    words(c, 'THE REAL THING', 0, WIN_TOP - 36, ORANGE[5], 7);
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
  rr(c, x - 50, GY - 46, 100, 46, 3); c.fillStyle = INK; c.fill();
  bands(c, x - 49, GY - 45, 98, 45, [TEAL[5], TEAL[4], TEAL[3], TEAL[3], TEAL[2]]);
  box(c, x - 49, GY - 45, 98, 2, TEAL[6]);
  rr(c, x - 44, GY - 38, 88, 30, 2); c.fillStyle = '#B88A2E'; c.fill(); box(c, x - 44, GY - 38, 88, 2, '#E7C463');
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
    c.fillStyle = 'rgba(165, 243, 252, 0.12)'; c.fillRect(gx, gy, gw, gh);
    c.strokeStyle = '#CFFAFE'; c.lineWidth = 2; c.strokeRect(gx, gy, gw, gh);
    c.fillStyle = 'rgba(255, 255, 255, 0.22)'; c.beginPath(); c.moveTo(gx + 8, gy); c.lineTo(gx + 28, gy); c.lineTo(gx + 8, gy + 50); c.lineTo(gx, gy + 50); c.closePath(); c.fill();
    box(c, gx - 2, gy - 6, gw + 4, 6, CHROME[4]); box(c, gx - 2, gy - 6, gw + 4, 2, CHROME[6]);
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
  const W1 = '#F1F5F9', W2 = '#CBD5E1', W3 = '#94A3B8';
  c.strokeStyle = INK; c.lineWidth = 1;
  // the pack behind
  rr(c, x - 18, y - 76, 36, 40, 4); c.fillStyle = W3; c.fill(); c.stroke();
  // legs, boots
  for (const s of [-1, 1]) {
    rr(c, x + s * 7 - 6, y - 36, 12, 32, 4); c.fillStyle = W1; c.fill(); c.stroke();
    box(c, x + s * 7 - 6, y - 20, 12, 2, W3);
    rr(c, x + s * 7 - 8, y - 6, 16, 6, 2); c.fillStyle = W3; c.fill(); c.stroke();
  }
  // the body, its panel, the patch
  rr(c, x - 15, y - 72, 30, 40, 7); c.fillStyle = W1; c.fill(); c.stroke();
  box(c, x - 15, y - 72, 7, 40, '#FFFFFF');
  rr(c, x - 7, y - 60, 14, 10, 2); c.fillStyle = W2; c.fill(); c.stroke();
  box(c, x - 5, y - 58, 3, 3, '#DC2626'); box(c, x + 1, y - 58, 3, 3, '#2563EB'); box(c, x - 2, y - 54, 4, 2, '#16A34A');
  box(c, x + 6, y - 68, 6, 6, ORANGE[3]);
  // arms, gloves
  for (const s of [-1, 1]) {
    rr(c, x + s * 19 - 5, y - 70, 10, 30, 4); c.fillStyle = W1; c.fill(); c.stroke();
    box(c, x + s * 19 - 5, y - 54, 10, 2, W3);
    rr(c, x + s * 19 - 5, y - 42, 10, 8, 3); c.fillStyle = W3; c.fill(); c.stroke();
  }
  // the helmet: the neck ring, the shell, the gold visor (a glint going across it)
  box(c, x - 11, y - 76, 22, 5, W3);
  c.fillStyle = W1; c.beginPath(); c.arc(x, y - 90, 15, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#B7791F'; c.beginPath(); c.ellipse(x + 2, y - 90, 11, 9, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#F6E05E'; c.beginPath(); c.ellipse(x - 1, y - 93, 6, 3.5, -0.3, 0, Math.PI * 2); c.fill();
  const g = (f % 240) / 240;
  if (g < 0.2) { c.fillStyle = 'rgba(255, 255, 255, 0.8)'; c.fillRect(x - 8 + g * 80, y - 96, 2, 10); }
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

/** The ticket hall at the needle's foot. */
const paintLobby = (c: Ctx) => {
  const L = LOBBY0, R = LOBBY1 + 40, w = R - L;
  // the high window band (the sky through it: the backdrop), its mullions
  bands(c, L, GY - 640, w, 160, [CHROME[1], CHROME[2], CHROME[2], CHROME[1]]);
  for (let x = L + 140; x < R; x += 90) column(c, x, GY - 480, 10, 120);
  box(c, L, GY - 364, w, 8, CHROME[4]); box(c, L, GY - 364, w, 2, CHROME[6]);
  // the wall: cream above, teal below, a chrome stripe, the orange pinstripe
  bands(c, L, GY - 356, w, 160, [CREAM[3], CREAM[3], CREAM[2], CREAM[2]]);
  box(c, L, GY - 196, w, 6, CHROME[5]); box(c, L, GY - 190, w, 3, ORANGE[3]);
  bands(c, L, GY - 187, w, 175, [TEAL[3], TEAL[3], TEAL[2], TEAL[2], TEAL[1]]);
  bands(c, L, GY - 12, w, 12, [CHROME[3], CHROME[2], CHROME[1]]);
  ceilingAndFloorLobby(c, L, R);
  // the doorway out (left): open, the light from outside
  c.save(); c.globalCompositeOperation = 'destination-out'; box(c, L, GY - 220, 90, 220, '#000'); c.restore();
  column(c, L + 90, GY - 230, 14, 230);
  words(c, 'EXIT', L + 46, GY - 236, ORANGE[4], 8);
  // the banner: the name, what it is
  rr(c, L + 360, GY - 340, 380, 120, 8); c.fillStyle = INK; c.fill();
  rr(c, L + 362, GY - 338, 376, 116, 7); c.fillStyle = TEAL[1]; c.fill();
  burst(c, L + 400, GY - 300, 26, ORANGE[3]); burst(c, L + 400, GY - 300, 12, ORANGE[5]);
  words(c, 'SPACE NEEDLE 2', L + 570, GY - 300, '#F8FAFC', 14, INK);
  words(c, 'THE ONLY OBSERVATION DECK', L + 570, GY - 270, CREAM[4], 7);
  words(c, 'IN ACTUAL OUTER SPACE', L + 570, GY - 256, CREAM[4], 7);
  words(c, '541 TIMES TALLER THAN THE ORIGINAL', L + 570, GY - 234, ORANGE[4], 6);
  // the ticket booth: round, chrome-topped, nobody in it
  const bx = L + 240;
  rr(c, bx - 60, GY - 150, 120, 150, 30); c.fillStyle = INK; c.fill();
  rr(c, bx - 58, GY - 148, 116, 148, 28); c.fillStyle = TEAL[4]; c.fill();
  box(c, bx - 58, GY - 148, 116, 10, CHROME[5]);
  rr(c, bx - 40, GY - 126, 80, 50, 6); c.fillStyle = '#0B1220'; c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.1)'; c.fillRect(bx - 36, GY - 122, 20, 42);
  words(c, 'TICKETS', bx, GY - 160, ORANGE[4], 8);
  rr(c, bx - 30, GY - 70, 60, 16, 2); c.fillStyle = CREAM[4]; c.fill();
  words(c, 'BACK IN 5', bx, GY - 58, '#7F1D1D', 6, CREAM[4]);
  // the lift's portal at the far end
  c.save(); c.translate(LIFT_X, 0); paintLiftPortal(c); c.restore();
  // stanchions and the rope (an empty queue): dimmed
  for (let k = 0; k < 4; k++) {
    const x = L + 500 + k * 80;
    box(c, x - 2, GY - 44, 4, 44, dimc(CHROME[5])); c.fillStyle = dimc(CHROME[5]); c.beginPath(); c.arc(x, GY - 46, 4, 0, Math.PI * 2); c.fill();
    if (k < 3) { c.strokeStyle = dimc('#B91C1C'); c.lineWidth = 3; c.beginPath(); c.moveTo(x, GY - 42); c.quadraticCurveTo(x + 40, GY - 28, x + 80, GY - 42); c.stroke(); }
  }
};
const ceilingAndFloorLobby = (c: Ctx, L: number, R: number) => {
  const w = R - L;
  box(c, L, GY, w, 3, '#F8FAFC'); bands(c, L, GY + 3, w, 24, [CREAM[3], CREAM[2], CREAM[2], CREAM[1]]);
  for (let x = L; x < R; x += 7) { const k = (x * 13) % 17; box(c, x + (k % 5), GY + 8 + (k % 14), 2, 1, k % 3 ? ORANGE[3] : TEAL[4]); }
  bands(c, L, GY + 27, w, 180, [CHROME[2], TEAL[2], TEAL[1], TEAL[0], '#03161B']);
  bands(c, L, GY - 760, w, 120, [CHROME[0], CHROME[1], CHROME[1], CHROME[2]]);
};
/** The lift's doors in the lobby (centered on 0): the portal, the doors, its sign, the call button. */
const paintLiftPortal = (c: Ctx) => {
  rr(c, -70, GY - 210, 140, 210, 10); c.fillStyle = INK; c.fill();
  rr(c, -68, GY - 208, 136, 208, 9); c.fillStyle = CHROME[4]; c.fill();
  rr(c, -68, GY - 208, 136, 44, 9); c.fillStyle = CHROME[5]; c.fill();
  vbands(c, -54, GY - 170, 54, 170, [CHROME[4], CHROME[5], CHROME[4], CHROME[3]]);
  vbands(c, 0, GY - 170, 54, 170, [CHROME[4], CHROME[3], CHROME[3], CHROME[2]]);
  box(c, -1, GY - 170, 2, 170, INK);
  burst(c, 0, GY - 232, 24, ORANGE[3]); burst(c, 0, GY - 232, 12, ORANGE[5]); burst(c, 0, GY - 232, 5, '#FFFFFF');
  words(c, 'LIFT TO SPACE', 0, GY - 180, CHROME[1], 7, CHROME[6]);
  box(c, 80, GY - 120, 14, 22, CHROME[1]); box(c, 83, GY - 116, 8, 8, ORANGE[4]);
  words(c, '62 MILES', 0, GY - 262, ORANGE[4], 7);
};
export const drawLobby = (c: Ctx, state: GameState) => {
  const v = state.view ?? { x: state.camera.x, w: 800 };
  if (v.x > LOBBY1 + 60 || v.x + v.w < LOBBY0 - 40) return;
  stamp(c, 'n2-lobby', LOBBY0, GY - 760, LOBBY1 + 40 - LOBBY0, 967, paintLobby);
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
  // the roof: a dome, a lamp under it; the floor slab, the underside tapering to its clamp
  c.fillStyle = INK; c.beginPath(); c.ellipse(CAR_X, GY - 214, (CAR1 - CAR0) / 2 + 4, 52, 0, Math.PI, 0); c.fill();
  c.fillStyle = TEAL[3]; c.beginPath(); c.ellipse(CAR_X, GY - 214, (CAR1 - CAR0) / 2, 48, 0, Math.PI, 0); c.fill();
  c.fillStyle = TEAL[5]; c.beginPath(); c.ellipse(CAR_X - 30, GY - 228, 70, 22, 0, Math.PI, 0); c.fill();
  bands(c, CAR0 - 6, GY - 218, CAR1 - CAR0 + 12, 22, [CHROME[5], CHROME[4], CHROME[3], CHROME[1]]);
  box(c, CAR_X - 24, GY - 196, 48, 4, '#FDE68A');
  rr(c, CAR_X + 60, GY - 194, 24, 8, 3); c.fillStyle = CHROME[2]; c.fill();
  box(c, CAR0 - 6, GY, CAR1 - CAR0 + 12, 3, '#F8FAFC');
  bands(c, CAR0 - 6, GY + 3, CAR1 - CAR0 + 12, 26, [CHROME[4], CHROME[3], CHROME[2], ORANGE[3], CHROME[1]]);
  c.fillStyle = INK; c.beginPath(); c.moveTo(CAR0 - 6, GY + 29); c.lineTo(CAR1 + 6, GY + 29); c.lineTo(CAR_X + 50, GY + 90); c.lineTo(CAR_X - 50, GY + 90); c.closePath(); c.fill();
  c.fillStyle = TEAL[2]; c.beginPath(); c.moveTo(CAR0 - 3, GY + 30); c.lineTo(CAR1 + 3, GY + 30); c.lineTo(CAR_X + 48, GY + 88); c.lineTo(CAR_X - 48, GY + 88); c.closePath(); c.fill();
  box(c, CAR_X - 30, GY + 88, 60, 10, CHROME[3]);
  // the clamps out to the rails
  for (const [x0, x1] of [[CAR0 - 54, CAR0 - 6], [CAR1 + 6, CAR1 + 54]]) { bands(c, x0, GY - 40, x1 - x0, 14, [CHROME[5], CHROME[3], CHROME[1]]); bands(c, x0, GY - 200, x1 - x0, 14, [CHROME[5], CHROME[3], CHROME[1]]); }
  // the ribs, the glass's frame, the handrail (dimmed)
  column(c, CAR0 - 6, GY - 200, 16, 200); column(c, CAR1 - 10, GY - 200, 16, 200);
  box(c, CAR0 + 10, GY - 70, CAR1 - CAR0 - 20, 4, dimc(CHROME[5]));
  // the glass's glare
  glare(c, CAR0 + 10, GY - 196, CAR1 - CAR0 - 20, 196);
};
