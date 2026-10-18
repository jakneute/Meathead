// Into a land through its portal: the walk-away's other half (walkAway.ts), the other way round. Confirming a portal
// at the hub (hub/portal.ts), the camera pushes in on it as he walks up into the swirl and it takes him,
// the swirl goes white, and out of the white: him from behind, walking away from the camera up the way into the land,
// the land's entrance coming up ahead, the world coming at the camera under him (the Mode-7 ground, the scaled
// sprites), him a little smaller with every step (he's out-walking it). Across the top: HEADING TO <LAND>. Seven
// seconds or so of it, then the SNES's way out: the picture breaks up into mosaic blocks as an iris closes down on him, to
// black; and in the land, the iris opens on him there, in the side view, the blocks resolving (portalArrival.ts). It
// flows on by itself (no A to continue); A or the skip skips the whole of it (the hub runs that).
//
// Each land has its own version (walkAway/into*.ts: a PortalDef): add it to PORTAL_SCENES.

import type { GameState } from '../m1/game/core/state';
import type { WeaponType } from '../m1/types';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import { playSound } from '../m1/game/platform/audio';
import { drawSkipPrompt } from '../m1/game/platform/skip';
import { drawHeldWeaponArt } from '../m1/game/render/player/player';
import { isNude, isShat } from '../m1/game/player/gut';
import { type Ctx, type Prop, type PortalDef, LW, TOP, BOT, HOR, F, CAM_H, STEP, ME_D, project } from './walkAway/kit';
import { lowRes, canvas, drawGround, skyOf, spriteOf, fogAt, vignetteOf, drawStink, drawTitle, blitPicture, font, iris, mosaic } from './walkAway/screen';
import { drawMeatheadBack, type BackPose } from './walkAway/meatheadBack';
import { INTO_ADVENTURE } from './walkAway/intoAdventure';
import { INTO_SPOOKY } from './walkAway/intoSpooky';
import { INTO_SPACE } from './walkAway/intoSpace';
import { INTO_HOLLYWOOD } from './walkAway/intoHollywood';
import { INTO_FOREIGN } from './walkAway/intoForeign';
import { INTO_FRONTIER } from './walkAway/intoFrontier';

/** The lands that have a walk in (add each land's PortalDef here, by its lands.ts id). */
export const PORTAL_SCENES: Record<string, PortalDef> = { adventure: INTO_ADVENTURE, spooky: INTO_SPOOKY, space: INTO_SPACE, hollywood: INTO_HOLLYWOOD, foreign: INTO_FOREIGN, frontier: INTO_FRONTIER };
export const hasPortalWalk = (land: string) => land in PORTAL_SCENES;

/** How fast the camera comes on up the path (m a frame); how much faster he goes (he pulls away from it). */
const CAM_V = 0.02, OUTWALK = 0.0014;
/** Frames: out of the white; the iris starts closing (about seven seconds of walk: time to read the bottom bar);
 * closed; done (a beat of black). */
const FLASH_T = 22, CLOSE_AT = 400, CLOSE_T = 40, DONE_AT = CLOSE_AT + CLOSE_T + 8;
/** The ground runs off straight ahead (to the middle of the picture); his path down it a little to the left of the
 * camera (we're over his right shoulder: what he's walking at's in sight past him), meters across. */
const VP = LW / 2, PATH_X = (-52 * ME_D) / F;

export interface PortalWalkOpts {
  land: string;
  /** Out of a white flash (the portal's), not the iris. */
  flash?: boolean;
  /** It's over (black): off to the land. */
  onDone: () => void;
}

export interface PortalWalk {
  def: PortalDef; land: string; onDone: () => void;
  t: number; done: boolean; flash: boolean;
  nude: boolean; shat: boolean; weapon: WeaponType | null;
  props: Prop[];
  lastStep: number;
}

/** Starts it: `state` (if there is one) for how he's dressed, and what he's carrying. */
export const playPortalWalk = (state: GameState | null, opts: PortalWalkOpts): PortalWalk => {
  const def = PORTAL_SCENES[opts.land] ?? INTO_ADVENTURE;
  return {
    def, land: opts.land, onDone: opts.onDone, t: 0, done: false, flash: !!opts.flash,
    nude: state ? isNude(state) : false, shat: state ? isShat(state) : false,
    weapon: state ? state.player.currentWeapon ?? 'GUN' : 'GUN',
    props: def.props(), lastStep: 0,
  };
};

