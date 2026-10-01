// The souvenirs, up close: inspect one in the garage and it fills the screen, a gross-up in the Ren & Stimpy way,
// painted in far more detail than it ever had on the shelf: every scratch, stain, hair, crumb and fingerprint on it.
//
// In art coordinates, 256 x 144, drawn three times finer. `t` is frames since it came up: a slow push in, and the
// odd thing that moves (the lamp's wax, the globe's snow, the lizard's tongue, the derrick nodding).

import { INK, hash, lin, shape, speckle, hatch } from '../scenes/art/ink';

type Ctx = CanvasRenderingContext2D;
const W = 256, H = 144;

/** A glow behind it, rays off the glow turning slowly, dark at the edges. */
const backdrop = (ctx: Ctx, t: number, inner: string, outer: string) => {
  const g = ctx.createRadialGradient(128, 72, 6, 128, 72, 170);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + t * 0.002;
    ctx.beginPath(); ctx.moveTo(128, 72); ctx.lineTo(128 + Math.cos(a) * 300, 72 + Math.sin(a) * 300); ctx.lineTo(128 + Math.cos(a + 0.13) * 300, 72 + Math.sin(a + 0.13) * 300); ctx.closePath(); ctx.fill();
  }
};

/** Dark corners and a crawl of grain over the lot. */
const finish = (ctx: Ctx, t: number) => {
  const v = ctx.createRadialGradient(128, 72, 60, 128, 72, 170);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  const seed = Math.floor(t / 4);
  for (let i = 0; i < 600; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,240,0.05)' : 'rgba(0,0,0,0.07)'; ctx.fillRect(hash(i * 3.1 + seed) * W, hash(i * 7.7 + seed * 1.3) * H, 0.6, 0.6); }
};

/** A shine along an edge: a hard white streak and a softer one beside it. */
const glint = (ctx: Ctx, x: number, y: number, len: number, a = -0.6) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(0, 0, len, 1.1);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(0, 2, len * 0.6, 0.7);
  ctx.restore();
};

/** A greasy fingerprint: rings of whorl, smeared. */
const print = (ctx: Ctx, x: number, y: number, r: number, a = 0) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = 'rgba(80, 60, 40, 0.28)'; ctx.lineWidth = 0.3;
  for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.ellipse(0, 0, r * k / 5, r * k / 5 * 1.35, 0, 0.3, Math.PI * 2 - 0.2); ctx.stroke(); }
  ctx.restore();
};

/** A hair, curled, lying on it. */
const hair = (ctx: Ctx, x: number, y: number, s: number, seed: number) => {
  ctx.strokeStyle = 'rgba(30, 18, 10, 0.85)'; ctx.lineWidth = 0.3;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + s * (hash(seed) - 0.2), y - s * 0.6, x + s * 1.2, y + s * (hash(seed * 2) - 0.5), x + s * 0.8, y + s * 0.5); ctx.stroke();
};

/** A fly, landed (or buzzing about where it's going to land). */
const fly = (ctx: Ctx, x: number, y: number, t: number, seed: number) => {
  const fx = x + Math.sin(t * 0.13 + seed) * 6, fy = y + Math.cos(t * 0.17 + seed * 2) * 4;
  ctx.fillStyle = 'rgba(200, 220, 255, 0.45)'; ctx.beginPath(); ctx.ellipse(fx - 1.2, fy - 1.2, 1.6, 0.8, -0.5, 0, Math.PI * 2); ctx.ellipse(fx + 1.2, fy - 1.2, 1.6, 0.8, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(fx, fy, 1.2, 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(fx - 1, fy - 0.8, 0.6, 0.6); ctx.fillRect(fx + 0.4, fy - 0.8, 0.6, 0.6);
};

/** Stink lines coming up off something, wavering. */
const stink = (ctx: Ctx, x: number, y: number, t: number, n = 3) => {
  ctx.strokeStyle = 'rgba(163, 190, 60, 0.7)'; ctx.lineWidth = 0.8;
  for (let k = 0; k < n; k++) {
    const sx = x + (k - (n - 1) / 2) * 8;
    ctx.beginPath(); ctx.moveTo(sx, y);
    for (let j = 1; j <= 6; j++) ctx.lineTo(sx + Math.sin(t * 0.08 + j + k) * 2.5, y - j * 4);
    ctx.stroke();
  }
};

// ---------------------------------------------------------------------------

const antler = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#6B4F2A', '#140C04');
  // The palm of it, the tines up off it, bark-rough, the knob of skull it came off still bloody, fur tufted round it
  const palm = () => {
    ctx.moveTo(60, 120); ctx.bezierCurveTo(70, 90, 90, 70, 120, 64);
    for (let k = 0; k < 7; k++) { const x = 120 + k * 16; ctx.lineTo(x + 2, 20 + (k % 2) * 8 + hash(k) * 8); ctx.lineTo(x + 8, 60 - (k % 3) * 3); }
    ctx.lineTo(232, 60); ctx.bezierCurveTo(226, 92, 170, 104, 110, 108); ctx.bezierCurveTo(90, 112, 80, 122, 72, 132);
  };
  shape(ctx, palm, lin(ctx, 20, 130, [[0, '#F1DFB8'], [0.6, '#C8A672'], [1, '#7C5A33']]), 1.6);
  ctx.save(); ctx.beginPath(); palm(); ctx.clip();
  ctx.strokeStyle = 'rgba(90, 60, 30, 0.45)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 60; k++) { const x = 70 + hash(k * 3) * 160, y = 30 + hash(k * 5) * 90; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6 + hash(k) * 8, y - 2 + hash(k * 2) * 4); ctx.stroke(); }
  speckle(ctx, 60, 20, 180, 110, 900, 'rgba(80, 50, 20, 0.35)', 3, 0.5);
  hatch(ctx, 60, 80, 180, 50, 2.5, 0.25);
  ctx.restore();
  // (the base: the burr, the bone, dried blood, a ragged edge of hide with fur on it)
  shape(ctx, () => ctx.ellipse(66, 126, 16, 12, -0.5, 0, Math.PI * 2), '#E7D5B5', 1.4);
  shape(ctx, () => ctx.ellipse(64, 128, 10, 7, -0.5, 0, Math.PI * 2), '#7F1D1D', 0.8);
  speckle(ctx, 54, 120, 22, 16, 80, 'rgba(255, 220, 200, 0.5)', 7, 0.6);
  ctx.strokeStyle = '#5A3A1E'; ctx.lineWidth = 0.6;
  for (let k = 0; k < 30; k++) { const a = -2.6 + k * 0.1; ctx.beginPath(); ctx.moveTo(66 + Math.cos(a) * 16, 126 + Math.sin(a) * 12); ctx.lineTo(66 + Math.cos(a) * 21, 126 + Math.sin(a) * 16 + (hash(k) - 0.5) * 2); ctx.stroke(); }
  // A gym towel hung off one tine, damp, gray, a hair on it
  shape(ctx, () => { ctx.moveTo(150, 26); ctx.lineTo(166, 26); ctx.lineTo(170, 78); ctx.quadraticCurveTo(160, 84, 146, 78); }, '#9CA3AF', 1);
  ctx.strokeStyle = 'rgba(55, 65, 81, 0.5)'; ctx.lineWidth = 0.4; for (let y = 30; y < 78; y += 2) { ctx.beginPath(); ctx.moveTo(149, y); ctx.lineTo(167, y + 1); ctx.stroke(); }
  ctx.fillStyle = 'rgba(120, 100, 40, 0.35)'; ctx.beginPath(); ctx.ellipse(158, 66, 6, 8, 0, 0, Math.PI * 2); ctx.fill();
  hair(ctx, 154, 46, 6, 2);
  fly(ctx, 70, 112, t, 1);
};

const moonboots = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#4B5563', '#0B0F19');
  for (const [bx, a] of [[86, -0.08], [160, 0.1]] as const) {
    ctx.save(); ctx.translate(bx, 80); ctx.rotate(a);
    // The boot: puffed up like a pillow, quilted silver, the sole gray rubber, worn down at the heel
    const boot = () => { ctx.moveTo(-26, -50); ctx.bezierCurveTo(-30, -10, -34, 20, -30, 34); ctx.lineTo(40, 34); ctx.bezierCurveTo(46, 26, 40, 14, 20, 10); ctx.bezierCurveTo(22, -20, 26, -40, 22, -52); ctx.closePath(); };
    shape(ctx, boot, lin(ctx, -52, 34, [[0, '#F4F4F5'], [0.5, '#A1A1AA'], [1, '#52525B']]), 1.4);
    ctx.save(); ctx.beginPath(); boot(); ctx.clip();
    ctx.strokeStyle = 'rgba(39, 39, 42, 0.5)'; ctx.lineWidth = 0.6;
    for (let y = -46; y < 34; y += 9) { ctx.beginPath(); ctx.moveTo(-34, y); ctx.quadraticCurveTo(0, y + 4, 44, y); ctx.stroke(); }
    // (sweat stains, yellowed, coming through at the ankle)
    ctx.fillStyle = 'rgba(202, 160, 50, 0.35)'; ctx.beginPath(); ctx.ellipse(-4, 4, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
    speckle(ctx, -34, -52, 80, 90, 400, 'rgba(40,40,40,0.3)', bx, 0.5);
    ctx.restore();
    shape(ctx, () => ctx.rect(-32, 32, 74, 8), '#3F3F46', 1);
    for (let k = 0; k < 9; k++) { ctx.fillStyle = '#18181B'; ctx.fillRect(-30 + k * 8, 37, 4, 3); }
    // A hole at the toe, a big toe poking out of it: the nail yellow and thick, hair on the knuckle
    shape(ctx, () => ctx.ellipse(32, 22, 7, 6, 0, 0, Math.PI * 2), '#18181B', 0.8);
    shape(ctx, () => ctx.ellipse(34, 22, 5.5, 4.6, 0.2, 0, Math.PI * 2), '#E8B495', 0.8);
    shape(ctx, () => ctx.ellipse(36.5, 21, 2.6, 2.2, 0.2, 0, Math.PI * 2), '#D9C26A', 0.5);
    ctx.strokeStyle = 'rgba(120, 90, 20, 0.6)'; ctx.lineWidth = 0.3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(35 + k * 0.7, 19.5); ctx.lineTo(35.5 + k * 0.7, 22.5); ctx.stroke(); }
    hair(ctx, 31, 18, 2.4, bx); hair(ctx, 32, 19, 2, bx + 1);
    ctx.restore();
  }
  // The laces, frayed; the smell, visible
  stink(ctx, 86, 26, t, 3); stink(ctx, 160, 24, t + 30, 3);
  fly(ctx, 124, 40, t, 3); fly(ctx, 200, 30, t, 9);
};

