// THE MINE CART (Donkey Kong Country style). He's put in a cart at the loading station (the temple hands him over:
// `cartBoarded`), and off it goes down the actual dangerous track: gaps to jump (jump: the cart and him with it),
// low beams to duck under (down); it goes at its own pace (he can't hurry it or hold it back). It rolls out of the
// station slowly, past a guest scanner that reads him as UNFRIENDLY and throws the switch at the fork (FRIENDLY GUESTS
// straight on, UNFRIENDLY GUESTS up the hill: there to be seen), then gets going up the hill. Then the ride's own
// tricks, from the guests' side and set to real (tricks.ts: the idols' darts, the Serpent of Doom, the rolling boulder
// over the set, and the big one out of its doors behind him), taught one at a time. Halfway, Safari Artie comes up
// behind him in a cart of his own (the first time: `chase`): right on his tail, chewing him out; and from there the tricks come
// all mixed up, and get Artie too. Shooting him back slows him. At the end (a cutscene: THE END OF THE LINE) the track curves up and goes straight up, and the two of
// them fly off the top of it, on up through the temple's roof.
//
// The mine itself is painted in art.ts.

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { Section, Said } from '../section';
import { lay, speak, meatheadSays, saidOver, hands, getAdv, sectionState } from '../section';
import { GY } from '../geometry';
import { HOLE_X as ROOF_HOLE_X } from '../roof';
import {
  x0, x1, X, RUNS, RAMP_X, RAMP_R, RAMP_Y, RAIL_TOP, BEAMS, SCANNER_X, CHASE_X, SLOW_TO, FORK_CAM_X, OUTRO_X, SINK,
  trackY, runAt, slopeAt, artieTrackY,
} from './layout';
import { drawCartBackdrop, drawCartTrack, drawCartFront, cartLighting } from './art';
import { setUi } from '../../store';
import { silenceAll, pickLine, isTalking } from '../../../m1/game/platform/speech';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../../m1/game/platform/skip';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { registerHurtLines } from '../../kinds';
import { drawRideCart, SEAT_DX, JAGUAR_EXPRESS, TOUR_CART, type CartLook } from '../rideCart';
import { drawSafariArtie, type ArtieFx, type ArtiePose } from '../river/artie';
import { stamp } from '../../intro/art/kit';
import { bloodFresh } from '../../../m1/game/render/player/gore';
import { startPip, pipLine, stepPip, drawPip, type ArtiePip, type PipKind } from '../river/artiePip';
import { warmGrossUps } from '../../grossKit';
import {
  type Dressed, MEATHEAD_UNFRIENDLY, MEATHEAD_ARTIE_AGAIN, ARTIE_CHASE_START, ARTIE_TAUNT, ARTIE_CHIDE, ARTIE_SHOT, ARTIE_RAMP,
  ARTIE_DARTED, ARTIE_BALDED, ARTIE_FLATTENED, ARTIE_FLIPPED, ARTIE_GLOATS, MEATHEAD_SEES_DARTS, MEATHEAD_SEES_SNAKE, MEATHEAD_SEES_LOB, MEATHEAD_SEES_CHASE,
  HURT_BEAM, DEATH_BEAM, HURT_PIT, DEATH_PIT,
} from './lines';
import { type Tricks, type Rider, type TrapKind, newTricks, runTricks } from './tricks';
import { drawTrickFront } from './trickArt';
import { eyeOf } from '../temple/art';


registerHurtLines('cart_beam', HURT_BEAM, DEATH_BEAM);
registerHurtLines('cart_pit', HURT_PIT, DEATH_PIT);

const pick = pickLine;
const dressed = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
/** A pool of lines, three ways: whatever Meathead's wearing as it's said. */
const byPants = <T,>(state: GameState, r: Record<Dressed, T>): T => r[dressed(state)];
/** First time through (return trips will differ: no Artie, say). One flag per set piece. */
const firstVisit = (_state: GameState) => true;

/** The cart's lean on the ride: along the track under it; in the air, nosing with its climb or fall. */
const rideRot = (cart: Cart) => (cart.air ? Math.max(-0.3, Math.min(0.3, cart.vy * 0.03)) : slopeAt(cart.x) ?? 0);

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
  /** The one riding it: where (his feet) and his turn (sat in it, the cart's; off the top, his own), and where he was
   * from the cart (along the rail) when it went off the top. */
  rx: number; ry: number; rrot: number; sdx: number; sdy: number;
}
const flier = (s: number, v: number): Flier => ({ s, v, x: 0, y: 0, rot: 0, fly: false, vy: 0, t: 0, out: 0, drift: 0, rx: 0, ry: 0, rrot: 0, sdx: 0, sdy: 0 });

