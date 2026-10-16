// THE QUEEN IN PIECES: her weakness death (the mallet's killing blow, or one of hers batted back into her). She bursts
// apart and it all goes everywhere: the armor plates, all four arms, both legs, the tail a bone at a time and its blade,
// the crest, the head (her speaker wired to it, still talking), the servos, the wires, the hydraulic hoses, the dorsal
// pipes; sparks, a gush of green hydraulic fluid and blood (machines bleed). The pieces fly the length of the disco,
// off the floor and the walls, clattering, and stay where they land.
//
// Also the chips: a plate or a bolt knocked off her by each mallet hit in the fight, landing and staying the same way.

import type { GameState } from '../../../m1/game/core/state';
import { playSound } from '../../../m1/game/platform/audio';
import { GY } from '../geometry';
import { DISCO_L, DISCO_R } from './geo';
import { type Ramp, LAT, CHROME, GLOSS, SPEC, FOAMR, GUM, TOOTH, GREEN, tube, hose, quad, blob, shapeShade } from './paint';

type Ctx = CanvasRenderingContext2D;

export type PieceKind = 'head' | 'crest' | 'plate' | 'arm' | 'small' | 'leg' | 'bone' | 'blade' | 'servo' | 'wire' | 'hose' | 'pipe' | 'bolt';
export interface Piece {
  k: PieceKind; x: number; y: number; vx: number; vy: number; a: number; va: number;
  /** How far its edge is from its middle (for the floor and the walls); its size; which way it's flipped; a seed. */
  r: number; s: number; flip: 1 | -1; seed: number;
  /** Lying still for good; frames since it last hit something (the clatter's spaced); frames it still bleeds. */
  rest: boolean; hitT: number; bleed: number;
}
/** Splashes on the floor (green fluid, red blood): stay. */
export interface Splat { x: number; r: number; red: boolean }

const G = 0.5, CEIL = GY - 560, L = DISCO_L + 8, R = DISCO_R - 8;
const LINES: Ramp[] = [['#2A0505', '#7F1D1D', '#B91C1C', '#EF4444', '#FCA5A5'], ['#06122E', '#1E3A8A', '#1D4ED8', '#60A5FA', '#BFDBFE'], ['#2E1F02', '#854D0E', '#CA8A04', '#FACC15', '#FEF08A']];
const BLOOD = ['#450A0A', '#7F1D1D', '#B91C1C'];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const px = (c: Ctx, x: number, y: number, w: number, h: number, col: string) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

const RADIUS: Record<PieceKind, number> = { head: 22, crest: 14, plate: 9, arm: 10, small: 7, leg: 12, bone: 7, blade: 6, servo: 7, wire: 4, hose: 5, pipe: 6, bolt: 3 };

const piece = (k: PieceKind, x: number, y: number, vx: number, vy: number, s = 1): Piece =>
  ({ k, x, y, vx, vy, a: rnd(0, Math.PI * 2), va: rnd(-0.35, 0.35), r: RADIUS[k] * s, s, flip: Math.random() < 0.5 ? 1 : -1, seed: Math.random(), rest: false, hitT: 99, bleed: k === 'head' || k === 'arm' || k === 'leg' || k === 'hose' ? 140 : k === 'plate' || k === 'small' ? 60 : 0 });

