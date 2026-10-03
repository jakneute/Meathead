// Drawing for Artie's stage: hazards, set pieces and their HUD.

import { drawFlingDeath, FLING_FRAMES } from './flingDraw';
import { bandedGradient, steppedGlow, checker } from '../../render/pixelArt';
import { INK, dark, lite } from '../../render/npc/kit';
import type { GameState } from '../../core/state';
import { getArtie } from './runtime';
import { COURSE, CAVE_STEP } from './course';
import { windBlowing, Hazards, chuteLive, CHUTE_WARN_FRAMES } from './hazards';
import { drawTramRigging, drawTramBack, drawTramFront, drawTramHud } from './tramDraw';
import { tramFloorLineAt, CABIN_W } from './tram';
import { drawMooseCorpse, drawMooseHud } from './mooseDraw';
import { drawSkiMid, drawSkiFront, drawSkiHud } from './skiDraw';
import { warmCrevasseCam } from '../../render/player/fallCams';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------
// The kit (the ski run, the tram and the fling draw with these too)
// ---------------------------------------------------------------------------

/** A flat ellipse in 2px rows (a shadow, a pool, a drift): `half` for just the top half of it. */
export const pixEllipse = (ctx: Ctx, cx: number, cy: number, rw: number, rh: number, c: string, half = false) => {
  ctx.fillStyle = c;
  const n = Math.max(1, Math.ceil(rh / 2));
  for (let i = -n; i < (half ? 0 : n); i++) {
    const v = (i + 0.5) / n, w = Math.round(rw * Math.sqrt(Math.max(0, 1 - v * v)) / 2) * 2;
    if (w > 0) ctx.fillRect(Math.round(cx / 2) * 2 - w, Math.round(cy / 2) * 2 + i * 2, w * 2, 2);
  }
};

/** A ball of packed snow at (x, y), r across, in steps: blue in its own shadow lower right, the snow, a lit cap upper
 * left, a glint; inked round. */
export const snowDisc = (ctx: Ctx, x: number, y: number, r: number, line = 1.5) => {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#9DB3D3'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = '#C9D7EA'; ctx.beginPath(); ctx.arc(x - r * 0.12, y - r * 0.12, r * 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E6EDF7'; ctx.beginPath(); ctx.arc(x - r * 0.24, y - r * 0.24, r * 0.68, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x - r * 0.36, y - r * 0.36, r * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = line; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
};

/** A log lying along x from x0 to x1, its middle at y, h thick: bark in steps (lit along the top, dark underneath),
 * streaks down it, inked; `end` for the sawn-off end showing at x1, its rings. */
export const logAlong = (ctx: Ctx, x0: number, x1: number, y: number, h: number, bark = '#5B3A1E', end = true) => {
  const t = y - h / 2;
  ctx.fillStyle = bark; ctx.fillRect(x0, t, x1 - x0, h);
  ctx.fillStyle = lite(bark, 0.22); ctx.fillRect(x0, t + 1, x1 - x0, Math.max(2, Math.round(h * 0.28)));
  ctx.fillStyle = lite(bark, 0.42); ctx.fillRect(x0, t + 1, x1 - x0, 1);
  ctx.fillStyle = dark(bark, 0.3); ctx.fillRect(x0, t + h - Math.max(2, Math.round(h * 0.3)), x1 - x0, Math.max(2, Math.round(h * 0.3)));
  ctx.fillStyle = dark(bark, 0.42);
  for (let x = x0 + 5; x < x1 - 6; x += 13) ctx.fillRect(Math.round(x + ((x * 7) % 5)), Math.round(t + h * 0.4 + ((x * 3) % 4)), 6 + ((x * 5) % 4), 1);
  ctx.fillStyle = INK; ctx.fillRect(x0, t, x1 - x0, 1); ctx.fillRect(x0, t + h - 1, x1 - x0, 1);
  if (!end) return;
  const ry = h / 2, rx = Math.max(3, h * 0.3);
  ctx.fillStyle = '#A7794A'; ctx.beginPath(); ctx.ellipse(x1, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#D2AA74'; ctx.beginPath(); ctx.ellipse(x1 - rx * 0.12, y - ry * 0.1, rx * 0.72, ry * 0.75, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9A6C3E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x1 - rx * 0.12, y - ry * 0.1, rx * 0.4, ry * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#7A4E28'; ctx.fillRect(Math.round(x1 - 1), Math.round(y - 1), 2, 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x1, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
};

/** A spike of ice hanging from (x, y), w across, len long: lit down its left, shadowed down its right, a glint, inked. */
export const iceSpike = (ctx: Ctx, x: number, y: number, w: number, len: number, line = 1) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y); ctx.lineTo(x, y + len); ctx.closePath(); };
  ctx.fillStyle = '#93C5FD'; path(); ctx.fill();
  ctx.fillStyle = '#C7E2FE'; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w * 0.1, y); ctx.lineTo(x, y + len); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F0F8FF'; ctx.beginPath(); ctx.moveTo(x - w * 0.36, y); ctx.lineTo(x - w * 0.14, y); ctx.lineTo(x - w * 0.04, y + len * 0.7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1E3A6E'; ctx.lineWidth = line; ctx.lineJoin = 'round'; path(); ctx.stroke();
};

/** A conifer's tier (a triangle of needles from its tip at (x, top) down to bot, w either side): the shadow side, the
 * lit side, the snow along the top in two steps, inked in `line`. */
