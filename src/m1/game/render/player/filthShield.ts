// The filth shield round Meathead: not a clean green bubble, a skin of sewage. A lumpy membrane of muck that wobbles
// and sags at the bottom, darker at the rim and thinner in the middle (so he's still to be seen in there), brown
// streaks swirling round in it, chunks going round in it (a turd, a clot, a kernel of corn, a strip of toilet paper),
// bubbles coming up through it and popping, drips gathering underneath and falling off, flies round it and stink
// coming off the top. In its last couple of seconds it thins out and flickers.

type Ctx = CanvasRenderingContext2D;

const R = 42;
const r = Math.round;

/** Its edge at angle `a` (y down, so the bottom of it's at +PI/2: that's where it sags). */
const edgeAt = (a: number, f: number) =>
  R + Math.sin(a * 3 + f * 0.09) * 2.5 + Math.sin(a * 5 - f * 0.13) * 1.5 + Math.max(0, Math.sin(a)) * 3;

const blob = (ctx: Ctx, cx: number, cy: number, f: number, inset: number) => {
  ctx.beginPath();
  const n = 32;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2, d = edgeAt(a, f) - inset;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
};

/** The chunks going round in it. */
const drawChunk = (ctx: Ctx, kind: number, x: number, y: number) => {
  x = r(x); y = r(y);
  switch (kind) {
    case 0: // a turd
      ctx.fillStyle = '#5D4037'; ctx.fillRect(x - 4, y, 8, 3); ctx.fillRect(x - 3, y - 2, 6, 2); ctx.fillRect(x - 1, y - 4, 3, 2);
      ctx.fillStyle = '#8D6E63'; ctx.fillRect(x - 3, y, 2, 1); ctx.fillRect(x - 2, y - 2, 2, 1);
      break;
    case 1: // a clot of something
      ctx.fillStyle = '#33401A'; ctx.fillRect(x - 3, y - 2, 6, 4); ctx.fillRect(x - 2, y - 3, 3, 6);
      ctx.fillStyle = '#556B2F'; ctx.fillRect(x - 2, y - 2, 2, 2);
      break;
    case 2: // a kernel of corn
      ctx.fillStyle = '#FBC02D'; ctx.fillRect(x - 1, y - 1, 3, 3);
      ctx.fillStyle = '#FFF59D'; ctx.fillRect(x - 1, y - 1, 1, 1);
      break;
    default: // a strip of toilet paper
      ctx.fillStyle = '#E7E5D8'; ctx.fillRect(x - 5, y - 1, 10, 2); ctx.fillRect(x + 3, y + 1, 3, 2);
      ctx.fillStyle = '#B8B39A'; ctx.fillRect(x - 2, y - 1, 1, 2);
  }
};