export interface Cart {
  /** Not on yet, riding, the end of the line (the cutscene: up the ramp and off the top), gone (on to the roof). */
  mode: 'off' | 'ride' | 'outro' | 'gone';
  x: number; y: number; railY: number; vy: number; speed: number; air: boolean;
  /** (a beam that's had him already) */
  beamsHit: Set<number>;
  jumpWas: boolean;
  t: number;
  /** How far ahead of him the camera looks (riding). */
  lead: number;
  scanned: boolean; scanT: number;
  /** The end of the line: how long in, him, and the fade out (on to the roof). */
  outT: number; me: Flier | null; fade: number;
  /** Safari Artie, after him in a cart (first time through). */
  chase: boolean;
  artie: {
    on: boolean; x: number; v: number; said: Said | null; next: number; bumpT: number; chideAt: number; shotSaid: number; end: Flier | null;
    /** (one of the ride's tricks has just had him: not again for a moment) */
    trapT: number;
    /** ...and how he's taking it (frames in; darts: how many he's got in his face). */
    react: { kind: TrapKind; t: number; darts: number } | null;
  };
  /** The ride's tricks (tricks.ts): reset and loaded again every go. */
  tricks: Tricks;
  /** Artie in a TV inset up in the corner (river/artiePip.ts): gloating, coming up behind him the first time; each of
   *  the ride's tricks that has him, taking it. */
  pip?: ArtiePip;
}
const getCart = (state: GameState) => sectionState<Cart>(state, 'cart', () => ({
  mode: 'off', x: X + 150, y: GY, railY: GY, vy: 0, speed: 0, air: false, beamsHit: new Set(), jumpWas: false,
  t: 0, lead: 150, scanned: false, scanT: 0, outT: 0, me: null, fade: 0,
  chase: firstVisit(state),
  artie: { on: false, x: 0, v: 0, said: null, next: 0, bumpT: 0, chideAt: 0, shotSaid: 0, end: null, trapT: 0, react: null },
  tricks: newTricks(),
}));

const artieSays = (cart: Cart, text: string) => {
  if (cart.artie.said) return;
  cart.artie.said = { text };
  speak('m2.safari', text, s => { cart.artie.said = s; });
};

/** The scanner's read him and thrown the switch (state.stageMemo: kept across his deaths). */
const SCANNED = 'm2:cartScanned';
/** Puts him in it, where he is (from the temple's loading station, or back at a checkpoint). */
const board = (state: GameState, cart: Cart) => {
  const p = state.player;
  // (on a rail, never over a gap, nor past the end of the line)
  let at = Math.max(X + 150, Math.min(OUTRO_X - 200, p.pos.x + p.width / 2));
  if (trackY(at) === null) at = (RUNS.find(r => r[0] > at) ?? RUNS[0])[0] + 20;
  cart.mode = 'ride'; cart.x = at; cart.y = trackY(at) ?? GY; cart.railY = cart.y; cart.vy = 0; cart.speed = 0; cart.air = false;
  // (past the scanner already: it's done its job; or it has already, this go at the land (back from dying since):
  // it's not reading him again, the switch is over)
  if (at > SCANNER_X) cart.scanned = true;
  else if (state.stageMemo[SCANNED]) { cart.scanned = true; cart.scanT = 400; }
  // (back past where Artie came up behind him: he's already after him, right there behind)
  if (cart.chase && at > CHASE_X) {
    const a = cart.artie;
    a.on = true; a.x = at - 640; a.v = 6; a.next = 300; a.bumpT = 90;
  }
  p.carried = true;
};

const place = (state: GameState, cart: Cart) => {
  const p = state.player;
  p.pos.x = cart.x - p.width / 2; p.pos.y = cart.y - SINK - p.height;
  p.vel.x = 0; p.vel.y = 0;
};

