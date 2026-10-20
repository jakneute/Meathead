// The broomstick section's side view (only after it's won: the revisit): a wall walk HIGH ON THE CASTLE, round the
// keep's crown, the deathmatch done. One eye over the scene (kit.ts's view). Behind the walk's far parapet the drop:
// the castle grounds far below seen through the arena's own mode 7 floor (the same texture, its splatters and all,
// from up at her window's height looking out over the broom port, panning as he goes), the watchtowers and Piper's
// balloons on it, the sky by the hour, the Alps and the far park round it. On the walk: the flagstones going back to
// the parapet (merlons, banners on gilt poles, sconces with live flames, dimmed: scenery), the walk's front edge lit
// (he stands on it) over the keep's ashlar and corbels dropping away below; the stair turret at the left (the way
// back down to the runway: its door, steps inside); her chambers' tower at the right (a tall arched door glowing pink,
// a gilt heart over it, banners, rose petals strewn); a snapped broom, a dropped tiara, glass glittering by her door.

import type { GameState } from '../../../m1/game/core/state';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../../m1/constants';
import { type Ctx, type View, INK, box, hash, viewOf, at, stillAt, seen as seenAt, polyF, lit } from '../kit';
import { PALE, PINK, GOLD, IRON, FLAGS as FLAG_R, R, ashlar, merlons, banner, cone, drum, sconce, flame, lip } from '../keep/paint';
import { GY } from '../geometry';
import { W, H, TOWERS, BALLOONS, balloonAt, setView, project, seen, drawSky, drawGround, towerSprite, balloonSprite, drawSprite, TOWER_PX, type Proj } from './arena';

const PARA_D = 0.88, TURRET_D = 0.93, PROP_D = 0.96;
const P: Proj = { ok: false, sx: 0, sy: 0, s: 0, d: 0 };

// ---------------------------------------------------------------------------------------------------------------
// The backdrop: the grounds far below through the mode 7 floor, the sky

let low: HTMLCanvasElement | null = null;
/** Screen space: the view out from the castle's crown (`x0`/`len` the walk, for the pan). */
export const drawSideBackdrop = (c: Ctx, state: GameState, x0: number, len: number) => {
  if (!low) { low = document.createElement('canvas'); low.width = W; low.height = H; }
  const g = low.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  const v = viewOf(state), hy = ((v.eye.y - v.cam.y) / CANVAS_HEIGHT) * H;
  const k = Math.max(0, Math.min(1, (state.camera.x - x0) / Math.max(1, len - CANVAS_WIDTH)));
  const yaw = Math.PI + (k - 0.5) * 0.6;
  setView(Math.sin(yaw) * 380, Math.cos(yaw) * 380, 1150, yaw, hy, 230);
  drawSky(g, yaw, state.frame);
  drawGround(g);
  // (the watchtowers and the balloons out there, farthest first)
  const ents: { d: number; draw: () => void }[] = [];
  const ts = towerSprite(), bs = balloonSprite();
  for (const t of TOWERS) { project(t.x, t.z, 0, P); const sc = P.s * TOWER_PX; if (!seen(P, 64 * sc, 660 * sc)) continue; const x = P.sx, y = P.sy; ents.push({ d: P.d, draw: () => drawSprite(g, ts, x, y, sc) }); }
  for (const b of BALLOONS) { const q = balloonAt(b, state.frame); project(q.x, q.z, q.alt, P); const sc = P.s * 2; if (!seen(P, 80 * sc, 92 * sc, 150 * sc)) continue; const x = P.sx, y = P.sy; ents.push({ d: P.d, draw: () => drawSprite(g, bs, x, y, sc) }); }
  ents.sort((a, b) => b.d - a.d);
  for (const e of ents) e.draw();
  c.save(); c.imageSmoothingEnabled = false; c.drawImage(low, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); c.restore();
  return true;
};

// ---------------------------------------------------------------------------------------------------------------
// The walk

