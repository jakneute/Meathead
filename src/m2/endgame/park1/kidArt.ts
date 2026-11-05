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

export type KidPose = 'idle' | 'walk' | 'crouch' | 'leap' | 'land' | 'aim' | 'fire' | 'stomp' | 'throw' | 'flail' | 'glitch' | 'hurt' | 'stagger' | 'dead' | 'talk' | 'sit' | 'stun';
/** Which arm's up to fire (the aim and fire poses): 0 the long gun arm, 1 the far one, 2 the little chest one. */
export interface KidOpts { pose: KidPose; q: number; arm?: 0 | 1 | 2; mouth?: boolean }

// (the bones: what each arm and leg can reach (the aims, the flail's swing), and where the little arm comes out)
const GUN_A = 36, GUN_B = 38, FAR_A = 36, FAR_B = 40, KID_A = 16, KID_B = 18;

/** The kid's skeleton for a pose: feet, hips, shoulders, hands, the head. (The hands are where the shots come from:
 *  kidPalm; don't move them.) */
const rig = (o: KidOpts) => {
  const ph = (o.q / 8) * Math.PI * 2;
  let crouch = 0, lean = 0, bob = 0;
  let footN: P = [10, 0], footF: P = [-12, 0];
  // (the hands: near long arm, far arm, the chest arm)
  let hN: P = [26, -66], hF: P = [-24, -70], hC: P = [18, -96];
  switch (o.pose) {
    case 'idle': case 'talk': bob = Math.round(Math.sin(ph) * 1.5); hC = [20 + Math.sin(ph * 2) * 4, -96 + Math.cos(ph * 2) * 4]; break;
    case 'walk': {
      // (the limp: the short far leg makes a hop of every other step)
      const st = 12;
      footN = [Math.sin(ph) * st + 6, -Math.max(0, Math.sin(ph)) * 8]; footF = [-Math.sin(ph) * st - 6, -Math.max(0, -Math.sin(ph)) * 4];
      bob = Math.round(Math.abs(Math.sin(ph)) * -5); lean = 4;
      hN = [26 - Math.sin(ph) * 10, -64]; hF = [-22 + Math.sin(ph) * 10, -70]; hC = [20 + Math.sin(ph * 3) * 5, -96];
      break;
    }
    case 'crouch': crouch = 24; lean = 10; hN = [30, -40]; hF = [-20, -44]; footN = [18, 0]; footF = [-18, 0]; hC = [22, -86]; break;
    case 'leap': lean = 6; footN = [16, -16]; footF = [-14, -6]; hN = [30, -138]; hF = [-30, -134]; hC = [26, -110]; break;
    case 'land': crouch = 30; footN = [24, 0]; footF = [-24, 0]; hN = [44, -20]; hF = [-38, -24]; hC = [22, -84]; break;
    case 'aim': case 'fire': {
      const up = o.pose === 'fire' ? 4 : 0;
      if (o.arm === 0) hN = [64 + up, -108]; else if (o.arm === 1) hF = [26 + up, -182]; else hC = [48 + up, -100];
      lean = o.pose === 'fire' ? -4 : 2;
      break;
    }
    case 'stomp': footN = [12, -24]; hN = [18, -148]; hF = [-12, -150]; hC = [16, -112]; lean = -2; break;
    case 'throw': hN = [56, -140]; hF = [-34, -96]; lean = 8; footN = [20, 0]; footF = [-20, 0]; break;
    case 'flail': { const a = ph * 2; hN = [Math.cos(a) * 52, -100 + Math.sin(a) * 52]; hF = [Math.cos(a + Math.PI) * 50, -100 + Math.sin(a + Math.PI) * 50]; hC = [Math.cos(a * 1.5) * 26, -96 + Math.sin(a * 1.5) * 20]; break; }
    case 'hurt': lean = -10; hN = [-6, -136]; hF = [-34, -128]; hC = [8, -120]; break;
    case 'stagger': lean = -14; footN = [20, 0]; footF = [-26, -10]; hN = [44, -150]; hF = [-48, -140]; hC = [26, -128]; break;
    case 'glitch': hN = [36, -84]; hF = [-34, -60]; lean = 6; break;
    // (the cheap shot's stun: knees in, bent over, all three hands at the crotch, the wheeze bobbing him)
    case 'stun': crouch = 16 + Math.round(Math.sin(ph) * 2); lean = 12; footN = [7, 0]; footF = [-7, 0]; hN = [14, -58]; hF = [2, -56]; hC = [9, -64]; break;
    case 'sit': crouch = 52; footN = [46, -4]; footF = [40, -2]; hN = [30, -60]; hF = [-24, -56]; break;
    default: break;
  }
  return { crouch, lean, bob, footN, footF, hN, hF, hC };
};

