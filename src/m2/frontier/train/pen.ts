// THE LION'S PEN: a hidden MAX AMMO find (upgrades/SPEC.md: 5 in all, +10% ammo in every weapon each). The owner
// (verbatim): "wildernes land. ammo pickup. the train with the circus lion. you can see an ammo pickup inside the pen. you
// can continuously shoot the pen, letting the lion loose and awarding you the pickup. make sure decoupling doesn't
// happen right at the circus lion train. the player just has to shoot it a bit to break the lion out who functions like
// a normal large cat enemy"
//
// THE TELL: the ammo canister stands in the straw at the front end of the cage wagon (lion.ts drawCage), the lion pacing
// in front of it; his line about it after his line about the lion. THE PEN: anything of his that flies (any weapon's
// shots) into the cage's bars from either end of the car is stopped by them: a clang, sparks, the cage shudders, and the
// bars bow out more every few hits (PEN_HITS in all); then they burst: the lion's out up onto the cage's roof, roaring
// (CIRCUS LION: the wilds' cougar's way of fighting, a big cat: sees him, roars (the tell), pounces; prowls), and the
// canister's knocked out through the gap onto the car's front platform. Touched: it's his for good (upgrades/
// ammoAward.ts: the save written there and then), the card up with its buffer, his line once it's shut. Taken, the cage
// stands open and empty on every pass after (the save's collectible); broken but not taken (he died), it's whole again
// with the lion in it (the train's rebuilt with every death). The first cut is the boxcar's now, not this car's
// (layout.ts): a later cut (car 7's) still takes it, cage, lion, canister and all, if he's left it shut.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { GRAVITY } from '../../../m1/constants';
import { makeKindEnemy, safeAhead, holdingOff, mid } from '../../../m1/game/enemies/kinds';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { pickLine } from '../../../m1/game/platform/speech';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerM2Kind } from '../../kinds';
import { awardAmmo, ammoWon, openAmmoCard, tickAmmoCard } from '../../upgrades/ammoAward';
import { meatheadSays, byPants } from '../section';
import { CARS, DECK, END, TOP, CIRCUS } from './layout';
import { trainOf, type Train } from './state';
import { carXNow } from './where';
import { type Ctx, box, checker, still, INK } from './paint';
import { drawCircusLion, type LionPose } from './lionArt';
import { PEN_BREAK, PEN_GOT } from './lines';

/** The find, in the save (one of Wilderness Land's collectibles). */
export const AMMO_LAND = 'frontier', AMMO_ID = 'ammo-train';
/** Hits the bars take before they burst (any weapon's: each thing of his that flies into them is one). */
export const PEN_HITS = 12;
/** The cage's height over the deck: its roof (to stand on), under its header, its floor (the straw). World y. */
const ROOF_Y = TOP.flat ?? DECK - 132, BARS_Y = ROOF_Y + 26, FLOOR_Y = DECK - 38;
/** Where the canister stands in the straw (x along the car): toward the front end, clear of the plaques on the bars. */
const canRx = (len: number) => Math.round(len * 0.62);

/** The cage's open (broken this life, or the find taken on this save): no lion in it, nothing to shoot. */
export const penOpen = (tr: Train) => tr.pen.broke || tr.pen.taken;
/** How dented the bars are (0..3), by the hits. */
export const penDmg = (tr: Train) => (penOpen(tr) ? 0 : Math.min(3, Math.floor((tr.pen.hits * 4) / PEN_HITS)));
/** At the section's build: taken on this save already? */
export const setPen = (tr: Train) => { tr.pen.taken = ammoWon(AMMO_LAND, AMMO_ID); };

// ---------------------------------------------------------------------------------------------------------------
// The ammo canister (the max ammo find's look on the train: the heart canister's build (spooky/tower/art.ts), amber)

const AMBER = ['#3A1C04', '#6A3608', '#9A560E', '#C87A18', '#E89C2A', '#F8C050', '#FFE49A'];
const BRASSC = ['#3A2408', '#6A4410', '#9A6A1C', '#C8962E', '#E8C25A', '#FFF0A8'];
const CASE = ['#4A2C08', '#8A5A14', '#C88E2A', '#ECC25A', '#FFF0B0'];
const TIP = ['#3A140A', '#7A3416', '#B8582A', '#E08A52'];

