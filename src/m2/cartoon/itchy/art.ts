// PUNCHY & KICKY's part of the park, painted (crude-but-clean first pass). The show's look: blood red, mustard,
// black, bone; fat ink; cartoon gore for decor (splats, drips, chalk outlines of a cat and a mouse on the path, bones,
// bandages, skull lamps). Far off, the sky by the hour, the hills and the CARTOON LAND WATER TOWER (monument.ts: bigger
// again). Behind the path, dimmed (scenery: none of it reads as somewhere to stand): the show's buildings with their
// murals, the gate's bone arch, the merch stand and its jumbotron (the cartoon itself, playing on a loop: the cat and
// the mouse smashing each other to death with hammers), PUNCHY & KICKY'S KILL-O-RAMA (the facade; its doors dark: the
// ride inside is shut off), the GENERIC-CO warehouse, PUNCHY'S BIG TOP, the blast range's scorched wall, the painted
// canyon's mesas (plywood flats on braces: it's a set), the live show's soundstage (drapes, the lighting grid, the APPLAUSE
// sign, the fly rail the fuse runs along), the STUPID DAD LIVE! gate at the end. On the play plane, bright and inked,
// what he stands on lit along its top: the path, the canyon's rim rocks, the set's crate steps, the pallet rack.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText, signW, type Look } from '../../signLetters';
import { box, mix, stamp, hash, onScreen, hour, dimmed, lit, toonSky, INK, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import { dadArt, poster } from '../bigkid/art';
import { GROUND, CANYON, HOLES, ROCKS, SET_STEPS, RACK, KILLORAMA, MERCH, EXIT_GATE, SIGNS, FUSES, LAWN, X, Y, x0 as SX0, x1 as SX1 } from './layout';
import { catHead, mouseHead, mallet } from './kindArt';

export const drawItchyBackdrop = (c: Ctx, state: GameState) => toonSky(c, state, MONUMENT_AT.itchy, { hill: '#D9A38A', near: '#A86A55' });

const LIP = '#FFFBEB';
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-pk-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;

// ---------------------------------------------------------------------------------------------------------------
// The show's lettering: fat, blocky, blood red banded down to dark, white-hot on top, inked, dripping

export const pkLetters = (size = 2, seed = 0, dim = false): Look => {
  const T = (col: string) => (dim ? dimmed(col) : col);
  return { sx: size, sy: size, bold: true, fill: [T('#FFFFFF'), T('#FCA5A5'), T('#DC2626'), T('#991B1B')], dither: true, ink: T(INK), shadow: T('#450A0A'), drop: 2, wobble: 2, seed, drip: { col: T('#B91C1C'), tip: T('#7F1D1D'), rate: 0.45, len: 7 } };
};
const small = (fill: string): Look => ({ sx: 1, sy: 1, bold: true, fill, ink: INK });

/** A splat of cartoon blood (decor: paint), its middle at (x, y). */
export const gore = (c: Ctx, x: number, y: number, r: number, seed: number, col = '#B91C1C') => {
  c.fillStyle = col;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 7; i++) { const a = hash(seed + i) * Math.PI * 2, d = r * (1 + hash(seed * 3 + i) * 0.9); c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, r * (0.18 + hash(seed + i * 5) * 0.3), 0, Math.PI * 2); c.fill(); }
  c.fillStyle = mix(col, '#FFFFFF', 0.45); c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.15, -0.5, 0, Math.PI * 2); c.fill();
};

/**
 * The show's sign standing at (x, feetY): a cream board with a ragged, dripping bottom edge (blood), inked, a red rim,
 * on two bandaged posts; a cleaver stuck in its top corner, a mallet leaning on a post. The first line big and red,
 * the rest small. Painted once for the hour.
 */
