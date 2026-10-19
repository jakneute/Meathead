// The castle's base's set pieces that move, and what the castle's cast throw.
//
//   THE DRAWBRIDGE (new): over the drained moat, on the clock: down a while, then (a winch's creak and the chains
//     taking up: the tell, stairs.ts's) up at 41 degrees a while, then down. Stood on it, he goes with it (it's a
//     staircase to stairs.ts: a flight pivoting at the gatehouse's foot), so riding it up and hopping off its end gets
//     him onto the barbican's ledge. Drawn as a bridge: planks, iron straps, chains up to the winch.
//   THE MURDER HOLES (new): holes in the gatehouse's ceiling and in the hoardings over the wall walk and the tower: quiet
//     a while, then the tell (the hole glows orange, steam, drips, a gurgle), then a column of boiling BUTTER BREW
//     poured straight down onto the floor under it for a while. Hurts him (thrown off it) and the cast (who keep out
//     of its way). Taught alone in the gatehouse, then in a pair, then a rolling wave of three along the wall walk,
//     then over a landing in the tower stairs.
//   THE TOADSTOOL PLANTERS (the glen's mushrooms, potted in the rose garden and down in the breach): land on a cap and
//     it throws him up (a quarter higher holding jump).
//   THE ROSE BEDS (the glen's briars, as roses): thorns along a floor: hurt and thrown up out of them; the cast too.
//   THE SWINGING CAULDRONS (the glen's, hung off the hoardings): one across the breach's far staircase, one across the
//     tower's middle flight.
//   What the cast throw: the jesters' juggling pins (lobbed in a spread, spinning), the ladies-in-waiting's fans (out
//     flat and back to her hand: they hit both ways). The square's cast throw theirs too (square/hazards.ts).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import type { Enemy } from '../../../m1/types';
import { PLAYER_GRAVITY } from '../../../m1/constants';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { floorTopAt } from '../../../m1/game/core/terrain';
import { mid } from '../../../m1/game/enemies/kinds';
import { hazardVictims, hazardHit, boxHits, setHazardZones, type Zone } from '../../hazardHit';
import { envSound } from '../../bossQuiet';
import { meatheadSays, byPants, ledge } from '../section';
import { box, mix, onScreen, INK, type Ctx } from '../kit';
import { timeOfDay } from '../../timeOfDay';
import { endAt, type Stair } from '../stairs';
import { updateThrows as updateSquareThrows, drawThrows as drawSquareThrows } from '../square/hazards';
import { drawToadstool } from '../glen/hazards';
import { keepOf } from './state';
import { MUSHROOMS, CAP_H, CAP_W, ROSES, CAULDRONS, HOLES, HOLE_TELL, HOLE_POUR, HOLE_HALF, MOAT, X, Y, GY } from './layout';
import { GAGS } from './lines';
import { drawFan, drawPin } from './kindArt';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const hits = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
const lastHit = new WeakMap<Enemy, number>();
const tear = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, knock: number, every = 40) => {
  const at = lastHit.get(e) ?? -999;
  if (ctx.state.frame - at < every) return;
  lastHit.set(e, ctx.state.frame);
  hazardHit(ctx, e, dmg, fromX, call, { knock });
};

export const buildHazards = (state: GameState) => {
  // (every toadstool stands on the ground: the garden's and the breach's floor)
  for (const [x] of MUSHROOMS) ledge(state, X(x) - CAP_W / 2, Y(CAP_H), CAP_W, { hidden: true, tag: 'fa-mushroom' });
  keepOf(state).squash = MUSHROOMS.map(() => 0);
};

// ---------------------------------------------------------------------------------------------------------------
// Where things are this frame

