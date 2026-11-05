// MEHPHISTO, drawn: Satan's other son. The opposite of his punk brother BRATHAZAR (spooky/hell/demon.ts: big, loud,
// spiked, standing tall to be seen): a long drink of nothing, slouched so far forward his head's out past his chest,
// arms hanging to his knees. A goth stoner: the skin a sickly lavender-gray (he's never been outside in his life, and
// he lives in hell), greasy black hair down over one eye, two little horns poking up through it like they're
// embarrassed to be there (his brother's are big and studded); half-lidded red eyes, bloodshot, in rings of smudged
// eyeliner over bags you could keep change in; a hooked nose with a pimple on it, black lipstick, a lip ring, a
// gauge in his pointed ear, a joint tucked behind it; a few hairs on his chin he calls a goatee. A long black leather
// trench coat, too big, burn holes in it, its hem in tatters; a band tee (a dripping red sigil), skinny black jeans
// on chains, platform boots; black nails, rings on every finger; a demon tail drooping out the back of the coat,
// its spade dragging on the floor.
//
// About 150 tall, feet at the origin, facing right; every elbow and knee from art/limb.ts. Painted at boss grade
// (ramps of light, base, shade, deep, line, stepped with a dithered seam: cartoon/amphi/paint.ts). Stamped per pose and
// frame; the live bits (the eyes' glow when he's trying, the vape's tip, the horns heating) over it.

import { stamp } from '../../../m1/game/render/stamp';
import { elbow, knee, reachTo } from '../../art/limb';
import { type Ramp, shape, limb as tube, ell, px, line, dith } from '../../cartoon/amphi/paint';
import { FIRE } from './fire';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const TAU = Math.PI * 2;

const SKIN: Ramp = ['#ECE4F0', '#CFC4D6', '#AEA0B8', '#8A7A96', '#2A1E34'];
const SKIN_F: Ramp = ['#C8BCD0', '#AEA0B8', '#8E809C', '#6E6080', '#1A1224'];
const COAT: Ramp = ['#4A4452', '#2A2630', '#1C1A22', '#121016', '#030204'];
const COAT_F: Ramp = ['#34303C', '#1E1C24', '#141218', '#0C0A10', '#020102'];
const TEE: Ramp = ['#5A5660', '#3A3840', '#2A282E', '#1E1C22', '#08070A'];
const JEAN: Ramp = ['#3A3842', '#24222A', '#1A1820', '#121016', '#040306'];
const JEAN_F: Ramp = ['#2A2830', '#1A1820', '#121016', '#0C0A0E', '#020103'];
const BOOT: Ramp = ['#4A4650', '#22202A', '#16141C', '#0E0C12', '#020103'];
const HAIR: Ramp = ['#4A4058', '#1E1828', '#14101C', '#0C0812', '#020104'];
const HORN: Ramp = ['#F4EADC', '#D6C8B0', '#A8987C', '#6E5E46', '#1A1208'];
const TAIL: Ramp = ['#B05A6A', '#7A2A3C', '#5A1A2A', '#3A0E1A', '#120408'];
const METAL = ['#E8E8EE', '#A8A8B4', '#6A6A78', '#2A2A34'];
const LINER = '#0A0610', BAG = '#7A6A8A', EYE_W = '#F2E6E0', EYE_R = '#C8283A', PIMPLE = '#D85A6A', LIPS = '#141018';

export type SonPose = 'idle' | 'walk' | 'sit' | 'inhale' | 'blow' | 'flick' | 'burp' | 'try' | 'point' | 'throw' | 'drop' | 'hurt' | 'stagger' | 'burn' | 'talk' | 'stun' | 'kneel' | 'crouch' | 'breath' | 'tail';
export interface SonOpts { pose: SonPose; q: number; mouth?: boolean }
export const SON_POSES: SonPose[] = ['idle', 'walk', 'sit', 'inhale', 'blow', 'flick', 'burp', 'try', 'point', 'throw', 'drop', 'hurt', 'stagger', 'burn', 'talk', 'stun', 'kneel', 'crouch', 'breath', 'tail'];

const UA = 30, FA = 30, TH = 33, SH = 33;

