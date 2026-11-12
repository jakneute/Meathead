// DAD GUY's refight (SLOTH): hell's knockoff of his amphitheater stage, Cartoon Land's own boss fight run whole
// (cartoon/amphi/fight.ts) at 999. The owner's: "dad guy is forced to do a live show with the living actors as slaves,
// sliding around the ground. two new 'guest' characters now take up the arena. they still block shots, but they scream
// in pain 'why can't i die!' they will scream. they feel the pain but cannot be destroyed", "dad guy has 6 family members
// instead of 4 to make up for the fact his hp value can be considered nonstandard if you use his weakness", "the car is
// the only thing that can destroy them, like the regular fight". Started at checkpoint 62 (the land's own retry: at the
// foot of the stage steps by the guard he kicked; up onto the stage and it's straight on).
//
//   - The family are the real actors who played them (the animatronics' art, the actor's face over the wax: flesh, real
//     eyes wide and bloodshot, sweat, tears, the grin stitched on: cartoon/amphi/family.ts setActorFace), and two guests
//     make six (DWAYNE the wacky neighbor, AUNT RHONDA: new crude figures, bolted to castor bases like THE BOY's). Six on
//     the tracks, the same rules (cartoon/amphi/fight.ts setCastRefight: only while this refight's on): they eat his
//     shots and moves, only the clapperboard's cars flatten them, and now they scream when hit (their own voices).
//   - His lines and the family's tapes swapped (park4/lines/cartoon.ts). DAD_SNIPE isn't (fight.ts filters that pool by
//     who's alive before it picks, so the swap can't see it: the original snipes play).
//   - Stitched up the way he died: drowned in beer (wrung out: seams twisted round him like a towel, a beer stain) or
//     flattened by a stunt car (pumped back up: a bike valve in his belly, a tread mark sewn across him).
//   - CLAUDE.md's rule stays: up off his crushed couch, no breather and no multiplier (the fight's own SAD_*).
//   - The place: DAD GUY, LIVE IN HELL (park4/place/cartoon.ts): dead air for a sky, a mountain of TVs showing snow,
//     HELL TV's billboard, ON AIR over the banner (cartoon/amphi/stage.ts STAGE_HOOKS).

import type { RefightDef } from '../defs';
import type { GameState } from '../../../../m1/game/core/state';
import { cartoonLayout } from '../../../cartoon/index';
import * as A from '../../../cartoon/amphi/lines';
import { setCastRefight, dadNow } from '../../../cartoon/amphi/fight';
import { setActorFace, type Anim } from '../../../cartoon/amphi/family';
import { DAD_K } from '../../../cartoon/amphi/dad';
import { type Ramp, rampOf, shape, shapeTop, ell, px, line, limb, fill } from '../../../cartoon/amphi/paint';
import { elbow, knee } from '../../../art/limb';
import { bossDeath } from '../../../store';
import { refightOn, inRefight } from '../hook';
import { STAGE_HOOKS } from '../../../cartoon/amphi/stage';
import { cartoonPlace, drawOnAir, CARTOON_BANNER } from '../place/cartoon';
import { refightId, refightStage } from '../where';
import * as L from '../lines/cartoon';

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------------------------------------------
// The actors' faces, over the animatronics' wax (in the face's own frame: its middle, its size, facing left)

