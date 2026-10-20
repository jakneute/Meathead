// The crowd round the hub: busy. Park guests by the hundred, every one of them their own person by seed (men, women,
// kids; every skin, build and hair: temple/people.ts), going both ways along the walk and along the promenade behind
// it: tourists with their maps open, families, a kid with a balloon, a dad pushing a stroller, somebody with an ice
// cream. Queues at the portals. People on the benches. Vendors at their carts (balloons, popcorn steaming, ice cream,
// churros). Costumed characters posing for photos with families, the flash going off. A parade float going round the
// promenade, dancers after it. Sweepers, security. A guy throwing up by a trash can. Pigeons pecking along the front
// (off up if he walks at them), lost balloons going up.
//
// And the cast (../cast/people.ts) standing about by the portals as they always were, chatting: later some of them
// will talk to him.
//
// Cheap: every guest is a stamp (a few frames each: a walk cycle, a breath, a wave), put down with one drawImage;
// only what's on screen is drawn; nothing per pixel.

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y } from '../../m1/constants';
import { stamp } from '../../m1/game/render/stamp';
import { CAST, type CastMember } from '../cast/people';
import { drawPerson, lookOf, type Pose } from '../adventure/temple/people';
import { type Ctx, INK, mix, hash, box, inked } from './kit';
import { LANDS, SPOTS, HUB_SLOTS, type Land } from './lands';
import { HUB, HUB_CIRC, slotX, seamX, ROW, personScale } from './geometry';
import { queueSpan, paintQueueRail } from './gates';
import { stretchOf } from './stretch';
import { paintMascot, paintCart, paintBench, paintBin, paintFloat, type Mascot, type Cart } from './props';
import { PATH } from './geometry';

// ---------------------------------------------------------------------------------------------------------------
// The cast, standing about by the portals (as before)

const STANDING: [id: string, slot: number, dx: number, facing: 1 | -1][] = [
  ['chuck', 9, -215, 1], ['gus', 9, -178, -1],
  ['artie', 8, -205, 1], ['jj', 8, -168, -1], ['larry', 8, 185, -1],
  ['glenn', 0, -198, 1], ['charlotte', 0, -160, -1], ['gary', 0, 182, 1],
  ['sid', 1, -200, 1], ['susan', 1, -158, -1], ['baby', 1, 196, -1],
  ['lilly', 2, -192, 1], ['anna', 2, -156, -1], ['stella', 2, 176, -1],
  ['ed', 3, -180, 1],
  ['jenny', 4, -196, 1], ['matt', 4, -158, -1],
  ['tiffanie', 5, -198, 1], ['billie', 5, -162, -1], ['bev', 5, 180, 1],
  ['lucille', 6, -184, 1],
  ['ruth', 7, 172, -1],
];
const CAST_SCALE = 1.15;
interface Placed { who: CastMember; x: number; facing: 1 | -1; seed: number; partner: number }
const PLACED: Placed[] = STANDING.map(([id, slot, dx, facing], i) => ({ who: CAST.find(m => m.id === id)!, x: slotX(slot) + dx, facing, seed: i * 53, partner: -1 }));
PLACED.forEach((p, i) => { const q = PLACED[i + 1]; if (q && p.facing === 1 && q.facing === -1 && q.x - p.x < 60) { p.partner = i + 1; q.partner = i; } });

// ---------------------------------------------------------------------------------------------------------------
// A guest, stamped: who (seed), what they're doing (pose and what they've got), which frame of it

type Extra = 'none' | 'map' | 'balloon' | 'stroller' | 'icecream' | 'camera' | 'broom' | 'guard' | 'vendor' | 'kid' | 'drum' | 'puke';
const BALLOON = ['#EF4444', '#3B82F6', '#FDE047', '#22C55E', '#EC4899', '#A855F7', '#F97316'];

/** Who's who, a kid's look (smaller, brighter). */
const kidLook = (seed: number) => ({ ...lookOf(seed), heavy: false, face: 0, bald: false, shirt: BALLOON[seed % BALLOON.length], kid: true });

/** The walk's frames: the f that puts drawPerson's stride where each of four frames wants it. */
const strideF = (seed: number, fi: number) => ((fi * Math.PI) / 2 - seed) / 0.25;

