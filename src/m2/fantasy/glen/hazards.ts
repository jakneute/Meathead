// The enchanted glen's set pieces that move, and what the cast throw.
//
//   THE MUSHROOM TRAMPOLINES (traversal: the glen's own, alongside the land's staircases): a giant toadstool, its cap
//     a springy ledge, lit along its top; land on it and it squashes and throws him up (each its own height; holding
//     jump as he lands, a quarter higher). Taught alone in toadstool hollow (a cliff too tall to jump, one in front of
//     it); then three across a briar patch; then over the meadow's briars under a huntsman's tree stand (bounce high
//     and he's up there); then up to the lair's ledge.
//   THE BRIAR PATCHES (a hazard floor): thorns along the ground: in them he's hurt and thrown up out of them (once an
//     i-frame); the cast get torn up too, and keep out of them.
//   THE SWINGING CAULDRONS: an iron pot of bubbling green brew on a chain off a beam, swinging across the way on the
//     clock (the swing's always there to read): hit by one, knocked flying; the cast too (they keep out of the
//     swing).
//   What the cast throw: the huntsmen's bolts (straight, fast, at where he was), Cupid's heart-tipped arrows
//     (straight, at where he was; a fan of three now and then), the dwarfs' rocks (lobbed, one bounce). The square's cast throw theirs too (square/hazards.ts updateThrows / drawThrows).

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
import { updateThrows as updateSquareThrows, drawThrows as drawSquareThrows } from '../square/hazards';
import { GY } from '../geometry';
import { glenOf, type GThrow } from './state';
import { MUSHROOMS, CAP_H, CAP_W, BRIARS, CAULDRONS, X, Y } from './layout';
import { GAGS } from './lines';
import { heartArrow } from './kindArt';

const alive = (state: GameState) => state.player.health > 0 && !state.player.inCutscene;
const hits = (state: GameState, x: number, y: number, w: number, h: number) => { const p = state.player; return p.pos.x < x + w && p.pos.x + p.width > x && p.pos.y < y + h && p.pos.y + p.height > y; };
/** Each enemy's last hurt off a hazard of ours (frame), so a hazard's a hit and not a grinder. */
const lastHit = new WeakMap<Enemy, number>();
const tear = (ctx: FrameContext, e: Enemy, dmg: number, fromX: number, call: string, knock: number, every = 40) => {
  const at = lastHit.get(e) ?? -999;
  if (ctx.state.frame - at < every) return;
  lastHit.set(e, ctx.state.frame);
  hazardHit(ctx, e, dmg, fromX, call, { knock });
};

