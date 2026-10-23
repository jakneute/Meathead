// What of the world's in view on a canvas, from the transform it's drawn with: for skipping what's nowhere near it (a
// room full of gore off the screen). Only a plain scale-and-shift counts; turned or skewed, everything's "in view".

export interface ViewRect { x0: number; y0: number; x1: number; y1: number }

/** The world box the canvas shows right now, `pad` bigger all round; null if it can't be told (a turned transform). */
export const viewRectOf = (ctx: CanvasRenderingContext2D, pad: number): ViewRect | null => {
  if (typeof ctx.getTransform !== 'function' || !ctx.canvas) return null;
  const m = ctx.getTransform();
  if (Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6 || m.a <= 0 || m.d <= 0) return null;
  const x0 = -m.e / m.a, y0 = -m.f / m.d;
  return { x0: x0 - pad, y0: y0 - pad, x1: x0 + ctx.canvas.width / m.a + pad, y1: y0 + ctx.canvas.height / m.d + pad };
};

export const inView = (v: ViewRect | null, x: number, y: number) => !v || (x >= v.x0 && x <= v.x1 && y >= v.y0 && y <= v.y1);
