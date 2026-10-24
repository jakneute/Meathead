// THE NEEDLE: section 5 of Space Land (owner: the needle agent). Space Needle 2: like the real thing, only it goes way,
// way higher, into actual outer space. Meathead finds it boring: all it does is spin slowly.
//
//   the lobby   at its foot (in off the main drag; the way back out at its left end); the elevator's doors: up.
//   the ride    the glass elevator up the stalk (a cutscene, skippable): the sky going by, the clouds coming down past,
//               the sky going black, the Earth's curve coming up; the announcer, him bored stiff. Ding: the deck.
//   the deck    the observation deck: a ring with a start and an end (the engine's cylinder, seen from inside), turning
//               slowly (the view going by in every window: the Earth, the stars, the moon), the passengers milling,
//               the announcer now and then. No threats. On the far left, in its case, the REAL ASTRONAUT SUIT (up at
//               it: he smashes the case and puts it on: see suit.ts). On the far right, the big window: a charge into
//               it cracks it, and it goes. Everybody's sucked out into space:
//                 without the helmet on, him too: dead (death.ts: decompressed, his own kill cam);
//                 with it (the suit, or just the helmet after a blowout), he's out there floating, fine: on to the
//                 orbit (DOORS.orbit.start, the shooter's to take over from there).
//               After that, the deck's empty and the hole's sealed (an airlock in the shutter: back out to the orbit).
//
// Checkpoints 40 (the lobby), 41 (the deck). Kept across deaths (state.stageMemo): the suit taken (suit.ts), the ride
// up seen (later rides are a quick fade), the window gone out of with the helmet on (the deck emptied and sealed).
// Dying out the window puts the window and the passengers back (that run never left the deck).

import type { GameState } from '../../../m1/game/core/state';
import type { FrameContext } from '../../../m1/game/core/context';
import type { Controls } from '../../../m1/game/platform/input';
import type { SpaceSection } from '../section';
import { layOwn, runExits, teleport, hands, meatheadSays, speak, saidOver, spaceState, solid, type Said, type Exit } from '../section';
import { DOORS } from '../geometry';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { setUi } from '../../store';
import { pickLine, silenceAll } from '../../../m1/game/platform/speech';
import { offerSkip, takeSkip, drawSkipPrompt, SKIP_AFTER } from '../../../m1/game/platform/skip';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { isShat, isNude } from '../../../m1/game/player/gut';
import { guestAt, type Guest } from '../../adventure/queue/crowd';
import { GY, NX0, NX1, LOBBY0, LIFT_X, LOBBY1, CAR0, CAR1, CAR_X, D0, D1, DECK_LIFT, RING_R, RING_C, DECK_HORIZON, DECK_ROW, CASE_X, SLOT, SLOTS, slotX, SPEAKER_Y, WIN_TOP, CEIL } from './layout';
import { drawLobby, drawCar, drawDeck, drawSuitCase, drawEndGlass, drawLiftDoors } from './art';
import { drawDeckView, drawAscent, prewarmSky, c01, hash } from './sky';
import { DECOMP, VACUUM, setOutGuests, drawPuppet, drawDecompCam, drawFloat } from './death';
import { putOnSuit, wearingHelmet, reapplySuit, SUIT_MEMO } from './suit';
import * as L from './lines';
import { onStrike } from '../../weapons/strikes';
import { addSpawnerBaits } from '../../weapons/spawner';
import { drawPoseSprite, drawPoseHead } from '../../moves/grab';
import { drawLeg, drawArmTo, drawTorsoFromHips } from '../../../m1/game/render/player/body';
export { takeOffSuit, wearingHelmet, putOnSuit } from './suit';

const RODE_MEMO = 'm2:needle:rode', SEALED_MEMO = 'm2:needle:sealed';
/** The ride up (frames, going up; the lines can hold it at the top a while). */
const ASCENT = 600;
type Phase = 'free' | 'ride' | 'fade' | 'suit' | 'crack' | 'blow' | 'out';
interface Pax {
  g: Guest; x: number; home: number; facing: 1 | -1; to: number; wait: number;
  /** Going out of the window: where, how fast, turned how far. */
  fly?: { x: number; y: number; vx: number; vy: number; rot: number; vr: number };
  gone?: boolean;
}
interface Needle {
  phase: Phase; t: number;
  /** Bumped when a scene's skipped or over: its lines' callbacks after that are dropped. */
  tok: number;
  pax: Pax[];
  /** The deck's turn (world px round the ring the view's gone by). */
  drift: number;
  nextBored: number; nextPa: number; nextChat: number; nextReact: number; nextCase: number;
  /** The announcer's words while they're said. */
  pa: Said | null;
  warned: boolean; upWas: boolean; deckIntro: boolean;
  smashT: number; crack: number; hitY: number;
  /** Shot at, the window: the damage it's taken (WINDOW_HP and it goes). */
  shot: number;
  glass: 'whole' | 'gone' | 'sealed';
  ride: { a: number; speed: number; climbed: number; topped: boolean };
  linesDone: boolean;
  fadeTo: 'ride' | 'top' | 'up' | 'down';
  /** The elevator's doors opening somewhere (x), frames since; the car fading in from black (frames left). */
  doors: { x: number; t: number } | null; fadeIn: number;
  /** (out of the window) he lives through it; him, as he's dragged out (world). */
  survive: boolean;
  mh: { x: number; y: number; rot: number; vx: number; cling: boolean; t: number };
}
let lobbySaid = false;
/** The airlock (the door in the shutter at the deck's end, art.ts): on past its middle, he's through it. And whether
 *  he's said he's got no helmet for it, this go at it. */
