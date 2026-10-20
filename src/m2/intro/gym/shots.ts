// The Iron Pit's cutscene shots (scene.ts plays them): SNES pictures on a 256 x 144 canvas, done the way Meathead 1's
// cutscenes are (scenes/art: pillowed forms stepped to color ramps, dithered where the steps meet, inked; painted once
// and kept, only what moves drawn each frame). The gym is his own, Meathead 1's (scenes/intro gymBg: the brick, the
// mirror, THE IRON PIT over it, the door); the G-man who does the talking is Meathead 1's agent (scenes/suits); Meathead
// up close is Meathead 2's own (title/meathead: oiled, double biceps).
//
//   squat       wide: leg day, him under the bar in the rack, a rep at a time (the TV up on the wall)
//   tv          the TV, close: the news, GUANTANAMO BAY, his mugshot behind bars, the anchor
//   doorway     wide: the door kicked in, the two of them with a hand truck stacked with protein
//   agentTalk   the agent up close (Meathead 1's), and his partner's close-up
//   meathead    him up close: the dumb look, the fury, the red-out
//   arrival     wide: the exit door, another one of them coming through it
//   choke       close: his left arm round the G-man's neck, tightening
//   ticket      the insert: the all-day pass, held up in a shaking hand, a light from heaven on it
//   toddler     him up close, gone to mush: the eyes, the blush, the bounce, hearts

import { figure, FIG_INK, DENIM, BOOT, mhStandingFig, rimLight } from '../../../m1/game/scenes/ending';
import { gymBg, drawAgent } from '../../../m1/game/scenes/intro';
import { agentFig, agentTalk, DOOR_RIM, SUIT } from '../../../m1/game/scenes/suits';
import { RAMP, shaded, bands, layer } from '../../../m1/game/scenes/art/snes';
import { slab, tubeFixture, DOOR_GREEN, SET_INK } from '../../../m1/game/scenes/art/props';
import { painting, type Painter } from '../../../m1/game/scenes/art/raster';
import { flies, stink } from '../../../m1/game/scenes/shatLook';
import { drawTitleMeathead, type TitleMood } from '../../title/meathead';
import { ART_W, ART_H } from './scene';

type Ctx = CanvasRenderingContext2D;
const R = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const I = FIG_INK, S = RAMP.mSkin, A = RAMP.aSkin;

/** His state, for the shots that show it (the closing: flies and stink if he's shit himself). */
let dressed: 'clean' | 'shitty' | 'nude' = 'clean';
export const setShotDress = (d: typeof dressed) => { dressed = d; };

/** A checker of `col` over a rect (the 16-bit way to half-shade). */
const dither = (c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) => {
  c.fillStyle = col;
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) c.fillRect(x + xx, y + yy, 1, 1);
};

/** A 3x5 pixel font (signs in the pictures). */
const GLYPH: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101110100110101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110110101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110',
  ':': '000010000010000', '-': '000000111000000', '.': '000000000000010', '!': '010010010000010', "'": '010010000000000', ' ': '000000000000000', '/': '001001010100100',
};
const tiny = (c: Ctx, s: string, x: number, y: number, col: string, sc = 1) => {
  c.fillStyle = col;
  [...s.toUpperCase()].forEach((ch, i) => { const g = GLYPH[ch] ?? GLYPH[' ']; for (let k = 0; k < 15; k++) if (g[k] === '1') c.fillRect(x + i * 4 * sc + (k % 3) * sc, y + Math.floor(k / 3) * sc, sc, sc); });
};
const tinyW = (s: string, sc = 1) => s.length * 4 * sc - sc;

// ---------------------------------------------------------------------------------------------------------------
// The gym (Meathead 1's), a light up top, the squat rack

const tubeLight = (c: Ctx, t: number, x: number) => {
  const on = !(hash(Math.floor(t / 6) + x) > 0.94);
  R(c, x + 6, 0, 1, 2, '#3a3f48'); R(c, x + 33, 0, 1, 2, '#3a3f48');
  tubeFixture(c, x, 1, 40, on);
  if (on) for (let k = 0; k < 4; k++) { const sp = 1 - k * 0.22; c.fillStyle = 'rgba(252, 252, 220, 0.035)'; c.beginPath(); c.moveTo(x + 20 - 20 * sp, 5); c.lineTo(x + 20 + 20 * sp, 5); c.lineTo(x + 20 + 60 * sp, 144); c.lineTo(x + 20 - 60 * sp, 144); c.fill(); }
};
const room = (c: Ctx, t: number) => { gymBg(c); tubeLight(c, t, 70); };

/** The door (gymBg's, on the right) coming open by `open`: the daylight through it, spilling in across the floor. */
const doorOpening = (c: Ctx, open: number) => {
  bands(c, 217, 33, 32, 79, ['#e8e0b8', '#f4ecc8', '#fcf4d4', '#fcf8d8', '#fffbe4']);
  c.fillStyle = 'rgba(252, 248, 216, 0.22)';
  c.beginPath(); c.moveTo(217, 112); c.lineTo(249, 112); c.lineTo(252 - 90 * open, 144); c.lineTo(214 - 140 * open, 144); c.fill();
  const w = Math.round(32 * (1 - open)) + 2;
  slab(c, 217, 33, w, 79, DOOR_GREEN, { b: 1, hi: 0.55, lo: 0.3 });
  if (w > 10) { slab(c, 217 + w - 7, 72, 3, 8, RAMP.steel, { b: 1 }); slab(c, 218, 103, w - 2, 7, RAMP.steel, { b: 1, hi: 0.55, lo: 0.38 }); }
  R(c, 217 + w - 1, 33, 1, 79, '#a49c80');
};

/** The power rack he squats in (side on): its two uprights punched with holes, the J-hooks, the safety bars. */
const rack = (c: Ctx, x: number, base: number) => {
  for (const ux of [x - 26, x + 22]) {
    R(c, ux - 1, base - 99, 6, 99, SET_INK);
    slab(c, ux, base - 98, 4, 97, RAMP.steel, { b: 1, ink: null, hi: 0.66, lo: 0.36 });
    for (let k = 0; k < 9; k++) R(c, ux + 1, base - 92 + k * 9, 2, 1, '#0c0c10');
  }
  slab(c, x - 27, base - 101, 54, 3, RAMP.steel, { b: 1 });
  slab(c, x - 30, base - 30, 60, 2, RAMP.steel, { b: 1 });
  slab(c, x - 30, base - 2, 60, 2, RAMP.steel, { b: 1 });
};

/** A plate seen face on (the bar comes at us), radius r, the hub, the rim lit up and left. */
const plateFace = (c: Ctx, x: number, y: number, r: number) => {
  c.fillStyle = SET_INK; c.beginPath(); c.arc(Math.round(x) + 0.5, Math.round(y) + 0.5, r + 1, 0, Math.PI * 2); c.fill();
  shaded(c, `plate-face-${r}`, x - r, y - r, r * 2 + 1, r * 2 + 1, ['#08080a', '#141418', '#202026', '#2e2e36', '#404048', '#56565e'], (u, v) => {
    const nx = u * 2 - 1, ny = v * 2 - 1, d = Math.hypot(nx, ny);
    if (d > 1) return -1;
    // (the raised rim, the dished face, the hub)
    return d > 0.82 ? 0.75 - (nx + ny) * 0.3 : d > 0.3 ? 0.35 - (nx + ny) * 0.12 : 0.6 - (nx + ny) * 0.3;
  });
  R(c, x - 1, y - 1, 3, 3, '#a1a1aa'); R(c, x - 1, y - 1, 1, 1, '#f4f4f5');
  tiny(c, '45', x - 3, y + Math.round(r * 0.45), '#6a6a74');
};