export const pineTier = (ctx: Ctx, x: number, top: number, bot: number, w: number, tones: { shade: string; lit: string; ink: string }, snow = true) => {
  const tri = () => { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, bot); ctx.lineTo(x - w, bot); ctx.closePath(); };
  ctx.fillStyle = tones.shade; tri(); ctx.fill();
  ctx.fillStyle = tones.lit; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - w, bot); ctx.lineTo(x - w * 0.15, bot); ctx.closePath(); ctx.fill();
  // (a darker fringe of needles along the bottom edge)
  ctx.fillStyle = dark(tones.shade, 0.3);
  for (let k = -w + 3; k < w - 3; k += 6) ctx.fillRect(Math.round(x + k), Math.round(bot - 3), 3, 3);
  if (snow) {
    const h = bot - top;
    ctx.fillStyle = '#B9CBE2'; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - w * 0.58, top + h * 0.6); ctx.lineTo(x - w * 0.2, top + h * 0.5); ctx.lineTo(x + w * 0.12, top + h * 0.64); ctx.lineTo(x + w * 0.5, top + h * 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F1F6FC'; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - w * 0.55, top + h * 0.53); ctx.lineTo(x - w * 0.2, top + h * 0.43); ctx.lineTo(x + w * 0.1, top + h * 0.56); ctx.lineTo(x + w * 0.45, top + h * 0.48); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = tones.ink; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; tri(); ctx.stroke();
};

/** A block: its colour, lit along the top and down the left, shadowed down the right and along the bottom, inked round. */
export const slab = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, e = 2) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.3); ctx.fillRect(x, y, w, e); ctx.fillRect(x, y, e, h);
  ctx.fillStyle = dark(c, 0.25); ctx.fillRect(x + w - e, y, e, h); ctx.fillRect(x, y + h - e, w, e);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

/** Lettering, centered on x, a drop shadow under it in the sign's own dark. */
export const letter = (ctx: Ctx, text: string, x: number, y: number, font: string, c: string, shadow: string) => {
  ctx.font = font; ctx.textAlign = 'center';
  ctx.fillStyle = shadow; ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = c; ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
};

/** Shingles over whatever's clipped (a roof): rows of tabs `row` deep, each row lit along its top and dark under its
 * lip, the joints between the tabs staggered row to row. */
export const shingles = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, row = 9, tab = 14) => {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  for (let r = 0, ry = y; ry < y + h; r++, ry += row) {
    ctx.fillStyle = lite(c, 0.16); ctx.fillRect(x, ry, w, 2);
    ctx.fillStyle = dark(c, 0.35); ctx.fillRect(x, ry + row - 2, w, 2);
    ctx.fillStyle = dark(c, 0.25);
    for (let tx = x + (r % 2) * (tab / 2); tx < x + w; tx += tab) ctx.fillRect(Math.round(tx), ry + 2, 1, row - 4);
  }
};

/** A drift of snow lying on something, its top at y from x0 to x1, h deep: the snow, its blue underside, a lit crest, inked along the top. */
export const snowCap = (ctx: Ctx, x0: number, x1: number, y: number, h: number) => {
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y + h); ctx.quadraticCurveTo(x0, y, x0 + h, y); ctx.lineTo(x1 - h, y); ctx.quadraticCurveTo(x1, y, x1, y + h); ctx.closePath(); };
  ctx.fillStyle = '#F4F8FC'; path(); ctx.fill();
  ctx.fillStyle = '#A9BEDA'; ctx.fillRect(x0 + 1, y + h - 2, x1 - x0 - 2, 2);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0 + h, y + 1, Math.max(0, x1 - x0 - h * 2), 1);
  ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; path(); ctx.stroke();
};

export const drawArtieBack = (ctx: Ctx, state: GameState) => {
  // (the crevasse kill cam's walls painted now, not on the frame he goes down one: it would stall)
  warmCrevasseCam(CANVAS_WIDTH, CANVAS_HEIGHT);
  drawCave(ctx, state);
  // Pylons rise out of the clouds; the stations and the cabin are in front of them
  drawTramRigging(ctx, state);
  drawCloudSea(ctx, state);
  drawTramBack(ctx, state, getArtie(state)!.tram);
  drawPines(ctx, state);
};

// ---------------------------------------------------------------------------
// The ice cave
// ---------------------------------------------------------------------------

/** The underside of the cave's roof at x (straight between its samples). */
export const caveRoofAt = (x: number) => {
  const C = COURSE.cave, i = (x - C.x1) / CAVE_STEP, i0 = Math.max(0, Math.min(C.roof.length - 1, Math.floor(i))), i1 = Math.min(C.roof.length - 1, i0 + 1);
  return C.roof[i0] + (C.roof[i1] - C.roof[i0]) * Math.max(0, Math.min(1, i - i0));
};

/** Inside the mountain: walls of blue ice (lit from within, crystals glowing in it, the odd thing frozen into it), the
 * roof low overhead (dark rock and ice, a fringe of little icicles along its underside), a mouth at each end. */
