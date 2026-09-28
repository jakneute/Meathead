// The doorman, drawn: a huge bald man in a black SECURITY tee, gold chain,
// earpiece, shades, tattooed forearms. His poses (walking you down, winding up,
// the shoulder charge, the slide, the uppercut, flat on his back), the clashes'
// on-screen prompts (a gamepad's B, or a mouse's right button, whichever you
// used last), his health bar, what he's saying, and what's left of him.

import type { Enemy, WeaponType } from '../../../types';
import type { GameState } from '../../state';
import { CANVAS_WIDTH } from '../../../constants';
import { getLastInputDevice } from '../../input';
import { DoormanFight, DoormanCorpse, DOORMAN_HP, SLIDE_ZONE } from './doorman';
import { KIND_STATS } from '../../systems/kinds';

type Ctx = CanvasRenderingContext2D;
const W = KIND_STATS.doorman.w, H = KIND_STATS.doorman.h;
const SKIN = '#B98158', SKIN_DARK = '#8C5A36', SHIRT = '#111827', PANTS = '#1F2937', BOOT = '#0A0A0A', GOLD = '#FACC15';

export const drawDoorman = (ctx: Ctx, e: Enemy, fight: DoormanFight, f: number) => {
  ctx.save();
  ctx.translate(e.pos.x + W / 2, e.pos.y + H);
  ctx.scale(e.facing === 1 ? 1 : -1, 1);
  if ((e.hitFlash || 0) > 0) ctx.filter = 'brightness(1.8)';
  const st = e.aiState || 'stalk', t = e.aiTimer || 0;
  switch (st) {
    case 'slide': case 'clash-slide': poseSlide(ctx, f); break;
    case 'tripped': poseTripped(ctx, f); break;
    case 'uppercut': poseUppercut(ctx, f); break;
    case 'charge': case 'clash-shoulder': poseCharge(ctx, f, st === 'clash-shoulder'); break;
    case 'windup-charge': poseStand(ctx, f, 'dip', t); break;
    case 'windup-slide': poseStand(ctx, f, 'crouch', t); break;
    case 'shove': poseStand(ctx, f, 'shove', t); break;
    case 'door': poseStand(ctx, f, 'folded', t); break;
    default: poseStand(ctx, f, Math.abs(e.vel.x) > 0.3 ? 'walk' : 'guard', t);
  }
  ctx.restore();
  void fight;
};

const legs = (ctx: Ctx, f: number, stride: number, crouch = 0) => {
  const s = Math.sin(f * 0.18) * stride;
  ctx.fillStyle = PANTS;
  ctx.fillRect(-16 + s, -44 + crouch, 14, 40 - crouch);
  ctx.fillRect(4 - s, -44 + crouch, 14, 40 - crouch);
  ctx.fillStyle = '#374151'; ctx.fillRect(-16 + s, -30 + crouch, 4, 8); ctx.fillRect(14 - s, -30 + crouch, 4, 8); // cargo pockets
  ctx.fillStyle = BOOT; ctx.fillRect(-19 + s, -8, 19, 8); ctx.fillRect(2 - s, -8, 19, 8);
};

/** The slab of him from the waist up (x at his middle, y at his waist), leaning `lean`. */
const torso = (ctx: Ctx, y: number, lean: number, f: number) => {
  ctx.save();
  ctx.translate(0, y);
  ctx.rotate(lean);
  // Huge traps and shoulders under a stretched black tee
  ctx.fillStyle = SHIRT;
  ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-32, -44); ctx.quadraticCurveTo(0, -58, 32, -44); ctx.lineTo(26, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-26, -2, 52, 4);
  ctx.fillStyle = '#F8FAFC'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('SECURITY', 0, -24); ctx.textAlign = 'left';
  // Neck, gold chain
  ctx.fillStyle = SKIN_DARK; ctx.fillRect(-9, -58, 18, 10);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -52, 11, 0.2, Math.PI - 0.2); ctx.stroke();
  // Head: bald, shaved stubble, shades, an earpiece, a frown
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.roundRect(-11, -80, 24, 25, [8, 8, 5, 5]); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-6, -78, 8, 3);
  ctx.fillStyle = '#0A0A0A'; ctx.fillRect(1, -72, 13, 5);
  ctx.fillStyle = '#374151'; ctx.fillRect(3, -71, 4, 1);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(-12, -68, 3, 6); ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-11, -62); ctx.quadraticCurveTo(-14, -54, -10, -48); ctx.stroke();
  ctx.fillStyle = '#5B3413'; ctx.fillRect(4, -61, 8, 2);
  void f;
  ctx.restore();
};

