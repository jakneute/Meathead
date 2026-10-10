// Through a portal at the hub, both ways.
//
// In (a land picked on the map, confirmed): the show before the walk in (portalWalk.ts).
//   1. He walks over to the middle of the portal's path (himself, the game's own walk), out of the player's hands.
//   2. He turns his back on us (the sprite flips round edge-on, the SNES's turn), and the portal wakes up: the swirl
//      winding faster and faster, its bands palette-cycling, rings pulsing in toward its middle, light spilling out
//      across the plaza and up his edges, sparkles drawn in off the air spiraling into it.
//   3. He walks up into it from behind, smaller with every step, the swirl's light coming over him, the camera pushing
//      in (eased in and out, the whole way: the zoom never stops or jerks).
//   4. It takes him: drawn out long and thin into its middle, afterimages trailing in after him, the color of it; a
//      shockwave ring off it, the screen shaking; the white comes up out of that moment, and out of the white, the walk
//      in. A or the skip, any time after the first half second: the lot's gone, straight there.
//
// Out (back at the hub from a land: after a boss's walk-away, or BACK TO HUB): the same, backward. Tight on the swirl,
// roaring, out of white; it spits him out of its middle (a streak drawn back into his shape, the afterimages folding
// into him, a ring off it); he walks out at us from it (from the front: the walk-away's him, arms swinging, his weapon
// down by his left side) and down onto the plaza as the camera pulls back to the hub's own view and the swirl settles;
// he turns side-on (the turn the other way), and he's the player's again. About a second and a half; skippable.
//
// The hub runs them (hub/index.ts): startPortal off the map's confirm, startExit as it's built back from a land;
// runShow from its update, portalZoom for its zoom, drawPortalBack / drawPortalFront in the world, drawPortalHud over
// everything, portalLights / portalLightAmount for its lighting.

import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import type { Light } from '../../m1/game/render/lighting';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { playMenuOk, playSound } from '../../m1/game/platform/audio';
import { SKIP_AFTER, offerSkip, takeSkip, drawSkipPrompt } from '../../m1/game/platform/skip';
import { shakeScreen } from '../../m1/game/core/state';
import { isNude, isShat } from '../../m1/game/player/gut';
import { drawPlayer, drawHeldWeaponArt } from '../../m1/game/render/player/player';
import { mix } from '../../m1/game/render/backdrops/core';
import { setUi, goTo } from '../store';
import { playPortalWalk, tickPortalWalk, drawPortalWalk, type PortalWalk } from '../portalWalk';
import { notePortalArrival } from '../portalArrival';
import { drawMeatheadBack, type BackPose } from '../walkAway/meatheadBack';
import { drawMeatheadFront, type Pose } from '../walkAway/meathead';
import { LANDS, SPOTS, type Land } from './lands';
import { slotX } from './geometry';
import { setPortalSurge } from './draw';

type Ctx = CanvasRenderingContext2D;

/** Going in. */
export interface Portal {
  kind: 'in';
  land: Land; slot: number; t: number;
  /** When he got to the middle of its path (0 till then), and so when each beat after it falls. */
  at: number;
  /** How far the swirl's been wound on (frames ahead of the clock). */
  phase: number;
  /** The walk in, once he's through. */
  walk: PortalWalk | null;
  /** A has to be let go of first (it may be what confirmed it). */
  armed: boolean;
}
/** Coming back out. */
export interface Exit {
  kind: 'out';
  land: Land; slot: number; t: number;
  phase: number;
  armed: boolean;
}
/** Either show. */
export type Show = Portal | Exit;

/** The portal's swirl: where its middle is (world), its arch (half width, top). */
const SWIRL_DY = 140, ARCH_W = 100, ARCH_TOP = 270;
/** In: frames, from when he's got to the middle: turning round; walking up into it; being taken; the white. */
const TURN_T = 12, IN_T = 50, PULL_T = 20, WHITE_T = 16;
/** In: at most this long getting over to the middle of its path. */
const WALK_MAX = 34;
/** Out: frames (from the start): the white easing off; spat out (the streak back to him); walking out at us; turning
 * side-on; over. The pull back: held a beat, then out over this long. The swirl settling, over this long. */
