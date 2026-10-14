// After the boss: Meathead walking away from what he did, at the camera, his head down over his new toy (Mega Man 2's
// ending walk, done the SNES way). He walks in place; the world goes away behind him: the ground a Mode-7 plane
// rolling off to the horizon under his feet, the wreck behind him shrinking as it goes (sprite scaling), the haze over
// the fires rippling (raster wobble), the fires' palettes cycling, a banded sky, layered parallax, embers, dither, a
// stepped vignette, letterbox bars. Across the top: HEADING BACK TO HUB. Along the bottom (in the bar, nothing over
// the picture): the new weapon, what it does, the break room line, and PRESS [A] TO CONTINUE. It goes on till A.
//
// Each boss has its own version (walkAway/*.ts: the wreck, the time of day, the weapon, the gags). Shared: any boss
// stage plays it after its VICTORY (playWalkAway; tick it, draw it over everything in drawHud; onDone off A).

import type { GameState } from '../m1/game/core/state';
import type { WeaponType } from '../m1/types';
import type { Controls } from '../m1/game/platform/input';
import { CANVAS_WIDTH as W, CANVAS_HEIGHT as H } from '../m1/constants';
import { playSound } from '../m1/game/platform/audio';
import { inputDevice, padFamily } from '../m1/game/platform/device';
import { drawPadFace } from '../m1/game/render/padGlyph';
import { isNude, isShat } from '../m1/game/player/gut';
import { M2_WEAPON_INFO } from './weapons/index';
import { type Ctx, type Prop, type SceneDef, LW, LH, TOP, BOT, HOR, SPEED, STEP, FEET_Y, ME_D, VP_X, ME_X, project, stipple } from './walkAway/kit';
import { lowRes, canvas, drawGround, skyOf, spriteOf, fogAt, vignetteOf, wobble, drawStink, drawTitle, blitPicture, font } from './walkAway/screen';
import { drawMeatheadFront, type Pose } from './walkAway/meathead';
import { ACTS, toyIcon, type ActFx } from './walkAway/acts';
import { SAFARI_ARTIE } from './walkAway/artie';
import { DONNIE_DRACULA } from './walkAway/donnie';
import { SPACE_QUEEN } from './walkAway/spaceQueen';

/** The bosses that have a walk-away (add each boss's SceneDef here). */
export const WALK_AWAY_SCENES = { 'safari-artie': SAFARI_ARTIE, 'donnie-dracula': DONNIE_DRACULA, 'space-queen': SPACE_QUEEN } satisfies Record<string, SceneDef>;
export type WalkAwayBoss = keyof typeof WALK_AWAY_SCENES;

export interface WalkAwayOpts {
  boss: WalkAwayBoss;
  /** Killed by his weakness (the carnage shows it). */
  weakness?: boolean;
  /** A pressed: off it goes (to the hub). */
  onDone: () => void;
  /** The toy he's walking off with, if not the boss's own (the dev preview's &weapon=). */
  weapon?: WeaponType;
}

interface Bit { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; g: number }
export interface WalkAway {
  def: SceneDef; boss: WalkAwayBoss; weakness: boolean; onDone: () => void;
  /** What he's carrying (the boss's weapon, unless the preview says otherwise). */
  weapon: WeaponType | null;
  t: number; done: boolean;
  /** A has to be let go of first (he may have been holding jump when the boss went down). */
  armed: boolean;
  nude: boolean; shat: boolean;
  props: Prop[];
  bits: Bit[]; embers: Bit[];
  lastStep: number; farted: number;
}

/** How long before A does anything (so a mashed jump off the boss's death doesn't skip it unseen). */
/** A few seconds of it before A takes him on (its prompt only up then). */
const A_AFTER = 180;

// Enter on the keyboard counts too (not one of the game's controls)
let enterDown = false;
let keysOn = false;
const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter') enterDown = e.type === 'keydown'; };
const listenKeys = (on: boolean) => {
  if (typeof window === 'undefined' || on === keysOn) return;
  keysOn = on; enterDown = false;
  if (on) { window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey); }
  else { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); }
};

