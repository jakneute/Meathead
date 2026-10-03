// Club Caldera, inside, drawn: the club floor (glass tiles over lava, lit from
// under and pulsing to the beat; obsidian walls veined with lava, a magma
// waterfall behind the dance floor, lava lamps as tall as pillars, the neon sign;
// the DJ booth, the bar, the speaker stacks, the VIP tables, the go-go cages) and
// its atrium (not rock: glossy black walls with neon run up them, a lava lamp the
// height of the whole thing, neon catwalks, chrome pyro cannons, disco rigs
// spinning fire; at its foot, the stairwell down to the front door he never
// used). The partygoers' screams over their heads, and the tally of the ones
// he's killed.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left),
// neon as a tube with a stepped halo round it, glows in rings, no smooth gradients and no blur.

import type { GameState } from '../../core/state';
import { bandedGradient, checker, pixelBlob, steppedGlow, tilePattern } from '../../render/pixelArt';
import { ramp } from '../../render/backdrops/core';
import { INK, dark, lite, ink, limb } from '../../render/npc/kit';
import { slab, column, pipe, letter } from '../barry/rooms';
import type { Ledge } from './course';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from '../../../constants';
import { COURSE } from './course';
import { getVictor, regionOf } from './runtime';
import { tallyTitle } from './club';
import { sentenceShown } from '../../platform/speech';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const Y = GROUND_Y;
/** The beat (frames a beat: 120 to the minute). */
export const BEAT = 30;
const beatK = (f: number) => 1 - (f % BEAT) / BEAT;
const NEON = ['#F472B6', '#22D3EE', '#FB923C', '#A78BFA'];
const visible = (state: GameState, x1: number, x2: number) => x2 > state.camera.x - 200 && x1 < state.camera.x + CANVAS_WIDTH + 200;
const snap = (v: number) => Math.round(v / 2) * 2;

// ---------------------------------------------------------------------------
// The kit (the stage's other drawing uses these too)
// ---------------------------------------------------------------------------

/**
 * Neon lettering, centered on x: lit, a halo round the tube in two hard steps, the tube itself, a hot core; off, a
 * dead tube with its ink line. No blur anywhere.
 */
export const neonText = (ctx: Ctx, text: string, x: number, y: number, font: string, tube: string, core: string, on: boolean) => {
  ctx.save();
  ctx.font = font; ctx.textAlign = 'center';
  const ring = (r: number, c: string) => { ctx.fillStyle = c; for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [-r, -r], [r, -r], [-r, r], [r, r]]) ctx.fillText(text, x + dx, y + dy); };
  if (on) {
    ctx.globalAlpha = 0.16; ring(4, tube);
    ctx.globalAlpha = 0.3; ring(2, tube);
    ctx.globalAlpha = 1; ring(1, dark(tube, 0.35));
    ctx.fillStyle = core; ctx.fillText(text, x, y);
  } else {
    ring(1, INK);
    ctx.fillStyle = dark(tube, 0.55); ctx.fillText(text, x, y);
  }
  ctx.restore();
};

/** A strip of neon tube (x, y, w, h), lit: a stepped halo round it, the tube, a hot line down it. */
export const neonStrip = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, glow = 1) => {
  const vert = h > w;
  ctx.save();
  ctx.fillStyle = c;
  for (const [g, a] of [[8, 0.07], [4, 0.14], [2, 0.26]]) { ctx.globalAlpha = a * glow; ctx.fillRect(x - (vert ? g : 0), y - (vert ? 0 : g), w + (vert ? g * 2 : 0), h + (vert ? 0 : g * 2)); }
  ctx.restore();
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(c, 0.6);
  if (vert) ctx.fillRect(x + Math.floor(w / 2), y, 1, h); else ctx.fillRect(x, y + Math.floor(h / 2), w, 1);
};

/** A glowing crack (lava in a seam of rock): the points stepped out in 2px cells, a dim halo cell either side. */
export const crackLine = (ctx: Ctx, pts: [number, number][], c: string, halo?: string) => {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / 2));
    for (let k = 0; k < n; k++) {
      const x = snap(x0 + ((x1 - x0) * k) / n), y = snap(y0 + ((y1 - y0) * k) / n);
      if (halo) { ctx.fillStyle = halo; ctx.fillRect(x - 2, y, 6, 2); }
      ctx.fillStyle = c; ctx.fillRect(x, y, 2, 2);
    }
  }
};

/**
 * A glass column lit from inside (a lava lamp): clipped to `path`, the colour in vertical bands across (x..x+w) from
 * `tones` (edge, ..., middle), dithered at each seam, a glint down the left; then its ink line.
 */
export const glassColumn = (ctx: Ctx, path: () => void, x: number, y: number, w: number, h: number, tones: string[]) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  const n = 9, bw = w / n;
  for (let i = 0; i < n; i++) {
    const t = 1 - Math.abs((i + 0.5) / n * 2 - 1);
    ctx.fillStyle = ramp(tones, t); ctx.fillRect(Math.floor(x + i * bw), y, Math.ceil(bw) + 1, h);
    if (i > 0) checker(ctx, Math.floor(x + i * bw) - 2, y, 2, h, ramp(tones, 1 - Math.abs((i - 0.5) / n * 2 - 1)));
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(Math.floor(x + bw * 1.5), y, 2, h);
  checker(ctx, Math.floor(x + bw * 1.5) + 2, y, 2, h, 'rgba(255,255,255,0.25)');
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
};

