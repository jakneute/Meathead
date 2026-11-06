// THE LAZY RIVER's heat (the owner, 2026-11-06: "the steam from the lava in level 2 causes 'nullification', zeroing out
// your charge meter. you need to actually platform through them and not 'charge through'. make sure it's obvious to the
// player what is happening. make sure all jumps can be made with single hops" / "considering you cannot charge on the
// tube rides, i think i'd bring this over on this too. rely on raw jumping ability" / "Any vertical point above the lava
// nullifies your charge. You cannot just uppercut to a high altitude then float down. This section will make having the
// cape a strong utility" / "limit the height you can make if you uppercut before the lava pit, expecting to get a high
// height then just float down. it shouldn't be super viable").
//
//   the lava's column   the whole height over the river, top of the screen down: his power's nulled (zeroed, held at
//                       zero, any charge, slide or uppercut under way cut off). Seen: a heat shimmer rising off all of
//                       it, wavering lines up to the top of the screen.
//   the knock           crossing into it still going up off an uppercut or a charge (or that high off one), the heat
//                       knocks the wind out of it: no higher than a plain jump would have got him over the rim, a puff
//                       and a fizzle. The cape's higher jump and its float still work (they aren't charge): with it, the
//                       river's easier. That's the point.
//   the plumes          steam up off the lava and out of vents in the decks (pale, blue-white, billowing: nothing like
//                       the smoke): over a deck, touched, the same (nulled). Some steady, some on a readable beat (a
//                       hiss and wisps first). Taught on the river's head (one steady vent, low: walk through it or hop
//                       it), then on beats, then a tall one with a crate to get over it.
//
// Made plain each time he goes into it (once on the way in, never every frame): a fizzle, a puff of steam off him,
// NULLIFIED over his head, the PWR cells crossed out (dead while he's in it; they fill as ever the moment he's out:
// nothing gives it back), a line now and then (the first time, always). No damage. Nobody else has a meter: the cast
// don't care.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import { playSound } from '../../../m1/game/platform/audio';
import { notePowerShort } from '../../../m1/game/player/powerShort';
import { endCharge, endUppercut } from '../../../m1/game/player/player';
import { PLAYER_MOVE_SPEED, PLAYER_GRAVITY, CANVAS_WIDTH as W } from '../../../m1/constants';
import { checker } from '../../intro/art/kit';
import { heard } from '../../bossQuiet';
import { label } from '../../adventure/section';
import { setUi } from '../../store';
import { stamp } from '../../../m1/game/render/stamp';
import { gapAt, deckY, waterY, B, GY } from './geo';

type Ctx = CanvasRenderingContext2D;
const X = (r: number) => B + r;
/** A plain jump's apex over where he took off (m1 constants: 7 px a frame held 15 frames, then gravity): the most the
 *  heat lets an uppercut or a charge get him over a lava rim. */
export const PLAIN_APEX = 142;

// ---------------------------------------------------------------------------------------------------------------
// The plumes: [x (level 2's own), on: 'deck' (a vent in it) | 'river' (off the lava), width, height, period (0:
// steady), up (frames), phase]

export interface Plume { x: number; deck: boolean; w: number; h: number; per: number; up: number; ph: number }
const PL = (r: number, deck: boolean, w: number, h: number, per = 0, up = 0, ph = 0): Plume => ({ x: X(r), deck, w, h, per, up, ph });
export const PLUMES: Plume[] = [
  // (taught: one low vent on the river's head, steady, before the first vine: walk through it or hop it)
  PL(1400, true, 30, 70),
  // (off the lava: the vines' first chain, the long swing)
  PL(2495, false, 44, 300, 200, 80, 0), PL(3575, false, 44, 320, 220, 90, 60),
  // (the canopy's deck: a vent on a beat; hop it or wait for it)
  PL(5900, true, 30, 70, 170, 70, 0),
  // (the log runs: steam off the lava along them)
  PL(9760, false, 44, 280, 190, 80, 30), PL(11000, false, 44, 300, 200, 80, 100), PL(12960, false, 44, 300, 180, 70, 0), PL(14120, false, 44, 280, 200, 80, 90),
  // (the swim-up bar: a vent on a beat)
  PL(14800, true, 30, 70, 150, 64, 40),
  // (the towers: between them)
  PL(16285, false, 40, 300, 170, 70, 0), PL(17635, false, 40, 320, 200, 80, 50), PL(18135, false, 40, 320, 200, 80, 150),
  // (the cove's quay: steady, low)
  PL(18900, true, 30, 70),
  // (the mix)
  PL(22610, false, 40, 300, 180, 70, 20), PL(25700, false, 44, 300, 190, 80, 70),
  // (the oasis: a tall one, steady, and a crate stood by it to get over it from)
  PL(23520, true, 30, 150),
  // (the last bend)
  PL(27300, false, 40, 320, 170, 70, 0),
];
/** The crate by the tall vent (stood on: its lit top). */
export const CRATE = { x: X(23400), w: 56, h: 64 };
const TELL = 48;