/** Her, burst: everything she's made of, flung out from her middle (x, facing). Hard enough to reach every corner. */
export const burstQueen = (x: number, facing: 1 | -1): Piece[] => {
  const out: Piece[] = [];
  const fling = (k: PieceKind, ox: number, oy: number, sp: [number, number], s = 1) => {
    const px0 = x + ox * facing, py0 = GY + oy;
    // (out from her middle, mostly sideways, up; the odd one straight up into the rig)
    const away = Math.sign(ox * facing) || (Math.random() < 0.5 ? -1 : 1);
    const dir = Math.random() < 0.8 ? away : -away;
    out.push(piece(k, px0, py0, dir * rnd(sp[0], sp[1]), -rnd(7, 19), s));
  };
  fling('head', 40, -258, [9, 15]);
  fling('crest', -20, -280, [6, 13]);
  for (let i = 0; i < 12; i++) fling('plate', rnd(-40, 40), rnd(-230, -120), [4, 22], rnd(0.8, 1.4));
  fling('arm', 30, -222, [8, 18]); fling('arm', -10, -226, [8, 18]);
  fling('small', 40, -186, [6, 16]); fling('small', 30, -180, [6, 16]);
  fling('leg', 14, -90, [5, 12]); fling('leg', -14, -90, [5, 12]);
  for (let i = 0; i < 12; i++) fling('bone', -40 - i * 16, -70 + i * 2, [4, 18], 1.2 - i * 0.04);
  fling('blade', -240, -50, [8, 18]);
  for (let i = 0; i < 6; i++) fling('servo', rnd(-30, 40), rnd(-240, -100), [5, 20]);
  for (let i = 0; i < 9; i++) fling('wire', rnd(-30, 30), rnd(-220, -120), [3, 16]);
  for (let i = 0; i < 3; i++) fling('hose', -30, -180 + i * 8, [5, 15]);
  for (let i = 0; i < 4; i++) fling('pipe', -40 - i * 6, -230 + i * 10, [5, 16]);
  for (let i = 0; i < 16; i++) fling('bolt', rnd(-50, 50), rnd(-260, -60), [4, 24]);
  return out;
};

/** A chip knocked off her by a mallet hit: a plate, a bolt or two, a wire. Away from him. */
export const chipQueen = (x: number, y: number, away: number): Piece[] => {
  const out = [piece('plate', x, y, away * rnd(5, 10), -rnd(6, 11), rnd(0.7, 1))];
  for (let i = 0; i < 2; i++) out.push(piece('bolt', x, y, away * rnd(3, 9) + rnd(-2, 2), -rnd(5, 10)));
  if (Math.random() < 0.5) out.push(piece(Math.random() < 0.5 ? 'wire' : 'servo', x, y, away * rnd(3, 8), -rnd(6, 10)));
  return out;
};

/** The spray at the burst: sparks, the green, the red. */
export const burstSpray = (state: GameState, x: number) => {
  for (let i = 0; i < 60; i++) { const a = rnd(0, Math.PI * 2), v = rnd(3, 14); state.particles.push({ pos: { x: x + rnd(-30, 30), y: GY - rnd(80, 260) }, vel: { x: Math.cos(a) * v, y: Math.sin(a) * v - 3 }, life: rnd(14, 30), color: i % 3 ? '#FDE047' : '#FFFFFF', size: rnd(2, 4), grav: 0.25 }); }
  for (let i = 0; i < 90; i++) { const a = rnd(-Math.PI, 0), v = rnd(3, 13), red = i % 3 === 0; state.particles.push({ pos: { x: x + rnd(-20, 20), y: GY - rnd(120, 220) }, vel: { x: Math.cos(a) * v, y: Math.sin(a) * v }, life: rnd(40, 70), color: red ? BLOOD[i % 3] : GREEN[1 + (i % 3)], size: rnd(3, 6), grav: 0.35 }); }
  for (let i = 0; i < 14; i++) state.particles.push({ pos: { x: x + rnd(-50, 50), y: GY - rnd(100, 260) }, vel: { x: rnd(-1.2, 1.2), y: rnd(-1.6, -0.4) }, life: rnd(80, 120), color: 'rgba(90, 90, 104, 0.5)', size: rnd(14, 26) });
};

