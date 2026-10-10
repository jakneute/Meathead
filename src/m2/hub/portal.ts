// Through a portal at the hub (a land picked on the map, confirmed): the show before the walk in (portalWalk.ts).
//
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
// The hub runs it (hub/index.ts): startPortal off the map's confirm, runPortal from its update, portalZoom for its zoom,
// drawPortalBack / drawPortalFront in the world, drawPortalHud over everything, portalLights for its lighting.

import type { GameState } from '../../m1/game/core/state';
import type { Controls } from '../../m1/game/platform/input';
import type { Light } from '../../m1/game/render/lighting';
import { NO_CONTROLS } from '../../m1/game/platform/input';
import { GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';
import { playMenuOk, playSound } from '../../m1/game/platform/audio';
import { SKIP_AFTER, offerSkip, takeSkip } from '../../m1/game/platform/skip';
import { shakeScreen } from '../../m1/game/core/state';
import { isNude, isShat } from '../../m1/game/player/gut';
import { drawPlayer, drawHeldWeaponArt } from '../../m1/game/render/player/player';
import { mix } from '../../m1/game/render/backdrops/core';
import { setUi, goTo } from '../store';
import { playPortalWalk, tickPortalWalk, drawPortalWalk, type PortalWalk } from '../portalWalk';
import { notePortalArrival } from '../portalArrival';
import { drawMeatheadBack, type BackPose } from '../walkAway/meatheadBack';
import { LANDS, SPOTS, type Land } from './lands';
import { slotX } from './geometry';
import { setPortalSurge } from './draw';

type Ctx = CanvasRenderingContext2D;

export interface Portal {
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

/** The portal's swirl: where its middle is (world), its arch (half width, top). */
const SWIRL_DY = 140, ARCH_W = 100, ARCH_TOP = 270;
/** Frames, from when he's got to the middle: turning round; walking up into it; being taken; the white. */
const TURN_T = 12, IN_T = 50, PULL_T = 20, WHITE_T = 16;
/** At most this long getting over to the middle of its path. */
const WALK_MAX = 34;
/** The push in: how far it gets by the white, and where on screen the swirl's middle ends up. */
const ZOOM_TO = 2.6, ZOOM_SY = 300;
/** The whole push in, from the confirm (frames). */
const ZOOM_T = WALK_MAX * 0.6 + TURN_T + IN_T + PULL_T + WHITE_T;
/** His size here: the game's him, ~72 px tall, from his 186 px picture. */
const S0 = 72 / 186;

const clamp = (k: number) => Math.max(0, Math.min(1, k));
const ease = (k: number) => { const u = clamp(k); return u * u * (3 - 2 * u); };
const smoother = (k: number) => { const u = clamp(k); return u * u * u * (u * (u * 6 - 15) + 10); };

const swirlAt = (pt: Portal) => ({ x: slotX(pt.slot), y: GROUND_Y - SWIRL_DY });
/** Frames since he got to the middle (-1 before). */
const since = (pt: Portal) => (pt.at ? pt.t - pt.at : -1);
/** When it takes him (frames since he got there). */
const TAKE = TURN_T + IN_T + PULL_T;
/** How awake the portal is (0..1): stirring as he turns, roaring as it takes him. */
const surgeOf = (pt: Portal) => { const s = since(pt); return s < 0 ? 0.08 : 0.15 + 0.85 * ease(s / TAKE); };

export const startPortal = (state: GameState, land: Land): Portal => {
  const slot = SPOTS.findIndex(s => s.kind === 'land' && LANDS[s.land] === land);
  // (no HUD, no prompt, from the frame it's confirmed)
  setUi({ near: null, introCutscene: true });
  playMenuOk();
  void state;
  return { land, slot, t: 0, at: 0, phase: 0, walk: null, armed: false };
};

/** Off to the land (the walk in's over, or it's been skipped). */
const leaveThrough = (pt: Portal, arrive: boolean) => {
  if (arrive) notePortalArrival();
  goTo(pt.land.id);
};

/** A frame of it: what he's doing (his controls: walking over to it, then nothing). */
export const runPortal = (state: GameState, pt: Portal, controls: Controls): Controls => {
  const p = state.player;
  pt.t++;
  p.inCutscene = true;
  setUi({ near: null, map: null, nearExit: false, nearAmerica: false, introCutscene: true });
  const k = surgeOf(pt);
  pt.phase += k * 7;
  // (A, fresh, or the skip: the whole of it, gone; straight there)
  if (!controls.jump) pt.armed = true;
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

/** The push in on the portal (the stage's zoom: StageLayout.zoom): eased in and out over the whole of it. */
export const portalZoom = (state: GameState, pt: Portal | null | undefined) => {
  if (!pt || pt.walk) return null;
  const k = smoother(pt.t / ZOOM_T), s = 1 + (ZOOM_TO - 1) * k;
  if (s < 1.001) return null;
  // (the swirl's middle, from where it is on screen to the middle of the screen as it goes)
  const cam = state.camera, { x: Zx, y: Zy } = swirlAt(pt);
  const Sx = (Zx - cam.x) + (CANVAS_WIDTH / 2 - (Zx - cam.x)) * k, Sy = (Zy - cam.y) + (ZOOM_SY - (Zy - cam.y)) * k;
  return { scale: s, x: (Sx + cam.x - Zx * s) / (1 - s), y: (Sy + cam.y - Zy * s) / (1 - s) };
};

/** Its light, out over the plaza and him (and through the dark after sundown). */
export const portalLights = (pt: Portal | null | undefined): Light[] => {
  if (!pt || pt.walk) return [];
  const k = surgeOf(pt), { x, y } = swirlAt(pt);
  return [{ x, y, r: 260 + 340 * k, a: 0.6 + 0.4 * k, color: pt.land.swirl[2] }, { x, y, r: 150 + 120 * k, a: 1, color: '#FFFFFF' }];
};
/** How much of the hour's dark and grade is left over the hub as it wakes (it floods the place with its light: at
 * night, its glow would otherwise come out grey under the dark). */
export const portalLightAmount = (pt: Portal | null | undefined) => (!pt || pt.walk ? 1 : 1 - 0.65 * surgeOf(pt));

// ---------------------------------------------------------------------------------------------------------------
// The portal waking up (world space, over its own drawing: drawHubBack, before him)

/** The arch's opening, as a path. */
const archPath = (c: Ctx, cx: number) => {
  const top = GROUND_Y - ARCH_TOP;
  c.beginPath(); c.moveTo(cx - ARCH_W, GROUND_Y); c.lineTo(cx - ARCH_W, top + ARCH_W); c.arc(cx, top + ARCH_W, ARCH_W, Math.PI, 0); c.lineTo(cx + ARCH_W, GROUND_Y); c.closePath();
};

const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${clamp(a).toFixed(3)})`;

/** Called before the hub's back's drawn: winds its swirl on (or lets it be). */
export const notePortalSurge = (pt: Portal | null | undefined) => setPortalSurge(pt && !pt.walk ? pt.slot : -1, pt ? pt.phase : 0);

export const drawPortalBack = (c: Ctx, state: GameState, pt: Portal | null | undefined) => {
  if (!pt || pt.walk) return;
  const k = surgeOf(pt), { x: vx, y: vy } = swirlAt(pt), [, mid, hi] = pt.land.swirl;
  const t = pt.t, s = since(pt);
  c.save();
  c.globalCompositeOperation = 'lighter';
  // Light spilling out onto the plaza in front of it: stepped bands, brighter in
  for (let i = 0; i < 4; i++) {
    c.fillStyle = rgba(hi, (0.05 + 0.03 * i) * (0.4 + k));
    c.beginPath(); c.ellipse(vx, GROUND_Y + 16, 170 - i * 34, 30 - i * 6, 0, 0, Math.PI * 2); c.fill();
  }
  // Inside the arch: its middle glowing (stepped), rings pulsing in toward it, the bands flashing as they cycle
  archPath(c, vx); c.clip();
  const pulse = 0.85 + 0.15 * Math.sin(t * 0.4);
  for (let i = 4; i >= 1; i--) { c.fillStyle = rgba(i > 2 ? mid : hi, 0.1 * k * pulse); c.beginPath(); c.ellipse(vx, vy, (16 + i * 20 * (0.6 + k)) * 0.66, 16 + i * 20 * (0.6 + k), 0, 0, Math.PI * 2); c.fill(); }
  c.lineWidth = 6;
  for (let i = 0; i < 5; i++) {
    const u = ((t * (0.012 + 0.03 * k) + i / 5) % 1), r = 190 * (1 - u);
    c.strokeStyle = rgba(i % 2 ? hi : '#FFFFFF', (0.12 + 0.4 * k) * Math.sin(u * Math.PI));
    c.beginPath(); c.ellipse(vx, vy, r * 0.64, r, Math.sin(pt.phase * 0.01) * 0.2, 0, Math.PI * 2); c.stroke();
  }
  // (the core: white hot as it takes him)
  if (s > TAKE - 10) { const w = ease((s - TAKE + 10) / 14); c.fillStyle = rgba('#FFFFFF', 0.85 * w); c.beginPath(); c.ellipse(vx, vy, 20 + 140 * w, 30 + 200 * w, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  void state;
};

// ---------------------------------------------------------------------------------------------------------------
// Him (world space, over the portal): the game's him turning round; then from behind, up into it; then taken

/** Him from behind, painted at 3x his picture's pixels on a canvas of his own (then drawn down to his size here, smoothly:
 * no crawl as the camera pushes in), and the same again solid in the portal's color (for its light coming over him). */
const HI = 3, ME_W = 150, ME_H = 206, ME_FOOT = 12;
let fig: HTMLCanvasElement | null = null, tint: HTMLCanvasElement | null = null;
const pose: BackPose = { step: 0, t: 0, nude: false, shat: false, rim: '#FFFFFF', weapon: null };
let held: import('../../m1/types').WeaponType = 'GUN';
const holdWeapon = (c: Ctx, t: number) => drawHeldWeaponArt(c, held, t);

const paintFigure = (state: GameState, pt: Portal, step: number, col: string) => {
  if (!fig) { fig = document.createElement('canvas'); fig.width = ME_W * HI; fig.height = ME_H * HI; }
  if (!tint) { tint = document.createElement('canvas'); tint.width = ME_W * HI; tint.height = ME_H * HI; }
  const g = fig.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, fig.width, fig.height);
  g.setTransform(HI, 0, 0, HI, 0, 0);
  pose.step = step; pose.t = pt.t; pose.nude = isNude(state); pose.shat = isShat(state); pose.rim = mix(pt.land.swirl[2], '#FFFFFF', 0.35);
  held = state.player.currentWeapon ?? 'GUN'; pose.weapon = holdWeapon;
  drawMeatheadBack(g, ME_W / 2, ME_H - ME_FOOT, pose);
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

export const drawPortalFront = (c: Ctx, state: GameState, pt: Portal | null | undefined) => {
  if (!pt || pt.walk || typeof document === 'undefined') return;
  const s = since(pt);
  if (s < 0) return;
  const { x: vx, y: vy } = swirlAt(pt), [, mid, hi] = pt.land.swirl, k = surgeOf(pt);
  const feet0 = GROUND_Y - 1;
  // Sparkles drawn in off the air, spiraling into its middle (trails behind them)
  const n = Math.round(40 * k);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const L = 46 - 16 * k, u = ((pt.t + (i * L) / 40 + i * 7.3) % L) / L;
    const r0 = 120 + ((i * 53) % 140), a0 = i * 2.39996 + pt.phase * 0.004;
    const at = (uu: number) => { const r = r0 * (1 - uu) ** 1.5, a = a0 + uu * (2.6 + 3 * k); return [vx + Math.cos(a) * r * 0.8, vy + Math.sin(a) * r] as const; };
    const [x, y] = at(u), [tx, ty] = at(Math.max(0, u - 0.07));
    const col = [hi, '#FFFFFF', mid][i % 3];
    c.strokeStyle = rgba(col, 0.5 * Math.sin(u * Math.PI)); c.lineWidth = 2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(x, y); c.stroke();
    c.fillStyle = rgba(col, Math.sin(u * Math.PI));
    const z = (i % 4 === 0 ? 3 : 2);
    c.fillRect(Math.round(x) - z, Math.round(y) - 1, z * 2, 2); c.fillRect(Math.round(x) - 1, Math.round(y) - z, 2, z * 2);
  }
  c.restore();
  // Him
  if (s < TURN_T) {
    // (turning his back on us: edge-on, then round: the game's him narrowing to nothing, his back opening out)
    const u = s / TURN_T, hop = Math.sin(u * Math.PI) * 4;
    if (u < 0.5) drawSideHim(c, state, vx, feet0 - hop, 1 - u * 2);
    else { paintFigure(state, pt, 0, hi); blit(c, fig!, vx, feet0 - hop, S0, (u - 0.5) * 2); }
  } else if (s < TURN_T + IN_T) {
    // (up into it from behind: smaller each step, higher, its light coming over him)
    const u = (s - TURN_T) / IN_T, e = ease(u);
    const feet = feet0 + (vy + 64 - feet0) * e;
    const sc = S0 * (1 - 0.42 * e);
    paintFigure(state, pt, ((s - TURN_T) * Math.PI) / 14, hi);
    blit(c, fig!, vx, feet, sc);
    c.save(); c.globalAlpha = 0.08 + 0.3 * e * e; blit(c, tint!, vx, feet, sc); c.restore();
  } else if (s < TAKE) {
    // (taken: drawn out long and thin into its middle, twisting with it, afterimages pouring in after him)
    const u = (s - TURN_T - IN_T) / PULL_T, e = ease(u);
    const fromFeet = vy + 64, sc = S0 * 0.58 * (1 - 0.85 * e);
    const feet = fromFeet + (vy + (ME_H - ME_FOOT) * sc * 0.5 - fromFeet) * e;
    const sx = 1 - 0.75 * e, sy = 1 + 2.2 * e * (1 - e) + 0.4 * e, rot = Math.sin(pt.phase * 0.02) * 0.4 * e;
    paintFigure(state, pt, ((s - TURN_T) * Math.PI) / 14, hi);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let g = 3; g >= 1; g--) {
      const back = Math.max(0, u - g * 0.09), eb = ease(back);
      const fb = fromFeet + (vy + (ME_H - ME_FOOT) * S0 * 0.58 * (1 - 0.85 * eb) * 0.5 - fromFeet) * eb;
      c.globalAlpha = 0.28 / g; blit(c, tint!, vx, fb + g * 6, S0 * 0.58 * (1 - 0.85 * eb), 1 - 0.75 * eb, 1 + 0.6 * eb, rot * 0.5);
    }
    c.restore();
    c.save(); c.globalAlpha = 1 - e * 0.6; blit(c, fig!, vx, feet, sc, sx, sy, rot); c.restore();
    c.save(); c.globalAlpha = Math.min(1, 0.5 + e); blit(c, tint!, vx, feet, sc, sx, sy, rot); c.restore();
  }
  // The shockwave off it as it takes him
  if (s >= TAKE) {
    const u = (s - TAKE) / WHITE_T;
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [dr, w, col] of [[0, 14, hi], [-10, 6, '#FFFFFF']] as const) {
      const r = Math.max(1, (u * 420 + dr));
      c.strokeStyle = rgba(col, 0.9 * (1 - u)); c.lineWidth = w * (1 - u) + 1;
      c.beginPath(); c.ellipse(vx, vy, r * 0.8, r, 0, 0, Math.PI * 2); c.stroke();
    }
    c.restore();
  }
};

/** Over everything (screen space): the white coming up out of the moment it takes him, then the walk in itself. */
export const drawPortalHud = (c: Ctx, pt: Portal | null | undefined) => {
  if (!pt) return;
  if (pt.walk) { drawPortalWalk(c, pt.walk); return; }
  const s = since(pt);
  if (s < TAKE) return;
  // (the ring gets a moment first: the white eases in behind it)
  const w = clamp((s - TAKE) / WHITE_T);
  const v = [1, 3, 5].map(i => parseInt(pt.land.swirl[2].slice(i, i + 2), 16)).map(x => Math.round(x + (255 - x) * clamp(w * 1.4)));
  c.fillStyle = `rgba(${v[0]}, ${v[1]}, ${v[2]}, ${clamp(w * w * 1.15).toFixed(3)})`;
  c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
};