const snowglobe = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#1E3A8A', '#020617');
  // The base: dark wood, a brass plate (ALASKA), chipped
  shape(ctx, () => { ctx.moveTo(84, 118); ctx.lineTo(172, 118); ctx.lineTo(180, 138); ctx.lineTo(76, 138); }, lin(ctx, 118, 138, [[0, '#7C4A21'], [1, '#3A2210']]), 1.3);
  shape(ctx, () => ctx.rect(112, 124, 32, 8), '#CA8A04', 0.8);
  ctx.fillStyle = '#422006'; ctx.font = 'bold 5px "Courier New", monospace'; ctx.fillText('ALASKA', 117, 130);
  // The globe: the mountain inside, a tiny skier tumbling down it, the snow going round (shaken)
  ctx.save(); ctx.beginPath(); ctx.arc(128, 70, 50, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = lin(ctx, 20, 120, [[0, '#7DD3FC'], [1, '#E0F2FE']]); ctx.fillRect(70, 18, 120, 104);
  shape(ctx, () => { ctx.moveTo(80, 120); ctx.lineTo(116, 52); ctx.lineTo(130, 70); ctx.lineTo(146, 44); ctx.lineTo(182, 120); }, lin(ctx, 44, 120, [[0, '#FFFFFF'], [1, '#93C5FD']]), 0.9);
  // (the avalanche coming down it, the little man in front of it)
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(150, 70 + Math.sin(t * 0.05) * 2, 9, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(138, 84); ctx.rotate(t * 0.04); ctx.fillStyle = '#DC2626'; ctx.fillRect(-1, -3, 2, 5); ctx.fillStyle = '#F2C9A8'; ctx.beginPath(); ctx.arc(0, -4, 1.2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  for (let i = 0; i < 70; i++) { const a = hash(i) * Math.PI * 2 + t * 0.01 * (0.5 + hash(i * 3)), r = hash(i * 7) * 46, y = 70 + Math.sin(a) * r * 0.9 + ((t * 0.3 + i * 7) % 20) - 10; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(128 + Math.cos(a) * r, y, 1.1, 1.1); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(128, 70, 50, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
  // (the glass: a big window of light on it, his greasy prints all over it, a crack with water beading out of it)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(106, 44, 14, 8, -0.7, 0, Math.PI * 2); ctx.fill();
  glint(ctx, 98, 52, 12);
  print(ctx, 150, 50, 6, 0.4); print(ctx, 160, 90, 5, -0.3); print(ctx, 100, 96, 6, 0.8);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(170, 50); ctx.lineTo(164, 60); ctx.lineTo(168, 66); ctx.lineTo(160, 78); ctx.stroke();
  const drip = (t * 0.2) % 30;
  ctx.fillStyle = 'rgba(186, 230, 253, 0.85)'; ctx.beginPath(); ctx.ellipse(161, 80 + drip, 1.4, 2, 0, 0, Math.PI * 2); ctx.fill();
};

const viprope = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#7F1D1D', '#150202');
  for (const px of [52, 204]) {
    // The brass posts: polished, his face bent in the shine of them, a dent where it went over
    shape(ctx, () => ctx.rect(px - 6, 40, 12, 86), lin(ctx, 40, 126, [[0, '#FDE68A'], [0.5, '#CA8A04'], [1, '#713F12']]), 1.3);
    shape(ctx, () => ctx.ellipse(px, 38, 10, 6, 0, 0, Math.PI * 2), '#EAB308', 1.2);
    shape(ctx, () => ctx.ellipse(px, 128, 22, 7, 0, 0, Math.PI * 2), '#A16207', 1.3);
    glint(ctx, px - 3, 90, 30, -1.57);
    ctx.fillStyle = 'rgba(232, 160, 120, 0.35)'; ctx.beginPath(); ctx.ellipse(px + 1, 70, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
    print(ctx, px + 2, 100, 3, 0.2);
  }
  // The rope: thick red velvet sagging between them, the nap of it, scorch marks, a wad of gum, a hair, glitter
  const sag = 92 + Math.sin(t * 0.03) * 1.5;
  ctx.strokeStyle = INK; ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(56, 46); ctx.quadraticCurveTo(128, sag * 2 - 46, 200, 46); ctx.stroke();
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 13; ctx.stroke();
  ctx.strokeStyle = 'rgba(254, 202, 202, 0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, 44); ctx.quadraticCurveTo(128, sag * 2 - 50, 196, 44); ctx.stroke();
  ctx.strokeStyle = 'rgba(69, 10, 10, 0.5)'; ctx.lineWidth = 0.4;
  for (let k = 0; k < 120; k++) { const u = k / 120, x = 56 + u * 144, y = (1 - u) * (1 - u) * 46 + 2 * u * (1 - u) * (sag * 2 - 46) + u * u * 46; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 1, y + 5); ctx.stroke(); }
  ctx.fillStyle = 'rgba(20, 10, 8, 0.75)'; ctx.beginPath(); ctx.ellipse(100, 84, 8, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => ctx.ellipse(150, 86, 4, 3, 0.2, 0, Math.PI * 2), '#F9A8D4', 0.6);
  ctx.strokeStyle = 'rgba(249, 168, 212, 0.8)'; ctx.lineWidth = 0.3; ctx.beginPath(); ctx.moveTo(152, 88); ctx.lineTo(156, 100); ctx.stroke();
  hair(ctx, 120, 90, 6, 4);
  for (let i = 0; i < 30; i++) { ctx.fillStyle = ['#FDE047', '#F472B6', '#FFFFFF'][i % 3]; ctx.fillRect(70 + hash(i * 3) * 120, 66 + hash(i * 5) * 30, 0.8, 0.8); }
};

const lavalamp = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#7C2D12', '#0C0402');
  // The lamp: the cone of glass, the wax going up and down in it, the cap with a dead moth in the dust on it
  const glass = () => { ctx.moveTo(108, 26); ctx.lineTo(148, 26); ctx.lineTo(166, 112); ctx.lineTo(90, 112); ctx.closePath(); };
  shape(ctx, glass, lin(ctx, 26, 112, [[0, '#FB923C'], [1, '#EA580C']]), 1.4);
  ctx.save(); ctx.beginPath(); glass(); ctx.clip();
  for (let k = 0; k < 6; k++) {
    const y = 104 - ((t * (0.15 + k * 0.03) + k * 40) % 100), x = 128 + Math.sin(t * 0.02 + k) * 10, r = 6 + hash(k) * 8;
    ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(x, y, r, r * (1.2 + Math.sin(t * 0.05 + k) * 0.2), 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(254, 202, 202, 0.5)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.4, r * 0.3, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.ellipse(128, 112, 40, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  glint(ctx, 112, 100, 60, -1.36);
  print(ctx, 140, 60, 4, 0.2); print(ctx, 116, 80, 4, -0.5);
  shape(ctx, () => { ctx.moveTo(104, 26); ctx.lineTo(152, 26); ctx.lineTo(146, 12); ctx.lineTo(110, 12); }, '#3F3F46', 1.2);
  shape(ctx, () => { ctx.moveTo(90, 112); ctx.lineTo(166, 112); ctx.lineTo(178, 138); ctx.lineTo(78, 138); }, '#3F3F46', 1.3);
  speckle(ctx, 110, 10, 36, 4, 80, 'rgba(200, 190, 170, 0.6)', 11, 0.6);
  // (the moth: legs up, wings spread, dusty)
  shape(ctx, () => { ctx.ellipse(122, 10, 5, 2.4, -0.2, 0, Math.PI * 2); ctx.ellipse(132, 10, 5, 2.4, 0.2, 0, Math.PI * 2); }, '#A8A29E', 0.5);
  ctx.strokeStyle = INK; ctx.lineWidth = 0.3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(126 + k, 9); ctx.lineTo(125 + k * 2, 5); ctx.stroke(); }
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(170, 132); ctx.quadraticCurveTo(210, 128, 250, 140); ctx.stroke();
};

const neon = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#3B0764', '#05010A');
  // The backboard, screwed to the wall, the wiring hanging off it; the tubes lit, one letter flickering
  shape(ctx, () => ctx.roundRect(20, 34, 216, 76, 6), '#18181B', 1.4);
  for (const [sx, sy] of [[28, 42], [228, 42], [28, 102], [228, 102]]) { ctx.fillStyle = '#A1A1AA'; ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(sx - 1.4, sy); ctx.lineTo(sx + 1.4, sy); ctx.stroke(); }
  const flick = Math.floor(t / 7) % 9 === 0;
  ctx.font = 'bold 26px "Courier New", monospace'; ctx.textAlign = 'center';
  const letters = 'CALDERA';
  for (let i = 0; i < letters.length; i++) {
    const on = !(i === 4 && flick);
    ctx.shadowColor = '#EC4899'; ctx.shadowBlur = on ? 10 : 0;
    ctx.strokeStyle = on ? '#FBCFE8' : '#4A1F35'; ctx.lineWidth = 1.6; ctx.strokeText(letters[i], 54 + i * 25, 92);
    ctx.shadowBlur = 0;
  }
  ctx.font = 'bold 11px "Courier New", monospace'; ctx.shadowColor = '#22D3EE'; ctx.shadowBlur = 8; ctx.strokeStyle = '#CFFAFE'; ctx.lineWidth = 0.8; ctx.strokeText('CLUB', 128, 56); ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  // (the bugs fried on the tubes, legs in the air; the dust on top)
  for (let b = 0; b < 7; b++) { const bx = 50 + hash(b * 3) * 160, by = 64 + hash(b * 5) * 30; ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(bx, by, 1.6, 1, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.25; for (let l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(bx - 1 + l, by); ctx.lineTo(bx - 1.5 + l * 1.4, by - 2); ctx.stroke(); } }
  speckle(ctx, 20, 34, 216, 4, 200, 'rgba(160, 150, 140, 0.6)', 13, 0.6);
  ctx.strokeStyle = '#27272A'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(220, 110); ctx.bezierCurveTo(226, 130, 200, 128, 210, 150); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, 110); ctx.bezierCurveTo(34, 126, 50, 132, 44, 150); ctx.stroke();
};

const mug = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#334155', '#05070B');
  // The mug: white, ALCATRAZ on it, the bars, a chip out of the rim, rings of old coffee down the inside, a skin of
  // protein shake on what's left in it, a thing growing in it
  shape(ctx, () => { ctx.moveTo(84, 30); ctx.lineTo(164, 30); ctx.lineTo(160, 124); ctx.quadraticCurveTo(124, 134, 88, 124); ctx.closePath(); }, lin(ctx, 30, 130, [[0, '#FFFFFF'], [1, '#CBD5E1']]), 1.5);
  ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(170, 76, 20, -1.3, 1.3); ctx.stroke();
  ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#0F172A'; ctx.font = 'bold 11px "Courier New", monospace'; ctx.fillText('ALCATRAZ', 94, 70);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = '#334155'; ctx.fillRect(98 + k * 10, 78, 2, 26); }
  ctx.fillRect(96, 78, 54, 2); ctx.fillRect(96, 102, 54, 2);
  ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('GIFT SHOP', 112, 114);
  // (the rim, from above, a little: the dregs)
  shape(ctx, () => ctx.ellipse(124, 30, 40, 8, 0, 0, Math.PI * 2), '#F8FAFC', 1.3);
  shape(ctx, () => ctx.ellipse(124, 31, 34, 5.6, 0, 0, Math.PI * 2), '#6B4423', 0.6);
  ctx.fillStyle = '#E8D5A8'; ctx.beginPath(); ctx.ellipse(118, 31, 24, 3.6, 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120, 90, 50, 0.6)'; ctx.lineWidth = 0.3; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(118, 31, 4 + k * 3.4, 0.8 + k * 0.5, 0, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.arc(136, 30, 3, 0, Math.PI * 2); ctx.fill(); speckle(ctx, 132, 27, 8, 6, 30, '#D9F99D', 17, 0.5);
  ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.moveTo(150, 25); ctx.lineTo(156, 25); ctx.lineTo(153, 30); ctx.fill();
  // (coffee stains run down the outside, his lip print on the rim)
  ctx.fillStyle = 'rgba(120, 72, 30, 0.45)'; ctx.fillRect(140, 34, 3, 30); ctx.beginPath(); ctx.arc(141.5, 64, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(190, 120, 100, 0.4)'; ctx.beginPath(); ctx.ellipse(104, 36, 7, 2.5, 0.1, 0, Math.PI * 2); ctx.fill();
  print(ctx, 152, 96, 5, 0.5);
  stink(ctx, 124, 18, t, 2); fly(ctx, 150, 16, t, 5);
};

const seismo = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#57534E', '#0C0A09');
  // The frame, cheap gold, the glass cracked; the paper inside: the trace, flat, flat, then the spike right off
  // the top of it, where he landed; somebody's coffee on the corner
  shape(ctx, () => ctx.rect(26, 18, 204, 112), lin(ctx, 18, 130, [[0, '#FDE68A'], [1, '#A16207']]), 1.5);
  shape(ctx, () => ctx.rect(36, 28, 184, 92), '#FAF6EC', 1);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)'; ctx.lineWidth = 0.3;
  for (let x = 36; x < 220; x += 6) { ctx.beginPath(); ctx.moveTo(x, 28); ctx.lineTo(x, 120); ctx.stroke(); }
  for (let y = 28; y < 120; y += 6) { ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(220, y); ctx.stroke(); }
  ctx.strokeStyle = '#B91C1C'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(36, 80);
  for (let x = 36; x < 220; x += 1.5) {
    const d = Math.abs(x - 150), y = x > 140 && x < 160 ? 80 - Math.sin(x * 2.3) * (60 - d * 3) : 80 + Math.sin(x * 1.7) * 1.2 + (hash(x) - 0.5) * 1.5;
    ctx.lineTo(x, Math.max(28, Math.min(120, y)));
  }
  ctx.stroke();
  ctx.fillStyle = '#7F1D1D'; ctx.font = 'italic 6px "Courier New", monospace'; ctx.fillText('<- ME', 164, 36);
  ctx.fillStyle = 'rgba(120, 72, 30, 0.3)'; ctx.beginPath(); ctx.arc(60, 108, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(120, 72, 30, 0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(60, 108, 12, 0, Math.PI * 2); ctx.stroke();
  // (the glass: its shine, the crack from the corner, a greasy thumb)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.moveTo(40, 28); ctx.lineTo(90, 28); ctx.lineTo(40, 90); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(220, 28); ctx.lineTo(196, 52); ctx.lineTo(204, 60); ctx.lineTo(180, 90); ctx.moveTo(196, 52); ctx.lineTo(186, 46); ctx.stroke();
  print(ctx, 120, 108, 7, 1.1);
};

const bell = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#78350F', '#0C0603');
  const swing = Math.sin(t * 0.06) * 0.08;
  ctx.save(); ctx.translate(128, 18); ctx.rotate(swing);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 8); ctx.stroke();
  // The bell: brass gone green in the creases, dented, his fingerprints all over the shine
  const b = () => { ctx.moveTo(-10, 8); ctx.bezierCurveTo(-14, 30, -20, 70, -50, 96); ctx.lineTo(50, 96); ctx.bezierCurveTo(20, 70, 14, 30, 10, 8); ctx.closePath(); };
  shape(ctx, b, lin(ctx, 8, 96, [[0, '#FDE68A'], [0.45, '#D97706'], [1, '#78350F']]), 1.6);
  ctx.save(); ctx.beginPath(); b(); ctx.clip();
  ctx.fillStyle = 'rgba(52, 211, 153, 0.35)'; for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(-40 + hash(k) * 80, 30 + hash(k * 3) * 66, 2 + hash(k * 5) * 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(255, 255, 220, 0.5)'; ctx.fillRect(-16, 14, 5, 76);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(18, 60, 6, 4, 0.4, 0, Math.PI * 2); ctx.fill();
  print(ctx, 8, 50, 5, 0.3); print(ctx, -24, 74, 5, -0.4);
  ctx.restore();
  shape(ctx, () => ctx.ellipse(0, 96, 50, 7, 0, 0, Math.PI * 2), '#92400E', 1.4);
  shape(ctx, () => ctx.ellipse(Math.sin(t * 0.06 + 1) * 6, 104, 7, 7, 0, 0, Math.PI * 2), '#57534E', 1);
  ctx.restore();
  // (each ring, the sound coming off it: RING, in his head)
  if (Math.floor(t / 40) % 2) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.fillText('DING!', 186, 58); ctx.fillText('DING!', 30, 88); }
};

const flamingo = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#0E7490', '#021014');
  // The plastic flamingo: faded pink, the seam down it, a dent where it came down on a guy, his blood and a tuft
  // of his hair still on its beak
  ctx.strokeStyle = INK; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(116, 98); ctx.lineTo(112, 144); ctx.moveTo(130, 98); ctx.lineTo(134, 144); ctx.stroke();
  ctx.strokeStyle = '#71717A'; ctx.lineWidth = 1.4; ctx.stroke();
  shape(ctx, () => ctx.ellipse(124, 80, 40, 24, -0.15, 0, Math.PI * 2), lin(ctx, 56, 104, [[0, '#FBCFE8'], [1, '#EC4899']]), 1.6);
  shape(ctx, () => { ctx.moveTo(152, 68); ctx.bezierCurveTo(176, 50, 150, 30, 160, 16); ctx.lineTo(168, 18); ctx.bezierCurveTo(160, 32, 186, 50, 160, 74); }, '#F9A8D4', 1.4);
  shape(ctx, () => ctx.ellipse(168, 16, 10, 8, 0, 0, Math.PI * 2), '#F9A8D4', 1.4);
  shape(ctx, () => { ctx.moveTo(176, 14); ctx.lineTo(196, 22); ctx.lineTo(186, 30); ctx.lineTo(174, 20); }, '#FEF3C7', 1.2);
  shape(ctx, () => { ctx.moveTo(190, 25); ctx.lineTo(196, 22); ctx.lineTo(190, 31); ctx.lineTo(186, 30); }, INK, 0);
  shape(ctx, () => ctx.ellipse(170, 13, 3, 3, 0, 0, Math.PI * 2), '#FFFFFF', 0.6);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(171, 13, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#991B1B'; ctx.beginPath(); ctx.ellipse(190, 24, 4, 3, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(189, 26, 0.8, 8); ctx.fillRect(192, 25, 0.8, 5);
  for (let k = 0; k < 6; k++) hair(ctx, 186 + k, 21, 5, k * 3);
  // (the seam, the faded patches, a crack, a dent with the paint off it)
  ctx.strokeStyle = 'rgba(131, 24, 67, 0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(86, 80); ctx.quadraticCurveTo(124, 90, 162, 70); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(110, 70, 14, 6, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(80, 20, 50, 0.35)'; ctx.beginPath(); ctx.ellipse(130, 92, 8, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(96, 74); ctx.lineTo(102, 82); ctx.lineTo(98, 88); ctx.stroke();
  fly(ctx, 194, 30, t, 7);
};

const clicker = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#155E75', '#020A0D');
  ctx.save(); ctx.translate(128, 74); ctx.rotate(-0.35);
  // The clicker: a slab of black plastic, the buttons worn smooth, gunk in every seam, the battery door gone and the
  // batteries leaking crust
  shape(ctx, () => ctx.roundRect(-26, -62, 52, 124, 12), lin(ctx, -62, 62, [[0, '#3F3F46'], [1, '#18181B']]), 1.6);
  glint(ctx, -22, -50, 90, 1.57);
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(0, -46, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#FCA5A5'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('STORM', -7, -45);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const bx = -15 + c * 15, by = -28 + r * 14, worn = hash(r * 3 + c) > 0.6;
    shape(ctx, () => ctx.roundRect(bx - 5, by - 4, 10, 8, 3), worn ? '#71717A' : '#52525B', 0.8);
    ctx.fillStyle = 'rgba(120, 90, 40, 0.6)'; ctx.fillRect(bx - 5, by + 3.5, 10, 1);
  }
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('SUN', -19, -26); ctx.fillText('RAIN', -5, -26); ctx.fillText('CAT5', 9, -26);
  // (the back end: the batteries, crusted white and green, leaking)
  shape(ctx, () => ctx.rect(-18, 30, 36, 26), '#0A0A0A', 0.8);
  for (const bx of [-12, 2]) { shape(ctx, () => ctx.rect(bx, 32, 10, 22), '#CA8A04', 0.6); ctx.fillStyle = 'rgba(240, 253, 244, 0.9)'; ctx.beginPath(); ctx.arc(bx + 5, 32, 4, 0, Math.PI * 2); ctx.fill(); speckle(ctx, bx, 28, 10, 8, 30, '#A3E635', bx, 0.7); }
  print(ctx, 6, 10, 6, 0.4); print(ctx, -10, -8, 5, -0.2);
  ctx.restore();
};

const daycare = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#FBBF24', '#2A1503');
  // The sign: painted plywood, LITTLE SUNSHINE DAYCARE, the sun smiling (somebody's drawn a bandage on it since),
  // little handprints in paint all over it, crayon, water stains up from the bottom where the flood got it
  shape(ctx, () => ctx.rect(18, 26, 220, 92), '#FEF3C7', 1.6);
  ctx.fillStyle = 'rgba(146, 64, 14, 0.18)'; for (let y = 28; y < 118; y += 4) ctx.fillRect(18, y, 220, 1);
  ctx.fillStyle = lin(ctx, 80, 118, [[0, 'rgba(120, 90, 50, 0)'], [1, 'rgba(120, 90, 50, 0.45)']]); ctx.fillRect(18, 80, 220, 38);
  ctx.strokeStyle = 'rgba(100, 70, 30, 0.5)'; ctx.lineWidth = 0.5; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(18, 96 - k * 7); ctx.bezierCurveTo(80, 92 - k * 7, 160, 100 - k * 7, 238, 94 - k * 7); ctx.stroke(); }
  shape(ctx, () => ctx.arc(54, 60, 20, 0, Math.PI * 2), '#FBBF24', 1.3);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2 + t * 0.01; ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(54 + Math.cos(a) * 23, 60 + Math.sin(a) * 23); ctx.lineTo(54 + Math.cos(a) * 31, 60 + Math.sin(a) * 31); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(47, 56, 2, 0, Math.PI * 2); ctx.arc(61, 56, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(54, 62, 8, 0.3, Math.PI - 0.3); ctx.stroke();
  shape(ctx, () => { ctx.save(); ctx.translate(64, 66); ctx.rotate(0.6); ctx.rect(-7, -2.5, 14, 5); ctx.restore(); }, '#FCD9B6', 0.6);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 15px "Courier New", monospace'; ctx.fillText('LITTLE', 94, 56);
  ctx.fillStyle = '#EA580C'; ctx.fillText('SUNSHINE', 86, 74);
  ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('DAYCARE', 116, 88);
  // (handprints)
  for (let k = 0; k < 9; k++) {
    const hx = 30 + hash(k * 3) * 196, hy = 90 + hash(k * 5) * 22;
    ctx.fillStyle = ['#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F59E0B'][k % 5];
    ctx.beginPath(); ctx.ellipse(hx, hy, 3, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    for (let f = 0; f < 5; f++) { const a = -2.6 + f * 0.45; ctx.beginPath(); ctx.ellipse(hx + Math.cos(a) * 4.6, hy + Math.sin(a) * 4.6, 0.9, 1.6, a + 1.57, 0, Math.PI * 2); ctx.fill(); }
  }
  // (crayon: a stick figure, enormous arms: him)
  ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(206, 46, 4, 0, Math.PI * 2); ctx.moveTo(206, 50); ctx.lineTo(206, 64); ctx.moveTo(206, 64); ctx.lineTo(200, 74); ctx.moveTo(206, 64); ctx.lineTo(212, 74); ctx.stroke();
  ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(206, 54); ctx.quadraticCurveTo(196, 46, 192, 40); ctx.moveTo(206, 54); ctx.quadraticCurveTo(216, 46, 220, 40); ctx.stroke();
  ctx.fillStyle = '#7C3AED'; ctx.font = 'bold 5px "Courier New", monospace'; ctx.fillText('MEAT MAN', 192, 84);
};

const flintjar = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#365314', '#030702');
  // The mason jar, the lid rusted on; the water glowing green, things in it: a tooth, a clump of hair, something
  // with a lot of legs, bubbles coming up
  const jar = () => { ctx.moveTo(90, 30); ctx.lineTo(166, 30); ctx.bezierCurveTo(176, 40, 178, 50, 176, 120); ctx.quadraticCurveTo(128, 134, 80, 120); ctx.bezierCurveTo(78, 50, 80, 40, 90, 30); };
  ctx.shadowColor = '#A3E635'; ctx.shadowBlur = 20;
  shape(ctx, jar, lin(ctx, 30, 130, [[0, 'rgba(190, 242, 100, 0.85)'], [1, 'rgba(77, 124, 15, 0.95)']]), 1.6);
  ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); jar(); ctx.clip();
  for (let i = 0; i < 18; i++) { const bx = 92 + hash(i * 3) * 72, by = 124 - ((t * (0.2 + hash(i) * 0.3) + i * 13) % 90); ctx.strokeStyle = 'rgba(236, 252, 203, 0.8)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(bx, by, 0.8 + hash(i * 5) * 1.6, 0, Math.PI * 2); ctx.stroke(); }
  ctx.save(); ctx.translate(112, 84 + Math.sin(t * 0.03) * 3); ctx.rotate(t * 0.005);
  shape(ctx, () => { ctx.moveTo(-3, -5); ctx.lineTo(3, -5); ctx.lineTo(4, 1); ctx.lineTo(2, 6); ctx.lineTo(0, 2); ctx.lineTo(-2, 6); ctx.lineTo(-4, 1); }, '#FEF9C3', 0.6);
  ctx.restore();
  ctx.strokeStyle = 'rgba(28, 25, 23, 0.8)'; ctx.lineWidth = 0.35;
  for (let k = 0; k < 24; k++) { ctx.beginPath(); ctx.moveTo(146, 64 + Math.sin(t * 0.02) * 2); ctx.bezierCurveTo(140 + hash(k) * 16, 58 + hash(k * 2) * 12, 136 + hash(k * 3) * 24, 70 + hash(k * 4) * 12, 132 + hash(k * 5) * 30, 62 + hash(k * 6) * 20); ctx.stroke(); }
  ctx.save(); ctx.translate(134, 108); ctx.rotate(0.4 + Math.sin(t * 0.02) * 0.2); ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#292524'; ctx.lineWidth = 0.4; for (let l = 0; l < 8; l++) { ctx.beginPath(); ctx.moveTo(-4 + l, 0); ctx.lineTo(-5 + l * 1.4, (l % 2 ? 4 : -4)); ctx.stroke(); } ctx.restore();
  speckle(ctx, 80, 30, 96, 100, 300, 'rgba(26, 46, 5, 0.4)', 23, 0.7);
  ctx.restore();
  glint(ctx, 92, 110, 70, -1.45);
  shape(ctx, () => ctx.rect(86, 18, 84, 14), '#A16207', 1.3);
  speckle(ctx, 86, 18, 84, 14, 160, 'rgba(124, 45, 18, 0.7)', 29, 0.9);
  shape(ctx, () => ctx.rect(104, 66, 48, 22), '#FEF3C7', 0.9);
  ctx.fillStyle = '#1C1917'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('FLINT', 112, 80);
  ctx.font = 'bold 3.5px "Courier New", monospace'; ctx.fillText('DO NOT DRINK. SERIOUSLY.', 106, 85);
};