const AIRLOCK_X = D1 - 75;
let airlockSaid = false;

const make = (state: GameState): Needle => {
  const sealed = !!state.stageMemo[SEALED_MEMO];
  const pax: Pax[] = [];
  // (a ride that actually goes to space, and about as popular as any observation deck: a handful up here, spread out)
  if (!sealed) for (let i = 0; i < 4; i++) {
    const home = D0 + 380 + i * ((D1 - D0 - 700) / 3) + (hash(i + 3) - 0.5) * 120;
    pax.push({ g: guestAt(i + 3, home, GY, hash(i) < 0.5 ? 1 : -1, 0.92), x: home, home, facing: hash(i) < 0.5 ? 1 : -1, to: home, wait: 60 + Math.floor(hash(i + 7) * 300) });
  }
  return {
    phase: 'free', t: 0, tok: 0, pax, drift: 0,
    nextBored: 0, nextPa: 0, nextChat: 0, nextReact: 0, nextCase: 0,
    pa: null, warned: false, upWas: false, deckIntro: !!state.stageMemo[RODE_MEMO],
    smashT: 0, crack: 0, shot: 0, hitY: GY - 40, glass: sealed ? 'sealed' : 'whole',
    ride: { a: 0, speed: 0, climbed: 0, topped: false }, linesDone: false, fadeTo: 'up', doors: null, fadeIn: 0,
    survive: false, mh: { x: 0, y: 0, rot: 0, vx: 0, cling: true, t: 0 },
  };
};
const st = (state: GameState) => spaceState<Needle>(state, 'needle', () => make(state));
const guard = (ns: Needle, f: () => void) => { const tok = ns.tok; return () => { if (ns.tok === tok) f(); }; };
const dressed = (state: GameState): keyof L.ByPants => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const paSays = (ns: Needle, text: string, after: boolean, onDone?: () => void) => speak(L.PA, text, s => { ns.pa = s; }, after, onDone);
const guestSays = (px: Pax, text: string, after: boolean, onDone?: () => void) => speak(px.g.voice, text, s => { px.g.said = s ? s.text : null; }, after, onDone);
type Region = 'lobby' | 'car' | 'deck';
const regionAt = (x: number): Region => (x < LOBBY1 + 200 ? 'lobby' : x < D0 - 400 ? 'car' : 'deck');
const LOBBY_EXIT: Exit[] = [{ x0: LOBBY0, x1: LOBBY0 + 60, yTop: GY - 40, yBot: GY + 2, to: DOORS.drag.end }];

// ---------------------------------------------------------------------------------------------------------------
// The scenes

/** Up from the lobby (the full ride, the first time): the elevator's doors open behind him, a fade through black, and
 *  he's in the car. */
const startRide = (state: GameState, ns: Needle) => { openDoors(ns, LIFT_X); startFade(state, ns, 'ride'); };
/** In at the top: stood in the deck's elevator doorway, the doors opening on him, a ding. (`first`: off the full ride;
 *  the announcer welcomes him to space, and the first time on the deck, what it is.) */
const arriveDeck = (state: GameState, ns: Needle, first: boolean) => {
  const p = state.player;
  ns.tok++;
  teleport(state, DECK_LIFT, GY); p.facing = 1; snapCam(state);
  openDoors(ns, DECK_LIFT);
  playSound('ding', 0.8, 4);
  state.stageMemo[RODE_MEMO] = '1';
  ns.nextBored = state.frame + 1500; ns.nextPa = state.frame + 1800; ns.nextChat = state.frame + 600;
  const intro = !ns.deckIntro;
  ns.deckIntro = true;
  const deck = () => { if (intro) paSays(ns, pickLine(L.PA_DECK), true, () => meatheadSays(state, pickLine(L.MH_DECK), true)); };
  if (first) paSays(ns, pickLine(L.PA_SPACE), true, () => meatheadSays(state, pickLine(L.MH_SPACE), true, deck));
  else deck();
};
const ride = (state: GameState, ns: Needle) => {
  const t = ++ns.t, r = ns.ride;
  const k = c01(t / ASCENT);
  r.a = k * k * (3 - 2 * k); r.speed = Math.sin(Math.PI * k); r.climbed += r.speed * 40;
  if (t === 1) playSound('rumble', 0.5, -6);
  if (t % 40 === 0 && r.speed > 0.3) { shakeScreen(state, 4, 1 + r.speed); playSound('whoosh', 0.2 + r.speed * 0.3, -8); }
  if (t === 24) paSays(ns, pickLine(L.PA_UP), true, guard(ns, () => meatheadSays(state, pickLine(L.MH_UP), true, guard(ns, () => { ns.linesDone = true; }))));
  // (at the top, and his say's done: through black to the deck's doors)
  if (t >= ASCENT && (ns.linesDone || t > ASCENT + 900) && !r.topped) { r.topped = true; startFade(state, ns, 'top'); return; }
  if (t > SKIP_AFTER) {
    offerSkip();
    if (takeSkip()) { ns.tok++; silenceAll(); state.playerVulgarityTimer = 0; ns.pa = null; r.topped = true; startFade(state, ns, 'top'); }
  }
};
/** Every way through the elevator: a fade through black, the move made while it's black (the camera
 *  put straight onto him there: nothing in between ever shows), and the doors opening on him at the other end. */
