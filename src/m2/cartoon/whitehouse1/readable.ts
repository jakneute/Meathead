// Words on things that get turned round (the user: "any objects that says 'mean men' on it can be mirrored when facing a
// certain way. make sure the words are never mirrored"): whatever's drawn inside `readable` reads the right way round on
// screen, however the sprite it's on is flipped (the engine's facing, a scale(-1, 1)) or spun (a thrown mic): mirrored,
// it's flipped back about (cx, cy); upside down (spun past a quarter turn), it's turned the right way up there.

type Ctx = CanvasRenderingContext2D;

/** Draws `draw` (words, centered about (cx, cy)) so it's never mirrored or upside down on screen. Live drawing only (a
 *  stamp's canvas doesn't know how it'll be put down: draw the words after the stamp). */
export const readable = (c: Ctx, cx: number, cy: number, draw: () => void) => {
  const m = c.getTransform();
  c.save();
  c.translate(cx, cy);
  if (m.a * m.d - m.b * m.c < 0) c.scale(-1, 1);
  // (its baseline running leftward on screen: upside down; turned round)
  if (c.getTransform().a < -1e-6) c.rotate(Math.PI);
  c.translate(-cx, -cy);
  draw();
  c.restore();
};
