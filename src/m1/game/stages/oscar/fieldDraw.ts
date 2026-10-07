// The oil field, drawn: the dirt (caliche and dry scrub), the oil on it (a
// slick with its rainbow sheen, tar lying thick and bubbling), the pits of crude,
// the pipelines, and the field's furniture (pumpjacks nodding away, derricks,
// tanks, a flare stack burning, signs). And a lit slick burning.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left), no
// smooth gradients.

import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE, Prop } from './course';
import type { Field } from './field';
import { burnLevel, jetOn, jetWarning } from './field';
import { bandedGradient, checker } from '../../render/pixelArt';
import { INK, ink, shaded } from '../../render/npc/kit';
import { slab, column, pipe, letter } from '../barry/rooms';
import { strut, sheen } from './kit';
import { drawFire } from '../../render/fx/fire';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const inView = (state: GameState, x1: number, x2: number, pad = 100) => x2 > state.camera.x - pad && x1 < state.camera.x + CANVAS_WIDTH + pad;

/** The dirt: packed caliche, a darker band under the top, scrub and stones along it. */
export const drawDirt = (ctx: Ctx, state: GameState, runs: GroundRun[] = COURSE.runs, view?: { x1: number; x2: number }) => {
  const bottom = state.camera.y + 1400;
  for (const r of runs) {
    if (view ? r.x2 < view.x1 - 100 || r.x1 > view.x2 + 100 : !inView(state, r.x1, r.x2)) continue;
    // (packed in layers: the pale crust, then the dirt going darker down, a flat band at a time, dithered one into the next)
    const top = Math.min(r.y1, r.y2);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.lineTo(r.x2, bottom); ctx.lineTo(r.x1, bottom); ctx.closePath(); ctx.clip();
    ctx.fillStyle = '#5B4128'; ctx.fillRect(r.x1, top, r.x2 - r.x1, bottom - top);
    bandedGradient(ctx, r.x1, top, r.x2 - r.x1, 170, ['#B08A5A', '#9A7449', '#8C6A42', '#7A5A38', '#6A4C30', '#5B4128'], 8);
    // (stones and caliche nodules through the layers, each lit on top)
    for (let x = Math.ceil(r.x1 / 16) * 16; x < r.x2; x += 16) {
      const h = hash(x * 1.7);
      if (h < 0.3) {
        const sx = x + Math.round(hash(x) * 10), sy = top + 30 + Math.round(h * 300);
        ctx.fillStyle = h < 0.15 ? '#C8A878' : '#6E5234'; ctx.fillRect(sx, sy, 4, 2);
        ctx.fillStyle = h < 0.15 ? '#E0C89A' : '#8A6A44'; ctx.fillRect(sx, sy - 1, 2, 1);
        ctx.fillStyle = 'rgba(40, 26, 14, 0.5)'; ctx.fillRect(sx + 1, sy + 2, 4, 1);
      }
    }
    checker(ctx, r.x1, top + 170, r.x2 - r.x1, 6, '#6A4C30');
    ctx.restore();
    // The top edge: a lighter crust (a darker line under it), stones, scrub
    ctx.strokeStyle = '#7A5A38'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 3.5); ctx.lineTo(r.x2, r.y2 + 3.5); ctx.stroke();
    ctx.strokeStyle = '#D2B48C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 1); ctx.lineTo(r.x2, r.y2 + 1); ctx.stroke();
    const len = r.x2 - r.x1;
    for (let x = Math.ceil(r.x1 / 23) * 23; x < r.x2; x += 23) {
      const y = Math.round(r.y1 + (r.y2 - r.y1) * ((x - r.x1) / len));
      const h = hash(x);
      if (h < 0.25) { const sy = Math.round(y + 4 + h * 20); ctx.fillStyle = '#7C6A4E'; ctx.fillRect(x, sy, 4, 3); ctx.fillStyle = '#A08C6A'; ctx.fillRect(x, sy, 3, 1); }
      else if (h > 0.86) {
        // A tuft of dry scrub: blades in steps, lit on the left, a shadow at its foot
        ctx.fillStyle = 'rgba(60, 40, 20, 0.45)'; ctx.fillRect(x - 6, y, 12, 2);
        for (let k = -2; k <= 2; k++) {
          const bh = 6 + (k === 0 ? 3 : 0) - Math.abs(k);
          ctx.fillStyle = k < 0 ? '#A8994E' : '#7A6C30';
          for (let s = 0; s < bh; s += 2) ctx.fillRect(x + Math.round((k * 3 * s) / bh) - 1, y - s - 2, 2, 2);
        }
        ctx.fillStyle = '#C9B866'; ctx.fillRect(x - 1, y - 8, 2, 2);
      }
    }
  }
};

