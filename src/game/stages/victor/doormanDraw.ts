// The doorman, drawn: a huge bald man in a black SECURITY tee, gold chain,
// earpiece, shades, tattooed forearms. His poses (walking you down, winding up,
// the shoulder charge, the slide, the uppercut, flat on his back), the clashes'
// on-screen prompts (a gamepad's B, or a mouse's right button, whichever you
// used last), his health bar, what he's saying, and what's left of him. Drawn the
// 16-bit way: an ink line round every part, lit from the upper left in steps.

import type { Enemy, WeaponType } from '../../../types';
import type { GameState } from '../../core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../constants';
import { getLastInputDevice } from '../../platform/input';
import { padFamily } from '../../platform/device';
import { drawPadFace } from '../../render/padGlyph';
import { drawPlayer } from '../../render/player/player';
import { DoormanFight, DoormanCorpse, DOORMAN_HP, SLIDE_ZONE, SLIDE_COUNTDOWN } from './doorman';
import { KIND_STATS } from '../../enemies/kinds';
import { sentenceShown } from '../../platform/speech';
import { checker, pixelBlob, steppedGlow } from '../../render/pixelArt';
import { INK, dark, lite, ink, shaded } from '../../render/npc/kit';
import { slab } from '../barry/rooms';
import { drawBloodPool } from '../../render/spatter';

type Ctx = CanvasRenderingContext2D;
const W = KIND_STATS.doorman.w, H = KIND_STATS.doorman.h;
const SKIN = '#B98158', SKIN_DARK = '#8C5A36', SHIRT = '#111827', PANTS = '#1F2937', BOOT = '#0A0A0A', GOLD = '#FACC15';

