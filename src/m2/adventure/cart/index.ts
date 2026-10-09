// THE MINE CART (Donkey Kong Country style). He's put in a cart at the loading station (the temple hands him over:
// `cartBoarded`), and off it goes down the actual dangerous track: gaps to jump (jump: the cart and him with it),
// low beams to duck under (down), and he can nudge it on a bit or hold it back a bit (right / left). It rolls out of the
// station slowly, past a guest scanner that reads him as UNFRIENDLY and throws the switch at the fork (FRIENDLY GUESTS
// straight on, UNFRIENDLY GUESTS up the hill: there to be seen), then gets going up the hill. Halfway, Safari Artie
// comes up behind him in a cart of his own (the first time: `chase`): too slow and he rams him. Shooting him back
// slows him. At the end (a cutscene: THE END OF THE LINE) the track curves up and goes straight up, and the two of
// them fly off the top of it, on up through the temple's roof.
//
// Crude on purpose (the first pass): boxes and lines.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, box, label, saidOver, hands, getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { HOLE_X as ROOF_HOLE_X } from '../roof';
import { setUi } from '../../store';
import { silenceAll } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { drawSafariArtie } from '../river/artie';
import {
  type Dressed, MEATHEAD_UNFRIENDLY, MEATHEAD_ARTIE_AGAIN, ARTIE_CHASE_START, ARTIE_TAUNT, ARTIE_BUMP, ARTIE_SHOT, ARTIE_RAMP,
  HURT_BEAM, DEATH_BEAM, HURT_ARTIE, DEATH_ARTIE, HURT_PIT, DEATH_PIT,
} from './lines';

const { x0, x1 } = SECTIONS.cart;
const X = x0;

registerHurtLines('cart_beam', HURT_BEAM, DEATH_BEAM);
registerHurtLines('cart_artie', HURT_ARTIE, DEATH_ARTIE);
registerHurtLines('cart_pit', HURT_PIT, DEATH_PIT);

const pick = <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** First time through (return trips will differ: no Artie, say). One flag per set piece. */
const firstVisit = (_state: GameState) => true;

// ---------------------------------------------------------------------------------------------------------------
// The track: runs of rail (x from, x to, y from, y to: from X, and from GY), with the gaps between them

const RUNS: [number, number, number, number][] = [
  [0, 1200, 0, 0],            // the loading station, out of it (slowly), the scanner, the fork
  [1200, 1950, 0, -260],      // UNFRIENDLY GUESTS: up the hill (and getting going)
  [1950, 2500, -260, -260],
  [2500, 2900, -260, -200],   // down a dip
  [3060, 3800, -200, -200],   // (the first gap: 160; the first beam)
  [3800, 4700, -200, -260],
  [4700, 5400, -260, -260],   // (the checkpoint; Artie)
  [5580, 6200, -260, -200],
  [6200, 6900, -200, -200],
  [7080, 7500, -200, -120],
  [7500, 8200, -120, -120],
  [8400, 9000, -120, -260],
  [9000, 9700, -260, -100],
  [9880, 10600, -100, -100],
  [10600, 11200, -100, -100],
  [11380, 11700, -100, -100], // and the ramp
].map(([a, b, ya, yb]) => [X + a, X + b, GY + ya, GY + yb]);
/** Where it curves up to go straight up, and how tight; where the straight-up rail ends (they fly off it). */
const RAMP_X = X + 11700, RAMP_R = 200, RAMP_Y = GY - 100, RAIL_TOP = RAMP_Y - RAMP_R - 520;
/** Low beams over the track (duck). */
const BEAMS = [3450, 6500, 7850, 9500, 10300, 10950].map(b => X + b);
const SCANNER_X = X + 760, FORK_X = X + 1150, CHASE_X = X + 5450;
/** Out of the station it rolls slowly to here (the scanner and the fork: there to be seen), then gets up to speed. */
const SLOW_TO = FORK_X + 250;
/** (where the camera holds a moment, rolling by: the scanner, the switch and both signs in view at once) */
const FORK_CAM_X = X + 590;
/** Past the last gap: the end of the line, a cutscene from here (no more steering). */
const OUTRO_X = X + 11420;
/** How far the beam's bottom is over the rail, and how far down in the cart his feet are. */
const BEAM_CLEAR = 66, SINK = 14;

