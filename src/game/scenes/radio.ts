// The mid-game call, drawn the ending's way (SNES-style pixel art on a 256x144
// canvas): Meathead in his half-built garage gym with a field radio, and the
// man on the other end of it, a silhouette in a dark office behind a big desk
// (flags either side, a long red tie, a lot of hair), the line scrambled.

import { ART_W, ART_H, C, R, ell, hash, figure, FIG_INK, DENIM, BELT, BOOT } from './ending';
import { RAMP } from './art/snes';
import { painting, noise, bayer } from './art/raster';
import { drawSlide, Slide } from './intro';
import { drawGarage as drawGarageRoom, GARAGE_W } from '../garage/draw';
import { ownedSouvenirs } from '../garage/store';

type Ctx = CanvasRenderingContext2D;

const G = {
  wall: '#2c2c34', wall2: '#24242a', floor: '#3c3830', floor2: '#2c2820', peg: '#6c4c2c', pegDot: '#4c3418',
  olive: '#4c5c2c', oliveDark: '#34401c', oliveLight: '#6c7c3c', scope: '#0c2c10', trace: '#58f898',
  bulb: '#fcf8d8', glow: 'rgba(252, 224, 168, 0.18)', chrome: '#bcbcbc', bench: '#881400', benchDark: '#581000',
  office: '#08080c', blind: '#1c2440', blindLit: '#34406c', rim: '#f8d878', tie: '#d82800', suit: '#040406',
};

/**
 * His garage, the same one as on the map (block walls, the rack, the pegboard and the shelves, the roll-up door) with
 * whatever he's brought home so far on the pegboard and the shelves: shrunk down to the cutscene's picture.
 */
export const garageBg = (ctx: Ctx) => {
  const s = ART_W / GARAGE_W;
  ctx.save(); ctx.scale(s, s); ctx.translate(0, -44);
  drawGarageRoom(ctx, 0, ownedSouvenirs(), null, false);
  ctx.restore();
  // "CHEST DAY" scrawled on a whiteboard, circled, taped to the roll-up door (the one bit of wall with nothing on it:
  // clear of the pegboard, the shelves and whatever he's hung on them, the rack and the poster)
  const wx = 214, wy = 30, ww = 36, wh = 26;
  R(ctx, wx + 1, wy + 1, ww, wh, 'rgba(0,0,0,0.3)');
  R(ctx, wx, wy, ww, wh, C.white); R(ctx, wx, wy + wh - 2, ww, 2, '#c8c8c8');
  R(ctx, wx + 3, wy - 2, 8, 4, 'rgba(250, 240, 190, 0.8)'); R(ctx, wx + ww - 11, wy - 2, 8, 4, 'rgba(250, 240, 190, 0.8)');
  ctx.fillStyle = C.red; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillText('CHEST', wx + ww / 2, wy + 11); ctx.fillText('DAY!!', wx + ww / 2, wy + 20); ctx.textAlign = 'left';
  ctx.strokeStyle = C.red; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(wx + ww / 2, wy + wh / 2 - 1, 16, 11, -0.1, 0, Math.PI * 2); ctx.stroke();
};

/** The bulb over it all, swinging a little, and its pool of light. */
const bulb = (ctx: Ctx, t: number, x: number) => {
  const sway = Math.round(Math.sin(t * 0.04) * 2);
  R(ctx, x, 0, 1, 16, C.ink);
  ell(ctx, x + sway, 19, 3, 4, G.bulb);
  ctx.fillStyle = G.glow;
  ctx.beginPath(); ctx.moveTo(x + sway - 4, 22); ctx.lineTo(x + sway + 4, 22); ctx.lineTo(x + sway + 60, 144); ctx.lineTo(x + sway - 60, 144); ctx.fill();
};

/** The radio's olive drab, its knobs' black plastic, the scope's green glass, the tuning dial's card, the lamp. */
const OLIVE = ['#161c0c', '#232c12', '#323e1a', '#424f24', '#53622e', '#677839', '#7e8f4a'];
const KNOB = ['#030303', '#0e0e0e', '#1c1c1c', '#2e2e2e', '#464646', '#646464'];
const SCOPE = ['#010603', '#03100a', '#061a0e', '#0a2614', '#10341c'];
const DIAL = ['#8c8468', '#b0a888', '#d0c8a4', '#e8e0bc'];
const LAMP_ON = ['#5c0800', '#a01400', '#d82800', '#f85c2c', '#fca080'];
const LAMP_OFF = ['#200400', '#3c0800', '#5c1004', '#7c1c0c', '#9c3420'];
/** The light falling into something let into a face (a recess): its far walls lit, its near ones in shadow. */
const INTO: [number, number, number] = [0.45, 0.6, 0.66];

/**
 * A field radio, painted once at each size `s` (its box 60 x 40 at s = 1; put down by its top left corner): olive
 * drab, the paint crinkled and worn through to the metal at the corners; the carry handles; the front panel let into
 * it, screwed down; the scope (dark green glass, the graticule on it), the tuning dial (a window of numbers, the red
 * needle), the two knobs (knurled, a pointer, the scale round each), the speaker grille, the lamp's bezel, the
 * handset's jack on the side; the antenna up off the top corner, its mount, its sections.
 */