/** Meathead mid-clash (the real one's hidden and held still): locked in his shoulder charge or his slide, straining. */
export const drawClashingMeathead = (ctx: Ctx, state: GameState, fight: DoormanFight) => {
  const c = fight.clash;
  if (!c) return;
  const p = state.player;
  const strain = Math.sin(state.frame * 1.3) * 1.5;
  const body = { ...p, pos: { x: -1e6, y: -1e6 }, hidden: false, isGrounded: true, vel: { x: 0, y: 0 }, isCharging: true, isSliding: c.kind === 'slide', chargeTimer: 20, invincibilityTimer: 0, hurtTimer: 0, pushbackTimer: 0 };
  ctx.save();
  ctx.translate(p.pos.x + p.width / 2 + strain, p.pos.y + p.height / 2);
  ctx.translate(-(body.pos.x + body.width / 2), -(body.pos.y + body.height / 2));
  drawPlayer(ctx, body, { ...state, deathTimer: 0 }, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  ctx.restore();
};

export const drawDoorman = (ctx: Ctx, e: Enemy, fight: DoormanFight, f: number) => {
  ctx.save();
  ctx.translate(e.pos.x + W / 2, e.pos.y + H);
  ctx.scale(e.facing === 1 ? 1 : -1, 1);
  if ((e.hitFlash || 0) > 0) ctx.filter = 'brightness(1.8)';
  const st = e.aiState || 'stalk', t = e.aiTimer || 0;
  switch (st) {
    case 'slide': case 'clash-slide': poseSlide(ctx, f); break;
    case 'tripped': poseTripped(ctx, f); break;
    case 'thrown': ctx.translate(0, -H / 2); ctx.rotate(-t * 0.16); ctx.translate(0, H / 2); poseTripped(ctx, f); break;
    // Finished off in a clash: cartwheeling sky high (the shoulder), or spinning like a top (the sweep)
    case 'launched': ctx.translate(0, -H / 2); ctx.rotate(-t * 0.3); ctx.translate(0, H / 2); poseTripped(ctx, f); break;
    case 'spun': ctx.translate(0, -H / 2); ctx.scale(Math.cos(t * 0.6), 1); ctx.rotate(-0.4); ctx.translate(0, H / 2); poseTripped(ctx, f); break;
    case 'uppercut': poseUppercut(ctx, f); break;
    case 'charge': case 'clash-shoulder': poseCharge(ctx, f, st === 'clash-shoulder'); break;
    case 'windup-charge': poseStand(ctx, f, 'dip', t); break;
    case 'windup-slide': poseStand(ctx, f, 'crouch', t); break;
    case 'shove': poseStand(ctx, f, 'shove', t); break;
    case 'door': poseStand(ctx, f, 'folded', t); break;
    default: poseStand(ctx, f, Math.abs(e.vel.x) > 0.3 ? 'walk' : 'guard', t);
  }
  ctx.restore();
  // The tells, loud and clear: a red flash and a big "!!" with an arrow for the charge, a blue one down low for the slide, yellow for the uppercut
  const tell = st === 'windup-charge' ? { color: '#EF4444', text: '!!', low: false } : st === 'windup-slide' ? { color: '#38BDF8', text: '!!', low: true } : st === 'uppercut' && t < 10 ? { color: '#FACC15', text: '!', low: false } : null;
  if (tell) {
    const cx = e.pos.x + W / 2, top = e.pos.y - 26;
    const blink = Math.floor(f / 4) % 2 === 0;
    ctx.save();
    // A glow round him, in hard rings
    steppedGlow(ctx, cx, e.pos.y + (tell.low ? H - 20 : H / 2), 90, tell.color, blink ? 0.6 : 0.36, 0.04, 5);
    ctx.textAlign = 'center'; ctx.font = 'bold 36px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText(tell.text, cx + 3, top + 3);
    ctx.fillStyle = blink ? '#FFFFFF' : tell.color; ctx.fillText(tell.text, cx, top);
    // Which way it's coming
    if (st !== 'uppercut') {
      const dir = e.facing === 1 ? 1 : -1, ay = tell.low ? e.pos.y + H - 16 : e.pos.y + H / 2;
      ctx.fillStyle = tell.color;
      for (let k = 0; k < 3; k++) { const ax = cx + dir * (60 + k * 22 + ((f * 2) % 22)); ink(ctx, () => { ctx.moveTo(ax + dir * 14, ay); ctx.lineTo(ax, ay - 10); ctx.lineTo(ax, ay + 10); ctx.closePath(); }, tell.color, 1.5); }
    }
    ctx.restore();
  }
  void fight;
};

/** A block of him (a leg, a boot): inked, lit down the left, shaded down the right. */
const block = (ctx: Ctx, x: number, y: number, w: number, h: number, c: string, r = 2) => shaded(ctx, () => ctx.roundRect(x, y, w, h, r), c, x, y, w, h);

const legs = (ctx: Ctx, f: number, stride: number, crouch = 0) => {
  const s = Math.sin(f * 0.18) * stride;
  block(ctx, -16 + s, -44 + crouch, 14, 40 - crouch, PANTS);
  block(ctx, 4 - s, -44 + crouch, 14, 40 - crouch, PANTS);
  // (cargo pockets, flapped)
  for (const px of [-16 + s, 14 - s]) { ctx.fillStyle = INK; ctx.fillRect(px, -30 + crouch, 4, 8); ctx.fillStyle = '#374151'; ctx.fillRect(px + (px > 0 ? 0 : 1), -29 + crouch, 3, 6); ctx.fillStyle = '#4B5563'; ctx.fillRect(px + (px > 0 ? 0 : 1), -29 + crouch, 3, 1); }
  boot(ctx, -19 + s, -8); boot(ctx, 2 - s, -8);
};

/** A boot: black leather, a toe cap lit, a sole under it. */
const boot = (ctx: Ctx, x: number, y: number, w = 19, h = 8) => {
  ink(ctx, () => ctx.roundRect(x, y, w, h, [3, 4, 1, 1]), BOOT);
  ctx.fillStyle = '#3F3F46'; ctx.fillRect(x + w - 7, y + 1, 4, 1); ctx.fillRect(x + 2, y + 1, 3, 1);
  ctx.fillStyle = '#52525B'; ctx.fillRect(x, y + h - 2, w, 1);
};

/** The slab of him from the waist up (x at his middle, y at his waist), leaning `lean`. */
const torso = (ctx: Ctx, y: number, lean: number, f: number) => {
  ctx.save();
  ctx.translate(0, y);
  ctx.rotate(lean);
  // Huge traps and shoulders under a stretched black tee (lit across the shoulders, folds where it strains)
  const tee = () => { ctx.moveTo(-26, 0); ctx.lineTo(-32, -44); ctx.quadraticCurveTo(0, -58, 32, -44); ctx.lineTo(26, 0); ctx.closePath(); };
  shaded(ctx, tee, SHIRT, -32, -54, 64, 54, 1.5);
  ctx.save(); ctx.beginPath(); tee(); ctx.clip();
  ctx.fillStyle = '#2B3647'; ctx.fillRect(-30, -50, 60, 4);
  ctx.fillStyle = '#060A12'; ctx.fillRect(-14, -12, 10, 1); ctx.fillRect(4, -10, 12, 1); ctx.fillRect(-20, -36, 1, 10); ctx.fillRect(20, -38, 1, 12);
  ctx.restore();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-26, -2, 52, 4); ctx.fillStyle = INK; ctx.fillRect(-26, 2, 52, 1);
  // (the lettering reads right way round whichever way he's facing)
  const t = ctx.getTransform();
  ctx.save(); if (t.a * t.d - t.b * t.c < 0) ctx.scale(-1, 1);
  ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center';
  ctx.fillStyle = '#64748B'; ctx.fillText('SECURITY', 1, -23);
  ctx.fillStyle = '#F8FAFC'; ctx.fillText('SECURITY', 0, -24);
  ctx.restore();
  // Neck, gold chain
  block(ctx, -9, -58, 18, 10, SKIN_DARK, 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -52, 11, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -52, 11, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.fillStyle = '#FEF9C3'; for (let k = 0; k < 5; k++) { const a = 0.4 + k * 0.55; ctx.fillRect(Math.round(Math.cos(a) * 11) - 1, Math.round(-52 + Math.sin(a) * 11) - 1, 1, 1); }
  // Head: bald, shaved stubble, shades, an earpiece, a frown
  const skull = () => ctx.roundRect(-11, -80, 24, 25, [8, 8, 5, 5]);
  shaded(ctx, skull, SKIN, -11, -80, 24, 25, 1.5);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-6, -78, 8, 2); ctx.fillRect(-7, -76, 3, 2);
  ctx.fillStyle = 'rgba(41, 37, 36, 0.3)'; ctx.fillRect(-10, -62, 22, 6); // (the stubble)
  ink(ctx, () => ctx.roundRect(1, -72, 13, 5, 1), '#0A0A0A', 0.8);
  ctx.fillStyle = '#4B5563'; ctx.fillRect(3, -71, 4, 1);
  ctx.fillStyle = INK; ctx.fillRect(-13, -69, 5, 8); ctx.fillStyle = '#6B7280'; ctx.fillRect(-12, -68, 3, 6);
  ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-11, -62); ctx.quadraticCurveTo(-14, -54, -10, -48); ctx.stroke();
  ctx.fillStyle = INK; ctx.fillRect(4, -61, 8, 2); ctx.fillRect(10, -60, 2, 2);
  ctx.fillStyle = SKIN_DARK; ctx.fillRect(10, -67, 3, 3); // (the nose)
  void f;
  ctx.restore();
};