const runAt = (x: number) => RUNS.find(r => x >= r[0] && x <= r[1]);
const trackY = (x: number): number | null => { const r = runAt(x); return r ? r[2] + ((x - r[0]) / (r[1] - r[0])) * (r[3] - r[2]) : null; };
/** (Artie's cart: over a gap, it hops it) */
const artieTrackY = (x: number) => {
  const y = trackY(x);
  if (y !== null) return y;
  const before = [...RUNS].reverse().find(r => r[1] < x), after = RUNS.find(r => r[0] > x);
  if (!before || !after) return GY;
  const u = (x - before[1]) / (after[0] - before[1]);
  return before[3] + (after[2] - before[3]) * u - Math.sin(u * Math.PI) * 70;
};

// ---------------------------------------------------------------------------------------------------------------

/** One of them (him, or Artie) at the end of the line: along it (s, from OUTRO_X: behind it, below 0), then off the top. */
interface Flier {
  s: number; v: number;
  /** Where the cart is, and its tilt. */
  x: number; y: number; rot: number;
  /** Off the top of the rail: flying (the cart's own fall), how long, and how far up out of the cart he's gone. */
  fly: boolean; vy: number; t: number; out: number;
  /** (the cart, falling away: off to one side) */
  drift: number;
}
const flier = (s: number, v: number): Flier => ({ s, v, x: 0, y: 0, rot: 0, fly: false, vy: 0, t: 0, out: 0, drift: 0 });

interface Cart {
  /** Not on yet, riding, the end of the line (the cutscene: up the ramp and off the top), gone (on to the roof). */
  mode: 'off' | 'ride' | 'outro' | 'gone';
  x: number; y: number; railY: number; vy: number; speed: number; air: boolean;
  /** (a beam that's had him already) */
  beamsHit: Set<number>;
  jumpWas: boolean;
  t: number;
  scanned: boolean; scanT: number;
  /** The end of the line: how long in, him, and the fade out (on to the roof). */
  outT: number; me: Flier | null; fade: number;
  /** Safari Artie, after him in a cart (first time through). */
  chase: boolean;
  artie: { on: boolean; x: number; v: number; said: Said | null; next: number; bumpT: number; shotSaid: number; end: Flier | null };
}
const getCart = (state: GameState) => sectionState<Cart>(state, 'cart', () => ({
  mode: 'off', x: X + 150, y: GY, railY: GY, vy: 0, speed: 0, air: false, beamsHit: new Set(), jumpWas: false,
  t: 0, scanned: false, scanT: 0, outT: 0, me: null, fade: 0,
  chase: firstVisit(state),
  artie: { on: false, x: 0, v: 0, said: null, next: 0, bumpT: 0, shotSaid: 0, end: null },
}));

const artieSays = (cart: Cart, text: string) => {
  if (cart.artie.said) return;
  cart.artie.said = { text };
  speak('m2.safari', text, s => { cart.artie.said = s; });
};

/** Puts him in it, where he is (from the temple's loading station, or back at a checkpoint). */
const board = (state: GameState, cart: Cart) => {
  const p = state.player;
  // (on a rail, never over a gap, nor past the end of the line)
  let at = Math.max(X + 150, Math.min(OUTRO_X - 200, p.pos.x + p.width / 2));
  if (trackY(at) === null) at = (RUNS.find(r => r[0] > at) ?? RUNS[0])[0] + 20;
  cart.mode = 'ride'; cart.x = at; cart.y = trackY(at) ?? GY; cart.railY = cart.y; cart.vy = 0; cart.speed = 0; cart.air = false;
  // (past the scanner already: it's done its job)
  if (at > SCANNER_X) cart.scanned = true;
  p.carried = true;
};

const place = (state: GameState, cart: Cart) => {
  const p = state.player;
  p.pos.x = cart.x - p.width / 2; p.pos.y = cart.y - SINK - p.height;
  p.vel.x = 0; p.vel.y = 0;
};

