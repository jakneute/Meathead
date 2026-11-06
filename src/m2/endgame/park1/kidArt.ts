// ZORZARBLAX, drawn: Zorblax and Zarblax's kid. Their son, grown (twenty-six, the owner's "young adult"), still at
// home, mutated by being what he is. His dad's animal (crater/aliens.ts, m1 alienLook's colors): the tiny cranium
// perched on the front of a neck wider than it, the cinder-block jaw with the under-bite and the yellow pegs jutting
// up over the lip, the olive hide, veiny and wet; his dad's ray gun grown into his forearm (it came with him). His
// mom's (endgame/shots.ts): her lips (a smear of her lipstick he steals), her wart with its hair, the crest of a
// ponytail off the back of the cranium (in her curlers: she still does his hair). And what the family tree did to
// him: THREE eyes, none of them a match (two of his dad's beady yellow ones, one big lashed one of his mom's up top,
// looking somewhere else), THREE arms (the long gun arm, a normal one, and a little one out of his chest that never
// stops going), one leg shorter than the other (the hop in his walk).
//
// The flourish pass (the owner's: "give a 'flourish' pass to the first boss and make sure he has the same general
// level of detail as area bosses"): a manchild, not a turtle. A slouch, not a shell: round shoulders, a soft pot gut
// pushed out under a band tee two sizes too small (riding up, the belly button and its trail out under it), skinny
// green arms and shins, knobby knees. The face does the acting: a heavy brow over dad's eyes that knits (angry), climbs
// (hurt) or droops (the dead-eyed idle); a pug snout; the under-bite's pegs over a thick lipsticked lower lip, a wispy
// try at a mustache, patchy stubble, zits (a whitehead or two), warts, veins up the neck and the gun arm. The shirt's a
// GLORP tee (their three-eyed skull), stretched (pull lines over the gut), pitted out, Cheeto-fingered, a hole worn
// through it where the chest arm comes out; mesh basketball shorts with a side stripe, sagging off the plaid boxers'
// band; tube socks gone gray at the toe, pool slides, his three toes out the front; the gaming headset round his neck,
// its mic boom up by his mouth.
//
// About 150 tall, feet at the origin, facing right; every elbow and knee from art/limb.ts. Painted at boss grade the
// way Dad Guy is (cartoon/amphi/paint.ts: ramps of light, base, shade, deep, line, stepped with a dithered seam,
// every material its own darkest tone for an outline). Stamped per pose and frame; the live bits (the palm's glow,
// the drool) over it. Turned (the fall into the slide's mouth), he's baked once and the bake drawn turned.

import { stamp } from '../../../m1/game/render/stamp';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { elbow, knee, reachTo } from '../../art/limb';
import { type Ramp, shape, shapeTop, limb as tube, ell, px, line, fill, dith } from '../../cartoon/amphi/paint';

type Ctx = CanvasRenderingContext2D;
type P = [number, number];
const TAU = Math.PI * 2;

// ---- the ramps (light, base, shade, deep, line)
const HIDE: Ramp = ['#C0D494', '#97B46A', '#74994E', '#587F40', '#15241A'];
/** The far side of him (the far arm, the far leg): a step down. */
const HIDE_F: Ramp = ['#97B46A', '#74994E', '#587F40', '#416536', '#0B140C'];
const GUT: Ramp = ['#E6E0AE', '#CEC888', '#B0AA64', '#8E8A48', '#2E2E16'];
const SHIRT: Ramp = ['#FFF3B0', '#F6D445', '#D4A52A', '#A87818', '#3E2806'];
const SHORTS: Ramp = ['#C9B8FF', '#8B5CF6', '#6D28D9', '#4C1D95', '#160832'];
const SHORTS_F: Ramp = ['#8B5CF6', '#6D28D9', '#5B21B6', '#4C1D95', '#0E0420'];
const SOCK: Ramp = ['#FFFFFF', '#ECE8DE', '#CEC6B4', '#A69C86', '#3E382C'];
const SLIDE: Ramp = ['#9ACBFF', '#3B82F6', '#1D4ED8', '#1E3A8A', '#081232'];
const CURL: Ramp = ['#D6E8FF', '#60A5FA', '#2563EB', '#1E3A8A', '#0A1638'];
const CURL_P: Ramp = ['#FFD6EC', '#F472B6', '#DB2777', '#9D174D', '#3A0418'];
const HAIR: Ramp = ['#7A5E48', '#4A3424', '#33221A', '#22160E', '#0A0604'];
const SET: Ramp = ['#8A8A94', '#4A4A54', '#303038', '#1C1C22', '#020204'];
const GUN: Ramp = ['#F1F3F8', '#B8BCC8', '#7E8494', '#4E5464', '#14161C'];
const LIP: Ramp = ['#FFA8C0', '#F43F6E', '#C81E4E', '#8A1034', '#2E0410'];
const PEG: Ramp = ['#FBF4CC', '#DCCC88', '#B09C54', '#7A6A30', '#2A2008'];
const WART: Ramp = ['#B8C878', '#8A9A50', '#6A7A3A', '#4A5A2A', '#1A2208'];
const MOM_W: Ramp = ['#FFFFFF', '#F4F2EE', '#D8D2C8', '#AEA698', '#3A342C'];
const DAD_Y: Ramp = ['#FFF6B0', '#E8D84A', '#C8B430', '#A8962A', '#3A1006'];
const BOXER = ['#E23A3A', '#F4F0E6', '#2A4AA8'];
const VEIN = ALIEN.vein, VEIN_L = ALIEN.veinLight;
const SLIME = ALIEN.slime, SLIME_L = ALIEN.slimeLight;
const ZIT = '#D2564A', ZIT_H = '#FFF7D6', STUB = '#2E4022', CHEETO = '#F08A1C', SWEAT = '#B89420', LED = '#22D3EE';

export type KidPose =
  | 'idle' | 'walk' | 'talk' | 'sit' | 'hurt' | 'stagger' | 'stun' | 'spasm'
  // (his misery: stood whining, clutching the gut; scratching the rash; down on his short leg, doubled over)
  | 'whine' | 'scratch' | 'buckle'
  // (the swings: each a windup and its follow-through)
  | 'slamUp' | 'slamDown' | 'lowBack' | 'lowThru' | 'highBack' | 'highThru' | 'whipBack' | 'whipOut' | 'grabReach' | 'grabHold'
  | 'retch' | 'puke' | 'aim' | 'fire' | 'stomp' | 'stompDown';
export const KID_POSES: KidPose[] = ['idle', 'walk', 'talk', 'sit', 'hurt', 'stagger', 'stun', 'spasm', 'whine', 'scratch', 'buckle', 'slamUp', 'slamDown', 'lowBack', 'lowThru', 'highBack', 'highThru', 'whipBack', 'whipOut', 'grabReach', 'grabHold', 'retch', 'puke', 'aim', 'fire', 'stomp', 'stompDown'];
/** Which arm's up to fire (the aim and fire poses): 0 the long gun arm, 1 the far one, 2 the little chest one. `q`: the
 *  frame of a looping pose (kidFrames of them). `noHand`: the gun arm's hand left off (the whip: it's out at the lash's
 *  end, drawn live). */
export interface KidOpts { pose: KidPose; q: number; arm?: 0 | 1 | 2; mouth?: boolean; noHand?: boolean }
/** How many frames a pose loops through (the rest are held). */
const FRAMES: Partial<Record<KidPose, number>> = { walk: 8, idle: 4, talk: 4, whine: 4, buckle: 4, stun: 4, spasm: 4, scratch: 2, grabHold: 2, retch: 2, stagger: 2 };
export const kidFrames = (p: KidPose) => FRAMES[p] ?? 1;
/** How much bigger than the art he's drawn in the world (the owner's "big lumbering monstrosity"): about 250 tall
 *  hunched, four Meatheads. */
export const KID_S = 1.55;

// (the bones: long, gangly, a knuckle-dragger's (the swings reach a long way off him); where the little arm comes out)
const GUN_A = 54, GUN_B = 60, FAR_A = 50, FAR_B = 56, KID_A = 22, KID_B = 24;
/** His hips' height off the floor (low: bowed, squat legs under a gut that hangs to his knees). */
const HIP = -46;

