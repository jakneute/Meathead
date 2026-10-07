// The drawing kit Oscar's rooms and field share: neon that fades with the wall it's on, the gas as a haze in hard
// bands, wood paneling, the gas line's pipe and its rusted joint, inked struts for the derricks, charred stumps of
// wall, what's flying when a room goes up, the snores, and the rainbow on spilled oil.
//
// Everything in the 16-bit way: an ink line round each thing, its colour in steps (lit from the upper left),
// glows in rings, no smooth gradients and no blur.

import { checker, pixelBlob, tilePattern } from '../../render/pixelArt';
import { INK, dark, lite } from '../../render/npc/kit';
import { column, pipe } from '../barry/rooms';

type Ctx = CanvasRenderingContext2D;

/**
 * Neon lettering, centered on x: lit, a halo round the tube in two hard steps, the tube, a hot core; off, a dead
 * grey tube with its ink line. Scaled by whatever alpha the wall it's on is drawn at (the front fades as he goes in).
 */
export const neon = (ctx: Ctx, text: string, x: number, y: number, size: number, tube: string, on: boolean) => {
  ctx.save();
  const a0 = ctx.globalAlpha;
  ctx.font = `bold ${size}px monospace`; ctx.textAlign = 'center';
  const ring = (r: number, c: string) => { ctx.fillStyle = c; for (const [dx, dy] of [[-r, 0], [r, 0], [0, -r], [0, r], [-r, -r], [r, -r], [-r, r], [r, r]]) ctx.fillText(text, x + dx, y + dy); };
  if (on) {
    ctx.globalAlpha = a0 * 0.14; ring(4, tube);
    ctx.globalAlpha = a0 * 0.28; ring(2, tube);
    ctx.globalAlpha = a0; ring(1, dark(tube, 0.4));
    ctx.fillStyle = tube; ctx.fillText(text, x, y);
    ctx.fillStyle = lite(tube, 0.6); ctx.fillText(text, x, y - 1);
  } else {
    ring(1, INK);
    ctx.fillStyle = '#57534E'; ctx.fillText(text, x, y);
  }
  ctx.restore();
};

/** The gas, a layer of it 80 tall centered on y: five hard bands, thickest in the middle, dithered at each step. */
export const gasHaze = (ctx: Ctx, x: number, w: number, y: number, a: number) => {
  const k = [0.22, 0.58, 1, 0.58, 0.22];
  const y0 = Math.round((y - 40) / 2) * 2;
  k.forEach((v, i) => {
    ctx.fillStyle = `rgba(190, 242, 100, ${(a * v).toFixed(3)})`; ctx.fillRect(x, y0 + i * 16, w, 16);
    if (i > 0) checker(ctx, x, y0 + i * 16 - 2, w, 2, `rgba(190, 242, 100, ${(a * Math.abs(v - k[i - 1]) * 0.5).toFixed(3)})`);
  });
};

/**
 * Wood paneling over (x, y, w, h): planks `pitch` wide in two tints, a groove between (lit on its left edge),
 * the grain a dither of the dark down each.
 */
export const paneling = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, pitch: number) => {
  ctx.fillStyle = tilePattern(ctx, `oscar-planks-${c}-${pitch}`, pitch * 2, 48, g => {
    for (let i = 0; i < 2; i++) {
      const px = i * pitch, tint = i ? dark(c, 0.08) : c;
      g.fillStyle = tint; g.fillRect(px, 0, pitch, 48);
      g.fillStyle = dark(c, 0.45); g.fillRect(px, 0, 2, 48);
      g.fillStyle = lite(c, 0.14); g.fillRect(px + 2, 0, 1, 48);
      g.fillStyle = dark(tint, 0.16);
      for (let gy = 0; gy < 48; gy += 2) { const gx = px + 6 + ((gy * 7 + i * 13) % (pitch - 10)); if ((gy / 2) % 3 !== 1) g.fillRect(gx, gy, 2, 2); }
      g.fillStyle = lite(tint, 0.08); g.fillRect(px + Math.floor(pitch * 0.6), 0, 1, 48);
    }
  });
  ctx.save(); ctx.translate(x, y); ctx.fillRect(0, 0, w, h); ctx.restore();
};

/** The gas line: pipe down from the ceiling (or a run along the wall), its colour in steps, inked. */
export const gasPipe = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string) => {
  if (h > w) column(ctx, x, y, w, h, c); else pipe(ctx, x, y, w, h, c);
};

/**
 * A joint in a gas line (the box it's in: x, y, w, h): a fat coupling, its collars bolted either end; rusted, or
 * blown out (black, split).
 */
