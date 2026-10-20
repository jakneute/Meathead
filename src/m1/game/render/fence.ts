// A stage's (or a section's) draw hook, fenced in: its canvas state (a save() it never restored, a transform, an alpha,
// a clip) goes when it's done, so one unbalanced save in some drawing can't throw everything after it off screen (the
// Tragons' blank void was one). In dev, a hook that leaves the transform changed says so in the console, once.

/** Hooks already warned about (dev): said once per hook, not every frame. */
const warned = new Set<string>();

/** Runs `fn` between a save() and a restore() of `c`. `name` (and `part`, joined on only to warn) names it in dev. */
export const fenced = <R>(c: CanvasRenderingContext2D, name: string, fn: () => R, part?: string): R => {
  c.save();
  const before = import.meta.env.DEV ? c.getTransform() : null;
  try { return fn(); } finally {
    if (before) {
      const t = c.getTransform();
      if (t.a !== before.a || t.b !== before.b || t.c !== before.c || t.d !== before.d || t.e !== before.e || t.f !== before.f) {
        const who = part ? `${name}.${part}` : name;
        if (!warned.has(who)) {
          warned.add(who);
          console.warn(`[draw] ${who} left the canvas transform changed (an unbalanced save()/restore(), or a translate left on?)`);
        }
      }
    }
    c.restore();
  }
};
