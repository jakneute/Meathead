// The HAND ARMOR's CHEAP SHOT (SPEC.md): Y + B right by a land boss or a sub-boss it works on, once a life. A mini
// cutscene (no input, no HUD, nothing can hurt him, the fight frozen): he steps in, takes hold, and boots them in the
// balls (the ovaries: Piper, the Queen); an animated close-up of the damage, X-ray style (closeUp.ts: the generic one,
// or the boss's own, registerCloseUp); then back to it with the boss STUNNED (CHEAP_STUN frames: it can't attack, it
// takes hits as ever through its breather) and on CRUSHED-NUTS lines for the rest of the fight (crushedLines.ts) till
// it's dead or he is.
//
// ---- README, for whoever wires a boss to it (each land boss's fight.ts does; the rex, the demon, the pundits too) ------
//   cheapShotGate(state, e, id, ok)   once a frame, first thing in the boss's own update: `e` its enemy (the one the
//                engine hits), `id` its line set, `ok` it can be got at right now (stood on the floor, out in the open,
//                not in a scene of its own, not dying). Says what the fight does this frame:
//                  'frozen'   the cutscene's on with this boss: do nothing at all (no moves, no shots, no timers)
//                  'stunned'  stunned: take hits (its breather as ever) and die if it's due, nothing else (no attacks)
//                  null       as normal
//   cheapShotStunned(e)    stunned now (the fight's stunned look: its own dazed pose, if it has one; the dizzy stars
//                          over it are drawn here for every boss, drawCheapShotWorld)
//   crushGroups(id, {hurt, taunt, attack})   once, at load: which of the fight's own line sets are its hurt, taunt and
//                          attack lines. After a cheap shot those sets come out of the crushed-nuts pool instead:
//   crushLines(e, set)     a set of the fight's ({clean, shitty, nude}): the crushed one in its place, or itself
//   crushPool(e, arr)      one already picked by pants (set.clean, say): the crushed one's same pants, or itself
//   isCrushed(e)           crushed this life
//   registerCloseUp(id, paint)   a boss's own close-up in place of the generic one (Phase F)
// Wired: grab.ts ('cheap', a grab phase: cheapShotStart / cheapShotStep / drawCheapShot / drawCheapShotWorld);
// apply.ts (the close-up, screen space: world.ts setScreenOverlay).
// ---------------------------------------------------------------------------------------------------------------------

import type { FrameContext } from '../../m1/game/core/context';
import type { GameState } from '../../m1/game/core/state';
import { shakeScreen } from '../../m1/game/core/state';
import { NO_CONTROLS, type Controls } from '../../m1/game/platform/input';
import type { Enemy } from '../../m1/types';
import { KICK_POSE_FRAMES } from '../../m1/constants';
import { playSound } from '../../m1/game/platform/audio';
import { say, pickLine, MEATHEAD_VOICE } from '../../m1/game/platform/speech';
import { isNude, isShat } from '../../m1/game/player/gut';
import { saidOver } from '../adventure/section';
import { has } from './state';
import { CRUSHED, MEATHEAD_CHEAP, type CrushId, type CrushGroup, type Dressed, type CrushPants } from './crushedLines';
import { drawCloseUp, CLOSE_LEN, CLOSE_HIT, type CloseUpPaint, type CloseUpLook } from './closeUp';
import { CHEAP_STUN, CHEAP_REACH, CHEAP_REACH_UP } from './tune';

export type { CrushId } from './crushedLines';
type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------------
// Who it works on, and what each has had

interface Rec {
  e: Enemy; id: CrushId;
  /** The frame its fight last asked (gone quiet: out of it), and whether it could be got at then. */
  seen: number; ok: boolean;
  /** Which life of his this is all about (a death and it's all forgotten). */
  gen: number;
  crushed: boolean;
  /** Frames of stun left; its harmless flag as it was before. */
  stun: number; wasHarmless: boolean | undefined;
}
const recs = new Map<Enemy, Rec>();
/** His lives: up one each time he dies (crushed, stuns, the once a life: all off). */
let gen = 0, deadSeen = false;

const live = (r: Rec | undefined): r is Rec => !!r && r.gen === gen;
export const isCrushed = (e: Enemy) => { const r = recs.get(e); return live(r) && r.crushed; };
export const cheapShotStunned = (e: Enemy) => { const r = recs.get(e); return live(r) && r.stun > 0 && e.health > 0; };