const EX_WHITE = 16, EX_SPIT = 18, EX_OUT = 46, EX_TURN = 12, EX_END = EX_SPIT + EX_OUT + EX_TURN;
const EX_HOLD = 6, EX_ZOOM_T = EX_SPIT + EX_OUT - 2, EX_SETTLE = EX_END;
/** The push in: how far it gets by the white, and where on screen the swirl's middle ends up. */
const ZOOM_TO = 2.6, ZOOM_SY = 300;
/** The whole push in, from the confirm (frames). */
const ZOOM_T = WALK_MAX * 0.6 + TURN_T + IN_T + PULL_T + WHITE_T;
/** His size here: the game's him, ~72 px tall, from his 186 px picture; how small he is up in the swirl. */
const S0 = 72 / 186, DEEP = 0.58;

const clamp = (k: number) => Math.max(0, Math.min(1, k));
const ease = (k: number) => { const u = clamp(k); return u * u * (3 - 2 * u); };
const smoother = (k: number) => { const u = clamp(k); return u * u * u * (u * (u * 6 - 15) + 10); };

const swirlAt = (pt: Show) => ({ x: slotX(pt.slot), y: GROUND_Y - SWIRL_DY });
/** In: frames since he got to the middle (-1 before). */
const since = (pt: Portal) => (pt.at ? pt.t - pt.at : -1);
/** In: when it takes him (frames since he got there). */
const TAKE = TURN_T + IN_T + PULL_T;
/** In: how awake the portal is (0..1): stirring as he turns, roaring as it takes him. */
const surgeOf = (pt: Portal) => { const s = since(pt); return s < 0 ? 0.08 : 0.15 + 0.85 * ease(s / TAKE); };
/** How awake the portal is (0..1), either way: going in, building; coming out, settling. */
const awake = (pt: Show) => (pt.kind === 'in' ? surgeOf(pt) : 1 - ease(pt.t / EX_SETTLE));
/** How far pushed in the camera is (0..1, smoothly), either way. */
const zoomK = (pt: Show) => (pt.kind === 'in' ? smoother(pt.t / ZOOM_T) : 1 - smoother((pt.t - EX_HOLD) / EX_ZOOM_T));
/** On the hub (not over to the walk in). */
const shown = (pt: Show | null | undefined): pt is Show => !!pt && !(pt.kind === 'in' && pt.walk);
const slotOf = (land: Land) => SPOTS.findIndex(s => s.kind === 'land' && LANDS[s.land] === land);

export const startPortal = (land: Land): Portal => {
  // (no HUD, no prompt, from the frame it's confirmed)
  setUi({ near: null, introCutscene: true });
  playMenuOk();
  return { kind: 'in', land, slot: slotOf(land), t: 0, at: 0, phase: 0, walk: null, armed: false };
};

/** Back from the land at this hub spot (its portal): out it comes. */
export const startExit = (slot: number): Exit | null => {
  const s = SPOTS[slot];
  if (!s || s.kind !== 'land') return null;
  setUi({ near: null, introCutscene: true });
  return { kind: 'out', land: LANDS[s.land], slot, t: 0, phase: 0, armed: false };
};

/** Off to the land (the walk in's over, or it's been skipped). */
const leaveThrough = (pt: Portal, arrive: boolean) => {
  if (arrive) notePortalArrival();
  goTo(pt.land.id);
};