/** What his face is doing, by pose. */
type Face = 'dull' | 'mad' | 'ow' | 'aim' | 'wheeze' | 'shock';
const faceOf = (pose: KidPose): Face =>
  pose === 'crouch' || pose === 'stomp' || pose === 'throw' ? 'mad'
    : pose === 'hurt' || pose === 'stagger' || pose === 'land' ? 'ow'
      : pose === 'aim' || pose === 'fire' ? 'aim'
        : pose === 'stun' ? 'wheeze'
          : pose === 'flail' || pose === 'glitch' || pose === 'leap' ? 'shock' : 'dull';

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

/** A leg: the shorts' leg down over the thigh, the knobby knee, the skinny shin, the tube sock, the slide, the toes. */
const leg = (c: Ctx, hp: P, f: P, near: boolean, short: boolean) => {
  const skin = near ? HIDE : HIDE_F, cloth = near ? SHORTS : SHORTS_F;
  const th = short ? 27 : 31, sn = short ? 27 : 31;
  const an: P = [f[0], f[1] - 9];
  const [kx, ky] = knee(hp[0], hp[1], an[0], an[1], th, sn, 1);
  // (the shin: skinny, a wart on it; the knee a knob)
  tube(c, kx, ky, 5.5, an[0], an[1], 4.2, skin, 0, 1);
  ell(c, kx + 1.5, ky, 6.4, 5.6, skin[4]); ell(c, kx + 1, ky - 0.5, 5.4, 4.6, skin[1]); ell(c, kx + 2, ky + 1, 3.4, 2.6, skin[2]); px(c, kx - 1.5, ky - 3, 3, 1, skin[0]);
  if (near) wart(c, (kx + an[0]) / 2 + 4, (ky + an[1]) / 2 - 2, 1.4);
  // (the tube sock: up to mid-shin, two stripes round the top, slouched in rings, gone gray at the toe)
  const sx = kx + (an[0] - kx) * 0.42, sy = ky + (an[1] - ky) * 0.42;
  tube(c, sx, sy, 5.4, an[0], an[1], 5.2, near ? SOCK : [SOCK[1], SOCK[2], SOCK[3], SOCK[3], SOCK[4]], 0, 1);
  const da = Math.atan2(an[1] - sy, an[0] - sx), wx = -Math.sin(da), wy = Math.cos(da);
  for (const [k, col] of [[0.12, '#DC2626'], [0.26, '#2563EB']] as const) {
    const cx = sx + (an[0] - sx) * k, cy = sy + (an[1] - sy) * k;
    line(c, [cx - wx * 4.6, cy - wy * 4.6, cx + wx * 4.6, cy + wy * 4.6], 1.6, col);
  }
  for (const k of [0.55, 0.75]) { const cx = sx + (an[0] - sx) * k, cy = sy + (an[1] - sy) * k; line(c, [cx - wx * 4, cy - wy * 4 + 0.6, cx + wx * 4, cy + wy * 4 - 0.4], 0.6, SOCK[3]); }
  // (the slide: the sole, lit along its top, the strap across, the brand's swoosh-ish dot; his three toes out the
  // front, long, yellow-clawed; the gray heel of the sock)
  const fx = f[0], fy = f[1];
  for (const [tx, ty] of [[11, -3.4], [15, -2.6], [17.6, -1.4]] as const) { ell(c, fx + tx, fy + ty, 4.2, 2.1, skin[4]); ell(c, fx + tx - 0.4, fy + ty - 0.3, 3.4, 1.5, skin[1]); px(c, fx + tx - 2, fy + ty - 1.4, 2.4, 0.7, skin[0]); ell(c, fx + tx + 3.6, fy + ty + 0.2, 1.4, 1, PEG[2]); }
  ell(c, fx - 3, fy - 3, 4.4, 3, SOCK[3]); px(c, fx - 5, fy - 5, 3, 1, SOCK[2]);
  px(c, fx - 8, fy - 2.6, 26, 3.6, SLIDE[4]); px(c, fx - 7, fy - 2, 24, 1.4, SLIDE[0]); px(c, fx - 7, fy - 0.6, 24, 1, SLIDE[2]);
  shape(c, () => { c.moveTo(fx - 3, fy - 2); c.lineTo(fx - 2, fy - 8); c.quadraticCurveTo(fx + 4, fy - 11, fx + 10, fy - 7); c.lineTo(fx + 10, fy - 2); c.closePath(); }, SLIDE, fx - 3, fx + 10, 1);
  ell(c, fx + 4, fy - 6, 1.6, 1.2, '#FFFFFF'); px(c, fx + 2, fy - 6.4, 2, 0.8, '#FFFFFF');
  // (the shorts' leg: baggy, past the knee, the side stripe, the mesh, the hem's lip)
  const hem: P = [kx + (hp[0] - kx) * 0.08, ky + (hp[1] - ky) * 0.08 + 3];
  tube(c, hp[0], hp[1] - 2, 11.5, hem[0], hem[1], 10, cloth, 1, 1.2);
  const la = Math.atan2(hem[1] - hp[1], hem[0] - hp[0]), lx = -Math.sin(la), ly = Math.cos(la);
  line(c, [hp[0] - lx * 9, hp[1] - ly * 9, hem[0] - lx * 8, hem[1] - ly * 8], 2, '#F4F4F5');
  line(c, [hp[0] - lx * 9 + 0.5, hp[1] - ly * 9 + 1, hem[0] - lx * 8 + 0.5, hem[1] - ly * 8 + 1], 0.6, cloth[3]);
  for (let k = 0; k < 4; k++) { const t = 0.25 + k * 0.17, mx = hp[0] + (hem[0] - hp[0]) * t, my = hp[1] + (hem[1] - hp[1]) * t; ell(c, mx + lx * 2, my + ly * 2, 2.4, 1.4, dith(c, cloth[2]), la); }
  // (the folds: a crease or two behind the knee)
  line(c, [hem[0] + lx * 4 - 3, hem[1] + ly * 4 - 6, hem[0] + lx * 7, hem[1] + ly * 7 - 2], 0.9, cloth[3]);
  line(c, [hem[0] - lx * 10, hem[1] - ly * 10 + 0.5, hem[0] + lx * 10, hem[1] + ly * 10 + 0.5], 1.4, cloth[0]);
};