const drawCave = (ctx: Ctx, state: GameState) => {
  const C = COURSE.cave, v = viewOf(state);
  if (C.x2 < v.x - 100 || C.x1 > v.x + v.w + 100) return;
  const x1 = Math.max(C.x1, v.x - 60), x2 = Math.min(C.x2, v.x + v.w + 60);
  const top = v.y - 200, bottom = v.y + v.h + 200;
  // The back wall
  ctx.fillStyle = '#081830'; ctx.fillRect(x1, top, x2 - x1, v.y - top);
  ctx.fillStyle = '#1A4A7A'; ctx.fillRect(x1, v.y + v.h, x2 - x1, bottom - v.y - v.h);
  bandedGradient(ctx, x1, v.y, x2 - x1, v.h, ['#081830', '#0C2445', '#10305A', '#153D6A', '#1A4A7A'], 12);
  // Streaks down the ice, and crystals growing out of it (glowing)
  for (let x = Math.floor(x1 / 46) * 46; x < x2; x += 46) {
    const h = hash(x * 0.13);
    ctx.fillStyle = `rgba(147, 197, 253, ${0.06 + h * 0.08})`; ctx.fillRect(x + h * 20, caveRoofAt(x) + 10, 2 + h * 3, 200 + h * 160);
  }
  for (let x = Math.floor(x1 / 310) * 310 + 120; x < x2; x += 310) {
    const h = hash(x * 0.71), cy = caveRoofAt(x) + 90 + h * 90;
    steppedGlow(ctx, x, cy, 46, '#67E8F9', 0.2, 0.05, 4);
    for (let k = 0; k < 4; k++) {
      const a = -Math.PI / 2 + (k - 1.5) * 0.45, len = 18 + hash(x + k) * 20;
      ctx.save(); ctx.translate(x, cy + 16); ctx.rotate(a + Math.PI / 2);
      // (a facet lit, a facet in shadow, a hot line up the ridge, inked)
      ctx.fillStyle = '#22B8D4'; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, -len); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = k % 2 ? '#67E8F9' : '#A5F3FC'; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, -len); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ECFEFF'; ctx.fillRect(-1, -len * 0.75, 1, len * 0.6);
      ctx.strokeStyle = '#0B3A5A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, -len); ctx.lineTo(5, 0); ctx.stroke();
      ctx.restore();
    }
  }
  // (something frozen in the wall, now and then: a fish, a tusk, a ski pole)
  for (let x = Math.floor(x1 / 900) * 900 + 450; x < x2; x += 900) {
    const k = Math.floor(hash(x * 0.3) * 3), cy = caveRoofAt(x) + 150;
    ctx.save(); ctx.globalAlpha = 0.45; ctx.translate(x, cy);
    ctx.strokeStyle = '#0B1A33'; ctx.lineWidth = 1.5;
    if (k === 0) {
      // (a fish: the back dark, the belly lit, an eye)
      const fish = () => { ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0.2, 0, Math.PI * 2); ctx.moveTo(16, 2); ctx.lineTo(28, -6); ctx.lineTo(28, 10); ctx.closePath(); };
      ctx.fillStyle = '#94A3B8'; fish(); ctx.fill();
      ctx.fillStyle = '#5E6B80'; ctx.beginPath(); ctx.ellipse(1, -3, 16, 4, 0.2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-10, 2, 16, 2);
      fish(); ctx.stroke();
      ctx.fillStyle = '#0B1A33'; ctx.fillRect(-13, -3, 2, 2);
    } else if (k === 1) {
      // (a tusk: ivory, its inner curve in shadow)
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0B1A33'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 30, 0.2, 1.8); ctx.stroke();
      ctx.strokeStyle = '#F5F5DC'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 30, 0.2, 1.8); ctx.stroke();
      ctx.strokeStyle = '#C9C49A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 28, 0.2, 1.8); ctx.stroke();
      ctx.lineCap = 'butt';
    } else {
      // (a ski pole: the shaft, its grip, the basket)
      ctx.fillStyle = '#DC2626'; ctx.fillRect(-2, -30, 4, 60); ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-2, -30, 1, 60);
      ctx.strokeRect(-2.5, -30.5, 5, 61);
      ctx.fillStyle = '#1F2937'; ctx.fillRect(-3, -34, 6, 9);
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(0, 26, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(-1, 25, 2, 2);
    }
    ctx.restore();
  }
  // The roof: rock and old ice above its underside (bands in it, lighter down toward the edge), a lighter band along
  // the edge, a fringe of little icicles
  ctx.fillStyle = '#1A2536';
  ctx.beginPath(); ctx.moveTo(x1, top);
  for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, caveRoofAt(x));
  ctx.lineTo(x2, top); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, top); for (let x = x1; x <= x2; x += 10) ctx.lineTo(x, caveRoofAt(x)); ctx.lineTo(x2, top); ctx.closePath(); ctx.clip();
  // (the rock lighter down toward its underside, in bands)
  const roofMid = caveRoofAt((x1 + x2) / 2);
  bandedGradient(ctx, x1, roofMid - 260, x2 - x1, 300, ['#1A2536', '#1F2D42', '#25384F', '#2A405B', '#2E4666', '#2E4666'], 8);
  for (let b = 0; b < 6; b++) {
    ctx.strokeStyle = b % 2 ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.35)'; ctx.lineWidth = 3 + (b % 3) * 2;
    ctx.beginPath(); for (let x = x1; x <= x2; x += 20) { const y = caveRoofAt(x) - 30 - b * 38 + Math.sin(x * 0.01 + b) * 8; if (x === x1) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  }
  // (stones bedded in it: each in steps, lit on top, its shadow under it)
  for (let x = Math.floor(x1 / 60) * 60; x < x2; x += 60) {
    const sx = x + hash(x) * 30, sy = caveRoofAt(x) - 60 - hash(x * 3) * 150, rw = 10 + hash(x * 5) * 14, rh = 6 + hash(x * 7) * 6;
    pixEllipse(ctx, sx + 1, sy + 2, rw, rh, '#121A28');
    pixEllipse(ctx, sx, sy, rw, rh, '#3A4A62');
    pixEllipse(ctx, sx - rw * 0.2, sy - rh * 0.35, rw * 0.6, rh * 0.45, '#56677F');
  }
  ctx.restore();
  ctx.strokeStyle = '#3B6EA8'; ctx.lineWidth = 4;
  ctx.beginPath(); for (let x = x1; x <= x2; x += 10) { const y = caveRoofAt(x) - 2; if (x === x1) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  for (let x = Math.floor(x1 / 17) * 17; x < x2; x += 17) {
    const y = caveRoofAt(x), l = 5 + hash(x) * 12;
    ctx.fillStyle = '#7FA6D6'; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x, y + l); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#DCEBFE'; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x, y); ctx.lineTo(x, y + l); ctx.closePath(); ctx.fill();
  }
  // The mouths, each end: the mountain's face going up from the lip of the opening (rock, snow lying on its ledges)
  for (const [mx, dir] of [[C.x1, -1], [C.x2, 1]] as const) {
    if (mx < v.x - 200 || mx > v.x + v.w + 200) continue;
    const ry = caveRoofAt(mx);
    // (the rock in steps, lighter toward the lip of the opening, dithered between; strata across it)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(mx - dir * 6, ry); ctx.quadraticCurveTo(mx + dir * 10, ry - 60, mx + dir * 30, ry - 110);
    ctx.lineTo(mx + dir * 50, ry - 170); ctx.lineTo(mx + dir * 90, top); ctx.lineTo(mx - dir * 20, top); ctx.lineTo(mx - dir * 20, ry); ctx.closePath(); ctx.clip();
    const tones = ['#344C70', '#2E4364', '#293B59', '#24344E'];
    for (let i = 0; i < 4; i++) {
      const a = mx - dir * 20 + dir * i * 28, w = i === 3 ? 200 : 28;
      ctx.fillStyle = tones[i]; ctx.fillRect(dir > 0 ? a : a - w, top, w, ry - top + 4);
      if (i) checker(ctx, dir > 0 ? a - 2 : a, top, 2, ry - top + 4, tones[i]);
    }
    for (let k = 0; k < 6; k++) {
      const sx = mx + dir * (4 + k * 13) - (dir < 0 ? 18 : 0), sy = ry - 40 - k * 37 - (k % 2) * 9;
      ctx.fillStyle = '#456190'; ctx.fillRect(sx, sy, 18, 2);
      ctx.fillStyle = '#1A2638'; ctx.fillRect(sx, sy + 2, 18, 2);
    }
    ctx.restore();
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx - dir * 6, ry); ctx.quadraticCurveTo(mx + dir * 10, ry - 60, mx + dir * 30, ry - 110); ctx.lineTo(mx + dir * 50, ry - 170); ctx.lineTo(mx + dir * 90, top); ctx.stroke();
    // (snow on its ledges, the icicles off the lip of the opening)
    for (const [dx, dy, w] of [[8, -60, 26], [32, -112, 30], [52, -172, 34]] as const) {
      const lump = (oy: number) => { ctx.beginPath(); ctx.ellipse(mx + dir * dx, ry + dy + oy, w / 2, 5, dir * -0.3, Math.PI, 0); };
      ctx.fillStyle = '#9FB4D2'; lump(1); ctx.fill();
      ctx.fillStyle = '#F1F5F9'; lump(-1); ctx.fill();
      ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 1; lump(-1); ctx.stroke();
    }
    for (let k = 0; k < 4; k++) iceSpike(ctx, mx + dir * (k * 6 - 12), ry, 6, 14 + (k % 2) * 8);
  }
};

