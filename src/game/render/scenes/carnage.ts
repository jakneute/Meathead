// The carnage photos on the damage report: the scene of each job, shot by the cleanup crew's photographer, painted
// in far more (and far worse) detail than anything in the game: gross-ups in the Ren & Stimpy way, every bloodshot
// vein, bad tooth, pore and drip. One for each target.
//
// Each is in art coordinates, 256 x 144, drawn three times finer (the photo's canvas is 768 x 432).

type Ctx = CanvasRenderingContext2D;
const W = 256, H = 144;
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

/** The photo's finish: the flash's hot spot, dark corners, film grain, the date stamp in the corner, and its caption. */
const photoFinish = (ctx: Ctx, stamp: string) => {
  const f = ctx.createRadialGradient(W * 0.42, H * 0.4, 4, W * 0.42, H * 0.4, 120);
  f.addColorStop(0, 'rgba(255, 255, 240, 0.12)'); f.addColorStop(1, 'rgba(255, 255, 240, 0)');
  ctx.fillStyle = f; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H / 2, 70, W / 2, H / 2, 160);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(255,255,240,0.06)' : 'rgba(0,0,0,0.09)';
    ctx.fillRect(hash(i * 3.1 + 0.5) * W, hash(i * 7.7 + 0.25) * H, 0.6, 0.6);
  }
  ctx.font = 'bold 6px "Courier New", monospace'; ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 140, 30, 0.95)'; ctx.fillText(stamp, W - 6, H - 6);
  ctx.textAlign = 'left';
};

// ---------------------------------------------------------------------------
// The photos
// ---------------------------------------------------------------------------

/** Artie: the ranger station, flattened by the avalanche; a ranger frozen solid in a block of ice up front. */
const artie = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, 70, [[0, '#7DA7C9'], [1, '#D6E6F2']]); ctx.fillRect(0, 0, W, H);
  // The mountain, the tram dangling off its snapped cable
  shape(ctx, () => { ctx.moveTo(0, 70); ctx.lineTo(70, 12); ctx.lineTo(110, 36); ctx.lineTo(150, 4); ctx.lineTo(256, 60); ctx.lineTo(256, 90); ctx.lineTo(0, 90); }, lin(ctx, 4, 90, [[0, '#FFFFFF'], [1, '#B9CFE0']]), 1);
  hatch(ctx, 150, 10, 60, 50, 3, 0.18);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(150, 6); ctx.quadraticCurveTo(190, 30, 214, 40); ctx.stroke();
  shape(ctx, () => { ctx.rect(206, 42, 16, 11); }, '#B91C1C', 0.8);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(208, 44, 5, 4); ctx.fillRect(215, 44, 5, 4);
  // The snow it came down in: a slope of it, heaped over the station
  shape(ctx, () => { ctx.moveTo(0, 82); ctx.quadraticCurveTo(80, 60, 150, 84); ctx.quadraticCurveTo(200, 96, 256, 86); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, lin(ctx, 60, 144, [[0, '#FFFFFF'], [1, '#C7D8E6']]), 1);
  // The station: the roof crushed flat, splintered planks sticking out every way, the RANGER STATION sign snapped
  for (let k = 0; k < 9; k++) {
    const px = 112 + k * 9, a = (hash(k * 3) - 0.5) * 1.6;
    ctx.save(); ctx.translate(px, 84); ctx.rotate(a); shape(ctx, () => ctx.rect(-14, -2, 28, 4), k % 2 ? '#7C4A21' : '#92582A', 0.6);
    ctx.strokeStyle = 'rgba(26,11,6,0.4)'; ctx.lineWidth = 0.25; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, -0.5); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.translate(176, 78); ctx.rotate(0.5); shape(ctx, () => ctx.rect(-18, -5, 36, 10), '#166534', 0.8);
  ctx.fillStyle = '#FEF9C3'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('RANGER STAT', -16, 1.4); ctx.restore();
  // A pair of skis straight up out of the snow, a moose's antlers just showing
  for (const sx of [40, 46]) { ctx.save(); ctx.translate(sx, 92); ctx.rotate(sx === 40 ? -0.12 : 0.1); shape(ctx, () => ctx.roundRect(-2, -34, 4, 36, 2), '#DC2626', 0.7); ctx.restore(); }
  for (const d of [-1, 1]) shape(ctx, () => { ctx.moveTo(228 + d * 2, 100); ctx.lineTo(228 + d * 14, 88); ctx.lineTo(228 + d * 12, 84); ctx.lineTo(228 + d * 18, 82); ctx.lineTo(228 + d * 16, 78); ctx.lineTo(228 + d * 8, 86); ctx.lineTo(228 + d * 6, 80); ctx.lineTo(228 + d * 2, 94); }, '#C8A672', 0.7);
  // Up front: the ice block, a ranger frozen solid in it, his hat still on, an icicle off his nose
  shape(ctx, () => ctx.rect(14, 92, 84, 50), 'rgba(170, 215, 240, 0.55)', 1.2);
  deadFace(ctx, 56, 116, 1.25, { skin: '#B5D3E6', shade: '#6E98B8', tilt: -0.15 });
  shape(ctx, () => { ctx.moveTo(32, 96); ctx.lineTo(80, 96); ctx.lineTo(74, 88); ctx.lineTo(38, 88); }, '#8B5E34', 0.8);
  shape(ctx, () => { ctx.moveTo(42, 89); ctx.quadraticCurveTo(56, 74, 70, 89); }, '#A0703E', 0.8);
  shape(ctx, () => { ctx.moveTo(55, 124); ctx.lineTo(57, 124); ctx.lineTo(56, 134); }, '#E0F2FE', 0.4);
  // (the ice: highlights, cracks, frost round the edges)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(18, 95, 3, 30); ctx.fillRect(23, 95, 1.2, 18);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(80, 94); ctx.lineTo(86, 108); ctx.lineTo(82, 116); ctx.lineTo(92, 128); ctx.stroke();
  speckle(ctx, 14, 92, 84, 50, 220, 'rgba(255,255,255,0.5)', 21, 0.5);
  photoFinish(ctx, "'99 01 14  EXHIBIT 1");
};

