// THE KAIJU FINALE's minions (the owner's: "tons of minions and aliens come after you that can be treated as
// mini-critters. doing negligible damage (a tenth of one percent at most)"): the widow's little gray aliens (dropped
// out of her saucers' tractor beams) and Satan's little red imps (up out of cracks in the ground), swarming his feet.
// The engine's own enemies (so every weapon and move gets them: one hit, any hit, kills one), of two tiny kinds with
// one hit point and no contact damage of their own: their bite's this file's (a tenth of a point a go, a breather
// after). Under his foot: squished flat (a speck of their blood, a squish; no line from him, there's too many).
// Pooled: a few dozen at most alive, spawned ahead of him and kept coming; never in a cutscene or a throw. They give
// nothing back (no drops, no heal, no ammo: boss-fight critters).

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Enemy, EnemyKind } from '../../../m1/types';
import { CANVAS_WIDTH as W } from '../../../m1/constants';
import { makeKindEnemy } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { stamp } from '../../../m1/game/render/stamp';
import { registerM2Kind } from '../../kinds';
import { floorY } from './geo';
import { INK } from './landmarkArt';

type Ctx = CanvasRenderingContext2D;
export const ALIEN_MINI = 'm2:fin_alien' as const, IMP_MINI = 'm2:fin_imp' as const;
/** What a bite does (the owner's ceiling: a tenth of a percent of his health), and how often one can. */
export const MINION_BITE = 0.1;

const paintAlien = (g: Ctx, step: number) => {
  g.fillStyle = INK; g.fillRect(-4, -12, 9, 7); g.fillRect(-3, -6, 7, 5);
  g.fillStyle = '#9CA3AF'; g.fillRect(-3, -11, 7, 5); g.fillStyle = '#C8CDD4'; g.fillRect(-3, -11, 7, 1);
  g.fillStyle = '#111827'; g.fillRect(0, -9, 2, 2); g.fillRect(3, -9, 1, 2);
  g.fillStyle = '#6B7280'; g.fillRect(-2, -6, 5, 4);
  g.fillStyle = '#4B5563'; g.fillRect(-2 + step, -2, 2, 2); g.fillRect(2 - step, -2, 2, 2);
};
const paintImp = (g: Ctx, step: number) => {
  g.fillStyle = INK; g.fillRect(-4, -11, 9, 10);
  g.fillStyle = '#B91C1C'; g.fillRect(-3, -10, 7, 8); g.fillStyle = '#EF4444'; g.fillRect(-3, -10, 7, 1);
  g.fillStyle = '#1A0A0A'; g.fillRect(-3, -13, 1, 3); g.fillRect(3, -13, 1, 3);
  g.fillStyle = '#FDE047'; g.fillRect(0, -8, 1, 1); g.fillRect(2, -8, 1, 1);
  g.fillStyle = '#7F1D1D'; g.fillRect(-2 + step, -2, 2, 2); g.fillRect(2 - step, -2, 2, 2);
  g.fillStyle = '#7F1D1D'; g.fillRect(-6, -6, 2, 1);
};

for (const [kind, paint, blood] of [[ALIEN_MINI, paintAlien, '#3FA34D'], [IMP_MINI, paintImp, '#7F1D1D']] as const) {
  registerM2Kind({
    kind, stats: { w: 10, h: 13, hp: 1, contact: 0, mass: 6, air: true },
    make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, noHeal: true, noAmmo: true, seen: true }),
    gender: 'n', grab: 'critter', blood,
    head: { x: 1, y: -9, r: 3 },
    draw: (c, e, f) => { const step = (((f ?? 0) >> 3) + (Math.round(e.pos.x) & 1)) % 2; stamp(c, `fin-${kind}-${step}`, -8, -16, 16, 18, g => paint(g, step)); },
    ai: () => true,
  });
}

interface Mini { e: Enemy; kind: typeof ALIEN_MINI | typeof IMP_MINI; vx: number; hop: number; vy: number; t: number; biteAt: number; seed: number }
export interface Swarm { list: Mini[]; spawnAt: number; next: number; seq: number }
export const newSwarm = (): Swarm => ({ list: [], spawnAt: 0, next: 0, seq: 0 });