const paintGuest = (g: Ctx, seed: number, pose: Pose, fi: number, extra: Extra) => {
  const walk = pose === 'walk';
  const f = walk ? strideF(seed, fi) : fi * 40 + 3;
  const bob = walk && fi % 2 ? -1 : 0;
  if (extra === 'kid') { g.save(); g.scale(0.62, 0.62); drawPerson(g, { seed, outfit: 'guest', f, pose, look: kidLook(seed), shorts: true, mood: 'happy' }); g.restore(); return; }
  g.save(); g.translate(0, bob);
  const L = lookOf(seed);
  const outfit = extra === 'broom' || extra === 'guard' ? 'guest' : 'guest';
  const look = extra === 'broom' ? { shirt: '#F8FAFC', pants: '#E7E5E4' } : extra === 'guard' ? { shirt: '#1E3A8A', pants: '#0F172A' } : extra === 'vendor' ? { shirt: '#F8FAFC' } : undefined;
  if (extra === 'stroller') {
    // (the stroller out in front: its canopy, the baby's feet, the handle up to his hands)
    const sx = 22 + bob;
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(10, -34); g.lineTo(sx + 2, -24); g.stroke();
    inked(g, () => { g.moveTo(sx, -24); g.lineTo(sx + 26, -24); g.lineTo(sx + 22, -10); g.lineTo(sx + 4, -10); g.closePath(); }, '#1E3A8A');
    inked(g, () => { g.moveTo(sx + 2, -24); g.quadraticCurveTo(sx + 6, -42, sx + 22, -36); g.lineTo(sx + 14, -24); g.closePath(); }, '#38BDF8');
    for (const wx of [sx + 6, sx + 22]) inked(g, () => g.arc(wx, -4, 4, 0, Math.PI * 2), '#27272A');
  }
  drawPerson(g, { seed, outfit, f, pose, look, shorts: extra === 'map' || (extra === 'none' && seed % 4 === 1), mood: extra === 'puke' ? 'shocked' : seed % 5 === 0 ? 'happy' : 'bored' });
  const hy = -66;
  switch (extra) {
    case 'map':
      // (a tourist: the park map held open in front of him, a bucket hat, a camera on his chest)
      inked(g, () => g.rect(-6, -86, 26, 18), '#F8FAFC'); box(g, -5, -85, 12, 16, '#BBF7D0'); box(g, 7, -85, 12, 16, '#FDE68A'); box(g, 6, -86, 1, 18, '#A8A29E'); box(g, -3, -80, 18, 2, '#DC2626');
      inked(g, () => { g.moveTo(-9, hy - 6); g.lineTo(11, hy - 6); g.lineTo(13, hy - 2); g.lineTo(-11, hy - 2); g.closePath(); }, '#D6C7A1'); inked(g, () => g.roundRect(-6, hy - 13, 14, 8, 3), '#D6C7A1');
      break;
    case 'balloon': {
      const by = -124 + (fi % 2) * 2;
      g.strokeStyle = '#57534E'; g.lineWidth = 1; g.beginPath(); g.moveTo(12, -34); g.quadraticCurveTo(18, -80, 10, by + 10); g.stroke();
      const col = BALLOON[seed % BALLOON.length];
      inked(g, () => g.ellipse(10, by, 10, 12, 0, 0, Math.PI * 2), col); box(g, 5, by - 6, 3, 4, mix(col, '#FFFFFF', 0.6));
      break;
    }
    case 'icecream': inked(g, () => { g.moveTo(9, -36); g.lineTo(15, -36); g.lineTo(12, -26); g.closePath(); }, '#D6A35C'); inked(g, () => g.arc(12, -39, 4, 0, Math.PI * 2), ['#FBCFE8', '#FEF3C7', '#92400E'][seed % 3]); break;
    case 'camera': inked(g, () => g.rect(L.heavy ? 14 : 10, -68, 10, 7), '#27272A'); box(g, L.heavy ? 22 : 18, -66, 3, 3, '#93C5FD'); break;
    case 'broom': {
      // (the custodian: the white uniform, the long broom, the pan)
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(12, -40); g.lineTo(24 + (fi % 2) * 4, -2); g.stroke(); g.strokeStyle = '#A16207'; g.lineWidth = 1.5; g.stroke();
      inked(g, () => g.rect(20 + (fi % 2) * 4, -6, 10, 6), '#57534E');
      inked(g, () => { g.moveTo(-14, -3); g.lineTo(-4, -3); g.lineTo(-4, -10); g.closePath(); }, '#DC2626');
      inked(g, () => { g.moveTo(-8, hy - 4); g.quadraticCurveTo(1, hy - 14, 10, hy - 4); g.lineTo(14, hy - 3); g.lineTo(-8, hy - 2); g.closePath(); }, '#F8FAFC');
      break;
    }
    case 'guard':
      // (security: the cap, the badge, the radio)
      inked(g, () => { g.moveTo(-8, hy - 4); g.quadraticCurveTo(1, hy - 14, 10, hy - 4); g.lineTo(15, hy - 3); g.lineTo(-8, hy - 2); g.closePath(); }, '#1E3A8A');
      box(g, 0, hy - 9, 3, 3, '#FACC15'); box(g, 4, -50, 4, 4, '#FACC15'); inked(g, () => g.rect(-12, -46, 4, 8), '#18181B');
      break;
    case 'vendor': inked(g, () => g.roundRect(-8, hy - 12, 18, 6, 2), '#F8FAFC'); box(g, -6, -50, 14, 18, '#F8FAFC'); break;
    case 'drum': inked(g, () => g.ellipse(14, -36, 10, 10, 0, 0, Math.PI * 2), '#DC2626'); box(g, 6, -38, 16, 2, '#FDE68A'); box(g, 20, -50 + (fi % 2) * 6, 2, 10, '#F5F5F4'); break;
    case 'puke': break;
  }
  g.restore();
};

