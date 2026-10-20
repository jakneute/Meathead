// The castle's base and the runway, painted (the SNES pass): one eye over the whole scene (kit.ts's view), the far off
// cached per hour (far.ts: the sky, the Alps, the park, the castle's grounds, and THE INNER WARD towering over the walls,
// the keep and its highest spire, Piper's window lit pink up near the top), and behind the play plane every depth full:
//
//   THE BARBICAN'S YARD   its wall going back (ashlar, crenellations with snow on them, cross slits, banners, sconces,
//                         the gateway he came in by, its portcullis up), the flagstones going back to it, lamp posts,
//                         topiary on tubs, the Great Pixie's statue fountain, a bench; the barbican tower (its ledge
//                         corbelled out over the moat, lit along its top: it's stood on)
//   THE MOAT              drained: its faces going back and down out of the picture (courses, the old water line, slime,
//                         drain mouths, a cleaner's bucket on a rope), its far end
//   THE GATEHOUSE         its front (bartizans under blue cones, the portcullis up in the arch, a gilt crest, a machicolated
//                         top, banners, its roof lit along the top) and, veiled till he's in it, the passage: its back
//                         wall and floor going back, YE OLDE GIFT SHOPPE along it (shelves of plush Pipers, tiaras, wands,
//                         snow globes, mugs; a rack of gowns, a barrel of wands, the till and a bored cashier), beams,
//                         sconces
//   THE COURTYARD         its far wall (an arcade along its foot with lanterns hung in the arches, lancets, banners,
//                         round towers up out of it under cones, crenellations), the flagstones going back, a well, the
//                         Great Pixie's fountain, topiary, lamp posts, benches; the royal rose garden (a lawn, gravel,
//                         rose beds, a trellis arch in bloom, a sundial)
//   THE RAMPARTS          the curtain wall's face (buttresses, slits, niches with statues, sconces), its walk lit, the
//                         walk's top going back to the parapet (merlons, snow), the hoardings over it; THE BREACH (its
//                         broken ends going back, rubble, scaffolding and its PARDON OUR PIXIE DUST banner, the way out
//                         through it: the frozen moat, pines, a queue of guests looking in)
//   THE TOWER             its inside, up out of the picture at every height: stonework, lancets in stained glass,
//                         tapestries, portraits, banners, sconces, iron chandeliers on chains, beams, a rose window up
//                         top; its floor going back; the landings and the gallery on corbels, lit along their tops
//   THE POSTERN           the tower's outside behind the steps down (windows, ivy, a gargoyle, banners); the postern
//                         yard (backstage: CAST MEMBERS ONLY, kegs of butter brew, a costume rack of spare tiaras, bins,
//                         a hay cart, a knight on his break with his helmet off), the postern gate out
//   THE BROOM PORT        port.ts (the stands and their crowds, the hoops, the scoreboard, wind socks, broom racks, the
//                         deck going back with its painted lines and landing lights)
//
// The play plane lit along every top he can stand on (the flagstones, the barbican's ledge, the gatehouse's roof, the
// wall walk, the breach's pillar, the landings, the gallery, the steps, the deck); none of the scenery is.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { timeOfDay } from '../../timeOfDay';
import { bendFloor } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import { type Ctx, type View, INK, box, mix, hash, checker, onScreen, storySign, viewOf, at, still, stillAt, seen, polyF, sideBack, topBack, lit, SNOW, LIP, warmGlass, gilt, dimmed } from '../kit';
import { signText } from '../../signLetters';
import { drawKeepFar } from './far';
import {
  X, Y, GY, RUNWAY, MOAT, BARBICAN, GATEHOUSE, WALL, BREACH, PILLAR, LAND_B, LAND_C, GALLERY, TOWER_WALL, LEDGES,
  HOLES, PA_AT, SCENE, BOUTIQUE,
} from './layout';
import {
  BAILEY_D, MOAT_D, PASS_D, YARD_D, PROP_D, PARA_D, TOWER_D, OUT_D, POST_D, BARB_D,
  PALE, ROOF, PINK, RED, FLAGS, LEAVES, PLUM, GOLD, IRON, TIMBER, R, RC,
  lip, ashlar, merlons, slit, lancet, banner, cone, drum, sconce, flame, standSlab, hoardingArt, lampPost, topiary, guest,
} from './paint';
import { drawPort, portLamps, PORT_SCONCES } from './port';
import { Q, clipAt, onScreenV, scr, run } from './view';

export const drawKeepBackdrop = (c: Ctx, state: GameState) => drawKeepFar(c, state);

// ---------------------------------------------------------------------------------------------------------------
// Helpers

type FloorKind = 'flag' | 'lawn' | 'rubble' | 'carpet';
/** The ground going back from the play plane (d 1) to d1, over world x a..b (rx), at height h: flagstones in bands, their
 *  joints running back to the eye, darker going back, snow drifted against the far wall; or the rose garden's lawn and
 *  gravel; or the breach's rubble; or the gift shop's runner. */
const floorBack = (c: Ctx, v: View, ra: number, rb: number, d1: number, kind: FloorKind, h = 0) => {
  const y = Y(h);
  if (v.eye.y >= y - 1) return;
  const [a, b] = clipAt(v, X(ra), X(rb), d1);
  if (b <= a) return;
  const F = kind === 'lawn' ? R(LEAVES) : kind === 'rubble' ? R(PALE) : R(FLAGS);
  const n = 6;
  for (let i = 0; i < n; i++) {
    const da = 1 - ((1 - d1) * i) / n, db = 1 - ((1 - d1) * (i + 1)) / n;
    Q(c, v, a, b, da, db, F[Math.max(1, 4 - Math.floor(i * 0.6))], y);
    if (i) { const [p, yy] = at(v.eye, a, y, da), [q] = at(v.eye, b, y, da); box(c, p, Math.round(yy), q - p, 1, F[kind === 'lawn' ? 2 : 1]); checker(c, p, Math.round(yy) + 1, q - p, 2, F[Math.max(1, 3 - Math.floor(i * 0.5))], i & 1, 1); }
  }
  if (kind === 'flag' || kind === 'carpet') {
    // (the joints, running back to the eye; a crack or a puddle here and there)
    c.strokeStyle = F[1]; c.lineWidth = 1; c.beginPath();
    for (let x = Math.floor(a / 44) * 44; x < b; x += 44) { const [p0, q0] = at(v.eye, x, y, 1), [p1, q1] = at(v.eye, x + 6, y, d1); c.moveTo(p0, q0); c.lineTo(p1, q1); }
    c.stroke();
    for (let x = Math.floor(a / 53) * 53; x < b; x += 53) {
      const t = hash(x * 0.37 + h), d = d1 + 0.02 + hash(x * 1.9) * (0.95 - d1), [sx, sy] = at(v.eye, x, y, d);
      if (t > 0.82) { box(c, sx - 6 * d, sy, 12 * d, 2, F[4]); box(c, sx - 3 * d, sy, 6 * d, 1, F[5]); }
      else if (t < 0.12) { box(c, sx, sy, 5 * d, 1, F[0]); box(c, sx + 4 * d, sy + 1, 4 * d, 1, F[0]); }
    }
    if (kind === 'carpet') {
      // (a red runner down the passage, its gilt edges)
      const Rd = R(RED), Gd = R(GOLD);
      Q(c, v, a, b, 0.975, 0.93, Rd[3], y); Q(c, v, a, b, 0.975, 0.97, Rd[4], y);
      const [pa, ya] = at(v.eye, a, y, 0.975), [pb] = at(v.eye, b, y, 0.975); box(c, pa, Math.round(ya), pb - pa, 1, Gd[4]);
      const [pc, yc] = at(v.eye, a, y, 0.93), [pd] = at(v.eye, b, y, 0.93); box(c, pc, Math.round(yc), pd - pc, 1, Gd[3]);
      for (let x = Math.floor(a / 24) * 24; x < b; x += 24) { const [sx, sy] = at(v.eye, x, y, 0.952); box(c, sx, sy, 3, 1, Gd[2]); }
    }
  } else if (kind === 'lawn') {
    // (the lawn: mowing stripes, gravel paths across, flowers)
    const Gr = R(FLAGS);
    Q(c, v, a, b, 0.98, 0.955, Gr[4], y); Q(c, v, a, b, 0.86, 0.84, Gr[3], y);
    for (let x = Math.floor(a / 13) * 13; x < b; x += 13) { const t = hash(x * 0.53), d = d1 + 0.01 + hash(x * 1.7) * (0.94 - d1), [sx, sy] = at(v.eye, x, y, d); if (t > 0.6) { box(c, sx, sy - 3, 1, 3, F[2]); box(c, sx - 1, sy - 4, 3, 2, ['#F472B6', '#E11D48', '#FDE68A', '#FFFFFF'][Math.floor(hash(x * 3) * 4)]); } else if (t > 0.3) box(c, sx, sy - 2, 1, 2, F[4]); }
  } else {
    // (the breach's rubble: chunks of the wall, a scatter of grit)
    const P = R(PALE);
    for (let x = Math.floor(a / 17) * 17; x < b; x += 17) { const t = hash(x * 0.41), d = d1 + hash(x * 2.3) * (0.98 - d1), [sx, sy] = at(v.eye, x, y, d), r = (2 + t * 7) * d; box(c, sx - r - 1, sy - r, r * 2 + 2, r + 1, INK); box(c, sx - r, sy - r + 1, r * 2, r, P[3]); box(c, sx - r, sy - r + 1, r * 2, 1, P[5]); box(c, sx + r * 0.4, sy - r + 1, r * 0.6, r, P[2]); }
  }
  // (snow drifted along the far edge)
  if (kind !== 'carpet' && h === 0) {
    const S = R(SNOW);
    Q(c, v, a, b, d1 + 0.025, d1, S[3], y);
    const [p, yy] = at(v.eye, a, y, d1 + 0.025), [q] = at(v.eye, b, y, d1 + 0.025);
    box(c, p, Math.round(yy) - 1, q - p, 1, S[5]);
    for (let x = Math.floor(a / 23) * 23; x < b; x += 23) { const [sx, sy] = at(v.eye, x, y, d1 + 0.012); box(c, sx, sy - 3 - hash(x) * 3, 10 + hash(x * 2) * 10, 3, S[4]); }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE BARBICAN'S YARD (0..800) and THE MOAT

const BAILEY_H = 250;
const BAILEY_FEAT: [number, 'banner' | 'gate' | 'sconce' | 'slit' | 'niche'][] = [
  [-260, 'sconce'], [-160, 'banner'], [-60, 'slit'], [60, 'gate'], [200, 'sconce'], [290, 'banner'], [390, 'slit'], [470, 'niche'], [560, 'sconce'], [640, 'banner'], [720, 'slit'],
];
const paintBailey = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON), Tm = R(TIMBER);
  ashlar(g, -10, -BAILEY_H, w + 20, BAILEY_H, S, 17, 14, 30);
  merlons(g, -10, -BAILEY_H, w + 20, S, 18, 12, 16, true);
  for (const [rx, kind] of BAILEY_FEAT) {
    const x = rx - sx;
    if (x < -120 || x > w + 120) continue;
    if (kind === 'banner') banner(g, x, -BAILEY_H + 24, 26, 120, Pk, Gd, 'heart');
    else if (kind === 'sconce') sconce(g, x, -130, Ir);
    else if (kind === 'slit') { slit(g, x, -200, 22, S); slit(g, x, -120, 22, S); }
    else if (kind === 'niche') {
      // (a niche with a statue of a knight in it, a pink sash on him)
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 24, -40); g.lineTo(x - 24, -150); g.arc(x, -150, 24, Math.PI, 0); g.lineTo(x + 24, -40); g.closePath(); g.fill();
      g.fillStyle = S[1]; g.beginPath(); g.moveTo(x - 22, -40); g.lineTo(x - 22, -150); g.arc(x, -150, 22, Math.PI, 0); g.lineTo(x + 22, -40); g.closePath(); g.fill();
      box(g, x - 20, -150, 6, 110, S[0]);
      const St = R(PALE);
      box(g, x - 7, -132, 14, 18, INK); box(g, x - 6, -131, 12, 17, St[4]); box(g, x - 9, -114, 18, 44, INK); box(g, x - 8, -113, 16, 42, St[4]); box(g, x + 3, -113, 5, 42, St[2]);
      box(g, x - 7, -70, 5, 26, St[3]); box(g, x + 2, -70, 5, 26, St[2]); box(g, x - 12, -112, 3, 70, INK); box(g, x - 11, -150, 1, 108, St[5]);
      polyF(g, [[x - 8, -113], [x + 8, -90], [x + 8, -84], [x - 8, -107]], Pk[3]);
      box(g, x - 28, -44, 56, 6, INK); box(g, x - 27, -43, 54, 4, S[5]);
    } else {
      // (the gateway he came in by: an arch, the portcullis up in it, the ride's glow beyond, a gilt EXIT plaque)
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 62, 0); g.lineTo(x - 62, -120); g.arc(x, -120, 62, Math.PI, 0); g.lineTo(x + 62, 0); g.closePath(); g.fill();
      g.fillStyle = S[5]; g.beginPath(); g.moveTo(x - 58, 0); g.lineTo(x - 58, -120); g.arc(x, -120, 58, Math.PI, 0); g.lineTo(x + 58, 0); g.closePath(); g.fill();
      for (let k = 0; k < 11; k++) { const a = Math.PI + (k / 10) * Math.PI, ox = x + Math.cos(a) * 60, oy = -120 + Math.sin(a) * 60; box(g, ox - 4, oy - 4, 8, 8, k % 2 ? S[4] : S[3]); box(g, ox - 4, oy - 4, 8, 1, INK); }
      const G = warmGlass();
      g.fillStyle = INK; g.beginPath(); g.moveTo(x - 52, 0); g.lineTo(x - 52, -120); g.arc(x, -120, 52, Math.PI, 0); g.lineTo(x + 52, 0); g.closePath(); g.fill();
      for (let i = 0; i < 5; i++) { g.fillStyle = mix(G[i], '#2A1A3A', 0.55 - i * 0.08); g.beginPath(); g.ellipse(x, -20, 50 - i * 8, 60 - i * 10, 0, Math.PI, 0); g.fill(); }
      for (let k = x - 48; k <= x + 48; k += 10) { box(g, k - 1, -178, 3, 40, INK); box(g, k, -178, 1, 40, Ir[4]); polyF(g, [[k - 2, -138], [k + 1, -130], [k + 4, -138]], Ir[3]); }
      for (let y = -174; y < -138; y += 9) box(g, x - 50, y, 100, 2, Ir[2]);
      box(g, x - 22, -200, 44, 14, INK); box(g, x - 21, -199, 42, 12, Gd[3]); box(g, x - 21, -199, 42, 1, Gd[5]);
      for (const [lx, c2] of [[-14, 0], [-5, 1], [4, 2], [12, 3]] as const) { box(g, x + lx, -196, 5, 6, ['#6E0E1C', '#6E0E1C', '#6E0E1C', '#6E0E1C'][c2]); box(g, x + lx + 1, -195, 3, 4, Gd[3]); }
      for (const s of [-1, 1]) { box(g, x + s * 66 - 4, -60, 8, 60, INK); box(g, x + s * 66 - 3, -60, 6, 60, Tm[2]); }
    }
  }
  for (let k = 6; k < w; k += 40) box(g, k, -4, 20, 4, R(SNOW)[3]);
};