const radioFigs = new Map<number, (ctx: Ctx, x: number, y: number) => void>();
const radioFig = (s: number) => {
  let f = radioFigs.get(s);
  if (f) return f;
  f = figure(`radio-${s}`, Math.ceil(66 * s), Math.ceil(76 * s), Math.ceil(4 * s), Math.ceil(33 * s), q => {
    const I = FIG_INK, St = RAMP.steel, big = s > 1.5, u = (v: number) => v * s;
    const onIt = (x: number, y: number, c: string) => { if (q.painted(x, y)) q.px(x, y, c); };
    // The antenna: the mount, the whip up out of it in sections, the knob on its end
    const aw = Math.max(1, Math.round(s * 0.7)), ax = Math.round(u(54.5) - aw / 2);
    q.rect(ax, Math.round(u(-30)), aw, Math.round(u(28)), St[2]);
    if (big) q.rect(ax, Math.round(u(-30)), 1, Math.round(u(28)), St[4]);
    for (let k = 1; k < 4; k++) q.rect(ax - (big ? 1 : 0), Math.round(u(-30 + k * 7)), aw + (big ? 2 : 0), 1, St[big ? 4 : 3]);
    q.disc(ax + aw / 2, Math.round(u(-30)), Math.max(1, u(0.9)), Math.max(1, u(0.9)), St[3]);
    q.form(g => { g.rect(u(51.5), u(-3), u(6), u(4)); }, { ramp: St, bevel: Math.max(1, u(1)), amb: 0.25, ink: I });
    // The carry handles over the top
    if (big) for (const x0 of [5, 34]) q.stroke(g => { g.moveTo(u(x0), u(0.5)); g.lineTo(u(x0), u(-2.5)); g.lineTo(u(x0 + 10), u(-2.5)); g.lineTo(u(x0 + 10), u(0.5)); }, u(1.1), { ramp: St, bevel: 1.5, amb: 0.25, ink: I });
    // The handset's jack on the side
    q.form(g => { g.rect(u(-2.5), u(15), u(3.5), u(5)); }, { ramp: St, bevel: Math.max(1, u(1)), amb: 0.2, ink: I });
    // The box: olive drab, the paint crinkled
    q.form(g => { g.roundRect(0, 0, u(60), u(40), u(2.5)); }, { ramp: OLIVE, bevel: u(4), amb: 0.14, ink: I, tex: (x, y) => (noise(x, y, Math.max(2, s * 1.5)) - 0.5) * 0.14 });
    q.line(Math.round(u(2)), Math.round(u(1.2)), Math.round(u(58)), Math.round(u(1.2)), OLIVE[6]);
    // The front panel, let into it
    q.form(g => { g.roundRect(u(2), u(4), u(56), u(33), u(1.5)); }, { ramp: OLIVE, bevel: Math.max(1, u(1.2)), amb: 0.12, ink: null, light: INTO, gain: 0.95, tex: (x, y) => (noise(x, y, Math.max(2, s * 1.5), 7) - 0.5) * 0.1 });
    // The scope: its bezel, the green glass, the graticule
    q.form(g => { g.roundRect(u(3), u(6), u(26), u(18), u(1.5)); }, { ramp: KNOB, bevel: Math.max(1, u(1.2)), amb: 0.2, ink: I });
    q.form(g => { g.rect(u(5), u(8), u(22), u(14)); }, { ramp: SCOPE, bevel: u(3), amb: 0.3, ink: null, spec: '#7cdc9c', wet: 0.25 });
    if (big) for (let k = 1; k < 7; k++) { for (let y = u(8); y < u(22); y += 2) q.px(u(5 + k * 22 / 7), y, '#0e3a1c'); if (k < 4) for (let x = u(5); x < u(27); x += 2) q.px(x, u(8 + k * 14 / 4), '#0e3a1c'); }
    // The tuning dial: a window of numbers, the needle
    q.form(g => { g.rect(u(13), u(26), u(16), u(5.5)); }, { ramp: DIAL, bevel: 1, amb: 0.4, ink: I, light: INTO });
    for (let k = 0; k <= 15; k++) { const x = Math.round(u(13.5 + k)), long = k % 5 === 0; if (big || k % 2 === 0) q.line(x, Math.round(u(26.4)), x, Math.round(u(26.4) + (long ? u(2) : u(1))), '#3c3424'); }
    q.line(Math.round(u(20.5)), Math.round(u(26.2)), Math.round(u(20.5)), Math.round(u(31)), '#c81c1c');
    // The knobs: the scale round each, knurled, a pointer
    for (const [k, a] of [[0, -0.7], [1, 0.9]] as const) {
      const cx = u(38 + k * 12), cy = u(13), r = u(4);
      if (big) for (let i = 0; i < 9; i++) { const an = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5; q.line(Math.round(cx + Math.cos(an) * (r + 3)), Math.round(cy + Math.sin(an) * (r + 3)), Math.round(cx + Math.cos(an) * (r + (i % 4 ? 4 : 5.5))), Math.round(cy + Math.sin(an) * (r + (i % 4 ? 4 : 5.5))), '#c8d0a0'); }
      q.form(g => { g.arc(cx, cy, r, 0, Math.PI * 2); }, { ramp: KNOB, bevel: u(2.2), amb: 0.2, ink: I, spec: '#b0b0b0', wet: 0.45 });
      if (big) for (let i = 0; i < 24; i++) { const an = (i / 24) * Math.PI * 2; onIt(Math.round(cx + Math.cos(an) * (r - 1)), Math.round(cy + Math.sin(an) * (r - 1)), i % 2 ? KNOB[0] : KNOB[4]); }
      q.disc(cx, cy, r * 0.55, r * 0.55, KNOB[3]); q.disc(cx - 1, cy - 1, r * 0.3, r * 0.3, KNOB[4]);
      q.line(Math.round(cx), Math.round(cy), Math.round(cx + Math.sin(a) * (r - 1)), Math.round(cy - Math.cos(a) * (r - 1)), '#e8e0c8');
    }
    // The speaker grille: punched through the panel
    if (big) for (let y = 27; y < 35; y += 2) for (let x = 35; x < 56; x += 2) { const px = Math.round(u(x)), py = Math.round(u(y)); q.rect(px, py, 2, 2, OLIVE[0]); q.px(px + 2, py + 1, OLIVE[5]); q.px(px + 1, py + 2, OLIVE[5]); }
    else for (let k = 0; k < 4; k++) q.line(Math.round(u(35)), Math.round(u(27 + k * 2)), Math.round(u(56)), Math.round(u(27 + k * 2)), OLIVE[1]);
    // The lamp's bezel
    q.form(g => { g.arc(u(8.5), u(30.5), u(3.4), 0, Math.PI * 2); }, { ramp: St, bevel: Math.max(1, u(1)), amb: 0.25, ink: I });
    // The screws at the panel's corners
    for (const [sx, sy] of [[4, 5.5], [56, 5.5], [4, 35.5], [56, 35.5]]) {
      if (big) { q.form(g => { g.arc(u(sx), u(sy), u(0.9), 0, Math.PI * 2); }, { ramp: St, bevel: 1.5, amb: 0.25, ink: I }); q.line(Math.round(u(sx) - 1), Math.round(u(sy) + 1), Math.round(u(sx) + 1), Math.round(u(sy) - 1), St[0]); }
      else q.px(u(sx), u(sy), St[3]);
    }
    // Worn: the paint through to the metal at the edges and the corners, scuffs across the face
    for (let i = 0; i < (big ? 220 : 24); i++) {
      const side = i % 4, k = hash(i * 3.7);
      const [x, y] = side === 0 ? [k * 60, hash(i * 1.3) * 1.5] : side === 1 ? [k * 60, 38.5 + hash(i * 1.3) * 1.5] : side === 2 ? [hash(i * 1.3) * 1.5, k * 40] : [58.5 + hash(i * 1.3) * 1.5, k * 40];
      if (hash(i * 5.1) < 0.45 + (Math.min(x, 60 - x) < 6 && Math.min(y, 40 - y) < 6 ? 0.4 : 0)) onIt(Math.round(u(x)), Math.round(u(y)), hash(i * 7.3) < 0.5 ? St[3] : St[2]);
    }
    if (big) for (let i = 0; i < 18; i++) { const x = u(3 + hash(i * 3.1) * 54), y = u(4 + hash(i * 5.7) * 33), l = 2 + hash(i) * 6; if (x < u(31) && y < u(26)) continue; for (let k = 0; k < l; k++) onIt(Math.round(x + k), Math.round(y + k * 0.2), OLIVE[5]); }
  });
  radioFigs.set(s, f);
  return f;
};
/** The lamp's lens (lit or not), at each size. */
const lampFig = (s: number, on: boolean) => figure(`radio-lamp-${s}-${on}`, Math.ceil(7 * s), Math.ceil(7 * s), Math.ceil(3.5 * s), Math.ceil(3.5 * s), q => {
  q.form(g => { g.arc(0, 0, s * 2.3, 0, Math.PI * 2); }, { ramp: on ? LAMP_ON : LAMP_OFF, bevel: Math.max(1, s * 1.5), amb: 0.3, ink: FIG_INK, spec: on ? '#fff0e0' : '#c06040', wet: 0.6 });
});
const lampOn = new Map<number, [(ctx: Ctx, x: number, y: number) => void, (ctx: Ctx, x: number, y: number) => void]>();

