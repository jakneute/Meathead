// The epilogue's pictures (after the alien's dead): the real President found tied up in a broom closet in the
// sub-basement, a rack of spare skins behind the mops; then an emergency press conference on the lawn in front of the
// burning White House; and one more punch, which sends him up over the roof and off into the night (a twinkle) as it
// irises in on Meathead. THE END. For real.
//
// Pixel art on the ending's 256 x 144 canvas (ending.ts), stepped ramps, banded skies; the static parts painted once.

import { ART_W, ART_H, C, R, ell, hash, podium, reporters, meatheadStanding, meatheadPunched, trumpFlying } from './ending';
import { shaded, ball, box, bands, layer, RAMP } from './art/snes';

type Ctx = CanvasRenderingContext2D;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

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

/** The agents in the doorway: black suits against the hall light, flashlights up. */
const agentsInDoor = (ctx: Ctx, t: number) => {
  for (const [x, h] of [[12, 0], [30, 2]] as const) {
    const S = RAMP.aSuit;
    R(ctx, x - 9, 54 + h, 18, 70, S[1]); R(ctx, x - 9, 54 + h, 2, 70, S[3]);
    R(ctx, x - 5, 40 + h, 10, 14, '#0c0806'); R(ctx, x - 5, 44 + h, 10, 2, '#000'); // (sunglasses)
    R(ctx, x - 6, 38 + h, 12, 4, '#0c0806');
    R(ctx, x - 1, 56 + h, 2, 10, C.white);
    // (the flashlight, out ahead)
    R(ctx, x + 8, 66 + h, 10, 4, S[2]); R(ctx, x + 18, 65 + h, 3, 6, '#c8c8c8');
  }
  // The beams, swinging a little
  const sw = Math.sin(t * 0.05) * 6;
  ctx.fillStyle = 'rgba(255, 250, 220, 0.12)';
  ctx.beginPath(); ctx.moveTo(48, 68); ctx.lineTo(176 + sw, 50); ctx.lineTo(186 + sw, 112); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(30, 70); ctx.lineTo(150 - sw, 66); ctx.lineTo(160 - sw, 126); ctx.closePath(); ctx.fill();
};

/** The fast food they've been keeping him on: wrappers, fries boxes, cups, a bucket of chicken. */
const junkPile = (ctx: Ctx) => {
  const items: [number, number, number][] = [[96, 132, 0], [112, 138, 1], [180, 134, 2], [196, 128, 3], [86, 124, 2], [204, 138, 0], [120, 126, 4], [170, 140, 1]];
  for (const [x, y, k] of items) {
    if (k === 0) { R(ctx, x - 5, y - 2, 10, 4, '#f0d040'); R(ctx, x - 5, y - 2, 10, 1, '#fcf0a0'); R(ctx, x - 2, y - 1, 4, 1, C.red); } // (a burger wrapper, balled)
    else if (k === 1) { R(ctx, x - 3, y - 7, 6, 7, C.red); R(ctx, x - 3, y - 7, 6, 1, '#f86040'); for (let f = 0; f < 4; f++) R(ctx, x - 2 + f, y - 10 + (f % 2), 1, 3, '#f8d850'); } // (fries)
    else if (k === 2) { R(ctx, x - 3, y - 9, 6, 9, C.white); R(ctx, x - 3, y - 6, 6, 2, C.red); R(ctx, x, y - 13, 1, 4, '#e8e8e8'); R(ctx, x - 3, y - 9, 6, 1, '#c8c8c8'); } // (a cup, its straw)
    else if (k === 3) { R(ctx, x - 7, y - 12, 14, 12, C.red); for (let s = 0; s < 3; s++) R(ctx, x - 7 + s * 5, y - 12, 2, 12, C.white); R(ctx, x - 6, y - 15, 12, 3, '#c87830'); R(ctx, x - 3, y - 17, 5, 3, '#a85818'); } // (the bucket)
    else { R(ctx, x - 6, y - 3, 12, 3, '#e8e0c8'); R(ctx, x - 6, y - 3, 12, 1, '#ffffff'); } // (a napkin)
  }
};

/**
 * The real President, tied to a folding chair: down to his undershirt (stained, riding up over the belly), boxers
 * with the flag on them, black socks; the rope round him and the chair; duct tape over his mouth; the swoop come
 * undone (a long sheet of it hanging off one side of his head, the scalp pale on top). Struggling.
 */
