// THE BIG-KID ZONE, painted (crude-but-clean first pass): the park's 90s "extreme" zone. Far off, the sky by the hour,
// the hills and the CARTOON LAND WATER TOWER, bigger now (monument.ts). Behind the play plane, dimmed (scenery: none of
// it reads as somewhere to stand): the rides' show buildings in squiggles, zigzags and confetti, chain-link, neon lamp
// posts; the couch's garage, the gift shack, the rink's canopy and its ceiling grid, the memorial's faded family mural,
// the pod's hangar, the halfpipe's banner, the big STUPID DAD LIVE billboard. On the play plane, bright and inked, what
// he stands on lit along its top: the skate-park concrete, the glop drums, the rink's rails and scorer's stands, the
// newsstand's awning, the bus shelter, the gift shack's awning; the glop pits, the halfpipe.
//
// STUPID DAD (the failed mid-90s show, the boss's setup): its posters everywhere, all the one design (the fat balding
// dad in a stained tank top on the couch, a beer up, "BOY! BEER!"; AMERICA'S NEW FAVORITE FAMILY!; THIS FALL ON UBX),
// sun-bleached, faded, peeling, one graffitied (a mustache, horns, SUCKS), one with CANCELED slapped across it; the
// gift shack of unsold merch (EVERYTHING 90% OFF; beer-can hats, the talking dolls in the clearance bin); the memorial
// plaque for the dead cast (IN LOVING MEMORY, names, roles, years; dead flowers; somebody's left a beer can on it); the
// faded family mural over it; the STUPID DAD LIVE billboard at the end (the amphitheater: where he's headed).

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText, signW, type Look } from '../../signLetters';
import { box, mix, stamp, hash, onScreen, hour, dimmed, lit, toonSky, INK, type Ctx } from '../kit';
import { MONUMENT_AT } from '../monument';
import { GY } from '../geometry';
import {
  PITS, GROUND, PIPE, PIPE_RUNS, RINK, RAILS, DRUMS, STANDS, NEWSSTAND, SHELTER, SHACK, COUCH, WHIRL, POD, MEMORIAL, BILLBOARD, GATE,
  SIGNS, X, Y, x0 as SX0, x1 as SX1,
} from './layout';

export const drawBigkidBackdrop = (c: Ctx, state: GameState) => toonSky(c, state, MONUMENT_AT.bigkid, { hill: '#B9C99A', near: '#7FA36A' });

const LIP = '#FFFBEB';
const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-bk-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;

// ---------------------------------------------------------------------------------------------------------------
// The zone's lettering: slanted, fat, a hot ramp, drips of glop off the feet (the 90s "extreme" look)

export const zoneLetters = (size = 2, seed = 0): Look => ({ sx: size, sy: size, bold: true, slant: 1, fill: ['#FFFFFF', '#FEF08A', '#FDE047', '#F97316'], dither: true, ink: INK, shadow: '#3B0764', drop: 2, wobble: 1, seed, drip: { col: '#84CC16', tip: '#4D7C0F', rate: 0.3, len: 5 } });
const smallLetters = (fill = '#FFFFFF'): Look => ({ sx: 1, sy: 1, bold: true, fill, ink: INK });
const neon = (col: string, size = 2): Look => ({ sx: size, sy: size, bold: true, fill: ['#FFFFFF', col, col], ink: INK, glow: col });

/**
 * The zone's sign standing at (x, feetY): a jagged lightning-cut board, tipped a touch, on a hazard-striped scaffold
 * pole guyed to a sandbag; the first line big and drippy, the rest small. Painted once for the hour.
 */
export const zoneSign = (c: Ctx, x: number, feetY: number, lines: string[], board = '#7C3AED') => {
  const looks = lines.map((_, i) => (i ? smallLetters(i === lines.length - 1 && lines.length > 2 ? '#FDE047' : '#FFFFFF') : zoneLetters(1, lines.join('').length)));
  const w = Math.max(110, ...lines.map((l, i) => signW(l, looks[i]) + 40)), h = lines.length * 14 + 18, tall = 120;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key(`sign-${lines.join('|')}-${board}`), -w / 2 - 20, -tall - h - 20, w + 40, tall + h + 26, g => {
    const T = (col: string) => hour(col, 0.12);
    // (the sandbag, the pole, its guy wire)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -5, 16, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = T('#A8A29E'); g.beginPath(); g.ellipse(0, -5, 14, 5.5, 0, 0, Math.PI * 2); g.fill();
    box(g, -5, -tall, 10, tall - 4, INK);
    for (let y = -tall + 2; y < -6; y += 12) { box(g, -3, y, 6, 6, T('#FDE047')); box(g, -3, y + 6, 6, 6, T('#1F2937')); }
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -tall + 10); g.lineTo(26, -2); g.stroke();
    // (the board: a jagged cut, tipped)
    g.save(); g.translate(0, -tall - h / 2); g.rotate(-0.04);
    const jag = () => {
      g.moveTo(-w / 2, -h / 2 + 4);
      for (let k = 0; k <= 6; k++) g.lineTo(-w / 2 + (k * w) / 6, -h / 2 + (k % 2 ? -4 : 4));
      g.lineTo(w / 2 + 6, 0);
      for (let k = 6; k >= 0; k--) g.lineTo(-w / 2 + (k * w) / 6, h / 2 + (k % 2 ? 4 : -2));
      g.lineTo(-w / 2 - 6, 0); g.closePath();
    };
    g.beginPath(); jag(); g.fillStyle = T(board); g.fill(); g.strokeStyle = INK; g.lineWidth = 3.5; g.lineJoin = 'round'; g.stroke();
    g.save(); g.beginPath(); jag(); g.clip();
    g.fillStyle = mix(T(board), '#FFFFFF', 0.2); g.fillRect(-w / 2 - 10, -h / 2 - 10, w + 20, 9);
    // (confetti: the 90s)
    for (let k = 0; k < 9; k++) { g.fillStyle = ['#FDE047', '#22D3EE', '#F472B6', '#A3E635'][k % 4]; const cx = -w / 2 + hash(k + w) * w, cy = -h / 2 + hash(k * 3 + h) * h; g.fillRect(cx, cy, 3, 2); }
    g.restore();
    let ly = -h / 2 + 11;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + 7), looks[i]); ly += 14; });
    g.restore();
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// STUPID DAD

/**
 * The show's star as the show drew him, the couch's foot at (x, y), scale k: on a saggy orange couch, the fat balding
 * dad in a stained tank top and striped boxers, black socks pulled up, a three-hair comb-over, stubble, half-shut eyes,
 * a beer up in one hand, mouth open ("BOY! BEER!"); `extra`: the rest of the family round the couch (the mural). `fade`
 * pulls every color toward the paper.
 */