/** A frame of either: his controls (walking over to it going in; else nothing). `hub.portal` cleared once he's out. */
export const runShow = (state: GameState, hub: { portal?: Show | null }, controls: Controls): Controls => {
  const show = hub.portal!;
  const p = state.player;
  show.t++;
  p.inCutscene = true;
  setUi({ near: null, map: null, nearExit: false, nearAmerica: false, introCutscene: true });
  show.phase += awake(show) * 7;
  if (!controls.jump) show.armed = true;
  if (show.kind === 'out') {
    // (A, fresh, or the skip: he's just out, there, his own)
    if (show.t > 4) offerSkip();
    const over = show.t >= EX_END || (show.t > 4 && (takeSkip() || (show.armed && !!controls.jump)));
    p.pos.x = slotX(show.slot) - p.width / 2; p.pos.y = GROUND_Y - p.height; p.vel.x = 0; p.vel.y = 0; p.facing = 1;
    // (the view straight on him: no swinging in from where the stage would start it)
    state.camera.x = slotX(show.slot) - CANVAS_WIDTH / 2;
    if (over) {
      hub.portal = null;
      p.hidden = false; p.inCutscene = false;
      setUi({ introCutscene: false });
      return { ...NO_CONTROLS };
    }
    p.hidden = true;
    const t = show.t;
    if (t === 2) { playSound('whoosh', 0.6, -8); playSound('whirl', 0.3, -2); }
    if (t === EX_SPIT - 4) { playSound('boing', 0.45, 9); playSound('twinkle', 0.4, 6); shakeScreen(state, 6, 4); }
    if (t > EX_SPIT && t < EX_SPIT + EX_OUT && (t - EX_SPIT) % 14 === 7) playSound('land', 0.1, -3 + ((t >> 3) % 2));
    if (t === EX_SPIT + EX_OUT) playSound('land', 0.22, -6);
    return { ...NO_CONTROLS };
  }
  const pt = show;
  // (A, fresh, or the skip: the whole of it, gone; straight there)
  if (pt.t > SKIP_AFTER) offerSkip();
  if (pt.t > SKIP_AFTER && (takeSkip() || (pt.armed && controls.jump))) { leaveThrough(pt, false); return { ...NO_CONTROLS }; }
  if (pt.walk) { tickPortalWalk(pt.walk); return { ...NO_CONTROLS }; }
  // 1. Over to the middle of its path, himself
  if (!pt.at) {
    const dx = slotX(pt.slot) - (p.pos.x + p.width / 2);
    if (Math.abs(dx) < 7 || pt.t > WALK_MAX) {
      p.pos.x = slotX(pt.slot) - p.width / 2; p.vel.x = 0; p.facing = 1; pt.at = pt.t;
      playSound('alienCharge', 0.35, -9);
    } else return { ...NO_CONTROLS, left: dx < 0, right: dx > 0 };
  }
  p.vel.x = 0; p.vel.y = 0;
  const s = since(pt);
  // 2..4: his back to us, up into it, taken
  p.hidden = true;
  if (s === TURN_T / 2) playSound('land', 0.15, 2);
  if (s > TURN_T && s < TURN_T + IN_T && (s - TURN_T) % 14 === 0) playSound('land', 0.1, -3 + ((s / 14) % 2));
  if (s === TURN_T + 10) playSound('suck', 0.3, -4);
  if (s === TURN_T + IN_T - 6) playSound('whirl', 0.35, 2);
  if (s === TAKE) { playSound('whoosh', 0.7, 8); playSound('boom', 0.3, 10); playSound('twinkle', 0.45, 4); shakeScreen(state, 10, 6); }
  if (s >= TAKE + WHITE_T) pt.walk = playPortalWalk(state, { land: pt.land.id, flash: true, onDone: () => leaveThrough(pt, true) });
  return { ...NO_CONTROLS };
};

/** The push in on the portal, or the pull back out (the stage's zoom: StageLayout.zoom): eased the whole way. */
export const portalZoom = (state: GameState, pt: Show | null | undefined) => {
  if (!shown(pt)) return null;
  const k = zoomK(pt), s = 1 + (ZOOM_TO - 1) * k;
  if (s < 1.001) return null;
  // (the swirl's middle, from where it is on screen to the middle of the screen as it goes)
  const cam = state.camera, { x: Zx, y: Zy } = swirlAt(pt);
  const Sx = (Zx - cam.x) + (CANVAS_WIDTH / 2 - (Zx - cam.x)) * k, Sy = (Zy - cam.y) + (ZOOM_SY - (Zy - cam.y)) * k;
  return { scale: s, x: (Sx + cam.x - Zx * s) / (1 - s), y: (Sy + cam.y - Zy * s) / (1 - s) };
};

/** Its light, out over the plaza and him (and through the dark after sundown). */
export const portalLights = (pt: Show | null | undefined): Light[] => {
  if (!shown(pt)) return [];
  const k = awake(pt), { x, y } = swirlAt(pt);
  return [{ x, y, r: 260 + 340 * k, a: 0.6 + 0.4 * k, color: pt.land.swirl[2] }, { x, y, r: 150 + 120 * k, a: 1, color: '#FFFFFF' }];
};
/** How much of the hour's dark and grade is left over the hub while it's awake (it floods the place with its light:
 * at night, its glow would otherwise come out grey under the dark). */
