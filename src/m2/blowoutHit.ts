// The blowout's spray (game/player/gut.ts): the globs of it flying hurt whoever they hit, a little each (the user: "can
// cause damage, if you're really skilled, not an intended strategy but a fun little bonus"). Never advertised. Only at
// the blowout moment (the globs exist only then), so it can't be farmed. Not the bosses, not the mid-bosses, not the
// innocents (hazardVictims); a little one goes in one, as with any hazard. A kill gets its callout over it, no voice.

import type { FrameContext } from '../m1/game/core/context';
import type { Enemy } from '../m1/types';
import { setGutGlobHit } from '../m1/game/player/gut';
import { hazardVictims, hazardHit } from './hazardHit';

/** A glob's bite, and how many globs any one body takes (the spray's a fan of 50-odd: it'd shred anybody otherwise). */
const GLOB_DMG = 12, MAX_PER = 4;
/** How far round a glob it catches (flying), and round where it lands (the splat). */
const PAD = 4, SPLAT = 14;
const taken = new WeakMap<Enemy, number>();

setGutGlobHit((ctx: FrameContext, x: number, y: number, landed: boolean) => {
  const r = landed ? SPLAT : PAD;
  const e = hazardVictims(ctx.state).find(v => (taken.get(v) ?? 0) < MAX_PER
    && x > v.pos.x - r && x < v.pos.x + v.width + r && y > v.pos.y - r && y < v.pos.y + v.height + r);
  if (!e) return false;
  taken.set(e, (taken.get(e) ?? 0) + 1);
  hazardHit(ctx, e, GLOB_DMG, x, 'SHIT-FACED!', { color: '#B7791F', knock: 3 });
  return true;
});
