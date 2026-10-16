// The landmarks drawn (crude but readable, the first pass): each the park's oversized replica, and, once Harry's woken
// them, a mech: a pair of hydraulic legs bolted under it, stomping in place as the globe turns under them, and a pair of
// GOOGLY EYES stuck on (white, the pupils rolling about after him). Upright with the base at the origin (y up
// negative), facing left (at him). Wrecked: blackened, over on their side, smoking, the eyes X'd. Also their shots,
// beams, drops and minions.

import type { GameState } from '../../../m1/game/core/state';
import type { Mech, Heli } from './state';
import { LEG, CY } from './geo';
import { EYES, PISA_DOWN, groundY, pisaPivot } from './mechs';
import type { MechId } from './lines';

type Ctx = CanvasRenderingContext2D;
const INK = '#1A0B06';

const fl = (c: Ctx, col: string, path: () => void, line = 1.8) => { c.beginPath(); path(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = line; c.lineJoin = 'round'; c.stroke(); };
const r = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(x, y, w, h); };

export interface MechLook { awake: boolean; f: number; m?: Mech; wreck?: boolean; flash?: boolean }

/** The legs (awake) or a plinth (a replica on the tour). */
const legs = (c: Ctx, L: MechLook) => {
  if (!L.awake) { fl(c, '#A8A29E', () => c.rect(-60, -LEG, 120, LEG)); r(c, -58, -LEG + 2, 116, 4, '#D6D3D1'); r(c, -58, -10, 116, 4, '#78716C'); return; }
  const ph = L.wreck ? 0 : L.f * 0.09;
  for (const s of [-1, 1]) {
    const lift = Math.max(0, Math.sin(ph + (s > 0 ? Math.PI : 0))) * 10, kx = s * 22, fx = s * 26 + Math.cos(ph + (s > 0 ? Math.PI : 0)) * 6;
    // (thigh, knee, shin: a piston; the foot)
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 15; c.beginPath(); c.moveTo(s * 16, -LEG); c.lineTo(kx + 8, -LEG / 2 - lift); c.lineTo(fx, -6 - lift); c.stroke();
    c.strokeStyle = '#71717A'; c.lineWidth = 11; c.beginPath(); c.moveTo(s * 16, -LEG); c.lineTo(kx + 8, -LEG / 2 - lift); c.lineTo(fx, -6 - lift); c.stroke();
    c.strokeStyle = '#D4D4D8'; c.lineWidth = 3; c.beginPath(); c.moveTo(s * 16 - 3, -LEG); c.lineTo(kx + 5, -LEG / 2 - lift); c.stroke();
    fl(c, '#FACC15', () => c.arc(kx + 8, -LEG / 2 - lift, 6, 0, Math.PI * 2), 1.4);
    fl(c, '#3F3F46', () => c.roundRect(fx - 20, -10 - lift, 36, 12, 3), 1.6);
  }
  fl(c, '#52525B', () => c.roundRect(-40, -LEG - 8, 80, 14, 4));
  r(c, -36, -LEG - 6, 72, 3, '#A1A1AA');
};

/** Googly eyes at their spots (from the base): white, inked; pupils by m.eyes; X'd on a wreck. */
export const googly = (c: Ctx, id: MechId, m: Mech | undefined, wreck: boolean, f: number) => {
  const spots = EYES[id](m ?? ({ k: 0, lean: 0 } as Mech));
  spots.forEach((e, i) => {
    fl(c, '#FFFFFF', () => c.arc(e.x, e.y, e.r, 0, Math.PI * 2), 2);
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; c.beginPath(); c.arc(e.x, e.y, e.r - 3, 0.3, 1.6); c.stroke();
    if (wreck) { c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(e.x - e.r * 0.5, e.y - e.r * 0.5); c.lineTo(e.x + e.r * 0.5, e.y + e.r * 0.5); c.moveTo(e.x + e.r * 0.5, e.y - e.r * 0.5); c.lineTo(e.x - e.r * 0.5, e.y + e.r * 0.5); c.stroke(); return; }
    const g = m?.eyes[i] ?? { x: Math.sin(f * 0.05 + i) * 2, y: e.r * 0.3 };
    c.fillStyle = INK; c.beginPath(); c.arc(e.x + g.x, e.y + g.y, e.r * 0.48, 0, Math.PI * 2); c.fill();
    r(c, e.x + g.x - e.r * 0.2, e.y + g.y - e.r * 0.25, 3, 3, '#FFFFFF');
  });
};

