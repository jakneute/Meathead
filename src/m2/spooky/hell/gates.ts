// The demon's pit's two gates (the way in, where the bone arch is; the far side, where the second fire wall goes up),
// given depth: a monumental basalt gate set back behind each (scrolling slower than where he walks: it frames the pit,
// a great skull for its keystone, a plaque), and near the eye, in front of everything, the jaws of the threshold (rock
// fangs down from the dark above, a raised portcullis's spiked edge, stubs of rock teeth along the bottom), sliding
// past faster than he walks, so going through feels like going through. One shared eye (the middle of the screen, a
// little above the middle); the near things kept dark and thin and to the edges of the screen (never over him, the
// demon, his tells, the fire walls or the lava); the far ones dimmed into the dark. Each painted once into a stamp.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { GY } from '../geometry';
import { ARENA_IN, ARENA_OUT } from './layout';
import { type Ctx, INK, box, checker, mix, hash, stamp, text, BASALT, BONE, IRON, LAVA, poly } from './paint';

/** The gates: where each stands (the middle of the fire wall it frames), and its plaque. */
const GATES: [number, string][] = [[ARENA_IN + 35, 'STAFF ONLY'], [ARENA_OUT + 15, 'NO REFUNDS']];
/** How far back the far gate stands, how near the near jaws (1: where he walks). */
const BACK = 0.84, NEAR = 1.3;
const MURK = '#160605';
const far = (c: string, k = 0.45) => mix(c, MURK, k);

/** The one eye everything's seen from. */
const eyeOf = (state: GameState) => ({ x: state.camera.x + CANVAS_WIDTH / 2, y: state.camera.y + CANVAS_HEIGHT * 0.42 });
/** Where world x at depth d lands on the screen (screen space). */
const screenX = (state: GameState, x: number, d: number) => { const e = eyeOf(state); return e.x + (x - e.x) * d - state.camera.x; };

/** The far gate (local: its middle at 0, its foot at 0): two great basalt piers, an arch over, the skull keystone,
 *  the plaque under it; dim. */
const paintBackGate = (g: Ctx, words: string) => {
  const W = 120, PW = 58, H = 420;
  for (const s of [-1, 1]) {
    const x = s < 0 ? -W - PW : W;
    box(g, x - 2, -H - 2, PW + 4, H + 2, INK);
    box(g, x, -H, PW, H, far(BASALT[4]));
    box(g, x, -H, 6, H, far(BASALT[6])); checker(g, x + 6, -H, 2, H, far(BASALT[6]));
    box(g, x + PW - 10, -H, 10, H, far(BASALT[2])); checker(g, x + PW - 12, -H, 2, H, far(BASALT[2]), 1);
    // (courses of great blocks)
    for (let y = -H + 46; y < 0; y += 46) { box(g, x, y, PW, 2, INK); box(g, x, y + 2, PW, 1, far(BASALT[5])); }
    // (the plinth, the capital)
    box(g, x - 8, -24, PW + 16, 24, INK); box(g, x - 6, -22, PW + 12, 22, far(BASALT[3])); box(g, x - 6, -22, PW + 12, 3, far(BASALT[5]));
    box(g, x - 8, -H - 18, PW + 16, 20, INK); box(g, x - 6, -H - 16, PW + 12, 16, far(BASALT[3])); box(g, x - 6, -H - 16, PW + 12, 3, far(BASALT[5]));
    // (a brazier's dull coals on the capital: dim, no glare)
    box(g, x + PW / 2 - 12, -H - 26, 24, 10, INK); box(g, x + PW / 2 - 10, -H - 24, 20, 6, far(IRON[3], 0.3));
    box(g, x + PW / 2 - 8, -H - 28, 16, 4, far(LAVA[2], 0.35)); box(g, x + PW / 2 - 4, -H - 30, 8, 2, far(LAVA[4], 0.4));
  }
  // (the arch: voussoirs round over the gap)
  const cy = -H - 2, R = W + PW, r = W;
  for (let i = 0; i < 9; i++) {
    const a0 = Math.PI + (i / 9) * Math.PI, a1 = Math.PI + ((i + 1) / 9) * Math.PI;
    const pts: [number, number][] = [[Math.cos(a0) * r, cy + Math.sin(a0) * r * 0.7], [Math.cos(a0) * R, cy + Math.sin(a0) * R * 0.62], [Math.cos(a1) * R, cy + Math.sin(a1) * R * 0.62], [Math.cos(a1) * r, cy + Math.sin(a1) * r * 0.7]];
    poly(g, pts, INK);
    const inset = pts.map(([x, y]) => [x * 0.98, cy + (y - cy) * 0.97] as [number, number]);
    poly(g, inset, far(i % 2 ? BASALT[4] : BASALT[3]));
  }
  // (the keystone: a great skull, horned)
  const ky = cy - r * 0.7 - 30;
  box(g, -34, ky - 4, 68, 64, INK); box(g, -32, ky - 2, 64, 60, far(BONE[3], 0.4)); box(g, -32, ky - 2, 64, 6, far(BONE[4], 0.4)); box(g, 20, ky, 12, 56, far(BONE[1], 0.4));
  for (const s of [-1, 1]) { poly(g, [[s * 30, ky + 6], [s * 58, ky - 30], [s * 40, ky + 18]], INK); poly(g, [[s * 30, ky + 8], [s * 54, ky - 24], [s * 38, ky + 16]], far(BONE[2], 0.4)); }
  box(g, -22, ky + 16, 16, 16, INK); box(g, 6, ky + 16, 16, 16, INK);
  box(g, -17, ky + 22, 6, 4, far(LAVA[3], 0.45)); box(g, 11, ky + 22, 6, 4, far(LAVA[3], 0.45));
  box(g, -4, ky + 36, 8, 8, INK);
  for (let i = 0; i < 6; i++) box(g, -22 + i * 8, ky + 48, 6, 8, far(BONE[4], 0.4));
  box(g, -24, ky + 47, 48, 2, INK);
  // (the plaque, carved, under it)
  box(g, -70, cy - r * 0.7 + 40, 140, 26, INK); box(g, -68, cy - r * 0.7 + 42, 136, 22, far(BASALT[3], 0.3));
  text(g, words, 0, cy - r * 0.7 + 58, far('#E8B060', 0.3), 8, 'center', INK);
};

