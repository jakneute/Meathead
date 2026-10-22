// THE ENSEMBLE CAST: the Revengers, thirty of them on the books (legally distinct parodies: an A-lister in each legally
// distinct costume), every one distinct (the costume, the build, the hair, the skin, a gender mix), modestly detailed.
// The joke (the user's): they've played superheroes so long they think they ARE superheroes; they're just people in
// costumes. No powers, no moves of their own (the user's playtest notes): they come at him and DOGPILE him, latching on
// like cockroaches (fight.ts: legs, back, head, a growing pile; every one on him slows him; enough of them and he's
// down under it, dead). They're heavy to shove (hard to push about), and they die like the ordinary people they are:
// they fall over dead where they stand, bloodied, and stay there. Never gibbed, whatever the weapon (but the flintlock
// takes a head off, one a shot: the body stays, headless; the soul sucker can have one whole: weapons/half.ts). They're mid-bosses
// to the engine: it never runs their health out; fight.ts keeps their real health and lays the bodies down. His grab
// gets one at a time (the rest still pile on him while he's at it).

import type { Enemy } from '../../../m1/types';
import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import { holdingOff, mid, safeAhead } from '../../../m1/game/enemies/kinds';
import { playSound } from '../../../m1/game/platform/audio';
import { stamp } from '../../../m1/game/render/stamp';
import { registerM2Kind } from '../../kinds';
import { tick, setState } from '../blvd/kinds';
import {
  type Pose, type Body as Person, type Frame, INK, dk, lt, part, px, limb, ball, flat,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, hairTop, hairBack, frameOf, putFrame, moodOf, reaction,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;

type Mask = 'none' | 'helmetA' | 'faceplate' | 'full' | 'helmet' | 'cowl' | 'ears' | 'domino' | 'goggles' | 'tiara' | 'crown' | 'leaves' | 'raccoon';
type Prop = 'shield' | 'hammer' | 'gauntlet' | 'bow' | 'webs' | 'hands' | 'blaster' | 'sword' | 'knives' | 'batons' | 'arm' | 'wings' | 'fist' | 'claws' | 'katanas' | 'baton' | 'tiara' | 'batarang' | 'gun' | 'none';
type Emblem = 'none' | 'star' | 'bean' | 'window' | 'discs' | 'reactor' | 'hourglass' | 'spider' | 'amulet' | 'gem' | 'tattoo' | 'star8' | 'bolt' | 'circle' | 'phoenix' | 'W' | 'S' | 'bat' | 'bark';

export interface CastMember {
  hero: string; actor: string;
  woman: boolean; seed: number;
  /** Who's in the suit, where the seed won't do (green paint, bald, heavy). */
  look?: { skin?: string; hair?: string; heavy?: boolean; bald?: boolean; long?: boolean };
  suit: string; trim: string; boots: string; gloves?: string;
  /** Legs in another color (the big ones' torn pants); bare: no shirt (arms and chest are skin). */
  legs?: string; bare?: boolean;
  /** The costume's bits (the prop's only a prop: carried, dropped by the body; nothing's thrown or fired). */
  emblem: Emblem; cape?: string; mask: Mask; prop: Prop;
  /** Their health (the user: somewhat more than the first pass's), how quick they come at him. */
  hp: number; speed: number;
  /** On their knees in the suit (the raccoon). */
  short?: boolean;
}

export const CAST: CastMember[] = [
  { hero: 'CAPTAIN AMERICANO', actor: 'CHAZ EVANSTON', woman: false, seed: 12, suit: '#7C2D12', trim: '#F5DEB3', boots: '#3F1D0B', gloves: '#3F1D0B', emblem: 'bean', mask: 'helmetA', prop: 'shield', hp: 125, speed: 1.4 },
  { hero: 'THUD, GOD OF THUNDER-ISH', actor: 'LIAM HAMSWORTH', woman: false, seed: 25, look: { hair: '#F5D27A', long: true }, suit: '#5A3A22', trim: '#D97706', boots: '#3F2A14', emblem: 'discs', cape: '#15803D', mask: 'none', prop: 'hammer', hp: 138, speed: 1.2 },
  { hero: 'IRONIC MAN', actor: 'ROBBIE DOWNLY JR. JR.', woman: false, seed: 8, suit: '#0F766E', trim: '#C2703D', boots: '#0F766E', gloves: '#0F766E', emblem: 'reactor', mask: 'faceplate', prop: 'gauntlet', hp: 125, speed: 1.3 },
  { hero: 'THE INCREDIBLE BULK', actor: 'MARK RUFFLO', woman: false, seed: 3, look: { skin: '#E8833A', heavy: true, hair: '#1F1611' }, suit: '#E8833A', trim: '#1E3A8A', boots: '#E8833A', legs: '#1E3A8A', bare: true, emblem: 'none', mask: 'none', prop: 'none', hp: 244, speed: 1.0 },
  { hero: 'BLACK WINDOW', actor: 'SCARLETT JOHANSWAN', woman: true, seed: 30, look: { hair: '#E5E7EB' }, suit: '#2A1B3D', trim: '#A78BFA', boots: '#2A1B3D', gloves: '#2A1B3D', emblem: 'window', mask: 'none', prop: 'batons', hp: 131, speed: 1.7 },
  { hero: 'HAWKGUY', actor: 'JEREMY RENTER', woman: false, seed: 17, suit: '#B45309', trim: '#365314', boots: '#365314', gloves: '#365314', emblem: 'none', mask: 'none', prop: 'bow', hp: 106, speed: 1.4 },
  { hero: 'SPIDER-TEEN', actor: 'TOM HOLLOWAY', woman: false, seed: 41, suit: '#F97316', trim: '#1F2937', boots: '#1F2937', gloves: '#F97316', emblem: 'spider', mask: 'full', prop: 'webs', hp: 94, speed: 1.9 },
  { hero: 'DOCTOR STRANGLE', actor: 'BENEDICT CUMBERSOME', woman: false, seed: 22, look: { hair: '#1F1611' }, suit: '#4C1D95', trim: '#B45309', boots: '#57534E', emblem: 'amulet', cape: '#0F766E', mask: 'none', prop: 'hands', hp: 113, speed: 1.2 },
  { hero: 'THE SCARLET WHICH', actor: 'ELIZABETH OLSONNE', woman: true, seed: 51, look: { hair: '#3F2A14', long: true }, suit: '#065F46', trim: '#A3E635', boots: '#064E3B', emblem: 'none', cape: '#065F46', mask: 'crown', prop: 'hands', hp: 113, speed: 1.2 },
  { hero: 'VISIONARY', actor: 'PAUL BETTERNY', woman: false, seed: 14, look: { skin: '#A3A3B5', bald: true }, suit: '#1E40AF', trim: '#F97316', boots: '#1E40AF', emblem: 'gem', cape: '#F97316', mask: 'none', prop: 'none', hp: 125, speed: 1.0 },
  { hero: 'STAR-LARD', actor: 'CHRIS PRATTLE', woman: false, seed: 29, suit: '#4D5A1E', trim: '#57534E', boots: '#3F2A14', legs: '#1E3A8A', emblem: 'none', mask: 'none', prop: 'blaster', hp: 113, speed: 1.5 },
  { hero: 'GAMMA-RAY', actor: 'ZOE SALAMANDA', woman: true, seed: 37, look: { skin: '#9F7AEA', hair: '#0F172A', long: true }, suit: '#7C2D12', trim: '#F59E0B', boots: '#3F1D0B', emblem: 'none', mask: 'none', prop: 'sword', hp: 131, speed: 1.7 },
  { hero: 'DRAKS THE DEMOLISHER', actor: 'DAVE BOTTISTA', woman: false, seed: 45, look: { skin: '#A07A5A', bald: true, heavy: true }, suit: '#A07A5A', trim: '#0E7490', boots: '#3F2A14', legs: '#1F2937', bare: true, emblem: 'tattoo', mask: 'none', prop: 'knives', hp: 225, speed: 1.0 },
  { hero: 'AUNT-MAN', actor: 'PAUL RUDDER', woman: false, seed: 33, suit: '#CA8A04', trim: '#1F2937', boots: '#1F2937', gloves: '#1F2937', emblem: 'none', mask: 'helmet', prop: 'none', hp: 106, speed: 1.4 },
  { hero: 'CAPTAIN MARVELOUS', actor: 'BREE LARSONG', woman: true, seed: 63, look: { hair: '#F5D27A', long: false }, suit: '#047857', trim: '#F472B6', boots: '#F472B6', emblem: 'star8', mask: 'none', prop: 'hands', hp: 131, speed: 1.3 },
  { hero: 'THE WINTER SOLDER', actor: 'SEBASTIEN STANLEY', woman: false, seed: 58, look: { hair: '#1F1611', long: true }, suit: '#3F4F3A', trim: '#A8A29E', boots: '#27301F', gloves: '#27301F', emblem: 'none', mask: 'domino', prop: 'arm', hp: 150, speed: 1.5 },
  { hero: 'THE FALCONER', actor: 'ANTONY MACKEREL', woman: false, seed: 4, suit: '#A16207', trim: '#1F2937', boots: '#1F2937', emblem: 'none', mask: 'goggles', prop: 'wings', hp: 125, speed: 1.0 },
  { hero: 'SHE-BULK', actor: 'TATIANA MASLANKY', woman: true, seed: 18, look: { skin: '#8E7CA8', hair: '#111827', long: true, heavy: true }, suit: '#F59E0B', trim: '#1F2937', boots: '#F59E0B', emblem: 'none', mask: 'none', prop: 'none', hp: 225, speed: 1.0 },
  { hero: 'MISS MARBLE', actor: 'IMAN VANILLI', woman: true, seed: 48, look: { hair: '#1F1611' }, suit: '#0E7490', trim: '#F472B6', boots: '#F8FAFC', emblem: 'bolt', mask: 'domino', prop: 'fist', hp: 106, speed: 1.6 },
  { hero: 'QUICKSHILL', actor: 'ERIN TAILOR-JOHANSEN', woman: false, seed: 26, look: { hair: '#D6D3D1' }, suit: '#15803D', trim: '#BEF264', boots: '#F8FAFC', emblem: 'bolt', mask: 'none', prop: 'none', hp: 106, speed: 1.9 },
  { hero: 'WOLVERINO', actor: 'HUGH JACKHAMMER', woman: false, seed: 21, look: { hair: '#1F1611' }, suit: '#7C3AED', trim: '#18181B', boots: '#18181B', gloves: '#18181B', emblem: 'none', mask: 'ears', prop: 'claws', hp: 138, speed: 1.6 },
  { hero: 'DEADPAN', actor: 'BRYAN RAYNOLDS', woman: false, seed: 35, suit: '#DB2777', trim: '#1F2937', boots: '#1F2937', gloves: '#1F2937', emblem: 'circle', mask: 'full', prop: 'katanas', hp: 131, speed: 1.8 },
  { hero: 'DRIZZLE', actor: 'HALLE BURRY', woman: true, seed: 46, look: { hair: '#A78BFA', long: true }, suit: '#475569', trim: '#FACC15', boots: '#FACC15', emblem: 'none', cape: '#FACC15', mask: 'none', prop: 'hands', hp: 113, speed: 1.2 },
  { hero: 'NEBULOUS', actor: 'KAREN GILLIGAN', woman: true, seed: 44, look: { skin: '#F472B6', bald: true }, suit: '#1F2937', trim: '#64748B', boots: '#64748B', gloves: '#64748B', emblem: 'none', mask: 'none', prop: 'baton', hp: 138, speed: 1.6 },
  { hero: 'JEAN BEIGE', actor: 'FAMKE JANSEN-SEN', woman: true, seed: 55, look: { hair: '#3F2A14', long: true }, suit: '#D6C29A', trim: '#8B5E34', boots: '#8B5E34', gloves: '#8B5E34', emblem: 'phoenix', mask: 'none', prop: 'hands', hp: 113, speed: 1.2 },
  { hero: 'WONDER WOMANISH', actor: 'GAL GADGET', woman: true, seed: 59, look: { hair: '#1F1611', long: true }, suit: '#86198F', trim: '#E5E7EB', boots: '#86198F', legs: '#334155', emblem: 'W', mask: 'tiara', prop: 'tiara', hp: 131, speed: 1.5 },
  { hero: 'SUPERBMAN', actor: 'HENRY CAVITY', woman: false, seed: 2, look: { hair: '#111827' }, suit: '#E2E8F0', trim: '#16A34A', boots: '#16A34A', emblem: 'S', cape: '#16A34A', mask: 'none', prop: 'hands', hp: 138, speed: 1.3 },
  { hero: 'BATTMAN', actor: 'BEN AFFLECKTION', woman: false, seed: 23, suit: '#1E3A8A', trim: '#CBD5E1', boots: '#0F172A', gloves: '#0F172A', emblem: 'bat', cape: '#0F172A', mask: 'cowl', prop: 'batarang', hp: 131, speed: 1.3 },
  { hero: 'GROAT', actor: 'VIN DEISEL', woman: false, seed: 39, look: { skin: '#D6D3D1', heavy: true, bald: true }, suit: '#E7E5E4', trim: '#CA8A04', boots: '#57534E', emblem: 'bark', mask: 'leaves', prop: 'none', hp: 225, speed: 0.9 },
  { hero: 'SOCKET', actor: 'BRADLEY COOPERSMITH', woman: false, seed: 31, suit: '#C2410C', trim: '#F5F5F4', boots: '#3F3F46', emblem: 'none', mask: 'raccoon', prop: 'gun', hp: 94, speed: 1.5, short: true },
];

/** The engine's health for one (it never runs out: what comes off it each frame is the hit, fight.ts keeps the real). */
export const BIG = 100000;
export const ACTOR_KIND = 'm2:hww_actor' as const;
const castOf = (e: Enemy) => CAST[e.variant ?? 0] ?? CAST[0];

// ---------------------------------------------------------------------------------------------------------------
// How they fight: no moves. At him (quicker the lighter they are), a hop up at him if he's up off the floor over them;
// touching him, they're on him (fight.ts does the latching, the pile and the shaking off).

const can = (state: GameState) => state.player.health > 0 && !holdingOff(state) && !state.player.inCutscene && !state.player.carried;
/** How quick they come (px a frame). */
export const actorSpeed = (i: number) => (CAST[i]?.speed ?? 1.3) * 1.55;

const actorAI = (ctx: FrameContext, e: Enemy) => {
  const { state } = ctx, p = mid(state.player), m = mid(e), dx = p.x - m.x, dy = p.y - m.y;
  tick(e);
  e.leapCd = Math.max(0, (e.leapCd ?? 0) - 1);
  if (e.health <= 0) { e.vel.x = 0; return false; }
  switch (e.aiState) {
    // The hero landing (down on one knee, a fist on the floor: the beat after they come down)
    case 'land':
      e.vel.x = 0;
      if (e.aiTimer > 36) setState(e, 'approach');
      break;
    default:
      setState(e, 'approach');
      break;
    case 'approach': {
      if (!can(state)) { e.vel.x = 0; break; }
      e.facing = (dx < 0 ? -1 : 1) as 1 | -1;
      e.vel.x = Math.abs(dx) > 4 && safeAhead(ctx, e, e.facing) ? e.facing * actorSpeed(e.variant ?? 0) : 0;
      // (he's up off the floor over them: a hop up at him, arms out)
      if ((e.leapCd ?? 0) <= 0 && dy < -46 && Math.abs(dx) < 130) {
        e.vel.y = -10.5; e.vel.x = Math.max(-5, Math.min(5, dx / 18)); e.leapCd = 46;
        playSound('jump', 0.4, 2 + ((e.variant ?? 0) % 5));
      }
      break;
    }
  }
  return false;
};
/** His touching them does nothing (they don't hurt by touching: they jump on him, fight.ts); his moves still land. */
const actorTouch = (ctx: FrameContext, e: Enemy) => {
  const p = ctx.state.player;
  void e;
  return !(p.isCharging || p.isUppercutting || p.isDivekicking || (p.filthShieldTimer ?? 0) > 0);
};

// ---------------------------------------------------------------------------------------------------------------
// How they look

/** Who's in the suit: the person the seed makes, with the suit's own say over them (green paint, bald, heavy). */
const castBody = (a: CastMember, pose: Pose, fr: number): Person => {
  const B = bodyOf(a.seed, pose, fr, a.woman);
  if (a.look) {
    B.L = { ...B.L, ...a.look };
    if (a.look.heavy !== undefined) {
      const h = a.look.heavy, w = B.L.woman;
      B.w = h ? 28 : w ? 20 : 23; B.hipW = h ? 28 : w ? 22 : 20; B.legW = h ? 8.5 : w ? 6.5 : 7.5; B.armW = h ? 7 : w ? 5.5 : 6; B.rx = h ? 9.2 : 8.6;
    }
  }
  return B;
};

const emblem = (g: Ctx, a: CastMember, B: Person) => {
  const x = 1, y = B.shY + 10, t = a.trim;
  switch (a.emblem) {
    case 'star': case 'star8': {
      // (Captain Marvelous's: a six-point burst in her trim, not a star)
      const col = a.emblem === 'star' ? '#F8FAFC' : a.trim, pts = a.emblem === 'star' ? 10 : 12;
      flat(g, () => { for (let k = 0; k < pts; k++) { const r = k % 2 ? 2.2 : 5, an = -Math.PI / 2 + (k * 2 * Math.PI) / pts; g.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } g.closePath(); }, col, 0.8);
      if (a.emblem === 'star') for (let k = 0; k < 3; k++) px(g, -B.w / 2 + 2, B.hipY - 8 + k * 3, B.w - 4, 1.5, k % 2 ? '#F8FAFC' : t);
      break;
    }
    // (Captain Americano's: a coffee bean, its crease; a cream-and-roast band at the waist)
    case 'bean':
      flat(g, () => g.ellipse(x, y, 4, 5.5, 0.35, 0, Math.PI * 2), t, 0.8);
      limb(g, x - 1.4, y - 4, x + 1.4, y + 4, 0.8, a.suit, false);
      for (let k = 0; k < 2; k++) px(g, -B.w / 2 + 2, B.hipY - 7 + k * 3, B.w - 4, 1.5, k ? a.boots : t);
      break;
    // (Black Window's: a window, four panes, the frame in her trim)
    case 'window':
      px(g, x - 5, y - 4, 10, 10, a.trim); px(g, x - 4, y - 3, 3.5, 3.5, '#BAE6FD'); px(g, x + 0.5, y - 3, 3.5, 3.5, '#BAE6FD'); px(g, x - 4, y + 1.5, 3.5, 3.5, '#7DD3FC'); px(g, x + 0.5, y + 1.5, 3.5, 3.5, '#7DD3FC'); px(g, x - 4, y - 3, 1, 1, '#F8FAFC');
      px(g, -B.w / 2 + 2, B.hipY - 4, B.w - 4, 2, t);
      break;
    case 'discs': for (let k = 0; k < 3; k++) ball(g, -6 + k * 6, y - 1, 2.4, t, 0.7); break;
    case 'reactor': ball(g, x, y, 3.6, '#FCD34D', 0.9); px(g, x - 1, y - 1, 2, 2, '#F8FAFC'); px(g, -B.w / 2 + 2, B.hipY - 6, B.w - 4, 3, t); break;
    case 'hourglass': flat(g, () => { g.moveTo(x - 3, y + 2); g.lineTo(x + 3, y + 2); g.lineTo(x - 3, y + 8); g.lineTo(x + 3, y + 8); g.closePath(); }, '#DC2626', 0.6); px(g, -B.w / 2 + 2, B.hipY - 4, B.w - 4, 2, t); break;
    case 'spider': ball(g, x, y, 2.2, '#18181B', 0.4); for (const s of [-1, 1]) for (let k = 0; k < 3; k++) limb(g, x, y, x + s * 6, y - 4 + k * 4, 0.8, '#18181B', false); break;
    case 'amulet': ball(g, x, y - 2, 3.4, '#CBD5E1', 0.9); px(g, x - 1, y - 3, 2, 2, '#DC2626'); break;
    case 'gem': ball(g, x, y - 12, 2, '#22D3EE', 0.6); px(g, -B.w / 2 + 2, y, B.w - 4, 2, t); break;
    case 'tattoo': for (let k = 0; k < 4; k++) limb(g, -8 + k * 5, y - 4, -6 + k * 5, y + 10, 1, t, false); break;
    case 'bolt': flat(g, () => { g.moveTo(x + 2, y - 6); g.lineTo(x - 3, y + 1); g.lineTo(x, y + 1); g.lineTo(x - 2, y + 7); g.lineTo(x + 4, y - 1); g.lineTo(x + 1, y - 1); g.closePath(); }, a.hero === 'QUICKSHILL' ? '#F8FAFC' : a.trim, 0.6); break;
    case 'circle': ball(g, x, y, 4, '#18181B', 0.6); px(g, x - 0.5, y - 4, 1, 8, a.suit); break;
    case 'phoenix': flat(g, () => { g.moveTo(x, y - 5); g.lineTo(x - 6, y + 2); g.lineTo(x, y); g.lineTo(x + 6, y + 2); g.closePath(); }, a.trim, 0.6); px(g, -B.w / 2 + 2, B.hipY - 4, B.w - 4, 3, t); break;
    case 'W': flat(g, () => { g.moveTo(x - 7, y - 3); g.lineTo(x - 3, y + 3); g.lineTo(x, y - 1); g.lineTo(x + 3, y + 3); g.lineTo(x + 7, y - 3); g.lineTo(x + 3, y); g.lineTo(x, y - 4); g.lineTo(x - 3, y); g.closePath(); }, a.trim, 0.6); break;
    // (Superbman's: a round badge in his green, an S-ish squiggle in white)
    case 'S': ball(g, x, y + 1, 5.5, t, 0.8); g.strokeStyle = '#F8FAFC'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + 2.5, y - 2); g.quadraticCurveTo(x - 3, y - 2.5, x - 1, y + 1); g.quadraticCurveTo(x + 3, y + 2, x - 2.5, y + 4); g.stroke(); break;
    case 'bat': flat(g, () => { g.moveTo(x - 8, y - 2); g.lineTo(x - 3, y - 1); g.lineTo(x - 1, y - 4); g.lineTo(x + 1, y - 4); g.lineTo(x + 3, y - 1); g.lineTo(x + 8, y - 2); g.lineTo(x + 5, y + 3); g.lineTo(x, y + 1); g.lineTo(x - 5, y + 3); g.closePath(); }, t, 0.4); px(g, -B.w / 2 + 2, B.hipY - 5, B.w - 4, 3, t); break;
    case 'bark': for (let k = 0; k < 5; k++) px(g, -B.w / 2 + 3 + k * 5, B.shY + 4, 1, B.hipY - B.shY, dk(a.suit, 0.3)); ball(g, 6, B.shY + 4, 3, t, 0.6); break;
    default: break;
  }
};

