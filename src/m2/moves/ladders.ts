// Ladders: Meathead 2's, any stage's (Spooky Land's new move). Worked like a climbing vine (adventure/jungle/vines.ts),
// with its own rules:
//
//   Mega Man's ladders. Up, overlapping one (stood at its foot, or in the air across it): he takes hold, snapped to
//   its middle. Up/down climbs it at a steady pace (his hands and feet on the rungs; stopped, he holds the frame he's
//   on). Climbing up past the top of one that comes up to a ledge (`ledge`, or a floor whose top is level with the
//   ladder's top, found) he climbs over onto it (a few frames, crouched over the lip) and stands at the ladder; stood
//   at the top, down takes him back over onto it the same way. Down at the foot of it steps off. Jump lets go:
//   straight down, or with left/right held, a little hop off that way. Climbing, he's seen from behind; shooting,
//   he turns out side-on (and stays so a moment after the last shot).
//
//   He can shoot from one: whatever fires from a vine fires from a ladder (he's hanging there one-handed, as far as the
//   weapons know: p.vine, mode 'hang'), left/right turning him to shoot either way. Holding fire, he stops climbing
//   and up/down go to the weapon instead (aim, for the ones that aim: the flamethrower).
//
//   No shoulder charge on a ladder (charge alone, or with left/right): his shoulder bounces off it, the ladder
//   rattles, no power spent. Charge + up: the rush up it, rung over rung, hitting whatever's in the way like an
//   uppercut; charge + down: the slide down the rails, hitting like a dive kick (a power cell each, as on a vine). The
//   rush stops at the top (still holding up after it doesn't take him off onto the ledge: let go of up and press it
//   again); the slide stops at the foot, and puts him down on the ground there if there is any. No slide, uppercut or
//   dive kick of the ordinary kind on one (jump off it, then dive kick: that works).
//
//   Hurt on one, he's knocked off it. Nothing else treats a ladder as anything: enemies walk past them (they're not
//   blocks).
//
// Using it, from a section (or any stage layout):
//
//   import { updateLadders, drawLadders, onLadder, type LadderDef } from '<..>/moves/ladders';
//   const LADDERS: LadderDef[] = [
//     // its middle; the top of its rails (put it level with the ledge it goes up to); its foot (the ground)
//     { x: 1200, top: 350, bottom: 550, ledge: { x: 1240, y: 350 } },   // stood at (x, y) when he climbs off the top
//   ];
//   update: (ctx, controls) => { const out = updateLadders(ctx, LADDERS, controls); ...; return out; }
//            (first thing, before anything else reads the controls: it takes what he does on one for itself)
//   drawBack: (c, state) => { ...the room...; drawLadders(c, state, LADDERS); }   (behind him and the enemies)
//   cameraRow / anything that cares: onLadder(state)
//
//   Put ladders clear of doors and anything else up is pressed for (up by a ladder takes hold of it). A ledge at the
//   top should be a one-way ledge (section.ts's ledge()) or ground that stops short of the ladder: a solid floor over
//   it stops him climbing (he can't go through it). One array per section: the hold's on a ladder in the array it was
//   taken in (one section's array, then another's, never confuses them).

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import type { Rect } from '../../m1/types';
import { PLAYER_MOVE_SPEED } from '../../m1/constants';
import { rectsOverlap } from '../../m1/game/core/utils';
import { playSound } from '../../m1/game/platform/audio';
import { stamp } from '../../m1/game/render/stamp';

export interface LadderDef {
  /** Its middle (world). */
  x: number;
  /** The top of its rails, and its foot (world y: put the foot on the ground, the top level with any ledge it meets). */
  top: number; bottom: number;
  /** Where he's stood (feet) when he climbs off the top of it. Left out: the top of whatever floor's there, if any. */
  ledge?: { x: number; y: number };
}