const FLESH = '#E2A47E', FLESH_D = '#B97A58';
/** Over one face: real skin, real eyes (wide, bloodshot, darting), sweat, a tear, the grin sewn on. */
export const actorFace = (c: Ctx, hx: number, hy: number, r: number, a: Anim, seed: number) => {
  if (a.mode === 'off') return;
  c.save();
  // (the skin: a living tone over the wax, blotchy)
  c.globalAlpha = 0.55; ell(c, hx - r * 0.12, hy + r * 0.02, r * 0.86, r * 0.92, FLESH); c.globalAlpha = 1;
  ell(c, hx - r * 0.62, hy + r * 0.3, r * 0.16, r * 0.1, '#D9826A');
  // (the eyes: real ones, small pupils, red veins, red rims; darting)
  const dart = Math.sin(a.f * 0.9 + seed * 3) > 0.6 ? 1 : Math.sin(a.f * 0.7 + seed) < -0.7 ? -1 : 0;
  for (const [ex, ey] of [[hx - r * 0.55, hy - r * 0.12], [hx + r * 0.05, hy - r * 0.14]]) {
    ell(c, ex, ey, r * 0.21, r * 0.23, '#D04848');
    ell(c, ex, ey, r * 0.17, r * 0.19, '#FFF8F0');
    line(c, [ex - r * 0.16, ey + r * 0.02, ex - r * 0.08, ey + r * 0.05], 0.4, '#D04848');
    line(c, [ex + r * 0.16, ey - r * 0.03, ex + r * 0.08, ey - r * 0.01], 0.4, '#D04848');
    px(c, ex - r * 0.04 + dart * r * 0.07, ey - r * 0.04, r * 0.08, r * 0.08, '#120806');
  }
  // (sweat beads down the forehead, a tear off the near eye)
  for (let k = 0; k < 3; k++) {
    const t = ((a.f + seed * 17 + k * 23) % 60) / 60;
    ell(c, hx - r * 0.7 + k * r * 0.45, hy - r * 0.62 + t * r * 0.5, r * 0.06, r * 0.09, '#DCEFFF');
  }
  line(c, [hx - r * 0.6, hy + r * 0.08, hx - r * 0.66, hy + r * 0.42], 0.6, '#BFE3FF');
  // (the grin: sewn on, the mouth's corners stitched up into the cheeks, black thread, little crosses)
  const jy = hy + r * 0.48, lx = hx - r * 0.6, rx = hx - r * 0.02;
  line(c, [lx, jy, lx - r * 0.06, jy - r * 0.34], 0.6, '#1A0E0E');
  line(c, [rx, jy, rx + r * 0.06, jy - r * 0.34], 0.6, '#1A0E0E');
  for (const [sx, sy] of [[lx - r * 0.02, jy - r * 0.08], [lx - r * 0.04, jy - r * 0.22], [rx + r * 0.02, jy - r * 0.08], [rx + r * 0.04, jy - r * 0.22]]) {
    line(c, [sx - r * 0.07, sy - r * 0.05, sx + r * 0.07, sy + r * 0.05], 0.5, '#1A0E0E');
    line(c, [sx - r * 0.07, sy + r * 0.05, sx + r * 0.07, sy - r * 0.05], 0.5, '#1A0E0E');
  }
  ell(c, lx - r * 0.03, jy - r * 0.3, r * 0.04, r * 0.03, '#9A1A1A');
  ell(c, rx + r * 0.03, jy - r * 0.3, r * 0.04, r * 0.03, '#9A1A1A');
  c.restore();
};
setActorFace(actorFace);

// ---------------------------------------------------------------------------------------------------------------
// The two guests: bolted to castor bases like THE BOY, facing left, DAD GUY's scale; one arm up in a stiff wave (in
// steps, like the robots they're made to be), the other out with a beer on a beer run. Joints from art/limb.ts.

const STEEL: Ramp = ['#B8BCC4', '#8E949E', '#6E747E', '#50565E', '#22262C'];
const SKIN = rampOf(FLESH);
const HAWAII = rampOf('#14B8A6'), KHAKI = rampOf('#C8A870'), LEOPARD = rampOf('#D9A441'), SKIRT = rampOf('#7E22CE'), RED_HAIR = rampOf('#C2410C');
const stepF = (f: number, n = 8) => Math.floor(f / n) * n;

