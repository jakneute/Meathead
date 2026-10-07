// The look everybody and everything Meathead comes across is drawn in (the townsfolk, the wildlife): an ink line round
// every part, each part's colour in steps (lit from the upper left, shadowed lower right), stepped highlights; no
// smooth gradients. Small helpers, so whatever's drawn with them comes out of a piece with the rest.

import { mix } from '../backdrops/core';

type Ctx = CanvasRenderingContext2D;

/** The ink line's colour. */
export const INK = '#1A0B06';

/** A colour darker (k toward the ink) or lighter (k toward white). */
export const dark = (c: string, k = 0.28) => mix(c, INK, k);
export const lite = (c: string, k = 0.25) => mix(c, '#FFFFFF', k);

/** A fill with its ink line round it (`path` draws the shape). */
export const ink = (ctx: Ctx, path: () => void, fill: string, line = 1) => {
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.lineJoin = 'round'; ctx.stroke();
};

/**
 * A shaded part: clipped to `path`, the colour in steps over its box (x, y, w, h): a lit band down the left, the
 * shadow down the right and along the bottom; then its ink line.
 */
export const shaded = (ctx: Ctx, path: () => void, color: string, x: number, y: number, w: number, h: number, line = 1) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(color, 0.22); ctx.fillRect(x, y, w * 0.32, h);
  ctx.fillStyle = dark(color, 0.22); ctx.fillRect(x + w * 0.72, y, w * 0.28, h);
  ctx.fillStyle = dark(color, 0.12); ctx.fillRect(x, y + h * 0.82, w, h * 0.18);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.lineJoin = 'round'; ctx.stroke();
};

/** A shaded part lit from above instead (a back, a shell): the top lit, the belly dark. */
export const shadedTop = (ctx: Ctx, path: () => void, color: string, x: number, y: number, w: number, h: number, line = 1) => {
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = lite(color, 0.24); ctx.fillRect(x, y, w, h * 0.3);
  ctx.fillStyle = dark(color, 0.24); ctx.fillRect(x, y + h * 0.7, w, h * 0.3);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.lineJoin = 'round'; ctx.stroke();
};

/** An eye: the white, the pupil looking (dx, dy), a glint; r its size. */
export const eye = (ctx: Ctx, x: number, y: number, r: number, dx = 0.3, dy = 0, white = '#FFFFFF') => {
  ink(ctx, () => ctx.arc(x, y, r, 0, Math.PI * 2), white, Math.max(0.6, r * 0.3));
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + dx * r * 0.45, y + dy * r * 0.45, r * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + dx * r * 0.45 - r * 0.35, y + dy * r * 0.45 - r * 0.4, Math.max(1, r * 0.3), Math.max(1, r * 0.3));
};

/** A limb as a thick inked stroke from (x1, y1) to (x2, y2), w wide. */
export const limb = (ctx: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, color: string) => {
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.lineCap = 'butt';
};