/** Victor: the VIP lounge after the blowup: lava through the floor, an investor cooked in his booth, the disco ball melting. */
const victor = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, H, [[0, '#2A0505'], [1, '#120202']]); ctx.fillRect(0, 0, W, H);
  // The walls: velvet, scorched, the CLUB CALDERA neon half out
  for (let x = 0; x < W; x += 16) { ctx.fillStyle = x % 32 ? '#4A0B14' : '#3B0710'; ctx.fillRect(x, 0, 16, 92); }
  hatch(ctx, 0, 0, W, 92, 4, 0.25);
  ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillStyle = '#F472B6'; ctx.shadowColor = '#EC4899'; ctx.shadowBlur = 6;
  ctx.fillText('CLUB CAL', 150, 22); ctx.shadowBlur = 0; ctx.fillStyle = '#4B1530'; ctx.fillText('DERA', 214, 22);
  // The disco ball, melting: dripping silver off it
  ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(60, 14); ctx.stroke();
  shape(ctx, () => { ctx.arc(60, 24, 11, Math.PI, 0); ctx.bezierCurveTo(71, 34, 66, 40, 64, 46); ctx.lineTo(62, 36); ctx.lineTo(58, 44); ctx.lineTo(55, 34); ctx.bezierCurveTo(50, 34, 49, 28, 49, 24); }, '#A1A1AA', 0.8);
  for (let i = 0; i < 24; i++) { ctx.fillStyle = hash(i) > 0.5 ? '#F4F4F5' : '#71717A'; ctx.fillRect(51 + (i % 6) * 3, 15 + Math.floor(i / 6) * 3, 2.2, 2.2); }
  // The floor torn open, lava welling up through it, glowing
  ctx.fillStyle = '#1C1917'; ctx.fillRect(0, 92, W, 52);
  shape(ctx, () => { ctx.moveTo(0, 110); ctx.bezierCurveTo(60, 96, 120, 128, 256, 104); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, lin(ctx, 100, 144, [[0, '#FDE047'], [0.3, '#F97316'], [1, '#B91C1C']]), 1.2);
  ctx.strokeStyle = 'rgba(127, 29, 29, 0.8)'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(k * 34, 120 + (k % 3) * 6); ctx.quadraticCurveTo(k * 34 + 14, 114, k * 34 + 30, 124); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const bx = hash(i * 9) * W, by = 112 + hash(i * 4) * 28; ctx.fillStyle = '#FFFBEB'; ctx.beginPath(); ctx.arc(bx, by, 1 + hash(i) * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 0.4; ctx.stroke(); }
  // The booth, and the investor in it: charred, his suit smoking, still holding his martini (it's melted round his hand)
  shape(ctx, () => { ctx.moveTo(130, 96); ctx.quadraticCurveTo(130, 50, 170, 50); ctx.lineTo(230, 50); ctx.quadraticCurveTo(250, 50, 250, 96); }, '#7F1D1D', 1.2);
  shape(ctx, () => ctx.rect(150, 70, 70, 34), '#1F1F23', 1);
  ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.moveTo(180, 70); ctx.lineTo(186, 84); ctx.lineTo(192, 70); ctx.fill();
  shape(ctx, () => ctx.rect(184, 72, 4, 14), '#B91C1C', 0.4);
  deadFace(ctx, 186, 56, 1.4, { skin: '#C38A62', shade: '#5A2E18', charred: 0.45, tilt: 0.25 });
  smoke(ctx, 186, 30, 6, 28, 3);
  // (the martini: the glass slumped like taffy over his fingers, the olive still on its stick)
  shape(ctx, () => { ctx.moveTo(214, 82); ctx.quadraticCurveTo(226, 74, 230, 80); ctx.quadraticCurveTo(224, 92, 220, 96); }, 'rgba(220, 240, 255, 0.6)', 0.6);
  ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.arc(222, 82, 1.6, 0, Math.PI * 2); ctx.fill();
  // The velvet rope in the front, burning, a gold post bent over
  shape(ctx, () => ctx.rect(20, 76, 5, 40), '#CA8A04', 0.8);
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, 80); ctx.quadraticCurveTo(60, 100, 100, 84); ctx.stroke();
  flames(ctx, 40, 94, 50, 18, 7);
  photoFinish(ctx, "'99 02 27  EXHIBIT 2");
};