const ride = (ctx: FrameContext, cart: Cart, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  cart.t++;
  // Speed: out of the station slowly (the scanner, the fork); then up to speed, up the hill. On a bit (right), held
  // back a bit (left)
  const slow = cart.x < SLOW_TO;
  const want = slow ? (controls.right ? 4.2 : 3.2) : controls.right ? 9.2 : controls.left ? 5 : 7;
  const cap = Math.min(cart.t / 6, slow ? want : 3.2 + (cart.x - SLOW_TO) * 0.01);
  cart.speed += (Math.min(want, cap) - cart.speed) * 0.06;
  cart.x += cart.speed;
  // The end of the line: from here it's a cutscene (on the rail, whatever he was doing: never off the end of it)
  if (cart.x >= OUTRO_X) {
    const ty = trackY(Math.min(cart.x, RAMP_X));
    if (ty !== null) { startOutro(state, cart); return hands(); }
  }
  // Jump: the cart and him in it
  const jumpNow = !!controls.jump;
  if (jumpNow && !cart.jumpWas && !cart.air) { cart.vy = -10.5; cart.air = true; playSound('jump', 0.7); playSound('clang', 0.3, 8); }
  cart.jumpWas = jumpNow;
  const ty = trackY(cart.x);
  if (cart.air) {
    cart.vy += 0.5; cart.y += cart.vy;
    if (ty !== null && cart.vy >= 0 && cart.y >= ty && cart.y - cart.vy <= ty + 14) {
      cart.y = ty; cart.vy = 0; cart.air = false; playSound('land', 0.8); playSound('clang', 0.5, -4); shakeScreen(state, 4, 2);
    }
  } else if (ty === null) {
    // Off the end of the rail: over the gap, falling (it carries on the way the rail was going)
    const r = [...RUNS].reverse().find(q => q[1] < cart.x);
    cart.vy = r ? ((r[3] - r[2]) / (r[1] - r[0])) * cart.speed : 0;
    cart.air = true;
  } else cart.y = ty;
  // Down the gap: that's him
  if (!cart.air) cart.railY = cart.y;
  if (cart.y > cart.railY + 300) {
    hurtPlayer(ctx, 9999, 'cart_pit');
    if (p.health <= 0) { p.carried = false; cart.mode = 'off'; return controls; }
    // (still alive, somehow: the cheat. Back on the rail, past the gap)
    const next = RUNS.find(r => r[0] > cart.x) ?? RUNS[RUNS.length - 1];
    cart.x = next[0] + 20; cart.y = cart.railY = trackY(cart.x) ?? GY; cart.vy = 0; cart.air = false;
  }
  // Beams: ducked under, or it's his face
  for (const b of BEAMS) {
    if (cart.beamsHit.has(b) || Math.abs(cart.x - b) > 14) continue;
    const rail = trackY(b) ?? cart.y;
    const headroom = rail - cart.y;
    if (!p.isDucking || headroom > 8) {
      cart.beamsHit.add(b);
      playSound('clang', 1, -8); playSound('punch', 0.8); shakeScreen(state, 10, 5);
      if (p.invincibilityTimer <= 0) hurtPlayer(ctx, 16, 'cart_beam');
    }
  }
  // The scanner: he's UNFRIENDLY (whatever he's wearing), and the switch goes over
  if (!cart.scanned && cart.x > SCANNER_X - 40) {
    cart.scanned = true; cart.scanT = 1;
    playSound('alarm', 0.6); playSound('beep', 0.8);
  }
  if (cart.scanT > 0) {
    cart.scanT++;
    if (cart.scanT === 40) { playSound('clang', 0.9, -10); playSound('thud', 0.7); }
    if (cart.scanT === 50) meatheadSays(state, pick(MEATHEAD_UNFRIENDLY));
  }
  // (and off it goes, at the top of the fork)
  if (slow && cart.x + cart.speed >= SLOW_TO) playSound('grind', 0.6, -4);
  // Safari Artie, after him
  if (cart.chase) artieChase(ctx, cart);
  place(state, cart);
  // (on his feet in it, for ducking: the engine's crouch wants him on the ground)
  p.isGrounded = !cart.air;
  state.cameraRestY = cart.y - SINK - 420;
  // (facing the way it's going, always: left and right are the cart's, not his; no specials of any kind, see run)
  p.facing = 1;
  return { ...controls, left: false, right: false, jump: false, charge: false, special: false, secondary: controls.secondary };
};