/** The rungs' spacing (from the foot up). */
export const RUNG = 14;
/** Half its width (the rails' middles). */
const HALF = 14;
/** Climbing: the pace (on average, px a frame), the rush up, the slide down. */
const CLIMB = 2.2, RUSH = 9, SLIDE = 11;
/** How near its middle his has to be to take hold of it (on its foot or in the air; stood at its top). */
const REACH = 24, REACH_TOP = 24;
/** Stood at the top: how long down's held before he takes hold (not every duck). */
const DOWN_HOLD = 3;
/** Climbing over the top onto the ledge (or back over it onto the ladder): frames. */
const MOUNT = 10;
/** His feet's highest on it: hands at the top rung (and with a ledge there, as high as they go before he's up on it). */
const TOP_FEET = 74, OFF_FEET = 56;

interface Hold {
  defs: LadderDef[] | null;
  /** Which one (-1: none), and how far his feet are up it from its foot. */
  on: number; up: number;
  /** Rushing up it (-1) or sliding down it (1), and holding the way it went after (no going off the end on it). */
  zip: 0 | 1 | -1; held: 0 | 1 | -1;
  last: number; cd: number;
  jumpLatch: boolean; specialLatch: boolean; downLatch: boolean; downT: number;
  hurtWas: number;
  /** The one that's rattling (a shoulder off it), and how long for. */
  rattle: number; rattleOn: number;
  /** Turned out side-on to shoot: till this runs out after the last shot (otherwise he's on it from behind). */
  shotT: number;
  /** Climbing over the top: up onto the ledge (1) or down off it onto the ladder (-1), frames into it. */
  mount: { dir: 1 | -1; t: number } | null;
}

const holds = new WeakMap<GameState, Hold>();
const holdOf = (state: GameState): Hold => {
  let h = holds.get(state);
  if (!h) { h = { defs: null, on: -1, up: 0, zip: 0, held: 0, last: -1, cd: 0, jumpLatch: false, specialLatch: false, downLatch: false, downT: 0, hurtWas: 0, rattle: 0, rattleOn: -1, shotT: 0, mount: null }; holds.set(state, h); }
  return h;
};

export const onLadder = (state: GameState) => holdOf(state).on >= 0;

const feetMin = (d: LadderDef, top: { x: number; y: number } | undefined) => d.top + (top ? OFF_FEET : TOP_FEET);
const box = (state: GameState, x: number, feet: number): Rect => { const p = state.player; return { x: x - p.width / 2, y: feet - p.height, w: p.width, h: p.height }; };
const blocked = (state: GameState, r: Rect) => state.blocks.some(b => b.type !== 'pit' && !b.oneWay && rectsOverlap(r, b));
/** Something to stand on right at y, under x (the ledge at its top found, or the ground at its foot). */
const floorAt = (state: GameState, x: number, y: number, slack = 6) => state.blocks.find(b => b.type !== 'pit' && Math.abs(b.y - y) <= slack && x >= b.x - 4 && x <= b.x + b.w + 4);
/** Where he's put when he climbs off the top: its ledge, or the floor at its top (nudged in onto it, clear). */
const topOf = (state: GameState, d: LadderDef): { x: number; y: number } | undefined => {
  if (d.ledge) return d.ledge;
  const w = state.player.width;
  for (const b of state.blocks) {
    if (b.type === 'pit' || Math.abs(b.y - d.top) > 6 || d.x < b.x - HALF - 30 || d.x > b.x + b.w + HALF + 30) continue;
    const x = Math.max(b.x + w / 2 + 4, Math.min(b.x + b.w - w / 2 - 4, d.x));
    if (!blocked(state, box(state, x, b.y - 1))) return { x, y: b.y };
  }
  return undefined;
};

/** Where he's stood on top: right at the ladder, if there's floor there (otherwise its ledge point). */
const standAt = (state: GameState, d: LadderDef, top: { x: number; y: number }) => ({ x: floorAt(state, d.x, top.y, 2) ? d.x : top.x, y: top.y });

const place = (state: GameState, d: LadderDef, up: number) => {
  const p = state.player;
  p.pos.x = d.x - p.width / 2; p.pos.y = d.bottom - up - p.height;
};

