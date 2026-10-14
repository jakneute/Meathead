// Down under XENOSCARE, drawn (crude first pass): the basement's tunnels (concrete, pipe runs, cable trays, valve
// wheels, ride machinery, the stencils; the animatronic graveyard half way; the stairs up at the left end; the shaft he
// came down) and GALACTIC GROOVE, the space disco (the light-up floor, the mirror ball, the neon, the DJ booth with the
// two operators up in it, the fire extinguisher on the wall). Still things stamped in tiles; the loops live.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { stamp } from '../../../m1/game/render/stamp';
import { ink, limb } from '../../../m1/game/render/npc/kit';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { box, label } from '../section';
import { GY } from '../geometry';
import { drawAlien } from '../crater/aliens';
import { drawCheapGreen } from '../crater/art';
import { BASE_L, BASE_R, STAIRS_X, LAND_X, DOOR_X, DISCO_L, DISCO_R, DJ, BALL, EXTINGUISHER_X, REFILL_X } from './geo';
import { CEIL_B } from './basement';

type Ctx = CanvasRenderingContext2D;
const shown = (state: GameState, a: number, b: number) => b > state.camera.x - 80 && a < state.camera.x + CANVAS_WIDTH + 80;
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
const B = BASE_L;
const GRAVE = { a: B + 2700, b: B + 3750 };

// ---------------------------------------------------------------------------------------------------------------
// The basement

export const drawBasement = (c: Ctx, state: GameState) => {
  const a = Math.max(B - 220, state.camera.x - 40), b = Math.min(DOOR_X + 40, state.camera.x + CANVAS_WIDTH + 40);
  if (b <= a) return;
  for (let tx = Math.floor((a - B) / 400) * 400 + B; tx < b; tx += 400) {
    const i = Math.round((tx - B) / 400);
    stamp(c, `sp-q-base-${i}`, tx, CEIL_B - 240, 400, GY - CEIL_B + 660, g => paintTunnel(g, tx));
  }
  // (the stairs up, the shaft he came down: their own)
  if (shown(state, B - 220, B + 140)) stamp(c, 'sp-q-stairs', B - 220, CEIL_B - 240, 360, GY - CEIL_B + 244, g => {
    g.fillStyle = '#0A0A0F'; g.fillRect(B - 200, CEIL_B - 240, 200, GY - CEIL_B + 240);
    for (let k = 0; k < 9; k++) { g.fillStyle = '#27272A'; g.fillRect(B - 200 + k * 20, GY - k * 34 - 10, 40, 10); g.fillStyle = '#52525B'; g.fillRect(B - 200 + k * 20, GY - k * 34 - 10, 40, 2); }
    ink(g, () => g.roundRect(STAIRS_X - 50, GY - 250, 110, 40, 4), '#14532D', 2);
    g.fillStyle = '#4ADE80'; g.font = '7px "Press Start 2P"'; g.fillText('EXIT ^ THE HOLD', STAIRS_X - 44, GY - 226);
  });
  if (shown(state, LAND_X - 80, LAND_X + 80)) {
    // (the hole up in the ceiling he came down through; the light down it)
    c.fillStyle = 'rgba(167, 139, 250, 0.12)'; c.beginPath(); c.moveTo(LAND_X - 50, CEIL_B); c.lineTo(LAND_X + 50, CEIL_B); c.lineTo(LAND_X + 90, GY); c.lineTo(LAND_X - 90, GY); c.closePath(); c.fill();
    box(c, LAND_X - 56, CEIL_B - 6, 112, 8, '#020204');
  }
  // (the graveyard: heaps of the broken animatronics, the old show's leftovers)
  if (shown(state, GRAVE.a, GRAVE.b)) stamp(c, 'sp-q-grave', GRAVE.a, GY - 260, GRAVE.b - GRAVE.a, 264, g => {
    g.fillStyle = '#FFFFFF'; g.font = '8px "Press Start 2P"'; g.fillText('PROP STORAGE - DO NOT FEED', GRAVE.a + 300, GY - 230);
    for (let i = 0; i < 9; i++) {
      const x = GRAVE.a + 60 + i * 110 + hash(i) * 40, rot = (hash(i + 4) - 0.5) * 2.4;
      g.save(); g.translate(x, GY - 6); g.rotate(rot); g.globalAlpha = 0.75; drawCheapGreen(g, 0, 0, i * 9, 0.7, i % 3 ? 'limp' : 'boo'); g.restore();
    }
    g.globalAlpha = 1;
    // (a cow on its side, a saucer prop with its lights out, a crate of heads)
    ink(g, () => g.ellipse(GRAVE.a + 520, GY - 20, 40, 20, 0, 0, Math.PI * 2), '#D6D3D1');
    g.fillStyle = '#18181B'; g.fillRect(GRAVE.a + 504, GY - 30, 14, 10);
    ink(g, () => g.ellipse(GRAVE.a + 820, GY - 30, 70, 16, -0.2, 0, Math.PI * 2), '#71717A');
    ink(g, () => g.rect(GRAVE.a + 940, GY - 60, 80, 60), '#78350F');
    for (let k = 0; k < 3; k++) { g.fillStyle = '#16A34A'; g.beginPath(); g.ellipse(GRAVE.a + 956 + k * 24, GY - 64, 10, 12, 0, 0, Math.PI * 2); g.fill(); }
  });
};