/** Him in the squat, side on, facing right, `k` how far down (0 stood, 1 rock bottom): three frames, painted once. */
const squatFig = (frame: number) => figure(`mh2-squat-${frame}`, 64, 80, 30, 78, q => {
  const k = frame / 2;
  const a1 = k * 0.78, a2 = -k * 1.5, a3 = k * 0.62;
  const ankle = { x: 0, y: -4 };
  const knee = { x: ankle.x + Math.sin(a1) * 17, y: ankle.y - Math.cos(a1) * 17 };
  const hip = { x: knee.x + Math.sin(a2) * 17, y: knee.y - Math.cos(a2) * 17 };
  const sh = { x: hip.x + Math.sin(a3) * 22, y: hip.y - Math.cos(a3) * 22 };
  // The boots
  q.form(g => { g.moveTo(-4, -5); g.lineTo(5, -5); g.lineTo(9, -2); g.lineTo(9, 0); g.lineTo(-5, 0); g.closePath(); }, { ramp: BOOT, bevel: 1.5, amb: 0.25, ink: I });
  q.line(-3, -4, 6, -4, BOOT[4]);
  // The jeans: the shin, the thigh (thick), the seat
  q.stroke(g => { g.moveTo(ankle.x, ankle.y); g.lineTo(knee.x, knee.y); }, 10, { ramp: DENIM, bevel: 3, amb: 0.2, ink: I, inkIn: DENIM[0] });
  q.stroke(g => { g.moveTo(knee.x, knee.y); g.lineTo(hip.x, hip.y); }, 15, { ramp: DENIM, bevel: 5, amb: 0.2, ink: I, inkIn: DENIM[0] });
  q.form(g => { g.ellipse(hip.x - 2, hip.y + 1, 9, 8, 0, 0, Math.PI * 2); }, { ramp: DENIM, bevel: 4, amb: 0.2, ink: I, inkIn: DENIM[1] });
  // (the seam down the thigh, the crease behind the knee)
  q.line(knee.x - 1, knee.y - 3, hip.x + 1, hip.y - 3, DENIM[5]);
  // The belt, the torso (bare, leaning into it), the lats out
  q.stroke(g => { g.moveTo(hip.x, hip.y); g.lineTo(sh.x, sh.y); }, 22, { ramp: S, bevel: 7, amb: 0.14, ink: I, inkIn: S[1] });
  // (the pecs out front, the lats out behind)
  q.form(g => { g.ellipse(sh.x + 6 + Math.sin(a3) * -4, sh.y + 7, 7, 6, a3, 0, Math.PI * 2); }, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[2] });
  q.form(g => { g.save(); g.translate(hip.x, hip.y); g.rotate(a3); g.rect(-9, -3, 18, 4); g.restore(); }, { ramp: ['#2a1004', '#4a1e08', '#6c300c', '#8c4618', '#aa6028'], bevel: 1, amb: 0.3, ink: I });
  // (the abs down his front, the lat's edge down his back)
  for (let j = 0; j < 3; j++) { const u = 0.3 + j * 0.18; q.line(hip.x + Math.sin(a3) * 22 * u + 6, hip.y - Math.cos(a3) * 22 * u, hip.x + Math.sin(a3) * 22 * u + 8, hip.y - Math.cos(a3) * 22 * u, S[3]); }
  q.line(hip.x - 6 + Math.sin(a3) * 6, hip.y - 6, sh.x - 7, sh.y + 4, S[6]);
  // The head: square, the flat-top, the brow down, the jaw set; the neck a stump
  const hx = sh.x + Math.sin(a3) * 5 + 3, hy = sh.y - Math.cos(a3) * 5 - 6;
  q.form(g => { g.rect(hx - 7, hy - 7, 14, 15); }, { ramp: S, bevel: 3, amb: 0.2, ink: I });
  q.form(g => { g.rect(hx - 8, hy - 12, 15, 6); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.3, ink: I, gain: 1.2 });
  q.line(hx - 6, hy - 10, hx + 5, hy - 10, '#4a4a58');
  q.px(hx + 3, hy - 2, I); q.px(hx + 4, hy - 2, '#f4ece0'); q.line(hx + 1, hy - 4, hx + 5, hy - 3, I);
  q.px(hx + 6, hy, S[5]); q.px(hx + 6, hy + 1, S[3]);
  q.line(hx + 2, hy + 4, hx + 5, hy + 4, '#7a1e10');
  q.px(hx - 3, hy, S[2]); q.px(hx - 3, hy + 1, S[2]);
  // The arm back to the bar: upper arm out behind, the forearm up, the fist round the bar; the wristband
  const bx = sh.x - 3, by = sh.y + 1;
  q.stroke(g => { g.moveTo(sh.x + 1, sh.y + 2); g.lineTo(sh.x - 9, sh.y + 10); }, 12, { ramp: S, bevel: 4.5, amb: 0.2, ink: I, inkIn: S[1] });
  q.stroke(g => { g.moveTo(sh.x - 9, sh.y + 10); g.lineTo(bx - 4, by - 1); }, 9, { ramp: S, bevel: 3.5, amb: 0.25, ink: I, inkIn: S[1] });
  q.line(sh.x - 6, sh.y + 6, sh.x - 2, sh.y + 4, S[7]);
  q.form(g => { g.ellipse(bx - 4, by - 2, 3.5, 3.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: 0.25, ink: I });
  q.line(bx - 9, by + 3, bx - 6, by + 0, BOOT[3]);
});
/** Where the bar sits on him, by frame (for the plate in front). */
const barAt = (frame: number) => {
  const k = frame / 2, a1 = k * 0.78, a2 = -k * 1.5, a3 = k * 0.62;
  const kx = Math.sin(a1) * 17, ky = -4 - Math.cos(a1) * 17, hx = kx + Math.sin(a2) * 17, hy = ky - Math.cos(a2) * 17;
  return { x: hx + Math.sin(a3) * 22 - 3, y: hy - Math.cos(a3) * 22 + 1 };
};

/** Leg day, wide: the rack, him squatting in it (`k` 0..1 how deep), a drop of sweat at the bottom of each rep. */
const squatter = (c: Ctx, t: number, k: number, x = 104, base = 134) => {
  rack(c, x, base);
  const frame = k < 0.25 ? 0 : k < 0.75 ? 1 : 2;
  // (the bar's shadow on the floor, his)
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x + 2, base + 1, 18, 2.5, 0, 0, Math.PI * 2); c.fill();
  squatFig(frame)(c, x, base);
  const b = barAt(frame);
  plateFace(c, x + b.x - 2, base + b.y + 2, 10);
  if (frame === 2) for (let i = 0; i < 3; i++) R(c, x + b.x + 10 + hash(t + i) * 8, base + b.y - 12 - hash(t * 3 + i) * 8, 1, 2, '#9cdcfc');
};

// ---------------------------------------------------------------------------------------------------------------
// The TV on the wall

/** The set's shell, the screen's glass (the picture goes on it), a bracket off the wall: painted once. */
const tvShell = (key: string, w: number, h: number) => painting(key, w + 8, h + 14, p => {
  // (the bracket up to the ceiling)
  p.form(g => { g.rect(w / 2 - 1, 0, 6, 8); }, { ramp: RAMP.steel, bevel: 1, amb: 0.3, ink: I });
  // (the cabinet: dark plastic, rounded, the bezel)
  p.form(g => { g.roundRect(0, 6, w + 8, h + 8, 5); }, { ramp: ['#0c0c10', '#18181e', '#24242c', '#30303a', '#40404c', '#56566a'], bevel: 5, amb: 0.2, ink: I });
  p.form(g => { g.roundRect(3, 9, w + 2, h + 2, 4); }, { ramp: ['#040406', '#0a0a0e', '#121218'], bevel: 2, amb: 0.4, ink: null });
});