// ---------------------------------------------------------------------------
// The high woods
// ---------------------------------------------------------------------------

/** The pines of the high woods, behind everything: tiers of dark needles, snow along the top of each, the trunk. */
const drawPines = (ctx: Ctx, state: GameState) => {
  const W = COURSE.woods;
  const v = viewOf(state);
  if (W.x2 < v.x - 200 || W.x1 > v.x + v.w + 200) return;
  for (const p of W.pines) {
    if (p.x < v.x - 120 || p.x > v.x + v.w + 120) continue;
    const tiers = Math.max(3, Math.round(p.h / 60)), w0 = p.h * 0.32;
    // (the trunk in three steps, bark lines down it, inked)
    const tt = p.y - p.h * 0.25, th = p.h * 0.25 + 4;
    ctx.fillStyle = '#2A1A10'; ctx.fillRect(p.x - 6, tt, 12, th);
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(p.x - 6, tt, 4, th);
    ctx.fillStyle = '#1A0F08'; ctx.fillRect(p.x + 3, tt, 3, th);
    ctx.fillStyle = '#1A0F08'; for (let y = tt + 6; y < p.y - 4; y += 9) ctx.fillRect(p.x - 3 + ((y * 3) % 4), y, 1, 5);
    ctx.strokeStyle = '#08140D'; ctx.lineWidth = 1; ctx.strokeRect(p.x - 6.5, tt, 13, th);
    for (let k = 0; k < tiers; k++) {
      const top = p.y - p.h + (k * p.h * 0.75) / tiers, bot = top + p.h * 0.34, w = w0 * (0.45 + (0.55 * (k + 1)) / tiers);
      pineTier(ctx, p.x, top, bot, w, { shade: '#0F2E1C', lit: '#1B4D2E', ink: '#06140C' });
    }
    // (snow heaped round the foot of it)
    pixEllipse(ctx, p.x, p.y, 18, 6, '#A9BEDA', true);
    pixEllipse(ctx, p.x, p.y - 1, 16, 5, '#F8FAFC', true);
  }
  // (a haze of blown snow between the pines and what's in front of them: the woods sit back, what you climb stands out)
  const hx1 = Math.max(W.x1 - 100, v.x), hx2 = Math.min(W.x2 + 100, v.x + v.w);
  if (hx2 > hx1) {
    // (fading in and out over the edges of the woods in steps, a dither at each: no seam)
    const STEPS = 8, alphaAt = (x: number) => Math.round(Math.max(0, Math.min(1, Math.min(x - (W.x1 - 100), W.x2 + 100 - x) / 200)) * STEPS) / STEPS * 0.28;
    let run = Math.floor(hx1 / 8) * 8;
    while (run < hx2) {
      const a = alphaAt(run + 4);
      let end = run + 8; while (end < hx2 && alphaAt(end + 4) === a) end += 8;
      if (a > 0) { ctx.fillStyle = `rgba(203, 219, 238, ${a.toFixed(3)})`; ctx.fillRect(run, v.y, end - run, v.h); }
      if (end < hx2) { const an = alphaAt(end + 4); if (an > a) checker(ctx, end - 2, v.y, 2, v.h, `rgba(203, 219, 238, ${(an - a).toFixed(3)})`); else if (an < a) checker(ctx, end, v.y, 2, v.h, `rgba(203, 219, 238, ${(a - an).toFixed(3)})`); }
      run = end;
    }
  }
};

