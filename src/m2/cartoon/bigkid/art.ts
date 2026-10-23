// THE BIG-KID ZONE, painted (the SNES pass): one eye over the whole scene (kit.ts's view), the far off cached per hour
// (far.ts: the sky and its blimp, the suburbs past the berm, the water tower, the rest of Cartoon Land, the zone's own
// roofs and their giant props), the zone's show buildings back at FRONT_D with their sides, the alley, the skate-park
// concrete and the street's furniture (backs.ts), and on the play plane the set pieces, every one with its sides and
// top going back to the eye where the eye's past or over it; what he can stand on bright and lit along its top
// (standable reads standable), the scenery dimmed a step toward the air:
//
//   THE GATES       spray-painted concrete pillars, a hazard-striped beam with its neon (THE BIG-KID ZONE / NO LIMITS.
//                   NO MERCY.; at the far end DAD MAN: THE EXTENDED UNIVERSE >), glop dripping off it, tags
//   THE POSTERS     DAD MAN everywhere: the advertising column, the plywood fence (POST NO BILLS), each poster aged
//                   its own way: sun-bleached, faded, peeling, graffitied (a mustache, horns, SUCKS), CANCELED
//   THE GARAGE      COUCH DUDES' cinder-block garage: the roll-up door up, the dark inside (a workbench, a tire stack,
//                   pizza boxes), COUCH FUEL's old pump
//   THE NEWSSTAND   its striped awning (stand on it), the racks of 1994's magazines (TV WEEK: IS DAD MAN OVER?)
//   THE SHELTER     the PARK SHUTTLE's roof (stand on it), its ad panel, the bench
//   THE STORE       THE DAD MAN STORE: the dad's head on its roof board, the window of unsold merch (beer-can hats,
//                   WORLD'S STUPIDEST DAD mugs, foam couches, the dolls), EVERYTHING 90% OFF, NOW 95%, the standee
//                   (HAVE YOU HUGGED A DAD MAN TODAY?), the awning (stand on it), the clearance bin of dolls
//   THE GLOP PITS   green slime to the brim, swirling, going back to a railed rim (NO LIFEGUARD), the banks hazard-
//                   striped; GLOP drums stacked on the banks (their lids lit), glop heaped round the towers' feet
//   THE RINK        SPAZ & STINKY'S BUMPER BASH: the canopy and the sparking ceiling grid overhead, the chain-link at
//                   the back with the scoreboard and the crowd behind it, the diamond-plate floor going back, the
//                   hazard-striped rails (stand on them), the scorer's stands (their planks lit)
//   THE MEMORIAL    sad and quiet: the faded family mural peeling off the cinder block, the granite stone and its
//                   bronze plaque, dead flowers, a burnt-out candle, a deflated balloon, the crushed beer can, a bench,
//                   a pigeon
//   THE WHIRL       Giggles' ticket booth (COURTESY BAGS), the pennants strung across the plaza
//   THE POD         Detective Drake's quonset hangar (MOTION MADNESS, the duck detective painted big), its door open
//   THE HALFPIPE    RAD RAT'S concrete pipe, its curve going back to the eye, the back wall tagged, steel coping, the
//                   banner on its scaffold
//   THE BILLBOARD   SEE DAD MAN LIVE! (THE AMPHITHEATER, SHOWS DAILY. BEER GARDEN OPEN., THIS WAY >), its catwalk
//                   and lamps
//   THE GROUND      skate-park slabs coming toward him (scanline-bent), a red-painted curb lit along its top
//
// DAD MAN (the failed mid-90s show, the boss's setup): the fat balding dad in a stained tank top on the couch, a
// beer up, "BOY! BEER!"; AMERICA'S NEW FAVORITE FAMILY!; THIS FALL ON UBX.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText, signW, type Look } from '../../signLetters';
import { bendFloor, BEND } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import {
  type Ctx, type View, INK, box, mix, stamp, hash, onScreen, hour, dimmed, lit, checker, viewOf, at, still, stillAt, polyF, sideBack, topBack, drumTop,
  ballR, eggR, ramp6, rampH, shadeAcross, bandsDown, postR, LIP, STEEL, BRASS, GRASS,
} from '../kit';
import { GY } from '../geometry';
import { drawDadSign } from '../amphi/dad';
import { drawBigkidFar } from './far';
import { drawAlley, drawFronts, drawPavement, drawFurniture, backLamps, PIT_D, PIPE_D, RINK_D } from './backs';
import {
  PITS, GROUND, PIPE, PIPE_RUNS, RINK, RAILS, DRUMS, STANDS, NEWSSTAND, SHELTER, SHACK, COUCH, WHIRL, POD, MEMORIAL, BILLBOARD, GATE,
  SIGNS, TOWERS, IN_PIT, X, Y,
} from './layout';

export const drawBigkidBackdrop = (c: Ctx, state: GameState) => { drawBigkidFar(c, state); return true; };

const fontReady = () => typeof document !== 'undefined' && !!document.fonts?.check('8px "Press Start 2P"');
const key = (k: string) => `ct-bk-${k}-${timeOfDay().key}-${fontReady() ? 'f' : 'n'}`;
/** How far back the set pieces' sides and tops run. */
const SET_D = 0.9;
/** A scenery ramp (dimmed), a near one (for the hour). */
const DR = (col: string) => rampH(ramp6(col), true);
const NR = (col: string) => rampH(ramp6(col));
const onV = (v: View, a: number, b: number, pad = 60) => b > v.cam.x - pad && a < v.cam.x + 800 + pad;

// ---------------------------------------------------------------------------------------------------------------
// The zone's lettering: slanted, fat, a hot ramp, drips of glop off the feet (the 90s "extreme" look)

export const zoneLetters = (size = 2, seed = 0): Look => ({ sx: size, sy: size, bold: true, slant: 1, fill: ['#FFFFFF', '#FEF08A', '#FDE047', '#F97316'], dither: true, ink: INK, shadow: '#3B0764', drop: 2, wobble: 1, seed, drip: { col: '#84CC16', tip: '#4D7C0F', rate: 0.3, len: 5 } });
const smallLetters = (fill: string | string[] = '#FFFFFF'): Look => ({ sx: 1, sy: 1, bold: true, fill, ink: INK });
const neon = (col: string, size = 2): Look => ({ sx: size, sy: size, bold: true, fill: ['#FFFFFF', col, col], ink: INK, glow: col });

/**
 * The zone's sign standing at (x, feetY): a jagged lightning-cut board, tipped a touch, on a hazard-striped scaffold
 * pole guyed to a sandbag; glop dripping off its foot; the first line big and drippy, the rest small. Painted once for
 * the hour, in steps: the board banded light to shade and bevelled, the pole's stripes lit and shaded, the sandbag's
 * burlap, rivets.
 */