/** The pieces in the air: falling, spinning, off the floor, the walls and the rig; bleeding; then still for good. */
export const tickPieces = (state: GameState, ps: Piece[], splats: Splat[]) => {
  let clatter = 0;
  for (const p of ps) {
    if (p.rest) continue;
    p.hitT++;
    p.vy += G; p.x += p.vx; p.y += p.vy; p.a += p.va;
    // (bleeding as it goes: the green, a bit of red)
    if (p.bleed > 0) { p.bleed--; if (p.bleed % 3 === 0) state.particles.push({ pos: { x: p.x, y: p.y }, vel: { x: p.vx * 0.2 + rnd(-1, 1), y: p.vy * 0.2 - 1 }, life: 30, color: Math.random() < 0.3 ? BLOOD[1] : GREEN[2], size: rnd(2, 4), grav: 0.35 }); }
    let hit = 0;
    if (p.x - p.r < L) { p.x = L + p.r; hit = Math.abs(p.vx); p.vx = Math.abs(p.vx) * 0.55; p.va = -p.va; }
    if (p.x + p.r > R) { p.x = R - p.r; hit = Math.abs(p.vx); p.vx = -Math.abs(p.vx) * 0.55; p.va = -p.va; }
    if (p.y - p.r < CEIL) { p.y = CEIL + p.r; hit = Math.max(hit, Math.abs(p.vy)); p.vy = Math.abs(p.vy) * 0.3; }
    if (p.y + p.r > GY) {
      p.y = GY - p.r; hit = Math.max(hit, Math.abs(p.vy));
      // (where the leaky ones come down: a splash that stays)
      if (p.bleed > 0 && Math.abs(p.vy) > 4 && splats.length < 60) splats.push({ x: p.x, r: rnd(10, 22) * p.s, red: Math.random() < 0.35 });
      p.vy = -Math.abs(p.vy) * 0.42; p.vx *= 0.72; p.va = p.va * 0.6 + p.vx * 0.02;
      if (Math.abs(p.vy) < 1.6) { p.vy = 0; p.vx *= 0.8; if (Math.abs(p.vx) < 0.25) { p.rest = true; p.vx = 0; } }
      // (on the floor: laid flat-ish, the way it fell)
      if (Math.abs(p.vy) < 3) p.va *= 0.7;
    }
    if (hit > 3 && p.hitT > 8) { p.hitT = 0; clatter++; for (let i = 0; i < 3; i++) state.particles.push({ pos: { x: p.x, y: p.y }, vel: { x: rnd(-3, 3), y: rnd(-3, -1) }, life: 8, color: '#FDE047', size: 2 }); }
  }
  // (the clatter: a couple a frame at most, metal on metal and the odd thud)
  if (clatter) { playSound(Math.random() < 0.6 ? 'clang' : 'thud', Math.min(0.7, 0.25 + clatter * 0.12), rnd(-2, 10)); }
};

/** The lot, where it lies (for her revisits: kept once the land's cleared), packed small; and back. */
export const packPieces = (ps: Piece[], splats: Splat[]) => JSON.stringify({
  p: ps.map(p => [p.k, Math.round(p.x), Math.round(p.rest ? p.y : GY - p.r), +p.a.toFixed(2), +p.s.toFixed(2), p.flip, +p.seed.toFixed(3)]),
  s: splats.map(s => [Math.round(s.x), +s.r.toFixed(1), s.red ? 1 : 0]),
});
export const unpackPieces = (str: string | null): { pieces: Piece[]; splats: Splat[] } | null => {
  if (!str) return null;
  try {
    const o = JSON.parse(str) as { p: [PieceKind, number, number, number, number, 1 | -1, number][]; s: [number, number, number][] };
    const pieces = o.p.filter(q => q[0] in RADIUS).map(([k, x, y, a, s, flip, seed]): Piece => ({ k, x, y, vx: 0, vy: 0, a, va: 0, r: RADIUS[k] * s, s, flip, seed, rest: true, hitT: 99, bleed: 0 }));
    return { pieces, splats: o.s.map(([x, r, red]) => ({ x, r, red: !!red })) };
  } catch { return null; }
};

/** The head piece (her words come out of it), or null. */
export const headPiece = (ps: Piece[]) => ps.find(p => p.k === 'head') ?? null;

