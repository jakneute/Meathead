// The tram: cable, pylons, the two stations and the cabin itself (a red and
// cream alpine gondola, seen in cutaway so you can fight inside it).

import type { GameState } from '../../state';
import { COURSE } from './course';
import { Tram, CABIN_W, CABIN_H, BACK_WINDOWS, RIDE, WARN_FRAMES, cabinEnemies, incomingWave, entryPoint } from './tram';
import type { EnemyKind } from '../../../types';
import { floorY } from './draw';
import { CANVAS_WIDTH } from '../../../constants';

type Ctx = CanvasRenderingContext2D;

const HANGER = 70;
const RED = '#B91C1C', RED_DARK = '#7F1D1D', CREAM = '#FEF3C7', STEEL = '#64748B', STEEL_DARK = '#334155';

/** Where the cable is at x (a straight line through the hanger's attach point at both ends of the ride). */
const cableAt = (x: number) => {
  const x0 = COURSE.tram.x + CABIN_W / 2, y0 = COURSE.tram.y - CABIN_H - HANGER;
  const x1 = COURSE.tram.toX + CABIN_W / 2, y1 = COURSE.tram.toY - CABIN_H - HANGER;
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
};

const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 100 && x1 < state.camera.x + 900;

/** Furthest back: the pylons and the cable (the clouds go in front of their feet). */
export const drawTramRigging = (ctx: Ctx, state: GameState) => {
  const cx0 = COURSE.tram.x - 120, cx1 = COURSE.tram.toX + CABIN_W + 120;
  if (!visible(state, cx0, cx1)) return;
  // Pylons: lattice towers up from the mountainside to the cable
  for (const u of [0.3, 0.64]) {
    const px = COURSE.tram.x + CABIN_W / 2 + (COURSE.tram.toX - COURSE.tram.x) * u;
    if (!visible(state, px - 60, px + 60)) continue;
    const top = cableAt(px) + 6, base = floorY(state, px);
    ctx.strokeStyle = STEEL_DARK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(px - 26, base); ctx.lineTo(px - 8, top + 20); ctx.moveTo(px + 26, base); ctx.lineTo(px + 8, top + 20); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = STEEL;
    for (let y = top + 30; y < base - 10; y += 40) {
      const k = (y - top) / (base - top);
      const w = 8 + 18 * k;
      ctx.beginPath(); ctx.moveTo(px - w, y); ctx.lineTo(px + w, y + 40); ctx.moveTo(px + w, y); ctx.lineTo(px - w, y + 40); ctx.stroke();
    }
    // Crossarm and sheave wheels the cable rides over
    ctx.fillStyle = STEEL_DARK; ctx.fillRect(px - 34, top + 14, 68, 7);
    ctx.fillStyle = '#1F2937';
    for (const o of [-18, 18]) { ctx.beginPath(); ctx.arc(px + o, top + 8, 7, 0, Math.PI * 2); ctx.fill(); }
  }
  // The cable (a pair: track rope and haul rope)
  ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx0, cableAt(cx0)); ctx.lineTo(cx1, cableAt(cx1)); ctx.stroke();
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx0, cableAt(cx0) + 8); ctx.lineTo(cx1, cableAt(cx1) + 8); ctx.stroke();
};

/** Behind the action: the stations, and the inside of the cabin. */
export const drawTramBack = (ctx: Ctx, state: GameState, tram: Tram) => {
  if (!visible(state, COURSE.tram.x - 120, COURSE.tram.toX + CABIN_W + 120)) return;
  drawStation(ctx, state, COURSE.tram.x, COURSE.tram.y, -1);
  drawStation(ctx, state, COURSE.tram.toX, COURSE.tram.toY, 1);
  drawCabinInside(ctx, state, tram);
};