/** A castor base on the track (the guests are bolted to them). */
const base = (c: Ctx, a: Anim) => {
  shape(c, () => c.roundRect(-16, -10, 32, 8, 2), STEEL, -16, 16);
  for (const s of [-1, 1]) ell(c, s * 10, -2, 2.6, 2.6, '#222222');
  if (a.mode !== 'off') px(c, 10, -12, 2, 2, (a.f % 30) < 15 ? '#22C55E' : '#14532D');
  for (let k = 0; k < 4; k++) px(c, -13 + k * 7, -8, 3, 1, '#C8B048');
};
/** An arm, its elbow from limb.ts (facing left in this frame): shoulder to hand, upper and fore lengths, its ramp. */
const arm = (c: Ctx, sx: number, sy: number, hx: number, hy: number, up: number, fore: number, r: Ramp, w: number) => {
  const [ex, ey] = elbow(sx, sy, hx, hy, up, fore, -1);
  limb(c, sx, sy, w, ex, ey, w * 0.9, r);
  limb(c, ex, ey, w * 0.9, hx, hy, w * 0.8, SKIN);
  ell(c, hx, hy, w * 0.75, w * 0.75, SKIN[1]);
};
/** A leg, its knee from limb.ts (facing left), hip to foot. */
const leg = (c: Ctx, hx: number, hy: number, fx: number, fy: number, r: Ramp, w: number) => {
  const [kx, ky] = knee(hx, hy, fx, fy, (fy - hy) * 0.52, (fy - hy) * 0.52, -1);
  limb(c, hx, hy, w, kx, ky, w * 0.9, r);
  limb(c, kx, ky, w * 0.9, fx, fy, w * 0.75, r);
};
/** The beer in his hand on a run. */
const can = (c: Ctx, x: number, y: number) => {
  shape(c, () => c.rect(x - 3.5, y - 7, 7, 14), ['#F25A6E', '#C8102E', '#9E0C24', '#760819', '#38030B'], x - 3.5, x + 3.5, 0.8);
  px(c, x - 3, y - 4, 6, 3, '#F4F1E8');
};
/** A human head in the family's style (a face the size of theirs; the actor's face over it). */
const head = (c: Ctx, a: Anim, seed: number, r: number, hair: () => void) => {
  shape(c, () => c.ellipse(0, 0, r, r * 1.06, 0, 0, Math.PI * 2), [mixF(FLESH, 0.3), FLESH, FLESH_D, '#8A5038', '#4A2418'], -r, r);
  ell(c, -r * 0.42, r * 0.2, r * 0.13, r * 0.1, FLESH_D);
  hair();
  actorFace(c, 0, 0, r, a, seed);
};
const mixF = (col: string, k: number) => {
  const n = parseInt(col.slice(1), 16), R = (n >> 16) & 255, G = (n >> 8) & 255, B = n & 255;
  const m = (v: number) => Math.round(v + (255 - v) * k).toString(16).padStart(2, '0');
  return `#${m(R)}${m(G)}${m(B)}`;
};

/** DWAYNE, the wacky neighbor: lanky, a loud teal shirt with flowers, khaki shorts, socks and sandals, a big mustache,
 *  a bald spot; the stiff wave. */
