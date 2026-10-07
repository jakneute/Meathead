// The epilogue's pictures (after the alien's dead): the real President found tied up in a broom closet in the
// sub-basement, a rack of spare skins behind the mops; then an emergency press conference on the lawn in front of the
// burning White House; and one more punch, which sends him up over the roof and off into the night (a twinkle) as it
// irises in on Meathead. THE END. For real.
//
// Pixel art on the ending's 256 x 144 canvas (ending.ts), stepped ramps, banded skies; the static parts painted once.

import { ART_W, ART_H, C, R, ell, hash, podium, reporters, meatheadPunched, trumpFlying, figure, over, rimLight, mhStandingFig, FIG_INK, BOOT } from './ending';
import { shaded, bands, layer, RAMP } from './art/snes';
import { SUIT } from './suits';
import { shatPants, shatFront } from './shatLook';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const FIRE_RIM = '#f87c00', FIRE_HOT = '#fcb820', FIRE_DIM = '#a8400c';

/**
 * Pixel fire: tongues of it up from a base line, each column flickering on its own: dark red at the tips, red,
 * orange, yellow, nearly white at the root.
 */
const FIRE = ['#5c0a00', '#a81c00', '#e04000', '#f87c00', '#fcb820', '#fce890', '#fffbe0'];
export const pixFire = (ctx: Ctx, x: number, baseY: number, w: number, h: number, t: number, seed: number) => {
  for (let i = 0; i < w; i++) {
    const env = Math.sin(((i + 0.5) / w) * Math.PI) ** 0.7;
    const fl = 0.55 + 0.45 * Math.sin(t * 0.45 + i * 1.7 + seed) * Math.sin(t * 0.23 + i * 0.9 + seed * 2);
    const ch = Math.round(h * env * (0.45 + 0.55 * fl) * (0.7 + 0.3 * hash(i * 3.1 + seed + Math.floor(t / 3))));
    for (let y = 0; y < ch; y++) {
      const k = y / Math.max(1, ch);
      const ci = Math.min(FIRE.length - 1, Math.max(0, Math.round((1 - k) * (FIRE.length - 1) - (Math.abs(i - w / 2) / w) * 2)));
      R(ctx, x + i, baseY - y - 1, 1, 1, FIRE[ci]);
    }
  }
};

/** Smoke rolling up off a fire: puffs, each dark on top and lit orange from under, drifting off with the wind. */
const smokeColumn = (ctx: Ctx, x: number, y: number, rise: number, r0: number, t: number, seed: number, n = 9) => {
  for (let i = n - 1; i >= 0; i--) {
    const p = ((t * 0.25 + i * (60 / n) + seed * 13) % 60) / 60;
    const px = x + p * rise * 0.5 + Math.sin(p * 5 + seed + i) * 4, py = y - p * rise, r = r0 + p * r0 * 1.6;
    ell(ctx, px, py, r, r * 0.8, p > 0.75 ? '#241a1c' : '#1c1416');
    ell(ctx, px - 1, py - 1, r - 1, r * 0.8 - 1, '#30262a');
    ell(ctx, px - r * 0.3, py - r * 0.3, r * 0.5, r * 0.4, '#3e3236');
    if (p < 0.6) ell(ctx, px + r * 0.1, py + r * 0.45, r * 0.6, r * 0.25, p < 0.3 ? '#8a3a14' : '#5a2a18');
  }
};

// ---------------------------------------------------------------------------
// The broom closet
// ---------------------------------------------------------------------------

/** The closet, empty: dingy walls, the shelves of cleaning stuff, the mop and bucket, the open door. Painted once. */
const closetSet = (ctx: Ctx) => layer(ctx, 'ep-closet', ART_W, ART_H, g => {
  bands(g, 0, 0, ART_W, 112, ['#141810', '#1a2016', '#20281c', '#283020', '#2e3824', '#343e28']);
  // (a pipe along the top, sweating; water stains)
  R(g, 0, 8, ART_W, 4, '#3a3a40'); R(g, 0, 8, ART_W, 1, '#6a6a74'); for (let x = 30; x < ART_W; x += 60) R(g, x, 7, 3, 6, '#4a4a54');
  for (let i = 0; i < 6; i++) { const x = 70 + i * 34; for (let y = 12; y < 30 + (i % 3) * 8; y++) R(g, x + Math.round(Math.sin(y * 0.3) * 1), y, 2, 1, 'rgba(60, 50, 20, 0.35)'); }
  // The floor: grimy checked tiles going back
  for (let y = 112; y < ART_H; y += 4) for (let x = 0; x < ART_W; x += 8) R(g, x + ((y / 4) % 2) * 4, y, 4, 4, (y / 4) % 2 ? '#2c2c24' : '#3a3a30');
  R(g, 0, 112, ART_W, 1, '#4a4a3c');
  // Shelves on the back wall: bottles, sprays, rolls of toilet paper, a box of rubber gloves
  for (const sy of [36, 62]) {
    R(g, 150, sy, 104, 3, '#5a4028'); R(g, 150, sy, 104, 1, '#8a6a44'); R(g, 150, sy + 3, 104, 1, '#1a1008');
    for (let i = 0; i < 9; i++) {
      const bx = 154 + i * 11, h = 8 + (i * 5) % 6, col = ['#2a7ac8', '#e8d040', '#c82828', '#48a848', '#e8e8e8'][(i + sy) % 5];
      R(g, bx, sy - h, 7, h, col); R(g, bx, sy - h, 2, h, 'rgba(255,255,255,0.3)'); R(g, bx + 2, sy - h - 3, 3, 3, '#1c1c1c');
    }
  }
  for (let k = 0; k < 4; k++) { ell(g, 160 + k * 9, 84, 4, 4, '#e8e8e0'); ell(g, 160 + k * 9, 84, 1, 1, '#8a8a80'); }
  for (let k = 0; k < 3; k++) { ell(g, 164 + k * 9, 77, 4, 4, '#f4f4ec'); ell(g, 164 + k * 9, 77, 1, 1, '#8a8a80'); }
  R(g, 200, 74, 22, 14, '#4a7ac8'); R(g, 200, 74, 22, 1, '#7aa0e8'); R(g, 205, 77, 12, 3, C.white);
  // The mop in its bucket (yellow, wringer on top), leaning
  R(g, 222, 96, 26, 22, '#d8b020'); R(g, 222, 96, 26, 2, '#f8d850'); R(g, 244, 96, 4, 22, '#a07c10');
  R(g, 220, 92, 30, 4, '#5a5a5a'); R(g, 220, 92, 30, 1, '#8a8a8a');
  for (let k = 0; k < 60; k++) R(g, 236 - Math.floor(k / 6), 92 - k, 2, 1, '#9a7040');
  for (let k = 0; k < 7; k++) R(g, 228 + k * 2, 92, 1, 6 + (k % 3), '#c8c0a8');
  // The door, open, at the left: the hall light flooding in; its frame
  R(g, 0, 14, 40, 112, '#f8f0c8'); R(g, 0, 14, 40, 112, 'rgba(255,255,255,0.4)');
  R(g, 40, 12, 4, 112, '#5a4028'); R(g, 40, 12, 1, 112, '#8a6a44'); R(g, 0, 12, 44, 3, '#5a4028');
  // (the light across the floor from the door)
  g.fillStyle = 'rgba(248, 240, 200, 0.14)';
  g.beginPath(); g.moveTo(40, 112); g.lineTo(40, 126); g.lineTo(220, ART_H); g.lineTo(130, 112); g.closePath(); g.fill();
});

/**
 * An agent in the closet's doorway, the hall light behind him (painted once): the black suit near black from the
 * front, the light round every edge of him (the hair, the shoulders, down the legs); the shades; the arm out with the
 * flashlight, its lens lit.
 */