/** His skeleton for a pose. */
const rig = (o: SonOpts) => {
  const ph = (o.q / 8) * TAU;
  let hip: P = [0, -66], sh: P = [12, -110], head: P = [26, -124];
  let fN: P = [9, 0], fF: P = [-9, 0];
  let hN: P = [20, -56], hF: P = [0, -58];
  let tailK = 0;
  const sway = Math.sin(ph) * 1.5;
  switch (o.pose) {
    case 'idle': case 'talk': sh = [12 + sway, -110]; head = [26 + sway * 1.4, -124 + Math.abs(sway) * 0.4]; hN = [20 + sway, -56]; hF = [0 + sway, -58]; break;
    case 'walk': {
      const st = 11;
      fN = [Math.sin(ph) * st, -Math.max(0, Math.sin(ph)) * 5]; fF = [-Math.sin(ph) * st, -Math.max(0, -Math.sin(ph)) * 5];
      hip = [0, -66 - Math.abs(Math.sin(ph)) * 2]; sh = [14, -109 - Math.abs(Math.sin(ph)) * 2]; head = [28, -122 - Math.abs(Math.sin(ph)) * 2];
      hN = [22 - Math.sin(ph) * 8, -56]; hF = [0 + Math.sin(ph) * 8, -58]; tailK = Math.sin(ph);
      break;
    }
    case 'sit': hip = [-10, -26]; sh = [-14, -68]; head = [-2, -86]; fN = [34, 0]; fF = [28, 0]; hN = [10, -36]; hF = [-34, -30]; break;
    case 'inhale': hN = [30, -126]; head = [24, -126]; break;
    case 'blow': sh = [16, -108]; head = [32, -120]; hN = [24, -70]; break;
    case 'flick': hN = [44, -116]; sh = [12, -112]; break;
    case 'burp': sh = [6, -112]; head = [16, -130]; hN = [16, -88]; hF = [-6, -86]; break;
    case 'try': hip = [0, -68]; sh = [4, -124]; head = [8, -142]; hN = [20, -82]; hF = [-14, -82]; fN = [14, 0]; fF = [-14, 0]; break;
    case 'point': hip = [0, -68]; sh = [4, -122]; head = [10, -140]; hN = [60, -116]; hF = [-14, -84]; fN = [16, 0]; fF = [-12, 0]; break;
    case 'throw': hip = [0, -68]; sh = [6, -122]; head = [12, -140]; hN = [46, -150]; hF = [-24, -100]; fN = [18, 0]; fF = [-16, 0]; break;
    case 'drop': hip = [0, -66]; sh = [2, -118]; head = [4, -136]; hN = [16, -172]; hF = [-14, -170]; fN = [14, -10]; fF = [-12, -6]; tailK = 1; break;
    case 'hurt': sh = [-4, -114]; head = [2, -132]; hN = [10, -136]; hF = [-22, -128]; break;
    case 'stagger': sh = [-2 + sway * 3, -110]; head = [6 + sway * 4, -126]; hN = [32, -128 + sway * 6]; hF = [-30, -124 - sway * 6]; fN = [16, 0]; fF = [-18, -6]; break;
    case 'burn': {
      // (on fire: running about, arms flapping over his head)
      fN = [Math.sin(ph) * 14, -Math.max(0, Math.sin(ph)) * 8]; fF = [-Math.sin(ph) * 14, -Math.max(0, -Math.sin(ph)) * 8];
      sh = [6, -118]; head = [10, -136]; hN = [22 + Math.sin(ph * 2) * 10, -160]; hF = [-16 - Math.sin(ph * 2) * 10, -158]; tailK = Math.sin(ph * 2);
      break;
    }
    // (down on his knees, out of it: hunched over, hands on the floor in front)
    case 'kneel': hip = [-4, -36]; sh = [12, -78]; head = [26, -84]; fN = [-26, 0]; fF = [-32, 0]; hN = [30, -6]; hF = [20, -6]; tailK = 0; break;
    // (the smoke leap's wind-up: sunk low, the coat flared, about to go up)
    case 'crouch': hip = [0, -44]; sh = [14, -86]; head = [26, -96]; fN = [16, 0]; fF = [-16, 0]; hN = [34, -40]; hF = [-24, -40]; break;
    // (the breath: rearing back (the tell) then hunched, the jet out his mouth at waist height)
    case 'breath': hip = [0, -62]; sh = [22, -96]; head = [40, -98]; fN = [18, 0]; fF = [-18, 0]; hN = [12, -78]; hF = [-8, -80]; break;
    // (the tail: cocked, then whipped low out in front)
    case 'tail': hip = [0, -64]; sh = [-2, -110]; head = [10, -126]; fN = [14, 0]; fF = [-14, 0]; hN = [24, -96]; hF = [-24, -96]; tailK = -3; break;
    case 'stun': hip = [0, -58]; sh = [16, -96]; head = [30, -102]; fN = [6, 0]; fF = [-6, 0]; hN = [6, -56]; hF = [-2, -54]; break;
  }
  return { hip, sh, head, fN, fF, hN, hF, tailK };
};