/** An arm from the shoulder (x, y) along `angle` (0 = forward), with a fist. */
const arm = (ctx: Ctx, x: number, y: number, angle: number, len = 34, back = false) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const c = back ? SKIN_DARK : SKIN;
  ink(ctx, () => { ctx.arc(0, 0, 10, Math.PI * 0.5, Math.PI * 1.5); ctx.lineTo(len, -7); ctx.lineTo(len, 7); ctx.closePath(); }, c, 1.5);
  // (the light along the top of it, the shade under)
  ctx.fillStyle = lite(c, 0.18); ctx.fillRect(-6, -7, len + 4, 3);
  ctx.fillStyle = dark(c, 0.2); ctx.fillRect(-4, 3, len + 2, 3);
  if (!back) { ctx.fillStyle = '#1E3A8A'; ctx.fillRect(10, -5, 12, 3); ctx.fillRect(14, 0, 8, 3); ctx.fillStyle = '#3B5BBF'; ctx.fillRect(10, -5, 12, 1); } // tattoos
  const fist = back ? '#7A4B2C' : '#A36F48';
  ink(ctx, () => ctx.arc(len, 0, 9, 0, Math.PI * 2), fist, 1.5);
  ctx.fillStyle = lite(fist, 0.25); ctx.fillRect(len - 5, -6, 5, 3);
  ctx.fillStyle = INK; ctx.fillRect(len + 3, -4, 1, 3); ctx.fillRect(len + 3, 1, 1, 3);
  ctx.restore();
};

/** A cloud of dust kicked up. */
const dust = (ctx: Ctx, x: number, y: number, r: number) => pixelBlob(ctx, x, y, r, r * 0.8, 'rgba(120,113,108,0.6)');

const poseStand = (ctx: Ctx, f: number, mode: 'walk' | 'guard' | 'dip' | 'crouch' | 'shove' | 'folded', t: number) => {
  const crouch = mode === 'crouch' ? Math.min(14, t) : mode === 'dip' ? 6 : 0;
  legs(ctx, f, mode === 'walk' ? 5 : 0, crouch);
  const lean = mode === 'dip' ? 0.35 + Math.sin(t * 0.8) * 0.03 : mode === 'crouch' ? 0.2 : mode === 'shove' ? -0.1 : 0;
  const y = -44 + crouch;
  arm(ctx, -22, y - 40, Math.PI * 0.55, 30, true);
  torso(ctx, y, lean, f);
  ctx.save(); ctx.translate(0, y); ctx.rotate(lean);
  if (mode === 'folded') {
    // Arms crossed over the chest
    block(ctx, -26, -34, 52, 12, SKIN, 5);
    ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-12, -32, 14, 3);
    ctx.fillStyle = INK; ctx.fillRect(0, -34, 1, 12);
  } else if (mode === 'shove') arm(ctx, 22, -40, 0, 40);
  else if (mode === 'dip') arm(ctx, 22, -38, 0.9, 28);
  else arm(ctx, 22, -40, -0.9 + Math.sin(f * 0.1) * 0.08, 30); // fists up
  ctx.restore();
  // Pawing the ground before the charge
  if (mode === 'dip' && t % 8 < 4) dust(ctx, -20, -4, 6);
};