const startFade = (state: GameState, ns: Needle, to: Needle['fadeTo']) => {
  ns.phase = 'fade'; ns.t = 0; ns.fadeTo = to; state.player.inCutscene = true; state.player.vel.x = 0;
};
const FADE = 24;
const fade = (state: GameState, ns: Needle) => {
  const t = ++ns.t, p = state.player;
  if (t === FADE) {
    switch (ns.fadeTo) {
      case 'ride':
        ns.tok++; ns.linesDone = false; ns.ride = { a: 0, speed: 0, climbed: 0, topped: false };
        teleport(state, CAR_X, GY); p.facing = 1; snapCam(state);
        break;
      case 'up': arriveDeck(state, ns, false); break;
      case 'top': arriveDeck(state, ns, true); break;
      case 'down': teleport(state, LIFT_X, GY); p.facing = -1; snapCam(state); openDoors(ns, LIFT_X); playSound('ding', 0.8, 4); break;
    }
  }
  // (on the ride, the car's own fade in is part of the ride)
  if (ns.fadeTo === 'ride' && t > FADE) { ns.phase = 'ride'; ns.t = 0; ns.fadeIn = FADE; playSound('ding', 0.7, 2); return; }
  if (t >= FADE * 2) { ns.phase = 'free'; p.inCutscene = false; }
};
/** The elevator's doors at x opening (and shutting again after). */
const openDoors = (ns: Needle, x: number) => { ns.doors = { x, t: 0 }; };
/** The camera straight onto him where he is now, its limits and its row there: no gliding in from where it was. */
const snapCam = (state: GameState) => {
  const lim = needle.cameraX!(state)!, row = needle.cameraRow!(state) ?? 550;
  const p = state.player;
  state.cameraMinX = lim.min; state.cameraMaxX = lim.max;
  state.camera.x = Math.max(lim.min, Math.min(lim.max, p.pos.x + p.width / 2 - CANVAS_WIDTH / 2));
  state.camera.y = p.pos.y + p.height - row; state.cameraRestY = state.camera.y;
};

const startSuit = (state: GameState, ns: Needle) => {
  ns.phase = 'suit'; ns.t = 0; ns.smashT = 0;
  const p = state.player;
  p.inCutscene = true; p.vel.x = 0; p.facing = p.pos.x + p.width / 2 < CASE_X ? 1 : -1;
};
/** Punching the case in: frames (the wind-up, the hit on PUNCH_HIT, held, back) he's in his punch, not himself. */
const PUNCH_HIT = 6, PUNCH_END = 20;
/** `k`: -1 drawn back (the fist by his ear, the shoulder turned away), 1 landed (the arm out straight through the glass,
 *  his weight on the front foot). Facing right, feet at the origin. */
const punchPose = (c: CanvasRenderingContext2D, f: number, k: number) => {
  const out = Math.max(0, k), back = Math.max(0, -k), hipY = -18;
  drawLeg(c, [-5, hipY], [-10 - back * 2, hipY + 9], [-15 - back * 2, -1], 1, true);
  drawLeg(c, [5, hipY], [12 + out * 3, hipY + 9], [15 + out * 4, -1], 1, false);
  c.save(); c.translate(out * 3 - back * 2, hipY); c.rotate(0.12 * out - 0.1 * back);
  drawArmTo(c, [-8, -22], [-2 + 18 * out - 10 * back, -26 - 2 * back], [-6 + 40 * out - 8 * back, -34 - 6 * back + 2 * out], true, 7);
  drawTorsoFromHips(c);
  drawPoseHead(c, 6, -36, 0.05, 'roar', f);
  drawArmTo(c, [11, -22], [17, -30], [15, -40], false, 6);
  c.restore();
};
const suitScene = (state: GameState, ns: Needle) => {
  const t = ++ns.t, p = state.player;
  // (in his punch: drawn by drawFront, not himself)
  p.hidden = t < PUNCH_END;
  if (t === 6) {
    // (the case smashed: a backhand through the glass)
    playSound('glass', 1); playSound('punch', 0.8); playSound('alarm', 0.35, 4); shakeScreen(state, 6, 3);
    for (let k = 0; k < 22; k++) state.particles.push({ pos: { x: CASE_X + (Math.random() - 0.5) * 80, y: GY - 60 - Math.random() * 130 }, vel: { x: (Math.random() - 0.5) * 6, y: -2 - Math.random() * 4 }, life: 50, color: k % 3 ? '#CFFAFE' : '#F8FAFC', size: 2 + Math.random() * 3, grav: 0.3, isGlass: true } as never);
  }
  if (t > 6) ns.smashT++;
  if (t === 24) {
    // (into it: the pants he had on kept with it; it's a clean pair)
    const was = dressed(state);
    putOnSuit(state);
    playSound('whoosh', 0.7, 4); playSound('powerup', 0.5, 6);
    for (let k = 0; k < 20; k++) state.particles.push({ pos: { x: p.pos.x + p.width / 2 + (Math.random() - 0.5) * 30, y: p.pos.y + Math.random() * p.height }, vel: { x: (Math.random() - 0.5) * 3, y: -1 - Math.random() * 2 }, life: 34, color: '#F1F5F9', size: 3 + Math.random() * 4, grav: -0.02 } as never);
    // (him on it; the nearest of them; the announcer)
    const near = ns.pax.filter(x => !x.fly).sort((a, b) => Math.abs(a.x - CASE_X) - Math.abs(b.x - CASE_X))[0];
    meatheadSays(state, pickLine(L.MH_SUIT[was]), true, () => {
      const then = () => paSays(ns, pickLine(L.PA_SUIT[was]), true);
      if (near && Math.abs(near.x - CASE_X) < 900) guestSays(near, pickLine(L.GUEST_SUIT[was]), true, then); else then();
    });
  }
  if (t >= 36) { ns.phase = 'free'; p.inCutscene = false; }
};