// ---------------------------------------------------------------------------------------------------------------
// Each landmark's body (above the legs: y from -LEG up)

const B = -LEG;
const BODY: Record<MechId, (c: Ctx, L: MechLook) => void> = {
  eiffel: (c, L) => {
    const iron = '#7C4A2D', lit = '#A16207', dark = '#4A2A18';
    // (the four-legged base with its arch, the first deck, the narrowing middle, the second deck, the spire)
    fl(c, iron, () => { c.moveTo(-100, B); c.lineTo(-58, B - 110); c.lineTo(58, B - 110); c.lineTo(100, B); c.lineTo(62, B); c.quadraticCurveTo(0, B - 80, -62, B); c.closePath(); });
    fl(c, iron, () => { c.moveTo(-56, B - 120); c.lineTo(-22, B - 250); c.lineTo(22, B - 250); c.lineTo(56, B - 120); c.closePath(); });
    fl(c, iron, () => { c.moveTo(-20, B - 260); c.lineTo(-5, B - 400); c.lineTo(5, B - 400); c.lineTo(20, B - 260); c.closePath(); });
    fl(c, dark, () => c.rect(-70, B - 122, 140, 12)); r(c, -68, B - 121, 136, 3, lit);
    fl(c, dark, () => c.rect(-30, B - 262, 60, 10)); r(c, -28, B - 261, 56, 2, lit);
    fl(c, '#FDE68A', () => c.rect(-4, B - 425, 8, 26), 1.4);
    // (the lattice: crossed girders)
    c.strokeStyle = dark; c.lineWidth = 1.5;
    for (let y = B - 20; y > B - 110; y -= 18) { const w = 100 - (B - y) * 0.38; c.beginPath(); c.moveTo(-w, y); c.lineTo(w - 10, y - 18); c.moveTo(w, y); c.lineTo(-w + 10, y - 18); c.stroke(); }
    for (let y = B - 130; y > B - 250; y -= 20) { const w = 56 - (B - 120 - y) * 0.26; c.beginPath(); c.moveTo(-w, y); c.lineTo(w - 4, y - 20); c.moveTo(w, y); c.lineTo(-w + 4, y - 20); c.stroke(); }
    r(c, -96, B - 4, 30, 4, lit); r(c, -54, B - 116, 6, 100, lit);
    if (L.awake) googly(c, 'eiffel', L.m, !!L.wreck, L.f);
  },
  opera: (c, L) => {
    // (the podium, its steps; the sails, white tiles lined in gray, opening when it claps)
    fl(c, '#C8A27A', () => c.rect(-150, B - 60, 300, 60)); for (let y = B - 50; y < B; y += 12) r(c, -148, y, 296, 2, '#A47E58');
    const open = L.m?.a ?? 0;
    const sail = (x: number, s: number, tip: number) => {
      c.save(); c.translate(x, B - 60); c.rotate(-open * 0.35 * (x < 0 ? 1 : 0.6));
      fl(c, '#F8FAFC', () => { c.moveTo(-50 * s, 0); c.quadraticCurveTo(-40 * s, -tip * 0.8, 40 * s, -tip); c.quadraticCurveTo(20 * s, -tip * 0.4, 30 * s, 0); c.closePath(); });
      c.strokeStyle = '#CBD5E1'; c.lineWidth = 1.2; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(-50 * s + k * 16 * s, 0); c.quadraticCurveTo(-40 * s + k * 14 * s, -tip * 0.7, 40 * s - (5 - k) * 4 * s, -tip + k * 4); c.stroke(); }
      c.restore();
    };
    sail(70, 0.9, 120); sail(10, 1.2, 165); sail(-70, 1, 140); sail(-120, 0.6, 80);
    if (L.awake) googly(c, 'opera', L.m, !!L.wreck, L.f);
  },
  redeemer: (c, L) => {
    const stone = '#E7EFD9', shade = '#B8C4A6';
    fl(c, '#9CA3AF', () => c.rect(-50, B - 60, 100, 60)); r(c, -48, B - 58, 96, 4, '#D1D5DB');
    // (the robe, flaring at the hem; the sash line)
    fl(c, stone, () => { c.moveTo(-40, B - 60); c.lineTo(-22, B - 300); c.lineTo(22, B - 300); c.lineTo(40, B - 60); c.closePath(); });
    r(c, 10, B - 290, 8, 226, shade); c.strokeStyle = shade; c.lineWidth = 2; c.beginPath(); c.moveTo(-26, B - 200); c.lineTo(26, B - 190); c.stroke();
    // (the arms: straight out, or spinning; gone while they're hugging: those are the beams)
    if (!L.m?.b) {
      c.save(); c.translate(0, B - 292); c.rotate(L.m?.a ?? 0);
      fl(c, stone, () => { c.moveTo(-180, -12); c.lineTo(180, -12); c.lineTo(180, 10); c.lineTo(-180, 10); c.closePath(); });
      r(c, -178, 2, 356, 6, shade);
      for (const s of [-1, 1]) fl(c, stone, () => c.arc(s * 184, -1, 10, 0, Math.PI * 2), 1.4);
      c.restore();
    }
    fl(c, stone, () => c.arc(0, B - 330, 24, 0, Math.PI * 2));
    r(c, 6, B - 350, 6, 30, shade);
    if (L.awake) googly(c, 'redeemer', L.m, !!L.wreck, L.f);
  },
  pisa: (c, L) => {
    // (over on its pivot, the left base corner: leaning, or down)
    const lean = L.wreck ? PISA_DOWN : L.m?.lean ?? 0.07;
    c.save(); c.translate(-42, B); c.rotate(-lean); c.translate(42, -B);
    fl(c, '#F5F5F4', () => c.rect(-42, B - 440, 84, 440));
    for (let y = B - 40; y > B - 400; y -= 52) { r(c, -42, y, 84, 5, '#A8A29E'); for (let x = -34; x < 40; x += 14) fl(c, '#78716C', () => c.roundRect(x, y - 36, 8, 26, [4, 4, 0, 0]), 1); }
    fl(c, '#E7E5E4', () => c.rect(-30, B - 476, 60, 36));
    for (let x = -24; x < 30; x += 12) fl(c, '#57534E', () => c.roundRect(x, B - 470, 6, 20, [3, 3, 0, 0]), 1);
    r(c, 26, B - 436, 10, 430, '#D6D3D1');
    if (L.awake) googly(c, 'pisa', L.m, !!L.wreck, L.f);
    c.restore();
  },
  taj: (c, L) => {
    const marble = '#F8FAFC', sh = '#CBD5E1';
    fl(c, marble, () => c.rect(-110, B - 120, 220, 120));
    fl(c, '#334155', () => { c.moveTo(-26, B); c.lineTo(-26, B - 70); c.quadraticCurveTo(0, B - 100, 26, B - 70); c.lineTo(26, B); c.closePath(); });
    for (const x of [-80, 60]) fl(c, '#475569', () => { c.moveTo(x, B - 20); c.lineTo(x, B - 60); c.quadraticCurveTo(x + 10, B - 76, x + 20, B - 60); c.lineTo(x + 20, B - 20); c.closePath(); }, 1.2);
    // (the onion dome, its spike; the two little domes)
    fl(c, marble, () => { c.moveTo(-70, B - 120); c.bezierCurveTo(-110, B - 200, -40, B - 260, 0, B - 290); c.bezierCurveTo(40, B - 260, 110, B - 200, 70, B - 120); c.closePath(); });
    r(c, 20, B - 250, 14, 120, sh);
    c.strokeStyle = '#CA8A04'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, B - 290); c.lineTo(0, B - 318); c.stroke();
    for (const x of [-88, 88]) fl(c, marble, () => c.arc(x, B - 120, 22, Math.PI, 0));
    // (the minarets, unless it's thrown them)
    if (!L.m?.b) for (const x of [-145, 145]) { fl(c, marble, () => c.rect(x - 10, B - 250, 20, 250)); for (let y = B - 60; y > B - 240; y -= 60) r(c, x - 13, y, 26, 4, sh); fl(c, marble, () => c.arc(x, B - 252, 12, Math.PI, 0)); }
    // (the reflecting pool in front)
    r(c, -100, B - 2, 200, 6, '#7DD3FC');
    if (L.awake) googly(c, 'taj', L.m, !!L.wreck, L.f);
  },
  bigben: (c, L) => {
    const stone = '#D6A35C', dark = '#A16207';
    fl(c, stone, () => c.rect(-50, B - 380, 100, 380));
    for (let y = B - 20; y > B - 280; y -= 30) { r(c, -48, y, 96, 3, dark); for (const x of [-34, -6, 22]) r(c, x, y - 22, 10, 16, '#7C2D12'); }
    // (the clock: a face, the hands; the belfry, the spire)
    fl(c, '#FEF3C7', () => c.arc(0, B - 330, 40, 0, Math.PI * 2), 2.4);
    c.strokeStyle = INK; c.lineWidth = 2; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * 33, B - 330 + Math.sin(a) * 33); c.lineTo(Math.cos(a) * 38, B - 330 + Math.sin(a) * 38); c.stroke(); }
    const t = L.f * 0.01;
    c.lineWidth = 4; c.beginPath(); c.moveTo(0, B - 330); c.lineTo(Math.cos(t) * 30, B - 330 + Math.sin(t) * 30); c.moveTo(0, B - 330); c.lineTo(Math.cos(t / 12 - 1) * 18, B - 330 + Math.sin(t / 12 - 1) * 18); c.stroke();
    fl(c, stone, () => c.rect(-40, B - 420, 80, 40));
    fl(c, '#475569', () => { c.moveTo(-44, B - 420); c.lineTo(0, B - 470); c.lineTo(44, B - 420); c.closePath(); });
    fl(c, '#CA8A04', () => c.rect(-3, B - 490, 6, 22), 1.2);
    if (L.awake) googly(c, 'bigben', L.m, !!L.wreck, L.f);
  },
  colosseum: (c, L) => {
    const stone = '#E7C9A0', dark = '#8B6F4E';
    fl(c, stone, () => { c.moveTo(-170, B); c.lineTo(-170, B - 200); c.quadraticCurveTo(-90, B - 230, 0, B - 225); c.lineTo(60, B - 222); c.lineTo(90, B - 180); c.lineTo(130, B - 190); c.lineTo(170, B - 140); c.lineTo(170, B); c.closePath(); });
    for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
      const x = -158 + k * 36, y = B - 30 - row * 64;
      if (row === 2 && k > 6) continue;
      fl(c, '#3F2A1C', () => { c.moveTo(x, y); c.lineTo(x, y - 30); c.quadraticCurveTo(x + 11, y - 44, x + 22, y - 30); c.lineTo(x + 22, y); c.closePath(); }, 1);
    }
    for (const y of [B - 4, B - 66, B - 130]) r(c, -168, y, 336, 4, dark);
    if (L.awake) googly(c, 'colosseum', L.m, !!L.wreck, L.f);
  },
  pyramid: (c, L) => {
    fl(c, '#FCD34D', () => { c.moveTo(-180, B); c.lineTo(0, B - 300); c.lineTo(180, B); c.closePath(); });
    c.fillStyle = '#D97706'; c.beginPath(); c.moveTo(0, B - 300); c.lineTo(180, B); c.lineTo(30, B); c.closePath(); c.fill();
    c.strokeStyle = '#92400E'; c.lineWidth = 1.5; for (let y = B - 20; y > B - 290; y -= 22) { const w = (y - (B - 300)) * 0.6; c.beginPath(); c.moveTo(-w, y); c.lineTo(w, y); c.stroke(); }
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(-180, B); c.lineTo(0, B - 300); c.lineTo(180, B); c.stroke();
    // (the capstone and its eye)
    fl(c, '#FDE68A', () => { c.moveTo(-22, B - 264); c.lineTo(0, B - 300); c.lineTo(22, B - 264); c.closePath(); }, 1.4);
    fl(c, '#FFFFFF', () => c.ellipse(0, B - 278, 8, 5, 0, 0, Math.PI * 2), 1.2);
    c.fillStyle = '#BE185D'; c.beginPath(); c.arc(0, B - 278, 3, 0, Math.PI * 2); c.fill();
    if (L.awake) googly(c, 'pyramid', L.m, !!L.wreck, L.f);
  },
  moai: (c, L) => {
    const rise = (L.m?.k ?? 0) * 150, stone = '#78716C', dark = '#57534E', lit = '#A8A29E';
    // (THE BODY: risen up out of the ground, arms carved down its sides, hands on its belly)
    if (rise > 2) {
      fl(c, stone, () => c.rect(-110, B - rise, 220, rise));
      r(c, -100, B - rise + 10, 14, rise - 20, dark); r(c, 86, B - rise + 10, 14, rise - 20, dark);
      for (const s of [-1, 1]) fl(c, dark, () => c.roundRect(s * 40 - 22, B - rise * 0.45, 44, 14, 6), 1.2);
      fl(c, dark, () => c.arc(0, B - rise * 0.7, 5, 0, Math.PI * 2), 1);
    }
    c.save(); c.translate(0, -rise);
    // (the head: long, a heavy brow, the long nose, pursed lips, a jutting chin; the ears down its sides)
    fl(c, stone, () => { c.moveTo(-80, B); c.lineTo(-80, B - 270); c.quadraticCurveTo(-80, B - 300, -50, B - 300); c.lineTo(60, B - 300); c.quadraticCurveTo(80, B - 300, 80, B - 270); c.lineTo(80, B); c.closePath(); });
    r(c, -78, B - 296, 20, 290, lit);
    fl(c, dark, () => c.rect(-70, B - 240, 140, 16));
    fl(c, stone, () => { c.moveTo(-14, B - 226); c.lineTo(-24, B - 130); c.lineTo(22, B - 130); c.lineTo(10, B - 226); c.closePath(); });
    fl(c, dark, () => c.rect(-34, B - 104, 68, 12));
    fl(c, stone, () => c.rect(-44, B - 70, 88, 40));
    for (const s of [-1, 1]) fl(c, dark, () => c.rect(s * 80 - (s > 0 ? 0 : 14), B - 220, 14, 130), 1.4);
    c.restore();
    if (L.awake) googly(c, 'moai', L.m, !!L.wreck, L.f);
  },
};