const doorAgent = figure('closet-agent', 50, 96, 24, 92, q => {
  const S = SUIT, A = ['#24160e', '#301e14', '#3e281a', '#4c3222'], I = FIG_INK, HALL = '#f8f0c8', HALL_D = '#c8bc94';
  // The legs, the shoes
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -8.5 : 0.5;
    q.form(g => { g.moveTo(x0, -31); g.lineTo(x0 + 8, -31); g.lineTo(x0 + 7.5, -3); g.lineTo(x0 + 0.5, -3); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.05, gain: 0.55, ink: I, inkIn: S[0] });
    q.form(g => { g.moveTo(x0 - 0.5, -3.5); g.lineTo(x0 + 8, -3.5); g.lineTo(x0 + 9, -1); g.lineTo(x0 + 9, 0); g.lineTo(x0 - 1, 0); g.closePath(); }, { ramp: BOOT, bevel: 1.5, amb: 0.1, ink: I });
  }
  // The far arm, hanging; the near one, out ahead of him with the flashlight
  q.form(g => { g.moveTo(-11, -64); g.bezierCurveTo(-16, -64, -17, -58, -16.5, -50); g.lineTo(-16, -33); g.lineTo(-11.5, -33); g.lineTo(-11, -52); g.closePath(); }, { ramp: S, bevel: 3, amb: 0.05, gain: 0.55, ink: I, inkIn: S[0] });
  q.form(g => { g.ellipse(-13.8, -30.5, 2.6, 2.8, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 2, amb: 0.35, ink: I });
  // The jacket: the shoulders like a door
  q.form(g => { g.moveTo(-6, -70); g.lineTo(6, -70); g.lineTo(13, -67); g.bezierCurveTo(15, -64, 13.5, -58, 12, -54); g.lineTo(11, -28); g.lineTo(-11, -28); g.lineTo(-12, -54); g.bezierCurveTo(-13.5, -58, -15, -64, -13, -67); g.closePath(); },
    { ramp: S, bevel: 6, amb: 0.05, gain: 0.55, ink: I, inkIn: S[0] });
  q.form(g => { g.moveTo(-4.5, -69); g.lineTo(4.5, -69); g.lineTo(0.5, -53); g.lineTo(-0.5, -53); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2, amb: 0.2, gain: 0.45, ink: null });
  q.form(g => { g.moveTo(-1.2, -67); g.lineTo(1.2, -67); g.lineTo(1.5, -54); g.lineTo(0, -52); g.lineTo(-1.5, -54); g.closePath(); }, { ramp: S, bevel: 1, amb: 0.2, ink: null });
  q.form(g => { g.moveTo(8, -67); g.bezierCurveTo(13, -67, 15, -63, 15, -59); g.lineTo(13, -53.5); g.lineTo(8.5, -55); g.lineTo(8, -62); g.closePath(); }, { ramp: S, bevel: 2.5, amb: 0.05, gain: 0.6, ink: I, inkIn: S[0] });
  q.form(g => { g.ellipse(14, -56, 2.8, 3, 0, 0, Math.PI * 2); }, { ramp: A, bevel: 2, amb: 0.35, ink: I });
  // The flashlight: its barrel, the lens lit
  q.form(g => { g.roundRect(9, -58, 12, 4, 1); }, { ramp: ['#202026', '#3a3a44', '#5c5c68', '#8a8a96'], bevel: 1.5, amb: 0.3, ink: I });
  q.form(g => { g.rect(20, -59.5, 3, 7); }, { ramp: ['#5c5c68', '#8a8a96', '#c8c8d0'], bevel: 1, amb: 0.3, ink: I });
  q.line(22, -58, 22, -54, '#fffbe0'); q.px(22, -56, '#ffffff');
  // The neck, the head, the hair, the shades
  q.form(g => { g.moveTo(-7.5, -76); g.lineTo(7.5, -76); g.lineTo(9, -69); g.lineTo(-9, -69); g.closePath(); }, { ramp: A, bevel: 3, amb: 0.35, ink: I, inkIn: null });
  q.form(g => { g.moveTo(-7, -88); g.lineTo(7, -88); g.lineTo(7, -77); g.lineTo(5, -74); g.lineTo(-5, -74); g.lineTo(-7, -77); g.closePath(); }, { ramp: A, bevel: 3.5, amb: 0.35, ink: I, inkIn: null });
  q.line(-2, -76, 1, -76, '#1a0e0a'); q.px(0, -79, A[0]);
  q.form(g => { g.moveTo(-7.5, -82); g.lineTo(-7.5, -88); g.bezierCurveTo(-7.5, -91, -3, -92, 0, -92); g.bezierCurveTo(4, -92, 8, -91, 8, -88); g.lineTo(8, -83); g.lineTo(6, -86); g.lineTo(-5.5, -86); g.closePath(); }, { ramp: RAMP.mHair, bevel: 2, amb: 0.2, ink: I });
  q.form(g => { g.rect(-6.5, -83, 13.5, 3.5); }, { ramp: ['#000000', '#06060a', '#10101a', '#20202e'], bevel: 1, amb: 0.3, ink: I });
  q.line(-5, -82, -2, -82, '#3a3a50');
  // The hall light round him: hot at the top, down every edge
  rimLight(q, -24, 25, -92, -1, HALL_D, HALL, -66);
  for (let x = -8; x <= 8; x++) for (let y = -93; y < -84; y++) if (q.painted(x, y)) { q.px(x, y + 1, HALL); break; }
});

/** The agents in the doorway, the hall light behind them, flashlights up; the beams. */
const agentsInDoor = (ctx: Ctx, t: number) => {
  doorAgent(ctx, 12, 124);
  doorAgent(ctx, 30, 126);
  // The beams, swinging a little
  const sw = Math.sin(t * 0.05) * 6;
  ctx.fillStyle = 'rgba(255, 250, 220, 0.12)';
  ctx.beginPath(); ctx.moveTo(51, 68); ctx.lineTo(176 + sw, 50); ctx.lineTo(186 + sw, 112); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(33, 70); ctx.lineTo(150 - sw, 66); ctx.lineTo(160 - sw, 126); ctx.closePath(); ctx.fill();
};

/**
 * The fast food they've been keeping him on, painted once: a burger wrapper balled up, fries boxes (the fries spilling),
 * cups (the lids, the straws), a bucket of chicken (a drumstick on top), napkins; greasy.
 */
const junkPile = figure('closet-junk', ART_W, ART_H, 0, 0, q => {
  const I = FIG_INK, Y = ['#7a5a08', '#b48c14', '#e0b830', '#f0d040', '#fcf0a0'], Rd = RAMP.red, W = ['#8c8c84', '#b4b4a8', '#dcdcd0', '#f4f4ec', '#ffffff'];
  const F = ['#a07018', '#c89028', '#e8b840', '#f8d850', '#fcf0a0'], CH = ['#5a2a08', '#8a4410', '#b8661c', '#d88a30', '#f0b050'];
  const items: [number, number, number][] = [[96, 132, 0], [112, 138, 1], [180, 134, 2], [196, 128, 3], [86, 124, 2], [204, 138, 0], [120, 126, 4], [170, 140, 1]];
  for (const [x, y, k] of items) {
    q.disc(x, y + 1, 7, 1.5, '#1a1a14');
    if (k === 0) {
      // (a burger wrapper, balled; the sauce on it)
      q.form(g => { g.moveTo(x - 5, y + 1); g.lineTo(x - 4, y - 3); g.lineTo(x, y - 4); g.lineTo(x + 5, y - 2); g.lineTo(x + 5, y + 1); g.closePath(); }, { ramp: Y, bevel: 2, amb: 0.25, ink: I });
      q.line(x - 3, y - 2, x + 1, y - 1, Y[1]); q.px(x - 1, y - 2, Rd[3]); q.px(x, y - 1, Rd[2]);
    } else if (k === 1) {
      // (a fries box, on its side, the fries out of it)
      for (let f = 0; f < 5; f++) q.stroke(g => { g.moveTo(x - 3 + f * 1.5, y - 6); g.lineTo(x - 4 + f * 2, y - 11 + (f % 2)); }, 1.6, { ramp: F, bevel: 1, amb: 0.3, ink: '#6a4a10' });
      q.form(g => { g.moveTo(x - 4, y - 7); g.lineTo(x + 4, y - 7); g.lineTo(x + 3, y); g.lineTo(x - 3, y); g.closePath(); }, { ramp: Rd, bevel: 2, amb: 0.2, ink: I });
      q.line(x - 2, y - 4, x + 2, y - 4, Y[3]);
    } else if (k === 2) {
      // (a cup, the lid, the straw)
      q.form(g => { g.moveTo(x - 3.5, y - 9); g.lineTo(x + 3.5, y - 9); g.lineTo(x + 2.5, y); g.lineTo(x - 2.5, y); g.closePath(); }, { ramp: W, bevel: 2, amb: 0.25, ink: I });
      q.rect(x - 3, y - 6, 6, 2, Rd[3]); q.line(x - 3, y - 6, x - 2, y - 6, Rd[5]);
      q.form(g => { g.rect(x - 4, y - 10.5, 8, 2); }, { ramp: W, bevel: 1, amb: 0.3, ink: I });
      q.line(x, y - 14, x + 1, y - 10, '#e8e8e8'); q.px(x, y - 14, Rd[3]);
    } else if (k === 3) {
      // (the bucket of chicken: the stripes, a drumstick and a wing on top)
      q.form(g => { g.moveTo(x - 7.5, y - 12); g.lineTo(x + 7.5, y - 12); g.lineTo(x + 6, y); g.lineTo(x - 6, y); g.closePath(); }, { ramp: Rd, bevel: 3, amb: 0.2, ink: I });
      for (let k2 = 0; k2 < 3; k2++) q.line(x - 5 + k2 * 5, y - 11, x - 4 + k2 * 4, y - 1, W[3]);
      q.form(g => { g.ellipse(x - 2, y - 14, 5, 3, -0.3, 0, Math.PI * 2); }, { ramp: CH, bevel: 2.5, amb: 0.25, ink: I, spec: '#fce8a8', wet: 0.4 });
      q.form(g => { g.ellipse(x + 3, y - 15, 3.5, 2.5, 0.4, 0, Math.PI * 2); }, { ramp: CH, bevel: 2, amb: 0.25, ink: I });
      q.line(x - 7, y - 17, x - 6, y - 15, W[3]); q.px(x - 7, y - 18, W[4]);
    } else {
      // (a napkin, crumpled, a smear on it)
      q.form(g => { g.moveTo(x - 6, y); g.lineTo(x - 5, y - 3); g.lineTo(x + 1, y - 4); g.lineTo(x + 6, y - 2); g.lineTo(x + 5, y); g.closePath(); }, { ramp: W, bevel: 1.5, amb: 0.3, ink: I });
      q.line(x - 2, y - 2, x + 2, y - 2, '#c8a060');
    }
  }
});

/**
 * The real President, tied to a folding chair (painted once, each way his hair's swinging): down to his undershirt
 * (stained, riding up over the belly, the gut out under it), boxers with the flag on them, black socks pulled up; the
 * rope round him and the chair, three times; his arms behind; the tape over his mouth; bags, stubble; the swoop come
 * undone, a long sheet of it hanging off one side of his head, the scalp pale on top.
 */
