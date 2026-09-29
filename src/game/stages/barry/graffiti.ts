// Graffiti on New York's walls: sprayed on, not printed. Fat bubble letters that lean and bounce, a dark outline
// round them and a 3D drop behind, a fill that fades from one color to another, shine on the letters, paint running
// down off the bottoms, and the haze of overspray round the lot; a scrawled tag (a signature) by it. Each piece is
// painted once into its own little canvas and kept.

type Ctx = CanvasRenderingContext2D;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** Fill colors top and bottom, the outline, the 3D drop. */
const PALETTES: [string, string, string, string][] = [
  ['#F472B6', '#A21CAF', '#1E1B4B', '#22D3EE'],
  ['#A3E635', '#15803D', '#052E16', '#FDE047'],
  ['#22D3EE', '#1D4ED8', '#0F172A', '#F472B6'],
  ['#FDE047', '#EA580C', '#1C1917', '#DC2626'],
  ['#F8FAFC', '#94A3B8', '#111827', '#EF4444'],
];

/** The chunky, rounded letters: whatever heavy sans the machine has (it's all offline). */
const FONT = (px: number) => `900 ${px}px Impact, "Arial Black", "Haettenschweiler", sans-serif`;

const cache = new Map<string, HTMLCanvasElement>();

/** A piece: `text` in bubble letters about `size` px tall, laid out from its seed. */
const paint = (text: string, size: number, seed: number): HTMLCanvasElement => {
  const key = `${text}|${size}|${seed}`;
  const have = cache.get(key);
  if (have) return have;
  const [top, bottom, line, drop] = PALETTES[Math.floor(hash(seed) * PALETTES.length)];
  const c = document.createElement('canvas');
  const m = c.getContext('2d')!;
  m.font = FONT(size);
  // Each letter its own way: a lean, a bounce up or down, a touch bigger or smaller
  // (small ones keep it tidier, or they're unreadable)
  const wild = size >= 24 ? 1 : 0.55;
  const letters = [...text].map((ch, i) => ({
    ch,
    rot: (hash(seed * 7 + i) - 0.5) * 0.38 * wild,
    dy: (hash(seed * 13 + i) - 0.5) * size * 0.32 * wild,
    scale: 0.88 + hash(seed * 3 + i) * 0.3,
  }));
  const gap = size >= 24 ? -size * 0.06 : size * 0.02;       // (fat letters crowd into each other)
  const widths = letters.map(l => (l.ch === ' ' ? size * 0.3 : m.measureText(l.ch).width * l.scale));
  const w = Math.ceil(widths.reduce((a, b) => a + b + gap, 0) + size * 1.2);
  const h = Math.ceil(size * 2.3);
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const base = size * 1.2;
  // The overspray: a soft haze of the color behind it all
  // (an oval, fading out before the edges)
  g.save();
  g.translate(w / 2, base - size * 0.4); g.scale(1, (h * 0.46) / (w * 0.5));
  const haze = g.createRadialGradient(0, 0, size * 0.2, 0, 0, w * 0.5);
  haze.addColorStop(0, hexA(top, 0.22)); haze.addColorStop(1, hexA(top, 0));
  g.fillStyle = haze; g.beginPath(); g.arc(0, 0, w * 0.5, 0, Math.PI * 2); g.fill();
  g.restore();
  const place = (fn: (l: typeof letters[number], x: number) => void) => {
    let x = size * 0.6;
    letters.forEach((l, i) => { if (l.ch !== ' ') fn(l, x); x += widths[i] + gap; });
  };
  const glyph = (l: typeof letters[number], x: number, dx: number, dy: number, draw: () => void) => {
    g.save();
    g.translate(x + dx + (widths[letters.indexOf(l)] / 2), base + l.dy + dy);
    g.rotate(l.rot); g.scale(l.scale, l.scale);
    g.font = FONT(size); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    draw();
    g.restore();
  };
  // The 3D drop behind, then the fat outline, then the fill (a fade), then a thin light edge inside
  const d = Math.max(2, size * 0.1);
  place((l, x) => glyph(l, x, d, d, () => { g.lineWidth = size * (size >= 24 ? 0.3 : 0.2); g.strokeStyle = drop; g.strokeText(l.ch, 0, 0); g.fillStyle = drop; g.fillText(l.ch, 0, 0); }));
  place((l, x) => glyph(l, x, 0, 0, () => { g.lineWidth = size * (size >= 24 ? 0.26 : 0.18); g.strokeStyle = line; g.strokeText(l.ch, 0, 0); }));
  // Paint running down off the bottoms of the letters
  g.strokeStyle = bottom;
  for (let i = 0; i < letters.length; i++) {
    if (letters[i].ch === ' ' || hash(seed * 17 + i) < 0.45) continue;
    let x = size * 0.6; for (let j = 0; j < i; j++) x += widths[j] + gap;
    const dx = x + widths[i] * (0.25 + hash(seed * 19 + i) * 0.5), len = size * (0.25 + hash(seed * 23 + i) * 0.7);
    const y0 = base + letters[i].dy + size * 0.04;
    g.lineWidth = Math.max(1.5, size * 0.07); g.beginPath(); g.moveTo(dx, y0); g.lineTo(dx, y0 + len); g.stroke();
    g.fillStyle = bottom; g.beginPath(); g.arc(dx, y0 + len, g.lineWidth * 0.9, 0, Math.PI * 2); g.fill();
  }
  // (the fade's in each letter's own space, so it runs top to bottom of every one however it leans)
  place((l, x) => glyph(l, x, 0, 0, () => {
    const f = g.createLinearGradient(0, -size * 0.85, 0, size * 0.1);
    f.addColorStop(0, top); f.addColorStop(0.5, top); f.addColorStop(1, bottom);
    g.fillStyle = f; g.fillText(l.ch, 0, 0);
    g.lineWidth = Math.max(1, size * 0.04); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.strokeText(l.ch, -size * 0.02, -size * 0.02);
  }));
  // Shine: a spark or two on the letters
  for (let i = 0; i < 2; i++) {
    const sx = size * 0.8 + hash(seed * 29 + i) * (w - size * 1.6), sy = base - size * (0.5 + hash(seed * 31 + i) * 0.3), r = size * 0.14;
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.moveTo(sx, sy - r); g.lineTo(sx + r * 0.25, sy - r * 0.25); g.lineTo(sx + r, sy); g.lineTo(sx + r * 0.25, sy + r * 0.25);
    g.lineTo(sx, sy + r); g.lineTo(sx - r * 0.25, sy + r * 0.25); g.lineTo(sx - r, sy); g.lineTo(sx - r * 0.25, sy - r * 0.25); g.closePath(); g.fill();
  }
  cache.set(key, c);
  return c;
};

