// Truelling Tragons, drawn (crude first pass: flat colors in a few steps, readable shapes). The sky and the castle
// going by; the park far below; the three tracks (steel box beams with their lane's stripe, no lit tops: not to stand
// on), their pylons dimmed behind; the holes (the bent, broken ends); the dragons (three cars each, the dragon's head
// up over the front (a wall), its tail curled up at the back, the back lit along its top: where he stands), going over
// a broken end, or coming down onto the track on bat wings (a spare); each lane's obstacles; the load station and the
// unload; and, over it all in screen space, the warnings (a flashing sign at every hole coming, an arrow at the edge
// when it's off the screen, a countdown over the dragon that's going to run into it, SAFE over the one that won't),
// the PA's words in the top band, the rivals' words.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT, topBand } from '../../../m1/constants';
import { mid } from '../../../m1/game/enemies/kinds';
import { saidOver, box, groundBox, ledgeBox } from '../section';
import { storySign, fairySky, mix, INK, type Ctx } from '../kit';
import { drawCastleAt, MONUMENT_AT } from '../monument';
import {
  GY, TL, CAR, S0X, STATION_X, GATE_X, LOCK, END_S, DECK_X0, DECK_X1, EXIT_X, LANES, LANE_COL, LANE_NAME,
  laneY, wxOf, rearX, type Lane,
} from './layout';
import { tragonsOf, type Tragons, type Obst } from './state';
import { yAt, toScreen, deckY } from './ride';
import { drawItem } from './rivals';

/** Under a dragon's roof: its wheels on the rail this far down. */
const RAIL = 48;
const FONT = '"Press Start 2P"';

/** What of the world's on screen as drawn. */
const viewBox = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: CANVAS_WIDTH, h: CANVAS_HEIGHT };
const inView = (state: GameState, x0: number, x1: number, m = 80) => { const v = viewBox(state); return x1 > v.x - m && x0 < v.x + v.w + m; };
/** The station's offset (it goes off the left as the ride gets going; back where it was on a revisit). */
const stationShift = (t: Tragons) => (t.phase === 'done' ? 0 : Math.max(0, t.dist - LOCK));
/** How far the track's come along under the world (for things on the ground going by). */
const groundS = (t: Tragons) => (t.phase === 'done' ? 0 : t.dist);

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the sky

export const drawTragonsBackdrop = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  // (the far hills going by with the ride; the castle drifting across as it goes)
  const virt = { ...state, camera: { ...state.camera, x: state.camera.x + groundS(t) * 0.6 } } as GameState;
  fairySky(c, virt, null, { near: '#2A2E4A' });
  const at = MONUMENT_AT.tragons, k = Math.min(1, t.dist / END_S);
  drawCastleAt(c, Math.round(at.from + (at.to - at.from) * k), at.base, at.k, state.frame);
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// World space

/** The park far below: grass, paths, flower beds and lamp posts going by; the station's stone floor. */
const drawGround = (c: Ctx, state: GameState, t: Tragons) => {
  const v = viewBox(state), sh = stationShift(t), gs = groundS(t);
  const end = GATE_X + 30 - sh;
  groundBox(c, v.x - 40, v.x + v.w + 40, GY, '#3E5A34', '#6E9A50');
  // (the station's floor: flagstones)
  if (end > v.x) { groundBox(c, Math.max(v.x - 40, STATION_X - 600 - sh), Math.min(end, v.x + v.w + 40), GY, '#5A5466', '#B8B0C8'); }
  // (things on the grass, going by: beds, lamp posts (dimmed: scenery), a path)
  const step = 260, first = Math.floor((v.x + gs - 200) / step) * step;
  for (let s = first; s < v.x + v.w + gs + 200; s += step) {
    const x = s - gs;
    if (x < end + 20) continue;
    const n = Math.abs(Math.floor(s / step)) % 5;
    if (n === 0 || n === 3) { box(c, x, GY + 6, 70, 10, '#6B3A2A'); for (let i = 0; i < 6; i++) box(c, x + 4 + i * 11, GY + 3, 6, 6, ['#F472B6', '#FDE047', '#A78BFA'][i % 3]); }
    if (n === 1) { box(c, x, GY - 70, 4, 70, '#2E2A3A'); box(c, x - 4, GY - 78, 12, 9, '#FDE68A'); }
    if (n === 4) box(c, x - 30, GY + 20, 120, 6, '#8A7A5A');
  }
};