/** Starts it: `state` (if there is one) for how he's dressed (shitty pants, none). */
export const playWalkAway = (state: GameState | null, opts: WalkAwayOpts): WalkAway => {
  const def = WALK_AWAY_SCENES[opts.boss];
  listenKeys(true);
  return {
    def, boss: opts.boss, weakness: !!opts.weakness, weapon: opts.weapon ?? def.weapon, onDone: opts.onDone, t: 0, done: false, armed: false,
    nude: state ? isNude(state) : false, shat: state ? isShat(state) : false,
    props: def.props(!!opts.weakness), bits: [], embers: [], lastStep: 0, farted: 0,
  };
};

export const walkAwayDone = (w: WalkAway) => w.done;

// ---------------------------------------------------------------------------------------------------------------
// His beats: a loop (10 s) of admiring it, turning it over; up to his nose for a sniff; gagging, spitting; grinning.

const CYCLE = 600;
const ease = (k: number) => { const u = Math.max(0, Math.min(1, k)); return u * u * (3 - 2 * u); };

/** His pose: the weapon's own act (walkAway/acts.ts), or the crossbow's (this: turned over, sniffed, gagged on). */
const poseAt = (w: WalkAway): Pose => {
  const act = w.weapon ? ACTS[w.weapon] : undefined;
  if (act) {
    const p: Pose = { step: (w.t * Math.PI) / STEP, t: w.t, wx: 0, wy: 0, rot: 0, turn: 0, face: 'grin', green: 0, headY: 0, nude: w.nude, shat: w.shat, rim: w.def.rim };
    act.pose(w.t, p);
    return p;
  }
  const t = w.t, u = t % CYCLE;
  const step = (t * Math.PI) / STEP;
  // (turning it over: a half turn every 150 frames, 40 frames to do it)
  const turnBase = Math.PI * (Math.floor(t / 150) + ease(((t % 150) - 110) / 40));
  // (up to his face and back)
  const up = u < 210 ? 0 : u < 250 ? ease((u - 210) / 40) : u < 330 ? 1 : u < 370 ? 1 - ease((u - 330) / 40) : 0;
  const home = Math.round(turnBase / (Math.PI * 2)) * Math.PI * 2;
  const turn = turnBase + (home - turnBase) * up;
  const green = u < 285 ? 0 : u < 300 ? (u - 285) / 15 : u < 340 ? 1 : u < 400 ? 1 - (u - 340) / 60 : 0;
  const face: Pose['face'] = u >= 245 && u < 290 ? 'sniff' : u >= 290 && u < 335 ? 'gag' : u >= 450 && u < 500 ? 'chuckle' : u < 210 || u >= 400 ? 'grin' : 'smirk';
  const jolt = face === 'gag' ? (u < 300 ? -2 : (Math.floor(t / 3) % 2) - 1) : face === 'chuckle' ? -(Math.floor(t / 6) % 2) : 0;
  return {
    step, t,
    wx: -11 * up, wy: -102 + (-124 + 102) * up + (face === 'chuckle' ? -(Math.floor(t / 6) % 2) : 0),
    rot: 0.05 * Math.sin(t * 0.03) * (1 - up) + -1.25 * up, turn,
    face, green, headY: jolt + (up > 0.5 ? -1 : 0),
    nude: w.nude, shat: w.shat, rim: w.def.rim,
  };
};

// ---------------------------------------------------------------------------------------------------------------