/** The news on it: the set, the anchor (`talking`), the over-the-shoulder graphic (him behind bars), the lower third. */
const newsPicture = (c: Ctx, x: number, y: number, w: number, h: number, t: number, talking: boolean) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  bands(c, x, y, w, h, ['#0a1a4a', '#0e2260', '#122a74', '#183488', '#1e3e9a', '#16307c']);
  // (the studio's skyline backdrop, lit windows)
  for (let k = 0; k < 9; k++) { const bw = w / 9; R(c, x + k * bw, y + h * 0.25 + hash(k) * h * 0.2, bw - 1, h, '#0a143a'); for (let j = 0; j < 5; j++) if (hash(k * 9 + j) > 0.5) R(c, x + k * bw + 2 + (j % 2) * 4, y + h * 0.35 + j * 4, 2, 2, '#e8c860'); }
  const s = w / 150;
  // The graphic, over her shoulder: his mugshot behind bars, GUANTANAMO BAY
  const gx = x + w * 0.55, gy = y + h * 0.1, gw = w * 0.38, gh = h * 0.42;
  R(c, gx - 1, gy - 1, gw + 2, gh + 2, '#f8fafc');
  bands(c, gx, gy, gw, gh, ['#5c6470', '#6c7480', '#7c8490', '#6c7480']);
  for (let k = 0; k < 4; k++) R(c, gx + 2, gy + 4 + k * (gh / 5), gw - 4, 1, '#3c444e'); // (the height lines)
  // (his face in it: the square head, the flat-top, a scowl)
  const fx = gx + gw / 2, fy = gy + gh * 0.55, fs = gh / 30;
  R(c, fx - 7 * fs, fy + 5 * fs, 14 * fs, 8 * fs, S[4]);
  R(c, fx - 5 * fs, fy - 6 * fs, 10 * fs, 11 * fs, S[5]); R(c, fx + 2 * fs, fy - 6 * fs, 3 * fs, 11 * fs, S[3]);
  R(c, fx - 6 * fs, fy - 9 * fs, 12 * fs, 4 * fs, '#101014');
  R(c, fx - 3 * fs, fy - 2 * fs, 2 * fs, 1 * fs, I); R(c, fx + 1 * fs, fy - 2 * fs, 2 * fs, 1 * fs, I); R(c, fx - 2 * fs, fy + 2 * fs, 4 * fs, 1 * fs, '#7a1e10');
  for (let k = 0; k < 5; k++) { R(c, gx + 2 + k * (gw - 4) / 4, gy, 2, gh, '#2c2c34'); R(c, gx + 2 + k * (gw - 4) / 4, gy, 1, gh, '#8c8c98'); }
  // The anchor: blazer, blouse, the helmet of hair, the smile that's seen it all
  const ax = x + w * 0.3, ay = y + h * 0.95;
  c.fillStyle = '#7a1a2a'; c.beginPath(); c.moveTo(ax - 26 * s, ay); c.quadraticCurveTo(ax - 24 * s, ay - 30 * s, ax, ay - 32 * s); c.quadraticCurveTo(ax + 24 * s, ay - 30 * s, ax + 26 * s, ay); c.fill();
  c.fillStyle = '#a42638'; c.fillRect(ax - 22 * s, ay - 28 * s, 6 * s, 26 * s);
  c.fillStyle = '#f4ece4'; c.beginPath(); c.moveTo(ax - 6 * s, ay - 31 * s); c.lineTo(ax + 6 * s, ay - 31 * s); c.lineTo(ax, ay - 18 * s); c.fill();
  c.fillStyle = '#e8b890'; c.fillRect(ax - 4 * s, ay - 38 * s, 8 * s, 8 * s);
  c.fillStyle = '#f0c8a0'; c.beginPath(); c.ellipse(ax, ay - 46 * s, 10 * s, 12 * s, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#d8a478'; c.fillRect(ax + 4 * s, ay - 56 * s, 6 * s, 20 * s);
  c.fillStyle = '#e8c048'; c.beginPath(); c.ellipse(ax - 1 * s, ay - 52 * s, 13 * s, 10 * s, 0, Math.PI, 0); c.fill();
  c.fillRect(ax - 14 * s, ay - 52 * s, 6 * s, 16 * s); c.fillRect(ax + 8 * s, ay - 52 * s, 6 * s, 16 * s);
  c.fillStyle = '#c89c28'; c.fillRect(ax - 14 * s, ay - 44 * s, 6 * s, 2 * s);
  R(c, ax - 5 * s, ay - 48 * s, 3 * s, 2 * s, '#2a1a10'); R(c, ax + 2 * s, ay - 48 * s, 3 * s, 2 * s, '#2a1a10');
  const open = talking && t % 10 < 5;
  R(c, ax - 3 * s, ay - 41 * s, 6 * s, (open ? 3 : 1) * s, open ? '#5a1010' : '#b04050');
  if (open) R(c, ax - 2 * s, ay - 41 * s, 4 * s, 1 * s, '#f8f0e8');
  // The lower third: GUANTANAMO BAY, DAY 400; the ticker under it
  const ly = y + h - 18 * s;
  R(c, x, ly, w, 10 * s, '#b01818'); R(c, x, ly, w, 1 * s, '#f87070');
  tiny(c, 'GUANTANAMO BAY: DAY 400', x + 4 * s, ly + 2.5 * s, '#ffffff', Math.max(1, Math.round(s)));
  R(c, x, ly + 10 * s, w, 8 * s, '#f8fafc');
  const tick = 'PRESIDENT KILLER STILL MISERABLE ... HAPPY LAND RECORD ATTENDANCE ... GAS UP 40 CENTS ... ';
  c.save(); c.beginPath(); c.rect(x, ly + 10 * s, w, 8 * s); c.clip();
  tiny(c, tick + tick, x + w - ((t * 1.2) % (tinyW(tick) * Math.max(1, Math.round(s)))), ly + 11.5 * s, '#0a1a4a', Math.max(1, Math.round(s)));
  c.restore();
  // (the logo in the corner)
  R(c, x + 3 * s, y + 3 * s, 18 * s, 8 * s, '#f8fafc'); tiny(c, 'MNN', x + 5 * s, y + 4.5 * s, '#b01818', Math.max(1, Math.round(s)));
  // Scanlines, a roll of brighter lines down it
  c.fillStyle = 'rgba(0,0,0,0.22)'; for (let yy = y; yy < y + h; yy += 2) c.fillRect(x, yy, w, 1);
  const roll = y + ((t * 1.5) % (h + 20)) - 10;
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x, roll, w, 6);
  c.restore();
};

/** The TV, close: the brick behind, the set on its bracket, the news on it, the screen's glare. */
export const shotTv = (c: Ctx, t: number, talking: boolean) => {
  // (the brick behind it, out of focus: bands of the gym's red)
  layer(c, 'gym2-tv-wall', ART_W, ART_H, g => {
    bands(g, 0, 0, ART_W, ART_H, ['#2c0c06', '#3a1008', '#4a160c', '#561c10', '#4a160c', '#3a1008']);
    for (let y = 0; y < ART_H; y += 12) for (let x = (y / 12) % 2 ? -14 : 0; x < ART_W; x += 28) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + 11, 28, 1); g.fillRect(x + 27, y, 1, 12); }
  });
  const w = 196, h = 116, x = (ART_W - w - 8) / 2, y = 2;
  c.drawImage(tvShell('gym2-tv-shell', w, h), x, y);
  newsPicture(c, x + 4, y + 11, w, h, t, talking);
  // (the glass's curve catching the tube lights)
  c.fillStyle = 'rgba(255,255,255,0.07)'; c.beginPath(); c.ellipse(x + 50, y + 30, 40, 16, -0.3, 0, Math.PI * 2); c.fill();
  dither(c, x + 18, y + 18, 10, 4, 'rgba(255,255,255,0.18)');
};