/** Oil on the ground: a slick (black, glossy, a rainbow sheen moving on it) or tar (thick, matte, bubbling). */
export const drawOil = (ctx: Ctx, state: GameState, f: Field) => {
  for (const o of f.oil) {
    if (o.gone || !inView(state, o.x1, o.x2)) { if (o.gone && inView(state, o.x1, o.x2)) drawScorch(ctx, state, o.x1, o.x2); continue; }
    for (let x = o.x1; x < o.x2; x += 10) {
      const w = Math.min(10, o.x2 - x);
      const y = groundLineAt(state.groundRuns, x + w / 2);
      const edge = Math.min(1, (x - o.x1) / 30, (o.x2 - x) / 30);
      if (o.kind === 'slick') {
        // A glossy black puddle, spread thin at the edges, a bright wet edge along the top, a deep tone under it
        const th = Math.round(9 * (0.35 + 0.65 * edge)), lip = Math.round(2 * edge);
        ctx.fillStyle = '#0B0A10'; ctx.fillRect(x, y - lip, w + 0.5, th + lip);
        ctx.fillStyle = '#1E1B2E'; ctx.fillRect(x, y - lip + 1, w + 0.5, 2);
        ctx.fillStyle = 'rgba(203, 213, 225, 0.55)'; ctx.fillRect(x, y - lip, w + 0.5, 1);
      } else {
        // Tar: heaped up, lumpy, thick, brown-black, a dull sheen on the top of each lump
        const lump = Math.round((4 + Math.sin(x * 0.21) * 2 + hash(Math.floor(x / 10)) * 3) * edge);
        ctx.fillStyle = '#1C1410'; ctx.fillRect(x, y - lump, w + 0.5, lump + 12 * (0.4 + 0.6 * edge));
        ctx.fillStyle = '#3B2A20'; ctx.fillRect(x, y - lump, w + 0.5, 2);
        ctx.fillStyle = '#0C0806'; ctx.fillRect(x, y - lump + 4, w + 0.5, 2);
        if (hash(x) < 0.4) { ctx.fillStyle = '#5A4434'; ctx.fillRect(x + 2, y - lump, 2, 1); }
      }
    }
    const y0 = groundLineAt(state.groundRuns, (o.x1 + o.x2) / 2);
    if (o.kind === 'slick') {
      // The sheen: bands of color sliding along it
      for (let k = 0; k < 5; k++) {
        const x = o.x1 + 20 + ((state.frame * 0.6 + k * 53) % Math.max(1, o.x2 - o.x1 - 40));
        sheen(ctx, x - 18, groundLineAt(state.groundRuns, x) + 1, 36);
      }
      // A glint on it now and then
      if ((state.frame + Math.abs(o.x1)) % 90 < 10) { const gx = Math.round((o.x1 + 30 + hash(o.x1 + Math.floor(state.frame / 90)) * (o.x2 - o.x1 - 60)) / 2) * 2; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(gx, y0 + 1, 6, 1); ctx.fillRect(gx + 2, y0, 2, 3); }
    } else {
      // Tar: bubbles rising and popping, a sticky lip
      for (let k = 0; k < 4; k++) {
        const q = ((state.frame + k * 37 + Math.abs(o.x1)) % 70) / 70;
        const x = o.x1 + 20 + hash(o.x1 + k * 7 + Math.floor((state.frame + k * 37) / 70)) * (o.x2 - o.x1 - 40);
        const by = groundLineAt(state.groundRuns, x) - 1, r = 2 + q * 4;
        ink(ctx, () => ctx.arc(x, by, r, Math.PI, 0), '#1C1917');
        ctx.fillStyle = '#57534E'; ctx.fillRect(Math.round(x - r * 0.5), Math.round(by - r * 0.7), 2, 1);
        if (q > 0.9) { ctx.fillStyle = '#292524'; for (let a = 0; a < 6; a++) { const t = Math.PI + (a / 5) * Math.PI; ctx.fillRect(Math.round(x + Math.cos(t) * 6), Math.round(by - 2 + Math.sin(t) * 6), 2, 2); } }
      }
    }
  }
};