/** The cart's front wheel and its middle (the back trails: never caught on what it's leaving), and how far into a run one can be and still be caught on it. */
const CART_WHEELS = [44, 0], CART_SNAP_IN = 40;
const ride = (ctx: FrameContext, cart: Cart, controls: Controls): Controls => {
  const { state } = ctx, p = state.player;
  cart.t++;
  // Speed: out of the station slowly (the scanner, the fork); then up to speed, up the hill. The ride sets the pace
  const slow = cart.x < SLOW_TO;
  const want = slow ? 3.2 : 7;
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
    // (down onto the rail: any of its wheels touching a run, or even a little way into it (the front clipping the end
    // of the next one), and it's on: snapped onto that run, never through it)
    if (cart.vy >= 0) for (const dx of CART_WHEELS) {
      const wx = cart.x + dx, wy = trackY(wx);
      if (wy === null || cart.y < wy - 1 || cart.y > wy + CART_SNAP_IN || cart.y - cart.vy > wy + CART_SNAP_IN) continue;
      const r = runAt(wx)!;
      // (only a run ahead it's coming down onto: never the one it's just gone off the end of, or it'd catch on that
      // over and over going off a cliff)
      if (dx !== 0 && r[0] <= cart.x) continue;
      cart.x = Math.max(r[0] + 1, Math.min(r[1] - 1, cart.x));
      cart.y = trackY(cart.x) ?? wy; cart.vy = 0; cart.air = false; playSound('land', 0.8); playSound('clang', 0.5, -4); shakeScreen(state, 4, 2);
      break;
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
    cart.scanned = true; cart.scanT = 1; state.stageMemo[SCANNED] = 'yes';
    playSound('alarm', 0.6); playSound('beep', 0.8);
  }
  if (cart.scanT > 0) {
    cart.scanT++;
    if (cart.scanT === 40) { playSound('clang', 0.9, -10); playSound('thud', 0.7); }
    if (cart.scanT === 50) meatheadSays(state, pick(MEATHEAD_UNFRIENDLY));
  }
  // (and off it goes, at the top of the fork)
  if (slow && cart.x + cart.speed >= SLOW_TO) playSound('grind', 0.6, -4);
  // Safari Artie, after him (his gloating close-up painted ahead in idle slices till he comes: never on the spot)
  if (cart.chase && !cart.artie.on) warmGrossUps();
  if (cart.chase) artieChase(ctx, cart);
  // The ride's tricks, at him (and at Artie, behind him)
  const a = cart.artie;
  if (a.trapT > 0) a.trapT--;
  const out = runTricks(ctx, cart.tricks, { x: cart.x, y: cart.y, air: cart.air, ride: true, t: cart.t }, riderOf(state, cart), kind => firstSight(state, kind));
  if (out.hurt && a.on && cart.x - a.x < 900 && Math.random() < 0.5) artieSays(cart, pick(ARTIE_GLOATS[dressed(state)]));
  place(state, cart);
  // (on his feet in it, for ducking: the engine's crouch wants him on the ground)
  p.isGrounded = !cart.air;
  state.cameraRestY = cart.y - SINK - 420;
  // (facing the way it's going, always: left and right are the cart's, not his; no specials of any kind, see run)
  p.facing = 1;
  return { ...controls, left: false, right: false, jump: false, charge: false, special: false, secondary: controls.secondary };
};

/** He's gloated in the corner already (state.stageMemo: kept across his deaths). */
const TAUNTED = 'm2:cartTaunted';
/** How far behind him Artie rides once he's caught up. */
const TAIL = 170;
const artieChase = (ctx: FrameContext, cart: Cart) => {
  const { state } = ctx, a = cart.artie;
  if (!a.on) {
    if (cart.x < CHASE_X) return;
    a.on = true; a.x = cart.x - 520; a.v = cart.speed + 3; a.next = 360;
    playSound('clang', 0.6, -6); playSound('engine', 0.6);
    a.said = { text: '' };
    // (and up in the corner, him gloating: the first time he comes up behind him this go at the land, only)
    if (!state.stageMemo[TAUNTED]) { state.stageMemo[TAUNTED] = 'yes'; cart.pip = startPip('taunt'); }
    const pip = cart.pip;
    speak('m2.safari', pick(ARTIE_CHASE_START[dressed(state)]), s => { a.said = s; pipLine(pip, s ? s.text : null); }, true, () => meatheadSays(state, pick(MEATHEAD_ARTIE_AGAIN)));
    return;
  }
  if (cart.mode !== 'ride') { a.x += a.v; a.react = null; return; }
  stepReact(state, cart);
  const dist = cart.x - a.x;
  // (well back, he closes right up; then he sits on his tail, the same pace: the ride sets it, his cart too, so he can't
  // ram him. He just chews him out)
  const target = dist > TAIL + 40 ? cart.speed + 3 : cart.speed + (dist - TAIL) * 0.05;
  a.v += (target - a.v) * (a.bumpT > 0 ? 0.01 : 0.05);
  if (a.bumpT > 0) a.bumpT--;
  a.x = Math.min(a.x + a.v, cart.x - 110);
  if (dist < TAIL + 60 && state.frame - a.chideAt > 420) {
    a.chideAt = state.frame;
    artieSays(cart, pickLine(ARTIE_CHIDE[dressed(state)]));
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
    if (state.frame - a.shotSaid > 400) { a.shotSaid = state.frame; artieSays(cart, pick(ARTIE_SHOT[dressed(state)])); }
  }
  if (--a.next <= 0) { a.next = 600 + Math.floor(Math.random() * 300); artieSays(cart, pick(ARTIE_TAUNT[dressed(state)])); }
};

