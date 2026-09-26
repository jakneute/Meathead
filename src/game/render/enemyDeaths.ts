// Draws the special kill animations (see game/enemyDeaths.ts).

import { GameState } from '../state';
import { EnemyDeath, DEATH_FRAMES } from '../enemyDeaths';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Mix two #rrggbb colours. */
const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t))).join(',')})`;
};

/** Fade out over the last `n` frames. */
const fadeOut = (d: EnemyDeath, n: number) => clamp01((DEATH_FRAMES[d.kind] - d.t) / n);

export const drawEnemyDeaths = (ctx: Ctx, state: GameState) => {
  for (const d of state.enemyDeaths) {
    ctx.save();
    switch (d.kind) {
      case 'charred': drawCharred(ctx, d, state.frame); break;
      case 'fried': drawFried(ctx, d, state.frame); break;
      case 'melted': drawMelted(ctx, d, state.frame); break;
      case 'greased': drawGreased(ctx, d, state.frame); break;
      case 'pancaked': drawPancaked(ctx, d); break;
    }
    ctx.restore();
  }
};

/** Burns black in the flames, blinks its eyes once (classic cartoon), then crumbles to ash. */
const drawCharred = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const { x, y, w, h, t } = d;
  const crumble = clamp01((t - 55) / 25);
  const standingH = h * (1 - crumble);
  if (standingH > 1) {
    ctx.fillStyle = mix(d.color, '#1C1917', t / 18);
    ctx.fillRect(x, y + h - standingH, w, standingH);
    // Glowing cracks
    if (t > 12) {
      ctx.strokeStyle = `rgba(249, 115, 22, ${0.5 + 0.4 * Math.sin(frame * 0.4)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const cy = y + h - standingH + (i + 0.5) * standingH / 3;
        ctx.moveTo(x + 4, cy); ctx.lineTo(x + w * 0.4, cy + 4); ctx.lineTo(x + w * 0.6, cy - 3); ctx.lineTo(x + w - 4, cy + 2);
      }
      ctx.stroke();
    }
    // Two white eyes blinking in the soot
    if (t > 22 && t < 55 && !(t > 36 && t < 40)) {
      ctx.fillStyle = '#FFFFFF';
      const ey = y + Math.min(h * 0.3, 18);
      ctx.fillRect(x + w * 0.3 - 3, ey, 5, 5);
      ctx.fillRect(x + w * 0.62 - 2, ey, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + w * 0.3 - 1, ey + 2, 2, 2);
      ctx.fillRect(x + w * 0.62, ey + 2, 2, 2);
    }
  }
  // Flames licking up while it burns
  if (t < 24) {
    for (let i = 0; i < 5; i++) {
      const fx = x + (i + 0.5) * w / 5;
      const fh = 10 + ((frame * 3 + i * 7) % 12);
      ctx.fillStyle = i % 2 ? '#F97316' : '#FDE047';
      ctx.beginPath(); ctx.moveTo(fx - 5, y + 6); ctx.lineTo(fx, y - fh); ctx.lineTo(fx + 5, y + 6); ctx.fill();
    }
  }
  // Ash pile
  if (crumble > 0) {
    ctx.globalAlpha = fadeOut(d, 20);
    ctx.fillStyle = '#57534E';
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h, w * 0.6 * crumble + 4, 10 * crumble + 2, 0, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F97316';
    if (frame % 10 < 5) ctx.fillRect(x + w * 0.45, y + h - 4, 2, 2);
  }
};

/** Electrocuted: flashing between its body and an X-ray skeleton, then a smoking heap. */
const drawFried = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const { x, y, w, h, t } = d;
  if (t < 40) {
    ctx.translate((frame % 2 ? 2 : -2), (frame % 3 ? 1 : -1));
    const xray = frame % 6 < 3;
    ctx.fillStyle = xray ? '#0891B2' : d.color;
    ctx.fillRect(x, y, w, h);
    if (xray) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      const cx = x + w / 2;
      const skullR = Math.min(w, h) * 0.2;
      const top = y + skullR + 3;
      ctx.beginPath(); ctx.arc(cx, top, skullR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0891B2';
      ctx.fillRect(cx - skullR * 0.6, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      ctx.fillRect(cx + skullR * 0.15, top - skullR * 0.2, skullR * 0.45, skullR * 0.45);
      const spineTop = top + skullR, hip = y + h * 0.68;
      ctx.beginPath();
      ctx.moveTo(cx, spineTop); ctx.lineTo(cx, hip);
      for (let i = 0; i < 3; i++) { const ry = spineTop + 5 + i * (hip - spineTop - 6) / 3; ctx.moveTo(cx - w * 0.28, ry); ctx.lineTo(cx + w * 0.28, ry); }
      ctx.moveTo(cx - w * 0.2, hip); ctx.lineTo(cx + w * 0.2, hip);
      ctx.moveTo(cx - w * 0.15, hip); ctx.lineTo(cx - w * 0.22, y + h - 2);
      ctx.moveTo(cx + w * 0.15, hip); ctx.lineTo(cx + w * 0.22, y + h - 2);
      ctx.moveTo(cx - w * 0.28, spineTop + 4); ctx.lineTo(cx - w * 0.45, spineTop + 16);
      ctx.moveTo(cx + w * 0.28, spineTop + 4); ctx.lineTo(cx + w * 0.45, spineTop + 16);
      ctx.stroke();
    }
    // Arcs of electricity crawling over it
    ctx.strokeStyle = '#E0FFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      let px = x + ((frame * 7 + i * 13) % w), py = y;
      ctx.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += ((frame + i + k) % 2 ? 6 : -6); py += h / 4; ctx.lineTo(px, py); }
    }
    ctx.stroke();
    return;
  }
  // Collapsed into a smoking black heap
  const k = clamp01((t - 40) / 8);
  const heapH = h * (1 - k) + 12 * k;
  ctx.globalAlpha = fadeOut(d, 15);
  ctx.fillStyle = mix(d.color, '#1C1917', 0.9);
  ctx.beginPath(); ctx.roundRect(x - 4 * k, y + h - heapH, w + 8 * k, heapH, 4 * k); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + w * 0.35, y + h - heapH + 3, 3, 3);
  ctx.fillRect(x + w * 0.55, y + h - heapH + 3, 3, 3);
};

