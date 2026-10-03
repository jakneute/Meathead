// The finale's Secret Service: dark suits, white shirts, black ties, sunglasses indoors, an earpiece with its curly
// wire down into the collar, a flag pin on the lapel. The agent with his service pistol up in both hands; the rusher
// (a big lad, head down to tackle); the man behind a ballistic shield (black, SECRET SERVICE stenciled across it, a
// little window to look through), who drops it to fire round it; the jetpack man (twin tanks on his back, the flames
// out of the nozzles, his legs dangling). Pulling out (every one of Meathead's guns empty: it's not their fight any
// more), they run for it, arms going, sunglasses askew.
// Drawn like the rest: facing right from a point at the feet, flipped by the caller.

import { INK, ink, shaded, shadedTop, lite, dark, limb } from '../npc/kit';
import { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFire } from '../fx/fire';

type Ctx = CanvasRenderingContext2D;

const SUIT = '#1c1c26', SHIRT = '#eceef4', TIE = '#0e0e14', SHOE = '#0a0a0c', STEEL = '#2e3138';
const SKINS = ['#f2c9a0', '#e0ac69', '#c68642', '#8d5524', '#f5d0a9', '#a86b3c'];
const skinOf = (e: Enemy) => SKINS[Math.abs(Math.round((e.homeX || 0) / 3)) % SKINS.length];
const hairOf = (e: Enemy) => ['#1c1410', '#3b2a1a', '#0c0c0c', '#6b4a2a', '#9a9a9a'][Math.abs(Math.round((e.homeX || 0) / 11)) % 5];
/** The muzzle glow before a shot. */
const charge = (e: Enemy) => Math.max(0, (e.shootTimer - 40) / 20);
const fleeing = (e: Enemy) => e.aiState === 'flee' || e.aiState === 'gone';

export const drawFinaleKind = (ctx: Ctx, e: Enemy, f: number, state: GameState) => {
  switch (e.kind) {
    case 'agent': drawAgent(ctx, e, f); break;
    case 'agentrush': drawRusher(ctx, e, f); break;
    case 'agentshield': drawShieldMan(ctx, e, f); break;
    case 'jetagent': drawJetAgent(ctx, e, f); break;
  }
  void state;
};

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

/** Suit trousers, a crease down each; black oxfords, polished (a glint); striding by `stride`. */
const legs = (ctx: Ctx, hipY: number, f: number, stride: number, w = 7) => {
  const s = Math.sin(f * 0.3) * stride;
  for (const x of [-1 - w + s, 2 - s]) {
    shaded(ctx, () => ctx.rect(x, hipY, w, -hipY - 4), SUIT, x, hipY, w, -hipY - 4);
    ctx.fillStyle = lite(SUIT, 0.18); ctx.fillRect(x + w * 0.45, hipY + 2, 0.7, -hipY - 8);
    ink(ctx, () => ctx.roundRect(x - 1, -5, w + 4, 5, [2, 3, 1, 1]), SHOE, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + w - 1, -4.2, 2, 0.8);
  }
};

