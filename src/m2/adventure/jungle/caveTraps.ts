// What's out to get him in the jungle's hidden cave (hidden.ts), besides the pits:
//
//   STALACTITES (DRIPS): wet ones, paler than the rest, dripping. Under one (near enough), it cracks at the root and
//     shakes, dripping hard (the tell, TELL frames), then drops; it shatters on whatever's under it, or falls on into the
//     dark. It hurts what it hits (on a vine, that knocks him off it). Each drops once a go.
//   THORNS: thorny roots (down the far ledge's face in the gallery; up out of the dark under V5's back swing in the
//     tunnel). Touched, they hurt and throw him off (on a vine, off it).
//   THE SPRAY: the falls surge every so often and blast spray back down the passage and out over the tunnel's last gap
//     (a hiss and a mist first, TELL; then the gust; then the calm). It shoves whatever's in the air there (or swinging
//     on V6) back left. No harm in it but the shove.
//
// Drawn in art/hidden.ts (the thorns painted with the rock; the stalactites stamped once and drawn where they are; the
// spray in front of him).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { shakeScreen } from '../../../m1/game/core/state';
import { envSound } from '../../bossQuiet';
import { SECTIONS } from '../geometry';
import { jungleOf } from './state';

const X = (rx: number) => SECTIONS.jungle.x0 + rx;
// (the cave's heights: hidden.ts's CAVE (not imported: it imports this))
const HALL_CEIL = 300, HI_CEIL = 370, LO_CEIL = 980, LO_FLOOR = 1240;

/** The stalactites that drop: where each hangs from (the ceiling's underside), how long it is. */
export const DRIPS: { x: number; y: number; len: number }[] = [
  // (over the gallery's first ledge: taught over solid rock)
  { x: X(6745), y: HALL_CEIL, len: 58 },
  // (over its second ledge: it comes down while he lines up the next jump)
  { x: X(6340), y: HI_CEIL, len: 50 },
  // (over V4's swing, and V6's, in the tunnel)
  { x: X(6185), y: LO_CEIL, len: 46 },
  { x: X(6705), y: LO_CEIL, len: 46 },
];
/** How near under one he has to be to set it off; the tell; how hard it hits; how wide its hurting part is. */
const DRIP_RANGE = 110, TELL = 45, DRIP_DMG = 10, DRIP_W = 16;

/** The thorny roots (world rects): down the gallery's far ledge's face, and up out of the tunnel's dark. */
export const THORNS: { x: number; y: number; w: number; h: number; kind: 'face' | 'rise' }[] = [
  { x: X(5950), y: 640, w: 14, h: 300, kind: 'face' },
  { x: X(6225), y: 1195, w: 65, h: 420, kind: 'rise' },
];
const THORN_DMG = 6;

/** The spray: the stretch it blasts over (from the passage's mouth back left), the heights it's at; its cycle (the tell,
 *  the gust, then the calm, frames), and how hard it shoves. */
export const SPRAY = { a: X(6540), b: X(6990), top: 1085, bot: LO_FLOOR, period: 250, tell: 50, gust: 80 };
const PUSH_AIR = 0.42, PUSH_VINE = 0.0016, PUSH_MAX = 6.5;

export interface Drip { st: 'hang' | 'shake' | 'fall' | 'gone'; t: number; fy: number; vy: number }
export interface Traps { drips: Drip[] }
export const makeTraps = (): Traps => ({ drips: DRIPS.map(() => ({ st: 'hang', t: 0, fy: 0, vy: 0 })) });

/** Where the spray's at in its cycle: 'tell', 'gust' or 'calm', and how far into that (0..1). */
export const sprayPhase = (frame: number): { ph: 'tell' | 'gust' | 'calm'; k: number } => {
  const t = frame % SPRAY.period;
  if (t < SPRAY.tell) return { ph: 'tell', k: t / SPRAY.tell };
  if (t < SPRAY.tell + SPRAY.gust) return { ph: 'gust', k: (t - SPRAY.tell) / SPRAY.gust };
  return { ph: 'calm', k: (t - SPRAY.tell - SPRAY.gust) / (SPRAY.period - SPRAY.tell - SPRAY.gust) };
};

const overlap = (a: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) =>
  a.x < x + w && a.x + a.w > x && a.y < y + h && a.y + a.h > y;
const canHurt = (state: GameState) => { const p = state.player; return p.invincibilityTimer <= 0 && p.health > 0 && !p.inCutscene && !p.untouchable; };

/** Something solid's top in under (x, y0..y1): where a falling stalactite stops. */
const floorUnder = (state: GameState, x: number, y0: number, y1: number) => {
  let best: number | null = null;
  for (const b of state.blocks) {
    if (b.type === 'pit' || b.oneWay || x < b.x || x > b.x + b.w || b.y < y0 || b.y > y1) continue;
    if (best === null || b.y < best) best = b.y;
  }
  return best;
};