/** The one it's being done to right now, and how far in. */
interface Scene { e: Enemy; id: CrushId; t: number; dir: 1 | -1; fromX: number; toX: number; said: { text: string } | null; look: CloseUpLook }
let scene: Scene | null = null;
export const cheapShotOn = () => !!scene;

export const cheapShotGate = (state: GameState, e: Enemy, id: CrushId, ok: boolean): 'frozen' | 'stunned' | null => {
  let r = recs.get(e);
  if (!r || r.gen !== gen) { r = { e, id, seen: 0, ok: false, gen, crushed: false, stun: 0, wasHarmless: undefined }; recs.set(e, r); }
  r.seen = state.frame; r.ok = ok;
  if (scene && scene.e === e) return 'frozen';
  if (r.stun > 0) {
    if (e.health <= 0) { endStun(r); return null; }
    if (--r.stun <= 0) { endStun(r); return null; }
    e.harmless = true;
    return 'stunned';
  }
  return null;
};
const endStun = (r: Rec) => { r.stun = 0; r.e.harmless = r.wasHarmless; };

// ---- the lines (crushedLines.ts): the fight's own sets, swapped once it's crushed
interface Mapped { id: CrushId; group: CrushGroup; dressed?: Dressed }
const mapped = new WeakMap<object, Mapped>();
export const crushGroups = (id: CrushId, groups: Partial<Record<CrushGroup, readonly CrushPants[]>>) => {
  for (const [group, sets] of Object.entries(groups) as [CrushGroup, readonly CrushPants[]][]) {
    for (const s of sets) {
      mapped.set(s, { id, group });
      for (const d of ['clean', 'shitty', 'nude'] as Dressed[]) if (Array.isArray(s[d])) mapped.set(s[d] as object, { id, group, dressed: d });
    }
  }
};
export const crushLines = <T>(e: Enemy | null | undefined, set: T): T => {
  if (!e || !isCrushed(e)) return set;
  const m = mapped.get(set as unknown as object);
  return m ? (CRUSHED[recs.get(e)!.id][m.group] as unknown as T) : set;
};
export const crushPool = <T>(e: Enemy | null | undefined, arr: T): T => {
  if (!e || !isCrushed(e)) return arr;
  const m = mapped.get(arr as unknown as object);
  return m && m.dressed ? (CRUSHED[recs.get(e)!.id][m.group][m.dressed] as unknown as T) : arr;
};

// ---- a boss's own close-up (Phase F), else the generic one
const closeUps = new Map<CrushId, CloseUpPaint>();
export const registerCloseUp = (id: CrushId, paint: CloseUpPaint) => { closeUps.set(id, paint); };

// ---------------------------------------------------------------------------------------------------------------------
// The cutscene

/** Its beats (frames): stepping in and taking hold; the boot lands; the close-up; a hop back off them; done. */
const T_HOLD = 10, T_HIT = T_HOLD + 10, T_PANEL_END = T_HIT + CLOSE_LEN, T_END = T_PANEL_END + 22;
/** Where his middle stands from their near side (the kick's foot reaches ~40 ahead of it). */
const STAND_OFF = 30;

const pants = (state: GameState): Dressed => (isNude(state) ? 'nude' : isShat(state) ? 'shitty' : 'clean');
const midX = (e: Enemy) => e.pos.x + e.width / 2;

/** The boss he'd get, Y + B now: right by him, out in the open, not had yet this life. */
const target = (state: GameState): Rec | null => {
  const p = state.player, cx = p.pos.x + p.width / 2;
  let best: Rec | null = null, bd = Infinity;
  for (const r of recs.values()) {
    if (!live(r) || r.crushed || !r.ok || state.frame - r.seen > 2) continue;
    const e = r.e;
    if (e.health <= 0 || e.isBlownAway || !state.enemies.includes(e)) continue;
    const dx = cx < e.pos.x ? e.pos.x - cx : cx > e.pos.x + e.width ? cx - (e.pos.x + e.width) : 0;
    const over = Math.min(p.pos.y + p.height, e.pos.y + e.height) - Math.max(p.pos.y, e.pos.y);
    if (dx > CHEAP_REACH || over < -CHEAP_REACH_UP) continue;
    if (dx < bd) { bd = dx; best = r; }
  }
  return best;
};

