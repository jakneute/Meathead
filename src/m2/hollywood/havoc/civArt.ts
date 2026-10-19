// The havoc's civilians, drawn (civilians.ts says what's happened to them): each at its depth, its own seeded look all
// through it. Running for it (arms up under a front that's going, or by a bunker as the hill rumbles); then, each the
// way it got them: legs out from under a front (a shoe twitching, the stain seeping, the cup knocked loose); flat on
// their back with a chunk of cornice on their head, stars going round; tumbling off down the sidewalk and face down, butt
// up, a shoe gone; flailing into the lava, charring, sinking on fire, a hand up last, smoke; face down in the flood,
// bobbing, carried along (lying soggy once it's down); a mound of snow with their legs up out of it, kicking, then not.
// What's coming for them: a cornice chunk's shadow on the sidewalk (then it), plywood on the wind.

import type { GameState } from '../../../m1/game/core/state';
import { drawPerson, lookOf, type PersonOpts } from '../../adventure/temple/people';
import { GY, FALLS, X } from './layout';
import type { Hv } from './state';
import { spent } from './hazards';
import { type Ctx, type View, INK, box, poly, mix, atDepth, seen, signText, plain, PLY, CONCRETE, SNOW, flame, smokeUp, GUEST_D } from './paint';
import { CIVS, civOf, civAt, civHere, type Civ, type Fate } from './civilians';

const S = 0.92;
const look = (cv: Civ) => lookOf(cv.seed, cv.woman);
const person = (c: Ctx, cv: Civ, f: number, o: Partial<PersonOpts> = {}) =>
  drawPerson(c, { seed: cv.seed, outfit: 'guest', f, pose: 'walk', mood: 'scared', woman: cv.woman, shorts: cv.shorts, ...o });

/** Lying (feet at x, on the ground at y): on the back (`back`) or face down, the head toward `dir`. */
const lying = (c: Ctx, cv: Civ, f: number, x: number, y: number, dir: 1 | -1, back: boolean, o: Partial<PersonOpts> = {}) => {
  c.save(); c.translate(x, y - 10); c.scale(back ? -dir : dir, 1); c.rotate(back ? -Math.PI / 2 : Math.PI / 2); c.scale(S, S);
  // (on the back: the head's to the left before the flip, so the flip's the other way round)
  person(c, cv, 0, { pose: 'stand', ...o });
  c.restore();
  void f;
};

/** A shoe lying on its side (knocked off). */
const shoe = (c: Ctx, x: number, y: number) => { box(c, x - 5, y - 5, 11, 6, INK); box(c, x - 4, y - 4, 9, 4, '#27272A'); box(c, x - 4, y - 4, 9, 1, '#52525B'); box(c, x + 3, y - 2, 2, 2, '#E7E5E4'); };

// ---------------------------------------------------------------------------------------------------------------
// Each way it got them

/** Out from under a front: their legs (toes up, one twitching a while), the stain seeping out, the cup knocked loose. */
const crushed = (c: Ctx, cv: Civ, fa: Fate) => {
  const L = look(cv), s = fa.side, ex = fa.ex, y = GY, k = Math.min(1, fa.t / 60);
  // (the stain, seeping out from under the edge, darker at its middle)
  const sw = 34 * k;
  box(c, s < 0 ? ex - sw : ex, y - 2, sw, 3, '#4A0A0C'); box(c, s < 0 ? ex - sw * 0.7 : ex, y - 2, sw * 0.7, 2, '#7F1418'); box(c, s < 0 ? ex - sw * 0.3 : ex, y - 2, sw * 0.3, 1, '#A82028');
  for (let j = 0; j < 2; j++) {
    const ly = y - 5 - j * 5, len = 22 + j * 4, x0 = s < 0 ? ex - len : ex;
    const pants = j ? L.pants : mix(L.pants, INK, 0.2);
    box(c, x0 - 1, ly - 1, len + 1, 7, INK);
    box(c, x0, ly, len, 5, pants); box(c, x0, ly, len, 1, mix(pants, '#FFFFFF', 0.25));
    if (cv.shorts) { const sk = s < 0 ? x0 : x0 + len - 12; box(c, sk, ly, 12, 5, L.skin); box(c, sk, ly, 12, 1, mix(L.skin, '#FFFFFF', 0.3)); }
    // (the shoe, toes up; the near one twitching a while)
    const tip = s < 0 ? x0 - 6 : x0 + len, tw = j === 0 && fa.t < 150 && (fa.t >> 2) % 6 === 0 ? 2 : 0;
    box(c, tip - 1, ly - 7 - tw, 8, 11, INK); box(c, tip, ly - 6 - tw, 6, 9, '#27272A'); box(c, tip, ly - 6 - tw, 6, 2, '#52525B'); box(c, s < 0 ? tip : tip + 4, ly - 6 - tw, 2, 9, '#E7E5E4');
  }
  // (the souvenir cup, knocked loose, its lid off, the soda out)
  const cx = ex + s * (46 + (cv.seed % 3) * 6);
  box(c, cx - 7, y - 8, 14, 8, INK); box(c, cx - 6, y - 7, 12, 6, '#DC2626'); box(c, cx - 6, y - 7, 12, 2, '#FCA5A5'); box(c, cx - 2, y - 6, 4, 4, '#FACC15');
  box(c, cx + s * 8 - 6, y - 2, 12, 2, 'rgba(120, 53, 15, 0.55)');
};