/** The pylons under every track (dimmed: they hold it up, they're not to stand on). */
const drawPylons = (c: Ctx, state: GameState, t: Tragons, s0: number, s1: number) => {
  for (const lane of LANES) {
    const step = 420, first = Math.ceil(s0 / step) * step;
    for (let s = first; s < s1; s += step) {
      if (t.gaps.some(g => g.lane === lane && s >= g.a - 40 && s < g.b + 40)) continue;
      const x = wxOf(t.dist, s), y = yAt(t, lane, s) + RAIL + 6;
      const col = mix('#3A3550', '#7A8AB4', 0.25);
      box(c, x - 4, y, 8, GY - y, col);
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
      for (let yy = y + 30; yy < GY - 20; yy += 70) { c.moveTo(x - 18, yy); c.lineTo(x + 18, yy + 35); }
      c.stroke();
    }
  }
};

/** A lane's track along s0..s1 (its holes left out, their broken ends bent and dangling). */
const drawTrack = (c: Ctx, state: GameState, t: Tragons, lane: Lane, s0: number, s1: number) => {
  const [main, light, dark] = LANE_COL[lane];
  const gaps = t.gaps.filter(g => g.lane === lane && g.b > s0 && g.a < s1);
  const runs: [number, number][][] = [];
  let cur: [number, number][] = [];
  for (let s = s0; s <= s1 + 16; s += 16) {
    if (gaps.some(g => s >= g.a && s < g.b)) { if (cur.length) runs.push(cur); cur = []; continue; }
    cur.push([wxOf(t.dist, s), yAt(t, lane, s) + RAIL]);
  }
  if (cur.length) runs.push(cur);
  for (const pts of runs) {
    if (pts.length < 2) continue;
    const line = (w: number, col: string, dy = 0) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y + dy) : c.moveTo(x, y + dy))); c.stroke(); };
    c.lineJoin = 'round';
    line(14, INK, 3); line(10, mix(dark, '#000000', 0.35), 3); line(3, main, 6); line(2, mix(light, dark, 0.5), 0);
  }
  // (the broken ends: torn steel, bent down, sparking)
  for (const g of gaps) for (const [s, dir] of [[g.a, 1], [g.b, -1]] as [number, number][]) {
    const x = wxOf(t.dist, s), y = laneY(lane, s) + RAIL;
    c.strokeStyle = mix(dark, '#000000', 0.3); c.lineWidth = 6;
    c.beginPath(); c.moveTo(x - dir * 4, y + 3); c.lineTo(x + dir * 18, y + 22); c.lineTo(x + dir * 12, y + 40); c.stroke();
    if (state.frame % 10 < 3) box(c, x + dir * 10, y + 20, 3, 3, '#FDE047');
  }
};

/** A dragon at the origin (its rear's roof at 0,0, the front off to the right). `danger` its side lights flashing red;
 *  `wings` (a spare coming down) bat wings beating, 0..1 how far down it is. */