/** A murder hole: 'idle', 'tell' (k 0..1 through it) or 'pour' (k 0..1 through it). */
export const holeAt = (state: GameState, i: number) => {
  const [, , , period, phase] = HOLES[i];
  const t = (state.frame + phase) % period, quiet = period - HOLE_TELL - HOLE_POUR;
  if (t < quiet) return { s: 'idle' as const, k: t / quiet };
  if (t < quiet + HOLE_TELL) return { s: 'tell' as const, k: (t - quiet) / HOLE_TELL };
  return { s: 'pour' as const, k: (t - quiet - HOLE_TELL) / HOLE_POUR };
};
const BOB_R = 20;
export const cauldronAt = (state: GameState, i: number) => {
  const [px, ph, len, amp, period, phase] = CAULDRONS[i];
  const t = ((state.frame + phase) / period) * Math.PI * 2;
  const a = amp * Math.sin(t), da = amp * Math.cos(t);
  return { px: X(px), py: Y(ph), x: X(px) + Math.sin(a) * len, y: Y(ph) + Math.cos(a) * len, a, dir: Math.sign(da) || 1 };
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before he moves)

export const updateHazards = (ctx: FrameContext, controls: Controls) => {
  const { state } = ctx, k = keepOf(state), p = state.player, f = state.frame;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  const zones: Zone[] = [];
  // The toadstools
  for (let i = 0; i < MUSHROOMS.length; i++) {
    if (k.squash[i] > 0) k.squash[i]--;
    const [mx, h] = MUSHROOMS[i];
    if (!p.isGrounded || !alive(state) || Math.abs(feet - Y(CAP_H)) > 2 || Math.abs(cx - X(mx)) > CAP_W / 2 + 2) continue;
    const up = h * (controls.jump ? 1.25 : 1);
    p.vel.y = -Math.sqrt(2 * PLAYER_GRAVITY * up); p.pos.y -= 2;
    p.isGrounded = false; p.jumpHoldTimer = 0; p.coyoteJumpTimer = 0; p.jumpBufferTimer = 0;
    k.squash[i] = 16;
    playSound('boing', 0.8, controls.jump ? 6 : 0);
    for (let j = 0; j < 8; j++) state.particles.push({ pos: { x: X(mx) + (Math.random() - 0.5) * CAP_W, y: Y(CAP_H) - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: j % 2 ? '#FDE68A' : '#F9A8D4', size: 2 });
  }
  // The rose beds
  for (const [a, b, h] of ROSES) {
    const fy = Y(h);
    zones.push({ x0: X(a), x1: X(b), y0: fy - 30, y1: fy + 4, ground: true });
    if (alive(state) && hits(state, X(a), fy - 22, b - a, 22)) {
      if (p.isGrounded || p.vel.y > 0) { p.vel.y = -8.5; p.isGrounded = false; p.jumpHoldTimer = 0; envSound(state, cx, 'crunch', 0.4, 10); }
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 10, 'm2:fa_roses', { x: 0, y: -8.5 });
      if (f % 3 === 0) state.particles.push({ pos: { x: cx, y: feet - 6 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 }, life: 16, color: f % 2 ? '#BE185D' : '#F9A8D4', size: 2 });
    }
    for (const e of hazardVictims(state, { flyers: false })) if (boxHits(e, X(a), fy - 22, b - a, 22)) tear(ctx, e, 30, mid(e).x - (e.vel.x || 1), 'DEADHEADED!', 3);
  }
  // The murder holes
  for (let i = 0; i < HOLES.length; i++) {
    const [hx, top, floor] = HOLES[i], x = X(hx);
    if (Math.abs(x - cx) > 1300) continue;
    const s = holeAt(state, i);
    zones.push({ x0: x - HOLE_HALF - 10, x1: x + HOLE_HALF + 10, y0: Y(top), y1: Y(floor) + 4 });
    if (s.s === 'tell') {
      if (s.k < 0.03) { envSound(state, x, 'glug', 0.45, -6); envSound(state, x, 'rumble', 0.25, 12); }
      if (f % 5 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 18, y: Y(top) + 2 }, vel: { x: 0, y: 2 + Math.random() }, life: 14, color: '#FBBF24', size: 2 });
      if (f % 4 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 24, y: Y(top) - 2 }, vel: { x: (Math.random() - 0.5) * 0.5, y: -0.7 }, life: 24, color: '#F5F5F4', size: 3 });
      if (!k.said.holes && Math.abs(x - cx) < 420 && Math.abs(Y(floor) - feet) < 60) { k.said.holes = true; meatheadSays(state, pickLine(byPants(state, GAGS.holes)), false); }
    } else if (s.s === 'pour') {
      if (s.k < 0.02) envSound(state, x, 'gush', 0.7, -4);
      if (f % 2 === 0) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 30, y: Y(floor) - 3 }, vel: { x: (Math.random() - 0.5) * 4, y: -1.5 - Math.random() * 2 }, life: 18, color: f % 4 ? '#FCD34D' : '#FEF3C7', size: 3 });
      if (alive(state) && p.invincibilityTimer <= 0 && hits(state, x - HOLE_HALF, Y(top), HOLE_HALF * 2, top - floor)) {
        hurtPlayer(ctx, 14, 'm2:fa_oil', { x: (cx < x ? -1 : 1) * 7, y: -5 });
        envSound(state, x, 'ignite', 0.5, 6);
      }
      for (const e of hazardVictims(state)) if (boxHits(e, x - HOLE_HALF, Y(top), HOLE_HALF * 2, top - floor)) tear(ctx, e, 50, x, 'BUTTERED!', 9);
    }
  }
  // The cauldrons
  for (let i = 0; i < CAULDRONS.length; i++) {
    const [px, ph, len, amp] = CAULDRONS[i];
    if (Math.abs(X(px) - cx) > 1400) continue;
    const c = cauldronAt(state, i);
    const reach = Math.sin(amp) * len + BOB_R + 6, top = Y(ph) + Math.cos(amp) * len - BOB_R - 6;
    zones.push({ x0: X(px) - reach, x1: X(px) + reach, y0: top, y1: Y(ph) + len + BOB_R + 6 });
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, c.x - BOB_R, c.y - BOB_R + 4, BOB_R * 2, BOB_R * 2 - 4)) {
      hurtPlayer(ctx, 13, 'm2:fa_cauldron', { x: c.dir * 9, y: -5 });
      envSound(state, c.x, 'clang', 0.9, -8);
    }
    for (const e of hazardVictims(state)) if (boxHits(e, c.x - BOB_R, c.y - BOB_R, BOB_R * 2, BOB_R * 2)) { tear(ctx, e, 55, c.x - c.dir * 40, 'COOKED!', 12); envSound(state, c.x, 'clang', 0.8, -6); }
    if (Math.abs(c.a) > amp * 0.96 && f % 4 === 0) state.particles.push({ pos: { x: c.x + c.dir * 10, y: c.y - 12 }, vel: { x: -c.dir * 1.5, y: -1 }, life: 20, color: '#FCD34D', size: 3 });
  }
  // (the moat's a long way down: none of the cast walk into it)
  zones.push({ x0: X(MOAT.a), x1: X(MOAT.b), y0: GY - 4, y1: GY + 2000, ground: true });
  setHazardZones(state, 'fa-keep', zones);
  updateThrows(ctx);
  updateSquareThrows(ctx);
};