/** A blob in a lava lamp: its colour, a lit cap, the shadow under it. */
const lampBlob = (ctx: Ctx, x: number, y: number, rw: number, rh: number, c: string) => {
  pixelBlob(ctx, x, y + 2, rw, rh, dark(c, 0.3));
  pixelBlob(ctx, x, y, rw, rh, c);
  pixelBlob(ctx, x - rw * 0.25, y - rh * 0.35, rw * 0.45, rh * 0.35, lite(c, 0.55));
};

/**
 * A lit window into the party (the club's, the VIP lounge's): the gold frame, the glass in bands, silhouettes
 * dancing past behind it, a glint on the glass; `label` over it.
 */
export const drawPartyWindow = (ctx: Ctx, wx: number, wy: number, f: number, label: string) => {
  const x = wx - 10, y = wy - 60, w = 60, h = 120;
  bandedGradient(ctx, x, y, w, h, ['#9333EA', '#A855F7', '#C026D3', '#DB2777', '#EC4899'], 6);
  // (the dance floor's lights, sweeping behind them)
  const sweep = Math.floor(f / 15) % 3;
  ctx.fillStyle = ['rgba(34,211,238,0.3)', 'rgba(250,204,21,0.3)', 'rgba(255,255,255,0.25)'][sweep];
  ctx.fillRect(x + 6 + sweep * 16, y, 10, h);
  for (let i = 0; i < 2; i++) {
    const sx = snap(wx + 5 + ((f * 0.4 + i * 30) % 40));
    ctx.fillStyle = 'rgba(20, 6, 30, 0.72)';
    ctx.fillRect(sx, wy - 20, 10, 60); ctx.fillRect(sx - 2, wy - 16, 14, 12);
    ctx.fillRect(sx + 1, wy - 32, 8, 12); ctx.fillRect(sx + 2, wy - 34, 6, 2);
    // (an arm up)
    ctx.fillRect(sx + (i ? 10 : -4), wy - 40 + (Math.floor(f / 15 + i) % 2) * 6, 4, 22);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 6 + k * 2, y + 20 - k * 2, 2, 2);
  // The frame: gold, lit along the top and left, an ink line round it
  ctx.fillStyle = '#A16207'; ctx.fillRect(x - 4, y - 4, w + 8, 4); ctx.fillRect(x - 4, y + h, w + 8, 4); ctx.fillRect(x - 4, y, 4, h); ctx.fillRect(x + w, y, 4, h);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(x - 4, y - 4, w + 8, 2); ctx.fillRect(x - 4, y - 4, 2, h + 8);
  ctx.fillStyle = '#713F12'; ctx.fillRect(x - 4, y + h + 2, w + 8, 2); ctx.fillRect(x + w + 2, y - 4, 2, h + 8);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(x - 4.5, y - 4.5, w + 9, h + 9); ctx.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
  // (and a mullion down the middle)
  ctx.fillStyle = '#A16207'; ctx.fillRect(x + w / 2 - 1, y, 3, h); ctx.fillStyle = INK; ctx.fillRect(x + w / 2 + 2, y, 1, h);
  letter(ctx, label, wx + 20, wy - 70, 'bold 8px "Press Start 2P"', '#FDE68A', '#713F12');
};

// ---------------------------------------------------------------------------
// Behind everything (screen space): the club's far wall, the waterfall, the lasers
// ---------------------------------------------------------------------------

