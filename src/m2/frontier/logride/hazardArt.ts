// What's out to get him on the ride, drawn (peak SNES). Every drawn edge sits exactly where it hits (hazards.ts): a saw's
// teeth reach r + 6 from its middle; the ducks' saws, the sewer's lowest pipe and the river's low limb all come down to
// DUCK_LINE over the water and no lower; the swing's arm brings its teeth to that line (and the lift hill's clamp).
//
// The saws: steel discs in rings (banded, the gullets dark, expansion slots, carbide tips catching the light), turned
// with their spin (each painted once and put down turned), a fixed sheen over them, a blur where they spin, hubs
// hazard-striped; their mounts: a timber header and a riveted striped bulkhead down to the saw (a wall to duck under,
// not a bar to jump), the swing's gantry on I-beam legs and its arm, the drop's guide rails and motor box (its red lamp
// and sparks as it shudders), the rail's track along the trough's edge and its stop. The giant cutter. The park's
// animatronics (fiberglass and fur, a neck bolt, a mold seam), and cut in two: the shell, the steel armature, wires.
// The sewer's pipes (a stack on a rusted hanger, hazard tape round the lowest and a caged work lamp lighting it), its
// outfalls (the bell mouth, slime, the plate and the lamp going amber, then red, the build, the pour), its busted
// sections (a concrete culvert section end-on and half sunk, rebar, a barricade blinker), the river's rocks (real
// granite, moss and lichen, the water piling white on them), its low limbs (a real tree down from the near bank, its
// crown a wall of leaves over one great limb flat across, scraped pale under). No words on any of them.

import type { GameState } from '../../../m1/game/core/state';
import { signText } from '../../signLetters';
import { steppedGlow } from '../../intro/art/kit';
import { onScreen, painted } from '../kit';
import { type Ctx, box, checker, mix, hash, still, stillAt, clump, part, rampOf, INK, hr, asIs, STEEL as STEELR, PLANK, BARK, CONCRETE, RUST, MOSS, GRANITE, SLUDGE, OAK, FIBER, RIVER } from './paint';
import { rideOf } from './state';
import { X, waterY, ROCKS, BRANCHES, GUSHERS, PIPES, CUTTER_X, DUCK_LINE, type PropKind } from './layout';
import { SWING_TOP, SLAM, PIPE_R, LIMB_W } from './hazards';
import { GY } from '../geometry';

const STRIPE_Y = ['#5A4404', '#8E6C08', '#C89A10', '#F2C21A', '#FAD84A', '#FFF0A0'], STRIPE_K = '#1C1917';
const S = asIs(STEELR);

// ---------------------------------------------------------------------------------------------------------------
// The saw

/** A saw's disc and teeth, still (local: its middle at the origin; turned with its spin when put down). */
const paintSaw = (g: Ctx, r: number, jam: boolean) => {
  const teeth = Math.max(10, Math.round(r * 0.75));
  // (the teeth: inked to r + 6, steel to r + 4, raked; a carbide tip on each)
  g.fillStyle = INK; g.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r + 1 : r + 6; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  g.fillStyle = S[4]; g.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? r - 1 : r + 4; if (jam && i === 3) { g.lineTo(Math.cos(a) * (r - 2), Math.sin(a) * (r - 2)); continue; } g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  for (let i = 0; i < teeth; i++) { if (jam && i === 1) continue; const a = ((i * 2) / (teeth * 2)) * Math.PI * 2; box(g, Math.cos(a) * (r + 3) - 1, Math.sin(a) * (r + 3) - 1, 2, 2, i % 2 ? S[6] : S[2]); }
  // (the plate in rings, banded, a groove; expansion slots with their end holes)
  const ring = (k: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(0, 0, r * k, 0, Math.PI * 2); g.fill(); };
  ring(0.86, S[2]); ring(0.8, S[3]); ring(0.62, mix(S[3], S[4], 0.5)); ring(0.56, S[3]); ring(0.42, S[4]);
  g.strokeStyle = S[1]; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r * 0.7, 0, Math.PI * 2); g.stroke();
  if (r > 12) for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2 + 0.4; g.strokeStyle = INK; g.lineWidth = Math.max(1, r * 0.06); g.beginPath(); g.moveTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86); g.lineTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, Math.max(1, r * 0.06), 0, Math.PI * 2); g.fill(); }
  if (jam) { g.fillStyle = '#5A3A22'; g.beginPath(); g.arc(r * 0.3, -r * 0.2, r * 0.2, 0, Math.PI * 2); g.fill(); }
};

/** A buzzsaw: its teeth round a steel disc (to r + 6, exactly as far as it cuts), turned by `spin`, the sheen fixed over
 *  it, the blur of its spin, its striped hub. Jammed: still, smoking, a tooth gone. */
export const drawSawDisc = (c: Ctx, x: number, y: number, r: number, spin: number, jam = 0) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(spin);
  still(c, `lr-saw-${r}-${jam ? 1 : 0}`, -r - 8, -r - 8, r * 2 + 16, r * 2 + 16, g => paintSaw(g, r, !!jam));
  c.restore();
  // (the sheen: the light off the upper left, staying put while it turns)
  c.globalAlpha = 0.5; c.fillStyle = S[6];
  c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * 0.78, Math.PI * 1.08, Math.PI * 1.32); c.closePath(); c.fill();
  c.globalAlpha = 0.25; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * 0.78, Math.PI * 0.08, Math.PI * 0.2); c.closePath(); c.fill();
  c.globalAlpha = 1;
  // (the spin's blur arcs; jammed, none: smoke instead)
  if (!jam) {
    c.strokeStyle = 'rgba(241, 245, 249, 0.4)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r + 2, spin % 6, (spin % 6) + 2.2); c.stroke();
    c.strokeStyle = 'rgba(241, 245, 249, 0.22)'; c.beginPath(); c.arc(x, y, r * 0.66, (spin % 6) + 3, (spin % 6) + 4.6); c.stroke();
  } else for (let i = 0; i < 3; i++) { const t = ((jam * 0.02 + i / 3) % 1); c.globalAlpha = 0.5 * (1 - t); c.fillStyle = t < 0.5 ? '#8A8A92' : '#6A6A72'; c.fillRect(Math.round(x + Math.sin(t * 6 + i) * 4 - 4 - t * 8), Math.round(y - r * 0.4 - t * 40 - 4 - t * 8), Math.round(8 + t * 16), Math.round(8 + t * 14)); c.globalAlpha = 1; }
  // (the hub: hazard-striped, its nut)
  const hr0 = r * 0.3;
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, hr0 + 1.5, 0, Math.PI * 2); c.fill();
  c.fillStyle = STRIPE_Y[3]; c.beginPath(); c.arc(x, y, hr0, 0, Math.PI * 2); c.fill();
  c.fillStyle = STRIPE_K; c.beginPath(); c.moveTo(x, y); c.arc(x, y, hr0, spin, spin + Math.PI / 2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x, y); c.arc(x, y, hr0, spin + Math.PI, spin + Math.PI * 1.5); c.closePath(); c.fill();
  box(c, x - 2, y - 2, 4, 4, S[3]); box(c, x - 2, y - 2, 2, 2, S[5]);
};