/** A landmark at (x, y) (its base: world), `scale`, turned `rot` (standing on the globe). */
export const drawMech = (c: Ctx, id: MechId, x: number, y: number, scale: number, rot: number, L: MechLook) => {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.rotate(rot); c.scale(scale, scale);
  if (L.wreck && id !== 'pisa') {
    // (a wreck: over on its side, blackened, smoking)
    c.save(); c.filter = 'brightness(0.45) sepia(0.5)';
    legs(c, { ...L, awake: true });
    c.translate(-30, -10); c.rotate(-Math.PI / 2 + 0.15); c.translate(0, LEG);
    BODY[id](c, L);
    c.restore();
  } else {
    if (L.wreck) c.filter = 'brightness(0.55) sepia(0.4)';
    legs(c, L);
    BODY[id](c, L);
    c.filter = 'none';
    if (L.flash) { c.globalAlpha = 0.35; c.globalCompositeOperation = 'lighter'; BODY[id](c, L); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; }
  }
  if (L.wreck) for (let k = 0; k < 5; k++) { const ph = ((L.f * 0.6 + k * 40) % 200) / 200; c.globalAlpha = (1 - ph) * 0.6; c.fillStyle = '#3F3F46'; c.beginPath(); c.arc(-60 + k * 20 + Math.sin(ph * 6 + k) * 10, -60 - ph * 220, 14 + ph * 30, 0, Math.PI * 2); c.fill(); }
  c.globalAlpha = 1;
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Their attacks

export const drawAttacks = (c: Ctx, state: GameState, h: Heli) => {
  const f = state.frame;
  // The Leaning Tower's landing zone, while it leans: the arc its top sweeps, where it'll lie (red, hatched)
  const pm = h.mechs[h.cur];
  if (pm?.id === 'pisa' && pm.st === 'fight' && pm.b >= 1 && pm.b < 3) {
    const px = pisaPivot().x, py = pisaPivot().y, Lh = 440 + LEG + 36;
    c.save();
    c.globalAlpha = 0.18 + (f % 20 < 10 ? 0.08 : 0);
    c.fillStyle = '#DC2626'; c.beginPath(); c.moveTo(px, py); c.arc(px, py, Lh, -Math.PI / 2 - pm.lean, -Math.PI / 2 - PISA_DOWN, true); c.closePath(); c.fill();
    c.globalAlpha = 0.85; c.setLineDash([10, 8]); c.strokeStyle = '#FEE2E2'; c.lineWidth = 3;
    c.beginPath(); c.arc(px, py, Lh, -Math.PI / 2 - pm.lean, -Math.PI / 2 - PISA_DOWN, true); c.stroke();
    // (where it'll lie)
    c.save(); c.translate(px, py); c.rotate(-PISA_DOWN); c.strokeStyle = '#EF4444'; c.lineWidth = 4; c.strokeRect(0, -Lh, 84, Lh); c.restore();
    c.setLineDash([]);
    c.restore();
  }
  for (const b of h.beams) {
    const ex = b.x + Math.cos(b.a) * b.len, ey = b.y + Math.sin(b.a) * b.len;
    if (b.t <= b.warn) {
      c.save(); c.globalAlpha = 0.4 + 0.4 * ((b.t >> 2) % 2); c.strokeStyle = b.src === 'm2:fl_redeemer_arms' ? '#FEE2E2' : b.col; c.lineWidth = 2; c.setLineDash([8, 6]);
      c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(ex, ey); c.stroke(); c.restore();
      if (b.src !== 'm2:fl_redeemer_arms') continue;
    }
    if (b.src === 'm2:fl_redeemer_arms') {
      // (its arms: stone, out to their reach, a hand at the end)
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      fl(c, '#E7EFD9', () => c.rect(0, -b.w / 2, b.len, b.w)); r(c, 0, b.w / 4, b.len, b.w / 4, '#B8C4A6');
      fl(c, '#E7EFD9', () => c.arc(b.len + 6, 0, b.w / 2 + 2, 0, Math.PI * 2));
      c.restore(); continue;
    }
    if (b.src === 'm2:fl_bigben_hand') {
      // (a clock hand, black iron, tapering, a spade tip)
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      fl(c, '#1C1917', () => { c.moveTo(0, -b.w / 2); c.lineTo(b.len - 30, -b.w / 4); c.lineTo(b.len, 0); c.lineTo(b.len - 30, b.w / 4); c.lineTo(0, b.w / 2); c.closePath(); }, 1.2);
      r(c, 0, -b.w / 2 + 2, b.len - 40, 2, '#57534E');
      c.restore(); continue;
    }
    const w = b.w + (f % 4) * 2;
    c.save(); c.translate(b.x, b.y); c.rotate(b.a);
    c.globalAlpha = 0.35; r(c, 0, -w / 2 - 8, b.len, w + 16, b.col); c.globalAlpha = 1;
    r(c, 0, -w / 2, b.len, w, b.col); r(c, 0, -w / 4, b.len, w / 2, '#FFFFFF');
    c.restore();
  }
  for (const d of h.drops) {
    const gy = groundY(d.x);
    if (d.t <= d.warn) {
      c.save(); c.globalAlpha = 0.18 + 0.14 * ((d.t >> 2) % 2); r(c, d.x - d.w / 2, CY, d.w, gy - CY, '#EF4444'); c.globalAlpha = 1;
      c.font = '16px "Press Start 2P"'; c.textAlign = 'center'; c.fillStyle = '#FEE2E2'; c.fillText('!', d.x, CY + 120 + (d.t % 20 < 10 ? 0 : 4)); c.textAlign = 'left';
      c.restore(); continue;
    }
    if (d.kind === 'minaret') { fl(c, '#F8FAFC', () => c.rect(d.x - 12, d.y, 24, 240)); for (let y = d.y + 40; y < d.y + 230; y += 60) r(c, d.x - 15, y, 30, 4, '#CBD5E1'); fl(c, '#F8FAFC', () => c.arc(d.x, d.y + 240, 13, 0, Math.PI)); }
    else if (d.kind === 'thumb') {
      // (a giant stone fist, thumb down)
      fl(c, '#E7C9A0', () => c.roundRect(d.x - 48, d.y - 200, 96, 130, 14));
      fl(c, '#E7C9A0', () => c.roundRect(d.x - 18, d.y - 80, 36, 80, 14));
      fl(c, '#F5E6CF', () => c.roundRect(d.x - 10, d.y - 14, 20, 12, 4), 1.2);
      for (let k = 0; k < 3; k++) r(c, d.x - 40, d.y - 180 + k * 30, 70, 3, '#8B6F4E');
    } else fl(c, '#78716C', () => c.arc(d.x, d.y + 22, 22, 0, Math.PI * 2));
  }
  for (const n of h.minions) drawMinion(c, n.kind, n.x, n.y, n.r, n.t, n.flash > 0, n.vx);
  // Their shots: drawn over the engine's own
  for (const [q, s] of h.shots) {
    const x = Math.round(q.pos.x + q.width / 2), y = Math.round(q.pos.y + q.height / 2), rr = s.r;
    switch (s.shape) {
      case 'rivet': fl(c, s.col, () => { for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + s.t * 0.2; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }, 1.4); r(c, x - 2, y - 2, 3, 3, '#FDE68A'); break;
      case 'note': fl(c, s.col, () => c.ellipse(x - 2, y + 3, rr * 0.7, rr * 0.5, -0.4, 0, Math.PI * 2), 1.4); c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 3, y + 2); c.lineTo(x + 3, y - 12); c.lineTo(x + 9, y - 8); c.stroke(); break;
      case 'marble': fl(c, '#F8FAFC', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.6); fl(c, '#7DD3FC', () => c.arc(x + 2, y + 2, rr * 0.4, 0, Math.PI * 2), 0.8); r(c, x - 4, y - 4, 3, 3, '#FFFFFF'); break;
      case 'gear': fl(c, s.col, () => { for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + s.t * 0.15, R = k % 2 ? rr : rr * 0.7; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } c.closePath(); }, 1.2); fl(c, INK, () => c.arc(x, y, 2.5, 0, Math.PI * 2), 0); break;
      case 'cup': fl(c, '#F8FAFC', () => { c.moveTo(x - 8, y - 5); c.lineTo(x + 8, y - 5); c.lineTo(x + 5, y + 6); c.lineTo(x - 5, y + 6); c.closePath(); }, 1.4); c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.arc(x + 9, y, 3.5, -1.2, 1.2); c.stroke(); r(c, x - 6, y - 3, 12, 2, '#92400E'); break;
      case 'block': fl(c, s.col, () => c.rect(x - rr, y - rr * 0.7, rr * 2, rr * 1.4), 1.6); r(c, x - rr + 2, y - rr * 0.7 + 2, rr * 2 - 4, 3, '#FDE68A'); break;
      case 'rock': fl(c, s.col, () => { for (let k = 0; k < 7; k++) { const a = k * 0.9 + s.t * 0.05, R = rr * (0.8 + ((k * 37) % 5) * 0.06); c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * R, y + Math.sin(a) * R); } c.closePath(); }, 1.6); r(c, x - rr * 0.4, y - rr * 0.4, rr * 0.5, 2, '#A8A29E'); break;
      default: {
        c.strokeStyle = (f >> 3) % 2 ? '#FFFFFF' : s.col; c.lineWidth = 2; c.beginPath(); c.arc(x, y, rr + 4, 0, Math.PI * 2); c.stroke();
        fl(c, s.col, () => c.arc(x, y, rr, 0, Math.PI * 2), 1.6); r(c, x - rr * 0.4, y - rr * 0.4, Math.max(2, rr * 0.4), Math.max(2, rr * 0.4), '#FFFFFF');
      }
    }
  }
};