/** How far up a plume is right now (0..1), and whether it's hissing up (the tell). */
const plumeK = (p: Plume, f: number) => {
  if (!p.per) return { k: 1, tell: false };
  const t = (((f + p.ph) % p.per) + p.per) % p.per, rise = 12, fall = 16;
  if (t < rise) return { k: t / rise, tell: false };
  if (t < p.up) return { k: 1, tell: false };
  if (t < p.up + fall) return { k: 1 - (t - p.up) / fall, tell: false };
  return { k: 0, tell: t > p.per - TELL };
};
const baseOf = (p: Plume) => (p.deck ? deckY(p.x) : waterY(p.x));

// ---------------------------------------------------------------------------------------------------------------
// The rule, a frame of it (before he moves)

export interface Heat { on: boolean; was: boolean; popAt: number; moved: boolean; knocked: boolean; said: boolean; sayAt: number; lastNullAt: number }
export const newHeat = (): Heat => ({ on: false, was: false, popAt: -999, moved: false, knocked: false, said: false, sayAt: -1e9, lastNullAt: -999 });

/** In a plume's steam (its box as it is now)? */
const inPlume = (state: GameState, f: number) => {
  const p = state.player, x0 = p.pos.x + 6, x1 = p.pos.x + p.width - 6, y0 = p.pos.y, y1 = p.pos.y + p.height;
  for (const q of PLUMES) {
    if (x1 < q.x - q.w / 2 || x0 > q.x + q.w / 2) continue;
    const { k } = plumeK(q, f);
    if (k < 0.3) continue;
    const base = baseOf(q), top = base - q.h * k;
    if (y1 > top && y0 < base) return true;
  }
  return false;
};