/** The little TV in the wide shot, up in the corner (the news on it, small). */
const tvSmall = (c: Ctx, t: number) => {
  const w = 34, h = 22, x = 168, y = 2;
  c.drawImage(tvShell('gym2-tv-small', w, h), x, y);
  newsPicture(c, x + 4, y + 11, w, h, t, false);
};

/** Leg day, wide: his gym, the rack, him squatting (a rep every couple of seconds), the TV up in the corner. */
export const shotSquat = (c: Ctx, t: number) => {
  room(c, t);
  tvSmall(c, t);
  const k = (1 - Math.cos(t * 0.05)) / 2;
  squatter(c, t, k);
};

// ---------------------------------------------------------------------------------------------------------------
// The G-men at the door

/** His partner: a woman, the same black suit, the shades, the earpiece, her hair back in a bun; a clipboard. */
const AF = ['#2a170c', '#43261a', '#5e3825', '#7a4c32', '#956142', '#b07a58'];
const agentFFig = (back: string | null) => figure(`m2-agentf-${back}`, 40, 78, 20, 75, q => {
  const SH = RAMP.shirt, HAIR = RAMP.mHair;
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -6.5 : 0.5;
    q.form(g => { g.moveTo(x0, -25); g.lineTo(x0 + 6, -25); g.lineTo(x0 + 5.5, -3); g.lineTo(x0 + 0.5, -3); g.closePath(); }, { ramp: SUIT, bevel: 2.5, amb: s < 0 ? 0.2 : 0.1, ink: I, inkIn: SUIT[0] });
    q.form(g => { g.moveTo(x0, -3.5); g.lineTo(x0 + 6, -3.5); g.lineTo(x0 + 7, -1); g.lineTo(x0 + 7, 0); g.lineTo(x0 - 0.5, 0); g.closePath(); }, { ramp: BOOT, bevel: 1.5, amb: 0.2, ink: I, spec: '#c8c8d8', wet: 0.9 });
  }
  for (const s of [-1, 1]) {
    q.form(g => { g.moveTo(s * 9, -50); g.bezierCurveTo(s * 13, -50, s * 13.5, -45, s * 13, -38); g.lineTo(s * 12.5, -27); g.lineTo(s * 9, -27); g.lineTo(s * 8.5, -42); g.closePath(); }, { ramp: SUIT, bevel: 3, amb: s < 0 ? 0.2 : 0.08, ink: I, inkIn: SUIT[0] });
    q.form(g => { g.ellipse(s * 10.8, -24.5, 2.2, 2.5, 0, 0, Math.PI * 2); }, { ramp: AF, bevel: 2, amb: 0.2, ink: I });
  }
  q.form(g => { g.moveTo(-5, -55); g.lineTo(5, -55); g.lineTo(10.5, -52); g.bezierCurveTo(12, -50, 11, -45, 10, -42); g.lineTo(9.5, -23); g.lineTo(-9.5, -23); g.lineTo(-10, -42); g.bezierCurveTo(-11, -45, -12, -50, -10.5, -52); g.closePath(); }, { ramp: SUIT, bevel: 5, amb: 0.14, ink: I, inkIn: SUIT[0] });
  q.form(g => { g.moveTo(-4, -54); g.lineTo(4, -54); g.lineTo(0.5, -42); g.lineTo(-0.5, -42); g.closePath(); }, { ramp: SH, bevel: 2, amb: 0.35, ink: null });
  q.line(-4, -53, -1, -42, SUIT[6]); q.line(4, -53, 1, -42, SUIT[4]);
  // (the clipboard, held across her)
  q.form(g => { g.rect(-12, -38, 10, 13); }, { ramp: ['#5c3a1c', '#7a5028', '#9a6a38', '#b4844c'], bevel: 1, amb: 0.3, ink: I });
  q.rect(-11, -36, 8, 10, '#f4f1de'); for (let k = 0; k < 4; k++) q.line(-10, -34 + k * 2, -5, -34 + k * 2, '#8c8a7c');
  q.rect(-9, -39, 4, 2, '#9a9aa8');
  q.form(g => { g.rect(-3, -59, 6, 5); }, { ramp: AF, bevel: 2, amb: 0.3, ink: I, inkIn: AF[1] });
  q.form(g => { g.ellipse(0, -65, 5.5, 6.5, 0, 0, Math.PI * 2); }, { ramp: AF, bevel: 3, amb: 0.2, ink: I });
  // (the hair: pulled back hard, the bun)
  q.form(g => { g.moveTo(-6, -64); g.bezierCurveTo(-6.5, -71, -3, -72.5, 0, -72.5); g.bezierCurveTo(3, -72.5, 6.5, -71, 6, -64); g.lineTo(4.5, -67.5); g.lineTo(-4.5, -67.5); g.closePath(); }, { ramp: HAIR, bevel: 2, amb: 0.3, ink: I, spec: '#7a7a8c', wet: 0.5 });
  q.form(g => { g.ellipse(-5, -71, 3, 3, 0, 0, Math.PI * 2); }, { ramp: HAIR, bevel: 2, amb: 0.3, ink: I, spec: '#7a7a8c', wet: 0.5 });
  q.form(g => { g.rect(-5, -66.5, 10.5, 3); }, { ramp: ['#000000', '#06060a', '#10101a', '#1c1c2c', '#30304a'], bevel: 1, amb: 0.3, ink: I, gain: 1.1 });
  q.px(-3, -66, '#9a9ab4');
  q.line(-1, -60, 1, -60, '#7a2a2a');
  q.rect(5, -66, 1, 2, '#c8c8d0');
  if (back) rimLight(q, -20, 19, -73, -1, back, back, -73);
});
const agentFTalk = (c: Ctx, x: number, y: number) => { R(c, x - 1, y - 60, 3, 2, '#3a0606'); };

/** The hand truck: its frame, two wheels, four tubs of protein stacked up it (black, the red label). */
const handTruck = figure('m2-handtruck', 40, 70, 16, 66, q => {
  const TUB = ['#06060a', '#101016', '#1c1c24', '#2a2a34', '#3c3c48'];
  for (let k = 0; k < 4; k++) {
    const y = -12 - k * 13;
    q.form(g => { g.roundRect(-8, y - 12, 20, 12, 2); }, { ramp: TUB, bevel: 4, amb: 0.2, ink: I });
    q.rect(-6, y - 9, 16, 5, '#b81c1c'); q.line(-6, y - 9, 9, y - 9, '#f05050');
    q.rect(-3, y - 8, 10, 1, '#f8f0e0'); q.rect(-2, y - 6, 7, 1, '#f8f0e0');
    q.form(g => { g.roundRect(-9, y - 14, 22, 3, 1); }, { ramp: TUB, bevel: 1, amb: 0.4, ink: I });
  }
  q.form(g => { g.rect(-12, -64, 3, 62); }, { ramp: RAMP.steel, bevel: 1, amb: 0.3, ink: I });
  q.form(g => { g.rect(-12, -66, 9, 3); }, { ramp: RAMP.steel, bevel: 1, amb: 0.3, ink: I });
  q.form(g => { g.rect(-11, -3, 24, 3); }, { ramp: RAMP.steel, bevel: 1, amb: 0.3, ink: I });
  q.form(g => { g.ellipse(-10, -3, 5, 5, 0, 0, Math.PI * 2); }, { ramp: BOOT, bevel: 2, amb: 0.25, ink: I });
  q.px(-11, -4, '#9a9aa8');
});

