// The outdoors' paint kit (the boulevard's and the backlot's): the crude first pass, boxes and the park's letters, but
// every thing readable as what it is. World space; the play plane's ground line is GY, the back of the sidewalk (where
// the facades stand) BACK px up it: the pavement between them goes back toward the eye's horizon.
//
// Standable reads standable: the things he can stand on get a lit top lip (ledgeLip); the facades' cornices and
// painted balconies behind are drawn dimmer and with no lip (they're scenery).

import type { GameState } from '../../../m1/game/core/state';
import { box } from '../section';
import { GY } from '../geometry';
import { signText, signW, enamel, print, gate, type Look } from '../../hub/letters';
import { drawPerson, type Pose } from '../../adventure/temple/people';
import { steveFlier } from '../section';

type Ctx = CanvasRenderingContext2D;

/** How far up the screen the back of the sidewalk is (where the facades stand). */
export const BACK = 36;
export const BACK_Y = GY - BACK;

export const inView = (state: GameState, a: number, b: number) => b > state.camera.x - 160 && a < state.camera.x + 960;

/** Its letters: the park's alphabet (signLetters.ts), never the stock font. */
export const words = (c: Ctx, text: string, x: number, y: number, L: Look, align: 'center' | 'left' | 'right' = 'center') => signText(c, text, x, y, L, align);
export { signW, enamel, print, gate };
export const brass = (size: number) => enamel(size, '#FBBF24', '#78350F');
export const marquee = (sx: number, sy: number, col: string, lit = true): Look => ({ sx, sy, fill: col, bulbs: { lit, col: '#FEF3C7', dim: '#78716C' }, gap: 1 });

/** A ledge he can stand on: its body, and the lit lip along its top (standable reads standable). */
export const ledgeLip = (c: Ctx, x: number, y: number, w: number, body: string, lip = '#FDE68A', h = 14) => {
  box(c, x, y, w, h, '#000'); box(c, x + 1, y + 1, w - 2, h - 2, body); box(c, x, y, w, 3, lip);
};

/** The pavement: the sidewalk going back from the curb (GY) to the facades (BACK_Y), banded, its slabs' joints going
 *  back toward the eye; the curb's lit edge; the street's asphalt in under it. */
export const sidewalk = (c: Ctx, state: GameState, x0: number, x1: number, slab = '#A8A29E', joint = '#78716C') => {
  const a = Math.max(x0, state.camera.x - 40), b = Math.min(x1, state.camera.x + 840);
  if (b <= a) return;
  box(c, a, BACK_Y, b - a, BACK, slab);
  box(c, a, BACK_Y, b - a, 4, joint);
  box(c, a, BACK_Y + 14, b - a, 1, joint);
  // (the joints: slanted back toward the middle of the screen, the one eye)
  const eye = state.camera.x + 400;
  c.strokeStyle = joint; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(a / 80) * 80; x < b; x += 80) { c.moveTo(x, GY); c.lineTo(x + (eye - x) * 0.12, BACK_Y); }
  c.stroke();
  // (the curb: the lit lip, the street below)
  box(c, a, GY, b - a, 400, '#3F3F46');
  box(c, a, GY, b - a, 4, '#E7E5E4');
  box(c, a, GY + 4, b - a, 6, '#A8A29E');
};

/** A pit in the ground (the sinkhole, a trench): its dark, broken edges, the dirt down its sides. */
export const hole = (c: Ctx, a: number, b: number, label?: string) => {
  box(c, a, GY, b - a, 600, '#0C0A09');
  box(c, a, GY, 10, 120, '#57534E'); box(c, b - 10, GY, 10, 120, '#57534E');
  for (let k = 0; k < 6; k++) { box(c, a + 10 + k * 7, GY + 8 + k * 9, 6, 8, '#44403C'); box(c, b - 16 - k * 7, GY + 10 + k * 8, 6, 8, '#44403C'); }
  // (the sidewalk, broken off: a jagged lip either side going back)
  box(c, a - 6, BACK_Y, 12, BACK, '#0C0A09'); box(c, b - 6, BACK_Y, 12, BACK, '#0C0A09');
  box(c, a, BACK_Y, b - a, BACK, '#1C1917');
  if (label) words(c, label, (a + b) / 2, GY + 60, print({ sx: 1, sy: 2 }, '#FACC15'));
};