const poseCharge = (ctx: Ctx, f: number, braced: boolean) => {
  legs(ctx, f * 2, braced ? 2 : 10, 4);
  arm(ctx, -22, -80, Math.PI * 0.7, 30, true);
  torso(ctx, -40, 0.6, f);
  // Shoulder leading, glowing with effort
  ctx.save(); ctx.translate(0, -40); ctx.rotate(0.6);
  steppedGlow(ctx, 24, -40, 22, '#F87171', 0.5, 0.15, 3);
  shaded(ctx, () => ctx.arc(24, -40, 14, 0, Math.PI * 2), SHIRT, 10, -54, 28, 28, 1.5);
  arm(ctx, 18, -34, 1.6, 24);
  ctx.restore();
  if (!braced) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; for (let i = 0; i < 4; i++) ctx.fillRect(-70 - i * 8, -81 + i * 16, 30, 2); }
};

const poseSlide = (ctx: Ctx, f: number) => {
  // Laid back, lead boot out front along the ground
  ctx.save(); ctx.translate(-10, -18); ctx.rotate(-1.25);
  torso(ctx, 0, 0, f);
  ctx.restore();
  block(ctx, -12, -22, 50, 14, PANTS, 3); block(ctx, -4, -16, 40, 12, PANTS, 3);
  ink(ctx, () => ctx.roundRect(36, -26, 14, 20, [2, 4, 4, 2]), BOOT); ctx.fillStyle = '#52525B'; ctx.fillRect(48, -26, 1, 20);
  for (let i = 0; i < 3; i++) dust(ctx, -40 - i * 12, -4, 6 + i * 2);
};

const poseUppercut = (ctx: Ctx, f: number) => {
  legs(ctx, f, 0, 0);
  arm(ctx, -22, -84, Math.PI * 0.6, 28, true);
  torso(ctx, -44, -0.1, f);
  // Fist straight up
  arm(ctx, 18, -84, -1.45, 40);
  steppedGlow(ctx, 22, -128, 16, '#FDE047', 0.6, 0.2, 3);
};

/** Stars going round his head (x, y the middle of them). */
const stars = (ctx: Ctx, x: number, y: number, rx: number, ry: number, f: number) => {
  for (let i = 0; i < 3; i++) {
    const a = f * 0.15 + (i * Math.PI * 2) / 3, sx = Math.round(x + Math.cos(a) * rx), sy = Math.round(y + Math.sin(a) * ry);
    ctx.fillStyle = INK; ctx.fillRect(sx - 4, sy - 1, 9, 3); ctx.fillRect(sx - 1, sy - 4, 3, 9);
    ctx.fillStyle = '#FDE047'; ctx.fillRect(sx - 3, sy, 7, 1); ctx.fillRect(sx, sy - 3, 1, 7); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(sx, sy, 1, 1);
  }
};

const poseTripped = (ctx: Ctx, f: number) => {
  // Flat on his back, stars going round
  ctx.save(); ctx.translate(-30, -14); ctx.rotate(-Math.PI / 2);
  torso(ctx, 0, 0, f);
  ctx.restore();
  block(ctx, -20, -20, 56, 16, PANTS, 3);
  boot(ctx, 32, -30, 12, 16); boot(ctx, 40, -24, 12, 14);
  stars(ctx, -92, -28, 18, 6, f);
};

// ---------------------------------------------------------------------------
// What's left of him
// ---------------------------------------------------------------------------

