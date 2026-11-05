// ZORZARBLAX, drawn: Zorblax and Zarblax's kid. Their son, grown (twenty-six, the owner's "young adult"), still at
// home, mutated by being what he is. His dad's animal (crater/aliens.ts, m1 alienLook's colors): the tiny cranium
// perched on the front of a neck wider than it, the cinder-block jaw with the under-bite and the yellow pegs jutting
// up over the lip, the olive hide, veiny and wet; his dad's ray gun grown into his forearm (it came with him). His
// mom's (endgame/shots.ts): her lips (a smear of her lipstick he steals), her wart with its hair, the crest of a
// ponytail off the back of the cranium (in her curlers: she still does his hair). And what the family tree did to
// him: THREE eyes, none of them a match (two of his dad's beady yellow ones, one big lashed one of his mom's up top,
// looking somewhere else), THREE arms (the long gun arm, a normal one, and a little one out of his chest that never
// stops going), one leg shorter than the other (the hop in his walk), a hunch. Dressed like he never left his pod: a
// too-small yellow t-shirt (a band he likes: a skull with three eyes), basketball shorts, tube socks and pool slides,
// a gaming headset round his neck.
//
// About 150 tall, feet at the origin, facing right; every elbow and knee from art/limb.ts. Painted SNES-ish (the
// land bosses are drawn full in the first pass): each material in a ramp of four, shaded off a light up-left, a
// checker dither between the steps, inked. Stamped per pose and frame; the live bits (the palm's glow, the drool)
// over it.

import { stamp } from '../../../m1/game/render/stamp';
import { ALIEN } from '../../../m1/game/scenes/alienLook';
import { elbow, knee } from '../../art/limb';

type Ctx = CanvasRenderingContext2D;
const INK = '#0A0806';

// (light .. dark)
const HIDE = [ALIEN.hide[8], ALIEN.hide[6], ALIEN.hide[5], ALIEN.hide[3]];
const BELLY = [ALIEN.belly[6], ALIEN.belly[5], ALIEN.belly[4], ALIEN.belly[2]];
const SHIRT = ['#FDE68A', '#F2C230', '#C8921A', '#7A520E'];
const SHORTS = ['#C4B5FD', '#8B5CF6', '#6D28D9', '#3B0F7A'];
const SOCK = ['#FFFFFF', '#E8E4DC', '#C8C0B0', '#8A8070'];
const SLIDE = ['#93C5FD', '#3B82F6', '#1D4ED8', '#0F2A6A'];
const CURL = ['#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A'];
const HEADSET = ['#6B7280', '#3F3F46', '#27272A', '#09090B'];
const GUN = ['#E4E6EE', '#A4A8B2', '#6A6E7A', '#2A2C34'];