const paintTunnel = (g: Ctx, tx: number) => {
  for (let x = tx; x < tx + 400; x += 8) {
    const col = x - B;
    // (concrete block, in courses; damp stains; the floor, wet)
    g.fillStyle = Math.floor(col / 64) % 2 ? '#1C1C22' : '#202027'; g.fillRect(x, CEIL_B, 8, GY - CEIL_B);
    for (let y = CEIL_B + 20; y < GY; y += 32) { g.fillStyle = '#141419'; g.fillRect(x, y, 8, 2); }
    if (hash(Math.floor(col / 96)) < 0.4) { g.fillStyle = 'rgba(30, 58, 40, 0.35)'; g.fillRect(x, CEIL_B + 40, 8, 60 + hash(col) * 40); }
    g.fillStyle = '#0B0B0F'; g.fillRect(x, CEIL_B - 240, 8, 240);
    g.fillStyle = '#121216'; g.fillRect(x, GY, 8, 420); g.fillStyle = '#3A3A44'; g.fillRect(x, GY, 8, 2);
    // (the pipe runs along the wall: a fat one, two thin ones, a cable tray)
    g.fillStyle = '#2A2A33'; g.fillRect(x, CEIL_B + 24, 8, 22); g.fillStyle = '#3F3F4C'; g.fillRect(x, CEIL_B + 24, 8, 3);
    g.fillStyle = '#3B2A1E'; g.fillRect(x, CEIL_B + 58, 8, 8);
    g.fillStyle = '#26323B'; g.fillRect(x, GY - 120, 8, 6);
    g.fillStyle = '#18181D'; g.fillRect(x, CEIL_B + 80, 8, 4);
  }
  // (every so often: a valve wheel, a ride motor, a stencil, a puddle)
  for (let k = Math.ceil((tx - B) / 260); k * 260 + B < tx + 400; k++) {
    const x = B + k * 260 + 40;
    if (x < tx - 40) continue;
    const kind = k % 4;
    if (kind === 0) { g.strokeStyle = '#7F1D1D'; g.lineWidth = 3; g.beginPath(); g.arc(x, CEIL_B + 35, 10, 0, Math.PI * 2); g.stroke(); }
    if (kind === 1) { ink(g, () => g.rect(x - 30, GY - 80, 60, 80), '#27272A', 2); g.strokeStyle = '#3F3F46'; g.lineWidth = 4; g.beginPath(); g.arc(x, GY - 40, 20, 0, Math.PI * 2); g.stroke(); }
    if (kind === 2) { g.fillStyle = '#A16207'; g.font = '7px "Press Start 2P"'; g.fillText(['CAST MEMBERS ONLY', 'B-LEVEL', 'NO RUNNING', 'XENOSCARE MAINT'][k % 4 === 2 ? Math.floor(k / 4) % 4 : 0], x - 50, GY - 200); }
    if (kind === 3) { g.fillStyle = 'rgba(100, 116, 139, 0.25)'; g.beginPath(); g.ellipse(x, GY + 2, 40, 3, 0, 0, Math.PI * 2); g.fill(); }
  }
  // (the vents in the ceiling: grates)
  for (let k = Math.ceil((tx - B) / 340); k * 340 + B < tx + 400; k++) { const x = B + k * 340 + 100; g.fillStyle = '#050507'; g.fillRect(x - 30, CEIL_B - 4, 60, 8); for (let s = 0; s < 6; s++) { g.fillStyle = '#2A2A33'; g.fillRect(x - 28 + s * 10, CEIL_B - 4, 3, 8); } }
};

