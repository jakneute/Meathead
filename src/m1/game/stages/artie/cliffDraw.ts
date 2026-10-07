// Skied off into a crevasse (short of the far side, past getting back up onto it): the Wile E. Coyote. He sails off
// the kicker still in his tuck, cool as anything, and just stops, out over the middle of it, in the air. Cut in on his
// face: he glances down; the brows go up; he looks round, slowly, straight at us. A blink. A bead of sweat. A gulp. A
// little wave, bye-bye. Back out: he's gone, straight down, in a streak, a puff of snow hanging where he was, and his
// skis, still hanging there in the air without him, a beat, before they follow. Then straight down the crack from
// above: him getting smaller and smaller, tumbling, the skis after him, into the black; a long wait; a tiny puff, and a
// thud, a long way down. Up out of the dark, echoing, "I'M OKAY!" And when he's said it, the lip he went off cracks,
// breaks away, and goes down after him: a bigger puff, a bigger thud. The dust settling. Then the death message.
//
// Drawn over everything, screen space (800 x 600), timed by the death scene's clock (see ski.ts, offTheCliff).

import type { GameState } from '../../core/state';
import type { SoundType } from '../../../types';
import type { MeatheadDeath } from '../../player/deathAnim';
import type { DeathFace } from '../../render/player/deathFace';
import { body } from '../../render/player/deathAnim';
import { bandedGradient, pixelBlob, checker, hazeBands } from '../../render/pixelArt';
import { INK, ink, eye } from '../../render/npc/kit';
import { skinTone, skinShadow, skinHighlight, wristbandColor, stubbleColor } from '../../render/player/body';
import { say, MEATHEAD_VOICE } from '../../platform/speech';
import { isShat } from '../../player/gut';
import { pineTier } from './draw';
import { drawHisSki } from './skiDraw';

type Ctx = CanvasRenderingContext2D;
type Play = (s: SoundType, vol?: number, pitch?: number) => void;

/** Where it's got to (the parts of it that wait on him: his line from the bottom, and the lip going after it). */
export interface Cliff {
  /** His line up out of the crevasse: what it is, waiting for it to start, being said, and (with no voice for it) till when it's up. */
  line: string;
  waiting: boolean;
  talking: boolean;
  lineUntil: number;
  /** When the lip breaks away and goes down after him (0: not yet), and when the scene's over (0: not known yet). */
  slabAt: number;
  endAt: number;
}
export const newCliff = (): Cliff => ({ line: '', waiting: false, talking: false, lineUntil: 0, slabAt: 0, endAt: 0 });

/** The beats: the sail off the lip (then hanging there); in on his face (the glance down, the look round at us, the
 * blink, the sweat, the gulp, the wave); back out (the drop, the skis left hanging, then going); down the shaft (him
 * shrinking into it, the far-off landing, his line up out of it). The lip going after him waits on his line. */
export const SAIL = 24, CLOSE = 58, GLANCE = CLOSE + 12, LOOK = CLOSE + 36, BLINK = LOOK + 16, SWEAT = LOOK + 22, GULP = LOOK + 32, WAVE = LOOK + 40, CLOSE_END = WAVE + 30;
export const ZIP = CLOSE_END + 12, SKIS_GO = ZIP + 18, SHAFT = SKIS_GO + 24, LAND = SHAFT + 46, ECHO = LAND + 26;
/** (after his line) the crack before the lip goes, how long it takes to get to the bottom, and how long it's held after. */
const SLAB_WAIT = 16, SLAB_FALL = 34, AFTER = 70;
/** The death scene's length to start with: it's cut to the real end once that's known (Cliff.endAt). */
export const CLIFF_OPEN_END = 100000;

const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const P = 2;
const snap = (v: number) => Math.round(v / P) * P;

/** The lines up out of the bottom (his pants have something to add, when they're shat). */
const OKAY_LINE = "I'M OKAY!";
const OKAY_SHAT_LINE = "I'M OKAY! ...MY PANTS AREN'T.";

// ---------------------------------------------------------------------------
// Its sounds and its waits
// ---------------------------------------------------------------------------