const grab = (state: GameState, h: Hold, defs: LadderDef[], i: number, up: number, c: Controls) => {
  const p = state.player, d = defs[i];
  h.defs = defs; h.on = i; h.zip = 0; h.held = 0;
  h.up = Math.max(0, Math.min(d.bottom - feetMin(d, topOf(state, d)), up));
  p.carried = true;
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.isDucking = false;
  p.recoiling = false; p.lockTimer = 0; p.jumpHoldTimer = 0; p.powerLocked = false;
  p.vel.x = 0; p.vel.y = 0;
  h.jumpLatch = !!c.jump; h.specialLatch = !!(c.special || c.charge);
  h.hurtWas = p.hurtTimer ?? 0;
  place(state, d, h.up);
  h.shotT = 0;
  pose(state, h, 'rest');
};

/** Off it: `hop` a jump off (that way, if one's held), otherwise dropped off; `knocked` (hurt, dead): left to whatever did it. */
const letGo = (state: GameState, h: Hold, c: Controls, hop: boolean, knocked = false) => {
  const p = state.player, dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
  p.carried = false; p.vine = undefined; p.ladder = undefined;
  if (h.zip) { p.isUppercutting = false; p.isDivekicking = false; }
  h.last = h.on; h.on = -1; h.zip = 0; h.held = 0; h.cd = 24; h.mount = null;
  if (knocked) return;
  p.vel.x = hop ? dir * PLAYER_MOVE_SPEED : 0;
  p.vel.y = hop && dir ? -6 : 0;
  h.jumpLatch = !!c.jump;
};

const pose = (state: GameState, h: Hold, mode: 'rest' | 'hang' | 'climb' | 'rush' | 'slide' | 'mount', k = 0) => {
  const p = state.player;
  p.vine = { mode: 'hang', th: 0, om: 0 };
  const d = h.defs![h.on], ledge = !!(d.ledge || topOf(state, d));
  const feet = p.pos.y + p.height;
  p.ladder = { mode, k, up: h.up, rung: RUNG, lip: feet - d.top, reach: feet - (d.top - (ledge ? 12 : 6)), shove: h.rattle > 0 && h.rattleOn === h.on ? h.rattle / 14 : 0 };
};

/** Nothing but the trigger (and the weapon switch) passed on. */
const hands = (c: Controls): Controls => ({ ...c, left: false, right: false, up: false, down: false, jump: false, special: false, charge: false });

