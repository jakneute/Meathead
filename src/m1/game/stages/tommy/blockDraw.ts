// The block before the corner, drawn: the holes caved in where the mains burst
// (broken asphalt round the lip, the dirt going down, the broken pipe in the
// side), the porch roofs the crew stand up on, the car sunk to its roof, the
// pallets floating, a dumpster, a burned-out car on its roof; the sheared-off
// hydrants (a puddle round each, swelling and bubbling before it goes) and the
// water they blow up, in front of everything.

import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, GROUND_Y } from '../../../constants';
import { COURSE, Ledge, Solid, Main } from './course';
import { mainNow, mainBox, MAIN_W } from './block';
import { bandedGradient, checker } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, dark, lite } from '../../render/npc/kit';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 80 && x1 < state.camera.x + CANVAS_WIDTH + 80;
/** Only what's up on the block (the sewer has its own channels and ledges). */
const onBlock = (x: number) => x >= COURSE.hood.x1 && x < COURSE.road.x1;

export const drawBlockBack = (ctx: Ctx, state: GameState) => {
  for (const c of COURSE.channels) if (onBlock(c.x1) && visible(state, c.x1, c.x2)) drawHole(ctx, c.x1, c.x2, c.floor);
  for (const s of COURSE.solids) if (visible(state, s.x, s.x + s.w)) drawSolid(ctx, s);
  for (const l of COURSE.ledges) if (onBlock(l.x) && visible(state, l.x, l.x + l.w)) drawLedge(ctx, l, state.frame);
  for (const m of COURSE.mains) if (visible(state, m.x - 40, m.x + 40)) drawMainBase(ctx, m, state.frame);
};

export const drawBlockFront = (ctx: Ctx, state: GameState) => {
  for (const m of COURSE.mains) {
    if (!visible(state, m.x - 40, m.x + 40)) continue;
    const now = mainNow(m, state.frame);
    if (now.state === 'blast' && now.height > 2) drawColumn(ctx, m, now.height, state.frame);
  }
};

// ---------------------------------------------------------------------------

/** A hole where the street caved in: the dirt going down, a broken pipe sticking out of the side, broken slabs of
 * the road hanging in over the lip, a sawhorse knocked over by the near edge. (The water's drawn in front, with the sewer's.) */
