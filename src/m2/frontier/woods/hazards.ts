// The real wilderness's hazards (kept light: a short walk):
//
//   POISON IVY   patches of shiny three-leaf plants across the trail (taught alone first, the scout troop's LEAVES OF
//                THREE, LET IT BE on a stake before it). Walking through gets him (a small hurt every so often while
//                he's in it), and he itches a while after (a few more small ticks): jump the patch. m2:fr_ivy: its own
//                hurt lines and death screen.
//   A BEAR TRAP  a real one this time: rusty, chained to a stump in the leaves, no sign (it glints). The wilds' rules
//                and their hurt (m2:fr_beartrap): snap, held by the ankle, mash to pry it open; it springs open again.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { box, INK, mix, hash, onScreen, type Ctx } from '../kit';
import { X, GY, IVY, TRAP_X } from './layout';
import { woodsOf } from './state';
import { HURT } from './lines';

for (const [source, l] of Object.entries(HURT)) registerHurtLines(source, l.hurt, l.death);

const IVY_DMG = 4, IVY_EVERY = 50, ITCH = 190, ITCH_DMG = 2, ITCH_EVERY = 64;
const TRAP_DMG = 12, TRAP_HOLD = 80, MASH = 9, REARM = 110;

export const inIvy = (state: GameState) => {
  const p = state.player, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  return p.isGrounded && Math.abs(feet - GY) < 6 && IVY.some(([a, b]) => cx > X(a) && cx < X(b));
};

/** A frame of the ivy and the trap. Returns the controls (held by the trap: no walking or jumping). */
export const updateHazards = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, w = woodsOf(state);
  if (p.health <= 0 || p.inCutscene) return controls;
  // ---- the ivy: in it, a small hurt every so often; out of it, the itch a while longer
  if (w.ivyCd > 0) w.ivyCd--;
  if (inIvy(state)) {
    w.itch = ITCH;
    if (w.ivyCd <= 0) { w.ivyCd = IVY_EVERY; hurtPlayer(ctx, IVY_DMG, 'm2:fr_ivy', undefined, 0); playSound('squish', 0.5, 6); }
    if (state.frame % 6 === 0) itchFx(state, '#4D7C0F');
  } else if (w.itch > 0) {
    w.itch--;
    if (--w.itchCd <= 0) { w.itchCd = ITCH_EVERY; if (w.itch < ITCH - 20) { hurtPlayer(ctx, ITCH_DMG, 'm2:fr_ivy', undefined, 0); } }
    if (state.frame % 10 === 0) itchFx(state, '#F87171');
  }
  // ---- the trap
  const t = w.trap, cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height, tx = X(TRAP_X);
  const press = { left: !!controls.left, right: !!controls.right, jump: !!controls.jump };
  let out = controls;
  t.t++;
  if (t.state === 'open') {
    const onIt = Math.abs(cx - tx) < 12 && Math.abs(feet - GY) < 6 && p.isGrounded;
    if (t.latch && !onIt) t.latch = false;
    if (onIt && !t.latch && !p.untouchable) {
      t.state = 'him'; t.t = 0; t.hold = TRAP_HOLD;
      p.invincibilityTimer = 0;
      hurtPlayer(ctx, TRAP_DMG, 'm2:fr_beartrap');
      playSound('clang', 1, -4); playSound('crunch', 0.9, -6); shakeScreen(state, 6, 3);
      for (let i = 0; i < 8; i++) state.particles.push({ pos: { x: tx, y: GY - 6 }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 4 }, life: 24, color: i % 2 ? '#B91C1C' : '#7F1D1D', size: 2 + Math.random() * 2 });
    }
  } else if (t.state === 'him') {
    p.pos.x = tx - p.width / 2; p.vel.x = 0;
    t.hold--;
    for (const k of ['left', 'right', 'jump'] as const) if (press[k] && !t.lastPress[k]) t.hold -= MASH;
    out = { ...out, left: false, right: false, jump: false, special: false, charge: false };
    if (t.hold <= 0 || p.health <= 0) { t.state = 'sprung'; t.t = 0; t.latch = true; playSound('clink', 0.8, 0); }
  } else if (t.state === 'sprung' && t.t > REARM) {
    t.state = 'open'; t.t = 0;
    if (Math.abs(cx - tx) < 14 && Math.abs(feet - GY) < 8) t.latch = true;
  }
  t.lastPress = press;
  return out;
};