const mask = (g: Ctx, a: CastMember, B: Person) => {
  const { hx, hy } = B, s = a.suit;
  switch (a.mask) {
    case 'helmetA':
      part(g, () => { g.moveTo(hx - 9.5, hy + 1); g.quadraticCurveTo(hx - 9, hy - 12, hx + 1, hy - 12); g.quadraticCurveTo(hx + 10, hy - 12, hx + 10, hy - 2); g.lineTo(hx + 8, hy - 2); g.lineTo(hx - 7, hy + 3); g.closePath(); }, s, hx - 9.5, hy - 12, 20, 15, 1);
      // (a cream stripe over the crown and a cream handle-loop at the side: a mug's)
      px(g, hx - 1, hy - 12, 3, 7, a.trim);
      g.strokeStyle = a.trim; g.lineWidth = 1.4; g.beginPath(); g.arc(hx - 10, hy - 5, 3, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
      break;
    case 'faceplate':
      part(g, () => g.ellipse(hx, hy - 1, B.rx + 1, B.ry + 1, 0, Math.PI * 0.95, Math.PI * 2.05), s, hx - B.rx - 1, hy - B.ry - 1, B.rx * 2 + 2, B.ry + 2, 1);
      // (the gold faceplate, flipped up on the forehead: his face out from under it)
      part(g, () => g.roundRect(hx - 5, hy - 13, 13, 5, 2), a.trim, hx - 5, hy - 13, 13, 5, 0.8);
      break;
    case 'full':
      part(g, () => g.ellipse(hx, hy, B.rx + 0.5, B.ry + 0.5, 0, 0, Math.PI * 2), s, hx - B.rx, hy - B.ry, B.rx * 2 + 1, B.ry * 2 + 1, 1.2);
      if (a.emblem === 'spider') { g.strokeStyle = dk(s, 0.35); g.lineWidth = 0.6; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(hx + 2, hy); g.lineTo(hx + 2 + k * 5, hy - 9); g.stroke(); } }
      for (const dxx of [-1, 6]) flat(g, () => g.ellipse(hx + dxx, hy - 1, 2.6, 3.2, dxx < 0 ? 0.4 : -0.4, 0, Math.PI * 2), a.emblem === 'circle' ? '#18181B' : a.emblem === 'spider' ? '#A3E635' : '#F8FAFC', 0.9);
      if (a.emblem === 'circle') for (const dxx of [-1, 6]) px(g, hx + dxx - 1, hy - 2, 2, 2, '#F8FAFC');
      break;
    case 'helmet':
      part(g, () => g.ellipse(hx, hy - 1, B.rx + 2, B.ry + 2, 0, 0, Math.PI * 2), '#A1A1AA', hx - B.rx - 2, hy - B.ry - 3, B.rx * 2 + 4, B.ry * 2 + 4, 1.2);
      for (const dxx of [0, 6]) flat(g, () => g.ellipse(hx + dxx, hy - 1, 2.4, 2.8, 0, 0, Math.PI * 2), '#22D3EE', 0.8);
      px(g, hx - 3, hy + 5, 10, 2, '#52525B');
      break;
    case 'cowl': case 'ears':
      part(g, () => { g.moveTo(hx - 10, hy + 3); g.lineTo(hx - 10, hy - 6); g.lineTo(hx - 7, hy - (a.mask === 'ears' ? 18 : 17)); g.lineTo(hx - 4, hy - 10); g.lineTo(hx + 4, hy - 10); g.lineTo(hx + 7, hy - (a.mask === 'ears' ? 18 : 17)); g.lineTo(hx + 10, hy - 6); g.lineTo(hx + 10, hy + 1); g.lineTo(hx + 7, hy + 1); g.lineTo(hx + 7, hy - 3); g.lineTo(hx - 3, hy - 3); g.lineTo(hx - 5, hy + 3); g.closePath(); }, a.mask === 'ears' ? a.trim : a.suit, hx - 10, hy - 18, 20, 21, 1.1);
      if (a.mask === 'ears') px(g, hx - 2, hy - 9, 10, 4, '#18181B');
      break;
    case 'domino': px(g, hx - 3, hy - 3, 12, 3.4, '#18181B'); break;
    case 'goggles': px(g, hx - 3, hy - 3.4, 13, 4, '#0E7490'); px(g, hx + 1, hy - 3, 3, 2, '#67E8F9'); px(g, hx + 6, hy - 3, 3, 2, '#67E8F9'); break;
    case 'tiara': case 'crown':
      flat(g, () => { g.moveTo(hx - 7, hy - 8); g.lineTo(hx + 1, hy - (a.mask === 'crown' ? 18 : 13)); g.lineTo(hx + 9, hy - 8); g.lineTo(hx + 1, hy - 10); g.closePath(); }, a.mask === 'crown' ? a.suit : a.trim, 0.8);
      if (a.mask === 'tiara') ball(g, hx + 1, hy - 10, 1.4, '#22D3EE', 0.4);
      break;
    case 'leaves': for (let k = 0; k < 5; k++) ball(g, hx - 8 + k * 4, hy - 9 - (k % 2) * 3, 3, k % 2 ? '#CA8A04' : '#C2410C', 0.7); break;
    case 'raccoon':
      for (const dxx of [-6, 5]) flat(g, () => { g.moveTo(hx + dxx - 3, hy - 8); g.lineTo(hx + dxx, hy - 15); g.lineTo(hx + dxx + 3, hy - 8); g.closePath(); }, a.suit, 0.8);
      part(g, () => g.ellipse(hx, hy - 3, B.rx + 0.6, B.ry - 3, 0, Math.PI, Math.PI * 2), a.suit, hx - B.rx, hy - B.ry, B.rx * 2, B.ry, 1);
      px(g, hx - 3, hy - 3, 12, 3.4, '#27272A');
      break;
    default: break;
  }
};
/** What they're holding, at the near hand (`up`: wound back; `out`: struck out). */
const prop = (g: Ctx, a: CastMember, x: number, y: number, up: boolean, out: boolean) => {
  const rot = up ? -1.9 : out ? 0.1 : 0.9;
  g.save(); g.translate(x, y); g.rotate(rot);
  switch (a.prop) {
    case 'shield': {
      // (a saucer, not a shield: cream rim, the roast ring, the bean in the middle)
      g.rotate(-rot); ball(g, 6, 0, 10, '#F5DEB3', 1); ball(g, 6, 0, 7.4, '#7C2D12', 0.6); ball(g, 6, 0, 5, '#F5DEB3', 0.5);
      flat(g, () => g.ellipse(6, 0, 2.2, 3, 0.35, 0, Math.PI * 2), '#3F1D0B', 0); limb(g, 5.4, -2, 6.6, 2, 0.6, '#F5DEB3', false);
      px(g, 0, -6, 2, 2, '#FFFFFF');
      break;
    }
    case 'hammer': limb(g, 0, 0, 14, 0, 2.2, '#78350F'); px(g, 2, -1, 10, 1, '#A16207'); part(g, () => g.roundRect(12, -7, 9, 14, 3), '#B45309', 12, -7, 9, 14, 1); px(g, 12, -4, 9, 1.5, '#FACC15'); px(g, 12, 3, 9, 1.5, '#FACC15'); px(g, 14, -6, 2, 2, '#F59E0B'); break;
    case 'bow': g.rotate(-rot - 1.57); g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.arc(0, 0, 14, -1.2, 1.2); g.stroke(); g.strokeStyle = '#365314'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, 0, 14, -1.2, 1.2); g.stroke(); break;
    case 'blaster': case 'gun': part(g, () => g.roundRect(0, -3, 14, 6, 1), a.prop === 'gun' ? '#22D3EE' : '#71717A', 0, -3, 14, 6, 0.9); px(g, 2, 2, 3, 4, '#3F3F46'); break;
    case 'sword': limb(g, 0, 0, 26, 0, 2.4, '#D4D4D8'); px(g, -2, -3, 3, 6, '#78350F'); break;
    case 'knives': limb(g, 0, 0, 14, 0, 2, '#A1A1AA'); break;
    case 'batons': case 'baton': limb(g, -3, 0, 16, 0, 2.4, a.prop === 'batons' ? '#7C3AED' : '#3F3F46'); break;
    case 'claws': for (let k = -1; k <= 1; k++) limb(g, 2, k * 2.4, 16, k * 3, 1, '#E5E7EB', false); break;
    case 'katanas': limb(g, 0, 0, 24, 0, 2, '#D4D4D8'); break;
    case 'fist': ball(g, 4, 0, 7, a.suit, 1); break;
    case 'batarang': flat(g, () => { g.moveTo(0, 0); g.lineTo(8, -4); g.lineTo(5, 0); g.lineTo(8, 4); g.closePath(); }, '#CBD5E1', 0.5); break;
    case 'tiara': if (up || out) flat(g, () => { g.moveTo(0, -3); g.lineTo(5, -8); g.lineTo(10, -3); g.closePath(); }, a.trim, 0.6); break;
    default: break;
  }
  g.restore();
};