/** Artie, to the ride's tricks: knocked back (the cart and him), and it's Meathead's fault. Each has him its own way
 *  (the user's: "for the various traps on the minecart ride, any that miss you and hit artie will show a quick, unique
 *  funny reaction from artie depending on what hit him"): a beat of him (drawArtieReact), its sound, and a line, his
 *  pride hurt worse than him. Looks only: nothing held up, nothing at Meathead, the ride the same. */
const riderOf = (state: GameState, cart: Cart): Rider => {
  const a = cart.artie;
  return {
    on: a.on && cart.mode === 'ride', x: a.x,
    hit: (what) => {
      // (the rest of a volley, into his face too: one more dart in him)
      if (what === 'dart' && a.react?.kind === 'dart' && a.react.t < 30) { a.react.darts = Math.min(3, a.react.darts + 1); playSound('dart', 0.5, 6 + a.react.darts * 2); return; }
      if (a.trapT > 0) return;
      a.trapT = REACT_T[what]; a.v = Math.max(2, a.v - 4); a.bumpT = 70;
      a.react = { kind: what, t: 0, darts: 1 };
      if (what === 'dart') { playSound('dart', 0.7, 4); playSound('punch', 0.4, 10); }
      else if (what === 'snake') { playSound('snort', 0.8, 6); playSound('bonk', 0.9, 2); playSound('whoosh', 0.6, 8); }
      else if (what === 'boulder') { playSound('squish', 1, -4); playSound('crunch', 0.5, 2); }
      else { playSound('bonk', 1, -6); playSound('whoosh', 0.9, 4); }
      // (and up in the corner, his gross-up taking it (the user's: "when artie gets pelted by the mechanisms on the ride,
      // show a side panel 'gross-up' of his face getting inconvenienced by it, along with in game"): in place of any
      // up already, held through his line)
      const pip = cart.pip = startPip(PIP_OF[what], cart.pip);
      // (his line: never over anybody else's; the beat plays either way)
      if (!isTalking() && state.playerVulgarityTimer <= 0 && !a.said) {
        const text = pick(byPants(state, REACT_LINES[what]));
        a.said = { text };
        speak('m2.safari', text, s => { a.said = s; pipLine(pip, s ? s.text : null); }, false, () => pipLine(pip, null));
      } else pipLine(pip, null);
    },
  };
};

/** How long each beat of him takes (frames: quick, well under a second and a half). */
const REACT_T: Record<TrapKind, number> = { dart: 66, snake: 64, boulder: 60, chase: 66 };
/** Each trick's gross-up in the corner (river/artiePip.ts). */
const PIP_OF: Record<TrapKind, PipKind> = { dart: 'darted', snake: 'balded', boulder: 'flattened', chase: 'flipped' };
const REACT_LINES: Record<TrapKind, Record<Dressed, string[]>> = { dart: ARTIE_DARTED, snake: ARTIE_BALDED, boulder: ARTIE_FLATTENED, chase: ARTIE_FLIPPED };
/** The darts: quivering in his face till DART_GRAB, the hand up to the nose one, yanked out at DART_YANK. The serpent:
 *  his helmet up off his head, spinning, back down on it at HAT_DOWN. The boulder: flat till FLAT_T, then boing. The big
 *  one: flipped up out of his seat till FLIP_IN (head first into the cart), legs kicking, out again from FLIP_OUT. */
