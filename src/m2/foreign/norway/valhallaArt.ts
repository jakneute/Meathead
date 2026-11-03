// THE HALLS OF VALHALLA, drawn (valhalla.ts has the what and why). At the rest of the game's grade: every material its
// five-step ramp, banded, dithered seams, outlined in its own dark, lit from the upper left; still art painted once
// into stamps, only what moves live; its own lighting down in the hall.
//
//   UP TOP, under the bridge's right end:
//     THE DOORMAN: a park guy in the cheap troll suit (a lumpy green foam head bigger than his shoulders, yarn moss hair,
//       googly eyes (one hanging off), felt tusks, his own bored face showing through the mesh in its mouth; a green
//       fleece onesie zipped up the front, a felt fur loincloth, foam troll feet over his sneakers, the STAFF lanyard,
//       the clipboard). Poses: standing with the clipboard, talking (it up, a finger raised), raising the halls (both
//       arms up). Arms from art/limb.ts.
//     THE FACADE: a theme park's plywood flat on a hydraulic lift, up out of the river: painted logs, a painted shingle
//       gable with crossed dragon bargeboards, the HALLS OF VALHALLA plank sign with a giant foam axe behind it, painted
//       round shields, a green PLASTIC DRAGON HEAD over the door (its mould seam, a chip off its snout), the open studded
//       doors (painted), plastic torches with silk flames (live), its 2x4 bracing and the lift's posts behind it, the
//       river's slime and water line up its foot (it lives under the water). Scenery: dimmed, no lit tops.
//     THE DOCK in front: planks on blue barrels, rope, lit along its top (it's stood on). The fog machine on it,
//       puffing (live).
//   DOWN BELOW, THE HALL: the ride's old Viking show set gone gym-bro hideout, sealed in under the river:
//     the plywood flats painted as a mead hall's log walls, standing in front of the bridge's raw footing (seen over
//       their tops: wet concrete, rebar bleeding rust, the river seeping through a crack in the ceiling), one flat fallen
//       over against the wall; the ODIN MURAL (a one-eyed show-painted Odin with a six-pack someone added in marker,
//       ODIN SAYS NO SPLASHING); the lift's hydraulic ram down through the ceiling over the door; the door's back, its
//       Z-brace and the EXIT sign (live glow).
//     On the floor's band, dimmed (none of it's stood on): the MEAD kegs (beer kegs, MEAD on duct tape), drinking horns;
//       the party-store helmet rack (pegboard); the LONGSHIP BENCH (half a fiberglass longship, its dragon prow, the bench
//       pad on its gunwale, oars for rack uprights, a barbell with round shields for plates); the PLASTIC THRONE (a
//       gold-sprayed lawn chair, glued-on antlers, a fake fur, his towel); his army cot under a fake fur, a mini fridge, a
//       CRT and a stack of VHS (VIKINGS OF STEEL WORKOUT); the bin of foam axes and the INTERN locker; his sign.
//     Rubber gym mats over painted plywood flagstones; the walk line lit along its top.
//     Live: the keg on its chain (swinging), the silk-flame torches, the EXIT sign, the seep's drips, fog along the floor,
//     Ben, the foam axes; in front, the near beam.

import type { GameState } from '../../../m1/game/core/state';
import type { Light, SceneLight } from '../../../m1/game/render/lighting';
import { stamp } from '../../../m1/game/render/stamp';
import { checker } from '../../../m1/game/render/pixelArt';
import { CANVAS_WIDTH } from '../../../m1/constants';
import { shapeR, tubeR, pxR, lineR, ellR, dith, mixHex, type Ramp } from '../heli/harryArt';
import { elbow } from '../../art/limb';
import { drawBen, benHeadY } from '../../upgrades/confucktious';
import { saidOver } from '../section';
import { signAt, stencil, print, carved, graffiti } from '../../adventure/letters';
import { SECTIONS, GY } from '../geometry';
import { FACADE, DOOR, DOCK, DOORMAN, HALL, IN_DOOR, KEG, THRONE, hallOf, kegBox, benAt, inHall, hallView, doormanThere, type Foam } from './valhalla';

type Ctx = CanvasRenderingContext2D;
const { x0 } = SECTIONS.norway;
const X = (rx: number) => x0 + rx, Y = (h: number) => GY - h;

const box = (g: Ctx, x: number, y: number, w: number, h: number, col: string | CanvasPattern) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// (every material its ramp: lit, base, shade, deep, line)
const PLY: Ramp = ['#D8B888', '#B8956A', '#977552', '#71553A', '#2A1C10'];
const LOG: Ramp = ['#A8784A', '#86592F', '#6A4422', '#4C2E16', '#1C0E06'];
const TWO4: Ramp = ['#E2C898', '#C4A672', '#A08452', '#7A6038', '#2C2010'];
const CONC: Ramp = ['#8A8C88', '#6C6E6A', '#565854', '#3E403C', '#181A18'];
const RUST: Ramp = ['#C27A4C', '#94522E', '#6E3A22', '#4A2616', '#1A0C08'];
const STEEL: Ramp = ['#C6CCD4', '#9097A2', '#6C7280', '#4C5260', '#1A1E26'];
const DRAGON: Ramp = ['#9AE07A', '#5CB04A', '#3C8A34', '#266224', '#0C220C'];
const SHIELD_R: Ramp = ['#E86A5A', '#C23A2E', '#962A22', '#6A1C16', '#260808'];
const SHIELD_B: Ramp = ['#7AA6E8', '#3E6EC0', '#2C5296', '#1E386A', '#0A1428'];
const SHIELD_Y: Ramp = ['#FFE08A', '#E8B830', '#B88A18', '#7E5C0C', '#2E2004'];
const FOAM: Ramp = ['#FFC48A', '#F98A3A', '#D8641C', '#A84410', '#3A1404'];
const GOLDP: Ramp = ['#FFF2A8', '#E8C848', '#C29A26', '#8A6A12', '#2E2206'];
const BARREL: Ramp = ['#7AB0F0', '#3E7AD0', '#2C5CA6', '#1E3E74', '#0A162C'];
const MAT_B: Ramp = ['#5A86C8', '#3A62A2', '#2C4C80', '#1E365C', '#0A1424'];
const MAT_R: Ramp = ['#D25A4A', '#A83A2E', '#842C22', '#5C1E16', '#200806'];
const FUR: Ramp = ['#E8DCC4', '#C8B898', '#A89676', '#7C6C52', '#2A2418'];
const KEGS: Ramp = ['#E2E6EC', '#B4BAC4', '#8C929E', '#646A76', '#22262E'];
const OLIVE: Ramp = ['#9AA06A', '#767C4A', '#5A6036', '#3E4424', '#14180A'];
const RED: Ramp = ['#E2604A', '#B83A2A', '#8E2A1E', '#621C14', '#240806'];
const CARD: Ramp = ['#E6C08A', '#C8A070', '#A68052', '#7C5C38', '#2E2010'];
/** Set dressing back on the floor's band (none of it stood on): dimmed toward the dark. */
const dimR = (r: Ramp, k = 0.3): Ramp => r.map(c => mixHex(c, '#120C08', k)) as unknown as Ramp;

// ---------------------------------------------------------------------------------------------------------------
// The doorman (local: feet at 0,0, facing +x; painted once per pose into a stamp)

type DoorPose = 'stand' | 'talk' | 'raise';
const FLEECE: Ramp = ['#9ACB6A', '#6EA244', '#527E32', '#3A5A22', '#14220A'];
const TROLLFOAM: Ramp = ['#A8C878', '#82A856', '#62863E', '#46622C', '#18240E'];
const YARN = ['#E8742A', '#7AA43A', '#C8501E', '#5E8A2A'];
const SKIN: Ramp = ['#F6D2B0', '#E3AE86', '#C68A62', '#9A6444', '#4A2616'];
const SNEAK: Ramp = ['#FFFFFF', '#E4E4EA', '#BCBCC8', '#8C8C9A', '#2E2E38'];
const CLIP: Ramp = ['#D8B486', '#B48E5E', '#906C42', '#6A4C2C', '#24180C'];