export const drawFilthShield = (ctx: Ctx, cx: number, cy: number, f: number, timer: number) => {
  ctx.save();
  // (running out: it thins, and in its last second it flickers)
  const ending = timer < 120 ? timer / 120 : 1;
  if (timer < 60 && Math.floor(f / 4) % 2 === 0) ctx.globalAlpha = 0.45;
  const a0 = ctx.globalAlpha;

  // The muck, in bands: thick and dark at the rim, thinner going in, thin enough in the middle to see him through
  ctx.globalAlpha = a0 * (0.45 + 0.25 * ending);
  blob(ctx, cx, cy, f, 0); ctx.fillStyle = '#4A3F1C'; ctx.fill();
  ctx.globalAlpha = a0 * (0.4 + 0.2 * ending);
  blob(ctx, cx, cy, f, 5); ctx.fillStyle = '#6B6A28'; ctx.fill();
  ctx.globalAlpha = a0 * 0.3;
  blob(ctx, cx, cy, f, 12); ctx.fillStyle = '#8A9A35'; ctx.fill();

  // Inside it: brown streaks swirling round, bubbles coming up
  ctx.save();
  blob(ctx, cx, cy, f, 0); ctx.clip();
  ctx.globalAlpha = a0 * 0.7;
  ctx.strokeStyle = '#5D4037'; ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    const rad = R - 4 - k * 6, start = f * (0.02 + k * 0.007) * (k % 2 ? -1 : 1) + k * 1.7;
    ctx.lineWidth = 3 - (k % 2);
    ctx.beginPath(); ctx.arc(cx, cy, rad, start, start + 0.9 + (k % 3) * 0.3); ctx.stroke();
  }
  // (a yellow-ish scum along the bottom where it's pooled)
  ctx.globalAlpha = a0 * 0.4; ctx.fillStyle = '#C0A030';
  ctx.fillRect(cx - R, cy + R - 10 + r(Math.sin(f * 0.07) * 1.5), R * 2, 3);
  ctx.globalAlpha = a0 * 0.8;
  for (let k = 0; k < 4; k++) {
    const life = (f + k * 23) % 60;
    const bx = cx + Math.sin(k * 2.3) * 24 + Math.sin((f + k * 13) * 0.1) * 2;
    const by = cy + 30 - life * 1.0;
    ctx.strokeStyle = '#D4E157'; ctx.lineWidth = 1;
    if (life < 54) { ctx.beginPath(); ctx.arc(r(bx), r(by), 2 + (k % 2), 0, Math.PI * 2); ctx.stroke(); }
    else { // pop
      ctx.fillStyle = '#D4E157';
      ctx.fillRect(r(bx) - 4, r(by), 2, 1); ctx.fillRect(r(bx) + 3, r(by), 2, 1); ctx.fillRect(r(bx), r(by) - 4, 1, 2);
    }
  }
  ctx.restore();

  // The chunks going round in it, near the rim
  ctx.globalAlpha = a0;
  for (let k = 0; k < 5; k++) {
    const a = f * 0.025 + (k * Math.PI * 2) / 5 + Math.sin(f * 0.05 + k) * 0.15;
    const d = edgeAt(a, f) - 7;
    drawChunk(ctx, k % 4, cx + Math.cos(a) * d, cy + Math.sin(a) * d);
  }

  // The edge: a dark skin round it, a sickly shine along the top-left of it, a couple of glints
  blob(ctx, cx, cy, f, 0);
  ctx.strokeStyle = '#2A2410'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = '#D4E157'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * 1.05 + (i / 10) * Math.PI * 0.55, d = edgeAt(a, f) - 3;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#F0F4C3';
  ctx.fillRect(r(cx - 24), r(cy - 26), 3, 2); ctx.fillRect(r(cx - 28), r(cy - 20), 1, 1);

  // Drips gathering under it, stretching, and letting go
  for (let k = 0; k < 3; k++) {
    const cyc = 50 + k * 9, life = (f + k * 17) % cyc;
    const a = Math.PI / 2 + (k - 1) * 0.55;
    const dx = cx + Math.cos(a) * edgeAt(a, f), dy = cy + Math.sin(a) * edgeAt(a, f) - 1;
    ctx.fillStyle = '#4A3F1C';
    if (life < 30) { const len = r(life / 6); ctx.fillRect(r(dx) - 1, r(dy), 3, len + 1); ctx.fillRect(r(dx) - 2, r(dy) + len, 5, 3); }
    else { const t = life - 30; ctx.fillRect(r(dx) - 1, r(dy + 6 + t * t * 0.12), 3, 4); }
  }

  // Stink coming off the top
  ctx.strokeStyle = 'rgba(160, 180, 60, 0.6)'; ctx.lineWidth = 2;
  for (let k = 0; k < 2; k++) {
    const life = (f + k * 30) % 60, sx = cx + (k ? 12 : -12), sy = cy - R - 2 - life * 0.4;
    ctx.globalAlpha = a0 * (1 - life / 60);
    ctx.beginPath();
    for (let j = 0; j <= 4; j++) { const y = sy - j * 4, x = sx + Math.sin(j * 1.6 + f * 0.12 + k) * 3; if (j) ctx.lineTo(r(x), r(y)); else ctx.moveTo(r(x), r(y)); }
    ctx.stroke();
  }

  // Flies round it
  ctx.globalAlpha = a0;
  for (let k = 0; k < 3; k++) {
    const t = f * (0.07 + k * 0.013) + k * 2.1;
    const fx = cx + Math.cos(t) * (R + 9 + Math.sin(t * 2.7) * 5), fy = cy - 8 + Math.sin(t * 1.3) * (R * 0.8) + Math.sin(f * 0.9 + k) * 1.5;
    ctx.fillStyle = '#111111'; ctx.fillRect(r(fx), r(fy), 2, 2);
    ctx.fillStyle = 'rgba(220, 230, 240, 0.8)';
    if (f % 2) { ctx.fillRect(r(fx) - 1, r(fy) - 1, 1, 1); ctx.fillRect(r(fx) + 2, r(fy) - 1, 1, 1); }
  }
  ctx.restore();
};
