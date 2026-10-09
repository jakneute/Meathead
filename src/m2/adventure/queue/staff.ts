// The Jungle Cruise's staff: on break out back, on the dock. They can't be arsed to fight him (harmless: they stand
// there; hit one and they take it). Each one's look from their seed (homeX): man or woman, skin, build, hair.

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import { registerM2Kind } from '../../kinds';
import { INK, rect, dot, legs, torso, arm, head, eyes, mouth, nose, breathe, blob, dk } from '../../cast/kit';

type Ctx = CanvasRenderingContext2D;

const SKINS = ['#F6DCC8', '#F0C8A2', '#D9A877', '#A86B43', '#6E4426', '#F2A584'];
const HAIRS = ['#1C1917', '#78350F', '#B45309', '#FDE68A', '#57534E', '#7F1D1D'];
const hash = (n: number) => { let h = Math.floor(Math.abs(n)) * 2654435761; h ^= h >>> 13; return (h >>> 0) % 997; };

export interface StaffLook { woman: boolean; skin: string; hair: string; wide: number; long: boolean; tall: number }
export const staffLook = (seed: number): StaffLook => {
  const h = hash(seed);
  return { woman: h % 2 === 0, skin: SKINS[h % SKINS.length], hair: HAIRS[(h >> 3) % HAIRS.length], wide: 18 + (h % 4) * 3, long: (h >> 2) % 3 !== 0, tall: (h >> 4) % 3 };
};
/** What a staffer's doing (out back): drawn with it. */
export type StaffDoing = 'smoke' | 'phone' | 'sit' | 'broom' | 'stand';
export const staffDoing = new WeakMap<Enemy, StaffDoing>();
/** Their mouth going (they're saying something). */
export const staffTalking = new WeakSet<Enemy>();

const POLO = '#0F766E', PANTS = '#A8A29E';

/** A staffer at the origin (feet), facing right. */
export const drawStaffer = (c: Ctx, seed: number, f: number, doing: StaffDoing, talk: boolean) => {
  const L = staffLook(seed);
  const b = breathe(f, seed % 7);
  const sit = doing === 'sit';
  if (sit) {
    rect(c, -9, -18, 18, 18, '#F97316', 1); dot(c, -9, -14, 18, 2, '#C2410C');
    c.translate(0, -16);
    for (const s of [-1, 1]) { rect(c, s * 4 - 3, -12, 14, 6, PANTS, 1.5); rect(c, s * 4 + 7, -12, 5, 14, PANTS, 1.5); }
    c.translate(0, 20);
  } else legs(c, -28 - L.tall * 2, 4, 6, PANTS, L.skin, '#1F2937');
  const top = -54 - L.tall * 3 + (sit ? 8 : 0);
  c.translate(0, b);
  torso(c, top + 26, top, L.wide, L.wide + (L.woman ? 2 : 0), POLO);
  dot(c, -3, top + 1, 6, 4, dk(POLO, 0.3));
  // (the name tag, the Happy Land logo: a yellow dot)
  dot(c, 2, top + 6, 6, 3, '#F8FAFC'); dot(c, -6, top + 6, 3, 3, '#FDE047');
  // (the arms: whatever they're doing instead of their job)
  const sx = L.wide / 2 - 2;
  if (doing === 'smoke') {
    arm(c, -sx, top + 3, -sx - 2, top + 24, POLO, L.skin, 0.35);
    arm(c, sx, top + 3, 8, top - 6, POLO, L.skin, 0.35);
    dot(c, 9, top - 8, 7, 1.6, '#F8FAFC'); dot(c, 15, top - 8, 1.5, 1.6, '#F97316');
    for (let k = 0; k < 3; k++) { const t = (f * 0.4 + k * 12) % 36; c.fillStyle = `rgba(226,232,240,${0.5 - t / 80})`; c.beginPath(); c.arc(17 + Math.sin(t * 0.2) * 3, top - 10 - t, 2 + t / 10, 0, Math.PI * 2); c.fill(); }
  } else if (doing === 'phone') {
    arm(c, -sx, top + 3, -sx - 2, top + 24, POLO, L.skin, 0.35);
    arm(c, sx, top + 3, 6, top + 10, POLO, L.skin, 0.35);
    rect(c, 3, top + 4, 6, 9, '#18181B', 1); dot(c, 4, top + 5, 4, 6, '#60A5FA');
  } else if (doing === 'broom') {
    c.strokeStyle = '#92400E'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(14, top - 4); c.lineTo(18, -2 - b); c.stroke();
    rect(c, 12, -8 - b, 14, 6, '#FDE68A', 1);
    arm(c, -sx, top + 3, -sx - 2, top + 24, POLO, L.skin, 0.35);
    arm(c, sx, top + 3, 15, top + 8, POLO, L.skin, 0.35);
  } else {
    arm(c, -sx, top + 3, -sx - 1, top + 24, POLO, L.skin, 0.35);
    arm(c, sx, top + 3, sx + 1, top + 24, POLO, L.skin, 0.35);
  }
  // (the head: bored)
  const hy = top - 12;
  if (L.woman && L.long) blob(c, () => c.roundRect(-10, hy - 8, 20, 24, 6), L.hair, -10, 10);
  head(c, 0, hy, 9, 10, L.skin);
  eyes(c, 1, hy - 1, 3.8, 'tired', f + seed, 0.5, 2.3, dk(L.skin, 0.1));
  nose(c, 4, hy + 3, 2, L.skin);
  mouth(c, 2, hy + 6, 6, talk ? 'talk' : 'flat', f);
  blob(c, () => c.ellipse(0, hy - 6, 10, 5, 0, Math.PI, 0), L.hair, -10, 10);
  // (the visor)
  dot(c, -9, hy - 7, 18, 3, POLO); blob(c, () => c.ellipse(9, hy - 5.5, 8, 2, 0.1, 0, Math.PI * 2), POLO, 1, 17, 1);
  c.strokeStyle = INK; c.lineWidth = 0.5;
};

registerM2Kind({
  kind: 'm2:staffer',
  stats: { w: 34, h: 62, hp: 70, contact: 0, mass: 180 },
  humanoid: true,
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  // (they don't do anything: that's the joke)
  ai: (_ctx: FrameContext, e: Enemy) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => drawStaffer(c, e.homeX ?? 0, f, staffDoing.get(e) ?? 'stand', staffTalking.has(e)),
  head: { x: 0, y: -66, r: 9 },
  gender: e => (staffLook(e.homeX ?? 0).woman ? 'f' : 'm'),
});