/** Him and the ladders: taking hold of one, on one, off one. Call it first in the section's update; returns what's left of the controls. */
export const updateLadders = (ctx: FrameContext, defs: LadderDef[], c: Controls): Controls => {
  const { state } = ctx, p = state.player, h = holdOf(state);
  // (mid air grab: he flies on past them)
  if (p.airGrab && !p.ladder) return c;
  if (h.cd > 0) h.cd--;
  if (h.rattle > 0) h.rattle--;
  if (h.jumpLatch && !c.jump) h.jumpLatch = false;
  if (h.specialLatch && !(c.special || c.charge)) h.specialLatch = false;
  if (!c.down) h.downLatch = false;
  // (on one of another section's ladders: theirs to see to)
  if (h.on >= 0 && h.defs !== defs) return c;
  const jumpIn = !!c.jump && !h.jumpLatch, specialIn = !!(c.special || c.charge) && !h.specialLatch;
  const dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);

  // ---- Dead, hurt, or something he's doing takes him off it
  if (h.on >= 0 && (p.health <= 0 || state.deathTimer > 0)) { letGo(state, h, c, false, true); return c; }
  if (h.on >= 0 && (p.hurtTimer ?? 0) > h.hurtWas) { letGo(state, h, c, false, true); return { ...c, jump: false, special: false, charge: false }; }
  if (h.on >= 0 && p.dropVine) { p.dropVine = false; letGo(state, h, c, false); return hands(c); }

  // ---- Climbing over the top: up onto the ledge, or down off it onto the ladder (nothing else meanwhile)
  if (h.on >= 0 && h.mount) {
    const d = defs[h.on], top = topOf(state, d), m = h.mount;
    if (!top) { h.mount = null; return hands(c); }
    const to = standAt(state, d, top), hi = d.bottom - feetMin(d, top);
    m.t++;
    const u = Math.min(1, m.t / MOUNT), k = m.dir > 0 ? u : 1 - u, e = k * k * (3 - 2 * k);
    // (his feet from the top of the ladder to the top of the ledge, at the ladder; or back)
    const feet = (d.bottom - hi) + (to.y - (d.bottom - hi)) * e, x = d.x + (to.x - d.x) * e;
    p.pos.x = x - p.width / 2; p.pos.y = feet - p.height; p.vel.x = 0; p.vel.y = 0; p.isGrounded = false;
    if (u >= 1) {
      if (m.dir > 0) {
        letGo(state, h, c, false, true);
        p.pos.x = to.x - p.width / 2; p.pos.y = to.y - p.height; p.isGrounded = true;
        h.jumpLatch = !!c.jump; h.specialLatch = !!(c.special || c.charge); h.downLatch = !!c.down; h.downT = 0;
        return hands(c);
      }
      h.mount = null; h.up = hi; place(state, d, hi);
      pose(state, h, 'rest');
      h.hurtWas = p.hurtTimer ?? 0;
      return hands(c);
    }
    pose(state, h, 'mount', k);
    h.hurtWas = p.hurtTimer ?? 0;
    return hands(c);
  }

  // ---- Not on one: taking hold of one
  if (h.on < 0) {
    const out: Controls = { ...c, jump: c.jump && !h.jumpLatch };
    if (p.health <= 0 || p.carried || p.inCutscene || p.swimming || p.isCharging || p.isSliding || p.isUppercutting || p.isDivekicking || (p.pushbackTimer ?? 0) > 0) { h.downT = 0; return out; }
    const cx = p.pos.x + p.width / 2, feet = p.pos.y + p.height;
    h.downT = c.down && !h.downLatch && !dir && p.isGrounded ? h.downT + 1 : 0;
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i];
      if (i === h.last && h.cd > 0) continue;
      const top = topOf(state, d), dx = Math.abs(cx - d.x);
      // Up, across it (on its foot, or in the air by it)
      if (c.up && dx < REACH && feet > feetMin(d, top) - 30 && feet <= d.bottom + 2) {
        grab(state, h, defs, i, d.bottom - Math.min(d.bottom - 2, feet), c);
        return hands(c);
      }
      // Stood at its top, down held a moment: back down it
      if (top && h.downT >= DOWN_HOLD && (dx < REACH_TOP || Math.abs(cx - top.x) < 14) && p.isGrounded && Math.abs(feet - top.y) < 6) {
        const up = d.bottom - feetMin(d, top);
        if (blocked(state, box(state, d.x, d.bottom - up))) continue;
        // (back over the top onto it: the climb over, the other way, from where he's stood)
        const sx = cx, sy = feet;
        grab(state, h, defs, i, up, c); h.downLatch = true; h.mount = { dir: -1, t: 0 };
        p.pos.x = sx - p.width / 2; p.pos.y = sy - p.height; pose(state, h, 'mount', 1);
        return hands(c);
      }
    }
    return out;
  }

  // ---- On one
  const d = defs[h.on], top = topOf(state, d), hi = d.bottom - feetMin(d, top);
  p.powerLocked = false;
  if (dir) p.facing = dir as 1 | -1;
  // Jump: off it
  if (jumpIn) { letGo(state, h, c, true); return hands(c); }
  // Charge: up (the rush) or down (the slide), a power cell; on its own or sideways, his shoulder off it
  if (specialIn && h.zip === 0) {
    h.specialLatch = true;
    const can = ctx.cheats.infinitePower || p.power >= 1;
    if (c.up !== c.down && can) {
      h.zip = c.down ? 1 : -1;
      if (!ctx.cheats.infinitePower) p.power -= 1;
      p.moveId = (p.moveId || 0) + 1; p.uppercutHitIds = []; p.diveKickHitIds = [];
      playSound('whoosh', 1, h.zip < 0 ? 3 : -4);
    } else if (c.up === c.down) {
      h.rattle = 14; h.rattleOn = h.on;
      playSound('clang', 0.5, -6);
    }
  }
  // (the way a rush or slide went, still held after it: that end's the end, till it's let go)
  if (h.held === -1 && !c.up) h.held = 0;
  if (h.held === 1 && !c.down) h.held = 0;
  // Holding fire: stopped to shoot (up/down aim the weapon, for the ones that aim)
  const firing = !!(c.shoot || c.secondary);
  if (firing || h.rattle > 0) h.shotT = 24; else if (h.shotT > 0) h.shotT--;
  const up0 = h.up;
  if (h.zip === -1) h.up += RUSH;
  else if (h.zip === 1) h.up -= SLIDE;
  else if (!firing && c.up !== c.down) {
    // (steady, like Mega Man's)
    h.up += (c.up ? 1 : -1) * CLIMB;
  }
  // Up past the top: onto the ledge (not off the end of a rush, or the up still held after one)
  if (h.up >= hi) {
    h.up = hi;
    if (top && c.up && !firing && h.zip === 0 && h.held === 0) {
      // (over the top, onto the ledge: the climb over)
      h.mount = { dir: 1, t: 0 };
      place(state, d, hi); p.vel.x = 0; p.vel.y = 0; p.isGrounded = false;
      pose(state, h, 'mount', 0);
      h.hurtWas = p.hurtTimer ?? 0;
      return hands(c);
    }
    if (h.zip === -1) { h.zip = 0; h.held = -1; }
  }
  // Down at the foot: off it (the end of a slide puts him down on the ground there, if there's any)
  if (h.up <= 0) {
    h.up = 0;
    const ground = !!floorAt(state, d.x, d.bottom);
    if ((h.zip === 1 && ground) || (h.zip === 0 && h.held === 0 && c.down && !firing)) {
      letGo(state, h, c, false); place(state, d, 0); p.isGrounded = true;
      h.specialLatch = !!(c.special || c.charge);
      return hands(c);
    }
    if (h.zip === 1) { h.zip = 0; h.held = 1; }
  }
  // (into a ceiling, a wall: back)
  if (h.up !== up0 && blocked(state, box(state, d.x, d.bottom - h.up))) { h.up = up0; if (h.zip === -1) { h.zip = 0; h.held = -1; } }
  // (the rush hits like an uppercut, the slide like a dive kick, till it's over)
  p.isUppercutting = h.zip === -1; p.isDivekicking = h.zip === 1;
  if (p.isUppercutting) p.uppercutTimer = 2;
  place(state, d, h.up);
  p.vel.x = 0; p.vel.y = up0 - h.up; p.isGrounded = false;
  pose(state, h, h.zip === -1 ? 'rush' : h.zip === 1 ? 'slide' : h.up !== up0 ? 'climb' : h.shotT > 0 ? 'hang' : 'rest');
  h.hurtWas = p.hurtTimer ?? 0;
  const aim = firing ? { up: c.up, down: c.down } : { up: false, down: false };
  return { ...c, left: false, right: false, jump: false, special: false, charge: false, ...aim };
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