/** How much shooting the big window takes before it goes (a dozen or so ray gun shots). */
const WINDOW_HP = 300;
/** One hit this hard (a mallet, the flintlock's ball, a meteor, the stunt car's fireball) and it goes outright, the
 *  same as a charge into it; less, it chips it. */
const WINDOW_BREAK = 60;
/** What a weapon's projectile does to it, where its own damage says nothing (theirs is dealt out on the hit). */
const WINDOW_CHIP: Partial<Record<string, number>> = { STUNT_CAR: WINDOW_HP, SPELLBOOK: 80 };
/** (the window's strip, world: its face and a little into it) */
const WIN_X0 = D1 - 12, WIN_X1 = D1 + 20;
/** Every weapon's hits that aren't projectiles (weapons/strikes.ts), and the spawner's litter chewing on it: what's
 *  landed on the window since the deck last looked (it's dealt with in free(), the same as a shot). */
let onGlass: { dmg: number; y: number }[] = [];
/** The deck, while it's running (and the frame it last ran): the spawner's bait only while it's there. */
let deckNow: { ns: Needle; frame: number } | null = null;
const glassOpen = (state: GameState) => !!deckNow && state.frame - deckNow.frame < 3 && deckNow.ns.phase === 'free' && deckNow.ns.glass === 'whole';
onStrike(s => {
  if (!deckNow || deckNow.ns.glass !== 'whole' || s.x1 < WIN_X0 || s.x0 > WIN_X1 || s.y1 < WIN_TOP - 12 || s.y0 > GY) return;
  onGlass.push({ dmg: s.dmg, y: Math.max(WIN_TOP, Math.min(GY - 10, (Math.max(s.y0, WIN_TOP) + Math.min(s.y1, GY)) / 2)) });
});
addSpawnerBaits(state => (glassOpen(state) ? [{
  x: D1 - 16, y: GY - 130, w: 16, h: 130,
  alive: () => glassOpen(state),
  bite: (dmg: number) => { onGlass.push({ dmg: dmg * 4, y: GY - 40 - Math.random() * 80 }); },
}] : []));
/** A hit on the window (`dmg`, at height `y`): chipped, the cracks spreading from it; true, it's gone (the crack started). */
const hitGlass = (state: GameState, ns: Needle, dmg: number, y: number) => {
  ns.shot += dmg; ns.hitY = y; ns.crack = Math.min(0.45, (ns.shot / WINDOW_HP) * 0.45);
  playSound('clink', 0.8, -4 + Math.random() * 6);
  for (let k = 0; k < 6; k++) state.particles.push({ pos: { x: D1, y: ns.hitY }, vel: { x: -1 - Math.random() * 3, y: (Math.random() - 0.5) * 4 }, life: 22, color: k % 2 ? '#CFFAFE' : '#F8FAFC', size: 2, grav: 0.2, isGlass: true } as never);
  if (ns.shot >= WINDOW_HP || dmg >= WINDOW_BREAK) { startCrack(state, ns, true); return true; }
  return false;
};
const startCrack = (state: GameState, ns: Needle, shot = false) => {
  const p = state.player;
  ns.phase = 'crack'; ns.t = 0; ns.crack = shot ? ns.crack : 0; if (!shot) ns.hitY = p.pos.y + p.height * 0.35;
  p.inCutscene = true;
  for (const x of ns.pax) { x.facing = 1; x.wait = 999; x.to = x.x; }
};
const crackScene = (ctx: FrameContext, ns: Needle) => {
  const { state } = ctx, t = ++ns.t;
  ns.crack = Math.max(ns.crack, c01(t / 26));
  if (t === 1) { playSound('crack', 1); shakeScreen(state, 6, 3); }
  if (t === 14) playSound('crack', 0.8, 4);
  if (t >= 34) startBlow(ctx, ns);
};
const startBlow = (ctx: FrameContext, ns: Needle) => {
  const { state } = ctx, p = state.player;
  ns.phase = 'blow'; ns.t = 0; ns.tok++; ns.glass = 'gone'; ns.linesDone = false;
  ns.survive = wearingHelmet(state) || !!ctx.cheats.invincible;
  state.blocks = state.blocks.filter(b => b.tag !== 'needle-window');
  playSound('boom', 1, -4); playSound('glass', 1); playSound('screams', 0.8); shakeScreen(state, 16, 9);
  for (let k = 0; k < 30; k++) state.particles.push({ pos: { x: D1 + Math.random() * 18, y: GY - 20 - Math.random() * 330 }, vel: { x: 6 + Math.random() * 10, y: (Math.random() - 0.5) * 4 }, life: 60, color: k % 3 ? '#CFFAFE' : '#F8FAFC', size: 2 + Math.random() * 4, grav: 0, isGlass: true } as never);
  setOutGuests(ns.pax.map(x => x.g));
  for (const x of ns.pax) x.g.said = null;
  // (him: grabbed onto the sill, streaming out of it like a flag)
  p.hidden = true; p.vel.x = 0; p.vel.y = 0;
  ns.mh = { x: D1 - 4, y: GY - 70, rot: -Math.PI / 2, vx: 0, cling: true, t: 0 };
  // (him first, then the announcer, calm, over the rest of it)
  meatheadSays(state, pickLine(ns.survive ? L.MH_SUCKED_SUIT : L.MH_SUCKED), true, guard(ns, () => { ns.linesDone = true; paSays(ns, pickLine(L.PA_BREACH), true); }));
};
const JUNK = ['#F8FAFC', '#D2551A', '#FDE68A', '#7E22CE', '#16A34A', '#CDD6E2', '#B91C1C'];
const blowScene = (ctx: FrameContext, ns: Needle) => {
  const { state } = ctx, t = ++ns.t;
  // the wind: everything loose going out of the hole
  if (t % 10 === 0) playSound('whoosh', Math.max(0.2, 0.9 - t / 400), -8);
  if (t < 260) for (let k = 0; k < 3; k++) state.particles.push({ pos: { x: state.camera.x - 40 + Math.random() * 860, y: GY - 10 - Math.random() * 360 }, vel: { x: 9 + Math.random() * 9, y: (Math.random() - 0.5) * 2 }, life: 70, color: JUNK[(t + k) % JUNK.length], size: 2 + Math.random() * 4, grav: 0 } as never);
  // the passengers: the nearest first, off their feet, tumbling, out
  for (const x of ns.pax) {
    if (x.gone) continue;
    if (!x.fly) {
      if (t < (D1 - x.x) / 26 + (hash(x.home) * 14)) continue;
      x.fly = { x: x.x, y: GY, vx: 1, vy: -2 - hash(x.home + 1) * 3, rot: 0, vr: (hash(x.home + 2) - 0.5) * 0.3 };
      if (hash(x.home + 5) < 0.4) playSound('screams', 0.35, (hash(x.home) - 0.5) * 8);
    }
    const f = x.fly;
    f.vx = Math.min(22, f.vx + 0.42); f.vy += (GY - 70 - hash(x.home + 9) * 260 - f.y) * 0.004; f.vy *= 0.96;
    f.x += f.vx; f.y += f.vy; f.rot += f.vr;
    if (f.x > D1 + 700) x.gone = true;
  }
  // him: holding on, flapping; then he's gone too
  const m = ns.mh;
  if (m.cling) {
    m.rot = -Math.PI / 2 + Math.sin(t * 0.55) * 0.12 + Math.sin(t * 1.7) * 0.05;
    if ((ns.linesDone && t > 100) || t > 520) { m.cling = false; m.vx = 3; playSound('whoosh', 1, -4); }
  } else {
    m.t++; m.vx = Math.min(26, m.vx + 0.9); m.x += m.vx; m.y -= 0.6; m.rot += 0.22;
    if (m.t > 50) startOut(ctx, ns);
  }
};
const startOut = (ctx: FrameContext, ns: Needle) => {
  const { state } = ctx, p = state.player;
  ns.phase = 'out'; ns.t = 0; ns.tok++; ns.linesDone = false;
  // (his body put down somewhere sane: on the deck by the hole)
  p.pos.x = D1 - 60 - p.width / 2; p.pos.y = GY - p.height; p.vel.x = 0; p.vel.y = 0;
  if (!ns.survive) {
    // no helmet: dead (his own death: death.ts's kill cam)
    p.inCutscene = false;
    hurtPlayer(ctx, 9999, VACUUM);
  }
};
const outScene = (state: GameState, ns: Needle) => {
  const t = ++ns.t;
  if (!ns.survive) return;
  if (t === 150) meatheadSays(state, pickLine(L.MH_FLOAT), true, guard(ns, () => { ns.linesDone = true; }));
  let done = (t >= 280 && ns.linesDone) || t > 1000;
  if (t > SKIP_AFTER) { offerSkip(); if (takeSkip()) { silenceAll(); state.playerVulgarityTimer = 0; done = true; } }
  if (done) handOff(state, ns);
};
/** Out in space, fine: on to the orbit (its section takes over from its start). The deck's left sealed and empty. */
const handOff = (state: GameState, ns: Needle) => {
  const p = state.player;
  ns.tok++;
  state.stageMemo[SEALED_MEMO] = '1';
  teleport(state, DOORS.orbit.start.x, DOORS.orbit.start.y);
  p.hidden = false; p.inCutscene = false; p.facing = 1;
  ns.phase = 'free'; ns.glass = 'sealed'; ns.pax = [];
};