/** The kid's skeleton for a pose: feet, hips, shoulders, hands, the head. */
const rig = (o: KidOpts) => {
  const N = kidFrames(o.pose), ph = ((o.q % N) / N) * TAU;
  let crouch = 0, lean = 0, bob = 0;
  let footN: P = [14, 0], footF: P = [-16, 0];
  // (the hands: near long arm (knuckles near the floor), far arm, the chest arm)
  let hN: P = [36, -18], hF: P = [-24, -22], hC: P = [28, -84];
  switch (o.pose) {
    case 'idle': case 'talk':
      // (the wheeze: his chest heaving, the little arm never still)
      bob = Math.round(Math.sin(ph) * 2); hN = [36, -18 + Math.sin(ph) * 2]; hC = [28 + Math.sin(ph * 2) * 3, -84 + Math.cos(ph * 2) * 3]; break;
    case 'walk': {
      // (the lumber: a big slow stride, the short far leg a hop; down on each plant (q 2 and 6: the thuds))
      const st = 15;
      footN = [Math.sin(ph) * st + 4, -Math.max(0, Math.cos(ph)) * 11]; footF = [-Math.sin(ph) * st - 6, -Math.max(0, -Math.cos(ph)) * 6];
      bob = Math.round(Math.abs(Math.sin(ph)) * 4); lean = 8;
      hN = [36 - Math.sin(ph) * 18, -18 - Math.max(0, -Math.sin(ph)) * 10]; hF = [-22 + Math.sin(ph) * 16, -24]; hC = [28 + Math.sin(ph * 2) * 4, -84];
      break;
    }
    case 'whine': lean = 10; crouch = 6; bob = Math.round(Math.sin(ph) * 2); hN = [44, -58]; hF = [34, -64]; hC = [32, -78 + Math.sin(ph * 2) * 3]; break;
    case 'scratch': lean = 4; hN = o.q % 2 ? [48, -46] : [44, -38]; hF = o.q % 2 ? [-40, -98] : [-36, -86]; hC = [24, -82]; break;
    case 'buckle': crouch = 24; lean = 26; bob = Math.round(Math.sin(ph) * 1.5); footN = [30, 0]; footF = [-36, -1]; hN = [80, -2]; hF = [64, -2]; hC = [46, -40]; break;
    case 'slamUp': lean = -10; footN = [20, 0]; footF = [-20, 0]; hN = [16, -214]; hF = [2, -208]; hC = [30, -112]; break;
    case 'slamDown': crouch = 24; lean = 24; footN = [24, 0]; footF = [-20, 0]; hN = [112, -4]; hF = [100, -4]; hC = [50, -50]; break;
    case 'lowBack': crouch = 22; lean = -8; footN = [22, 0]; footF = [-22, 0]; hN = [-74, -6]; hF = [70, -8]; hC = [20, -76]; break;
    case 'lowThru': crouch = 18; lean = 14; footN = [22, 0]; footF = [-22, 0]; hN = [122, -8]; hF = [-82, -10]; hC = [40, -70]; break;
    case 'highBack': lean = -12; footN = [22, 0]; footF = [-18, 0]; hN = [-64, -120]; hF = [40, -70]; hC = [20, -86]; break;
    case 'highThru': lean = 12; crouch = 4; footN = [22, 0]; footF = [-18, 0]; hN = [128, -34]; hF = [-50, -80]; hC = [40, -80]; break;
    case 'whipBack': lean = -14; hN = [-40, -176]; hF = [50, -60]; hC = [24, -90]; break;
    case 'whipOut': lean = 18; crouch = 12; footN = [24, 0]; hN = [120, -8]; hF = [-30, -70]; hC = [44, -70]; break;
    case 'grabReach': lean = 20; crouch = 6; footN = [26, 0]; hN = [104, -34]; hF = [96, -46]; hC = [72, -42]; break;
    case 'grabHold': { const sq = o.q % 2 ? 3 : 0; lean = 4; hN = [70 - sq, -104]; hF = [42 + sq, -120]; hC = [52, -98]; break; }
    case 'retch': lean = 20 + (o.q % 2 ? 4 : 0); crouch = 10; bob = o.q % 2 ? 2 : 0; hN = [46, -36]; hF = [32, -40]; hC = [38, -62]; break;
    case 'puke': lean = 26; crouch = 12; hN = [52, -30]; hF = [38, -34]; hC = [42, -56]; break;
    case 'aim': case 'fire': {
      const up = o.pose === 'fire' ? 4 : 0;
      if (o.arm === 0) hN = [88 + up, -104]; else if (o.arm === 1) hF = [30 + up, -196]; else hC = [62 + up, -92];
      lean = o.pose === 'fire' ? -4 : 2;
      break;
    }
    case 'stomp': footN = [22, -36]; hN = [40, -170]; hF = [-20, -176]; hC = [24, -110]; lean = -4; break;
    case 'stompDown': crouch = 20; footN = [30, 0]; footF = [-26, 0]; hN = [62, -20]; hF = [-52, -24]; hC = [30, -70]; break;
    case 'spasm': { const a = ph * 2; hN = [Math.cos(a) * 70, -100 + Math.sin(a) * 70]; hF = [Math.cos(a + Math.PI) * 64, -100 + Math.sin(a + Math.PI) * 64]; hC = [24 + Math.cos(a * 1.5) * 18, -84 + Math.sin(a * 1.5) * 14]; bob = o.q % 2 ? -3 : 0; break; }
    case 'hurt': lean = -12; hN = [0, -150]; hF = [-40, -140]; hC = [10, -110]; break;
    case 'stagger': lean = -14 + (o.q % 2 ? 6 : 0); footN = [24, 0]; footF = [-28, -10]; hN = [60, -150]; hF = [-60, -140]; hC = [30, -120]; break;
    // (the cheap shot's stun: knees in, bent over, all three hands at the crotch, the wheeze bobbing him)
    case 'stun': crouch = 14 + Math.round(Math.sin(ph) * 2); lean = 14; footN = [8, 0]; footF = [-8, 0]; hN = [22, -36]; hF = [10, -38]; hC = [16, -50]; break;
    case 'sit': crouch = 40; footN = [52, -4]; footF = [46, -2]; hN = [34, -50]; hF = [-26, -46]; break;
    default: break;
  }
  const y = bob + crouch, L = lean;
  // (the hips only drop so far in a squat (the legs fold under, never through the floor); sat, all the way)
  const hy0 = o.pose === 'sit' ? y : Math.min(y, 10);
  const hip = (s: number): P => [s * 10 + L * 0.3, HIP + hy0];

  const sh = (s: number): P => [s * 18 + L, -110 + y];
  const hx = 26 + L * 1.3, hy = -128 + y;
  const hole: P = [14 + L, -90 + y];
  return { crouch, lean, bob, y, L, footN, footF, hN, hF, hC, hip, sh, hx, hy, hole };
};

/** What his face is doing, by pose. */
type Face = 'dull' | 'mad' | 'ow' | 'aim' | 'wheeze' | 'shock' | 'cry' | 'gag' | 'puke';
const faceOf = (pose: KidPose): Face =>
  pose === 'slamUp' || pose === 'lowBack' || pose === 'highBack' || pose === 'whipBack' || pose === 'stomp' || pose === 'stompDown' || pose === 'grabHold' ? 'mad'
    : pose === 'hurt' || pose === 'stagger' || pose === 'slamDown' ? 'ow'
      : pose === 'aim' || pose === 'fire' ? 'aim'
        : pose === 'stun' ? 'wheeze'
          : pose === 'whine' || pose === 'buckle' || pose === 'scratch' ? 'cry'
            : pose === 'retch' ? 'gag' : pose === 'puke' ? 'puke'
              : pose === 'spasm' || pose === 'grabReach' || pose === 'lowThru' || pose === 'highThru' || pose === 'whipOut' ? 'shock' : 'dull';
/** The look the eyes and brow take (the new faces lean on the old ones). */
const eyesOf = (f: Face): 'dull' | 'mad' | 'ow' | 'aim' | 'wheeze' | 'shock' => (f === 'cry' ? 'ow' : f === 'gag' || f === 'puke' ? 'shock' : f);

// ---------------------------------------------------------------------------------------------------------------
// His parts

/** A wart: a lumpy little ball, a hair out of the big ones. */
const wart = (c: Ctx, x: number, y: number, r: number, hair = false) => {
  ell(c, x + r * 0.3, y + r * 0.3, r, r * 0.9, WART[4]);
  ell(c, x, y, r, r * 0.9, WART[2]); ell(c, x - r * 0.3, y - r * 0.3, r * 0.55, r * 0.45, WART[0]);
  px(c, x + r * 0.2, y + r * 0.1, 1, 1, WART[3]);
  if (hair) line(c, [x, y - r, x + 1, y - r - 3, x + 3, y - r - 4], 0.6, '#0A0604');
};
/** A zit: red, risen, a whitehead on the ripe ones. */
const zit = (c: Ctx, x: number, y: number, r: number, head = false) => {
  ell(c, x, y, r + 0.6, r + 0.4, dith(c, ZIT)); ell(c, x, y, r, r * 0.85, ZIT);
  if (head) { ell(c, x - 0.2, y - 0.3, r * 0.55, r * 0.5, ZIT_H); px(c, x - r * 0.4, y - r * 0.5, 1, 1, '#FFFFFF'); }
};
/** A raised vein along points: a shadow under it, the purple, a lit line along its top. */
const veinAt = (c: Ctx, pts: number[], w = 1.2) => {
  line(c, pts.map((v, i) => (i % 2 ? v + 0.8 : v + 0.4)), w + 0.6, ALIEN.veinShadow);
  line(c, pts, w, VEIN);
  line(c, pts.map((v, i) => (i % 2 ? v - 0.5 : v)), Math.max(0.5, w * 0.4), VEIN_L);
};

/** A hand at `h`, pointing along `ang` (the forearm's way): a palm, three fat fingers and a thumb, yellow nails. */
const hand = (c: Ctx, h: P, ang: number, s: number, r: Ramp, fist = false) => {
  const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
  // (the thumb on the side toward the light, the fingers fanned (curled in a fist))
  const fl = fist ? 0.45 : 1;
  const tip = (k: number, len: number): P => [h[0] + ux * len + nx * k, h[1] + uy * len + ny * k];
  for (const k of [-1, 0, 1]) {
    const b0 = tip(k * s * 0.42, s * 0.5), b1 = tip(k * s * 0.6 + (fist ? -k * s * 0.3 : 0), s * (1.25 + (k === 0 ? 0.15 : 0)) * fl + s * 0.3);
    tube(c, b0[0], b0[1], s * 0.3, b1[0], b1[1], s * 0.26, r, 0, 0.9);
    if (!fist) { ell(c, b1[0] + ux * s * 0.12, b1[1] + uy * s * 0.12, s * 0.17, s * 0.14, '#E8D890'); }
  }
  shape(c, () => c.ellipse(h[0] + ux * s * 0.3, h[1] + uy * s * 0.3, s * 0.72, s * 0.6, ang, 0, TAU), r, h[0] - s, h[0] + s, 1);
  const th = tip(-s * 0.9, s * 0.55);
  tube(c, h[0] + nx * -s * 0.4, h[1] + ny * -s * 0.4, s * 0.28, th[0], th[1], s * 0.24, r, 0, 0.9);
  // (the knuckles)
  for (const k of [-1, 0, 1]) { const q = tip(k * s * 0.42, s * 0.62); px(c, q[0] - 0.5, q[1] - 0.5, 1, 1, r[3]); }
};

// ---- the misery on him (the owner's "obvious intense discomfort"): boils, a rash scratched raw, mom's calamine
// lotion dabbed over it in pink, a Band-Aid that's given up
const BOIL: Ramp = ['#FFB0A0', '#E8685A', '#C2403C', '#8E2228', '#3A0A0C'];
const PUS: Ramp = ['#FFFCE0', '#F4E27A', '#D8BC3A', '#A88A1C', '#4A3A08'];
const RASH = ['#E0705A', '#C24A44', '#9A2E30'];
const CALAMINE = ['#FBC8C8', '#F4A6AC', '#D88A90'];
/** A boil: an angry red halo (dithered off into the skin), the risen dome lit across its top, the ripe ones' yellow
 *  head of pus with a wet glint. */