/** A station: a timber shed over the deck with the bullwheel at the far end. dir -1 = bottom (wheel on the left). */
const drawStation = (ctx: Ctx, state: GameState, x: number, y: number, dir: number) => {
  const x1 = x - 150, x2 = x + CABIN_W + 150;
  if (!visible(state, x1, x2)) return;
  const roofY = y - CABIN_H - HANGER - 70;
  // Back wall planks
  ctx.fillStyle = '#3F2A1D';
  ctx.fillRect(x1, roofY + 20, x2 - x1, y - roofY - 20);
  ctx.fillStyle = '#4E3524';
  for (let px = x1; px < x2; px += 18) ctx.fillRect(px, roofY + 20, 2, y - roofY - 20);
  // Posts and a snowy roof
  ctx.fillStyle = '#2B1D14';
  for (const px of [x1 + 6, x1 + (x2 - x1) / 2, x2 - 16]) ctx.fillRect(px, roofY + 18, 10, y - roofY - 18);
  ctx.fillStyle = '#5B3A26'; ctx.fillRect(x1 - 20, roofY, x2 - x1 + 40, 22);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x1 - 24, roofY - 8, x2 - x1 + 48, 10);
  // The bullwheel the cable turns around
  const wx = dir < 0 ? x1 + 40 : x2 - 40, wy = cableAt(wx) + 4;
  ctx.strokeStyle = '#1F2937'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(wx, wy, 26, 0, Math.PI * 2); ctx.stroke();
  const spin = state.frame * 0.05;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { const a = spin + (i * Math.PI) / 2; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * 24, wy + Math.sin(a) * 24); ctx.stroke(); }
  // Sign
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x + CABIN_W / 2 - 70, roofY + 28, 140, 20);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText(dir < 0 ? 'LOWER STATION' : 'SUMMIT', x + CABIN_W / 2, roofY + 43);
  ctx.textAlign = 'left';
};

/** The back wall of the cabin: panels around big windows you can see the mountains through. */
const drawCabinInside = (ctx: Ctx, state: GameState, tram: Tram) => {
  const { x, y } = tram;
  if (!visible(state, x, x + CABIN_W)) return;
  const top = y - CABIN_H;
  const winTop = top + 36, winH = 96, winW = 128;
  ctx.fillStyle = '#5F1414';
  // Panels, leaving the windows open
  ctx.fillRect(x, top, CABIN_W, winTop - top);
  ctx.fillRect(x, winTop + winH, CABIN_W, y - winTop - winH);
  let px = x;
  for (const wx of BACK_WINDOWS) { ctx.fillRect(px, winTop, x + wx - winW / 2 - px, winH); px = x + wx + winW / 2; }
  ctx.fillRect(px, winTop, x + CABIN_W - px, winH);
  // Cream stripe, bench, grab rail
  ctx.fillStyle = CREAM; ctx.fillRect(x, winTop + winH + 8, CABIN_W, 6);
  ctx.fillStyle = '#3F1010'; ctx.fillRect(x + 20, y - 34, CABIN_W - 40, 12);
  ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 20, top + 20, CABIN_W - 40, 3);
  for (let hx = x + 60; hx < x + CABIN_W - 40; hx += 70) { ctx.fillRect(hx, top + 20, 2, 14); ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx + 1, top + 38, 5, 0, Math.PI * 2); ctx.stroke(); }
  // Windows: glass with a sheen, or smashed through (with whatever's about to come through it looming outside)
  const incoming = incomingWave(tram);
  BACK_WINDOWS.forEach((wx, i) => {
    const l = x + wx - winW / 2;
    const coming = incoming?.spawns.find(([, entry]) => entry === `back${i}`);
    if (coming) {
      ctx.save();
      ctx.beginPath(); ctx.rect(l, winTop, winW, winH); ctx.clip();
      drawSilhouette(ctx, state, coming[0], x + wx, winTop + winH - 6, 1 - incoming!.left / WARN_FRAMES);
      ctx.restore();
    }
    if (tram.broken[i]) {
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
      // Jagged shards left in the frame
      for (const [sx, sy, dir] of [[l, winTop, 1], [l + winW, winTop, -1], [l, winTop + winH, 1], [l + winW, winTop + winH, -1]] as [number, number, number][]) {
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dir * 26, sy); ctx.lineTo(sx + dir * 6, sy + (sy === winTop ? 22 : -18)); ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.16)'; ctx.fillRect(l, winTop, winW, winH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.beginPath(); ctx.moveTo(l + 14, winTop); ctx.lineTo(l + 40, winTop); ctx.lineTo(l + 12, winTop + winH); ctx.lineTo(l - 2, winTop + winH); ctx.fill();
      if (coming) drawCracks(ctx, x + wx, winTop + winH / 2, 1 - incoming!.left / WARN_FRAMES, 60);
    }
    ctx.strokeStyle = '#2B0A0A'; ctx.lineWidth = 4; ctx.strokeRect(l, winTop, winW, winH);
  });
};