const hazmat = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#713F12', '#0A0601');
  // The hood: yellow rubber, creased, scuffed, stained with the muck to the chin; the visor scratched, and in the
  // shine of it, faces, looking up out of the sludge
  const hood = () => { ctx.moveTo(60, 140); ctx.bezierCurveTo(50, 60, 80, 10, 128, 10); ctx.bezierCurveTo(176, 10, 206, 60, 196, 140); ctx.closePath(); };
  shape(ctx, hood, lin(ctx, 10, 140, [[0, '#FDE047'], [0.7, '#CA8A04'], [1, '#713F12']]), 1.8);
  ctx.save(); ctx.beginPath(); hood(); ctx.clip();
  ctx.fillStyle = 'rgba(77, 124, 15, 0.6)'; ctx.fillRect(40, 116, 180, 30);
  ctx.strokeStyle = 'rgba(113, 63, 18, 0.5)'; ctx.lineWidth = 0.7;
  for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.moveTo(60 + k * 12, 20 + hash(k) * 30); ctx.quadraticCurveTo(64 + k * 12, 80, 58 + k * 12, 140); ctx.stroke(); }
  speckle(ctx, 50, 10, 160, 130, 500, 'rgba(60, 40, 10, 0.3)', 31, 0.6);
  ctx.restore();
  // The visor
  const visor = () => { ctx.roundRect(84, 42, 88, 56, 18); };
  shape(ctx, visor, '#0F172A', 1.6);
  ctx.save(); ctx.beginPath(); visor(); ctx.clip();
  ctx.fillStyle = 'rgba(132, 204, 22, 0.35)'; ctx.fillRect(84, 74, 88, 24);
  for (const [fx, fy, s] of [[104, 82, 0.5], [138, 88, 0.4], [158, 80, 0.35]] as const) {
    ctx.globalAlpha = 0.55 + Math.sin(t * 0.04 + fx) * 0.2;
    ctx.fillStyle = '#A3E635'; ctx.beginPath(); ctx.ellipse(fx, fy, 10 * s * 2, 12 * s * 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#052e16'; ctx.beginPath(); ctx.arc(fx - 3 * s * 2, fy - 2, 2 * s * 2, 0, Math.PI * 2); ctx.arc(fx + 3 * s * 2, fy - 2, 2 * s * 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(fx, fy + 5 * s * 2, 3 * s * 2, 4 * s * 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(90, 46); ctx.lineTo(130, 46); ctx.lineTo(96, 80); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.3; for (let k = 0; k < 14; k++) { const sx = 88 + hash(k * 9) * 80, sy = 46 + hash(k * 4) * 48; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 8 + hash(k) * 10, sy + (hash(k * 2) - 0.5) * 4); ctx.stroke(); }
  ctx.restore();
  print(ctx, 176, 70, 6, 0.4);
};

const horn = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#9D174D', '#0E0208');
  // The horn: the rubber bulb (red, cracked, perished), the chrome trumpet off it, tassels, a TAYVON sticker
  // peeled half off, a sucked-on bit of candy stuck to the bell
  const squeeze = 1 - Math.max(0, Math.sin(t * 0.08)) * 0.12;
  ctx.save(); ctx.translate(70, 76); ctx.scale(squeeze, 2 - squeeze);
  shape(ctx, () => ctx.ellipse(0, 0, 30, 26, 0, 0, Math.PI * 2), lin(ctx, -26, 26, [[0, '#F87171'], [1, '#7F1D1D']]), 1.6);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-10, -12, 9, 5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(60, 10, 10, 0.7)'; ctx.lineWidth = 0.4; for (let k = 0; k < 8; k++) { const a = hash(k) * 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 14); ctx.lineTo(Math.cos(a + 0.1) * 26, Math.sin(a + 0.1) * 22); ctx.stroke(); }
  ctx.restore();
  shape(ctx, () => { ctx.moveTo(98, 70); ctx.lineTo(186, 50); ctx.lineTo(236, 22); ctx.lineTo(236, 126); ctx.lineTo(186, 98); ctx.lineTo(98, 82); }, lin(ctx, 22, 126, [[0, '#F4F4F5'], [0.5, '#A1A1AA'], [1, '#3F3F46']]), 1.6);
  glint(ctx, 104, 72, 80, -0.22); glint(ctx, 192, 60, 40, -0.5);
  shape(ctx, () => ctx.ellipse(236, 74, 6, 52, 0, 0, Math.PI * 2), '#27272A', 1.4);
  // (the sticker)
  ctx.save(); ctx.translate(150, 74); ctx.rotate(-0.15); shape(ctx, () => { ctx.moveTo(-16, -6); ctx.lineTo(16, -6); ctx.lineTo(16, 6); ctx.lineTo(4, 6); ctx.lineTo(0, 10); ctx.lineTo(-16, 6); }, '#FDE047', 0.8);
  ctx.fillStyle = '#1D4ED8'; ctx.font = 'bold 7px "Courier New", monospace'; ctx.fillText('TAYVON', -14, 3); ctx.restore();
  for (let k = 0; k < 8; k++) { ctx.strokeStyle = ['#F472B6', '#60A5FA', '#FDE047', '#34D399'][k % 4]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(100, 82); ctx.quadraticCurveTo(96 + k * 3, 110, 92 + k * 4 + Math.sin(t * 0.05 + k) * 3, 136); ctx.stroke(); }
  shape(ctx, () => ctx.ellipse(214, 94, 5, 4, 0.3, 0, Math.PI * 2), '#22D3EE', 0.7);
  hair(ctx, 212, 92, 5, 3);
  if (squeeze < 0.95) { ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillText('HONK', 190, 16); }
};

