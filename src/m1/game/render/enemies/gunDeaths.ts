// Draws the pistol's kills and the lowriders' thrown-out crews (see game/enemies/gunDeaths.ts). Each is the one that died
// drawn as itself (its own sprite, cut at the neck for the head snap, turned, flipped, swelled), with what it left about.

import type { GameState } from '../../core/state';
import type { EnemyDeath } from '../../enemies/deaths';
import { GunDeath, GunProp, PROP_LIFE } from '../../enemies/gunDeaths';
import type { BodyOpts } from './deaths';
import { kindHead } from './index';

type Ctx = CanvasRenderingContext2D;
type Body = (ctx: Ctx, d: EnemyDeath, state: GameState, o?: BodyOpts) => void;

export const drawGunDeath = (ctx: Ctx, d: EnemyDeath, state: GameState, body: Body) => {
  const g = d.gd;
  if (!g) return;
  for (const p of g.props) drawProp(ctx, p);
  if (g.burstAt !== undefined) return;
  if (g.mode === 'person' || g.mode === 'lying') drawPlugged(ctx, d, g, state, body);
  else if (g.mode === 'jetski') drawJetski(ctx, d, g, state, body);
  else drawBeast(ctx, d, g, state, body);
};

/** Where the head is (world, as it stood), the neck under it, and the box round it that snaps back with it. */
const headBox = (d: EnemyDeath) => {
  const s = d.sprite!, hd = kindHead(s.kind, s.variant);
  const hx = d.x + d.w / 2 + hd.x * s.facing, hy = d.y + d.h + hd.y, r = hd.r;
  const neck = hy + r * 0.85, top = hy - r * 2.7;
  return { hx, hy, r, neck, x: hx - r * 1.8, y: top, w: r * 3.6, h: neck - top };
};

/** The head, snapped back about the neck: cut out of the drawing, the hole in the front of it. */
const drawHead = (ctx: Ctx, d: EnemyDeath, g: GunDeath, state: GameState, body: Body, hb: ReturnType<typeof headBox>) => {
  ctx.save();
  ctx.translate(hb.hx, hb.neck); ctx.rotate(g.snap); ctx.translate(-hb.hx, -hb.neck);
  ctx.beginPath(); ctx.rect(hb.x, hb.y, hb.w, hb.h); ctx.clip();
  body(ctx, d, state);
  // (in the front, the side the round came from: a hole, and a run of blood down from it)
  const wx = Math.round(hb.hx - g.b * hb.r * 0.5), wy = Math.round(hb.hy - hb.r * 0.35);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(wx - 1, wy, 2, Math.min(hb.r * 0.9, 1 + d.t * 0.35));
  ctx.fillStyle = '#450A0A'; ctx.fillRect(wx - 1, wy - 1, 2, 2);
  ctx.restore();
};

/** Everything but the head (`clipTo`: only within this box). */
const drawBelowHead = (ctx: Ctx, d: EnemyDeath, state: GameState, body: Body, hb: ReturnType<typeof headBox>, clipTo?: { x: number; y: number; w: number; h: number }) => {
  ctx.save();
  ctx.beginPath();
  const c = clipTo ?? { x: d.x - d.w * 2, y: d.y - d.h, w: d.w * 5, h: d.h * 2 + 8 };
  ctx.rect(c.x, c.y, c.w, c.h); ctx.rect(hb.x, hb.y, hb.w, hb.h);
  ctx.clip('evenodd');
  body(ctx, d, state);
  ctx.restore();
};

/** (people) Leaning over about his feet (squashed at the knees if he's gone limp), his head snapped back. */
const drawPlugged = (ctx: Ctx, d: EnemyDeath, g: GunDeath, state: GameState, body: Body) => {
  const fx = d.x + d.w / 2, fy = d.y + d.h;
  ctx.save();
  ctx.translate(fx, fy + g.oy); ctx.rotate(g.th); ctx.scale(1, g.sy); ctx.translate(-fx, -fy);
  if (g.mode === 'lying') {
    // (she's lying down: no neck to snap; just the hole)
    body(ctx, d, state);
    const hb = headBox(d);
    ctx.fillStyle = '#450A0A'; ctx.fillRect(Math.round(hb.hx) - 1, Math.round(hb.hy - hb.r * 0.5), 2, 2);
  } else {
    const hb = headBox(d);
    drawBelowHead(ctx, d, state, body, hb);
    drawHead(ctx, d, g, state, body, hb);
  }
  ctx.restore();
};