/** A chunk of cornice (stepped faces, a bit of the molding on it). */
const cornice = (c: Ctx, x: number, y: number, rot = 0) => {
  const C = CONCRETE;
  c.save(); c.translate(x, y); c.rotate(rot);
  poly(c, [[-13, 8], [-12, -6], [-4, -10], [12, -7], [13, 8]], INK);
  poly(c, [[-12, 7], [-11, -5], [-4, -9], [11, -6], [12, 7]], C[4]);
  poly(c, [[-4, -9], [11, -6], [12, 7], [3, 7]], C[3]);
  box(c, -11, -3, 22, 3, C[5]); box(c, -11, 0, 22, 2, C[2]); box(c, -11, 5, 23, 2, C[1]);
  box(c, 4, -4, 2, 2, C[1]);
  c.restore();
};

/** Flat on their back, the chunk on their head, stars going round a while, a little blood. */
const conked = (c: Ctx, cv: Civ, fa: Fate, f: number) => {
  const hx = fa.x + fa.dir * 61, y = GY;
  box(c, hx - 9, y - 2, 18, 2, '#7F1418');
  lying(c, cv, f, fa.x, y, fa.dir, true, { mood: 'shocked' });
  cornice(c, hx, y - 16, 0.18 * fa.dir);
  if (fa.t < 300) for (let k = 0; k < 3; k++) {
    const a = f * 0.12 + (k * Math.PI * 2) / 3, sx = hx + Math.cos(a) * 14, sy = y - 34 + Math.sin(a) * 4;
    box(c, sx - 1, sy - 3, 2, 6, '#FDE047'); box(c, sx - 3, sy - 1, 6, 2, '#FDE047'); box(c, sx, sy, 1, 1, '#FFFFFF');
  }
};

/** Tumbling off down the sidewalk; then face down, butt up, a shoe gone. */
const flung = (c: Ctx, cv: Civ, fa: Fate, f: number) => {
  if (!fa.landed) {
    c.save(); c.translate(fa.x, fa.y - 34); c.rotate(fa.rot); c.translate(0, 34); c.scale(S * fa.dir, S);
    person(c, cv, f, { pose: 'fly', mood: 'shocked' });
    c.restore();
    return;
  }
  box(c, fa.x - 40, GY - 2, 80, 2, 'rgba(10, 6, 6, 0.25)');
  lying(c, cv, f, fa.x, GY, fa.dir, false);
  shoe(c, fa.x - fa.dir * 22, GY);
};