const artieChase = (ctx: FrameContext, cart: Cart) => {
  const { state } = ctx, a = cart.artie;
  if (!a.on) {
    if (cart.x < CHASE_X) return;
    a.on = true; a.x = cart.x - 520; a.v = cart.speed + 3; a.next = 360;
    playSound('clang', 0.6, -6); playSound('engine', 0.6);
    a.said = { text: '' };
    speak('m2.safari', pick(ARTIE_CHASE_START[dressed(state)]), s => { a.said = s; }, true, () => meatheadSays(state, pick(MEATHEAD_ARTIE_AGAIN)));
    return;
  }
  if (cart.mode !== 'ride') { a.x += a.v; return; }
  const dist = cart.x - a.x;
  // (a shade quicker than the cart left alone: keep it going, or he's on him; well back, he closes right up)
  const target = dist > 320 ? cart.speed + 3 : 7.9;
  a.v += (target - a.v) * (a.bumpT > 0 ? 0.01 : 0.05);
  if (a.bumpT > 0) a.bumpT--;
  a.x += a.v;
  // Rammed
  if (cart.x - a.x < 78) {
    a.x = cart.x - 78; a.v = 2.5; a.bumpT = 50;
    playSound('crash', 0.8); playSound('clang', 1, -4); shakeScreen(state, 12, 6);
    cart.speed += 2.5;
    if (state.player.invincibilityTimer <= 0) hurtPlayer(ctx, 12, 'cart_artie');
    if (Math.random() < 0.6) artieSays(cart, pick(ARTIE_BUMP));
  }
  // Shot at: it slows him down (and he's got something to say about it, now and then)
  const ay = artieTrackY(a.x);
  const hitBox = { x: a.x - 36, y: ay - 80, w: 72, h: 80 };
  for (const pr of state.projectiles) {
    if (pr.owner !== 'player' || pr.health <= 0) continue;
    if (pr.pos.x + pr.width < hitBox.x || pr.pos.x > hitBox.x + hitBox.w || pr.pos.y + pr.height < hitBox.y || pr.pos.y > hitBox.y + hitBox.h) continue;
    pr.health = 0;
    a.v = Math.max(3, a.v - 1.6);
    playSound('clink', 0.7);
    for (let i = 0; i < 5; i++) state.particles.push({ pos: { x: pr.pos.x, y: pr.pos.y }, vel: { x: (Math.random() - 0.5) * 4, y: -Math.random() * 3 }, life: 14, color: '#FDE047', size: 2 });
    if (state.frame - a.shotSaid > 400) { a.shotSaid = state.frame; artieSays(cart, pick(ARTIE_SHOT)); }
  }
  if (--a.next <= 0) { a.next = 420 + Math.floor(Math.random() * 200); artieSays(cart, pick(ARTIE_TAUNT)); }
};

/** Up the curve, then straight up and out (on to the roof). */

// ---------------------------------------------------------------------------------------------------------------
// THE END OF THE LINE (a cutscene): the last of the rail, round the curve and straight up, him in front and Artie right
// behind him (if he's still after him); off the top of the rail the carts fall away and the two of them fly on up;
// fade, and the roof (they come up through it).

const PATH_FLAT = RAMP_X - OUTRO_X, PATH_ARC = (Math.PI / 2) * RAMP_R;
/** Along the end of the line: where (from OUTRO_X; behind it, below 0, on the rail before it), and the cart's tilt. */
const endPath = (s: number) => {
  if (s < PATH_FLAT) { const x = OUTRO_X + s; return { x, y: artieTrackY(x), rot: 0 }; }
  if (s < PATH_FLAT + PATH_ARC) {
    const a = (s - PATH_FLAT) / RAMP_R;
    return { x: RAMP_X + Math.sin(a) * RAMP_R, y: RAMP_Y - (1 - Math.cos(a)) * RAMP_R, rot: -0.45 * (a / (Math.PI / 2)) };
  }
  return { x: RAMP_X + RAMP_R, y: RAMP_Y - RAMP_R - (s - PATH_FLAT - PATH_ARC), rot: -0.45 };
};
/** Where the one riding it is (his feet). */
const riderY = (f: Flier) => f.y - SINK - f.out;