const paintDragon = (c: Ctx, lane: Lane, f: number, opts: { danger?: boolean; wings?: number } = {}) => {
  const [main, light, dark] = LANE_COL[lane];
  if (opts.wings !== undefined) {
    // (bat wings off its back, beating)
    const a = Math.sin(f * 0.45) * 0.6;
    for (const side of [-1, 1]) {
      c.save(); c.translate(TL / 2 + side * 30, -6); c.rotate(side * (0.4 + a));
      c.fillStyle = INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(side * 150, -60); c.lineTo(side * 120, -10); c.lineTo(side * 90, -30); c.lineTo(side * 60, 4); c.closePath(); c.fill();
      c.fillStyle = mix(dark, '#000000', 0.2); c.beginPath(); c.moveTo(4 * side, -2); c.lineTo(side * 144, -56); c.lineTo(side * 118, -12); c.lineTo(side * 90, -28); c.lineTo(side * 62, 0); c.closePath(); c.fill();
      c.restore();
    }
  }
  // (the tail: curled up off the back)
  c.fillStyle = INK; c.beginPath(); c.moveTo(14, 6); c.quadraticCurveTo(-26, 4, -18, -26); c.lineTo(-8, -24); c.quadraticCurveTo(-12, -4, 14, -6); c.closePath(); c.fill();
  c.fillStyle = main; c.beginPath(); c.moveTo(12, 3); c.quadraticCurveTo(-22, 2, -16, -22); c.lineTo(-10, -21); c.quadraticCurveTo(-12, -6, 12, -3); c.closePath(); c.fill();
  box(c, 0, -24, 12, 24, INK); box(c, 1, -23, 10, 22, main); box(c, 1, -23, 10, 2, light);
  // (the cars: scaled bodies, the lights down the side, the wheels on the rail)
  for (let i = 0; i < 3; i++) {
    const x = i * CAR;
    box(c, x + 3, -1, CAR - 6, 44, INK);
    box(c, x + 4, 0, CAR - 8, 42, dark);
    box(c, x + 4, 0, CAR - 8, 20, main);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 7; k++) { c.fillStyle = mix(main, light, 0.35); c.beginPath(); c.arc(x + 12 + k * 12 + r * 6, 8 + r * 8, 4, 0, Math.PI); c.fill(); }
    for (let k = 0; k < 4; k++) {
      const on = opts.danger ? f % 12 < 6 : (f / 6 + k + i * 4) % 8 < 4;
      box(c, x + 14 + k * 22, 28, 6, 6, opts.danger ? (on ? '#EF4444' : '#450A0A') : on ? light : mix(dark, '#000000', 0.3));
    }
    for (const wx of [x + 18, x + CAR - 18]) { c.fillStyle = INK; c.beginPath(); c.arc(wx, 44, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#71717A'; c.beginPath(); c.arc(wx, 44, 4, 0, Math.PI * 2); c.fill(); }
  }
  // (the dragon's back, lit along its top: where he stands)
  box(c, 2, -3, TL - 4, 4, INK); box(c, 3, -2, TL - 6, 3, light);
  // (the head: the neck up off the front, the head out ahead, horns, an eye; its breath)
  const hx = TL - 16;
  box(c, hx - 1, -47, 18, 47, INK); box(c, hx, -46, 16, 46, main); box(c, hx, -46, 16, 3, light);
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx, -50); c.lineTo(hx + 44, -42); c.lineTo(hx + 48, -30); c.lineTo(hx + 22, -24); c.lineTo(hx, -26); c.closePath(); c.fill();
  c.fillStyle = main; c.beginPath(); c.moveTo(hx + 1, -48); c.lineTo(hx + 42, -41); c.lineTo(hx + 45, -31); c.lineTo(hx + 22, -26); c.lineTo(hx + 1, -28); c.closePath(); c.fill();
  box(c, hx + 22, -32, 22, 3, dark);
  c.fillStyle = light; c.beginPath(); c.moveTo(hx + 4, -48); c.lineTo(hx - 8, -64); c.lineTo(hx + 10, -50); c.fill();
  c.beginPath(); c.moveTo(hx + 12, -47); c.lineTo(hx + 6, -62); c.lineTo(hx + 18, -47); c.fill();
  box(c, hx + 24, -44, 5, 4, opts.danger && f % 12 < 6 ? '#EF4444' : '#FEF08A');
  if (f % 30 < 14) {
    const bx = hx + 50, by = -36;
    if (lane === 1) for (let k = 0; k < 3; k++) box(c, bx + k * 6, by - 2 + ((f + k) % 3), 5, 4, ['#FDE047', '#F97316', '#DC2626'][k]);
    else if (lane === 2) for (let k = 0; k < 3; k++) box(c, bx + k * 7, by - k * 2, 5, 5, '#E0F2FE');
    else { c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + 6, by - 6); c.lineTo(bx + 10, by + 2); c.lineTo(bx + 18, by - 4); c.stroke(); }
  }
};

/** Is a hole coming on this dragon's track (in its warning)? */
const endangered = (t: Tragons, lane: Lane) => t.gaps.some(g => g.lane === lane && g.a > t.dist + TL);

const drawTrains = (c: Ctx, state: GameState, t: Tragons) => {
  const f = state.frame;
  for (const tr of t.trains) {
    if (tr.phase === 'gone') continue;
    c.save();
    if (tr.phase === 'fall') { c.translate(tr.fx + TL / 2, tr.fy); c.rotate(tr.rot); c.translate(-TL / 2, 0); paintDragon(c, tr.lane, f, { danger: true }); }
    else if (tr.phase === 'arrive') {
      const u = tr.t / 80, e = 1 - (1 - u) * (1 - u);
      c.translate(rearX(t.dist), tr.y - (1 - e) * 560); paintDragon(c, tr.lane, f, { wings: u });
    } else { c.translate(rearX(t.dist), tr.y); paintDragon(c, tr.lane, f, { danger: t.phase === 'ride' && endangered(t, tr.lane) }); }
    c.restore();
  }
};