/** Ernie: the vault outside his door: the tour group under the rubble, the hipster on top of the pile, head first. */
const ernie = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, H, [[0, '#2B211A'], [1, '#120D0A']]); ctx.fillRect(0, 0, W, H);
  // The vault: old brick arches, a hole torn through the top of it, daylight and dust coming down it
  for (let y = 0; y < 100; y += 6) for (let x = (y / 6) % 2 ? -8 : 0; x < W; x += 16) { ctx.fillStyle = hash(x * 3 + y) > 0.5 ? '#5A3A26' : '#4A2E1E'; ctx.fillRect(x + 0.5, y + 0.5, 15, 5); }
  ctx.fillStyle = lin(ctx, 0, 110, [[0, 'rgba(255, 240, 200, 0.45)'], [1, 'rgba(255, 240, 200, 0)']]);
  ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(150, 0); ctx.lineTo(176, 110); ctx.lineTo(84, 110); ctx.fill();
  shape(ctx, () => { ctx.moveTo(104, 0); ctx.lineTo(112, 8); ctx.lineTo(120, 3); ctx.lineTo(134, 10); ctx.lineTo(146, 2); ctx.lineTo(156, 0); }, '#0A0806', 0.8);
  speckle(ctx, 90, 0, 80, 100, 260, 'rgba(255, 240, 210, 0.45)', 31, 0.6);
  // The pile: rubble and the tour group under it (legs in socks and sandals, an arm still holding up its camera, a
  // fanny pack, a guide's flag), the GIFT SHOP sign on top
  shape(ctx, () => { ctx.moveTo(30, 144); ctx.quadraticCurveTo(80, 92, 130, 84); ctx.quadraticCurveTo(190, 92, 236, 144); }, lin(ctx, 84, 144, [[0, '#8A7360'], [1, '#4A3A2E']]), 1.2);
  for (let i = 0; i < 26; i++) { const rx = 50 + hash(i * 3) * 160, ry = 100 + hash(i * 7) * 40; shape(ctx, () => { ctx.moveTo(rx, ry); ctx.lineTo(rx + 4 + hash(i) * 5, ry - 3); ctx.lineTo(rx + 8, ry + 2); ctx.lineTo(rx + 3, ry + 5); }, hash(i * 5) > 0.5 ? '#9C8572' : '#7A6656', 0.5); }
  for (const [lx, ly, a] of [[60, 120, -0.6], [200, 118, 0.7], [176, 130, 1.1]] as const) {
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a);
    shape(ctx, () => ctx.rect(-2, -22, 5, 22), '#F2C9A8', 0.7);
    shape(ctx, () => ctx.rect(-2.5, -8, 6, 6), '#F8FAFC', 0.5);
    shape(ctx, () => { ctx.moveTo(-3, -22); ctx.lineTo(5, -22); ctx.lineTo(7, -26); ctx.lineTo(-3, -26); }, '#78350F', 0.6);
    ctx.restore();
  }
  ctx.save(); ctx.translate(90, 104); ctx.rotate(-0.3);
  shape(ctx, () => ctx.rect(-2, -26, 5, 26), '#F2C9A8', 0.7);
  shape(ctx, () => ctx.rect(-5, -34, 11, 8), '#27272A', 0.7);
  ctx.fillStyle = '#93C5FD'; ctx.beginPath(); ctx.arc(0.5, -30, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  shape(ctx, () => ctx.roundRect(150, 110, 16, 8, 3), '#7C3AED', 0.6);
  blood(ctx, 120, 128, 12, 3);
  ctx.save(); ctx.translate(216, 100); ctx.rotate(0.4); shape(ctx, () => ctx.rect(-18, -6, 36, 12), '#FEF3C7', 0.8);
  ctx.fillStyle = '#7F1D1D'; ctx.font = 'bold 6px "Courier New", monospace'; ctx.fillText('GIFT SHOP', -16, 2); ctx.restore();
  // And on top: the hipster, head first into it up to the shoulders, legs in the air, skinny jeans, one shoe off,
  // his beanie a way off, the jet ski smoking behind him
  shape(ctx, () => ctx.roundRect(150, 60, 50, 18, 6), '#0EA5E9', 1);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(156, 64, 30, 3);
  smoke(ctx, 186, 56, 5, 30, 5);
  shape(ctx, () => { ctx.moveTo(118, 86); ctx.lineTo(140, 86); ctx.lineTo(136, 60); ctx.lineTo(122, 60); }, '#065F46', 1);
  for (const [lx, a] of [[124, -0.25], [134, 0.3]] as const) {
    ctx.save(); ctx.translate(lx, 62); ctx.rotate(a);
    shape(ctx, () => ctx.rect(-3, -34, 6, 34), '#1E3A8A', 0.8);
    shape(ctx, () => ctx.rect(-3, -38, 6, 4), '#E7E5E4', 0.6);
    ctx.restore();
  }
  shape(ctx, () => { ctx.moveTo(126, 26); ctx.lineTo(138, 22); ctx.lineTo(140, 28); ctx.lineTo(128, 31); }, '#A16207', 0.7);
  shape(ctx, () => { ctx.moveTo(70, 92); ctx.quadraticCurveTo(80, 80, 90, 92); }, '#DC2626', 0.7);
  blood(ctx, 129, 88, 9, 7);
  photoFinish(ctx, "'99 04 02  EXHIBIT 3");
};