// ---------------------------------------------------------------------------------------------------------------
// His parts

/** A hand: bony, long-fingered, black nails, rings. */
const hand = (c: Ctx, h: P, ang: number, r: Ramp, fist = false) => {
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
  for (const k of [-1, 0, 1, 2]) {
    const len = fist ? 4 : 9 - Math.abs(k - 0.5) * 1.2;
    const b0: P = [h[0] + ux * 3 + nx * k * 1.6, h[1] + uy * 3 + ny * k * 1.6], b1: P = [b0[0] + ux * len, b0[1] + uy * len];
    line(c, [b0[0], b0[1], b1[0], b1[1]], 2.6, r[4]); line(c, [b0[0], b0[1], b1[0], b1[1]], 1.6, r[1]);
    ell(c, b1[0], b1[1], 1.1, 1.1, '#0A0610');
    if (k === 1) px(c, b0[0] + ux * 2 - 1, b0[1] + uy * 2 - 1, 2, 2, METAL[1]);
  }
  ell(c, h[0] + ux * 2, h[1] + uy * 2, 4.4, 3.6, r[4], ang); ell(c, h[0] + ux * 2, h[1] + uy * 2, 3.6, 2.8, r[1], ang);
  line(c, [h[0] - nx * 2, h[1] - ny * 2, h[0] - nx * 5 + ux * 4, h[1] - ny * 5 + uy * 4], 2.2, r[2]);
};
/** An arm: the coat's sleeve (too long, over the wrist), the bony hand out of it. */
const arm = (c: Ctx, s: P, hIn: P, near: boolean, fist = false) => {
  const h = reachTo(s[0], s[1], hIn[0], hIn[1], UA, FA), [ex, ey] = elbow(s[0], s[1], h[0], h[1], UA, FA, 1);
  const cl = near ? COAT : COAT_F, sk = near ? SKIN : SKIN_F;
  const fa = Math.atan2(h[1] - ey, h[0] - ex);
  const cuff: P = [h[0] - Math.cos(fa) * 6, h[1] - Math.sin(fa) * 6];
  tube(c, s[0], s[1], 6.4, ex, ey, 5.2, cl, 0, 1);
  tube(c, ex, ey, 5.2, cuff[0], cuff[1], 5.8, cl, 0, 1);
  // (the sleeve's seam, a burn hole)
  line(c, [s[0] + 1, s[1] + 3, ex + 1, ey + 2], 0.7, cl[0]);
  if (near) { ell(c, (ex + cuff[0]) / 2, (ey + cuff[1]) / 2, 1.8, 1.4, '#0A0604'); ell(c, (ex + cuff[0]) / 2, (ey + cuff[1]) / 2, 2.6, 2.2, dith(c, '#6A3A1A')); }
  hand(c, h, fa, sk, fist);
};
/** A leg: the skinny jean, the knee, the platform boot (laces, buckles, the thick sole). */
const leg = (c: Ctx, hp: P, f: P, near: boolean) => {
  const an: P = [f[0], f[1] - 14];
  const [kx, ky] = knee(hp[0], hp[1], an[0], an[1], TH, SH, 1), end = reachTo(hp[0], hp[1], an[0], an[1], TH, SH);
  const j = near ? JEAN : JEAN_F;
  tube(c, hp[0], hp[1], 6.2, kx, ky, 4.6, j, 0, 1);
  tube(c, kx, ky, 4.6, end[0], end[1], 4, j, 0, 1);
  // (the rip at the knee, his gray knee through it)
  ell(c, kx + 1, ky, 3, 2, j[4]); ell(c, kx + 1, ky, 2, 1.2, near ? SKIN[2] : SKIN_F[2]);
  // (the boot: tall, to mid-shin; laces; a platform sole a hand thick)
  const bx = end[0], by = f[1];
  shape(c, () => { c.moveTo(bx - 5, end[1] - 6); c.lineTo(bx + 5, end[1] - 6); c.lineTo(bx + 6, by - 8); c.quadraticCurveTo(bx + 16, by - 9, bx + 16, by - 6); c.lineTo(bx - 6, by - 6); c.closePath(); }, near ? BOOT : [BOOT[1], BOOT[2], BOOT[3], BOOT[3], BOOT[4]], bx - 6, bx + 16, 1);
  for (let k = 0; k < 3; k++) line(c, [bx - 3, end[1] - 2 + k * 4, bx + 4, end[1] - 1 + k * 4], 0.8, '#6A6470');
  px(c, bx - 7, by - 7, 24, 7, BOOT[4]); px(c, bx - 6, by - 6, 22, 5, '#2A2830'); px(c, bx - 6, by - 6, 22, 1, '#5A5664'); px(c, bx - 6, by - 2, 22, 1, '#141218');
  px(c, bx + 2, by - 11, 4, 3, METAL[1]); px(c, bx + 2, by - 11, 4, 1, METAL[0]);
};