/** An arm: the upper arm (a sleeve's band round its top), the elbow, the forearm, the hand. The gun arm's forearm is
 *  a Popeye one with his dad's ray gun grown into it: the housing strapped in by the flesh, the cells, the coil, the
 *  tubes going in under the skin (veins swollen round them, a stapled scar), the barrel out over the back of his
 *  hand. */
const arm = (c: Ctx, s: P, hIn: P, kind: 'gun' | 'far' | 'kid', fist = false) => {
  const [A, B] = kind === 'gun' ? [GUN_A, GUN_B] : kind === 'far' ? [FAR_A, FAR_B] : [KID_A, KID_B];
  const skin = kind === 'far' ? HIDE_F : HIDE;
  const h = reachTo(s[0], s[1], hIn[0], hIn[1], A, B);
  const [ex, ey] = elbow(s[0], s[1], h[0], h[1], A, B, 1);
  const r0 = kind === 'kid' ? 2.8 : kind === 'gun' ? 6.4 : 5.6, r1 = kind === 'kid' ? 2.4 : 4.6;
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
  }
  const fa = Math.atan2(h[1] - ey, h[0] - ex), ux = Math.cos(fa), uy = Math.sin(fa), nx = -uy, ny = ux;
  if (kind === 'gun') {
    // (Popeye: the forearm swells out to twice the upper arm, the veins roped over it)
    tube(c, ex, ey, 5.4, h[0] - ux * 4, h[1] - uy * 4, 6.2, skin, 6, 1);
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
    hand(c, [h[0], h[1]], fa, 6.2, skin, fist);
  } else if (kind === 'far') {
    tube(c, ex, ey, 4.6, h[0] - ux * 3, h[1] - uy * 3, 3.8, skin, 1, 1);
    veinAt(c, [ex + nx * 2 + ux * 6, ey + ny * 2 + uy * 6, ex + ux * 18 + nx * 1, ey + uy * 18 + ny * 1], 0.9);
    hand(c, [h[0], h[1]], fa, 5.2, skin, fist);
  } else {
    // (the little one: a baby's arm, out of a hole worn through his shirt, three tiny fingers going)
    tube(c, ex, ey, 2.4, h[0], h[1], 2, skin, 0, 0.9);
    hand(c, [h[0], h[1]], fa, 2.8, skin, fist);
  }
};

