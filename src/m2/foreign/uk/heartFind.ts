// THE UK'S HIDDEN HEALTH: a MAX HEALTH find on the bottom of the Thames, under Tower Bridge (the owner, 2026-11-01:
// "health pickup in foreign land. simple one. the london bridge. if you go under it after passing it, it will be in the
// bottom of the river it is sitting in." and "maybe make the water extra deep too under the london bridge").
//
//   THE RIVER: dug extra deep (index.ts THAMES.bed: 620 under the promenade, was 180, then 450), the water banded darker and
//     darker on the way down (drawDeep: SNES bands, dithered where they meet) so it reads as deep.
//   THE FIND: the HEART CANISTER (a glass jar, brass capped, a meaty heart beating in it) lying on the bed under the
//     middle of the bridge, where its two halves meet. It's only there once he's passed the bridge (been on the far
//     bank this visit to the land: kept through deaths), and only seen once he's down in the water under the deck (a
//     red glow and a glint through the murk), never from up on the deck.
//   GETTING IN AND OUT: in when the halves lift (they drop whoever's on them in, as ever); straight down, it's about
//     2 s to the bottom and 3 s back up against a 22 s breath (air.ts). Out by the river's steps at either end, or up
//     through the deck (a one-way ledge) with the swim's leap at the surface.
//   PICKED UP: once a save (upgrades/healthAward.ts: +1 health find, +10 max, saved at once), the YOU GOT card (him held
//     till it's closed), then his line (HEART_GOT, by pants). Gone on revisits.

import type { FrameContext } from '../../../m1/game/core/context';
import type { GameState } from '../../../m1/game/core/state';
import type { Controls } from '../../../m1/game/platform/input';
import { NO_CONTROLS } from '../../../m1/game/platform/input';
import { pickLine } from '../../../m1/game/platform/speech';
import { sectionState, meatheadSays, landVisit } from '../section';
import { byPants } from '../cast';
import type { Pool } from '../water';
import { GY } from '../geometry';
import { type Ctx, type View, box, checker, mix, stamp, steppedGlow, INK, onScreen } from '../kit';
import { awardHealth, healthWon, openHealthCard, tickHealthCard, type HealthCard } from '../../upgrades/healthAward';
import { maxHealth } from '../../upgrades/state';
import { HEART_GOT } from './lines';

/** The find, in the save (one per save). */
export const HEALTH_LAND = 'foreign', HEALTH_ID = 'health-thames';

/** Passed the bridge on this visit to the land (outlives a death: state.stage is rebuilt then). */
let passedOn = -1;

interface Heart { card: HealthCard | null }
const heartOf = (state: GameState) => sectionState<Heart, string>(state, 'ukHeart', () => ({ card: null }));

/** Where it lies: the middle of the river (under where the halves meet), sat on the bed; its middle bobs a touch. */
const spot = (p: Pool) => ({ x: Math.round((p.a + p.b) / 2), y: GY + p.bed - 34 });
const there = () => !healthWon(HEALTH_LAND, HEALTH_ID) && passedOn === landVisit();
/** He's down in it (his middle under the surface): the only way it's seen. */
const under = (state: GameState, p: Pool) => {
  const pl = state.player, cx = pl.pos.x + pl.width / 2, cy = pl.pos.y + pl.height / 2;
  return cx > p.a && cx < p.b && cy > GY + p.surface;
};