const paintCan = (g: Ctx) => {
  // (its glow: stepped rings, dim amber)
  for (let r = 4; r >= 1; r--) { g.fillStyle = `rgba(248, 176, 60, ${0.08 * (5 - r)})`; g.beginPath(); g.ellipse(0, -26, 12 + r * 5, 18 + r * 5, 0, 0, Math.PI * 2); g.fill(); }
  // (the glass: banded down its length, dark at the edges, lit toward the left; the dither at each seam)
  box(g, -13, -44, 26, 36, INK);
  const cols = [1, 2, 3, 4, 5, 4, 3, 2, 2, 1];
  const bw = 24 / cols.length;
  cols.forEach((k, i) => { box(g, -12 + i * bw, -43, bw + 0.5, 34, AMBER[k]); if (i) checker(g, -12 + i * bw - 1, -43, 2, 34, AMBER[cols[i - 1]], i % 2); });
  // (the rounds standing in it: brass cases, copper tips, lit down their left)
  for (const [rx, h] of [[-7, 22], [-1, 25], [5, 21]] as [number, number][]) {
    const top = -10 - h;
    box(g, rx - 1, top - 1, 6, h + 2, INK);
    box(g, rx, top + 7, 4, h - 7, CASE[2]); box(g, rx, top + 7, 1, h - 7, CASE[4]); box(g, rx + 3, top + 7, 1, h - 7, CASE[1]);
    box(g, rx, top + 9, 4, 1, CASE[0]); box(g, rx, -12, 4, 2, CASE[1]);
    box(g, rx, top + 2, 4, 5, TIP[2]); box(g, rx + 1, top, 2, 2, TIP[2]); box(g, rx, top + 2, 1, 5, TIP[3]); box(g, rx + 3, top + 3, 1, 4, TIP[1]);
  }
  // (bubbles, the shine down the glass's left)
  box(g, 7, -20, 2, 2, AMBER[6]); box(g, -9, -31, 1, 1, AMBER[6]); box(g, 3, -38, 1, 1, AMBER[6]);
  box(g, -11, -42, 2, 31, 'rgba(255, 244, 214, 0.5)'); box(g, -8, -42, 1, 22, 'rgba(255, 244, 214, 0.28)');
  // (the caps: brass, stepped, a lit rim, bolt heads; the knob on top)
  for (const y of [-50, -10]) {
    box(g, -16, y - 1, 32, 10, INK);
    box(g, -15, y, 30, 8, BRASSC[3]); box(g, -15, y, 30, 2, BRASSC[4]); box(g, -15, y + 6, 30, 2, BRASSC[1]); box(g, -15, y, 30, 1, BRASSC[5]);
    box(g, -15, y, 2, 8, BRASSC[4]); box(g, 13, y, 2, 8, BRASSC[1]);
    for (const bx of [-11, 9]) { box(g, bx, y + 3, 2, 2, BRASSC[0]); box(g, bx, y + 3, 1, 1, BRASSC[4]); }
  }
  box(g, -5, -55, 10, 6, INK); box(g, -4, -54, 8, 4, BRASSC[3]); box(g, -4, -54, 8, 1, BRASSC[5]);
};

/** The canister, its foot's middle at (x, y): painted the once (still()), its glint now and then live. */
export const drawPenCan = (c: Ctx, x: number, y: number, f: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  still(c, 'tr-ammo-can', -36, -68, 72, 84, paintCan);
  if (f % 100 < 10) box(c, -12 + (f % 100) * 2, -49, 3, 1, '#FFFFFF');
  // (a twinkle off it now and then: the tell, through the bars and the dark of the cage)
  const tw = f % 70;
  if (tw < 14) { const r = tw < 7 ? 1 + (tw >> 1) : 4 - ((tw - 7) >> 1); box(c, 10 - r, -46, r * 2 + 1, 1, '#FFFFFF'); box(c, 10, -46 - r, 1, r * 2 + 1, '#FFFFFF'); box(c, 9, -47, 3, 3, '#FFF0A8'); }
  c.restore();
};

/** In the cage (lion.ts drawCage, in front of the lion, behind the bars): the canister in the straw, while it's there. */
export const drawPenInside = (c: Ctx, state: GameState, x: number, len: number) => {
  const tr = trainOf(state);
  if (penOpen(tr)) return;
  drawPenCan(c, x + canRx(len), FLOOR_Y + 1, state.frame);
};

/** In front of everything on the car: the canister knocked out of the cage, flying, then lying on the platform. */
export const drawPenFront = (c: Ctx, state: GameState) => {
  const tr = trainOf(state), k = tr.pen.can;
  if (!k || CIRCUS < 0 || tr.cars[CIRCUS]?.gone) return;
  drawPenCan(c, carXNow(tr, CIRCUS) + k.rx, k.y, state.frame);
};