/** An obstacle on the track, its back (the posts, the towers, the clouds: behind) or its front (what hurts). */
const drawObst = (c: Ctx, state: GameState, t: Tragons, o: Obst, front: boolean) => {
  const f = state.frame, ox = wxOf(t.dist, o.s), yb = yAt(t, o.lane, o.s);
  const [main, light, dark] = LANE_COL[o.lane];
  const post = mix('#3A3550', '#7A8AB4', 0.2);
  switch (o.kind) {
    case 'ring':
      if (!front) { box(c, ox - 3, yb - 20, 6, RAIL + 20, post); return; }
      // (a hoop of fire round the track: its top at his head)
      c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.ellipse(ox, yb + 2, 13, 56, 0, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = '#B45309'; c.lineWidth = 5; c.beginPath(); c.ellipse(ox, yb + 2, 13, 56, 0, 0, Math.PI * 2); c.stroke();
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + f * 0.05, fx = ox + Math.cos(a) * 13, fy = yb + 2 + Math.sin(a) * 56; box(c, fx - 3, fy - 6 - ((f + k * 3) % 6), 6, 8, ['#FDE047', '#F97316', '#DC2626'][(k + (f >> 2)) % 3]); }
      return;
    case 'icicles':
      if (!front) { box(c, ox - 46, yb - 124, 6, 124 + RAIL, post); box(c, ox + 40, yb - 124, 6, 124 + RAIL, post); return; }
      box(c, ox - 48, yb - 128, 96, 12, INK); box(c, ox - 47, yb - 127, 94, 10, '#BAE6FD'); box(c, ox - 47, yb - 127, 94, 3, '#F0F9FF');
      for (let k = 0; k < 9; k++) {
        const x = ox - 40 + k * 10, len = 58 + ((k * 7) % 4) * 6;
        c.fillStyle = INK; c.beginPath(); c.moveTo(x - 4, yb - 117); c.lineTo(x + 4, yb - 117); c.lineTo(x, yb - 117 + len + 2); c.fill();
        c.fillStyle = k % 2 ? '#E0F2FE' : '#7DD3FC'; c.beginPath(); c.moveTo(x - 3, yb - 117); c.lineTo(x + 3, yb - 117); c.lineTo(x, yb - 117 + len); c.fill();
      }
      return;
    case 'arc':
      if (!front) { box(c, ox - 30, yb - 124, 6, 124 + RAIL, post); box(c, ox + 24, yb - 124, 6, 124 + RAIL, post); return; }
      box(c, ox - 34, yb - 128, 68, 10, INK); box(c, ox - 33, yb - 127, 66, 8, '#52525B');
      for (const cx of [ox - 26, ox + 26]) { c.fillStyle = INK; c.beginPath(); c.arc(cx, yb - 130, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#C4B5FD'; c.beginPath(); c.arc(cx, yb - 130, 6, 0, Math.PI * 2); c.fill(); }
      // (the curtain of lightning down to his head, crackling)
      for (let k = 0; k < 3; k++) {
        c.strokeStyle = k === 1 ? '#FFFFFF' : f % 4 < 2 ? main : '#C4B5FD'; c.lineWidth = k === 1 ? 2 : 3;
        c.beginPath(); let y = yb - 118; c.moveTo(ox - 6 + k * 6, y);
        while (y < yb - 46) { y += 10; c.lineTo(ox - 6 + k * 6 + (((f + y + k * 7) >> 2) % 3 - 1) * 6, Math.min(y, yb - 46)); }
        c.stroke();
      }
      return;
    case 'jet':
      if (!front) { box(c, ox - 8, yb + 2, 16, RAIL - 2, INK); box(c, ox - 7, yb + 3, 14, RAIL - 4, '#57534E'); return; }
      // (a low fountain of flame up off the track: knee high)
      for (let k = 0; k < 8; k++) { const h = 18 + ((f * 3 + k * 11) % 14); box(c, ox - 12 + k * 3, yb - h, 4, h, ['#DC2626', '#F97316', '#FDE047'][(k + (f >> 1)) % 3]); }
      return;
    case 'bar':
      if (!front) { box(c, ox - 12, yb - 30, 6, 30 + RAIL, post); box(c, ox + 6, yb - 30, 6, 30 + RAIL, post); return; }
      // (a frozen bar across the track, just over the dragon's back: a hurdle)
      box(c, ox - 9, yb - 29, 18, 24, INK); box(c, ox - 8, yb - 28, 16, 22, '#7DD3FC'); box(c, ox - 8, yb - 28, 16, 4, '#F0F9FF');
      return;
    case 'live': {
      if (front) return;
      // (the rail live along its length: glowing, sparks crawling along it)
      for (let s = o.s; s < o.s + o.len; s += 20) {
        const x = wxOf(t.dist, s), y = yAt(t, o.lane, s) + RAIL;
        box(c, x, y - 3, 20, 6, f % 6 < 3 ? '#FEF08A' : main);
        if ((s / 20 + f) % 9 === 0) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 4, y - 14); c.lineTo(x + 9, y - 8); c.lineTo(x + 12, y - 20); c.stroke(); }
      }
      const tr = t.trains[o.lane];
      if (tr.phase === 'ok' && t.dist + TL > o.s && t.dist < o.s + o.len) for (let k = 0; k < 4; k++) {
        const x = rearX(t.dist) + ((f * 13 + k * 77) % TL);
        c.strokeStyle = '#FEF08A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, tr.y); c.lineTo(x + 4, tr.y - 10); c.lineTo(x - 2, tr.y - 16); c.stroke();
      }
      return;
    }
    case 'tower': {
      if (front) return;
      // (a stone tower by the track, a dragon's head up on it facing back down the line: its mouth glowing before it spits)
      const top = yb - 150;
      box(c, ox - 22, top, 44, GY - top, mix('#4A3A3A', '#7A8AB4', 0.2));
      box(c, ox - 26, top - 6, 52, 10, INK);
      const glow = t.trains[o.lane].phase === 'ok' && o.shots < 2 && (f - o.lastShot) % 52 > 30;
      c.fillStyle = INK; c.beginPath(); c.moveTo(ox + 14, top - 6); c.lineTo(ox - 40, top - 22); c.lineTo(ox - 44, top - 8); c.lineTo(ox + 14, top + 2); c.fill();
      c.fillStyle = main; c.beginPath(); c.moveTo(ox + 12, top - 6); c.lineTo(ox - 38, top - 20); c.lineTo(ox - 41, top - 9); c.lineTo(ox + 12, top); c.fill();
      if (glow) { c.fillStyle = '#FDE047'; c.beginPath(); c.arc(ox - 40, top - 14, 6, 0, Math.PI * 2); c.fill(); }
      box(c, ox - 18, top - 18, 4, 4, '#FEF08A');
      return;
    }
    case 'cannon': {
      if (front) return;
      const y = yb - 54;
      box(c, ox - 6, y + 8, 12, GY - y, mix('#3A4A5A', '#7A8AB4', 0.2));
      box(c, ox - 30, y - 9, 42, 18, INK); box(c, ox - 29, y - 8, 40, 16, '#E0F2FE'); box(c, ox - 29, y - 8, 40, 4, '#FFFFFF');
      box(c, ox - 32, y - 6, 4, 12, '#1E3A8A');
      if (f - o.lastShot < 10) for (let k = 0; k < 4; k++) box(c, ox - 40 - k * 6, y - 6 + k * 3, 6, 6, '#F8FAFC');
      return;
    }
    case 'cloud': {
      if (front) return;
      const y = yb - 250;
      for (const [dx, r] of [[-40, 26], [-10, 34], [26, 28], [50, 20]]) { c.fillStyle = '#3B2A5A'; c.beginPath(); c.arc(ox + dx, y, r, 0, Math.PI * 2); c.fill(); }
      for (const [dx, r] of [[-30, 18], [0, 22], [30, 16]]) { c.fillStyle = f % 40 < 3 ? '#C4B5FD' : '#5B4A8A'; c.beginPath(); c.arc(ox + dx, y - 6, r, 0, Math.PI * 2); c.fill(); }
      void light; void dark;
      return;
    }
  }
};