// ---------------------------------------------------------------------------------------------------------------
// The deck, free: the passengers milling, the chatter, the suit, the elevator, the window

const mill = (state: GameState, ns: Needle) => {
  for (const x of ns.pax) {
    if (x.fly) continue;
    if (x.wait > 0) { x.wait--; continue; }
    const d = x.to - x.x;
    if (Math.abs(d) < 1) {
      x.wait = 120 + Math.floor(Math.random() * 360);
      x.to = Math.max(D0 + 260, Math.min(D1 - 120, x.home + (Math.random() - 0.5) * 300));
      // (stood looking out of the window: facing it is facing us; whichever way they like)
      if (Math.random() < 0.5) x.facing = Math.random() < 0.5 ? 1 : -1;
      continue;
    }
    x.facing = d > 0 ? 1 : -1;
    x.x += Math.sign(d) * Math.min(Math.abs(d), 0.55);
    x.g.x = x.x; x.g.facing = x.facing;
  }
  void state;
};
const chatter = (state: GameState, ns: Needle) => {
  const p = state.player, cx = p.pos.x + p.width / 2, f = state.frame;
  if (f >= ns.nextBored) { ns.nextBored = f + 1500 + Math.floor(Math.random() * 700); meatheadSays(state, pickLine(L.MH_BORED), false); }
  if (f >= ns.nextPa) { ns.nextPa = f + 2100 + Math.floor(Math.random() * 900); paSays(ns, pickLine(L.PA_IDLE), false); }
  const near = ns.pax.filter(x => !x.fly && Math.abs(x.x - cx) < 380);
  if (f >= ns.nextChat && near.length) { ns.nextChat = f + 900 + Math.floor(Math.random() * 700); guestSays(near[Math.floor(Math.random() * near.length)], pickLine(L.GUEST_VIEW), false); }
  const bump = near.find(x => Math.abs(x.x - cx) < 34);
  if (bump && f >= ns.nextReact) { ns.nextReact = f + 700; bump.facing = bump.x < cx ? 1 : -1; guestSays(bump, pickLine(L.GUEST_REACT[dressed(state)]), false); }
};