/** An arm from the shoulder (x, y) along `angle` (0 = forward), with a fist. */
const arm = (ctx: Ctx, x: number, y: number, angle: number, len = 34, back = false) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.fillStyle = back ? SKIN_DARK : SKIN;
  ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(0, -7, len, 14);
  if (!back) { ctx.fillStyle = '#1E3A8A'; ctx.fillRect(10, -5, 12, 3); ctx.fillRect(14, 0, 8, 3); } // tattoos
  ctx.fillStyle = back ? '#7A4B2C' : '#A36F48'; ctx.beginPath(); ctx.arc(len, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

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
    ctx.fillStyle = SKIN; ctx.fillRect(-26, -34, 52, 12); ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-12, -32, 14, 3);
  } else if (mode === 'shove') arm(ctx, 22, -40, 0, 40);
  else if (mode === 'dip') arm(ctx, 22, -38, 0.9, 28);
  else arm(ctx, 22, -40, -0.9 + Math.sin(f * 0.1) * 0.08, 30); // fists up
  ctx.restore();
  // Pawing the ground before the charge
  if (mode === 'dip' && t % 8 < 4) { ctx.fillStyle = 'rgba(120,113,108,0.6)'; ctx.beginPath(); ctx.arc(-20, -4, 6, 0, Math.PI * 2); ctx.fill(); }
};

const poseCharge = (ctx: Ctx, f: number, braced: boolean) => {
  legs(ctx, f * 2, braced ? 2 : 10, 4);
  arm(ctx, -22, -80, Math.PI * 0.7, 30, true);
  torso(ctx, -40, 0.6, f);
  // Shoulder leading, glowing with effort
  ctx.save(); ctx.translate(0, -40); ctx.rotate(0.6);
  ctx.fillStyle = 'rgba(248, 113, 113, 0.45)'; ctx.beginPath(); ctx.arc(24, -40, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = SHIRT; ctx.beginPath(); ctx.arc(24, -40, 14, 0, Math.PI * 2); ctx.fill();
  arm(ctx, 18, -34, 1.6, 24);
  ctx.restore();
  if (!braced) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-40 - i * 8, -80 + i * 16); ctx.lineTo(-70 - i * 8, -80 + i * 16); ctx.stroke(); } }
};

const poseSlide = (ctx: Ctx, f: number) => {
  // Laid back, lead boot out front along the ground
  ctx.save(); ctx.translate(-10, -18); ctx.rotate(-1.25);
  torso(ctx, 0, 0, f);
  ctx.restore();
  ctx.fillStyle = PANTS; ctx.fillRect(-12, -22, 50, 14); ctx.fillRect(-4, -16, 40, 12);
  ctx.fillStyle = BOOT; ctx.fillRect(36, -26, 14, 20);
  ctx.fillStyle = 'rgba(120,113,108,0.6)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-40 - i * 12, -4, 6 + i * 2, 0, Math.PI * 2); ctx.fill(); }
};

const poseUppercut = (ctx: Ctx, f: number) => {
  legs(ctx, f, 0, 0);
  arm(ctx, -22, -84, Math.PI * 0.6, 28, true);
  torso(ctx, -44, -0.1, f);
  // Fist straight up
  arm(ctx, 18, -84, -1.45, 40);
  ctx.fillStyle = 'rgba(253, 224, 71, 0.6)'; ctx.beginPath(); ctx.arc(22, -128, 14, 0, Math.PI * 2); ctx.fill();
};

const poseTripped = (ctx: Ctx, f: number) => {
  // Flat on his back, stars going round
  ctx.save(); ctx.translate(-30, -14); ctx.rotate(-Math.PI / 2);
  torso(ctx, 0, 0, f);
  ctx.restore();
  ctx.fillStyle = PANTS; ctx.fillRect(-20, -20, 56, 16);
  ctx.fillStyle = BOOT; ctx.fillRect(32, -30, 12, 16); ctx.fillRect(40, -24, 12, 14);
  for (let i = 0; i < 3; i++) { const a = f * 0.15 + (i * Math.PI * 2) / 3; ctx.fillStyle = '#FDE047'; ctx.font = 'bold 12px "Press Start 2P"'; ctx.fillText('*', -96 + Math.cos(a) * 18, -24 + Math.sin(a) * 6); }
};

// ---------------------------------------------------------------------------
// What's left of him
// ---------------------------------------------------------------------------

