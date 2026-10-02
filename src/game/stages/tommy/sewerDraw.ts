// Down in the sewer: brick tunnels (old, arched, sweating), pipes along the
// walls, the walkways, the channels of the muck (thick, green-brown, things
// floating in it, a scum on top that catches the light), grates across them,
// the pipes that drip, the locker with the suit in it; the flooded tunnel with
// its roof right down on the muck; the cistern, big and round and domed.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, WALK_Y } from './course';
import type { TommyRuntime } from './runtime';
import { dripPhase } from './sewer';
import { checker, hazeBands, tilePattern } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 60 && x1 < state.camera.x + CANVAS_WIDTH + 60;

/**
 * Old sewer brick as a tile: courses `course` tall, bricks `brick` wide, every one its own tone of `tints`, a lit lip
 * along its top, a shadow along its bottom and right, mortar between, the odd chip out of it.
 */
export const sewerBrick = (ctx: Ctx, key: string, brick: number, course: number, tints: string[], mortar: string) => tilePattern(ctx, key, brick * 4, course * 4, g => {
  g.fillStyle = mortar; g.fillRect(0, 0, brick * 4, course * 4);
  for (let row = 0; row < 4; row++) for (let i = -1; i < 5; i++) {
    const x = i * brick + (row % 2 ? brick / 2 : 0), y = row * course;
    const c = tints[Math.floor(hash(i * 7 + row * 13 + brick) * tints.length)];
    g.fillStyle = c; g.fillRect(x, y, brick - 3, course - 3);
    g.fillStyle = lite(c, 0.1); g.fillRect(x, y, brick - 3, 1);
    g.fillStyle = dark(c, 0.25); g.fillRect(x, y + course - 4, brick - 3, 1); g.fillRect(x + brick - 4, y + 1, 1, course - 4);
    if (hash(i * 3 + row * 5 + brick) > 0.75) { g.fillStyle = dark(c, 0.35); g.fillRect(x + 4 + hash(i + row) * (brick - 12), y + 3, 2, 2); }
  }
});

/** A round pipe run from x1 to x2 at y, h thick, lit along its top: four steps of `c`, an ink line top and bottom. */
const pipeRun = (ctx: Ctx, x1: number, x2: number, y: number, h: number, c: string) => {
  const w = x2 - x1;
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x1, y, w, h);
  ctx.fillStyle = c; ctx.fillRect(x1, y + 1, w, Math.ceil(h * 0.6));
  ctx.fillStyle = lite(c, 0.18); ctx.fillRect(x1, y + 1, w, Math.ceil(h * 0.3));
  ctx.fillStyle = lite(c, 0.4); ctx.fillRect(x1, y + 2, w, 1);
  ctx.fillStyle = INK; ctx.fillRect(x1, y, w, 1); ctx.fillRect(x1, y + h - 1, w, 1);
};

/** A collar round a pipe (a joint, a bracket): shaded, inked, bolts. */
const collar = (ctx: Ctx, x: number, y: number, w: number, h: number, c = '#3F3228') => {
  shaded(ctx, () => ctx.rect(x, y, w, h), c, x, y, w, h, 1);
  ctx.fillStyle = lite(c, 0.35); ctx.fillRect(x + 2, y + 2, 2, 2); ctx.fillRect(x + 2, y + h - 4, 2, 2);
};