const drawDwayne = (c: Ctx, x: number, floorY: number, a: Anim, armOut: number, beer: boolean) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const f = stepF(a.f, a.mode === 'glitch' ? 3 : 8), shiver = a.mode === 'glitch' ? ((f / 3) % 2) - 0.5 : 0;
  base(c, a);
  // (the legs: khaki shorts, hairy shins, the post up his back)
  px(c, 2, -60, 4, 50, '#3A3A3A');
  leg(c, -4, -52, -6, -14, SKIN, 3.6); leg(c, 5, -52, 7, -14, SKIN, 3.6);
  for (const s of [-1, 1]) { px(c, s * 6 - 4, -18, 8, 5, '#F4F1EA'); shape(c, () => c.roundRect(s * 6 - 7, -14, 13, 4, 2), ['#8A6A3A', '#6A4A22', '#4A3214', '#2A1A08', '#120A04'], s * 6 - 7, s * 6 + 6); }
  shape(c, () => { c.moveTo(-12, -62); c.lineTo(12, -62); c.lineTo(13, -44); c.lineTo(1, -44); c.lineTo(0, -50); c.lineTo(-1, -44); c.lineTo(-13, -44); c.closePath(); }, KHAKI, -13, 13);
  // (the shirt, teal with white flowers, open at the neck, chest hair)
  c.save(); c.translate(shiver, 0);
  shape(c, () => { c.moveTo(-14, -94); c.quadraticCurveTo(0, -98, 14, -94); c.lineTo(13, -60); c.lineTo(-13, -60); c.closePath(); }, HAWAII, -14, 14);
  for (const [fx, fy] of [[-8, -86], [4, -80], [-4, -70], [8, -66], [-10, -64]]) { for (let k = 0; k < 4; k++) ell(c, fx + Math.cos(k * 1.57) * 2, fy + Math.sin(k * 1.57) * 2, 1.6, 1.6, '#FFF7E0'); ell(c, fx, fy, 1, 1, '#F59E0B'); }
  fill(c, FLESH, () => { c.moveTo(-4, -96); c.lineTo(4, -96); c.lineTo(0, -86); c.closePath(); });
  for (let k = 0; k < 4; k++) px(c, -2 + k * 1.2, -93 + (k % 2) * 2, 0.7, 2, '#3A2A1A');
  // (the far arm: the stiff wave, up and down in steps; the near arm: hanging, or out with the beer)
  const wave = a.mode === 'off' ? 0 : [0, 1, 2, 1][Math.floor(f / 8) % 4];
  arm(c, 9, -92, 18, -112 - wave * 3, 13, 12, HAWAII, 3.4);
  const k = Math.round(armOut * 4) / 4, hx = -8 - k * 20, hy = -64 - k * 14;
  arm(c, -9, -92, hx, hy, 13, 12, HAWAII, 3.4);
  if (beer) can(c, hx - 2, hy - 6);
  // (the head: bald on top, a ring of brown, the mustache)
  c.save(); c.translate(0, -108);
  head(c, a, 11, 11, () => {
    fill(c, '#5A3A1E', () => { c.moveTo(-11, 2); c.quadraticCurveTo(-12, -6, -8, -8); c.lineTo(-6, -3); c.quadraticCurveTo(-8, 0, -9, 4); c.closePath(); });
    fill(c, '#5A3A1E', () => { c.moveTo(11, 3); c.quadraticCurveTo(12, -7, 6, -9); c.lineTo(5, -4); c.quadraticCurveTo(9, -1, 9, 4); c.closePath(); });
    ell(c, -1, -7, 5, 2, 'rgba(255,255,255,0.4)');
  });
  fill(c, '#4A2A12', () => { c.moveTo(-10, 4); c.quadraticCurveTo(-5, 1, -1, 4); c.quadraticCurveTo(-5, 7, -10, 6); c.closePath(); });
  c.restore();
  c.restore();
  // (bolted on: the bolt in his neck, the cable)
  ell(c, 4, -98, 1.8, 1.8, '#9AA0A8');
  c.strokeStyle = '#1C1C1C'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, -96); c.quadraticCurveTo(18, -50, 12, -10); c.stroke();
  c.restore();
};