export const drawDoormanCorpse = (ctx: Ctx, c: DoormanCorpse, f: number) => {
  const t = f - c.t0;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.facing === 1 ? 1 : -1, 1);
  const blood = (w: number) => { ctx.fillStyle = '#6B0000'; ctx.beginPath(); ctx.ellipse(0, -1, Math.min(w, 20 + t * 0.6), 5, 0, 0, Math.PI * 2); ctx.fill(); };
  const body = (tint?: string) => {
    ctx.save(); if (tint) ctx.filter = tint;
    ctx.save(); ctx.translate(-30, -14); ctx.rotate(-Math.PI / 2); torso(ctx, 0, 0, 0); ctx.restore();
    ctx.fillStyle = PANTS; ctx.fillRect(-20, -20, 56, 16); ctx.fillStyle = BOOT; ctx.fillRect(32, -30, 12, 16);
    ctx.restore();
  };
  const w: WeaponType = c.weapon;
  switch (w) {
    case 'SHOTGUN':
      // Blown half apart: legs one side, the rest of him further off
      blood(90);
      ctx.fillStyle = PANTS; ctx.fillRect(10, -18, 44, 16); ctx.fillStyle = BOOT; ctx.fillRect(50, -26, 12, 16);
      ctx.fillStyle = '#7F1D1D'; ctx.fillRect(4, -20, 8, 20);
      ctx.save(); ctx.translate(-70, -12); ctx.rotate(-Math.PI / 2 - 0.3); torso(ctx, 0, 0, 0); ctx.restore();
      ctx.fillStyle = '#991B1B'; for (let i = 0; i < 8; i++) ctx.fillRect(-60 + i * 12, -6 - (i % 3) * 4, 5, 4);
      break;
    case 'FLAMETHROWER':
      // Charred black, still smoking
      body('brightness(0.2) sepia(1)');
      for (let i = 0; i < 3; i++) { const k = ((f * 0.6 + i * 25) % 70) / 70; ctx.fillStyle = `rgba(80,80,80,${0.5 * (1 - k)})`; ctx.beginPath(); ctx.arc(-20 + i * 20, -30 - k * 60, 8 + k * 10, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'BOULDER':
      // Under a boulder, just his boots and a spreading puddle sticking out
      blood(80);
      ctx.fillStyle = BOOT; ctx.fillRect(34, -12, 14, 12); ctx.fillRect(46, -10, 12, 10);
      ctx.fillStyle = '#57534E'; ctx.beginPath(); ctx.ellipse(-4, -34, 46, 36, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78716C'; ctx.beginPath(); ctx.ellipse(-14, -46, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
      break;
    case 'TSUNAMI':
      // Washed up soaked in a puddle, a crab on him
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; ctx.beginPath(); ctx.ellipse(0, -2, 80, 7, 0, 0, Math.PI * 2); ctx.fill();
      body('saturate(0.6) brightness(0.9)');
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(-10, -30, 6, 0, Math.PI * 2); ctx.fill();
      break;
    case 'TASER':
      // Fried: twitching, the odd flash of his skeleton
      body(Math.floor(f / 4) % 7 === 0 ? 'invert(1)' : undefined);
      ctx.save(); ctx.translate(Math.sin(f * 1.7) * 1.5, 0); ctx.restore();
      if (Math.floor(f / 5) % 3 === 0) { ctx.strokeStyle = '#A5F3FC'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-40, -30); ctx.lineTo(-30, -40); ctx.lineTo(-20, -28); ctx.lineTo(-8, -38); ctx.stroke(); }
      break;
    case 'NEEDLES':
      // Bloated up like a balloon, full of darts
      body('saturate(1.6) hue-rotate(-20deg)');
      ctx.fillStyle = 'rgba(190, 18, 60, 0.5)'; ctx.beginPath(); ctx.ellipse(-10, -26, 44, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 11, -36 - (i % 2) * 6); ctx.lineTo(-44 + i * 11, -48 - (i % 2) * 6); ctx.stroke(); }
      break;
    case 'SLUDGE':
      // Melting into a green puddle
      ctx.fillStyle = '#65A30D'; ctx.beginPath(); ctx.ellipse(0, -3, 70, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.scale(1, Math.max(0.4, 1 - t / 400)); body('hue-rotate(60deg) saturate(1.4)'); ctx.restore();
      break;
    case 'OIL_ROCKET':
      // Blown apart and greasy: bits everywhere, glistening
      blood(70);
      ctx.fillStyle = '#0A0A0A'; ctx.beginPath(); ctx.ellipse(0, -2, 70, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(-40, -12); ctx.rotate(-Math.PI / 2 - 0.6); ctx.filter = 'brightness(0.45)'; torso(ctx, 0, 0, 0); ctx.restore();
      ctx.fillStyle = BOOT; ctx.fillRect(40, -10, 12, 10);
      break;
    default:
      // Face down in a pool of it, riddled
      blood(70);
      body();
      ctx.fillStyle = '#450A0A'; for (let i = 0; i < 6; i++) ctx.fillRect(-60 + i * 14, -22 - (i % 2) * 8, 4, 4);
  }
  // His membership list, on the ground next to him
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
      const x = e.pos.x + W / 2 - state.camera.x, y = e.pos.y - 28 - state.camera.y;
      ctx.save();
      ctx.font = 'bold 9px "Press Start 2P"';
      const w = Math.min(420, ctx.measureText(fight.line).width + 18);
      const bx = Math.max(10, Math.min(CANVAS_WIDTH - w - 10, x - w / 2));
      ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 2;
      ctx.fillRect(bx, y - 24, w, 22); ctx.strokeRect(bx, y - 24, w, 22);
      ctx.beginPath(); ctx.moveTo(x - 6, y - 2); ctx.lineTo(x + 6, y - 2); ctx.lineTo(x, y + 8); ctx.fill();
      ctx.fillStyle = '#111827'; ctx.textAlign = 'center'; ctx.fillText(fight.line, bx + w / 2, y - 9, w - 12);
      ctx.restore();
    }
  }
  if (!e || (fight.phase !== 'intro' && fight.phase !== 'fight')) return;
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

/** The special button, for the last thing the player used: a pad's B, or a mouse's right button. */
const drawSpecialButton = (ctx: Ctx, x: number, y: number, pressed: boolean) => {
  ctx.save();
  if (getLastInputDevice() === 'gamepad') {
    ctx.fillStyle = pressed ? '#991B1B' : '#DC2626'; ctx.strokeStyle = '#FEE2E2'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y + (pressed ? 2 : 0), 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 18px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('B', x + 1, y + 2 + (pressed ? 2 : 0));
  } else {
    // A mouse, its right button lit
    ctx.fillStyle = '#E5E7EB'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - 16, y - 22, 32, 46, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = pressed ? '#991B1B' : '#DC2626';
    ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 2); ctx.lineTo(x + 14, y - 2); ctx.quadraticCurveTo(x + 14, y - 20, x, y - 20); ctx.fill();
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 2); ctx.moveTo(x - 14, y - 2); ctx.lineTo(x + 14, y - 2); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 7px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('RIGHT CLICK', x, y + 38);
  }
  ctx.restore();
};