/** Behind everything: the brick, the arches, the pipes, the ceiling. */
export const drawSewerBack = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const S = COURSE.sewer;
  const x0 = Math.max(S.x1 - 60, state.camera.x - 40), x1 = Math.min(S.x2 + 60, state.camera.x + CANVAS_WIDTH + 40);
  const top = GROUND_Y - 520, bottom = GROUND_Y + 300;
  // The brick, sweating: grimier and greener down toward the walkway, darker up into the vault
  ctx.fillStyle = sewerBrick(ctx, 'tommySewer', 34, 14, ['#342D28', '#38302A', '#2F2924', '#3A312A'], '#221D1A'); ctx.fillRect(x0, top, x1 - x0, bottom - top);
  hazeBands(ctx, x0, GROUND_Y - 340, x1 - x0, 120, '#0C0A09', 0.45, 0, 4);
  hazeBands(ctx, x0, WALK_Y - 90, x1 - x0, 90, '#2D3A12', 0, 0.35, 4);
  // Arches every so often: a ring of wedge bricks round them, a keystone, the dark going back in steps
  for (let ax = Math.floor(x0 / 420) * 420; ax < x1; ax += 420) {
    const cx = ax + 210, cy = WALK_Y - 190;
    const opening = () => { ctx.moveTo(ax + 80, WALK_Y); ctx.lineTo(ax + 80, cy); ctx.arc(cx, cy, 130, Math.PI, 0); ctx.lineTo(ax + 340, WALK_Y); ctx.closePath(); };
    ctx.beginPath(); opening(); ctx.fillStyle = '#16120F'; ctx.fill();
    ctx.save(); ctx.beginPath(); opening(); ctx.clip();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(0, 0, 0, ${0.18 + k * 0.1})`; ctx.beginPath(); ctx.moveTo(ax + 80 + 16 * (k + 1), WALK_Y); ctx.lineTo(ax + 80 + 16 * (k + 1), cy); ctx.arc(cx, cy, 130 - 16 * (k + 1), Math.PI, 0); ctx.lineTo(ax + 340 - 16 * (k + 1), WALK_Y); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // (the jambs: a column of dressed stone either side)
    for (const jx of [ax + 70, ax + 340]) for (let y = cy; y < WALK_Y; y += 16) { const c = ((y - cy) / 16) % 2 ? '#4A3F37' : '#544840'; ink(ctx, () => ctx.rect(jx, y, 10, 15), c, 1); ctx.fillStyle = lite(c, 0.15); ctx.fillRect(jx + 1, y + 1, 8, 1); }
    for (let k = 0; k < 15; k++) {
      const a0 = Math.PI + (k / 15) * Math.PI, a1 = Math.PI + ((k + 1) / 15) * Math.PI, r0 = 130, r1 = k === 7 ? 146 : 140;
      const c = k === 7 ? '#5E5248' : k % 2 ? '#4A3F37' : '#544840';
      ink(ctx, () => { ctx.arc(cx, cy, r1, a0, a1); ctx.arc(cx, cy, r0, a1, a0, true); ctx.closePath(); }, c, 1);
      ctx.strokeStyle = lite(c, 0.18); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r1 - 1.5, a0 + 0.02, a1 - 0.02); ctx.stroke();
    }
  }
  // Slime running down from the ceiling: a lit edge, a dark edge, a drip swelling at the end of each
  for (let sx = Math.floor(x0 / 90) * 90; sx < x1; sx += 90) {
    const px = Math.round(sx + hash(sx) * 40), len = Math.round(40 + hash(sx * 3) * 120), y0 = GROUND_Y - 340;
    ctx.fillStyle = 'rgba(77, 124, 15, 0.45)'; ctx.fillRect(px, y0, 6, len);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.35)'; ctx.fillRect(px, y0, 2, len - 4);
    ctx.fillStyle = 'rgba(26, 46, 5, 0.5)'; ctx.fillRect(px + 5, y0, 1, len);
    checker(ctx, px - 2, y0 + len - 10, 10, 10, 'rgba(77, 124, 15, 0.45)');
    ctx.fillStyle = 'rgba(101, 163, 13, 0.6)'; ctx.fillRect(px + 1, y0 + len, 4, 4);
    ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; ctx.fillRect(px + 1, y0 + len, 1, 1);
  }
  // Pipes along the wall: a big rusted main on brackets, a smaller conduit under it, the stains they've left
  pipeRun(ctx, x0, x1, GROUND_Y - 262, 14, '#6B584A');
  pipeRun(ctx, x0, x1, GROUND_Y - 232, 8, '#4B5563');
  for (let px = Math.floor(x0 / 200) * 200; px < x1; px += 200) {
    collar(ctx, px, GROUND_Y - 266, 10, 22);
    ctx.fillStyle = 'rgba(120, 53, 15, 0.3)'; ctx.fillRect(px + 3, GROUND_Y - 244, 4, 10 + hash(px) * 30); // (rust bled down the brick)
    shaded(ctx, () => ctx.rect(px + 100, GROUND_Y - 234, 6, 12), '#374151', px + 100, GROUND_Y - 234, 6, 12, 1);
  }
  // The ceiling: brick in the dark, its bottom course lit by what light there is (and the hole he came in through, the
  // manhole's light down it)
  const cw = Math.min(x1, S.cistern.x1) - x0;
  if (cw > 0) {
    ctx.fillStyle = sewerBrick(ctx, 'tommyCeil', 34, 14, ['#201A16', '#241D18', '#1D1714'], '#141110'); ctx.fillRect(x0, GROUND_Y - 940, cw, 600);
    ctx.fillStyle = '#2E2620'; ctx.fillRect(x0, GROUND_Y - 346, cw, 6);
    ctx.fillStyle = '#4A3F37'; ctx.fillRect(x0, GROUND_Y - 346, cw, 1);
    ctx.fillStyle = INK; ctx.fillRect(x0, GROUND_Y - 340, cw, 1);
  }
  if (visible(state, S.drop - 80, S.drop + 80)) {
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(S.drop - 60, GROUND_Y - 520, 120, 182);
    ctx.fillStyle = '#1C1714'; ctx.fillRect(S.drop - 60, GROUND_Y - 520, 6, 182); ctx.fillRect(S.drop + 54, GROUND_Y - 520, 6, 182);
    // (the light: a shaft widening down to the walkway, brightest up top, in steps)
    const sy = GROUND_Y - 340, steps = 6, span = WALK_Y - sy;
    for (let k = 0; k < steps; k++) {
      const y0 = sy + (span * k) / steps, y1 = sy + (span * (k + 1)) / steps;
      const w0 = 50 + 60 * (k / steps), w1 = 50 + 60 * ((k + 1) / steps);
      ctx.fillStyle = `rgba(253, 230, 138, ${(0.32 * (1 - k / steps)).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(S.drop - w0, y0); ctx.lineTo(S.drop + w0, y0); ctx.lineTo(S.drop + w1, y1); ctx.lineTo(S.drop - w1, y1); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(253, 230, 138, 0.25)'; ctx.beginPath(); ctx.ellipse(S.drop, WALK_Y, 110, 6, 0, Math.PI, 0); ctx.fill();
    // (the ladder: its rails, rungs lit along their tops)
    shaded(ctx, () => ctx.rect(S.drop - 24, GROUND_Y - 520, 4, 182), '#44403C', S.drop - 24, GROUND_Y - 520, 4, 182, 1);
    shaded(ctx, () => ctx.rect(S.drop + 20, GROUND_Y - 520, 4, 182), '#44403C', S.drop + 20, GROUND_Y - 520, 4, 182, 1);
    for (let y = GROUND_Y - 500; y < GROUND_Y - 340; y += 18) { ink(ctx, () => ctx.rect(S.drop - 20, y, 40, 4), '#57534E', 1); ctx.fillStyle = '#A8A29E'; ctx.fillRect(S.drop - 19, y + 0.5, 38, 1); }
  }
  // The cistern: a big dome, its walls curving over, ribs of brick round it lit along their tops
  const C = S.cistern;
  if (visible(state, C.x1, C.x2)) {
    const mid = (C.x1 + C.x2) / 2;
    const dome = () => { ctx.moveTo(C.x1, WALK_Y); ctx.lineTo(C.x1, GROUND_Y - 260); ctx.quadraticCurveTo(mid, GROUND_Y - 560, C.x2, GROUND_Y - 260); ctx.lineTo(C.x2, WALK_Y); ctx.closePath(); };
    ctx.save(); ctx.beginPath(); dome(); ctx.clip();
    ctx.fillStyle = sewerBrick(ctx, 'tommyDome', 40, 16, ['#1C1714', '#201A16', '#191411'], '#110E0C'); ctx.fillRect(C.x1, GROUND_Y - 420, C.x2 - C.x1, 420);
    hazeBands(ctx, C.x1, GROUND_Y - 420, C.x2 - C.x1, 240, '#0C0A09', 0.6, 0, 5);
    ctx.restore();
    for (let r = 0; r < 4; r++) {
      const rib = () => { ctx.beginPath(); ctx.moveTo(C.x1 + r * 30, GROUND_Y - 260 + r * 40); ctx.quadraticCurveTo(mid, GROUND_Y - 560 + r * 60, C.x2 - r * 30, GROUND_Y - 260 + r * 40); };
      rib(); ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.stroke();
      rib(); ctx.strokeStyle = '#3F352E'; ctx.lineWidth = 5; ctx.stroke();
      ctx.save(); ctx.translate(0, -1.5); rib(); ctx.strokeStyle = '#5A4C42'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    // The rack by the door, with the second suit on it (it's there all along, behind the glass)
    const rx = C.rack;
    shaded(ctx, () => ctx.rect(rx - 30, WALK_Y - 120, 60, 120), '#44403C', rx - 30, WALK_Y - 120, 60, 120, 1.2);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(rx - 26, WALK_Y - 116, 52, 100);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.12)'; ctx.fillRect(rx - 26, WALK_Y - 116, 52, 100);
    if (rt.escape.phase === 'waiting' || rt.escape.phase === 'rumble' || rt.escape.phase === 'run') drawSuitOnHook(ctx, rx, WALK_Y - 110);
    // (the glass over it: tinted, two glints across it, its frame)
    ctx.fillStyle = 'rgba(186, 230, 253, 0.16)'; ctx.fillRect(rx - 26, WALK_Y - 116, 52, 100);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (const [gx, gw] of [[-20, 6], [-10, 2]]) { ctx.beginPath(); ctx.moveTo(rx + gx, WALK_Y - 116); ctx.lineTo(rx + gx + gw, WALK_Y - 116); ctx.lineTo(rx + gx + gw - 30, WALK_Y - 40); ctx.lineTo(rx + gx - 30, WALK_Y - 40); ctx.closePath(); ctx.save(); ctx.clip(); ctx.fillRect(rx - 26, WALK_Y - 116, 52, 100); ctx.restore(); }
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(rx - 26.5, WALK_Y - 116.5, 53, 101);
    ctx.fillStyle = '#A8A29E'; ctx.fillRect(rx + 20, WALK_Y - 70, 3, 10); // (the latch)
    shadedTop(ctx, () => ctx.rect(rx - 30, WALK_Y - 134, 60, 14), '#DC2626', rx - 30, WALK_Y - 134, 60, 14, 1);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('EMERGENCY', rx, WALK_Y - 124); ctx.textAlign = 'left';
  }
  // The lockers with the suits in them
  S.lockers.forEach((lx, i) => {
    if (!visible(state, lx - 40, lx + 40)) return;
    shaded(ctx, () => ctx.rect(lx - 26, WALK_Y - 110, 52, 110), '#57534E', lx - 26, WALK_Y - 110, 52, 110, 1.2);
    ctx.fillStyle = '#78716C'; ctx.fillRect(lx - 25, WALK_Y - 109, 50, 1);
    // (the vents: slots, each lit along its bottom lip)
    for (let y = WALK_Y - 100; y < WALK_Y - 70; y += 5) { ctx.fillStyle = '#1C1917'; ctx.fillRect(lx - 18, y, 36, 2); ctx.fillStyle = '#8A837C'; ctx.fillRect(lx - 18, y + 2, 36, 1); }
    checker(ctx, lx - 24, WALK_Y - 20, 48, 18, 'rgba(120, 53, 15, 0.4)'); // (rust up from the damp)
    if (!rt.sewer.opened[i]) {
      drawSuitOnHook(ctx, lx, WALK_Y - 64, 0.6);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(lx + 18, WALK_Y - 60, 3, 12); ctx.fillStyle = INK; ctx.fillRect(lx + 21, WALK_Y - 60, 1, 12); // (the handle)
    } else {
      // (swung open: the dark inside, the door hanging off its hinges, its back to us)
      ink(ctx, () => ctx.rect(lx - 22, WALK_Y - 66, 44, 62), '#0C0A09', 1);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(lx - 21, WALK_Y - 65, 42, 3); ctx.fillStyle = '#44403C'; ctx.fillRect(lx - 8, WALK_Y - 60, 16, 2); // (the empty hook rail)
      ctx.save(); ctx.translate(lx + 26, WALK_Y - 66); ctx.rotate(-0.5);
      shaded(ctx, () => ctx.rect(0, 0, 44, 62), '#57534E', 0, 0, 44, 62, 1);
      ctx.fillStyle = '#3F3A36'; ctx.fillRect(6, 6, 32, 50);
      ctx.fillStyle = '#6B635C'; ctx.fillRect(6, 6, 32, 1);
      ctx.restore();
    }
    shadedTop(ctx, () => ctx.rect(lx - 26, WALK_Y - 124, 52, 12), '#FACC15', lx - 26, WALK_Y - 124, 52, 12, 1);
    ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('HAZMAT SUIT', lx, WALK_Y - 116); ctx.textAlign = 'left';
  });

};

/** A yellow hazmat suit hung up (hood, visor, arms, the boots): inked, lit down the left, creased. */
const drawSuitOnHook = (ctx: Ctx, x: number, y: number, s = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const Y_ = '#FACC15';
  shaded(ctx, () => ctx.rect(-2, -6, 4, 8), '#6B7280', -2, -6, 4, 8, 1);
  shaded(ctx, () => ctx.rect(-20, 22, 6, 32), Y_, -20, 22, 6, 32, 1.2);
  shaded(ctx, () => ctx.rect(14, 22, 6, 32), Y_, 14, 22, 6, 32, 1.2);
  shaded(ctx, () => ctx.rect(-12, 60, 10, 30), Y_, -12, 60, 10, 30, 1.2);
  shaded(ctx, () => ctx.rect(2, 60, 10, 30), Y_, 2, 60, 10, 30, 1.2);
  shaded(ctx, () => ctx.roundRect(-14, 20, 28, 42, 3), Y_, -14, 20, 28, 42, 1.2);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(-1, 24, 2, 34); ctx.fillRect(-10, 46, 8, 1); ctx.fillRect(4, 40, 7, 1); // (the zip, the creases)
  shaded(ctx, () => ctx.arc(0, 10, 11, 0, Math.PI * 2), Y_, -11, -1, 22, 22, 1.2);
  ink(ctx, () => ctx.roundRect(-7, 6, 14, 6, 2), '#1F2937', 1);
  ctx.fillStyle = '#64748B'; ctx.fillRect(-5, 7, 4, 1);
  ink(ctx, () => ctx.rect(-13, 86, 12, 5), '#1C1917', 1); ink(ctx, () => ctx.rect(1, 86, 12, 5), '#1C1917', 1);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-12, 86.5, 10, 1); ctx.fillRect(2, 86.5, 10, 1);
  ctx.restore();
};

