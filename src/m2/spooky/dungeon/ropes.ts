// THE ROPE WALK: past the spiked ceiling's chamber, the dungeon's passage on to the emergency exit, over three pits on
// ropes (Adventure Land's swinging vines, the same physics and moves: jungle/vines.ts, with the dungeon's own store and
// a hemp rope's look):
//   the ditch:   one rope over a shallow ditch (fall in, climb out: nothing lost). The teach.
//   the spikes:  a long pit of spikes, three ropes in a row. Fall in: it hurts, and he's back at its edge.
//   the vat:     a sunk vat of boiling lard, two ropes over it, a bat-suit staffer on his wire and bats over it to shoot
//                while he swings. Fall in: it hurts more (boiled), and he's back at its edge.
// A rest stop of floor between each.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { GroundRun } from '../../../m1/game/core/terrain';
import { solid, box, wallSign, teleport } from '../section';
import { SECTIONS, GY } from '../geometry';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { registerDeathKind } from '../../../m1/game/player/deathAnim';
import { updateVines, drawVines, onVine, newVineStore, VINE_ROW, type VineDef, type VineOpts, type VineStore } from '../../adventure/jungle/vines';
import { spawnStaff } from '../castle/staff';
import * as L from './lines';

registerHurtLines('spooky_spikepit', L.HURT_SPIKEPIT, L.DEATH_SPIKEPIT);
registerHurtLines('spooky_vat', L.HURT_VAT, L.DEATH_VAT);
registerDeathKind('spooky_vat', 'boiled');

const X = (dx: number) => SECTIONS.dungeon.x0 + dx;
/** The pits: where, how deep their floor (or the vat's surface) is, what's in them. */
export const PITS: { a: number; b: number; depth: number; kind: 'ditch' | 'spikes' | 'vat' }[] = [
  { a: X(2780), b: X(3020), depth: 50, kind: 'ditch' },
  { a: X(3140), b: X(3780), depth: 110, kind: 'spikes' },
  { a: X(3900), b: X(4380), depth: 70, kind: 'vat' },
];
const BEAM = GY - 440, LEN = 300;
export const ROPES: VineDef[] = [X(2900), X(3270), X(3465), X(3660), X(4030), X(4255)].map(x => ({ x, y: BEAM, len: LEN, kind: 'swing' as const }));

// (the ropes' swings and his hold: the dungeon's own, a fresh lot each time the stage is built)
const STORES = new WeakMap<object, VineStore>();
const store = (state: GameState) => { const k = state.stage as object; let s = STORES.get(k); if (!s) { s = newVineStore(); STORES.set(k, s); } return s; };
export const ROPE_OPTS: VineOpts = { store, style: 'rope', firstLines: L.MH_ROPE };
export const onRope = (state: GameState) => onVine(state, ROPE_OPTS);
export const ropeRow = (state: GameState) => (onRope(state) ? VINE_ROW : undefined);

/** The dungeon's floor, round the pits. */
export const floorRuns = (x0: number, x1: number): GroundRun[] => {
  const out: GroundRun[] = [];
  let a = x0;
  for (const p of PITS) { out.push({ x1: a, y1: GY, x2: p.a, y2: GY, surface: 'hard' }); a = p.b; }
  out.push({ x1: a, y1: GY, x2: x1, y2: GY, surface: 'hard' });
  return out;
};
export const buildRopes = (state: GameState) => {
  // (each pit's bottom: the ditch's floor, the spike bed, the vat's bottom under the lard)
  for (const p of PITS) solid(state, p.a, GY + p.depth, p.b - p.a, 200, { hidden: true, tag: 'dungeon-pit' });
  // (over the vat: the bat suit on his wire, a couple of bats)
  spawnStaff(state, 'batsuit', X(4140), GY - 250, 61);
  spawnStaff(state, 'bat', X(3500), GY - 330, 62); spawnStaff(state, 'bat', X(4300), GY - 300, 63);
};