/** A 2x2 checker of one color (the dither between two steps), as a pattern: made once a color. */
const PATS = new Map<string, CanvasPattern | string>();
const dither = (g: Ctx, col: string): CanvasPattern | string => {
  let p = PATS.get(col);
  if (p) return p;
  const cv = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!cv) return col;
  cv.width = 4; cv.height = 4;
  const q = cv.getContext('2d')!; q.fillStyle = col; q.fillRect(0, 0, 2, 2); q.fillRect(2, 2, 2, 2);
  p = g.createPattern(cv, 'repeat') ?? col;
  PATS.set(col, p);
  return p;
};
/** A shaded ball: the ramp's mid, its dark side down-right, its lit side up-left, a checker between, inked. */
const ball = (g: Ctx, x: number, y: number, rx: number, ry: number, ramp: string[], rot = 0, line = 1.5) => {
  g.save();
  g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  g.fillStyle = ramp[1]; g.fill();
  g.clip();
  g.fillStyle = ramp[2]; g.beginPath(); g.ellipse(x + rx * 0.35, y + ry * 0.38, rx * 0.95, ry * 0.92, rot, 0, Math.PI * 2); g.fill();
  g.fillStyle = ramp[3]; g.beginPath(); g.ellipse(x + rx * 0.62, y + ry * 0.66, rx * 0.8, ry * 0.78, rot, 0, Math.PI * 2); g.fill();
  // (the checker over the dark step's edge: the dither, one pattern fill of the ring)
  g.fillStyle = dither(g, ramp[2]);
  g.beginPath(); g.ellipse(x + rx * 0.35, y + ry * 0.38, rx * 0.95 * 1.16, ry * 0.92 * 1.16, rot, 0, Math.PI * 2); g.ellipse(x + rx * 0.35, y + ry * 0.38, rx * 0.95, ry * 0.92, rot, 0, Math.PI * 2); g.fill('evenodd');
  g.fillStyle = ramp[0]; g.beginPath(); g.ellipse(x - rx * 0.32, y - ry * 0.36, rx * 0.42, ry * 0.34, rot, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = INK; g.lineWidth = line; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.stroke();
};
/** A limb: a fat inked stroke, shaded along its underside, lit along its top. */
const limb = (g: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, ramp: string[]) => {
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = ramp[1]; g.lineWidth = w; g.stroke();
  g.strokeStyle = ramp[2]; g.lineWidth = w * 0.45; g.beginPath(); g.moveTo(x0 + w * 0.22, y0 + w * 0.22); g.lineTo(x1 + w * 0.22, y1 + w * 0.22); g.stroke();
  g.strokeStyle = ramp[0]; g.lineWidth = Math.max(1, w * 0.22); g.beginPath(); g.moveTo(x0 - w * 0.22, y0 - w * 0.24); g.lineTo(x1 - w * 0.22, y1 - w * 0.24); g.stroke();
  g.lineCap = 'butt';
};
const R = (g: Ctx, x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
/** A shaded polygon (the shirt, the shorts): the mid, its far side darker (banded, dithered), inked. */
const shape = (g: Ctx, pts: [number, number][], ramp: string[], dark = 0.55) => {
  const xs = pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  g.save();
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  g.fillStyle = ramp[1]; g.fill(); g.clip();
  const cut = x0 + (x1 - x0) * dark;
  g.fillStyle = ramp[2]; g.fillRect(cut, y0, x1 - cut + 2, y1 - y0 + 2);
  g.fillStyle = dither(g, ramp[2]); g.fillRect(cut - 6, y0, 6, y1 - y0 + 2);
  g.fillStyle = ramp[3]; g.fillRect(x0, y1 - (y1 - y0) * 0.16, x1 - x0, (y1 - y0) * 0.2);
  g.fillStyle = ramp[0]; g.fillRect(x0, y0, (x1 - x0) * 0.35, 3);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
};

export type KidPose = 'idle' | 'walk' | 'crouch' | 'leap' | 'land' | 'aim' | 'fire' | 'stomp' | 'throw' | 'flail' | 'glitch' | 'hurt' | 'stagger' | 'dead' | 'talk' | 'sit' | 'stun';
/** Which arm's up to fire (the aim and fire poses): 0 the long gun arm, 1 the far one, 2 the little chest one. */
export interface KidOpts { pose: KidPose; q: number; arm?: 0 | 1 | 2; mouth?: boolean }

/** The kid's skeleton for a pose: feet, hips, shoulders, hands, the head. */
const rig = (o: KidOpts) => {
  const ph = (o.q / 8) * Math.PI * 2;
  let crouch = 0, lean = 0, bob = 0;
  let footN: [number, number] = [10, 0], footF: [number, number] = [-12, 0];
  // (the hands: near long arm, far arm, the chest arm)
  let hN: [number, number] = [26, -66], hF: [number, number] = [-24, -70], hC: [number, number] = [18, -96];
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

/** The kid, painted: feet at (0, 0), facing right. */
export const paintKid = (g: Ctx, o: KidOpts) => {
  const r = rig(o), y = r.bob + r.crouch, L = r.lean;
  const hip = (s: number): [number, number] => [s * 9 + L * 0.3, -66 + y];
  const sh = (s: number): [number, number] => [s * 22 + L, -124 + y];
  // ---- the far leg (the short one), the far arm
  const leg = (h: [number, number], f: [number, number], ramp: string[], short: boolean) => {
    const th = short ? 28 : 32, sn = short ? 28 : 32;
    const [kx, ky] = knee(h[0], h[1], f[0], f[1] - 12, th, sn, 1);
    limb(g, h[0], h[1], kx, ky, 15, ramp); limb(g, kx, ky, f[0], f[1] - 14, 12, ramp);
    // (the tube sock up the shin, its stripes; the pool slide)
    limb(g, (kx + f[0]) / 2, (ky + f[1] - 14) / 2, f[0], f[1] - 14, 13, SOCK);
    R(g, f[0] - 6, f[1] - 22, 12, 2, '#DC2626'); R(g, f[0] - 6, f[1] - 19, 12, 2, '#2563EB');
    ball(g, f[0] + 6, f[1] - 6, 13, 6, HIDE, 0, 1.2);
    for (const t of [12, 16, 19]) R(g, f[0] + t, f[1] - 7, 2, 4, '#1C1408');
    g.fillStyle = INK; g.fillRect(f[0] - 6, f[1] - 3, 26, 4); g.fillStyle = SLIDE[1]; g.fillRect(f[0] - 5, f[1] - 2, 24, 2);
    R(g, f[0] - 2, f[1] - 11, 10, 5, SLIDE[2]); R(g, f[0] - 2, f[1] - 11, 10, 1, SLIDE[0]);
  };
  const arm = (s: [number, number], h: [number, number], ramp: string[], w: number, a: number, b: number, gun: boolean) => {
    const [ex, ey] = elbow(s[0], s[1], h[0], h[1], a, b, 1);
    limb(g, s[0], s[1], ex, ey, w, ramp);
    // (the Popeye forearm, and on the long one his dad's ray gun grown into it: the coil, the barrel out past the wrist)
    limb(g, ex, ey, h[0], h[1], w + 4, ramp);
    if (gun) {
      const ang = Math.atan2(h[1] - ey, h[0] - ex);
      g.save(); g.translate((ex + h[0]) / 2, (ey + h[1]) / 2); g.rotate(ang);
      R(g, -10, -9, 22, 7, INK); R(g, -9, -8, 20, 5, GUN[1]); R(g, -9, -8, 20, 1, GUN[0]); R(g, -9, -4, 20, 1, GUN[2]);
      for (let k = 0; k < 4; k++) R(g, -7 + k * 5, -8, 2, 5, '#4ADE80');
      R(g, 12, -8, 12, 4, INK); R(g, 12, -7, 11, 2, GUN[2]);
      g.restore();
    }
    // (two fat fingers and a thumb)
    ball(g, h[0], h[1], w * 0.62, w * 0.58, ramp, 0, 1.2);
    R(g, h[0] + w * 0.3, h[1] - 2, w * 0.4, 3, ramp[3]);
  };
  leg(hip(-1), r.footF, [HIDE[1], HIDE[2], HIDE[3], '#0B140C'], true);
  arm(sh(-1), r.hF, [HIDE[1], HIDE[2], HIDE[3], '#0B140C'], 11, 30, 30, false);
  // ---- the body: the hunched barrel, the frog gut, the shirt (too small: the gut out under it), the shorts
  const cy = -100 + y;
  ball(g, L * 0.6, cy, 36, 40, HIDE, -0.2);
  ball(g, 6 + L * 0.5, cy + 16, 24, 22, BELLY, 0, 1);
  // (the hunch: the back up over the shoulders)
  ball(g, -16 + L * 0.6, cy - 26, 22, 18, HIDE, 0.4, 1.2);
  shape(g, [[-30 + L, cy - 32], [30 + L, cy - 30], [34 + L * 0.8, cy + 2], [-32 + L * 0.8, cy + 4]], SHIRT, 0.6);
  // (the band's skull, three-eyed, on the front; a hole worn through the shirt by his chest arm)
  ball(g, 6 + L, cy - 16, 8, 8, ['#FFFFFF', '#F4F4F5', '#D4D4D8', '#71717A'], 0, 1);
  for (const [ex, ey] of [[2, -18], [9, -18], [5.5, -22]] as const) R(g, ex + L, cy + ey, 2.5, 2.5, INK);
  R(g, 3 + L, cy - 11, 7, 2, INK);
  // (the shorts: down past the knee, the drawstring)
  shape(g, [[-30, -72 + y], [30, -70 + y], [34, -42 + y], [8, -38 + y], [2, -50 + y], [-6, -38 + y], [-34, -42 + y]], SHORTS, 0.6);
  R(g, -2, -70 + y, 2, 10, '#F8FAFC'); R(g, 3, -70 + y, 2, 8, '#F8FAFC');
  R(g, 24, -66 + y, 4, 22, SHORTS[0]);
  // ---- the head: the wide neck, the cinder-block jaw (his dad's), the tiny cranium on the front of it
  const hx = 18 + L * 1.3, hy = -150 + y;
  ball(g, hx - 6, hy + 18, 30, 22, HIDE, 0);
  // (the headset round the neck)
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.ellipse(hx - 8, hy + 30, 26, 8, 0, 0, Math.PI); g.stroke();
  g.strokeStyle = HEADSET[1]; g.lineWidth = 3; g.stroke();
  ball(g, hx + 16, hy + 30, 7, 8, HEADSET, 0, 1.2); R(g, hx + 13, hy + 28, 6, 2, '#22D3EE');
  // the jaw: the block, jutting, the under-bite's pegs up over the lip
  g.save();
  g.beginPath(); g.moveTo(hx - 10, hy + 2); g.lineTo(hx + 34, hy + 4); g.lineTo(hx + 38, hy + 24); g.lineTo(hx + 30, hy + 34); g.lineTo(hx - 6, hy + 34); g.closePath();
  g.fillStyle = HIDE[1]; g.fill(); g.clip();
  R(g, hx + 10, hy + 18, 40, 20, HIDE[2]); R(g, hx - 10, hy + 28, 50, 8, HIDE[3]);
  g.fillStyle = dither(g, HIDE[2]); g.fillRect(hx, hy + 14, 40, 6);
  R(g, hx - 8, hy + 3, 24, 3, HIDE[0]);
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 1.8; g.beginPath(); g.moveTo(hx - 10, hy + 2); g.lineTo(hx + 34, hy + 4); g.lineTo(hx + 38, hy + 24); g.lineTo(hx + 30, hy + 34); g.lineTo(hx - 6, hy + 34); g.closePath(); g.stroke();
  // (the mouth's slot: open when he's talking or screaming; mom's lipstick smeared round it)
  const open = !!o.mouth || o.pose === 'stomp' || o.pose === 'hurt' || o.pose === 'stagger' || o.pose === 'crouch' || o.pose === 'stun';
  R(g, hx + 4, hy + 15, 34, open ? 9 : 3, INK);
  if (open) R(g, hx + 6, hy + 17, 30, 6, ALIEN.mouth);
  R(g, hx + 2, hy + 13, 36, 2, '#F43F5E'); R(g, hx + 30, hy + 11, 6, 2, '#F43F5E');
  // (the pegs: up over the top lip, yellow, browning, one gone)
  for (let k = 0; k < 6; k++) if (k !== 3) { R(g, hx + 6 + k * 5, hy + 9, 4, 7, INK); R(g, hx + 7 + k * 5, hy + 10, 2, 5, ALIEN.teeth[3 + (k % 2)]); R(g, hx + 7 + k * 5, hy + 14, 2, 1, ALIEN.teeth[1]); }
  // (the cranium: tiny, perched on the front; mom's curlers in the crest off the back of it)
  ball(g, hx + 6, hy - 8, 14, 11, HIDE, 0, 1.6);
  blob(g, () => { g.moveTo(hx - 6, hy - 14); g.quadraticCurveTo(hx - 26, hy - 26, hx - 32, hy - 6); g.quadraticCurveTo(hx - 20, hy - 12, hx - 4, hy - 4); g.closePath(); }, '#3A2A20');
  for (const [cx2, cy2] of [[-14, -18], [-22, -15], [-28, -9]] as const) ball(g, hx + cx2, hy + cy2, 3.6, 3.6, CURL, 0, 1);
  // (mom's wart, its hair)
  ball(g, hx + 28, hy + 6, 2.6, 2.4, ['#8A9A50', '#6A7A3A', '#4A5A2A', '#2A3214'], 0, 0.8); R(g, hx + 28, hy + 1, 1, 4, INK);
  // the eyes: two of his dad's (beady, yellow, red-rimmed: not quite level), and mom's big lashed one up on top,
  // looking off somewhere else
  for (const [ex, ey, er] of [[hx + 10, hy - 8, 3.4], [hx + 18, hy - 5, 2.6]] as const) {
    ball(g, ex, ey, er + 1, er + 1, ['#B8341E', '#7A1A10', '#5A1008', '#2A0604'], 0, 0.8);
    ball(g, ex, ey, er, er, [ALIEN.glint, ALIEN.sclera, ALIEN.scleraShade, '#6A5A18'], 0, 0.6);
    R(g, ex + 0.5, ey - 0.5, 1.4, 1.4, INK);
  }
  ball(g, hx + 2, hy - 20, 7, 6, ['#FFFFFF', '#F4F2EE', '#D8D2C8', '#8A8278'], 0, 1.2);
  R(g, hx - 2, hy - 22, 3, 3, '#7C3AED'); R(g, hx - 1, hy - 21, 1, 1, INK);
  g.strokeStyle = INK; g.lineWidth = 1.2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(hx - 4 + k * 3, hy - 25); g.lineTo(hx - 6 + k * 3.4, hy - 30); g.stroke(); }
  R(g, hx - 5, hy - 26, 14, 1.4, '#1E1B4B');
  // (the veins up the neck, over the cranium)
  g.strokeStyle = ALIEN.vein; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(hx - 22, hy + 30); g.lineTo(hx - 16, hy + 18); g.lineTo(hx - 20, hy + 8); g.moveTo(hx + 12, hy - 16); g.lineTo(hx + 4, hy - 12); g.stroke();
  // ---- the near leg, the chest arm (little, out through the hole in the shirt, never still), the long gun arm
  leg(hip(1), r.footN, HIDE, false);
  arm([8 + L, cy - 2], r.hC, HIDE, 6, 12, 12, false);
  arm(sh(1), r.hN, HIDE, 14, 34, 34, true);
  // (the slime on him: a wet line down the jaw, glints)
  R(g, hx + 30, hy + 34, 2, 6, ALIEN.slime); R(g, hx + 30, hy + 40, 2, 2, ALIEN.slimeLight);
  R(g, hx - 2, hy + 1, 2, 2, ALIEN.slimeLight); R(g, L - 14, cy - 34, 3, 2, ALIEN.slimeLight);
};
const blob = (g: Ctx, path: () => void, col: string) => { g.beginPath(); path(); g.fillStyle = col; g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); };

/** Where the arm that's up to fire ends (for the bolt and the palm's glow), from his feet, facing right. */
export const kidPalm = (arm: 0 | 1 | 2, crouch = 0): [number, number] => {
  const r = rig({ pose: 'aim', q: 0, arm });
  const h = arm === 0 ? r.hN : arm === 1 ? r.hF : r.hC;
  return [h[0] + (arm === 0 ? 12 : 4), h[1] + crouch];
};
/** The kid's height (his box) and how far his head is up. */
export const KID_W = 64, KID_H = 150;

/** Drawn (stamped by pose, frame, arm): the palm's glow and the drool live over it. Feet at (0, 0), facing right. */
export const drawKid = (c: Ctx, o: KidOpts, f: number, glow = 0) => {
  const moving = o.pose === 'walk' || o.pose === 'flail' || o.pose === 'idle' || o.pose === 'talk' || o.pose === 'stun';
  const q = moving ? Math.floor(f / (o.pose === 'flail' ? 2 : 5)) % 8 : 0;
  const mouth = o.pose === 'talk' ? Math.floor(f / 6) % 2 === 0 : !!o.mouth;
  stamp(c, `wp-kid-${o.pose}-${q}-${o.arm ?? 0}-${mouth ? 1 : 0}`, -80, -210, 180, 216, g => paintKid(g, { ...o, q, mouth }));
  if (glow > 0 && (o.pose === 'aim' || o.pose === 'fire')) {
    const [px, py] = kidPalm(o.arm ?? 0);
    c.globalAlpha = Math.min(1, glow) * (0.5 + 0.3 * Math.sin(f * 0.9));
    c.fillStyle = '#7CFF3A'; c.beginPath(); c.arc(px, py, 10 + glow * 6, 0, Math.PI * 2); c.fill();
    c.globalAlpha = 1; c.fillStyle = '#ECFCCB'; c.fillRect(px - 3, py - 3, 6, 6);
  }
  // (drool, a string of it, swinging)
  const dx = 44 + Math.sin(f * 0.08) * 2, dl = 6 + ((f >> 2) % 10);
  c.fillStyle = ALIEN.slime; c.fillRect(Math.round(dx), -112 + (o.pose === 'crouch' ? 24 : 0), 2, dl);
};

/** Dead, belly-down and stretched out (the slide's mouth, and the sled he rides down): feet at the left, head off to
 *  the right, the face in the water. (x, y) is the middle of his underside. Painted once. */
export const paintKidCorpse = (g: Ctx) => {
  // (the far arm trailing back, the legs back, the slides gone)
  limb(g, -40, -14, -86, -6, 14, [HIDE[1], HIDE[2], HIDE[3], '#0B140C']);
  limb(g, -86, -6, -112, -4, 11, SOCK);
  limb(g, -44, -20, -92, -18, 14, HIDE);
  limb(g, -92, -18, -118, -14, 11, SOCK);
  // (the body flat, the shorts, the shirt rucked up, the gut squashed out the sides)
  ball(g, 0, -16, 52, 18, HIDE, 0);
  ball(g, 4, -4, 40, 8, BELLY, 0, 1);
  shape(g, [[-48, -30], [-10, -32], [-6, -6], [-50, -6]], SHORTS, 0.5);
  shape(g, [[-8, -34], [38, -32], [40, -10], [-6, -8]], SHIRT, 0.5);
  // (the head forward, face down: the cranium, mom's curlers, the jaw in the water; the long arm out ahead, limp)
  ball(g, 54, -18, 22, 16, HIDE, 0.2);
  ball(g, 70, -26, 11, 9, HIDE, 0, 1.4);
  for (const [cx, cy] of [[60, -34], [54, -30]] as const) ball(g, cx, cy, 3.4, 3.4, CURL, 0, 1);
  limb(g, 30, -22, 90, -8, 14, HIDE);
  ball(g, 96, -8, 9, 8, HIDE, 0, 1.2);
  // (the little chest arm, out from under him, twitching: it's the last thing to go)
  limb(g, 10, -4, 26, 6, 6, HIDE);
  // (his dad's eyes, shut: two lines; mom's, open, staring off)
  R(g, 74, -28, 4, 1.4, INK); R(g, 80, -26, 3, 1.4, INK);
  ball(g, 66, -36, 5, 4, ['#FFFFFF', '#F4F2EE', '#D8D2C8', '#8A8278'], 0, 1); R(g, 66, -37, 2, 2, '#7C3AED');
};
export const drawKidCorpse = (c: Ctx) => stamp(c, 'wp-kid-corpse', -130, -60, 240, 74, paintKidCorpse);
