// Skipping a cutscene, the same way everywhere (the menu cutscenes, the weapon screen, the deploy, and the ones in the
// stages): once it's had a moment, SKIP >> comes up in the top-right corner, and a fresh press of Start (Esc on the
// keyboard) skips it; so does clicking the prompt, where there's one to click.
//
// A cutscene in a stage offers the skip every frame it can be skipped (offerSkip), and takes it (takeSkip) when it's
// been asked for; the menus ask for it (requestSkip) off Start / Esc, in place of pausing, while one's on offer.

/** How long a cutscene runs before it can be skipped (frames, and the same in milliseconds). */
export const SKIP_AFTER = 30;
export const SKIP_AFTER_MS = 500;
export const SKIP_LABEL = 'SKIP >>';

let offeredAt = -Infinity;
let requested = false;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
/** (an offer only stands while the stage keeps making it: a frame or two) */
const live = () => now() - offeredAt < 120;

/** A stage cutscene that can be skipped right now (called every frame it can). */
export const offerSkip = () => { offeredAt = now(); };
/** Is there a cutscene in a stage that can be skipped? (Start / Esc skips it instead of pausing.) */
export const canSkip = () => live();
/** Start / Esc, while one's on offer. */
export const requestSkip = () => { if (live()) requested = true; };
/** Has the skip been asked for? (Once: it's used up.) */
export const takeSkip = () => { const r = requested && live(); requested = false; return r; };

/** The prompt, drawn on the game canvas: top right, small, the same as the menus' one. */
export const drawSkipPrompt = (ctx: CanvasRenderingContext2D, width: number) => {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'right';
  ctx.fillText(SKIP_LABEL, width - 24, 80);
  ctx.restore();
};