/** A frame. `controls`: the stage's (A is jump); left out, only Enter counts (the dev preview reads the pad itself). */
export const tickWalkAway = (w: WalkAway, controls?: Controls | null, padA = false) => {
  if (w.done) return;
  w.t++;
  const t = w.t, u = t % CYCLE;
  // (his footsteps)
  const stepN = Math.floor((t + STEP / 2) / STEP);
  if (stepN !== w.lastStep) { w.lastStep = stepN; playSound('land', 0.18, -5 + (stepN % 2)); }
  const act = w.weapon ? ACTS[w.weapon] : undefined;
  if (act) act.tick?.(t, t % act.cycle, actFx(w));
  // (the crossbow's: the sniff, the gag and the spit)
  else if (u === 255 || u === 272) playSound('whoosh', 0.12, 9);
  if (!act && u === 318) {
    playSound('barf', 0.35, 3);
    const [mx, my] = mouthAt(w);
    for (let i = 0; i < 14; i++) w.bits.push({ x: mx + 2, y: my, vx: 0.8 + Math.random() * 1.8, vy: -0.8 + Math.random() * 1.2, life: 0, max: 40 + Math.random() * 20, col: ['#A3B320', '#C5D33B', '#7C8A12'][i % 3], g: 0.12 });
  }
  // (Artie's last one, the once or twice it's in earshot)
  if (w.boss === 'safari-artie' && !w.weakness && t % 260 === 1 && w.farted < 2 && t > 100) { w.farted++; playSound('fart', 0.18, -2); }
  w.bits = w.bits.filter(b => { b.life++; b.x += b.vx; b.y += b.vy; b.vy += b.g; return b.life < b.max && b.y < FEET_Y + 4; });
  // (embers up off the fires, drifting across)
  if (w.def.embers && Math.random() < 0.35) w.embers.push({ x: Math.random() * LW, y: LH + 4, vx: 0.2 + Math.random() * 0.5, vy: -0.4 - Math.random() * 0.7, life: 0, max: 200 + Math.random() * 160, col: '', g: Math.random() * 6 });
  w.embers = w.embers.filter(e => { e.life++; e.x += e.vx + Math.sin(e.life * 0.05 + e.g) * 0.3; e.y += e.vy; return e.life < e.max && e.y > -4; });
  // A: off (a fresh press, once it's had a moment)
  const a = !!controls?.jump || enterDown || padA;
  if (!a) w.armed = true;
  else if (w.armed && t > A_AFTER) {
    w.done = true; listenKeys(false);
    playSound('menuok', 0.8);
    w.onDone();
  }
};

/** What an act sets off: its sounds, its spatter (his frame to the picture's). */
const actFx = (w: WalkAway): ActFx => ({
  sound: (type, vol, pitch = 0) => playSound(type, vol, pitch),
  bit: (x, y, vx, vy, col, g = 0.12, life = 40) => { w.bits.push({ x: LW / 2 + x, y: FEET_Y + y, vx, vy, life: 0, max: life, col, g }); },
});

/** Where his mouth is (the picture), this frame. */
let lastMouth: [number, number] = [LW / 2, FEET_Y - 156];
const mouthAt = (_w: WalkAway) => lastMouth;

// ---------------------------------------------------------------------------------------------------------------
// Drawing (the shared machinery: walkAway/screen.ts)

/** The picture, in its own pixels. */
const drawScene = (c: Ctx, w: WalkAway) => {
  const { def, t } = w;
  const travel = SPEED * t;
  const step = (t * Math.PI) / STEP;
  const sway = Math.sin(step * 0.5) * 2;
  c.imageSmoothingEnabled = false;
  drawGround(c, def, travel, sway, VP_X, ME_X);
  c.drawImage(skyOf(), 0, 0);
  def.back(c, t, sway, w.weakness);
  // The wreck, far to near, him in among it
  const LOOP = 30;
  const items: { d: number; p: Prop | null }[] = [{ d: ME_D, p: null }];
  for (const p of w.props) {
    // (litter comes round again: back in at the bottom edge of the picture, low things only, so it isn't seen to pop)
    const d = p.wrap ? ((((p.z + travel) % LOOP) + LOOP) % LOOP) + 2.1 : p.z + travel;
    if (d > 0.6 && d < 400) items.push({ d, p });
  }
  items.sort((a, b) => b.d - a.d);
  let heated = false;
  const heat: [number, number, number, number][] = [];
  for (const { d, p } of items) {
    if (!p) {
      // (the haze over the fires rippling, everything behind him)
      if (def.ripple !== false) wobble(c, 0, HOR - 46, LW, 52, t, 1);
      for (const [x, y, ww, hh] of heat) wobble(c, x, y, ww, hh, t, 1.5);
      heated = true;
      const pose = poseAt(w);
      const marks = drawMeatheadFront(c, LW / 2, FEET_Y, pose, def.grip, def.drawWeapon);
      lastMouth = marks.mouth;
      continue;
    }
    if (p.wrap && d > 32) continue;
    const { sx, sy, s } = project(p.x, d, sway);
    const pw = p.w * s, ph = p.h * s;
    if (sx + pw / 2 < -40 || sx - pw / 2 > LW + 40) continue;
    if (p.paint && pw >= 1) {
      c.drawImage(spriteOf(def, p, fogAt(d)), Math.round(sx - pw / 2), Math.round(sy - ph), Math.max(1, Math.round(pw)), Math.max(1, Math.round(ph)));
    }
    p.live?.(c, sx, sy, s, t);
    if (p.heat && !heated) heat.push([sx - pw * 0.6, Math.max(0, sy - ph - s * 6), pw * 1.2, ph + s * 6]);
  }
  // His stink (shitty pants): the flies on him, the wavy lines up off him
  if (w.shat) drawStink(c, LW / 2, FEET_Y, t);
  // The spit, the embers
  for (const b of w.bits) { c.fillStyle = b.col; c.fillRect(Math.round(b.x), Math.round(b.y), 2, 2); }
  if (def.embers) for (const e of w.embers) {
    const col = def.embers[Math.floor(e.life / 5 + e.g) % def.embers.length];
    c.fillStyle = col; c.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
    if ((e.life >> 3) % 3 === 0) { c.fillStyle = stipple(c, col); c.fillRect(Math.round(e.x) - 1, Math.round(e.y) - 1, 3, 3); }
  }
  c.drawImage(vignetteOf(), 0, 0);
};

