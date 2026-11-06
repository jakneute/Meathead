// THE GANGWAYS: Fairy Land's enchanted staircases (fantasy/stairs.ts: the clock, the TELL, the swing, how he's carried
// and stood on them), harder, in steel: four grated flights each pivoting off a pillar's top over the chemical sludge,
// docking up to the next pillar or swung down over the sludge, every other one out of step (the mine shaft's chain,
// quicker). The tell's the staircases' own (a creak, the stringer lit), here an amber strobe on each flight's end.
// No handrail (it's on backorder: the sign).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import { makeStairs, updateStairs, endAt, type Stair } from '../../fantasy/stairs';
import { STAIRS3, GANG_ROOM, GRID, ROWS, CELL, Y0, isRock } from './geo';
import { vis, INK } from './art';

type Ctx = CanvasRenderingContext2D;
export interface Gangways { list: Stair[] }
export const makeGangways = (state: GameState): Gangways => ({ list: makeStairs(state, STAIRS3.map(d => ({ ...d, stone: '#5A5E62', lip: '#E8D86A' }))) });
export const updateGangways = (ctx: FrameContext, g: Gangways) => updateStairs(ctx, g.list);

const STEEL = ['#1E2124', '#34383C', '#4C5156', '#6A7076', '#8E959C'];
/** The rock in the room (the pillars, the ledges): the flights go behind it as they swing (clipped out of it). */
const ROCK = (() => {
  const out: [number, number, number, number][] = [];
  const c0 = Math.floor(GANG_ROOM.a / CELL) - 1, c1 = Math.ceil(GANG_ROOM.b / CELL) + 1;
  for (let r = 0; r < ROWS; r++) for (let c = c0; c <= c1; c++) if (isRock(GRID[r][c])) out.push([c * CELL, Y0 + r * CELL, CELL, CELL]);
  return out;
})();
export const drawGangways = (c: Ctx, state: GameState, g: Gangways) => {
  const f = state.frame;
  if (!vis(state, GANG_ROOM.a - 300, GANG_ROOM.b + 300)) return;
  c.save(); c.beginPath(); c.rect(GANG_ROOM.a - 400, Y0 - 100, GANG_ROOM.b - GANG_ROOM.a + 800, ROWS * CELL + 200);
  for (const [x, y, w, h] of ROCK) c.rect(x, y, w, h);
  c.clip('evenodd');
  for (const s of g.list) {
    const d = s.d, e = endAt(d, s.ang);
    if (!vis(state, Math.min(d.px, e.x) - 40, Math.max(d.px, e.x) + 40)) continue;
    const dx = Math.cos(s.ang), dy = Math.sin(s.ang);
    const at = (u: number, down = 0) => ({ x: d.px + dx * u, y: d.py + dy * u + down });
    const band = (o0: number, o1: number, col: string) => { const a = at(0, o0), b = at(d.len, o0), b2 = at(d.len, o1), a2 = at(0, o1); c.fillStyle = col; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(b2.x, b2.y); c.lineTo(a2.x, a2.y); c.closePath(); c.fill(); };
    // (the stringer: a steel channel under the treads, rust along its bottom)
    band(-1, 16, INK); band(1, 14, STEEL[2]); band(1, 4, STEEL[3]); band(10, 14, STEEL[1]); band(12, 14, '#5A3A20');
    // (the treads: level whatever the angle, grated, each lit along its top (stood on))
    const n = Math.floor(d.len / 18);
    for (let k = 0; k < n; k++) {
      const q = at(k * 18 + 6), x = Math.round(q.x - 9), y = Math.round(q.y - 3);
      c.fillStyle = INK; c.fillRect(x - 1, y - 1, 20, 6);
      c.fillStyle = STEEL[3]; c.fillRect(x, y, 18, 4);
      c.fillStyle = s.tell > 0 && (Math.floor(f / 5) + k) % 3 === 0 ? '#FDE047' : '#E8D86A'; c.fillRect(x, y, 18, 1);
      c.fillStyle = STEEL[1]; for (let gx = 2; gx < 18; gx += 4) c.fillRect(x + gx, y + 2, 2, 2);
    }
    // (the pivot: a bolted hub; the free end's strobe: amber, flashing in the tell)
    c.fillStyle = INK; c.beginPath(); c.arc(d.px, d.py + 6, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = STEEL[3]; c.beginPath(); c.arc(d.px, d.py + 6, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = STEEL[4]; c.fillRect(d.px - 2, d.py + 4, 4, 4);
    const lit = s.tell > 0 ? Math.floor(f / 5) % 2 === 0 : s.moving;
    c.fillStyle = INK; c.fillRect(e.x - 6, e.y + 2, 12, 10);
    c.fillStyle = lit ? '#F59E0B' : '#78350F'; c.fillRect(e.x - 4, e.y + 4, 8, 6);
    if (lit) { c.globalAlpha = 0.3; c.fillStyle = '#FBBF24'; c.beginPath(); c.arc(e.x, e.y + 7, 18, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
  }
  c.restore();
};
