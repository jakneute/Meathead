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
import { painting, rgbOf, type Painter } from '../../../m1/game/scenes/art/raster';
import { flies, stink, shatFront } from '../../../m1/game/scenes/shatLook';
/** His state (the closing's shots draw it: gross.ts too). */
export const shotDress = () => dressed;
import { drawTitleMeathead, drawTitleGlasses, prewarmTitleMeathead, type TitleMood } from '../../title/meathead';
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
export const GLYPH: Record<string, string> = {
  '#': '011111010111110',
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101110100110101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110110101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110',
  ':': '000010000010000', '-': '000000111000000', '.': '000000000000010', '!': '010010010000010', "'": '010010000000000', ' ': '000000000000000', '/': '001001010100100',
};
export const tiny = (c: Ctx, s: string, x: number, y: number, col: string, sc = 1) => {
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

/** Where his joints are in the squat, by frame (0 stood, 1 halfway, 2 rock bottom): side on, facing right, the anchor
 *  between his boots. `at(u, v)`: a point on his torso (u up the spine from the hip, v forward of it). */
const squatPose = (frame: number) => {
  const k = frame / 2;
  const a1 = k * 0.72, a2 = k * 1.45, a3 = k * 0.6;
  const ankle = { x: 0, y: -4 };
  const knee = { x: ankle.x + Math.sin(a1) * 18, y: ankle.y - Math.cos(a1) * 18 };
  const hip = { x: knee.x - Math.sin(a2) * 19, y: knee.y - Math.cos(a2) * 19 };
  const up = { x: Math.sin(a3), y: -Math.cos(a3) }, fwd = { x: Math.cos(a3), y: Math.sin(a3) };
  const at = (u: number, v: number) => ({ x: hip.x + up.x * u + fwd.x * v, y: hip.y + up.y * u + fwd.y * v });
  // (the bar: on his traps, behind his neck)
  return { k, a3, ankle, knee, hip, at, bar: at(25, -3) };
};

type Pt = { x: number; y: number };
const poly = (pts: Pt[]) => (g: Ctx) => { g.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) g.lineTo(p.x, p.y); g.closePath(); };
/** The unit normal of a→b (to the left of it, going along). */
const perp = (a: Pt, b: Pt) => { const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return { x: -dy / l, y: dx / l }; };
const off = (p: Pt, n: Pt, d: number) => ({ x: p.x + n.x * d, y: p.y + n.y * d });

/** Him in the squat, side on, facing right: boots, jeans, the lifting belt, bare and leaning into it, the flat-top, the
 *  near arm back to the bar (the plate goes on over it). Three frames, painted once. */