// ---------------------------------------------------------------------------------------------------------------
// The words

const TITLE = 'HEADING BACK TO HUB';

/** Words cut to lines of `n` characters at most. */
const wrap = (s: string, n: number) => {
  const out: string[] = []; let line = '';
  for (const word of s.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > n) { out.push(line); line = word; } else line = (line + ' ' + word).trim();
  }
  if (line) out.push(line);
  return out;
};
/** The blurb's room: two lines across the bar (24 px in from each side), 7 px characters at most (Press Start 2P is
 *  monospaced: a character's as wide as the font's size). */
const BLURB_CHARS = Math.floor((W - 48) / 7);
/** What it does, in two lines: the scene's own, the weapon's walk-away blurb, or its whole description if that fits.
 *  Never cut off: a description too long for two lines without a short blurb is a bug (the dev check warns). */
export const blurbOf = (def: SceneDef, weapon: WeaponType | null = def.weapon) => {
  if (def.blurb && weapon === def.weapon) return def.blurb.slice(0, 2);
  const info = weapon ? M2_WEAPON_INFO[weapon] : undefined;
  if (!info) return ['IT WAS HIS. NOW IT IS YOURS.'];
  for (const text of [info.description, info.blurb]) {
    if (!text) continue;
    const lines = wrap(text.toUpperCase(), BLURB_CHARS);
    if (lines.length <= 2) return lines;
  }
  return wrap((info.blurb ?? info.description).toUpperCase(), BLURB_CHARS).slice(0, 2);
};
const nameOf = (w: WalkAway) => (w.weapon ? M2_WEAPON_INFO[w.weapon]?.name : undefined) ?? w.def.weaponName ?? 'NEW WEAPON';
/** The toy's little picture by its name: the scene's own drawing of it, or the act's. */
const iconOf = (w: WalkAway) => (w.weapon && w.weapon !== w.def.weapon ? toyIcon(w.weapon) : null) ?? w.def.drawWeapon;

const drawBottom = (c: Ctx, w: WalkAway) => {
  const { def, t } = w;
  const y0 = BOT;
  const k = Math.min(1, Math.max(0, (t - 40) / 20));
  if (k <= 0) return;
  c.save();
  c.globalAlpha = k;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  // (the toy, small, beside its name)
  c.save(); c.translate(48, y0 + 22); c.scale(0.75, 0.75); c.imageSmoothingEnabled = false; iconOf(w)(c, t); c.restore();
  c.font = font(8); c.fillStyle = '#A1A1AA'; c.fillText('NEW WEAPON', 84, y0 + 18);
  c.font = font(10); c.fillStyle = '#000'; c.fillText(nameOf(w), 85, y0 + 33); c.fillStyle = '#FACC15'; c.fillText(nameOf(w), 84, y0 + 32);
  c.font = font(7); c.fillStyle = '#E4E4E7';
  blurbOf(def, w.weapon).forEach((line, i) => c.fillText(line, 24, y0 + 52 + i * 12));
  c.fillStyle = '#7DD3FC'; c.fillText('HEAD TO THE EMPLOYEE BREAK ROOM TO TEST YOUR NEW TOY', 24, y0 + 90);
  c.restore();
  // PRESS [A] TO CONTINUE (bottom right; pulsing once it'll take it)
  if (t > A_AFTER) {
    c.save();
    const pulse = 0.75 + 0.25 * Math.sin(t * 0.12);
    c.globalAlpha = Math.min(1, (t - A_AFTER) / 15) * pulse;
    c.font = font(8); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    const y = y0 + 90, xR = W - 20;
    const tail = 'TO CONTINUE', wTail = c.measureText(tail).width, wPress = c.measureText('PRESS').width;
    const pad = inputDevice() === 'pad';
    c.font = font(6);
    const keyW = pad ? 18 : Math.max(26, c.measureText('SPACE').width + 8);
    c.font = font(8);
    let x = xR - wTail - 8 - keyW - 8 - wPress;
    c.fillStyle = '#F8FAFC'; c.fillText('PRESS', x, y); x += wPress + 8;
    if (pad) drawPadFace(c, x + 9, y - 4, 9, 'A', padFamily());
    else {
      c.fillStyle = '#E4E4E7'; c.beginPath(); c.roundRect(x, y - 11, keyW, 14, 2); c.fill();
      c.strokeStyle = '#52525B'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#A1A1AA'; c.fillRect(x + 1, y + 1, keyW - 2, 2);
      c.font = font(6); c.fillStyle = '#18181B'; c.textAlign = 'center'; c.fillText('SPACE', x + keyW / 2, y - 1); c.textAlign = 'left'; c.font = font(8);
    }
    x += keyW + 8;
    c.fillStyle = '#F8FAFC'; c.fillText(tail, x, y);
    c.restore();
  }
};