/** A hazard-striped plate (a saw's mount, a beam): inked, lit along its top and left, the stripes, a shaded foot. */
export const stripes = (c: Ctx, x: number, y: number, w: number, h: number) => {
  box(c, x - 1, y - 1, w + 2, h + 2, INK); box(c, x, y, w, h, STRIPE_Y[3]);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = STRIPE_K; for (let k = -h; k < w + h; k += 10) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + 5, y + h); c.lineTo(x + k + 5 + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); }
  c.restore();
  box(c, x, y, w, 1, STRIPE_Y[5]); box(c, x, y, 1, h, 'rgba(255, 240, 160, 0.5)');
  if (h > 4) box(c, x, y + h - 1, w, 1, 'rgba(0, 0, 0, 0.45)');
  if (w > 4) box(c, x + w - 1, y, 1, h, 'rgba(0, 0, 0, 0.35)');
};
/** A steel arm from a to b (inked, its shade, its body, a lit edge along its top). */
const arm = (c: Ctx, ax: number, ay: number, bx: number, by: number, w = 6) => {
  c.lineCap = 'butt';
  c.strokeStyle = INK; c.lineWidth = w + 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  c.strokeStyle = S[2]; c.lineWidth = w; c.stroke();
  c.strokeStyle = S[4]; c.lineWidth = w * 0.5; c.beginPath(); c.moveTo(ax - 1, ay - w / 4); c.lineTo(bx - 1, by - w / 4); c.stroke();
  c.strokeStyle = S[6]; c.lineWidth = 1; c.beginPath(); c.moveTo(ax - 1, ay - w / 3); c.lineTo(bx - 1, by - w / 3); c.stroke();
};
/** A steel I-beam post, stepped (flanges lit down the left). */
const ibeam = (c: Ctx, x: number, top: number, foot: number, w = 10) => {
  box(c, x - 1, top, w + 2, foot - top, INK); box(c, x, top, w, foot - top, S[3]); box(c, x, top, 2, foot - top, S[5]); box(c, x + w - 2, top, 2, foot - top, S[1]);
  box(c, x + 3, top, w - 6, foot - top, S[2]); box(c, x + 3, top, 1, foot - top, S[4]);
  for (let y = top + 10; y < foot; y += 24) { box(c, x + 1, y, 2, 2, INK); box(c, x + w - 3, y, 2, 2, INK); }
};
/** A row of rivets down a plate's edges. */
const rivetCol = (c: Ctx, x: number, y0: number, y1: number) => { for (let y = y0 + 4; y < y1 - 2; y += 10) { box(c, x, y, 3, 3, INK); box(c, x, y, 2, 2, S[5]); } };