/** Each frame of it: its sounds on its beats; his line up out of the crevasse; the lip going once he's said it. */
export const tickCliff = (state: GameState, c: Cliff, t: number, play: Play) => {
  if (t === 1) play('whoosh', 0.8, -4);
  // (then nothing at all, hanging there: the eyes, the blink and the gulp are the only sounds)
  if (t === GLANCE) play('click', 0.35, 6);
  if (t === LOOK) play('click', 0.35, 2);
  if (t === BLINK) play('click', 0.2, 12);
  if (t === GULP) play('glug', 0.6, 8);
  if (t === ZIP) play('whoosh', 1, 8);
  if (t === SKIS_GO) play('whoosh', 0.5, 4);
  // (down the shaft: the whoosh of him going, fainter and lower as he goes, then the far-off landing, and his skis on him)
  if (t >= SHAFT && t < LAND && (t - SHAFT) % 10 === 0) { const k = (t - SHAFT) / (LAND - SHAFT); play('whoosh', 0.7 - k * 0.55, 4 - k * 10); }
  if (t === LAND) { play('thud', 0.4, -12); play('crunch', 0.3, -10); }
  if (t === LAND + 8 || t === LAND + 13) play('clink', 0.2, -2);
  if (t === ECHO) {
    const text = isShat(state) ? OKAY_SHAT_LINE : OKAY_LINE;
    c.line = text; c.waiting = true;
    const said = say(text, MEATHEAD_VOICE, 'urgent', {
      always: true,
      onShow: spoken => { c.waiting = false; c.talking = spoken; if (!spoken) c.lineUntil = (state.deathScene?.t ?? ECHO) + 100; },
      onHide: () => { c.talking = false; },
    });
    if (!said) { c.waiting = false; c.lineUntil = t + 100; }
  }
  // (the lip holds till he's said it: nobody gets talked over, not even by a cornice)
  if (t > ECHO && !c.slabAt) {
    if (c.waiting && t > ECHO + 90) c.waiting = false;
    if ((!c.waiting && !c.talking && t >= c.lineUntil) || t > ECHO + 900) c.slabAt = t + SLAB_WAIT;
  }
  if (c.slabAt && t === c.slabAt) { play('crack', 1); play('rumble', 0.5, -4); }
  if (c.slabAt && t === c.slabAt + SLAB_FALL) {
    play('thud', 0.7, -14); play('crunch', 0.5, -12);
    c.endAt = t + AFTER;
    if (state.deathScene) state.deathScene.len = c.endAt;
  }
};

// ---------------------------------------------------------------------------
// The scene
// ---------------------------------------------------------------------------

export const drawCliffDeath = (ctx: Ctx, state: GameState, c: Cliff, t: number) => {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (t < CLOSE || (t >= CLOSE_END && t < SHAFT)) drawLip(ctx, state, t);
  else if (t < CLOSE_END) drawCloseUp(ctx, t);
  else drawShaft(ctx, state, c, t);
  // (and it dims at the end, for the message)
  const out = c.endAt ? clamp01((t - (c.endAt - 20)) / 20) : 0;
  if (out > 0) hazeBands(ctx, 0, 0, 800, 600, '#000000', out * 0.5, out * 0.7, 4);
  ctx.restore();
};

/** Him, his feet at (x, y), s times life size, on his skis in the air (his tuck), the face given (his own scowl, unset). */
const him = (ctx: Ctx, state: GameState, x: number, y: number, s: number, face: DeathFace | undefined, sx = 1, sy = 1, skiing = true) => {
  const d: MeatheadDeath = { kind: 'crash', x: 0, y: 0, facing: 1 };
  ctx.save();
  ctx.translate(x, y); ctx.scale(s * sx, s * sy);
  body(ctx, { ...state, blocks: [], groundRuns: [], camera: { x: 0, y: 0 } } as GameState, d, state.player.currentWeapon, { skiing, isGrounded: false, vel: { x: 0, y: 0 }, deathFace: face });
  ctx.restore();
};

/** His skis under him (the pair side by side: one, the way they're drawn under him), feet at (x, y), s times life size. */
const skisUnder = (ctx: Ctx, x: number, y: number, s: number, rot = -0.15) => {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(rot); drawHisSki(ctx); ctx.restore();
};

/** A distant range across at `base`: jagged peaks `amp` high, filled, its crests lit, snow on the tops. */
const range = (ctx: Ctx, base: number, amp: number, col: string, crest: string, snowCol: string, seed: number) => {
  const yAt = (x: number) => snap(base - hash(Math.floor(x / 60) + seed) * amp * 0.6 - Math.abs(Math.sin(x * 0.011 + seed)) * amp * 0.5);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 600);
  for (let x = 0; x <= 800; x += 30) ctx.lineTo(x, yAt(x));
  ctx.lineTo(800, 600); ctx.closePath(); ctx.fill();
  // (snow on the peaks: down from the crest a way, where it's high)
  ctx.fillStyle = snowCol;
  for (let x = 0; x < 800; x += P) { const y = yAt(x), h = snap(Math.max(0, base - amp * 0.35 - y) * 0.6); if (h > 0) ctx.fillRect(x, y, P, h); }
  ctx.fillStyle = crest; for (let x = 0; x < 800; x += P) ctx.fillRect(x, yAt(x), P, P);
};

/** The sky up here and the mountains across the way (the lip shot and the close-up share it). */
const skyAndRanges = (ctx: Ctx, horizon: number) => {
  bandedGradient(ctx, 0, 0, 800, horizon + 40, ['#5B9BEA', '#7DB3F4', '#93C5FD', '#B7D9FD', '#E0F2FE'], 12);
  range(ctx, horizon - 10, 150, '#8DA2C4', '#B6C6E0', '#EEF4FB', 3);
  range(ctx, horizon + 30, 110, '#6A7FA6', '#93A6C8', '#DCE6F3', 11);
  hazeBands(ctx, 0, horizon - 60, 800, 100, '#E0F2FE', 0, 0.35, 5);
};

// ---- The lip, from the side --------------------------------------------------------------------------------------