const squatFig = (frame: number) => figure(`mh2-squat-b${frame}`, 80, 98, 38, 94, q => {
  const { k, a3, ankle, knee, hip, at } = squatPose(frame);
  const BELTR = ['#1e0c04', '#3a1a08', '#5a2a0e', '#7c3e16', '#9c5624', '#b87038'];
  const L = (a: Pt, b: Pt, col: string) => q.line(a.x, a.y, b.x, b.y, col);
  // The boot: the heel, the sole, the toe out front, laced
  q.form(g => { g.moveTo(-5, -10); g.lineTo(3, -10); g.lineTo(5, -6); g.lineTo(11, -4.5); g.bezierCurveTo(13.5, -4, 13.5, -1, 12.5, 0); g.lineTo(-6, 0); g.lineTo(-6, -6); g.closePath(); }, { ramp: BOOT, bevel: 2, amb: 0.22, ink: I });
  q.line(-6, -1, 12, -1, '#3a3a44'); q.px(4, -7, BOOT[4]); q.px(6, -6, BOOT[4]); q.px(8, -5, BOOT[3]); q.px(-4, -8, BOOT[4]);
  // The shin (the calf swelling out behind), up to the knee
  {
    const n = perp(ankle, knee); // (n: the back of the leg)
    const mid = { x: (ankle.x + knee.x) / 2, y: (ankle.y + knee.y) / 2 };
    q.form(poly([off(ankle, n, -4.5), off(ankle, n, 4), off(mid, n, 7), off(knee, n, 5.5), off(knee, n, -5.5), off(mid, n, -4.5)]), { ramp: DENIM, bevel: 3.5, amb: 0.2, ink: I, inkIn: DENIM[0] });
    L(off(ankle, n, -2.5), off(knee, n, -3.5), DENIM[5]);
    L(off(ankle, n, 1), off(knee, n, 1), DENIM[2]);
  }
  // The thigh, thick, the quad bulging up front; the seat round behind; the pocket on it
  {
    const n = perp(knee, hip);
    const mid = { x: (knee.x + hip.x) / 2, y: (knee.y + hip.y) / 2 };
    q.form(poly([off(knee, n, 6), off(mid, n, 9.5), off(hip, n, 8.5), off(hip, n, -8.5), off(mid, n, -8), off(knee, n, -6)]), { ramp: DENIM, bevel: 5, amb: 0.2, ink: I, inkIn: DENIM[0] });
    q.form(g => { g.ellipse(hip.x - 4 - k * 2, hip.y + 1 - k, 9.5, 9, a3, 0, Math.PI * 2); }, { ramp: DENIM, bevel: 5, amb: 0.18, ink: I, inkIn: DENIM[1] });
    // (the seam down the thigh, the light along its top, the crease behind the knee)
    L(off(knee, n, -1), off(hip, n, -1), DENIM[2]);
    L(off(knee, n, -4), off(mid, n, -6), DENIM[6]);
    const pk = { x: Math.round(hip.x - 9 - k * 2), y: Math.round(hip.y - 3) };
    q.line(pk.x, pk.y, pk.x + 6, pk.y + Math.round(k * 2), DENIM[1]); q.line(pk.x, pk.y + 1, pk.x + 1, pk.y + 6, DENIM[1]);
    if (k > 0) L(off(knee, n, 5), off(knee, n, 1), DENIM[0]);
  }
  // The torso: the lats out behind, the chest out front, the traps up to his ears
  q.form(poly([at(0, -7.5), at(8, -9.5), at(15, -13), at(21, -12), at(25, -8.5), at(28.5, -3), at(28.5, 3), at(25.5, 8.5), at(21.5, 13), at(16, 12), at(11, 8.5), at(5, 7.5), at(0, 6.5)]), { ramp: S, bevel: 7, amb: 0.14, ink: I, inkIn: S[1] });
  // (the pec's shelf, the shadow under it; the abs stacked down his front; the serratus; the lat's edge, lit)
  L(at(16.5, 10.5), at(16, 3), S[2]); L(at(17.5, 10), at(17, 4), S[3]);
  L(at(23, 9.5), at(22, 3.5), S[7]); L(at(24, 8), at(23.5, 4), S[6]);
  for (const u of [5, 8.5, 12]) { L(at(u, 7), at(u, 3.5), S[3]); L(at(u + 1, 6.5), at(u + 1, 4), S[6]); }
  for (const u of [12.5, 14.5]) L(at(u, 1.5), at(u - 1.5, -0.5), S[3]);
  L(at(9, -8.5), at(20, -9.5), S[6]); L(at(10, -6.5), at(19, -7.5), S[3]);
  // The lifting belt, wide, cinched, its buckle out front
  q.form(poly([at(0.5, -8.5), at(7, -9), at(7, 8.5), at(0.5, 7.5)]), { ramp: BELTR, bevel: 1.5, amb: 0.3, ink: I });
  L(at(3.8, -8), at(3.8, 7.5), BELTR[4]);
  { const bk = at(4, 7.5); q.form(g => { g.rect(bk.x - 1.5, bk.y - 2.5, 3, 5); }, { ramp: RAMP.gold, bevel: 1.5, ink: '#5c3c00' }); }
  // The neck, a stump, the traps sloping into it; the head square and upright (he looks ahead)
  const hc = { x: at(28, 0).x + 3 + k * 2, y: at(28, 0).y - 9 };
  q.form(poly([at(25, -6), at(29, -4.5), { x: hc.x - 4, y: hc.y + 3 }, { x: hc.x + 4, y: hc.y + 6 }, at(29.5, 5), at(25.5, 6.5)]), { ramp: S, bevel: 3, amb: 0.14, ink: I, inkIn: S[1] });
  q.form(g => { g.moveTo(hc.x - 7, hc.y - 6); g.lineTo(hc.x + 6, hc.y - 6); g.lineTo(hc.x + 7.5, hc.y - 1); g.lineTo(hc.x + 9, hc.y + 1.5); g.lineTo(hc.x + 7.5, hc.y + 2.5); g.lineTo(hc.x + 7.5, hc.y + 6); g.lineTo(hc.x + 4, hc.y + 8.5); g.lineTo(hc.x - 4, hc.y + 8.5); g.lineTo(hc.x - 7, hc.y + 4); g.closePath(); }, { ramp: S, bevel: 3.5, amb: 0.2, ink: I });
  // (the flat-top: dead flat and lit on top, square at the back, the bristles)
  q.form(g => { g.rect(hc.x - 8, hc.y - 12, 15, 7); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.3, ink: I, gain: 1.2 });
  for (let x = Math.round(hc.x - 7); x < hc.x + 6; x++) { q.px(x, Math.round(hc.y - 11), x < hc.x ? '#5a5a68' : '#44444e'); if ((x & 1) === 0) q.line(x, Math.round(hc.y - 9), x, Math.round(hc.y - 6), '#2a2a32'); }
  // (the ear; the brow down; the eye fixed ahead; the nose; the jaw set in a grin; the stubble)
  q.form(g => { g.ellipse(hc.x - 2.5, hc.y + 1, 2, 3, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 1.5, amb: 0.2, ink: I });
  q.px(hc.x - 2, hc.y + 1, S[2]);
  q.line(hc.x + 2, hc.y - 3, hc.x + 6, hc.y - 3, I); q.line(hc.x + 2, hc.y - 4, hc.x + 5, hc.y - 4, I);
  q.px(hc.x + 4, hc.y - 1, I); q.px(hc.x + 5, hc.y - 1, '#f4ece0'); q.px(hc.x + 4, hc.y, S[3]);
  q.px(hc.x + 8, hc.y + 1, S[6]); q.px(hc.x + 7, hc.y + 2, S[3]);
  q.line(hc.x + 3, hc.y + 5, hc.x + 6, hc.y + 4, '#7a1e10'); q.px(hc.x + 5, hc.y + 4, '#f4ecdc'); q.px(hc.x + 4, hc.y + 5, '#f4ecdc');
  for (const [dx, dy] of [[0, 7], [2, 7], [4, 7], [6, 6], [1, 5], [-3, 5], [-1, 6]]) q.px(hc.x + dx, hc.y + dy, '#8c5c30');
  q.line(hc.x - 6, hc.y - 5, hc.x + 5, hc.y - 5, S[7]);
  // The near arm: the upper arm back and down off the shoulder to the elbow, the forearm up to the bar, the fist round it
  const sh = at(22, -1.5), el = at(13, -11), fist = at(24, -6.5);
  q.stroke(g => { g.moveTo(sh.x, sh.y); g.lineTo(el.x, el.y); }, 10, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[1] });
  q.stroke(g => { g.moveTo(el.x, el.y); g.lineTo(fist.x, fist.y); }, 8, { ramp: S, bevel: 3.5, amb: 0.22, ink: I, inkIn: S[2] });
  { const n = perp(sh, el), m = { x: (sh.x + el.x) / 2, y: (sh.y + el.y) / 2 }; L(off(m, n, 3), off(sh, n, 3), S[7]); L(off(el, n, -2), off(m, n, -3), S[2]); }
  L(at(20.5, -8.5), at(21.5, -5), BOOT[2]); L(at(21, -8.5), at(22, -5), BOOT[3]);
  q.form(g => { g.ellipse(fist.x, fist.y, 3.5, 3.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2, amb: 0.25, ink: I });
  // (the delt capped round over the top of it)
  q.form(g => { g.ellipse(sh.x, sh.y + 1, 6, 5.5, a3, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: 0.2, ink: I, inkIn: S[2] });
});
/** Where the bar sits on him, by frame (for the plate in front). */
const barAt = (frame: number) => squatPose(frame).bar;

/** Leg day, wide: the rack, him squatting in it (`k` 0..1 how deep), a drop of sweat at the bottom of each rep. */
const squatter = (c: Ctx, t: number, k: number, x = 104, base = 134) => {
  rack(c, x, base);
  const frame = k < 0.25 ? 0 : k < 0.75 ? 1 : 2;
  // (the bar's shadow on the floor, his)
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(x + 2, base + 1, 18, 2.5, 0, 0, Math.PI * 2); c.fill();
  squatFig(frame)(c, x, base);
  const b = barAt(frame);
  plateFace(c, x + b.x, base + b.y, 9);
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

/** The news's still part, painted once at the big TV's size (196 x 116; the small sets get it shrunk): the studio, the
 *  graphic over her shoulder (his mugshot, the orange jumpsuit, behind bars), the anchor (blazer, pearls, the helmet of
 *  blonde, the smile that's seen it all). Her mouth goes on over it (NEWS_MOUTH). */
const NEWS_W = 196, NEWS_H = 116;
const NEWS_MOUTH = { x: 58, y: 51 };
const newsStill = () => painting('gym2-news', NEWS_W, NEWS_H, (p: Painter) => {
  const W = NEWS_W, H = NEWS_H;
  const SK = ['#4a2418', '#6c3826', '#925236', '#b46e4a', '#d08e64', '#e6ae84', '#f6ceaa'];
  const HAIR = ['#5a3c0c', '#7c5814', '#a07a1e', '#c49c30', '#dcbc50', '#eed67c', '#faf0b8'];
  const BLAZER = ['#2c060c', '#480c18', '#681424', '#8a1e30', '#aa2c40', '#c84458'];
  const MS = ['#2a1006', '#46200e', '#6a3418', '#8c4a24', '#ae6432', '#c87e44', '#dc9a5a', '#ecb878'];
  const JUMP = ['#5a1c04', '#8a3008', '#b8480c', '#dc6418', '#f08834', '#f8ac64'];
  // The graphic, over her shoulder: the box, the height chart, him, the bars
  const gx = 110, gy = 12, gw = 74, gh = 50;
  p.rect(gx - 2, gy - 2, gw + 4, gh + 4, '#0a0e1c'); p.rect(gx - 1, gy - 1, gw + 2, gh + 2, '#e8ecf4');
  for (let y = 0; y < gh; y++) { const band = Math.floor((y / gh) * 4); p.rect(gx, gy + y, gw, 1, ['#8a929e', '#7c8490', '#6e7682', '#626a76'][band]); }
  for (let k = 0; k < 6; k++) { const y = gy + 4 + k * 8; p.rect(gx + 2, y, gw - 4, 1, '#4a525c'); p.rect(gx + 2, y + 1, 4, 1, '#a8b0bc'); }
  // (him: the jumpsuit's shoulders, the neck, the square head, the flat-top, the scowl)
  const fx = gx + gw / 2 - 2;
  p.form(g => { g.moveTo(gx + 6, gy + gh); g.bezierCurveTo(gx + 10, gy + 38, gx + 20, gy + 35, fx, gy + 35); g.bezierCurveTo(fx + 18, gy + 35, gx + gw - 10, gy + 38, gx + gw - 4, gy + gh); g.closePath(); }, { ramp: JUMP, bevel: 6, amb: 0.2, ink: I });
  p.form(g => { g.moveTo(fx - 7, gy + 35); g.lineTo(fx + 7, gy + 35); g.lineTo(fx, gy + 43); g.closePath(); }, { ramp: MS, bevel: 2, amb: 0.2, ink: null });
  p.line(fx - 7, gy + 35, fx, gy + 43, JUMP[1]); p.line(fx + 7, gy + 35, fx, gy + 43, JUMP[1]);
  p.form(g => { g.rect(fx - 6, gy + 29, 12, 8); }, { ramp: MS, bevel: 3, amb: 0.15, ink: I, inkIn: MS[1] });
  p.form(g => { g.moveTo(fx - 9, gy + 12); g.lineTo(fx + 9, gy + 12); g.lineTo(fx + 9, gy + 28); g.lineTo(fx + 6, gy + 32); g.lineTo(fx - 6, gy + 32); g.lineTo(fx - 9, gy + 28); g.closePath(); }, { ramp: MS, bevel: 4, amb: 0.2, ink: I });
  for (const s of [-1, 1]) p.form(g => { g.ellipse(fx + s * 10, gy + 21, 2, 3.5, 0, 0, Math.PI * 2); }, { ramp: MS, bevel: 1.5, amb: 0.2, ink: I });
  p.form(g => { g.rect(fx - 10, gy + 5, 20, 8); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.3, ink: I, gain: 1.2 });
  for (let x = fx - 9; x < fx + 9; x++) { p.px(x, gy + 6, x < fx ? '#5a5a68' : '#44444e'); if ((x & 1) === 0) p.line(x, gy + 8, x, gy + 11, '#2a2a32'); }
  for (const s of [-1, 1]) { p.line(fx + s * 2, gy + 16 + (s < 0 ? 0 : 0), fx + s * 7, gy + 15, I); p.line(fx + s * 2, gy + 17, fx + s * 7, gy + 16, I); p.px(fx + s * 4, gy + 19, I); p.px(fx + s * 4 + (s < 0 ? -1 : 1), gy + 19, '#f4ece0'); }
  p.line(fx, gy + 18, fx - 1, gy + 23, MS[6]); p.line(fx, gy + 23, fx + 1, gy + 23, MS[2]);
  p.line(fx - 4, gy + 27, fx + 4, gy + 27, '#5a1408'); p.px(fx - 4, gy + 26, '#5a1408'); p.px(fx + 4, gy + 26, '#5a1408');
  for (const [dx, dy] of [[-6, 28], [-4, 30], [-1, 30], [2, 30], [5, 29], [-7, 26], [7, 26]]) p.px(fx + dx, gy + dy, MS[2]);
  // (the placard he's holding: his number)
  p.rect(fx - 12, gy + gh - 9, 24, 8, I); p.rect(fx - 11, gy + gh - 8, 22, 6, '#f4f1e4');
  tinyP(p, '00001', fx - 9, gy + gh - 7, '#20242c');
  // (the bars over it all)
  for (let k = 0; k < 6; k++) { const bx = gx + 3 + Math.round(k * (gw - 8) / 5); p.rect(bx - 1, gy, 4, gh, '#14161c'); p.rect(bx, gy, 2, gh, '#5c636e'); p.rect(bx, gy, 1, gh, '#b6bec8'); }
  p.rect(gx, gy + 2, gw, 3, '#14161c'); p.rect(gx, gy + 3, gw, 1, '#868e9a');
  // The anchor: the blazer's shoulders, the blouse, the pearls; the neck, the face; the hair
  const ax = 58, hy = 42;
  p.form(g => { g.moveTo(14, H); g.bezierCurveTo(16, 82, 30, 72, 46, 69); g.lineTo(70, 69); g.bezierCurveTo(86, 72, 100, 82, 102, H); g.closePath(); }, { ramp: BLAZER, bevel: 10, amb: 0.15, ink: I });
  p.form(g => { g.moveTo(48, 69); g.lineTo(68, 69); g.lineTo(58, 90); g.closePath(); }, { ramp: ['#a8a29a', '#c8c2b8', '#e2ddd2', '#f4f0e8', '#fffcf6'], bevel: 4, amb: 0.35, ink: I, inkIn: BLAZER[0] });
  // (the lapels: the blazer folding back, lit along their edge)
  for (const s of [-1, 1]) p.form(g => { g.moveTo(ax + s * 10, 69); g.lineTo(ax + s * 17, 70); g.lineTo(ax + s * 6, 96); g.lineTo(ax + s * 1, 90); g.closePath(); }, { ramp: BLAZER, bevel: 3, amb: s < 0 ? 0.3 : 0.15, ink: I, inkIn: BLAZER[0] });
  p.line(ax - 10, 70, ax - 2, 89, BLAZER[5]);
  p.form(g => { g.moveTo(ax - 6, 58); g.lineTo(ax + 6, 58); g.lineTo(ax + 7, 70); g.lineTo(ax, 74); g.lineTo(ax - 7, 70); g.closePath(); }, { ramp: SK, bevel: 4, amb: 0.15, ink: I, inkIn: SK[1] });
  p.line(ax - 5, 60, ax + 5, 60, SK[1]);
  for (let k = 0; k < 9; k++) { const u = k / 8, x = ax - 7 + u * 14, y = 69 + Math.sin(u * Math.PI) * 4; p.disc(x, y, 1.2, 1.2, '#d8d4cc'); p.px(x - 0.5, y - 0.5, '#ffffff'); }
  // (the hair behind her head: the bob, down to the jaw)
  p.form(g => { g.moveTo(ax - 17, 54); g.bezierCurveTo(ax - 21, 34, ax - 16, 18, ax, 18); g.bezierCurveTo(ax + 16, 18, ax + 21, 34, ax + 17, 54); g.bezierCurveTo(ax + 12, 58, ax - 12, 58, ax - 17, 54); g.closePath(); }, { ramp: HAIR, bevel: 6, amb: 0.25, ink: I, spec: '#fffbe0', wet: 0.6 });
  // (the face: an oval, the jaw soft; the ears tucked under the hair)
  p.form(g => { g.moveTo(ax - 12, hy - 4); g.bezierCurveTo(ax - 12, hy - 18, ax + 12, hy - 18, ax + 12, hy - 4); g.bezierCurveTo(ax + 12, hy + 8, ax + 6, hy + 17, ax, hy + 17); g.bezierCurveTo(ax - 6, hy + 17, ax - 12, hy + 8, ax - 12, hy - 4); g.closePath(); }, { ramp: SK, bevel: 7, amb: 0.2, ink: I, inkIn: HAIR[0] });
  // (the fringe swept across, the shine on it)
  p.form(g => { g.moveTo(ax - 14, hy - 2); g.bezierCurveTo(ax - 15, hy - 22, ax + 15, hy - 24, ax + 15, hy - 4); g.bezierCurveTo(ax + 10, hy - 12, ax - 2, hy - 14, ax - 8, hy - 9); g.bezierCurveTo(ax - 11, hy - 6, ax - 12, hy - 4, ax - 14, hy - 2); g.closePath(); }, { ramp: HAIR, bevel: 5, amb: 0.3, ink: I, spec: '#fffbe0', wet: 0.7 });
  p.line(ax - 8, hy - 16, ax + 6, hy - 17, HAIR[6]); p.line(ax - 6, hy - 11, ax + 8, hy - 13, HAIR[2]);
  // (the brows, the eyes: lashes, blue shadow, the whites, the irises; the nose; the cheeks rouged; the earrings)
  for (const s of [-1, 1]) {
    const ex = ax + s * 5.5;
    p.line(ex - 3, hy - 6, ex + 3, hy - 6 - (s < 0 ? 1 : 0) + (s < 0 ? 0 : 0), HAIR[1]);
    p.rect(ex - 3, hy - 4, 6, 1, '#6c88c8');
    p.rect(ex - 2, hy - 3, 5, 2, '#f8f4ee'); p.rect(ex - 1 + (s < 0 ? 0 : 0), hy - 3, 2, 2, '#2c5aa8'); p.px(ex - 1, hy - 3, '#0a0e1c');
    p.line(ex - 3, hy - 3, ex + 3, hy - 4, I); p.px(ex + (s < 0 ? -3 : 3), hy - 4, I);
    p.disc(ex, hy + 4, 3, 1.5, '#e07872', 0.55);
    p.disc(ax + s * 13, hy + 6, 1.5, 1.5, RAMP.gold[4]); p.px(ax + s * 13 - 0.5, hy + 5.5, '#fffbe0');
  }
  p.line(ax + 1, hy - 1, ax + 1, hy + 4, SK[3]); p.px(ax, hy + 5, SK[2]); p.px(ax + 2, hy + 5, SK[2]); p.px(ax - 1, hy + 2, SK[6]);
  // (the lips: lipstick, the smile)
  p.line(ax - 4, hy + 9, ax + 4, hy + 9, '#9c1c34'); p.px(ax - 5, hy + 8, '#9c1c34'); p.px(ax + 5, hy + 8, '#9c1c34');
  p.line(ax - 3, hy + 10, ax + 3, hy + 10, '#c8384c'); p.px(ax - 1, hy + 10, '#e87080');
  // The desk across the bottom: glossy, the network's stripe
  p.form(g => { g.rect(0, H - 30, W * 0.62, 30); }, { ramp: ['#0a1430', '#122048', '#1a2c60', '#243a78', '#34508e'], bevel: 3, amb: 0.3, ink: I });
  p.rect(0, H - 30, Math.round(W * 0.62), 1, '#6c88c8'); p.rect(0, H - 26, Math.round(W * 0.62), 2, '#b01818');
}, g => {
  // (the studio: the blue, the skyline backdrop, its lit windows, the spotlights)
  bands(g, 0, 0, NEWS_W, NEWS_H, ['#081440', '#0a1a4c', '#0e2260', '#122a74', '#183488', '#1e3e9a']);
  for (let k = 0; k < 11; k++) {
    const bw = NEWS_W / 11, top = Math.round(NEWS_H * 0.22 + hash(k) * NEWS_H * 0.22);
    g.fillStyle = '#0a143a'; g.fillRect(Math.round(k * bw), top, Math.ceil(bw) - 1, NEWS_H);
    g.fillStyle = '#16204c'; g.fillRect(Math.round(k * bw), top, 1, NEWS_H);
    for (let j = 0; j < 8; j++) if (hash(k * 9 + j) > 0.45) { g.fillStyle = hash(k + j * 3) > 0.7 ? '#f8e8a0' : '#c89c40'; g.fillRect(Math.round(k * bw) + 2 + (j % 2) * 5, top + 4 + Math.floor(j / 2) * 6, 2, 3); }
  }
  for (let r = 4; r >= 1; r--) { g.fillStyle = `rgba(120, 160, 255, ${0.05 * (5 - r)})`; g.beginPath(); g.ellipse(58, 40, r * 14, r * 12, 0, 0, Math.PI * 2); g.fill(); }
});

/** The 3x5 font, onto a Painter. */
const tinyP = (p: Painter, s: string, x: number, y: number, col: string) => {
  [...s.toUpperCase()].forEach((ch, i) => { const gl = GLYPH[ch] ?? GLYPH[' ']; for (let k = 0; k < 15; k++) if (gl[k] === '1') p.px(x + i * 4 + (k % 3), y + Math.floor(k / 3), col); });
};

/** The news on it: the painted still (the anchor `talking`, the graphic), the lower third, the ticker, the logo, the
 *  scanlines. Small sets (the wide shots) get it shrunk and leave the words off (too small to read). */
export const newsPicture = (c: Ctx, x: number, y: number, w: number, h: number, t: number, talking: boolean) => {
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  const big = w >= 150, s = w / NEWS_W;
  c.imageSmoothingEnabled = !big;
  c.drawImage(newsStill(), x, y, w, h);
  c.imageSmoothingEnabled = false;
  if (big && talking && t % 10 < 5) { R(c, x + NEWS_MOUTH.x - 3, y + NEWS_MOUTH.y - 1, 7, 3, '#4a0a14'); R(c, x + NEWS_MOUTH.x - 2, y + NEWS_MOUTH.y - 1, 5, 1, '#f8f0e8'); R(c, x + NEWS_MOUTH.x - 3, y + NEWS_MOUTH.y + 2, 7, 1, '#c8384c'); }
  // The lower third: GUANTANAMO BAY, DAY 400; the ticker under it
  const ly = y + h - Math.round(22 * s);
  bands(c, x, ly, w, Math.round(12 * s), ['#d02020', '#b81818', '#a01414', '#881010']);
  R(c, x, ly, w, Math.max(1, Math.round(s)), '#f87070');
  R(c, x, ly + Math.round(12 * s), w, Math.round(10 * s), '#f8fafc');
  R(c, x, ly + Math.round(12 * s), w, Math.max(1, Math.round(s)), '#a8b0bc');
  if (big) {
    R(c, x, ly, 34, 12, '#f8fafc'); tiny(c, 'LIVE', x + 3, ly + 4, '#b01818'); R(c, x + 21, ly + 5, 3, 3, '#e01818');
    tiny(c, 'GUANTANAMO BAY: DAY 400', x + 40, ly + 4, '#000000'); tiny(c, 'GUANTANAMO BAY: DAY 400', x + 39, ly + 3, '#ffffff');
    const tick = 'PRESIDENT KILLER STILL MISERABLE ... HAPPY LAND RECORD ATTENDANCE ... GAS UP 40 CENTS ... ';
    c.save(); c.beginPath(); c.rect(x, ly + 12, w, 10); c.clip();
    tiny(c, tick + tick, x - ((t * 1.2) % (tinyW(tick) + 1)), ly + 15, '#0a1a4a');
    c.restore();
    // (the logo in the corner)
    R(c, x + 4, y + 4, 21, 10, '#0a0e1c'); R(c, x + 5, y + 5, 19, 8, '#f8fafc'); R(c, x + 5, y + 11, 19, 2, '#b01818'); tiny(c, 'MNN', x + 9, y + 6, '#0a1a4a');
  }
  // Scanlines, a roll of brighter lines down it
  c.fillStyle = 'rgba(0,0,0,0.2)'; for (let yy = y; yy < y + h; yy += 2) c.fillRect(x, yy, w, 1);
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

/** His hand up into the shot from the bottom: the sleeve, the cuff, the fist, one finger up for the key ring. */
const keysHand = () => painting('m2-keys-hand', ART_W, ART_H, (p: Painter) => {
  p.form(g => { g.moveTo(164, 144); g.lineTo(168, 128); g.lineTo(196, 126); g.lineTo(200, 144); g.closePath(); }, { ramp: SUIT, bevel: 6, amb: 0.12, ink: I });
  p.line(169, 129, 172, 143, SUIT[5]);
  p.form(g => { g.moveTo(169, 122); g.lineTo(195, 120); g.lineTo(196, 128); g.lineTo(168, 130); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2.5, amb: 0.3, ink: I });
  p.rect(190, 123, 2, 2, '#9a9aa8');
  p.form(g => { g.roundRect(171, 106, 22, 18, 6); }, { ramp: A, bevel: 6, amb: 0.2, ink: I });
  // (the curled fingers' knuckles across it, the thumb tucked over them)
  for (let k = 0; k < 3; k++) { p.form(g => { g.ellipse(174 + k * 6, 110, 3.4, 3.8, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 2, amb: 0.22, ink: I, inkIn: A[1] }); p.px(173 + k * 6, 108, A[5]); }
  p.form(g => { g.moveTo(171, 116); g.bezierCurveTo(176, 112, 184, 113, 189, 116); g.lineTo(188, 119); g.bezierCurveTo(182, 117, 176, 118, 172, 120); g.closePath(); }, { ramp: A, bevel: 2.5, amb: 0.25, ink: I, inkIn: A[1] });
  // (the finger up, the nail)
  p.form(g => { g.roundRect(181, 95, 6, 16, 3); }, { ramp: A, bevel: 2.5, amb: 0.22, ink: I, inkIn: A[1] });
  p.rect(182, 96, 4, 3, A[5]); p.line(182, 104, 186, 104, A[2]);
});

/** The agent up close (Meathead 1's: the shades, the earpiece, the gym behind him), talking. */
export const shotAgent = (keys = false) => (c: Ctx, t: number, talking: boolean) => {
  drawAgent(c, t, talking, 'gym');
  if (keys) {
    // (the truck's keys, dangled up into the shot off one finger, swinging)
    const sw = Math.round(Math.sin(t * 0.12) * 4);
    c.drawImage(keysHand(), 0, 0);
    // (the ring round his finger, the two keys and the fob swinging off it)
    c.strokeStyle = I; c.lineWidth = 3; c.beginPath(); c.arc(183.5 + sw * 0.3, 104.5, 5, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#c8c8d0'; c.lineWidth = 1.5; c.beginPath(); c.arc(183.5 + sw * 0.3, 104.5, 5, 0, Math.PI * 2); c.stroke();
    R(c, 181 + sw * 0.3, 99, 2, 1, '#ffffff');
    for (const [dx, dy] of [[-5, 10], [5, 12]]) {
      const kx = 183 + sw + dx, ky = 106 + dy;
      R(c, kx - 3, ky - 3, 7, 6, I); R(c, kx - 2, ky - 2, 5, 4, '#b8b8c4'); R(c, kx - 2, ky - 2, 4, 1, '#f4f4fa'); R(c, kx, ky - 1, 1, 1, I);
      R(c, kx - 1, ky + 3, 3, 10, I); R(c, kx, ky + 3, 1, 9, '#e4e4ec'); R(c, kx + 1, ky + 6, 2, 1, I); R(c, kx + 1, ky + 9, 2, 2, I); R(c, kx + 1, ky + 9, 1, 1, '#b8b8c4');
    }
    R(c, 169 + sw, 113, 12, 16, I); slab(c, 170 + sw, 114, 10, 14, ['#0c0c10', '#18181e', '#24242c', '#30303a', '#44444e'], { b: 1 });
    R(c, 171 + sw, 115, 8, 5, '#1c2a5c'); R(c, 171 + sw, 115, 3, 3, '#e8e8f0'); for (let k = 0; k < 2; k++) R(c, 174 + sw, 116 + k * 2, 5, 1, '#b01818');
    tiny(c, 'US', 172 + sw, 122, '#e8e8f0');
  }
  if (dressed === 'shitty') { flies(c, 70, 110, 14, 2); stink(c, 40, 140, 3, 26, 9); }
};

/** Her up close: the shades, the bun, the earpiece, the clipboard up, the gym behind her out of focus. */
const agentFStill = (dress: string) => painting(`m2-agentf-close-${dress}`, ART_W, ART_H, p => {
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
  // (the brows over the shades, arched and unimpressed; the lenses' shine; the jaw's shadow; the nose's bridge lit)
  for (const s of [-1, 1]) { const bx = 128 + s * 13; p.line(bx - 8, 44 + (s < 0 ? 1 : 0), bx + 8, 44 + (s < 0 ? 0 : 1), HAIR[1]); p.line(bx - 6, 43, bx + 6, 43, HAIR[0]); }
  for (const lx of [106, 132]) { p.line(lx + 3, 50, lx + 8, 50, '#4a4a6a'); p.px(lx + 2, 51, '#6a6a8c'); }
  p.line(110, 82, 120, 92, AFC[2]); p.line(146, 82, 136, 92, AFC[2]);
  p.line(127, 62, 127, 70, AFC[6]);
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
  // (the state of him, from her side of it: painted in with her, so it sits right)
  if (dress === 'shitty') {
    // her left hand up from the bottom right, pinching her nostrils shut; the mouth left clear under it
    p.form(g => { g.moveTo(196, 150); g.lineTo(150, 82); g.lineTo(162, 74); g.lineTo(222, 150); g.closePath(); }, { ramp: SUIT, bevel: 6, amb: 0.15, ink: I });
    p.form(g => { g.rect(148, 70, 12, 12); }, { ramp: SH, bevel: 3, amb: 0.3, ink: I });
    p.form(g => { g.ellipse(142, 72, 10, 8, -0.3, 0, Math.PI * 2); }, { ramp: AFC, bevel: 5, amb: 0.2, ink: I });
    // (the forefinger over the bridge of the nose, the thumb under the nostrils, squeezing)
    p.form(g => { g.ellipse(131, 68, 8, 3, -0.15, 0, Math.PI * 2); }, { ramp: AFC, bevel: 2, amb: 0.25, ink: I });
    p.form(g => { g.ellipse(132, 76, 7, 3, 0.1, 0, Math.PI * 2); }, { ramp: AFC, bevel: 2, amb: 0.25, ink: I });
    p.line(139, 69, 141, 75, AFC[2]); p.px(125, 68, AFC[7]);
    // (the brows pinched in disgust over the shades)
    p.line(118, 42, 124, 45, HAIR[0]); p.line(132, 45, 138, 42, HAIR[0]);
  } else if (dress === 'nude') {
    // her right hand up at the side of her face, flat, blinkering the view; the sleeve down past the clipboard
    p.form(g => { g.moveTo(54, 150); g.lineTo(86, 92); g.lineTo(102, 96); g.lineTo(78, 150); g.closePath(); }, { ramp: SUIT, bevel: 6, amb: 0.15, ink: I });
    p.form(g => { g.rect(86, 84, 16, 12); }, { ramp: SH, bevel: 3, amb: 0.3, ink: I });
    p.form(g => { g.moveTo(87, 86); g.lineTo(86, 46); g.bezierCurveTo(86, 30, 100, 30, 100, 44); g.lineTo(102, 86); g.closePath(); }, { ramp: AFC, bevel: 6, amb: 0.2, ink: I });
    // (the fingers together, the thumb tucked in front)
    for (const fx of [90, 94, 98]) p.line(fx, 36, fx, 56, AFC[2]);
    p.form(g => { g.ellipse(100, 70, 3, 8, 0.2, 0, Math.PI * 2); }, { ramp: AFC, bevel: 2, amb: 0.25, ink: I });
  }
});
export const shotAgentF = (c: Ctx, t: number, talking: boolean) => {
  gymBg(c); c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, ART_W, ART_H);
  c.drawImage(agentFStill(dressed), 0, 0);
  // (a glint across the shades)
  const g = (t * 2) % 140;
  if (g < 26) for (let y = 49; y < 60; y++) { const x = 104 + g + Math.round((60 - y) * 0.5); if (x < 152) R(c, x, y, 1, 1, '#c8c8dc'); }
  if (talking && t % 10 < 5) { R(c, 121, 81, 14, 4, '#3a0606'); R(c, 122, 81, 12, 1, '#e8e0d0'); }
  // (the state of him, from her side of it: shat, she's pinching her nose (in the painting) and the stink's reached her;
  // naked, a hand up by her face so she doesn't have to look (in the painting))
  if (dressed === 'shitty') { stink(c, 40, 144, 4, 40, 14); flies(c, 70, 100, 14, 2); }
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

export const shotMeathead = (mood: TitleMood, red = 0, glasses = false) => (c: Ctx, t: number, talking: boolean) => {
  blurGym(c, red > 0 ? Math.min(red, 0.4 + 0.3 * Math.sin(t * 0.3)) : 0);
  drawTitleMeathead(c, t, mood, t, glasses);
  // (his mouth going as he says it: the jaw's working)
  if (talking && t % 8 < 4 && mood === 'dumb') { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  if (dressed === 'shitty') { flies(c, 60, 120, 16, 3); stink(c, 200, 140, 3, 30, 10); }
};

// ---------------------------------------------------------------------------------------------------------------
// The closing: through the door, the chokehold, the ticket, the toddler

/** Him standing (mhStandingFig, feet at x, base) with his jeans blown off (the gut's blowout: naked from the waist, the
 *  boots still on): bare legs, lit down the left, hairy; the bush; swinging free. */
const nakedLegs = (c: Ctx, x: number, base: number) => {
  for (const s of [-1, 1]) {
    const l = s < 0 ? x - 9 : x + 1;
    R(c, l - 1, base - 30, 10, 26, I);
    R(c, l, base - 29, 8, 25, S[4]); R(c, l, base - 29, 2, 25, S[s < 0 ? 6 : 5]); R(c, l + 6, base - 29, 2, 25, S[3]);
    R(c, l + 2, base - 16, 4, 1, S[3]);
    for (let k = 0; k < 5; k++) R(c, l + 2 + (k % 3) * 2, base - 26 + k * 4, 1, 1, '#5a3418');
  }
  R(c, x - 10, base - 31, 20, 3, S[4]); R(c, x - 10, base - 31, 20, 1, S[6]);
  R(c, x - 3, base - 30, 6, 3, '#3a2010');
  R(c, x - 1, base - 27, 3, 5, S[3]); R(c, x - 2, base - 24, 5, 3, S[2]);
};

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
  if (dressed === 'shitty') { shatFront(c, 120, 136); stink(c, 120, 112, 3, 22, 8); flies(c, 120, 100, 10, 2, 0.6); }
  else if (dressed === 'nude') nakedLegs(c, 120, 136);
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
  // (the light along the top of the forearm, the shadow under it, the ridge of the muscle down it)
  p.line(100, ay - 10, 190, ay - 11, MS[7]); p.line(104, ay - 9, 186, ay - 10, MS[6]);
  p.line(100, ay + 8, 192, ay + 11, MS[2]);
  for (let x = 120; x < 180; x += 3) p.px(x, ay - 3 + Math.round(Math.sin(x * 0.05) * 1.5), MS[4]);
  // The fist on the end of it, locking it in: knuckles to us, the fingers curled, the thumb over the top
  p.form(g => { g.roundRect(54, ay - 12, 32, 28, 9); }, { ramp: MS, bevel: 8, amb: 0.2, ink: I });
  for (let k = 0; k < 4; k++) {
    const fy = ay - 9 + k * 6.5;
    p.form(g => { g.ellipse(60, fy + 3, 7.5, 3.6, 0.08, 0, Math.PI * 2); }, { ramp: MS, bevel: 3, amb: 0.22, ink: I, inkIn: MS[1] });
    p.px(56, fy + 1, MS[7]); p.px(57, fy + 1, MS[7]); p.line(55, fy + 6, 64, fy + 6, MS[1]);
  }
  p.form(g => { g.moveTo(60, ay - 14); g.bezierCurveTo(70, ay - 18, 86, ay - 16, 90, ay - 9); g.lineTo(86, ay - 5); g.bezierCurveTo(80, ay - 9, 70, ay - 10, 62, ay - 8); g.closePath(); }, { ramp: MS, bevel: 3.5, amb: 0.22, ink: I, inkIn: MS[1] });
  p.line(64, ay - 13, 82, ay - 14, MS[7]); p.form(g => { g.ellipse(87, ay - 9, 3, 2.5, 0.4, 0, Math.PI * 2); }, { ramp: ['#8c4a24', '#c88a6a', '#e8b8a0', '#f8dcc8'], bevel: 1.5, amb: 0.3, ink: MS[1] });
  // (the G-man's hands clawing at the forearm: the palms under it, the fingers hooked up over it)
  for (const hx of [120, 156]) {
    p.form(g => { g.ellipse(hx, ay + 15, 9, 6.5, 0, 0, Math.PI * 2); }, { ramp: F, bevel: 4, amb: 0.2, ink: I });
    for (let k = 0; k < 4; k++) {
      const fx0 = hx - 7 + k * 4.6, sp = (k - 1.5) * 0.8;
      p.form(p.strokeMask(g => { g.moveTo(fx0, ay + 13); g.quadraticCurveTo(fx0 + sp, ay + 5, fx0 + sp + 2.5, ay + 1); }, 4.6), { ramp: F, bevel: 2, amb: 0.25, ink: I, inkIn: F[1] });
      p.px(fx0 + sp + 2, ay + 1, '#f4e4d8'); p.px(fx0 + sp - 1, ay + 7, F[5]);
    }
    p.line(hx - 7, ay + 18, hx + 6, ay + 18, F[1]);
  }
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
  if (dressed === 'shitty') { flies(c, 220, 30, 18, 3); stink(c, 20, 144, 3, 30, 10); }
};

/** The ticket: held up in his shaking hand, a light from heaven down on it, sparkles. */
const ticketStill = () => painting('m2-ticket-insert', ART_W, ART_H, (p: Painter) => {
  // The hand from the bottom left: the sleeve, the shirt cuff, the back of the hand, the fingers curled round the
  // ticket's edge (behind it), the thumb pressed on its face (in front)
  p.form(g => { g.moveTo(0, 144); g.lineTo(0, 112); g.lineTo(34, 100); g.lineTo(52, 124); g.lineTo(38, 144); g.closePath(); }, { ramp: SUIT, bevel: 10, amb: 0.1, ink: I });
  p.line(4, 116, 32, 104, SUIT[5]);
  p.form(g => { g.moveTo(30, 102); g.lineTo(40, 97); g.lineTo(55, 117); g.lineTo(47, 124); g.closePath(); }, { ramp: RAMP.shirt, bevel: 3, amb: 0.3, ink: I });
  p.rect(44, 110, 2, 2, '#c8c8d0');
  p.form(g => { g.ellipse(58, 104, 16, 12, -0.7, 0, Math.PI * 2); }, { ramp: A, bevel: 7, amb: 0.2, ink: I });
  for (const [fx, fy] of [[71, 101], [69, 109], [64, 116]]) { p.form(g => { g.ellipse(fx, fy, 6.5, 4.2, -0.35, 0, Math.PI * 2); }, { ramp: A, bevel: 3, amb: 0.22, ink: I, inkIn: A[1] }); p.px(fx - 3, fy - 2, A[5]); }
  p.form(g => { g.ellipse(72, 90, 7.5, 5, -0.45, 0, Math.PI * 2); }, { ramp: A, bevel: 3, amb: 0.22, ink: I, inkIn: A[1] });
  p.line(50, 96, 62, 92, A[5]); p.line(52, 112, 60, 108, A[1]);
  // The ticket: tilted, gold foil, the stub perforated
  const TK = (draw: (g: Ctx) => void) => (g: Ctx) => { g.save(); g.translate(150, 62); g.rotate(-0.12); draw(g); g.restore(); };
  p.form(TK(g => g.roundRect(-78, -34, 156, 68, 6)), { ramp: ['#8a5c08', '#b8820c', '#dca81c', '#f0c840', '#fce07c', '#fff4c0'], bevel: 6, amb: 0.4, ink: I });
  // (the castle on the stub: the keep, its towers, the spires, the gate; lit from the left)
  const CASTLE = ['#2c1044', '#46206a', '#60308e', '#7c44b0', '#9c64cc', '#c090e4'], ROOF = ['#5a0c18', '#8a1424', '#b82034', '#dc3c4c', '#f46c78'];
  p.form(TK(g => { g.rect(43, -16, 24, 28); g.rect(36, -11, 9, 23); g.rect(65, -11, 9, 23); g.rect(49, -29, 12, 14); }), { ramp: CASTLE, bevel: 3, amb: 0.25, ink: '#2c1044' });
  p.form(TK(g => { for (const [cx, w, top, base] of [[40.5, 6, -21, -11], [69.5, 6, -21, -11], [55, 8, -43, -29]]) { g.moveTo(cx - w, base); g.lineTo(cx, top); g.lineTo(cx + w, base); g.closePath(); } }), { ramp: ROOF, bevel: 2.5, amb: 0.25, ink: '#3a0610' });
  const rot = (x: number, y: number): [number, number] => { const cs = Math.cos(-0.12), sn = Math.sin(-0.12); return [150 + x * cs - y * sn, 62 + x * sn + y * cs]; };
  for (let k = 0; k < 6; k++) { const [x, y] = rot(43 + k * 4 + 1, -17); p.rect(x, y, 2, 2, CASTLE[3]); }
  for (const [x0, y0] of [[52, -24], [57, -24], [39, -6], [68, -6], [47, -8], [61, -8]]) { const [x, y] = rot(x0, y0); p.rect(x, y, 2, 3, '#1c0830'); p.px(x, y, '#f8d860'); }
  for (let yy = 2; yy < 12; yy++) for (let xx = 51; xx < 59; xx++) { if (yy < 5 && Math.hypot(xx - 54.5, yy - 5) > 3.6) continue; const [x, y] = rot(xx, yy); p.px(x, y, '#1c0830'); }
  // (the thumb, pressed flat on its face, the nail)
  p.form(p.strokeMask(g => { g.moveTo(60, 92); g.quadraticCurveTo(68, 84, 78, 80); }, 8), { ramp: A, bevel: 3, amb: 0.22, ink: I });
  p.form(g => { g.ellipse(77, 80, 3, 2.4, -0.4, 0, Math.PI * 2); }, { ramp: ['#a47a58', '#d8b49a', '#f0d4c0', '#fcece0'], bevel: 1.5, amb: 0.3, ink: A[1] });
  p.line(63, 87, 71, 82, A[5]);
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
  // (the flags on the castle's spires, flapping; the castle's painted on the ticket)
  for (const [fx, fy] of [[55, -42], [40, -20], [70, -20]]) { R(c, fx, fy - 6, 1, 6, '#3c1c58'); R(c, fx + 1, fy - 6, 4 + (Math.floor(t / 8 + fx) % 2), 2, '#e83c3c'); R(c, fx + 1, fy - 4, 3, 1, '#a01c1c'); }
  // (the lettering)
  tiny(c, 'HAPPY LAND', -57, -2, '#7a1c1c', 2); tiny(c, 'HAPPY LAND', -58, -3, '#fff8e0', 2);
  tiny(c, 'ALL-DAY PASS', -66, 12, '#5c3c08', 2);
  tiny(c, 'ADMIT ONE', -52, 26, '#8a5c08', 1);
  // (the stub's perforation)
  for (let y = -32; y < 32; y += 4) R(c, 36, y, 1, 2, '#8a5c08');
  c.restore();
  c.restore();
  // (shat: the stink coming up into the light, flies at the hand holding it out)
  if (dressed === 'shitty') { stink(c, 230, 144, 4, 50, 14); flies(c, 50, 100, 14, 3); }
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
export const shotToddler = (giddy: number, glasses = false) => (c: Ctx, t: number, talking: boolean) => {
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
  drawTitleMeathead(c, t, 'stoked', t, false);
  // (the eyes: huge, wet, shining, two catchlights in each; behind the glasses, blown up to fill the lenses)
  const ey = glasses ? 58 : 55, sy = glasses ? 0.7 : 1;
  for (const ex of [111, 145]) {
    c.fillStyle = I; c.beginPath(); c.ellipse(ex, ey, 11, 12 * sy, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#f8f8ff'; c.beginPath(); c.ellipse(ex, ey, 10, 11 * sy, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3a2410'; c.beginPath(); c.ellipse(ex, ey + 2 * sy, 7, 8.5 * sy, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#5c3c1c'; c.beginPath(); c.ellipse(ex, ey + 4 * sy, 5, 5.5 * sy, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = I; c.beginPath(); c.ellipse(ex, ey + 2 * sy, 3.5, 4.5 * sy, 0, 0, Math.PI * 2); c.fill();
    R(c, ex - 5, ey - 5 * sy, 4, 4, '#ffffff'); R(c, ex + 2, ey + 4 * sy, 2, 2, '#ffffff');
    // (welling up)
    R(c, ex - 9, ey + 9 * sy, 18, 1, '#a8e0f8');
  }
  if (glasses) drawTitleGlasses(c);
  // (the blush, dithered on his cheeks)
  for (const cx of [98, 158]) { c.fillStyle = 'rgba(248, 100, 140, 0.45)'; c.beginPath(); c.ellipse(cx, 70, 9, 5, 0, 0, Math.PI * 2); c.fill(); dither(c, cx - 7, 68, 14, 4, 'rgba(255, 140, 170, 0.6)'); for (let k = 0; k < 3; k++) R(c, cx - 5 + k * 4, 69, 1, 3, '#d0405c'); }
  // (a string of drool, at full giddy)
  if (giddy >= 2) { R(c, 140, 88, 1, 6 + (t % 30) / 5, '#c8e8f8'); R(c, 140, 94 + (t % 30) / 5, 2, 2, '#e8f8ff'); }
  // (the mouth going as he squeals it)
  if (talking && t % 6 < 3) { R(c, 112, 84, 32, 6, '#5a0a0a'); R(c, 120, 88, 16, 2, '#e05060'); }
  c.restore();
  if (dressed === 'shitty') { flies(c, 60, 40, 14, 3); stink(c, 60, 144, 4, 40, 12); stink(c, 200, 144, 3, 34, 12); }
};

// ---------------------------------------------------------------------------------------------------------------
// The disguise: the public thinks he's in Guantanamo, so the agent hands him a pair of thick black nerd glasses

/** The glasses, close: held up by one arm in the agent's hand (in from the bottom left), the rims huge and glossy, the
 *  glass catching the light, a government property tag hung off the bridge. Painted once. */
const GL_FRAME = ['#020204', '#07070b', '#101016', '#1a1a24', '#282836', '#3c3c50', '#5a5a74', '#7c7c9c'];
/** A cheap ordered threshold (0..1) for the dithers in here. */
const bayerish = (x: number, y: number) => [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5][(y & 3) * 4 + (x & 3)] / 16;
/** A light on see-through glass: the colour put down outright, at least `a` opaque (a blend would keep the glass's
 *  faint alpha and lose the streak). */
const onGlass = (p: Painter, x: number, y: number, col: string, a: number) => {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= p.w || y >= p.h) return;
  const o = (y * p.w + x) * 4, c = rgbOf(col);
  p.d[o] = c[0]; p.d[o + 1] = c[1]; p.d[o + 2] = c[2]; p.d[o + 3] = Math.max(p.d[o + 3], Math.round(255 * a));
};
const glassesInsertStill = () => painting('m2-glasses-insert', ART_W, ART_H, (p: Painter) => {
  const rims = [{ x0: 70, x1: 136 }, { x0: 144, x1: 210 }], y0 = 38, y1 = 86;
  // The far arm, back off the right hinge (foreshortened: going away from us, thinner), its tip curled down
  p.form(p.strokeMask(g => { g.moveTo(206, 48); g.lineTo(230, 34); g.quadraticCurveTo(236, 31, 238, 38); }, 4), { ramp: GL_FRAME, bevel: 1.5, amb: 0.25, ink: I });
  // The near arm, down off the left hinge to his fingers
  p.form(p.strokeMask(g => { g.moveTo(74, 50); g.lineTo(48, 86); g.quadraticCurveTo(44, 92, 46, 98); }, 6), { ramp: GL_FRAME, bevel: 2, amb: 0.25, ink: I, spec: '#dcdcf4', wet: 0.6 });
  // (the glass: a cold tint, see-through)
  for (const r of rims) for (let y = y0 + 7; y < y1 - 5; y++) for (let x = r.x0 + 7; x < r.x1 - 6; x++) p.px(x, y, (x + y) & 1 ? '#c4dcf0' : '#d8e8f8', 0.22);
  // The rims: thick acetate, the brow bar heavy across the top, the corners eased; the keyhole bridge
  const outer = p.mask(g => { for (const r of rims) g.roundRect(r.x0, y0, r.x1 - r.x0, y1 - y0, 10); g.rect(132, 46, 16, 10); });
  const inner = p.mask(g => { for (const r of rims) g.roundRect(r.x0 + 7, y0 + 8, r.x1 - r.x0 - 13, y1 - y0 - 13, 6); g.moveTo(136, 56); g.quadraticCurveTo(140, 50, 144, 56); g.closePath(); });
  p.form(p.minus(outer, inner), { ramp: GL_FRAME, bevel: 4, amb: 0.25, ink: I, spec: '#f0f0ff', wet: 0.85 });
  for (const r of rims) {
    // (the bar's top lit hard, a stepped shine; the hinge's two studs)
    for (let x = r.x0 + 8; x < r.x1 - 8; x++) { p.px(x, y0 + 1, GL_FRAME[6]); if ((x & 1) === 0) p.px(x, y0 + 2, GL_FRAME[5]); }
    p.rect(r.x0 + 6, y0 + 2, 10, 2, GL_FRAME[7]);
    const hx = r.x0 < 140 ? r.x0 + 2 : r.x1 - 5;
    for (const hy of [44, 50]) { p.rect(hx, hy, 3, 3, '#8a8aa0'); p.px(hx, hy, '#ffffff'); p.px(hx + 2, hy + 2, '#3a3a4c'); }
    // (the light streaked across the glass: a broad band and a thin one; the gold light dithered in low on the far side)
    for (let k = 0; k < 26; k++) {
      const x = r.x0 + 12 + k, y = y0 + 34 - k;
      for (let w = 0; w < 5; w++) onGlass(p, x + w, y, '#ffffff', w < 3 ? 0.6 : 0.3);
      if (k > 4 && k < 18) { onGlass(p, x + 10, y + 3, '#ffffff', 0.55); onGlass(p, x + 11, y + 3, '#ffffff', 0.3); }
    }
    for (let y = y1 - 16; y < y1 - 7; y++) for (let x = r.x1 - 22; x < r.x1 - 8; x++) if (bayerish(x, y) < 0.3) onGlass(p, x, y, '#fff4c0', 0.45);
  }
  // The tag off the bridge on its string: GOVT ISSUE
  p.line(140, 56, 142, 74, '#c8c0a0'); p.line(141, 56, 143, 74, '#8a8268');
  p.form(g => { g.save(); g.translate(144, 84); g.rotate(0.18); g.roundRect(-14, -9, 28, 18, 2); g.restore(); }, { ramp: ['#a8a088', '#c8c0a4', '#e0d8bc', '#f4eed6'], bevel: 2, amb: 0.4, ink: I });
  p.disc(143, 77, 1.5, 1.5, I);
  tinyP(p, 'GOVT', 136, 80, '#20242c'); tinyP(p, 'ISSUE', 134, 87, '#b01818');
  // The hand from the bottom left: the sleeve, the cuff, the fingers pinching the arm's tip
  p.form(g => { g.moveTo(0, 144); g.lineTo(0, 116); g.lineTo(24, 104); g.lineTo(40, 126); g.lineTo(30, 144); g.closePath(); }, { ramp: SUIT, bevel: 9, amb: 0.1, ink: I });
  p.line(3, 118, 22, 108, SUIT[5]);
  p.form(g => { g.moveTo(22, 105); g.lineTo(31, 100); g.lineTo(43, 118); g.lineTo(36, 125); g.closePath(); }, { ramp: RAMP.shirt, bevel: 3, amb: 0.3, ink: I });
  p.rect(34, 113, 2, 2, '#c8c8d0');
  p.form(g => { g.ellipse(46, 106, 13, 10, -0.6, 0, Math.PI * 2); }, { ramp: A, bevel: 6, amb: 0.2, ink: I });
  // (the forefinger under the tip, the thumb pressed down over it)
  p.form(g => { g.ellipse(53, 100, 7, 4, -0.5, 0, Math.PI * 2); }, { ramp: A, bevel: 3, amb: 0.22, ink: I, inkIn: A[1] });
  p.form(p.strokeMask(g => { g.moveTo(40, 98); g.quadraticCurveTo(44, 92, 52, 92); }, 7), { ramp: A, bevel: 3, amb: 0.22, ink: I, inkIn: A[1] });
  p.form(g => { g.ellipse(52, 92, 2.6, 2.2, -0.2, 0, Math.PI * 2); }, { ramp: ['#a47a58', '#d8b49a', '#f0d4c0', '#fcece0'], bevel: 1.5, amb: 0.3, ink: A[1] });
  p.line(38, 108, 50, 112, A[1]); p.px(44, 100, A[5]);
});

/** The glasses, held up: a light from heaven on them (as on the ticket), a glint running along the rims, sparkles. */
export const shotGlasses = (c: Ctx, t: number) => {
  bands(c, 0, 0, ART_W, ART_H, ['#0c1424', '#121c30', '#18243c', '#1e2c48', '#18243c', '#121c30']);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + t * 0.008;
    c.fillStyle = k % 2 ? 'rgba(200, 220, 255, 0.10)' : 'rgba(252, 240, 200, 0.07)';
    c.beginPath(); c.moveTo(140, 62); c.lineTo(140 + Math.cos(a) * 300, 62 + Math.sin(a) * 300); c.lineTo(140 + Math.cos(a + 0.24) * 300, 62 + Math.sin(a + 0.24) * 300); c.fill();
  }
  for (let r = 5; r >= 1; r--) { c.fillStyle = `rgba(220, 235, 255, ${0.04 * (6 - r)})`; c.beginPath(); c.ellipse(140, 62, r * 24, r * 14, 0, 0, Math.PI * 2); c.fill(); }
  // (held up, turning a touch in the light: a bob)
  const by = Math.round(Math.sin(t * 0.08) * 1.5);
  c.drawImage(glassesInsertStill(), 0, by);
  // (the glint running along the brow bars)
  const gx = (t * 3) % 220;
  if (gx < 136) for (let k = 0; k < 4; k++) R(c, 74 + gx + k, 39 + by + (k >> 1), 1, 2, '#ffffff');
  for (let k = 0; k < 6; k++) {
    const ph = (t + k * 17) % 56;
    if (ph > 20) continue;
    const x = 70 + hash(k + 3) * 150, y = 30 + hash(k + 11) * 70, r = ph < 10 ? ph / 2 : (20 - ph) / 2;
    R(c, x - r, y, r * 2 + 1, 1, '#f4f8ff'); R(c, x, y - r, 1, r * 2 + 1, '#f4f8ff'); R(c, x, y, 1, 1, '#ffffff');
  }
};

/** The agent's hand, in from the left edge pinching an arm of the glasses at its right end (90, 14): the sleeve, the
 *  cuff, the fingers. Mirrored for the other side. Painted once. */
const dressHand = () => painting('m2-glasses-hand', 96, 30, (p: Painter) => {
  const ox = 90, oy = 14;
  p.form(g => { g.rect(0, oy - 9, ox - 26, 18); }, { ramp: SUIT, bevel: 6, amb: 0.12, ink: I });
  p.line(0, oy - 7, ox - 28, oy - 7, SUIT[5]);
  p.form(g => { g.rect(ox - 28, oy - 8, 6, 16); }, { ramp: RAMP.shirt, bevel: 2, amb: 0.3, ink: I });
  p.form(g => { g.ellipse(ox - 14, oy + 1, 10, 7, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 5, amb: 0.2, ink: I });
  p.form(g => { g.ellipse(ox - 3, oy + 3, 5, 3, 0.2, 0, Math.PI * 2); }, { ramp: A, bevel: 2.5, amb: 0.22, ink: I, inkIn: A[1] });
  p.form(g => { g.ellipse(ox - 4, oy - 3, 5, 3, -0.2, 0, Math.PI * 2); }, { ramp: A, bevel: 2.5, amb: 0.22, ink: I, inkIn: A[1] });
  p.px(ox - 5, oy - 5, A[5]); p.px(ox - 4, oy + 1, A[5]); p.line(ox - 20, oy + 5, ox - 10, oy + 6, A[1]);
});

/** On they go: him up close (the dumb look), the agent's two hands in from the sides putting the glasses on him like
 *  he's a kid, down onto his nose; the hands out again; and him in them. */
export const shotGlassesOn = (c: Ctx, t: number, talking: boolean) => {
  blurGym(c);
  const k = clamp01(t / 34), land = 1 - (1 - k) * (1 - k);
  const dy = Math.round(-70 * (1 - land));
  const on = t >= 34;
  drawTitleMeathead(c, t, 'dumb', t, on);
  if (!on) drawTitleGlasses(c, dy);
  // (the hands: down with them, a beat holding them on, then off out of the shot)
  const out = clamp01((t - 46) / 16), hx = Math.round(out * 110);
  if (out < 1) {
    const hy = 52 + dy;
    c.drawImage(dressHand(), 84 - 90 - hx, hy - 14);
    c.save(); c.translate(ART_W, 0); c.scale(-1, 1); c.drawImage(dressHand(), ART_W - 173 - 90 - hx, hy - 14); c.restore();
  }
  // (the click as they seat: a twinkle off each lens)
  if (t >= 34 && t < 46) for (const x of [104, 138]) { const r = t < 40 ? 3 : 1; R(c, x - r, 52, r * 2 + 1, 1, '#ffffff'); R(c, x, 52 - r, 1, r * 2 + 1, '#ffffff'); }
  if (talking && t % 8 < 4) { R(c, 116, 86, 24, 3, '#3a0606'); R(c, 118, 86, 20, 1, '#f4ecdc'); }
  if (dressed === 'shitty') { flies(c, 60, 120, 16, 3); stink(c, 200, 140, 3, 30, 10); }
};

/** The cutscenes' painted stills, in the order they're first wanted (the opening's, then the closing's): painted ahead
 *  one per idle moment (gross.ts prewarmGross runs them first), so no shot stops to paint itself the frame it cuts in. */
export const SHOT_STILLS: (() => void)[] = [
  () => newsStill(), () => agentFStill(dressed), prewarmTitleMeathead,
  () => chokeStill(0), () => chokeStill(1), () => chokeStill(2), () => ticketStill(), () => keysHand(),
  () => glassesInsertStill(), () => dressHand(),
];