export const portalWalkDone = (w: PortalWalk) => w.done;

export const tickPortalWalk = (w: PortalWalk) => {
  if (w.done) return;
  w.t++;
  const t = w.t;
  // (his footsteps, getting quieter as he goes)
  const stepN = Math.floor((t + STEP / 2) / STEP);
  if (stepN !== w.lastStep && t < CLOSE_AT + CLOSE_T) { w.lastStep = stepN; playSound('land', 0.18 * (1 - t / (DONE_AT * 1.6)), -5 + (stepN % 2)); }
  if (t === CLOSE_AT) playSound('whoosh', 0.25, -6);
  if (t >= DONE_AT) { w.done = true; w.onDone(); }
};

// ---------------------------------------------------------------------------------------------------------------
// Him, from behind, in his own picture pixels: drawn at full size on a canvas of his own, then scaled the SNES's way
// (nearest pixels: the picture's own sprite scaling, the same as the props'), here and at the hub

/** His canvas: wide enough for his arms and what's hanging off his left fist, his feet `ME_FOOT` up from its bottom. */
const ME_W = 150, ME_H = 206, ME_FOOT = 12;
let meCv: HTMLCanvasElement | null = null;
const backPose: BackPose = { step: 0, t: 0, nude: false, shat: false, rim: '#FFFFFF', weapon: null };
let poseWeapon: WeaponType = 'GUN';
const holdWeapon = (c: Ctx, t: number) => drawHeldWeaponArt(c, poseWeapon, t);

/**
 * Him from behind, his feet at (x, y) on `c` (in whatever units it's in), `scale` of those a picture pixel. Walking:
 * `step` (radians: a step every π). `alpha`: how much of him's left (going into the swirl).
 */
export const drawBackFigure = (c: Ctx, x: number, y: number, scale: number, o: { step: number; t: number; nude: boolean; shat: boolean; weapon: WeaponType | null; rim: string; alpha?: number }) => {
  if (typeof document === 'undefined' || scale <= 0) return;
  if (!meCv) meCv = canvas(ME_W, ME_H);
  const g = meCv.getContext('2d')!;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, ME_W, ME_H); g.imageSmoothingEnabled = false;
  backPose.step = o.step; backPose.t = o.t; backPose.nude = o.nude; backPose.shat = o.shat; backPose.rim = o.rim;
  poseWeapon = o.weapon ?? 'GUN'; backPose.weapon = o.weapon ? holdWeapon : null;
  drawMeatheadBack(g, ME_W / 2, ME_H - ME_FOOT, backPose);
  c.save();
  c.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) c.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  const w = ME_W * scale, h = ME_H * scale;
  c.drawImage(meCv, Math.round(x - w / 2), Math.round(y - (ME_H - ME_FOOT) * scale), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The picture

const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };
/** How far he is from the camera (m), and so where his feet are and how big he is. */
const meAt = (t: number) => {
  const d = ME_D + OUTWALK * t;
  return { d, x: VP + (F * PATH_X) / d, feet: HOR + (F * CAM_H) / d, s: ME_D / d };
};

const items: { d: number; p: Prop | null }[] = [];
const byFar = (a: { d: number }, b: { d: number }) => b.d - a.d;