/** The kicker's lip (the near side), the far side (lower, and out of reach), and where he hangs, out over the middle. */
const LIP = { x: 250, y: 338 }, FAR = { x: 602, y: 374 }, HANG = { x: 426, y: 300 };
/** The near side's top, left to right: the run down to the kicker, up it to the lip. */
const NEAR_TOP: [number, number][] = [[-10, 282], [90, 318], [170, 352], [210, 346], [LIP.x, LIP.y]];
/** The cut faces of the crevasse, going down: the near one and the far one (ragged). */
const NEAR_FACE: [number, number][] = [[LIP.x, LIP.y], [244, 372], [252, 410], [240, 456], [250, 510], [236, 560], [244, 610]];
const FAR_FACE: [number, number][] = [[FAR.x, FAR.y], [610, 404], [598, 452], [612, 500], [600, 548], [614, 610]];
const FAR_TOP: [number, number][] = [[FAR.x, FAR.y], [700, 392], [810, 418]];
const SKI_S = 2;

/** A cut through the snowpack (the polygon given): fresh snow on top, then old snow, firn, blue ice, in layers. */
const cutaway = (ctx: Ctx, poly: [number, number][], top: [number, number][], seed: number) => {
  ctx.save();
  ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
  const layers = ['#DCE6F2', '#C8D6EA', '#B3C7E2', '#9DB8DA', '#86A8D2', '#6E95C6', '#5A83B8', '#46709F'];
  let y = 300, i = 0;
  while (y < 620) {
    const h = snap(18 + hash(seed + i) * 26);
    ctx.fillStyle = layers[Math.min(layers.length - 1, i)]; ctx.fillRect(0, y, 800, h + P);
    checker(ctx, 0, y, 800, P, layers[Math.max(0, i - 1)], i % 2);
    y += h; i++;
  }
  // (a band of grit through it, and bubbles)
  ctx.fillStyle = 'rgba(87, 83, 78, 0.35)'; ctx.fillRect(0, 470, 800, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; for (let k = 0; k < 40; k++) ctx.fillRect(snap(hash(k + seed) * 800), snap(380 + hash(k * 3 + seed) * 220), P, P);
  ctx.restore();
  // The fresh snow along the top: thick, white, lit along its top edge, blue under
  for (let k = 0; k + 1 < top.length; k++) {
    const [x1, y1] = top[k], [x2, y2] = top[k + 1];
    for (let x = Math.ceil(x1 / P) * P; x < x2; x += P) {
      const y = snap(y1 + (y2 - y1) * (x - x1) / (x2 - x1));
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x, y, P, 16);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, P, P);
      ctx.fillStyle = '#BFDBFE'; ctx.fillRect(x, y + 14, P, P * 2);
    }
  }
};

/** The crevasse from the side: the sky, the mountains across, the back of the crack in its blues going black, the two
 * sides cut away, the snow hanging over the lips and icicles off it. */