/** The head: (hx, hy) its middle, facing right. `glow`: trying (the eyes lit red, the lids up). */
const head = (c: Ctx, hx: number, hy: number, o: SonOpts) => {
  const trying = o.pose === 'try' || o.pose === 'point' || o.pose === 'throw' || o.pose === 'drop';
  const ow = o.pose === 'hurt' || o.pose === 'stagger' || o.pose === 'burn';
  const open = o.mouth || o.pose === 'blow' || o.pose === 'burp' || ow || o.pose === 'talk';
  // (the neck: long, thin, the adam's apple, a vein)
  tube(c, hx - 14, hy + 12, 4, hx - 6, hy + 6, 3.6, SKIN, 0, 1);
  ell(c, hx - 10, hy + 10, 1.6, 1.4, SKIN[2]);
  // (the hair at the back: lank, down past the jaw)
  shape(c, () => { c.moveTo(hx - 4, hy - 16); c.quadraticCurveTo(hx - 20, hy - 14, hx - 18, hy + 4); c.quadraticCurveTo(hx - 20, hy + 16, hx - 14, hy + 20); c.lineTo(hx - 8, hy + 6); c.closePath(); }, HAIR, hx - 20, hx - 4, 1);
  // (the face: long, gaunt, the jaw hanging; the cheek sunk)
  shape(c, () => { c.moveTo(hx - 8, hy - 14); c.quadraticCurveTo(hx + 8, hy - 18, hx + 12, hy - 6); c.quadraticCurveTo(hx + 14, hy + 4, hx + 10, hy + 12); c.quadraticCurveTo(hx + 4, hy + 18, hx - 4, hy + 16); c.quadraticCurveTo(hx - 10, hy + 10, hx - 10, hy); c.closePath(); }, SKIN, hx - 10, hx + 14, 1);
  ell(c, hx + 2, hy + 5, 3.4, 4, dith(c, SKIN[3]));
  // (the ear: pointed, back, the gauge in its lobe; the joint behind it)
  shape(c, () => { c.moveTo(hx - 6, hy - 2); c.lineTo(hx - 16, hy - 10); c.lineTo(hx - 9, hy + 4); c.closePath(); }, SKIN, hx - 16, hx - 6, 1);
  ell(c, hx - 9, hy + 4, 2.2, 2.2, '#0A0610'); ell(c, hx - 9, hy + 4, 1.2, 1.2, SKIN[3]);
  line(c, [hx - 14, hy - 8, hx - 4, hy - 12], 2.2, '#2A1E14'); line(c, [hx - 14, hy - 8, hx - 4, hy - 12], 1.4, '#F2ECDC'); px(c, hx - 15, hy - 9, 2, 2, '#4A3A2A');
  // (the eye: the bag under it (two rings of it), the liner smudged out round it in a raccoon ring, the red-veined
  // white, the lid half down (up and lit red when he's trying))
  ell(c, hx + 6, hy - 1, 6.2, 5.4, dith(c, LINER)); ell(c, hx + 6, hy - 2, 5, 4, LINER);
  line(c, [hx + 1, hy + 4, hx + 6, hy + 6, hx + 11, hy + 3], 0.9, BAG); line(c, [hx + 2, hy + 6, hx + 7, hy + 8], 0.7, BAG);
  ell(c, hx + 6, hy - 2, 3.6, 2.6, EYE_W);
  line(c, [hx + 3, hy - 2, hx + 5, hy - 1], 0.5, EYE_R); line(c, [hx + 9, hy - 3, hx + 7, hy - 2], 0.5, EYE_R);
  ell(c, hx + 7.4, hy - 1.6, 1.6, 1.6, trying ? '#FF3A2A' : '#8A1020'); px(c, hx + 7, hy - 2, 1, 1, trying ? '#FFE0C0' : '#2A0408');
  // (the lid: heavy and half down, unless he's trying (up, wide) or hurt (squeezed))
  const lid = trying ? 0.15 : ow ? 0.9 : 0.6;
  c.save(); c.beginPath(); c.ellipse(hx + 6, hy - 2, 3.8, 2.8, 0, 0, TAU); c.clip();
  px(c, hx + 1, hy - 6, 11, 6 * lid, SKIN[2]); px(c, hx + 1, hy - 6 + 6 * lid - 1, 11, 1, LINER);
  c.restore();
  // (the brow: thin, plucked, flat (he doesn't care); knit when he's trying)
  line(c, trying ? [hx + 2, hy - 8, hx + 10, hy - 6] : [hx + 2, hy - 7, hx + 10, hy - 8], 1, '#14101C');
  // (the nose: long and hooked, a pimple on its tip, the nostril)
  shape(c, () => { c.moveTo(hx + 10, hy - 4); c.quadraticCurveTo(hx + 20, hy + 2, hx + 18, hy + 7); c.lineTo(hx + 12, hy + 6); c.closePath(); }, SKIN, hx + 10, hx + 20, 1);
  ell(c, hx + 18, hy + 4, 1.4, 1.4, PIMPLE); px(c, hx + 18, hy + 3, 1, 1, '#FFF4E8');
  ell(c, hx + 14, hy + 6, 1.2, 0.8, SKIN[4]);
  // (the mouth: black lips, flat and bored; open (talking, the O of the smoke, the burp, the scream); the lip ring)
  if (open) {
    const big = o.pose === 'burp' || ow ? 1.6 : o.pose === 'blow' ? 1.1 : 0.8;
    ell(c, hx + 12, hy + 11, 3.4 * (o.pose === 'blow' ? 0.7 : 1), 2.2 * big + 0.6, LIPS); ell(c, hx + 12, hy + 11.4, 2.4 * (o.pose === 'blow' ? 0.6 : 1), 1.6 * big, '#3A0E1A');
    if (o.pose !== 'blow') px(c, hx + 10, hy + 9.6, 4, 1, '#E8DCC8');
  } else { line(c, [hx + 7, hy + 11, hx + 15, hy + 10.5], 2, LIPS); px(c, hx + 9, hy + 10, 4, 1, '#3A3444'); }
  c.strokeStyle = METAL[1]; c.lineWidth = 0.9; c.beginPath(); c.arc(hx + 13, hy + 13, 1.4, 0, Math.PI); c.stroke();
  // (the goatee: four hairs, proud of them)
  for (let k = 0; k < 4; k++) line(c, [hx + 7 + k * 1.4, hy + 15, hx + 6 + k * 1.6, hy + 18 + (k % 2)], 0.6, '#14101C');
  // (the fringe: greasy, down over his forehead and the far eye, to the nose, in strands; shine on it)
  shape(c, () => { c.moveTo(hx - 8, hy - 16); c.quadraticCurveTo(hx + 6, hy - 22, hx + 14, hy - 12); c.lineTo(hx + 13, hy - 4); c.lineTo(hx + 10, hy - 9); c.lineTo(hx + 7, hy - 6); c.lineTo(hx + 3, hy - 11); c.lineTo(hx - 2, hy - 7); c.lineTo(hx - 6, hy - 12); c.closePath(); }, HAIR, hx - 8, hx + 14, 1);
  line(c, [hx - 3, hy - 17, hx + 6, hy - 17, hx + 11, hy - 12], 0.8, HAIR[0]);
  // (the horns: two little ones, up through the hair; heated on a try (live: drawSon))
  for (const [bx, s] of [[hx - 2, 0.85], [hx + 6, 1]] as const) {
    shape(c, () => { c.moveTo(bx - 3 * s, hy - 17); c.quadraticCurveTo(bx - 2 * s, hy - 26 * s, bx + 4 * s, hy - 28 * s); c.quadraticCurveTo(bx + 1 * s, hy - 22 * s, bx + 3 * s, hy - 17); c.closePath(); }, HORN, bx - 3, bx + 4, 1);
    px(c, bx + 2 * s, hy - 28 * s, 2, 2, HORN[4]);
  }
  // (a zit on the jaw, the grease shining on the cheek)
  ell(c, hx + 2, hy + 12, 1.2, 1.2, PIMPLE); px(c, hx + 4, hy - 9, 3, 1, SKIN[0]);
};

