// THE QUEEN's place in hell (the ROBOT: no sin, a machine): HELL'S DISCO. The aliens snuck into hell and rebuilt her,
// and her disco with her, out of hell's own rock and whatever they had on the ship: the hall's walls raw hellstone, its
// cracks glowing magenta, skulls in it; the aliens' green tech bolted all over it (cable bundles down from the truss,
// conduits along it, specimen tanks with something floating in them); the mural band a strip of their screens showing
// her rebuild, part by part (SKULL: OK ... SKIN: DOLLAR STORE); down low, the tufted vinyl in hell's own magenta with
// skulls for buttons. The neon reads INFERNAL GROOVE. Ned's in the booth (rf/space.ts). The show's own lights, the
// floor, the ball and the beams are the land's, untouched (her tells).
//
// In through space/queen/disco.ts DISCO_HOOKS (wall, neon): painted once per wall tile.

import type { HellPlace } from '../defs';
import { GY } from '../../../space/geometry';
import { DISCO_L } from '../../../space/queen/geo';
import { pixelBlob } from '../../../../m1/game/render/pixelArt';
import { type Ctx, INK, h01, box, poly, line, ashlar, crack, skull, bone, bandedGradient, steppedGlow, checker, signText } from './kitPA';

const HELL = ['#07030A', '#10060F', '#1A0A18', '#260E22', '#34122C', '#461838'];
const AL = ['#04100A', '#0A2014', '#123420', '#1C4A2E', '#2E6A44', '#4A8E60'];
const GLOW = ['#0E3A1A', '#167A30', '#2CC24E', '#7CF08C', '#D2FFD8'];
const MAG = ['#2A0418', '#4A0A2E', '#7A1248', '#B01E6A', '#E04A96', '#FF9ACA'];
const STEEL = ['#0C0E10', '#181C20', '#262C32', '#384048', '#505A64', '#707C88'];

/** A specimen tank bolted to the wall (its foot at x, y): steel caps, green glass, a thing floating in it. */
const tank = (g: Ctx, x: number, y: number, what: number) => {
  const w = 34, h = 70;
  box(g, x - w / 2 - 2, y - h - 10, w + 4, h + 20, INK);
  box(g, x - w / 2, y - h, w, h, GLOW[0]); bandedGradient(g, x - w / 2 + 2, y - h, w - 4, h, [GLOW[0], GLOW[1], GLOW[1], GLOW[0]], 6);
  // (the thing in it: a demon skull with horns, an eye on a stalk, a hand)
  if (what === 0) { skull(g, x, y - 26, 1.1); box(g, x - 9, y - 44, 3, 6, MAG[3]); box(g, x + 6, y - 44, 3, 6, MAG[3]); }
  else if (what === 1) { line(g, [[x, y - 8], [x + 2, y - 30]], MAG[2], 2); pixelBlob(g, x + 2, y - 38, 8, 8, '#E8E0D0', 2); pixelBlob(g, x + 4, y - 38, 4, 4, MAG[3], 2); box(g, x + 4, y - 39, 2, 2, INK); }
  else { for (let k = 0; k < 4; k++) line(g, [[x - 4 + k * 3, y - 24], [x - 7 + k * 4, y - 40]], '#C8B0A0', 2); pixelBlob(g, x, y - 20, 8, 6, '#C8B0A0', 2); }
  // (bubbles, the glass's sheen)
  for (let k = 0; k < 6; k++) box(g, x - 10 + (k * 7) % 20, y - 10 - k * 10, 2, 2, GLOW[3]);
  checker(g, x - w / 2 + 4, y - h, 3, h, GLOW[3], 0, 2); box(g, x - w / 2 + 4, y - h, 1, h, GLOW[4]);
  // (the caps: steel, riveted, a green lamp)
  for (const cy of [y - h - 10, y]) { box(g, x - w / 2 - 2, cy, w + 4, 10, STEEL[2]); box(g, x - w / 2 - 2, cy, w + 4, 2, STEEL[4]); box(g, x - w / 2 - 2, cy + 8, w + 4, 2, STEEL[1]); for (let k = 0; k < 4; k++) box(g, x - w / 2 + 2 + k * 9, cy + 4, 2, 2, STEEL[5]); }
  box(g, x - 2, y - h - 7, 4, 3, GLOW[3]);
};
/** A bundle of cables down the wall from the truss, clamped to the rock now and then. */
const cables = (g: Ctx, x: number, y0: number, y1: number, seed: number) => {
  for (let k = 0; k < 4; k++) {
    const cx = x + k * 4, sway = (h01(seed + k) - 0.5) * 10;
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, y0); g.quadraticCurveTo(cx + sway, (y0 + y1) / 2, cx, y1); g.stroke();
    g.strokeStyle = k % 2 ? AL[3] : AL[2]; g.lineWidth = 2; g.stroke();
    g.strokeStyle = AL[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 1, y0); g.quadraticCurveTo(cx - 1 + sway, (y0 + y1) / 2, cx - 1, y1); g.stroke();
  }
  for (let y = y0 + 60; y < y1 - 20; y += 90) { box(g, x - 4, y, 22, 8, INK); box(g, x - 3, y + 1, 20, 6, STEEL[3]); box(g, x - 3, y + 1, 20, 1, STEEL[5]); box(g, x + 7, y + 3, 2, 2, GLOW[3]); }
};
/** A conduit along the wall: round (lit through its middle, not its top: not a ledge), clamps, glow seams. */
const conduit = (g: Ctx, x: number, w: number, y: number) => {
  box(g, x, y - 1, w, 12, INK); box(g, x, y, w, 10, AL[1]); box(g, x, y + 3, w, 3, AL[3]); box(g, x, y + 4, w, 1, AL[4]); box(g, x, y + 8, w, 2, AL[0]);
  for (let k = 20; k < w; k += 60) { box(g, x + k, y - 2, 6, 14, STEEL[2]); box(g, x + k, y - 2, 6, 1, STEEL[4]); box(g, x + k + 8, y + 4, 10, 2, GLOW[2]); }
};

