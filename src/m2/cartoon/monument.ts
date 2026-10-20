// THE CARTOON LAND WATER TOWER: the land's monument, standing on the far hills behind every outdoor section, bigger in
// each (it's the park's landmark, the way the studios' water towers are: this one's the park's own: a fat pink tank on
// four bandy legs, a goofy face painted on it (big googly eyes, a buck-toothed grin), CARTOON LAND lettered round its
// belly, a propeller beanie for a roof with its propeller turning). Within a section it drifts slowly across the sky
// as he goes, so it's always there. One painter (drawTowerAt), painted once per hour and size (a stamp); the propeller
// is live.
//
// Shared file (see OWNERSHIP.md).

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { stamp } from '../../m1/game/render/stamp';
import { timeOfDay, farTint } from '../timeOfDay';
import { signText, type Look } from '../signLetters';
import type { CartoonId } from './geometry';
import { SECTIONS } from './geometry';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A1028';

/** Where it stands in a section's sky: its size, and where it is on screen at the section's start and end. */
export interface MonumentAt { k: number; x0: number; x1: number; foot: number; id: CartoonId }
const at = (id: CartoonId, k: number, x0: number, x1: number, foot = 404): MonumentAt => ({ id, k, x0, x1, foot });
/** Per section (null: indoors, no sky). */
export const MONUMENT_AT: Record<CartoonId, MonumentAt | null> = {
  kiddie: at('kiddie', 0.42, 620, 160),
  studio: null,
  whitehouse1: null,
  whitehouse2: null,
  bigkid: at('bigkid', 0.7, 640, 180, 410),
  itchy: at('itchy', 0.95, 620, 220, 416),
  amphi: at('amphi', 1.3, 560, 360, 430),
};

const LETTERS: Look = { sx: 1, sy: 1, bold: true, fill: ['#FFFFFF', '#FFF7C2', '#FDE047', '#FDE047'], ink: INK };

/** The tower at scale k, its feet at (x, y) (screen or world), the propeller at turn t. */
export const drawTowerAt = (c: Ctx, x: number, y: number, k: number, t: number) => {
  const tod = timeOfDay(), T = (col: string) => farTint(col, 0.5, tod);
  const W = 120, H = 230;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k);
  stamp(c, `ct-tower-${tod.key}`, -W / 2 - 20, -H - 30, W + 40, H + 34, g => {
    // (the legs: four bandy curls, cross-braced with a wiggle)
    g.lineCap = 'round';
    for (const [lx, bow] of [[-44, -16], [-16, -6], [16, 6], [44, 16]] as [number, number][]) {
      g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.moveTo(lx * 0.75, -120); g.quadraticCurveTo(lx + bow, -60, lx, 0); g.stroke();
      g.strokeStyle = T('#A78BFA'); g.lineWidth = 5; g.stroke();
    }
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-46, -50); g.bezierCurveTo(-20, -40, 20, -60, 46, -50); g.stroke();
    g.strokeStyle = T('#C4B5FD'); g.lineWidth = 2; g.stroke();
    // (the balcony rail round the tank's foot)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -122, 62, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = T('#7C3AED'); g.beginPath(); g.ellipse(0, -123, 59, 8, 0, 0, Math.PI * 2); g.fill();
    // (the tank: a fat barrel, bulging; pink, lit down the left, shaded right)
    const tank = () => { g.moveTo(-50, -126); g.quadraticCurveTo(-62, -170, -50, -214); g.quadraticCurveTo(0, -226, 50, -214); g.quadraticCurveTo(62, -170, 50, -126); g.quadraticCurveTo(0, -116, -50, -126); g.closePath(); };
    g.beginPath(); tank(); g.fillStyle = T('#F472B6'); g.fill();
    g.save(); g.beginPath(); tank(); g.clip();
    g.fillStyle = T('#F9A8D4'); g.fillRect(-60, -230, 26, 120);
    g.fillStyle = T('#DB2777'); g.fillRect(30, -230, 40, 120);
    g.fillStyle = T('#BE185D'); g.fillRect(44, -230, 30, 120);
    // (its band of lettering)
    g.fillStyle = T('#7C3AED'); g.fillRect(-70, -150, 140, 16);
    g.restore();
    g.beginPath(); tank(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    signText(g, 'CARTOON LAND', 0, -138, LETTERS);
    // (the face: googly eyes, the buck-toothed grin)
    for (const ex of [-18, 18]) {
      g.fillStyle = INK; g.beginPath(); g.ellipse(ex, -186, 14, 17, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(ex, -186, 11.5, 14.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(ex + 3, -182, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillRect(ex + 4, -186, 3, 3);
    }
    g.fillStyle = INK; g.beginPath(); g.moveTo(-26, -166); g.quadraticCurveTo(0, -150, 26, -166); g.quadraticCurveTo(0, -158, -26, -166); g.fill();
    g.fillStyle = '#FFFFFF'; g.fillRect(-7, -161, 6, 8); g.fillRect(1, -161, 6, 8);
    g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(-7, -161, 6, 8); g.strokeRect(1, -161, 6, 8);
    // (the beanie: a striped dome, a button on top)
    const dome = () => { g.moveTo(-52, -212); g.quadraticCurveTo(-50, -252, 0, -256); g.quadraticCurveTo(50, -252, 52, -212); g.quadraticCurveTo(0, -222, -52, -212); g.closePath(); };
    g.save(); g.beginPath(); dome(); g.clip();
    const cols = [T('#EF4444'), T('#FDE047'), T('#3B82F6'), T('#22C55E')];
    for (let s = 0; s < 4; s++) { g.fillStyle = cols[s]; g.beginPath(); g.moveTo(0, -260); g.lineTo(-60 + s * 30, -205); g.lineTo(-30 + s * 30, -205); g.closePath(); g.fill(); }
    g.restore();
    g.beginPath(); dome(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    g.fillStyle = INK; g.fillRect(-3, -268, 6, 14);
  });
  // (the propeller, turning)
  const sp = Math.cos(t * 0.15) * 30;
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, -268, Math.abs(sp) + 3, 5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#FDE047', 0.5, tod); c.beginPath(); c.ellipse(0, -268, Math.abs(sp) + 1, 3, 0, 0, Math.PI * 2); c.fill();
  c.restore();
};

/** Screen space: the tower in a section's sky, at its size, drifting across as he goes through the section. */
export const drawMonument = (c: Ctx, state: GameState, m: MonumentAt) => {
  const { x0, x1 } = SECTIONS[m.id];
  const p = Math.max(0, Math.min(1, (state.camera.x + CANVAS_WIDTH / 2 - x0) / (x1 - x0)));
  drawTowerAt(c, m.x0 + (m.x1 - m.x0) * p, m.foot, m.k, state.frame);
};