// ---------------------------------------------------------------------------------------------------------------
// Each frame

const COUNTED = new WeakSet<object>();
/** How near the bars a shot heading into them counts (it's stopped by the cage's block on the engine's next step, before
 *  it's ever in among them: farther than any shot goes in a frame). */
const REACH = 60;

/** Each frame: shots into the bars, the bars bursting, the canister's flight, touching it, the card. True while the
 *  card's up (he's held: nothing else of his runs). */
export const updatePen = (ctx: FrameContext): boolean => {
  const { state } = ctx, tr = trainOf(state), pen = tr.pen, p = state.player;
  if (pen.card) {
    p.inCutscene = true; p.vel.x = 0;
    if (tickAmmoCard(pen.card, state.frame)) {
      pen.card = null; p.inCutscene = false;
      meatheadSays(state, pickLine(byPants(state, PEN_GOT)), false);
    }
    return !!pen.card;
  }
  if (CIRCUS < 0 || tr.lion) return false;
  if (tr.cars[CIRCUS]?.gone) { pen.can = null; return false; }
  const x = carXNow(tr, CIRCUS), len = CARS[CIRCUS].len;
  if (pen.jit > 0) pen.jit--;
  if (!penOpen(tr)) {
    // (the bars: from the end of the car, its platforms, a shot flies into them; moving toward them, or in among them)
    const a = x + END, b = x + len - END;
    for (const pj of state.projectiles) {
      if (pj.owner !== 'player' || pj.health <= 0 || COUNTED.has(pj)) continue;
      const l = pj.pos.x, r = pj.pos.x + pj.width;
      if (pj.pos.y + pj.height < ROOF_Y - 4 || pj.pos.y > DECK - 20) continue;
      const into = (r > a && l < b) || (r > a - REACH && r <= a && pj.vel.x > 0) || (l < b + REACH && l >= b && pj.vel.x < 0);
      if (!into) continue;
      COUNTED.add(pj);
      // (stopped dead by the bars: his own weapons that meet things their own way go on as they do)
      if (!pj.custom) pj.health = 0;
      hitPen(ctx, Math.max(a + 4, Math.min(b - 4, pj.vel.x > 0 ? r : l)), pj.pos.y + pj.height / 2);
      if (penOpen(tr)) break;
    }
  }
  // (the canister knocked out: up out of the gap, down onto the front platform, a bounce, lying there)
  const k = pen.can;
  if (k) {
    k.t++;
    if (!k.down) {
      k.vy += 0.5; k.rx += k.vx; k.y += k.vy;
      if (k.y >= DECK && k.vy > 0) {
        k.y = DECK;
        if (k.vy > 3) { k.vy = -k.vy * 0.35; k.vx *= 0.5; playSound('clang', 0.5, 8); }
        else { k.down = true; k.vy = 0; playSound('thud', 0.4, 6); }
      }
      k.rx = Math.min(len - 12, k.rx);
    }
    // (touched: his for good, the card up)
    const cx = x + k.rx;
    if (p.health > 0 && !p.inCutscene && p.pos.x < cx + 12 && p.pos.x + p.width > cx - 12 && p.pos.y < k.y && p.pos.y + p.height > k.y - 50) {
      pen.can = null; pen.taken = true;
      for (let n = 0; n < 22; n++) state.particles.push({ pos: { x: cx + (Math.random() - 0.5) * 22, y: k.y - 26 + (Math.random() - 0.5) * 26 }, vel: { x: (Math.random() - 0.5) * 4, y: -1 - Math.random() * 3 }, life: 26, color: n % 3 ? '#F8C050' : '#FFF0A8', size: 2 + Math.random() * 2 });
      if (awardAmmo(AMMO_LAND, AMMO_ID)) { pen.card = openAmmoCard(); p.inCutscene = true; p.vel.x = 0; return true; }
    }
  }
  return false;
};

/** A hit on the bars at (hx, hy): the clang, sparks, a shudder; the lion roars at it; enough of them and they burst. */
const hitPen = (ctx: FrameContext, hx: number, hy: number) => {
  const { state } = ctx, tr = trainOf(state), pen = tr.pen;
  pen.hits++; pen.jit = 8;
  const before = Math.floor(((pen.hits - 1) * 4) / PEN_HITS), now = Math.floor((pen.hits * 4) / PEN_HITS);
  playSound('clang', 0.6, 4 + Math.random() * 6);
  if (now > before) { playSound('crunch', 0.5, 4); shakeScreen(state, 3, 2); }
  for (let n = 0; n < 7; n++) state.particles.push({ pos: { x: hx, y: hy }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 10 + Math.random() * 10, color: n % 2 ? '#FDE047' : '#FFF0A8', size: 2 });
  // (the lion in there doesn't care for it)
  if (tr.cage.roar <= 0 && Math.random() < 0.4) { tr.cage.roar = 54; playSound('roar', 0.5, -2); }
  if (pen.hits >= PEN_HITS) breakPen(ctx);
};