export const dadArt = (g: Ctx, x: number, y: number, k: number, fade: number, paper: string, graffiti = false, family = false) => {
  const F = (col: string) => mix(col, paper, fade);
  g.save(); g.translate(x, y); g.scale(k, k);
  const o = (cx: number, cy: number, rx: number, ry: number, col: string, line = 1.5) => { g.fillStyle = F(INK); g.beginPath(); g.ellipse(cx, cy, rx + line, ry + line, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = F(col); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
  const r = (rx: number, ry: number, w: number, h: number, col: string) => { g.fillStyle = F(INK); g.fillRect(rx - 1.5, ry - 1.5, w + 3, h + 3); g.fillStyle = F(col); g.fillRect(rx, ry, w, h); };
  if (family) {
    // (MOM behind the couch: a big brown perm, pearls, a pink sweater; GRAMPS on the arm: bald, a cardigan, glasses;
    // SIS: a ponytail, braces; THE BOY: a buzz cut, a striped shirt, bringing the beer)
    r(-58, -62, 22, 30, '#F472B6'); o(-47, -74, 9, 10, '#F2C9A0'); for (let i = 0; i < 6; i++) o(-54 + (i % 3) * 7, -86 + Math.floor(i / 3) * 6, 5, 5, '#92400E', 1);
    for (let i = 0; i < 4; i++) { g.fillStyle = F('#FFFFFF'); g.beginPath(); g.arc(-52 + i * 3.5, -63, 1.5, 0, Math.PI * 2); g.fill(); }
    r(32, -58, 18, 24, '#65A30D'); o(41, -68, 8, 9, '#E8B48A'); g.fillStyle = F('#FFFFFF'); g.fillRect(41, -66, 6, 1.5); g.fillStyle = F(INK); g.fillRect(36, -72, 3, 2); g.fillRect(42, -72, 3, 2);
    r(48, -24, 6, 24, '#1D4ED8'); r(58, -24, 6, 24, '#1D4ED8');
    r(46, -50, 20, 26, '#FFFFFF'); for (let i = 0; i < 4; i++) { g.fillStyle = F('#DC2626'); g.fillRect(46, -48 + i * 6, 20, 2); }
    o(56, -60, 8, 9, '#F2C9A0'); g.fillStyle = F('#78350F'); g.fillRect(49, -69, 14, 3);
    r(66, -50, 6, 8, '#DC2626'); g.fillStyle = F('#E5E7EB'); g.fillRect(66, -51, 6, 2);
    r(-70, -40, 14, 40, '#A16207'); o(-63, -48, 8, 9, '#F2C9A0'); g.strokeStyle = F(INK); g.lineWidth = 1.2; g.strokeRect(-67, -50, 4, 3); g.strokeRect(-61, -50, 4, 3);
    g.fillStyle = F('#78350F'); g.beginPath(); g.ellipse(-72, -58, 3, 8, 0.5, 0, Math.PI * 2); g.fill();
  }
  // (the couch)
  r(-40, -48, 80, 24, '#9A3412'); r(-40, -26, 80, 26, '#C2410C');
  for (const cx of [-24, 6]) r(cx, -34, 26, 10, '#EA580C');
  o(-40, -28, 7, 12, '#9A3412'); o(40, -28, 7, 12, '#9A3412');
  // (his legs, the black socks, the boxers)
  r(-18, -24, 7, 22, '#F4B8A0'); r(-4, -24, 7, 22, '#F4B8A0'); r(-18, -10, 7, 10, '#18181B'); r(-4, -10, 7, 10, '#18181B');
  r(-20, -34, 26, 12, '#93C5FD'); for (let i = 0; i < 4; i++) { g.fillStyle = F('#FFFFFF'); g.fillRect(-18 + i * 6, -34, 2, 12); }
  // (the belly: a stained white tank top)
  o(-6, -48, 18, 16, '#F8FAFC'); g.fillStyle = F('#FDE68A'); g.beginPath(); g.ellipse(-2, -44, 6, 4, 0.4, 0, Math.PI * 2); g.fill();
  g.fillStyle = F('#F4B8A0'); g.fillRect(-20, -62, 7, 5); g.fillRect(2, -62, 7, 5);
  // (the arms: one slumped, one with the beer up)
  r(-28, -54, 7, 18, '#F4B8A0'); r(8, -62, 16, 7, '#F4B8A0');
  r(20, -74, 9, 14, '#DC2626'); g.fillStyle = F('#D4D4D8'); g.fillRect(20, -76, 9, 3);
  // (the head: pink, bald, the comb-over, ears, stubble, half-shut eyes, a bulb nose, the mouth open)
  o(-18, -70, 3, 4, '#F4B8A0'); o(6, -70, 3, 4, '#F4B8A0');
  o(-6, -72, 12, 12, '#F4B8A0');
  g.fillStyle = F('#FFE4E6'); g.fillRect(-12, -82, 6, 3);
  g.strokeStyle = F(INK); g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-14 + i * 2, -80 + i); g.quadraticCurveTo(-6, -88 + i, 4, -80 + i * 2); g.stroke(); }
  g.fillStyle = F('#A8A29E'); for (let i = 0; i < 10; i++) g.fillRect(-14 + (i % 5) * 4 + (i > 4 ? 2 : 0), -66 + (i > 4 ? 3 : 0), 1, 1);
  g.fillStyle = F(INK); g.fillRect(-11, -75, 5, 1.5); g.fillRect(-2, -75, 5, 1.5); g.fillRect(-9, -74, 2, 2); g.fillRect(0, -74, 2, 2);
  o(-3, -70, 3, 2.5, '#FB7185', 1);
  g.fillStyle = F('#7F1D1D'); g.beginPath(); g.ellipse(-4, -64, 4, 3, 0, 0, Math.PI * 2); g.fill();
  if (graffiti) {
    // (somebody's been at him: a curly mustache, devil horns, a blacked-out tooth)
    g.strokeStyle = '#18181B'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-14, -66); g.quadraticCurveTo(-9, -70, -4, -67); g.quadraticCurveTo(1, -70, 6, -66); g.stroke();
    g.beginPath(); g.moveTo(-16, -66); g.arc(-17, -68, 2, 0, Math.PI * 1.5); g.moveTo(8, -66); g.arc(9, -68, 2, Math.PI * 1.5, Math.PI, true); g.stroke();
    g.strokeStyle = '#DC2626'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-14, -82); g.lineTo(-18, -94); g.lineTo(-10, -84); g.moveTo(2, -84); g.lineTo(6, -96); g.lineTo(-2, -83); g.stroke();
  }
  g.restore();
};

const UBX: Look = { sx: 1, sy: 1, bold: true, fill: '#FFFFFF', ink: INK };
/** A STUPID DAD poster (104 x 140, its middle-bottom at (x, y)), aged: 'fresh' (only sun-bleached), 'faded', 'peel'
 *  (a corner torn and curled, strips gone), 'graffiti', 'canceled' (a CANCELED strip slapped across), 'live' (the live
 *  show's: SEE STUPID DAD LIVE! THE AMPHITHEATER). Painted once for its look and the hour. */
export type PosterLook = 'fresh' | 'faded' | 'peel' | 'graffiti' | 'canceled' | 'live';
export const PW = 104, PH = 140;
export const poster = (c: Ctx, x: number, y: number, look: PosterLook, dim = false) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, key(`poster-${look}-${dim ? 1 : 0}`), -PW / 2 - 8, -PH - 8, PW + 16, PH + 16, g => {
    const fade = look === 'fresh' ? 0.18 : look === 'live' ? 0.12 : 0.42, paper = '#F5F0E1';
    const T = (col: string) => { const m = mix(col, paper, fade); return dim ? dimmed(m) : hour(m, 0.1); };
    const top = -PH, torn = look === 'peel' || look === 'canceled';
    // (the paper's outline: torn ones missing a corner and a strip off the side)
    const sheet = () => {
      g.moveTo(-PW / 2, top);
      if (torn) { g.lineTo(PW / 2 - 34, top); g.lineTo(PW / 2, top + 30); } else g.lineTo(PW / 2, top);
      g.lineTo(PW / 2, top + PH); g.lineTo(-PW / 2, top + PH);
      if (torn) { g.lineTo(-PW / 2, top + 82); g.lineTo(-PW / 2 + 14, top + 80); g.lineTo(-PW / 2 + 12, top + 60); g.lineTo(-PW / 2, top + 60); }
      g.closePath();
    };
    g.save(); g.beginPath(); sheet(); g.clip();
    // (the paper: sky blue, a sunburst behind the couch)
    g.fillStyle = T(look === 'live' ? '#7C3AED' : '#38BDF8'); g.fillRect(-PW / 2, top, PW, PH);
    g.fillStyle = T(look === 'live' ? '#A78BFA' : '#7DD3FC');
    for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.beginPath(); g.moveTo(0, top + 78); g.lineTo(Math.cos(a) * 90, top + 78 + Math.sin(a) * 90); g.lineTo(Math.cos(a + 0.3) * 90, top + 78 + Math.sin(a + 0.3) * 90); g.closePath(); g.fill(); }
    g.save(); g.beginPath(); g.rect(-PW / 2, top, PW, PH); g.clip();
    dadArt(g, -4, top + 112, 0.82, fade + 0.05, paper, look === 'graffiti');
    g.restore();
    // (the title, the speech balloon, the tagline)
    signText(g, look === 'live' ? 'SEE IT LIVE!' : 'STUPID DAD', 0, top + 20, { sx: 1, sy: 2, bold: true, fill: [T('#FFFFFF'), T('#FDE047'), T('#F59E0B')], ink: INK, shadow: T('#7F1D1D'), drop: 1 });
    g.fillStyle = T('#FFFFFF'); g.beginPath(); g.roundRect(4, top + 28, 46, 13, 5); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.moveTo(10, top + 41); g.lineTo(6, top + 48); g.lineTo(16, top + 41); g.fillStyle = T('#FFFFFF'); g.fill();
    signText(g, 'BOY! BEER!', 27, top + 38, { sx: 1, sy: 1, fill: INK, gap: 0, space: 2 });
    box(g, -PW / 2, top + 112, PW, 28, T('#1E3A8A'));
    if (look === 'live') { signText(g, 'THE AMPHITHEATER', 0, top + 123, smallLetters(T('#FDE047'))); signText(g, 'SHOWS DAILY!', 0, top + 134, smallLetters(T('#FFFFFF'))); }
    else { signText(g, "AMERICA'S NEW", 0, top + 122, smallLetters(T('#FFFFFF'))); signText(g, 'FAVORITE FAMILY!', 0, top + 132, smallLetters(T('#FDE047'))); }
    if (look !== 'live') { box(g, -PW / 2 + 4, top + 44, 40, 10, T('#DC2626')); signText(g, 'THIS FALL', -PW / 2 + 24, top + 52, { ...UBX, bold: false }); box(g, PW / 2 - 30, top + 96, 26, 12, T('#FDE047')); signText(g, 'UBX', PW / 2 - 17, top + 105, { sx: 1, sy: 1, bold: true, fill: INK }); }
    // (the aging: a stain, creases; the peeling one's corner torn and curled, a strip gone; the graffiti; CANCELED)
    g.fillStyle = 'rgba(120,90,40,0.12)'; g.beginPath(); g.ellipse(-PW / 4, top + PH * 0.7, 20, 14, 0.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(80,60,30,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-PW / 2, top + PH / 2); g.lineTo(PW / 2, top + PH / 2 + 4); g.moveTo(2, top); g.lineTo(-2, top + PH); g.stroke();
    if (look === 'graffiti') signText(g, 'SUCKS', 6, top + 92, { sx: 2, sy: 2, bold: true, slant: 1, fill: '#DC2626', drip: { col: '#B91C1C', rate: 0.6, len: 8 }, seed: 7 });
    if (look === 'canceled') { g.save(); g.translate(0, top + 70); g.rotate(-0.42); box(g, -70, -9, 140, 18, INK); box(g, -68, -7, 136, 14, '#DC2626'); signText(g, 'CANCELED', 0, 4, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' }); g.restore(); }
    g.restore();
    // (the edge; the torn corner curled back over)
    g.beginPath(); sheet(); g.strokeStyle = INK; g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke();
    if (torn) {
      g.fillStyle = mix(paper, '#C9BFA4', 0.5); g.beginPath(); g.moveTo(PW / 2 - 34, top); g.quadraticCurveTo(PW / 2 - 22, top + 20, PW / 2, top + 30); g.lineTo(PW / 2 - 14, top + 10); g.closePath(); g.fill();
      g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    }
    // (the staples)
    for (const [sx, sy] of [[-PW / 2 + 4, top + 4], [PW / 2 - 4, top + PH - 4], [-PW / 2 + 4, top + PH - 4]]) box(g, sx - 2, sy, 4, 1, '#9CA3AF');
  });
  c.restore();
};

