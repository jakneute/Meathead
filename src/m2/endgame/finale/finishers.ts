// THE KAIJU FINALE's finishers (the owner's: "They can fall over dead if you do nothing or if you pick up the water
// tower, you can do something funny to both of them. Think of it like a mortal Kombat finisher ... So there's 11: 9
// weapons, 1 water tower, 1 do nothing ... a 'full cutscene' of meathead comically killing both of them in each
// configuration", and "come up with a fittingly brutal and hilarious 'full cutscene' of both dying to the various
// methods"). Both of them dazed in Cartoon Land, the game won: FINISHER_COST hits that land with one weapon (either
// of them), or Y + B at the water tower, or nothing for a while: that one's cutscene. Full cutscene mode (the gym's
// scene player: the words in the box along the bottom, never bubbles; no HUD, no input; skip all of it).
//
// Each is a run of pictures (finisherArt.ts's brushes, drawn as fine as the fight: the scene's `res`): his line over the
// setup, then for each of them a spoken picture (what's coming at them, or what's left of them saying it) and a silent
// one (it happening), Satan first, then her; his line after over what's left. The lines' order never changes (his,
// Satan's, hers, his): the silent pictures go between. Then the ending's placeholder (index.ts), told which.

import { createScene, type Beat, type Scene } from '../../intro/gym/scene';
import { pickLine } from '../../../m1/game/platform/speech';
import { playSound } from '../../../m1/game/platform/audio';
import type { SoundType } from '../../../m1/types';
import { drawCarArt, drawStuntmanArt, type CarPaint } from '../../weapons/stuntCarArt';
import {
  type Ctx, type Dress, type MhPose, RES, GY, MX, SX, WX, BK, INK, BLOOD, GOO, SK, HIDE, COAT,
  R, ell, poly, line, blob, dither, hash, ease, clamp01, back, shadow, meathead, aiming, easy, folded, heldBig, satan, widow, satanTint, widowTint,
  splat, spray, smoke, fireball, flames, birds, hooves, slippers, skeleton, pancake, rug, husk, towerUp, cup, cupLegs, moai, eiffel, iceBlock, iceShards,
  goblin, dartsIn, pukeArc, satanHeadless, satanHead, widowHeadAt, bake,
} from './finisherArt';
import * as L from './lines';

export type FinId = 'GUN' | 'SOUVENIR' | 'SOUL_SUCKER' | 'FLINTLOCK' | 'SPELLBOOK' | 'STUNT_CAR' | 'MALLET' | 'SPAWNER' | 'CROSSBOW' | 'TOWER' | 'NOTHING';
/** What each takes (the owner's: "different values depending on which weapon or method used"): landed hits on either
 *  of them with that weapon (about 1.5 to 3 s of committed use, at each one's own pace: the counted hits are held to
 *  one per boss each 10 frames, as the stagger's are); the tower's just picking it up; nothing's frames of nothing. */
export const FINISHER_COST: Record<FinId, number> = {
  GUN: 8, SOUVENIR: 5, SOUL_SUCKER: 12, FLINTLOCK: 2, SPELLBOOK: 5, STUNT_CAR: 2, MALLET: 4, SPAWNER: 10, CROSSBOW: 12,
  TOWER: 1, NOTHING: 1200,
};
/** Each one's pip color (the counter by the pair as the hits go in). */
export const FINISHER_COLOR: Record<string, string> = {
  GUN: '#22D3EE', SOUVENIR: '#F59E0B', SOUL_SUCKER: '#B91C1C', FLINTLOCK: '#EF4444', SPELLBOOK: '#A855F7', STUNT_CAR: '#F97316', MALLET: '#EC4899', SPAWNER: '#84CC16', CROSSBOW: '#65A30D',
};
export const isFinWeapon = (w: string): w is FinId => w in FINISHER_COLOR;

// ---------------------------------------------------------------------------------------------------------------
// A finisher's pictures

interface Pic {
  /** Whose line's said over it (none: a silent picture, held `hold` frames). */
  say?: 'mh' | 'satan' | 'widow' | 'after';
  paint: (c: Ctx, t: number, d: Dress, talk: boolean) => void;
  hold?: number;
  sfx?: [SoundType, number, number][];
  /** (the contact sheet) Frames into it worth a look. */
  at?: number[];
}
/** The water tower, still standing behind them (every finisher but its own). */
const TWX = 92, TWY = 112;
const set = (c: Ctx, tower = true) => { back(c); if (tower) towerUp(c, TWX, TWY, 0.5); };
/** A screen shake for a slam: the first frames of a picture. */
const shake = (c: Ctx, t: number, amp = 2.4, n = 14) => { if (t < n) c.translate(0, Math.round(Math.sin(t * 2.4) * amp * (1 - t / n) * RES) / RES); };
const dazedPair = (c: Ctx, t: number, sTalk = false, wTalk = false, sx = SX, wx = WX) => { shadow(c, sx, 30); shadow(c, wx, 20); satan(c, 'dazed', t, sx, GY, 0, BK, -1, sTalk); widow(c, 'dazed', t, wx, GY, 0, BK, -1, wTalk); };
/** Dust thrown up off a slam at x: stepped puffs rolling out, `t` frames since. */
const dust = (c: Ctx, x: number, t: number, w = 30, y = GY) => {
  if (t > 40) return;
  const k = t / 40;
  for (let i = 0; i < 9; i++) { const s = i % 2 ? 1 : -1, d = (0.3 + hash(i * 3.3) * 0.7) * w * ease(k * 1.4), r = 3 + hash(i) * 4 + k * 3; c.globalAlpha = 0.75 * (1 - k); ell(c, x + s * d, y - 2 - hash(i * 7) * 6 * k * 3, r, r * 0.8, '#E8C8D8'); ell(c, x + s * d - r * 0.3, y - 3 - hash(i * 7) * 6 * k * 3 - r * 0.3, r * 0.5, r * 0.4, '#FFF0F6'); }
  c.globalAlpha = 1;
};
/** Impact lines round a hit at (x, y) for its first frames. */
const pow = (c: Ctx, x: number, y: number, t: number, r = 16, col = '#FDE047') => {
  if (t > 9) return;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 + 0.2, r0 = r * (0.5 + t / 18), r1 = r * (1 + t / 9) * (i % 2 ? 1 : 0.7); line(c, [x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.8, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.8], INK, 1.8); line(c, [x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.8, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.8], col, 1); }
};
/** Where his gun's muzzle is, aiming level from MX. */
const MZ: [number, number] = [MX + 30, GY - 24];

// ---------------------------------------------------------------------------------------------------------------
// The ray gun: Satan to his hooves, then her to her slippers; both pairs still talking

const rayBeam = (c: Ctx, x1: number, y1: number, t: number) => {
  const [x0, y0] = MZ;
  for (const [w, col] of [[5.4, INK], [4.2, '#9D174D'], [2.8, '#F472B6'], [1.2, '#FDF2F8']] as [number, number | string][]) line(c, [x0, y0, x1, y1], col as string, (w as number) + Math.sin(t * 1.3) * 0.5, 'butt');
  for (let k = 0; k < 5; k++) { const u = ((t * 0.09 + k / 5) % 1), x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; c.strokeStyle = '#FBCFE8'; c.lineWidth = 0.7; c.beginPath(); c.ellipse(x, y, 1.6, 4.4, 0, 0, Math.PI * 2); c.stroke(); }
  for (const r of [9, 6, 3]) ell(c, x1, y1, r + Math.sin(t) * 1, r + Math.sin(t) * 1, r === 9 ? 'rgba(244, 114, 182, 0.45)' : r === 6 ? '#F9A8D4' : '#FFFFFF');
};
/** One of them zapped: flickering between a white-hot body and its bones on black, then ash coming down. */
const zapped = (c: Ctx, who: 'satan' | 'widow', x: number, t: number) => {
  if (t < 34) {
    const jx = Math.sin(t * 2.2) * 1.2;
    if ((t >> 1) % 2) { if (who === 'satan') satanTint(c, 'zapw', 'dangleHit', '#F0FFFF', 0.86, x + jx); else widowTint(c, 'zapw', 'dangleHit', '#F0FFFF', 0.86, x + jx); }
    else { if (who === 'satan') satanTint(c, 'zapb', 'dangleHit', '#0A0A1E', 0.94, x + jx); else widowTint(c, 'zapb', 'dangleHit', '#0A0A1E', 0.94, x + jx); skeleton(c, x + jx, who, t); }
    return;
  }
  // (ash: the shape of them coming apart and down)
  const k = clamp01((t - 34) / 26);
  c.globalAlpha = 1 - k;
  for (let i = 0; i < 46; i++) { const px = x + (hash(i * 1.9) - 0.5) * (who === 'satan' ? 60 : 30), py0 = GY - 8 - hash(i * 5.3) * (who === 'satan' ? 80 : 70); R(c, px + Math.sin(i + t * 0.2) * 2, py0 + (GY - py0) * k * k, 1.6, 1.6, i % 3 ? '#3A3440' : '#6A6470'); }
  c.globalAlpha = 1;
};
const GUN: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); dazedPair(c, t); meathead(c, MX, d, aiming('GUN'), t); } },
  { hold: 62, sfx: [['raygun', 0.9, -4], ['raygun', 0.7, 0]], at: [6, 9, 44], paint: (c, t, d) => { set(c); shadow(c, WX, 20); widow(c, 'dazed', t); zapped(c, 'satan', SX, t); if (t >= 30) hooves(c, SX, t); if (t < 34) rayBeam(c, SX - 4, GY - 46, t); meathead(c, MX, d, aiming('GUN', 0, t < 34 ? 0.4 + Math.sin(t) * 0.2 : 0, 'roar'), t); } },
  { say: 'satan', paint: (c, t, d, talk) => { set(c); shadow(c, WX, 20); widow(c, 'dazed', t); c.save(); if (talk) c.translate(0, -Math.abs(Math.sin(t * 0.5)) * 1.4); hooves(c, SX, t); c.restore(); meathead(c, MX, d, easy('GUN'), t); } },
  { hold: 62, sfx: [['raygun', 0.9, 2], ['raygun', 0.7, 4]], at: [6, 9, 44], paint: (c, t, d) => { set(c); hooves(c, SX, t + 60); zapped(c, 'widow', WX, t); if (t >= 30) slippers(c, WX, t); if (t < 34) rayBeam(c, WX - 4, GY - 44, t); meathead(c, MX, d, aiming('GUN', 0, t < 34 ? 0.4 + Math.sin(t) * 0.2 : 0, 'roar'), t); } },
  { say: 'widow', paint: (c, t, d, talk) => { set(c); hooves(c, SX, t + 120); c.save(); if (talk) c.translate(0, -Math.abs(Math.sin(t * 0.55)) * 1.2); slippers(c, WX, t); c.restore(); meathead(c, MX, d, easy('GUN'), t); } },
  // (he blows across the dish)
  { say: 'after', paint: (c, t, d) => { set(c); hooves(c, SX, t + 180); slippers(c, WX, t + 60); meathead(c, MX, d, { hands: [[-6, 0], [13, -30]], weapon: 'GUN', aim: -1.25, mood: 'scowl', lean: -0.04 }, t); smoke(c, MX + 12, GY - 50, t, 3, '#F9A8D4', 16, 0.6); } },
];