/** The torso: the tee (its sigil), the coat's fronts open over it, hanging long. */
const torso = (c: Ctx, hip: P, sh: P, tail: number) => {
  // (the coat's back panel: long, to the shins, the tattered hem flaring out behind)
  const hemY = -16, back = sh[0] - 22;
  shape(c, () => { c.moveTo(sh[0] - 12, sh[1]); c.lineTo(sh[0] + 6, sh[1]); c.lineTo(hip[0] + 6, hip[1]); c.lineTo(hip[0] + 4, hemY); for (let k = 0; k <= 5; k++) c.lineTo(hip[0] + 4 - k * 7, hemY + (k % 2 ? 6 : 0)); c.lineTo(back, hemY - 4); c.closePath(); }, COAT_F, back, sh[0] + 6, 1);
  // (the tail: out from under the coat, drooping to the floor, its spade dragging)
  const tx = hip[0] - 14, ty = hip[1] + 14, ex = tx - 22 - tail * 4, ey = -3;
  line(c, [tx, ty, tx - 10, ty + 22, ex + 6, ey - 4, ex, ey], 5, TAIL[4]); line(c, [tx, ty, tx - 10, ty + 22, ex + 6, ey - 4, ex, ey], 3.4, TAIL[1]); line(c, [tx - 1, ty, tx - 11, ty + 21], 1, TAIL[0]);
  shape(c, () => { c.moveTo(ex, ey - 5); c.lineTo(ex - 8, ey); c.lineTo(ex, ey + 2); c.lineTo(ex + 3, ey - 1); c.closePath(); }, TAIL, ex - 8, ex + 3, 1);
  // (the tee: from the shoulders down to the belt, a slouch's curve in it; the sigil: a dripping red eye in a
  // triangle (his favorite band's))
  const tw = 11;
  shape(c, () => { c.moveTo(sh[0] - tw, sh[1] + 2); c.lineTo(sh[0] + tw, sh[1] + 2); c.quadraticCurveTo(sh[0] + tw + 2, (sh[1] + hip[1]) / 2, hip[0] + tw, hip[1] + 2); c.lineTo(hip[0] - tw, hip[1] + 2); c.quadraticCurveTo(sh[0] - tw - 4, (sh[1] + hip[1]) / 2, sh[0] - tw, sh[1] + 2); c.closePath(); }, TEE, Math.min(sh[0], hip[0]) - tw - 4, Math.max(sh[0], hip[0]) + tw + 2, 1);
  const mx = (sh[0] + hip[0]) / 2 + 1, my = (sh[1] + hip[1]) / 2 - 2;
  line(c, [mx - 6, my + 5, mx, my - 6, mx + 6, my + 5, mx - 6, my + 5], 1.4, '#B91C1C');
  ell(c, mx, my + 1, 2.4, 1.6, '#B91C1C'); px(c, mx - 0.5, my + 0.5, 1, 1, '#0A0610');
  for (const dx of [-4, 1, 4]) px(c, mx + dx, my + 6, 1, 2 + Math.abs(dx) % 3, '#B91C1C');
  // (the belt, its chain looping to the back pocket)
  px(c, hip[0] - tw, hip[1] - 1, tw * 2, 3, '#0A0610'); px(c, hip[0] - 2, hip[1] - 1, 4, 3, METAL[1]);
  c.strokeStyle = METAL[2]; c.lineWidth = 1; c.setLineDash([2, 1]); c.beginPath(); c.moveTo(hip[0] + 4, hip[1] + 2); c.quadraticCurveTo(hip[0] - 2, hip[1] + 14, hip[0] - 10, hip[1] + 3); c.stroke(); c.setLineDash([]);
  // (the coat's near front: open, hanging off the near shoulder down past the knee, its collar up, burn holes)
  shape(c, () => { c.moveTo(sh[0] + 6, sh[1] - 4); c.lineTo(sh[0] + 13, sh[1] + 2); c.quadraticCurveTo(hip[0] + 14, hip[1] - 10, hip[0] + 12, hemY - 2); for (let k = 0; k <= 3; k++) c.lineTo(hip[0] + 12 - k * 5, hemY + (k % 2 ? 5 : 0) - 2); c.quadraticCurveTo(hip[0] + 6, hip[1] - 10, sh[0] + 4, sh[1] + 6); c.closePath(); }, COAT, hip[0] - 3, sh[0] + 14, 1);
  line(c, [sh[0] + 9, sh[1] + 4, hip[0] + 9, hip[1] + 4, hip[0] + 8, hemY - 2], 0.8, COAT[0]);
  ell(c, hip[0] + 8, hip[1] + 18, 2, 1.6, '#0A0604'); ell(c, hip[0] + 8, hip[1] + 18, 3, 2.6, dith(c, '#6A3A1A'));
  // (the collar, up round the back of his neck)
  shape(c, () => { c.moveTo(sh[0] - 12, sh[1] + 2); c.lineTo(sh[0] - 8, sh[1] - 12); c.lineTo(sh[0] + 2, sh[1] - 6); c.lineTo(sh[0] + 4, sh[1] + 2); c.closePath(); }, COAT, sh[0] - 12, sh[0] + 4, 1);
};