// (bright brass: it has to stand out against dark wood, stone and wallpaper alike: a ladder is a way up, so it reads)
const IRON = { ink: '#120C04', dark: '#6A4814', mid: '#B07A1E', lit: '#E6B444', hi: '#FFF0B8' };

/** The ladder, still: two rails, rungs, and (where it meets a ledge) the rails run up past the lip, the lip lit. */
const paint = (g: CanvasRenderingContext2D, d: LadderDef, ledge: boolean) => {
  const L = d.x - HALF, R = d.x + HALF, top = d.top - (ledge ? 0 : 6), h = d.bottom - top;
  // (its shadow on the wall behind, a little down and right: stood off it, not painted on it)
  g.fillStyle = 'rgba(0, 0, 0, 0.45)';
  for (const x of [L, R]) g.fillRect(x - 1, top + 3, 6, h - 3);
  for (let y = d.bottom - RUNG; y > top + 3; y -= RUNG) g.fillRect(L + 2, y + 1, HALF * 2, 4);
  // (the rungs first, behind the rails: dark under, lit along the top)
  for (let y = d.bottom - RUNG; y > top + 3; y -= RUNG) {
    g.fillStyle = IRON.ink; g.fillRect(L, y - 2, HALF * 2, 5);
    g.fillStyle = IRON.mid; g.fillRect(L, y - 1, HALF * 2, 3);
    g.fillStyle = IRON.lit; g.fillRect(L, y - 1, HALF * 2, 1);
  }
  // (the rails: inked, lit down the left)
  for (const x of [L, R]) {
    g.fillStyle = IRON.ink; g.fillRect(x - 3, top, 6, h);
    g.fillStyle = IRON.dark; g.fillRect(x - 2, top, 4, h);
    g.fillStyle = IRON.lit; g.fillRect(x - 2, top, 1, h);
    // (a bolt at each rung)
    g.fillStyle = IRON.hi;
    for (let y = d.bottom - RUNG; y > top + 3; y -= RUNG) g.fillRect(x - 1, y, 2, 1);
  }
  if (ledge) {
    // (run up past the lip a little, capped, the lip they're stood on lit: where he gets off is plain)
    for (const x of [L, R]) {
      g.fillStyle = IRON.ink; g.fillRect(x - 3, d.top - 12, 6, 12); g.fillRect(x - 4, d.top - 14, 8, 4);
      g.fillStyle = IRON.dark; g.fillRect(x - 2, d.top - 11, 4, 11);
      g.fillStyle = IRON.lit; g.fillRect(x - 3, d.top - 14, 6, 1); g.fillRect(x - 2, d.top - 11, 1, 11);
    }
    g.fillStyle = IRON.hi; g.fillRect(L - 8, d.top - 1, HALF * 2 + 16, 2);
  } else {
    // (rounded tops, capped)
    for (const x of [L, R]) { g.fillStyle = IRON.ink; g.fillRect(x - 4, top - 2, 8, 4); g.fillStyle = IRON.lit; g.fillRect(x - 3, top - 2, 6, 1); }
  }
  // (feet on the ground: a shadow)
  g.fillStyle = 'rgba(0, 0, 0, 0.35)'; g.fillRect(L - 5, d.bottom - 2, HALF * 2 + 10, 3);
};

/** Whether each one meets a ledge at its top (looked for the once). */
const meets = new WeakMap<LadderDef, boolean>();

/** Every ladder in view (in the section's drawBack: behind him and everybody). */
export const drawLadders = (c: CanvasRenderingContext2D, state: GameState, defs: LadderDef[]) => {
  const h = holdOf(state), x0 = state.camera.x - 60, x1 = state.camera.x + 860;
  defs.forEach((d, i) => {
    if (d.x < x0 || d.x > x1) return;
    let ledge = meets.get(d);
    if (ledge === undefined) { ledge = !!(d.ledge || topOf(state, d)); meets.set(d, ledge); }
    // (rattling, a shoulder off it)
    const shake = h.rattle > 0 && h.rattleOn === i && h.defs === defs ? Math.round(Math.sin(h.rattle * 1.9) * (h.rattle / 5)) : 0;
    if (shake) { c.save(); c.translate(shake, 0); }
    stamp(c, `ladder:${d.x}:${d.top}:${d.bottom}:${ledge ? 1 : 0}`, d.x - HALF - 8, d.top - 16, HALF * 2 + 18, d.bottom - d.top + 20, g => paint(g, d, ledge));
    if (shake) c.restore();
  });
};