/** Behind them (drawn first): what's on their back (a quiver, katana hilts, a tail, a coat's tails). */
const extrasBack = (g: Ctx, a: CastMember, B: Person) => {
  switch (a.hero) {
    case 'HAWKGUY': part(g, () => { g.moveTo(-B.w / 2 + 2, B.shY - 2); g.lineTo(-B.w / 2 + 8, B.shY - 4); g.lineTo(-B.w / 2 + 2, B.hipY - 4); g.lineTo(-B.w / 2 - 4, B.hipY - 2); g.closePath(); }, '#5A3A1A', -B.w / 2 - 4, B.shY - 4, 12, B.hipY - B.shY, 1); for (let k = 0; k < 3; k++) { px(g, -B.w / 2 + 2 + k * 2, B.shY - 10, 1, 7, '#D4D4D8'); px(g, -B.w / 2 + 1 + k * 2, B.shY - 12, 3, 3, '#16A34A'); } break;
    case 'DEADPAN': for (const s of [0, 1]) { limb(g, -4 + s * 6, B.shY + 18, -10 + s * 14, B.shY - 12, 2, '#3A3A44'); px(g, -12 + s * 14, B.shY - 14, 4, 3, '#18181B'); } break;
    case 'SOCKET': part(g, () => { g.moveTo(-B.hipW / 2, B.hipY); g.quadraticCurveTo(-B.hipW / 2 - 18, B.hipY + 4, -B.hipW / 2 - 16, B.hipY - 16); g.quadraticCurveTo(-B.hipW / 2 - 10, B.hipY - 6, -B.hipW / 2 + 2, B.hipY - 6); g.closePath(); }, a.suit, -B.hipW / 2 - 18, B.hipY - 16, 20, 20, 1); for (let k = 0; k < 3; k++) px(g, -B.hipW / 2 - 14 + k * 5, B.hipY - 8 + (k % 2) * 3, 3, 2, '#27272A'); break;
    case 'STAR-LARD': part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 4); g.lineTo(-B.hipW / 2 - 5, -8); g.lineTo(B.hipW / 2 + 3, -8); g.lineTo(B.w / 2 - 1, B.shY + 4); g.closePath(); }, dk(a.suit, 0.2), -B.hipW / 2 - 5, B.shY + 4, B.hipW + 8, -8 - B.shY - 4, 1); break;
    default: break;
  }
};
/** On them (after the torso): the costume's own seams, belts, bracers, a few of the heroes' own touches. */
const extrasFront = (g: Ctx, a: CastMember, B: Person, F: Frame) => {
  const s = a.suit, ownBelt = ['star', 'bean', 'window', 'reactor', 'hourglass', 'gem', 'phoenix', 'bat'].includes(a.emblem);
  if (!a.bare) {
    // (the suit's seams: down the middle, under the chest, the abs in shade; a lit seam across the shoulders)
    px(g, 0, B.shY + 4, 1, B.hipY - B.shY - 6, dk(s, 0.22));
    px(g, -B.w / 2 + 3, B.shY + 2, B.w - 6, 1, lt(s, 0.22));
    if (!B.L.woman) { px(g, -7, B.shY + 15, 6, 1, dk(s, 0.25)); px(g, 2, B.shY + 15, 6, 1, dk(s, 0.25)); for (let y = B.shY + 19; y < B.hipY - 4; y += 4) px(g, -3, y, 6, 1, dk(s, 0.15)); }
    else px(g, -6, B.shY + 13, 12, 1, dk(s, 0.25));
    if (!ownBelt) { px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 3, a.trim); px(g, -B.hipW / 2, B.hipY - 3, B.hipW, 1, lt(a.trim, 0.3)); px(g, -2, B.hipY - 3, 4, 3, '#E8C25A'); }
  }
  switch (a.hero) {
    case 'SPIDER-TEEN': { g.strokeStyle = dk(s, 0.4); g.lineWidth = 0.6; g.beginPath(); for (let k = -2; k <= 2; k++) { g.moveTo(0, B.shY + 10); g.lineTo(k * 6, B.hipY); } for (let y = B.shY + 14; y < B.hipY; y += 6) { g.moveTo(-B.w / 2 + 2, y); g.quadraticCurveTo(0, y + 2, B.w / 2 - 2, y); } g.stroke(); break; }
    case 'BATTMAN': for (let k = 0; k < 4; k++) part(g, () => g.rect(-B.hipW / 2 + 1 + k * 6, B.hipY - 6, 4, 5), '#94A3B8', -B.hipW / 2 + 1 + k * 6, B.hipY - 6, 4, 5, 0.6); break;
    case 'WONDER WOMANISH': part(g, () => g.ellipse(B.hipW / 2 - 2, B.hipY + 2, 4, 3, 0, 0, Math.PI * 2), '#E8C25A', B.hipW / 2 - 6, B.hipY - 1, 8, 6, 0.8); break;
    case 'NEBULOUS': px(g, B.hx - 6, B.hy - 9, 7, 3, '#8A8A94'); px(g, B.hx - 6, B.hy - 9, 7, 1, '#C8C8D0'); break;
    case 'THE WINTER SOLDER': break;
    case 'JEAN BEIGE': case 'CAPTAIN MARVELOUS': part(g, () => { g.moveTo(-B.w / 2 + 2, B.shY + 2); g.lineTo(-B.w / 2 + 6, B.shY + 2); g.lineTo(B.hipW / 2, B.hipY - 2); g.lineTo(B.hipW / 2 - 4, B.hipY); g.closePath(); }, a.trim, -B.w / 2 + 2, B.shY + 2, B.w, B.hipY - B.shY, 0.6); break;
    case 'GROAT': for (let k = 0; k < 6; k++) px(g, -B.w / 2 + 2 + ((k * 7) % (B.w - 4)), B.shY + 6 + ((k * 11) % 20), 3, 1, '#44403C'); break;
    case 'GAMMA-RAY': for (const [dx, dy] of [[-3, -4], [-4, 0], [-3, 4]] as const) px(g, B.hx + dx, B.hy + dy, 1, 1, '#FACC15'); break;
    case 'DOCTOR STRANGLE': if (a.cape) part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.w / 2 - 2, B.shY - 10); g.lineTo(-B.w / 2 + 6, B.shY - 2); g.closePath(); }, a.cape, -B.w / 2 - 2, B.shY - 10, 8, 12, 0.8); break;
    case 'STAR-LARD': px(g, -B.hipW / 2 + 2, B.hipY - 8, 6, 5, '#1C1C24'); px(g, -B.hipW / 2 + 3, B.hipY - 7, 4, 1, '#F97316'); break;
    default: break;
  }
  void F;
};
/** Hands in gloves: a cuff at the wrist (the glove's own, stepped). */
const cuff = (g: Ctx, A: { ex: number; ey: number }, hx: number, hy: number, col: string, w: number) => {
  const wx = hx + (A.ex - hx) * 0.28, wy = hy + (A.ey - hy) * 0.28;
  ball(g, wx, wy, w * 0.62, col, 0.8);
  px(g, wx - 1, wy - 1, 1, 1, lt(col, 0.35));
};