/** The suit jacket over the shirt: the shirt's V, the tie, the lapels, the flag pin, the buttons. */
const jacket = (ctx: Ctx, x: number, y: number, w: number, h: number, lean = 0) => {
  const path = () => ctx.roundRect(x, y, w, h, [6, 6, 2, 2]);
  shaded(ctx, path, SUIT, x, y, w, h);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  const mx = x + w / 2 + lean;
  // (the shirt's V, the tie down it)
  ctx.fillStyle = SHIRT; ctx.beginPath(); ctx.moveTo(mx - 6, y); ctx.lineTo(mx + 6, y); ctx.lineTo(mx, y + h * 0.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = TIE; ctx.beginPath(); ctx.moveTo(mx - 1.6, y + 1); ctx.lineTo(mx + 1.6, y + 1); ctx.lineTo(mx + 2.2, y + h * 0.45); ctx.lineTo(mx, y + h * 0.52); ctx.lineTo(mx - 2.2, y + h * 0.45); ctx.closePath(); ctx.fill();
  // (the lapels, a lit edge on each)
  ctx.strokeStyle = lite(SUIT, 0.3); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(mx - 6, y); ctx.lineTo(mx - 1, y + h * 0.5); ctx.moveTo(mx + 6, y); ctx.lineTo(mx + 1, y + h * 0.5); ctx.stroke();
  // (the buttons)
  ctx.fillStyle = '#05050a'; ctx.fillRect(mx - 0.6, y + h * 0.6, 1.4, 1.4); ctx.fillRect(mx - 0.6, y + h * 0.76, 1.4, 1.4);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The flag pin on his lapel
  ctx.fillStyle = '#b91c1c'; ctx.fillRect(mx + 4, y + 5, 3, 2); ctx.fillStyle = '#1e3a8a'; ctx.fillRect(mx + 4, y + 5, 1.2, 1); ctx.fillStyle = '#ffffff'; ctx.fillRect(mx + 4, y + 6, 3, 0.5);
};

type Mouth = 'flat' | 'grim' | 'scream' | 'grit';

/** A head at (x, y) facing right: short hair, sunglasses, the earpiece and its curly wire, a jaw set. */
const head = (ctx: Ctx, x: number, y: number, skin: string, hair: string, mouth: Mouth = 'flat', r = 8, askew = 0) => {
  const sd = dark(skin, 0.2);
  ink(ctx, () => ctx.rect(x - 2.6, y + r - 2, 5.2, 5), sd, 0.8);
  const skull = () => ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); skull(); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 2.2);
  ctx.fillStyle = sd; ctx.fillRect(x - r, y - r * 1.1, r * 0.55, r * 2.2);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(x + r * 0.2, y - r * 0.85, r * 0.5, r * 0.45);
  // (the haircut: short back and sides, a hard part)
  ctx.fillStyle = hair; ctx.fillRect(x - r, y - r * 1.1, r * 2, r * 0.75); ctx.fillRect(x - r, y - r * 1.1, r * 0.7, r * 1.3);
  ctx.fillStyle = lite(hair, 0.25); ctx.fillRect(x - 1, y - r * 1.05, r * 0.9, 1);
  ctx.fillStyle = dark(hair, 0.4); ctx.fillRect(x - 2, y - r * 1.1, 1, r * 0.7);
  ctx.restore();
  ctx.beginPath(); skull(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  // The ear, the earpiece in it, its curly wire down into the collar
  ink(ctx, () => ctx.ellipse(x - r + 2.4, y + 1, 1.8, 2.4, 0, 0, Math.PI * 2), sd, 0.7);
  ctx.fillStyle = '#d4d4d8'; ctx.fillRect(x - r + 1.6, y, 1.6, 1.6);
  ctx.strokeStyle = '#a1a1aa'; ctx.lineWidth = 0.7; ctx.beginPath();
  for (let i = 0; i <= 8; i++) { const yy = y + 2 + i * 1.3, xx = x - r + 2 + Math.sin(i * 1.6) * 1.2; if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
  ctx.stroke();
  // The sunglasses (wraparounds, black, a glint): askew if he's running for it
  ctx.save(); ctx.translate(x + 3, y - 1.5); ctx.rotate(askew);
  ink(ctx, () => ctx.roundRect(-4.4, -1.8, 10.4, 3.6, [0.6, 1.6, 1.6, 0.6]), '#0a0a0e', 0.7);
  ctx.fillStyle = '#3f3f52'; ctx.fillRect(-3.6, -1, 9, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'; ctx.fillRect(2.2, -1.2, 2, 0.7);
  ctx.restore();
  ctx.fillStyle = sd; ctx.fillRect(x + r - 3, y + 2, 2, 2.4);
  const mx = x + 3.4, my = y + r * 0.64;
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineWidth = 1;
  switch (mouth) {
    case 'flat': ctx.fillRect(mx - 2, my, 4, 1); break;
    case 'grim': ctx.beginPath(); ctx.moveTo(mx - 2.4, my + 0.8); ctx.lineTo(mx, my); ctx.lineTo(mx + 2.4, my + 0.8); ctx.stroke(); break;
    case 'grit': ctx.fillRect(mx - 2.6, my - 0.6, 5.6, 2.4); ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 2, my - 0.2, 4.4, 1.2); break;
    case 'scream': ink(ctx, () => ctx.ellipse(mx, my + 0.6, 2.4, 3, 0, 0, Math.PI * 2), '#5a0a0a', 0.8); ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 1.6, my - 2, 3.2, 0.8); break;
  }
};