/** Concrete, poured in slabs: the joints (a lit lip under each), a crack here and there, stains running down, grit. */
const concrete = (ctx: Ctx, x1: number, x2: number, top: number, bottom: number) => {
  checker(ctx, x1, top, x2 - x1, bottom - top, 'rgba(0, 0, 0, 0.06)');
  for (let y = top + 50; y < bottom; y += 64) { ctx.fillStyle = '#332E2A'; ctx.fillRect(x1, y, x2 - x1, 2); ctx.fillStyle = '#5A534D'; ctx.fillRect(x1, y + 2, x2 - x1, 1); }
  for (let x = Math.ceil(x1 / 96) * 96; x < x2; x += 96) { ctx.fillStyle = '#332E2A'; ctx.fillRect(x, top, 2, bottom - top); ctx.fillStyle = '#5A534D'; ctx.fillRect(x + 2, top, 1, bottom - top); }
  ctx.lineWidth = 1.5;
  for (let x = Math.ceil(x1 / 70) * 70; x < x2; x += 70) {
    if (hash(x) < 0.55) continue;
    const y0 = top + 10 + hash(x * 3) * 60, mx = x + 8 - hash(x * 5) * 16;
    ctx.strokeStyle = '#2A2522'; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(mx, y0 + 18); ctx.lineTo(x + 3, y0 + 34); ctx.stroke();
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 1.5, y0); ctx.lineTo(mx + 1.5, y0 + 18); ctx.stroke(); ctx.lineWidth = 1.5;
  }
  for (let x = Math.ceil(x1 / 45) * 45; x < x2; x += 45) {
    const sx = Math.round(x + hash(x * 7) * 20), sw = Math.round(4 + hash(x) * 6), sh = Math.round(30 + hash(x * 9) * 90);
    ctx.fillStyle = 'rgba(28, 25, 23, 0.25)'; ctx.fillRect(sx, top, sw, sh);
    checker(ctx, sx - 2, top + sh, sw + 4, 8, 'rgba(28, 25, 23, 0.3)');
  }
};