const startOutro = (state: GameState, cart: Cart) => {
  const p = state.player;
  cart.mode = 'outro'; cart.outT = 0; cart.fade = 0; cart.air = false; cart.vy = 0;
  cart.me = flier(Math.min(cart.x, RAMP_X) - OUTRO_X, Math.max(6, cart.speed));
  p.inCutscene = true; p.isDucking = false;
  // Artie (still after him): right behind him, close enough to see
  const a = cart.artie;
  if (a.on) {
    const gap = Math.max(150, Math.min(280, cart.x - a.x));
    a.end = flier(cart.me.s - gap, cart.me.v + 0.5);
    artieSays(cart, ARTIE_RAMP[0]);
  }
};

const stepFlier = (state: GameState, f: Flier, lead: Flier | null) => {
  if (!f.fly) {
    const onFlat = f.s < PATH_FLAT;
    // (up the ramp it really goes; Artie closing up behind)
    const target = (onFlat ? 9 : 16) + (lead && lead.s - f.s > 170 ? 1.5 : 0);
    f.v += (target - f.v) * (onFlat ? 0.08 : 0.12);
    const wasArc = f.s >= PATH_FLAT;
    f.s += f.v;
    const pt = endPath(f.s);
    f.x = pt.x; f.y = pt.y; f.rot = pt.rot;
    if (!wasArc && f.s >= PATH_FLAT) { playSound('clang', 0.7, -6); playSound('grind', 0.7, -8); }
    if (f.y <= RAIL_TOP) {
      f.fly = true; f.vy = -f.v; f.t = 0;
      playSound('whoosh', 1, lead ? -2 : -6); playSound('clang', 0.8, -10); shakeScreen(state, 8, 4);
      for (let i = 0; i < 10; i++) state.particles.push({ pos: { x: f.x, y: RAIL_TOP }, vel: { x: (Math.random() - 0.5) * 6, y: -Math.random() * 5 }, life: 24, color: i % 2 ? '#FDE047' : '#F97316', size: 2 + Math.random() * 2 });
    }
    return;
  }
  // Off the top: the cart falls away under him, tumbling; he goes on up out of it
  f.t++;
  f.vy += 0.3; f.y += f.vy; f.rot -= 0.14;
  // (his falls away out to the right, clear of Artie coming up under him)
  f.drift += lead ? -1.6 : 3;
  f.out += Math.max(0, 3.2 - f.t * 0.02);
};

const endOutro = (state: GameState, cart: Cart, skipped: boolean) => {
  const p = state.player;
  if (skipped) silenceAll();
  cart.mode = 'gone'; cart.me = null;
  // (out of the cart: his moves back, and his choice of weapon)
  p.noSpecials = false; setUi({ noSwitch: false }); cart.artie.end = null; cart.artie.on = false; cart.artie.said = null;
  (getAdv(state)!.s as Record<string, unknown>).roofArrival = true;
  state.cameraLeadX = 0; state.cameraOverride = null;
  // (still in the cutscene: the roof's carries on from here; it takes him from under the roof, in the hole)
  const rx = ROOF_HOLE_X;
  p.pos.x = rx - p.width / 2; p.pos.y = GY - 560 + 120; p.vel.x = 0; p.vel.y = 0;
  state.camera.x = rx - CANVAS_WIDTH / 2;
  state.camera.y = state.cameraRestY = GY - 560 - 420;
};