const SEG = 320;
/** A run of still art at depth d along world x a..b standing on y `foot`, in stamped stretches (only those on screen). */
const run = (c: Ctx, v: View, d: number, key: string, a: number, b: number, foot: number, up: number, down: number, paint: (g: Ctx, w: number, sx: number) => void) => {
  for (let sx = Math.floor(a / SEG) * SEG; sx < b; sx += SEG) {
    const s0 = Math.max(a, sx), s1 = Math.min(b, sx + SEG), w = s1 - s0;
    if (w <= 0 || !seenAt(v, s0, s1, d, 40)) continue;
    stillAt(c, v, d, `bs-${key}-${s0}`, s0, foot, -2, -up, w + 4, up + down, g => { g.save(); g.beginPath(); g.rect(0, -up, w, up + down); g.clip(); paint(g, w, s0); g.restore(); });
  }
};

/** World space: the walk, its parapet, the turrets, the props. */
export const drawSideBack = (c: Ctx, state: GameState, x0: number, len: number) => {
  const v = viewOf(state), f = state.frame, S = R(PALE), Sn = R(PALE, false), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON);
  const a = x0 - 260, b = x0 + len + 260;
  // (the parapet at the walk's far edge: a low wall, merlons, banner poles, sconces; dimmed: scenery)
  run(c, v, PARA_D, 'para', a, b, GY, 120, 4, (g, w, sx) => {
    box(g, -2, -40, w + 4, 41, INK); ashlar(g, 0, -39, w, 39, S, 61 + sx, 13, 26);
    merlons(g, 0, -40, w, S, 18, 12, 20, false);
    for (let x = ((260 - (sx % 260)) % 260); x < w; x += 260) { box(g, x - 3, -118, 6, 80, INK); box(g, x - 2, -118, 4, 80, Gd[3]); box(g, x - 2, -118, 1, 80, Gd[5]); banner(g, x + 14, -112, 18, 60, (Math.floor((sx + x) / 260) % 2) ? Pk : R(['#0E1430', '#18224E', '#22327A', '#2E4EA8', '#5A7ACC', '#9AB4EC']), Gd, (Math.floor((sx + x) / 260) % 2) ? 'heart' : 'star'); }
    for (let x = ((130 - (sx % 260) + 260) % 260); x < w; x += 260) sconce(g, x, -58, Ir);
  });
  for (let x = Math.floor((a - 130) / 260) * 260 + 130; x < b; x += 260) { const [sx, sy] = at(v.eye, x, GY - 58, PARA_D); if (sx > v.cam.x - 40 && sx < v.cam.x + CANVAS_WIDTH + 40) flame(c, sx, sy, f, 0.12); }
  // (the walk's flagstones going back to the parapet, their joints running back to the eye)
  const F = R(FLAG_R, false);
  if (v.eye.y < GY - 1) {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const da = 1 - ((1 - PARA_D) * i) / n, db = 1 - ((1 - PARA_D) * (i + 1)) / n;
      polyF(c, [at(v.eye, a, GY, da), at(v.eye, b, GY, da), at(v.eye, b, GY, db), at(v.eye, a, GY, db)], F[Math.max(1, 4 - Math.floor(i * 0.7))]);
      if (i) { const [p, yy] = at(v.eye, a, GY, da), [q] = at(v.eye, b, GY, da); box(c, p, Math.round(yy), q - p, 1, F[1]); }
    }
    c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(v.cam.x / 48) * 48 - 96; x < v.cam.x + CANVAS_WIDTH + 96; x += 48) { const [p0, q0] = at(v.eye, x, GY, 1), [p1, q1] = at(v.eye, x, GY, PARA_D); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
    for (let x = Math.floor(v.cam.x / 61) * 61; x < v.cam.x + CANVAS_WIDTH + 61; x += 61) { const t = hash(x * 0.37), d = PARA_D + 0.02 + hash(x * 1.9) * (0.95 - PARA_D), [sx, sy] = at(v.eye, x, GY, d); if (t > 0.8) { box(c, sx - 6 * d, sy, 12 * d, 2, F[4]); box(c, sx - 3 * d, sy, 6 * d, 1, F[5]); } else if (t < 0.12) box(c, sx, sy, 5 * d, 1, F[0]); }
  }
  // THE STAIR TURRET (left: the way back down) and HER CHAMBERS' TOWER (right)
  if (seenAt(v, x0 - 200, x0 + 300, TURRET_D, 60)) stillAt(c, v, TURRET_D, 'bs-stair', x0 + 70, GY, -110, -560, 220, 566, g => {
    drum(g, 0, -520, 0, 180, S, 5, { windows: 2, glassCol: '#3A6ACC', slits: true });
    cone(g, 0, -522, 104, 160, R(['#141E4A', '#1E3278', '#2E4EA8', '#3E68C4', '#6A90DC', '#A4C0F0']), Gd, R(['#F49AC8'])[0]);
    const arch = (r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, -110); g.arc(0, -110, r, Math.PI, 0); g.lineTo(r, 0); g.closePath(); g.fill(); };
    arch(40, INK); arch(37, S[4]); arch(33, S[2]); arch(30, INK); arch(28, R(['#1A1428'])[0]);
    for (let k = 0; k < 6; k++) { box(g, -26 + k * 3, -22 - k * 18, 52 - k * 6, 3, S[3 - (k % 2)]); box(g, -26 + k * 3, -22 - k * 18, 52 - k * 6, 1, S[5]); }
    sconce(g, -56, -150, Ir); sconce(g, 56, -150, Ir);
  });
  for (const sx0 of [x0 + 14, x0 + 126]) { const [sx, sy] = at(v.eye, sx0, GY - 150, TURRET_D); if (sx > v.cam.x - 40 && sx < v.cam.x + CANVAS_WIDTH + 40) flame(c, sx, sy, f, 0.14); }
  if (seenAt(v, x0 + len - 420, x0 + len + 200, TURRET_D, 60)) stillAt(c, v, TURRET_D, `bs-chambers-${lit() ? 1 : 0}`, x0 + len - 120, GY, -170, -600, 340, 606, g => {
    drum(g, 0, -560, 0, 260, S, 9, { windows: 0, slits: true });
    merlons(g, -134, -560, 268, S, 16, 10, 18, true);
    const arch = (r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(-r, 0); g.lineTo(-r, -190); g.arc(0, -190, r, Math.PI, 0); g.lineTo(r, 0); g.closePath(); g.fill(); };
    arch(58, INK); arch(55, S[5]); arch(51, S[3]); arch(47, Gd[3]); arch(45, INK);
    const pg = lit() ? ['#7A1E4E', '#C83A8A', '#F06AB0', '#FFB0DA'] : ['#4A1030', '#8A2A60', '#C8448E', '#F096C4'];
    arch(43, pg[0]); arch(34, pg[1]); arch(24, pg[2]); arch(12, pg[3]);
    for (let k = 0; k < 7; k++) box(g, -43 + k * 14, -130, 2, 130, INK);
    for (let y = -120; y < 0; y += 30) box(g, -43, y, 86, 2, INK);
    g.fillStyle = INK; g.beginPath(); g.arc(-9, -272, 12, 0, Math.PI * 2); g.arc(9, -272, 12, 0, Math.PI * 2); g.fill(); polyF(g, [[-21, -268], [0, -244], [21, -268]], INK);
    g.fillStyle = Gd[4]; g.beginPath(); g.arc(-8, -272, 9, 0, Math.PI * 2); g.arc(8, -272, 9, 0, Math.PI * 2); g.fill(); polyF(g, [[-17, -270], [0, -249], [17, -270]], Gd[4]);
    box(g, -12, -278, 4, 4, Gd[5]);
    banner(g, -96, -420, 30, 200, Pk, Gd, 'heart'); banner(g, 96, -420, 30, 200, Pk, Gd, 'crown');
    sconce(g, -80, -170, Ir); sconce(g, 80, -170, Ir);
  });
  for (const sx0 of [x0 + len - 200, x0 + len - 40]) { const [sx, sy] = at(v.eye, sx0, GY - 170, TURRET_D); if (sx > v.cam.x - 40 && sx < v.cam.x + CANVAS_WIDTH + 40) flame(c, sx, sy, f, 0.14); }
  // (her door's glow on the walk)
  { const [sx, sy] = at(v.eye, x0 + len - 120, GY, 0.96); c.save(); c.globalAlpha = lit() ? 0.22 : 0.12; c.fillStyle = '#FF8AC8'; c.beginPath(); c.ellipse(sx, sy, 120, 14, 0, 0, Math.PI * 2); c.fill(); c.globalAlpha *= 0.6; c.beginPath(); c.ellipse(sx, sy, 180, 22, 0, 0, Math.PI * 2); c.fill(); c.restore(); }
  // (props on the walk: a snapped broom, a dropped tiara, rose petals and glass glittering by her door)
  if (seenAt(v, x0 + 500, x0 + 700, PROP_D)) stillAt(c, v, PROP_D, 'bs-broom', x0 + 600, GY, -70, -20, 140, 24, g => {
    g.save(); g.rotate(-0.05); box(g, -60, -6, 56, 6, INK); box(g, -59, -5, 54, 4, '#8A5A30'); box(g, -59, -5, 54, 1, '#C8965A'); polyF(g, [[-4, -6], [4, -3], [-2, 0]], '#C8965A'); g.restore();
    box(g, 10, -5, 30, 5, INK); box(g, 11, -4, 28, 3, '#8A5A30'); polyF(g, [[40, -9], [64, -14], [68, 0], [40, 0]], INK); polyF(g, [[41, -8], [63, -12], [66, -1], [41, -1]], '#D8B060'); for (let k = 0; k < 6; k++) box(g, 44 + k * 4, -10 + k * 0.6, 1, 9, '#A8803A');
  });
  if (seenAt(v, x0 + 850, x0 + 950, PROP_D)) stillAt(c, v, PROP_D, 'bs-tiara', x0 + 900, GY, -16, -14, 34, 16, g => {
    polyF(g, [[-12, 0], [-10, -8], [-5, -3], [0, -11], [5, -3], [10, -8], [12, 0]], INK); polyF(g, [[-11, -1], [-10, -6], [-5, -2], [0, -9], [5, -2], [10, -6], [11, -1]], Gd[4]); box(g, -1, -7, 3, 3, '#F472B6');
  });
  for (let i = 0; i < 40; i++) {
    const x = x0 + len - 330 + hash(i * 3.1) * 260, d = 0.9 + hash(i * 1.7) * 0.09, [sx, sy] = at(v.eye, x, GY, d);
    if (sx < v.cam.x - 10 || sx > v.cam.x + CANVAS_WIDTH + 10) continue;
    if (i % 3) { box(c, sx, sy, 3, 2, i % 2 ? '#F472B6' : '#DC2626'); box(c, sx, sy, 1, 1, '#FFD0E8'); }
    else if ((f + i * 7) % 50 < 25) { box(c, sx, sy - 1, 1, 3, '#E0F2FE'); box(c, sx - 1, sy, 3, 1, '#E0F2FE'); }
  }
  // (the walk's front edge: lit (he stands on it), the keep's ashlar dropping away under it, corbels)
  run(c, v, 1, 'front', a, b, GY, 4, 160, (g, w, sx) => {
    ashlar(g, 0, 6, w, 154, Sn, 17 + sx, 14, 30);
    for (let x = ((40 - (sx % 40)) % 40); x < w; x += 40) { polyF(g, [[x - 1, 6], [x + 19, 6], [x + 15, 24], [x + 3, 24]], INK); polyF(g, [[x, 6], [x + 18, 6], [x + 14, 23], [x + 4, 23]], Sn[2]); box(g, x + 1, 7, 2, 14, Sn[4]); }
    box(g, 0, 140, w, 20, Sn[1]);
    lip(g, 0, 0, w);
  });
};
