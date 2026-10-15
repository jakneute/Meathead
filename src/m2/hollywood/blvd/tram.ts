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
import { words, print, guest } from './paint';

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

/** The tram (world; drawn in front: it's in the play plane) and the garages' front arches over its two ends. */
export const drawTram = (c: Ctx, state: GameState, tr: Tram) => {
  const d = tr.d, f = state.frame;
  if (tr.out) {
    c.save(); c.beginPath(); c.rect(d.a, GY - 300, d.b - d.a, 320); c.clip();
    const x = tr.x, top = GY - d.h;
    // (the tractor up front (left), then two open cars behind, under a striped canopy)
    box(c, x, top + 30, 70, d.h - 42, '#000'); box(c, x + 2, top + 32, 66, d.h - 46, '#F8FAFC');
    box(c, x + 6, top + 36, 24, 20, '#7DD3FC');
    box(c, x + 2, GY - 30, 66, 6, '#EAB308');
    for (let k = 0; k < 2; k++) {
      const cx = x + 74 + k * 112;
      box(c, cx, top + 50, 106, d.h - 62, '#000'); box(c, cx + 2, top + 52, 102, d.h - 66, '#E7E5E4');
      box(c, cx + 2, top + 52, 102, 4, '#EAB308');
      // (the guests on board: waving, filming, bored)
      for (let g = 0; g < 3; g++) { c.save(); c.translate(cx + 20 + g * 32, top + 70); c.scale(0.6, 0.6); guest(c, 0, 0, Math.floor(x / 7) + k * 3 + g, f, g === 1 ? 'photo' : 'cheer', -1, 'happy'); c.restore(); }
      for (const wx of [cx + 14, cx + 90]) { box(c, wx - 9, GY - 18, 18, 18, '#18181B'); box(c, wx - 4, GY - 13, 8, 8, '#71717A'); }
    }
    box(c, x + 14, GY - 18, 18, 18, '#18181B'); box(c, x + 19, GY - 13, 8, 8, '#71717A');
    // (the canopy: the roof he can stand on: its lit lip)
    box(c, x - 4, top - 2, d.len + 4, 14, '#000');
    for (let s = 0; s < d.len; s += 20) box(c, x + s, top, 10, 10, (s / 20) % 2 ? '#DC2626' : '#F8FAFC');
    box(c, x - 2, top, d.len, 3, '#FDE68A');
    for (const px of [x + 4, x + 70, x + 180, x + d.len - 10]) box(c, px, top + 10, 4, 40, '#52525B');
    words(c, 'HAPPYWOOD STUDIO TOUR', x + d.len / 2 + 30, top + 46, print(1, '#1E3A8A'));
    // (headlights on)
    box(c, x - 2, GY - 44, 6, 8, f % 20 < 14 ? '#FEF08A' : '#FDE68A');
    c.restore();
  }
  // The garages: an arch at each end (the tram comes out of, and goes into, the dark)
  for (const [gx, sign] of [[d.a, 'TOUR GARAGE'], [d.b, 'TOUR GARAGE']] as const) {
    box(c, gx - 50, GY - 160, 12, 160, '#57534E'); box(c, gx + 38, GY - 160, 12, 160, '#57534E');
    box(c, gx - 54, GY - 176, 108, 20, '#44403C'); box(c, gx - 54, GY - 176, 108, 3, '#78716C');
    words(c, sign, gx, GY - 162, print(1, '#FDE68A'));
  }
};
/** The garages' dark insides, behind (drawBack). */
export const drawGarageBacks = (c: Ctx, tr: Tram) => {
  for (const gx of [tr.d.a, tr.d.b]) { box(c, gx - 40, GY - 156, 80, 156, '#0C0A09'); box(c, gx - 40, GY - 156, 80, 10, '#1C1917'); }
};
