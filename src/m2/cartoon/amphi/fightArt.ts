// STUPID DAD's fight, drawn (fight.ts runs it): the stolen PUNCHY & KICKY mallet, the fridge (avocado green, 1975, the
// show's), the beer bottles the family throws, the puke, the couch flying (and crushed), the stunt cars' wrecks and what's
// left of each of the family under one, the living room's side walls (the right one always; the left one flown in from
// the grid as the intro starts, so the room's shut while they fight), his pancake (the weakness death) and the SWILL LITE
// avalanche (the standard one). At Meathead 2's boss grade where it's his (paint.ts ramps, stepped, an outline in each
// material's darkest tone); the cars are the clapperboard's own (weapons/stuntCar.ts).

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { drawStuntCar, drawStuntman, STUNT_PAINT, STUNT_CAR_SCALE } from '../../weapons/stuntCar';
import { type Ctx, type Ramp, shape, ell, px, line, fill, sparks } from './paint';
import { DAD_K, drawCouch, drawDad, can } from './dad';
import { drawMom, drawGramps, drawSis, drawBoy, type Anim } from './family';
import { X, STAGE_Y, D_SET } from './layout';
import { NR, WALLP, PANELS, PLY, INK, box } from './mats';

// ---------------------------------------------------------------------------------------------------------------
// The eye (the one the whole amphitheater's drawn to: the middle of the screen)

export type P = { x: number; y: number };
export const eyeOf = (state: GameState): P => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT / 2 });
export const proj = (E: P, x: number, y: number, s: number): P => ({ x: E.x + (x - E.x) * s, y: E.y + (y - E.y) * s });
export const atDepth = (c: Ctx, E: P, s: number, fn: () => void) => { if (s === 1) { fn(); return; } c.save(); c.translate(E.x, E.y); c.scale(s, s); c.translate(-E.x, -E.y); fn(); c.restore(); };

// ---------------------------------------------------------------------------------------------------------------
// The mallet (PUNCHY & KICKY's, off the robot cat by the gate: a barrel of a head, red, yellow bands, a dent in it, the
// park's property tag still wired to the handle). In his units, the grip at the origin, the head up along -y.

