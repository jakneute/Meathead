// The dino park as the fake zoo it is: its guests (guests.ts) drawn where they stand, dimmed back (never anything to
// stand on), and the dressing that says THEME PARK: the raptor pen's viewing-gallery window, the T. rex feeding show's
// bleachers behind the paddock's fence, pipe rails in front of the crowds, PA speaker poles, the park's monument sign,
// the shows board, ANIMATRONIC: DO NOT FEED on the meadow rail, a please-don't-tap sign by the exit. And on a revisit,
// with them gone, what they dropped running (a camcorder still recording, an ice cream upside down, the tour flag).
//
// Two passes (from world.ts): `far` (the meadow's tour group behind its rail, the bleachers: before what stands along
// the back), `near` (the gallery, the path's and the plaza's crowds, the signs: after it, before the ground).

import type { GameState } from '../../../../m1/game/core/state';
import { GY } from '../../geometry';
import { drawDimmed } from '../../queue/crowd';
import { drawPerson, lookOf, type Pose } from '../../temple/people';
import { blob, rect, dot, INK as KINK } from '../../../cast/kit';
import { type Ctx, type Eye, INK, box, sign, slab, pole, stamp, checker, P, eyeOf, viewOf } from './kit';
import { D } from '../layout';
import { signAt, enamel, print, dino } from '../../letters';
import { GUESTS, GALLERY, BLEACHERS, guestsFled, guestMood, type DinoGuest } from '../guests';

const atD = (c: Ctx, eye: Eye, d: number, paint: () => void) => {
  c.save(); c.translate(eye.x, eye.y); c.scale(d, d); c.translate(-eye.x, -eye.y); paint(); c.restore();
};
const seen = (state: GameState, eye: Eye, a: number, b: number, d: number, pad = 80) => {
  const v = viewOf(state), [sa] = P(eye, a, GY, d), [sb] = P(eye, b, GY, d);
  return sb > v.x - pad && sa < v.x + v.w + pad;
};

// ---------------------------------------------------------------------------------------------------------------
// One of them

const LIGHT = new Set(['#F6DCC8', '#F0C8A2', '#F4C2B0']);
const PACKS = ['#22D3EE', '#EC4899', '#A3E635', '#F97316', '#1F2937'];

const drawGuest = (c: Ctx, state: GameState, eye: Eye, g: DinoGuest) => {
  const f = state.frame || 0, p = state.player, cx = p.pos.x + p.width / 2;
  const mood = guestMood(state), s = g.seed;
  const L = lookOf(s);
  const w = L.heavy ? 28 : L.woman ? 20 : 23;
  // (who they are: a sunburn on the pale ones now and then, shorts, a fanny pack, a bucket hat, shades)
  const burnt = s % 5 === 1 && LIGHT.has(L.skin);
  const look = burnt ? { skin: '#F2A584' } : undefined;
  const face: 1 | -1 = cx > g.x + 10 ? 1 : cx < g.x - 10 ? -1 : (s % 2 ? 1 : -1);
  const pose: Pose = g.prop === 'camera' || g.prop === 'camcorder' ? (mood.doubt && s % 3 === 0 ? 'point' : 'photo')
    : g.prop === 'flag' || g.prop === 'shoulders' ? 'hold'
    : g.prop === 'icecream' || g.prop === 'balloon' ? 'stand'
    : mood.cheer ? 'cheer' : (mood.doubt ? s % 3 === 0 : s % 7 === 0) ? 'point' : 'stand';
  const fm = mood.doubt ? (s % 2 ? 'shocked' : 'scared') : mood.cheer || s % 3 ? 'happy' : 'bored';
  c.save();
  c.translate(eye.x, eye.y); c.scale(g.d, g.d); c.translate(-eye.x, -eye.y);
  c.translate(Math.round(g.x), Math.round(g.y));
  const k = g.prop === 'kid' ? 0.62 : 1;
  c.scale(face * k, k);
  // (a kid up on his shoulders: behind his head, his hands on its legs)
  if (g.prop === 'shoulders') { c.save(); c.translate(1, -58); c.scale(0.55, 0.55); drawPerson(c, { seed: s + 11, outfit: 'guest', f: f + s, pose: mood.cheer ? 'cheer' : 'stand', mood: mood.doubt ? 'scared' : 'happy' }); c.restore(); }
  drawPerson(c, { seed: s, outfit: 'guest', f: f + s, pose, woman: L.woman, talking: !!g.said, mood: g.said ? 'happy' : fm, look, shorts: s % 2 === 0 });
  if (s % 3 === 0 && g.prop !== 'kid') { const col = PACKS[s % PACKS.length]; dot(c, -w / 2 + 1, -33, w - 2, 3, KINK); rect(c, w / 2 - 9, -36, 10, 7, col, 1.5); dot(c, w / 2 - 8, -33, 8, 1, KINK); }
  if (s % 4 === 2) { blob(c, () => c.ellipse(1.5, -76, 12, 2.6, 0, 0, Math.PI * 2), s % 8 === 2 ? '#E7E5E4' : '#65A30D', -10, 13, 1); blob(c, () => c.ellipse(1.5, -79, 8, 4.5, 0, Math.PI, 0), s % 8 === 2 ? '#E7E5E4' : '#65A30D', -6, 9, 1); }
  if (s % 7 === 3 && !mood.doubt) { dot(c, -2, -69, 10, 3, '#111827'); dot(c, -2, -69, 3, 1, '#4B5563'); }
  prop(c, g, w, f, mood.doubt);
  c.restore();
};

