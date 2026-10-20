// THE CARTOON LAND WATER TOWER: the land's monument, standing on the far hills behind every outdoor section, bigger in
// each (it's the park's landmark, the way the studios' water towers are: this one's the park's own: a fat pink tank on
// four bandy legs, a goofy face painted on it (big googly eyes, a buck-toothed grin), CARTOON LAND lettered round its
// belly, a propeller beanie for a roof with its propeller turning). Within a section it drifts slowly across the sky
// as he goes, so it's always there. One painter (drawTowerAt), painted once per hour and size (a stamp); the propeller
// and the beacon on its hub are live.
//
// Peak SNES: the tank's riveted plates banded lit to shade across its barrel (dithered where the steps meet), the
// lettering band in purple with a gilt rim, the eyes glossy, the cheeks blushed in a dither, the teeth and the tongue;
// the legs bandy lilac tubes stepped across with their rivet collars, X-bracing with turnbuckles, a ladder up one leg
// to the catwalk and its railing; the beanie's gores each in their own ramp, its brim band, its button. After dark the
// floodlights wash its belly and the beacon blinks.
//
// Shared file (see OWNERSHIP.md).

import type { GameState } from '../../m1/game/core/state';
import { CANVAS_WIDTH } from '../../m1/constants';
import { mix } from '../../m1/game/render/backdrops/core';
import { checker } from '../../m1/game/render/pixelArt';
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

const LETTERS: Look = { sx: 1, sy: 1, bold: true, fill: ['#FFFFFF', '#FFF7C2', '#FDE047', '#F2B32A'], dither: true, ink: INK, shadow: '#2A0E3A' };
const ramp = (col: string) => [mix(col, INK, 0.62), mix(col, INK, 0.36), mix(col, INK, 0.14), col, mix(col, '#FFFFFF', 0.3), mix(col, '#FFFFFF', 0.6)];
const px = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** A bandy leg (a tube from (x0, y0) to (x1, y1), bowed by `bow`), stepped across: ink, the shade side, itself, lit. */
const leg = (g: Ctx, x0: number, y0: number, x1: number, y1: number, bow: number, w: number, R: string[]) => {
  const path = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + bow, (y0 + y1) / 2, x1, y1); };
  g.lineCap = 'round';
  path(); g.strokeStyle = INK; g.lineWidth = w + 3; g.stroke();
  path(); g.strokeStyle = R[2]; g.lineWidth = w; g.stroke();
  g.save(); g.translate(-w * 0.18, 0); path(); g.strokeStyle = R[3]; g.lineWidth = w * 0.55; g.stroke(); g.restore();
  g.save(); g.translate(-w * 0.3, 0); path(); g.strokeStyle = R[5]; g.lineWidth = Math.max(1, w * 0.16); g.stroke(); g.restore();
  g.save(); g.translate(w * 0.34, 0); path(); g.strokeStyle = R[1]; g.lineWidth = Math.max(1, w * 0.2); g.stroke(); g.restore();
  // (rivet collars along it)
  for (let t = 0.2; t < 0.95; t += 0.25) {
    const u = 1 - t, qx = u * u * x0 + 2 * u * t * ((x0 + x1) / 2 + bow) + t * t * x1, qy = u * u * y0 + 2 * u * t * ((y0 + y1) / 2) + t * t * y1;
    px(g, qx - w / 2 - 1, qy - 1, w + 2, 3, INK); px(g, qx - w / 2, qy - 1, w, 1, R[4]); px(g, qx - w / 2, qy, w, 1, R[1]);
  }
};