const tiedUp = (ctx: Ctx, cx: number, floor: number, t: number) => {
  const rock = t % 50 < 12 ? (t % 6 < 3 ? -1 : 1) : 0;
  const x = cx + rock, T = RAMP.tSkin, Hh = RAMP.tHair;
  // The chair: metal, folding
  R(ctx, x - 13, floor - 30, 2, 30, '#8a8a92'); R(ctx, x + 11, floor - 30, 2, 30, '#5a5a62');
  R(ctx, x - 14, floor - 32, 28, 3, '#9a9aa4'); R(ctx, x - 12, floor - 58, 24, 4, '#7a7a84');
  R(ctx, x - 12, floor - 58, 2, 26, '#8a8a92'); R(ctx, x + 10, floor - 58, 2, 26, '#6a6a72');
  // Legs: the boxers (flag), pale shins, black socks pulled up
  R(ctx, x - 12, floor - 36, 24, 8, C.navy); for (let k = 0; k < 4; k++) R(ctx, x - 12, floor - 35 + k * 2, 24, 1, k % 2 ? C.white : C.red);
  R(ctx, x - 12, floor - 36, 8, 4, C.navyDark); R(ctx, x - 10, floor - 35, 1, 1, C.white); R(ctx, x - 7, floor - 34, 1, 1, C.white);
  for (const lx of [x - 10, x + 3]) { R(ctx, lx, floor - 28, 7, 14, C.tSkinPale); R(ctx, lx, floor - 28, 2, 14, '#fcdcb8'); R(ctx, lx, floor - 16, 7, 14, C.ink); R(ctx, lx - 1, floor - 3, 9, 3, C.ink); R(ctx, lx + 1, floor - 16, 5, 1, '#3c3c3c'); }
  // The belly in the undershirt, riding up, the gut out under it; the stains
  shaded(ctx, 'ep-tgut', x - 15, floor - 56, 30, 24, RAMP.shirt, ball(-0.4, -0.5, 0.2));
  ell(ctx, x, floor - 35, 12, 3, T[4]); R(ctx, x - 1, floor - 35, 2, 1, T[1]);
  R(ctx, x - 6, floor - 48, 4, 3, '#c8a050'); R(ctx, x + 4, floor - 42, 3, 3, '#b4200c'); R(ctx, x - 13, floor - 52, 3, 6, '#c8b070');
  // (the straps of it over his shoulders, the shoulders bare)
  shaded(ctx, 'ep-tshould', x - 17, floor - 62, 34, 10, RAMP.tSkin, box(-0.4, -0.6, 0.18, 1, 0.6));
  R(ctx, x - 8, floor - 62, 3, 8, C.white); R(ctx, x + 5, floor - 62, 3, 8, C.white);
  // The rope round him and the chair, three times; the arms behind
  for (const ry of [floor - 54, floor - 47, floor - 40]) { R(ctx, x - 16, ry, 32, 2, '#c8a060'); for (let k = 0; k < 32; k += 3) R(ctx, x - 16 + k, ry, 1, 2, '#8a6a30'); }
  R(ctx, x - 18, floor - 60, 3, 18, T[3]); R(ctx, x + 15, floor - 60, 3, 18, T[2]);
  // The head: stubble, bags, the tape over his mouth, sweating
  const hy = floor - 76;
  shaded(ctx, 'ep-thead', x - 9, hy, 18, 18, RAMP.tSkin, ball(-0.4, -0.5, 0.15));
  shaded(ctx, 'ep-tjowl', x - 9, hy + 10, 18, 9, RAMP.tSkin, ball(-0.35, -0.7, 0.12));
  for (let i = 0; i < 18; i++) R(ctx, x - 7 + Math.floor(hash(i * 1.7) * 14), hy + 11 + Math.floor(hash(i * 2.9) * 7), 1, 1, '#9c5a30');
  ell(ctx, x - 4, hy + 7, 3, 2, C.tSkinPale); ell(ctx, x + 4, hy + 7, 3, 2, C.tSkinPale);
  // (eyes wide, darting; struggling)
  const look = t % 40 < 20 ? -1 : 1;
  R(ctx, x - 5, hy + 6, 3, 2, C.white); R(ctx, x + 3, hy + 6, 3, 2, C.white);
  R(ctx, x - 4 + look, hy + 6, 1, 2, C.ink); R(ctx, x + 4 + look, hy + 6, 1, 2, C.ink);
  R(ctx, x - 6, hy + 9, 4, 1, T[1]); R(ctx, x + 2, hy + 9, 4, 1, T[1]);
  R(ctx, x - 1, hy + 8, 2, 4, T[1]);
  // The tape: grey, shiny, slapped across
  R(ctx, x - 7, hy + 12, 14, 4, '#a8a8b0'); R(ctx, x - 7, hy + 12, 14, 1, '#d8d8e0'); R(ctx, x + 6, hy + 11, 2, 2, '#8a8a92');
  // The hair: the swoop come undone, a long sheet of it hanging off the side, the scalp pale on top
  ell(ctx, x, hy + 1, 8, 3, '#fcd8b8'); R(ctx, x - 3, hy - 1, 4, 1, C.white);
  for (let k = 0; k < 26; k++) R(ctx, x + 6 + Math.round(Math.sin(k * 0.15 + t * 0.08) * 1.5), hy - 1 + k, 4 - Math.floor(k / 10), 1, k % 5 === 0 ? Hh[5] : Hh[3]);
  R(ctx, x - 9, hy + 1, 3, 6, Hh[2]); R(ctx, x - 8, hy, 6, 2, Hh[3]);
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
  junkPile(ctx);
  tiedUp(ctx, 140, 126, t);
  agentsInDoor(ctx, t);
};

