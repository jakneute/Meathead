// THE GROSS BUST (the user's standing rule: "any portrait or screen that calls attention to a single person" is a Ren &
// Stimpy gross-up): one sitter's head and shoulders, huge in its frame and painted in the gross-up kit's excruciating
// detail (grossKit.ts): pores and blackheads, stubble, sweat beads, zits, bloodshot bulging eyes, yellow teeth and the
// gums over them, nose hairs, wet highlights, a mugging expression. Each in its own medium: an oil portrait (a warm
// glaze, craquelure), a TV (scanlines, the phosphor mask), a poster print (posterized, dithered), a photo (sepia or
// black and white, grain). Painted once per key into the kit's buffer (its middle 150 x 200: the box), stamped, kept.
//
// The caller paints what's behind (the buffer's transparent round the sitter), puts the bust down (`drawBust`: fit in
// its rectangle, bottom up, the shoulders cut off before the face is), and anything live over it (`bustPupils`: the
// eyes following him, for a sitter painted with `blankEyes`).

import {
  type Ctx, type Buf, R, hexU, mixU, WHITE, newBuf, setSeed, rnd, matAt, plot, seg, path, ball, tint, bead, eyeball, teeth, skinPost, stubble,
  inkEdges, hairs, vein, toCanvas, bay, hash2, GW, GH, M_SKIN, M_HAIR, M_MOUTH, M_OTHER, M_CLOTH, M_METAL, M_SCLERA, M_IRIS, M_GLASS,
  SCLERA, SCLERA_R, SCLERA_Y, MOUTH, TONGUE, GUM, TOOTH, TOOTH_B, GOLD, BLOOD,
} from './grossKit';

/** The box in the buffer the bust is painted in (its own pixels: one per world pixel at a 150 x 200 frame). */
export const BOX_X = 61, BOX_Y = 4, BOX_W = 150, BOX_H = 200;
const FX = 136, FY = 92;

// ---------------------------------------------------------------------------------------------------------------
// Ramps: skins (light .. line, eight), hair, coats, eyes

export const SKIN = {
  pale: R('#FFF0E4', '#FCDCC8', '#F2C2A8', '#E0A48A', '#C4846C', '#9A5E4C', '#6A3A2E', '#3A1A12'),
  pink: R('#FFE0D4', '#FFC8B4', '#F4A890', '#E08C76', '#C46C5A', '#9A4A3E', '#6A2C24', '#3A120C'),
  tan: R('#FCE0B8', '#EEC496', '#DCA676', '#C4885A', '#A06A42', '#7A4C2C', '#52301A', '#2A160A'),
  olive: R('#F0DCA8', '#DCC08A', '#C4A26E', '#A88454', '#866440', '#64482C', '#42301A', '#20160A'),
  brown: R('#E8B890', '#C99470', '#A87454', '#8A5A3E', '#6C442C', '#4E301E', '#341E12', '#1A0C06'),
  dark: R('#B88A6A', '#94684C', '#7A5038', '#5E3C28', '#46281A', '#321C12', '#22120A', '#100804'),
  ghoul: R('#F0F4D8', '#D8E0BC', '#BCC69E', '#9CA882', '#7C8866', '#5A644A', '#3A422E', '#1C2014'),
  red: R('#FFC8B0', '#FFB09A', '#F59480', '#F27A66', '#D85848', '#B03A34', '#862220', '#4A0E0A'),
};
export const HAIR = {
  black: R('#5A5A66', '#34343E', '#202028', '#141418', '#0A0A0E', '#000000'),
  white: R('#FFFFFF', '#F2F0EA', '#DCD8CE', '#BCB6AA', '#948C80', '#4E4840'),
  gray: R('#E0E0E0', '#B8B8BC', '#90909A', '#6A6A74', '#4A4A52', '#202026'),
  brown: R('#C08A5A', '#9A6A3E', '#74482A', '#52301C', '#341C10', '#180C06'),
  ginger: R('#FFD0A0', '#F6B884', '#DC8A4E', '#B4642E', '#86441C', '#42200C'),
  blond: R('#FFF6C0', '#F6E08A', '#E0BE5A', '#BC963A', '#8A6A24', '#42300C'),
};
export const CLOTH = {
  black: R('#5A5262', '#3A3442', '#26222E', '#1A1620', '#100C14', '#040206'),
  purple: R('#9A7AC8', '#7452A8', '#523484', '#3A2262', '#241440', '#0E0620'),
  red: R('#E07A78', '#C25A58', '#982F35', '#76222A', '#54161C', '#28080C'),
  green: R('#8AC0A0', '#5A9A78', '#3A7458', '#26543E', '#163626', '#061A10'),
  navy: R('#7A8CC2', '#5A6CA2', '#36467E', '#283662', '#1A2446', '#0A0F22'),
  mustard: R('#F4D88A', '#DCB45A', '#B48A34', '#8A6420', '#5E4010', '#2A1A04'),
  gray: R('#C8C8CC', '#A0A0A8', '#7A7A84', '#5A5A62', '#3A3A42', '#18181C'),
  white: R('#FFFFFF', '#F4F0E6', '#D8D2C4', '#B2AA9A', '#8A8272', '#5E5A50'),
};
export const IRIS = {
  blue: R('#A8D0F4', '#78A8DC', '#4A7AB0', '#2E5486', '#18325A', '#081428'),
  brown: R('#D8A878', '#B07A4A', '#82522A', '#5A3618', '#3A200C', '#1A0C04'),
  green: R('#B8E8A0', '#84C470', '#549A48', '#36702E', '#1E4818', '#0A2008'),
  gray: R('#D8DCE0', '#B0B6BE', '#868E98', '#5E6670', '#3C424A', '#1A1E22'),
  yellow: R('#FFF4A0', '#F4D850', '#D8A820', '#A87A10', '#7A5008', '#3A2402'),
};
const LIPS = R('#F0A098', '#DC7E78', '#C05E5C', '#9A4244', '#6E2A2E', '#3E1416');
export const LIPSTICK = R('#FF8AA0', '#F05070', '#D02A50', '#A8183C', '#780C28', '#3A0412');
const NOSTRIL = R('#3A0808', '#240404', '#140202', '#080101', '#000000');

