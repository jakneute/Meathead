// The staff room's regulars: Happy Land's bored employees on their break (forever), and the vermin that live in
// there with them. Practice targets only (pen/index.ts moves them by hand and they never fight back): each kind just
// stands there doing whatever it does instead of its job, and shuffles off when he comes at it.
//
//   mascot    the bear suit on, the head off and under the arm, sweat-matted hair, smoking
//   princess  a performer in the gown, the wig on crooked, sweat stains, vaping
//   churro    the snack cart: a striped shirt, a paper hat, a greasy apron, eating the stock
//   rideop    a ride operator: a hi-vis vest over the polo, shorts, a visor, on the phone
//   janitor   coveralls, rubber gloves, leaning on the mop
//   guard     security: the cap, the badge, the belt, on the phone
//   teen      the ticket booth: a maroon vest, a bow tie, headphones round the neck, zits, blowing gum
//   maint     maintenance: a hard hat, a tool belt, a sandwich (or asleep on his feet)
//   painter   the face painter: a splattered smock, a beret, half her own face a tiger
//   dancer    a parade dancer: sequins, a feather headdress, platforms, an energy drink
//
// Who's in the uniform (man or woman, skin, build, hair, face) is by seed (`variant`, from a pool, so the stamps
// get reused). Drawn on Spooky Land's person drawer (costume.ts: every material in steps, dithered, inked; each
// frame painted once into a stamp). Plus the rats (the town's rat, drawn running when moved by hand) and the pigeons
// (gray, a green-and-purple neck, an orange eye, one foot a stump).

import type { Enemy } from '../../m1/types';
import { stamp } from '../../m1/game/render/stamp';
import { registerM2Kind } from '../kinds';
import {
  type Pose, type Body, type Frame, type Shoe, INK, dk, lt, mix, part, partTop, flat, px, ball, dither, limb,
  bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers, glasses, hairTop, hairBack, frameOf, putFrame, moodOf, reaction,
} from '../spooky/costume';
import { drawRatArt } from '../spooky/critters';

type Ctx = CanvasRenderingContext2D;

export type Job = 'mascot' | 'princess' | 'churro' | 'rideop' | 'janitor' | 'guard' | 'teen' | 'maint' | 'painter' | 'dancer';
type Doing = 'smoke' | 'vape' | 'phone' | 'eat' | 'mop' | 'drink' | 'nap' | 'brush' | 'gum';

/** Moved by hand this frame (pen/index.ts): drawn walking (or a rat running). */
export const penMoving = new WeakSet<Enemy>();
const hash = (n: number) => { let h = Math.floor(Math.abs(n)) * 2654435761; h ^= h >>> 13; return (h >>> 0) % 997; };
/** Who's in there: from `variant` alone (a pool of them, so the stamps come round again). */
export const penSeed = (e: Enemy) => Math.abs(e.variant ?? 0) * 37 + 11;
const womanOf = (seed: number) => hash(seed * 3 + 1) % 2 === 0;

const BOX: [number, number, number, number] = [-64, -120, 136, 126];
const SWEAT = '#BFE3F2';

// ---------------------------------------------------------------------------------------------------------------
// Bits

const sweat = (g: Ctx, B: Body) => {
  for (const [dx, dy] of [[-6, -6], [8, -4], [-8, 2]]) { px(g, B.hx + dx, B.hy + dy, 1.5, 2.5, SWEAT); px(g, B.hx + dx, B.hy + dy + 2, 1.5, 1, '#FFFFFF'); }
};
/** A dark patch of sweat (under the arm, down the back). */
const pit = (g: Ctx, x: number, y: number, col: string) => dither(g, x - 3, y - 2, 6, 6, dk(col, 0.35));
const nameTag = (g: Ctx, x: number, y: number) => { part(g, () => g.rect(x, y, 8, 4), '#F8FAFC', x, y, 8, 4, 0.6); px(g, x + 1, y + 2, 6, 1, '#3A3A48'); };

