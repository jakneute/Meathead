// The men in suits, painted once and kept (the ending's `figure` way: pillowed forms stepped to ramps, dithered, inked):
// the agents (men in black, big, necks wider than their heads, the shades, the earpiece) and the pencil necks (the
// department's interns: suits two sizes too big, necks like broom handles, shades too big for them). Small, for the
// wide shots (the intro's doorway, the corridor, the briefing; the epilogue's closet), and big and out of focus, for
// behind a close-up.

import { figure, rimLight, FIG_INK, BOOT } from './ending';
import { RAMP } from './art/snes';

type Ctx = CanvasRenderingContext2D;
type Put = (ctx: Ctx, x: number, y: number) => void;

/** The agents' black suit, darkest to lightest (a touch more range than RAMP.aSuit, so the folds read on the dark). */
export const SUIT = ['#020204', '#08080d', '#111118', '#1b1b24', '#272732', '#363644', '#4a4a5c'];
/** The interns' suits: cheap, charcoal, shiny at the seams. */
export const CHEAP = ['#07070a', '#101016', '#1a1a22', '#25252f', '#33333f', '#454554', '#5c5c6e'];
const A = RAMP.aSkin, SH = RAMP.shirt, HAIR = RAMP.mHair, I = FIG_INK;
/** The interns: pale, a bit pink; their hair mousy, gelled flat. */
export const PSKIN = ['#6a4434', '#946450', '#b8846a', '#d4a486', '#ecc4a4', '#f8dcc4'];
export const PHAIR = ['#24160a', '#3a2610', '#4c3418', '#644824', '#7c5c34', '#98784c'];
const SHADES = ['#000000', '#06060a', '#10101a', '#1c1c2c', '#30304a'];
const LANYARD = '#c81c1c';

const keep = new Map<string, Put>();
const once = (key: string, make: () => Put) => { let f = keep.get(key); if (!f) { f = make(); keep.set(key, f); } return f; };

// ---------------------------------------------------------------------------
// The agents
// ---------------------------------------------------------------------------

/**
 * An agent standing, front on (feet at 0, 0; the top of his hair at -74): the trousers (`swing`: walking, the legs
 * apart), the shoes shined; the jacket over a chest and shoulders like a door, the sleeves, the hands; the white shirt,
 * the black tie; the neck wider than his head, the traps up into it, the collar losing; the square head, the hair like
 * a helmet, the shades, the earpiece and its coil. `back`: a light behind him (a doorway), round his edges.
 */
