// The Iron Pit, drawn: the back wall (cinderblock painted two tones, gone yellow under the tube lights; the mirrors,
// the posters, the windows still dark at five in the morning), the gym's things along it (the benches, the racks, the
// treadmills, the bag), the plate racks and the plyo boxes you stand on, the mezzanine's rail, the locker room's double
// doors at the end; then the bigger fellas walking in through them, and over it all the pencil necks' lines, the time
// up in the corner as it starts, and the fade at the end.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, steppedGlow } from '../../render/pixelArt';
import { INK, ink, shaded, shadedTop, limb, dark, lite } from '../../render/npc/kit';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE, CP, MEZZ_Y, END_WALL, WALL_X, WALL_W, WALL_TOP, RAT_HOLES, Prop, Ledge } from './course';
import { getGym, fadeAmount, GymRuntime, BigFella, TELEGRAPH } from './runtime';
import { saying, drawBubble } from './script';
import { stamp } from '../../render/stamp';

type Ctx = CanvasRenderingContext2D;
const Y = GROUND_Y;
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

const inView = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 40 && x1 < state.camera.x + CANVAS_WIDTH + 40;

/** Behind the lot: the dark of the room (the back wall's drawn in the world, over this). */
export const drawGymBackdrop = (ctx: Ctx) => {
  ctx.fillStyle = '#0E0A08'; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  return true;
};

export const drawGymBack = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  const x1 = Math.max(COURSE.x1, state.camera.x - 20), x2 = Math.min(COURSE.x2 + 200, state.camera.x + CANVAS_WIDTH + 20);
  drawWall(ctx, state, x1, x2);
  for (const p of COURSE.props) {
    const [a, b] = propSpan(p);
    if (!inView(state, a, b)) continue;
    // (all but the bag, swinging, and the posters, lettered in the web font, are still: painted the once and stamped)
    if (p.look === 'bag' || p.look === 'poster') { drawProp(ctx, state, p); continue; }
    const flat = p.look === 'mirror' || p.look === 'window';
    stamp(ctx, `gym-prop-${p.look}-${p.x}-${p.y}`, a - 12, flat ? p.y - 10 : p.y - 196, b - a + 24, flat ? 186 : 204, g => drawProp(g, state, p));
  }
  drawDoors(ctx, state, rt);
  drawEndWall(ctx, state);
  RAT_HOLES.forEach((x, i) => { if (inView(state, x - 40, x + 50)) drawRatHole(ctx, state, rt, x, i === RAT_HOLES.length - 1); });
  drawCeilingGivingWay(ctx, state, rt);
};