export const zoneSign = (c: Ctx, x: number, feetY: number, lines: string[], board = '#7C3AED') => {
  const looks = lines.map((_, i) => (i ? smallLetters(i === lines.length - 1 && lines.length > 2 ? ['#FFFFFF', '#FDE047'] : '#FFFFFF') : zoneLetters(1, lines.join('').length)));
  const w = Math.max(110, ...lines.map((l, i) => signW(l, looks[i]) + 40)), h = lines.length * 14 + 18, tall = 120;
  c.save(); c.translate(Math.round(x), Math.round(feetY));
  stamp(c, key(`sign2-${lines.join('|')}-${board}`), -w / 2 - 24, -tall - h - 24, w + 48, tall + h + 30, g => {
    const T = (col: string) => hour(col, 0.12), R = ramp6(T(board)), Y2 = ramp6(T('#FDE047')), K = ramp6(T('#2A2638')), Bg = ramp6(T('#B8A27A'));
    // (the sandbag: burlap in steps, its tied neck, a stitch)
    g.fillStyle = INK; g.beginPath(); g.ellipse(0, -6, 18, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Bg[2]; g.beginPath(); g.ellipse(0, -6, 16, 6.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = Bg[3]; g.beginPath(); g.ellipse(-3, -8, 11, 4, 0, 0, Math.PI * 2); g.fill();
    box(g, -10, -11, 6, 1, Bg[4]); checker(g, -14, -6, 28, 4, Bg[1], 0, 1);
    for (let k = -12; k < 12; k += 4) box(g, k, -4, 2, 1, Bg[0]);
    // (the pole: a square scaffold tube, hazard-striped, lit down its left, shaded down its right)
    box(g, -6, -tall, 12, tall - 6, INK);
    for (let y = -tall + 2; y < -8; y += 12) {
      for (const [yy, Rm] of [[y, Y2], [y + 6, K]] as [number, string[]][]) { box(g, -4, yy, 8, 6, Rm[3]); box(g, -4, yy, 2, 6, Rm[4]); box(g, 2, yy, 2, 6, Rm[1]); }
    }
    box(g, -8, -tall + 18, 16, 4, INK); box(g, -7, -tall + 19, 14, 2, T('#A8A8BC'));
    g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -tall + 12); g.lineTo(28, -3); g.stroke(); g.strokeStyle = T('#C8C8D8'); g.lineWidth = 0.6; g.stroke();
    box(g, 26, -5, 5, 4, INK); box(g, 27, -4, 3, 2, T('#8A8AA0'));
    // (the board: a jagged cut, tipped; a drop shadow, banded light to shade, bevelled; confetti; glop drips off its foot)
    g.save(); g.translate(0, -tall - h / 2); g.rotate(-0.04);
    const jag = () => {
      g.moveTo(-w / 2, -h / 2 + 4);
      for (let k = 0; k <= 6; k++) g.lineTo(-w / 2 + (k * w) / 6, -h / 2 + (k % 2 ? -4 : 4));
      g.lineTo(w / 2 + 6, 0);
      for (let k = 6; k >= 0; k--) g.lineTo(-w / 2 + (k * w) / 6, h / 2 + (k % 2 ? 4 : -2));
      g.lineTo(-w / 2 - 6, 0); g.closePath();
    };
    g.save(); g.translate(4, 4); g.beginPath(); jag(); g.fillStyle = 'rgba(26,16,40,0.35)'; g.fill(); g.restore();
    bandsDown(g, jag, -w / 2 - 10, -h / 2 - 8, w + 20, h + 14, [R[4], R[3], R[3], R[3], R[2], R[1]]);
    g.save(); g.beginPath(); jag(); g.clip();
    g.translate(2, 2); g.beginPath(); jag(); g.strokeStyle = R[5]; g.lineWidth = 3; g.stroke();
    g.translate(-4, -4); g.beginPath(); jag(); g.strokeStyle = R[0]; g.lineWidth = 3; g.stroke();
    g.translate(2, 2);
    for (let k = 0; k < 12; k++) { const cx = -w / 2 + hash(k + w) * w, cy = -h / 2 + 4 + hash(k * 3 + h) * (h - 8), cc = ['#FDE047', '#22D3EE', '#F472B6', '#A3E635'][k % 4]; box(g, cx, cy, 3, 2, T(cc)); box(g, cx, cy + 2, 3, 1, T(mix(cc, INK, 0.4))); }
    g.restore();
    g.beginPath(); jag(); g.strokeStyle = INK; g.lineWidth = 3.5; g.lineJoin = 'round'; g.stroke();
    const G = ramp6(T('#84CC16'));
    for (let k = 0; k < 5; k++) { const dx = -w / 2 + 14 + k * (w - 28) / 4 + hash(k * 7 + w) * 8, len = 6 + hash(k + w) * 12, y0 = h / 2 + (Math.round((dx + w / 2) / (w / 6)) % 2 ? 2 : -1); box(g, dx - 3, y0 - 2, 6, len + 2, INK); box(g, dx - 2, y0 - 2, 4, len, G[3]); box(g, dx - 2, y0 - 2, 1, len - 2, G[5]); g.fillStyle = INK; g.beginPath(); g.arc(dx, y0 + len, 3.5, 0, Math.PI * 2); g.fill(); g.fillStyle = G[2]; g.beginPath(); g.arc(dx, y0 + len - 0.5, 2.5, 0, Math.PI * 2); g.fill(); }
    for (const sx of [-w / 2 + 8, w / 2 - 12]) { box(g, sx, -2, 4, 4, INK); box(g, sx + 1, -1, 2, 2, T('#E2E8F0')); }
    let ly = -h / 2 + 11;
    lines.forEach((l, i) => { signText(g, l, 0, Math.round(ly + 7), looks[i]); ly += 14; });
    g.restore();
  });
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// DAD MAN

/**
 * The show's star as the show drew him, the couch's foot at (x, y), scale k: on a saggy orange couch, the fat balding
 * dad in a stained tank top and striped boxers, black socks pulled up, a three-hair comb-over, stubble, half-shut eyes,
 * a beer up in one hand, mouth open ("BOY! BEER!"); `family`: the rest of them round the couch (the mural). `fade` pulls
 * every color toward the paper. In steps: every shape lit up and left, shaded down and right, inked.
 */
export const dadArt = (g: Ctx, x: number, y: number, k: number, fade: number, paper: string, graffiti = false, family = false) => {
  const F = (col: string) => mix(col, paper, fade);
  g.save(); g.translate(x, y); g.scale(k, k);
  // (a stepped ellipse: ink, shade, itself up and left, lit)
  const o = (cx: number, cy: number, rx: number, ry: number, col: string, line = 1.5) => {
    g.fillStyle = F(INK); g.beginPath(); g.ellipse(cx, cy, rx + line, ry + line, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = F(mix(col, INK, 0.25)); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = F(col); g.beginPath(); g.ellipse(cx - rx * 0.12, cy - ry * 0.12, rx * 0.84, ry * 0.82, 0, 0, Math.PI * 2); g.fill();
    if (rx > 4) { g.fillStyle = F(mix(col, '#FFFFFF', 0.35)); g.beginPath(); g.ellipse(cx - rx * 0.36, cy - ry * 0.4, rx * 0.3, ry * 0.24, 0, 0, Math.PI * 2); g.fill(); }
  };
  // (a stepped slab: ink, itself, lit down its left and top, shaded down its right)
  const r = (rx: number, ry: number, w: number, h: number, col: string) => {
    g.fillStyle = F(INK); g.fillRect(rx - 1.5, ry - 1.5, w + 3, h + 3);
    g.fillStyle = F(col); g.fillRect(rx, ry, w, h);
    g.fillStyle = F(mix(col, '#FFFFFF', 0.3)); g.fillRect(rx, ry, Math.max(1, w * 0.2), h); g.fillRect(rx, ry, w, Math.min(2, h * 0.2));
    g.fillStyle = F(mix(col, INK, 0.25)); g.fillRect(rx + w * 0.78, ry, w * 0.22, h);
  };
  if (family) {
    // (MOM behind the couch: a big brown perm, pearls, a pink sweater; GRAMPS on the arm: bald, a cardigan, glasses;
    // SIS: a ponytail, braces; THE BOY: a buzz cut, a striped shirt, bringing the beer)
    r(-58, -62, 22, 30, '#F472B6'); o(-47, -74, 9, 10, '#F2C9A0'); for (let i = 0; i < 6; i++) o(-54 + (i % 3) * 7, -86 + Math.floor(i / 3) * 6, 5, 5, '#92400E', 1);
    for (let i = 0; i < 4; i++) { g.fillStyle = F('#FFFFFF'); g.beginPath(); g.arc(-52 + i * 3.5, -63, 1.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = F(INK); g.fillRect(-51, -76, 2, 2); g.fillRect(-45, -76, 2, 2); g.fillStyle = F('#DC2626'); g.fillRect(-49, -70, 4, 1.5);
    r(32, -58, 18, 24, '#65A30D'); o(41, -68, 8, 9, '#E8B48A'); g.fillStyle = F('#FFFFFF'); g.fillRect(41, -66, 6, 1.5); g.fillStyle = F(INK); g.fillRect(36, -72, 3, 2); g.fillRect(42, -72, 3, 2);
    o(50, -74, 4, 7, '#78350F', 1);
    r(48, -24, 6, 24, '#1D4ED8'); r(58, -24, 6, 24, '#1D4ED8');
    r(46, -50, 20, 26, '#FFFFFF'); for (let i = 0; i < 4; i++) { g.fillStyle = F('#DC2626'); g.fillRect(46, -48 + i * 6, 20, 2); }
    o(56, -60, 8, 9, '#F2C9A0'); g.fillStyle = F('#78350F'); g.fillRect(49, -69, 14, 3); g.fillStyle = F(INK); g.fillRect(53, -62, 2, 2); g.fillRect(58, -62, 2, 2);
    r(66, -50, 6, 8, '#DC2626'); g.fillStyle = F('#E5E7EB'); g.fillRect(66, -51, 6, 2);
    r(-70, -40, 14, 40, '#A16207'); o(-63, -48, 8, 9, '#F2C9A0'); g.strokeStyle = F(INK); g.lineWidth = 1.2; g.strokeRect(-67, -50, 4, 3); g.strokeRect(-61, -50, 4, 3);
    g.fillStyle = F('#E5E7EB'); g.fillRect(-71, -52, 3, 4); g.fillRect(-58, -52, 3, 4);
    for (let i = 0; i < 4; i++) { g.fillStyle = F('#78350F'); g.fillRect(-69, -36 + i * 8, 10, 2); }
  }
  // (him on the couch: the fight's model of him (amphi/dad.ts), so the signs look like the man on the stage)
  drawDadSign(g, fade, paper);
  if (graffiti) {
    // (somebody's been at him: a curly mustache, devil horns, a blacked-out tooth)
    g.strokeStyle = '#18181B'; g.lineWidth = 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-14, -66); g.quadraticCurveTo(-9, -70, -4, -67); g.quadraticCurveTo(1, -70, 6, -66); g.stroke();
    g.beginPath(); g.moveTo(-16, -66); g.arc(-17, -68, 2, 0, Math.PI * 1.5); g.moveTo(8, -66); g.arc(9, -68, 2, Math.PI * 1.5, Math.PI, true); g.stroke();
    g.strokeStyle = '#DC2626'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(-14, -82); g.lineTo(-18, -94); g.lineTo(-10, -84); g.moveTo(2, -84); g.lineTo(6, -96); g.lineTo(-2, -83); g.stroke();
    g.fillStyle = '#18181B'; g.fillRect(-6, -67, 3, 2);
  }
  g.restore();
};

const UBX: Look = { sx: 1, sy: 1, bold: true, fill: '#FFFFFF', ink: INK };
/** A DAD MAN poster (104 x 140, its middle-bottom at (x, y)), aged: 'fresh' (only sun-bleached), 'faded', 'peel'
 *  (a corner torn and curled, strips gone), 'graffiti', 'canceled' (a CANCELED strip slapped across), 'live' (the live
 *  show's: SEE IT LIVE! THE AMPHITHEATER). Painted once for its look and the hour, in steps: the sunburst banded, the
 *  paste's wrinkles, the tape. */
export type PosterLook = 'fresh' | 'faded' | 'peel' | 'graffiti' | 'canceled' | 'live';
export const PW = 104, PH = 140;
export const poster = (c: Ctx, x: number, y: number, look: PosterLook, dim = false) => {
  c.save(); c.translate(Math.round(x), Math.round(y));
  stamp(c, key(`poster2-${look}-${dim ? 1 : 0}`), -PW / 2 - 8, -PH - 8, PW + 16, PH + 16, g => {
    const fade = look === 'fresh' ? 0.18 : look === 'live' ? 0.12 : look === 'faded' ? 0.55 : 0.42, paper = '#F5F0E1';
    const T = (col: string) => { const m = mix(col, paper, fade); return dim ? dimmed(m) : hour(m, 0.1); };
    const top = -PH, torn = look === 'peel' || look === 'canceled';
    const sheet = () => {
      g.moveTo(-PW / 2, top);
      if (torn) { g.lineTo(PW / 2 - 34, top); g.lineTo(PW / 2, top + 30); } else g.lineTo(PW / 2, top);
      g.lineTo(PW / 2, top + PH); g.lineTo(-PW / 2, top + PH);
      if (torn) { g.lineTo(-PW / 2, top + 82); g.lineTo(-PW / 2 + 14, top + 80); g.lineTo(-PW / 2 + 12, top + 60); g.lineTo(-PW / 2, top + 60); }
      g.closePath();
    };
    // (a shadow off its edge onto whatever it's pasted on)
    g.save(); g.translate(2, 2); g.beginPath(); sheet(); g.fillStyle = 'rgba(26,16,40,0.25)'; g.fill(); g.restore();
    g.save(); g.beginPath(); sheet(); g.clip();
    // (the paper: the sky banded down, a sunburst behind the couch, its rays in two steps)
    const sky = look === 'live' ? ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6'] : ['#0EA5E9', '#22B4F0', '#38BDF8', '#7DD3FC'];
    for (let i = 0; i < 4; i++) { box(g, -PW / 2, top + i * 28, PW, 29, T(sky[i])); if (i) checker(g, -PW / 2, top + i * 28 - 1, PW, 2, T(sky[i]), i % 2, 1); }
    box(g, -PW / 2, top + 112, PW, 28, T(sky[3]));
    for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; g.fillStyle = T(look === 'live' ? (k % 2 ? '#A78BFA' : '#C4B5FD') : (k % 2 ? '#7DD3FC' : '#BAE6FD')); g.beginPath(); g.moveTo(0, top + 78); g.lineTo(Math.cos(a) * 90, top + 78 + Math.sin(a) * 90); g.lineTo(Math.cos(a + 0.26) * 90, top + 78 + Math.sin(a + 0.26) * 90); g.closePath(); g.fill(); }
    g.save(); g.beginPath(); g.rect(-PW / 2, top, PW, PH); g.clip();
    dadArt(g, -4, top + 112, 0.82, fade + 0.05, paper, look === 'graffiti');
    g.restore();
    // (the title, the speech balloon, the tagline)
    signText(g, look === 'live' ? 'SEE IT LIVE!' : 'DAD MAN', 0, top + 20, { sx: 1, sy: 2, bold: true, fill: [T('#FFFFFF'), T('#FDE047'), T('#F59E0B')], ink: INK, shadow: T('#7F1D1D'), drop: 1 });
    g.fillStyle = INK; g.beginPath(); g.roundRect(3, top + 27, 48, 15, 6); g.fill();
    g.fillStyle = T('#FFFFFF'); g.beginPath(); g.roundRect(4, top + 28, 46, 13, 5); g.fill(); box(g, 6, top + 29, 20, 1, T('#FFFFFF')); box(g, 6, top + 38, 42, 2, T('#E2E8F0'));
    g.beginPath(); g.moveTo(10, top + 41); g.lineTo(6, top + 48); g.lineTo(16, top + 41); g.fillStyle = T('#FFFFFF'); g.fill();
    signText(g, 'BOY! BEER!', 27, top + 38, { sx: 1, sy: 1, fill: INK, gap: 0, space: 2 });
    box(g, -PW / 2, top + 112, PW, 28, T('#1E3A8A')); box(g, -PW / 2, top + 112, PW, 2, T('#3B5BC8')); box(g, -PW / 2, top + 137, PW, 3, T('#142A6A'));
    if (look === 'live') { signText(g, 'THE AMPHITHEATER', 0, top + 123, smallLetters(T('#FDE047'))); signText(g, 'SHOWS DAILY!', 0, top + 134, smallLetters(T('#FFFFFF'))); }
    else { signText(g, "AMERICA'S NEW", 0, top + 122, smallLetters(T('#FFFFFF'))); signText(g, 'FAVORITE FAMILY!', 0, top + 132, smallLetters(T('#FDE047'))); }
    if (look !== 'live') { box(g, -PW / 2 + 4, top + 44, 40, 10, T('#DC2626')); box(g, -PW / 2 + 4, top + 44, 40, 1, T('#F87171')); signText(g, 'THIS FALL', -PW / 2 + 24, top + 52, { ...UBX, bold: false }); box(g, PW / 2 - 30, top + 96, 26, 12, T('#FDE047')); signText(g, 'UBX', PW / 2 - 17, top + 105, { sx: 1, sy: 1, bold: true, fill: INK }); }
    // (the aging: the paste's wrinkles and bubbles, a water stain, creases where it was folded)
    g.fillStyle = 'rgba(120,90,40,0.14)'; g.beginPath(); g.ellipse(-PW / 4, top + PH * 0.7, 20, 14, 0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(120,90,40,0.1)'; g.beginPath(); g.ellipse(PW / 3, top + 20, 12, 22, 0.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(80,60,30,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-PW / 2, top + PH / 2); g.lineTo(PW / 2, top + PH / 2 + 4); g.moveTo(2, top); g.lineTo(-2, top + PH); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(-PW / 2, top + PH / 2 + 1); g.lineTo(PW / 2, top + PH / 2 + 5); g.stroke();
    for (let k = 0; k < 5; k++) { const bx2 = -PW / 2 + 10 + hash(k * 3.3 + fade) * (PW - 20), by2 = top + 10 + hash(k * 5.1) * (PH - 20); g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.ellipse(bx2, by2, 4, 2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(26,16,40,0.18)'; g.fillRect(bx2 - 3, by2 + 2, 6, 1); }
    if (look === 'faded') { g.fillStyle = 'rgba(245,240,225,0.25)'; g.fillRect(-PW / 2, top, PW, PH * 0.5); checker(g, -PW / 2, top + PH * 0.5, PW, 2, 'rgba(245,240,225,0.25)', 0, 1); }
    if (look === 'graffiti') signText(g, 'SUCKS', 6, top + 92, { sx: 2, sy: 2, bold: true, slant: 1, fill: '#DC2626', drip: { col: '#B91C1C', rate: 0.6, len: 8 }, seed: 7 });
    if (look === 'canceled') { g.save(); g.translate(0, top + 70); g.rotate(-0.42); box(g, -70, -9, 140, 18, INK); box(g, -68, -7, 136, 14, '#DC2626'); box(g, -68, -7, 136, 2, '#F87171'); box(g, -68, 5, 136, 2, '#991B1B'); signText(g, 'CANCELED', 0, 4, { sx: 1, sy: 1, bold: true, fill: '#FFFFFF' }); g.restore(); }
    g.restore();
    // (the edge; the torn corner curled back over, the strip's raw edge)
    g.beginPath(); sheet(); g.strokeStyle = INK; g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke();
    if (torn) {
      g.fillStyle = mix(paper, '#C9BFA4', 0.5); g.beginPath(); g.moveTo(PW / 2 - 34, top); g.quadraticCurveTo(PW / 2 - 22, top + 20, PW / 2, top + 30); g.lineTo(PW / 2 - 14, top + 10); g.closePath(); g.fill();
      g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
      g.fillStyle = 'rgba(26,16,40,0.3)'; g.beginPath(); g.moveTo(PW / 2 - 14, top + 10); g.lineTo(PW / 2, top + 30); g.lineTo(PW / 2 - 8, top + 22); g.closePath(); g.fill();
      for (let yy = top + 62; yy < top + 80; yy += 3) box(g, -PW / 2 + 12 + ((yy / 3) % 2), yy, 2, 2, '#FFFFFF');
    }
    // (tape at the corners, staples)
    for (const [sx, sy, a] of [[-PW / 2 + 2, top + 2, -0.6], [PW / 2 - 2, top + PH - 2, -0.6]] as const) { g.save(); g.translate(sx, sy); g.rotate(a); box(g, -8, -3, 16, 6, 'rgba(240,235,200,0.75)'); box(g, -8, -3, 16, 1, 'rgba(255,255,255,0.6)'); g.restore(); }
    for (const [sx, sy] of [[-PW / 2 + 4, top + PH - 4], [PW / 2 - 6, top + 4]]) box(g, sx - 2, sy, 4, 1, '#9CA3AF');
  });
  c.restore();
};

/** Where the posters are (each on something: the column, the fence, the rink, the booth, the hangar): [x, feet height
 *  of its bottom edge, look]. */
const POSTERS: [number, number, PosterLook][] = [
  [640, 50, 'fresh'],
  [890, 16, 'faded'], [1000, 16, 'graffiti'], [1110, 16, 'canceled'], [1220, 16, 'peel'],
  [7140, 20, 'peel'],
  [9040, 0, 'faded'],
];

// ---------------------------------------------------------------------------------------------------------------
// The gates

/** A gate: two spray-painted concrete pillars (their sides going back), a hazard-striped steel beam across up high,
 *  the neon on its face (lit hard after dark), glop dripping off its foot, tags up the pillars. Behind him; nothing on
 *  it to stand on (dimmed, its top unlit). */
const gateArch = (c: Ctx, v: View, cx: number, top: string, sub: string, col: string, tag: string) => {
  const w = 420, hy = Y(300), Cn = DR('#A8A29E');
  for (const s of [-1, 1]) { const px0 = cx + s * w / 2 - 24; sideBack(c, v.eye, px0, -1, hy, GY, 1, SET_D, Cn, 3); sideBack(c, v.eye, px0 + 48, 1, hy, GY, 1, SET_D, Cn, 3); }
  sideBack(c, v.eye, cx - w / 2 - 28, -1, hy - 46, hy + 6, 1, SET_D, DR('#1F2937'), 2);
  sideBack(c, v.eye, cx + w / 2 + 28, 1, hy - 46, hy + 6, 1, SET_D, DR('#1F2937'), 2);
  still(c, `bk-arch-${top}-${lit() ? 1 : 0}`, cx, 0, -w / 2 - 40, hy - 70, w + 80, GY - hy + 74, g => {
    const K = DR('#1F2937'), Y2 = DR('#FDE047'), ink = dimmed(INK);
    for (const s of [-1, 1]) {
      const px0 = s * w / 2 - 24;
      // (the pillar: poured concrete in steps, form-board lines, a hazard-striped foot, tags)
      box(g, px0 - 2, hy, 52, GY - hy, ink); box(g, px0, hy + 2, 48, GY - hy - 2, Cn[3]); box(g, px0, hy + 2, 6, GY - hy - 2, Cn[4]); box(g, px0, hy + 2, 2, GY - hy - 2, Cn[5]); box(g, px0 + 36, hy + 2, 12, GY - hy - 2, Cn[2]); checker(g, px0 + 34, hy + 2, 2, GY - hy - 2, Cn[2], 0, 1); box(g, px0 + 44, hy + 2, 4, GY - hy - 2, Cn[1]);
      for (let y = hy + 30; y < GY - 30; y += 32) box(g, px0, y, 48, 1, Cn[1]);
      for (let k = 0; k < 4; k++) box(g, px0 + 8 + k * 9, hy + 18 + k * 37, 3, 3, Cn[1]);
      for (let k = 0; k < 48; k += 12) { polyF(g, [[px0 + k, GY], [px0 + k + 6, GY], [px0 + k + 12, GY - 26], [px0 + k + 6, GY - 26]], Y2[3]); polyF(g, [[px0 + k + 6, GY], [px0 + k + 12, GY], [px0 + k + 18, GY - 26], [px0 + k + 12, GY - 26]], K[3]); }
      box(g, px0, GY - 30, 48, 4, ink);
      const tc = dimmed(s > 0 ? '#22D3EE' : '#EC4899'), tc2 = dimmed('#1F2937');
      for (const [lw, cc] of [[6, tc2], [3, tc]] as [number, string][]) { g.strokeStyle = cc; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(px0 + 6, GY - 50); g.bezierCurveTo(px0 + 30, GY - 80, px0 + 4, GY - 104, px0 + 40, GY - 128); g.stroke(); }
      signText(g, s > 0 ? 'SK8' : 'RAD', px0 + 24, GY - 140, { sx: 1, sy: 2, bold: true, slant: 1, fill: tc, ink: tc2 });
    }
    // (the beam: a steel box, hazard stripes along its foot, rivets, the neon on its face, glop dripping off)
    box(g, -w / 2 - 30, hy - 48, w + 60, 56, ink); box(g, -w / 2 - 28, hy - 46, w + 56, 52, K[3]); box(g, -w / 2 - 28, hy - 46, w + 56, 3, K[4]); box(g, -w / 2 - 28, hy + 2, w + 56, 4, K[1]);
    for (let k = -w / 2 - 28; k < w / 2 + 28; k += 16) { polyF(g, [[k, hy + 6], [k + 8, hy + 6], [k + 14, hy - 2], [k + 6, hy - 2]], Y2[3]); }
    for (let k = -w / 2 - 22; k < w / 2 + 28; k += 24) { box(g, k, hy - 42, 3, 3, K[5]); box(g, k, hy - 8, 3, 3, K[1]); }
    const G = DR('#84CC16');
    for (let k = 0; k < 9; k++) { const dx = -w / 2 - 16 + k * (w + 32) / 8 + hash(k * 5) * 10, len = 8 + hash(k * 3) * 22; box(g, dx - 4, hy + 4, 8, len, ink); box(g, dx - 3, hy + 4, 6, len - 1, G[3]); box(g, dx - 3, hy + 4, 2, len - 3, G[5]); g.fillStyle = ink; g.beginPath(); g.arc(dx, hy + 4 + len, 5, 0, Math.PI * 2); g.fill(); g.fillStyle = G[2]; g.beginPath(); g.arc(dx, hy + 3 + len, 4, 0, Math.PI * 2); g.fill(); box(g, dx - 2, hy + 1 + len, 2, 2, G[5]); }
    // (lightning bolts either end of the face)
    for (const s of [-1, 1]) { const bx = s * (w / 2 + 6); polyF(g, [[bx - 8, hy - 44], [bx + 8, hy - 44], [bx + 2, hy - 26], [bx + 10, hy - 26], [bx - 6, hy - 2], [bx - 2, hy - 20], [bx - 10, hy - 20]], ink); polyF(g, [[bx - 6, hy - 42], [bx + 6, hy - 42], [bx, hy - 27], [bx + 7, hy - 27], [bx - 4, hy - 8], [bx - 1, hy - 21], [bx - 8, hy - 21]], lit() ? '#FEF08A' : Y2[3]); }
    signText(g, top, 0, hy - 18, lit() ? neon(col, 2) : { sx: 2, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed(col), dimmed(col)], ink, shadow: dimmed('#3B0764'), drop: 1 });
    signText(g, sub, 0, hy - 2, lit() ? neon('#22D3EE', 1) : { sx: 1, sy: 1, bold: true, fill: dimmed('#22D3EE'), ink });
    signText(g, tag, -w / 2 + 6, hy + 46, { sx: 1, sy: 1, bold: true, fill: dimmed('#F472B6'), slant: 1, ink: dimmed('#1F2937') });
  });
};
/** A poster column (a Morris column: a fat cylinder in steps, the domed cap, its finial). */
const posterColumn = (c: Ctx, x: number) => {
  still(c, 'bk-column', x, 0, -76, Y(250), 152, 254, g => {
    const Gn = DR('#047857'), ink = dimmed(INK);
    const body = () => g.rect(-60, Y(208), 120, 208);
    box(g, -62, Y(210), 124, 210, ink); shadeAcross(g, body, -60, Y(208), 120, 208, Gn);
    for (const yy of [Y(200), GY - 20]) { box(g, -64, yy, 128, 8, ink); box(g, -62, yy + 1, 124, 6, Gn[2]); box(g, -62, yy + 1, 124, 2, Gn[4]); }
    g.fillStyle = ink; g.beginPath(); g.ellipse(0, Y(212), 68, 15, 0, Math.PI, 0); g.fill();
    g.fillStyle = Gn[2]; g.beginPath(); g.ellipse(0, Y(212), 64, 12, 0, Math.PI, 0); g.fill(); g.fillStyle = Gn[4]; g.beginPath(); g.ellipse(-16, Y(216), 30, 5, 0, Math.PI, 0); g.fill();
    g.fillStyle = ink; g.beginPath(); g.ellipse(0, Y(222), 22, 18, 0, Math.PI, 0); g.fill(); g.fillStyle = Gn[3]; g.beginPath(); g.ellipse(0, Y(222), 20, 16, 0, Math.PI, 0); g.fill(); g.fillStyle = Gn[5]; g.beginPath(); g.ellipse(-6, Y(230), 6, 4, 0, 0, Math.PI * 2); g.fill();
    ballR(g, 0, Y(242), 5, DR('#FDE047'));
    // (other bills pasted round it, ragged)
    for (const [bx, by, col] of [[-54, Y(196), '#FDE68A'], [32, Y(190), '#F9A8D4'], [36, Y(120), '#A5F3FC']] as [number, number, string][]) { box(g, bx, by, 20, 34, dimmed(col)); for (let k = 0; k < 4; k++) box(g, bx + 3, by + 6 + k * 6, 14, 2, dimmed('#64748B')); }
  });
};
/** The construction fence the posters are pasted along: plywood sheets on 2x4 posts, POST NO BILLS stenciled (the
 *  posters over it), paste drips, barbed wire along its top. */
const posterFence = (c: Ctx, a: number, b: number) => {
  const xa = X(a), w = X(b) - xa, top = Y(170);
  still(c, `bk-fence-${a}`, xa, 0, -8, top - 14, w + 16, GY - top + 18, g => {
    const Pw = DR('#C8A97E'), Po = DR('#8A6A44'), ink = dimmed(INK);
    box(g, -2, top, w + 4, GY - top, ink);
    for (let x = 0; x < w; x += 60) {
      const sw = Math.min(58, w - x), shade = (x / 60) % 2 ? 0.06 : 0;
      box(g, x, top + 2, sw, GY - top - 2, mix(Pw[3], INK, shade)); box(g, x, top + 2, 2, GY - top - 2, Pw[4]); box(g, x + sw - 3, top + 2, 3, GY - top - 2, Pw[2]);
      for (let k = 0; k < 6; k++) { g.strokeStyle = Pw[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4, top + 12 + k * 26 + hash(x + k) * 6); g.bezierCurveTo(x + 20, top + 6 + k * 26, x + 40, top + 20 + k * 26, x + sw - 4, top + 12 + k * 26); g.stroke(); }
      for (const ny of [top + 8, GY - 10]) for (const nx of [x + 4, x + sw - 6]) box(g, nx, ny, 2, 2, Po[1]);
    }
    for (let x = 0; x <= w; x += 120) { box(g, x - 4, top - 6, 8, GY - top + 6, ink); box(g, x - 3, top - 5, 6, GY - top + 5, Po[3]); box(g, x - 3, top - 5, 2, GY - top + 5, Po[4]); }
    g.strokeStyle = dimmed('#71717A'); g.lineWidth = 1;
    for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, top - 4); g.lineTo(x + 3, top - 8); g.lineTo(x + 6, top - 4); g.stroke(); }
    signText(g, 'POST NO BILLS', w / 2, GY - 6, { sx: 1, sy: 1, stencil: true, bold: true, fill: dimmed('#44403C') });
    for (let k = 0; k < 7; k++) { const dx = 40 + k * (w - 80) / 6; box(g, dx, top + 150, 2, 6 + (k % 3) * 4, dimmed('#E7E0CC')); }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The couch's street: the garage, the newsstand, the shelter

/** COUCH DUDES' garage: cinder block (its sides going back), the roll-up door up on the dark inside (a workbench and
 *  its pegboard, a tire stack, pizza boxes, an oil stain), COUCH DUDES painted over it, COUCH FUEL's old pump by it. */
const garage = (c: Ctx, v: View) => {
  const [a, b] = COUCH.barn, xa = X(a), w = X(b) - xa, top = Y(200), Cb = DR('#94A3B8');
  sideBack(c, v.eye, xa, -1, top - 8, GY, 1, SET_D, Cb, 3);
  sideBack(c, v.eye, xa + w, 1, top - 8, GY, 1, SET_D, Cb, 3);
  topBack(c, v.eye, xa - 4, xa + w + 4, top - 8, 1, SET_D, DR('#64748B'), 2);
  still(c, 'bk-garage', xa, 0, -60, top - 40, w + 120, GY - top + 44, g => {
    const ink = dimmed(INK), Dk = DR('#0F172A'), Rd = DR('#DC2626');
    box(g, -2, top - 10, w + 4, GY - top + 10, ink); box(g, 0, top - 8, w, GY - top + 8, Cb[3]); box(g, 0, top - 8, 4, GY - top + 8, Cb[4]); box(g, w - 12, top - 8, 12, GY - top + 8, Cb[2]);
    for (let y = top; y < GY; y += 14) for (let x = (y / 14) % 2 ? 0 : 20; x < w; x += 40) { box(g, x, y, 38, 1, Cb[1]); box(g, x, y + 1, 38, 1, Cb[4]); box(g, x + 38, y - 13, 1, 13, Cb[1]); }
    box(g, -6, top - 14, w + 12, 8, ink); box(g, -4, top - 12, w + 8, 4, Cb[2]); box(g, -4, top - 12, w + 8, 1, Cb[4]);
    // (the door opening: dark inside, the workbench, the pegboard of tools, tires, pizza boxes)
    const dx = 28, dw = w - 56, dt = top + 60;
    box(g, dx - 2, dt - 2, dw + 4, GY - dt + 2, ink); box(g, dx, dt, dw, GY - dt, Dk[2]); box(g, dx, dt, dw, 18, Dk[1]);
    box(g, dx + 10, dt + 26, 70, 40, Dk[3]); for (let k = 0; k < 12; k++) box(g, dx + 14 + (k % 6) * 11, dt + 30 + Math.floor(k / 6) * 16, 2, 2, Dk[1]);
    for (const [tx, tw, ty] of [[dx + 18, 6, dt + 34], [dx + 34, 14, dt + 32], [dx + 56, 4, dt + 36]] as const) box(g, tx, ty, tw, 14, Dk[4]);
    box(g, dx + 6, GY - 40, 80, 6, Dk[4]); box(g, dx + 10, GY - 34, 4, 34, Dk[3]); box(g, dx + 78, GY - 34, 4, 34, Dk[3]);
    for (let k = 0; k < 4; k++) { g.fillStyle = Dk[0]; g.beginPath(); g.ellipse(dx + dw - 40, GY - 8 - k * 14, 20, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = Dk[3]; g.beginPath(); g.ellipse(dx + dw - 40, GY - 8 - k * 14, 20, 7, 0, Math.PI, 0); g.fill(); }
    for (let k = 0; k < 5; k++) { box(g, dx + dw - 100 + k * 2, GY - 6 - k * 5, 40, 5, dimmed(k % 2 ? '#E7D8B8' : '#D8C8A8')); box(g, dx + dw - 96 + k * 2, GY - 5 - k * 5, 6, 2, dimmed('#C8283E')); }
    g.fillStyle = 'rgba(10,8,20,0.5)'; g.beginPath(); g.ellipse(dx + dw / 2, GY - 2, 50, 4, 0, 0, Math.PI * 2); g.fill();
    // (the roll-up door rolled up under the header, its slats)
    box(g, dx - 2, dt - 4, dw + 4, 22, ink); for (let y = dt - 2; y < dt + 16; y += 4) { box(g, dx, y, dw, 3, DR('#64748B')[3]); box(g, dx, y, dw, 1, DR('#64748B')[4]); }
    // (the name: painted fat across the block)
    signText(g, 'COUCH DUDES', w / 2, top + 30, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047'), dimmed('#F97316')], ink, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'GARAGE', w / 2, top + 48, { sx: 1, sy: 1, bold: true, fill: dimmed('#FFFFFF'), ink });
    // (COUCH FUEL: an old gas pump by the door, its globe, the hose)
    const px = w + 30;
    box(g, px - 14, GY - 70, 28, 70, ink); box(g, px - 12, GY - 68, 24, 68, Rd[3]); box(g, px - 12, GY - 68, 4, 68, Rd[4]); box(g, px + 8, GY - 68, 4, 68, Rd[1]);
    box(g, px - 8, GY - 60, 16, 14, dimmed('#F8FAFC')); signText(g, '0.99', px, GY - 50, { sx: 1, sy: 1, fill: dimmed('#1F2937'), gap: 0 });
    ballR(g, px, GY - 80, 10, DR('#F8FAFC')); signText(g, 'FUEL', px, GY - 77, { sx: 1, sy: 1, fill: dimmed('#DC2626'), gap: 0 });
    g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(px + 12, GY - 40); g.quadraticCurveTo(px + 30, GY - 10, px + 20, GY - 30); g.stroke();
    signText(g, 'COUCH', px, GY - 20, { sx: 1, sy: 1, fill: dimmed('#FFFFFF'), gap: 0 });
  });
};
/** The newsstand: a kiosk behind, the racks of 1994's magazines, its striped awning on two poles (lit: stand on it),
 *  the awning's top going back. */
const newsstand = (c: Ctx, v: View) => {
  const [a, b, h] = NEWSSTAND, xa = X(a), xb = X(b), top = Y(h), w = xb - xa, Gr = NR('#16A34A'), Wt = NR('#F8FAFC');
  topBack(c, v.eye, xa - 8, xb + 8, top, 1, 0.95, Gr, 2);
  still(c, `bk-news`, xa, 0, -14, top - 6, w + 28, GY - top + 10, g => {
    const ink = dimmed(INK), K = DR('#7C2D12');
    box(g, 4, top + 14, w - 8, GY - top - 14, ink); box(g, 6, top + 16, w - 12, GY - top - 16, K[3]); box(g, 6, top + 16, 3, GY - top - 16, K[4]); box(g, w - 10, top + 16, 4, GY - top - 16, K[1]);
    const mags: [string, string][] = [['TV WEEK', '#F472B6'], ['RAD', '#FDE047'], ['PAGER', '#22D3EE'], ['TEEN', '#A3E635'], ['GAMES', '#F97316']];
    for (let r = 0; r < 3; r++) {
      box(g, 8, top + 42 + r * 26, w - 16, 3, K[1]);
      for (let k = 0; k < 5; k++) { const [t, col] = mags[(k + r) % 5], mx = 12 + k * 18, my = top + 20 + r * 26, C = DR(col); box(g, mx - 1, my - 1, 16, 22, ink); box(g, mx, my, 14, 20, C[3]); box(g, mx, my, 14, 4, C[5]); box(g, mx + 2, my + 6, 10, 8, C[1]); if (t === 'TV WEEK') { box(g, mx + 3, my + 7, 8, 6, dimmed('#F4B8A0')); box(g, mx + 4, my + 12, 6, 2, dimmed('#F8FAFC')); } box(g, mx + 1, my + 16, 12, 2, dimmed('#1F2937')); }
    }
    signText(g, 'IS DAD MAN OVER?', w / 2, GY - 6, { sx: 1, sy: 1, fill: dimmed('#FDE047'), gap: 0, space: 2 });
    // (the poles)
    for (const px of [2, w - 6]) { box(g, px - 1, top + 4, 6, GY - top - 4, ink); box(g, px, top + 4, 4, GY - top - 4, NR('#A1A1AA')[3]); box(g, px, top + 4, 1, GY - top - 4, NR('#A1A1AA')[5]); }
    // (the awning: striped, scalloped, lit along its top)
    box(g, -8, top - 2, w + 16, 14, INK);
    for (let k = 0; k < w + 12; k += 12) { const R = k % 24 ? Wt : Gr; box(g, -6 + k, top, 12, 10, R[3]); box(g, -6 + k, top, 3, 10, R[4]); box(g, -6 + k + 9, top, 3, 10, R[2]); }
    for (let k = 0; k < w + 12; k += 12) { g.fillStyle = INK; g.beginPath(); g.arc(k, top + 11, 6.5, 0, Math.PI); g.fill(); g.fillStyle = (k % 24 ? Wt : Gr)[2]; g.beginPath(); g.arc(k, top + 11, 5, 0, Math.PI); g.fill(); }
    box(g, -6, top, w + 12, 2, LIP[2]); box(g, -2, top, w * 0.5, 1, LIP[3]);
  });
};
/** The bus shelter: a roof on two poles (lit along its top: stand on it), a glass ad panel (THIS FALL: DAD MAN), the
 *  bench; the PARK SHUTTLE sign on its pole. */
const shelter = (c: Ctx, v: View) => {
  const [a, b, h] = SHELTER, xa = X(a), xb = X(b), top = Y(h), w = xb - xa, Tl = NR('#0D9488');
  topBack(c, v.eye, xa - 6, xb + 6, top, 1, 0.94, Tl, 2);
  still(c, 'bk-shelter', xa, 0, -12, GY - 170, w + 80, 174, g => {
    const ink = dimmed(INK), St = NR('#A1A1AA');
    box(g, 8, top + 14, w - 16, GY - top - 30, ink); glassPanel(g, 10, top + 16, w - 20, GY - top - 34);
    box(g, 22, top + 22, 44, 34, dimmed('#38BDF8')); box(g, 24, top + 36, 40, 10, dimmed('#C2410C')); g.fillStyle = dimmed('#F4B8A0'); g.beginPath(); g.arc(40, top + 34, 5, 0, Math.PI * 2); g.fill(); box(g, 36, top + 38, 9, 7, dimmed('#F8FAFC')); box(g, 22, top + 48, 44, 8, dimmed('#1E3A8A'));
    signText(g, 'THIS FALL', 44, top + 30, { sx: 1, sy: 1, fill: dimmed('#FDE047'), gap: 0 });
    const Bn = DR('#78716C'); box(g, 22, GY - 34, w - 44, 7, ink); box(g, 23, GY - 33, w - 46, 5, Bn[3]); box(g, 23, GY - 33, w - 46, 1, Bn[5]); for (const lx of [28, w - 32]) box(g, lx, GY - 27, 4, 27, ink);
    for (const px of [6, w - 10]) postR(g, px + 2, top + 6, GY, 4, St);
    box(g, -6, top - 2, w + 12, 12, INK); box(g, -4, top, w + 8, 8, Tl[3]); box(g, -4, top + 5, w + 8, 3, Tl[1]); box(g, -4, top, 3, 8, Tl[4]);
    box(g, -4, top, w + 8, 2, LIP[2]); box(g, 0, top, w * 0.5, 1, LIP[3]);
    // (the sign on its pole)
    postR(g, w + 12, GY - 150, GY, 4, St);
    const Y3 = NR('#FDE047'); box(g, w - 18, GY - 162, 62, 28, INK); box(g, w - 16, GY - 160, 58, 24, Y3[3]); box(g, w - 16, GY - 160, 58, 2, Y3[5]); box(g, w - 16, GY - 140, 58, 4, Y3[2]);
    signText(g, 'PARK', w + 13, GY - 151, { sx: 1, sy: 1, bold: true, fill: INK }); signText(g, 'SHUTTLE', w + 13, GY - 141, { sx: 1, sy: 1, fill: INK });
  });
};
/** Glass in bands (sky by day, the street lights after dark), a glint. */
const glassPanel = (g: Ctx, x: number, y: number, w: number, h: number) => {
  const G = lit() ? ['#2A1A3A', '#3A2A4A', '#4A3A5A', '#6A4A6A'] : ['#5A9AC8', '#7AB4DC', '#9ACCEA', '#C2E2F6'];
  for (let i = 0; i < 4; i++) box(g, x, y + (h * i) / 4, w, Math.ceil(h / 4) + 1, dimmed(G[3 - i]));
  g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo(x + w * 0.6, y); g.lineTo(x + w * 0.75, y); g.lineTo(x + w * 0.5, y + h); g.lineTo(x + w * 0.35, y + h); g.closePath(); g.fill();
};

// ---------------------------------------------------------------------------------------------------------------
// THE DAD MAN STORE

/** The gift shack: clapboard (its sides and roof going back), the dad's big head on the roof board, THE DAD MAN
 *  STORE; the window of unsold merch; EVERYTHING 90% OFF across it, NOW 95% stuck over that; the door with its
 *  CLEARANCE card; the cardboard standee; the awning (lit: stand on it). */
const shack = (c: Ctx, v: View) => {
  const xa = X(SHACK.a), w = X(SHACK.b) - xa, top = Y(230), Cl = DR('#FEF3C7');
  sideBack(c, v.eye, xa, -1, top, GY, 1, SET_D, Cl, 3);
  sideBack(c, v.eye, xa + w, 1, top, GY, 1, SET_D, Cl, 3);
  still(c, 'bk-shack', xa, 0, -20, top - 124, w + 40, GY - top + 128, g => {
    const ink = dimmed(INK), Bl = DR('#1E3A8A'), Rd = DR('#DC2626');
    box(g, -2, top - 2, w + 4, GY - top + 2, ink); box(g, 0, top, w, GY - top, Cl[3]);
    for (let y = top + 2; y < GY; y += 10) { box(g, 0, y, w, 1, Cl[5]); box(g, 0, y + 8, w, 2, Cl[2]); }
    box(g, 0, top, 6, GY - top, Cl[4]); box(g, w - 14, top, 14, GY - top, Cl[2]); checker(g, w - 16, top, 2, GY - top, Cl[2], 0, 1);
    box(g, -6, top - 8, w + 12, 8, ink); box(g, -4, top - 6, w + 8, 4, Bl[3]); box(g, -4, top - 6, w + 8, 1, Bl[5]);
    // (the roof board: the dad's big head, THE DAD MAN STORE, its braces)
    for (const bx of [w / 2 - 120, w / 2 + 120]) { box(g, bx - 2, top - 14, 4, 10, ink); }
    box(g, w / 2 - 152, top - 72, 304, 66, ink); bandsDown(g, () => g.rect(w / 2 - 150, top - 70, 300, 62), w / 2 - 150, top - 70, 300, 62, [Bl[4], Bl[3], Bl[3], Bl[2]]);
    box(g, w / 2 - 150, top - 70, 300, 2, Bl[5]);
    signText(g, 'THE DAD MAN STORE', w / 2 + 30, top - 42, { sx: 1, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink, shadow: dimmed('#0F172A'), drop: 1 });
    signText(g, 'GIFTS! TOYS! COLLECTIBLES!', w / 2 + 30, top - 20, { sx: 1, sy: 1, fill: dimmed('#FFFFFF') });
    g.save(); g.beginPath(); g.rect(w / 2 - 148, top - 124, 80, 116); g.clip(); dadArt(g, w / 2 - 104, top + 8, 0.95, 0.2, '#1E3A8A'); g.restore();
    // (the window: shelves of beer-can hats, WORLD'S STUPIDEST DAD mugs, foam couches; the glass's glint)
    const wx = 160, wy = top + 60, ww = 260, wh = 110;
    box(g, wx - 4, wy - 4, ww + 8, wh + 8, ink); box(g, wx - 2, wy - 2, ww + 4, wh + 4, Rd[2]);
    box(g, wx, wy, ww, wh, dimmed(lit() ? '#4A3A2A' : '#1E293B'));
    for (let s = 0; s < 3; s++) { box(g, wx, wy + 34 + s * 36, ww, 3, DR('#A16207')[3]); box(g, wx, wy + 34 + s * 36, ww, 1, DR('#A16207')[5]); }
    for (let row = 0; row < 3; row++) for (let k = 0; k < 9; k++) {
      const ix = wx + 10 + k * 28, iy = wy + 32 + row * 36;
      if (row === 0) { const Rc = DR('#DC2626'); box(g, ix, iy - 14, 8, 12, Rc[3]); box(g, ix, iy - 14, 2, 12, Rc[4]); box(g, ix + 12, iy - 14, 8, 12, Rc[3]); box(g, ix + 12, iy - 14, 2, 12, Rc[4]); box(g, ix - 2, iy - 4, 24, 3, dimmed('#FDE047')); box(g, ix + 4, iy - 18, 12, 4, dimmed('#F8FAFC')); g.strokeStyle = dimmed('#F8FAFC'); g.lineWidth = 1; g.beginPath(); g.moveTo(ix + 4, iy - 14); g.lineTo(ix + 10, iy - 18); g.lineTo(ix + 16, iy - 14); g.stroke(); }
      else if (row === 1) { const Mg = DR('#F8FAFC'); box(g, ix + 2, iy - 16, 14, 14, Mg[3]); box(g, ix + 2, iy - 16, 3, 14, Mg[5]); box(g, ix + 13, iy - 16, 3, 14, Mg[1]); g.strokeStyle = Mg[2]; g.lineWidth = 2; g.beginPath(); g.arc(ix + 17, iy - 9, 4, -1.4, 1.4); g.stroke(); g.fillStyle = dimmed('#F4B8A0'); g.beginPath(); g.arc(ix + 9, iy - 10, 3.5, 0, Math.PI * 2); g.fill(); box(g, ix + 4, iy - 5, 10, 1, dimmed('#1E3A8A')); }
      else { const Co = DR('#C2410C'); box(g, ix, iy - 10, 22, 8, Co[3]); box(g, ix, iy - 16, 22, 6, Co[2]); box(g, ix, iy - 16, 22, 1, Co[5]); box(g, ix, iy - 16, 3, 14, Co[1]); box(g, ix + 19, iy - 16, 3, 14, Co[1]); }
    }
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(wx + 20, wy); g.lineTo(wx + 60, wy); g.lineTo(wx + 20, wy + wh); g.lineTo(wx - 20, wy + wh); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.moveTo(wx + 150, wy); g.lineTo(wx + 166, wy); g.lineTo(wx + 136, wy + wh); g.lineTo(wx + 120, wy + wh); g.closePath(); g.fill();
    signText(g, "WORLD'S STUPIDEST DAD", wx + ww / 2, wy + wh - 4, { sx: 1, sy: 1, fill: dimmed('#FDE047'), gap: 0, space: 2 });
    // (the sale banner across the window, the sticker over it)
    box(g, wx - 10, wy - 34, ww + 20, 26, ink); bandsDown(g, () => g.rect(wx - 8, wy - 32, ww + 16, 22), wx - 8, wy - 32, ww + 16, 22, [Rd[4], Rd[3], Rd[3], Rd[2]]);
    signText(g, 'EVERYTHING 90% OFF!', wx + ww / 2, wy - 16, { sx: 1, sy: 2, bold: true, fill: dimmed('#FFFFFF'), ink });
    g.save(); g.translate(wx + ww - 10, wy - 34); g.rotate(0.3);
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, r = k % 2 ? 22 : 26; if (!k) g.beginPath(); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = ink; g.fill();
    g.fillStyle = DR('#FDE047')[3]; g.beginPath(); g.arc(0, 0, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = DR('#FDE047')[5]; g.beginPath(); g.arc(-5, -6, 6, 0, Math.PI * 2); g.fill();
    signText(g, 'NOW', 0, -2, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') }); signText(g, '95%', 0, 8, { sx: 1, sy: 1, bold: true, fill: dimmed('#B91C1C') }); g.restore();
    // (the door, its CLEARANCE card, a bell)
    const D3 = DR('#7C2D12');
    box(g, 448, top + 68, 58, GY - top - 68, ink); box(g, 450, top + 70, 54, GY - top - 70, D3[3]); box(g, 450, top + 70, 4, GY - top - 70, D3[4]); box(g, 498, top + 70, 6, GY - top - 70, D3[1]);
    glassPanel(g, 458, top + 80, 38, 40);
    box(g, 460, top + 100, 34, 14, dimmed('#FDE047')); signText(g, 'CLEARANCE', 477, top + 110, { sx: 1, sy: 1, fill: dimmed('#B91C1C'), gap: 0 });
    box(g, 492, top + 130, 4, 4, DR('#D09A30')[4]);
    // (the standee by the door: him in cardboard, its easel leg; HAVE YOU HUGGED A DAD MAN TODAY?)
    g.save(); g.beginPath(); g.rect(10, top + 40, 130, GY - top - 40); g.clip(); dadArt(g, 72, GY - 24, 1.05, 0.15, '#E7D8B8'); g.restore();
    box(g, 14, GY - 24, 120, 24, ink); box(g, 16, GY - 22, 116, 20, DR('#E7D8B8')[3]);
    signText(g, 'HAVE YOU HUGGED', 74, GY - 14, { sx: 1, sy: 1, fill: dimmed('#1E3A8A'), gap: 0, space: 2 }); signText(g, 'A DAD MAN TODAY?', 74, GY - 5, { sx: 1, sy: 1, fill: dimmed('#DC2626'), gap: 0, space: 2 });
  });
  // (the awning over the window: on brackets, striped, its top going back, lit along it)
  const [aa, ab, ah] = SHACK.awning, ty = Y(ah), Bl = NR('#1E3A8A'), Wt = NR('#F8FAFC');
  topBack(c, v.eye, X(aa) - 4, X(ab) + 4, ty, 1, 0.95, Wt, 2);
  still(c, 'bk-shack-awning', X(aa), ty, -10, -4, X(ab) - X(aa) + 20, 50, g => {
    const w2 = X(ab) - X(aa);
    box(g, -4, -2, w2 + 8, 16, INK);
    for (let k = 0; k < w2 + 4; k += 14) { const R = k % 28 ? Wt : Bl; box(g, -2 + k, 0, 7, 12, R[3]); box(g, -2 + k, 0, 2, 12, R[4]); box(g, 3 + k, 0, 2, 12, R[2]); const R2 = k % 28 ? Bl : Wt; box(g, 5 + k, 0, 7, 12, R2[3]); box(g, 5 + k, 0, 2, 12, R2[4]); }
    for (const bx of [6, w2 - 10]) { g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, 12); g.lineTo(bx + (bx < 20 ? 10 : -10), 40); g.stroke(); g.strokeStyle = NR('#A1A1AA')[4]; g.lineWidth = 1.5; g.stroke(); }
    box(g, -2, 0, w2 + 4, 2, LIP[2]); box(g, 2, 0, w2 * 0.5, 1, LIP[3]);
  });
};
/** The clearance bin out front (a wire basket on legs; not to stand on): the dolls piled in it (each the dad in his
 *  tank top, a can in hand), a card: CLEARANCE! PULL MY STRING! The one going off jiggles, its string out. */
const dollBin = (c: Ctx, x: number, f: number, talking: boolean) => {
  const top = Y(56);
  still(c, 'bk-dollbin', x, 0, -50, top - 34, 100, GY - top + 38, g => {
    const ink = INK, Sk = NR('#F4B8A0'), Tk = NR('#F8FAFC'), Wr = NR('#A1A1AA'), Yc = NR('#FDE047');
    for (const lx of [-38, 36]) postR(g, lx + 1, top + 36, GY, 3, Wr);
    for (let i = 0; i < 7; i++) {
      const dx = -34 + i * 11, dy = top + 6 + (i % 2) * 5;
      box(g, dx - 5, dy + 4, 10, 8, ink); box(g, dx - 4, dy + 5, 8, 6, Tk[3]); box(g, dx - 4, dy + 5, 2, 6, Tk[5]);
      ballR(g, dx, dy, 5.5, Sk);
      box(g, dx - 2, dy - 1, 1, 1, ink); box(g, dx + 1, dy - 1, 1, 1, ink); box(g, dx - 1, dy + 2, 3, 1, '#7F1D1D');
      g.strokeStyle = ink; g.lineWidth = 0.6; g.beginPath(); g.moveTo(dx - 3, dy - 4); g.quadraticCurveTo(dx, dy - 7, dx + 3, dy - 4); g.stroke();
      if (i % 3 === 0) { box(g, dx + 4, dy - 9, 4, 7, ink); box(g, dx + 5, dy - 8, 2, 5, hour('#DC2626')); }
    }
    g.strokeStyle = ink; g.lineWidth = 2; g.strokeRect(-42, top + 8, 84, 30);
    g.strokeStyle = Wr[3]; g.lineWidth = 1; for (let k = -40; k < 42; k += 8) { g.beginPath(); g.moveTo(k, top + 8); g.lineTo(k, top + 38); g.stroke(); } for (let y = top + 14; y < top + 38; y += 8) { g.beginPath(); g.moveTo(-42, y); g.lineTo(42, y); g.stroke(); }
    g.strokeStyle = Wr[5]; g.beginPath(); g.moveTo(-42, top + 8); g.lineTo(42, top + 8); g.stroke();
    box(g, -31, top - 31, 62, 26, ink); bandsDown(g, () => g.rect(-29, top - 29, 58, 22), -29, top - 29, 58, 22, [Yc[4], Yc[3], Yc[3], Yc[2]]);
    signText(g, 'CLEARANCE!', 0, top - 19, { sx: 1, sy: 1, bold: false, fill: '#B91C1C' });
    signText(g, 'PULL MY STRING!', 0, top - 10, { sx: 1, sy: 1, bold: false, fill: INK, gap: 0, space: 2 });
    postR(g, 0, top - 6, top + 8, 2, Wr);
  });
  if (talking) {
    // (the one that's going off: up out of the pile, jiggling, its string out)
    const dx = x + 14 + Math.sin(f * 0.9) * 1.5, dy = top + 2;
    c.strokeStyle = '#E5E7EB'; c.lineWidth = 1; c.beginPath(); c.moveTo(dx, dy + 10); c.quadraticCurveTo(dx + 10, dy + 24, dx + 16 + Math.sin(f * 0.5) * 2, dy + 30); c.stroke();
    ballR(c, dx + 16 + Math.sin(f * 0.5) * 2, dy + 31, 2, NR('#F8FAFC'));
    ballR(c, dx, dy, 6, NR('#F4B8A0'));
    box(c, dx - 2, dy - 2, 1, 1, INK); box(c, dx + 2, dy - 2, 1, 1, INK); box(c, dx - 1, dy + 1, 4, 2 + ((f >> 2) % 2), '#7F1D1D');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// SPAZ & STINKY'S BUMPER BASH

/** The rink: the canopy and its sparking ceiling grid overhead (their undersides going back), the chain-link at its back
 *  with the scoreboard and the crowd behind it, the diamond-plate floor going back, the rails at its ends (solid: their
 *  tops going back, lit), the canopy's posts. */
const rinkBack = (c: Ctx, state: GameState, v: View) => {
  const xa = X(RINK.a), xb = X(RINK.b), gy = Y(330), f = state.frame;
  const l = Math.max(xa - 60, v.cam.x - 40), r = Math.min(xb + 60, v.cam.x + 840);
  // (the floor: steel diamond plate going back to the fence, in bands, scuffs and tire marks)
  const Fl = NR('#9CA3AF');
  for (let i = 0; i < 4; i++) {
    const d0 = RINK_D + ((1 - RINK_D) * i) / 4, d1 = RINK_D + ((1 - RINK_D) * (i + 1)) / 4;
    polyF(c, [at(v.eye, xa, GY, d0), at(v.eye, xb, GY, d0), at(v.eye, xb, GY, d1), at(v.eye, xa, GY, d1)], Fl[1 + i]);
  }
  for (let x = Math.floor(l / 18) * 18; x < r; x += 18) for (let i = 0; i < 4; i++) { const [px, py] = at(v.eye, x + (i % 2) * 9, GY, RINK_D + (1 - RINK_D) * (i + 0.5) / 4); if (px > at(v.eye, xa, GY, 1)[0] && px < at(v.eye, xb, GY, 1)[0]) box(c, px, py, 3, 1, Fl[5]); }
  c.strokeStyle = hour('#3F3F46'); c.lineWidth = 2; for (let k = 0; k < 5; k++) { const sx = xa + 120 + k * 210, [p0x, p0y] = at(v.eye, sx, GY, 0.97), [p1x, p1y] = at(v.eye, sx + 90, GY, 0.93); c.beginPath(); c.moveTo(p0x, p0y); c.quadraticCurveTo((p0x + p1x) / 2 + 20, p0y, p1x, p1y); c.stroke(); }
  // (the back fence at RINK_D: posts, the chain-link, a rail; the crowd behind it; the scoreboard)
  const [fa, fy] = at(v.eye, xa, GY, RINK_D), [fb] = at(v.eye, xb, GY, RINK_D), fh = 150 * RINK_D;
  for (let k = 0; k < 16; k++) {
    const px = fa + 20 + k * ((fb - fa - 40) / 15), seed = 400 + k * 7;
    if (px > v.cam.x - 40 && px < v.cam.x + 840) crowdHead(c, px, fy - 6, seed, (54 + hash(seed) * 22) * RINK_D, f);
  }
  c.save(); c.beginPath(); c.rect(fa, fy - fh, fb - fa, fh); c.clip();
  c.strokeStyle = dimmed('#A1A1AA'); c.lineWidth = 1;
  for (let x = Math.floor((Math.max(fa, v.cam.x - 40) - fh) / 12) * 12; x < Math.min(fb, v.cam.x + 840) + fh; x += 12) { c.beginPath(); c.moveTo(x, fy - fh); c.lineTo(x + fh, fy); c.moveTo(x, fy - fh); c.lineTo(x - fh, fy); c.stroke(); }
  c.restore();
  const Ps = DR('#71717A');
  for (let x = fa; x <= fb; x += (fb - fa) / 6) postR(c, x, fy - fh - 4, fy, 4, Ps);
  box(c, fa, fy - fh - 4, fb - fa, 4, Ps[2]); box(c, fa, fy - fh - 4, fb - fa, 1, Ps[4]);
  // (the scoreboard over the fence: SPAZ 3 STINKY 0, the bulbs)
  stillAt(c, v, RINK_D, 'bk-scoreboard', (xa + xb) / 2, GY - 150 - 64, -94, -6, 188, 68, g => {
    const ink = dimmed(INK), Bk = DR('#1F2937');
    box(g, -6, 44, 4, 16, ink); box(g, 2, 44, 4, 16, ink);
    box(g, -92, -4, 184, 50, ink); box(g, -90, -2, 180, 46, Bk[3]); box(g, -90, -2, 180, 2, Bk[5]);
    signText(g, "SPAZ & STINKY'S", 0, 10, { sx: 1, sy: 1, bold: true, slant: 1, fill: dimmed('#F472B6') });
    for (const [sx, name, n, col] of [[-48, 'SPAZ', '3', '#F472B6'], [48, 'STINKY', '0', '#F59E0B']] as [number, string, string, string][]) { signText(g, name, sx, 22, { sx: 1, sy: 1, fill: dimmed('#FFFFFF') }); box(g, sx - 12, 26, 24, 16, dimmed('#0F0A1A')); signText(g, n, sx, 40, { sx: 2, sy: 2, bold: true, fill: lit() ? col : dimmed(col) }); }
    signText(g, 'BUMPS', 0, 38, { sx: 1, sy: 1, fill: dimmed('#A3E635') });
  });
  // (the canopy's posts, the roof (its underside going back), its zigzag valance, the name; the grid under it)
  for (const px of [xa - 20, xb + 16]) { const St = DR('#71717A'); postR(c, px + 4, gy - 60, GY, 8, St); }
  const Pu = DR('#7C3AED');
  polyF(c, [at(v.eye, xa - 40, gy - 54, 1), at(v.eye, xb + 40, gy - 54, 1), at(v.eye, xb + 40, gy - 54, RINK_D), at(v.eye, xa - 40, gy - 54, RINK_D)], Pu[1]);
  polyF(c, [at(v.eye, xa, Y(326), 1), at(v.eye, xb, Y(326), 1), at(v.eye, xb, Y(326), RINK_D), at(v.eye, xa, Y(326), RINK_D)], dimmed('#3F3F46'));
  c.strokeStyle = dimmed('#8A8AA0'); c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor(l / 16) * 16; x < r; x += 16) { if (x < xa || x > xb) continue; const [p0x, p0y] = at(v.eye, x, Y(326), 1), [p1x, p1y] = at(v.eye, x, Y(326), RINK_D); c.moveTo(p0x, p0y); c.lineTo(p1x, p1y); }
  for (let i = 1; i < 4; i++) { const d = 1 - (1 - RINK_D) * (i / 4), [p0x, p0y] = at(v.eye, xa, Y(326), d), [p1x] = at(v.eye, xb, Y(326), d); c.moveTo(p0x, p0y); c.lineTo(p1x, p0y); }
  c.stroke();
  if ((f >> 3) % 9 === 0) { const sx = l + ((f * 37) % Math.max(1, r - l)); box(c, sx, Y(326) - 2, 3, 3, '#FEF08A'); box(c, sx - 3, Y(326), 2, 1, '#FFFFFF'); }
  still(c, 'bk-rink-canopy', xa, 0, -44, gy - 80, xb - xa + 88, 40, g => {
    const ink = dimmed(INK), w = xb - xa;
    box(g, -40, gy - 76, w + 80, 22, ink); bandsDown(g, () => g.rect(-38, gy - 74, w + 76, 18), -38, gy - 74, w + 76, 18, [Pu[4], Pu[3], Pu[2]]);
    for (let x = -38; x < w + 38; x += 40) { polyF(g, [[x, gy - 56], [x + 20, gy - 44], [x + 40, gy - 56]], ink); polyF(g, [[x + 2, gy - 56], [x + 20, gy - 46], [x + 38, gy - 56]], DR('#FDE047')[3]); polyF(g, [[x + 2, gy - 56], [x + 12, gy - 50], [x + 18, gy - 56]], DR('#FDE047')[5]); }
    signText(g, "SPAZ & STINKY'S BUMPER BASH", w / 2, gy - 60, { sx: 1, sy: 1, bold: true, slant: 1, fill: dimmed('#FFFFFF'), ink });
  });
  // (the floor's near edge at the play plane: a lit strip (he walks it))
  box(c, xa, GY, xb - xa, 3, LIP[2]); box(c, xa, GY, xb - xa, 1, LIP[3]);
  void state;
};
/** One of the crowd behind the rink's fence, head and shoulders (seeded), bobbing a little. */
const crowdHead = (c: Ctx, x: number, feet: number, seed: number, h: number, f: number) => {
  const skins = ['#F2C9A0', '#E8B48A', '#C68A5A', '#8A5A3A', '#5A3A2A', '#F6D8B8'], hairs = ['#2A1A10', '#6A3A1A', '#C89A4A', '#1A1A1A', '#8A2A1A', '#E8D8A8'];
  const sk = dimmed(skins[((Math.floor(seed) % 6) + 6) % 6]), hr = dimmed(hairs[((Math.floor(seed >> 1) % 6) + 6) % 6]), sh = dimmed(['#2563EB', '#DC2626', '#16A34A', '#7C3AED', '#F59E0B', '#0D9488'][((Math.floor(seed >> 2) % 6) + 6) % 6]);
  const bob = Math.sin(f * 0.08 + seed) > 0.7 ? -2 : 0, top = feet - h + bob;
  box(c, x - 8, top + 14, 16, h - 14, dimmed(INK)); box(c, x - 7, top + 15, 14, h - 16, sh);
  c.fillStyle = dimmed(INK); c.beginPath(); c.ellipse(x, top + 7, 6, 7.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = sk; c.beginPath(); c.ellipse(x, top + 7, 5, 6.5, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = hr; c.beginPath(); c.ellipse(x, top + 3, 5.5, 4, 0, Math.PI, 0); c.fill();
  if (seed % 3 === 0) { box(c, x - 6, top + 1, 12, 3, dimmed(['#DC2626', '#1F2937', '#0D9488'][((Math.floor(seed) % 3) + 3) % 3])); box(c, x - 10, top + 3, 5, 2, dimmed(['#DC2626', '#1F2937', '#0D9488'][((Math.floor(seed) % 3) + 3) % 3])); }
  if (seed % 4 === 1) { box(c, x + 8, top + 2 + bob, 4, 14, dimmed(INK)); box(c, x + 9, top + 3 + bob, 2, 12, sk); }
};
/** The rink's rails (hazard-striped barriers, solid: their tops going back, lit). */
const rails = (c: Ctx, v: View) => {
  for (const [a, b] of RAILS) {
    const ra = X(a), rb = X(b), top = Y(RINK.rail);
    if (!onV(v, ra - 20, rb + 20)) continue;
    const Y2 = NR('#FDE047'), K = NR('#1F2937');
    topBack(c, v.eye, ra, rb, top, 1, 0.95, Y2, 2);
    sideBack(c, v.eye, ra, -1, top, GY, 1, 0.95, Y2, 2); sideBack(c, v.eye, rb, 1, top, GY, 1, 0.95, Y2, 2);
    box(c, ra, top, rb - ra, GY - top, INK);
    for (let y = top + 2; y < GY; y += 10) { box(c, ra + 2, y, rb - ra - 4, 5, Y2[3]); box(c, ra + 2, y, 3, 5, Y2[4]); box(c, ra + 2, y + 5, rb - ra - 4, 5, K[3]); box(c, rb - 6, y, 4, 10, 'rgba(26,16,40,0.25)'); }
    box(c, ra, top, rb - ra, 3, LIP[2]); box(c, ra + 2, top, (rb - ra) / 2, 1, LIP[3]);
  }
};
/** The scorer's stands: scaffold towers, X-braced, planks on top (their tops going back, lit), a clipboard hung. */
const stands = (c: Ctx, v: View) => {
  for (const [a, b, h] of STANDS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onV(v, xa - 20, xb + 20)) continue;
    const Wd = NR('#B45309');
    topBack(c, v.eye, xa, xb, top, 1, 0.95, Wd, 2);
    still(c, `bk-stand-${a}`, xa, 0, -6, top - 4, xb - xa + 12, GY - top + 6, g => {
      const w = xb - xa, St = NR('#A1A1AA');
      for (const px of [6, w - 6]) postR(g, px, top, GY, 4, St);
      g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(6, top + 10); g.lineTo(w - 6, GY - 10); g.moveTo(w - 6, top + 10); g.lineTo(6, GY - 10); g.stroke();
      g.strokeStyle = St[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(6, top + 10); g.lineTo(w - 6, GY - 10); g.moveTo(w - 6, top + 10); g.lineTo(6, GY - 10); g.stroke();
      for (const yy of [top + 50, top + 90]) { box(g, 4, yy, w - 8, 3, INK); box(g, 5, yy, w - 10, 1, St[4]); }
      box(g, 4, GY - 4, 12, 4, INK); box(g, w - 16, GY - 4, 12, 4, INK);
      box(g, -2, top - 2, w + 4, 12, INK); for (let k = 0; k < w; k += 25) { box(g, k, top, Math.min(24, w - k), 8, Wd[3]); box(g, k, top, 2, 8, Wd[4]); box(g, k, top + 6, Math.min(24, w - k), 2, Wd[1]); box(g, k + 8, top + 3, 6, 1, Wd[2]); }
      box(g, 0, top, w, 2, LIP[2]); box(g, 4, top, w / 2, 1, LIP[3]);
      box(g, w / 2 - 6, top + 20, 12, 16, INK); box(g, w / 2 - 5, top + 21, 10, 14, hour('#F8FAFC')); box(g, w / 2 - 2, top + 18, 4, 3, hour('#A1A1AA')); for (let k = 0; k < 3; k++) box(g, w / 2 - 3, top + 25 + k * 3, 6, 1, hour('#64748B'));
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// THE GLOP PITS

/** The glop drums: stacked steel drums (two high), banded in steps, ribbed, GLOP stenciled, a hazard diamond, slime
 *  run down them; the top drum's lid going back (lit: stand on it). */
const drums = (c: Ctx, v: View) => {
  for (const [a, b, h] of DRUMS) {
    const xa = X(a), xb = X(b), w = xb - xa;
    if (!onV(v, xa - 20, xb + 20)) continue;
    const Gd = NR('#15803D');
    drumTop(c, v.eye, xa, xb, Y(h), 0.94, Gd);
    still(c, `bk-drums-${w}-${h}`, xa, 0, -6, Y(h) - 6, w + 12, h + 12, g => {
      const G = NR('#84CC16'), Hz = NR('#FDE047');
      for (let tier = 0; tier < 2; tier++) {
        const y1 = GY - (h / 2) * tier, y0 = y1 - h / 2;
        box(g, 0, y0, w, h / 2, INK);
        shadeAcross(g, () => g.rect(2, y0 + 2, w - 4, h / 2 - 3), 2, y0 + 2, w - 4, h / 2 - 3, Gd);
        for (const ry of [y0 + 7, y1 - 11]) { box(g, 0, ry, w, 3, INK); box(g, 2, ry, w - 4, 1, Gd[5]); }
        box(g, 0, y0 + h / 4 - 1, w, 2, Gd[1]);
        signText(g, 'GLOP', w / 2 - 8, y0 + h / 4 + 4, { sx: 1, sy: 1, stencil: true, bold: true, fill: Hz[3] });
        g.save(); g.translate(w - 18, y0 + h / 4); g.rotate(Math.PI / 4); box(g, -6, -6, 12, 12, INK); box(g, -5, -5, 10, 10, Hz[3]); box(g, -1, -4, 2, 5, INK); box(g, -1, 2, 2, 2, INK); g.restore();
        const sx = w * 0.3 + tier * 22, len = 10 + tier * 8;
        box(g, sx - 1, y0 + 1, 7, len + 2, INK); box(g, sx, y0 + 1, 5, len, G[3]); box(g, sx, y0 + 1, 1, len - 2, G[5]); g.fillStyle = INK; g.beginPath(); g.arc(sx + 2.5, y0 + 1 + len, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = G[2]; g.beginPath(); g.arc(sx + 2.5, y0 + len, 3, 0, Math.PI * 2); g.fill();
      }
      box(g, -2, Y(h) - 2, w + 4, 6, INK); box(g, 0, Y(h), w, 3, Gd[4]); box(g, 0, Y(h), w, 2, LIP[2]); box(g, 4, Y(h), w * 0.5, 1, LIP[3]);
    });
  }
};
/** Slime: dark green with lighter swirls, a tile. */
const slime = (c: Ctx) => tilePattern(c, `ct-bk-slime-${timeOfDay().key}`, 96, 32, g => {
  const S = ['#1E5A08', '#2F7A0C', '#4D9F10', '#6CC41A', '#A3E635'].map(cc => hour(cc));
  box(g, 0, 0, 96, 32, S[1]);
  for (let k = 0; k < 6; k++) { const x = (k * 37) % 96, y = (k * 13) % 32; for (const ox of [0, -96, 96]) for (const oy of [0, -32, 32]) { g.strokeStyle = S[3]; g.lineWidth = 2; g.beginPath(); g.arc(x + ox, y + oy, 6 + (k % 3) * 2, 0.3, Math.PI * 1.4); g.stroke(); g.strokeStyle = S[2]; g.lineWidth = 1; g.beginPath(); g.arc(x + ox + 1, y + oy + 1, 3 + (k % 2) * 2, 0.6, Math.PI * 1.7); g.stroke(); } }
  for (let k = 0; k < 14; k++) box(g, (k * 23) % 96, (k * 11) % 32, 2, 1, S[4]);
  checker(g, 0, 0, 96, 32, S[0], 0, 4);
});
/** The pits' far halves: the slime going back to the railed rim, the hazard-striped banks along their sides. */
const pitBacks = (c: Ctx, v: View, f: number) => {
  for (const [pa, pb] of PITS) {
    const a = X(pa), b = X(pb);
    if (!onV(v, a - 40, b + 40)) continue;
    const rows = 4;
    for (let i = 0; i < rows; i++) {
      const d0 = PIT_D + ((1 - PIT_D) * i) / rows, d1 = PIT_D + ((1 - PIT_D) * (i + 1)) / rows;
      const pts: [number, number][] = [at(v.eye, a, GY + 4, d0), at(v.eye, b, GY + 4, d0), at(v.eye, b, GY + 4, d1), at(v.eye, a, GY + 4, d1)];
      c.save(); c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      c.save(); c.translate(-Math.round((f * 0.15 * (i + 1)) % 96), 0); c.fillStyle = slime(c); c.fillRect(Math.min(pts[0][0], pts[3][0]) - 100, pts[0][1] - 12, Math.max(pts[1][0], pts[2][0]) - Math.min(pts[0][0], pts[3][0]) + 200, pts[3][1] - pts[0][1] + 24); c.restore();
      c.fillStyle = `rgba(20,40,10,${0.32 - i * 0.07})`; c.fill();
      c.restore();
    }
    // (bubbles coming up in the far half, popping)
    for (let k = 0; k < 6; k++) { const bx = a + 40 + ((k * 151) % Math.max(1, b - a - 80)), t = (f + k * 41) % 120, d = PIT_D + (1 - PIT_D) * hash(k * 2.7); if (t > 40) continue; const [px, py] = at(v.eye, bx, GY + 6, d); c.strokeStyle = hour('#D9F99D'); c.lineWidth = 1; c.beginPath(); c.arc(px, py - 1, 1 + t * 0.12, Math.PI, 0); c.stroke(); }
    // (the rim at the back: a concrete lip, hazard-striped, a pipe rail on posts, NO LIFEGUARD hung off it)
    const [ra, ry] = at(v.eye, a, GY, PIT_D), [rb] = at(v.eye, b, GY, PIT_D), Y2 = DR('#FDE047'), Cc = DR('#A8A29E');
    box(c, ra, ry - 2, rb - ra, 8, INK); box(c, ra, ry - 1, rb - ra, 6, Cc[3]); box(c, ra, ry - 1, rb - ra, 1, Cc[5]);
    for (let x = ra; x < rb; x += 16) box(c, x, ry + 2, Math.min(8, rb - x), 3, Y2[3]);
    const rh = 34 * PIT_D;
    for (let x = ra + 10; x < rb; x += 70) postR(c, x, ry - rh, ry, 3, DR('#A1A1AA'));
    box(c, ra, ry - rh, rb - ra, 3, INK); box(c, ra, ry - rh, rb - ra, 1, DR('#D4D4D8')[3]);
    box(c, ra, ry - rh * 0.5, rb - ra, 2, DR('#A1A1AA')[2]);
    stillAt(c, v, PIT_D, `bk-lifeguard-${pa}`, (a + b) / 2, GY - 34, -40, -2, 80, 26, g => {
      box(g, -30, 2, 60, 20, INK); box(g, -29, 3, 58, 18, DR('#DC2626')[3]); box(g, -29, 3, 58, 2, DR('#DC2626')[5]);
      signText(g, 'NO LIFEGUARD', 0, 12, { sx: 1, sy: 1, fill: dimmed('#FFFFFF'), gap: 0, space: 2 }); signText(g, 'EVER', 0, 20, { sx: 1, sy: 1, fill: dimmed('#FDE047'), gap: 0 });
      g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(-24, 2); g.lineTo(-20, -2); g.moveTo(24, 2); g.lineTo(20, -2); g.stroke();
    });
    // (the banks along its sides, going back: hazard stripes)
    for (const [x, s] of [[a, 1], [b, -1]] as [number, number][]) {
      const [nx, ny] = at(v.eye, x, GY, 1), [fx, fy] = at(v.eye, x, GY, PIT_D);
      polyF(c, [[nx - s * 2, ny + 1], [nx + s * 9, ny + 1], [fx + s * 8, fy], [fx - s * 2, fy]], INK);
      polyF(c, [[nx, ny], [nx + s * 7, ny], [fx + s * 6, fy], [fx, fy]], hour('#1F2937'));
      for (let k = 0; k < 4; k++) { const u0 = k / 4, u1 = (k + 0.5) / 4; polyF(c, [[nx + (fx - nx) * u0, ny + (fy - ny) * u0], [nx + (fx - nx) * u0 + s * 7, ny + (fy - ny) * u0], [nx + (fx - nx) * u1 + s * 7, ny + (fy - ny) * u1], [nx + (fx - nx) * u1, ny + (fy - ny) * u1]], hour('#FDE047')); }
    }
  }
};
/** Glop heaped round the feet of the towers that stand in a pit (and the slime ringing out from them). */
export const drawGlopHeaps = (c: Ctx, state: GameState) => {
  const f = state.frame, G = NR('#65D11B');
  for (const i of IN_PIT) {
    const t = TOWERS[i]; if (!t || !onScreen(state, t.x - 60, t.x + 60)) continue;
    const ring = ((f + i * 30) % 90) / 90;
    c.strokeStyle = `rgba(217,249,157,${0.5 * (1 - ring)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(t.x, GY + 6, 24 + ring * 26, 4 + ring * 3, 0, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 9; k++) { const a = Math.PI + (k / 8) * Math.PI; eggR(c, t.x + Math.cos(a) * (22 - (k % 2) * 6), GY + 6 + Math.sin(a) * 6 - (k % 2) * 4, 9 - (k % 3), 5, G); }
    box(c, t.x - 6, GY - 4, 3, 7, G[3]); box(c, t.x + 8, GY - 2, 3, 5, G[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// IN LOVING MEMORY

/** The memorial: the faded family mural peeling off the cinder-block wall behind; the granite stone and its bronze
 *  plaque (a sloped top: not to stand on), dead flowers in a pot, a burnt-out candle, a deflated balloon on its ribbon,
 *  the crushed beer can somebody left on it; a bench with its own little plaque; a pigeon. Quiet. */
const memorial = (c: Ctx, v: View) => {
  const [wa, wb] = MEMORIAL.wall, xa = X(wa), w = X(wb) - xa, top = Y(260), Cb = DR('#D6CFC0');
  sideBack(c, v.eye, xa, -1, top - 8, GY, 1, SET_D, Cb, 3);
  sideBack(c, v.eye, xa + w, 1, top - 8, GY, 1, SET_D, Cb, 3);
  still(c, 'bk-mural', xa, 0, -8, top - 14, w + 16, GY - top + 16, g => {
    const ink = dimmed(INK), paper = '#D6CFC0';
    box(g, -2, top - 10, w + 4, GY - top + 10, ink); box(g, 0, top - 8, w, GY - top + 8, Cb[3]);
    for (let y = top - 6; y < GY; y += 16) for (let x = (Math.floor((y - top) / 16) % 2) * 22; x < w; x += 44) { box(g, x, y, 43, 1, Cb[2]); box(g, x + 43, y - 15, 1, 15, Cb[2]); }
    box(g, -6, top - 14, w + 12, 8, ink); box(g, -4, top - 12, w + 8, 4, Cb[2]); box(g, -4, top - 12, w + 8, 1, Cb[4]);
    // (the mural: sky, a sunburst, the family on the couch, AMERICA'S NEW FAVORITE FAMILY! across the top; faded hard)
    g.save(); g.beginPath(); g.rect(10, top + 10, w - 20, GY - top - 40); g.clip();
    const Sk = ['#7DD3FC', '#93DCFC', '#A8E4FC', '#C0ECFC'];
    for (let i = 0; i < 4; i++) box(g, 10, top + 10 + i * 50, w - 20, 52, dimmed(mix(Sk[i], paper, 0.55)));
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; g.fillStyle = dimmed(mix(k % 2 ? '#BAE6FD' : '#E0F2FE', paper, 0.6)); g.beginPath(); g.moveTo(w / 2 - 20, GY - 120); g.lineTo(w / 2 - 20 + Math.cos(a) * 400, GY - 120 + Math.sin(a) * 400); g.lineTo(w / 2 - 20 + Math.cos(a + 0.22) * 400, GY - 120 + Math.sin(a + 0.22) * 400); g.closePath(); g.fill(); }
    dadArt(g, w / 2 - 20, GY - 34, 1.65, 0.62, '#C9C2B2', false, true);
    g.restore();
    signText(g, "AMERICA'S NEW FAVORITE FAMILY!", w / 2, top + 30, { sx: 1, sy: 2, bold: true, fill: dimmed(mix('#FDE047', paper, 0.5)), ink: dimmed(mix(INK, paper, 0.4)) });
    // (the peeling: patches of paint gone to the bare block, curling flakes at their edges; water streaks down it)
    for (let k = 0; k < 11; k++) {
      const px = 14 + hash(k * 3.1) * (w - 40), py = top + 14 + hash(k * 7.7) * (GY - top - 60), rx = 8 + hash(k) * 16, ry = 5 + hash(k + 2) * 9;
      g.fillStyle = Cb[3]; g.beginPath(); g.ellipse(px, py, rx, ry, hash(k + 4), 0, Math.PI * 2); g.fill();
      for (let yy = py - ry; yy < py + ry; yy += 8) box(g, px - rx, yy, rx * 2, 1, Cb[2]);
      box(g, px - rx, py - 1, 3, 3, dimmed('#F5F0E1')); box(g, px + rx - 3, py + ry * 0.4, 3, 2, dimmed('#F5F0E1'));
    }
    for (let k = 0; k < 8; k++) { const sx = 20 + k * (w - 40) / 7 + hash(k * 9) * 20; box(g, sx, top + 4, 2, 40 + hash(k) * 80, 'rgba(90,80,60,0.18)'); }
    box(g, 0, GY - 30, w, 2, ink); box(g, 0, GY - 28, w, 28, Cb[2]); for (let x = 0; x < w; x += 44) box(g, x, GY - 28, 1, 28, Cb[1]);
    // (a weed up through the crack at its foot)
    const Gr = DR('#4A8A3A'); for (const wx of [60, w - 90]) { g.strokeStyle = Gr[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, GY); g.quadraticCurveTo(wx - 6, GY - 14, wx - 2, GY - 22); g.moveTo(wx, GY); g.quadraticCurveTo(wx + 8, GY - 10, wx + 10, GY - 16); g.stroke(); }
  });
  // (the bench: behind the path (dimmed), slatted, its little brass plaque)
  const bx = X(MEMORIAL.bench);
  still(c, 'bk-mem-bench', bx, GY, -62, -66, 124, 70, g => {
    const Wd = DR('#7C2D12'), ink = dimmed(INK), Ir = DR('#3F3F46');
    for (const lx of [-50, 46]) { box(g, lx - 1, -60, 6, 60, ink); box(g, lx, -59, 4, 59, Ir[3]); box(g, lx, -59, 1, 59, Ir[5]); }
    for (const sy of [-58, -46, -34]) { box(g, -57, sy - 1, 114, 8, ink); box(g, -56, sy, 112, 6, Wd[3]); box(g, -56, sy, 112, 1, Wd[5]); box(g, -56, sy + 5, 112, 1, Wd[1]); for (let k = -50; k < 56; k += 18) box(g, k, sy + 2, 6, 1, Wd[2]); }
    box(g, -14, -45, 28, 5, DR('#D09A30')[3]); box(g, -14, -45, 28, 1, DR('#D09A30')[5]);
  });
  // (the stone and its plaque: a sloped granite block (its sides going back), a bronze plate in steps)
  const px = X(MEMORIAL.plaque), Gn = rampH(ramp6('#6B7280'));
  sideBack(c, v.eye, px - 129, -1, Y(93), GY, 1, 0.94, Gn, 2);
  sideBack(c, v.eye, px + 129, 1, Y(109), GY, 1, 0.94, Gn, 2);
  still(c, 'bk-plaque', px, 0, -140, Y(122), 280, 126, g => {
    g.fillStyle = INK; g.beginPath(); g.moveTo(-132, GY); g.lineTo(-128, Y(96)); g.lineTo(128, Y(112)); g.lineTo(132, GY); g.closePath(); g.fill();
    g.fillStyle = Gn[3]; g.beginPath(); g.moveTo(-129, GY); g.lineTo(-125, Y(93)); g.lineTo(125, Y(109)); g.lineTo(129, GY); g.closePath(); g.fill();
    g.fillStyle = Gn[4]; g.beginPath(); g.moveTo(-129, GY); g.lineTo(-125, Y(93)); g.lineTo(-110, Y(94)); g.lineTo(-114, GY); g.closePath(); g.fill();
    g.fillStyle = Gn[2]; g.fillRect(60, Y(102), 66, 102); checker(g, 58, Y(102), 2, 102, Gn[2], 0, 1);
    for (let k = 0; k < 40; k++) box(g, -124 + hash(k * 2.3) * 248, Y(90) + hash(k * 5.7) * 86, 1, 1, k % 2 ? Gn[5] : Gn[1]);
    g.strokeStyle = Gn[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(-125, Y(93)); g.lineTo(125, Y(109)); g.stroke();
    const Br = rampH(BRASS);
    g.fillStyle = INK; g.fillRect(-120, Y(100) + 4, 240, 92);
    bandsDown(g, () => g.rect(-118, Y(100) + 6, 236, 88), -118, Y(100) + 6, 236, 88, [Br[3], Br[2], Br[2], Br[2], Br[1]]);
    box(g, -118, Y(100) + 6, 236, 2, Br[4]); box(g, -118, Y(100) + 6, 2, 88, Br[4]); box(g, 116, Y(100) + 6, 2, 88, Br[0]); box(g, -118, Y(100) + 92, 236, 2, Br[0]);
    for (const [sx, sy] of [[-114, 10], [112, 10], [-114, 88], [112, 88]]) { box(g, sx, Y(100) + sy, 3, 3, Br[5]); box(g, sx + 1, Y(100) + sy + 1, 2, 2, Br[1]); }
    g.fillStyle = 'rgba(40,120,90,0.25)'; g.fillRect(-118, Y(100) + 80, 60, 14); g.fillRect(70, Y(100) + 70, 40, 24);
    const brass = (t: string, y: number, big = false) => signText(g, t, 0, Y(100) + y, { sx: 1, sy: big ? 2 : 1, bold: big, fill: hour('#FEF3C7'), shadow: hour('#713F12'), drop: 1, gap: big ? 1 : 0, space: 2 });
    brass('IN LOVING MEMORY', 22, true);
    brass('THE VOICES OF DAD MAN', 33);
    brass('MARLENE KOVACS, MOM, 1949-1996', 46);
    brass('DONNA PRUITT, THE BOY, 1957-1998', 56);
    brass('SHERRI BLAINE, SIS, 1961-1999', 66);
    brass('HAL GUNDERSON, GRAMPS, 1919-1996', 76);
    brass("THEY'LL ALWAYS BE FAMILY.", 89);
  });
  // (at its foot: dead flowers in a pot, a burnt-out candle in a jar, a deflated balloon on its ribbon; the beer can on
  // the stone; a pigeon on its high end)
  still(c, 'bk-mem-litter', px, GY, -190, -130, 380, 134, g => {
    const fx = -150, Tc = rampH(ramp6('#9A3412')), Dd = hour('#57534E');
    box(g, fx - 13, -22, 26, 22, INK); shadeAcross(g, () => g.rect(fx - 11, -20, 22, 20), fx - 11, -20, 22, 20, Tc); box(g, fx - 14, -24, 28, 5, INK); box(g, fx - 13, -23, 26, 3, Tc[4]);
    for (let k = 0; k < 5; k++) { g.strokeStyle = Dd; g.lineWidth = 1.5; g.beginPath(); g.moveTo(fx - 6 + k * 3, -22); g.quadraticCurveTo(fx - 10 + k * 6, -44, fx - 18 + k * 9, -36 + (k % 2) * 6); g.stroke(); const hx = fx - 18 + k * 9, hy = -36 + (k % 2) * 6; g.fillStyle = hour(['#78716C', '#8A6A5A', '#6A5A4A'][k % 3]); g.beginPath(); g.ellipse(hx, hy + 2, 3, 2, 0.6, 0, Math.PI * 2); g.fill(); box(g, hx - 1, hy + 3, 2, 3, hour('#5A4A3A')); }
    box(g, fx + 14, -2, 5, 2, hour('#8A6A5A')); box(g, fx + 22, -1, 3, 1, hour('#6A5A4A'));
    // (the candle: a glass jar, the wax burnt down, a black wick)
    const cx = -110; box(g, cx - 7, -16, 14, 16, INK); box(g, cx - 6, -15, 12, 15, 'rgba(200,220,230,0.5)'); box(g, cx - 5, -6, 10, 6, hour('#F8F0E0')); box(g, cx, -9, 1, 3, INK); box(g, cx - 5, -15, 2, 15, 'rgba(255,255,255,0.4)');
    // (the balloon: a silver star gone soft, lying on its ribbon)
    g.fillStyle = INK; g.beginPath(); g.ellipse(-86, -4, 13, 5, -0.2, 0, Math.PI * 2); g.fill(); g.fillStyle = hour('#C8C8D4'); g.beginPath(); g.ellipse(-86, -5, 11, 3.5, -0.2, 0, Math.PI * 2); g.fill(); box(g, -92, -7, 6, 1, hour('#F4F4F8'));
    g.strokeStyle = hour('#DC2626'); g.lineWidth = 1; g.beginPath(); g.moveTo(-75, -4); g.quadraticCurveTo(-60, -2, -56, -8); g.quadraticCurveTo(-52, -14, -46, -4); g.stroke();
    // (the crushed beer can on the stone's high end; the pigeon)
    g.save(); g.translate(96, Y(108) - GY); g.rotate(-0.06);
    box(g, -6, -10, 12, 10, INK); box(g, -5, -9, 10, 8, hour('#DC2626')); box(g, -5, -9, 10, 2, hour('#D4D4D8')); box(g, -2, -6, 3, 4, hour('#FDE047')); box(g, -5, -5, 3, 1, hour('#7F1D1D')); polyF(g, [[3, -9], [5, -6], [3, -3]], hour('#991B1B'));
    g.restore();
    const pgx = 116, pgy = Y(110) - GY, Pg = rampH(ramp6('#8A8AA0'));
    eggR(g, pgx, pgy - 6, 8, 5, Pg); ballR(g, pgx - 7, pgy - 11, 3.5, Pg); box(g, pgx - 12, pgy - 11, 2, 1, hour('#F59E0B')); box(g, pgx - 8, pgy - 12, 1, 1, INK); box(g, pgx - 9, pgy - 9, 3, 2, hour('#5AA0A0'));
    polyF(g, [[pgx + 6, pgy - 8], [pgx + 13, pgy - 10], [pgx + 12, pgy - 5]], Pg[1]); box(g, pgx - 2, pgy - 2, 1, 2, hour('#E06A6A')); box(g, pgx + 2, pgy - 2, 1, 2, hour('#E06A6A'));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// GIGGLES' plaza, DRAKE's hangar, RAD RAT's halfpipe, the billboard

/** The whirl's plaza: Giggles' ticket booth (its sides going back, a striped tent roof, the window, COURTESY BAGS
 *  dispensed), the pennants strung between two poles across the plaza. */
const whirlPlaza = (c: Ctx, v: View) => {
  const bx = X(7140), Or = DR('#EA580C');
  sideBack(c, v.eye, bx - 62, -1, Y(228), GY, 1, SET_D, Or, 3);
  sideBack(c, v.eye, bx + 62, 1, Y(228), GY, 1, SET_D, Or, 3);
  still(c, 'bk-booth', bx, 0, -72, Y(270), 144, 274, g => {
    const ink = dimmed(INK), Pu = DR('#9333EA'), Wt = DR('#F8FAFC');
    box(g, -64, Y(230), 128, 230, ink); shadeAcross(g, () => g.rect(-62, Y(228), 124, 228), -62, Y(228), 124, 228, Or);
    for (let y = Y(228) + 14; y < GY; y += 24) box(g, -62, y, 124, 2, Or[1]);
    box(g, -42, Y(214), 84, 38, ink); glassPanel(g, -40, Y(212), 80, 34); box(g, -46, Y(176), 92, 6, ink); box(g, -44, Y(175), 88, 4, Or[4]);
    signText(g, 'TICKETS', 0, Y(218), { sx: 1, sy: 1, bold: true, fill: dimmed('#FFFFFF'), ink });
    for (let k = 0; k < 6; k++) { const R = k % 2 ? Wt : Pu; polyF(g, [[-66 + k * 22, Y(230)], [-55 + k * 22, Y(262)], [-44 + k * 22, Y(230)]], ink); polyF(g, [[-64 + k * 22, Y(231)], [-55 + k * 22, Y(258)], [-46 + k * 22, Y(231)]], R[3]); polyF(g, [[-64 + k * 22, Y(231)], [-57 + k * 22, Y(252)], [-55 + k * 22, Y(231)]], R[4]); }
    ballR(g, -55 + 2 * 22, Y(264), 4, DR('#FDE047'));
    // (the bag dispenser on its side: COURTESY BAGS)
    box(g, -36, Y(150), 40, 46, ink); box(g, -35, Y(149), 38, 44, Wt[3]); box(g, -35, Y(149), 4, 44, Wt[5]);
    signText(g, 'COURTESY', -16, Y(140), { sx: 1, sy: 1, fill: dimmed('#16A34A'), gap: 0 }); signText(g, 'BAGS', -16, Y(130), { sx: 1, sy: 1, fill: dimmed('#16A34A'), gap: 0 });
    for (let k = 0; k < 3; k++) box(g, -30 + k * 9, Y(124), 7, 16, dimmed('#E7DCC4'));
    signText(g, 'RIDE AT YOUR OWN RISK', 0, GY - 14, { sx: 1, sy: 1, fill: dimmed('#FDE047'), gap: 0, space: 2 });
  });
  const ya = X(WHIRL.a) + 40, yb = X(WHIRL.b) - 40;
  for (const px of [ya, yb]) postR(c, px, Y(380), GY, 6, DR('#3F3F46'));
  c.strokeStyle = dimmed(INK); c.lineWidth = 1.5; c.beginPath(); c.moveTo(ya, Y(370)); c.quadraticCurveTo((ya + yb) / 2, Y(330), yb, Y(370)); c.stroke();
  for (let k = 0; k < 22; k++) { const t = (k + 0.5) / 22, fx = ya + (yb - ya) * t, fy = Y(370) + 80 * t * (1 - t); const R = DR(['#F472B6', '#FDE047', '#22D3EE', '#A3E635'][k % 4]); polyF(c, [[fx - 7, fy - 1], [fx + 7, fy - 1], [fx, fy + 13]], dimmed(INK)); polyF(c, [[fx - 5, fy], [fx + 5, fy], [fx, fy + 10]], R[3]); polyF(c, [[fx - 5, fy], [fx - 1, fy], [fx, fy + 6]], R[4]); }
  for (const px of [ya, yb]) ballR(c, px, Y(384), 6, DR('#FDE047'));
};
/** The pod's hangar: a quonset (its ribs, its curved sides going back), the big door open, MOTION MADNESS across it and
 *  the duck detective painted big (fedora, trench coat, magnifying glass), drums of hydraulic oil by it. */
const hangar = (c: Ctx, v: View) => {
  const cx = X((POD.a + POD.b) / 2), w = 640, h = 280, Al = DR('#94A3B8');
  const bow = (t: number) => -(w / 2) * (1 - Math.sqrt(Math.max(0, 1 - t * t)));
  sideBack(c, v.eye, cx - w / 2, -1, GY - h, GY, 1, SET_D, Al, 3, bow);
  sideBack(c, v.eye, cx + w / 2, 1, GY - h, GY, 1, SET_D, Al, 3, bow);
  still(c, 'bk-hangar', cx, 0, -w / 2 - 70, GY - h - 8, w + 140, h + 12, g => {
    const ink = dimmed(INK), Te = DR('#0E7490');
    g.fillStyle = ink; g.beginPath(); g.ellipse(0, GY, w / 2 + 3, h + 3, 0, Math.PI, 0); g.fill();
    g.save(); g.beginPath(); g.ellipse(0, GY, w / 2, h, 0, Math.PI, 0); g.clip();
    for (let i = 0; i < 6; i++) { const x0 = -w / 2 + (w * i) / 6; box(g, x0, GY - h, w / 6 + 1, h, Al[[4, 3, 3, 3, 2, 1][i]]); if (i) checker(g, x0 - 1, GY - h, 2, h, Al[[4, 3, 3, 3, 2, 1][i]], 0, 1); }
    for (let k = -w / 2 + 30; k < w / 2; k += 40) { g.strokeStyle = Al[1]; g.lineWidth = 3; g.beginPath(); g.moveTo(k, GY); g.lineTo(k * 0.98, GY - Math.sqrt(Math.max(0, 1 - (k / (w / 2)) ** 2)) * h); g.stroke(); g.strokeStyle = Al[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(k - 2, GY); g.lineTo(k * 0.98 - 2, GY - Math.sqrt(Math.max(0, 1 - (k / (w / 2)) ** 2)) * h); g.stroke(); }
    // (the open door: dark inside, the pod's empty bay, a hose reel; the track of light on the floor)
    box(g, -110, GY - 150, 220, 150, ink); box(g, -106, GY - 146, 212, 146, dimmed('#0F172A'));
    for (let k = 0; k < 4; k++) box(g, -100 + k * 60, GY - 140, 40, 4, dimmed(lit() ? '#FDE68A' : '#334155'));
    box(g, -80, GY - 40, 160, 6, dimmed('#1E293B')); for (let k = 0; k < 6; k++) box(g, -76 + k * 28, GY - 36, 14, 36, dimmed('#1E293B'));
    for (let k = 0; k < 220; k += 20) { box(g, -110 + k, GY - 6, 10, 6, DR('#FDE047')[3]); box(g, -100 + k, GY - 6, 10, 6, DR('#1F2937')[3]); }
    // (the band across: MOTION MADNESS)
    box(g, -w / 2 + 30, GY - 196, w - 60, 40, ink); bandsDown(g, () => g.rect(-w / 2 + 32, GY - 194, w - 64, 36), -w / 2 + 32, GY - 194, w - 64, 36, [Te[4], Te[3], Te[3], Te[2]]);
    signText(g, 'MOTION MADNESS', 0, GY - 166, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink, shadow: dimmed('#083344'), drop: 2 });
    g.restore();
    // (the duck detective, big, painted on the left of the arch)
    const dx = -200, dy = GY - 222, Gd = DR('#22C55E'), Bk = DR('#F59E0B'), Hat = DR('#57534E'), Tr = DR('#A16207');
    box(g, dx - 26, dy + 24, 52, 70, ink); shadeAcross(g, () => g.rect(dx - 24, dy + 26, 48, 66), dx - 24, dy + 26, 48, 66, Tr);
    box(g, dx - 2, dy + 26, 4, 66, Tr[1]); for (const by of [dy + 40, dy + 58]) ballR(g, dx + 8, by, 2.5, DR('#3F3F46'));
    ballR(g, dx, dy, 28, Gd);
    eggR(g, dx + 30, dy + 8, 20, 8, Bk); box(g, dx + 14, dy + 8, 34, 2, Bk[1]);
    g.fillStyle = ink; g.beginPath(); g.ellipse(dx + 8, dy - 6, 7, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = dimmed('#FFFFFF'); g.beginPath(); g.ellipse(dx + 8, dy - 6, 5.5, 7.5, 0, 0, Math.PI * 2); g.fill(); box(g, dx + 9, dy - 6, 3, 4, ink);
    box(g, dx - 2, dy - 15, 16, 3, ink);
    box(g, dx - 36, dy - 30, 72, 10, ink); box(g, dx - 34, dy - 28, 68, 6, Hat[3]); box(g, dx - 20, dy - 52, 40, 24, ink); box(g, dx - 18, dy - 50, 36, 22, Hat[3]); box(g, dx - 18, dy - 50, 6, 22, Hat[4]); box(g, dx - 18, dy - 36, 36, 5, dimmed('#1F2937'));
    g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.arc(dx + 66, dy + 10, 16, 0, Math.PI * 2); g.moveTo(dx + 54, dy + 22); g.lineTo(dx + 38, dy + 40); g.stroke();
    g.strokeStyle = DR('#D09A30')[3]; g.lineWidth = 3; g.beginPath(); g.arc(dx + 66, dy + 10, 16, 0, Math.PI * 2); g.stroke(); g.fillStyle = 'rgba(200,230,255,0.35)'; g.beginPath(); g.arc(dx + 66, dy + 10, 14, 0, Math.PI * 2); g.fill();
    // (hydraulic oil drums by it)
    const Ol = DR('#1D4ED8');
    for (const [ox, oy] of [[w / 2 + 14, 0], [w / 2 + 44, 0], [w / 2 + 29, -40]] as const) { box(g, ox - 14, GY - 40 + oy, 28, 40, ink); shadeAcross(g, () => g.rect(ox - 12, GY - 38 + oy, 24, 37), ox - 12, GY - 38 + oy, 24, 37, Ol); box(g, ox - 12, GY - 28 + oy, 24, 2, Ol[1]); box(g, ox - 12, GY - 14 + oy, 24, 2, Ol[1]); }
    signText(g, 'HYD. OIL', w / 2 + 29, GY - 18, { sx: 1, sy: 1, fill: dimmed('#FFFFFF'), gap: 0 });
  });
};
/** The halfpipe: its curve going back to the eye (in steps by slope: the face turned up toward the light lit), the
 *  back wall tagged, the near cut face, steel coping at both lips going back; RAD RAT's banner on its scaffold behind. */
const halfpipe = (c: Ctx, v: View) => {
  const a = X(PIPE.a), b = X(PIPE.b), Cc = NR('#C7C2B8');
  // (the banner on its scaffold, behind, dimmed)
  still(c, 'bk-pipe-banner', a, 0, 20, Y(306), b - a - 40, 306 + PIPE.depth, g => {
    const ink = dimmed(INK), Pu = DR('#7C3AED'), Sc = DR('#71717A'), w = b - a;
    for (const px of [40, w - 40]) { postR(g, px, Y(300), GY, 6, Sc); for (let y = Y(290); y < GY - 10; y += 30) { g.strokeStyle = Sc[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 3, y); g.lineTo(px + (px < w / 2 ? 30 : -30), y + 30); g.stroke(); } }
    box(g, 30, Y(300), w - 60, 52, ink); bandsDown(g, () => g.rect(32, Y(298), w - 64, 48), 32, Y(298), w - 64, 48, [Pu[4], Pu[3], Pu[3], Pu[2], Pu[1]]);
    for (let k = 0; k < 4; k++) { const fx = 40 + k * (w - 100) / 3; polyF(g, [[fx, Y(250)], [fx + 10, Y(262)], [fx + 20, Y(250)]], DR(k % 2 ? '#F97316' : '#FDE047')[3]); }
    signText(g, "RAD RAT'S TUBULAR HALFPIPE", w / 2, Y(268), { sx: 1, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#A3E635')], ink, shadow: dimmed('#2E1065'), drop: 1 });
  });
  // (the back wall: from the surface's far edge up to the street at PIPE_D, concrete, tagged)
  const pts: [number, number][] = [];
  for (const [p, d1] of PIPE_RUNS) pts.push([X(p), d1]);
  pts.push([X(PIPE_RUNS[PIPE_RUNS.length - 1][2]), PIPE_RUNS[PIPE_RUNS.length - 1][3]]);
  polyF(c, [...pts.map(([x, d]) => at(v.eye, x, GY + d, PIPE_D)), at(v.eye, b, GY, PIPE_D), at(v.eye, a, GY, PIPE_D)], Cc[1]);
  const [wl, wy] = at(v.eye, a + PIPE.ramp, GY + PIPE.depth, PIPE_D), [wr] = at(v.eye, b - PIPE.ramp, GY, PIPE_D), [, wt] = at(v.eye, a, GY, PIPE_D);
  c.save(); c.beginPath(); c.rect(wl, wt, wr - wl, wy - wt); c.clip();
  for (let k = 0; k < 6; k++) { const jx = wl + k * (wr - wl) / 6; box(c, jx, wt, 1, wy - wt, Cc[0]); box(c, jx + 1, wt, 1, wy - wt, Cc[3]); for (let y = wt + 4; y < wt + 30 + hash(k) * 40; y += 2) box(c, jx + 6 + hash(k * 3) * 30, y, 2, 2, 'rgba(40,34,50,0.18)'); }
  for (let k = 0; k < 50; k++) box(c, wl + hash(k * 1.9) * (wr - wl), wt + hash(k * 2.7) * (wy - wt), 1, 1, k % 2 ? Cc[0] : Cc[3]);
  signText(c, 'SK8', wl + 40, wt + 22, { sx: 1, sy: 1, bold: true, fill: hour('#A3E635'), ink: hour('#1F2937') });
  signText(c, 'RAD', (wl + wr) / 2 - 50, wy - 20, { sx: 2, sy: 2, bold: true, slant: 1, fill: hour('#EC4899'), ink: hour('#1F2937'), drip: { col: '#BE185D', rate: 0.5, len: 6 }, seed: 3 });
  c.strokeStyle = hour('#1F2937'); c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo((wl + wr) / 2 + 10, wy - 26); c.bezierCurveTo((wl + wr) / 2 + 40, wy - 46, (wl + wr) / 2 + 60, wy - 16, (wl + wr) / 2 + 90, wy - 36); c.stroke();
  c.strokeStyle = hour('#22D3EE'); c.lineWidth = 3; c.stroke();
  c.restore();
  // (the surface: each run a strip from the play plane back to PIPE_D, lit by its slope)
  for (const [p, d1, q, d2] of PIPE_RUNS) {
    const s = (d2 - d1) / Math.max(1, q - p), col = s > 0.3 ? Cc[2] : s < -0.3 ? Cc[4] : s > 0.05 ? Cc[3] : s < -0.05 ? Cc[4] : Cc[3];
    polyF(c, [at(v.eye, X(p), GY + d1, 1), at(v.eye, X(q), GY + d2, 1), at(v.eye, X(q), GY + d2, PIPE_D), at(v.eye, X(p), GY + d1, PIPE_D)], col);
  }
  // (the surface's texture: a joint along each run's edge, worn shiny where the wheels go, scuffs, a crack patched)
  for (const [p, d1] of PIPE_RUNS) { const [x0, y0] = at(v.eye, X(p), GY + d1, 1), [x1, y1] = at(v.eye, X(p), GY + d1, PIPE_D); c.strokeStyle = 'rgba(40,34,50,0.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  for (let k = 0; k < 70; k++) {
    const run = PIPE_RUNS[Math.floor(hash(k * 3.7) * PIPE_RUNS.length)], u = hash(k * 1.3), dd = PIPE_D + hash(k * 5.1) * (1 - PIPE_D);
    const [px, py] = at(v.eye, X(run[0] + (run[2] - run[0]) * u), GY + run[1] + (run[3] - run[1]) * u, dd);
    box(c, px, py, k % 4 ? 1 : 3, 1, k % 3 ? Cc[1] : Cc[5]);
  }
  { const [x0, y0] = at(v.eye, a + PIPE.ramp + 60, GY + PIPE.depth, 0.97), [x1, y1] = at(v.eye, b - PIPE.ramp - 60, GY + PIPE.depth, 0.97); c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  { const [cx0, cy0] = at(v.eye, a + PIPE.ramp + 200, GY + PIPE.depth, 0.9); c.strokeStyle = Cc[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 + 14, cy0 + 2); c.lineTo(cx0 + 22, cy0 - 1); c.lineTo(cx0 + 40, cy0 + 1); c.stroke(); }
  // (the flat's painted line, the skid marks, the seam between the curve and the flat)
  for (const [x, d] of [[a + PIPE.ramp, PIPE.depth], [b - PIPE.ramp, PIPE.depth]] as [number, number][]) { const [x0, y0] = at(v.eye, x, GY + d, 1), [x1, y1] = at(v.eye, x, GY + d, PIPE_D); c.strokeStyle = Cc[1]; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  c.strokeStyle = 'rgba(30,24,40,0.35)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const [x0, y0] = at(v.eye, a + PIPE.ramp + 40 + k * 120, GY + PIPE.depth, 0.98), [x1, y1] = at(v.eye, a + PIPE.ramp + 110 + k * 120, GY + PIPE.depth, 0.94); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  // (the coping: steel pipes along both lips, going back)
  for (const lx of [a, b]) {
    const [n0, n1] = at(v.eye, lx, GY + 2, 1), [f0, f1] = at(v.eye, lx, GY + 2, PIPE_D);
    c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(n0, n1); c.lineTo(f0, f1); c.stroke();
    c.strokeStyle = hour(STEEL[4]); c.lineWidth = 4; c.stroke(); c.strokeStyle = hour(STEEL[5]); c.lineWidth = 1; c.beginPath(); c.moveTo(n0, n1 - 1); c.lineTo(f0, f1 - 1); c.stroke();
  }
  // (the near half: the pipe runs on toward him, under the bent floor's rows. The floor's bend (bendFloor) makes a row y
  //  below the line k = 1 + (y - GY) * BEND times as wide about the eye: every line running toward him goes to one
  //  vanishing point. The pipe's cross-section at row t is the play plane's, scaled k about the eye and dropped to t, so
  //  each run sweeps one flat quad, its lips land exactly on the slab runs' fanned ends (no vertical cut), and it reads
  //  as a trench going away from him and toward him, not a wall cut off at the play plane. Clipped between the lips and
  //  under the play plane's profile; drawn from the run farthest from the eye in, those facing away from the eye left
  //  out (the slab past the lip hides them).)
  const ex = v.eye.x, Tn = GY + 700, kk = (t: number) => 1 + (t - GY) * BEND;
  const P = (x: number, d: number, t: number): [number, number] => { const k = kk(t); return [ex + (x - ex) * k, t + d * k]; };
  const vpY = GY - 1 / BEND;
  c.save(); c.beginPath(); c.moveTo(...P(a, 0, GY));
  for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(X(p), GY + d1); c.lineTo(X(q), GY + d2); }
  c.lineTo(...P(b, 0, GY)); c.lineTo(...P(b, 0, Tn)); c.lineTo(...P(a, 0, Tn)); c.closePath(); c.clip();
  box(c, Math.min(P(a, 0, Tn)[0], a) - 4, GY, Math.max(P(b, 0, Tn)[0], b) - Math.min(P(a, 0, Tn)[0], a) + 8, 700, Cc[1]);
  const order = PIPE_RUNS.map((r, i) => ({ r, i, far: Math.abs((X(r[0]) + X(r[2])) / 2 - ex) })).sort((m, n) => n.far - m.far);
  for (const { r: [p, d1, q, d2] } of order) {
    const x1 = X(p), y1 = GY + d1, x2 = X(q), y2 = GY + d2;
    // (facing the vanishing point? its up-normal (the air's side) toward it)
    if ((y2 - y1) * (ex - (x1 + x2) / 2) + -(x2 - x1) * (vpY - (y1 + y2) / 2) <= 0) continue;
    const sl = (d2 - d1) / Math.max(1, q - p), col = sl > 0.3 ? Cc[2] : sl < -0.3 ? Cc[4] : sl > 0.05 ? Cc[3] : sl < -0.05 ? Cc[4] : Cc[3];
    polyF(c, [P(x1, d1, GY), P(x2, d2, GY), P(x2, d2, Tn), P(x1, d1, Tn)], col);
  }
  // (its texture: the run joints running toward him; the pour seams across it, farther apart the nearer; scuffs)
  c.strokeStyle = 'rgba(40,34,50,0.2)'; c.lineWidth = 1;
  for (const [p, d1] of PIPE_RUNS) { const [x0, y0] = P(X(p), d1, GY), [x1, y1] = P(X(p), d1, Tn); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  for (const t of [GY + 30, GY + 76, GY + 140, GY + 230]) {
    c.strokeStyle = Cc[1]; c.lineWidth = 1 + (t - GY) / 120; c.beginPath(); c.moveTo(...P(a, 0, t));
    for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(...P(X(p), d1, t)); c.lineTo(...P(X(q), d2, t)); }
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(...P(a, 1.5, t + 2));
    for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(...P(X(p), d1 + 1.5, t + 2)); c.lineTo(...P(X(q), d2 + 1.5, t + 2)); }
    c.stroke();
  }
  { const [x0, y0] = P(a + PIPE.ramp + 60, PIPE.depth, GY + 20), [x1, y1] = P(b - PIPE.ramp - 60, PIPE.depth, GY + 20); c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  for (let k = 0; k < 40; k++) { const run = PIPE_RUNS[Math.floor(hash(k * 4.3) * PIPE_RUNS.length)], u = hash(k * 1.7), t = GY + hash(k * 6.1) ** 1.5 * 200, [px, py] = P(X(run[0] + (run[2] - run[0]) * u), run[1] + (run[3] - run[1]) * u, t); box(c, px, py, k % 4 ? 1 : 3, 1, k % 3 ? Cc[1] : Cc[5]); }
  c.restore();
  // (the line he walks, lit, across the play plane: standable reads standable)
  c.strokeStyle = LIP[2]; c.lineWidth = 2; c.beginPath(); c.moveTo(a, GY + 1);
  for (const [p, d1, q, d2] of PIPE_RUNS) { c.lineTo(X(p), GY + d1 + 1); c.lineTo(X(q), GY + d2 + 1); }
  c.stroke();
  // (the coping on both lips, running on toward him: steel pipe, fattening as it comes, inked, lit along its top)
  for (const lx of [a, b]) {
    const w0 = 4.5;
    polyF(c, [P(lx - w0, -2, GY), P(lx + w0, -2, GY), P(lx + w0, -2, Tn), P(lx - w0, -2, Tn)], INK);
    polyF(c, [P(lx - w0 + 1.5, -2, GY), P(lx + w0 - 1.5, -2, GY), P(lx + w0 - 1.5, -2, Tn), P(lx - w0 + 1.5, -2, Tn)], hour(STEEL[3]));
    polyF(c, [P(lx - w0 + 1.5, -2, GY), P(lx - 0.5, -2, GY), P(lx - 0.5, -2, Tn), P(lx - w0 + 1.5, -2, Tn)], hour(STEEL[5]));
    ballR(c, lx, GY, 4.5, rampH(STEEL));
  }
};
/** The DAD MAN LIVE billboard: up on lattice legs behind the path (the live show: where he's headed), its catwalk
 *  and lamps (on after dark). */
const billboard = (c: Ctx) => {
  const x = X(BILLBOARD), w = 360, h = 180, top = Y(380);
  still(c, `bk-billboard-${lit() ? 1 : 0}`, x, 0, -w / 2 - 14, top - 14, w + 28, GY - top + 16, g => {
    const ink = dimmed(INK), Pu = DR('#7C3AED'), Lg = DR('#57534E');
    for (const lx of [-w / 3, w / 3]) {
      box(g, lx - 8, top + h, 16, GY - top - h, ink); box(g, lx - 6, top + h, 4, GY - top - h, Lg[3]); box(g, lx + 2, top + h, 4, GY - top - h, Lg[3]);
      for (let y = top + h + 4; y < GY - 10; y += 16) { g.strokeStyle = Lg[2]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lx - 4, y); g.lineTo(lx + 4, y + 16); g.moveTo(lx + 4, y); g.lineTo(lx - 4, y + 16); g.stroke(); }
    }
    box(g, -w / 2 - 6, top - 6, w + 12, h + 12, ink); box(g, -w / 2 - 4, top - 4, w + 8, h + 8, Lg[2]);
    g.save(); g.beginPath(); g.rect(-w / 2, top, w, h); g.clip();
    for (let i = 0; i < 6; i++) box(g, -w / 2, top + (h * i) / 6, w, h / 6 + 1, Pu[[4, 4, 3, 3, 2, 2][i]]);
    for (let k = 0; k < 14; k++) { const a2 = (k / 14) * Math.PI * 2; g.fillStyle = k % 2 ? Pu[4] : Pu[5]; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(-90, top + h - 70); g.lineTo(-90 + Math.cos(a2) * 400, top + h - 70 + Math.sin(a2) * 400); g.lineTo(-90 + Math.cos(a2 + 0.2) * 400, top + h - 70 + Math.sin(a2 + 0.2) * 400); g.closePath(); g.fill(); g.globalAlpha = 1; }
    dadArt(g, -90, top + h - 6, 1.9, 0.18, '#7C3AED');
    g.restore();
    signText(g, 'SEE DAD MAN', 70, top + 34, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047'), dimmed('#F59E0B')], ink, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'LIVE!', 70, top + 66, { sx: 3, sy: 3, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FB7185'), dimmed('#DC2626')], ink, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'THE ORIGINAL VOICE!', 70, top + 98, { sx: 1, sy: 1, bold: true, fill: dimmed('#FFFFFF'), ink });
    signText(g, 'AS SEEN (AND HEARD) ON TV!', 70, top + 112, { sx: 1, sy: 1, fill: dimmed('#FDE047') });
    signText(g, 'THE AMPHITHEATER. SHOWS DAILY.', 70, top + 126, { sx: 1, sy: 1, fill: dimmed('#FDE047') });
    signText(g, 'THIS WAY >', 70, top + 150, { sx: 1, sy: 2, bold: true, fill: dimmed('#A3E635'), ink });
    // (the catwalk under it, its rail, the lamps reaching up over the face)
    box(g, -w / 2 - 6, top + h + 6, w + 12, 5, ink); box(g, -w / 2 - 4, top + h + 7, w + 8, 2, Lg[4]);
    for (let k = -w / 2; k <= w / 2; k += 30) box(g, k, top + h + 11, 2, 8, ink);
    for (let k = -w / 2 + 30; k < w / 2; k += 80) {
      g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(k, top + h + 6); g.quadraticCurveTo(k + 4, top + h + 20, k + 2, top + h - 6); g.stroke();
      box(g, k - 6, top + h - 12, 14, 8, ink); box(g, k - 5, top + h - 11, 12, 6, lit() ? '#FFF6D0' : Lg[4]);
      if (lit()) { g.fillStyle = 'rgba(255,240,200,0.14)'; g.beginPath(); g.moveTo(k - 5, top + h - 11); g.lineTo(k - 30, top + 10); g.lineTo(k + 34, top + 10); g.lineTo(k + 7, top + h - 11); g.closePath(); g.fill(); }
    }
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The ground

/** Skate-park slabs coming toward him: joints, cracks, gum, oil, a painted bolt now and then. A tile. */
const slabs = (c: Ctx) => tilePattern(c, `ct-bk-slabs-${timeOfDay().key}`, 128, 48, g => {
  const S = ['#8A8480', '#A8A29E', '#BCB6B0', '#CEC8C2', '#E0DAD4'].map(cc => hour(cc));
  box(g, 0, 0, 128, 48, S[2]);
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < 2; k++) {
      const x = k * 64 + (r ? 32 : 0), y = r * 24;
      for (const ox of [0, -128, 128]) {
        box(g, x + ox + 1, y + 1, 62, 22, S[(k + r) % 2 ? 2 : 3]);
        box(g, x + ox + 1, y + 1, 62, 1, S[4]); box(g, x + ox + 1, y + 1, 1, 21, S[4]);
        box(g, x + ox + 1, y + 21, 62, 2, S[1]); box(g, x + ox + 62, y + 2, 1, 21, S[1]);
        checker(g, x + ox + 2, y + 2, 60, 18, S[(k + r) % 2 ? 1 : 2], (k + r) % 2, 4);
      }
    }
  }
  g.strokeStyle = S[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(20, 4); g.lineTo(28, 12); g.lineTo(26, 19); g.moveTo(90, 28); g.lineTo(84, 36); g.lineTo(88, 44); g.stroke();
  for (const [gx, gy, col] of [[44, 10, '#F472B6'], [104, 34, '#E5E7EB'], [70, 40, '#A3E635']] as [number, number, string][]) { box(g, gx, gy, 3, 2, hour(col)); box(g, gx, gy + 2, 3, 1, hour(mix(col, INK, 0.4))); }
  g.fillStyle = 'rgba(40,30,50,0.16)'; g.beginPath(); g.ellipse(100, 12, 12, 4, 0, 0, Math.PI * 2); g.fill();
});
/** The ground runs, coming toward him, bent; the red-painted curb along the edge, lit along its top; the pits' near
 *  halves (slime) and their banks. Everything on the floor is painted flat first and bent ONCE, all together (the
 *  playtest: each run bent on its own left the flat paint standing in slivers past its fanned ends: hard vertical cuts
 *  between the slabs, the slime and the banks that jumped about as he went). Bent together, every boundary between
 *  them fans out from the one eye like the slab joints do, and nothing's left behind. */
const nearGround = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, R = state.camera.x + 840, Rd = NR('#DC2626'), f = state.frame;
  const runs: [number, number][] = [];
  for (const [ga, gb] of GROUND) {
    const a = X(ga === GROUND[0][0] ? ga - 700 : ga), b = X(gb === GROUND[GROUND.length - 1][1] ? gb + 700 : gb), s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    runs.push([s, e]);
    box(c, s, GY, e - s, 700, hour('#6A6470'));
    c.fillStyle = slabs(c); c.fillRect(s, GY + 10, e - s, 600);
    // (a painted lane line nearer, a lightning bolt painted on the slab now and then)
    for (let x = Math.floor(s / 40) * 40; x < e; x += 40) box(c, Math.max(s, x), GY + 54, Math.min(22, e - Math.max(s, x)), 3, hour('#FDE047'));
    for (let x = Math.floor(s / 520) * 520 + 200; x < e; x += 520) polyF(c, [[x, GY + 92], [x + 20, GY + 80], [x + 16, GY + 88], [x + 36, GY + 84], [x + 12, GY + 100], [x + 16, GY + 92]], hour('#22D3EE'));
  }
  // (under the halfpipe: its concrete, so nothing stray's bent in under its near half)
  { const s = Math.max(X(PIPE.a), L), e = Math.min(X(PIPE.b), R); if (e > s) box(c, s, GY, e - s, 700, NR('#C7C2B8')[1]); }
  for (const [pa, pb] of PITS) {
    const a = X(pa), b = X(pb), s = Math.max(a, L), e = Math.min(b, R);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, hour('#1E5A08'));
    c.save(); c.beginPath(); c.rect(s, GY, e - s, 700); c.clip();
    c.translate(Math.round((f * 0.25) % 96), 0); c.fillStyle = slime(c); c.fillRect(s - 96, GY + 4, e - s + 96, 600);
    c.restore();
    // (the banks: the concrete's cut edge inside each end, hazard stripes down it (bent with the floor: they fan back to
    //  the eye with it), inked where the slab meets them)
    for (const [ex, sd] of [[a, 1], [b, -1]] as [number, number][]) {
      if (ex < L - 20 || ex > R + 20) continue;
      const x0 = sd > 0 ? ex : ex - 10;
      box(c, x0, GY, 10, 700, INK);
      box(c, sd > 0 ? ex + 2 : ex - 9, GY + 1, 7, 699, hour('#1F2937'));
      for (let y = GY + 4; y < GY + 700; y += 12) box(c, sd > 0 ? ex + 2 : ex - 9, y, 7, 6, hour('#FDE047'));
      box(c, sd > 0 ? ex + 2 : ex - 9, GY + 1, 7, 1, hour('#FEF9C3'));
    }
  }
  bendFloor(c, v.eye, GY, GY, GY + 150);
  // (the curb: painted red, lit along its top, its face shaded; over the bent floor, on the line)
  for (const [s, e] of runs) {
    box(c, s, GY, e - s, 10, INK);
    box(c, s, GY + 1, e - s, 8, Rd[3]); box(c, s, GY + 6, e - s, 3, Rd[1]);
    for (let x = Math.floor(s / 48) * 48; x < e; x += 48) { if (x >= s) box(c, x, GY + 1, 1, 8, Rd[0]); if (hash(x * 0.3) > 0.6 && x + 30 < e && x + 10 > s) box(c, x + 10 + hash(x) * 20, GY + 2, 6, 3, Rd[4]); }
    box(c, s, GY, e - s, 2, LIP[2]); box(c, s, GY, e - s, 1, LIP[3]);
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawBigkidBack = (c: Ctx, state: GameState, dollTalking: boolean) => {
  const v = viewOf(state), f = state.frame;
  drawAlley(c, v);
  drawFronts(c, v);
  drawPavement(c, v);
  pitBacks(c, v, f);
  if (onV(v, X(RINK.a) - 120, X(RINK.b) + 120)) rinkBack(c, state, v);
  drawFurniture(c, v);
  // (the set pieces behind the play plane, each with its sides going back)
  if (onV(v, X(420) - 300, X(420) + 300)) gateArch(c, v, X(420), 'THE BIG-KID ZONE', 'NO LIMITS. NO MERCY.', '#F472B6', 'TOTALLY EXTREME!');
  if (onV(v, X(GATE.a) - 340, X(GATE.b) + 300)) gateArch(c, v, X((GATE.a + GATE.b) / 2) - 50, 'DAD MAN', 'THE EXTENDED UNIVERSE >', '#FDE047', 'MORE DAD MAN!');
  if (onV(v, X(640) - 80, X(640) + 80)) posterColumn(c, X(640));
  if (onV(v, X(820), X(1300))) posterFence(c, 820, 1300);
  if (onV(v, X(COUCH.barn[0]) - 120, X(COUCH.barn[1]) + 120)) garage(c, v);
  if (onV(v, X(SHACK.a) - 160, X(SHACK.b) + 60)) shack(c, v);
  if (onV(v, X(MEMORIAL.wall[0]) - 200, X(MEMORIAL.wall[1]) + 60)) memorial(c, v);
  if (onV(v, X(7140) - 100, X(WHIRL.b) + 40)) whirlPlaza(c, v);
  if (onV(v, X(POD.a) - 160, X(POD.b) + 160)) hangar(c, v);
  if (onV(v, X(BILLBOARD) - 200, X(BILLBOARD) + 200)) billboard(c);
  for (const [x, h, look] of POSTERS) if (onV(v, X(x) - 60, X(x) + 60)) poster(c, X(x), Y(h), look, true);
  nearGround(c, state, v);
  if (onV(v, X(PIPE.a) - 40, X(PIPE.b) + 40)) halfpipe(c, v);
  for (const [x, h, lines, board] of SIGNS) if (onV(v, X(x) - 200, X(x) + 200)) zoneSign(c, X(x), Y(h), lines, board);
  if (onV(v, X(NEWSSTAND[0]) - 40, X(NEWSSTAND[1]) + 40)) newsstand(c, v);
  if (onV(v, X(SHELTER[0]) - 40, X(SHELTER[1]) + 80)) shelter(c, v);
  if (onV(v, X(SHACK.bin) - 60, X(SHACK.bin) + 60)) dollBin(c, X(SHACK.bin), f, dollTalking);
  if (onV(v, X(RINK.a) - 120, X(RINK.b) + 120)) { stands(c, v); rails(c, v); }
  drums(c, v);
};

export const bigkidLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out = backLamps(v);
  for (const gx of [X(420), X((GATE.a + GATE.b) / 2) - 50]) if (gx > state.camera.x - 400 && gx < state.camera.x + 1200) out.push({ x: gx, y: Y(320), r: 220, a: 0.5, color: '#F0ABFC' });
  const bb = X(BILLBOARD); if (bb > state.camera.x - 300 && bb < state.camera.x + 1100) out.push({ x: bb, y: Y(300), r: 200, a: 0.4, color: '#FFF0C8' });
  const rk = X((RINK.a + RINK.b) / 2); if (rk > state.camera.x - 700 && rk < state.camera.x + 1500) out.push({ x: rk, y: Y(300), r: 300, a: 0.35, color: '#C4B5FD' });
  return out;
};
void GRASS;