/** His hands for each pose: [front hand, back hand], local, facing +x (shoulders at (6, -64) and (-6, -63)). */
const DOOR_HANDS: Record<DoorPose, [[number, number], [number, number]]> = {
  stand: [[12, -44], [-9, -36]],
  talk: [[16, -50], [10, -60]],
  raise: [[30, -78], [-22, -80]],
};
const paintDoorman = (g: Ctx, pose: DoorPose) => {
  // ---- the legs: green fleece down into the foam troll feet (big, lumpy, three felt toenails), sneaker heels showing
  for (const [hx, fx, back] of [[-4, -7, true], [5, 8, false]] as const) {
    const R = back ? FLEECE.map(c => mixHex(c, '#000000', 0.15)) as unknown as Ramp : FLEECE;
    tubeR(g, [hx, -34, fx, -8], [9], [R]);
    shapeR(g, () => g.ellipse(fx + 4, -5, 10, 6, 0, 0, Math.PI * 2), back ? TROLLFOAM.map(c => mixHex(c, '#000000', 0.15)) as unknown as Ramp : TROLLFOAM, fx - 6, fx + 14, 1);
    for (let k = 0; k < 3; k++) { ellR(g, fx + 8 + k * 2.6, -3 - k * 1.4, 1.6, 1.2, '#F5F0D8'); pxR(g, fx + 7.6 + k * 2.6, -3.6 - k * 1.4, 0.8, 0.6, '#FFFFFF'); }
    shapeR(g, () => g.rect(fx - 7, -4, 5, 4), SNEAK, fx - 7, fx - 2, 0.8);
  }
  // ---- the onesie's body: a fleece barrel, zipped up the front, the felt loincloth, the lanyard
  const sy = -64;
  const back = DOOR_HANDS[pose][1], front = DOOR_HANDS[pose][0];
  // (the back arm, behind)
  { const sx = -6, sh = -63, [ex, ey] = elbow(sx, sh, back[0], back[1], 14, 14, 1); tubeR(g, [sx, sh, ex, ey, back[0], back[1]], [8, 7], [FLEECE.map(c => mixHex(c, '#000000', 0.18)) as unknown as Ramp, FLEECE.map(c => mixHex(c, '#000000', 0.18)) as unknown as Ramp]); shapeR(g, () => g.ellipse(back[0], back[1], 4, 4, 0, 0, Math.PI * 2), TROLLFOAM.map(c => mixHex(c, '#000000', 0.18)) as unknown as Ramp, back[0] - 4, back[0] + 4, 0.9); }
  shapeR(g, () => { g.moveTo(-12, sy + 2); g.quadraticCurveTo(-15, -40, -11, -30); g.lineTo(13, -30); g.quadraticCurveTo(17, -42, 13, sy + 2); g.closePath(); }, FLEECE, -15, 17, 1.1);
  // (the fleece's pilling, a fold or two)
  for (let k = 0; k < 14; k++) pxR(g, -10 + hash(k * 3.1) * 22, sy + 4 + hash(k * 5.7) * 28, 1, 1, k % 2 ? FLEECE[0] : FLEECE[3]);
  lineR(g, [-8, -44, -4, -36], 0.7, FLEECE[3]); lineR(g, [9, -50, 11, -40], 0.7, FLEECE[3]);
  // (the zipper up the front, its pull)
  lineR(g, [4, sy + 3, 5, -31], 1.4, FLEECE[4]); for (let y = sy + 4; y < -32; y += 2) pxR(g, 4, y, 1.4, 0.8, '#C8CCD4');
  shapeR(g, () => g.rect(4, -48, 2.4, 4), STEEL, 4, 6.4, 0.6);
  // (the felt fur loincloth: brown, a jagged hem, spots)
  shapeR(g, () => { g.moveTo(-13, -34); g.lineTo(15, -34); g.lineTo(14, -24); g.lineTo(10, -21); g.lineTo(7, -25); g.lineTo(3, -20); g.lineTo(-1, -25); g.lineTo(-5, -21); g.lineTo(-9, -25); g.lineTo(-13, -22); g.closePath(); }, ['#C8945A', '#A87438', '#865826', '#5E3C16', '#221406'], -13, 15, 1);
  for (const [x, y] of [[-8, -30], [-1, -29], [6, -31], [11, -27]] as const) ellR(g, x, y, 1.6, 1.1, '#5E3C16');
  // (the lanyard: STAFF on a blue card)
  lineR(g, [-6, sy + 2, 1, -48, 8, sy + 2], 0.8, '#1D4ED8');
  shapeR(g, () => g.rect(-2, -49, 7, 9), ['#FFFFFF', '#F2F2F6', '#D8D8E0', '#AEAEBA', '#3A3A44'], -2, 5, 0.7);
  pxR(g, -1.4, -48.4, 5.8, 2, '#1D4ED8'); pxR(g, -1, -45, 5, 0.7, '#3A3A44'); pxR(g, -1, -43.4, 4, 0.7, '#3A3A44');
  // ---- the head: the foam troll head, bigger than his shoulders, sat down over him (lumpy, a seam), the yarn moss hair,
  // the googly eyes (one off on its string), the nose, felt tusks; his own face through the mesh in its mouth
  const hx = 2, hy = -82;
  shapeR(g, () => { g.moveTo(hx - 17, hy + 14); g.quadraticCurveTo(hx - 22, hy - 4, hx - 14, hy - 17); g.quadraticCurveTo(hx - 2, hy - 26, hx + 12, hy - 18); g.quadraticCurveTo(hx + 22, hy - 6, hx + 19, hy + 14); g.quadraticCurveTo(hx + 2, hy + 20, hx - 17, hy + 14); g.closePath(); }, TROLLFOAM, hx - 22, hx + 22, 1.2);
  // (lumps, the foam's pores; the glued seam down the middle)
  for (const [dx, dy, r] of [[-12, -6, 4], [10, -10, 3.4], [-6, 8, 3], [14, 4, 2.6]] as const) { ellR(g, hx + dx, hy + dy, r, r * 0.8, TROLLFOAM[2]); ellR(g, hx + dx - 1, hy + dy - 1, r * 0.6, r * 0.45, TROLLFOAM[0]); }
  for (let k = 0; k < 24; k++) pxR(g, hx - 16 + hash(k * 2.3) * 32, hy - 16 + hash(k * 4.1) * 28, 1, 1, TROLLFOAM[3]);
  lineR(g, [hx + 1, hy - 22, hx + 2, hy - 8], 0.7, TROLLFOAM[3]); for (let y = hy - 20; y < hy - 8; y += 3) pxR(g, hx + 0.6, y, 2, 0.6, TROLLFOAM[4]);
  // (the yarn hair: orange and green strands down off the top, tufts)
  for (let k = 0; k < 22; k++) {
    const t = k / 21, sx = hx - 18 + t * 36, sy2 = hy - 18 - Math.sin(t * Math.PI) * 6, len = 6 + hash(k + 9) * 10;
    lineR(g, [sx, sy2, sx + (hash(k) - 0.5) * 6, sy2 + len * (t < 0.15 || t > 0.85 ? 1.6 : 0.6)], 1.3, YARN[k % 4]);
  }
  // (the mouth: a wide mesh hole, his face behind it: bored eyes, a stubbled chin)
  shapeR(g, () => g.ellipse(hx + 6, hy + 6, 9, 6, 0, 0, Math.PI * 2), ['#3A2A1A', '#2A1C10', '#1E140A', '#140C06', '#060402'], hx - 3, hx + 15, 1);
  shapeR(g, () => g.ellipse(hx + 6, hy + 6.4, 6.4, 4.4, 0, 0, Math.PI * 2), SKIN.map(c => mixHex(c, '#1A1008', 0.45)) as unknown as Ramp, hx, hx + 12, 0.6);
  pxR(g, hx + 3, hy + 4.6, 2, 0.8, '#1A1008'); pxR(g, hx + 8, hy + 4.6, 2, 0.8, '#1A1008'); pxR(g, hx + 3, hy + 3.6, 2.2, 0.6, SKIN[3]); pxR(g, hx + 8, hy + 3.6, 2.2, 0.6, SKIN[3]);
  pxR(g, hx + 5, hy + 8, 3, 0.6, '#4A2616');
  g.save(); g.beginPath(); g.ellipse(hx + 6, hy + 6, 9, 6, 0, 0, Math.PI * 2); g.clip();
  for (let x = hx - 4; x < hx + 16; x += 2) pxR(g, x, hy - 1, 0.5, 14, 'rgba(10,10,10,0.55)');
  for (let y = hy; y < hy + 13; y += 2) pxR(g, hx - 4, y, 20, 0.5, 'rgba(10,10,10,0.55)');
  g.restore();
  // (the felt tusks up out of its lip; the big nose, a bump on it)
  for (const tx of [hx - 1, hx + 13]) { shapeR(g, () => { g.moveTo(tx - 1.6, hy + 2); g.lineTo(tx + 1.6, hy + 2); g.lineTo(tx + 0.4, hy - 5); g.closePath(); }, ['#FFFFFF', '#F2EEDC', '#D8D0B4', '#B0A684', '#4A4430'], tx - 1.6, tx + 1.6, 0.6); }
  shapeR(g, () => g.ellipse(hx + 13, hy - 4, 6, 4.6, 0.3, 0, Math.PI * 2), TROLLFOAM, hx + 7, hx + 19, 1);
  ellR(g, hx + 15, hy - 2, 1.4, 1, TROLLFOAM[4]); pxR(g, hx + 11, hy - 7, 2, 1, TROLLFOAM[0]);
  // (the googly eyes: one on, its pupil rolled up; one hanging off by its glue string)
  ellR(g, hx + 2, hy - 10, 4.6, 4.6, '#1A1A1A'); ellR(g, hx + 2, hy - 10, 3.8, 3.8, '#FFFFFF'); ellR(g, hx + 2.6, hy - 12, 1.8, 1.8, '#0A0A0A'); pxR(g, hx + 0.6, hy - 11.4, 1, 1, '#FFFFFF');
  lineR(g, [hx + 13, hy - 12, hx + 15, hy - 6, hx + 17, hy - 2], 0.5, 'rgba(230,240,250,0.8)');
  ellR(g, hx + 17.4, hy + 0.6, 3.4, 3.4, '#1A1A1A'); ellR(g, hx + 17.4, hy + 0.6, 2.8, 2.8, '#FFFFFF'); ellR(g, hx + 17.8, hy + 1.8, 1.4, 1.4, '#0A0A0A');
  pxR(g, hx + 11, hy - 14, 4, 3, dith(g, TROLLFOAM[3]));
  // ---- the front arm (a fleece sleeve, a foam troll mitt), and what's in it
  { const sx = 6, sh = -64, [ex, ey] = elbow(sx, sh, front[0], front[1], 14, 14, 1); tubeR(g, [sx, sh, ex, ey, front[0], front[1]], [8, 7], [FLEECE, FLEECE]);
    shapeR(g, () => g.ellipse(front[0], front[1], 4.4, 4.2, 0, 0, Math.PI * 2), TROLLFOAM, front[0] - 4.4, front[0] + 4.4, 0.9);
    for (let k = 0; k < 3; k++) pxR(g, front[0] + 1 + k * 1.4, front[1] - 3.4, 1, 1, '#F5F0D8'); }
  if (pose === 'stand') {
    // (the clipboard held flat to his chest: the sign-in sheet, a pen on a string)
    shapeR(g, () => g.rect(8, -60, 12, 16), CLIP, 8, 20, 0.9);
    shapeR(g, () => g.rect(9.4, -57, 9.2, 12.4), ['#FFFFFF', '#F6F6F2', '#E2E2DA', '#C2C2B8', '#4A4A44'], 9.4, 18.6, 0.6);
    for (let k = 0; k < 5; k++) pxR(g, 10.4, -55 + k * 2.2, 6 + (k % 2) * 1.4, 0.6, '#6A6A74');
    shapeR(g, () => g.rect(11.6, -61.4, 5, 2.4), STEEL, 11.6, 16.6, 0.6);
  } else if (pose === 'talk') {
    // (a finger raised: management's rules; the clipboard under the other arm)
    lineR(g, [16, -54, 16, -59], 1.6, TROLLFOAM[4]); lineR(g, [16, -54, 16, -58.6], 1, TROLLFOAM[1]);
  }
};
const DOOR_BOX: [number, number, number, number] = [-34, -128, 70, 132];
export const drawDoorman = (c: Ctx, x: number, y: number, facing: 1 | -1, pose: DoorPose) => {
  c.save(); c.translate(Math.round(x), Math.round(y)); if (facing < 0) c.scale(-1, 1);
  stamp(c, `fl-doorman-${pose}-${facing}`, DOOR_BOX[0], DOOR_BOX[1], DOOR_BOX[2], DOOR_BOX[3], g => paintDoorman(g, pose));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// Bits (painted into the stamps)

/** A round shield: painted boards, the cross in the second color, a rim, the boss (plastic: a moulded shine). */
const roundShield = (g: Ctx, x: number, y: number, r: number, A: Ramp, B: Ramp) => {
  shapeR(g, () => g.ellipse(x, y, r, r, 0, 0, Math.PI * 2), A, x - r, x + r, 1.2);
  g.save(); g.beginPath(); g.ellipse(x, y, r - 1, r - 1, 0, 0, Math.PI * 2); g.clip();
  for (let k = -r + 5; k < r; k += 6) pxR(g, x + k, y - r, 1, r * 2, A[3]);
  pxR(g, x - r * 0.18, y - r, r * 0.36, r * 2, B[1]); pxR(g, x - r, y - r * 0.18, r * 2, r * 0.36, B[1]);
  pxR(g, x - r * 0.18, y - r, r * 0.12, r * 2, B[0]);
  g.restore();
  g.strokeStyle = STEEL[3]; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, r - 1, 0, Math.PI * 2); g.stroke();
  shapeR(g, () => g.ellipse(x, y, r * 0.28, r * 0.28, 0, 0, Math.PI * 2), STEEL, x - r * 0.28, x + r * 0.28, 0.8);
  pxR(g, x - r * 0.16, y - r * 0.16, 1.4, 1.4, '#FFFFFF');
};
/** A horned party-store helmet (for the rack): the dome, the horns, the brim. */
const partyHelmet = (g: Ctx, x: number, y: number, k = 1) => {
  for (const s of [-1, 1]) shapeR(g, () => { g.moveTo(x + s * 6 * k, y - 4 * k); g.quadraticCurveTo(x + s * 13 * k, y - 6 * k, x + s * 12 * k, y - 15 * k); g.lineTo(x + s * 9 * k, y - 6 * k); g.closePath(); }, dimR(['#FFFFFF', '#F2EEDC', '#D8D0B4', '#B0A684', '#4A4430'], 0.3), x - 13 * k, x + 13 * k, 0.8);
  shapeR(g, () => g.ellipse(x, y, 8 * k, 7 * k, 0, Math.PI, 0), dimR(STEEL, 0.3), x - 8 * k, x + 8 * k, 0.9);
  pxR(g, x - 8 * k, y - 1, 16 * k, 2, dimR(STEEL, 0.3)[3]);
};
/** A keg: steel, two rolled hoops, the MEAD duct tape label. */
const keg = (g: Ctx, x: number, y: number, w: number, h: number, K: Ramp = KEGS, label = true) => {
  shapeR(g, () => g.roundRect(x - w / 2, y - h, w, h, 4), K, x - w / 2, x + w / 2, 1.1);
  for (const yy of [y - h + 6, y - 6]) { pxR(g, x - w / 2, yy - 1, w, 3, K[3]); pxR(g, x - w / 2, yy - 1, w, 1, K[0]); }
  pxR(g, x - w / 2 + 3, y - h + 2, 2, h - 4, K[0]);
  if (label) {
    shapeR(g, () => g.rect(x - w * 0.34, y - h * 0.62, w * 0.68, h * 0.26), dimR(['#D4D6DA', '#B2B6BC', '#90949C', '#6C7078', '#2A2C30'], 0.1), x - w * 0.34, x + w * 0.34, 0.6);
    signAt(g, 'MEAD', x, y - h * 0.58, 2, print(2, '#1A1A1A'));
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The facade (local: its door's middle at the foot, 0,0; x across, y up negative)

const FW = FACADE.b - FACADE.a, FH = FACADE.h, FL = FACADE.a - DOOR, FR = FACADE.b - DOOR;
/** Scenery: a touch toward the dark (it's behind him, nothing on it's stood on). */
const back = (r: Ramp) => dimR(r, 0.12);
const paintFacade = (g: Ctx) => {
  // ---- behind it: the lift's two steel posts down into the river, the 2x4 kickers propping the flat
  for (const px of [FL + 30, FR - 30]) { shapeR(g, () => g.rect(px - 6, -FH + 30, 12, FH + 60), back(STEEL), px - 6, px + 6, 1); for (let y = -FH + 40; y < 50; y += 26) pxR(g, px - 6, y, 12, 2, STEEL[3]); }
  for (const [xa, xb] of [[FL - 18, FL + 6], [FR + 18, FR - 6]] as const) { lineR(g, [xa, 0, xb, -FH + 60], 6, TWO4[4]); lineR(g, [xa, 0, xb, -FH + 60], 4, back(TWO4)[2]); }
  // ---- the flat: plywood painted as a log hall, the gable over it
  const top = -FH + 70;
  shapeR(g, () => g.rect(FL, top, FW, FH - 70 + 40), back(PLY), FL, FR, 1.2);
  // (the painted logs: each a band, its lit top and shaded bottom, the end rounds at each side, the knots)
  for (let y = top + 2, i = 0; y < 30; y += 15, i++) {
    const R = back(LOG);
    box(g, FL + 2, y, FW - 4, 14, R[1]); box(g, FL + 2, y, FW - 4, 3, R[0]); box(g, FL + 2, y + 3, FW - 4, 1, dith(g, R[0])); box(g, FL + 2, y + 10, FW - 4, 4, R[2]); box(g, FL + 2, y + 13, FW - 4, 1, R[4]);
    for (const ex of [FL + 8, FR - 8]) { ellR(g, ex, y + 7, 6, 7, R[4]); ellR(g, ex, y + 7, 5, 6, R[0]); ellR(g, ex, y + 7, 3, 3.6, R[1]); ellR(g, ex, y + 7, 1, 1.2, R[2]); }
    for (let k = 0; k < 3; k++) { const kx = FL + 30 + hash(i * 7 + k) * (FW - 60); ellR(g, kx, y + 7, 2.2, 1.4, R[3]); }
  }
  // (the gable: painted shingles up to a point, the crossed dragon bargeboards off its peak (painted flat, a lie))
  const gy = top, peak = -FH;
  g.save(); g.beginPath(); g.moveTo(FL - 6, gy + 6); g.lineTo(0, peak); g.lineTo(FR + 6, gy + 6); g.closePath(); g.clip();
  const SH = back(['#6A7A84', '#4E5C66', '#3C4850', '#2C363C', '#101418']);
  for (let y = peak, r = 0; y < gy + 6; y += 7, r++) { box(g, FL - 6, y, FW + 12, 7, SH[r % 2 ? 1 : 2]); for (let x = FL - 6 + (r % 2) * 6; x < FR + 6; x += 12) box(g, x, y, 1, 7, SH[4]); box(g, FL - 6, y + 6, FW + 12, 1, SH[3]); }
  g.restore();
  lineR(g, [FL - 8, gy + 8, 0, peak - 1, FR + 8, gy + 8], 7, LOG[4]); lineR(g, [FL - 8, gy + 7, 0, peak - 2, FR + 8, gy + 7], 4.6, back(LOG)[1]); lineR(g, [FL - 8, gy + 6, 0, peak - 3, FR + 8, gy + 6], 1.4, back(LOG)[0]);
  for (const s of [-1, 1]) {
    // (the dragon heads crossing over the peak: a curl, an eye, a tongue)
    const dx = s * 18, dy = peak - 8;
    lineR(g, [s * -6, peak + 6, dx, dy, dx + s * 10, dy - 6], 6, LOG[4]); lineR(g, [s * -6, peak + 6, dx, dy, dx + s * 10, dy - 6], 4, back(LOG)[1]);
    ellR(g, dx + s * 12, dy - 7, 5, 4, back(LOG)[1]); pxR(g, dx + s * 12 - 1, dy - 9, 2, 2, '#FDE047'); lineR(g, [dx + s * 16, dy - 6, dx + s * 21, dy - 3], 1.2, '#DC2626');
  }
  // ---- the painted shields across the front, either side of the door (blue/yellow, red/white)
  const shields: [number, Ramp, Ramp][] = [[FL + 26, SHIELD_R, SHIELD_Y], [FL + 66, SHIELD_B, SHIELD_Y], [FR - 66, SHIELD_Y, SHIELD_R], [FR - 26, SHIELD_R, SHIELD_B]];
  for (const [sx, A, B] of shields) roundShield(g, sx, -58, 15, back(A), back(B));
  // ---- the door: a dark opening, the painted studded doors swung open inward, the lintel log
  shapeR(g, () => { g.moveTo(-24, 0); g.lineTo(-24, -70); g.quadraticCurveTo(0, -84, 24, -70); g.lineTo(24, 0); g.closePath(); }, ['#3A2A1E', '#24180E', '#1A1008', '#100A04', '#000000'], -24, 24, 1.4);
  for (const s of [-1, 1]) {
    shapeR(g, () => { g.moveTo(s * 24, 0); g.lineTo(s * 24, -70); g.lineTo(s * 14, -66); g.lineTo(s * 14, -4); g.closePath(); }, back(LOG), Math.min(s * 24, s * 14), Math.max(s * 24, s * 14), 1);
    for (const yy of [-56, -34, -12]) { pxR(g, Math.min(s * 24, s * 14), yy, 10, 2, back(STEEL)[3]); for (let k = 0; k < 3; k++) pxR(g, s * 16 + s * k * 3 - 0.5, yy, 1.4, 1.4, back(STEEL)[0]); }
  }
  // (the fog machine's haze rolling out of the doorway, painted on the dark)
  for (let k = 0; k < 6; k++) ellR(g, -14 + k * 6, -6 - (k % 2) * 4, 9, 4, 'rgba(200,210,220,0.10)');
  // ---- the PLASTIC DRAGON HEAD over the door: green, glossy, its mould seam, teeth, a red eye, a chip off its snout
  {
    const dx = 0, dy = -84;
    shapeR(g, () => { g.moveTo(dx - 18, dy + 6); g.quadraticCurveTo(dx - 20, dy - 14, dx - 4, dy - 18); g.quadraticCurveTo(dx + 16, dy - 20, dx + 30, dy - 8); g.lineTo(dx + 32, dy + 2); g.quadraticCurveTo(dx + 18, dy + 8, dx + 4, dy + 6); g.closePath(); }, DRAGON, dx - 20, dx + 32, 1.3);
    lineR(g, [dx - 16, dy - 4, dx + 30, dy - 3], 0.6, DRAGON[0]);
    for (let k = 0; k < 6; k++) { g.fillStyle = '#F2EEDC'; g.beginPath(); g.moveTo(dx + 6 + k * 4, dy + 2); g.lineTo(dx + 8 + k * 4, dy + 6); g.lineTo(dx + 10 + k * 4, dy + 2); g.fill(); }
    for (const s of [-1, 1]) shapeR(g, () => { g.moveTo(dx - 10 + s * 4, dy - 14); g.quadraticCurveTo(dx - 18 + s * 6, dy - 26, dx - 26 + s * 4, dy - 26); g.lineTo(dx - 12 + s * 4, dy - 16); g.closePath(); }, DRAGON, dx - 26, dx - 6, 1);
    ellR(g, dx + 6, dy - 10, 3.4, 2.6, '#1A0A0A'); ellR(g, dx + 6, dy - 10, 2.4, 1.8, '#DC2626'); pxR(g, dx + 5, dy - 11, 1, 1, '#FFFFFF');
    ellR(g, dx + 28, dy - 6, 1.4, 1, '#0C220C');
    pxR(g, dx + 26, dy - 12, 4, 3, dith(g, '#F2F2E8')); pxR(g, dx - 8, dy - 16, 8, 2, '#D4F4C4');
  }
  // ---- the sign: a plank board on two 2x4 posts up off the gable's foot, HALLS OF VALHALLA carved into it; the giant
  // foam axe crossed behind it
  {
    const sy = -FH + 52;
    lineR(g, [-74, sy + 30, 70, sy - 26], 7, FOAM[4]); lineR(g, [-74, sy + 30, 70, sy - 26], 5, '#FACC15');
    shapeR(g, () => { g.moveTo(60, sy - 40); g.quadraticCurveTo(96, sy - 34, 94, sy - 6); g.quadraticCurveTo(84, sy - 6, 74, sy - 14); g.closePath(); }, FOAM, 60, 96, 1.2);
    pxR(g, 72, sy - 32, 10, 3, FOAM[0]); signAt(g, '$4.99', 82, sy - 22, 1, print(1, '#3A1404'));
    shapeR(g, () => g.rect(-70, sy - 12, 140, 26), PLY, -70, 70, 1.2);
    for (let k = 0; k < 4; k++) pxR(g, -68, sy - 8 + k * 6, 136, 1, PLY[2]);
    signAt(g, 'HALLS OF VALHALLA', 0, sy - 6, 3, carved(3, '#3A1E0C', '#F2D8A0'));
    signAt(g, 'EST. 793 A.D. (1987)', 0, sy + 6, 1, print(1, '#5A3A1C'));
  }
  // ---- cheap: staples and screws showing at the seams, the paint peeling, slime and the river's line up its foot
  for (let x = FL + 60; x < FR; x += 60) { box(g, x, top, 1, FH - 70 + 40, back(PLY)[3]); for (let y = top + 6; y < 30; y += 22) pxR(g, x - 1, y, 3, 1, '#C8CCD4'); }
  for (let k = 0; k < 12; k++) { const x = FL + hash(k + 50) * FW, y = top + 20 + hash(k + 51) * 120; ellR(g, x, y, 3 + hash(k) * 4, 2 + hash(k + 3) * 2, back(PLY)[1]); }
  for (let x = FL; x < FR; x += 3) { const h = 14 + Math.abs(Math.sin(x * 0.07) * 10 + Math.sin(x * 0.19) * 4); box(g, x, 30 - h, 3, h + 10, dith(g, '#3E5A2A')); box(g, x, 30 - h * 0.5, 3, h * 0.5 + 10, 'rgba(36,52,22,0.6)'); }
  box(g, FL, 18, FW, 1, 'rgba(230,240,240,0.4)');
  signAt(g, 'NO SPLASHING', FR - 46, -84, 1, print(1, '#7F1D1D'));
};

/** The dock (local: its left end at 0, its top at 0): planks across, blue barrels under, a rope; lit along its top. */
const DW = DOCK.b - DOCK.a;
const paintDock = (g: Ctx) => {
  for (let x = 20; x < DW; x += 54) { shapeR(g, () => g.roundRect(x - 14, 6, 28, 30, 6), BARREL, x - 14, x + 14, 1.1); pxR(g, x - 14, 14, 28, 2, BARREL[3]); pxR(g, x - 14, 26, 28, 2, BARREL[3]); }
  shapeR(g, () => g.rect(0, 0, DW, 9), LOG, 0, DW, 1.2);
  for (let x = 0; x < DW; x += 12) { box(g, x, 0, 1, 9, LOG[4]); pxR(g, x + 4, 4, 1.4, 1.4, '#C8CCD4'); }
  box(g, 0, -1, DW, 2, '#E8C890'); box(g, 0, -1, DW, 1, '#FFF2D0');
  for (let x = 6; x < DW; x += 30) { g.strokeStyle = '#2A1A08'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, 8); g.quadraticCurveTo(x + 15, 16, x + 30, 8); g.stroke(); g.strokeStyle = '#D8B878'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, 8); g.quadraticCurveTo(x + 15, 16, x + 30, 8); g.stroke(); }
};
/** The fog machine on the dock (local: its foot's middle). */
const paintFogger = (g: Ctx) => {
  shapeR(g, () => g.roundRect(-14, -16, 28, 16, 2), ['#4A4A52', '#2E2E36', '#22222A', '#16161C', '#060608'], -14, 14, 1);
  for (let k = 0; k < 5; k++) pxR(g, -10 + k * 4, -13, 2, 6, '#0A0A0E');
  shapeR(g, () => g.rect(14, -10, 6, 6), STEEL, 14, 20, 0.8);
  pxR(g, -11, -4, 3, 2, '#DC2626'); signAt(g, 'FOG', 4, -4, 1, print(1, '#E8E8F0'));
};

// ---------------------------------------------------------------------------------------------------------------
// The hall (room coordinates: x 0..W from its left end, y 0 the floor's walk line, up negative)

const W = HALL.b - HALL.a, H = HALL.floor - HALL.ceil;
const LA = X(HALL.a), F = HALL.floor;
const BACK = -30, PB = -14;
const rx = (worldRx: number) => worldRx - HALL.a;
/** The flats' top (over them: the bridge's footing, raw). */
const FLAT_TOP = -H + 76;
/** The torches (room coordinates), the seep's crack in the ceiling, the EXIT sign. */
const TORCHES = [{ x: 150, y: -196 }, { x: 424, y: -214 }, { x: 742, y: -196 }];
const SEEP = 404;
const EXIT = { x: rx(IN_DOOR), y: -120 };

const paintFooting = (g: Ctx) => {
  // ---- the bridge's footing behind and over the flats: poured concrete, its form panels, rebar bleeding rust, wet
  for (let x = -60, i = 0; x < W + 60; x += 100, i++) {
    const P = CONC.map(c => mixHex(c, '#1A1A18', 0.4 + hash(i + 2) * 0.12)) as unknown as Ramp;
    const bands = [P[3], P[2], P[2], P[1], P[2]], bh = (H + 80) / bands.length;
    bands.forEach((col, j) => { box(g, x, -H - 80 + j * bh, 100, bh + 1, col); if (j) checker(g, x, -H - 80 + j * bh - 1, 100, 2, bands[j - 1], j % 2, 2); });
    box(g, x, -H - 80, 1, H + 80, P[4]);
  }
  for (let k = 0; k < 16; k++) { const x = hash(k + 10) * W, y = -H + 8 + hash(k + 11) * 50; ellR(g, x, y, 1.6, 1.6, RUST[3]); g.fillStyle = 'rgba(120,58,30,0.35)'; g.fillRect(Math.round(x - 1), Math.round(y), 3, 30 + hash(k) * 40); }
  // (the seep: a crack in the ceiling, the river coming through, a wet dark stain down the wall under it, green slime)
  lineR(g, [SEEP - 30, -H, SEEP - 10, -H + 6, SEEP + 4, -H + 2, SEEP + 26, -H + 9], 1.4, '#0A0A08');
  g.fillStyle = 'rgba(14,20,22,0.42)'; g.beginPath(); g.moveTo(SEEP - 12, -H); g.quadraticCurveTo(SEEP - 20, -H + 120, SEEP - 6, BACK); g.lineTo(SEEP + 14, BACK); g.quadraticCurveTo(SEEP + 16, -H + 140, SEEP + 10, -H); g.closePath(); g.fill();
  for (let x = SEEP - 40; x < SEEP + 40; x += 3) box(g, x, -H, 3, 12 + Math.abs(Math.sin(x * 0.2)) * 14, dith(g, '#3E5A2A'));
  // ---- the ceiling: the bridge deck's underside a long way up, beams across, the lift's ram down through it over the door
  box(g, -60, -H - 80, W + 120, 80, CONC[4]);
  for (let x = -40; x < W + 60; x += 120) { shapeR(g, () => g.rect(x, -H - 30, 30, 34), dimR(CONC, 0.45), x, x + 30, 1); }
  box(g, -60, -H + 2, W + 120, 3, CONC[4]);
  const ram = EXIT.x + 40;
  shapeR(g, () => g.rect(ram - 16, -H - 20, 32, 40), dimR(STEEL, 0.3), ram - 16, ram + 16, 1.2);
  shapeR(g, () => g.rect(ram - 7, -H + 20, 14, 70), dimR(['#F2F4F6', '#CDD2D8', '#A8AEB8', '#7A808C', '#262A32'], 0.2), ram - 7, ram + 7, 1);
  shapeR(g, () => g.rect(ram - 12, -H + 88, 24, 10), dimR(STEEL, 0.3), ram - 12, ram + 12, 1);
  pxR(g, ram - 5, -H + 24, 2, 62, '#FFFFFF');
  for (let k = 0; k < 6; k++) pxR(g, ram - 16 + k * 6, -H - 18, 2, 6, '#1A1E26');
  signAt(g, 'LIFT 2', ram, -H - 2, 1, stencil(1, '#E8C030'));
  lineR(g, [ram + 12, -H + 92, ram + 40, -H + 120, ram + 30, FLAT_TOP], 2, '#141210');
};
const paintFlats = (g: Ctx) => {
  // ---- the show's flats: plywood on 2x4 frames, each 120 across, painted as the mead hall's log walls
  for (let x = 0, i = 0; x < W; x += 120, i++) {
    if (i === 2) continue; // (the fallen one: painted after)
    shapeR(g, () => g.rect(x, FLAT_TOP, 120, -FLAT_TOP + BACK), dimR(PLY, 0.2), x, x + 120, 1);
    for (let y = FLAT_TOP + 4, j = 0; y < BACK - 6; y += 18, j++) {
      const R = dimR(LOG, 0.22 + hash(i * 3 + j) * 0.06);
      box(g, x + 1, y, 118, 17, R[1]); box(g, x + 1, y, 118, 3, R[0]); box(g, x + 1, y + 3, 118, 1, dith(g, R[0])); box(g, x + 1, y + 12, 118, 5, R[2]); box(g, x + 1, y + 16, 118, 1, R[4]);
      if (hash(i * 11 + j) > 0.6) ellR(g, x + 20 + hash(j + i) * 80, y + 8, 2.4, 1.6, R[3]);
    }
    // (the frame's top over it, the seam, the screws)
    shapeR(g, () => g.rect(x, FLAT_TOP - 6, 120, 6), dimR(TWO4, 0.25), x, x + 120, 0.8);
    box(g, x, FLAT_TOP, 1, -FLAT_TOP + BACK, PLY[4]);
    for (let y = FLAT_TOP + 10; y < BACK; y += 40) pxR(g, x + 2, y, 2, 2, '#9CA0A8');
  }
  // ---- the fallen flat: leaned over against the next, its back showing (raw plywood, the frame, SCENE 4 stenciled)
  {
    const x = 240;
    g.fillStyle = 'rgba(8,6,4,0.35)'; g.fillRect(x, FLAT_TOP, 120, -FLAT_TOP + BACK);
    g.save(); g.translate(x + 6, BACK); g.rotate(0.22);
    shapeR(g, () => g.rect(0, -(-FLAT_TOP + BACK) + 30, 120, -FLAT_TOP + BACK - 30), dimR(PLY, 0.3), 0, 120, 1);
    for (const fx of [4, 58, 112]) shapeR(g, () => g.rect(fx, -(-FLAT_TOP + BACK) + 30, 6, -FLAT_TOP + BACK - 30), dimR(TWO4, 0.35), fx, fx + 6, 0.8);
    shapeR(g, () => g.rect(0, -130, 120, 6), dimR(TWO4, 0.35), 0, 120, 0.8);
    signAt(g, 'SCENE 4', 60, -90, 2, stencil(2, '#2A1A0C'));
    g.restore();
  }
  // ---- the ODIN MURAL across two flats: show-painted, one eye, the beard, two ravens, abs added in marker
  {
    const mx = 560, my = -170;
    shapeR(g, () => g.rect(mx - 100, my - 74, 200, 140), dimR(['#4A6C9A', '#365480', '#2A4266', '#1E304C', '#0A121C'], 0.2), mx - 100, mx + 100, 1.4);
    // (his helmet, the wings off it; the face; the beard to his belly)
    shapeR(g, () => g.ellipse(mx, my - 40, 30, 18, 0, Math.PI, 0), dimR(STEEL, 0.2), mx - 30, mx + 30, 1);
    for (const s of [-1, 1]) shapeR(g, () => { g.moveTo(mx + s * 26, my - 46); g.quadraticCurveTo(mx + s * 54, my - 70, mx + s * 60, my - 52); g.quadraticCurveTo(mx + s * 46, my - 50, mx + s * 30, my - 40); g.closePath(); }, dimR(['#FFFFFF', '#E8E8F0', '#C8C8D4', '#9A9AA8', '#3A3A44'], 0.2), mx - 60, mx + 60, 1);
    shapeR(g, () => g.ellipse(mx, my - 24, 24, 22, 0, 0, Math.PI * 2), dimR(SKIN, 0.2), mx - 24, mx + 24, 1.2);
    ellR(g, mx - 9, my - 28, 3.4, 2.4, '#FFFFFF'); ellR(g, mx - 9, my - 28, 1.6, 1.6, '#1A1A40');
    shapeR(g, () => g.ellipse(mx + 9, my - 28, 6, 5, 0, 0, Math.PI * 2), ['#3A3A3A', '#222222', '#161616', '#0A0A0A', '#000000'], mx + 3, mx + 15, 0.8);
    lineR(g, [mx + 3, my - 30, mx + 22, my - 40], 1, '#000000'); lineR(g, [mx + 3, my - 30, mx - 22, my - 38], 1, '#000000');
    shapeR(g, () => { g.moveTo(mx - 22, my - 16); g.quadraticCurveTo(mx - 30, my + 30, mx, my + 56); g.quadraticCurveTo(mx + 30, my + 30, mx + 22, my - 16); g.quadraticCurveTo(mx, my - 4, mx - 22, my - 16); g.closePath(); }, dimR(['#F4F4F6', '#D8D8E0', '#B4B4C0', '#8A8A98', '#3A3A44'], 0.2), mx - 30, mx + 30, 1.2);
    for (let k = 0; k < 9; k++) lineR(g, [mx - 16 + k * 4, my - 6, mx - 18 + k * 4.4, my + 30 + (k % 3) * 6], 0.6, '#9A9AA8');
    // (the abs and the nipples someone drew on in black marker, either side of the beard)
    for (const s of [-1, 1]) { for (let r = 0; r < 3; r++) { g.strokeStyle = '#0A0A0A'; g.lineWidth = 1; g.strokeRect(mx + s * 42 - 7, my + 4 + r * 12, 14, 10); } ellR(g, mx + s * 40, my - 8, 2, 2, '#0A0A0A'); }
    // (two ravens on his shoulders, flat black birds)
    for (const s of [-1, 1]) { g.fillStyle = '#0A0A10'; g.beginPath(); g.ellipse(mx + s * 74, my - 10, 12, 7, s * 0.3, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(mx + s * 82, my - 16); g.lineTo(mx + s * 92, my - 13); g.lineTo(mx + s * 82, my - 11); g.fill(); pxR(g, mx + s * 79 - 1, my - 15, 2, 2, '#FDE047'); }
    signAt(g, 'ODIN SAYS: NO SPLASHING', mx, my - 86, 1, print(1, '#F2D8A0', '#1A0E06'));
  }
  // ---- the hung real shields (party-store plastic) and crossed foam spears along the flats' tops
  for (const [sx, A, B] of [[110, SHIELD_B, SHIELD_Y], [400, SHIELD_R, SHIELD_Y], [720, SHIELD_Y, SHIELD_B], [800, SHIELD_R, SHIELD_B]] as const) roundShield(g, sx, FLAT_TOP + 34, 17, dimR(A, 0.25), dimR(B, 0.25));
  for (const cx of [190, 660]) for (const s of [-1, 1]) { lineR(g, [cx - s * 26, FLAT_TOP + 70, cx + s * 26, FLAT_TOP + 18], 3, '#2A1A08'); lineR(g, [cx - s * 26, FLAT_TOP + 70, cx + s * 26, FLAT_TOP + 18], 1.6, dimR(TWO4, 0.2)[1]); shapeR(g, () => { g.moveTo(cx + s * 26, FLAT_TOP + 18); g.lineTo(cx + s * 34, FLAT_TOP + 6); g.lineTo(cx + s * 22, FLAT_TOP + 14); g.closePath(); }, dimR(STEEL, 0.25), cx - 34, cx + 34, 0.8); }
  // ---- the torches' brackets (the flames are live) and their light painted on the flats
  for (const t of TORCHES) {
    shapeR(g, () => g.rect(t.x - 3, t.y, 6, 24), dimR(LOG, 0.15), t.x - 3, t.x + 3, 0.8);
    shapeR(g, () => { g.moveTo(t.x - 7, t.y - 2); g.lineTo(t.x + 7, t.y - 2); g.lineTo(t.x + 4, t.y + 6); g.lineTo(t.x - 4, t.y + 6); g.closePath(); }, dimR(STEEL, 0.2), t.x - 7, t.x + 7, 0.8);
    lineR(g, [t.x, t.y + 24, t.x + 6, BACK], 0.8, '#141210');
    for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(255,170,90,${0.025 + i * 0.012})`; g.beginPath(); g.ellipse(t.x, t.y + 30 + i * 8, 130 - i * 22, 100 - i * 16, 0, 0, Math.PI * 2); g.fill(); }
  }
  // ---- his scrawl: BEN'S on the flat by the throne
  signAt(g, "BEN'S", 690, -268, 6, graffiti(6, '#C8402A', 4));
  signAt(g, 'NO TROLLS', 690, -250, 2, graffiti(2, '#E8E0C8', 2));
};
const paintFloor = (g: Ctx) => {
  // ---- the band back to the wall: painted plywood flagstones, worn through to the wood; rubber gym mats over them
  const FL4 = ['#4A4238', '#544A3E', '#5E5446', '#685C4E'];
  FL4.forEach((col, i) => { const y = BACK + (i * -BACK) / FL4.length; box(g, -60, y, W + 120, -BACK / FL4.length + 1, col); if (i) checker(g, -60, y - 1, W + 120, 2, FL4[i - 1], i % 2, 2); });
  for (let x = -40; x < W + 60; x += 46) for (let r = 0; r < 2; r++) { const y = BACK + 4 + r * 13; box(g, x + (r % 2) * 22, y, 1, 12, '#2A241C'); }
  box(g, -60, BACK, W + 120, 2, 'rgba(10,8,6,0.55)');
  for (let x = 120; x < W - 20; x += 64) {
    const M = dimR(Math.floor(x / 64) % 2 ? MAT_B : MAT_R, 0.3);
    box(g, x, BACK + 6, 62, -BACK - 8, M[1]); box(g, x, BACK + 6, 62, 2, M[0]); box(g, x + 60, BACK + 6, 2, -BACK - 8, M[3]);
    for (let k = 0; k < 4; k++) { box(g, x + 4 + k * 15, BACK + 6, 6, 2, M[3]); }
  }
  // ---- the cut face under the walk line, its lip lit (stood on)
  const FF = ['#3A3228', '#30281F', '#28201A', '#201A14', '#1A1510', '#14100C', '#0E0B08'];
  FF.forEach((col, i) => { box(g, -60, 4 + i * 10, W + 120, i === FF.length - 1 ? 300 : 11, col); if (i) checker(g, -60, 3 + i * 10, W + 120, 2, FF[i - 1], i % 2, 2); });
  // (the footing's slab under it, its form seams, a pipe run through it)
  for (let x = -40; x < W + 60; x += 100) box(g, x, 40, 1, 260, '#080604');
  for (let x = -60; x < W + 60; x += 4) box(g, x, 96, 4, 3, x % 8 ? '#1E1A14' : '#0A0806');
  box(g, -60, 0, W + 120, 4, '#8A7A62'); box(g, -60, 0, W + 120, 2, '#B4A488'); box(g, -60, 0, W + 120, 1, '#E8DAC0');
  checker(g, -60, 4, W + 120, 2, '#8A7A62', 0, 2);
};
const paintProps = (g: Ctx) => {
  // ---- the door's back (left end): plywood on a Z of 2x4s, a push bar, the fire extinguisher; the EXIT sign over it
  const dx = EXIT.x;
  shapeR(g, () => g.rect(dx - 26, -96, 52, 96 + PB + 14), dimR(PLY, 0.15), dx - 26, dx + 26, 1.2);
  for (const [a, b] of [[[-22, -88], [22, -88]], [[-22, -8], [22, -8]], [[-22, -8], [22, -88]]] as const) { lineR(g, [dx + a[0], a[1], dx + b[0], b[1]], 6, TWO4[4]); lineR(g, [dx + a[0], a[1], dx + b[0], b[1]], 4, dimR(TWO4, 0.1)[1]); }
  shapeR(g, () => g.rect(dx - 20, -50, 40, 5), dimR(STEEL, 0.1), dx - 20, dx + 20, 0.9);
  shapeR(g, () => g.rect(dx - 30, -102, 60, 6), dimR(TWO4, 0.1), dx - 30, dx + 30, 1);
  shapeR(g, () => g.roundRect(dx + 34, -40, 10, 26, 3), dimR(RED, 0.1), dx + 34, dx + 44, 1); shapeR(g, () => g.rect(dx + 36, -46, 6, 6), dimR(STEEL, 0.2), dx + 36, dx + 42, 0.8);
  shapeR(g, () => g.rect(EXIT.x - 18, EXIT.y - 10, 36, 14), ['#3A3A40', '#26262C', '#1A1A20', '#0E0E12', '#040406'], EXIT.x - 18, EXIT.x + 18, 1);
  // ---- the fog machine on the floor by the door, its hose
  shapeR(g, () => g.roundRect(118, PB - 18, 30, 18, 2), dimR(['#4A4A52', '#2E2E36', '#22222A', '#16161C', '#060608'], 0.15), 118, 148, 1);
  for (let k = 0; k < 5; k++) pxR(g, 122 + k * 5, PB - 14, 2, 8, '#0A0A0E');
  pxR(g, 121, PB - 6, 3, 2, '#DC2626');
  // ---- the MEAD kegs, stacked two high, a tap tower on top, drinking horns on a nail
  for (const [kx, ky] of [[186, PB], [222, PB], [204, PB - 46]] as const) keg(g, kx, ky, 34, 46, dimR(KEGS, 0.25));
  shapeR(g, () => g.rect(201, PB - 104, 6, 14), dimR(STEEL, 0.15), 201, 207, 0.8); lineR(g, [207, PB - 100, 212, PB - 100, 212, PB - 96], 1.4, dimR(STEEL, 0.1)[1]);
  for (let k = 0; k < 2; k++) shapeR(g, () => { g.moveTo(244 + k * 12, -150); g.quadraticCurveTo(254 + k * 12, -132, 246 + k * 12, -120); g.lineTo(242 + k * 12, -122); g.quadraticCurveTo(248 + k * 12, -132, 240 + k * 12, -148); g.closePath(); }, dimR(['#FFF6E0', '#EADCB8', '#C8B88C', '#9A8A60', '#3A3220'], 0.25), 240 + k * 12, 254 + k * 12, 0.8);
  // ---- the helmet rack: pegboard, party-store horned helmets on its hooks (one with a price tag)
  shapeR(g, () => g.rect(270, -170, 76, 70), dimR(['#C8A878', '#A88A5A', '#886C42', '#62502E', '#22180C'], 0.3), 270, 346, 1);
  for (let y = -164; y < -104; y += 6) for (let x = 274; x < 344; x += 6) pxR(g, x, y, 1.4, 1.4, '#2A1E10');
  for (const [hx2, hy2] of [[290, -146], [326, -146], [290, -114], [326, -114]] as const) partyHelmet(g, hx2, hy2, 1.1);
  shapeR(g, () => g.rect(334, -142, 6, 8), dimR(['#FFE08A', '#FFC93A', '#E8A010', '#B87A04', '#3A2400'], 0.2), 334, 340, 0.6);
  // ---- the LONGSHIP BENCH: half a fiberglass longship on blocks, its dragon prow up, the bench pad on its gunwale,
  // two oars standing as rack uprights, a barbell across them with round shields for plates
  {
    const bx = 384, bw = 120, LS = dimR(['#C28A50', '#9A6A36', '#7A5026', '#583818', '#1E1208'], 0.25);
    shapeR(g, () => { g.moveTo(bx, PB - 30); g.lineTo(bx + bw, PB - 30); g.quadraticCurveTo(bx + bw + 4, PB - 8, bx + bw - 14, PB - 2); g.lineTo(bx + 10, PB - 2); g.quadraticCurveTo(bx - 6, PB - 10, bx, PB - 30); g.closePath(); }, LS, bx - 6, bx + bw + 4, 1.2);
    for (let k = 0; k < 3; k++) lineR(g, [bx + 2, PB - 24 + k * 7, bx + bw - 2, PB - 24 + k * 7], 0.8, LS[3]);
    for (let k = 0; k < 4; k++) roundShield(g, bx + 18 + k * 28, PB - 18, 8, dimR([SHIELD_R, SHIELD_B, SHIELD_Y, SHIELD_R][k], 0.3), dimR([SHIELD_Y, SHIELD_Y, SHIELD_B, SHIELD_B][k], 0.3));
    // (the prow: the dragon's neck curling up off its end, a head, a chipped snout)
    shapeR(g, () => { g.moveTo(bx + bw - 6, PB - 30); g.quadraticCurveTo(bx + bw + 20, PB - 50, bx + bw + 10, PB - 86); g.lineTo(bx + bw + 2, PB - 82); g.quadraticCurveTo(bx + bw + 8, PB - 52, bx + bw - 14, PB - 30); g.closePath(); }, LS, bx + bw - 14, bx + bw + 20, 1);
    shapeR(g, () => g.ellipse(bx + bw + 14, PB - 88, 10, 6, -0.3, 0, Math.PI * 2), dimR(DRAGON, 0.25), bx + bw + 4, bx + bw + 24, 1); pxR(g, bx + bw + 14, PB - 92, 2, 2, '#FDE047');
    // (the bench pad, cracked vinyl, duct tape)
    shapeR(g, () => g.roundRect(bx + 8, PB - 40, bw - 16, 10, 3), dimR(['#5A5A64', '#3A3A44', '#2A2A32', '#1C1C22', '#08080A'], 0.2), bx + 8, bx + bw - 8, 1);
    pxR(g, bx + 50, PB - 39, 14, 3, dimR(['#C8CCD4', '#A8ACB4', '#8A8E96', '#6A6E76', '#2A2C30'], 0.2)[0]);
    // (the oars, the bar across them, the shield plates)
    for (const ox of [bx + 14, bx + bw - 14]) { lineR(g, [ox, PB - 30, ox, -150], 4, LS[4]); lineR(g, [ox, PB - 30, ox, -150], 2.4, LS[1]); shapeR(g, () => g.ellipse(ox, -156, 5, 10, 0, 0, Math.PI * 2), LS, ox - 5, ox + 5, 0.8); pxR(g, ox - 5, -110, 10, 3, LS[3]); }
    lineR(g, [bx - 20, -112, bx + bw + 20, -112], 3.6, '#141210'); lineR(g, [bx - 20, -112.6, bx + bw + 20, -112.6], 2, dimR(STEEL, 0.2)[1]);
    for (const [px, A] of [[bx - 12, SHIELD_R], [bx + bw + 12, SHIELD_B]] as const) roundShield(g, px, -112, 18, dimR(A, 0.3), dimR(SHIELD_Y, 0.3));
  }
  // ---- the PLASTIC THRONE: a gold-sprayed lawn chair, antlers glued to its back, a fake fur over it, his towel
  {
    const tx = rx(THRONE), G = dimR(GOLDP, 0.22);
    for (const s of [-1, 1]) shapeR(g, () => { g.moveTo(tx + s * 8, -140); g.quadraticCurveTo(tx + s * 30, -170, tx + s * 26, -190); g.lineTo(tx + s * 22, -186); g.quadraticCurveTo(tx + s * 24, -168, tx + s * 4, -142); g.closePath(); }, dimR(['#E8DCC0', '#C8B890', '#A89870', '#7A6C4C', '#2A2418'], 0.25), tx - 30, tx + 30, 1);
    shapeR(g, () => g.roundRect(tx - 26, -144, 52, 74, 6), G, tx - 26, tx + 26, 1.2);
    for (let k = 0; k < 5; k++) pxR(g, tx - 22, -136 + k * 12, 44, 3, G[3]);
    shapeR(g, () => g.rect(tx - 34, -74, 68, 10), G, tx - 34, tx + 34, 1.1);
    for (const lx of [tx - 30, tx + 26]) shapeR(g, () => g.rect(lx, -64, 4, 64 + PB), G, lx, lx + 4, 0.8);
    shapeR(g, () => { g.moveTo(tx - 24, -130); g.quadraticCurveTo(tx, -138, tx + 24, -130); g.lineTo(tx + 30, -70); g.quadraticCurveTo(tx, -62, tx - 30, -70); g.closePath(); }, dimR(FUR, 0.3), tx - 30, tx + 30, 1);
    for (let k = 0; k < 18; k++) lineR(g, [tx - 26 + k * 3, -72 + (k % 2) * 2, tx - 27 + k * 3, -66], 1, dimR(FUR, 0.3)[2]);
    shapeR(g, () => { g.moveTo(tx + 10, -144); g.lineTo(tx + 26, -144); g.lineTo(tx + 28, -100); g.lineTo(tx + 18, -96); g.lineTo(tx + 16, -130); g.closePath(); }, dimR(['#E2E2E8', '#B8B8C2', '#9898A2', '#6C6C76', '#26262E'], 0.25), tx + 10, tx + 28, 1);
    pxR(g, tx + 20, -142, 2, 40, dimR(RED, 0.3)[1]);
    // (the protein tub by its foot, his sign)
    shapeR(g, () => g.roundRect(tx + 40, PB - 26, 20, 26, 3), dimR(['#3A3A44', '#26262E', '#1A1A20', '#101014', '#040406'], 0.15), tx + 40, tx + 60, 1);
    pxR(g, tx + 42, PB - 18, 16, 8, dimR(RED, 0.2)[1]); signAt(g, 'WHEY', tx + 50, PB - 15, 1, print(1, '#FFFFFF'));
    shapeR(g, () => g.rect(tx + 64, PB - 50, 44, 30), dimR(CARD, 0.25), tx + 64, tx + 108, 1);
    signAt(g, 'THRONE', tx + 86, PB - 44, 1, print(1, '#2A1A0C')); signAt(g, 'DO NOT', tx + 86, PB - 36, 1, print(1, '#2A1A0C')); signAt(g, 'SIT. BEN.', tx + 86, PB - 28, 1, print(1, '#8A1A0C'));
    lineR(g, [tx + 86, PB - 20, tx + 86, PB], 2, dimR(TWO4, 0.3)[3]);
  }
  // ---- his army cot under a fake fur, the mini fridge, a CRT on it and the VHS stack
  {
    const cx = 690;
    shapeR(g, () => g.rect(cx, PB - 22, 100, 8), dimR(OLIVE, 0.25), cx, cx + 100, 1);
    for (const lx of [cx + 4, cx + 92]) lineR(g, [lx, PB - 14, lx + 4, PB], 2, dimR(OLIVE, 0.25)[4]);
    shapeR(g, () => { g.moveTo(cx + 4, PB - 30); g.quadraticCurveTo(cx + 50, PB - 36, cx + 96, PB - 28); g.lineTo(cx + 98, PB - 16); g.lineTo(cx + 2, PB - 16); g.closePath(); }, dimR(FUR, 0.3), cx + 2, cx + 98, 1);
    shapeR(g, () => g.ellipse(cx + 14, PB - 30, 12, 6, 0, 0, Math.PI * 2), dimR(['#E8E8F0', '#C8C8D4', '#A8A8B6', '#7A7A88', '#2A2A34'], 0.3), cx + 2, cx + 26, 1);
    shapeR(g, () => g.rect(cx + 110, PB - 52, 34, 52), dimR(['#E8E8EC', '#C8C8D0', '#A6A6B0', '#7C7C88', '#2A2A32'], 0.3), cx + 110, cx + 144, 1.1);
    pxR(g, cx + 112, PB - 34, 30, 1, '#2A2A32'); pxR(g, cx + 138, PB - 46, 2, 8, '#4A4A54');
    shapeR(g, () => g.roundRect(cx + 108, PB - 86, 38, 34, 3), dimR(['#4A4A52', '#2E2E36', '#22222A', '#16161C', '#060608'], 0.2), cx + 108, cx + 146, 1);
    shapeR(g, () => g.roundRect(cx + 112, PB - 82, 26, 24, 4), ['#3A5A6A', '#22404E', '#18303A', '#0E2028', '#04080A'], cx + 112, cx + 138, 0.8);
    pxR(g, cx + 114, PB - 80, 6, 2, 'rgba(200,230,240,0.4)');
    for (let k = 0; k < 4; k++) shapeR(g, () => g.rect(cx + 60 + (k % 2) * 3, PB - 6 - k * 6, 26, 6), dimR(['#3A3A44', '#26262E', '#1A1A20', '#101014', '#040406'], 0.1), cx + 60, cx + 89, 0.6);
    signAt(g, 'VIKINGS OF STEEL', cx + 74, PB - 27, 1, print(1, '#C8402A'));
  }
  // ---- the intern's things (right end): the bin of foam axes, his locker
  {
    const ix = 812;
    shapeR(g, () => g.rect(ix - 14, -160, 28, 160 + PB), dimR(['#7A8A9A', '#5A6A7A', '#46545E', '#323C44', '#10141A'], 0.3), ix - 14, ix + 14, 1);
    for (let k = 0; k < 4; k++) pxR(g, ix - 9, -150 + k * 4, 18, 1.4, '#141A20');
    shapeR(g, () => g.rect(ix - 10, -120, 20, 8), ['#FFFFFF', '#F2F2F6', '#D8D8E0', '#AEAEBA', '#3A3A44'], ix - 10, ix + 10, 0.6); signAt(g, 'INTERN', ix, -118, 1, print(1, '#1A1A40'));
    shapeR(g, () => { g.moveTo(ix - 52, PB - 28); g.lineTo(ix - 24, PB - 28); g.lineTo(ix - 27, PB); g.lineTo(ix - 49, PB); g.closePath(); }, dimR(['#4A7AC0', '#365E9A', '#24426E', '#162C4C', '#060C18'], 0.2), ix - 52, ix - 24, 1);
    for (let k = 0; k < 4; k++) { lineR(g, [ix - 46 + k * 6, PB - 28, ix - 48 + k * 7, PB - 48], 2.4, '#1A0B06'); lineR(g, [ix - 46 + k * 6, PB - 28, ix - 48 + k * 7, PB - 48], 1.4, dimR(['#FACC15', '#EAB308', '#CA8A04', '#A16207', '#3A2400'], 0.2)[0]); ellR(g, ix - 48 + k * 7, PB - 50, 4, 5, dimR(FOAM, 0.2)[1]); }
  }
};
// ---- Ben's dressing, more of it (the owner: "make the details in bens lairs in general more....detailed" / "all lairs
// to be on the same high quality baseline"): his workbench under the helmet rack (a scaffold plank on two sawhorses: a
// vise with a party helmet in it being plated with a stolen pavilion hubcap, a welding mask, a coffee can of
// bolts, the hot plate with a pot of lutefisk on it, a blender of raw eggs), the weld scorch on the fallen flat's back;
// his stencil on the footing (SWEAT IS JUST YOUR FAT CRYING); a poster by the door (VALHALLA IS FOR FINISHERS); chalk
// handprints on the flats by the bench, a chalk bucket, its dust on the mats. Dimmed: none of it's stood on.
const paintDress = (g: Ctx) => {
  const TW = dimR(TWO4, 0.3), SR = dimR(STEEL, 0.3);
  // ---- the stencil up on the footing, over the flats
  signAt(g, 'SWEAT IS JUST', 170, -H + 36, 2, stencil(2, '#D8D0B8'));
  signAt(g, 'YOUR FAT CRYING', 170, -H + 54, 2, stencil(2, '#D8D0B8'));
  // ---- VALHALLA IS FOR FINISHERS: a poster on the first flat, over the door's push bar
  { const x = 14, y = -262, w = 76, h = 92;
    shapeR(g, () => g.rect(x, y, w, h), dimR(['#F4E8C8', '#DCCCA4', '#BCAA80', '#8A7A58', '#2A2418'], 0.22), x, x + w, 1);
    box(g, x + 3, y + 3, w - 6, 40, dimR(['#3E6EC0', '#2C5296', '#1E386A', '#142848', '#0A1428'], 0.2)[1]);
    // (a horned helmet over a barbell, printed)
    shapeR(g, () => g.ellipse(x + w / 2, y + 30, 16, 11, 0, Math.PI, 0), dimR(STEEL, 0.2), x + w / 2 - 16, x + w / 2 + 16, 1);
    for (const s of [-1, 1]) shapeR(g, () => { g.moveTo(x + w / 2 + s * 14, y + 24); g.quadraticCurveTo(x + w / 2 + s * 28, y + 18, x + w / 2 + s * 26, y + 6); g.lineTo(x + w / 2 + s * 22, y + 12); g.quadraticCurveTo(x + w / 2 + s * 20, y + 20, x + w / 2 + s * 10, y + 22); g.closePath(); }, dimR(FUR, 0.2), x + w / 2 - 28, x + w / 2 + 28, 0.8);
    lineR(g, [x + 10, y + 36, x + w - 10, y + 36], 2, '#141210'); for (const s of [-1, 1]) shapeR(g, () => g.rect(x + w / 2 + s * 26 - 3, y + 30, 6, 12), dimR(['#5A5A64', '#3A3A44', '#2A2A32', '#1C1C22', '#08080A'], 0.2), x + w / 2 + s * 26 - 3, x + w / 2 + s * 26 + 3, 0.8);
    signAt(g, 'VALHALLA', x + w / 2, y + 54, 1, print(1, '#2A1A0C'));
    signAt(g, 'IS FOR', x + w / 2, y + 66, 1, print(1, '#2A1A0C'));
    signAt(g, 'FINISHERS', x + w / 2, y + 78, 1, print(1, '#A8301E'));
    for (const [tx, ty] of [[x - 2, y - 2], [x + w - 8, y - 2], [x - 2, y + h - 4], [x + w - 8, y + h - 4]] as const) box(g, tx, ty, 10, 5, 'rgba(200,196,170,0.7)');
  }
  // ---- the weld scorch on the fallen flat's raw back, behind the bench: a sooty bloom, spatter
  for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(8,6,4,${(0.14 + k * 0.07).toFixed(2)})`; g.beginPath(); g.ellipse(318, -76, 50 - k * 10, 24 - k * 5, 0, 0, Math.PI * 2); g.fill(); }
  for (let k = 0; k < 20; k++) pxR(g, 276 + hash(k + 880) * 84, -98 + hash(k + 890) * 40, 1, 1, k % 3 ? 'rgba(240,190,110,0.7)' : 'rgba(255,244,200,0.85)');
  // ---- the chalk handprints on the flats by the longship bench
  for (const [hx, hy] of [[372, -96], [534, -118], [548, -100]] as const) {
    g.fillStyle = dith(g, 'rgba(236,232,224,0.55)'); g.beginPath(); g.ellipse(hx, hy, 4, 5, 0, 0, Math.PI * 2); g.fill();
    for (let f = 0; f < 4; f++) box(g, hx - 4 + f * 2.4, hy - 10 + Math.abs(f - 1.5), 1.4, 5, dith(g, 'rgba(236,232,224,0.55)'));
  }
  // ---- the bench: a scaffold plank on two sawhorses
  { const x = 262, w = 110, top = -58;
    for (const sx of [x + 14, x + w - 14]) { for (const s of [-1, 1]) { lineR(g, [sx, top + 4, sx + s * 12, PB], 4, TW[4]); lineR(g, [sx, top + 4, sx + s * 12, PB], 2.4, TW[1]); } shapeR(g, () => g.rect(sx - 10, top + 2, 20, 5), TW, sx - 10, sx + 10, 0.8); }
    lineR(g, [x + 14, -30, x + w - 14, -30], 2.4, TW[3]);
    shapeR(g, () => g.rect(x, top - 6, w, 7), TW, x, x + w, 1); pxR(g, x + 1, top - 5, w - 2, 1, TW[0]);
    // (under it: the coffee can of bolts, a stack of stolen hubcaps from the pavilions' carts)
    shapeR(g, () => g.rect(x + 40, PB - 16, 12, 16), SR, x + 40, x + 52, 0.8);
    for (let k = 0; k < 4; k++) shapeR(g, () => g.ellipse(x + 76, PB - 3 - k * 4, 13, 3, 0, 0, Math.PI * 2), SR, x + 63, x + 89, 0.7);
    // (the vise, a party helmet in its jaws with a hubcap half riveted on its crown; a fresh bead)
    const vx = x + 18;
    shapeR(g, () => g.rect(vx - 10, top - 20, 22, 14), dimR(['#7AA6E8', '#3E6EC0', '#2C5296', '#1E386A', '#0A1428'], 0.25), vx - 10, vx + 12, 0.9);
    partyHelmet(g, vx + 1, top - 26, 1.1);
    shapeR(g, () => g.ellipse(vx + 1, top - 34, 9, 3.4, 0, 0, Math.PI * 2), SR, vx - 8, vx + 10, 0.8); pxR(g, vx - 3, top - 36, 5, 1, STEEL[0]);
    for (let k = 0; k < 5; k++) pxR(g, vx - 7 + k * 3, top - 31, 2, 1, 'rgba(255,220,140,0.9)');
    // (the welding mask face down, the rivet gun)
    shapeR(g, () => g.roundRect(x + 36, top - 18, 22, 12, 3), dimR(['#4A4A52', '#2E2E36', '#22222A', '#16161C', '#060608'], 0.1), x + 36, x + 58, 0.9);
    pxR(g, x + 41, top - 14, 12, 4, '#1E3A22'); pxR(g, x + 41, top - 14, 4, 1, '#5A8A5A');
    // (the hot plate and its pot of lutefisk, the blender of raw eggs)
    shapeR(g, () => g.roundRect(x + 82, top - 10, 26, 5, 1.4), dimR(['#4A4A56', '#34343C', '#2A2A30', '#202026', '#0C0C10'], 0.1), x + 82, x + 108, 0.9);
    shapeR(g, () => g.rect(x + 86, top - 26, 18, 16), SR, x + 86, x + 104, 1); pxR(g, x + 85, top - 27, 20, 2, SR[3]);
    lineR(g, [x + 104, top - 22, x + 112, top - 24], 2, SR[4]);
    const bl = x + 70;
    shapeR(g, () => g.rect(bl - 6, top - 12, 12, 12), dimR(['#4A4A52', '#2E2E36', '#22222A', '#16161C', '#060608'], 0.1), bl - 6, bl + 6, 0.8);
    shapeR(g, () => { g.moveTo(bl - 6, top - 12); g.lineTo(bl + 6, top - 12); g.lineTo(bl + 8, top - 36); g.lineTo(bl - 8, top - 36); g.closePath(); }, ['#E8F0F4', '#C8D8E0', '#A0B4C0', '#708894', '#283840'], bl - 8, bl + 8, 0.9);
    box(g, bl - 6, top - 22, 12, 9, '#E8C86A'); box(g, bl - 6, top - 22, 12, 2, '#FFF0B0');
    pxR(g, bl - 8, top - 38, 16, 3, '#1A1A20');
  }
  // ---- the chalk bucket by the bench's end, its dust on the mats
  { const cb = 362;
    shapeR(g, () => { g.moveTo(cb - 8, PB - 20); g.lineTo(cb + 8, PB - 20); g.lineTo(cb + 6, PB); g.lineTo(cb - 6, PB); g.closePath(); }, SR, cb - 8, cb + 8, 1);
    ellR(g, cb, PB - 20, 8, 2.4, '#E8E4DC'); pxR(g, cb - 5, PB - 21, 5, 1, '#FFFFFF');
    for (let k = 0; k < 30; k++) pxR(g, 330 + hash(k + 950) * 200, BACK + 8 + hash(k + 960) * 14, 2, 1, `rgba(236,232,224,${(0.25 + hash(k + 970) * 0.35).toFixed(2)})`);
  }
};
/** The light painted on: the dark gathered into the corners and up under the ceiling. */
const paintShade = (g: Ctx) => {
  for (let i = 0; i < 4; i++) {
    g.fillStyle = `rgba(6,4,2,${0.08 + i * 0.045})`;
    g.fillRect(-60, -H - 80, W + 120, 60 + (3 - i) * 26);
    g.fillRect(-60, -H - 80, 30 + (3 - i) * 20, H + 120);
    g.fillRect(W + 30 - (3 - i) * 20, -H - 80, 30 + (3 - i) * 20, H + 120);
  }
};
const paintRoom = (g: Ctx) => { paintFooting(g); paintFlats(g); paintFloor(g); paintDress(g); paintProps(g); paintShade(g); };
/** The near beam along the ceiling (silhouette, in front), its drips' edge. */
const paintBeam = (g: Ctx) => {
  box(g, -60, -H - 80, W + 120, 70, '#0A0806');
  for (let x = -60; x < W + 60; x += 3) box(g, x, -H - 10, 3, 4 + Math.sin(x * 0.07) * 2 + (hash(x) > 0.9 ? 5 : 0), '#0A0806');
  box(g, -60, -H - 12, W + 120, 1, '#2A2420');
};
/** The keg on its chain (local: its middle at 0,0; the chain's drawn live). */
const paintHungKeg = (g: Ctx) => {
  keg(g, 0, KEG.h / 2, KEG.w, KEG.h, KEGS);
  // (the target painted on its bottom, the tap out its side)
  ellR(g, 0, KEG.h / 2 - 2, 10, 2.4, '#DC2626'); ellR(g, 0, KEG.h / 2 - 2, 6, 1.4, '#FFFFFF'); ellR(g, 0, KEG.h / 2 - 2, 2.4, 0.8, '#DC2626');
  shapeR(g, () => g.rect(KEG.w / 2 - 2, 4, 8, 6), STEEL, KEG.w / 2 - 2, KEG.w / 2 + 6, 0.8);
};
const paintHungKegBust = (g: Ctx) => {
  paintHungKeg(g);
  // (dented in under, the tap blown off, the hole)
  ellR(g, -4, KEG.h / 2 - 6, 9, 4, KEGS[3]); ellR(g, -4, KEG.h / 2 - 7, 6, 2.4, KEGS[1]);
  box(g, KEG.w / 2 - 2, 3, 9, 8, '#120C08'); ellR(g, KEG.w / 2, 7, 2.4, 2.4, '#000000');
};

// ---------------------------------------------------------------------------------------------------------------
// Drawing

const seen = (state: GameState, a: number, b: number, t: number, bt: number) =>
  b > state.camera.x - 20 && a < state.camera.x + CANVAS_WIDTH + 20 && bt > state.camera.y - 20 && t < state.camera.y + 620;
/** A silk-flame torch's flicker (about 1). */
const flick = (f: number, k: number) => 0.85 + Math.sin(f * 0.31 + k * 2) * 0.08 + Math.sin(f * 0.77 + k) * 0.05;
/** A silk flame (a fan blowing orange cloth up: it ripples, never burns), at (x, y) its base. */
const silkFlame = (c: Ctx, x: number, y: number, f: number, k: number) => {
  const w = flick(f, k);
  for (let i = 0; i < 3; i++) {
    const sway = Math.sin(f * 0.4 + i * 2 + k) * 2;
    c.fillStyle = ['#C2410C', '#F97316', '#FDE047'][i];
    c.beginPath(); c.moveTo(x - 6 + i * 2, y); c.quadraticCurveTo(x - 6 + i * 2 + sway, y - (14 - i * 3) * w, x + sway * 1.5, y - (20 - i * 5) * w); c.quadraticCurveTo(x + 6 - i * 2 + sway, y - (12 - i * 3) * w, x + 6 - i * 2, y); c.closePath(); c.fill();
  }
  for (let r = 3; r > 0; r--) { c.fillStyle = `rgba(255,170,90,${0.05 * (4 - r) * w})`; c.beginPath(); c.arc(x, y - 8, 6 + r * 7, 0, Math.PI * 2); c.fill(); }
};

/** World space, behind everything that moves (after Norway's own): the halls and the doorman up top; the hall below. */
export const drawValhallaBack = (c: Ctx, state: GameState) => {
  const h = hallOf(state), f = state.frame;
  // ---- up top
  if (seen(state, X(FACADE.a) - 60, X(DOORMAN.x) + 60, GY - 400, GY + 80)) {
    // (the halls: up out of the river as the lift brings them, cut off at the water's line)
    if (h.lift > 0) {
      const rise = Math.round((1 - h.lift) * (FH + 40)), shake = h.lift < 1 ? (f % 4 < 2 ? 1 : -1) : 0;
      c.save(); c.beginPath(); c.rect(X(FACADE.a) - 60, GY - FH - 40, FW + 120, FH + 40 + 34); c.clip();
      c.save(); c.translate(X(DOOR) + shake, GY + rise);
      stamp(c, 'fl-valhalla-facade', FL - 40, -FH - 30, FW + 80, FH + 100, paintFacade);
      // (the plastic torches either side of the door: silk flames on their fans)
      for (const s of [-1, 1]) {
        box(c, s * 34 - 2, -60, 5, 30, '#2A1A08'); box(c, s * 34 - 1, -60, 3, 30, '#6A4422');
        box(c, s * 34 - 5, -64, 11, 6, '#3A3A40');
        silkFlame(c, s * 34 + 0.5, -64, f, s);
      }
      c.restore();
      c.restore();
      if (h.lift >= 1) {
        // (the dock and its fog machine, puffing now and then)
        c.save(); c.translate(X(DOCK.a), GY);
        stamp(c, 'fl-valhalla-dock', -2, -2, DW + 4, 44, paintDock);
        c.restore();
        c.save(); c.translate(X(DOCK.a) + 30, GY); stamp(c, 'fl-valhalla-fogger', -16, -18, 38, 20, paintFogger); c.restore();
        for (let i = 0; i < 6; i++) {
          const u = ((f * 0.6 + i * 37) % 160) / 160, fx = X(DOCK.a) + 50 + u * 160, fy = GY - 6 - Math.sin(u * Math.PI) * 10;
          c.fillStyle = `rgba(226,232,240,${0.22 * Math.sin(u * Math.PI)})`; c.beginPath(); c.ellipse(fx, fy, 16 + u * 22, 6 + u * 4, 0, 0, Math.PI * 2); c.fill();
        }
      }
    }
    // (the doorman, once he's there: facing whoever's about)
    if (doormanThere(state)) {
      const dx = X(DOORMAN.x), face: 1 | -1 = state.player.pos.x + state.player.width / 2 < dx ? -1 : 1;
      const pose = h.door.pose === 'talk' && h.door.poseT % 50 > 30 ? 'stand' : h.door.pose;
      drawDoorman(c, dx, Y(DOORMAN.h), face, pose);
    }
  }
  // ---- the hall
  if (!seen(state, LA - 80, X(HALL.b) + 80, F - H - 80, F + 260)) return;
  c.save(); c.translate(LA, F);
  const CH = 4, cw = (W + 120) / CH;
  for (let i = 0; i < CH; i++) {
    const bx = -60 + i * cw;
    if (!seen(state, LA + bx, LA + bx + cw, F - H - 80, F + 260)) continue;
    stamp(c, `fl-valhalla-room2-${i}`, bx, -H - 80, cw, H + 340, g => { g.save(); g.beginPath(); g.rect(bx, -H - 80, cw, H + 340); g.clip(); paintRoom(g); g.restore(); });
  }
  // (the torches' silk flames, the EXIT sign's glow, the seep's drips)
  TORCHES.forEach((t, i) => silkFlame(c, t.x, t.y - 1, f, i + 3));
  c.fillStyle = '#7F1D1D'; c.fillRect(EXIT.x - 15, EXIT.y - 8, 30, 10);
  c.fillStyle = 'rgba(255,60,60,0.18)'; c.beginPath(); c.ellipse(EXIT.x, EXIT.y - 3, 34, 16, 0, 0, Math.PI * 2); c.fill();
  signAt(c, 'EXIT', EXIT.x, EXIT.y - 6, 1, print(1, '#FF8A8A'));
  for (let i = 0; i < 3; i++) {
    const t = ((f + i * 53) % 110) / 110;
    c.fillStyle = 'rgba(170,200,210,0.85)'; c.fillRect(SEEP - 4 + i * 5, Math.round(-H + 6 + t * (H + PB - 6)), 2, 3);
  }
  // (the hot plate's coil on the bench, the lutefisk's steam)
  { const ht = 0.7 + Math.sin(f * 0.06) * 0.3;
    c.fillStyle = `rgba(255,${Math.round(90 + 60 * ht)},40,${(0.5 + 0.35 * ht).toFixed(2)})`; c.fillRect(348, -66, 18, 1);
    for (let i = 0; i < 3; i++) { const u = ((f * 0.4 + i * 33) % 100) / 100; c.fillStyle = `rgba(230,228,220,${(0.3 * (1 - u)).toFixed(2)})`; c.fillRect(Math.round(356 + Math.sin(f * 0.05 + i * 2) * 4), Math.round(-88 - u * 40), Math.round(3 + u * 4), Math.round(3 + u * 4)); } }
  // (the keg's chain up to the beam)
  const kb = kegBox(h);
  c.restore();
  c.strokeStyle = '#141210'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(KEG.x), HALL.ceil); c.lineTo(kb.cx, kb.top); c.stroke();
  c.strokeStyle = '#6C7280'; c.lineWidth = 1; c.setLineDash([2, 2]); c.beginPath(); c.moveTo(X(KEG.x), HALL.ceil); c.lineTo(kb.cx, kb.top); c.stroke(); c.setLineDash([]);
  // (the keg itself: painted once, put down turned the way it's swung)
  c.save(); c.translate(kb.cx, (kb.top + kb.bottom) / 2); c.rotate(-h.keg.a);
  const bust = h.keg.burst >= 0;
  stamp(c, bust ? 'fl-valhalla-keg-bust' : 'fl-valhalla-keg', -KEG.w / 2 - 4, -KEG.h / 2 - 4, KEG.w + 16, KEG.h + 8, bust ? paintHungKegBust : paintHungKeg);
  c.restore();
  // Ben
  const b = h.ben, at = benAt(state);
  drawBen(c, at.x, at.y, b.facing, b.pose, Math.floor(b.poseT / 5), b.piece);
};

/** A foam axe, baked once, put down turned. */
let foamCv: HTMLCanvasElement | null | undefined;
const foamCanvas = () => {
  if (foamCv !== undefined) return foamCv;
  if (typeof document === 'undefined') return (foamCv = null);
  const cv = document.createElement('canvas'); cv.width = 32; cv.height = 32;
  const g = cv.getContext('2d')!;
  g.translate(16, 16);
  lineR(g, [-11, 9, 6, -8], 4, '#1A0B06'); lineR(g, [-11, 9, 6, -8], 2.4, '#FACC15');
  shapeR(g, () => { g.moveTo(1, -12); g.quadraticCurveTo(14, -12, 13, 1); g.quadraticCurveTo(7, 0, 4, -5); g.closePath(); }, FOAM, 1, 14, 1);
  pxR(g, 4, -10, 5, 2, FOAM[0]);
  foamCv = cv;
  return cv;
};
const drawFoam = (c: Ctx, a: Foam) => {
  const cv = foamCanvas();
  if (!cv) return;
  c.save(); c.translate(Math.round(a.x), Math.round(a.y)); c.rotate(a.rot); c.drawImage(cv, -16, -16); c.restore();
};

/** World space, in front of everything: up top the doorman's words; down below the foam axes, fog along the floor, the
 *  near beam, Ben's words. */
export const drawValhallaFront = (c: Ctx, state: GameState) => {
  const h = hallOf(state), f = state.frame;
  if (h.door.said && doormanThere(state)) saidOver(c, h.door.said.text, X(DOORMAN.x), Y(DOORMAN.h) - 112, '#BBF7D0', 220);
  if (!seen(state, LA - 80, X(HALL.b) + 80, F - H - 80, F + 60)) return;
  for (const a of h.foam) drawFoam(c, a);
  // (the fog machine's fog, crawling along the floor from the door end)
  for (let i = 0; i < 10; i++) {
    const u = ((f * 0.35 + i * 53) % 700) / 700, fx = LA + 150 + u * 620, fy = F - 8 - Math.sin(i * 1.7 + f * 0.01) * 3;
    c.fillStyle = `rgba(210,220,230,${0.13 * Math.sin(u * Math.PI)})`; c.beginPath(); c.ellipse(fx, fy, 40 + u * 30, 9, 0, 0, Math.PI * 2); c.fill();
  }
  c.save(); c.translate(LA, F);
  const CH = 3, cw = (W + 120) / CH;
  for (let i = 0; i < CH; i++) {
    const bx = -60 + i * cw;
    if (!seen(state, LA + bx, LA + bx + cw, F - H - 80, F - H + 20)) continue;
    stamp(c, `fl-valhalla-beam-${i}`, bx, -H - 80, cw, 84, g => { g.save(); g.beginPath(); g.rect(bx, -H - 80, cw, 84); g.clip(); paintBeam(g); g.restore(); });
  }
  c.restore();
  // (his words over his head, only while they're said; not while his gross-up's got them)
  if (h.ben.said && !h.script?.gross) { const at = benAt(state); saidOver(c, h.ben.said.text, at.x, benHeadY(at.y), '#FFFFFF', 220); }
};

/** Down here: dark, the silk-flame torches' orange (flickering), the EXIT sign's red, the seep's cold blue; a soft glow
 *  about him so he's never lost in it. */
export const hallLighting = (state: GameState): SceneLight => {
  const f = state.frame, p = state.player;
  const lights: Light[] = [
    ...TORCHES.map((t, i): Light => { const k = flick(f, i + 3); return { x: LA + t.x, y: F + t.y - 10, r: 260, a: 0.85 * k, color: `rgba(255,150,70,${(0.15 * k).toFixed(3)})` }; }),
    { x: LA + EXIT.x, y: F + EXIT.y, r: 110, a: 0.6, color: 'rgba(255,60,60,0.14)' },
    { x: LA + 356, y: F - 70, r: 80, a: 0.5, color: 'rgba(255,110,50,0.12)' },
    { x: LA + SEEP, y: F - H + 4, r: H, cone: 70, a: 0.4, color: 'rgba(150,200,220,0.08)' },
    { x: p.pos.x + p.width / 2, y: p.pos.y + 20, r: 150, a: 0.4 },
  ];
  return { dark: 0.52, shade: [12, 8, 6], rim: 0.5, lights };
};
export { inHall, hallView };