/** AUNT RHONDA: big frizzy red hair, a leopard top, a purple skirt, gold hoops, blue eye shadow; the stiff wave. */
const drawRhonda = (c: Ctx, x: number, floorY: number, a: Anim, armOut: number, beer: boolean) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K, DAD_K);
  const f = stepF(a.f, a.mode === 'glitch' ? 3 : 8), shiver = a.mode === 'glitch' ? ((f / 3) % 2) - 0.5 : 0;
  base(c, a);
  px(c, 2, -56, 4, 46, '#3A3A3A');
  leg(c, -4, -44, -5, -14, SKIN, 3.4); leg(c, 4, -44, 5, -14, SKIN, 3.4);
  for (const s of [-1, 1]) shape(c, () => c.roundRect(s * 5 - 6, -15, 11, 5, 2), ['#F87171', '#DC2626', '#B91C1C', '#7F1D1D', '#3A0A0A'], s * 5 - 6, s * 5 + 5);
  shape(c, () => { c.moveTo(-14, -64); c.lineTo(14, -64); c.lineTo(18, -40); c.lineTo(-18, -40); c.closePath(); }, SKIRT, -18, 18);
  c.save(); c.translate(shiver, 0);
  shape(c, () => { c.moveTo(-15, -92); c.quadraticCurveTo(0, -97, 15, -92); c.lineTo(14, -62); c.lineTo(-14, -62); c.closePath(); }, LEOPARD, -15, 15);
  for (const [sx, sy] of [[-9, -86], [3, -84], [-4, -76], [8, -74], [-10, -68], [2, -67], [9, -88]]) { ell(c, sx, sy, 2, 1.6, '#3A2410'); ell(c, sx, sy, 0.9, 0.7, '#B07A2A'); }
  const wave = a.mode === 'off' ? 0 : [0, 1, 2, 1][Math.floor(f / 8) % 4];
  arm(c, 10, -90, 19, -110 - wave * 3, 12, 11, LEOPARD, 3.2);
  const k = Math.round(armOut * 4) / 4, hx = -8 - k * 20, hy = -62 - k * 14;
  arm(c, -10, -90, hx, hy, 12, 11, LEOPARD, 3.2);
  if (beer) can(c, hx - 2, hy - 6);
  c.save(); c.translate(0, -106);
  // (the hair, behind the head: a red cloud)
  for (let i = 0; i < 12; i++) { const an = (i / 12) * Math.PI * 2; shapeTop(c, () => c.ellipse(Math.cos(an) * 14 + 2, Math.sin(an) * 12 - 3, 7, 7, 0, 0, Math.PI * 2), RED_HAIR, -24, 14, 0.8); }
  head(c, a, 13, 11, () => {
    shapeTop(c, () => { c.moveTo(-12, -4); c.quadraticCurveTo(-4, -16, 12, -9); c.lineTo(10, -3); c.quadraticCurveTo(0, -9, -10, -1); c.closePath(); }, RED_HAIR, -16, -2, 0.8);
    ell(c, -6, -5, 3, 1.4, '#60A5FA'); ell(c, 1, -5, 3, 1.4, '#60A5FA');
  });
  c.strokeStyle = '#EAB308'; c.lineWidth = 1; c.beginPath(); c.arc(9, 6, 3, 0, Math.PI * 2); c.stroke();
  fill(c, '#BE123C', () => c.ellipse(-5, 6, 3, 1.4, 0, 0, Math.PI * 2));
  c.restore();
  c.restore();
  ell(c, 4, -96, 1.8, 1.8, '#9AA0A8');
  c.strokeStyle = '#1C1C1C'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, -94); c.quadraticCurveTo(18, -50, 12, -10); c.stroke();
  c.restore();
};

/** A guest after the car: flat on the deck, splayed, the base crumpled under, blood out from under it, the car's tread. */
const drawFlatGuest = (c: Ctx, who: 'guest1' | 'guest2', x: number, floorY: number, fr: number, dir: 1 | -1) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K * dir, DAD_K);
  ell(c, 0, -2, 46, 6, '#7F1D1D'); ell(c, -8, -2, 30, 4, '#991B1B');
  const shirt = who === 'guest1' ? HAWAII : LEOPARD;
  limb(c, -30, -5, 3, 30, -5, 3, SKIN);
  shapeTop(c, () => c.roundRect(-18, -9, 32, 7, 3), shirt, -9, -2);
  shapeTop(c, () => c.ellipse(24, -6, 9, 4, 0, 0, Math.PI * 2), [mixF(FLESH, 0.3), FLESH, FLESH_D, '#8A5038', '#4A2418'], -10, -2);
  if (who === 'guest2') ell(c, 32, -7, 6, 4, RED_HAIR[1]);
  px(c, -14, -4, 10, 3, STEEL[2]); ell(c, -20, -3, 2.4, 2.4, '#222222');
  for (let k = 0; k < 6; k++) px(c, -24 + k * 9, -9, 5, 1.4, '#2A2A2A');
  // (a hand up off the deck, twitching)
  const tw = Math.floor(fr / 6) % 3;
  line(c, [-30, -5, -34, -12 - tw], 1.6, FLESH);
  c.restore();
};