/** The bars burst: the lion out up onto the roof (one of the cast now), the canister knocked out, his line. */
const breakPen = (ctx: FrameContext) => {
  const { state, fx } = ctx, tr = trainOf(state), pen = tr.pen, cg = tr.cage;
  pen.broke = true;
  const x = carXNow(tr, CIRCUS), len = CARS[CIRCUS].len, mx = x + len / 2;
  playSound('crash', 1, -4); playSound('clang', 1, -8); playSound('roar', 1, -4);
  shakeScreen(state, 10, 5);
  for (let n = 0; n < 26; n++) state.particles.push({ pos: { x: mx + (Math.random() - 0.5) * 60, y: BARS_Y + Math.random() * (FLOOR_Y - BARS_Y) }, vel: { x: (Math.random() - 0.5) * 9, y: -2 - Math.random() * 6 }, life: 30 + Math.random() * 20, color: n % 3 === 0 ? '#FFF0A8' : n % 3 === 1 ? '#C8962E' : '#E8D8A0', size: 2 + Math.random() * 2, grav: 0.3 });
  fx.spawnDamageNumber({ x: mx, y: ROOF_Y - 40 }, "THE LION'S LOOSE!", true, '#FDE047');
  // (out through the gap and up onto the cage's roof, from where it was pacing)
  const e = makeKindEnemy(LION_KIND as EnemyKind, Math.max(x + END + 50, Math.min(x + len - END - 50, x + cg.rx)), ROOF_Y);
  e.pos.y = ROOF_Y - e.height - 2; e.vel.y = -7; e.vel.x = 0;
  e.facing = cg.facing; e.homeX = e.pos.x; e.aiState = 'burst'; e.aiTimer = 0; e.seen = true;
  state.enemies.push(e);
  // (the canister knocked out through the bent bars onto the front platform)
  pen.can = { rx: canRx(len), y: FLOOR_Y - 12, vx: (len - 20 - canRx(len)) / 38, vy: -8, t: 0, down: false };
  meatheadSays(state, pickLine(byPants(state, PEN_BREAK)), false);
};

// ---------------------------------------------------------------------------------------------------------------
// The lion out of its cage: one of the cast (a big cat, the wilds' cougar's way of fighting: sees him, roars (the
// tell), pounces at where he is; prowls after him; big game: a charge only dents it, the grabs beat it down)

export const LION_KIND = 'm2:fr_circuslion';
const SRC = 'm2:fr_circuslion';
/** The lion's drawing's scale (the cage's is 0.9, the one off the wreck 1.2). */
const ART = 1.05;
/** Its back's height (its own units): dead, flipped over onto its back by this. */
const DEAD_H = 46;

const setState = (e: Enemy, s: string) => { e.aiState = s; e.aiTimer = 0; };
const grounded = (e: Enemy) => e.vel.y === 0;
const sees = (state: GameState, e: Enemy, rx: number, ry: number) => {
  const p = mid(state.player), m = mid(e);
  return state.player.health > 0 && !state.player.inCutscene && !holdingOff(state) && Math.abs(p.x - m.x) < rx && Math.abs(p.y - m.y) < ry;
};
const strike = (ctx: FrameContext, e: Enemy, dmg: number, knock: number) => {
  const p = ctx.state.player;
  if (p.invincibilityTimer > 0 || p.health <= 0 || p.inCutscene) return false;
  if (p.pos.x < e.pos.x + e.width && p.pos.x + p.width > e.pos.x && p.pos.y < e.pos.y + e.height && p.pos.y + p.height > e.pos.y) {
    hurtPlayer(ctx, dmg, SRC, { x: (mid(p).x < mid(e).x ? -1 : 1) * knock, y: -4 });
    return true;
  }
  return false;
};

