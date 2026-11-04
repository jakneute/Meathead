// The castle with CON-FUCK-TIOUS's loft up behind the library's top left shelf (benLoft.ts, benLoftArt.ts): the castle's
// section wrapped, its own code untouched. Its build, then the passage, the loft and the way up; the loft's frame before
// the castle's own; its camera row, lighting, drawing and HUD over the castle's.

import type { SpookySection } from '../section';
import { buildLoft, updateLoft, inLoft } from './benLoft';
import { benCamZoom } from '../../upgrades/confucktious';
import { drawLoftBack, drawLoftFront, drawLoftHud, loftLighting } from './benLoftArt';

/** Where his feet sit on screen in the loft (the room fits, floor to ceiling). */
const LOFT_ROW = 480;

export const withBenLoft = (base: SpookySection): SpookySection => ({
  ...base,
  build: (state) => { base.build(state); buildLoft(state); },
  update: (ctx, controls) => { const c = updateLoft(ctx, controls); return base.update ? base.update(ctx, c) : c; },
  // (pulled back a little while Ben's talking, if that's what holds them both: confucktious/benCam.ts)
  zoom: (state) => benCamZoom(state) ?? base.zoom?.(state) ?? null,
  cameraRow: (state) => (inLoft(state) ? LOFT_ROW : base.cameraRow?.(state)),
  lighting: (state) => loftLighting(base.lighting?.(state) ?? null, state),
  drawBack: (c, state) => { base.drawBack?.(c, state); drawLoftBack(c, state); },
  drawFront: (c, state) => { base.drawFront?.(c, state); drawLoftFront(c, state); },
  drawHud: (c, state) => { base.drawHud?.(c, state); drawLoftHud(c, state); },
});