/** A frame (the section's update, first): the card while it's up (him held), else the pickup. */
export const updateHeart = (ctx: FrameContext, c: Controls, p: Pool): Controls => {
  const { state } = ctx, pl = state.player, h = heartOf(state);
  if (h.card) {
    pl.inCutscene = true; pl.vel.x = 0;
    if (tickHealthCard(h.card, state.frame)) { h.card = null; pl.inCutscene = false; meatheadSays(state, pickLine(byPants(state, HEART_GOT)), false); }
    return { ...NO_CONTROLS };
  }
  // (past the bridge, on the far bank: it's there now)
  if (pl.pos.x > p.b + 40 && pl.pos.y + pl.height <= GY + 4) passedOn = landVisit();
  if (!there() || pl.inCutscene || pl.health <= 0) return c;
  const s = spot(p), cx = pl.pos.x + pl.width / 2;
  if (Math.abs(cx - s.x) < 34 && pl.pos.y < s.y + 34 && pl.pos.y + pl.height > s.y - 34 && awardHealth(HEALTH_LAND, HEALTH_ID)) {
    pl.health = Math.max(pl.health, maxHealth());
    for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2; state.particles.push({ pos: { x: s.x, y: s.y }, vel: { x: Math.cos(a) * (2 + Math.random() * 3), y: Math.sin(a) * (2 + Math.random() * 3) }, life: 36, color: k % 3 ? '#F87171' : '#FDE68A', size: 3 + Math.random() * 3 }); }
    h.card = openHealthCard();
    pl.inCutscene = true; pl.vel.x = 0;
    return { ...NO_CONTROLS };
  }
  return c;
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

/** The deep water's darkening (drawFront, over the river's own bands): from where the old bed was down, five more bands
 *  each darker and bluer-black than the last, dithered where they meet; then the find's glow and glint through it. */
export const drawDeep = (c: Ctx, v: View, state: GameState, p: Pool) => {
  if (!onScreen(v, p.a, p.b)) return;
  const top = GY + 170, bot = GY + p.bed, n = 6, step = (bot - top) / n;
  const x0 = Math.max(p.a + 6, v.cam.x - 40), x1 = Math.min(p.b - 6, v.cam.x + 840);
  if (x1 <= x0) return;
  const DEEP = '#020617';
  for (let i = 0; i < n; i++) {
    const y = Math.round(top + i * step), h = Math.round(top + (i + 1) * step) - y;
    c.globalAlpha = 0.1 + i * 0.09; box(c, x0, y, x1 - x0, h, DEEP); c.globalAlpha = 1;
    if (i > 0) { c.globalAlpha = 0.18; checker(c, x0, y - 2, x1 - x0, 2, DEEP, 0, 2); c.globalAlpha = 1; }
  }
  // (the silt along the bed: a dark lip, motes drifting)
  box(c, x0, bot - 6, x1 - x0, 6, 'rgba(10, 14, 20, 0.45)');
  const f = state.frame;
  for (let k = 0; k < (x1 - x0) / 40; k++) {
    const mx = x0 + ((k * 97 + f * 0.15) % (x1 - x0)), my = bot - 30 - ((k * 53 + f * 0.2) % (bot - top - 40));
    if ((f + k * 19) % 160 < 110) box(c, Math.round(mx), Math.round(my), 2, 1, 'rgba(160, 175, 190, 0.35)');
  }
  if (!there() || !under(state, p)) return;
  const s = spot(p), gl = Math.floor((Math.sin(f * 0.08) * 0.5 + 0.5) * 2.99), y = s.y + Math.round(Math.sin(f * 0.05) * 2);
  c.save(); c.translate(s.x, y);
  stamp(c, `uk-heart-glow-${gl}`, -70, -70, 140, 140, g => {
    steppedGlow(g, 0, 0, 52 + gl * 8, '#FF3A4A', 0.0, 0.07 + gl * 0.02, 6);
  });
  // (the jar through the murk, over its glow)
  c.globalAlpha = 0.85;
  stamp(c, `uk-heart-${(f % 50) < 7 ? 1 : 0}`, -24, -38, 48, 74, g => paintCanister(g, (f % 50) < 7 ? 1 : 0));
  c.globalAlpha = 1;
  c.restore();
  // (the glint: a cross of light off the glass, now and then; bubbles off the lid)
  if (f % 70 < 24) { const gx = s.x - 9, gy = y - 14, r = f % 70 < 12 ? 6 : 4; box(c, gx - r, gy, r * 2 + 1, 1, '#FFF4C8'); box(c, gx, gy - r, 1, r * 2 + 1, '#FFF4C8'); box(c, gx - 1, gy - 1, 3, 3, '#FFFFFF'); }
  for (let k = 0; k < 3; k++) { const t = (f + k * 40) % 120; box(c, s.x + 4 + Math.round(Math.sin((f + k * 30) * 0.1) * 2), y - 40 - t, 2, 2, 'rgba(224, 242, 254, 0.7)'); }
};