const DMG = { pin: 8, fan: 9 }, SRC = { pin: 'm2:fa_pin', fan: 'm2:fa_fan' };
const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, k = keepOf(state), p = state.player;
  for (const s of k.throws) {
    s.t++;
    if (s.kind === 'pin') {
      s.vy += 0.3; s.x += s.vx; s.y += s.vy;
    } else {
      // (the fan: out flat, slowing, then back to her hand; a little drift up and down)
      const from = s.from && s.from.health > 0 && !s.from.isBlownAway ? s.from : null;
      s.vx -= s.dir * 0.2;
      if (from && s.t > 20) { const hy = from.pos.y + 30; s.vy += (hy - s.y) * 0.004; s.vy *= 0.96; }
      s.x += s.vx; s.y += s.vy + Math.sin(s.t * 0.2) * 0.4;
      if (s.t % 8 === 0) envSound(state, s.x, 'whirl', 0.2, 16);
      if (!from && s.t > 30) { s.vy += 0.3; }
      if (from && s.t > 20 && Math.abs(s.x - mid(from).x) < 22 && Math.abs(s.y - (from.pos.y + 30)) < 40) { s.dead = true; (from as { fanOut?: boolean }).fanOut = false; continue; }
      if (s.t > 170) { s.dead = true; if (from) (from as { fanOut?: boolean }).fanOut = false; continue; }
    }
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, s.x - 7, s.y - 7, 14, 14)) {
      hurtPlayer(ctx, DMG[s.kind], SRC[s.kind], { x: Math.sign(s.vx || 1) * 5, y: -4 });
      playSound(s.kind === 'pin' ? 'bonk' : 'punch', 0.7, 2);
      if (s.kind === 'pin') { s.dead = true; continue; }
    }
    if (s.kind === 'pin') {
      const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
      if ((top !== null && s.y >= top) || s.t > 150) {
        s.dead = true; envSound(state, s.x, 'clink', 0.4, 6);
        for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: s.x, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: i % 2 ? '#F4F4F5' : '#D8306E', size: 2 });
      }
    } else if (s.y > GY + 400) s.dead = true;
  }
  k.throws = k.throws.filter(s => !s.dead);
  // (the fans of anybody who died with one out: dropped)
  for (const s of k.throws) if (s.kind === 'fan' && s.from && (s.from.health <= 0 || s.from.isBlownAway)) s.from = null;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space)

