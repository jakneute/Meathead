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
import { box, hash, checker, polyF, ballR, onScreen, ramp6, rampH, lit, INK, IRON, LIP, type Ctx } from '../kit';
import { stamp } from '../../intro/art/kit';
import { timeOfDay } from '../../timeOfDay';
import { updateThrows as updateSquareThrows, drawThrows as drawSquareThrows } from '../square/hazards';
import { GY } from '../geometry';
import { glenOf, type GThrow } from './state';
import { MUSHROOMS, CAP_H, CAP_W, BRIARS, CAULDRONS, X, Y } from './layout';
import { GAGS } from './lines';
import { heartArrow } from './kindArt';
import { grabLocked } from '../../moves/grab';

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
    // (a grab on the cap: no boing while it's on (moves/grab.ts envGuard); he just stands on it)
    if (grabLocked() || !p.isGrounded || !alive(state) || Math.abs(feet - Y(CAP_H)) > 2 || Math.abs(cx - X(mx)) > CAP_W / 2 + 2) continue;
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

/** A toadstool painted (its cap's top-middle at 0, 0; the ground `stalk` below the rim): the stalk in steps, its skirt
 *  and its bulb, the gills fanned under the cap, the cap domed in steps with a flat top (it's stood on: the lit lip),
 *  its spots shaded. `k` how squashed (0..1). Dimmed: the ones behind (scenery: no lip). */
