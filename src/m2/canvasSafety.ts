// A safety net under every drawing: the canvas throws (IndexSizeError) on an arc or an ellipse with a radius below
// zero, and one throw partway through a frame takes the rest of the frame with it (the level vanishes, the game goes
// on). A radius that's gone negative (something's art squashed past nothing at some angle or distance) is drawn as
// nothing instead. Installed once, at startup (App.tsx).

let installed = false;
export const installCanvasSafety = () => {
  if (installed || typeof CanvasRenderingContext2D === 'undefined') return;
  installed = true;
  const P = CanvasRenderingContext2D.prototype as CanvasRenderingContext2D & Record<string, unknown>;
  const arc = P.arc, ellipse = P.ellipse;
  P.arc = function (this: CanvasRenderingContext2D, x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean) {
    return arc.call(this, x, y, r > 0 ? r : 0, a0, a1, ccw);
  };
  P.ellipse = function (this: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot: number, a0: number, a1: number, ccw?: boolean) {
    return ellipse.call(this, x, y, rx > 0 ? rx : 0, ry > 0 ? ry : 0, rot, a0, a1, ccw);
  };
  // (the art asks whether the pixel font's in (document.fonts.check) dozens of times a frame, and asking isn't cheap: a
  // font that's in stays in, so once it says yes, that's the answer from then on)
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (fonts?.check) {
    const check = fonts.check.bind(fonts), yes = new Set<string>();
    fonts.check = (font: string, text?: string) => {
      const k = text === undefined ? font : font + '\n' + text;
      if (yes.has(k)) return true;
      const r = check(font, text);
      if (r) yes.add(k);
      return r;
    };
  }
};