/** The door kicked in: the two of them in it against the daylight, the hand truck of protein, him racked, looking. */
export const shotDoorway = (who: 'him' | 'her' | 'none', settled = false) => (c: Ctx, tIn: number, talking: boolean) => {
  const t = settled ? tIn + 90 : tIn;
  room(c, t);
  tvSmall(c, t);
  const open = clamp01(t / 10);
  doorOpening(c, open);
  // (in they come: two steps, then planted)
  const step = Math.min(1, t / 40);
  const ax = 236 - step * 30, fx = 228 - step * 38;
  handTruck(c, ax - 18, 134);
  agentFig(t < 40 ? Math.round(Math.sin(t * 0.3) * 3) : 0, open > 0.5 ? DOOR_RIM : null)(c, ax, 132);
  agentFFig(open > 0.5 ? DOOR_RIM : null)(c, fx, 128);
  if (talking && t % 10 < 5) { if (who === 'him') agentTalk(c, ax, 132); else if (who === 'her') agentFTalk(c, fx, 128); }
  squatter(c, t, 0);
  // (the bang as it came open: dust off the frame)
  if (t < 14) for (let i = 0; i < 8; i++) R(c, 214 + hash(i) * 6, 33 + hash(i + 9) * 70 + t, 1, 1, '#d8d0b0');
};

/** The agent up close (Meathead 1's: the shades, the earpiece, the gym behind him), talking. */
export const shotAgent = (keys = false) => (c: Ctx, t: number, talking: boolean) => {
  drawAgent(c, t, talking, 'gym');
  if (keys) {
    // (the truck's keys, dangled up into the shot off one finger, swinging)
    const sw = Math.sin(t * 0.12) * 4;
    R(c, 176, 144 - 30, 14, 30, A[3]); R(c, 176, 114, 3, 30, A[4]); R(c, 186, 114, 4, 30, A[1]);
    R(c, 180, 104, 5, 14, A[3]); R(c, 180, 104, 1, 14, A[5]);
    c.strokeStyle = '#c8c8d0'; c.lineWidth = 2; c.beginPath(); c.arc(182 + sw * 0.3, 108, 5, 0, Math.PI * 2); c.stroke();
    for (const [dx, dy] of [[-6, 10], [4, 14]]) { R(c, 182 + sw + dx, 110 + dy, 3, 10, '#d4d4dc'); R(c, 182 + sw + dx, 110 + dy, 1, 10, '#ffffff'); R(c, 182 + sw + dx + 3, 114 + dy, 1, 2, '#d4d4dc'); }
    slab(c, 170 + sw, 112, 10, 14, ['#0c0c10', '#18181e', '#24242c', '#30303a'], { b: 1 }); tiny(c, 'US', 172 + sw, 116, '#e8e8f0');
  }
  if (dressed !== 'clean') { flies(c, 70, 110, 14, 2); stink(c, 40, 140, 3, 26, 9); }
};

/** Her up close: the shades, the bun, the earpiece, the clipboard up, the gym behind her out of focus. */
const agentFStill = () => painting('m2-agentf-close', ART_W, ART_H, p => {
  const SH = RAMP.shirt, HAIR = RAMP.mHair;
  const AFC = ['#1e1008', '#2e1a0e', '#43261a', '#5a3524', '#714530', '#8a5840', '#a46e52', '#bc8a6c'];
  // The jacket: shoulders out past the frame
  p.form(g => { g.moveTo(30, 150); g.bezierCurveTo(38, 128, 60, 114, 86, 108); g.lineTo(96, 104); g.lineTo(160, 104); g.lineTo(170, 108); g.bezierCurveTo(196, 114, 218, 128, 226, 150); g.closePath(); }, { ramp: SUIT, bevel: 22, amb: 0.1, ink: I });
  // The shirt in the V, the lapels
  p.form(g => { g.moveTo(108, 104); g.lineTo(148, 104); g.lineTo(130, 144); g.lineTo(126, 144); g.closePath(); }, { ramp: SH, bevel: 6, amb: 0.3, ink: I });
  p.line(108, 104, 126, 144, SUIT[6]); p.line(148, 104, 130, 144, SUIT[4]);
  // The neck, the head (an oval, the jaw), the ears
  p.form(g => { g.rect(114, 86, 28, 22); }, { ramp: AFC, bevel: 6, amb: 0.2, ink: I, inkIn: AFC[1] });
  for (const s of [-1, 1]) p.form(g => { g.ellipse(128 + s * 27, 60, 5, 9, 0, 0, Math.PI * 2); }, { ramp: AFC, bevel: 3, amb: 0.2, ink: I });
  p.form(g => { g.moveTo(102, 50); g.bezierCurveTo(102, 24, 154, 24, 154, 50); g.bezierCurveTo(154, 78, 142, 96, 128, 96); g.bezierCurveTo(114, 96, 102, 78, 102, 50); g.closePath(); }, { ramp: AFC, bevel: 14, amb: 0.18, ink: I });
  // The hair: scraped back, the bun up behind, the shine
  p.form(g => { g.moveTo(100, 54); g.bezierCurveTo(98, 20, 158, 20, 156, 54); g.lineTo(150, 40); g.bezierCurveTo(140, 34, 116, 34, 106, 40); g.closePath(); }, { ramp: HAIR, bevel: 8, amb: 0.3, ink: I, spec: '#8a8aa0', wet: 0.6 });
  p.form(g => { g.ellipse(128, 18, 16, 12, 0, 0, Math.PI * 2); }, { ramp: HAIR, bevel: 8, amb: 0.3, ink: I, spec: '#8a8aa0', wet: 0.6 });
  // The shades
  p.form(g => { g.roundRect(104, 48, 22, 13, 3); g.roundRect(130, 48, 22, 13, 3); }, { ramp: ['#000000', '#05050a', '#0c0c16', '#161624', '#222236', '#34344e'], bevel: 3, amb: 0.3, ink: I });
  p.rect(126, 52, 4, 2, I);
  // The nose's shadow, the lips (a flat line, a little lipstick), the earpiece and its coil
  p.line(128, 64, 126, 74, AFC[3]); p.line(125, 74, 129, 75, AFC[2]);
  p.rect(120, 81, 16, 3, '#7a2a30'); p.line(120, 81, 135, 81, '#a43c44');
  p.rect(155, 56, 3, 6, '#d8d8e0'); for (let k = 0; k < 10; k++) p.px(156 + (k % 2), 62 + k * 3, '#b8b8c4');
  // The clipboard, held up at the bottom left
  p.form(g => { g.moveTo(40, 144); g.lineTo(52, 96); g.lineTo(96, 104); g.lineTo(88, 144); g.closePath(); }, { ramp: ['#5c3a1c', '#7a5028', '#9a6a38', '#b4844c', '#cc9c64'], bevel: 3, amb: 0.3, ink: I });
  p.form(g => { g.moveTo(48, 144); g.lineTo(57, 104); g.lineTo(90, 110); g.lineTo(83, 144); g.closePath(); }, { ramp: ['#b0ae9e', '#cecbb8', '#e4e1cc', '#f4f1de'], bevel: 2, amb: 0.5, ink: null });
  for (let k = 0; k < 6; k++) p.line(58 - k * 0.6, 114 + k * 5, 84 - k * 0.6, 118 + k * 5, '#8c8a7c');
  p.line(60, 140, 76, 132, '#20242c'); p.line(66, 138, 70, 134, '#20242c');
  p.form(g => { g.rect(64, 98, 14, 6); }, { ramp: RAMP.steel, bevel: 2, amb: 0.3, ink: I });
});
export const shotAgentF = (c: Ctx, t: number, talking: boolean) => {
  gymBg(c); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, ART_W, ART_H);
  c.drawImage(agentFStill(), 0, 0);
  // (a glint across the shades)
  const g = (t * 2) % 140;
  if (g < 26) for (let y = 49; y < 60; y++) { const x = 104 + g + Math.round((60 - y) * 0.5); if (x < 152) R(c, x, y, 1, 1, '#c8c8dc'); }
  if (talking && t % 10 < 5) { R(c, 121, 81, 14, 4, '#3a0606'); R(c, 122, 81, 12, 1, '#e8e0d0'); }
};

// ---------------------------------------------------------------------------------------------------------------
// Him up close (Meathead 2's own close-up, in front of his gym)

