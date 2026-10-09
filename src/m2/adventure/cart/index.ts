// THE MINE CART (Donkey Kong Country style). He's put in a cart at the loading station (the temple hands him over:
// `cartBoarded`), and off it goes down the actual dangerous track: gaps to jump (jump: the cart and him with it),
// low beams to duck under (down), and he can nudge it on a bit or hold it back a bit (right / left). A guest scanner
// at the fork reads him as UNFRIENDLY and throws the switch: FRIENDLY GUESTS straight on, UNFRIENDLY GUESTS up the
// hill. Halfway, Safari Artie comes up behind him in a cart of his own (the first time: `chase`): too slow and he
// rams him. Shooting him back slows him. At the end the track goes straight up, and out through the temple's roof.
//
// Crude on purpose (the first pass): boxes and lines.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, box, label, saidOver,  getAdv, sectionState } from '../section';
import { SECTIONS, GY } from '../geometry';
import { HOLE_X as ROOF_HOLE_X } from '../roof';
import { setUi } from '../../store';
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
  [0, 1500, 0, 0],            // the loading station, and out of it
  [1500, 2100, 0, 60],        // down a dip
  [2260, 3000, 60, 60],       // (the first gap: 160)
  [3000, 3400, 60, 0],
  [3400, 4000, 0, 0],         // the scanner, the fork
  [4000, 4700, 0, -260],      // UNFRIENDLY GUESTS: up the hill
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
/** Where it curves up to go straight up, and how tight. */
const RAMP_X = X + 11700, RAMP_R = 200, RAMP_Y = GY - 100;
/** Low beams over the track (duck). */
const BEAMS = [2700, 6500, 7850, 9500, 10300, 10950].map(b => X + b);
const SCANNER_X = X + 3500, FORK_X = X + 3950, CHASE_X = X + 5450;
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

interface Cart {
  /** Riding (or not yet on), up the ramp, out the top. */
  mode: 'off' | 'ride' | 'ramp' | 'launch';
  x: number; y: number; railY: number; vy: number; speed: number; air: boolean;
  /** (a beam that's had him already) */
  beamsHit: Set<number>;
  jumpWas: boolean;
  t: number; rampA: number; launchT: number;
  scanned: boolean; scanT: number;
  /** Safari Artie, after him in a cart (first time through). */
  chase: boolean;
  artie: { on: boolean; x: number; v: number; said: Said | null; next: number; bumpT: number; shotSaid: number } ;
}
const getCart = (state: GameState) => sectionState<Cart>(state, 'cart', () => ({
  mode: 'off', x: X + 150, y: GY, railY: GY, vy: 0, speed: 0, air: false, beamsHit: new Set(), jumpWas: false,
  t: 0, rampA: 0, launchT: 0, scanned: false, scanT: 0,
  chase: firstVisit(state),
  artie: { on: false, x: 0, v: 0, said: null, next: 0, bumpT: 0, shotSaid: 0 },
}));

const artieSays = (cart: Cart, text: string) => {
  if (cart.artie.said) return;
  cart.artie.said = { text };
  speak('m2.safari', text, s => { cart.artie.said = s; });
};