/** Him, at the origin (his feet), facing right. */
export const paintSon = (g: Ctx, o: SonOpts) => {
  const r = rig(o);
  const fist = o.pose === 'try' || o.pose === 'stun';
  // (far: the far arm, the far leg; then the body; then near)
  arm(g, [r.sh[0] - 6, r.sh[1] + 4], r.hF, false, fist);
  leg(g, [r.hip[0] - 4, r.hip[1]], r.fF, false);
  torso(g, r.hip, r.sh, r.tailK);
  leg(g, [r.hip[0] + 4, r.hip[1]], r.fN, true);
  head(g, r.head[0], r.head[1], o);
  arm(g, [r.sh[0] + 6, r.sh[1] + 4], r.hN, true, fist && o.pose !== 'stun');
  // (in hand: the vape (inhaling), the lighter (the flick))
  if (o.pose === 'inhale') { const h = r.hN; line(g, [h[0] - 2, h[1] + 2, h[0] - 8, h[1] + 4], 3, '#141218'); line(g, [h[0] - 2, h[1] + 1.4, h[0] - 8, h[1] + 3.4], 1, '#5A5664'); }
  if (o.pose === 'flick') { const h = r.hN; px(g, h[0] + 2, h[1] - 8, 4, 7, '#7C3AED'); px(g, h[0] + 2, h[1] - 9, 4, 2, METAL[1]); }
};
/** Where his near hand is (the shots and the flicks come from it), from his feet, facing right. */
export const sonHand = (pose: SonPose): [number, number] => { const r = rig({ pose, q: 0 }); return [r.hN[0] + 6, r.hN[1]]; };
/** Where his mouth is (the smoke and the burp come out of it). */
export const sonMouth = (pose: SonPose): [number, number] => { const r = rig({ pose, q: 0 }); return [r.head[0] + 14, r.head[1] + 11]; };
export const SON_W = 44, SON_H = 146;

