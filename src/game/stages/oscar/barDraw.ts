// The bikers' bar, drawn. From outside: a cinderblock roadhouse, choppers lined
// up in front, THE BROKEN SPOKE in red neon, a Budweiser sign in the window. The
// front wall fades away once he's in. Inside: dark paneling, neon, a mirror and
// the bottles behind the counter, stools, a pool table under its lamp, the band's
// little stage with its amps, the jukebox glowing in the corner, a booth, and the
// bathroom at the back (its wall's in the way till he goes in). The gas lines:
// yellow pipe, each to a rusted joint (hissing once it's open). The gas, a haze
// thickening. After: black, burning, blood up the walls and over what's left of
// the ceiling, a charred skeleton where each of them was, bits everywhere.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left),
// neon as a tube with a stepped halo, no smooth gradients and no blur.

import type { GameState } from '../../core/state';
import { GROUND_Y, CANVAS_WIDTH } from '../../../constants';
import { drawFire } from '../../render/fx/fire';
import { drawKindCorpse } from '../../render/enemies';
import { drawChopperBike } from '../../render/enemies/oscar';
import { bandedGradient, brickPattern, checker, hazeBands } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded } from '../../render/npc/kit';
import { slab, column, pipe, letter } from '../barry/rooms';
import { neon, gasHaze, paneling, gasPipe, gasJoint, strut, stump, smoke, flyingBit, snore } from './kit';
import { COURSE } from './course';
import type { Bar, BarBiker } from './bar';
import { barIntact, barVeinBox } from './bar';
import { drawToilet, drawSwirly } from './swirlyDraw';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

const near = (state: GameState) => { const B = COURSE.bar; return !(state.camera.x > B.x2 + 800 || state.camera.x + 1100 < B.x1 - 300); };
/** He's in the room (the front wall fades), and in the bathroom (its wall does too). */
const inside = (state: GameState) => { const B = COURSE.bar, px = state.player.pos.x + state.player.width / 2; return px > B.x1 - 30 && px < B.x2 + 30; };
const inBathroom = (state: GameState) => { const B = COURSE.bar.bathroom, px = state.player.pos.x + state.player.width / 2; return px > B.x1 - 10; };
/** A sign that flickers out now and then. */
const flick = (f: number) => f % 97 > 6;