/** Where a slick burned off: scorched earth, a few embers still in it. */
const drawScorch = (ctx: Ctx, state: GameState, x1: number, x2: number) => {
  for (let x = x1; x < x2; x += 12) {
    const y = groundLineAt(state.groundRuns, x + 6);
    ctx.fillStyle = hash(x) < 0.5 ? '#292524' : '#3F3A36';
    ctx.fillRect(x, y - 1, 12, 4);
    ctx.fillStyle = '#1C1917'; ctx.fillRect(x, y + 3, 12, 2);
    if (hash(x + 3) < 0.15) { ctx.fillStyle = '#EA580C'; ctx.fillRect(x + 4, y, 2, 1); }
  }
};

/** A lit slick: a sheet of fire along it, licking up, smoke off the top. */
export const drawOilFire = (ctx: Ctx, state: GameState, f: Field) => {
  for (const o of f.oil) {
    const k = burnLevel(o);
    if (k <= 0 || !inView(state, o.x1, o.x2)) continue;
    // (a few fires along it, each stood on the ground where it is)
    const n = Math.max(1, Math.round((o.x2 - o.x1) / 48)), seg = (o.x2 - o.x1) / n;
    for (let i = 0; i < n; i++) {
      const x = o.x1 + seg * (i + 0.5);
      drawFire(ctx, x, groundLineAt(state.groundRuns, x) + 2, seg + 12, 44 + hash(x) * 18, state.frame, { seed: Math.floor(x), k, smoke: 0.45 });
    }
  }
};