/** Him in the world: (x, feet), facing, his pose; stamped; the live bits over. `glow`: the horns and eyes heated
 *  (trying, 0..1). */
export const drawSon = (c: Ctx, x: number, feet: number, face: 1 | -1, o: SonOpts, f: number, glow = 0, alpha = 1) => {
  c.save(); c.translate(Math.round(x), Math.round(feet));
  if (face < 0) c.scale(-1, 1);
  if (alpha < 1) c.globalAlpha = alpha;
  stamp(c, `wp2-son-${o.pose}-${o.q}-${o.mouth ? 1 : 0}`, -80, -200, 160, 206, g => paintSon(g, o));
  const r = rig(o);
  // (the horns heating, the eyes lit: trying)
  if (glow > 0) {
    c.globalAlpha = alpha * Math.min(1, glow);
    for (const [bx, s] of [[r.head[0] - 2, 0.85], [r.head[0] + 6, 1]] as const) { c.fillStyle = FIRE[2]; c.beginPath(); c.moveTo(bx - 2 * s, r.head[1] - 18); c.quadraticCurveTo(bx - 1 * s, r.head[1] - 25 * s, bx + 4 * s, r.head[1] - 27 * s); c.lineTo(bx + 2 * s, r.head[1] - 18); c.closePath(); c.fill(); }
    c.fillStyle = FIRE[4]; c.fillRect(r.head[0] + 6, r.head[1] - 3, 3, 2);
    c.globalAlpha = alpha;
  }
  // (the vape's tip, lit, on the inhale)
  if (o.pose === 'inhale') { c.fillStyle = f % 6 < 3 ? '#38BDF8' : '#7DD3FC'; c.fillRect(r.hN[0] - 10, r.hN[1] + 3, 3, 2); }
  // (on fire: the flames are the scene's, over him (boss.ts))
  c.restore();
};