/** Shoved into the lava: flailing as they go in; then charring, sinking on fire, a hand up last, smoke. */
const burned = (c: Ctx, cv: Civ, fa: Fate, f: number) => {
  const L = look(cv);
  if (fa.phase === 0) {
    c.save(); c.translate(fa.x, GY); c.rotate(Math.sin(f * 0.5) * 0.12 - 0.1); c.scale(S, S);
    person(c, cv, f, { pose: 'cheer', mood: 'shocked' });
    c.restore();
    return;
  }
  const k = Math.min(1, fa.t / 70), char = (col: string) => mix(col, '#1A1210', k * 0.85);
  const surf = fa.surf;
  if (fa.sink < 92) {
    c.save(); c.beginPath(); c.rect(fa.x - 90, surf - 260, 180, 260); c.clip();
    c.translate(fa.x, surf + fa.sink + Math.sin(f * 0.6) * 2); c.scale(S, S);
    person(c, cv, f, { pose: 'cheer', mood: 'shocked', look: { skin: char(L.skin), shirt: char(L.shirt), pants: char(L.pants), hair: char(L.hair) } });
    c.restore();
    flame(c, fa.x, surf, 34, 50 + (1 - fa.sink / 96) * 30, f, cv.seed);
  } else if (fa.t < 330) {
    // (the hand, last, black)
    const up = 14 - Math.max(0, fa.t - 300) * 0.5;
    if (up > 0) { box(c, fa.x - 3, surf - up - 1, 7, up + 1, INK); box(c, fa.x - 2, surf - up, 5, up, '#2A1E1A'); box(c, fa.x - 4, surf - up - 4, 9, 5, '#1A1210'); }
    flame(c, fa.x, surf, 16, 22, f, cv.seed + 3);
  }
  // (the splash it made going in, then smoke up off where they went)
  if (fa.t < 24) for (let j = -2; j <= 2; j++) box(c, fa.x + j * 9 - 2, surf - 6 - (24 - fa.t) * 0.5 + Math.abs(j) * 3, 4, 4, j % 2 ? '#FDC848' : '#F8861C');
  if (fa.t < 600) smokeUp(c, fa.x, surf - 4, f, cv.seed, 0.5, 0.4 * (1 - fa.t / 600), 4);
};

/** Face down in the flood, bobbing, carried along; drained, lying soggy in a puddle. */
const swept = (c: Ctx, cv: Civ, fa: Fate, f: number) => {
  const wet = fa.y < GY - 1, bob = wet ? Math.sin(f * 0.09 + cv.seed) * 2 : 0;
  if (!wet) box(c, fa.x - 50, GY - 2, 100, 3, 'rgba(60, 84, 110, 0.5)');
  lying(c, cv, f, fa.x, fa.y + (wet ? 8 : 0) + bob, fa.dir, false, { mood: 'shocked' });
  if (wet) {
    box(c, fa.x - 72, fa.y + 1 + bob, 144, 12, 'rgba(32, 58, 90, 0.62)');
    for (let x = -70; x < 70; x += 8) box(c, fa.x + x, fa.y + bob + Math.sin(x * 0.2 + f * 0.15), 6, 2, 'rgba(226, 232, 240, 0.75)');
  }
};

/** A mound of snow, their legs up out of it in a V (kicking a while, then not), a hand out the side. */
const buried = (c: Ctx, cv: Civ, fa: Fate, f: number) => {
  const L = look(cv), x = fa.x, y = fa.y;
  // (the mound, stepped, blue in its shade, a dither along its foot)
  const rows: [number, number, string][] = [[52, 8, SNOW[2]], [46, 14, SNOW[3]], [36, 20, SNOW[4]], [22, 25, SNOW[5]]];
  box(c, x - 28, y - 9, 56, 10, INK);
  for (const [w, h, col] of rows) box(c, x - w / 2, y - h, w, h - (h > 8 ? 6 : 0), col);
  for (let dx = -26; dx < 26; dx += 4) box(c, x + dx, y - 2, 2, 2, SNOW[1]);
  box(c, x - 8, y - 24, 6, 2, '#FFFFFF');
  for (let j = 0; j < 2; j++) {
    const kick = fa.t < 160 ? Math.sin(f * 0.5 + j * 2.4) * 0.3 * (1 - fa.t / 160) : 0, a = (j ? 0.32 : -0.32) + kick;
    c.save(); c.translate(x + (j ? 3 : -3), y - 22); c.rotate(a);
    box(c, -4, -27, 8, 28, INK); box(c, -3, -26, 6, 27, j ? L.pants : mix(L.pants, INK, 0.2));
    if (cv.shorts) box(c, -3, -26, 6, 13, L.skin);
    box(c, -5, -34, 11, 8, INK); box(c, -4, -33, 9, 6, '#27272A'); box(c, -4, -33, 9, 1, '#52525B');
    c.restore();
  }
  // (a hand out the side)
  box(c, x + 20, y - 9, 8, 4, INK); box(c, x + 21, y - 8, 6, 2, L.skin); box(c, x + 26, y - 11, 3, 4, L.skin);
};

