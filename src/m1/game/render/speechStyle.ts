// How words over heads look. In play: just the words (outlined, unobtrusive). In a cutscene, Meathead 2 puts them in
// speech bubbles, Meathead 1's way (the user's: "any speaking that happens in cutscenes should have word bubbles over
// their heads like meathead 1. mid game dialogue should still just show unobstrusive text over their heads"; "aside
// from the intro, if skipping is possible, word bubbles appear"). The game says which frames are a cutscene's (its
// rule, asked each frame: world.ts); Meathead 1 sets none.

import type { GameState } from '../core/state';

/** Which frames get bubbles (Meathead 2's rule), or none. */
let rule: ((state: GameState) => boolean) | null = null;
/** This frame's world is a cutscene's (world.ts, each frame). */
let cutscene = false;
export const setCutsceneBubbles = (r: ((state: GameState) => boolean) | null) => { rule = r; };
export const markCutsceneFrame = (state: GameState) => { cutscene = !!rule?.(state); };
export const bubblesNow = () => cutscene;

/**
 * A speech bubble behind `rows` of centered text: the box round them (white, inked), its tail down to `tipX` (where
 * whoever's talking is), the text's bottom baseline at `y` (rows `lineH` apart, upward). Draws the text too, in ink.
 */
export const drawBubbleRows = (c: CanvasRenderingContext2D, rows: string[], x: number, y: number, tipX: number, lineH: number, font: string) => {
  c.save();
  c.font = font; c.textAlign = 'center'; c.shadowBlur = 0; c.shadowColor = 'transparent';
  const w = Math.max(...rows.map(r => c.measureText(r).width)) + 14, asc = lineH - 3;
  const top = y - (rows.length - 1) * lineH - asc - 5, h = (rows.length - 1) * lineH + asc + 11;
  const L = Math.round(x - w / 2), T = Math.round(top), tx = Math.max(L + 8, Math.min(L + w - 8, tipX)), B = T + h;
  c.fillStyle = '#F8FAFC'; c.strokeStyle = '#111827'; c.lineWidth = 2;
  c.fillRect(L, T, Math.round(w), h); c.strokeRect(L, T, Math.round(w), h);
  c.beginPath(); c.moveTo(tx - 5, B - 1); c.lineTo(tx + 5, B - 1); c.lineTo(tx, B + 7); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(tx - 5, B); c.lineTo(tx, B + 7); c.lineTo(tx + 5, B); c.stroke();
  c.fillStyle = '#111827';
  rows.forEach((r, i) => c.fillText(r, x, y - (rows.length - 1 - i) * lineH));
  c.restore();
};