const drawScene = (c: Ctx, w: PortalWalk) => {
  const { def, t } = w;
  const travel = CAM_V * t;
  const step = (t * Math.PI) / STEP;
  const sway = Math.sin(step * 0.5) * 2;
  c.imageSmoothingEnabled = false;
  // (the ground coming at the camera: the tile slides toward us)
  drawGround(c, def, -travel, sway, VP, PATH_X);
  c.drawImage(skyOf(), 0, 0);
  def.back(c, t, sway);
  // Along the way, far to near, him in among it
  const me = meAt(t);
  items.length = 0;
  items.push({ d: me.d, p: null });
  for (const p of w.props) { const d = p.z - travel; if (d > 0.6 && d < 400) items.push({ d, p }); }
  items.sort(byFar);
  for (const { d, p } of items) {
    if (!p) {
      drawBackFigure(c, me.x + sway * 0.2, me.feet, me.s, { step, t, nude: w.nude, shat: w.shat, weapon: w.weapon, rim: def.rim() });
      continue;
    }
    const { sx, sy, s } = project(PATH_X + p.x, d, sway, VP);
    const pw = p.w * s, ph = p.h * s;
    if (sx + pw / 2 < -40 || sx - pw / 2 > LW + 40) continue;
    if (p.paint && pw >= 1) c.drawImage(spriteOf(def, p, fogAt(d)), Math.round(sx - pw / 2), Math.round(sy - ph), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
    p.live?.(c, sx, sy, s, t);
  }
  // His stink (shitty pants)
  if (w.shat) drawStink(c, me.x, me.feet, t, me.s);
  def.front?.(c, t, sway, travel);
  c.drawImage(vignetteOf(), 0, 0);
};

/** Along the bottom bar: where he's going. */
const drawBottom = (c: Ctx, w: PortalWalk) => {
  const k = Math.min(1, Math.max(0, (w.t - 40) / 20));
  if (k <= 0) return;
  c.save();
  c.globalAlpha = k;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = font(8); c.fillStyle = '#A1A1AA'; c.fillText('NOW ENTERING', 24, BOT + 24);
  c.font = font(7); c.fillStyle = '#E4E4E7';
  w.def.lines.slice(0, 2).forEach((line, i) => c.fillText(line, 24, BOT + 48 + i * 14));
  c.restore();
};

/** Draws it over the whole screen (from the hub's drawHud: screen space, last). */
export const drawPortalWalk = (c: Ctx, w: PortalWalk, skippable = true) => {
  if (typeof document === 'undefined') return;
  const pic = lowRes();
  drawScene(pic.c, w);
  // (going: the picture breaking up into blocks as the iris closes)
  const close = Math.max(0, Math.min(1, (w.t - CLOSE_AT) / CLOSE_T));
  if (close > 0) mosaic(pic.c, 1 + Math.floor(close * close * 9));
  blitPicture(c, pic.cv);
  drawTitle(c, w.t, `HEADING TO ${w.def.land}`);
  drawBottom(c, w);
  // (the skip, up in the corner of the top bar)
  if (skippable && close < 1) { c.save(); c.translate(0, -30); drawSkipPrompt(c, W); c.restore(); }
  // In: out of the portal's white, or an iris opening out from him
  const me = meAt(w.t), cx = me.x * 2, cy = TOP + (me.feet - 100 * me.s) * 2;
  if (w.flash && w.t < FLASH_T) { c.fillStyle = `rgba(255, 255, 255, ${(1 - ease(w.t / FLASH_T)).toFixed(3)})`; c.fillRect(0, 0, W, H); }
  else if (!w.flash && w.t < 30) iris(c, cx, cy, ((w.t / 30) ** 2) * 560, 0, 0, W, H);
  // Out: the iris closing down on him, to black
  if (close > 0) iris(c, cx, cy, (1 - ease(close)) * 520, 0, 0, W, H);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dev: ?portal (&shat, &nude; &weapon=CROSSBOW; ?tod= for the hour) plays it on its own over the page, again and again.

export const devPreviewPortalWalk = () => {
  if (typeof document === 'undefined') return;
  const q = new URLSearchParams(location.search);
  const cv = canvas(W, H);
  Object.assign(cv.style, { position: 'fixed', inset: '0', margin: 'auto', zIndex: '9999', background: '#000', imageRendering: 'pixelated', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '4 / 3', width: 'min(100vw, 133.33vh)' });
  document.body.appendChild(cv);
  const c = cv.getContext('2d')!;
  const start = (): PortalWalk => {
    const w = playPortalWalk(null, { land: q.get('portal') || 'adventure', flash: true, onDone: () => setTimeout(() => { cur = start(); }, 400) });
    w.shat = q.has('shat'); w.nude = q.has('nude');
    w.weapon = (q.get('weapon') as WeaponType | null) ?? 'GUN';
    return w;
  };
  let cur = start();
  (window as unknown as { __portalWalk: () => PortalWalk }).__portalWalk = () => cur;
  const frame = () => {
    tickPortalWalk(cur);
    drawPortalWalk(c, cur, false);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