/** One of them, painted (feet at the origin, facing right). `v`: 'land' a hero landing, 'flop' diving at him (the hop
 *  up at him), 'dead' a body (limp). */
const paintActor = (g: Ctx, a: CastMember, F: Frame, headless = false) => {
  const B = castBody(a, F.pose, F.fr), L = B.L;
  if (a.short) g.scale(1, 0.78);
  const land = F.v === 'land', flop = F.v === 'flop';
  // (the hero landing: down low, squashed into it)
  if (land) g.scale(1.08, 0.8);
  if (flop) { g.translate(0, -30); g.rotate(1.2); g.translate(0, 30); }
  const arms = a.bare ? L.skin : a.suit, hand = a.gloves ?? L.skin;
  // (behind: the cape (its lining, a fold down it), the cardboard wings, what's on their back)
  if (a.cape) {
    const fl = F.pose === 'walk' ? (F.fr % 3) * 2 : land ? 6 : 0, lift = land ? 8 : 0;
    const capePath = () => { g.moveTo(-B.w / 2 + 3, B.shY + 1); g.lineTo(-B.w / 2 - 8 - fl, -4 - lift); g.lineTo(B.w / 2 - 10, -2 - lift); g.lineTo(B.w / 2 - 4, B.shY + 1); g.closePath(); };
    part(g, capePath, a.cape, -B.w / 2 - 8 - fl, B.shY, B.w + fl + 4, -B.shY, 1);
    part(g, () => { g.moveTo(-B.w / 2 - 6 - fl, -4 - lift); g.lineTo(-B.w / 2 - 3 - fl * 0.6, -14 - lift); g.lineTo(B.w / 2 - 12, -10 - lift); g.lineTo(B.w / 2 - 10, -2 - lift); g.closePath(); }, dk(a.cape, 0.35), -B.w / 2 - 6 - fl, -14 - lift, B.w + fl, 12, 0.8);
    px(g, -B.w / 2 - 2 - fl * 0.5, B.shY + 10, 1, -B.shY - 18, dk(a.cape, 0.25));
  }
  if (a.prop === 'wings') for (const s of [0, 1]) { part(g, () => { g.moveTo(-4, B.shY + 4); g.lineTo(-30 - s * 8, B.shY - 14 + s * 12); g.lineTo(-24 - s * 6, B.shY + 18); g.closePath(); }, s ? '#A8A29E' : '#D6D3D1', -38, B.shY - 14, 34, 34, 1); for (let k = 1; k < 4; k++) px(g, -8 - k * 6 - s * 2, B.shY - 2 + k * 4 + s * 4, 5, 1, '#8A8480'); }
  extrasBack(g, a, B);
  legs(g, B, { col: a.legs ?? a.suit, shoe: a.bare ? 'shoe' : 'boot', shoeCol: a.boots, detail: (gg, _h, k, ft, near) => { if (a.bare || a.boots === (a.legs ?? a.suit)) return; const bx = k[0] + (ft[0] - k[0]) * 0.45, by = k[1] + (ft[1] - k[1]) * 0.45; px(gg, bx - B.legW / 2, by, B.legW, (ft[1] - by) - 4, near ? a.boots : dk(a.boots, 0.14)); px(gg, bx - B.legW / 2, by, B.legW, 1, lt(a.boots, 0.3)); } });
  const fl = flailHands(B, F.fr);
  const reach = F.pose === 'tell';
  const far: [number, number] = fl ? fl[0] : flop ? [B.w / 2 + 8, B.shY - 16] : land ? [B.w / 2 + 2, -6] : reach ? [B.w / 2 + 12, B.shY + 2] : [-B.w / 2 - 2, -30];
  const near: [number, number] = fl ? fl[1] : flop ? [B.w / 2 + 12, B.shY - 12] : land ? [-B.w / 2 - 10, B.shY - 8] : reach ? [B.w / 2 + 14, B.shY + 8] : [B.w / 2 + 3, -32];
  const metal = a.prop === 'arm';
  const A1 = arm(g, B, -1, far[0], far[1], { sleeve: metal ? '#A1A1AA' : arms, hand: metal ? '#A1A1AA' : hand });
  if (metal) { px(g, A1.ex - 2, A1.ey - 1, 4, 1, '#E4E4E7'); px(g, (A1.sx + A1.ex) / 2 - 1, (A1.sy + A1.ey) / 2 - 1, 3, 3, '#F59E0B'); }
  if (a.gloves && !metal) cuff(g, A1, far[0], far[1], a.gloves, B.armW);
  torso(g, B, a.bare ? L.skin : a.suit);
  if (a.bare) {
    // (the torn pants' waist, ragged; the big ones' pecs and abs in shade)
    px(g, -B.hipW / 2 - 1, B.hipY - 3, B.hipW + 2, 5, a.legs ?? a.trim);
    for (let k = -B.hipW / 2; k < B.hipW / 2; k += 4) px(g, k, B.hipY + 2, 2, 2, dk(a.legs ?? a.trim, 0.2));
    px(g, -6, B.shY + 8, 5, 1, dk(L.skin, 0.2)); px(g, 2, B.shY + 8, 5, 1, dk(L.skin, 0.2));
    for (let y = B.shY + 13; y < B.hipY - 4; y += 4) { px(g, -4, y, 3, 1, dk(L.skin, 0.14)); px(g, 2, y, 3, 1, dk(L.skin, 0.14)); }
  }
  extrasFront(g, a, B, F);
  emblem(g, a, B);
  if (headless) { stump(g, a, B); arm(g, B, 1, near[0], near[1], { sleeve: arms, hand }); return; }
  const covered = a.mask === 'full' || a.mask === 'helmet';
  if (!covered && a.mask !== 'cowl' && a.mask !== 'raccoon') hairBack(g, B);
  headShape(g, B, a.mask === 'full' ? a.suit : L.skin);
  if (!covered) {
    faceOn(g, B, { skin: L.skin, eyes: reach || flop ? 'angry' : 'open', mouth: reach || flop ? 'teeth' : 'smirk', md: F.md, blink: F.blink });
    whiskers(g, B);
  }
  if (!covered && a.mask !== 'cowl' && a.mask !== 'ears' && a.mask !== 'raccoon' && a.mask !== 'helmetA' && a.mask !== 'faceplate') hairTop(g, B);
  if (a.mask === 'faceplate' || a.mask === 'helmetA') hairTop(g, B, B.L.hair);
  mask(g, a, B);
  // (a few heads' own touches: Superbman's curl, Wolverino's tufts out of the cowl, Quickshill's silver streak)
  if (a.hero === 'SUPERBMAN') px(g, B.hx + 3, B.hy - 9, 2, 3, B.L.hair);
  if (a.hero === 'WOLVERINO') for (const s of [-1, 1]) px(g, B.hx + s * 9 - 1, B.hy - 2, 2, 6, B.L.hair);
  if (a.hero === 'QUICKSHILL') px(g, B.hx - 4, B.hy - 11, 6, 2, '#F4F4F6');
  const A2 = arm(g, B, 1, near[0], near[1], { sleeve: arms, hand });
  if (a.gloves) cuff(g, A2, near[0], near[1], a.gloves, B.armW);
  if (a.hero === 'WONDER WOMANISH' || a.hero === 'BLACK WINDOW') { const wx = near[0] + (A2.ex - near[0]) * 0.3, wy = near[1] + (A2.ey - near[1]) * 0.3; ball(g, wx, wy, B.armW * 0.6, a.hero === 'BLACK WINDOW' ? '#A78BFA' : '#D4D4D8', 0.8); }
  if (!fl) prop(g, a, near[0], near[1], false, reach);
};