/** The bottom of a channel: dark silt in drifts (lit along their crests), and what's settled in it (stones, a bone, a can, a tire). */
const silt = (ctx: Ctx, x1: number, x2: number, top: number, bottom: number) => {
  ctx.fillStyle = '#1F1A15'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
  const drift = () => { ctx.beginPath(); ctx.moveTo(x1, top + 6); for (let x = x1; x <= x2; x += 20) ctx.lineTo(x, top + 2 + Math.sin(x * 0.05) * 3 + hash(x) * 4); ctx.lineTo(x2, top + 26); ctx.lineTo(x1, top + 26); ctx.closePath(); };
  drift(); ctx.fillStyle = '#2B241D'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, top + 6); for (let x = x1; x <= x2; x += 20) ctx.lineTo(x, top + 2 + Math.sin(x * 0.05) * 3 + hash(x) * 4); ctx.strokeStyle = '#3D342A'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  checker(ctx, x1, top + 20, x2 - x1, 6, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = '#171310'; for (let y = top + 34; y < bottom; y += 16) for (let x = x1 + ((y / 16) % 2) * 20; x < x2; x += 40) ctx.fillRect(x + hash(x + y) * 12, y, 12, 2);
  for (let x = Math.ceil(x1 / 38) * 38; x < x2 - 10; x += 38) {
    const k = hash(x * 11), y = top + 3 + hash(x * 13) * 10;
    if (k < 0.35) { const c = '#4A433C'; ink(ctx, () => ctx.ellipse(x, y, 5 + hash(x) * 5, 3, 0, 0, Math.PI * 2), c, 1); ctx.fillStyle = lite(c, 0.2); ctx.fillRect(x - 3, y - 2, 4, 1); }
    else if (k < 0.45) { ink(ctx, () => { ctx.rect(x - 7, y - 1, 14, 3); ctx.moveTo(x - 4.5, y); ctx.arc(x - 7, y, 2.5, 0, Math.PI * 2); ctx.moveTo(x + 9.5, y); ctx.arc(x + 7, y, 2.5, 0, Math.PI * 2); }, '#D6D3C4', 0.8); ctx.fillStyle = '#F5F5EE'; ctx.fillRect(x - 5, y - 1, 9, 1); }
    else if (k < 0.52) { shaded(ctx, () => ctx.rect(x - 4, y - 5, 8, 10), '#7F1D1D', x - 4, y - 5, 8, 10, 0.8); ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 4, y - 5, 8, 2); ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 3, y - 1, 6, 2); }
    else if (k < 0.56) { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(x, y + 2, 12, 5, 0.1, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#27272A'; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = '#52525B'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y + 1, 12, 5, 0.1, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke(); }
  }
};