const DART_GRAB = 18, DART_YANK = 34, HAT_DOWN = 46, FLAT_T = 10, FLIP_IN = 18, FLIP_OUT = 50;

/** His reaction, on: its sounds on their beats. */
const stepReact = (state: GameState, cart: Cart) => {
  const a = cart.artie, r = a.react;
  if (!r) return;
  r.t++;
  if (r.t >= REACT_T[r.kind]) { a.react = null; return; }
  const ay = artieTrackY(a.x);
  if (r.kind === 'dart' && r.t === DART_YANK + 3) {
    // (out it comes, with a pop and a squirt)
    playSound('squish', 0.5, 10); playSound('click', 0.6, 4);
    for (let i = 0; i < 6; i++) state.particles.push({ pos: { x: a.x + 6, y: ay - SINK - 66 }, vel: { x: 1 + Math.random() * 2.5, y: -1.5 - Math.random() * 2 }, life: 18, color: bloodFresh, size: 1.5 + Math.random() * 1.5, grav: 0.25 });
  }
  if (r.kind === 'snake' && r.t === HAT_DOWN) { playSound('bonk', 0.8, 8); playSound('clink', 0.5, -2); }
  if (r.kind === 'boulder' && r.t === FLAT_T) { playSound('boing', 0.9); playSound('twinkle', 0.35, 4); }
  if (r.kind === 'chase') {
    if (r.t === FLIP_IN) { playSound('clang', 0.8, -4); playSound('thud', 0.7); }
    if (r.t === FLIP_OUT) playSound('boing', 0.7, 3);
  }
};

/** The first of each of the ride's tricks this go at the land: he's seen them all from behind, and says so (once). */
const SEES = { dart: MEATHEAD_SEES_DARTS, snake: MEATHEAD_SEES_SNAKE, lob: MEATHEAD_SEES_LOB, chase: MEATHEAD_SEES_CHASE };
const firstSight = (state: GameState, kind: keyof typeof SEES) => {
  const key = `m2:cartSaw:${kind}`;
  if (state.stageMemo[key]) return;
  state.stageMemo[key] = 'yes';
  meatheadSays(state, pick(SEES[kind]));
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
    return { x: RAMP_X + Math.sin(a) * RAMP_R, y: RAMP_Y - (1 - Math.cos(a)) * RAMP_R, rot: -a };
  }
  return { x: RAMP_X + RAMP_R, y: RAMP_Y - RAMP_R - (s - PATH_FLAT - PATH_ARC), rot: -Math.PI / 2 };
};
/** Where the one riding it is (his feet). */
const riderY = (f: Flier) => f.ry;
/** (how far ahead of the seat its front wheels are: off the top of the rail, it's off) */
const FRONT_WHEEL = -SEAT_DX + 40;

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
    artieSays(cart, pick(ARTIE_RAMP[dressed(state)]));
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
    // (sat in it, turned with it: his feet SINK up off the rail, the way the cart's up)
    f.rx = f.x + SINK * Math.sin(f.rot); f.ry = f.y - SINK * Math.cos(f.rot); f.rrot = f.rot;
    if (!wasArc && f.s >= PATH_FLAT) { playSound('clang', 0.7, -6); playSound('grind', 0.7, -8); }
    if (f.y + FRONT_WHEEL * Math.sin(f.rot) <= RAIL_TOP) {
      f.fly = true; f.vy = -f.v; f.t = 0; f.sdx = f.rx - f.x; f.sdy = f.ry - f.y;
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
  // The riders: on up, out over where the rail was. Him righting himself (a wobble, then feet down: he lands on the
  // roof); Artie head over heels, flailing
  f.sdx *= 0.94;
  f.rx = f.x + f.sdx; f.ry = f.y + f.sdy - f.out;
  if (lead) f.rrot -= 0.2;
  else f.rrot = f.rrot * 0.93 + Math.sin(f.t * 0.6) * 0.12 * Math.max(0, 1 - f.t / 30);
};