/** Where the posters are (each on something: the column, the fence, the garage, the shack, the rink, the booth, the
 *  hangar): [x, feet height of its bottom edge, look]. */
const POSTERS: [number, number, PosterLook][] = [
  [640, 50, 'fresh'],
  [890, 16, 'faded'], [1000, 16, 'graffiti'], [1110, 16, 'canceled'], [1220, 16, 'peel'],
  [5180, 10, 'peel'], [6140, 10, 'faded'],
  [7140, 20, 'peel'],
  [9040, 0, 'faded'],
];

// ---------------------------------------------------------------------------------------------------------------
// Behind: the zone's show buildings (scenery), the lamp posts

const WALLS = ['#A78BFA', '#5EEAD4', '#F9A8D4', '#FDE047', '#93C5FD', '#FDBA74'];
/** One of the zone's boxy show buildings (seeded): squiggles, triangles, confetti, a zigzag band, a parapet. */
const building = (c: Ctx, x: number, seed: number) => {
  const w = 160 + Math.round(hash(seed) * 90), h = 190 + Math.round(hash(seed + 1) * 150);
  const wall = WALLS[seed % WALLS.length];
  c.save(); c.translate(Math.round(x), GY);
  stamp(c, key(`bldg-${seed}`), -w / 2 - 10, -h - 30, w + 20, h + 34, g => {
    const W = dimmed(wall), K = dimmed(INK);
    g.fillStyle = K; g.fillRect(-w / 2 - 2, -h - 2, w + 4, h + 2); g.fillStyle = W; g.fillRect(-w / 2, -h, w, h);
    // (the zigzag band, a parapet, squiggles and triangles, confetti)
    const band = dimmed(WALLS[(seed + 2) % WALLS.length]);
    g.fillStyle = band; g.beginPath(); g.moveTo(-w / 2, -h * 0.55);
    for (let k = 0; k <= 10; k++) g.lineTo(-w / 2 + (k * w) / 10, -h * 0.55 + (k % 2 ? -12 : 12));
    g.lineTo(w / 2, -h * 0.45); for (let k = 10; k >= 0; k--) g.lineTo(-w / 2 + (k * w) / 10, -h * 0.45 + (k % 2 ? -12 : 12)); g.closePath(); g.fill();
    g.strokeStyle = dimmed(['#1F2937', '#DB2777', '#0D9488'][seed % 3]); g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); for (let k = 0; k < 6; k++) { const sx = -w / 2 + 20 + k * (w - 40) / 5; g.lineTo(sx, -h * 0.78 + (k % 2 ? -10 : 10)); } g.stroke();
    for (let k = 0; k < 4; k++) { g.fillStyle = dimmed(['#F97316', '#7C3AED', '#22D3EE', '#EC4899'][(k + seed) % 4]); const tx = -w / 2 + 20 + hash(seed * 3 + k) * (w - 40), ty = -h * 0.3 + hash(seed + k * 5) * h * 0.2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + 14, ty + 4); g.lineTo(tx + 4, ty + 16); g.closePath(); g.fill(); }
    for (let k = 0; k < 14; k++) { g.fillStyle = dimmed(['#FDE047', '#22D3EE', '#F472B6', '#A3E635'][k % 4]); g.fillRect(-w / 2 + hash(seed + k * 7) * w, -h + hash(seed * 2 + k) * h * 0.9, 4, 3); }
    g.fillStyle = K; g.fillRect(-w / 2 - 6, -h - 10, w + 12, 12); g.fillStyle = dimmed('#1F2937'); g.fillRect(-w / 2 - 4, -h - 8, w + 8, 8);
    // (a loading door, a vent fan)
    g.fillStyle = K; g.fillRect(-26, -64, 52, 64); g.fillStyle = dimmed('#52525B'); g.fillRect(-24, -62, 48, 62);
    for (let y = -58; y < 0; y += 6) { g.fillStyle = dimmed('#3F3F46'); g.fillRect(-24, y, 48, 2); }
    g.fillStyle = K; g.beginPath(); g.arc(w / 2 - 30, -h + 40, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#71717A'); g.beginPath(); g.arc(w / 2 - 30, -h + 40, 11, 0, Math.PI * 2); g.fill();
  });
  c.restore();
};
/** A neon lamp post (a black pole, a hot-pink ring of neon at the top; glowing after dark). */
const LAMPS = [520, 1700, 2600, 3420, 4880, 6380, 7080, 8460, 9180, 10560, 11400];
const lampPost = (c: Ctx, x: number, f: number) => {
  box(c, x - 3, GY - 170, 6, 170, INK); box(c, x - 1, GY - 168, 2, 166, hour('#3F3F46'));
  const on = lit();
  c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.ellipse(x, GY - 180, 16, 8, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = on ? (f >> 5) % 7 === 0 ? '#9D174D' : '#F9A8D4' : hour('#DB2777'); c.lineWidth = 3.5; c.stroke();
};

// ---------------------------------------------------------------------------------------------------------------
// The set pieces' buildings and furniture

/** The zone gate: two spray-painted concrete pillars, a beam across up high with the neon on it (THE BIG-KID ZONE, NO
 *  TRACKS. NO LIMITS.). Behind him; the beam's top dark (nothing to stand on). */
const gateArch = (c: Ctx, cx: number, top: string, sub: string, col: string, tag: string) => {
  const w = 420, hy = Y(300);
  c.save(); c.translate(Math.round(cx), 0);
  stamp(c, key(`arch-${top}`), -w / 2 - 30, hy - 60, w + 60, GY - hy + 64, g => {
    for (const s of [-1, 1]) {
      const px0 = s * w / 2 - 24;
      g.fillStyle = INK; g.fillRect(px0 - 2, hy, 52, GY - hy); g.fillStyle = dimmed('#A8A29E'); g.fillRect(px0, hy + 2, 48, GY - hy - 2);
      g.fillStyle = dimmed('#78716C'); g.fillRect(px0 + 36, hy + 2, 12, GY - hy - 2);
      // (tags sprayed up the pillars)
      g.strokeStyle = dimmed(['#EC4899', '#22D3EE'][s > 0 ? 1 : 0]); g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(px0 + 6, GY - 60); g.bezierCurveTo(px0 + 30, GY - 90, px0 + 4, GY - 110, px0 + 40, GY - 130); g.stroke();
    }
    g.fillStyle = INK; g.fillRect(-w / 2 - 28, hy - 46, w + 56, 52); g.fillStyle = dimmed('#1F2937'); g.fillRect(-w / 2 - 26, hy - 44, w + 52, 48);
    // (the neon: tubes on the beam's face, the words lit)
    signText(g, top, 0, hy - 18, neon(col, 2));
    signText(g, sub, 0, hy - 2, neon('#22D3EE', 1));
    signText(g, tag, -w / 2 + 6, hy + 30, { sx: 1, sy: 1, bold: true, fill: dimmed('#F472B6'), slant: 1 });
  });
  c.restore();
};
/** A poster column (an advertising pillar with a domed cap). */
const posterColumn = (c: Ctx, x: number) => {
  c.save(); c.translate(Math.round(x), 0);
  stamp(c, key('column'), -70, Y(240), 140, 244, g => {
    g.fillStyle = INK; g.fillRect(-62, Y(210), 124, 210); g.fillStyle = dimmed('#047857'); g.fillRect(-60, Y(208), 120, 208);
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, Y(212), 66, 14, 0, Math.PI, 0); g.fill(); g.fillStyle = dimmed('#065F46'); g.beginPath(); g.ellipse(0, Y(212), 62, 11, 0, Math.PI, 0); g.fill();
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, Y(222), 20, 16, 0, Math.PI, 0); g.fill(); g.fillStyle = dimmed('#FDE047'); g.beginPath(); g.ellipse(0, Y(222), 4, 4, 0, 0, Math.PI * 2); g.fill();
  });
  c.restore();
};
/** The construction fence the posters are pasted along (plywood on posts, a WET PASTE warning stenciled). */
const posterFence = (c: Ctx, a: number, b: number) => {
  const xa = X(a), xb = X(b), top = Y(170);
  c.save(); c.translate(xa, 0);
  stamp(c, key(`fence-${a}`), -4, top - 4, xb - xa + 8, GY - top + 6, g => {
    g.fillStyle = INK; g.fillRect(-2, top, xb - xa + 4, GY - top); g.fillStyle = dimmed('#C8A97E'); g.fillRect(0, top + 2, xb - xa, GY - top - 2);
    for (let x = 0; x < xb - xa; x += 60) { g.fillStyle = dimmed('#A88B62'); g.fillRect(x, top + 2, 2, GY - top - 2); }
    signText(g, 'POST NO BILLS', (xb - xa) / 2, GY - 6, { sx: 1, sy: 1, stencil: true, fill: dimmed('#44403C') });
  });
  c.restore();
};
/** The couch's garage: a cinderblock shed, its roll-up door up (dark inside), COUCH DUDES painted over it. */
const garage = (c: Ctx) => {
  const [a, b] = COUCH.barn, xa = X(a), w = X(b) - xa, top = Y(200);
  c.save(); c.translate(xa, 0);
  stamp(c, key('garage'), -10, top - 30, w + 20, GY - top + 34, g => {
    g.fillStyle = INK; g.fillRect(-2, top - 2, w + 4, GY - top + 2); g.fillStyle = dimmed('#94A3B8'); g.fillRect(0, top, w, GY - top);
    for (let y = top + 10; y < GY; y += 14) for (let x = (y / 14) % 2 ? 0 : 20; x < w; x += 40) { g.fillStyle = dimmed('#7C8BA0'); g.fillRect(x, y, 38, 2); }
    g.fillStyle = INK; g.fillRect(28, top + 60, w - 56, GY - top - 60); g.fillStyle = dimmed('#0F172A'); g.fillRect(30, top + 62, w - 60, GY - top - 62);
    g.fillStyle = dimmed('#64748B'); g.fillRect(30, top + 62, w - 60, 16);
    for (let y = top + 64; y < top + 78; y += 4) { g.fillStyle = dimmed('#475569'); g.fillRect(30, y, w - 60, 1); }
    signText(g, 'COUCH DUDES', w / 2, top + 36, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FDE047'), dimmed('#F97316')], ink: dimmed(INK) });
  });
  c.restore();
};
/** The bus shelter: a roof on two poles (lit along its top: stand on it), a glass panel behind with an ad in it, a
 *  bench; the PARK SHUTTLE sign on its pole (trackless too). */
const shelter = (c: Ctx) => {
  const [a, b, h] = SHELTER, xa = X(a), xb = X(b), top = Y(h);
  // (the panel and the bench behind)
  box(c, xa + 8, top + 14, xb - xa - 16, GY - top - 30, INK); box(c, xa + 10, top + 16, xb - xa - 20, GY - top - 34, dimmed('#BAE6FD'));
  box(c, xa + 24, GY - 32, xb - xa - 48, 6, dimmed('#78716C'));
  for (const px of [xa + 6, xb - 10]) { box(c, px, top + 6, 4, GY - top - 6, INK); box(c, px + 1, top + 6, 2, GY - top - 6, hour('#A1A1AA')); }
  box(c, xa - 6, top - 2, xb - xa + 12, 12, INK); box(c, xa - 4, top, xb - xa + 8, 8, hour('#0D9488')); box(c, xa - 4, top, xb - xa + 8, 2, LIP);
  // (its sign, up on a pole beside it)
  box(c, xb + 10, GY - 150, 4, 150, INK);
  box(c, xb - 18, GY - 160, 60, 26, INK); box(c, xb - 16, GY - 158, 56, 22, hour('#FDE047'));
  signText(c, 'PARK', xb + 12, GY - 149, { sx: 1, sy: 1, bold: true, fill: INK }); signText(c, 'SHUTTLE', xb + 12, GY - 140, { sx: 1, sy: 1, fill: INK });
};
/** The newsstand: its awning on two poles (lit: stand on it), the racks of 90s magazines behind. */
const newsstand = (c: Ctx) => {
  const [a, b, h] = NEWSSTAND, xa = X(a), xb = X(b), top = Y(h);
  box(c, xa + 6, top + 14, xb - xa - 12, GY - top - 14, INK); box(c, xa + 8, top + 16, xb - xa - 16, GY - top - 16, dimmed('#7C2D12'));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) box(c, xa + 12 + k * 18, top + 22 + r * 26, 14, 20, dimmed(['#F472B6', '#FDE047', '#22D3EE', '#A3E635', '#F97316'][(k + r) % 5]));
  for (const px of [xa + 2, xb - 6]) { box(c, px, top + 4, 4, GY - top - 4, INK); box(c, px + 1, top + 4, 2, GY - top - 4, hour('#A1A1AA')); }
  box(c, xa - 8, top - 2, xb - xa + 16, 14, INK);
  for (let k = 0; k < xb - xa + 12; k += 12) box(c, xa - 6 + k, top, 6, 10, hour(k % 24 ? '#FFFFFF' : '#16A34A'));
  box(c, xa - 6, top, xb - xa + 12, 2, LIP);
};
/** The STUPID DAD STORE (gift shack): a shack with the dad's painted head on its roof sign, the window full of unsold
 *  merch, EVERYTHING 90% OFF (NOW 95%), the awning (lit: stand on it). The clearance bin out front. */