/** What's flying: fireballs (their target ring on the roof), strikes (the glow, the bolt), snowballs; and what the
 *  rivals threw. */
const drawShots = (c: Ctx, state: GameState, t: Tragons) => {
  const f = state.frame;
  for (const q of t.shots) {
    const tr = t.trains[q.lane];
    if (q.kind === 'fireball') {
      const ty = tr.phase === 'ok' ? tr.y : q.sy + 600, u = q.t / q.dur;
      // (where it'll land: a ring on the roof, closing)
      if (tr.phase === 'ok') { c.strokeStyle = f % 8 < 4 ? '#F97316' : '#FDE047'; c.lineWidth = 3; c.beginPath(); c.ellipse(q.tx, ty - 2, 34 * (1 - u * 0.5), 6, 0, 0, Math.PI * 2); c.stroke(); }
      const x = q.sx + (q.tx - q.sx) * u, y = q.sy + (ty - q.sy) * u - Math.sin(Math.PI * u) * 110;
      c.fillStyle = INK; c.beginPath(); c.arc(x, y, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F97316'; c.beginPath(); c.arc(x, y, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FDE047'; c.beginPath(); c.arc(x - 2, y - 2, 5, 0, Math.PI * 2); c.fill();
    } else if (q.kind === 'strike') {
      if (tr.phase !== 'ok') continue;
      const u = q.t / q.dur;
      if (q.t < q.dur - 6) { c.strokeStyle = f % 6 < 3 ? '#FACC15' : '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.ellipse(q.tx, tr.y - 2, 26 * (1.2 - u * 0.6), 6, 0, 0, Math.PI * 2); c.stroke(); }
      else {
        c.strokeStyle = '#FFFFFF'; c.lineWidth = 6; c.beginPath(); let y = tr.y - 330; c.moveTo(q.tx, y);
        while (y < tr.y) { y += 30; c.lineTo(q.tx + ((y * 7) % 30) - 15, Math.min(y, tr.y)); }
        c.stroke(); c.strokeStyle = '#FACC15'; c.lineWidth = 2; c.stroke();
      }
    } else {
      c.fillStyle = INK; c.beginPath(); c.arc(q.sx, q.sy, 10, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(q.sx, q.sy, 9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#BAE6FD'; c.beginPath(); c.arc(q.sx + 2, q.sy + 3, 4, 0, Math.PI * 2); c.fill();
    }
  }
  for (const q of t.thrown) drawItem(c, q.item, q.x, q.y, q.spin);
};

/** The load station: the hall behind (dimmed), the board, its signs, the gate (shut till the ride goes). */
const drawStation = (c: Ctx, state: GameState, t: Tragons) => {
  const sh = stationShift(t), x0 = STATION_X - 500 - sh, x1 = GATE_X + 60 - sh;
  if (!inView(state, x0, x1 + 200)) return;
  const wall = mix('#3A2A4A', '#7A8AB4', 0.25), trim = mix('#6A4A2A', '#7A8AB4', 0.2);
  box(c, x0, GY - 560, x1 - x0, 560, wall);
  for (let x = x0 + 40; x < x1 - 60; x += 120) { box(c, x, GY - 520, 70, 140, mix(wall, '#000000', 0.3)); c.fillStyle = mix(wall, '#000000', 0.3); c.beginPath(); c.arc(x + 35, GY - 520, 35, Math.PI, 0); c.fill(); }
  box(c, x0 - 10, GY - 580, x1 - x0 + 20, 24, trim);
  // (the three dragons' heads over the hall's top, fire, ice, lightning)
  ([1, 2, 0] as Lane[]).forEach((lane, i) => {
    const hx = x0 + 160 + i * 220, hy = GY - 610, [main, light] = LANE_COL[lane];
    c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 40, hy + 30); c.lineTo(hx + 40, hy + 10); c.lineTo(hx + 46, hy + 28); c.lineTo(hx - 40, hy + 40); c.fill();
    c.fillStyle = main; c.beginPath(); c.moveTo(hx - 38, hy + 30); c.lineTo(hx + 38, hy + 12); c.lineTo(hx + 43, hy + 27); c.lineTo(hx - 38, hy + 38); c.fill();
    box(c, hx + 16, hy + 14, 5, 4, light);
  });
  storySign(c, STATION_X + 60 - sh, GY, ['TRUELLING TRAGONS', 'THREE DRAGONS. ONE TRUEL.'], { tall: 170 });
  if (t.phase === 'done') storySign(c, S0X + 140 - sh, GY, ['RIDE CLOSED', 'TRACK DAMAGE'], { warn: true, tall: 120, big: 1 });
  else storySign(c, S0X - 150 - sh, GY, ['NO FIREARMS', 'ON THE DRAGONS'], { warn: true, tall: 120, big: 1 });
  // (the gate: wrought iron, shut till the dragons go; swung open after)
  const gx = GATE_X - sh, open = t.phase !== 'load';
  if (!open) {
    box(c, gx, GY - 320, 20, 320, INK);
    for (let y = GY - 316; y < GY; y += 4) box(c, gx + 2, y, 16, 1, '#2E2A3A');
    for (let k = 0; k < 4; k++) box(c, gx + 2 + k * 5, GY - 330, 3, 330, '#4A445A');
    for (let k = 0; k < 4; k++) { c.fillStyle = '#E0AE3A'; c.beginPath(); c.moveTo(gx + 3 + k * 5, GY - 338); c.lineTo(gx + k * 5, GY - 330); c.lineTo(gx + 6 + k * 5, GY - 330); c.fill(); }
  } else { box(c, gx - 2, GY - 320, 6, 320, INK); box(c, gx - 1, GY - 318, 4, 316, '#4A445A'); }
};

/** The unload: decks a lane (lit along their tops: off the dragons' fronts and down), the hall, the signs, the way out
 *  to the castle's base. */
const drawUnload = (c: Ctx, state: GameState, t: Tragons) => {
  const ux = wxOf(t.dist, END_S + TL) + 2, off = ux - DECK_X0;
  if (!inView(state, ux - 300, EXIT_X + off + 300)) return;
  const wall = mix('#3A2A4A', '#7A8AB4', 0.25);
  box(c, ux - 120, GY - 620, DECK_X1 - DECK_X0 + 240, 620, wall);
  box(c, ux - 130, GY - 640, DECK_X1 - DECK_X0 + 260, 24, mix('#6A4A2A', '#7A8AB4', 0.2));
  for (const lane of LANES) {
    const w = DECK_X1 - DECK_X0 - (2 - lane) * 80, y = deckY(lane);
    box(c, ux + 20, y + 14, 8, GY - y - 14, mix('#2E2A3A', '#7A8AB4', 0.2));
    ledgeBox(c, ux, y, w, mix(LANE_COL[lane][2], '#2A2A34', 0.5), LANE_COL[lane][1]);
  }
  storySign(c, ux + 360, GY, ['UNLOAD', 'EXIT TO THY RIGHT'], { tall: 130 });
  storySign(c, EXIT_X - 200 + off, GY, ["THE GREAT PIXIE'S CASTLE", 'THIS WAY >'], { tall: 150, board: '#2E5A3A' });
  // (the way out: a castle gate's arch)
  const ex = EXIT_X + off;
  box(c, ex - 10, GY - 260, 140, 260, INK); box(c, ex - 6, GY - 256, 132, 256, mix('#6A6478', '#7A8AB4', 0.2));
  box(c, ex + 20, GY - 190, 72, 190, '#120A1E'); c.fillStyle = '#120A1E'; c.beginPath(); c.arc(ex + 56, GY - 190, 36, Math.PI, 0); c.fill();
};

export const drawTragonsBack = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), v = viewBox(state);
  drawGround(c, state, t);
  drawStation(c, state, t);
  // (the track that's on screen, by track position)
  const s0 = v.x - rearX(t.dist) + t.dist - 100, s1 = v.x + v.w - rearX(t.dist) + t.dist + 100;
  drawPylons(c, state, t, s0, s1);
  for (const o of t.obst) if (inView(state, wxOf(t.dist, o.s) - 80, wxOf(t.dist, o.s + o.len) + 80)) drawObst(c, state, t, o, false);
  for (const lane of LANES) drawTrack(c, state, t, lane, Math.max(s0, -900), s1);
  drawUnload(c, state, t);
  drawTrains(c, state, t);
};

export const drawTragonsFront = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state);
  for (const o of t.obst) if (inView(state, wxOf(t.dist, o.s) - 80, wxOf(t.dist, o.s + o.len) + 80)) drawObst(c, state, t, o, true);
  drawShots(c, state, t);
  // (a rival sat astride his dragon: its crest up in front of his hips)
  for (const e of Object.values(t.rivals)) {
    if (!e || e.health <= 0 || e.aiState !== 'seat') continue;
    const tr = t.trains.find(q => q.phase === 'ok' && Math.abs(q.y - (e.pos.y + e.height)) < 8);
    if (!tr) continue;
    // (no lit top on it: it's not a step)
    const [main, , dark] = LANE_COL[tr.lane], x = mid(e).x;
    c.fillStyle = INK; c.beginPath(); c.moveTo(x - 24, tr.y); c.lineTo(x - 6, tr.y - 18); c.lineTo(x + 24, tr.y); c.fill();
    c.fillStyle = main; c.beginPath(); c.moveTo(x - 21, tr.y - 1); c.lineTo(x - 6, tr.y - 15); c.lineTo(x + 21, tr.y - 1); c.fill();
    box(c, x - 18, tr.y - 4, 36, 3, dark);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Screen space: the warnings, the PA, the rivals' words

/** A flashing warning sign (a triangle in the lane's color, the !), its middle at (x, y). */
const warnSign = (c: Ctx, x: number, y: number, col: string, f: number, r = 15) => {
  const on = f % 16 < 10;
  c.fillStyle = INK; c.beginPath(); c.moveTo(x, y - r - 3); c.lineTo(x + r + 4, y + r * 0.8 + 2); c.lineTo(x - r - 4, y + r * 0.8 + 2); c.closePath(); c.fill();
  c.fillStyle = on ? col : mix(col, '#000000', 0.4); c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y + r * 0.8); c.lineTo(x - r, y + r * 0.8); c.closePath(); c.fill();
  c.fillStyle = INK; c.fillRect(x - 2, y - r * 0.45, 4, r * 0.75); c.fillRect(x - 2, y + r * 0.42, 4, 4);
};
const text = (c: Ctx, s: string, x: number, y: number, col: string, size = 7, align: CanvasTextAlign = 'center') => {
  c.font = `${size}px ${FONT}`; c.textAlign = align;
  c.fillStyle = '#000'; c.fillText(s, x + 1, y + 1); c.fillStyle = col; c.fillText(s, x, y);
  c.textAlign = 'left';
};