/** What they've got (facing right, at the person's feet). */
const prop = (c: Ctx, g: DinoGuest, w: number, f: number, doubt: boolean) => {
  const s = g.seed;
  switch (g.prop) {
    case 'camera': {
      const x = w / 2 + 3, y = -68;
      rect(c, x, y, 10, 7, '#3F3F46', 1); dot(c, x + 2, y - 2, 3, 2, '#3F3F46');
      blob(c, () => c.arc(x + 11, y + 3.5, 2.6, 0, Math.PI * 2), '#93C5FD', x + 8, x + 14, 1);
      // (the flash going off now and then: a show's worth photographing)
      if (!doubt && (f + s) % 170 < 3) { box(c, x + 13, y - 3, 2, 14, '#FFFFFF'); box(c, x + 7, y + 3, 14, 2, '#FFFFFF'); box(c, x + 11, y + 1, 6, 6, '#FEF9C3'); }
      break;
    }
    case 'camcorder': {
      const x = w / 2 + 1, y = -70;
      rect(c, x, y, 16, 9, '#52525B', 1.5); rect(c, x + 14, y + 1, 6, 7, '#27272A', 1);
      dot(c, x + 2, y - 3, 8, 3, '#27272A');
      if ((f + s) % 50 < 30) dot(c, x + 3, y + 2, 2, 2, '#EF4444');
      break;
    }
    case 'flag': {
      const x = w / 2 + 2, wv = Math.sin(f * 0.12 + s) * 2;
      dot(c, x - 1, -130, 2, 56, KINK);
      c.fillStyle = KINK; c.beginPath(); c.moveTo(x, -130); c.lineTo(x + 26, -128 + wv); c.lineTo(x + 26, -114 + wv); c.lineTo(x, -116); c.closePath(); c.fill();
      c.fillStyle = '#F97316'; c.beginPath(); c.moveTo(x + 1, -129); c.lineTo(x + 25, -127 + wv); c.lineTo(x + 25, -115 + wv); c.lineTo(x + 1, -117); c.closePath(); c.fill();
      dot(c, x + 1, -124, 24, 3, '#FDE047');
      break;
    }
    case 'icecream': {
      const x = w / 2;
      c.fillStyle = KINK; c.beginPath(); c.moveTo(x - 4, -35); c.lineTo(x + 4, -35); c.lineTo(x, -24); c.closePath(); c.fill();
      c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(x - 3, -34.5); c.lineTo(x + 3, -34.5); c.lineTo(x, -26); c.closePath(); c.fill();
      blob(c, () => c.arc(x, -37.5, 3.6, 0, Math.PI * 2), s % 2 ? '#F9A8D4' : '#A3E635', x - 3.6, x + 3.6, 1);
      break;
    }
    case 'balloon': {
      const x = w / 2, sw = Math.sin(f * 0.04 + s) * 3;
      c.strokeStyle = '#E7E5E4'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, -32); c.quadraticCurveTo(x + 4, -70, x + 6 + sw, -104); c.stroke();
      blob(c, () => c.ellipse(x + 6 + sw, -114, 8, 10, 0, 0, Math.PI * 2), '#22C55E', x - 2 + sw, x + 14 + sw, 1);
      dot(c, x + 8 + sw, -117, 2, 2, KINK); dot(c, x + 3 + sw, -110, 6, 1, KINK);
      break;
    }
  }
};