/** The boughs you climb (a limb off the trunk, needles along it, snow on top) and the fallen trunk. */
const drawBoughs = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (!l.look || !onScreen(state, l.x)) continue;
    if (l.look === 'log') {
      // (the bark in steps round the trunk: lit along the top, the shadow under it; furrows, a knot; inked)
      const body = () => { ctx.beginPath(); ctx.roundRect(l.x, l.y, l.w, 44, 18); };
      ctx.save(); body(); ctx.clip();
      ctx.fillStyle = '#4A2E1A'; ctx.fillRect(l.x, l.y, l.w, 44);
      ctx.fillStyle = '#6A4426'; ctx.fillRect(l.x, l.y + 4, l.w, 10);
      ctx.fillStyle = '#86593A'; ctx.fillRect(l.x, l.y + 6, l.w, 3);
      checker(ctx, l.x, l.y + 14, l.w, 2, '#6A4426');
      ctx.fillStyle = '#2E1C10'; ctx.fillRect(l.x, l.y + 32, l.w, 12);
      checker(ctx, l.x, l.y + 30, l.w, 2, '#2E1C10');
      ctx.fillStyle = '#2A190D';
      for (let x = l.x + 16; x < l.x + l.w - 12; x += 22) for (let y = 10; y < 38; y += 4) ctx.fillRect(Math.round(x + Math.sin((y + x) * 0.3) * 2), l.y + y, 2, 3);
      ctx.fillStyle = '#2A190D'; ctx.beginPath(); ctx.ellipse(l.x + l.w * 0.35, l.y + 24, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6A4426'; ctx.fillRect(Math.round(l.x + l.w * 0.35 - 4), l.y + 21, 5, 1);
      ctx.restore();
      ctx.strokeStyle = '#0B1220'; ctx.lineWidth = 2; body(); ctx.stroke();
      // (its sawn-off end, the rings in it, lit and shaded)
      const ex = l.x + l.w - 8, ey = l.y + 22;
      ctx.fillStyle = '#8A6038'; ctx.beginPath(); ctx.ellipse(ex, ey, 10, 21, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#C8A070'; ctx.beginPath(); ctx.ellipse(ex - 1, ey - 1, 8, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#E0C08E'; ctx.beginPath(); ctx.ellipse(ex - 3, ey - 6, 4, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8A6038'; ctx.lineWidth = 1; for (let r = 4; r < 17; r += 5) { ctx.beginPath(); ctx.ellipse(ex - 1, ey - 1, r * 0.5, r, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.strokeStyle = '#0B1220'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(ex, ey, 10, 21, 0, 0, Math.PI * 2); ctx.stroke();
      // (the snow along the top of it)
      ctx.fillStyle = '#A9BEDA'; ctx.beginPath(); ctx.ellipse(l.x + l.w / 2, l.y + 3, l.w / 2 - 6, 6, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(l.x + l.w / 2, l.y + 2, l.w / 2 - 6, 6, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(l.x + l.w * 0.25, l.y - 3, l.w * 0.4, 1);
      ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(l.x + l.w / 2, l.y + 2, l.w / 2 - 6, 6, 0, Math.PI, 0); ctx.stroke();
      continue;
    }
    // A bough: a thick limb (bark lit along the top, inked round), the needles hanging off it in a brighter, warmer
    // green than the woods behind, inked; a fat cap of snow along the top that you stand on, its shadow under it;
    // icicles off the underside
    const INKC = '#0B1220';
    const limb = () => { ctx.beginPath(); ctx.moveTo(l.x - 4, l.y + 6); ctx.lineTo(l.x + l.w + 2, l.y + 8); ctx.lineTo(l.x + l.w, l.y + 15); ctx.lineTo(l.x - 4, l.y + 17); ctx.closePath(); };
    for (let x = l.x; x < l.x + l.w; x += 12) {
      const tip = l.y + 26 + ((x * 7) % 3) * 2;
      ctx.fillStyle = INKC; ctx.beginPath(); ctx.moveTo(x - 2, l.y + 10); ctx.lineTo(x + 16, l.y + 10); ctx.lineTo(x + 7, tip + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2F7A3E'; ctx.beginPath(); ctx.moveTo(x, l.y + 11); ctx.lineTo(x + 14, l.y + 11); ctx.lineTo(x + 7, tip); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4A9E55'; ctx.beginPath(); ctx.moveTo(x, l.y + 11); ctx.lineTo(x + 6, l.y + 11); ctx.lineTo(x + 5, tip - 4); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#5B3A22'; limb(); ctx.fill();
    ctx.strokeStyle = INKC; ctx.lineWidth = 2; limb(); ctx.stroke();
    ctx.fillStyle = '#8A5A34'; ctx.fillRect(l.x, l.y + 8, l.w, 2);
    ctx.fillStyle = 'rgba(30, 16, 8, 0.5)'; for (let x = l.x + 6; x < l.x + l.w - 4; x += 15) ctx.fillRect(x, l.y + 11, 6, 1.5);
    // (icicles off the limb)
    ctx.fillStyle = '#BFDBFE'; for (let x = l.x + 9; x < l.x + l.w - 6; x += 23) { ctx.beginPath(); ctx.moveTo(x - 2, l.y + 16); ctx.lineTo(x + 2, l.y + 16); ctx.lineTo(x, l.y + 24 + ((x * 3) % 7)); ctx.closePath(); ctx.fill(); }
    // (the snow cap: thick, rounded, overhanging, inked, the blue of its shadow along its underside)
    const cap = () => { ctx.beginPath(); ctx.moveTo(l.x - 6, l.y + 7); ctx.quadraticCurveTo(l.x - 6, l.y - 4, l.x + 6, l.y - 4); ctx.lineTo(l.x + l.w - 4, l.y - 3); ctx.quadraticCurveTo(l.x + l.w + 6, l.y - 3, l.x + l.w + 5, l.y + 8); ctx.closePath(); };
    ctx.fillStyle = '#F8FAFC'; cap(); ctx.fill();
    ctx.strokeStyle = INKC; ctx.lineWidth = 2; cap(); ctx.stroke();
    ctx.fillStyle = '#9FB8D8'; ctx.fillRect(l.x - 4, l.y + 5, l.w + 8, 2.5);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(l.x + 4, l.y - 2, l.w - 12, 2);
  }
};

export const drawArtieMid = (ctx: Ctx, state: GameState) => {
  const rt = getArtie(state)!;
  drawWind(ctx, state);
  drawBoughs(ctx, state);
  if (rt.moose.corpse) drawMooseCorpse(ctx, rt.moose.corpse, state.frame);
  drawCrumbles(ctx, state, rt.hazards);
  drawIcicles(ctx, state, rt.hazards);
  drawChutes(ctx, state, rt.hazards);
  drawSnowballs(ctx, rt.hazards);
  drawSkiMid(ctx, state, rt.ski);
};

export const drawArtieFront = (ctx: Ctx, state: GameState) => {
  drawTramFront(ctx, state, getArtie(state)!.tram);
  drawSkiFront(ctx, state, getArtie(state)!.ski);
};

export const drawArtieHud = (ctx: Ctx, state: GameState) => {
  drawTramHud(ctx, state, getArtie(state)!.tram);
  drawMooseHud(ctx, state, getArtie(state)!.moose);
  drawSkiHud(ctx, state, getArtie(state)!.ski);
  drawChuteWarnings(ctx, state, getArtie(state)!.hazards);
  // Killed in the snowball: thrown off the far side of the mountain (over everything, while it plays and under the message)
  if (state.deathTimer > 0 && getArtie(state)!.ski.fling) drawFlingDeath(ctx, state, state.deathScene?.t ?? FLING_FRAMES);
};

/** How far along a chute's telegraph is (0..1), or 0 if it isn't about to go. */
const chuteWindup = (state: GameState, hz: Hazards, i: number) => {
  const ch = COURSE.chutes[i];
  if (!chuteLive(ch, state.player.pos.x + state.player.width / 2)) return 0;
  const t = hz.chuteTimers[i];
  return t > 0 && t <= CHUTE_WARN_FRAMES ? 1 - t / CHUTE_WARN_FRAMES : 0;
};

/** A snowball about to come from a chute off the right of the screen: a warning at the edge, at its height. */
const drawChuteWarnings = (ctx: Ctx, state: GameState, hz: Hazards) => {
  COURSE.chutes.forEach((ch, i) => {
    const k = chuteWindup(state, hz, i);
    if (!k || ch.x < state.camera.x + 800 - 20) return;
    if (Math.floor(state.frame / 5) % 2) return;
    const y = Math.max(40, Math.min(560, ch.y - ch.size / 2 - state.camera.y));
    const x = 800 - 26;
    ctx.save();
    // An arrow pointing in from the edge (shaded, a yellow rim, inked), a snowball on it
    const arrow = () => { ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 6, y - 16); ctx.lineTo(x + 6, y + 16); ctx.closePath(); };
    ctx.fillStyle = '#DC2626'; arrow(); ctx.fill();
    ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 6, y + 16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2; arrow(); ctx.stroke();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 21, y); ctx.lineTo(x + 7, y - 18); ctx.lineTo(x + 7, y + 18); ctx.closePath(); ctx.stroke();
    snowDisc(ctx, x + 2, y, 4 + (ch.size / 56) * 4, 1);
    ctx.restore();
  });
};

/** How far under the tram cabin's path the cloud tops sit. */
const CLOUD_TOP = 190;

/** A deterministic 0..1 from a number (so the clouds don't flicker). */
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

/**
 * The gorge under the upper station: a thick sea of cloud, rolling slowly. It's
 * drawn behind everything (the tram cabin rides in front of it, the mountainside
 * rises out of it), sloping down on the left to meet the mountain.
 */
const drawCloudSea = (ctx: Ctx, state: GameState) => {
  const gz = COURSE.gorge;
  const x1 = gz.x1 - 40, x2 = gz.x2 + 40;
  const vw = viewOf(state);
  if (x2 < vw.x - 50 || x1 > vw.x + vw.w + 50) return;
  // Where the cloud tops are at x: a steady distance under the cable line (under the cabin's middle as it passes)
  const topAt = (x: number) => tramFloorLineAt(x + CABIN_W / 2) + CLOUD_TOP;
  const bottom = Math.max(vw.y + vw.h + 100, topAt(Math.max(x1, vw.x)) + 300);
  const layers = [
    { dy: 0, color: '#5E6C8C', r: 70, drift: 0.12, step: 80 },
    { dy: 45, color: '#8290AE', r: 62, drift: -0.2, step: 70 },
    { dy: 95, color: '#AAB6CE', r: 56, drift: 0.3, step: 60 },
  ];
  layers.forEach((l, li) => {
    ctx.fillStyle = l.color;
    // The body of the layer
    ctx.beginPath();
    ctx.moveTo(x1, topAt(x1) + l.dy + l.r * 0.4);
    for (let x = x1; x <= x2; x += 40) ctx.lineTo(x, topAt(x) + l.dy + l.r * 0.4);
    ctx.lineTo(x2, bottom); ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
    // Billows along its top, drifting
    const shift = (state.frame * l.drift) % l.step;
    for (let x = x1 - l.step + shift, i = 0; x < x2 + l.step; x += l.step, i++) {
      const k = hash(Math.round((x - shift) / l.step) + li * 97);
      const r = l.r * (0.7 + k * 0.6);
      const y = topAt(x) + l.dy + (hash(i * 3.7 + li) - 0.5) * 30 + Math.sin(state.frame * 0.01 + i) * 4;
      ctx.fillStyle = l.color; ctx.beginPath(); ctx.ellipse(x, y + r * 0.35, r * 1.3, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
      // (each billow lit along its crown, in two steps, the moon on it)
      ctx.fillStyle = lite(l.color, 0.14); ctx.beginPath(); ctx.ellipse(x - r * 0.15, y + r * 0.1, r * 1.0, r * 0.45, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = lite(l.color, 0.28); ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.12, r * 0.6, r * 0.22, 0, Math.PI, 0); ctx.fill();
    }
  });
};

const onScreen = (state: GameState, x: number, pad = 120) => { const v = viewOf(state); return x > v.x - pad && x < v.x + v.w + pad; };

/** What of the world's on screen (more than the camera's 800 across when it's zoomed out, on the skis). */
export const viewOf = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };

/** Height of the ground line at x (or the bottom of the view over a pit). */
export const floorY = (state: GameState, x: number) => {
  for (const r of state.groundRuns) if (x >= r.x1 && x <= r.x2) return r.y1 + ((x - r.x1) / (r.x2 - r.x1 || 1)) * (r.y2 - r.y1);
  return viewOf(state).y + 550;
};

// ---------------------------------------------------------------------------

const drawIcicles = (ctx: Ctx, state: GameState, hz: Hazards) => {
  for (const ic of hz.icicles) {
    if (ic.state === 'gone' || !onScreen(state, ic.x)) continue;
    const jitter = ic.state === 'shake' ? (state.frame % 4 < 2 ? 1.5 : -1.5) : 0;
    const x = ic.x + jitter, y = ic.state === 'fall' ? ic.fy : ic.y;
    // A long spike of ice: lit down its left, in shadow down its right, a glint, inked; a band of frost at its root
    iceSpike(ctx, x, y, 16, 42, 1.5);
    ctx.fillStyle = '#5B8FD6'; ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x + 8, y); ctx.lineTo(x + 1, y + 42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x - 8, y, 16, 3);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 4, y + 8, 2, 2); ctx.fillRect(x - 3, y + 16, 1, 4);
    // Shaking loose: a warning shadow on the ground under it
    if (ic.state === 'shake') {
      const gy = floorY(state, ic.x), a = 0.15 + (ic.t / 26) * 0.35;
      pixEllipse(ctx, ic.x, gy - 1, 14 + ic.t * 0.4, 4, `rgba(15, 23, 42, ${(a * 0.6).toFixed(3)})`);
      pixEllipse(ctx, ic.x, gy - 1, (14 + ic.t * 0.4) * 0.6, 3, `rgba(15, 23, 42, ${a.toFixed(3)})`);
    }
  }
};