const MOAT_DEEP = 1400;
const drawMoat = (c: Ctx, v: View) => {
  const a = X(MOAT.a), b = X(MOAT.b);
  if (!seen(v, a - 300, b + 300, MOAT_D, 200)) return;
  const S = R(PALE), f = v.f;
  // (the dark down there, banded deeper)
  const [pa] = at(v.eye, a, GY, 1.3), [pb] = at(v.eye, b, GY, 1.3);
  const [fa, fy] = at(v.eye, a, GY, MOAT_D), [fb] = at(v.eye, b, GY, MOAT_D);
  const bands = ['#2A2440', '#221C36', '#1A162A', '#120E1E', '#0C0A14'].map(dimmed);
  for (let i = 0; i < 5; i++) box(c, Math.min(pa, a) - 20, fy + i * 140, Math.max(pb, b) - Math.min(pa, a) + 40, i === 4 ? 1200 : 141, bands[i]);
  // (its far end: a face of the castle's wall going down out of the picture: courses, the old water line, a drain mouth)
  still(c, `kp-moatend-${Math.round(fb - fa)}`, fa, fy, 0, 0, fb - fa, 520, g => {
    const ww = fb - fa;
    ashlar(g, 0, 0, ww, 520, S, 61, 11, 24);
    for (let i = 0; i < 5; i++) { g.globalAlpha = 0.14 + i * 0.12; box(g, 0, 60 + i * 90, ww, 90, INK); }
    g.globalAlpha = 1;
    box(g, 0, 70, ww, 4, R(['#1E3A2A', '#2A4A34', '#3A5E40', '#4E7A4E', '#6A9A60', '#8ABA7A'])[2]); checker(g, 0, 74, ww, 6, R(['#1E3A2A', '#2A4A34', '#3A5E40', '#4E7A4E', '#6A9A60', '#8ABA7A'])[1], 0, 1);
    for (let k = 10; k < ww; k += 13) box(g, k, 74, 2, 6 + hash(k) * 30, '#2E4A34');
    const dx = ww / 2; g.fillStyle = INK; g.beginPath(); g.arc(dx, 150, 26, Math.PI, 0); g.fill(); box(g, dx - 26, 150, 52, 30, INK);
    for (let k = -22; k <= 22; k += 7) box(g, dx + k, 126, 2, 54, R(IRON)[3]);
    box(g, 0, 0, ww, 3, LIP[1]);
  });
  // (the castle's front wall standing along the far rim, from the barbican to the gatehouse)
  run(c, v, MOAT_D, 'moatwall', MOAT.a - 20, GATEHOUSE.a + 30, 0, 360, (g, w, sx) => {
    const Sw = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON);
    ashlar(g, -10, -310, w + 20, 310, Sw, 67, 14, 30);
    merlons(g, -10, -310, w + 20, Sw, 18, 12, 16, true);
    for (let rx = Math.floor(sx / 120) * 120 + 60; rx < sx + w + 80; rx += 120) {
      const x = rx - sx;
      if (Math.floor(rx / 120) % 3 === 0) banner(g, x, -290, 26, 130, Pk, Gd, 'heart');
      else { slit(g, x, -250, 22, Sw); lancet(g, x, -170, 18, 54, Sw, '#3A6ACC', rx); sconce(g, x, -80, Ir); }
    }
    box(g, -10, -4, w + 20, 4, LIP[1]);
  });
  // (a cleaner's bucket down on a rope off the far rim; a WET FLOOR cone up on it)
  const [rx, ry] = at(v.eye, a + 300, GY, MOAT_D + 0.01);
  box(c, rx, ry, 1, 120 + Math.sin(f * 0.03) * 3, '#C8B890');
  const by = ry + 120 + Math.sin(f * 0.03) * 3; box(c, rx - 7, by, 14, 12, INK); box(c, rx - 6, by + 1, 12, 10, '#6A8AB8'); box(c, rx - 6, by + 1, 12, 2, '#9AB8E0'); box(c, rx - 4, by - 4, 8, 1, '#3A3448');
  const [kx, ky] = at(v.eye, a + 120, GY, MOAT_D + 0.03); polyF(c, [[kx - 6, ky], [kx, ky - 16], [kx + 6, ky]], '#F2C84A'); box(c, kx - 7, ky - 1, 14, 2, INK); box(c, kx - 3, ky - 9, 6, 2, '#1A1028');
  // (its side faces going back from right in front of him, down out of the picture)
  for (const [e, side] of [[a, 1], [b, -1]] as const) {
    if (!sideBack(c, v.eye, e, side, GY, GY + MOAT_DEEP, 1.3, MOAT_D, S, 6)) continue;
    for (let k = 1; k < 14; k++) { const y = GY + k * 26; const [p0, q0] = at(v.eye, e, y, 1.28), [p1, q1] = at(v.eye, e, y, MOAT_D); c.strokeStyle = k % 2 ? S[0] : S[2]; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke(); }
    // (the old water line: a green stain band, slime streaks under it)
    for (let t = 0; t < 1; t += 0.03) { const d = 1.28 - t * (1.28 - MOAT_D), [p, q] = at(v.eye, e, GY + 90, d); box(c, p - (side > 0 ? 0 : 3), q, 3, 5 * d, '#3E5E40'); box(c, p - (side > 0 ? 0 : 1), q + 5 * d, 1, (8 + hash(t * 71) * 30) * d, '#2E4A34'); }
    // (the lip: lit stone, snow)
    for (let t = 0; t < 1; t += 0.05) { const d = 1.28 - t * (1.28 - MOAT_D), [p, q] = at(v.eye, e, GY, d); box(c, p - 2, q - 1, 4, 2, SNOW[4]); }
    // (a drain mouth dribbling)
    const [dp, dq] = at(v.eye, e, GY + 200, 1.05); box(c, dp - 6, dq - 6, 12, 12, INK); box(c, dp - 4, dq - 4, 8, 8, '#141020'); box(c, dp - 1, dq + 6, 2, 30 + (f % 20), '#5A7A8A');
  }
};

/** The barbican's tower (BARB_D), its ledge corbelled out of it in the play plane over the moat. */
const drawBarbican = (c: Ctx, v: View) => {
  if (seen(v, X(640), X(860), BARB_D, 60)) {
    stillAt(c, v, BARB_D, 'kp-barbican', X(745), GY, -80, -600, 160, 604, g => {
      const S = R(PALE), Rf = R(ROOF), Gd = R(GOLD), Pk = R(PINK);
      drum(g, 0, -430, 0, 110, S, 7, { windows: 2, glassCol: '#C8306E', slits: true });
      merlons(g, -60, -430, 120, S, 14, 8, 14, true);
      cone(g, 0, -446, 62, 120, Rf, Gd, '#F49AC8');
      banner(g, 0, -360, 24, 90, Pk, Gd, 'crown');
    });
  }
  // (the ledge: stone corbelled out of it, lit along its top)
  const a = X(BARBICAN.a), b = X(BARBICAN.b);
  if (onScreenV(v, a - 20, b + 20)) still(c, 'kp-barbledge', a, Y(BARBICAN.h), -4, -4, b - a + 8, 50, g => standSlab(g, 0, b - a, 18, R(PALE, false), 3, true));
};