/** `active`: plain play (not a cutscene, the fight, the end). `say`: his line (the first time; now and then after). */
export const updateHeat = (ctx: FrameContext, h: Heat, active: boolean, say: (first: boolean) => void) => {
  const { state } = ctx, p = state.player, f = state.frame, cx = p.pos.x + p.width / 2;
  if (p.isGrounded) { h.moved = false; h.knocked = false; }
  if (p.isUppercutting || (p.isCharging && !p.isSliding)) h.moved = true;
  const gap = gapAt(cx);
  const over = active && p.health > 0 && !p.inCutscene && !!gap;
  h.was = h.on;
  h.on = over || (active && p.health > 0 && !p.inCutscene && inPlume(state, f));
  if (h.on) {
    const live = p.isCharging || p.isUppercutting;
    // (a move under way: cut off)
    if (p.isCharging) { endCharge(ctx); const cap = PLAYER_MOVE_SPEED * 1.2; if (Math.abs(p.vel.x) > cap) p.vel.x = Math.sign(p.vel.x) * cap; }
    if (p.isUppercutting) endUppercut(ctx);
    // (the knock: over the lava, up off a move, no higher than a plain jump over the rim gets him)
    if (over && gap && (h.moved || live)) {
      const rim = GY + Math.min(gap.dyL, gap.dyR), up = rim - (p.pos.y + p.height);
      if (up > PLAIN_APEX - 4 && p.vel.y < 4.5) { p.vel.y = 4.5; p.jumpHoldTimer = 0; if (!h.knocked) knock(state, h); }
      else if (p.vel.y < 0) { const most = -Math.sqrt(2 * PLAYER_GRAVITY * Math.max(0, PLAIN_APEX - up)); if (p.vel.y < most) { p.vel.y = most; p.jumpHoldTimer = 0; if (!h.knocked) knock(state, h); } }
    }
    const had = p.power > 0.02 || live;
    p.power = 0; p.powerLocked = true;
    if (!h.was) {
      // (into it: told the once, on the way in)
      if (f - h.popAt > 70) { h.popAt = f; notePowerShort(); playSound('rayFizzle', had ? 0.8 : 0.45, -6); puff(state, 10); }
      if (!h.said) { h.said = true; h.sayAt = performance.now(); say(true); }
      else if (performance.now() - h.sayAt > 50000 && Math.random() < 0.35) { h.sayAt = performance.now(); say(false); }
    }
    h.lastNullAt = f;
  } else if (h.was) p.powerLocked = false;
  setUi({ pwrNull: h.on || f - h.lastNullAt < 2 });
};
const knock = (state: GameState, h: Heat) => { h.knocked = true; playSound('sizzle', 0.7, 6); playSound('whoosh', 0.5, -8); puff(state, 14); };
const puff = (state: GameState, n: number) => {
  const p = state.player;
  for (let i = 0; i < n; i++) state.particles.push({ pos: { x: p.pos.x + Math.random() * p.width, y: p.pos.y + 10 + Math.random() * (p.height - 20) }, vel: { x: (Math.random() - 0.5) * 2.4, y: -0.8 - Math.random() * 1.6 }, life: 28 + Math.random() * 12, color: i % 3 ? '#E0F2FE' : '#7DD3FC', size: 3 + Math.random() * 4, grav: -0.03 });
};
/** Off level 2's play (the fight, a cutscene, level 1): the HUD's cells back to normal. */
export const heatOff = (h: Heat) => { h.on = false; setUi({ pwrNull: false }); };