export const gasJoint = (ctx: Ctx, x: number, y: number, w: number, h: number, inset: number, popped: boolean) => {
  const body = popped ? '#292524' : '#92400E', collar = popped ? '#57534E' : '#B45309';
  pipe(ctx, x + 6, y + inset, w - 12, h - inset * 2, body);
  for (const cx of [x + 3, x + w - 9]) {
    column(ctx, cx, y + inset - 2, 6, h - inset * 2 + 4, collar);
    ctx.fillStyle = lite(collar, 0.5); ctx.fillRect(cx + 2, y + inset, 2, 2); ctx.fillRect(cx + 2, y + h - inset - 2, 2, 2);
  }
  if (!popped) {
    // (rust: a bloom of it, a run down from it)
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(x + 11, y + h / 2 - 1, 6, 4); ctx.fillRect(x + 19, y + inset + 2, 4, 4);
    checker(ctx, x + 9, y + h / 2 - 3, 10, 8, '#7F1D1D');
    ctx.fillStyle = '#C2410C'; ctx.fillRect(x + 12, y + h / 2 - 1, 2, 2);
  } else {
    // (split along it, the black inside showing)
    ctx.fillStyle = INK; ctx.fillRect(x + 12, y + inset, 2, 4); ctx.fillRect(x + 14, y + inset + 4, 2, 4); ctx.fillRect(x + 12, y + inset + 8, 2, Math.max(2, h - inset * 2 - 8));
  }
};

/** A thick inked strut (a derrick's leg, a brace) from (x1, y1) to (x2, y2): the ink, the steel, a lit line along it. */
export const strut = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, c: string) => {
  ctx.lineCap = 'square';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  if (w >= 2.5) { ctx.strokeStyle = lite(c, 0.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1 - w * 0.25, y1); ctx.lineTo(x2 - w * 0.25, y2); ctx.stroke(); }
  ctx.lineCap = 'butt';
};

/** A charred stump of wall (`path` its outline): black, its edges glowing with embers, inked. */
export const stump = (ctx: Ctx, path: () => void, c: string, x: number, y: number, w: number, h: number) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
  const lw = Math.round(w * 0.3 / 2) * 2;
  ctx.fillStyle = lite(c, 0.1); ctx.fillRect(x, y, lw, h);
  checker(ctx, x + lw, y, 4, h, lite(c, 0.1));
  ctx.fillStyle = dark(c, 0.3); ctx.fillRect(x, y + h - 16, w, 16);
  checker(ctx, x, y + h - 20, w, 4, dark(c, 0.3));
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = '#9A3412'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
};

/** Smoke rolling up off it all, a puff at a time (q 0 fresh to 1 gone). */
export const smoke = (ctx: Ctx, x: number, y: number, r: number, q: number, a: number) =>
  pixelBlob(ctx, x, y, r, r * 0.8, `rgba(41, 37, 36, ${(a * (1 - q)).toFixed(3)})`, 4);

/** A bit of what's flying (a plank, a board, a door) at (0, 0), turned: its colour, a lit edge, inked. */
export const flyingBit = (ctx: Ctx, w: number, h: number, c: string) => {
  ctx.fillStyle = c; ctx.fillRect(-w / 2, -h / 2, w, h);
  if (/^#[0-9a-f]{6}$/i.test(c)) { ctx.fillStyle = lite(c, 0.25); ctx.fillRect(-w / 2, -h / 2, w, 2); ctx.fillStyle = dark(c, 0.3); ctx.fillRect(-w / 2, h / 2 - 2, w, 2); }
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
};

/** A snore: a Z, inked, floating up and fading (a 0..1). */
export const snore = (ctx: Ctx, x: number, y: number, a: number) => {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = INK; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) ctx.fillText('Z', x + dx, y + dy);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('Z', x, y);
  ctx.restore();
};

/** The rainbow on spilled oil: a stripe w long at (x, y), purple to blue to gold in hard steps, dithered off at its ends. */
export const sheen = (ctx: Ctx, x: number, y: number, w: number, a = 0.85) => {
  const s = Math.max(2, Math.round(w / 3 / 2) * 2), x0 = Math.round(x / 2) * 2, y0 = Math.round(y / 2) * 2;
  ['168, 85, 247', '56, 189, 248', '250, 204, 21'].forEach((c, i) => { ctx.fillStyle = `rgba(${c}, ${a})`; ctx.fillRect(x0 + i * s, y0, s, 2); });
  checker(ctx, x0 - 4, y0, 4, 2, `rgba(168, 85, 247, ${a})`);
  checker(ctx, x0 + s * 3, y0, 4, 2, `rgba(250, 204, 21, ${a})`);
};