const outro = (ctx: FrameContext, cart: Cart): Controls => {
  const { state } = ctx, p = state.player;
  const me = cart.me!, a = cart.artie.end;
  cart.outT++;
  p.inCutscene = true; p.carried = true; p.facing = 1;
  if (cart.outT > SKIP_AFTER) offerSkip();
  if (cart.outT > SKIP_AFTER && takeSkip()) { endOutro(state, cart, true); return hands(); }
  stepFlier(state, me, null);
  if (a) stepFlier(state, a, me);
  // (for the rest of the cart's own business: where his is)
  cart.x = me.x; cart.y = me.y;
  p.pos.x = me.x - p.width / 2; p.pos.y = riderY(me) - p.height; p.vel.x = 0; p.vel.y = me.fly ? me.vy : -1;
  p.isGrounded = false;
  // The camera: on the two of them, the ramp in view, going up with them
  const k = Math.max(0, Math.min(1, (me.s - PATH_FLAT) / PATH_ARC));
  const camX = X + 11150 + k * 190;
  const meY = riderY(me), aY = a ? riderY(a) : meY;
  const base = RAMP_Y - SINK - 420;
  const camY = Math.min(base, (meY + aY) / 2 - 330, meY - 160);
  state.cameraOverride = { x: camX, y: camY };
  // Both off the top and well up: fade, and on to the roof
  if (!cart.fade && me.fly && me.t >= 22 && (!a || (a.fly && a.t >= 14))) cart.fade = 1;
  if (cart.fade) cart.fade++;
  // (nothing waits forever)
  if (cart.fade > 32 || cart.outT > 400) endOutro(state, cart, false);
  return hands();
};

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const c = getCart(state);
  if (p.health <= 0) { p.carried = false; return controls; }
  // (handed over by the temple, or back at a checkpoint: into the cart either way. Never out of it here, walking:
  // anywhere in the mine he's in the cart)
  if (c.mode === 'off') board(state, c);
  if (c.mode === 'gone') { p.noSpecials = false; setUi({ noSwitch: false }); return controls; }
  // (sat in it: no charge, slide, uppercut, dive kick or grab, whatever's pressed, and stuck with the weapon he got in
  // with: the one he's holding, out and pointed the way it's going)
  p.noSpecials = true; setUi({ noSwitch: true });
  // (the camera ahead of him; rolling out past the scanner, held on it and the fork a moment)
  state.cameraLeadX = c.mode !== 'ride' ? 0
    : c.x < SLOW_TO + 400 ? Math.max(Math.min(c.x - 160, FORK_CAM_X), c.x - 250) - (c.x - CANVAS_WIDTH / 2) : 150;
  if (c.mode === 'ride') return ride(ctx, c, controls);
  return outro(ctx, c);
};