/** The gym behind him, out of focus: the brick, the mirror's streaks, darker, the tube's light on him. */
const blurGym = (c: Ctx, red = 0) => {
  layer(c, 'gym2-blur', ART_W, ART_H, g => {
    bands(g, 0, 0, ART_W, ART_H, ['#1c0806', '#2a0c08', '#3c120a', '#4c180e', '#3c120a', '#2a0c08', '#1c0806']);
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(124, 156, 172, 0.12)'; g.fillRect(20 + k * 42, 20, 12, 70); }
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 110, ART_W, 34);
    for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) if (((x + y) & 1) && hash(x * 3 + y * 7) > 0.92) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y, 1, 1); }
  });
  if (red > 0) {
    // (the red-out: banded, pulsing)
    const cols = ['#3c0000', '#5c0404', '#7c0a06', '#9c140a', '#7c0a06', '#5c0404'];
    c.globalAlpha = red; bands(c, 0, 0, ART_W, ART_H, cols); c.globalAlpha = 1;
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; c.strokeStyle = `rgba(255, 80, 40, ${0.18 * red})`; c.lineWidth = 3; c.beginPath(); c.moveTo(128 + Math.cos(a) * 60, 60 + Math.sin(a) * 50); c.lineTo(128 + Math.cos(a) * 200, 60 + Math.sin(a) * 160); c.stroke(); }
  }
};