/**
 * The guests' own sprite cache: each look, pose, frame and prop painted once (facing right, at the size it's shown
 * at on the screen's pixels), then put down with one drawImage, mirrored by the transform when they're facing left
 * (one paint does both ways). Through a zoom it's the same picture scaled (smoothed), painted afresh only once it's
 * well off the size it was painted at.
 */
interface Sprite { c: HTMLCanvasElement; P: number }
const SPRITES = new Map<string, Sprite>();
const BOX = { x0: -50, y0: -150, w: 110, h: 156 };
/** How big a guest is drawn at each row (a few sizes, not one per pixel of depth: fewer pictures to paint). */
const sizeAt = (y: number) => { const s = personScale(y); return s < 0.66 ? 0.62 : s < 0.72 ? 0.68 : s < 0.77 ? 0.74 : 0.8; };
const putSprite = (c: Ctx, key: string, x: number, y: number, s: number, facing: 1 | -1, paint: (g: Ctx) => void) => {
  const m = c.getTransform(), dev = Math.hypot(m.a, m.b), want = Math.round(dev * s * 8) / 8;
  let sp = SPRITES.get(key);
  if (typeof document === 'undefined') return;
  if (!sp || Math.abs(sp.P - want) / want > 0.35) {
    const cv = sp?.c ?? document.createElement('canvas');
    cv.width = Math.ceil(BOX.w * want) + 2; cv.height = Math.ceil(BOX.h * want) + 2;
    const g = cv.getContext('2d')!;
    g.setTransform(want, 0, 0, want, -BOX.x0 * want + 1, -BOX.y0 * want + 1);
    g.imageSmoothingEnabled = false;
    paint(g);
    sp = { c: cv, P: want };
    SPRITES.set(key, sp);
  }
  // (one unit, one device pixel at the size it was painted at: mirrored about the feet when facing left)
  const k = s / sp.P;
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.scale(facing * k, k);
  const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = Math.abs(sp.P - want) > 0.01;
  c.drawImage(sp.c, BOX.x0 * sp.P - 1, BOX.y0 * sp.P - 1);
  c.imageSmoothingEnabled = sm;
  c.restore();
};

/** The walkers' faces: a pool of people (a lap's worth of guests drawn from it never shows the same one twice on screen). */
const LOOKS = 56;
const lookSeed = (seed: number) => 1000 + (Math.abs(Math.round(seed)) % LOOKS) * 37;

/** A guest, put down: feet at (x, y), facing; sized for how far back they are. */
const guest = (c: Ctx, x: number, y: number, facing: 1 | -1, seed: number, pose: Pose, fi: number, extra: Extra = 'none') => {
  const s = sizeAt(y);
  // (a shadow under them)
  c.fillStyle = 'rgba(60, 40, 20, 0.22)'; c.fillRect(Math.round(x - 12 * s), Math.round(y) - 1, Math.round(24 * s), 2);
  putSprite(c, `${seed}|${pose}|${fi}|${extra}|${s}`, x, y, s, facing, g => paintGuest(g, seed, pose, fi, extra));
};

// ---------------------------------------------------------------------------------------------------------------
// Costumed characters, stamped by frame

