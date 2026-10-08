// The crowd round the hub: the cast (../cast/people.ts) standing about in the gaps between the portals and the lamps,
// in twos and threes, chatting (the one talking takes turns with the one listening), swaying, blinking. On the
// roundabout like everything else, so they go round with it. Scenery for now; later some of them will talk to him.

import type { GameState } from '../../m1/game/core/state';
import { GROUND_Y } from '../../m1/constants';
import { CAST, type CastMember } from '../cast/people';
import { slotX } from './geometry';

type Ctx = CanvasRenderingContext2D;

/** Who's where: a cast member, the spot they're by, how far off its middle, which way they're facing. */
const STANDING: [id: string, slot: number, dx: number, facing: 1 | -1][] = [
  // (by the staff door, where he comes out: only its left side, the back building's on the right)
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

/** How big they're drawn (the cast's drawn about 70 tall; Meathead's a big man, they're ordinary people). */
const SCALE = 1.15;

interface Placed { who: CastMember; x: number; facing: 1 | -1; seed: number; partner: number }
const PLACED: Placed[] = STANDING.map(([id, slot, dx, facing], i) => ({ who: CAST.find(m => m.id === id)!, x: slotX(slot) + dx, facing, seed: i * 53, partner: -1 }));
// (a partner: the one beside them, facing them; the two take turns talking)
PLACED.forEach((p, i) => { const q = PLACED[i + 1]; if (q && p.facing === 1 && q.facing === -1 && q.x - p.x < 60) { p.partner = i + 1; q.partner = i; } });

/** Everybody near enough to be seen, at `laps` (every lap's copy). */
export const drawCrowd = (ctx: Ctx, state: GameState, laps: (x: number, draw: (x: number) => void) => void) => {
  const f = state.frame;
  PLACED.forEach((p, i) => laps(p.x, x => {
    // (a pair takes turns, a few seconds each, a beat of quiet between; Billie's on her phone, always)
    const turn = Math.floor((f + (p.partner >= 0 ? Math.min(i, p.partner) * 97 : p.seed)) / 170);
    const quiet = (f + i * 31) % 170 > 150;
    const talk = p.who.id === 'billie' || (p.partner >= 0 && !quiet && turn % 2 === (i < p.partner ? 0 : 1));
    ctx.fillStyle = 'rgba(60, 40, 20, 0.25)'; ctx.beginPath(); ctx.ellipse(x, GROUND_Y + 1, 14 * SCALE, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(Math.round(x), GROUND_Y);
    ctx.scale(SCALE * p.facing, SCALE);
    p.who.draw(ctx, f + p.seed, talk);
    ctx.restore();
  }));
};
