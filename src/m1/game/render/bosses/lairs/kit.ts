// Bits the boss lairs share: flat pixel-snapped fills, a fixed scatter, little signs and labels, and the room's
// frame (the side columns and the floor strip every lair has, in its own materials).

export type Ctx = CanvasRenderingContext2D;

/** A fixed scatter in 0..1 (the same every frame for the same n). */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** A filled rect, snapped to whole pixels. */
export const box = (ctx: Ctx, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
};

/** A rect with a lit top/left edge and a shaded bottom/right one: the stepped bevel everything solid gets. */
export const bevel = (ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, lit: string, shade: string, t = 2) => {
  box(ctx, x, y, w, h, fill);
  box(ctx, x, y, w, t, lit); box(ctx, x, y, t, h, lit);
  box(ctx, x, y + h - t, w, t, shade); box(ctx, x + w - t, y, t, h, shade);
};

/** Small text (labels, signs), centred on x unless `align` says otherwise. */
export const label = (ctx: Ctx, text: string, x: number, y: number, color: string, size = 6, align: CanvasTextAlign = 'center', font = '"Press Start 2P"') => {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(text, Math.round(x), Math.round(y));
  ctx.textAlign = 'left';
};

/** A picture frame on the wall: frame, mat, and whatever `inside` paints in the (x, y, w, h) of the picture. */
export const frame = (ctx: Ctx, x: number, y: number, w: number, h: number, frameColor: string, frameLit: string, inside: () => void) => {
  bevel(ctx, x - 4, y - 4, w + 8, h + 8, frameColor, frameLit, 'rgba(0,0,0,0.45)', 2);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  inside();
  ctx.restore();
  // (a glint off the glass, top left)
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * 0.35, y); ctx.lineTo(x, y + h * 0.5); ctx.closePath(); ctx.fill();
};

/** A light on a cord from the ceiling, swinging a touch, with stepped rings of light round it. */
export const hangingLight = (ctx: Ctx, x: number, top: number, len: number, frame: number, glow: string, sway = 1) => {
  const a = Math.sin(frame * 0.03 + x * 0.01) * 0.03 * sway;
  const bx = x + Math.sin(a) * len, by = top + Math.cos(a) * len;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(bx, by); ctx.stroke();
  const [r, g, b] = [1, 3, 5].map(i => parseInt(glow.slice(i, i + 2), 16));
  for (let i = 4; i >= 1; i--) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.05 * (5 - i)})`;
    ctx.beginPath(); ctx.arc(bx, by + 6, 14 * i, 0, Math.PI * 2); ctx.fill();
  }
  return { x: bx, y: by };
};

/** A sign of `lines` of text on a board. */
export const sign = (ctx: Ctx, x: number, y: number, w: number, h: number, lines: string[], bg: string, fg: string, edge: string, size = 6) => {
  bevel(ctx, x, y, w, h, bg, edge, 'rgba(0,0,0,0.35)', 2);
  const step = size + 4;
  const y0 = y + h / 2 - ((lines.length - 1) * step) / 2 + size / 2;
  lines.forEach((t, i) => label(ctx, t, x + w / 2, y0 + i * step, fg, size));
};