const WOOD: Ramp = ['#E8C48A', '#C8955A', '#A0703A', '#7A5026', '#3A240E'];
const HEADR: Ramp = ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'];
const BAND: Ramp = ['#FFF4A8', '#FDE047', '#E0B820', '#B08A10', '#5A4404'];
export const drawMallet = (c: Ctx, flat = 1) => {
  // (the handle: long, a grip wrap at the bottom, the tag)
  shape(c, () => c.roundRect(-3, -74, 6, 88, 2), WOOD, -3, 3, 0.8);
  for (let k = 0; k < 4; k++) px(c, -3, 2 + k * 3, 6, 1.4, k % 2 ? '#2A2A30' : '#44444C');
  line(c, [3, -30, 7, -24], 0.5, '#9AA0A8'); shape(c, () => c.rect(5, -24, 7, 5), ['#FFFFFF', '#F4F1E8', '#D8D2C2', '#A8A292', '#5A564C'], 5, 12, 0.5); px(c, 6, -22.6, 5, 0.6, '#C8102E');
  // (the head: a fat barrel across the top of the handle (squashed flat with him, for the pancake))
  c.save(); c.translate(0, -88); c.scale(1, flat);
  shape(c, () => c.roundRect(-28, -17, 56, 34, 6), HEADR, -28, 28);
  for (const s of [-1, 1]) { shape(c, () => c.rect(s > 0 ? 18 : -24, -17, 6, 34), BAND, s > 0 ? 18 : -24, s > 0 ? 24 : -18, 0.6); shape(c, () => c.ellipse(s * 28, 0, 4, 17, 0, 0, Math.PI * 2), ['#F7A3B0', '#DE6178', '#BE4260', '#932C49', '#4A0F20'], s * 28 - 4, s * 28 + 4, 0.8); }
  // (P&K stenciled on it, a dent with a highlight round it, the shine)
  // (P, a dot, K)
  px(c, -12, -6, 2.4, 10, '#FDE047'); px(c, -10, -6, 4, 2, '#FDE047'); px(c, -7, -5, 2, 4, '#FDE047'); px(c, -10, -1.4, 4, 2, '#FDE047');
  px(c, -2, 1, 2.4, 2.4, '#FDE047');
  px(c, 3, -6, 2.4, 10, '#FDE047'); line(c, [5.4, -1, 10, -6], 2, '#FDE047'); line(c, [5.4, -1, 10, 4], 2, '#FDE047');
  ell(c, 10, 8, 4, 3, HEADR[3]); ell(c, 9, 7, 2, 1.2, HEADR[0]);
  px(c, -16, -14, 30, 3, 'rgba(255,255,255,0.35)');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The fridge: avocado green, chrome handles, magnets (#1 DAD), a crayon drawing of the family (Dad big, everybody else
// tiny), a twelve-pack of SWILL LITE on top. `open` 0..1 (the door swung out left, its inside packed with bottles and
// cans); `tilt` (knocked by the couch), `stuffed`: so full it's bulging (the avalanche's).

const AVO: Ramp = ['#B8C46A', '#8E9A3E', '#6E7A2A', '#525C1C', '#1E2408'];
const CHROME: Ramp = ['#FFFFFF', '#D4D8E0', '#A8AEB8', '#7A8088', '#2A2E34'];
export const drawFridge = (c: Ctx, x: number, floorY: number, f: number, o: { open?: number; tilt?: number; stuffed?: boolean } = {}) => {
  const open = Math.max(0, Math.min(1, o.open ?? 0));
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.rotate(o.tilt ?? 0); c.scale(DAD_K, DAD_K);
  const W = 70, H = 150, L = -W / 2;
  // (the body, its feet, the grille at the foot)
  shape(c, () => c.roundRect(L, -H, W, H, 6), AVO, L, L + W);
  px(c, L + 6, -8, W - 12, 6, '#2A2E20'); for (let k = 0; k < 8; k++) px(c, L + 8 + k * 7, -7, 4, 4, '#4A5030');
  // (inside: lit, the shelves packed with brown bottles and red cans; only what the door's swung off of shows)
  if (open > 0) {
    const ix = L + 5, iw = W - 10;
    box(c, ix, -H + 50, iw, H - 62, '#FFF6D8'); box(c, ix, -H + 50, iw, 4, '#FFFFFF');
    for (let r = 0; r < 4; r++) {
      const sy = -H + 74 + r * 22;
      box(c, ix, sy, iw, 2, '#C8CCD4');
      for (let k = 0; k < 8; k++) {
        const bx = ix + 3 + k * 7.6;
        if ((r + k) % 3 === 0) { px(c, bx, sy - 15, 6, 15, '#C8102E'); px(c, bx, sy - 11, 6, 3, '#F4F1E8'); px(c, bx, sy - 16, 6, 1.4, '#C9CDD4'); }
        else { px(c, bx + 1, sy - 18, 4, 18, '#6A3A12'); px(c, bx + 2, sy - 22, 2, 5, '#6A3A12'); px(c, bx + 1, sy - 10, 4, 4, '#E8D8A0'); px(c, bx + 2, sy - 17, 1, 8, 'rgba(255,220,160,0.5)'); }
      }
    }
    if (o.stuffed) for (let k = 0; k < 14; k++) can(c, ix + 6 + (k * 13) % (iw - 10), -H + 60 + ((k * 29) % 80), k * 0.7);
  }
  // (the freezer door, the main door: swung out to the left on its hinge, foreshortened)
  shape(c, () => c.roundRect(L + 2, -H + 2, W - 4, 44, 4), AVO, L, L + W);
  px(c, L + W - 12, -H + 14, 4, 22, CHROME[2]); px(c, L + W - 12, -H + 14, 1.4, 22, CHROME[0]);
  const dw = (W - 4) * Math.cos(open * Math.PI * 0.46);
  if (dw > 2) {
    shape(c, () => c.roundRect(L + 2, -H + 50, dw, H - 62, 4), AVO, L + 2, L + 2 + dw);
    if (open < 0.4) {
      const k = dw / (W - 4);
      px(c, L + 2 + dw - 10 * k, -H + 62, 4 * k, 40, CHROME[2]); px(c, L + 2 + dw - 10 * k, -H + 62, 1.4 * k, 40, CHROME[0]);
      // (the magnets: #1 DAD, a pizza slice; the crayon drawing: a huge dad, the family in a row at his feet, tiny)
      px(c, L + 8 * k, -H + 58, 14 * k, 8, '#1E3A8A'); px(c, L + 10 * k, -H + 60, 3 * k, 4, '#FDE047'); px(c, L + 14 * k, -H + 60, 5 * k, 4, '#FDE047');
      fill(c, '#F2B33D', () => { c.moveTo(L + 30 * k, -H + 56); c.lineTo(L + 40 * k, -H + 56); c.lineTo(L + 35 * k, -H + 68); c.closePath(); }); px(c, L + 33 * k, -H + 58, 2 * k, 2, '#C8102E');
      px(c, L + 10 * k, -H + 76, 30 * k, 38, '#FBF7EE'); px(c, L + 10 * k, -H + 76, 30 * k, 1, '#FFFFFF');
      line(c, [L + 25 * k, -H + 80, L + 25 * k, -H + 100], 2, '#C8102E'); ell(c, L + 25 * k, -H + 82, 4 * k + 0.5, 4, '#F2B33D');
      for (let j = 0; j < 4; j++) { line(c, [L + (13 + j * 7) * k, -H + 106, L + (13 + j * 7) * k, -H + 111], 1, ['#2563EB', '#16A34A', '#DB2777', '#7C3AED'][j]); ell(c, L + (13 + j * 7) * k, -H + 105, 1.2, 1.2, '#F2B33D'); }
    }
  }
  // (on top: a twelve-pack of SWILL LITE, its cardboard torn open)
  shape(c, () => c.rect(L + 10, -H - 16, 40, 16), ['#F4F1E8', '#E2DCC8', '#C8C0A8', '#9A9280', '#4A463C'], L + 10, L + 50, 0.8);
  px(c, L + 12, -H - 12, 36, 4, '#C8102E'); px(c, L + 16, -H - 11, 2, 2, '#F4F1E8'); px(c, L + 22, -H - 11, 2, 2, '#F4F1E8'); px(c, L + 28, -H - 11, 2, 2, '#F4F1E8');
  for (let k = 0; k < 3; k++) px(c, L + 34 + k * 5, -H - 20, 4, 5, '#C8102E');
  // (stuffed: the door bowed out by what's behind it, a can's rim poking out of the seal)
  if (o.stuffed && open === 0) { px(c, L + W - 4, -H + 70, 3, 40, AVO[0]); px(c, L + W - 2, -H + 90, 4, 3, '#C8102E'); }
  // (knocked: the bottles inside rattling, a hum)
  if ((o.tilt ?? 0) !== 0 && f % 4 < 2) px(c, L + W - 8, -H + 4, 4, 1, CHROME[0]);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The beer: a brown longneck (world px), tumbling; its smash is the fight's particles

export const drawBottle = (c: Ctx, x: number, y: number, rot: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
  px(c, -3, -6, 6, 12, INK); px(c, -2, -6, 4, 12, '#7A4214'); px(c, -2, -6, 1, 12, '#B87A3A');
  px(c, -1.5, -11, 3, 5, INK); px(c, -1, -11, 2, 5, '#7A4214'); px(c, -1.5, -12, 3, 1.4, '#E0B820');
  px(c, -2, -2, 4, 4, '#F4E8C0'); px(c, -1, -1, 2, 1, '#C8102E');
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The puke: chunky, beer-yellow and bile-green in steps; a puddle where it lands

const PUKE = ['#5A6A10', '#8A9A1E', '#B8C43A', '#E2E87A'];
export const drawDrop = (c: Ctx, x: number, y: number, r: number, k: number) => {
  const cx = Math.round(x), cy = Math.round(y);
  ell(c, cx, cy, r + 1, r * 0.8 + 1, PUKE[0]); ell(c, cx, cy, r, r * 0.8, PUKE[k % 2 ? 1 : 2]); px(c, cx - r * 0.4, cy - r * 0.4, Math.max(1, r * 0.5), Math.max(1, r * 0.4), PUKE[3]);
  if (k % 3 === 0) px(c, cx + 1, cy, 2, 2, '#D88A3A');
};
export const drawPuddle = (c: Ctx, x: number, y: number, w: number, a: number) => {
  c.globalAlpha = Math.max(0, Math.min(1, a));
  ell(c, x, y, w, w * 0.18, PUKE[0]); ell(c, x - 1, y - 0.5, w * 0.8, w * 0.13, PUKE[1]); px(c, x - w * 0.4, y - 1, w * 0.3, 1, PUKE[3]);
  c.globalAlpha = 1;
};

// ---------------------------------------------------------------------------------------------------------------
// The couch: flying (tipped, squashed as it bounces), crushed (folded in the middle under a stunt car, stuffing out)

export const drawCouchAt = (c: Ctx, x: number, floorY: number, f: number, o: { rot?: number; squash?: number; crushed?: boolean; empty?: boolean } = {}) => {
  if (o.crushed) {
    // (snapped in the middle: each half tipped in toward the break, the frame's ends up, the stuffing out of it)
    for (const s of [-1, 1]) {
      c.save(); c.translate(Math.round(x), Math.round(floorY));
      c.beginPath(); c.rect(s < 0 ? -140 : 0, -140, 140, 160); c.clip();
      c.rotate(s * 0.22); c.translate(-s * 4, 6);
      drawCouch(c, 0, 0, f, { empty: true });
      c.restore();
    }
    for (let k = 0; k < 9; k++) ell(c, x - 16 + (k * 37) % 34, floorY - 18 - (k * 13) % 14, 4 + (k % 3), 3, k % 2 ? '#F4EFE2' : '#FFFFFF');
    line(c, [x - 6, floorY - 30, x - 2, floorY - 40, x + 3, floorY - 32], 1.6, '#5A4A3A');
    return;
  }
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.rotate(o.rot ?? 0); c.scale(1 + (o.squash ?? 0) * 0.12, 1 - (o.squash ?? 0) * 0.16);
  drawCouch(c, 0, 0, f, { empty: o.empty });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The stunt cars (the clapperboard's, a size down to the set's scale), the wrecks they leave (on their roofs, burning,
// then smoking for good), the stuntman flung out and his splat on the wallpaper

export const CAR_K = 0.62;
export const drawCarAt = (c: Ctx, x: number, y: number, dir: 1 | -1, wheel: number, rot: number, paint: number, driver = true) => {
  c.save(); c.translate(x, y); c.scale(CAR_K, CAR_K);
  drawStuntCar(c, 0, 0, dir, wheel, rot, STUNT_PAINT[paint % STUNT_PAINT.length], driver);
  c.restore();
};
export const drawWreck = (c: Ctx, x: number, floorY: number, dir: 1 | -1, paint: number, t: number, f: number) => {
  drawCarAt(c, x, floorY - 16 * STUNT_CAR_SCALE * CAR_K, dir, 0, Math.PI, paint, false);
  // (burning a while: stepped flames off the underside; then just a curl of smoke now and then (the particles))
  if (t < 260) {
    const n = t < 140 ? 5 : 2;
    for (let k = 0; k < n; k++) {
      const fx = x - 40 + k * 20 + Math.sin(f * 0.3 + k) * 3, h = 10 + ((f * 3 + k * 17) % 12);
      fill(c, '#F97316', () => { c.moveTo(fx - 5, floorY - 30); c.lineTo(fx, floorY - 30 - h); c.lineTo(fx + 5, floorY - 30); c.closePath(); });
      fill(c, '#FDE047', () => { c.moveTo(fx - 2.4, floorY - 30); c.lineTo(fx, floorY - 30 - h * 0.55); c.lineTo(fx + 2.4, floorY - 30); c.closePath(); });
    }
  }
};
export const drawStuntmanAt = (c: Ctx, x: number, y: number, dir: 1 | -1, rot: number, pose: 'tumble' | 'down' | 'up' | 'dive') => {
  c.save(); c.translate(x, y); c.scale(0.8, 0.8); drawStuntman(c, 0, 0, dir, rot, pose); c.restore();
};
/** A stuntman's splat on the set's wallpaper (world, at the wall's depth: drawn there by the caller). */
export const drawWallSplat = (c: Ctx, x: number, y: number, seed: number) => {
  for (let k = 0; k < 7; k++) { const a = seed * 2.1 + k * 0.9, r = 4 + ((seed * 7 + k * 5) % 7); ell(c, x + Math.cos(a) * 10, y + Math.sin(a) * 8, r, r * 0.8, k % 2 ? '#7F1D1D' : '#991B1B'); }
  for (let k = 0; k < 4; k++) px(c, x - 8 + k * 5, y + 6, 2, 10 + ((seed + k * 3) % 14), '#7F1D1D');
  ell(c, x, y, 7, 6, '#B91C1C');
};

// ---------------------------------------------------------------------------------------------------------------
// What's left of one of the family after a stunt car: the animatronic knocked flat (powered down, jaw hanging), its
// bits round it (a glass eye, the wig, a hand on its wires, the cable sparking), MOM's casserole all over the floor

export type Member = 'mom' | 'boy' | 'sis' | 'gramps';
const WIGS: Record<Member, string> = { mom: '#8A4A1C', boy: '#7A5A3A', sis: '#C2873A', gramps: '#F4F4F0' };
export const drawMember = (c: Ctx, who: Member, x: number, floorY: number, a: Anim, arm = 0, beer = false) => {
  if (who === 'mom') drawMom(c, x, floorY, a);
  else if (who === 'gramps') drawGramps(c, x, floorY, a);
  else if (who === 'sis') drawSis(c, x, floorY, a);
  else drawBoy(c, x, floorY, a, arm, beer);
};
export const drawDeadMember = (c: Ctx, who: Member, x: number, floorY: number, f: number, dir: 1 | -1) => {
  const off: Anim = { mode: 'off', f: 0, talking: false };
  c.save(); c.translate(x + dir * 30, floorY - 4); c.rotate(dir * 1.45); c.translate(0, 0);
  drawMember(c, who, 0, 0, off);
  c.restore();
  // (the bits)
  const bx = x - dir * 36;
  ell(c, bx, floorY - 3, 3.4, 3.4, '#FBFBF8'); ell(c, bx - 0.6, floorY - 3, 1.6, 1.6, '#2A4A6A');
  ell(c, bx + dir * 70, floorY - 3, 9, 4, WIGS[who]); ell(c, bx + dir * 68, floorY - 5, 5, 2, '#FFFFFF33');
  line(c, [bx - dir * 20, floorY - 2, bx - dir * 30, floorY - 10, bx - dir * 26, floorY - 4], 1.4, '#1C1C1C');
  if (who === 'mom') { ell(c, bx + dir * 20, floorY - 1, 16, 3, '#C24A2A'); ell(c, bx + dir * 14, floorY - 2, 6, 2, '#F2C94C'); }
  if ((f + x) % 50 < 6) sparks(c, bx - dir * 28, floorY - 10, f);
};

// ---------------------------------------------------------------------------------------------------------------
// The living room's side walls: plywood flats, wallpapered inside, the paneling at the foot, running back from the play
// plane at world x `near` to the set's wall at `far` (D_SET). `drop`: the left one flown in (0 up in the grid .. 1 down
// on the deck), hung off its two lines.

export const drawSideWall = (c: Ctx, E: P, near: number, far: number, drop = 1) => {
  const off = (1 - drop) * 300, top = STAGE_Y - 180 - off, rail = STAGE_Y - 56 - off, foot = STAGE_Y - off;
  const q = (pts: P[], col: string | CanvasPattern) => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) c.lineTo(p.x, p.y); c.closePath(); c.fillStyle = col; c.fill(); };
  const at = (u: number, y: number) => { const d = 1 + (D_SET - 1) * u, x = near + (far - near) * u; return proj(E, X(x), y, d); };
  // (the inside face seen when the eye's on the room's side of it; else the flat's bare back, battens and all)
  const inside = far > near ? E.x > X(near) : E.x < X(near);
  const Wp = NR(WALLP), Pn = NR(PANELS), Pl = NR(PLY), N = 8;
  for (let i = 0; i < N; i++) {
    const u0 = i / N, u1 = (i + 1) / N;
    const shade = (r: string[]) => r[Math.max(1, Math.min(r.length - 2, 3 - Math.floor(i / 3)))];
    if (inside) {
      q([at(u0, top), at(u1, top), at(u1, rail), at(u0, rail)], shade(Wp));
      q([at(u0, rail), at(u1, rail), at(u1, foot), at(u0, foot)], shade(Pn));
      // (the diamonds down the middle of each strip)
      for (let y = top + 22; y < rail - 8; y += 28) { const p = at((u0 + u1) / 2, y); box(c, p.x - 2, p.y - 3, 4, 6, Wp[2]); box(c, p.x - 2, p.y - 3, 2, 2, Wp[4]); }
    } else {
      q([at(u0, top), at(u1, top), at(u1, foot), at(u0, foot)], shade(Pl));
      const p = at((u0 + u1) / 2, top), b = at((u0 + u1) / 2, foot); box(c, p.x - 1, p.y, 2, b.y - p.y, Pl[1]);
    }
  }
  // (its top edge lit, its near edge in ink, the chair rail)
  const a0 = at(0, top), a1 = at(1, top), f0 = at(0, foot), r0 = at(0, rail), r1 = at(1, rail);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(f0.x, f0.y); c.lineTo(a0.x, a0.y); c.lineTo(a1.x, a1.y); c.stroke();
  c.strokeStyle = Pl[5]; c.lineWidth = 1; c.beginPath(); c.moveTo(a0.x, a0.y + 1); c.lineTo(a1.x, a1.y + 1); c.stroke();
  if (inside) { c.strokeStyle = Pn[4]; c.lineWidth = 2; c.beginPath(); c.moveTo(r0.x, r0.y); c.lineTo(r1.x, r1.y); c.stroke(); }
  // (flown: the lines up to the grid)
  if (drop < 1) for (const u of [0.15, 0.85]) { const p = at(u, top); c.strokeStyle = '#2A2A30'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x, p.y - 600); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------
// The deaths

/** The weakness death: flattened under the last stunt car, a pancake of a man on the deck (his mallet flat beside
 *  him), fluttering at the edges. */
export const drawPancake = (c: Ctx, x: number, floorY: number, f: number, flutter: number, facing: 1 | -1) => {
  // (the shadow, the outline of him spread out)
  ell(c, x, floorY - 1, 92, 6, 'rgba(0,0,0,0.25)');
  c.save(); c.translate(Math.round(x), Math.round(floorY - 2)); c.scale(1.7 * (facing === 1 ? -1 : 1), 0.12 + Math.sin(f * 0.4) * 0.012 * flutter);
  c.rotate(-Math.PI / 2 * 0); drawDad(c, 0, 0, 'stand', f, { face: 'out', can: null, sway: 0 });
  c.restore();
  // (the edges lifting in the draft, his head the size of a dinner plate, the eyes two dots, the can flat too)
  if (flutter > 0) for (let k = 0; k < 3; k++) { const ex = x - 80 + k * 80, lift = Math.max(0, Math.sin(f * 0.25 + k * 2)) * 4 * flutter; px(c, ex - 8, floorY - 4 - lift, 16, 2, '#EFBFA6'); }
  ell(c, x - facing * 64, floorY - 4, 14, 3, '#EFBFA6'); px(c, x - facing * 68, floorY - 5, 1.6, 1.6, '#1A1A1A'); px(c, x - facing * 61, floorY - 5, 1.6, 1.6, '#1A1A1A');
  c.save(); c.translate(x + facing * 90, floorY - 2); c.rotate(facing * Math.PI / 2); c.scale(DAD_K, DAD_K); drawMallet(c, 0.25); c.restore();
  can(c, x + facing * 30, floorY - 2, Math.PI / 2, 1);
};

/** A can in the avalanche (world). */
export interface PileCan { x: number; y: number; vx: number; vy: number; rot: number; vr: number; still: boolean }
export const drawPile = (c: Ctx, cans: PileCan[]) => { for (const k of cans) can(c, k.x, k.y, k.rot, 0, false); };
/** The brown seep out from under the pile. */
export const drawSeep = (c: Ctx, x: number, floorY: number, w: number) => {
  if (w <= 0) return;
  ell(c, x, floorY, w, w * 0.16, '#4A2A0A'); ell(c, x - 2, floorY - 0.6, w * 0.7, w * 0.1, '#6A3E12'); px(c, x - w * 0.3, floorY - 1, w * 0.2, 1, '#8A5A20');
};
/** The blood out from under the fridge (his standard death): a dark pool, a wet highlight. */
export const drawBlood = (c: Ctx, x: number, floorY: number, w: number) => {
  if (w <= 0) return;
  ell(c, x, floorY, w * 2, w * 0.3, '#5A0A10'); ell(c, x - 3, floorY - 0.6, w * 1.5, w * 0.2, '#8A1018'); px(c, x - w * 0.8, floorY - 1, w * 0.4, 1, '#C8303A');
};
