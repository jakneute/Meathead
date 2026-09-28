// The oil field, drawn: the dirt (caliche and dry scrub), the oil on it (a
// slick with its rainbow sheen, tar lying thick and bubbling), the pits of crude,
// the pipelines, and the field's furniture (pumpjacks nodding away, derricks,
// tanks, a flare stack burning, signs). And a lit slick burning.

import type { GameState } from '../../core/state';
import type { GroundRun } from '../../core/terrain';
import { groundLineAt } from '../../core/terrain';
import { CANVAS_WIDTH } from '../../../constants';
import { COURSE, Prop } from './course';
import type { Field } from './field';
import { burnLevel, jetOn, jetWarning } from './field';

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const inView = (state: GameState, x1: number, x2: number, pad = 100) => x2 > state.camera.x - pad && x1 < state.camera.x + CANVAS_WIDTH + pad;

/** The dirt: packed caliche, a darker band under the top, scrub and stones along it. */
export const drawDirt = (ctx: Ctx, state: GameState, runs: GroundRun[] = COURSE.runs, view?: { x1: number; x2: number }) => {
  const bottom = state.camera.y + 1400;
  for (const r of runs) {
    if (view ? r.x2 < view.x1 - 100 || r.x1 > view.x2 + 100 : !inView(state, r.x1, r.x2)) continue;
    const g = ctx.createLinearGradient(0, Math.min(r.y1, r.y2), 0, Math.min(r.y1, r.y2) + 160);
    g.addColorStop(0, '#B08A5A'); g.addColorStop(0.15, '#8C6A42'); g.addColorStop(1, '#5B4128');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(r.x1, r.y1); ctx.lineTo(r.x2, r.y2); ctx.lineTo(r.x2, bottom); ctx.lineTo(r.x1, bottom); ctx.closePath(); ctx.fill();
    // The top edge: a lighter crust, stones, scrub
    ctx.strokeStyle = '#D2B48C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r.x1, r.y1 + 1); ctx.lineTo(r.x2, r.y2 + 1); ctx.stroke();
    const len = r.x2 - r.x1;
    for (let x = Math.ceil(r.x1 / 23) * 23; x < r.x2; x += 23) {
      const y = r.y1 + (r.y2 - r.y1) * ((x - r.x1) / len);
      const h = hash(x);
      if (h < 0.25) { ctx.fillStyle = '#7C6A4E'; ctx.fillRect(x, y + 4 + h * 20, 4, 3); }
      else if (h > 0.86) {
        // A tuft of dry scrub
        ctx.strokeStyle = '#8A7B3A'; ctx.lineWidth = 1.2;
        for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + k * 3, y - 6 - (k === 0 ? 3 : 0)); ctx.stroke(); }
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
        // A glossy black puddle, spread thin at the edges, a bright wet edge along the top
        const th = 9 * (0.35 + 0.65 * edge);
        ctx.fillStyle = '#0B0A10'; ctx.fillRect(x, y - 2 * edge, w + 0.5, th + 2 * edge);
        ctx.fillStyle = 'rgba(203, 213, 225, 0.55)'; ctx.fillRect(x, y - 2 * edge, w + 0.5, 1);
      } else {
        // Tar: heaped up, lumpy, thick, brown-black
        const lump = (4 + Math.sin(x * 0.21) * 2 + hash(Math.floor(x / 10)) * 3) * edge;
        ctx.fillStyle = '#1C1410'; ctx.fillRect(x, y - lump, w + 0.5, lump + 12 * (0.4 + 0.6 * edge));
        ctx.fillStyle = '#3B2A20'; ctx.fillRect(x, y - lump, w + 0.5, 2);
      }
    }
    const y0 = groundLineAt(state.groundRuns, (o.x1 + o.x2) / 2);
    if (o.kind === 'slick') {
      // The sheen: bands of color sliding along it
      for (let k = 0; k < 5; k++) {
        const x = o.x1 + 20 + ((state.frame * 0.6 + k * 53) % Math.max(1, o.x2 - o.x1 - 40));
        const g = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
        g.addColorStop(0, 'rgba(168, 85, 247, 0)'); g.addColorStop(0.3, 'rgba(168, 85, 247, 0.85)'); g.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)'); g.addColorStop(0.7, 'rgba(250, 204, 21, 0.8)'); g.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = g; ctx.fillRect(x - 22, groundLineAt(state.groundRuns, x) + 1, 44, 3);
      }
      // A glint on it now and then
      if ((state.frame + Math.abs(o.x1)) % 90 < 10) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(o.x1 + 30 + hash(o.x1 + Math.floor(state.frame / 90)) * (o.x2 - o.x1 - 60), y0 + 1, 6, 1); }
    } else {
      // Tar: bubbles rising and popping, a sticky lip
      for (let k = 0; k < 4; k++) {
        const q = ((state.frame + k * 37 + Math.abs(o.x1)) % 70) / 70;
        const x = o.x1 + 20 + hash(o.x1 + k * 7 + Math.floor((state.frame + k * 37) / 70)) * (o.x2 - o.x1 - 40);
        ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(x, groundLineAt(state.groundRuns, x) - 1, 2 + q * 4, Math.PI, 0); ctx.fill();
        if (q > 0.9) { ctx.strokeStyle = '#292524'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, groundLineAt(state.groundRuns, x) - 3, 6, Math.PI, 0); ctx.stroke(); }
      }
    }
  }
};