export const drawClubBackdrop = (ctx: Ctx, state: GameState) => {
  const f = state.frame, camX = state.camera.x;
  bandedGradient(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, ['#0B0508', '#14050C', '#1E0610', '#2C080D', '#3B0A0A'], 12);
  // Far obsidian panels, veined with lava: polished slabs, a lit lip down the left, the shade down the right
  for (let i = 0; i < 9; i++) {
    const x = snap(((i * 150 - camX * 0.15) % 1350 + 1350) % 1350 - 150);
    const c = i % 2 ? '#120609' : '#170810';
    ctx.fillStyle = c; ctx.fillRect(x, 0, 140, CANVAS_HEIGHT);
    ctx.fillStyle = lite(c, 0.12); ctx.fillRect(x, 0, 2, CANVAS_HEIGHT); checker(ctx, x + 2, 0, 4, CANVAS_HEIGHT, lite(c, 0.06));
    ctx.fillStyle = '#07030A'; ctx.fillRect(x + 136, 0, 4, CANVAS_HEIGHT); checker(ctx, x + 130, 0, 6, CANVAS_HEIGHT, '#07030A');
    // (the joints between the slabs, and a sheen on each)
    for (let y = (i * 70) % 180; y < CANVAS_HEIGHT; y += 180) { ctx.fillStyle = '#07030A'; ctx.fillRect(x, y, 140, 2); ctx.fillStyle = lite(c, 0.1); ctx.fillRect(x + 2, y + 2, 136, 1); }
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x + 14, 0, 6, CANVAS_HEIGHT);
    const pts: [number, number][] = [[x + 20 + hash(i) * 60, 0]];
    for (let y = 0; y < CANVAS_HEIGHT; y += 60) pts.push([x + 20 + hash(i * 7 + y) * 100, y]);
    const a = 0.3 + 0.15 * Math.sin(f * 0.05 + i);
    crackLine(ctx, pts, `rgba(249, 115, 22, ${(a + 0.2).toFixed(2)})`, `rgba(249, 115, 22, ${(a * 0.3).toFixed(2)})`);
  }
  // A magma waterfall down the back wall, pouring into a glowing pool (far off, parallax): banded across, hot in the
  // middle, its edges crusting; streaks of brighter stuff riding down it
  const wx = snap(((600 - camX * 0.2) % 1600 + 1600) % 1600 - 200), wh = CANVAS_HEIGHT - 120;
  const FALL = ['#450A0A', '#7C2D12', '#C2410C', '#F97316', '#FDBA74', '#FEF08A'];
  for (let i = 0; i < 9; i++) {
    const t = 1 - Math.abs((i + 0.5) / 9 * 2 - 1);
    ctx.fillStyle = ramp(FALL, 0.12 + t * 0.85); ctx.fillRect(wx + i * 10, 0, 10, wh);
    if (i) checker(ctx, wx + i * 10 - 2, 0, 2, wh, ramp(FALL, 0.12 + (1 - Math.abs((i - 0.5) / 9 * 2 - 1)) * 0.85), f % 4 < 2 ? 0 : 1);
  }
  ctx.fillStyle = 'rgba(254, 249, 195, 0.5)';
  for (let k = 0; k < 6; k++) { const y = snap((f * 3 + k * 90) % wh); ctx.fillRect(wx + 10 + (k % 3) * 25, y, 8, 30); ctx.fillRect(wx + 12 + (k % 3) * 25, y + 30, 4, 8); }
  ctx.fillStyle = INK; ctx.fillRect(wx - 2, 0, 2, wh); ctx.fillRect(wx + 90, 0, 2, wh);
  // (the pool: rings of light, flat, stepped)
  for (const [rw, rh, a] of [[110, 20, 0.12], [80, 14, 0.2], [50, 9, 0.32], [26, 5, 0.5]] as [number, number, number][]) pixelBlob(ctx, wx + 45, wh, rw, rh, `rgba(249, 115, 22, ${a})`);
  ctx.fillStyle = 'rgba(254, 240, 138, 0.6)'; ctx.fillRect(wx + 6, wh - 2, 78, 2);
  // Lasers sweeping from the rig up top, colors changing on the beat
  const col = NEON[Math.floor(f / BEAT) % NEON.length];
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 2 + Math.sin(f * 0.02 + k * 1.6) * 0.8;
    ctx.save(); ctx.globalAlpha = 0.28; ctx.strokeStyle = col; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(200 + k * 140, 0); ctx.lineTo(200 + k * 140 + Math.cos(a) * 900, Math.sin(a) * 900); ctx.stroke(); ctx.restore();
  }
  // Embers and smoke drifting
  for (let i = 0; i < 26; i++) {
    const x = (hash(i) * CANVAS_WIDTH + Math.sin(f * 0.02 + i) * 20 - camX * 0.25 + 4000) % CANVAS_WIDTH;
    const y = CANVAS_HEIGHT - ((f * (0.4 + hash(i + 2)) + hash(i + 4) * CANVAS_HEIGHT) % CANVAS_HEIGHT);
    ctx.fillStyle = i % 3 ? '#F97316' : '#F472B6'; ctx.fillRect(x, y, 2, 2);
  }
};

// ---------------------------------------------------------------------------
// The world, behind what moves
// ---------------------------------------------------------------------------

export const drawClubBack = (ctx: Ctx, state: GameState) => {
  const F = COURSE.floor, A = COURSE.atrium, f = state.frame;
  if (visible(state, F.x1, F.x2)) {
    // The club's name up on the wall, in neon, buzzing
    for (let x = F.x1 + 300; x < F.x2 - 300; x += 1200) {
      if (!visible(state, x - 200, x + 200)) continue;
      const on = hash(Math.floor(f / 7) + x) > 0.04;
      neonText(ctx, 'CLUB CALDERA', x, Y - 300, 'bold 26px "Press Start 2P"', '#FB923C', '#FED7AA', on);
    }
    // Lava lamps as tall as pillars, blobs rising and sinking in them: a chrome foot and cap, the glass lit from inside
    for (let x = F.x1 + 560; x < F.x2 - 100; x += 700) {
      if (!visible(state, x - 60, x + 60)) continue;
      steppedGlow(ctx, x, Y - 180, 120, '#F43F5E', 0.12, 0.03, 4);
      const glass = () => { ctx.moveTo(x - 16, Y - 310); ctx.lineTo(x + 16, Y - 310); ctx.lineTo(x + 24, Y - 40); ctx.lineTo(x - 24, Y - 40); ctx.closePath(); };
      glassColumn(ctx, glass, x - 24, Y - 310, 48, 270, ['#4C0519', '#9F1239', '#E11D48', '#FB7185']);
      ctx.save(); ctx.beginPath(); glass(); ctx.clip();
      for (let k = 0; k < 4; k++) { const ph = (((f * 0.4 + k * 70 + x) % 260 + 260) % 260) / 260, by = Y - 50 - Math.sin(ph * Math.PI) * 240; lampBlob(ctx, x + Math.sin(k + f * 0.01) * 6, by, 9 + k * 2, 12 + (k % 2) * 6, '#FDE047'); }
      ctx.restore();
      ctx.beginPath(); glass(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
      // (the foot, flared; the cap)
      column(ctx, x - 26, Y - 40, 52, 40, '#3F3A44');
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 25, Y - 39, 50, 2); ctx.fillStyle = INK; ctx.fillRect(x - 26, Y - 24, 52, 1);
      column(ctx, x - 20, Y - 330, 40, 20, '#3F3A44');
      ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x - 19, Y - 329, 38, 2);
    }
  }
  drawFloors(ctx, state);
  drawSolids(ctx, state);
  if (visible(state, F.x1 - 300, F.x1 + 60)) drawFloorEndWall(ctx, state);
  if (visible(state, A.x1 - 400, A.x2 + 100)) drawAtrium(ctx, state);
};