export const pkSign = (c: Ctx, x: number, feetY: number, lines: string[], board = '#B91C1C') => {
  const looks = lines.map((_, i) => (i ? small(i === lines.length - 1 && lines.length > 2 ? '#FACC15' : '#FFFFFF') : pkLetters(1, lines.join('').length)));
  const w = Math.max(120, ...lines.map((l, i) => signW(l, looks[i]) + 40)), h = lines.length * 14 + 20, tall = 112;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key(`sign-${lines.join('|')}-${board}`), -w / 2 - 36, -tall - h - 26, w + 72, tall + h + 32, g => {
    const T = (col: string) => hour(col, 0.12);
    // (the two posts, bandaged)
    for (const s of [-1, 1]) {
      const px = s * (w / 2 - 18);
      g.fillStyle = INK; g.fillRect(px - 6, -tall - 4, 12, tall + 4); g.fillStyle = T('#8B5A2B'); g.fillRect(px - 4, -tall - 2, 8, tall + 2);
      for (let y = -tall + 30; y < -10; y += 9) { g.fillStyle = T('#F5F0E1'); g.fillRect(px - 5, y, 10, 4); }
    }
    // (the mallet leaned on the left post)
    g.save(); g.translate(-w / 2 + 2, 0); mallet(g, 0, -2, 0.32, 54, 22); g.restore();
    // (the board: cream, a red rim; its bottom edge ragged with drips)
    const by = -tall - h, B = T(board);
    const path = () => {
      g.moveTo(-w / 2, by); g.lineTo(w / 2, by); g.lineTo(w / 2, by + h);
      for (let k = 10; k >= 0; k--) { const dx = w / 2 - (k === 10 ? 0 : (10 - k) * (w / 10)); const drip = hash(k * 3.3 + w) > 0.55 ? 6 + hash(k + h) * 9 : 0; g.lineTo(dx, by + h + (k % 2 ? 2 : 0)); if (drip) { g.lineTo(dx - 3, by + h + drip); g.arc(dx - 5, by + h + drip, 2.5, 0, Math.PI); g.lineTo(dx - 8, by + h); } }
      g.lineTo(-w / 2, by + h); g.closePath();
    };
    g.beginPath(); path(); g.fillStyle = B; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = T('#FEF3C7'); g.fillRect(-w / 2 + 6, by + 6, w - 12, h - 12);
    g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(-w / 2 + 6, by + 6, w - 12, h - 12);
    // (a splat in a corner, the cleaver stuck in the top)
    gore(g, w / 2 - 20, by + h - 16, 5, w);
    g.save(); g.translate(w / 2 - 26, by + 2); g.rotate(0.5);
    g.fillStyle = INK; g.fillRect(-2, -18, 18, 22); g.fillStyle = T('#D4D4D8'); g.fillRect(0, -16, 14, 18);
    g.fillStyle = INK; g.fillRect(4, -26, 6, 10); g.fillStyle = T('#7C2D12'); g.fillRect(5, -25, 4, 8);
    g.restore();
    // (the letters: the first line in the show's red on the cream, the rest on a red band each)
    let ly = by + 12;
    lines.forEach((l, i) => {
      if (i) { g.fillStyle = B; g.fillRect(-w / 2 + 10, ly - 3, w - 20, 12); }
      signText(g, l, 0, Math.round(ly + 7), looks[i]); ly += 14;
    });
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Behind: the show's buildings, the lamps

const WALLS = ['#FDE68A', '#FCA5A5', '#E7E5E4', '#FCD34D', '#D6D3D1'];
/** One of the show's buildings (seeded): a mustard or bone stucco block with a red-and-black striped awning, a
 *  mural of the cat and the mouse at it, splats, drips off the parapet. */
const building = (c: Ctx, x: number, seed: number) => {
  const w = 170 + Math.round(hash(seed) * 90), h = 180 + Math.round(hash(seed + 1) * 140);
  const wall = WALLS[seed % WALLS.length];
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, key(`bldg-${seed}`), -w / 2 - 10, -h - 30, w + 20, h + 34, g => {
    const W = dimmed(wall), K = dimmed(INK);
    g.fillStyle = K; g.fillRect(-w / 2 - 2, -h - 2, w + 4, h + 2); g.fillStyle = W; g.fillRect(-w / 2, -h, w, h);
    // (the parapet, blood dripping off it)
    g.fillStyle = K; g.fillRect(-w / 2 - 6, -h - 10, w + 12, 12); g.fillStyle = dimmed('#991B1B'); g.fillRect(-w / 2 - 4, -h - 8, w + 8, 8);
    for (let k = 0; k < 7; k++) { const dx = -w / 2 + hash(seed + k) * w, len = 8 + hash(seed * 2 + k) * 30; g.fillStyle = dimmed('#991B1B'); g.fillRect(dx, -h, 4, len); g.beginPath(); g.arc(dx + 2, -h + len, 3, 0, Math.PI * 2); g.fill(); }
    // (the mural: the cat and the mouse, mallets up at each other; a splat between)
    const my = -h * 0.55;
    g.save(); g.translate(-w * 0.2, my); g.scale(0.9, 0.9); catHead(g, 0, 0, 22, 0.1); g.restore();
    g.save(); g.translate(w * 0.22, my + 4); g.scale(-0.9, 0.9); mouseHead(g, 0, 0, 20, 0.1); g.restore();
    // (the mural dimmed down with the wall: scenery)
    g.fillStyle = 'rgba(142,134,180,0.32)'; g.beginPath(); g.arc(-w * 0.2, my, 34, 0, Math.PI * 2); g.arc(w * 0.22, my + 4, 32, 0, Math.PI * 2); g.fill();
    gore(g, 0, my - 4, 8, seed, dimmed('#B91C1C'));
    // (a striped awning over a door, a window)
    g.fillStyle = K; g.fillRect(-34, -84, 68, 84); g.fillStyle = dimmed('#1F2937'); g.fillRect(-32, -82, 64, 82);
    g.save(); g.beginPath(); g.rect(-46, -104, 92, 22); g.clip();
    for (let k = -46; k < 46; k += 12) { g.fillStyle = dimmed(k % 24 ? '#B91C1C' : '#18181B'); g.fillRect(k, -104, 6, 22); }
    g.restore();
    for (let k = -46; k < 46; k += 12) { g.fillStyle = dimmed('#B91C1C'); g.beginPath(); g.arc(k + 6, -82, 6, 0, Math.PI); g.fill(); }
    g.fillStyle = K; g.fillRect(w / 2 - 54, -h + 30, 36, 40); g.fillStyle = dimmed('#BAE6FD'); g.fillRect(w / 2 - 52, -h + 32, 32, 36);
  });
  c.restore();
};
/** A skull lamp on a bone post (a cartoon skull, glowing after dark). */
const LAMPS = [520, 1660, 2380, 3020, 4260, 5420, 6460, 7180, 8620, 9560];
const lampPost = (c: Ctx, x: number) => {
  box(c, x - 4, GY - 160, 8, 160, INK); box(c, x - 2, GY - 158, 4, 156, hour('#F5F0E1'));
  c.fillStyle = INK; for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 5, GY - 2, 6, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = hour('#F5F0E1'); for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 5, GY - 2, 4, 0, Math.PI * 2); c.fill(); }
  const on = lit(), skull = on ? '#FFEDD5' : hour('#F5F0E1');
  c.fillStyle = INK; c.beginPath(); c.arc(x, GY - 172, 15, 0, Math.PI * 2); c.fill(); c.fillRect(x - 9, GY - 166, 18, 14);
  c.fillStyle = skull; c.beginPath(); c.arc(x, GY - 172, 13, 0, Math.PI * 2); c.fill(); c.fillRect(x - 7, GY - 166, 14, 12);
  c.fillStyle = on ? '#F97316' : INK; c.beginPath(); c.arc(x - 5, GY - 172, 4, 0, Math.PI * 2); c.arc(x + 5, GY - 172, 4, 0, Math.PI * 2); c.fill();
  c.fillStyle = INK; for (let k = -6; k <= 4; k += 4) c.fillRect(x + k, GY - 158, 2, 5);
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces' buildings

/** The gate: two giant cartoon bones for pillars, a banner across them (PUNCHY & KICKY, dripping), the cat's head on
 *  one end and the mouse's on the other, bonking each other with mallets. Behind him; the banner's top dark. */