/** Where a slick burned off: scorched earth. */
const drawScorch = (ctx: Ctx, state: GameState, x1: number, x2: number) => {
  for (let x = x1; x < x2; x += 12) {
    const y = groundLineAt(state.groundRuns, x + 6);
    ctx.fillStyle = hash(x) < 0.5 ? '#292524' : '#3F3A36';
    ctx.fillRect(x, y - 1, 12, 4);
  }
};

/** A lit slick: a sheet of fire along it, licking up, smoke off the top. */
export const drawOilFire = (ctx: Ctx, state: GameState, f: Field) => {
  for (const o of f.oil) {
    const k = burnLevel(o);
    if (k <= 0 || !inView(state, o.x1, o.x2)) continue;
    for (let x = o.x1 + 6; x < o.x2 - 4; x += 12) {
      const y = groundLineAt(state.groundRuns, x);
      const h = (18 + Math.sin(state.frame * 0.4 + x * 0.3) * 8 + hash(x) * 14) * k;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - 4, y - h * 0.6, x, y - h); ctx.quadraticCurveTo(x + 4, y - h * 0.6, x + 8, y); ctx.fill();
      ctx.fillStyle = 'rgba(253, 186, 116, 0.9)';
      ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.quadraticCurveTo(x - 2, y - h * 0.4, x, y - h * 0.65); ctx.quadraticCurveTo(x + 2, y - h * 0.4, x + 4, y); ctx.fill();
    }
  }
};

/** The pits of crude: sheer sides, the crude a little way down, black and glossy, belching up a bubble now and then. */
export const drawPits = (ctx: Ctx, state: GameState) => {
  for (const p of COURSE.pits) {
    if (!inView(state, p.x1, p.x2)) continue;
    const top = groundLineAt(state.groundRuns, p.x1 - 2);
    ctx.fillStyle = '#3D2B1C'; ctx.fillRect(p.x1, top, p.x2 - p.x1, p.surface - top);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(p.x1, top, 10, p.surface - top); ctx.fillRect(p.x2 - 10, top, 10, p.surface - top);
    const g = ctx.createLinearGradient(0, p.surface, 0, p.surface + 400);
    g.addColorStop(0, '#1C1917'); g.addColorStop(0.1, '#0C0A09'); g.addColorStop(1, '#000');
    ctx.fillStyle = g; ctx.fillRect(p.x1, p.surface, p.x2 - p.x1, state.camera.y + 700 - p.surface);
    // The sheen, slowly turning
    for (let k = 0; k < 3; k++) {
      const x = p.x1 + 16 + ((state.frame * 0.3 + k * 60) % Math.max(1, p.x2 - p.x1 - 32));
      ctx.fillStyle = k === 0 ? 'rgba(168, 85, 247, 0.4)' : k === 1 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(250, 204, 21, 0.3)';
      ctx.fillRect(x - 12, p.surface + 2, 24, 2);
    }
    const q = ((state.frame + Math.abs(p.x1)) % 110) / 110;
    if (q < 0.4) { ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.arc(p.x1 + (p.x2 - p.x1) * hash(Math.floor((state.frame + Math.abs(p.x1)) / 110)), p.surface, 3 + q * 12, Math.PI, 0); ctx.fill(); }
  }
};