export type HairStyle = 'slick' | 'wig' | 'bun' | 'bald' | 'combover' | 'curls' | 'long' | 'beehive' | 'crew' | 'none';
export type Beard = 'full' | 'goatee' | 'chops' | 'stache' | 'stubble';
export type Mouth = 'grin' | 'gape' | 'smirk' | 'grimace' | 'grape' | 'pout' | 'talk';
export type Extra = 'monocle' | 'mole' | 'wart' | 'earring' | 'glasses' | 'scar' | 'zits' | 'pearls' | 'tiara' | 'cigar' | 'headset' | 'bowtie' | 'tie' | 'ruff' | 'lashes' | 'sweaty' | 'drool' | 'goiter';
export interface BustSpec {
  seed: number;
  skin: number[];
  hair?: HairStyle; hairRamp?: number[];
  beard?: Beard; beardRamp?: number[];
  iris?: number[];
  /** The whites: bloodshot (red), jaundiced (yellow), or merely veiny. */
  sclera?: 'red' | 'yellow' | 'white';
  mouth: Mouth;
  coat?: number[];
  lips?: number[];
  extras?: Extra[];
  /** Proportions (1: as painted): the head's width, its height, the jowls, the nose, the eyes; one eye bulging bigger. */
  wide?: number; tall?: number; jowl?: number; nose?: number; eye?: number; bulge?: number;
  /** Where the eyes look (-1..1 across, down). */
  look?: [number, number];
  /** The eyes painted without irises (the live pupils go over them: `bustPupils`). */
  blankEyes?: boolean;
}
export type Medium = 'oil' | 'crt' | 'poster' | 'photo' | 'bw' | 'none';

// ---------------------------------------------------------------------------------------------------------------
// The painting