const boil = (c: Ctx, x: number, y: number, r: number, ripe = true) => {
  ell(c, x + r * 0.15, y + r * 0.2, r * 1.8, r * 1.5, dith(c, RASH[0]));
  ell(c, x + r * 0.1, y + r * 0.15, r * 1.3, r * 1.1, RASH[1]);
  shapeTop(c, () => c.ellipse(x, y, r, r * 0.88, 0, 0, TAU), BOIL, y - r, y + r, Math.max(0.5, r * 0.18));
  if (ripe) { ell(c, x - r * 0.12, y - r * 0.28, r * 0.56, r * 0.5, PUS[2]); ell(c, x - r * 0.2, y - r * 0.36, r * 0.42, r * 0.36, PUS[1]); px(c, x - r * 0.4, y - r * 0.6, Math.max(0.8, r * 0.22), Math.max(0.8, r * 0.18), PUS[0]); }
  else px(c, x - r * 0.5, y - r * 0.55, Math.max(0.8, r * 0.3), Math.max(0.6, r * 0.2), BOIL[0]);
};
/** A patch of rash: blotches dithered in, raw scratch lines raked through it (deterministic by its seed). */
const rash = (c: Ctx, x: number, y: number, w: number, h: number, seed: number, scratched = true) => {
  ell(c, x, y, w, h, dith(c, RASH[0]));
  for (let k = 0; k < 9; k++) {
    const a = ((seed * 31 + k * 17) % 100) / 100 * TAU, d = (((seed * 7 + k * 29) % 100) / 100) * 0.8;
    const bx = x + Math.cos(a) * w * d, by = y + Math.sin(a) * h * d, br = 0.9 + ((seed + k * 13) % 5) * 0.35;
    ell(c, bx, by, br * 1.3, br, k % 3 ? RASH[1] : RASH[2]);
    if (k % 3 === 0) px(c, bx - br * 0.4, by - br * 0.5, 0.8, 0.8, '#F4A090');
  }
  if (scratched) for (let k = 0; k < 4; k++) { const sx = x - w * 0.6 + k * w * 0.35; line(c, [sx, y - h * 0.7, sx + w * 0.25, y + h * 0.6], 0.6, RASH[2]); line(c, [sx + 0.5, y - h * 0.7, sx + w * 0.25 + 0.5, y + h * 0.6], 0.3, '#FFD0C0'); }
};
/** Mom's calamine lotion, dabbed on in chalky pink blobs over the worst of it, cracking. */
const calamine = (c: Ctx, x: number, y: number, r: number) => {
  ell(c, x + 0.4, y + 0.5, r * 1.1, r * 0.8, dith(c, CALAMINE[2]));
  ell(c, x, y, r, r * 0.72, CALAMINE[1]); ell(c, x - r * 0.25, y - r * 0.2, r * 0.55, r * 0.35, CALAMINE[0]);
  line(c, [x - r * 0.5, y, x + r * 0.2, y + r * 0.3], 0.4, CALAMINE[2]);
};
/** A Band-Aid that's given up: half peeled off a boil, the pad gone yellow. */
const bandAid = (c: Ctx, x: number, y: number, a: number) => {
  c.save(); c.translate(x, y); c.rotate(a);
  px(c, -6.4, -2.4, 12.8, 4.8, '#6A4A2A'); px(c, -6, -2, 12, 4, '#E0B08A'); px(c, -6, -2, 12, 1, '#F4D0AE');
  px(c, -2, -1.6, 4, 3.2, '#E8D080'); px(c, -1.6, -1.2, 3.2, 1, '#FFF0A8');
  // (the peeled end, curling up off him)
  fill(c, '#C8946A', () => { c.moveTo(6, -2); c.quadraticCurveTo(10, -5, 9, -8); c.lineTo(7.4, -7.4); c.quadraticCurveTo(8, -4.6, 6, -0.6); c.closePath(); });
  for (let k = 0; k < 3; k++) px(c, -5 + k * 1.4, -1, 0.5, 0.5, '#A87A54');
  c.restore();
};
/** Sweat beads: a dark rim, a lit bead. */
const sweat = (c: Ctx, x: number, y: number, r = 1.2) => { ell(c, x + 0.3, y + 0.4, r, r * 1.2, '#2A4A1A'); ell(c, x, y, r * 0.8, r, '#D8F4E8'); px(c, x - r * 0.4, y - r * 0.5, 0.6, 0.6, '#FFFFFF'); };

/** A leg: the shorts' leg down over the thigh, the knee, the swollen shin and its cankle (varicose veins roped up it),
 *  the tube sock, the slide, the toes. */
const leg = (c: Ctx, hp: P, f: P, near: boolean, short: boolean) => {
  const skin = near ? HIDE : HIDE_F, cloth = near ? SHORTS : SHORTS_F;
  const th = short ? 26 : 31, sn = short ? 26 : 31;
  const an: P = [f[0], f[1] - 10];
  const [kx, ky] = knee(hp[0], hp[1], an[0], an[1], th, sn, 1);
  // (the shin: fat, swelling down into a cankle; the knee a knob with a boil on it)
  tube(c, kx, ky, 7.4, an[0], an[1], 8.4, skin, 0, 1.1);
  ell(c, kx + 1.5, ky, 8.4, 7.4, skin[4]); ell(c, kx + 1, ky - 0.5, 7.4, 6.4, skin[1]); ell(c, kx + 2, ky + 1, 4.6, 3.6, skin[2]); px(c, kx - 2, ky - 4, 4, 1, skin[0]);
  const mid: P = [(kx + an[0]) / 2, (ky + an[1]) / 2];
  if (near) {
    veinAt(c, [kx + 3, ky + 4, mid[0] + 5, mid[1] - 2, mid[0] + 3, mid[1] + 3, an[0] + 5, an[1] - 4], 1.2);
    veinAt(c, [mid[0] - 2, mid[1] - 4, mid[0] + 1, mid[1] + 1, mid[0] - 1, mid[1] + 5], 0.9);
    boil(c, kx + 3, ky - 2, 2.4, true); rash(c, mid[0] + 2, mid[1] + 1, 4, 3, 5);
  } else wart(c, mid[0] + 3, mid[1] - 1, 1.6);
  // (the tube sock: up to mid-shin, two stripes round the top, slouched in rings, gone gray at the toe; the cankle
  // bulging over its top)
  const sx = kx + (an[0] - kx) * 0.5, sy = ky + (an[1] - ky) * 0.5;
  tube(c, sx, sy, 8, an[0], an[1], 8.2, near ? SOCK : [SOCK[1], SOCK[2], SOCK[3], SOCK[3], SOCK[4]], 0, 1);
  const da = Math.atan2(an[1] - sy, an[0] - sx), wx = -Math.sin(da), wy = Math.cos(da);
  line(c, [sx - wx * 8.6, sy - wy * 8.6 - 1, sx + wx * 8.6, sy + wy * 8.6 - 1], 1.6, skin[3]);
  for (const [k, col] of [[0.14, '#DC2626'], [0.3, '#2563EB']] as const) {
    const cx = sx + (an[0] - sx) * k, cy = sy + (an[1] - sy) * k;
    line(c, [cx - wx * 7.6, cy - wy * 7.6, cx + wx * 7.6, cy + wy * 7.6], 1.6, col);
  }
  for (const k of [0.6, 0.8]) { const cx = sx + (an[0] - sx) * k, cy = sy + (an[1] - sy) * k; line(c, [cx - wx * 7, cy - wy * 7 + 0.6, cx + wx * 7, cy + wy * 7 - 0.4], 0.6, SOCK[3]); }
  // (the slide: the sole, lit along its top, the strap across, the brand's dot; his three toes out the front, long,
  // yellow-clawed, a fungal one; the gray heel of the sock)
  const fx = f[0], fy = f[1];
  for (const [tx, ty] of [[12, -3.6], [16.6, -2.8], [19.6, -1.4]] as const) { ell(c, fx + tx, fy + ty, 4.6, 2.3, skin[4]); ell(c, fx + tx - 0.4, fy + ty - 0.3, 3.8, 1.7, skin[1]); px(c, fx + tx - 2, fy + ty - 1.4, 2.4, 0.7, skin[0]); ell(c, fx + tx + 3.8, fy + ty + 0.2, 1.6, 1.1, tx === 16.6 ? '#8A9A3A' : PEG[2]); }
  ell(c, fx - 4, fy - 3.4, 6, 3.6, SOCK[3]); px(c, fx - 7, fy - 6, 4, 1, SOCK[2]);
  px(c, fx - 10, fy - 2.6, 32, 3.6, SLIDE[4]); px(c, fx - 9, fy - 2, 30, 1.4, SLIDE[0]); px(c, fx - 9, fy - 0.6, 30, 1, SLIDE[2]);
  shape(c, () => { c.moveTo(fx - 4, fy - 2); c.lineTo(fx - 3, fy - 9); c.quadraticCurveTo(fx + 4, fy - 12, fx + 11, fy - 8); c.lineTo(fx + 11, fy - 2); c.closePath(); }, SLIDE, fx - 4, fx + 11, 1);
  ell(c, fx + 4, fy - 6.4, 1.6, 1.2, '#FFFFFF'); px(c, fx + 2, fy - 6.8, 2, 0.8, '#FFFFFF');
  // (the shorts' leg: baggy, to the knee, the side stripe, the mesh, the hem's lip; stretched over a fat thigh)
  const hem: P = [kx + (hp[0] - kx) * 0.12, ky + (hp[1] - ky) * 0.12 + 3];
  tube(c, hp[0], hp[1] - 2, 14, hem[0], hem[1], 12, cloth, 1, 1.2);
  const la = Math.atan2(hem[1] - hp[1], hem[0] - hp[0]), lx = -Math.sin(la), ly = Math.cos(la);
  line(c, [hp[0] - lx * 11, hp[1] - ly * 11, hem[0] - lx * 10, hem[1] - ly * 10], 2, '#F4F4F5');
  line(c, [hp[0] - lx * 11 + 0.5, hp[1] - ly * 11 + 1, hem[0] - lx * 10 + 0.5, hem[1] - ly * 10 + 1], 0.6, cloth[3]);
  for (let k = 0; k < 4; k++) { const t = 0.25 + k * 0.17, mx = hp[0] + (hem[0] - hp[0]) * t, my = hp[1] + (hem[1] - hp[1]) * t; ell(c, mx + lx * 2, my + ly * 2, 2.8, 1.6, dith(c, cloth[2]), la); }
  line(c, [hem[0] + lx * 4 - 3, hem[1] + ly * 4 - 6, hem[0] + lx * 8, hem[1] + ly * 8 - 2], 0.9, cloth[3]);
  line(c, [hem[0] - lx * 12, hem[1] - ly * 12 + 0.5, hem[0] + lx * 12, hem[1] + ly * 12 + 0.5], 1.4, cloth[0]);
};

/** An arm: the upper arm (a sleeve's band round its top), the elbow, the forearm, the hand. The gun arm's forearm is
 *  a Popeye one with his dad's ray gun grown into it: the housing strapped in by the flesh, the cells, the coil, the
 *  tubes going in under the skin (veins swollen round them, a stapled scar), the barrel out over the back of his
 *  hand. */
