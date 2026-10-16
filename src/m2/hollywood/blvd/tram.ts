// THE STUDIO TOUR TRAM: out of its garage on the right, down the boulevard at him (left) and into its garage on the
// left, over and over; it doesn't stop for anybody. A long low tram (a tractor and two open cars of guests waving), its
// roof a canopy he can ride on. Its horn and the driver's call before it comes out. Its nose and its sides hurt him
// (knocked on along with it) and kill whoever else is in its way (the hustlers: hazardHit.ts); the stretch it's on is
// a danger zone only where it is (and just ahead of it), so nobody walks out in front of it.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Block } from '../../../m1/types';
import { hurtPlayer } from '../../../m1/game/bosses/shared';
import { playSound } from '../../../m1/game/platform/audio';
import { shakeScreen } from '../../../m1/game/core/state';
import { setHazardZones, hazardVictims, hazardKill, boxHits } from '../../hazardHit';
import { box, ledge } from '../section';
import { GY } from '../geometry';
import { guest } from './paint';
import { stamp, mix, steppedGlow, bandedGradient } from '../../intro/art/kit';
import { timeOfDay, farTint, hourMix } from '../../timeOfDay';
import { signText } from '../../signLetters';

type Ctx = CanvasRenderingContext2D;

export interface TramDef { a: number; b: number; len: number; h: number; v: number; period: number; off?: number }
export interface Tram { d: TramDef; x: number; out: boolean; t: number; roof: Block }

const AWAY = -99999;
export const makeTram = (state: GameState, d: TramDef, tag: string): Tram => ({ d, x: d.b, out: false, t: 0, roof: ledge(state, d.b, AWAY, d.len - 30, { hidden: true, tag }) });