/** A field radio (see radioFig), its top left at (x, y), `s` the size: the scope's trace going when someone's talking, the lamp lit while there's someone on. */
const fieldRadio = (ctx: Ctx, t: number, x: number, y: number, s: number, talking: boolean) => {
  radioFig(s)(ctx, x, y);
  // The trace across the scope
  ctx.fillStyle = G.trace;
  for (let i = 0; i < 22 * s; i++) {
    const amp = talking ? 6 * s * (0.3 + hash(Math.floor(t / 2) * 31 + Math.floor(i / (2 * s))) * 0.7) : s;
    const yy = y + 15 * s + Math.sin(i * 0.9 / s + t * 0.5) * amp;
    ctx.fillRect(Math.round(x + 5 * s + i), Math.round(yy), 1, Math.max(1, Math.round(s)));
  }
  // The lamp
  let lamps = lampOn.get(s);
  if (!lamps) { lamps = [lampFig(s, false), lampFig(s, true)]; lampOn.set(s, lamps); }
  lamps[talking || t % 40 < 20 ? 1 : 0](ctx, Math.round(x + 8.5 * s), Math.round(y + 30.5 * s));
};

/** The handset's cord, coiled, from (x0, y0) over to (x1, y1), hanging slack between. */
const coiledCord = (ctx: Ctx, x0: number, y0: number, x1: number, y1: number, sag: number) => {
  const n = Math.round(Math.hypot(x1 - x0, y1 - y0) * 1.3), cx = (x0 + x1) / 2, cy = Math.max(y0, y1) + sag;
  for (let i = 0; i <= n; i++) {
    const k = i / n, a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
    const x = a * x0 + b * cx + c * x1, y = a * y0 + b * cy + c * y1, w = Math.sin(i * 1.9);
    R(ctx, Math.round(x), Math.round(y + w * 1.2), 1, 1, w > 0.5 ? '#4a4a56' : FIG_INK);
  }
};