/** Him dead: face down, ass up, his coat up over his back, the tail limp, smoldering (boss.ts puts the smoke on). */
export const paintSonDead = (g: Ctx) => {
  // (lying along the floor, his head to the right, knees under him, his rear in the air)
  tube(g, -40, -6, 5, -16, -30, 5, JEAN, 0, 1);
  tube(g, -16, -30, 5, -2, -4, 4.4, JEAN, 0, 1);
  px(g, -10, -6, 22, 6, '#2A2830'); px(g, -10, -7, 22, 1, '#5A5664');
  shape(g, () => { g.moveTo(-34, -30); g.quadraticCurveTo(-20, -44, 0, -26); g.quadraticCurveTo(30, -18, 54, -10); g.lineTo(56, -2); g.lineTo(-30, -6); g.closePath(); }, COAT, -34, 56, 1);
  // (the coat's tail flipped up over his back, the burnt hem; his jeans' seat out under it, the tail limp off it)
  shape(g, () => { g.moveTo(-36, -28); g.quadraticCurveTo(-22, -48, -4, -40); g.lineTo(-10, -30); g.closePath(); }, JEAN, -36, -4, 1);
  line(g, [-34, -34, -50, -22, -58, -4], 4, TAIL[4]); line(g, [-34, -34, -50, -22, -58, -4], 2.6, TAIL[1]);
  // (the head, face down on the floor, the hair splayed, the horns; an arm out flat each side)
  ell(g, 64, -8, 11, 8, HAIR[4]); ell(g, 64, -8, 10, 7, HAIR[1]);
  for (const bx of [60, 68]) { g.fillStyle = HORN[4]; g.beginPath(); g.moveTo(bx, -14); g.lineTo(bx + 6, -20); g.lineTo(bx + 3, -12); g.closePath(); g.fill(); }
  tube(g, 40, -12, 4, 70, -3, 3.4, COAT, 0, 1); tube(g, 30, -10, 4, 6, -2, 3.4, COAT_F, 0, 1);
  ell(g, 74, -3, 3, 2.4, SKIN[1]);
  // (the char down his back where the coat went up)
  for (let k = 0; k < 10; k++) ell(g, -10 + k * 6, -24 + (k % 3) * 3, 3, 2, dith(g, '#3A1A0A'));
};