const tiedFig = (sw: number) => figure(`closet-tied-${sw}`, 50, 92, 25, 86, q => {
  const T = RAMP.tSkin, Hh = RAMP.tHair, I = FIG_INK, St = RAMP.steel, SH = RAMP.shirt;
  const PALE = ['#a86848', '#d08c64', '#ecac84', '#fcc8a0', '#fde0c4'];
  // The chair: folding, metal, its back up behind him
  for (const x of [-12, 12]) q.form(g => { g.rect(x - 1, -31, 2.5, 31); }, { ramp: St, bevel: 1, amb: 0.2, ink: I });
  q.form(g => { g.rect(-13, -60, 2.5, 30); }, { ramp: St, bevel: 1, amb: 0.2, ink: I });
  q.form(g => { g.rect(10.5, -60, 2.5, 30); }, { ramp: St, bevel: 1, amb: 0.1, ink: I });
  q.form(g => { g.roundRect(-12.5, -60, 25, 5, 1); }, { ramp: St, bevel: 1.5, amb: 0.2, ink: I });
  q.form(g => { g.rect(-14.5, -32, 29, 3); }, { ramp: St, bevel: 1, amb: 0.2, ink: I });
  // The legs: pale shins, black socks pulled up, black shoes
  for (const lx of [-10, 3]) {
    q.form(g => { g.rect(lx, -29, 7, 14); }, { ramp: PALE, bevel: 2.5, amb: 0.2, ink: I });
    q.form(g => { g.rect(lx, -17, 7, 14); }, { ramp: BOOT, bevel: 2, amb: 0.2, ink: I });
    q.line(lx + 1, -16, lx + 5, -16, BOOT[4]);
    q.form(g => { g.roundRect(lx - 1, -4, 9, 4, 1); }, { ramp: BOOT, bevel: 1.5, amb: 0.2, ink: I, spec: '#a8a8b8', wet: 0.6 });
    for (const y of [-27, -24, -21]) q.px(lx + 2 + (y & 1), y, PALE[1]);
  }
  // The boxers: the flag (stripes and the canton), bunched
  q.form(g => { g.roundRect(-13, -37, 26, 9, 2); }, { ramp: ['#f0f0f0', '#f0f0f0'], bevel: 1, ink: I });
  for (let y = -36; y < -28; y++) for (let x = -12; x < 12; x++) if ((y & 1) === 0) q.px(x, y, RAMP.red[3]);
  q.rect(-12, -36, 9, 4, RAMP.navy[3]); q.px(-10, -35, '#fcfcfc'); q.px(-7, -34, '#fcfcfc'); q.px(-5, -35, '#fcfcfc');
  q.line(-12, -29, 11, -29, RAMP.red[1]); q.line(0, -33, 0, -29, RAMP.red[1]);
  // His arms behind the chair's back
  q.form(g => { g.roundRect(-18.5, -61, 4, 19, 2); }, { ramp: T, bevel: 1.5, amb: 0.2, ink: I });
  q.form(g => { g.roundRect(14.5, -61, 4, 19, 2); }, { ramp: T, bevel: 1.5, amb: 0.06, ink: I });
  // The undershirt over the belly, riding up; the gut out under it, the navel; the stains
  q.form(g => { g.moveTo(-14, -57); g.lineTo(14, -57); g.bezierCurveTo(17, -50, 17, -43, 15, -39); g.lineTo(-15, -39); g.bezierCurveTo(-17, -43, -17, -50, -14, -57); g.closePath(); }, { ramp: SH, bevel: 8, amb: 0.12, ink: I });
  q.form(g => { g.moveTo(-14, -40); g.lineTo(14, -40); g.bezierCurveTo(14, -35, 8, -33, 0, -33); g.bezierCurveTo(-8, -33, -14, -35, -14, -40); g.closePath(); }, { ramp: T, bevel: 4, amb: 0.2, ink: I });
  q.px(0, -36, T[1]); q.px(0, -37, T[2]);
  q.line(-6, -49, -3, -48, '#c8a050'); q.px(-5, -50, '#c8a050'); q.px(-4, -47, '#b08840'); q.line(4, -44, 6, -45, '#a83018'); q.px(6, -44, '#c83c20'); q.line(-12, -52, -12, -47, '#c8b070');
  q.line(-13, -40, 13, -40, SH[0]);
  // The shoulders, bare, the straps of the undershirt over them
  q.form(g => { g.moveTo(-17, -55); g.bezierCurveTo(-17, -60, -12, -62, -6, -62); g.lineTo(6, -62); g.bezierCurveTo(12, -62, 17, -60, 17, -55); g.lineTo(14, -54); g.lineTo(-14, -54); g.closePath(); }, { ramp: T, bevel: 3.5, amb: 0.2, ink: I });
  for (const x of [-8, 5]) q.form(g => { g.rect(x, -62, 3, 7); }, { ramp: SH, bevel: 1, amb: 0.3, ink: null });
  // The rope: round him and the chair, three times, the twist in it
  for (const ry of [-54, -47, -40]) {
    q.stroke(g => { g.moveTo(-17, ry - 1); g.quadraticCurveTo(0, ry + 4, 17, ry - 1); }, 2.4, { ramp: ['#6a4a1c', '#8a6a30', '#b08a48', '#d0aa68', '#e8c888'], bevel: 1, amb: 0.3, ink: I });
    for (let k = -15; k < 16; k += 3) q.px(k, Math.round(ry - 1 + 2.5 * (1 - (k / 17) ** 2)), '#8a6a30');
  }
  // The head: the jowls, stubble, the bags, the tape over the mouth
  const hy = -76;
  q.form(g => { g.moveTo(-8, hy + 2); g.bezierCurveTo(-8, hy - 1, 8, hy - 1, 8, hy + 2); g.lineTo(9, hy + 11); g.bezierCurveTo(10, hy + 17, 5, hy + 19, 0, hy + 19); g.bezierCurveTo(-5, hy + 19, -10, hy + 17, -9, hy + 11); g.closePath(); },
    { ramp: T, bevel: 6, amb: 0.2, ink: I, inkIn: T[1] });
  for (let i = 0; i < 22; i++) q.px(-7 + Math.floor(hash(i * 1.7) * 14), hy + 11 + Math.floor(hash(i * 2.9) * 7), '#9c5a30');
  for (const s of [-1, 1]) { q.form(g => { g.ellipse(s * 4, hy + 7, 3.2, 2.2, 0, 0, Math.PI * 2); }, { ramp: PALE.slice(2), bevel: 1.5, amb: 0.4, ink: null }); q.line(s * 4 - 2, hy + 9, s * 4 + 2, hy + 9, T[1]); }
  q.px(0, hy + 8, T[6]); q.px(0, hy + 9, T[5]); q.px(0, hy + 10, T[2]); q.px(1, hy + 10, T[2]);
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 9, hy + 8, 1.8, 3, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 1.2, amb: 0.2, ink: I });
  // The tape: grey, shiny, slapped across, a corner curling
  q.form(g => { g.moveTo(-7, hy + 12); g.lineTo(7, hy + 11.5); g.lineTo(7.5, hy + 16); g.lineTo(-7, hy + 16.5); g.closePath(); }, { ramp: ['#5a5a62', '#7a7a84', '#a8a8b0', '#c8c8d0', '#e8e8f0'], bevel: 1.5, amb: 0.3, ink: I, spec: '#ffffff', wet: 0.5 });
  q.line(-6, hy + 14, 6, hy + 14, '#8a8a92'); q.px(7, hy + 11, '#d8d8e0'); q.px(8, hy + 10, '#a8a8b0');
  // The hair: the scalp pale on top, the swoop come undone, a long sheet of it hanging off the side, swinging
  q.form(g => { g.ellipse(0, hy + 1, 7.5, 2.8, 0, 0, Math.PI * 2); }, { ramp: PALE.slice(1), bevel: 2, amb: 0.3, ink: null });
  q.px(-2, hy, '#fff4e8'); q.px(-1, hy, '#fff4e8');
  q.form(g => { g.moveTo(-9, hy + 7); g.bezierCurveTo(-10, hy + 1, -8, hy - 1, -4, hy - 1); g.lineTo(-3, hy + 1); g.bezierCurveTo(-6, hy + 2, -7, hy + 4, -7, hy + 7); g.closePath(); }, { ramp: Hh, bevel: 1.5, amb: 0.25, ink: '#5a3a04' });
  q.stroke(g => { g.moveTo(6, hy - 1); g.bezierCurveTo(11 + sw * 0.5, hy + 3, 10 + sw, hy + 14, 11 + sw, hy + 24); }, 2.6, { ramp: Hh, bevel: 1.5, amb: 0.25, ink: '#5a3a04', spec: '#fffef0', wet: 0.4 });
  q.line(8, hy + 1, 10 + sw, hy + 12, Hh[5]);
  q.line(1, hy - 2, 3, hy - 4, Hh[3]); q.px(4, hy - 4, Hh[2]);
});