/** Behind the log: the saws' mounts, the gantries, the rails, the saws that are behind the trough's front wall. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame, P = asIs(PLANK);
  for (const s of r.saws) {
    if (!onScreen(state, X(s.x) - 260, X(s.x) + 260)) continue;
    const wy = waterY(s.x), sx = X(s.x);
    switch (s.type) {
      case 'wall': {
        // (a timber header across the overhead, a riveted hazard-striped bulkhead hung down off it to head height, the
        // saw's motor housing at its foot, the saw: a wall to duck under, not a bar to jump)
        box(c, sx - 41, wy - 301, 82, 16, INK); box(c, sx - 40, wy - 300, 80, 14, P[3]); box(c, sx - 40, wy - 300, 80, 3, P[5]); box(c, sx - 40, wy - 289, 80, 3, P[1]);
        for (const bx of [sx - 34, sx + 30]) { box(c, bx, wy - 296, 4, 4, INK); box(c, bx, wy - 296, 2, 2, S[5]); }
        const top = wy - 286, bot = s.cy;
        box(c, sx - 31, top, 3, bot - top, S[2]); box(c, sx + 28, top, 3, bot - top, S[1]);
        stripes(c, sx - 28, top, 56, bot - top);
        rivetCol(c, sx - 26, top, bot); rivetCol(c, sx + 23, top, bot);
        box(c, sx - 15, bot - 14, 30, 12, INK); box(c, sx - 14, bot - 13, 28, 10, S[2]); box(c, sx - 14, bot - 13, 28, 2, S[4]);
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      }
      case 'swing': {
        // (the gantry over the trough: a striped beam on I-beam legs, the pivot plate, the pendulum's arm down from it)
        const gy = wy - SWING_TOP - 14;
        ibeam(c, sx - 178, gy, wy + 4); ibeam(c, sx + 168, gy, wy + 4);
        stripes(c, sx - 170, gy, 340, 14);
        box(c, sx - 10, gy + 10, 20, 12, INK); box(c, sx - 9, gy + 11, 18, 10, S[3]); box(c, sx - 9, gy + 11, 18, 2, S[5]);
        arm(c, sx, wy - SWING_TOP, s.cx, s.cy, 5);
        c.fillStyle = INK; c.beginPath(); c.arc(sx, wy - SWING_TOP, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = S[4]; c.beginPath(); c.arc(sx, wy - SWING_TOP, 3.5, 0, Math.PI * 2); c.fill();
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      }
      case 'drop': {
        // (its guide rails up into the rafters, the motor box over it)
        for (const gx of [sx - 36, sx + 30]) { box(c, gx, wy - 250, 6, 250, INK); box(c, gx + 1, wy - 250, 4, 250, S[3]); box(c, gx + 1, wy - 250, 1, 250, S[5]); box(c, gx + 4, wy - 250, 1, 250, S[1]); for (let y = wy - 240; y < wy; y += 30) box(c, gx, y, 6, 2, S[1]); }
        stripes(c, sx - 40, wy - 262, 80, 16);
        box(c, sx - 24, wy - 280, 48, 18, INK); box(c, sx - 23, wy - 279, 46, 16, S[2]); box(c, sx - 23, wy - 279, 46, 3, S[4]); for (let k = 0; k < 5; k++) box(c, sx - 18 + k * 8, wy - 274, 4, 8, S[1]);
        arm(c, sx, wy - 246, s.cx, s.cy, 6);
        // (the shudder: sparks off its rails, a red lamp)
        if (s.t >= 90 && s.t < 120 && !s.jam) {
          box(c, sx - 7, wy - 290, 14, 11, INK); box(c, sx - 6, wy - 289, 12, 9, f % 6 < 3 ? '#EF4444' : '#7F1D1D');
          if (f % 6 < 3) steppedGlow(c, sx, wy - 285, 22, '#EF4444', 0.03, 0.3, 3);
          if (f % 3 === 0) { box(c, sx + (f % 2 ? 30 : -36), s.cy - 20 + (f % 20), 3, 3, '#FDE047'); box(c, sx + (f % 2 ? 33 : -39), s.cy - 18 + (f % 20), 2, 2, '#F97316'); }
        }
        drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
        break;
      }
      case 'rail': {
        // (its track along the trough's edge, on ties, sparks where it runs; the stop at its end)
        const a = X(s.x - 900), b = sx + 40;
        box(c, a, wy - 3, b - a, 6, INK); box(c, a, wy - 2, b - a, 4, S[3]); box(c, a, wy - 2, b - a, 1, S[6]); box(c, a, wy + 1, b - a, 1, S[1]);
        for (let x = Math.max(a, state.camera.x - 40); x < Math.min(b, state.camera.x + 840); x += 30) { const xx = x - ((x - a) % 30); box(c, xx, wy + 2, 4, 4, S[1]); }
        stripes(c, sx + 10, wy - 40, 20, 40);
        break;
      }
      default: break;
    }
  }
  // (the cutter: a giant saw out of the sky, slammed half into the ground at the break, grinding there)
  if (r.cutT && onScreen(state, X(CUTTER_X) - 200, X(CUTTER_X) + 200)) {
    const k = Math.min(1, r.cutT / SLAM), cx = X(CUTTER_X), top = GY - 620, cy = top + (GY + 14 - top) * k * k;
    // (falling: its streaks)
    if (k < 1) { c.globalAlpha = 0.4; for (let i = 0; i < 5; i++) box(c, cx - 50 + i * 25, cy - 160, 3, 100, '#F1F5F9'); c.globalAlpha = 1; }
    c.save(); c.beginPath(); c.rect(cx - 90, cy - 90, 180, GY - 2 - (cy - 90)); c.clip();
    drawSawDisc(c, cx, cy, 64, f * 0.5, 0);
    c.restore();
    if (k >= 1) {
      // (the gouge it's in: dirt heaped either side, clods, the turf torn)
      c.fillStyle = INK; c.beginPath(); c.ellipse(cx, GY - 2, 80, 10, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#54381C'; c.beginPath(); c.ellipse(cx, GY - 2, 78, 8, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#6C4A26'; c.beginPath(); c.ellipse(cx - 20, GY - 4, 50, 5, 0, Math.PI, 0); c.fill();
      for (let i = 0; i < 6; i++) { box(c, cx - 70 + i * 26, GY - 8 - (i % 2) * 3, 8, 5, INK); box(c, cx - 69 + i * 26, GY - 7 - (i % 2) * 3, 6, 3, i % 2 ? '#6C9C34' : '#886034'); }
    }
  }
};

/** In front of the log: the saws that come up out of the water or run along its surface. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame;
  for (const s of r.saws) {
    if (!onScreen(state, s.cx - 80, s.cx + 80)) continue;
    const wy = waterY(s.x);
    if (s.type === 'rise') {
      // (the water boiling over it till it's up, then it up through the surface, the water clipped off its bottom)
      if (s.k < 0.95) for (let i = 0; i < 5; i++) { const bx = s.cx - 20 + ((f * 2 + i * 13) % 40), by = wy - 2 - ((f + i * 7) % 9); box(c, bx - 1, by - 1, 5, 5, '#7AB6D0'); box(c, bx, by, 3, 3, '#E8F8FC'); }
      c.save(); c.beginPath(); c.rect(s.cx - 40, s.cy - 40, 80, wy + 2 - (s.cy - 40)); c.clip();
      drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
      c.restore();
      if (s.k > 0.3) { for (let i = 0; i < 4; i++) box(c, s.cx - 20 + i * 12, wy - 4 - ((f + i * 5) % 6), 5, 3, '#F8FCFE'); box(c, s.cx - 26, wy - 1, 52, 2, '#BFE6F2'); }
    } else if (s.type === 'rail' && s.live && !s.done) {
      drawSawDisc(c, s.cx, s.cy, s.r, s.spin, s.jam);
      if (f % 2 === 0) for (let i = 0; i < 3; i++) box(c, s.cx + 10 + Math.random() * 16, s.cy + s.r - 6 - Math.random() * 10, 2, 2, i % 2 ? '#F97316' : '#FDE047');
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The animatronics

const R = (col: string) => rampOf(col);
const sh = (g: Ctx, path: () => void, col: string, x: number, y: number, w: number, h: number) => part(g, path, R(col), x, y, w, h, 1);

/** The figure's still body, feet at the origin, facing right: the park's fiberglass and fur. */
const paintFigure = (g: Ctx, kind: PropKind, split: boolean) => {
  switch (kind) {
    case 'beaver': {
      // (sat up on its tail, gnawing a fake log: brown fur in steps, the orange teeth, a neck bolt)
      sh(g, () => g.ellipse(-14, -6, 12, 5, 0, 0, Math.PI * 2), '#4A3424', -26, -11, 24, 10);
      g.strokeStyle = '#2A1E14'; g.lineWidth = 0.6; for (let k = -24; k < -6; k += 3) { g.beginPath(); g.moveTo(k, -10); g.lineTo(k + 2, -2); g.stroke(); }
      sh(g, () => g.ellipse(2, -20, 13, 15, 0, 0, Math.PI * 2), '#7A4A24', -11, -35, 26, 30);
      sh(g, () => g.ellipse(4, -14, 8, 9, 0, 0, Math.PI * 2), '#9A6A3A', -4, -23, 16, 18);
      sh(g, () => g.ellipse(14, -38, 10, 9, 0, 0, Math.PI * 2), '#7A4A24', 4, -47, 20, 18);
      sh(g, () => g.arc(8, -45, 3, 0, Math.PI * 2), '#5A3A1E', 5, -48, 6, 6);
      box(g, 18, -42, 3, 3, INK); box(g, 18, -42, 1, 1, '#FFFFFF');
      sh(g, () => g.ellipse(22, -36, 5, 4, 0, 0, Math.PI * 2), '#9A6A3A', 17, -40, 10, 8);
      box(g, 25, -38, 3, 2, INK);
      box(g, 20, -33, 5, 6, INK); box(g, 21, -32, 3, 4, '#E8860E'); box(g, 21, -32, 1, 4, '#FBBF5A');
      box(g, 9, -31, 4, 4, '#3F3F46'); box(g, 9, -31, 2, 2, '#A1A1AA');
      sh(g, () => g.rect(16, -26, 26, 9), '#A0703C', 16, -26, 26, 9);
      g.fillStyle = INK; g.beginPath(); g.ellipse(42, -21.5, 3, 4.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#D8B47C'; g.beginPath(); g.ellipse(42, -21.5, 2, 3.5, 0, 0, Math.PI * 2); g.fill();
      break;
    }
    case 'jack': {
      // (a lumberjack: jeans and boots, a red-and-black plaid, suspenders, a beard, a knit cap; the axe's arm drawn live)
      sh(g, () => g.rect(-10, -38, 8, 36), '#2E4A7A', -10, -38, 8, 36); sh(g, () => g.rect(2, -38, 8, 36), '#2E4A7A', 2, -38, 8, 36);
      sh(g, () => g.rect(-12, -6, 12, 6), '#4A2E16', -12, -6, 12, 6); sh(g, () => g.rect(1, -6, 13, 6), '#4A2E16', 1, -6, 13, 6);
      sh(g, () => g.roundRect(-13, -75, 26, 39, 4), '#B91C1C', -13, -75, 26, 39);
      g.save(); g.beginPath(); g.roundRect(-13, -75, 26, 39, 4); g.clip();
      for (let k = -12; k < 13; k += 6) box(g, k, -75, 2, 39, 'rgba(28, 18, 9, 0.55)'); for (let k = -72; k < -36; k += 6) box(g, -13, k, 26, 2, 'rgba(28, 18, 9, 0.55)');
      g.restore();
      box(g, -9, -75, 3, 38, '#3A2A1A'); box(g, 6, -75, 3, 38, '#3A2A1A'); box(g, -13, -40, 26, 3, '#2A1A10');
      sh(g, () => g.rect(-14, -74, 6, 26), '#B91C1C', -14, -74, 6, 26);
      sh(g, () => g.ellipse(0, -86, 9, 10, 0, 0, Math.PI * 2), '#E8C8A0', -9, -96, 18, 20);
      sh(g, () => { g.moveTo(-8, -86); g.quadraticCurveTo(0, -68, 9, -86); g.lineTo(9, -82); g.lineTo(-8, -82); g.closePath(); }, '#6A3A1C', -8, -86, 17, 18);
      box(g, 3, -90, 2, 2, INK); box(g, -1, -84, 6, 2, '#E8C8A0');
      sh(g, () => g.ellipse(0, -96, 10, 6, 0, Math.PI, 0), '#B91C1C', -10, -102, 20, 6); box(g, -10, -97, 20, 2, '#F4F0E8'); box(g, -2, -105, 4, 4, '#F4F0E8');
      box(g, -9, -80, 3, 3, '#3F3F46');
      break;
    }
    case 'bear': {
      // (a grizzly reared up, paws up (GRR): shaggy brown in steps, the muzzle, a chain round its ankle to its stand)
      sh(g, () => g.rect(-16, -30, 12, 30), '#5A3A1E', -16, -30, 12, 30); sh(g, () => g.rect(4, -30, 12, 30), '#5A3A1E', 4, -30, 12, 30);
      sh(g, () => g.roundRect(-21, -86, 42, 60, 10), '#6B4423', -21, -86, 42, 60);
      sh(g, () => g.ellipse(0, -56, 12, 18, 0, 0, Math.PI * 2), '#8A6040', -12, -74, 24, 36);
      for (let k = 0; k < 14; k++) box(g, -18 + hash(k) * 34, -84 + hash(k * 3) * 54, 1, 3, k % 2 ? '#4A2E16' : '#8A6040');
      sh(g, () => g.ellipse(4, -98, 15, 13, 0, 0, Math.PI * 2), '#6B4423', -11, -111, 30, 26);
      sh(g, () => g.arc(-6, -109, 4.5, 0, Math.PI * 2), '#6B4423', -11, -114, 10, 10); sh(g, () => g.arc(12, -110, 4.5, 0, Math.PI * 2), '#6B4423', 7, -115, 10, 10);
      sh(g, () => g.ellipse(15, -94, 7, 5, 0, 0, Math.PI * 2), '#8A6040', 8, -99, 14, 10);
      box(g, 19, -97, 3, 3, INK); box(g, 6, -102, 3, 3, INK); box(g, 6, -102, 1, 1, '#FFFFFF');
      box(g, 12, -91, 8, 3, '#7F1D1D'); box(g, 13, -91, 2, 2, '#F4F0E8'); box(g, 17, -91, 2, 2, '#F4F0E8');
      sh(g, () => g.ellipse(25, -84, 8, 6, -0.5, 0, Math.PI * 2), '#6B4423', 17, -90, 16, 12); sh(g, () => g.ellipse(-25, -84, 8, 6, 0.5, 0, Math.PI * 2), '#6B4423', -33, -90, 16, 12);
      for (const px of [-31, 29]) for (let k = 0; k < 3; k++) box(g, px + k * 2 - 2, -90, 1, 3, '#F4F0E8');
      for (let k = 0; k < 4; k++) { box(g, -14 + k * 5, -4, 4, 3, INK); box(g, -13 + k * 5, -3, 2, 1, S[4]); }
      break;
    }
    case 'settler': {
      // (a pioneer woman at her churn: calico dress, apron, sunbonnet; the dasher drawn live)
      sh(g, () => { g.moveTo(-10, -50); g.lineTo(10, -50); g.lineTo(16, 0); g.lineTo(-16, 0); g.closePath(); }, '#3B6AA0', -16, -50, 32, 50);
      for (let y = -46; y < 0; y += 5) for (let x = -14 + ((y / 5) % 2) * 2; x < 14; x += 5) box(g, x, y, 1, 1, '#E8E4F4');
      sh(g, () => { g.moveTo(-8, -44); g.lineTo(8, -44); g.lineTo(11, -6); g.lineTo(-11, -6); g.closePath(); }, '#F1F5F9', -11, -44, 22, 38);
      sh(g, () => g.ellipse(1, -60, 8, 9, 0, 0, Math.PI * 2), '#E8C8A0', -7, -69, 16, 18);
      box(g, 4, -62, 2, 2, INK); box(g, 2, -57, 4, 1, '#B8605A');
      sh(g, () => { g.moveTo(-10, -56); g.quadraticCurveTo(-12, -74, 2, -74); g.quadraticCurveTo(16, -74, 14, -60); g.lineTo(8, -62); g.quadraticCurveTo(4, -68, -4, -64); g.closePath(); }, '#F1F5F9', -12, -74, 28, 18);
      box(g, -10, -56, 4, 8, '#E8E4D8');
      sh(g, () => g.rect(16, -36, 16, 36), '#A0703C', 16, -36, 16, 36);
      for (const y of [-30, -12]) box(g, 16, y, 16, 2, '#3F3F46');
      sh(g, () => g.ellipse(24, -36, 8, 2.5, 0, 0, Math.PI * 2), '#7A5030', 16, -39, 16, 5);
      box(g, -2, -50, 3, 3, '#3F3F46');
      break;
    }
  }
  // (the cut face: the fiberglass shell's white gelcoat, its steel armature, a spring)
  if (split) { box(g, -15, -43, 30, 4, '#F2EEE4'); box(g, -15, -40, 30, 1, '#B8B2A4'); box(g, -3, -44, 6, 5, S[2]); box(g, -2, -44, 2, 5, S[5]); box(g, 7, -43, 4, 3, '#71717A'); }
};

/** The live bits: the lumberjack's axe arm, the settler's dasher, the beaver's head going. */
const figureLive = (c: Ctx, kind: PropKind, f: number) => {
  if (kind === 'jack') {
    c.save(); c.translate(12, -68); c.rotate(-0.8 + Math.sin(f * 0.1) * 0.3);
    box(c, -4, -6, 8, 18, INK); box(c, -3, -5, 6, 16, '#B91C1C'); box(c, -3, -5, 2, 16, '#E84A3A');
    box(c, -3, -38, 6, 38, INK); box(c, -2, -38, 4, 38, '#9A6A3A'); box(c, -2, -38, 1, 38, '#C89A5A');
    box(c, -9, -43, 16, 11, INK); box(c, -8, -42, 14, 9, S[4]); box(c, -8, -42, 14, 2, S[6]); box(c, 5, -42, 1, 9, '#F1F5F9');
    c.restore();
  } else if (kind === 'settler') {
    const y = -60 + Math.abs(Math.sin(f * 0.15)) * 10;
    box(c, 21, y, 5, 30, INK); box(c, 22, y, 3, 30, '#8A5A30'); box(c, 22, y, 1, 30, '#B08050');
    box(c, 10, y + 12, 14, 5, INK); box(c, 11, y + 13, 12, 3, '#E8C8A0');
  }
};

/** An animatronic (its rock stand, the figure, and once the saw's been through it: in two halves, sparking). */
export const drawProps = (c: Ctx, state: GameState) => {
  const r = rideOf(state), f = state.frame, F = asIs(FIBER);
  for (const q of r.props) {
    if (!onScreen(state, X(q.x) - 120, X(q.x) + 120)) continue;
    const x = X(q.x), y = waterY(q.x) - 24;
    // (on its fiberglass rock by the trough's back edge, bolted down)
    box(c, x - 35, y - 7, 70, 12, INK); box(c, x - 34, y - 6, 68, 10, F[3]); box(c, x - 34, y - 6, 68, 2, F[5]); box(c, x - 34, y + 2, 68, 2, F[1]); checker(c, x - 34, y, 68, 2, F[2], 0);
    for (const bx of [x - 28, x + 24]) { box(c, bx, y - 3, 4, 4, INK); box(c, bx, y - 3, 2, 2, S[5]); }
    const t = q.shred ? q.t : 0;
    const split = q.shred ? Math.min(1, Math.max(0, (t - 16) / 30)) : 0;
    const cutY = y - 40;
    const nod = q.shred ? 0 : Math.sin(f * 0.08 + q.x) * 0.06;
    const fig = (cut: boolean) => { c.rotate(nod); still(c, `lr-prop-${q.kind}-${cut ? 1 : 0}`, -40, -120, 90, 124, g => paintFigure(g, q.kind, cut)); if (!q.shred) figureLive(c, q.kind, f); };
    // (the bottom half)
    c.save(); c.beginPath(); c.rect(x - 60, cutY, 120, 60); c.clip();
    c.translate(x, y); c.rotate(-split * 0.3); fig(false);
    c.restore();
    // (the top half: off, tumbling)
    c.save(); c.beginPath(); c.rect(x - 60, cutY - 120, 120, 120); c.clip();
    c.translate(x + split * 38, y - split * 22 + split * split * 60); c.rotate(split * 1.6); fig(split > 0);
    c.restore();
    if (q.shred && t < 34) { const sx = x + 60 - Math.min(120, t * 6); drawSawDisc(c, sx, cutY, 20, f * 0.5); }
    // (cut: sparks and the wires out of it)
    if (split > 0 && split < 1 && f % 3 === 0) { box(c, x - 10 + Math.random() * 20, cutY - 2, 3, 3, '#FDE047'); box(c, x - 6 + Math.random() * 12, cutY - 4, 2, 2, '#F97316'); }
    if (split >= 1) { c.lineWidth = 1; for (const [dx, col, ex, ey] of [[-4, '#DC2626', -8, -8], [3, '#2563EB', 6, -6], [0, '#FDE047', 2, -9]] as const) { c.strokeStyle = col; c.beginPath(); c.moveTo(x + dx, cutY); c.lineTo(x + ex, cutY + ey + Math.sin(f * 0.3 + dx) * 2); c.stroke(); } }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The sewer's and the river's

/** A round pipe end-on (a ring: its flange in steps, the dark of its bore or a cap, a lit edge, rust run down it). */
const pipeEnd = (c: Ctx, x: number, y: number, r: number, col: string, open: boolean, seed: number) => {
  const P = rampOf(col);
  c.fillStyle = INK; c.beginPath(); c.arc(x, y, r + 2, 0, Math.PI * 2); c.fill();
  c.fillStyle = P[2]; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = P[3]; c.beginPath(); c.arc(x - r * 0.08, y - r * 0.08, r * 0.9, 0, Math.PI * 2); c.fill();
  c.fillStyle = P[4]; c.beginPath(); c.arc(x, y, r, Math.PI * 1.05, Math.PI * 1.6); c.arc(x, y, r * 0.78, Math.PI * 1.6, Math.PI * 1.05, true); c.closePath(); c.fill();
  c.fillStyle = P[1]; c.beginPath(); c.arc(x, y, r, Math.PI * 0.1, Math.PI * 0.6); c.arc(x, y, r * 0.8, Math.PI * 0.6, Math.PI * 0.1, true); c.closePath(); c.fill();
  c.fillStyle = open ? '#0C0A06' : P[1]; c.beginPath(); c.arc(x, y, r * 0.66, 0, Math.PI * 2); c.fill();
  if (open) { c.fillStyle = '#1E1A10'; c.beginPath(); c.arc(x + r * 0.12, y + r * 0.12, r * 0.5, 0, Math.PI * 2); c.fill(); }
  else { box(c, x - r * 0.3, y - r * 0.4, r * 0.3, 1, P[3]); }
  // (the flange's bolts round it, rust weeping down from one)
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + seed; box(c, x + Math.cos(a) * r * 0.83 - 1, y + Math.sin(a) * r * 0.83 - 1, 2, 2, '#2A261E'); }
  const Ru = asIs(RUST); box(c, x + r * 0.4, y + r * 0.5, 2, r * 0.8, Ru[4]); box(c, x + r * 0.4, y + r * 0.5, 1, r * 0.4, Ru[6]);
};

/** The sewer's gushers' outfalls and its busted pipe sections, the river's rocks (behind him: the low pipes and limbs
 *  are in front, see drawObstaclesFront). */
export const drawObstaclesBack = (c: Ctx, state: GameState) => {
  const f = state.frame, r = rideOf(state), Sl = asIs(SLUDGE), Cn = asIs(CONCRETE), Ru = asIs(RUST);
  for (const [gx, ph] of GUSHERS) {
    if (!onScreen(state, X(gx) - 60, X(gx) + 60)) continue;
    const wy = waterY(gx), top = wy - 222, cyc = (f + ph) % 160, x = X(gx);
    // (an outfall: a round pipe out of the vault, its bell mouth turned down, slime hanging off its lip)
    box(c, x - 15, top - 42, 30, 30, INK); box(c, x - 14, top - 42, 28, 30, '#4C4C40'); box(c, x - 14, top - 42, 6, 30, '#7A7A64'); box(c, x - 8, top - 42, 2, 30, '#626250'); box(c, x + 8, top - 42, 6, 30, '#34342A');
    box(c, x - 17, top - 18, 34, 7, INK); box(c, x - 16, top - 17, 32, 5, '#3A3A30'); box(c, x - 16, top - 17, 32, 1, '#5A5A48');
    c.fillStyle = INK; c.beginPath(); c.ellipse(x, top - 4, 23, 10, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#626250'; c.beginPath(); c.ellipse(x, top - 4, 21, 8, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7A7A64'; c.beginPath(); c.ellipse(x - 3, top - 6, 16, 4, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#0C0A06'; c.beginPath(); c.ellipse(x, top - 3, 15, 5, 0, 0, Math.PI * 2); c.fill();
    for (const [dx, len] of [[-18, 12], [-9, 6], [12, 9], [17, 5]] as const) { box(c, x + dx, top - 2, 3, len, Sl[4]); box(c, x + dx, top - 2 + len, 3, 2, Sl[6]); }
    // (its plate on the vault wall beside it: a hazard band, OUTFALL, and its lamp: amber and flashing as it builds,
    // red while it pours)
    const px = x + 34, py = top - 30;
    box(c, px - 2, py - 2, 52, 28, INK); stripes(c, px, py, 48, 6);
    box(c, px, py + 6, 48, 18, '#E8EAEC'); box(c, px, py + 6, 48, 1, '#FFFFFF'); box(c, px, py + 22, 48, 2, '#A8AAAC');
    signText(c, 'OUTFALL', px + 24, py + 19, painted(1, '#1C1917', '#E8EAEC'));
    for (const bx of [px + 2, px + 44]) box(c, bx, py + 8, 2, 2, S[2]);
    const lamp = cyc >= 115 && cyc < 150 ? '#EF4444' : cyc >= 50 ? (f % 10 < 5 ? '#F59E0B' : '#7C2D12') : '#3F3A30';
    box(c, px + 17, py - 13, 14, 12, INK); box(c, px + 19, py - 11, 10, 8, lamp); box(c, px + 20, py - 10, 3, 2, lamp === '#3F3A30' ? '#5A5448' : '#FFF4D0');
    if (lamp !== '#3F3A30' && lamp !== '#7C2D12') steppedGlow(c, px + 24, py - 7, 22, lamp, 0.03, 0.3, 3);
    // (the build: from a drip to a dribble to a stream, the pipe shuddering and sludge spitting off its lip)
    if (cyc >= 50 && cyc < 115) {
      const k = (cyc - 50) / 65, w = 2 + k * 10, shk = Math.sin(f * 1.7) * k * 2;
      c.globalAlpha = 0.9; box(c, x - w / 2 + shk, top + 2, w, wy - top - 2, '#5A4A18'); box(c, x - w / 2 + shk, top + 2, Math.max(1, w * 0.3), wy - top - 2, '#7A6A28'); c.globalAlpha = 1;
      for (let i = 0; i < 2 + k * 5; i++) box(c, x - 14 + ((f * 3 + i * 11) % 28), top + 2 + ((f * 6 + i * 37) % 30), 3, 3, '#7A6A28');
      for (let i = 0; i < 3; i++) box(c, x - 16 + ((f * 4 + i * 13) % 32), wy - 4 - ((f + i * 5) % 8) * k, 4, 3, '#8A7A34');
    } else if (cyc % 40 < 4) box(c, x - 2, top + 4 + (cyc % 40) * 8, 3, 5, '#6B5A1E');
  }
  // (the busted pipe sections: a concrete culvert section fallen across the channel, end-on, half sunk; rebar out of
  // its broken end; the sludge heaping up against it; a work crew's barricade blinker wedged on top, lit (its light
  // in art.ts rideLighting))
  for (const k of r.junk) {
    if (!onScreen(state, X(k.x) - 60, X(k.x) + 60)) continue;
    const wy = waterY(k.x), x = X(k.x), cy = wy - 2;
    c.save(); c.beginPath(); c.rect(x - 40, cy - 40, 80, wy + 4 - (cy - 40)); c.clip();
    pipeEnd(c, x, cy, 30, Cn[4], true, k.x);
    for (let i = 0; i < 6; i++) { const a = Math.PI + 0.3 + i * 0.45; box(c, x + Math.cos(a) * 26 - 2, cy + Math.sin(a) * 26 - 1, 4, 2, Cn[2]); }
    c.restore();
    c.lineWidth = 2;
    for (const [ax, ay, bx2, by2] of [[-20, -22, -28, -38], [14, -26, 20, -40], [-4, -29, -2, -42]] as const) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(x + ax, cy + ay); c.lineTo(x + bx2, cy + by2); c.stroke(); c.strokeStyle = Ru[4]; c.lineWidth = 1.5; c.stroke(); }
    box(c, x - 7, cy - 32, 14, 5, INK); box(c, x - 6, cy - 31, 12, 3, Cn[3]);
    for (let i = 0; i < 5; i++) { box(c, x - 46 + i * 6 + ((f >> 1) % 6), wy - 4 - (i % 2) * 2, 6, 4, Sl[5]); box(c, x - 46 + i * 6 + ((f >> 1) % 6), wy - 4 - (i % 2) * 2, 6, 1, Sl[7]); }
    const on = f % 16 < 8;
    box(c, x - 7, cy - 46, 14, 14, INK); box(c, x - 5, cy - 44, 10, 10, on ? '#FB923C' : '#7C2D12'); if (on) { box(c, x - 4, cy - 43, 3, 3, '#FFE4C0'); steppedGlow(c, x, cy - 39, 20, '#FB923C', 0.03, 0.3, 3); }
    box(c, x - 2, cy - 33, 4, 4, '#26262C');
  }
  // (the river's rocks: real granite boulders well up out of the water, faceted and stepped, moss on their backs and
  // lichen spots, dark and wet at the waterline; the water piling up white against them)
  const G = hr('granite', GRANITE, 0.16), Ms = hr('moss', MOSS, 0.16), Rv = hr('river', RIVER, 0.16);
  for (const k of ROCKS) {
    if (!onScreen(state, X(k) - 70, X(k) + 70)) continue;
    const wy = waterY(k), x = X(k);
    c.save(); c.translate(x, wy);
    const outline: [number, number][] = [[-44, 4], [-36, -30], [-14, -50], [8, -46], [30, -34], [44, 4]];
    c.fillStyle = INK; c.beginPath(); outline.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.fill();
    c.fillStyle = G[3]; c.beginPath(); c.moveTo(-41, 2); c.lineTo(-34, -28); c.lineTo(-13, -47); c.lineTo(7, -43); c.lineTo(28, -32); c.lineTo(41, 2); c.closePath(); c.fill();
    c.fillStyle = G[5]; c.beginPath(); c.moveTo(-34, -28); c.lineTo(-13, -47); c.lineTo(-4, -45); c.lineTo(-20, -24); c.closePath(); c.fill();
    c.fillStyle = G[4]; c.beginPath(); c.moveTo(-20, -24); c.lineTo(-4, -45); c.lineTo(7, -43); c.lineTo(4, -20); c.closePath(); c.fill();
    c.fillStyle = G[2]; c.beginPath(); c.moveTo(7, -43); c.lineTo(28, -32); c.lineTo(41, 2); c.lineTo(16, 2); c.closePath(); c.fill();
    c.fillStyle = G[1]; c.beginPath(); c.moveTo(28, -32); c.lineTo(41, 2); c.lineTo(30, 2); c.closePath(); c.fill();
    checker(c, -36, -12, 72, 2, G[2], 0);
    box(c, -13, -47, 8, 1, G[7]);
    box(c, 8, -44, 16, 4, Ms[4]); box(c, 10, -45, 8, 1, Ms[6]); box(c, 20, -40, 6, 3, Ms[3]);
    box(c, -24, -30, 3, 3, '#C8C890'); box(c, -8, -18, 2, 2, '#D8C870'); box(c, 18, -16, 3, 2, '#C8C890');
    c.fillStyle = 'rgba(8, 18, 16, 0.45)'; c.fillRect(-41, -6, 82, 8);
    c.restore();
    for (let i = 0; i < 6; i++) { const px = x - 60 + i * 7 + ((f >> 1) % 7); box(c, px, wy - 4 - (i % 3) * 3, 7, 3, '#F8FCFA'); box(c, px, wy - 1 - (i % 3) * 3, 7, 1, Rv[7]); }
    for (let i = 0; i < 4; i++) box(c, x - 48 + ((f * 2 + i * 13) % 22), wy - 10 - ((f + i * 7) % 12), 3, 3, '#E8F4F0');
  }
};

export const drawObstaclesFront = (c: Ctx, state: GameState) => {
  const f = state.frame, Ru = asIs(RUST), Sl = asIs(SLUDGE);
  for (const px of PIPES) {
    if (!onScreen(state, X(px) - 60, X(px) + 60)) continue;
    const wy = waterY(px), x = X(px), low = wy - DUCK_LINE - PIPE_R, vault = wy - 244;
    // (a run of pipes across the tunnel, end-on, stacked from the vault down to head height on a rusted hanger: the
    // lowest (the fattest) is the one to duck; joints weeping, slime on them, a drip off the bottom)
    box(c, x - 6, vault, 12, low - vault, INK); box(c, x - 4, vault, 8, low - vault, Ru[2]); box(c, x - 4, vault, 2, low - vault, Ru[4]); box(c, x + 2, vault, 2, low - vault, Ru[1]);
    for (let y = vault + 10; y < low; y += 26) { box(c, x - 5, y, 10, 3, Ru[5]); box(c, x - 5, y + 3, 10, 1, Ru[1]); }
    const stack: [number, number, string][] = [[0, PIPE_R, '#6A6A58'], [-14, 16, '#5A5A50'], [12, 14, '#7A6A58'], [-4, 18, '#6A5E4E'], [10, 13, '#5A5A50'], [-10, 15, '#6A6A58']];
    let y = low;
    for (let i = 0; i < stack.length; i++) {
      const [dx, pr, col] = stack[i];
      if (i > 0) y -= stack[i - 1][1] + pr - 4;
      if (y - pr < vault) break;
      pipeEnd(c, x + dx, y, pr, col, i % 2 === 1, px + i);
      // (slime down its front)
      box(c, x + dx - pr * 0.5, y + pr * 0.2, 3, pr * 0.7, Sl[4]); box(c, x + dx - pr * 0.5, y + pr * 0.2 + pr * 0.7, 3, 2, Sl[6]);
    }
    // (the strap holding the bottom one up)
    box(c, x - PIPE_R - 2, low - 3, PIPE_R * 2 + 4, 4, Ru[2]); box(c, x - PIPE_R - 2, low - 3, PIPE_R * 2 + 4, 1, Ru[5]);
    if (f % 50 < 30) box(c, x - 1, low + PIPE_R + (f % 50), 3, 4, '#A3A35A');
    // (seen coming: the bottom pipe banded in hazard tape, and a caged work lamp hung off the hanger lighting it up out
    // of the dark (its light in art.ts rideLighting); no words on it (the user's: the player can tell))
    stripes(c, x - PIPE_R - 4, low + PIPE_R - 6, PIPE_R * 2 + 8, 6);
    const lx = x + 30, ly = low - 70;
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, ly - 30); c.lineTo(lx, ly - 6); c.stroke();
    steppedGlow(c, lx, ly, 30, '#FEF9C3', 0.03, 0.3, 4);
    box(c, lx - 8, ly - 8, 16, 16, INK); box(c, lx - 6, ly - 6, 12, 12, '#FEF9C3'); box(c, lx - 5, ly - 5, 4, 4, '#FFFFFF');
    box(c, lx - 1, ly - 8, 2, 16, INK); box(c, lx - 8, ly - 1, 16, 2, INK); box(c, lx - 4, ly - 12, 8, 4, '#3F3F46');
  }
  for (const [gx, ph] of GUSHERS) {
    if (!onScreen(state, X(gx) - 60, X(gx) + 60)) continue;
    const wy = waterY(gx), top = wy - 222, cyc = (f + ph) % 160;
    if (cyc >= 115 && cyc < 150) {
      // (the pour: a thick brown column, banded, lumpy, splattering where it hits the water)
      const x = X(gx);
      box(c, x - 20, top, 40, wy - top, '#4A3C12'); box(c, x - 16, top, 10, wy - top, '#6A5A20'); box(c, x - 12, top, 3, wy - top, '#8A7A34'); box(c, x + 12, top, 8, wy - top, '#342A0C');
      for (let k = 0; k < 8; k++) box(c, x - 18 + ((k * 7 + f * 3) % 30), top + ((k * 37 + f * 9) % (wy - top)), 8, 10, k % 2 ? '#7A6A28' : '#2A2208');
      for (let i = 0; i < 6; i++) box(c, x - 34 + ((f * 5 + i * 17) % 68), wy - 6 - ((f + i * 9) % 16), 5, 4, i % 2 ? '#7A6A28' : '#A2A05A');
    }
  }
  const B = hr('bark', BARK, 0.16);
  for (const bx of BRANCHES) {
    if (!onScreen(state, X(bx) - 160, X(bx) + 180)) continue;
    const wy = waterY(bx), x = X(bx), limbB = wy - DUCK_LINE, limbT = limbB - 18;
    // (a real tree fallen across from the near bank: its trunk up out of the water, its crown a solid wall of leaves
    // from up high down onto one great low limb flat across at head height, its underside scraped pale: duck under it)
    for (const [col, lw] of [[INK, 18], [B[3], 14], [B[4], 8], [B[5], 2]] as const) { c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x + 170, wy - 10 - (lw < 10 ? 3 : 0)); c.lineTo(x + 30, limbT - 120 - (lw < 10 ? 3 : 0)); c.stroke(); }
    for (let k = 0; k < 6; k++) { const u = 0.15 + k * 0.13, tx = x + 170 - 140 * u, ty = wy - 10 + (limbT - 120 - (wy - 10)) * u; box(c, tx - 2, ty - 1, 4, 2, B[1]); }
    stillAt(c, `lr-crown-${bx}`, x, limbT, -LIMB_W - 30, -200, LIMB_W * 2 + 110, 210, g => {
      const O = hr('oak', OAK, 0.16);
      clump(g, 10, -150, 60, 44, bx + 1, O, 1); clump(g, -10, -110, 58, 40, bx + 2, O, 0); clump(g, 30, -100, 50, 36, bx + 3, O, 0);
      clump(g, -18, -52, 44, 32, bx + 4, O, 0); clump(g, 30, -48, 46, 32, bx + 5, O, 0); clump(g, 6, -24, 50, 22, bx + 6, O, 0);
    });
    box(c, x - LIMB_W - 2, limbT - 2, LIMB_W * 2 + 4, limbB - limbT + 4, INK);
    box(c, x - LIMB_W, limbT, LIMB_W * 2, limbB - limbT, B[3]);
    box(c, x - LIMB_W, limbT, LIMB_W * 2, 3, B[5]); box(c, x - LIMB_W, limbT + 3, LIMB_W * 2, 2, B[4]);
    for (let k = 0; k < 8; k++) box(c, x - LIMB_W + 4 + k * 10, limbT + 6 + (k % 2) * 3, 6, 2, B[1]);
    box(c, x - LIMB_W, limbB - 4, LIMB_W * 2, 4, '#C8A878'); box(c, x - LIMB_W, limbB - 4, LIMB_W * 2, 1, '#E8D0A0');
    c.fillStyle = INK; c.beginPath(); c.ellipse(x - LIMB_W, (limbT + limbB) / 2, 5, 9, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#C8A070'; c.beginPath(); c.ellipse(x - LIMB_W, (limbT + limbB) / 2, 4, 8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#8A6040'; c.lineWidth = 1; c.beginPath(); c.ellipse(x - LIMB_W, (limbT + limbB) / 2, 2, 4, 0, 0, Math.PI * 2); c.stroke();
  }
  void hash; void mix;
};