/** In front: roof shell, underside, doors, the hanger arm and the carriage riding the cable. */
export const drawTramFront = (ctx: Ctx, state: GameState, tram: Tram) => {
  const { x, y } = tram;
  if (!visible(state, x - 40, x + CABIN_W + 40)) return;
  const top = y - CABIN_H;
  // Hanger arm up to the carriage on the cable
  const hx = x + CABIN_W / 2, cy = top - HANGER;
  ctx.strokeStyle = STEEL_DARK; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(hx, top); ctx.lineTo(hx, cy + 10); ctx.stroke();
  ctx.fillStyle = STEEL_DARK; ctx.fillRect(hx - 40, cy - 2, 80, 14);
  ctx.fillStyle = '#111827';
  for (const o of [-26, 0, 26]) { ctx.beginPath(); ctx.arc(hx + o, cy, 7, 0, Math.PI * 2); ctx.fill(); }
  // Roof shell
  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.moveTo(x - 6, top + 14); ctx.quadraticCurveTo(x + CABIN_W / 2, top - 30, x + CABIN_W + 6, top + 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = RED_DARK; ctx.fillRect(x - 6, top + 8, CABIN_W + 12, 8);
  ctx.fillStyle = '#F8FAFC'; // snow on the roof
  ctx.beginPath(); ctx.moveTo(x + 40, top - 6); ctx.quadraticCurveTo(x + CABIN_W / 2, top - 32, x + CABIN_W - 40, top - 6); ctx.quadraticCurveTo(x + CABIN_W / 2, top - 20, x + 40, top - 6); ctx.fill();
  // Roof hatch swinging open
  if (tram.hatch > 0) {
    ctx.fillStyle = '#111827'; ctx.fillRect(hx - 30, top + 2, 60, 12);
    ctx.fillStyle = RED_DARK; ctx.fillRect(hx - 30, top - 26, 8, 28);
  }
  // Underside skirt
  ctx.fillStyle = RED_DARK;
  ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + CABIN_W + 4, y); ctx.lineTo(x + CABIN_W - 20, y + 22); ctx.lineTo(x + 20, y + 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = CREAM; ctx.fillRect(x + 10, y + 2, CABIN_W - 20, 4);
  // Doors at each end, each with a window (smashed if something came through it)
  const door = (dx: number, block: typeof tram.blocks.left, broken: boolean) => {
    const closed = state.blocks.includes(block);
    ctx.fillStyle = RED;
    if (closed) ctx.fillRect(dx, top + 14, 14, CABIN_H - 14);
    else { ctx.globalAlpha = 0.5; ctx.fillRect(dx, top + 14, 5, CABIN_H - 14); ctx.globalAlpha = 1; }
    if (!closed) return;
    ctx.fillStyle = broken ? 'rgba(15, 23, 42, 0.8)' : 'rgba(186, 230, 253, 0.6)';
    ctx.fillRect(dx + 3, top + 50, 8, 70);
    ctx.fillStyle = CREAM; ctx.fillRect(dx, top + 140, 14, 4);
  };
  door(x, tram.blocks.left, tram.doorBroken[0]);
  door(x + CABIN_W - 14, tram.blocks.right, tram.doorBroken[1]);
  drawIncoming(ctx, state, tram);
};

/** Telegraphs the next wave: shapes at the doors and on the roof, cracking glass, a rattling hatch, and a warning over every way in. */
const drawIncoming = (ctx: Ctx, state: GameState, tram: Tram) => {
  const incoming = incomingWave(tram);
  if (!incoming) return;
  const k = 1 - incoming.left / WARN_FRAMES;
  const top = tram.y - CABIN_H;
  for (const [kind, entry] of incoming.spawns) {
    const at = entryPoint(tram, entry);
    if (entry === 'left' || entry === 'right') {
      // Hanging off the outside of the door, clawing at its window
      const dir = entry === 'left' ? -1 : 1;
      drawSilhouette(ctx, state, kind, at.x + dir * 34, tram.y - 40, k);
      drawCracks(ctx, at.x, top + 85, k, 30);
    } else if (entry === 'roof') {
      // Up on the roof: the hatch rattles
      drawSilhouette(ctx, state, kind, at.x + 60, top - 14, k);
      const rattle = Math.floor(state.frame / 3) % 2 ? -3 : 0;
      ctx.fillStyle = RED_DARK; ctx.fillRect(at.x - 30, top + 2 + rattle, 60, 6);
    }
    // A blinking warning over the way in
    if (Math.floor(state.frame / 6) % 2 === 0) drawWarning(ctx, at.x, entry === 'roof' ? top - 60 : entry.startsWith('back') ? top + 18 : top - 22);
  }
};

/** A dark shape of what's coming, looming larger as it gets closer (k 0..1). Feet at (x, y). */
const drawSilhouette = (ctx: Ctx, state: GameState, kind: EnemyKind, x: number, y: number, k: number) => {
  const s = 0.6 + 0.4 * k;
  const bob = Math.sin(state.frame * 0.4) * 2 * k;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(s, s);
  ctx.fillStyle = `rgba(8, 12, 24, ${0.45 + 0.45 * k})`;
  ctx.beginPath();
  if (kind === 'eagle') {
    // Wings spread, beating at the glass
    const flap = Math.sin(state.frame * 0.5) * 14;
    ctx.moveTo(0, -40); ctx.lineTo(-44, -60 + flap); ctx.lineTo(-16, -34); ctx.lineTo(0, -22); ctx.lineTo(16, -34); ctx.lineTo(44, -60 + flap); ctx.closePath();
  } else if (kind === 'wolverine') {
    ctx.ellipse(0, -16, 26, 15, 0, 0, Math.PI * 2);
    ctx.moveTo(24, -24); ctx.arc(22, -24, 9, 0, Math.PI * 2);
  } else if (kind === 'goat') {
    ctx.ellipse(0, -30, 26, 18, 0, 0, Math.PI * 2);
    ctx.moveTo(30, -46); ctx.arc(26, -46, 10, 0, Math.PI * 2);
    ctx.rect(-20, -16, 6, 16); ctx.rect(14, -16, 6, 16);
  } else {
    // A goon, fists raised to pound on it
    ctx.ellipse(0, -36, 18, 28, 0, 0, Math.PI * 2);
    ctx.moveTo(12, -74); ctx.arc(0, -74, 12, 0, Math.PI * 2);
    ctx.rect(-26, -84 + bob * 2, 9, 30); ctx.rect(17, -84 - bob * 2, 9, 30);
  }
  ctx.fill();
  // Rim-lit against the night, eyes glowing
  ctx.strokeStyle = `rgba(224, 242, 254, ${0.3 + 0.4 * k})`; ctx.lineWidth = 2; ctx.stroke();
  const eyes = kind === 'eagle' ? [0, -34] : kind === 'wolverine' ? [24, -26] : kind === 'goat' ? [28, -48] : [0, -76];
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(eyes[0] - 5, eyes[1] - 1, 3, 3); ctx.fillRect(eyes[0] + 2, eyes[1] - 1, 3, 3);
  ctx.restore();
};

/** Cracks spreading out across glass from (x, y) as it takes blows (k 0..1). */
const drawCracks = (ctx: Ctx, x: number, y: number, k: number, r: number) => {
  const n = Math.floor(k * 7);
  if (!n) return;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = i * 2.4, len = r * (0.4 + 0.6 * k);
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len * 0.5 + 4, y + Math.sin(a) * len * 0.5 - 3);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
  }
  ctx.stroke();
};