export const cart: Section = {
  id: 'cart', x0, x1,
  checkpoints: [
    { name: 'THE MINE CART', cp: 50, x: X + 150, y: GY },
    { name: 'THE UNFRIENDLY TRACK', cp: 51, x: X + 5000, y: GY - 260 },
  ],
  build: (state) => {
    // (the cave's floor, way down under the track: the gaps go down to it)
    lay(state, [{ x1: x0, y1: GY + 700, x2: x1, y2: GY + 700, surface: 'concrete' }]);
  },
  update: (ctx, controls) => { const out = run(ctx, controls); setUi({ introCutscene: !!ctx.state.player.inCutscene }); return out; },
  cameraRow: () => 420,
  drawBackdrop: (c, state) => {
    const g = c.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    g.addColorStop(0, '#1C1009'); g.addColorStop(1, '#3B2414');
    c.fillStyle = g; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // (far rock, dim)
    const off = (state.camera.x * 0.3) % 160;
    for (let i = -1; i < 7; i++) box(c, i * 160 - off, 80 + ((i * 37) % 60), 90, 380, '#2A190E');
    return true;
  },
  drawBack: (c, state) => drawTrack(c, state),
  drawFront: (c, state) => drawCarts(c, state),
  drawHud: (c, state) => {
    const cart = getCart(state);
    if (cart.mode !== 'outro') return;
    if (cart.fade) { c.fillStyle = `rgba(0,0,0,${Math.min(1, cart.fade / 28)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (cart.outT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (crude)

const drawTrack = (c: CanvasRenderingContext2D, state: GameState) => {
  const L = state.camera.x - 100, R = state.camera.x + CANVAS_WIDTH + 100;
  if (R < x0 || L > x1) return;
  const f = state.frame;
  // The cave: timber frames every so often (background: dim)
  for (let x = Math.floor(L / 320) * 320; x < R; x += 320) {
    const y = artieTrackY(x);
    box(c, x - 6, y - 260, 12, 420, '#3F2A17'); box(c, x - 40, y - 266, 92, 12, '#3F2A17');
  }
  // The friendly route: straight on at the fork, into a nice tunnel (we're not going that way)
  const FRIENDLY_END = X + 2400;
  if (R > FORK_X && L < FRIENDLY_END + 200) {
    box(c, FORK_X, GY - 4, FRIENDLY_END - FORK_X, 4, '#6B7280');
    for (let x = FORK_X; x < FRIENDLY_END; x += 24) box(c, x, GY - 2, 14, 6, '#4B2E14');
    box(c, FRIENDLY_END - 300, GY - 150, 300, 150, '#7DD3FC'); box(c, FRIENDLY_END - 240, GY - 110, 180, 110, '#0C4A6E');
    label(c, "IT'S A FRIENDLY WORLD", FRIENDLY_END - 150, GY - 125, '#FDF2F8', 8);
    for (let i = 0; i < 3; i++) { const bx = X + 1600 + i * 90, bob = Math.sin(f * 0.1 + i) * 4; box(c, bx, GY - 60 + bob, 30, 40, '#F9A8D4'); box(c, bx + 8, GY - 52 + bob, 4, 4, '#000'); box(c, bx + 18, GY - 52 + bob, 4, 4, '#000'); box(c, bx + 8, GY - 40 + bob, 14, 3, '#000'); }
  }
  // The rails: the trestle under them, the ties, the rail (lit along its top: it's what he's on)
  for (const [a, b, ya, yb] of RUNS) {
    if (b < L || a > R) continue;
    for (let x = Math.max(a, Math.floor(L / 60) * 60); x <= Math.min(b, R); x += 60) {
      const y = ya + ((x - a) / (b - a)) * (yb - ya);
      box(c, x - 4, y + 4, 8, 600, '#2B1A0C');
    }
    for (let x = Math.max(a, Math.floor(L / 20) * 20); x <= Math.min(b, R); x += 20) {
      const y = ya + ((x - a) / (b - a)) * (yb - ya);
      box(c, x - 6, y, 12, 6, '#5B3A1C');
    }
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, ya - 1); c.lineTo(b, yb - 1); c.stroke();
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(a, ya - 2.5); c.lineTo(b, yb - 2.5); c.stroke();
  }
  // The ramp: round and straight up
  if (R > RAMP_X - 50 && L < RAMP_X + RAMP_R + 100) {
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 3; c.beginPath();
    box(c, RAMP_X + RAMP_R + 2, RAIL_TOP, 40, RAMP_Y + 600 - RAIL_TOP, '#2B1A0C');
    c.strokeStyle = '#9CA3AF'; c.lineWidth = 3; c.beginPath();
    c.arc(RAMP_X, RAMP_Y - RAMP_R, RAMP_R, Math.PI / 2, 0, true); c.lineTo(RAMP_X + RAMP_R, RAIL_TOP); c.stroke();
    // (where it ends: a bent stop, and nothing after it but the roof)
    box(c, RAMP_X + RAMP_R - 10, RAIL_TOP - 6, 54, 8, '#7C2D12');
    label(c, 'END OF LINE', RAMP_X + RAMP_R - 70, RAMP_Y - 250, '#F87171', 8);
    label(c, 'NO RIDERS PAST THIS POINT', RAMP_X + RAMP_R - 70, RAMP_Y - 234, '#FCA5A5', 6);
  }
  // Signs: the first gap and the first beam (to teach), and the fork
  const sign = (x: number, y: number, s: string, col = '#FDE047') => { box(c, x - 2, y, 4, 40, '#3F2A17'); box(c, x - 46, y - 22, 92, 24, '#1C1917'); label(c, s, x, y - 6, col, 7); };
  sign(X + 2780, (trackY(X + 2780) ?? GY) - 60, 'GAP AHEAD');
  sign(X + 3310, (trackY(X + 3310) ?? GY) - 60, 'LOW BEAM', '#FCA5A5');
  // Beams: hanging from above
  for (const b of BEAMS) {
    if (b < L || b > R) continue;
    const y = trackY(b) ?? GY;
    box(c, b - 12, y - BEAM_CLEAR - 500, 24, 500, '#6B4423');
    box(c, b - 30, y - BEAM_CLEAR - 18, 60, 18, '#7C4A1E');
    for (let i = 0; i < 4; i++) box(c, b - 28 + i * 15, y - BEAM_CLEAR - 18, 8, 18, i % 2 ? '#FDE047' : '#1C1917');
  }
  // The scanner and the fork
  if (R > SCANNER_X - 200 && L < FORK_X + 300) {
    const cart = getCart(state);
    box(c, SCANNER_X - 60, GY - 190, 12, 190, '#52525B'); box(c, SCANNER_X + 48, GY - 190, 12, 190, '#52525B');
    box(c, SCANNER_X - 70, GY - 220, 140, 34, '#27272A');
    label(c, 'GUEST SCANNER', SCANNER_X, GY - 198, '#A5F3FC', 7);
    if (cart.scanT > 0 && cart.scanT < 400) {
      const flash = Math.floor(cart.scanT / 8) % 2 === 0;
      const what = isNude(state) ? 'UNFRIENDLY (NO PANTS)' : isShat(state) ? 'UNFRIENDLY (SOILED)' : 'UNFRIENDLY';
      box(c, SCANNER_X - 150, GY - 290, 300, 50, '#18181B');
      label(c, 'GUEST STATUS:', SCANNER_X, GY - 270, '#E5E7EB', 8);
      label(c, what, SCANNER_X, GY - 252, flash ? '#F87171' : '#FCA5A5', 8);
      c.fillStyle = 'rgba(248,113,113,0.18)'; c.fillRect(SCANNER_X - 48, GY - 186, 96, 186);
    }
    // The switch, thrown up the hill
    const up = cart.scanT >= 40 || cart.x > FORK_X;
    box(c, FORK_X - 30, GY - 30, 20, 30, '#3F3F46');
    c.save(); c.translate(FORK_X - 20, GY - 30); c.rotate(up ? -0.6 : 0.6); box(c, -2, -30, 4, 30, '#A1A1AA'); box(c, -5, -36, 10, 8, '#DC2626'); c.restore();
    sign(FORK_X + 60, GY - 70, 'FRIENDLY GUESTS >', '#86EFAC');
    sign(FORK_X + 180, GY - 170, 'UNFRIENDLY GUESTS ^', '#FCA5A5');
  }
};

const drawCartBox = (c: CanvasRenderingContext2D, x: number, y: number, f: number, col: string, rot = 0) => {
  c.save(); c.translate(x, y); c.rotate(rot);
  box(c, -36, -36, 72, 26, col); box(c, -36, -36, 72, 4, '#D6D3D1'); box(c, -36, -14, 72, 4, '#1C1917');
  for (const wx of [-22, 22]) { c.fillStyle = '#18181B'; c.beginPath(); c.arc(wx, -6, 7, 0, Math.PI * 2); c.fill(); box(c, wx - 1 + Math.round(Math.cos(f * 0.5) * 3), -7, 2, 2, '#A1A1AA'); }
  c.restore();
};

const drawCarts = (c: CanvasRenderingContext2D, state: GameState) => {
  const cart = getCart(state);
  if (cart.mode === 'gone' || (cart.mode === 'off' && !cart.artie.on)) return;
  const f = state.frame;
  // Artie's (behind him), Artie in it, and what he's saying
  const a = cart.artie;
  if (a.end) {
    // (the end of the line: on the ramp right behind him, then flying off the top of it, arms up)
    const e = a.end, ay = riderY(e);
    drawSafariArtie(c, e.x - 4, ay, 1, f, e.fly ? 'hurt' : a.said?.text ? 'talk' : 'sit');
    drawCartBox(c, e.x + e.drift, e.y, f, '#7C2D12', e.rot);
    if (a.said?.text) saidOver(c, a.said.text, e.x, ay - 96, '#FDE68A');
  } else if (a.on && Math.abs(a.x - state.camera.x - 400) < 700) {
    const ay = artieTrackY(a.x);
    const ducking = BEAMS.some(b => Math.abs(b - a.x) < 60);
    drawSafariArtie(c, a.x - 4, ay - SINK + (ducking ? 22 : 0), 1, f, a.said?.text ? 'talk' : 'sit');
    drawCartBox(c, a.x, ay, f, '#7C2D12');
    label(c, 'TOUR', a.x, ay - 18, '#FDE68A', 7);
    if (a.said?.text) saidOver(c, a.said.text, a.x, ay - 110, '#FDE68A');
  }
  if (cart.mode === 'off') return;
  if (cart.mode === 'outro' && cart.me) { drawCartBox(c, cart.me.x + cart.me.drift, cart.me.y, f, '#57534E', cart.me.rot); return; }
  const rot = cart.air ? Math.max(-0.3, Math.min(0.3, cart.vy * 0.03)) : 0;
  drawCartBox(c, cart.x, cart.y, f, '#57534E', rot);
};