/** The heart canister: a fat glass jar, brass capped (green with the river), a big red meaty heart in it, beating (two
 *  frames, painted once each). */
const paintCanister = (g: Ctx, beat: number) => {
  const BR = ['#2E2A08', '#5A5014', '#8A7A24', '#B8A03A', '#E2CC68', '#FFF0B0'];
  const H = ['#3A040C', '#6A0A16', '#A0141E', '#D02A2E', '#F2605A', '#FFB0A0'];
  box(g, -17, -22, 34, 44, INK);
  box(g, -16, -22, 32, 44, 'rgba(255, 190, 190, 0.3)');
  const s = beat ? 1.12 : 1;
  g.save(); g.scale(s, s);
  g.fillStyle = INK; g.beginPath(); g.moveTo(0, 14); g.bezierCurveTo(-18, 2, -16, -14, -6, -12); g.bezierCurveTo(-2, -12, 0, -9, 0, -7); g.bezierCurveTo(0, -9, 3, -13, 8, -12); g.bezierCurveTo(17, -11, 17, 4, 0, 14); g.fill();
  g.fillStyle = H[2]; g.beginPath(); g.moveTo(0, 12); g.bezierCurveTo(-15, 2, -14, -12, -6, -10.5); g.bezierCurveTo(-2, -10.5, 0, -8, 0, -5.5); g.bezierCurveTo(0, -8, 3, -11.5, 8, -10.5); g.bezierCurveTo(15, -9.5, 15, 4, 0, 12); g.fill();
  g.fillStyle = H[3]; g.beginPath(); g.ellipse(-5, -4, 7, 5, -0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = H[4]; g.beginPath(); g.ellipse(-7, -6, 3.5, 2.5, -0.4, 0, Math.PI * 2); g.fill();
  box(g, -8, -8, 2, 1, H[5]);
  g.fillStyle = H[1]; g.beginPath(); g.ellipse(6, 4, 5, 4, 0.4, 0, Math.PI * 2); g.fill();
  box(g, -4, -17, 5, 7, INK); box(g, -3, -16, 3, 6, H[3]); box(g, -3, -16, 1, 5, H[4]);
  box(g, 3, -16, 5, 5, INK); box(g, 4, -15, 3, 4, '#5A6AB0'); box(g, 4, -15, 1, 3, '#8A9AD8');
  g.strokeStyle = H[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(2, -6); g.quadraticCurveTo(5, 0, 1, 8); g.stroke();
  g.restore();
  // (the glass's shine; river slime on its foot)
  box(g, -13, -19, 3, 36, 'rgba(255, 255, 255, 0.45)'); box(g, -9, -19, 1, 30, 'rgba(255, 255, 255, 0.25)'); box(g, 11, -16, 2, 26, 'rgba(255, 220, 220, 0.2)');
  box(g, -16, 16, 32, 6, 'rgba(60, 90, 50, 0.45)'); checker(g, -16, 14, 32, 2, 'rgba(60, 90, 50, 0.5)', 0, 2);
  // (the caps, banded)
  for (const [cy, h] of [[-30, 9], [22, 9]] as [number, number][]) {
    box(g, -20, cy - 1, 40, h + 2, INK);
    box(g, -19, cy, 38, h, BR[3]); box(g, -19, cy, 38, 2, BR[5]); box(g, -19, cy + 2, 38, 1, BR[4]); box(g, -19, cy + h - 2, 38, 2, BR[1]);
    for (let k = -15; k < 19; k += 6) box(g, k, cy + 3, 1, h - 5, BR[2]);
  }
  box(g, -6, -36, 12, 7, INK); box(g, -5, -35, 10, 5, BR[3]); box(g, -5, -35, 10, 1, BR[5]);
  box(g, -2, -34, 4, 3, '#E02A2A'); box(g, -1, -35, 2, 5, '#E02A2A');
  checker(g, -19, 26, 38, 2, mix(BR[2], '#3A6A3A', 0.4), 0, 2);
};