/** What's left of one of the family after the car, the actor's: blood out from under the carnage. */
const drawDeadExtra = (c: Ctx, _who: string, x: number, floorY: number, fr: number, dir: 1 | -1) => {
  c.save(); c.translate(Math.round(x), Math.round(floorY)); c.scale(DAD_K * dir, DAD_K);
  c.globalAlpha = 0.85; ell(c, 6, -1, 40, 5, '#7F1D1D'); c.globalAlpha = 1;
  const drip = (fr % 90) / 90;
  ell(c, -26 - drip * 8, -1, 4 + drip * 3, 2, '#991B1B');
  c.restore();
};

setCastRefight({
  guests: {
    guest1: {
      home: { x: 3290, d: 0.96 }, track: { a: 3240, b: 3640, d: 1.001, sh: 74 },
      voice: 'm2.hollywood.actor', beerFor: L.RF_DAD_BEER_DWAYNE, fetch: L.RF_FETCH_DWAYNE, die: L.RF_DIE_DWAYNE, blocked: L.RF_MH_BLOCKED_DWAYNE,
    },
    guest2: {
      home: { x: 3760, d: 0.95 }, track: { a: 3520, b: 3900, d: 1.0005, sh: 70 },
      voice: 'm2.hollywood.actorf', beerFor: L.RF_DAD_BEER_RHONDA, fetch: L.RF_FETCH_RHONDA, die: L.RF_DIE_RHONDA, blocked: L.RF_MH_BLOCKED_RHONDA,
    },
  },
  screams: L.RF_SCREAM,
  drawGuest: (c, who, x, floorY, a, armOut, beer) => (who === 'guest1' ? drawDwayne : drawRhonda)(c, x, floorY, a, armOut, beer),
  drawGuestDead: drawFlatGuest,
  drawDeadExtra,
});

/** The contact sheet's (park4/sheet.ts can't see these: they're this file's): every pose of the guests and the actors'
 *  faces, for a look. */
export const rfCartoonSheet = { drawDwayne, drawRhonda, drawFlatGuest, actorFace };

// ---------------------------------------------------------------------------------------------------------------
// His look's own bits (drawStitches does the seams): the beer still sloshing in him, or the valve he was pumped up by

const drawLook = (c: Ctx, state: GameState) => {
  void state;
  const at = dadNow();
  if (!at) return;
  const look = refightOn()?.look ?? 'normal';
  const top = at.feet - at.h;
  c.save();
  if (look === 'weakness') {
    // (the bike valve in his belly, its cap on a little chain; a tread mark sewn across him)
    const vx = at.x - at.face * 10, vy = top + at.h * 0.58;
    px(c, Math.round(vx - 1.5), Math.round(vy - 8), 3, 8, '#9CA3AF'); px(c, Math.round(vx - 2.5), Math.round(vy - 10), 5, 3, '#1F2937');
    px(c, Math.round(vx - 1), Math.round(vy - 8), 1, 7, '#E5E7EB');
  } else {
    // (beer dripping off him still, wrung out but never dry)
    for (let k = 0; k < 3; k++) {
      const t = ((state.frame + k * 29) % 70) / 70;
      ell(c, at.x - 16 + k * 14, top + at.h * (0.5 + t * 0.5), 1.6, 2.4, '#E9B23A');
    }
  }
  c.restore();
};

// (his place: DAD GUY, LIVE IN HELL (park4/place/cartoon.ts): the banner's line, the ON AIR box over it: only while
// this refight's on)
STAGE_HOOKS.bannerSub = () => (inRefight('cartoon') ? CARTOON_BANNER : null);
STAGE_HOOKS.shell = (c, f, bx, by) => { if (inRefight('cartoon')) drawOnAir(c, f, bx, by); };