interface Painted { buf: Buf; eyes: [number, number][]; eyeR: number }
const paint = (sp: BustSpec): Painted => {
  setSeed(sp.seed);
  const b = newBuf(), S = sp.skin, ex = sp.extras ?? [], has = (e: Extra) => ex.includes(e);
  const rx = 50 * (sp.wide ?? 1), ry = 58 * (sp.tall ?? 1), jw = sp.jowl ?? 1, nk = sp.nose ?? 1, ek = sp.eye ?? 1;
  const coat = sp.coat ?? CLOTH.black, hr = sp.hairRamp ?? HAIR.black, br = sp.beardRamp ?? hr;
  const inHead = (x: number, y: number, grow = 0) => ((x - FX) / (rx + grow)) ** 2 + ((y - FY) / (ry + grow)) ** 2 < 1;
  const NOSE = S.map((v, i) => mixU(v, hexU('#C02040'), i < 6 ? 0.22 : 0.1));
  // ---- the shoulders, the coat, the collar
  ball(b, FX, 236, 96, 78, coat, { mat: M_CLOTH, line: true, lw: 1.5 });
  for (const s of [-1, 1]) path(b, [FX + s * 10, 168, FX + s * 26, 204], coat[5], 1, undefined, M_CLOTH);
  // (the neck: thick, a goiter or an Adam's apple, the cords)
  ball(b, FX, 150, 28 * Math.max(1, jw * 0.9), 24, S, { mat: M_SKIN, line: (dx) => Math.abs(dx) > 0.8 });
  if (has('goiter')) ball(b, FX - 10, 160, 18, 13, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0, lit: 1.1 });
  else ball(b, FX + 2, 160, 5, 6, S, { mat: M_SKIN, lit: 1.15 });
  for (const s of [-1, 1]) path(b, [FX + s * 14, 140, FX + s * 18, 168], S[5], 1, undefined, M_SKIN);
  if (has('ruff')) {
    for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2; ball(b, FX + Math.cos(a) * 44, 170 + Math.sin(a) * 10, 12, 9, CLOTH.white, { mat: M_CLOTH, line: true, lw: 1 }); }
    ball(b, FX, 170, 30, 7, CLOTH.white, { mat: M_CLOTH });
    for (let k = 0; k < 22; k++) { const a = (k / 22) * Math.PI * 2; seg(b, FX + Math.cos(a) * 30, 170 + Math.sin(a) * 6, FX + Math.cos(a) * 54, 170 + Math.sin(a) * 13, CLOTH.white[4]); }
  } else {
    // (a shirt's V at the throat, the lapels)
    for (const s of [-1, 1]) for (let y = 168; y < GH; y++) for (let x = FX; Math.abs(x - FX) < (y - 166) * 0.55; x += s) plot(b, x, y, CLOTH.white[y - 168 < 2 ? 1 : (y + x) % 7 ? 2 : 3], M_CLOTH);
    for (const s of [-1, 1]) path(b, [FX + s * 4, 170, FX + s * 30, 204], coat[5], 2, M_CLOTH);
  }
  if (has('tie')) { ball(b, FX, 176, 6, 5, CLOTH.red, { mat: M_CLOTH, line: true }); for (let y = 180; y < GH; y++) { const w = 4 + (y - 180) * 0.2; for (let x = -w; x <= w; x++) plot(b, FX + x, y, CLOTH.red[Math.abs(x) >= w - 1 ? 5 : x < -w * 0.3 ? 1 : (x + y) % 9 ? 2 : 3], M_CLOTH); } }
  if (has('bowtie')) for (const s of [-1, 1]) { ball(b, FX + s * 12, 172, 11, 7, CLOTH.red, { mat: M_CLOTH, line: true }); ball(b, FX, 172, 5, 5, CLOTH.red, { mat: M_CLOTH, line: true }); }
  if (has('pearls')) for (let k = 0; k < 15; k++) { const a = Math.PI * (0.15 + (k / 14) * 0.7); ball(b, FX + Math.cos(a) * 32, 158 + Math.sin(a) * 18, 3, 3, CLOTH.white, { mat: M_METAL, line: true, lw: 0.8 }); }
  // ---- the ears: big, lumpy, hairy, the hole dark
  for (const s of [-1, 1]) {
    const ax = FX + s * (rx + 2), ay = FY + 6;
    ball(b, ax, ay, 9, 15, S, { mat: M_SKIN, line: true });
    ball(b, ax - s, ay + 1, 5, 9, S.slice(3), { mat: M_SKIN, soft: 0.3 });
    ball(b, ax - s * 2, ay + 3, 2, 2.6, NOSTRIL, { mat: M_OTHER });
    hairs(b, 5, () => [ax - s * 2, ay + 2], 4, s < 0 ? Math.PI : 0, S[6], undefined, 1.4);
    if (has('earring') && s < 0) ball(b, ax, ay + 18, 3, 4, GOLD, { mat: M_METAL, line: true });
  }
  // ---- the head: jowly, a chin
  const jy = FY + ry * 0.5;
  for (const s of [-1, 1]) ball(b, FX + s * rx * 0.55, jy, rx * 0.5 * jw, ry * 0.42, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0.1, lw: 1.4 });
  ball(b, FX, FY, rx, ry, S, { mat: M_SKIN, line: (_dx, dy) => dy > -0.1, lw: 1.5 });
  ball(b, FX, FY + ry * 0.86, rx * 0.36, ry * 0.2, S, { mat: M_SKIN, line: (_dx, dy) => dy > 0.3 });
  for (const s of [-1, 1]) ball(b, FX + s * rx * 0.48, FY + 16, rx * 0.34, ry * 0.26, S, { mat: M_SKIN, lit: 1.12, soft: 0.4 });
  // (the creases: the forehead, the nasolabial folds, the jowl lines)
  for (let k = 0; k < 3; k++) path(b, [FX - rx * 0.55, FY - ry * 0.52 + k * 5, FX - rx * 0.2, FY - ry * 0.56 + k * 5, FX + rx * 0.2, FY - ry * 0.55 + k * 5, FX + rx * 0.55, FY - ry * 0.5 + k * 5], S[6], 1, undefined, M_SKIN);
  for (const s of [-1, 1]) {
    path(b, [FX + s * 16, FY + 20, FX + s * 26, FY + 34, FX + s * 28, FY + 46], S[6], 1, undefined, M_SKIN);
    path(b, [FX + s * 17, FY + 21, FX + s * 27, FY + 35], S[2], 1, undefined, M_SKIN);
    if (jw > 1.05) path(b, [FX + s * rx * 0.62, FY + ry * 0.62, FX + s * rx * 0.4, FY + ry * 0.8], S[6], 1, undefined, M_SKIN);
  }
  // (the veins up the temple)
  vein(b, [FX - rx * 0.78, FY - 6, FX - rx * 0.8, FY - 18, FX - rx * 0.72, FY - 30], R('#E8C0D8', '#C890B8', '#A06A98', '#7A4C7A', '#58305A', '#301430'), 2);
  // ---- the hair
  const capLine = (x: number) => FY - ry * 0.5 + ((x - FX) / rx) ** 2 * ry * 0.45;
  const cap = (grow: number, line = capLine) => ball(b, FX, FY - 2, rx + grow, ry + grow, hr, { mat: M_HAIR, line: true, only: (x, y) => y < line(x) });
  const strokes = (n: number, at: () => [number, number] | null, len: number, ang: number, wob = 0.5) => {
    for (let k = 0; k < n; k++) { const p = at(); if (!p) continue; const a = ang + (rnd() - 0.5) * wob, l = len * (0.6 + rnd() * 0.6); seg(b, p[0], p[1], p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l, hr[k % 5 === 0 ? 0 : k % 3 ? 2 : 3], 1, undefined, M_HAIR); }
  };
  const onHair = (): [number, number] | null => { const x = FX - rx - 12 + rnd() * (rx * 2 + 24), y = FY - ry - 30 + rnd() * (ry + 50); return matAt(b, x, y) === M_HAIR ? [x, y] : null; };
  switch (sp.hair ?? 'slick') {
    case 'slick': cap(4); strokes(500, onHair, 9, 0.15, 0.3); for (let k = 0; k < 3; k++) path(b, [FX - rx * 0.6, FY - ry * 0.8 + k * 3, FX, FY - ry * 0.95 + k * 3, FX + rx * 0.5, FY - ry * 0.75 + k * 3], hr[0], 1, undefined, M_HAIR); seg(b, FX - 14, FY - ry - 2, FX - 10, FY - ry * 0.5, hr[5], 1, undefined, M_HAIR); break;
    case 'wig':
      cap(10, (x) => capLine(x) + 6);
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) ball(b, FX + s * (rx + 6), FY - 14 + k * 15, 11, 8, hr, { mat: M_HAIR, line: true });
      ball(b, FX, FY - ry - 8, rx * 0.8, 16, hr, { mat: M_HAIR, line: (_dx, dy) => dy < 0.2 });
      strokes(300, onHair, 6, -0.2, 2.5);
      for (let k = 0; k < 40; k++) { const p = onHair(); if (p) plot(b, p[0], p[1], WHITE); }
      break;
    case 'bun': cap(3); ball(b, FX, FY - ry - 12, 20, 16, hr, { mat: M_HAIR, line: true }); strokes(400, onHair, 8, -1.2, 1); break;
    case 'beehive': ball(b, FX, FY - ry - 18, rx * 0.95, 40, hr, { mat: M_HAIR, line: true }); cap(5); strokes(500, onHair, 10, -1.6, 1.4); break;
    case 'curls': cap(8); for (let k = 0; k < 70; k++) { const p = onHair(); if (p) ball(b, p[0], p[1], 3 + rnd() * 2, 3 + rnd() * 2, hr, { mat: M_HAIR, line: true, lw: 0.8 }); } for (const s of [-1, 1]) for (let k = 0; k < 5; k++) ball(b, FX + s * (rx + 2), FY - 20 + k * 7, 5, 5, hr, { mat: M_HAIR, line: true, lw: 0.8 }); break;
    case 'long':
      cap(5);
      for (const s of [-1, 1]) for (let k = 0; k < 220; k++) { const t = rnd(), x = FX + s * (rx - 4 + rnd() * 14), y = FY - ry * 0.5 + t * 120; if (y > FY - 10 && Math.abs(x - FX) < rx - 2 && y < FY + ry) continue; seg(b, x, y, x + s * (rnd() - 0.4) * 2, y + 6 + rnd() * 5, hr[k % 4 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR); }
      strokes(300, onHair, 9, 1.2, 0.8); break;
    case 'crew': cap(1); strokes(600, onHair, 3, -1.57, 0.6); break;
    case 'bald': case 'combover': {
      // (the dome shining, the fringe round the back over the ears)
      tint(b, FX - rx * 0.3, FY - ry * 0.7, rx * 0.35, ry * 0.16, WHITE, 0.55, M_SKIN, 0.6);
      for (const s of [-1, 1]) for (let k = 0; k < 120; k++) { const x = FX + s * (rx - 6 + rnd() * 10), y = FY - 26 + rnd() * 26; seg(b, x, y, x + s * 2, y + 3, hr[k % 3 ? 2 : 3], 1, M_HAIR); }
      if (sp.hair === 'combover') for (let k = 0; k < 9; k++) { const y0 = FY - 18 - k * 4; path(b, [FX - rx + 4, y0, FX - 10, y0 - 20 + k, FX + rx * 0.7, y0 - 10 - k], hr[k % 2 ? 2 : 3], 1); }
      for (let k = 0; k < 12; k++) { const x = FX - rx * 0.6 + rnd() * rx * 1.2, y = FY - ry * 0.9 + rnd() * 20; if (matAt(b, x, y) === M_SKIN) seg(b, x, y, x + (rnd() - 0.5) * 4, y - 4, hr[3]); }
      break;
    }
    default: break;
  }
  if (sp.hair !== 'bald' && sp.hair !== 'none' && sp.hair !== 'combover') inkEdges(b, M_HAIR, hr[hr.length - 1], [M_HAIR]);
  // ---- the beard (before the mouth: the lips go over it)
  if (sp.beard && sp.beard !== 'stubble' && sp.beard !== 'stache') {
    const inB = (x: number, y: number) => {
      if (!inHead(x, y, 6) && !(((x - FX) / (rx * 0.5)) ** 2 + ((y - FY - ry * 0.85) / (ry * 0.35)) ** 2 < 1)) return false;
      if (sp.beard === 'goatee') return Math.abs(x - FX) < 18 && y > FY + 44;
      if (sp.beard === 'chops') return Math.abs(x - FX) > rx * 0.55 && y > FY - 10 && y < FY + 40;
      return y > FY + 18 + (Math.abs(x - FX) < 24 ? 14 : 0) - Math.abs(x - FX) * 0.3;
    };
    for (let k = 0; k < 1400; k++) { const x = FX - rx - 6 + rnd() * (rx * 2 + 12), y = FY - 10 + rnd() * (ry + 40); if (inB(x, y)) seg(b, x, y, x + (rnd() - 0.5) * 3, y + 3 + rnd() * 4, br[k % 5 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR); }
  }
  // ---- the eyes: bulging (one more than the other), bloodshot, bags under them, lids
  const eyes: [number, number][] = [], eyeR = 11 * ek;
  const [lx, ly] = sp.look ?? [0.2, 0.1];
  const scl = sp.sclera === 'yellow' ? SCLERA_Y : sp.sclera === 'white' ? SCLERA : SCLERA_R;
  for (const s of [-1, 1]) {
    const k = s > 0 ? sp.bulge ?? 1.15 : 1, ex0 = FX + s * 20, ey0 = FY - 6, erx = 11 * ek * k, ery = 9.5 * ek * k;
    // (the sockets dark round them)
    tint(b, ex0, ey0 + 1, erx + 6, ery + 5, S[5], 0.35, M_SKIN, 0.5);
    eyeball(b, ex0, ey0, {
      rx: erx, ry: ery, sclera: scl, iris: sp.iris ?? IRIS.brown, ir: sp.blankEyes ? 0.001 : 5.5 * ek * k, idx: lx * erx * 0.4, idy: ly * ery * 0.4, pr: sp.blankEyes ? 0 : 2.4 * ek * k,
      veins: sp.sclera === 'white' ? 6 : 16, lid: S, top: (x) => ey0 - ery + 2 + Math.abs(x - ex0) * 0.08, bot: (x) => ey0 + ery - 1 - ((x - ex0) / erx) ** 2 * 2,
    });
    eyes.push([ex0 + lx * erx * 0.4 - BOX_X, ey0 + ly * ery * 0.4 - BOX_Y]);
    // (the bags: two creases under, a puffy lower lid)
    for (const [dy, col] of [[ery + 3, S[6]], [ery + 7, S[5]], [ery + 10, S[5]]] as const) path(b, [ex0 - erx, ey0 + dy - 2, ex0 - erx * 0.4, ey0 + dy + 1, ex0 + erx * 0.4, ey0 + dy + 1, ex0 + erx, ey0 + dy - 2], col, 1, undefined, M_SKIN);
    if (has('lashes')) for (let a = -1; a <= 1; a += 0.33) seg(b, ex0 + a * erx * 0.9, ey0 - ery + 2 + Math.abs(a) * 1, ex0 + a * erx * 1.3, ey0 - ery - 4, HAIR.black[4], 1);
    // (the brow: thick, cocked)
    const bh = s > 0 ? -4 : 0, pts = [ex0 - s * 14, ey0 - ery - 4 + bh + (s < 0 ? 2 : 0), ex0, ey0 - ery - 7 + bh, ex0 + s * 14, ey0 - ery - 3 + bh];
    const bcol = sp.hair === 'wig' ? HAIR.gray : sp.hair === 'bald' || sp.hair === 'combover' ? hr : (sp.beardRamp ?? hr);
    path(b, pts, bcol[bcol.length - 1], has('lashes') ? 3 : 5); path(b, pts, bcol[2], has('lashes') ? 2 : 3); hairs(b, 14, () => [pts[0] + rnd() * (pts[4] - pts[0]), pts[1] + rnd() * 3 - 2], 4, -1.57 + s * 0.6, bcol[3]);
  }
  // ---- the nose: a big bulb, veined, the pores and blackheads, the nostrils and the hairs out of them
  const nx = FX + 2, ny = FY + 18;
  ball(b, nx - 2, ny - 12, 6 * nk, 12, S, { mat: M_SKIN, lit: 1.15 });
  ball(b, nx, ny, 13 * nk, 11 * nk, NOSE, { mat: M_SKIN, line: (_dx, dy) => dy > 0.35, lit: 1.1 });
  for (const s of [-1, 1]) ball(b, nx + s * 10 * nk, ny + 6, 6 * nk, 5, NOSE, { mat: M_SKIN, line: (dx, dy) => dy > 0 || s * dx > 0.5 });
  for (const s of [-1, 1]) ball(b, nx + s * 6 * nk, ny + 8 * nk, 3.6 * nk, 2.4, NOSTRIL, { mat: M_OTHER });
  for (let k = 0; k < 5; k++) { let x = nx + (rnd() - 0.5) * 16 * nk, y = ny + (rnd() - 0.5) * 10, a = rnd() * 6; for (let i = 0; i < 7; i++) { x += Math.cos(a); y += Math.sin(a); a += (rnd() - 0.5) * 1.4; if (matAt(b, x, y) === M_SKIN) plot(b, x, y, hexU('#C02044')); } }
  for (const s of [-1, 1]) hairs(b, 4, () => [nx + s * 6 * nk + (rnd() - 0.5) * 3, ny + 9 * nk], 4, 1.57 + s * 0.3, HAIR.black[3]);
  // ---- the mouth
  const cx = FX, cy = FY + 38;
  const lipR = sp.lips ?? LIPS;
  const open = (mw: number, mh: number, o: { tongue?: boolean; top?: number; bot?: number; gaps?: number[]; gold?: number[] }) => {
    ball(b, cx, cy, mw + 4, mh + 4, lipR, { mat: M_OTHER, line: true, lw: 1.3 });
    ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH, flat: 0.3, lit: 0.55 });
    if (o.tongue) ball(b, cx + 2, cy + mh - 3, mw * 0.65, mh * 0.5, TONGUE, { mat: M_MOUTH, line: (_dx, dy) => dy < 0, only: (x, y) => matAt(b, x, y) === M_MOUTH });
    const top = (x: number) => cy - mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) + 1;
    const bot = (x: number) => cy + mh * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2)) - 1;
    for (let x = cx - mw; x <= cx + mw; x++) { const t = Math.round(top(x)); for (let y = t; y < t + 3; y++) if (matAt(b, x, y) === M_MOUTH) plot(b, x, y, GUM[y === t ? 3 : 1], M_OTHER); }
    if (o.top) teeth(b, cx - mw + 2, cx + mw - 2, (x) => top(x) + 3, 1, o.top, { tw: 5, gaps: o.gaps, gold: o.gold, rot: [1, 6] });
    if (o.bot) teeth(b, cx - mw + 5, cx + mw - 5, bot, -1, o.bot, { tw: 5, gaps: [2], rot: [4], ramp: TOOTH_B });
    for (const sx of [cx - mw * 0.5, cx + mw * 0.3]) for (let y = Math.round(top(sx) + 6); y < bot(sx) - 2; y++) if (bay(sx, y) < 0.7) plot(b, sx + Math.round(Math.sin(y * 0.5)), y, hexU('#F0E8F8'));
  };
  switch (sp.mouth) {
    case 'grin': {
      // (a huge grin: a flat top, a deep smile under, every tooth, the gums over them)
      const mw = 30, top = (x: number) => cy - 4 + ((x - cx) / mw) ** 2 * -4, bot = (x: number) => cy - 2 + 14 * Math.sqrt(Math.max(0, 1 - ((x - cx) / mw) ** 2));
      for (let x = cx - mw - 3; x <= cx + mw + 3; x++) for (let y = Math.floor(top(x) - 4); y <= bot(x) + 4; y++) if (Math.abs(x - cx) <= mw + 3) plot(b, x, y, lipR[y < top(x) - 1 ? 2 : 1], M_OTHER);
      for (let x = cx - mw; x <= cx + mw; x++) for (let y = Math.floor(top(x)); y <= bot(x); y++) plot(b, x, y, MOUTH[2], M_MOUTH);
      for (let x = cx - mw; x <= cx + mw; x++) for (let y = Math.floor(top(x)); y < top(x) + 3; y++) plot(b, x, y, GUM[y < top(x) + 1 ? 3 : 1], M_OTHER);
      teeth(b, cx - mw + 1, cx + mw, (x) => top(x) + 3, 1, 8, { tw: 6, gold: [3], rot: [1, 8], gaps: [6] });
      teeth(b, cx - mw + 6, cx + mw - 4, (x) => bot(x) - 1, -1, 4, { tw: 6, ramp: TOOTH_B });
      for (let x = cx - mw - 3; x <= cx + mw + 3; x++) { plot(b, x, top(x) - 5, lipR[5]); plot(b, x, bot(x) + 4, lipR[5]); }
      for (const s of [-1, 1]) { ball(b, cx + s * (mw + 6), cy - 4, 5, 6, S, { mat: M_SKIN, line: (dx) => s * dx < 0 }); }
      break;
    }
    case 'gape': open(22, 18, { tongue: true, top: 7, bot: 5, gaps: [3, 4] }); ball(b, cx, cy - 8, 2.4, 4, TONGUE, { mat: M_MOUTH, line: true }); break;
    case 'talk': open(18, 9, { tongue: true, top: 5, bot: 3 }); break;
    case 'grimace': {
      const mw = 28, mh = 8;
      ball(b, cx, cy, mw + 4, mh + 4, lipR, { mat: M_OTHER, line: true, lw: 1.3, flat: 0.5 });
      ball(b, cx, cy, mw, mh, MOUTH, { mat: M_MOUTH });
      teeth(b, cx - mw + 2, cx + mw - 2, () => cy - mh + 1, 1, mh, { tw: 5, gaps: [5], gold: [2], rot: [7, 8] });
      teeth(b, cx - mw + 4, cx + mw - 4, () => cy + mh - 1, -1, mh - 1, { tw: 5, ramp: TOOTH_B });
      path(b, [cx - mw, cy, cx + mw, cy], MOUTH[4], 1);
      for (const s of [-1, 1]) path(b, [cx + s * (mw + 4), cy, cx + s * (mw + 10), cy - 6, cx + s * (mw + 12), cy + 4], S[6], 1, undefined, M_SKIN);
      break;
    }
    case 'grape': {
      // (an apple jammed in the mouth: the jaw stretched round it, the lips split, the teeth sunk in)
      ball(b, cx, cy + 2, 22, 20, lipR, { mat: M_OTHER, line: true, lw: 1.5 });
      ball(b, cx, cy + 2, 18, 16, MOUTH, { mat: M_MOUTH });
      teeth(b, cx - 14, cx + 14, () => cy - 12, 1, 4, { tw: 5, rot: [2] });
      ball(b, cx, cy + 3, 16, 15, R('#FF9A8A', '#F05A4A', '#C8302A', '#9A1C1C', '#6A0E10', '#2E0406'), { mat: M_OTHER, line: true });
      plot(b, cx - 6, cy - 4, WHITE); plot(b, cx - 5, cy - 4, WHITE); plot(b, cx - 6, cy - 3, WHITE);
      seg(b, cx + 1, cy - 10, cx + 3, cy - 15, hexU('#5A3A1A'), 2);
      break;
    }
    case 'pout': {
      ball(b, cx, cy - 3, 18, 7, lipR, { mat: M_OTHER, line: true, lw: 1.2 });
      ball(b, cx, cy + 5, 16, 8, lipR, { mat: M_OTHER, line: true, lw: 1.2, lit: 1.2 });
      path(b, [cx - 16, cy + 1, cx - 6, cy + 2, cx + 6, cy + 2, cx + 16, cy + 1], lipR[5], 1);
      plot(b, cx - 6, cy + 3, WHITE); plot(b, cx - 5, cy + 3, WHITE); plot(b, cx + 4, cy - 5, WHITE);
      break;
    }
    default: {
      // (a smirk: closed, lopsided, wet at the corner)
      for (let x = cx - 26; x <= cx + 26; x++) {
        const u = (x - cx) / 26, y = cy + u * u * -5 + (u > 0 ? -u * 6 : 0);
        for (let d = -3; d <= 3; d++) plot(b, x, y + d, lipR[d < -1 ? 1 : d < 1 ? 2 : 3], M_OTHER);
        plot(b, x, y, lipR[5]); plot(b, x, y - 4, lipR[5]); plot(b, x, y + 4, lipR[5]);
      }
      ball(b, cx + 28, cy - 11, 5, 6, S, { mat: M_SKIN, line: (dx) => dx < 0 });
      break;
    }
  }
  // (the mustache over the top lip)
  if (sp.beard === 'stache' || sp.beard === 'full') for (let k = 0; k < 360; k++) { const s = rnd() < 0.5 ? -1 : 1, t = rnd(), x = cx + s * (2 + t * 32), y = cy - 16 + t * t * 10 + rnd() * 5; seg(b, x, y, x + s * 2, y + 3 + rnd() * 2, br[k % 4 === 0 ? 0 : k % 3 ? 2 : 3], 1, M_HAIR); }
  if (sp.beard) inkEdges(b, M_HAIR, br[br.length - 1], [M_HAIR]);
  // ---- the extras
  if (has('monocle')) { const mx = FX + 20, my = FY - 6, r = 15; for (let a = 0; a < Math.PI * 2; a += 0.01) { plot(b, mx + Math.cos(a) * r, my + Math.sin(a) * r, Math.cos(a + 2.3) > 0.3 ? GOLD[1] : GOLD[4], M_METAL); plot(b, mx + Math.cos(a) * (r + 1), my + Math.sin(a) * (r + 1), GOLD[6], M_METAL); } seg(b, mx - 6, my - 9, mx - 1, my - 12, WHITE, 1); path(b, [mx + r, my + 4, mx + 24, my + 40, mx + 10, my + 70, mx + 26, 200], GOLD[3], 1); }
  if (has('glasses')) for (const s of [-1, 1]) { const gx = FX + s * 20, gy = FY - 6; for (let y = -12; y <= 12; y++) for (let x = -16; x <= 16; x++) { const e = Math.max(Math.abs(x) / 16, Math.abs(y) / 12); if (e > 0.88) plot(b, gx + x, gy + y, HAIR.black[3], M_GLASS); else if ((x + y + 30) % 11 === 0 && x < 0) plot(b, gx + x, gy + y, mixU(pxOf(b, gx + x, gy + y), WHITE, 0.6)); } if (s < 0) seg(b, FX - 4, FY - 8, FX + 4, FY - 8, HAIR.black[3], 2); seg(b, gx + s * 16, gy - 4, gx + s * (rx - 18), gy - 2, HAIR.black[3], 2); }
  if (has('mole')) { const mx = FX - 30, my = FY + 34; ball(b, mx, my, 4, 3.6, R('#8A5A3A', '#6A4028', '#4A2A18', '#2A160A', '#140804'), { mat: M_OTHER, line: true }); hairs(b, 5, () => [mx, my - 1], 7, -1.2, HAIR.black[3], undefined, 1.6); }
  if (has('wart')) { const wx = nx + 9, wy = ny - 3; ball(b, wx, wy, 4, 4, R('#D8D49A', '#B8B474', '#94904E', '#706C34', '#4A4820', '#22200A'), { mat: M_OTHER, line: true }); hairs(b, 3, () => [wx, wy - 2], 6, -1.4, HAIR.black[2]); }
  if (has('scar')) { path(b, [FX + 30, FY - 26, FX + 22, FY + 6, FX + 34, FY + 30], S[6], 3); path(b, [FX + 30, FY - 26, FX + 22, FY + 6, FX + 34, FY + 30], hexU('#E8B0B0'), 1); for (let k = 0; k < 7; k++) { const t = k / 6, sx = FX + 30 - t * 8 + (t > 0.5 ? (t - 0.5) * 24 : 0), sy = FY - 26 + t * 56; seg(b, sx - 4, sy, sx + 4, sy + 1, HAIR.black[3]); } }
  if (has('tiara')) for (let x = -rx * 0.7; x <= rx * 0.7; x++) { const y = FY - ry * 0.78 - Math.abs(Math.sin(x * 0.25)) * 6 * (1 - Math.abs(x) / rx); for (let d = 0; d < FY - ry * 0.7 - y; d++) plot(b, FX + x, y + d, GOLD[d < 1 ? 1 : 3], M_METAL); }
  if (has('cigar')) { for (let t = 0; t < 34; t++) for (let d = -3; d <= 3; d++) plot(b, cx + 22 + t, cy + 2 + t * 0.4 + d, R('#C8946A', '#A0704A', '#7A4E2E', '#5A341C', '#2A1608')[Math.abs(d) === 3 ? 4 : d < -1 ? 0 : d < 1 ? 1 : 2], M_OTHER); for (let d = -3; d <= 3; d++) plot(b, cx + 56, cy + 16 + d, d % 2 ? hexU('#F4602A') : hexU('#7A7A7A')); }
  if (has('headset')) { path(b, [FX - rx - 6, FY + 6, FX - rx - 4, FY + 26, FX - 30, FY + 40], HAIR.black[2], 2); ball(b, FX - 28, FY + 40, 3, 3, HAIR.black, { mat: M_METAL }); ball(b, FX - rx - 4, FY + 6, 6, 9, HAIR.black, { mat: M_METAL, line: true }); }
  // ---- the skin's going over: stubble, pores and blackheads, grease shine, zits, sweat
  if (sp.beard === 'stubble' || (sp.beard === undefined && !has('lashes') && hash2(sp.seed, 3) < 0.5)) stubble(b, (x, y) => (y > FY + 18 && inHead(x, y, 4) ? 0.9 : 0), S[6], 0.5);
  skinPost(b, S[7], (x, y) => (((x - nx) / 18) ** 2 + ((y - ny) / 14) ** 2 < 1 ? 0.2 : ((x - FX) / (rx * 0.9)) ** 2 + ((y - FY - 14) / 24) ** 2 < 1 ? 0.12 : 0.07), {
    blackheads: (x, y) => ((x - nx) / 16) ** 2 + ((y - ny) / 12) ** 2 < 1 || (Math.abs(x - FX) < 20 && y > FY + ry * 0.75), shine: 0.2,
  });
  if (has('zits')) for (let k = 0; k < 9; k++) { const x = FX + (rnd() - 0.5) * rx * 1.7, y = FY - ry * 0.6 + rnd() * ry * 1.5; if (matAt(b, x, y) !== M_SKIN) continue; ball(b, x, y, 3, 3, R('#FFB0A0', '#F07060', '#D04840', '#A02C2C', '#6A1414'), { mat: M_OTHER, soft: 0.3 }); ball(b, x - 0.5, y - 0.5, 1.4, 1.4, R('#FFFFF0', '#FFF8C8', '#F4E8A0', '#D8C878', '#A89450'), { mat: M_OTHER }); }
  const beads = has('sweaty') ? 22 : 8;
  for (let k = 0; k < beads; k++) { const x = FX + (rnd() - 0.5) * rx * 1.4, y = FY - ry * 0.75 + rnd() * (has('sweaty') ? ry * 1.2 : 24); if (matAt(b, x, y) === M_SKIN) bead(b, x, y, 1.2 + rnd() * 1.4, S); }
  if (has('drool')) { path(b, [cx + 14, cy + 8, cx + 15, cy + 22, cx + 14, cy + 40, cx + 16, cy + 52], hexU('#D8E8F0'), 2); path(b, [cx + 14, cy + 8, cx + 15, cy + 22, cx + 14, cy + 40], WHITE, 1); ball(b, cx + 16, cy + 54, 3, 4, R('#FFFFFF', '#E8F4FA', '#C8DCE8', '#A0BCD0', '#6A8AA0'), { mat: M_OTHER }); }
  return { buf: b, eyes, eyeR };
};
const pxOf = (b: Buf, x: number, y: number) => b.px[Math.max(0, Math.min(GH - 1, Math.round(y))) * GW + Math.max(0, Math.min(GW - 1, Math.round(x)))];