const arm = (c: Ctx, s: P, hIn: P, kind: 'gun' | 'far' | 'kid', fist = false, noHand = false) => {
  const [A, B] = kind === 'gun' ? [GUN_A, GUN_B] : kind === 'far' ? [FAR_A, FAR_B] : [KID_A, KID_B];
  const skin = kind === 'far' ? HIDE_F : HIDE;
  const h = reachTo(s[0], s[1], hIn[0], hIn[1], A, B);
  const [ex, ey] = elbow(s[0], s[1], h[0], h[1], A, B, 1);
  const r0 = kind === 'kid' ? 3.2 : kind === 'gun' ? 7.6 : 6.8, r1 = kind === 'kid' ? 2.8 : 5.6;
  tube(c, s[0], s[1], r0, ex, ey, r1, skin, kind === 'kid' ? 0 : 1, 1);
  if (kind !== 'kid') {
    // (the sleeve: tight, its hem cutting in, a pit stain on the near one)
    const k = 0.3, mx = s[0] + (ex - s[0]) * k, my = s[1] + (ey - s[1]) * k;
    tube(c, s[0], s[1], r0 + 1.6, mx, my, r0 + 1, kind === 'far' ? [SHIRT[1], SHIRT[2], SHIRT[3], SHIRT[3], SHIRT[4]] : SHIRT, 0, 1.1);
    const a = Math.atan2(ey - s[1], ex - s[0]), nx = -Math.sin(a), ny = Math.cos(a);
    line(c, [mx - nx * (r0 + 1), my - ny * (r0 + 1), mx + nx * (r0 + 1), my + ny * (r0 + 1)], 1.2, SHIRT[3]);
    if (kind === 'gun') ell(c, (s[0] + mx) / 2 + nx * 3, (s[1] + my) / 2 + ny * 3, 3.4, 2.4, dith(c, SWEAT), a);
    // (zits on the shoulder, a wart on the elbow)
    zit(c, s[0] - 2, s[1] - 5, 1.2, kind === 'gun'); wart(c, ex + 1, ey + 2, 1.5, kind === 'gun');
    // (the misery: a rash up the upper arm, calamine dabbed on it, a boil at the elbow's crook)
    const u = (t: number, o = 0): [number, number] => [s[0] + (ex - s[0]) * t + nx * o, s[1] + (ey - s[1]) * t + ny * o];
    if (kind === 'gun') { const q = u(0.62, 1); rash(c, q[0], q[1], 5, 3.4, 3); calamine(c, q[0] + 1, q[1] - 1, 2.2); boil(c, ...u(0.88, -3), 2.2); }
    else boil(c, ...u(0.6, 2), 2.6);
  }
  const fa = Math.atan2(h[1] - ey, h[0] - ex), ux = Math.cos(fa), uy = Math.sin(fa), nx = -uy, ny = ux;
  if (kind === 'gun') {
    // (Popeye: the forearm swells out to twice the upper arm, the veins roped over it)
    tube(c, ex, ey, 6.4, h[0] - ux * 4, h[1] - uy * 4, 7.6, skin, 6, 1);
    const m = (t: number, o = 0): [number, number] => [ex + (h[0] - ex) * t + nx * o, ey + (h[1] - ey) * t + ny * o];
    c.save(); c.translate(...m(0.55)); c.rotate(fa);
    const L = Math.hypot(h[0] - ex, h[1] - ey);
    // (the housing, on top of the forearm, dug in: the skin puckered round it)
    const hl = L * 0.62;
    px(c, -hl / 2 - 1, -11, hl + 2, 9, GUN[4]);
    shapeTop(c, () => c.rect(-hl / 2, -10, hl, 7), GUN, -10, -3, 0.8);
    for (let k = 0; k < 4; k++) { const x = -hl / 2 + 3 + k * (hl - 6) / 4; px(c, x, -9, 3, 5, '#14532D'); px(c, x + 0.5, -8.5, 2, 4, '#4ADE80'); px(c, x + 0.5, -8.5, 2, 1, '#D9F99D'); }
    // (the coil wound round the barrel's root; the tubes into the flesh)
    for (let k = 0; k < 4; k++) { px(c, hl / 2 - 1 + k * 2, -12, 1.2, 10, k % 2 ? GUN[3] : '#C08A2C'); }
    line(c, [-hl / 2 + 2, -3, -hl / 2 - 2, 1, -hl / 2 - 6, 2], 1.8, '#2A2C34'); line(c, [-hl / 2 + 2, -3.4, -hl / 2 - 2, 0.6], 0.6, '#6A6E7A');
    line(c, [0, -3, -2, 2, -6, 4], 1.6, '#7A1A3A');
    for (const x of [-hl / 2 + 1, hl / 2 - 1]) { px(c, x - 1, -3, 3, 2, skin[3]); px(c, x, -2, 1, 1, '#7A1A3A'); }
    // (the barrel, out over the back of the hand; the muzzle's ring)
    px(c, hl / 2, -10, L * 0.46 + 6, 5, GUN[4]); px(c, hl / 2, -9, L * 0.46 + 5, 3, GUN[2]); px(c, hl / 2, -9, L * 0.46 + 5, 1, GUN[0]);
    px(c, hl / 2 + L * 0.46 + 4, -11.5, 4, 8, GUN[4]); px(c, hl / 2 + L * 0.46 + 4.5, -10.5, 3, 6, GUN[3]); px(c, hl / 2 + L * 0.46 + 5, -9, 2, 3, '#14532D');
    c.restore();
    // (the veins: roped up the forearm into the housing; the stapled scar where it went in)
    veinAt(c, [...m(0.1, 3), ...m(0.35, 5), ...m(0.6, 3.6), ...m(0.85, 4.6)], 1.3);
    veinAt(c, [...m(0.2, -1), ...m(0.45, 1.6), ...m(0.7, 0.4)], 1);
    const sc0 = m(0.25, -4.5), sc1 = m(0.8, -4.5);
    line(c, [sc0[0], sc0[1], sc1[0], sc1[1]], 1, '#7A1A3A');
    for (let k = 0; k < 4; k++) { const q = m(0.3 + k * 0.14, -4.5); line(c, [q[0] - nx * 1.8, q[1] - ny * 1.8, q[0] + nx * 1.8, q[1] + ny * 1.8], 0.7, '#C8CCD6'); }
    if (!noHand) hand(c, [h[0], h[1]], fa, 7.4, skin, fist);
  } else if (kind === 'far') {
    tube(c, ex, ey, 5.6, h[0] - ux * 3, h[1] - uy * 3, 4.8, skin, 1, 1);
    veinAt(c, [ex + nx * 2 + ux * 6, ey + ny * 2 + uy * 6, ex + ux * 18 + nx * 1, ey + uy * 18 + ny * 1], 0.9);
    hand(c, [h[0], h[1]], fa, 6.4, skin, fist);
  } else {
    // (the little one: a baby's arm, out of a hole worn through his shirt, three tiny fingers going)
    tube(c, ex, ey, 2.8, h[0], h[1], 2.4, skin, 0, 0.9);
    hand(c, [h[0], h[1]], fa, 3.4, skin, fist);
    boil(c, (ex + h[0]) / 2, (ey + h[1]) / 2 - 1, 1.4, false);

  }
};

// ---------------------------------------------------------------------------------------------------------------
// The head: the wide neck, the cinder-block jaw (his dad's), the tiny cranium on the front of it, three eyes

