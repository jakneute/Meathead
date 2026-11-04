// The enchanted glen with CON-FUCK-TIOUS's lair under the dragon's lair, in off the mine shaft (benLair.ts,
// benLairArt.ts): the glen's section wrapped, its own code untouched. Its build, then the tunnel and the room carved out
// of the ground; the lair's frame before the glen's own (and, under the ground, the glen's passing lines and Piper's PA
// held back: they're for the path up top); its camera row, lighting, drawing and HUD over the glen's.

import type { FantasySection } from '../section';
import { buildLair, updateLair, underground, inRoom, underView } from './benLair';
import { drawLairBack, drawLairFront, drawLairHud, lairLighting } from './benLairArt';
import { glenOf } from './state';
import { benCamZoom } from '../../upgrades/confucktious';
import { GAG_AT, PA_AT, HORNY_AT } from './layout';

/** Where his feet sit on screen down there: the tunnel (low, the earth over it in view), the room (it fits, floor to
 *  ceiling). */
const TUNNEL_ROW = 400, ROOM_ROW = 470;
/** The glen's once-each lines that go off by where he is along it (not how deep). */
const HELD = ['arrive', 'ride', ...GAG_AT.map(([k]) => k), ...PA_AT.map(([, k]) => `pa-${k}`), ...HORNY_AT.map((_, i) => `horny${i}`)];

export const withBenLair = (base: FantasySection): FantasySection => ({
  ...base,
  build: (state) => { base.build(state); buildLair(state); },
  update: (ctx, controls) => {
    const c = updateLair(ctx, controls);
    if (!base.update) return c;
    if (!underground(ctx.state)) return base.update(ctx, c);
    // (under the ground: everything the glen would say passing over here held back, then put as it was)
    const said = glenOf(ctx.state).said, was = HELD.map(k => said[k]);
    HELD.forEach(k => { said[k] = true; });
    const out = base.update(ctx, c);
    HELD.forEach((k, i) => { said[k] = was[i]; });
    return out;
  },
  // (pulled back a little while Ben's talking, if that's what holds them both: confucktious/benCam.ts)
  zoom: (state) => benCamZoom(state) ?? base.zoom?.(state) ?? null,
  cameraRow: (state) => (inRoom(state) ? ROOM_ROW : underground(state) ? TUNNEL_ROW : base.cameraRow?.(state)),
  // (down there, no sky: no sun flare, no time of day's light (its own dark instead))
  outdoors: (state) => (underView(state) ? 0 : base.outdoors?.(state)),
  lighting: (state, b) => lairLighting(base.lighting?.(state, b) ?? b ?? null, state),
  drawBack: (c, state) => { base.drawBack?.(c, state); drawLairBack(c, state); },
  drawFront: (c, state) => { base.drawFront?.(c, state); drawLairFront(c, state); },
  drawHud: (c, state) => { base.drawHud?.(c, state); drawLairHud(c, state); },
});