/** How many to keep about (more later in the run), and alive at once at most. */
const KEEP = (sec: number) => 6 + Math.min(10, Math.floor(sec * 0.7)), MAX = 22;

/** One in, at `x` (dropped from a saucer's beam or up out of a crack: `from`). */
export const spawnMini = (state: GameState, sw: Swarm, kind: Mini['kind'], x: number) => {
  if (sw.list.length >= MAX) return;
  const y = floorY(x);
  const e = makeKindEnemy(kind as EnemyKind, x - 5, y - 13);
  e.id = `fin-mini-${sw.seq++}`; e.seen = true; e.noHeal = true; e.noAmmo = true;
  state.enemies.push(e);
  sw.list.push({ e, kind, vx: 0, hop: 0, vy: 0, t: 0, biteAt: 0, seed: sw.seq % 7 });
};

/** Each frame: kept coming (`on`: the fight's on), running at his feet; biting; squished under him. */
export const updateSwarm = (ctx: FrameContext, sw: Swarm, on: boolean, sec: number, bite: (dmg: number) => void, squish: (x: number, y: number, blood: string) => void) => {
  const { state } = ctx, p = state.player, px = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  // (dead, by anything: off the list; the engine's taken care of the body)
  sw.list = sw.list.filter(m => m.e.health > 0 && state.enemies.includes(m.e));
  if (on && sw.list.length < KEEP(sec) && state.frame >= sw.next) {
    sw.next = state.frame + 18 + Math.floor(Math.random() * 30);
    const ahead = Math.random() < 0.75;
    const x = ahead ? state.camera.x + W - 30 - Math.random() * 120 : state.camera.x + 30 + Math.random() * 100;
    spawnMini(state, sw, Math.random() < 0.5 ? ALIEN_MINI : IMP_MINI, x);
  }
  for (const m of sw.list) {
    const e = m.e;
    m.t++;
    const mx = e.pos.x + e.width / 2;
    const want = Math.sign(px - mx) * (1.5 + ((m.t + m.seed * 13) % 40) / 60);
    m.vx += (want - m.vx) * 0.1;
    let x = mx + m.vx;
    // (a hop now and then, at his shins)
    if (m.hop <= 0 && Math.abs(px - mx) < 50 && Math.random() < 0.02) { m.hop = 1; m.vy = -3.5; }
    let y = e.pos.y + e.height;
    const fy = floorY(x);
    if (m.hop > 0) { m.vy += 0.35; y += m.vy; if (y >= fy) { y = fy; m.hop = 0; } } else y = fy;
    e.pos.x = x - e.width / 2; e.pos.y = y - e.height; e.vel.x = m.vx; e.vel.y = 0; e.facing = m.vx >= 0 ? 1 : -1;
    // (his foot: squished. A grounded step or a landing onto them)
    const under = x > p.pos.x + 4 && x < p.pos.x + p.width - 4 && y > feet - 8 && y < feet + 6 && p.health > 0;
    if (under && (p.isGrounded || p.vel.y > 1)) {
      e.health = 0; state.enemies.splice(state.enemies.indexOf(e), 1);
      squish(x, fy, m.kind === ALIEN_MINI ? '#3FA34D' : '#7F1D1D');
      playSound('squish', 0.35, 4 + Math.random() * 6);
      continue;
    }
    // (at his shins: a bite, a tenth of a point)
    if (Math.abs(x - px) < p.width / 2 + 2 && y > p.pos.y + p.height * 0.4 && y <= feet + 6 && state.frame - m.biteAt > 50) { m.biteAt = state.frame; bite(MINION_BITE); }
  }
  void W;
};
/** Everyone off (a cutscene, the throw's landing: they scatter). */
export const clearSwarm = (state: GameState, sw: Swarm) => {
  for (const m of sw.list) { const i = state.enemies.indexOf(m.e); if (i >= 0) state.enemies.splice(i, 1); }
  sw.list.length = 0;
};