const drawCrumbles = (ctx: Ctx, state: GameState, hz: Hazards) => {
  for (const c of hz.crumbles) {
    const b = c.block;
    if (!onScreen(state, b.x)) continue;
    if (c.state === 'gone') {
      // Re-freezing: a faint outline that fills in
      const k = Math.min(1, c.t / 210);
      // (in 2px dashes round where it was)
      ctx.fillStyle = `rgba(191, 219, 254, ${0.15 + k * 0.4})`;
      for (let dx = 0; dx < b.w; dx += 8) { ctx.fillRect(b.x + dx, b.y, 4, 2); ctx.fillRect(b.x + dx, b.y + b.h - 2, 4, 2); }
      for (let dy = 0; dy < b.h; dy += 8) { ctx.fillRect(b.x, b.y + dy, 2, 4); ctx.fillRect(b.x + b.w - 2, b.y + dy, 2, 4); }
      continue;
    }
    const shake = c.state === 'shake' ? Math.sin(state.frame * 1.7) * (1 + c.t / 12) : 0;
    const x = b.x + shake;
    // A slab of blue ice: pale at the top stepping down to deep blue (dithered at each step), facets catching the
    // light, a crust of frost along the top, the shadow down its right end, inked
    bandedGradient(ctx, x, b.y, b.w, b.h, ['#E0F2FE', '#93C5FD', '#60A5FA', '#3B82F6'], Math.max(3, Math.round(b.h / 5)));
    ctx.fillStyle = 'rgba(30, 64, 175, 0.35)'; ctx.fillRect(x + b.w - 4, b.y, 4, b.h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let fx = 10 + (b.x % 7); fx < b.w - 12; fx += 26) for (let k = 0; k < 5; k++) ctx.fillRect(x + fx + k * 2, b.y + 4 + k * 2, 2, 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, b.y, b.w, 3);
    ctx.fillStyle = '#C8E3FB'; for (let fx = 3; fx < b.w - 3; fx += 6) ctx.fillRect(x + fx, b.y + 3, 3, 1);
    ctx.strokeStyle = '#1E3A6E'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    // Little icicles under it
    for (let ix = x + 6; ix < x + b.w - 6; ix += 11) iceSpike(ctx, ix + 3, b.y + b.h, 6, 7 + (Math.round(ix) % 3) * 2);
    // Cracks spreading as it gives way (dark, a pale edge along them)
    if (c.state === 'shake') {
      const n = 1 + Math.floor(c.t / 8);
      for (let i = 0; i < n; i++) {
        const cx = x + ((i * 37) % (b.w - 10)) + 5;
        const crack = (o: number) => { ctx.beginPath(); ctx.moveTo(cx + o, b.y); ctx.lineTo(cx + 4 + o, b.y + b.h * 0.5); ctx.lineTo(cx - 2 + o, b.y + b.h); ctx.stroke(); };
        ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 1; crack(1);
        ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1.5; crack(0);
      }
    }
  }
};