/** (jet ski) The craft stays as it is; the rider slumps forward over the bars from the seat, his head snapped back. */
const drawJetski = (ctx: Ctx, d: EnemyDeath, g: GunDeath, state: GameState, body: Body) => {
  const f = d.sprite?.facing ?? 1, fx = d.x + d.w / 2, fy = d.y + d.h;
  // (the rider: his body's x -16..8 of the sprite, facing right, above the seat at -22)
  const rx1 = f > 0 ? fx - 16 : fx - 8, rider = { x: rx1, y: fy - 70, w: 24, h: 48 };
  const hb = headBox(d);
  // The craft, and anything of him outside where his body is (his hand on the grip)
  ctx.save();
  ctx.beginPath(); ctx.rect(d.x - d.w, d.y - d.h, d.w * 3, d.h * 2 + 8); ctx.rect(rider.x, rider.y, rider.w, rider.h); ctx.clip('evenodd');
  body(ctx, d, state);
  ctx.restore();
  // Him, slumping over about the seat
  ctx.save();
  const px = fx - 4 * f, py = fy - 22;
  ctx.translate(px, py); ctx.rotate(g.th); ctx.translate(-px, -py);
  drawBelowHead(ctx, d, state, body, hb, rider);
  drawHead(ctx, d, g, state, body, hb);
  ctx.restore();
};

/** (animals) Turned, flipped, swelled, shaken about its middle (or its feet), its legs going if they are. */
const drawBeast = (ctx: Ctx, d: EnemyDeath, g: GunDeath, state: GameState, body: Body) => {
  const cx = d.x + d.w / 2, py = g.pf ? d.y + d.h : d.y + d.h / 2;
  ctx.save();
  ctx.translate(cx + g.ox, py + g.oy); ctx.rotate(g.rot); ctx.scale(g.sx, g.sy); ctx.translate(-cx, -py);
  body(ctx, d, state, g.run ? { run: g.run, phase: g.anim } : undefined);
  ctx.restore();
};

/** (a lowrider's crewman, thrown out) Tumbling about his middle. */
export const drawEjected = (ctx: Ctx, d: EnemyDeath, state: GameState, body: Body) => {
  const cx = d.x + d.w / 2, cy = d.y + d.h / 2;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(d.rot); ctx.translate(-cx, -cy);
  body(ctx, d, state);
  ctx.restore();
};

/** What it left: the eagle's feather, the pelican's fish, the seagull's fries, the shark's plate, the longhorn's horns. */
const drawProp = (ctx: Ctx, p: GunProp) => {
  if (p.age >= PROP_LIFE) return;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, (PROP_LIFE - p.age) / 30);
  ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(p.rot);
  switch (p.kind) {
    case 'feather':
      // (a quill, the vane either side, dark at the tip)
      ctx.fillStyle = '#3F2A17'; ctx.fillRect(-6, -2, 12, 4);
      ctx.fillStyle = '#5A3A1E'; ctx.fillRect(-5, -2, 9, 2);
      ctx.fillStyle = '#E7E5E4'; ctx.fillRect(-7, -0.5, 14, 1);
      ctx.fillStyle = '#1C1917'; ctx.fillRect(4, -2, 2, 4);
      break;
    case 'fish':
      // (silver, lit along its back, a tail, an eye)
      ctx.fillStyle = '#475569'; ctx.fillRect(-6, -3, 10, 6); ctx.fillRect(-9, -3, 3, 2); ctx.fillRect(-9, 1, 3, 2);
      ctx.fillStyle = '#94A3B8'; ctx.fillRect(-5, -3, 8, 3);
      ctx.fillStyle = '#E2E8F0'; ctx.fillRect(-4, -3, 6, 1);
      ctx.fillStyle = '#0F172A'; ctx.fillRect(2, -2, 1, 1);
      break;
    case 'fry':
      ctx.fillStyle = '#CA8A04'; ctx.fillRect(-1.5, -4, 3, 8);
      ctx.fillStyle = '#FDE047'; ctx.fillRect(-1.5, -4, 2, 7);
      ctx.fillStyle = '#92400E'; ctx.fillRect(-1.5, 3, 3, 1);
      break;
    case 'plate':
      // (a license plate: white, an orange blob in the middle, the numbers a dark band, the screw holes)
      ctx.fillStyle = '#1F2937'; ctx.fillRect(-9, -5, 18, 10);
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-8, -4, 16, 8);
      ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-8, 2, 16, 2);
      ctx.fillStyle = '#F97316'; ctx.fillRect(-1, -2, 3, 3);
      ctx.fillStyle = '#065F46'; ctx.fillRect(-7, -2, 5, 3); ctx.fillRect(3, -2, 4, 3);
      ctx.fillStyle = '#64748B'; ctx.fillRect(-7, -4, 1, 1); ctx.fillRect(6, -4, 1, 1);
      break;
    case 'horn':
      // (a long curving horn: bone, yellowing toward the root, dark at the point)
      ctx.fillStyle = '#A8A29E'; ctx.fillRect(-10, -2, 6, 4);
      ctx.fillStyle = '#E7E0CC'; ctx.fillRect(-6, -2, 9, 3); ctx.fillRect(3, -3, 4, 2);
      ctx.fillStyle = '#F5F0E1'; ctx.fillRect(-6, -2, 9, 1);
      ctx.fillStyle = '#44403C'; ctx.fillRect(7, -4, 3, 2);
      break;
  }
  ctx.restore();
};