/** Props standing in the yards (PROP_D): [rx, what]. */
type Prop = 'lamp' | 'topiary' | 'fountain' | 'bench' | 'well' | 'urn' | 'sundial' | 'trellis' | 'kegs' | 'rack' | 'bins' | 'cart' | 'breaker' | 'door';
const PROPS: [number, Prop][] = [
  [-120, 'lamp'], [10, 'topiary'], [150, 'fountain'], [330, 'bench'], [400, 'topiary'], [560, 'lamp'],
  [2990, 'lamp'], [3070, 'well'], [3640, 'topiary'], [3760, 'fountain'], [3900, 'topiary'], [3990, 'lamp'], [4060, 'urn'],
  [4150, 'sundial'], [4330, 'trellis'], [4540, 'urn'],
  [8420, 'cart'], [8540, 'door'], [8620, 'kegs'], [8700, 'rack'], [8780, 'breaker'], [8850, 'bins'],
];
const paintProp = (g: Ctx, kind: Prop, seed: number) => {
  const S = R(PALE), Ir = R(IRON), Gd = R(GOLD), Tm = R(TIMBER), Pk = R(PINK), L = R(LEAVES);
  switch (kind) {
    case 'lamp': lampPost(g, Ir, Gd, 130); break;
    case 'topiary': topiary(g, seed, L, R(PLUM)); break;
    case 'urn': {
      box(g, -12, -16, 24, 16, INK); box(g, -11, -15, 22, 15, S[3]); box(g, -11, -15, 22, 2, S[5]);
      polyF(g, [[-18, -40], [18, -40], [12, -16], [-12, -16]], INK); polyF(g, [[-17, -39], [17, -39], [11, -17], [-11, -17]], S[4]); box(g, 6, -39, 6, 22, S[2]);
      for (let k = 0; k < 9; k++) { const x = -16 + k * 4, y = -44 - hash(seed + k) * 12; box(g, x, y, 4, -40 - y, L[2 + (k % 2)]); if (k % 2) { box(g, x, y - 3, 4, 4, INK); box(g, x + 1, y - 2, 2, 2, k % 4 === 1 ? '#E11D48' : '#F472B6'); } }
      break;
    }
    case 'bench': {
      for (const px of [-36, 30]) { box(g, px - 1, -20, 8, 20, INK); box(g, px, -19, 6, 19, Ir[3]); }
      box(g, -42, -22, 84, 6, INK); box(g, -41, -21, 82, 4, Tm[4]); box(g, -41, -21, 82, 1, Tm[5]);
      box(g, -42, -44, 84, 16, INK); for (let k = 0; k < 3; k++) { box(g, -41, -43 + k * 5, 82, 3, Tm[3]); box(g, -41, -43 + k * 5, 82, 1, Tm[5]); }
      box(g, -40, -47, 80, 3, R(SNOW)[4]);
      break;
    }
    case 'well': {
      box(g, -34, -40, 68, 40, INK); ashlar(g, -33, -39, 66, 39, S, seed, 10, 16);
      box(g, -36, -44, 72, 6, INK); box(g, -35, -43, 70, 4, S[5]);
      for (const px of [-30, 26]) { box(g, px - 1, -110, 6, 70, INK); box(g, px, -110, 4, 70, Tm[3]); box(g, px, -110, 1, 70, Tm[5]); }
      polyF(g, [[-44, -104], [0, -136], [44, -104]], INK); polyF(g, [[-42, -105], [0, -134], [42, -105]], Pk[3]); polyF(g, [[-42, -105], [0, -134], [-4, -105]], Pk[4]);
      box(g, -44, -107, 88, 3, R(SNOW)[4]);
      box(g, -26, -82, 52, 3, INK); box(g, -25, -81, 50, 1, Tm[4]);
      box(g, -2, -80, 1, 26, '#C8B890'); box(g, -8, -56, 14, 12, INK); box(g, -7, -55, 12, 10, Tm[3]); box(g, -7, -52, 12, 1, Ir[3]);
      box(g, 22, -86, 10, 4, INK); box(g, 30, -86, 2, 14, Ir[3]);
      break;
    }
    case 'fountain': {
      // (the Great Pixie's statue fountain: a basin, a pedestal, the statue (wand up, wings out), its plaque)
      box(g, -58, -26, 116, 26, INK); ashlar(g, -57, -25, 114, 25, S, seed, 9, 18); box(g, -60, -30, 120, 6, INK); box(g, -59, -29, 118, 4, S[5]);
      box(g, -52, -32, 104, 3, R(['#2A4A7A', '#3A68A8', '#5A8ACC', '#7AAAE0', '#A8CCF0', '#D8ECFA'])[3]);
      box(g, -12, -90, 24, 60, INK); box(g, -11, -89, 22, 58, S[3]); box(g, -11, -89, 4, 58, S[5]); box(g, 5, -89, 6, 58, S[2]);
      box(g, -16, -94, 32, 6, INK); box(g, -15, -93, 30, 4, S[5]);
      box(g, -8, -64, 16, 9, INK); box(g, -7, -63, 14, 7, Gd[3]); box(g, -5, -61, 10, 1, Gd[1]); box(g, -5, -59, 8, 1, Gd[1]);
      const St = R(PALE);
      polyF(g, [[-12, -96], [12, -96], [6, -126], [-6, -126]], INK); polyF(g, [[-11, -97], [11, -97], [5, -125], [-5, -125]], St[4]); box(g, 1, -125, 4, 28, St[2]);
      g.fillStyle = INK; g.beginPath(); g.arc(0, -132, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = St[4]; g.beginPath(); g.arc(0, -132, 7, 0, Math.PI * 2); g.fill();
      for (const s of [-1, 1]) { polyF(g, [[s * 4, -118], [s * 28, -140], [s * 24, -112]], INK); polyF(g, [[s * 5, -118], [s * 26, -138], [s * 22, -113]], St[5]); }
      box(g, 8, -160, 2, 30, INK); box(g, 9, -160, 1, 30, Gd[4]); polyF(g, [[9, -170], [12, -163], [9, -158], [6, -163]], Gd[4]);
      polyF(g, [[-8, -138], [0, -146], [8, -138]], Gd[3]);
      break;
    }
    case 'sundial': {
      box(g, -10, -40, 20, 40, INK); box(g, -9, -39, 18, 39, S[3]); box(g, -9, -39, 4, 39, S[5]); box(g, -16, -46, 32, 7, INK); box(g, -15, -45, 30, 5, Gd[3]); box(g, -15, -45, 30, 1, Gd[5]);
      polyF(g, [[0, -46], [10, -60], [10, -46]], Gd[2]); box(g, -12, -8, 24, 8, S[2]);
      break;
    }
    case 'trellis': {
      // (a rose trellis arch, in bloom)
      const W = R(['#7A7A84', '#9C9CA6', '#C8C8D2', '#E4E4EC', '#F4F4F8', '#FFFFFF']);
      for (const s of [-1, 1]) { box(g, s * 54 - 4, -170, 8, 170, INK); box(g, s * 54 - 3, -170, 6, 170, W[3]); box(g, s * 54 - 3, -170, 2, 170, W[5]); for (let y = -160; y < 0; y += 16) box(g, s * 54 - 8, y, 16, 2, W[2]); }
      g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.arc(0, -170, 54, Math.PI, 0); g.stroke(); g.strokeStyle = W[3]; g.lineWidth = 6; g.stroke(); g.strokeStyle = W[5]; g.lineWidth = 1; g.beginPath(); g.arc(0, -172, 54, Math.PI, Math.PI * 1.5); g.stroke();
      for (let k = 0; k < 46; k++) { const t = k / 45, a = Math.PI + t * Math.PI, r = 54 + (hash(k * 3) - 0.5) * 14; const x = t < 0.25 ? -54 + (hash(k) - 0.5) * 12 : t > 0.75 ? 54 + (hash(k) - 0.5) * 12 : Math.cos(a) * r, y = t < 0.25 ? -170 * (t / 0.25) : t > 0.75 ? -170 * ((1 - t) / 0.25) : -170 + Math.sin(a) * r;
        box(g, x - 4, y - 3, 8, 6, L[2 + (k % 2)]); if (k % 3 === 0) { box(g, x - 3, y - 3, 6, 5, INK); box(g, x - 2, y - 2, 4, 3, k % 2 ? '#E11D48' : '#F472B6'); box(g, x - 1, y - 2, 1, 1, '#FFE4F0'); } }
      break;
    }
    case 'door': {
      // (the staff door: CAST MEMBERS ONLY, a peephole, a kick plate, a light over it)
      box(g, -30, -128, 60, 128, INK); box(g, -28, -126, 56, 126, S[1]);
      box(g, -24, -120, 48, 120, INK); box(g, -23, -119, 46, 119, R(['#1A2A3A', '#2A3E54', '#3A5470', '#4E6C8C', '#6A8AAA', '#94B0CC'])[3]);
      box(g, -23, -119, 46, 2, R(['#1A2A3A', '#2A3E54', '#3A5470', '#4E6C8C', '#6A8AAA', '#94B0CC'])[5]); box(g, -23, -16, 46, 16, Ir[4]); box(g, 14, -66, 6, 4, Gd[3]);
      box(g, -18, -104, 36, 22, INK); box(g, -17, -103, 34, 20, '#F4F0FA'); box(g, -17, -103, 34, 5, '#B91C1C');
      for (let k = 0; k < 5; k++) box(g, -14 + k * 6, -95, 4, 2, INK); for (let k = 0; k < 4; k++) box(g, -12 + k * 6, -90, 4, 2, INK);
      box(g, -8, -142, 16, 8, INK); box(g, -7, -141, 14, 6, lit() ? '#FFE9A8' : '#C8C6D6');
      break;
    }
    case 'kegs': {
      for (const [kx, ky] of [[-30, 0], [0, 0], [30, 0], [-15, -30], [15, -30]] as const) {
        box(g, kx - 14, ky - 30, 28, 30, INK); box(g, kx - 13, ky - 29, 26, 28, Tm[3]); box(g, kx - 13, ky - 29, 6, 28, Tm[4]); box(g, kx + 6, ky - 29, 7, 28, Tm[2]);
        for (const yy of [ky - 25, ky - 8]) box(g, kx - 13, yy, 26, 3, Ir[3]);
        box(g, kx - 4, ky - 18, 8, 6, '#F6D365'); box(g, kx - 3, ky - 17, 6, 1, '#B07A1E');
      }
      box(g, -44, -4, 88, 4, R(SNOW)[3]);
      break;
    }
    case 'rack': {
      // (a costume rack: a rail of spare gowns and tabards, a shelf of tiaras on top, on castors)
      box(g, -40, -120, 4, 112, INK); box(g, 36, -120, 4, 112, INK); box(g, -40, -122, 80, 4, INK); box(g, -39, -121, 78, 2, Ir[4]);
      for (let k = 0; k < 8; k++) { const col = ['#F49AC8', '#A8C8F0', '#C8A8F0', '#F6D365', '#D8609E', '#2E52A8', '#9AE6B4', '#C81E3A'][(k + seed) % 8], Cc = RC(col); polyF(g, [[-34 + k * 9, -118], [-28 + k * 9, -118], [-25 + k * 9, -40], [-37 + k * 9, -40]], INK); polyF(g, [[-33 + k * 9, -117], [-29 + k * 9, -117], [-26 + k * 9, -41], [-36 + k * 9, -41]], Cc[3]); box(g, -33 + k * 9, -117, 1, 76, Cc[5]); }
      for (let k = 0; k < 5; k++) { const tx = -32 + k * 16; polyF(g, [[tx - 5, -124], [tx - 4, -132], [tx - 1, -127], [tx + 1, -134], [tx + 3, -127], [tx + 6, -132], [tx + 7, -124]], Gd[3]); box(g, tx, -129, 2, 2, PINK[4]); }
      for (const px of [-36, 36]) { box(g, px - 4, -8, 8, 8, INK); box(g, px - 3, -7, 6, 6, Ir[2]); }
      break;
    }
    case 'breaker': {
      // (a knight on his break, sat on a crate, his helmet off beside him, a can of butter brew)
      box(g, -26, -30, 40, 30, INK); box(g, -25, -29, 38, 29, Tm[3]); box(g, -25, -29, 38, 2, Tm[5]); g.strokeStyle = Tm[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(-23, -2); g.lineTo(11, -27); g.stroke();
      const P = RC('#A8AEB8'), Tb = RC('#B91C1C'), sk = R(['#3A2414', '#5A3A24', '#8A5A3A', '#B07A52', '#D8A078', '#F2C8A0'])[3];
      box(g, -16, -64, 22, 36, INK); box(g, -15, -63, 20, 34, P[3]); box(g, -12, -62, 14, 30, Tb[3]); box(g, -12, -62, 14, 2, Tb[5]);
      box(g, 4, -32, 22, 8, INK); box(g, 5, -31, 20, 6, P[3]); box(g, 22, -30, 6, 30, INK); box(g, 23, -29, 4, 29, P[2]);
      box(g, -12, -78, 14, 15, INK); box(g, -11, -77, 12, 13, sk); box(g, -11, -79, 12, 4, R(['#1A1010', '#2A1A10', '#3A2414', '#5A3A1E', '#7A5A34', '#9A7A4E'])[2]); box(g, -2, -72, 2, 2, INK);
      box(g, 4, -58, 10, 4, INK); box(g, 6, -64, 6, 9, '#E0AE3A'); box(g, 6, -64, 6, 2, '#F6D365');
      g.fillStyle = INK; g.beginPath(); g.ellipse(-36, -10, 11, 10, 0.3, 0, Math.PI * 2); g.fill(); g.fillStyle = P[3]; g.beginPath(); g.ellipse(-36, -10, 10, 9, 0.3, 0, Math.PI * 2); g.fill(); box(g, -40, -14, 8, 2, P[1]); polyF(g, [[-40, -18], [-54, -30], [-36, -20]], RC('#F6D365')[3]);
      break;
    }
    case 'bins': {
      for (const [bx, col] of [[-22, '#2E6A3A'], [10, '#2E4E8A']] as const) { const Cc = RC(col); box(g, bx - 14, -44, 28, 44, INK); box(g, bx - 13, -43, 26, 43, Cc[3]); box(g, bx - 13, -43, 5, 43, Cc[4]); box(g, bx + 7, -43, 6, 43, Cc[2]); box(g, bx - 16, -48, 32, 6, INK); box(g, bx - 15, -47, 30, 4, Cc[4]); for (let y = -36; y < -4; y += 10) box(g, bx - 13, y, 26, 1, Cc[1]); }
      box(g, 18, -56, 10, 8, '#F49AC8'); box(g, -26, -52, 6, 4, '#F6D365');
      break;
    }
    case 'cart': {
      // (a hay cart: planks, spoked wheels, a heap of hay, a pitchfork in it)
      for (const wx of [-30, 30]) { g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(wx, -18, 18, 0, Math.PI * 2); g.stroke(); g.strokeStyle = Tm[3]; g.lineWidth = 3; g.stroke(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.strokeStyle = Tm[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, -18); g.lineTo(wx + Math.cos(a) * 17, -18 + Math.sin(a) * 17); g.stroke(); } box(g, wx - 3, -21, 6, 6, Ir[3]); }
      box(g, -50, -48, 100, 20, INK); box(g, -49, -47, 98, 18, Tm[3]); for (let k = -49; k < 49; k += 14) box(g, k, -47, 1, 18, Tm[1]); box(g, -49, -47, 98, 2, Tm[5]);
      const Hy = RC('#D8B060'); for (let k = 0; k < 14; k++) { const hx = -44 + k * 7, hh = 20 + Math.sin(k * 0.6) * 10; box(g, hx, -48 - hh, 8, hh, Hy[2 + (k % 3)]); box(g, hx + 1, -48 - hh, 2, 3, Hy[5]); }
      box(g, 18, -110, 2, 50, Tm[2]); for (const dx of [-4, 0, 4]) box(g, 19 + dx, -118, 1, 9, Ir[4]);
      break;
    }
  }
};
const drawProps = (c: Ctx, v: View) => {
  for (const [rx, kind] of PROPS) {
    const x = X(rx);
    if (!seen(v, x - 80, x + 80, PROP_D, 60)) continue;
    stillAt(c, v, PROP_D, `kp-prop-${kind}-${rx}`, x, GY, -80, -200, 160, 204, g => paintProp(g, kind, rx));
    if (kind === 'fountain') {
      // (the water: out of her wand in arcs into the basin (live))
      for (let k = 0; k < 10; k++) { const t = (v.f * 0.03 + k / 10) % 1, s = k % 2 ? 1 : -1, [sx, sy] = at(v.eye, x + 9 + s * t * 46, GY - 168 + t * t * 140 - t * 20, PROP_D); box(c, sx, sy, 2, 2, k % 3 ? '#C8E8FF' : '#8AC0F0'); }
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE GATEHOUSE

const SHOP_FEAT: [number, 'shelf' | 'gowns' | 'barrel' | 'till' | 'plush' | 'globes' | 'sconce' | 'banner'][] = [
  [1340, 'sconce'], [1420, 'banner'], [1520, 'shelf'], [1660, 'gowns'], [1800, 'shelf'], [1900, 'sconce'], [1990, 'plush'], [2120, 'shelf'],
  [2240, 'barrel'], [2340, 'till'], [2460, 'sconce'], [2540, 'globes'], [2680, 'banner'], [2780, 'shelf'], [2860, 'sconce'],
];
const ITEMS = ['plush', 'tiara', 'wand', 'globe', 'mug', 'book', 'hat', 'cup'] as const;
const item = (g: Ctx, kind: typeof ITEMS[number], x: number, y: number, seed: number) => {
  const Pk = R(PINK), Gd = R(GOLD), Tm = R(TIMBER);
  switch (kind) {
    case 'plush': box(g, x - 1, y - 13, 12, 13, INK); box(g, x, y - 12, 10, 12, Pk[4]); box(g, x + 2, y - 16, 6, 5, INK); box(g, x + 3, y - 15, 4, 4, '#F8D8B8'); box(g, x + 2, y - 18, 6, 3, '#F6D365'); box(g, x + 3, y - 8, 4, 1, Pk[2]); break;
    case 'tiara': polyF(g, [[x, y - 2], [x + 1, y - 9], [x + 4, y - 5], [x + 6, y - 11], [x + 8, y - 5], [x + 11, y - 9], [x + 12, y - 2]], Gd[3]); box(g, x + 5, y - 7, 2, 2, '#60A5FA'); box(g, x, y - 2, 12, 2, R(['#2A2440', '#3A3458', '#4A4470', '#5A5488', '#7A74A8', '#9A94C8'])[3]); break;
    case 'wand': for (let k = 0; k < 3; k++) { box(g, x + k * 4, y - 16, 2, 16, Tm[3 + (k % 2)]); box(g, x + k * 4, y - 17, 2, 2, Gd[4]); } box(g, x - 1, y - 6, 12, 6, Tm[2]); break;
    case 'globe': g.fillStyle = INK; g.beginPath(); g.arc(x + 6, y - 9, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#C8E0F8'; g.beginPath(); g.arc(x + 6, y - 9, 5, 0, Math.PI * 2); g.fill(); box(g, x + 4, y - 9, 4, 4, R(PALE)[4]); box(g, x + 5, y - 11, 2, 2, Pk[3]); box(g, x + 3, y - 12, 1, 1, '#FFFFFF'); box(g, x + 1, y - 3, 10, 3, Gd[2]); break;
    case 'mug': box(g, x, y - 10, 9, 10, INK); box(g, x + 1, y - 9, 7, 9, seed % 2 ? '#F4F0FA' : Pk[4]); box(g, x + 8, y - 8, 3, 5, INK); box(g, x + 2, y - 6, 4, 2, Pk[2]); break;
    case 'book': box(g, x, y - 14, 10, 14, INK); box(g, x + 1, y - 13, 8, 13, ['#6E0E1C', '#1E3A6E', '#2E5A3A'][seed % 3]); box(g, x + 2, y - 11, 6, 1, Gd[4]); box(g, x + 2, y - 4, 6, 1, Gd[4]); break;
    case 'hat': polyF(g, [[x, y], [x + 12, y], [x + 7, y - 18], [x + 5, y - 18]], INK); polyF(g, [[x + 1, y - 1], [x + 11, y - 1], [x + 7, y - 17], [x + 5, y - 17]], Pk[3]); box(g, x + 5, y - 20, 2, 3, '#FFFFFF'); break;
    case 'cup': box(g, x + 2, y - 12, 8, 7, INK); box(g, x + 3, y - 11, 6, 5, Gd[3]); box(g, x + 5, y - 6, 2, 4, Gd[2]); box(g, x + 2, y - 2, 8, 2, Gd[2]); break;
  }
};
const paintPassage = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE), Tm = R(TIMBER), Ir = R(IRON), Gd = R(GOLD), Pk = R(PINK), h = GATEHOUSE.ceil;
  ashlar(g, -10, -h, w + 20, h, S, 29, 13, 28);
  // (the ceiling's beams along the top, iron straps)
  box(g, -10, -h, w + 20, 14, INK); box(g, -10, -h + 1, w + 20, 12, Tm[2]); box(g, -10, -h + 1, w + 20, 2, Tm[4]);
  for (let k = -sx % 64; k < w; k += 64) { box(g, k, -h, 10, 24, INK); box(g, k + 1, -h, 8, 23, Tm[3]); box(g, k + 1, -h, 2, 23, Tm[5]); box(g, k, -h + 14, 10, 3, Ir[3]); }
  for (const [rx, kind] of SHOP_FEAT) {
    const x = rx - sx;
    if (x < -120 || x > w + 120) continue;
    if (kind === 'sconce') sconce(g, x, -112, Ir);
    else if (kind === 'banner') banner(g, x, -h + 22, 22, 70, Pk, Gd, 'crown');
    else if (kind === 'shelf') {
      // (a tall shelf unit: dark oak, four shelves of merch, price tags)
      box(g, x - 56, -140, 112, 140, INK); box(g, x - 55, -139, 110, 139, Tm[1]); box(g, x - 55, -139, 4, 139, Tm[3]); box(g, x + 51, -139, 4, 139, Tm[0]);
      polyF(g, [[x - 60, -140], [x, -156], [x + 60, -140]], INK); polyF(g, [[x - 58, -141], [x, -154], [x + 58, -141]], Tm[3]); box(g, x - 4, -152, 8, 8, Gd[3]);
      for (const [k, sh] of [[0, -106], [1, -72], [2, -38], [3, -6]] as const) {
        box(g, x - 55, sh, 110, 5, Tm[3]); box(g, x - 55, sh, 110, 1, Tm[5]);
        for (let i = 0; i < 7; i++) { const it = ITEMS[Math.floor(hash(rx + k * 7 + i) * ITEMS.length)]; item(g, it, x - 50 + i * 15, sh, i + k); }
        box(g, x - 40 + k * 18, sh + 1, 8, 4, '#F4F0FA'); box(g, x - 39 + k * 18, sh + 2, 5, 1, '#B91C1C');
      }
    } else if (kind === 'gowns') {
      // (a rack of princess gowns, a mirror by it)
      box(g, x - 50, -120, 100, 4, INK); box(g, x - 49, -119, 98, 2, Gd[3]); for (const px of [-48, 46]) box(g, x + px, -120, 3, 120, Ir[3]);
      for (let k = 0; k < 7; k++) { const col = ['#3B82F6', '#FACC15', '#F472B6', '#2DD4BF', '#A78BFA', '#F49AC8', '#E11D48'][k], Cc = RC(col); polyF(g, [[x - 42 + k * 13, -116], [x - 34 + k * 13, -116], [x - 28 + k * 13, -30], [x - 48 + k * 13, -30]], INK); polyF(g, [[x - 41 + k * 13, -115], [x - 35 + k * 13, -115], [x - 29 + k * 13, -31], [x - 47 + k * 13, -31]], Cc[3]); box(g, x - 41 + k * 13, -115, 2, 84, Cc[5]); box(g, x - 47 + k * 13, -33, 18, 2, R(GOLD)[4]); }
      box(g, x + 60, -130, 30, 110, INK); box(g, x + 61, -129, 28, 108, Gd[3]); box(g, x + 64, -126, 22, 102, '#B8D0E8'); polyF(g, [[x + 66, -110], [x + 76, -126], [x + 80, -126], [x + 66, -100]], '#E8F4FF');
    } else if (kind === 'barrel') {
      box(g, x - 22, -44, 44, 44, INK); box(g, x - 21, -43, 42, 43, Tm[3]); box(g, x - 21, -43, 8, 43, Tm[4]); box(g, x + 12, -43, 9, 43, Tm[2]); for (const y of [-38, -12]) box(g, x - 21, y, 42, 3, Ir[3]);
      for (let k = 0; k < 12; k++) { const wx = x - 18 + k * 3.2, top = -60 - hash(k + rx) * 16; box(g, wx, top, 2, -42 - top, Tm[k % 2 ? 4 : 5]); box(g, wx, top - 2, 2, 2, k % 3 ? Gd[4] : '#FFFFFF'); }
      box(g, x - 16, -30, 32, 12, '#F4F0FA'); box(g, x - 14, -27, 28, 2, '#B91C1C'); box(g, x - 10, -23, 20, 2, INK);
    } else if (kind === 'till') {
      // (the counter, the till, a bored cashier in a pointy hat, a tip jar)
      box(g, x - 70, -56, 140, 56, INK); box(g, x - 69, -55, 138, 55, Tm[2]); box(g, x - 69, -55, 138, 4, Tm[4]); for (let k = -60; k < 66; k += 30) { box(g, x + k, -46, 22, 40, Tm[1]); box(g, x + k, -46, 22, 1, Tm[3]); }
      const sk = R(['#3A2414', '#5A3A24', '#8A5A3A', '#B07A52', '#D8A078', '#F2C8A0'])[2];
      box(g, x + 10, -96, 30, 42, INK); box(g, x + 11, -95, 28, 41, Pk[3]); box(g, x + 11, -95, 6, 41, Pk[4]);
      box(g, x + 16, -118, 20, 22, INK); box(g, x + 17, -117, 18, 21, sk); box(g, x + 20, -108, 3, 1, INK); box(g, x + 28, -108, 3, 1, INK); box(g, x + 22, -101, 8, 1, INK);
      polyF(g, [[x + 13, -116], [x + 39, -116], [x + 28, -150], [x + 24, -150]], INK); polyF(g, [[x + 14, -117], [x + 38, -117], [x + 27, -148], [x + 25, -148]], Pk[4]); box(g, x + 25, -152, 3, 4, '#FFFFFF');
      box(g, x + 4, -66, 12, 12, INK); box(g, x + 5, -65, 10, 11, sk);
      box(g, x - 50, -78, 40, 24, INK); box(g, x - 49, -77, 38, 22, Ir[3]); box(g, x - 46, -74, 18, 8, '#9AE6B4'); box(g, x - 46, -74, 18, 1, '#D8FFE8'); for (let k = 0; k < 6; k++) box(g, x - 46 + (k % 3) * 7, -62 + Math.floor(k / 3) * 4, 5, 2, Ir[5]);
      box(g, x - 4, -70, 10, 14, INK); box(g, x - 3, -69, 8, 13, '#C8E8FF'); box(g, x - 2, -62, 6, 5, '#7AC860'); box(g, x - 3, -76, 8, 6, '#F4F0FA');
    } else if (kind === 'plush') {
      // (a heap of plush Pipers, a gilt PIXIE PLUSH $35 card)
      for (let k = 0; k < 16; k++) { const px = x - 50 + (k % 6) * 17 + (Math.floor(k / 6) % 2) * 8, py = -2 - Math.floor(k / 6) * 15; box(g, px - 1, py - 14, 16, 14, INK); box(g, px, py - 13, 14, 13, Pk[3 + (k % 2)]); box(g, px + 3, py - 19, 8, 7, INK); box(g, px + 4, py - 18, 6, 6, '#F8D8B8'); box(g, px + 3, py - 21, 8, 3, '#F6D365'); box(g, px + 1, py - 10, 2, 4, '#FFFFFF'); box(g, px + 11, py - 10, 2, 4, '#FFFFFF'); }
      box(g, x - 18, -70, 36, 14, INK); box(g, x - 17, -69, 34, 12, Gd[3]); box(g, x - 14, -65, 28, 2, '#6E0E1C');
    } else {
      // (snow globes on a round table, a glass dome)
      box(g, x - 4, -40, 8, 40, INK); box(g, x - 3, -40, 6, 40, Tm[3]); box(g, x - 34, -44, 68, 6, INK); box(g, x - 33, -43, 66, 4, Tm[4]);
      for (let k = 0; k < 5; k++) item(g, 'globe', x - 30 + k * 12, -44, k);
    }
  }
  box(g, -10, -4, w + 20, 4, Tm[1]);
};

/** The gatehouse in the play plane over the passage (the solid between 170 and 340: stood on along its roof), its
 *  bartizans and their cones, the portcullis up in the arch, a crest; behind it its parapet at PARA_D. */
const paintGateBlock = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE, false), Ir = R(IRON, false), Gd = R(GOLD, false), Pk = R(PINK), top = GATEHOUSE.roof, ceil = GATEHOUSE.ceil;
  ashlar(g, -10, -top, w + 20, top - ceil, S, 37, 13, 30);
  // (a string course; the machicolation corbels under the roof; slits; banners)
  box(g, -10, -top + 34, w + 20, 4, S[5]); box(g, -10, -top + 38, w + 20, 1, S[1]);
  for (let k = -(sx % 22); k < w; k += 22) { polyF(g, [[k, -top + 4], [k + 14, -top + 4], [k + 11, -top + 22], [k + 3, -top + 22]], INK); polyF(g, [[k + 1, -top + 4], [k + 13, -top + 4], [k + 10, -top + 21], [k + 4, -top + 21]], S[2]); box(g, k + 1, -top + 4, 2, 16, S[4]); }
  for (let rx = 1300; rx < GATEHOUSE.b; rx += 110) { const x = rx - sx; if (x > -20 && x < w + 20) slit(g, x, -top + 60, 22, S); }
  for (let rx = 1560; rx < GATEHOUSE.b - 40; rx += 330) { const x = rx - sx; if (x > -40 && x < w + 40) banner(g, x, -top + 42, 24, 100, Pk, Gd, 'heart'); }
  // (the underside: a shadow, dithered)
  box(g, -10, -ceil - 6, w + 20, 6, S[1]); checker(g, -10, -ceil - 10, w + 20, 4, S[1], 0, 1);
  // (the arch's portcullis up: its iron grid and spikes hanging under the ceiling; a gilt crest over the arch)
  const pa = GATEHOUSE.a + 4 - sx, pb = GATEHOUSE.a + 196 - sx;
  if (pb > 0 && pa < w) {
    for (let x = pa; x <= pb; x += 10) { box(g, x - 1, -ceil, 4, 24, INK); box(g, x, -ceil, 2, 22, Ir[3]); box(g, x, -ceil, 1, 22, Ir[5]); polyF(g, [[x - 2, -ceil + 22], [x + 1, -ceil + 30], [x + 4, -ceil + 22]], Ir[4]); }
    for (const y of [-ceil + 4, -ceil + 14]) { box(g, pa - 1, y - 1, pb - pa + 2, 4, INK); box(g, pa, y, pb - pa, 2, Ir[3]); }
    const cx = (pa + pb) / 2;
    polyF(g, [[cx - 24, -top + 82], [cx + 24, -top + 82], [cx + 24, -top + 108], [cx, -top + 126], [cx - 24, -top + 108]], INK);
    polyF(g, [[cx - 22, -top + 84], [cx + 22, -top + 84], [cx + 22, -top + 107], [cx, -top + 123], [cx - 22, -top + 107]], Pk[3]);
    polyF(g, [[cx - 22, -top + 84], [cx, -top + 84], [cx, -top + 123], [cx - 22, -top + 107]], Pk[4]);
    g.fillStyle = Gd[3]; g.beginPath(); g.arc(cx - 5, -top + 98, 6, 0, Math.PI * 2); g.arc(cx + 5, -top + 98, 6, 0, Math.PI * 2); g.fill(); polyF(g, [[cx - 11, -top + 99], [cx, -top + 113], [cx + 11, -top + 99]], Gd[3]); box(g, cx - 8, -top + 95, 3, 3, Gd[5]);
    polyF(g, [[cx - 14, -top + 82], [cx - 12, -top + 72], [cx - 6, -top + 78], [cx, -top + 68], [cx + 6, -top + 78], [cx + 12, -top + 72], [cx + 14, -top + 82]], Gd[3]);
    // (the arch's voussoirs round the opening's top)
    for (let x = pa - 8; x < pb + 8; x += 12) { box(g, x, -ceil - 14, 11, 12, INK); box(g, x + 1, -ceil - 13, 9, 10, S[4]); box(g, x + 1, -ceil - 13, 9, 1, S[5]); }
  }
  lip(g, -10, -top, w + 20);
};
const drawGatehouse = (c: Ctx, v: View, state: GameState) => {
  const a = X(GATEHOUSE.a), b = X(GATEHOUSE.b);
  if (!seen(v, a - 120, b + 120, PASS_D, 60)) return;
  // (the passage: its back wall, its floor going back (a red runner), the gift shop along it)
  run(c, v, PASS_D, 'pass', GATEHOUSE.a, GATEHOUSE.b, 0, GATEHOUSE.ceil, paintPassage);
  floorBack(c, v, GATEHOUSE.a, GATEHOUSE.b, PASS_D, 'carpet');
  for (const [rx, kind] of SHOP_FEAT) if (kind === 'sconce') { const [sx, sy] = scr(v, rx, 112, PASS_D); if (sx > v.cam.x - 40 && sx < v.cam.x + 840) flame(c, sx, sy, state.frame); }
  // (its roof's top going back to the parapet, the parapet; then the block over the passage)
  topBack(c, v.eye, a, b, Y(GATEHOUSE.roof), 1, PARA_D, R(FLAGS), 2);
  run(c, v, PARA_D, 'gpara', GATEHOUSE.a, GATEHOUSE.b, GATEHOUSE.roof, 30, (g, w) => merlons(g, -10, 0, w + 20, R(PALE), 18, 12, 18, true), 2);
};
const drawGateFront = (c: Ctx, v: View) => {
  if (!seen(v, X(GATEHOUSE.a) - 120, X(GATEHOUSE.b) + 120, 1, 60)) return;
  run(c, v, 1, 'gblock', GATEHOUSE.a, GATEHOUSE.b, 0, GATEHOUSE.roof + 6, paintGateBlock, -GATEHOUSE.ceil + 34);
  // (the bartizans on its front corners, corbelled out from under the roof, up under blue cones; dimmed: not stood on)
  for (const rx of [GATEHOUSE.a + 26, GATEHOUSE.a + 176]) {
    if (!onScreenV(v, X(rx) - 50, X(rx) + 50)) continue;
    still(c, `kp-bartizan-${rx}`, X(rx), Y(GATEHOUSE.roof), -50, -260, 100, 320, g => {
      const S = R(PALE), Rf = R(ROOF), Gd = R(GOLD);
      for (let k = 0; k < 4; k++) { const ww = 40 - k * 8; box(g, -ww / 2 - 1, 30 + k * 7, ww + 2, 8, INK); box(g, -ww / 2, 30 + k * 7, ww, 7, S[3 - (k % 2)]); box(g, -ww / 2, 30 + k * 7, ww, 1, S[5]); }
      drum(g, 0, -90, 30, 44, S, rx, { windows: 1, glassCol: '#E0AE3A', slits: true });
      merlons(g, -26, -90, 52, S, 10, 6, 10, true);
      cone(g, 0, -102, 28, 82, Rf, Gd, rx % 2 ? '#F49AC8' : '#F6D365');
    });
  }
};

/** The gatehouse's front wall over the passage: there till he's in it (the inside's veiled till it's entered). */
export const drawGatehouseVeil = (c: Ctx, state: GameState) => {
  const a = X(GATEHOUSE.a), b = X(GATEHOUSE.b), p = state.player, cx = p.pos.x + p.width / 2;
  if (!onScreen(state, a - 40, b + 40)) return;
  const inside = cx > a + 10 && cx < b - 10 && p.pos.y + p.height > Y(GATEHOUSE.ceil);
  const k = keepVeil.k = keepVeil.k + ((inside ? 0 : 1) - keepVeil.k) * 0.15;
  if (k < 0.02) return;
  c.save(); c.globalAlpha = k;
  const v = viewOf(state);
  run(c, v, 1, 'veil', GATEHOUSE.a + 200, GATEHOUSE.b, 0, GATEHOUSE.ceil, paintVeil);
  c.restore();
};
const keepVeil = { k: 1 };
const paintVeil = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE, false), Ir = R(IRON, false), Gd = R(GOLD, false), Pk = R(PINK, false), Tm = R(TIMBER, false), G = warmGlass();
  ashlar(g, -10, -GATEHOUSE.ceil, w + 20, GATEHOUSE.ceil, S, 47, 13, 30);
  // (the shop's windows: leaded bays glowing warm, merch in them; window boxes; its painted board; a door)
  for (let rx = GATEHOUSE.a + 300; rx < GATEHOUSE.b - 60; rx += 240) {
    const x = rx - sx;
    if (x < -90 || x > w + 90) continue;
    box(g, x - 46, -128, 92, 82, INK); box(g, x - 44, -126, 88, 78, Tm[3]); box(g, x - 40, -122, 80, 70, G[2]);
    for (let k = 0; k < 4; k++) box(g, x - 40, -122 + k * 18, 80, 9, G[3 + (k % 2)]);
    for (let i = 0; i < 5; i++) item(g, ITEMS[(i + Math.floor(rx / 240)) % ITEMS.length], x - 36 + i * 15, -56, i);
    for (let k = 0; k < 6; k++) box(g, x - 40 + k * 16, -122, 1, 70, INK); for (let k = 0; k < 5; k++) box(g, x - 40, -122 + k * 17, 80, 1, INK);
    g.globalAlpha = 0.25; polyF(g, [[x - 40, -96], [x - 14, -122], [x, -122], [x - 40, -80]], '#FFFFFF'); g.globalAlpha = 1;
    box(g, x - 48, -46, 96, 6, INK); box(g, x - 47, -45, 94, 4, S[5]);
    box(g, x - 46, -40, 92, 12, INK); box(g, x - 45, -39, 90, 10, Tm[2]); for (let k = 0; k < 11; k++) { box(g, x - 42 + k * 8, -46, 6, 6, LEAVES[3]); box(g, x - 41 + k * 8, -47, 3, 3, k % 2 ? '#E11D48' : '#F472B6'); }
    polyF(g, [[x - 52, -128], [x + 52, -128], [x + 44, -146], [x - 44, -146]], INK); for (let k = 0; k < 13; k++) polyF(g, [[x - 51 + k * 8, -129], [x - 43 + k * 8, -129], [x - 37 + k * 8, -145], [x - 45 + k * 8, -145]], k % 2 ? Pk[3] : '#F4F0FA');
  }
  for (let rx = GATEHOUSE.a + 420; rx < GATEHOUSE.b; rx += 240) { const x = rx - sx; if (x > -30 && x < w + 30) { sconce(g, x, -100, Ir); box(g, x - 2, -112, 4, 5, '#F97316'); box(g, x - 1, -111, 2, 3, '#FDE68A'); } }
  // (the far end: the inner arch, its portcullis up)
  const e = GATEHOUSE.b - sx;
  if (e > -60 && e < w + 60) { box(g, e - 40, -GATEHOUSE.ceil, 40, GATEHOUSE.ceil, INK); box(g, e - 36, -GATEHOUSE.ceil, 32, GATEHOUSE.ceil, S[1]); for (let x = e - 34; x < e - 4; x += 8) box(g, x, -GATEHOUSE.ceil, 2, 22, Ir[3]); box(g, e - 30, -150, 20, 12, Gd[3]); }
  box(g, -10, -6, w + 20, 6, S[1]);
};