const drawWind = (ctx: Ctx, state: GameState) => {
  for (const w of COURSE.winds) {
    const vw = viewOf(state);
    if (w.x2 < vw.x - 50 || w.x1 > vw.x + vw.w + 50) continue;
    const on = windBlowing(w, state.frame);
    // A tattered trail flag on a pole at the near end: stiff in the wind, limp when it drops
    const px = w.x1 - 20, py = floorY(state, px);
    // (the pole: weathered wood in steps, inked, a cap of snow on it; a drift round its foot)
    ctx.fillStyle = '#57534E'; ctx.fillRect(px, py - 90, 4, 90);
    ctx.fillStyle = '#8A847C'; ctx.fillRect(px, py - 90, 1, 90);
    ctx.fillStyle = '#2E2B28'; ctx.fillRect(px + 3, py - 90, 1, 90);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(px - 0.5, py - 90.5, 5, 91);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(px - 1, py - 93, 6, 3);
    // (the flag: the cloth, a fold in shadow across it, inked)
    const flag = () => {
      ctx.beginPath();
      if (on) {
        const wave = Math.sin(state.frame * 0.6) * 3;
        ctx.moveTo(px, py - 88); ctx.lineTo(px - 34, py - 84 + wave); ctx.lineTo(px - 30, py - 76 + wave); ctx.lineTo(px, py - 72);
      } else {
        ctx.moveTo(px + 4, py - 88); ctx.lineTo(px + 7, py - 62); ctx.lineTo(px + 11, py - 64); ctx.lineTo(px + 4, py - 74);
      }
      ctx.closePath();
    };
    ctx.fillStyle = '#DC2626'; flag(); ctx.fill();
    ctx.save(); flag(); ctx.clip();
    ctx.fillStyle = '#991B1B'; if (on) ctx.fillRect(px - 36, py - 79 + Math.sin(state.frame * 0.6) * 1.5, 36, 8); else ctx.fillRect(px + 8, py - 90, 4, 30);
    ctx.fillStyle = '#F87171'; if (on) ctx.fillRect(px - 36, py - 87, 36, 2); else ctx.fillRect(px + 4, py - 90, 1, 30);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1; flag(); ctx.stroke();
    pixEllipse(ctx, px + 2, py, 12, 5, '#F1F5F9', true);
    if (!on) continue;
    // Snow streaks racing back along it (in 2px cells, a brighter head on each)
    const span = w.x2 - w.x1;
    for (let i = 0; i < 26; i++) {
      const x = Math.round((w.x2 - ((state.frame * 11 + i * 97) % span)) / 2) * 2;
      const y = Math.round((floorY(state, x) - 10 - ((i * 53) % 170)) / 2) * 2, len = 22 + (i % 3) * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'; ctx.fillRect(x + 8, y, len - 8, 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'; ctx.fillRect(x, y, 8, 2);
    }
  }
};