export const buildHazards = (state: GameState) => {
  // (the toadstools' caps: springy ledges, stood on from above)
  for (const [x] of MUSHROOMS) ledge(state, X(x) - CAP_W / 2, Y(CAP_H), CAP_W, { hidden: true, tag: 'fa-mushroom' });
  glenOf(state).squash = MUSHROOMS.map(() => 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The cauldrons: where each one's pot is this frame

const BOB_R = 20;
export const cauldronAt = (state: GameState, i: number) => {
  const [px, ph, len, amp, period, phase] = CAULDRONS[i];
  const t = ((state.frame + phase) / period) * Math.PI * 2;
  const a = amp * Math.sin(t), da = amp * Math.cos(t);
  return { px: X(px), py: Y(ph), x: X(px) + Math.sin(a) * len, y: Y(ph) + Math.cos(a) * len, a, dir: Math.sign(da) || 1 };
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame (before he moves: the toadstools throw him off this frame's landing)

export const updateHazards = (ctx: FrameContext, controls: Controls) => {
  const { state } = ctx, g = glenOf(state), p = state.player, f = state.frame;
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // The toadstools
  for (let i = 0; i < MUSHROOMS.length; i++) {
    if (g.squash[i] > 0) g.squash[i]--;
    const [mx, h] = MUSHROOMS[i];
    if (!p.isGrounded || !alive(state) || Math.abs(feet - Y(CAP_H)) > 2 || Math.abs(cx - X(mx)) > CAP_W / 2 + 2) continue;
    const up = h * (controls.jump ? 1.25 : 1);
    p.vel.y = -Math.sqrt(2 * PLAYER_GRAVITY * up); p.pos.y -= 2;
    p.isGrounded = false; p.jumpHoldTimer = 0; p.coyoteJumpTimer = 0; p.jumpBufferTimer = 0;
    g.squash[i] = 16;
    playSound('boing', 0.8, controls.jump ? 6 : 0);
    for (let k = 0; k < 8; k++) state.particles.push({ pos: { x: X(mx) + (Math.random() - 0.5) * CAP_W, y: Y(CAP_H) - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 24, color: k % 2 ? '#FDE68A' : '#F9A8D4', size: 2 });
    if (!g.said.bounce) { g.said.bounce = true; meatheadSays(state, pickLine(byPants(state, GAGS.bounce)), false); }
  }
  // The briars
  const zones: Zone[] = [];
  for (const [a, b] of BRIARS) {
    zones.push({ x0: X(a), x1: X(b), y0: GY - 30, y1: GY + 4, ground: true });
    if (alive(state) && hits(state, X(a), GY - 22, b - a, 22)) {
      // (thrown up out of them, hurt the once an i-frame)
      if (p.isGrounded || p.vel.y > 0) { p.vel.y = -8.5; p.isGrounded = false; p.jumpHoldTimer = 0; envSound(state, cx, 'crunch', 0.4, 10); }
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 10, 'm2:fa_briars', { x: 0, y: -8.5 });
      if (f % 3 === 0) state.particles.push({ pos: { x: cx, y: feet - 6 }, vel: { x: (Math.random() - 0.5) * 3, y: -2 }, life: 16, color: '#4D7C0F', size: 2 });
    }
    for (const e of hazardVictims(state, { flyers: false })) if (boxHits(e, X(a), GY - 22, b - a, 22)) tear(ctx, e, 30, mid(e).x - (e.vel.x || 1), 'THORNED!', 3);
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
    // (the brew slopping over the rim at the end of a swing; a creak at the top of it)
    if (Math.abs(c.a) > amp * 0.96 && f % 4 === 0) state.particles.push({ pos: { x: c.x + c.dir * 10, y: c.y - 12 }, vel: { x: -c.dir * 1.5, y: -1 }, life: 20, color: '#4ADE80', size: 3 });
    if (Math.abs(c.a) > amp * 0.99 && f % 20 === 0) envSound(state, c.x, 'rumble', 0.2, 14);
  }
  setHazardZones(state, 'fa-glen', zones);
  updateThrows(ctx);
  // (the town square's cast here: their throws fly too)
  updateSquareThrows(ctx);
};

const R: Record<GThrow['kind'], number> = { bolt: 6, arrow: 6, rock: 7 };
const DMG: Record<GThrow['kind'], number> = { bolt: 12, arrow: 10, rock: 9 };
const SRC: Record<GThrow['kind'], string> = { bolt: 'm2:fa_huntsman_shot', arrow: 'm2:fa_cupid_shot', rock: 'm2:fa_dwarf_shot' };
const GRAV: Record<GThrow['kind'], number> = { bolt: 0, arrow: 0, rock: 0.32 };

const updateThrows = (ctx: FrameContext) => {
  const { state } = ctx, g = glenOf(state), p = state.player;
  for (const s of g.throws) {
    s.t++;
    s.vy += GRAV[s.kind]; s.x += s.vx; s.y += s.vy;
    if (s.kind === 'bolt' && s.t % 3 === 0) state.particles.push({ pos: { x: s.x - s.vx, y: s.y - s.vy }, vel: { x: 0, y: 0 }, life: 8, color: '#E7E5E4', size: 1.5 });
    if (s.kind === 'arrow' && s.t % 4 === 0) state.particles.push({ pos: { x: s.x - s.vx * 3, y: s.y - s.vy * 3 }, vel: { x: 0, y: -0.3 }, life: 12, color: '#F9A8D4', size: 1.5 });
    const r = R[s.kind];
    if (alive(state) && p.invincibilityTimer <= 0 && hits(state, s.x - r, s.y - r, r * 2, r * 2)) {
      hurtPlayer(ctx, DMG[s.kind], SRC[s.kind], { x: Math.sign(s.vx || 1) * 5, y: -4 });
      playSound(s.kind === 'rock' ? 'punch' : 'gunhit', 0.7, 0);
      s.dead = true; continue;
    }
    const top = s.vy > 0 ? floorTopAt(state.blocks, s.x, s.y - s.vy - 2, 0) : null;
    const wall = state.blocks.some(b => !b.oneWay && b.type !== 'platform' && b.type !== 'pit' && s.x > b.x && s.x < b.x + b.w && s.y > b.y + 4 && s.y < b.y + b.h);
    if ((top !== null && s.y >= top) || wall || s.t > 150) {
      if (s.kind === 'rock' && !wall && top !== null && s.bounces < 1) { s.y = top; s.vy = -Math.abs(s.vy) * 0.45; s.vx *= 0.7; s.bounces++; envSound(state, s.x, 'thud', 0.4, 10); continue; }
      s.dead = true;
      if (s.kind === 'arrow') { envSound(state, s.x, 'clink', 0.35, 12); for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 14, color: i % 2 ? '#F472B6' : '#FEF3C7', size: 2 }); }
      if (s.kind === 'bolt') { envSound(state, s.x, 'clink', 0.4, 8); for (let i = 0; i < 4; i++) state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: (Math.random() - 0.5) * 3, y: -Math.random() * 2 }, life: 12, color: '#A8A29E', size: 2 }); }
      if (s.kind === 'rock') for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: s.x, y: s.y - 2 }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 14, color: '#A78BFA', size: 2 });
    }
  }
  g.throws = g.throws.filter(s => !s.dead);
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (world space)