const MASCOT_OF: Record<string, Mascot> = { space: 'robot', frontier: 'beaver', spooky: 'skeleton', cartoon: 'dog', america: 'bear', hollywood: 'star', fantasy: 'knight', adventure: 'parrot', foreign: 'globe', staff: 'bear' };
const mascot = (c: Ctx, x: number, y: number, facing: 1 | -1, kind: Mascot, fi: number) => {
  const s = Math.round(personScale(y) * 50) / 50;
  c.save(); c.translate(Math.round(x), Math.round(y));
  c.fillStyle = 'rgba(60, 40, 20, 0.22)'; c.fillRect(-16 * s, -1, 32 * s, 2);
  c.scale(s * facing, s);
  stamp(c, `hubM|${kind}|${fi}`, -50, -130, 100, 136, g => paintMascot(g, kind, fi));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Props: benches, carts, a trash can, the parade float

/** The balloon man's bunch (live: bobbing). */
const balloonBunch = (c: Ctx, x: number, y: number, s: number, f: number) => {
  for (let k = 0; k < 9; k++) {
    const bx = x + (k % 3 - 1) * 14 * s + Math.sin(f * 0.05 + k) * 2 * s, by = y - (100 + Math.floor(k / 3) * 14 + (k % 2) * 6) * s + Math.cos(f * 0.04 + k) * 2 * s;
    c.strokeStyle = 'rgba(87, 83, 78, 0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 88 * s); c.lineTo(bx, by + 10 * s); c.stroke();
    inked(c, () => c.ellipse(bx, by, 8 * s, 10 * s, 0, 0, Math.PI * 2), BALLOON[k % BALLOON.length]);
    c.fillStyle = mix(BALLOON[k % BALLOON.length], INK, 0.3); c.beginPath(); c.ellipse(bx + 2 * s, by + 2 * s, 5 * s, 7 * s, 0, -0.6, 1.9); c.fill();
    box(c, bx - 4 * s, by - 5 * s, 2, 3, '#FFFFFF'); box(c, bx - 1, by + 10 * s, 2, 2, mix(BALLOON[k % BALLOON.length], INK, 0.4));
  }
};
const cart = (c: Ctx, x: number, y: number, kind: Cart, f: number) => {
  const s = Math.round(personScale(y) * 50) / 50;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s);
  stamp(c, `hubC|${kind}`, -50, -130, 100, 136, g => paintCart(g, kind));
  c.restore();
  if (kind === 'balloons') balloonBunch(c, x, y, s, f);
  if (kind === 'popcorn' || kind === 'churros') for (let k = 0; k < 3; k++) {
    // (steam off it)
    const t = ((f * 0.6 + k * 40) % 120) / 120, px = x + (k - 1) * 8 * s + Math.sin(f * 0.04 + k) * 4, py = y - (kind === 'popcorn' ? 92 : 64) * s - t * 40;
    c.fillStyle = `rgba(255, 255, 255, ${(0.55 * (1 - t)).toFixed(2)})`; c.beginPath(); c.arc(px, py, (3 + t * 6) * s, 0, Math.PI * 2); c.fill();
  }
};
const bench = (c: Ctx, x: number, y: number) => {
  const s = Math.round(personScale(y) * 50) / 50;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s); stamp(c, 'hubBench', -40, -40, 80, 44, paintBench); c.restore();
};
const bin = (c: Ctx, x: number, y: number) => { const s = Math.round(personScale(y) * 50) / 50; c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(s, s); stamp(c, 'hubBin', -16, -40, 32, 44, paintBin); c.restore(); };

// ---------------------------------------------------------------------------------------------------------------
// Who's where (built once, deterministically)

interface Walker { x0: number; y: number; v: number; seed: number; extra: Extra; mid: boolean }
const WALKERS: Walker[] = [];
{
  const extras: Extra[] = ['none', 'none', 'none', 'map', 'balloon', 'none', 'stroller', 'icecream', 'camera', 'none', 'kid', 'none', 'map', 'none', 'kid', 'icecream'];
  for (let i = 0; i < 80; i++) {
    const seed = lookSeed(i * 7 + 3), dir = hash(i * 3.1) < 0.5 ? -1 : 1;
    const extra = extras[i % extras.length];
    WALKERS.push({ x0: HUB.x0 + hash(i * 7.7) * HUB_CIRC, y: ROW.walk0 + 8 + hash(i * 1.3) * (ROW.walk1 - ROW.walk0 - 8), v: dir * (0.45 + hash(i * 2.9) * 0.45) * (extra === 'kid' ? 1.15 : 1), seed, extra, mid: false });
    // (a family: a kid along with the grown-up)
    if (extra === 'stroller' || i % 9 === 4) WALKERS.push({ x0: WALKERS[WALKERS.length - 1].x0 + dir * 18, y: WALKERS[WALKERS.length - 1].y + 2, v: WALKERS[WALKERS.length - 1].v, seed: seed + 5, extra: 'kid', mid: false });
  }
  for (let i = 0; i < 64; i++) {
    const seed = lookSeed(i * 11 + 5), dir = hash(i * 5.3) < 0.5 ? -1 : 1;
    WALKERS.push({ x0: HUB.x0 + hash(i * 3.3) * HUB_CIRC, y: ROW.mid0 + hash(i * 4.1) * (ROW.mid1 - ROW.mid0), v: dir * (0.35 + hash(i * 6.1) * 0.35), seed, extra: (['none', 'none', 'map', 'balloon', 'kid', 'none', 'camera'] as Extra[])[i % 7], mid: true });
  }
  // (the sweepers and a guard doing the rounds)
  WALKERS.push({ x0: slotX(2), y: ROW.walk1 - 4, v: 0.18, seed: 77, extra: 'broom', mid: false });
  WALKERS.push({ x0: slotX(7), y: ROW.walk0 + 10, v: -0.16, seed: 91, extra: 'broom', mid: false });
  WALKERS.push({ x0: slotX(5), y: ROW.walk0 + 14, v: -0.3, seed: 133, extra: 'guard', mid: false });
}