/** The tower at scale k, its feet at (x, y) (screen or world), the propeller at turn t. */
export const drawTowerAt = (c: Ctx, x: number, y: number, k: number, t: number) => {
  const tod = timeOfDay(), T = (col: string) => farTint(col, 0.5, tod), night = tod.lamps > 0.35;
  const W = 120, H = 230;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(k, k);
  stamp(c, `ct-tower2-${tod.key}-${night ? 1 : 0}`, -W / 2 - 24, -H - 44, W + 48, H + 48, g => {
    const Lg = ramp(T('#A78BFA')), Pk = ramp(T('#F472B6')), Pu = ramp(T('#7C3AED')), Au = ramp(T('#F2C84A')), Wh = ramp(T('#F8F0F6'));
    // (the footings: four little concrete pads, a shadow on the hill between them)
    g.fillStyle = mix(T('#3A6A3A'), INK, 0.2); g.beginPath(); g.ellipse(0, 2, 62, 6, 0, 0, Math.PI * 2); g.fill();
    for (const lx of [-44, -16, 16, 44]) { px(g, lx - 7, -4, 14, 6, INK); px(g, lx - 6, -3, 12, 4, T('#C8C0D0')); px(g, lx - 6, -3, 12, 1, T('#ECE6F2')); }
    // (the legs: the two at the back first, darker; X-bracing with a turnbuckle; the two at the front)
    for (const [lx, bow] of [[-16, -6], [16, 6]] as [number, number][]) leg(g, lx * 0.75, -120, lx, -2, bow, 6, Lg.map(cc => mix(cc, INK, 0.18)));
    for (const [ya, yb] of [[-112, -64], [-60, -10]] as [number, number][]) {
      for (const s of [-1, 1]) {
        g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(s * -38, ya); g.lineTo(s * 40, yb); g.stroke();
        g.strokeStyle = Lg[2]; g.lineWidth = 1.6; g.stroke();
      }
      px(g, -4, (ya + yb) / 2 - 3, 8, 6, INK); px(g, -3, (ya + yb) / 2 - 2, 6, 4, Au[3]); px(g, -3, (ya + yb) / 2 - 2, 2, 1, Au[5]);
    }
    // (the wiggly girth ring round the legs)
    g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-46, -50); g.bezierCurveTo(-20, -40, 20, -60, 46, -50); g.stroke();
    g.strokeStyle = Lg[3]; g.lineWidth = 2.5; g.stroke();
    g.strokeStyle = Lg[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-45, -51); g.bezierCurveTo(-20, -41, 20, -61, 45, -51); g.stroke();
    for (const [lx, bow] of [[-44, -16], [44, 16]] as [number, number][]) leg(g, lx * 0.75, -120, lx, -2, bow, 9, Lg);
    // (the ladder up the front left leg to the catwalk)
    for (const s of [0, 8]) { g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(-28 + s, -122); g.lineTo(-36 + s, -6); g.stroke(); }
    for (let yy = -116; yy < -8; yy += 7) { const u = (yy + 122) / 116; px(g, -28 - u * 8, yy, 9, 1, INK); px(g, -27 - u * 8, yy - 1, 7, 1, Lg[4]); }
    // (the catwalk round the tank's foot: its deck ring, the rail on posts)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -121, 64, 11, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pu[2]; g.beginPath(); g.ellipse(0, -122, 61, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Pu[3]; g.beginPath(); g.ellipse(0, -124, 59, 6, 0, Math.PI, 0); g.fill();
    g.fillStyle = Pu[4]; g.beginPath(); g.ellipse(-8, -125, 40, 3, 0, Math.PI, 0); g.fill();
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12), rx = Math.cos(a) * 60, ry = -122 + Math.sin(a) * 9; px(g, rx - 1, ry - 14, 2, 14, INK); px(g, rx - 0.5, ry - 13, 1, 12, Pu[4]); }
    g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, -136, 61, 9, 0, 0.05, Math.PI - 0.05); g.stroke();
    g.strokeStyle = Pu[4]; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -136.5, 61, 9, 0, 0.05, Math.PI - 0.05); g.stroke();
    // (the tank: a fat barrel, bulging; banded across, lit down the left, shaded right, dithered seams)
    const tank = () => { g.moveTo(-50, -126); g.quadraticCurveTo(-62, -170, -50, -214); g.quadraticCurveTo(0, -226, 50, -214); g.quadraticCurveTo(62, -170, 50, -126); g.quadraticCurveTo(0, -116, -50, -126); g.closePath(); };
    g.save(); g.beginPath(); tank(); g.clip();
    const cols: [number, number, string][] = [[-64, -36, Pk[4]], [-36, 6, Pk[3]], [6, 26, Pk[2]], [26, 44, Pk[1]], [44, 64, Pk[0]]];
    for (const [a, b, col] of cols) if (b > a) px(g, a, -232, b - a, 124, col);
    px(g, -46, -232, 5, 124, Pk[5]);
    for (const xx of [-36, 6, 26, 44]) checker(g, xx - 2, -232, 2, 124, cols.find(cc => cc[0] === xx)?.[2] ?? Pk[2], 0, 1);
    // (its plates: seams round the barrel, rivets along them)
    for (const sy of [-196, -158]) { g.strokeStyle = Pk[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(-64, sy); g.quadraticCurveTo(0, sy + 8, 64, sy); g.stroke(); for (let rx = -52; rx <= 52; rx += 8) px(g, rx, sy + 1 + (1 - (rx / 52) ** 2) * 3.5, 1, 1, rx < -10 ? Pk[5] : Pk[1]); }
    for (const sx of [-30, 0, 30]) { g.strokeStyle = mix(Pk[2], INK, 0.15); g.lineWidth = 1; g.beginPath(); g.moveTo(sx, -230); g.lineTo(sx * 1.08, -118); g.stroke(); }
    // (the floodlights' wash on its belly after dark)
    if (night) { g.fillStyle = 'rgba(255,236,200,0.22)'; g.beginPath(); g.ellipse(-4, -150, 46, 36, 0, 0, Math.PI * 2); g.fill(); checker(g, -50, -190, 100, 80, 'rgba(255,236,200,0.18)', 0, 1); }
    // (its band of lettering: purple, a gilt rim top and bottom)
    const band = (y0: number) => { g.beginPath(); g.moveTo(-70, y0); g.quadraticCurveTo(0, y0 + 8, 70, y0); g.lineTo(70, y0 + 16); g.quadraticCurveTo(0, y0 + 24, -70, y0 + 16); g.closePath(); };
    g.fillStyle = Pu[3]; band(-152); g.fill();
    g.save(); band(-152); g.clip(); px(g, -70, -152, 40, 30, Pu[4]); px(g, 24, -152, 50, 30, Pu[2]); px(g, 44, -152, 30, 30, Pu[1]); checker(g, 22, -152, 2, 30, Pu[2], 0, 1); g.restore();
    for (const yy of [-152, -136]) { g.strokeStyle = Au[3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-70, yy); g.quadraticCurveTo(0, yy + 8, 70, yy); g.stroke(); }
    g.restore();
    g.beginPath(); tank(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    signText(g, 'CARTOON LAND', 0, -138, LETTERS);
    // (the face: googly eyes (glossy, the whites stepped, big pupils), blushed cheeks, the buck-toothed grin, a tongue)
    for (const ex of [-18, 18]) {
      g.fillStyle = INK; g.beginPath(); g.ellipse(ex, -186, 14.5, 17.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = Wh[2]; g.beginPath(); g.ellipse(ex, -186, 12, 15, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = Wh[4]; g.beginPath(); g.ellipse(ex - 1.5, -188, 10, 12.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = Wh[5]; g.beginPath(); g.ellipse(ex - 4, -192, 4, 5, -0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = INK; g.beginPath(); g.arc(ex + 3, -182, 6.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3A2A5A'; g.beginPath(); g.arc(ex + 2, -183, 3.5, 0, Math.PI * 2); g.fill();
      px(g, ex + 3, -187, 3, 3, '#FFFFFF'); px(g, ex + 6, -181, 1, 1, '#FFFFFF');
      g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(ex, -186, 17, -2.4, -0.7); g.stroke();
    }
    for (const cx of [-34, 34]) { g.fillStyle = 'rgba(255,120,150,0.55)'; g.beginPath(); g.ellipse(cx, -168, 8, 4, 0, 0, Math.PI * 2); g.fill(); checker(g, cx - 10, -172, 20, 8, 'rgba(255,90,130,0.35)', 0, 1); }
    g.fillStyle = INK; g.beginPath(); g.moveTo(-27, -167); g.quadraticCurveTo(0, -148, 27, -167); g.quadraticCurveTo(0, -157, -27, -167); g.fill();
    g.fillStyle = T('#7A1030'); g.beginPath(); g.moveTo(-22, -164); g.quadraticCurveTo(0, -152, 22, -164); g.quadraticCurveTo(0, -158, -22, -164); g.fill();
    g.fillStyle = T('#E8587A'); g.beginPath(); g.ellipse(4, -156, 7, 3, 0, Math.PI, 0); g.fill();
    for (const tx of [-7, 1]) { px(g, tx - 1, -162, 8, 10, INK); px(g, tx, -161, 6, 8, Wh[4]); px(g, tx, -161, 2, 8, Wh[5]); px(g, tx + 4, -155, 2, 2, Wh[2]); }
    // (the beanie: four gores, each stepped across, a brim band, the button and the propeller's stem)
    const dome = () => { g.moveTo(-52, -212); g.quadraticCurveTo(-50, -252, 0, -256); g.quadraticCurveTo(50, -252, 52, -212); g.quadraticCurveTo(0, -222, -52, -212); g.closePath(); };
    g.save(); g.beginPath(); dome(); g.clip();
    const gores = [ramp(T('#EF4444')), ramp(T('#FDE047')), ramp(T('#3B82F6')), ramp(T('#22C55E'))];
    for (let s = 0; s < 4; s++) {
      const R = gores[s], x0 = -60 + s * 30, x1 = -30 + s * 30;
      g.fillStyle = R[s < 2 ? 4 - s : 3 - (s - 2)]; g.beginPath(); g.moveTo(0, -260); g.lineTo(x0, -205); g.lineTo(x1, -205); g.closePath(); g.fill();
      g.fillStyle = R[s < 2 ? 3 : 1]; g.beginPath(); g.moveTo(0, -260); g.lineTo(x1 - 7, -205); g.lineTo(x1, -205); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.beginPath(); g.ellipse(-22, -240, 12, 5, -0.4, 0, Math.PI * 2); g.fill();
    g.restore();
    g.beginPath(); dome(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
    g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-53, -213); g.quadraticCurveTo(0, -224, 53, -213); g.stroke();
    g.strokeStyle = Wh[3]; g.lineWidth = 3; g.stroke();
    g.strokeStyle = Wh[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-52, -214.5); g.quadraticCurveTo(0, -225.5, 0, -225); g.stroke();
    px(g, -4, -268, 8, 14, INK); px(g, -3, -267, 6, 13, Au[3]); px(g, -3, -267, 2, 13, Au[5]); px(g, 1, -267, 2, 13, Au[1]);
    g.fillStyle = INK; g.beginPath(); g.arc(0, -258, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = Au[3]; g.beginPath(); g.arc(0, -258, 4.5, 0, Math.PI * 2); g.fill(); px(g, -2, -261, 2, 2, Au[5]);
  });
  // (the propeller, turning: two blades, each lit along its front edge)
  const sp = Math.cos(t * 0.15) * 30, sw = Math.abs(sp);
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, -268, sw + 3, 5.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#F2C84A', 0.5, tod); c.beginPath(); c.ellipse(0, -268, sw + 1, 3.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = farTint('#FFF0A8', 0.5, tod); c.beginPath(); c.ellipse(-sp * 0.3, -269.5, sw * 0.5 + 0.5, 1.2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; c.fillRect(-3, -271, 6, 6);
  // (the beacon on the hub, blinking after dark)
  if (night && Math.floor(t / 40) % 2 === 0) { c.fillStyle = 'rgba(255,60,60,0.35)'; c.beginPath(); c.arc(0, -274, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FF5050'; c.fillRect(-2, -276, 4, 4); }
  c.restore();
};

/** Screen space: the tower in a section's sky, at its size, drifting across as he goes through the section. */
export const drawMonument = (c: Ctx, state: GameState, m: MonumentAt, foot = m.foot) => {
  const { x0, x1 } = SECTIONS[m.id];
  const p = Math.max(0, Math.min(1, (state.camera.x + CANVAS_WIDTH / 2 - x0) / (x1 - x0)));
  drawTowerAt(c, m.x0 + (m.x1 - m.x0) * p, foot, m.k, state.frame);
};