const hardhat = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#1E40AF', '#020617');
  // The hard hat, upside down, a bowl now: full of protein cereal swelling in milk, a spoon stuck in it standing up,
  // CON ED on the side, stickers, scuffs, the cradle straps hanging out of the cereal
  shape(ctx, () => { ctx.moveTo(40, 52); ctx.bezierCurveTo(40, 130, 216, 130, 216, 52); ctx.closePath(); }, lin(ctx, 52, 130, [[0, '#FDE047'], [1, '#A16207']]), 1.8);
  shape(ctx, () => ctx.ellipse(128, 52, 96, 18, 0, 0, Math.PI * 2), '#EAB308', 1.6);
  shape(ctx, () => ctx.ellipse(128, 54, 86, 14, 0, 0, Math.PI * 2), '#F8FAF0', 1);
  for (let i = 0; i < 70; i++) { const a = hash(i) * Math.PI * 2, r = Math.sqrt(hash(i * 3)) * 0.95, x = 128 + Math.cos(a) * 82 * r, y = 54 + Math.sin(a) * 12 * r; shape(ctx, () => ctx.ellipse(x, y, 3.2, 2, hash(i * 5) * 3, 0, Math.PI * 2), hash(i * 7) > 0.5 ? '#B45309' : '#D97706', 0.4); }
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(70, 50); ctx.quadraticCurveTo(80, 70, 66, 86); ctx.stroke();
  shape(ctx, () => ctx.ellipse(150, 50, 7, 4, 0.4, 0, Math.PI * 2), '#D4D4D8', 0.8);
  shape(ctx, () => { ctx.moveTo(152, 48); ctx.lineTo(176, 8); ctx.lineTo(180, 10); ctx.lineTo(156, 52); }, '#E4E4E7', 1);
  glint(ctx, 166, 22, 18, -1.05);
  ctx.fillStyle = '#1E3A8A'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillText('CON ED', 96, 100);
  shape(ctx, () => ctx.ellipse(70, 92, 9, 6, 0.2, 0, Math.PI * 2), '#F8FAFC', 0.8);
  ctx.fillStyle = '#DC2626'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('NO FEAR', 62, 94);
  speckle(ctx, 40, 60, 176, 60, 300, 'rgba(60, 40, 0, 0.35)', 41, 0.6);
  ctx.strokeStyle = 'rgba(60,40,0,0.5)'; ctx.lineWidth = 0.4; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(150 + k * 6, 80); ctx.lineTo(160 + k * 5, 90); ctx.stroke(); }
  ctx.fillStyle = 'rgba(248, 250, 240, 0.9)'; ctx.fillRect(196, 64, 1.4, 10 + (t * 0.1) % 20);
  fly(ctx, 100, 36, t, 11);
};