/** The drawbridge (a stair to stairs.ts): planks, iron straps, its lit top; the chains up to the winch over the gate. */
export const drawDrawbridge = (c: Ctx, state: GameState, s: Stair) => {
  const d = s.d, e = endAt(d, s.ang);
  if (!onScreen(state, Math.min(d.px, e.x) - 60, Math.max(d.px, e.x) + 60)) return;
  const winch = { x: d.px + 10, y: Y(250) };
  // (the chains: from the winch to the bridge's end, taut)
  for (const [ox] of [[0], [6]]) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(winch.x - ox, winch.y); c.lineTo(e.x + 8 - ox, e.y + 2); c.stroke(); c.strokeStyle = '#8A8494'; c.lineWidth = 1.4; c.stroke(); }
  c.save(); c.translate(d.px, d.py); c.rotate(s.ang - Math.PI);
  // (the deck, pointing left from the pivot: -len..0 along it; its underside, the planks, the straps)
  const L = d.len;
  box(c, -L - 1, -2, L + 2, 18, INK);
  box(c, -L, -1, L, 16, '#7A5230');
  for (let x = -L + 4; x < -2; x += 16) box(c, x, 1, 1, 13, '#5A3A1E');
  for (const x of [-L + 20, -L / 2, -26]) { box(c, x, -1, 6, 16, '#3A3448'); box(c, x + 1, 2, 2, 2, '#8A8494'); }
  box(c, -L, 12, L, 3, '#4A3018');
  // (its lit top: it's stood on)
  box(c, -L + 2, -1, L - 4, 2, s.tell > 0 && Math.floor(state.frame / 4) % 2 ? '#FFE27A' : '#F6E7C0');
  c.restore();
  // (the hinge at the gatehouse's foot)
  c.fillStyle = INK; c.beginPath(); c.arc(d.px, d.py + 8, 8, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#3A3448'; c.beginPath(); c.arc(d.px, d.py + 8, 6, 0, Math.PI * 2); c.fill();
  // (the winch's tell: it rattles)
  if (s.tell > 0 || s.moving) { const j = state.frame % 4 < 2 ? 1 : -1; box(c, winch.x - 14 + j, winch.y - 10, 28, 20, INK); box(c, winch.x - 12 + j, winch.y - 8, 24, 16, '#5A546A'); }
  else { box(c, winch.x - 14, winch.y - 10, 28, 20, INK); box(c, winch.x - 12, winch.y - 8, 24, 16, '#5A546A'); }
  box(c, winch.x - 3, winch.y - 3, 6, 6, '#E0AE3A');
};