export const updateTraps = (ctx: FrameContext, tr: Traps, firstCaveVine: number) => {
  const { state } = ctx, p = state.player, f = state.frame;
  const box = { x: p.pos.x, y: p.pos.y, w: p.width, h: p.height };
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // The stalactites
  DRIPS.forEach((d, i) => {
    const s = tr.drips[i];
    if (s.st === 'gone') return;
    if (s.st === 'hang') {
      if (p.health > 0 && Math.abs(cx - d.x) < DRIP_RANGE && feet > d.y && feet < d.y + 700) {
        s.st = 'shake'; s.t = 0;
        envSound(state, d.x, 'crack', 0.55, -7, d.y);
      }
      return;
    }
    if (s.st === 'shake') {
      if (++s.t >= TELL) { s.st = 'fall'; s.fy = d.y; s.vy = 0; envSound(state, d.x, 'crack', 0.8, -3, d.y); }
      // (drips coming off it hard, the tell)
      else if (s.t % 6 === 0) state.particles.push({ pos: { x: d.x + (Math.random() - 0.5) * 3, y: d.y + d.len }, vel: { x: 0, y: 2 + Math.random() }, life: 24, color: 'rgba(170, 220, 236, 0.9)', size: 2 });
      return;
    }
    // Falling
    const y0 = s.fy + d.len;
    s.vy = Math.min(15, s.vy + 0.55); s.fy += s.vy;
    const tip = s.fy + d.len;
    if (canHurt(state) && overlap(box, d.x - DRIP_W / 2, s.fy + d.len * 0.3, DRIP_W, d.len * 0.7)) {
      hurtPlayer(ctx, DRIP_DMG, 'm2:stalactite', { x: (cx < d.x ? -1 : 1) * 3, y: -3 });
      shatter(state, s, d.x, tip);
      return;
    }
    const fl = floorUnder(state, d.x, y0, tip);
    if (fl !== null) { shatter(state, s, d.x, fl); return; }
    if (s.fy > d.y + 1300) s.st = 'gone';
  });
  // The thorns
  if (canHurt(state)) for (const t of THORNS) {
    if (!overlap(box, t.x, t.y, t.w, t.h)) continue;
    const away = cx < t.x + t.w / 2 ? -1 : 1;
    hurtPlayer(ctx, THORN_DMG, 'm2:thorns', t.kind === 'rise' ? { x: away * 2, y: -6 } : { x: away * 4, y: -3 });
    break;
  }
  // The spray (a gust: what's in the air over the last gap, or swinging on V6, shoved back left)
  const sp = sprayPhase(f);
  if (sp.ph === 'tell' && f % SPRAY.period === 1) envSound(state, SPRAY.b, 'rumble', 0.45, 6, SPRAY.top);
  if (sp.ph === 'gust') {
    if (f % SPRAY.period === SPRAY.tell) envSound(state, SPRAY.b, 'splash', 0.8, -4, SPRAY.top);
    if (p.health > 0 && overlap(box, SPRAY.a, SPRAY.top, SPRAY.b - SPRAY.a, SPRAY.bot - SPRAY.top) && !p.isGrounded) {
      // (hardest at the passage's mouth, the gust's first moments)
      const k = Math.min(1, 0.45 + (cx - SPRAY.a) / (SPRAY.b - SPRAY.a)) * (sp.k < 0.15 ? 0.6 + sp.k * 2.6 : 1);
      const j = jungleOf(state), h = j.hold;
      if (h.on >= firstCaveVine) { const v = j.vines[h.on]; if (v) v.om -= PUSH_VINE * k; }
      else {
        p.vel.x = Math.max(-PUSH_MAX, p.vel.x - PUSH_AIR * k);
        if (h.fling) h.fling.vx = h.fling.vx > 0 ? Math.max(0, h.fling.vx - PUSH_AIR * k) : h.fling.vx;
      }
    }
  }
};

const shatter = (state: GameState, s: Drip, x: number, y: number) => {
  s.st = 'gone';
  envSound(state, x, 'crack', 1, 2, y);
  shakeScreen(state, 6, 2);
  const COL = ['#C8D4CC', '#8AA096', '#5A6E66', '#E8F4F8'];
  for (let k = 0; k < 14; k++) state.particles.push({ pos: { x: x + (Math.random() - 0.5) * 12, y: y - 4 }, vel: { x: (Math.random() - 0.5) * 7, y: -1.5 - Math.random() * 4.5 }, life: 26 + Math.floor(Math.random() * 14), color: COL[k % COL.length], size: 2 + Math.random() * 3 });
};