const toaster = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#7C2D12', '#0C0402');
  // The toaster: chrome, and caved in on one side in the shape of his face (nose, brow, the lot); the toast up
  // in it, burnt black; crumbs everywhere, the cord frayed
  shape(ctx, () => ctx.roundRect(54, 40, 148, 92, 24), lin(ctx, 40, 132, [[0, '#F4F4F5'], [0.5, '#A1A1AA'], [1, '#52525B']]), 1.8);
  for (const sx of [86, 140]) { shape(ctx, () => ctx.roundRect(sx, 36, 34, 8, 3), '#27272A', 1); shape(ctx, () => ctx.rect(sx + 2, 12 + Math.sin(t * 0.03 + sx) * 1, 30, 28), '#1C1917', 1.2); speckle(ctx, sx + 2, 12, 30, 28, 60, 'rgba(120, 53, 15, 0.6)', sx, 0.8); }
  // (his face, pressed in: the brow, the sockets, the nose, the mouth open, lit and shadowed like a mold of it)
  ctx.save(); ctx.translate(124, 92);
  ctx.fillStyle = 'rgba(39, 39, 42, 0.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; ctx.beginPath(); ctx.ellipse(-8, -10, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(24, 24, 27, 0.7)'; ctx.beginPath(); ctx.ellipse(-11, -4, 6, 4, 0, 0, Math.PI * 2); ctx.ellipse(11, -4, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(-5, 6); ctx.lineTo(4, 6); ctx.fill();
  ctx.fillStyle = 'rgba(24, 24, 27, 0.7)'; ctx.beginPath(); ctx.ellipse(0, 13, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(0, 0, 30, 22, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(185, 28, 28, 0.6)'; ctx.beginPath(); ctx.arc(120, 100, 2, 0, Math.PI * 2); ctx.fill();
  hair(ctx, 104, 82, 6, 5); hair(ctx, 140, 84, 5, 6);
  glint(ctx, 64, 110, 60, -1.3);
  shape(ctx, () => ctx.roundRect(196, 66, 10, 20, 2), '#18181B', 0.8);
  ctx.strokeStyle = '#18181B'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(56, 120); ctx.bezierCurveTo(30, 130, 30, 140, 10, 144); ctx.stroke();
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 0.4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(28, 134); ctx.lineTo(24 + k * 2, 128 + k); ctx.stroke(); }
  speckle(ctx, 40, 130, 180, 12, 120, '#92400E', 47, 1);
  smoke(ctx, t);
};
/** (the burnt toast smoking) */
const smoke = (ctx: Ctx, t: number) => {
  for (let i = 0; i < 6; i++) { const k = ((t * 0.01 + i / 6) % 1), x = 116 + Math.sin(k * 6 + i) * 8, y = 12 - k * 20; ctx.fillStyle = `rgba(120, 113, 108, ${0.5 - k * 0.5})`; ctx.beginPath(); ctx.arc(x, y, 3 + k * 8, 0, Math.PI * 2); ctx.fill(); }
};

const breaker = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#1E3A5F', '#02050A');
  // The main breaker off the power room wall: a slab of slate, cracked across a corner, its bolts sheared where it came
  // off; the two copper jaws at the top, black with scorching, the copper blades pulled down out of them to OFF, the
  // red handle on its crossbar (a bloody print on it, and the rubber split); the label, MANHATTAN, the tape peeling;
  // Gary's sticky note; and every so often an arc jumping off the jaws, though it isn't on anything at all
  ctx.save(); ctx.translate(128, 72); ctx.rotate(0.04);
  // (the slab)
  const slab = () => { ctx.moveTo(-58, -64); ctx.lineTo(58, -64); ctx.lineTo(58, 60); ctx.lineTo(-40, 60); ctx.lineTo(-58, 44); ctx.closePath(); };
  shape(ctx, slab, lin(ctx, -64, 60, [[0, '#57534E'], [0.5, '#3F3F46'], [1, '#27272A']]), 1.6);
  ctx.save(); ctx.beginPath(); slab(); ctx.clip();
  speckle(ctx, -60, -66, 120, 128, 500, 'rgba(255,255,255,0.06)', 3, 0.6);
  speckle(ctx, -60, -66, 120, 128, 300, 'rgba(0,0,0,0.25)', 5, 0.7);
  // (the crack, across the corner it lost)
  ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-58, 30); ctx.lineTo(-44, 36); ctx.lineTo(-40, 48); ctx.lineTo(-30, 52); ctx.stroke();
  ctx.restore();
  // (the bolts, two of them sheared off)
  for (const [x, y, sheared] of [[-50, -56, false], [50, -56, true], [50, 52, false], [-34, 52, true]] as const) {
    shape(ctx, () => ctx.arc(x, y, 3.4, 0, Math.PI * 2), sheared ? '#A8A29E' : '#71717A', 0.8);
    if (sheared) { ctx.fillStyle = '#D6D3D1'; ctx.beginPath(); ctx.arc(x - 0.6, y - 0.6, 1.8, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.strokeStyle = INK; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - 2.4, y); ctx.lineTo(x + 2.4, y); ctx.stroke(); }
  }
  // ON and OFF, stencilled
  ctx.font = 'bold 9px "Courier New", monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#16A34A'; ctx.fillText('ON', 0, -50); ctx.fillStyle = '#DC2626'; ctx.fillText('OFF', 0, 56);
  // The scorch round the jaws
  for (const x of [-24, 24]) { const g = ctx.createRadialGradient(x, -34, 1, x, -34, 22); g.addColorStop(0, 'rgba(10,8,6,0.85)'); g.addColorStop(1, 'rgba(10,8,6,0)'); ctx.fillStyle = g; ctx.fillRect(x - 24, -58, 48, 48); }
  // The jaws: copper, gone black and green, the springs
  for (const x of [-24, 24]) {
    shape(ctx, () => ctx.rect(x - 6, -44, 12, 18), lin(ctx, -44, -26, [[0, '#FDBA74'], [0.4, '#C2410C'], [1, '#431407']]), 1.2);
    ctx.fillStyle = 'rgba(20, 83, 45, 0.6)'; ctx.fillRect(x - 5, -30, 10, 3);
    ctx.fillStyle = '#18181B'; ctx.fillRect(x - 1, -44, 2, 18);
    shape(ctx, () => ctx.rect(x - 7, -24, 14, 6), '#78350F', 0.8);
  }
  // The blades, pulled down out of them to OFF, and the crossbar and the handle
  for (const x of [-24, 24]) shape(ctx, () => ctx.rect(x - 2.6, -20, 5.2, 50), lin(ctx, -20, 30, [[0, '#FED7AA'], [0.3, '#F59E0B'], [1, '#9A3412']]), 1);
  for (const x of [-24, 24]) glint(ctx, x - 1.6, -16, 40, Math.PI / 2);
  shape(ctx, () => ctx.rect(-28, 28, 56, 5), lin(ctx, 28, 33, [[0, '#D6D3D1'], [1, '#57534E']]), 1);
  shape(ctx, () => ctx.roundRect(-10, 32, 20, 16, 3), lin(ctx, 32, 48, [[0, '#F87171'], [0.5, '#DC2626'], [1, '#7F1D1D']]), 1.2);
  ctx.strokeStyle = '#450A0A'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(-4, 34); ctx.lineTo(-1, 40); ctx.lineTo(-3, 46); ctx.stroke();
  print(ctx, 4, 40, 2.6, 0.4); ctx.fillStyle = 'rgba(127, 29, 29, 0.6)'; ctx.beginPath(); ctx.ellipse(-5, 42, 2, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  // The label: a strip of tape, MANHATTAN in marker, peeling up at one end
  shape(ctx, () => { ctx.moveTo(-34, -8); ctx.lineTo(30, -10); ctx.lineTo(36, -16); ctx.lineTo(34, 0); ctx.lineTo(-34, 2); ctx.closePath(); }, '#F5F5DC', 0.8);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('MANHATTAN', -2, -1);
  ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('(ALL OF IT)', 0, 5.5);
  // Gary's sticky note, curling: DO NOT TOUCH. — GARY. Somebody's crossed out NOT
  ctx.save(); ctx.translate(36, 12); ctx.rotate(0.15);
  shape(ctx, () => { ctx.moveTo(0, 0); ctx.lineTo(18, 0); ctx.lineTo(18, 14); ctx.quadraticCurveTo(12, 18, 0, 18); ctx.closePath(); }, '#FDE047', 0.6);
  ctx.fillStyle = '#1E3A8A'; ctx.font = '3.4px "Courier New", monospace'; ctx.textAlign = 'left';
  ctx.fillText('DO NOT', 2, 5); ctx.fillText('TOUCH', 2, 9); ctx.fillText('- GARY', 3, 14);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(14, 3.6); ctx.stroke();
  ctx.restore();
  // The arc, now and then, off the jaws: it isn't hooked up to anything
  const zap = Math.floor(t / 3) % 37;
  if (zap < 3) {
    ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-24, -26); let x = -24, y = -26;
    for (let k = 0; k < 6; k++) { x += 8; y += (hash(k + Math.floor(t / 3)) - 0.5) * 14; ctx.lineTo(x, y); }
    ctx.lineTo(24, -26); ctx.stroke();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.4)'; ctx.lineWidth = 4; ctx.stroke();
  }
  ctx.restore();
  hair(ctx, 70, 110, 10, 21);
};