// ---------------------------------------------------------------------------------------------------------------
// The head: the wide neck, the cinder-block jaw (his dad's), the tiny cranium on the front of it, three eyes

const head = (c: Ctx, hx: number, hy: number, face: Face, open: number, by: number, L: number) => {
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
};

// ---------------------------------------------------------------------------------------------------------------
// The body

/** The kid, painted: feet at (0, 0), facing right. */
export const paintKid = (g: Ctx, o: KidOpts) => {
  const r = rig(o), y = r.bob + r.crouch, L = r.lean;
  const face = faceOf(o.pose);
  const hip = (s: number): P => [s * 9 + L * 0.3, -66 + y];
  const sh = (s: number): P => [s * 20 + L, -124 + y];
  const fist = o.pose === 'stomp' || o.pose === 'throw' || o.pose === 'crouch';
  // ---- the far leg (the short one), the far arm
  leg(g, hip(-1), r.footF, false, true);
  arm(g, sh(-1), r.hF, 'far', fist);
  // ---- the body: round shoulders, the slouched back, the soft pot gut out the front
  const Y = y;
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
  // (the gut out under the shirt: lit across its top, the belly button, the hair trail, stretch marks, the sweat)
  const gx = 14 + L * 0.5, gyy = -78 + Y;
  shapeTop(g, () => g.ellipse(gx, gyy, 25, 13, -0.08, 0, TAU), GUT, gyy - 13, gyy + 13, 1.2);
  ell(g, gx + 6, gyy + 1, 1.8, 2.4, GUT[4]); px(g, gx + 5.4, gyy + 0.4, 1, 1, GUT[3]);
  for (let k = 0; k < 7; k++) px(g, gx + 6 + ((k * 3) % 4) - 2, gyy + 4 + k * 1.4, 0.8, 1, '#3A3418');
  for (let k = 0; k < 6; k++) px(g, gx - 2 + ((k * 5) % 9), gyy + 0.6 - k * 1.2, 0.7, 0.9, '#3A3418');
  for (const sx of [-14, -9, 18]) line(g, [gx + sx, gyy + 2, gx + sx + 2, gyy + 8], 0.7, GUT[0]);
  px(g, gx - 10, gyy - 6, 2, 1, '#FFFFFF');
  // (the shirt: two sizes too small, riding up off the gut; the hem's lip, the pull lines over the gut, a pit stain,
  // Cheeto fingers wiped down it, a drip; the hole worn through where the little arm comes out)
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
  px(g, pxx + 2, pyy - 14.6, 1, 1, '#18181B'); px(g, pxx + 4, pyy - 14.6, 1, 1, '#18181B');
  ell(g, pxx, pyy + 5, 8, 7.4, '#18181B'); ell(g, pxx, pyy + 4.4, 7, 6.4, '#F4F4F5'); px(g, pxx - 4, pyy + 9, 8, 3, '#F4F4F5'); px(g, pxx - 4.4, pyy + 9, 9, 3, '#18181B'); px(g, pxx - 3.4, pyy + 9.4, 7, 2.4, '#F4F4F5');
  for (const [ex, ey] of [[-3.4, 3.6], [3, 3.6], [-0.2, -0.6]] as const) ell(g, pxx + ex, pyy + ey, 1.7, 1.6, '#18181B');
  for (let k = 0; k < 3; k++) px(g, pxx - 2.4 + k * 2, pyy + 9.6, 0.8, 2.2, '#18181B');
  for (let k = 0; k < 5; k++) px(g, pxx - 8 + ((k * 7) % 15), pyy - 4 + ((k * 5) % 14), 1.4, 0.8, SHIRT[1]);
  // (the pull lines over the gut, the stretch at the armpits)
  for (let k = 0; k < 4; k++) line(g, [-20 + L * 0.7 + k * 3, hemB - 3 - k * 3, 6 + L * 0.7, hemB - 8 - k * 3.4, 32 + L * 0.7, hemF - 5 - k * 2.6], 0.8, SHIRT[2]);
  line(g, [22 + L, -122 + Y, 14 + L, -112 + Y, 18 + L, -104 + Y], 0.9, SHIRT[3]);
  line(g, [-24 + L, -122 + Y, -18 + L, -110 + Y], 0.9, SHIRT[3]);
  // (the pit stain: a dithered ring under the near arm; Cheeto fingers; a drip of something)
  ell(g, 26 + L, -116 + Y, 7, 9, dith(g, SWEAT)); ell(g, 26 + L, -116 + Y, 4.6, 6, dith(g, SHIRT[3]));
  for (let k = 0; k < 3; k++) { px(g, 26 + L * 0.7 + k * 3, hemF - 9 + k * 0.6, 1.8, 6, CHEETO); px(g, 26.4 + L * 0.7 + k * 3, hemF - 9 + k * 0.6, 0.8, 6, '#FDBA74'); }
  ell(g, -14 + L * 0.8, -106 + Y, 3.4, 2.6, '#8A5A1A'); px(g, -15 + L * 0.8, -104 + Y, 1.4, 4, '#8A5A1A');
  // (the hem riding up: its rolled lip; holes in it)
  px(g, -40 + L, hemB - 3, 90, 3, SHIRT[3]); px(g, -40 + L, hemB - 4, 90, 1, SHIRT[0]);
  g.restore();
  // (the hole for the chest arm: ragged, threads off it)
  const holeX = 14 + L, holeY = -104 + Y;
  ell(g, holeX, holeY, 5, 4, SHIRT[4]); ell(g, holeX, holeY, 4, 3.2, HIDE[3]);
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; line(g, [holeX + Math.cos(a) * 4.4, holeY + Math.sin(a) * 3.6, holeX + Math.cos(a) * 6.4, holeY + Math.sin(a) * 5.4], 0.6, SHIRT[3]); }
  // (zits on the back of the shoulders, a wart)
  zit(g, -22 + L, -128 + Y, 1.2, true); zit(g, -26 + L, -122 + Y, 0.9); wart(g, -27 + L * 0.8, -100 + Y, 1.6, true);
  // ---- the shorts: sagging off the plaid boxers' band, the drawstring, the folds, the crotch
  const wy = -72 + Y;
  g.save(); g.beginPath(); g.rect(-30 + L * 0.3, wy - 4, 28, 4); g.clip();
  px(g, -30 + L * 0.3, wy - 4, 28, 4, BOXER[1]); for (let k = 0; k < 7; k++) { px(g, -30 + L * 0.3 + k * 4, wy - 4, 1.4, 4, BOXER[0]); px(g, -30 + L * 0.3, wy - 2.4, 28, 0.8, BOXER[2]); }
  g.restore();
  const shorts = () => { g.moveTo(-30 + L * 0.3, wy); g.quadraticCurveTo(0 + L * 0.3, wy + 1, 36 + L * 0.4, wy - 2); g.quadraticCurveTo(30 + L * 0.3, -60 + Y, 20 + L * 0.3, -54 + Y); g.lineTo(-20 + L * 0.3, -54 + Y); g.quadraticCurveTo(-28 + L * 0.3, -60 + Y, -30 + L * 0.3, wy); g.closePath(); };
  shape(g, shorts, [SHORTS[1], SHORTS[1], SHORTS[2], SHORTS[3], SHORTS[4]], -30 + L * 0.3, 36 + L * 0.4, 1.4);
  px(g, -30 + L * 0.3, wy, 66, 3, SHORTS[3]); px(g, -30 + L * 0.3, wy, 66, 1, SHORTS[0]);
  line(g, [6 + L * 0.3, wy + 2, 4 + L * 0.3, wy + 10, 6 + L * 0.3, wy + 13], 1, '#F8FAFC'); line(g, [10 + L * 0.3, wy + 2, 12 + L * 0.3, wy + 9], 1, '#F8FAFC');
  for (let k = 0; k < 3; k++) line(g, [-6 + L * 0.3 + k * 8, -60 + Y, -2 + L * 0.3 + k * 8, -55 + Y], 0.8, SHORTS[3]);
  // ---- the near leg; the head; the chest arm (little, out through the hole in the shirt, never still); the gun arm
  leg(g, hip(1), r.footN, true, false);
  const hx = 18 + L * 1.3, hy = -150 + y;
  const open = o.mouth ? 5 : face === 'mad' ? 6 : face === 'ow' ? 8 : face === 'wheeze' ? 5 : face === 'shock' ? 7 : face === 'aim' ? 0 : 1;
  head(g, hx, hy, face, open, Y, L);
  // (the aim's tongue, out the corner of the mouth)
  if (face === 'aim') { ell(g, hx + 6, hy + 17, 2.6, 2, '#E87A96'); px(g, hx + 4.6, hy + 16, 2, 0.8, '#FFC0D0'); }
  arm(g, [holeX, holeY], r.hC, 'kid');
  arm(g, sh(1), r.hN, 'gun', fist);
  // (the slime on him: a wet line down the jaw, glints)
  px(g, hx + 30, hy + 34, 2, 6, SLIME); px(g, hx + 30, hy + 40, 2, 2, SLIME_L);
  px(g, -14 + L, -132 + Y, 3, 1, SLIME_L);
};