export const agentFig = (swing = 0, back: string | null = null) => once(`agent-${swing}-${back}`, () => figure(`agent-${swing}-${back}`, 44, 80, 22, 77, q => {
  // The legs, the shoes
  for (const [s, d] of [[-1, swing], [1, -swing]] as const) {
    const x0 = s < 0 ? -7.5 + d : 0.5 + d;
    q.form(g => { g.moveTo(x0, -27); g.lineTo(x0 + 7, -27); g.lineTo(x0 + 6.5, -3); g.lineTo(x0 + 0.5, -3); g.closePath(); }, { ramp: SUIT, bevel: 2.5, amb: s < 0 ? 0.2 : 0.1, ink: I, inkIn: SUIT[0] });
    q.line(x0 + 2, -24, x0 + 2, -5, SUIT[3]);
    q.form(g => { g.moveTo(x0 - 0.5, -3.5); g.lineTo(x0 + 7, -3.5); g.lineTo(x0 + 8, -1); g.lineTo(x0 + 8, 0); g.lineTo(x0 - 1, 0); g.closePath(); }, { ramp: BOOT, bevel: 1.5, amb: 0.2, ink: I, spec: '#c8c8d8', wet: 0.9 });
    q.px(x0 + 1, -2, '#6a6a7a');
  }
  // The sleeves, hanging off the shoulders (too much arm for them); the hands
  for (const s of [-1, 1]) {
    q.form(g => { g.moveTo(s * 11, -53); g.bezierCurveTo(s * 16, -53, s * 16.5, -48, s * 16, -40); g.lineTo(s * 15.5, -27); g.lineTo(s * 11, -27); g.lineTo(s * 10.5, -44); g.closePath(); },
      { ramp: SUIT, bevel: 3, amb: s < 0 ? 0.2 : 0.08, ink: I, inkIn: SUIT[0] });
    q.line(s * 11, -27, s * 15, -27, SH[2]);
    q.form(g => { g.ellipse(s * 13.2, -24.5, 2.6, 2.8, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 2, amb: s < 0 ? 0.2 : 0.1, ink: I });
    q.line(s * 14.5, -26, s * 14.5, -24, A[1]);
  }
  // The jacket: shoulders like a door, the chest, buttoned, down to its hem
  q.form(g => { g.moveTo(-6, -58); g.lineTo(6, -58); g.lineTo(13, -55); g.bezierCurveTo(15, -53, 13.5, -48, 12, -44); g.lineTo(11, -24); g.lineTo(-11, -24); g.lineTo(-12, -44); g.bezierCurveTo(-13.5, -48, -15, -53, -13, -55); g.closePath(); },
    { ramp: SUIT, bevel: 6, amb: 0.14, ink: I, inkIn: SUIT[0] });
  // (the shirt and the tie in the V, the lapels lit along their edges, the button, the pocket square)
  q.form(g => { g.moveTo(-5, -57); g.lineTo(5, -57); g.lineTo(0.5, -42); g.lineTo(-0.5, -42); g.closePath(); }, { ramp: SH, bevel: 2, amb: 0.35, ink: null });
  q.form(g => { g.moveTo(-1.2, -55); g.lineTo(1.2, -55); g.lineTo(1.5, -43); g.lineTo(0, -41); g.lineTo(-1.5, -43); g.closePath(); }, { ramp: SUIT, bevel: 1, amb: 0.3, ink: null, gain: 1.2 });
  q.line(-5, -56, -1, -41, SUIT[6]); q.line(5, -56, 1, -41, SUIT[4]); q.px(0, -55, SUIT[5]);
  q.px(0, -36, SUIT[5]); q.px(0, -31, SUIT[5]);
  q.line(-9, -49, -6, -49, SH[3]); q.px(-8, -50, SH[4]);
  q.line(-11, -45, -11, -26, SUIT[5]);
  // The neck, wider than his head, out from under the jaw into the collar; the traps sloping up into it
  q.form(g => { g.moveTo(-7, -62); g.lineTo(7, -62); g.lineTo(8.5, -57); g.lineTo(-8.5, -57); g.closePath(); }, { ramp: A, bevel: 3, amb: 0.3, ink: I, inkIn: A[2], gain: 1.08 });
  q.line(-6, -60, -6, -58, A[4]); q.line(5, -60, 5, -58, A[2]);
  q.line(-6, -57, 6, -57, SH[4]); q.px(-6, -57, SH[2]); q.px(6, -57, SH[1]);
  // The ears; the head, square, the jaw
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 7, -67, 1.5, 2.6, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 1, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-6.5, -73); g.lineTo(6.5, -73); g.lineTo(6.5, -63); g.lineTo(4.5, -60); g.lineTo(-4.5, -60); g.lineTo(-6.5, -63); g.closePath(); }, { ramp: A, bevel: 3.5, amb: 0.2, ink: I, inkIn: null });
  q.px(-5, -61, A[2]); q.px(5, -61, A[1]); q.px(-4, -60, A[2]); q.px(4, -60, A[1]);
  // The hair: a helmet, the side parting, the comb's lines, the shine
  q.form(g => { g.moveTo(-7, -68); g.lineTo(-7, -73); g.bezierCurveTo(-7, -76, -3, -77, 0, -77); g.bezierCurveTo(4, -77, 7.5, -76, 7.5, -73); g.lineTo(7.5, -69); g.lineTo(6, -71); g.lineTo(-5, -71.5); g.lineTo(-6, -68); g.closePath(); },
    { ramp: HAIR, bevel: 2, amb: 0.3, ink: I, spec: '#8a8a9c', wet: 0.5 });
  q.px(-3, -76, HAIR[0]); q.line(-1, -75, 5, -75, HAIR[4]); q.line(0, -74, 4, -73, HAIR[3]);
  // The shades: black, flat across, a hard glint
  q.form(g => { g.rect(-6, -68.5, 12.5, 3.5); }, { ramp: SHADES, bevel: 1, amb: 0.3, ink: I, gain: 1.1 });
  q.line(-5, -68, -2, -68, SHADES[4]); q.line(1, -68, 4, -68, SHADES[3]); q.px(-4, -67, '#9a9ab4');
  q.px(0, -66, A[2]);
  // The nose's shadow, the mouth a flat line, the chin's cleft
  q.px(0, -64, A[2]); q.px(-1, -64, A[4]);
  q.line(-2, -62, 1, -62, '#9a5c46');
  q.px(0, -60, A[2]);
  // The earpiece, and its coil down into the collar
  q.rect(7, -68, 1, 2, '#c8c8d0'); for (let k = 0; k < 5; k++) q.px(7 + (k % 2), -65 + k, '#a8a8b4');
  if (back) rimLight(q, -22, 21, -77, -1, back, back, -77);
}));

