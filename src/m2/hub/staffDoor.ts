// The hub's staff door: the back of the building the staff room's in (pen/art.ts is its inside), between Foreign
// Lands and Space Land, the ugly back of house the guests aren't meant to see. The same cinderblock as in there, gone
// gray-brown with dirt, the cream paint peeling off it in sheets; water stains and rust bleeding down from the coping,
// a downspout that's lost a length; the gray conduit and the rusty pipe running up it, a breaker panel, a caged bulb
// over the door on a conduit arm; STAFF ONLY spray-stenciled over the door (overspray, a drip); the same gray steel
// door (a pull handle out here, its push bar's on the inside), kick plate, wired-glass vision lite, a closer, a badge
// reader by it with its LED; a fire bell; the same cracked wired window, a wall air conditioner dripping on the
// dumpster's bags, the greasy vent breathing steam; NO SMOKING over an ash urn bristling with butts; the employee of
// the month taped up (Gary again) and a laminated memo; the recycling and a trash can; flattened boxes and the hand
// truck against the wall; a mop bucket. The hub's a cylinder seen from inside, so the building's sides run straight
// at the eye: only its face shows.
//
// Painted once into two stamps (the building and everything stood against it; the dumpster); what moves (the bulb's
// flicker and its light, the badge reader's LED, the steam, the drip, the stink, the flies, the sticky note) is live.

import { GROUND_Y } from '../../m1/constants';
import { INK, box, mix, dark, lite, checker, hash, stamp } from '../intro/art/kit';
import { signAt, signText, signW, enamel, type Look } from './letters';

type Ctx = CanvasRenderingContext2D;
const G = GROUND_Y;
/** The building's ends and top, from the door's middle. */
const X0 = -170, X1 = 214, TOP = G - 250;
/** The block (the staff room's own, inside: pen/art.ts BLOCK), the cream it was painted. */
const C = ['#4E463A', '#5A5144', '#62594B', '#6B6153', '#7A7062', '#8A8072'];
const CREAM = ['#9C9078', '#B4A88A', '#CFC3A6', '#E8DEC4', '#F2EAD4'];
/** The door's gray steel, darkest first. */
const STEEL = ['#2E333A', '#3F444C', '#4F5560', '#5F6672', '#6E7682', '#848C98', '#A0A8B2'];
/** The door: its frame's outside, its top. */
const DOOR = { x0: -34, x1: 34, top: G - 116 };
/** Where the live bits are (the bulb, the badge reader's LED, the vent's mouth, the AC's drip). */
const BULB = { x: 0, y: G - 158 };
const LED = { x: 45, y: G - 75 };
const VENT = { x: -91, y: G - 186 };
const AC = { x0: 118, x1: 166, y: G - 168, h: 28 };
const DUMP = { x0: 96, W: 128, H: 66 };