export const drawDoormanCorpse = (ctx: Ctx, c: DoormanCorpse, f: number) => {
  const t = f - c.t0;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.facing === 1 ? 1 : -1, 1);
  const blood = (w: number) => drawBloodPool(ctx, 0, 3, Math.round(Math.min(w, 20 + t * 0.6)), 243, { color: '#7A0A0A' });
  const body = (tint?: string) => {
    ctx.save(); if (tint) ctx.filter = tint;
    ctx.save(); ctx.translate(-30, -14); ctx.rotate(-Math.PI / 2); torso(ctx, 0, 0, 0); ctx.restore();
    block(ctx, -20, -20, 56, 16, PANTS, 3); boot(ctx, 32, -30, 12, 16);
    ctx.restore();
  };
  if (c.finisher === 'shoulder') {
    // Came down head first: buried to the shoulders, legs sticking straight up, twitching
    pixelBlob(ctx, 0, -2, 46, 8, '#44403C');
    for (let i = 0; i < 6; i++) slab(ctx, -40 + i * 14, -8 - (i % 2) * 4, 8, 6, '#57534E', 1);
    const tw = Math.floor(f / 30) % 5 === 0 ? Math.sin(f * 1.2) * 0.12 : 0;
    ctx.save(); ctx.rotate(tw);
    block(ctx, -26, -30, 52, 30, SHIRT, 4);
    ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center';
    { const t2 = ctx.getTransform(); ctx.save(); ctx.translate(0, -16); ctx.rotate(Math.PI); if (t2.a * t2.d - t2.b * t2.c < 0) ctx.scale(-1, 1); ctx.fillText('SECURITY', 0, 3); ctx.restore(); } // (upside down)
    block(ctx, -18, -84, 15, 56, PANTS); block(ctx, 3, -84, 15, 56, PANTS);
    boot(ctx, -20, -96, 19, 14); boot(ctx, 1, -96, 19, 14);
    ctx.restore();
    stars(ctx, 0, -104, 20, 5, f);
    pixelBlob(ctx, 0, -2, 30, 3, 'rgba(28, 25, 23, 0.5)');
    ctx.restore();
    return;
  }
  if (c.finisher === 'slide') {
    // Came down spinning and skidded along on his face: a long skid mark behind, his rear in the air
    ctx.fillStyle = 'rgba(40, 14, 8, 0.85)'; ctx.fillRect(10, -5, Math.min(260, 40 + t * 6), 6);
    ctx.fillStyle = '#6B0000'; ctx.fillRect(10, -3, Math.min(240, 30 + t * 5), 2);
    ctx.save(); ctx.translate(-20, -12); ctx.rotate(0.35);
    block(ctx, -10, -18, 50, 24, SHIRT, 4);
    block(ctx, 34, -34, 22, 26, PANTS, 4);
    boot(ctx, 52, -46, 14, 14); boot(ctx, 60, -40, 14, 12);
    shaded(ctx, () => ctx.arc(-18, 2, 12, 0, Math.PI * 2), SKIN, -30, -10, 24, 24, 1.5); // face in the dirt
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-24, -6, 6, 2);
    ctx.restore();
    for (let i = 0; i < 3; i++) { const k = ((f * 0.5 + i * 20) % 60) / 60, r = 6 + k * 10; pixelBlob(ctx, -30 - k * 20, -10 - k * 20, r, r, `rgba(120,113,108,${(0.5 * (1 - k)).toFixed(2)})`); }
    ctx.restore();
    return;
  }
  const w: WeaponType = c.weapon;
  switch (w) {
    case 'SHOTGUN':
      // Blown half apart: legs one side, the rest of him further off
      blood(90);
      block(ctx, 10, -18, 44, 16, PANTS, 3); boot(ctx, 50, -26, 12, 16);
      ctx.fillStyle = INK; ctx.fillRect(3, -21, 10, 22); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(4, -20, 8, 20); ctx.fillStyle = '#DC2626'; ctx.fillRect(4, -20, 3, 20);
      ctx.save(); ctx.translate(-70, -12); ctx.rotate(-Math.PI / 2 - 0.3); torso(ctx, 0, 0, 0); ctx.restore();
      for (let i = 0; i < 8; i++) { ctx.fillStyle = INK; ctx.fillRect(-61 + i * 12, -7 - (i % 3) * 4, 7, 6); ctx.fillStyle = '#991B1B'; ctx.fillRect(-60 + i * 12, -6 - (i % 3) * 4, 5, 4); }
      break;
    case 'FLAMETHROWER':
      // Charred black, still smoking
      body('brightness(0.2) sepia(1)');
      ctx.fillStyle = '#EA580C'; ctx.fillRect(-10, -12, 2, 2); ctx.fillRect(12, -16, 2, 2); ctx.fillRect(-40, -30, 2, 2);
      for (let i = 0; i < 3; i++) { const k = ((f * 0.6 + i * 25) % 70) / 70, r = 8 + k * 10; pixelBlob(ctx, -20 + i * 20, -30 - k * 60, r, r, `rgba(80,80,80,${(0.5 * (1 - k)).toFixed(2)})`); }
      break;
    case 'BOULDER':
      // Under a boulder, just his boots and a spreading puddle sticking out
      blood(80);
      boot(ctx, 34, -12, 14, 12); boot(ctx, 46, -10, 12, 10);
      shaded(ctx, () => ctx.ellipse(-4, -34, 46, 36, 0, 0, Math.PI * 2), '#57534E', -50, -70, 92, 72, 2);
      ctx.save(); ctx.beginPath(); ctx.ellipse(-4, -34, 45, 35, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = '#44403C'; ctx.fillRect(-50, -14, 92, 16); checker(ctx, -50, -18, 92, 4, '#44403C');
      ctx.fillStyle = INK; ctx.fillRect(-20, -40, 14, 1); ctx.fillRect(-6, -40, 1, 10); ctx.fillRect(14, -24, 10, 1);
      ctx.restore();
      ink(ctx, () => ctx.ellipse(-14, -46, 18, 12, 0, 0, Math.PI * 2), '#78716C', 0.8);
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-24, -54, 8, 3); ctx.fillRect(-26, -51, 3, 3);
      break;
    case 'TSUNAMI':
      // Washed up soaked in a puddle, a crab on him
      pixelBlob(ctx, 0, -2, 80, 7, 'rgba(56, 189, 248, 0.5)');
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(-60, -6, 20, 2); ctx.fillRect(30, -5, 26, 2);
      body('saturate(0.6) brightness(0.9)');
      // (the crab sat on his legs)
      ink(ctx, () => ctx.arc(-10, -25, 6, 0, Math.PI * 2), '#DC2626');
      ctx.fillStyle = '#FCA5A5'; ctx.fillRect(-13, -29, 3, 2);
      ctx.fillStyle = INK; ctx.fillRect(-18, -27, 3, 1); ctx.fillRect(-5, -27, 3, 1); ctx.fillRect(-12, -31, 1, 2); ctx.fillRect(-8, -31, 1, 2);
      break;
    case 'TASER':
      // Fried: twitching, the odd flash of his skeleton
      body(Math.floor(f / 4) % 7 === 0 ? 'invert(1)' : undefined);
      ctx.save(); ctx.translate(Math.sin(f * 1.7) * 1.5, 0); ctx.restore();
      if (Math.floor(f / 5) % 3 === 0) {
        const bolt: [number, number][] = [[-40, -30], [-30, -40], [-20, -28], [-8, -38]];
        ctx.lineJoin = 'miter';
        ctx.strokeStyle = '#0E7490'; ctx.lineWidth = 4; ctx.beginPath(); bolt.forEach(([bx, by], k) => k ? ctx.lineTo(bx, by) : ctx.moveTo(bx, by)); ctx.stroke();
        ctx.strokeStyle = '#A5F3FC'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.stroke();
      }
      break;
    case 'NEEDLES':
      // Bloated up like a balloon, full of darts
      body('saturate(1.6) hue-rotate(-20deg)');
      pixelBlob(ctx, -10, -26, 44, 24, 'rgba(190, 18, 60, 0.5)');
      ctx.fillStyle = 'rgba(255, 228, 230, 0.5)'; ctx.fillRect(-36, -42, 10, 2); ctx.fillRect(-38, -40, 3, 4);
      for (let i = 0; i < 7; i++) {
        const nx = -40 + i * 11, ny = -36 - (i % 2) * 6;
        ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx - 4, ny - 12); ctx.stroke();
        ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx - 4, ny - 12); ctx.stroke();
        ctx.fillStyle = '#EF4444'; ctx.fillRect(nx - 6, ny - 15, 4, 4);
      }
      break;
    case 'SLUDGE':
      // Melting into a green puddle
      pixelBlob(ctx, 0, -3, 70, 8, '#4D7C0F');
      pixelBlob(ctx, -6, -4, 56, 5, '#65A30D');
      ctx.fillStyle = '#BEF264'; ctx.fillRect(-40, -8, 12, 2); ctx.fillRect(20, -6, 8, 2);
      ctx.save(); ctx.scale(1, Math.max(0.4, 1 - t / 400)); body('hue-rotate(60deg) saturate(1.4)'); ctx.restore();
      break;
    case 'OIL_ROCKET':
      // Blown apart and greasy: bits everywhere, glistening
      blood(70);
      pixelBlob(ctx, 0, -2, 70, 6, '#0A0A0A');
      ctx.fillStyle = 'rgba(167, 139, 250, 0.5)'; ctx.fillRect(-30, -5, 14, 1); ctx.fillStyle = 'rgba(94, 234, 212, 0.5)'; ctx.fillRect(-16, -5, 10, 1);
      ctx.save(); ctx.translate(-40, -12); ctx.rotate(-Math.PI / 2 - 0.6); ctx.filter = 'brightness(0.45)'; torso(ctx, 0, 0, 0); ctx.restore();
      boot(ctx, 40, -10, 12, 10);
      break;
    default:
      // Face down in a pool of it, riddled
      blood(70);
      body();
      // (the holes in him: across his back and down his legs, where he is, none in the air over him)
      for (const [hx, hy] of [[-71, -35], [-57, -23], [-45, -37], [-37, -13], [-9, -15], [13, -16]]) { ctx.fillStyle = INK; ctx.fillRect(hx, hy, 6, 6); ctx.fillStyle = '#7F1D1D'; ctx.fillRect(hx + 1, hy + 1, 4, 4); ctx.fillStyle = '#B91C1C'; ctx.fillRect(hx + 1, hy + 1, 2, 2); }
  }
  // His membership list, on the ground next to him
  ctx.fillStyle = INK; ctx.fillRect(55, -5, 20, 6);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(56, -4, 18, 4); ctx.fillStyle = '#111827'; ctx.fillRect(58, -3, 12, 1);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// Screen space: his health, what he's saying, the clashes