export const runRopes = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const out = updateVines(ctx, ROPES, controls, ROPE_OPTS);
  // Into a pit: the ditch, climb out; the spikes and the vat, hurt, and back up at the edge he came from
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const pit of PITS) {
    if (cx < pit.a || cx > pit.b || pit.kind === 'ditch' || p.health <= 0) continue;
    const surface = GY + (pit.kind === 'vat' ? 30 : pit.depth - 6);
    if (feet < surface) continue;
    const back = cx - pit.a < pit.b - cx ? pit.a - 40 : pit.b + 40;
    if (pit.kind === 'spikes') { playSound('crunch', 1, -4); playSound('splat', 0.7, -2); hurtPlayer(ctx, 20, 'spooky_spikepit', { x: 0, y: -4 }); }
    else { playSound('splash', 1, -6); playSound('ignite', 0.6, -6); hurtPlayer(ctx, 26, 'spooky_vat', { x: 0, y: -4 }); }
    for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: cx, y: surface }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 30, color: pit.kind === 'vat' ? '#FBBF24' : '#B91C1C', size: 3 + Math.random() * 3, grav: 0.3 });
    shakeScreen(state, 6, 3);
    if (p.health > 0) teleport(state, back, GY);
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------------------

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + 900;
export const drawRopeWalk = (c: CanvasRenderingContext2D, state: GameState) => {
  const f = state.frame;
  if (!seen(state, X(2700), X(4400))) return;
  // The beam the ropes hang off, the length of it, on brackets
  box(c, X(2760), BEAM - 22, X(4400) - X(2760), 18, '#4A3018'); box(c, X(2760), BEAM - 22, X(4400) - X(2760), 3, '#6A4A28');
  for (let x = X(2780); x < X(4400); x += 320) box(c, x, BEAM - 60, 10, 40, '#3A2418');
  wallSign(c, X(3460), BEAM - 60, 'THE ROPE WALK: HOLD ON', '#27272A', '#FCD34D');
  for (const p of PITS) {
    if (!seen(state, p.a, p.b)) continue;
    const w = p.b - p.a;
    box(c, p.a, GY, w, p.depth + 200, '#0C0908');
    box(c, p.a - 4, GY, 4, p.depth, '#57524C'); box(c, p.b, GY, 4, p.depth, '#57524C');
    if (p.kind === 'ditch') { box(c, p.a, GY + p.depth, w, 4, '#A8A29E'); box(c, p.a, GY + p.depth + 4, w, 40, '#2A2420'); }
    if (p.kind === 'spikes') {
      c.fillStyle = '#A8A29E'; c.beginPath();
      for (let x = p.a + 4; x < p.b - 14; x += 18) { c.moveTo(x, GY + p.depth); c.lineTo(x + 14, GY + p.depth); c.lineTo(x + 7, GY + p.depth - 34); }
      c.fill();
      c.fillStyle = '#7F1D1D'; for (let x = p.a + 9; x < p.b - 14; x += 54) c.fillRect(x, GY + p.depth - 30, 4, 10);
      // (an old skeleton prop on the spikes, for the look of it)
      box(c, p.a + w * 0.6, GY + p.depth - 40, 50, 8, '#E7E2D6'); box(c, p.a + w * 0.6 - 10, GY + p.depth - 46, 14, 12, '#E7E2D6');
    }
    if (p.kind === 'vat') {
      // (the vat's rim, iron, riveted; the lard, boiling)
      box(c, p.a - 8, GY - 10, w + 16, 12, '#3F3F46'); for (let x = p.a; x < p.b; x += 30) box(c, x, GY - 7, 4, 4, '#71717A');
      box(c, p.a, GY + 30, w, p.depth + 170, '#C2410C'); box(c, p.a, GY + 30, w, 6, '#FBBF24');
      for (let k = 0; k < 8; k++) { const ph = (f + k * 19) % 40; if (ph < 20) box(c, p.a + 20 + ((k * 61) % (w - 40)), GY + 26 - ph * 0.5, 8, 8, '#FDE68A'); }
      wallSign(c, (p.a + p.b) / 2, GY - 120, 'HOT LARD: DO NOT SWIM', '#7C2D12', '#FED7AA');
    }
  }
  drawVines(c, state, ROPES, ROPE_OPTS);
};
