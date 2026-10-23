// PUNCHY & KICKY's part of the park, painted (the SNES pass). The show's look: blood red, mustard, black, bone; fat ink;
// cartoon gore for decor (splats, drips off every parapet, chalk outlines of a cat and a mouse on the path, bones,
// bandages, skull lamps). One eye over the lot (kit.ts's view):
//
//   THE FAR OFF     far.ts (cached per hour: the sky, the banner plane, the country past the berm, the rest of Cartoon
//                   Land, the water tower, the knockoff's own roofs and their giant props)
//   THE STREET      backs.ts (the show's buildings at FRONT_D with their sides going back, a business each; the alley;
//                   the path's pavers coming toward him; the furniture and the crowd)
//   THE SET PIECES  behind the path at the play plane, dimmed (scenery: none of it reads as somewhere to stand), their
//                   sides and tops going back: the gate's bone arch (the banner, the cat's and the mouse's heads at its
//                   ends, bonking each other), the merch stand and its jumbotron on its truss (the cartoon itself on a
//                   loop), PUNCHY & KICKY'S KILL-O-RAMA (a red-and-black cartoon castle: stone in steps, battlements,
//                   towers with their pennants, cat-head gargoyles, the marquee and its chasing bulbs, blood down its
//                   front, the doors dark and chained), the GENERIC-CO warehouse (corrugated steel, the roll doors, the
//                   dock, the forklift, 0 DAYS WITHOUT AN ACCIDENT), PUNCHY'S BIG TOP (its stripes shaded round, the
//                   valance, guy ropes, the HUMAN CANNONBALL poster), the blast range's scorched wall (sandbags, the
//                   bunker slit), the painted canyon (a sky cyc and three rows of plywood mesas, braces and sandbags
//                   showing, MOUSE MESA's title flat, cactus flats; the gorge's far wall and its strata down into the
//                   dark), the live show's soundstage (velour drapes, the cartoon house flat, the lighting grid and its
//                   cans, the APPLAUSE sign, the fly rail; the stage's black boards), the DAD MAN LIVE! gate
//   THE PLAY PLANE  bright and inked, what he stands on lit along its top: the path's red-painted edge and its cream
//                   pavers coming toward him (scanline-bent, chalk outlines and splats on them), the lawn, the canyon's
//                   rim rocks, the set's crate steps, the pallet rack; the skull lamps on their bone posts; the signs.

import type { GameState } from '../../../m1/game/core/state';
import type { Light } from '../../../m1/game/render/lighting';
import { timeOfDay } from '../../timeOfDay';
import { signText, signW } from '../../signLetters';
import { bendFloor } from '../../intro/art/kit';
import { tilePattern } from '../../../m1/game/render/pixelArt';
import {
  type Ctx, type View, INK, box, mix, hash, checker, hour, dimmed, lit, viewOf, at, still, stillAt, polyF, sideBack, topBack, boxSides, ballR, eggR, postR,
  bandsDown, shadeAcross, LIP as LIPR,
} from '../kit';
import { GY } from '../geometry';
import { dadArt, poster } from '../bigkid/art';
import { GROUND, CANYON, HOLES, ROCKS, SET_STEPS, RACK, KILLORAMA, MERCH, EXIT_GATE, SIGNS, FUSES, LAWN, TOWERS, X, Y } from './layout';
import { catHead, mouseHead, mallet } from './kindArt';
import { drawItchyFar } from './far';
import { drawAlley, drawFronts, drawPath, drawFurniture, backLamps, pkPosterArt, PIT_D, HOLE_D, SET_BACK_D } from './backs';
import {
  BLOOD, BONE, MUSTARD, TAR, CREAM, CONCRETE, STEELP, PLY, CRATE, GRASSY, VELOUR, NAVY, RUST, NR, DR, NC, DC,
  pkLetters, small, stencil, gore, drips, bone, skull, chalk, plate, planks, hazard, haze,
} from './paint';

export { pkLetters };
export const drawItchyBackdrop = (c: Ctx, state: GameState) => { drawItchyFar(c, state); return true; };

/** How far back the set pieces' sides and tops run. */
const SET_D = 0.9;
const LIP = LIPR[3];
const onV = (v: View, a: number, b: number, pad = 60) => b > v.cam.x - pad && a < v.cam.x + 800 + pad;

// ---------------------------------------------------------------------------------------------------------------
// The show's sign: a cream board with a ragged, dripping red rim, on two bandaged posts; a cleaver stuck in its top
// corner, a mallet leaning on a post. The first line big and red, the rest small. Painted once for the hour.