const drawHole = (ctx: Ctx, x1: number, x2: number, floor: number) => {
  const w = x2 - x1;
  // The dirt, darker going down, in bands
  bandedGradient(ctx, x1, Y, w, floor - Y, ['#4A3728', '#3E2E21', '#2E2219', '#1C140E'], 8);
  ctx.fillStyle = '#1C140E'; ctx.fillRect(x1 - 1, floor, w + 2, 600); // (and on down, under the silt)
  // (the layers it's cut through: a dark seam, a lit lip over it)
  for (let y = Y + 14; y < floor; y += 17) {
    const yy = Math.round(y + hash(y) * 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'; ctx.fillRect(x1, yy, w, 3);
    ctx.fillStyle = 'rgba(255, 220, 170, 0.06)'; ctx.fillRect(x1, yy - 2, w, 2);
    checker(ctx, x1, yy + 3, w, 2, 'rgba(0, 0, 0, 0.18)', (yy / 2) & 1);
  }
  // Stones in it: inked, lit on top
  for (let i = 0; i < w / 22; i++) {
    const sx = x1 + hash(x1 + i * 3.7) * w, sy = Y + 10 + hash(i * 9.1 + x1) * (floor - Y - 10);
    const rw = 4 + hash(i) * 6, rh = 3 + hash(i * 2) * 3, c = i % 3 ? '#5B4B3E' : '#6B5B4E';
    ink(ctx, () => ctx.ellipse(sx, sy, rw, rh, 0, 0, Math.PI * 2), c, 1);
    ctx.fillStyle = lite(c, 0.25); ctx.fillRect(sx - rw * 0.6, sy - rh * 0.6, rw * 0.7, 1.5);
    ctx.fillStyle = dark(c, 0.3); ctx.fillRect(sx - rw * 0.4, sy + rh * 0.3, rw, 1.2);
  }
  // The burst main, broken off in the far wall, rusted through: a cast-iron pipe lit along its top, a flange, the jagged end
  const py = Y + 26;
  shadedTop(ctx, () => ctx.rect(x2 - 46, py, 46, 18), '#5C3A21', x2 - 46, py, 46, 18, 1);
  ctx.fillStyle = '#9A5A2C'; ctx.fillRect(x2 - 44, py + 2, 42, 1);
  shaded(ctx, () => ctx.rect(x2 - 22, py - 2, 6, 22), '#4A2E1A', x2 - 22, py - 2, 6, 22, 1);
  ctx.fillStyle = '#2A170C'; ctx.fillRect(x2 - 21, py + 1, 1, 1); ctx.fillRect(x2 - 21, py + 15, 1, 1);
  checker(ctx, x2 - 40, py + 10, 14, 6, 'rgba(180, 83, 9, 0.5)');
  ink(ctx, () => { ctx.moveTo(x2 - 46, py - 2); ctx.lineTo(x2 - 52, py + 6); ctx.lineTo(x2 - 44, py + 10); ctx.lineTo(x2 - 50, py + 20); ctx.lineTo(x2 - 44, py + 20); ctx.closePath(); }, '#3B2414', 1);
  ctx.fillStyle = '#0E0804'; ctx.fillRect(x2 - 49, py + 6, 3, 10); // (the bore of it)
  // (a trickle out of it, in two tones)
  ctx.fillStyle = 'rgba(120, 53, 15, 0.6)'; ctx.fillRect(x2 - 52, py + 18, 5, 26);
  ctx.fillStyle = 'rgba(214, 163, 92, 0.45)'; ctx.fillRect(x2 - 51, py + 18, 1, 24);
  // Rebar and a hunk of curb in the near wall
  for (const [lw, c] of [[4, INK], [2, '#7C4A24']] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, Y + 6); ctx.lineTo(x1 + 22, Y + 16); ctx.moveTo(x1, Y + 12); ctx.lineTo(x1 + 16, Y + 26); ctx.stroke();
  }
  // Slabs of the road broken off round the lip, tipped in: asphalt, the sidewalk's lit edge, an ink line round
  for (const [sx, dir] of [[x1, 1], [x2, -1]] as const) {
    ink(ctx, () => { ctx.moveTo(sx, Y - 1); ctx.lineTo(sx + dir * 30, Y + 4); ctx.lineTo(sx + dir * 24, Y + 18); ctx.lineTo(sx, Y + 12); ctx.closePath(); }, '#3F3F46', 1);
    ctx.fillStyle = '#2E2E33'; ctx.beginPath(); ctx.moveTo(sx, Y + 8); ctx.lineTo(sx + dir * 26, Y + 12); ctx.lineTo(sx + dir * 24, Y + 18); ctx.lineTo(sx, Y + 12); ctx.closePath(); ctx.fill();
    ink(ctx, () => { ctx.moveTo(sx, Y - 2); ctx.lineTo(sx + dir * 30, Y + 3); ctx.lineTo(sx + dir * 30, Y + 7); ctx.lineTo(sx, Y + 3); ctx.closePath(); }, '#A8A29E', 1);
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(Math.min(sx, sx + dir * 20), Y - 1, 20, 1);
    // (cracks running back from the edge)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx, Y + 2); ctx.lineTo(sx - dir * 26, Y + 8); ctx.lineTo(sx - dir * 44, Y + 5); ctx.moveTo(sx - dir * 26, Y + 8); ctx.lineTo(sx - dir * 34, Y + 22); ctx.stroke();
  }
  // A sawhorse knocked over by the near edge, its sign half off
  const bx = x1 - 70;
  shaded(ctx, () => ctx.rect(bx + 4, Y - 5, 3, 5), '#78716C', bx + 4, Y - 5, 3, 5, 1);
  shaded(ctx, () => ctx.rect(bx + 36, Y - 5, 3, 5), '#78716C', bx + 36, Y - 5, 3, 5, 1);
  ink(ctx, () => ctx.rect(bx, Y - 12, 44, 8), '#F8FAFC', 1);
  ctx.fillStyle = '#EA580C'; for (let s = 0; s < 44; s += 11) ctx.fillRect(bx + s, Y - 12, 5, 8);
  ctx.fillStyle = 'rgba(26, 11, 6, 0.25)'; ctx.fillRect(bx, Y - 7, 44, 3);
  ctx.save(); ctx.translate(bx + 30, Y - 4); ctx.rotate(0.35);
  ink(ctx, () => ctx.rect(0, -14, 34, 12), '#F97316', 1);
  ctx.fillStyle = '#FDBA74'; ctx.fillRect(1, -13, 32, 1); ctx.fillStyle = '#C2410C'; ctx.fillRect(1, -4, 32, 1);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.fillText('ROAD', 7, -9); ctx.fillText('CLOSED', 3, -4);
  ctx.restore();
};