/** Y + B (grab.ts, idle): the cheap shot, if there's one to be had. True: it's on (grab.ts puts it in the 'cheap' phase). */
export const cheapShotStart = (ctx: FrameContext) => {
  const { state } = ctx, p = state.player;
  if (!has('hands') || scene || state.deathTimer > 0 || p.health <= 0 || !p.isGrounded) return false;
  const r = target(state);
  if (!r) return false;
  const e = r.e, cx = p.pos.x + p.width / 2;
  const dir = (midX(e) >= cx ? 1 : -1) as 1 | -1;
  const near = dir > 0 ? e.pos.x : e.pos.x + e.width;
  // (never further than he is, nor through them: only ever a step in)
  let toX = near - dir * STAND_OFF;
  if (dir > 0 ? toX < cx : toX > cx) toX = cx;
  r.crushed = true;
  const k = e.kind ?? '';
  scene = { e, id: r.id, t: 0, dir, fromX: cx, toX, said: null, look: lookOf(r.id, k) };
  p.isCharging = false; p.isSliding = false; p.isUppercutting = false; p.isDivekicking = false; p.uppercutBoost = undefined;
  p.recoiling = false; p.lockTimer = 0; p.pushbackTimer = 0; p.isHarmlessPushback = false; p.slideRecoil = false; p.isDucking = false;
  p.vel = { x: 0, y: 0 }; p.facing = dir; p.kickPose = 0;
  playSound('whoosh', 0.7, -4); playSound('snort', 0.8, -6);
  return true;
};

/** How its close-up looks (the generic one's choices: whose, what's in there, what it's made of). */
const lookOf = (id: CrushId, kind: string): CloseUpLook => {
  const c = CRUSHED[id];
  return { id, kind, female: c.female, robot: c.robot, slapstick: c.slapstick, glitter: c.glitter, paint: closeUps.get(id) };
};

/** Each frame of it (grab.ts's 'cheap' phase). Done: null (grab.ts ends the phase). */
export const cheapShotStep = (ctx: FrameContext): Controls | null => {
  const { state } = ctx, p = state.player, s = scene;
  if (!s) return null;
  if (state.deathTimer > 0 || p.health <= 0 || !state.enemies.includes(s.e) && s.t < T_HIT) { finish(state, false); return null; }
  s.t++;
  const t = s.t;
  p.inCutscene = true; p.untouchable = true; p.hidden = false; p.vel.x = 0; p.facing = s.dir;
  // (in: a step up to them)
  if (t <= T_HOLD) { const k = t / T_HOLD; p.pos.x = s.fromX + (s.toX - s.fromX) * (k * (2 - k)) - p.width / 2; }
  if (t === T_HOLD) { playSound('punch', 0.5, 6); p.kickPose = KICK_POSE_FRAMES; playSound('whoosh', 0.9, -6); }
  if ((p.kickPose ?? 0) > 0 && t > T_HOLD) p.kickPose!--;
  if (t === T_HIT) {
    playSound('crunch', 1, -8); playSound('splat', 1, -6); playSound('punch', 1, -10);
    shakeScreen(state, 12, 6);
    // (their scream, cutting off whatever was being said; his word after it, waiting its turn)
    const c = CRUSHED[s.id], d = pants(state);
    const scream = pickLine(c.scream[d]), said = { text: scream };
    say(scream, { id: c.voice, pitch: 0, rate: 1 }, 'urgent', {
      always: true,
      onShow: spoken => { if (scene === s) s.said = said; if (!spoken) setTimeout(() => { if (s.said === said) s.said = null; }, Math.max(1600, scream.length * 65)); },
      onHide: () => { if (s.said === said) s.said = null; },
    });
    const mine = pickLine(MEATHEAD_CHEAP[d]);
    say(mine, MEATHEAD_VOICE, 'queue', {
      always: true,
      onShow: spoken => {
        state.playerLastVulgarity = mine; state.playerVulgarityTimer = 9999;
        if (!spoken) setTimeout(() => { if (state.playerLastVulgarity === mine) state.playerVulgarityTimer = 0; }, Math.max(1800, mine.length * 70));
      },
      onHide: () => { if (state.playerLastVulgarity === mine) state.playerVulgarityTimer = 0; },
    });
  }
  if (t > T_HIT && t < T_PANEL_END && t - T_HIT === CLOSE_HIT) { playSound('crunch', 1, -14); playSound('splat', 0.9, -10); }
  // (out of the close-up: a hop back off them)
  if (t === T_PANEL_END) { p.vel.y = -5; p.isGrounded = false; playSound('jump', 0.5, 4); }
  if (t > T_PANEL_END) p.pos.x -= s.dir * 2.6;
  if (t >= T_END) { finish(state, true); return null; }
  return { ...NO_CONTROLS };
};