const lipSet = (ctx: Ctx, f: number) => {
  skyAndRanges(ctx, 300);
  // (the woods across the valley, dark, small)
  for (let k = 0; k < 22; k++) { const x = k * 38 + hash(k) * 20, h = 18 + hash(k + 5) * 16; pineTier(ctx, x, 318 - h, 322, 7 + h * 0.18, { shade: '#29523F', lit: '#3C6B54', ink: '#29523F' }, false); }
  ctx.fillStyle = '#E8EFF8'; ctx.fillRect(0, 322, 800, 30);
  // The back of the crack (its far wall, seen through the gap): ice going blue, then black, down
  ctx.save();
  ctx.beginPath(); ctx.moveTo(LIP.x - 20, LIP.y + 10); ctx.lineTo(FAR.x + 20, FAR.y + 8); ctx.lineTo(FAR.x + 20, 600); ctx.lineTo(LIP.x - 20, 600); ctx.closePath(); ctx.clip();
  bandedGradient(ctx, 0, 330, 800, 270, ['#BAE6FD', '#7DD3FC', '#38BDF8', '#0369A1', '#0C4A6E', '#082F49', '#020617', '#000000'], 14);
  // (its old layers, bowed; fractures down it)
  for (let k = 0; k < 7; k++) { ctx.fillStyle = k % 2 ? 'rgba(240, 249, 255, 0.22)' : 'rgba(30, 64, 120, 0.35)'; for (let x = LIP.x; x < FAR.x; x += P * 2) ctx.fillRect(x, snap(370 + k * 30 + Math.sin(x * 0.02 + k) * 6), P * 2, P); }
  ctx.fillStyle = 'rgba(224, 242, 254, 0.4)'; for (const x0 of [300, 380, 470, 540]) for (let y = 360; y < 520; y += P) ctx.fillRect(snap(x0 + Math.sin(y * 0.05 + x0) * 6), y, P, P);
  ctx.restore();
  // (the far lip of it, back there, a line of snow)
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(LIP.x - 10, LIP.y + 6); ctx.lineTo(FAR.x + 10, FAR.y + 4); ctx.lineTo(FAR.x + 10, FAR.y + 12); ctx.lineTo(LIP.x - 10, LIP.y + 14); ctx.closePath(); ctx.fill();
  // The two sides, cut away
  cutaway(ctx, [...NEAR_TOP, ...NEAR_FACE.slice(1), [-10, 610]], NEAR_TOP, 1);
  cutaway(ctx, [...FAR_TOP, [810, 610], ...[...FAR_FACE].reverse()], FAR_TOP, 7);
  // (the cut faces: lit along the edge, inked)
  for (const face of [NEAR_FACE, FAR_FACE]) {
    ctx.strokeStyle = '#1E3A5F'; ctx.lineWidth = 2; ctx.beginPath(); face.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  // The snow over the lips, and icicles off it
  for (const [x, y, dir] of [[LIP.x, LIP.y, 1], [FAR.x, FAR.y, -1]] as const) {
    ink(ctx, () => { ctx.moveTo(x - dir * 30, y); ctx.lineTo(x + dir * 10, y - 2); ctx.quadraticCurveTo(x + dir * 16, y + 6, x + dir * 4, y + 12); ctx.lineTo(x - dir * 30, y + 14); ctx.closePath(); }, '#F8FAFC', 1.5);
    for (let k = 0; k < 4; k++) {
      const ix = x + dir * (6 - k * 9), len = 10 + hash(k + x) * 18;
      ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.moveTo(ix - 3, y + 12); ctx.lineTo(ix + 3, y + 12); ctx.lineTo(ix, y + 12 + len); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(snap(ix - 2), y + 12, P, snap(len * 0.5));
    }
  }
  void f;
};

/** Where he is on the way off the lip (his feet), and how far through the sail. */
const sailAt = (t: number) => {
  const k = clamp01(t / SAIL), e = 1 - (1 - k) ** 3;
  return { x: 196 + (HANG.x - 196) * e, y: 346 + (HANG.y - 346) * e - Math.sin(e * Math.PI) * 18, k };
};

const drawLip = (ctx: Ctx, state: GameState, t: number) => {
  lipSet(ctx, state.frame);
  if (t < CLOSE) {
    // Off the lip in his tuck and out over the middle, slowing, slowing, and stopped there, in the air (cool as anything)
    const s = sailAt(t);
    if (s.k < 1) {
      // (speed lines behind him, and the powder off the lip)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let k = 0; k < 5; k++) { const len = (1 - s.k) * (60 + k * 14); ctx.fillRect(snap(s.x - 70 - len), snap(s.y - 90 + k * 18), snap(len), P); }
    }
    if (t < 16) for (let k = 0; k < 6; k++) { const q = t / 16; pixelBlob(ctx, LIP.x - 10 + k * 8 + q * 30, LIP.y - 6 - q * 20 * hash(k), 6 + q * 10, 5 + q * 8, `rgba(255, 255, 255, ${(0.8 * (1 - q)).toFixed(2)})`); }
    skisUnder(ctx, s.x, s.y, SKI_S);
    him(ctx, state, s.x, s.y, SKI_S, undefined);
    return;
  }
  // Back out: still hanging there (eyes screwed shut now, bracing); then gone, straight down, in a streak
  if (t < ZIP) { skisUnder(ctx, HANG.x, HANG.y, SKI_S); him(ctx, state, HANG.x, HANG.y, SKI_S, 'agony'); return; }
  const z = t - ZIP;
  if (z < 4) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 800, 600); ctx.clip();
    him(ctx, state, HANG.x, HANG.y + 40 + z * 110, SKI_S, 'scream', 0.55, 1 + z * 1.2);
    ctx.restore();
  }
  // (the streak he's left, and the puff of snow hanging where he was, in the shape of him, drifting apart)
  if (z < 10) { ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 * (1 - z / 10)).toFixed(2)})`; for (const dx of [-14, -2, 10]) ctx.fillRect(snap(HANG.x + dx), HANG.y - 100, P * 2, 700); }
  if (z < 34) {
    const q = z / 34, a = (0.95 * (1 - q * q)).toFixed(2);
    for (let k = 0; k < 9; k++) {
      const bx = HANG.x - 6 + (hash(k) - 0.5) * 34 * (1 + q * 0.8), by = HANG.y - 12 - k * 13 + (hash(k + 4) - 0.5) * 8 - q * 10;
      const r = (10 + hash(k * 3) * 8) * (1 + q * 0.6);
      pixelBlob(ctx, bx + 2, by + 3, r, r * 0.8, `rgba(186, 205, 230, ${a})`);
      pixelBlob(ctx, bx, by, r, r * 0.8, `rgba(255, 255, 255, ${a})`);
    }
  }
  // His skis: left hanging in the air without him (a quiver), a beat; then they go too, end over end
  if (t < SKIS_GO) { const q = t >= SKIS_GO - 6 ? Math.sin(t * 2.4) * 1.5 : 0; skisUnder(ctx, HANG.x + q, HANG.y, SKI_S); return; }
  const g = t - SKIS_GO;
  for (const [dx, spin, lag] of [[-6, 0.31, 0], [8, -0.22, 3]] as const) {
    const u = Math.max(0, g - lag);
    ctx.save(); ctx.translate(HANG.x + dx + u * dx * 0.2, HANG.y + 0.5 * 1.1 * u * u); ctx.scale(SKI_S, SKI_S); ctx.rotate(-0.15 + u * spin); drawHisSki(ctx); ctx.restore();
  }
};

// ---- In on his face ----------------------------------------------------------------------------------------------

/**
 * Head and shoulders, front on, hanging there against the sky: his flat-top, the brow, the stubble, the bull neck, the
 * traps, the fists up in front of him in his tuck. The glance down (and the brows going up), the look round at us,
 * the blink, the bead of sweat, the gulp, and the little wave.
 */
const drawCloseUp = (ctx: Ctx, t: number) => {
  skyAndRanges(ctx, 470);
  ctx.save(); ctx.translate(400, 260);
  // The shoulders and traps, out to the edges, under the neck
  const sh = () => { ctx.moveTo(-70, 70); ctx.quadraticCurveTo(-200, 120, -330, 200); ctx.lineTo(-420, 400); ctx.lineTo(420, 400); ctx.lineTo(330, 200); ctx.quadraticCurveTo(200, 120, 70, 70); ctx.closePath(); };
  ink(ctx, sh, skinTone, 4);
  ctx.save(); ctx.beginPath(); sh(); ctx.clip();
  ctx.fillStyle = skinShadow; ctx.fillRect(160, 60, 300, 400); ctx.fillRect(-420, 300, 840, 100);
  ctx.fillStyle = skinHighlight; ctx.beginPath(); ctx.ellipse(-250, 200, 70, 36, -0.4, 0, Math.PI * 2); ctx.fill();
  // (the delts, the line of the pecs, the collarbones)
  ctx.strokeStyle = skinShadow; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(-300, 300, 90, -1.6, -0.3); ctx.moveTo(390, 300); ctx.arc(300, 300, 90, -2.8, -1.5); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-150, 250); ctx.quadraticCurveTo(-60, 230, -8, 250); ctx.moveTo(150, 250); ctx.quadraticCurveTo(60, 230, 8, 250); ctx.stroke();
  ctx.restore();
  // The neck (and his Adam's apple, going up and down with the gulp)
  const neck = () => ctx.rect(-62, 20, 124, 90);
  ink(ctx, neck, skinTone, 4);
  ctx.fillStyle = skinShadow; ctx.fillRect(-60, 22, 120, 22); ctx.fillRect(34, 22, 26, 86);
  const gulp = t >= GULP && t < GULP + 14 ? Math.sin(((t - GULP) / 14) * Math.PI) * 16 : 0;
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(0, 78 - gulp, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinHighlight; ctx.fillRect(-6, 72 - gulp, 6, 4);
  // His fists, up in front of him in the tuck (one comes up and waves)
  for (const side of [-1, 1]) if (side < 0 || t < WAVE) fist(ctx, side * 120, 330);
  if (t >= WAVE) wave(ctx, t);
  // The head: square-jawed, the ears, lit from the upper left
  const head = () => ctx.roundRect(-96, -130, 192, 200, [44, 44, 74, 74]);
  for (const side of [-1, 1]) { ink(ctx, () => ctx.ellipse(side * 98, -24, 16, 28, 0, 0, Math.PI * 2), skinTone, 3); ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(side * 100, -22, 7, 16, 0, 0, Math.PI * 2); ctx.fill(); }
  ink(ctx, head, skinTone, 4);
  ctx.save(); ctx.beginPath(); head(); ctx.clip();
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.ellipse(110, 0, 70, 160, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = skinHighlight; ctx.fillRect(-80, -100, 18, 50);
  // (the stubble, along the jaw and the top lip)
  checker(ctx, -96, 20, 192, 50, stubbleColor, 0, 2);
  checker(ctx, -30, 2, 60, 10, stubbleColor, 1, 2);
  ctx.restore();
  ctx.beginPath(); head(); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke();
  // The flat-top: a block of it, square on top, bristling, cut tight down the sides
  ink(ctx, () => { ctx.moveTo(-92, -98); ctx.lineTo(-90, -158); for (let x = -90; x < 90; x += 12) { ctx.lineTo(x + 6, -166); ctx.lineTo(x + 12, -158); } ctx.lineTo(92, -98); ctx.lineTo(70, -110); ctx.lineTo(-70, -110); ctx.closePath(); }, '#1C1917', 3);
  ctx.fillStyle = '#44403C'; ctx.fillRect(-80, -154, 120, 4);
  ctx.fillStyle = '#292524'; ctx.fillRect(-96, -96, 14, 40); ctx.fillRect(82, -96, 14, 40);
  // The look: off to the side, cool; the glance down; the brows going up; round at us. And the blink
  const down = t >= GLANCE ? 1 - clamp01((t - LOOK) / 7) : 0;
  const dx = t < GLANCE ? 0.6 : 0, dy = down * 0.95;
  const worried = clamp01((t - GLANCE - 8) / 8);
  const shut = t >= BLINK && t < BLINK + 4;
  for (const side of [-1, 1]) {
    const ex = side * 38, ey = -36;
    if (shut) { ctx.fillStyle = skinShadow; ctx.fillRect(ex - 20, ey - 4, 40, 8); ctx.fillStyle = INK; ctx.fillRect(ex - 18, ey + 2, 36, 4); }
    else {
      eye(ctx, ex, ey, 19, dx, dy);
      // (cool, the lids down over the tops of them; worried, wide open)
      const lid = 12 * (1 - worried);
      if (lid > 1) { ctx.fillStyle = skinTone; ctx.fillRect(ex - 22, ey - 22, 44, 4 + lid); ctx.fillStyle = INK; ctx.fillRect(ex - 20, ey - 18 + lid, 40, 3); }
    }
    // (the brows: down and in, scowling; then up, and up in the middle)
    const inner = -60 + 2 * (1 - worried) * 8 - worried * 18, outer = -62 - (1 - worried) * 2 + worried * 2;
    ctx.fillStyle = '#1C1917';
    ctx.beginPath(); ctx.moveTo(side * 12, inner); ctx.lineTo(side * 62, outer); ctx.lineTo(side * 62, outer + 12); ctx.lineTo(side * 12, inner + 12); ctx.closePath(); ctx.fill();
  }
  // The nose: big, broken once, its shadow down the right
  ink(ctx, () => { ctx.moveTo(-6, -30); ctx.lineTo(-18, 6); ctx.quadraticCurveTo(0, 16, 20, 6); ctx.lineTo(8, -30); }, skinTone, 3);
  ctx.fillStyle = skinShadow; ctx.beginPath(); ctx.moveTo(8, -26); ctx.lineTo(18, 4); ctx.lineTo(8, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = INK; ctx.fillRect(-10, 6, 6, 3); ctx.fillRect(6, 6, 6, 3);
  // The mouth: the scowl; then (worried) a wobbly little line, pressed tight for the gulp
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath();
  if (worried < 0.5) { ctx.moveTo(-34, 36); ctx.lineTo(-10, 32); ctx.lineTo(10, 32); ctx.lineTo(34, 38); }
  else if (t >= GULP && t < GULP + 14) { ctx.moveTo(-18, 34); ctx.lineTo(18, 34); }
  else { ctx.moveTo(-30, 36); for (let k = 1; k <= 6; k++) ctx.lineTo(-30 + k * 10, 36 + (k % 2 ? -4 : 3)); }
  ctx.stroke();
  // A bead of sweat, out at his temple and running down
  if (t >= SWEAT) {
    const q = clamp01((t - SWEAT) / 30), sy = -70 + q * q * 60;
    ink(ctx, () => { ctx.moveTo(-84, sy - 14); ctx.quadraticCurveTo(-74, sy, -84, sy + 4); ctx.quadraticCurveTo(-94, sy, -84, sy - 14); }, '#BAE6FD', 2);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-88, sy - 4, 3, 4);
  }
  ctx.restore();
};

/** A fist, front on, knuckles to us, at (x, y) (its wristband under it). */
const fist = (ctx: Ctx, x: number, y: number) => {
  ink(ctx, () => ctx.rect(x - 34, y + 30, 68, 34), wristbandColor, 3);
  ink(ctx, () => ctx.roundRect(x - 44, y - 34, 88, 70, 18), skinTone, 4);
  ctx.fillStyle = skinShadow; ctx.fillRect(x + 20, y - 26, 18, 56);
  // (the knuckles: four, lit on top, the creases between)
  for (let k = 0; k < 4; k++) { const kx = x - 33 + k * 22; ctx.fillStyle = skinHighlight; ctx.fillRect(kx, y - 28, 14, 5); ctx.fillStyle = skinShadow; ctx.fillRect(kx + 18, y - 26, 3, 22); }
  ctx.fillStyle = skinShadow; ctx.fillRect(x - 38, y + 4, 76, 4);
};

/** His hand coming up into the shot, open, fingers waggling: bye-bye. */
const wave = (ctx: Ctx, t: number) => {
  const q = clamp01((t - WAVE) / 6), x = 140, y = 330 - q * 110;
  // (his forearm under it, the wristband)
  ink(ctx, () => ctx.rect(x - 34, y + 34, 68, 200), skinTone, 4);
  ctx.fillStyle = skinShadow; ctx.fillRect(x + 14, y + 36, 18, 196);
  ink(ctx, () => ctx.rect(x - 36, y + 34, 72, 30), wristbandColor, 3);
  // (the fingers, waggling in turn, then the palm over their roots, the thumb out the side)
  for (let k = 0; k < 4; k++) {
    const bend = Math.sin((t - WAVE) * 0.7 - k * 0.9) * 0.5 + 0.5, len = 54 - k * 4 - bend * 26 - (k === 3 ? 10 : 0);
    const fx = x - 36 + k * 22;
    ink(ctx, () => ctx.roundRect(fx, y - 20 - len, 18, len + 26, 8), skinTone, 3);
    ctx.fillStyle = skinShadow; ctx.fillRect(fx + 12, y - 16 - len, 4, len + 18);
    ctx.fillStyle = skinHighlight; ctx.fillRect(fx + 4, y - 14 - len, 4, 6);
  }
  ink(ctx, () => ctx.roundRect(x - 40, y - 20, 84, 60, 16), skinTone, 4);
  ctx.fillStyle = skinShadow; ctx.fillRect(x + 22, y - 14, 16, 48);
  ink(ctx, () => { ctx.save(); ctx.translate(x - 44, y + 10); ctx.rotate(-0.6); ctx.roundRect(-14, -40, 24, 48, 10); ctx.restore(); }, skinTone, 3);
};

// ---- Down the crack, from above ----------------------------------------------------------------------------------

/** Straight down it: the vanishing point, where the black is. */
const VP = { x: 400, y: 304 };
/** The crack's half-height across, at x (it's a long lens, ragged), and how far the lip he went off sticks out over
 * it (the slab that's going to go: the part of the near lip from SLAB_X1 to SLAB_X2). */
const SLAB_X1 = 300, SLAB_X2 = 504;
const halfAt = (x: number) => 150 * Math.sqrt(Math.max(0, 1 - ((x - 400) / 336) ** 2)) + (hash(Math.floor(x / 16)) - 0.5) * 12;
const slabBite = (x: number) => (x <= SLAB_X1 || x >= SLAB_X2 ? 0 : Math.pow(Math.sin(Math.PI * (x - SLAB_X1) / (SLAB_X2 - SLAB_X1)), 0.5) * 50 + (hash(Math.floor(x / 10) + 40) - 0.5) * 10);
/** The crack's outline (its open part, with the slab's bite out of the near lip), clockwise from the left end. */
const crackOutline = (): [number, number][] => {
  const pts: [number, number][] = [];
  for (let x = 64; x <= 736; x += 8) pts.push([x, VP.y - halfAt(x) * 0.92]);
  for (let x = 736; x >= 64; x -= 8) pts.push([x, VP.y + halfAt(x) + slabBite(x)]);
  return pts;
};
/** The slab: from the crack's lip (the open outline there) out to the lip he went off. */
const slabOutline = (): [number, number][] => {
  const pts: [number, number][] = [];
  for (let x = SLAB_X1; x <= SLAB_X2; x += 4) pts.push([x, VP.y + halfAt(x) + slabBite(x)]);
  for (let x = SLAB_X2; x >= SLAB_X1; x -= 8) pts.push([x, VP.y + halfAt(x) - 2]);
  return pts;
};
const poly = (ctx: Ctx, pts: [number, number][], sx = 1, sy = 1, ox = VP.x, oy = VP.y) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => { const px = snap(ox + (x - VP.x) * sx), py = snap(oy + (y - VP.y) * sy); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
  ctx.closePath();
};

/** How big something is, z down the crack (0 up at the lips, more further down), and where (x, y) up top would be. */
const depth = (z: number) => 1 / (1 + z);

/** The snow round it up top: drifts, wind-ripples, and his tracks coming up to the edge (onto the slab). */
const snowTop = (ctx: Ctx) => {
  bandedGradient(ctx, 0, 0, 800, 600, ['#EEF3FA', '#F8FAFC', '#FFFFFF', '#F1F5F9', '#E2E8F0'], 10);
  for (let i = 0; i < 26; i++) {
    const x = snap(hash(i * 3.3) * 760), y = snap(hash(i * 7.1 + 2) * 600), w = snap(30 + hash(i) * 50);
    ctx.fillStyle = '#D5DFEE'; ctx.fillRect(x, y + 2, w, P); checker(ctx, x + 2, y + 4, w - 4, P, '#D5DFEE');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 4, y, w - 8, P);
  }
};
/** His two tracks, up to the edge (the slab's lip, where he went off). */
const tracks = (ctx: Ctx) => {
  for (const x of [386, 410]) { ctx.fillStyle = '#B8C7DD'; ctx.fillRect(x, VP.y + 150, 6, 300); ctx.fillStyle = '#94A9C6'; ctx.fillRect(x, VP.y + 150, 2, 300); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 6, VP.y + 150, P, 300); }
};

/** The crack going down: bands of ice, lighter at the lips, deeper blue, then black at the bottom, pulled in toward
 * the vanishing point (squeezed shut faster across than along: it narrows to a slot); fractures down the walls. */
const SHAFT_BANDS = ['#E0F2FE', '#BAE6FD', '#93D4FB', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E', '#082F49', '#05253B', '#031726', '#020617'];
const bandScale = (i: number) => ({ sx: 1 / (1 + i * 0.2), sy: 1 / (1 + i * 0.75) });

const drawShaft = (ctx: Ctx, state: GameState, c: Cliff, t: number) => {
  snowTop(ctx);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 800, 600); crackOutline().forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip('evenodd'); tracks(ctx); ctx.restore();
  // The crack, in its bands down to the black
  const out = crackOutline();
  SHAFT_BANDS.forEach((col, i) => { const { sx, sy } = bandScale(i); ctx.fillStyle = col; poly(ctx, out, sx, sy); ctx.fill(); });
  ctx.fillStyle = '#000000'; poly(ctx, out, 1 / (1 + 14 * 0.2), 1 / (1 + 14 * 0.75) * 0.6); ctx.fill();
  // (fractures and old layers down the walls: lines from the lip in toward the point, lit; dithered seams between bands)
  ctx.save(); poly(ctx, out); ctx.clip();
  for (let k = 0; k < 26; k++) {
    const [x0, y0] = out[Math.floor(hash(k * 5) * out.length)];
    const len = 0.4 + hash(k + 9) * 0.45;
    ctx.fillStyle = k % 3 ? 'rgba(240, 249, 255, 0.35)' : 'rgba(8, 47, 73, 0.4)';
    for (let q = 0; q < len; q += 0.03) { const { sx, sy } = bandScale(q * 13); ctx.fillRect(snap(VP.x + (x0 - VP.x) * sx), snap(VP.y + (y0 - VP.y) * sy), P, P); }
  }
  for (let i = 1; i < 9; i++) { const { sx, sy } = bandScale(i - 0.5); ctx.fillStyle = SHAFT_BANDS[i - 1]; out.forEach(([x, y], j) => { if (j % 2) ctx.fillRect(snap(VP.x + (x - VP.x) * sx), snap(VP.y + (y - VP.y) * sy), P, P); }); }
  ctx.restore();
  // The lips: the snow overhanging, a white rim, its shadow inside; icicles off it, pointing down in
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; poly(ctx, out); ctx.stroke();
  ctx.strokeStyle = '#7FA7D3'; ctx.lineWidth = 2; poly(ctx, out, 0.985, 0.95); ctx.stroke();
  for (let k = 0; k < out.length; k += 5) {
    const [x, y] = out[k], { sx, sy } = bandScale(0.5 + hash(k) * 0.6);
    ctx.fillStyle = '#E0F2FE'; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(VP.x + (x - VP.x) * sx, VP.y + (y - VP.y) * sy); ctx.closePath(); ctx.fill();
  }
  // Him going down it: smaller and smaller, tumbling; his skis after him
  const fall = (from: number, z0: number) => { const u = Math.max(0, t - from) / (LAND - SHAFT); return z0 + u * u * 70; };
  if (t < LAND + 2) {
    for (const [lag, ox, oy, spin] of [[10, 70, -40, 0.3], [14, -50, -70, -0.24]] as const) {
      const z = fall(SHAFT + lag, 0.25), s = depth(z);
      if (t < SHAFT + lag) continue;
      ctx.save(); ctx.translate(VP.x + ox * s, VP.y + oy * s); ctx.scale(3 * s, 3 * s); ctx.rotate(t * spin); drawHisSki(ctx); ctx.restore();
    }
    const z = fall(SHAFT, 0.15), s = depth(z);
    ctx.save(); ctx.translate(VP.x + 20 * s, VP.y + 40 * s); ctx.rotate((t - SHAFT) * 0.22); ctx.translate(-VP.x, -VP.y);
    if (s * 3.4 > 0.05) him(ctx, state, VP.x, VP.y + 32 * 3.4 * s, 3.4 * s, 'scream', 1, 1, false);
    ctx.restore();
  }
  // The landing, a long way down: a little puff of snow at the bottom, drifting up
  if (t >= LAND) puff(ctx, t - LAND, 1);
  // The lip he went off: there, then the crack across it, then it breaks away and goes down after him
  const sl = slabOutline();
  if (!c.slabAt || t < c.slabAt + 4) {
    const shake = c.slabAt && t >= c.slabAt ? (t % 2 ? 2 : -2) : 0;
    ctx.save(); ctx.translate(shake, 0); slabTop(ctx, sl, 1, VP.y);
    if (c.slabAt && t >= c.slabAt - 0) { ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 2; ctx.beginPath(); sl.slice(0, Math.ceil(sl.length / 2)).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
    ctx.restore();
  } else if (t < c.slabAt + SLAB_FALL + 2) {
    const u = (t - c.slabAt - 4) / (SLAB_FALL - 4), s = depth(u * u * u * 70);
    ctx.save(); ctx.translate(VP.x, VP.y); ctx.rotate(u * 0.5); ctx.translate(-VP.x, -VP.y);
    slabTop(ctx, sl, s, VP.y + (VP.y + 170 - VP.y) * s - 170 * s);
    ctx.restore();
  }
  if (c.slabAt && t >= c.slabAt + SLAB_FALL) puff(ctx, t - c.slabAt - SLAB_FALL, 2.6);
  // His line, echoing up out of it while he says it: each echo bigger and fainter, coming up toward us
  if (c.line && (c.talking || t < c.lineUntil)) {
    const since = t - ECHO;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let k = 3; k >= 0; k--) {
      const q = clamp01((since - k * 7) / 10);
      if (q <= 0) continue;
      const size = 12 + k * 7, y = VP.y - 10 - k * 34;
      ctx.font = `bold ${size}px "Press Start 2P", monospace`;
      ctx.globalAlpha = q * (1 - k * 0.22);
      ctx.lineWidth = 3; ctx.strokeStyle = '#020617'; ctx.strokeText(c.line, VP.x, y);
      ctx.fillStyle = k === 0 ? '#FFFFFF' : '#E0F2FE'; ctx.fillText(c.line, VP.x, y);
    }
    ctx.restore();
  }
};

/** The slab's top (snow, his tracks up to its edge, its lit lip), its points pulled in s toward the point, with the
 * near edge of it going to y. */
const slabTop = (ctx: Ctx, sl: [number, number][], s: number, _y: number) => {
  ctx.save(); poly(ctx, sl, s, s); ctx.fillStyle = '#F8FAFC'; ctx.fill(); ctx.clip();
  ctx.translate(VP.x, VP.y); ctx.scale(s, s); ctx.translate(-VP.x, -VP.y);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, VP.y + 120, 800, 30);
  tracks(ctx);
  ctx.restore();
  // (its overhanging edge: the white rim, and once it's off, its shadowed underside showing round it)
  ctx.strokeStyle = s < 1 ? '#94A9C6' : '#FFFFFF'; ctx.lineWidth = Math.max(1, 6 * s); poly(ctx, sl, s, s); ctx.stroke();
};

/** A puff of snow coming up out of the bottom, k times as big: blobs swelling and drifting up toward us, fading. */
const puff = (ctx: Ctx, since: number, k: number) => {
  const q = clamp01(since / 60);
  if (q >= 1) return;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + hash(i) * 0.5, r = (2 + q * 10) * k * (0.7 + hash(i + 3) * 0.6);
    const x = VP.x + Math.cos(a) * r * 1.6, y = VP.y + Math.sin(a) * r * 0.5 - q * 6 * k;
    pixelBlob(ctx, x, y, r, r * 0.8, `rgba(255, 255, 255, ${(0.95 * (1 - q)).toFixed(2)})`);
  }
};
