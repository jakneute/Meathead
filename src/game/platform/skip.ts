// Skipping a cutscene, the same way everywhere (the menu cutscenes, the weapon screen, the deploy, and the ones in the
// stages): once it's had a moment, SKIP >> comes up in the top-right corner, and a fresh press of Start (Esc on the
// keyboard) skips it; so does clicking the prompt, where there's one to click.
//
// A cutscene in a stage offers the skip every frame it can be skipped (offerSkip), and takes it (takeSkip) when it's
// been asked for; the menus ask for it (requestSkip) off Start / Esc, in place of pausing, while one's on offer.

import { inputDevice, padFamily, padIs360 } from './device';

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
  // (and the button that does it, on whatever's in use: Start on a controller, Esc on the keyboard)
  const pad = inputDevice() === 'pad';
  // (an Xbox's is drawn as the button it is: the newer pads' round Menu button with its three lines, a 360's round
  // silver START with the arrow on it)
  if (pad && padFamily() === 'xbox') {
    const r = 7, cx = width - 24 - ctx.measureText(SKIP_LABEL).width - 8 - r, cy = 77;
    const is360 = padIs360();
    ctx.fillStyle = is360 ? '#D4D4D8' : '#27272A'; ctx.strokeStyle = '#0B0B0F'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (is360) { ctx.fillStyle = '#3F3F46'; ctx.beginPath(); ctx.moveTo(cx - 2.5, cy - 3.5); ctx.lineTo(cx + 3.5, cy); ctx.lineTo(cx - 2.5, cy + 3.5); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = '#E4E4E7'; for (const dy of [-3, 0, 3]) ctx.fillRect(Math.round(cx - 4), Math.round(cy + dy - 0.5), 8, 1.5); }
    ctx.restore();
    return;
  }
  const label = pad ? ({ xbox: 'START', playstation: 'OPTIONS', switch: '+', 'joycon-l': '−', 'joycon-r': '+' } as const)[padFamily()] : 'ESC', w = pad ? Math.max(18, label.length * 6 + 8) : 26, x = width - 24 - ctx.measureText(SKIP_LABEL).width - 8 - w, y = 71;
  ctx.fillStyle = pad ? '#27272A' : '#E4E4E7';
  ctx.beginPath(); ctx.roundRect(x, y, w, 12, pad ? 6 : 2); ctx.fill();
  ctx.strokeStyle = pad ? '#0B0B0F' : '#52525B'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = pad ? '#E4E4E7' : '#18181B'; ctx.font = '6px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 9);
  ctx.restore();
};