/** Where the arm that's up to fire ends (for the bolt and the palm's glow), from his feet, facing right. */
export const kidPalm = (arm: 0 | 1 | 2, crouch = 0): [number, number] => {
  const r = rig({ pose: 'aim', q: 0, arm });
  const h = arm === 0 ? r.hN : arm === 1 ? r.hF : r.hC;
  return [h[0] + (arm === 0 ? 12 : 4), h[1] + crouch];
};
/** The kid's height (his box) and how far his head is up. */
export const KID_W = 64, KID_H = 150;

/** Turned (falling over into the slide's mouth): the stamp cache won't take a turned draw, so a pose is baked once
 *  into a canvas of its own (twice size) and that's drawn turned. */
const turned = new Map<string, HTMLCanvasElement>();
const TS = 2;
const turnedKid = (key: string, o: KidOpts): HTMLCanvasElement | null => {
  let cv = turned.get(key);
  if (cv) return cv;
  if (typeof document === 'undefined') return null;
  cv = document.createElement('canvas'); cv.width = 180 * TS; cv.height = 216 * TS;
  const g = cv.getContext('2d')!;
  g.scale(TS, TS); g.translate(80, 210);
  paintKid(g, o);
  turned.set(key, cv);
  return cv;
};

/** Drawn (stamped by pose, frame, arm): the palm's glow and the drool live over it. Feet at (0, 0), facing right. */
export const drawKid = (c: Ctx, o: KidOpts, f: number, glow = 0) => {
  const moving = o.pose === 'walk' || o.pose === 'flail' || o.pose === 'idle' || o.pose === 'talk' || o.pose === 'stun';
  const q = moving ? Math.floor(f / (o.pose === 'flail' ? 2 : 5)) % 8 : 0;
  const mouth = o.pose === 'talk' ? Math.floor(f / 6) % 2 === 0 : !!o.mouth;
  const key = `wp-kid-${o.pose}-${q}-${o.arm ?? 0}-${mouth ? 1 : 0}`;
  const m = c.getTransform();
  if (m.b !== 0 || m.c !== 0) {
    const cv = turnedKid(key, { ...o, q, mouth });
    if (cv) c.drawImage(cv, -80, -210, 180, 216);
  } else stamp(c, key, -80, -210, 180, 216, g => paintKid(g, { ...o, q, mouth }));
  if (glow > 0 && (o.pose === 'aim' || o.pose === 'fire')) {
    const [px, py] = kidPalm(o.arm ?? 0);
    c.globalAlpha = Math.min(1, glow) * (0.5 + 0.3 * Math.sin(f * 0.9));
    c.fillStyle = '#7CFF3A'; c.beginPath(); c.arc(px, py, 10 + glow * 6, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1; c.fillStyle = '#ECFCCB'; c.fillRect(px - 3, py - 3, 6, 6);
  }
  // (drool, a string of it off the lip's corner, swinging)
  const rg = rig({ ...o, q }), dx = 18 + rg.lean * 1.3 + 32 + Math.sin(f * 0.08) * 2, dl = 6 + ((f >> 2) % 10);
  c.fillStyle = ALIEN.slime; c.fillRect(Math.round(dx), -150 + rg.bob + rg.crouch + 22, 2, dl);
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