/** The screens where the mural was: the rebuild, part by part, in the aliens' green; its label. */
const PARTS = ['SKULL: OK', 'RIBS: OK', 'TAIL: OK', 'EGG SACK: OK', 'SKIN: DOLLAR STORE'];
const screens = (g: Ctx, tx: number, k: number) => {
  const my = GY - 254, mh = 82;
  box(g, tx, my - 4, 400, mh + 8, STEEL[1]); box(g, tx, my - 4, 400, 1, STEEL[3]); box(g, tx, my + mh + 3, 400, 1, STEEL[0]);
  for (let s = 0; s < 2; s++) {
    const sx = tx + 10 + s * 196, sw = 184;
    box(g, sx - 1, my - 1, sw + 2, mh + 2, INK); box(g, sx, my, sw, mh, '#020A04');
    for (let y = my + 1; y < my + mh; y += 3) box(g, sx, y, sw, 1, '#041408');
    const part = (k * 2 + s) % PARTS.length, cx = sx + 60, cy = my + 40, G = GLOW[2];
    g.strokeStyle = G; g.lineWidth = 1;
    // (a wireframe of the part: crude, grid-lined)
    if (part === 0) { g.beginPath(); g.ellipse(cx, cy - 4, 30, 18, 0, 0, Math.PI * 2); g.moveTo(cx + 30, cy - 4); g.lineTo(cx + 48, cy + 6); g.lineTo(cx + 20, cy + 14); g.stroke(); box(g, cx + 2, cy - 8, 6, 4, GLOW[3]); }
    else if (part === 1) { for (let r = 0; r < 6; r++) { g.beginPath(); g.ellipse(cx, cy - 18 + r * 7, 28 - r * 2, 4, 0, Math.PI, 0); g.stroke(); } g.beginPath(); g.moveTo(cx, cy - 26); g.lineTo(cx, cy + 22); g.stroke(); }
    else if (part === 2) { for (let r = 0; r < 9; r++) { const x = cx - 40 + r * 10, y = cy + Math.sin(r * 0.7) * 10; g.strokeRect(x, y - 3, 7, 6); } }
    else if (part === 3) { for (let r = 0; r < 4; r++) { g.beginPath(); g.ellipse(cx - 24 + r * 16, cy + (r % 2) * 8, 7, 10, 0, 0, Math.PI * 2); g.stroke(); } }
    else { g.beginPath(); g.ellipse(cx, cy, 26, 30, 0, 0, Math.PI * 2); g.stroke(); for (let r = 0; r < 5; r++) g.strokeRect(cx - 20 + r * 7, cy - 14 + (r % 2) * 12, 9, 9); }
    // (the grid, the readout, the label)
    for (let x = sx + 4; x < sx + sw; x += 12) box(g, x, my + mh - 6, 1, 3, GLOW[1]);
    for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) if (h01(part * 7 + r * 3 + q) > 0.4) box(g, sx + 118 + q * 9, my + 10 + r * 9, 6, 2, r === 0 ? GLOW[3] : GLOW[1]);
    signText(g, PARTS[part], sx + sw / 2, my + mh - 9, { sx: 1, sy: 1, fill: part === 4 ? MAG[4] : GLOW[3], gap: 1 });
  }
};