/** Pipelines (and a derrick's deck): a fat steel pipe on stands, a flange every so far. */
export const drawLedges = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (l.look === 'stage' || !inView(state, l.x, l.x + l.w)) continue;
    const ground = groundLineAt(state.groundRuns, l.x + l.w / 2);
    // Stands down to the ground (or into the pit)
    ctx.fillStyle = '#44403C';
    for (const sx of [l.x + 20, l.x + l.w - 26]) ctx.fillRect(sx, l.y + 8, 6, Math.max(0, (ground === Infinity ? l.y + 200 : ground) - l.y));
    ctx.fillStyle = '#6B7280'; ctx.fillRect(l.x, l.y, l.w, 14);
    ctx.fillStyle = '#9CA3AF'; ctx.fillRect(l.x, l.y + 2, l.w, 3);
    ctx.fillStyle = '#374151'; ctx.fillRect(l.x, l.y + 11, l.w, 3);
    ctx.fillStyle = '#4B5563'; for (let x = l.x + 40; x < l.x + l.w - 10; x += 70) ctx.fillRect(x, l.y - 2, 6, 18);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(l.x + l.w * 0.3, l.y + 12, 18, 3); // (a drip of oil)
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
    case 'tank':
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-60, -110, 120, 110);
      ctx.fillStyle = '#D1D5DB'; ctx.fillRect(-60, -110, 120, 8); ctx.fillStyle = '#6B7280'; for (let y = -94; y < 0; y += 18) ctx.fillRect(-60, y, 120, 2);
      ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.fillText('CRUDE', 0, -50); ctx.font = 'bold 8px monospace'; ctx.fillText('FLAMMABLE', 0, -36); ctx.textAlign = 'left';
      ctx.strokeStyle = '#4B5563'; ctx.lineWidth = 2; for (let y = -104; y < 0; y += 12) { ctx.beginPath(); ctx.moveTo(54, y); ctx.lineTo(66, y); ctx.stroke(); } // a ladder
      break;
    case 'flare': {
      // A flare stack: a tall pipe, a flame on the top of it that never goes out
      ctx.fillStyle = '#57534E'; ctx.fillRect(-5, -220, 10, 220);
      ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1.5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -170); ctx.lineTo(s * 40, 0); ctx.stroke(); }
      const h = 34 + Math.sin(f * 0.35) * 8 + Math.sin(f * 0.9) * 4;
      ctx.fillStyle = 'rgba(249, 115, 22, 0.9)'; ctx.beginPath(); ctx.moveTo(-9, -220); ctx.quadraticCurveTo(-8 + Math.sin(f * 0.2) * 4, -220 - h * 0.6, Math.sin(f * 0.25) * 6, -220 - h); ctx.quadraticCurveTo(8, -220 - h * 0.5, 9, -220); ctx.fill();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.9)'; ctx.beginPath(); ctx.moveTo(-4, -220); ctx.quadraticCurveTo(-3, -220 - h * 0.4, 0, -220 - h * 0.6); ctx.quadraticCurveTo(3, -220 - h * 0.35, 4, -220); ctx.fill();
      break;
    }
    case 'sign':
      ctx.fillStyle = '#57534E'; ctx.fillRect(-2, -56, 4, 56);
      ctx.fillStyle = p.text === 'BREAK ROOM' ? '#1D4ED8' : '#FACC15'; ctx.fillRect(-40, -76, 80, 24);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.strokeRect(-40, -76, 80, 24);
      ctx.fillStyle = p.text === 'BREAK ROOM' ? '#F8FAFC' : '#111827'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillText(p.text ?? '', 0, -61); ctx.textAlign = 'left';
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
  ctx.fillStyle = '#44403C'; ctx.fillRect(-60, -8, 130, 8);
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-20, -8); ctx.lineTo(0, -76); ctx.lineTo(20, -8); ctx.stroke();
  // The crank and counterweights going round
  const ca = f * 0.04;
  ctx.fillStyle = '#374151'; ctx.save(); ctx.translate(-42, -34); ctx.rotate(ca); ctx.fillRect(-20, -8, 40, 16); ctx.restore();
  // The beam, rocking, the horsehead on the end
  ctx.save(); ctx.translate(0, -76); ctx.rotate(a);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-52, -5, 104, 10);
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(48, -12); ctx.quadraticCurveTo(70, -8, 66, 18); ctx.lineTo(52, 18); ctx.lineTo(48, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
  // The pitman arm down to the crank, the rod down the well
  const hx = Math.cos(a) * 60, hy = -76 + Math.sin(a) * 60 + 16;
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx + 4, hy); ctx.lineTo(hx + 4, -8); ctx.stroke();
  ctx.fillStyle = '#6B7280'; ctx.fillRect(hx - 4, -14, 16, 14);
  ctx.restore();
};