/** The walkways (concrete, stained, a yellow edge), the channel walls, the grates and pipe runs. */
export const drawSewerGround = (ctx: Ctx, state: GameState) => {
  const bottom = state.camera.y + CANVAS_HEIGHT + 60;
  for (const r of state.groundRuns) {
    if (!visible(state, r.x1, r.x2)) continue;
    if (r.surface === 'walk') {
      ctx.fillStyle = '#4B4540'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, bottom - r.y1);
      // (the concrete under it: poured in slabs, cracked, stained)
      concrete(ctx, r.x1, r.x2, r.y1 + 12, bottom);
      // (the edge: a lit lip, its face, the hazard paint worn along it, a shadow under)
      ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 6);
      ctx.fillStyle = '#8A817A'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 1);
      ctx.fillStyle = '#57504A'; ctx.fillRect(r.x1, r.y1 + 5, r.x2 - r.x1, 1);
      for (let x = r.x1; x < r.x2; x += 28) { const worn = hash(x) > 0.75; ctx.fillStyle = worn ? '#8A6A1A' : '#CA8A04'; ctx.fillRect(x, r.y1 + 6, 14, 3); if (!worn) { ctx.fillStyle = '#FACC15'; ctx.fillRect(x, r.y1 + 6, 14, 1); } }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(r.x1, r.y1 + 9, r.x2 - r.x1, 2);
      for (let x = r.x1 + 20; x < r.x2; x += 110) { const sx = Math.round(x + hash(x) * 50), sw = Math.round(30 + hash(x * 3) * 40); ctx.fillStyle = 'rgba(77, 124, 15, 0.25)'; ctx.fillRect(sx, r.y1 + 12, sw, 52); checker(ctx, sx, r.y1 + 64, sw, 8, 'rgba(77, 124, 15, 0.3)'); }
    } else if (r.surface === 'muck') {
      // The channel: its walls down to its floor (the muck's drawn over it, in front): old brick going down, silt and
      // junk on the bottom
      ctx.fillStyle = sewerBrick(ctx, 'tommyChannel', 28, 12, ['#2C2520', '#29231E', '#302822'], '#1E1915'); ctx.fillRect(r.x1, WALK_Y, r.x2 - r.x1, r.y1 - WALK_Y);
      hazeBands(ctx, r.x1, WALK_Y, r.x2 - r.x1, r.y1 - WALK_Y, '#0C0A09', 0, 0.5, 4);
      ctx.fillStyle = 'rgba(77, 124, 15, 0.2)'; ctx.fillRect(r.x1, WALK_Y, r.x2 - r.x1, 36); // (the tide mark)
      checker(ctx, r.x1, WALK_Y + 36, r.x2 - r.x1, 4, 'rgba(77, 124, 15, 0.25)');
      silt(ctx, r.x1, r.x2, r.y1, bottom);
    }
  }
  // Grates and pipe runs to stand on
  for (const l of COURSE.ledges) {
    if (!visible(state, l.x, l.x + l.w)) continue;
    if (l.look === 'grate') {
      shaded(ctx, () => ctx.rect(l.x + 6, l.y + 8, 5, 60), '#4B5563', l.x + 6, l.y + 8, 5, 60, 1);
      shaded(ctx, () => ctx.rect(l.x + l.w - 11, l.y + 8, 5, 60), '#4B5563', l.x + l.w - 11, l.y + 8, 5, 60, 1);
      ink(ctx, () => ctx.rect(l.x, l.y, l.w, 8), '#374151', 1);
      ctx.fillStyle = '#6B7280'; ctx.fillRect(l.x + 1, l.y + 0.5, l.w - 2, 1);
      for (let x = l.x + 4; x < l.x + l.w; x += 7) { ctx.fillStyle = '#0F141C'; ctx.fillRect(x, l.y + 2, 3, 5); ctx.fillStyle = '#1F2937'; ctx.fillRect(x, l.y + 2, 3, 1); }
      checker(ctx, l.x + 2, l.y + 5, l.w - 4, 2, 'rgba(120, 53, 15, 0.45)');
    } else if (l.look === 'hangpipe') {
      // Hung from the roof on two rods, brackets round it, a flange at each end
      for (const rx of [l.x + 16, l.x + l.w - 20]) shaded(ctx, () => ctx.rect(rx, WALK_Y - 340, 4, l.y - (WALK_Y - 340)), '#44403C', rx, WALK_Y - 340, 4, l.y - (WALK_Y - 340), 1);
      pipeRun(ctx, l.x, l.x + l.w, l.y, 16, '#6B584A');
      ctx.fillStyle = INK; ctx.fillRect(l.x, l.y, 1, 16); ctx.fillRect(l.x + l.w - 1, l.y, 1, 16);
      collar(ctx, l.x - 3, l.y - 2, 8, 20); collar(ctx, l.x + l.w - 5, l.y - 2, 8, 20);
      collar(ctx, l.x + 12, l.y + 3, 12, 14, '#57534E'); collar(ctx, l.x + l.w - 24, l.y + 3, 12, 14, '#57534E');
      checker(ctx, l.x + 30, l.y + 10, Math.max(0, l.w - 60), 4, 'rgba(120, 53, 15, 0.35)');
      ctx.fillStyle = 'rgba(77, 124, 15, 0.6)'; ctx.fillRect(l.x + l.w / 2, l.y + 16, 3, 8); ctx.fillStyle = 'rgba(190, 242, 100, 0.6)'; ctx.fillRect(l.x + l.w / 2, l.y + 22, 1, 1); // (a drip of the muck off it)
    } else if (l.look === 'pipe') {
      shaded(ctx, () => ctx.rect(l.x + 20, l.y + 16, 6, WALK_Y - l.y - 16), '#44403C', l.x + 20, l.y + 16, 6, WALK_Y - l.y - 16, 1);
      shaded(ctx, () => ctx.rect(l.x + l.w - 26, l.y + 16, 6, WALK_Y - l.y - 16), '#44403C', l.x + l.w - 26, l.y + 16, 6, WALK_Y - l.y - 16, 1);
      pipeRun(ctx, l.x, l.x + l.w, l.y, 16, '#6B584A');
      ctx.fillStyle = INK; ctx.fillRect(l.x, l.y, 1, 16); ctx.fillRect(l.x + l.w - 1, l.y, 1, 16);
      for (let x = l.x; x < l.x + l.w; x += 60) collar(ctx, x, l.y - 2, 10, 20);
    }
  }
};