/** The pits of crude: sheer sides, the crude a little way down, black and glossy, belching up a bubble now and then. */
export const drawPits = (ctx: Ctx, state: GameState) => {
  for (const p of COURSE.pits) {
    if (!inView(state, p.x1, p.x2)) continue;
    const top = groundLineAt(state.groundRuns, p.x1 - 2), w = p.x2 - p.x1, h = p.surface - top;
    // (the walls of it: the dirt in layers, darker down, oil-stained toward the crude, the sides in shadow)
    bandedGradient(ctx, p.x1, top, w, Math.max(4, h), ['#5B4128', '#4A3422', '#3D2B1C', '#2A1C12'], 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = top + 12; y < p.surface - 6; y += 14) ctx.fillRect(p.x1, y, w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(p.x1, top, 8, h); ctx.fillRect(p.x2 - 8, top, 8, h);
    checker(ctx, p.x1 + 8, top, 4, h, 'rgba(0,0,0,0.45)'); checker(ctx, p.x2 - 12, top, 4, h, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = '#1C1410'; ctx.fillRect(p.x1, p.surface - 6, w, 6); checker(ctx, p.x1, p.surface - 10, w, 4, '#1C1410');
    ctx.fillStyle = INK; ctx.fillRect(p.x1, top, 1, h); ctx.fillRect(p.x2 - 1, top, 1, h);
    // (the crude: black going blacker down, a lit skin on its top)
    const deep = state.camera.y + 700 - p.surface;
    ctx.fillStyle = '#000000'; ctx.fillRect(p.x1, p.surface, w, deep);
    bandedGradient(ctx, p.x1, p.surface, w, Math.min(400, Math.max(8, deep)), ['#1C1917', '#0C0A09', '#050403', '#000000'], 6);
    ctx.fillStyle = '#44403C'; ctx.fillRect(p.x1, p.surface, w, 1);
    // The sheen, slowly turning
    for (let k = 0; k < 3; k++) {
      const x = p.x1 + 16 + ((state.frame * 0.3 + k * 60) % Math.max(1, w - 32));
      sheen(ctx, x - 12, p.surface + 2, 24, 0.4);
    }
    const q = ((state.frame + Math.abs(p.x1)) % 110) / 110;
    if (q < 0.4) {
      const bx = p.x1 + w * hash(Math.floor((state.frame + Math.abs(p.x1)) / 110)), r = 3 + q * 12;
      ink(ctx, () => ctx.arc(bx, p.surface, r, Math.PI, 0), '#1C1917');
      ctx.fillStyle = '#78716C'; ctx.fillRect(Math.round(bx - r * 0.5), Math.round(p.surface - r * 0.7), 2, 2);
    }
  }
};

/** Pipelines (and a derrick's deck): a fat steel pipe on stands, a flange every so far. */
export const drawLedges = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (l.look === 'stage' || !inView(state, l.x, l.x + l.w)) continue;
    const ground = groundLineAt(state.groundRuns, l.x + l.w / 2);
    // Stands down to the ground (or into the pit), a saddle on each
    for (const sx of [l.x + 20, l.x + l.w - 26]) {
      column(ctx, sx, l.y + 8, 6, Math.max(0, (ground === Infinity ? l.y + 200 : ground) - l.y), '#44403C');
      slab(ctx, sx - 3, l.y + 12, 12, 4, '#57534E', 1);
    }
    pipe(ctx, l.x, l.y, l.w, 14, '#6B7280');
    ctx.fillStyle = INK; ctx.fillRect(l.x, l.y, 1, 14); ctx.fillRect(l.x + l.w - 1, l.y, 1, 14);
    for (let x = l.x + 40; x < l.x + l.w - 10; x += 70) {
      slab(ctx, x, l.y - 2, 6, 18, '#4B5563', 1);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(x + 2, l.y, 2, 2); ctx.fillRect(x + 2, l.y + 12, 2, 2);
    }
    // (a drip of oil)
    const dx = Math.round((l.x + l.w * 0.3) / 2) * 2;
    ctx.fillStyle = '#0C0A09'; ctx.fillRect(dx, l.y + 12, 18, 3); ctx.fillRect(dx + 6, l.y + 14, 4, 3); ctx.fillRect(dx + 7, l.y + 17, 2, 2);
    ctx.fillStyle = '#57534E'; ctx.fillRect(dx + 2, l.y + 12, 4, 1);
  }
};

/** The field's furniture. */
export const drawProps = (ctx: Ctx, state: GameState) => {
  for (const p of COURSE.props) {
    if (!inView(state, p.x - 150, p.x + 150)) continue;
    drawProp(ctx, p, state.frame);
  }
};