/** Everything standing about (a guest, a mascot, a prop), at a feet y; drawn in order back to front. */
type Thing = { x: number; y: number; draw: (c: Ctx, x: number, f: number) => void };
const THINGS: Thing[] = [];
const MID_THINGS: Thing[] = [];
{
  const add = (x: number, y: number, draw: Thing['draw']) => THINGS.push({ x, y, draw });
  for (let i = 0; i < HUB_SLOTS; i++) {
    const spot = SPOTS[i], cx = slotX(i), id = stretchOf(i), sd = i * 101;
    if (spot.kind === 'land') {
      const land = LANDS[spot.land], [q0, q1] = queueSpan(cx);
      // The queue: the rail behind them, the line in it facing the portal, the rail in front
      const back = ROW.fence + 8, front = ROW.fence + 22;
      THINGS.push({ x: cx, y: back, draw: (c, x) => stampRail(c, land, x, back, false) });
      for (let k = 0; k < 6; k++) {
        const qs = sd + k * 13, qx = q0 + 12 + k * ((q1 - q0 - 16) / 6);
        THINGS.push({ x: qx, y: back + 6 + (k % 2), draw: (c, x, f) => {
          // (shuffling: a breath now and then; somebody turning to look round)
          const fi = Math.floor((f + qs * 7) / 90) % 2, look = ((f + qs * 13) % 600) < 80 ? -1 : 1;
          guest(c, x + (((f + qs) >> 8) % 2), back + 6 + (k % 2), look as 1 | -1, qs, k === 2 ? 'point' : 'stand', fi, k === 4 ? 'kid' : k === 1 ? 'camera' : 'none');
        } });
      }
      THINGS.push({ x: cx, y: front, draw: (c, x) => stampRail(c, land, x, front, true) });
    }
    if (id === 'staff') {
      // (by the back of the building: a guard by the fence, arms folded, and nobody else)
      add(cx - 230, ROW.walk0 + 2, (c, x, f) => guest(c, x, ROW.walk0 + 2, 1, 4421, 'stand', Math.floor(f / 120) % 2, 'guard'));
      continue;
    }
    // A bench, two on it (chatting, or one on a phone)
    const bx = cx + 112 + (i % 2) * 20;
    add(bx, ROW.walk0 - 2, (c, x) => bench(c, x, ROW.walk0 - 2));
    add(bx - 8, ROW.walk0 - 1, (c, x, f) => guest(c, x, ROW.walk0 - 8, 1, sd + 501, 'sit', Math.floor((f + sd) / 100) % 2));
    if (i % 3) add(bx + 10, ROW.walk0 - 1, (c, x, f) => guest(c, x, ROW.walk0 - 8, -1, sd + 502, 'sit', Math.floor((f + sd + 50) / 100) % 2));
    // A vendor at their cart (at the seam's little plaza after this stretch)
    const kinds: Cart[] = ['balloons', 'popcorn', 'icecream', 'churros'];
    const ck = kinds[i % 4], vx = seamX(i + 1) - 30 - (i % 2) * 20;
    if (stretchOf(i + 1) !== 'staff') {
      add(vx + 18, ROW.walk0 + 3, (c, x, f) => guest(c, x, ROW.walk0 + 3, -1, sd + 601, 'stand', Math.floor(f / 80) % 2, 'vendor'));
      add(vx, ROW.walk0 + 6, (c, x, f) => cart(c, x, ROW.walk0 + 6, ck, f));
      // (somebody buying)
      add(vx - 26, ROW.walk0 + 8, (c, x, f) => guest(c, x, ROW.walk0 + 8, 1, sd + 602, i % 2 ? 'point' : 'stand', Math.floor(f / 70) % 2, 'none'));
    }
    // A costumed character posing for a photo with a family; the photographer crouched, the flash going off
    if (id !== 'america') {
      const mx = cx + 196, my = ROW.walk0 + 4, m = MASCOT_OF[id];
      add(mx, my, (c, x, f) => mascot(c, x, my, -1, m, Math.floor(f / 24) % 2));
      add(mx - 20, my + 1, (c, x, f) => guest(c, x, my + 1, 1, sd + 701, 'cheer', Math.floor(f / 24) % 2));
      add(mx - 6, my + 3, (c, x, f) => guest(c, x, my + 3, 1, sd + 702, 'cheer', Math.floor(f / 24 + 1) % 2, 'kid'));
      add(mx - 60, my + 10, (c, x, f) => {
        guest(c, x, my + 10, 1, sd + 703, 'photo', 0, 'none');
        const t = (f + sd) % 150;
        if (t < 5) { c.fillStyle = `rgba(255, 255, 255, ${(0.9 - t * 0.16).toFixed(2)})`; c.beginPath(); c.arc(x + 14, my - 40, 10 + t * 4, 0, Math.PI * 2); c.fill(); }
      });
    }
    // Two more stood about, chatting (one points at something)
    add(cx - 112 + (i % 3) * 8, ROW.walk1 - 6, (c, x, f) => guest(c, x, ROW.walk1 - 6, 1, sd + 801, (f + sd) % 400 < 120 ? 'point' : 'stand', Math.floor(f / 60) % 2, i % 2 ? 'map' : 'none'));
    add(cx - 88 + (i % 3) * 8, ROW.walk1 - 5, (c, x, f) => guest(c, x, ROW.walk1 - 5, -1, sd + 802, 'stand', Math.floor((f + 30) / 60) % 2, i % 3 === 0 ? 'balloon' : 'none'));
    // On the promenade behind: a few stood looking at things, a mascot or two signing autographs
    MID_THINGS.push({ x: cx - 120, y: ROW.mid1, draw: (c, x, f) => guest(c, x, ROW.mid1, 1, sd + 901, 'stand', Math.floor(f / 90) % 2, 'camera') });
    MID_THINGS.push({ x: cx - 100, y: ROW.mid1, draw: (c, x, f) => guest(c, x, ROW.mid1, -1, sd + 902, 'point', Math.floor(f / 90) % 2) });
    MID_THINGS.push({ x: cx + 80, y: ROW.mid0 + 2, draw: (c, x, f) => guest(c, x, ROW.mid0 + 2, 1, sd + 903, 'stand', Math.floor(f / 90) % 2, 'kid') });
  }
  // The guy throwing up by the trash can (by the snacks, of course)
  const px = seamX(1) + 30;
  THINGS.push({ x: px + 20, y: ROW.walk0 + 2, draw: (c, x) => bin(c, x, ROW.walk0 + 2) });
  THINGS.push({ x: px, y: ROW.walk0 + 3, draw: (c, x, f) => puker(c, x, ROW.walk0 + 3, f) });
}
const stampRail = (c: Ctx, land: Land, x: number, y: number, sign: boolean) => {
  c.save(); c.translate(x, 0);
  stamp(c, `hubQ|${land.id}|${y}|${sign}`, -170, y - 50, 140, 54, g => paintQueueRail(g, land, 0, y, sign));
  c.restore();
};
/** Bent double over the bin, heaving; every few seconds, it comes up. */
const puker = (c: Ctx, x: number, y: number, f: number) => {
  const t = f % 200, heave = t > 120 && t < 170;
  const s = Math.round(personScale(y) * 50) / 50;
  c.save(); c.translate(Math.round(x), Math.round(y));
  c.fillStyle = 'rgba(60, 40, 20, 0.22)'; c.fillRect(-12 * s, -1, 24 * s, 2);
  c.scale(s, s);
  c.rotate(0.55 + (heave ? 0.12 * Math.sin(t * 0.6) : 0));
  drawPerson(c, { seed: 5150, outfit: 'guest', f: heave ? 10 : 200, pose: 'stand', mood: heave ? 'shocked' : 'bored', look: { skin: '#A8C890' } });
  c.restore();
  if (heave) {
    // (it comes up: a stream arcing into the bin, splatter)
    const k = (t - 120) / 50, hx = x + 30 * s, hy = y - 48 * s;
    c.strokeStyle = '#A3B53A'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx, hy); c.quadraticCurveTo(hx + 14 * s, hy - 4, hx + 20 * s, y - 30 * s); c.stroke();
    c.strokeStyle = '#D9E07A'; c.lineWidth = 1; c.stroke();
    for (let j = 0; j < 3; j++) box(c, hx + 16 * s + Math.sin(f + j) * 4, y - 30 * s + j * 3 + k * 4, 2, 2, '#A3B53A');
  }
  box(c, x + 14 * s, y - 1, 10 * s, 2, '#A3B53A');
};