const free = (ctx: FrameContext, ns: Needle, controls: Controls): Controls => {
  const { state } = ctx, p = state.player, cx = p.pos.x + p.width / 2;
  const up = !!controls.up && !ns.upWas;
  ns.upWas = !!controls.up;
  const ground = p.isGrounded && !p.inCutscene;
  const region = regionAt(cx);
  if (region === 'lobby') {
    if (runExits(state, LOBBY_EXIT)) return controls;
    if (!lobbySaid && cx > LOBBY0 + 260) { lobbySaid = true; meatheadSays(state, pickLine(L.MH_LOBBY), false); }
    if (ground && Math.abs(cx - LIFT_X) < 50) {
      setUi({ upPrompt: 'RIDE UP' });
      if (up) { if (state.stageMemo[RODE_MEMO]) { openDoors(ns, LIFT_X); startFade(state, ns, 'up'); } else startRide(state, ns); return hands(); }
    }
    return controls;
  }
  if (region === 'car') { arriveDeck(state, ns, false); return hands(); }
  // the deck
  mill(state, ns);
  chatter(state, ns);
  if (ground && Math.abs(cx - DECK_LIFT) < 50) {
    setUi({ upPrompt: 'RIDE DOWN' });
    if (up) { openDoors(ns, DECK_LIFT); startFade(state, ns, 'down'); return hands(); }
  }
  if (ground && Math.abs(cx - CASE_X) < 64) {
    if (!state.stageMemo[SUIT_MEMO]) {
      setUi({ upPrompt: 'TAKE THE SUIT' });
      if (up) { startSuit(state, ns); return hands(); }
    } else if (up && state.frame >= ns.nextCase) { ns.nextCase = state.frame + 300; meatheadSays(state, pickLine(L.MH_CASE_EMPTY), false); }
  }
  // (the airlock in the shutter, at the deck's end: walked on into with the helmet on, he's out, there and then (the
  // user's: "any transitions with a door at the edge just goes through automatically. no animation"); without it, he
  // says so, once a go at it)
  if (ns.glass === 'sealed') {
    const feet = p.pos.y + p.height;
    if (!p.inCutscene && p.health > 0 && cx > AIRLOCK_X && feet >= GY - 40 && feet <= GY + 2) {
      if (wearingHelmet(state)) { teleport(state, DOORS.orbit.start.x, DOORS.orbit.start.y); p.facing = 1; return controls; }
      if (!airlockSaid) { airlockSaid = true; meatheadSays(state, pickLine(L.MH_AIRLOCK_NO), false); }
    } else if (cx < AIRLOCK_X - 120) airlockSaid = false;
  }
  if (ns.glass === 'whole') {
    // (shot at, by anything of his: each one chips it, the cracks spreading out from where they hit; enough of them, or
    // one big enough, and it goes, the same as a charge into it)
    for (const q of state.projectiles) {
      if (q.owner !== 'player' || q.health <= 0) continue;
      if (q.pos.x + q.width + Math.max(0, q.vel.x) < D1 - 2 || q.pos.x > WIN_X1 || q.pos.y + q.height < WIN_TOP - 12 || q.pos.y > GY) continue;
      q.health = 0;
      if (hitGlass(state, ns, Math.max(q.damage || 0, (q.custom && WINDOW_CHIP[q.custom]) || 25), q.pos.y + q.height / 2)) { onGlass = []; return hands(); }
    }
    // (everything else of his that's landed on it: a mallet, the flintlock's ball, a fireball, the sucker, the litter)
    const landed = onGlass; onGlass = [];
    for (const h of landed) if (hitGlass(state, ns, h.dmg, h.y)) return hands();
    // (into it himself: a charge, a slide, an uppercut, a dive kick)
    const melee = p.isCharging || p.isSliding || p.isUppercutting || !!p.isDivekicking;
    if (melee && p.facing === 1 && p.pos.x + p.width >= D1 - 10 && p.pos.y + p.height > WIN_TOP) { startCrack(state, ns); return hands(); }
    if (!ns.warned && cx > D1 - 90) { ns.warned = true; meatheadSays(state, pickLine(L.MH_WINDOW), false); }
  }
  return controls;
};