const drawClash = (ctx: Ctx, state: GameState, fight: DoormanFight) => {
  const c = fight.clash!;
  const f = state.frame;
  const cx = CANVAS_WIDTH / 2, y = 150;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(cx - 250, y - 60, 500, 150);
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 3; ctx.strokeRect(cx - 250, y - 60, 500, 150);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 16px "Press Start 2P"';
  ctx.fillText(c.kind === 'shoulder' ? 'SHOULDER CLASH!' : 'SLIDE CLASH!', cx, y - 32);
  const barL = cx - 200, barW = 400, barY = y;
  if (c.kind === 'shoulder') {
    // Tug of war: his end red, yours green, the marker where it stands
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(barL, barY, barW, 18);
    ctx.fillStyle = '#15803D'; ctx.fillRect(barL, barY, barW * c.meter, 18);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(barL + barW * c.meter - 3, barY - 6, 6, 30);
    ctx.font = 'bold 8px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.textAlign = 'left'; ctx.fillText('HIM', barL, barY + 34);
    ctx.textAlign = 'right'; ctx.fillStyle = '#86EFAC'; ctx.fillText('YOU', barL + barW, barY + 34);
    ctx.textAlign = 'center'; ctx.fillStyle = Math.floor(f / 6) % 2 ? '#FFFFFF' : '#FACC15'; ctx.font = 'bold 12px "Press Start 2P"';
    ctx.fillText('MASH IT!', cx - 50, barY + 66);
    drawSpecialButton(ctx, cx + 70, barY + 60, c.flash > 0);
  } else {
    // A marker sweeping the bar: hit it in the zone
    ctx.fillStyle = '#374151'; ctx.fillRect(barL, barY, barW, 18);
    ctx.fillStyle = '#16A34A'; ctx.fillRect(barL + barW * (0.5 - SLIDE_ZONE / 2), barY, barW * SLIDE_ZONE, 18);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(barL + barW * c.meter - 3, barY - 6, 6, 30);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < c.hits ? '#22C55E' : '#4B5563'; ctx.beginPath(); ctx.arc(cx - 30 + i * 30, barY + 36, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 10px "Press Start 2P"';
    ctx.fillText('HIT IT IN THE ZONE', cx - 60, barY + 70);
    drawSpecialButton(ctx, cx + 110, barY + 62, c.flash > 0 && !c.missed);
  }
  ctx.restore();
};