const ink = (c: Ctx, path: () => void, fill: string, line = 1) => { c.beginPath(); path(); c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
const poly = (c: Ctx, pts: number[], col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
/** What something casts on the wall (the light's from the upper left: down and right). */
const shade = (c: Ctx, x: number, y: number, w: number, h: number, k = 0.34, d = 3) => box(c, x + d, y + d, w, h, `rgba(18, 12, 6, ${k})`);
const screw = (c: Ctx, x: number, y: number) => { box(c, x, y, 2, 2, '#26282C'); box(c, x, y, 1, 1, '#D3D9E0'); };
const tape = (c: Ctx, x: number, y: number, w = 8, h = 4) => { box(c, x, y, w, h, 'rgba(226, 214, 160, 0.8)'); box(c, x, y, w, 1, 'rgba(255, 250, 220, 0.6)'); };
/** A thing's top put in shade: nothing back here reads as somewhere to stand. */
const dimTop = (c: Ctx, x: number, y: number, w: number, col: string, h = 2) => box(c, x, y, w, h, dark(col, 0.3));
/** A run of conduit (gray, lit down its left, a strap every so often), vertical or across. */
const conduit = (c: Ctx, x: number, y: number, len: number, across = false) => {
  if (across) {
    box(c, x, y - 1, len, 5, INK); box(c, x, y, len, 3, '#7C838C'); box(c, x, y, len, 1, '#B8BEC6');
    for (let k = 10; k < len; k += 44) { box(c, x + k, y - 2, 4, 7, '#4B5058'); box(c, x + k, y - 2, 4, 1, '#9CA3AF'); }
  } else {
    box(c, x - 1, y, 5, len, INK); box(c, x, y, 3, len, '#7C838C'); box(c, x, y, 1, len, '#B8BEC6');
    for (let k = 14; k < len; k += 44) { box(c, x - 2, y + k, 7, 4, '#4B5058'); box(c, x - 2, y + k, 7, 1, '#9CA3AF'); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The wall

/** The block in courses (each block a step of its own, grimed toward the foot), the cream on it peeling in sheets
 *  (ragged edges, a curl), the coping, the stains down from it, the grime splashed up at the foot. */
const paintWall = (c: Ctx) => {
  ink(c, () => c.rect(X0, TOP, X1 - X0, G - TOP), C[3], 2);
  for (let y = TOP + 2, r = 0; y < G; y += 14, r++) for (let x = X0 + 2 - (r % 2 ? 14 : 0); x < X1 - 2; x += 28) {
    const a = Math.max(X0 + 2, x), b = Math.min(X1 - 2, x + 27), t = hash(x * 0.31 + y * 0.17), grime = (y - TOP) / (G - TOP);
    const col = C[Math.max(1, Math.min(5, Math.round((t > 0.8 ? 5 : t > 0.3 ? 4 : 3) - grime * 1.6)))];
    box(c, a, y, b - a, 13, col); box(c, a, y, b - a, 1, mix(col, '#FFFFFF', 0.12)); box(c, a, y + 12, b - a, 1, C[1]);
    if (t < 0.12) { box(c, a + 6, y + 4, 3, 2, C[0]); box(c, a + 7, y + 6, 1, 3, C[0]); }
    if (t > 0.94) { box(c, b - 6, y + 2, 4, 1, C[0]); box(c, b - 5, y + 3, 1, 3, C[0]); }
  }
  for (let y = TOP + 15; y < G; y += 14) box(c, X0 + 2, y, X1 - X0 - 4, 1, C[0]);
  // (the cream it was painted: what's left of it, in sheets, the edges ragged, peeling back)
  const sheets: [number, number, number, number][] = [[X0 + 4, TOP + 30, 78, 64], [X0 + 96, TOP + 10, 120, 34], [X0 + 236, TOP + 12, 66, 40], [X0 + 300, TOP + 70, 80, 70], [X0 + 10, TOP + 132, 54, 50], [X0 + 214, TOP + 150, 40, 30]];
  for (const [px, py, pw, ph] of sheets) {
    box(c, px, py, pw, ph, CREAM[2]); box(c, px, py, pw, 2, CREAM[3]); box(c, px + pw - 3, py, 3, ph, CREAM[1]);
    checker(c, px, py + 2, pw, 2, CREAM[3]);
    // (it's still in the block's joints: faint courses through it)
    for (let y = py + 6 + ((py - TOP) % 14); y < py + ph; y += 14) box(c, px + 1, y, pw - 4, 1, mix(CREAM[2], C[2], 0.22));
    // (the bottom edge torn: a ragged hem, a lit lip, the shadow it throws under it)
    for (let k = 0; k < pw; k += 6) {
      const d = 2 + Math.floor(hash(px + k * 1.7) * 7);
      box(c, px + k, py + ph, 6, d, CREAM[2]); box(c, px + k, py + ph + d, 6, 1, 'rgba(18, 12, 6, 0.45)'); box(c, px + k, py + ph + d - 1, 6, 1, CREAM[1]);
    }
    // (a corner curling off the wall: its back showing, dirty)
    poly(c, [px + pw - 10, py + ph, px + pw, py + ph, px + pw + 4, py + ph + 9], CREAM[0]);
    poly(c, [px + pw - 10, py + ph, px + pw + 4, py + ph + 9, px + pw - 4, py + ph + 6], CREAM[4]);
    for (let k = 0; k < 3; k++) box(c, px + 6 + hash(px + k) * (pw - 14), py + 8 + hash(py + k) * (ph - 16), 3, 2, CREAM[1]);
  }
  // (the coping: galvanized flashing along the top, a dent, the rust under each seam bleeding down)
  box(c, X0 - 3, TOP - 6, X1 - X0 + 6, 9, INK); box(c, X0 - 2, TOP - 5, X1 - X0 + 4, 7, '#7B8088'); box(c, X0 - 2, TOP - 5, X1 - X0 + 4, 2, '#B8BEC6'); box(c, X0 - 2, TOP + 1, X1 - X0 + 4, 1, '#4B5058');
  box(c, X0 + 140, TOP - 3, 14, 2, '#5B6068');
  for (let x = X0 + 30; x < X1 - 10; x += 48) {
    box(c, x, TOP - 5, 1, 7, '#4B5058');
    const len = 20 + Math.floor(hash(x) * 50);
    box(c, x - 1, TOP + 3, 3, len, 'rgba(120, 60, 20, 0.5)'); box(c, x, TOP + 3 + len, 1, 4, 'rgba(120, 60, 20, 0.35)');
  }
  // (water stains down from where the roof drains over it: tide lines, streaks)
  for (const [sx, w, run] of [[X0 + 118, 46, 140], [X0 + 330, 30, 90]] as const) {
    for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(70, 50, 24, ${0.28 - k * 0.07})`; c.lineWidth = 1; c.beginPath(); c.ellipse(sx + w / 2, TOP + 6, w / 2 - k * 5, 10 + k * 6, 0, 0, Math.PI); c.stroke(); }
    for (let k = 0; k < w; k += 5) { const len = run * (0.4 + hash(sx + k) * 0.6); box(c, sx + k, TOP + 6, 3, len, 'rgba(70, 50, 24, 0.22)'); box(c, sx + k + 1, TOP + 6 + len, 1, 3, 'rgba(70, 50, 24, 0.3)'); }
  }
  // (the light down the left of it, the shade down the right; dirt splashed up the foot, dithered off)
  box(c, X0 + 2, TOP + 2, 6, G - TOP - 2, 'rgba(255,255,255,0.07)'); box(c, X1 - 14, TOP + 2, 12, G - TOP - 2, 'rgba(26,16,40,0.18)');
  box(c, X0 + 2, G - 16, X1 - X0 - 4, 16, 'rgba(30, 24, 12, 0.32)'); checker(c, X0 + 2, G - 22, X1 - X0 - 4, 6, 'rgba(30, 24, 12, 0.32)');
  // (the roof's stuff peeking over the parapet: a rooftop unit, a vent stack and its rain cap)
  ink(c, () => c.rect(-76, TOP - 22, 58, 16), '#8A8F96'); box(c, -75, TOP - 21, 56, 2, '#B8BEC6');
  for (let k = 0; k < 6; k++) box(c, -70 + k * 9, TOP - 17, 5, 9, '#4B5058');
  ink(c, () => c.rect(48, TOP - 30, 10, 24), '#7C838C'); box(c, 49, TOP - 29, 2, 22, '#B8BEC6');
  ink(c, () => { c.moveTo(42, TOP - 30); c.lineTo(53, TOP - 38); c.lineTo(64, TOP - 30); c.closePath(); }, '#6B7280');
};

/** The downspout down the left end: straps, a length gone (the stain where it pours), an elbow on a splash block. */
const downspout = (c: Ctx) => {
  const x = X0 + 6, gap0 = G - 150, gap1 = G - 118;
  const run = (y0: number, y1: number) => { box(c, x - 1, y0, 9, y1 - y0, INK); box(c, x, y0, 7, y1 - y0, '#8A8F96'); box(c, x, y0, 2, y1 - y0, '#C2C8CE'); box(c, x + 5, y0, 2, y1 - y0, '#5B6068'); };
  run(TOP - 2, gap0); run(gap1, G - 14);
  for (let y = TOP + 30; y < G - 20; y += 46) if (y < gap0 - 4 || y > gap1 + 2) { box(c, x - 3, y, 13, 4, '#4B5058'); box(c, x - 3, y, 13, 1, '#9CA3AF'); }
  // (the end of the top length, crumpled; what pours out of it has stained the block)
  box(c, x - 2, gap0 - 2, 11, 3, '#5B6068'); box(c, x + 6, gap0, 3, 4, '#5B6068');
  for (let k = 0; k < 4; k++) box(c, x + k * 2, gap0 + 2, 2, gap1 - gap0 - 2, `rgba(40, 52, 30, ${0.32 - k * 0.05})`);
  checker(c, x - 6, gap0 + 4, 20, gap1 - gap0 - 4, 'rgba(40, 52, 30, 0.22)');
  // (the elbow, the splash block, a green slick)
  ink(c, () => { c.moveTo(x - 1, G - 14); c.lineTo(x + 8, G - 14); c.lineTo(x + 16, G - 6); c.lineTo(x + 16, G - 2); c.lineTo(x + 6, G - 2); c.lineTo(x - 1, G - 8); c.closePath(); }, '#8A8F96');
  ink(c, () => c.rect(x + 6, G - 3, 22, 3), '#9A968E');
  box(c, x + 16, G - 2, 18, 2, '#3F5A2E');
};

/** The breaker panel, its conduit up to the roof and across to the bulb's arm; the bulb's cage (lit live). */
const panelAndConduit = (c: Ctx) => {
  conduit(c, -138, TOP + 2, 46);
  conduit(c, -138, TOP + 34, 3, true);
  conduit(c, -138, G - 214, 136, true);
  conduit(c, -3, G - 214, 46);
  // (the panel: gray steel, its door, a latch, DANGER, rust weeping from the bottom corner)
  const x = -152, y = G - 200, w = 30, h = 40;
  shade(c, x, y, w, h, 0.38, 3);
  ink(c, () => c.rect(x, y, w, h), STEEL[4], 1);
  box(c, x + 1, y + 1, 3, h - 2, STEEL[5]); box(c, x + w - 4, y + 1, 3, h - 2, STEEL[2]); box(c, x + 1, y + 1, w - 2, 1, STEEL[6]);
  box(c, x + 4, y + 4, w - 9, h - 8, STEEL[3]); box(c, x + 4, y + 4, w - 9, 1, STEEL[2]);
  box(c, x + w - 8, y + 18, 3, 6, '#26282C'); box(c, x + w - 8, y + 18, 1, 6, '#9CA3AF');
  box(c, x + 6, y + 7, 14, 9, '#FACC15'); box(c, x + 6, y + 7, 14, 2, '#111111');
  poly(c, [x + 14, y + 10, x + 10, y + 14, x + 13, y + 14, x + 11, y + 17, x + 16, y + 12, x + 13, y + 12, x + 15, y + 10], '#111111');
  box(c, x + 6, y + 28, 14, 5, '#F5F5F4'); box(c, x + 7, y + 29, 12, 3, '#DC2626');
  for (const [sx, sy] of [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4], [x + w - 4, y + h - 4]] as const) screw(c, sx, sy);
  for (let k = 0; k < 3; k++) box(c, x + w - 6 + k * 2, y + h, 2, 10 + k * 7, 'rgba(120, 60, 20, 0.5)');
  // (the bulb's arm off the conduit, its wall plate, the cage round where the glass is)
  box(c, -8, BULB.y - 18, 16, 4, INK); box(c, -7, BULB.y - 17, 14, 2, '#7C838C');
  box(c, -2, BULB.y - 14, 4, 6, '#3F444C');
  c.strokeStyle = '#1C1F24'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(BULB.x, BULB.y, 7, 7, 0, 0, Math.PI * 2); c.stroke();
  for (const dx of [-4, 0, 4]) { c.beginPath(); c.moveTo(BULB.x + dx, BULB.y - 7); c.lineTo(BULB.x + dx, BULB.y + 7); c.stroke(); }
  box(c, BULB.x - 7, BULB.y, 14, 1, '#1C1F24');
};

/** STAFF ONLY, spray-stenciled on the block over the door: a haze of overspray, the stencil's bridges, a drip. */
const STENCIL: Look = { sx: 2, sy: 2, stencil: true, fill: ['#F2D35C', '#E8C547', '#E8C547', '#C9A227'] };
const stencilSign = (c: Ctx) => {
  const y = G - 140, w = signW('STAFF ONLY', STENCIL);
  // (the board it was sprayed through left a clean edge top and bottom; overspray past the ends)
  checker(c, -w / 2 - 6, y - 3, w + 12, 18, 'rgba(232, 197, 71, 0.14)');
  box(c, -w / 2 - 2, y - 1, w + 4, 15, 'rgba(232, 197, 71, 0.10)');
  signText(c, 'STAFF ONLY', 0, y + 12, { ...STENCIL, fill: 'rgba(232, 197, 71, 0.25)' });
  signText(c, 'STAFF ONLY', 1, y + 13, { ...STENCIL, fill: 'rgba(40, 30, 10, 0.35)' });
  signText(c, 'STAFF ONLY', 0, y + 12, STENCIL);
  for (const [dx, len] of [[-w / 2 + 9, 7], [-4, 11], [w / 2 - 15, 5]] as const) { box(c, dx, y + 14, 1, len, '#C9A227'); box(c, dx, y + 14 + len, 2, 2, '#C9A227'); }
};

// ---------------------------------------------------------------------------------------------------------------
// The door

/** The gray steel door in its frame: dents, scuffs, rust at the foot; hinges, the closer, PRIVATE, the wired-glass
 *  vision lite, the lever lock and pull, the kick plate, the threshold. The sticky note on it's live. */
const paintDoor = (c: Ctx) => {
  const { x0, x1, top } = DOOR;
  // (its frame: hollow steel, lit down the left, the stop inside it)
  shade(c, x0, top, x1 - x0, G - top, 0.4, 4);
  box(c, x0 - 1, top - 1, x1 - x0 + 2, G - top + 1, INK);
  box(c, x0, top, x1 - x0, G - top, STEEL[3]); box(c, x0, top, 2, G - top, STEEL[5]); box(c, x0, top, x1 - x0, 2, STEEL[5]); box(c, x1 - 2, top, 2, G - top, STEEL[1]);
  const dx0 = x0 + 6, dx1 = x1 - 6, dtop = top + 6, dw = dx1 - dx0;
  box(c, dx0 - 1, dtop - 1, dw + 2, G - dtop + 1, INK);
  // (the slab: stepped from lit at the hinge side to shade at the latch, a dithered seam at each step)
  const bandsX = [STEEL[5], STEEL[4], STEEL[4], STEEL[3], STEEL[3], STEEL[3], STEEL[2]];
  const bw = dw / bandsX.length;
  bandsX.forEach((col, i) => box(c, dx0 + i * bw, dtop, bw + 1, G - dtop, col));
  for (let i = 1; i < bandsX.length; i++) if (bandsX[i] !== bandsX[i - 1]) checker(c, Math.round(dx0 + i * bw) - 2, dtop, 2, G - dtop, bandsX[i]);
  box(c, dx0, dtop, dw, 1, STEEL[6]);
  // (dents: a dark dish, lit on its lower lip; the paint chipped to primer, to rust)
  for (const [ex, ey, r] of [[dx0 + 12, G - 36, 4], [dx0 + 40, G - 52, 3], [dx0 + 30, G - 28, 5]] as const) {
    c.fillStyle = STEEL[1]; c.beginPath(); c.ellipse(ex, ey, r, r * 0.7, 0, 0, Math.PI * 2); c.fill();
    box(c, ex - r + 1, ey + r * 0.5, r * 2 - 2, 1, STEEL[6]);
  }
  for (const [px, py] of [[dx0 + 4, G - 70], [dx0 + 44, G - 84], [dx0 + 20, G - 46]] as const) { box(c, px, py, 4, 3, '#9A8A70'); box(c, px + 1, py + 1, 2, 1, '#8B4A1C'); }
  // (boot scuffs where it's kicked open, black, low)
  for (let k = 0; k < 7; k++) box(c, dx0 + 3 + ((k * 13) % (dw - 12)), G - 30 - ((k * 7) % 12), 6 + (k % 3) * 3, 1, 'rgba(20, 20, 24, 0.55)');
  // (hinges, three, down the left)
  for (const hy of [dtop + 8, dtop + 46, G - 22]) { box(c, dx0 - 3, hy, 4, 10, INK); box(c, dx0 - 2, hy + 1, 2, 8, '#9CA3AF'); box(c, dx0 - 2, hy + 1, 1, 8, '#D1D5DB'); }
  // (the closer on the head, its arm to the frame)
  ink(c, () => c.rect(2, top - 8, 24, 7), '#52525B'); box(c, 3, top - 7, 22, 2, '#A1A1AA');
  box(c, 20, top - 2, 2, 5, '#3F3F46'); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(6, top - 3); c.lineTo(14, top + 2); c.lineTo(22, top + 1); c.stroke();
  c.strokeStyle = '#9CA3AF'; c.lineWidth = 1; c.beginPath(); c.moveTo(6, top - 4); c.lineTo(14, top + 1); c.stroke();
  // (PRIVATE: a red plate, screwed on)
  const pw = signW('PRIVATE', enamel(5, '#FFFFFF')) + 8, py = dtop + 4;
  box(c, -pw / 2 - 1, py - 1, pw + 2, 12, INK); box(c, -pw / 2, py, pw, 10, '#B91C1C'); box(c, -pw / 2, py, pw, 1, '#EF4444'); box(c, -pw / 2, py + 9, pw, 1, '#7F1D1D');
  screw(c, -pw / 2 + 1, py + 4); screw(c, pw / 2 - 3, py + 4);
  signAt(c, 'PRIVATE', 0, py + 5, 5, enamel(5, '#FFFFFF'));
  // (the vision lite: wired glass, the staff room's fluorescent cold behind it, a glint, a crack)
  const lx = -8, ly = dtop + 20, lw = 16, lh = 28;
  box(c, lx - 3, ly - 3, lw + 6, lh + 6, INK); box(c, lx - 2, ly - 2, lw + 4, lh + 4, STEEL[1]); box(c, lx - 2, ly - 2, lw + 4, 1, STEEL[5]);
  box(c, lx, ly, lw, lh, '#5E7A78'); box(c, lx, ly, lw, 8, '#8FB0AC'); checker(c, lx, ly + 8, lw, 2, '#8FB0AC');
  box(c, lx, ly + lh - 8, lw, 8, '#3E5654'); checker(c, lx, ly + lh - 10, lw, 2, '#3E5654', 1);
  for (let k = 0; k < lw + lh; k += 5) for (const s of [1, -1]) {
    c.strokeStyle = 'rgba(30, 36, 40, 0.65)'; c.lineWidth = 1; c.save(); c.beginPath(); c.rect(lx, ly, lw, lh); c.clip();
    c.beginPath(); c.moveTo(lx + (s > 0 ? k - lh : k), ly); c.lineTo(lx + (s > 0 ? k : k - lh), ly + lh); c.stroke(); c.restore();
  }
  box(c, lx + 2, ly + 2, 1, lh - 8, 'rgba(255, 255, 255, 0.7)'); box(c, lx + 4, ly + 2, 1, 6, 'rgba(255, 255, 255, 0.5)');
  c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx + lw, ly + 6); c.lineTo(lx + 9, ly + 13); c.lineTo(lx + 11, ly + 21); c.stroke();
  // (the lock: a lever, its cylinder; the pull under it, worn shiny where the hands go)
  const hx = dx1 - 9;
  box(c, hx - 2, G - 70, 7, 10, INK); box(c, hx - 1, G - 69, 5, 8, '#71717A'); box(c, hx, G - 67, 2, 2, '#18181B');
  box(c, hx - 8, G - 59, 13, 4, INK); box(c, hx - 7, G - 58, 11, 2, '#D4D4D8'); box(c, hx - 7, G - 58, 11, 1, '#FAFAFA');
  box(c, hx, G - 52, 4, 26, INK); box(c, hx + 1, G - 51, 2, 24, '#A1A1AA'); box(c, hx + 1, G - 44, 1, 10, '#F4F4F5');
  box(c, hx - 2, G - 53, 5, 3, '#3F3F46'); box(c, hx - 2, G - 28, 5, 3, '#3F3F46');
  box(c, hx - 6, G - 48, 4, 18, 'rgba(20, 20, 24, 0.28)');
  // (the kick plate: brushed steel, scratched, screwed; rust where it meets the threshold)
  const ky = G - 20;
  box(c, dx0, ky - 1, dw, 1, INK); box(c, dx0, ky, dw, 17, '#A8AEB6');
  for (let y = ky + 2; y < ky + 16; y += 2) box(c, dx0, y, dw, 1, y % 4 ? '#B8BEC6' : '#9AA0A8');
  box(c, dx0, ky, dw, 1, '#E5E7EB'); box(c, dx0, ky + 15, dw, 2, '#6B7078');
  for (let k = 0; k < 6; k++) { const sx = dx0 + 4 + ((k * 17) % (dw - 10)); c.strokeStyle = 'rgba(60, 64, 70, 0.6)'; c.beginPath(); c.moveTo(sx, ky + 3 + (k % 3) * 3); c.lineTo(sx + 5 + (k % 2) * 4, ky + 6 + (k % 3) * 3); c.stroke(); }
  for (const sx of [dx0 + 2, dx1 - 4]) { screw(c, sx, ky + 2); screw(c, sx, ky + 13); }
  for (let k = 0; k < dw; k += 4) box(c, dx0 + k, G - 4 - (k % 8 ? 0 : 2), 3, 2 + (k % 8 ? 0 : 2), 'rgba(139, 74, 28, 0.7)');
  // (the threshold: an aluminum saddle, gritty)
  box(c, x0 - 2, G - 3, x1 - x0 + 4, 3, INK); box(c, x0 - 1, G - 2, x1 - x0 + 2, 2, '#9CA3AF'); box(c, x0 - 1, G - 2, x1 - x0 + 2, 1, '#D1D5DB');
};

/** The badge reader by the door: black, a card slot, a keypad (the 5 worn white), grime round it (its LED's live). */
const badgeReader = (c: Ctx) => {
  const x = 39, y = G - 80, w = 13, h = 24;
  shade(c, x, y, w, h, 0.4, 2);
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, '#26282C'); box(c, x, y, 2, h, '#3F444C'); box(c, x, y, w, 1, '#52575F');
  box(c, x + 3, y + 3, 7, 3, '#0A0A0A');
  for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { const kx = x + 2 + k * 3, ky = y + 9 + r * 3; box(c, kx, ky, 2, 2, r === 1 && k === 1 ? '#E5E7EB' : '#6B7280'); }
  box(c, x - 2, y + h + 1, w + 4, 3, 'rgba(30, 24, 12, 0.35)');
  // (its wire, down into the conduit... no: just taped up the wall)
  box(c, x + w / 2, y - 18, 1, 17, '#18181B'); tape(c, x + w / 2 - 3, y - 12, 7, 3);
};

/** The fire bell, up over the right of the door: red dome, the striker, its back box. */
const fireBell = (c: Ctx) => {
  const x = 64, y = G - 182;
  box(c, x - 6, y - 6, 12, 12, INK); box(c, x - 5, y - 5, 10, 10, '#B91C1C');
  ink(c, () => c.arc(x, y, 9, 0, Math.PI * 2), '#DC2626');
  c.fillStyle = '#991B1B'; c.beginPath(); c.arc(x + 2, y + 2, 7, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.beginPath(); c.arc(x - 1, y - 1, 6, 0, Math.PI * 2); c.fill();
  box(c, x - 5, y - 6, 3, 2, '#FCA5A5'); box(c, x - 6, y - 4, 2, 2, '#FCA5A5');
  box(c, x - 1, y - 1, 3, 3, '#3F3F46'); box(c, x + 6, y + 6, 3, 3, '#52525B');
  for (let k = 0; k < 2; k++) box(c, x - 1 + k * 2, y + 10, 1, 6 + k * 4, 'rgba(120, 60, 20, 0.45)');
};

/** Fine print too small to read: rows of dashes, word-ish. */
const scrib = (c: Ctx, x: number, y: number, w: number, col: string, seed = 0) => {
  for (let k = 0; k < w;) { const len = 2 + Math.floor(hash(seed + k * 1.3) * 5); box(c, x + k, y, Math.min(len, w - k), 1, col); k += len + 1; }
};
const PRINT = (col: string): Look => ({ sx: 1, sy: 1, fill: col });

/** Notices taped up by the door: the employee of the month (Gary, the photo a gross-up even at this size), a laminated
 *  memo. */
const notices = (c: Ctx) => {
  // (the employee of the month: a flyer in a sheet protector, curling)
  const x = 66, y = G - 148, w = 50, h = 52;
  shade(c, x, y, w, h, 0.32, 2);
  box(c, x, y, w, h, '#F4ECD8'); box(c, x, y, w, 10, '#1E3A8A'); box(c, x, y + 10, w, 1, '#C9A227');
  box(c, x + w - 2, y, 2, h, '#D6CCB4'); box(c, x, y + h - 2, w, 2, '#C8BEA4');
  signText(c, 'EMPLOYEE', x + w / 2, y + 8, PRINT('#FDE047'));
  scrib(c, x + 8, y + 13, w - 16, '#1E3A8A', 3);
  // (the photo: bloodshot, sweating, the grin too wide, yellow teeth, a hair or two)
  const fw = 22, fh = 20, fx = x + (w - fw) / 2, fy = y + 16;
  box(c, fx - 1, fy - 1, fw + 2, fh + 2, INK); box(c, fx, fy, fw, fh, '#7DA0B8'); box(c, fx, fy + fh - 5, fw, 5, '#5A7A92');
  c.save(); c.beginPath(); c.rect(fx, fy, fw, fh); c.clip();
  c.fillStyle = '#D9A07A'; c.beginPath(); c.ellipse(fx + fw / 2, fy + fh / 2 + 3, 10, 11, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#B87A58'; c.beginPath(); c.ellipse(fx + fw / 2 + 4, fy + fh / 2 + 5, 5, 7, 0, 0, Math.PI * 2); c.fill();
  box(c, fx + 4, fy + 5, 6, 4, '#FFFFFF'); box(c, fx + 12, fy + 5, 6, 4, '#FFFFFF');
  box(c, fx + 7, fy + 6, 2, 2, '#111111'); box(c, fx + 13, fy + 6, 2, 2, '#111111');
  box(c, fx + 4, fy + 7, 2, 1, '#DC2626'); box(c, fx + 16, fy + 5, 1, 2, '#DC2626'); box(c, fx + 5, fy + 5, 1, 1, '#DC2626');
  box(c, fx + 10, fy + 9, 2, 3, '#9A5A3E');
  box(c, fx + 3, fy + 13, 16, 5, '#5A1E1A'); box(c, fx + 4, fy + 13, 14, 2, '#E8D44A'); box(c, fx + 7, fy + 13, 1, 2, '#5A1E1A'); box(c, fx + 12, fy + 13, 1, 2, '#5A1E1A'); box(c, fx + 9, fy + 16, 4, 1, '#E8D44A');
  box(c, fx + 2, fy + 9, 1, 3, '#9FD3F0'); box(c, fx + 19, fy + 10, 1, 2, '#9FD3F0');
  box(c, fx + 9, fy, 1, 3, '#3A2A10'); box(c, fx + 12, fy, 1, 2, '#3A2A10');
  c.restore();
  signText(c, 'GARY', x + w / 2, y + h - 5, PRINT('#3A2A10'));
  box(c, x + 2, y + 1, 1, h - 4, 'rgba(255, 255, 255, 0.55)'); box(c, x + 4, y + 1, w - 8, 1, 'rgba(255, 255, 255, 0.4)');
  tape(c, x - 2, y - 2); tape(c, x + w - 6, y - 2);
  // (a memo, laminated, a corner gone dog-eared)
  const mx = 58, my = G - 90, mw = 36, mh = 22;
  shade(c, mx, my, mw, mh, 0.32, 2);
  box(c, mx, my, mw, mh, '#F8FAFC'); box(c, mx, my, mw, 1, '#FFFFFF'); box(c, mx + mw - 1, my, 1, mh, '#CBD5E1'); box(c, mx, my + mh - 1, mw, 1, '#CBD5E1');
  signText(c, 'MEMO', mx + mw / 2, my + 9, PRINT('#B91C1C'));
  for (let k = 0; k < 3; k++) scrib(c, mx + 4, my + 12 + k * 3, mw - 8 - (k === 2 ? 10 : 0), '#26324A', 11 + k * 7);
  poly(c, [mx + mw - 6, my + mh, mx + mw, my + mh, mx + mw, my + mh - 6], '#CBD5E1');
  box(c, mx + 2, my + 2, 1, mh - 5, 'rgba(255, 255, 255, 0.8)');
  tape(c, mx + mw / 2 - 4, my - 2);
};

/** The cracked wired window up on the right; the AC unit under it, rust down from it. */
const windowAndAC = (c: Ctx) => {
  const x = 110, y = G - 230, w = 56, h = 40;
  ink(c, () => c.rect(x, y, w, h), '#3F3F46', 2);
  box(c, x + 3, y + 3, w - 6, h - 6, '#8FA3A8'); box(c, x + 3, y + 3, w - 6, 12, '#A8BCC0'); checker(c, x + 3, y + 15, w - 6, 2, '#A8BCC0');
  for (let k = 0; k < 6; k++) { box(c, x + 3 + k * 9, y + 3, 1, h - 6, '#52525B'); box(c, x + 3, y + 3 + k * 7, w - 6, 1, '#52525B'); }
  c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 10, y + 6); c.lineTo(x + 26, y + 22); c.lineTo(x + 22, y + 35); c.moveTo(x + 26, y + 22); c.lineTo(x + 46, y + 18); c.stroke();
  box(c, x + 3, y + 28, w - 6, 9, 'rgba(60, 50, 30, 0.6)');
  // (a sign taped up inside it, sun-faded: NOW HIRING)
  box(c, x + 28, y + 19, 23, 15, '#E8E0C8'); signText(c, 'NOW', x + 39, y + 27, PRINT('#B45309')); scrib(c, x + 30, y + 30, 19, '#B45309', 5);
  box(c, x - 2, y + h, w + 4, 4, INK); box(c, x - 1, y + h, w + 2, 2, '#9A968E');
  // (the AC: a beige box in a sleeve, its grille, a rust run down to the dumpster)
  const { x0: ax, x1: ax1, y: ay, h: ah } = AC, aw = ax1 - ax;
  shade(c, ax, ay, aw, ah, 0.38, 3);
  ink(c, () => c.rect(ax, ay, aw, ah), '#A8A29E', 2); box(c, ax + 1, ay + 1, 4, ah - 2, '#D6D3D1'); box(c, ax1 - 5, ay + 1, 4, ah - 2, '#78716C');
  for (let k = 0; k < 5; k++) { box(c, ax + 6, ay + 4 + k * 5, aw - 12, 2, '#57534E'); box(c, ax + 6, ay + 4 + k * 5, aw - 12, 1, '#D6D3D1'); }
  box(c, ax + 30, ay + ah, 3, 4, '#57534E');
  box(c, ax, ay + ah + 2, aw, 3, 'rgba(120, 60, 20, 0.55)');
  for (let k = 0; k < 4; k++) box(c, ax + 26 + k * 3, ay + ah + 5, 2, 18 + k * 9, 'rgba(120, 60, 20, 0.4)');
};

/** The greasy exhaust hood (the dryer's, the fryer's, nobody knows), the lint and grease furred down from it. */
const vent = (c: Ctx) => {
  const x = VENT.x - 14, y = VENT.y - 18, w = 28, h = 16;
  box(c, x - 2, y + h, w + 4, 34, 'rgba(30, 24, 12, 0.45)'); checker(c, x - 4, y + h + 34, w + 8, 10, 'rgba(30, 24, 12, 0.45)');
  for (let k = 0; k < 6; k++) box(c, x + 2 + k * 5, y + h + 6, 2, 12 + ((k * 11) % 24), 'rgba(60, 50, 30, 0.45)');
  ink(c, () => { c.moveTo(x, y + h); c.lineTo(x + 3, y); c.lineTo(x + w - 3, y); c.lineTo(x + w, y + h); c.closePath(); }, '#71717A', 2);
  box(c, x + 4, y + 2, w - 8, 2, '#A1A1AA');
  for (let k = 0; k < 3; k++) { box(c, x + 3, y + 5 + k * 4, w - 6, 2, '#27272A'); box(c, x + 3, y + 7 + k * 4, w - 6, 1, '#8A8F96'); }
  box(c, x + 2, y + h - 1, w - 4, 2, '#3F3F46');
  for (let k = 0; k < 5; k++) box(c, x + 3 + k * 5, y + h + 1, 3, 2 + (k % 2) * 2, '#9A8A70');
};

// ---------------------------------------------------------------------------------------------------------------
// Stood against it

/** NO SMOKING, and under it the ash urn everybody smokes at, bristling with butts, more of them round its foot. */
const smokers = (c: Ctx) => {
  const sx = -84, sy = G - 104, sw = 48, sh = 20;
  shade(c, sx, sy, sw, sh, 0.38, 3);
  ink(c, () => c.rect(sx, sy, sw, sh), '#F8FAFC'); box(c, sx + 1, sy + 1, sw - 2, 1, '#FFFFFF'); box(c, sx + 1, sy + sh - 2, sw - 2, 1, '#CBD5E1');
  signAt(c, 'NO', sx + sw / 2, sy + 6, 5, enamel(5, '#DC2626')); signAt(c, 'SMOKING', sx + sw / 2, sy + 14, 5, enamel(5, '#DC2626'));
  for (const [bx, by] of [[sx + 2, sy + 2], [sx + sw - 3, sy + 2], [sx + 2, sy + sh - 3], [sx + sw - 3, sy + sh - 3]] as const) box(c, bx, by, 1, 1, '#71717A');
  // (the urn: a dented steel can on a weighted foot, its sand bowl full, butts stood in it like a bed of nails)
  const ux = -66, uw = 14, ut = G - 34;
  ink(c, () => c.rect(ux - 3, G - 4, uw + 6, 4), '#3F3F46');
  ink(c, () => c.rect(ux, ut, uw, G - 4 - ut), '#71717A');
  box(c, ux + 1, ut + 1, 3, G - 6 - ut, '#A1A1AA'); box(c, ux + uw - 4, ut + 1, 3, G - 6 - ut, '#52525B');
  c.fillStyle = '#52525B'; c.beginPath(); c.ellipse(ux + 9, ut + 16, 3, 4, 0, 0, Math.PI * 2); c.fill();
  ink(c, () => c.rect(ux - 3, ut - 4, uw + 6, 5), '#52525B');
  box(c, ux - 2, ut - 3, uw + 4, 2, '#C8B48A');
  for (let k = 0; k < 11; k++) { const bx = ux - 2 + ((k * 7) % (uw + 4)), h = 3 + (k % 3); box(c, bx, ut - 3 - h, 1, h, k % 4 ? '#F5F5F4' : '#E7E5E4'); box(c, bx, ut - 3 - h, 1, 1, k % 3 ? '#D97706' : '#57534E'); }
  box(c, ux + uw + 1, ut - 8, 4, 2, '#F5F5F4'); box(c, ux + uw + 1, ut - 8, 1, 2, '#D97706');
  for (let k = 0; k < 16; k++) box(c, -84 + ((k * 23) % 48), G - 2 - (k % 2), k % 5 ? 3 : 4, 1, k % 3 ? '#F5F5F4' : '#D97706');
};

/** The recycling cart and a galvanized can, its lid off, what didn't go in round it. Tops dimmed. */
const bins = (c: Ctx) => {
  // (the blue cart: lid propped on the bottles, the arrows on it, wheels)
  const bx = -160, bw = 26, bt = G - 42;
  ink(c, () => { c.moveTo(bx, bt); c.lineTo(bx + bw, bt); c.lineTo(bx + bw - 2, G - 5); c.lineTo(bx + 2, G - 5); c.closePath(); }, '#1D4ED8');
  box(c, bx + 2, bt + 2, 4, G - bt - 8, '#3B82F6'); box(c, bx + bw - 6, bt + 2, 4, G - bt - 8, '#1E3A8A'); checker(c, bx + 6, bt + 2, 2, G - bt - 8, '#3B82F6');
  // (the arrows, chasing)
  c.strokeStyle = '#F8FAFC'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + 9, G - 16); c.lineTo(bx + 13, G - 24); c.lineTo(bx + 17, G - 16); c.closePath(); c.stroke();
  box(c, bx + 2, G - 34, bw - 4, 2, '#1E3A8A');
  for (const [dx, col] of [[4, '#65A30D'], [10, '#A5F3FC'], [16, '#7C2D12']] as const) { box(c, bx + dx, bt - 9, 4, 10, INK); box(c, bx + dx + 1, bt - 8, 2, 9, col); }
  ctxLid(c, bx - 2, bt - 6, bw + 4);
  for (const wx of [bx + 4, bx + bw - 6]) { ink(c, () => c.arc(wx + 1, G - 3, 3, 0, Math.PI * 2), '#18181B'); }
  // (the trash can: ribbed galvanized steel, the lid leaned against it, a bag spilling over)
  const tx = -130, tw = 22, tt = G - 34;
  ink(c, () => c.rect(tx, tt, tw, G - tt), '#8A8F96');
  box(c, tx + 1, tt + 1, 4, G - tt - 2, '#C2C8CE'); box(c, tx + tw - 5, tt + 1, 4, G - tt - 2, '#5B6068');
  for (const ry of [tt + 6, tt + 16, tt + 26]) { box(c, tx, ry, tw, 2, '#5B6068'); box(c, tx, ry, tw, 1, '#D1D5DB'); }
  c.fillStyle = '#18181B'; c.beginPath(); c.ellipse(tx + tw / 2, tt - 2, 12, 6, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3F3F46'; c.beginPath(); c.ellipse(tx + tw / 2 - 2, tt - 4, 8, 3, 0, 0, Math.PI * 2); c.fill();
  box(c, tx + 4, tt - 4, 4, 3, '#E7E5E4'); box(c, tx + 12, tt - 6, 3, 3, '#F59E0B');
  ink(c, () => { c.ellipse(tx + tw + 3, G - 12, 4, 12, 0.1, 0, Math.PI * 2); }, '#9CA3AF');
  box(c, tx + tw + 2, G - 22, 2, 20, '#D1D5DB');
  box(c, tx - 4, G - 2, 6, 2, '#F5F5F4'); box(c, tx + 8, G - 2, 3, 2, '#DC2626');
};
const ctxLid = (c: Ctx, x: number, y: number, w: number) => {
  c.save(); c.translate(x, y + 6); c.rotate(-0.18);
  box(c, -1, -5, w + 2, 6, INK); box(c, 0, -4, w, 4, '#1E40AF'); dimTop(c, 0, -4, w, '#1E40AF', 1);
  c.restore();
};

/** A stack of flattened boxes leaned on the wall, tied with twine, and the hand truck stood in front of them. */
const boxesAndTruck = (c: Ctx) => {
  // (the boxes: slabs of cardboard edge-on at a lean, a printed one on the front)
  const base = -104, lean = 8;
  for (let k = 0; k < 4; k++) {
    const x = base + k * 2, top = G - 62 + k * 2, col = ['#9A6E3E', '#B98A55', '#A87C48', '#C9995F'][k];
    ink(c, () => { c.moveTo(x + lean, top); c.lineTo(x + lean + 24, top); c.lineTo(x + 24, G); c.lineTo(x, G); c.closePath(); }, col);
  }
  const fx = base + 6;
  box(c, fx + 8, G - 44, 12, 7, '#7C5A30');
  poly(c, [fx + 10, G - 30, fx + 14, G - 36, fx + 18, G - 30], '#3A2A10'); box(c, fx + 13, G - 30, 2, 5, '#3A2A10');
  c.strokeStyle = '#E7D7A8'; c.lineWidth = 1; c.beginPath(); c.moveTo(fx + 5, G - 40); c.lineTo(fx + 30, G - 40); c.moveTo(fx + 2, G - 18); c.lineTo(fx + 27, G - 18); c.stroke();
  // (the hand truck: rails, the toe plate, a wheel, the loop handle, leaned back)
  const hx = -98;
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(hx, G - 6); c.lineTo(hx + 7, G - 64); c.moveTo(hx + 12, G - 6); c.lineTo(hx + 19, G - 64); c.stroke();
  c.strokeStyle = '#DC2626'; c.lineWidth = 2; c.stroke();
  c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(hx + 13, G - 64, 6, Math.PI, 0); c.stroke(); c.strokeStyle = '#18181B'; c.lineWidth = 2; c.stroke();
  for (const y of [G - 24, G - 44]) { box(c, hx + 1, y, 15, 3, INK); box(c, hx + 2, y + 1, 13, 1, '#B91C1C'); }
  box(c, hx - 4, G - 6, 22, 4, INK); box(c, hx - 3, G - 5, 20, 2, '#A1A1AA');
  ink(c, () => c.arc(hx + 18, G - 6, 6, 0, Math.PI * 2), '#27272A'); box(c, hx + 17, G - 7, 2, 2, '#A1A1AA');
};

/** The mop bucket on its casters (a wringer, gray water), the mop leaned on the wall over it. */
const mopBucket = (c: Ctx) => {
  const x = 40, w = 28, t = G - 24;
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 18, G - 16); c.lineTo(x + 36, G - 64); c.stroke();
  c.strokeStyle = '#D6A35C'; c.lineWidth = 1; c.stroke();
  ink(c, () => c.rect(x, t, w, 18), '#EAB308');
  box(c, x + 1, t + 1, 3, 16, '#FDE047'); box(c, x + w - 4, t + 1, 3, 16, '#A16207'); box(c, x + 1, t + 1, w - 2, 2, '#4A5D58');
  box(c, x + 3, t + 8, w - 8, 3, '#A16207');
  ink(c, () => c.rect(x + w - 10, t - 10, 10, 11), '#71717A'); box(c, x + w - 9, t - 9, 2, 9, '#A1A1AA');
  box(c, x + 6, t - 6, 8, 7, '#C9BFA8'); for (let k = 0; k < 4; k++) box(c, x + 6 + k * 2, t - 6, 1, 7, '#9A8E74');
  for (const wx of [x + 4, x + w - 5]) { box(c, wx - 1, G - 6, 4, 6, INK); box(c, wx, G - 5, 2, 4, '#52525B'); }
  c.fillStyle = 'rgba(74, 93, 88, 0.6)'; c.beginPath(); c.ellipse(x + 14, G + 2, 18, 3, 0, 0, Math.PI * 2); c.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// The dumpster (round the right of the door, under the AC's drip)

const dithered = (c: Ctx, x: number, y: number, w: number, h: number, cs: string[]) => {
  const bh = h / cs.length;
  cs.forEach((col, i) => box(c, x, y + i * bh, w, bh + 1, col));
  for (let i = 1; i < cs.length; i++) { checker(c, x, Math.round(y + i * bh) - 2, w, 2, cs[i]); checker(c, x, Math.round(y + i * bh), w, 2, cs[i - 1], 1); }
};
/** A filthy green one, dented, rust bleeding down it, grime streaked down from under the lid; the lid propped up on the
 *  bags it can't shut on, more heaped on top and split, more on the ground round it, a leak gone into a puddle. */
const paintDumpster = (c: Ctx, x0: number) => {
  const { W, H } = DUMP, top = G - H;
  c.fillStyle = '#5B4A2A'; c.beginPath(); c.ellipse(x0 + W * 0.55, G + 6, 72, 7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#7A6436'; c.beginPath(); c.ellipse(x0 + W * 0.5, G + 5, 40, 3, 0, 0, Math.PI * 2); c.fill();
  ink(c, () => { c.moveTo(x0, top + 6); c.lineTo(x0 + W, top); c.lineTo(x0 + W - 6, G - 6); c.lineTo(x0 + 6, G - 6); c.closePath(); }, '#2F5D3A', 2);
  dithered(c, x0 + 6, top + 10, W - 14, H - 18, ['#3B6E46', '#336240', '#2B5638', '#244B30']);
  box(c, x0 + 6, top + 10, 4, H - 18, '#4C8159'); box(c, x0 + W - 14, top + 10, 6, H - 18, '#1E3F27');
  box(c, x0 + 4, top + 8, W - 8, 4, '#2B5638');
  for (let k = 1; k < 4; k++) box(c, x0 + k * (W / 4), top + 10, 2, H - 18, '#1E3F27');
  c.fillStyle = '#1E3F27'; c.beginPath(); c.ellipse(x0 + 38, top + 34, 10, 6, 0.3, 0, Math.PI * 2); c.fill();
  for (let k = 0; k < 7; k++) { const rx = x0 + 12 + k * 17, len = 10 + ((k * 13) % 22); box(c, rx, top + 12, 3, len, k % 2 ? '#8B4A1C' : '#6B3A18'); box(c, rx + 1, top + 12 + len, 1, 4, '#8B4A1C'); }
  for (let k = 0; k < 9; k++) box(c, x0 + 8 + k * 13, top + 12, 2, 6 + (k * 7) % 14, 'rgba(30, 24, 12, 0.55)');
  box(c, x0 + 82, top + 26, 26, 14, '#F5F5F4'); box(c, x0 + 82, top + 26, 26, 3, '#DC2626'); box(c, x0 + 96, top + 30, 12, 10, '#336240');
  for (const wx of [x0 + 14, x0 + W - 22]) { ink(c, () => c.arc(wx, G - 4, 5, 0, Math.PI * 2), '#18181B'); box(c, wx - 1, G - 5, 2, 2, '#52525B'); }
  box(c, x0 + 60, G - 6, 3, 4, '#5B4A2A');
  const bag = (bx: number, by: number, r: number, col: string, split = false) => {
    ink(c, () => { c.ellipse(bx, by, r, r * 0.82, 0, 0, Math.PI * 2); }, col);
    c.fillStyle = dark(col, 0.25); c.beginPath(); c.ellipse(bx + r * 0.2, by + r * 0.15, r * 0.75, r * 0.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(bx - r * 0.15, by - r * 0.12, r * 0.6, r * 0.48, 0, 0, Math.PI * 2); c.fill();
    box(c, bx - r * 0.5, by - r * 0.55, r * 0.5, 2, lite(col, 0.3)); box(c, bx - r * 0.45, by - r * 0.4, 2, 2, lite(col, 0.5));
    for (let k = 0; k < 3; k++) box(c, bx - r * 0.3 + k * r * 0.3, by + r * 0.2, 1, r * 0.4, dark(col, 0.4));
    c.fillStyle = dark(col, 0.4); c.beginPath(); c.moveTo(bx - 3, by - r * 0.8); c.lineTo(bx, by - r * 1.05); c.lineTo(bx + 3, by - r * 0.8); c.fill();
    if (split) { box(c, bx - 4, by + 1, 8, 4, '#E7E5E4'); box(c, bx + 2, by + 3, 5, 3, '#F59E0B'); box(c, bx - 6, by + 4, 4, 2, '#65A30D'); }
  };
  for (const [bx, by, r, col, sp] of [[x0 + 18, top - 6, 16, '#18181B', false], [x0 + 46, top - 12, 19, '#27272A', true], [x0 + 78, top - 9, 17, '#1F2937', false], [x0 + 106, top - 7, 15, '#14532D', true], [x0 + 60, top - 26, 14, '#18181B', false]] as const) bag(bx, by, r, col, sp);
  c.save(); c.translate(x0 + 2, top + 2); c.rotate(-0.42);
  ink(c, () => c.rect(0, -6, W - 4, 7), '#1F3B27', 2); box(c, 2, -5, W - 10, 2, '#2B5638');
  c.restore();
  for (const [bx, by, r, col, sp] of [[x0 - 8, G - 10, 12, '#27272A', true], [x0 + W + 8, G - 11, 14, '#18181B', false], [x0 + W + 30, G - 8, 10, '#1F2937', true]] as const) bag(bx, by, r, col, sp);
  ink(c, () => c.rect(x0 + W - 4, G - 4, 26, 4), '#D6A35C'); box(c, x0 + W + 2, G - 3, 8, 1, '#B91C1C');
  box(c, x0 + 24, G - 2, 8, 2, '#FACC15'); box(c, x0 + 22, G - 4, 3, 2, '#FACC15'); box(c, x0 + 31, G - 4, 3, 2, '#A16207');
  ink(c, () => c.rect(x0 + W + 44, G - 9, 6, 9), '#F8FAFC'); box(c, x0 + W + 44, G - 9, 6, 2, '#DC2626');
};

// ---------------------------------------------------------------------------------------------------------------
// Put down

const paintBuilding = (c: Ctx) => {
  paintWall(c);
  downspout(c);
  panelAndConduit(c);
  vent(c);
  windowAndAC(c);
  stencilSign(c);
  fireBell(c);
  notices(c);
  badgeReader(c);
  paintDoor(c);
  smokers(c);
  bins(c);
  boxesAndTruck(c);
  mopBucket(c);
};

/** Between Foreign Lands and Space Land: the back of the staff room's building, its STAFF ONLY door. */
export const drawStaffDoor = (ctx: Ctx, cx: number, f: number) => {
  ctx.translate(cx, 0);
  stamp(ctx, 'hubStaffBldg', X0 - 8, TOP - 42, X1 - X0 + 16, G - TOP + 50, paintBuilding);
  // (live: the steam out of the vent, curling up and thinning)
  for (let k = 0; k < 4; k++) {
    const t = ((f * 0.6 + k * 30) % 120) / 120, a = 0.5 * (1 - t);
    const sx = VENT.x + Math.sin(t * 5 + k) * 4 + t * 10, sy = VENT.y - 2 + t * 6 - t * t * 40 + 18 * t, r = 3 + t * 8;
    ctx.fillStyle = `rgba(226, 232, 240, ${a.toFixed(2)})`; ctx.fillRect(Math.round(sx - r), Math.round(sy - r * 0.6), Math.round(r * 2), Math.round(r * 1.2));
    ctx.fillStyle = `rgba(248, 250, 252, ${(a * 0.7).toFixed(2)})`; ctx.fillRect(Math.round(sx - r * 0.5), Math.round(sy - r * 0.6), Math.round(r), Math.round(r * 0.6));
  }
  // (the bulb in its cage, flickering; its light down over the door when it's on)
  const on = (f % 97) > 6 && (f % 31) > 2;
  if (on) { ctx.fillStyle = 'rgba(253, 230, 138, 0.16)'; ctx.beginPath(); ctx.moveTo(BULB.x - 6, BULB.y + 4); ctx.lineTo(BULB.x - 62, G); ctx.lineTo(BULB.x + 62, G); ctx.lineTo(BULB.x + 6, BULB.y + 4); ctx.fill(); }
  box(ctx, BULB.x - 3, BULB.y - 4, 6, 8, on ? '#FDE68A' : '#57534E'); if (on) box(ctx, BULB.x - 1, BULB.y - 3, 2, 3, '#FFFBEB');
  box(ctx, BULB.x - 7, BULB.y, 14, 1, '#1C1F24'); box(ctx, BULB.x, BULB.y - 7, 1, 14, '#1C1F24');
  // (the badge reader's LED: red, blinking; green now and then when nobody's there)
  const green = (f % 420) < 24;
  box(ctx, LED.x, LED.y, 2, 2, green ? '#22C55E' : (f % 60) < 30 ? '#EF4444' : '#5B1A1A');
  // (the sticky note on the door, flapping)
  ctx.save(); ctx.translate(-24, G - 58); ctx.rotate(Math.sin(f * 0.05) * 0.06);
  box(ctx, 0, 0, 18, 16, '#FDE047'); box(ctx, 0, 0, 18, 2, '#FEF08A'); ctx.fillStyle = '#1E3A8A'; ctx.font = '4px "Press Start 2P"'; ctx.fillText('NO', 2, 7); ctx.fillText('GUESTS', 2, 13);
  ctx.restore();
  ctx.translate(-cx, 0);
  // The dumpster, its stink and its flies; the AC dripping on its bags
  const x0 = cx + DUMP.x0, top = G - DUMP.H;
  ctx.translate(x0, 0); stamp(ctx, 'hubStaffDumpster', -30, top - 50, DUMP.W + 90, DUMP.H + 64, g => paintDumpster(g, 0)); ctx.translate(-x0, 0);
  const d = (f * 0.9) % 40; box(ctx, cx + AC.x0 + 31, AC.y + AC.h + 4 + d, 1, 3, '#7DD3FC');
  box(ctx, x0 + 61, G - 2 + ((f * 0.6) % 10) * 0.4, 2, 2, '#7A6436');
  for (let k = 0; k < 3; k++) { const t = ((f * 0.5 + k * 40) % 120) / 120; ctx.strokeStyle = `rgba(132, 204, 22, ${(0.45 * (1 - t)).toFixed(2)})`; ctx.lineWidth = 2; ctx.beginPath(); const sx = x0 + 30 + k * 34; for (let j = 0; j <= 6; j++) ctx.lineTo(sx + Math.sin(j * 1.3 + f * 0.05 + k) * 5, top - 20 - t * 40 - j * 6); ctx.stroke(); }
  for (let k = 0; k < 7; k++) { const a = f * (0.09 + k * 0.012) + k * 2.1; box(ctx, x0 + DUMP.W / 2 + Math.cos(a) * (40 + k * 5), top - 18 + Math.sin(a * 1.7) * 18, 2, 2, '#0A0A0A'); }
};
/** How far either side of its middle it reaches (for culling by what's on screen). */
export const STAFF_REACH = 290;