/** The near jaws (local: x 0 the gate; y in world rows, drawn about the eye): fangs of rock down from the dark, a
 *  raised portcullis's spiked edge, stubs of rock along the bottom; dark, a hot edge on them and no more. */
const paintJaws = (g: Ctx, seed: number) => {
  const D = '#0A0302', E = mix(BASALT[2], LAVA[1], 0.4);
  // (the portcullis, raised: its bars' spiked feet hanging out of the dark)
  for (let i = 0; i < 4; i++) {
    const x = -54 + i * 18, foot = GY - 420 - (i % 2) * 10;
    box(g, x, GY - 700, 6, foot - (GY - 700), D); box(g, x, GY - 700, 1, foot - (GY - 700), E);
    poly(g, [[x - 2, foot], [x + 3, foot + 12], [x + 8, foot]], D);
  }
  box(g, -60, GY - 436, 70, 8, D); box(g, -60, GY - 436, 70, 1, E);
  // (rock fangs down from above, either side of it)
  for (const [dx, len, w] of [[-110, 120, 54], [-74, 60, 30], [40, 80, 36], [86, 150, 60]] as [number, number, number][]) {
    const top = GY - 700, tip = GY - 470 + len * 0.6 + hash(seed + dx) * 16;
    poly(g, [[dx - w / 2, top], [dx + w / 2, top], [dx + 2, tip]], D);
    poly(g, [[dx - w / 2, top], [dx - w / 2 + 3, top], [dx + 2, tip], [dx + 1, tip - 2]], E);
  }
  // (teeth of rock along the bottom, below the floor line)
  for (const [dx, h, w] of [[-100, 64, 80], [-30, 40, 50], [50, 74, 90], [110, 50, 60]] as [number, number, number][]) {
    const base = GY + 170;
    poly(g, [[dx - w / 2, base], [dx - 4, base - h - 160], [dx + 6, base - h - 150], [dx + w / 2, base]], D);
    poly(g, [[dx - w / 2, base], [dx - 4, base - h - 160], [dx - 2, base - h - 156], [dx - w / 2 + 4, base]], E);
  }
};

/** Behind the play plane (after the lake, before the floor): the far gates. */
export const drawGatesBack = (c: Ctx, state: GameState) => {
  const e = eyeOf(state);
  GATES.forEach(([x, words], i) => {
    const sx = screenX(state, x, BACK);
    if (sx < -400 || sx > CANVAS_WIDTH + 400) return;
    c.save(); c.translate(e.x, e.y); c.scale(BACK, BACK); c.translate(Math.round(x - e.x), Math.round(GY - e.y));
    stamp(c, `hell-gate-back-${i}`, -200, -720, 400, 724, g => paintBackGate(g, words));
    c.restore();
  });
};

/** In front of everything (before the HUD): the near jaws, sliding past. */
export const drawGatesFront = (c: Ctx, state: GameState) => {
  const e = eyeOf(state);
  GATES.forEach(([x], i) => {
    const sx = screenX(state, x, NEAR);
    if (sx < -260 || sx > CANVAS_WIDTH + 260) return;
    c.save(); c.translate(e.x, e.y); c.scale(NEAR, NEAR); c.translate(Math.round(x - e.x), 0 - e.y);
    stamp(c, `hell-gate-jaws-${i}`, -130, GY - 704, 260, 880, g => paintJaws(g, i * 13));
    c.restore();
  });
};