/** A minion (world). */
export const drawMinion = (c: Ctx, kind: string, x: number, y: number, rr: number, t: number, flash: boolean, vx: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  if (flash) c.filter = 'brightness(2)';
  switch (kind) {
    case 'keychain': c.rotate(Math.sin(t * 0.2) * 0.5); fl(c, '#EAB308', () => { c.moveTo(0, -16); c.lineTo(10, 14); c.lineTo(4, 14); c.lineTo(0, 6); c.lineTo(-4, 14); c.lineTo(-10, 14); c.closePath(); }); c.strokeStyle = '#CA8A04'; c.lineWidth = 2; c.beginPath(); c.arc(0, -20, 4, 0, Math.PI * 2); c.stroke(); googlySmall(c, 0, -2, 4); break;
    case 'gull': { const w = Math.sin(t * 0.5) * 10; fl(c, '#F8FAFC', () => c.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2)); fl(c, '#E5E7EB', () => { c.moveTo(-4, -2); c.lineTo(-14, -10 - w); c.lineTo(4, -4); c.closePath(); }, 1.2); fl(c, '#FB923C', () => { c.moveTo(-12, -1); c.lineTo(-19, 1); c.lineTo(-12, 3); c.closePath(); }, 1); googlySmall(c, -7, -3, 3); break; }
    case 'gear': c.rotate(t * 0.1); fl(c, '#CA8A04', () => { for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10, R = k % 2 ? rr : rr * 0.75; c[k ? 'lineTo' : 'moveTo'](Math.cos(a) * R, Math.sin(a) * R); } c.closePath(); }); fl(c, '#713F12', () => c.arc(0, 0, 4, 0, Math.PI * 2), 1); break;
    case 'lion': if (vx > 0) c.scale(-1, 1); fl(c, '#B45309', () => c.arc(-8, -4, 14, 0, Math.PI * 2)); fl(c, '#F59E0B', () => c.ellipse(4, 2, 16, 9, 0, 0, Math.PI * 2)); fl(c, '#F59E0B', () => c.arc(-10, -4, 8, 0, Math.PI * 2), 1.2); r(c, -15, -1, 5, 2, INK); googlySmall(c, -12, -7, 3); break;
    case 'scarab': fl(c, '#14532D', () => c.ellipse(0, 0, 10, 7, 0, 0, Math.PI * 2)); r(c, -1, -6, 2, 12, '#84CC16'); for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-4, s * 6); c.lineTo(-8 + Math.sin(t) * 2, s * 10); c.moveTo(4, s * 6); c.lineTo(8, s * 10); c.stroke(); } break;
    case 'head': fl(c, '#78716C', () => c.roundRect(-14, -20, 28, 40, 6)); r(c, -12, -10, 24, 4, '#57534E'); fl(c, '#78716C', () => c.rect(-4, -6, 6, 14), 1); googlySmall(c, -5, -14, 4); googlySmall(c, 6, -14, 4); break;
  }
  c.restore();
};
const googlySmall = (c: Ctx, x: number, y: number, rr: number) => { fl(c, '#FFFFFF', () => c.arc(x, y, rr, 0, Math.PI * 2), 1.2); c.fillStyle = INK; c.beginPath(); c.arc(x - rr * 0.3, y + rr * 0.2, rr * 0.5, 0, Math.PI * 2); c.fill(); };
