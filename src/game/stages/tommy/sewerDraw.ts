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

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 60 && x1 < state.camera.x + CANVAS_WIDTH + 60;

/** Behind everything: the brick, the arches, the pipes, the ceiling. */
export const drawSewerBack = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  const S = COURSE.sewer;
  const x0 = Math.max(S.x1 - 60, state.camera.x - 40), x1 = Math.min(S.x2 + 60, state.camera.x + CANVAS_WIDTH + 40);
  const top = GROUND_Y - 520, bottom = GROUND_Y + 300;
  // The brick
  ctx.fillStyle = '#2A2521'; ctx.fillRect(x0, top, x1 - x0, bottom - top);
  ctx.fillStyle = '#342D28';
  for (let y = top; y < bottom; y += 14) for (let x = Math.floor(x0 / 34) * 34 + ((y / 14) % 2) * 17; x < x1; x += 34) ctx.fillRect(x, y, 31, 11);
  // Arches every so often, black down their middles
  for (let ax = Math.floor(x0 / 420) * 420; ax < x1; ax += 420) {
    ctx.fillStyle = '#16120F'; ctx.beginPath(); ctx.moveTo(ax + 80, WALK_Y); ctx.lineTo(ax + 80, WALK_Y - 190); ctx.arc(ax + 210, WALK_Y - 190, 130, Math.PI, 0); ctx.lineTo(ax + 340, WALK_Y); ctx.fill();
    ctx.strokeStyle = '#4A3F37'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(ax + 210, WALK_Y - 190, 133, Math.PI, 0); ctx.stroke();
  }
  // Slime running down from the ceiling
  ctx.fillStyle = 'rgba(77, 124, 15, 0.35)';
  for (let sx = Math.floor(x0 / 90) * 90; sx < x1; sx += 90) ctx.fillRect(sx + hash(sx) * 40, GROUND_Y - 340, 6, 40 + hash(sx * 3) * 120);
  // Pipes along the wall
  ctx.fillStyle = '#5B4A3B'; ctx.fillRect(x0, GROUND_Y - 262, x1 - x0, 14); ctx.fillStyle = '#6B584A'; ctx.fillRect(x0, GROUND_Y - 262, x1 - x0, 4);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(x0, GROUND_Y - 232, x1 - x0, 8);
  for (let px = Math.floor(x0 / 200) * 200; px < x1; px += 200) { ctx.fillStyle = '#3F3228'; ctx.fillRect(px, GROUND_Y - 266, 10, 22); }
  // The ceiling (and the hole he came in through, the manhole's light down it)
  ctx.fillStyle = '#1A1512'; ctx.fillRect(x0, GROUND_Y - 940, Math.min(x1, S.cistern.x1) - x0, 600);
  if (visible(state, S.drop - 80, S.drop + 80)) {
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(S.drop - 60, GROUND_Y - 520, 120, 182);
    const g = ctx.createLinearGradient(0, GROUND_Y - 520, 0, WALK_Y);
    g.addColorStop(0, 'rgba(253, 230, 138, 0.35)'); g.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(S.drop - 50, GROUND_Y - 340); ctx.lineTo(S.drop + 50, GROUND_Y - 340); ctx.lineTo(S.drop + 110, WALK_Y); ctx.lineTo(S.drop - 110, WALK_Y); ctx.fill();
    ctx.fillStyle = '#57534E'; for (let y = GROUND_Y - 500; y < GROUND_Y - 340; y += 18) ctx.fillRect(S.drop - 20, y, 40, 4); // the ladder rungs
  }
  // The cistern: a big dome, its walls curving over
  const C = S.cistern;
  if (visible(state, C.x1, C.x2)) {
    ctx.fillStyle = '#1C1714'; ctx.beginPath(); ctx.moveTo(C.x1, WALK_Y); ctx.lineTo(C.x1, GROUND_Y - 260); ctx.quadraticCurveTo((C.x1 + C.x2) / 2, GROUND_Y - 560, C.x2, GROUND_Y - 260); ctx.lineTo(C.x2, WALK_Y); ctx.fill();
    ctx.strokeStyle = '#3F352E'; ctx.lineWidth = 3;
    for (let r = 0; r < 4; r++) { ctx.beginPath(); ctx.moveTo(C.x1 + r * 30, GROUND_Y - 260 + r * 40); ctx.quadraticCurveTo((C.x1 + C.x2) / 2, GROUND_Y - 560 + r * 60, C.x2 - r * 30, GROUND_Y - 260 + r * 40); ctx.stroke(); }
    // The rack by the door, with the second suit on it (it's there all along, behind the glass)
    const rx = C.rack;
    ctx.fillStyle = '#44403C'; ctx.fillRect(rx - 30, WALK_Y - 120, 60, 120);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.25)'; ctx.fillRect(rx - 26, WALK_Y - 116, 52, 100);
    if (rt.escape.phase === 'waiting' || rt.escape.phase === 'rumble' || rt.escape.phase === 'run') drawSuitOnHook(ctx, rx, WALK_Y - 110);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(rx - 30, WALK_Y - 134, 60, 14); ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('EMERGENCY', rx, WALK_Y - 124); ctx.textAlign = 'left';
  }
  // The lockers with the suits in them
  S.lockers.forEach((lx, i) => {
    if (!visible(state, lx - 40, lx + 40)) return;
    ctx.fillStyle = '#57534E'; ctx.fillRect(lx - 26, WALK_Y - 110, 52, 110);
    ctx.fillStyle = '#44403C'; for (let y = WALK_Y - 100; y < WALK_Y - 70; y += 5) ctx.fillRect(lx - 18, y, 36, 2);
    if (!rt.sewer.opened[i]) drawSuitOnHook(ctx, lx, WALK_Y - 64, 0.6);
    else { ctx.fillStyle = '#0C0A09'; ctx.fillRect(lx - 22, WALK_Y - 66, 44, 62); ctx.fillStyle = '#57534E'; ctx.save(); ctx.translate(lx + 26, WALK_Y - 66); ctx.rotate(-0.5); ctx.fillRect(0, 0, 44, 62); ctx.restore(); }
    ctx.fillStyle = '#FACC15'; ctx.fillRect(lx - 26, WALK_Y - 124, 52, 12); ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('HAZMAT SUIT', lx, WALK_Y - 116); ctx.textAlign = 'left';
  });

};

