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
import { solid } from '../section';
import { INK, box, checker, hazeBands, bandedGradient, plaque, spikeUp, put, blockFill, chain, STONE, IRON, WOOD } from './paint';
import { pixelBlob } from '../../intro/art/kit';
import { signAt, blood } from '../letters';
import { GORE, splat, drips, guestOf, impaledGuest, skeleton, earHat, souvenirCup, selfieStick, parkMap, ticket } from './remains';
import { SECTIONS, GY } from '../geometry';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { registerHurtLines } from '../../kinds';
import { updateVines, drawVines, onVine, newVineStore, VINE_ROW, type VineDef, type VineOpts, type VineStore } from '../../adventure/jungle/vines';
import { spawnStaff } from '../castle/staff';
import { hazardVictims, hazardKill, setHazardZones } from '../../hazardHit';
import * as L from './lines';
import { pitDeath } from './pitDeaths';

registerHurtLines('spooky_spikepit', L.HURT_SPIKEPIT, L.DEATH_SPIKEPIT);
registerHurtLines('spooky_vat', L.HURT_VAT, L.DEATH_VAT);

/** (from the foot of the dungeon stairs, past the 2000-wide ceiling chamber) */
const X = (dx: number) => SECTIONS.dungeon.x0 + 1950 + 800 + dx;
/** The pits: where, how deep their floor (or the vat's surface) is, what's in them. */
export const PITS: { a: number; b: number; depth: number; kind: 'ditch' | 'spikes' | 'vat' }[] = [
  // (the one in the ceiling chamber, under its fast middle section: index.ts)
  { a: X(1850), b: X(1960), depth: 110, kind: 'spikes' },
  { a: X(2780), b: X(3020), depth: 50, kind: 'ditch' },
  { a: X(3140), b: X(3780), depth: 110, kind: 'spikes' },
  { a: X(3900), b: X(4380), depth: 70, kind: 'vat' },
];
const BEAM = GY - 440, LEN = 300;
export const ROPES: VineDef[] = [X(2900), X(3270), X(3465), X(3660), X(3990), X(4140), X(4290)].map(x => ({ x, y: BEAM, len: LEN, kind: 'swing' as const }));

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
  // (the passage's roof: the ropes' beam is the top of it, from the chamber's far door to the exit; nobody's going over)
  solid(state, X(2600), BEAM - 400, SECTIONS.dungeon.x1 + 200 - X(2600), 400, { hidden: true, tag: 'dungeon-roof' });
  // (over the vat: the bat suit on his wire, a couple of bats)
  spawnStaff(state, 'batsuit', X(4140), GY - 250, 61);
  spawnStaff(state, 'bat', X(3500), GY - 330, 62); spawnStaff(state, 'bat', X(4300), GY - 300, 63);
};

export const runRopes = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const out = updateVines(ctx, ROPES, controls, ROPE_OPTS);
  // Into a pit: the ditch, climb out; the spikes, HOT FOOT's kin: hurt, and popped up and out toward the nearer edge
  // (never left bouncing about on them); the vat of lard: that's it, deep fried
  const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
  for (const pit of PITS) {
    if (cx < pit.a || cx > pit.b || pit.kind === 'ditch' || p.health <= 0) continue;
    const surface = GY + (pit.kind === 'vat' ? 30 : pit.depth - 6);
    if (feet < surface) continue;
    pitDeath.floor = pit.kind === 'vat' ? surface : GY + pit.depth;
    const bank = cx - pit.a < pit.b - cx ? -1 : 1, out = bank * Math.min(6, 2.5 + Math.min(cx - pit.a, pit.b - cx) / 40);
    if (pit.kind === 'spikes') {
      if (p.invincibilityTimer <= 0) { playSound('crunch', 1, -4); playSound('splat', 0.7, -2); hurtPlayer(ctx, 20, 'spooky_spikepit', { x: out, y: -14 }); if (p.health > 0) ctx.fx.spawnDamageNumber({ x: cx - 30, y: p.pos.y - 20 }, 'POINTY!', true, '#FCA5A5'); }
      if (p.health > 0) { p.vel.y = -14; if (p.pushbackTimer > 0 || Math.sign(p.vel.x) !== bank) p.vel.x = out; p.isGrounded = false; p.isCharging = false; p.isSliding = false; }
    } else { playSound('splash', 1, -6); playSound('ignite', 0.6, -6); hurtPlayer(ctx, 9999, 'spooky_vat'); }
    for (let k = 0; k < 12; k++) state.particles.push({ pos: { x: cx, y: surface }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 30, color: pit.kind === 'vat' ? '#FBBF24' : '#B91C1C', size: 3 + Math.random() * 3, grav: 0.3 });
    shakeScreen(state, 6, 3);
  }
  // Whoever else ends up in one (knocked in off the edge): the spikes or the lard has them. And they keep out of them
  for (const e of hazardVictims(state, { flyers: false })) {
    const ex = e.pos.x + e.width / 2, pit = PITS.find(q => q.kind !== 'ditch' && ex > q.a && ex < q.b);
    if (!pit || e.pos.y + e.height < GY + (pit.kind === 'vat' ? 30 : pit.depth - 6)) continue;
    if (pit.kind === 'spikes') hazardKill(ctx, e, ex, 'SKEWERED!', { fling: { x: 0, y: -4 }, sound: 'splat' });
    else { ctx.fx.killWithAnimation(e, 'charred', 'flamethrower_kill', 'cooked'); playSound('ignite', 0.8, -4); ctx.fx.spawnDamageNumber({ x: e.pos.x, y: e.pos.y - 30 }, 'DEEP FRIED!', true, '#FBBF24'); }
  }
  setHazardZones(state, 'dungeon-pits', PITS.filter(q => q.kind !== 'ditch').map(q => ({ x0: q.a, x1: q.b, y0: GY - 10, y1: GY + q.depth + 40, ground: true })));
  return out;
};