const head = (c: Ctx, hx: number, hy: number, full: Face, open: number, by: number, L: number) => {
  const face = eyesOf(full);
  // ---- the neck: a column wider than the cranium, rising forward off the slouched shoulders; rolls in it, veins up it
  shape(c, () => { c.moveTo(-12 + L, -130 + by); c.quadraticCurveTo(hx - 28, hy + 24, hx - 20, hy + 4); c.lineTo(hx + 8, hy + 8); c.quadraticCurveTo(hx + 12, hy + 30, 14 + L, -131 + by); c.closePath(); }, HIDE, hx - 30, hx + 14, 1.2);
  for (const k of [0, 1]) line(c, [hx - 26 + k * 2, hy + 18 + k * 7, hx - 14, hy + 20 + k * 7, hx + 2, hy + 18 + k * 7], 0.9, HIDE[3]);
  line(c, [hx - 25, hy + 17, hx - 14, hy + 19], 0.6, HIDE[0]);
  veinAt(c, [hx - 20, hy + 34, hx - 22, hy + 24, hx - 18, hy + 14, hx - 20, hy + 6], 1.2);
  veinAt(c, [hx - 6, hy + 34, hx - 9, hy + 26], 0.9);
  // ---- the jaw: the block, jutting, the chin out past the mouth (the under-bite)
  const jaw = () => { c.moveTo(hx - 16, hy - 4); c.lineTo(hx + 30, hy - 2); c.quadraticCurveTo(hx + 40, hy + 2, hx + 42, hy + 14); c.lineTo(hx + 44, hy + 26); c.quadraticCurveTo(hx + 42, hy + 33, hx + 34, hy + 34); c.lineTo(hx + 2, hy + 36); c.quadraticCurveTo(hx - 14, hy + 34, hx - 18, hy + 22); c.closePath(); };
  shape(c, jaw, HIDE, hx - 18, hx + 44, 1.6);
  c.save(); c.beginPath(); jaw(); c.clip();
  // (the jaw's underside in shadow, the jowl's fold, the cheek's lit plane)
  px(c, hx - 20, hy + 29, 70, 8, HIDE[3]); px(c, hx - 20, hy + 27, 70, 2, dith(c, HIDE[3]));
  line(c, [hx - 10, hy + 6, hx - 4, hy + 18, hx - 8, hy + 28], 1, HIDE[3]);
  ell(c, hx + 8, hy + 4, 10, 4, dith(c, HIDE[0]));
  // (patchy stubble over the jaw and chin)
  for (let k = 0; k < 44; k++) { const x = hx - 8 + ((k * 37) % 50), y = hy + 20 + ((k * 13) % 14); if ((k * 7) % 5 < 3) px(c, x, y, 0.8, 0.8, STUB); }
  c.restore();
  // (the chin's cleft; zits along the jaw, the big one ripe; mom's wart with its hair, on the snout's side)
  line(c, [hx + 40, hy + 24, hx + 37, hy + 31], 0.9, HIDE[4]);
  zit(c, hx - 4, hy + 24, 1.6, true); zit(c, hx + 2, hy + 28, 1.1); zit(c, hx - 10, hy + 14, 1.2); zit(c, hx + 26, hy + 31, 1.3, true);
  wart(c, hx + 22, hy + 2, 2, true);

  // (the gaming headset round the neck: the band, the near cup hanging on his chest, its LED, the
  // mic boom up by his mouth)
  c.strokeStyle = SET[4]; c.lineWidth = 3; c.beginPath(); c.ellipse(hx - 8, hy + 36, 22, 5, 0.05, 0.15, Math.PI - 0.2); c.stroke();
  c.strokeStyle = SET[1]; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = '#22C55E'; c.lineWidth = 0.6; c.stroke();
  c.strokeStyle = SET[0]; c.lineWidth = 0.7; c.beginPath(); c.ellipse(hx - 8, hy + 35.4, 22, 5, 0.05, 0.6, 1.5); c.stroke();
  shape(c, () => c.ellipse(hx + 11, hy + 39, 4.6, 5.6, 0.2, 0, TAU), SET, hx + 6, hx + 16, 1.1);
  c.strokeStyle = '#16A34A'; c.lineWidth = 1; c.beginPath(); c.ellipse(hx + 11, hy + 39, 3, 4, 0.2, 0, TAU); c.stroke();
  px(c, hx + 9.6, hy + 37, 3, 1.2, LED); px(c, hx + 10, hy + 37, 1.4, 0.6, '#CFFAFE');
  line(c, [hx + 15, hy + 37, hx + 30, hy + 36, hx + 40, hy + 30], 1.6, SET[4]); line(c, [hx + 15, hy + 36.4, hx + 30, hy + 35.4], 0.6, SET[0]);
  ell(c, hx + 41, hy + 29, 2.6, 2.2, SET[4]); ell(c, hx + 40.6, hy + 28.6, 1.6, 1.4, '#4A4A54');

  // ---- the mouth: the upper lip (thin, his dad's), the under-bite's thick lower lip (mom's lipstick smeared on, past
  // the lines), the pegs jutting up from behind it over the top lip; open, the black of it, the gums, the tongue
  const my = hy + 12, mx0 = hx + 2, mx1 = hx + 40, o = open;
  if (o > 0) {
    fill(c, ALIEN.mouth, () => { c.moveTo(mx0, my); c.lineTo(mx1, my - 1); c.lineTo(mx1 - 2, my + 4 + o); c.quadraticCurveTo((mx0 + mx1) / 2, my + 8 + o, mx0 + 3, my + 4 + o); c.closePath(); });
    px(c, mx0 + 4, my, mx1 - mx0 - 8, 1.6, ALIEN.gum);
    if (o > 3) { ell(c, (mx0 + mx1) / 2 + 2, my + 3 + o, 10, 2.6 + o * 0.2, '#C24A6A'); ell(c, (mx0 + mx1) / 2, my + 2.4 + o, 6, 1.4, '#E87A96'); line(c, [(mx0 + mx1) / 2 + 2, my + 1.5 + o, (mx0 + mx1) / 2 + 2, my + 4 + o], 0.6, '#8A2A4A'); }
    if (o > 5) { line(c, [mx0 + 10, my + 1, mx0 + 10.5, my + 3 + o], 0.5, '#E8F0D8'); line(c, [mx1 - 8, my, mx1 - 8.4, my + 2 + o * 0.7], 0.5, '#E8F0D8'); }
  }
  // (the top lip)
  line(c, [mx0 - 1, my, mx0 + 12, my - 1.6, mx1 - 6, my - 1.8, mx1 + 1, my - 0.6], 2.2, HIDE[4]);
  line(c, [mx0 + 2, my - 1, mx1 - 4, my - 2.4], 0.8, HIDE[3]);
  // (the wispy mustache he's trying: a dozen hairs over the lip)
  for (let k = 0; k < 13; k++) { const x = mx0 + 6 + k * 2.4; line(c, [x, my - 2.6 - (k % 3) * 0.4, x + 0.8, my - 4.4 - (k % 2)], 0.6, '#1E2412'); }
  // (the lower lip: thick, lipsticked, smeared off the corner up his cheek)
  const ly = my + 4 + o;
  shapeTop(c, () => { c.moveTo(mx0 - 2, ly - 2); c.quadraticCurveTo((mx0 + mx1) / 2, ly - 4, mx1 + 2, ly - 3); c.quadraticCurveTo(mx1 + 3, ly + 3, mx1 - 4, ly + 4); c.quadraticCurveTo((mx0 + mx1) / 2, ly + 6, mx0, ly + 3); c.closePath(); }, LIP, ly - 4, ly + 6, 0.9);
  fill(c, dith(c, LIP[1]), () => { c.moveTo(mx0 - 4, ly - 1); c.lineTo(mx0 - 9, ly - 6); c.lineTo(mx0 - 6, ly - 7); c.lineTo(mx0, ly - 2); c.closePath(); });
  px(c, mx0 + 6, my - 4, 8, 1.2, LIP[1]); px(c, mx1 - 10, my - 3.6, 6, 1, dith(c, LIP[1]));
  px(c, mx0 + 4, ly - 2.4, 9, 0.8, LIP[0]);
  // (the pegs: rooted behind the lower lip, up over the top one; yellow, brown at the roots, one gone, one chipped)
  for (let k = 0; k < 7; k++) {
    if (k === 4) continue;
    const x = mx0 + 4 + k * 4.8, top = ly - 9 - (k % 2) * 1.5 - (k === 2 ? 1.5 : 0), bot = ly - 1.5;
    px(c, x - 0.6, top - 0.6, 4.2, bot - top + 0.6, PEG[4]);
    px(c, x, top, 3, bot - top, PEG[1]); px(c, x, top, 1, bot - top, PEG[0]); px(c, x + 2, top + 1, 1, bot - top - 1, PEG[2]);
    px(c, x, bot - 2, 3, 2, PEG[3]);
    if (k === 5) px(c, x + 1.5, top, 1.5, 1.6, PEG[4]);
  }
  // (drool's wet sheen on the lip)
  px(c, mx1 - 6, ly + 1, 2, 1, SLIME_L);

  // ---- the snout: a pug's, up over the lip, two wet nostrils, a pimple on it
  shape(c, () => { c.moveTo(hx + 26, hy + 2); c.quadraticCurveTo(hx + 40, hy, hx + 42, hy + 6); c.quadraticCurveTo(hx + 40, hy + 10, hx + 30, hy + 9); c.closePath(); }, HIDE, hx + 26, hx + 42, 1);
  ell(c, hx + 35, hy + 6.6, 1.6, 1, HIDE[4]); ell(c, hx + 40, hy + 6.2, 1.2, 0.9, HIDE[4]); px(c, hx + 34, hy + 2, 3, 1, HIDE[0]);
  px(c, hx + 37, hy + 8, 1, 2, SLIME);

  // ---- the cranium: tiny, perched up on the front of the jaw; greasy hair combed back into mom's curlers
  const cx = hx + 6, cy = hy - 12;
  // (the ponytail's crest, rolled in curlers, a bobby pin, the hairnet's threads)
  shape(c, () => { c.moveTo(cx - 6, cy - 12); c.quadraticCurveTo(cx - 30, cy - 18, cx - 38, cy - 2); c.quadraticCurveTo(cx - 28, cy - 4, cx - 8, cy + 4); c.closePath(); }, HAIR, cx - 38, cx - 4, 1);
  const curls: [number, number, Ramp][] = [[cx - 16, cy - 13, CURL], [cx - 25, cy - 11, CURL_P], [cx - 32, cy - 6, CURL]];
  for (const [x, y, r] of curls) {
    c.save(); c.translate(x, y); c.rotate(-0.5);
    shapeTop(c, () => c.roundRect(-4.2, -3.6, 8.4, 7.2, 2.6), r, -3.6, 3.6, 1);
    for (let k = -2; k <= 2; k += 2) px(c, k - 0.5, -3.6, 1, 7.2, r[3]);
    px(c, -4.6, -0.6, 9.2, 1.2, '#E4E4EA');
    c.restore();
  }
  line(c, [cx - 20, cy - 4, cx - 14, cy - 18], 0.8, '#B8B8C0');
  // (the dome)
  shape(c, () => c.ellipse(cx, cy, 17, 14, -0.1, 0, TAU), HIDE, cx - 17, cx + 17, 1.6);
  // (the hair: slicked back over the top, the comb's lines, a few strays standing up)
  fill(c, HAIR[1], () => { c.moveTo(cx - 16, cy - 2); c.quadraticCurveTo(cx - 12, cy - 15, cx + 4, cy - 14); c.quadraticCurveTo(cx - 6, cy - 10, cx - 10, cy + 2); c.closePath(); });
  for (let k = 0; k < 4; k++) line(c, [cx - 13 + k * 1.6, cy - 1, cx - 8 + k * 2, cy - 11 + k * 0.6, cx + 2, cy - 13 + k * 0.8], 0.7, k % 2 ? HAIR[0] : HAIR[3]);
  line(c, [cx + 2, cy - 14, cx + 5, cy - 19], 0.6, HAIR[2]); line(c, [cx + 4, cy - 14, cx + 9, cy - 17], 0.6, HAIR[2]);
  // (the veins over the dome, its blackheads, the grease's shine, a zit)
  veinAt(c, [cx + 8, cy - 10, cx + 4, cy - 6, cx + 6, cy - 1], 0.8);
  for (const [x, y] of [[4, -6], [9, -2], [-2, 4], [12, 4], [7, 7]] as const) px(c, cx + x, cy + y, 0.8, 0.8, '#1A2010');
  px(c, cx - 8, cy - 8, 3, 1, '#F0F8D8'); px(c, cx - 9, cy - 6, 1, 1, '#F0F8D8');
  zit(c, cx + 13, cy + 1, 1.2, true);

  // ---- the brow: a heavy ridge over dad's two eyes; it knits, climbs or sags with his mood
  const tilt = face === 'mad' ? 3 : face === 'ow' || face === 'shock' ? -2.4 : face === 'wheeze' ? -1.6 : face === 'aim' ? 1.6 : 0.4;
  const drop = face === 'dull' ? 1.6 : face === 'shock' ? -2 : 0;
  // (dad's eyes: beady, yellow, red-rimmed, not level)
  const dad: [number, number, number][] = [[cx + 7, cy + 6, 4], [cx + 15, cy + 9.4, 3.1]];
  for (const [ex, ey, er] of dad) {
    if (face === 'ow' || face === 'wheeze') { ell(c, ex, ey, er + 0.6, er * 0.7, HIDE[2]); ell(c, ex - 0.6, ey - 0.8, er * 0.6, er * 0.3, HIDE[1]); }
    else { ell(c, ex, ey, er + 1.4, er + 1.2, '#2A0604'); ell(c, ex, ey, er + 0.9, er + 0.8, '#B8341E'); }
    if (face === 'ow' || face === 'wheeze') { line(c, [ex - er, ey + (face === 'wheeze' ? 0.5 : -0.6), ex, ey + 0.8, ex + er, ey - 0.4], 1.1, '#2A0604'); if (face === 'wheeze') line(c, [ex + er + 1, ey + 1, ex + er + 2, ey + 3], 0.7, '#CFE8FF'); continue; }
    shape(c, () => c.ellipse(ex, ey, er, er * 0.92, 0, 0, TAU), DAD_Y, ex - er, ex + er, 0.6);
    const pd = face === 'shock' ? 0.6 : 1.4, lk = face === 'aim' ? 1.2 : 0.5;
    px(c, ex + lk - pd / 2, ey - pd / 2, pd, pd, '#0A0A0A');
    for (let k = 0; k < 2; k++) line(c, [ex - er + 0.4, ey + k * 1.4 - 0.6, ex - er + 1.6, ey + k * 0.8], 0.4, '#C82A1E');
    px(c, ex - er * 0.4, ey - er * 0.5, 1, 1, '#FFFFFF');
    // (the lid: heavy, down over the top (half-mast when he's dull; the far one squinted shut on the aim))
    const lid = face === 'dull' ? er * 0.95 : face === 'aim' && ex > cx + 10 ? er * 1.5 : face === 'mad' ? er * 0.8 : face === 'shock' ? 0 : er * 0.5;
    if (lid > 0) { fill(c, HIDE[2], () => { c.moveTo(ex - er - 0.6, ey - er); c.lineTo(ex + er + 0.6, ey - er); c.lineTo(ex + er + 0.6, ey - er + lid); c.quadraticCurveTo(ex, ey - er + lid + 0.8, ex - er - 0.6, ey - er + lid); c.closePath(); }); line(c, [ex - er - 0.4, ey - er + lid, ex + er + 0.4, ey - er + lid], 0.7, HIDE[4]); }
    // (the bags under them)
    line(c, [ex - er + 0.6, ey + er + 1.2, ex + er - 0.4, ey + er + 1.6], 0.7, HIDE[3]);
  }
  // (the ridge itself: a fold of skin, lit along its top)
  const b0x = cx + 3, b1x = cx + 16, b0y = cy + 1 - drop - tilt, b1y = cy + 5 - drop + tilt;
  tube(c, b0x, b0y, 1.9, b1x, b1y, 1.5, HIDE, 0, 0.8);
  if (face === 'mad') { line(c, [cx + 9, cy + 1, cx + 11, cy - 3], 0.8, HIDE[3]); line(c, [cx + 12, cy + 1.6, cx + 14, cy - 2], 0.8, HIDE[3]); }
  if (face === 'ow' || face === 'shock') for (let k = 0; k < 2; k++) line(c, [cx + 4, cy - 4 - k * 2.4, cx + 12, cy - 5 - k * 2.4, cx + 18, cy - 3 - k * 2.4], 0.6, HIDE[3]);
  // (mom's big eye, up on top: lashed, mascara run, a purple iris off looking at nothing (lazy: it never joins in))
  const mx = cx - 3, myy = cy - 6, wide = face === 'shock' || face === 'ow' ? 1.15 : 1;
  ell(c, mx, myy + 0.6, 8.4 * wide, 7.2 * wide, HIDE[4]);
  shape(c, () => c.ellipse(mx, myy, 7.6 * wide, 6.4 * wide, 0, 0, TAU), MOM_W, mx - 7.6, mx + 7.6, 0.8);
  for (let k = 0; k < 3; k++) line(c, [mx + 7 - k * 2, myy - 2 + k * 2.4, mx + 4 - k * 2, myy - 0.6 + k * 1.6], 0.5, '#D8303C');
  const ix = mx - 3.4 + (face === 'wheeze' ? 3 : 0), iy = myy - 2 + (face === 'wheeze' ? 3 : 0);
  ell(c, ix, iy, 3.2, 3.2, '#4C1D95'); ell(c, ix, iy, 2.6, 2.6, '#7C3AED'); ell(c, ix - 0.5, iy - 0.5, 1.2, 1.2, '#C4B5FD'); ell(c, ix + 0.4, iy + 0.3, 1.2, 1.2, '#0A0610');
  px(c, ix - 1.6, iy - 1.8, 1, 1, '#FFFFFF');
  // (the lid: blue shadow caked on, the lashes up off it)
  fill(c, '#3B5BDB', () => { c.ellipse(mx, myy - 4.4 * wide, 7.4 * wide, 2.4, 0, Math.PI, TAU); });
  px(c, mx - 6, myy - 6.4 * wide, 12, 1, '#1E1B4B');
  for (let k = 0; k < 6; k++) line(c, [mx - 6 + k * 2.4, myy - 6.4 * wide, mx - 8 + k * 2.8, myy - 10 * wide - (k % 2)], 0.9, '#0A0610');
  for (let k = 0; k < 3; k++) line(c, [mx - 4 + k * 3, myy + 6, mx - 4.4 + k * 3, myy + 9 + k * 1.6 + (face === 'ow' ? 3 : 0)], 0.7, '#1E1430');
  // (the slime on him: glints on the dome, the snout, the jaw)
  px(c, cx - 12, cy + 2, 2, 1, SLIME_L); px(c, hx + 30, hy + 1, 1.4, 1, SLIME_L); px(c, hx - 12, hy + 4, 2, 1, SLIME_L);
  // ---- the misery in his face: a big boil on the jaw's hinge, a rash down the neck, flop sweat on the dome
  boil(c, hx - 12, hy + 10, 3.4, true); boil(c, hx + 14, hy + 30, 1.8, true);
  rash(c, hx - 18, hy + 28, 6, 4, 9); calamine(c, hx - 20, hy + 27, 2.4);
  for (const [x, y] of [[cx - 9, cy - 4], [cx + 10, cy - 6], [cx + 2, cy + 6], [hx - 4, hy + 2]] as const) sweat(c, x, y, 1.1);
  // (crying: dad's two leaking, mom's big one running its mascara worse; snot out the snout)
  if (full === 'cry') {
    for (const [ex, ey] of [[cx + 7, cy + 6], [cx + 15, cy + 9.4]] as const) { line(c, [ex + 1, ey + 2, ex + 2, ey + 8, ex + 1, ey + 16], 1.4, '#9AD8F4'); px(c, ex + 0.6, ey + 6, 0.8, 3, '#E8F8FF'); }
    line(c, [hx + 38, hy + 8, hx + 39, hy + 14], 1.4, SLIME); px(c, hx + 38, hy + 14, 2, 2, SLIME_L);
  }
  // (gagging: the cheeks puffed out full, the lips clamped, green at the gills)
  if (full === 'gag') {
    shape(c, () => c.ellipse(hx + 22, hy + 14, 14, 9, 0, 0, TAU), HIDE, hx + 8, hx + 36, 1.2);
    ell(c, hx + 22, hy + 16, 9, 4, dith(c, '#A8E03A'));
    line(c, [hx + 10, hy + 18, hx + 34, hy + 17], 1.4, HIDE[4]);
  }
};