const derrick = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#78350F', '#080401');
  // The pumpjack, desk model, nodding; the oil pooling out under it, through the papers, onto the floor
  shape(ctx, () => ctx.ellipse(128, 132, 110, 12, 0, 0, Math.PI * 2), '#0A0A0A', 1.2);
  ctx.fillStyle = 'rgba(120, 90, 200, 0.25)'; ctx.beginPath(); ctx.ellipse(110, 130, 60, 5, 0, 0, Math.PI * 2); ctx.fill();
  shape(ctx, () => ctx.rect(56, 116, 150, 14), '#57534E', 1.4);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(110, 116); ctx.lineTo(128, 50); ctx.lineTo(146, 116); ctx.stroke();
  ctx.strokeStyle = '#A16207'; ctx.lineWidth = 2; ctx.stroke();
  const a = Math.sin(t * 0.06) * 0.28;
  ctx.save(); ctx.translate(128, 52); ctx.rotate(a);
  shape(ctx, () => ctx.rect(-70, -5, 120, 10), '#CA8A04', 1.4);
  shape(ctx, () => { ctx.moveTo(-70, -12); ctx.quadraticCurveTo(-90, 0, -70, 14); ctx.lineTo(-62, 14); ctx.lineTo(-62, -12); }, '#A16207', 1.2);
  ctx.restore();
  const hx = 128 - Math.cos(a) * 80, hy = 52 - Math.sin(a) * 80;
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy + 10); ctx.lineTo(hx, 118); ctx.stroke();
  shape(ctx, () => ctx.arc(184, 98, 14, 0, Math.PI * 2), '#713F12', 1.4);
  ctx.save(); ctx.translate(184, 98); ctx.rotate(t * 0.06); shape(ctx, () => ctx.rect(-3, -16, 6, 20), '#CA8A04', 0.8); ctx.restore();
  // (it's leaking: oil dripping off the head, down the wellhead, a drip falling)
  const dp = (t * 0.6) % 30;
  ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(hx, 118 + dp * 0.3, 1.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(hx - 0.6, 117 + dp * 0.3, 0.6, 1);
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(126, 56, 2, 30); ctx.fillRect(140, 70, 1.4, 40);
  print(ctx, 90, 122, 5, 0.3);
  ctx.fillStyle = '#FEF3C7'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('BERTRAND PETROLEUM - EMPLOYEE OF THE MONTH', 60, 126);
};