/** A giant toadstool: a pale stalk with its skirt, the red cap with white spots, glowing a little, its top lit (it's
 *  stood on); squashed a moment after a bounce. Dimmed: the far ones behind (scenery). */
export const drawToadstool = (c: Ctx, x: number, capY: number, w: number, squash: number, f: number, dim = 0) => {
  const T = (col: string) => (dim ? mix(col, timeOfDay().haze, dim) : col);
  const k = squash > 0 ? Math.sin((squash / 16) * Math.PI) : 0, sq = 1 - k * 0.3, wide = 1 + k * 0.12;
  const capH = 26 * sq, half = (w / 2) * wide, top = capY + (26 - capH), rim = capY + 26;
  // (its glow, soft, behind)
  if (!dim) { c.save(); c.globalAlpha = 0.2 + 0.08 * Math.sin(f * 0.08 + x); c.fillStyle = '#FBCFE8'; c.beginPath(); c.ellipse(x, top + capH / 2, half + 12, capH + 8, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  // (the stalk, down to the ground; its skirt)
  const sw = w * 0.3;
  box(c, x - sw / 2 - 1, rim - 2, sw + 2, GY - rim + 2, T(INK)); box(c, x - sw / 2, rim - 2, sw, GY - rim + 2, T('#F5EEDC'));
  box(c, x + sw / 2 - 7, rim - 2, 6, GY - rim + 2, T('#D6CDB4'));
  box(c, x - sw / 2 - 5, rim + 8, sw + 10, 5, T('#E8DFC6'));
  // (the gills under the cap)
  c.fillStyle = T('#E9D5B0'); c.beginPath(); c.ellipse(x, rim, half - 4, 6, 0, 0, Math.PI); c.fill();
  // (the cap: flat on top (it's stood on), rounded over the edges, inked, spots)
  c.fillStyle = T(INK); c.beginPath(); c.roundRect(x - half - 2, top - 2, half * 2 + 4, capH + 4, [14, 14, 6, 6]); c.fill();
  c.fillStyle = T('#DC2626'); c.beginPath(); c.roundRect(x - half, top, half * 2, capH, [12, 12, 5, 5]); c.fill();
  box(c, x + half * 0.35, top + 4, half * 0.55, capH - 6, T('#B91C1C'));
  box(c, x - half, rim - 5, half * 2, 3, T('#991B1B'));
  for (const [dx, dy, r] of [[-0.55, 0.45, 5], [-0.1, 0.35, 6], [0.45, 0.5, 5], [0.2, 0.7, 3.5], [-0.35, 0.75, 3]] as const) {
    c.fillStyle = T('#FFF7ED'); c.beginPath(); c.ellipse(x + dx * half, top + dy * capH, r * wide, r * sq, 0, 0, Math.PI * 2); c.fill();
  }
  // (the lit lip along its flat top)
  if (!dim) box(c, x - half + 8, top, half * 2 - 16, 3, '#FDE68A');
};

/** A briar patch along the ground: a dark tangle, thorns up, red berries; it reads as a thing that hurts. */
const drawBriars = (c: Ctx, state: GameState, a: number, b: number) => {
  if (!onScreen(state, X(a), X(b))) return;
  const L = Math.max(X(a), state.camera.x - 40), R = Math.min(X(b), state.camera.x + 840);
  for (let x = Math.floor(L / 18) * 18; x < R; x += 18) {
    const h = 16 + ((x * 7) % 9);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, GY); c.quadraticCurveTo(x + 10, GY - h - 6, x + 20, GY - 2); c.stroke();
    c.strokeStyle = '#3F2A1A'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, GY); c.quadraticCurveTo(x + 10, GY - h - 6, x + 20, GY - 2); c.stroke();
    c.strokeStyle = '#365314'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 6, GY); c.quadraticCurveTo(x - 2, GY - h, x + 8, GY - h - 4); c.stroke();
    // (the thorns)
    for (const [tx, ty] of [[x + 4, GY - h + 2], [x + 12, GY - h - 2], [x + 17, GY - h * 0.5]]) { c.fillStyle = '#F5F0DC'; c.beginPath(); c.moveTo(tx - 2, ty); c.lineTo(tx, ty - 6); c.lineTo(tx + 2, ty); c.closePath(); c.fill(); }
    if ((x / 18) % 3 === 0) box(c, x + 9, GY - h + 4, 3, 3, '#DC2626');
  }
};