const BOX: [number, number, number, number] = [-70, -130, 150, 140];
/** Its pose and look this frame: walking at him, reaching for him close, the hero landing, the hop at him. */
const actorFrame = (e: Enemy, f: number, state: GameState) => {
  const st = e.aiState ?? '', r = reaction(e), p = state.player;
  const close = Math.abs(p.pos.x + p.width / 2 - (e.pos.x + e.width / 2)) < 90;
  const pose: Pose = close ? 'tell' : Math.abs(e.vel.x) > 0.3 ? 'walk' : 'stand';
  const v = st === 'land' ? 'land' : e.vel.y < -1 ? 'flop' : '';
  const a = castOf(e);
  return frameOf(a.seed, f, r?.pose ?? pose, r?.md ?? moodOf(e), 0, a.woman, v);
};
const drawActor = (c: Ctx, e: Enemy, f: number, state: GameState) => {
  // (dead: the body's fight.ts's to draw, where they fell)
  if (e.health <= 0) return;
  const a = castOf(e), F = actorFrame(e, f, state);
  putFrame(c, `hww-actor2-${e.variant ?? 0}`, F, BOX, g => paintActor(g, a, F));
};
/** One of them on the way in (not an enemy yet: falling, on a wire), feet at (x, y), world. */
export const drawArriving = (c: Ctx, i: number, x: number, y: number, f: number, falling: boolean, dir: 1 | -1) => {
  const a = CAST[i], F = frameOf(a.seed, f, falling ? 'thrown' : 'stand', 'ok', 0, a.woman, '');
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(dir, 1);
  putFrame(c, `hww-actor2-${i}`, F, BOX, g => paintActor(g, a, F));
  c.restore();
};
/** One of them on him (the dogpile), world: their feet at (x, y), facing `dir`, turned `rot` (about their feet),
 *  scrambling (arms and legs going). */
