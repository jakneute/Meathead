// The sewer's rats (Meathead 2's own kind, `m2:fr_rat`): big gray sewer rats on the walkways along the sewer's back
// wall. One sits up sniffing (its whiskers going) till the log comes along under it; then it hunkers (the tell: a
// squeak, its tail lashing) and leaps for him in an arc. Touching him, it bites (its hurt lines: lines.ts); a miss, or
// a bite and a shake, and down it goes into the sewage (it drowns: drown.ts). A shot, a saw, a gusher: dead. Small: a
// grab's a critter.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { GRAVITY } from '../../../m1/constants';
import { mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { registerM2Kind } from '../../kinds';
import { INK, type Ctx } from '../kit';

export const RAT = 'm2:fr_rat';

const rat = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  e.aiTimer = (e.aiTimer ?? 0) + 1;
  const m = mid(e), pm = mid(p);
  switch (e.aiState) {
    default:
      e.aiState = 'sit'; e.facing = -1;
      return false;
    case 'sit': {
      e.vel.x = 0;
      // (the log under it, coming: ahead of him and below, not too far)
      const dx = m.x - pm.x, dy = pm.y - m.y;
      if (p.health > 0 && !p.inCutscene && dx > 40 && dx < 230 && dy > -40 && dy < 200) { e.aiState = 'crouch'; e.aiTimer = 0; playSound('chitter', 0.6, 8); }
      return false;
    }
    case 'crouch':
      e.vel.x = 0;
      if (e.aiTimer! >= 18) {
        // (the leap: at where he'll be)
        e.aiState = 'leap'; e.aiTimer = 0;
        const t = 26, lead = 3 * t;
        e.vel.x = (pm.x + lead - m.x) / t; e.vel.y = -5.5;
        e.facing = (e.vel.x < 0 ? -1 : 1) as 1 | -1;
        playSound('chitter', 0.8, 12);
      }
      return false;
    case 'leap': {
      e.vel.y += GRAVITY * 0.7;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      if (p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && e.pos.x < p.pos.x + p.width && e.pos.x + e.width > p.pos.x && e.pos.y < p.pos.y + p.height && e.pos.y + e.height > p.pos.y) {
        hurtPlayer(ctx, 8, RAT, { x: 0, y: -3 });
        playSound('gnaw', 0.9, 4);
        e.aiState = 'off'; e.aiTimer = 0; e.vel.x = 2.5; e.vel.y = -3;
      }
      if (e.aiTimer! > 120) e.aiState = 'off';
      return true;
    }
    case 'off':
      // (shaken off, or missed: down into the sewage)
      e.vel.y += GRAVITY * 0.7;
      e.pos.x += e.vel.x; e.pos.y += e.vel.y;
      if (e.aiTimer! > 240) e.health = 0;
      return true;
  }
};

/** A sewer rat, feet at the origin, facing right: gray-brown, a pink tail, pink ears and hands, red eyes. */
const drawRat = (c: Ctx, e: Enemy, f: number) => {
  const st = e.aiState, sit = st === 'sit', crouch = st === 'crouch', air = st === 'leap' || st === 'off';
  const fur = '#6B6258', furL = '#8A8074', pink = '#E8A0A0';
  c.save();
  if (air) c.rotate(Math.max(-0.6, Math.min(0.6, (e.vel.y ?? 0) * 0.08)));
  // (the tail: long, pink, lashing)
  const lash = Math.sin(f * (crouch ? 0.6 : 0.15)) * (crouch ? 6 : 3);
  c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-10, -5); c.quadraticCurveTo(-22, -2 + lash, -32, -8 - lash); c.stroke();
  c.strokeStyle = pink; c.lineWidth = 1.5; c.stroke();
  const by = sit ? -16 : crouch ? -9 : -12;
  // (the body)
  c.fillStyle = INK; c.beginPath(); c.ellipse(0, by, 15, sit ? 10 : 8, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = fur; c.beginPath(); c.ellipse(0, by, 13.5, sit ? 8.5 : 6.5, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = furL; c.beginPath(); c.ellipse(-2, by - 3, 8, 3, sit ? -0.5 : 0, 0, Math.PI * 2); c.fill();
  // (the head: a pointed snout, an ear, the red eye, the whiskers; sat up, the hands up at its chest)
  const hx = sit ? 9 : 13, hy = sit ? by - 9 : by - 2;
  c.fillStyle = INK; c.beginPath(); c.moveTo(hx - 6, hy - 6); c.lineTo(hx + 11, hy + 1); c.lineTo(hx - 6, hy + 6); c.closePath(); c.fill();
  c.fillStyle = fur; c.beginPath(); c.moveTo(hx - 5, hy - 5); c.lineTo(hx + 9, hy + 1); c.lineTo(hx - 5, hy + 5); c.closePath(); c.fill();
  c.fillStyle = pink; c.fillRect(hx + 8, hy, 3, 2);
  c.fillStyle = INK; c.beginPath(); c.ellipse(hx - 3, hy - 6, 3.5, 4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = pink; c.beginPath(); c.ellipse(hx - 3, hy - 6, 2, 2.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#DC2626'; c.fillRect(hx + 1, hy - 2, 2, 2);
  const tw = Math.sin(f * 0.8) * 1.2;
  c.strokeStyle = '#D6D3D1'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(hx + 7, hy + 1); c.lineTo(hx + 14, hy - 2 + tw); c.moveTo(hx + 7, hy + 2); c.lineTo(hx + 14, hy + 3 - tw); c.stroke();
  // (the teeth: two yellow incisors, bared to bite)
  if (air || crouch) { c.fillStyle = '#FDE047'; c.fillRect(hx + 7, hy + 3, 2, 3); }
  if (sit) { c.fillStyle = pink; c.fillRect(hx - 2, by - 2, 3, 3); c.fillRect(hx + 1, by - 1, 3, 3); }
  // (the feet)
  c.fillStyle = pink;
  if (!air) { c.fillRect(-9, -2, 5, 2); c.fillRect(5, -2, 5, 2); }
  else { c.fillRect(-12, by + 5, 5, 2); c.fillRect(8, by + 5, 5, 2); }
  c.restore();
};

registerM2Kind({
  kind: RAT, stats: { w: 30, h: 22, hp: 8, contact: 0, mass: 6 },
  ai: rat, draw: drawRat, head: { x: 12, y: -16, r: 5 }, gender: 'n', grab: 'critter', pathing: false,
});
