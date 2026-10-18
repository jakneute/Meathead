// Timber Tumble's ride operator (the final pass: peak SNES, on Spooky Land's person drawer, costume.ts, as the cast is):
// whoever it is shows (skin, build, face, a man or a woman by the visit), in the ride's uniform: the park's khaki shirt
// with a name tag and a lanyard, a suede frontier vest with its fringe and the ride's brass badge, a radio on the belt,
// a ranger's campaign hat. Talking, the mouth goes. Shoved: flung out of the booth (arms and legs everywhere), then
// flat on the platform, kicking. Each frame painted once into a stamp. Feet at the origin, facing right.

import {
  type Frame, type Pose, dk, lt, part, partTop, px, bodyOf, flailHands, legs, torso, arm, headShape, faceOn, whiskers,
  glasses, hairTop, hairBack, frameOf, putFrame,
} from '../../spooky/costume';

type Ctx = CanvasRenderingContext2D;
export type OpPose = 'stand' | 'fly' | 'down';
export type OpMood = 'angry' | 'scared' | 'shocked' | 'bored';

const KHAKI = '#B8A070', TROUSER = '#5A4A32', SUEDE = '#8A5A34', HAT = '#7A5A34';

const paintOperator = (g: Ctx, F: Frame, mood: OpMood, talk: boolean) => {
  const B = bodyOf(F.seed, F.pose, F.fr, F.woman), L = B.L;
  legs(g, B, { col: TROUSER, shoe: 'boot', shoeCol: '#3A2A1A' });
  const fl = flailHands(B, F.fr);
  const far: [number, number] = fl ? fl[0] : [-B.w / 2 - 2, B.shY + 20];
  const near: [number, number] = fl ? fl[1] : mood === 'angry' ? [B.w / 2 + 14, B.shY + 4] : [B.w / 2 + 3, B.shY + 21];
  arm(g, B, -1, far[0], far[1], { sleeve: dk(KHAKI, 0.12), hand: L.skin, len: 0.55 });
  torso(g, B, KHAKI);
  // (the vest: suede, its fringe, the brass badge; the name tag; the lanyard)
  part(g, () => { g.moveTo(-B.w / 2 + 1, B.shY + 2); g.lineTo(-B.hipW / 2 + 1, B.hipY); g.lineTo(-2, B.hipY); g.lineTo(-3, B.shY + 8); g.closePath(); }, SUEDE, -B.w / 2, B.shY + 2, B.w / 2, B.hipY - B.shY, 0.8);
  part(g, () => { g.moveTo(B.w / 2 - 1, B.shY + 2); g.lineTo(B.hipW / 2 - 1, B.hipY); g.lineTo(2, B.hipY); g.lineTo(3, B.shY + 8); g.closePath(); }, SUEDE, 0, B.shY + 2, B.w / 2, B.hipY - B.shY, 0.8);
  for (let x = -B.hipW / 2 + 1; x < B.hipW / 2 - 1; x += 2) if (Math.abs(x) > 2) px(g, x, B.hipY, 1, 3, dk(SUEDE, 0.2));
  part(g, () => g.arc(-B.w / 4, B.shY + 12, 2.6, 0, Math.PI * 2), '#D8A83A', -B.w / 4 - 3, B.shY + 9, 6, 6, 0.6);
  part(g, () => g.rect(B.w / 4 - 3, B.shY + 9, 7, 4), '#F4F4F0', B.w / 4 - 3, B.shY + 9, 7, 4, 0.5); px(g, B.w / 4 - 2, B.shY + 10, 5, 1, '#2A2A30');
  px(g, -1, B.shY, 1, 10, '#C83A3A'); px(g, 1, B.shY, 1, 10, '#C83A3A');
  px(g, -B.hipW / 2, B.hipY - 2, B.hipW, 3, '#3A2414'); px(g, -1, B.hipY - 2, 3, 3, '#D8A83A');
  part(g, () => g.rect(B.hipW / 2 - 6, B.hipY - 8, 5, 8), '#26262C', B.hipW / 2 - 6, B.hipY - 8, 5, 8, 0.6); px(g, B.hipW / 2 - 5, B.hipY - 12, 1, 4, '#26262C');
  // (the head: the hat on it, a campaign hat, its pinched crown and flat brim)
  hairBack(g, B, L.hair, 14);
  headShape(g, B, L.skin);
  const eyes = mood === 'shocked' || mood === 'scared' ? 'wide' : mood === 'angry' ? 'angry' : 'tired';
  const mouth = talk ? (F.fr % 2 ? 'o' : 'talk') : mood === 'shocked' || mood === 'scared' ? 'o' : mood === 'angry' ? 'teeth' : 'flat';
  faceOn(g, B, { skin: L.skin, eyes, mouth, md: F.md, blink: F.blink });
  whiskers(g, B); glasses(g, B);
  if (L.long || L.woman) hairTop(g, B);
  part(g, () => g.ellipse(B.hx + 1, B.hy - 8, 15, 2.6, 0, 0, Math.PI * 2), HAT, B.hx - 14, B.hy - 11, 30, 6, 1);
  partTop(g, () => { g.moveTo(B.hx - 7, B.hy - 8); g.lineTo(B.hx - 4, B.hy - 18); g.lineTo(B.hx + 1, B.hy - 15); g.lineTo(B.hx + 6, B.hy - 18); g.lineTo(B.hx + 9, B.hy - 8); g.closePath(); }, HAT, B.hx - 7, B.hy - 18, 16, 10, 1);
  px(g, B.hx - 7, B.hy - 11, 16, 2, dk(HAT, 0.4)); px(g, B.hx - 4, B.hy - 17, 2, 6, lt(HAT, 0.25));
  arm(g, B, 1, near[0], near[1], { sleeve: KHAKI, hand: L.skin, len: 0.55 });
};

const BOX: [number, number, number, number] = [-44, -104, 92, 108];

/** The ride's operator, feet at (x, y). `talk`: the mouth going. */
export const drawOperator = (c: Ctx, x: number, y: number, o: { seed: number; woman: boolean; f: number; pose: OpPose; mood: OpMood; talk: boolean; facing: number }) => {
  const pose: Pose = o.pose === 'fly' ? 'thrown' : o.pose === 'down' ? 'pinned' : 'stand';
  const F = frameOf(o.seed, o.f, pose, 'ok', 0, o.woman, `op-${o.mood}`);
  if (o.talk) { F.fr = Math.floor(o.f / 5) % 2; F.v += '-t'; }
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(o.facing < 0 ? -1 : 1, 1);
  // (down: flat on her back on the platform, kicking)
  if (o.pose === 'down') { c.translate(40, -12); c.rotate(-Math.PI / 2); }
  putFrame(c, 'lr-operator', F, BOX, g => paintOperator(g, F, o.mood, o.talk));
  c.restore();
};