const paintToadstool = (g: Ctx, w: number, stalk: number, k: number, dim: boolean) => {
  const sq = 1 - k * 0.3, wide = 1 + k * 0.12, capH = 26 * sq, half = (w / 2) * wide, top = 26 - capH, rim = 26;
  const Cp = rampH(ramp6('#D42A2A'), dim), St = rampH(ramp6('#EEE4C8'), dim), Gi = rampH(ramp6('#E2C89C'), dim), Sp = rampH(ramp6('#FFF4E2'), dim), M = rampH(ramp6('#4E7E3A'), dim);
  // (the stalk, down to the ground: lit left, shaded right, dithered; flecks; its skirt; the bulb at its foot)
  const sw = w * 0.3, sx = -sw / 2, bot = rim + stalk;
  box(g, sx - 1, rim - 2, sw + 2, bot - rim + 2, INK);
  box(g, sx, rim - 2, sw, bot - rim + 2, St[3]); box(g, sx, rim - 2, sw * 0.28, bot - rim + 2, St[4]); box(g, sx + 1, rim - 2, 1, bot - rim + 2, St[5]);
  box(g, sx + sw * 0.66, rim - 2, sw * 0.34, bot - rim + 2, St[2]); box(g, sx + sw - 3, rim - 2, 3, bot - rim + 2, St[1]); checker(g, sx + sw * 0.6, rim - 2, 2, bot - rim + 2, St[2], 0, 1);
  for (let y = rim + 14; y < bot - 4; y += 7) box(g, sx + 4 + ((y * 3) % (sw - 8)), y, 2, 1, St[1]);
  if (stalk > 30) { polyF(g, [[sx - 7, rim + 10], [sx + sw + 7, rim + 10], [sx + sw + 3, rim + 17], [sx - 3, rim + 17]], INK); polyF(g, [[sx - 6, rim + 11], [sx + sw + 6, rim + 11], [sx + sw + 2, rim + 16], [sx - 2, rim + 16]], St[3]); box(g, sx - 6, rim + 11, sw + 12, 1, St[5]); box(g, sx - 2, rim + 15, sw + 4, 1, St[1]); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, bot - 3, sw / 2 + 7, 7, 0, Math.PI, 0); g.fill(); g.fillStyle = St[2]; g.beginPath(); g.ellipse(0, bot - 3, sw / 2 + 6, 6, 0, Math.PI, 0); g.fill(); g.fillStyle = St[4]; g.beginPath(); g.ellipse(-sw / 4, bot - 5, sw / 4, 3, 0, Math.PI, 0); g.fill();
  for (let fr = -3; fr <= 3; fr++) if (fr) polyF(g, [[fr * 9, bot], [fr * 13, bot - 9 + Math.abs(fr)], [fr * 11 + 2, bot]], M[2 + (fr & 1)]);
  // (the gills under the cap, fanned)
  g.fillStyle = INK; g.beginPath(); g.ellipse(0, rim - 1, half - 2, 8, 0, 0, Math.PI); g.fill();
  g.fillStyle = Gi[3]; g.beginPath(); g.ellipse(0, rim - 1, half - 4, 6.5, 0, 0, Math.PI); g.fill();
  for (let gx = -half + 8; gx < half - 6; gx += 4) box(g, gx, rim, 1, Math.max(1, 5 * Math.sqrt(Math.max(0, 1 - (gx / half) ** 2))), Gi[1]);
  // (the cap: flat on top, rounded over its edges, in steps (lit up and left), spots shaded, inked)
  const capPath = () => { g.beginPath(); g.roundRect(-half, top, half * 2, capH, [14, 14, 6, 6]); };
  g.fillStyle = INK; g.beginPath(); g.roundRect(-half - 2, top - 2, half * 2 + 4, capH + 4, [15, 15, 7, 7]); g.fill();
  g.save(); capPath(); g.clip();
  box(g, -half, top, half * 2, capH, Cp[3]);
  box(g, -half, top, half * 0.5, capH, Cp[4]); box(g, -half, top, half * 2, 4, Cp[4]); box(g, -half * 0.8, top + 1, half * 0.9, 2, Cp[5]);
  box(g, half * 0.4, top + 4, half * 0.6, capH, Cp[2]); box(g, half * 0.75, top + 4, half * 0.25, capH, Cp[1]);
  checker(g, -half * 0.5, top, 2, capH, Cp[4], 0, 1); checker(g, half * 0.38, top + 4, 2, capH, Cp[2], 1, 1);
  box(g, -half, rim - 6, half * 2, 3, Cp[1]); box(g, -half, rim - 3, half * 2, 3, Cp[0]); checker(g, -half, rim - 8, half * 2, 2, Cp[1], 0, 1);
  for (const [dx, dy, r] of [[-0.6, 0.5, 5], [-0.18, 0.36, 6.5], [0.38, 0.46, 5.5], [0.72, 0.62, 3.5], [0.12, 0.74, 3.5], [-0.4, 0.78, 3]] as const) {
    const ex = dx * half, ey = top + dy * capH, rx = r * wide, ry = r * sq;
    g.fillStyle = Sp[1]; g.beginPath(); g.ellipse(ex + 1, ey + 1, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Sp[3]; g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Sp[5]; g.beginPath(); g.ellipse(ex - rx * 0.3, ey - ry * 0.3, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2); g.fill();
  }
  g.restore();
  // (the lit lip along its flat top)
  if (!dim) { box(g, -half + 9, top, half * 2 - 18, 2, LIP[2]); box(g, -half + 9, top, half * 2 - 18, 1, LIP[3]); }
};
/** A giant toadstool at x, its cap's top at capY (squash: frames left of a bounce's squash). Dimmed (`dim` > 0): the
 *  ones behind (scenery). Painted once for the hour while it's still; live while it's squashing. */
export const drawToadstool = (c: Ctx, x: number, capY: number, w: number, squash: number, f: number, dim = 0) => {
  const k = squash > 0 ? Math.sin((squash / 16) * Math.PI) : 0, stalk = Math.max(0, GY - capY - 26), d = dim > 0;
  // (its glow, soft, behind, breathing)
  if (!d) { c.save(); c.globalAlpha = (lit() ? 0.24 : 0.12) + 0.06 * Math.sin(f * 0.08 + x); c.fillStyle = '#FBCFE8'; c.beginPath(); c.ellipse(x, capY + 14, w / 2 + 14, 34, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha *= 0.6; c.beginPath(); c.ellipse(x, capY + 14, w / 2 + 26, 44, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  c.save(); c.translate(Math.round(x), Math.round(capY));
  if (k > 0) paintToadstool(c, w, stalk, k, d);
  else stamp(c, `fa-gl-toad-${w}-${Math.round(stalk)}-${d ? 1 : 0}-${timeOfDay().key}`, -w / 2 - 30, -4, w + 60, stalk + 34, g => paintToadstool(g, w, stalk, 0, d));
  c.restore();
};

/** A briar patch along the ground: a dark tangle in steps (the back canes dark, the front ones lit), thorns up and
 *  pale, red berries, a few leaves; it reads as a thing that hurts. Painted once for the hour. */
const drawBriars = (c: Ctx, state: GameState, a: number, b: number) => {
  if (!onScreen(state, X(a), X(b))) return;
  const w = b - a;
  c.save(); c.translate(X(a), GY);
  stamp(c, `fa-gl-briar-${a}-${timeOfDay().key}`, -8, -44, w + 16, 50, g => {
    const Cn = rampH(ramp6('#4A3020')), Lf = rampH(ramp6('#3E6A24')), Th = rampH(ramp6('#EEE4C8')), Br = rampH(ramp6('#C42030'));
    // (the back canes: dark loops, low)
    for (let x = -4; x < w; x += 11) { const h = 12 + hash(x * 0.37 + a) * 12; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 2); g.quadraticCurveTo(x + 9, -h - 6, x + 22, 0); g.stroke(); g.strokeStyle = Cn[1]; g.lineWidth = 2; g.stroke(); }
    box(g, -4, -6, w + 8, 8, Cn[0]); checker(g, -4, -8, w + 8, 2, Cn[0], 0, 1);
    // (leaves among them)
    for (let x = 4; x < w; x += 17) { const y = -8 - hash(x + a) * 12; polyF(g, [[x - 4, y], [x, y - 4], [x + 5, y], [x, y + 3]], INK); polyF(g, [[x - 3, y], [x, y - 3], [x + 4, y], [x, y + 2]], Lf[2 + Math.floor(hash(x * 3) * 2)]); box(g, x - 1, y - 2, 2, 1, Lf[4]); }
    // (the front canes: taller, lit along their tops, thorns all along them)
    for (let x = 0; x < w; x += 16) {
      const h = 18 + hash(x * 0.71 + a * 0.3) * 14, s = hash(x + a * 2) > 0.5 ? 1 : -1, x1 = x + 6, x2 = x + 6 + s * 14;
      g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(x1 - s * 8, 2); g.quadraticCurveTo(x1, -h - 8, x2, 0); g.stroke();
      g.strokeStyle = Cn[2]; g.lineWidth = 3; g.stroke(); g.strokeStyle = Cn[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x1 - s * 8, 1); g.quadraticCurveTo(x1, -h - 9, x2, -1); g.stroke();
      for (let t = 0.15; t < 0.9; t += 0.22) {
        const px = (1 - t) * (1 - t) * (x1 - s * 8) + 2 * t * (1 - t) * x1 + t * t * x2, py = 2 * t * (1 - t) * (-h - 8) + (1 - t) * (1 - t) * 2;
        polyF(g, [[px - 2.5, py], [px, py - 7], [px + 2.5, py]], INK); polyF(g, [[px - 1.5, py - 0.5], [px, py - 6], [px + 1.5, py - 0.5]], Th[3]); box(g, px - 1, py - 4, 1, 2, Th[5]);
      }
      if (hash(x * 1.3 + a) > 0.55) { const bx = x1 + s * 3, by = -h * 0.6; box(g, bx - 2, by - 2, 5, 5, INK); box(g, bx - 1, by - 1, 3, 3, Br[3]); box(g, bx - 1, by - 1, 1, 1, Br[5]); }
    }
  });
  c.restore();
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
    // (the branch it hangs off: the end of an oak's limb (art.ts draws the rest back to the trunk), scenery (dimmed:
    //  not stood on), an iron hook bracket round it)
    c.save(); c.translate(Math.round(k.px), Math.round(k.py));
    stamp(c, `fa-gl-cbranch-${timeOfDay().key}`, -86, -16, 172, 32, g => {
      const B = rampH(['#1C120C', '#30201A', '#463024', '#5E4432', '#7C5E46', '#9C7E60'], true);
      g.fillStyle = INK; g.beginPath(); g.moveTo(-82, -8); g.quadraticCurveTo(0, -14, 82, -8); g.lineTo(82, 7); g.quadraticCurveTo(0, 2, -82, 7); g.closePath(); g.fill();
      g.fillStyle = B[2]; g.beginPath(); g.moveTo(-81, -6); g.quadraticCurveTo(0, -12, 81, -6); g.lineTo(81, 5); g.quadraticCurveTo(0, 0, -81, 5); g.closePath(); g.fill();
      g.strokeStyle = B[4]; g.lineWidth = 2; g.beginPath(); g.moveTo(-80, -5); g.quadraticCurveTo(0, -11, 80, -5); g.stroke();
      for (let x = -76; x < 80; x += 9) box(g, x, -4 + Math.round(hash(x) * 4), 5, 1, B[1]);
      ballR(g, 36, -4, 4, B, true); box(g, 34, -6, 2, 2, B[0]);
      const I = rampH(IRON);
      box(g, -7, -11, 14, 18, INK); box(g, -6, -10, 12, 16, I[3]); box(g, -6, -10, 3, 16, I[5]); box(g, 3, -10, 3, 16, I[1]); box(g, -2, 4, 4, 6, I[2]);
    });
    c.restore();
    // (the chain, link by link, alternate links edge-on)
    const n = Math.floor(len / 10), I = rampH(IRON);
    for (let j = 1; j < n; j++) {
      const t = j / n, x = k.px + (k.x - k.px) * t, y = k.py + 4 + (k.y - BOB_R - 4 - k.py) * t;
      if (j % 2) { box(c, x - 3, y - 3, 6, 7, INK); box(c, x - 2, y - 2, 4, 5, I[4]); box(c, x - 1, y - 1, 2, 3, INK); box(c, x - 2, y - 2, 1, 2, I[5]); }
      else { box(c, x - 1.5, y - 4, 3, 8, INK); box(c, x - 0.5, y - 3, 1, 6, I[3]); }
    }
    // (the pot: black iron in steps, its rim, its ear-handles, three stubby legs, green brew bubbling over the top)
    c.save(); c.translate(k.x, k.y); c.rotate(-k.a * 0.6);
    if (lit()) { c.globalAlpha = 0.22; c.fillStyle = '#7CF29A'; c.beginPath(); c.ellipse(0, -BOB_R, BOB_R + 8, 10, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; }
    for (const lx of [-12, 0, 12]) { box(c, lx - 3, BOB_R - 6, 6, 9, INK); box(c, lx - 2, BOB_R - 5, 4, 7, I[2]); box(c, lx - 2, BOB_R - 5, 1, 7, I[4]); }
    for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(s * (BOB_R + 1), -BOB_R + 9, 5, s > 0 ? -Math.PI / 2 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI * 1.5); c.stroke(); c.strokeStyle = I[3]; c.lineWidth = 2; c.stroke(); }
    ballR(c, 0, 2, BOB_R, I);
    c.fillStyle = I[1]; c.beginPath(); c.ellipse(0, 2, BOB_R, BOB_R - 4, 0, 0.15, Math.PI - 0.15); c.fill();
    box(c, -BOB_R - 3, -BOB_R + 3, BOB_R * 2 + 6, 7, INK); box(c, -BOB_R - 2, -BOB_R + 4, BOB_R * 2 + 4, 5, I[3]); box(c, -BOB_R - 2, -BOB_R + 4, BOB_R * 2 + 4, 1, I[5]); box(c, -BOB_R - 2, -BOB_R + 8, BOB_R * 2 + 4, 1, I[1]);
    const Br = ['#14532D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#DCFCE7'];
    c.fillStyle = INK; c.beginPath(); c.ellipse(0, -BOB_R + 4, BOB_R, 5, 0, Math.PI, 0); c.fill();
    c.fillStyle = Br[2]; c.beginPath(); c.ellipse(0, -BOB_R + 4, BOB_R - 1, 4, 0, Math.PI, 0); c.fill();
    c.fillStyle = Br[4]; c.beginPath(); c.ellipse(-5, -BOB_R + 3, BOB_R * 0.5, 2, 0, Math.PI, 0); c.fill();
    for (let j = 0; j < 4; j++) { const bx = -12 + j * 8, t = ((f * 0.4 + j * 7) % 10) / 10, by = -BOB_R + 2 - t * 9, r = 1.5 + t * 2; c.fillStyle = INK; c.beginPath(); c.arc(bx, by, r + 0.8, 0, Math.PI * 2); c.fill(); c.fillStyle = Br[3]; c.beginPath(); c.arc(bx, by, r, 0, Math.PI * 2); c.fill(); box(c, bx - r * 0.5, by - r * 0.5, 1, 1, Br[5]); }
    for (const dx of [-BOB_R + 3, BOB_R - 6]) { box(c, dx, -BOB_R + 8, 3, 5 + (Math.floor(f / 6) + dx) % 3, Br[2]); box(c, dx, -BOB_R + 8, 1, 3, Br[4]); }
    c.restore();
  }
};

/** In front: what's thrown, the square's cast's throws. */
export const drawHazardsFront = (c: Ctx, state: GameState) => {
  const g = glenOf(state);
  for (const s of g.throws) {
    if (s.kind === 'bolt') {
      // (a crossbow bolt: an ash shaft, a steel head catching the light, red vanes)
      const a = Math.atan2(s.vy, s.vx);
      c.save(); c.translate(s.x, s.y); c.rotate(a);
      box(c, -15, -2, 22, 4, INK); box(c, -14, -1, 20, 2, '#B08A5A'); box(c, -14, -1, 20, 1, '#E0C090');
      c.fillStyle = INK; c.beginPath(); c.moveTo(4, -4.5); c.lineTo(13, 0); c.lineTo(4, 4.5); c.closePath(); c.fill();
      c.fillStyle = '#9CA3AF'; c.beginPath(); c.moveTo(5, -3); c.lineTo(11, 0); c.lineTo(5, 3); c.closePath(); c.fill(); box(c, 5, -2, 4, 1, '#F1F5F9');
      for (const sy of [-1, 1]) { c.fillStyle = INK; c.beginPath(); c.moveTo(-16, sy * 1); c.lineTo(-10, sy * 1); c.lineTo(-13, sy * 5); c.lineTo(-17, sy * 5); c.closePath(); c.fill(); box(c, -15, sy > 0 ? 1 : -4, 4, 3, sy > 0 ? '#B91C1C' : '#EF4444'); }
      c.restore();
    } else if (s.kind === 'arrow') {
      heartArrow(c, s.x + Math.cos(Math.atan2(s.vy, s.vx)) * 6, s.y + Math.sin(Math.atan2(s.vy, s.vx)) * 6, Math.atan2(s.vy, s.vx), 24);
    } else {
      // (a dwarf's rock: a lump of fake amethyst, faceted in steps, tumbling)
      c.save(); c.translate(s.x, s.y); c.rotate(s.t * 0.25);
      const R = ['#3B1A6E', '#5B2E9E', '#7C4ACF', '#A78BFA', '#C9B6FD', '#F1EBFF'];
      c.fillStyle = INK; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-3, -8); c.lineTo(6, -5); c.lineTo(8, 3); c.lineTo(-1, 8); c.closePath(); c.fill();
      c.fillStyle = R[2]; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-3, -6); c.lineTo(5, -4); c.lineTo(6, 3); c.lineTo(-1, 6); c.closePath(); c.fill();
      c.fillStyle = R[4]; c.beginPath(); c.moveTo(-6, 0); c.lineTo(-3, -6); c.lineTo(1, -1); c.closePath(); c.fill();
      c.fillStyle = R[1]; c.beginPath(); c.moveTo(6, 3); c.lineTo(-1, 6); c.lineTo(1, -1); c.closePath(); c.fill();
      box(c, -3, -4, 2, 2, R[5]);
      c.restore();
    }
  }
  drawSquareThrows(c, state);
};