export const drawProp = (ctx: Ctx, p: Prop, f: number) => {
  ctx.save(); ctx.translate(p.x, p.y);
  switch (p.look) {
    case 'pumpjack': drawPumpjack(ctx, f + p.x); break;
    case 'derrick': drawDerrick(ctx, 1); break;
    case 'tank': {
      // A storage tank: the shell in steps round its curve, its seams, rust running down, the roof, the ladder
      const band = ['#D1D5DB', '#B8BEC6', '#9CA3AF', '#8A919B', '#6B7280'];
      band.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-60 + [0, 14, 34, 74, 98][i], -110, [14, 20, 40, 24, 22][i], 110); });
      for (let i = 1; i < 5; i++) checker(ctx, -60 + [0, 14, 34, 74, 98][i] - 2, -110, 2, 110, band[i - 1]);
      for (let y = -94; y < 0; y += 18) { ctx.fillStyle = '#6B7280'; ctx.fillRect(-60, y, 120, 2); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-60, y + 2, 120, 1); }
      ctx.fillStyle = 'rgba(124, 45, 18, 0.45)'; for (const rx of [-40, 10, 38]) { ctx.fillRect(rx, -100, 2, 30 + (rx & 15)); checker(ctx, rx + 2, -100, 2, 20, 'rgba(124, 45, 18, 0.45)'); }
      slab(ctx, -62, -114, 124, 8, '#D1D5DB', 1);
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-59.5, -109.5, 119, 109);
      slab(ctx, -34, -64, 68, 34, '#F5F5F4', 1);
      letter(ctx, 'CRUDE', 0, -50, 'bold 12px monospace', '#B91C1C', '#FECACA');
      letter(ctx, 'FLAMMABLE', 0, -36, 'bold 8px monospace', '#B91C1C', '#FECACA');
      // (a ladder up its side)
      column(ctx, 53, -110, 3, 110, '#4B5563'); column(ctx, 65, -110, 3, 110, '#4B5563');
      ctx.fillStyle = '#6B7280'; for (let y = -104; y < 0; y += 12) { ctx.fillRect(56, y, 9, 2); ctx.fillStyle = INK; ctx.fillRect(56, y + 2, 9, 1); ctx.fillStyle = '#6B7280'; }
      break;
    }
    case 'flare': {
      // A flare stack: a tall pipe on its plinth, guyed, a platform near the top, a flame on it that never goes out
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(s * 40, 0); ctx.stroke(); }
      column(ctx, -5, -220, 10, 220, '#57534E');
      for (let y = -200; y < -10; y += 40) { ctx.fillStyle = '#44403C'; ctx.fillRect(-5, y, 10, 2); }
      slab(ctx, -12, -176, 24, 4, '#44403C', 1);
      ctx.fillStyle = '#292524'; ctx.fillRect(-11, -186, 1, 10); ctx.fillRect(10, -186, 1, 10); ctx.fillRect(-11, -186, 22, 1);
      slab(ctx, -12, -8, 24, 8, '#57534E', 1);
      for (const s of [-1, 1]) slab(ctx, s * 40 - 3, -3, 6, 3, '#44403C', 1);
      drawFire(ctx, 0, -218, 20, 56, f, { seed: 31, glow: 0.8 });
      break;
    }
    case 'sign':
    {
      // (the board sized to what's on it: a long one goes onto two lines, broken at the space nearest the middle)
      const text = p.text ?? '';
      ctx.font = 'bold 8px monospace';
      let lines = [text];
      if (ctx.measureText(text).width > 96 && text.includes(' ')) {
        const mid = text.length / 2;
        let at = -1;
        for (let i = 0; i < text.length; i++) if (text[i] === ' ' && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
        lines = [text.slice(0, at), text.slice(at + 1)];
      }
      const w = Math.max(80, Math.max(...lines.map(l => ctx.measureText(l).width)) + 16), h = 12 + lines.length * 10;
      const blue = text === 'BREAK ROOM';
      column(ctx, -2, -56, 4, 56, '#57534E');
      slab(ctx, -w / 2 - 2, -54 - h, w + 4, h + 4, '#111827', 2);
      slab(ctx, -w / 2, -52 - h, w, h, blue ? '#1D4ED8' : '#FACC15');
      lines.forEach((l, i) => letter(ctx, l, 0, -52 - h + 15 + i * 10, 'bold 8px monospace', blue ? '#F8FAFC' : '#111827', blue ? '#1E3A8A' : '#CA8A04'));
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-w / 2 + 3, -52 - h + 3, 2, 2); ctx.fillRect(w / 2 - 5, -52 - h + 3, 2, 2); // (its bolts)
    }
      if (p.text === 'BREAK ROOM') { ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(26, -64); ctx.lineTo(34, -60); ctx.lineTo(26, -56); ctx.fill(); }
      break;
  }
  ctx.restore();
};

