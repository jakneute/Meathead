// THE KAIJU FINALE's Ben (CON-FUCK-TIOUS), only with all eight of his armor pieces given (the owner's: "if you happen
// to get all 8 gear pieces (not 100 percent, just all 8 pieces), ben shows up and gives an assist throughout the
// fight", and "ben will 'distract' one, making the fight easier if he tags along", "ben will straight up tell you
// which weapon you should use if he's present").
//
// Embiggened with him (a head over him, as he is in the gym). At each section's start he says its weapon, straight,
// with a fake gym riddle after it. Then he goes and ties one of them up (the one further from Meathead): wrapped round
// them from behind, hanging on (HOLD_T), so that one does nothing but struggle while Meathead mostly faces the other;
// bucked off (OFF_T), he gets his breath, and goes again. A boss stunned or thrown, he lets go. Never hurt, never in
// the way (he's no target: the engine doesn't know he's there).

import type { GameState } from '../../../m1/game/core/state';
import { pickLine, isTalking } from '../../../m1/game/platform/speech';
import { benGaveCount } from '../../upgrades/state';
import { drawBen, type BenPose } from '../../upgrades/confucktious/art';
import { speak, saidOver } from '../../adventure/section';
import { floorY } from './geo';
import { type Bosses, type Boss, bossList } from './bosses';
import * as L from './lines';

type Ctx = CanvasRenderingContext2D;
/** His size next to the giant Meathead (his own art's 126 tall: about a head over him). */
export const BEN_K = 0.7;
const HOLD_T = 540, OFF_T = 240, RUN_V = 5;

export interface Ben {
  on: boolean;
  x: number; y: number; face: 1 | -1;
  mode: 'follow' | 'go' | 'hold' | 'off';
  on_: Boss | null;
  t: number;
  said: string | null;
  /** The section his weapon's been said for. */
  toldSec: number;
}
export const benHere = () => benGaveCount() >= 8;
export const newBen = (x: number): Ben => ({ on: benHere(), x, y: floorY(x), face: 1, mode: 'follow', on_: null, t: 0, said: null, toldSec: -99 });

let tok = 0;
export const benSays = (b: Ben, pool: string[], after = true) => {
  const my = ++tok;
  speak(L.BEN_VOICE, pickLine(pool), s => { if (my === tok) b.said = s?.text ?? null; }, after);
};

/** Each frame. `free`: he can grab one (the section's fight's on). Returns who he's holding, if anyone. */
export const updateBen = (state: GameState, b: Ben, bs: Bosses, free: boolean, frozen: boolean) => {
  if (!b.on) return null;
  const p = state.player, px = p.pos.x + p.width / 2;
  if (frozen) return b.mode === 'hold' ? b.on_?.who ?? null : null;
  b.t++;
  const ok = (x: Boss) => x.mode === 'walk' || x.mode === 'tell' || x.mode === 'do' || x.mode === 'recover' || x.mode === 'held';
  if (b.mode === 'hold' && b.on_) {
    const h = b.on_;
    if (!free || !ok(h) || b.t > HOLD_T) {
      if (h.mode === 'held') { h.mode = 'walk'; h.next = state.frame + 40; }
      b.mode = 'off'; b.t = 0; b.on_ = null;
      if (free && !isTalking()) benSays(b, L.BEN_OFF, false);
    } else {
      h.mode = 'held'; h.air = false; h.vx = 0;
      b.x = h.x - h.face * 4; b.y = h.y; b.face = h.face;
      return h.who;
    }
  }
  const walkTo = (x: number, v: number) => { const d = x - b.x; if (Math.abs(d) > 6) { b.x += Math.sign(d) * Math.min(v, Math.abs(d)); b.face = d > 0 ? 1 : -1; } b.y = floorY(b.x); return Math.abs(d) <= 8; };
  if (b.mode === 'off') { walkTo(px - 70, 3); if (b.t > OFF_T) { b.mode = 'follow'; b.t = 0; } return null; }
  if (b.mode === 'follow') {
    walkTo(px - 70, 4.5);
    if (free && b.t > 60) {
      // (the one further from him)
      const pick = bossList(bs).filter(x => ok(x) && !x.air).sort((u, v) => Math.abs(v.x - px) - Math.abs(u.x - px))[0];
      if (pick) { b.mode = 'go'; b.on_ = pick; b.t = 0; }
    }
    return null;
  }
  if (b.mode === 'go' && b.on_) {
    const h = b.on_;
    if (!free || !ok(h)) { b.mode = 'follow'; b.on_ = null; return null; }
    if (walkTo(h.x - h.face * 4, RUN_V) || b.t > 300) {
      b.mode = 'hold'; b.t = 0; h.mode = 'held'; h.move = null; h.air = false;
      if (!isTalking()) benSays(b, h.who === 'satan' ? L.BEN_GRAB_SATAN : L.BEN_GRAB, false);
    }
  }
  return null;
};

/** He says the section's weapon (once a section, as it starts; waits his turn). */
export const benTell = (b: Ben, sec: number, key: string) => {
  if (!b.on || b.toldSec === sec) return;
  const pool = L.BEN_WEAPON[key];
  if (!pool) return;
  b.toldSec = sec;
  benSays(b, pool, true);
};

/** Him (and the boss he's on, round them from behind: drawn after them). */
export const drawBenGiant = (c: Ctx, state: GameState, b: Ben) => {
  if (!b.on) return;
  // (holding one: wrapped round its leg from the front, fists on it, shaken about; bucked off: winded)
  const pose: BenPose = b.mode === 'hold' ? 'brace' : b.mode === 'off' ? 'nuts' : 'stand';
  const jig = b.mode === 'hold' ? Math.round(Math.sin(state.frame * 0.5) * 2) : 0;
  c.save(); c.translate(Math.round(b.x) + jig, Math.round(b.y)); c.scale(BEN_K, BEN_K);
  drawBen(c, 0, 0, b.face, pose, state.frame >> 3, null);
  c.restore();
};
export const drawBenSaid = (c: Ctx, b: Ben) => { if (b.on && b.said) saidOver(c, b.said, b.x, b.y - 126 * BEN_K - 12, '#FDE68A'); };