/** A yellow hazmat suit hung up (hood, arms, the boots). */
const drawSuitOnHook = (ctx: Ctx, x: number, y: number, s = 1) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(-2, -6, 4, 8);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(0, 10, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-7, 6, 14, 6);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-14, 20, 28, 40); ctx.fillRect(-20, 22, 6, 32); ctx.fillRect(14, 22, 6, 32); ctx.fillRect(-12, 60, 10, 30); ctx.fillRect(2, 60, 10, 30);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-13, 86, 12, 5); ctx.fillRect(1, 86, 12, 5);
  ctx.restore();
};

/** Concrete, poured in slabs: the joints, a crack here and there, stains running down. */
const concrete = (ctx: Ctx, x1: number, x2: number, top: number, bottom: number) => {
  ctx.fillStyle = '#433D38';
  for (let y = top + 50; y < bottom; y += 64) ctx.fillRect(x1, y, x2 - x1, 2);
  for (let x = Math.ceil(x1 / 96) * 96; x < x2; x += 96) ctx.fillRect(x, top, 2, bottom - top);
  ctx.strokeStyle = '#38332F'; ctx.lineWidth = 1.5;
  for (let x = Math.ceil(x1 / 70) * 70; x < x2; x += 70) {
    if (hash(x) < 0.55) continue;
    const y0 = top + 10 + hash(x * 3) * 60;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 8 - hash(x * 5) * 16, y0 + 18); ctx.lineTo(x + 3, y0 + 34); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(28, 25, 23, 0.25)';
  for (let x = Math.ceil(x1 / 45) * 45; x < x2; x += 45) ctx.fillRect(x + hash(x * 7) * 20, top, 4 + hash(x) * 6, 30 + hash(x * 9) * 90);
};