/** The club floor's left-hand end: the obsidian wall he came in through, the service door (EMPLOYEES ONLY), an exit
 * sign glowing over it, lava veins and a neon strip up its edge. */
const drawFloorEndWall = (ctx: Ctx, state: GameState) => {
  const f = state.frame, x2 = COURSE.floor.x1 + 60, x1 = x2 - 360, top = state.camera.y - 40, bottom = state.camera.y + CANVAS_HEIGHT + 40;
  bandedGradient(ctx, x1, top, x2 - x1, bottom - top, ['#0C0708', '#170A0D', '#1F0B0E'], 8);
  // (panels, and lava in the seams)
  ctx.fillStyle = '#0A0506'; for (let y = Math.floor(top / 120) * 120; y < bottom; y += 120) ctx.fillRect(x1, y, x2 - x1, 4);
  ctx.strokeStyle = `rgba(249, 115, 22, ${0.35 + 0.15 * Math.sin(f * 0.05)})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x2 - 120, top); for (let y = top; y < bottom; y += 50) ctx.lineTo(x2 - 140 + hash(y * 3) * 60, y); ctx.stroke();
  // (its edge: a lit lip, the neon strip up it)
  ctx.fillStyle = '#3F3A36'; ctx.fillRect(x2 - 8, top, 8, bottom - top);
  const col = NEON[Math.floor(f / BEAT) % NEON.length];
  ctx.fillStyle = col; ctx.fillRect(x2 - 5, top, 2, Y - top);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.fillRect(x2 - 14, top, 20, Y - top); ctx.restore();
  // The service door he came in by, the exit sign over it
  const dx = x2 - 46;
  ctx.fillStyle = '#292524'; ctx.fillRect(dx - 34, Y - 120, 68, 120);
  ctx.fillStyle = '#57534E'; ctx.fillRect(dx - 30, Y - 116, 60, 116);
  ctx.fillStyle = '#44403C'; ctx.fillRect(dx - 30, Y - 70, 60, 3); ctx.fillRect(dx + 18, Y - 64, 10, 4);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(dx - 22, Y - 100, 44, 12);
  ctx.fillStyle = '#1C1917'; ctx.font = '5px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('EMPLOYEES', dx, Y - 95); ctx.fillText('ONLY', dx, Y - 89);
  ctx.fillStyle = '#14532D'; ctx.fillRect(dx - 20, Y - 146, 40, 16);
  ctx.fillStyle = '#4ADE80'; ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillText('EXIT', dx, Y - 134); ctx.textAlign = 'left';
  ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#4ADE80'; ctx.fillRect(dx - 40, Y - 156, 80, 40); ctx.restore();
};

/** The dance floor (and every floor in here): glass tiles over lava, lit from under, pulsing to the beat. */
const drawFloors = (ctx: Ctx, state: GameState) => {
  const f = state.frame, bottom = state.camera.y + CANVAS_HEIGHT + 40, k = beatK(f);
  for (const r of state.groundRuns) {
    if (r.surface !== 'clubfloor' || !visible(state, r.x1, r.x2)) continue;
    const x1 = Math.max(r.x1, state.camera.x - 220), x2 = Math.min(r.x2, state.camera.x + CANVAS_WIDTH + 220);
    // The lava under the glass, in bands going down into the dark
    bandedGradient(ctx, x1, Y, x2 - x1, 90, ['#FB923C', '#EA580C', '#B91C1C', '#7F1D1D', '#2A0505'], 9);
    ctx.fillStyle = '#2A0505'; ctx.fillRect(x1, Y + 90, x2 - x1, Math.max(0, bottom - Y - 90));
    // The tiles over it: dark glass, some lit up on the beat in a moving pattern (lit, in steps in to a hot middle)
    for (let x = Math.floor(x1 / 48) * 48; x < x2; x += 48) {
      const lit = (Math.floor(x / 48) + Math.floor(f / BEAT)) % 4 === 0;
      if (lit) {
        ctx.fillStyle = `rgba(253, 186, 116, ${(0.35 + k * 0.35).toFixed(2)})`; ctx.fillRect(x + 1, Y, 46, 22);
        ctx.fillStyle = `rgba(254, 243, 199, ${(0.3 + k * 0.4).toFixed(2)})`; ctx.fillRect(x + 7, Y + 4, 34, 14);
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.25 + k * 0.4).toFixed(2)})`; ctx.fillRect(x + 15, Y + 8, 18, 6);
      } else {
        ctx.fillStyle = 'rgba(20, 6, 6, 0.72)'; ctx.fillRect(x + 1, Y, 46, 22);
        // (the lava's light showing up through the bottom of it)
        checker(ctx, x + 1, Y + 18, 46, 4, 'rgba(234, 88, 12, 0.35)');
      }
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + 1, Y, 46, 2); ctx.fillRect(x + 1, Y + 2, 2, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + 4, Y + 4, 4, 2); ctx.fillRect(x + 4, Y + 6, 2, 2);
      ctx.fillStyle = INK; ctx.fillRect(x, Y, 1, 22); ctx.fillRect(x + 47, Y, 1, 22);
    }
    ctx.fillStyle = INK; ctx.fillRect(x1, Y + 21, x2 - x1, 1);
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(x1, Y + 22, x2 - x1, 6);
    ctx.fillStyle = '#44403C'; ctx.fillRect(x1, Y + 22, x2 - x1, 1);
  }
};