/** A sawhorse barrier with blinking light, on the ground at x. */
export const sawhorse = (c: Ctx, x: number, f: number, text = 'DANGER') => {
  box(c, x - 30, GY - 34, 60, 12, '#000'); box(c, x - 29, GY - 33, 58, 10, '#F8FAFC');
  for (let k = 0; k < 4; k++) box(c, x - 27 + k * 15, GY - 33, 7, 10, '#EA580C');
  box(c, x - 26, GY - 22, 4, 22, '#78716C'); box(c, x + 22, GY - 22, 4, 22, '#78716C');
  box(c, x - 3, GY - 42, 6, 8, f % 40 < 20 ? '#FBBF24' : '#78350F');
  words(c, text, x, GY - 44 - 6, print(1, '#F8FAFC', '#000'));
};

/** A velvet rope on brass posts, from x0 to x1, standing on feetY. */
export const velvetRope = (c: Ctx, x0: number, x1: number, feetY: number) => {
  const n = Math.max(1, Math.round((x1 - x0) / 60));
  for (let k = 0; k <= n; k++) {
    const x = x0 + ((x1 - x0) * k) / n;
    box(c, x - 2, feetY - 34, 4, 34, '#CA8A04'); box(c, x - 5, feetY - 4, 10, 4, '#A16207'); box(c, x - 3, feetY - 38, 6, 5, '#FDE68A');
    if (k < n) { const nx = x0 + ((x1 - x0) * (k + 1)) / n; c.strokeStyle = '#7F1D1D'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, feetY - 32); c.quadraticCurveTo((x + nx) / 2, feetY - 18, nx, feetY - 32); c.stroke(); }
  }
};

/** An AS SEEN IN brass plaque on its little stand (what it was seen in under it). */
export const asSeenIn = (c: Ctx, x: number, feetY: number, seenIn: string) => {
  box(c, x - 2, feetY - 46, 4, 46, '#57534E');
  const L = brass(8), w = Math.max(signW('AS SEEN IN', L), signW(seenIn, print(1, '#000'))) + 14;
  box(c, x - w / 2 - 1, feetY - 76, w + 2, 32, '#000'); box(c, x - w / 2, feetY - 75, w, 30, '#92400E'); box(c, x - w / 2 + 2, feetY - 73, w - 4, 26, '#B45309');
  words(c, 'AS SEEN IN', x, feetY - 63, L);
  words(c, seenIn, x, feetY - 52, print(1, '#FEF3C7'));
};

/** A guest (or anybody standing about: a person by seed, man or woman), facing `face`, at (x, feetY). */
export const guest = (c: Ctx, x: number, feetY: number, seed: number, f: number, pose: Pose = 'stand', face: 1 | -1 = 1, mood: 'bored' | 'happy' | 'shocked' | 'scared' = 'bored') => {
  c.save(); c.translate(x, feetY); c.scale(face * 0.92, 0.92);
  drawPerson(c, { seed, outfit: 'guest', f, pose, mood, shorts: seed % 3 === 0 });
  if (pose === 'photo') { box(c, 14, -70, 8, 12, '#18181B'); box(c, 15, -68, 6, 8, f % 90 < 4 ? '#FFFFFF' : '#60A5FA'); }
  c.restore();
};

/** A lamppost (a cheap old-Hollywood double lamp), a Steve flier taped round it, a PA horn on it if `horn`. */
export const lamppost = (c: Ctx, x: number, feetY: number, horn: boolean, seed: number) => {
  box(c, x - 4, feetY - 200, 8, 200, '#27272A'); box(c, x - 8, feetY - 12, 16, 12, '#18181B');
  box(c, x - 26, feetY - 204, 52, 4, '#27272A');
  for (const s of [-1, 1]) { box(c, x + s * 24 - 7, feetY - 226, 14, 22, '#000'); box(c, x + s * 24 - 6, feetY - 225, 12, 20, '#FEF3C7'); }
  if (horn) { box(c, x + 4, feetY - 186, 10, 8, '#52525B'); c.fillStyle = '#71717A'; c.beginPath(); c.moveTo(x + 14, feetY - 188); c.lineTo(x + 30, feetY - 196); c.lineTo(x + 30, feetY - 168); c.lineTo(x + 14, feetY - 176); c.closePath(); c.fill(); }
  c.save(); c.translate(x, feetY - 110); c.scale(0.55, 0.55); steveFlier(c, 0, 0, 'flier', seed); c.restore();
};