// ---------------------------------------------------------------------------------------------------------------
// The media (over the box's painted pixels only: what's transparent stays so)

const chans = (v: number): [number, number, number] => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255];
const pack = (r: number, g: number, bl: number) => ((255 << 24) | (Math.max(0, Math.min(255, bl | 0)) << 16) | (Math.max(0, Math.min(255, g | 0)) << 8) | Math.max(0, Math.min(255, r | 0))) >>> 0;
const each = (b: Buf, fn: (x: number, y: number, v: number) => number) => {
  for (let y = BOX_Y; y < BOX_Y + BOX_H; y++) for (let x = BOX_X; x < BOX_X + BOX_W; x++) { const i = y * GW + x, v = b.px[i]; if (v >>> 24) b.px[i] = fn(x, y, v); }
};
const AMBER = hexU('#8A5A1A');
const media: Record<Medium, (b: Buf, seedN: number) => void> = {
  none: () => {},
  // (the oil: a yellowed glaze, the brushwork showing in the lights, craquelure all over)
  oil: (b, sn) => {
    each(b, (x, y, v) => { let o = mixU(v, AMBER, 0.14); if (hash2(x >> 1, y * 3 + sn) > 0.93) o = mixU(o, WHITE, 0.12); return o; });
    setSeed(sn * 7 + 3);
    for (let k = 0; k < 26; k++) walk2(BOX_X + rnd() * BOX_W, BOX_Y + rnd() * BOX_H, rnd() * 6.28, 10 + rnd() * 24, (x, y) => { const i = y * GW + x; if (x < 0 || y < 0 || x >= GW || y >= GH || !(b.px[i] >>> 24)) return false; b.px[i] = mixU(b.px[i], hexU('#140A04'), 0.45); });
  },
  // (the TV: the phosphor mask, the scanlines, a blue cast, the lights blooming)
  crt: (b) => each(b, (x, y, v) => { const [r, g, bl] = chans(v), m = x % 3; let k = y % 2 ? 0.62 : 1.05; if (r + g + bl > 600) k = Math.max(k, 0.95); return pack(r * k * (m === 0 ? 1.08 : 0.92), g * k * (m === 1 ? 1.08 : 0.94), (bl * 1.06 + 12) * k * (m === 2 ? 1.1 : 0.94)); }),
  // (the print: posterized to a few inks, ordered dither between)
  poster: (b) => each(b, (x, y, v) => { const [r, g, bl] = chans(v), d = (bay(x, y) - 0.5) * 64, q = (c: number) => Math.round((c + d) / 64) * 64; return pack(q(r), q(g), q(bl)); }),
  // (the photo: sepia, grain)
  photo: (b) => each(b, (x, y, v) => { const [r, g, bl] = chans(v), l = r * 0.3 + g * 0.59 + bl * 0.11 + (hash2(x, y) - 0.5) * 18; return pack(l * 1.08 + 10, l * 0.94 + 4, l * 0.74); }),
  bw: (b) => each(b, (x, y, v) => { const [r, g, bl] = chans(v), l = r * 0.3 + g * 0.59 + bl * 0.11 + (hash2(x, y) - 0.5) * 22, q = Math.round(l / 36) * 36; return pack(q, q, q); }),
};
const walk2 = (x: number, y: number, ang: number, steps: number, fn: (x: number, y: number) => boolean | void) => {
  for (let i = 0; i < steps; i++) { x += Math.cos(ang); y += Math.sin(ang); ang += (rnd() - 0.5) * 1.1; if (fn(Math.round(x), Math.round(y)) === false) return; if (rnd() < 0.08) ang += (rnd() < 0.5 ? -1 : 1) * 1.3; }
};