// ---------------------------------------------------------------------------------------------------------------
// THE COURTYARD and THE ROSE GARDEN

const YARD = { a: GATEHOUSE.b - 40, b: WALL.a + 160 }, YARD_H = 300;
const YARD_TOWERS = [3120, 3900, 4470];
const paintYardWall = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON), Tm = R(TIMBER), Rf = R(ROOF), Bl = R(['#0E1430', '#18224E', '#22327A', '#2E4EA8', '#5A7ACC', '#9AB4EC']);
  ashlar(g, -10, -YARD_H, w + 20, YARD_H, S, 53, 14, 32);
  merlons(g, -10, -YARD_H, w + 20, S, 18, 12, 16, true);
  // (the arcade along its foot: arches on columns, the walk dark behind, lanterns hung in them, a door at the back of some)
  const A = 76;
  for (let rx = Math.floor((sx - 100) / A) * A; rx < sx + w + 100; rx += A) {
    const x = rx - sx + 4;
    g.fillStyle = INK; g.beginPath(); g.moveTo(x, -4); g.lineTo(x, -96); g.arc(x + A / 2 - 4, -96, A / 2 - 4, Math.PI, 0); g.lineTo(x + A - 8, -4); g.closePath(); g.fill();
    g.fillStyle = S[0]; g.beginPath(); g.moveTo(x + 2, -4); g.lineTo(x + 2, -96); g.arc(x + A / 2 - 4, -96, A / 2 - 6, Math.PI, 0); g.lineTo(x + A - 10, -4); g.closePath(); g.fill();
    box(g, x + 2, -60, A - 12, 56, S[1]); checker(g, x + 2, -64, A - 12, 4, S[1], 0, 1);
    if (hash(rx) > 0.55) { box(g, x + A / 2 - 14, -54, 20, 50, INK); box(g, x + A / 2 - 13, -53, 18, 49, Tm[2]); box(g, x + A / 2 - 13, -53, 18, 1, Tm[4]); box(g, x + A / 2 + 1, -30, 2, 2, Gd[4]); }
    else { box(g, x + A / 2 - 12, -76, 16, 26, INK); box(g, x + A / 2 - 11, -75, 14, 24, lit() ? '#FFD88A' : S[2]); box(g, x + A / 2 - 5, -75, 1, 24, INK); }
    box(g, x + A / 2 - 5, -134, 1, 18, INK); box(g, x + A / 2 - 9, -116, 9, 12, INK); box(g, x + A / 2 - 8, -115, 7, 10, lit() ? '#FFE9A8' : '#B8B4C8'); box(g, x + A / 2 - 10, -118, 11, 3, Ir[3]);
    // (the column: a shaft, a capital, a base)
    box(g, x - 6, -104, 12, 100, INK); box(g, x - 5, -104, 10, 100, S[4]); box(g, x - 5, -104, 3, 100, S[5]); box(g, x + 2, -104, 3, 100, S[2]);
    box(g, x - 9, -110, 18, 7, INK); box(g, x - 8, -109, 16, 5, S[5]); box(g, x - 9, -8, 18, 8, INK); box(g, x - 8, -7, 16, 6, S[3]);
  }
  box(g, -10, -146, w + 20, 6, INK); box(g, -10, -145, w + 20, 4, S[5]); box(g, -10, -141, w + 20, 1, S[1]);
  // (over the arcade: lancets in a row, banners between, sconces)
  for (let rx = Math.floor(sx / 152) * 152 + 76; rx < sx + w + 80; rx += 152) {
    const x = rx - sx;
    if (YARD_TOWERS.some(t => Math.abs(t - rx) < 60)) continue;
    if (Math.floor(rx / 152) % 3 === 1) banner(g, x, -YARD_H + 20, 26, 110, Math.floor(rx / 456) % 2 ? Bl : Pk, Gd, Math.floor(rx / 456) % 2 ? 'star' : 'heart');
    else lancet(g, x, -250, 22, 74, S, Math.floor(rx / 152) % 2 ? '#C8306E' : '#3A6ACC', rx);
  }
  for (let rx = Math.floor(sx / 304) * 304; rx < sx + w + 40; rx += 304) { const x = rx - sx + 2; sconce(g, x, -176, Ir); }
  // (round towers up out of it, under cones)
  for (const rx of YARD_TOWERS) {
    const x = rx - sx;
    if (x < -90 || x > w + 90) continue;
    drum(g, x, -470, 0, 92, S, rx, { windows: 2, glassCol: '#E0AE3A', slits: true });
    merlons(g, x - 50, -470, 100, S, 12, 8, 14, true);
    cone(g, x, -486, 54, 120, Rf, Gd, rx % 2 ? '#F49AC8' : '#F6D365');
    banner(g, x, -400, 22, 80, Pk, Gd, 'crown');
  }
};
const YARD_SCONCES = (() => { const out: number[] = []; for (let rx = Math.floor(YARD.a / 304) * 304; rx < YARD.b; rx += 304) out.push(rx + 2); return out; })();
const drawCourtyard = (c: Ctx, v: View) => {
  if (!seen(v, X(YARD.a) - 200, X(YARD.b) + 200, YARD_D, 60)) return;
  run(c, v, YARD_D, 'yard', YARD.a, YARD.b, 0, 640, paintYardWall);
  for (const rx of YARD_SCONCES) { const [sx, sy] = scr(v, rx, 176, YARD_D); if (sx > v.cam.x - 40 && sx < v.cam.x + 840) flame(c, sx, sy, v.f, 0.12); }
  floorBack(c, v, YARD.a, 4040, YARD_D, 'flag');
  floorBack(c, v, 4040, YARD.b, YARD_D, 'lawn');
};