export const drawClinger = (c: Ctx, i: number, x: number, y: number, rot: number, dir: 1 | -1, f: number) => {
  const a = CAST[i], F = frameOf(a.seed, f + i * 3, 'thrown', 'ok', 0, a.woman, '');
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(dir, 1); c.rotate(rot);
  putFrame(c, `hww-actor2-${i}`, F, BOX, g => paintActor(g, a, F));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The bodies: they fall over where they stood and stay (bloodied, never gibbed). A few stamps each: going over, and down.

const BODY_BOX: [number, number, number, number] = [-110, -130, 220, 150];
/** Down: on their back, face up, the head off behind them; blood on them; what they had in their hands beside them. */
/** Where the head was (the flintlock's): the neck, cut off short, the meat and the bone in it, and blood out of it. */
const stump = (g: Ctx, a: CastMember, B: Person) => {
  const nx = B.hx, ny = B.hy + B.ry - 3, skin = B.L.skin;
  px(g, nx - 4, ny - 1, 8, Math.max(3, B.shY - ny + 2), a.mask === 'full' ? a.suit : skin);
  flat(g, () => g.ellipse(nx, ny - 1, 5, 2.5, 0, 0, Math.PI * 2), '#B91C1C', 1);
  flat(g, () => g.ellipse(nx, ny - 1, 3, 1.5, 0, 0, Math.PI * 2), '#7F1D1D', 0);
  px(g, nx - 1, ny - 2, 2, 2, '#F5F5F4');
  // (it's still coming out of him)
  px(g, nx - 2, ny - 7, 2, 5, '#B91C1C'); px(g, nx + 1, ny - 10, 2, 3, '#DC2626'); px(g, nx + 3, ny - 5, 2, 2, '#991B1B');
  px(g, nx - 5, ny + 1, 2, 6, '#991B1B');
};
const paintBody = (g: Ctx, a: CastMember, step: number, headless = false) => {
  const k = step / 3, F = frameOf(a.seed, 0, 'limp', 'dead', 0, a.woman, 'dead');
  g.save();
  g.translate(0, -15 * k);
  g.rotate(-k * Math.PI / 2);
  paintActor(g, a, F, headless);
  if (step > 0 && !headless) {
    // (blood: the chest, the head)
    const B = castBody(a, 'limp', 0);
    flat(g, () => g.ellipse(2, B.shY + 12, 6, 4, 0.3, 0, Math.PI * 2), '#991B1B', 0);
    flat(g, () => g.ellipse(-3, B.shY + 18, 3, 5, 0, 0, Math.PI * 2), '#7F1D1D', 0);
    flat(g, () => g.ellipse(B.hx + 3, B.hy - 4, 4, 3, 0, 0, Math.PI * 2), '#B91C1C', 0);
    px(g, B.hx + 5, B.hy + 2, 2, 7, '#991B1B');
  }
  g.restore();
  // (down: whatever was in their hands, dropped by them)
  if (step === 3 && a.prop !== 'none' && a.prop !== 'hands' && a.prop !== 'wings' && a.prop !== 'arm') prop(g, a, 26, -4, false, true);
};
/** A body, world: its pool first (it spreads), then them, gone over as far as they've gone. */
export const drawBody = (c: Ctx, i: number, x: number, y: number, dir: 1 | -1, fall: number, pool: number, headless = false) => {
  if (pool > 0) {
    // (the pool: stepped, dark at its edge, a wet glint on it)
    c.fillStyle = '#3A0606'; c.beginPath(); c.ellipse(x - dir * 18, y - 1, 11 + pool * 35, 3.5 + pool * 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#6A0E0E'; c.beginPath(); c.ellipse(x - dir * 18, y - 1, 10 + pool * 33, 3 + pool * 3.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#991B1B'; c.beginPath(); c.ellipse(x - dir * 24, y - 2, 6 + pool * 18, 2 + pool * 2, 0, 0, Math.PI * 2); c.fill();
    if (pool > 0.3) { c.fillStyle = '#D85A4A'; c.fillRect(Math.round(x - dir * 30 - 3), Math.round(y - 3), Math.round(3 + pool * 6), 1); }
  }
  const step = Math.min(3, Math.floor(fall * 3.999));
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(dir, 1);
  stamp(c, `hww-body2-${i}-${step}${headless ? 'h' : ''}`, BODY_BOX[0], BODY_BOX[1], BODY_BOX[2], BODY_BOX[3], g => paintBody(g, CAST[i], step, headless));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------

registerM2Kind({
  kind: ACTOR_KIND,
  // (heavy to shove: a charge or a shot barely moves one)
  stats: { w: 36, h: 74, hp: BIG, contact: 0, mass: 560 },
  ai: actorAI,
  // (his grab gets one: the rest still pile on him while he's at it)
  // (people in costumes, not real bosses: the special weapons' specials work on them, at about half; weapons/half.ts)
  humanoid: true, grab: 'body', midBoss: true, specialsHalf: true, touch: actorTouch,
  gender: e => (castOf(e).woman ? 'f' : 'm'),
  head: { x: 1, y: -68, r: 10 },
  draw: (c, e, f, s) => drawActor(c, e, f, s),
});