/** The back wall: cinderblock, the lower half painted red and the top a dirty cream, a stripe between; the ceiling's beams and the tube lights hung off them. */
const drawWall = (ctx: Ctx, state: GameState, x1: number, x2: number) => {
  // The wall itself doesn't change: painted the once in chunks WALL_CHUNK wide and stamped; the tube lights over it live
  for (let cx = Math.floor(x1 / WALL_CHUNK) * WALL_CHUNK; cx < x2; cx += WALL_CHUNK) {
    const a = Math.max(COURSE.x1, cx), b = Math.min(COURSE.x2 + 200, cx + WALL_CHUNK);
    if (b <= a) continue;
    // (each a little over into the next, so no seam shows where two meet between pixels)
    stamp(ctx, `gym-wall-${cx}`, cx - 2, 0, WALL_CHUNK + 4, Y, g => {
      g.save(); g.beginPath(); g.rect(cx - 2, -10, WALL_CHUNK + 4, Y + 20); g.clip();
      drawWallStill(g, a, b);
      g.restore();
    });
  }
  drawTubeLights(ctx, state, x1, x2);
};
const WALL_CHUNK = 256;
export const drawWallStill = (ctx: Ctx, x1: number, x2: number) => {
  // (the ceiling: a drop ceiling, its tiles gone yellow and water-stained in the grid, one missing (the dark up
  // through it), a duct running along under it, the trim where it meets the wall)
  ctx.fillStyle = '#6E685A'; ctx.fillRect(x1, 0, x2 - x1, 70);
  for (let x = Math.floor(x1 / 64) * 64; x < x2; x += 64) for (let y = 0; y < 60; y += 30) {
    const h = hash(x * 0.11 + y * 3.7);
    ctx.fillStyle = h > 0.97 ? '#0E0A08' : h > 0.5 ? '#8A8473' : '#7E7868'; ctx.fillRect(x + 2, y + 2, 60, 26);
    if (h > 0.97) continue;
    ctx.fillStyle = 'rgba(60, 50, 30, 0.25)'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 6 + hash(x + k + y) * 50, y + 6 + hash(x - k + y) * 18, 1, 1);
    if (h < 0.12) { ctx.fillStyle = 'rgba(120, 84, 30, 0.35)'; ctx.beginPath(); ctx.ellipse(x + 30, y + 15, 18, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.fillStyle = '#B8B2A0'; for (let x = Math.floor(x1 / 64) * 64; x < x2; x += 64) ctx.fillRect(x, 0, 2, 60);
  ctx.fillRect(x1, 0, x2 - x1, 2); ctx.fillRect(x1, 30, x2 - x1, 2);
  ctx.fillStyle = '#52525B'; ctx.fillRect(x1, 46, x2 - x1, 12); ctx.fillStyle = '#71717A'; ctx.fillRect(x1, 46, x2 - x1, 2);
  ctx.fillStyle = '#3F3F46'; for (let x = Math.floor(x1 / 200) * 200; x < x2; x += 200) ctx.fillRect(x, 44, 4, 16);
  ctx.fillStyle = '#2E241E'; ctx.fillRect(x1, 60, x2 - x1, 10); ctx.fillStyle = '#4A3E34'; ctx.fillRect(x1, 60, x2 - x1, 2);
  // (the wall: cinderblock, every block its own shade)
  ctx.fillStyle = '#B9AE94'; ctx.fillRect(x1, 70, x2 - x1, Y - 70 - 170);
  ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x1, Y - 170, x2 - x1, 170);
  for (let y = 70; y < Y; y += 24) {
    const off = ((y - 70) / 24) % 2 ? 24 : 0;
    for (let x = Math.floor(x1 / 48) * 48 - 48 + off; x < x2; x += 48) {
      const low = y >= Y - 170;
      const h = hash(x * 0.37 + y);
      ctx.fillStyle = low ? (h > 0.5 ? '#86201E' : '#761A18') : (h > 0.5 ? '#C2B79C' : '#B0A588');
      ctx.fillRect(x + 1, y + 1, 46, 22);
      ctx.fillStyle = low ? 'rgba(255, 200, 180, 0.12)' : 'rgba(255, 250, 235, 0.3)'; ctx.fillRect(x + 1, y + 1, 46, 2); ctx.fillRect(x + 1, y + 3, 2, 18); // (the lit edge)
      ctx.fillStyle = low ? 'rgba(0,0,0,0.25)' : 'rgba(80, 64, 40, 0.35)'; ctx.fillRect(x + 1, y + 21, 46, 2); ctx.fillRect(x + 45, y + 3, 2, 18);
      if (h > 0.86) { ctx.fillStyle = low ? 'rgba(0,0,0,0.3)' : 'rgba(80, 64, 40, 0.4)'; ctx.fillRect(x + 8 + h * 20, y + 8, 2, 2); ctx.fillRect(x + 12 + h * 20, y + 13, 1, 1); } // (pits in the block)
    }
  }
  // (the stripe between the two paints, and the grime down the wall from the ceiling)
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x1, Y - 176, x2 - x1, 6);
  ctx.fillStyle = 'rgba(60, 40, 20, 0.18)';
  for (let x = Math.floor(x1 / 70) * 70; x < x2; x += 70) { const h = 40 + hash(x) * 120; ctx.fillRect(x + hash(x + 1) * 40, 70, 6 + hash(x + 2) * 10, h); }
  // (the rubber floor's skirting)
  ctx.fillStyle = '#111'; ctx.fillRect(x1, Y - 8, x2 - x1, 8);
};
export const drawTubeLights = (ctx: Ctx, state: GameState, x1: number, x2: number) => {
  const f = state.frame;
  // (the tube lights, one flickering)
  for (let x = Math.floor(x1 / 320) * 320 - 220; x < x2 + 90; x += 320) {
    const flicker = (x / 320) % 5 === 2 && hash(Math.floor(f / 5) + x) > 0.85;
    ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 4, 62, 2, 16); ctx.fillRect(x + 82, 62, 2, 16);
    shadedTop(ctx, () => ctx.rect(x - 10, 76, 100, 5), '#71717A', x - 10, 76, 100, 5, 0.8);
    ctx.fillStyle = flicker ? '#71717A' : '#FEFCE8'; ctx.fillRect(x - 8, 81, 96, 5);
    ctx.fillStyle = flicker ? '#52525B' : '#FFFFFF'; ctx.fillRect(x - 6, 82, 92, 1.4);
    ctx.fillStyle = flicker ? '#3F3F46' : '#FDE68A'; ctx.fillRect(x - 8, 85, 96, 1);
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 9, 81, 3, 5); ctx.fillRect(x + 86, 81, 3, 5); // (the end caps)
    if (!flicker) {
      // (its pool of light down the wall, in steps)
      for (let k = 0; k < 5; k++) {
        const a = 0.15 * (1 - k / 5), span = Y - 86, y0 = 86 + k * span / 5, y1 = y0 + span / 5;
        const s0 = (y0 - 86) / span, s1 = (y1 - 86) / span;
        ctx.fillStyle = `rgba(254, 252, 232, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(x - 8 - 82 * s0, y0); ctx.lineTo(x + 88 + 82 * s0, y0); ctx.lineTo(x + 88 + 82 * s1, y1); ctx.lineTo(x - 8 - 82 * s1, y1); ctx.closePath(); ctx.fill();
      }
    }
  }
};

/** How far a prop reaches either side of its x (a mirror or a window hangs off to the right of it; the rest are about it). */
export const propSpan = (p: Prop): [number, number] =>
  p.look === 'mirror' ? [p.x - 4, p.x + 304] : p.look === 'window' ? [p.x - 4, p.x + 124] : p.look === 'poster' ? [p.x - 160, p.x + 160] : [p.x - 90, p.x + 90];

/** A plate seen edge-on on a bar at (x, y): rh its radius, w its thickness; the rubber shaded, the rim lit, the hub. */
export const plate = (ctx: Ctx, x: number, y: number, w: number, rh: number, color: string) => {
  shaded(ctx, () => ctx.roundRect(x - w / 2, y - rh, w, rh * 2, Math.min(w / 2, 2)), color, x - w / 2, y - rh, w, rh * 2, 0.9);
  ctx.fillStyle = lite(color, 0.35); ctx.fillRect(x - w / 2 + 0.6, y - rh + 1.4, 1, rh * 2 - 4);
  ctx.fillStyle = dark(color, 0.45); ctx.fillRect(x - w / 2 + 0.4, y - 1.6, w - 0.8, 3.2);
};

/** A steel tube from (x, y), w x h, lit along its top or its left (whichever's the long side). */
export const steel = (ctx: Ctx, x: number, y: number, w: number, h: number, color = '#52525B') => {
  if (w >= h) shadedTop(ctx, () => ctx.rect(x, y, w, h), color, x, y, w, h, 0.9);
  else shaded(ctx, () => ctx.rect(x, y, w, h), color, x, y, w, h, 0.9);
  ctx.fillStyle = lite(color, 0.45);
  if (w >= h) ctx.fillRect(x + 1, y + 0.6, w - 2, 0.8); else ctx.fillRect(x + 0.8, y + 1, 0.8, h - 2);
};

/** A chrome bar from x1 to x2 at y: thin, a glint down its length. */
export const bar = (ctx: Ctx, x1: number, x2: number, y: number) => {
  ink(ctx, () => ctx.rect(x1, y - 1.6, x2 - x1, 3.2), '#A1A1AA', 0.8);
  ctx.fillStyle = '#F4F4F5'; ctx.fillRect(x1 + 2, y - 1, x2 - x1 - 4, 0.8);
  ctx.fillStyle = '#71717A'; ctx.fillRect(x1 + 1, y + 0.6, x2 - x1 - 2, 0.8);
};

/** A padded seat or bench top, (x, y, w, h): red vinyl, the stitching, a split taped over. */
export const pad = (ctx: Ctx, x: number, y: number, w: number, h: number, color = '#991B1B') => {
  shadedTop(ctx, () => ctx.roundRect(x, y, w, h, 2.4), color, x, y, w, h);
  ctx.fillStyle = lite(color, 0.4); ctx.fillRect(x + 3, y + 1, w - 6, 1);
  ctx.strokeStyle = dark(color, 0.4); ctx.lineWidth = 0.6; ctx.setLineDash([1.4, 1.4]); ctx.beginPath(); ctx.moveTo(x + 2, y + h - 2); ctx.lineTo(x + w - 2, y + h - 2); ctx.stroke(); ctx.setLineDash([]);
};

/** A shadow on the rubber floor under something, w wide at x. */
export const floorShadow = (ctx: Ctx, x: number, w: number) => {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(x - w / 2, Y - 3, w, 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; ctx.fillRect(x - w / 2 - 4, Y - 2, w + 8, 2);
};

/** Pixel lettering on a sign: dark drop shadow under it, `fg` over. */
export const signText = (ctx: Ctx, text: string, x: number, y: number, font: string, fg: string, shadow = 'rgba(0,0,0,0.35)') => {
  ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = shadow; ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = fg; ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
};

export const drawProp = (ctx: Ctx, state: GameState, p: Prop) => {
  const { x, y } = p;
  switch (p.look) {
    case 'mirror': {
      // A wall of mirror: the room in it, dim (the lights' streaks down it, the far wall's stripe, the floor), a crack
      // in one corner, a steel frame round it with its screws
      shaded(ctx, () => ctx.rect(x - 4, y - 4, 308, 168), '#3F3F46', x - 4, y - 4, 308, 168);
      bandedGradient(ctx, x, y, 300, 160, ['#4C6A76', '#6E8E99', '#7D9AA4', '#5B7A86', '#3C5864'], 8);
      ctx.fillStyle = 'rgba(127, 29, 29, 0.35)'; ctx.fillRect(x, y + 104, 300, 40); // (the red paint behind you)
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)'; ctx.fillRect(x, y + 100, 300, 4);
      ctx.fillStyle = 'rgba(10, 10, 12, 0.4)'; ctx.fillRect(x, y + 144, 300, 16);
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x + 20 + k * 50, y, 8, 160);
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + 22 + k * 50, y, 2, 160);
      }
      checker(ctx, x, y, 300, 2, 'rgba(0,0,0,0.25)', 0);
      ctx.strokeStyle = 'rgba(230, 240, 245, 0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 270, y); ctx.lineTo(x + 250, y + 30); ctx.lineTo(x + 262, y + 44); ctx.moveTo(x + 250, y + 30); ctx.lineTo(x + 236, y + 36); ctx.stroke();
      ctx.strokeStyle = 'rgba(30, 40, 46, 0.7)'; ctx.beginPath(); ctx.moveTo(x + 271, y); ctx.lineTo(x + 251, y + 31); ctx.lineTo(x + 263, y + 45); ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 4.5, y - 4.5, 309, 169); ctx.strokeRect(x - 0.5, y - 0.5, 301, 161);
      ctx.fillStyle = '#A1A1AA'; for (const [sx, sy] of [[x - 2, y - 2], [x + 300, y - 2], [x - 2, y + 160], [x + 300, y + 160]]) ctx.fillRect(sx, sy, 2, 2);
      break;
    }
    case 'window': {
      // Still dark out: a blue before the dawn, the frame, wire glass, a streetlight's glow, the sill
      shaded(ctx, () => ctx.rect(x - 4, y - 4, 128, 88), '#3F3F46', x - 4, y - 4, 128, 88);
      bandedGradient(ctx, x, y, 120, 80, ['#0B1330', '#151C40', '#20234E', '#2A2A5A'], 6);
      steppedGlow(ctx, x + 90, y + 60, 18, '#FDBA74', 0.5, 0.08, 4);
      ctx.fillStyle = '#FED7AA'; ctx.fillRect(x + 89, y + 59, 2, 2);
      // (rooftops across the street, a lit window in one)
      ctx.fillStyle = '#080A18'; ctx.fillRect(x, y + 64, 50, 16); ctx.fillRect(x + 12, y + 56, 22, 8); ctx.fillRect(x + 66, y + 70, 54, 10);
      ctx.fillStyle = '#FCD34D'; ctx.fillRect(x + 20, y + 68, 3, 3);
      ctx.strokeStyle = 'rgba(160,160,170,0.3)'; ctx.lineWidth = 0.6;
      for (let k = 0; k < 120; k += 10) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k + 10, y + 80); ctx.moveTo(x + k + 10, y); ctx.lineTo(x + k, y + 80); ctx.stroke(); }
      steel(ctx, x + 58, y, 4, 80, '#52525B'); steel(ctx, x, y + 38, 120, 4, '#52525B');
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(x + 6, y); ctx.lineTo(x + 20, y); ctx.lineTo(x + 6, y + 30); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 4.5, y - 4.5, 129, 89); ctx.strokeRect(x - 0.5, y - 0.5, 121, 81);
      shadedTop(ctx, () => ctx.rect(x - 8, y + 84, 136, 5), '#A8A29E', x - 8, y + 84, 136, 5);
      break;
    }
    case 'poster': {
      // A poster: curling at a corner, a man flexing on it in a starburst, the slogan, the tape at the corners
      const text = p.text ?? '';
      ctx.font = 'bold 8px "Press Start 2P"';
      const w = Math.max(110, ctx.measureText(text).width + 24), l = x - w / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(l + 3, y + 3, w, 60);
      ink(ctx, () => { ctx.moveTo(l, y); ctx.lineTo(l + w, y); ctx.lineTo(l + w, y + 52); ctx.lineTo(l + w - 8, y + 60); ctx.lineTo(l, y + 60); ctx.closePath(); }, '#F5F5F4', 1);
      ctx.fillStyle = 'rgba(160, 130, 80, 0.25)'; ctx.fillRect(l + 1, y + 48, w - 9, 11); checker(ctx, l + 1, y + 44, w - 9, 4, 'rgba(160, 130, 80, 0.25)', 0);
      ink(ctx, () => { ctx.moveTo(l + w, y + 52); ctx.lineTo(l + w - 8, y + 52); ctx.lineTo(l + w - 8, y + 60); ctx.closePath(); }, '#D6D3D1', 0.8); // (the curl)
      bandedGradient(ctx, l + 6, y + 6, w - 12, 28, ['#EF4444', '#DC2626', '#991B1B'], 4);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(l + 5.5, y + 5.5, w - 11, 29);
      // (the starburst behind him)
      ctx.fillStyle = '#FACC15'; ctx.beginPath(); for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, r = k % 2 ? 7 : 13; ctx.lineTo(x + Math.cos(a) * r * 1.3, y + 20 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      // (him, flexing, in silhouette: the lats out, both biceps up)
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(x, y + 13, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 7, y + 17); ctx.lineTo(x + 7, y + 17); ctx.lineTo(x + 4, y + 27); ctx.lineTo(x + 5, y + 33); ctx.lineTo(x - 5, y + 33); ctx.lineTo(x - 4, y + 27); ctx.closePath(); ctx.fill();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * 6, y + 17); ctx.lineTo(x + s * 13, y + 18); ctx.lineTo(x + s * 15, y + 10); ctx.lineTo(x + s * 12, y + 9); ctx.lineTo(x + s * 11, y + 15); ctx.lineTo(x + s * 6, y + 20); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x + s * 11, y + 15, 2.6, 0, Math.PI * 2); ctx.fill(); }
      signText(ctx, text, x, y + 48, 'bold 8px "Press Start 2P"', '#111', 'rgba(220, 38, 38, 0.5)');
      // (tape at the corners)
      ctx.fillStyle = 'rgba(231, 229, 228, 0.85)'; for (const [tx, ty] of [[l - 3, y - 2], [l + w - 7, y - 2], [l - 3, y + 56]]) ctx.fillRect(tx, ty, 10, 5);
      break;
    }
    case 'bench': {
      // A flat bench (the pad, the steel frame, the feet), the uprights and the bar racked on them, plates on the bar
      floorShadow(ctx, x - 6, 120);
      steel(ctx, x - 40, y - 26, 4, 26); steel(ctx, x + 36, y - 26, 4, 26);
      steel(ctx, x - 44, y - 4, 12, 4); steel(ctx, x + 32, y - 4, 12, 4);
      steel(ctx, x - 40, y - 27, 80, 3, '#3F3F46');
      pad(ctx, x - 46, y - 35, 92, 9);
      steel(ctx, x - 55, y - 90, 6, 90, '#71717A'); steel(ctx, x - 62, y - 4, 20, 4);
      ink(ctx, () => { ctx.moveTo(x - 49, y - 92); ctx.lineTo(x - 44, y - 92); ctx.lineTo(x - 44, y - 86); ctx.lineTo(x - 49, y - 86); ctx.closePath(); }, '#A1A1AA', 0.8); // (the J-hook)
      bar(ctx, x - 82, x - 20, y - 92.5);
      plate(ctx, x - 76, y - 92.5, 6, 16, '#1F1F23'); plate(ctx, x - 69, y - 92.5, 5, 13, '#1E3A8A');
      ink(ctx, () => ctx.rect(x - 66, y - 95, 2, 5), '#D4D4D8', 0.6); // (the collar)
      break;
    }
    case 'squat': {
      // A power rack: the uprights punched with holes, the cross member, the safeties, the bar loaded up
      floorShadow(ctx, x, 120);
      for (const ux of [x - 50, x + 42]) {
        steel(ctx, ux, y - 170, 8, 170, '#3F3F46');
        ctx.fillStyle = '#0A0A0C'; for (let k = 0; k < 10; k++) ctx.fillRect(ux + 3, y - 160 + k * 15, 2, 2);
        steel(ctx, ux - 6, y - 4, 20, 4, '#3F3F46');
      }
      steel(ctx, x - 50, y - 172, 100, 7, '#3F3F46');
      steel(ctx, x - 54, y - 70, 108, 3, '#52525B'); // (the safeties)
      for (const s of [-1, 1]) ink(ctx, () => ctx.rect(x + s * 46 - 3, y - 117, 6, 6), '#71717A', 0.7);
      bar(ctx, x - 78, x + 78, y - 110);
      for (const s of [-1, 1]) {
        plate(ctx, x + s * 61, y - 110, 6, 22, '#1F1F23');
        plate(ctx, x + s * 67, y - 110, 5, 18, '#1E3A8A');
        plate(ctx, x + s * 72, y - 110, 4, 13, '#1F1F23');
      }
      break;
    }
    case 'dumbbells': {
      // The dumbbell rack: two shelves on a steel frame, the bells on them heavier toward the end
      floorShadow(ctx, x, 170);
      steel(ctx, x - 78, y - 50, 5, 50, '#27272A'); steel(ctx, x + 73, y - 50, 5, 50, '#27272A');
      for (const row of [-52, -30]) {
        for (let k = 0; k < 8; k++) {
          const bx = x - 70 + k * 19, r = 5 + (k % 4), cy = y + row;
          ink(ctx, () => ctx.rect(bx + 1, cy - 1.2, 10, 2.4), '#A1A1AA', 0.6);
          for (const hx of [bx - 2, bx + 10]) {
            shaded(ctx, () => ctx.roundRect(hx, cy - r, 4, r * 2, 1.4), '#27272A', hx, cy - r, 4, r * 2, 0.8);
            ctx.fillStyle = '#52525B'; ctx.fillRect(hx + 0.8, cy - r + 1.2, 0.8, r * 2 - 2.4);
          }
        }
        steel(ctx, x - 80, y + row + 6, 160, 5, '#3F3F46');
      }
      break;
    }
    case 'treadmill': {
      // A treadmill: the deck and its belt, the rails up to the console, the console's screen at 0.0
      floorShadow(ctx, x - 4, 100);
      shaded(ctx, () => { ctx.moveTo(x - 50, y - 6); ctx.lineTo(x + 40, y - 12); ctx.lineTo(x + 44, y); ctx.lineTo(x - 50, y); ctx.closePath(); }, '#3F3F46', x - 50, y - 12, 94, 12);
      ink(ctx, () => { ctx.moveTo(x - 46, y - 8.6); ctx.lineTo(x + 38, y - 13.4); ctx.lineTo(x + 38, y - 10.6); ctx.lineTo(x - 46, y - 5.8); ctx.closePath(); }, '#111113', 0.7);
      ctx.fillStyle = '#27272A'; for (let k = 0; k < 9; k++) ctx.fillRect(x - 42 + k * 9, y - 8.6 - k * 0.5, 1, 2);
      ink(ctx, () => ctx.arc(x - 46, y - 4, 2.4, 0, Math.PI * 2), '#71717A', 0.7);
      steel(ctx, x + 34, y - 74, 5, 62, '#3F3F46');
      steel(ctx, x + 2, y - 51, 36, 3, '#52525B');
      shadedTop(ctx, () => ctx.roundRect(x + 19, y - 82, 32, 16, 2), '#3F3F46', x + 19, y - 82, 32, 16);
      ink(ctx, () => ctx.rect(x + 24, y - 78, 22, 7), '#052E16', 0.7);
      ctx.fillStyle = '#4ADE80'; ctx.font = 'bold 5px monospace'; ctx.fillText('0.0', x + 27, y - 72.6);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.25)'; ctx.fillRect(x + 25, y - 77, 20, 1);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 23, y - 69, 3, 2); ctx.fillStyle = '#16A34A'; ctx.fillRect(x + 43, y - 69, 3, 2);
      break;
    }
    case 'bike': {
      // An exercise bike: the flywheel, the frame, the saddle, the bars, the pedals
      floorShadow(ctx, x + 5, 80);
      steel(ctx, x - 30, y - 6, 70, 6, '#3F3F46');
      ink(ctx, () => ctx.arc(x + 26, y - 16, 14, 0, Math.PI * 2), '#27272A', 1);
      ink(ctx, () => ctx.arc(x + 26, y - 16, 9, 0, Math.PI * 2), '#3F3F46', 0.8);
      ctx.fillStyle = '#71717A'; ctx.fillRect(x + 18, y - 28, 6, 1.4); ctx.fillRect(x + 14, y - 22, 1.4, 6);
      ink(ctx, () => ctx.arc(x + 26, y - 16, 2.4, 0, Math.PI * 2), '#A1A1AA', 0.7);
      ctx.save(); ctx.translate(x - 7, y - 4); ctx.rotate(-0.25); steel(ctx, 0, -46, 6, 46, '#52525B'); ctx.restore();
      ctx.save(); ctx.translate(x + 22, y - 12); ctx.rotate(0.1); steel(ctx, 0, -50, 6, 50, '#52525B'); ctx.restore();
      steel(ctx, x - 6, y - 36, 30, 4, '#52525B');
      shadedTop(ctx, () => ctx.roundRect(x - 22, y - 56, 24, 6, [3, 1, 1, 3]), '#18181B', x - 22, y - 56, 24, 6);
      steel(ctx, x + 14, y - 68, 26, 4, '#3F3F46');
      ink(ctx, () => ctx.roundRect(x + 36, y - 70, 6, 8, 2), '#18181B', 0.8);
      ink(ctx, () => ctx.rect(x + 4, y - 26, 8, 3), '#18181B', 0.8);
      break;
    }
    case 'fountain': {
      // The drinking fountain: steel, the basin, the spout, the button; out of order since the eighties
      floorShadow(ctx, x, 40);
      shaded(ctx, () => ctx.rect(x - 16, y - 70, 32, 70), '#A1A1AA', x - 16, y - 70, 32, 70);
      shadedTop(ctx, () => ctx.rect(x - 17, y - 72, 34, 7), '#D4D4D8', x - 17, y - 72, 34, 7);
      ink(ctx, () => ctx.roundRect(x - 11, y - 64, 22, 8, [0, 0, 4, 4]), '#71717A', 0.8);
      ctx.fillStyle = '#3F3F46'; ctx.fillRect(x - 8, y - 63, 16, 2);
      ink(ctx, () => ctx.rect(x - 2, y - 68, 4, 4), '#52525B', 0.7);
      ink(ctx, () => ctx.rect(x + 10, y - 62, 4, 3), '#3F3F46', 0.6);
      ctx.fillStyle = '#78350F'; ctx.fillRect(x - 4, y - 58, 3, 1.4); // (rust)
      ink(ctx, () => ctx.rect(x - 12, y - 46, 24, 15), '#F8FAFC', 0.8);
      ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 4px monospace'; ctx.fillText('OUT OF', x - 9.5, y - 40); ctx.fillText('ORDER', x - 8.5, y - 34);
      ctx.fillStyle = 'rgba(200, 200, 210, 0.85)'; ctx.fillRect(x - 13, y - 47, 6, 3); ctx.fillRect(x + 7, y - 47, 6, 3);
      ctx.fillStyle = '#71717A'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 10, y - 22 + k * 4, 20, 1); // (the grille)
      break;
    }
    case 'cable': {
      // The cable machine: the frame, the weight stack on its guide rods, the cable down to it over a pulley
      floorShadow(ctx, x, 90);
      steel(ctx, x - 40, y - 180, 8, 180, '#3F3F46'); steel(ctx, x + 32, y - 180, 8, 180, '#3F3F46');
      steel(ctx, x - 40, y - 182, 80, 8, '#3F3F46');
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 16, y - 172, 1.4, 102); ctx.fillRect(x + 15, y - 172, 1.4, 102);
      ink(ctx, () => ctx.arc(x, y - 172, 4, 0, Math.PI * 2), '#71717A', 0.8);
      ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 168); ctx.lineTo(x, y - 74); ctx.stroke();
      for (let k = 0; k < 8; k++) {
        shadedTop(ctx, () => ctx.rect(x - 12, y - 72 + k * 8, 24, 6.4), '#27272A', x - 12, y - 72 + k * 8, 24, 6.4, 0.8);
        ctx.fillStyle = '#E5E7EB'; ctx.fillRect(x - 10, y - 70 + k * 8, 3, 1.4);
      }
      ink(ctx, () => ctx.rect(x + 6, y - 64, 6, 1.6), '#A1A1AA', 0.6); // (the pin)
      break;
    }
    case 'bag': {
      // The heavy bag on its chain: leather, the straps, split and duct-taped
      const sw = Math.sin(state.frame * 0.03) * 0.05;
      ctx.save(); ctx.translate(x, 70); ctx.rotate(sw);
      ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 248); ctx.stroke();
      ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 248); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#71717A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 248); ctx.lineTo(-16, 262); ctx.moveTo(0, 248); ctx.lineTo(16, 262); ctx.stroke();
      shaded(ctx, () => ctx.roundRect(-20, 260, 40, 110, 10), '#7F1D1D', -20, 260, 40, 110);
      ctx.fillStyle = lite('#7F1D1D', 0.4); ctx.fillRect(-14, 266, 3, 96);
      for (const sy of [290, 340]) { shadedTop(ctx, () => ctx.rect(-20, sy, 40, 5), '#18181B', -20, sy, 40, 5, 0.8); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(-2, sy + 1, 4, 3); }
      ink(ctx, () => ctx.rect(-10, 358, 20, 6), '#D6D3D1', 0.7); // (duct tape)
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-9, 362, 18, 1);
      ctx.restore();
      break;
    }
  }
};

/**
 * The gym's corner at the left, behind his bench: the end wall coming toward you, seen side on (a column of cinderblock
 * in shadow, the two paints and the stripe carried round onto it), a fire extinguisher on it, the floor's skirting
 * turning the corner. Nothing past it: the room stops there.
 */
const drawEndWall = (ctx: Ctx, state: GameState) => {
  const x = COURSE.x1, w = END_WALL;
  if (!inView(state, x - 200, x + w + 20)) return;
  // (past it: nothing, the dark)
  ctx.fillStyle = '#0B0807'; ctx.fillRect(x - 400, 0, 400, CANVAS_HEIGHT);
  // (the face: the block in shadow, light coming onto its edge from the room)
  const top = 70;
  ctx.fillStyle = '#8C8470'; ctx.fillRect(x, top, w, Y - 170 - top);
  ctx.fillStyle = '#5C1414'; ctx.fillRect(x, Y - 170, w, 170);
  for (let y = top; y < Y; y += 24) {
    const low = y >= Y - 170;
    ctx.fillStyle = low ? 'rgba(0,0,0,0.3)' : 'rgba(60, 50, 30, 0.35)'; ctx.fillRect(x, y + 22, w, 2);
    ctx.fillRect(x + (((y - top) / 24) % 2 ? 22 : 8), y, 2, 24);
  }
  ctx.fillStyle = '#C9A814'; ctx.fillRect(x, Y - 176, w, 6);
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x, top, w, Y - top);
  ctx.fillStyle = 'rgba(255, 245, 220, 0.25)'; ctx.fillRect(x + w - 3, top, 3, Y - top); // (the corner, catching the light)
  // (the ceiling's trim turning the corner, the skirting at the foot of it)
  ctx.fillStyle = '#2E241E'; ctx.fillRect(x, 60, w, 10);
  ctx.fillStyle = '#111'; ctx.fillRect(x, Y - 8, w, 8);
  // (a fire extinguisher on its bracket, and its sign)
  steel(ctx, x + 14, Y - 112, 16, 3, '#3F3F46');
  shaded(ctx, () => ctx.roundRect(x + 16, Y - 120, 12, 34, [4, 4, 1, 1]), '#DC2626', x + 16, Y - 120, 12, 34);
  ctx.fillStyle = lite('#DC2626', 0.45); ctx.fillRect(x + 18, Y - 117, 1.4, 26);
  ink(ctx, () => ctx.rect(x + 18, Y - 110, 8, 7), '#F8FAFC', 0.6); ctx.fillStyle = '#18181B'; ctx.fillRect(x + 19, Y - 108, 6, 0.8); ctx.fillRect(x + 19, Y - 106, 4, 0.8);
  ink(ctx, () => ctx.rect(x + 19, Y - 126, 6, 6), '#27272A', 0.8);
  ink(ctx, () => ctx.rect(x + 25, Y - 125, 8, 2.4), '#18181B', 0.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 18, Y - 122); ctx.quadraticCurveTo(x + 10, Y - 110, x + 14, Y - 96); ctx.stroke(); // (the hose)
  shaded(ctx, () => ctx.rect(x + 12, Y - 160, 20, 12), '#B91C1C', x + 12, Y - 160, 20, 12, 0.8);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px monospace'; ctx.fillText('FIRE', x + 15, Y - 152);
};

/**
 * The rat hole: gnawed through the bottom of the wall at the end of the benches (an arch of dark, ragged at its edges,
 * the gnawed block round it pale), the vent grille that was screwed over it hanging off one screw, droppings and crumbs
 * out in front of it. The rats come out of here.
 */
const drawRatHole = (ctx: Ctx, state: GameState, rt: GymRuntime, x: number, grille: boolean) => {
  const b = Y - 8;
  ctx.fillStyle = '#C9B8A0';
  ctx.beginPath(); ctx.moveTo(x - 20, b); ctx.lineTo(x - 18, b - 14); ctx.quadraticCurveTo(x, b - 30, x + 18, b - 14); ctx.lineTo(x + 20, b); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0A0605';
  ctx.beginPath(); ctx.moveTo(x - 15, b); ctx.lineTo(x - 14, b - 11); ctx.quadraticCurveTo(x, b - 25, x + 14, b - 11); ctx.lineTo(x + 15, b); ctx.closePath(); ctx.fill();
  // (the ragged edge: teeth marks)
  ctx.fillStyle = '#C9B8A0'; for (let k = 0; k < 7; k++) { const a = Math.PI + (k / 6) * Math.PI; ctx.fillRect(x + Math.cos(a) * 14 - 1, b - 11 + Math.sin(a) * 11 - 1, 2, 2); }
  // (a rat about to come out of it: its eyes, catching the light, and its whiskers twitching at the edge)
  const coming = rt.due.find(d => d.kind === 'rat' && d.x === x && d.at - state.frame < TELEGRAPH);
  if (coming) {
    const k = 1 - (coming.at - state.frame) / TELEGRAPH, blink = state.frame % 30 < 3;
    if (!blink) { ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + k * 0.6})`; ctx.fillRect(x - 5, b - 9, 2, 2); ctx.fillRect(x + 1, b - 9, 2, 2); }
    if (k > 0.5) { ctx.strokeStyle = 'rgba(214, 211, 209, 0.8)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x - 8, b - 7); ctx.lineTo(x - 14 - Math.sin(state.frame * 0.8) * 2, b - 8); ctx.moveTo(x - 8, b - 6); ctx.lineTo(x - 14, b - 4); ctx.stroke(); }
  }
  // (the grille, hanging off one screw, crooked)
  if (grille) {
    ctx.save(); ctx.translate(x + 22, b - 26); ctx.rotate(0.9);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(0, 0, 26, 16); ctx.fillStyle = '#4B5563'; for (let k = 0; k < 5; k++) ctx.fillRect(2, 2 + k * 3, 22, 1.5);
    ctx.fillStyle = '#6B7280'; ctx.fillRect(1, 1, 2, 2);
    ctx.restore();
  }
  // (droppings and crumbs out in front)
  ctx.fillStyle = '#292524'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 24 + k * 9 + (k % 2) * 3, Y - 3 - (k % 3), 2, 1.5);
  ctx.fillStyle = '#D97706'; ctx.fillRect(x - 30, Y - 4, 3, 2); ctx.fillRect(x + 12, Y - 3, 2, 2);
};