const shack = (c: Ctx) => {
  const xa = X(SHACK.a), w = X(SHACK.b) - xa, top = Y(230);
  c.save(); c.translate(xa, 0);
  stamp(c, key('shack'), -20, top - 120, w + 40, GY - top + 124, g => {
    g.fillStyle = INK; g.fillRect(-2, top - 2, w + 4, GY - top + 2); g.fillStyle = dimmed('#FEF3C7'); g.fillRect(0, top, w, GY - top);
    for (let x = 0; x < w; x += 22) { g.fillStyle = dimmed('#FDE68A'); g.fillRect(x, top, 3, GY - top); }
    // (the roof sign: the dad's big head on a board, THE STUPID DAD STORE)
    g.fillStyle = INK; g.fillRect(w / 2 - 150, top - 70, 300, 64); g.fillStyle = dimmed('#1E3A8A'); g.fillRect(w / 2 - 148, top - 68, 296, 60);
    signText(g, 'THE STUPID DAD STORE', w / 2 + 30, top - 42, { sx: 1, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink: dimmed(INK) });
    signText(g, 'GIFTS! TOYS! COLLECTIBLES!', w / 2 + 30, top - 20, { sx: 1, sy: 1, fill: dimmed('#FFFFFF') });
    g.save(); g.beginPath(); g.rect(w / 2 - 148, top - 120, 80, 112); g.clip(); dadArt(g, w / 2 - 104, top + 8, 0.95, 0.2, '#1E3A8A'); g.restore();
    // (the window: shelves of beer-can hats in a pyramid, mugs, foam couches, the dolls)
    const wx = 160, wy = top + 60, ww = 260, wh = 110;
    g.fillStyle = INK; g.fillRect(wx - 3, wy - 3, ww + 6, wh + 6); g.fillStyle = dimmed('#1E293B'); g.fillRect(wx, wy, ww, wh);
    for (let s = 0; s < 3; s++) { g.fillStyle = dimmed('#A16207'); g.fillRect(wx, wy + 34 + s * 36, ww, 3); }
    for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
      const ix = wx + 10 + k * 28, iy = wy + 32 + row * 36;
      if (row === 0) { g.fillStyle = dimmed('#DC2626'); g.fillRect(ix, iy - 14, 8, 12); g.fillRect(ix + 12, iy - 14, 8, 12); g.fillStyle = dimmed('#FDE047'); g.fillRect(ix - 2, iy - 4, 24, 3); }
      else if (row === 1) { g.fillStyle = dimmed('#F8FAFC'); g.fillRect(ix + 2, iy - 16, 14, 14); g.fillStyle = dimmed('#F4B8A0'); g.beginPath(); g.arc(ix + 9, iy - 10, 4, 0, Math.PI * 2); g.fill(); }
      else { g.fillStyle = dimmed('#C2410C'); g.fillRect(ix, iy - 10, 22, 8); g.fillRect(ix, iy - 16, 22, 6); }
    }
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(wx + 20, wy); g.lineTo(wx + 60, wy); g.lineTo(wx + 20, wy + wh); g.lineTo(wx - 20, wy + wh); g.closePath(); g.fill();
    // (the sale banner across the window, the sticker over it)
    g.fillStyle = INK; g.fillRect(wx - 10, wy - 34, ww + 20, 26); g.fillStyle = dimmed('#DC2626'); g.fillRect(wx - 8, wy - 32, ww + 16, 22);
    signText(g, 'EVERYTHING 90% OFF!', wx + ww / 2, wy - 16, { sx: 1, sy: 2, bold: true, fill: dimmed('#FFFFFF'), ink: dimmed(INK) });
    g.save(); g.translate(wx + ww - 10, wy - 34); g.rotate(0.3); g.fillStyle = INK; g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#FDE047'); g.beginPath(); g.arc(0, 0, 20, 0, Math.PI * 2); g.fill();
    signText(g, 'NOW', 0, -4, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') }); signText(g, '95%', 0, 6, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') }); g.restore();
    // (the door, a cardboard standee of him by it: HAVE YOU HUGGED A STUPID DAD TODAY?)
    g.fillStyle = INK; g.fillRect(450, top + 70, 54, GY - top - 70); g.fillStyle = dimmed('#7C2D12'); g.fillRect(452, top + 72, 50, GY - top - 72);
    g.fillStyle = dimmed('#FDE047'); g.fillRect(492, top + 120, 4, 4);
  });
  c.restore();
  // (the awning over the window: on brackets, striped, lit along its top)
  const [aa, ab, ah] = SHACK.awning, ty = Y(ah);
  box(c, X(aa) - 4, ty - 2, X(ab) - X(aa) + 8, 16, INK);
  for (let k = 0; k < X(ab) - X(aa) + 4; k += 14) box(c, X(aa) - 2 + k, ty, 7, 12, hour(k % 28 ? '#FFFFFF' : '#1E3A8A'));
  for (const bx of [X(aa) + 6, X(ab) - 10]) { c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, ty + 12); c.lineTo(bx + (bx < X(aa) + 20 ? 10 : -10), ty + 40); c.stroke(); }
  box(c, X(aa) - 2, ty, X(ab) - X(aa) + 4, 2, LIP);
};
/** The clearance bin out front (a wire basket on legs; not to stand on): the dolls piled in it, heads and beer cans
 *  sticking out, a card: CLEARANCE! PULL MY STRING! */