// ---------------------------------------------------------------------------------------------------------------
// The space disco: GALACTIC GROOVE

export const drawDisco = (c: Ctx, state: GameState, o: { lights: number; operators: boolean; splat: boolean; extinguisher: boolean }) => {
  if (!shown(state, DISCO_L - 60, DISCO_R + 60)) return;
  const f = state.frame;
  stamp(c, 'sp-q-disco', DISCO_L - 40, GY - 600, DISCO_R - DISCO_L + 80, 604, g => {
    g.fillStyle = '#12051F'; g.fillRect(DISCO_L - 40, GY - 600, DISCO_R - DISCO_L + 80, 600);
    for (let i = 0; i < 120; i++) { g.fillStyle = i % 4 ? '#7C3AED' : '#F0ABFC'; g.fillRect(DISCO_L + hash(i) * 800, GY - 590 + hash(i + 9) * 440, 2, 2); }
    // (chrome pillars, the bar, the stools)
    for (const px of [DISCO_L + 10, DISCO_R - 40]) { g.fillStyle = '#A1A1AA'; g.fillRect(px, GY - 600, 30, 600); g.fillStyle = '#E4E4E7'; g.fillRect(px + 4, GY - 600, 6, 600); }
    ink(g, () => g.roundRect(DISCO_R - 260, GY - 90, 200, 90, 6), '#4C1D95', 2);
    g.fillStyle = '#F0ABFC'; g.fillRect(DISCO_R - 260, GY - 90, 200, 4);
    // (the DJ booth up on its platform: the decks, the glass; the sign)
    ink(g, () => g.rect(DJ.x - 10, DJ.y - 10, DJ.w + 20, DJ.h + 60), '#3B0764', 2);
    g.fillStyle = '#0A0510'; g.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
    g.fillStyle = '#F0ABFC'; g.font = '6px "Press Start 2P"'; g.fillText('DJ ZORP', DJ.x + 70, DJ.y + DJ.h + 20);
    limb(g, DJ.x + DJ.w / 2, DJ.y + DJ.h + 50, DJ.x + DJ.w / 2, GY, 10, '#52525B');
    // (the extinguisher's cabinet on the wall: IN CASE OF FIRE)
    ink(g, () => g.rect(EXTINGUISHER_X - 20, GY - 150, 40, 70), '#7F1D1D', 2);
    g.fillStyle = '#FECACA'; g.font = '5px "Press Start 2P"'; g.fillText('IN CASE', EXTINGUISHER_X - 18, GY - 158); g.fillText('OF FIRE', EXTINGUISHER_X - 18, GY - 166);
    // (the refill's little alcove by the door: a first-aid cabinet)
    ink(g, () => g.rect(REFILL_X - 40, GY - 150, 80, 150), '#1E1B4B', 2);
    g.fillStyle = '#F5F5F4'; g.fillRect(REFILL_X - 14, GY - 130, 28, 28); g.fillStyle = '#DC2626'; g.fillRect(REFILL_X - 3, GY - 126, 6, 20); g.fillRect(REFILL_X - 10, GY - 119, 20, 6);
  });
  // The neon: GALACTIC GROOVE, the letters chasing
  const word = 'GALACTIC GROOVE', on = o.lights > 0.5;
  c.font = '18px "Press Start 2P"'; c.textAlign = 'left';
  const w = c.measureText(word).width, sx = (DISCO_L + DISCO_R) / 2 - w / 2 + 40, sy = GY - 440;
  for (let i = 0; i < word.length; i++) {
    const x = sx + c.measureText(word.slice(0, i)).width;
    c.fillStyle = '#000'; c.fillText(word[i], x + 2, sy + 2);
    c.fillStyle = on ? ((i + Math.floor(f / 5)) % 4 === 0 ? '#FDE047' : i < 9 ? '#F472B6' : '#22D3EE') : '#3F3F46'; c.fillText(word[i], x, sy);
  }
  // The floor: light-up tiles, cycling (dark till the lights come up)
  const cols = ['#EC4899', '#8B5CF6', '#22D3EE', '#FDE047', '#22C55E'];
  for (let i = 0; i < 20; i++) {
    const x = DISCO_L + 40 + i * 36, k = (i + Math.floor(f / 12)) % 5, lit = on && (i * 7 + Math.floor(f / 12)) % 3 !== 0;
    box(c, x, GY - 2, 34, 4, lit ? cols[k] : '#27272A');
  }
  // The mirror ball, turning, the sparkles thrown about
  const bx = BALL.x, by = BALL.y;
  limb(c, bx, GY - 600, bx, by - 24, 2, '#A1A1AA');
  ink(c, () => c.arc(bx, by, 24, 0, Math.PI * 2), '#CBD5E1', 1.5);
  for (let r = -2; r <= 2; r++) for (let q = -3; q <= 3; q++) { const px = bx + q * 6 + ((f / 4) % 6), py = by + r * 7; if (Math.hypot(px - bx, py - by) < 21) box(c, px - 2, py - 2, 4, 4, (q + r + Math.floor(f / 4)) % 3 ? '#F1F5F9' : '#94A3B8'); }
  if (on) for (let i = 0; i < 14; i++) { const a = f * 0.02 + i * 0.45, d = 120 + (i % 5) * 70; box(c, bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.6 + 120, 3, 3, i % 3 ? '#F8FAFC' : '#F0ABFC'); }
  // The DJ booth: the two of them in there (headsets on, working her), or what's left of them
  c.save(); c.beginPath(); c.rect(DJ.x, DJ.y, DJ.w, DJ.h); c.clip();
  c.fillStyle = 'rgba(74, 222, 128, 0.18)'; c.fillRect(DJ.x, DJ.y, DJ.w, DJ.h);
  if (o.operators) for (let i = 0; i < 2; i++) { c.save(); c.translate(DJ.x + 50 + i * 100, DJ.y + DJ.h + 50); drawAlien(c, { seed: 201 + i * 7, headset: true, woman: i === 1 }, 'operate', f + i * 9, 0.85); c.restore(); }
  else for (let i = 0; i < 2; i++) { const x = DJ.x + 50 + i * 100; ink(c, () => c.roundRect(x - 20, DJ.y + DJ.h - 30, 46, 36, 6), ALIEN.hide[5]); box(c, x - 14, DJ.y + DJ.h - 36, 30, 8, ALIEN.gum); }
  box(c, DJ.x, DJ.y + DJ.h - 12, DJ.w, 12, '#3F3F46');
  for (let i = 0; i < 2; i++) { c.strokeStyle = '#18181B'; c.lineWidth = 2; c.beginPath(); c.arc(DJ.x + 60 + i * 80, DJ.y + DJ.h - 6, 8, f * 0.2, f * 0.2 + 5); c.stroke(); }
  c.restore();
  if (o.splat) for (const sx2 of [DJ.x + 50, DJ.x + 150]) { c.fillStyle = ALIEN.slimeDark; c.beginPath(); c.ellipse(sx2, DJ.y + 30, 24, 16, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = ALIEN.slime; c.beginPath(); c.ellipse(sx2 - 2, DJ.y + 28, 16, 10, 0, 0, Math.PI * 2); c.fill(); for (let i = 0; i < 3; i++) box(c, sx2 - 12 + i * 10, DJ.y + 40, 3, 12 + i * 6, ALIEN.slimeDark); }
  void label; void BASE_R;
};

/** The hall's light: dark till they come up; colored spots sweeping, the ball's glow. */
export const discoLighting = (state: GameState, lights: number): SceneLight => {
  const f = state.frame, ls: Light[] = [];
  const cols = ['rgba(236, 72, 153, 0.14)', 'rgba(34, 211, 238, 0.14)', 'rgba(253, 224, 71, 0.12)', 'rgba(139, 92, 246, 0.14)'];
  for (let i = 0; i < 4; i++) ls.push({ x: DISCO_L + 120 + ((i * 200 + f * 2) % 640), y: GY - 60, r: 150, a: 0.8 * lights, color: cols[i] });
  ls.push({ x: BALL.x, y: BALL.y, r: 120, a: 0.7 * lights });
  ls.push({ x: DJ.x + DJ.w / 2, y: DJ.y + DJ.h / 2, r: 150, a: 0.7, color: 'rgba(74, 222, 128, 0.1)' });
  ls.push({ x: DOOR_X, y: GY - 100, r: 160, a: 0.6 });
  ls.push({ x: state.player.pos.x + 20, y: state.player.pos.y + 30, r: 130, a: 0.5 });
  return { dark: 0.75 - 0.4 * lights, shade: [16, 4, 30], lights: ls, rim: 0.5 };
};