/** Hector: the beach after: the Eye, burst like a balloon on the sand, a shark beached beside it, the kids on the daycare's roof. */
const hector = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, 70, [[0, '#94A3B8'], [1, '#E2E8F0']]); ctx.fillRect(0, 0, W, H);
  // The sea, flat and gray now; the daycare far off, flooded to the windows, the kids up on the roof cheering
  ctx.fillStyle = '#64748B'; ctx.fillRect(0, 58, W, 18);
  shape(ctx, () => ctx.rect(184, 36, 46, 30), '#FDE68A', 0.8);
  shape(ctx, () => { ctx.moveTo(180, 36); ctx.lineTo(207, 22); ctx.lineTo(234, 36); }, '#EF4444', 0.8);
  ctx.fillStyle = 'rgba(100, 116, 139, 0.85)'; ctx.fillRect(182, 54, 50, 12);
  for (let k = 0; k < 5; k++) { const kx = 190 + k * 8; ctx.fillStyle = ['#F87171', '#60A5FA', '#FACC15', '#34D399', '#C084FC'][k]; ctx.fillRect(kx - 1.5, 16 + (k % 2), 3, 5); ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(kx, 14 + (k % 2), 1.6, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#F2C9A8'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(kx - 1.5, 17); ctx.lineTo(kx - 3, 13); ctx.moveTo(kx + 1.5, 17); ctx.lineTo(kx + 3, 13); ctx.stroke(); }
  ctx.fillStyle = '#1F2937'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('LITTLE SUNSHINE', 186, 44);
  // The sand, wet and churned, junk washed up all over it
  shape(ctx, () => { ctx.moveTo(0, 74); ctx.quadraticCurveTo(128, 66, 256, 76); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, lin(ctx, 66, 144, [[0, '#D6C08A'], [1, '#A88B52']]), 1);
  speckle(ctx, 0, 70, W, 74, 700, 'rgba(90, 60, 20, 0.35)', 41, 0.5);
  // The Eye: a vast eyeball gone flat as a burst beach ball, the iris still staring up out of it, veins like hoses
  // across it, goo pooled round it
  shape(ctx, () => { ctx.ellipse(110, 118, 92, 20, 0, 0, Math.PI * 2); }, 'rgba(210, 225, 180, 0.7)', 0.8);
  shape(ctx, () => { ctx.moveTo(30, 116); ctx.bezierCurveTo(30, 60, 190, 50, 196, 112); ctx.bezierCurveTo(170, 132, 60, 134, 30, 116); }, lin(ctx, 60, 130, [[0, '#FFFDF5'], [1, '#E8C9B4']]), 1.3);
  ctx.strokeStyle = '#C2410C'; ctx.lineWidth = 1.4;
  for (let v = 0; v < 9; v++) { ctx.beginPath(); ctx.moveTo(34 + v * 18, 116 + (v % 2) * 4); ctx.bezierCurveTo(50 + v * 14, 96, 70 + v * 10, 104, 100 + v * 3, 86); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(185, 28, 28, 0.6)'; ctx.lineWidth = 0.4;
  for (let v = 0; v < 30; v++) { const vx = 40 + hash(v * 3) * 150, vy = 80 + hash(v * 5) * 40; ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + (hash(v) - 0.5) * 12, vy + (hash(v * 2) - 0.5) * 8); ctx.stroke(); }
  shape(ctx, () => ctx.ellipse(118, 86, 26, 14, -0.08, 0, Math.PI * 2), '#0E7490', 1);
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.5)'; ctx.lineWidth = 0.4;
  for (let a = 0; a < 24; a++) { const an = (a / 24) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(118 + Math.cos(an) * 9, 86 + Math.sin(an) * 5); ctx.lineTo(118 + Math.cos(an) * 24, 86 + Math.sin(an) * 13); ctx.stroke(); }
  shape(ctx, () => ctx.ellipse(118, 86, 9, 6, 0, 0, Math.PI * 2), '#020617', 0.6);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(112, 82, 3, 2, -0.4, 0, Math.PI * 2); ctx.fill();
  // (the puncture it went flat through, flapping)
  shape(ctx, () => { ctx.moveTo(176, 92); ctx.lineTo(188, 86); ctx.lineTo(186, 98); ctx.lineTo(192, 104); ctx.lineTo(178, 102); }, '#7F1D1D', 0.8);
  // A shark beached beside it, belly up, tongue out; a log of shit by it, flies over it
  shape(ctx, () => { ctx.moveTo(196, 130); ctx.quadraticCurveTo(220, 110, 250, 122); ctx.lineTo(256, 112); ctx.lineTo(256, 138); ctx.lineTo(250, 130); ctx.quadraticCurveTo(222, 140, 196, 130); }, '#64748B', 1);
  shape(ctx, () => { ctx.moveTo(198, 130); ctx.quadraticCurveTo(222, 138, 246, 130); ctx.quadraticCurveTo(222, 130, 198, 130); }, '#F1F5F9', 0.6);
  shape(ctx, () => ctx.ellipse(206, 126, 3.6, 3.6, 0, 0, Math.PI * 2), '#FFFFFF', 0.6);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(204.6, 124.6); ctx.lineTo(207.4, 127.4); ctx.moveTo(207.4, 124.6); ctx.lineTo(204.6, 127.4); ctx.stroke();
  shape(ctx, () => { ctx.moveTo(198, 131); ctx.quadraticCurveTo(194, 138, 199, 139); ctx.quadraticCurveTo(202, 136, 201, 131); }, '#F472B6', 0.5);
  shape(ctx, () => { ctx.ellipse(18, 132, 12, 4, 0.2, 0, Math.PI * 2); }, '#5B3A1A', 0.8);
  ctx.strokeStyle = 'rgba(26,11,6,0.5)'; ctx.lineWidth = 0.4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(10 + k * 5, 129); ctx.lineTo(12 + k * 5, 135); ctx.stroke(); }
  for (let f = 0; f < 6; f++) { const fx = 12 + hash(f * 3) * 20, fy = 118 + hash(f * 7) * 8; ctx.fillStyle = INK; ctx.fillRect(fx, fy, 1, 0.8); ctx.strokeStyle = 'rgba(26,11,6,0.4)'; ctx.lineWidth = 0.2; ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI); ctx.stroke(); }
  photoFinish(ctx, "'99 05 19  EXHIBIT 4");
};

