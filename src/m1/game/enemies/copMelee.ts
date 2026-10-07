// The cops on Hector's stage fight like the ordinary shooters and shield
// carriers, only pushier: they close in on you fast (so you can't just crouch in
// one spot and shoot), and once they're on you they wind up and club you (the
// uniforms) or ram you with the shield (riot police). The wind-up's the tell.

import type { Enemy } from '../../types';
import type { FrameContext } from '../core/context';
import { hurtPlayer } from '../bosses/shared';
import { rectsOverlap, boundsOf } from '../core/utils';
import { mid, safeAhead, holdingOff, shieldFacing } from './kinds';

export const isMeleeCop = (e: Enemy) => e.kind === 'cop' || e.kind === 'riotcop';

interface Style { reach: number; speed: number; windup: number; strike: number; recover: number; damage: number; shove: number; lunge: number }
const CLUB: Style = { reach: 72, speed: 4.2, windup: 18, strike: 8, recover: 32, damage: 14, shove: 7, lunge: 0 };
/** How many of them come at you at once. */
const MAX_RUSHING = 2;
const BASH: Style = { reach: 90, speed: 3, windup: 22, strike: 12, recover: 40, damage: 16, shove: 12, lunge: 9 };

/** Off screen they don't give up: they come after you, fast. */
const HUNT_SPEED = 8;

/** Runs after the usual shooter logic, on the ground: closing in, then the swing (or, off screen, hunting him down). Sets vel.x. */
export const copMelee = (ctx: FrameContext, e: Enemy, onScreen: boolean) => {
  const { player } = ctx.state;
  const riot = e.kind === 'riotcop';
  const st = riot ? BASH : CLUB;
  const p = mid(player), m = mid(e);
  const dx = p.x - m.x, side = dx < 0 ? -1 : 1;
  const sameLevel = Math.abs(p.y - m.y) < 70;
  const facingHim = riot ? shieldFacing(e) === side : true;
  const mel = e.melee;
  if (!onScreen) {
    e.melee = undefined;
    if (player.health > 0 && Math.abs(dx) > 40) e.vel.x = safeAhead(ctx, e, side) ? side * HUNT_SPEED : 0;
    if (!riot) e.facing = side;
    return;
  }
  if (!mel) {
    if (holdingOff(ctx.state) || player.health <= 0) return;
    if (Math.abs(dx) - player.width / 2 < st.reach && sameLevel && facingHim) {
      // In range: wind up (the club goes back over his head, the shield draws back)
      e.melee = { state: 'windup', t: 0, hit: false };
      e.vel.x = 0;
      if (!riot) e.facing = side;
      return;
    }
    // Close in on him (not off a ledge), shield up if he's got one; two at a time, the rest hang back and shoot
    const rushing = ctx.state.enemies.filter(o => o !== e && isMeleeCop(o) && o.health > 0 && (o.melee || Math.abs(mid(o).x - p.x) < 160)).length;
    if (rushing < MAX_RUSHING && Math.abs(p.y - m.y) < 160 && Math.abs(dx) > 40) e.vel.x = safeAhead(ctx, e, side, 18) ? side * st.speed : 0;
    if (!riot) e.facing = side;
    return;
  }
  mel.t++;
  // (no shooting mid-swing)
  e.shootTimer = Math.min(e.shootTimer, 20);
  if (riot) e.isShieldActive = true;
  switch (mel.state) {
    case 'windup':
      e.vel.x = 0;
      if (mel.t >= st.windup) { mel.state = 'strike'; mel.t = 0; e.vel.x = (riot ? shieldFacing(e) : e.facing || side) * st.lunge; }
      break;
    case 'strike': {
      const dir = riot ? shieldFacing(e) : (e.facing === -1 ? -1 : 1);
      const box = { x: dir > 0 ? e.pos.x + e.width - 12 : e.pos.x - 52, y: e.pos.y + 6, w: 64, h: e.height - 6 };
      if (!mel.hit && player.invincibilityTimer <= 0 && rectsOverlap(box, boundsOf(player))) {
        mel.hit = true;
        hurtPlayer(ctx, st.damage, riot ? 'riotcop_bash' : 'cop_club', { x: dir * st.shove, y: -6 });
        ctx.fx.spawnDamageNumber({ x: p.x, y: player.pos.y - 16 }, riot ? 'BASH!' : 'WHACK!', true, '#FDE047');
      }
      e.vel.x *= 0.8;
      if (mel.t >= st.strike) { mel.state = 'recover'; mel.t = 0; }
      break;
    }
    case 'recover':
      // Off balance for a moment: your opening
      e.vel.x = 0;
      if (mel.t >= st.recover) e.melee = undefined;
      break;
  }
};