/** The bar (obsidian, glowing bottles along the back of it, stools) and the speaker stacks. */
const drawSolids = (ctx: Ctx, state: GameState) => {
  const f = state.frame, k = beatK(f);
  for (const s of COURSE.solids) {
    if (!visible(state, s.x, s.x + s.w)) continue;
    if (s.look === 'bar') {
      // Shelves of bottles behind it, backlit: a mirror behind them in bands, shelf boards, every bottle inked
      slab(ctx, s.x - 10, s.y - 150, s.w + 20, 110, '#1C1917');
      bandedGradient(ctx, s.x - 6, s.y - 146, s.w + 12, 102, ['#3B0A2A', '#2A0A20', '#1C0A16'], 4);
      for (let row = 0; row < 3; row++) {
        for (let bx = s.x; bx < s.x + s.w; bx += 14) {
          const c = NEON[((Math.floor(bx / 14) + row) % 4 + 4) % 4], by = s.y - 140 + row * 34;
          ctx.fillStyle = INK; ctx.fillRect(bx + 1, by - 1, 8, 24); ctx.fillRect(bx + 2, by - 7, 6, 7);
          ctx.fillStyle = dark(c, 0.15); ctx.fillRect(bx + 2, by, 6, 22); ctx.fillRect(bx + 3, by - 6, 4, 6);
          ctx.fillStyle = lite(c, 0.4); ctx.fillRect(bx + 3, by + 2, 1, 16);
          ctx.fillStyle = dark(c, 0.45); ctx.fillRect(bx + 7, by, 1, 22);
          ctx.fillStyle = '#F5F5F4'; ctx.fillRect(bx + 3, by + 9, 4, 5); // (the label)
        }
        pipe(ctx, s.x - 6, s.y - 140 + row * 34 + 22, s.w + 12, 4, '#57534E');
      }
      // The counter: obsidian, a lit edge, a lava stripe down the front glowing on the beat
      slab(ctx, s.x, s.y, s.w, s.h, '#1A1414');
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(s.x + 10, s.y + 6, 8, s.h - 8);
      slab(ctx, s.x - 6, s.y, s.w + 12, 6, '#57534E', 1);
      ctx.fillStyle = `rgba(249, 115, 22, ${(0.12 + k * 0.12).toFixed(2)})`; ctx.fillRect(s.x + 2, s.y + 16, s.w - 4, 12);
      ctx.fillStyle = `rgba(249, 115, 22, ${(0.6 + k * 0.4).toFixed(2)})`; ctx.fillRect(s.x + 2, s.y + 20, s.w - 4, 4);
      ctx.fillStyle = '#FEF08A'; ctx.fillRect(s.x + 2, s.y + 21, s.w - 4, 1);
      // (stools: a chrome post, a red seat)
      for (const sx of [s.x - 30, s.x + s.w + 10]) { column(ctx, sx + 8, s.y + 20, 6, s.h - 20, '#A1A1AA'); slab(ctx, sx, s.y + 15, 22, 6, '#B91C1C', 1); ctx.fillStyle = '#71717A'; ctx.fillRect(sx + 4, s.y + s.h - 2, 14, 2); }
    } else {
      // Speakers stacked: cabinets (inked, lit along the top and left), cones thumping on the beat
      for (let y = s.y; y < s.y + s.h; y += 30) {
        slab(ctx, s.x, y, s.w, 29, '#1F1F23', 1);
        ctx.fillStyle = '#52525B'; for (const [sx, sy] of [[3, 3], [s.w - 5, 3], [3, 24], [s.w - 5, 24]]) ctx.fillRect(s.x + sx, y + sy, 2, 2);
        const r = 10 + k * 2;
        for (const cx of [s.x + s.w * 0.3, s.x + s.w * 0.72]) {
          ink(ctx, () => ctx.arc(cx, y + 15, r + 1, 0, Math.PI * 2), '#18181B');
          ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.arc(cx, y + 15, r - 1, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#52525B'; ctx.beginPath(); ctx.arc(cx, y + 15, r - 1, Math.PI * 0.9, Math.PI * 1.6); ctx.lineTo(cx, y + 15); ctx.fill();
          ctx.fillStyle = '#27272A'; ctx.beginPath(); ctx.arc(cx, y + 15, r - 1, Math.PI * 0.1, Math.PI * 0.6); ctx.lineTo(cx, y + 15); ctx.fill();
          ink(ctx, () => ctx.arc(cx, y + 15, r * 0.4, 0, Math.PI * 2), '#0A0A0A');
          ctx.fillStyle = '#A1A1AA'; ctx.fillRect(Math.round(cx - r * 0.5), y + 15 - Math.round(r * 0.55), 2, 2);
        }
      }
      neonStrip(ctx, s.x, s.y, s.w, 2, '#FB923C', 0.6);
    }
  }
};

/** The atrium: glossy black walls with neon run up them, a lava lamp the height of it, the staircase at its foot. */
const drawAtrium = (ctx: Ctx, state: GameState) => {
  const A = COURSE.atrium, f = state.frame;
  const top = Math.max(A.top - 520, state.camera.y - 20), bottom = Math.min(A.floor, state.camera.y + CANVAS_HEIGHT + 20); // (down to the floor: the floor under it is drawn, not covered)
  // The back wall: glossy black panels, lit toward the middle in bands, the joints between them inked
  const BACK = ['#0B0710', '#100A17', '#150B1E'], aw = A.x2 - A.x1;
  for (let i = 0; i < 8; i++) {
    const t = 1 - Math.abs((i + 0.5) / 8 * 2 - 1), bx = snap(A.x1 + (aw * i) / 8);
    ctx.fillStyle = ramp(BACK, t); ctx.fillRect(bx, top, snap(aw / 8) + 2, bottom - top);
    if (i) checker(ctx, bx - 2, top, 2, bottom - top, ramp(BACK, 1 - Math.abs((i - 0.5) / 8 * 2 - 1)));
  }
  for (let y = Math.floor(top / 140) * 140; y < bottom; y += 140) { ctx.fillStyle = '#050308'; ctx.fillRect(A.x1, y, aw, 2); ctx.fillStyle = '#221830'; ctx.fillRect(A.x1, y + 2, aw, 1); }
  // The lava lamp, the height of the whole thing: a glass column, blobs rising in it, brass collars up it
  const lx = A.x1 + aw / 2 - 30;
  steppedGlow(ctx, lx + 30, (top + bottom) / 2, 150, '#EA580C', 0.1, 0.03, 4);
  glassColumn(ctx, () => ctx.rect(lx, top - 4, 60, bottom - top + 4), lx, top - 4, 60, bottom - top + 4, ['#5B210C', '#7C2D12', '#C2410C', '#EA580C']);
  ctx.save(); ctx.beginPath(); ctx.rect(lx, top, 60, bottom - top); ctx.clip();
  for (let y = Math.floor(top / 140) * 140; y < bottom; y += 140) {
    const by = y - ((f * 0.8) % 140);
    lampBlob(ctx, lx + 30 + Math.sin(y * 0.01 + f * 0.02) * 10, by, 16, 24, '#FDBA74');
  }
  ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(lx - 1, top, 2, bottom - top); ctx.fillRect(lx + 59, top, 2, bottom - top);
  for (let y = Math.floor(top / 280) * 280 + 200; y < bottom; y += 280) slab(ctx, lx - 4, y, 68, 8, '#A16207', 1);
  // Neon strips up the back wall, cycling on the beat
  for (let i = 0; i < 4; i++) {
    const x = snap(A.x1 + 60 + i * ((A.x2 - A.x1 - 120) / 3));
    if (Math.abs(x - lx - 30) < 60) continue;
    neonStrip(ctx, x - 1, top, 3, bottom - top, NEON[(i + Math.floor(f / BEAT)) % 4], 0.8);
  }
  // The side walls: glossy black, a sheen down them in steps, a neon edge
  for (const [x, edge] of [[A.x1 - 60, A.x1 - 2], [A.x2, A.x2 + 2]] as [number, number][]) {
    ctx.fillStyle = '#09070C'; ctx.fillRect(x, top, 60, bottom - top);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x + 8, top, 6, bottom - top);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 16, top, 2, bottom - top);
    checker(ctx, x + 4, top, 4, bottom - top, 'rgba(255,255,255,0.04)');
    neonStrip(ctx, edge - 1, top, 2, bottom - top, '#F472B6', 0.7);
  }
  // The way in from the floor under the left wall stays open
  ctx.fillStyle = '#150B1E'; ctx.fillRect(A.x1 - 60, A.floor - 170, 60, 170);
  // At the foot of it: the stairwell down to the front door (the club floor's up here; the door's down at the foot of
  // the volcano). Cut away under the floor: the stairs going down, a handrail, the door at the bottom; a steel grate over
  // the top of them in the floor, and an EXIT sign on the wall pointing down. Just there to be seen: he can't take it
  const sx = A.x1 + 40, sw = 300, sy = A.floor;
  if (sy > state.camera.y - 300 && sy - 200 < state.camera.y + CANVAS_HEIGHT) {
    const bot = state.camera.y + CANVAS_HEIGHT + 40;
    // The stairwell: bare concrete in courses, lit by a caged bulb
    ctx.fillStyle = '#110E15'; ctx.fillRect(sx, sy, sw, bot - sy);
    ctx.fillStyle = concrete(ctx); ctx.fillRect(sx, sy, sw, bot - sy);
    steppedGlow(ctx, sx + 40, sy + 40, 80, '#FDE68A', 0.16, 0.04, 4);
    ctx.fillStyle = INK; ctx.fillRect(sx + 34, sy + 22, 12, 18);
    ctx.fillStyle = '#FDE68A'; ctx.fillRect(sx + 36, sy + 30, 8, 8); ctx.fillStyle = '#FFFBEB'; ctx.fillRect(sx + 37, sy + 31, 3, 3);
    ctx.fillStyle = '#57534E'; ctx.fillRect(sx + 36, sy + 24, 8, 4); ctx.fillRect(sx + 39, sy + 28, 2, 10);
    // The steps, down to the right: a lit nosing on each, the riser in shadow, inked
    const n = 11, rise = 22, run = 24;
    for (let k = 0; k < n; k++) {
      const x = sx + 10 + k * run, y = sy + 30 + k * rise;
      ctx.fillStyle = '#57505F'; ctx.fillRect(x, y, sw - 10 - k * run, bot - y);
      ctx.fillStyle = '#A59DB0'; ctx.fillRect(x, y, run, 4);
      ctx.fillStyle = '#C9C2D3'; ctx.fillRect(x, y, run, 1);
      ctx.fillStyle = '#3A3441'; ctx.fillRect(x, y + 4, 3, rise - 4);
      ctx.fillStyle = INK; ctx.fillRect(x, y - 1, run, 1); ctx.fillRect(x - 1, y - 1, 1, rise + 1); ctx.fillRect(x, y + 4, run, 1);
    }
    // The handrail, following them down, on posts
    ctx.fillStyle = '#A1A1AA';
    for (let k = 0; k < n; k += 2) { ctx.fillStyle = INK; ctx.fillRect(sx + 19 + k * run, sy - 6 + k * rise, 4, 36); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(sx + 20 + k * run, sy - 6 + k * rise, 2, 36); }
    limb(ctx, sx + 10, sy - 6, sx + 10 + n * run, sy - 6 + n * rise, 3, '#D4D4D8');
    // The front door at the bottom
    const dx = sx + 10 + n * run - 30, dy = sy + 30 + n * rise;
    slab(ctx, dx, dy - 110, 60, 110, '#1C1917');
    slab(ctx, dx + 6, dy - 104, 48, 104, '#44403C');
    ctx.fillStyle = '#A1A1AA'; ctx.fillRect(dx + 44, dy - 58, 6, 3); ctx.fillStyle = INK; ctx.fillRect(dx + 44, dy - 55, 6, 1);
    // The grate over the top of it (the floor he's standing on)
    ctx.fillStyle = 'rgba(12, 10, 9, 0.35)'; ctx.fillRect(sx, sy, sw, 22);
    pipe(ctx, sx, sy, sw, 3, '#71717A'); pipe(ctx, sx, sy + 19, sw, 3, '#71717A');
    for (let x = sx; x <= sx + sw; x += 12) { ctx.fillStyle = INK; ctx.fillRect(x - 1, sy + 3, 4, 16); ctx.fillStyle = '#71717A'; ctx.fillRect(x, sy + 3, 2, 16); ctx.fillStyle = '#A1A1AA'; ctx.fillRect(x, sy + 3, 1, 16); }
    // The EXIT sign on the wall over it, an arrow pointing down
    const ex = sx + sw / 2 - 40, ey = sy - 150;
    steppedGlow(ctx, ex + 40, ey + 11, 56, '#4ADE80', 0.14, 0.03, 3);
    slab(ctx, ex, ey, 80, 22, '#16A34A');
    ctx.fillStyle = '#14532D'; ctx.font = 'bold 9px "Press Start 2P"'; ctx.textAlign = 'left'; ctx.fillText('EXIT', ex + 9, ey + 16);
    ctx.fillStyle = '#F0FDF4'; ctx.fillText('EXIT', ex + 8, ey + 15);
    ink(ctx, () => { ctx.moveTo(ex + 58, ey + 5); ctx.lineTo(ex + 66, ey + 5); ctx.lineTo(ex + 66, ey + 11); ctx.lineTo(ex + 71, ey + 11); ctx.lineTo(ex + 62, ey + 19); ctx.lineTo(ex + 53, ey + 11); ctx.lineTo(ex + 58, ey + 11); ctx.closePath(); }, '#F0FDF4');
  }
  // The window at the top of the right wall: the VIP lounge, its party going on behind the glass
  const w = A.window;
  if (w.y > state.camera.y - 200 && w.y < state.camera.y + CANVAS_HEIGHT + 200) drawPartyWindow(ctx, w.x, w.y, f, 'VIP');
};

