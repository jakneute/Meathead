// What the armor and the cape do (SPEC.md, Phase B), put into the engine's hooks (m1 game/core/tuning.ts setMoveMods,
// core/resist.ts setHurtGear, bosses/shared.ts setHurtVeto) from apply.ts. Each asks has(piece) live, so the cheats'
// toggles take on the spot. The numbers are tune.ts's.
//
//   SABATONS   the dive kick goes further across; it stomps spiked tops (KindDef.spiky) like any other, and the
//              dungeon's spike bed doesn't hurt him coming down on it in one (spikeProof, below).
//   PAULDRONS  the charge goes further; what's pointed at it (KindDef.pointy: spears, horns) is just another body.
//   LEG ARMOR  the slide goes further; nothing hurts him from in front while he's sliding (shots, swings, anything
//              that would throw him back the way he came; not instant kills); a regular enemy the slide doesn't kill is
//              TRIPPED (down LEGS_TRIP_FRAMES, its body harmless meanwhile) and he slides on through it, no bounce off.
//              A boss or a sub-boss just takes the hit, as ever.
//   ARMGUARDS  the uppercut goes higher; it lands through a boss's shield (the engine's bossDef.shield).
//   HELMET     every hurt bar instant kills ×HELMET_HURT; a regular enemy's shot into his head is stopped (not a boss's
//              or a sub-boss's, not anything big); ducking, the stopped area's bigger. The engine's shots ask it
//              (stopsShot); Meathead 2's own shot systems ask helmetStops (below) where they're wired in.
//   CAPE       faster walking (×CAPE_WALK, times any bulk up), higher jumps, and the float: hold jump falling to drift
//              down, steering (on his own legs only: not swimming, on a vine, a ladder, a ride, skis, a vehicle...).
//   THE LOOK   an armored charge move's flourishes (speed lines, afterimages, glow, sparks, rings, dust, the dive kick's
//              fire, the hit bursts) in its piece's land colors (the owner's "make sure the visual flourishes of an
//              upgraded charge attack are fancier colors too"): m1 render/player/moveFlair.ts, FLAIR below.

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Player, Projectile } from '../../m1/types';
import { setMoveMods, type MeleeMove } from '../../m1/game/core/tuning';
import { setMoveFlair, type MoveFlair } from '../../m1/game/render/player/moveFlair';
import { setFlashTint } from '../../m1/game/render/player/player';
import { rageFlash } from './amulet';
import { setHurtGear, INSTANT_KILL_HURT } from '../../m1/game/core/resist';
import { setHurtVeto } from '../../m1/game/bosses/shared';
import { isMidBossKind } from '../../m1/game/combat/midBoss';
import { playSound } from '../../m1/game/platform/audio';
import { has } from './state';
import {
  PAULDRONS_REACH, LEGS_REACH, ARMGUARDS_REACH, SABATONS_REACH, LEGS_TRIP_FRAMES,
  HELMET_HURT, HELMET_HEAD_H, HELMET_HEAD_ABOVE, HELMET_DUCK_HEAD_H, HELMET_MAX_SHOT,
  CAPE_WALK, CAPE_JUMP_HOLD, CAPE_FLOAT_FALL,
} from './tune';

const REACH: Record<MeleeMove, [Parameters<typeof has>[0], number]> = {
  charge: ['pauldrons', PAULDRONS_REACH], slide: ['legs', LEGS_REACH], uppercut: ['armguards', ARMGUARDS_REACH], divekick: ['sabatons', SABATONS_REACH],
};