export const pkSign = (c: Ctx, x: number, feetY: number, lines: string[], board = '#B91C1C') => {
  const looks = lines.map((_, i) => (i ? small(i === lines.length - 1 && lines.length > 2 ? ['#FFF0A8', '#FACC15'] : ['#FFFFFF', '#FDE7E7']) : pkLetters(1, lines.join('').length)));
  const w = Math.max(120, ...lines.map((l, i) => signW(l, looks[i]) + 40)), h = lines.length * 14 + 20, tall = 112;
  still(c, `pksign2-${lines.join('|')}-${board}`, x, feetY, -w / 2 - 36, -tall - h - 30, w + 72, tall + h + 36, g => {
    const B = NC(board), C = NR(CREAM), Wd = NR(PLY), Bn = NR(BONE), ink = INK;
    // (the posts: wood in steps, bandaged round, a bloody bandage on one; a heap of dirt at each foot)
    for (const s of [-1, 1]) {
      const px = s * (w / 2 - 18);
      postR(g, px, -tall - 4, 0, 10, Wd);
      for (let y = -tall + 26; y < -10; y += 9) { box(g, px - 6, y, 12, 5, ink); box(g, px - 5, y + 1, 10, 3, Bn[3]); box(g, px - 5, y + 1, 10, 1, Bn[5]); box(g, px + 2, y + 1, 3, 3, Bn[2]); }
      if (s > 0) gore(g, px, -tall + 50, 3, w, NR(BLOOD));
      g.fillStyle = ink; g.beginPath(); g.ellipse(px, 0, 12, 4, 0, Math.PI, 0); g.fill(); g.fillStyle = hour('#6A4A3A'); g.beginPath(); g.ellipse(px, 0, 10, 3, 0, Math.PI, 0); g.fill();
    }
    // (the mallet leaned on the left post)
    g.save(); g.translate(-w / 2 + 2, 0); mallet(g, 0, -2, 0.32, 54, 22); g.restore();
    // (the board: the red rim banded, its bottom edge ragged with drips; the cream face banded and bevelled)
    const by = -tall - h;
    const rim = () => { g.rect(-w / 2, by, w, h); };
    g.fillStyle = 'rgba(30,10,20,0.35)'; g.fillRect(-w / 2 + 3, by + 4, w, h);
    box(g, -w / 2 - 2, by - 2, w + 4, h + 4, ink);
    bandsDown(g, rim, -w / 2, by, w, h, [B[4], B[3], B[3], B[2], B[1]]);
    drips(g, -w / 2 + 4, w / 2 - 4, by + h, w + h, B, 7, 12);
    const face = () => g.rect(-w / 2 + 6, by + 6, w - 12, h - 12);
    bandsDown(g, face, -w / 2 + 6, by + 6, w - 12, h - 12, [C[5], C[4], C[3], C[3], C[2]]);
    box(g, -w / 2 + 6, by + 6, w - 12, 1, ink); box(g, -w / 2 + 6, by + h - 7, w - 12, 1, B[0]); box(g, -w / 2 + 6, by + 6, 1, h - 12, ink); box(g, w / 2 - 7, by + 6, 1, h - 12, B[0]);
    // (a splat in a corner, the cleaver stuck in the top, a bandage across the other corner)
    gore(g, w / 2 - 20, by + h - 16, 5, w, NR(BLOOD));
    g.save(); g.translate(-w / 2 + 14, by + 10); g.rotate(-0.7); box(g, -14, -4, 28, 8, ink); box(g, -13, -3, 26, 6, Bn[3]); box(g, -13, -3, 26, 1, Bn[5]); box(g, -3, -3, 6, 6, Bn[2]); g.restore();
    g.save(); g.translate(w / 2 - 26, by + 2); g.rotate(0.5);
    const S = NR(STEELP);
    box(g, -2, -18, 18, 22, ink); box(g, 0, -16, 14, 18, S[4]); box(g, 0, -16, 3, 18, S[5]); box(g, 11, -16, 3, 18, S[3]); box(g, 0, -4, 14, 2, S[2]);
    g.fillStyle = S[1]; g.beginPath(); g.arc(4, -12, 1.5, 0, Math.PI * 2); g.fill();
    box(g, 4, -27, 6, 11, ink); box(g, 5, -26, 4, 9, hour('#7C2D12')); box(g, 5, -26, 1, 9, hour('#B4542A'));
    g.restore();
    // (the letters: the first line in the show's red on the cream, the rest on a red band each)
    let ly = by + 12;
    lines.forEach((l, i) => {
      if (i) { box(g, -w / 2 + 10, ly - 3, w - 20, 12, B[3]); box(g, -w / 2 + 10, ly - 3, w - 20, 1, B[4]); box(g, -w / 2 + 10, ly + 8, w - 20, 1, B[1]); }
      signText(g, l, 0, Math.round(ly + 7), looks[i]); ly += 14;
    });
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The skull lamps on bone posts (a cartoon skull, its eyes glowing after dark)

const LAMPS = [520, 1660, 2380, 3020, 4260, 5420, 6460, 7180, 8620, 9560];
const lampPost = (c: Ctx, x: number) => {
  const on = lit();
  still(c, `pklamp-${on ? 1 : 0}`, x, GY, -24, -196, 48, 200, g => {
    const B = NR(BONE);
    // (the post: a long bone stood on end, its knobs at the foot, a collar of bandage)
    postR(g, 0, -160, -6, 8, B);
    for (const s of [-1, 1]) { ballR(g, s * 5, -4, 6, B); ballR(g, s * 5, -160, 5, B); }
    for (let y = -120; y < -100; y += 5) { box(g, -5, y, 10, 4, INK); box(g, -4, y + 1, 8, 2, B[4]); }
    // (the skull: stepped, its jaw on a hinge, the eyes lit orange after dark)
    skull(g, 0, -174, 14, B, on ? '#FB923C' : B[0]);
    if (on) { g.fillStyle = '#FFEDD5'; g.beginPath(); g.arc(-5, -173, 2, 0, Math.PI * 2); g.arc(5, -173, 2, 0, Math.PI * 2); g.fill(); }
    // (a drip of wax down the dome: it's a candle in there)
    box(g, 6, -186, 2, 6, B[5]);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The gate: two giant cartoon bones for pillars, a banner across them (PUNCHY & KICKY, dripping), the cat's head on one
// end and the mouse's on the other, bonking each other with mallets. Behind him; the banner's top dark.

const boneArch = (c: Ctx, v: View, cx: number) => {
  const w = 440, top = Y(300), Bn = DR(BONE);
  for (const s of [-1, 1]) { const px = cx + s * w / 2; sideBack(c, v.eye, px - 16, -1, top + 10, GY, 1, SET_D, Bn, 3); sideBack(c, v.eye, px + 16, 1, top + 10, GY, 1, SET_D, Bn, 3); }
  sideBack(c, v.eye, cx - w / 2 - 20, -1, top - 50, top + 6, 1, SET_D, DR(BLOOD), 2);
  sideBack(c, v.eye, cx + w / 2 + 20, 1, top - 50, top + 6, 1, SET_D, DR(BLOOD), 2);
  topBack(c, v.eye, cx - w / 2 - 20, cx + w / 2 + 20, top - 50, 1, SET_D, DR(TAR), 2);
  still(c, 'pk-arch2', cx, 0, -w / 2 - 80, top - 100, w + 160, GY - top + 104, g => {
    const ink = dimmed(INK), R = DR(BLOOD);
    for (const s of [-1, 1]) {
      const px = s * w / 2;
      // (the pillar: a giant bone on end, its shaft shaded round, its knobs top and bottom, cracks, a bandage)
      const shaft = () => g.rect(px - 13, top + 12, 26, GY - top - 12);
      box(g, px - 16, top + 10, 32, GY - top - 10, ink); shadeAcross(g, shaft, px - 13, top + 12, 26, GY - top - 12, Bn);
      for (const [ky, kr] of [[top + 12, 1], [GY - 8, -1]] as [number, number][]) for (const k of [-1, 1]) ballR(g, px + k * 14, ky + kr * 4, 17, Bn);
      g.strokeStyle = Bn[1]; g.lineWidth = 1; g.beginPath(); g.moveTo(px - 6, top + 80); g.lineTo(px - 2, top + 96); g.lineTo(px - 7, top + 110); g.moveTo(px + 4, GY - 90); g.lineTo(px + 8, GY - 76); g.stroke();
      for (let y = GY - 160; y < GY - 120; y += 6) { box(g, px - 15, y, 30, 5, ink); box(g, px - 14, y + 1, 28, 3, Bn[4]); }
      gore(g, px + 4, GY - 136, 4, s + 7, R);
    }
    // (the banner: blood red banded, a black border, drips off its foot; the name; the strap line)
    const bx = -w / 2 - 18, bw = w + 36, byy = top - 48;
    box(g, bx - 2, byy - 2, bw + 4, 56, ink);
    bandsDown(g, () => g.rect(bx, byy, bw, 52), bx, byy, bw, 52, [R[4], R[3], R[3], R[2], R[1]]);
    box(g, bx, byy, bw, 4, dimmed('#1F1A24')); box(g, bx, byy + 48, bw, 4, dimmed('#1F1A24'));
    for (let k = 0; k < 12; k++) box(g, bx + 8 + k * (bw - 16) / 11, byy + 1, 2, 2, Bn[4]);
    drips(g, bx + 10, bx + bw - 10, byy + 52, 7, R, 12, 26);
    signText(g, 'PUNCHY & KICKY', 0, top - 20, pkLetters(2, 7, true));
    signText(g, 'THE CAT. THE MOUSE. THE MALLETS.', 0, top - 2, { sx: 1, sy: 1, bold: true, fill: [dimmed('#FFF0A8'), dimmed('#FACC15')], ink });
    // (the heads at the ends, mallets up, bonking)
    g.save(); g.translate(-w / 2 - 34, top - 40); catHead(g, 0, 0, 32, 0.2); g.restore();
    g.save(); g.translate(w / 2 + 34, top - 40); g.scale(-1, 1); mouseHead(g, 0, 0, 30, 0.2); g.restore();
    mallet(g, -w / 2 - 10, top - 20, 0.9, 46, 22);
    g.save(); g.scale(-1, 1); mallet(g, -w / 2 - 10, top - 26, 0.8, 46, 22); g.restore();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; g.fillStyle = dimmed('#FDE047'); g.beginPath(); for (let k = 0; k < 10; k++) { const an = (k / 10) * Math.PI * 2, ra = k % 2 ? 2 : 5; g.lineTo(Math.cos(a) * 46 + Math.cos(an) * ra, top - 70 + Math.sin(a) * 18 + Math.sin(an) * ra); } g.closePath(); g.fill(); }
    haze(g, -w / 2 - 80, top - 90, 110, 110, 0.2); haze(g, w / 2 - 30, top - 90, 110, 110, 0.2);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The merch stand (a booth: a striped awning, shelves of plush heads, the safety cleavers, the splatter tees, foam
// mallets) and its jumbotron up on a truss, playing the cartoon.

const merchStand = (c: Ctx, v: View) => {
  const xa = X(MERCH.a), xb = X(MERCH.b), w = xb - xa, top = Y(150), Cr = DR(CREAM);
  sideBack(c, v.eye, xa, -1, top - 60, GY, 1, SET_D, Cr, 3); sideBack(c, v.eye, xb, 1, top - 60, GY, 1, SET_D, Cr, 3);
  topBack(c, v.eye, xa - 14, xb + 14, top - 60, 1, SET_D, DR(BLOOD), 2);
  still(c, 'pk-merch2', xa, 0, -24, top - 74, w + 48, GY - top + 78, g => {
    const ink = dimmed(INK), R = DR(BLOOD), Wd = DR(PLY), K = DR(TAR);
    box(g, -2, top - 2, w + 4, GY - top + 2, ink);
    bandsDown(g, () => g.rect(0, top, w, GY - top), 0, top, w, GY - top, [Cr[2], Cr[3], Cr[3], Cr[4], Cr[3], Cr[2]]);
    // (the awning: red and black stripes, each lit and shaded, scalloped)
    for (let k = -14; k < w + 14; k += 16) { const col = ((k + 14) / 16) % 2 ? K : R; box(g, k, top - 34, 16, 34, col[3]); box(g, k, top - 34, 3, 34, col[4]); box(g, k + 13, top - 34, 3, 34, col[2]); box(g, k, top - 8, 16, 8, col[2]); }
    for (let k = -14; k < w + 14; k += 16) { const col = ((k + 14) / 16) % 2 ? K : R; g.fillStyle = ink; g.beginPath(); g.arc(k + 8, top, 9, 0, Math.PI); g.fill(); g.fillStyle = col[3]; g.beginPath(); g.arc(k + 8, top, 7.5, 0, Math.PI); g.fill(); box(g, k + 4, top + 1, 4, 2, col[4]); }
    box(g, -16, top - 36, w + 32, 3, ink);
    // (the board over it)
    box(g, -14, top - 62, w + 28, 28, ink); bandsDown(g, () => g.rect(-12, top - 60, w + 24, 24), -12, top - 60, w + 24, 24, [R[4], R[3], R[2]]);
    signText(g, 'PUNCHY & KICKY STUFF', w / 2, top - 42, { sx: 1, sy: 2, bold: true, fill: [dimmed('#FFFFFF'), dimmed('#FDE047')], ink, shadow: dimmed('#450A0A'), drop: 1 });
    // (the shelves: plush heads in a row on a plank, toy cleavers on a pegboard, tees on hangers, foam mallets in a bin)
    for (let k = 0; k < 5; k++) { g.save(); g.translate(30 + k * 26, top + 28); (k % 2 ? mouseHead : catHead)(g, 0, 0, 9, (k - 2) * 0.1); g.restore(); }
    box(g, 12, top + 42, 144, 5, ink); box(g, 13, top + 43, 142, 3, Wd[3]); box(g, 13, top + 43, 142, 1, Wd[5]);
    box(g, 14, top + 52, 140, 36, Wd[2]); for (let y = top + 56; y < top + 86; y += 5) for (let x = 18; x < 152; x += 5) box(g, x, y, 1, 1, Wd[0]);
    const S = DR(STEELP);
    for (let k = 0; k < 5; k++) { box(g, 24 + k * 26, top + 56, 14, 18, ink); box(g, 25 + k * 26, top + 57, 12, 16, S[4]); box(g, 25 + k * 26, top + 57, 3, 16, S[5]); box(g, 34 + k * 26, top + 57, 3, 16, S[3]); box(g, 28 + k * 26, top + 73, 5, 9, dimmed('#F472B6')); }
    signText(g, 'SAFETY CLEAVER', 86, top + 98, small(dimmed('#B91C1C'), ink));
    signText(g, 'AGES 3 AND UP', 86, top + 108, { sx: 1, sy: 1, fill: dimmed('#1F2937') });
    for (let k = 0; k < 4; k++) {
      const tx = 180 + k * 34;
      g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(tx + 8, top + 14); g.lineTo(tx + 14, top + 8); g.lineTo(tx + 20, top + 14); g.stroke();
      polyF(g, [[tx - 2, top + 14], [tx + 30, top + 14], [tx + 34, top + 24], [tx + 28, top + 26], [tx + 28, top + 50], [tx, top + 50], [tx, top + 26], [tx - 6, top + 24]], ink);
      polyF(g, [[tx, top + 15], [tx + 28, top + 15], [tx + 32, top + 24], [tx + 27, top + 25], [tx + 27, top + 49], [tx + 1, top + 49], [tx + 1, top + 25], [tx - 4, top + 24]], dimmed('#FAFAFA'));
      box(g, tx + 22, top + 16, 5, 33, dimmed('#D8D4DC'));
      gore(g, tx + 14, top + 32, 5, k + 3, R);
    }
    signText(g, 'SPLATTER TEES', 240, top + 64, small(dimmed('#B91C1C'), ink));
    box(g, 186, top + 76, 120, 30, ink); box(g, 188, top + 78, 116, 26, R[2]); box(g, 188, top + 78, 116, 3, R[3]);
    for (let k = 0; k < 6; k++) { g.save(); g.translate(196 + k * 18, top + 78); g.rotate(-0.2 + k * 0.08); box(g, -3, -26, 6, 26, ink); box(g, -2, -26, 4, 26, dimmed('#FDE047')); box(g, -10, -36, 20, 12, ink); box(g, -9, -35, 18, 10, dimmed('#F97316')); box(g, -9, -35, 18, 3, dimmed('#FDBA74')); g.restore(); }
    signText(g, 'FOAM MALLETS', 246, top + 118, small(dimmed('#FFFFFF'), ink));
    // (the counter: its top a plank, a till, a jar of tips; its front stripes)
    box(g, -4, GY - 48, w + 8, 10, ink); box(g, -2, GY - 46, w + 4, 6, Wd[3]); box(g, -2, GY - 46, w + 4, 2, Wd[5]);
    for (let k = 0; k < w; k += 20) { box(g, k, GY - 38, 10, 38, R[3]); box(g, k + 10, GY - 38, 10, 38, Cr[3]); }
    box(g, w - 60, GY - 64, 30, 16, ink); box(g, w - 59, GY - 63, 28, 14, dimmed('#A8A8BC')); box(g, w - 56, GY - 60, 10, 4, dimmed('#7CFF7C'));
    box(g, 40, GY - 62, 14, 14, dimmed('#BAE6FD')); signText(g, 'TIPS', 47, GY - 52, { sx: 1, sy: 1, fill: dimmed('#1F2937') });
  });
};
/** The jumbotron: a big CRT on a truss over the stand, playing PUNCHY & KICKY on a loop. Four bits, a title card
 *  between: the mouse flattens the cat's head with a mallet; the cat swings and the mouse ducks and he gets his own
 *  foot; an anvil on the cat; the cat with a lit stick of dynamite, BOOM, a skeleton. */
const LOOP = 200;
const jumbotron = (c: Ctx, v: View, state: GameState) => {
  const cx = X(MERCH.tv), w = 230, h = 150, top = Y(440), f = state.frame, S = DR(STEELP);
  // (the truss: two lattice towers, steps across, sides going back)
  for (const s of [-1, 1]) {
    const tx = cx + s * (w / 2 - 20);
    sideBack(c, v.eye, tx - 7, -1, top + h, Y(150) - 30, 1, SET_D, S, 2); sideBack(c, v.eye, tx + 7, 1, top + h, Y(150) - 30, 1, SET_D, S, 2);
  }
  still(c, 'pk-truss', cx, 0, -w / 2 - 50, top - 16, w + 100, Y(150) - top - 14, g => {
    for (const s of [-1, 1]) {
      const tx = s * (w / 2 - 20), b = Y(150) - 30;
      for (const ox of [-7, 5]) { box(g, tx + ox, top + h, 3, b - top - h, dimmed(INK)); box(g, tx + ox, top + h, 1, b - top - h, S[4]); }
      g.strokeStyle = S[2]; g.lineWidth = 1.5; g.beginPath(); for (let y = top + h; y < b - 10; y += 12) { g.moveTo(tx - 6, y); g.lineTo(tx + 6, y + 12); g.moveTo(tx + 6, y); g.lineTo(tx - 6, y + 12); } g.stroke();
    }
    // (the bezel: a fat black CRT frame, speakers either side, the UBX badge)
    const K = DR(TAR);
    box(g, -w / 2 - 14, top - 14, w + 28, h + 28, dimmed(INK)); plate(g, -w / 2 - 12, top - 12, w + 24, h + 24, K, true);
    for (const s of [-1, 1]) { const sx = s * (w / 2 + 26); box(g, sx - 14, top + 20, 28, 90, dimmed(INK)); box(g, sx - 12, top + 22, 24, 86, K[2]); for (const sy of [top + 44, top + 86]) { ballR(g, sx, sy, 9, K); g.fillStyle = K[0]; g.beginPath(); g.arc(sx, sy, 4, 0, Math.PI * 2); g.fill(); } }
  });
  // (the picture: live)
  c.save(); c.beginPath(); c.rect(cx - w / 2, top, w, h); c.clip();
  const bit = Math.floor(f / LOOP) % 5, t = (f % LOOP) / LOOP;
  if (bit === 4) { box(c, cx - w / 2, top, w, h, '#7F1D1D'); for (let y = 0; y < h; y += 10) box(c, cx - w / 2, top + y, w, 5, '#991B1B'); }
  else {
    const skyB = ['#5BC0F8', '#7DD3FC', '#A8E2FC'];
    for (let i = 0; i < 3; i++) box(c, cx - w / 2, top + i * 40, w, 40, skyB[i]);
    box(c, cx - w / 2, top + h - 30, w, 30, '#4ADE80'); box(c, cx - w / 2, top + h - 30, w, 3, '#86EFAC'); box(c, cx - w / 2, top + h - 8, w, 8, '#22A04A');
    // (the cartoon's house window, a picture frame, a lamp)
    box(c, cx - w / 2 + 18, top + 18, 54, 54, INK); box(c, cx - w / 2 + 20, top + 20, 50, 50, '#FDE68A'); box(c, cx - w / 2 + 44, top + 20, 2, 50, '#7DD3FC'); box(c, cx - w / 2 + 20, top + 44, 50, 2, '#7DD3FC');
    box(c, cx + w / 2 - 50, top + 26, 30, 22, INK); box(c, cx + w / 2 - 48, top + 28, 26, 18, '#FCA5A5');
  }
  const gy = top + h - 26;
  const cat = (x: number, y: number, sx = 1, sy = 1, a = 0) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(sx, sy); box(c, -9, -29, 18, 29, INK); box(c, -7, -27, 14, 25, '#EA8A2E'); box(c, -7, -27, 4, 25, '#F8B060'); box(c, 3, -27, 4, 25, '#BE5E16'); box(c, -4, -20, 8, 12, '#FFF4E0'); catHead(c, 0, -38, 13, 0); c.restore(); };
  const mouse = (x: number, y: number, sx = 1, a = 0) => { c.save(); c.translate(x, y); c.rotate(a); c.scale(sx, 1); box(c, -7, -21, 14, 21, INK); box(c, -5, -19, 10, 17, '#A8A29E'); box(c, -5, -19, 3, 17, '#CCC8C2'); box(c, -7, -4, 14, 4, '#DC2626'); box(c, -7, -4, 14, 1, '#F87171'); mouseHead(c, 0, -28, 10, 0); c.restore(); };
  if (bit === 4) {
    signText(c, 'PUNCHY', cx, top + 56, pkLetters(2, 3));
    signText(c, '& KICKY', cx, top + 86, pkLetters(2, 5));
    catHead(c, cx - 80, top + 120, 16, 0.2);
    c.save(); c.translate(cx + 80, top + 120); c.scale(-1, 1); mouseHead(c, 0, 0, 15, 0.2); c.restore();
  } else if (bit === 0) {
    const sq = t > 0.55 ? 0.35 : 1;
    cat(cx + 30, gy, 1, sq);
    const mx = cx - 60 + Math.min(1, t * 2) * 50;
    mouse(mx, gy, 1);
    const a = t < 0.45 ? -0.4 : t < 0.55 ? -0.4 + (t - 0.45) * 30 : 2.6;
    mallet(c, mx + 6, gy - 22, a, 34, 16);
    if (t > 0.55) { for (const s of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx + 30 + s * 6, gy - 12); c.lineTo(cx + 30 + s * 10, gy - 34 - Math.sin(f * 0.6) * 4); c.stroke(); c.fillStyle = INK; c.beginPath(); c.arc(cx + 30 + s * 10, gy - 36 - Math.sin(f * 0.6) * 4, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(cx + 30 + s * 10, gy - 36 - Math.sin(f * 0.6) * 4, 5, 0, Math.PI * 2); c.fill(); box(c, cx + 30 + s * 10 - 1, gy - 37 - Math.sin(f * 0.6) * 4, 3, 3, INK); } gore(c, cx + 46, gy - 6, 5, 2); signText(c, 'BONK!', cx + 30, top + 30, pkLetters(1, 8)); }
  } else if (bit === 1) {
    const mx = cx + 40, ducked = t > 0.35 && t < 0.7;
    cat(cx - 30, gy, 1);
    mouse(mx, gy + (ducked ? 10 : 0), -1);
    const a = t < 0.3 ? -0.6 : Math.min(2.9, -0.6 + (t - 0.3) * 14);
    mallet(c, cx - 22, gy - 26, a, 34, 16);
    if (t > 0.55) { signText(c, 'YOWWW!', cx - 30, top + 30, pkLetters(1, 9)); gore(c, cx - 16, gy - 2, 6, 4); }
  } else if (bit === 2) {
    const ay = top - 40 + Math.min(1, t * 1.8) ** 2 * (h - 40);
    const sq = t > 0.56 ? 0.4 : 1;
    cat(cx + 20, gy, 1.1, sq);
    mouse(cx - 70, gy, 1);
    c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - 64, gy - 22); c.lineTo(cx - 30, top); c.stroke();
    c.save(); c.translate(cx + 20, Math.min(ay, gy - 28 * sq)); c.scale(0.7, 0.7);
    box(c, -26, -30, 52, 30, INK); box(c, -24, -28, 48, 26, '#52525B'); box(c, -24, -28, 48, 4, '#A1A1AA'); box(c, -24, -6, 48, 4, '#3F3F46'); c.restore();
    if (t > 0.56) signText(c, 'SQUISH!', cx + 20, top + 30, pkLetters(1, 11));
  } else {
    if (t < 0.6) {
      cat(cx, gy, 1);
      box(c, cx + 9, gy - 35, 8, 20, INK); box(c, cx + 10, gy - 34, 6, 18, '#DC2626'); box(c, cx + 10, gy - 34, 2, 18, '#F87171');
      c.fillStyle = (f >> 1) % 2 ? '#FDE047' : '#FFFFFF'; c.beginPath(); c.arc(cx + 13, gy - 36 + t * 30, 4, 0, Math.PI * 2); c.fill();
      mouse(cx + 80, gy, -1);
    } else if (t < 0.7) {
      box(c, cx - w / 2, top, w, h, '#FFFBEB');
      c.fillStyle = '#FDE047'; c.beginPath(); for (let k = 0; k < 16; k++) { const an = (k / 16) * Math.PI * 2, ra = k % 2 ? 40 : 70; c.lineTo(cx + Math.cos(an) * ra, top + h / 2 + Math.sin(an) * ra * 0.7); } c.closePath(); c.fill();
      signText(c, 'BOOM!', cx, top + h / 2 + 10, pkLetters(3, 13));
    } else {
      const k = t > 0.88 ? 1 : 0;
      if (!k) { const Bn = BONE; c.strokeStyle = Bn[4]; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, gy); c.lineTo(cx, gy - 30); c.moveTo(cx - 8, gy - 24); c.lineTo(cx + 8, gy - 24); for (let r = 0; r < 3; r++) { c.moveTo(cx - 6, gy - 20 + r * 4); c.lineTo(cx + 6, gy - 20 + r * 4); } c.stroke(); skull(c, cx, gy - 38, 9, BONE, INK); }
      else for (let i = 0; i < 5; i++) bone(c, cx - 16 + i * 7, gy - 2, cx - 10 + i * 7, gy - 7, 2, BONE);
      mouse(cx + 80, gy, -1);
      c.fillStyle = 'rgba(60,60,60,0.5)'; c.beginPath(); c.arc(cx, gy - 50 - t * 20, 12, 0, Math.PI * 2); c.fill();
    }
  }
  // (scan lines, the glass's sheen, the bulge's dark corners)
  c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = top; y < top + h; y += 3) c.fillRect(cx - w / 2, y, w, 1);
  c.fillStyle = 'rgba(255,255,255,0.08)'; c.beginPath(); c.moveTo(cx - w / 2, top); c.lineTo(cx - w / 2 + 70, top); c.lineTo(cx - w / 2, top + 90); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.18)'; for (const [qx, qy] of [[cx - w / 2, top], [cx + w / 2, top], [cx - w / 2, top + h], [cx + w / 2, top + h]]) { c.beginPath(); c.arc(qx, qy, 16, 0, Math.PI * 2); c.fill(); }
  c.restore();
  signText(c, 'UBX', cx + w / 2 - 22, top + h + 10, { sx: 1, sy: 1, bold: true, fill: dimmed('#FACC15'), ink: dimmed(INK) });
  if ((f >> 4) % 2) box(c, cx - w / 2 - 4, top + h + 6, 4, 4, '#FF4040');
};

// ---------------------------------------------------------------------------------------------------------------
// PUNCHY & KICKY'S KILL-O-RAMA: the attraction's front, a red-and-black cartoon castle of a theater (stone in steps,
// battlements, the towers at its ends with their cones and pennants, cat-head gargoyles), the marquee across the top
// (bulbs chasing), blood down its front, the doors in the middle dark and chained (the ride inside's shut: nothing in
// there). On a later visit, CLOSED FOR CLEANUP hung on the chains, TODAY'S SHOW: CANCELED.

const killorama = (c: Ctx, v: View, state: GameState, closed: boolean) => {
  const xa = X(KILLORAMA.a), xb = X(KILLORAMA.b), w = xb - xa, top = Y(380), dx = X(KILLORAMA.doors) - xa, St = DR(BLOOD), K = DR(TAR);
  sideBack(c, v.eye, xa, -1, top - 80, GY, 1, SET_D, K, 3); sideBack(c, v.eye, xb, 1, top - 80, GY, 1, SET_D, K, 3);
  topBack(c, v.eye, xa + 90, xb - 90, top - 2, 1, SET_D, St, 2);
  still(c, `pk-kor2-${closed ? 1 : 0}-${lit() ? 1 : 0}`, xa, 0, -24, top - 180, w + 48, GY - top + 184, g => {
    const ink = dimmed(INK), Bn = DR(BONE), M = DR(MUSTARD);
    // (the wall: blocks of red stone, each in steps, mortar between, a few chipped)
    box(g, -2, top - 2, w + 4, GY - top + 2, ink); box(g, 0, top, w, GY - top, St[1]);
    for (let r = 0, y = top + 2; y < GY; y += 22, r++) for (let x = (r % 2) * -24; x < w; x += 48) {
      const bx = Math.max(0, x + 1), bw = Math.min(w, x + 47) - bx, bh = Math.min(20, GY - y);
      if (bw <= 2 || bh <= 2) continue;
      const tone = hash(x * 0.3 + r) > 0.5 ? St[3] : St[2];
      box(g, bx, y, bw, bh, tone); box(g, bx, y, bw, 2, St[4]); box(g, bx, y, 2, bh, St[4]); box(g, bx + bw - 2, y, 2, bh, St[1]); box(g, bx, y + bh - 2, bw, 2, St[1]);
      if (hash(x + r * 7) > 0.9) { polyF(g, [[bx + bw - 10, y], [bx + bw, y], [bx + bw, y + 8]], St[0]); }
    }
    // (the battlements: merlons with their caps (dimmed: not to stand on))
    for (let x = 0; x < w; x += 40) { box(g, x, top - 24, 26, 26, ink); box(g, x + 2, top - 22, 22, 22, St[3]); box(g, x + 2, top - 22, 22, 3, St[4]); box(g, x + 20, top - 22, 4, 22, St[1]); }
    // (the towers at the ends: black stone, a cone of red slates, a pennant, a slit window glowing, a cat-head gargoyle)
    for (const tx of [0, w - 90]) {
      box(g, tx - 2, top - 82, 94, GY - top + 82, ink);
      for (let r = 0, y = top - 80; y < GY; y += 18, r++) for (let x = tx + (r % 2) * -15; x < tx + 90; x += 30) { const bx = Math.max(tx, x + 1), bw = Math.min(tx + 90, x + 29) - bx; if (bw > 2) { box(g, bx, y, bw, 16, K[2 + (hash(x + r) > 0.5 ? 1 : 0)]); box(g, bx, y, bw, 1, K[4]); box(g, bx + bw - 1, y, 1, 16, K[0]); } }
      polyF(g, [[tx - 8, top - 80], [tx + 45, top - 150], [tx + 98, top - 80]], ink);
      for (let k = 0; k < 6; k++) { const y0 = top - 82 - k * 11, y1 = y0 - 11, f0 = (y0 - (top - 150)) / 70, f1 = (y1 - (top - 150)) / 70; polyF(g, [[tx + 45 - 51 * f0, y0], [tx + 45 + 51 * f0, y0], [tx + 45 + 51 * f1, y1], [tx + 45 - 51 * f1, y1]], St[k % 2 ? 2 : 3]); box(g, tx + 45 - 51 * f0, y0 - 1, 51 * f0, 1, St[4]); }
      box(g, tx + 44, top - 172, 2, 24, ink);
      polyF(g, [[tx + 46, top - 172], [tx + 76, top - 166], [tx + 66, top - 162], [tx + 76, top - 158], [tx + 46, top - 156]], M[3]); box(g, tx + 46, top - 172, 30, 2, M[4]);
      box(g, tx + 40, top - 40, 10, 34, ink); box(g, tx + 42, top - 38, 6, 30, lit() ? '#F87171' : dimmed('#3A0A0A'));
      g.save(); g.translate(tx + 45, top + 30); catHead(g, 0, 0, 16, 0.1); g.restore();
      drips(g, tx + 34, tx + 56, top + 44, tx, St, 3, 30);
    }
    haze(g, -2, top - 4, 100, 70, 0.2); haze(g, w - 92, top - 4, 100, 70, 0.2);
    // (blood running down the front from the battlements)
    drips(g, 90, w - 90, top + 2, 41, DR(['#1A0204', '#2E0406', '#4A080C', '#6A0C12', '#8A1A1E', '#B03A3A']), 18, 130);
    // (the doors: a big arch, a skull keystone, dark, chained shut, a padlock)
    g.fillStyle = ink; g.beginPath(); g.moveTo(dx - 96, GY); g.lineTo(dx - 96, GY - 150); g.quadraticCurveTo(dx, GY - 238, dx + 96, GY - 150); g.lineTo(dx + 96, GY); g.closePath(); g.fill();
    g.fillStyle = Bn[2]; g.beginPath(); g.moveTo(dx - 92, GY); g.lineTo(dx - 92, GY - 150); g.quadraticCurveTo(dx, GY - 232, dx + 92, GY - 150); g.lineTo(dx + 92, GY); g.closePath(); g.fill();
    g.fillStyle = '#0B0B0F'; g.beginPath(); g.moveTo(dx - 82, GY); g.lineTo(dx - 82, GY - 146); g.quadraticCurveTo(dx, GY - 220, dx + 82, GY - 146); g.lineTo(dx + 82, GY); g.closePath(); g.fill();
    for (let k = 0; k < 9; k++) { const t = k / 8, ax = dx - 92 + t * 184, ay = GY - 150 - Math.sin(t * Math.PI) * 70; box(g, ax - 6, ay - 8, 12, 10, Bn[3]); box(g, ax - 6, ay - 8, 12, 2, Bn[5]); box(g, ax - 6, ay + 1, 12, 1, Bn[0]); }
    skull(g, dx, GY - 214, 14, Bn, St[0]);
    box(g, dx - 1, GY - 146, 2, 146, dimmed('#1A1A20'));
    const S = DR(STEELP);
    for (const s of [-1, 1]) { g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); g.moveTo(dx - 82, GY - 110 + s * 20); g.quadraticCurveTo(dx, GY - 78 + s * 20, dx + 82, GY - 110 + s * 20); g.stroke(); g.strokeStyle = S[4]; g.lineWidth = 3; g.setLineDash([4, 3]); g.stroke(); g.setLineDash([]); }
    box(g, dx - 12, GY - 106, 24, 24, ink); box(g, dx - 10, GY - 104, 20, 20, M[3]); box(g, dx - 10, GY - 104, 20, 3, M[5]); box(g, dx - 2, GY - 96, 4, 7, ink);
    g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.arc(dx, GY - 106, 7, Math.PI, 0); g.stroke();
    if (closed) { box(g, dx - 72, GY - 152, 144, 44, ink); box(g, dx - 70, GY - 150, 140, 40, M[3]); box(g, dx - 70, GY - 150, 140, 3, M[5]); box(g, dx - 70, GY - 113, 140, 3, M[1]); g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(dx - 60, GY - 152); g.lineTo(dx - 40, GY - 172); g.lineTo(dx + 40, GY - 172); g.lineTo(dx + 60, GY - 152); g.stroke(); signText(g, 'CLOSED FOR', dx, GY - 134, small(dimmed('#1F1A24'), M[5])); signText(g, 'CLEANUP', dx, GY - 120, small(dimmed('#B91C1C'), M[5])); gore(g, dx + 52, GY - 120, 5, 3, St); }
    // (the marquee across the top: a black board in steps, its letters)
    const mw = 560, mx = dx - mw / 2, my = top + 30;
    box(g, mx - 6, my - 6, mw + 12, 100, ink); plate(g, mx - 4, my - 4, mw + 8, 96, K, true); box(g, mx + 6, my + 6, mw - 12, 76, K[1]);
    signText(g, "PUNCHY & KICKY'S", dx, my + 26, pkLetters(2, 17, true));
    signText(g, 'KILL-O-RAMA', dx, my + 56, pkLetters(3, 19, true));
    signText(g, closed ? "TODAY'S SHOW: CANCELED" : 'SHOWS EVERY 30 SECONDS! NOW 40% MORE KILLING!', dx, my + 80, small([dimmed('#FFF0A8'), dimmed('#FACC15')], ink));
    // (the ticket window by the doors, its grille)
    const tx = dx + 130; box(g, tx - 2, GY - 92, 64, 92, ink); box(g, tx, GY - 90, 60, 90, St[2]); box(g, tx + 8, GY - 80, 44, 34, lit() ? '#FBBF24' : dimmed('#3A2A2A')); for (let k = 0; k < 6; k++) box(g, tx + 8 + k * 8, GY - 80, 1, 34, ink);
    signText(g, 'TICKETS', tx + 30, GY - 36, small(M[4], ink)); box(g, tx + 4, GY - 48, 52, 3, Bn[3]);
  });
  // (the marquee's bulbs, chasing)
  const mw = 560, mx = X(KILLORAMA.doors) - mw / 2, my = top + 30, f = state.frame;
  for (let k = 0; k < 40; k++) {
    const t = k / 40, on = ((k + (f >> 3)) % 3) === 0;
    const bx = t < 0.5 ? mx + t * 2 * mw : mx + (1 - (t - 0.5) * 2) * mw, by = t < 0.5 ? my - 8 : my + 94;
    box(c, bx - 2, by - 2, 5, 5, dimmed(INK)); box(c, bx - 1, by - 1, 3, 3, on && !closed ? '#FDE68A' : dimmed('#78716C'));
    if (on && !closed) box(c, bx - 1, by - 1, 1, 1, '#FFFFFF');
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The GENERIC-CO warehouse behind the dock: corrugated steel, the roll doors, the slogan, the dock's bumpers, a
// forklift, crates, the safety board, posters.

const warehouse = (c: Ctx, v: View) => {
  const xa = X(4280), w = 1080, top = Y(320), Cg = DC('#A8A4B4');
  sideBack(c, v.eye, xa, -1, top - 14, GY, 1, SET_D, Cg, 3); sideBack(c, v.eye, xa + w, 1, top - 14, GY, 1, SET_D, Cg, 3);
  topBack(c, v.eye, xa - 10, xa + w + 10, top - 14, 1, SET_D, DR(TAR), 2);
  still(c, 'pk-warehouse4', xa, 0, -12, top - 54, w + 24, GY - top + 58, g => {
    const ink = dimmed(INK), M = DR(MUSTARD), S = DR(STEELP), Cr = DR(CRATE);
    box(g, -2, top, w + 4, GY - top, ink);
    // (corrugated: ribs in steps, a stain down from the gutter here and there, rust at the foot)
    for (let x = 0; x < w; x += 10) { box(g, x, top + 2, 5, GY - top - 2, Cg[4]); box(g, x + 5, top + 2, 3, GY - top - 2, Cg[3]); box(g, x + 8, top + 2, 2, GY - top - 2, Cg[1]); box(g, x, top + 2, 1, GY - top - 2, Cg[5]); }
    for (let k = 0; k < 8; k++) { const sx = 40 + hash(k * 3.3) * (w - 80), l = 40 + hash(k) * 120; g.globalAlpha = 0.35; box(g, sx, top + 2, 8, l, Cg[0]); g.globalAlpha = 1; }
    // (the sheets lapped in courses, a rivet line along each lap, a run of clerestory windows up high, vents, rust weeping
    // from the rivets and a dent or two where something backed into it)
    for (const ly of [top + 88, top + 176]) { box(g, 0, ly, w, 3, Cg[1]); box(g, 0, ly + 3, w, 1, Cg[5]); for (let x = 4; x < w; x += 10) { box(g, x, ly - 3, 2, 2, Cg[0]); if (hash(x * 0.9 + ly) > 0.86) for (let y = 0; y < 26; y += 2) box(g, x, ly + y, 2, 2, `rgba(140,60,20,${(0.4 * (1 - y / 26)).toFixed(2)})`); } }
    for (let x = 560; x < w - 60; x += 96) { box(g, x - 2, top + 18, 64, 26, ink); box(g, x, top + 20, 60, 22, lit() ? dimmed('#FCD88A') : dimmed('#5E7894')); for (let k = 1; k < 4; k++) box(g, x + k * 15, top + 20, 2, 22, ink); box(g, x, top + 20, 60, 3, lit() ? dimmed('#FFF0C0') : dimmed('#8EA8C4')); checker(g, x, top + 30, 60, 12, 'rgba(26,16,40,0.18)', 0, 2); }
    for (const vx of [86, 610, 1050]) { box(g, vx - 1, top + 110, 30, 22, ink); box(g, vx, top + 111, 28, 20, S[2]); for (let k = 0; k < 5; k++) { box(g, vx + 2, top + 113 + k * 4, 24, 2, S[0]); box(g, vx + 2, top + 113 + k * 4, 24, 1, S[4]); } }
    for (const [dx2, dy2] of [[300, GY - 70], [700, GY - 120]] as [number, number][]) { g.fillStyle = 'rgba(26,16,40,0.25)'; g.beginPath(); g.ellipse(dx2, dy2, 16, 10, 0.3, 0, Math.PI * 2); g.fill(); box(g, dx2 - 10, dy2 - 8, 8, 1, Cg[5]); }
    box(g, 0, GY - 14, w, 14, DR(RUST)[2]); checker(g, 0, GY - 18, w, 4, DR(RUST)[2], 0, 2);
    box(g, -10, top - 14, w + 20, 16, ink); box(g, -8, top - 12, w + 16, 12, S[2]); box(g, -8, top - 12, w + 16, 2, S[4]);
    // (the sign: mustard board, GENERIC-CO stenciled, the slogan; left of the dock crane's mast (hazardArt.ts: at
    // 500 in here), so nothing stands in front of it)
    const sc = 255, sw = 440;
    box(g, sc - sw / 2 - 2, top + 18, sw + 4, 54, ink); bandsDown(g, () => g.rect(sc - sw / 2 + 2, top + 22, sw - 4, 46), sc - sw / 2 + 2, top + 22, sw - 4, 46, [M[5], M[4], M[3], M[3], M[2]]);
    for (const bx of [sc - sw / 2 + 10, sc + sw / 2 - 14]) { box(g, bx, top + 26, 3, 3, M[0]); box(g, bx, top + 60, 3, 3, M[0]); }
    signText(g, 'GENERIC-CO', sc, top + 50, stencil(dimmed('#1F2937'), 2));
    signText(g, 'WE MAKE EVERYTHING. BADLY.', sc, top + 64, { sx: 1, sy: 1, fill: dimmed('#7F1D1D') });
    // (the roll doors: slats in steps; the right one half up, the dark inside, crates in there)
    for (const [dx, up] of [[140, 0], [820, 0.5]] as [number, number][]) {
      box(g, dx - 4, GY - 156, 158, 156, ink); box(g, dx - 2, GY - 154, 154, 6, S[1]);
      if (up) { box(g, dx, GY - 148 + 148 * up, 150, 148 * (1 - up), dimmed('#0A080C')); for (let k = 0; k < 3; k++) { box(g, dx + 14 + k * 44, GY - 40, 40, 40, Cr[2]); box(g, dx + 14 + k * 44, GY - 40, 40, 2, Cr[3]); } }
      for (let y = GY - 148; y < GY - 148 + 148 * (up ? up : 1); y += 8) { box(g, dx, y, 150, 7, S[3]); box(g, dx, y, 150, 1, S[4]); box(g, dx, y + 6, 150, 1, S[1]); }
      box(g, dx + 66, GY - 148 + 148 * (up || 1) - 8, 18, 4, S[5]);
      // (the dock bumpers either side)
      for (const bx of [dx - 14, dx + 152]) { box(g, bx, GY - 40, 12, 22, ink); box(g, bx + 1, GY - 39, 10, 20, dimmed('#1F1A24')); box(g, bx + 1, GY - 39, 10, 2, dimmed('#3A3040')); }
      hazard(g, dx - 4, GY - 8, 158, 8, M[3], dimmed('#1F1A24'));
    }
    // (crates stacked against it, a forklift parked, the safety board)
    for (const [cx, cy, s] of [[320, 0, 60], [380, 0, 60], [350, 60, 60], [640, 0, 70], [990, 0, 50]] as [number, number, number][]) {
      box(g, cx - 1, GY - cy - s - 1, s + 2, s + 2, ink); planks(g, cx, GY - cy - s, s, s, Cr, 10, true, cx + cy);
      box(g, cx, GY - cy - s, 4, s, Cr[4]); box(g, cx + s - 4, GY - cy - s, 4, s, Cr[1]);
      signText(g, 'GC', cx + s / 2, GY - cy - s / 2 + 3, stencil(dimmed('#1F2937')));
    }
    { const fx = 520; box(g, fx - 2, GY - 52, 64, 40, ink); box(g, fx, GY - 50, 60, 36, M[3]); box(g, fx, GY - 50, 60, 3, M[5]); box(g, fx + 48, GY - 50, 12, 36, M[1]);
      box(g, fx + 8, GY - 92, 3, 42, ink); box(g, fx + 40, GY - 92, 3, 42, ink); box(g, fx + 6, GY - 94, 40, 4, ink);
      box(g, fx - 16, GY - 96, 4, 90, ink); box(g, fx - 34, GY - 10, 22, 4, ink);
      for (const wx of [fx + 10, fx + 50]) ballR(g, wx, GY - 10, 9, DR(TAR)); }
    { const sx2 = 740; box(g, sx2 - 2, top + 96, 74, 50, ink); box(g, sx2, top + 98, 70, 46, dimmed('#F4F0EC')); box(g, sx2, top + 98, 70, 10, dimmed('#16A34A'));
      signText(g, 'SAFETY', sx2 + 35, top + 106, small(dimmed('#FFFFFF'), ink)); signText(g, '0', sx2 + 35, top + 128, { sx: 2, sy: 2, bold: true, fill: dimmed('#B91C1C') }); signText(g, 'DAYS W/O AN', sx2 + 35, top + 136, { sx: 1, sy: 1, fill: dimmed('#1F2937') }); signText(g, 'ACCIDENT', sx2 + 35, top + 143, { sx: 1, sy: 1, fill: dimmed('#1F2937') }); }
    // (posters pasted up by the doors)
    pkPosterArt(g, 40, GY - 210, 2); pkPosterArt(g, 1010, GY - 200, 1);
    // (a light over each door)
    for (const dx of [215, 895]) { box(g, dx - 10, GY - 176, 20, 8, ink); box(g, dx - 8, GY - 174, 16, 4, lit() ? '#FFF0C0' : S[3]); }
  });
};
/** The pallet rack (one shelf up top lit: stand on it; crates on the lower shelves: scenery). */
const rack = (c: Ctx, v: View) => {
  const [a, b, h] = RACK, xa = X(a), xb = X(b), top = Y(h);
  // (its depth: the beam's ends going back, an upright at the back corners; its deck from above)
  boxSides(c, v.eye, xa - 4, xb + 4, top, GY, 0.9, NC('#F97316'), { apron: 10, leg: 8, sideR: NR(NAVY), topR: DR(CRATE) });
  still(c, 'pk-rack', xa, top, -8, -4, xb - xa + 16, GY - top + 8, g => {
    const Bl = NR(NAVY), Or = NC('#F97316'), Cr = DR(CRATE);
    for (const px of [0, xb - xa - 8]) { postR(g, px + 4, 0, GY - top, 8, Bl); for (let y = 12; y < GY - top; y += 10) box(g, px + 2, y, 4, 2, Bl[1]); }
    box(g, 0, 80, xb - xa, 6, dimmed(INK)); box(g, 0, 81, xb - xa, 4, DR(['#5E1E06', '#94360C', '#CC5A16', '#F2822A', '#FAAE64', '#FFD8AE'])[3]);
    for (let k = 0; k < 3; k++) { box(g, 11 + k * 36, 39, 32, 42, dimmed(INK)); planks(g, 12 + k * 36, 40, 30, 40, Cr, 8, true, k); signText(g, 'GC', 27 + k * 36, 64, stencil(dimmed('#1F2937'))); }
    box(g, -4, 0, xb - xa + 8, 10, INK); box(g, -2, 2, xb - xa + 4, 6, Or[3]); box(g, -2, 6, xb - xa + 4, 2, Or[1]);
    for (let x = 4; x < xb - xa; x += 16) box(g, x, 3, 2, 2, Or[5]);
    box(g, -2, 0, xb - xa + 4, 2, LIP);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// PUNCHY'S BIG TOP: a circus tent behind the cannon row (red and mustard stripes shaded round, a scalloped valance,
// flags, guy ropes and stakes, the flap tied back on the dark inside), the HUMAN CANNONBALL poster.

const bigTop = (c: Ctx) => {
  const cx = X(5900), w = 900, h = 300;
  still(c, 'pk-bigtop2', cx, 0, -w / 2 - 40, GY - h - 90, w + 80, h + 94, g => {
    const ink = dimmed(INK), R = DR(BLOOD), M = DR(MUSTARD), apex = GY - h - 40;
    const tent = () => { g.moveTo(-w / 2, GY); g.lineTo(-w / 2 + 60, GY - h * 0.55); g.lineTo(0, apex); g.lineTo(w / 2 - 60, GY - h * 0.55); g.lineTo(w / 2, GY); g.closePath(); };
    g.fillStyle = ink; g.beginPath(); tent(); g.fill();
    g.save(); g.beginPath(); g.moveTo(-w / 2 + 3, GY); g.lineTo(-w / 2 + 62, GY - h * 0.55 + 2); g.lineTo(0, apex + 4); g.lineTo(w / 2 - 62, GY - h * 0.55 + 2); g.lineTo(w / 2 - 3, GY); g.closePath(); g.clip();
    // (the stripes fanning from the apex, each lit or shaded by which way it faces: lit on the left, shade on the right)
    for (let k = -12; k < 12; k++) {
      const Rr = k % 2 ? R : M, side = (k + 0.5) / 12, step = side < -0.5 ? 4 : side < -0.1 ? 3 : side < 0.35 ? 3 : side < 0.7 ? 2 : 1;
      g.fillStyle = Rr[step]; g.beginPath(); g.moveTo(0, apex); g.lineTo(k * 60, GY); g.lineTo(k * 60 + 60, GY); g.closePath(); g.fill();
    }
    // (the canvas sags between the poles: darker bands across, dithered)
    for (const yy of [GY - h * 0.55, GY - h * 0.3]) { g.globalAlpha = 0.18; box(g, -w / 2, yy, w, 14, '#1A0A10'); g.globalAlpha = 1; checker(g, -w / 2, yy + 14, w, 2, R[1], 0, 2); }
    g.restore();
    // (the valance: scallops along the eaves, a fringe)
    for (let k = -w / 2 + 64; k < w / 2 - 64; k += 26) { const y = GY - h * 0.55 + 4; g.fillStyle = ink; g.beginPath(); g.arc(k + 13, y, 14, 0, Math.PI); g.fill(); g.fillStyle = (((k + w) / 26) | 0) % 2 ? R[3] : M[3]; g.beginPath(); g.arc(k + 13, y, 12, 0, Math.PI); g.fill(); box(g, k + 5, y + 1, 6, 2, M[5]); }
    // (the king pole's flag, two side poles' pennants)
    box(g, -2, apex - 44, 4, 48, ink); polyF(g, [[2, apex - 44], [34, apex - 36], [2, apex - 26]], R[3]); box(g, 2, apex - 44, 30, 2, R[4]);
    for (const s of [-1, 1]) { const px = s * (w / 2 - 60); box(g, px - 2, GY - h * 0.55 - 34, 4, 36, ink); polyF(g, [[px + 2, GY - h * 0.55 - 34], [px + 22, GY - h * 0.55 - 28], [px + 2, GY - h * 0.55 - 22]], M[3]); }
    // (the name board)
    box(g, -182, GY - h * 0.5 - 22, 364, 48, ink); plate(g, -180, GY - h * 0.5 - 20, 360, 44, DR(TAR), true);
    signText(g, "PUNCHY'S BIG TOP", 0, GY - h * 0.5 + 8, pkLetters(2, 23, true));
    // (the entrance: the flaps tied back, the dark inside, a ring's edge and a spotlight's glow in there)
    g.fillStyle = ink; g.beginPath(); g.moveTo(-70, GY); g.lineTo(-40, GY - 140); g.lineTo(40, GY - 140); g.lineTo(70, GY); g.closePath(); g.fill();
    g.fillStyle = '#0B0608'; g.beginPath(); g.moveTo(-60, GY); g.lineTo(-34, GY - 132); g.lineTo(34, GY - 132); g.lineTo(60, GY); g.closePath(); g.fill();
    g.fillStyle = R[2]; g.beginPath(); g.ellipse(0, GY - 6, 50, 6, 0, Math.PI, 0); g.fill();
    for (const s of [-1, 1]) { polyF(g, [[s * 40, GY - 140], [s * 70, GY], [s * 92, GY], [s * 60, GY - 70]], s < 0 ? M[3] : R[2]); box(g, s * 66 - 3, GY - 72, 6, 4, dimmed('#C8B48A')); }
    // (guy ropes out to stakes)
    g.strokeStyle = dimmed('#C8B48A'); g.lineWidth = 1;
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const ax = s * (w / 2 - 60 - k * 80), ay = GY - h * 0.55 + k * 18; g.beginPath(); g.moveTo(ax, ay); g.lineTo(s * (w / 2 + 20 - k * 50), GY); g.stroke(); box(g, s * (w / 2 + 20 - k * 50) - 2, GY - 6, 4, 6, dimmed('#8A5A2A')); }
    // (the poster: Punchy splattered on a brick wall)
    const pxx = -380, pyy = GY - 190;
    box(g, pxx, pyy, 110, 140, ink); box(g, pxx + 3, pyy + 3, 104, 134, dimmed('#FDE68A'));
    for (let y = pyy + 10; y < pyy + 90; y += 10) for (let x = pxx + 10 + ((y / 10) % 2) * 10; x < pxx + 100; x += 20) { box(g, x, y, 18, 8, dimmed('#B45309')); box(g, x, y, 18, 1, dimmed('#D97706')); }
    g.save(); g.translate(pxx + 55, pyy + 50); g.rotate(0.3); g.scale(1.2, 0.6); catHead(g, 0, 0, 20, 0); g.restore();
    gore(g, pxx + 55, pyy + 50, 12, 3, R);
    haze(g, pxx + 3, pyy + 3, 104, 134, 0.24);
    signText(g, 'HUMAN', pxx + 55, pyy + 108, small(dimmed('#B91C1C'), dimmed('#FDE68A')));
    signText(g, 'CANNONBALL!', pxx + 55, pyy + 120, small(dimmed('#B91C1C'), dimmed('#FDE68A')));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The blast range's back wall: poured concrete panels, scorched black in rings (dithered), chunks out of it and rebar
// showing, hazard stripes along its top, the bunker slit, sandbags at its foot, the sign, a poster.

const blastWall = (c: Ctx, v: View) => {
  const xa = X(6640), w = 560, top = Y(220), Cn = DR(CONCRETE);
  sideBack(c, v.eye, xa, -1, top - 12, GY, 1, SET_D, Cn, 3); sideBack(c, v.eye, xa + w, 1, top - 12, GY, 1, SET_D, Cn, 3);
  topBack(c, v.eye, xa, xa + w, top - 12, 1, SET_D, Cn, 2);
  still(c, 'pk-blastwall2', xa, 0, -10, top - 44, w + 20, GY - top + 48, g => {
    const ink = dimmed(INK), M = DR(MUSTARD), Sb = DR(['#4A3A22', '#6A5434', '#8E7650', '#B49A6E', '#D2BC90', '#EADAB4']);
    box(g, -2, top - 12, w + 4, GY - top + 12, ink);
    for (let x = 0; x < w; x += 70) { const pw = Math.min(68, w - x); box(g, x, top - 10, pw, GY - top + 10, Cn[3]); box(g, x, top - 10, 2, GY - top + 10, Cn[4]); box(g, x + pw - 3, top - 10, 3, GY - top + 10, Cn[1]); for (const ty of [top + 10, GY - 30]) for (const tx of [x + 10, x + pw - 14]) { g.fillStyle = Cn[1]; g.beginPath(); g.arc(tx, ty, 2, 0, Math.PI * 2); g.fill(); } }
    hazard(g, 0, top - 12, w, 10, M[3], dimmed('#1F1A24'));
    // (the scorch: rings of soot dithered out from where the TNT goes up)
    const sx = w - 60, sy = GY - 50;
    for (let k = 3; k >= 0; k--) { g.save(); g.beginPath(); g.arc(sx, sy, 60 + k * 32, 0, Math.PI * 2); g.clip(); const col = dimmed(['#1A1410', '#2A2018', '#3E3226', '#5A4C40'][k]); if (k === 3) checker(g, sx - 200, top - 10, 400, GY - top + 10, col, 0, 2); else { g.fillStyle = col; g.fillRect(sx - 200, top - 10, 400, GY - top + 10); checker(g, sx - 200, top - 10, 400, GY - top + 10, dimmed(['#2A2018', '#3E3226', '#5A4C40', '#5A4C40'][k]), 1, 2); } g.restore(); }
    // (chunks out of it, rebar)
    for (const [cx, cy] of [[w - 150, top + 30], [w - 40, top + 70], [w - 220, GY - 60]] as [number, number][]) { polyF(g, [[cx, cy], [cx + 18, cy + 4], [cx + 22, cy + 18], [cx + 4, cy + 22], [cx - 4, cy + 10]], dimmed('#2A2420')); g.strokeStyle = DR(RUST)[3]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx + 2, cy + 6); g.lineTo(cx + 20, cy + 14); g.moveTo(cx + 6, cy + 2); g.lineTo(cx + 10, cy + 20); g.stroke(); }
    // (the bunker slit, a periscope out of it)
    box(g, 300, top + 30, 120, 22, ink); box(g, 302, top + 32, 116, 18, dimmed('#0A0808')); box(g, 302, top + 32, 116, 3, Cn[1]); box(g, 346, top + 20, 6, 14, ink); box(g, 346, top + 16, 14, 6, ink);
    // (the sign)
    box(g, 38, top + 18, 224, 38, ink); box(g, 40, top + 20, 220, 34, M[3]); box(g, 40, top + 20, 220, 2, M[5]);
    for (let x = 42; x < 258; x += 20) polyF(g, [[x, top + 22], [x + 10, top + 22], [x, top + 32]], dimmed('#18181B'));
    signText(g, "KICKY'S BLAST RANGE", 150, top + 46, small(dimmed('#7F1D1D'), M[5]));
    // (sandbags heaped along its foot, each stepped)
    for (let r = 0; r < 2; r++) for (let x = 6 + r * 14; x < 240 - r * 20; x += 28) { eggR(g, x + 13, GY - 8 - r * 14, 14, 8, Sb, true); box(g, x + 4, GY - 10 - r * 14, 18, 1, Sb[2]); }
    pkPosterArt(g, 180, GY - 140, 3);
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The painted canyon: a sky cyc and plywood flats of red mesas and buttes back at the set's depth (braces showing at
// their edges, sandbags on them: a set), MOUSE MESA's title flat, cactus flats; the gorge cut across the floor: its far
// wall and its sides going down into the dark, the strata; on the play plane, the depths.

const CAN_A = 7150, CAN_B = 8700;
const canyonBack = (c: Ctx, v: View) => {
  const xa = X(CAN_A), w = X(CAN_B) - xa;
  stillAt(c, v, SET_BACK_D, 'pk-canyon2', xa, 0, -10, Y(470), w + 20, 474, g => {
    const ink = dimmed(INK);
    // (the cyc: a painted desert sky in bands, a painted sun with a face, painted clouds; its battens along the top)
    const skyCols = ['#F89A4A', '#FAB25A', '#FCC86E', '#FDDA86', '#FEE8A4', '#FFF2C4'].map(dimmed);
    for (let i = 0; i < skyCols.length; i++) { const y0 = Y(460) + i * 50; box(g, 0, y0, w, 52, skyCols[i]); if (i) checker(g, 0, y0 - 1, w, 2, skyCols[i], i % 2, 2); }
    box(g, 0, Y(470), w, 10, ink); box(g, 0, Y(468), w, 6, dimmed('#5A4A3A'));
    const sunx = w * 0.62, suny = Y(380);
    g.fillStyle = dimmed('#FDE047'); for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; polyF(g, [[sunx + Math.cos(a - 0.12) * 38, suny + Math.sin(a - 0.12) * 38], [sunx + Math.cos(a) * 58, suny + Math.sin(a) * 58], [sunx + Math.cos(a + 0.12) * 38, suny + Math.sin(a + 0.12) * 38]], dimmed('#FBBF24')); }
    ballR(g, sunx, suny, 34, DR(MUSTARD)); box(g, sunx - 14, suny - 6, 6, 6, ink); box(g, sunx + 8, suny - 6, 6, 6, ink); g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.arc(sunx, suny + 4, 14, 0.2, Math.PI - 0.2); g.stroke();
    for (const [cx, cy] of [[w * 0.18, Y(420)], [w * 0.4, Y(400)], [w * 0.86, Y(430)]] as [number, number][]) { for (const [dx, dy, r] of [[0, 0, 16], [18, -6, 20], [38, 0, 14]]) { g.fillStyle = dimmed('#FFF6E8'); g.beginPath(); g.arc(cx + dx, cy + dy, r, 0, Math.PI * 2); g.fill(); } box(g, cx - 16, cy + 4, 70, 8, dimmed('#FFF6E8')); box(g, cx - 16, cy + 10, 70, 2, dimmed('#F4D4B4')); }
    // (the flats: three rows of mesas, back to front, each stepped in strata, its plywood edge and a brace showing)
    const rows: [number, string, number][] = [[300, '#E8A87C', 0.62], [220, '#D97745', 0.78], [150, '#B4532A', 0.92]];
    rows.forEach(([hh, col, k], ri) => {
      const R = DC(col), topAt = (x: number) => { const m = hash(Math.floor(x / 170) + ri * 13); return GY - (m > 0.55 ? hh : hh * (0.45 + hash(Math.floor(x / 40) * 0.3 + ri) * 0.15)) * k; };
      g.fillStyle = ink; g.beginPath(); g.moveTo(0, GY); for (let x = 0; x <= w; x += 40) g.lineTo(x, topAt(x) - 3); g.lineTo(w, GY); g.closePath(); g.fill();
      for (let x = 0; x < w; x += 40) {
        const t0 = topAt(x), bandH = Math.max(8, (GY - t0) / 5);
        for (let b = 0; b < 5; b++) { const y0 = t0 + b * bandH; box(g, x, y0, 40, bandH + 1, R[[4, 3, 3, 2, 2][b]]); if (b) checker(g, x, y0 - 1, 40, 2, R[[4, 3, 3, 2, 2][b]], b % 2, 2); }
        box(g, x, t0, 40, 2, R[5]);
        if (hash(x * 0.7 + ri) > 0.6) box(g, x + 30, t0 + 6, 3, (GY - t0) * 0.6, R[1]);
      }
      // (a brace behind each flat's end, a sandbag on its foot)
      for (const bx of [24 + ri * 30, w - 90 - ri * 24]) { g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, topAt(bx) + 20); g.lineTo(bx + 46, GY); g.stroke(); g.strokeStyle = dimmed('#C8924A'); g.lineWidth = 4; g.stroke(); eggR(g, bx + 46, GY - 7, 14, 7, DC('#C8B48A'), true); }
    });
    // (cactus flats, the title flat)
    for (const [cx2, hh] of [[90, 90], [w * 0.36, 70], [w * 0.78, 100], [w - 60, 76]] as [number, number][]) {
      const G = DR(GRASSY);
      const cac = (x: number, y: number, ww: number, h2: number) => { box(g, x - ww / 2 - 1, y - h2 - 1, ww + 2, h2 + 1, ink); box(g, x - ww / 2, y - h2, ww, h2, G[3]); box(g, x - ww / 2, y - h2, 3, h2, G[4]); box(g, x + ww / 2 - 3, y - h2, 3, h2, G[2]); g.fillStyle = ink; g.beginPath(); g.arc(x, y - h2, ww / 2 + 1, Math.PI, 0); g.fill(); g.fillStyle = G[3]; g.beginPath(); g.arc(x, y - h2, ww / 2, Math.PI, 0); g.fill(); };
      cac(cx2, GY, 16, hh); cac(cx2 - 16, GY - hh * 0.45, 8, hh * 0.3); box(g, cx2 - 16, GY - hh * 0.45, 10, 8, G[3]); cac(cx2 + 16, GY - hh * 0.6, 8, hh * 0.25); box(g, cx2 + 6, GY - hh * 0.6, 10, 8, G[3]);
      for (let k = 0; k < 6; k++) box(g, cx2 - 4 + (k % 2) * 8, GY - hh + 10 + k * 12, 1, 2, G[5]);
    }
    const tx = w * 0.5, ty = Y(250);
    box(g, tx - 120, ty - 30, 240, 60, ink); box(g, tx - 118, ty - 28, 236, 56, dimmed('#8A4A1E')); box(g, tx - 118, ty - 28, 236, 3, dimmed('#B46A2E'));
    for (let k = 0; k < 4; k++) box(g, tx - 118, ty - 16 + k * 12, 236, 1, dimmed('#6A3412'));
    signText(g, 'MOUSE MESA', tx, ty + 6, { sx: 3, sy: 3, bold: true, serif: true, gap: 2, fill: [dimmed('#FFF0C8'), dimmed('#FDD47A'), dimmed('#E8A040')], ink, shadow: dimmed('#3A1A06'), drop: 2 });
    box(g, tx - 100, ty + 30, 6, GY - ty - 30, ink); box(g, tx + 94, ty + 30, 6, GY - ty - 30, ink);
    haze(g, 0, Y(470), w, 470, 0.08);
  });
};
/** The gorge going back: its far wall from the far rim down, its sides (banks) going back from the play plane. */
const gorgeBack = (c: Ctx, v: View) => {
  const a = X(CANYON[0]), b = X(CANYON[1]), R = DR(['#2A0E04', '#4A1A08', '#6E2A0E', '#9A3E16', '#C25A26', '#E07A3E']);
  const [fa, fy] = at(v.eye, a, GY, PIT_D), [fb] = at(v.eye, b, GY, PIT_D);
  const bottom = v.cam.y + 640;
  // (the far wall: strata banded down into the dark, ledges, dithered seams)
  const bands = [R[4], R[3], R[3], R[2], R[2], R[1], R[0]];
  for (let i = 0; i < bands.length; i++) { const y0 = fy + i * 22; box(c, fa, y0, fb - fa, (i === bands.length - 1 ? bottom - y0 : 23), bands[i]); if (i) checker(c, fa, y0 - 1, fb - fa, 2, bands[i], i % 2, 2); }
  for (let x = Math.ceil(fa / 46) * 46; x < fb; x += 46) { const hs = hash(x * 0.13); box(c, x, fy + 8 + hs * 40, 18 + hs * 20, 2, R[5]); box(c, x, fy + 10 + hs * 40, 18 + hs * 20, 1, R[1]); }
  box(c, fa, fy - 1, fb - fa, 2, R[5]);
  // (the banks' faces going back)
  sideBack(c, v.eye, a, 1, GY, bottom, 1, PIT_D, R, 3);
  sideBack(c, v.eye, b, -1, GY, bottom, 1, PIT_D, R, 3);
};
/** The gorge on the play plane: the depths, banded down into the dark; the banks' cut edges; a puff of dust now and
 *  then way down. */
const gorgeNear = (c: Ctx, state: GameState) => {
  const a = X(CANYON[0]), b = X(CANYON[1]), l = Math.max(a, state.camera.x - 40), r = Math.min(b, state.camera.x + 840);
  if (r <= l) return;
  const R = ['#1A0602', '#2A0E04', '#3E1606', '#5A2208'].map(s => hour(s));
  for (let i = 0; i < 4; i++) { box(c, l, GY + i * 40, r - l, 41, R[3 - i]); if (i) checker(c, l, GY + i * 40 - 1, r - l, 2, R[3 - i], i % 2, 2); }
  box(c, l, GY + 160, r - l, 600, R[0]);
  // (the strata: ledges lit along their lips, cracks, rocks stuck in the bands, a cartoon bone or two (the coyote's
  // last fall), roots off the top, each by its world column so nothing swims)
  const Lp = ['#7C2D12', '#9A3E16', '#C25A26', '#E07A3E'].map(s2 => hour(s2));
  for (let x = Math.floor(l / 52) * 52; x < r; x += 52) {
    const k = hash(x * 0.29), k2 = hash(x * 0.71 + 3), ly = GY + 18 + Math.floor(k * 4) * 34;
    box(c, x, ly, 22 + k2 * 24, 3, Lp[3 - Math.min(3, Math.floor((ly - GY) / 50))]); box(c, x, ly + 3, 22 + k2 * 24, 2, R[0]);
    if (k2 > 0.55) { const cy = GY + 30 + k * 90; c.strokeStyle = R[0]; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 30, cy); c.lineTo(x + 34, cy + 9); c.lineTo(x + 31, cy + 16); c.lineTo(x + 36, cy + 26); c.stroke(); }
    if (k > 0.6) { const rx = x + 10 + k2 * 20, ry = GY + 54 + k2 * 60; c.fillStyle = R[0]; c.beginPath(); c.ellipse(rx, ry, 7, 5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = Lp[1]; c.beginPath(); c.ellipse(rx - 1, ry - 1, 5, 3.5, 0, 0, Math.PI * 2); c.fill(); box(c, rx - 3, ry - 3, 2, 1, Lp[3]); }
    if (k < 0.12) { const bx = x + 14, by = GY + 100 + k2 * 30; box(c, bx, by, 16, 3, hour('#E8E0CC')); for (const ex of [bx - 3, bx + 15]) { box(c, ex, by - 2, 4, 3, hour('#F4EEDC')); box(c, ex, by + 2, 4, 3, hour('#D8CEB4')); } }
    if (k2 < 0.3) for (let j = 0; j < 3; j++) { c.strokeStyle = hour('#4A2A10'); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 6 + j * 5, GY + 2); c.quadraticCurveTo(x + 2 + j * 7, GY + 12, x + 8 + j * 4, GY + 18 + j * 5); c.stroke(); }
  }
  for (const [ex, s] of [[a, 1], [b, -1]] as [number, number][]) {
    if (ex < l - 30 || ex > r + 30) continue;
    c.fillStyle = INK; c.beginPath(); c.moveTo(ex, GY); c.lineTo(ex + s * 18, GY + 120); c.lineTo(ex + s * 6, GY + 260); c.lineTo(ex - s * 6, GY + 260); c.lineTo(ex - s * 6, GY); c.closePath(); c.fill();
    c.fillStyle = hour('#B4532A'); c.beginPath(); c.moveTo(ex - s * 2, GY + 2); c.lineTo(ex + s * 14, GY + 120); c.lineTo(ex + s * 2, GY + 260); c.lineTo(ex - s * 6, GY + 260); c.lineTo(ex - s * 6, GY + 2); c.closePath(); c.fill();
    for (let y = GY + 10; y < GY + 240; y += 18) box(c, ex - s * 6 + (s > 0 ? 0 : -6), y, 6 + Math.abs(14 * (1 - (y - GY) / 260)), 2, hour('#7C2D12'));
  }
  const t = (state.frame % 300) / 300;
  if (t < 0.25) { const px = (a + b) / 2 + Math.sin(state.frame * 0.001) * 200, k = t / 0.25; c.fillStyle = `rgba(200,140,100,${0.4 * (1 - k)})`; c.beginPath(); c.arc(px, GY + 200, 6 + k * 10, 0, Math.PI * 2); c.fill(); }
};
/** The canyon's rim rocks and the set's crate steps (solid, lit along the top). */
const steps = (c: Ctx, state: GameState, v: View) => {
  for (const [a, b, h] of ROCKS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onScreen(state, xa - 120, xb + 120)) continue;
    boxSides(c, v.eye, xa, xb, top, GY, 0.93, NR(['#3A1606', '#5E260C', '#8A3A14', '#C2410C', '#E0703A', '#F4A070']), { lines: Array.from({ length: Math.floor(h / 22) }, (_, k) => top + 22 + k * 22).filter(y => y < GY - 4) });
    still(c, `pk-rock-${a}`, xa, top, -8, -4, xb - xa + 16, h + 8, g => {
      const R = NR(['#3A1606', '#5E260C', '#8A3A14', '#C2410C', '#E0703A', '#F4A070']), w2 = xb - xa;
      g.fillStyle = INK; g.beginPath(); g.moveTo(-4, h); g.lineTo(0, 8); g.lineTo(10, 0); g.lineTo(w2 - 8, 0); g.lineTo(w2, 10); g.lineTo(w2 + 4, h); g.closePath(); g.fill();
      g.save(); g.beginPath(); g.moveTo(-1, h); g.lineTo(3, 9); g.lineTo(11, 3); g.lineTo(w2 - 9, 3); g.lineTo(w2 - 3, 11); g.lineTo(w2 + 1, h); g.closePath(); g.clip();
      for (let y = 0; y < h; y += 22) { const k = Math.min(3, Math.floor(y / 30)); box(g, -4, y, w2 + 8, 22, R[3 - k]); box(g, -4, y, w2 + 8, 2, R[4 - Math.min(1, k)]); checker(g, -4, y + 20, w2 + 8, 2, R[2 - Math.min(2, k)], 0, 2); }
      box(g, -4, 0, 12, h, R[4]); box(g, w2 - 10, 0, 14, h, R[1]);
      for (const [cx, cy] of [[20, 40], [60, 80], [40, 100]]) { g.strokeStyle = R[0]; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 6, cy + 8); g.lineTo(cx + 2, cy + 16); g.stroke(); }
      g.restore();
      box(g, 8, 0, w2 - 16, 2, LIP); box(g, 10, 2, w2 - 20, 1, LIPR[1]);
    });
  }
  for (const [a, b, h] of SET_STEPS) {
    const xa = X(a), xb = X(b), top = Y(h);
    if (!onScreen(state, xa - 120, xb + 120)) continue;
    boxSides(c, v.eye, xa, xb, top, GY, 0.93, NR(TAR), { lines: [top + 8, GY - 20] });
    still(c, `pk-setstep-${a}`, xa, top, -2, -2, xb - xa + 4, h + 4, g => {
      const K = NR(TAR), w2 = xb - xa;
      box(g, 0, 0, w2, h, INK); plate(g, 2, 2, w2 - 4, h - 3, K, true);
      box(g, 2, 2, w2 - 4, 6, K[4]);
      signText(g, 'STAGE 9', w2 / 2, 24, stencil(hour('#D4D4D8')));
      signText(g, 'P&K LIVE', w2 / 2, 38, stencil(hour('#DC2626')));
      for (let y = 50; y < h - 6; y += 30) { box(g, 4, y, w2 - 8, 2, K[1]); box(g, 4, y + 2, w2 - 8, 1, K[5]); }
      for (const cx of [6, w2 - 14]) { box(g, cx, 8, 8, 8, hour('#A1A1AA')); box(g, cx, 8, 8, 2, hour('#E4E4E7')); box(g, cx, h - 14, 8, 8, hour('#A1A1AA')); }
      box(g, 4, h - 20, w2 - 8, 4, hour('#E8B424'));
      box(g, 0, 0, w2, 2, LIP);
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The live show's soundstage: velour drapes back at the set's depth (folds banded), the cartoon house flat, a tree flat,
// the stage's black boards, the lighting grid and its cans overhead, the APPLAUSE sign, the fly rail (the fuse runs along
// it); the floor of portable holes.

const STAGE_A = 8700, STAGE_B = 9790;
const soundstageBack = (c: Ctx, v: View) => {
  const xa = X(STAGE_A), w = X(STAGE_B) - xa;
  stillAt(c, v, SET_BACK_D, 'pk-stage2', xa, 0, -10, Y(520), w + 20, 524, g => {
    const ink = dimmed(INK), Vl = DR(VELOUR);
    // (the drapes: velour folds in steps, a header across the top with its fringe)
    for (let x = 0; x < w; x += 24) { box(g, x, Y(470), 24, 470, Vl[2]); box(g, x + 2, Y(470), 6, 470, Vl[4]); box(g, x + 8, Y(470), 6, 470, Vl[3]); box(g, x + 18, Y(470), 6, 470, Vl[1]); box(g, x + 22, Y(470), 2, 470, Vl[0]); }
    box(g, 0, Y(520), w, 54, dimmed('#120408')); for (let x = 0; x < w; x += 60) { g.fillStyle = Vl[3]; g.beginPath(); g.moveTo(x, Y(470)); g.quadraticCurveTo(x + 30, Y(450), x + 60, Y(470)); g.lineTo(x + 60, Y(472)); g.quadraticCurveTo(x + 30, Y(456), x, Y(472)); g.closePath(); g.fill(); }
    for (let x = 0; x < w; x += 4) box(g, x, Y(468), 2, 8, DR(MUSTARD)[3]);
    // (the house flat: a crooked cartoon house front, its roof, a door, a window with a cracked pane, a mousehole)
    const hx = 330, hw = 300, M = DR(MUSTARD), R = DR(BLOOD);
    g.save(); g.translate(hx + hw / 2, GY); g.rotate(-0.02);
    box(g, -hw / 2 - 2, -282, hw + 4, 282, ink); bandsDown(g, () => g.rect(-hw / 2, -280, hw, 280), -hw / 2, -280, hw, 280, [M[4], M[3], M[3], M[2]]);
    for (let y = -270; y < -10; y += 16) box(g, -hw / 2, y, hw, 1, M[2]);
    polyF(g, [[-hw / 2 - 22, -278], [0, -372], [hw / 2 + 22, -278]], ink); polyF(g, [[-hw / 2 - 14, -282], [0, -364], [hw / 2 + 14, -282]], R[3]);
    for (let k = 0; k < 6; k++) { const y = -290 - k * 13, f0 = (y + 364) / 82; box(g, -(hw / 2 + 14) * f0, y, (hw + 28) * f0, 2, R[k % 2 ? 2 : 4]); }
    box(g, 90, -340, 24, 50, ink); box(g, 92, -338, 20, 48, R[2]);
    box(g, -hw / 2 + 38, -152, 74, 152, ink); box(g, -hw / 2 + 41, -149, 68, 149, DR(PLY)[2]); for (let k = 0; k < 3; k++) box(g, -hw / 2 + 47 + k * 20, -140, 16, 130, DR(PLY)[3]); ballR(g, -hw / 2 + 98, -72, 4, DR(MUSTARD));
    box(g, 20, -222, 94, 74, ink); box(g, 23, -219, 88, 68, dimmed('#BAE6FD')); box(g, 66, -219, 3, 68, ink); box(g, 23, -186, 88, 3, ink);
    g.strokeStyle = ink; g.lineWidth = 1; g.beginPath(); g.moveTo(30, -214); g.lineTo(44, -200); g.lineTo(40, -190); g.moveTo(44, -200); g.lineTo(56, -204); g.stroke();
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(70, 0, 20, 26, 0, Math.PI, 0); g.fill(); g.strokeStyle = M[1]; g.lineWidth = 2; g.beginPath(); g.ellipse(70, 0, 22, 28, 0, Math.PI, 0); g.stroke();
    gore(g, -30, -200, 14, 9, R); drips(g, -40, -20, -190, 9, R, 3, 30);
    g.restore();
    // (the brace behind the flat's edge, a stage weight; a tree flat; road cases; TAPING TODAY on an easel)
    g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(hx + hw, Y(200)); g.lineTo(hx + hw + 50, GY); g.stroke(); g.strokeStyle = DR(PLY)[3]; g.lineWidth = 3; g.stroke();
    box(g, hx + hw + 40, GY - 10, 22, 10, ink); box(g, hx + hw + 41, GY - 9, 20, 8, dimmed('#3F3F46'));
    { const tx = 120, G = DR(GRASSY); box(g, tx - 8, Y(160), 16, 160, ink); box(g, tx - 6, Y(160), 12, 160, DR(PLY)[2]); for (const [dx, dy, r] of [[0, -200, 50], [-40, -170, 34], [40, -168, 34], [0, -240, 34]] as [number, number, number][]) eggR(g, tx + dx, GY + dy, r, r * 0.8, G, true); }
    for (const [rx, rh] of [[720, 60], [770, 44], [860, 70]] as [number, number][]) { box(g, rx - 1, GY - rh - 1, 46, rh + 1, ink); plate(g, rx, GY - rh, 44, rh, DR(TAR), true); box(g, rx + 4, GY - rh + 8, 36, 2, DR(STEELP)[4]); box(g, rx, GY - rh / 2, 44, 3, DR(STEELP)[3]); }
    box(g, 940, Y(130), 70, 46, ink); box(g, 942, Y(128), 66, 42, dimmed('#F4F0EC')); signText(g, 'TAPING', 975, Y(112), small(dimmed('#B91C1C'), dimmed('#F4F0EC'))); signText(g, 'TODAY', 975, Y(100), small(dimmed('#1F1A24'), dimmed('#F4F0EC'))); g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); g.moveTo(950, Y(84)); g.lineTo(940, GY); g.moveTo(1000, Y(84)); g.lineTo(1010, GY); g.stroke();
    // (the APPLAUSE sign's box up in the grid (its letters lit live))
    box(g, 558, Y(442), 154, 38, ink); plate(g, 560, Y(440), 150, 34, DR(TAR), true); box(g, 566, Y(434), 138, 22, dimmed('#2A0A0A'));
  });
};
/** The stage's live bits: the APPLAUSE sign (blinking), the lighting grid and its cans, the fly rail (the fuse runs
 *  along it). */
const soundstageNear = (c: Ctx, v: View, state: GameState) => {
  const xa = X(STAGE_A), w = X(STAGE_B) - xa, on = (state.frame >> 5) % 2 === 0;
  const [ax, ay] = at(v.eye, xa + 635, Y(420), SET_BACK_D);
  signText(c, 'APPLAUSE', ax, ay, { sx: 1, sy: 2, bold: true, fill: on ? ['#FFFFFF', '#FECACA'] : dimmed('#7F1D1D'), ink: INK, glow: on ? '#F87171' : undefined });
  // (the lighting grid: a pipe, cans hung off it, stepped; their glow after dark)
  still(c, `pk-grid-${lit() ? 1 : 0}`, xa, 0, -10, Y(410), w + 20, 40, g => {
    const S = DR(STEELP), K = DR(TAR);
    box(g, 0, Y(400), w, 6, dimmed(INK)); box(g, 0, Y(399), w, 2, S[4]);
    for (let x = 30; x < w; x += 90) {
      box(g, x, Y(394), 4, 8, dimmed(INK));
      box(g, x - 9, Y(386), 22, 20, dimmed(INK)); box(g, x - 8, Y(385), 20, 18, K[3]); box(g, x - 8, Y(385), 4, 18, K[4]); box(g, x + 8, Y(385), 4, 18, K[1]);
      box(g, x - 6, Y(368), 16, 3, lit() ? '#FFF0C0' : S[3]);
      box(g, x - 9, Y(380), 3, 6, S[5]);
    }
  });
  const fz = FUSES[1], rail = Y(fz.pts[0][1]);
  box(c, X(fz.pts[1][0]) - 20, rail + 3, X(fz.pts[0][0]) - X(fz.pts[1][0]) + 60, 7, INK);
  box(c, X(fz.pts[1][0]) - 18, rail + 4, X(fz.pts[0][0]) - X(fz.pts[1][0]) + 56, 4, hour('#71717A')); box(c, X(fz.pts[1][0]) - 18, rail + 4, X(fz.pts[0][0]) - X(fz.pts[1][0]) + 56, 1, hour('#C4CCD6'));
  for (const rx of [fz.pts[1][0] - 10, fz.pts[0][0] + 30]) { box(c, X(rx), Y(460), 4, 460 - fz.pts[0][1] - 3, dimmed(INK)); box(c, X(rx) + 1, Y(460), 1, 460 - fz.pts[0][1] - 3, dimmed('#71717A')); }
};
/** The floor of portable holes going back (from the first of them to the play plane): black, a few dozen laid over each
 *  other, sheen on their rims. */
const holesBack = (c: Ctx, v: View) => {
  const a = X(HOLES[0]), b = X(HOLES[1]);
  polyF(c, [at(v.eye, a, GY, HOLE_D), at(v.eye, b, GY, HOLE_D), at(v.eye, b, GY, 1), at(v.eye, a, GY, 1)], '#050505');
  c.strokeStyle = 'rgba(150,150,200,0.45)'; c.lineWidth = 1;
  for (let x = a + 20; x < b - 10; x += 34) {
    const d = HOLE_D + (1 - HOLE_D) * hash(x * 0.3), [px, py] = at(v.eye, x, GY, d), rw = (16 + hash(x) * 10) * d;
    c.beginPath(); c.ellipse(px, py, rw, 2 + hash(x * 2) * 1.5, 0, Math.PI * 1.05, Math.PI * 1.85); c.stroke();
  }
};
const holeFloor = (c: Ctx, state: GameState) => {
  const a = X(HOLES[0]), b = X(HOLES[1]);
  const l = Math.max(a, state.camera.x - 40), r = Math.min(b, state.camera.x + 840);
  if (r <= l) return;
  box(c, l, GY - 2, r - l, 600, '#050505');
  for (let x = a + 30; x < b - 20; x += 46) {
    if (x < l - 50 || x > r + 50) continue;
    for (const [dy, s] of [[1, 1], [40, 1.5], [110, 2.2]] as [number, number][]) {
      const ry = (8 + hash(x + dy) * 4) * s, w = (40 + hash(x * 2 + dy) * 14) * s, xx = x + (hash(x + dy * 3) - 0.5) * 30;
      c.strokeStyle = `rgba(150,150,200,${0.5 - dy * 0.002})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(xx, GY + dy, w / 2, ry, 0, Math.PI * 1.05, Math.PI * 1.8); c.stroke();
      c.strokeStyle = 'rgba(220,220,255,0.35)'; c.beginPath(); c.ellipse(xx, GY + dy, w / 2 - 2, ry - 1, 0, Math.PI * 1.2, Math.PI * 1.4); c.stroke();
    }
  }
  for (const [ex, s] of [[a, 1], [b, -1]] as [number, number][]) { if (!onScreen(state, ex - 30, ex + 30)) continue; c.fillStyle = '#050505'; c.beginPath(); c.ellipse(ex + s * 6, GY + 1, 18, 7, 0, 0, Math.PI * 2); c.fill(); }
};

/** What the towers stand on over the pits (all below the line: nothing there to stand on): in the gorge a stack of
 *  painted rock going down into the dark; over the holes, a stage lift's steel column going down through them. */
const towerFeet = (c: Ctx, state: GameState) => {
  for (const d of TOWERS) {
    if (!onScreen(state, d.x - 40, d.x + 40)) continue;
    const gorge = d.x > X(CANYON[0]) && d.x < X(CANYON[1]);
    if (gorge) {
      const R = NR(['#2A0E04', '#4A1A08', '#6E2A0E', '#9A3E16', '#C25A26', '#E07A3E']);
      for (let k = 0; k < 6; k++) {
        const y = GY + k * 34, w = 34 - k * 3 + (k % 2) * 6, sh = Math.min(3, k);
        box(c, d.x - w / 2 - 1, y, w + 2, 35, INK); box(c, d.x - w / 2, y, w, 34, R[4 - Math.min(3, sh)]);
        box(c, d.x - w / 2, y, 4, 34, R[5 - Math.min(4, sh)]); box(c, d.x + w / 2 - 6, y, 6, 34, R[Math.max(0, 2 - sh)]); box(c, d.x - w / 2, y + 32, w, 2, R[0]);
      }
      c.fillStyle = 'rgba(20,6,2,0.5)'; c.fillRect(d.x - 30, GY + 140, 60, 80);
    } else {
      const S = NR(STEELP);
      postR(c, d.x, GY, GY + 300, 16, S);
      for (let y = GY + 20; y < GY + 300; y += 30) { box(c, d.x - 9, y, 18, 3, S[1]); box(c, d.x - 9, y, 18, 1, S[5]); }
      c.fillStyle = 'rgba(5,5,5,0.6)'; c.fillRect(d.x - 12, GY + 120, 24, 200);
    }
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The DAD MAN LIVE! gate at the end: two blue pillars with mustard bands (their sides going back), the board with
// the show's dad on it, THE AMPHITHEATER >.

const exitGate = (c: Ctx, v: View) => {
  const cx = X(EXIT_GATE), w = 300, top = Y(330), Bl = DC('#1E3A8A');
  for (const s of [-1, 1]) { sideBack(c, v.eye, cx + s * w / 2 - 20, -1, top, GY, 1, SET_D, Bl, 3); sideBack(c, v.eye, cx + s * w / 2 + 20, 1, top, GY, 1, SET_D, Bl, 3); }
  topBack(c, v.eye, cx - w / 2 - 30, cx + w / 2 + 30, top - 110, 1, SET_D, DC('#7C3AED'), 2);
  still(c, 'pk-exitgate2', cx, 0, -w / 2 - 40, top - 124, w + 80, GY - top + 128, g => {
    const ink = dimmed(INK), M = DR(MUSTARD), P = DC('#7C3AED');
    for (const s of [-1, 1]) {
      const px = s * w / 2;
      box(g, px - 20, top, 40, GY - top, ink); shadeAcross(g, () => g.rect(px - 17, top + 3, 34, GY - top - 3), px - 17, top + 3, 34, GY - top - 3, Bl);
      for (let y = top + 20; y < GY; y += 40) { box(g, px - 17, y, 34, 6, M[3]); box(g, px - 17, y, 34, 1, M[5]); box(g, px - 17, y + 5, 34, 1, M[1]); }
      box(g, px - 24, GY - 14, 48, 14, ink); box(g, px - 22, GY - 12, 44, 12, Bl[2]); box(g, px - 22, GY - 12, 44, 2, Bl[4]);
    }
    box(g, -w / 2 - 30, top - 110, w + 60, 112, ink);
    bandsDown(g, () => g.rect(-w / 2 - 27, top - 107, w + 54, 106), -w / 2 - 27, top - 107, w + 54, 106, [P[4], P[3], P[3], P[2], P[1]]);
    g.save(); g.beginPath(); g.rect(-w / 2 - 27, top - 107, w + 54, 106); g.clip(); dadArt(g, -w / 2 + 40, top + 2, 1.15, 0.18, '#7C3AED'); g.restore();
    for (let k = 0; k < 14; k++) { const bx = -w / 2 - 24 + k * (w + 48) / 13; box(g, bx, top - 110, 4, 4, lit() && k % 2 ? '#FFF0B0' : M[4]); box(g, bx, top - 2, 4, 4, lit() && k % 2 === 0 ? '#FFF0B0' : M[4]); }
    signText(g, 'DAD MAN', 50, top - 80, { sx: 2, sy: 2, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FDE047'), dimmed('#F59E0B')], ink, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'LIVE!', 50, top - 50, { sx: 3, sy: 3, bold: true, slant: 1, fill: [dimmed('#FFFFFF'), dimmed('#FB7185'), dimmed('#DC2626')], ink, shadow: dimmed('#3B0764'), drop: 2 });
    signText(g, 'THE AMPHITHEATER >', 50, top - 16, small(dimmed('#A3E635'), ink));
  });
};

// ---------------------------------------------------------------------------------------------------------------
// The ground: the path's edge painted blood red, lit along its top; the cream pavers coming toward him (scanline-bent),
// chalk outlines of a cat and a mouse, splats, red paw prints, a painted bone; the lawn's grass.

const pavers = (c: Ctx) => tilePattern(c, `ct-pk-pavers-${timeOfDay().key}`, 96, 48, g => {
  const C = NR(CREAM);
  box(g, 0, 0, 96, 48, C[1]);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
    const x = k * 32 + (r ? 16 : 0), y = r * 24;
    for (const ox of [0, -96]) {
      const xx = x + ox; const tone = C[2 + ((k + r) % 2)];
      box(g, xx + 1, y + 1, 30, 22, tone); box(g, xx + 1, y + 1, 30, 2, C[4]); box(g, xx + 1, y + 1, 2, 22, C[4]); box(g, xx + 1, y + 21, 30, 2, C[1]); box(g, xx + 29, y + 1, 2, 22, C[1]);
      box(g, xx + 6 + ((k * 7) % 14), y + 8 + r * 3, 2, 1, C[0]);
    }
  }
});
const ground = (c: Ctx, state: GameState, v: View) => {
  const L = state.camera.x - 40, Rr = state.camera.x + 840, Rd = NR(BLOOD);
  for (const [ga, gb] of GROUND) {
    const a = X(ga === GROUND[0][0] ? ga - 700 : ga), b = X(gb === GROUND[GROUND.length - 1][1] ? gb + 700 : gb), s = Math.max(a, L), e = Math.min(b, Rr);
    if (e <= s) continue;
    box(c, s, GY, e - s, 700, hour('#8A7A60'));
    c.fillStyle = pavers(c); c.fillRect(s, GY + 10, e - s, 600);
    // (on the pavers: chalk outlines, splats, paw prints and mouse tracks, a painted bone)
    for (let x = Math.floor(s / 700) * 700 + 300; x < e; x += 700) { if (x < a + 40 || x > b - 60) continue; chalk(c, x, GY + 40 + ((x / 700) % 2) * 20, (x / 700) % 2, 'rgba(255,255,255,0.85)'); gore(c, x + 40, GY + 48, 4, x, Rd); }
    for (let x = Math.floor(s / 90) * 90; x < e; x += 90) { const hs = hash(x * 0.07); if (hs > 0.6) gore(c, x + hs * 50, GY + 20 + hs * 60, 3 + hs * 3, x, Rd); else if (hs < 0.12) for (let k = 0; k < 4; k++) { c.fillStyle = Rd[2]; c.beginPath(); c.ellipse(x + k * 12, GY + 30 + (k % 2) * 6, 3, 2, 0, 0, Math.PI * 2); c.fill(); for (let j = 0; j < 3; j++) box(c, x + k * 12 - 3 + j * 3, GY + 26 + (k % 2) * 6, 1, 1, Rd[2]); } }
    for (let x = Math.floor(s / 1300) * 1300 + 900; x < e; x += 1300) bone(c, x, GY + 70, x + 30, GY + 76, 4, NR(BONE));
    bendFloor(c, v.eye, GY, GY, GY + 150, a, b);
    // (the edge: painted blood red, lit along its top, its face shaded, drips over the lip)
    box(c, s, GY, e - s, 10, INK);
    box(c, s, GY + 1, e - s, 8, Rd[3]); box(c, s, GY + 6, e - s, 3, Rd[1]);
    for (let x = Math.floor(s / 48) * 48; x < e; x += 48) { box(c, x, GY + 1, 1, 8, Rd[0]); if (hash(x * 0.3) > 0.55) { const dx = x + 10 + hash(x) * 20, l = 4 + hash(x * 2) * 8; box(c, dx, GY + 9, 3, l, Rd[2]); box(c, dx - 1, GY + 8 + l, 5, 3, Rd[2]); } }
    box(c, s, GY, e - s, 2, LIPR[2]); box(c, s, GY, e - s, 1, LIPR[3]);
  }
  // (the lawn: a strip of cartoon grass along the path, stepped tufts, a few flowers, a pink flamingo with a cleaver in it)
  const la = X(LAWN[0]), lb = X(LAWN[1]);
  if (onScreen(state, la, lb)) {
    const G = NR(GRASSY);
    box(c, la, GY - 4, lb - la, 6, G[3]); box(c, la, GY - 4, lb - la, 2, G[4]); box(c, la, GY + 1, lb - la, 1, G[1]);
    for (let x = la + 6; x < lb; x += 10) { const hh = 8 + hash(x) * 6; c.fillStyle = G[(x / 10) % 2 ? 2 : 3]; c.beginPath(); c.moveTo(x, GY - 2); c.lineTo(x + 3, GY - hh); c.lineTo(x + 6, GY - 2); c.closePath(); c.fill(); box(c, x + 2, GY - hh + 2, 1, 2, G[5]); }
    for (let x = la + 40; x < lb; x += 130) { box(c, x, GY - 12, 1, 10, G[1]); box(c, x - 2, GY - 15, 5, 4, hour(['#F472B6', '#FDE047', '#FFFFFF'][((Math.floor(x / 130) % 3) + 3) % 3])); box(c, x - 1, GY - 14, 3, 2, hour('#FFFFFF')); }
  }
};

// ---------------------------------------------------------------------------------------------------------------

export const drawItchyBack = (c: Ctx, state: GameState, revisit: boolean) => {
  const v = viewOf(state);
  drawAlley(c, v);
  drawFronts(c, v);
  if (onV(v, X(CAN_A) - 200, X(CAN_B) + 200)) canyonBack(c, v);
  if (onV(v, X(STAGE_A) - 200, X(STAGE_B) + 200)) soundstageBack(c, v);
  drawPath(c, v);
  if (onV(v, X(CANYON[0]) - 120, X(CANYON[1]) + 120)) gorgeBack(c, v);
  if (onV(v, X(HOLES[0]) - 60, X(HOLES[1]) + 60)) holesBack(c, v);
  drawFurniture(c, v);
  // (DAD MAN's own, taped up on the drapes: the live show's next)
  for (const [px, look] of [[9600, 'live'], [9700, 'faded']] as [number, 'live' | 'faded'][]) if (onV(v, X(px) - 80, X(px) + 80)) { const [sx, sy] = at(v.eye, X(px), Y(20), SET_BACK_D); c.save(); c.translate(sx, sy); c.scale(SET_BACK_D, SET_BACK_D); poster(c, 0, 0, look, true); c.restore(); }
  // (the set pieces behind the play plane, each with its sides going back)
  if (onV(v, X(420) - 320, X(420) + 320)) boneArch(c, v, X(420));
  if (onV(v, X(MERCH.a) - 80, X(MERCH.b) + 80)) { merchStand(c, v); jumbotron(c, v, state); }
  if (onV(v, X(KILLORAMA.a) - 60, X(KILLORAMA.b) + 60)) killorama(c, v, state, revisit);
  if (onV(v, X(4280) - 40, X(5360) + 40)) warehouse(c, v);
  if (onV(v, X(5450) - 20, X(6350) + 40)) bigTop(c);
  if (onV(v, X(6640) - 40, X(7200) + 40)) blastWall(c, v);
  if (onV(v, X(STAGE_A) - 60, X(STAGE_B) + 60)) soundstageNear(c, v, state);
  if (onV(v, X(EXIT_GATE) - 240, X(EXIT_GATE) + 240)) exitGate(c, v);
  for (const lx of LAMPS) if (onScreen(state, X(lx) - 30, X(lx) + 30)) lampPost(c, X(lx));
  gorgeNear(c, state);
  holeFloor(c, state);
  towerFeet(c, state);
  ground(c, state, v);
  rack(c, v);
  steps(c, state, v);
};
/** The signs: last of everything behind him (nothing of the machinery's ever over one). */
export const drawItchySigns = (c: Ctx, state: GameState) => {
  for (const [x, h, lines, board] of SIGNS) if (onScreen(state, X(x) - 200, X(x) + 200)) pkSign(c, X(x), Y(h), lines, board);
};

export const itchyLamps = (state: GameState): Light[] => {
  if (timeOfDay().lamps < 0.05) return [];
  const v = viewOf(state), out = backLamps(v);
  for (const lx of LAMPS) { const x = X(lx); if (x > state.camera.x - 200 && x < state.camera.x + 1000) out.push({ x, y: GY - 172, r: 110, a: 0.45, color: '#FDBA74' }); }
  const kx = X(KILLORAMA.doors);
  if (kx > state.camera.x - 400 && kx < state.camera.x + 1200) out.push({ x: kx, y: Y(330), r: 260, a: 0.4, color: '#FCA5A5' });
  return out;
};

const onScreen = (state: GameState, x0: number, x1: number, m = 60) => x1 > state.camera.x - m && x0 < state.camera.x + 800 + m;
void mix; void checker; void RUST; void DC; void PLY; void hazard;