/** A pumpjack: the horsehead nodding up and down on its beam, the counterweights going round. */
export const drawPumpjack = (ctx: Ctx, f: number, scale = 1) => {
  ctx.save(); ctx.scale(scale, scale);
  const a = Math.sin(f * 0.04) * 0.28;
  // The base and the A-frame
  slab(ctx, -60, -8, 130, 8, '#44403C', 1);
  strut(ctx, -20, -8, 0, -76, 4, '#57534E'); strut(ctx, 20, -8, 0, -76, 4, '#57534E');
  strut(ctx, -12, -36, 12, -36, 2, '#57534E');
  // The crank and counterweights going round
  const ca = f * 0.04;
  ctx.save(); ctx.translate(-42, -34); ctx.rotate(ca);
  slab(ctx, -20, -8, 40, 16, '#374151', 2);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-18, -2, 36, 2);
  ctx.restore();
  ink(ctx, () => ctx.arc(-42, -34, 4, 0, Math.PI * 2), '#9CA3AF');
  // The beam, rocking, the horsehead on the end
  ctx.save(); ctx.translate(0, -76); ctx.rotate(a);
  slab(ctx, -52, -5, 104, 10, '#1F2937', 2);
  const head = () => { ctx.moveTo(48, -12); ctx.quadraticCurveTo(70, -8, 66, 18); ctx.lineTo(52, 18); ctx.lineTo(48, 4); ctx.closePath(); };
  shaded(ctx, head, '#B91C1C', 46, -12, 24, 30);
  ctx.fillStyle = '#F87171'; ctx.fillRect(50, -10, 8, 2);
  ctx.restore();
  ink(ctx, () => ctx.arc(0, -76, 4, 0, Math.PI * 2), '#6B7280');
  // The pitman arm down to the crank, the rod down the well
  const hx = Math.cos(a) * 60, hy = -76 + Math.sin(a) * 60 + 16;
  strut(ctx, hx + 4, hy, hx + 4, -8, 1.5, '#9CA3AF');
  slab(ctx, hx - 4, -14, 16, 14, '#6B7280', 2);
  ctx.fillStyle = '#CA8A04'; ctx.fillRect(hx - 2, -8, 12, 2);
  ctx.restore();
};

/** A derrick: a tall lattice tower, a crown block at the top, the drill floor at the bottom. `intact` 1 standing. */
export const drawDerrick = (ctx: Ctx, intact: number, scale = 1) => {
  ctx.save(); ctx.scale(scale, scale);
  const H = 250 * intact;
  // (the bracing: inked, a lit line along each; then the legs over it)
  ctx.lineCap = 'square';
  const braces = () => {
    ctx.beginPath();
    for (let k = 0; k < 8 * intact; k++) {
      const y0 = -k * 30, y1 = -(k + 1) * 30;
      const w0 = 40 - (k * 30) / 250 * 30, w1 = 40 - ((k + 1) * 30) / 250 * 30;
      ctx.moveTo(-w0, y0); ctx.lineTo(w1, y1); ctx.moveTo(w0, y0); ctx.lineTo(-w1, y1); ctx.moveTo(-w1, y1); ctx.lineTo(w1, y1);
    }
  };
  ctx.strokeStyle = INK; ctx.lineWidth = 3; braces(); ctx.stroke();
  ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1.5; braces(); ctx.stroke();
  ctx.lineCap = 'butt';
  strut(ctx, -40, 0, -10, -H, 4, '#57534E'); strut(ctx, 40, 0, 10, -H, 4, '#57534E');
  if (intact >= 1) { slab(ctx, -14, -H - 10, 28, 12, '#44403C', 2); ctx.fillStyle = '#DC2626'; ctx.fillRect(-2, -H - 14, 4, 4); }
  slab(ctx, -50, -14, 100, 14, '#44403C', 2); // the drill floor
  ctx.fillStyle = '#FACC15'; for (let x = -46; x < 46; x += 12) ctx.fillRect(x, -12, 6, 2);
  ctx.restore();
};

/** The ruptured gas lines: a broken stub of pipe (a pipe end in the pit for the ones coming up out of one). */
export const drawJetPipes = (ctx: Ctx, state: GameState) => {
  for (const j of COURSE.jets) {
    if (!inView(state, j.x - 60, j.x + 60)) continue;
    ctx.save(); ctx.translate(j.x, j.y);
    if (j.dir === 'up') {
      column(ctx, -10, -10, 20, 14, '#44403C');
      slab(ctx, -12, -14, 24, 5, '#CA8A04', 1);
      ctx.fillStyle = INK; ctx.fillRect(-6, -14, 12, 2); ctx.fillRect(-4, -15, 3, 1); ctx.fillRect(2, -15, 2, 1);
    } else {
      ctx.scale(j.dir === 'left' ? -1 : 1, 1);
      pipe(ctx, -26, -16, 28, 10, '#CA8A04');
      column(ctx, 0, -18, 5, 14, '#44403C');
      ctx.fillStyle = INK; ctx.fillRect(2, -14, 3, 6);
      ctx.fillStyle = '#78716C'; ctx.fillRect(1, -18, 2, 2); ctx.fillRect(1, -6, 2, 2);
    }
    ctx.restore();
  }
};