// ---------------------------------------------------------------------------------------------------------------
// THE RAMPARTS: the curtain wall, its walk, the parapet, the hoardings, the breach

const paintCurtain = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE, false), Ir = R(IRON, false), Pk = R(PINK), Gd = R(GOLD), St = R(PALE), h = WALL.top;
  ashlar(g, -10, -h, w + 20, h, S, 71, 14, 32);
  // (buttresses up its face, stepped back, gabled caps; cross slits; niches with statues; banners off the walk)
  for (let rx = Math.floor(sx / 200) * 200 - 100; rx < sx + w + 100; rx += 200) {
    const x = rx - sx;
    if (rx > BREACH.a - 40 && rx < BREACH.b + 40) continue;
    for (const [y0, y1, bw] of [[-150, 0, 26], [-250, -150, 18]] as const) { box(g, x - bw / 2 - 1, y0, bw + 2, y1 - y0, INK); box(g, x - bw / 2, y0, bw, y1 - y0, S[4]); box(g, x + bw / 2 - 5, y0, 5, y1 - y0, S[2]); box(g, x - bw / 2, y0, 2, y1 - y0, S[5]); polyF(g, [[x - bw / 2 - 2, y0 + 2], [x, y0 - 10], [x + bw / 2 + 2, y0 + 2]], INK); polyF(g, [[x - bw / 2 - 1, y0 + 1], [x, y0 - 8], [x + bw / 2 + 1, y0 + 1]], S[5]); }
    const mx = x + 100;
    if ((rx + 100 > BREACH.a - 60 && rx + 100 < BREACH.b + 60) || rx + 100 < WALL.a + 30 || rx + 100 > WALL.b - 30) continue;
    if (Math.floor(rx / 200) % 3 === 0) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(mx - 22, -50); g.lineTo(mx - 22, -170); g.arc(mx, -170, 22, Math.PI, 0); g.lineTo(mx + 22, -50); g.closePath(); g.fill();
      g.fillStyle = S[1]; g.beginPath(); g.moveTo(mx - 20, -50); g.lineTo(mx - 20, -170); g.arc(mx, -170, 20, Math.PI, 0); g.lineTo(mx + 20, -50); g.closePath(); g.fill();
      // (a statue: a fairy with her wings out, or a unicorn rearing)
      if (Math.floor(rx / 600) % 2) { polyF(g, [[mx - 7, -54], [mx + 7, -54], [mx + 4, -110], [mx - 4, -110]], St[4]); g.fillStyle = St[4]; g.beginPath(); g.arc(mx, -118, 7, 0, Math.PI * 2); g.fill(); for (const s of [-1, 1]) polyF(g, [[mx + s * 3, -104], [mx + s * 18, -128], [mx + s * 14, -96]], St[5]); box(g, mx + 5, -140, 2, 30, Gd[3]); }
      else { polyF(g, [[mx - 12, -54], [mx + 4, -54], [mx + 10, -96], [mx + 2, -124], [mx - 6, -118], [mx - 2, -96], [mx - 12, -80]], St[4]); polyF(g, [[mx + 2, -124], [mx + 6, -146], [mx + 6, -122]], Gd[3]); box(g, mx - 2, -118, 2, 2, INK); }
      box(g, mx - 26, -54, 52, 6, INK); box(g, mx - 25, -53, 50, 4, S[5]);
    } else if (Math.floor(rx / 200) % 3 === 1) { slit(g, mx, -220, 24, S); slit(g, mx, -120, 24, S); }
    else { sconce(g, mx, -150, Ir); banner(g, mx, -h + 8, 26, 96, Pk, Gd, 'heart'); }
  }
  box(g, -10, -h + 6, w + 20, 4, S[1]);
  lip(g, -10, -h, w + 20);
};
const CURTAIN_SCONCES = (() => { const out: number[] = []; for (let rx = Math.floor(WALL.a / 200) * 200 + 100; rx < WALL.b; rx += 200) if (Math.floor(rx / 200) % 3 === 2 && !(rx + 100 > BREACH.a - 60 && rx + 100 < BREACH.b + 60)) out.push(rx + 100); return out; })();
const paintPillar = (g: Ctx, w: number) => { ashlar(g, 0, -WALL.top, w, WALL.top, R(PALE, false), 83, 14, 26); box(g, w - 4, -WALL.top, 4, WALL.top, R(PALE, false)[1]); lip(g, 0, -WALL.top, w); };