// ---------------------------------------------------------------------------------------------------------------
// The body

/** The kid, painted: feet at (0, 0), facing right. */
export const paintKid = (g: Ctx, o: KidOpts) => {
  const r = rig(o), y = r.y, L = r.L;
  // (the upper body sits a step lower than the old manchild's: the slouch gone to a hunch)
  const Y = y + 14;
  const full = faceOf(o.pose);
  const fist = o.pose === 'stomp' || o.pose === 'slamUp' || o.pose === 'slamDown' || o.pose === 'lowBack' || o.pose === 'lowThru' || o.pose === 'highBack' || o.pose === 'highThru' || o.pose === 'whipBack';
  // ---- the far leg (the short one), the far arm
  leg(g, r.hip(-1), r.footF, false, true);
  arm(g, r.sh(-1), r.hF, 'far', fist);
  // ---- the body: round shoulders, the hunched back
  const torso = () => {
    g.moveTo(-16 + L, -134 + Y);
    g.quadraticCurveTo(-30 + L, -132 + Y, -30 + L * 0.9, -116 + Y);
    g.quadraticCurveTo(-34 + L * 0.7, -96 + Y, -27 + L * 0.4, -80 + Y);
    g.lineTo(-27 + L * 0.3, -64 + Y); g.lineTo(28 + L * 0.3, -64 + Y);
    g.quadraticCurveTo(42 + L * 0.5, -70 + Y, 40 + L * 0.6, -90 + Y);
    g.quadraticCurveTo(36 + L * 0.8, -112 + Y, 26 + L, -126 + Y);
    g.quadraticCurveTo(18 + L, -134 + Y, 10 + L, -136 + Y);
    g.closePath();
  };
  shape(g, torso, HIDE, -34 + L, 42 + L, 1.6);
  // ---- the shorts: low under the gut, sagging off the plaid boxers' band (his crack out the back), the drawstring
  const wy = -50 + y, cr = -28 + y, Sx = L * 0.3;
  g.save(); g.beginPath(); g.rect(-30 + Sx, wy - 5, 26, 5); g.clip();
  px(g, -30 + Sx, wy - 5, 26, 5, BOXER[1]); for (let k = 0; k < 7; k++) { px(g, -30 + Sx + k * 4, wy - 5, 1.4, 5, BOXER[0]); px(g, -30 + Sx, wy - 3, 26, 0.8, BOXER[2]); }
  g.restore();
  line(g, [-31 + Sx, wy - 6, -30 + Sx, wy - 1], 1, HIDE[4]);
  const shorts = () => { g.moveTo(-30 + Sx, wy); g.quadraticCurveTo(4 + Sx, wy + 1, 36 + Sx, wy - 2); g.quadraticCurveTo(32 + Sx, cr - 6, 20 + Sx, cr); g.lineTo(-20 + Sx, cr); g.quadraticCurveTo(-29 + Sx, cr - 6, -30 + Sx, wy); g.closePath(); };
  shape(g, shorts, [SHORTS[1], SHORTS[1], SHORTS[2], SHORTS[3], SHORTS[4]], -30 + Sx, 36 + Sx, 1.4);
  px(g, -30 + Sx, wy, 66, 3, SHORTS[3]); px(g, -30 + Sx, wy, 66, 1, SHORTS[0]);
  for (let k = 0; k < 3; k++) line(g, [-8 + Sx + k * 9, cr - 6, -4 + Sx + k * 9, cr - 1], 0.8, SHORTS[3]);
  // ---- the near leg (under the gut: it hangs over his lap)
  leg(g, r.hip(1), r.footN, true, false);
  // ---- the gut: huge, hanging, out under the shirt: lit across its top; heat rash raw in the fold under it, mom's
  // calamine dabbed on that; the belly button (lint in it), the hair trail, stretch marks, boils, the sweat
  const gx = 18 + L * 0.5, gyy = -56 + y;
  const gut = () => g.ellipse(gx, gyy, 30, 22, -0.06, 0, TAU);
  shapeTop(g, gut, GUT, gyy - 22, gyy + 22, 1.4);
  g.save(); g.beginPath(); gut(); g.clip();
  px(g, gx - 34, gyy + 12, 70, 12, GUT[3]); px(g, gx - 34, gyy + 10, 70, 2, dith(g, GUT[3]));
  rash(g, gx - 6, gyy + 15, 14, 6, 1);
  for (const sx of [-22, -15, -8, 20, 25]) { line(g, [gx + sx, gyy - 6, gx + sx + 3, gyy + 7], 0.9, GUT[0]); line(g, [gx + sx + 0.7, gyy - 6, gx + sx + 3.7, gyy + 7], 0.4, GUT[3]); }
  g.restore();
  calamine(g, gx - 12, gyy + 13, 3.2); calamine(g, gx - 2, gyy + 16, 2.4); calamine(g, gx + 6, gyy + 13, 1.8);
  ell(g, gx + 10, gyy + 2, 2.4, 3.4, GUT[4]); px(g, gx + 9.2, gyy + 1.4, 1.4, 1.2, '#7A7A9A');
  for (let k = 0; k < 9; k++) px(g, gx + 10 + ((k * 3) % 4) - 2, gyy + 6 + k * 1.5, 0.8, 1.2, '#3A3418');
  for (let k = 0; k < 6; k++) px(g, gx + 6 + ((k * 5) % 9), gyy - 1 - k * 1.4, 0.7, 1, '#3A3418');
  boil(g, gx + 19, gyy - 9, 2.8); boil(g, gx - 17, gyy - 3, 2.2, false); boil(g, gx + 2, gyy - 15, 1.6);
  sweat(g, gx + 2, gyy - 10); sweat(g, gx + 24, gyy + 4, 1); sweat(g, gx - 22, gyy + 6, 0.9);
  px(g, gx - 14, gyy - 16, 3, 1, '#FFFFFF');
  // ---- the shirt: two sizes too small, riding up off the gut; the hem's lip, the pull lines, a pit stain, Cheeto
  // fingers wiped down it, a drip; the hole worn through where the little arm comes out
  const hemB = -90 + Y, hemF = -92 + Y;
  const shirt = () => {
    g.moveTo(-16 + L, -134 + Y);
    g.quadraticCurveTo(-30 + L, -132 + Y, -30 + L * 0.9, -116 + Y);
    g.quadraticCurveTo(-33 + L * 0.8, -100 + Y, -31 + L * 0.7, hemB);
    g.quadraticCurveTo(4 + L * 0.6, hemB - 3, 40 + L * 0.6, hemF);
    g.quadraticCurveTo(36 + L * 0.8, -112 + Y, 26 + L, -126 + Y);
    g.quadraticCurveTo(18 + L, -134 + Y, 10 + L, -136 + Y);
    g.closePath();
  };
  shape(g, shirt, SHIRT, -33 + L, 40 + L, 1.4);
  g.save(); g.beginPath(); shirt(); g.clip();
  // (the print: GLORP, their three-eyed skull, cracked and peeling from the wash)
  const pxx = 6 + L * 0.8, pyy = -114 + Y;
  g.font = 'bold 7px monospace'; g.fillStyle = '#18181B'; g.fillText('GLORP', pxx - 10.5, pyy - 6);
  g.fillStyle = '#DC2626'; g.fillText('GLORP', pxx - 11, pyy - 6.6);
  ell(g, pxx, pyy + 5, 8, 7.4, '#18181B'); ell(g, pxx, pyy + 4.4, 7, 6.4, '#F4F4F5'); px(g, pxx - 4.4, pyy + 9, 9, 3, '#18181B'); px(g, pxx - 3.4, pyy + 9.4, 7, 2.4, '#F4F4F5');
  for (const [ex, ey] of [[-3.4, 3.6], [3, 3.6], [-0.2, -0.6]] as const) ell(g, pxx + ex, pyy + ey, 1.7, 1.6, '#18181B');
  for (let k = 0; k < 3; k++) px(g, pxx - 2.4 + k * 2, pyy + 9.6, 0.8, 2.2, '#18181B');
  for (let k = 0; k < 5; k++) px(g, pxx - 8 + ((k * 7) % 15), pyy - 4 + ((k * 5) % 14), 1.4, 0.8, SHIRT[1]);
  for (let k = 0; k < 4; k++) line(g, [-20 + L * 0.7 + k * 3, hemB - 3 - k * 3, 6 + L * 0.7, hemB - 8 - k * 3.4, 32 + L * 0.7, hemF - 5 - k * 2.6], 0.8, SHIRT[2]);
  line(g, [22 + L, -122 + Y, 14 + L, -112 + Y, 18 + L, -104 + Y], 0.9, SHIRT[3]);
  line(g, [-24 + L, -122 + Y, -18 + L, -110 + Y], 0.9, SHIRT[3]);
  // (sweat soaked through: the pits, a ring down the back, the belly's line)
  ell(g, 26 + L, -116 + Y, 7, 9, dith(g, SWEAT)); ell(g, 26 + L, -116 + Y, 4.6, 6, dith(g, SHIRT[3]));
  ell(g, -22 + L, -108 + Y, 6, 12, dith(g, SWEAT));
  for (let k = 0; k < 3; k++) { px(g, 26 + L * 0.7 + k * 3, hemF - 9 + k * 0.6, 1.8, 6, CHEETO); px(g, 26.4 + L * 0.7 + k * 3, hemF - 9 + k * 0.6, 0.8, 6, '#FDBA74'); }
  ell(g, -14 + L * 0.8, -106 + Y, 3.4, 2.6, '#8A5A1A'); px(g, -15 + L * 0.8, -104 + Y, 1.4, 4, '#8A5A1A');
  // (pus soaked through over a boil under it: a yellow blot)
  ell(g, 8 + L * 0.8, -96 + Y, 3, 2.4, dith(g, PUS[2])); ell(g, 8 + L * 0.8, -96 + Y, 1.6, 1.3, PUS[3]);
  px(g, -40 + L, hemB - 3, 90, 3, SHIRT[3]); px(g, -40 + L, hemB - 4, 90, 1, SHIRT[0]);
  g.restore();
  // ---- the hump: a growth on his back, burst out through the shirt's seam; boils on it (one with a Band-Aid that's
  // given up), hairs off it
  const bx = -29 + L, by = -114 + Y;
  ell(g, bx + 1, by + 1, 15, 13.5, SHIRT[4]);
  for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU; line(g, [bx + Math.cos(a) * 13, by + Math.sin(a) * 11.6, bx + Math.cos(a) * 16, by + Math.sin(a) * 14.4], 0.6, SHIRT[2]); }
  shape(g, () => g.ellipse(bx, by, 13, 11.5, -0.3, 0, TAU), HIDE, bx - 13, bx + 13, 1.3);
  rash(g, bx + 2, by + 3, 8, 5, 7, false);
  boil(g, bx - 4, by - 4, 3.8); boil(g, bx + 5, by + 2, 2.6); boil(g, bx - 7, by + 5, 2, false);
  bandAid(g, bx + 3, by - 7, -0.5);
  for (let k = 0; k < 6; k++) line(g, [bx - 10 + k * 3, by - 9 + Math.abs(k - 2.5), bx - 12 + k * 3.4, by - 14 + Math.abs(k - 2.5)], 0.6, '#0A0604');
  // (the hole for the chest arm: ragged, threads off it)
  const [holeX, holeY] = r.hole;
  ell(g, holeX, holeY, 5, 4, SHIRT[4]); ell(g, holeX, holeY, 4, 3.2, HIDE[3]);
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; line(g, [holeX + Math.cos(a) * 4.4, holeY + Math.sin(a) * 3.6, holeX + Math.cos(a) * 6.4, holeY + Math.sin(a) * 5.4], 0.6, SHIRT[3]); }
  // ---- the head; the chest arm (little, out through the hole in the shirt, never still); the gun arm
  const hx = r.hx, hy = r.hy;
  const open = o.mouth ? 6 : full === 'mad' ? 6 : full === 'ow' ? 8 : full === 'wheeze' ? 5 : full === 'shock' ? 7 : full === 'cry' ? 9 : full === 'puke' ? 12 : full === 'aim' || full === 'gag' ? 0 : 1;
  head(g, hx, hy, full, open, Y, L);
  // (the aim's tongue, out the corner of the mouth)
  if (full === 'aim') { ell(g, hx + 6, hy + 17, 2.6, 2, '#E87A96'); px(g, hx + 4.6, hy + 16, 2, 0.8, '#FFC0D0'); }
  arm(g, r.hole, r.hC, 'kid');
  arm(g, r.sh(1), r.hN, 'gun', fist, !!o.noHand);
  // (the slime on him: a wet line down the jaw, glints)
  px(g, hx + 30, hy + 34, 2, 6, SLIME); px(g, hx + 30, hy + 40, 2, 2, SLIME_L);
  px(g, -14 + L, -132 + Y, 3, 1, SLIME_L);
};

