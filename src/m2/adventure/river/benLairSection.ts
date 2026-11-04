// The river with CON-FUCK-TIOUS's lair up its third maintenance shaft (benLair.ts, benLairArt.ts): the river's section
// wrapped, its own code untouched. Its build, then the shaft and the lair cut out of its rock; the lair's frame before
// the river's own; its camera row, lighting, drawing and HUD over the river's.

import type { Section } from '../section';
import { todLight } from '../../timeOfDay';
import { benCamZoom } from '../../upgrades/confucktious';
import { buildLair, updateLair, inLair, lairView, drawLairHud } from './benLair';
import { drawLairBack, drawLairFront, lairLighting } from './benLairArt';

/** Where his feet sit on screen up in the lair (the room fits, floor to ceiling). */
const LAIR_ROW = 480;

export const withBenLair = (base: Section): Section => ({
  ...base,
  build: (state) => { base.build(state); buildLair(state); },
  update: (ctx, controls) => { const c = updateLair(ctx, controls); return base.update ? base.update(ctx, c) : c; },
  // (pulled back a little while Ben's talking, if that's what holds them both: confucktious/benCam.ts)
  zoom: (state) => benCamZoom(state) ?? base.zoom?.(state) ?? null,
  cameraRow: (state) => (inLair(state) ? LAIR_ROW : base.cameraRow?.(state)),
  // (up the shaft and in the lair: its own dark and lamps; else the river's, as the land works it out)
  lighting: (state, b) => {
    if (lairView(state)) return lairLighting(state);
    if (base.lighting) return base.lighting(state, b);
    const out = base.outdoors?.(state) ?? 0;
    return out > 0 ? todLight(base.lamps?.(state) ?? [], out) : null;
  },
  drawBack: (c, state) => { base.drawBack?.(c, state); drawLairBack(c, state); },
  drawFront: (c, state) => { base.drawFront?.(c, state); drawLairFront(c, state); },
  drawHud: (c, state) => { base.drawHud?.(c, state); drawLairHud(c, state); },
});