// ---------------------------------------------------------------------------
// The rack of spare skins
// ---------------------------------------------------------------------------

interface Skin { skin: string; shade: string; hair: string; hairShade: string; cloth: string; clothLight: string; tie?: string; bald?: boolean; long?: boolean; medals?: boolean; glasses?: boolean; bag?: boolean }

/** A skin hanging on its hanger: the head flopped over the hook, empty eye holes, the body sagging flat into the clothes. */
const hangingSkin = (ctx: Ctx, x: number, top: number, s: Skin, t: number) => {
  const sway = Math.round(Math.sin(t * 0.04 + x) * 1);
  // The hanger
  R(ctx, x, top - 6, 1, 6, '#b6bec8'); R(ctx, x - 1, top - 7, 3, 1, '#b6bec8');
  R(ctx, x - 12, top + 2, 24, 1, '#868e9a'); for (let k = 0; k < 12; k++) { R(ctx, x - k, top + Math.floor(k / 6), 1, 1, '#868e9a'); R(ctx, x + k, top + Math.floor(k / 6), 1, 1, '#868e9a'); }
  // The clothes: shoulders on the hanger, sagging down long and narrow (nothing in them)
  const cx = x + sway;
  R(ctx, cx - 13, top + 3, 26, 6, s.cloth); R(ctx, cx - 13, top + 3, 26, 1, s.clothLight);
  for (let y = 0; y < 52; y++) { const hw = 12 - Math.floor(y / 9) + (y > 40 ? 1 : 0); R(ctx, cx - hw, top + 9 + y, hw * 2, 1, y % 13 === 0 ? s.clothLight : s.cloth); }
  R(ctx, cx - 1, top + 9, 2, 48, 'rgba(0,0,0,0.25)');
  // (the empty sleeves hanging, the hands on the ends of them like gloves)
  for (const d of [-1, 1]) { R(ctx, cx + d * 13 - (d > 0 ? 3 : 0), top + 5, 3, 30, s.cloth); R(ctx, cx + d * 13 - (d > 0 ? 3 : 0), top + 35, 3, 5, s.skin); }
  if (s.tie) { R(ctx, cx - 1, top + 6, 3, 24, s.tie); R(ctx, cx - 2, top + 5, 5, 3, s.tie); }
  if (s.medals) for (let k = 0; k < 3; k++) { R(ctx, cx - 9 + k * 3, top + 12, 2, 3, ['#c82828', '#2a7ac8', '#e8d040'][k]); R(ctx, cx - 9 + k * 3, top + 15, 2, 2, C.gold); }
  // The legs of it, empty, dangling under, the shoes
  R(ctx, cx - 7, top + 61, 6, 22, s.skin); R(ctx, cx + 1, top + 61, 6, 20, s.skin); R(ctx, cx - 7, top + 61, 6, 1, s.shade);
  R(ctx, cx - 8, top + 83, 7, 3, C.ink); R(ctx, cx, top + 81, 7, 3, C.ink);
  // The head: flopped down over the front of the hanger, flat, the face stretched, the eyes empty holes
  const hx = cx, hy = top - 2;
  ell(ctx, hx, hy + 4, 7, 6, s.skin); ell(ctx, hx - 1, hy + 3, 5, 4, s.shade === '' ? s.skin : s.skin);
  R(ctx, hx - 6, hy + 8, 12, 2, s.shade);
  R(ctx, hx - 4, hy + 2, 2, 3, C.ink); R(ctx, hx + 2, hy + 2, 2, 3, C.ink); R(ctx, hx - 1, hy + 7, 3, 2, '#3a0a0a');
  if (s.glasses) { R(ctx, hx - 5, hy + 2, 4, 1, C.ink); R(ctx, hx + 1, hy + 2, 4, 1, C.ink); R(ctx, hx - 1, hy + 2, 2, 1, C.ink); }
  if (!s.bald) {
    ell(ctx, hx, hy - 2, 8, 4, s.hair); R(ctx, hx - 4, hy - 4, 6, 1, s.hairShade);
    if (s.long) { R(ctx, hx - 9, hy - 2, 4, 16, s.hair); R(ctx, hx + 6, hy - 2, 4, 16, s.hair); R(ctx, hx - 9, hy + 12, 4, 2, s.hairShade); }
  } else { R(ctx, hx - 7, hy + 2, 2, 4, s.hair); R(ctx, hx + 5, hy + 2, 2, 4, s.hair); R(ctx, hx - 2, hy, 3, 1, '#ffffff'); }
  // (the dry cleaner's bag over it, a sheen down it, the paper tag)
  if (s.bag) { R(ctx, cx - 15, top - 4, 30, 92, 'rgba(220, 230, 255, 0.1)'); R(ctx, cx - 11, top, 2, 84, 'rgba(255, 255, 255, 0.28)'); R(ctx, cx + 8, top + 10, 1, 60, 'rgba(255, 255, 255, 0.18)'); }
  R(ctx, cx + 6, top + 4, 6, 4, '#f4eccc'); R(ctx, cx + 7, top + 5, 4, 1, '#8a8a80');
};