const clock = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#334155', '#04060A');
  // The break room clock: the face yellowed, a coffee splash dried on it, UNION sticker, the hands at five to five,
  // the second hand stuck, twitching
  shape(ctx, () => ctx.arc(128, 72, 60, 0, Math.PI * 2), '#18181B', 1.8);
  shape(ctx, () => ctx.arc(128, 72, 52, 0, Math.PI * 2), lin(ctx, 20, 124, [[0, '#FEFCE8'], [1, '#E7DFC0']]), 1.2);
  ctx.fillStyle = 'rgba(120, 72, 30, 0.35)'; ctx.beginPath(); ctx.ellipse(150, 96, 14, 9, 0.5, 0, Math.PI * 2); ctx.fill();
  for (let k = 0; k < 3; k++) { ctx.fillRect(146 + k * 5, 100, 1.2, 10 + k * 4); }
  for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2; const l = k % 5 ? 3 : 7; ctx.strokeStyle = INK; ctx.lineWidth = k % 5 ? 0.5 : 1.4; ctx.beginPath(); ctx.moveTo(128 + Math.cos(a) * 49, 72 + Math.sin(a) * 49); ctx.lineTo(128 + Math.cos(a) * (49 - l), 72 + Math.sin(a) * (49 - l)); ctx.stroke(); }
  ctx.fillStyle = INK; ctx.font = 'bold 9px "Courier New", monospace'; ctx.textAlign = 'center';
  for (let h = 1; h <= 12; h++) { const a = (h / 12) * Math.PI * 2 - Math.PI / 2; ctx.fillText(String(h), 128 + Math.cos(a) * 36, 75 + Math.sin(a) * 36); }
  ctx.textAlign = 'left';
  const hand = (turns: number, len: number, w: number, c: string) => { const an = turns * Math.PI * 2 - Math.PI / 2; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(128, 72); ctx.lineTo(128 + Math.cos(an) * len, 72 + Math.sin(an) * len); ctx.stroke(); };
  hand(4.9 / 12, 26, 3, INK); hand(55 / 60, 40, 2, INK);
  hand((58 + (Math.floor(t / 30) % 2 ? 0.3 : 0)) / 60, 44, 0.7, '#DC2626');
  shape(ctx, () => ctx.arc(128, 72, 2.4, 0, Math.PI * 2), '#B91C1C', 0.5);
  shape(ctx, () => ctx.roundRect(100, 92, 28, 9, 2), '#1D4ED8', 0.6);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 4px "Courier New", monospace'; ctx.fillText('LOCAL 44', 104, 98);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(104, 44, 18, 8, -0.6, 0, Math.PI * 2); ctx.fill();
  print(ctx, 150, 50, 6, 0.4);
  speckle(ctx, 70, 14, 116, 116, 300, 'rgba(90, 80, 60, 0.25)', 53, 0.5);
};

const chain = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#3F3F46', '#050505');
  // Dirty Dan's chain: heavy links coiled up, greasy, rust in the joins, a tooth stuck in one and hair in another,
  // a padlock off the end (DAN scratched in it)
  const link = (x: number, y: number, a: number) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.strokeStyle = INK; ctx.lineWidth = 6.4; ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 4.4; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -0.8, 10, 5, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.fillStyle = 'rgba(146, 64, 14, 0.7)'; ctx.beginPath(); ctx.arc(10, 1, 1.6, 0, Math.PI * 2); ctx.arc(-10, -1, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  for (let i = 0; i < 26; i++) { const a = i * 0.48, r = 12 + i * 2.6; link(118 + Math.cos(a) * r, 76 + Math.sin(a) * r * 0.55, a + 1.57 + (i % 2) * 1.2); }
  for (let i = 0; i < 6; i++) link(190 + i * 9, 100 + i * 4, 0.42 + (i % 2) * 1.3);
  // (a tooth, wedged in a link; a tuft of beard caught in another)
  shape(ctx, () => { ctx.moveTo(126, 70); ctx.lineTo(132, 70); ctx.lineTo(133, 76); ctx.lineTo(131, 80); ctx.lineTo(129, 77); ctx.lineTo(127, 80); ctx.lineTo(125, 76); }, '#FEF9C3', 0.6);
  for (let k = 0; k < 8; k++) hair(ctx, 100 + k, 92, 7, k * 2);
  shape(ctx, () => ctx.roundRect(238, 112, 18, 22, 3), '#CA8A04', 1.3);
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(247, 112, 6, Math.PI, 0); ctx.stroke(); ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.strokeStyle = 'rgba(66, 32, 6, 0.9)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(241, 120); ctx.lineTo(243, 126); ctx.lineTo(245, 120); ctx.moveTo(247, 126); ctx.lineTo(249, 120); ctx.lineTo(251, 126); ctx.stroke();
  ctx.fillStyle = 'rgba(20, 20, 20, 0.35)'; ctx.beginPath(); ctx.ellipse(120, 120, 70, 10, 0, 0, Math.PI * 2); ctx.fill();
};

