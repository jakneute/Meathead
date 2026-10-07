// The inked look, for the gross-ups and the kill cameras: painted in far more (and far worse) detail than anything in
// the game, in the Ren & Stimpy way: every bloodshot vein, bad tooth, pore and drip, an ink line round all of it.
// Fills with their ink lines, gradients, specks and hatching; flames, smoke and blood; dead faces, bones and skulls.
// Used by the souvenir close-ups, Barry's dumpster and Hector's Coast Guard beating.

type Ctx = CanvasRenderingContext2D;
export const INK = '#1A0B06';

export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------------------
// The kit
// ---------------------------------------------------------------------------

export const lin = (ctx: Ctx, y0: number, y1: number, stops: [number, string][]) => {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [k, c] of stops) g.addColorStop(k, c);
  return g;
};

/** A fill and the ink line round it (the shape's drawn by `path`). */
export const shape = (ctx: Ctx, path: () => void, fill: string | CanvasGradient, line = 1) => {
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill();
  if (line > 0) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.lineJoin = 'round'; ctx.stroke(); }
};

/** Specks over an area: grime, pores, stubble, gravel. */
export const speckle = (ctx: Ctx, x: number, y: number, w: number, h: number, n: number, color: string, seed: number, size = 0.5) => {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) ctx.fillRect(x + hash(i * 1.37 + seed) * w, y + hash(i * 2.91 + seed * 1.7) * h, size, size);
};

/** Hatching: short ink strokes for the shadow side of something. */
export const hatch = (ctx: Ctx, x: number, y: number, w: number, h: number, step: number, alpha = 0.35) => {
  ctx.strokeStyle = `rgba(26, 11, 6, ${alpha})`; ctx.lineWidth = 0.35;
  for (let k = -h; k < w; k += step) { ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h * 0.6, y); ctx.stroke(); }
};

/** Flames: tongues of it, red out to yellow-white in, ink round the outside. */
export const flames = (ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) => {
  const n = Math.max(3, Math.round(w / 7));
  for (const [col, k, line] of [['#B91C1C', 1, 0.8], ['#F97316', 0.75, 0], ['#FDE047', 0.48, 0], ['#FFFBEB', 0.22, 0]] as const) {
    for (let i = 0; i < n; i++) {
      const fx = x + (i + 0.5) * (w / n) + (hash(i + seed) - 0.5) * 4;
      const fh = h * (0.55 + hash(i * 3 + seed) * 0.45) * k, fw = (w / n) * 0.75 * (0.6 + k * 0.4);
      ctx.beginPath(); ctx.moveTo(fx - fw, y);
      ctx.bezierCurveTo(fx - fw, y - fh * 0.5, fx - fw * 0.2 + (hash(i + seed * 2) - 0.5) * 5, y - fh * 0.7, fx + (hash(i * 5 + seed) - 0.5) * 6, y - fh);
      ctx.bezierCurveTo(fx + fw * 0.4, y - fh * 0.6, fx + fw, y - fh * 0.4, fx + fw, y);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
    }
  }
};

