// The jungle, drawn: crude first pass (shapes, to get the feel). The sky through the canopy and the trees going back,
// the ground (a lit, mossy lip on everything that can be stood on), the pits, the branches, the signs.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { box, label } from '../section';
import { SECTIONS, GY } from '../geometry';
import { GROUND, BRANCHES, SIGNS, BOA_BRANCHES, X, Y } from './layout';

type Ctx = CanvasRenderingContext2D;

/** Screen space: green gloom, the trunks going back in two rows, the canopy over it all. */
export const drawJungleBackdrop = (c: Ctx, state: GameState) => {
  const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  g.addColorStop(0, '#0E2A17'); g.addColorStop(0.5, '#173D20'); g.addColorStop(1, '#0A1F10');
  c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const cx = state.camera.x - SECTIONS.jungle.x0, cy = state.camera.y;
  // (light coming down through it, in shafts)
  c.fillStyle = 'rgba(190, 242, 100, 0.05)';
  for (let i = 0; i < 4; i++) {
    const x = ((i * 290 - cx * 0.1) % 1160 + 1160) % 1160 - 180;
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 200, CANVAS_HEIGHT); c.lineTo(x + 110, CANVAS_HEIGHT); c.fill();
  }
  // two rows of trunks, the far one fainter
  for (const [k, gap, w, col] of [[0.15, 170, 26, '#123320'], [0.35, 240, 44, '#18402A']] as [number, number, number, string][]) {
    const off = cx * k;
    for (let x = -((off % gap) + gap) % gap - gap; x < CANVAS_WIDTH + gap; x += gap) {
      const n = Math.floor((x + off) / gap);
      const ww = w * (0.8 + ((n * 37) % 5) * 0.1);
      c.fillStyle = col; c.fillRect(x, 0, ww, CANVAS_HEIGHT);
    }
  }
  // the canopy across the top (with the camera, a little)
  const top = Math.max(-80, Math.min(60, -cy * 0.15 - 20));
  c.fillStyle = '#0B2412';
  for (let x = -((cx * 0.5) % 90) - 90; x < CANVAS_WIDTH + 90; x += 45) {
    c.beginPath(); c.ellipse(x, top + 20 + Math.sin(x * 0.07) * 14, 50, 36, 0, 0, Math.PI * 2); c.fill();
  }
  return true;
};

/** World space, behind everything that moves. */
export const drawJungleBack = (c: Ctx, state: GameState) => {
  const v0 = state.camera.x - 100, v1 = state.camera.x + CANVAS_WIDTH + 100, bot = state.camera.y + CANVAS_HEIGHT + 40;
  // Pits: dark, all the way down
  for (let i = 0; i + 1 < GROUND.length; i++) {
    const a = X(GROUND[i][1]), b = X(GROUND[i + 1][0]);
    if (b < v0 || a > v1 || b - a < 2) continue;
    const top = Math.min(Y(GROUND[i][2]), Y(GROUND[i + 1][2]));
    const g = c.createLinearGradient(0, GY - 40, 0, GY + 300);
    g.addColorStop(0, 'rgba(4, 12, 6, 0)'); g.addColorStop(0.3, '#040C06'); g.addColorStop(1, '#000');
    c.fillStyle = g; c.fillRect(a, Math.min(top, GY - 40), b - a, Math.max(bot, GY + 300) - Math.min(top, GY - 40));
  }
  // Ground: earth, roots, a lit mossy lip
  for (const [r0, r1, h] of GROUND) {
    const a = X(r0), b = X(r1), y = Y(h);
    if (b < v0 || a > v1) continue;
    box(c, a, y, b - a, Math.max(bot, y + 40) - y, '#3A2716');
    c.fillStyle = '#2E1F12';
    for (let x = Math.ceil(a / 37) * 37; x < b; x += 37) c.fillRect(x + ((x / 37) % 3) * 4, y + 24 + ((x / 37) % 4) * 18, 18, 5);
    box(c, a, y, b - a, 8, '#3F6212');
    box(c, a, y, b - a, 3, '#A3E635');
    // (a cliff face: the edge of it)
    box(c, a, y, 4, Math.max(bot, y + 40) - y, '#24180D'); box(c, b - 4, y, 4, Math.max(bot, y + 40) - y, '#24180D');
  }
  // Branches out of the trees (the trunk behind them dim; the branch itself lit along the top)
  for (const [r0, r1, h] of BRANCHES) {
    const a = X(r0), b = X(r1), y = Y(h);
    if (b < v0 || a > v1) continue;
    const tx = (a + b) / 2 - 18;
    box(c, tx, y + 12, 36, GY - y - 12, '#22301B');
    box(c, a, y, b - a, 14, '#5B3A1E');
    box(c, a, y + 10, b - a, 4, '#3D2614');
    box(c, a, y, b - a, 3, '#BEF264');
    c.fillStyle = '#2F5A17';
    for (let x = a + 8; x < b; x += 26) { c.beginPath(); c.ellipse(x, y + 16, 10, 5, 0, 0, Math.PI * 2); c.fill(); }
  }
  // The stubs the boas hang off
  for (const s of BOA_BRANCHES) {
    if (s.x < v0 || s.x > v1) continue;
    box(c, s.x - 34, s.y - 6, 52, 8, '#2E1F12');
  }
  // Signs (wood, on posts)
  for (const [rx, h, a, b] of SIGNS) {
    const x = X(rx), y = Y(h);
    if (x < v0 - 100 || x > v1 + 100) continue;
    box(c, x - 4, y - 70, 8, 70, '#4A3420');
    box(c, x - 104, y - 104, 208, 40, '#7C5A35');
    box(c, x - 104, y - 104, 208, 3, '#9C7A50');
    label(c, a, x, y - 88, '#FEF3C7', 8);
    label(c, b, x, y - 74, '#FDE68A', 6);
  }
};