const boneArch = (c: Ctx, cx: number) => {
  const w = 440, top = Y(300);
  c.save(); c.translate(Math.round(cx), 0);
  stamp(c, key('arch'), -w / 2 - 70, top - 90, w + 140, GY - top + 94, g => {
    for (const s of [-1, 1]) {
      const px = s * w / 2;
      g.fillStyle = dimmed(INK); g.fillRect(px - 16, top + 10, 32, GY - top - 10);
      g.fillStyle = dimmed('#F5F0E1'); g.fillRect(px - 13, top + 12, 26, GY - top - 12);
      for (const [ky, kr] of [[top + 12, 1], [GY - 8, -1]] as [number, number][]) for (const k of [-1, 1]) { g.fillStyle = dimmed(INK); g.beginPath(); g.arc(px + k * 14, ky + kr * 4, 18, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#F5F0E1'); g.beginPath(); g.arc(px + k * 14, ky + kr * 4, 15, 0, Math.PI * 2); g.fill(); }
    }
    g.fillStyle = dimmed(INK); g.fillRect(-w / 2 - 20, top - 50, w + 40, 56); g.fillStyle = dimmed('#7F1D1D'); g.fillRect(-w / 2 - 18, top - 48, w + 36, 52);
    for (let k = 0; k < 12; k++) { const dx = -w / 2 + hash(k * 1.7) * w, len = 10 + hash(k * 2.3) * 24; g.fillStyle = dimmed('#7F1D1D'); g.fillRect(dx, top + 4, 5, len); g.beginPath(); g.arc(dx + 2.5, top + 4 + len, 3.5, 0, Math.PI * 2); g.fill(); }
    signText(g, 'PUNCHY & KICKY', 0, top - 20, pkLetters(2, 7, true));
    signText(g, 'THE CAT. THE MOUSE. THE MALLETS.', 0, top - 2, { sx: 1, sy: 1, bold: true, fill: dimmed('#FACC15'), ink: dimmed(INK) });
    g.save(); g.translate(-w / 2 - 30, top - 40); catHead(g, 0, 0, 32, 0.2); g.restore();
    g.save(); g.translate(w / 2 + 30, top - 40); g.scale(-1, 1); mouseHead(g, 0, 0, 30, 0.2); g.restore();
    // (dimmed over the heads: scenery)
    g.fillStyle = 'rgba(142,134,180,0.28)'; g.beginPath(); g.arc(-w / 2 - 30, top - 40, 46, 0, Math.PI * 2); g.arc(w / 2 + 30, top - 40, 46, 0, Math.PI * 2); g.fill();
  });
  c.restore();
};
/** The merch stand (a booth: a striped awning, shelves of plush heads, the safety cleavers, the splatter tees, foam
 *  mallets) and its jumbotron up on a truss, playing the cartoon. */
const merchStand = (c: Ctx) => {
  const xa = X(MERCH.a), w = X(MERCH.b) - xa, top = Y(150);
  c.save(); c.translate(xa, 0);
  stamp(c, key('merch'), -20, top - 70, w + 40, GY - top + 74, g => {
    const D = dimmed(INK);
    g.fillStyle = D; g.fillRect(-2, top, w + 4, GY - top); g.fillStyle = dimmed('#FEF3C7'); g.fillRect(0, top + 2, w, GY - top - 2);
    // (the awning)
    g.save(); g.beginPath(); g.rect(-14, top - 34, w + 28, 34); g.clip();
    for (let k = -14; k < w + 14; k += 16) { g.fillStyle = dimmed(k % 32 ? '#18181B' : '#B91C1C'); g.fillRect(k, top - 34, 8, 34); g.fillStyle = dimmed(k % 32 ? '#B91C1C' : '#18181B'); g.fillRect(k + 8, top - 34, 8, 34); }
    g.restore();
    for (let k = -14; k < w + 14; k += 16) { g.fillStyle = dimmed((k / 16) % 2 ? '#18181B' : '#B91C1C'); g.beginPath(); g.arc(k + 8, top, 8, 0, Math.PI); g.fill(); }
    g.fillStyle = D; g.fillRect(-14, top - 60, w + 28, 26); g.fillStyle = dimmed('#B91C1C'); g.fillRect(-12, top - 58, w + 24, 22);
    signText(g, 'PUNCHY & KICKY STUFF', w / 2, top - 42, { sx: 1, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink: D });
    // (the shelves: plush heads, toy cleavers on a pegboard, tees on hangers, foam mallets in a bin)
    for (let k = 0; k < 5; k++) { g.save(); g.translate(30 + k * 26, top + 28); (k % 2 ? mouseHead : catHead)(g, 0, 0, 9, 0); g.restore(); }
    g.fillStyle = dimmed('#A16207'); g.fillRect(14, top + 44, 140, 3);
    for (let k = 0; k < 5; k++) { g.fillStyle = D; g.fillRect(24 + k * 26, top + 58, 14, 18); g.fillStyle = dimmed('#D4D4D8'); g.fillRect(26 + k * 26, top + 60, 10, 12); g.fillStyle = dimmed('#7C2D12'); g.fillRect(29 + k * 26, top + 72, 4, 8); }
    signText(g, 'SAFETY CLEAVER', 88, top + 92, { sx: 1, sy: 1, fill: dimmed('#B91C1C') });
    signText(g, 'AGES 3 AND UP', 88, top + 102, { sx: 1, sy: 1, fill: dimmed('#1F2937') });
    for (let k = 0; k < 4; k++) {
      const tx = 180 + k * 34;
      g.fillStyle = D; g.fillRect(tx - 1, top + 14, 30, 34); g.fillStyle = dimmed('#FAFAFA'); g.fillRect(tx, top + 15, 28, 32);
      gore(g, tx + 14, top + 30, 5, k + 3, dimmed('#B91C1C'));
    }
    signText(g, 'SPLATTER TEES', 240, top + 62, { sx: 1, sy: 1, fill: dimmed('#B91C1C') });
    g.fillStyle = D; g.fillRect(186, top + 76, 120, 30); g.fillStyle = dimmed('#7F1D1D'); g.fillRect(188, top + 78, 116, 26);
    for (let k = 0; k < 6; k++) { g.save(); g.translate(196 + k * 18, top + 78); g.rotate(-0.2 + k * 0.08); g.fillStyle = dimmed('#FDE047'); g.fillRect(-3, -26, 6, 26); g.fillStyle = dimmed('#F97316'); g.fillRect(-9, -34, 18, 10); g.restore(); }
    signText(g, 'FOAM MALLETS', 246, top + 118, { sx: 1, sy: 1, fill: dimmed('#FFFFFF') });
    // (the counter)
    g.fillStyle = D; g.fillRect(-4, GY - 46, w + 8, 8); g.fillStyle = dimmed('#B91C1C'); g.fillRect(-2, GY - 44, w + 4, 4);
  });
  c.restore();
};
/** The jumbotron: a big CRT on a truss over the stand, playing PUNCHY & KICKY on a loop. Four bits, a title card
 *  between: the mouse flattens the cat's head with a mallet; the cat swings and the mouse ducks and he gets his own
 *  foot; an anvil on the cat; the cat with a lit stick of dynamite, BOOM, a skeleton. */
const LOOP = 200;
const jumbotron = (c: Ctx, state: GameState) => {
  const cx = X(MERCH.tv), w = 230, h = 150, top = Y(440), f = state.frame;
  // (the truss)
  for (const s of [-1, 1]) { box(c, cx + s * (w / 2 - 20) - 5, top + h, 10, Y(150) - top - h - 30, dimmed(INK)); }
  box(c, cx - w / 2 - 10, top - 10, w + 20, h + 20, INK); box(c, cx - w / 2 - 6, top - 6, w + 12, h + 12, hour('#27272A'));
  // (the picture)
  c.save(); c.beginPath(); c.rect(cx - w / 2, top, w, h); c.clip();
  const bit = Math.floor(f / LOOP) % 5, t = (f % LOOP) / LOOP;
  c.fillStyle = bit === 4 ? '#7F1D1D' : '#7DD3FC'; c.fillRect(cx - w / 2, top, w, h);
  if (bit !== 4) { c.fillStyle = '#86EFAC'; c.fillRect(cx - w / 2, top + h - 30, w, 30); c.fillStyle = '#FDE68A'; c.fillRect(cx - w / 2 + 20, top + 20, 50, 50); c.fillStyle = '#7DD3FC'; c.fillRect(cx - w / 2 + 44, top + 20, 2, 50); c.fillRect(cx - w / 2 + 20, top + 44, 50, 2); }
  const gy = top + h - 26;
  const cat = (x: number, y: number, sx = 1, sy = 1, a = 0) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(sx, sy); c.fillStyle = INK; c.fillRect(-8, -28, 16, 28); c.fillStyle = '#EA8A2E'; c.fillRect(-6, -26, 12, 24); catHead(c, 0, -38, 13, 0); c.restore(); };
  const mouse = (x: number, y: number, sx = 1, a = 0) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(sx, 1); c.fillStyle = INK; c.fillRect(-6, -20, 12, 20); c.fillStyle = '#A8A29E'; c.fillRect(-4, -18, 8, 16); c.fillStyle = '#DC2626'; c.fillRect(-6, -3, 12, 3); mouseHead(c, 0, -28, 10, 0); c.restore(); };
  if (bit === 4) {
    // (the title card: the name dripping, the two heads)
    signText(c, 'PUNCHY', cx, top + 56, pkLetters(2, 3));
    signText(c, '& KICKY', cx, top + 86, pkLetters(2, 5));
    catHead(c, cx - 80, top + 120, 16, 0.2);
    c.save(); c.translate(cx + 80, top + 120); c.scale(-1, 1); mouseHead(c, 0, 0, 15, 0.2); c.restore();
  } else if (bit === 0) {
    // (the mouse sneaks up, the mallet up, BONK: the cat's head flat as a plate, his eyes on springs)
    const sq = t > 0.55 ? 0.35 : 1;
    cat(cx + 30, gy, 1, sq);
    const mx = cx - 60 + Math.min(1, t * 2) * 50;
    mouse(mx, gy, 1);
    const a = t < 0.45 ? -0.4 : t < 0.55 ? -0.4 + (t - 0.45) * 30 : 2.6;
    mallet(c, mx + 6, gy - 22, a, 34, 16);
    if (t > 0.55) { for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx + 30 + s * 6, gy - 12); c.lineTo(cx + 30 + s * 10, gy - 34 - Math.sin(f * 0.6) * 4); c.stroke(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(cx + 30 + s * 10, gy - 36 - Math.sin(f * 0.6) * 4, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.fillRect(cx + 30 + s * 10 - 1, gy - 37 - Math.sin(f * 0.6) * 4, 3, 3); } gore(c, cx + 46, gy - 6, 5, 2); }
  } else if (bit === 1) {
    // (the cat swings at the mouse, the mouse ducks out of the way, the cat's foot gets it)
    const mx = cx + 40, ducked = t > 0.35 && t < 0.7;
    cat(cx - 30, gy, 1);
    mouse(mx, gy, -1, ducked ? 0 : 0);
    if (ducked) { c.fillStyle = '#7DD3FC'; c.fillRect(mx - 14, gy - 40, 28, 18); }
    const a = t < 0.3 ? -0.6 : Math.min(2.9, -0.6 + (t - 0.3) * 14);
    mallet(c, cx - 22, gy - 26, a, 34, 16);
    if (t > 0.55) { signText(c, 'YOWWW!', cx - 30, top + 30, pkLetters(1, 9)); gore(c, cx - 16, gy - 2, 6, 4); }
  } else if (bit === 2) {
    // (the mouse pulls a rope; an anvil comes down on the cat; he's an accordion)
    const ay = top - 40 + Math.min(1, t * 1.8) ** 2 * (h - 40);
    const sq = t > 0.56 ? 0.4 : 1;
    cat(cx + 20, gy, 1.1, sq);
    mouse(cx - 70, gy, 1);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - 64, gy - 22); c.lineTo(cx - 30, top); c.stroke();
    c.save(); c.translate(cx + 20, Math.min(ay, gy - 28 * sq)); c.scale(0.7, 0.7);
    c.fillStyle = INK; c.fillRect(-26, -30, 52, 30); c.fillStyle = '#52525B'; c.fillRect(-24, -28, 48, 26); c.restore();
    if (t > 0.56) { c.fillStyle = '#FFFFFF'; signText(c, 'SQUISH!', cx + 20, top + 30, pkLetters(1, 11)); }
  } else {
    // (the cat with a lit stick of dynamite, grinning; the fuse runs out; BOOM; a skeleton stands there and drops)
    if (t < 0.6) {
      cat(cx, gy, 1);
      c.fillStyle = '#DC2626'; c.fillRect(cx + 10, gy - 34, 6, 18);
      c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; c.beginPath(); c.arc(cx + 13, gy - 36 + t * 30, 4, 0, Math.PI * 2); c.fill();
      mouse(cx + 80, gy, -1);
    } else if (t < 0.7) {
      c.fillStyle = '#FFFBEB'; c.fillRect(cx - w / 2, top, w, h);
      signText(c, 'BOOM!', cx, top + h / 2, pkLetters(3, 13));
    } else {
      // (the skeleton, smoking, then a heap of bones)
      const k = t > 0.88 ? 1 : 0;
      c.strokeStyle = '#FAFAFA'; c.lineWidth = 3;
      if (!k) { c.beginPath(); c.moveTo(cx, gy); c.lineTo(cx, gy - 30); c.moveTo(cx - 8, gy - 24); c.lineTo(cx + 8, gy - 24); c.stroke(); c.fillStyle = '#FAFAFA'; c.beginPath(); c.arc(cx, gy - 38, 9, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.fillRect(cx - 4, gy - 40, 3, 3); c.fillRect(cx + 2, gy - 40, 3, 3); }
      else for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(cx - 14 + i * 7, gy - 2); c.lineTo(cx - 8 + i * 7, gy - 6); c.stroke(); }
      mouse(cx + 80, gy, -1);
      c.fillStyle = 'rgba(60,60,60,0.5)'; c.beginPath(); c.arc(cx, gy - 50 - t * 20, 12, 0, Math.PI * 2); c.fill();
    }
  }
  // (scan lines, the glass's sheen)
  c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = top; y < top + h; y += 3) c.fillRect(cx - w / 2, y, w, 1);
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(cx - w / 2, top); c.lineTo(cx - w / 2 + 70, top); c.lineTo(cx - w / 2, top + 90); c.closePath(); c.fill();
  c.restore();
  signText(c, 'UBX', cx + w / 2 - 22, top + h + 12, { sx: 1, sy: 1, bold: true, fill: '#FACC15', ink: INK });
};
/** PUNCHY & KICKY'S KILL-O-RAMA: the attraction's front, a red-and-black cartoon castle of a theater, the marquee
 *  across the top (bulbs chasing), blood down its front, the doors in the middle dark and chained (the ride inside's
 *  shut: nothing in there). On a later visit, CLOSED FOR CLEANUP hung on the chains. */