/** The bottom of a channel: dark silt in drifts, and what's settled in it (stones, a bone, a can, a tire). */
const silt = (ctx: Ctx, x1: number, x2: number, top: number, bottom: number) => {
  ctx.fillStyle = '#1F1A15'; ctx.fillRect(x1, top, x2 - x1, bottom - top);
  ctx.fillStyle = '#2B241D';
  ctx.beginPath(); ctx.moveTo(x1, top + 6);
  for (let x = x1; x <= x2; x += 20) ctx.lineTo(x, top + 2 + Math.sin(x * 0.05) * 3 + hash(x) * 4);
  ctx.lineTo(x2, top + 26); ctx.lineTo(x1, top + 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#171310'; for (let y = top + 34; y < bottom; y += 16) for (let x = x1 + ((y / 16) % 2) * 20; x < x2; x += 40) ctx.fillRect(x + hash(x + y) * 12, y, 12, 2);
  for (let x = Math.ceil(x1 / 38) * 38; x < x2 - 10; x += 38) {
    const k = hash(x * 11), y = top + 3 + hash(x * 13) * 10;
    if (k < 0.35) { ctx.fillStyle = '#4A433C'; ctx.beginPath(); ctx.ellipse(x, y, 5 + hash(x) * 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (k < 0.45) { ctx.fillStyle = '#D6D3C4'; ctx.fillRect(x - 7, y - 1, 14, 3); ctx.beginPath(); ctx.arc(x - 7, y, 2.5, 0, Math.PI * 2); ctx.arc(x + 7, y, 2.5, 0, Math.PI * 2); ctx.fill(); }
    else if (k < 0.52) { ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x - 4, y - 5, 8, 10); ctx.fillStyle = '#A8A29E'; ctx.fillRect(x - 4, y - 5, 8, 2); }
    else if (k < 0.56) { ctx.strokeStyle = '#0C0A09'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y + 2, 12, 5, 0.1, 0, Math.PI * 2); ctx.stroke(); }
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
      ctx.fillStyle = '#6B635C'; ctx.fillRect(r.x1, r.y1, r.x2 - r.x1, 6);
      ctx.fillStyle = '#CA8A04'; for (let x = r.x1; x < r.x2; x += 28) ctx.fillRect(x, r.y1 + 6, 14, 3);
      ctx.fillStyle = 'rgba(77, 124, 15, 0.3)'; for (let x = r.x1 + 20; x < r.x2; x += 110) ctx.fillRect(x + hash(x) * 50, r.y1 + 12, 30 + hash(x * 3) * 40, 60);
    } else if (r.surface === 'muck') {
      // The channel: its walls down to its floor (the muck's drawn over it, in front): old brick going down, silt and
      // junk on the bottom
      ctx.fillStyle = '#231E1A'; ctx.fillRect(r.x1, WALK_Y, r.x2 - r.x1, r.y1 - WALK_Y);
      ctx.fillStyle = '#2C2520';
      for (let y = WALK_Y + 4; y < r.y1; y += 12) for (let x = r.x1 + ((y / 12) % 2) * 14 - 14; x < r.x2; x += 28) ctx.fillRect(Math.max(r.x1, x), y, Math.min(24, r.x2 - Math.max(r.x1, x)), 8);
      ctx.fillStyle = 'rgba(77, 124, 15, 0.18)'; ctx.fillRect(r.x1, WALK_Y, r.x2 - r.x1, 40); // (the tide mark)
      silt(ctx, r.x1, r.x2, r.y1, bottom);
    }
  }
  // Grates and pipe runs to stand on
  for (const l of COURSE.ledges) {
    if (!visible(state, l.x, l.x + l.w)) continue;
    if (l.look === 'grate') {
      ctx.fillStyle = '#374151'; ctx.fillRect(l.x, l.y, l.w, 8);
      ctx.fillStyle = '#1F2937'; for (let x = l.x + 4; x < l.x + l.w; x += 7) ctx.fillRect(x, l.y + 1, 3, 6);
      ctx.fillStyle = '#4B5563'; ctx.fillRect(l.x + 6, l.y + 8, 5, 60); ctx.fillRect(l.x + l.w - 11, l.y + 8, 5, 60);
    } else if (l.look === 'hangpipe') {
      // Hung from the roof on two rods, brackets round it, a flange at each end
      ctx.fillStyle = '#44403C'; ctx.fillRect(l.x + 16, WALK_Y - 340, 4, l.y - (WALK_Y - 340)); ctx.fillRect(l.x + l.w - 20, WALK_Y - 340, 4, l.y - (WALK_Y - 340));
      ctx.fillStyle = '#5B4A3B'; ctx.fillRect(l.x, l.y, l.w, 16); ctx.fillStyle = '#6B584A'; ctx.fillRect(l.x, l.y, l.w, 5);
      ctx.fillStyle = '#3F3228'; ctx.fillRect(l.x - 3, l.y - 2, 8, 20); ctx.fillRect(l.x + l.w - 5, l.y - 2, 8, 20);
      ctx.fillStyle = '#57534E'; ctx.fillRect(l.x + 12, l.y + 3, 12, 14); ctx.fillRect(l.x + l.w - 24, l.y + 3, 12, 14);
      ctx.fillStyle = 'rgba(77, 124, 15, 0.5)'; ctx.fillRect(l.x + l.w / 2, l.y + 16, 3, 8); // (a drip of the muck off it)
    } else if (l.look === 'pipe') {
      ctx.fillStyle = '#5B4A3B'; ctx.fillRect(l.x, l.y, l.w, 16); ctx.fillStyle = '#6B584A'; ctx.fillRect(l.x, l.y, l.w, 5);
      ctx.fillStyle = '#3F3228'; for (let x = l.x; x < l.x + l.w; x += 60) ctx.fillRect(x, l.y - 2, 10, 20);
      ctx.fillStyle = '#44403C'; ctx.fillRect(l.x + 20, l.y + 16, 6, WALK_Y - l.y - 16); ctx.fillRect(l.x + l.w - 26, l.y + 16, 6, WALK_Y - l.y - 16);
    }
  }
};