/** Through the breach: the outside (BREACH_D): the frozen outer moat, its far bank, pines, a lamp post, a queue of
 *  guests at a rope, staring in. */
const BREACH_D = 0.74;
const paintOutside = (g: Ctx, w: number) => {
  const Sn = R(SNOW), P = R(['#0A1816', '#142C28', '#1E423A', '#2A5A4C', '#3E7660', '#62967C']), Ir = R(IRON), Gd = R(GOLD), S = R(PALE);
  // (the far bank: a snowy slope up to a line of pines and a hedge, a lamp post, the queue behind its rope)
  box(g, 0, -200, w, 200, Sn[3]); for (let y = -200; y < 0; y += 8) box(g, 0, y, w, 1, Sn[2]);
  for (let x = 4; x < w; x += 22) { const h = 70 + hash(x) * 50; for (let k = 0; k < 4; k++) { const yy = -200 - h + k * h / 4, hw = 6 + k * 6; polyF(g, [[x, yy], [x + hw, yy + h / 4 + 6], [x - hw, yy + h / 4 + 6]], P[2 + (k % 2)]); box(g, x - hw * 0.7, yy + h / 4 + 4, hw * 1.2, 2, Sn[4]); } box(g, x - 2, -200, 4, 8, R(TIMBER)[2]); }
  box(g, 0, -120, w, 6, Ir[2]); for (let x = 10; x < w; x += 40) { box(g, x, -140, 3, 24, Ir[3]); ballR3(g, x + 1, -142, 3, Gd); }
  g.strokeStyle = R(RED)[3]; g.lineWidth = 2; g.beginPath(); for (let x = 10; x < w - 30; x += 40) { g.moveTo(x + 2, -134); g.quadraticCurveTo(x + 22, -124, x + 42, -134); } g.stroke();
  for (let i = 0; i < Math.floor(w / 9); i++) guest(g, 6 + i * 9 + hash(i) * 4, -122, i * 13 + 5, 1.5, dimmed, i % 7 === 0);
  g.save(); g.translate(Math.round(w * 0.7), -124); lampPost(g, Ir, Gd, 110); g.restore();
  // (the frozen moat: ice in bands, a skater, its near bank's stone)
  box(g, 0, -90, w, 56, R(['#4A6A9A', '#6A8ABA', '#8AAAD4', '#A8C8E8', '#C8E0F4', '#E4F2FC'])[3]);
  for (let y = -88; y < -36; y += 6) box(g, 0, y, w, 1, R(['#4A6A9A', '#6A8ABA', '#8AAAD4', '#A8C8E8', '#C8E0F4', '#E4F2FC'])[4]);
  for (let k = 0; k < 6; k++) box(g, hash(k * 3) * w, -80 + hash(k) * 36, 20, 1, '#FFFFFF');
  box(g, 0, -34, w, 34, S[2]); ashlar(g, 0, -34, w, 34, S, 9, 9, 20);
  box(g, 0, -36, w, 3, Sn[4]);
};
const ballR3 = (g: Ctx, x: number, y: number, r: number, Rr: string[]) => { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = Rr[3]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };

const drawRamparts = (c: Ctx, v: View) => {
  if (!seen(v, X(WALL.a) - 200, X(TOWER_WALL.b) + 200, BREACH_D, 60)) return;
  // (through the breach: the outside, its floor of rubble going back to it)
  if (seen(v, X(BREACH.a), X(BREACH.b), BREACH_D, 60)) {
    stillAt(c, v, BREACH_D, 'kp-outside', X(BREACH.a - 60), GY, 0, -360, BREACH.b - BREACH.a + 120, 364, g => paintOutside(g, BREACH.b - BREACH.a + 120));
    floorBack(c, v, BREACH.a, BREACH.b, BREACH_D, 'rubble');
  }
};
/** The walk's top going back to the parapet, the parapet: up to the tower. */
const drawWalk = (c: Ctx, v: View) => {
  if (!seen(v, X(WALL.a) - 100, X(6300) + 100, PARA_D, 60)) return;
  for (const [a, b] of [[WALL.a, BREACH.a], [PILLAR.a, PILLAR.b], [BREACH.b, 6300]] as const) {
    topBack(c, v.eye, X(a), X(b), Y(WALL.top), 1, PARA_D, R(FLAGS), 2);
    run(c, v, PARA_D, `para${a}`, a, b, WALL.top, 34, (g, w) => merlons(g, 0, 0, w, R(PALE), 18, 12, 20, true), 2);
  }
};
/** The curtain wall's face and its pillar (the play plane), the breach's broken ends going back, its rubble and
 *  scaffolding. */
const drawCurtain = (c: Ctx, v: View) => {
  if (!seen(v, X(WALL.a) - 100, X(WALL.b) + 100, 1, 60)) return;
  const S = R(PALE);
  // (the broken ends' thickness going back)
  for (const [e, side] of [[X(BREACH.a), 1], [X(BREACH.b), -1]] as const) sideBack(c, v.eye, e, side, Y(WALL.top), GY, 1, 0.9, S, 4);
  run(c, v, 1, 'curtA', WALL.a, BREACH.a, 0, WALL.top + 6, paintCurtain);
  run(c, v, 1, 'curtB', BREACH.b, WALL.b, 0, WALL.top + 6, paintCurtain);
  for (const rx of CURTAIN_SCONCES) if (onScreenV(v, X(rx) - 30, X(rx) + 30)) flame(c, X(rx), Y(150), v.f);
  if (seen(v, X(PILLAR.a), X(PILLAR.b), 1, 40)) still(c, 'kp-pillar', X(PILLAR.a), GY, -2, -WALL.top - 4, PILLAR.b - PILLAR.a + 4, WALL.top + 8, g => paintPillar(g, PILLAR.b - PILLAR.a));
  // (the broken ends: jagged stones, rubble heaped at their feet, the scaffold and its banner)
  if (seen(v, X(BREACH.a) - 60, X(BREACH.b) + 60, 1, 40)) {
    still(c, 'kp-breach', X(BREACH.a), GY, -40, -WALL.top - 140, BREACH.b - BREACH.a + 80, WALL.top + 144, g => {
      const Sn = R(PALE, false), Sd = R(PALE), Tm = R(TIMBER), Pk = R(PINK), wB = BREACH.b - BREACH.a;
      for (const [e, s] of [[0, 1], [wB, -1]] as const) {
        for (let y = -WALL.top; y < 0; y += 13) { const j = 6 + hash(y * 0.7 + e) * 16; box(g, e - (s > 0 ? 2 : j), y, j + 2, 13, INK); box(g, e - (s > 0 ? 1 : j - 1), y + 1, j, 11, Sn[3]); box(g, e - (s > 0 ? 1 : j - 1), y + 1, j, 1, Sn[5]); }
        // (rubble heaped up at the foot)
        for (let k = 0; k < 9; k++) { const rx = e + s * (6 + k * 9 + hash(k + e) * 8), ry = -(30 - k * 3) * hash(k * 1.3 + 0.5), r = 5 + hash(k * 2.1 + e) * 6; box(g, rx - r - 1, ry - r - 1, r * 2 + 2, r + 2, INK); box(g, rx - r, ry - r, r * 2, r, Sd[3]); box(g, rx - r, ry - r, r * 2, 1, Sd[5]); }
      }
      // (the scaffold: poles lashed, planks across (dimmed: not stood on), the banner hung off it)
      for (const px of [36, wB / 2 - 70, wB / 2 + 70, wB - 36]) { box(g, px - 2, -WALL.top - 120, 5, WALL.top + 120, INK); box(g, px - 1, -WALL.top - 120, 3, WALL.top + 120, Tm[3]); box(g, px - 1, -WALL.top - 120, 1, WALL.top + 120, Tm[5]); }
      g.strokeStyle = Tm[1]; g.lineWidth = 2; g.beginPath(); g.moveTo(36, -WALL.top + 20); g.lineTo(wB / 2 - 70, -140); g.moveTo(wB / 2 + 70, -WALL.top + 20); g.lineTo(wB - 36, -140); g.stroke();
      const bw = 190, bx = wB / 2 - bw / 2, by = -WALL.top - 96;
      box(g, bx - 1, by - 1, bw + 2, 54, INK); box(g, bx, by, bw, 52, Pk[3]); box(g, bx, by, bw, 3, Pk[5]); box(g, bx, by + 48, bw, 4, Pk[1]);
      for (let k = 0; k < bw; k += 12) box(g, bx + k, by + 52, 6, 4, Pk[2]);
      for (const s of [-1, 1]) { box(g, wB / 2 + s * 70 - 2, by - 6, 5, 8, INK); }
    });
    // (its words, in gilt)
    still(c, 'kp-pardon', X((BREACH.a + BREACH.b) / 2), Y(WALL.top + 96), -100, -2, 200, 54, g => { signText(g, 'PARDON OUR', 0, 22, gilt(2)); signText(g, 'PIXIE DUST', 0, 44, gilt(2)); });
  }
};

/** The hoardings over the walk (scenery: dimmed, not stood on), their posts down to the parapet. */
const drawHoardings = (c: Ctx, v: View) => {
  for (const [a, b, h] of [[4880, 5180, 480], [5620, 5780, 520]] as const) {
    if (!seen(v, X(a) - 30, X(b) + 30, 1, 40)) continue;
    still(c, `kp-hoard-${a}`, X(a), Y(h), -20, -94, b - a + 40, h - WALL.top + 100, g => {
      const W = R(TIMBER), Rf = R(PINK), Ir = R(IRON);
      for (const px of [6, b - a - 10]) { box(g, px - 1, 0, 6, h - WALL.top, INK); box(g, px, 0, 4, h - WALL.top, W[2]); box(g, px, 0, 1, h - WALL.top, W[4]); }
      hoardingArt(g, 0, b - a, W, Rf, Ir);
    });
  }
  // (the tower's, over landing C, out of the tower's inner wall)
  const hc = HOLES[HOLES.length - 1], a = hc[0] - 70, b = hc[0] + 70;
  if (seen(v, X(a) - 30, X(b) + 30, 1, 40)) still(c, 'kp-hoard-tower', X(a), Y(hc[1]), -20, -94, b - a + 40, 110, g => hoardingArt(g, 0, b - a, R(TIMBER), R(ROOF), R(IRON)));
};

// ---------------------------------------------------------------------------------------------------------------
// THE TOWER: its inside (up out of the picture), its landings, the gallery; its outside behind the steps