/** Tommy: the block, after the wave: the houses melted down to their frames, the family still on the couch in front of the TV. */
const tommy = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, 80, [[0, '#4D7C0F'], [1, '#A3B18A']]); ctx.fillRect(0, 0, W, H);
  smoke(ctx, 40, 50, 10, 46, 11, false); smoke(ctx, 220, 52, 9, 40, 13, false);
  // The houses down the block: slumped, dripping, their frames showing through
  for (let k = 0; k < 4; k++) {
    const hx = 6 + k * 64, ht = 26 + (k % 2) * 8;
    shape(ctx, () => { ctx.moveTo(hx, 72); ctx.lineTo(hx, 72 - ht); ctx.lineTo(hx + 22, 72 - ht - 14); ctx.lineTo(hx + 44, 72 - ht); ctx.lineTo(hx + 44, 72); for (let d = 0; d < 6; d++) ctx.lineTo(hx + 44 - d * 8, 72 + (d % 2) * 6 + 2); }, ['#A78BFA', '#FCA5A5', '#93C5FD', '#FDE68A'][k], 0.9);
    ctx.strokeStyle = 'rgba(26,11,6,0.6)'; ctx.lineWidth = 0.6;
    for (let s = 0; s < 4; s++) { ctx.beginPath(); ctx.moveTo(hx + 6 + s * 10, 72 - ht + 4); ctx.lineTo(hx + 6 + s * 10, 76); ctx.stroke(); }
  }
  // The street: a river of green sludge, steaming, bubbling, a dog's skeleton paddling in it
  shape(ctx, () => { ctx.moveTo(0, 74); ctx.lineTo(256, 70); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, lin(ctx, 70, 144, [[0, '#84CC16'], [1, '#365314']]), 1);
  for (let i = 0; i < 26; i++) { const bx = hash(i * 13) * W, by = 80 + hash(i * 17) * 60; ctx.strokeStyle = 'rgba(217, 249, 157, 0.8)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(bx, by, 0.8 + hash(i) * 2.4, 0, Math.PI * 2); ctx.stroke(); }
  skull(ctx, 214, 86, 0.5, 0.3); bone(ctx, 202, 92, 224, 92, 1.4); bone(ctx, 206, 96, 210, 104, 1); bone(ctx, 218, 96, 222, 104, 1);
  // The living room, the front wall gone: the couch, the family on it (bones, a wig, Dad's dentures grinning), the TV still on
  shape(ctx, () => ctx.rect(34, 84, 120, 50), '#78716C', 1.1);
  shape(ctx, () => ctx.rect(40, 90, 108, 40), '#D6CBB5', 0.6);
  shape(ctx, () => { ctx.roundRect(48, 108, 92, 22, 5); }, '#9A3412', 1);
  shape(ctx, () => ctx.rect(50, 100, 88, 10), '#7C2D12', 0.8);
  for (const [sx, sy, s, t] of [[64, 96, 0.75, -0.15], [94, 94, 0.85, 0.05], [122, 100, 0.55, 0.25]] as const) {
    skull(ctx, sx, sy, s, t);
    bone(ctx, sx, sy + 8 * s, sx, sy + 20 * s, 2.2 * s);
    bone(ctx, sx - 6 * s, sy + 12 * s, sx - 2 * s, sy + 22 * s, 1.4 * s); bone(ctx, sx + 6 * s, sy + 12 * s, sx + 8 * s, sy + 20 * s, 1.4 * s);
  }
  shape(ctx, () => { ctx.moveTo(56, 88); ctx.bezierCurveTo(52, 80, 76, 78, 72, 90); }, '#F59E0B', 0.6);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(90, 98, 8, 2.4); ctx.fillStyle = '#FDA4AF'; ctx.fillRect(90, 97.2, 8, 0.9);
  shape(ctx, () => ctx.rect(150, 108, 28, 22), '#3F3F46', 1);
  ctx.fillStyle = '#A5F3FC'; ctx.fillRect(153, 111, 22, 15);
  ctx.fillStyle = '#0E7490'; ctx.font = 'bold 3px "Courier New", monospace'; ctx.fillText('BREAKING', 155, 116);
  // The sign out front, half sunk: TOMMY'S LAIR, its arrow pointing down, the paint run
  shape(ctx, () => ctx.rect(196, 106, 52, 16), '#111827', 1);
  ctx.fillStyle = '#FDE047'; ctx.shadowColor = '#FDE047'; ctx.shadowBlur = 4; ctx.font = 'bold 6px "Courier New", monospace'; ctx.fillText("TOMMY'S LAIR", 198, 117); ctx.shadowBlur = 0;
  shape(ctx, () => { ctx.moveTo(214, 124); ctx.lineTo(230, 124); ctx.lineTo(222, 134); }, '#FDE047', 0.7);
  photoFinish(ctx, "'99 06 30  EXHIBIT 5");
};

/** Barry: the power room: Gary, fried at his desk with his headset melted on, his hair stood straight up, the fern beside him. */
const barry = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, H, [[0, '#0F172A'], [1, '#020617']]); ctx.fillRect(0, 0, W, H);
  // The room: blown generators, their doors hanging, smoke, a window on the dark city
  shape(ctx, () => ctx.rect(170, 10, 76, 46), '#020617', 1);
  for (let k = 0; k < 8; k++) shape(ctx, () => ctx.rect(174 + k * 9, 56 - 10 - hash(k) * 30, 7, 46), '#1E293B', 0.4);
  ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.strokeRect(170, 10, 76, 46); ctx.beginPath(); ctx.moveTo(208, 10); ctx.lineTo(208, 56); ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const gx = 6 + k * 52;
    shape(ctx, () => ctx.rect(gx, 22, 44, 70), '#334155', 1);
    for (let v = 0; v < 6; v++) { ctx.fillStyle = '#0F172A'; ctx.fillRect(gx + 6, 30 + v * 8, 32, 4); }
    hatch(ctx, gx, 22, 44, 70, 3, 0.35);
    smoke(ctx, gx + 22, 22, 6, 20, k * 5);
    ctx.fillStyle = '#FDE047'; for (let s = 0; s < 4; s++) { const sx = gx + 8 + hash(k * 9 + s) * 30, sy = 40 + hash(k * 7 + s) * 30; ctx.fillRect(sx, sy, 1.4, 0.4); ctx.fillRect(sx + 0.5, sy - 0.5, 0.4, 1.4); }
  }
  // The floor, under water, the water still crackling
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)'; ctx.fillRect(0, 118, W, 26);
  ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 0.6;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); let x = k * 66; ctx.moveTo(x, 128); for (let j = 0; j < 8; j++) { x += 7; ctx.lineTo(x, 124 + hash(j + k * 9) * 10); } ctx.stroke(); }
  // The desk, Gary slumped over it: charred, smoking, eyes bulging, his hair stood up and singed, the headset
  // melted round his skull, a mug of coffee (WORLD'S OKAYEST TECHNICIAN), a photo in a frame
  shape(ctx, () => ctx.rect(96, 98, 120, 10), '#57534E', 1);
  shape(ctx, () => ctx.rect(104, 108, 8, 30), '#44403C', 0.8); shape(ctx, () => ctx.rect(200, 108, 8, 30), '#44403C', 0.8);
  shape(ctx, () => { ctx.moveTo(124, 98); ctx.quadraticCurveTo(122, 76, 144, 72); ctx.quadraticCurveTo(168, 76, 168, 98); }, '#F59E0B', 1);
  deadFace(ctx, 146, 64, 1.45, { skin: '#D9A07A', shade: '#4A2412', charred: 0.35, tilt: -0.2 });
  // (his hair, stood straight up off his scalp, singed at the ends)
  for (let h = 0; h < 16; h++) {
    const a = -Math.PI / 2 - 0.2 + (h / 15 - 0.5) * 1.6, r0 = 20, r1 = 30 + hash(h * 3) * 10;
    const hx0 = 140 + Math.cos(a) * r0, hy0 = 52 + Math.sin(a) * r0, hx1 = 140 + Math.cos(a) * r1 + (hash(h) - 0.5) * 3, hy1 = 52 + Math.sin(a) * r1;
    ctx.strokeStyle = INK; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(hx0, hy0); ctx.lineTo(hx1, hy1); ctx.stroke();
    ctx.strokeStyle = '#78350F'; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.fillStyle = '#F97316'; ctx.fillRect(hx1 - 0.5, hy1 - 0.5, 1, 1);
  }
  // (the headset, melted onto him)
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(141, 54, 27, Math.PI * 1.08, Math.PI * 1.82); ctx.stroke();
  ctx.strokeStyle = '#3F3F46'; ctx.lineWidth = 0.6; ctx.stroke();
  shape(ctx, () => ctx.ellipse(124, 60, 5, 7, 0, 0, Math.PI * 2), '#27272A', 0.8);
  ctx.fillStyle = 'rgba(39, 39, 42, 0.9)'; ctx.fillRect(122, 66, 2, 6); ctx.fillRect(126, 66, 1.4, 9);
  smoke(ctx, 140, 30, 5, 24, 17);
  shape(ctx, () => ctx.rect(176, 88, 10, 10), '#F8FAFC', 0.7);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 2.2px "Courier New", monospace'; ctx.fillText("WORLD'S", 176.6, 92); ctx.fillText('OKAYEST', 176.6, 95);
  shape(ctx, () => ctx.rect(192, 84, 12, 14), '#CA8A04', 0.7);
  ctx.fillStyle = '#FDE68A'; ctx.fillRect(194, 86, 8, 10);
  ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.arc(196.5, 89, 1.4, 0, Math.PI * 2); ctx.arc(199.5, 89, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.moveTo(198, 93); ctx.arc(197.2, 92, 0.9, 0, Math.PI * 2); ctx.arc(198.8, 92, 0.9, 0, Math.PI * 2); ctx.fill();
  // The fern, by the desk: wilted, brown, nobody to water it
  shape(ctx, () => { ctx.moveTo(224, 138); ctx.lineTo(240, 138); ctx.lineTo(242, 120); ctx.lineTo(222, 120); }, '#9A3412', 0.8);
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 0.9;
  for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(232, 120); ctx.quadraticCurveTo(222 + k * 4, 104, 216 + k * 6, 118 + (k % 3) * 2); ctx.stroke(); }
  photoFinish(ctx, "'99 08 11  EXHIBIT 6");
};