/** Each armored move's look, in its piece's provisional land colors (SPEC.md, armorArt.ts). */
const PLAIN_FIRE = ['#7F1D1D', '#B91C1C', '#EA580C', '#F59E0B', '#FDE047', '#FEF9C3'];
const FLAIR: Record<MeleeMove, MoveFlair> = {
  // Pauldrons, Jungle: leopard gold and jungle green, tusk-ivory rings, bamboo dust
  charge: {
    lines: ['rgba(238, 198, 118, 0.9)', 'rgba(132, 204, 22, 0.85)'],
    glow: ['rgba(255, 237, 184, 0.95)', 'rgba(210, 154, 60, 0.55)', 'rgba(101, 163, 13, 0)'],
    ghost: 'sepia(1) saturate(5) hue-rotate(40deg) brightness(1.15)',
    sparks: ['#FFEDB8', '#84CC16'], ring: '242, 234, 208', dust: '156, 148, 82', fire: PLAIN_FIRE, burst: '#D29A3C',
  },
  // Leg armor, Hollywood: statuette gold, glitter, gold dust
  slide: {
    lines: ['#F0C850', '#FFFFFF'],
    glow: ['rgba(255, 242, 176, 0.95)', 'rgba(240, 200, 80, 0.55)', 'rgba(200, 150, 26, 0)'],
    ghost: 'sepia(1) saturate(4) brightness(1.3)',
    sparks: ['#FFF2B0', '#F0C850'], ring: '255, 242, 176', dust: '240, 200, 80', fire: PLAIN_FIRE, burst: '#F0C850',
  },
  // Armguards, Future: chrome and neon, cyan and magenta
  uppercut: {
    lines: ['rgba(34, 211, 238, 0.9)', 'rgba(232, 121, 249, 0.9)'],
    glow: ['rgba(255, 255, 255, 0.95)', 'rgba(232, 121, 249, 0.6)', 'rgba(34, 211, 238, 0)'],
    ghost: 'sepia(1) saturate(6) hue-rotate(250deg) brightness(1.3)',
    sparks: ['#E0FFFF', '#F0ABFC'], ring: '203, 213, 225', dust: '148, 163, 184', fire: PLAIN_FIRE, burst: '#E879F9',
  },
  // Sabatons, Wilderness: molten railroad iron going to cowbell brass, white-hot at the core; iron and gold sparks
  divekick: {
    lines: ['rgba(221, 178, 74, 0.85)', 'rgba(201, 119, 63, 0.85)'],
    glow: ['rgba(248, 224, 138, 0.95)', 'rgba(201, 119, 63, 0.55)', 'rgba(122, 58, 24, 0)'],
    ghost: 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.35)',
    sparks: ['#F8E08A', '#9A9AA8'], ring: '248, 224, 138', dust: '164, 83, 42',
    fire: ['#4E2410', '#7A3A18', '#A4532A', '#DDB24A', '#F8E08A', '#FFFCF0'], burst: '#DDB24A',
  },
};

/** A dive kick in the sabatons: proof against spikes coming down on them (a stage's spike hazards ask this too). */
export const spikeProof = (p: Player) => !!p.isDivekicking && has('sabatons');

/** On his own legs, nothing else steering him: where the cape's float can work. */
const onOwnLegs = (p: Player) =>
  !p.swimming && !p.carried && !p.skiing && !p.jetski && !p.bike && !p.moto && !p.vine && !p.ladder && !p.cartSeat && !p.logSeat
  && !p.inCutscene && !p.hiding && !p.airGrab && !p.noSpecials
  && !p.isCharging && !p.isUppercutting && !p.isDivekicking && !p.recoiling && p.lockTimer <= 0 && p.pushbackTimer <= 0 && p.health > 0;

// ---- the helmet's head
/** His head, as the helmet covers it (world): standing, the top of his box and a little above; ducking, more of it. */
const headBox = (p: Player) => p.isDucking || p.isSliding
  ? { x: p.pos.x, y: p.pos.y + 28, w: p.width, h: HELMET_DUCK_HEAD_H }
  : { x: p.pos.x, y: p.pos.y - HELMET_HEAD_ABOVE, w: p.width, h: HELMET_HEAD_H + HELMET_HEAD_ABOVE };
const overlaps = (a: { x: number; y: number; w: number; h: number }, x: number, y: number, w: number, h: number) =>
  a.x < x + w && a.x + a.w > x && a.y < y + h && a.y + a.h > y;

/** The clank off the helmet (or the leg armor), sparks where it hit; the sound not every frame. */
let clankAt = -99;
const clank = (state: GameState, x: number, y: number) => {
  if (state.frame - clankAt > 6) { clankAt = state.frame; playSound('clang', 0.7, 4 + Math.random() * 3); }
  for (let i = 0; i < 8; i++) state.particles.push({ pos: { x, y }, vel: { x: (Math.random() - 0.5) * 6, y: -1 - Math.random() * 4 }, life: 14, color: i % 2 ? '#FDE047' : '#FFFFFF', size: 1.5 + Math.random() * 1.5 });
};