const drawSolid = (ctx: Ctx, s: Solid) => {
  const { x, y, w, h } = s;
  if (s.look === 'dumpster') {
    // Body (tapering in to the bottom): lit down the left, shadowed right, ribs pressed in, rust, a tag sprayed on it
    const body = () => { ctx.moveTo(x, y + 6); ctx.lineTo(x + w, y + 6); ctx.lineTo(x + w - 6, y + h - 8); ctx.lineTo(x + 6, y + h - 8); ctx.closePath(); };
    shaded(ctx, body, '#14532D', x, y + 6, w, h - 14, 1.2);
    ctx.save(); ctx.beginPath(); body(); ctx.clip();
    ctx.fillStyle = '#166534'; ctx.fillRect(x, y + 6, w, 7);
    ctx.fillStyle = '#22A04D'; ctx.fillRect(x, y + 6, w, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(x, y + 13, w, 1);
    for (let rx = x + 14; rx < x + w - 8; rx += 18) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)'; ctx.fillRect(rx + 2, y + 14, 3, h - 24);
      ctx.fillStyle = 'rgba(134, 239, 172, 0.18)'; ctx.fillRect(rx, y + 14, 2, h - 24);
    }
    checker(ctx, x + 8, y + h - 20, 22, 10, 'rgba(146, 64, 14, 0.7)');
    ctx.fillStyle = 'rgba(146, 64, 14, 0.55)'; ctx.fillRect(x + 10, y + h - 18, 16, 6);
    checker(ctx, x + w - 30, y + 20, 12, 18, 'rgba(146, 64, 14, 0.7)', 1);
    ctx.restore();
    for (const [lw, c] of [[3.5, '#701A75'], [2, '#E879F9']] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x + 20, y + 34); ctx.quadraticCurveTo(x + 34, y + 20, x + 44, y + 36); ctx.quadraticCurveTo(x + 54, y + 22, x + 70, y + 32); ctx.stroke();
    }
    // Wheels: casters, a hub glint
    for (const wx of [x + 14, x + w - 14]) { ink(ctx, () => ctx.arc(wx, y + h - 5, 5, 0, Math.PI * 2), '#18181B', 1); ctx.fillStyle = '#71717A'; ctx.fillRect(wx - 1, y + h - 6, 2, 2); }
    // The lid down on it (what he stands on), not quite shut: a trash bag and a pizza box squashed in under the far end
    ink(ctx, () => ctx.ellipse(x + w - 26, y + 5, 12, 5, 0, Math.PI, 0), '#27272A', 1);
    ctx.fillStyle = '#52525B'; ctx.fillRect(x + w - 32, y + 1, 6, 1);
    ink(ctx, () => ctx.rect(x + w - 16, y + 1, 12, 4), '#E7E5E4', 0.8);
    ctx.fillStyle = '#B91C1C'; ctx.fillRect(x + w - 13, y + 2, 5, 1);
    ink(ctx, () => { ctx.moveTo(x - 2, y + 7); ctx.lineTo(x - 2, y + 2); ctx.lineTo(x + w + 2, y - 1); ctx.lineTo(x + w + 2, y + 4); ctx.closePath(); }, '#15803D', 1);
    ctx.fillStyle = '#22A04D'; ctx.beginPath(); ctx.moveTo(x - 1, y + 2.5); ctx.lineTo(x + w + 1, y - 0.5); ctx.lineTo(x + w + 1, y + 1); ctx.lineTo(x - 1, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4ADE80'; ctx.fillRect(x + 4, y + 2, 20, 1);
    return;
  }
  // A car burned out and left on its roof: the chassis up top (what you stand on), wheels up, one still on
  shaded(ctx, () => ctx.rect(x + 4, y + 16, w - 8, h - 18), '#292524', x + 4, y + 16, w - 8, h - 18, 1.2); // (the body, upside down)
  ink(ctx, () => ctx.rect(x + 22, y + h - 12, w - 44, 12), '#1C1917', 1);                          // (the crushed roof under it)
  ctx.fillStyle = '#0C0A09'; for (let wx = x + 30; wx < x + w - 34; wx += 30) ctx.fillRect(wx, y + h - 10, 22, 7); // (no glass)
  ctx.fillStyle = '#44403C'; for (let wx = x + 30; wx < x + w - 34; wx += 30) ctx.fillRect(wx, y + h - 10, 22, 1);
  // (the paint that's left, blistered, along the sill)
  ctx.fillStyle = '#57534E'; ctx.fillRect(x + 6, y + 18, w - 12, 2);
  checker(ctx, x + 8, y + 22, w - 16, 4, 'rgba(120, 113, 108, 0.35)');
  shadedTop(ctx, () => ctx.rect(x, y + 6, w, 12), '#3F2A1D', x, y + 6, w, 12, 1);                 // chassis
  ctx.fillStyle = '#5E412C'; ctx.fillRect(x + 1, y + 7, w - 2, 1);
  ctx.fillStyle = '#2A1C12'; for (let rx = x + 12; rx < x + w - 8; rx += 22) ctx.fillRect(rx, y + 8, 2, 8); // (crossmembers)
  shadedTop(ctx, () => ctx.rect(x + 10, y + 2, w - 20, 5), '#57534E', x + 10, y + 2, w - 20, 5, 1); // exhaust, driveshaft
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(x + 12, y + 2.5, w - 24, 1);
  for (let rx = x + 6; rx < x + w - 10; rx += 26) { const rr = rx + hash(rx) * 8, ry = y + 18 + hash(rx * 3) * 16; checker(ctx, rr, ry, 14, 8, 'rgba(180, 83, 9, 0.7)', 0); ctx.fillStyle = 'rgba(180, 83, 9, 0.5)'; ctx.fillRect(rr + 2, ry + 2, 10, 4); } // rust
  // Wheels up: a tire still on one (tread, the rim), a bare rim on the other
  ink(ctx, () => ctx.arc(x + 26, y + 4, 13, Math.PI, 0), '#18181B', 1);
  ctx.fillStyle = '#3F3F46'; for (let a = 0; a < 6; a++) { const t = Math.PI + (a + 0.5) * Math.PI / 6; ctx.fillRect(x + 26 + Math.cos(t) * 11 - 1, y + 4 + Math.sin(t) * 11 - 1, 2, 2); }
  ink(ctx, () => ctx.arc(x + 26, y + 4, 6, Math.PI, 0), '#71717A', 1);
  ctx.fillStyle = '#D4D4D8'; ctx.fillRect(x + 22, y, 3, 1);
  ink(ctx, () => ctx.arc(x + w - 26, y + 4, 8, Math.PI, 0), '#52525B', 1);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + w - 30, y + 1, 3, 2);
  // Soot up the side, dithered
  checker(ctx, x + w * 0.6 - 34, y + h - 26, 68, 18, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.beginPath(); ctx.ellipse(x + w * 0.6, y + h - 16, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
};

const drawLedge = (ctx: Ctx, l: Ledge, frame: number) => {
  const { x, y, w } = l;
  if (l.look === 'porchroof') {
    // The porch under it: its floor boards, an old couch out on it, the posts holding it up (one's been patched)
    shaded(ctx, () => ctx.rect(x + 2, Y - 22, w - 4, 22), '#57534E', x + 2, Y - 22, w - 4, 22, 1);
    ctx.fillStyle = '#78716C'; ctx.fillRect(x + 3, Y - 21, w - 6, 2);
    ctx.fillStyle = '#3A3530'; for (let sx = x + 8; sx < x + w - 8; sx += 22) ctx.fillRect(sx, Y - 19, 2, 19);
    ctx.fillStyle = '#6E6760'; for (let sx = x + 10; sx < x + w - 8; sx += 22) ctx.fillRect(sx, Y - 19, 1, 19);
    const cx = x + w / 2;
    shaded(ctx, () => ctx.rect(cx - 34, Y - 44, 68, 14), '#6B5B3E', cx - 34, Y - 44, 68, 14, 1);
    shaded(ctx, () => ctx.roundRect(cx - 38, Y - 54, 10, 24, 3), '#6B5B3E', cx - 38, Y - 54, 10, 24, 1);
    shaded(ctx, () => ctx.roundRect(cx + 28, Y - 54, 10, 24, 3), '#6B5B3E', cx + 28, Y - 54, 10, 24, 1);
    shadedTop(ctx, () => ctx.roundRect(cx - 28, Y - 60, 56, 16, 3), '#7C6A4A', cx - 28, Y - 60, 56, 16, 1);
    ctx.fillStyle = '#5A4A30'; ctx.fillRect(cx - 1, Y - 58, 1, 13); ctx.fillRect(cx - 1, Y - 43, 1, 12);
    checker(ctx, cx - 20, Y - 40, 14, 6, 'rgba(26, 11, 6, 0.3)'); // (a stain)
    ctx.fillStyle = '#D6D3D1'; ctx.fillRect(cx + 10, Y - 47, 2, 3); // (a spring through it)
    shaded(ctx, () => ctx.rect(x + 6, y + 12, 7, Y - 22 - y - 12), '#6B4F3A', x + 6, y + 12, 7, Y - 22 - y - 12, 1);
    shaded(ctx, () => ctx.rect(x + w - 13, y + 12, 7, Y - 22 - y - 12), '#6B4F3A', x + w - 13, y + 12, 7, Y - 22 - y - 12, 1);
    ink(ctx, () => ctx.rect(x + w - 15, y + 40, 11, 5), '#A16207', 0.8);
    ctx.fillStyle = '#E7E5E4'; ctx.fillRect(x + w - 14, y + 42, 1, 1); ctx.fillRect(x + w - 6, y + 42, 1, 1);
    // The roof: shingles in staggered rows (each lit on its top), a fascia board, the gutter hanging off one end
    ink(ctx, () => ctx.rect(x - 6, y, w + 12, 12), '#3F3A36', 1);
    for (let row = 0; row < 2; row++) for (let sx = x - 6 + row * 7; sx < x + w + 6; sx += 14) {
      const sw = Math.min(12, x + w + 6 - sx), c = hash(sx + row) > 0.8 ? '#5E544C' : '#524A44';
      ctx.fillStyle = c; ctx.fillRect(sx, y + 1 + row * 5, sw, 4);
      ctx.fillStyle = lite(c, 0.18); ctx.fillRect(sx, y + 1 + row * 5, sw, 1);
      ctx.fillStyle = '#2A2623'; ctx.fillRect(sx + sw - 1, y + 1 + row * 5, 1, 4);
    }
    shadedTop(ctx, () => ctx.rect(x - 6, y + 10, w + 12, 4), '#E7E5E4', x - 6, y + 10, w + 12, 4, 1);
    for (const [lw, c] of [[5, INK], [3, '#A8A29E']] as const) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x - 6, y + 14); ctx.lineTo(x + w * 0.6, y + 16); ctx.lineTo(x + w + 4, y + 34); ctx.stroke();
    }
    ctx.strokeStyle = '#D6D3D1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, y + 13); ctx.lineTo(x + w * 0.6, y + 15); ctx.stroke();
    // (the top you stand on: a fresh plank lip along it, lit bright, inked, nailed: this one's real, unlike the houses'
    // porch roofs back behind the fences)
    ink(ctx, () => ctx.rect(x - 7, y - 3, w + 14, 5), '#C8A46A', 1);
    ctx.fillStyle = '#F5E2B8'; ctx.fillRect(x - 6, y - 2, w + 12, 2);
    ctx.fillStyle = '#8A6A3A'; ctx.fillRect(x - 6, y + 1, w + 12, 1);
    ctx.fillStyle = '#3F3A36'; for (let nx = x; nx < x + w; nx += 24) ctx.fillRect(nx, y - 1, 1, 1);
    return;
  }
  if (l.look === 'carroof') {
    // A car sunk to its roof: the roof, the tops of the windows, the doors going down into the water
    shaded(ctx, () => ctx.roundRect(x - 10, y + 10, w + 20, 60, 6), '#3B5B7A', x - 10, y + 10, w + 20, 60, 1.2);
    ctx.fillStyle = '#2A4560'; ctx.fillRect(x - 8, y + 36, w + 16, 2); // (the belt line)
    ctx.fillStyle = '#6B8FB0'; ctx.fillRect(x - 8, y + 34, w + 16, 1);
    shadedTop(ctx, () => ctx.roundRect(x, y, w, 14, [8, 8, 2, 2]), '#4A6E92', x, y, w, 14, 1);
    ctx.fillStyle = '#8FB3D4'; ctx.fillRect(x + 6, y + 1.5, w - 12, 1);
    for (const wx of [x + 6, x + w / 2 + 4]) {
      const ww = w / 2 - 10;
      ink(ctx, () => ctx.rect(wx, y + 14, ww, 18), '#0F172A', 1);
      ctx.fillStyle = '#1E293B'; ctx.fillRect(wx + 1, y + 15, ww - 2, 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.fillRect(wx + 6, y + 16, 3, 12); ctx.fillRect(wx + 11, y + 16, 1, 8);
    }
    ctx.fillStyle = '#2A4560'; ctx.fillRect(x + w / 2 - 2, y + 14, 4, 30); // (the pillar between them)
    checker(ctx, x + 4, y + 2, 20, 4, 'rgba(146, 64, 14, 0.7)'); // (rust spots)
    return;
  }
  // A pallet floating on it (bobbing, a little): the deck slats, the stringers under, each inked, the grain
  const bob = Math.round(Math.sin(frame * 0.08 + x) * 1.2);
  ctx.fillStyle = '#854D0E'; for (let sx = x + 2; sx < x + w; sx += 12) { ink(ctx, () => ctx.rect(sx, y + 5 + bob, 7, 6), '#854D0E', 0.8); ctx.fillStyle = '#A16207'; ctx.fillRect(sx + 1, y + 6 + bob, 2, 4); }
  ink(ctx, () => ctx.rect(x, y + bob, w, 5), '#A16207', 1);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(x + 1, y + bob, w - 2, 1);
  ctx.fillStyle = '#713F12'; for (let sx = x + 4; sx < x + w - 4; sx += 9) ctx.fillRect(sx, y + 2 + bob, 4, 1);
  ctx.fillStyle = '#44403C'; for (let sx = x + 4; sx < x + w; sx += 12) ctx.fillRect(sx, y + 1 + bob, 1, 1); // (nail heads)
};

