// The way in, drawn (intro/index.ts): the parking garage, the hallway and its moving walkways, the security checkpoint,
// America USA (every American city you've heard of, as a street of tacky shops and restaurants under more flags than
// anywhere has ever needed), and the ticket plaza and the gate. Flat bands of color, stepped, SNES-ish. Nothing back
// here looks like something to stand on: awnings and ledges are dimmed (there's nothing to stand on but the floor).

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CLEAR_X, HUD_CLEAR_Y } from '../../m1/constants';
import { X0, R, STAIRS_END, USA_START, GARAGE_END, USA_END, END_X, WINDOW_X, UPPER, CHECK_END } from './geometry';
import { type Ctx, INK, WHITE, RED, box, text, bendFloor } from './art/kit';
import { drawIntroBackdrop } from './art/sky';
import { garage, deck, drawUpperFloor, truckDoorFront } from './art/upper';
import { america, drawAmericaFloor, gateFront } from './art/america';
import { plaza, drawPlazaFloor } from './art/plaza';

import { drawPunchCam } from './punchCam';
import { SKIP_AFTER, drawSkipPrompt } from '../../m1/game/platform/skip';

export { drawIntroBackdrop };

/** Him panicking: sweat flying off his head, a pair of !! over it. */
const panic = (c: Ctx, state: GameState) => {
  const p = state.player, x = p.pos.x + p.width / 2, y = p.pos.y - 6, f = state.frame;
  for (let k = 0; k < 6; k++) {
    const t = ((f + k * 9) % 36) / 36, s = k % 2 ? 1 : -1, a = 0.5 + (k % 3) * 0.35;
    const dx = x + s * (10 + t * 26 * a), dy = y + 8 - t * 22 + t * t * 34;
    box(c, dx - 1, dy - 2, 3, 4, INK); box(c, dx, dy - 2, 2, 3, '#BFDBFE'); box(c, dx, dy - 2, 1, 1, '#FFFFFF');
  }
  if ((f >> 3) % 2) text(c, '!!', x + 2, y - 18, '#FDE047', 12);
};
import { getIntro, guests, truckNow } from './index';


export const drawIntroBack = (c: Ctx, state: GameState) => {
  const f = state.frame;
  const intro = getIntro(state);
  const cam = state.camera.x;
  const vis = (a: number, b: number) => b > cam - 100 && a < cam + CANVAS_WIDTH + 100;
  if (vis(R(GARAGE_END), R(STAIRS_END))) deck(c, f, intro?.office.open ?? 0, intro?.alarm ?? 0, intro?.cool ?? 0, vis, { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 });
  if (vis(X0 - 400, R(GARAGE_END))) garage(c, vis, truckNow(intro, f));
  const eye = { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 };
  if (vis(R(USA_START) - 600, R(USA_END))) america(c, f, vis, eye);
  if (vis(R(USA_END) - 200, R(END_X) + 400)) plaza(c, state, f, eye);
  // The floors: the garage level's slab (its edge showing, the drop under it), the stairs down, brick in America USA,
  drawUpperFloor(c, f);
  if (vis(R(STAIRS_END), R(USA_END))) drawAmericaFloor(c);
  drawPlazaFloor(c);
  // (and the ground in perspective: the top of the deck's slab, the street and the plaza fanning out toward him)
  if (vis(X0 - 400, R(CHECK_END))) bendFloor(c, eye, UPPER, UPPER, UPPER + 34, -Infinity, R(CHECK_END));
  if (vis(R(STAIRS_END), R(END_X) + 400)) bendFloor(c, eye, GROUND_Y, GROUND_Y, GROUND_Y + 160, R(STAIRS_END), Infinity);
};

// ---------------------------------------------------------------------------------------------------------------
// In front: who's saying what (over their heads, only while it's said), the PA

const said = (c: Ctx, s: string, x: number, y: number, col = WHITE, wide = 220) => {
  c.font = '7px "Press Start 2P"';
  const words = s.split(' '), lines: string[] = [];
  let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (c.measureText(t).width > wide && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  lines.forEach((l, i) => text(c, l, x, y - (lines.length - 1 - i) * 11, col, 7));
};

export const drawIntroFront = (c: Ctx, state: GameState) => {
  const intro = getIntro(state);
  if (!intro) return;
  // (the gate in at the foot of the stairs: its front column and what's over the top, in front of him)
  if (Math.abs(state.camera.x + CANVAS_WIDTH / 2 - R(USA_START)) < 1400) gateFront(c, { x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 }, state.frame);
  // (naked at the window: him panicking (sweat flying off him), then the punch, up close)
  const sc = intro.scene;
  // (him climbing out of the truck's window: its door in front of his legs; and SKIP >> while it's on)
  if (intro.arrival?.waiting) { c.save(); c.translate(state.camera.x, state.camera.y); c.fillStyle = 'rgba(0, 0, 0, 0.55)'; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); if ((state.frame >> 5) % 2 === 0) text(c, 'PRESS ANY BUTTON', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, '#FDE047', 12); c.restore(); }
  else if (intro.arrival) {
    const tr = truckNow(intro, state.frame);
    if (tr.emerging) truckDoorFront(c, tr);
    if (intro.arrival.t > SKIP_AFTER) { c.save(); c.translate(state.camera.x, state.camera.y); drawSkipPrompt(c, CANVAS_WIDTH); c.restore(); }
  }
  if (sc?.kind === 'nude' && sc.pip < 0) panic(c, state);
  if (sc && sc.pip >= 0) drawPunchCam(c, state.camera.x, state.camera.y, sc.pip);
  if (intro.lady.said?.text) said(c, intro.lady.said.text, R(WINDOW_X) - 10, GROUND_Y - 220, '#FDE047');
  if (intro.bark?.said.text) { const e = intro.bark.e; said(c, intro.bark.said.text, e.pos.x + e.width / 2, e.pos.y - 26, '#93C5FD'); }
  // (the people in line: whatever they're saying, over their heads)
  for (const e of state.enemies) { const g = guests.get(e); if (g?.line && !e.isBlownAway && e.health > 0) said(c, g.line, e.pos.x + e.width / 2, e.pos.y - 26, '#FEF3C7'); }
  if (intro.pa.said?.text) {
    // (the PA: a banner across the top, clear of the HUD's corner)
    const left = state.camera.x + HUD_CLEAR_X, w = CANVAS_WIDTH - HUD_CLEAR_X - 12, y = state.camera.y + HUD_CLEAR_Y + 8;
    c.fillStyle = 'rgba(30, 58, 138, 0.88)'; c.fillRect(left, y, w, 52);
    box(c, left, y, w, 3, RED); box(c, left, y + 49, w, 3, RED);
    said(c, `PA: ${intro.pa.said.text}`, left + w / 2, y + 40, WHITE, w - 20);
  }
  void CANVAS_HEIGHT;
};