const endOutro = (state: GameState, cart: Cart, skipped: boolean) => {
  const p = state.player;
  if (skipped) silenceAll();
  cart.mode = 'gone'; cart.me = null; p.spriteRot = 0;
  // (out of the cart: his moves back, and his choice of weapon)
  p.noSpecials = false; setUi({ noSwitch: false, pauseControls: null }); cart.artie.end = null; cart.artie.on = false; cart.artie.said = null;
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
  p.pos.x = me.rx - p.width / 2; p.pos.y = riderY(me) - p.height; p.spriteRot = me.rrot; p.vel.x = 0; p.vel.y = me.fly ? me.vy : -1;
  p.isGrounded = false;
  // The camera: on the two of them, the ramp in view, going up with them
  const k = Math.max(0, Math.min(1, (me.s - PATH_FLAT) / PATH_ARC));
  const camX = RAMP_X - 550 + k * 190;
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
  if (c.mode === 'gone') { p.noSpecials = false; setUi({ noSwitch: false, pauseControls: null }); return controls; }
  // (sat in it: no charge, slide, uppercut, dive kick or grab, whatever's pressed, and stuck with the weapon he got in
  // with: the one he's holding, out and pointed the way it's going)
  p.noSpecials = true; setUi({ noSwitch: true, pauseControls: 'cart' });
  // (the camera ahead of him; rolling out past the scanner, held on it and the fork a moment)
  // (the big one after him: the camera eases back to take it in behind him, then ahead again)
  const big = c.tricks.boulders.find(b => b.big && b.mode !== 'fall' && c.x - b.x < 1100);
  c.lead += ((big ? 0 : 150) - c.lead) * 0.04;
  state.cameraLeadX = c.mode !== 'ride' ? 0
    : c.x < SLOW_TO + 400 ? Math.max(Math.min(c.x - 160, FORK_CAM_X), c.x - 250) - (c.x - CANVAS_WIDTH / 2) : c.lead;
  if (c.pip && !stepPip(state, c.pip, { x: c.artie.x, y: artieTrackY(c.artie.x) - 110 })) c.pip = undefined;
  if (c.mode === 'ride') return ride(ctx, c, controls);
  return outro(ctx, c);
};