export const cartoonRefight: RefightDef = {
  land: 'cartoon', id: refightId('cartoon'), stage: refightStage('cartoon'),
  boss: 'DAD GUY', sin: 'SLOTH',
  inner: cartoonLayout, cp: 62,
  sign: { pic: 'anvil', word: 'ANVIL', color: '#EC4899' },
  looks: ['normal', 'weakness'],
  lookNow: () => bossDeath('cartoon') ?? 'normal',
  lookName: l => (l === 'weakness' ? 'FLATTENED BY A STUNT CAR (WEAKNESS)' : 'DROWNED IN BEER'),
  swaps: () => [
    [A.DAD_ENTRANCE, L.RF_DAD_ENTRANCE],
    [A.DAD_BEER_FOR.mom, L.RF_DAD_BEER_FOR.mom], [A.DAD_BEER_FOR.boy, L.RF_DAD_BEER_FOR.boy], [A.DAD_BEER_FOR.sis, L.RF_DAD_BEER_FOR.sis], [A.DAD_BEER_FOR.gramps, L.RF_DAD_BEER_FOR.gramps],
    [A.MOM_SNARK, L.RF_MOM_SNARK], [A.BOY_SNARK, L.RF_BOY_SNARK], [A.SIS_SNARK, L.RF_SIS_SNARK], [A.GRAMPS_SNARK, L.RF_GRAMPS_SNARK],
    [A.DAD_BUNDY, L.RF_DAD_BUNDY], [A.DAD_SWAT, L.RF_DAD_SWAT], [A.DAD_CATCH, L.RF_DAD_CATCH], [A.DAD_MISS, L.RF_DAD_MISS], [A.DAD_BONK, L.RF_DAD_BONK],
    [A.DAD_PUKE, L.RF_DAD_PUKE], [A.DAD_RAGE, L.RF_DAD_RAGE], [A.DAD_TIRED, L.RF_DAD_TIRED], [A.DAD_HURT, L.RF_DAD_HURT],
    ...A.DAD_KILL.map((p, i) => [p, L.RF_DAD_KILL[i]] as [typeof p, typeof p]),
    [A.DAD_PATHETIC, L.RF_DAD_PATHETIC], [A.DAD_HEAVY, L.RF_DAD_HEAVY], [A.DAD_TAUNT, L.RF_DAD_TAUNT], [A.DAD_LOW, L.RF_DAD_LOW],
    [A.DAD_GRABBED, L.RF_DAD_GRABBED], [A.DAD_SEES_CAR, L.RF_DAD_SEES_CAR], [A.DAD_FRIDGE, L.RF_DAD_FRIDGE], [A.DAD_WOBBLE, L.RF_DAD_WOBBLE],
    [A.DAD_CRUSHED, L.RF_DAD_CRUSHED],
    [A.FETCH_TAPE.mom, L.RF_FETCH_TAPE.mom], [A.FETCH_TAPE.boy, L.RF_FETCH_TAPE.boy], [A.FETCH_TAPE.sis, L.RF_FETCH_TAPE.sis], [A.FETCH_TAPE.gramps, L.RF_FETCH_TAPE.gramps],
    [A.DIE_TAPE.mom, L.RF_DIE_TAPE.mom], [A.DIE_TAPE.boy, L.RF_DIE_TAPE.boy], [A.DIE_TAPE.sis, L.RF_DIE_TAPE.sis], [A.DIE_TAPE.gramps, L.RF_DIE_TAPE.gramps],
  ],
  place: cartoonPlace,
  arena: () => null,
  bossAt: () => dadNow(),
  stitches: look => look === 'weakness'
    // (flattened, pumped back up: a tire's tread sewn across him, patches where he split at the seams going flat)
    ? { thread: '#1A1A1A', patch: '#3F3F46', seams: [[0.0, 0.35, 1.0, 0.45], [0.0, 0.45, 1.0, 0.55], [0.3, 0.1, 0.35, 0.9]], patches: [[0.6, 0.2, 0.25, 0.12]], staples: [[0.2, 0.4], [0.8, 0.5]] }
    // (drowned in beer, wrung out: seams twisted round him like a towel, the beer stain)
    : { thread: '#F5F5F4', patch: '#D9A520', seams: [[0.0, 0.25, 1.0, 0.4], [0.0, 0.5, 1.0, 0.65], [0.0, 0.75, 1.0, 0.9]], staples: [[0.5, 0.33], [0.5, 0.58]], stain: { col: '#D9A520', k: 0.22 } },
  drawFront: drawLook,
};