/** He's struggling: rocking the chair, his eyes going from one of them to the other, sweat flying, MMPH. */
const tiedUp = (ctx: Ctx, cx: number, floor: number, t: number) => {
  const rock = t % 50 < 12 ? (t % 6 < 3 ? -1 : 1) : 0;
  const x = cx + rock, sw = Math.round(Math.sin(t * 0.08) * 1.4);
  tiedFig(sw)(ctx, x, floor);
  // (eyes wide, darting)
  const hy = floor - 76, look = t % 40 < 20 ? -1 : 1;
  R(ctx, x - 5, hy + 6, 3, 2, '#f4ecdc'); R(ctx, x + 3, hy + 6, 3, 2, '#f4ecdc');
  R(ctx, x - 4 + look, hy + 6, 1, 2, FIG_INK); R(ctx, x + 4 + look, hy + 6, 1, 2, FIG_INK);
  R(ctx, x - 5, hy + 6, 1, 1, '#e07060'); R(ctx, x + 5, hy + 6, 1, 1, '#e07060');
  // (sweat flying off him as he struggles)
  if (rock) { R(ctx, x - 14, hy + 2 - (t % 6), 1, 2, '#c8e8ff'); R(ctx, x + 14, hy - (t % 5), 1, 2, '#c8e8ff'); }
  // ("MMPH": muffled bursts off the tape)
  if (t % 50 < 12) for (let k = 0; k < 3; k++) R(ctx, x + 10 + k * 3, hy + 13 - k * 3, 2, 1, 'rgba(255,255,255,0.7)');
};

/** The closet, the agents in the door, the President tied up in the middle of a heap of fast food, the bulb swinging. */
export const drawCloset = (ctx: Ctx, t: number) => {
  closetSet(ctx);
  // The bulb, on its cord, swinging; its light swinging with it
  const bx = 136 + Math.round(Math.sin(t * 0.06) * 10);
  for (let y = 0; y < 22; y++) R(ctx, 136 + Math.round(((bx - 136) * y) / 22), y, 1, 1, C.ink);
  ell(ctx, bx, 24, 2, 3, '#fcf8d8'); R(ctx, bx - 1, 20, 3, 2, '#8a8a8a');
  for (const [r, a] of [[90, 0.05], [64, 0.06], [40, 0.07]] as const) { ctx.fillStyle = `rgba(252, 240, 180, ${a})`; ctx.beginPath(); ctx.ellipse(bx, 110, r, r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
  junkPile(ctx, 0, 0);
  tiedUp(ctx, 140, 126, t);
  agentsInDoor(ctx, t);
};

// ---------------------------------------------------------------------------
// The rack of spare skins
// ---------------------------------------------------------------------------

interface Skin { skin: string[]; hair: string[]; cloth: string[]; tie?: string[]; bald?: boolean; long?: boolean; medals?: boolean; glasses?: boolean; bag?: boolean }

/**
 * A skin on its hanger (painted once, each way it's swaying): the clothes on the hanger's shoulders, sagging down long
 * and narrow (nothing in them), creased; the empty sleeves, the hands on the ends of them limp like gloves; the legs
 * dangling under, flat, wrinkled, the shoes on the ends; the head flopped over the front of the hanger, the face
 * stretched long, empty holes for the eyes and the mouth; the dry cleaner's bag over it, the paper tag.
 */
const skinFig = (i: number, sway: number) => figure(`rack-skin-${i}-${sway}`, 40, 104, 20, 10, q => {
  const s = SKINS[i], I = FIG_INK, K = s.skin, Cl = s.cloth, Hr = s.hair, x = sway;
  // The hanger: the hook up to the rail, the wire shoulders
  q.line(0, -9, 0, -3, '#b6bec8'); q.px(-1, -9, '#b6bec8'); q.px(1, -10, '#868e9a');
  q.line(-12, 3, 0, -2, '#868e9a'); q.line(12, 3, 0, -2, '#5c636e');
  // The legs of it, empty, dangling under, flat and wrinkled; the shoes
  for (const [lx, len] of [[-6.5, 22], [1, 20]] as const) {
    q.form(g => { g.moveTo(x + lx, 60); g.lineTo(x + lx + 6, 60); g.bezierCurveTo(x + lx + 5, 60 + len * 0.5, x + lx + 6, 60 + len * 0.8, x + lx + 5, 61 + len); g.lineTo(x + lx + 0.5, 61 + len); g.bezierCurveTo(x + lx, 60 + len * 0.6, x + lx + 1, 60 + len * 0.3, x + lx, 60); g.closePath(); },
      { ramp: K, bevel: 1.5, amb: 0.2, ink: I, inkIn: K[0] });
    for (let k = 4; k < len; k += 5) q.line(x + lx + 1, 60 + k, x + lx + 4, 61 + k, K[1]);
    q.form(g => { g.roundRect(x + lx - 1, 60 + len, 7.5, 3.5, 1); }, { ramp: BOOT, bevel: 1.5, amb: 0.2, ink: I, spec: '#a8a8b8', wet: 0.5 });
  }
  // The empty sleeves hanging off the shoulders; the hands on the ends of them, limp, the fingers dangling
  for (const d of [-1, 1]) {
    const sx = x + d * 12;
    q.form(g => { g.moveTo(sx - 2, 4); g.lineTo(sx + 2, 4); g.bezierCurveTo(sx + 2.5, 14, sx + 1.5, 24, sx + 2, 34); g.lineTo(sx - 1.5, 34); g.bezierCurveTo(sx - 2, 24, sx - 1.5, 14, sx - 2, 4); g.closePath(); },
      { ramp: Cl, bevel: 1.5, amb: d < 0 ? 0.2 : 0.08, ink: I, inkIn: Cl[0] });
    q.form(g => { g.moveTo(sx - 1.5, 34); g.lineTo(sx + 2, 34); g.lineTo(sx + 2.5, 38); g.lineTo(sx + 1.5, 41); g.lineTo(sx, 39); g.lineTo(sx - 1, 41); g.lineTo(sx - 2, 38); g.closePath(); }, { ramp: K, bevel: 1, amb: 0.25, ink: I });
  }
  // The clothes: shoulders on the hanger, sagging down long and narrow, creased down the middle where there's nothing in them
  q.form(g => { g.moveTo(x - 13, 4); g.bezierCurveTo(x - 8, 1, x + 8, 1, x + 13, 4); g.lineTo(x + 11, 22); g.lineTo(x + 8, 46); g.lineTo(x + 9, 62); g.lineTo(x - 9, 62); g.lineTo(x - 8, 46); g.lineTo(x - 11, 22); g.closePath(); },
    { ramp: Cl, bevel: 4, amb: 0.15, ink: I, inkIn: Cl[0] });
  q.line(x, 8, x, 60, Cl[0]); q.line(x - 1, 10, x - 1, 58, Cl[1]);
  for (const [y0, y1] of [[18, 26], [30, 40], [44, 54]]) { q.line(x - 7, y0, x - 3, y1, Cl[1]); q.line(x + 7, y0, x + 3, y1, Cl[1]); q.line(x - 6, y0, x - 2, y1, Cl[Cl.length - 2]); }
  q.line(x - 11, 5, x - 4, 3, Cl[Cl.length - 1]);
  if (s.tie) { q.form(g => { g.moveTo(x - 1.5, 7); g.lineTo(x + 1.5, 7); g.lineTo(x + 2, 28); g.lineTo(x, 31); g.lineTo(x - 2, 28); g.closePath(); }, { ramp: s.tie, bevel: 1, amb: 0.2, ink: I }); q.form(g => { g.rect(x - 2, 5, 4, 3); }, { ramp: s.tie, bevel: 1, amb: 0.3, ink: I }); }
  if (s.medals) for (let k = 0; k < 3; k++) { q.rect(x - 9 + k * 3, 12, 2, 3, ['#c82828', '#2a7ac8', '#e8d040'][k]); q.form(g => { g.arc(x - 8 + k * 3, 17, 1.2, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 1, ink: null, spec: '#fffff0', wet: 0.8 }); }
  // The head: flopped over the front of the hanger, flat, the face stretched long, the holes where the eyes and mouth were
  const hx = x, hy = -2;
  if (s.long) for (const d of [-1, 1]) q.form(g => { g.moveTo(hx + d * 5, hy - 2); g.bezierCurveTo(hx + d * 10, hy, hx + d * 10, hy + 10, hx + d * 9, hy + 16); g.lineTo(hx + d * 6, hy + 15); g.bezierCurveTo(hx + d * 7, hy + 8, hx + d * 6, hy + 3, hx + d * 4, hy); g.closePath(); }, { ramp: Hr, bevel: 1.5, amb: 0.25, ink: I });
  q.form(g => { g.moveTo(hx - 6.5, hy); g.bezierCurveTo(hx - 6.5, hy - 4, hx + 6.5, hy - 4, hx + 6.5, hy); g.bezierCurveTo(hx + 6.5, hy + 6, hx + 5, hy + 12, hx + 3, hy + 14); g.lineTo(hx - 3, hy + 14); g.bezierCurveTo(hx - 5, hy + 12, hx - 6.5, hy + 6, hx - 6.5, hy); g.closePath(); },
    { ramp: K, bevel: 3, amb: 0.2, ink: I, inkIn: K[1] });
  // (the eye holes, dragged down at the corners; the mouth a slack hole; the nose flattened; the folds of it)
  for (const d of [-1, 1]) { q.form(g => { g.ellipse(hx + d * 2.6, hy + 4, 1.4, 2.2, d * 0.3, 0, Math.PI * 2); }, { ramp: ['#060204', '#140608'], bevel: 1, ink: null }); q.px(hx + d * 3, hy + 7, K[1]); }
  q.form(g => { g.ellipse(hx, hy + 10.5, 1.6, 2, 0, 0, Math.PI * 2); }, { ramp: ['#1c0606', '#3a0a0a'], bevel: 1, ink: null });
  q.px(hx, hy + 7, K[1]); q.line(hx - 4, hy + 12, hx - 2, hy + 13, K[1]); q.line(hx + 4, hy + 12, hx + 2, hy + 13, K[1]);
  if (s.glasses) { q.line(hx - 5, hy + 3, hx - 1, hy + 3, I); q.line(hx + 1, hy + 3, hx + 5, hy + 3, I); q.px(hx - 5, hy + 4, I); q.px(hx + 5, hy + 4, I); q.px(hx - 3, hy + 3, '#a8b8c8'); }
  if (!s.bald) {
    q.form(g => { g.moveTo(hx - 7.5, hy + 3); g.bezierCurveTo(hx - 9, hy - 6, hx + 9, hy - 7, hx + 8, hy + 2); g.bezierCurveTo(hx + 4, hy, hx - 3, hy, hx - 7.5, hy + 3); g.closePath(); }, { ramp: Hr, bevel: 2, amb: 0.3, ink: I, spec: Hr[Hr.length - 1], wet: 0.3 });
    q.line(hx - 5, hy - 3, hx + 3, hy - 4, Hr[Hr.length - 1]); q.line(hx - 6, hy, hx + 5, hy - 1, Hr[1]);
  } else {
    for (const d of [-1, 1]) q.form(g => { g.rect(hx + d * 6 - 1, hy + 1, 2, 5); }, { ramp: Hr, bevel: 1, amb: 0.3, ink: null });
    q.line(hx - 2, hy - 2, hx + 1, hy - 2, K[K.length - 1]);
  }
  // (the dry cleaner's bag over it: a sheen down it, its edges)
  if (s.bag) {
    for (let y = -4; y < 88; y++) for (let k = -15; k <= 15; k++) if ((k === -15 || k === 15) && (y + k) % 3 === 0) q.px(x + k, y, '#c8d4e8', 0.5);
    q.line(x - 11, 0, x - 10, 84, '#ffffff', 0.35); q.line(x - 10, 2, x - 9, 30, '#ffffff', 0.25); q.line(x + 8, 10, x + 8, 70, '#ffffff', 0.22);
    q.line(x - 15, -4, x + 15, -4, '#c8d4e8', 0.4);
  }
  // (the paper tag on its string)
  q.form(g => { g.rect(x + 6, 4, 6, 4); }, { ramp: ['#b4ac8c', '#d8d0b0', '#f4eccc'], bevel: 1, amb: 0.4, ink: I });
  q.line(x + 7, 5, x + 10, 5, '#8a8a80');
});

/** The rack: a spare President, a general, an anchorwoman, a senator, a spare spare President. And the corkboard. */
const NAVY = RAMP.navy, TIE = RAMP.red.slice(1);
const SKINS: Skin[] = [
  { skin: RAMP.tSkin, hair: RAMP.tHair, cloth: NAVY, tie: TIE, bag: true },
  { skin: ['#5a3020', '#8a5038', '#b47858', '#d8a07c', '#e8b890', '#f4d0b0'], hair: ['#5a5a5a', '#7c7c7c', '#a8a8a8', '#d0d0d0', '#ececec'], cloth: ['#141a0a', '#1c2410', '#2a3418', '#3a4622', '#4a5a2c', '#5e6e38', '#7a8c4c'], medals: true },
  { skin: ['#6a3a28', '#9a6048', '#c08868', '#dca484', '#f0c0a0', '#fcdcc0'], hair: ['#7a5a18', '#a88430', '#d0a848', '#f0d070', '#fcf0b0'], cloth: ['#2c0206', '#3c0408', '#640a10', '#8c141c', '#b41c24', '#d03038', '#e85058'], long: true, bag: true },
  { skin: ['#5a3424', '#845440', '#a87458', '#c8947a', '#dca888', '#ecc4a8'], hair: ['#7c7c84', '#a8a8b0', '#c8c8d0', '#f0f0f0'], cloth: ['#141418', '#1c1c20', '#2c2c34', '#3c3c46', '#5a5a62', '#7a7a84', '#9a9aa4'], tie: ['#0a1440', '#14246c', '#2a4ac8', '#4c6ce0'], bald: true, glasses: true },
  { skin: RAMP.tSkin, hair: RAMP.tHair, cloth: NAVY, tie: TIE },
];

const rackSet = (ctx: Ctx) => layer(ctx, 'ep-rack', ART_W, ART_H, g => {
  // Pegboard wall, the floor
  bands(g, 0, 0, ART_W, 120, ['#1c1610', '#221a12', '#281e14', '#2e2216', '#342618']);
  for (let y = 4; y < 120; y += 6) for (let x = 3 + ((y / 6) % 2) * 3; x < ART_W; x += 6) R(g, x, y, 1, 1, '#120c08');
  bands(g, 0, 120, ART_W, 24, ['#2a2620', '#24201a', '#1c1814']);
  // The corkboard: photos pinned up, red string from one to the next (somebody's been pulling them)
  R(g, 6, 14, 70, 52, '#5a3a1c'); R(g, 8, 16, 66, 48, '#b48a54');
  for (let i = 0; i < 70; i++) R(g, 8 + Math.floor(hash(i * 1.3) * 66), 16 + Math.floor(hash(i * 2.1) * 48), 1, 1, '#8a6a3a');
  const pins: [number, number, string][] = [[18, 24, 'wh'], [50, 22, 'dome'], [62, 46, 'burger'], [24, 50, 'globe'], [40, 38, 'face']];
  for (const [px, py, k] of pins) {
    R(g, px - 6, py - 5, 12, 10, '#f4f0e0'); R(g, px - 5, py - 4, 10, 7, '#2a3a5a');
    if (k === 'wh') { R(g, px - 4, py, 8, 3, C.white); R(g, px - 1, py - 2, 2, 2, C.white); }
    if (k === 'dome') { ell(g, px, py, 3, 2, C.white); R(g, px - 4, py + 1, 8, 2, C.white); }
    if (k === 'burger') { R(g, px - 3, py - 2, 6, 2, '#c8782c'); R(g, px - 3, py, 6, 1, '#5a2a10'); R(g, px - 3, py + 1, 6, 1, '#4ab43c'); R(g, px - 3, py + 2, 6, 1, '#c8782c'); }
    if (k === 'globe') { ell(g, px, py, 3, 3, '#3a7ac8'); R(g, px - 1, py - 1, 2, 2, '#48a848'); }
    if (k === 'face') { ell(g, px, py, 3, 3, C.tSkin); R(g, px - 3, py - 3, 6, 1, C.tHair); }
    R(g, px, py - 5, 1, 1, C.red);
  }
  g.strokeStyle = '#d82020'; g.lineWidth = 1;
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 2], [1, 4]]) { g.beginPath(); g.moveTo(pins[a][0] + 0.5, pins[a][1] - 4.5); g.lineTo(pins[b][0] + 0.5, pins[b][1] - 4.5); g.stroke(); }
  // The rail
  R(g, 84, 26, 170, 3, '#b6bec8'); R(g, 84, 26, 170, 1, '#e8eef4'); R(g, 84, 29, 170, 1, '#3a3f48');
  R(g, 86, 26, 2, 100, '#868e9a'); R(g, 250, 26, 2, 100, '#5c636e');
});