/**
 * A regular enemy's shot (the box x, y, w, h, world) into his head with the helmet on: true if it's stopped (it's
 * spent; nothing hurts him; the clank's done). For Meathead 2's own shot systems: ask before hurting him with a shot
 * from a regular enemy (never a boss's or a sub-boss's, never a hazard's).
 */
export const helmetStops = (state: GameState, x: number, y: number, w: number, h: number) => {
  const p = state.player;
  if (!has('helmet') || p.health <= 0 || w >= HELMET_MAX_SHOT || h >= HELMET_MAX_SHOT) return false;
  if (!overlaps(headBox(p), x, y, w, h)) return false;
  clank(state, x + w / 2, y + h / 2);
  return true;
};
/** The same for a shot as a point and a radius (most of Meathead 2's own shots). */
export const helmetStopsAt = (state: GameState, x: number, y: number, r: number) => helmetStops(state, x - r, y - r, r * 2, r * 2);

/** Sliding in the leg armor, and this came at him from in front (where it is, or the way it's going). */
const slideFront = (p: Player, x: number, vx: number) => {
  if (!p.isSliding || !has('legs')) return false;
  const mid = p.pos.x + p.width / 2;
  return (x - mid) * p.chargeFace > 0 || vx * p.chargeFace < -0.5;
};

/** An engine shot that's reached him: stopped by the leg armor's front on a slide, or by the helmet. */
const stopsShot = (ctx: FrameContext, s: Projectile) => {
  const { state } = ctx, p = state.player;
  if (s.visualOnly) return false;
  const cx = s.pos.x + s.width / 2, cy = s.pos.y + s.height / 2;
  if (slideFront(p, cx, s.vel.x)) { clank(state, cx, cy); return true; }
  // (the helmet: only a regular enemy's (the engine names who fired it), nothing big)
  if (!s.shooterKind || s.shooterKind === 'alien' || isMidBossKind(s.shooterKind)) return false;
  return helmetStops(state, s.pos.x, s.pos.y, s.width, s.height);
};

let installed = false;
export const installGear = () => {
  if (installed) return;
  installed = true;
  setMoveMods({
    walk: () => (has('cape') ? CAPE_WALK : 1),
    jumpHold: () => (has('cape') ? CAPE_JUMP_HOLD : 1),
    floatFall: p => (has('cape') && onOwnLegs(p) ? CAPE_FLOAT_FALL : null),
    reach: move => { const [piece, k] = REACH[move]; return has(piece) ? k : 1; },
    spikeProof,
    pointProof: p => p.isCharging && !p.isSliding && has('pauldrons'),
    slideThrough: p => p.isSliding && has('legs'),
    uppercutPierces: p => p.isUppercutting && has('armguards'),
    // (not the armor's: every uppercut in Meathead 2. The owner: "if you uppercut a grounded enemy that is non-fatal,
    // you go up along with the enemy", the ninja drop there to follow it up with)
    uppercutCarries: p => p.isUppercutting,
    stopsShot,
    tripFrames: LEGS_TRIP_FRAMES,
  });
  setMoveFlair(move => (has(REACH[move][0]) ? FLAIR[move] : null));
  setFlashTint(() => rageFlash());
  setHurtGear(() => (has('helmet') ? HELMET_HURT : 1));
  // (the leg armor's front: anything that'd throw him back the way he's sliding from (it came at him from in front)
  // doesn't hurt him; nor knock him about. Not an instant kill)
  setHurtVeto((ctx, damage, _source, knock) => {
    const p = ctx.state.player;
    if (!knock || damage >= INSTANT_KILL_HURT || !p.isSliding || !has('legs')) return false;
    if (Math.sign(knock.x) !== -p.chargeFace) return false;
    clank(ctx.state, p.pos.x + p.width / 2 + p.chargeFace * (p.width / 2), p.pos.y + p.height - 18);
    return true;
  });
};