export const drawTragonsHud = (c: Ctx, state: GameState) => {
  const t = tragonsOf(state), f = state.frame;
  if (t.phase === 'ride') {
    for (const g of t.gaps) {
      if (g.a <= t.dist + TL - 2) continue;
      const [main] = LANE_COL[g.lane];
      const left = (g.a - (t.dist + TL)) / Math.max(1, t.v), total = Math.max(left, g.w ?? left);
      // (at the hole: a flashing sign over the broken end; off the screen, at the edge, an arrow in)
      const at = toScreen(state, wxOf(t.dist, g.a), laneY(g.lane, g.a) + 10);
      const off = at.x > CANVAS_WIDTH - 34;
      const sx = Math.min(CANVAS_WIDTH - 34, at.x), sy = Math.max(120, Math.min(CANVAS_HEIGHT - 30, at.y));
      warnSign(c, sx, sy, main, f);
      text(c, 'TRACK OUT', sx, sy + 28, main, 6);
      if (off && f % 16 < 10) text(c, '>>', sx + 22, sy + 4, main, 8, 'left');
      // (over the dragon that's going to run into it: the time left, running down)
      const tr = t.trains[g.lane];
      if (tr.phase === 'ok') {
        const p = toScreen(state, rearX(t.dist) + TL / 2, tr.y - 92);
        const w = 90, k = Math.max(0, Math.min(1, left / total));
        box(c, p.x - w / 2 - 2, p.y - 2, w + 4, 10, INK);
        box(c, p.x - w / 2, p.y, w * k, 6, f % 10 < 5 && k < 0.35 ? '#EF4444' : main);
        warnSign(c, p.x - w / 2 - 14, p.y + 3, main, f, 8);
      }
    }
    // (only one dragon makes it: SAFE over that one)
    const safe = t.gaps.find(g => g.safe !== undefined && g.a > t.dist + TL - 2)?.safe;
    if (safe !== undefined && t.trains[safe].phase === 'ok') {
      const tr = t.trains[safe], p = toScreen(state, rearX(t.dist) + TL / 2, tr.y - 112);
      const bob = Math.sin(f * 0.2) * 3;
      text(c, `SAFE: ${LANE_NAME[safe]}`, p.x, p.y + bob, f % 20 < 14 ? '#4ADE80' : '#BBF7D0', 8);
      c.fillStyle = '#4ADE80'; c.beginPath(); c.moveTo(p.x - 7, p.y + 6 + bob); c.lineTo(p.x + 7, p.y + 6 + bob); c.lineTo(p.x, p.y + 14 + bob); c.fill();
    }
  }
  // (the rivals' words over them)
  for (const [e, s] of t.barks) {
    const p = toScreen(state, mid(e).x, e.pos.y - 14);
    saidOver(c, s.text, p.x, p.y, '#FDE68A', 220);
  }
  // (the PA: the ride's spiel, or Piper, in the top band)
  if (t.pa) {
    const band = topBand(), who = t.paWho === 'piper' ? 'PIPER (PA):' : 'THE RIDE:';
    const col = t.paWho === 'piper' ? '#F9A8D4' : '#FDE68A';
    c.font = `7px ${FONT}`;
    const words = t.pa.text.split(' '), lines: string[] = [];
    let cur = '';
    const wide = band.x2 - band.x1 - 16;
    for (const w of words) { const s = cur ? `${cur} ${w}` : w; if (c.measureText(s).width > wide && cur) { lines.push(cur); cur = w; } else cur = s; }
    if (cur) lines.push(cur);
    const h = 20 + lines.length * 11;
    c.fillStyle = 'rgba(10,8,20,0.78)'; c.fillRect(band.x1, 8, band.x2 - band.x1, h);
    c.fillStyle = col; c.fillRect(band.x1, 8, 3, h);
    text(c, who, band.x1 + 10, 20, col, 6, 'left');
    lines.forEach((l, i) => text(c, l, band.x1 + 10, 32 + i * 11, '#FFFFFF', 7, 'left'));
  }
};