/** Oscar: the field, burning: derricks with cars on top of them, a biker crisped in his leathers, the break room blown open. */
const oscar = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, 90, [[0, '#7C2D12'], [0.5, '#EA580C'], [1, '#FDBA74']]); ctx.fillRect(0, 0, W, H);
  smoke(ctx, 60, 70, 16, 70, 21); smoke(ctx, 200, 66, 14, 60, 23);
  // The derricks against it, black, a pickup and a police cruiser up on top of two of them
  for (const [dx, h, car] of [[30, 70, 'truck'], [120, 84, 'cop'], [222, 60, '']] as const) {
    ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(dx - 12, 96); ctx.lineTo(dx, 96 - h); ctx.lineTo(dx + 12, 96); ctx.stroke();
    ctx.lineWidth = 0.6; for (let k = 1; k < 6; k++) { const y = 96 - (h * k) / 6, w = 12 * (1 - k / 6); ctx.beginPath(); ctx.moveTo(dx - w, y); ctx.lineTo(dx + w, y); ctx.moveTo(dx - w, y); ctx.lineTo(dx + w * 0.8, y - h / 6); ctx.stroke(); }
    if (car) {
      ctx.save(); ctx.translate(dx, 96 - h - 4); ctx.rotate(car === 'cop' ? -0.3 : 0.25);
      shape(ctx, () => ctx.roundRect(-14, -6, 28, 9, 2), car === 'cop' ? '#F8FAFC' : '#B45309', 0.9);
      if (car === 'cop') { ctx.fillStyle = '#111827'; ctx.fillRect(-14, -2, 28, 3); ctx.fillStyle = '#EF4444'; ctx.fillRect(-4, -9, 3, 3); ctx.fillStyle = '#3B82F6'; ctx.fillRect(1, -9, 3, 3); }
      for (const wx of [-9, 9]) shape(ctx, () => ctx.arc(wx, 3, 3, 0, Math.PI * 2), '#18181B', 0.6);
      ctx.restore();
    }
  }
  // The ground: oil and tar, burning in pools
  shape(ctx, () => { ctx.moveTo(0, 94); ctx.lineTo(256, 92); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, '#1C1917', 1);
  ctx.fillStyle = 'rgba(80, 60, 120, 0.25)'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(30 + k * 52, 120 + (k % 2) * 10, 22, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  flames(ctx, 4, 102, 60, 18, 3); flames(ctx, 196, 104, 56, 22, 5);
  // The break room: its walls blown out flat, the sign hanging, the clock stopped, the union's lunchboxes
  shape(ctx, () => { ctx.moveTo(150, 100); ctx.lineTo(196, 96); ctx.lineTo(198, 104); ctx.lineTo(148, 108); }, '#A8A29E', 0.8);
  ctx.save(); ctx.translate(170, 86); ctx.rotate(-0.25); shape(ctx, () => ctx.rect(-16, -5, 32, 9), '#1D4ED8', 0.7);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('BREAK ROOM', -15, 1.5); ctx.restore();
  for (let k = 0; k < 3; k++) shape(ctx, () => ctx.roundRect(152 + k * 12, 110, 9, 6, 1.5), ['#DC2626', '#2563EB', '#16A34A'][k], 0.6);
  // Up front: a biker, crisped in his leathers, his chopper on top of him, his eyes popped wide in his black face,
  // the chain round his neck glowing
  shape(ctx, () => ctx.ellipse(64, 132, 46, 9, 0, 0, Math.PI * 2), 'rgba(0,0,0,0.55)', 0);
  shape(ctx, () => { ctx.moveTo(40, 136); ctx.quadraticCurveTo(46, 108, 70, 106); ctx.quadraticCurveTo(96, 108, 100, 136); }, '#171717', 1.1);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(56, 112); ctx.lineTo(60, 134); ctx.moveTo(84, 112); ctx.lineTo(80, 134); ctx.stroke();
  deadFace(ctx, 70, 96, 1.25, { skin: '#6B4B3A', shade: '#1C120D', charred: 0.6, tilt: 0.2 });
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(70, 112, 9, 0.2, Math.PI - 0.2); ctx.stroke();
  for (const wx of [18, 112]) { shape(ctx, () => ctx.arc(wx, 128, 11, 0, Math.PI * 2), '#18181B', 1); ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 0.4; for (let s = 0; s < 8; s++) { const a = (s / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(wx, 128); ctx.lineTo(wx + Math.cos(a) * 9, 128 + Math.sin(a) * 9); ctx.stroke(); } }
  ctx.strokeStyle = '#D4D4D8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(18, 128); ctx.lineTo(60, 116); ctx.lineTo(112, 128); ctx.stroke();
  smoke(ctx, 70, 80, 6, 26, 29);
  photoFinish(ctx, "'99 09 23  EXHIBIT 7");
};

/** Dale: the convoy, wrecked in the gulch: trucks burning, the shipment everywhere, a goon full of needles like a pincushion. */
const dale = (ctx: Ctx) => {
  ctx.fillStyle = lin(ctx, 0, 70, [[0, '#7C3AED'], [0.6, '#F472B6'], [1, '#FDBA74']]); ctx.fillRect(0, 0, W, H);
  // The gulch walls, red rock, the town's water tower falling in the distance
  shape(ctx, () => { ctx.moveTo(0, 30); ctx.lineTo(40, 22); ctx.lineTo(70, 50); ctx.lineTo(0, 70); }, '#9A3412', 1);
  shape(ctx, () => { ctx.moveTo(256, 26); ctx.lineTo(214, 34); ctx.lineTo(190, 56); ctx.lineTo(256, 70); }, '#9A3412', 1);
  hatch(ctx, 0, 22, 70, 48, 3, 0.3); hatch(ctx, 190, 26, 66, 44, 3, 0.3);
  ctx.save(); ctx.translate(150, 46); ctx.rotate(0.35); shape(ctx, () => ctx.rect(-8, -14, 16, 12), '#78350F', 0.8);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(-9, 12); ctx.moveTo(7, -2); ctx.lineTo(9, 12); ctx.stroke(); ctx.restore();
  // The road: dust, the shipment spilled over it, pills and powder and bags burst
  shape(ctx, () => { ctx.moveTo(0, 68); ctx.lineTo(256, 66); ctx.lineTo(256, 144); ctx.lineTo(0, 144); }, lin(ctx, 66, 144, [[0, '#D6A66B'], [1, '#9A6B3A']]), 1);
  speckle(ctx, 0, 70, W, 74, 500, 'rgba(90, 50, 20, 0.35)', 51, 0.6);
  for (let i = 0; i < 60; i++) { const px = hash(i * 7) * W, py = 92 + hash(i * 11) * 50; ctx.fillStyle = ['#F472B6', '#60A5FA', '#FDE047', '#FFFFFF'][i % 4]; ctx.beginPath(); ctx.ellipse(px, py, 1.4, 0.8, hash(i) * 3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(26,11,6,0.5)'; ctx.lineWidth = 0.2; ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(190, 128, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
  // The trucks: one on its side, burning, one nose down in a crater
  ctx.save(); ctx.translate(70, 78); ctx.rotate(-1.4);
  shape(ctx, () => ctx.rect(-14, -36, 28, 44), '#E5E7EB', 1); shape(ctx, () => ctx.rect(-14, 8, 28, 18), '#1D4ED8', 1);
  ctx.fillStyle = '#93C5FD'; ctx.fillRect(-10, 14, 20, 6);
  ctx.restore();
  flames(ctx, 30, 80, 80, 30, 9); smoke(ctx, 70, 50, 10, 44, 33);
  ctx.save(); ctx.translate(206, 84); ctx.rotate(0.6);
  shape(ctx, () => ctx.rect(-16, -12, 32, 24), '#B91C1C', 1); shape(ctx, () => ctx.rect(-16, 12, 32, 12), '#F8FAFC', 1);
  ctx.restore(); smoke(ctx, 206, 60, 7, 30, 35);
  // Up front: a goon face up in the dirt, needles stuck in him all over like a pincushion, sunglasses knocked crooked
  shape(ctx, () => { ctx.moveTo(84, 140); ctx.quadraticCurveTo(96, 112, 130, 110); ctx.quadraticCurveTo(164, 112, 172, 140); }, '#1F2937', 1.1);
  deadFace(ctx, 128, 102, 1.2, { skin: '#C08A64', shade: '#6B3A1E', tilt: -0.1, xEyes: true });
  shape(ctx, () => { ctx.moveTo(116, 92); ctx.lineTo(126, 94); ctx.lineTo(125, 98); ctx.lineTo(115, 96); }, '#0A0A0A', 0.6);
  shape(ctx, () => { ctx.moveTo(130, 96); ctx.lineTo(141, 92); ctx.lineTo(142, 96); ctx.lineTo(131, 99); }, '#0A0A0A', 0.6);
  for (let n = 0; n < 22; n++) {
    const nx = 92 + hash(n * 3.3) * 76, ny = 84 + hash(n * 5.9) * 50, a = -Math.PI / 2 + (hash(n * 7.1) - 0.5) * 1.6;
    ctx.save(); ctx.translate(nx, ny); ctx.rotate(a);
    ctx.strokeStyle = '#A8A29E'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(6, 0); ctx.stroke();
    shape(ctx, () => ctx.rect(6, -1.2, 7, 2.4), 'rgba(240, 249, 255, 0.85)', 0.35);
    ctx.fillStyle = '#A3E635'; ctx.fillRect(7, -0.8, 3 + hash(n) * 3, 1.6);
    shape(ctx, () => ctx.rect(13, -1.6, 1.2, 3.2), '#F97316', 0.3);
    ctx.restore();
  }
  blood(ctx, 168, 132, 8, 11);
  photoFinish(ctx, "'99 11 05  EXHIBIT 8");
};

/** Each target's photo: what the evidence tag on it says, and how to draw it. */
export const CARNAGE_PHOTOS: Record<string, { caption: string; draw: (ctx: Ctx) => void }> = {
  'Artie Avalanche': { caption: 'THE RANGER STATION, ALASKA. RANGER RECOVERED IN ONE PIECE. ONE (1) PIECE OF ICE.', draw: artie },
  'Victor Volcano': { caption: 'CLUB CALDERA, VIP LOUNGE. THE INVESTOR HAS NOT LET GO OF THE MARTINI. THE MARTINI HAS NOT LET GO OF HIM.', draw: victor },
  'Ernie Earthquake': { caption: 'ALCATRAZ, THE VAULTS. THE TOUR GROUP, AND, ON TOP, THE HIPSTER. HE WOULD HAVE WANTED TO BE SEEN.', draw: ernie },
  'Hector Hurricane': { caption: 'MIAMI BEACH. THE EYE (DECEASED). THE KIDS (FINE) ARE ASKING FOR A REMATCH.', draw: hector },
  'Toxic Tommy': { caption: 'FLINT, THE 400 BLOCK. THE FAMILY WAS FOUND STILL WATCHING THE NEWS. THEY WERE THE NEWS.', draw: tommy },
  'Blackout Barry': { caption: 'THE POWER ROOM. GARY. THE FERN, ALSO DECEASED. NOBODY WATERED IT.', draw: barry },
  'Oily Oscar': { caption: 'THE FIELD, HOUSTON. STILL BURNING AT TIME OF PHOTOGRAPH. AND THE ONE AFTER. AND THE ONE AFTER THAT.', draw: oscar },
  'Drug Trade Dale': { caption: 'DEADWOOD GULCH. THE CONVOY. A GOON RECOVERED WITH 1,114 NEEDLES IN HIM. WE STOPPED COUNTING. THE ASSET DID NOT.', draw: dale },
};