/** A chain hanging (4 wide): links end-on and side-on in turn, inked, lit down the left. */
const chain = (ctx: Ctx) => tilePattern(ctx, 'victor-chain', 4, 10, g => {
  g.fillStyle = INK; g.fillRect(0, 0, 4, 6); g.fillRect(1, 6, 2, 4);
  g.fillStyle = '#A8A29E'; g.fillRect(1, 1, 2, 4); g.fillStyle = '#D6D3D1'; g.fillRect(1, 1, 1, 2);
  g.fillStyle = '#78716C'; g.fillRect(1, 6, 2, 4);
});

/** Poured concrete in lifts: faint joints, a lit lip under each. */
const concrete = (ctx: Ctx) => tilePattern(ctx, 'victor-concrete', 64, 32, g => {
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 30, 64, 2); g.fillRect(40, 0, 2, 30);
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(0, 0, 64, 1); g.fillRect(42, 0, 1, 30);
  g.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 6; i++) g.fillRect((i * 23) % 60, (i * 13) % 28, 2, 2);
});

// ---------------------------------------------------------------------------
// Over the terrain: the club's ledges, and its pyro and disco rigs
// ---------------------------------------------------------------------------

/** A ledge of the club's (a neon catwalk, a go-go cage, the DJ booth): true if it was one of those (drawn here). */
export const drawClubLedge = (ctx: Ctx, l: Ledge, f: number) => {
  const k = beatK(f);
  if (l.look === 'neon') {
    const col = NEON[((Math.floor(l.x / 97) + Math.floor(f / BEAT)) % 4 + 4) % 4];
    // Brushed steel (bright against the black walls), a neon strip along the top, lit underneath
    ctx.fillStyle = col; ctx.globalAlpha = 0.2 + k * 0.2; ctx.fillRect(l.x + 4, l.y + 10, l.w - 8, 6); ctx.globalAlpha = 1;
    pipe(ctx, l.x, l.y, l.w, 10, '#A1A1AA');
    ctx.fillStyle = '#E4E4E7'; ctx.fillRect(l.x, l.y + 3, l.w, 1);
    for (let x = l.x + 12; x < l.x + l.w - 6; x += 24) { ctx.fillStyle = '#3F3F46'; ctx.fillRect(x, l.y + 5, 2, 2); ctx.fillStyle = '#F4F4F5'; ctx.fillRect(x, l.y + 4, 1, 1); }
    ctx.fillStyle = INK; ctx.fillRect(l.x, l.y, 1, 10); ctx.fillRect(l.x + l.w - 1, l.y, 1, 10);
    neonStrip(ctx, l.x, l.y, l.w, 3, col, 0.5 + k * 0.5);
    ctx.fillStyle = col; ctx.globalAlpha = 0.45 + k * 0.3; ctx.fillRect(l.x + 4, l.y + 10, l.w - 8, 2); ctx.globalAlpha = 1;
    column(ctx, l.x + 10, l.y + 10, 4, 16, '#71717A'); column(ctx, l.x + l.w - 14, l.y + 10, 4, 16, '#71717A');
    return true;
  }
  if (l.look === 'cage') {
    // A go-go cage on a chain from the ceiling: its floor's the ledge
    const cx = Math.round(l.x + l.w / 2);
    ctx.fillStyle = chain(ctx); ctx.fillRect(cx - 2, -3000, 4, l.y - 90 + 3000);
    // (the bars, gold, inked; the ring at the top)
    for (let x = l.x; x <= l.x + l.w; x += l.w / 5) {
      const tx = l.x + l.w / 2 + (x - l.x - l.w / 2) * 0.6;
      ctx.lineCap = 'butt';
      ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, l.y); ctx.lineTo(tx, l.y - 90); ctx.stroke();
      ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, l.y); ctx.lineTo(tx, l.y - 90); ctx.stroke();
      ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 0.5, l.y); ctx.lineTo(tx - 0.5, l.y - 90); ctx.stroke();
    }
    slab(ctx, l.x + l.w * 0.2 - 2, l.y - 94, l.w * 0.6 + 4, 6, '#D4AF37', 1);
    slab(ctx, l.x - 2, l.y, l.w + 4, 7, '#D4AF37', 1);
    neonStrip(ctx, l.x, l.y + 7, l.w, 2, '#F472B6', 0.5 + k * 0.5);
    return true;
  }
  if (l.look === 'booth') {
    // The DJ booth: the decks on top (the platters spinning), a lit front
    slab(ctx, l.x, l.y, l.w, Y - l.y, '#18181B');
    ctx.fillStyle = '#0C0C0E'; ctx.fillRect(l.x + 8, l.y + 22, l.w - 16, 26); ctx.fillStyle = INK; ctx.fillRect(l.x + 8, l.y + 22, l.w - 16, 1);
    neonText(ctx, 'DJ MAGMA', l.x + l.w / 2, l.y + 40, 'bold 10px "Press Start 2P"', '#FB923C', '#FED7AA', true);
    neonStrip(ctx, l.x + 2, l.y + 52, l.w - 4, 4, '#F97316', 0.4 + k * 0.6);
    // (the speaker grilles down the front)
    for (let gy = l.y + 64; gy < Y - 8; gy += 6) { ctx.fillStyle = '#0C0C0E'; ctx.fillRect(l.x + 10, gy, l.w - 20, 2); ctx.fillStyle = '#27272A'; ctx.fillRect(l.x + 10, gy + 2, l.w - 20, 1); }
    for (const dx of [30, l.w - 30]) {
      const px = l.x + dx;
      ink(ctx, () => ctx.ellipse(px, l.y - 2, 18, 5, 0, 0, Math.PI * 2), '#3F3F46');
      ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(px, l.y - 3, 14, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FB923C'; ctx.fillRect(px - 2, l.y - 4, 4, 2);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(Math.round(px + Math.cos(f * 0.3) * 12), Math.round(l.y - 3 + Math.sin(f * 0.3) * 3), 2, 2);
      ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px + 16, l.y - 8); ctx.lineTo(px + 6, l.y - 4); ctx.stroke();
    }
    pipe(ctx, l.x, l.y, l.w, 3, '#A1A1AA');
    return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// In front: the screaming
// ---------------------------------------------------------------------------

export const drawClubFront = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state);
  const y = rt?.club.yell;
  if (!y) return;
  const e = state.enemies.find(q => q.id === y.id);
  if (!e || e.health <= 0) return;
  const text = sentenceShown(y.text);
  ctx.save(); ctx.font = 'bold 8px "Press Start 2P"';
  const w = Math.min(420, ctx.measureText(text).width + 14), cx = e.pos.x + e.width / 2, by = e.pos.y - 30;
  ctx.fillStyle = '#FFF1F2'; ctx.strokeStyle = '#BE123C'; ctx.lineWidth = 2;
  ctx.fillRect(cx - w / 2, by - 20, w, 18); ctx.strokeRect(cx - w / 2, by - 20, w, 18);
  ctx.beginPath(); ctx.moveTo(cx - 5, by - 2); ctx.lineTo(cx + 5, by - 2); ctx.lineTo(cx, by + 6); ctx.fill();
  ctx.fillStyle = '#881337'; ctx.textAlign = 'center'; ctx.fillText(text, cx, by - 7, w - 8);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The HUD: the tally
// ---------------------------------------------------------------------------

export const drawInnocentsTally = (ctx: Ctx, state: GameState) => {
  const rt = getVictor(state);
  if (!rt || rt.club.killed <= 0 || rt.club.tallyGone || regionOf(state.player.pos.x) !== 'club') return;
  const n = rt.club.killed, since = state.frame - rt.club.killedAt;
  const jolt = since < 12 ? (1 - since / 12) : 0;
  const cx = CANVAS_WIDTH / 2, y = 64;
  ctx.save();
  ctx.translate(cx, y); ctx.scale(1 + jolt * 0.25, 1 + jolt * 0.25); ctx.rotate(Math.sin(since * 0.8) * 0.05 * jolt);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(-150, -26, 300, 58);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 3; ctx.strokeRect(-150, -26, 300, 58);
  ctx.textAlign = 'center';
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.fillText('INNOCENTS KILLED', 0, -8);
  ctx.font = 'bold 20px "Press Start 2P"'; ctx.fillStyle = jolt > 0 ? '#FFFFFF' : '#EF4444'; ctx.fillText(String(n), 0, 18);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillStyle = '#FDE047'; ctx.fillText(tallyTitle(n), 0, 30);
  ctx.restore();
};