/** Slumps down into a bubbling green puddle, its eyes the last thing to sink. */
const drawMelted = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const { x, y, w, h, t } = d;
  const p = clamp01(t / 60);
  const bodyH = Math.max(6, h * (1 - p));
  const bodyW = w * (1 + p * 0.9);
  const bx = x + w / 2 - bodyW / 2, by = y + h - bodyH;
  ctx.globalAlpha = fadeOut(d, 25);
  // Puddle spreading underneath
  ctx.fillStyle = '#4D7C0F';
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 2, bodyW * 0.7 + 6, 5 + p * 4, 0, 0, Math.PI * 2); ctx.fill();
  // The slumping body, going green
  ctx.fillStyle = mix(d.color, '#65A30D', p * 1.3);
  ctx.beginPath(); ctx.roundRect(bx, by, bodyW, bodyH, [Math.min(12, bodyH / 2) * p + 2, Math.min(12, bodyH / 2) * p + 2, 2, 2]); ctx.fill();
  // Drips running down it
  ctx.fillStyle = '#84CC16';
  for (let i = 0; i < 4; i++) {
    const dx = bx + (i + 0.5) * bodyW / 4;
    const len = ((t * 1.5 + i * 9) % Math.max(8, bodyH));
    ctx.fillRect(dx - 1.5, by, 3, len);
    ctx.beginPath(); ctx.arc(dx, by + len, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // Bubbles popping on top
  for (let i = 0; i < 3; i++) {
    const r = ((frame + i * 11) % 14) / 3;
    ctx.strokeStyle = '#D9F99D';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx + (i + 1) * bodyW / 4, by + 2, r, 0, Math.PI * 2); ctx.stroke();
  }
  // Eyes sinking into the goo
  if (t < 85) {
    const ey = by + Math.min(bodyH * 0.35, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(x + w / 2 - 6, ey, 3.5, 0, Math.PI * 2); ctx.arc(x + w / 2 + 6, ey + 1, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + w / 2 - 7, ey, 2, 2);
    ctx.fillRect(x + w / 2 + 5, ey + 1, 2, 2);
  }
};

/** Flung off black and glistening, then splatted flat in its own oil slick. */
const drawGreased = (ctx: Ctx, d: EnemyDeath, frame: number) => {
  const { x, y, w, h } = d;
  if (!d.landed) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(d.rot);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 3, 4, h - 6);
    return;
  }
  ctx.globalAlpha = fadeOut(d, 40);
  const cx = x + w / 2, fy = d.floorY;
  // The slick
  ctx.fillStyle = '#111111';
  ctx.beginPath(); ctx.ellipse(cx, fy - 2, w * 1.1, 7, 0, 0, Math.PI * 2); ctx.fill();
  // The body in a flattened heap in it
  ctx.fillStyle = '#1C1917';
  ctx.beginPath(); ctx.roundRect(cx - w * 0.6, fy - 14, w * 1.2, 13, [8, 8, 2, 2]); ctx.fill();
  // Greasy rainbow sheen
  const shine = (frame * 0.8) % (w * 1.2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(cx - w * 0.6 + shine, fy - 12, 5, 9);
  ctx.fillStyle = 'rgba(147, 51, 234, 0.35)';
  ctx.beginPath(); ctx.ellipse(cx + w * 0.4, fy - 2, 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
};

/** Flattened like a pancake on the floor, gore squeezed out the sides. */
const drawPancaked = (ctx: Ctx, d: EnemyDeath) => {
  const { x, y, w, h } = d;
  ctx.globalAlpha = fadeOut(d, 30);
  const cx = x + w / 2, fy = y + h;
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath(); ctx.ellipse(cx, fy - 2, w * 1.05, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath(); ctx.ellipse(cx - w * 0.7, fy - 2, 6, 3, 0, 0, Math.PI * 2); ctx.ellipse(cx + w * 0.75, fy - 2, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = d.color;
  ctx.fillRect(cx - w * 0.75, fy - 7, w * 1.5, 6);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(cx - w * 0.75, fy - 3, w * 1.5, 2);
  // X'd-out eyes
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (const ex of [cx - 6, cx + 4]) { ctx.moveTo(ex - 2, fy - 6); ctx.lineTo(ex + 2, fy - 3); ctx.moveTo(ex + 2, fy - 6); ctx.lineTo(ex - 2, fy - 3); }
  ctx.stroke();
};
