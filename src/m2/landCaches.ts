// The art a land keeps for itself (painted-once canvases, a ride's textures), let go once he's left it: otherwise
// every land he'd been to would still be holding its own on top of the one he's in (a long session on a low-memory PC).
// Each land registers what goes for its stage; App.tsx calls landLeft as one stage gives way to the next. Coming back,
// it's painted again as it was the first time in (lazily, or ahead in idle moments where it was before).

const clears = new Map<string, (() => void)[]>();

/** `fn` lets go of art that's only wanted on `stage` (its id), whenever he leaves it. */
export const onLandLeft = (stage: string, fn: () => void) => {
  const list = clears.get(stage);
  if (list) list.push(fn); else clears.set(stage, [fn]);
};

/** Leaving `from` for `to`: what `from` registered goes (nothing when it's the same stage again: a restart). */
export const landLeft = (from: string | null | undefined, to: string) => {
  if (!from || from === to) return;
  for (const fn of clears.get(from) ?? []) {
    try { fn(); } catch (err) { console.error('landLeft', from, err); }
  }
};