// ---------------------------------------------------------------------------------------------------------------
// The souvenirs: the Easter Island head (the whole guy) down on Satan; the Eiffel tower through her like a pin

/** Satan under it: flat, his wings and claws out either side, the tail, twitching. */
const squashedSatan = (c: Ctx, x: number, t: number) => { satanTint(c, 'flat', 'dazed', '#000000', 0, x + Math.sin(t * 0.9) * 0.4, GY, 0, BK, 1.16, 0.2); };
const moaiEyes = (c: Ctx, x: number, top: number, look: number) => { for (const dx of [-5.6, 5.4]) { R(c, x + dx - 1 + look, top + 15.4, 2.2, 1.8, '#FDE047'); R(c, x + dx + look * 1.6, top + 15.8, 1, 1, INK); } };
const SOUVENIR: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); dazedPair(c, t); meathead(c, MX, d, aiming('SOUVENIR', -0.5), t); } },
  // (it's up there, coming down slow: its shadow on him, growing)
  { say: 'satan', sfx: [['whoosh', 0.6, -14]], at: [10, 120], paint: (c, t, d, talk) => {
    set(c); const k = clamp01(t / 260);
    shadow(c, WX, 20); widow(c, 'dazed', t); shadow(c, SX, 22 + k * 20, GY, 0.2 + k * 0.3); satan(c, 'dazed', t, SX, GY, 0, BK, -1, talk);
    moai(c, SX, -6 + k * 44, 76, Math.sin(t * 0.05) * 0.05);
    meathead(c, MX, d, aiming('SOUVENIR', -0.5, t < 8 ? 1 - t / 8 : 0, 'roar'), t);
  } },
  { hold: 64, sfx: [['boom', 1, -12], ['crunch', 0.9, -8]], at: [3, 30], paint: (c, t, d) => {
    shake(c, t, 3.4); set(c); const k = Math.min(1, t / 5);
    shadow(c, WX, 20); widow(c, 'dangleHit', t);
    if (k >= 1) { splat(c, SX, GY + 1, 34, BLOOD, 2); squashedSatan(c, SX, t); spray(c, SX, GY - 4, 14, clamp01((t - 5) / 26), BLOOD, 44, 5); }
    else satan(c, 'dazed', t);
    moai(c, SX, 40 + k * (GY - 40) + (k >= 1 ? 2 : 0), 76); dust(c, SX, t - 5, 44); pow(c, SX, GY - 4, t - 5, 26);
    meathead(c, MX, d, easy('SOUVENIR', 'grit'), t);
  } },
  // (the head's looking at her; the next one's up there already)
  { say: 'widow', at: [10, 120], paint: (c, t, d, talk) => {
    set(c); const k = clamp01(t / 260);
    splat(c, SX, GY + 1, 34, BLOOD, 2); squashedSatan(c, SX, t); moai(c, SX, GY + 2, 76); moaiEyes(c, SX, GY + 2 - 76, 1.2);
    shadow(c, WX, 14 + k * 12, GY, 0.2 + k * 0.3); widow(c, 'dazed', t, WX, GY, 0, BK, -1, talk);
    eiffel(c, WX + 2, -44 + k * 40, 62);
    meathead(c, MX, d, aiming('SOUVENIR', -0.6, t < 8 ? 1 - t / 8 : 0, 'roar'), t);
  } },
  { hold: 64, sfx: [['crunch', 1, -2], ['squish', 0.9, -6]], at: [3, 30], paint: (c, t, d) => {
    shake(c, t, 2.6); set(c); const k = Math.min(1, t / 5), q = k >= 1 ? Math.sin(t * 0.8) * Math.max(0, 1 - t / 40) * 0.05 : 0;
    splat(c, SX, GY + 1, 34, BLOOD, 2); squashedSatan(c, SX, t); moai(c, SX, GY + 2, 76); moaiEyes(c, SX, GY + 2 - 76, 1.2);
    if (k >= 1) { splat(c, WX + 4, GY + 1, 24, GOO, 7); widow(c, 'thrown', t, WX - 30, GY - 9, Math.PI / 2, BK); spray(c, WX + 4, GY - 12, 12, clamp01((t - 5) / 24), GOO, 34, 9); }
    else widow(c, 'dazed', t);
    eiffel(c, WX + 4, -4 + k * (GY - 6), 62, q); pow(c, WX + 4, GY - 10, t - 5, 20, '#A3E635');
    meathead(c, MX, d, easy('SOUVENIR', 'grit'), t);
  } },
  { say: 'after', paint: (c, t, d) => {
    set(c); splat(c, SX, GY + 1, 34, BLOOD, 2); squashedSatan(c, SX, 0); moai(c, SX, GY + 2, 76);
    splat(c, WX + 4, GY + 1, 24, GOO, 7); widow(c, 'thrown', 0, WX - 30, GY - 9, Math.PI / 2, BK); eiffel(c, WX + 4, GY - 10, 62);
    meathead(c, MX, d, easy('SOUVENIR'), t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The soul sucker: Satan in feet first, his horns caught in the nozzle a moment; her after him, housecoat first; the
// bag swells; he hoses the park down with the both of them

const NZ: [number, number] = [MX + 33, GY - 22];
/** One of them going in feet first: `k` 0 (lying where they were, feet to the nozzle) .. 1 (all the way in). */
const sucked = (c: Ctx, who: 'satan' | 'widow', k: number, t: number, talk: boolean) => {
  const len = (who === 'satan' ? 168 : 150) * BK, x0 = who === 'satan' ? SX - 44 : WX - 60;
  const fx = x0 + (NZ[0] - len * 1.25 - x0) * ease(k), fy = GY - 14 + (NZ[1] - GY + 14) * ease(Math.min(1, k * 1.6));
  const wob = Math.sin(t * 0.7) * 0.03;
  c.save(); c.beginPath(); c.rect(NZ[0] + 2, 0, 300, 144); c.clip();
  // (stretched along, thinned: the pull)
  c.translate(fx, fy); c.rotate(Math.PI / 2 + wob); c.scale(1 - k * 0.5, 1 + k * 0.5); c.translate(-fx, -fy);
  if (who === 'satan') satan(c, k > 0.02 ? 'dangle' : 'dazed', t, fx, fy, 0, BK, 1, talk); else widow(c, 'dangleHit', t, fx, fy, 0, BK, 1, talk);
  c.restore();
};
/** The pull: streaks into the nozzle. */
const pull = (c: Ctx, t: number) => { for (let i = 0; i < 9; i++) { const u = 1 - ((t * 0.06 + i / 9) % 1), a = (hash(i) - 0.5) * 0.9, x = NZ[0] + Math.cos(a) * u * 130, y = NZ[1] + Math.sin(a) * u * 90; c.globalAlpha = 0.5 * (1 - u); line(c, [x, y, x + Math.cos(a) * 9, y + Math.sin(a) * 9], '#FFFFFF', 0.8); } c.globalAlpha = 1; };
/** The gore bag on his back: `k` how full; what's poking out of it. */
const bag = (c: Ctx, k: number, t: number, horn = false, curler = false) => {
  const r = 6 + k * 13, x = MX - 9 - k * 6, y = GY - 22 - k * 6 + Math.sin(t * 0.3) * 0.5;
  line(c, [MX + 4, GY - 24, x + r * 0.6, y], INK, 3); line(c, [MX + 4, GY - 24, x + r * 0.6, y], '#52525B', 1.8);
  blob(c, x, y, r, r * 1.08, [BLOOD[1], BLOOD[2], BLOOD[4]]);
  for (let i = 0; i < 4; i++) line(c, [x - r * 0.7 + i * r * 0.4, y - r * 0.6, x - r * 0.6 + i * r * 0.4, y + r * 0.7], BLOOD[0], 0.5);
  if (horn) { c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * 0.3, y - r * 0.8); c.quadraticCurveTo(x - r * 0.9, y - r * 1.5, x - r * 0.2, y - r * 1.7); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 1.8; c.stroke(); c.lineCap = 'butt'; }
  if (curler) { R(c, x + r * 0.2, y - r * 1.16, 4.6, 3.2, INK); R(c, x + r * 0.2 + 0.4, y - r * 1.16 + 0.4, 3.8, 2.4, '#F472B6'); }
  for (let i = 0; i < 3; i++) { const u = ((t * 0.02 + i / 3) % 1); ell(c, x - r * 0.5 + i * r * 0.5, y + r + u * 8, 0.9, 1.4, BLOOD[3]); }
};
const suckPose = (kick = 0): MhPose => ({ ...aiming('SOUL_SUCKER', 0, kick, 'roar'), lean: -0.1, feet: [[-14, 0], [12, 0]] });
const SOUL_SUCKER: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); dazedPair(c, t); bag(c, 0, t); meathead(c, MX, d, aiming('SOUL_SUCKER'), t); pull(c, t); } },
  // (dragged, clawing: the furrows his claws leave)
  { say: 'satan', sfx: [['whoosh', 0.7, -10]], at: [10, 120], paint: (c, t, d, talk) => {
    set(c); const k = clamp01(t / 300) * 0.5 + 0.06;
    shadow(c, WX, 20); widow(c, 'dazed', t);
    for (const dy of [3, 7]) line(c, [SX + 60, GY + dy, SX + 60 - k * 150, GY + dy], '#9A4E80', 0.9);
    sucked(c, 'satan', k, t, talk); bag(c, 0, t); meathead(c, MX, d, suckPose(), t); pull(c, t);
  } },
  { hold: 60, sfx: [['squish', 1, -10], ['slurp', 0.9, -6]], at: [6, 16, 40], paint: (c, t, d) => {
    set(c); const k = 0.56 + clamp01(t / 12) * 0.44;
    shadow(c, WX, 20); widow(c, 'dangleHit', t);
    if (t < 22) sucked(c, 'satan', Math.min(0.9, k), t, false);
    // (the horns, stuck in the mouth of it a moment)
    if (t >= 12 && t < 26) for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 3.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(NZ[0] + 2, NZ[1] + s * 3); c.quadraticCurveTo(NZ[0] + 12, NZ[1] + s * 12, NZ[0] + 6 + (t - 12) * 0.3, NZ[1] + s * 16); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; }
    if (t >= 26) spray(c, NZ[0] + 4, NZ[1], 8, clamp01((t - 26) / 20), BLOOD, 18, 4);
    bag(c, clamp01((t - 14) / 16) * 0.5, t, t > 30); meathead(c, MX, d, suckPose(t >= 24 && t < 32 ? 1 : 0.2), t); pull(c, t);
  } },
  // (her housecoat first: off her and in; her after it, in her slip)
  { say: 'widow', at: [10, 120], paint: (c, t, d, talk) => {
    set(c); const k = clamp01(t / 300) * 0.45 + 0.06;
    sucked(c, 'widow', k, t, talk);
    const u = (t * 0.02) % 1, hx = WX - 50 - u * 110, hy = GY - 30 + (NZ[1] - GY + 30) * u;
    if (t < 50) { c.save(); c.translate(hx, hy); c.rotate(-0.2 + Math.sin(t * 0.4) * 0.2); c.scale(1.4 - u, 1 - u * 0.6); poly(c, [-9, -6, 9, -7, 11, 6, -10, 7], COAT[3], INK); R(c, -8, -5, 16, 2, COAT[5]); line(c, [-8, 0, 9, 0], COAT[1], 0.5); c.restore(); }
    bag(c, 0.5, t, true); meathead(c, MX, d, suckPose(), t); pull(c, t);
  } },
  { hold: 56, sfx: [['squish', 1, -4], ['slurp', 0.9, 0]], at: [6, 40], paint: (c, t, d) => {
    set(c); const k = 0.5 + clamp01(t / 14) * 0.5;
    if (t < 16) sucked(c, 'widow', Math.min(0.92, k), t, false);
    if (t >= 16) { ell(c, NZ[0] + 6 + (t - 16) * 0.2, NZ[1] + 2, 3.6, 1.6, INK); ell(c, NZ[0] + 6 + (t - 16) * 0.2, NZ[1] + 2, 3, 1.1, '#F9A8D4'); }
    bag(c, 0.5 + clamp01((t - 14) / 18) * 0.5, t, true, t > 26); meathead(c, MX, d, suckPose(t >= 16 && t < 24 ? 1 : 0.2), t); pull(c, t);
  } },
  // (the hose: the both of them, over the park)
  { say: 'after', sfx: [['squish', 0.6, 4]], at: [20, 90], paint: (c, t, d) => {
    set(c);
    for (const [x, r, s] of [[120, 26, 2], [170, 20, 4], [214, 24, 6], [84, 12, 8]] as const) splat(c, x, GY + 2 + (s % 4), r * clamp01(t / 50 + 0.3), BLOOD, s);
    // (the arc of it, pulsing; where it comes down)
    const sw = Math.sin(t * 0.06) * 30, x1 = 170 + sw, y1 = GY;
    for (const [w, col] of [[5, INK], [3.8, BLOOD[1]], [2.6, BLOOD[3]], [0.9, BLOOD[5]]] as [number, string][]) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(NZ[0], NZ[1] - 8); c.quadraticCurveTo((NZ[0] + x1) / 2, GY - 100, x1, y1); c.stroke(); c.lineCap = 'butt'; }
    spray(c, x1, y1 - 2, 12, ((t * 0.04) % 1), BLOOD, 22, 3);
    for (let i = 0; i < 5; i++) { const u = ((t * 0.03 + i / 5) % 1); R(c, NZ[0] + (x1 - NZ[0]) * u, NZ[1] - 8 - Math.sin(u * Math.PI) * 58 + (i % 2) * 3, 1.6, 1.6, i % 2 ? '#F9A8D4' : '#2A2422'); }
    bag(c, 1 - clamp01(t / 400) * 0.5, t, true, true);
    meathead(c, MX, d, { ...aiming('SOUL_SUCKER', -0.7, 0.3, 'yell'), lean: -0.12 }, t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The flintlock: one ball, two heads: Satan's pops, it goes on through her one eye; they fall into each other

const FSX = 126, FWX = 184, FM: [number, number] = [MX + 33, GY - 42];
const S_HEAD: [number, number] = [FSX, GY - 50], W_EYE: [number, number] = [FWX - 7, GY - 59];
const sight = (kick = 0): MhPose => ({ lean: -0.02 - kick * 0.1, hands: [[18, -34], [24 - kick * 5, -36]], weapon: 'FLINTLOCK', aim: -0.1 - kick * 0.5, mood: 'grit', head: [5, -36], headRot: 0.08, feet: [[-12, 0], [10, 0]] });
const laser = (c: Ctx, t: number, on = true) => {
  if (!on) return;
  const ex = W_EYE[0], ey = W_EYE[1];
  c.globalAlpha = 0.6 + Math.sin(t * 0.7) * 0.2; line(c, [FM[0], FM[1], ex, ey], '#EF4444', 0.6, 'butt'); c.globalAlpha = 1;
  for (const [x, y] of [S_HEAD, W_EYE] as [number, number][]) { ell(c, x - (x === S_HEAD[0] ? 6 : 0), y + (x === S_HEAD[0] ? -6 : 0), 2, 2, 'rgba(239, 68, 68, 0.5)'); ell(c, x - (x === S_HEAD[0] ? 6 : 0), y + (x === S_HEAD[0] ? -6 : 0), 0.9, 0.9, '#FECACA'); }
};
/** His head, burst: the bits of it, `k` how far they've got (frozen in the air for her line). */
const headBits = (c: Ctx, k: number) => {
  const [x, y] = S_HEAD;
  for (let i = 0; i < 22; i++) { const a = -0.9 + hash(i * 2.1) * 1.8, v = (14 + hash(i * 3.7) * 34) * k, px = x + Math.cos(a) * v, py = y - 6 + Math.sin(a) * v * 0.9, s = 1 + hash(i) * 2.4; ell(c, px, py, s + 0.5, s + 0.5, BLOOD[0]); ell(c, px, py, s, s, i % 4 === 0 ? '#F1EADA' : i % 3 ? BLOOD[3] : SK[4]); }
  // (the horns, going their own ways; an eye; the goatee)
  for (const s of [-1, 1]) { c.save(); c.translate(x + s * 10 * (1 + k) - 4, y - 16 - k * 16); c.rotate(s * (0.4 + k * 1.2)); c.strokeStyle = INK; c.lineWidth = 3.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(s * 5, 0, s * 2, -8); c.stroke(); c.strokeStyle = '#2A2422'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt'; c.restore(); }
  ell(c, x + 16 * k + 2, y - 14 * k - 4, 2.4, 2.4, INK); ell(c, x + 16 * k + 2, y - 14 * k - 4, 1.9, 1.9, '#FDE047'); ell(c, x + 16 * k + 2.6, y - 14 * k - 4, 0.7, 0.7, INK);
};
const ball = (c: Ctx, x: number, y: number, streak = 14) => { c.globalAlpha = 0.5; line(c, [x - streak, y + streak * 0.12, x, y], '#F8FAFC', 1.2, 'butt'); c.globalAlpha = 1; ell(c, x, y, 2.2, 2.2, INK); ell(c, x, y, 1.6, 1.6, '#3F3F46'); ell(c, x - 0.5, y - 0.5, 0.6, 0.6, '#D4D4D8'); };
const eyeHole = (c: Ctx, x = W_EYE[0], y = W_EYE[1]) => { ell(c, x, y, 4.6, 4, GOO[0]); ell(c, x, y, 3.4, 2.8, '#1A0408'); ell(c, x + 0.6, y + 0.4, 1.6, 1.2, '#F8E8C0'); for (let i = 0; i < 3; i++) line(c, [x - 2 + i * 2, y + 3, x - 2.4 + i * 2, y + 7 + i * 1.6], '#F8FAFC', 0.9); };
const FLINTLOCK: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c, false); dazedPair(c, t, false, false, FSX, FWX); meathead(c, MX, d, sight(), t); laser(c, t); } },
  { say: 'satan', paint: (c, t, d, talk) => { set(c, false); dazedPair(c, t, talk, false, FSX, FWX); meathead(c, MX, d, sight(), t); laser(c, t); } },
  { hold: 34, sfx: [['flintlock', 1, -6], ['squish', 0.9, -8]], at: [2, 20], paint: (c, t, d) => {
    shake(c, t, 1.6, 8); set(c, false); shadow(c, FSX, 30); shadow(c, FWX, 20);
    widow(c, 'dazed', t, FWX); satanHeadless(c, FSX, GY, 0, t); headBits(c, ease(Math.min(1, t / 26)) * 0.7);
    ball(c, S_HEAD[0] + 8 + Math.min(1, t / 34) * 14, S_HEAD[1] - 5);
    meathead(c, MX, d, sight(t < 10 ? 1 - t / 10 : 0), t);
    if (t < 6) { for (const r of [9, 6, 3]) ell(c, FM[0] + 4, FM[1] - 2, r, r * 0.8, r === 9 ? '#F97316' : r === 6 ? '#FDE047' : '#FFFFFF'); } else smoke(c, FM[0] + 2, FM[1] - 3, t * 3, 4, '#D4D4D8', 22, 0.7);
  } },
  // (slow: the ball still on its way, an inch a second, at her one eye)
  { say: 'widow', at: [10, 150], paint: (c, t, d, talk) => {
    set(c, false); shadow(c, FSX, 30); shadow(c, FWX, 20);
    widow(c, 'dazed', t, FWX, GY, 0, BK, -1, talk); satanHeadless(c, FSX, GY, 0, t * 0.15); headBits(c, 0.7 + clamp01(t / 600) * 0.1);
    const u = clamp01(t / 420), bx = S_HEAD[0] + 22 + u * (W_EYE[0] - S_HEAD[0] - 28), by = S_HEAD[1] - 5 + (W_EYE[1] - S_HEAD[1] + 5) * ((bx - S_HEAD[0]) / (W_EYE[0] - S_HEAD[0]));
    for (let i = 0; i < 4; i++) { c.globalAlpha = 0.5 - i * 0.1; c.strokeStyle = '#F8FAFC'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(bx - 4 - i * 5, by + 0.6 + i * 0.5, 1.4, 3 + i, 0, 0, Math.PI * 2); c.stroke(); } c.globalAlpha = 1;
    ball(c, bx, by, 8);
    meathead(c, MX, d, { ...sight(), mood: 'scowl' }, t); smoke(c, FM[0] + 2, FM[1] - 3, t * 0.4, 3, '#D4D4D8', 18, 0.6);
  } },
  { hold: 70, sfx: [['squish', 1, 2], ['thud', 0.9, -8]], at: [4, 24, 60], paint: (c, t, d) => {
    set(c, false);
    // (through; then the two of them over into each other)
    const k = ease(clamp01((t - 16) / 22)), sa = k * 0.42, wa = -k * 0.5;
    shadow(c, (FSX + FWX) / 2, 44);
    if (k > 0.9) splat(c, (FSX + FWX) / 2 + 2, GY + 2, 30, BLOOD, 3);
    satanHeadless(c, FSX, GY, sa, t);
    c.save(); c.translate(FWX, GY); c.rotate(wa); c.translate(-FWX, -GY); widow(c, 'dazed', 0, FWX); eyeHole(c); c.restore();
    if (t < 16) { spray(c, W_EYE[0] + 6, W_EYE[1], 12, t / 16, ['#1A2A0A', '#3A5A1A', '#E8F4F8', '#F8FAFC', '#FFFFFF'], 30, 6); ball(c, W_EYE[0] + 10 + t * 5, W_EYE[1] - 2 - t * 0.3); }
    headBits(c, 0.8 + clamp01(t / 30) * 0.5);
    if (t === 38 || t === 39) pow(c, (FSX + FWX) / 2, GY - 40, 3, 12, '#F8FAFC');
    meathead(c, MX, d, easy('FLINTLOCK', 'grit'), t);
  } },
  { say: 'after', paint: (c, t, d) => {
    set(c, false); shadow(c, (FSX + FWX) / 2, 44); splat(c, (FSX + FWX) / 2 + 2, GY + 2, 30, BLOOD, 3);
    satanHeadless(c, FSX, GY, 0.42, t * 0.1);
    c.save(); c.translate(FWX, GY); c.rotate(-0.5); c.translate(-FWX, -GY); widow(c, 'dazed', 0, FWX); eyeHole(c); c.restore();
    for (const [x, r] of [[230, 2.4], [216, 1.6], [244, 2]] as const) { ell(c, x, GY + 3, r + 2, r * 0.5 + 0.6, BLOOD[1]); ell(c, x, GY + 2, r, r, SK[3]); }
    // (he blows across the barrel)
    meathead(c, MX, d, { hands: [[-6, 0], [13, -30]], weapon: 'FLINTLOCK', aim: -1.2, mood: 'scowl', lean: -0.04 }, t); smoke(c, MX + 13, GY - 52, t, 3, '#D4D4D8', 16, 0.7);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The spellbook: ice on Satan (a devil popsicle), fire on her (the curlers, the hair spray); she runs into him, he
// shatters, she melts down onto the bits

const ICE_W = 96, ICE_H = 82;
const frozenSatan = (c: Ctx) => { satanTint(c, 'ice', 'dazed', '#7AB8F4', 0.6); iceBlock(c, SX, GY, ICE_W, ICE_H); };
const onFire = (c: Ctx, x: number, t: number, y = GY) => { flames(c, x - 16, x + 8, y - 68, 20, t, 5); flames(c, x - 14, x + 16, y - 30, 12, t + 9, 5); smoke(c, x - 4, y - 84, t * 2, 4, '#3A3440', 30, 0.6); };
const popsicle = (g: Ctx) => {
  // (in his fist: the stick, a chunk of ice on it with the top of Satan's head in it, a bite out of the corner)
  R(g, -1.6, -12, 3.2, 14, INK); R(g, -1, -12, 2, 13.4, '#E8C89A');
  poly(g, [-12, -12, -10, -34, 9, -36, 13, -14], 'rgba(150, 205, 250, 0.9)', INK, 1.2);
  ell(g, 0, -22, 7, 7, SK[3]); for (const s of [-1, 1]) { g.strokeStyle = '#2A2422'; g.lineWidth = 2; g.beginPath(); g.moveTo(s * 4, -27); g.quadraticCurveTo(s * 9, -29, s * 7, -34); g.stroke(); }
  R(g, -4, -24, 2.6, 1.4, '#FDE047'); R(g, 1.6, -24, 2.6, 1.4, '#FDE047'); R(g, -3, -19, 6, 1, INK);
  poly(g, [-12, -12, -10, -34, -6, -34, -8, -12], 'rgba(255, 255, 255, 0.45)'); ell(g, 11, -33, 4, 4, '#F2B878');
};
const SPELLBOOK: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); dazedPair(c, t); meathead(c, MX, d, aiming('SPELLBOOK', -0.2), t); } },
  // (the ice coming up him from the ground)
  { say: 'satan', sfx: [['ice', 0.8, -4]], at: [10, 80, 170], paint: (c, t, d, talk) => {
    set(c); const k = ease(clamp01(t / 150)), h = 10 + k * (ICE_H - 10);
    shadow(c, WX, 20); widow(c, 'dazed', t);
    satan(c, 'dazed', t, SX + Math.sin(t * 1.6) * 0.5 * (1 - k), GY, 0, BK, -1, talk);
    c.save(); c.beginPath(); c.rect(0, GY - h, 256, h + 10); c.clip(); satanTint(c, 'ice', 'dazed', '#7AB8F4', 0.6); c.restore();
    iceBlock(c, SX, GY, ICE_W, h);
    for (let i = 0; i < 3; i++) { const u = ((t * 0.02 + i / 3) % 1); c.globalAlpha = 0.6 * (1 - u); ell(c, SX - 8 - u * 14, GY - 46 - u * 6, 2 + u * 3, 1.6 + u * 2, '#E8F4FF'); } c.globalAlpha = 1;
    meathead(c, MX, d, aiming('SPELLBOOK', -0.2, t < 10 ? 1 - t / 10 : 0, 'yell'), t);
  } },
  { hold: 46, sfx: [['ignite', 1, -2], ['flame', 0.7, 0]], at: [4, 30], paint: (c, t, d) => {
    set(c); frozenSatan(c); shadow(c, WX, 20);
    // (the meteor down on her curlers)
    if (t < 10) { const u = t / 10, x = WX - 40 + u * 34, y = -10 + u * (GY - 76); line(c, [x - 16, y - 22, x, y], '#F97316', 3); line(c, [x - 12, y - 16, x, y], '#FDE047', 1.4); fireball(c, x, y, 7, 0.3, 2); widow(c, 'dazed', t); }
    else { widow(c, 'dangleHit', t, WX + Math.sin(t * 1.4)); onFire(c, WX, t); pow(c, WX - 4, GY - 72, t - 10, 14, '#F97316'); }
    meathead(c, MX, d, aiming('SPELLBOOK', -0.2, t < 8 ? 1 - t / 8 : 0, 'yell'), t);
  } },
  // (running about with it)
  { say: 'widow', sfx: [['flame', 0.6, 2]], at: [10, 60], paint: (c, t, d, talk) => {
    set(c); frozenSatan(c);
    const x = WX + 4 + Math.sin(t * 0.09) * 16, dir = Math.cos(t * 0.09) > 0 ? 1 : -1;
    shadow(c, x, 16); widow(c, 'walk', t * 2.4, x, GY, 0, BK, dir, talk); onFire(c, x + dir * 2, t);
    for (let i = 0; i < 3; i++) { const u = ((t * 0.03 + i / 3) % 1); R(c, x - dir * (8 + u * 14), GY - 2 - u * 3, 1.6, 1.6, '#F97316'); }
    meathead(c, MX, d, easy('SPELLBOOK', 'grit'), t);
  } },
  { hold: 84, sfx: [['glass', 1, -6], ['crash', 0.9, -4]], at: [6, 18, 70], paint: (c, t, d) => {
    set(c);
    const hit = 10;
    if (t < hit) { frozenSatan(c); const x = WX - (t / hit) * (WX - SX - 44); widow(c, 'walk', t * 3, x, GY, 0, BK, -1); onFire(c, x - 2, t); }
    else {
      const k = clamp01((t - hit) / 16), m = ease(clamp01((t - hit - 8) / 44));
      shake(c, t - hit, 2.6);
      // (him in pieces, going everywhere; then lying)
      if (k < 1) for (let i = 0; i < 26; i++) { const a = -Math.PI * hash(i * 1.3), v = (20 + hash(i * 4.1) * 50) * k, px = SX + Math.cos(a) * v, py = Math.min(GY - 2, GY - 36 + Math.sin(a) * v + k * k * 46), s = 2 + hash(i) * 5; poly(c, [px - s, py + s * 0.5, px - s * 0.4, py - s, px + s, py - s * 0.5, px + s * 0.6, py + s], i % 3 ? 'rgba(170, 215, 250, 0.8)' : SK[3], INK, 0.5); }
      else iceShards(c, SX - 52, SX + 58, 22, 3);
      pow(c, SX + 30, GY - 40, t - hit, 22, '#DCEEFF');
      // (her, melting: going down into herself, the fire with her)
      const wx = SX + 46;
      if (m < 1) { c.save(); c.translate(wx, GY); c.scale(1 + m * 0.5, 1 - m * 0.86); c.translate(-wx, -GY); widowTint(c, 'burnt', 'dangleHit', '#140A06', 0.72, wx); c.restore(); }
      ell(c, wx, GY + 2, 10 + m * 20, 1.4 + m * 2.4, '#1A0E08'); ell(c, wx - 2, GY + 1.6, 6 + m * 14, 0.8 + m * 1.4, '#3A2414');
      if (m >= 1) husk(c, wx, 'widow', 30);
      flames(c, wx - 12 - m * 6, wx + 12 + m * 6, GY - (1 - m) * 60 - 2, 14 - m * 6, t, 6);
    }
    meathead(c, MX, d, easy('SPELLBOOK', 'grit'), t);
  } },
  { say: 'after', paint: (c, t, d) => {
    set(c); iceShards(c, SX - 52, SX + 58, 22, 3);
    const wx = SX + 46; ell(c, wx, GY + 2, 30, 3.8, '#1A0E08'); ell(c, wx - 2, GY + 1.6, 20, 2.2, '#3A2414'); husk(c, wx, 'widow', 30); flames(c, wx - 14, wx + 14, GY - 3, 7, t, 6); smoke(c, wx, GY - 10, t, 4, '#3A3440', 34, 0.5);
    // (the popsicle: he's kept the best bit)
    meathead(c, MX, d, { hands: [[-6, 0], [16, -24]], prop: popsicle, mood: 'grit', lean: -0.03 }, t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The stunt car, giant: down on Satan flat; the stuntman out through the windshield into her; the fireball

const CAR: CarPaint = { body: '#DC2626', top: '#F87171', low: '#991B1B', stripe: '#FFFFFF' };
const CAR_S = 1.02;
const car = (c: Ctx, x: number, y: number, rot: number, t: number, dents = 0, driver = true) => drawCarArt(c, x, y, CAR_S, 1, t, rot, 0, CAR, { driver, dents, trail: false });
const clap = (shut: boolean): MhPose => ({ hands: [[14, -40], [18, -44]], weapon: 'STUNT_CAR', aim: shut ? -0.5 : -0.9, mood: 'yell', lean: -0.06, head: [4, -37] });
const carOn = (c: Ctx, t: number, driver = false) => { splat(c, SX, GY + 2, 36, BLOOD, 4); satanTint(c, 'flat', 'dazed', '#000000', 0, SX, GY, 0, BK, 1.2, 0.16); car(c, SX, GY - 13, 0.03, 0, 3, driver); smoke(c, SX + 22, GY - 22, t, 4, '#E5E7EB', 26, 0.6); };
const STUNT_CAR: Pic[] = [
  { say: 'mh', sfx: [['click', 0.9, 0]], paint: (c, t, d) => { set(c); dazedPair(c, t); meathead(c, MX, d, clap(t > 10), t); } },
  // (up there, end over end, coming down on him)
  { say: 'satan', sfx: [['engine', 0.8, -8]], at: [10, 110], paint: (c, t, d, talk) => {
    set(c); const k = clamp01(t / 240);
    shadow(c, WX, 20); widow(c, 'dazed', t); shadow(c, SX, 26 + k * 16, GY, 0.2 + k * 0.3); satan(c, 'dazed', t, SX, GY, 0, BK, -1, talk);
    car(c, SX - 30 + k * 30, 6 + k * 30, t * 0.07, t * 4);
    meathead(c, MX, d, clap(true), t);
  } },
  { hold: 44, sfx: [['crash', 1, -10], ['boom', 0.8, -14]], at: [3, 24], paint: (c, t, d) => {
    shake(c, t, 3.6); set(c); const k = Math.min(1, t / 5);
    shadow(c, WX, 20); widow(c, 'dangleHit', t);
    if (k < 1) { satan(c, 'dazed', t); car(c, SX, 40 + k * (GY - 53), 0.5 * (1 - k), 0); }
    else { carOn(c, t, t < 8); spray(c, SX, GY - 4, 14, clamp01((t - 5) / 24), BLOOD, 46, 6); }
    dust(c, SX, t - 5, 50); pow(c, SX, GY - 8, t - 5, 30);
    // (the stuntman, out through the windshield, glass with him)
    if (t >= 8) { const u = clamp01((t - 8) / 70), x = SX + 14 + u * 22, y = GY - 30 - u * 18; drawStuntmanArt(c, x, y, 0.62, 1, 1.2, 'dive', t); for (let i = 0; i < 8; i++) R(c, SX + 12 + hash(i) * 14 + u * 20 * hash(i * 3), GY - 28 - hash(i * 5) * 14 - u * 10 + u * u * 20, 1.4, 1.4, '#BFE8F8'); }
    meathead(c, MX, d, clap(true), t);
  } },
  // (slow: him on his way at her, arms out)
  { say: 'widow', at: [10, 120], paint: (c, t, d, talk) => {
    set(c); carOn(c, t); shadow(c, WX, 20); widow(c, 'dazed', t, WX, GY, 0, BK, -1, talk);
    const u = clamp01(t / 420), x = SX + 36 + u * (WX - SX - 62), y = GY - 48 - Math.sin(u * Math.PI) * 4;
    for (let i = 0; i < 4; i++) { c.globalAlpha = 0.4 - i * 0.08; line(c, [x - 12 - i * 6, y + 4 + i, x - 20 - i * 6, y + 5 + i], '#FFFFFF', 0.8); } c.globalAlpha = 1;
    drawStuntmanArt(c, x, y, 0.62, 1, 1.35, 'dive', t);
    meathead(c, MX, d, clap(true), t);
  } },
  { hold: 76, sfx: [['boom', 1, -8], ['nuke', 0.5, -4]], at: [3, 20, 60], paint: (c, t, d) => {
    shake(c, t, 3, 20); set(c);
    carOn(c, t);
    if (t < 4) { widow(c, 'dangleHit', t); drawStuntmanArt(c, WX - 22, GY - 50, 0.62, 1, 1.35, 'dive', t); }
    else { widowTint(c, 'burnt', 'dangleHit', '#140A06', 0.72, WX); fireball(c, (SX + WX) / 2 + 14, GY - 40, 64, clamp01((t - 4) / 70), 3); fireball(c, SX, GY - 24, 34, clamp01((t - 10) / 60), 6); }
    meathead(c, MX, d, { ...clap(true), mood: 'roar', lean: -0.16 }, t);
  } },
  { say: 'after', sfx: [['click', 0.9, 0]], paint: (c, t, d) => {
    set(c); splat(c, SX, GY + 2, 36, BLOOD, 4); satanTint(c, 'flat', 'dazed', '#000000', 0, SX, GY, 0, BK, 1.2, 0.16);
    c.save(); c.translate(SX, GY - 13); c.rotate(0.03); c.translate(-SX, -GY + 13); bake(c, 'car-burnt', SX - 60, GY - 50, 120, 60, g => { car(g, SX, GY - 13, 0, 0, 3, false); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.78; g.fillStyle = '#140A06'; g.fillRect(0, 0, g.canvas.width, g.canvas.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }); c.restore();
    flames(c, SX - 30, SX + 30, GY - 24, 16, t, 7); smoke(c, SX, GY - 40, t, 5, '#2A2630', 44, 0.6);
    // (her: a cinder stood there, her slippers the only pink left; bits dropping off it)
    widowTint(c, 'burnt', 'dangleHit', '#140A06', 0.72, WX); for (const s of [-1, 1]) { ell(c, WX + s * 6 - 1, GY - 1.4, 5, 2.2, INK); ell(c, WX + s * 6 - 1, GY - 1.4, 4.4, 1.7, '#F9A8D4'); }
    smoke(c, WX - 4, GY - 80, t + 30, 4, '#2A2630', 30, 0.6); for (let i = 0; i < 3; i++) { const u = ((t * 0.015 + i / 3) % 1); R(c, WX - 10 + i * 9, GY - 60 + u * 58, 1.6, 1.6, '#140A06'); }
    meathead(c, MX, d, clap(t % 90 > 12), t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The mallet: Satan pancaked, then her; rolled up like rugs and off under his arm

const MSX = 150, MWX = 216;
const wind = (t: number): MhPose => ({ lean: -0.3, hands: [[-10, -50], [-4, -54]], prop: heldBig('MALLET', 2.2, t), aim: -1.9, mood: 'roar', feet: [[-14, 0], [12, 0]], head: [1, -37], behind: true });
const slam = (t: number): MhPose => ({ lean: 0.5, hipY: -19, hands: [[20, -14], [26, -12]], prop: heldBig('MALLET', 2.2, t), aim: -0.25, mood: 'roar', feet: [[-18, 0], [16, 0]], head: [8, -35] });
const shoulder = (t: number): MhPose => ({ lean: -0.04, hands: [[-6, 0], [12, -30]], prop: heldBig('MALLET', 1.6, t), aim: -2.4, mood: 'scowl', behind: true });
const flatSatan = (c: Ctx, t: number, talk = false) => { c.save(); if (talk) c.translate(0, Math.sin(t * 0.8) * 0.5); pancake(c, MSX, 'satan', 56); c.restore(); birds(c, MSX, GY - 14, t); };
const flatWidow = (c: Ctx, t: number, talk = false) => { c.save(); if (talk) c.translate(0, Math.sin(t * 0.8) * 0.5); pancake(c, MWX, 'widow', 44); c.restore(); birds(c, MWX, GY - 13, t + 20, 2); };
const MALLET: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c, false); dazedPair(c, t, false, false, MSX, MWX); meathead(c, MSX - 56, d, wind(t), t); } },
  { hold: 40, sfx: [['bonk', 1, -12], ['slam', 0.9, -10]], at: [2, 5, 24], paint: (c, t, d) => {
    shake(c, t - 3, 3.4); set(c, false); shadow(c, MWX, 20); widow(c, t > 3 ? 'dangleHit' : 'dazed', t, MWX);
    if (t < 3) { satan(c, 'dazed', t, MSX); meathead(c, MSX - 56, d, wind(t), t); }
    else { flatSatan(c, t); dust(c, MSX, t - 3, 46); meathead(c, MSX - 50, d, slam(t), t); pow(c, MSX - 4, GY - 10, t - 3, 30); }
  } },
  { say: 'satan', paint: (c, t, d, talk) => { set(c, false); shadow(c, MWX, 20); widow(c, 'dazed', t, MWX); flatSatan(c, t, talk); meathead(c, MSX - 54, d, shoulder(t), t); } },
  { hold: 40, sfx: [['bonk', 1, -6], ['slam', 0.9, -6]], at: [2, 5, 24], paint: (c, t, d) => {
    shake(c, t - 3, 3.4); set(c, false); flatSatan(c, t);
    if (t < 3) { widow(c, 'dazed', t, MWX); meathead(c, MWX - 50, d, wind(t), t); }
    else { flatWidow(c, t); dust(c, MWX, t - 3, 40); meathead(c, MWX - 46, d, slam(t), t); pow(c, MWX - 2, GY - 10, t - 3, 26, '#F9A8D4'); }
  } },
  { say: 'widow', paint: (c, t, d, talk) => { set(c, false); flatSatan(c, t); flatWidow(c, t, talk); meathead(c, MWX - 52, d, shoulder(t), t); } },
  // (rolled up, under his arm; the two dents where they were)
  { say: 'after', paint: (c, t, d) => {
    set(c, false);
    for (const [x, w] of [[MSX, 30], [MWX, 24]] as const) { ell(c, x, GY + 1, w, 4.4, '#C074A0'); ell(c, x, GY + 1.6, w - 2, 3.4, '#D888B4'); }
    const step = Math.sin(t * 0.2);
    const carry = (g: Ctx) => { g.save(); g.rotate(-0.06); g.scale(1 / 0.6, 1 / 0.6); rug(g, 2, -3, 'widow', 30, 4); rug(g, 0, 5.4, 'satan', 36, 4.6); g.restore(); };
    meathead(c, 84, d, { hands: [[-8 - step * 4, -2], [10, -8]], prop: carry, mood: 'grit', feet: [[-9 - step * 6, 0], [9 + step * 6, 0]], lean: 0.05, behind: false }, t, -1);
    birds(c, 84 + 16, GY - 12, t, 2);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The spawner: the goblins on him (his wings chewed to the struts), then her (in the curlers); two skeletons stood
// there; the goblins full

/** A swarm on one of them: `n` goblins over its box, crawling; `k` how thick (the dust of a feeding frenzy). */
const swarm = (c: Ctx, x: number, w: number, h: number, n: number, t: number, frenzy = 0) => {
  if (frenzy > 0) for (let i = 0; i < 10; i++) { const a = i * 0.7 + t * 0.2, r = 6 + hash(i) * 8; c.globalAlpha = 0.8 * frenzy; ell(c, x + Math.cos(a) * w * 0.3, GY - h * 0.5 + Math.sin(a * 1.3) * h * 0.4, r, r * 0.8, i % 2 ? '#E8C8D8' : '#FFF0F6'); } c.globalAlpha = 1;
  for (let i = 0; i < n; i++) { const px = x + (hash(i * 2.3) - 0.5) * w + Math.sin(t * 0.3 + i) * 2, py = GY - 4 - hash(i * 5.1) * h + Math.cos(t * 0.25 + i * 2) * 2; goblin(c, px, py, i % 2 ? 1 : -1, t + i * 3, i, 1.1 + hash(i) * 0.5); }
  if (frenzy > 0) for (let i = 0; i < 6; i++) { const a = t * 0.5 + i; line(c, [x + Math.cos(a) * w * 0.5, GY - h * 0.5 + Math.sin(a) * h * 0.5, x + Math.cos(a) * w * 0.62, GY - h * 0.5 + Math.sin(a) * h * 0.62], INK, 0.8); }
};
/** Out of the spawner: a stream of them, hopping across. */
const stream = (c: Ctx, x1: number, t: number, n = 7) => { for (let i = 0; i < n; i++) { const u = ((t * 0.02 + i / n) % 1), x = MZ[0] + u * (x1 - MZ[0]), y = GY - Math.abs(Math.sin(u * Math.PI * 4 + i)) * 10 - (1 - u) * 16 * (u < 0.15 ? 1 : 0); goblin(c, x, y, 1, t + i * 5, i, 1.2); } };
const fed = (c: Ctx, x: number, t: number, n: number, curler = -1) => { for (let i = 0; i < n; i++) { const gx = x + (i - n / 2) * 8 + 4; ell(c, gx, GY + 0.6, 3.6, 1, 'rgba(60, 20, 50, 0.3)'); goblin(c, gx, GY, -1, 0, i + 1, 1.5); ell(c, gx - 0.4, GY - 2.6, 3, 2.4, ['#5FA83A', '#84A82A', '#3FA36A'][(i + 1) % 3]); if (i === curler) { R(c, gx - 2.4, GY - 12.4, 5, 3, INK); R(c, gx - 2, GY - 12, 4.2, 2.2, '#F472B6'); } if ((Math.floor(t / 30) + i) % 4 === 0) { c.globalAlpha = 0.7; ell(c, gx - 5, GY - 9 - (t % 30) * 0.2, 1.6, 1.2, '#D9F99D'); c.globalAlpha = 1; } } };
const SPAWNER: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); dazedPair(c, t); meathead(c, MX, d, aiming('SPAWNER'), t); stream(c, SX - 30, t, 5); } },
  { say: 'satan', sfx: [['squish', 0.6, 8]], at: [10, 80], paint: (c, t, d, talk) => {
    set(c); shadow(c, WX, 20); widow(c, 'dazed', t); shadow(c, SX, 30);
    satan(c, 'held', t * 2, SX + Math.sin(t * 0.9) * 0.8, GY, 0, BK, -1, talk); swarm(c, SX, 80, 80, 26, t);
    meathead(c, MX, d, aiming('SPAWNER', 0, 0.2), t); stream(c, SX - 30, t, 6);
  } },
  { hold: 60, sfx: [['crunch', 1, 2], ['squish', 0.8, 6]], at: [8, 50], paint: (c, t, d) => {
    set(c); shadow(c, WX, 20); widow(c, 'dangleHit', t);
    const k = clamp01(t / 34);
    if (k < 0.5) satan(c, 'held', t * 3, SX, GY); else skeleton(c, SX, 'satan', t);
    if (k < 1) swarm(c, SX, 80, 84, 34, t * 2, 1 - Math.abs(k - 0.5) * 2); else fed(c, SX, t, 5);
    meathead(c, MX, d, easy('SPAWNER', 'grit'), t);
  } },
  { say: 'widow', sfx: [['squish', 0.6, 10]], at: [10, 80], paint: (c, t, d, talk) => {
    set(c); skeleton(c, SX, 'satan', t); fed(c, SX, t, 3); shadow(c, WX, 20);
    widow(c, 'held', t * 2, WX + Math.sin(t * 0.9) * 0.8, GY, 0, BK, -1, talk); swarm(c, WX, 40, 62, 12, t);
    // (the nest in her curlers)
    for (let i = 0; i < 6; i++) goblin(c, WX + 2 + (i - 2.5) * 4 + Math.sin(t * 0.4 + i), GY - 80 - (i % 2) * 3, i % 2 ? 1 : -1, t + i * 4, i, 1.2);
    meathead(c, MX, d, aiming('SPAWNER', 0, 0.2), t); stream(c, WX - 26, t, 6);
  } },
  { hold: 60, sfx: [['crunch', 1, 6], ['squish', 0.8, 10]], at: [8, 50], paint: (c, t, d) => {
    set(c); skeleton(c, SX, 'satan', t); fed(c, SX, t, 3);
    const k = clamp01(t / 34);
    if (k < 0.5) widow(c, 'held', t * 3, WX, GY); else skeleton(c, WX, 'widow', t);
    if (k < 1) swarm(c, WX, 46, 76, 30, t * 2, 1 - Math.abs(k - 0.5) * 2); else fed(c, WX, t, 4, 1);
    meathead(c, MX, d, easy('SPAWNER', 'grit'), t);
  } },
  // (two skeletons; the goblins, full, turning to look at him)
  { say: 'after', paint: (c, t, d) => {
    set(c); shadow(c, SX, 16); shadow(c, WX, 12); skeleton(c, SX, 'satan', t); skeleton(c, WX, 'widow', t);
    fed(c, SX + 4, t, 5); fed(c, WX, t, 4, 1); fed(c, 96, t, 3);
    meathead(c, MX, d, d === 'clean' ? easy('SPAWNER') : { ...easy('SPAWNER', 'yell'), lean: -0.16, hands: [[-12, -18], [16, -6]] }, t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The crossbow: darts in both till they're green; he hurls on her, she hurls back; they go at it till they're empty

const S_DARTS = [[-30, -80, 2.6], [22, -70, 0.4], [-8, -52, 2.2], [34, -96, 0.2], [-36, -110, 2.9], [10, -30, 1.2]] as const;
const W_DARTS = [[-18, -70, 2.7], [20, -84, 0.3], [-10, -44, 2.4], [24, -52, 0.6], [4, -118, 1.4]] as const;
const sick = (c: Ctx, who: 'satan' | 'widow', pose: string, x: number, jit = 0, sy = 1, sx = 1) => {
  if (who === 'satan') satanTint(c, `sick-${pose}`, pose as 'dazed', '#65A30D', 0.42, x + jit, GY, 0, BK, sx, sy); else widowTint(c, `sick-${pose}`, pose as 'dazed', '#65A30D', 0.3, x + jit, GY, 0, BK, sx, sy);
  const crouch = pose === 'dazed' ? (who === 'satan' ? 34 : 30) : 0;
  c.save(); c.translate(x + jit, GY); c.scale(-BK * sx, BK * sy); c.translate(0, crouch); dartsIn(c, who === 'satan' ? S_DARTS : W_DARTS); c.restore();
};
const S_MOUTH: [number, number] = [SX - 2, GY - 43], W_MOUTH: [number, number] = [WX - 12, GY - 52];
const slop = (c: Ctx, x: number, y0: number, w: number, t: number) => { for (let i = 0; i < 7; i++) { const px = x - w / 2 + (i / 6) * w, l = 6 + hash(i * 3) * 14 + Math.sin(t * 0.1 + i) * 2; R(c, px - 1.6, y0 + hash(i) * 8, 3.2, l, '#5E8A18'); R(c, px - 1, y0 + hash(i) * 8, 2, l - 0.6, '#A3E635'); ell(c, px, y0 + hash(i) * 8 + l, 1.9, 2.2, '#A3E635'); } };
const CROSSBOW: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); shadow(c, SX, 30); shadow(c, WX, 20); sick(c, 'satan', 'dazed', SX, Math.sin(t * 0.5) * 0.4); sick(c, 'widow', 'dazed', WX, Math.cos(t * 0.5) * 0.4); meathead(c, MX, d, aiming('CROSSBOW'), t); } },
  // (it's coming up: cheeks out, a hand up)
  { say: 'satan', at: [10, 80], paint: (c, t, d) => {
    set(c); shadow(c, SX, 30); shadow(c, WX, 20); sick(c, 'widow', 'dazed', WX, 0);
    sick(c, 'satan', 'dazed', SX, Math.sin(t * 1.4) * 1.2);
    const b = 2 + Math.abs(Math.sin(t * 0.2)) * 2.6; for (const s of [-1, 1]) blob(c, S_MOUTH[0] + s * 8, S_MOUTH[1] - 1, b + 2, b + 1, ['#5E8A18', '#84A82A', '#C8E86A']);
    for (let i = 0; i < 3; i++) { const u = ((t * 0.03 + i / 3) % 1); ell(c, S_MOUTH[0] - 14 + i * 14, S_MOUTH[1] - 30 - u * 8, 1.2, 1.8, '#BFE8F8'); }
    meathead(c, MX, d, aiming('CROSSBOW', 0, 0, 'scowl'), t);
  } },
  { hold: 56, sfx: [['barf', 1, -8], ['squish', 0.8, -4]], at: [6, 40], paint: (c, t, d) => {
    set(c); shadow(c, SX, 30); shadow(c, WX, 20);
    sick(c, 'widow', 'dazed', WX, Math.sin(t) * 0.6); slop(c, WX - 4, GY - 62, 30, t); ell(c, WX - 4, GY + 2, 16 + t * 0.2, 2.6, '#84CC16');
    sick(c, 'satan', 'dazed', SX, Math.sin(t * 1.8) * 0.8);
    pukeArc(c, S_MOUTH[0] + 4, S_MOUTH[1], WX - 8, GY - 56, t, -18, 4.4);
    meathead(c, MX, d, { ...easy('CROSSBOW', 'yell'), lean: -0.14 }, t);
  } },
  { say: 'widow', at: [10, 80], paint: (c, t, d, talk) => {
    set(c); shadow(c, SX, 30); shadow(c, WX, 20); ell(c, WX - 4, GY + 2, 26, 3, '#84CC16');
    sick(c, 'satan', 'dazed', SX, 0); line(c, [S_MOUTH[0], S_MOUTH[1] + 2, S_MOUTH[0] + 1, S_MOUTH[1] + 10 + Math.sin(t * 0.1) * 2], '#A3E635', 1.6);
    widow(c, 'dazed', t, WX + Math.sin(t * 1.2) * 0.8, GY, 0, BK, -1, talk); c.save(); c.translate(WX, GY); c.scale(-BK, BK); c.translate(0, 30); dartsIn(c, W_DARTS); c.restore();
    slop(c, WX - 4, GY - 64, 32, t); slop(c, WX + 2, GY - 40, 26, t + 40);
    meathead(c, MX, d, { ...easy('CROSSBOW', 'grit'), lean: -0.1 }, t);
  } },
  // (at each other, going down as they empty)
  { hold: 110, sfx: [['barf', 1, -2], ['barf', 0.9, -10]], at: [10, 60, 104], paint: (c, t, d) => {
    set(c); const k = ease(clamp01((t - 20) / 86)), sy = 1 - k * 0.8, sx = 1 + k * 0.2;
    ell(c, (SX + WX) / 2, GY + 2, 30 + k * 34, 3 + k * 2.6, '#5E8A18'); ell(c, (SX + WX) / 2 - 2, GY + 1.6, 26 + k * 32, 2 + k * 2, '#84CC16'); ell(c, (SX + WX) / 2 - 10, GY + 1, 10 + k * 14, 0.8 + k, '#D9F99D');
    sick(c, 'satan', 'dazed', SX, Math.sin(t * 1.8) * 0.8, sy, sx); sick(c, 'widow', 'dazed', WX, Math.cos(t * 1.8) * 0.8, sy, sx);
    if (k < 0.96) { const w = 4.4 * (1 - k * 0.6); pukeArc(c, S_MOUTH[0] + 4, GY - 43 * sy, WX - 8, GY - 50 * sy, t, -16 * sy, w); pukeArc(c, W_MOUTH[0], GY - 52 * sy, SX + 4, GY - 40 * sy, t + 7, -30 * sy, w); }
    meathead(c, MX, d, { ...folded('grit'), lean: -0.12 }, t);
  } },
  { say: 'after', paint: (c, t, d) => {
    set(c); const reach = d === 'nude' ? 78 : 64;
    ell(c, (SX + WX) / 2 - (reach - 64), GY + 2, reach, 5.6, '#5E8A18'); ell(c, (SX + WX) / 2 - 2 - (reach - 64), GY + 1.6, reach - 4, 4, '#84CC16'); ell(c, (SX + WX) / 2 - 14, GY + 1, 22, 1.6, '#D9F99D');
    husk(c, SX, 'satan', 40); husk(c, WX, 'widow', 32);
    for (const [x, y, a] of [[SX - 8, GY - 6, -1.2], [SX + 10, GY - 5, -1.9], [WX + 2, GY - 6, -1.5]] as const) { c.save(); c.translate(x, y); c.scale(0.5, 0.5); dartsIn(c, [[0, 0, a]]); c.restore(); }
    for (let i = 0; i < 4; i++) { const u = ((t * 0.01 + i / 4) % 1); c.globalAlpha = 0.5 * (1 - u); ell(c, SX + i * 22, GY - 6 - u * 20, 2 + u * 2, 1.6 + u * 2, '#BEE86A'); } c.globalAlpha = 1;
    meathead(c, MX, d, easy('CROSSBOW'), t);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// The water tower: up out of the ground and down over the both of them like a cup on two bugs; it fills from the
// busted pipes; Satan can't swim; she floats up still talking about her boy

const CX = 176, CR = 52, CH = CR * 1.56;
/** Inside the cup (its own frame: the ground 0, x about its middle): the water to `lvl` (0..1 of the window), them. */
const inCup = (lvl: number, t: number, stage: 0 | 1 | 2, sTalk = false, wTalk = false) => (g: Ctx) => {
  const top = -CH * 0.57, wy = top * lvl, k = 0.3;
  // (the busted main: up through the floor, pouring)
  if (stage < 2) { R(g, -4, -5, 8, 5, INK); R(g, -3.2, -5, 6.4, 4.6, '#9CA3AF'); for (let i = 0; i < 5; i++) { const u = ((t * 0.08 + i / 5) % 1); ell(g, (i - 2) * 2.4 * u * 2, -5 - u * 16 + u * u * 12, 1.6, 2.2, '#BFDBFE'); } }
  if (stage === 0) { satan(g, 'held', t * 2, -16 + Math.sin(t * 0.6) * 1.4, 0, 0, k, -1, sTalk); widow(g, 'dazed', t, 22, 0, 0, k); }
  else if (stage === 1) {
    // (him: sunk, belly up on the bottom, a last bubble; her: floated up to the top of it)
    satan(g, 'thrown', 0, -34, -7, Math.PI / 2, k, 1);
    const bob = Math.sin(t * 0.08) * 1.4; g.save(); g.translate(18, wy + 40 + bob); g.rotate(-0.25 + Math.sin(t * 0.05) * 0.06); widow(g, 'air', t, 0, 0, 0, k, -1, wTalk); g.restore();
  } else {
    satan(g, 'thrown', 0, -34, -7, Math.PI / 2, k, 1);
    g.save(); g.translate(30, wy + 9 + Math.sin(t * 0.07)); widow(g, 'thrown', 0, -24, 0, Math.PI / 2, k, 1); g.restore();
    // (a rubber duck)
    const dx = -14 + Math.sin(t * 0.03) * 8, dy = wy + Math.sin(t * 0.1) * 0.6; ell(g, dx, dy - 1.4, 3.4, 2.4, INK); ell(g, dx, dy - 1.4, 2.9, 1.9, '#FDE047'); ell(g, dx + 2.4, dy - 4, 2.2, 2.2, INK); ell(g, dx + 2.4, dy - 4, 1.7, 1.7, '#FDE047'); poly(g, [dx + 3.6, dy - 4.2, dx + 6, dy - 3.6, dx + 3.6, dy - 3], '#F97316'); R(g, dx + 2.6, dy - 4.8, 0.6, 0.6, INK);
  }
  // (the water over them: see-through, banded, its top a wavy lit line; bubbles)
  g.fillStyle = 'rgba(56, 150, 230, 0.42)'; g.beginPath(); g.moveTo(-CR, 0); g.lineTo(-CR, wy); for (let x = -CR; x <= CR; x += 4) g.lineTo(x, wy + Math.sin(x * 0.3 + t * 0.2) * 0.9); g.lineTo(CR, 0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(20, 60, 150, 0.25)'; g.fillRect(-CR, wy * 0.5, CR * 2, -wy * 0.5); dither(g, -CR, wy * 0.5 - 1, CR * 2, 1, 'rgba(20, 60, 150, 0.25)', 1 / 3);
  g.strokeStyle = '#E0F2FE'; g.lineWidth = 0.7; g.beginPath(); for (let x = -CR; x <= CR; x += 4) { const y = wy + Math.sin(x * 0.3 + t * 0.2) * 0.9; x === -CR ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  for (let i = 0; i < 9; i++) { const u = ((t * 0.015 + hash(i)) % 1), bx = -40 + hash(i * 3) * 80 + Math.sin(t * 0.1 + i) * 1.4, by = -u * -wy; if (by < wy) continue; g.strokeStyle = '#E0F2FE'; g.lineWidth = 0.5; g.beginPath(); g.arc(bx, -u * Math.abs(wy), 0.8 + hash(i * 7) * 1.2, 0, Math.PI * 2); g.stroke(); }
};
const hoist = (t: number): MhPose => ({ hipY: -22, feet: [[-14, 0], [14, 0]], lean: -0.06, hands: [[-2, -60 + Math.sin(t * 0.9)], [8, -62 + Math.sin(t * 0.9)]], mood: 'roar', head: [3, -37] });
const TOWER: Pic[] = [
  // (ripped up, over his head, the dirt still coming off its feet)
  { say: 'mh', sfx: [['crash', 0.8, -6]], paint: (c, t, d) => {
    set(c, false); dazedPair(c, t);
    ell(c, TWX, TWY + 1, 14, 3, '#9A4E80'); ell(c, TWX, TWY + 1.4, 11, 2, '#5A2A50'); for (let i = 0; i < 5; i++) R(c, TWX - 12 + i * 6, TWY - 2 - (i % 2) * 2, 3, 2.4, '#C074A0');
    const x = 70; towerUp(c, x - 28, GY - 42 + Math.sin(t * 0.9) * 0.6, BK, Math.PI / 2);
    for (let i = 0; i < 5; i++) { const u = ((t * 0.03 + i / 5) % 1); R(c, x - 30 + (i % 3) * 3, GY - 50 + (i % 2) * 14 + u * 40, 1.6, 1.6, '#9A4E80'); }
    meathead(c, x, d, hoist(t), t);
  } },
  { hold: 46, sfx: [['slam', 1, -12], ['boing', 0.7, -8]], at: [3, 8, 30], paint: (c, t, d) => {
    shake(c, t - 7, 3.6); set(c, false);
    const k = Math.min(1, t / 7), y = -30 + k * (GY + 30);
    if (k < 1) { dazedPair(c, t, false, false, CX - 22, CX + 26); }
    cupLegs(c, CX, y, CR, t); cup(c, CX, y, CR, t); dust(c, CX - CR, t - 7, 24); dust(c, CX + CR, t - 7, 24); pow(c, CX, GY - 4, t - 7, 50, '#FBCFE8');
    meathead(c, 84, d, { lean: 0.5, hipY: -19, hands: [[24, -16], [30, -12]], mood: 'roar', feet: [[-18, 0], [16, 0]], head: [8, -35] }, t);
  } },
  { say: 'satan', sfx: [['splash', 0.7, -6]], at: [10, 120], paint: (c, t, d, talk) => {
    set(c, false); cupLegs(c, CX, GY, CR, t); cup(c, CX, GY, CR, t, inCup(0.12 + clamp01(t / 260) * 0.6, t, 0, talk));
    meathead(c, 84, d, folded('grit'), t);
  } },
  { say: 'widow', sfx: [['splash', 0.6, 2]], at: [10, 120], paint: (c, t, d, talk) => {
    set(c, false); cupLegs(c, CX, GY, CR, t); cup(c, CX, GY, CR, t, inCup(0.92, t, 1, false, talk));
    meathead(c, 84, d, folded('grit'), t);
  } },
  // (he taps on it)
  { say: 'after', paint: (c, t, d) => {
    set(c, false); cupLegs(c, CX, GY, CR, t); cup(c, CX, GY, CR, t, inCup(0.92, t, 2));
    const tap = (t % 40) < 6 ? 2 : 0;
    meathead(c, 100, d, { hands: [[-6, 0], [30 + tap, -22]], mood: 'grit', lean: 0.1 }, t);
    if (tap) for (let i = 0; i < 3; i++) line(c, [121, GY - 30 + i * 3, 124, GY - 31 + i * 3.4], '#FFFFFF', 0.7);
  } },
];

// ---------------------------------------------------------------------------------------------------------------
// Nothing: they wobble; Satan goes over on his face and farts the last of hell out; she goes over backward, the
// cigarette still going

const tip = (c: Ctx, x: number, ang: number, f: () => void) => { c.save(); c.translate(x, GY); c.rotate(ang); c.translate(-x, -GY); f(); c.restore(); };
const fart = (c: Ctx, x: number, y: number, t: number) => {
  for (let i = 0; i < 6; i++) { const u = clamp01((t - i * 5) / 70); if (u <= 0) continue; const px = x + u * 26 + Math.sin(i * 2 + t * 0.05) * 4, py = y - u * 30 - i * 1.4, r = 2.4 + u * 7; c.globalAlpha = 0.75 * (1 - u * 0.7); ell(c, px, py, r + 0.6, r * 0.8 + 0.6, '#3A4A12'); ell(c, px, py, r, r * 0.8, '#8A9A3A'); ell(c, px - r * 0.3, py - r * 0.25, r * 0.5, r * 0.4, '#C8D06A'); }
  c.globalAlpha = 1;
};
const zzz = (c: Ctx, x: number, y: number, t: number) => { c.font = '5px "Press Start 2P"'; for (let i = 0; i < 3; i++) { const u = ((t * 0.012 + i / 3) % 1); c.globalAlpha = 1 - u; c.fillStyle = INK; c.fillText('Z', x + u * 14 + 0.5, y - u * 18 + 0.5); c.fillStyle = '#F8FAFC'; c.fillText('Z', x + u * 14, y - u * 18); } c.globalAlpha = 1; };
const S_DOWN = -1.42, W_DOWN = 1.36;
const downSatan = (c: Ctx, t: number) => { shadow(c, SX - 30, 40); tip(c, SX, S_DOWN, () => satan(c, 'dazed', 0, SX, GY - 6)); fart(c, SX + 4, GY - 20, t); };
const downWidow = (c: Ctx, t: number) => {
  shadow(c, WX + 26, 30); tip(c, WX, W_DOWN, () => widow(c, 'dazed', 0, WX, GY - 4));
  smoke(c, WX + 36, GY - 12, t, 3, '#E5E7EB', 30, 0.6);
};
const NOTHING: Pic[] = [
  { say: 'mh', paint: (c, t, d) => { set(c); tip(c, SX, Math.sin(t * 0.07) * 0.06, () => { shadow(c, SX, 30); satan(c, 'dazed', t); }); tip(c, WX, Math.sin(t * 0.08 + 1) * 0.06, () => { shadow(c, WX, 20); widow(c, 'dazed', t); }); meathead(c, MX, d, folded(), t); } },
  // (going, slowly: nodding off as he does)
  { say: 'satan', at: [10, 150], paint: (c, t, d, talk) => {
    set(c); const k = ease(clamp01(t / 260));
    tip(c, WX, Math.sin(t * 0.08 + 1) * 0.06, () => { shadow(c, WX, 20); widow(c, 'dazed', t); });
    shadow(c, SX - k * 14, 30); tip(c, SX, -k * 0.5 + Math.sin(t * 0.1) * 0.04 * (1 - k), () => satan(c, 'dazed', t, SX, GY, 0, BK, -1, talk));
    if (t > 90) zzz(c, SX - 10 - k * 20, GY - 70 + k * 16, t);
    meathead(c, MX, d, folded(), t);
  } },
  { hold: 90, sfx: [['thud', 1, -12], ['fart', 1, -6]], at: [4, 20, 80], paint: (c, t, d) => {
    shake(c, t - 8, 2.6); set(c); const k = ease(Math.min(1, t / 8));
    tip(c, WX, Math.sin(t * 0.08 + 1) * 0.06, () => { shadow(c, WX, 20); widow(c, 'dazed', t); });
    if (k < 1) tip(c, SX, -0.5 + (S_DOWN + 0.5) * k, () => satan(c, 'dazed', 0, SX, GY - 6 * k)); else downSatan(c, t - 22);
    dust(c, SX - 30, t - 8, 34);
    meathead(c, MX, d, folded(t > 30 ? 'grit' : 'scowl'), t);
  } },
  { say: 'widow', at: [10, 150], paint: (c, t, d, talk) => {
    set(c); const k = ease(clamp01(t / 260));
    downSatan(c, 400);
    shadow(c, WX + k * 10, 20); tip(c, WX, k * 0.46 + Math.sin(t * 0.1) * 0.04 * (1 - k), () => widow(c, 'dazed', t, WX, GY, 0, BK, -1, talk));
    meathead(c, MX, d, folded(), t);
  } },
  { hold: 70, sfx: [['thud', 1, -4]], at: [4, 20, 60], paint: (c, t, d) => {
    shake(c, t - 8, 2.2); set(c); const k = ease(Math.min(1, t / 8));
    downSatan(c, 400);
    if (k < 1) tip(c, WX, 0.46 + (W_DOWN - 0.46) * k, () => widow(c, 'dazed', 0, WX, GY - 4 * k)); else downWidow(c, t);
    dust(c, WX + 26, t - 8, 28);
    meathead(c, MX, d, folded(), t);
  } },
  // (a shrug)
  { say: 'after', paint: (c, t, d) => { set(c); downSatan(c, 400); downWidow(c, t + 40); meathead(c, MX, d, { hands: [[-18, -20], [26, -22]], mood: 'grit', lean: -0.03, head: [3, -36] }, t); } },
];

const PICS: Record<FinId, Pic[]> = { GUN, SOUVENIR, SOUL_SUCKER, FLINTLOCK, SPELLBOOK, STUNT_CAR, MALLET, SPAWNER, CROSSBOW, TOWER, NOTHING };
void satanHead; void widowHeadAt; void HIDE; void SK;

// ---------------------------------------------------------------------------------------------------------------

/** The ending's hook (the owner's: "The ending cutscene after that will play out nearly identically with some possible
 *  line changes here and there"): a line as the ending has it, or that finisher's own if the map has one. */
export const byFinisher = <T,>(base: T, map: Partial<Record<FinId, T>>, id: FinId | null): T => (id ? map[id] : undefined) ?? base;
/** (the contact sheets) How many pictures a finisher has; the frames of picture `s` worth a look. */
export const finisherPics = (id: FinId) => PICS[id].length;
export const finisherTimes = (id: FinId, s: number) => PICS[id][s].at ?? [30];
/** (the contact sheets) One of a finisher's pictures, `t` frames in. */
export const paintFinisherPic = (c: Ctx, id: FinId, s: number, t: number, d: Dress) => { const p = PICS[id][Math.min(s, PICS[id].length - 1)]; c.save(); p.paint(c, t, d, false); c.restore(); };
export const FINISHER_IDS = Object.keys(FINISHER_COST) as FinId[];
/** The finisher `id`'s cutscene (him dressed `d`). */
export const startFinisher = (id: FinId, d: Dress): Scene => {
  const F = L.FINISH[id];
  const text = { mh: () => pickLine(F.mh[d]), satan: () => pickLine(F.satan), widow: () => pickLine(F.widow), after: () => pickLine(F.after[d]) };
  const who = { mh: 'MEATHEAD', satan: 'SATAN', widow: 'ZARBLAX', after: 'MEATHEAD' }, voice = { mh: 'meathead', satan: L.SATAN_VOICE, widow: L.WIDOW_VOICE, after: 'meathead' };
  const beats: Beat[] = PICS[id].map((p): Beat => {
    const shot = (c: Ctx, t: number, talking: boolean) => { c.save(); p.paint(c, t, d, talking); c.restore(); };
    const enter = p.sfx ? () => { for (const [s, v, pitch] of p.sfx!) playSound(s, v, pitch); } : undefined;
    return p.say ? { shot, res: RES, who: who[p.say], voice: voice[p.say], text: text[p.say](), hold: p.hold ?? (p.say === 'after' ? 44 : 14), enter } : { shot, res: RES, hold: p.hold ?? 40, enter };
  });
  return createScene(beats);
};