export const cart: Section = {
  id: 'cart', x0, x1,
  checkpoints: [
    { name: 'THE MINE CART', cp: 50, x: X + 150, y: GY },
    { name: 'THE UNFRIENDLY TRACK', cp: 51, x: X + 5000, y: GY - 260 },
    // (each one back in a cart on the rail there, rolling (board()), the ride's tricks ahead all reset and loaded, any
    // behind never set off; past CHASE_X, Artie's straight back on his tail. Each well short of the next trick: the
    // tricks wait till it's been rolling a while (tricks.ts) and it gets up to speed first)
    // (down off the idols' straight, short of the Serpent of Doom)
    { name: 'THE SERPENT OF DOOM', cp: 52, x: X + 7450, y: GY - 250 },
    { name: 'THE TOUR CART', cp: 53, x: X + 11560, y: GY - 220 },
    // (just over the gap past the second idol, up the rise to the low beams)
    { name: 'THE LOW BEAMS', cp: 54, x: X + 14560, y: GY - 175 },
    { name: 'THE LAST STRETCH', cp: 55, x: X + 17450, y: GY - 120 },
    // (past the third serpent, the beam and the last catapults ahead, then the ramp)
    { name: 'THE HOME STRETCH', cp: 56, x: X + 19650, y: GY - 180 },
  ],
  build: (state) => {
    // (the cave's floor, way down under the track: the gaps go down to it)
    lay(state, [{ x1: x0, y1: GY + 700, x2: x1, y2: GY + 700, surface: 'concrete' }]);
  },
  update: (ctx, controls) => {
    const out = run(ctx, controls);
    setUi({ introCutscene: !!ctx.state.player.inCutscene });
    // (sat back in it, relaxed, while it's got him: not ducking under a beam, not flying off the top of the ramp)
    const p = ctx.state.player, cart = getCart(ctx.state);
    p.cartSeat = p.carried && p.health > 0 && (cart.mode === 'ride' || (cart.mode === 'outro' && !cart.me?.fly));
    // (turned with the cart: along the track, up the hills and down them)
    if (cart.mode === 'ride' && p.carried) p.spriteRot = rideRot(cart);
    else if (cart.mode !== 'outro') p.spriteRot = 0;
    // (sat back enjoying the ride: no gun out, no shooting)
    if (p.cartSeat) return { ...out, shoot: false, secondary: false };
    return out;
  },
  cameraRow: () => 420,
  drawBackdrop: (c, state) => { drawCartBackdrop(c, state); return true; },
  drawBack: (c, state) => { drawCartTrack(c, state, getCart(state)); drawCarts(c, state, true); },
  drawFront: (c, state) => { drawCarts(c, state); drawTrickFront(c, eyeOf(state), state, getCart(state).tricks); drawCartFront(c, state); },
  lighting: (state) => cartLighting(state, getCart(state)),
  drawHud: (c, state) => {
    const cart = getCart(state);
    if (cart.pip && cart.mode === 'ride') drawPip(c, cart.pip, state.frame);
    if (cart.mode !== 'outro') return;
    if (cart.fade) { c.fillStyle = `rgba(0,0,0,${Math.min(1, cart.fade / 28)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (cart.outT > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The carts (the mine itself is painted in art.ts)

/** A cart (the ride's own, as at the station: rideCart.ts), whoever's in it sat at its seat, here at `x`. */
const drawCartBox = (c: CanvasRenderingContext2D, x: number, y: number, f: number, look: CartLook, rot = 0, back = false) => {
  // (turned about the seat, on the rail under it: whoever's in it turns about the same place)
  c.save(); c.translate(x, y); c.rotate(rot);
  drawRideCart(c, -SEAT_DX, 0, f, look, back);
  c.restore();
};

const drawCarts = (c: CanvasRenderingContext2D, state: GameState, back = false) => {
  const cart = getCart(state);
  if (cart.mode === 'gone' || (cart.mode === 'off' && !cart.artie.on)) return;
  const f = state.frame;
  // Artie's (behind him), Artie in it, and what he's saying
  const a = cart.artie;
  if (a.end) {
    // (the end of the line: on the ramp right behind him, then flying off the top of it, arms up)
    const e = a.end, ay = riderY(e);
    if (back) drawCartBox(c, e.x + e.drift, e.y, f, TOUR_CART, e.rot, true);
    else {
    // (sat in it turned with it up the ramp; off the top, head over heels)
    c.save(); c.translate(e.rx, ay); c.rotate(e.rrot);
    drawSafariArtie(c, -4, 0, 1, f, e.fly ? 'hurt' : a.said?.text ? 'talk' : 'sit');
    c.restore();
    drawCartBox(c, e.x + e.drift, e.y, f, TOUR_CART, e.rot);
    if (a.said?.text) saidOver(c, a.said.text, e.rx, ay - 96, '#FDE68A');
    }
  } else if (a.on && Math.abs(a.x - state.camera.x - 400) < 700) {
    const ay = artieTrackY(a.x);
    const ducking = BEAMS.some(b => Math.abs(b - a.x) < 60);
    const ar = slopeAt(a.x, artieTrackY) ?? 0;
    if (back) drawCartBox(c, a.x, ay, f, TOUR_CART, ar, true);
    else {
    // (sat in it, turned with it along the track)
    c.save(); c.translate(a.x, ay); c.rotate(ar);
    if (a.react && !ducking) drawArtieReact(c, a.react, f);
    else drawSafariArtie(c, -4, -SINK, 1, f, ducking ? 'duck' : a.said?.text ? 'talk' : 'sit');
    c.restore();
    drawCartBox(c, a.x, ay, f, TOUR_CART, ar);
    if (a.said?.text) saidOver(c, a.said.text, a.x, ay - 110, '#FDE68A');
    }
  }
  if (cart.mode === 'off') return;
  if (cart.mode === 'outro' && cart.me) { drawCartBox(c, cart.me.x + cart.me.drift, cart.me.y, f, JAGUAR_EXPRESS, cart.me.rot, back); return; }
  drawCartBox(c, cart.x, cart.y, f, JAGUAR_EXPRESS, rideRot(cart), back);
};

// ---------------------------------------------------------------------------------------------------------------
// Artie's reactions to the ride's tricks (sat in his cart, at its seat: (0, 0) on the rail under it)

const ease = (u: number) => { const k = Math.max(0, Math.min(1, u)); return k * k * (3 - 2 * k); };
const DART_FX: ArtieFx = {}, HAT_FX: ArtieFx = {}, FACE_FX: ArtieFx = {};

const drawArtieReact = (c: CanvasRenderingContext2D, r: { kind: TrapKind; t: number; darts: number }, f: number) => {
  const t = r.t;
  switch (r.kind) {
    case 'dart': {
      // Darts: stuck in his face like a pincushion, quivering, eyes screwed shut; then the hand up, a jerk, and the one
      // in his nose out, held up to look at, bloody (gritting his teeth, then furious)
      DART_FX.darts = r.darts;
      DART_FX.yank = t < DART_GRAB ? 0 : t < DART_YANK ? (t - DART_GRAB) / (DART_YANK - DART_GRAB) : 1 + Math.min(1, (t - DART_YANK) / 4);
      DART_FX.face = t < DART_GRAB ? 'yelp' : t < DART_YANK + 4 ? 'grit' : 'angry';
      const jit = t < 10 ? Math.sin(t * 2.6) * 1.5 : t >= DART_YANK && t < DART_YANK + 4 ? 2 : 0;
      drawSafariArtie(c, -4 + jit, -SINK, 1, f, 'yank', 0, DART_FX);
      return;
    }
    case 'snake': {
      // The serpent: his helmet knocked clean off, up over him spinning, the bald spot (and the helmet's tan line, and
      // the comb-over) out for all to see, both hands clapped over it; back down on his head, a bonk, and he's furious
      if (t < HAT_DOWN) {
        const u = t / HAT_DOWN;
        HAT_FX.hat = { dx: -6 * Math.sin(Math.PI * u), dy: -30 * Math.sin(Math.PI * u), rot: ease(u) * Math.PI * 4 };
        HAT_FX.face = undefined;
        drawSafariArtie(c, -4, -SINK, 1, f, 'bald', 0, HAT_FX);
      } else {
        FACE_FX.face = 'angry';
        drawSafariArtie(c, -4, -SINK + (t < HAT_DOWN + 4 ? 2 : 0), 1, f, 'sit', 0, FACE_FX);
      }
      return;
    }
    case 'boulder': {
      // The boulder: flat as a pancake over the cart's rim, then boing, back up, wobbling, dazed, stars round his helmet
      const RIM = -45;
      let sy: number;
      if (t < FLAT_T) sy = 0.3;
      else { const k = t - FLAT_T; sy = 1 - 0.7 * Math.exp(-k / 9) * Math.cos(k * 0.5); }
      const sx = Math.max(0.8, 1 + (1 - sy) * 0.6);
      FACE_FX.face = t < FLAT_T ? 'yelp' : 'dazed';
      c.save(); c.translate(0, RIM); c.scale(sx, sy); c.translate(0, -RIM);
      drawSafariArtie(c, -4, -SINK, 1, f, 'sit', 0, FACE_FX);
      c.restore();
      if (t >= FLAT_T) stars(c, -2, -SINK - 96 * sy, t);
      return;
    }
    case 'chase': {
      // The big one, right over him: flipped up out of his seat, head over heels, head first back down into the cart,
      // his legs sticking up out of it kicking; then up and over, back in his seat
      const CY = -SINK - 44;
      let rot: number, lift: number, pose: ArtiePose;
      if (t < FLIP_IN) { const u = t / FLIP_IN; rot = Math.PI * ease(u); lift = Math.sin(Math.PI * u) * 60; pose = 'hurt'; }
      else if (t < FLIP_OUT) { rot = Math.PI + Math.sin(t * 0.5) * 0.06; lift = 0; pose = 'agitated'; }
      else { const u = Math.min(1, (t - FLIP_OUT) / (REACT_T.chase - FLIP_OUT)); rot = Math.PI + Math.PI * ease(u); lift = Math.sin(Math.PI * u) * 34; pose = 'hurt'; }
      c.save(); c.translate(-4, CY - lift); c.rotate(rot);
      drawSafariArtie(c, 0, -SINK - CY, 1, f, pose);
      c.restore();
      return;
    }
  }
};

/** Cartoon stars, three, round his head (stamped: a pixel star, painted the once). */
const stars = (c: CanvasRenderingContext2D, x: number, y: number, t: number) => {
  for (let i = 0; i < 3; i++) {
    const a = t * 0.22 + (i * Math.PI * 2) / 3;
    const sx = Math.round(x + Math.cos(a) * 16), sy = Math.round(y + Math.sin(a) * 4);
    c.save(); c.translate(sx, sy);
    stamp(c, 'cart:artieStar', -4, -4, 9, 9, g => {
      g.fillStyle = '#7C4A03'; g.fillRect(-1, -4, 3, 9); g.fillRect(-4, -1, 9, 3);
      g.fillStyle = '#FACC15'; g.fillRect(0, -3, 1, 7); g.fillRect(-3, 0, 7, 1); g.fillRect(-1, -1, 3, 3);
      g.fillStyle = '#FEF9C3'; g.fillRect(0, -1, 1, 1);
    });
    c.restore();
  }
};