export const portalLightAmount = (pt: Show | null | undefined) => (!shown(pt) ? 1 : 1 - 0.65 * awake(pt));

// ---------------------------------------------------------------------------------------------------------------
// The portal awake (world space, over its own drawing: drawHubBack, before him)

/** The arch's opening, as a path. */
const archPath = (c: Ctx, cx: number) => {
  const top = GROUND_Y - ARCH_TOP;
  c.beginPath(); c.moveTo(cx - ARCH_W, GROUND_Y); c.lineTo(cx - ARCH_W, top + ARCH_W); c.arc(cx, top + ARCH_W, ARCH_W, Math.PI, 0); c.lineTo(cx + ARCH_W, GROUND_Y); c.closePath();
};

const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${clamp(a).toFixed(3)})`;

/** Called before the hub's back's drawn: winds its swirl on (or lets it be). */
export const notePortalSurge = (pt: Show | null | undefined) => setPortalSurge(shown(pt) ? pt.slot : -1, pt ? pt.phase : 0);

export const drawPortalBack = (c: Ctx, state: GameState, pt: Show | null | undefined) => {
  if (!shown(pt)) return;
  const k = awake(pt), { x: vx, y: vy } = swirlAt(pt), [, mid, hi] = pt.land.swirl;
  const t = pt.t;
  // (its middle white hot: as it takes him; as it spits him back out, cooling)
  const core = pt.kind === 'in' ? (since(pt) > TAKE - 10 ? ease((since(pt) - TAKE + 10) / 14) : 0) : 1 - ease(pt.t / (EX_SPIT + 8));
  c.save();
  c.globalCompositeOperation = 'lighter';
  // Light spilling out onto the plaza in front of it: stepped bands, brighter in
  for (let i = 0; i < 4; i++) {
    c.fillStyle = rgba(hi, (0.05 + 0.03 * i) * (0.4 + k));
    c.beginPath(); c.ellipse(vx, GROUND_Y + 16, 170 - i * 34, 30 - i * 6, 0, 0, Math.PI * 2); c.fill();
  }
  // Inside the arch: its middle glowing (stepped), rings pulsing (in toward it going in, out of it coming back)
  archPath(c, vx); c.clip();
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.4);
  for (let i = 4; i >= 1; i--) { c.fillStyle = rgba(i > 2 ? mid : hi, 0.1 * k * pulse); c.beginPath(); c.ellipse(vx, vy, (16 + i * 20 * (0.6 + k)) * 0.66, 16 + i * 20 * (0.6 + k), 0, 0, Math.PI * 2); c.fill(); }
  c.lineWidth = 6;
  for (let i = 0; i < 5; i++) {
    const f = ((t * (0.012 + 0.03 * k) + i / 5) % 1), u = pt.kind === 'in' ? f : 1 - f, r = 190 * (1 - u);
    c.strokeStyle = rgba(i % 2 ? hi : '#FFFFFF', (0.12 + 0.4 * k) * Math.sin(u * Math.PI));
    c.beginPath(); c.ellipse(vx, vy, r * 0.64, r, Math.sin(pt.phase * 0.01) * 0.2, 0, Math.PI * 2); c.stroke();
  }
  if (core > 0) { c.fillStyle = rgba('#FFFFFF', 0.85 * core); c.beginPath(); c.ellipse(vx, vy, 20 + 140 * core, 30 + 200 * core, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  void state;
};

/** Sparkles spiraling into its middle off the air (or, `out`, flung back out of it), trails behind them. */
const sparkles = (c: Ctx, pt: Show, vx: number, vy: number, k: number, out: boolean) => {
  const [, mid, hi] = pt.land.swirl;
  const n = Math.round(40 * k);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const L = 46 - 16 * k, f = ((pt.t + (i * L) / 40 + i * 7.3) % L) / L, u = out ? 1 - f : f;
    const r0 = 120 + ((i * 53) % 140), a0 = i * 2.39996 + pt.phase * 0.004;
    const at = (uu: number) => { const r = r0 * (1 - uu) ** 1.5, a = a0 + uu * (2.6 + 3 * k); return [vx + Math.cos(a) * r * 0.8, vy + Math.sin(a) * r] as const; };
    const [x, y] = at(u), [tx, ty] = at(out ? Math.min(1, u + 0.07) : Math.max(0, u - 0.07));
    const col = [hi, '#FFFFFF', mid][i % 3];
    c.strokeStyle = rgba(col, 0.5 * Math.sin(u * Math.PI)); c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(x, y); c.stroke();
    c.fillStyle = rgba(col, Math.sin(u * Math.PI));
    const z = (i % 4 === 0 ? 3 : 2);
    c.fillRect(Math.round(x) - z, Math.round(y) - 1, z * 2, 2); c.fillRect(Math.round(x) - 1, Math.round(y) - z, 2, z * 2);
  }
  c.restore();
};

/** A shockwave ring off its middle, `u` (0..1) of the way out. */
const shock = (c: Ctx, pt: Show, vx: number, vy: number, u: number) => {
  const hi = pt.land.swirl[2];
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const [dr, w, col] of [[0, 14, hi], [-10, 6, '#FFFFFF']] as const) {
    const r = Math.max(1, (u * 420 + dr));
    c.strokeStyle = rgba(col, 0.9 * (1 - u)); c.lineWidth = w * (1 - u) + 1;
    c.beginPath(); c.ellipse(vx, vy, r * 0.8, r, 0, 0, Math.PI * 2); c.stroke();
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Him (world space, over the portal)

/** Him (from behind, or the front), painted at 3x his picture's pixels on a canvas of his own (then drawn down to his
 * size here, smoothly: no crawl as the camera moves), and the same again solid in the portal's color (its light on him). */
const HI = 3, ME_W = 150, ME_H = 206, ME_FOOT = 12;
let fig: HTMLCanvasElement | null = null, tint: HTMLCanvasElement | null = null;
const pose: BackPose = { step: 0, t: 0, nude: false, shat: false, rim: '#FFFFFF', weapon: null };
let held: import('../../m1/types').WeaponType = 'GUN';
const holdWeapon = (c: Ctx, t: number) => drawHeldWeaponArt(c, held, t);
const fpose: Pose = { step: 0, t: 0, wx: 0, wy: -102, rot: 0, turn: 0, face: 'smirk', green: 0, headY: -1, nude: false, shat: false, rim: '#FFFFFF' };
const NO_GRIP: [[number, number], [number, number]] = [[0, 0], [0, 0]];
const walking = { weapon: holdWeapon as ((c: Ctx, t: number) => void) | null };

const paintFigure = (state: GameState, pt: Show, step: number, col: string, front = false) => {
  if (!fig) { fig = document.createElement('canvas'); fig.width = ME_W * HI; fig.height = ME_H * HI; }
  if (!tint) { tint = document.createElement('canvas'); tint.width = ME_W * HI; tint.height = ME_H * HI; }
  const g = fig.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, fig.width, fig.height);
  g.setTransform(HI, 0, 0, HI, 0, 0);
  const nude = isNude(state), shat = isShat(state), rim = mix(pt.land.swirl[2], '#FFFFFF', 0.35);
  held = state.player.currentWeapon ?? 'GUN';
  if (!front) {
    pose.step = step; pose.t = pt.t; pose.nude = nude; pose.shat = shat; pose.rim = rim; pose.weapon = holdWeapon;
    drawMeatheadBack(g, ME_W / 2, ME_H - ME_FOOT, pose);
  } else {
    // (from the front, walking out at us: the walk-away's him, his arms swinging, his weapon down by his left side)
    fpose.step = step; fpose.t = pt.t; fpose.nude = nude; fpose.shat = shat; fpose.rim = rim;
    drawMeatheadFront(g, ME_W / 2, ME_H - ME_FOOT, fpose, NO_GRIP, holdWeapon, walking);
  }
  const h = tint.getContext('2d')!;
  h.globalCompositeOperation = 'source-over'; h.clearRect(0, 0, tint.width, tint.height); h.drawImage(fig, 0, 0);
  h.globalCompositeOperation = 'source-atop'; h.fillStyle = col; h.fillRect(0, 0, tint.width, tint.height);
  h.globalCompositeOperation = 'source-over';
};

/** The figure (or its tinted twin) with its feet at (x, y), `s` world px a picture px, squeezed across (sx) and drawn
 * out long (sy), turned about his feet. */
const blit = (c: Ctx, img: HTMLCanvasElement, x: number, y: number, s: number, sx = 1, sy = 1, rot = 0) => {
  const w = ME_W * s * sx, h = ME_H * s * sy;
  c.save();
  c.imageSmoothingEnabled = true;
  c.translate(x, y); c.rotate(rot);
  c.drawImage(img, -w / 2, -(ME_H - ME_FOOT) * s * sy, w, h);
  c.restore();
};

/** The game's him, as he is, stood at (x, y), squeezed across to `sx` (turning edge-on). */
const drawSideHim = (c: Ctx, state: GameState, x: number, y: number, sx: number) => {
  const p = state.player;
  const b = {
    ...p, pos: { x: x - p.width / 2, y: y - p.height }, facing: 1, hidden: false, isGrounded: true, inCutscene: true,
    vel: { x: 0, y: 0 }, invincibilityTimer: 0, isCharging: false, isSliding: false, isDucking: false,
  };
  c.save(); c.translate(x, y); c.scale(Math.max(0.02, sx), 1); c.translate(-x, -y);
  drawPlayer(c, b as typeof p, state, { currentWeapon: p.currentWeapon, showFilthShield: false, invincibilityEnabled: false });
  c.restore();
};

/** Taken (u 0..1 of the pull: going in) or given back (u 1..0: coming out): drawn out long and thin at its middle,
 * twisting with it, afterimages strung out behind; `fromFeet` where his feet were before it had him. */
const streak = (c: Ctx, pt: Show, vy: number, vx: number, u: number, fromFeet: number, out: boolean) => {
  const e = ease(u);
  const sc = S0 * DEEP * (1 - 0.85 * e);
  const feet = fromFeet + (vy + (ME_H - ME_FOOT) * sc * 0.5 - fromFeet) * e;
  const sx = 1 - 0.75 * e, sy = 1 + 2.2 * e * (1 - e) + 0.4 * e, rot = Math.sin(pt.phase * 0.02) * 0.4 * e;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let g = 3; g >= 1; g--) {
    // (going in: trailing in after him; coming out: out ahead of him, folding back into him)
    const back = out ? Math.min(1, u + g * 0.12) : Math.max(0, u - g * 0.09), eb = ease(back);
    const fb = fromFeet + (vy + (ME_H - ME_FOOT) * S0 * DEEP * (1 - 0.85 * eb) * 0.5 - fromFeet) * eb;
    c.globalAlpha = 0.28 / g; blit(c, tint!, vx, fb + (out ? -g * 4 : g * 6), S0 * DEEP * (1 - 0.85 * eb) * (out ? 1 + g * 0.18 : 1), 1 - 0.75 * eb, 1 + 0.6 * eb, rot * 0.5);
  }
  c.restore();
  c.save(); c.globalAlpha = 1 - e * 0.6; blit(c, fig!, vx, feet, sc, sx, sy, rot); c.restore();
  c.save(); c.globalAlpha = Math.min(1, 0.5 + e); blit(c, tint!, vx, feet, sc, sx, sy, rot); c.restore();
};

export const drawPortalFront = (c: Ctx, state: GameState, show: Show | null | undefined) => {
  if (!shown(show) || typeof document === 'undefined') return;
  const { x: vx, y: vy } = swirlAt(show), hi = show.land.swirl[2], k = awake(show);
  const feet0 = GROUND_Y - 1, deepFeet = vy + 64;
  if (show.kind === 'out') {
    const t = show.t;
    // Sparkles flung back out of it; the ring off it as it spits him out
    sparkles(c, show, vx, vy, k, true);
    if (t < EX_SPIT) shock(c, show, vx, vy, t / EX_SPIT);
    if (t < EX_SPIT) {
      // (spat out: the streak drawn back into his shape, the afterimages folding into him)
      paintFigure(state, show, 0, hi, true);
      streak(c, show, vy, vx, 1 - t / EX_SPIT, deepFeet, true);
    } else if (t < EX_SPIT + EX_OUT) {
      // (walking out at us, down onto the plaza, bigger every step, the swirl's light coming off him)
      const u = (t - EX_SPIT) / EX_OUT, e = ease(u);
      const feet = deepFeet + (feet0 - deepFeet) * e, sc = S0 * (DEEP + (1 - DEEP) * e);
      paintFigure(state, show, ((t - EX_SPIT) * Math.PI) / 14, hi, true);
      blit(c, fig!, vx, feet, sc);
      c.save(); c.globalAlpha = 0.45 * (1 - e) * (1 - e); blit(c, tint!, vx, feet, sc); c.restore();
    } else {
      // (turning side-on: the front narrowing to nothing, the game's him opening out, facing on round the hub)
      const u = (t - EX_SPIT - EX_OUT) / EX_TURN, hop = Math.sin(u * Math.PI) * 4;
      if (u < 0.5) { paintFigure(state, show, 0, hi, true); blit(c, fig!, vx, feet0 - hop, S0, 1 - u * 2); }
      else drawSideHim(c, state, vx, feet0 - hop, (u - 0.5) * 2);
    }
    return;
  }
  const pt = show;
  const s = since(pt);
  if (s < 0) return;
  // Sparkles drawn in off the air, spiraling into its middle
  sparkles(c, pt, vx, vy, k, false);
  // Him
  if (s < TURN_T) {
    // (turning his back on us: edge-on, then round: the game's him narrowing to nothing, his back opening out)
    const u = s / TURN_T, hop = Math.sin(u * Math.PI) * 4;
    if (u < 0.5) drawSideHim(c, state, vx, feet0 - hop, 1 - u * 2);
    else { paintFigure(state, pt, 0, hi); blit(c, fig!, vx, feet0 - hop, S0, (u - 0.5) * 2); }
  } else if (s < TURN_T + IN_T) {
    // (up into it from behind: smaller each step, higher, its light coming over him)
    const u = (s - TURN_T) / IN_T, e = ease(u);
    const feet = feet0 + (deepFeet - feet0) * e;
    const sc = S0 * (1 - (1 - DEEP) * e);
    paintFigure(state, pt, ((s - TURN_T) * Math.PI) / 14, hi);
    blit(c, fig!, vx, feet, sc);
    c.save(); c.globalAlpha = 0.08 + 0.3 * e * e; blit(c, tint!, vx, feet, sc); c.restore();
  } else if (s < TAKE) {
    // (taken: drawn out long and thin into its middle, twisting with it, afterimages pouring in after him)
    paintFigure(state, pt, ((s - TURN_T) * Math.PI) / 14, hi);
    streak(c, pt, vy, vx, (s - TURN_T - IN_T) / PULL_T, deepFeet, false);
  }
  // The shockwave off it as it takes him
  if (s >= TAKE) shock(c, pt, vx, vy, (s - TAKE) / WHITE_T);
};

/** Over everything (screen space): going in, the white coming up out of the moment it takes him, then the walk in
 * itself; coming out, the white easing off as it spits him out, and the skip. */
export const drawPortalHud = (c: Ctx, show: Show | null | undefined) => {
  if (!show) return;
  if (show.kind === 'out') {
    const w = 1 - ease(show.t / EX_WHITE);
    if (w > 0) { c.fillStyle = `rgba(255, 255, 255, ${w.toFixed(3)})`; c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); }
    if (show.t > 4) drawSkipPrompt(c, CANVAS_WIDTH);
    return;
  }
  const pt = show;
  if (pt.walk) { drawPortalWalk(c, pt.walk); return; }
  const s = since(pt);
  if (s < TAKE) return;
  // (the ring gets a moment first: the white eases in behind it)
  const w = clamp((s - TAKE) / WHITE_T);
  const v = [1, 3, 5].map(i => parseInt(pt.land.swirl[2].slice(i, i + 2), 16)).map(x => Math.round(x + (255 - x) * clamp(w * 1.4)));
  c.fillStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${clamp(w * w * 1.15).toFixed(3)})`;
  c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