const killorama = (c: Ctx, state: GameState, closed: boolean) => {
  const xa = X(KILLORAMA.a), xb = X(KILLORAMA.b), w = xb - xa, top = Y(380), dx = X(KILLORAMA.doors) - xa;
  c.save(); c.translate(xa, 0);
  stamp(c, key(`kor-${closed ? 1 : 0}`), -20, top - 90, w + 40, GY - top + 94, g => {
    const D = dimmed(INK);
    g.fillStyle = D; g.fillRect(-2, top, w + 4, GY - top); g.fillStyle = dimmed('#7F1D1D'); g.fillRect(0, top + 2, w, GY - top - 2);
    // (the battlements, the towers at the ends (black, red flags))
    for (let x = 0; x < w; x += 40) { g.fillStyle = D; g.fillRect(x, top - 22, 24, 24); g.fillStyle = dimmed('#991B1B'); g.fillRect(x + 2, top - 20, 20, 20); }
    for (const tx of [0, w - 90]) { g.fillStyle = D; g.fillRect(tx, top - 80, 90, 80); g.fillStyle = dimmed('#18181B'); g.fillRect(tx + 3, top - 77, 84, 77); g.fillStyle = D; g.beginPath(); g.moveTo(tx - 6, top - 80); g.lineTo(tx + 45, top - 130); g.lineTo(tx + 96, top - 80); g.closePath(); g.fill(); g.fillStyle = dimmed('#B91C1C'); g.beginPath(); g.moveTo(tx, top - 82); g.lineTo(tx + 45, top - 124); g.lineTo(tx + 90, top - 82); g.closePath(); g.fill(); }
    // (blood running down the front from the battlements)
    for (let k = 0; k < 18; k++) { const bx = hash(k * 4.1) * w, len = 30 + hash(k * 2.9) * 120; g.fillStyle = dimmed('#450A0A'); g.fillRect(bx, top, 6, len); g.beginPath(); g.arc(bx + 3, top + len, 4, 0, Math.PI * 2); g.fill(); }
    // (the doors: a big arch, dark, chained shut)
    g.fillStyle = D; g.beginPath(); g.moveTo(dx - 90, GY); g.lineTo(dx - 90, GY - 150); g.quadraticCurveTo(dx, GY - 230, dx + 90, GY - 150); g.lineTo(dx + 90, GY); g.closePath(); g.fill();
    g.fillStyle = '#0B0B0F'; g.beginPath(); g.moveTo(dx - 84, GY); g.lineTo(dx - 84, GY - 148); g.quadraticCurveTo(dx, GY - 222, dx + 84, GY - 148); g.lineTo(dx + 84, GY); g.closePath(); g.fill();
    g.strokeStyle = dimmed('#71717A'); g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(dx - 84, GY - 110 + s * 20); g.quadraticCurveTo(dx, GY - 80 + s * 20, dx + 84, GY - 110 + s * 20); g.stroke(); }
    g.fillStyle = dimmed('#A1A1AA'); g.fillRect(dx - 10, GY - 104, 20, 22);
    if (closed) { g.fillStyle = D; g.fillRect(dx - 70, GY - 150, 140, 40); g.fillStyle = dimmed('#FDE047'); g.fillRect(dx - 68, GY - 148, 136, 36); signText(g, 'CLOSED FOR', dx, GY - 136, { sx: 1, sy: 1, bold: true, fill: dimmed(INK) }); signText(g, 'CLEANUP', dx, GY - 122, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') }); }
    // (the marquee across the top: on a black board, a border of bulbs)
    const mw = 560, mx = dx - mw / 2, my = top + 30;
    g.fillStyle = D; g.fillRect(mx - 4, my - 4, mw + 8, 96); g.fillStyle = dimmed('#18181B'); g.fillRect(mx, my, mw, 88);
    signText(g, "PUNCHY & KICKY'S", dx, my + 26, pkLetters(2, 17, true));
    signText(g, 'KILL-O-RAMA', dx, my + 56, pkLetters(3, 19, true));
    signText(g, closed ? "TODAY'S SHOW: CANCELED" : 'SHOWS EVERY 30 SECONDS! NOW 40% MORE KILLING!', dx, my + 80, { sx: 1, sy: 1, bold: true, fill: dimmed('#FACC15') });
  });
  c.restore();
  // (the marquee's bulbs, chasing)
  const mw = 560, mx = X(KILLORAMA.doors) - mw / 2, my = top + 30, f = state.frame;
  for (let k = 0; k < 36; k++) {
    const t = k / 36, on = ((k + (f >> 3)) % 3) === 0;
    const bx = t < 0.5 ? mx + t * 2 * mw : mx + (1 - (t - 0.5) * 2) * mw, by = t < 0.5 ? my - 6 : my + 92;
    box(c, bx - 2, by - 2, 4, 4, on && !closed ? '#FDE68A' : dimmed('#78716C'));
  }
};
/** The GENERIC-CO warehouse behind the dock: corrugated, a loading door, the slogan. */
const warehouse = (c: Ctx) => {
  const xa = X(4280), w = 1080, top = Y(320);
  c.save(); c.translate(xa, 0);
  stamp(c, key('warehouse'), -6, top - 50, w + 12, GY - top + 54, g => {
    const D = dimmed(INK);
    g.fillStyle = D; g.fillRect(-2, top, w + 4, GY - top); g.fillStyle = dimmed('#A8A29E'); g.fillRect(0, top + 2, w, GY - top - 2);
    for (let x = 0; x < w; x += 10) { g.fillStyle = dimmed(x % 20 ? '#D6D3D1' : '#8F8A85'); g.fillRect(x, top + 2, 5, GY - top - 2); }
    g.fillStyle = D; g.fillRect(-10, top - 14, w + 20, 16); g.fillStyle = dimmed('#57534E'); g.fillRect(-8, top - 12, w + 16, 12);
    g.fillStyle = D; g.fillRect(w / 2 - 260, top + 20, 520, 50); g.fillStyle = dimmed('#FACC15'); g.fillRect(w / 2 - 256, top + 24, 512, 42);
    signText(g, 'GENERIC-CO', w / 2, top + 46, { sx: 2, sy: 2, bold: true, stencil: true, fill: dimmed('#1F2937') });
    signText(g, 'WE MAKE EVERYTHING. BADLY.', w / 2, top + 62, { sx: 1, sy: 1, fill: dimmed('#7F1D1D') });
    for (const dx of [140, 820]) { g.fillStyle = D; g.fillRect(dx, GY - 150, 150, 150); g.fillStyle = dimmed('#3F3F46'); g.fillRect(dx + 3, GY - 147, 144, 147); for (let y = GY - 145; y < GY; y += 8) { g.fillStyle = dimmed('#52525B'); g.fillRect(dx + 3, y, 144, 3); } }
    // (crates stacked against it, a forklift's forks)
    for (const [cx, cy, s] of [[320, 0, 60], [380, 0, 60], [350, 60, 60], [640, 0, 70], [960, 0, 50]] as [number, number, number][]) { g.fillStyle = D; g.fillRect(cx, GY - cy - s, s, s); g.fillStyle = dimmed('#C8963E'); g.fillRect(cx + 2, GY - cy - s + 2, s - 4, s - 4); signText(g, 'GC', cx + s / 2, GY - cy - s / 2 + 3, { sx: 1, sy: 1, stencil: true, fill: dimmed('#1F2937') }); }
  });
  c.restore();
};
/** The pallet rack (one shelf up top lit: stand on it; crates on the lower shelves: scenery). */
const rack = (c: Ctx) => {
  const [a, b, h] = RACK, xa = X(a), xb = X(b), top = Y(h);
  for (const px of [xa, xb - 8]) { box(c, px, top, 8, GY - top, INK); box(c, px + 2, top + 2, 4, GY - top - 2, hour('#2563EB')); }
  box(c, xa, top + 80, xb - xa, 6, dimmed('#F97316'));
  for (let k = 0; k < 3; k++) { box(c, xa + 12 + k * 36, top + 40, 30, 40, dimmed(INK)); box(c, xa + 14 + k * 36, top + 42, 26, 36, dimmed('#C8963E')); }
  box(c, xa - 4, top, xb - xa + 8, 10, INK); box(c, xa - 2, top + 2, xb - xa + 4, 6, hour('#F97316'));
  box(c, xa - 2, top, xb - xa + 4, 2, LIP);
};
/** PUNCHY'S BIG TOP: a circus tent behind the cannon row (red and mustard stripes, flags), a poster of Punchy fired
 *  out of the cannon into a brick wall. */
const bigTop = (c: Ctx) => {
  const cx = X(5900), w = 900, h = 300;
  c.save(); c.translate(cx, 0);
  stamp(c, key('bigtop'), -w / 2 - 10, GY - h - 80, w + 20, h + 84, g => {
    const D = dimmed(INK);
    g.fillStyle = D; g.beginPath(); g.moveTo(-w / 2, GY); g.lineTo(-w / 2 + 60, GY - h * 0.55); g.lineTo(0, GY - h - 40); g.lineTo(w / 2 - 60, GY - h * 0.55); g.lineTo(w / 2, GY); g.closePath(); g.fill();
    g.save(); g.beginPath(); g.moveTo(-w / 2 + 3, GY); g.lineTo(-w / 2 + 62, GY - h * 0.55 + 2); g.lineTo(0, GY - h - 36); g.lineTo(w / 2 - 62, GY - h * 0.55 + 2); g.lineTo(w / 2 - 3, GY); g.closePath(); g.clip();
    for (let k = -12; k < 12; k++) { g.fillStyle = dimmed(k % 2 ? '#B91C1C' : '#FACC15'); g.beginPath(); g.moveTo(0, GY - h - 40); g.lineTo(k * 60, GY); g.lineTo(k * 60 + 60, GY); g.closePath(); g.fill(); }
    g.restore();
    g.fillStyle = D; g.fillRect(-2, GY - h - 80, 4, 44); g.fillStyle = dimmed('#B91C1C'); g.beginPath(); g.moveTo(2, GY - h - 80); g.lineTo(30, GY - h - 72); g.lineTo(2, GY - h - 64); g.closePath(); g.fill();
    g.fillStyle = D; g.fillRect(-180, GY - h * 0.5 - 20, 360, 44); g.fillStyle = dimmed('#18181B'); g.fillRect(-176, GY - h * 0.5 - 16, 352, 36);
    signText(g, "PUNCHY'S BIG TOP", 0, GY - h * 0.5 + 6, pkLetters(2, 23, true));
    // (the poster: Punchy splattered on a brick wall)
    g.fillStyle = D; g.fillRect(-380, GY - 190, 110, 140); g.fillStyle = dimmed('#FDE68A'); g.fillRect(-377, GY - 187, 104, 134);
    for (let y = GY - 180; y < GY - 100; y += 10) for (let x = -370 + ((y / 10) % 2) * 10; x < -280; x += 20) { g.fillStyle = dimmed('#B45309'); g.fillRect(x, y, 18, 8); }
    g.save(); g.translate(-325, GY - 140); g.rotate(0.3); g.scale(1.2, 0.6); catHead(g, 0, 0, 20, 0); g.restore();
    gore(g, -325, GY - 140, 12, 3, dimmed('#B91C1C'));
    signText(g, 'HUMAN', -325, GY - 82, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') });
    signText(g, 'CANNONBALL!', -325, GY - 70, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') });
    g.fillStyle = 'rgba(142,134,180,0.3)'; g.fillRect(-380, GY - 190, 110, 140);
  });
  c.restore();
};
/** The blast range's back wall (concrete, scorched black in rings, chunks out of it). */
const blastWall = (c: Ctx) => {
  const xa = X(6640), w = 560, top = Y(220);
  c.save(); c.translate(xa, 0);
  stamp(c, key('blastwall'), -6, top - 40, w + 12, GY - top + 44, g => {
    const D = dimmed(INK);
    g.fillStyle = D; g.fillRect(-2, top, w + 4, GY - top); g.fillStyle = dimmed('#A8A29E'); g.fillRect(0, top + 2, w, GY - top - 2);
    for (let x = 0; x < w; x += 70) { g.fillStyle = dimmed('#8F8A85'); g.fillRect(x, top + 2, 2, GY - top - 2); }
    for (let k = 0; k < 4; k++) { const sx = w - 60 - k * 18, sy = GY - 50; g.fillStyle = `rgba(20,16,12,${0.25 - k * 0.04})`; g.beginPath(); g.arc(sx, sy, 60 + k * 30, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = D; g.fillRect(40, top + 20, 220, 34); g.fillStyle = dimmed('#FACC15'); g.fillRect(42, top + 22, 216, 30);
    for (let x = 42; x < 258; x += 20) { g.fillStyle = dimmed('#18181B'); g.beginPath(); g.moveTo(x, top + 22); g.lineTo(x + 10, top + 22); g.lineTo(x, top + 32); g.closePath(); g.fill(); }
    signText(g, 'KICKY\'S BLAST RANGE', 150, top + 44, { sx: 1, sy: 1, bold: true, fill: dimmed('#7F1D1D') });
  });
  c.restore();
};
/** The painted canyon: plywood flats of red mesas and buttes (braces showing at their edges: a set), a painted sky
 *  band; down in the gorge, layered rock walls going down into the dark. */
const canyonSet = (c: Ctx, state: GameState) => {
  const xa = X(CANYON[0] - 300), w = X(CANYON[1] + 300) - xa;
  c.save(); c.translate(xa, 0);
  stamp(c, key('canyonset'), -10, Y(360), w + 20, 380, g => {
    // (the flats: three rows of mesas, back to front, each on its braces)
    const rows: [number, string, number][] = [[300, '#E8A87C', 0.6], [220, '#D97745', 0.75], [150, '#B4532A', 0.9]];
    rows.forEach(([hh, col, k], ri) => {
      g.fillStyle = dimmed(INK); g.beginPath(); g.moveTo(0, GY);
      for (let x = 0; x <= w; x += 40) { const m = hash(Math.floor(x / 160) + ri * 13); const top = m > 0.55 ? hh : hh * (0.45 + hash(x * 0.3 + ri) * 0.15); g.lineTo(x, GY - top * k - 4); }
      g.lineTo(w, GY); g.closePath(); g.fill();
      g.fillStyle = dimmed(col); g.beginPath(); g.moveTo(0, GY);
      for (let x = 0; x <= w; x += 40) { const m = hash(Math.floor(x / 160) + ri * 13); const top = m > 0.55 ? hh : hh * (0.45 + hash(x * 0.3 + ri) * 0.15); g.lineTo(x, GY - top * k); }
      g.lineTo(w, GY); g.closePath(); g.fill();
      for (let x = 20; x < w; x += 46) { g.fillStyle = dimmed(mix(col, INK, 0.2)); g.fillRect(x, GY - hh * k * 0.5, 3, hh * k * 0.5); }
    });
    // (a brace behind the front flat, a sandbag on it: it's a set)
    for (const bx of [80, w - 120]) { g.strokeStyle = dimmed('#8B5A2B'); g.lineWidth = 5; g.beginPath(); g.moveTo(bx, GY - 130); g.lineTo(bx + 60, GY); g.stroke(); g.fillStyle = dimmed('#C8B48A'); g.fillRect(bx + 50, GY - 14, 26, 14); }
  });
  c.restore();
  // (the gorge: layered rock walls down into the dark; a little puff of dust way down there now and then)
  const a = X(CANYON[0]), b = X(CANYON[1]);
  const l = Math.max(a, state.camera.x - 40), r = Math.min(b, state.camera.x + 840);
  if (r > l) {
    box(c, l, GY, r - l, 400, hour('#3B1306'));
    const bands = ['#9A3412', '#7C2D12', '#5B2009', '#3B1306'];
    bands.forEach((col, i) => { box(c, l, GY + 6 + i * 30, r - l, 30, hour(col)); });
    for (const [ex, s] of [[a, 1], [b, -1]] as [number, number][]) {
      if (!onScreen(state, ex - 60, ex + 60)) continue;
      c.fillStyle = INK; c.beginPath(); c.moveTo(ex, GY); c.lineTo(ex + s * 18, GY + 120); c.lineTo(ex + s * 6, GY + 260); c.lineTo(ex - s * 6, GY + 260); c.lineTo(ex - s * 6, GY); c.closePath(); c.fill();
      c.fillStyle = hour('#B4532A'); c.beginPath(); c.moveTo(ex - s * 2, GY + 2); c.lineTo(ex + s * 14, GY + 120); c.lineTo(ex + s * 2, GY + 260); c.lineTo(ex - s * 6, GY + 260); c.lineTo(ex - s * 6, GY + 2); c.closePath(); c.fill();
    }
  }
};
/** The canyon's rim rocks and the set's crate steps (solid, lit along the top). */
const steps = (c: Ctx, state: GameState) => {
  for (const [a, b, h] of ROCKS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onScreen(state, xa, xb)) continue;
    c.fillStyle = INK; c.beginPath(); c.moveTo(xa - 4, GY); c.lineTo(xa, top + 8); c.lineTo(xa + 10, top); c.lineTo(xb - 8, top); c.lineTo(xb, top + 10); c.lineTo(xb + 4, GY); c.closePath(); c.fill();
    c.fillStyle = hour('#C2410C'); c.beginPath(); c.moveTo(xa - 1, GY); c.lineTo(xa + 3, top + 9); c.lineTo(xa + 11, top + 3); c.lineTo(xb - 9, top + 3); c.lineTo(xb - 3, top + 11); c.lineTo(xb + 1, GY); c.closePath(); c.fill();
    for (let y = top + 20; y < GY; y += 22) box(c, xa + 4, y, xb - xa - 8, 3, hour('#9A3412'));
    box(c, xa + 8, top, xb - xa - 16, 2, LIP);
  }
  for (const [a, b, h] of SET_STEPS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onScreen(state, xa, xb)) continue;
    box(c, xa, top, xb - xa, h, INK); box(c, xa + 2, top + 2, xb - xa - 4, h - 3, hour('#27272A'));
    signText(c, 'STAGE 9', (xa + xb) / 2, top + 22, { sx: 1, sy: 1, stencil: true, fill: hour('#D4D4D8') });
    signText(c, 'P&K LIVE', (xa + xb) / 2, top + 36, { sx: 1, sy: 1, stencil: true, fill: hour('#DC2626') });
    for (let y = top + 50; y < GY - 6; y += 30) box(c, xa + 4, y, xb - xa - 8, 2, hour('#3F3F46'));
    box(c, xa, top, xb - xa, 2, LIP);
  }
};
/** The live show's soundstage: black drapes, the lighting grid and its cans, the APPLAUSE sign, the fly rail (the
 *  fuse runs along it); the set flat of the cat and mouse's house; the floor of portable holes. */
const soundstage = (c: Ctx, state: GameState) => {
  const xa = X(8700), w = X(9760) - xa;
  c.save(); c.translate(xa, 0);
  stamp(c, key('stage'), -10, Y(470), w + 20, 474, g => {
    const D = dimmed(INK);
    g.fillStyle = dimmed('#18181B'); g.fillRect(0, Y(460), w, 460);
    for (let x = 0; x < w; x += 24) { g.fillStyle = dimmed(x % 48 ? '#27272A' : '#0F0F12'); g.fillRect(x, Y(460), 12, 460); }
    // (the house flat: a crooked cartoon house front, a door, a window, a mousehole at the bottom)
    const hx = 330, hw = 300;
    g.fillStyle = D; g.fillRect(hx - 2, Y(280), hw + 4, 280); g.fillStyle = dimmed('#FDE68A'); g.fillRect(hx, Y(278), hw, 278);
    g.fillStyle = D; g.beginPath(); g.moveTo(hx - 20, Y(278)); g.lineTo(hx + hw / 2, Y(370)); g.lineTo(hx + hw + 20, Y(278)); g.closePath(); g.fill();
    g.fillStyle = dimmed('#B91C1C'); g.beginPath(); g.moveTo(hx - 12, Y(282)); g.lineTo(hx + hw / 2, Y(364)); g.lineTo(hx + hw + 12, Y(282)); g.closePath(); g.fill();
    g.fillStyle = D; g.fillRect(hx + 40, Y(150), 70, 150); g.fillStyle = dimmed('#7C2D12'); g.fillRect(hx + 43, Y(147), 64, 147);
    g.fillStyle = D; g.fillRect(hx + 170, Y(220), 90, 70); g.fillStyle = dimmed('#BAE6FD'); g.fillRect(hx + 173, Y(217), 84, 64);
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(hx + 220, GY, 20, 26, 0, Math.PI, 0); g.fill();
    gore(g, hx + 120, Y(200), 14, 9, dimmed('#B91C1C'));
    // (the braces behind the flat's edge)
    g.strokeStyle = dimmed('#8B5A2B'); g.lineWidth = 4; g.beginPath(); g.moveTo(hx + hw, Y(200)); g.lineTo(hx + hw + 50, GY); g.stroke();
    // (the APPLAUSE sign up in the grid)
    g.fillStyle = D; g.fillRect(560, Y(440), 150, 34); g.fillStyle = dimmed('#7F1D1D'); g.fillRect(563, Y(437), 144, 28);
    // (the lighting grid: a pipe, cans hung off it)
    g.fillStyle = D; g.fillRect(0, Y(400), w, 6);
    for (let x = 30; x < w; x += 90) { g.fillStyle = D; g.fillRect(x, Y(394), 4, 10); g.fillRect(x - 8, Y(384), 20, 18); g.fillStyle = dimmed('#3F3F46'); g.fillRect(x - 6, Y(382), 16, 14); }
  });
  c.restore();
  // (the APPLAUSE sign, lit (blinking))
  const ax = xa + 635, on = (state.frame >> 5) % 2 === 0;
  signText(c, 'APPLAUSE', ax, Y(418), { sx: 1, sy: 2, bold: true, fill: on ? '#FECACA' : dimmed('#7F1D1D'), ink: INK, glow: on ? '#F87171' : undefined });
  // (the fly rail the set's fuse runs along: a steel pipe; a line down from it to the far tower's foot)
  const fz = FUSES[1], rail = Y(fz.pts[0][1]);
  box(c, X(fz.pts[1][0]) - 20, rail + 3, X(fz.pts[0][0]) - X(fz.pts[1][0]) + 60, 7, INK); box(c, X(fz.pts[1][0]) - 18, rail + 4, X(fz.pts[0][0]) - X(fz.pts[1][0]) + 56, 4, hour('#71717A'));
  for (const rx of [fz.pts[1][0] - 10, fz.pts[0][0] + 30]) box(c, X(rx), Y(460), 4, 460 - fz.pts[0][1] - 3, dimmed(INK));
};
/** The floor of portable holes: black, a few dozen of them laid over each other, sheen on their rims. */
const holeFloor = (c: Ctx, state: GameState) => {
  const a = X(HOLES[0]), b = X(HOLES[1]);
  const l = Math.max(a, state.camera.x - 40), r = Math.min(b, state.camera.x + 840);
  if (r <= l) return;
  box(c, l, GY - 2, r - l, 400, '#050505');
  for (let x = a + 30; x < b - 20; x += 46) {
    if (x < l - 50 || x > r + 50) continue;
    const ry = 8 + hash(x) * 4, w = 40 + hash(x * 2) * 14;
    c.strokeStyle = 'rgba(150,150,200,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, GY + 1, w / 2, ry, 0, Math.PI * 1.05, Math.PI * 1.8); c.stroke();
  }
  // (the stage floor's lip either side, the boards ending ragged into the black)
  for (const [ex, s] of [[a, 1], [b, -1]] as [number, number][]) { if (!onScreen(state, ex - 30, ex + 30)) continue; c.fillStyle = '#050505'; c.beginPath(); c.ellipse(ex + s * 6, GY + 1, 18, 7, 0, 0, Math.PI * 2); c.fill(); }
};
/** The STUPID DAD LIVE! gate at the end: a big arch with the show's dad on it, THE AMPHITHEATER >. */
const exitGate = (c: Ctx) => {
  const cx = X(EXIT_GATE), w = 300, top = Y(330);
  c.save(); c.translate(cx, 0);
  stamp(c, key('exitgate'), -w / 2 - 30, top - 120, w + 60, GY - top + 124, g => {
    const D = dimmed(INK);
    for (const s of [-1, 1]) { g.fillStyle = D; g.fillRect(s * w / 2 - 20, top, 40, GY - top); g.fillStyle = dimmed('#1E3A8A'); g.fillRect(s * w / 2 - 17, top + 3, 34, GY - top - 3); for (let y = top + 20; y < GY; y += 40) { g.fillStyle = dimmed('#FDE047'); g.fillRect(s * w / 2 - 17, y, 34, 6); } }
    g.fillStyle = D; g.fillRect(-w / 2 - 30, top - 110, w + 60, 112); g.fillStyle = dimmed('#7C3AED'); g.fillRect(-w / 2 - 27, top - 107, w + 54, 106);
    g.save(); g.beginPath(); g.rect(-w / 2 - 27, top - 107, w + 54, 106); g.clip(); dadArt(g, -w / 2 + 40, top + 2, 1.15, 0.18, '#7C3AED'); g.restore();
    signText(g, 'STUPID DAD', 50, top - 80, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047'), dimmed('#F59E0B')], ink: D, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'LIVE!', 50, top - 50, { sx: 3, sy: 3, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FB7185'), dimmed('#DC2626')], ink: D, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'THE AMPHITHEATER >', 50, top - 16, { sx: 1, sy: 1, bold: true, fill: dimmed('#A3E635'), ink: D });
  });
  c.restore();
};
/** PUNCHY & KICKY's posters (the cartoon's: the two of them, mallets up; AS SEEN ON STUPID DAD!), on the buildings'
 *  walls, and STUPID DAD's own (the live show's) toward the end. */
const pkPoster = (c: Ctx, x: number, y: number) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, key('pkposter'), -60, -150, 120, 156, g => {
    const T = (col: string) => dimmed(col);
    g.fillStyle = T(INK); g.fillRect(-52, -142, 104, 142); g.fillStyle = T('#FDE68A'); g.fillRect(-50, -140, 100, 138);
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.fillStyle = T('#FCA5A5'); g.beginPath(); g.moveTo(0, -70); g.lineTo(Math.cos(a) * 80, -70 + Math.sin(a) * 80); g.lineTo(Math.cos(a + 0.3) * 80, -70 + Math.sin(a + 0.3) * 80); g.closePath(); g.fill(); }
    g.save(); g.beginPath(); g.rect(-50, -140, 100, 138); g.clip();
    g.save(); g.translate(-20, -64); catHead(g, 0, 0, 20, 0.2); g.restore();
    g.save(); g.translate(22, -58); g.scale(-1, 1); mouseHead(g, 0, 0, 17, 0.2); g.restore();
    gore(g, 2, -80, 6, 5);
    g.restore();
    g.fillStyle = 'rgba(142,134,180,0.25)'; g.fillRect(-50, -140, 100, 138);
    signText(g, 'PUNCHY & KICKY', 0, -122, { sx: 1, sy: 1, bold: true, fill: T('#B91C1C'), ink: T(INK) });
    g.fillStyle = T('#1E3A8A'); g.fillRect(-50, -30, 100, 28);
    signText(g, 'AS SEEN ON', 0, -20, { sx: 1, sy: 1, fill: T('#FFFFFF') });
    signText(g, 'STUPID DAD!', 0, -8, { sx: 1, sy: 1, bold: true, fill: T('#FDE047') });
  });
  c.restore();
};
const PK_POSTERS = [130, 980, 1560, 2300, 5350, 7110];

/** The ground: a cream path with blood-red paint along its edge, splats, a chalk outline of a cat and of a mouse
 *  here and there (the show's joke), painted bones; the lit lip along its top; the lawn's grass. */
const ground = (c: Ctx, state: GameState) => {
  for (const [a, b] of GROUND) {
    const l = Math.max(X(a), state.camera.x - 60), r = Math.min(X(b), state.camera.x + 860);
    if (r <= l) continue;
    box(c, l, GY, r - l, 260, hour('#57423A'));
    box(c, l, GY + 18, r - l, 8, hour('#3F2E28'));
    box(c, l, GY, r - l, 16, hour('#E7DCC8'));
    for (let x = Math.floor(l / 80) * 80; x < r; x += 80) { box(c, x, GY + 1, 1, 15, hour('#C9BBA2')); const h = hash(x * 0.07); if (h > 0.62) gore(c, x + h * 50, GY + 8, 3 + h * 3, x, hour('#B91C1C')); }
    // (the chalk outlines: a cat, a mouse)
    for (let x = Math.floor(l / 700) * 700 + 300; x < r; x += 700) {
      if (x < X(a) + 40 || x > X(b) - 60) continue;
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1.2; c.beginPath();
      if ((x / 700) % 2) { c.ellipse(x, GY + 8, 16, 4, 0, 0, Math.PI * 2); c.moveTo(x + 18, GY + 7); c.arc(x + 24, GY + 7, 5, Math.PI, Math.PI * 3); c.moveTo(x - 16, GY + 8); c.quadraticCurveTo(x - 30, GY + 4, x - 34, GY + 10); }
      else { c.ellipse(x, GY + 8, 10, 3, 0, 0, Math.PI * 2); c.moveTo(x + 13, GY + 8); c.arc(x + 17, GY + 8, 4, Math.PI, Math.PI * 3); c.moveTo(x + 18, GY + 4); c.arc(x + 20, GY + 3, 3, 0, Math.PI * 2); }
      c.stroke();
    }
    box(c, l, GY + 16, r - l, 2, INK);
    box(c, l, GY, r - l, 3, LIP);
  }
  // (the lawn: a strip of cartoon grass along the path, tufts)
  const la = X(LAWN[0]), lb = X(LAWN[1]);
  if (onScreen(state, la, lb)) {
    box(c, la, GY - 4, lb - la, 6, hour('#16A34A')); box(c, la, GY - 4, lb - la, 2, hour('#4ADE80'));
    for (let x = la + 6; x < lb; x += 14) { c.fillStyle = hour('#15803D'); c.beginPath(); c.moveTo(x, GY - 2); c.lineTo(x + 3, GY - 10 - hash(x) * 4); c.lineTo(x + 6, GY - 2); c.closePath(); c.fill(); }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawItchyBack = (c: Ctx, state: GameState, revisit: boolean) => {
  const cam = state.camera.x;
  // (the show's buildings behind, every so often, seeded; none behind the set pieces with their own)
  const BUSY: [number, number][] = [[200, 640], [MERCH.a - 80, MERCH.b + 80], [KILLORAMA.a - 120, KILLORAMA.b + 120], [4200, 5450], [5400, 6400], [6560, 7260], [7100, 8600], [8640, 9800], [EXIT_GATE - 220, 10200]];
  for (let k = Math.floor((cam - SX0 - 300) / 360); k * 360 + SX0 < cam + 1100; k++) {
    if (k < 0 || k * 360 > SX1 - SX0) continue;
    const rx = k * 360 + 140 + (hash(k * 4.7) - 0.5) * 60;
    if (BUSY.some(([a, b]) => rx > a && rx < b)) continue;
    building(c, X(rx), k * 5 + 3);
  }
  for (const px of PK_POSTERS) if (onScreen(state, X(px) - 60, X(px) + 60)) pkPoster(c, X(px), Y(30));
  if (onScreen(state, X(420) - 300, X(420) + 300)) boneArch(c, X(420));
  if (onScreen(state, X(MERCH.a) - 60, X(MERCH.b) + 60)) { merchStand(c); jumbotron(c, state); }
  if (onScreen(state, X(KILLORAMA.a) - 30, X(KILLORAMA.b) + 30)) killorama(c, state, revisit);
  if (onScreen(state, X(4280) - 20, X(5360) + 20)) warehouse(c);
  if (onScreen(state, X(5450), X(6350))) bigTop(c);
  if (onScreen(state, X(6640), X(7200))) blastWall(c);
  if (onScreen(state, X(CANYON[0] - 300), X(CANYON[1] + 300))) canyonSet(c, state);
  if (onScreen(state, X(8700), X(9760))) soundstage(c, state);
  if (onScreen(state, X(EXIT_GATE) - 200, X(EXIT_GATE) + 200)) exitGate(c);
  // (STUPID DAD's own, taped up on the soundstage's drapes: the live show's next)
  for (const [px, look] of [[9600, 'live'], [9700, 'faded']] as [number, 'live' | 'faded'][]) if (onScreen(state, X(px) - 60, X(px) + 60)) poster(c, X(px), Y(20), look, true);
  for (const lx of LAMPS) if (onScreen(state, X(lx) - 30, X(lx) + 30)) lampPost(c, X(lx));
  holeFloor(c, state);
  ground(c, state);
  rack(c);
  steps(c, state);
};
/** The signs: last of everything behind him (nothing of the machinery's ever over one). */
export const drawItchySigns = (c: Ctx, state: GameState) => {
  for (const [x, h, lines, board] of SIGNS) if (onScreen(state, X(x) - 200, X(x) + 200)) pkSign(c, X(x), Y(h), lines, board);
};

export const itchyLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  for (const lx of LAMPS) { const x = X(lx); if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y: GY - 172, r: 110, a: 0.45, color: '#FDBA74' }); }
  const kx = X(KILLORAMA.doors);
  if (kx > state.camera.x - 400 && kx < state.camera.x + 1200) out.push({ x: kx, y: Y(330), r: 260, a: 0.4, color: '#FCA5A5' });
  return out;
};