/** A ceiling tile about to give: rattling in its grid (a crack of dark round it), until whoever's up there comes through it. */
const drawCeilingGivingWay = (ctx: Ctx, state: GameState, rt: GymRuntime) => {
  for (const d of rt.due) {
    if (d.kind !== 'drop' || d.at - state.frame >= TELEGRAPH || !inView(state, d.x - 40, d.x + 40)) continue;
    const k = 1 - (d.at - state.frame) / TELEGRAPH;
    const tx = Math.floor(d.x / 64) * 64, ty = 30;
    const jig = Math.sin(state.frame * (1.2 + k)) * (0.5 + k * 1.5);
    ctx.fillStyle = '#0E0A08'; ctx.fillRect(tx + 1, ty + 1, 62, 28);
    ctx.fillStyle = '#8A8473'; ctx.fillRect(tx + 2 + jig, ty + 2 + k * 3, 60, 26);
    ctx.fillStyle = 'rgba(60, 50, 30, 0.35)'; ctx.fillRect(tx + 2 + jig, ty + 26 + k * 3, 60, 2);
  }
};

/** The locker room's double doors at the end: swing doors, porthole windows, LOCKER ROOM over them; light beyond when they open. */
const drawDoors = (ctx: Ctx, state: GameState, rt: GymRuntime) => {
  const x = COURSE.doors;
  // (its light spills 300 out across the floor in front of it)
  if (!inView(state, x - 300, x + 150)) return;
  const top = Y - 150, w = 70;
  // (the frame: steel, painted, chipped; the light in there, brightest up the middle)
  shaded(ctx, () => ctx.rect(x - 8, top - 30, w * 2 + 16, 182), '#27272A', x - 8, top - 30, w * 2 + 16, 182);
  bandedGradient(ctx, x, top, w * 2, 150, ['#FEF9C3', '#FEF3C7', '#FDE68A', '#E9C77A'], 6);
  // (a row of lockers in there, in the light)
  ctx.fillStyle = 'rgba(120, 100, 60, 0.35)'; for (let k = 0; k < 7; k++) ctx.fillRect(x + 6 + k * 19, top + 20, 16, 120);
  ctx.fillStyle = 'rgba(80, 60, 30, 0.35)'; for (let k = 0; k < 7; k++) { ctx.fillRect(x + 9 + k * 19, top + 30, 10, 1); ctx.fillRect(x + 9 + k * 19, top + 34, 10, 1); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, top - 0.5, w * 2 + 1, 151);
  // (the sign: a lit box)
  shaded(ctx, () => ctx.rect(x + 20, top - 26, w * 2 - 40, 16), '#B91C1C', x + 20, top - 26, w * 2 - 40, 16);
  signText(ctx, 'LOCKER ROOM', x + w, top - 15, 'bold 7px "Press Start 2P"', '#FEF9C3', 'rgba(60, 0, 0, 0.6)');
  // (the two leaves, swung in by `doors`: seen edge-on as they open)
  const open = rt.doors;
  for (const s of [0, 1]) {
    const lw = w * (1 - open * 0.85);
    const lx = s === 0 ? x : x + w * 2 - lw;
    shaded(ctx, () => ctx.rect(lx, top, lw, 150), '#52525B', lx, top, lw, 150);
    // (the kick plate, scuffed; the push plate)
    shadedTop(ctx, () => ctx.rect(lx + 1, top + 124, lw - 2, 24), '#A1A1AA', lx + 1, top + 124, lw - 2, 24, 0.8);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(lx + lw * 0.3, top + 132, 6, 2); ctx.fillRect(lx + lw * 0.6, top + 138, 4, 2);
    if (lw > 30) {
      ink(ctx, () => ctx.arc(lx + lw / 2, top + 40, 11, 0, Math.PI * 2), '#71717A', 1);
      ink(ctx, () => ctx.arc(lx + lw / 2, top + 40, 8, 0, Math.PI * 2), '#FDE68A', 0.8);
      ctx.fillStyle = '#FEF9C3'; ctx.fillRect(lx + lw / 2 - 4, top + 35, 3, 2); ctx.fillRect(lx + lw / 2 - 5, top + 38, 1.4, 2);
    }
    const hx = s === 0 ? lx + lw - 8 : lx + 2;
    shaded(ctx, () => ctx.rect(hx, top + 76, 6, 20), '#D4D4D8', hx, top + 76, 6, 20, 0.8);
  }
  if (open > 0) {
    // (the light, out across the floor, in steps)
    for (let k = 0; k < 5; k++) {
      const a = 0.32 * open * (1 - k / 5), x0 = x - k * 60, x1 = x - (k + 1) * 60;
      ctx.fillStyle = `rgba(254, 243, 199, ${a.toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x, top + (Y - top) * (k / 5)); ctx.lineTo(x, Y); ctx.lineTo(x1, Y); ctx.lineTo(x0, Y); ctx.lineTo(x, top + (Y - top) * ((k + 1) / 5)); ctx.closePath(); ctx.fill();
    }
  }
};

/** The plate racks, the plyo boxes, the mezzanine's rail and its sign; the bigger fellas. */
export const drawGymMid = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  for (const l of COURSE.ledges) if (inView(state, l.x, l.x + l.w)) drawLedge(ctx, l);
  if (inView(state, WALL_X, WALL_X + WALL_W)) drawHalfWall(ctx);
  // (the mezzanine: its rail along the edge, NO SPOTTERS on its front)
  const mz = COURSE.runs.find(r => r.y1 === MEZZ_Y);
  if (mz && inView(state, mz.x1, mz.x2)) {
    for (let x = mz.x1 + 10; x < mz.x2; x += 30) steel(ctx, x, MEZZ_Y - 40, 3, 40, '#A1A1AA');
    steel(ctx, mz.x1, MEZZ_Y - 42, mz.x2 - mz.x1, 4, '#A1A1AA');
    steel(ctx, mz.x1, MEZZ_Y - 20, mz.x2 - mz.x1, 2, '#71717A');
    shaded(ctx, () => ctx.rect(mz.x1 + 30, MEZZ_Y + 30, 140, 22), '#FACC15', mz.x1 + 30, MEZZ_Y + 30, 140, 22);
    ctx.fillStyle = '#18181B'; for (let k = 0; k < 140; k += 10) { ctx.beginPath(); ctx.moveTo(mz.x1 + 30 + k, MEZZ_Y + 30); ctx.lineTo(mz.x1 + 35 + k, MEZZ_Y + 30); ctx.lineTo(mz.x1 + 30 + k, MEZZ_Y + 35); ctx.fill(); }
    ink(ctx, () => ctx.rect(mz.x1 + 34, MEZZ_Y + 36, 132, 12), '#FEF08A', 0.6);
    signText(ctx, 'NO SPOTTERS', mz.x1 + 100, MEZZ_Y + 46, 'bold 8px "Press Start 2P"', '#18181B', 'rgba(161, 98, 7, 0.5)');
  }
  for (const b of rt.bigFellas) if (rt.phase !== 'play') drawBigFella(ctx, state, b, rt);
};

/** The half-wall across the floor at the end of the cardio floor: cinderblock, painted, chipped, a sign on it. */
const drawHalfWall = (ctx: Ctx) => {
  const x = WALL_X, w = WALL_W, top = WALL_TOP, h = Y - top;
  ctx.fillStyle = '#6E6652'; ctx.fillRect(x, top, w, h);
  for (let y = top; y < Y; y += 20) {
    const off = ((y - top) / 20) % 2 ? -11 : 0;
    for (let bx = x + off; bx < x + w; bx += 22) {
      const l = Math.max(x, bx + 1), r = Math.min(x + w, bx + 21), c = hash(bx * 0.3 + y) > 0.5 ? '#ABA38C' : '#A0987F';
      ctx.fillStyle = c; ctx.fillRect(l, y + 1, r - l, 18);
      ctx.fillStyle = lite(c, 0.2); ctx.fillRect(l, y + 1, r - l, 1.4);
      ctx.fillStyle = dark(c, 0.15); ctx.fillRect(l, y + 16, r - l, 3);
    }
  }
  shadedTop(ctx, () => ctx.rect(x - 2, top, w + 4, 5), '#C9C1A8', x - 2, top, w + 4, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + w - 6, top + 5, 6, h - 5);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, top - 0.5, w + 1, h + 1);
  // (chips knocked out of it, and the sign)
  for (const [cx, cy, cw, ch] of [[x + 4, top + 30, 5, 3], [x + 30, top + 62, 4, 4]]) { ctx.fillStyle = '#5C5444'; ctx.fillRect(cx, cy, cw, ch); ctx.fillStyle = '#D6CFB8'; ctx.fillRect(cx, cy + ch, cw, 1); }
  ink(ctx, () => ctx.rect(x + 6, top + 13, w - 12, 13), '#F8FAFC', 0.8);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(x + 6.5, top + 13.5, w - 13, 3);
  ctx.fillStyle = '#111'; ctx.font = 'bold 3px monospace'; ctx.fillText('RE-RACK', x + 9, top + 21.6); ctx.fillText('YOUR WTS', x + 8, top + 25);
};

export const drawLedge = (ctx: Ctx, l: Ledge) => {
  if (l.look === 'step') {
    // A stack of plyo boxes up to it: plywood, the edge grain, the height stenciled on, the corners scuffed
    for (let k = 0; k < 2; k++) {
      const top = l.y + k * 50, h = 50, c = k ? '#B07A44' : '#C48A50';
      shaded(ctx, () => ctx.rect(l.x, top, l.w, h), c, l.x, top, l.w, h);
      ctx.fillStyle = lite(c, 0.35); ctx.fillRect(l.x + 1, top + 1, l.w - 2, 2);
      ctx.fillStyle = dark(c, 0.15); for (let g = 0; g < 4; g++) ctx.fillRect(l.x + 8 + g * 22, top + 8 + (g % 2) * 20, 14, 1);
      ctx.fillStyle = dark(c, 0.4); ctx.fillRect(l.x + 4, top + 4, 3, 3); ctx.fillRect(l.x + l.w - 7, top + 4, 3, 3); // (the screws)
      ink(ctx, () => ctx.ellipse(l.x + l.w / 2, top + 16, 10, 4, 0, 0, Math.PI * 2), dark(c, 0.55), 0.7); // (the hand hole)
      signText(ctx, k ? '24"' : '30"', l.x + l.w / 2, top + 36, 'bold 6px "Press Start 2P"', '#18181B', 'rgba(255,255,255,0.25)');
    }
    return;
  }
  // A plate rack: two uprights, shelves of plates, its top a steel shelf you can stand on
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(l.x - 4, Y - 3, l.w + 8, 3);
  steel(ctx, l.x, l.y, 8, Y - l.y, '#3F3F46'); steel(ctx, l.x + l.w - 8, l.y, 8, Y - l.y, '#3F3F46');
  steel(ctx, l.x + 8, l.y + 50, l.w - 16, 4, '#52525B');
  for (let k = 0; k < 6; k++) {
    const px = l.x + 20 + k * ((l.w - 40) / 5);
    plate(ctx, px, l.y + 32, 7, 20, k % 3 === 0 ? '#1E3A8A' : '#1F1F23');
    plate(ctx, px, Y - 26, 7, 22, k % 2 ? '#991B1B' : '#1F1F23');
  }
  steel(ctx, l.x, l.y, l.w, 8, '#71717A');
  ctx.fillStyle = '#E4E4E7'; ctx.fillRect(l.x + 2, l.y + 1, l.w - 4, 1);
  ctx.fillStyle = '#FACC15'; for (let k = 0; k < l.w - 8; k += 16) ctx.fillRect(l.x + 4 + k, l.y + 4, 8, 2); // (the hazard striping on its edge)
};

/**
 * One of the bigger fellas: what the pencil necks were meant to grow up into. A head taller than them, a neck as
 * wide as his head, shoulders filling out a black suit that actually fits; shades, an earpiece, hair like a helmet.
 * Walking in from the doors (toward him), then planted, hands folded.
 */
const drawBigFella = (ctx: Ctx, state: GameState, b: BigFella, rt: GymRuntime) => {
  // (not in yet: only while the doors are opening; once the fade's started its own clock, they're in, and stay)
  if (rt.phase === 'arrive' && rt.t <= 30 + b.delay) return;
  const walking = b.x > b.to + 0.5;
  const f = state.frame + b.delay * 7;
  const SUIT = '#141418', SKIN = '#E8C4A0', SK_D = dark(SKIN, 0.22);
  ctx.save(); ctx.translate(b.x, Y); ctx.scale(-1, 1);
  const s = walking ? Math.sin(f * 0.16) * 6 : 0, bob = walking ? Math.abs(Math.sin(f * 0.16)) * 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -bob);
  // Legs, shoes
  for (const lx of [-11 + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(lx, -40, 10, 36), SUIT, lx, -40, 10, 36);
    ink(ctx, () => ctx.roundRect(lx - 2, -5, 14, 5, [2, 3, 1, 1]), '#050505', 0.9);
    ctx.fillStyle = '#52525B'; ctx.fillRect(lx + 6, -4.2, 4, 0.9);
  }
  // Arms behind, when walking
  if (walking) limb(ctx, -22, -78, -24, -48 - s * 0.3, 7, SUIT);
  // The jacket, cut for the shoulders, the lit edge along it
  const coat = () => { ctx.moveTo(-24, -80); ctx.quadraticCurveTo(-24, -84, -18, -84); ctx.lineTo(18, -84); ctx.quadraticCurveTo(24, -84, 24, -80); ctx.lineTo(18, -38); ctx.lineTo(-18, -38); ctx.closePath(); };
  shaded(ctx, coat, SUIT, -24, -84, 48, 46);
  ink(ctx, () => { ctx.moveTo(-5, -83); ctx.lineTo(5, -83); ctx.lineTo(0, -64); ctx.closePath(); }, '#E8E8E8', 0.8);
  ink(ctx, () => { ctx.moveTo(-1.4, -81); ctx.lineTo(1.6, -81); ctx.lineTo(2, -66); ctx.lineTo(0, -64); ctx.lineTo(-2, -66); ctx.closePath(); }, '#050505', 0.6);
  for (const sx of [-1, 1]) ink(ctx, () => { ctx.moveTo(sx * 5, -83); ctx.lineTo(sx * 9, -74); ctx.lineTo(sx * 6, -72); ctx.lineTo(0, -60); ctx.closePath(); }, sx < 0 ? '#2A2A32' : SUIT, 0.7);
  ctx.fillStyle = INK; ctx.fillRect(-1, -56, 2, 2); ctx.fillRect(-1, -48, 2, 2);
  // Arms: swinging, or hands folded in front
  if (walking) {
    limb(ctx, 22, -78, 24, -48 + s * 0.3, 7, SUIT);
    ink(ctx, () => ctx.roundRect(20.4, -48 + s * 0.3, 7, 6, 2), SKIN, 0.8);
  } else {
    limb(ctx, -21, -78, -16, -55, 7, SUIT); limb(ctx, 21, -78, 16, -55, 7, SUIT);
    limb(ctx, -16, -55, -3, -55, 7, SUIT); limb(ctx, 16, -55, 3, -55, 7, SUIT);
    ink(ctx, () => ctx.roundRect(-6, -59, 12, 7, 2.4), SKIN, 0.8);
    ctx.fillStyle = SK_D; ctx.fillRect(-4, -56, 8, 0.7);
  }
  // The neck: wider than his head, the traps sloping up into it, the collar dug in round it
  ink(ctx, () => { ctx.moveTo(-24, -82); ctx.lineTo(-13, -90); ctx.lineTo(13, -90); ctx.lineTo(24, -82); ctx.closePath(); }, SUIT, 1);
  shaded(ctx, () => ctx.rect(-13, -95, 26, 13), SKIN, -13, -95, 26, 13, 0.9);
  ctx.fillStyle = SK_D; ctx.fillRect(-6, -91, 1, 8); ctx.fillRect(3, -91, 1, 8);
  ink(ctx, () => ctx.rect(-11, -84, 22, 2.4), '#E8E8E8', 0.6);
  // The head: square, the side parting, shades, the earpiece and its coil
  shaded(ctx, () => ctx.roundRect(-10, -113, 20, 23, [3, 3, 4, 4]), SKIN, -10, -113, 20, 23);
  ink(ctx, () => ctx.ellipse(-8.4, -101, 1.8, 3, 0, 0, Math.PI * 2), SK_D, 0.7);
  ink(ctx, () => { ctx.moveTo(-11, -106); ctx.lineTo(-11, -114); ctx.quadraticCurveTo(-10, -118, 0, -117.4); ctx.quadraticCurveTo(10, -118, 11, -112); ctx.lineTo(10, -109.6); ctx.lineTo(-7, -110); ctx.lineTo(-7.6, -106); ctx.closePath(); }, '#111', 0.9);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(-6, -116, 10, 1); ctx.fillStyle = '#000'; ctx.fillRect(2, -117, 0.8, 7); // (the part, the shine)
  ink(ctx, () => ctx.roundRect(-9, -105.6, 19, 5.4, [0.6, 0.6, 2, 2]), '#040404', 0.8);
  ctx.fillStyle = '#27272A'; ctx.fillRect(-8, -105, 17, 1);
  const g = (state.frame * 2 + b.delay * 9) % 140; if (g < 18) { ctx.fillStyle = '#FCFCFC'; ctx.fillRect(-9 + g, -105, 2, 2); }
  ctx.fillStyle = SK_D; ctx.fillRect(7, -99, 1.4, 2.4);
  ctx.fillStyle = '#8C5040'; ctx.fillRect(-4, -95.4, 9, 1);
  ink(ctx, () => ctx.arc(-9, -101, 1.4, 0, Math.PI * 2), '#D4D4D8', 0.6);
  ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-9, -99.6); for (let k = 1; k <= 6; k++) ctx.lineTo(-9 + (k % 2 ? -1.2 : 1.2), -99.6 + k * 1.6); ctx.stroke();
  ctx.restore();
};

/** The pencil necks' lines, over whichever one's saying it. */
export const drawGymFront = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  const said = saying(rt.talk, 'intern');
  if (said) {
    const e = state.enemies.find(en => en.id === rt.speaker);
    if (e) drawBubble(ctx, e.pos.x + e.width / 2, e.pos.y - 8, said, '#F8FAFC');
  }
};

/** The time up in the corner as it starts, and the fade out at the end. */
export const drawGymHud = (ctx: Ctx, state: GameState) => {
  const rt = getGym(state);
  if (!rt) return;
  if (rt.startedAt === CP.START && state.frame < 260) {
    const a = Math.min(1, Math.min(state.frame / 30, (260 - state.frame) / 40));
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(20, 60, 250, 46);
    ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillStyle = '#FACC15'; ctx.fillText('THE IRON PIT', 32, 80);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#F8FAFC'; ctx.fillText('5:02 A.M. CHEST DAY.', 32, 98);
    ctx.restore();
  }
  const k = fadeAmount(rt);
  if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
};