const fist = (ctx: Ctx, x: number, y: number, skin: string, r = 3.2) => {
  ink(ctx, () => ctx.roundRect(x - r, y - r, r * 2, r * 2, r * 0.6), skin, 0.8);
  ctx.fillStyle = dark(skin, 0.22); ctx.fillRect(x - r * 0.6, y, r * 1.3, 0.7);
  ctx.fillStyle = lite(skin, 0.25); ctx.fillRect(x - r * 0.7, y - r * 0.7, r * 0.8, 0.8);
};
/** A sleeved arm from the shoulder to the hand, the white cuff showing, the fist. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, skin: string, w = 5.5) => {
  limb(ctx, sx, sy, hx, hy, w, SUIT);
  const cx = sx + (hx - sx) * 0.84, cy = sy + (hy - sy) * 0.84;
  limb(ctx, cx, cy, sx + (hx - sx) * 0.92, sy + (hy - sy) * 0.92, w - 0.6, SHIRT);
  fist(ctx, hx, hy, skin, w * 0.6);
};

/** A stepped glow at a muzzle. */
const glow = (ctx: Ctx, x: number, y: number, r: number, a: number) => {
  ctx.fillStyle = `rgba(254, 240, 138, ${(a * 0.45).toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(254, 240, 138, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
};

/** The service pistol in the fist at (x, y), pointing along `a` (radians, 0 dead ahead): slide, frame, the grip. */
const pistol = (ctx: Ctx, x: number, y: number, a: number, c: number, skin: string) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ink(ctx, () => { ctx.moveTo(-1, 0); ctx.lineTo(3, 0); ctx.lineTo(2.4, 6.4); ctx.lineTo(-1.6, 6); ctx.closePath(); }, '#16161a', 0.7);
  shadedTop(ctx, () => ctx.rect(-2, -3.6, 14, 3.4), STEEL, -2, -3.6, 14, 3.4, 0.8);
  ctx.fillStyle = '#6b7280'; ctx.fillRect(-1, -3.2, 12, 0.7);
  for (let k = 0; k < 3; k++) { ctx.fillStyle = dark(STEEL, 0.4); ctx.fillRect(-1 + k * 1.4, -3, 0.6, 2.6); }
  ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(3.6, 1, 1.6, 0, Math.PI); ctx.stroke();
  fist(ctx, 0.6, 1.6, skin, 2.6);
  ctx.restore();
  if (c > 0.6) glow(ctx, x + Math.cos(a) * 14, y + Math.sin(a) * 14 - 2, 2 + c * 3, c);
};

// ---------------------------------------------------------------------------
// Them
// ---------------------------------------------------------------------------

/** Running for it: arms going like windmills, mouth open, shades knocked crooked. */
const fleeArms = (ctx: Ctx, f: number, skin: string, sy: number) => {
  const s = Math.sin(f * 0.6);
  arm(ctx, -6, sy, -14 - s * 4, sy - 16 - s * 6, skin);
  arm(ctx, 7, sy, 15 + s * 4, sy - 18 + s * 6, skin);
};

/** The agent: feet planted, his pistol up in both hands, level at him (walking in, it's held up by his chest). */
const drawAgent = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), walking = Math.abs(e.vel.x) > 0.5, run = fleeing(e);
  legs(ctx, -30, f * (run ? 1.8 : 1), walking ? (run ? 7 : 4) : 0.8);
  ctx.save(); if (run) { ctx.translate(0, -30); ctx.rotate(0.15); ctx.translate(0, 30); }
  if (!run) arm(ctx, -6, -54, 12, -50, skin, 5);
  jacket(ctx, -12, -60, 24, 32);
  head(ctx, 2, -67, skin, hairOf(e), run ? 'scream' : 'grim', 8, run ? 0.3 : 0);
  if (run) fleeArms(ctx, f, skin, -56);
  else if (walking) { arm(ctx, 6, -56, 14, -47, skin); pistol(ctx, 14, -48, -0.9, 0, skin); }
  else { arm(ctx, 6, -56, 20, -51, skin); pistol(ctx, 20, -52, 0, charge(e), skin); }
  ctx.restore();
};

/** The rusher: a big lad, shoulders like a fridge, head down and arms out to tackle (crouched, waiting, otherwise). */
const drawRusher = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), running = Math.abs(e.vel.x) > 1, run = fleeing(e);
  legs(ctx, -30, f * (running ? 1.8 : 0.6), running ? 8 : 1, 8);
  ctx.save(); ctx.translate(0, -30); ctx.rotate(run ? 0.12 : running ? 0.42 : 0.18);
  if (!run) arm(ctx, -10, -32, running ? 14 : 4, running ? -26 : -14, skin, 6.5);
  jacket(ctx, -16, -40, 32, 38, running ? 3 : 0);
  head(ctx, 6, -46, skin, hairOf(e), run ? 'scream' : running ? 'grit' : 'grim', 9.4, run ? -0.35 : 0);
  if (run) fleeArms(ctx, f, skin, -34);
  else arm(ctx, 10, -34, running ? 30 : 18, running ? -24 : -12, skin, 6.5);
  ctx.restore();
};

/** The ballistic shield (black, SECRET SERVICE across it, the viewport), held up in front, or lowered to fire. */
const shield = (ctx: Ctx, x: number, y: number, up: boolean) => {
  ctx.save(); ctx.translate(x, y); if (!up) ctx.rotate(0.45);
  const path = () => ctx.roundRect(0, 0, 12, 60, [3, 5, 5, 3]);
  shaded(ctx, path, '#1a1d22', 0, 0, 12, 60);
  ctx.save(); ctx.beginPath(); path(); ctx.clip();
  // (the viewport near the top, its glass catching the light)
  ink(ctx, () => ctx.rect(2.4, 6, 7, 5), '#3a4a5a', 0.7);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fillRect(3.2, 6.8, 3, 0.8);
  // (the stenciling, side on: white bars)
  ctx.fillStyle = '#e5e7eb';
  for (let k = 0; k < 7; k++) ctx.fillRect(4.6, 16 + k * 4.2, 3, 2.4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'; ctx.fillRect(0, 0, 3, 60);
  // (scuffs and bullet strikes on it)
  ctx.fillStyle = '#6b7280'; ctx.fillRect(8, 30, 2, 2); ctx.fillRect(2, 46, 2, 2);
  ctx.restore();
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
};

const drawShieldMan = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), walking = Math.abs(e.vel.x) > 0.5, run = fleeing(e), up = !!e.isShieldActive && !run;
  legs(ctx, -30, f * (run ? 1.8 : 1), walking ? (run ? 7 : 3) : 0.8);
  ctx.save(); if (run) { ctx.translate(0, -30); ctx.rotate(0.15); ctx.translate(0, 30); }
  jacket(ctx, -12, -60, 24, 32);
  head(ctx, 0, -67, skin, hairOf(e), run ? 'scream' : 'grim', 8, run ? 0.3 : 0);
  if (run) fleeArms(ctx, f, skin, -56);
  else if (up) {
    // (crouched in behind it, the shield's handle in his fist)
    arm(ctx, 4, -55, 13, -46, skin);
    shield(ctx, 13, -70, true);
  } else {
    // Shield down, round it with the pistol
    shield(ctx, 4, -50, false);
    arm(ctx, 6, -56, 21, -53, skin);
    pistol(ctx, 21, -54, 0, charge(e), skin);
  }
  ctx.restore();
};

/** The jetpack man: tanks on his back, flames out of the nozzles, legs dangling, firing down at him. */
const drawJetAgent = (ctx: Ctx, e: Enemy, f: number) => {
  const skin = skinOf(e), run = fleeing(e);
  const dangle = Math.sin(f * 0.12) * 2;
  // The jet: two tanks behind him, the nozzles under them, the fire out of them
  const flame = 0.7 + 0.3 * Math.sin(f * 1.7) + (run ? 0.5 : 0);
  for (const tx of [-17, -11]) {
    shaded(ctx, () => ctx.roundRect(tx, -64, 7, 24, 3), '#9ca3af', tx, -64, 7, 24, 0.9);
    ctx.fillStyle = '#b91c1c'; ctx.fillRect(tx + 1, -60, 5, 2);
    ink(ctx, () => { ctx.moveTo(tx + 1, -40); ctx.lineTo(tx + 6, -40); ctx.lineTo(tx + 7, -35); ctx.lineTo(tx, -35); ctx.closePath(); }, '#3f3f46', 0.8);
    // (the fire's drawn upside down: out the bottom of the nozzle, roaring down)
    ctx.save(); ctx.translate(tx + 3.5, -35); ctx.scale(1, -1);
    drawFire(ctx, 0, 0, 7, 18 * flame, f, { seed: tx + Math.round(e.homeX || 0), glow: 0.6 });
    ctx.restore();
  }
  // (the straps over his shoulders)
  ctx.fillStyle = '#27272a'; ctx.fillRect(-9, -60, 3, 26);
  // Legs dangling, a bit swinging
  ctx.save(); ctx.translate(0, -30); ctx.rotate(0.12 + dangle * 0.02);
  for (const [x, k] of [[-8, 1], [1, -1]] as const) {
    shaded(ctx, () => ctx.rect(x, 0, 7, 22 + k * dangle * 0.5), SUIT, x, 0, 7, 24);
    ink(ctx, () => ctx.roundRect(x - 1, 22 + k * dangle * 0.5, 10, 4.5, [2, 3, 1, 1]), SHOE, 1);
  }
  ctx.restore();
  jacket(ctx, -12, -60, 24, 32);
  head(ctx, 2, -67, skin, hairOf(e), run ? 'scream' : 'grim', 8, run ? -0.3 : 0);
  if (run) fleeArms(ctx, f, skin, -56);
  else { arm(ctx, 6, -56, 18, -44, skin); pistol(ctx, 18, -45, 0.6, Math.max(0, (e.shootTimer - 100) / 20), skin); }
};