// ---------------------------------------------------------------------------------------------------------------
// The section

const deckIn = (state: GameState) => regionOfCamOrPlayer(state) === 'deck';
const regionOfCam = (state: GameState): Region => regionOfCamOrPlayer(state);

export const needle: SpaceSection = {
  id: 'needle', x0: NX0, x1: NX1,
  checkpoints: [
    { name: 'SPACE NEEDLE 2', cp: 40, x: DOORS.needle.start.x, y: GY },
    { name: 'OBSERVATION DECK', cp: 41, x: DECK_LIFT, y: GY },
  ],
  build: (state) => {
    layOwn(state, [
      { x1: LOBBY0 - 200, y1: GY, x2: LOBBY1 + 80, y2: GY, surface: 'hard' },
      { x1: CAR0 - 80, y1: GY, x2: CAR1 + 80, y2: GY, surface: 'metal' },
      { x1: D0 - 600, y1: GY, x2: D1, y2: GY, surface: 'hard' },
    ]);
    // (walls: the lobby's ends, the car's, the deck's bulkhead and its big window)
    for (const [x, tag] of [[LOBBY0 - 40, 'needle-lobby0'], [LOBBY1, 'needle-lobby1'], [CAR0 - 40, 'needle-car0'], [CAR1, 'needle-car1'], [D0 - 40, 'needle-bulkhead'], [D1, 'needle-window']] as const) solid(state, x, GY - 2000, 40, 2200, { hidden: true, tag });
    // (the ceilings: the lobby's coffers (their underside GY - 490), the deck's soffit (its lit edge at CEIL + 24))
    solid(state, LOBBY0, GY - 560, LOBBY1 - LOBBY0, 70, { hidden: true, tag: 'needle-ceiling' });
    solid(state, D0, CEIL - 40, D1 - D0, 64, { hidden: true, tag: 'needle-ceiling' });
    st(state);
    reapplySuit(state);
    prewarmSky();
  },
  update: (ctx, controls) => {
    const { state } = ctx, ns = st(state);
    deckNow = { ns, frame: state.frame };
    if (ns.phase !== 'free' || ns.glass !== 'whole') onGlass = [];
    ns.drift += 0.3;
    if (ns.doors && ++ns.doors.t > 90) ns.doors = null;
    if (ns.fadeIn > 0) ns.fadeIn--;
    switch (ns.phase) {
      case 'free': return free(ctx, ns, controls);
      case 'ride': ride(state, ns); return hands();
      case 'fade': fade(state, ns); return hands();
      case 'suit': suitScene(state, ns); return hands();
      case 'crack': crackScene(ctx, ns); return hands();
      case 'blow': blowScene(ctx, ns); return hands();
      case 'out': outScene(state, ns); return hands();
    }
    return controls;
  },
  cameraX: (state) => {
    const r = regionOfCamOrPlayer(state);
    if (r === 'lobby') return { min: LOBBY0, max: LOBBY1 - CANVAS_WIDTH };
    if (r === 'car') return { min: CAR_X - CANVAS_WIDTH / 2, max: CAR_X - CANVAS_WIDTH / 2 };
    return { min: D0 + 110 - CANVAS_WIDTH / 2, max: D1 - 130 - CANVAS_WIDTH / 2 };
  },
  cameraRow: (state) => { const r = regionOfCamOrPlayer(state); return r === 'lobby' ? 520 : r === 'car' ? 470 : DECK_ROW; },
  // (the deck: wrapped round the ring, seen from inside it; the lobby and the elevator flat)
  cylinder: (state) => {
    if (regionOfCamOrPlayer(state) !== 'deck') return null;
    const cyl = { radius: RING_R, inside: { horizon: DECK_HORIZON } };
    return cyl;
  },
  drawBackdrop: (c, state) => {
    const ns = st(state), r = regionOfCam(state);
    if (r === 'lobby') drawAscent(c, state, 0, 0, 0, false);
    else if (r === 'car') drawAscent(c, state, ns.ride.a, ns.ride.speed, ns.ride.climbed);
    else drawDeckView(c, state, state.camera.x + CANVAS_WIDTH / 2 - D0 + ns.drift, RING_C);
    return true;
  },
  drawBack: (c, state) => {
    const ns = st(state);
    drawLobby(c, state);
    // (an elevator's doors opening: the lobby's or the deck's)
    const doorsOpen = (d: { t: number }) => Math.min(c01(d.t / 14), c01((86 - d.t) / 18));
    if (ns.doors?.x === LIFT_X) drawLiftDoors(c, LIFT_X, 54, 170, doorsOpen(ns.doors));
    drawCar(c, state, altitude(ns));
    if (!deckIn(state) && state.camera.x + CANVAS_WIDTH < D0 - 340) return;
    drawDeck(c, state);
    if (ns.doors?.x === DECK_LIFT) drawLiftDoors(c, DECK_LIFT, 52, 160, doorsOpen(ns.doors));
    drawSuitCase(c, state, !!state.stageMemo[SUIT_MEMO] && !(ns.phase === 'suit' && ns.t < 7), ns.smashT);
    drawEndGlass(c, state, ns.glass, ns.crack, ns.hitY);
    for (const x of ns.pax) {
      if (x.gone) continue;
      const g = x.g;
      if (x.fly) {
        c.save(); c.translate(Math.round(x.fly.x), Math.round(x.fly.y - 40)); c.rotate(x.fly.rot); c.scale(g.scale * x.facing, g.scale);
        const shrink = x.fly.x > D1 ? Math.max(0.15, 1 - (x.fly.x - D1) / 600) : 1; c.scale(shrink, shrink);
        c.translate(0, 40); g.who.draw(c, state.frame + g.seed, false); c.restore();
      } else {
        c.save(); c.translate(Math.round(x.x), GY); c.scale(g.scale * x.facing, g.scale); g.who.draw(c, state.frame + g.seed, !!g.said); c.restore();
      }
    }
  },
  drawFront: (c, state) => {
    const ns = st(state);
    // (the punch into the case: back, the jab through the glass, held, back down)
    if (ns.phase === 'suit' && ns.t < PUNCH_END) {
      const p = state.player, t = ns.t;
      const k = t < PUNCH_HIT - 2 ? -Math.min(1, t / (PUNCH_HIT - 2)) : t < PUNCH_HIT ? -1 + (t - PUNCH_HIT + 2) : t < PUNCH_HIT + 7 ? 1 : 1 - (t - PUNCH_HIT - 7) / (PUNCH_END - PUNCH_HIT - 7);
      drawPoseSprite(c, p.pos.x + p.width / 2, p.pos.y + p.height, p.facing || 1, g => punchPose(g, state.frame, k));
    }
    // (him, dragged out of the window: hanging onto the sill, then gone)
    if (ns.phase === 'blow') {
      const m = ns.mh;
      const cx = m.x + Math.cos(m.rot + Math.PI / 2) * -30, cy = m.y + Math.sin(m.rot + Math.PI / 2) * -30;
      drawPuppet(c, state, { x: m.cling ? m.x + 30 : cx, y: m.cling ? m.y : cy, rot: m.rot, s: 1, face: ns.survive ? 'shock' : 'scream', suit: wearingHelmet(state), facing: 1 });
      if (m.cling) { c.fillStyle = '#1A0B06'; c.fillRect(m.x - 7, m.y - 5, 10, 10); c.fillStyle = '#E0AC82'; c.fillRect(m.x - 6, m.y - 4, 8, 8); }
    }
    // (what's said: the announcer, at the speaker nearest the middle of the view (the car's, riding); the passengers)
    if (ns.pa) {
      const mid = state.camera.x + CANVAS_WIDTH / 2;
      if (regionOfCam(state) === 'car') saidOver(c, ns.pa.text, CAR_X, GY - 222, '#A5F3FC');
      else if (regionOfCam(state) === 'deck') {
        let k = Math.round((mid - D0 - SLOT / 2) / SLOT); k = Math.max(0, Math.min(SLOTS - 1, k));
        saidOver(c, ns.pa.text, slotX(k), SPEAKER_Y + 40, '#A5F3FC');
      }
    }
    for (const x of ns.pax) if (x.g.said && !x.fly) saidOver(c, x.g.said, x.x, GY - 96);
  },
  drawHud: (c, state) => {
    const ns = st(state);
    const d = state.meatheadDeath;
    if (d && d.kind === DECOMP && state.deathTimer > 0) {
      const len = state.deathScene?.len ?? 420;
      drawDecompCam(c, state, Math.min(state.deathScene?.t ?? len, len));
      return;
    }
    if (ns.phase === 'out' && ns.survive) { drawFloat(c, state, ns.t); if (ns.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH); }
    if (ns.phase === 'ride' && ns.t > SKIP_AFTER) drawSkipPrompt(c, CANVAS_WIDTH);
    if (ns.fadeIn > 0) { c.fillStyle = `rgba(0, 0, 0, ${c01(ns.fadeIn / FADE).toFixed(3)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (ns.phase === 'fade') {
      const t = ns.t, a = t < FADE ? t / FADE : (FADE * 2 - t) / FADE;
      c.fillStyle = `rgba(0, 0, 0, ${c01(a).toFixed(3)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  },
};

/** Which part he's in, for the camera (the camera follows him: his own place, not the camera's). */
const regionOfCamOrPlayer = (state: GameState): Region => { const p = state.player; return regionAt(p.pos.x + p.width / 2); };
/** What the car's readout says, going up. */
const altitude = (ns: Needle) => {
  const ft = Math.round(ns.ride.a * 327360);
  return ft < 5280 * 2 ? `${ft.toLocaleString('en-US')} FT` : `${Math.round(ft / 5280)} MILES`;
};