const goldgun = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#A16207', '#0C0701');
  // Chuco's pistol: gold-plated everything, gaudy scrollwork, rhinestones, pearl grips with a face on them, and its
  // eyes (a pair of rubies set in the slide) that he swears follow him round the room
  ctx.save(); ctx.translate(128, 70); ctx.rotate(-0.08);
  const g = lin(ctx, -30, 40, [[0, '#FEF08A'], [0.4, '#EAB308'], [1, '#854D0E']]);
  shape(ctx, () => ctx.roundRect(-96, -30, 180, 30, 4), g, 1.8);
  shape(ctx, () => ctx.rect(84, -26, 14, 18), g, 1.4);
  shape(ctx, () => { ctx.moveTo(-60, 0); ctx.lineTo(-20, 0); ctx.lineTo(-30, 60); ctx.lineTo(-74, 60); }, '#F5F5F4', 1.6);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(-20, 0); ctx.lineTo(-30, 60); ctx.lineTo(-74, 60); ctx.clip();
  ctx.fillStyle = 'rgba(244, 114, 182, 0.25)'; for (let k = 0; k < 8; k++) ctx.fillRect(-80, k * 8, 70, 3);
  ctx.restore();
  ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.arc(-46, 22, 2, 0, Math.PI * 2); ctx.arc(-36, 22, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-41, 30, 6, 0.2, Math.PI - 0.2); ctx.stroke();
  shape(ctx, () => { ctx.moveTo(-20, 0); ctx.quadraticCurveTo(0, 22, 20, 0); }, 'rgba(0,0,0,0)', 1.6);
  ctx.strokeStyle = 'rgba(113, 63, 18, 0.7)'; ctx.lineWidth = 0.5;
  for (let k = 0; k < 14; k++) { const sx = -84 + k * 12; ctx.beginPath(); ctx.arc(sx, -15, 4, 0, Math.PI * 1.5); ctx.stroke(); }
  for (let k = 0; k < 16; k++) { const rx = -90 + k * 11, ry = -27; ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.arc(rx, ry, 1.3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(rx - 0.4, ry - 0.9, 0.6, 0.6); }
  // (the eyes: they look at you; they keep looking at you)
  const look = Math.sin(t * 0.02) * 1.6;
  for (const ex of [20, 44]) { shape(ctx, () => ctx.ellipse(ex, -15, 7, 5, 0, 0, Math.PI * 2), '#FFFFFF', 0.9); ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.arc(ex + look, -15, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + look, -15, 1.3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex + look - 1.4, -17, 0.9, 0.9); }
  glint(ctx, -90, -24, 120, 0); glint(ctx, -60, -6, 60, 0.02);
  ctx.restore();
  print(ctx, 164, 62, 5, 0.3);
  for (let k = 0; k < 7; k++) { const sx = 40 + hash(k * 3) * 180, sy = 20 + hash(k * 5) * 110, s = 2 + Math.sin(t * 0.1 + k) * 1.5; ctx.fillStyle = '#FFFBEB'; ctx.fillRect(sx - s, sy - 0.3, s * 2, 0.6); ctx.fillRect(sx - 0.3, sy - s, 0.6, s * 2); }
};

const badge = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#92400E', '#0A0501');
  // The badge: a costume star, gold-colored tin, SHERIFF stamped crooked on it, one point bent, the pin bent, the $10
  // sticker still on the back showing round the edge, a smear of greasepaint
  const star = () => { for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 26 : (k === 4 ? 46 : 56); const px = 128 + Math.cos(a) * r, py = 74 + Math.sin(a) * r; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); };
  shape(ctx, () => { ctx.rect(150, 96, 28, 14); }, '#F8FAFC', 0.7);
  ctx.fillStyle = '#B91C1C'; ctx.font = 'bold 8px "Courier New", monospace'; ctx.fillText('$10', 154, 106);
  shape(ctx, star, lin(ctx, 18, 130, [[0, '#FEF08A'], [0.5, '#EAB308'], [1, '#713F12']]), 1.8);
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * (2 * Math.PI / 5), r = k === 2 ? 42 : 52; shape(ctx, () => ctx.arc(128 + Math.cos(a) * r, 74 + Math.sin(a) * r, 4, 0, Math.PI * 2), '#FDE047', 1); }
  shape(ctx, () => ctx.arc(128, 74, 20, 0, Math.PI * 2), '#CA8A04', 1);
  ctx.save(); ctx.translate(128, 76); ctx.rotate(-0.12); ctx.fillStyle = '#713F12'; ctx.font = 'bold 8px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText('SHERIFF', 0, 3); ctx.textAlign = 'left'; ctx.restore();
  // (the plastic sheen, scratches, a thumbprint in greasepaint)
  glint(ctx, 104, 56, 30, -0.4);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 0.3; for (let k = 0; k < 12; k++) { const sx = 100 + hash(k * 3) * 56, sy = 50 + hash(k * 5) * 50; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 6, sy + 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(244, 114, 182, 0.35)'; ctx.beginPath(); ctx.ellipse(146, 60, 6, 8, 0.3, 0, Math.PI * 2); ctx.fill();
  print(ctx, 146, 60, 6, 0.3);
  ctx.strokeStyle = '#A1A1AA'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(84, 66); ctx.lineTo(72, 50); ctx.lineTo(80, 46); ctx.stroke();
};

const lizard = (ctx: Ctx, t: number) => {
  backdrop(ctx, t, '#4D7C0F', '#030701');
  // Riggs's lizard: fat, well fed, scales every one of them, the eye bulging and swiveling, the throat going, the
  // tongue out after a cricket (it gets it, every so often)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(128, 128, 96, 9, 0, 0, Math.PI * 2); ctx.fill();
  const body = () => { ctx.moveTo(30, 110); ctx.bezierCurveTo(10, 110, 6, 80, 40, 92); ctx.bezierCurveTo(80, 70, 140, 66, 170, 74); ctx.bezierCurveTo(200, 72, 222, 76, 230, 88); ctx.bezierCurveTo(232, 100, 214, 108, 196, 106); ctx.bezierCurveTo(160, 120, 90, 124, 30, 110); };
  shape(ctx, body, lin(ctx, 66, 124, [[0, '#84CC16'], [0.6, '#4D7C0F'], [1, '#1A2E05']]), 1.8);
  ctx.save(); ctx.beginPath(); body(); ctx.clip();
  ctx.strokeStyle = 'rgba(26, 46, 5, 0.6)'; ctx.lineWidth = 0.35;
  for (let y = 64; y < 126; y += 3) for (let x = 10 + ((y / 3) % 2) * 1.5; x < 236; x += 3) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = 'rgba(234, 179, 8, 0.4)'; for (let k = 0; k < 10; k++) { ctx.beginPath(); ctx.ellipse(60 + k * 14, 86 + (k % 2) * 4, 4, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  // (the legs, the toes splayed, claws)
  for (const [lx, ly] of [[70, 112], [150, 112], [190, 104]]) { shape(ctx, () => ctx.rect(lx - 4, ly, 8, 12), '#4D7C0F', 1); for (let c = 0; c < 4; c++) { ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(lx, ly + 12); ctx.lineTo(lx - 7 + c * 4.6, ly + 18); ctx.stroke(); } }
  // (the throat, pulsing)
  const throat = 1 + Math.max(0, Math.sin(t * 0.2)) * 0.25;
  shape(ctx, () => ctx.ellipse(212, 104, 10 * throat, 6 * throat, 0, 0, Math.PI * 2), '#FDE68A', 1);
  // (the eye: a cone of scales, the pupil a slot, swiveling)
  shape(ctx, () => ctx.arc(210, 80, 8, 0, Math.PI * 2), '#65A30D', 1.2);
  shape(ctx, () => ctx.arc(211, 80, 5, 0, Math.PI * 2), '#FACC15', 0.8);
  const ea = Math.sin(t * 0.03) * 2;
  ctx.fillStyle = INK; ctx.fillRect(210.4 + ea, 76, 1.4, 8);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(209, 77, 1, 1);
  if (Math.floor(t / 90) % 6 === 0 && t % 90 < 6) { shape(ctx, () => ctx.arc(210, 80, 8, 0, Math.PI * 2), '#4D7C0F', 1.2); }
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(228, 86, 1, 0, Math.PI * 2); ctx.fill();
  // (the tongue, out after the cricket)
  const lick = Math.max(0, Math.sin(t * 0.07)) ** 4;
  if (lick > 0.05) { ctx.strokeStyle = '#E11D48'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(230, 92); ctx.lineTo(230 + lick * 20, 92 - lick * 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(230 + lick * 20, 92 - lick * 4); ctx.lineTo(233 + lick * 20, 89 - lick * 4); ctx.moveTo(230 + lick * 20, 92 - lick * 4); ctx.lineTo(233 + lick * 20, 94 - lick * 4); ctx.stroke(); }
  const cx = 250 - lick * 2;
  ctx.fillStyle = '#78350F'; ctx.beginPath(); ctx.ellipse(cx, 86, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 2, 86); ctx.lineTo(cx - 6, 92); ctx.moveTo(cx, 86); ctx.lineTo(cx + 3, 93); ctx.moveTo(cx + 2, 84); ctx.lineTo(cx + 6, 78); ctx.stroke();
};

/** Each souvenir's close-up, by its id. */
const SOUVENIR_CLOSEUPS: Record<string, (ctx: Ctx, t: number) => void> = {
  antler, moonboots, snowglobe, viprope, lavalamp, neon, mug, seismo, bell, flamingo, clicker, daycare,
  flintjar, hazmat, horn, hardhat, toaster, breaker, derrick, clock, chain, goldgun, badge, lizard,
};

/** Draws one, with the slow push in and the finish. */
export const drawSouvenirCloseup = (ctx: Ctx, id: string, t: number) => {
  const draw = SOUVENIR_CLOSEUPS[id];
  if (!draw) return;
  ctx.save();
  const z = 1 + Math.min(t, 300) / 300 * 0.05;
  ctx.translate(128, 72); ctx.scale(z, z); ctx.translate(-128, -72);
  draw(ctx, t);
  ctx.restore();
  finish(ctx, t);
};