/** The rose beds: a hedge of thorny canes, pink and red roses on them, thorns up (it reads as a thing that hurts). */
const drawRoses = (c: Ctx, state: GameState, a: number, b: number, h: number) => {
  if (!onScreen(state, X(a), X(b))) return;
  const L = Math.max(X(a), state.camera.x - 40), R = Math.min(X(b), state.camera.x + 840), fy = Y(h);
  for (let x = Math.floor(L / 18) * 18; x < R; x += 18) {
    const hh = 16 + ((x * 7) % 9);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, fy); c.quadraticCurveTo(x + 10, fy - hh - 6, x + 20, fy - 2); c.stroke();
    c.strokeStyle = '#2F5A1A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, fy); c.quadraticCurveTo(x + 10, fy - hh - 6, x + 20, fy - 2); c.stroke();
    c.strokeStyle = '#365314'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 6, fy); c.quadraticCurveTo(x - 2, fy - hh, x + 8, fy - hh - 4); c.stroke();
    for (const [tx, ty] of [[x + 4, fy - hh + 2], [x + 12, fy - hh - 2], [x + 17, fy - hh * 0.5]]) { c.fillStyle = '#F5F0DC'; c.beginPath(); c.moveTo(tx - 2, ty); c.lineTo(tx, ty - 6); c.lineTo(tx + 2, ty); c.closePath(); c.fill(); }
    if ((x / 18) % 2 === 0) { const rc = (x / 18) % 4 === 0 ? '#E11D48' : '#F472B6'; c.fillStyle = INK; c.beginPath(); c.arc(x + 9, fy - hh - 1, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = rc; c.beginPath(); c.arc(x + 9, fy - hh - 1, 3, 0, Math.PI * 2); c.fill(); box(c, x + 8, fy - hh - 2, 2, 1, '#FFE4F0'); }
  }
};

/** A murder hole: the slot in the ceiling (a hoarding's floor), glowing on the tell; the pour, a column of molten
 *  butter brew, wobbling, splashing at the floor. */