/** The splashes under it all. */
export const drawSplats = (c: Ctx, splats: Splat[]) => {
  for (const s of splats) {
    const col = s.red ? BLOOD : [GREEN[0], GREEN[1], GREEN[2]];
    c.fillStyle = col[0]; c.beginPath(); c.ellipse(s.x, GY - 1, s.r, s.r * 0.18 + 1.5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = col[1]; c.beginPath(); c.ellipse(s.x - 1, GY - 1.5, s.r * 0.75, s.r * 0.12 + 1, 0, 0, Math.PI * 2); c.fill();
    px(c, s.x - s.r * 0.3, GY - 2, s.r * 0.3, 1, col[2]);
  }
};

/** Every piece, where it is, turned the way it's turned. */
export const drawPieces = (c: Ctx, ps: Piece[], t: number) => {
  for (const p of ps) {
    c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.scale(p.flip * p.s, p.s);
    DRAW[p.k](c, p, t);
    c.restore();
  }
};

// ---------------------------------------------------------------------------------------------------------------
// Each piece, drawn about its middle

/** A torn end: latex ragged, the foam, wires out of it, dripping. */
const stump = (c: Ctx, x: number, y: number, w: number) => {
  blob(c, x, y, w * 0.5, w * 0.6, FOAMR, true);
  for (let i = 0; i < 3; i++) hose(c, quad(x, y - 2 + i * 2, x - 5, y + 2 + i * 3, x - 8 - i * 2, y + 6 + i * 2, 4), 1.2, LINES[i], false);
  px(c, x - 2, y + 2, 3, 3, GREEN[2]);
};

const DRAW: Record<PieceKind, (c: Ctx, p: Piece, t: number) => void> = {
  head: (c, p, t) => {
    // (the crest's stub, the dome, the teeth, the jaw hanging; the neck torn off, the speaker gaffer-taped to it)
    stump(c, -26, 6, 18);
    // (her speaker: a grille box on its wires, tape over it)
    tube(c, -26, 10, -34, 22, 2, CHROME);
    c.fillStyle = LAT[0]; c.beginPath(); c.roundRect(-46, 18, 22, 16, 3); c.fill();
    px(c, -44, 20, 18, 12, '#0B0C10'); for (let k = 0; k < 3; k++) px(c, -43, 22 + k * 3.5, 16, 1.5, CHROME[2]);
    px(c, -47, 23, 24, 4, '#9CA3AF'); px(c, -47, 23, 24, 1, '#D1D5DB');
    const dome = () => { c.moveTo(-22, -6); c.quadraticCurveTo(0, -28, 46, -8); c.quadraticCurveTo(60, 2, 50, 10); c.lineTo(-18, 12); c.closePath(); };
    shapeShade(c, dome, LAT, 1.6, -2.2, 2.5, 16, 0);
    c.strokeStyle = GLOSS; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-12, -13); c.quadraticCurveTo(10, -23, 38, -11); c.stroke();
    px(c, 14, -20, 4, 2, SPEC);
    // (a crack, a dent; the rig's LED blinking its last)
    c.strokeStyle = LAT[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(22, -16); c.lineTo(18, -8); c.lineTo(24, -4); c.stroke();
    if (t % 40 < 6 && p.seed > 0.2) px(c, 0, -6, 3, 3, GREEN[4]);
    px(c, 2, 8, 46, 3, GUM[1]);
    for (let i = 0; i < 8; i++) { const tx = 4 + i * 5; px(c, tx, 10, 3, 5, TOOTH[2]); px(c, tx, 10, 2, 2, TOOTH[4]); }
    c.save(); c.translate(4, 14); c.rotate(0.35);
    shapeShade(c, () => c.roundRect(0, 4, 44, 8, 3), LAT, 0.8, -1.2, 2, 22, 8);
    for (let i = 0; i < 7; i++) px(c, 4 + i * 5, 1, 3, 4, TOOTH[2]);
    c.restore();
  },
  crest: c => {
    const crest = () => { c.moveTo(8, 4); c.quadraticCurveTo(-16, -40, -70, -28); c.quadraticCurveTo(-78, -6, -62, 12); c.quadraticCurveTo(-30, 16, 8, 10); c.closePath(); };
    c.translate(30, 0);
    shapeShade(c, crest, LAT, 2, -2.6, 2.5, -34, -6);
    for (let i = 0; i < 4; i++) { c.strokeStyle = LAT[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(2, 4); c.lineTo(-28 - i * 11, -26 + i * 9); c.stroke(); }
    for (let i = 0; i < 4; i++) { const kx = -28 - i * 11, ky = -28 + i * 10; blob(c, kx, ky, 3.5, 3, LAT); px(c, kx - 1, ky - 1, 2, 2, CHROME[3]); }
    // (bent where it came off: rivets torn through)
    px(c, 4, 2, 4, 4, CHROME[1]); px(c, 4, 8, 4, 2, FOAMR[2]);
  },
  plate: (c, p) => {
    const w = 14 + p.seed * 6, h = 10 + p.seed * 4;
    const shape = () => { c.moveTo(-w, -h * 0.6); c.lineTo(w * 0.6, -h); c.lineTo(w, h * 0.3); c.lineTo(w * 0.2, h); c.lineTo(-w * 0.8, h * 0.7); c.closePath(); };
    shapeShade(c, shape, LAT, 1.6, -2, 2, 0, 0);
    // (its ribs, lit along the top; its back's foam at the torn edge; a rivet)
    for (let i = 0; i < 2; i++) { c.strokeStyle = LAT[0]; c.lineWidth = 2; c.beginPath(); c.moveTo(-w * 0.7, -2 + i * 7); c.quadraticCurveTo(0, 2 + i * 7, w * 0.7, -4 + i * 7); c.stroke(); c.strokeStyle = LAT[4]; c.lineWidth = 1; c.beginPath(); c.moveTo(-w * 0.7, -3 + i * 7); c.quadraticCurveTo(0, 1 + i * 7, w * 0.7, -5 + i * 7); c.stroke(); }
    px(c, w * 0.2, h - 3, w * 0.6, 3, FOAMR[2]);
    px(c, -w * 0.5, -h * 0.4, 2, 2, CHROME[3]);
    if (p.seed > 0.6) { c.fillStyle = LAT[0]; c.beginPath(); c.ellipse(-2, 0, 5, 3.5, 0, 0, Math.PI * 2); c.fill(); }
  },
  arm: (c, p) => {
    // (upper arm, elbow, forearm, the hand, its four claws; torn off at the shoulder)
    stump(c, -36, -8, 14);
    tube(c, -36, -8, 0, 0, 10, LAT); tube(c, 0, 0, 30, 16, 8, LAT);
    tube(c, 3, 3, 16, 11, 2.5, CHROME);
    blob(c, 0, 0, 6, 6, CHROME); blob(c, 30, 16, 6, 5, LAT);
    for (let i = 0; i < 4; i++) {
      const an = 0.5 + (i - 1.5) * 0.32 + p.seed * 0.3, mx = 30 + Math.cos(an) * 14, my = 16 + Math.sin(an) * 14, bn = an + 0.5;
      const tx = mx + Math.cos(bn) * 11, ty = my + Math.sin(bn) * 11;
      tube(c, 30, 16, mx, my, 3.5, LAT); tube(c, mx, my, tx, ty, 3, LAT);
      tube(c, tx, ty, tx + Math.cos(bn + 0.4) * 6, ty + Math.sin(bn + 0.4) * 6, 2, CHROME);
    }
  },
  small: c => {
    stump(c, -18, 0, 10);
    tube(c, -18, 0, 4, 6, 6, LAT); tube(c, 4, 6, 14, -4, 5, LAT); blob(c, 4, 6, 3, 3, CHROME);
    for (let i = 0; i < 3; i++) tube(c, 14, -4, 20 + i * 2, -10 + i * 4, 2, LAT);
  },
  leg: c => {
    stump(c, -4, -36, 16);
    tube(c, -4, -36, -18, -4, 18, LAT); tube(c, -18, -4, 6, 18, 12, LAT);
    blob(c, -18, -4, 6, 6, CHROME); tube(c, -20, 2, 0, 20, 3, CHROME);
    tube(c, 6, 18, 0, 30, 10, LAT); tube(c, -8, 30, 16, 30, 8, LAT);
    for (let k = 0; k < 3; k++) { const cx = 18 + k * 2, cy = 28 + k * 2; c.fillStyle = CHROME[0]; c.beginPath(); c.moveTo(cx - 3, cy - 2); c.lineTo(cx + 8, cy + 3); c.lineTo(cx - 2, cy + 3); c.closePath(); c.fill(); px(c, cx, cy - 1, 4, 1, CHROME[3]); }
  },
  bone: c => {
    blob(c, 0, 0, 10, 7, LAT, true);
    c.fillStyle = LAT[0]; c.beginPath(); c.moveTo(-4, -4); c.lineTo(0, -15); c.lineTo(4, -4); c.closePath(); c.fill();
    px(c, -1, -12, 2, 2, LAT[3]);
    // (the chrome pin through it, snapped)
    px(c, -12, -1, 5, 3, CHROME[2]); px(c, 8, -1, 5, 3, CHROME[2]); px(c, -12, -1, 5, 1, CHROME[4]);
  },
  blade: c => {
    shapeShade(c, () => { c.moveTo(-16, -4); c.lineTo(10, -10); c.lineTo(18, 0); c.lineTo(10, 8); c.lineTo(-16, 4); c.closePath(); }, LAT, 0, -1.4, 1.5, 0, 0);
    c.strokeStyle = CHROME[3]; c.lineWidth = 1; c.beginPath(); c.moveTo(-10, -6); c.lineTo(10, -10); c.lineTo(17, 0); c.stroke();
    px(c, 8, -9, 2, 2, SPEC);
  },
  servo: (c, p, t) => {
    // (a chrome servo: its gear's teeth, its horn, its LED)
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; px(c, Math.cos(a) * 7 - 1.5, Math.sin(a) * 7 - 1.5, 3, 3, CHROME[1]); }
    blob(c, 0, 0, 6.5, 6.5, CHROME); blob(c, 0, 0, 2.5, 2.5, CHROME, false);
    px(c, -2, -9, 12, 3, CHROME[2]);
    if ((t + p.seed * 40) % 30 < 4) px(c, 3, 2, 2, 2, GREEN[4]);
    // (its leads, cut)
    hose(c, quad(-5, 4, -10, 10, -14, 8, 4), 1.2, LINES[Math.floor(p.seed * 3)], false);
  },
  wire: (c, p, t) => {
    const w = p.rest ? 0 : Math.sin(t * 0.4 + p.seed * 9) * 5;
    hose(c, quad(-16, 0, 0, w + 6, 16, -2, 8), 1.6, LINES[Math.floor(p.seed * 3)], false);
    px(c, 15, -3, 3, 2, '#FDE68A');
  },
  hose: (c, p, t) => {
    const w = p.rest ? 2 : Math.sin(t * 0.3 + p.seed * 7) * 6;
    const line = LINES[Math.floor(p.seed * 3)];
    hose(c, quad(-22, 0, 0, w + 4, 22, 0, 9), 3, line);
    px(c, 20, -3, 6, 6, CHROME[2]); px(c, 20, -3, 6, 1, CHROME[4]);
    px(c, -26, -2, 4, 4, FOAMR[1]);
  },
  pipe: c => {
    tube(c, -16, 0, 14, 0, 9, LAT);
    for (let k = 1; k < 4; k++) px(c, -16 + k * 8, -2, 1, 4, LAT[0]);
    blob(c, 16, 0, 6, 5, LAT); c.fillStyle = LAT[0]; c.beginPath(); c.ellipse(16, 0, 3, 2.4, 0, 0, Math.PI * 2); c.fill();
  },
  bolt: (c, p) => {
    px(c, -3, -3, 6, 6, CHROME[1]); px(c, -2, -2, 4, 4, CHROME[p.seed > 0.5 ? 3 : 2]); px(c, -2, -2, 2, 1, CHROME[4]);
  },
};