export interface TramEvents { horn?: boolean; came?: boolean; rode?: boolean }
export const updateTram = (ctx: FrameContext, tr: Tram, owner: string): TramEvents => {
  const { state } = ctx, p = state.player, d = tr.d, ev: TramEvents = {};
  tr.t = (state.frame + (d.off ?? 0)) % d.period;
  const run = (d.b - d.a + d.len) / d.v;
  const was = tr.out;
  tr.out = tr.t < run;
  // (the nose: out of the right garage at b, going left; the body trails behind it to the right)
  const nx = d.b - tr.t * d.v;
  const near = Math.abs((d.a + d.b) / 2 - (p.pos.x + p.width / 2)) < 1300;
  if (tr.t === d.period - 80 && near) { playSound('truckhorn', 0.5, 2); ev.horn = true; }
  if (!was && tr.out && near) { playSound('engine', 0.4, -4); ev.came = true; }
  const roofY = GY - d.h;
  // (the roof: rideable only out of the garages)
  const rx = Math.max(nx + 14, d.a), rr = Math.min(nx + d.len - 14, d.b), rw = rr - rx;
  const feet = p.pos.y + p.height;
  const onRoof = p.isGrounded && Math.abs(feet - tr.roof.y) < 3 && p.pos.x + p.width > tr.roof.x && p.pos.x < tr.roof.x + tr.roof.w;
  if (tr.out && rw > 30) {
    tr.roof.x = rx; tr.roof.y = roofY; tr.roof.w = rw;
    if (onRoof) { p.pos.x -= d.v; ev.rode = true; }
  } else { tr.roof.y = AWAY; }
  tr.x = nx;
  const zones = [];
  if (tr.out) {
    zones.push({ x0: nx - 140, x1: nx + d.len, y0: roofY + 6, y1: GY });
    // (its nose and its sides: him, unless he's up on it)
    const bodyL = Math.max(nx, d.a - 20), bodyR = Math.min(nx + d.len, d.b + 20);
    if (bodyR > bodyL && p.health > 0 && p.invincibilityTimer <= 0 && !p.inCutscene && p.pos.x + p.width > bodyL + 2 && p.pos.x < bodyR - 2 && feet > roofY + 8 && p.pos.y < GY) {
      hurtPlayer(ctx, 16, 'm2:hw_tram', { x: -10, y: -9 }, 26);
      shakeScreen(state, 9, 4); playSound('truckhorn', 0.7, 4);
    }
    for (const e of hazardVictims(state)) if (e.enemyType !== 'flyer' && boxHits(e, bodyL, roofY + 6, bodyR - bodyL, d.h - 6))
      hazardKill(ctx, e, nx + d.len, 'TOUR\'S OVER!', { fling: { x: -13, y: -10 }, sound: 'crunch' });
  }
  setHazardZones(state, owner, zones);
  return ev;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing (peak SNES: the tram's body painted once for the hour, its guests live between its seats and its sides)

const INK = '#1C1014';
const tint = (c: string) => farTint(hourMix(c, mix(c, '#7A4A5A', 0.14), mix(c, '#141832', 0.32)), 0.1);
const R6 = (c: string) => { const b = tint(c); return [mix(b, INK, 0.62), mix(b, INK, 0.36), mix(b, INK, 0.14), b, mix(b, '#FFFFFF', 0.28), mix(b, '#FFFFFF', 0.56)]; };
const STEELS = ['#2C3038', '#444A54', '#626A76', '#8890A0', '#B4BCC8', '#E2E8F0'];
const wheel = (g: Ctx, x: number, y: number) => {
  g.fillStyle = INK; g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#26222A'; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3A3640'; g.beginPath(); g.arc(x - 1, y - 1, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#B8BCC8'; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#E8ECF4'; g.beginPath(); g.arc(x - 1, y - 1, 2, 0, Math.PI * 2); g.fill();
};
/** Behind the guests: the seat backs, the canopy's posts; the canopy (its top his to stand on: the lit lip). Local:
 *  the nose at x 0, the ground at y 0, the canopy's top at -h. */
const paintTramBack = (g: Ctx, len: number, h: number) => {
  const V = R6('#B4243A'), S = STEELS;
  for (let k = 0; k < 2; k++) {
    const cx = 74 + k * 112;
    for (const sx of [cx + 8, cx + 58]) { box(g, sx - 1, -54, 42, 26, INK); box(g, sx, -53, 40, 24, V[3]); box(g, sx, -53, 40, 4, V[4]); box(g, sx, -33, 40, 4, V[1]); for (let t = sx + 8; t < sx + 40; t += 10) box(g, t, -49, 1, 16, V[2]); }
  }
  for (const px of [4, 70, 180, len - 10]) { box(g, px - 1, -h + 10, 6, h - 40, INK); box(g, px, -h + 10, 4, h - 40, S[3]); box(g, px, -h + 10, 1, h - 40, S[5]); }
  // (the canopy: striped canvas, its scalloped valance, its lit top edge)
  box(g, -5, -h - 2, len + 6, 16, INK);
  for (let s = 0; s < len; s += 20) { box(g, s - 3, -h, 10, 12, tint('#DC2626')); box(g, s + 7, -h, 10, 12, tint('#F8FAFC')); box(g, s - 3, -h + 8, 20, 4, 'rgba(28, 16, 20, 0.25)'); }
  for (let s = -3, k = 0; s < len - 1; s += 10, k++) { g.fillStyle = k % 2 ? tint('#E8E0D8') : tint('#B91C1C'); g.beginPath(); g.moveTo(s, -h + 12); g.lineTo(s + 10, -h + 12); g.lineTo(s + 5, -h + 18); g.fill(); }
  box(g, -3, -h - 2, len + 2, 3, '#F2D79A'); box(g, -3, -h - 2, len + 2, 1, '#FFF6D8');
};
/** In front of the guests: the tractor (its cab, the driver's glass, the grille, the bumper), the cars' sides (cream,
 *  the red and gold stripe, the tour's name), the hitches, the wheels. */
const paintTramFront = (g: Ctx) => {
  const C = R6('#F2EAD8'), Rd = R6('#B4243A'), Gd = R6('#C8962E'), S = STEELS;
  const glass = timeOfDay().lamps > 0.35 ? ['#2A1808', '#6A3E12', '#B07024', '#E8A646'] : [hourMix('#141A2A', '#2A1A2E', '#0A0C1A'), hourMix('#24364E', '#4A2E4A', '#141A30'), hourMix('#4A6888', '#7A4E66', '#22304A'), hourMix('#7E98B0', '#B07A7A', '#34466A')];
  // The tractor: a rounded cab, stepped, its windshield, a stripe; the grille and the bumper at its nose
  g.fillStyle = INK; g.beginPath(); g.moveTo(-2, -12); g.lineTo(-2, -44); g.quadraticCurveTo(0, -64, 22, -64); g.lineTo(70, -64); g.lineTo(70, -12); g.closePath(); g.fill();
  g.fillStyle = C[3]; g.beginPath(); g.moveTo(0, -13); g.lineTo(0, -44); g.quadraticCurveTo(2, -62, 22, -62); g.lineTo(68, -62); g.lineTo(68, -13); g.closePath(); g.fill();
  box(g, 0, -40, 8, 27, C[4]); box(g, 12, -61, 30, 2, C[5]); box(g, 60, -62, 8, 49, C[1]);
  box(g, 6, -56, 26, 20, INK); box(g, 7, -55, 24, 18, glass[1]); box(g, 7, -55, 24, 6, glass[2]); box(g, 8, -55, 2, 18, glass[3]);
  box(g, 0, -34, 68, 6, Rd[3]); box(g, 0, -34, 68, 1, Rd[4]); box(g, 0, -29, 68, 2, Gd[3]);
  for (let k = 0; k < 4; k++) box(g, -1, -26 + k * 3, 7, 2, S[k % 2 ? 1 : 3]);
  box(g, -6, -18, 16, 6, INK); box(g, -5, -17, 14, 4, S[4]); box(g, -5, -17, 14, 1, S[5]);
  box(g, 40, -56, 18, 18, INK); box(g, 41, -55, 16, 16, glass[1]); box(g, 41, -55, 16, 5, glass[2]);
  // The cars: their sides, the stripe, the name; the hitch between
  for (let k = 0; k < 2; k++) {
    const cx = 74 + k * 112;
    box(g, cx - 1, -36, 108, 26, INK); box(g, cx, -35, 106, 24, C[3]); box(g, cx, -35, 106, 3, C[5]); box(g, cx, -14, 106, 3, C[1]); box(g, cx, -35, 3, 24, C[4]); box(g, cx + 103, -35, 3, 24, C[1]);
    box(g, cx, -27, 106, 5, Rd[3]); box(g, cx, -27, 106, 1, Rd[4]); box(g, cx, -21, 106, 2, Gd[3]);
    box(g, cx - 6, -16, 8, 4, INK); box(g, cx - 5, -15, 6, 2, S[2]);
  }
  signText(g, 'HAPPYWOOD STUDIO TOUR', 74 + 109, -28, { sx: 1, sy: 1, fill: '#F8F2E2', shadow: Rd[0] });
  for (const wx of [20, 88, 164, 200, 276]) wheel(g, wx, -9);
};
const paintGarage = (g: Ctx) => {
  const R = R6('#E2D2B4'), T = R6('#B8603E');
  for (const px of [-52, 38]) { box(g, px - 1, -162, 16, 162, INK); box(g, px, -161, 14, 161, R[3]); box(g, px, -161, 4, 161, R[4]); box(g, px + 11, -161, 3, 161, R[1]); box(g, px - 3, -14, 20, 14, R[2]); box(g, px - 3, -14, 20, 2, R[4]); }
  box(g, -58, -184, 116, 26, INK); box(g, -57, -183, 114, 24, R[3]); box(g, -57, -183, 114, 3, R[4]); box(g, -57, -162, 114, 3, R[1]);
  for (let x = -60, k = 0; x < 60; x += 6, k++) { box(g, x, -192, 5, 9, T[k % 2 ? 3 : 2]); box(g, x, -192, 5, 1, T[5]); box(g, x + 4, -192, 1, 9, T[1]); }
  box(g, -60, -194, 120, 3, INK);
  box(g, -44, -180, 88, 18, INK); box(g, -43, -179, 86, 16, '#1C1418');
  signText(g, 'TOUR GARAGE', 0, -167, { sx: 1, sy: 1, fill: ['#FFF0A8', '#E8C25A', '#C8962E'], dither: true });
  // (hazard stripes up the piers' feet)
  for (const px of [-52, 38]) for (let y = -40; y < -14; y += 8) { box(g, px, y, 14, 4, '#EAB308'); box(g, px, y + 4, 14, 4, '#1A1418'); }
};

/** The tram (world; drawn in front: it's in the play plane) and the garages' front arches over its two ends. */
export const drawTram = (c: Ctx, state: GameState, tr: Tram) => {
  const d = tr.d, f = state.frame, tod = timeOfDay();
  if (tr.out) {
    c.save(); c.beginPath(); c.rect(d.a, GY - 300, d.b - d.a, 320); c.clip();
    const x = Math.round(tr.x);
    c.save(); c.translate(x, GY); stamp(c, `hb-tramback-${tod.key}`, -8, -d.h - 6, d.len + 16, d.h + 8, g => paintTramBack(g, d.len, d.h)); c.restore();
    // (the guests on board: waving, filming, bored; the driver, the tour's guide on the mic)
    for (let k = 0; k < 2; k++) {
      const cx = x + 74 + k * 112;
      for (let gi = 0; gi < 3; gi++) { c.save(); c.translate(cx + 20 + gi * 32, GY - 30); c.scale(0.62, 0.62); guest(c, 0, 0, 40 + k * 3 + gi * 7, f, gi === 1 ? 'photo' : 'cheer', -1, 'happy'); c.restore(); }
    }
    c.save(); c.translate(x + 26, GY - 32); c.scale(0.62, 0.62); guest(c, 0, 0, 3, f, 'stand', -1, 'bored'); c.restore();
    c.save(); c.translate(x, GY); stamp(c, `hb-tramfront-${tod.key}`, -10, -70, d.len + 20, 72, paintTramFront); c.restore();
    // (the headlight: on, a stepped glow ahead of it after dark)
    box(c, x - 4, GY - 42, 6, 8, INK); box(c, x - 3, GY - 41, 4, 6, f % 20 < 14 ? '#FEF08A' : '#FDE68A');
    if (tod.lamps > 0.3) steppedGlow(c, x - 4, GY - 38, 30, '#FFF2C0', 0.25 * tod.lamps, 0, 3);
    c.restore();
  }
  // The garages: an arch at each end (stucco piers, a tile cap, its sign; the tram comes out of, and goes into, the dark)
  for (const gx of [d.a, d.b]) { c.save(); c.translate(gx, GY); stamp(c, `hb-garage-${tod.key}`, -64, -200, 128, 202, paintGarage); c.restore(); }
};
/** The garages' dark insides, behind (drawBack): banded down into black, a caged work light hanging in each. */
export const drawGarageBacks = (c: Ctx, tr: Tram) => {
  for (const gx of [tr.d.a, tr.d.b]) {
    bandedGradient(c, gx - 40, GY - 160, 80, 160, ['#2A2228', '#1A1418', '#0E0A0E', '#060406'], 6);
    box(c, gx - 1, GY - 160, 2, 24, '#2A2A30'); box(c, gx - 5, GY - 136, 10, 8, '#1A1A1E'); box(c, gx - 3, GY - 134, 6, 5, timeOfDay().lamps > 0.3 ? '#FFE070' : '#B89040');
    box(c, gx - 40, GY - 8, 80, 8, '#1A1418');
  }
};