/** The pipes that drip, the drops swelling on them, the drops falling. */
export const drawDrips = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  for (const d of COURSE.drips) {
    if (!visible(state, d.x - 20, d.x + 20)) continue;
    shaded(ctx, () => ctx.rect(d.x - 14, d.y - 20, 28, 20), '#5B4A3B', d.x - 14, d.y - 20, 28, 20, 1);
    ctx.fillStyle = '#7A6656'; ctx.fillRect(d.x - 12, d.y - 18, 2, 14);
    checker(ctx, d.x - 10, d.y - 8, 20, 6, 'rgba(77, 124, 15, 0.5)');
    ink(ctx, () => ctx.rect(d.x - 6, d.y, 12, 6), '#3F3228', 1);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(d.x - 3, d.y + 4, 6, 2);
    const k = dripPhase(d, state.frame);
    const rx = 2 + k * 4, ry = 2 + k * 6, dy = d.y + 7 + k * 5;
    ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(d.x, dy, rx + 0.8, ry + 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(d.x, dy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D9F99D'; ctx.fillRect(d.x - rx * 0.5, dy - ry * 0.5, 1.5, 1.5);
    // (a stain on the walkway under it: this is where it lands)
    ctx.fillStyle = 'rgba(132, 204, 22, 0.35)'; ctx.beginPath(); ctx.ellipse(d.x, WALK_Y + 1, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
    checker(ctx, d.x - 24, WALK_Y - 1, 48, 4, 'rgba(132, 204, 22, 0.3)');
  }
  for (const dr of rt.sewer.drops) {
    ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(dr.x, dr.y, 4.3, 6.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#A3E635'; ctx.beginPath(); ctx.ellipse(dr.x, dr.y, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ECFCCB'; ctx.fillRect(dr.x - 2, dr.y - 2, 1.5, 2);
  }
};

/** In front of him: the muck in every channel (he's in it, not on it), and the flooded tunnel's low roof and pipes. */
export const drawMuckFront = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const c of COURSE.channels) {
    if (!visible(state, c.x1, c.x2)) continue;
    const bottom = c.floor;
    // (thick, but he's still to be seen in it; up in the street holes it's the tap water, rust-brown, not the sewer's
    // green): darker and thicker going down, in bands
    const street = c.x1 < COURSE.road.x1;
    const surf = (x: number) => c.surface + Math.sin(x * 0.05 + f * 0.05) * 1.5;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(c.x1, bottom);
    for (let x = c.x1; x <= c.x2; x += 16) ctx.lineTo(x, surf(x));
    ctx.lineTo(c.x2, bottom); ctx.closePath(); ctx.clip();
    const h = bottom - c.surface + 4;
    hazeBands(ctx, c.x1, c.surface - 3, c.x2 - c.x1, h, street ? '#2E1A08' : '#262C0E', 0.42, 0.84, 6);
    hazeBands(ctx, c.x1, c.surface - 3, c.x2 - c.x1, h * 0.6, street ? '#854D0E' : '#5C6824', 0.4, 0, 4);
    // (the light catching the top of it)
    ctx.fillStyle = street ? 'rgba(180, 110, 40, 0.4)' : 'rgba(132, 150, 50, 0.4)'; ctx.fillRect(c.x1, c.surface - 3, c.x2 - c.x1, 6);
    ctx.restore();
    // The scum on top, things in it
    ctx.fillStyle = street ? 'rgba(214, 163, 92, 0.6)' : 'rgba(190, 200, 90, 0.6)'; for (let x = c.x1 + ((f * 0.3) % 40); x < c.x2; x += 40) { ctx.fillRect(x, c.surface - 1, 16, 2); ctx.fillRect(x + 4, c.surface + 2, 6, 1); }
    for (let x = c.x1 + 30; x < c.x2 - 20; x += 90) {
      const h = hash(x);
      if (h < 0.3) { ink(ctx, () => ctx.rect(x, c.surface - 3, 8, 4), '#E2E8F0', 0.8); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 1, c.surface - 3, 5, 1); ctx.fillStyle = '#2563EB'; ctx.fillRect(x + 8, c.surface - 2, 2, 2); } // a bottle
      else if (h < 0.45) { ink(ctx, () => ctx.rect(x, c.surface - 2, 14, 3), '#A16207', 0.8); ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 1, c.surface - 2, 12, 1); }
      else if (h < 0.5) { ink(ctx, () => ctx.arc(x, c.surface, 4, Math.PI, 0), '#D6D3D1', 0.8); ctx.fillStyle = INK; ctx.fillRect(x - 2, c.surface - 2, 1.5, 1.5); ctx.fillRect(x + 1, c.surface - 2, 1.5, 1.5); } // (don't ask)
    }
    if (f % 20 < 10) {
      const bx = c.x1 + hash(Math.floor(f / 20) + c.x1) * (c.x2 - c.x1);
      ctx.strokeStyle = 'rgba(217, 249, 157, 0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(bx, c.surface - 2, 3, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(247, 254, 231, 0.8)'; ctx.fillRect(bx - 1.5, c.surface - 4, 1, 1);
    }
  }
  // The tunnel and the pit: their roofs, right down on the muck, and the pipes, grates and baffles in them
  const T = COURSE.sewer.tunnel, PT = COURSE.sewer.pit;
  for (const [r1, r2] of [[T.roof1, T.roof2], [PT.roof1, PT.roof2]]) {
    if (!visible(state, r1, r2)) continue;
    ctx.fillStyle = sewerBrick(ctx, 'tommySewer', 34, 14, ['#342D28', '#38302A', '#2F2924', '#3A312A'], '#221D1A'); ctx.fillRect(r1, T.roof - 400, r2 - r1, 400);
    hazeBands(ctx, r1, T.roof - 400, r2 - r1, 380, '#0C0A09', 0.7, 0.2, 5);
    ctx.fillStyle = '#4A3F37'; ctx.fillRect(r1, T.roof - 12, r2 - r1, 10); ctx.fillStyle = '#5E5248'; ctx.fillRect(r1, T.roof - 12, r2 - r1, 1);
    ctx.fillStyle = '#221D1A'; for (let x = r1; x < r2; x += 34) ctx.fillRect(x + 31, T.roof - 12, 3, 10);
    ctx.fillStyle = INK; ctx.fillRect(r1, T.roof - 2, r2 - r1, 2); ctx.fillRect(r1, T.roof - 400, 1, 400); ctx.fillRect(r2 - 1, T.roof - 400, 1, 400);
    for (let x = r1; x < r2; x += 60) { const sx = Math.round(x + hash(x) * 30), sl = Math.round(8 + hash(x * 7) * 18); ctx.fillStyle = 'rgba(77, 124, 15, 0.6)'; ctx.fillRect(sx, T.roof, 5, sl); ctx.fillStyle = 'rgba(190, 242, 100, 0.45)'; ctx.fillRect(sx, T.roof, 1, sl - 2); ctx.fillRect(sx + 1, T.roof + sl, 3, 2); }
  }
  if (visible(state, T.x1, PT.x2)) {
    for (const b of COURSE.bars) {
      if (!visible(state, b.x, b.x + b.w)) continue;
      if (b.y1 <= T.roof) {
        // (a pipe down from the roof: lit down its left, a collar at its foot)
        shaded(ctx, () => ctx.rect(b.x, b.y1, b.w, b.y2 - b.y1), '#5B4A3B', b.x, b.y1, b.w, b.y2 - b.y1, 1.2);
        ctx.fillStyle = '#8A7462'; ctx.fillRect(b.x + 4, b.y1, 2, b.y2 - b.y1);
        checker(ctx, b.x + 2, b.y1, b.w - 4, b.y2 - b.y1, 'rgba(77, 124, 15, 0.12)');
        collar(ctx, b.x - 4, b.y2 - 12, b.w + 8, 12);
      } else {
        // (a grate up off the floor: its bars, inked, slime caught in them)
        ink(ctx, () => ctx.rect(b.x, b.y1, b.w, b.y2 - b.y1), '#374151', 1.2);
        ctx.fillStyle = '#4B5563'; ctx.fillRect(b.x + 1, b.y1 + 1, 2, b.y2 - b.y1 - 2);
        for (let y = b.y1 + 4; y < b.y2; y += 8) { ctx.fillStyle = '#0F141C'; ctx.fillRect(b.x + 3, y, b.w - 6, 3); ctx.fillStyle = '#6B7280'; ctx.fillRect(b.x + 3, y + 3, b.w - 6, 1); }
        checker(ctx, b.x + 1, b.y1 + 1, b.w - 2, 10, 'rgba(77, 124, 15, 0.4)');
      }
    }
  }
};

/** Chunks of the cistern's roof coming down: brick and mortar, lit on top, inked. */
export const drawChunks = (ctx: Ctx, rt: TommyRuntime) => {
  for (const c of rt.escape.chunks) {
    ink(ctx, () => { for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2, rr = c.r * (0.8 + hash(k + c.r) * 0.3); ctx.lineTo(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr); } ctx.closePath(); }, '#44403C', 1.2);
    ctx.fillStyle = '#6B635C'; ctx.fillRect(c.x - c.r * 0.6, c.y - c.r * 0.6, c.r * 0.8, c.r * 0.35);
    ctx.fillStyle = '#292524'; ctx.fillRect(c.x - c.r * 0.2, c.y + c.r * 0.3, c.r * 0.8, c.r * 0.3);
    ctx.fillStyle = '#5B3A29'; ctx.fillRect(c.x - c.r * 0.3, c.y - c.r * 0.1, c.r * 0.6, c.r * 0.3); // (a brick still in it)
  }
};