/** The bear head off his shoulders: tucked under the arm, a big dumb grin, the neck hole showing. */
const bearHead = (g: Ctx, x: number, y: number, fur: string) => {
  for (const s of [-1, 1]) { ball(g, x + s * 9, y - 10, 4.2, fur, 1); ball(g, x + s * 9, y - 10, 2, lt(fur, 0.35), 0.5); }
  part(g, () => g.ellipse(x, y, 13, 12, 0, 0, Math.PI * 2), fur, x - 13, y - 12, 26, 24);
  part(g, () => g.ellipse(x + 4, y + 4, 7, 5, 0, 0, Math.PI * 2), '#E8D2A8', x - 3, y - 1, 14, 10, 1);
  ball(g, x + 7, y + 1, 1.8, INK, 0.5);
  for (const ex of [x - 2, x + 7]) { ball(g, ex, y - 4, 3, '#FFFFFF', 0.8); px(g, ex - 1, y - 4, 2, 2, INK); }
  g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.arc(x + 4, y + 4, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  // (the neck hole, turned out toward us: dark, a ring of grime round it)
  part(g, () => g.ellipse(x - 6, y + 8, 6, 3.2, -0.3, 0, Math.PI * 2), '#1A1418', x - 12, y + 5, 12, 6, 1);
  dither(g, x - 11, y + 6, 10, 2, '#4A3A20');
};

// ---------------------------------------------------------------------------------------------------------------
// The jobs

interface Spec {
  doing: (seed: number) => Doing;
  top: string; sleeve?: string; sleeveLen: number; pants: string; shoe: Shoe; shoeCol: string;
  bareBelow?: boolean; hand?: string; legCol?: (B: Body) => string;
  /** A gown down to the floor instead of legs. */
  skirt?: string;
  /** On the torso, clipped to it. */
  onTorso?: (g: Ctx, B: Body, seed: number) => void;
  /** Over the torso (a vest, an apron, a badge, a belt). */
  overTorso?: (g: Ctx, B: Body, seed: number) => void;
  /** On the head, after the hair. */
  hat?: (g: Ctx, B: Body, seed: number) => void;
  /** Their own hair a color it isn't (a wig). */
  hair?: string;
  sweaty?: boolean;
}

const SPECS: Record<Job, Spec> = {
  mascot: {
    doing: () => 'smoke', top: '#7C4DBA', sleeveLen: 1, pants: '#7C4DBA', shoe: 'paw', shoeCol: '#6A3CA6', hand: '#F1EFEA', sweaty: true,
    onTorso: (g, B) => {
      // (the belly patch, and the fur matted in tufts)
      part(g, () => g.ellipse(B.lean + 2, (B.shY + B.hipY) / 2 + 5, B.w * 0.32, (B.hipY - B.shY) * 0.34, 0, 0, Math.PI * 2), '#E8D2A8', B.lean + 2 - B.w * 0.32, B.shY + 8, B.w * 0.64, (B.hipY - B.shY) * 0.7, 0.8);
      for (let k = 0; k < 10; k++) px(g, -B.w / 2 + 2 + (k * 7) % (B.w - 4), B.shY + 3 + ((k * 5) % 20), 1, 2, k % 2 ? '#9A70D8' : '#5A3090');
      pit(g, B.w / 2 - 4, B.shY + 8, '#7C4DBA');
    },
  },
  princess: {
    doing: () => 'vape', top: '#7CC4F0', sleeveLen: 0.25, pants: '#7CC4F0', shoe: 'pointy', shoeCol: '#E0C060', skirt: '#7CC4F0', hair: '#F2D04A', sweaty: true,
    onTorso: (g, B) => {
      px(g, -B.w / 2, B.hipY - 3, B.w + 4, 3, '#F2D04A');
      for (let k = 0; k < 4; k++) px(g, B.lean - 1 + (k % 2) * 3, B.shY + 4 + k * 4, 1, 1, '#FFFFFF');
      pit(g, B.w / 2 - 3, B.shY + 7, '#7CC4F0'); pit(g, -B.w / 2 + 4, B.shY + 7, '#7CC4F0');
    },
    overTorso: (g, B) => { for (const s of [-1, 1]) ball(g, s * (B.w / 2 - 2) + B.lean, B.shY + 3, 4.5, lt('#7CC4F0', 0.15), 1); },
    hat: (g, B) => {
      // (the tiara, crooked like the wig)
      flat(g, () => { const x = B.hx - 6, y = B.hy - 10; g.moveTo(x, y + 2); g.lineTo(x + 2, y - 3); g.lineTo(x + 4, y); g.lineTo(x + 6, y - 5); g.lineTo(x + 8, y); g.lineTo(x + 10, y - 3); g.lineTo(x + 12, y + 1); g.closePath(); }, '#E8E4F0', 0.8);
      ball(g, B.hx, B.hy - 13, 1.2, '#E0407A', 0.4);
    },
  },
  churro: {
    doing: () => 'eat', top: '#F4F0E6', sleeveLen: 0.45, pants: '#2A2A30', shoe: 'sneaker', shoeCol: '#3A3A42',
    onTorso: (g, B) => { for (let x = -B.w / 2 - 2; x < B.w / 2 + 6; x += 5) px(g, x, B.shY, 2, B.hipY - B.shY + 4, '#D2342A'); },
    overTorso: (g, B) => {
      const y = B.shY + 12;
      part(g, () => g.roundRect(-B.w / 2 + 1 + B.lean, y, B.w - 2, B.hipY - y + 12, 2), '#F1EFEA', -B.w / 2 + 1, y, B.w - 2, B.hipY - y + 12, 1);
      for (const [dx, dy, r] of [[3, 6, 3], [-4, 13, 2.5], [5, 17, 2]]) { px(g, B.lean + dx - r, y + dy - r / 2, r * 2, r, '#C8A050'); px(g, B.lean + dx - r + 1, y + dy - r / 2, r, 1, '#E0C080'); }
      nameTag(g, B.w / 2 - 10, B.shY + 4);
    },
    hat: (g, B) => {
      part(g, () => { g.moveTo(B.hx - 9, B.hy - 6); g.lineTo(B.hx - 6, B.hy - 15); g.lineTo(B.hx + 8, B.hy - 15); g.lineTo(B.hx + 10, B.hy - 6); g.closePath(); }, '#F8F6F0', B.hx - 9, B.hy - 15, 19, 9, 1);
      px(g, B.hx - 8, B.hy - 9, 17, 2, '#D2342A');
    },
  },
  rideop: {
    doing: () => 'phone', top: '#24427A', sleeveLen: 0.45, pants: '#B8A47A', shoe: 'sneaker', shoeCol: '#E8E8E0', bareBelow: true,
    overTorso: (g, B) => {
      // (the hi-vis vest: two panels, the reflective bands)
      for (const s of [-1, 1]) {
        const x0 = s < 0 ? -B.w / 2 - 1 + B.lean : B.lean + 3, w = B.w / 2 - 2;
        part(g, () => g.rect(x0, B.shY + 1, w, B.hipY - B.shY), '#F97316', x0, B.shY + 1, w, B.hipY - B.shY, 1);
        for (const yy of [B.shY + 10, B.hipY - 8]) { px(g, x0 + 1, yy, w - 2, 2, '#D8DDE2'); px(g, x0 + 1, yy, w - 2, 1, '#FFFFFF'); }
      }
      px(g, B.lean, B.shY + 2, 1, 6, '#F8FAFC');
      ball(g, B.lean + 1, B.shY + 9, 1.5, '#FDE047', 0.5);
    },
    hat: (g, B) => {
      px(g, B.hx - 9, B.hy - 7, 19, 3, INK); px(g, B.hx - 8, B.hy - 6, 17, 2, '#F97316');
      part(g, () => g.ellipse(B.hx + 10, B.hy - 5, 8, 2.2, 0.08, 0, Math.PI * 2), '#F97316', B.hx + 2, B.hy - 7, 16, 5, 1);
    },
  },
  janitor: {
    doing: () => 'mop', top: '#5E6B5A', sleeveLen: 1, pants: '#5E6B5A', shoe: 'boot', shoeCol: '#2A2420', hand: '#E8C020',
    onTorso: (g, B) => {
      px(g, B.lean, B.shY + 2, 1, B.hipY - B.shY, dk('#5E6B5A', 0.3));
      for (const [x, y, r] of [[-4, 14, 3], [4, 22, 2.5], [-2, 26, 2]]) dither(g, x - r, B.shY + y - r / 2, r * 2, r, '#3A3020');
    },
    overTorso: (g, B) => {
      part(g, () => g.ellipse(B.w / 2 - 6, B.shY + 8, 4.5, 3, 0, 0, Math.PI * 2), '#F1EFEA', B.w / 2 - 10.5, B.shY + 5, 9, 6, 0.6);
      px(g, B.w / 2 - 9, B.shY + 8, 6, 1, '#B91C1C');
      // (a ring of keys)
      ball(g, -B.hipW / 2 + 1, B.hipY + 2, 2.5, '#A3ABB6', 0.6); px(g, -B.hipW / 2, B.hipY + 4, 2, 4, '#C8CCD2');
    },
    hat: (g, B, seed) => {
      if (seed % 2) return;
      // (a cap on backwards)
      partTop(g, () => g.ellipse(B.hx, B.hy - 5, 10, 7, 0, Math.PI, 0), '#3A4A6A', B.hx - 10, B.hy - 12, 20, 7, 1);
      part(g, () => g.ellipse(B.hx - 10, B.hy - 5, 6, 2, -0.1, 0, Math.PI * 2), '#3A4A6A', B.hx - 16, B.hy - 7, 12, 4, 1);
    },
  },
  guard: {
    doing: () => 'phone', top: '#2B3A5C', sleeveLen: 0.45, pants: '#1E2230', shoe: 'boot', shoeCol: '#141418',
    onTorso: (g, B) => { pit(g, B.w / 2 - 4, B.shY + 8, '#2B3A5C'); px(g, B.lean + 1, B.shY + 3, 3, 14, '#141822'); },
    overTorso: (g, B) => {
      flat(g, () => { const x = -B.w / 2 + 6 + B.lean, y = B.shY + 8; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 1.6 : 3.4; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }, '#D8DDE2', 0.6);
      px(g, -B.hipW / 2 + 1, B.hipY - 2, B.hipW - 2, 3, INK); px(g, -1, B.hipY - 2, 3, 3, '#C8CCD2');
      part(g, () => g.roundRect(-B.hipW / 2 - 3, B.hipY - 4, 5, 10, 1), '#26262C', -B.hipW / 2 - 3, B.hipY - 4, 5, 10, 0.8);
      px(g, -B.hipW / 2 - 2, B.hipY - 8, 1, 4, '#26262C');
      part(g, () => g.roundRect(B.hipW / 2 - 4, B.hipY - 1, 4, 11, 1), '#1A1A1E', B.hipW / 2 - 4, B.hipY - 1, 4, 11, 0.8);
    },
    hat: (g, B) => {
      partTop(g, () => g.roundRect(B.hx - 10, B.hy - 15, 21, 9, [4, 4, 1, 1]), '#1E2A48', B.hx - 10, B.hy - 15, 21, 9, 1);
      part(g, () => g.ellipse(B.hx + 8, B.hy - 6, 8, 2.2, 0.1, 0, Math.PI * 2), '#101014', B.hx, B.hy - 8, 16, 5, 1);
      ball(g, B.hx + 1, B.hy - 11, 2, '#E0B040', 0.5);
    },
  },
  teen: {
    doing: s => (s % 3 === 0 ? 'gum' : 'phone'), top: '#EDEDE6', sleeveLen: 1, pants: '#1E1E24', shoe: 'sneaker', shoeCol: '#3A3A48',
    overTorso: (g, B) => {
      for (const s of [-1, 1]) {
        const x0 = s < 0 ? -B.w / 2 + B.lean : B.lean + 3, w = B.w / 2 - 2;
        part(g, () => g.rect(x0, B.shY + 2, w, B.hipY - B.shY + 1), '#7A1E3A', x0, B.shY + 2, w, B.hipY - B.shY + 1, 1);
      }
      flat(g, () => { const x = B.lean + 1, y = B.shY + 2; g.moveTo(x - 4, y - 2); g.lineTo(x, y); g.lineTo(x - 4, y + 2); g.closePath(); g.moveTo(x + 4, y - 2); g.lineTo(x, y); g.lineTo(x + 4, y + 2); g.closePath(); }, '#141418', 0.5);
      nameTag(g, B.w / 2 - 10, B.shY + 8);
      // (the headphones round the neck)
      g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.ellipse(B.hx, B.shY - 1, 8, 3.5, 0, 0, Math.PI); g.stroke();
      g.strokeStyle = '#3A3A48'; g.lineWidth = 1.2; g.stroke();
      for (const s of [-1, 1]) ball(g, B.hx + s * 8, B.shY - 1, 2.8, '#E0407A', 0.8);
    },
    hat: (g, B) => { for (const [dx, dy] of [[4, 2], [-3, 4], [7, -3]]) { px(g, B.hx + dx, B.hy + dy, 1.5, 1.5, '#D84A4A'); px(g, B.hx + dx, B.hy + dy, 1, 1, '#F4C0A0'); } },
  },
  maint: {
    doing: s => (s % 2 ? 'nap' : 'eat'), top: '#3E6E9A', sleeveLen: 0.45, pants: '#34507A', shoe: 'boot', shoeCol: '#5A3A20',
    onTorso: (g, B) => { part(g, () => g.rect(-B.w / 2 + 4 + B.lean, B.shY + 5, 6, 6), '#3E6E9A', -B.w / 2 + 4, B.shY + 5, 6, 6, 0.6); px(g, -B.w / 2 + 6 + B.lean, B.shY + 3, 1, 4, '#E8C020'); pit(g, B.w / 2 - 4, B.shY + 8, '#3E6E9A'); },
    overTorso: (g, B) => {
      // (the tool belt: a hammer, a wrench, the tape)
      px(g, -B.hipW / 2 - 1, B.hipY - 3, B.hipW + 2, 4, INK); px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 2, '#8A5A2A');
      part(g, () => g.roundRect(-B.hipW / 2 - 3, B.hipY, 7, 8, 1), '#7A4A20', -B.hipW / 2 - 3, B.hipY, 7, 8, 0.8);
      limb(g, B.hipW / 2 - 2, B.hipY, B.hipW / 2, B.hipY + 12, 1.6, '#8A929C'); px(g, B.hipW / 2 - 4, B.hipY - 1, 6, 3, '#6B737E');
      ball(g, -1, B.hipY + 3, 2.6, '#E8C020', 0.6);
    },
    hat: (g, B) => {
      partTop(g, () => g.ellipse(B.hx, B.hy - 5, 11, 9, 0, Math.PI, 0), '#F2C21A', B.hx - 11, B.hy - 14, 22, 9, 1);
      part(g, () => g.roundRect(B.hx - 13, B.hy - 6, 26, 3, 1), '#D8A810', B.hx - 13, B.hy - 6, 26, 3, 1);
      px(g, B.hx - 1, B.hy - 13, 2, 7, lt('#F2C21A', 0.3));
    },
  },
  painter: {
    doing: () => 'brush', top: '#E8DFC8', sleeveLen: 0.7, pants: '#4A4A5A', shoe: 'shoe', shoeCol: '#3A2A20',
    onTorso: (g, B, seed) => {
      const cols = ['#E0407A', '#3E9AE0', '#F2C21A', '#46B86A', '#F97316'];
      for (let k = 0; k < 7; k++) { const x = -B.w / 2 + 2 + hash(seed + k) % (B.w - 2), y = B.shY + 3 + hash(seed * 2 + k) % (B.hipY - B.shY); px(g, x, y, 3, 2, cols[k % cols.length]); px(g, x + 1, y + 2, 1, 2, cols[k % cols.length]); }
    },
    hat: (g, B, seed) => {
      // (her own face painted half a tiger: the stripes over the cheek)
      for (let k = 0; k < 3; k++) px(g, B.hx - 6 + k * 2, B.hy + 1 + k, 4, 1, '#F97316');
      px(g, B.hx - 7, B.hy + 4, 3, 1, INK); px(g, B.hx - 5, B.hy - 2, 3, 1, INK);
      part(g, () => g.ellipse(B.hx - 1 + (seed % 2 ? 2 : -1), B.hy - 9, 10, 4, -0.15, 0, Math.PI * 2), '#B91C1C', B.hx - 11, B.hy - 13, 20, 8, 1);
      px(g, B.hx - 1, B.hy - 15, 2, 3, INK);
    },
  },
  dancer: {
    doing: s => (s % 3 === 1 ? 'nap' : 'drink'), top: '#C0267A', sleeveLen: 0, pants: '#C0267A', shoe: 'platform', shoeCol: '#C8CCD8',
    legCol: B => mix(B.L.skin, '#2A1A22', 0.3),
    onTorso: (g, B, seed) => { for (let k = 0; k < 14; k++) px(g, -B.w / 2 + hash(seed + k * 3) % (B.w + 2), B.shY + hash(seed + k * 7) % (B.hipY - B.shY + 2), 1, 1, k % 3 ? '#FFD0F0' : '#FFFFFF'); },
    hat: (g, B) => {
      // (the feather headdress: plumes up off a sequined band)
      for (const [dx, h, col] of [[-6, 16, '#E0407A'], [0, 22, '#F2C21A'], [6, 16, '#8B5CF6']] as const) {
        part(g, () => g.ellipse(B.hx + dx, B.hy - 10 - h / 2, 3.2, h / 2, dx * 0.03, 0, Math.PI * 2), col, B.hx + dx - 3.2, B.hy - 10 - h, 6.4, h, 1);
        px(g, B.hx + dx, B.hy - 10 - h + 2, 1, h - 4, lt(col, 0.4));
      }
      part(g, () => g.roundRect(B.hx - 10, B.hy - 11, 20, 4, 1), '#E8E4F0', B.hx - 10, B.hy - 11, 20, 4, 1);
    },
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Painting one

const paint = (g: Ctx, F: Frame, job: Job, doing: Doing) => {
  const S = SPECS[job];
  const B: Body = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  const fl = flailHands(B, F.fr);
  const sh = B.shY;
  const sleeve = S.sleeve ?? S.top, hand = S.hand ?? L.skin;
  // The legs (or the gown)
  if (S.skirt) {
    const sw = F.pose === 'walk' ? [0, 2, 0, -2, 0, 2][F.fr] : 0;
    for (const s of [0, 1] as const) { const fx = (s ? 4 : -6) + B.feet[s] * 0.6; part(g, () => g.roundRect(fx - 2, -5 - B.lift[s], 10, 5, [2, 3, 1, 1]), s ? S.shoeCol : dk(S.shoeCol, 0.12), fx - 2, -5, 10, 5, 1); }
    const hem = 26, top = B.hipY - 4;
    part(g, () => { g.moveTo(-B.hipW / 2, top); g.lineTo(B.hipW / 2, top); g.quadraticCurveTo(hem - 4 + sw, -18, hem + sw, -4); for (let k = 0; k <= 6; k++) g.lineTo(hem + sw - k * (hem * 2) / 6, -4 + (k % 2 ? 2 : 0)); g.quadraticCurveTo(-hem + 4 + sw, -18, -B.hipW / 2, top); g.closePath(); }, S.skirt, -hem - 2, top, hem * 2 + 4, -top);
    for (let k = 0; k < 4; k++) px(g, -14 + k * 9 + sw, -16 + (k % 2) * 4, 1, 10, lt(S.skirt, 0.3));
    // (the hem, filthy from the floor)
    dither(g, -hem + sw, -8, hem * 2, 3, '#5A4A30');
  } else {
    legs(g, B, { col: S.legCol ? S.legCol(B) : S.pants, shoe: S.shoe, shoeCol: S.shoeCol, bareBelow: S.bareBelow, detail: job === 'dancer' ? (gg, _h, knee, foot) => { for (let k = 0.2; k < 1; k += 0.2) px(gg, knee[0] + (foot[0] - knee[0]) * k - 2, knee[1] + (foot[1] - knee[1]) * k, 4, 1, '#1A0B10'); } : undefined });
    if (job === 'dancer') px(g, -B.hipW / 2, B.hipY - 1, B.hipW, 4, S.top);
  }
  // Where the hands go
  let far: [number, number] = [-B.w / 2 - 3, sh + 22], near: [number, number] = [B.w / 2 + 3, sh + 22];
  const sip = doing === 'drink' && F.v.endsWith('s');
  if (fl) { far = fl[0]; near = fl[1]; }
  else if (doing === 'smoke' || doing === 'vape') { near = [B.hx + 7, B.hy + 7]; }
  else if (doing === 'phone' || doing === 'gum') { near = [B.w / 2 + 2, sh + 12]; far = doing === 'phone' ? [B.w / 2, sh + 15] : far; }
  else if (doing === 'eat') { near = [B.hx + 8, B.hy + 7]; far = [B.w / 2 - 2, sh + 18]; }
  else if (doing === 'mop') { far = [B.w / 2 + 6, sh + 4]; near = [B.w / 2 + 10, sh + 20]; }
  else if (doing === 'drink') { near = sip ? [B.hx + 7, B.hy + 6] : [B.w / 2 + 4, sh + 14]; }
  else if (doing === 'brush') { near = [B.w / 2 + 6, sh + 6]; far = [-B.w / 2 + 2, sh + 20]; }
  else if (doing === 'nap') { far = [-B.w / 2 - 1, -27]; near = [B.w / 2 + 2, -28]; }
  if (job === 'mascot' && !fl) far = [-B.w / 2 + 2, B.hipY - 10];
  // (the mop's handle, behind the near arm)
  if (doing === 'mop' && !fl) {
    g.save(); g.translate(B.w / 2 + 8, sh + 2); g.rotate(0.12);
    part(g, () => g.rect(-1.5, -8, 3, 62), '#A0682E', -1.5, -8, 3, 62, 1); px(g, -1, -8, 1, 62, '#C8925A');
    g.restore();
    // (the mop head on the floor: gray strings gone brown)
    part(g, () => g.ellipse(B.w / 2 + 16, -4, 13, 5, 0, 0, Math.PI * 2), '#8A8676', B.w / 2 + 3, -9, 26, 10, 1);
    for (let k = 0; k < 8; k++) px(g, B.w / 2 + 5 + k * 3, -6 + (k % 2), 1, 5, k % 3 ? '#5A5446' : '#B0AA98');
  }
  if (job !== 'mascot' || fl) arm(g, B, -1, far[0], far[1], { sleeve: dk(sleeve, 0.12), hand, len: S.sleeveLen });
  // The torso
  const tp = torso(g, B, S.top);
  g.save(); g.beginPath(); tp(); g.clip();
  px(g, -B.w / 2 - 2, sh, 3, B.hipY - sh + 4, lt(S.top, 0.22)); px(g, B.w / 2 - 3, sh, 6, B.hipY - sh + 4, dk(S.top, 0.28)); dither(g, B.w / 2 - 5, sh, 2, B.hipY - sh + 4, dk(S.top, 0.28));
  S.onTorso?.(g, B, F.seed);
  g.restore();
  S.overTorso?.(g, B, F.seed);
  // (the mascot: the bear head under his far arm, the arm over it)
  if (job === 'mascot' && !fl) { bearHead(g, -B.w / 2 - 2, B.hipY - 6, S.top); arm(g, B, -1, far[0], far[1], { sleeve: dk(sleeve, 0.12), hand, len: 1 }); }
  // The head
  const hair = S.hair ?? L.hair;
  if (S.hair) { g.save(); g.translate(2, 0); hairBack(g, { ...B, L: { ...L, long: true, bald: false, woman: true } }, hair, 20); g.restore(); }
  else hairBack(g, B, hair);
  headShape(g, B, L.skin);
  const napping = doing === 'nap' && !B.held;
  const eyes = napping ? 'closed' : doing === 'phone' || doing === 'gum' ? 'droopy' : 'tired';
  const mouth = napping ? 'o' : doing === 'smoke' || doing === 'vape' ? 'smirk' : doing === 'eat' && F.fr % 2 ? 'o' : 'flat';
  faceOn(g, B, { skin: L.skin, eyes, mouth, md: F.md, blink: F.blink && !napping, look: doing === 'phone' ? 0.9 : 0.4 });
  if (napping && F.md === 'ok') { px(g, B.hx + 5, B.hy + 8, 1, 4, SWEAT); }
  whiskers(g, B);
  if (S.hair) { g.save(); g.translate(2, -1); hairTop(g, { ...B, L: { ...L, bald: false } }, hair); g.restore(); if (!L.bald) px(g, B.hx - 8, B.hy - 2, 3, 3, L.hair); }
  else if (job === 'mascot') { hairTop(g, B); if (!L.bald) for (let k = 0; k < 4; k++) px(g, B.hx - 6 + k * 4, B.hy - 9 + (k % 2), 2, 4, dk(L.hair, 0.3)); }
  else hairTop(g, B);
  glasses(g, B);
  S.hat?.(g, B, F.seed);
  if (S.sweaty && F.md !== 'dead') sweat(g, B);
  arm(g, B, 1, near[0], near[1], { sleeve, hand, len: S.sleeveLen });
  if (fl) return;
  // What's in their hand
  const [nx, ny] = near;
  if (doing === 'smoke') { px(g, nx + 1, ny - 2, 6, 1.6, '#F8FAFC'); px(g, nx + 6, ny - 2, 1.5, 1.6, '#F97316'); }
  else if (doing === 'vape') { part(g, () => g.roundRect(nx - 1, ny - 3, 9, 3, 1), '#3A3A48', nx - 1, ny - 3, 9, 3, 0.7); px(g, nx + 6, ny - 3, 2, 1, '#60A5FA'); }
  else if (doing === 'phone') { part(g, () => g.roundRect(nx - 3, ny - 9, 6, 10, 1), '#18181B', nx - 3, ny - 9, 6, 10, 0.8); px(g, nx - 2, ny - 8, 4, 7, '#60A5FA'); px(g, nx - 2, ny - 8, 4, 1, '#BFDBFE'); }
  else if (doing === 'gum') { part(g, () => g.roundRect(nx - 3, ny - 9, 6, 10, 1), '#E0407A', nx - 3, ny - 9, 6, 10, 0.8); px(g, nx - 2, ny - 8, 4, 7, '#60A5FA'); }
  else if (doing === 'eat') {
    if (job === 'churro') { g.save(); g.translate(nx, ny); g.rotate(-0.9); part(g, () => g.roundRect(-2, -16, 4, 18, 2), '#C88A3A', -2, -16, 4, 18, 0.9); for (let k = 0; k < 5; k++) px(g, -1, -14 + k * 3, 1, 1, '#F4ECD8'); g.restore(); }
    else { part(g, () => g.roundRect(nx - 5, ny - 4, 11, 6, 2), '#D8B070', nx - 5, ny - 4, 11, 6, 0.9); px(g, nx - 5, ny - 2, 11, 1, '#5AA040'); px(g, nx - 5, ny - 1, 11, 1, '#B4442A'); }
  }
  else if (doing === 'drink') {
    g.save(); g.translate(nx, ny); g.rotate(sip ? -1.2 : 0);
    part(g, () => g.roundRect(-3, -9, 6, 11, 1), '#1E1E24', -3, -9, 6, 11, 0.8); px(g, -2, -6, 4, 4, '#7AE04A'); px(g, -2, -9, 4, 1, '#C8CCD2');
    g.restore();
  }
  else if (doing === 'brush') {
    limb(g, nx, ny, nx + 5, ny - 9, 1.4, '#C8925A'); ball(g, nx + 6, ny - 11, 1.6, '#E0407A', 0.5);
    part(g, () => g.ellipse(far[0] - 2, far[1] - 1, 7, 4, -0.2, 0, Math.PI * 2), '#D8B070', far[0] - 9, far[1] - 5, 14, 8, 0.8);
    for (const [dx, col] of [[-6, '#E0407A'], [-3, '#3E9AE0'], [0, '#F2C21A']] as const) px(g, far[0] + dx, far[1] - 2, 2, 2, col);
  }
};

/** What they're doing right now (walking off, nobody naps). */
const doingNow = (job: Job, seed: number, moving: boolean): Doing => {
  const d = SPECS[job].doing(seed);
  return moving && d === 'nap' ? 'drink' : d;
};

export const drawStaff = (c: Ctx, e: Enemy, f: number, job: Job) => {
  const seed = penSeed(e), woman = womanOf(seed), moving = penMoving.has(e);
  const r = reaction(e);
  const pose: Pose = r?.pose ?? (moving ? 'walk' : 'stand');
  const doing = doingNow(job, seed, moving);
  const sip = doing === 'drink' && !moving && Math.floor((f + seed) / 50) % 3 === 0;
  const chew = doing === 'eat' ? Math.floor((f + seed) / 10) % 2 : 0;
  const F = frameOf(seed, f, pose, r?.md ?? moodOf(e), 0, woman, `${doing}${sip ? 's' : ''}`);
  if (doing === 'eat' && pose === 'stand') F.fr = chew;
  putFrame(c, `pen-${job}`, F, BOX, g => paint(g, F, job, doing));
  if (r || F.md !== 'ok') return;
  // Live: the smoke off the cigarette (a cloud off the vape), the Zs over the napper, the gum bubble
  const B = bodyOf(seed, pose, F.fr, woman);
  if (doing === 'smoke' || doing === 'vape') {
    const big = doing === 'vape';
    for (let k = 0; k < (big ? 5 : 3); k++) {
      const t = (f * 0.4 + k * 12) % 36;
      c.fillStyle = `rgba(226, 232, 240, ${((big ? 0.55 : 0.45) - t / 80).toFixed(3)})`;
      const s = Math.round((big ? 3 : 2) + t / (big ? 5 : 8));
      c.fillRect(Math.round(B.hx + 14 + Math.sin(t * 0.2) * 3 - t / 20), Math.round(B.hy + 4 - t), s, s);
    }
  } else if (doing === 'nap') {
    c.fillStyle = INK;
    for (let k = 0; k < 2; k++) {
      const t = (f * 0.5 + k * 30) % 60, x = Math.round(B.hx + 8 + t / 4), y = Math.round(B.hy - 12 - t / 2), s = t < 30 ? 1 : 2;
      c.fillStyle = `rgba(240, 240, 250, ${(1 - t / 60).toFixed(2)})`;
      c.fillRect(x, y, 4 * s, s); c.fillRect(x + 3 * s - 1, y + s, s, s); c.fillRect(x + s, y + 2 * s, s, s); c.fillRect(x, y + 3 * s, 4 * s, s);
    }
  } else if (doing === 'gum') {
    const t = (f + seed) % 150;
    if (t < 60) { const r2 = Math.min(6, 1 + t / 9); c.fillStyle = INK; c.beginPath(); c.arc(B.hx + 6 + r2 * 0.7, B.hy + 7, r2 + 0.8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#F49AC8'; c.beginPath(); c.arc(B.hx + 6 + r2 * 0.7, B.hy + 7, r2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#FFFFFF'; c.fillRect(Math.round(B.hx + 5 + r2 * 0.4), Math.round(B.hy + 5 - r2 * 0.4), 1, 1); }
    else if (t < 66) { c.fillStyle = '#F49AC8'; c.fillRect(Math.round(B.hx + 4), Math.round(B.hy + 6), 9, 3); }
  }
};

const JOBS: Job[] = ['mascot', 'princess', 'churro', 'rideop', 'janitor', 'guard', 'teen', 'maint', 'painter', 'dancer'];
for (const job of JOBS) {
  registerM2Kind({
    kind: `m2:pen_${job}`,
    stats: { w: 34, h: 62, hp: 70, contact: 0, mass: job === 'mascot' ? 230 : 180 },
    humanoid: true,
    pathing: false,
    make: b => ({ ...b, harmless: true, noCrowd: true }),
    // (they don't do anything: that's the joke; in the staff room they're moved by hand)
    ai: (_ctx, e) => { e.vel.x = 0; return false; },
    draw: (c, e, f) => drawStaff(c, e, f, job),
    head: { x: 1, y: -66, r: 9 },
    gender: e => (womanOf(penSeed(e)) ? 'f' : 'm'),
  });
}
export const PEN_STAFF_KINDS = JOBS.map(j => `m2:pen_${j}`);

// ---------------------------------------------------------------------------------------------------------------
// The vermin

/** The rat: the town's rat, drawn running whenever it's moved by hand. */
registerM2Kind({
  kind: 'm2:pen_rat', stats: { w: 30, h: 14, hp: 14, contact: 0, mass: 4 }, gender: 'n', grab: 'critter', head: { x: 11, y: -8, r: 5 },
  make: b => ({ ...b, harmless: true, noCrowd: true }),
  ai: (_ctx, e) => { e.vel.x = 0; return false; },
  draw: (c, e, f) => {
    const v = e.vel.x, a = e.aiState;
    if (penMoving.has(e)) { e.vel.x = e.facing; e.aiState = 'rush'; }
    drawRatArt(c, e, f);
    e.vel.x = v; e.aiState = a;
  },
});

/** The pigeon: gray, the neck green and purple, an orange eye, a stump of a foot; flapping, or gliding. */
const paintPigeon = (g: Ctx, fr: number, md: 'ok' | 'hurt' | 'dead') => {
  const B = '#8A909C', DARK = '#5C6270', NECK1 = '#3FA36B', NECK2 = '#8B5CF6';
  // (the tail)
  part(g, () => { g.moveTo(-9, -12); g.lineTo(-22, -14); g.lineTo(-22, -8); g.lineTo(-9, -7); g.closePath(); }, DARK, -22, -14, 13, 8, 1);
  px(g, -22, -10, 4, 2, '#2A2E36');
  // (the body, plump; the far wing up behind)
  const up = [-16, -6, 6, -6][fr];
  part(g, () => { g.moveTo(-4, -13); g.lineTo(4, -13); g.lineTo(0 + up * 0.2, -13 + up); g.lineTo(-10 + up * 0.1, -12 + up * 0.8); g.closePath(); }, dk(B, 0.15), -12, Math.min(-13, -13 + up), 18, Math.abs(up) + 4, 1);
  part(g, () => g.ellipse(-1, -11, 11, 6.5, -0.05, 0, Math.PI * 2), B, -12, -17.5, 22, 13);
  dither(g, -8, -7, 12, 2, lt(B, 0.3));
  // (the head and neck, the sheen)
  part(g, () => g.arc(9, -16, 5, 0, Math.PI * 2), B, 4, -21, 10, 10);
  px(g, 5, -13, 5, 2, NECK1); px(g, 6, -11, 4, 1, NECK2); px(g, 4, -14, 2, 1, NECK2);
  flat(g, () => { g.moveTo(13, -17); g.lineTo(18, -15.5); g.lineTo(13, -14.5); g.closePath(); }, '#3A3436', 0.8);
  px(g, 13, -18, 2, 1, '#F1EFEA');
  if (md === 'dead') { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(9, -19); g.lineTo(12, -16); g.moveTo(12, -19); g.lineTo(9, -16); g.stroke(); }
  else if (md === 'hurt') { g.strokeStyle = INK; g.lineWidth = 1; g.beginPath(); g.moveTo(9, -19); g.lineTo(12, -17.5); g.lineTo(9, -16); g.stroke(); }
  else { ball(g, 10.5, -17.5, 1.5, '#F97316', 0.6); px(g, 10, -18, 1, 1, INK); }
  // (the near wing, its bars; the feet tucked, one a stump)
  part(g, () => { g.moveTo(-6, -14); g.lineTo(4, -14); g.lineTo(0 - up * 0.1, -14 + up * 0.9); g.lineTo(-12, -13 + up * 0.7); g.closePath(); }, B, -13, Math.min(-14, -14 + up), 18, Math.abs(up) + 3, 1);
  for (let k = 0; k < 2; k++) px(g, -8 + k * 4, -14 + up * (0.4 + k * 0.15), 3, 1, '#2A2E36');
  px(g, -2, -5, 1, 3, '#E07A8A'); px(g, -3, -2, 3, 1, '#E07A8A'); px(g, 2, -5, 1, 2, '#C05A6A');
};
registerM2Kind({
  kind: 'm2:pen_pigeon', stats: { w: 30, h: 20, hp: 12, contact: 0, mass: 3, air: true }, gender: 'n', grab: 'critter', head: { x: 9, y: -16, r: 5 },
  make: b => ({ ...b, enemyType: 'flyer', initialY: b.pos.y, harmless: true, noCrowd: true }),
  ai: () => true,
  draw: (c, e, f) => {
    const r = reaction(e), md = moodOf(e);
    const fr = md === 'dead' && !r ? 1 : Math.floor((f + (e.variant ?? 0) * 5) / (penMoving.has(e) || r ? 3 : 6)) % 4;
    stamp(c, `pen-pigeon-${fr}-${md}`, -26, -26, 48, 28, g => paintPigeon(g, fr, md));
  },
});