/** A roaring jet along +x from (0, 0): chunky bands, a white-hot core and a blue throat, red at its ragged edges. */
export const gasJet = (ctx: Ctx, len: number, f: number, seed = 0, hw = 18) => {
  const layers = [['#B91C1C', 1, 1], ['#EA580C', 0.86, 0.8], ['#F59E0B', 0.7, 0.6], ['#FDE047', 0.52, 0.42], ['#FEF9C3', 0.32, 0.26], ['#93C5FD', 0.1, 0.22]] as const;
  layers.forEach(([col, lk, wk], li) => {
    const l = len * lk * (0.92 + 0.08 * Math.sin(f * (0.7 + li * 0.23) + seed));
    ctx.fillStyle = col;
    for (let x = 0; x < l; x += 2) {
      const u = x / l;
      const shape = u < 0.4 ? 0.3 + 0.7 * (u / 0.4) : 1 - Math.pow((u - 0.4) / 0.6, 1.5);
      const w = Math.max(1, Math.round((hw * wk * shape + Math.sin(f * 0.9 + x * 0.3 + li * 2 + seed) * 1.5 * wk) / 2) * 2);
      ctx.fillRect(x, -w + (li < 2 ? Math.round(Math.sin(f * 0.6 + x * 0.08) * 2) : 0), 2, w * 2);
    }
  });
  // (licks tearing off the end of it)
  for (let i = 0; i < 4; i++) {
    const t = ((f * 2 + hash(seed + i) * 40) % 20) / 20;
    ctx.fillStyle = t < 0.5 ? '#EA580C' : '#B91C1C';
    ctx.fillRect(Math.round((len * (0.9 + t * 0.3)) / 2) * 2, Math.round(((hash(seed + i * 3) - 0.5) * hw) / 2) * 2, 4 - Math.round(t * 2), 4 - Math.round(t * 2));
  }
};

/** The fire out of them (in front): a roaring tongue while they're on, sparks and a shimmer as they're about to go. */
export const drawJetFire = (ctx: Ctx, state: GameState, fld: Field) => {
  const f = state.frame;
  for (const j of fld.jets) {
    if (!inView(state, j.x - j.len - 40, j.x + j.len + 40)) continue;
    const on = jetOn(j, f), warn = jetWarning(j, f);
    if (!on && !warn) continue;
    ctx.save(); ctx.translate(j.x, j.y - (j.dir === 'up' ? 10 : 11));
    if (j.dir === 'up') ctx.rotate(-Math.PI / 2); else if (j.dir === 'left') ctx.scale(-1, 1);
    if (on) {
      gasJet(ctx, j.len * (0.85 + Math.sin(f * 0.8) * 0.08), f, Math.floor(j.x));
    } else {
      // About to go: a little blue flame at the break, guttering, and the air shimmering in front of it
      const fl = Math.round(Math.sin(f) * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.85)'; ctx.fillRect(0, -4, 14 + fl, 8); ctx.fillRect(2, -6, 8 + fl, 12);
      ctx.fillStyle = 'rgba(219, 234, 254, 0.9)'; ctx.fillRect(0, -2, 8 + fl, 4);
      checker(ctx, 0, -10, Math.round(j.len * 0.3), 20, 'rgba(255, 255, 255, 0.14)', Math.floor(f / 3) % 2);
      checker(ctx, Math.round(j.len * 0.3), -6, Math.round(j.len * 0.3), 12, 'rgba(255, 255, 255, 0.1)', Math.floor(f / 3 + 1) % 2);
    }
    ctx.restore();
  }
};