/** The hiss off the plumes on a beat, as they go (off-screen ones fade by distance: heard()). */
export const plumeSounds = (state: GameState) => {
  const f = state.frame;
  for (const q of PLUMES) {
    if (!q.per) continue;
    const t = (((f + q.ph) % q.per) + q.per) % q.per;
    if ((t === q.per - TELL || t === 0) && heard(state, q.x)) playSound(t === 0 ? 'whoosh' : 'rayFizzle', t === 0 ? 0.35 : 0.25, t === 0 ? -10 : -12);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing: the shimmer over all the lava (world, behind the decks), the plumes and the vents (world, behind him), the
// crate, NULLIFIED over his head (world, in front)

/** Baked at the game's own pixels: the plumes' columns (each width, four frames), their caps, the shimmer's squiggles. */
const CV = new Map<string, HTMLCanvasElement>();
const baked = (key: string, w: number, h: number, paint: (g: Ctx) => void) => {
  let cv = CV.get(key);
  if (!cv && typeof document !== 'undefined') { cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d')!); CV.set(key, cv); }
  return cv ?? null;
};
const STEAM = ['#3A5A78', '#6A98B8', '#A8D0E8', '#D8F0FA', '#F4FCFF'];
const COL_H = 340;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
/** A column of steam, `w` wide, COL_H tall (the foot at the bottom), its billows rolling up frame to frame: puffs in its
 *  ramp (shade, body, lit, highlight), their edges dithered, thinning to wisps toward the top. */
const paintColumn = (g: Ctx, w: number, fr: number) => {
  const cx = w / 2 + 6;
  for (let i = 0; i < 26; i++) {
    const u = ((i / 26 + fr / 104) % 1), y = COL_H - u * COL_H, r = (w / 2) * (0.6 + 0.5 * hash(i * 3.1)) * (1 - u * 0.35), dx = Math.sin(i * 1.7 + u * 6) * w * 0.18;
    const thin = u > 0.75 ? 0.55 : 1;
    g.globalAlpha = 0.85 * thin;
    g.fillStyle = STEAM[1]; g.beginPath(); g.ellipse(cx + dx + 2, y + 2, r, r * 0.8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = STEAM[2]; g.beginPath(); g.ellipse(cx + dx, y, r * 0.9, r * 0.72, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = STEAM[3]; g.beginPath(); g.ellipse(cx + dx - r * 0.25, y - r * 0.2, r * 0.5, r * 0.38, 0, 0, Math.PI * 2); g.fill();
    g.globalAlpha = 1;
  }
  // (dithered edges and a cold-blue shade band down its right; a few bright flecks)
  checker(g, cx + w * 0.22, 0, w * 0.2, COL_H, STEAM[1]);
  for (let k = 0; k < 14; k++) g.fillRect(Math.round(cx - w / 2 + hash(k + fr * 5) * w), Math.round(hash(k * 7 + fr) * COL_H), 2, 2);
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = STEAM[4];
  for (let k = 0; k < 10; k++) g.fillRect(Math.round(cx - w * 0.3 + hash(k * 3 + fr) * w * 0.4), Math.round(hash(k * 11 + fr * 2) * COL_H), 3, 1);
  g.globalCompositeOperation = 'source-over';
};
/** The heat shimmer's squiggle (rising off the lava, up to the top of the screen): a wavering pale line, four frames. */
const paintSquiggle = (g: Ctx, fr: number) => {
  for (let y = 0; y < 40; y += 2) { const x = 6 + Math.round(Math.sin(y * 0.3 + fr * 1.6) * 3); g.fillStyle = y < 8 || y > 32 ? 'rgba(254, 215, 170, 0.18)' : 'rgba(254, 215, 170, 0.34)'; g.fillRect(x, y, 2, 2); }
};
/** World, behind the decks (after the river): the shimmer up off every stretch of lava on screen. */
export const drawShimmer = (c: Ctx, state: GameState, gaps: { a: number; b: number }[]) => {
  const f = state.frame, x0 = state.camera.x - 20, x1 = state.camera.x + W + 20, top = state.camera.y - 40;
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  for (const g of gaps) {
    if (g.b < x0 || g.a > x1) continue;
    const base = waterY((g.a + g.b) / 2) - 8;
    for (let x = Math.max(g.a + 20, Math.floor(x0 / 80) * 80 + 20); x < Math.min(g.b - 20, x1); x += 80) {
      // (each column of them: a few, rising, each its own pace, fading out near the top of the screen)
      for (let n = 0; n < 2; n++) {
        const sp = 0.7 + hash(x * 0.13 + n) * 0.6, span = base - top, y = base - (((f * sp + hash(x + n * 7) * span) % span));
        const fr = (Math.floor(f / 8) + n) & 3, cv = baked(`sq-${fr}`, 14, 40, g2 => paintSquiggle(g2, fr));
        if (cv) c.drawImage(cv, Math.round(x + n * 37 - 7), Math.round(y - 40), 14, 40);
      }
    }
  }
  c.imageSmoothingEnabled = sm;
};
/** World, behind him: the vents in the decks, the plumes as they are (steady, rising, up, falling; the tell: the vent
 *  hissing, wisps), the crate. */
export const drawPlumes = (c: Ctx, state: GameState) => {
  const f = state.frame, cx0 = state.camera.x - 80, cx1 = state.camera.x + W + 80;
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
  for (const q of PLUMES) {
    if (q.x + q.w < cx0 || q.x - q.w > cx1) continue;
    const base = Math.round(baseOf(q)), { k, tell } = plumeK(q, f);
    if (q.deck) { c.save(); c.translate(Math.round(q.x), base); stamp(c, `wp2-vent-${q.w}`, -q.w / 2 - 6, -4, q.w + 12, 10, g => paintVent(g, q.w)); c.restore(); }
    if (tell || (q.per && k < 0.3)) {
      // (the tell: wisps off it, a few, rising quicker as it nears)
      for (let n = 0; n < 3; n++) { const t = (f * 1.4 + n * 13) % 30, yy = base - 4 - t * 1.4; c.fillStyle = n % 2 ? STEAM[3] : STEAM[2]; c.fillRect(Math.round(q.x - 8 + n * 7 + Math.sin(t * 0.3) * 2), Math.round(yy), 3, 3); }
    }
    if (k <= 0) continue;
    const hh = Math.round(q.h * k), fr = Math.floor(f / 6) & 3, w = q.w + 12;
    const cv = baked(`col-${q.w}-${fr}`, w + 12, COL_H, g => paintColumn(g, w, fr));
    if (!cv) continue;
    // (as tall as it's got: the column's foot up to its height, drawn up from the base; past COL_H stretched a touch)
    const sh = Math.min(COL_H, hh);
    c.drawImage(cv, 0, COL_H - sh, w + 12, sh, Math.round(q.x - (w + 12) / 2), base - hh, w + 12, hh);
  }
  // (the crate)
  if (CRATE.x + CRATE.w > cx0 && CRATE.x < cx1) { const y = Math.round(deckY(CRATE.x)) - CRATE.h; c.save(); c.translate(CRATE.x, y); stamp(c, 'wp2-crate', -1, -1, CRATE.w + 2, CRATE.h + 2, g => paintCrate(g)); c.restore(); }
  c.imageSmoothingEnabled = sm;
};
/** A vent in the deck: a steel grate, its slots dark, rust round its rim; flush with the deck (no lip of its own). */
const paintVent = (g: Ctx, w: number) => {
  const x0 = -w / 2 - 4;
  g.fillStyle = '#0A0604'; g.fillRect(x0, 0, w + 8, 5);
  g.fillStyle = '#52525B'; g.fillRect(x0 + 1, 0, w + 6, 4);
  g.fillStyle = '#18181B'; for (let x = x0 + 3; x < x0 + w + 6; x += 4) g.fillRect(x, 1, 2, 3);
  g.fillStyle = '#7C2D12'; g.fillRect(x0 + 1, 3, w + 6, 1);
};
/** The crate: planks in their ramp, braced across, its top lit (stood on), stenciled. */
const paintCrate = (g: Ctx) => {
  const w = CRATE.w, h = CRATE.h, P = ['#3A2410', '#6A4422', '#8A5E30', '#B07E46', '#F0D8A8'];
  g.fillStyle = '#0A0604'; g.fillRect(-1, -1, w + 2, h + 2);
  g.fillStyle = P[2]; g.fillRect(0, 0, w, h);
  for (let y = 4; y < h; y += 12) { g.fillStyle = P[1]; g.fillRect(0, y + 10, w, 2); g.fillStyle = P[3]; g.fillRect(0, y, w, 1); }
  g.fillStyle = P[1]; g.fillRect(w - 4, 0, 4, h); g.fillStyle = P[3]; g.fillRect(0, 0, 3, h);
  g.strokeStyle = P[0]; g.lineWidth = 4; g.beginPath(); g.moveTo(4, h - 4); g.lineTo(w - 4, 4); g.stroke();
  checker(g, 2, h - 8, w - 4, 6, P[0]);
  g.font = '6px "Press Start 2P"'; g.textAlign = 'center'; g.fillStyle = P[0]; g.fillText('TIKI', w / 2, h / 2 + 8); g.textAlign = 'left';
  // (its lit top: stood on)
  g.fillStyle = P[4]; g.fillRect(0, 0, w, 2); g.fillStyle = P[3]; g.fillRect(0, 2, w, 2);
};
/** World, in front of him: NULLIFIED, up over his head a moment after he goes into it. */
export const drawNullPop = (c: Ctx, state: GameState, h: Heat) => {
  const t = state.frame - h.popAt;
  if (t < 0 || t > 56) return;
  const p = state.player, y = p.pos.y - 34 - Math.min(10, t * 0.6);
  if (t > 46 && (t >> 1) % 2) return;
  label(c, 'NULLIFIED', p.pos.x + p.width / 2, Math.round(y), t % 8 < 4 ? '#7DD3FC' : '#F4FCFF', 8);
};