/** A red warning triangle with a "!". */
const drawWarning = (ctx: Ctx, x: number, y: number) => {
  ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 14, y + 11); ctx.lineTo(x - 14, y + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText('!', x + 1, y + 9);
  ctx.textAlign = 'left';
};

/** The ride's HUD: progress up the mountain, and what to do. */
export const drawTramHud = (ctx: Ctx, state: GameState, tram: Tram) => {
  if (tram.phase !== 'riding' && tram.phase !== 'arrived' && tram.phase !== 'closing') return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px "Press Start 2P"';
  const u = tram.phase === 'riding' ? Math.min(1, tram.t / RIDE) : tram.phase === 'arrived' ? 1 : 0;
  // Progress bar up the mountain (top right, clear of the player's HUD in the top left)
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(CANVAS_WIDTH - 250, 14, 236, 26);
  ctx.fillStyle = '#1E293B'; ctx.fillRect(CANVAS_WIDTH - 242, 30, 220, 6);
  ctx.fillStyle = '#EF4444'; ctx.fillRect(CANVAS_WIDTH - 242, 30, 220 * u, 6);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('SUMMIT TRAM', CANVAS_WIDTH - 132, 26);
  const left = cabinEnemies(state, tram).length;
  let msg = '';
  if (tram.phase === 'closing' || (tram.phase === 'riding' && tram.t < 150)) msg = 'KILL EVERYTHING THAT GETS IN';
  else if (tram.phase === 'arrived' && left > 0) msg = `CLEAR THE CABIN: ${left} LEFT`;
  // The order, in a band across the screen below the player's HUD
  if (msg && Math.floor(state.frame / 20) % 4 !== 0) {
    const y = 150;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, y - 22, CANVAS_WIDTH, 32);
    ctx.font = 'bold 14px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText(msg, CANVAS_WIDTH / 2 + 2, y + 2);
    ctx.fillStyle = '#FACC15'; ctx.fillText(msg, CANVAS_WIDTH / 2, y);
  }
  ctx.restore();
};