/** The rack: a spare President, a general, an anchorwoman, a senator, a spare spare President. And the corkboard. */
const SKINS: Skin[] = [
  { skin: C.tSkin, shade: C.tSkinShade, hair: C.tHair, hairShade: C.tHairShade, cloth: C.navy, clothLight: '#3c3c8c', tie: C.red, bag: true },
  { skin: '#e8b090', shade: '#b47858', hair: '#a8a8a8', hairShade: '#e0e0e0', cloth: '#4a5a2c', clothLight: '#6a7c40', medals: true },
  { skin: '#f0c0a0', shade: '#c08868', hair: '#f0d070', hairShade: '#fcf0b0', cloth: '#b41c24', clothLight: '#e04040', long: true, bag: true },
  { skin: '#dca888', shade: '#a87458', hair: '#c8c8c8', hairShade: '#f0f0f0', cloth: '#5a5a62', clothLight: '#7a7a84', tie: '#2a4ac8', bald: true, glasses: true },
  { skin: C.tSkin, shade: C.tSkinShade, hair: C.tHair, hairShade: C.tHairShade, cloth: C.navy, clothLight: '#3c3c8c', tie: C.red },
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
  SKINS.forEach((s, i) => hangingSkin(ctx, 104 + i * 32, 34, s, t));
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
  // Suit and belly (no tie now, the collar open)
  R(ctx, cx - 13, top + 14, 26, 22, C.navy);
  R(ctx, cx - 15, top + 18, 30, 18, C.navy);
  R(ctx, cx - 3, top + 14, 6, 8, C.white); R(ctx, cx - 1, top + 15, 2, 3, C.tSkin);
  R(ctx, cx - 17, top + 22, 5, 12, C.navyDark);
  R(ctx, cx + 12, top + 22, 5, 12, C.navyDark);
  // Head
  ell(ctx, cx, top + 7, 7, 8, C.tSkin);
  R(ctx, cx - 5, top + 5, 4, 2, C.tSkinPale); R(ctx, cx + 1, top + 5, 4, 2, C.tSkinPale);
  R(ctx, cx - 4, top + 5, 2, 1, C.ink); R(ctx, cx + 2, top + 5, 2, 1, C.ink);
  R(ctx, cx - 4, top + 9, 8, 5, 'rgba(253, 208, 160, 0.6)');
  R(ctx, cx - 2, top + 11, 4, talking && t % 12 < 6 ? 3 : 1, '#801010');
  for (let k = 0; k < 6; k++) R(ctx, cx - 5 + k * 2, top + 13, 1, 1, '#9c5a30');
  // The hair, a mess: the swoop fallen, strands off it, one long one down the side
  ell(ctx, cx, top + 1, 8, 3, C.tHair);
  R(ctx, cx - 3, top - 1, 6, 1, C.tHairLight);
  for (let k = 0; k < 4; k++) R(ctx, cx - 6 + k * 3, top + 2, 1, 3 + (k % 2) * 2, C.tHairShade);
  for (let k = 0; k < 12; k++) R(ctx, cx + 7 + (k > 6 ? 1 : 0), top + k, 2, 1, k % 4 === 0 ? C.tHairLight : C.tHair);
  // (lit from behind: orange off the fire round his edges)
  R(ctx, cx - 15, top + 18, 1, 18, '#f87c00'); R(ctx, cx + 14, top + 18, 1, 18, '#f87c00'); R(ctx, cx + 7, top + 2, 1, 8, '#fcb820');
};

