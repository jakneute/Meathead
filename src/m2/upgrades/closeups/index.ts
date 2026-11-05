// The cheap shot's custom close-ups (Phase F, SPEC.md's hand armor): one file a boss, each exporting `closeUp` (a
// CloseUpPaint: closeUp.ts draws the frame round it, the opening flash and the fade). Registered once from apply.ts.
// Each bakes its still layers on first use (closeUp.ts bakeOnce), never at load.

import type { CloseUpPaint } from '../closeUp';
import type { CrushId } from '../crushedLines';
import { registerCloseUp } from '../cheapShot';
import { closeUp as artie } from './artie';
import { closeUp as donnie } from './donnie';
import { closeUp as steve } from './steve';
import { closeUp as tucker } from './tucker';
import { closeUp as dad } from './dad';
import { closeUp as demon } from './demon';
import { closeUp as harry } from './harry';
import { closeUp as piper } from './piper';
import { closeUp as queen } from './queen';
import { closeUp as rex } from './rex';
import { closeUp as perot } from './perot';
import { closeUp as falwell } from './falwell';
import { closeUp as limbaugh } from './limbaugh';
import { closeUp as dole } from './dole';
import { closeUp as newt } from './newt';

export const CUSTOM_CLOSEUPS: Record<CrushId, CloseUpPaint | null> = {
  artie, donnie, steve, tucker, dad, demon, harry, piper, queen, rex, perot, falwell, limbaugh, dole, newt,
  // (the water park's kid: the generic close-up for now)
  kid: null,
};

export const installCloseUps = () => {
  for (const [id, paint] of Object.entries(CUSTOM_CLOSEUPS) as [CrushId, CloseUpPaint | null][]) if (paint) registerCloseUp(id, paint);
};