/** A palm tree, scrawny (the studio's). */
export const palm = (c: Ctx, x: number, feetY: number, h = 260, f = 0) => {
  for (let k = 0; k < 12; k++) box(c, x - 6 + Math.sin(k * 0.5) * 3, feetY - (k + 1) * (h / 12), 12, h / 12 + 1, k % 2 ? '#78350F' : '#92400E');
  const sway = Math.sin(f * 0.02 + x) * 3;
  c.fillStyle = '#166534';
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; c.save(); c.translate(x + sway, feetY - h); c.rotate(a + Math.PI / 2); c.beginPath(); c.ellipse(0, -30, 7, 34, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
};

/** A tip jar on a crate. */
export const tipJar = (c: Ctx, x: number, feetY: number) => {
  box(c, x - 14, feetY - 20, 28, 20, '#92400E'); box(c, x - 14, feetY - 20, 28, 2, '#B45309');
  box(c, x - 8, feetY - 38, 16, 18, 'rgba(186, 230, 253, 0.6)'); box(c, x - 6, feetY - 26, 12, 6, '#22C55E');
  words(c, 'TIPS', x, feetY - 42, print(1, '#FDE68A', '#000'));
};

/**
 * A plywood facade (one plank deep), standing at the back of the sidewalk: its painted front (a wall color, windows in
 * rows, a cornice, dimmer than anything that's a ledge), its name on it, and round its edges the 2x4 bracing and
 * sandbags showing behind (the end of it in view: it's all front).
 */
export const facade = (c: Ctx, x: number, w: number, h: number, wall: string, name?: string, nameL?: Look, opts: { windows?: boolean; door?: boolean; feetY?: number } = {}) => {
  const fy = opts.feetY ?? BACK_Y, top = fy - h;
  // (the bracing behind: slanted 2x4s from the top back down to sandbags, showing past both ends)
  for (const ex of [x - 18, x + w + 18]) {
    c.strokeStyle = '#A16207'; c.lineWidth = 5; c.beginPath(); c.moveTo(ex < x ? x + 6 : x + w - 6, top + 20); c.lineTo(ex, fy - 4); c.stroke();
    box(c, ex - 12, fy - 12, 24, 12, '#A8A29E'); box(c, ex - 10, fy - 20, 20, 9, '#D6D3D1');
  }
  box(c, x - 2, top - 2, w + 4, h + 2, '#000');
  box(c, x, top, w, h, wall);
  // (the plywood showing: sheet seams, a few nail heads)
  for (let sx = x + 120; sx < x + w; sx += 120) box(c, sx, top, 1, h, 'rgba(0,0,0,0.25)');
  if (opts.windows !== false) for (let wy = top + 30; wy < fy - 90; wy += 60) for (let wx = x + 22; wx < x + w - 40; wx += 56) { box(c, wx, wy, 30, 36, '#1E293B'); box(c, wx + 2, wy + 2, 26, 6, '#475569'); box(c, wx - 3, wy + 36, 36, 3, 'rgba(255,255,255,0.25)'); }
  // (the cornice: dim, no lit lip: not a ledge)
  box(c, x - 6, top - 6, w + 12, 8, 'rgba(0,0,0,0.35)');
  if (opts.door !== false) { box(c, x + w / 2 - 22, fy - 70, 44, 70, '#292524'); box(c, x + w / 2 - 18, fy - 66, 36, 66, '#44403C'); }
  if (name) { const L = nameL ?? enamel(10, '#FEF3C7', '#000'); const nw = signW(name, L) + 16; box(c, x + w / 2 - nw / 2, top + 6, nw, 20, '#1C1917'); words(c, name, x + w / 2, top + 21, L); }
};

/** A camera flash going off (world): a white burst, gone in a few frames. */
export const flash = (c: Ctx, x: number, y: number, t: number) => {
  if (t > 10) return;
  const r = 20 + t * 5, a = 1 - t / 10;
  c.fillStyle = `rgba(255, 255, 255, ${0.8 * a})`; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = `rgba(255, 255, 255, ${a})`; c.lineWidth = 2; c.beginPath();
  for (let k = 0; k < 8; k++) { const ang = (k * Math.PI) / 4; c.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); c.lineTo(x + Math.cos(ang) * (r + 14), y + Math.sin(ang) * (r + 14)); }
  c.stroke();
};