/**
 * The bench, the crate, and Meathead sitting on the bench with the handset to his ear, front on, painted once: the
 * boots planted, the jeans (the knees toward us), the belt; the torso a V, the pecs, the abs, the delts; his right arm
 * down, the forearm on his knee; his left (he's a lefty) up, the elbow out, the handset to his ear in his fist; the neck
 * like a stump, the square head, the flat-top, the brows, the eyes, the nose, the stubble.
 */
const garageFig = figure('garage-mh', ART_W, ART_H, 0, 0, q => {
  const S = RAMP.mSkin, I = FIG_INK, St = RAMP.steel, W = RAMP.wood;
  const PLASTIC = ['#040406', '#0e0e12', '#1c1c22', '#2e2e36', '#4a4a56'];
  // The crate (the radio goes on it)
  q.form(g => { g.rect(164, 96, 56, 30); }, { ramp: W, bevel: 3, amb: 0.2, ink: I });
  for (const y of [103, 110, 117]) q.line(166, y, 217, y, W[1]);
  q.line(166, 98, 217, 98, W[5]); q.line(167, 99, 167, 124, W[4]); q.line(216, 99, 216, 124, W[1]);
  for (const [x, y] of [[168, 100], [214, 100], [168, 122], [214, 122]]) q.px(x, y, '#c8c8c8');
  // The bench: the pad, the legs, the feet
  for (const x of [66, 130]) { q.form(g => { g.rect(x, 115, 4, 21); }, { ramp: St, bevel: 1.5, amb: 0.2, ink: I }); q.form(g => { g.roundRect(x - 4, 134, 12, 3, 1); }, { ramp: St, bevel: 1, amb: 0.2, ink: I }); }
  q.form(g => { g.roundRect(59, 106, 82, 10, 3); }, { ramp: RAMP.red, bevel: 3, amb: 0.18, ink: I, spec: '#fcb8a0', wet: 0.3 });
  for (let x = 62; x < 138; x += 3) q.px(x, 113, RAMP.red[1]);
  // The shins down to the boots
  for (const [x0, amb] of [[85, 0.2], [113, 0.1]] as const) {
    q.form(g => { g.moveTo(x0, 118); g.lineTo(x0 + 10, 118); g.lineTo(x0 + 10.5, 134); g.lineTo(x0 - 0.5, 134); g.closePath(); }, { ramp: DENIM, bevel: 3.5, amb, ink: I, inkIn: DENIM[0] });
    q.line(x0 + 2, 121, x0 + 2, 132, DENIM[amb > 0.15 ? 5 : 3]); q.line(x0, 132, x0 + 10, 132, DENIM[1]);
    q.form(g => { g.moveTo(x0 - 2, 133); g.lineTo(x0 + 12, 133); g.lineTo(x0 + 13.5, 136); g.lineTo(x0 + 13.5, 138.5); g.lineTo(x0 - 3.5, 138.5); g.lineTo(x0 - 3.5, 136); g.closePath(); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
    q.line(x0 - 1, 134, x0 + 11, 134, BOOT[4]);
  }
  // The thighs, toward us, the knees
  q.form(g => { g.moveTo(83, 108); g.lineTo(125, 108); g.bezierCurveTo(127, 112, 127, 118, 124, 121); g.lineTo(84, 121); g.bezierCurveTo(81, 118, 81, 112, 83, 108); g.closePath(); }, { ramp: DENIM, bevel: 5, amb: 0.15, ink: I, inkIn: DENIM[0] });
  q.line(104, 109, 104, 121, DENIM[0]); q.line(86, 112, 100, 112, DENIM[5]); q.line(108, 112, 121, 112, DENIM[4]);
  q.disc(90, 117, 3, 1.5, DENIM[5]); q.disc(118, 117, 3, 1.5, DENIM[4]);
  // The belt, the buckle
  q.form(g => { g.rect(85, 103, 38, 6); }, { ramp: BELT, bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.rect(99.5, 102, 9, 8); }, { ramp: RAMP.gold, bevel: 2, ink: '#5c3c00', spec: '#fffff0', wet: 0.6 });
  // His right arm (the picture's left): down off the delt, the forearm out over his knee, the fist on it, the wristband
  q.stroke(g => { g.moveTo(80, 74); g.lineTo(75, 91); }, 11, { ramp: S, bevel: 4, amb: 0.2, ink: I, inkIn: S[1] });
  q.stroke(g => { g.moveTo(75, 91); g.lineTo(85, 104); }, 8.5, { ramp: S, bevel: 3.5, amb: 0.2, ink: I, inkIn: S[1] });
  q.line(72, 80, 71, 89, S[7]); q.line(78, 92, 84, 100, S[3]); q.line(76, 94, 82, 101, '#c96b4b');
  q.form(g => { g.moveTo(81, 100); g.lineTo(86, 97.5); g.lineTo(88.5, 102); g.lineTo(83.5, 104.5); g.closePath(); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
  q.form(g => { g.ellipse(89, 106, 5, 4.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2.5, amb: 0.2, ink: I });
  q.line(86, 108, 92, 108, S[2]); q.px(87, 103, S[7]);
  // The torso: a V, the lats out wide, down to the belt
  q.form(g => { g.moveTo(96, 66); g.lineTo(112, 66); g.lineTo(128, 71); g.bezierCurveTo(131, 76, 129, 84, 126, 88); g.lineTo(121, 104); g.lineTo(87, 104); g.lineTo(82, 88); g.bezierCurveTo(79, 84, 77, 76, 80, 71); g.closePath(); },
    { ramp: S, bevel: 9, amb: 0.14, ink: I, inkIn: S[1] });
  // (the pecs: lit across the top, the shadow under each, the split; the abs in their rows; the serratus)
  for (const s of [-1, 1]) {
    const x0 = 104 + s * 2, x1 = 104 + s * 20;
    q.line(x0, 74, x1, 74, S[s < 0 ? 7 : 6]); q.line(x0, 86, x1 - s * 2, 86, S[2]); q.line(x0, 87, x1 - s * 4, 87, S[3]);
    for (const y of [91, 95, 99]) { q.line(104 + s * 2, y, 104 + s * 6, y, S[s < 0 ? 6 : 5]); q.line(104 + s * 2, y + 2, 104 + s * 6, y + 2, S[3]); }
    q.line(104 + s * 15, 90, 104 + s * 13, 92, S[3]); q.line(104 + s * 15, 94, 104 + s * 13, 96, S[3]);
  }
  q.line(104, 74, 104, 103, S[2]);
  // (the delts, capped round; the traps up into the neck)
  for (const s of [-1, 1]) q.form(g => { g.ellipse(104 + s * 23, 74, 6.5, 5.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 3, amb: s < 0 ? 0.25 : 0.1, ink: null });
  q.form(g => { g.moveTo(94, 70); g.lineTo(98, 62); g.lineTo(110, 62); g.lineTo(114, 70); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.15, ink: null });
  q.line(97, 66, 111, 66, S[2]);
  // The ears; the head: square, the jaw, the chin
  for (const s of [-1, 1]) q.form(g => { g.ellipse(104 + s * 14, 54, 2.5, 4.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 1.5, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(92, 42); g.lineTo(116, 42); g.lineTo(116, 58); g.lineTo(113, 66); g.lineTo(109, 70); g.lineTo(99, 70); g.lineTo(95, 66); g.lineTo(92, 58); g.closePath(); }, { ramp: S, bevel: 6, amb: 0.2, ink: I, inkIn: S[1] });
  // (the flat-top: dead flat on top and lit, the bristles)
  q.form(g => { g.rect(90.5, 35, 27, 9); }, { ramp: RAMP.mHair, bevel: 2.5, amb: 0.3, ink: I, gain: 1.2 });
  for (let x = 92; x < 117; x++) { q.px(x, 36, x < 104 ? '#5a5a68' : '#44444e'); if ((x & 1) === 0) q.line(x, 38, x, 42, '#2a2a32'); }
  // (the brows, the eyes, the nose lit down its left, the mouth, the cleft, stubble on the jaw)
  q.line(95, 50, 101, 49, I); q.line(95, 51, 101, 50, '#2a1a10'); q.line(107, 49, 113, 50, I); q.line(107, 50, 113, 51, '#2a1a10');
  for (const ex of [97, 109]) { q.rect(ex, 53, 4, 2, '#f4ece0'); q.px(ex + 2, 53, '#2a5aa8'); q.px(ex + 2, 54, I); q.line(ex, 52, ex + 3, 52, S[2]); }
  q.line(103, 54, 103, 60, S[6]); q.line(105, 55, 105, 60, S[3]); q.line(102, 61, 106, 61, S[2]); q.px(103, 61, S[1]); q.px(105, 61, S[1]);
  q.line(100, 65, 108, 65, '#7a1e10'); q.line(101, 66, 107, 66, S[3]);
  q.px(104, 68, S[2]);
  for (let i = 0; i < 26; i++) { const x = 94 + Math.floor(hash(i * 2.3) * 21), y = 60 + Math.floor(hash(i * 4.1) * 10); if (y < 64 || x < 100 || x > 108) q.px(x, y, '#8c5c30'); }
  // The handset to his ear: black plastic, the earpiece and the mouthpiece
  q.form(g => { g.moveTo(117, 45); g.lineTo(124, 45); g.lineTo(125, 52); g.lineTo(123, 62); g.lineTo(124, 68); g.lineTo(117, 68); g.lineTo(116, 62); g.lineTo(118, 52); g.closePath(); }, { ramp: PLASTIC, bevel: 2.5, amb: 0.2, ink: I, spec: '#8a8a9a', wet: 0.6 });
  // His left arm (the picture's right): the bicep out to the elbow, the forearm up to his ear, the wristband, the fist round the handset
  q.stroke(g => { g.moveTo(126, 72); g.lineTo(135, 81); }, 11, { ramp: S, bevel: 4, amb: 0.1, ink: I, inkIn: S[1], gain: 1.05 });
  q.stroke(g => { g.moveTo(135, 80); g.lineTo(128, 60); }, 9, { ramp: S, bevel: 3.5, amb: 0.1, ink: I, inkIn: S[1] });
  q.line(129, 70, 133, 78, S[6]); q.line(132, 62, 136, 74, S[2]); q.line(131, 64, 134, 74, '#c96b4b');
  q.form(g => { g.moveTo(124.5, 61); g.lineTo(131, 58.5); g.lineTo(132.5, 62); g.lineTo(126, 64.5); g.closePath(); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
  q.form(g => { g.roundRect(119.5, 51, 10, 10, 3); }, { ramp: S, bevel: 3, amb: 0.15, ink: I });
  for (const y of [53, 56, 59]) q.line(120, y, 122, y, S[2]);
  q.px(126, 52, S[6]);
});

/** Meathead on his bench in the garage, the radio on a crate next to him, the handset to his ear. */
export const drawGarage = (ctx: Ctx, t: number, talking: boolean, meatheadTalking = false) => {
  garageBg(ctx);
  bulb(ctx, t, 118);
  // (plates stacked by the bench)
  for (let k = 0; k < 3; k++) { ell(ctx, 40, 132 - k * 5, 14 - k * 2, 3, C.ink); ell(ctx, 40, 131 - k * 5, 12 - k * 2, 2, C.darkGray); R(ctx, 30 + k * 2, 130 - k * 5, 6, 1, '#5c5c5c'); }
  garageFig(ctx, 0, 0);
  fieldRadio(ctx, t, 170, 70, 0.8, talking);
  // The coiled cord over from the radio's jack to the handset, hanging slack
  coiledCord(ctx, 167, 85, 122, 68, 16);
  // (his mouth, when he's talking)
  if (meatheadTalking && t % 10 < 5) { R(ctx, 100, 64, 9, 4, '#3a0606'); R(ctx, 101, 64, 7, 1, '#f4ecdc'); R(ctx, 102, 67, 5, 1, '#c84858'); }
  // (a little static off the handset while the voice is on)
  if (talking) for (let i = 0; i < 4; i++) if (hash(t * 3 + i) > 0.5) R(ctx, 128 + i * 4, 40 + hash(t + i) * 12, 2, 1, C.white);
};

/**
 * The pegboard behind the radio up close, painted once: brown board in the bulb's light (falling off away from it, in
 * steps), its holes; a wrench hung on it, a jump rope over a peg.
 */
const pegboardStill = () => painting('radio-peg', ART_W, ART_H, p => {
  const PEG = ['#0c0906', '#130f0b', '#1a1510', '#221b14', '#2c2319', '#372c1f'], St = RAMP.steel, I = FIG_INK;
  for (let y = 0; y < ART_H; y++) for (let x = 0; x < ART_W; x++) {
    const l = Math.max(0, 1 - Math.hypot((x - 128) / 190, (y + 10) / 170)) + (noise(x, y, 6, 3) - 0.5) * 0.08;
    p.px(x, y, PEG[Math.max(0, Math.min(PEG.length - 1, Math.round(l * (PEG.length - 1) + bayer(x, y) * 0.7)))]);
  }
  for (let y = 4; y < ART_H; y += 8) for (let x = 4; x < ART_W; x += 8) { p.px(x, y, '#050403'); p.px(x + 1, y, '#080605'); p.px(x, y + 1, PEG[4]); }
  // The wrench: the ring end up on the peg, the handle, the open end
  p.form(g => { g.rect(8, 20, 4, 30); }, { ramp: St, bevel: 1.5, amb: 0.2, ink: I, spec: '#ffffff', wet: 0.3 });
  p.form(g => { g.ellipse(10, 17, 5, 5, 0, 0, Math.PI * 2); }, { ramp: St, bevel: 2, amb: 0.2, ink: I });
  p.disc(10, 17, 2.5, 2.5, PEG[1]); p.px(11, 19, PEG[3]);
  p.form(g => { g.moveTo(5, 50); g.lineTo(15, 50); g.lineTo(16, 58); g.lineTo(13, 58); g.lineTo(12, 54); g.lineTo(8, 54); g.lineTo(7, 58); g.lineTo(4, 58); g.closePath(); }, { ramp: St, bevel: 1.5, amb: 0.2, ink: I });
  p.line(9, 22, 9, 48, St[5]);
  // The jump rope, over a peg: the rope, its handles
  p.form(p.strokeMask(g => { g.moveTo(228, 48); g.bezierCurveTo(226, 28, 246, 28, 245, 48); }, 1.8), { ramp: RAMP.red, bevel: 1, amb: 0.3, ink: null });
  for (const x of [226, 244]) { p.form(g => { g.roundRect(x - 1, 46, 4, 12, 1.5); }, { ramp: KNOB, bevel: 1.5, amb: 0.3, ink: I, spec: '#8a8a8a', wet: 0.5 }); p.rect(x - 1, 46, 4, 1, St[3]); }
  p.px(236, 32, St[4]);
});

/** The radio up close, its scope going. */
export const drawRadioCloseUp = (ctx: Ctx, t: number, talking: boolean) => {
  // The pegboard behind it (a wrench, a jump rope hung on it)
  ctx.drawImage(pegboardStill(), 0, 0);
  fieldRadio(ctx, t, 38, 36, 3, talking);
  // Up close: what the knobs are, the stencil, the label on the tape
  ctx.fillStyle = '#c8d0a0'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
  ctx.fillText('FREQ', 38 + 38 * 3, 36 + 23 * 3); ctx.fillText('VOL', 38 + 50 * 3, 36 + 23 * 3);
  ctx.font = 'bold 10px monospace'; ctx.fillStyle = 'rgba(200, 208, 160, 0.55)'; ctx.fillText('U.S.', 38 + 17 * 3, 36 + 36 * 3);
  ctx.textAlign = 'left';
  // (the stencil's bridges through the letters)
  for (const bx of [80, 92]) R(ctx, bx, 136, 1, 8, OLIVE[3]);
  // (the tape: cream, torn at the ends, a shadow under it)
  R(ctx, 147, 138, 60, 1, 'rgba(0,0,0,0.35)');
  R(ctx, 146, 128, 60, 10, '#e8e0c0'); R(ctx, 146, 128, 60, 1, '#fffae0'); R(ctx, 146, 137, 60, 1, '#c8c0a0');
  for (let y = 128; y < 138; y++) { if (y % 3) R(ctx, 145, y, 1, 1, '#d8d0b0'); if ((y + 1) % 3) R(ctx, 206, y, 1, 1, '#d8d0b0'); }
  ctx.fillStyle = '#1c3a8c'; ctx.font = 'bold 6px monospace'; ctx.fillText("DON'T TOUCH -MH", 148, 135);
  scramble(ctx, t, talking ? 0.35 : 0.12);
};

/** Interference over the picture: static speckle and a rolling bar. */
const scramble = (ctx: Ctx, t: number, amount: number) => {
  for (let i = 0; i < 260 * amount; i++) {
    const x = hash(t * 13 + i * 7) * ART_W, y = hash(t * 17 + i * 11) * ART_H;
    R(ctx, x, y, 1, 1, hash(i + t) > 0.5 ? 'rgba(252,252,252,0.5)' : 'rgba(0,0,0,0.5)');
  }
  const bar = (t * 1.5) % (ART_H + 20) - 10;
  ctx.fillStyle = `rgba(252, 252, 252, ${0.05 + amount * 0.1})`;
  ctx.fillRect(0, Math.round(bar), ART_W, 6);
  for (let y = 0; y < ART_H; y += 2) { ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, y, ART_W, 1); }
};

/**
 * The man on the other end: a dark office, the blinds lit from behind, flags either side, a big desk, and him in
 * silhouette behind it (a big man, a lot of hair with a little gold at the edge, the long red tie the only colour on
 * him). His hands go while he talks: the pinch, the accordion.
 */
export const drawShadowFigure = (ctx: Ctx, t: number, talking: boolean) => {
  R(ctx, 0, 0, ART_W, ART_H, G.office);
  // The window behind him, through the blinds
  R(ctx, 64, 8, 128, 84, G.blind);
  for (let y = 10; y < 92; y += 5) R(ctx, 64, y, 128, 2, G.blindLit);
  R(ctx, 126, 8, 4, 84, G.office);
  // Flags either side, in the dark: just their shapes, a glint of gold on the poles
  for (const x of [34, 212]) {
    R(ctx, x, 12, 2, 100, C.darkGray); ell(ctx, x + 1, 11, 2, 2, C.gold);
    ctx.fillStyle = '#10101a'; ctx.beginPath(); ctx.moveTo(x + 2, 16); ctx.lineTo(x + 18, 20); ctx.lineTo(x + 16, 70); ctx.lineTo(x + 2, 66); ctx.fill();
  }
  // Him: shoulders out past the window, the hair up and swept over, rim-lit
  const bob = talking ? Math.round(Math.sin(t * 0.3) * 1) : 0;
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(52, 144); ctx.lineTo(66, 88 + bob); ctx.lineTo(100, 74 + bob); ctx.lineTo(156, 74 + bob); ctx.lineTo(190, 88 + bob); ctx.lineTo(204, 144); ctx.fill();
  ell(ctx, 128, 58 + bob, 22, 26, G.suit);
  // The hair: a great swept wave, piled high, over from the back and out past his forehead in a swoop that flips
  // up at the front, rim-lit gold from the window
  const hair = () => {
    ctx.beginPath();
    ctx.moveTo(150, 60 + bob);
    ctx.quadraticCurveTo(160, 30 + bob, 136, 20 + bob);
    ctx.quadraticCurveTo(108, 14 + bob, 94, 30 + bob);
    ctx.quadraticCurveTo(86, 36 + bob, 90, 44 + bob);
    ctx.quadraticCurveTo(96, 36 + bob, 104, 38 + bob);
    ctx.quadraticCurveTo(100, 46 + bob, 104, 58 + bob);
  };
  ctx.fillStyle = G.suit; hair(); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = G.rim; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(152, 46 + bob); ctx.quadraticCurveTo(160, 30 + bob, 136, 20 + bob); ctx.quadraticCurveTo(108, 14 + bob, 94, 30 + bob); ctx.quadraticCurveTo(86, 36 + bob, 90, 44 + bob); ctx.stroke();
  // (and the edge of an ear, a jowl, catching it too)
  R(ctx, 148, 58 + bob, 1, 8, G.rim); R(ctx, 146, 70 + bob, 3, 1, G.rim);
  // (now and then, for a moment, something in the dark where his eyes are catches the light green: easy to miss)
  if (t % 170 >= 96 && t % 170 < 100) { R(ctx, 119, 55 + bob, 3, 1, '#7CFC4A'); R(ctx, 134, 55 + bob, 3, 1, '#7CFC4A'); }
  // The tie, long, very red
  R(ctx, 124, 80 + bob, 8, 6, C.white);
  ctx.fillStyle = G.tie; ctx.beginPath(); ctx.moveTo(125, 86 + bob); ctx.lineTo(131, 86 + bob); ctx.lineTo(133, 122); ctx.lineTo(128, 128); ctx.lineTo(123, 122); ctx.fill();
  // The hands: up and going while he talks (the pinch, then both out wide), flat on the desk when not
  // (against the lit blinds, so they show; a thin gold edge on them)
  const gesture = talking ? Math.floor(t / 40) % 2 : -1;
  const hand = (x: number, y: number) => { ell(ctx, x, y, 6, 6, G.suit); ctx.strokeStyle = G.rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 6, -Math.PI * 0.9, -Math.PI * 0.1); ctx.stroke(); };
  ctx.fillStyle = G.suit;
  if (gesture === 0) {
    // The pinch, jabbing
    const j = t % 16 < 8 ? 0 : 3;
    ctx.beginPath(); ctx.moveTo(158, 112); ctx.lineTo(168, 66 + j); ctx.lineTo(178, 68 + j); ctx.lineTo(170, 112); ctx.fill();
    hand(172, 62 + j);
    R(ctx, 170, 52 + j, 2, 5, G.suit); R(ctx, 174, 53 + j, 2, 4, G.suit); R(ctx, 172, 52 + j, 2, 1, G.rim); // (finger and thumb, just touching)
  } else if (gesture === 1) {
    // Both hands out, squeezing an accordion
    const w = Math.round(Math.abs(Math.sin(t * 0.15)) * 12);
    for (const s of [-1, 1]) {
      ctx.fillStyle = G.suit; ctx.beginPath(); ctx.moveTo(128 + s * 30, 112); ctx.lineTo(128 + s * (46 + w), 76); ctx.lineTo(128 + s * (54 + w), 80); ctx.lineTo(128 + s * 40, 112); ctx.fill();
      hand(128 + s * (50 + w), 74);
    }
  }
  // The desk across the front: big, carved, a phone and a microphone on it, and a glass of something green
  R(ctx, 20, 112, 216, 32, '#140c06'); R(ctx, 20, 112, 216, 3, '#2c1c0c');
  R(ctx, 196, 102, 6, 10, '#1d3a12'); R(ctx, 197, 104, 4, 7, '#3f7a1f'); R(ctx, 197, 104, 1, 1, '#9be36a'); R(ctx, 196, 101, 6, 1, '#3a3a3a');
  for (const x of [40, 180]) { R(ctx, x, 120, 36, 18, '#1c1208'); R(ctx, x + 2, 122, 32, 14, '#140c06'); }
  R(ctx, 150, 104, 3, 8, C.darkGray); ell(ctx, 151, 102, 3, 3, C.darkGray);
  R(ctx, 90, 106, 18, 6, C.darkGray); R(ctx, 92, 102, 14, 4, C.darkGray);
  scramble(ctx, t, talking ? 0.28 : 0.15);
};

/**
 * His briefing, over the same scrambled line: a screen pulled down over the blinds in his dark office with the
 * slides on it, and him beside it in silhouette (the hair, the long red tie), a pointer going at it while he talks.
 */
export const drawShadowBriefing = (ctx: Ctx, t: number, talking: boolean, slide: Slide) => {
  R(ctx, 0, 0, ART_W, ART_H, G.office);
  // The blinds, lit from behind, round the edges of the screen
  R(ctx, 58, 4, 156, 96, G.blind);
  for (let y = 6; y < 100; y += 5) R(ctx, 58, y, 156, 2, G.blindLit);
  // A flag in the dark, off to the left
  R(ctx, 30, 12, 2, 100, C.darkGray); ell(ctx, 31, 11, 2, 2, C.gold);
  ctx.fillStyle = '#10101a'; ctx.beginPath(); ctx.moveTo(32, 16); ctx.lineTo(48, 20); ctx.lineTo(46, 70); ctx.lineTo(32, 66); ctx.fill();
  // The screen, and what's on it (SAD! across each of them)
  R(ctx, 70, 8, 132, 78, '#dcdcd0'); R(ctx, 70, 8, 132, 3, '#a0a094'); R(ctx, 134, 4, 4, 6, C.gray);
  drawSlide(ctx, t, slide, 'SAD!');
  // Him, beside it: a big dark shape, the hair swept up and rim-lit, the tie
  const bob = talking ? Math.round(Math.sin(t * 0.3)) : 0;
  const cx = 226;
  ctx.fillStyle = G.suit;
  ctx.beginPath(); ctx.moveTo(cx - 24, 144); ctx.lineTo(cx - 20, 92 + bob); ctx.lineTo(cx + 20, 92 + bob); ctx.lineTo(cx + 26, 144); ctx.fill();
  ell(ctx, cx, 78 + bob, 12, 14, G.suit);
  ctx.beginPath(); ctx.moveTo(cx + 12, 76 + bob); ctx.quadraticCurveTo(cx + 16, 58 + bob, cx + 2, 60 + bob); ctx.quadraticCurveTo(cx - 14, 58 + bob, cx - 16, 70 + bob); ctx.quadraticCurveTo(cx - 10, 66 + bob, cx - 6, 70 + bob); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = G.rim; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx + 12, 72 + bob); ctx.quadraticCurveTo(cx + 16, 58 + bob, cx + 2, 60 + bob); ctx.quadraticCurveTo(cx - 14, 58 + bob, cx - 16, 70 + bob); ctx.stroke();
  R(ctx, cx - 3, 92 + bob, 6, 4, C.white);
  // (the glint again, for a blink)
  if (t % 190 >= 120 && t % 190 < 123) { R(ctx, cx - 6, 76 + bob, 2, 1, '#7CFC4A'); R(ctx, cx + 3, 76 + bob, 2, 1, '#7CFC4A'); }
  ctx.fillStyle = G.tie; ctx.beginPath(); ctx.moveTo(cx - 2, 96 + bob); ctx.lineTo(cx + 2, 96 + bob); ctx.lineTo(cx + 3, 126); ctx.lineTo(cx, 130); ctx.lineTo(cx - 3, 126); ctx.fill();
  // The pointer, jabbing at the slide while he talks
  const jab = talking && t % 20 < 6 ? 3 : 0;
  const onBoss = slide !== 'four' && slide !== 'four2' && slide !== 'drop';
  ctx.strokeStyle = C.lightGray;
  ctx.beginPath(); ctx.moveTo(cx - 18, 100); ctx.lineTo((onBoss ? 110 : 180) - jab, 52 + jab); ctx.stroke();
  ell(ctx, cx - 18, 100, 4, 4, G.suit);
  // The big desk across the front
  R(ctx, 0, 118, 190, 26, '#140c06'); R(ctx, 0, 118, 190, 3, '#2c1c0c');
  scramble(ctx, t, talking ? 0.22 : 0.12);
};