const drawHole = (c: Ctx, state: GameState, i: number) => {
  const [hx, top, floor] = HOLES[i], x = X(hx), f = state.frame;
  if (!onScreen(state, x - 40, x + 40)) return;
  const s = holeAt(state, i), ty = Y(top);
  // (the hole itself)
  box(c, x - HOLE_HALF - 2, ty - 4, HOLE_HALF * 2 + 4, 6, INK);
  box(c, x - HOLE_HALF, ty - 3, HOLE_HALF * 2, 4, s.s === 'idle' ? '#2A1E14' : '#7A3A0A');
  if (s.s === 'tell') {
    c.save(); c.globalAlpha = 0.25 + 0.35 * s.k * (0.6 + 0.4 * Math.sin(f * 0.6)); c.fillStyle = '#FB923C';
    c.beginPath(); c.ellipse(x, ty + 4, 22 + s.k * 6, 10, 0, 0, Math.PI * 2); c.fill(); c.restore();
    box(c, x - HOLE_HALF, ty - 3, HOLE_HALF * 2, 2, '#FCD34D');
  }
  if (s.s === 'pour') {
    const fy = Y(floor), w = HOLE_HALF * 2 * (s.k < 0.1 ? s.k / 0.1 : s.k > 0.9 ? (1 - s.k) / 0.1 : 1);
    c.save(); c.globalAlpha = 0.18; c.fillStyle = '#FDE68A'; c.fillRect(Math.round(x - w / 2 - 8), Math.round(ty), Math.round(w + 16), Math.round(fy - ty)); c.restore();
    for (let y = ty; y < fy; y += 6) {
      const wob = Math.sin(y * 0.15 + f * 0.6) * 2;
      box(c, x - w / 2 + wob, y, w, 6, (y / 6 + f) % 3 < 1 ? '#FCD34D' : '#F59E0B');
      box(c, x - w / 2 + wob + 2, y, Math.max(1, w * 0.2), 6, '#FEF3C7');
    }
    // (the splash at the floor: a puddle)
    c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(x, fy - 1, w / 2 + 14, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FCD34D'; c.beginPath(); c.ellipse(x - 3, fy - 2, w / 2 + 6, 2, 0, 0, Math.PI * 2); c.fill();
  }
};

/** Behind him: the roses, the toadstools, the murder holes and their pours, the cauldrons. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const k = keepOf(state), f = state.frame;
  for (const [a, b, h] of ROSES) drawRoses(c, state, a, b, h);
  MUSHROOMS.forEach(([x], i) => { if (onScreen(state, X(x) - 80, X(x) + 80)) drawToadstool(c, X(x), Y(CAP_H), CAP_W, k.squash[i] ?? 0, f); });
  for (let i = 0; i < HOLES.length; i++) drawHole(c, state, i);
  for (let i = 0; i < CAULDRONS.length; i++) {
    const [px, , len] = CAULDRONS[i];
    if (!onScreen(state, X(px) - len - 40, X(px) + len + 40)) continue;
    const q = cauldronAt(state, i);
    // (the beam it hangs off: a hoarding's joist, scenery (dimmed: not stood on))
    const bc = mix('#5A3A1E', timeOfDay().haze, 0.3);
    box(c, q.px - 70, q.py - 9, 140, 12, INK); box(c, q.px - 69, q.py - 8, 138, 10, bc);
    box(c, q.px - 4, q.py - 4, 8, 8, '#3A3448');
    const n = Math.floor(len / 10);
    for (let j = 1; j < n; j++) { const t = j / n, x = q.px + (q.x - q.px) * t, y = q.py + (q.y - BOB_R - q.py) * t; box(c, x - 2, y - 2, 4, 4, INK); box(c, x - 1, y - 1, 2, 2, '#9CA3AF'); }
    // (the pot: black iron, golden butter brew bubbling over the top)
    c.save(); c.translate(q.x, q.y); c.rotate(-q.a * 0.6);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 2, BOB_R + 2, BOB_R - 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2A2830'; c.beginPath(); c.ellipse(0, 2, BOB_R, BOB_R - 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4A4852'; c.beginPath(); c.ellipse(-6, -3, 6, 5, 0, 0, Math.PI * 2); c.fill();
    box(c, -BOB_R - 2, -BOB_R + 4, BOB_R * 2 + 4, 5, INK); box(c, -BOB_R - 1, -BOB_R + 5, BOB_R * 2 + 2, 3, '#5A5862');
    c.fillStyle = '#F59E0B'; c.beginPath(); c.ellipse(0, -BOB_R + 5, BOB_R - 2, 4, 0, Math.PI, 0); c.fill();
    for (let j = 0; j < 3; j++) { const bx = -10 + j * 10, by = -BOB_R + 1 - ((f * 0.4 + j * 7) % 8); c.fillStyle = '#FDE68A'; c.beginPath(); c.arc(bx, by, 2.5, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
};

/** In front: what's thrown (pins, fans), the square's cast's throws. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  for (const s of keepOf(state).throws) {
    if (s.kind === 'pin') drawPin(c, s.x, s.y, s.t);
    else drawFan(c, s.x, s.y, s.t);
  }
  drawSquareThrows(c, state);
};