// ---------------------------------------------------------------------------------------------------------------

const seen = (state: GameState, a: number, b: number) => b > state.camera.x - 100 && a < state.camera.x + 900;

/** One pit, still (stamped): its back wall going on down into it (stone, chains, hooks, a crude painted warning,
 *  blood), its stone sides, and what's in it: the ditch's dirt; the spike bed and the guests on it; the vat's walls
 *  above the lard. Origin at (p.a, GY). */
const paintPit = (g: CanvasRenderingContext2D, p: (typeof PITS)[number], i: number) => {
  const w = p.b - p.a, d = p.depth;
  g.fillStyle = blockFill(g, 'pit', '#38322C'); g.fillRect(0, 0, w, d + 200);
  hazeBands(g, 0, 0, w, d + 60, '#060504', 0.15, 0.7, 5);
  // (chains hung down into it, a meat hook on one; blood run down the stone)
  for (let x = 24; x < w - 20; x += 96) { chain(g, x, 0, 30 + (x % 3) * 12); }
  if (w > 200) { const hx = 70; box(g, hx - 1, 40, 3, 10, IRON[3]); g.strokeStyle = IRON[3]; g.lineWidth = 2; g.beginPath(); g.arc(hx + 4, 52, 5, Math.PI, Math.PI * 0.2, true); g.stroke(); }
  drips(g, 6, 0, w - 12, Math.max(3, Math.floor(w / 40)), 40, i * 17);
  for (let k = 0; k < Math.floor(w / 120) + 1; k++) splat(g, 30 + ((k * 137 + i * 53) % Math.max(1, w - 60)), 26 + (k % 2) * 18, 16, 10, k + i);
  // (the crude warning, slapped on in paint)
  const words = p.kind === 'vat' ? 'NO SWIMMING' : p.kind === 'spikes' ? (w > 300 ? 'MIND THE GAP' : 'MIND') : 'OOPS';
  signAt(g, words, w / 2, p.kind === 'vat' ? 22 : 30, 6, { ...blood(6, '#B8B0A0', undefined, i), ink: undefined, shadow: '#1A0E0A', wobble: 1, drip: { col: '#9A9284', rate: 0.4, len: 5 } });
  // (its stone sides, lit at the lip)
  for (const [x, s] of [[-6, 1], [w, -1]] as const) { box(g, x, 0, 6, d + 200, STONE[1]); box(g, s > 0 ? x + 4 : x, 0, 2, d + 200, INK); box(g, x, 0, 6, 4, STONE[4]); }
  if (p.kind === 'ditch') {
    // (the ditch's floor: dirt, somewhere to stand, lit along its top; a dropped map, a ticket)
    box(g, 0, d, w, 2, '#B8A88A'); box(g, 0, d + 2, w, 2, '#8A7A5E'); checker(g, 0, d + 4, w, 2, '#8A7A5E');
    box(g, 0, d + 6, w, 194, '#3A3024');
    for (let k = 0; k < 6; k++) box(g, 10 + ((k * 41) % (w - 20)), d + 10 + (k % 3) * 6, 6, 2, '#5A4A36');
    parkMap(g, w * 0.3, d); ticket(g, w * 0.7, d);
  }
  if (p.kind === 'spikes') {
    // (the spike bed: points all the way across, no flat to it; the blood pooled between them; who fell in)
    const bed = d;
    box(g, 0, bed - 6, w, 206, '#1A1210'); box(g, 0, bed - 6, w, 6, GORE[1]); checker(g, 0, bed - 10, w, 4, GORE[1]);
    // (what fell to the bottom between the spikes: bones, a cup, a hat)
    if (w > 300) { souvenirCup(g, w * 0.32, bed - 2, true); earHat(g, w * 0.9, bed - 4, 0); } else earHat(g, w * 0.75, bed - 4, 1);
    for (let x = 2; x < w - 12; x += 16) spikeUp(g, x, bed, 14, bed - 34 - (x % 48 === 2 ? 4 : 0));
    for (let x = 9; x < w - 14; x += 32) { box(g, x, bed - 30, 3, 14, GORE[2]); box(g, x, bed - 16, 2, 14, GORE[1]); box(g, x - 1, bed - 33, 4, 3, GORE[3]); }
    // (and who's up on them: run through, sagged over the tips)
    if (w > 300) {
      skeleton(g, w * 0.06, bed - 30, true);
      impaledGuest(g, w * 0.42, bed - 26, guestOf(31 + i), [14, 30, 52]);
      impaledGuest(g, w * 0.7, bed - 28, guestOf(47 + i), [10, 40]);
      selfieStick(g, w * 0.6, bed - 32, 30);
    } else skeleton(g, w * 0.2, bed - 30, false);
  }
  if (p.kind === 'vat') {
    // (the vat's inside wall above the lard: scorched, splashed)
    hazeBands(g, 0, 0, w, 34, '#1A0A04', 0.2, 0.6, 3);
  }
};
/** What floats in the lard (bones, a skull, an ears hat): live, it bobs. */
const flotsam = (c: CanvasRenderingContext2D, p: (typeof PITS)[number], f: number) => {
  const w = p.b - p.a;
  for (const [k, u] of [[0, 0.18], [1, 0.45], [2, 0.7], [3, 0.88]] as const) {
    const x = p.a + w * u, y = GY + 30 + Math.round(Math.sin(f * 0.06 + k * 2) * 1.5);
    if (k === 0) { box(c, x - 1, y - 7, 14, 9, INK); box(c, x, y - 6, 12, 7, '#C8B898'); box(c, x + 2, y - 4, 3, 3, INK); box(c, x + 7, y - 4, 3, 3, INK); }
    else if (k === 2) earHat(c, x, y - 1, 0);
    else { box(c, x - 1, y - 4, 22, 5, INK); box(c, x, y - 3, 20, 3, '#C8B898'); box(c, x - 2, y - 5, 4, 6, '#C8B898'); box(c, x + 18, y - 5, 4, 6, '#C8B898'); }
  }
};