/** Behind him: the briars, the toadstools, the cauldrons' beams and chains and pots. */
export const drawHazardsBack = (c: Ctx, state: GameState) => {
  const g = glenOf(state), f = state.frame;
  for (const [a, b] of BRIARS) drawBriars(c, state, a, b);
  MUSHROOMS.forEach(([x], i) => { if (onScreen(state, X(x) - 80, X(x) + 80)) drawToadstool(c, X(x), Y(CAP_H), CAP_W, g.squash[i] ?? 0, f); });
  for (let i = 0; i < CAULDRONS.length; i++) {
    const [px, , len] = CAULDRONS[i];
    if (!onScreen(state, X(px) - len - 40, X(px) + len + 40)) continue;
    const k = cauldronAt(state, i);
    // (the beam it hangs off: a gnarled branch, scenery (dimmed: not stood on))
    const bc = mix('#4A3424', timeOfDay().haze, 0.3);
    box(c, k.px - 70, k.py - 9, 140, 12, INK); box(c, k.px - 69, k.py - 8, 138, 10, bc);
    box(c, k.px - 4, k.py - 4, 8, 8, '#3A3448');
    // (the chain, link by link)
    const n = Math.floor(len / 10);
    for (let j = 1; j < n; j++) { const t = j / n, x = k.px + (k.x - k.px) * t, y = k.py + (k.y - BOB_R - k.py) * t; box(c, x - 2, y - 2, 4, 4, INK); box(c, x - 1, y - 1, 2, 2, '#9CA3AF'); }
    // (the pot: black iron, a rim, three stubby legs, green brew bubbling over the top)
    c.save(); c.translate(k.x, k.y); c.rotate(-k.a * 0.6);
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, 2, BOB_R + 2, BOB_R - 2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2A2830'; c.beginPath(); c.ellipse(0, 2, BOB_R, BOB_R - 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#4A4852'; c.beginPath(); c.ellipse(-6, -3, 6, 5, 0, 0, Math.PI * 2); c.fill();
    box(c, -BOB_R - 2, -BOB_R + 4, BOB_R * 2 + 4, 5, INK); box(c, -BOB_R - 1, -BOB_R + 5, BOB_R * 2 + 2, 3, '#5A5862');
    c.fillStyle = '#22C55E'; c.beginPath(); c.ellipse(0, -BOB_R + 5, BOB_R - 2, 4, 0, Math.PI, 0); c.fill();
    for (let j = 0; j < 3; j++) { const bx = -10 + j * 10, by = -BOB_R + 1 - ((f * 0.4 + j * 7) % 8); c.fillStyle = '#86EFAC'; c.beginPath(); c.arc(bx, by, 2.5, 0, Math.PI * 2); c.fill(); }
    for (const lx of [-12, 0, 12]) box(c, lx - 2, BOB_R - 4, 4, 6, INK);
    c.restore();
  }
};

/** In front: what's thrown, the square's cast's throws. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const g = glenOf(state);
  for (const s of g.throws) {
    if (s.kind === 'bolt') {
      const a = Math.atan2(s.vy, s.vx);
      c.save(); c.translate(s.x, s.y); c.rotate(a);
      box(c, -14, -1.5, 20, 3, INK); box(c, -13, -0.5, 18, 1, '#D6D3D1');
      c.fillStyle = INK; c.beginPath(); c.moveTo(5, -3.5); c.lineTo(12, 0); c.lineTo(5, 3.5); c.closePath(); c.fill();
      box(c, -14, -3, 4, 6, '#DC2626');
      c.restore();
    } else if (s.kind === 'arrow') {
      heartArrow(c, s.x + Math.cos(Math.atan2(s.vy, s.vx)) * 6, s.y + Math.sin(Math.atan2(s.vy, s.vx)) * 6, Math.atan2(s.vy, s.vx), 24);
    } else {
      c.fillStyle = INK; c.beginPath(); c.moveTo(s.x - 7, s.y); c.lineTo(s.x - 2, s.y - 7); c.lineTo(s.x + 6, s.y - 4); c.lineTo(s.x + 7, s.y + 3); c.lineTo(s.x - 1, s.y + 7); c.closePath(); c.fill();
      c.fillStyle = '#A78BFA'; c.beginPath(); c.moveTo(s.x - 5, s.y); c.lineTo(s.x - 2, s.y - 5); c.lineTo(s.x + 4, s.y - 3); c.lineTo(s.x + 5, s.y + 2); c.lineTo(s.x - 1, s.y + 5); c.closePath(); c.fill();
      box(c, s.x - 2, s.y - 3, 2, 2, '#EDE9FE');
    }
  }
  drawSquareThrows(c, state);
};