/** Where a hand ends (from his feet, facing right, art units): 0 the gun arm's, 1 the far, 2 the chest arm's. */
export const kidHand = (o: KidOpts, which: 0 | 1 | 2): [number, number] => {
  const r = rig(o);
  const [s, h, A, B] = which === 0 ? [r.sh(1), r.hN, GUN_A, GUN_B] : which === 1 ? [r.sh(-1), r.hF, FAR_A, FAR_B] : [r.hole, r.hC, KID_A, KID_B];
  return reachTo(s[0], s[1], h[0], h[1], A, B);
};
/** Where the arm that's up to fire ends (for the bolt and the palm's glow), from his feet, facing right. */
export const kidPalm = (arm: 0 | 1 | 2): [number, number] => {
  const h = kidHand({ pose: 'aim', q: 0, arm }, arm);
  return [h[0] + (arm === 0 ? 14 : 4), h[1]];
};
/** Spots on him (art units, facing right) for the live misery: the mouth's corner (drool, puke), the hump's big
 *  boil, the gut's, the neck's. */
export const kidSpots = (o: KidOpts) => {
  const r = rig(o), Y = r.y + 14;
  return { mouth: [r.hx + 38, r.hy + 16] as P, hump: [-33 + r.L, -118 + Y] as P, gut: [37 + r.L * 0.5, -65 + r.y] as P, jaw: [r.hx - 12, r.hy + 10] as P };
};
/** His body (art units, facing right; feet at 0): what's solid of him (walking into it hurts) over the gap under his
 *  gut, between his legs; and how low that gap is. Down on his knee (the buckle) or squatting low, there's no gap. */
export const kidBody = (pose: KidPose) => {
  const low = pose === 'buckle' || pose === 'sit' || pose === 'stun';
  const crouch = pose === 'buckle' ? 24 : pose === 'slamDown' || pose === 'lowBack' || pose === 'stompDown' ? 22 : pose === 'lowThru' ? 18 : pose === 'retch' || pose === 'puke' || pose === 'whipOut' ? 12 : 0;
  return { x0: -40, x1: 66, top: pose === 'buckle' ? -86 : -150 + crouch, gap: low ? 0 : Math.max(0, 28 - crouch) };
};
/** The kid's height (his box, art units) and how far his head is up. */
export const KID_W = 92, KID_H = 150;

/** A pose's box (art units): wide enough for its hands. */
const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
const boxOf = (key: string, o: KidOpts) => {
  let b = boxes.get(key);
  if (b) return b;
  const r = rig(o), hs = [kidHand(o, 0), kidHand(o, 1), kidHand(o, 2)];
  const xs = [...hs.map(h => h[0]), r.footN[0] + 26, r.footF[0] - 14, r.hx + 50, -50 + r.L], ys = [...hs.map(h => h[1]), r.hy - 38, -138 + r.y];
  const x0 = Math.floor(Math.min(...xs) - 16), x1 = Math.ceil(Math.max(...xs) + 16), y0 = Math.floor(Math.min(...ys) - 16);
  b = { x: x0, y: y0, w: x1 - x0, h: 8 - y0 };
  boxes.set(key, b);
  return b;
};

/** Turned (falling over into the slide's mouth): the stamp cache won't take a turned draw, so a pose is baked once
 *  into a canvas of its own (twice size) and that's drawn turned. */
const turned = new Map<string, HTMLCanvasElement>();
const TS = 2;
const turnedKid = (key: string, o: KidOpts, b: { x: number; y: number; w: number; h: number }): HTMLCanvasElement | null => {
  let cv = turned.get(key);
  if (cv) return cv;
  if (typeof document === 'undefined') return null;
  cv = document.createElement('canvas'); cv.width = Math.ceil(b.w * TS); cv.height = Math.ceil(b.h * TS);
  const g = cv.getContext('2d')!;
  g.scale(TS, TS); g.translate(-b.x, -b.y);
  paintKid(g, o);
  turned.set(key, cv);
  return cv;
};

/** Drawn (stamped by pose, frame, arm): the palm's glow and the drool live over it. Feet at (0, 0), facing right, in
 *  art units (scale by KID_S first). `o.q` below 0: the pose's loop runs off the frame count. */