/** The emergency press conference: the podium on the lawn, the White House going up behind it, the press. */
export const drawLawnPress = (ctx: Ctx, t: number, talking: boolean) => {
  burningSet(ctx);
  burning(ctx, t);
  realTrumpSmall(ctx, 100, 54, t, talking);
  podium(ctx, 100, 80);
  meatheadStanding(ctx, 156, 124, true);
  // (Meathead looking from the President to the camera and back)
  if (t % 90 > 45) { R(ctx, 152, 124 - 58, 3, 1, C.ink); R(ctx, 157, 124 - 58, 3, 1, C.ink); R(ctx, 154, 124 - 58, 1, 1, C.mSkin); R(ctx, 159, 124 - 58, 1, 1, C.mSkin); }
  // (the fire's light on both of them, from behind)
  R(ctx, 156 + 18, 124 - 50, 1, 22, '#f87c00'); R(ctx, 156 - 14, 124 - 50, 1, 9, '#fcb820');
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
  if (s === 1) {
    R(ctx, x - 5, y - 3, 10, 6, C.navy); R(ctx, x + 4, y - 3, 5, 5, C.tSkin); R(ctx, x + 4, y - 4, 5, 2, C.tHair);
    R(ctx, x - 9, y - (f ? 4 : 0), 4, 2, C.navyDark); R(ctx, x - 9, y + (f ? 2 : -2), 4, 2, C.navyDark);
    R(ctx, x - 2, y - 6 - (f ? 1 : 0), 2, 3, C.tSkin); R(ctx, x + 1, y + 3 + (f ? 1 : 0), 2, 3, C.tSkin);
  } else {
    R(ctx, x - 1, y - 1, 3, 2, C.navy); R(ctx, x + 1, y - 1, 1, 1, C.tSkin); R(ctx, x + 1, y - 2, 1, 1, C.tHair);
  }
};

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
  meatheadStanding(ctx, cx, baseY, true, { l: false, r: false });
  const pump = Math.floor(t / 14) % 2, sy = baseY - 48;
  for (const side of [-1, 1]) {
    const lit = side < 0;
    const sh = cx + side * 13, el = cx + side * 27;
    // (the upper arm out to the elbow, the bicep peaking up off it, bigger on the beat)
    const x0 = Math.min(sh, el), w = Math.abs(el - sh);
    R(ctx, x0, sy - 1, w, 7, lit ? C.mSkin : RAMP.mSkin[3]);
    const peak = 4 + pump;
    R(ctx, x0 + 3, sy - 1 - peak, w - 6, peak, lit ? C.mSkin : RAMP.mSkin[3]);
    R(ctx, x0 + 4, sy - 1 - peak, w - 8, 1, C.mSkinLight);
    R(ctx, x0, sy + 5, w, 1, C.mSkinShade);
    // (the forearm up from the elbow, the fist by his ear)
    const fx = side < 0 ? el - 1 : el - 6;
    R(ctx, fx, sy - 18, 7, 19, lit ? C.mSkin : RAMP.mSkin[3]);
    R(ctx, fx + (side < 0 ? 0 : 5), sy - 18, 2, 19, lit ? C.mSkinLight : RAMP.mSkin[2]);
    R(ctx, fx - 1, sy - 24, 9, 7, C.mSkin); R(ctx, fx - 1, sy - 18, 9, 1, C.mSkinShade);
    R(ctx, fx + 1, sy - 22, 1, 3, C.mSkinShade); R(ctx, fx + 4, sy - 22, 1, 3, C.mSkinShade);
    // (a vein standing up on the beat)
    if (pump) R(ctx, x0 + Math.round(w / 2) - 1, sy - 2 - peak + 2, 3, 1, '#c96b4b');
  }
  // (the grin, teeth and all)
  R(ctx, cx - 4, baseY - 54, 8, 2, C.white); R(ctx, cx - 4, baseY - 52, 8, 1, C.darkRed);
  if (t % 30 < 10) { R(ctx, cx + 30, baseY - 76, 1, 3, C.white); R(ctx, cx + 29, baseY - 75, 3, 1, C.white); }
};

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
  // The podium on its side
  R(ctx, 104, 108, 42, 16, RAMP.wood[3]); R(ctx, 104, 108, 42, 2, RAMP.wood[5]); ell(ctx, 124, 116, 6, 5, C.gold);
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