/** The inside of it: walls, neon, the counter's mirror and bottles, the stage, the jukebox, the gas lines. */
export const drawBarBack = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  const top = B.ceil, W = B.x2 - B.x1;
  // Paneling, the wainscot under a rail, the dark coming down off the ceiling
  paneling(ctx, B.x1, top, W, Y - top, intact ? '#3B2418' : '#1C1410', 30);
  const wain = intact ? '#2A1810' : '#140E0B';
  ctx.fillStyle = wain; ctx.fillRect(B.x1, Y - 40, W, 40);
  for (let x = B.x1 + 8; x < B.x2 - 50; x += 60) { ctx.fillStyle = dark(wain, 0.35); ctx.fillRect(x, Y - 34, 52, 28); ctx.fillStyle = lite(wain, 0.12); ctx.fillRect(x + 2, Y - 8, 50, 2); ctx.fillRect(x + 50, Y - 32, 2, 26); }
  pipe(ctx, B.x1, Y - 44, W, 5, intact ? '#57341F' : '#292524');
  hazeBands(ctx, B.x1, top, W, 56, '#000000', 0.5, 0.05, 4);
  if (intact) {
    neon(ctx, 'HELL ON WHEELS', B.x1 + 620, top + 50, 18, '#F43F5E', flick(f));
    neon(ctx, 'COLD BEER', B.x1 + 960, top + 60, 14, '#38BDF8', true);
    // A dartboard (a dart in it), a flag of the club, a mounted longhorn skull
    const dx = B.x1 + 1040, dy = top + 110;
    ink(ctx, () => ctx.arc(dx, dy, 16, 0, Math.PI * 2), '#1C1917', 1.5);
    for (let s = 0; s < 20; s++) {
      const a0 = (s / 20) * Math.PI * 2, a1 = ((s + 1) / 20) * Math.PI * 2;
      ctx.fillStyle = s % 2 ? '#E7D7B0' : '#0C0A09'; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.arc(dx, dy, 14, a0, a1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = s % 2 ? '#DC2626' : '#15803D'; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.arc(dx, dy, 10, a0, a1); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(dx - 2, dy - 2, 4, 4); ctx.fillStyle = '#DC2626'; ctx.fillRect(dx - 1, dy - 1, 2, 2);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(dx + 4, dy - 6, 6, 2); ctx.fillStyle = '#DC2626'; ctx.fillRect(dx + 10, dy - 8, 4, 6);
    // (the flag, tacked up at its corners, sagging between, the skull on it)
    const fx = B.x1 + 400, fy = top + 30;
    slab(ctx, fx, fy, 110, 60, '#111827');
    ctx.fillStyle = '#1F2937'; ctx.fillRect(fx + 34, fy + 2, 4, 56); ctx.fillRect(fx + 74, fy + 2, 4, 56);
    ctx.fillStyle = '#0B0F19'; ctx.fillRect(fx + 38, fy + 2, 2, 56); ctx.fillRect(fx + 78, fy + 2, 2, 56);
    ctx.fillStyle = '#A8A29E'; for (const [tx, ty] of [[fx + 2, fy + 2], [fx + 106, fy + 2], [fx + 2, fy + 56], [fx + 106, fy + 56]]) ctx.fillRect(tx, ty, 2, 2);
    ink(ctx, () => ctx.arc(B.x1 + 455, top + 58, 14, 0, Math.PI * 2), '#F8FAFC');
    ctx.fillStyle = '#CBD5E1'; ctx.fillRect(B.x1 + 459, top + 48, 6, 18);
    ink(ctx, () => ctx.rect(B.x1 + 449, top + 68, 12, 6), '#E2E8F0');
    ctx.fillStyle = INK; ctx.fillRect(B.x1 + 452, top + 70, 1, 4); ctx.fillRect(B.x1 + 455, top + 70, 1, 4); ctx.fillRect(B.x1 + 458, top + 70, 1, 4);
    ctx.fillStyle = '#111827'; ctx.fillRect(B.x1 + 448, top + 54, 4, 4); ctx.fillRect(B.x1 + 458, top + 54, 4, 4); ctx.fillRect(B.x1 + 454, top + 61, 2, 3);
    letter(ctx, 'RIDE OR DIE', B.x1 + 455, top + 84, 'bold 7px monospace', '#F8FAFC', INK);
    // The mirror behind the counter (its frame, the dark glass, a glint across it), the bottles on their shelves
    const mx = B.x1 + 490, my = top + 90;
    slab(ctx, mx - 4, my - 4, 258, 98, '#57341F');
    bandedGradient(ctx, mx, my, 250, 90, ['#4B5563', '#374151', '#1F2937'], 5);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (const gx of [mx + 30, mx + 150]) { ctx.beginPath(); ctx.moveTo(gx, my + 90); ctx.lineTo(gx + 40, my); ctx.lineTo(gx + 52, my); ctx.lineTo(gx + 12, my + 90); ctx.fill(); }
    for (let s = 0; s < 2; s++) {
      for (let k = 0; k < 16; k++) {
        const c = ['#15803D', '#A16207', '#7F1D1D', '#F8FAFC'][(k + s) % 4];
        const bx = B.x1 + 496 + k * 15, by = top + 104 + s * 40;
        ink(ctx, () => { ctx.rect(bx + 2, by, 2, 6); ctx.rect(bx, by + 6, 6, 14); }, c);
        ctx.fillStyle = lite(c, 0.4); ctx.fillRect(bx + 1, by + 8, 1, 10);
        ctx.fillStyle = dark(c, 0.3); ctx.fillRect(bx + 4, by + 8, 1, 11);
        ctx.fillStyle = (k * 7 + s) % 3 ? '#F5F5F4' : '#FDE68A'; ctx.fillRect(bx + 1, by + 11, 4, 4); // (the label)
        ctx.fillStyle = '#B45309'; ctx.fillRect(bx + 2, by - 1, 2, 2); // (the cap)
      }
      pipe(ctx, B.x1 + 490, top + 124 + s * 40, 250, 4, '#57534E');
    }
  } else {
    // Blood up the walls and everywhere (on the walls: behind him)
    for (const g of b.gore) if (g.kind === 'splat') {
      ctx.fillStyle = g.r > 20 ? 'rgba(69, 10, 10, 0.85)' : 'rgba(127, 29, 29, 0.85)'; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * 0.6, g.rot, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = g.r > 20 ? 'rgba(127, 29, 29, 0.9)' : 'rgba(185, 28, 28, 0.85)'; ctx.beginPath(); ctx.ellipse(g.x - g.r * 0.15, g.y - g.r * 0.1, g.r * 0.6, g.r * 0.36, g.rot, 0, Math.PI * 2); ctx.fill();
      if (g.r > 22) { ctx.fillStyle = 'rgba(69, 10, 10, 0.85)'; ctx.fillRect(Math.round(g.x / 2) * 2, g.y + g.r * 0.4, 2, g.r * 0.6); ctx.fillRect(Math.round(g.x / 2) * 2, g.y + g.r, 2, 2); }
    }
    // Fire still going here and there along the floor
    // (only the ones on screen: each is painted afresh every frame, and the camera's over in Oscar's room half the time)
    for (let k = 0; k < 9; k++) {
      const fx = B.x1 + 70 + k * 130;
      if (fx < state.camera.x - 60 || fx > state.camera.x + CANVAS_WIDTH + 60) continue;
      drawFire(ctx, fx, Y, 30, 36 + (k % 3) * 5, f, { seed: k * 23, smoke: 0.3, glow: 0.7 });
    }
  }
  // The gas lines: yellow pipe down the walls to each joint
  const gas = intact ? '#CA8A04' : '#3F3A36';
  for (let i = 0; i < 3; i++) {
    const v = B.veins[i];
    gasPipe(ctx, v.x + 20, top, 6, v.y - top + 3, gas);
    for (let cy = top + 40; cy < v.y - 20; cy += 60) slab(ctx, v.x + 18, cy, 10, 4, '#57534E', 1); // (its clamps)
    gasPipe(ctx, v.x - 20, v.y - 3, 46, 6, gas);
    if (!intact) continue;
    const vb = barVeinBox(i);
    gasJoint(ctx, vb.x, vb.y, vb.w, vb.h, 3, b.open[i]);
  }
};

/** The furniture, and them: the band, the drinkers, the pool players, the bartender, the one passed out in the booth. After: what's left of them. */
export const drawBarMid = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  // The stage and its amps, the jukebox, the counter and stools, the pool table and its lamp, the booth
  const S = B.stage;
  const boards = intact ? '#44291A' : '#1C1410';
  slab(ctx, S.x, S.y, S.w, Y - S.y, boards);
  ctx.fillStyle = dark(boards, 0.3); for (let y = S.y + 22; y < Y - 4; y += 16) ctx.fillRect(S.x + 2, y, S.w - 4, 2);
  slab(ctx, S.x - 4, S.y, S.w + 8, 6, intact ? '#5B3A24' : '#292524');
  if (intact) for (const ax of [S.x + 10, S.x + S.w - 44]) {
    slab(ctx, ax, S.y - 44, 34, 44, '#111827');
    checker(ctx, ax + 3, S.y - 34, 28, 26, '#1F2937');
    const cx = ax + 17, cy = S.y - 22;
    ink(ctx, () => ctx.arc(cx, cy, 10, 0, Math.PI * 2), '#374151');
    ctx.fillStyle = '#1F2937'; ctx.beginPath(); ctx.arc(cx + 1, cy + 1, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4B5563'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(cx - 2, cy - 2, 2, 2);
    ctx.fillStyle = '#D6D3D1'; for (let k = 0; k < 4; k++) ctx.fillRect(ax + 5 + k * 7, S.y - 41, 3, 3); // (its knobs)
  }
  // (the jukebox: chrome and walnut, its arch lit up and cycling, the bubble tubes down its sides)
  const J = B.x1 + 360;
  const jbox = () => ctx.roundRect(J, Y - 90, 50, 90, [22, 22, 2, 2]);
  shaded(ctx, jbox, intact ? '#7C2D12' : '#1C1917', J, Y - 90, 50, 90, 1.5);
  if (intact) {
    for (const tx of [J + 4, J + 43]) for (let k = 0; k < 7; k++) { ctx.fillStyle = `hsl(${(f * 3 + k * 40 + tx) % 360}, 90%, ${60 - (k % 2) * 12}%)`; ctx.fillRect(tx, Y - 76 + k * 10, 3, 10); }
    for (let k = 0; k < 4; k++) { ctx.fillStyle = `hsl(${(f * 3 + k * 24) % 360}, 90%, ${66 - k * 6}%)`; ctx.fillRect(J + 8, Y - 70 + k * 7, 34, k === 3 ? 5 : 7); }
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(J + 10, Y - 68, 2, 22);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(J + 7.5, Y - 70.5, 35, 27);
    pipe(ctx, J + 6, Y - 42, 38, 4, '#D6D3D1');
    ctx.fillStyle = '#FDE047'; ctx.fillRect(J + 10, Y - 36, 30, 4); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(J + 10, Y - 36, 30, 1);
    ctx.fillStyle = '#451A03'; ctx.fillRect(J + 10, Y - 28, 30, 20); ctx.fillStyle = '#CA8A04'; for (let k = 0; k < 5; k++) ctx.fillRect(J + 12 + k * 6, Y - 28, 2, 20);
    ctx.strokeStyle = INK; ctx.strokeRect(J + 9.5, Y - 28.5, 31, 21);
  }
  // (the counter: its top, the paneled front, the brass foot rail; the stools)
  slab(ctx, B.x1 + 480, Y - 56, 270, 12, intact ? '#57341F' : '#1C1410');
  const front = intact ? '#3B2418' : '#140E0B';
  slab(ctx, B.x1 + 486, Y - 44, 258, 44, front);
  for (let x = B.x1 + 494; x < B.x1 + 730; x += 62) { ctx.fillStyle = dark(front, 0.3); ctx.fillRect(x, Y - 38, 54, 24); ctx.fillStyle = lite(front, 0.15); ctx.fillRect(x, Y - 16, 54, 2); ctx.fillRect(x + 52, Y - 38, 2, 24); }
  if (intact) pipe(ctx, B.x1 + 486, Y - 10, 258, 4, '#A16207');
  if (intact) for (const sx of [B.x1 + 510, B.x1 + 580, B.x1 + 650]) {
    column(ctx, sx - 2, Y - 34, 4, 34, '#9CA3AF');
    pipe(ctx, sx - 7, Y - 14, 14, 3, '#9CA3AF');
    slab(ctx, sx - 8, Y - 3, 16, 3, '#57534E', 1);
    ink(ctx, () => ctx.roundRect(sx - 10, Y - 40, 20, 6, 2), '#B91C1C');
    ctx.fillStyle = '#EF4444'; ctx.fillRect(sx - 8, Y - 39, 14, 1);
  }
  // (the pool table: the felt, its wooden rail, pockets, turned legs; the lamp over it on its chain)
  const PT = B.x1 + 800;
  const wood = intact ? '#44291A' : '#140E0B';
  for (const lx of [PT + 6, PT + 126]) { column(ctx, lx, Y - 34, 8, 34, wood); slab(ctx, lx - 2, Y - 22, 12, 5, wood, 1); }
  slab(ctx, PT, Y - 40, 140, 6, intact ? '#5B3A24' : '#1C1917', 1);
  slab(ctx, PT, Y - 46, 140, 6, intact ? '#166534' : '#1C1917', 1);
  if (intact) {
    ctx.fillStyle = INK; for (const px of [PT + 1, PT + 67, PT + 133]) ctx.fillRect(px, Y - 46, 6, 3);
    for (const [bx, c] of [[PT + 36, '#FDE047'], [PT + 88, '#DC2626'], [PT + 100, '#F8FAFC']] as const) { ink(ctx, () => ctx.arc(bx, Y - 49, 3, 0, Math.PI * 2), c); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(bx - 2, Y - 51, 1, 1); }
    ctx.fillStyle = '#57534E'; for (let cy = B.ceil; cy < Y - 152; cy += 4) ctx.fillRect(PT + 69, cy, 2, 2);
    // (the light off it: two hard steps down onto the felt)
    ctx.fillStyle = 'rgba(253, 230, 138, 0.08)'; ctx.beginPath(); ctx.moveTo(PT + 30, Y - 136); ctx.lineTo(PT + 110, Y - 136); ctx.lineTo(PT + 150, Y - 46); ctx.lineTo(PT - 10, Y - 46); ctx.fill();
    ctx.fillStyle = 'rgba(253, 230, 138, 0.08)'; ctx.beginPath(); ctx.moveTo(PT + 44, Y - 136); ctx.lineTo(PT + 96, Y - 136); ctx.lineTo(PT + 120, Y - 46); ctx.lineTo(PT + 20, Y - 46); ctx.fill();
    const shade = () => { ctx.moveTo(PT + 40, Y - 150); ctx.lineTo(PT + 100, Y - 150); ctx.lineTo(PT + 110, Y - 136); ctx.lineTo(PT + 30, Y - 136); ctx.closePath(); };
    shaded(ctx, shade, '#15803D', PT + 30, Y - 150, 80, 14);
    ctx.fillStyle = '#FEF9C3'; ctx.fillRect(PT + 34, Y - 137, 72, 2);
    ctx.fillStyle = '#86EFAC'; ctx.fillRect(PT + 42, Y - 149, 56, 1);
  }
  // The booth, out of the way of the bathroom: its high back at the left end, the seat (him on it, sleeping it off)
  const BT = B.x1 + 956;
  const vinyl = intact ? '#7F1D1D' : '#1C1917';
  shaded(ctx, () => ctx.roundRect(BT, Y - 70, 20, 70, [6, 6, 0, 0]), vinyl, BT, Y - 70, 20, 70);
  slab(ctx, BT + 20, Y - 34, 70, 34, vinyl);
  if (intact) {
    ctx.fillStyle = '#991B1B'; ctx.fillRect(BT + 2, Y - 68, 14, 3); ctx.fillRect(BT + 21, Y - 33, 66, 4);
    ctx.fillStyle = '#450A0A'; for (const ty of [Y - 58, Y - 46]) ctx.fillRect(BT + 9, ty, 2, 2); // (its buttons)
    for (let tx = BT + 30; tx < BT + 88; tx += 18) ctx.fillRect(tx, Y - 30, 2, 2);
    ctx.fillStyle = '#450A0A'; ctx.fillRect(BT + 20, Y - 6, 70, 6); ctx.fillStyle = INK; ctx.fillRect(BT + 20, Y - 7, 70, 1);
  }
  if (intact) {
    // (the toilet in the HOGS: behind its wall till he's in there)
    drawToilet(ctx, false);
    // (the ones taking him out are drawn with him, from the moment they clock it: not stood there twice)
    const busy = b.swirly ? b.swirly.carriers : [];
    b.bikers.forEach((k, i) => { if (!busy.includes(i)) drawBarBiker(ctx, state, k); });
    if (b.swirly) drawSwirly(ctx, state, b);
    drawToilet(ctx, true);
  }
  else for (const g of b.gore) if (g.kind !== 'splat') drawRemains(ctx, g);
  // Choppers lined up out front (the ones that aren't going anywhere again)
  // (on the bit of ground between the last pit and the door, not out over the pit)
  for (let k = 0; k < 2; k++) drawChopperBike(ctx, B.x1 - 110 + k * 64, Y, 0, 0, intact ? ['#111827', '#7F1D1D'][k] : '#1C1917');
};

/** One of them on his break. */
const drawBarBiker = (ctx: Ctx, state: GameState, k: BarBiker) => {
  const f = state.frame, B = COURSE.bar;
  const phase = Math.round(k.x) % 997;
  const at = (x: number, y: number, facing: 1 | -1) => drawKindCorpse(ctx, 'biker', x - 27, y - 72, 54, 72, facing, phase, state);
  switch (k.look) {
    case 'band': {
      at(k.x, B.stage.y, 1);
      // (the guitar: the body, its pickguard, the neck and the headstock)
      const gy = B.stage.y - 40;
      strut(ctx, k.x + 30, gy + 3.5, k.x + 51, gy + 3.5, 3, '#78350F');
      ink(ctx, () => ctx.rect(k.x + 50, gy + 1, 4, 5), '#1C1917');
      ink(ctx, () => { ctx.ellipse(k.x + 13, gy + 5, 8, 6, 0, 0, Math.PI * 2); ctx.ellipse(k.x + 25, gy + 5, 7, 5, 0, 0, Math.PI * 2); }, '#B91C1C');
      ctx.fillStyle = '#EF4444'; ctx.fillRect(k.x + 8, gy + 1, 8, 2);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(k.x + 18, gy + 4, 6, 4);
      ctx.fillStyle = '#111827'; ctx.fillRect(k.x + 26, gy + 3, 2, 4);
      break;
    }
    case 'dance': ctx.save(); ctx.translate(k.x, Y); ctx.rotate(Math.sin(f * 0.15) * 0.12); ctx.translate(-k.x, -Y); at(k.x, Y, -1); ctx.restore(); break;
    case 'counter': case 'counter2':
      at(k.x, Y - 8, 1);
      // (a beer: the glass, the head on it)
      ink(ctx, () => ctx.rect(k.x + 14, Y - 70, 7, 10), '#F59E0B');
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(k.x + 15, Y - 67, 2, 6);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(k.x + 14, Y - 72, 7, 3);
      break;
    case 'bartender':
      at(k.x, Y, -1);
      ink(ctx, () => ctx.rect(k.x - 16, Y - 48, 10, 4), '#F8FAFC');
      ctx.fillStyle = '#DC2626'; ctx.fillRect(k.x - 13, Y - 48, 2, 4);
      break;
    case 'pool': case 'pool2': {
      at(k.x, Y, k.look === 'pool' ? 1 : -1);
      const ex = k.x + (k.look === 'pool' ? 60 : -60), ey = Y - 52 + Math.sin(f * 0.1) * 3;
      strut(ctx, k.x, Y - 42, ex, ey, 2, '#D6B98C');
      strut(ctx, k.x, Y - 42, k.x + (ex - k.x) * 0.3, Y - 42 + (ey - Y + 42) * 0.3, 2.5, '#451A03');
      ctx.fillStyle = '#38BDF8'; ctx.fillRect(Math.round(ex) - 1, Math.round(ey) - 1, 2, 2);
      break;
    }
    // (flat out along the seat: boots at its end, his head up against the back, snoring)
    case 'booth': {
      ctx.save(); ctx.translate(k.x, Y - 52 + Math.sin(f * 0.05)); ctx.rotate(-Math.PI / 2 + 0.06); drawKindCorpse(ctx, 'biker', -27, -72, 54, 72, 1, phase, state); ctx.restore();
      const z = (f % 90) / 90; snore(ctx, k.x - 64 + z * 10, Y - 64 - z * 20, 1 - z); break;
    }
  }
};

/** A charred skeleton where one of them was, a limb, a boot. */
const drawRemains = (ctx: Ctx, g: { x: number; y: number; rot: number; kind: string }) => {
  ctx.save(); ctx.translate(g.x, g.y);
  if (g.kind === 'bones') {
    ctx.scale(g.rot ? -1 : 1, 1);
    // (the pool under him, darker at its edge)
    ctx.fillStyle = '#450A0A'; ctx.beginPath(); ctx.ellipse(0, -2, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.ellipse(-4, -3, 26, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(-14, -5, 8, 1);
    const bone = (draw: () => void) => {
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); draw(); ctx.stroke();
      ctx.strokeStyle = '#44403C'; ctx.lineWidth = 3; ctx.beginPath(); draw(); ctx.stroke();
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1; ctx.beginPath(); draw(); ctx.stroke();
      ctx.lineCap = 'butt';
    };
    bone(() => { ctx.moveTo(-26, -5); ctx.lineTo(14, -5); }); // spine
    bone(() => { for (let k = 0; k < 4; k++) { ctx.moveTo(-6 + k * 6, -5); ctx.quadraticCurveTo(-4 + k * 6, -14, 0 + k * 6, -7); } }); // ribs
    bone(() => { ctx.moveTo(-26, -5); ctx.lineTo(-38, -2); ctx.moveTo(-26, -5); ctx.lineTo(-36, -9); }); // legs
    ink(ctx, () => ctx.arc(22, -8, 7, 0, Math.PI * 2), '#44403C');
    ctx.fillStyle = '#78716C'; ctx.fillRect(18, -13, 4, 2);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(22, -10, 3, 3); ctx.fillRect(18, -10, 2, 3); ctx.fillRect(21, -5, 4, 2);
    ink(ctx, () => ctx.rect(18, -16, 10, 3), '#B91C1C'); // the bandana, still on
  } else if (g.kind === 'limb') {
    ctx.rotate(g.rot);
    ink(ctx, () => ctx.rect(-12, -3, 24, 6), '#7C2D12'); ctx.fillStyle = '#9A3412'; ctx.fillRect(-11, -2, 21, 2); ctx.fillStyle = '#292524'; ctx.fillRect(-6, 0, 6, 2);
    ink(ctx, () => ctx.rect(10, -4, 5, 8), '#B91C1C'); ctx.fillStyle = '#F5F5F4'; ctx.fillRect(13, -1, 3, 2);
  } else {
    ink(ctx, () => { ctx.rect(-8, -8, 16, 8); ctx.rect(4, -14, 6, 8); }, '#111827');
    ctx.fillStyle = '#374151'; ctx.fillRect(-7, -7, 12, 1); ctx.fillRect(5, -13, 1, 6);
    ctx.fillStyle = '#0B0F19'; ctx.fillRect(-8, -2, 16, 2);
    ink(ctx, () => ctx.rect(4, -16, 6, 3), '#B91C1C');
  }
  ctx.restore();
};

/** The shell: the ceiling, the front wall (faded away once he's in), the bathroom's wall (till he's in there), the gas, the flying bits. */
export const drawBarFront = (ctx: Ctx, state: GameState, b: Bar) => {
  if (!near(state)) return;
  const B = COURSE.bar, f = state.frame;
  const intact = barIntact(b);
  const top = B.ceil, W = B.x2 - B.x1;
  // The gas
  if (b.gas > 0 && intact) {
    for (let k = 0; k < 6; k++) gasHaze(ctx, B.x1, W, top + 20 + k * 42 + Math.sin(f * 0.03 + k) * 8, 0.45 * b.gas);
  }
  if (intact) {
    // The bathroom's wall, a door marked HOGS (you've got to go in to see what's in there)
    const R = B.bathroom;
    ctx.save(); ctx.globalAlpha = inBathroom(state) ? 0.15 : 1;
    slab(ctx, R.x1, top, R.x2 - R.x1, Y - top, '#44403C');
    checker(ctx, R.x1 + 2, Y - 30, R.x2 - R.x1 - 4, 28, '#3A3633');
    slab(ctx, R.x1 + 30, Y - 110, 60, 110, '#292524');
    for (const [py, ph] of [[Y - 102, 40], [Y - 54, 46]]) { ctx.fillStyle = '#1C1917'; ctx.fillRect(R.x1 + 38, py, 44, ph); ctx.fillStyle = '#3F3A36'; ctx.fillRect(R.x1 + 38, py + ph - 2, 44, 2); ctx.fillRect(R.x1 + 80, py, 2, ph); }
    slab(ctx, R.x1 + 42, Y - 100, 36, 14, '#B45309', 1);
    letter(ctx, 'HOGS', R.x1 + 60, Y - 90, 'bold 9px monospace', '#F8FAFC', INK);
    column(ctx, R.x1 + 80, Y - 62, 4, 8, '#A8A29E');
    ctx.restore();
    // The ceiling: boards, the joists' ends
    slab(ctx, B.x1 - 20, top - 40, W + 40, 40, '#292524');
    ctx.fillStyle = '#1C1917'; for (let x = B.x1 + 20; x < B.x2; x += 80) ctx.fillRect(x, top - 36, 2, 32);
    ctx.fillStyle = '#3F3A36'; ctx.fillRect(B.x1 - 18, top - 14, W + 36, 2);
    // The front: cinderblock, the door, a window with a beer sign in it, THE BROKEN SPOKE in neon over it
    ctx.save(); ctx.globalAlpha = inside(state) ? 0.1 : 1;
    ctx.fillStyle = brickPattern(ctx, 'oscar-cinderblock', 32, 16, ['#78716C', '#716A65'], '#57534E');
    ctx.fillRect(B.x1, top, W, Y - top);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(B.x1, top, W, 2); ctx.fillRect(B.x1, top, 2, Y - top);
    ctx.fillStyle = '#44403C'; ctx.fillRect(B.x2 - 2, top, 2, Y - top);
    checker(ctx, B.x1, Y - 12, W, 12, '#57534E');
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(B.x1 + 0.5, top + 0.5, W - 1, Y - top - 1);
    slab(ctx, B.x1 + 8, Y - 124, 78, 124, '#44403C');
    slab(ctx, B.x1 + 12, Y - 120, 70, 120, '#1C1917');
    ctx.fillStyle = '#292524'; ctx.fillRect(B.x1 + 18, Y - 112, 58, 40); ctx.fillRect(B.x1 + 18, Y - 64, 58, 56);
    pipe(ctx, B.x1 + 20, Y - 66, 54, 4, '#A8A29E');
    slab(ctx, B.x1 + 294, top + 104, 212, 92, '#44403C');
    bandedGradient(ctx, B.x1 + 300, top + 110, 200, 80, ['#1E293B', '#0F172A', '#020617'], 4);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(B.x1 + 320, top + 190); ctx.lineTo(B.x1 + 360, top + 110); ctx.lineTo(B.x1 + 376, top + 110); ctx.lineTo(B.x1 + 336, top + 190); ctx.fill();
    neon(ctx, 'BUD', B.x1 + 400, top + 158, 20, '#EF4444', true);
    neon(ctx, 'THE BROKEN SPOKE', B.x1 + 700, top + 60, 26, '#EF4444', flick(f));
    neon(ctx, 'BIKERS ONLY', B.x1 + 700, top + 90, 12, '#FBBF24', true);
    ctx.restore();
  } else {
    // What's left of the front and the ceiling: stumps, black, dripping
    stump(ctx, () => { ctx.moveTo(B.x1, Y); ctx.lineTo(B.x1, top + 50); ctx.lineTo(B.x1 + 40, top + 100); ctx.lineTo(B.x1 + 70, top + 70); ctx.lineTo(B.x1 + 110, Y); ctx.closePath(); }, '#1C1917', B.x1, top + 50, 110, Y - top - 50);
    stump(ctx, () => { ctx.moveTo(B.x2, Y); ctx.lineTo(B.x2, top + 90); ctx.lineTo(B.x2 - 50, top + 140); ctx.lineTo(B.x2 - 80, Y); ctx.closePath(); }, '#1C1917', B.x2 - 80, top + 90, 80, Y - top - 90);
    for (let k = 0; k < 5; k++) { const q = ((f + k * 30) % 150) / 150; smoke(ctx, B.x1 + 150 + k * 230 + q * 20, top + 100 - q * 260, 24 + q * 50, q, 0.5); }
  }
  for (const d of b.flying) { ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); flyingBit(ctx, d.w, d.h, d.color); ctx.restore(); }
  // (the back door, while it's locked)
  if (intact) {
    slab(ctx, B.x2 - 22, Y - 110, 22, 110, '#451A03');
    ctx.fillStyle = '#2A1002'; ctx.fillRect(B.x2 - 18, Y - 100, 14, 36); ctx.fillRect(B.x2 - 18, Y - 50, 14, 40);
    ink(ctx, () => ctx.rect(B.x2 - 14, Y - 60, 6, 6), '#FACC15'); ctx.fillStyle = '#FEF9C3'; ctx.fillRect(B.x2 - 13, Y - 59, 2, 2);
  }
};