// ---------------------------------------------------------------------------------------------------------------

const underFall = (hv: Hv, x: number) => hv.falls.some(fl => {
  if (fl.phase !== 'creak' && fl.phase !== 'falling') return false;
  const [frx, w, , how] = FALLS[fl.i];
  return how !== 'bridge' && x > X(frx) - 10 && x < X(frx + w) + 10;
});

/** The civilians at the back of the sidewalk ('street', before what stands nearer) or out on the hill road ('hill'). */
export const drawCivilians = (c: Ctx, v: View, state: GameState, hv: Hv, part: 'street' | 'hill') => {
  if (spent(state)) return;
  const cs = civOf(hv), f = state.frame;
  const d = part === 'street' ? GUEST_D : CIVS.find(q => q.hill)!.d;
  atDepth(c, v.eye, d, () => {
    for (const cv of CIVS) {
      if (cv.hill !== (part === 'hill') || !civHere(hv, cs, cv)) continue;
      const fa = cs.fate.get(cv.id);
      const x = fa ? (fa.how === 'crushed' ? fa.ex : fa.x) : civAt(cv, f).x;
      if (!seen(v, x - 90, x + 90, cv.d)) continue;
      if (!fa) {
        const p = civAt(cv, f);
        const panic = cv.hill ? hv.avalanches[cv.k]?.phase === 'tell' : underFall(hv, p.x);
        c.save(); c.translate(p.x, p.y); c.scale(p.dir * S, S);
        person(c, cv, f, panic ? { pose: 'cheer', mood: 'shocked' } : {});
        c.restore();
        continue;
      }
      if (fa.how === 'crushed') crushed(c, cv, fa);
      else if (fa.how === 'conked') conked(c, cv, fa, f);
      else if (fa.how === 'flung') flung(c, cv, fa, f);
      else if (fa.how === 'burned') burned(c, cv, fa, f);
      else if (fa.how === 'swept') swept(c, cv, fa, f);
      else if (fa.how === 'buried') buried(c, cv, fa, f);
    }
    if (part !== 'street') return;
    // What's coming for them: the cornice's shadow, then it; plywood on the wind
    for (const dr of cs.drops) {
      if (!seen(v, dr.x - 40, dr.x + 40, GUEST_D)) continue;
      const hit = cs.fate.get(dr.id)?.how === 'conked' && dr.landed > 0;
      if (dr.landed > 0) { if (!hit) cornice(c, dr.x, GY - 8, 0.3); continue; }
      const k = dr.warn > 0 ? 1 - dr.warn / 70 : 1;
      for (const [s, a] of [[1, 0.1 + k * 0.14], [0.55, 0.16 + k * 0.22]] as const) box(c, dr.x - (14 + k * 8) * s, GY - 3 * s - 1, (28 + k * 16) * s, Math.max(2, 5 * s), `rgba(10, 6, 6, ${a.toFixed(2)})`);
      if (dr.warn > 0) { for (let yy = 0; yy < 4; yy++) box(c, dr.x - 1 + ((yy * 3 + f) % 4), GY - 300 + ((f * 4 + yy * 40) % 160), 2, 3, '#C8C0B4'); continue; }
      cornice(c, dr.x, GY - dr.off - 10, dr.off * 0.02);
    }
    for (const s of cs.sheets) {
      if (!seen(v, s.x - 40, s.x + 40, GUEST_D)) continue;
      c.save(); c.translate(s.x, s.y); c.rotate(s.rot);
      box(c, -21, -13, 42, 26, INK); box(c, -20, -12, 40, 24, PLY[3]); box(c, -20, -12, 40, 3, PLY[5]); box(c, -20, 9, 40, 3, PLY[1]);
      for (const gx of [-12, 2, 14]) box(c, gx, -10, 1, 20, PLY[2]);
      signText(c, 'PROP', 0, -3, plain(1, 1, '#3A2410'));
      c.restore();
    }
  });
};