const paintWall = (g: Ctx, tx: number) => {
  const k = Math.round((tx - DISCO_L) / 400), top = GY - 600;
  // (hellstone: rough-dressed blocks, darker up top, cracks with the glow in them)
  ashlar(g, tx, top, 400, 600, HELL, 28, 64, k * 13 + 5);
  bandedGradient(g, tx, top, 400, 120, ['rgba(4,1,6,0.85)', 'rgba(4,1,6,0.6)', 'rgba(4,1,6,0.35)', 'rgba(4,1,6,0.12)', 'rgba(4,1,6,0)'], 5);
  for (let i = 0; i < 4; i++) crack(g, tx + 30 + h01(k * 5 + i) * 340, top + 140 + h01(k * 3 + i * 2) * 220, 60 + h01(i + k) * 80, k * 31 + i * 7, INK, MAG[4]);
  for (let i = 0; i < 3; i++) steppedGlow(g, tx + 50 + i * 140 + h01(k + i) * 40, top + 260 + (i % 2) * 80, 18, MAG[3], 0.18, 0, 3);
  // (skulls set in the rock)
  for (let i = 0; i < 3; i++) skull(g, tx + 40 + h01(k * 7 + i) * 320, top + 170 + h01(k * 11 + i) * 160, 0.9 + (i % 2) * 0.3, ['#2A2220', '#3E3430', '#5A4C44', '#7A6A5E', '#9A887A', '#B4A496']);
  // (the aliens' kit: the conduit up under the truss and over the screens; cable bundles down; a tank at each side)
  conduit(g, tx, 400, top + 120);
  conduit(g, tx, 400, GY - 280);
  cables(g, tx + 24 + (k % 2) * 300, top + 60, GY - 286, k * 3);
  cables(g, tx + 190, top + 132, GY - 290, k * 3 + 1);
  tank(g, tx + 110 + (k % 2) * 140, GY - 300, k % 3);
  screens(g, tx, k);
  // (down low: the tufted padding in hell's magenta, skulls for buttons; the alien baseboard, its green seam)
  const ly = GY - 150;
  box(g, tx, ly, 400, 142, MAG[1]);
  for (let r = 0; r < 5; r++) for (let x = (r % 2) * 14; x < 400; x += 28) {
    const cx = tx + x, cy = ly + 14 + r * 26;
    poly(g, [[cx, cy - 13], [cx + 14, cy], [cx, cy + 13], [cx - 14, cy]], MAG[2]);
    poly(g, [[cx, cy - 13], [cx + 14, cy], [cx, cy - 1]], MAG[3]);
    box(g, cx - 2, cy - 2, 4, 4, '#C8B8A8'); box(g, cx - 1, cy - 1, 1, 1, INK); box(g, cx + 1, cy - 1, 1, 1, INK);
  }
  checker(g, tx, ly, 400, 4, MAG[0], 0, 2); box(g, tx, ly - 6, 400, 6, STEEL[2]); box(g, tx, ly - 6, 400, 1, STEEL[4]); box(g, tx, ly - 1, 400, 1, STEEL[0]);
  box(g, tx, GY - 40, 400, 32, 'rgba(10, 2, 8, 0.5)');
  box(g, tx, GY - 8, 400, 8, STEEL[2]); box(g, tx, GY - 8, 400, 1, STEEL[4]); for (let x = 6; x < 400; x += 18) box(g, tx + x, GY - 5, 10, 2, GLOW[2]);
  // (a bone or two along the foot)
  bone(g, tx + 60 + (k % 3) * 90, GY - 12, 16, -2);
};

export const spacePlace: HellPlace = {
  light: { dark: 0.2, shade: [16, 4, 14], grade: '#ECDCEC' },
};
/** (space/queen/disco.ts DISCO_HOOKS, set by rf/space.ts: only while her refight's on) */
export const SPACE_WALL = { key: 'rf4-sp-wall', paint: paintWall };
export const SPACE_NEON = 'INFERNAL';

// (dev: a sheet of two wall tiles, world coords shifted onto it)
export const spaceSheet = (g: Ctx) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, 800, 604);
  for (let k = 0; k < 2; k++) { g.save(); g.translate(k * 400 - (DISCO_L + k * 400), -(GY - 600)); paintWall(g, DISCO_L + k * 400); g.restore(); }
};