// ---------------------------------------------------------------------------------------------------------------
// The parade: two floats going round the promenade, dancers after each

const PARADE = [{ x0: HUB.x0 + 200, kind: 0 }, { x0: HUB.x0 + 200 + HUB_CIRC / 2, kind: 1 }];
const PARADE_V = 0.4;
const drawParade = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame, y = ROW.mid1 - 1, s = Math.round(personScale(y) * 50) / 50;
  for (const p of PARADE) {
    const x = HUB.x0 + ((((p.x0 - HUB.x0 + f * PARADE_V) % HUB_CIRC) + HUB_CIRC) % HUB_CIRC);
    each(x, 220, xx => {
      // (the dancers behind it, the drummer)
      for (let k = 0; k < 4; k++) guest(c, xx - 110 - k * 22, y - (k % 2), 1, 6100 + p.kind * 10 + k, k === 3 ? 'walk' : 'cheer', k === 3 ? Math.floor(f / 8) % 4 : Math.floor((f + k * 6) / 12) % 2, k === 3 ? 'drum' : 'none');
      c.save(); c.translate(Math.round(xx), y); c.scale(s, s);
      stamp(c, `hubF|${p.kind}|${Math.floor(f / 20) % 2}`, -100, -150, 200, 154, g => paintFloat(g, p.kind, Math.floor(f / 20) % 2));
      c.restore();
      // (the bear up top, waving)
      mascot(c, xx + 6 * s, y - (p.kind === 0 ? 100 : 36) * s + 2, 1, p.kind === 0 ? 'bear' : 'robot', Math.floor(f / 18) % 2);
      // (streamers coming off it)
      for (let k = 0; k < 6; k++) { const a = f * 0.1 + k; box(c, xx - 60 * s + k * 22 * s, y - 60 * s + Math.sin(a) * 6, 2, 4, BALLOON[k % BALLOON.length]); }
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const wrapX = (x: number) => HUB.x0 + ((((x - HUB.x0) % HUB_CIRC) + HUB_CIRC) % HUB_CIRC);

/** The promenade's crowd (behind the portals and the fence): its walkers, those stood about, the parade. */
export const drawCrowdMid = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame;
  const list: [number, number, () => void][] = [];
  for (const w of WALKERS) {
    if (!w.mid) continue;
    const x = wrapX(w.x0 + w.v * f);
    each(x, 40, xx => list.push([w.y, xx, () => guest(c, xx, w.y, w.v > 0 ? 1 : -1, w.seed, 'walk', Math.floor((f * Math.abs(w.v) * 0.6 + w.seed) / 5) % 4, w.extra)]));
  }
  for (const t of MID_THINGS) each(t.x, 40, xx => list.push([t.y, xx, () => t.draw(c, xx, f)]));
  list.sort((a, b) => a[0] - b[0]);
  for (const [, , d] of list) d();
  drawParade(c, state, each);
};

/** The clear ground in front of each portal (nobody stands or walks across its path: the way in reads at a glance):
 *  half its width. The walk's walkers go back and forth between two portals' clear ground, turning at its edge. */
const CLEAR = PATH.near + 16;
const PORTALS = SPOTS.map((s, i) => (s.kind === 'land' ? slotX(i) : null)).filter((x): x is number => x !== null);
const segOf = (x0: number) => {
  const u = wrapX(x0);
  let L = PORTALS[PORTALS.length - 1] - HUB_CIRC, R = PORTALS[0];
  for (let k = 0; k < PORTALS.length; k++) { const a = PORTALS[k], b = k + 1 < PORTALS.length ? PORTALS[k + 1] : PORTALS[0] + HUB_CIRC; if (u >= a && u < b) { L = a; R = b; } }
  if (u < PORTALS[0]) { L = PORTALS[PORTALS.length - 1] - HUB_CIRC; R = PORTALS[0]; }
  return { a: L + CLEAR, span: R - L - CLEAR * 2, u };
};
const SEG = new Map<Walker, { a: number; span: number; u: number }>();
/** Where a walk walker is now, and which way it's going. */
const walkAt = (w: Walker, f: number): [number, 1 | -1] => {
  let sg = SEG.get(w); if (!sg) { sg = segOf(w.x0); SEG.set(w, sg); }
  const pos = sg.u - sg.a + w.v * f, P = sg.span * 2, ph = ((pos % P) + P) % P;
  return [wrapX(sg.a + (ph < sg.span ? ph : P - ph)), ((w.v > 0 ? 1 : -1) * (ph < sg.span ? 1 : -1)) as 1 | -1];
};

/** The walk's crowd (in front of the fence, behind him): walkers, the queues, the benches, the carts, the mascots. */
export const drawCrowdWalk = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame;
  const list: [number, () => void][] = [];
  for (const w of WALKERS) {
    if (w.mid) continue;
    const [x, dir] = walkAt(w, f);
    each(x, 50, xx => list.push([w.y, () => guest(c, xx, w.y, dir, w.seed, 'walk', Math.floor((f * Math.abs(w.v) * 0.6 + w.seed) / 5) % 4, w.extra)]));
  }
  for (const t of THINGS) each(t.x, 180, xx => list.push([t.y, () => t.draw(c, xx, f)]));
  list.sort((a, b) => a[0] - b[0]);
  for (const [, d] of list) d();
};

/** The cast, stood about by the portals (on the walk with him). */
export const drawCast = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame;
  PLACED.forEach((p, i) => each(p.x, 40, x => {
    const turn = Math.floor((f + (p.partner >= 0 ? Math.min(i, p.partner) * 97 : p.seed)) / 170);
    const quiet = (f + i * 31) % 170 > 150;
    const talk = p.who.id === 'billie' || (p.partner >= 0 && !quiet && turn % 2 === (i < p.partner ? 0 : 1));
    c.fillStyle = 'rgba(60, 40, 20, 0.25)'; c.beginPath(); c.ellipse(x, GROUND_Y + 1, 14 * CAST_SCALE, 3, 0, 0, Math.PI * 2); c.fill();
    c.save();
    c.translate(Math.round(x), GROUND_Y);
    c.scale(CAST_SCALE * p.facing, CAST_SCALE);
    p.who.draw(c, f + p.seed, talk);
    c.restore();
  }));
};