/** A column of smoke: lumpy puffs, lit on one side, going up and out. */
export const smoke = (ctx: Ctx, x: number, y: number, r: number, rise: number, seed: number, dark = true) => {
  for (let i = 0; i < 9; i++) {
    const k = i / 8, px = x + Math.sin(i * 1.3 + seed) * r * (0.4 + k), py = y - k * rise, pr = r * (0.6 + k * 0.9) * (0.8 + hash(i + seed) * 0.4);
    const g = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
    g.addColorStop(0, dark ? '#6B6460' : '#E7E5E4'); g.addColorStop(1, dark ? '#1C1917' : '#9CA3AF');
    ctx.globalAlpha = 0.85 - k * 0.35;
    ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(26, 11, 6, 0.5)'; ctx.lineWidth = 0.5; ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

/** A splat of blood: the pool, the spatter round it, drips running off it if it's on a wall. */
export const blood = (ctx: Ctx, x: number, y: number, r: number, seed: number, drips = 0) => {
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  for (let a = 0; a <= 16; a++) { const ang = (a / 16) * Math.PI * 2, rr = r * (0.7 + hash(a + seed) * 0.6); ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.6); }
  ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(x - r * 0.15, y - r * 0.1, r * 0.55, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 200, 200, 0.6)'; ctx.fillRect(x - r * 0.4, y - r * 0.25, r * 0.25, 0.6);
  ctx.fillStyle = '#7F1D1D';
  for (let i = 0; i < 10; i++) { const a = hash(i * 7 + seed) * Math.PI * 2, d = r * (1.1 + hash(i + seed * 3) * 0.9); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.6, 0.4 + hash(i * 3 + seed) * 1.1, 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < drips; i++) { const dx = x + (hash(i * 11 + seed) - 0.5) * r * 1.4, len = 4 + hash(i * 13 + seed) * 12; ctx.fillRect(dx, y, 0.9, len); ctx.beginPath(); ctx.arc(dx + 0.45, y + len, 0.9, 0, Math.PI * 2); ctx.fill(); }
};

/**
 * A dead face, Ren & Stimpy close: the head, lumpy, inked; the eyes bulging out of it (one bigger), bloodshot,
 * pupils shrunk to pinpricks; bags under them in rings; the mouth hanging open, gums, crooked yellow teeth (one
 * missing), the tongue lolling out; stubble, pores, a sheen of sweat.
 */
export const deadFace = (ctx: Ctx, x: number, y: number, s: number, o: { skin: string; shade: string; tongue?: boolean; charred?: number; tilt?: number; xEyes?: boolean } ) => {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(o.tilt ?? 0); ctx.scale(s, s);
  // The head
  const head = () => { ctx.moveTo(-14, -12); ctx.bezierCurveTo(-16, -24, 14, -26, 15, -12); ctx.bezierCurveTo(18, 2, 12, 16, 2, 18); ctx.bezierCurveTo(-8, 19, -17, 6, -14, -12); };
  const hg = ctx.createRadialGradient(-4, -10, 2, 0, -2, 22);
  hg.addColorStop(0, o.skin); hg.addColorStop(1, o.shade);
  shape(ctx, head, hg, 1.1);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  speckle(ctx, -16, -24, 34, 44, 160, 'rgba(70, 30, 10, 0.35)', 3, 0.35);
  speckle(ctx, -12, 4, 24, 14, 90, 'rgba(40, 30, 30, 0.55)', 5, 0.4); // stubble
  if (o.charred) { ctx.fillStyle = `rgba(20, 12, 8, ${o.charred})`; ctx.fillRect(-20, -30, 40, 50); speckle(ctx, -16, -24, 34, 44, 120, 'rgba(255, 120, 40, 0.35)', 9, 0.5); }
  ctx.restore();
  // Wrinkles across the brow
  ctx.strokeStyle = 'rgba(26, 11, 6, 0.6)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-8, -18 + k * 2); ctx.quadraticCurveTo(0, -20 + k * 2, 8, -18 + k * 2); ctx.stroke(); }
  // The eyes: bulging, bloodshot, one bigger than the other
  for (const [ex, er] of [[-6, 5.2], [6.5, 6.4]] as const) {
    // (the bags under them)
    ctx.strokeStyle = 'rgba(26, 11, 6, 0.55)'; ctx.lineWidth = 0.4;
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(ex, -6 + er * 0.4, er + k * 1.1, 0.3, Math.PI - 0.3); ctx.stroke(); }
    const eg = ctx.createRadialGradient(ex - er * 0.3, -8 - er * 0.3, 0.5, ex, -7, er);
    eg.addColorStop(0, '#FFFFF4'); eg.addColorStop(0.7, '#F5E6D3'); eg.addColorStop(1, '#E8B4A0');
    ctx.beginPath(); ctx.arc(ex, -7, er, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
    // (veins in from the edge)
    ctx.strokeStyle = 'rgba(200, 30, 30, 0.8)'; ctx.lineWidth = 0.25;
    for (let v = 0; v < 7; v++) {
      const a = (v / 7) * Math.PI * 2 + ex, r0 = er * 0.98;
      ctx.beginPath(); ctx.moveTo(ex + Math.cos(a) * r0, -7 + Math.sin(a) * r0);
      ctx.quadraticCurveTo(ex + Math.cos(a + 0.4) * r0 * 0.6, -7 + Math.sin(a + 0.4) * r0 * 0.6, ex + Math.cos(a + 0.2) * r0 * 0.4, -7 + Math.sin(a + 0.2) * r0 * 0.4);
      ctx.stroke();
    }
    if (o.xEyes) {
      ctx.strokeStyle = INK; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(ex - 2, -9); ctx.lineTo(ex + 2, -5); ctx.moveTo(ex + 2, -9); ctx.lineTo(ex - 2, -5); ctx.stroke();
    } else {
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + 0.6, -6.4, 0.7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - er * 0.5, -7 - er * 0.55, 1, 1);
    }
  }
  // The nose: a big lumpy one, a hair out of it
  shape(ctx, () => { ctx.moveTo(-1, -3); ctx.bezierCurveTo(-5, 2, -4, 6, 0, 6); ctx.bezierCurveTo(5, 6, 5, 2, 1.5, -3); }, o.shade, 0.7);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.25; ctx.beginPath(); ctx.moveTo(-1, 5.8); ctx.lineTo(-1.6, 7.6); ctx.stroke();
  // The mouth, hanging open: gums, the teeth (crooked, yellow, one gone), the tongue out over the lip
  shape(ctx, () => { ctx.moveTo(-8, 9); ctx.quadraticCurveTo(0, 7, 8, 9); ctx.quadraticCurveTo(6, 17, 0, 17); ctx.quadraticCurveTo(-6, 17, -8, 9); }, '#3F0D0D', 0.8);
  ctx.fillStyle = '#C2566B'; ctx.fillRect(-7, 9, 14, 1.2);
  for (let k = 0; k < 6; k++) { if (k === 3) continue; ctx.fillStyle = k % 2 ? '#E8D48A' : '#F2E3A6'; ctx.fillRect(-6.5 + k * 2.2, 9.8 + (k % 3) * 0.3, 1.9, 2 + (k % 2) * 0.6); ctx.strokeStyle = 'rgba(26,11,6,0.6)'; ctx.lineWidth = 0.2; ctx.strokeRect(-6.5 + k * 2.2, 9.8 + (k % 3) * 0.3, 1.9, 2 + (k % 2) * 0.6); }
  if (o.tongue !== false) {
    shape(ctx, () => { ctx.moveTo(-3, 14); ctx.quadraticCurveTo(-4, 22, 1, 23); ctx.quadraticCurveTo(5, 22, 4, 14); }, '#E06A84', 0.7);
    ctx.strokeStyle = 'rgba(120, 20, 40, 0.6)'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(0.5, 15); ctx.lineTo(0.8, 21); ctx.stroke();
  }
  // Sweat on the brow
  for (let i = 0; i < 5; i++) { const bx = -10 + hash(i * 4.1) * 20, by = -20 + hash(i * 2.3) * 6; ctx.fillStyle = 'rgba(255, 255, 240, 0.55)'; ctx.beginPath(); ctx.ellipse(bx, by, 0.7, 1, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
};

/** A bone (two knobs each end). */
export const bone = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w: number) => {
  ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = w + 1;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.strokeStyle = '#F1E9D2'; ctx.lineWidth = w; ctx.stroke();
  for (const [bx, by] of [[x0, y0], [x1, y1]]) for (const d of [-1, 1]) {
    const nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
    ctx.fillStyle = '#F1E9D2'; ctx.beginPath(); ctx.arc(bx + (nx / l) * d * w * 0.6, by + (ny / l) * d * w * 0.6, w * 0.75, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.stroke();
  }
};

/** A skull: the dome, the sockets (dark, a glint of nothing in them), the nose hole, the grin. */
export const skull = (ctx: Ctx, x: number, y: number, s: number, tilt = 0) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-3, -6, 1, 0, -2, 14);
  g.addColorStop(0, '#FFFBEA'); g.addColorStop(1, '#C9BB94');
  shape(ctx, () => { ctx.moveTo(-10, 2); ctx.bezierCurveTo(-12, -14, 12, -14, 10, 2); ctx.lineTo(7, 6); ctx.lineTo(7, 10); ctx.lineTo(-7, 10); ctx.lineTo(-7, 6); ctx.closePath(); }, g, 0.9);
  ctx.fillStyle = '#1C1410';
  ctx.beginPath(); ctx.ellipse(-4.2, -1, 3, 3.4, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.2, -1, 3, 3.4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-1.2, 5); ctx.lineTo(1.2, 5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.4;
  for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * 1.8, 6.5); ctx.lineTo(k * 1.8, 9.8); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-6.5, 8.2); ctx.lineTo(6.5, 8.2); ctx.stroke();
  // (a crack across the top)
  ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(0, -7); ctx.lineTo(-1, -5); ctx.lineTo(1.5, -3.5); ctx.stroke();
  ctx.restore();
};