const STUB = { lit: '#EF4444', mid: '#B91C1C', dark: '#7F1D1D', deep: '#450A0A' };

/** Where a main comes up: a hydrant sheared off at the curb (its cap in the gutter, the puddle round it), or the end of
 * the broken main up out of the water. It rattles and the puddle swells before it goes. */
const drawMainBase = (ctx: Ctx, m: Main, frame: number) => {
  const now = mainNow(m, frame);
  const warn = now.state === 'warn' ? now.k : now.state === 'blast' ? 1 : 0;
  const shake = now.state === 'warn' ? Math.round(Math.sin(frame * 2.3) * 1.3 * now.k) : 0;
  if (m.look === 'hydrant') {
    // The puddle (swelling as it's about to go): rust-brown, a lighter rim of it
    const pw = 26 + warn * 14, ph = 3 + warn * 2;
    ctx.fillStyle = 'rgba(120, 53, 15, 0.55)'; ctx.beginPath(); ctx.ellipse(m.x, m.base + 1, pw, ph, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(214, 163, 92, 0.35)'; ctx.fillRect(m.x - pw * 0.6, m.base - ph + 1, pw * 0.5, 1);
    // The stub: flange, the broken-off barrel (lit left, shadowed right), a chain hanging with nothing on it
    const sx = m.x + shake;
    ink(ctx, () => ctx.rect(sx - 14, m.base - 5, 28, 5), STUB.dark, 1);
    ctx.fillStyle = STUB.mid; ctx.fillRect(sx - 13, m.base - 5, 26, 1);
    ctx.fillStyle = '#44403C'; ctx.fillRect(sx - 12, m.base - 3, 2, 2); ctx.fillRect(sx + 10, m.base - 3, 2, 2);
    ctx.save(); ctx.beginPath(); ctx.rect(sx - 10, m.base - 21, 20, 16); ctx.clip();
    ctx.fillStyle = STUB.mid; ctx.fillRect(sx - 10, m.base - 21, 20, 16);
    ctx.fillStyle = STUB.lit; ctx.fillRect(sx - 10, m.base - 21, 5, 16);
    ctx.fillStyle = STUB.dark; ctx.fillRect(sx + 5, m.base - 21, 5, 16);
    ctx.fillStyle = '#FCA5A5'; ctx.fillRect(sx - 8, m.base - 15, 1, 8);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(sx - 10, m.base - 17, 20, 12);
    // (the torn top: jagged, the dark of the bore inside it)
    ink(ctx, () => { ctx.moveTo(sx - 10, m.base - 17); ctx.lineTo(sx - 4, m.base - 21); ctx.lineTo(sx + 3, m.base - 17); ctx.lineTo(sx + 10, m.base - 20); ctx.lineTo(sx + 10, m.base - 16); ctx.lineTo(sx - 10, m.base - 16); ctx.closePath(); }, STUB.deep, 1);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(sx - 6, m.base - 17, 12, 2);
    ink(ctx, () => ctx.rect(sx - 14, m.base - 13, 4, 4), '#FACC15', 0.8);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx - 12, m.base - 11); ctx.quadraticCurveTo(m.x - 18, m.base - 4, m.x - 16, m.base); ctx.stroke();
    ctx.fillStyle = '#57534E'; for (let k = 0; k < 4; k++) ctx.fillRect(m.x - 15 - k * 0.5, m.base - 9 + k * 2, 1, 1); // (the links)
    // (its top lying in the gutter nearby: the bonnet, the nut)
    ink(ctx, () => ctx.ellipse(m.x + 34, m.base - 5, 9, 5, 0.4, 0, Math.PI * 2), STUB.mid, 1);
    ctx.fillStyle = STUB.lit; ctx.fillRect(m.x + 28, m.base - 8, 5, 2);
    ctx.fillStyle = STUB.dark; ctx.fillRect(m.x + 34, m.base - 3, 6, 2);
    ink(ctx, () => ctx.arc(m.x + 34, m.base - 9, 3, 0, Math.PI * 2), '#FACC15', 0.8);
    ctx.fillStyle = '#FEF08A'; ctx.fillRect(m.x + 32, m.base - 11, 1.5, 1.5);
  } else {
    // The main's broken end, up out of the water: cast iron, lit down its left, rust dripping off it, the bore dark
    const px = m.x - MAIN_W / 2 - 4 + shake, pw = MAIN_W + 8;
    shaded(ctx, () => ctx.rect(px, m.base - 14, pw, 22), '#5C3A21', px, m.base - 14, pw, 22, 1.2);
    shadedTop(ctx, () => ctx.rect(px - 2, m.base - 2, pw + 4, 6), '#4A2E1A', px - 2, m.base - 2, pw + 4, 6, 1);
    checker(ctx, px + 4, m.base - 8, 10, 6, 'rgba(180, 83, 9, 0.65)');
    ctx.fillStyle = 'rgba(180, 83, 9, 0.6)'; ctx.fillRect(px + pw - 10, m.base - 10, 3, 12);
    ink(ctx, () => ctx.ellipse(m.x + shake, m.base - 14, MAIN_W / 2 + 4, 5, 0, 0, Math.PI * 2), '#7C4A24', 1);
    ctx.fillStyle = '#1C140E'; ctx.beginPath(); ctx.ellipse(m.x + shake, m.base - 14, MAIN_W / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9A5A2C'; ctx.fillRect(m.x + shake - MAIN_W / 2, m.base - 18, MAIN_W * 0.5, 1);
  }
  // Bubbling up round it as it's about to go: each bubble a ring with a glint
  if (warn > 0 && now.state === 'warn') {
    for (let i = 0; i < 5; i++) {
      const q = ((frame * (0.8 + warn) + i * 13) % 20) / 20;
      const bx = m.x - 16 + i * 8, by = m.base - 4 - q * (6 + warn * 10), r = 1.5 + q * 2.5;
      ctx.fillStyle = `rgba(214, 163, 92, ${(0.7 * (1 - q)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(254, 243, 199, ${(0.8 * (1 - q)).toFixed(3)})`; ctx.fillRect(bx - r * 0.5, by - r * 0.6, 1, 1);
    }
  }
};

/** The water, straight up: rust-brown at the bottom going to dirty foam at the top in bands, streaks running up it, a
 * crown of spray on top and a splash round the foot of it. */
const drawColumn = (ctx: Ctx, m: Main, height: number, frame: number) => {
  const b = mainBox(m, height);
  ctx.save();
  // (wobbling at the edges)
  const path = () => {
    ctx.beginPath(); ctx.moveTo(b.x, b.y + b.h);
    for (let y = b.y + b.h; y > b.y; y -= 12) ctx.lineTo(b.x + Math.sin(y * 0.1 + frame * 0.6) * 3 - 2, y);
    for (let y = b.y; y < b.y + b.h; y += 12) ctx.lineTo(b.x + b.w + Math.sin(y * 0.1 + frame * 0.6 + 2) * 3 + 2, y);
    ctx.lineTo(b.x + b.w, b.y + b.h); ctx.closePath();
  };
  ctx.save(); path(); ctx.clip();
  ctx.globalAlpha = 0.88;
  bandedGradient(ctx, b.x - 6, b.y, b.w + 12, b.h, ['#D6A35C', '#B45309', '#92400E', '#78350F'], Math.max(3, Math.min(10, Math.round(b.h / 24))));
  ctx.globalAlpha = 1;
  // (lit down its left side, shadowed down its right, in steps)
  ctx.fillStyle = 'rgba(253, 230, 138, 0.22)'; ctx.fillRect(b.x - 6, b.y, 9, b.h);
  ctx.fillStyle = 'rgba(69, 26, 3, 0.3)'; ctx.fillRect(b.x + b.w - 7, b.y, 10, b.h);
  // Streaks running up it
  ctx.fillStyle = 'rgba(253, 230, 138, 0.4)';
  for (let i = 0; i < 4; i++) {
    const sx = b.x + 6 + i * 8, off = (frame * 9 + i * 37) % 60;
    for (let y = b.y + b.h - off; y > b.y; y -= 60) ctx.fillRect(sx, y - 22, 2, 22);
  }
  ctx.restore();
  path(); ctx.strokeStyle = 'rgba(69, 26, 3, 0.55)'; ctx.lineWidth = 1; ctx.stroke();
  // Spray on top: chunky blobs in two tones, a glint on each
  for (let i = 0; i < 7; i++) {
    const a = (i / 6) * Math.PI;
    const cx = m.x - Math.cos(a) * 20, cy = b.y + 2 - Math.sin(a) * 10 + Math.sin(frame * 0.5 + i) * 3, r = 7 + (i % 3) * 2;
    ctx.fillStyle = i % 2 ? 'rgba(214, 163, 92, 0.85)' : 'rgba(245, 222, 179, 0.8)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(146, 64, 14, 0.4)'; ctx.fillRect(cx - r * 0.3, cy + r * 0.3, r, 2);
    ctx.fillStyle = 'rgba(255, 251, 235, 0.85)'; ctx.fillRect(cx - r * 0.5, cy - r * 0.5, 2, 2);
  }
  // The splash round the foot of it, a lighter ring on top
  ctx.fillStyle = 'rgba(146, 64, 14, 0.7)'; ctx.beginPath(); ctx.ellipse(m.x, m.base - 2, MAIN_W, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(245, 222, 179, 0.6)'; ctx.fillRect(m.x - MAIN_W * 0.7, m.base - 7, MAIN_W * 1.4, 2);
  ctx.restore();
};
