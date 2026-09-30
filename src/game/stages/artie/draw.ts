// Drawing for Artie's stage: hazards, set pieces and their HUD.

import { drawFlingDeath, FLING_FRAMES } from './flingDraw';
import type { GameState } from '../../core/state';
import { getArtie } from './runtime';
import { COURSE } from './course';
import { windBlowing, Hazards, chuteLive, CHUTE_WARN_FRAMES } from './hazards';
import { drawTramRigging, drawTramBack, drawTramFront, drawTramHud } from './tramDraw';
import { tramFloorLineAt, CABIN_W } from './tram';
import { drawMooseCorpse, drawMooseHud } from './mooseDraw';
import { drawSkiMid, drawSkiFront, drawSkiHud } from './skiDraw';

type Ctx = CanvasRenderingContext2D;

export const drawArtieBack = (ctx: Ctx, state: GameState) => {
  // Pylons rise out of the clouds; the stations and the cabin are in front of them
  drawTramRigging(ctx, state);
  drawCloudSea(ctx, state);
  drawTramBack(ctx, state, getArtie(state)!.tram);
  drawPines(ctx, state);
};

// ---------------------------------------------------------------------------
// The high woods
// ---------------------------------------------------------------------------

/** The pines of the high woods, behind everything: tiers of dark needles, snow along the top of each, the trunk. */
const drawPines = (ctx: Ctx, state: GameState) => {
  const W = COURSE.woods;
  const v = viewOf(state);
  if (W.x2 < v.x - 200 || W.x1 > v.x + v.w + 200) return;
  for (const p of W.pines) {
    if (p.x < v.x - 120 || p.x > v.x + v.w + 120) continue;
    const tiers = Math.max(3, Math.round(p.h / 60)), w0 = p.h * 0.32;
    ctx.fillStyle = '#2A1A10'; ctx.fillRect(p.x - 6, p.y - p.h * 0.25, 12, p.h * 0.25 + 4);
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(p.x - 6, p.y - p.h * 0.25, 4, p.h * 0.25 + 4);
    for (let k = 0; k < tiers; k++) {
      const top = p.y - p.h + (k * p.h * 0.75) / tiers, bot = top + p.h * 0.34, w = w0 * (0.45 + (0.55 * (k + 1)) / tiers);
      // (the dark side, the lit side, the snow along the top edge)
      ctx.fillStyle = '#0F2E1C'; ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x + w, bot); ctx.lineTo(p.x - w, bot); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1B4D2E'; ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x - w, bot); ctx.lineTo(p.x - w * 0.2, bot); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#EEF4FB'; ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x - w * 0.55, top + (bot - top) * 0.55); ctx.lineTo(p.x - w * 0.2, top + (bot - top) * 0.45); ctx.lineTo(p.x + w * 0.1, top + (bot - top) * 0.6); ctx.lineTo(p.x + w * 0.45, top + (bot - top) * 0.5); ctx.closePath(); ctx.fill();
    }
    // (snow heaped round the foot of it)
    ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 18, 5, 0, Math.PI, 0); ctx.fill();
  }
};