/** The pipes that drip, the drops swelling on them, the drops falling. */
export const drawDrips = (ctx: Ctx, state: GameState, rt: TommyRuntime) => {
  for (const d of COURSE.drips) {
    if (!visible(state, d.x - 20, d.x + 20)) continue;
    ctx.fillStyle = '#5B4A3B'; ctx.fillRect(d.x - 14, d.y - 20, 28, 20); ctx.fillStyle = '#3F3228'; ctx.fillRect(d.x - 6, d.y, 12, 6);
    const k = dripPhase(d, state.frame);
    ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(d.x, d.y + 7 + k * 5, 2 + k * 4, 2 + k * 6, 0, 0, Math.PI * 2); ctx.fill();
    // (a stain on the walkway under it: this is where it lands)
    ctx.fillStyle = 'rgba(132, 204, 22, 0.35)'; ctx.beginPath(); ctx.ellipse(d.x, WALK_Y + 1, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#A3E635';
  for (const dr of rt.sewer.drops) { ctx.beginPath(); ctx.ellipse(dr.x, dr.y, 3.5, 6, 0, 0, Math.PI * 2); ctx.fill(); }
};

/** In front of him: the muck in every channel (he's in it, not on it), and the flooded tunnel's low roof and pipes. */
export const drawMuckFront = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const c of COURSE.channels) {
    if (!visible(state, c.x1, c.x2)) continue;
    const bottom = c.floor;
    const g = ctx.createLinearGradient(0, c.surface, 0, bottom);
    // (thick, but he's still to be seen in it; up in the street holes it's the tap water, rust-brown, not the sewer's green)
    const street = c.x1 < COURSE.road.x1;
    if (street) { g.addColorStop(0, 'rgba(133, 77, 14, 0.66)'); g.addColorStop(1, 'rgba(46, 26, 8, 0.9)'); }
    else { g.addColorStop(0, 'rgba(92, 104, 36, 0.62)'); g.addColorStop(1, 'rgba(38, 44, 14, 0.86)'); }
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(c.x1, bottom);
    for (let x = c.x1; x <= c.x2; x += 16) ctx.lineTo(x, c.surface + Math.sin(x * 0.05 + f * 0.05) * 1.5);
    ctx.lineTo(c.x2, bottom); ctx.closePath(); ctx.fill();
    // The scum on top, things in it
    ctx.fillStyle = street ? 'rgba(214, 163, 92, 0.55)' : 'rgba(190, 200, 90, 0.55)'; for (let x = c.x1 + ((f * 0.3) % 40); x < c.x2; x += 40) ctx.fillRect(x, c.surface - 1, 16, 2);
    for (let x = c.x1 + 30; x < c.x2 - 20; x += 90) {
      const h = hash(x);
      if (h < 0.3) { ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, c.surface - 3, 8, 4); } // a bottle
      else if (h < 0.45) { ctx.fillStyle = '#A16207'; ctx.fillRect(x, c.surface - 2, 14, 3); }
      else if (h < 0.5) { ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.arc(x, c.surface, 4, Math.PI, 0); ctx.fill(); } // (don't ask)
    }
    if (f % 20 < 10) { ctx.fillStyle = 'rgba(217, 249, 157, 0.6)'; ctx.beginPath(); ctx.arc(c.x1 + hash(Math.floor(f / 20) + c.x1) * (c.x2 - c.x1), c.surface - 2, 3, 0, Math.PI * 2); ctx.fill(); }
  }
  // The tunnel and the pit: their roofs, right down on the muck, and the pipes, grates and baffles in them
  const T = COURSE.sewer.tunnel, PT = COURSE.sewer.pit;
  for (const [r1, r2] of [[T.roof1, T.roof2], [PT.roof1, PT.roof2]]) {
    if (!visible(state, r1, r2)) continue;
    ctx.fillStyle = '#231E1A'; ctx.fillRect(r1, T.roof - 400, r2 - r1, 400);
    ctx.fillStyle = '#342D28'; for (let x = r1; x < r2; x += 34) ctx.fillRect(x, T.roof - 12, 31, 10);
    ctx.fillStyle = 'rgba(77, 124, 15, 0.5)'; for (let x = r1; x < r2; x += 60) ctx.fillRect(x + hash(x) * 30, T.roof, 5, 8 + hash(x * 7) * 18);
  }
  if (visible(state, T.x1, PT.x2)) {
    for (const b of COURSE.bars) {
      if (!visible(state, b.x, b.x + b.w)) continue;
      if (b.y1 <= T.roof) { ctx.fillStyle = '#5B4A3B'; ctx.fillRect(b.x, b.y1, b.w, b.y2 - b.y1); ctx.fillStyle = '#6B584A'; ctx.fillRect(b.x + 4, b.y1, 8, b.y2 - b.y1); ctx.fillStyle = '#3F3228'; ctx.fillRect(b.x - 4, b.y2 - 12, b.w + 8, 12); }
      else { ctx.fillStyle = '#374151'; ctx.fillRect(b.x, b.y1, b.w, b.y2 - b.y1); ctx.fillStyle = '#1F2937'; for (let y = b.y1 + 4; y < b.y2; y += 8) ctx.fillRect(b.x + 3, y, b.w - 6, 3); }
    }
  }
};

/** Chunks of the cistern's roof coming down. */
export const drawChunks = (ctx: Ctx, rt: TommyRuntime) => {
  ctx.fillStyle = '#44403C';
  for (const c of rt.escape.chunks) { ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); }
};
