// Drawing for Artie's stage: hazards, set pieces and their HUD.

import type { GameState } from '../../state';
import { getArtie } from './runtime';
import { COURSE } from './course';
import { windBlowing, Hazards } from './hazards';

type Ctx = CanvasRenderingContext2D;

export const drawArtieBack = (_ctx: Ctx, _state: GameState) => {};

export const drawArtieMid = (ctx: Ctx, state: GameState) => {
  const rt = getArtie(state)!;
  drawWind(ctx, state);
  drawCrumbles(ctx, state, rt.hazards);
  drawIcicles(ctx, state, rt.hazards);
  drawChutes(ctx, state);
  drawSnowballs(ctx, rt.hazards);
};

export const drawArtieFront = (_ctx: Ctx, _state: GameState) => {};
export const drawArtieHud = (_ctx: Ctx, _state: GameState) => {};

const onScreen = (state: GameState, x: number, pad = 120) => x > state.camera.x - pad && x < state.camera.x + 800 + pad;

/** Height of the ground line at x (or the bottom of the view over a pit). */
export const floorY = (state: GameState, x: number) => {
  for (const r of state.groundRuns) if (x >= r.x1 && x <= r.x2) return r.y1 + ((x - r.x1) / (r.x2 - r.x1 || 1)) * (r.y2 - r.y1);
  return state.camera.y + 550;
};

// ---------------------------------------------------------------------------

const drawIcicles = (ctx: Ctx, state: GameState, hz: Hazards) => {
  for (const ic of hz.icicles) {
    if (ic.state === 'gone' || !onScreen(state, ic.x)) continue;
    const jitter = ic.state === 'shake' ? (state.frame % 4 < 2 ? 1.5 : -1.5) : 0;
    const x = ic.x + jitter, y = ic.state === 'fall' ? ic.fy : ic.y;
    // A long spike of ice with a bright edge
    ctx.fillStyle = '#BFDBFE';
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.lineTo(x + 1, y + 42); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#EFF6FF';
    ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 1, y); ctx.lineTo(x, y + 34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.lineTo(x + 1, y + 42); ctx.lineTo(x + 8, y); ctx.stroke();
    // Shaking loose: a warning shadow on the ground under it
    if (ic.state === 'shake') {
      const gy = floorY(state, ic.x);
      ctx.fillStyle = `rgba(15, 23, 42, ${0.15 + (ic.t / 26) * 0.35})`;
      ctx.beginPath(); ctx.ellipse(ic.x, gy - 1, 14 + ic.t * 0.4, 4, 0, 0, Math.PI * 2); ctx.fill();
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
      ctx.strokeStyle = `rgba(191, 219, 254, ${0.15 + k * 0.4})`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.strokeRect(b.x, b.y, b.w, b.h); ctx.setLineDash([]);
      continue;
    }
    const shake = c.state === 'shake' ? Math.sin(state.frame * 1.7) * (1 + c.t / 12) : 0;
    const x = b.x + shake;
    // A slab of blue ice, pale at the top, with frost along the edge
    const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g.addColorStop(0, '#E0F2FE'); g.addColorStop(0.35, '#93C5FD'); g.addColorStop(1, '#3B82F6');
    ctx.fillStyle = g;
    ctx.fillRect(x, b.y, b.w, b.h);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x, b.y, b.w, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + 6, b.y + 5, b.w * 0.4, 2);
    // Little icicles under it
    ctx.fillStyle = '#BFDBFE';
    for (let ix = x + 6; ix < x + b.w - 6; ix += 11) { ctx.beginPath(); ctx.moveTo(ix, b.y + b.h); ctx.lineTo(ix + 3, b.y + b.h + 7 + (Math.round(ix) % 3) * 2); ctx.lineTo(ix + 6, b.y + b.h); ctx.fill(); }
    // Cracks spreading as it gives way
    if (c.state === 'shake') {
      ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1.5;
      const n = 1 + Math.floor(c.t / 8);
      for (let i = 0; i < n; i++) {
        const cx = x + ((i * 37) % (b.w - 10)) + 5;
        ctx.beginPath(); ctx.moveTo(cx, b.y); ctx.lineTo(cx + 4, b.y + b.h * 0.5); ctx.lineTo(cx - 2, b.y + b.h); ctx.stroke();
      }
    }
  }
};

const drawWind = (ctx: Ctx, state: GameState) => {
  for (const w of COURSE.winds) {
    if (w.x2 < state.camera.x - 50 || w.x1 > state.camera.x + 850) continue;
    const on = windBlowing(w, state.frame);
    // A tattered trail flag on a pole at the near end: stiff in the wind, limp when it drops
    const px = w.x1 - 20, py = floorY(state, px);
    ctx.fillStyle = '#57534E'; ctx.fillRect(px, py - 90, 4, 90);
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    if (on) {
      const wave = Math.sin(state.frame * 0.6) * 3;
      ctx.moveTo(px, py - 88); ctx.lineTo(px - 34, py - 84 + wave); ctx.lineTo(px - 30, py - 76 + wave); ctx.lineTo(px, py - 72);
    } else {
      ctx.moveTo(px + 4, py - 88); ctx.lineTo(px + 7, py - 62); ctx.lineTo(px + 11, py - 64); ctx.lineTo(px + 4, py - 74);
    }
    ctx.fill();
    if (!on) continue;
    // Snow streaks racing back along it
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'; ctx.lineWidth = 2;
    const span = w.x2 - w.x1;
    for (let i = 0; i < 26; i++) {
      const x = w.x2 - ((state.frame * 11 + i * 97) % span);
      const y = floorY(state, x) - 10 - ((i * 53) % 170);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22 + (i % 3) * 8, y - 1); ctx.stroke();
    }
  }
};

const drawChutes = (ctx: Ctx, state: GameState) => {
  for (const ch of COURSE.chutes) {
    if (!onScreen(state, ch.x)) continue;
    // A snow-caked wooden chute poking out of the drift at the top
    const y = ch.y;
    ctx.fillStyle = '#5B4636';
    ctx.beginPath(); ctx.moveTo(ch.x - 10, y - ch.size - 16); ctx.lineTo(ch.x + 40, y - ch.size - 30); ctx.lineTo(ch.x + 40, y - 6); ctx.lineTo(ch.x - 10, y); ctx.fill();
    ctx.fillStyle = '#3F2F24'; ctx.fillRect(ch.x - 12, y - ch.size - 20, 5, ch.size + 20);
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.ellipse(ch.x + 18, y - ch.size - 26, 30, 8, -0.25, 0, Math.PI * 2); ctx.fill();
  }
};

const drawSnowballs = (ctx: Ctx, hz: Hazards) => {
  for (const s of hz.snowballs) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath(); ctx.ellipse(0, s.r - 1, s.r * 0.9, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(s.rot);
    const g = ctx.createRadialGradient(-s.r * 0.35, -s.r * 0.35, 1, 0, 0, s.r);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.7, '#E2ECF7'); g.addColorStop(1, '#A7BCD6');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, s.r, 0, Math.PI * 2); ctx.fill();
    // Clumps so you can see it roll
    ctx.fillStyle = '#C7D6EA';
    for (let i = 0; i < 5; i++) { const a = i * 1.3; ctx.beginPath(); ctx.arc(Math.cos(a) * s.r * 0.55, Math.sin(a) * s.r * 0.55, s.r * 0.14, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
};
