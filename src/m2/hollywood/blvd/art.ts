// The boulevard, drawn (the final pass: peak SNES, fake 3D, one eye for the lot). The backdrop (far.ts): the sky by the
// hour with LA's smog along the horizon, the mountains, the HAPPYWOOD hill with its fallen O on its own foothills, the
// city in the haze, the studio lot's soundstages and water tower, THRONES OF THE STARS' impossible track rising out of
// the lot toward the end, the palms along the next street over. In the world, back to front: the lot behind the
// fronts, the pavement going back (the Walk of Fame's stars for nobodies, the palace's forecourt) and the holes cut
// through it (ground.ts); the coaster's legs over the queue plaza at the end; the plywood fronts and their bracing
// (fronts.ts); Steve's posters on them; everything standing on the pavement, farthest first (props.ts: the lamps, the
// palms, the plaques and ropes, the standees, the tip jars, the guests photographing it all); the arch; the street at
// the play plane, bent; the things he stands on (lit along their lips), the sawhorses.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { realDisastersOn } from '../section';
import { SECTIONS } from '../geometry';
import { viewOf } from './kit';
import { drawFar, farCoaster as farCoasterArt } from './far';
import { drawLotStrip, drawPavement, drawPits, drawStreet } from './ground';
import { drawFronts, drawArch, archLight } from './fronts';
import { drawStanding, drawPosters, drawPlayThings, drawThroneCoaster, lampLights } from './props';

type Ctx = CanvasRenderingContext2D;
const { x0, x1 } = SECTIONS.blvd;

/** The coaster far off (the coaster's own backdrop uses it too). */
export const farCoaster = farCoasterArt;

export const drawBlvdBackdrop = (c: Ctx, state: GameState) => {
  const along = Math.max(0, Math.min(1, (state.camera.x - x0) / (x1 - x0)));
  drawFar(c, state, along);
  if (realDisastersOn(state)) { c.fillStyle = 'rgba(127, 29, 29, 0.25)'; c.fillRect(0, 0, 800, 600); }
  return true;
};

export const drawBlvdBack = (c: Ctx, state: GameState) => {
  const v = viewOf(state), f = state.frame;
  drawLotStrip(c, v);
  drawPavement(c, v);
  drawPits(c, v);
  drawThroneCoaster(c, v);
  drawFronts(c, v);
  drawPosters(c, v);
  drawStanding(c, v, f);
  drawArch(c, v);
  drawStreet(c, v);
  drawPlayThings(c, v, f);
};

/** The lampposts' lamps (after dark), the marquee's bulbs, the arch's sign. */
export const blvdLamps = (state: GameState): Light[] => {
  const v = viewOf(state), [ax, ay] = archLight(v);
  return [...lampLights(v), { x: ax, y: ay, r: 200, a: 0.8, color: '#FDE047' }];
};