/** An agent's mouth, open (he's talking): on a figure put down at (x, y). */
export const agentTalk = (ctx: Ctx, x: number, y: number) => { ctx.fillStyle = '#3a0606'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 62, 4, 2); ctx.fillStyle = '#f4ecdc'; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 62, 2, 1); };

/**
 * An agent behind a close-up, out of focus (big; anchored at the top of his hair): no ink, the forms gone soft, the
 * colours run together, the shades a dark bar.
 */
export const agentBlur = once('agent-blur', () => figure('agent-blur', 70, 130, 35, 2, q => {
  const S = ['#141418', '#1c1c22', '#24242c', '#2e2e38'], K = ['#4a3a2e', '#5c4838', '#6e5844', '#806650', '#8c745e'];
  q.form(g => { g.moveTo(-14, 34); g.lineTo(14, 34); g.lineTo(30, 42); g.bezierCurveTo(34, 46, 35, 60, 35, 130); g.lineTo(-35, 130); g.bezierCurveTo(-35, 60, -34, 46, -30, 42); g.closePath(); }, { ramp: S, bevel: 18, amb: 0.3, ink: null });
  q.form(g => { g.moveTo(-6, 34); g.lineTo(6, 34); g.lineTo(1, 60); g.lineTo(-1, 60); g.closePath(); }, { ramp: ['#6a6a70', '#7c7c84', '#8a8a92'], bevel: 3, amb: 0.4, ink: null });
  q.form(g => { g.moveTo(-15, 26); g.lineTo(15, 26); g.bezierCurveTo(19, 30, 22, 33, 24, 36); g.lineTo(-24, 36); g.bezierCurveTo(-22, 33, -19, 30, -15, 26); g.closePath(); }, { ramp: K, bevel: 6, amb: 0.3, ink: null });
  q.form(g => { g.roundRect(-15, 4, 30, 30, 5); }, { ramp: K, bevel: 10, amb: 0.3, ink: null });
  q.form(g => { g.roundRect(-17, 0, 34, 9, 4); }, { ramp: ['#08080a', '#101012', '#18181c', '#222228'], bevel: 4, amb: 0.3, ink: null });
  q.form(g => { g.roundRect(-13, 14, 26, 6, 2); }, { ramp: ['#060608', '#0c0c10', '#16161c'], bevel: 2, amb: 0.4, ink: null });
  q.line(-11, 15, -5, 15, '#2a2a36'); q.line(3, 15, 9, 15, '#2a2a36');
}));

// ---------------------------------------------------------------------------
// The pencil necks
// ---------------------------------------------------------------------------

/**
 * A pencil neck standing, front on (feet at 0, 0; the cowlick at -71): the shoes too big, the trousers pooled on them,
 * legs like sticks in them; the jacket two sizes too big, the shoulder pads out past his shoulders, sagging, the
 * sleeves down over his hands (the fingertips out of the cuffs); the shirt collar standing off a neck like a broom
 * handle, the Adam's apple; the clip-on tie crooked, the lanyard and the badge; the head small, the ears out, the hair
 * gelled flat and parted (a cowlick up anyway), the shades too big for him. `back`: a light behind him, round his edges.
 */