const TOWER = { a: 6250, b: TOWER_WALL.b }, TOWER_TOP = 1700;
const TCELL = 260;
const paintTowerCell = (g: Ctx, w: number, sx: number, row: number) => {
  const S = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON), Tm = R(TIMBER), Pl = R(PLUM), Bl = R(['#0E1430', '#18224E', '#22327A', '#2E4EA8', '#5A7ACC', '#9AB4EC']);
  ashlar(g, -10, -TCELL, w + 20, TCELL, S, 97 + row * 7, 14, 30);
  // (a string course every cell)
  box(g, -10, -6, w + 20, 5, S[5]); box(g, -10, -1, w + 20, 1, S[1]);
  // (features across it: one per ~130 px, chosen by where it is)
  for (let rx = Math.floor((sx - 140) / 130) * 130 + 65; rx < sx + w + 140; rx += 130) {
    const x = rx - sx, t = hash(rx * 0.13 + row * 7.7), kind = Math.floor(t * 7);
    if (kind === 0 || kind === 1) lancet(g, x, -TCELL + 50, 28, 140, S, kind ? '#C8306E' : '#3A6ACC', rx + row);
    else if (kind === 2) {
      // (a tapestry: a unicorn, or Piper (flattered), on a rod, its fringe)
      const tw = 76, th = 150, tx = x - tw / 2, ty = -TCELL + 40, Bd = row % 2 ? Bl : R(RED);
      box(g, tx - 6, ty - 4, tw + 12, 5, INK); box(g, tx - 5, ty - 3, tw + 10, 3, Gd[3]); box(g, tx - 1, ty, tw + 2, th + 1, INK); box(g, tx, ty, tw, th, Bd[3]); box(g, tx + 4, ty + 4, tw - 8, th - 8, Bd[2]);
      box(g, tx + 6, ty + 6, tw - 12, th - 12, R(['#2A4A2A', '#3A5E34', '#4E7840', '#6A9450', '#8AB066', '#B0CC88'])[2]);
      for (let k = 0; k < 4; k++) box(g, tx + 6, ty + 6 + k * 34, tw - 12, 2, Bd[1]);
      if (hash(rx + row) > 0.5) { polyF(g, [[x - 18, ty + 110], [x + 4, ty + 110], [x + 14, ty + 70], [x + 4, ty + 46], [x - 4, ty + 52], [x - 2, ty + 74], [x - 18, ty + 86]], '#F4F0FA'); polyF(g, [[x + 4, ty + 46], [x + 10, ty + 24], [x + 8, ty + 48]], Gd[4]); }
      else { g.fillStyle = Pk[4]; g.beginPath(); g.ellipse(x, ty + 92, 16, 30, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#F8D8B8'; g.beginPath(); g.arc(x, ty + 52, 9, 0, Math.PI * 2); g.fill(); box(g, x - 9, ty + 40, 18, 6, '#F6D365'); for (const s of [-1, 1]) polyF(g, [[x + s * 8, ty + 74], [x + s * 30, ty + 54], [x + s * 26, ty + 90]], '#C8E8FF'); }
      for (let k = tx; k < tx + tw; k += 4) box(g, k, ty + th, 2, 6, Gd[3 + (k % 2)]);
    } else if (kind === 3) {
      // (a portrait in a gilt frame: a stern royal, a crown, a pink sash)
      const pw = 60, ph = 76, px = x - pw / 2, py = -TCELL + 70;
      box(g, px - 7, py - 7, pw + 14, ph + 14, INK); box(g, px - 6, py - 6, pw + 12, ph + 12, Gd[3]); box(g, px - 6, py - 6, pw + 12, 2, Gd[5]); box(g, px - 3, py - 3, pw + 6, ph + 6, Gd[1]);
      box(g, px, py, pw, ph, R(['#1A1020', '#2A1A34', '#3A2848', '#4E3A5E', '#6A5478', '#8A7498'])[2]);
      const sk = ['#F2C8A0', '#D8A078', '#8A5A3A', '#F8D8B8'][Math.floor(hash(rx + row * 3) * 4)];
      g.fillStyle = Pl[3]; g.beginPath(); g.ellipse(x, py + ph, 26, 30, 0, Math.PI, 0); g.fill(); polyF(g, [[x - 18, py + ph - 26], [x + 14, py + ph], [x + 6, py + ph], [x - 18, py + ph - 18]], Pk[3]);
      g.fillStyle = mix(sk, '#000000', 0.15); g.beginPath(); g.ellipse(x, py + 32, 12, 15, 0, 0, Math.PI * 2); g.fill(); box(g, x - 6, py + 30, 3, 2, INK); box(g, x + 3, py + 30, 3, 2, INK); box(g, x - 4, py + 39, 8, 1, INK);
      polyF(g, [[x - 12, py + 18], [x - 12, py + 8], [x - 6, py + 13], [x, py + 4], [x + 6, py + 13], [x + 12, py + 8], [x + 12, py + 18]], Gd[4]);
      box(g, x - 10, py + ph + 10, 20, 6, INK); box(g, x - 9, py + ph + 11, 18, 4, Gd[2]);
    } else if (kind === 4) {
      banner(g, x, -TCELL + 20, 34, 190, row % 2 ? Bl : Pk, Gd, row % 2 ? 'star' : 'crown');
    } else if (kind === 5) {
      // (a pair of sconces either side of a carved crest)
      for (const s of [-1, 1]) sconce(g, x + s * 34, -110, Ir);
      polyF(g, [[x - 20, -170], [x + 20, -170], [x + 20, -140], [x, -122], [x - 20, -140]], INK); polyF(g, [[x - 18, -168], [x + 18, -168], [x + 18, -141], [x, -125], [x - 18, -141]], S[4]); polyF(g, [[x - 10, -160], [x + 10, -160], [x + 10, -144], [x, -134], [x - 10, -144]], Pk[3]);
    } else {
      // (a cross slit, a beam across with an iron strap, a shield and crossed swords)
      slit(g, x, -TCELL + 50, 30, S);
      box(g, x - 60, -90, 120, 12, INK); box(g, x - 59, -89, 118, 10, Tm[3]); box(g, x - 59, -89, 118, 2, Tm[5]); box(g, x - 10, -90, 6, 12, Ir[3]);
      g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 30, -170); g.lineTo(x + 30, -110); g.moveTo(x + 30, -170); g.lineTo(x - 30, -110); g.stroke(); g.strokeStyle = '#D8DCE4'; g.lineWidth = 2; g.stroke();
      polyF(g, [[x - 16, -160], [x + 16, -160], [x + 16, -134], [x, -118], [x - 16, -134]], INK); polyF(g, [[x - 14, -158], [x + 14, -158], [x + 14, -135], [x, -121], [x - 14, -135]], Bl[3]); box(g, x - 1, -158, 2, 37, Gd[4]); box(g, x - 14, -142, 28, 2, Gd[4]);
    }
  }
};
const towerSconces = (): [number, number][] => {
  const out: [number, number][] = [];
  for (let row = 0; row * TCELL < TOWER_TOP; row++) for (let rx = Math.floor((TOWER.a - 140) / 130) * 130 + 65; rx < TOWER.b + 140; rx += 130) { if (Math.floor(hash(rx * 0.13 + row * 7.7) * 7) === 5 && rx > TOWER.a && rx < TOWER.b) for (const s of [-1, 1]) out.push([rx + s * 34, WALL.top + row * TCELL + 110]); }
  return out;
};
const TOWER_SCONCES = towerSconces();
const drawTowerInside = (c: Ctx, v: View) => {
  if (!seen(v, X(TOWER.a) - 100, X(TOWER.b) + 100, TOWER_D, 60)) return;
  // (the inner wall, cell over cell up out of the picture)
  for (let row = 0; row * TCELL < TOWER_TOP; row++) {
    const foot = WALL.top + row * TCELL;
    if (at(v.eye, 0, Y(foot), TOWER_D)[1] < v.cam.y - 20) break;
    run(c, v, TOWER_D, `tower${row}`, TOWER.a, TOWER.b, foot, TCELL, (g, w, sx) => paintTowerCell(g, w, sx, row), 0);
  }
  for (const [rx, h] of TOWER_SCONCES) { const [sx, sy] = scr(v, rx, h, TOWER_D); if (sx > v.cam.x - 40 && sx < v.cam.x + 840 && sy > v.cam.y - 40 && sy < v.cam.y + 640) flame(c, sx, sy, v.f, 0.12); }
  // (its floor going back)
  floorBack(c, v, TOWER.a, TOWER.b, TOWER_D, 'flag', WALL.top);
  // (iron chandeliers on chains, candles lit)
  for (const [rx, h] of [[6700, 1080], [7240, 1180], [6450, 1300]] as const) {
    const d = 0.95, [px, py] = scr(v, rx, h, d), [, ty] = scr(v, rx, TOWER_TOP + 600, d);
    if (px < v.cam.x - 100 || px > v.cam.x + 900 || py < v.cam.y - 60 || py > v.cam.y + 700) continue;
    box(c, px - 1, ty, 2, py - ty, '#2A2438');
    for (let k = -2; k <= 2; k++) { c.strokeStyle = '#2A2438'; c.lineWidth = 1; c.beginPath(); c.moveTo(px, py - 30); c.lineTo(px + k * 22, py); c.stroke(); }
    box(c, px - 52, py - 2, 104, 6, INK); box(c, px - 51, py - 1, 102, 4, '#3A3650'); box(c, px - 51, py - 1, 102, 1, '#6A6688');
    for (let k = -2; k <= 2; k++) { const cx = px + k * 24; box(c, cx - 2, py - 12, 4, 10, '#F4ECD8'); flame(c, cx, py - 12, v.f + k * 7, 0.1); }
  }
};
/** The tower's shell's left edge (play plane; dim: not stood on) up out of the picture, a door arch at the walk. */
const drawTowerShell = (c: Ctx, v: View) => {
  // (the left, over the door in off the walk; the right, over the way out onto the steps down)
  for (const [ra, rb, base, side] of [[6250, 6292, WALL.top + 200, -1], [TOWER_WALL.a + 6, TOWER_WALL.b - 4, GALLERY.h + 190, 1]] as const) {
    const a = X(ra), b = X(rb);
    if (!onScreenV(v, a - 40, b + 40)) continue;
    for (let k = 0; k * 300 < TOWER_TOP; k++) {
      const foot = base + k * 300;
      if (Y(foot) + 4 < v.cam.y - 20) break;
      if (Y(foot + 300) > v.cam.y + 640) continue;
      still(c, `kp-shell-${ra}-${k}`, a, Y(foot), -2, -304, b - a + 4, 308, g => { const S = R(PALE); ashlar(g, 0, -300, b - a, 300, S, 101 + k + ra, 14, 20); box(g, b - a - 4, -300, 4, 300, S[1]); box(g, 0, -300, 2, 300, S[5]); });
    }
    // (the arch over the doorway)
    still(c, `kp-shell-arch-${ra}`, side < 0 ? a : b, Y(base), -40, -4, 90, 30, g => { const S = R(PALE); for (let k = 0; k < 4; k++) { const x = side < 0 ? -30 + k * 20 : -50 + k * 20; box(g, x, 0, 19, 18, INK); box(g, x + 1, 1, 17, 16, S[4]); box(g, x + 1, 1, 17, 1, S[5]); } });
  }
};
/** The landings, the gallery, the tower's right wall (play plane, lit along their tops; on corbels). */
const drawTowerPlay = (c: Ctx, v: View) => {
  if (!seen(v, X(LAND_C.a) - 100, X(TOWER_WALL.b) + 100, 1, 60)) return;
  const S = R(PALE, false);
  for (const [L, h, key] of [[LAND_B, 20, 'b'], [LAND_C, 20, 'c']] as const) still(c, `kp-land-${key}`, X(L.a), Y(L.h), -4, -4, L.b - L.a + 8, h + 24, g => standSlab(g, 0, L.b - L.a, h, S, L.a, true));
  run(c, v, 1, 'gallery', GALLERY.a, GALLERY.b, GALLERY.h, 42, (g, w, sx) => {
    // (the gallery: a slab on corbels, a balustrade behind (dimmed: not stood on))
    const Sd = R(PALE);
    for (let k = -(sx % 26); k < w; k += 26) { box(g, k + 4, -34, 7, 30, INK); box(g, k + 5, -33, 5, 28, Sd[3]); box(g, k + 5, -33, 2, 28, Sd[5]); ballR3(g, k + 7.5, -22, 3, Sd); }
    box(g, -10, -38, w + 20, 6, INK); box(g, -10, -37, w + 20, 4, Sd[4]); box(g, -10, -37, w + 20, 1, Sd[5]);
    g.translate(0, 0);
    ashlar(g, -10, 0, w + 20, 24, S, 107, 12, 26);
    for (let k = -(sx % 30); k < w; k += 30) { polyF(g, [[k, 24], [k + 16, 24], [k + 12, 40], [k + 4, 40]], INK); polyF(g, [[k + 1, 24], [k + 15, 24], [k + 11, 39], [k + 5, 39]], S[2]); box(g, k + 2, 25, 2, 12, S[4]); }
    lip(g, -10, 0, w + 20);
  }, 44);
  still(c, 'kp-twall', X(TOWER_WALL.a), Y(GALLERY.h), -2, -4, TOWER_WALL.b - TOWER_WALL.a + 4, GALLERY.h - WALL.top + 8, g => { const ww = TOWER_WALL.b - TOWER_WALL.a, hh = GALLERY.h - WALL.top; ashlar(g, 0, 0, ww, hh, S, 113, 14, 20); box(g, ww - 4, 0, 4, hh, S[1]); lip(g, 0, 0, ww); });
};

const STEPS_OUT = { a: TOWER_WALL.b, b: 8420 }, OUT_H = GALLERY.h + 160;
const paintTowerOut = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON), L = R(LEAVES);
  ashlar(g, -10, -OUT_H, w + 20, OUT_H, S, 127, 14, 32);
  merlons(g, -10, -OUT_H, w + 20, S, 18, 12, 16, true);
  for (let rx = Math.floor(sx / 140) * 140 + 70; rx < sx + w + 100; rx += 140) {
    const x = rx - sx, t = Math.floor(rx / 140) % 4;
    lancet(g, x, -OUT_H + 90, 20, 70, S, t % 2 ? '#C8306E' : '#E0AE3A', rx);
    if (t === 0) banner(g, x, -OUT_H + 200, 26, 140, Pk, Gd, 'heart');
    else if (t === 1) { slit(g, x, -360, 26, S); sconce(g, x, -220, Ir); }
    else if (t === 2) {
      // (a gargoyle: a grinning stone dragon out from the wall, an icicle off its mouth)
      polyF(g, [[x - 8, -480], [x + 30, -486], [x + 40, -476], [x + 26, -468], [x - 8, -464]], INK); polyF(g, [[x - 7, -479], [x + 29, -485], [x + 38, -476], [x + 26, -469], [x - 7, -465]], S[4]); box(g, x + 22, -482, 3, 2, INK); box(g, x + 34, -470, 2, 10, R(SNOW)[4]);
      slit(g, x, -300, 26, S);
    } else { lancet(g, x, -300, 16, 46, S, '#3A6ACC', rx + 1); }
  }
  // (ivy up it in places)
  for (let rx = Math.floor(sx / 380) * 380 + 190; rx < sx + w + 80; rx += 380) { const x = rx - sx; for (let y = -10; y > -OUT_H + 120; y -= 6) { const ix = x + Math.sin(y * 0.04 + rx) * 24; box(g, ix - 3, y, 6, 5, L[2]); box(g, ix - 3, y, 3, 2, L[4]); if (Math.floor(-y / 6) % 3 === 0) { box(g, ix + 4, y + 2, 5, 4, L[3]); box(g, ix - 9, y - 1, 5, 4, L[2]); } } }
};
const drawTowerOut = (c: Ctx, v: View) => {
  if (!seen(v, X(STEPS_OUT.a) - 60, X(STEPS_OUT.b) + 60, OUT_D, 60)) return;
  run(c, v, OUT_D, 'tout', STEPS_OUT.a, STEPS_OUT.b, 0, OUT_H + 30, paintTowerOut);
  floorBack(c, v, STEPS_OUT.a, STEPS_OUT.b, OUT_D, 'flag');
};
const drawSteps = (c: Ctx, v: View) => {
  for (const [a, b, h] of LEDGES) if (a >= 7600 && onScreenV(v, X(a) - 20, X(b) + 20)) still(c, `kp-step-${a}`, X(a), Y(h), -4, -4, b - a + 8, 40, g => standSlab(g, 0, b - a, 16, R(PALE, false), a, true));
};

// ---------------------------------------------------------------------------------------------------------------
// THE POSTERN

const POST = { a: 8380, b: RUNWAY - 120 }, POST_H = 280;
const paintPostern = (g: Ctx, w: number, sx: number) => {
  const S = R(PALE), Gd = R(GOLD), Pk = R(PINK), Ir = R(IRON);
  ashlar(g, -10, -POST_H, w + 20, POST_H, S, 131, 14, 30);
  merlons(g, -10, -POST_H, w + 20, S, 18, 12, 16, true);
  for (let rx = Math.floor(sx / 160) * 160 + 80; rx < sx + w + 100; rx += 160) { const x = rx - sx; if (Math.floor(rx / 160) % 2) banner(g, x, -POST_H + 20, 24, 100, Pk, Gd, 'heart'); else { slit(g, x, -220, 22, S); sconce(g, x, -150, Ir); } }
  // (a pipe and a fuse box: it's backstage)
  box(g, -10, -200, w + 20, 6, INK); box(g, -10, -199, w + 20, 4, Ir[3]); box(g, -10, -199, w + 20, 1, Ir[5]);
  for (let rx = Math.floor(sx / 260) * 260 + 130; rx < sx + w; rx += 260) { const x = rx - sx; box(g, x - 14, -190, 28, 34, INK); box(g, x - 13, -189, 26, 32, R(['#3A4A3A', '#4E604E', '#6A7A66', '#8A9884', '#A8B4A2', '#C8D0C2'])[3]); box(g, x - 8, -182, 16, 8, '#F2C84A'); box(g, x - 6, -180, 12, 4, INK); }
};
/** The postern gate: its piers and arch in the play plane (dim: not stood on), the wall over it, its thickness going
 *  back; the runway's daylight through it. */