/** Draws it over the whole screen (call it from the stage's drawHud, screen space, last). */
export const drawWalkAway = (c: Ctx, w: WalkAway) => {
  if (typeof document === 'undefined') return;
  const pic = lowRes();
  drawScene(pic.c, w);
  // (the picture up between the bars, the lens's ghosts if the scene has its sun up: screen.ts)
  blitPicture(c, pic.cv);
  // The line under the title: where he's leaving
  c.textAlign = 'center';
  drawTitle(c, w.t, TITLE);
  if (w.t > 60) { c.font = font(7); c.fillStyle = '#A78BFA'; c.textAlign = 'center'; c.fillText(`${w.def.land} - CLEARED`, W / 2, 56); c.textAlign = 'left'; }
  drawBottom(c, w);
  // In: an iris opening out from him (the first half second)
  if (w.t < 30) {
    const r = ((w.t / 30) ** 2) * 560;
    c.fillStyle = '#000';
    c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, TOP + (FEET_Y - 90) * 2, Math.max(0, r), 0, Math.PI * 2, true); c.fill('evenodd');
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Dev: ?walkaway=artie (or =donnie, =queen; &weak for his weakness death; &shat, &nude; &weapon=MALLET for another
// weapon's act on the boss's walk) plays it on its own over the page, again and again.

export const devPreviewWalkAway = () => {
  if (typeof document === 'undefined') return;
  const q = new URLSearchParams(location.search);
  const cv = canvas(W, H);
  Object.assign(cv.style, { position: 'fixed', inset: '0', margin: 'auto', zIndex: '9999', background: '#000', imageRendering: 'pixelated', maxWidth: '100vw', maxHeight: '100vh', aspectRatio: '4 / 3', width: 'min(100vw, 133.33vh)' });
  document.body.appendChild(cv);
  const c = cv.getContext('2d')!;
  let jumpDown = false;
  window.addEventListener('keydown', e => { if (e.key === ' ') jumpDown = true; });
  window.addEventListener('keyup', e => { if (e.key === ' ') jumpDown = false; });
  const start = () => {
    const which = q.get('walkaway');
    const boss: WalkAwayBoss = which === 'donnie' ? 'donnie-dracula' : which === 'queen' || which === 'space' ? 'space-queen' : 'safari-artie';
    const weapon = (q.get('weapon')?.toUpperCase() || undefined) as WeaponType | undefined;
    const w = playWalkAway(null, { boss, weapon: weapon && M2_WEAPON_INFO[weapon] ? weapon : undefined, weakness: q.has('weak'), onDone: () => setTimeout(() => { cur = start(); }, 400) });
    w.shat = q.has('shat'); w.nude = q.has('nude');
    return w;
  };
  let cur = start();
  (window as unknown as { __walkAway: () => WalkAway }).__walkAway = () => cur;
  const frame = () => {
    const pad = navigator.getGamepads?.().find(p => p);
    tickWalkAway(cur, { left: false, right: false, up: false, down: false, jump: jumpDown, special: false, shoot: false }, !!pad?.buttons[0]?.pressed);
    drawWalkAway(c, cur);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