export const pencilFig = (k: number, back: string | null = null) => once(`pencil-${k % 2}-${back}`, () => figure(`pencil-${k % 2}-${back}`, 36, 78, 18, 75, q => {
  const C = CHEAP, P = PSKIN, Hh = PHAIR, v = k % 2;
  // The shoes, too big; the trousers pooling on them, stick legs in them
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -7 : 0.5;
    q.form(g => { g.moveTo(x0 - 0.5, -3); g.lineTo(x0 + 6, -3); g.lineTo(x0 + 7.5, -1); g.lineTo(x0 + 7.5, 0); g.lineTo(x0 - 1, 0); g.closePath(); }, { ramp: BOOT, bevel: 1.5, amb: 0.2, ink: I, spec: '#a8a8b8', wet: 0.6 });
    const lx = s < 0 ? -4.5 : 1;
    q.form(g => { g.moveTo(lx, -24); g.lineTo(lx + 3.5, -24); g.lineTo(lx + 3.8, -6); g.bezierCurveTo(lx + 5.5, -5, lx + 5.5, -3, lx + 4.5, -2.5); g.lineTo(lx - 1, -2.5); g.bezierCurveTo(lx - 2, -3, lx - 2, -5, lx - 0.3, -6); g.closePath(); },
      { ramp: C, bevel: 2, amb: s < 0 ? 0.2 : 0.1, ink: I, inkIn: C[0] });
    q.line(lx - 1, -4, lx + 4, -5, C[1]); q.line(lx, -6, lx + 3, -7, C[1]);
  }
  // The sleeves, hanging, too long: the cuffs down over his hands, the fingertips out of them
  for (const s of [-1, 1]) {
    q.form(g => { g.moveTo(s * 9, -46); g.bezierCurveTo(s * 13, -46, s * 13, -43, s * 12.5, -38); g.lineTo(s * 12.5, -22); g.lineTo(s * 8.5, -21.5); g.lineTo(s * 8.5, -40); g.closePath(); },
      { ramp: C, bevel: 2.5, amb: s < 0 ? 0.2 : 0.08, ink: I, inkIn: C[0] });
    q.line(s * 9, -30, s * 12, -31, C[1]); q.line(s * 9, -26, s * 12, -27, C[1]);
    q.px(s * 10, -21, P[3]); q.px(s * 11, -21, P[2]);
  }
  // The jacket: boxy, the pads out past him, sagging off the ends of them; buttoned once, the hem down past his seat
  q.form(g => { g.moveTo(-3, -48); g.lineTo(3, -48); g.lineTo(11.5, -47); g.bezierCurveTo(12.5, -46, 12, -44.5, 10.5, -44); g.lineTo(8.5, -43); g.lineTo(8.5, -21); g.lineTo(-8.5, -21); g.lineTo(-8.5, -43); g.lineTo(-10.5, -44); g.bezierCurveTo(-12, -44.5, -12.5, -46, -11.5, -47); g.closePath(); },
    { ramp: C, bevel: 4, amb: 0.16, ink: I, inkIn: C[0] });
  // (the shirt in the V, the collar standing off his neck; the clip-on tie, crooked; the lapels)
  q.form(g => { g.moveTo(-3.5, -47); g.lineTo(3.5, -47); g.lineTo(0.5, -36); g.lineTo(-0.5, -36); g.closePath(); }, { ramp: SH, bevel: 1.5, amb: 0.35, ink: null });
  q.form(g => { g.moveTo(-0.5 + v, -46); g.lineTo(1.5 + v, -46); g.lineTo(2.2 + v, -37); g.lineTo(1 + v, -36); g.lineTo(-0.2 + v, -37); g.closePath(); }, { ramp: ['#0c1440', '#16205c', '#1c2c6c', '#2c3c8c', '#4050a8'], bevel: 1, amb: 0.3, ink: null });
  q.px(v, -47, '#9c9ca4'); q.px(1 + v, -47, '#c8c8d0');
  q.line(-3.5, -46, -0.5, -36, C[5]); q.line(3.5, -46, 0.5, -36, C[3]);
  q.px(0, -32, C[5]); q.line(-8, -40, -8, -23, C[4]);
  // (the shoulder pads' corners, sticking out with nothing in them)
  q.px(-11, -47, C[6]); q.px(-10, -47, C[5]); q.px(11, -46, C[3]);
  // The lanyard round his neck and the badge on the end of it, flapping
  q.line(-2, -46, -4, -38, LANYARD); q.line(2, -46, -2, -38, LANYARD);
  q.form(g => { g.rect(-6, -38, 5, 4); }, { ramp: ['#a8a8b0', '#d8d8e0', '#fcfcfc'], bevel: 1, amb: 0.5, ink: I });
  q.px(-5, -37, '#9cc4dc'); q.line(-3, -37, -2, -37, I);
  // The neck: a broom handle, the collar loose round it; the Adam's apple
  q.form(g => { g.rect(-1.5, -57, 3, 10); }, { ramp: P, bevel: 1.2, amb: 0.2, ink: I });
  q.px(0, -52 + v, P[5]); q.px(1, -52 + v, P[2]);
  q.line(-3.5, -47, -1.5, -48, SH[4]); q.line(3.5, -47, 1.5, -48, SH[2]);
  // The ears, out; the head, small
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 5, -61.5, 1.6, 2.4, 0, 0, Math.PI * 2); }, { ramp: P, bevel: 1, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-4.5, -67); g.lineTo(4.5, -67); g.lineTo(4.5, -59); g.bezierCurveTo(4, -56.5, 2, -56, 0, -56); g.bezierCurveTo(-2, -56, -4, -56.5, -4.5, -59); g.closePath(); }, { ramp: P, bevel: 3, amb: 0.2, ink: I, inkIn: P[1] });
  // The hair: gelled flat, parted, shining; the cowlick
  q.form(g => { g.moveTo(-5, -63); g.lineTo(-5, -67); g.bezierCurveTo(-5, -69, -2, -69.5, 0, -69.5); g.bezierCurveTo(3, -69.5, 5.5, -69, 5.5, -67); g.lineTo(5, -65); g.lineTo(-3.5, -66); g.closePath(); },
    { ramp: Hh, bevel: 1.5, amb: 0.3, ink: I, spec: '#d8c8a8', wet: 0.6 });
  q.line(-2, -69, -2, -67, Hh[0]); q.line(0, -68, 3, -68, Hh[5]);
  q.line(2 + v, -70, 3 + v, -72, Hh[3]); q.px(4 + v, -72, Hh[2]); q.px(2 + v, -70, I);
  // The shades: too big for him, out past his head, slipped down his nose
  q.form(g => { g.rect(-5.5, -62.5, 11.5, 2.5); }, { ramp: SHADES, bevel: 1, amb: 0.3, ink: I });
  q.line(-4, -62, -2, -62, SHADES[4]); q.line(1, -62, 3, -62, SHADES[3]);
  // (the brows up over the top of them; the mouth, a wobble)
  q.line(-4, -65, -2, -66, Hh[1]); q.line(1, -66, 3, -65, Hh[1]);
  q.px(-1, -58, '#8c5040'); q.px(0, -57, '#8c5040'); q.px(1, -58, '#8c5040');
  if (back) rimLight(q, -18, 17, -48, -22, back, back, -48);
}));