/** A tag: a quick scrawled signature, one loopy line, with an underline flourish. */
const drawTag = (ctx: Ctx, x: number, y: number, w: number, h: number, seed: number, color: string) => {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const n = 5 + Math.floor(hash(seed) * 4);
  ctx.moveTo(x, y);
  // (letters of uneven widths, some tall, some loops, a slant to the lot)
  const cuts = [0];
  for (let i = 0; i < n; i++) cuts.push(cuts[i] + 0.5 + hash(seed * 11 + i));
  const slant = h * 0.35;
  for (let i = 0; i < n; i++) {
    const x0 = x + (cuts[i] / cuts[n]) * w, x1 = x + (cuts[i + 1] / cuts[n]) * w;
    const tall = hash(seed * 13 + i) < 0.3 ? 1.5 : 1;
    const up = y - h * (0.35 + hash(seed + i) * 0.65) * tall, loop = hash(seed * 3 + i) < 0.4;
    ctx.bezierCurveTo(x0 + (x1 - x0) * (loop ? 1.3 : 0.2) + slant, up, x0 + (x1 - x0) * (loop ? -0.3 : 0.8) + slant, up, x1, y + (hash(seed * 5 + i) - 0.5) * h * 0.5);
  }
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 2, y + 4); ctx.quadraticCurveTo(x + w * 0.5, y + 8, x + w + 6, y + 1); ctx.stroke();
  // (the crown some writers put over their name)
  if (hash(seed * 7) < 0.4) { ctx.beginPath(); ctx.moveTo(x + w * 0.3, y - h - 2); ctx.lineTo(x + w * 0.36, y - h - 8); ctx.lineTo(x + w * 0.42, y - h - 3); ctx.lineTo(x + w * 0.48, y - h - 9); ctx.lineTo(x + w * 0.54, y - h - 2); ctx.stroke(); }
  ctx.restore();
};

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * A piece of graffiti with its bottom left at (x, y) (the letters sit on y), about `size` px tall, and fitted into
 * `maxW` if it would run wider; a tag next to it. `seed` picks its colors and how it's laid out.
 */
export const drawGraffiti = (ctx: Ctx, x: number, y: number, text: string, size: number, seed: number, maxW = Infinity) => {
  if (typeof document === 'undefined') return;
  const piece = paint(text, size, seed);
  const k = Math.min(1, maxW / piece.width);
  const w = piece.width * k, h = piece.height * k;
  ctx.drawImage(piece, x - size * 0.6 * k, y - size * 1.2 * k, w, h);
  const [, , , drop] = PALETTES[Math.floor(hash(seed) * PALETTES.length)];
  if (hash(seed * 41) < 0.7) drawTag(ctx, x + w - size * 0.9 * k, y + 2, Math.min(46, size * 1.6), Math.min(12, size * 0.4), seed * 43, hexA(drop, 0.85));
};

/** Just a tag (a wall that's only been hit by someone passing). */
export const drawTagOnly = (ctx: Ctx, x: number, y: number, seed: number) => {
  drawTag(ctx, x, y, 40 + hash(seed) * 30, 10 + hash(seed * 2) * 6, seed, ['#F8FAFC', '#F472B6', '#22D3EE', '#A3E635', '#FDE047'][Math.floor(hash(seed * 3) * 5)]);
};