// ---------------------------------------------------------------------------

export const drawDoormanHud = (ctx: Ctx, state: GameState, fight: DoormanFight) => {
  const e = fight.man;
  if (e && (fight.phase === 'intro' || fight.phase === 'fight' || fight.phase === 'waiting')) {
    // What he's saying, over his head
    if (fight.lineT > 0 && fight.line) {
      const line = sentenceShown(fight.line);
      const x = e.pos.x + W / 2 - state.camera.x, y = e.pos.y - 28 - state.camera.y;
      ctx.save();
      ctx.font = 'bold 9px "Press Start 2P"';
      const w = Math.min(420, ctx.measureText(line).width + 18);
      const bx = Math.max(10, Math.min(CANVAS_WIDTH - w - 10, x - w / 2));
      ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
      ctx.fillRect(bx, y - 24, w, 22); ctx.strokeRect(bx, y - 24, w, 22);
      ctx.beginPath(); ctx.moveTo(x - 6, y - 2); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x, y + 8); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText(line, bx + w / 2, y - 9, w - 12);
      ctx.restore();
    }
  }
  if (!e || (fight.phase !== 'intro' && fight.phase !== 'fight')) return;
  if (fight.zoom > 0.01) drawClashCinema(ctx, state, fight);
  // His health bar
  const fill = fight.phase === 'intro' ? Math.min(1, fight.t / 60) : Math.max(0, e.health / DOORMAN_HP);
  const L = 330, R = 780;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(L - 10, 12, R - L + 20, 40);
  ctx.strokeStyle = '#9D174D'; ctx.lineWidth = 2; ctx.strokeRect(L - 10, 12, R - L + 20, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FBCFE8'; ctx.textAlign = 'left';
  ctx.fillText('THE DOORMAN', L, 28);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#A5F3FC'; ctx.textAlign = 'right'; ctx.fillText('CLUB CALDERA SECURITY', R, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L, 34, R - L, 10);
  ctx.fillStyle = fight.hpFlash > 0 ? '#FEF3C7' : '#DB2777'; ctx.fillRect(L, 34, (R - L) * fill, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = L; x < R; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
  if (fight.clash) drawClash(ctx, state, fight);
};

/** The clash buttons, for the last thing the player used: a pad's A B X Y diamond, or the W A S D keys. They flash when pressed. */
const drawSpecialButton = (ctx: Ctx, x: number, y: number, pressed: boolean, f: number) => {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const bump = pressed ? 2 : 0;
  if (getLastInputDevice() === 'gamepad') {
    // (the four face buttons, as this controller has them printed: any of them will do)
    const fam = padFamily();
    if (fam === 'joycon-l' || fam === 'joycon-r') {
      drawPadFace(ctx, x, y + bump, 20, 'A', fam, pressed);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('ANY BUTTON', x, y + 34);
    } else {
      drawPadFace(ctx, x, y - 18 + bump, 11, 'Y', fam, pressed); drawPadFace(ctx, x - 18, y + bump, 11, 'X', fam, pressed);
      drawPadFace(ctx, x + 18, y + bump, 11, 'B', fam, pressed); drawPadFace(ctx, x, y + 18 + bump, 11, 'A', fam, pressed);
    }
  } else {
    // A mouse, its two buttons blinking in turn (either one will do)
    ctx.fillStyle = '#E5E7EB'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - 16, y - 24 + bump, 32, 46, 14); ctx.fill(); ctx.stroke();
    const leftLit = Math.floor(f / 8) % 2 === 0;
    ctx.fillStyle = pressed ? '#991B1B' : leftLit ? '#E5E7EB' : '#DC2626';
    ctx.beginPath(); ctx.moveTo(x, y - 22 + bump); ctx.lineTo(x, y - 4 + bump); ctx.lineTo(x + 14, y - 4 + bump); ctx.quadraticCurveTo(x + 14, y - 22 + bump, x, y - 22 + bump); ctx.fill();
    ctx.fillStyle = pressed ? '#991B1B' : leftLit ? '#DC2626' : '#E5E7EB';
    ctx.beginPath(); ctx.moveTo(x, y - 22 + bump); ctx.lineTo(x, y - 4 + bump); ctx.lineTo(x - 14, y - 4 + bump); ctx.quadraticCurveTo(x - 14, y - 22 + bump, x, y - 22 + bump); ctx.fill();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 22 + bump); ctx.lineTo(x, y - 4 + bump); ctx.moveTo(x - 14, y - 4 + bump); ctx.lineTo(x + 14, y - 4 + bump); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.fillText('LEFT OR RIGHT CLICK', x, y + 34);
  }
  ctx.restore();
};