/**
 * A pencil neck behind a close-up, out of focus (big; anchored at the top of his head): the head small on the neck,
 * the hair flat, the shades a dark bar; the jacket's shoulders out past his own, sagging.
 */
export const pencilBlur = once('pencil-blur', () => figure('pencil-blur', 48, 150, 24, 4, q => {
  const S = ['#16161c', '#1e1e26', '#262630', '#30303c'], K = ['#5c4838', '#6e5848', '#806856', '#8c7460', '#9a826c'], H = ['#1c140c', '#2c2014', '#3a2a1a'];
  q.form(g => { g.moveTo(-6, 40); g.lineTo(6, 40); g.lineTo(18, 43); g.bezierCurveTo(20, 45, 19, 48, 17, 50); g.lineTo(16, 146); g.lineTo(-16, 146); g.lineTo(-17, 50); g.bezierCurveTo(-19, 48, -20, 45, -18, 43); g.closePath(); }, { ramp: S, bevel: 10, amb: 0.3, ink: null });
  q.form(g => { g.moveTo(-5, 40); g.lineTo(5, 40); g.lineTo(1, 62); g.lineTo(-1, 62); g.closePath(); }, { ramp: ['#7c7c84', '#8c8c94', '#9c9ca4'], bevel: 2, amb: 0.4, ink: null });
  q.form(g => { g.rect(-3, 18, 6, 24); }, { ramp: K, bevel: 3, amb: 0.3, ink: null });
  q.form(g => { g.roundRect(-9, 0, 18, 22, 5); }, { ramp: K, bevel: 7, amb: 0.3, ink: null });
  q.form(g => { g.roundRect(-10, -2, 20, 6, 3); }, { ramp: H, bevel: 2, amb: 0.4, ink: null });
  q.form(g => { g.roundRect(-9, 8, 18, 5, 2); }, { ramp: ['#060608', '#0c0c10', '#16161c'], bevel: 2, amb: 0.4, ink: null });
}));

/** The light from a doorway behind them, round their edges. */
export const DOOR_RIM = '#a49c80';