// ---------------------------------------------------------------------------------------------------------------
// The cache and the drawing

export interface Bust { img: HTMLCanvasElement | null; eyes: [number, number][]; eyeR: number; iris: number[] }
const cache = new Map<string, Bust>();
/** A sitter painted in its medium (`key` names it: one per sitter per medium; painted once, kept). */
export const bust = (key: string, spec: BustSpec, medium: Medium = 'none'): Bust => {
  const k = `${key}:${medium}`;
  let s = cache.get(k);
  if (!s) { const p = paint(spec); media[medium](p.buf, spec.seed); s = { img: toCanvas(p.buf), eyes: p.eyes, eyeR: p.eyeR, iris: spec.iris ?? IRIS.brown }; cache.set(k, s); }
  return s;
};

export interface BustFit { x: number; y: number; s: number }
/** Puts a bust down in (x, y, w, h): as big as fits across, the shoulders cut off the bottom before the face is (it
 *  shows at least `minH` of the box's 200 rows), centered, bottom on the rectangle's bottom. Smoothed when shrunk. */
export const fitBust = (x: number, y: number, w: number, h: number, minH = 160): BustFit => {
  const s = Math.min(w / BOX_W, h / minH), vis = Math.min(BOX_H, h / s);
  return { x: x + (w - BOX_W * s) / 2, y: y + h - vis * s, s };
};
export const drawBust = (g: Ctx, bu: Bust, x: number, y: number, w: number, h: number, minH = 160): BustFit => {
  const { s, x: ox, y: oy } = fitBust(x, y, w, h, minH), vis = Math.min(BOX_H, h / s), dw = BOX_W * s, dh = vis * s;
  if (bu.img) {
    g.save(); g.imageSmoothingEnabled = s < 0.8;
    g.drawImage(bu.img, BOX_X, BOX_Y, BOX_W, vis, Math.round(ox), Math.round(oy), Math.round(dw), Math.round(dh));
    g.restore();
  }
  return { x: ox, y: oy, s };
};
/** Where a fitted bust's eyes are (box rows cut off the top accounted for). */
export const bustEyes = (bu: Bust, fit: BustFit, h: number): [number, number][] => {
  const vis = Math.min(BOX_H, h / fit.s), cut = BOX_H - vis;
  return bu.eyes.map(([ex, ey]) => [fit.x + ex * fit.s, fit.y + (ey - cut) * fit.s] as [number, number]);
};
/** Live pupils for a `blankEyes` sitter at (ex, ey) on the screen, `s` its scale, looking toward (tx, ty). */
export const bustPupils = (c: Ctx, bu: Bust, eyes: [number, number][], s: number, tx: number, ty: number) => {
  const ir = Math.max(2, Math.round(5.5 * s)), pr = Math.max(1, Math.round(2.4 * s));
  const hex = (v: number) => `#${((v & 255) | (((v >>> 8) & 255) << 8) | (((v >>> 16) & 255) << 16)).toString(16).padStart(6, '0').replace(/(..)(..)(..)/, '$3$2$1')}`;
  eyes.forEach(([ex, ey], i) => {
    const dx = Math.max(-1, Math.min(1, (tx - ex) / 160)), dy = Math.max(-1, Math.min(1, (ty - ey) / 200));
    const big = i === 1 ? 1.15 : 1, r = Math.round(ir * big), x = Math.round(ex + dx * 4 * s * big), y = Math.round(ey + dy * 3 * s * big);
    c.fillStyle = hex(bu.iris[4]); c.fillRect(x - r, y - r + 1, r * 2, r * 2 - 2); c.fillRect(x - r + 1, y - r, r * 2 - 2, r * 2);
    c.fillStyle = hex(bu.iris[2]); c.fillRect(x - r + 1, y - r + 1, r * 2 - 2, r * 2 - 2);
    c.fillStyle = hex(bu.iris[1]); c.fillRect(x - r + 1, y - r + 1, r - 1, r - 1);
    c.fillStyle = '#000000'; c.fillRect(x - pr, y - pr, pr * 2, pr * 2);
    c.fillStyle = '#FFFFFF'; c.fillRect(x - r + 2, y - r + 2, Math.max(1, Math.round(s * 1.5)), Math.max(1, Math.round(s * 1.5)));
  });
};

// (the kit's material ids this module uses for nothing else, kept so the import's honest)
void M_SCLERA; void M_IRIS; void TOOTH; void BLOOD;