/** The clash, dressed up: bars closing in top and bottom, speed lines rushing in on the two of them, a red edge to everything, CLASH! slammed across the screen. */
const drawClashCinema = (ctx: Ctx, state: GameState, fight: DoormanFight) => {
  const z = fight.zoom, f = state.frame, W = CANVAS_WIDTH, H = CANVAS_HEIGHT;
  ctx.save();
  // Red vignette
  const v = ctx.createRadialGradient(W / 2, H / 2 + 30, 140, W / 2, H / 2 + 30, 520);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(90, 0, 0, ${0.7 * z})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // Speed lines rushing in toward them
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * z})`;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2 + Math.sin(i * 7.3) * 0.1;
    const r0 = 220 + ((f * 18 + i * 53) % 260), r1 = r0 + 60 + (i % 3) * 30;
    ctx.lineWidth = 2 + (i % 3);
    ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + 30 + Math.sin(a) * r0 * 0.7); ctx.lineTo(W / 2 + Math.cos(a) * r1, H / 2 + 30 + Math.sin(a) * r1 * 0.7); ctx.stroke();
  }
  // Letterbox bars
  const bar = 64 * z;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  // CLASH! slammed in
  if (fight.clash && fight.clashT < 50) {
    const k = Math.min(1, fight.clashT / 8), out = fight.clashT > 36 ? (fight.clashT - 36) / 14 : 0;
    ctx.globalAlpha = 1 - out;
    ctx.translate(W / 2, H / 2 - 120);
    ctx.scale(2.6 - k * 1.6, 2.6 - k * 1.6);
    ctx.rotate(-0.08);
    ctx.textAlign = 'center'; ctx.font = 'bold 34px "Press Start 2P"';
    ctx.fillStyle = '#000'; ctx.fillText('CLASH!', 4, 4);
    ctx.fillStyle = f % 6 < 3 ? '#FACC15' : '#F97316'; ctx.fillText('CLASH!', 0, 0);
  }
  ctx.restore();
};

const drawClash = (ctx: Ctx, state: GameState, fight: DoormanFight) => {
  const c = fight.clash!;
  const f = state.frame;
  const cx = CANVAS_WIDTH / 2, y = 470;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(cx - 250, y - 44, 500, 150);
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 3; ctx.strokeRect(cx - 250, y - 44, 500, 150);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 16px "Press Start 2P"';
  ctx.fillText(c.kind === 'shoulder' ? 'SHOULDER CLASH!' : 'SLIDE CLASH!', cx, y - 20);
  const barL = cx - 200, barW = 400, barY = y;
  if (c.kind === 'shoulder') {
    // Tug of war: his end red, yours green, the marker where it stands
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(barL, barY, barW, 18);
    ctx.fillStyle = '#15803D'; ctx.fillRect(barL, barY, barW * c.meter, 18);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(barL + barW * c.meter - 3, barY - 6, 6, 30);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.textAlign = 'left'; ctx.fillText('LOSE', barL, barY + 34);
    ctx.textAlign = 'right'; ctx.fillStyle = '#86EFAC'; ctx.fillText('WIN', barL + barW, barY + 34);
    ctx.textAlign = 'center'; ctx.fillStyle = Math.floor(f / 6) % 2 ? '#FFFFFF' : '#FACC15'; ctx.font = 'bold 12px "Press Start 2P"';
    ctx.fillText('MASH IT!', cx - 50, barY + 66);
    drawSpecialButton(ctx, cx + 70, barY + 60, c.flash > 0, f);
  } else {
    // A marker sweeping the bar: hit it in the zone
    ctx.fillStyle = '#374151'; ctx.fillRect(barL, barY, barW, 18);
    ctx.fillStyle = '#16A34A'; ctx.fillRect(barL + barW * (0.5 - SLIDE_ZONE / 2), barY, barW * SLIDE_ZONE, 18);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(barL + barW * c.meter - 3, barY - 6, 6, 30);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < c.hits ? '#22C55E' : '#4B5563'; ctx.beginPath(); ctx.arc(cx - 30 + i * 30, barY + 36, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 10px "Press Start 2P"';
    ctx.fillText('HIT IT IN THE ZONE', cx - 60, barY + 70);
    // The count of three
    if (c.t <= SLIDE_COUNTDOWN + 20) {
      const left = Math.ceil((SLIDE_COUNTDOWN - c.t) / 30);
      const text = left > 0 ? String(left) : 'GO!';
      const k = ((c.t % 30) / 30);
      ctx.save(); ctx.translate(cx, CANVAS_HEIGHT / 2 - 40); ctx.scale(1.6 - k * 0.5, 1.6 - k * 0.5);
      ctx.font = 'bold 40px "Press Start 2P"'; ctx.fillStyle = '#000'; ctx.fillText(text, 3, 3);
      ctx.fillStyle = left > 0 ? '#FACC15' : '#22C55E'; ctx.fillText(text, 0, 0);
      ctx.restore();
    }
    drawSpecialButton(ctx, cx + 110, barY + 62, c.flash > 0 && !c.missed, f);
  }
  ctx.restore();
};