const dollBin = (c: Ctx, x: number, f: number, talking: boolean) => {
  const top = Y(56);
  for (let i = 0; i < 7; i++) {
    const dx = x - 34 + i * 11, dy = top + 6 + (i % 2) * 5;
    c.fillStyle = INK; c.beginPath(); c.arc(dx, dy, 6.5, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#F4B8A0'); c.beginPath(); c.arc(dx, dy, 5, 0, Math.PI * 2); c.fill();
    box(c, dx - 2, dy - 1, 1, 1, INK); box(c, dx + 1, dy - 1, 1, 1, INK); box(c, dx - 1, dy + 2, 3, 1, '#7F1D1D');
    if (i % 3 === 0) { box(c, dx + 4, dy - 9, 4, 7, INK); box(c, dx + 5, dy - 8, 2, 5, '#DC2626'); }
  }
  // (the one that's talking jiggles, its string out)
  if (talking) { const dx = x + 14; c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(dx, top + 10); c.quadraticCurveTo(dx + 10, top + 24, dx + 16 + Math.sin(f * 0.5) * 2, top + 30); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(x - 42, top + 8, 84, 30);
  c.strokeStyle = hour('#A1A1AA'); c.lineWidth = 1; for (let k = x - 40; k < x + 42; k += 8) { c.beginPath(); c.moveTo(k, top + 8); c.lineTo(k, top + 38); c.stroke(); } for (let y = top + 14; y < top + 38; y += 8) { c.beginPath(); c.moveTo(x - 42, y); c.lineTo(x + 42, y); c.stroke(); }
  for (const lx of [x - 38, x + 36]) box(c, lx, top + 38, 3, GY - top - 38, INK);
  box(c, x - 30, top - 30, 60, 24, INK); box(c, x - 28, top - 28, 56, 20, '#FDE047');
  signText(c, 'CLEARANCE!', x, top - 19, { sx: 1, sy: 1, bold: false, fill: '#B91C1C' });
  signText(c, 'PULL MY STRING!', x, top - 10, { sx: 1, sy: 1, bold: false, fill: INK, gap: 0, space: 2 });
};
/** The rink: the canopy and its electric ceiling grid behind (out of reach, dimmed), the chain-link at its back, the
 *  diamond-plate floor, the rails at its ends (solid, lit along the top). */
const rink = (c: Ctx, state: GameState) => {
  const xa = X(RINK.a), xb = X(RINK.b), gy = Y(330);
  // (the canopy's posts and roof)
  for (const px of [xa - 20, xb + 16]) { box(c, px, gy - 60, 8, GY - gy + 60, INK); box(c, px + 2, gy - 58, 4, GY - gy + 58, dimmed('#71717A')); }
  box(c, xa - 40, gy - 76, xb - xa + 80, 22, INK); box(c, xa - 38, gy - 74, xb - xa + 76, 18, dimmed('#7C3AED'));
  for (let x = xa - 38; x < xb + 38; x += 40) { c.fillStyle = dimmed('#FDE047'); c.beginPath(); c.moveTo(x, gy - 56); c.lineTo(x + 20, gy - 46); c.lineTo(x + 40, gy - 56); c.fill(); }
  signText(c, 'BUMPER BASH', (xa + xb) / 2, gy - 60, { sx: 1, sy: 1, bold: true, fill: dimmed('#FFFFFF') });
  // (the grid: a fine mesh the cars' poles drag along)
  c.strokeStyle = dimmed('#52525B'); c.lineWidth = 1;
  const l = Math.max(xa, state.camera.x - 20), r = Math.min(xb, state.camera.x + 820);
  for (let x = Math.floor(l / 16) * 16; x < r; x += 16) { c.beginPath(); c.moveTo(x, gy - 8); c.lineTo(x + 8, gy); c.lineTo(x + 16, gy - 8); c.stroke(); }
  box(c, xa, gy - 10, xb - xa, 2, dimmed('#3F3F46'));
  // (the chain-link fence at the back, on its posts, a rail along its top)
  c.save(); c.beginPath(); c.rect(l, GY - 150, r - l, 150); c.clip();
  c.strokeStyle = dimmed('#A1A1AA'); c.lineWidth = 1;
  for (let x = Math.floor((l - 150) / 14) * 14; x < r + 150; x += 14) { c.beginPath(); c.moveTo(x, GY - 150); c.lineTo(x + 150, GY); c.moveTo(x, GY - 150); c.lineTo(x - 150, GY); c.stroke(); }
  c.restore();
  for (let x = xa + 60; x < xb; x += 180) box(c, x, GY - 156, 5, 156, dimmed('#71717A'));
  box(c, l, GY - 156, r - l, 4, dimmed('#71717A'));
  // (the floor: steel diamond plate)
  box(c, xa, GY, xb - xa, 14, hour('#9CA3AF'));
  for (let x = Math.floor(l / 12) * 12; x < r; x += 12) { box(c, x + 2, GY + 4, 4, 2, hour('#D1D5DB')); box(c, x + 8, GY + 9, 4, 2, hour('#D1D5DB')); }
  box(c, xa, GY, xb - xa, 2, LIP);
  // (the rails: hazard-striped barriers, solid, lit along their tops)
  for (const [a, b] of RAILS) {
    const ra = X(a), rb = X(b), top = Y(RINK.rail);
    box(c, ra, top, rb - ra, GY - top, INK);
    for (let y = top + 2; y < GY; y += 10) box(c, ra + 2, y, rb - ra - 4, 5, hour('#FDE047'));
    for (let y = top + 7; y < GY; y += 10) box(c, ra + 2, y, rb - ra - 4, 5, hour('#1F2937'));
    box(c, ra, top, rb - ra, 3, LIP);
  }
};
/** The scorer's stands: scaffolds, planks on top (lit). */
const stands = (c: Ctx, state: GameState) => {
  for (const [a, b, h] of STANDS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onScreen(state, xa, xb)) continue;
    for (const px of [xa + 4, xb - 8]) { box(c, px, top, 4, GY - top, INK); box(c, px + 1, top, 2, GY - top, hour('#A1A1AA')); }
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(xa + 6, top + 10); c.lineTo(xb - 6, GY - 10); c.moveTo(xb - 6, top + 10); c.lineTo(xa + 6, GY - 10); c.stroke();
    box(c, xa - 2, top - 2, xb - xa + 4, 12, INK); box(c, xa, top, xb - xa, 8, hour('#B45309'));
    box(c, xa, top, xb - xa, 2, LIP);
  }
};
/** The glop drums: stacked green drums, GLOP stenciled, slime run down them, their lids lit. */
const drums = (c: Ctx, state: GameState) => {
  for (const [a, b, h] of DRUMS) {
    const xa = X(a), xb = X(b), w = xb - xa;
    if (!onScreen(state, xa, xb)) continue;
    c.save(); c.translate(xa, 0);
    stamp(c, key(`drums-${w}-${h}`), -4, Y(h) - 6, w + 8, h + 10, g => {
      for (let tier = 0; tier < 2; tier++) {
        const y1 = GY - (h / 2) * tier, y0 = y1 - h / 2;
        g.fillStyle = INK; g.fillRect(0, y0, w, h / 2); g.fillStyle = hour('#15803D'); g.fillRect(2, y0 + 2, w - 4, h / 2 - 3);
        g.fillStyle = hour('#22C55E'); g.fillRect(4, y0 + 2, w * 0.25, h / 2 - 3);
        g.fillStyle = hour('#166534'); g.fillRect(w * 0.7, y0 + 2, w * 0.25, h / 2 - 3);
        for (const ry of [y0 + 8, y1 - 10]) { g.fillStyle = INK; g.fillRect(0, ry, w, 2); }
        signText(g, 'GLOP', w / 2, y0 + h / 4 + 4, { sx: 1, sy: 1, stencil: true, bold: true, fill: hour('#FDE047') });
        g.fillStyle = hour('#A3E635'); g.fillRect(w * 0.6, y0 + 2, 5, 10 + tier * 6); g.beginPath(); g.arc(w * 0.6 + 2.5, y0 + 12 + tier * 6, 3, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = INK; g.fillRect(-2, Y(h) - 2, w + 4, 6); g.fillStyle = hour('#4ADE80'); g.fillRect(0, Y(h), w, 3); g.fillStyle = LIP; g.fillRect(0, Y(h), w, 2);
    });
    c.restore();
  }
};
/** The memorial: the family mural (faded, peeling) on the wall behind; the plaque on its stone (not to stand on: a
 *  sloped top), dead flowers in a pot, a crushed beer can left on it; a bench. */
const memorial = (c: Ctx) => {
  const [wa, wb] = MEMORIAL.wall, xa = X(wa), w = X(wb) - xa, top = Y(260);
  c.save(); c.translate(xa, 0);
  stamp(c, key('mural'), -6, top - 6, w + 12, GY - top + 8, g => {
    g.fillStyle = INK; g.fillRect(-2, top - 2, w + 4, GY - top + 2); g.fillStyle = dimmed('#D6CFC0'); g.fillRect(0, top, w, GY - top);
    // (the mural: sky, a sunburst, the family on the couch, AMERICA'S NEW FAVORITE FAMILY! across the top; faded hard)
    const paper = '#D6CFC0';
    g.fillStyle = dimmed(mix('#7DD3FC', paper, 0.55)); g.fillRect(10, top + 10, w - 20, GY - top - 40);
    g.save(); g.beginPath(); g.rect(10, top + 10, w - 20, GY - top - 40); g.clip();
    dadArt(g, w / 2 - 20, GY - 34, 1.65, 0.62, '#C9C2B2', false, true);
    g.restore();
    signText(g, "AMERICA'S NEW FAVORITE FAMILY!", w / 2, top + 30, { sx: 1, sy: 2, bold: true, fill: dimmed(mix('#FDE047', paper, 0.5)), ink: dimmed(mix(INK, paper, 0.4)) });
    // (the peeling: patches of paint gone to the bare wall)
    for (let k = 0; k < 9; k++) { g.fillStyle = dimmed('#BDB5A3'); const px = 14 + hash(k * 3.1) * (w - 40), py = top + 14 + hash(k * 7.7) * (GY - top - 60); g.beginPath(); g.ellipse(px, py, 8 + hash(k) * 14, 5 + hash(k + 2) * 8, hash(k + 4), 0, Math.PI * 2); g.fill(); }
    g.fillStyle = INK; g.fillRect(0, GY - 30, w, 2);
  });
  c.restore();
  // (the bench: a park bench, behind the path (dimmed), a dedication on its back slat)
  const bx = X(MEMORIAL.bench);
  for (const lx of [bx - 50, bx + 46]) box(c, lx, GY - 30, 4, 30, dimmed(INK));
  box(c, bx - 56, GY - 34, 112, 6, dimmed('#7C2D12')); box(c, bx - 56, GY - 58, 112, 6, dimmed('#7C2D12')); box(c, bx - 56, GY - 46, 112, 6, dimmed('#7C2D12'));
  // (the stone and its plaque: a sloped granite block, a bronze plate)
  const px = X(MEMORIAL.plaque);
  c.save(); c.translate(px, 0);
  stamp(c, key('plaque'), -140, Y(120), 280, 124, g => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-132, GY); g.lineTo(-128, Y(96)); g.lineTo(128, Y(112)); g.lineTo(132, GY); g.closePath(); g.fill();
    g.fillStyle = hour('#6B7280'); g.beginPath(); g.moveTo(-129, GY); g.lineTo(-125, Y(93)); g.lineTo(125, Y(109)); g.lineTo(129, GY); g.closePath(); g.fill();
    g.fillStyle = hour('#4B5563'); g.fillRect(60, Y(100), 66, 100);
    g.fillStyle = INK; g.fillRect(-120, Y(100) + 4, 240, 92); g.fillStyle = hour('#A16207'); g.fillRect(-118, Y(100) + 6, 236, 88);
    g.fillStyle = hour('#CA8A04'); g.fillRect(-118, Y(100) + 6, 236, 3);
    const brass = (t: string, y: number, big = false) => signText(g, t, 0, Y(100) + y, { sx: 1, sy: big ? 2 : 1, bold: big, fill: hour('#FEF3C7'), shadow: hour('#713F12'), drop: 1, gap: big ? 1 : 0, space: 2 });
    brass('IN LOVING MEMORY', 22, true);
    brass('THE VOICES OF STUPID DAD', 33);
    brass('MARLENE KOVACS, MOM, 1949-1996', 46);
    brass('DONNA PRUITT, THE BOY, 1957-1998', 56);
    brass('SHERRI BLAINE, SIS, 1961-1999', 66);
    brass('HAL GUNDERSON, GRAMPS, 1919-1996', 76);
    brass("THEY'LL ALWAYS BE FAMILY.", 89);
  });
  c.restore();
  // (dead flowers in a pot at its foot; the crushed beer can somebody left on top)
  const fx = px - 150;
  box(c, fx - 12, GY - 20, 24, 20, INK); box(c, fx - 10, GY - 18, 20, 18, hour('#9A3412'));
  c.strokeStyle = hour('#57534E'); c.lineWidth = 1.5;
  for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(fx - 6 + k * 4, GY - 20); c.quadraticCurveTo(fx - 10 + k * 6, GY - 40, fx - 16 + k * 9, GY - 34 + (k % 2) * 4); c.stroke(); c.fillStyle = hour('#78716C'); c.beginPath(); c.arc(fx - 16 + k * 9, GY - 34 + (k % 2) * 4, 3, 0, Math.PI * 2); c.fill(); }
  c.save(); c.translate(px + 96, Y(108)); c.rotate(-0.06);
  box(c, -5, -12, 11, 12, INK); box(c, -4, -11, 9, 10, '#DC2626'); box(c, -4, -11, 9, 2, '#D4D4D8'); box(c, -1, -8, 3, 6, '#FDE047');
  c.restore();
};
/** The whirl's plaza: its ticket booth (a poster on its side), a GIGGLES banner strung between two poles. */
const whirlPlaza = (c: Ctx) => {
  const bx = X(7140);
  box(c, bx - 64, Y(230), 128, 230, INK); box(c, bx - 62, Y(228), 124, 228, dimmed('#EA580C'));
  box(c, bx - 40, Y(212), 80, 34, dimmed('#1E293B'));
  for (let k = 0; k < 6; k++) { c.fillStyle = dimmed(k % 2 ? '#FFFFFF' : '#9333EA'); c.beginPath(); c.moveTo(bx - 66 + k * 22, Y(230)); c.lineTo(bx - 55 + k * 22, Y(258)); c.lineTo(bx - 44 + k * 22, Y(230)); c.fill(); }
  const ya = X(WHIRL.a) + 40, yb = X(WHIRL.b) - 40;
  for (const px of [ya, yb]) { box(c, px - 3, Y(380), 6, 380, dimmed(INK)); }
  c.strokeStyle = dimmed(INK); c.lineWidth = 1.5; c.beginPath(); c.moveTo(ya, Y(370)); c.quadraticCurveTo((ya + yb) / 2, Y(330), yb, Y(370)); c.stroke();
  for (let k = 0; k < 18; k++) { const t = k / 17, fx = ya + (yb - ya) * t, fy = Y(370) + Math.sin(t * Math.PI) * 40; c.fillStyle = dimmed(['#F472B6', '#FDE047', '#22D3EE'][k % 3]); c.beginPath(); c.moveTo(fx - 6, fy); c.lineTo(fx + 6, fy); c.lineTo(fx, fy + 12); c.fill(); }
};
/** The pod's hangar: a quonset arch behind, MOTION MADNESS and the duck detective on it. */
const hangar = (c: Ctx) => {
  const cx = X((POD.a + POD.b) / 2), w = 640, h = 280;
  c.save(); c.translate(cx, 0);
  stamp(c, key('hangar'), -w / 2 - 6, GY - h - 6, w + 12, h + 8, g => {
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, GY, w / 2 + 3, h + 3, 0, Math.PI, 0); g.fill();
    g.fillStyle = dimmed('#94A3B8'); g.beginPath(); g.ellipse(0, GY, w / 2, h, 0, Math.PI, 0); g.fill();
    for (let k = -w / 2 + 30; k < w / 2; k += 40) { g.strokeStyle = dimmed('#64748B'); g.lineWidth = 2; g.beginPath(); g.moveTo(k, GY); g.lineTo(k * 0.98, GY - Math.sqrt(Math.max(0, 1 - (k / (w / 2)) ** 2)) * h); g.stroke(); }
    g.fillStyle = dimmed('#0E7490'); g.fillRect(-w / 2 + 40, GY - 184, w - 80, 34);
    signText(g, 'MOTION MADNESS', 0, GY - 160,{ sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink: dimmed(INK) });
    // (the duck detective, big: fedora, trench coat, magnifying glass)
    const dx = -180, dy = GY - 220;
    g.fillStyle = dimmed('#22C55E'); g.beginPath(); g.arc(dx, dy, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = dimmed('#F59E0B'); g.beginPath(); g.ellipse(dx + 26, dy + 6, 18, 7, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = dimmed('#57534E'); g.fillRect(dx - 32, dy - 30, 64, 8); g.fillRect(dx - 18, dy - 48, 36, 20);
    g.strokeStyle = dimmed(INK); g.lineWidth = 4; g.beginPath(); g.arc(dx + 60, dy - 6, 14, 0, Math.PI * 2); g.moveTo(dx + 50, dy + 4); g.lineTo(dx + 36, dy + 20); g.stroke();
  });
  c.restore();
};
/** The halfpipe: concrete, curved ramps down to a flat floor, steel coping at its lips, tags; RAD RAT's banner behind
 *  on scaffolding. */
const halfpipe = (c: Ctx) => {
  const a = X(PIPE.a), b = X(PIPE.b);
  // (the banner on its scaffold, behind)
  for (const px of [a + 40, b - 40]) { box(c, px - 3, Y(300), 6, 300 + PIPE.depth, dimmed(INK)); }
  box(c, a + 30, Y(300), b - a - 60, 50, dimmed(INK)); box(c, a + 32, Y(298), b - a - 64, 46, dimmed('#7C3AED'));
  signText(c, "RAD RAT'S TUBULAR HALFPIPE", (a + b) / 2, Y(268), { sx: 1, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#A3E635')], ink: dimmed(INK) });
  // (the pipe's concrete, along its floor)
  c.fillStyle = INK; c.beginPath(); c.moveTo(a - 2, GY);
  for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(X(p), GY + d1); c.lineTo(X(q), GY + d2); }
  c.lineTo(b + 2, GY); c.lineTo(b + 2, GY + PIPE.depth + 60); c.lineTo(a - 2, GY + PIPE.depth + 60); c.closePath(); c.fill();
  c.fillStyle = hour('#C7C2B8'); c.beginPath(); c.moveTo(a, GY + 2);
  for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(X(p), GY + d1 + 2); c.lineTo(X(q), GY + d2 + 2); }
  c.lineTo(b, GY + 2); c.lineTo(b, GY + PIPE.depth + 60); c.lineTo(a, GY + PIPE.depth + 60); c.closePath(); c.fill();
  // (its lit surface line (he walks it), a darker band under, the tags)
  c.strokeStyle = LIP; c.lineWidth = 2; c.beginPath(); c.moveTo(a, GY + 1);
  for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(X(p), GY + d1 + 1); c.lineTo(X(q), GY + d2 + 1); }
  c.stroke();
  c.fillStyle = hour('#A8A29E'); c.fillRect(a + PIPE.ramp, GY + PIPE.depth + 14, b - a - PIPE.ramp * 2, 6);
  signText(c, 'RAD', (a + b) / 2 - 60, GY + PIPE.depth + 40, { sx: 2, sy: 2, bold: true, slant: 1, fill: hour('#EC4899'), drip: { col: '#BE185D', rate: 0.5, len: 6 }, seed: 3 });
  c.strokeStyle = hour('#22D3EE'); c.lineWidth = 3; c.beginPath(); c.moveTo((a + b) / 2 + 20, GY + PIPE.depth + 40); c.bezierCurveTo((a + b) / 2 + 50, GY + PIPE.depth + 20, (a + b) / 2 + 70, GY + PIPE.depth + 50, (a + b) / 2 + 100, GY + PIPE.depth + 30); c.stroke();
  // (the coping: steel pipes along the lips)
  for (const lx of [a, b]) { c.fillStyle = INK; c.beginPath(); c.arc(lx, GY + 2, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = hour('#D4D4D8'); c.beginPath(); c.arc(lx, GY + 2, 4, 0, Math.PI * 2); c.fill(); }
};
/** The STUPID DAD LIVE billboard: up on two legs behind the path (the live show: where he's headed). */
const billboard = (c: Ctx) => {
  const x = X(BILLBOARD), w = 360, h = 180, top = Y(380);
  c.save(); c.translate(x, 0);
  stamp(c, key('billboard'), -w / 2 - 10, top - 10, w + 20, GY - top + 12, g => {
    for (const lx of [-w / 3, w / 3]) { g.fillStyle = INK; g.fillRect(lx - 6, top + h, 12, GY - top - h); g.fillStyle = dimmed('#57534E'); g.fillRect(lx - 4, top + h, 8, GY - top - h); }
    g.fillStyle = INK; g.fillRect(-w / 2 - 4, top - 4, w + 8, h + 8); g.fillStyle = dimmed('#7C3AED'); g.fillRect(-w / 2, top, w, h);
    g.save(); g.beginPath(); g.rect(-w / 2, top, w, h); g.clip();
    dadArt(g, -90, top + h - 6, 1.9, 0.18, '#7C3AED');
    g.restore();
    signText(g, 'SEE STUPID DAD', 70, top + 34, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047'), dimmed('#F59E0B')], ink: dimmed(INK), shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'LIVE!', 70, top + 66, { sx: 3, sy: 3, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FB7185'), dimmed('#DC2626')], ink: dimmed(INK), shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'THE AMPHITHEATER', 70, top + 100, { sx: 1, sy: 1, bold: true, fill: dimmed('#FFFFFF'), ink: dimmed(INK) });
    signText(g, 'SHOWS DAILY. BEER GARDEN OPEN.', 70, top + 116, { sx: 1, sy: 1, fill: dimmed('#FDE047') });
    signText(g, 'THIS WAY >', 70, top + 150, { sx: 1, sy: 2, bold: true, fill: dimmed('#A3E635'), ink: dimmed(INK) });
    // (a catwalk under it, its lamps)
    g.fillStyle = INK; g.fillRect(-w / 2, top + h + 4, w, 4);
    for (let k = -w / 2 + 30; k < w / 2; k += 80) { g.fillStyle = INK; g.fillRect(k, top + h + 2, 4, 10); }
  });
  c.restore();
};

/** The ground: skate-park concrete (slabs, joints, gum, painted lane lines), its curb face, the dark under it. */
const ground = (c: Ctx, state: GameState) => {
  for (const [a, b] of GROUND) {
    const l = Math.max(X(a), state.camera.x - 60), r = Math.min(X(b), state.camera.x + 860);
    if (r <= l) continue;
    box(c, l, GY, r - l, 260, hour('#3F3F46'));
    box(c, l, GY + 16, r - l, 8, hour('#27272A'));
    box(c, l, GY, r - l, 14, hour('#D6D3D1'));
    for (let x = Math.floor(l / 64) * 64; x < r; x += 64) { box(c, Math.max(l, x), GY + 1, 1, 13, hour('#A8A29E')); const h = hash(x * 0.13); if (h > 0.6) box(c, x + h * 40, GY + 5, 4, 3, hour(['#F472B6', '#A3E635', '#22D3EE'][Math.floor(h * 30) % 3])); }
    for (let x = Math.floor(l / 220) * 220; x < r; x += 220) { c.fillStyle = hour('#FDE047'); c.beginPath(); c.moveTo(x, GY + 13); c.lineTo(x + 16, GY + 3); c.lineTo(x + 26, GY + 3); c.lineTo(x + 10, GY + 13); c.fill(); }
    box(c, l, GY + 14, r - l, 2, INK);
    box(c, l, GY, r - l, 3, LIP);
  }
  for (const [a, b] of PITS) for (const [ex, s] of [[X(a), 1], [X(b), -1]] as [number, number][]) {
    if (!onScreen(state, ex - 20, ex + 20)) continue;
    c.fillStyle = INK; c.beginPath(); c.moveTo(ex, GY); c.lineTo(ex + s * 2, GY + 260); c.lineTo(ex - s * 6, GY + 260); c.lineTo(ex - s * 6, GY); c.closePath(); c.fill();
  }
};
/** The glop pits: green slime to the brim, swirls, bubbles popping (the far side, behind him). */
const pits = (c: Ctx, state: GameState) => {
  const f = state.frame;
  for (const [a, b] of PITS) {
    const l = Math.max(X(a), state.camera.x - 40), r = Math.min(X(b), state.camera.x + 840);
    if (r <= l) continue;
    box(c, l, GY + 4, r - l, 260, hour('#2F6B0A'));
    box(c, l, GY + 4, r - l, 30, hour('#4D9F10'));
    c.strokeStyle = hour('#84CC16'); c.lineWidth = 2;
    for (let x = Math.floor(l / 90) * 90; x < r; x += 90) { c.beginPath(); c.arc(x + 30 + Math.sin(f * 0.02 + x) * 8, GY + 40, 14, 0.3, Math.PI * 1.6); c.stroke(); }
    for (let x = Math.floor(l / 70) * 70; x < r; x += 70) { const t = (f + x * 7) % 90; if (t < 30) { c.strokeStyle = '#D9F99D'; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 20, GY + 10 - t * 0.2, 3 + t * 0.15, Math.PI, 0); c.stroke(); } }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawBigkidBack = (c: Ctx, state: GameState, dollTalking: boolean) => {
  const cam = state.camera.x, f = state.frame;
  // (the zone's show buildings behind, every so often, seeded; none behind the set pieces with their own)
  const BUSY: [number, number][] = [[COUCH.barn[0] - 60, COUCH.barn[1] + 40], [SHACK.a - 80, SHACK.b + 80], [MEMORIAL.wall[0] - 80, MEMORIAL.wall[1] + 80], [POD.a - 140, POD.b + 140], [BILLBOARD - 260, BILLBOARD + 260], [GATE.a - 320, GATE.b + 400], [200, 640]];
  for (let k = Math.floor((cam - SX0 - 300) / 380); k * 380 + SX0 < cam + 1100; k++) {
    if (k < 0 || k * 380 > SX1 - SX0) continue;
    const rx = k * 380 + 120 + (hash(k * 5.3) - 0.5) * 60;
    if (BUSY.some(([a, b]) => rx > a && rx < b)) continue;
    building(c, X(rx), k * 7 + 5);
  }
  for (const lx of LAMPS) if (onScreen(state, X(lx) - 30, X(lx) + 30)) lampPost(c, X(lx), f);
  if (onScreen(state, X(420) - 260, X(420) + 260)) gateArch(c, X(420), 'THE BIG-KID ZONE', 'NO TRACKS. NO LIMITS.', '#F472B6', 'TOTALLY EXTREME!');
  if (onScreen(state, X(GATE.a) - 300, X(GATE.b) + 260)) gateArch(c, X((GATE.a + GATE.b) / 2) - 50, 'STUPID DAD', 'THE EXTENDED UNIVERSE >', '#FDE047', 'MORE STUPID DAD!');
  if (onScreen(state, X(640) - 80, X(640) + 80)) posterColumn(c, X(640));
  if (onScreen(state, X(820), X(1300))) posterFence(c, 820, 1300);
  if (onScreen(state, X(COUCH.barn[0]) - 20, X(COUCH.barn[1]) + 20)) garage(c);
  if (onScreen(state, X(SHACK.a) - 160, X(SHACK.b) + 40)) shack(c);
  if (onScreen(state, X(MEMORIAL.wall[0]) - 40, X(MEMORIAL.wall[1]) + 40)) memorial(c);
  if (onScreen(state, X(WHIRL.a) - 200, X(WHIRL.b) + 40)) whirlPlaza(c);
  if (onScreen(state, X(POD.a) - 120, X(POD.b) + 120)) hangar(c);
  if (onScreen(state, X(BILLBOARD) - 200, X(BILLBOARD) + 200)) billboard(c);
  if (onScreen(state, X(RINK.a) - 80, X(RINK.b) + 80)) rink(c, state);
  for (const [x, h, look] of POSTERS) if (onScreen(state, X(x) - 60, X(x) + 60)) poster(c, X(x), Y(h), look, true);
  pits(c, state);
  ground(c, state);
  if (onScreen(state, X(PIPE.a) - 340, X(PIPE.b) + 40)) halfpipe(c);
  for (const [x, h, lines, board] of SIGNS) if (onScreen(state, X(x) - 200, X(x) + 200)) zoneSign(c, X(x), Y(h), lines, board);
  if (onScreen(state, X(NEWSSTAND[0]) - 40, X(NEWSSTAND[1]) + 40)) newsstand(c);
  if (onScreen(state, X(SHELTER[0]) - 40, X(SHELTER[1]) + 80)) shelter(c);
  if (onScreen(state, X(SHACK.bin) - 60, X(SHACK.bin) + 60)) dollBin(c, X(SHACK.bin), f, dollTalking);
  stands(c, state);
  drums(c, state);
};

export const bigkidLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const out: Light[] = [];
  for (const lx of LAMPS) { const x = X(lx); if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y: GY - 180, r: 120, a: 0.5, color: '#F9A8D4' }); }
  for (const gx of [X(420), X((GATE.a + GATE.b) / 2) - 50]) if (gx > state.camera.x - 400 && gx < state.camera.x + 1200) out.push({ x: gx, y: Y(320), r: 220, a: 0.5, color: '#F0ABFC' });
  return out;
};