/** Puts him in it, where he is (from the temple's loading station, or back at a checkpoint). */
const board = (state: GameState, cart: Cart) => {
  const p = state.player;
  const at = Math.max(X + 150, Math.min(RAMP_X - 400, p.pos.x + p.width / 2));
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
  // Speed: on a bit (right), held back a bit (left)
  const want = controls.right ? 9.2 : controls.left ? 5 : 7;
  cart.speed += (Math.min(want, cart.t < 40 ? cart.t / 6 : want) - cart.speed) * 0.06;
  cart.x += cart.speed;
  // Up the ramp at the end
  if (cart.x >= RAMP_X && !cart.air) {
    cart.x = RAMP_X; cart.mode = 'ramp'; cart.rampA = 0;
    if (cart.artie.on) { cart.artie.said = null; artieSays(cart, ARTIE_RAMP[0]); }
    rampUp(ctx, cart);
    return {} as Controls;
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
    p.carried = false; cart.mode = 'off';
    return controls;
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
  // Safari Artie, after him
  if (cart.chase) artieChase(ctx, cart);
  place(state, cart);
  // (on his feet in it, for ducking: the engine's crouch wants him on the ground)
  p.isGrounded = !cart.air;
  state.cameraRestY = cart.y - SINK - 420;
  return { ...controls, jump: false, charge: false, special: false, secondary: controls.secondary };
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
const rampUp = (ctx: FrameContext, cart: Cart) => {
  const { state } = ctx, p = state.player;
  p.inCutscene = true;
  if (cart.mode === 'ramp') {
    cart.rampA = Math.min(Math.PI / 2, cart.rampA + 11 / RAMP_R);
    cart.x = RAMP_X + Math.sin(cart.rampA) * RAMP_R;
    cart.y = RAMP_Y - (1 - Math.cos(cart.rampA)) * RAMP_R;
    if (cart.rampA >= Math.PI / 2) { cart.mode = 'launch'; cart.launchT = 0; playSound('whoosh', 1, -6); }
  } else {
    cart.launchT++;
    cart.y -= 16;
    if (cart.launchT === 1) playSound('rumble', 0.8);
    // Out the top: the roof
    if (cart.launchT >= 48) {
      (getAdv(state)!.s as Record<string, unknown>).roofArrival = true;
      state.cameraLeadX = 0;
      // (still in the cutscene: the roof's carries on from here)
      // (where the roof's cutscene takes him from: under the roof, in the hole)
      const rx = ROOF_HOLE_X;
      p.pos.x = rx - p.width / 2; p.pos.y = GY - 560 + 120; p.vel.x = 0; p.vel.y = 0;
      state.camera.x = rx - CANVAS_WIDTH / 2;
      cart.mode = 'off';
      return;
    }
  }
  if (cart.artie.on) { cart.artie.x = Math.min(cart.artie.x + 10, RAMP_X); }
  place(state, cart);
  p.isGrounded = false;
  state.cameraRestY = Math.min(state.cameraRestY, cart.y - SINK - 380);
};

const run = (ctx: FrameContext, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  const c = getCart(state);
  if (p.health <= 0) { p.carried = false; return controls; }
  if (c.mode === 'off' && c.t === 0) {
    // (handed over by the temple, or back at a checkpoint: into the cart either way)
    board(state, c);
  }
  if (c.mode === 'off') return controls;
  state.cameraLeadX = c.mode === 'ride' ? 150 : 0;
  if (c.mode === 'ride') return ride(ctx, c, controls);
  rampUp(ctx, c);
  return {} as Controls;
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
    if (cart.mode === 'launch') { c.fillStyle = `rgba(0,0,0,${Math.min(1, cart.launchT / 40)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
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
  if (R > FORK_X && L < X + 5200) {
    box(c, FORK_X, GY - 4, X + 5000 - FORK_X, 4, '#6B7280');
    for (let x = FORK_X; x < X + 5000; x += 24) box(c, x, GY - 2, 14, 6, '#4B2E14');
    box(c, X + 4700, GY - 150, 300, 150, '#7DD3FC'); box(c, X + 4760, GY - 110, 180, 110, '#0C4A6E');
    label(c, "IT'S A FRIENDLY WORLD", X + 4850, GY - 125, '#FDF2F8', 8);
    for (let i = 0; i < 3; i++) { const bx = X + 4400 + i * 90, bob = Math.sin(f * 0.1 + i) * 4; box(c, bx, GY - 60 + bob, 30, 40, '#F9A8D4'); box(c, bx + 8, GY - 52 + bob, 4, 4, '#000'); box(c, bx + 18, GY - 52 + bob, 4, 4, '#000'); box(c, bx + 8, GY - 40 + bob, 14, 3, '#000'); }
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
    c.arc(RAMP_X, RAMP_Y - RAMP_R, RAMP_R, Math.PI / 2, 0, true); c.lineTo(RAMP_X + RAMP_R, RAMP_Y - 1400); c.stroke();
    box(c, RAMP_X + RAMP_R, RAMP_Y - 1400, 40, 1600, '#2B1A0C');
    label(c, 'EXIT', RAMP_X + RAMP_R - 40, RAMP_Y - 400, '#F87171', 10);
  }
  // Signs: the first gap and the first beam (to teach), and the fork
  const sign = (x: number, y: number, s: string, col = '#FDE047') => { box(c, x - 2, y, 4, 40, '#3F2A17'); box(c, x - 46, y - 22, 92, 24, '#1C1917'); label(c, s, x, y - 6, col, 7); };
  sign(X + 1380, GY - 60, 'GAP AHEAD');
  sign(X + 2560, GY + 60 - 60, 'LOW BEAM', '#FCA5A5');
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
  if (cart.mode === 'off' && !cart.artie.on) return;
  const f = state.frame;
  // Artie's (behind him), Artie in it, and what he's saying
  const a = cart.artie;
  if (a.on && Math.abs(a.x - state.camera.x - 400) < 700) {
    const ay = cart.mode === 'ride' ? artieTrackY(a.x) : artieTrackY(Math.min(a.x, RAMP_X - 1));
    const ducking = BEAMS.some(b => Math.abs(b - a.x) < 60);
    drawSafariArtie(c, a.x - 4, ay - SINK + (ducking ? 22 : 0), 1, f, a.said?.text ? 'talk' : 'sit');
    drawCartBox(c, a.x, ay, f, '#7C2D12');
    label(c, 'TOUR', a.x, ay - 18, '#FDE68A', 7);
    if (a.said?.text) saidOver(c, a.said.text, a.x, ay - 110, '#FDE68A');
  }
  if (cart.mode === 'off') return;
  const rot = cart.mode === 'ramp' ? -cart.rampA : cart.mode === 'launch' ? -Math.PI / 2 : cart.air ? Math.max(-0.3, Math.min(0.3, cart.vy * 0.03)) : 0;
  drawCartBox(c, cart.x, cart.y, f, '#57534E', cart.mode === 'launch' ? 0 : rot);
};