/** A derrick: a tall lattice tower, a crown block at the top, the drill floor at the bottom. `intact` 1 standing. */
export const drawDerrick = (ctx: Ctx, intact: number, scale = 1) => {
  ctx.save(); ctx.scale(scale, scale);
  const H = 250 * intact;
  ctx.strokeStyle = '#57534E'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-10, -H); ctx.moveTo(40, 0); ctx.lineTo(10, -H); ctx.stroke();
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 8 * intact; k++) {
    const y0 = -k * 30, y1 = -(k + 1) * 30;
    const w0 = 40 - (k * 30) / 250 * 30, w1 = 40 - ((k + 1) * 30) / 250 * 30;
    ctx.beginPath(); ctx.moveTo(-w0, y0); ctx.lineTo(w1, y1); ctx.moveTo(w0, y0); ctx.lineTo(-w1, y1); ctx.moveTo(-w1, y1); ctx.lineTo(w1, y1); ctx.stroke();
  }
  if (intact >= 1) { ctx.fillStyle = '#44403C'; ctx.fillRect(-14, -H - 10, 28, 12); }
  ctx.fillStyle = '#44403C'; ctx.fillRect(-50, -14, 100, 14); // the drill floor
  ctx.restore();
};

/** The ruptured gas lines: a broken stub of pipe (a pipe end in the pit for the ones coming up out of one). */
export const drawJetPipes = (ctx: Ctx, state: GameState) => {
  for (const j of COURSE.jets) {
    if (!inView(state, j.x - 60, j.x + 60)) continue;
    ctx.save(); ctx.translate(j.x, j.y);
    if (j.dir === 'up') { ctx.fillStyle = '#44403C'; ctx.fillRect(-10, -10, 20, 14); ctx.fillStyle = '#CA8A04'; ctx.fillRect(-12, -14, 24, 5); }
    else { ctx.scale(j.dir === 'left' ? -1 : 1, 1); ctx.fillStyle = '#CA8A04'; ctx.fillRect(-26, -16, 28, 10); ctx.fillStyle = '#44403C'; ctx.fillRect(0, -18, 5, 14); ctx.fillStyle = '#1C1917'; ctx.fillRect(2, -14, 3, 6); }
    ctx.restore();
  }
};

/** The fire out of them (in front): a roaring tongue while they're on, sparks and a shimmer as they're about to go. */
export const drawJetFire = (ctx: Ctx, state: GameState) => {
  const f = state.frame;
  for (const j of COURSE.jets) {
    if (!inView(state, j.x - j.len - 40, j.x + j.len + 40)) continue;
    const on = jetOn(j, f), warn = jetWarning(j, f);
    if (!on && !warn) continue;
    ctx.save(); ctx.translate(j.x, j.y - (j.dir === 'up' ? 10 : 11));
    if (j.dir === 'up') ctx.rotate(-Math.PI / 2); else if (j.dir === 'left') ctx.scale(-1, 1);
    if (on) {
      const len = j.len * (0.85 + Math.sin(f * 0.8) * 0.08);
      const g = ctx.createLinearGradient(0, 0, len, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); g.addColorStop(0.15, 'rgba(147, 197, 253, 0.9)'); g.addColorStop(0.35, 'rgba(253, 224, 71, 0.95)'); g.addColorStop(0.75, 'rgba(234, 88, 12, 0.85)'); g.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(len * 0.5, -20 - Math.sin(f * 0.7) * 5, len, 0); ctx.quadraticCurveTo(len * 0.5, 20 + Math.sin(f * 0.9) * 5, 0, 6); ctx.closePath(); ctx.fill();
    } else {
      // About to go: sparks spitting, a heat shimmer, a little blue flame at the break
      ctx.fillStyle = 'rgba(147, 197, 253, 0.8)'; ctx.beginPath(); ctx.ellipse(6, 0, 8 + Math.sin(f) * 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; ctx.fillRect(0, -10, j.len * 0.6, 20);
    }
    ctx.restore();
  }
};