export const shotMeathead = (mood: TitleMood, red = 0) => (c: Ctx, t: number, talking: boolean) => {
  blurGym(c, red > 0 ? Math.min(red, 0.4 + 0.3 * Math.sin(t * 0.3)) : 0);
  drawTitleMeathead(c, t, mood, t);
  // (his mouth going as he says it: the jaw's working)
  if (talking && t % 8 < 4 && mood === 'dumb') { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  if (dressed !== 'clean') { flies(c, 60, 120, 16, 3); stink(c, 200, 140, 3, 30, 10); }
};

// ---------------------------------------------------------------------------------------------------------------
// The closing: through the door, the chokehold, the ticket, the toddler

/** Another one comes through the door: the daylight behind him, him walking in with a folder; Meathead turning. */
export const shotArrival = (c: Ctx, t: number) => {
  room(c, t);
  tvSmall(c, t);
  doorOpening(c, clamp01(t / 8));
  const step = Math.min(1, t / 50);
  const ax = 234 - step * 24;
  agentFig(t < 50 ? Math.round(Math.sin(t * 0.3) * 3) : 0, DOOR_RIM)(c, ax, 132);
  // (his folder)
  R(c, ax + 10, 104, 6, 9, '#c8a050'); R(c, ax + 10, 104, 6, 1, '#e8c070');
  // Meathead, in the middle of the floor: he sees him (the veins come up, the steam)
  mhStandingFig(false, true, true)(c, 120, 136);
  if (t > 40) { for (let k = 0; k < 3; k++) { const y = 62 - ((t * 0.6 + k * 8) % 20); R(c, 112 + k * 7, y, 2, 2, 'rgba(240,240,240,0.7)'); } R(c, 117, 70, 1, 3, '#ef4444'); R(c, 124, 70, 1, 3, '#ef4444'); }
  if (dressed !== 'clean') { flies(c, 120, 100, 10, 2, 0.6); }
  // (the bang of the door: the dust)
  if (t < 12) for (let i = 0; i < 8; i++) R(c, 214 + hash(i) * 6, 33 + hash(i + 9) * 70 + t, 1, 1, '#d8d0b0');
};

/** The chokehold, close: painted once per stage of the squeeze (his arm higher, the G-man's face going purple). */
const GFACE = [A, ['#5a2a1c', '#84382a', '#a8483a', '#c85c4a', '#e07862', '#f09a84'], ['#3a1a34', '#5a2848', '#7a385c', '#9a4a70', '#b46488', '#cc84a0']];
const chokeStill = (stage: number) => painting(`m2-choke-${stage}`, ART_W, ART_H, (p: Painter) => {
  const up = stage * 2;
  const MS = ['#2a1006', '#46200e', '#6a3418', '#8c4a24', '#ae6432', '#c87e44', '#dc9a5a', '#ecb878', '#f8d4a0'];
  const F = GFACE[stage];
  // Meathead: the shoulders and the chest behind (bare, huge), the traps up to his ears
  p.form(g => { g.moveTo(0, 144); g.lineTo(0, 86); g.bezierCurveTo(20, 62, 60, 50, 100, 48); g.lineTo(176, 48); g.bezierCurveTo(206, 50, 240, 62, 256, 86); g.lineTo(256, 144); g.closePath(); }, { ramp: MS, bevel: 26, amb: 0.12, ink: I });
  // (the delts capped round, the pecs slabbed across, the split down the middle)
  for (const s of [-1, 1]) {
    p.form(g => { g.ellipse(128 + s * 100, 90, 30, 28, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 14, amb: 0.14, ink: I, inkIn: MS[2] });
    p.form(g => { g.ellipse(128 + s * 44, 92, 40, 24, s * 0.1, 0, Math.PI * 2); }, { ramp: MS, bevel: 12, amb: 0.14, ink: I, inkIn: MS[2] });
  }
  for (let k = 0; k < 6; k++) { p.px(30 + k * 3, 74 - k, MS[8]); p.px(226 - k * 3, 74 - k, MS[6]); }
  // (his head, behind the G-man's, up over it: square, the flat-top cut off by the frame)
  p.form(g => { g.moveTo(108, 44); g.lineTo(108, 4); g.lineTo(168, 4); g.lineTo(168, 44); g.lineTo(160, 56); g.lineTo(116, 56); g.closePath(); }, { ramp: MS, bevel: 10, amb: 0.18, ink: I });
  for (const s of [-1, 1]) p.form(g => { g.ellipse(138 + s * 32, 26, 5, 9, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 3, amb: 0.2, ink: I });
  p.form(g => { g.rect(106, -6, 64, 12); }, { ramp: ['#020206', '#08080e', '#101018', '#1a1a26', '#262636', '#36364c'], bevel: 4, amb: 0.3, ink: I, gain: 1.2 });
  for (let x = 108; x < 168; x += 2) p.line(x, 0, x, 4, '#1a1a26');
  // (the fury: the brows down hard, the eyes red pinpoints, a vein up his forehead, the teeth gritted)
  for (const s of [-1, 1]) {
    const ex = 138 + s * 14;
    p.form(g => { g.moveTo(ex - 10, 12 + (s > 0 ? 6 : 0)); g.lineTo(ex + 10, 12 + (s > 0 ? 0 : 6)); g.lineTo(ex + 10, 16 + (s > 0 ? 0 : 6)); g.lineTo(ex - 10, 16 + (s > 0 ? 6 : 0)); g.closePath(); }, { ramp: ['#020206', '#101018', '#1a1a26'], bevel: 1, amb: 0.3, ink: I });
    p.rect(ex - 6, 21, 12, 4, '#f4ece0'); p.rect(ex - 1 + s, 21, 3, 4, '#c81818'); p.px(ex + s, 22, '#ffd0d0'); p.line(ex - 6, 20, ex + 6, 20, I); p.line(ex - 6, 25, ex + 6, 25, I);
  }
  p.line(136, 2, 134, 12, '#82301e'); p.line(137, 2, 135, 12, '#b0502c');
  p.line(138, 26, 138, 33, MS[3]); p.line(137, 33, 140, 34, MS[2]);
  p.rect(122, 38, 32, 8, I); for (let x = 123; x < 153; x += 4) p.rect(x, 39, 3, 6, '#f4ece0'); p.line(122, 42, 153, 42, I);
  for (const [x, y] of [[112, 44], [116, 48], [160, 46], [156, 50], [120, 52], [152, 53]]) p.px(x, y, MS[3]);
  // The G-man in front of him: the suit's shoulders, the shirt, the tie askew; the neck, the head tipped back
  p.form(g => { g.moveTo(40, 144); g.bezierCurveTo(50, 122, 80, 112, 104, 110); g.lineTo(156, 110); g.bezierCurveTo(180, 112, 204, 122, 214, 144); g.closePath(); }, { ramp: SUIT, bevel: 18, amb: 0.1, ink: I });
  p.form(g => { g.moveTo(112, 110); g.lineTo(148, 110); g.lineTo(132, 144); g.lineTo(128, 144); g.closePath(); }, { ramp: RAMP.shirt, bevel: 5, amb: 0.3, ink: I });
  p.form(g => { g.moveTo(130, 112); g.lineTo(138, 114); g.lineTo(140, 140); g.lineTo(134, 144); g.lineTo(130, 138); g.closePath(); }, { ramp: SUIT, bevel: 2, amb: 0.3, ink: I, gain: 1.2 });
  const hy = 74 - up / 2;
  p.form(g => { g.rect(116, hy + 14, 26, 24); }, { ramp: F, bevel: 6, amb: 0.2, ink: I, inkIn: F[1] });
  p.form(g => { g.ellipse(129, hy, 22, 25, -0.15, 0, Math.PI * 2); }, { ramp: F, bevel: 12, amb: 0.2, ink: I });
  for (const s of [-1, 1]) p.form(g => { g.ellipse(129 + s * 22, hy + 2, 4, 7, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 3, amb: 0.2, ink: I });
  // (his hair: the helmet, knocked loose, a lick of it up)
  p.form(g => { g.moveTo(107, hy - 4); g.bezierCurveTo(106, hy - 30, 150, hy - 32, 151, hy - 8); g.lineTo(144, hy - 14); g.lineTo(113, hy - 12); g.closePath(); }, { ramp: RAMP.mHair, bevel: 4, amb: 0.3, ink: I, spec: '#7a7a8c', wet: 0.5 });
  p.line(132, hy - 26, 138, hy - 36 - stage * 2, I); p.line(133, hy - 26, 139, hy - 36 - stage * 2, '#26262c');
  // (the shades knocked crooked, an eye bulging over them)
  p.form(g => { g.save(); g.translate(128, hy + 2); g.rotate(0.22 + stage * 0.08); g.roundRect(-20, -6, 18, 10, 2); g.roundRect(2, -6, 18, 10, 2); g.restore(); }, { ramp: ['#000000', '#05050a', '#0c0c16', '#161624', '#222236'], bevel: 2, amb: 0.3, ink: I });
  const ex = 141, ey = hy - 8;
  p.disc(ex, ey, 6 + stage, 5 + stage, I); p.disc(ex, ey, 5 + stage, 4 + stage, '#f8f4ec'); p.disc(ex + 1, ey + 1, 2, 2, I);
  for (let k = 0; k < stage + 1; k++) p.line(ex - 4 - k, ey - 2 + k * 2, ex - 1, ey - 1 + k, '#d04040');
  // (the nose, the mouth open, the tongue out, sweat)
  p.line(128, hy + 8, 126, hy + 12, F[2]);
  p.disc(126, hy + 17, 7, 3 + stage, '#3a0606');
  p.disc(127, hy + 19 + stage, 4, 2 + stage, '#d05060');
  for (let k = 0; k < 3; k++) p.rect(110 + k * 16, hy - 12 + k * 6, 2, 3, '#a8d8f0');
  // His left arm round the G-man's throat: the forearm across it, the bicep bulging up on the right, his other hand
  // locking it on the left
  const ay = 110 - up;
  p.form(g => { g.moveTo(256, 70); g.bezierCurveTo(236, 66, 208, 76, 196, ay - 10); g.lineTo(186, ay + 14); g.bezierCurveTo(206, ay + 18, 236, 112, 256, 120); g.closePath(); }, { ramp: MS, bevel: 16, amb: 0.14, ink: I });
  p.form(g => { g.moveTo(198, ay - 12); g.bezierCurveTo(170, ay - 14, 120, ay - 12, 84, ay - 6); g.lineTo(84, ay + 10); g.bezierCurveTo(120, ay + 12, 170, ay + 14, 196, ay + 14); g.closePath(); }, { ramp: MS, bevel: 9, amb: 0.18, ink: I });
  // (the wristband; the veins standing up in the forearm, more the harder it squeezes)
  p.form(g => { g.rect(84, ay - 8, 12, 19); }, { ramp: ['#020204', '#0a0a10', '#16161e', '#24242e', '#383844'], bevel: 2, amb: 0.3, ink: I });
  for (const sx of [88, 92]) for (const sy of [ay - 4, ay + 4]) { p.rect(sx, sy, 2, 2, '#b0b0c0'); p.px(sx, sy, '#ffffff'); }
  for (let v = 0; v <= stage; v++) { const y0 = ay - 6 + v * 5; for (let x = 104; x < 186; x += 2) p.px(x, y0 + Math.round(Math.sin(x * 0.12 + v) * 1.5), v % 2 ? '#82301e' : '#b0502c'); }
  p.form(g => { g.ellipse(70, ay + 2, 16, 14, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 8, amb: 0.2, ink: I });
  for (let k = 0; k < 3; k++) p.line(60, ay - 6 + k * 6, 76, ay - 4 + k * 6, MS[2]);
  // (the G-man's hands, clawing at the forearm)
  for (const hx of [120, 156]) { p.form(g => { g.ellipse(hx, ay + 14, 8, 6, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 4, amb: 0.2, ink: I }); for (let k = 0; k < 3; k++) p.line(hx - 5 + k * 4, ay + 8, hx - 5 + k * 4, ay + 2, F[2]); }
});

export const shotChoke = (stage: number) => (c: Ctx, t: number, talking: boolean) => {
  blurGym(c);
  // (the squeeze: it judders as he leans into it)
  const j = stage > 0 && t % 6 < 3 ? 1 : 0;
  c.drawImage(chokeStill(stage), j, 0);
  if (stage > 1) {
    // (the creak: lines off the arm, stars round the G-man's head)
    for (let k = 0; k < 4; k++) { const a = t * 0.15 + (k * Math.PI) / 2; R(c, 129 + Math.cos(a) * 30, 60 + Math.sin(a) * 10, 2, 2, '#fde68a'); }
    if (t % 20 < 10) for (const [x, y] of [[200, 92], [206, 98], [196, 86]]) R(c, x, y, 4, 1, '#fcfcfc');
  }
  // (the G-man's mouth going, if it's him)
  if (talking && t % 8 < 4) R(c, 121 + j, 89 - stage, 11, 3, '#1a0202');
  if (dressed !== 'clean') { flies(c, 220, 30, 18, 3); stink(c, 20, 144, 3, 30, 10); }
};

/** The ticket: held up in his shaking hand, a light from heaven down on it, sparkles. */
const ticketStill = () => painting('m2-ticket-insert', ART_W, ART_H, (p: Painter) => {
  // The hand from the bottom left: the cuff, the fingers pinching the stub
  p.form(g => { g.moveTo(0, 144); g.lineTo(0, 104); g.lineTo(46, 92); g.lineTo(62, 118); g.lineTo(30, 144); g.closePath(); }, { ramp: SUIT, bevel: 10, amb: 0.1, ink: I });
  p.form(g => { g.moveTo(34, 96); g.lineTo(46, 92); g.lineTo(56, 112); g.lineTo(44, 118); g.closePath(); }, { ramp: RAMP.shirt, bevel: 3, amb: 0.3, ink: I });
  p.form(g => { g.ellipse(70, 92, 20, 14, -0.5, 0, Math.PI * 2); }, { ramp: A, bevel: 8, amb: 0.2, ink: I });
  p.form(g => { g.ellipse(82, 74, 7, 12, 0.3, 0, Math.PI * 2); }, { ramp: A, bevel: 4, amb: 0.2, ink: I });
  // The ticket: tilted, the stub perforated, rainbow banded, HAPPY LAND, ALL-DAY PASS, the castle
  p.form(g => { g.save(); g.translate(150, 62); g.rotate(-0.12); g.roundRect(-78, -34, 156, 68, 6); g.restore(); }, { ramp: ['#8a5c08', '#b8820c', '#dca81c', '#f0c840', '#fce07c', '#fff4c0'], bevel: 6, amb: 0.4, ink: I });
});
export const shotTicket = (c: Ctx, t: number) => {
  // (the light from heaven: rays turning, banded gold)
  bands(c, 0, 0, ART_W, ART_H, ['#2a1404', '#3c1e06', '#52280a', '#6c360e', '#52280a', '#3c1e06']);
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2 + t * 0.01;
    c.fillStyle = k % 2 ? 'rgba(252, 220, 120, 0.12)' : 'rgba(252, 240, 180, 0.08)';
    c.beginPath(); c.moveTo(150, 62); c.lineTo(150 + Math.cos(a) * 300, 62 + Math.sin(a) * 300); c.lineTo(150 + Math.cos(a + 0.22) * 300, 62 + Math.sin(a + 0.22) * 300); c.fill();
  }
  for (let r = 5; r >= 1; r--) { c.fillStyle = `rgba(255, 240, 190, ${0.05 * (6 - r)})`; c.beginPath(); c.ellipse(150, 62, r * 22, r * 15, 0, 0, Math.PI * 2); c.fill(); }
  // (his hand's shaking)
  const sx = t % 4 < 2 ? 1 : 0;
  c.save(); c.translate(sx, 0);
  c.drawImage(ticketStill(), 0, 0);
  c.save(); c.translate(150, 62); c.rotate(-0.12);
  // (the rainbow across it)
  const RB = ['#e83c3c', '#f08c28', '#f8d838', '#58c040', '#3c8ce8', '#9050d8'];
  RB.forEach((col, i) => R(c, -70, -26 + i * 3, 104, 3, col));
  dither(c, -70, -8, 104, 2, '#9050d8');
  // (the castle, a silhouette on the right, its flags)
  c.fillStyle = '#7a3ca8';
  c.fillRect(42, -18, 26, 30); c.fillRect(38, -10, 6, 22); c.fillRect(66, -10, 6, 22); c.fillRect(50, -28, 10, 12);
  c.beginPath(); c.moveTo(48, -28); c.lineTo(55, -38); c.lineTo(62, -28); c.fill();
  R(c, 54, -44, 1, 8, '#3c1c58'); R(c, 55, -44, 5, 3, '#e83c3c');
  R(c, 52, 0, 6, 12, '#3c1c58');
  // (the lettering)
  tiny(c, 'HAPPY LAND', -57, -2, '#7a1c1c', 2); tiny(c, 'HAPPY LAND', -58, -3, '#fff8e0', 2);
  tiny(c, 'ALL-DAY PASS', -66, 12, '#5c3c08', 2);
  tiny(c, 'ADMIT ONE', -52, 26, '#8a5c08', 1);
  // (the stub's perforation)
  for (let y = -32; y < 32; y += 4) R(c, 36, y, 1, 2, '#8a5c08');
  c.restore();
  c.restore();
  // (sparkles off it)
  for (let k = 0; k < 7; k++) {
    const ph = (t + k * 13) % 50;
    if (ph > 20) continue;
    const x = 80 + hash(k) * 150, y = 20 + hash(k + 7) * 90, r = ph < 10 ? ph / 2 : (20 - ph) / 2;
    R(c, x - r, y, r * 2 + 1, 1, '#fffbe0'); R(c, x, y - r, 1, r * 2 + 1, '#fffbe0'); R(c, x, y, 1, 1, '#ffffff');
  }
};

/** Him gone to mush: bouncing on his toes, the eyes huge and shining, the blush, hearts and stars round him. `giddy`
 *  0..2: how far gone (the truck tips him over). */
export const shotToddler = (giddy: number) => (c: Ctx, t: number, talking: boolean) => {
  // (pink and yellow, rays turning: a cereal ad)
  bands(c, 0, 0, ART_W, ART_H, ['#f8a8d0', '#f8b8d8', '#fcc8e0', '#fcd8e8', '#fcc8e0', '#f8b8d8']);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + t * (0.01 + giddy * 0.008);
    c.fillStyle = k % 2 ? 'rgba(252, 236, 120, 0.45)' : 'rgba(255, 255, 255, 0.25)';
    c.beginPath(); c.moveTo(128, 64); c.lineTo(128 + Math.cos(a) * 300, 64 + Math.sin(a) * 300); c.lineTo(128 + Math.cos(a + 0.2) * 300, 64 + Math.sin(a + 0.2) * 300); c.fill();
  }
  // (hearts and stars drifting up)
  for (let k = 0; k < 10 + giddy * 4; k++) {
    const x = (hash(k) * ART_W + Math.sin(t * 0.04 + k) * 6) | 0, y = (ART_H + 10 - ((t * (0.6 + hash(k + 3) * 0.6) + k * 23) % (ART_H + 20))) | 0;
    if (k % 2) { c.fillStyle = '#e83c78'; c.beginPath(); c.arc(x - 2, y, 2.5, 0, Math.PI * 2); c.arc(x + 2, y, 2.5, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - 4.5, y + 1); c.lineTo(x, y + 6); c.lineTo(x + 4.5, y + 1); c.fill(); R(c, x - 3, y - 2, 1, 1, '#fff'); }
    else { R(c, x - 3, y, 7, 1, '#fff8c0'); R(c, x, y - 3, 1, 7, '#fff8c0'); R(c, x, y, 1, 1, '#ffffff'); }
  }
  // Him: bouncing on his toes
  const hop = Math.abs(Math.sin(t * (0.18 + giddy * 0.06))) * (4 + giddy * 3);
  c.save(); c.translate(0, Math.round(-hop + 4));
  drawTitleMeathead(c, t, 'stoked', t);
  // (the eyes: huge, wet, shining, two catchlights in each)
  for (const ex of [111, 145]) {
    c.fillStyle = I; c.beginPath(); c.ellipse(ex, 55, 11, 12, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f8f8ff'; c.beginPath(); c.ellipse(ex, 55, 10, 11, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3a2410'; c.beginPath(); c.ellipse(ex, 57, 7, 8.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5c3c1c'; c.beginPath(); c.ellipse(ex, 59, 5, 5.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = I; c.beginPath(); c.ellipse(ex, 57, 3.5, 4.5, 0, 0, Math.PI * 2); c.fill();
    R(c, ex - 5, 50, 4, 4, '#ffffff'); R(c, ex + 2, 59, 2, 2, '#ffffff');
    // (welling up)
    R(c, ex - 9, 64, 18, 1, '#a8e0f8');
  }
  // (the blush, dithered on his cheeks)
  for (const cx of [98, 158]) { c.fillStyle = 'rgba(248, 100, 140, 0.45)'; c.beginPath(); c.ellipse(cx, 70, 9, 5, 0, 0, Math.PI * 2); c.fill(); dither(c, cx - 7, 68, 14, 4, 'rgba(255, 140, 170, 0.6)'); for (let k = 0; k < 3; k++) R(c, cx - 5 + k * 4, 69, 1, 3, '#d0405c'); }
  // (a string of drool, at full giddy)
  if (giddy >= 2) { R(c, 140, 88, 1, 6 + (t % 30) / 5, '#c8e8f8'); R(c, 140, 94 + (t % 30) / 5, 2, 2, '#e8f8ff'); }
  // (the mouth going as he squeals it)
  if (talking && t % 6 < 3) { R(c, 112, 84, 32, 6, '#5a0a0a'); R(c, 120, 88, 16, 2, '#e05060'); }
  c.restore();
  if (dressed !== 'clean') flies(c, 60, 40, 14, 3);
};