const drawChutes = (ctx: Ctx, state: GameState, hz: Hazards) => {
  COURSE.chutes.forEach((ch, i) => {
    if (!onScreen(state, ch.x)) return;
    // About to go: the snowball rattles in the chute mouth, shaking snow loose, under a warning
    const k = chuteWindup(state, hz, i);
    if (k) {
      const r = ch.size / 2;
      const jig = Math.floor(state.frame / 2) % 2 ? 1.5 : -1.5;
      snowDisc(ctx, ch.x + 30 - k * 22 + jig, ch.y - r - 8 - (1 - k) * 10, r, 2);
      if (Math.floor(state.frame / 6) % 2 === 0) {
        const wy = ch.y - ch.size - 62;
        const tri = () => { ctx.beginPath(); ctx.moveTo(ch.x + 10, wy - 14); ctx.lineTo(ch.x + 24, wy + 11); ctx.lineTo(ch.x - 4, wy + 11); ctx.closePath(); };
        ctx.fillStyle = '#DC2626'; tri(); ctx.fill();
        ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.moveTo(ch.x + 10, wy - 14); ctx.lineTo(ch.x + 24, wy + 11); ctx.lineTo(ch.x + 14, wy + 11); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2; tri(); ctx.stroke();
        ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ch.x + 10, wy - 17); ctx.lineTo(ch.x + 27, wy + 13); ctx.lineTo(ch.x - 7, wy + 13); ctx.closePath(); ctx.stroke();
        ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillStyle = INK; ctx.fillText('!', ch.x + 12, wy + 10);
        ctx.fillStyle = '#FFFFFF'; ctx.fillText('!', ch.x + 11, wy + 9); ctx.textAlign = 'left';
      }
    }
    // A snow-caked wooden chute poking out of the drift at the top: planks lit along their tops, inked
    const y = ch.y;
    const chute = () => { ctx.beginPath(); ctx.moveTo(ch.x - 10, y - ch.size - 16); ctx.lineTo(ch.x + 40, y - ch.size - 30); ctx.lineTo(ch.x + 40, y - 6); ctx.lineTo(ch.x - 10, y); ctx.closePath(); };
    ctx.fillStyle = '#5B4636'; chute(); ctx.fill();
    ctx.save(); chute(); ctx.clip();
    for (let py = y - ch.size - 34; py < y; py += 9) {
      ctx.fillStyle = '#7A604A'; ctx.fillRect(ch.x - 10, py, 50, 2);
      ctx.fillStyle = '#3A2B20'; ctx.fillRect(ch.x - 10, py + 7, 50, 2);
    }
    ctx.fillStyle = '#2E2219'; ctx.fillRect(ch.x + 34, y - ch.size - 34, 6, ch.size + 34);
    ctx.fillStyle = '#9A7B5E'; ctx.fillRect(ch.x + 6, y - ch.size - 30, 2, ch.size + 30); ctx.fillRect(ch.x + 24, y - ch.size - 30, 2, ch.size + 30);
    ctx.restore();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; chute(); ctx.stroke();
    ctx.fillStyle = '#3F2F24'; ctx.fillRect(ch.x - 12, y - ch.size - 20, 5, ch.size + 20);
    ctx.fillStyle = '#5E4A3A'; ctx.fillRect(ch.x - 12, y - ch.size - 20, 1, ch.size + 20);
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(ch.x - 12.5, y - ch.size - 20.5, 6, ch.size + 21);
    const cap = () => { ctx.beginPath(); ctx.ellipse(ch.x + 18, y - ch.size - 26, 30, 8, -0.25, 0, Math.PI * 2); };
    ctx.fillStyle = '#A9BEDA'; ctx.beginPath(); ctx.ellipse(ch.x + 18, y - ch.size - 24, 30, 8, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC'; cap(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(ch.x + 12, y - ch.size - 29, 16, 3, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3B4E6E'; ctx.lineWidth = 1; cap(); ctx.stroke();
  });
};

const drawSnowballs = (ctx: Ctx, hz: Hazards) => {
  for (const s of hz.snowballs) {
    ctx.save();
    ctx.translate(s.x, s.y);
    pixEllipse(ctx, 0, s.r - 1, s.r * 0.9, 3, 'rgba(15, 23, 42, 0.2)');
    // (lit from the upper left whichever way it's turned; the clumps go round with it so you can see it roll)
    snowDisc(ctx, 0, 0, s.r);
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, s.r - 1, 0, Math.PI * 2); ctx.clip();
    ctx.rotate(s.rot);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3, cx = Math.cos(a) * s.r * 0.55, cy = Math.sin(a) * s.r * 0.55, cr = s.r * 0.14;
      ctx.fillStyle = 'rgba(100, 125, 165, 0.45)'; ctx.beginPath(); ctx.arc(cx + 1, cy + 1, cr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.beginPath(); ctx.arc(cx - 1, cy - 1, cr * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }
};