export const drawKid = (c: Ctx, o: KidOpts, f: number, glow = 0) => {
  const N = kidFrames(o.pose);
  const q = o.q >= 0 ? o.q % N : N > 1 ? Math.floor(f / (o.pose === 'spasm' ? 3 : 8)) % N : 0;
  const mouth = o.pose === 'talk' ? Math.floor(f / 6) % 2 === 0 : !!o.mouth;
  const oo: KidOpts = { ...o, q, mouth };
  const key = `wp-kid2-${o.pose}-${q}-${o.pose === 'aim' || o.pose === 'fire' ? o.arm ?? 0 : 0}-${mouth ? 1 : 0}-${o.noHand ? 1 : 0}`;
  const b = boxOf(key, oo);
  const m = c.getTransform();
  if (m.b !== 0 || m.c !== 0) {
    const cv = turnedKid(key, oo, b);
    if (cv) c.drawImage(cv, b.x, b.y, b.w, b.h);
  } else stamp(c, key, b.x, b.y, b.w, b.h, g => paintKid(g, oo));
  if (glow > 0 && (o.pose === 'aim' || o.pose === 'fire')) {
    const [px, py] = kidPalm(o.arm ?? 0);
    c.globalAlpha = Math.min(1, glow) * (0.5 + 0.3 * Math.sin(f * 0.9));
    c.fillStyle = '#7CFF3A'; c.beginPath(); c.arc(px, py, 10 + glow * 6, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1; c.fillStyle = '#ECFCCB'; c.fillRect(px - 3, py - 3, 6, 6);
  }
  // (drool: two strings off the lip's corner, swinging, stretching, letting go)
  const [mx, my] = kidSpots(oo).mouth;
  c.fillStyle = ALIEN.slime;
  const d1 = 6 + ((f >> 2) % 14), d2 = 3 + (((f + 23) >> 2) % 9);
  c.fillRect(Math.round(mx + Math.sin(f * 0.07) * 2), my, 2, d1);
  c.fillRect(Math.round(mx - 6 + Math.sin(f * 0.05 + 1) * 1.5), my + 1, 1.5, d2);
  c.fillStyle = ALIEN.slimeLight; c.fillRect(Math.round(mx + Math.sin(f * 0.07) * 2), my + d1 - 2, 2, 2);
};

/** The whip: the gun arm's forearm unspooled out along the floor from the wrist (art units, facing right) to `tip`,
 *  the hand slapping along at its end. The stretched flesh is a strip baked once and drawn stretched; the hand a
 *  stamp. */
let lashStrip: HTMLCanvasElement | null = null;
const lashImg = () => {
  if (lashStrip || typeof document === 'undefined') return lashStrip;
  const S = 4, W = 40, H = 12, cv = document.createElement('canvas');
  cv.width = W * S; cv.height = H * S;
  const g = cv.getContext('2d')!;
  g.scale(S, S);
  tube(g, -4, H / 2, 4.6, W + 4, H / 2, 4.6, HIDE, 0, 1);
  veinAt(g, [0, 4, 10, 3, 20, 5, 30, 3.4, 40, 4.6], 1);
  rash(g, 26, 7, 5, 2.4, 11, false);
  for (const x of [8, 17, 33]) px(g, x, 8.4, 2, 0.8, HIDE[3]);
  boil(g, 14, 4.4, 1.6, true);
  lashStrip = cv;
  return cv;
};
export const drawLash = (c: Ctx, o: KidOpts, tip: number) => {
  const [wx, wy] = kidHand(o, 0), img = lashImg();
  if (img && tip > wx) c.drawImage(img, wx - 2, wy - 6, tip - wx + 4, 12);
  c.save(); c.translate(Math.round(tip), Math.round(wy));
  stamp(c, 'wp-kid2-lashhand', -10, -12, 32, 24, g => hand(g, [0, 0], 0, 7.4, HIDE));
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------
// The contact sheet (the standing rule: every pose looked at before a figure's done)

/** Every pose (every frame of the looping ones), side by side, at the fight's scale: a canvas. */
export const kidContactSheet = (only?: KidPose[], zoom = 0.62, cols = 8): HTMLCanvasElement | null => {
  if (typeof document === 'undefined') return null;
  const all: KidOpts[] = [];
  for (const p of only ?? KID_POSES) {
    if (p === 'aim' || p === 'fire') { for (const a of [0, 1, 2] as const) all.push({ pose: p, q: 0, arm: a }); continue; }
    for (let q = 0; q < kidFrames(p); q++) all.push({ pose: p, q, noHand: p === 'whipOut' });
  }
  const cell = Math.round(300 * zoom / 0.62), rows = Math.ceil(all.length / cols), S = KID_S;
  const cv = document.createElement('canvas'); cv.width = cols * cell; cv.height = rows * (cell + 20);
  const g = cv.getContext('2d')!;
  g.fillStyle = '#3A4A5E'; g.fillRect(0, 0, cv.width, cv.height);
  all.forEach((o, i) => {
    const x = (i % cols) * cell, y = Math.floor(i / cols) * (cell + 20);
    g.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#46566C' : '#3E4E62'; g.fillRect(x, y, cell, cell + 20);
    g.fillStyle = '#9AA8B8'; g.fillRect(x, y + cell - 20, cell, 1);
    g.save(); g.translate(x + cell * 0.37, y + cell - 20); g.scale(S * zoom, S * zoom);

    paintKid(g, o);
    if (o.noHand) drawLash(g, o, 210);
    g.restore();
    g.fillStyle = '#FFFFFF'; g.font = '12px monospace'; g.fillText(`${o.pose} ${o.q}${o.arm !== undefined ? ' a' + o.arm : ''}`, x + 6, y + cell + 14);
  });
  return cv;
};
// ---------------------------------------------------------------------------------------------------------------
// The corpse

/** Dead, belly-down and stretched out (the slide's mouth, and the sled he rides down): feet at the left, head off to
 *  the right, the face in the water. (x, y) is the middle of his underside. Painted once. */
export const paintKidCorpse = (g: Ctx) => {
  // (the legs back: the shorts' legs, the skinny shins, the socks, the slides gone (his three toes curled), the short
  // one shorter)
  for (const [y0, near] of [[-12, false], [-18, true]] as const) {
    const skin = near ? HIDE : HIDE_F;
    const kx = -74, ky = y0 + 2, ax = near ? -114 : -108, ay = y0 + 4;
    tube(g, kx, ky, 5.4, ax, ay, 4.4, skin, 0, 1);
    tube(g, kx - 16, ky + 1, 5.4, ax, ay, 5.2, near ? SOCK : [SOCK[1], SOCK[2], SOCK[3], SOCK[3], SOCK[4]], 0, 1);
    line(g, [kx - 18, ky - 4, kx - 18, ky + 6], 1.4, '#DC2626'); line(g, [kx - 21, ky - 4, kx - 21, ky + 6], 1.4, '#2563EB');
    for (let k = 0; k < 3; k++) { ell(g, ax - 6 - k * 0.6, ay - 3 + k * 2.6, 3.2, 1.4, skin[4]); ell(g, ax - 6, ay - 3.4 + k * 2.6, 2.6, 1, skin[1]); ell(g, ax - 9.4, ay - 3 + k * 2.6, 1, 0.8, PEG[2]); }
    tube(g, -44, y0, 12, kx + 4, ky, 10, near ? SHORTS : SHORTS_F, 1, 1.2);
    line(g, [-44, y0 - 9, kx + 4, ky - 8], 1.8, '#F4F4F5');
  }
  // (the far arm trailing back along his side, limp)
  tube(g, -10, -8, 5, -40, -2, 4, HIDE_F, 0, 1); hand(g, [-44, -1], Math.PI - 0.1, 5, HIDE_F);
  // (the body flat: the back, the shirt rucked up off it (the tour dates on the back), the plaid band, the shorts)
  shapeTop(g, () => g.ellipse(-2, -18, 50, 16, 0, 0, TAU), HIDE, -34, -2, 1.6);
  ell(g, 6, -4, 40, 6, GUT[2]); px(g, -30, -3, 70, 1, GUT[4]);
  shapeTop(g, () => { g.moveTo(-14, -32); g.quadraticCurveTo(14, -38, 46, -30); g.lineTo(44, -12); g.quadraticCurveTo(14, -16, -12, -10); g.closePath(); }, SHIRT, -38, -10, 1.3);
  g.font = 'bold 6px monospace'; g.fillStyle = '#DC2626'; g.fillText('GLORP', 6, -24);
  g.fillStyle = '#18181B'; for (let k = 0; k < 4; k++) px(g, 6 + k * 1.2, -20 + k * 2.4, 22 - k * 3, 0.9, '#18181B');
  ell(g, 34, -22, 4, 5, dith(g, SWEAT)); px(g, 0, -16, 2, 6, CHEETO);
  zit(g, -6, -28, 1.2, true); zit(g, -16, -26, 0.9); wart(g, -22, -24, 1.6, true);
  g.save(); g.beginPath(); g.rect(-42, -26, 30, 4); g.clip(); px(g, -42, -26, 30, 4, BOXER[1]); for (let k = 0; k < 8; k++) px(g, -42 + k * 4, -26, 1.4, 4, BOXER[0]); px(g, -42, -24.4, 30, 0.8, BOXER[2]); g.restore();
  shape(g, () => { g.moveTo(-46, -24); g.lineTo(-14, -22); g.lineTo(-12, -4); g.lineTo(-48, -4); g.closePath(); }, SHORTS, -48, -12, 1.3);
  px(g, -46, -22, 32, 2, SHORTS[3]);
  // (the head forward, face down in the water: the neck, the side of the jaw, the cranium, mom's curlers; the headset
  // knocked round his neck; the long gun arm out ahead, limp, the gun's cells gone dark)
  shape(g, () => g.ellipse(48, -16, 18, 13, 0.1, 0, TAU), HIDE, 30, 66, 1.4);
  veinAt(g, [38, -24, 46, -22, 52, -26], 1);
  shape(g, () => { g.moveTo(54, -24); g.lineTo(84, -20); g.lineTo(86, -2); g.lineTo(52, -4); g.closePath(); }, HIDE, 52, 86, 1.4);
  for (let k = 0; k < 16; k++) px(g, 58 + ((k * 11) % 26), -10 + ((k * 7) % 6), 0.8, 0.8, STUB);
  zit(g, 64, -14, 1.4, true);
  shape(g, () => g.ellipse(72, -28, 12, 9, 0.2, 0, TAU), HIDE, 60, 84, 1.4);
  fill(g, HAIR[1], () => { g.moveTo(62, -32); g.quadraticCurveTo(54, -40, 44, -36); g.quadraticCurveTo(54, -30, 62, -26); g.closePath(); });
  for (const [cx, cy, r] of [[56, -38, CURL], [49, -36, CURL_P], [43, -32, CURL]] as const) { g.save(); g.translate(cx, cy); g.rotate(-0.4); shapeTop(g, () => g.roundRect(-3.6, -3, 7.2, 6, 2.2), r, -3, 3, 0.9); g.restore(); }
  // (mom's eye, open, staring off; dad's, shut: two lines)
  ell(g, 70, -33, 5.4, 4.6, HIDE[4]); ell(g, 70, -33, 4.6, 3.8, MOM_W[1]); ell(g, 68.4, -34, 1.8, 1.8, '#7C3AED'); px(g, 68, -34.4, 0.8, 0.8, '#0A0610');
  for (let k = 0; k < 4; k++) line(g, [66 + k * 2.4, -37, 65 + k * 2.6, -40], 0.7, '#0A0610');
  line(g, [76, -27, 80, -26], 1, HIDE[4]); line(g, [80, -24, 83, -23], 1, HIDE[4]);
  ell(g, 40, -6, 5, 5.6, SET[4]); ell(g, 40, -6, 3.6, 4.2, SET[2]); px(g, 38, -8, 3, 1, '#155E75');
  tube(g, 30, -22, 6, 70, -10, 5, HIDE, 2, 1);
  px(g, 44, -24, 20, 6, GUN[4]); px(g, 45, -23, 18, 4, GUN[2]); px(g, 45, -23, 18, 1, GUN[0]);
  for (let k = 0; k < 4; k++) px(g, 47 + k * 4, -22, 2, 3, '#14532D');
  tube(g, 70, -10, 6, 92, -6, 5.6, HIDE, 4, 1); hand(g, [98, -5], 0.1, 6, HIDE);
  // (the little chest arm, out from under him, its fingers curled: the last thing to go)
  tube(g, 14, -4, 2.6, 26, 4, 2.2, HIDE, 0, 0.9); hand(g, [28, 6], 0.8, 2.6, HIDE, true);
  // (the slime pooling off him)
  px(g, 86, -2, 8, 1.6, SLIME); px(g, 88, -2, 3, 0.8, SLIME_L);
};
export const drawKidCorpse = (c: Ctx) => stamp(c, 'wp-kid-corpse', -130, -60, 240, 74, paintKidCorpse);