const GATE = { a: 8880, b: 9000, h: 160, top: 300 };
const drawPosternGate = (c: Ctx, v: View) => {
  if (!seen(v, X(GATE.a) - 60, X(GATE.b) + 60, POST_D, 60)) return;
  const S = R(PALE);
  sideBack(c, v.eye, X(GATE.a), -1, Y(GATE.top), GY, 1, POST_D, S, 3);
  sideBack(c, v.eye, X(GATE.b), 1, Y(GATE.top), GY, 1, POST_D, S, 3);
  still(c, 'kp-postern', X(GATE.a), GY, -4, -GATE.top - 30, GATE.b - GATE.a + 8, GATE.top + 34, g => {
    const w = GATE.b - GATE.a, Ir = R(IRON), Tm = R(TIMBER);
    g.save(); g.beginPath(); g.rect(0, -GATE.top - 30, w, GATE.top + 30); g.moveTo(22, 0); g.lineTo(22, -GATE.h + 30); g.arc(w / 2, -GATE.h + 30, w / 2 - 22, Math.PI, 0, false); g.lineTo(w - 22, 0); g.closePath(); g.clip('evenodd');
    ashlar(g, 0, -GATE.top, w, GATE.top, S, 137, 14, 24);
    g.restore();
    merlons(g, 0, -GATE.top, w, S, 14, 8, 14, true);
    // (the arch's voussoirs, the gate's oak leaves swung back, iron studs)
    for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI, r = w / 2 - 18, ox = w / 2 + Math.cos(a) * r, oy = -GATE.h + 30 + Math.sin(a) * r; box(g, ox - 5, oy - 5, 10, 10, INK); box(g, ox - 4, oy - 4, 8, 8, k % 2 ? S[4] : S[3]); }
    for (const [x0g, s] of [[22, 1], [w - 22, -1]] as const) { box(g, x0g + (s > 0 ? 0 : -10), -GATE.h + 26, 10, GATE.h - 26, INK); box(g, x0g + (s > 0 ? 1 : -9), -GATE.h + 27, 8, GATE.h - 28, Tm[3]); box(g, x0g + (s > 0 ? 1 : -9), -GATE.h + 27, 2, GATE.h - 28, Tm[5]); for (let y = -GATE.h + 40; y < 0; y += 24) box(g, x0g + (s > 0 ? 3 : -7), y, 4, 3, Ir[4]); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The near ground: flagstones coming toward him (bent), lit along the edge he walks on

const nearFlags = (c: Ctx) => {
  const F = R(FLAGS, false);
  return tilePattern(c, `fa-kp-near-${timeOfDay().key}`, 96, 64, g => {
    box(g, 0, 0, 96, 64, F[3]);
    for (let r = 0; r < 4; r++) {
      const y = r * 16, off = (r % 2) * 24;
      box(g, 0, y, 96, 1, F[1]); box(g, 0, y + 1, 96, 1, F[4]);
      for (let x = off; x < 96 + 48; x += 48) { box(g, (x % 96), y, 1, 16, F[1]); box(g, (x % 96) + 1, y + 1, 1, 15, F[4]); const t = hash(x * 3.1 + r); if (t > 0.6) box(g, (x % 96) + 6, y + 4, 20, 9, F[t > 0.85 ? 4 : 2]); }
    }
    for (let k = 0; k < 30; k++) box(g, Math.floor(hash(k * 2.3) * 95), Math.floor(hash(k * 5.9) * 63), 1, 1, F[k % 2 ? 2 : 5]);
  });
};
const drawNearGround = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, Rr = state.camera.x + CANVAS_WIDTH + 40, F = R(FLAGS, false), Sn = R(SNOW, false);
  const runs: [number, number][] = [[X(-300), X(MOAT.a)], [X(MOAT.b), X(RUNWAY)]];
  for (const [a, b] of runs) {
    const s = Math.max(a, L), e = Math.min(b, Rr);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, F[2]);
    c.fillStyle = nearFlags(c); c.fillRect(s, GY + 8, e - s, 600);
    // (snow along the near edge, slush between)
    box(c, s, GY + 112, e - s, 30, Sn[3]); checker(c, s, GY + 108, e - s, 4, Sn[3], 0, 1); box(c, s, GY + 112, e - s, 1, Sn[5]);
    bendFloor(c, v.eye, GY, GY, GY + 140, a, b);
    // (the edge he walks along: a kerb of dressed stone, lit)
    box(c, s, GY, e - s, 9, F[4]); box(c, s, GY + 7, e - s, 2, F[1]); checker(c, s, GY + 5, e - s, 2, F[3], 0, 1);
    for (let x = Math.floor(s / 38) * 38; x < e; x += 38) box(c, x, GY + 1, 1, 7, F[1]);
    box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Piper's PA horns: brass on a fluted iron pole, its bracket; sound rings out while she talks

const paHorn = (c: Ctx, x: number, foot: number, h: number, talking: boolean, f: number) => {
  const hy = Y(h), fy = Y(foot);
  still(c, `kp-pa-${Math.round(h - foot)}`, x, fy, -14, -(fy - hy) - 30, 76, fy - hy + 34, g => {
    const Ir = R(IRON, false), Gd = R(GOLD, false), Pk = R(PINK, false), up = fy - hy;
    box(g, -8, -10, 16, 10, INK); box(g, -7, -9, 14, 9, Ir[3]); box(g, -7, -9, 14, 2, Ir[5]);
    box(g, -4, -up - 4, 8, up - 6, INK); box(g, -3, -up - 4, 6, up - 6, Ir[3]); box(g, -3, -up - 4, 2, up - 6, Ir[5]); box(g, 1, -up - 4, 2, up - 6, Ir[1]);
    for (let y = -up + 20; y < -16; y += 40) { box(g, -5, y, 10, 3, INK); box(g, -4, y + 1, 8, 1, Gd[3]); }
    box(g, 0, -up - 3, 22, 5, INK); box(g, 1, -up - 2, 20, 3, Ir[4]);
    polyF(g, [[18, -up - 6], [48, -up - 22], [48, -up + 18], [18, -up + 6]], INK);
    polyF(g, [[19, -up - 4], [46, -up - 19], [46, -up + 15], [19, -up + 4]], Gd[3]);
    polyF(g, [[19, -up - 4], [46, -up - 19], [46, -up - 12], [19, -up - 1]], Gd[5]);
    polyF(g, [[19, -up + 2], [46, -up + 8], [46, -up + 15], [19, -up + 4]], Gd[1]);
    box(g, 44, -up - 19, 3, 34, Gd[2]); box(g, 45, -up - 18, 1, 32, Gd[4]);
    ballR3(g, 8, -up - 10, 3, Pk);
    g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-3, -up + 4); g.quadraticCurveTo(-10, -up / 2, -4, -12); g.stroke();
  });
  if (talking) for (let k = 0; k < 3; k++) { const r = 10 + ((f * 1.5 + k * 14) % 42); c.strokeStyle = `rgba(244, 114, 182, ${Math.max(0, 1 - r / 52)})`; c.lineWidth = 2; c.beginPath(); c.arc(x + 48, hy - 2, r, -0.7, 0.7); c.stroke(); }
};

// ---------------------------------------------------------------------------------------------------------------

/** Behind everything that moves. `piperX`: the horn (x) she's talking out of, if she is; `runwayTalk`: she's talking
 *  out of the broom port's; `done`: the brooms have flown (a revisit). */
export const drawKeepBack = (c: Ctx, state: GameState, piperX: number | null, runwayTalk: boolean, done: boolean) => {
  const f = state.frame, v = viewOf(state);
  // (deepest first: the moat's dark and its faces, the courtyard's far wall and its floor, the outside through the
  //  breach, the broom port's stands)
  drawMoat(c, v);
  drawCourtyard(c, v);
  drawRamparts(c, v);
  drawPort(c, state, v, done, 'back');
  // (the barbican's yard wall and its floor; the postern yard's; the tower's inside; the tower's outside)
  if (seen(v, X(-400), X(800), BAILEY_D, 60)) {
    run(c, v, BAILEY_D, 'bailey', -400, 790, 0, BAILEY_H + 34, paintBailey);
    for (const [rx, kind] of BAILEY_FEAT) if (kind === 'sconce') { const [sx, sy] = scr(v, rx, 130, BAILEY_D); if (sx > v.cam.x - 40 && sx < v.cam.x + 840) flame(c, sx, sy, f, 0.12); }
    floorBack(c, v, -400, MOAT.a, BAILEY_D, 'flag');
  }
  if (seen(v, X(POST.a), X(POST.b), POST_D, 60)) {
    run(c, v, POST_D, 'post', POST.a, POST.b, 0, POST_H + 34, paintPostern);
    for (let rx = Math.floor(POST.a / 160) * 160 + 80; rx < POST.b; rx += 160) if (Math.floor(rx / 160) % 2 === 0) { const [sx, sy] = scr(v, rx, 150, POST_D); if (sx > v.cam.x - 40 && sx < v.cam.x + 840) flame(c, sx, sy, f, 0.12); }
    floorBack(c, v, POST.a, POST.b + 120, POST_D, 'flag');
  }
  drawTowerInside(c, v);
  drawWalk(c, v);
  drawTowerOut(c, v);
  drawGatehouse(c, v, state);
  drawProps(c, v);
  drawBarbican(c, v);
  drawPort(c, state, v, done, 'mid');
  // (the play plane: the ground, the gatehouse's block, the curtain wall, the hoardings, the tower's shell, landings and
  //  gallery, the steps, the postern gate)
  drawNearGround(c, state, v);
  drawPort(c, state, v, done, 'ground');
  drawGateFront(c, v);
  drawCurtain(c, v);
  drawHoardings(c, v);
  drawTowerShell(c, v);
  drawTowerPlay(c, v);
  drawSteps(c, v);
  drawPosternGate(c, v);
  drawPort(c, state, v, done, 'near');
  for (const [x, h] of PA_AT) if (onScreen(state, X(x) - 60, X(x) + 80)) paHorn(c, X(x), x >= 6000 && x < 7600 ? WALL.top : 0, h, piperX === X(x), f);
  if (onScreen(state, X(SCENE.horn.x) - 60, X(SCENE.horn.x) + 80)) paHorn(c, X(SCENE.horn.x), 0, SCENE.horn.h, runwayTalk, f);
  // (the signs, on their posts)
  const signs: [number, number, string[], object?][] = [
    // (well clear of the moat's sign: the user's, it was half behind it)
    [250, 0, ["THE GREAT PIXIE'S CASTLE", 'STAFF AND SUITORS ONLY']],
    [640, 0, ['THE MOAT', 'DRAINED FOR CLEANING'], { warn: true }],
    [1560, 0, ['YE OLDE GIFT SHOPPE', 'TIARAS $40']],
    [(BOUTIQUE.a + BOUTIQUE.b) / 2 - 30, 0, ['PRINCESS MAKEOVER', 'BOUTIQUE'], { tall: 270, board: '#9A2A6A' }],
    [3960, 0, ['THE ROYAL ROSE GARDEN', 'DO NOT PICK THE ROSES']],
    [6200, WALL.top, ['THE TOWER STAIRS', 'MIND THE MOVING STEPS']],
    [8480, 0, ['THE POSTERN GATE', 'TO THE BROOM PORT >']],
    [9230, 0, done ? ['THE BROOM PORT', 'NO FLIGHTS TODAY'] : ['THE BROOM PORT', 'FINAL TRIAL TODAY'], { board: '#6E0E1C' }],
    [10720, 0, ['FASTPASS', 'SUITORS ONLY'], { board: '#3B0764' }],
  ];
  for (const [x, h, words, o] of signs) if (onScreen(state, X(x) - 170, X(x) + 170)) storySign(c, X(x), Y(h), words, o as { warn?: boolean });
};

/** The lamps after dark: sconces, the gift shop's windows, the arcade's lanterns, the boutique, the lamp posts, the
 *  tower's chandeliers, the broom port's landing lights. */
export const keepLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out: Light[] = [];
  const add = (x: number, y: number, r: number, a: number, color = '#FDBA74') => { if (x > state.camera.x - 200 && x < state.camera.x + 1000 && y > state.camera.y - 200 && y < state.camera.y + 800) out.push({ x, y, r, a, color }); };
  for (const [rx, kind] of BAILEY_FEAT) if (kind === 'sconce') { const [x, y] = scr(v, rx, 136, BAILEY_D); add(x, y, 100, 0.4); }
  for (const [rx, kind] of SHOP_FEAT) if (kind === 'sconce') { const [x, y] = scr(v, rx, 118, PASS_D); add(x, y, 110, 0.45); }
  for (let rx = GATEHOUSE.a + 300; rx < GATEHOUSE.b - 60; rx += 240) add(X(rx), Y(90), 110, 0.35, '#FFD08A');
  for (const rx of YARD_SCONCES) { const [x, y] = scr(v, rx, 182, YARD_D); add(x, y, 90, 0.35); }
  for (const rx of CURTAIN_SCONCES) add(X(rx), Y(156), 100, 0.4);
  for (const [rx, h] of TOWER_SCONCES) { const [x, y] = scr(v, rx, h + 6, TOWER_D); add(x, y, 90, 0.35); }
  for (const [rx, h] of [[6700, 1080], [7240, 1180], [6450, 1300]]) { const [x, y] = scr(v, rx, h + 12, 0.95); add(x, y, 160, 0.4, '#FFD08A'); }
  for (const [rx, kind] of PROPS) if (kind === 'lamp') { const [x, y] = scr(v, rx, 138, PROP_D); add(x, y, 120, 0.5, '#FFD88A'); }
  add(X((BOUTIQUE.a + BOUTIQUE.b) / 2), Y(90), 150, 0.4, '#F9A8D4');
  { const [x, y] = scr(v, 8540, 138, PROP_D); add(x, y, 80, 0.35, '#FFE9A8'); }
  for (const [rx, h] of PORT_SCONCES) add(X(rx), Y(h), 100, 0.35, '#FDE68A');
  out.push(...portLamps(state, v));
  return out;
};