/** The flashlight going along the rack of spare skins; the corkboard, the red string. */
export const drawSkinRack = (ctx: Ctx, t: number) => {
  rackSet(ctx);
  SKINS.forEach((_, i) => { const x = 104 + i * 32; skinFig(i, Math.round(Math.sin(t * 0.04 + x) * 1))(ctx, x, 34); });
  // Dark, but for the flashlight's spot, going along it left to right
  const sx = 40 + Math.min(1, t / 150) * 190, sy = 60 + Math.sin(t * 0.05) * 6;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, ART_W, ART_H); ctx.ellipse(sx, sy, 46, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(2, 2, 8, 0.6)'; ctx.fill('evenodd');
  ctx.beginPath(); ctx.ellipse(sx, sy, 46, 40, 0, 0, Math.PI * 2); ctx.ellipse(sx, sy, 38, 33, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(2, 2, 8, 0.3)'; ctx.fill('evenodd');
  ctx.fillStyle = 'rgba(255, 250, 220, 0.08)'; ctx.beginPath(); ctx.ellipse(sx, sy, 30, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

// ---------------------------------------------------------------------------
// The lawn, the White House on fire
// ---------------------------------------------------------------------------

/** The White House burning at night: the sky lit orange from under, the building scorched, a wing's roof fallen in. */
const burningSet = (ctx: Ctx) => layer(ctx, 'ep-burning', ART_W, ART_H, g => {
  bands(g, 0, 0, ART_W, 110, ['#06030c', '#0c0412', '#160616', '#220818', '#320c18', '#481214', '#5e1c10', '#7a2a0c', '#963a0c']);
  for (let i = 0; i < 24; i++) R(g, Math.floor(hash(i) * 110), Math.floor(hash(i + 40) * 26), 1, 1, '#8a8aa4');
  // (the smoke pall overhead, lit from under)
  for (let i = 0; i < 9; i++) { const x = 20 + i * 28, y = 18 + (i % 3) * 5; ell(g, x, y, 22, 9, '#1a1014'); ell(g, x, y + 5, 18, 4, '#3a1c14'); }
  // The lawn, orange in the firelight
  bands(g, 0, 106, ART_W, 38, ['#3a2a0c', '#2e2a0e', '#22280e', '#1a220c', '#14180a', '#0e1008']);
  for (let y = 112; y < ART_H; y += 6) for (let x = (y * 3) % 5; x < ART_W; x += 5) R(g, x, y, 1, 2, '#4a3a14');
  // (scorch marks, a crater)
  for (const [x, y, r] of [[40, 120, 10], [214, 116, 8]] as const) { ell(g, x, y, r, r * 0.3, '#0c0806'); ell(g, x, y - 1, r - 3, r * 0.2, '#1a120c'); }
  // Wings, soot-black above every window
  shaded(g, 'ep-wings', 36, 62, 184, 46, ['#4a3c40', '#5e4c4c', '#7a6058', '#967460', '#b08a6c', '#c8a080'], (u, v) => 0.85 - v * 0.5 - Math.abs(u - 0.5) * 0.4);
  R(g, 36, 100, 184, 8, '#5a4440');
  R(g, 34, 58, 188, 4, '#7a6a64');
  for (let x = 36; x < 220; x += 4) R(g, x, 55, 2, 3, '#7a6a64');
  // (the right wing's roof gone in: a ragged gap, blackened beams)
  for (let x = 176; x < 214; x++) { const d = Math.round(4 + Math.sin(x * 0.7) * 2 + (hash(x) - 0.5) * 4); R(g, x, 54, 1, d + 4, '#14080a'); }
  for (let k = 0; k < 4; k++) for (let y = 0; y < 10; y++) R(g, 182 + k * 8 + Math.floor(y / 3), 52 + y, 2, 1, '#2a1410');
  // Portico: pediment and columns, scorched
  for (let i = 0; i < 18; i++) R(g, 128 - i * 1.8 - 2, 40 + i, i * 3.6 + 4, 1, i === 17 ? '#8a7a74' : '#b8a8a0');
  R(g, 94, 58, 68, 3, '#8a7a74');
  R(g, 98, 61, 60, 41, '#4a3a38');
  for (let i = 0; i < 6; i++) { R(g, 100 + i * 11, 61, 5, 41, '#c8b8b0'); R(g, 104 + i * 11, 61, 1, 41, '#8a7a74'); R(g, 100 + i * 11, 61, 5, 8 + (i % 3) * 5, '#3a2c2c'); }
  R(g, 92, 102, 72, 4, '#a89890');
  // The windows: every one of them glowing; soot streaked up the wall over each
  for (const row of [68, 86]) for (let x = 42; x < 216; x += 14) {
    if (x > 96 && x < 158) continue;
    for (let k = 0; k < 8; k++) R(g, x - 1 + (k % 2), row - 2 - k, 9 - (k % 2) * 2, 1, `rgba(10, 6, 6, ${0.7 - k * 0.07})`);
    R(g, x, row, 7, 10, '#f87c00'); R(g, x + 1, row + 2, 5, 8, '#fcb820'); R(g, x + 2, row + 5, 3, 5, '#fce890');
    R(g, x + 3, row, 1, 10, '#5a1c08'); R(g, x - 1, row - 2, 9, 2, '#6a5a54');
  }
  R(g, 122, 86, 12, 16, '#f87c00'); R(g, 124, 90, 8, 12, '#fce890');
  // The flagpole on the roof, the flag half burned off it
  R(g, 127, 22, 1, 18, '#7a6a64');
  for (let i = 0; i < 5; i++) R(g, 128, 22 + i * 2, 8 - i, 2, i % 2 === 0 ? C.red : C.white);
  R(g, 128, 22, 4, 4, C.navyDark); R(g, 136, 22, 1, 3, '#2a1410');
  // The fence; the glow of it all on the lawn
  R(g, 0, 116, ART_W, 1, C.ink);
  for (let x = 2; x < ART_W; x += 6) R(g, x, 112, 1, 10, C.ink);
  g.fillStyle = 'rgba(248, 124, 0, 0.1)'; g.beginPath(); g.ellipse(128, 112, 120, 12, 0, 0, Math.PI * 2); g.fill();
});

/** What's still moving on the building: fire out of the windows and the roof, the smoke going up, embers, the hose. */
const burning = (ctx: Ctx, t: number) => {
  smokeColumn(ctx, 196, 50, 60, 9, t, 1);
  smokeColumn(ctx, 70, 54, 50, 7, t, 2, 7);
  smokeColumn(ctx, 132, 38, 44, 6, t, 3, 6);
  pixFire(ctx, 176, 58, 38, 18, t, 1);
  pixFire(ctx, 120, 40, 14, 8, t, 5);
  for (const [x, y, s] of [[56, 68, 2], [84, 86, 3], [168, 68, 4], [196, 86, 6], [70, 86, 7], [210, 68, 8]] as const) pixFire(ctx, x - 1, y + 4, 9, 12, t, s);
  pixFire(ctx, 40, 62, 16, 10, t, 9);
  // Embers going up off it
  for (let i = 0; i < 22; i++) {
    const p = ((t * 0.6 + i * 9) % 100) / 100;
    R(ctx, 40 + hash(i * 3.3) * 176 + Math.sin(p * 8 + i) * 5, 90 - p * 90, 1, 1, p < 0.5 ? '#fce890' : '#f87c00');
  }
  // The hose from off the right: an arc of water, drops off it
  for (let k = 0; k <= 40; k++) {
    const u = k / 40, x = 260 - u * 64, y = 96 - Math.sin(u * Math.PI) * 30 - u * 22;
    R(ctx, x, y + Math.round(Math.sin(t * 0.8 + k) * 0.6), 2, 2, k % 3 ? '#a8d8f8' : '#e8f8ff');
  }
  for (let i = 0; i < 6; i++) { const p = ((t * 1.5 + i * 7) % 20) / 20; R(ctx, 196 - p * 4 + i, 48 + p * 16, 1, 1, '#c8e8ff'); }
};

/** The real President, small, at the podium: the hair still all over the place, the tape's outline round his mouth. */
const realTrumpSmall = (ctx: Ctx, cx: number, top: number, t: number, talking: boolean) => {
  realTrumpFig(ctx, cx, top);
  // The mouth: flapping open while he talks
  if (talking && t % 12 < 6) { R(ctx, cx - 2, top + 10, 4, 3, '#3a0606'); R(ctx, cx - 2, top + 10, 4, 1, '#f4ecdc'); R(ctx, cx - 2, top + 13, 4, 1, '#b02c20'); }
  else { R(ctx, cx - 2, top + 11, 4, 2, '#b02c20'); R(ctx, cx - 1, top + 11, 2, 1, '#500000'); }
};

/**
 * The real one, small, behind the podium (the impostor's figure, but after the closet): the jacket, no tie, the collar
 * open, the undershirt showing; the tan with the pale goggles, bags, stubble, the pale outline the tape left round his
 * mouth; the swoop fallen in, strands sticking up off it and one long sheet of it down the side; and the fire behind
 * him catching his edges.
 */
const realTrumpFig = figure('trump-real-small', 40, 46, 20, 9, q => {
  const T = RAMP.tSkin, Hh = RAMP.tHair, N = RAMP.navy, I = FIG_INK;
  q.form(g => { g.moveTo(-17, 34); g.bezierCurveTo(-17, 20, -12, 15, -5, 14); g.lineTo(5, 14); g.bezierCurveTo(12, 15, 17, 20, 17, 34); g.closePath(); }, { ramp: N, bevel: 6, amb: 0.16, ink: I });
  // (the shirt open at the neck: the collar points splayed, the throat and the undershirt in the V)
  q.form(g => { g.moveTo(-5, 14); g.lineTo(5, 14); g.lineTo(2, 25); g.lineTo(-2, 25); g.closePath(); }, { ramp: RAMP.shirt, bevel: 2, amb: 0.3, ink: I });
  q.form(g => { g.moveTo(-2.5, 14); g.lineTo(2.5, 14); g.lineTo(0, 20); g.closePath(); }, { ramp: T, bevel: 1.5, amb: 0.2, ink: null });
  q.line(-1, 20, 1, 20, RAMP.shirt[4]); q.px(0, 21, RAMP.shirt[2]);
  for (const s of [-1, 1]) { q.line(s * 3, 14, s * 6, 17, RAMP.shirt[4]); q.px(s * 6, 17, RAMP.shirt[1]); q.line(s * 5, 15, s * 3, 25, N[0]); }
  // (a stain down the shirt from the closet; the arms down to the podium)
  q.px(1, 22, '#c8a050'); q.px(1, 23, '#b08840');
  for (const s of [-1, 1]) q.line(s * 13, 20, s * 14, 34, N[s < 0 ? 1 : 0]);
  // The head: the jowls wider than the brow, the ears
  for (const s of [-1, 1]) q.form(g => { g.ellipse(s * 7.5, 7, 1.8, 3, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 1.5, amb: 0.2, ink: I });
  q.form(g => { g.moveTo(-6, 0); g.bezierCurveTo(-6, -2, 6, -2, 6, 0); g.lineTo(7, 9); g.bezierCurveTo(8, 14, 4, 16, 0, 16); g.bezierCurveTo(-4, 16, -8, 14, -7, 9); g.closePath(); },
    { ramp: T, bevel: 5, amb: 0.2, ink: I, inkIn: T[1] });
  // (the goggles, the eyes wide and bloodshot, bags under them; the nose; the tape's pale outline round the mouth; stubble)
  for (const s of [-1, 1]) {
    const x = s < 0 ? -5 : 1;
    q.rect(x, 4, 4, 3, '#fdd8b0'); q.rect(x + 1, 4, 2, 2, '#f4ecdc'); q.px(s < 0 ? -3 : 2, 5, I); q.px(s < 0 ? -4 : 3, 4, '#e07060');
    q.line(x, 7, x + 3, 7, T[2]); q.line(x, 3, x + 3, 2 + (s < 0 ? 1 : 0), Hh[2]);
  }
  q.px(0, 6, T[6]); q.px(0, 7, T[5]); q.px(0, 8, T[2]); q.px(1, 8, T[2]);
  q.rect(-4, 9, 8, 5, T[6], 0.55); q.line(-4, 9, 3, 9, T[6]); q.line(-4, 13, 3, 13, T[6]);
  for (let k = 0; k < 6; k++) q.px(-5 + k * 2, 14 + (k % 2), T[1]);
  q.px(-6, 11, T[1]); q.px(5, 12, T[1]);
  // The hair: the swoop fallen flat and mussed, tufts sticking up off it, a long sheet of it hanging down the side
  q.form(g => { g.moveTo(-8, 5); g.bezierCurveTo(-10, -2, -5, -5, 1, -5); g.bezierCurveTo(7, -5, 10, -2, 9, 3); g.lineTo(7, 2); g.bezierCurveTo(3, 0, -3, 0, -6, 3); g.closePath(); },
    { ramp: Hh, bevel: 2.5, amb: 0.25, ink: '#5a3a04', spec: '#fffef0', wet: 0.25 });
  q.line(-7, -2, -10, -4, Hh[3]); q.px(-11, -4, Hh[2]); q.px(-10, -5, '#5a3a04');
  q.line(0, -6, 1, -8, Hh[4]); q.px(2, -9, Hh[4]); q.px(3, -9, Hh[3]);
  q.line(5, -5, 8, -7, Hh[4]); q.px(9, -7, Hh[3]);
  q.form(g => { g.moveTo(7, 1); g.lineTo(10, 1); g.bezierCurveTo(11, 6, 10, 11, 11, 15); g.lineTo(9, 15); g.bezierCurveTo(8, 10, 9, 6, 7, 3); g.closePath(); },
    { ramp: Hh, bevel: 1.5, amb: 0.2, ink: '#5a3a04' });
  q.line(-5, -3, 3, -4, Hh[5]); q.line(-6, 1, 5, 0, Hh[1]);
  // (the fire behind him, round his edges)
  rimLight(q, -20, 20, -9, 33, FIRE_RIM, FIRE_HOT, 3);
});

/** Meathead standing, the fire behind him catching his edges (the hair, the shoulders, the arms, down his legs). */
const mhLitFig = over('mh-stand-firelit', 48, 74, 24, 72, (g, x, y) => mhStandingFig(true, true, true)(g, x, y), q => rimLight(q, -24, 23, -67, -2, FIRE_RIM, FIRE_HOT, -50, -28, FIRE_DIM));

/** The emergency press conference: the podium on the lawn, the White House going up behind it, the press. */
export const drawLawnPress = (ctx: Ctx, t: number, talking: boolean) => {
  burningSet(ctx);
  burning(ctx, t);
  realTrumpSmall(ctx, 100, 54, t, talking);
  podium(ctx, 100, 80);
  const mx = 156, my = 124;
  mhLitFig(ctx, mx, my);
  if (shatPants()) shatFront(ctx, mx, my);
  // (Meathead looking from the camera to the President and back: his eyes gone over to the left)
  if (t % 90 > 45) { R(ctx, mx - 4, my - 58, 1, 1, FIG_INK); R(ctx, mx - 3, my - 58, 1, 1, '#f4ece0'); }
  reporters(ctx, t, 1);
};

/**
 * Behind a close-up: the White House burning, way out of focus, big: the sky orange, the columns pale blocks with
 * fire in between, smoke going up, embers drifting across.
 */
const fireBgSet = (ctx: Ctx) => layer(ctx, 'ep-firebg', ART_W, ART_H, g => {
  bands(g, 0, 0, ART_W, ART_H, ['#14060c', '#240810', '#3a0c10', '#541410', '#6e1e0c', '#8a2c0c', '#a83c0c', '#c45010', '#d86818']);
  for (let i = 0; i < 6; i++) { const x = 6 + i * 48; R(g, x, 34, 22, 110, '#8a5a48'); R(g, x + 2, 34, 6, 110, '#a8705a'); R(g, x + 18, 34, 4, 110, '#5a3428'); }
  R(g, 0, 26, ART_W, 9, '#6a4438'); R(g, 0, 26, ART_W, 2, '#8a5a48');
  for (let i = 0; i < 8; i++) ell(g, 20 + i * 34, 12 + (i % 2) * 6, 26, 12, '#1a0c10');
});
export const fireBg = (ctx: Ctx, t: number) => {
  fireBgSet(ctx);
  for (let i = 0; i < 5; i++) pixFire(ctx, 28 + i * 48, 144, 20, 70, t, i * 3.3);
  for (let i = 0; i < 18; i++) {
    const p = ((t * 0.8 + i * 13) % 120) / 120;
    R(ctx, hash(i * 2.2) * ART_W + p * 40, 144 - p * 150, 2, 2, p < 0.5 ? '#fce890' : '#f87c00');
  }
};

// ---------------------------------------------------------------------------
// The second punch's aftermath: up, up and away; the iris in on Meathead
// ---------------------------------------------------------------------------

/** The President small, a long way off, tumbling: `s` 1 (a figure) down to a speck. */
const trumpTumbling = (ctx: Ctx, x: number, y: number, t: number, s: 1 | 2) => {
  const f = t % 8 < 4;
  if (s === 1) (f ? tumbleFigA : tumbleFigB)(ctx, x, y);
  else {
    R(ctx, x - 1, y - 1, 3, 2, C.navy); R(ctx, x + 1, y - 1, 1, 1, C.tSkin); R(ctx, x + 1, y - 2, 1, 1, C.tHair);
  }
};
/** Him, small, end over end (two frames of it, his limbs flailing): the suit, the shoes, the hands, the head and the swoop. */
const tumbleFig = (f: number) => figure(`trump-tumble-${f}`, 28, 22, 14, 11, q => {
  const T = RAMP.tSkin, N = RAMP.navy, I = FIG_INK;
  // (the legs kicking, the shoes; the arms flung, the hands)
  q.stroke(g => { g.moveTo(-3, -1); g.lineTo(-9, f ? -4 : -1); }, 3, { ramp: N, bevel: 1.5, amb: 0.2, ink: I });
  q.stroke(g => { g.moveTo(-3, 1); g.lineTo(-9, f ? 2 : 3); }, 3, { ramp: N, bevel: 1.5, amb: 0.1, ink: I });
  q.rect(-11, f ? -5 : -2, 2, 2, BOOT[2]); q.rect(-11, f ? 2 : 3, 2, 2, BOOT[2]);
  q.stroke(g => { g.moveTo(-1, -2); g.lineTo(-2, f ? -7 : -6); }, 2.5, { ramp: N, bevel: 1.2, amb: 0.2, ink: I });
  q.stroke(g => { g.moveTo(1, 2); g.lineTo(2, f ? 7 : 6); }, 2.5, { ramp: N, bevel: 1.2, amb: 0.1, ink: I });
  q.rect(-3, f ? -9 : -8, 2, 2, T[4]); q.rect(2, f ? 7 : 6, 2, 2, T[3]);
  // (the suit round the gut, a flash of shirt)
  q.form(g => { g.ellipse(0, 0, 5.5, 3.8, 0, 0, Math.PI * 2); }, { ramp: N, bevel: 2.5, amb: 0.2, ink: I });
  q.line(-1, 2, 3, 2, RAMP.shirt[3]);
  // (the head, the swoop blown off it)
  q.form(g => { g.ellipse(6.5, -1, 3, 3, 0, 0, Math.PI * 2); }, { ramp: T, bevel: 2, amb: 0.2, ink: I });
  q.line(5, -4, 9, -4, RAMP.tHair[4]); q.line(4, -5, 7, -5, RAMP.tHair[3]); q.px(f ? 3 : 10, f ? -6 : -5, RAMP.tHair[5]);
  q.px(7, -1, I);
});
const tumbleFigA = tumbleFig(1), tumbleFigB = tumbleFig(0);

/** The twinkle as he goes over the horizon: a four-point star, flashing. */
const twinkle = (ctx: Ctx, x: number, y: number, k: number) => {
  const r = Math.round(2 + Math.sin(k * Math.PI) * 5);
  R(ctx, x - r, y, r * 2 + 1, 1, C.white); R(ctx, x, y - r, 1, r * 2 + 1, C.white);
  R(ctx, x - 1, y - 1, 3, 3, '#fcf0a0'); R(ctx, x, y, 1, 1, C.white);
  if (r > 4) { R(ctx, x - 2, y - 2, 1, 1, C.white); R(ctx, x + 2, y + 2, 1, 1, C.white); R(ctx, x + 2, y - 2, 1, 1, C.white); R(ctx, x - 2, y + 2, 1, 1, C.white); }
};

/**
 * Meathead to the camera, both guns up: a double-biceps flex, the upper arms out level from the shoulders, the forearms
 * up, the fists by his ears, the peaks pumping on the beat; grinning, medal on.
 */
const meatheadFlex = (ctx: Ctx, cx: number, baseY: number, t: number) => {
  const pump = Math.floor(t / 14) % 2;
  (pump ? flexFigB : flexFigA)(ctx, cx, baseY);
  if (shatPants()) shatFront(ctx, cx, baseY);
  // (the twinkle off his fist)
  if (t % 30 < 10) { R(ctx, cx + 30, baseY - 76, 1, 3, C.white); R(ctx, cx + 29, baseY - 75, 3, 1, C.white); }
};

/**
 * The flex, painted over his standing figure (no hanging arms): off the delts, the upper arms out level, the biceps
 * peaked up off them (higher, a vein standing up on it, on the beat), the triceps hanging under; the forearms up from
 * the elbows, thick, the wristbands, the fists curled in by his ears; and the grin, teeth and all.
 */
const flexFig = (pump: number) => over(`mh-flex-${pump}`, 80, 84, 40, 80, (g, x, y) => mhStandingFig(true, false, false)(g, x, y), q => {
  const S = RAMP.mSkin, I = FIG_INK;
  for (const s of [-1, 1]) {
    const amb = s < 0 ? 0.2 : 0.08, lite = S[s < 0 ? 7 : 5];
    // The forearm up from the elbow (flaring at the elbow, narrowing to the wrist); the wristband; the fist
    q.form(g => { g.moveTo(s * 22.5, -49); g.lineTo(s * 31, -47); g.bezierCurveTo(s * 32.5, -53, s * 31.5, -59, s * 29.5, -64); g.lineTo(s * 22.5, -64); g.bezierCurveTo(s * 22, -59, s * 21, -54, s * 22.5, -49); g.closePath(); },
      { ramp: S, bevel: 3.5, amb, ink: I, inkIn: S[1] });
    q.line(s * 23, -62, s * 23, -54, S[2]); q.line(s * 30, -60, s * 31, -52, s < 0 ? S[5] : S[3]);
    const fx = s < 0 ? -31 : 22;
    q.form(g => { g.rect(fx, -66, 9, 3); }, { ramp: BOOT, bevel: 1, amb: 0.3, ink: I });
    q.form(g => { g.roundRect(fx - 0.5, -75, 10, 10, 3); }, { ramp: S, bevel: 3, amb, ink: I });
    // (the fingers curled over toward him, the thumb across them)
    for (let k = 1; k <= 3; k++) q.line(fx + k * 2 + (s < 0 ? 1 : 0), -73, fx + k * 2 + (s < 0 ? 1 : 0), -70, S[2]);
    q.line(fx + 2, -68, fx + 7, -68, S[2]); q.line(fx + 2, -74, fx + 7, -74, lite);
    // The upper arm, out level to the elbow; the tricep hanging under it
    q.form(g => { g.moveTo(s * 12, -52); g.lineTo(s * 24, -51); g.bezierCurveTo(s * 30, -50, s * 31.5, -45, s * 28, -42); g.bezierCurveTo(s * 22, -40, s * 17, -40, s * 13, -42); g.closePath(); },
      { ramp: S, bevel: 3.5, amb, ink: I, inkIn: S[1] });
    q.line(s * 16, -43, s * 26, -43, S[2]);
    // The bicep: peaked up off it, the crease of the elbow in front of it
    q.form(g => { g.moveTo(s * 13, -48); g.bezierCurveTo(s * 12.5, -60 - pump * 2, s * 25, -61 - pump * 2, s * 26, -48); g.closePath(); }, { ramp: S, bevel: 4, amb, ink: I, inkIn: null, gain: 1.05 });
    q.line(s * 16, -55 - pump, s * 20, -56 - pump, lite); q.px(s * 17, -54 - pump, lite);
    q.px(s * 26, -48, S[1]); q.px(s * 26, -47, S[2]);
    if (pump) for (const [x, y] of [[17, -50], [18, -51], [19, -51], [20, -50], [21, -51], [22, -52]]) q.px(s * x, y, '#c96b4b');
    // (the delt capped round over the shoulder)
    q.form(g => { g.ellipse(s * 13.5, -49, 4, 3.5, 0, 0, Math.PI * 2); }, { ramp: S, bevel: 2.5, amb: s < 0 ? 0.25 : 0.1, ink: null });
  }
  // The grin, teeth and all
  q.line(-3, -53, 3, -53, '#f4ecdc'); q.px(-3, -53, '#c8bca8'); q.px(3, -53, '#c8bca8'); q.line(-2, -52, 2, -52, '#7a1e10');
  q.px(-4, -54, '#7a1e10'); q.px(4, -54, '#7a1e10');
});
const flexFigA = flexFig(0), flexFigB = flexFig(1);

/**
 * The podium knocked over on its back in the grass: its front face up at the sky, foreshortened, the seal on it
 * squashed to an oval; the lid's edge toward us; the mics come off their goosenecks lying beside it.
 */
const podiumDown = figure('podium-down', 60, 24, 30, 12, q => {
  const W = RAMP.wood, I = FIG_INK;
  q.disc(1, 8, 25, 3, '#0e1008');
  q.form(g => { g.rect(-21, -7, 42, 13); }, { ramp: W, bevel: 4, amb: 0.2, ink: I });
  q.rect(-17, -5, 34, 1, W[1]); q.rect(-17, -5, 1, 9, W[1]); q.rect(-17, 3, 34, 1, W[5]); q.rect(16, -5, 1, 9, W[5]);
  for (let k = 0; k < 3; k++) for (let x = -15; x < 15; x++) if ((x * 3 + k * 5) % 11 < 6) q.px(x, -3 + k * 3, W[2], 0.6);
  // (the lid, toward us, its edge lit by the fire)
  q.form(g => { g.rect(-23, 5, 46, 4); }, { ramp: W, bevel: 1.5, amb: 0.3, ink: I, gain: 1.15 });
  q.line(-22, 6, 21, 6, W[5]); q.px(-20, 6, '#f87c00'); q.px(20, 6, '#f87c00');
  // The seal, squashed: the gold rim, the navy, the eagle
  q.form(g => { g.ellipse(0, -1, 8, 4.5, 0, 0, Math.PI * 2); }, { ramp: RAMP.gold, bevel: 2, ink: I, spec: '#fffff0', wet: 0.6 });
  q.form(g => { g.ellipse(0, -1, 5.5, 2.8, 0, 0, Math.PI * 2); }, { ramp: RAMP.navy, bevel: 2, amb: 0.4, ink: '#5c3c00' });
  q.line(-4, -2, -1, -1, RAMP.gold[4]); q.line(4, -2, 1, -1, RAMP.gold[4]); q.rect(-1, -2, 2, 3, RAMP.gold[4]); q.px(0, -1, '#d82800');
  // (the mics, in the grass)
  for (const [x, y, d] of [[24, 4, 1], [-25, 3, -1]] as const) {
    q.line(x, y, x + d * 4, y + 2, '#3c3c44');
    q.form(g => { g.roundRect(x + d * 4 - 1.5, y + 0.5, 3, 3, 1); }, { ramp: ['#0a0a0c', '#1c1c20', '#3a3a40', '#6a6a74'], bevel: 1.5, ink: I });
  }
});

/** How much slower than it was he goes up and away (so you get to watch him go). */
const FLIGHT_SLOW = 2.2;
/** (his flight laid out at its old pace: f = t / FLIGHT_SLOW) */
const TWINKLE_F = 58;
export const LAUNCH_TWINKLE = Math.round(TWINKLE_F * FLIGHT_SLOW), IRIS_AT = LAUNCH_TWINKLE + 26, IRIS_LEN = 40;
/** Where the iris closes: Meathead's face and his flexed guns. */
const IRIS = { x: 92, y: 62 };

/**
 * He sails up over the lawn, over the burning roof, off into the night, and goes out with a twinkle; Meathead turns
 * to the camera, thumb up; the picture irises in to his grin, and holds.
 */
export const drawLaunch = (ctx: Ctx, t: number) => {
  burningSet(ctx);
  burning(ctx, t);
  // The podium, knocked over on its back
  podiumDown(ctx, 125, 116);
  // Him going: big across the lawn and up, smaller over the roof, a speck, gone
  const f = t / FLIGHT_SLOW;
  if (f < 22) trumpFlying(ctx, 130 + f * 3.4, 62 - f * 1.6, t);
  else if (f < 42) { const k = (f - 22) / 20; trumpTumbling(ctx, 200 + k * 16, 26 - k * 10, t, 1); }
  else if (f < TWINKLE_F) { const k = (f - 42) / (TWINKLE_F - 42); trumpTumbling(ctx, 216 + k * 8, 16 - k * 6, t, 2); }
  else if (t < LAUNCH_TWINKLE + 18) twinkle(ctx, 224, 10, (t - LAUNCH_TWINKLE) / 18);
  if (f < 40) meatheadPunched(ctx, 82, 124); else meatheadFlex(ctx, IRIS.x, 124, t);
  reporters(ctx, t, 1);
  // The iris: black closing in round his face, in whole pixels, stopping on his grin
  if (t >= IRIS_AT) {
    // (an oval, wide enough at the end for his face and both his guns)
    const k = clamp01((t - IRIS_AT) / IRIS_LEN), e = 1 - (1 - k) ** 2;
    const rx = 300 - (300 - 44) * e, ry = 300 - (300 - 26) * e;
    ctx.fillStyle = C.black;
    for (let y = 0; y < ART_H; y++) {
      const dy = (y - IRIS.y) / ry, hw = 1 - dy * dy;
      if (hw <= 0) { ctx.fillRect(0, y, ART_W, 1); continue; }
      const w = Math.round(rx * Math.sqrt(hw));
      ctx.fillRect(0, y, Math.max(0, IRIS.x - w), 1); ctx.fillRect(IRIS.x + w, y, ART_W, 1);
    }
  }
};