/** Over (or cut short by his dying, or them going): the stun starts, the controls are his. */
const finish = (state: GameState, stun: boolean) => {
  const s = scene, p = state.player;
  scene = null;
  p.inCutscene = false; p.untouchable = false; p.kickPose = 0;
  if (!s) return;
  const r = recs.get(s.e);
  if (stun && live(r) && s.e.health > 0) { r.wasHarmless = s.e.harmless; r.stun = CHEAP_STUN; }
};

/** Every frame (grab.ts updateGrab; `inPhase`: the grab's in its 'cheap' phase): a death forgets the lot. */
export const cheapShotTick = (state: GameState, inPhase: boolean) => {
  // (the grab let go of it some other way (its net, the water): over, clean)
  if (scene && !inPhase) finish(state, false);
  if (state.deathTimer > 0) {
    if (!deadSeen) {
      deadSeen = true; gen++;
      for (const r of recs.values()) if (r.stun > 0) endStun(r);
      if (scene) finish(state, false);
    }
  } else deadSeen = false;
  // (ones whose fights stopped asking a while back: gone)
  if (recs.size > 24) for (const [e, r] of recs) if (state.frame - r.seen > 600 || state.frame < r.seen) recs.delete(e);
};

/** The cheats' reset, a new game: everything forgotten. */
export const resetCheapShot = () => { recs.clear(); scene = null; gen++; };

// ---------------------------------------------------------------------------------------------------------------------
// Drawing

const STAR_COLS = ['#FDE047', '#FFFFFF', '#F472B6', '#FDE047'];
/** World space, every frame (grab.ts drawGrab): the stunned ones' dizzy stars and their scream over them. */
export const drawCheapShotWorld = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const r of recs.values()) {
    // (its fight still asking (dead, the fights stop: their own health's their own, not the enemy's), still in play)
    if (!live(r) || r.stun <= 0 || r.e.health <= 0 || state.frame - r.seen > 2 || !state.enemies.includes(r.e)) continue;
    const e = r.e, x = midX(e), y = e.pos.y - 8;
    // (a ring of stars round over the head, the near ones bigger; sweat flying off)
    const n = 4, rx = Math.max(16, Math.min(34, e.width * 0.45));
    for (let i = 0; i < n; i++) {
      const a = f * 0.12 + (i / n) * Math.PI * 2, sx = x + Math.cos(a) * rx, sy = y + Math.sin(a) * 6, near = Math.sin(a) > 0;
      star(c, Math.round(sx), Math.round(sy), near ? 4 : 3, STAR_COLS[i]);
    }
    if (f % 18 < 9) { c.fillStyle = '#93C5FD'; c.fillRect(Math.round(x - e.width / 2 - 4), Math.round(e.pos.y + 10 + (f % 9)), 2, 4); c.fillRect(Math.round(x + e.width / 2 + 2), Math.round(e.pos.y + 14 + (f % 9)), 2, 4); }
  }
  if (scene?.said) saidOver(c, scene.said.text, midX(scene.e), scene.e.pos.y - 18);
};
const star = (c: Ctx, x: number, y: number, r: number, col: string) => {
  c.fillStyle = '#000'; c.fillRect(x - r - 1, y - 1, r * 2 + 2, 3); c.fillRect(x - 1, y - r - 1, 3, r * 2 + 2);
  c.fillStyle = col; c.fillRect(x - r, y, r * 2, 1); c.fillRect(x, y - r, 1, r * 2); c.fillRect(x - 1, y - 1, 3, 3);
};

/** Screen space, over everything (world.ts's screen overlay, apply.ts): the close-up, while it's up. */
export const drawCheapShotPanel = (c: Ctx, _state: GameState) => {
  const s = scene;
  if (!s || s.t < T_HIT || s.t >= T_PANEL_END) return;
  drawCloseUp(c, s.look, s.t - T_HIT);
};