const itchFx = (state: GameState, col: string) => {
  const p = state.player;
  state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + 10 + Math.random() * (p.height - 20) }, vel: { x: (Math.random() - 0.5) * 1.2, y: -0.6 - Math.random() }, life: 18, color: col, size: 2 });
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The ivy: low clumps of shiny three-leaf plants, red at the stems, glistening; trembling while he's in it. */
export const drawIvy = (c: Ctx, state: GameState) => {
  const f = state.frame, shake = inIvy(state);
  for (const [a, b] of IVY) {
    if (!onScreen(state, X(a), X(b))) continue;
    for (let x = a + 4; x < b - 2; x += 9) {
      const h = hash(x), bx = X(x) + (shake ? Math.sin(f * 0.8 + x) * 1 : 0), by = GY;
      c.strokeStyle = '#7F1D1D'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (h - 0.5) * 4, by - 8 - h * 6); c.stroke();
      const tx = bx + (h - 0.5) * 4, ty = by - 8 - h * 6;
      // (three leaves, pointed, the middle one on a longer stem)
      for (const [dx, dy, r] of [[-4, 1, -0.7], [4, 1, 0.7], [0, -4, 0]] as const) {
        c.save(); c.translate(tx + dx, ty + dy); c.rotate(r);
        c.fillStyle = INK; c.beginPath(); c.ellipse(0, 0, 3.4, 2.4, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = h > 0.6 ? '#65A30D' : h > 0.3 ? '#4D7C0F' : mix('#4D7C0F', '#B91C1C', 0.35); c.beginPath(); c.ellipse(0, 0, 2.8, 1.8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#D9F99D'; c.fillRect(-1, -1, 1.4, 0.8);
        c.restore();
      }
    }
  }
};

/** The real bear trap: rusty, chained to a stump, half in the leaves; a glint now and then. */
export const drawTrap = (c: Ctx, state: GameState) => {
  const tx = Math.round(X(TRAP_X)), y = GY, t = woodsOf(state).trap, f = state.frame;
  if (!onScreen(state, tx - 60, tx + 40)) return;
  // (the stump it's chained to, the chain)
  box(c, tx - 52, y - 18, 22, 18, INK); box(c, tx - 51, y - 17, 20, 17, '#6B4423'); box(c, tx - 51, y - 17, 20, 3, '#A0703C');
  for (let k = 0; k < 6; k++) box(c, tx - 30 + k * 3, y - 3 - (k % 2), 3, 2, '#7C4A1E');
  if (t.state === 'open') {
    box(c, tx - 15, y - 3, 30, 4, INK);
    box(c, tx - 14, y - 2, 28, 2, '#7C4A1E'); box(c, tx - 14, y - 2, 28, 1, '#A8653A');
    for (let k = 0; k < 6; k++) box(c, tx - 13 + k * 5, y - 5, 2, 3, '#B07A4A');
    box(c, tx - 4, y - 3, 8, 2, '#5A3A1E');
    if (f % 100 < 6) box(c, tx + 5, y - 7, 2, 2, '#FFFFFF');
  } else {
    box(c, tx - 9, y - 16, 18, 17, INK);
    box(c, tx - 8, y - 15, 7, 15, '#7C4A1E'); box(c, tx + 1, y - 15, 7, 15, '#6B3A16');
    for (let k = 0; k < 4; k++) { box(c, tx - 2, y - 14 + k * 4, 2, 2, '#B07A4A'); box(c, tx, y - 12 + k * 4, 2, 2, '#B07A4A'); }
    if (t.state === 'him') for (let k = 0; k < 2; k++) box(c, tx - 6 + k * 9, y - 5 - (f % 20 < 10 ? 1 : 0), 3, 4, '#B91C1C');
  }
  // (leaves over its edges: half hidden)
  for (let i = 0; i < 5; i++) { c.fillStyle = ['#B45309', '#92400E', '#CA8A04'][i % 3]; c.beginPath(); c.ellipse(tx - 20 + i * 10 + hash(i) * 4, y - 1, 4, 2, hash(i + 3) - 0.5, 0, Math.PI * 2); c.fill(); }
};