/** The boughs you climb (a limb off the trunk, needles along it, snow on top) and the fallen trunk. */
const drawBoughs = (ctx: Ctx, state: GameState) => {
  for (const l of COURSE.ledges) {
    if (!l.look || !onScreen(state, l.x)) continue;
    if (l.look === 'log') {
      ctx.fillStyle = '#4A2E1A'; ctx.beginPath(); ctx.roundRect(l.x, l.y, l.w, 44, 18); ctx.fill();
      ctx.fillStyle = '#5E3A22'; ctx.fillRect(l.x + 8, l.y + 6, l.w - 16, 10);
      ctx.strokeStyle = 'rgba(30, 16, 8, 0.6)'; ctx.lineWidth = 1.5;
      for (let x = l.x + 16; x < l.x + l.w - 12; x += 22) { ctx.beginPath(); ctx.moveTo(x, l.y + 8); ctx.quadraticCurveTo(x + 6, l.y + 22, x, l.y + 38); ctx.stroke(); }
      // (its sawn-off end, the rings in it)
      ctx.fillStyle = '#C8A070'; ctx.beginPath(); ctx.ellipse(l.x + l.w - 8, l.y + 22, 10, 21, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8A6038'; ctx.lineWidth = 1; for (let r = 4; r < 20; r += 5) { ctx.beginPath(); ctx.ellipse(l.x + l.w - 8, l.y + 22, r * 0.5, r, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(l.x + l.w / 2, l.y + 2, l.w / 2 - 6, 6, 0, Math.PI, 0); ctx.fill();
      continue;
    }
    // A bough: the limb, the needles hanging off it, the snow along the top
    ctx.fillStyle = '#3F2A1D'; ctx.fillRect(l.x, l.y + 6, l.w, 7);
    for (let x = l.x; x < l.x + l.w; x += 12) {
      ctx.fillStyle = '#14532D'; ctx.beginPath(); ctx.moveTo(x, l.y + 8); ctx.lineTo(x + 14, l.y + 8); ctx.lineTo(x + 7, l.y + 24); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1B4D2E'; ctx.beginPath(); ctx.moveTo(x, l.y + 8); ctx.lineTo(x + 6, l.y + 8); ctx.lineTo(x + 5, l.y + 20); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#EEF4FB'; ctx.fillRect(l.x - 2, l.y, l.w + 4, 6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(l.x + 2, l.y, l.w - 6, 2);
  }
};

export const drawArtieMid = (ctx: Ctx, state: GameState) => {
  const rt = getArtie(state)!;
  drawWind(ctx, state);
  drawBoughs(ctx, state);
  if (rt.moose.corpse) drawMooseCorpse(ctx, rt.moose.corpse, state.frame);
  drawCrumbles(ctx, state, rt.hazards);
  drawIcicles(ctx, state, rt.hazards);
  drawChutes(ctx, state, rt.hazards);
  drawSnowballs(ctx, rt.hazards);
  drawSkiMid(ctx, state, rt.ski);
};

export const drawArtieFront = (ctx: Ctx, state: GameState) => {
  drawTramFront(ctx, state, getArtie(state)!.tram);
  drawSkiFront(ctx, state, getArtie(state)!.ski);
};

export const drawArtieHud = (ctx: Ctx, state: GameState) => {
  drawTramHud(ctx, state, getArtie(state)!.tram);
  drawMooseHud(ctx, state, getArtie(state)!.moose);
  drawSkiHud(ctx, state, getArtie(state)!.ski);
  drawChuteWarnings(ctx, state, getArtie(state)!.hazards);
  // Killed in the snowball: thrown off the far side of the mountain (over everything, while it plays and under the message)
  if (state.deathTimer > 0 && getArtie(state)!.ski.fling) drawFlingDeath(ctx, state, state.deathScene?.t ?? FLING_FRAMES);
};

/** How far along a chute's telegraph is (0..1), or 0 if it isn't about to go. */
const chuteWindup = (state: GameState, hz: Hazards, i: number) => {
  const ch = COURSE.chutes[i];
  if (!chuteLive(ch, state.player.pos.x + state.player.width / 2)) return 0;
  const t = hz.chuteTimers[i];
  return t > 0 && t <= CHUTE_WARN_FRAMES ? 1 - t / CHUTE_WARN_FRAMES : 0;
};

/** A snowball about to come from a chute off the right of the screen: a warning at the edge, at its height. */
const drawChuteWarnings = (ctx: Ctx, state: GameState, hz: Hazards) => {
  COURSE.chutes.forEach((ch, i) => {
    const k = chuteWindup(state, hz, i);
    if (!k || ch.x < state.camera.x + 800 - 20) return;
    if (Math.floor(state.frame / 5) % 2) return;
    const y = Math.max(40, Math.min(560, ch.y - ch.size / 2 - state.camera.y));
    const x = 800 - 26;
    ctx.save();
    ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 2;
    // An arrow pointing in from the edge, a snowball on it
    ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 6, y - 16); ctx.lineTo(x + 6, y + 16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.arc(x + 2, y, 4 + (ch.size / 56) * 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
};

/** How far under the tram cabin's path the cloud tops sit. */
const CLOUD_TOP = 190;

/** A deterministic 0..1 from a number (so the clouds don't flicker). */
const hash = (n: number) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };

/**
 * The gorge under the upper station: a thick sea of cloud, rolling slowly. It's
 * drawn behind everything (the tram cabin rides in front of it, the mountainside
 * rises out of it), sloping down on the left to meet the mountain.
 */
const drawCloudSea = (ctx: Ctx, state: GameState) => {
  const gz = COURSE.gorge;
  const x1 = gz.x1 - 40, x2 = gz.x2 + 40;
  const vw = viewOf(state);
  if (x2 < vw.x - 50 || x1 > vw.x + vw.w + 50) return;
  // Where the cloud tops are at x: a steady distance under the cable line (under the cabin's middle as it passes)
  const topAt = (x: number) => tramFloorLineAt(x + CABIN_W / 2) + CLOUD_TOP;
  const bottom = Math.max(vw.y + vw.h + 100, topAt(Math.max(x1, vw.x)) + 300);
  const layers = [
    { dy: 0, color: '#5E6C8C', r: 70, drift: 0.12, step: 80 },
    { dy: 45, color: '#8290AE', r: 62, drift: -0.2, step: 70 },
    { dy: 95, color: '#AAB6CE', r: 56, drift: 0.3, step: 60 },
  ];
  layers.forEach((l, li) => {
    ctx.fillStyle = l.color;
    // The body of the layer
    ctx.beginPath();
    ctx.moveTo(x1, topAt(x1) + l.dy + l.r * 0.4);
    for (let x = x1; x <= x2; x += 40) ctx.lineTo(x, topAt(x) + l.dy + l.r * 0.4);
    ctx.lineTo(x2, bottom); ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
    // Billows along its top, drifting
    const shift = (state.frame * l.drift) % l.step;
    for (let x = x1 - l.step + shift, i = 0; x < x2 + l.step; x += l.step, i++) {
      const k = hash(Math.round((x - shift) / l.step) + li * 97);
      const r = l.r * (0.7 + k * 0.6);
      const y = topAt(x) + l.dy + (hash(i * 3.7 + li) - 0.5) * 30 + Math.sin(state.frame * 0.01 + i) * 4;
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.35, r * 1.3, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
};

const onScreen = (state: GameState, x: number, pad = 120) => { const v = viewOf(state); return x > v.x - pad && x < v.x + v.w + pad; };

/** What of the world's on screen (more than the camera's 800 across when it's zoomed out, on the skis). */
export const viewOf = (state: GameState) => state.view ?? { x: state.camera.x, y: state.camera.y, w: 800, h: 600 };

/** Height of the ground line at x (or the bottom of the view over a pit). */
export const floorY = (state: GameState, x: number) => {
  for (const r of state.groundRuns) if (x >= r.x1 && x <= r.x2) return r.y1 + ((x - r.x1) / (r.x2 - r.x1 || 1)) * (r.y2 - r.y1);
  return viewOf(state).y + 550;
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
    const vw = viewOf(state);
    if (w.x2 < vw.x - 50 || w.x1 > vw.x + vw.w + 50) continue;
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

const drawChutes = (ctx: Ctx, state: GameState, hz: Hazards) => {
  COURSE.chutes.forEach((ch, i) => {
    if (!onScreen(state, ch.x)) return;
    // About to go: the snowball rattles in the chute mouth, shaking snow loose, under a warning
    const k = chuteWindup(state, hz, i);
    if (k) {
      const r = ch.size / 2;
      const jig = Math.floor(state.frame / 2) % 2 ? 1.5 : -1.5;
      ctx.fillStyle = '#E2ECF7'; ctx.strokeStyle = '#A7BCD6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ch.x + 30 - k * 22 + jig, ch.y - r - 8 - (1 - k) * 10, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (Math.floor(state.frame / 6) % 2 === 0) {
        const wy = ch.y - ch.size - 62;
        ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#FDE047';
        ctx.beginPath(); ctx.moveTo(ch.x + 10, wy - 14); ctx.lineTo(ch.x + 24, wy + 11); ctx.lineTo(ch.x - 4, wy + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('!', ch.x + 11, wy + 9); ctx.textAlign = 'left';
      }
    }
    // A snow-caked wooden chute poking out of the drift at the top
    const y = ch.y;
    ctx.fillStyle = '#5B4636';
    ctx.beginPath(); ctx.moveTo(ch.x - 10, y - ch.size - 16); ctx.lineTo(ch.x + 40, y - ch.size - 30); ctx.lineTo(ch.x + 40, y - 6); ctx.lineTo(ch.x - 10, y); ctx.fill();
    ctx.fillStyle = '#3F2F24'; ctx.fillRect(ch.x - 12, y - ch.size - 20, 5, ch.size + 20);
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath(); ctx.ellipse(ch.x + 18, y - ch.size - 26, 30, 8, -0.25, 0, Math.PI * 2); ctx.fill();
  });
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