export const drawRopeWalk = (c: CanvasRenderingContext2D, state: GameState) => {
  const f = state.frame;
  if (!seen(state, X(1800), X(4400))) return;
  // The roof over the rope walk (solid: nobody's going over): masonry down to the beam line, a molding along its foot
  if (seen(state, X(2600), SECTIONS.dungeon.x1 + 200)) {
    const a = Math.max(X(2600), state.camera.x - 40), b = Math.min(SECTIONS.dungeon.x1 + 200, state.camera.x + 900), top = BEAM - 1200;
    c.save(); c.translate(0, BEAM); c.fillStyle = blockFill(c, 'roof', '#3E3832'); c.fillRect(a, top - BEAM, b - a, 1200 - 22); c.restore();
    hazeBands(c, a, top, b - a, 1100, '#060504', 0.8, 0.1, 6);
    box(c, a, BEAM - 40, b - a, 18, INK); box(c, a, BEAM - 39, b - a, 16, STONE[2]); box(c, a, BEAM - 39, b - a, 2, STONE[3]); box(c, a, BEAM - 25, b - a, 2, STONE[0]);
    for (let x = Math.floor(a / 40) * 40; x < b; x += 40) box(c, x, BEAM - 35, 6, 8, STONE[1]);
    // (its end, at the chamber's far door: a corbel down to the wall)
    if (seen(state, X(2600) - 40, X(2600) + 60)) { box(c, X(2600) - 1, BEAM - 60, 30, 62, INK); box(c, X(2600), BEAM - 60, 28, 60, STONE[2]); box(c, X(2600), BEAM - 60, 3, 60, STONE[3]); }
  }
  // The beam the ropes hang off, the length of it: an oak beam, iron-strapped, on iron brackets up into the roof
  if (seen(state, X(2760), X(4400))) {
    const a = Math.max(X(2760), state.camera.x - 40), b = Math.min(X(4400), state.camera.x + 900);
    box(c, a, BEAM - 23, b - a, 20, INK); box(c, a, BEAM - 22, b - a, 18, WOOD[2]); box(c, a, BEAM - 22, b - a, 3, WOOD[3]); box(c, a, BEAM - 8, b - a, 4, WOOD[0]);
    for (let x = Math.floor(a / 24) * 24; x < b; x += 24) box(c, x, BEAM - 17, 8, 1, WOOD[1]);
    for (let x = X(2780); x < X(4400); x += 320) if (seen(state, x - 10, x + 30)) {
      box(c, x - 6, BEAM - 25, 22, 24, INK); box(c, x - 5, BEAM - 24, 20, 22, IRON[1]); box(c, x - 5, BEAM - 24, 20, 2, IRON[3]); box(c, x - 1, BEAM - 16, 3, 3, IRON[4]); box(c, x + 8, BEAM - 16, 3, 3, IRON[4]);
    }
  }
  plaque(c, X(3085), BEAM + 40, 'THE ROPE WALK: HOLD ON', '#27272A', '#FCD34D');
  PITS.forEach((p, i) => {
    if (!seen(state, p.a - 20, p.b + 20)) return;
    const w = p.b - p.a;
    put(c, `dPit:${i}`, p.a, GY, -8, -4, w + 16, p.depth + 206, g => paintPit(g, p, i));
    if (p.kind === 'vat') {
      // (the lard: boiling, banded orange to gold at the top, bubbles breaking; a little steam off it (dim))
      const L = ['#5A1E06', '#8A3A0C', '#B85A14', '#D8862A', '#F0B44A'];
      bandedGradient(c, p.a, GY + 30, w, p.depth + 170, [L[2], L[1], L[0]], 6);
      // (its surface rolling: wavelets, bright on their crests)
      for (let x = p.a; x < p.b; x += 8) { const k = Math.round(Math.sin(x * 0.09 + f * 0.12) * 2 + Math.sin(x * 0.23 - f * 0.07)); box(c, x, GY + 30 + k, 8, 3, k < 0 ? L[4] : L[3]); box(c, x, GY + 33 + k, 8, 3, L[2]); }
      checker(c, p.a, GY + 38, w, 4, L[3]);
      for (let k = 0; k < 9; k++) {
        const ph = (f + k * 19) % 40, bx = p.a + 20 + ((k * 61) % (w - 40));
        if (ph < 20) { const by = GY + 26 - ph * 0.4, r = 3 + (ph >> 3); box(c, bx - r, by - r + 1, r * 2, r * 2 - 2, L[1]); box(c, bx - r + 1, by - r, r * 2 - 2, r * 2, L[1]); box(c, bx - r + 1, by - r + 1, r * 2 - 2, r * 2 - 2, L[3]); box(c, bx - r + 1, by - r + 1, 2, 2, '#FDE68A'); }
        else if (ph < 24) { box(c, bx - 6, GY + 28, 3, 2, L[4]); box(c, bx + 3, GY + 27, 3, 2, L[4]); box(c, bx - 1, GY + 25, 2, 2, L[4]); }
      }
      flotsam(c, p, f);
      for (let k = 0; k < 3; k++) { const t = (f * 0.6 + k * 40) % 120, sx = p.a + 60 + k * ((w - 120) / 2) + Math.sin((f + k * 30) * 0.05) * 6; pixelBlob(c, sx, GY + 10 - t, 10 + t * 0.12, 5 + t * 0.05, t < 80 ? '#3A3430' : '#262220'); }
      // (the vat's rim: iron, riveted, flush with the floor)
      for (const x of [p.a - 10, p.b]) { box(c, x, GY, 10, 34, INK); box(c, x + 1, GY, 8, 33, IRON[2]); box(c, x + 1, GY, 8, 2, IRON[4]); box(c, x + 3, GY + 4, 2, 2, IRON[4]); box(c, x + 3, GY + 18, 2, 2, IRON[4]); }
      plaque(c, (p.a + p.b) / 2, GY - 120, 'HOT LARD: DO NOT SWIM', '#7C2D12', '#FED7AA', '#A8501A');
    }
  });
  drawVines(c, state, ROPES, ROPE_OPTS);
};