/** Where one of them stood: what they dropped running (a revisit). */
const dropped = (c: Ctx, g: DinoGuest, i: number, f: number) => {
  c.save(); c.translate(Math.round(g.x), Math.round(g.y));
  switch (g.prop) {
    case 'camera': rect(c, -5, -6, 10, 6, '#3F3F46', 1); break;
    case 'camcorder':
      // (on its side, still recording)
      rect(c, -8, -8, 16, 8, '#52525B', 1.5); rect(c, 7, -7, 5, 6, '#27272A', 1);
      if (f % 50 < 30) dot(c, -6, -6, 2, 2, '#EF4444');
      break;
    case 'flag':
      dot(c, -30, -3, 56, 2, KINK); rect(c, 22, -10, 22, 10, '#F97316', 0.5); dot(c, 22, -6, 22, 2, '#FDE047');
      break;
    case 'icecream':
      c.fillStyle = '#F9A8D4'; c.beginPath(); c.ellipse(0, -1, 9, 2.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = KINK; c.beginPath(); c.moveTo(-4, -2); c.lineTo(4, -2); c.lineTo(0, -12); c.closePath(); c.fill();
      c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(-3, -2.5); c.lineTo(3, -2.5); c.lineTo(0, -10); c.closePath(); c.fill();
      break;
    case 'kid': blob(c, () => c.ellipse(0, -5, 7, 5, 0, 0, Math.PI * 2), '#4ADE80', -7, 7, 1); dot(c, 2, -7, 2, 2, KINK); break;
    default:
      if (i % 3 === 0) rect(c, -6, -3, 12, 3, '#F59E0B', 1); // a sandal
      else if (i % 3 === 1) { rect(c, -4, -9, 8, 9, '#DC2626', 1); dot(c, 1, -14, 1, 6, '#F8FAFC'); } // a soda, its straw
      else for (let k = 0; k < 6; k++) dot(c, -10 + k * 4, -2 - (k % 2), 2, 2, '#FEF3C7'); // popcorn
  }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The far pass: the tour group behind the meadow's rail, the bleachers behind the paddock's fence

export const drawZooFar = (c: Ctx, state: GameState) => {
  const eye = eyeOf(state), f = state.frame || 0, fled = guestsFled(state);
  const far = GUESTS.filter(g => g.zone === 'far' && seen(state, eye, g.x - 40, g.x + 40, g.d));
  const stands = BLEACHERS.xs.filter(bx => seen(state, eye, bx - 20, bx + BLEACHERS.w + 20, BLEACHERS.d, 120));
  if (!far.length && !stands.length) return;
  drawDimmed(c, 0.3, '18, 26, 20', l => {
    for (const bx of stands) atD(l, eye, BLEACHERS.d, () => bleacher(l, state, bx));
    far.forEach((g) => { if (fled) atD(l, eye, g.d, () => dropped(l, g, GUESTS.indexOf(g), f)); else drawGuest(l, state, eye, g); });
    // (the bleachers' front: in front of the front row's legs)
    for (const bx of stands) atD(l, eye, BLEACHERS.d, () => bleacherFront(l, bx));
  });
};

/** A section of the T. rex feeding show's bleachers: planks in three rows on a steel frame. */
const bleacher = (c: Ctx, state: GameState, bx: number) => {
  const { w, rows } = BLEACHERS;
  void state;
  stamp(c, `dzoo-bleach-${bx}`, bx - 10, rows[2] - 4, w + 20, GY - rows[2] + 4, g => {
    for (let x = bx + 6; x < bx + w; x += 50) { box(g, x, rows[2], 4, GY - rows[2], '#3A424C'); box(g, x, rows[2], 1, GY - rows[2], '#5A646E'); }
    for (const [i, y] of rows.entries()) { box(g, bx, y, w, 5, INK); box(g, bx + 1, y + 1, w - 2, 3, '#9A8A6A'); box(g, bx, y + 5, w, 19 - i, '#2E343C'); }
  });
};
const bleacherFront = (c: Ctx, bx: number) => {
  const { w, rows } = BLEACHERS;
  stamp(c, `dzoo-bleachf-${bx}`, bx - 4, rows[0] - 2, w + 8, GY - rows[0] + 2, g => {
    // (the banner along its front: the show, and where you get wet)
    box(g, bx, rows[0] + 4, w, GY - rows[0] - 4, '#2563EB'); box(g, bx, rows[0] + 4, w, 2, '#60A5FA'); checker(g, bx, GY - 3, w, 2, '#1E40AF');
    signAt(g, 'T. REX FEEDING SHOW  2:00 & 5:00', bx + w / 2, GY - 9, 5, enamel(5, '#FDE047', '#1E3A8A'));
    signAt(g, 'SPLASH ZONE', bx + w / 2, GY - 2, 5, enamel(5, '#F8FAFC', '#1E3A8A'));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The near pass: the pen's gallery, the path's and the plaza's crowds and their rails, the signs, the speaker poles

/** The crowds' rails (in front of them): pipe, on posts, dim (not something to stand on). [x from, x to] */
const RAILS: [number, number][] = [[D + 1050, D + 1215], [D + 3940, D + 4080], [D + 4160, D + 4230], [D + 4770, D + 4885], [D + 5245, D + 5420], [D + 5700, D + 5775], [D + 8665, D + 8735], [D + 8770, D + 8850]];
const RAIL_D = 0.84;
const SPEAKERS = [D + 1460, D + 2440, D + 3920, D + 5640, D + 8550, D + 9320];
const SIGN_D = 0.86;

export const drawZooNear = (c: Ctx, state: GameState) => {
  const eye = eyeOf(state), f = state.frame || 0, fled = guestsFled(state);
  // The pen's viewing gallery: a window along its back wall, them in it (blue-dim behind the glass)
  if (seen(state, eye, GALLERY.x, GALLERY.x + GALLERY.w, GALLERY.d)) gallery(c, state, eye, fled);
  // The crowds, their rails
  const near = GUESTS.filter(g => g.zone === 'near' && seen(state, eye, g.x - 40, g.x + 40, g.d));
  if (near.length) drawDimmed(c, 0.26, '22, 28, 20', l => near.forEach(g => { if (fled) atD(l, eye, g.d, () => dropped(l, g, GUESTS.indexOf(g), f)); else drawGuest(l, state, eye, g); }));
  atD(c, eye, RAIL_D, () => { for (const [a, b] of RAILS) if (seen(state, eye, a, b, RAIL_D)) rail(c, a, b); });
  // The signs, the speakers
  atD(c, eye, SIGN_D, () => {
    if (seen(state, eye, D + 1440, D + 1600, SIGN_D)) parkSign(c);
    if (seen(state, eye, D + 5470, D + 5610, SIGN_D)) showsBoard(c);
    if (seen(state, eye, D + 8880, D + 9020, SIGN_D)) tapSign(c);
    for (const x of SPEAKERS) if (seen(state, eye, x - 20, x + 20, SIGN_D)) speaker(c, x);
  });
  atD(c, eye, 0.74, () => { for (const x of [D + 1880, D + 2240]) if (seen(state, eye, x, x + 76, 0.74)) feedSign(c, x); });
};

const gallery = (c: Ctx, state: GameState, eye: Eye, fled: boolean) => {
  const { x, w, top, bottom, d } = GALLERY, h = bottom - top;
  atD(c, eye, d, () => {
    box(c, x - 6, top - 6, w + 12, h + 12, INK); slab(c, x - 5, top - 5, w + 10, h + 10, '#6A6458', { ink: false });
    // (inside: a dim gallery, its lights in a strip along the ceiling, a poster on the far wall)
    box(c, x, top, w, h, '#1C2A34'); box(c, x, top, w, 4, '#5A7A8C'); for (let k = x + 20; k < x + w; k += 60) box(c, k, top + 1, 24, 2, '#C8E0EC');
    box(c, x, bottom - 10, w, 10, '#141E26');
  });
  const ins = GUESTS.filter(g => g.zone === 'window');
  // (clipped to the window, at its depth; each of them pushes back to it on their own)
  if (!fled) drawDimmed(c, 0.42, '16, 48, 80', l => {
    l.save();
    l.translate(eye.x, eye.y); l.scale(d, d); l.translate(-eye.x, -eye.y);
    l.beginPath(); l.rect(x, top, w, h); l.clip();
    l.translate(eye.x, eye.y); l.scale(1 / d, 1 / d); l.translate(-eye.x, -eye.y);
    for (const g of ins) drawGuest(l, state, eye, g);
    l.restore();
  });
  atD(c, eye, d, () => {
    // (the glass: a sheen across it, the mullions; and once they've gone, the smudges they left on it)
    c.fillStyle = 'rgba(200, 230, 255, 0.10)';
    for (let k = x + 30; k < x + w; k += 140) { c.beginPath(); c.moveTo(k, bottom); c.lineTo(k + 20, bottom); c.lineTo(k + 50, top); c.lineTo(k + 30, top); c.closePath(); c.fill(); }
    for (let k = 1; k < 5; k++) { const mx = x + Math.round((w * k) / 5); box(c, mx - 2, top, 4, h, '#5A5448'); box(c, mx - 2, top, 1, h, '#8A8478'); }
    if (fled) for (let k = 0; k < 6; k++) { const hx = x + 40 + k * 90, hy = top + 18 + (k % 3) * 9; c.fillStyle = 'rgba(230, 240, 250, 0.18)'; c.beginPath(); c.ellipse(hx, hy, 4, 5, 0, 0, Math.PI * 2); c.fill(); for (let j = 0; j < 4; j++) box(c, hx - 4 + j * 2.5, hy - 10, 1.5, 5, 'rgba(230, 240, 250, 0.18)'); }
  });
  void state;
};

const rail = (c: Ctx, a: number, b: number) => {
  for (let x = a; x <= b; x += 40) { box(c, x - 1, GY - 40, 4, 40, '#2E343A'); box(c, x - 1, GY - 40, 1, 40, '#4A525A'); }
  for (const y of [GY - 40, GY - 22]) { box(c, a - 1, y, b - a + 4, 3, '#3A4048'); box(c, a - 1, y + 3, b - a + 4, 1, '#22262C'); }
};

/** The park's monument sign, low on the path into the meadow. */
const parkSign = (c: Ctx) => {
  const x = D + 1440, w = 160;
  stamp(c, 'dzoo-parksign', x - 6, GY - 84, w + 12, 84, g => {
    slab(g, x + 10, GY - 20, w - 20, 20, '#7A7262');
    sign(g, x, GY - 76, w, 50, '#7C2D12', '', '#000', 6, '#4A3A2A');
    signAt(g, 'PRE-HYSTERIC PARK', x + w / 2, GY - 60, 7, dino({ sx: 1, sy: 2 }, ['#FFF6C0', '#FDE047', '#F2B21E', '#D07A1A'], '#3A1A0A', '#3A1A0A'));
    signAt(g, 'ALL DINOSAURS 100%', x + w / 2, GY - 46, 5, enamel(5, '#F8FAFC'));
    signAt(g, 'ANIMATRONIC', x + w / 2, GY - 37, 5, enamel(5, '#F8FAFC'));
  });
};
/** The plaza's board: today's shows. */
const showsBoard = (c: Ctx) => {
  const x = D + 5470, w = 140;
  stamp(c, 'dzoo-shows', x - 6, GY - 130, w + 12, 130, g => {
    for (const px of [x + 14, x + w - 18]) { box(g, px, GY - 60, 4, 60, '#3A3A3A'); box(g, px, GY - 60, 1, 60, '#5A5A5A'); }
    sign(g, x, GY - 124, w, 66, '#F8FAFC', '', '#000', 6, '#14532D');
    signAt(g, "TODAY'S SHOWS", x + w / 2, GY - 112, 6, enamel(6, '#14532D'));
    const rowsT: [string, string][] = [['RAPTOR ROUNDUP', '11 & 3'], ['TRIKE STAMPEDE', '12:30'], ['KABOOMA ERUPTS', 'HOURLY'], ['T. REX FEEDING', '2 & 5']];
    rowsT.forEach(([a, b], i) => { signAt(g, a, x + 6, GY - 99 + i * 10, 5, print(5, '#1A0B06'), 'left'); signAt(g, b, x + w - 6, GY - 99 + i * 10, 5, print(5, '#B91C1C'), 'right'); });
  });
};
/** By the way out of the paddock. */
const tapSign = (c: Ctx) => {
  const x = D + 8880, w = 140;
  stamp(c, 'dzoo-tap', x - 6, GY - 70, w + 12, 70, g => {
    box(g, x + w / 2 - 2, GY - 30, 4, 30, '#3A3A3A');
    sign(g, x, GY - 64, w, 34, '#FDE047', '', '#000', 6);
    signAt(g, 'PLEASE DO NOT TAP', x + w / 2, GY - 52, 5, enamel(5, '#1A0B06'));
    signAt(g, 'ON THE DINOSAURS', x + w / 2, GY - 43, 5, enamel(5, '#1A0B06'));
    signAt(g, '$2,000,000 EACH', x + w / 2, GY - 34, 5, enamel(5, '#B91C1C'));
  });
};
/** Hung on the meadow's back rail. */
const feedSign = (c: Ctx, x: number) => {
  stamp(c, `dzoo-feed-${x}`, x - 6, GY - 70, 88, 34, g => {
    sign(g, x, GY - 64, 76, 24, '#F8FAFC', '', '#000', 5, '#B91C1C');
    signAt(g, 'ANIMATRONIC', x + 38, GY - 54, 5, enamel(5, '#B91C1C'));
    signAt(g, 'DO NOT FEED', x + 38, GY - 45, 5, enamel(5, '#1A0B06'));
  });
};
/** A PA pole: two horn speakers up top, a junction box, the conduit down it. */
const speaker = (c: Ctx, x: number) => {
  stamp(c, `dzoo-pa-${x}`, x - 20, GY - 150, 40, 150, g => {
    pole(g, x - 2, GY - 136, 5, 136, '#3A4A3A');
    box(g, x - 5, GY - 60, 11, 14, '#2E3A2E'); box(g, x - 4, GY - 59, 9, 2, '#4A5A4A');
    for (const s of [-1, 1]) {
      g.fillStyle = INK; g.beginPath(); g.moveTo(x, GY - 140); g.lineTo(x + s * 16, GY - 148); g.lineTo(x + s * 16, GY - 128); g.closePath(); g.fill();
      g.fillStyle = '#9CA3AF'; g.beginPath(); g.moveTo(x + s * 2, GY - 139); g.lineTo(x + s * 15, GY - 146); g.lineTo(x + s * 15, GY - 130); g.closePath(); g.fill();
      box(g, x + (s > 0 ? 13 : -15), GY - 146, 2, 16, '#D1D5DB');
    }
  });
};