// ---------------------------------------------------------------------------------------------------------------
// Pigeons along the front, and the lost balloons going up

interface Flock { x: number; n: number; flushedAt: number }
const FLOCKS: Flock[] = Array.from({ length: 14 }, (_, i) => ({ x: HUB.x0 + (i + 0.3 + hash(i * 9.1) * 0.4) * (HUB_CIRC / 14), n: 4 + (i % 4), flushedAt: -9999 }));
export const drawPigeons = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame, p = state.player, px = p.pos.x + p.width / 2;
  for (const fl of FLOCKS) each(fl.x, 120, x => {
    // (he walks at them: up they go, round, and back down a while later)
    if (Math.abs(px - x) < 70 && f - fl.flushedAt > 360) fl.flushedAt = f;
    const up = f - fl.flushedAt;
    for (let k = 0; k < fl.n; k++) {
      const bx0 = x + (k - fl.n / 2) * 13 + hash(k + fl.x) * 6, by0 = GROUND_Y + 8 + (k % 3) * 6;
      let bx = bx0, by = by0, flying = false;
      if (up < 300) {
        flying = true;
        const t = up / 300, away = Math.sin(t * Math.PI);
        bx = bx0 + (k % 2 ? 1 : -1) * away * 140 + Math.sin(up * 0.1 + k) * 8; by = by0 - away * 200 - k * 6 * away;
      }
      const flap = flying ? ((f >> 2) + k) % 2 : 0, peck = !flying && ((f >> 4) + k * 3) % 5 === 0;
      c.fillStyle = INK; c.fillRect(Math.round(bx) - 5, Math.round(by) - 5, 10, 6);
      c.fillStyle = '#78716C'; c.fillRect(Math.round(bx) - 4, Math.round(by) - 4, 8, 4);
      c.fillStyle = '#A8A29E'; c.fillRect(Math.round(bx) - 3, Math.round(by) - 4, 4, 1);
      const hx = Math.round(bx) + (k % 2 ? 4 : -6);
      c.fillStyle = '#57534E'; c.fillRect(hx, Math.round(by) - (peck ? 2 : 7), 3, 3);
      c.fillStyle = '#4ADE80'; c.fillRect(hx, Math.round(by) - (peck ? 0 : 4), 3, 1);
      if (flying) { c.fillStyle = '#57534E'; c.fillRect(Math.round(bx) - 8, Math.round(by) - (flap ? 9 : 3), 6, 2); c.fillRect(Math.round(bx) + 2, Math.round(by) - (flap ? 9 : 3), 6, 2); }
      else { c.fillStyle = '#F97316'; c.fillRect(Math.round(bx) - 2, Math.round(by) + 1, 1, 2); c.fillRect(Math.round(bx) + 1, Math.round(by) + 1, 1, 2); }
    }
  });
};

export const drawLostBalloons = (c: Ctx, state: GameState, each: (x: number, r: number, draw: (x: number) => void) => void) => {
  const f = state.frame;
  for (let i = 0; i < 9; i++) {
    const L = 900, t = ((f + i * 293) % L) / L, x = HUB.x0 + (i + 0.5) * (HUB_CIRC / 9) + t * 120 + Math.sin(f * 0.02 + i) * 10;
    each(x, 30, xx => {
      const y = ROW.walk0 - 120 - t * 420, col = BALLOON[i % BALLOON.length], r = 9 - t * 4;
      c.strokeStyle = 'rgba(87, 83, 78, 0.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(xx, y + r); c.quadraticCurveTo(xx + 4, y + r + 10, xx - 2, y + r + 20); c.stroke();
      c.fillStyle = INK; c.beginPath(); c.ellipse(xx, y, r * 0.85 + 1, r + 1, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = col; c.beginPath(); c.ellipse(xx, y, r * 0.85, r, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(xx - r * 0.4), Math.round(y - r * 0.5), 2, 2);
    });
  }
};