const lionAI = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = state.player;
  e.aiTimer = (e.aiTimer || 0) + 1;
  const pm = mid(p), em = mid(e), toward = (pm.x < em.x ? -1 : 1) as 1 | -1;
  switch (e.aiState) {
    case 'burst':
      // (out of the cage, up onto its roof: down, then a roar at him)
      if (e.aiTimer > 4 && grounded(e)) { setState(e, 'roar'); e.vel.x = 0; playSound('roar', 0.9, -2); shakeScreen(state, 4, 2); }
      break;
    case 'roar':
      e.vel.x = 0; e.facing = toward;
      if (e.aiTimer > 44) setState(e, 'prowl');
      break;
    case 'crouch':
      // (the tell: down on its haunches, roaring; then at where he is)
      e.vel.x = 0; e.facing = toward;
      if (e.aiTimer > 28) {
        if (!grounded(e) || !sees(state, e, 480, 400)) { setState(e, 'prowl'); break; }
        const dx = pm.x - em.x, dy = pm.y - (e.pos.y + e.height - 20);
        const t = Math.max(18, Math.min(40, Math.abs(dx) / 8));
        e.vel.x = Math.max(-10, Math.min(10, dx / t));
        e.vel.y = Math.max(-16, Math.min(-5, (dy - 0.5 * GRAVITY * t * t) / t));
        setState(e, 'pounce');
      }
      break;
    case 'pounce':
      strike(ctx, e, 20, 9);
      if (e.aiTimer > 4 && grounded(e)) setState(e, 'recover');
      break;
    case 'recover':
      if (grounded(e)) e.vel.x *= 0.82;
      if (e.aiTimer > 44) setState(e, 'prowl');
      break;
    default: {
      // (prowling: after him to a pounce's distance; a swipe if he's right on it)
      if (sees(state, e, 460, 320)) {
        e.facing = toward;
        const d = Math.abs(pm.x - em.x);
        e.vel.x = d > 170 ? toward * 2.6 : 0;
        if (!safeAhead(ctx, e, toward, 20)) e.vel.x = 0;
        if (d < 60) strike(ctx, e, 14, 7);
        if (e.aiTimer > 30 && d < 360 && grounded(e)) { setState(e, 'crouch'); playSound('roar', 0.55, 6); }
      } else {
        const home = e.homeX ?? e.pos.x;
        e.facing ??= -1;
        if (Math.abs(e.pos.x - home) > 80 || !safeAhead(ctx, e, e.facing, 14)) e.facing = (e.pos.x > home ? -1 : 1) as 1 | -1;
        e.vel.x = e.facing * 1.1;
      }
      break;
    }
  }
  return false;
};

/** The leap's frame by how it's moving (launched, rising, over the top, coming down): lion.ts's. */
const pounceFrame = (vy: number) => (vy < -5 ? 0 : vy < -1 ? 1 : vy < 3 ? 2 : 3);

/** Drawn at its feet's middle, facing right (the engine turns it): the circus lion's own poses (lionArt.ts). Dead,
 *  belly up (flipped, never turned: the stamp holds). */
const drawLion = (c: Ctx, e: Enemy, f: number) => {
  if (e.health <= 0) {
    // (belly up, tipped so the mane's head end lies on the deck: painted the once flipped (still()), put down turned)
    c.save(); c.translate(0, -6); c.rotate(-0.28);
    still(c, 'tr-lion-dead', -130, -70, 260, 135, g => { g.translate(0, -DEAD_H * ART); g.scale(1, -1); drawCircusLion(g, 0, 0, 1, 0, 'stand', { s: ART }); });
    c.restore();
    return;
  }
  const st = e.aiState ?? 'prowl';
  let pose: LionPose = 'stand', t = f, k = 0;
  if (st === 'burst' || st === 'pounce') { pose = 'pounce'; k = pounceFrame(e.vel.y); }
  else if (st === 'roar' || st === 'crouch') { pose = 'roar'; k = Math.floor(Math.min(53, (e.aiTimer ?? 0) * (st === 'crouch' ? 2 : 1.2)) / 9); }
  else if (st === 'recover') pose = (e.aiTimer ?? 0) < 10 ? 'land' : 'stand';
  else if (Math.abs(e.vel.x) > 2) pose = 'run';
  else if (Math.abs(e.vel.x) > 0.3) { pose = 'walk'; t = ((e.facing ?? 1) > 0 ? e.pos.x : -e.pos.x) / ART; }
  drawCircusLion(c, 0, 0, 1, t, pose, { s: ART, k });
};

registerM2Kind({ kind: LION_KIND, stats: { w: 100, h: 56, hp: 165, contact: 17, mass: 170 }, ai: lionAI, draw: drawLion, head: { x: 44, y: -46, r: 12 }, gender: 'n', grab: 'body' });
