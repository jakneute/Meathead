// The townsfolk: everybody Meathead comes across who isn't out to kill him (the skier, the daycare's grown-ups and
// kids, the tourists, the crew on the corner, the sheriff, the old man in his boat...), drawn the one way, so they're
// all of a piece: an ink line round every part, clothes shaded in steps (lit from the upper left), a face with eyes,
// brows and a mouth that does something, hands, shoes with a sole. Feet at (x, y), facing right (pass facing -1 to turn
// round), about 64 tall (Meathead's height) at scale 1; a kid's about two-thirds that, big-headed.

import { INK, ink, shaded, dark, lite } from './kit';

type Ctx = CanvasRenderingContext2D;

export type Hair = 'short' | 'long' | 'bun' | 'bald' | 'pony' | 'pigtails' | 'curly' | 'flattop' | 'mullet';
export type Top = 'tee' | 'shirt' | 'jacket' | 'vest' | 'flannel' | 'dress' | 'hoodie' | 'robe' | 'tank' | 'parka' | 'apron';
export type Hat = 'cap' | 'hardhat' | 'bucket' | 'helmet' | 'stetson' | 'beanie' | 'sunhat' | 'visor';

export interface PersonSpec {
  skin: string;
  hair?: { style: Hair; color: string };
  top: { style: Top; color: string; accent?: string; long?: boolean };
  legs: { color: string; style?: 'pants' | 'shorts' | 'skirt' };
  shoes?: string;
  hat?: { style: Hat; color: string };
  eyes?: 'glasses' | 'shades' | 'goggles';
  face?: 'stubble' | 'beard' | 'mustache';
  faceHair?: string;
  build?: 'slim' | 'fat';
  kid?: boolean;
  /** An extra on the front of them: a badge, a name tag, a tie... drawn in body coordinates (feet at 0). */
  extra?: (ctx: Ctx) => void;
}

export interface Pose {
  /** What the arms are doing. 'hold': the front hand out in front (pass `prop` to put something in it). */
  arms?: 'down' | 'up' | 'wave' | 'panic' | 'hold' | 'cross' | 'point' | 'hips';
  /** Walking or running: the stride's phase (radians); how far the legs swing (0..1). */
  walk?: number;
  stride?: number;
  mouth?: 'flat' | 'smile' | 'grin' | 'open' | 'o' | 'frown' | 'talk';
  /** Sat down (legs out in front). */
  seated?: boolean;
  /** The frame (for blinking, talking). */
  f?: number;
  /** Something in the front hand, drawn at it (body coordinates). */
  prop?: (ctx: Ctx, hx: number, hy: number) => void;
  /** Something in the back hand. */
  propBack?: (ctx: Ctx, hx: number, hy: number) => void;
}

/** An arm: from the shoulder to the hand, sleeve and skin, the hand round. Returns where the hand is. */
const arm = (ctx: Ctx, sx: number, sy: number, hx: number, hy: number, sleeve: string, skin: string, long: boolean, w: number) => {
  const ex = (sx + hx) / 2, ey = (sy + hy) / 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.strokeStyle = long ? sleeve : skin; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx, hy); ctx.stroke();
  if (!long) { ctx.strokeStyle = sleeve; ctx.lineWidth = w + 0.6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (ex - sx) * 0.7, sy + (ey - sy) * 0.7); ctx.stroke(); }
  ctx.lineCap = 'butt';
  ink(ctx, () => ctx.arc(hx, hy, w * 0.62, 0, Math.PI * 2), skin, 0.8);
};

export const drawPerson = (ctx: Ctx, x: number, y: number, s: PersonSpec, p: Pose = {}, scale = 1, facing: 1 | -1 = 1) => {
  const f = p.f ?? 0;
  const kid = !!s.kid, fat = s.build === 'fat', slim = s.build === 'slim';
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale * facing * (kid ? 0.66 : 1), scale * (kid ? 0.66 : 1));
  const skin = s.skin, skinD = dark(skin, 0.2);
  const hipY = kid ? -22 : -28, shoulderY = kid ? -44 : -52, headY = kid ? -60 : -62, headR = kid ? 11 : 9;
  const bodyW = fat ? 22 : slim ? 14 : 18;
  const stride = (p.stride ?? (p.walk !== undefined ? 1 : 0)) * (kid ? 7 : 9), ph = p.walk ?? 0;
  // ---- Legs
  const pants = s.legs.color, shoe = s.shoes ?? '#292524';
  if (p.seated) {
    ink(ctx, () => ctx.roundRect(-6, hipY - 2, 22, 7, 3), pants, 1);
    ink(ctx, () => ctx.roundRect(12, hipY + 2, 6, -hipY - 2, 2), s.legs.style === 'shorts' ? skin : pants, 1);
    ink(ctx, () => ctx.roundRect(11, -3, 10, 4, 1.5), shoe, 1);
  } else {
    for (const side of [-1, 1]) {
      const swing = Math.sin(ph + (side > 0 ? 0 : Math.PI)) * stride;
      const lift = Math.max(0, Math.cos(ph + (side > 0 ? 0 : Math.PI))) * (stride ? 3 : 0);
      const lx = side * 4 + swing * 0.5, fx = side * 3 + swing;
      ctx.save();
      const legW = kid ? 6 : 7;
      if (s.legs.style === 'skirt') { /* (the skirt covers the tops: just the shins) */ }
      const top = s.legs.style === 'shorts' ? hipY + 9 : s.legs.style === 'skirt' ? hipY + 12 : hipY;
      if (s.legs.style === 'shorts' || s.legs.style === 'skirt') ink(ctx, () => { ctx.moveTo(lx - legW / 2, top); ctx.lineTo(lx + legW / 2, top); ctx.lineTo(fx + legW / 2 - 0.5, -3 - lift); ctx.lineTo(fx - legW / 2 + 0.5, -3 - lift); ctx.closePath(); }, skin, 1);
      shaded(ctx, () => { ctx.moveTo(lx - legW / 2, hipY); ctx.lineTo(lx + legW / 2, hipY); ctx.lineTo((s.legs.style === 'pants' || !s.legs.style) ? fx + legW / 2 - 0.5 : lx + legW / 2, (s.legs.style === 'pants' || !s.legs.style) ? -3 - lift : top); ctx.lineTo((s.legs.style === 'pants' || !s.legs.style) ? fx - legW / 2 + 0.5 : lx - legW / 2, (s.legs.style === 'pants' || !s.legs.style) ? -3 - lift : top); ctx.closePath(); }, pants, -10, hipY, 20, -hipY);
      // (the shoe: a sole under it)
      ink(ctx, () => ctx.roundRect(fx - 4, -5 - lift, 10, 5, [2.5, 3, 1, 1]), shoe, 1);
      ctx.fillStyle = lite(shoe, 0.35); ctx.fillRect(fx - 3, -4.5 - lift, 3, 1);
      ctx.fillStyle = '#E7E5E4'; ctx.fillRect(fx - 4, -1 - lift, 10, 1);
      ctx.restore();
    }
  }
  // ---- The back arm (behind the body)
  const sleeve = s.top.color, longS = s.top.long ?? ['jacket', 'hoodie', 'robe', 'parka', 'flannel', 'shirt'].includes(s.top.style);
  const armW = kid ? 5 : 5.5;
  const arms = p.arms ?? 'down';
  const backHand = arms === 'up' ? [-10, shoulderY - 16] : arms === 'panic' ? [-6, headY - 6] : arms === 'hips' ? [-10, hipY + 2] : arms === 'cross' ? [6, shoulderY + 10] : [-7 - Math.sin(ph) * stride * 0.6, hipY + 4];
  arm(ctx, -bodyW / 2 + 2, shoulderY + 3, backHand[0], backHand[1], dark(sleeve, 0.15), skinD, longS, armW);
  if (p.propBack) p.propBack(ctx, backHand[0], backHand[1]);
  // ---- The body: the garment shaded, its details
  const top = s.top, tc = top.color;
  const bodyPath = () => {
    if (top.style === 'dress' || top.style === 'robe') { ctx.moveTo(-bodyW / 2, shoulderY); ctx.lineTo(bodyW / 2, shoulderY); ctx.lineTo(bodyW / 2 + 6, hipY + 14); ctx.lineTo(-bodyW / 2 - 6, hipY + 14); ctx.closePath(); }
    else if (fat) { ctx.moveTo(-bodyW / 2, shoulderY); ctx.lineTo(bodyW / 2, shoulderY); ctx.quadraticCurveTo(bodyW / 2 + 8, hipY - 8, bodyW / 2 - 1, hipY + 2); ctx.lineTo(-bodyW / 2 + 1, hipY + 2); ctx.quadraticCurveTo(-bodyW / 2 - 6, hipY - 8, -bodyW / 2, shoulderY); ctx.closePath(); }
    else ctx.roundRect(-bodyW / 2, shoulderY, bodyW, hipY - shoulderY + 3, [5, 5, 2, 2]);
  };
  shaded(ctx, bodyPath, tc, -bodyW / 2 - 8, shoulderY, bodyW + 16, hipY - shoulderY + 16);
  ctx.save(); ctx.beginPath(); bodyPath(); ctx.clip();
  const acc = top.accent ?? dark(tc, 0.35);
  if (top.style === 'flannel') { ctx.fillStyle = 'rgba(26, 11, 6, 0.28)'; for (let k = -bodyW; k < bodyW; k += 5) ctx.fillRect(k, shoulderY, 1.6, 40); for (let k = shoulderY; k < hipY + 4; k += 5) ctx.fillRect(-bodyW, k, bodyW * 2, 1.6); }
  if (top.style === 'vest' || top.style === 'apron') { ctx.fillStyle = acc; ctx.fillRect(-bodyW / 2, shoulderY + 4, bodyW, hipY - shoulderY); if (top.style === 'vest') { ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-bodyW / 2, shoulderY + 14, bodyW, 2.4); } }
  if (top.style === 'jacket' || top.style === 'parka' || top.style === 'shirt' || top.style === 'hoodie') { ctx.fillStyle = dark(tc, 0.3); ctx.fillRect(-0.6, shoulderY + 3, 1.2, hipY - shoulderY); }
  if (top.style === 'jacket') { ctx.fillStyle = acc; ctx.beginPath(); ctx.moveTo(-4, shoulderY); ctx.lineTo(0, shoulderY + 10); ctx.lineTo(4, shoulderY); ctx.fill(); }
  if (top.style === 'parka') { ctx.fillStyle = acc; ctx.fillRect(-bodyW / 2, shoulderY + 10, bodyW, 3); ctx.fillRect(-bodyW / 2, shoulderY + 18, bodyW, 3); }
  if (top.style === 'tee' || top.style === 'tank') { ctx.fillStyle = acc; ctx.fillRect(-4, shoulderY + 8, 8, 6); }
  if (top.style === 'tank') { ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(0, shoulderY - 2, 5, 0, Math.PI); ctx.fill(); }
  if (top.style === 'dress') { ctx.fillStyle = acc; ctx.fillRect(-bodyW, hipY - 6, bodyW * 2, 2); }
  ctx.restore();
  // (a belt, where there's a waist)
  if (!['dress', 'robe', 'parka', 'hoodie'].includes(top.style)) { ctx.fillStyle = '#292524'; ctx.fillRect(-bodyW / 2 + 1, hipY, bodyW - 2, 2.4); ctx.fillStyle = '#FACC15'; ctx.fillRect(-1.4, hipY, 2.8, 2.4); }
  s.extra?.(ctx);
  // ---- Head: neck, face (shaded), ear, hair, the face's parts, the hat, the eyewear
  ink(ctx, () => ctx.rect(-2.6, shoulderY - 5, 5.2, 6), skinD, 0.8);
  const hy = headY;
  // (long hair falls down behind the head)
  if (s.hair?.style === 'long' || s.hair?.style === 'pigtails') ink(ctx, () => ctx.roundRect(-headR - 1.4, hy - headR * 0.6, headR * 1.2, headR * 2.1, 3), s.hair!.color, 1);
  if (s.hair?.style === 'pony') ink(ctx, () => ctx.ellipse(-headR - 2, hy - 1, 3, 7, 0.3, 0, Math.PI * 2), s.hair!.color, 1);
  ctx.save(); ctx.beginPath(); ctx.ellipse(1, hy, headR, headR * 1.1, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = skin; ctx.fillRect(-headR, hy - headR * 1.2, headR * 2.4, headR * 2.4);
  ctx.fillStyle = skinD; ctx.fillRect(-headR, hy - headR * 1.2, headR * 0.55, headR * 2.4);
  ctx.fillStyle = lite(skin, 0.18); ctx.fillRect(headR * 0.25, hy - headR * 0.9, headR * 0.5, headR * 0.5);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(1, hy, headR, headR * 1.1, 0, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
  ink(ctx, () => ctx.ellipse(-headR + 2, hy + 1, 2, 2.6, 0, 0, Math.PI * 2), skinD, 0.7);
  // Hair
  const hair = s.hair;
  if (hair && hair.style !== 'bald') {
    const hc = hair.color;
    const cap = () => { ctx.beginPath(); ctx.ellipse(0.4, hy - headR * 0.35, headR + 0.6, headR * 0.82, 0, Math.PI * 1.02, Math.PI * 2.06); ctx.lineTo(headR - 1, hy - headR * 0.3); ctx.closePath(); };
    if (hair.style === 'bun') ink(ctx, () => ctx.arc(-3, hy - headR - 3, 4.2, 0, Math.PI * 2), hc, 1);
    if (hair.style === 'pigtails') for (const sx of [-headR - 2, headR + 2]) ink(ctx, () => ctx.ellipse(sx, hy + 2, 2.6, 5, 0, 0, Math.PI * 2), hc, 0.9);
    if (hair.style === 'mullet') ink(ctx, () => ctx.roundRect(-headR - 1, hy - 2, headR * 0.8, headR * 1.4, 2), hc, 1);
    ink(ctx, cap, hc, 1);
    if (hair.style === 'curly') for (let k = 0; k < 6; k++) ink(ctx, () => ctx.arc(-headR + 2 + k * (headR * 0.38), hy - headR * 0.85 - (k % 2) * 1.4, 2.6, 0, Math.PI * 2), hc, 0.6);
    if (hair.style === 'flattop') ink(ctx, () => ctx.rect(-headR + 1, hy - headR - 3, headR * 2 - 1, 4), hc, 1);
    ctx.fillStyle = lite(hc, 0.3); ctx.fillRect(-2, hy - headR * 0.95, 5, 1.2);
  }
  // Facial hair
  if (s.face === 'beard') ink(ctx, () => { ctx.moveTo(-headR + 3, hy + 1); ctx.quadraticCurveTo(2, hy + headR * 1.7, headR, hy + 1); ctx.lineTo(headR - 1, hy + 4); ctx.lineTo(-headR + 3, hy + 4); ctx.closePath(); }, s.faceHair ?? hair?.color ?? '#3F2A1D', 0.8);
  if (s.face === 'stubble') { ctx.fillStyle = 'rgba(41, 37, 36, 0.35)'; ctx.fillRect(-headR + 3, hy + 2, headR * 2 - 3, 5); }
  // Eyes (a blink now and then), brows
  const ey = hy - 1, blink = (f + Math.floor(x)) % 170 < 5;
  const open = p.mouth === 'o' || p.mouth === 'open';
  if (!s.eyes || s.eyes === 'glasses') {
    for (const ex of [2, 7]) {
      if (blink) { ctx.fillStyle = INK; ctx.fillRect(ex - 1.5, ey, 3, 1); continue; }
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(ex - 1.5, ey - 1.5, 3, open ? 3.6 : 3);
      ctx.fillStyle = INK; ctx.fillRect(ex, ey - 0.8, 1.4, 1.8);
    }
  }
  ctx.fillStyle = hair?.color ?? INK; ctx.fillRect(0.5, ey - (open ? 4.5 : 3.6), 3, 1); ctx.fillRect(5.5, ey - (open ? 4.5 : 3.6), 3, 1);
  if (s.eyes === 'glasses') { ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.strokeRect(0, ey - 2.4, 4, 4); ctx.strokeRect(5, ey - 2.4, 4, 4); ctx.beginPath(); ctx.moveTo(4, ey - 1); ctx.lineTo(5, ey - 1); ctx.stroke(); }
  if (s.eyes === 'shades') { ink(ctx, () => ctx.roundRect(-0.5, ey - 2.2, 10, 3.6, 1), '#111827', 0.6); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(1, ey - 1.6, 2, 0.8); }
  if (s.eyes === 'goggles') { ink(ctx, () => ctx.roundRect(-3, ey - 3, 13, 5.4, 2.4), '#F97316', 0.8); ctx.fillStyle = 'rgba(253, 224, 71, 0.85)'; ctx.fillRect(-1, ey - 2, 9, 3); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, ey - 1.6, 2, 1); }
  // (nose)
  ctx.fillStyle = skinD; ctx.fillRect(headR - 3, hy + 1, 2, 2.4);
  if (s.face === 'mustache') ink(ctx, () => ctx.roundRect(1, hy + 3.4, 8, 2.2, 1), s.faceHair ?? hair?.color ?? '#3F2A1D', 0.5);
  // Mouth
  const my = hy + 5.6, talk = p.mouth === 'talk' ? 0.6 + Math.abs(Math.sin(f * 0.5)) * 2.4 : 0;
  ctx.fillStyle = INK;
  switch (p.mouth ?? 'flat') {
    case 'smile': ctx.beginPath(); ctx.arc(4.6, my - 1.4, 2.6, 0.2, Math.PI - 0.2); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); break;
    case 'grin': ctx.fillRect(1.4, my - 0.6, 6.6, 2.6); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(2, my - 0.4, 5.4, 1.2); break;
    case 'open': ink(ctx, () => ctx.ellipse(4.6, my + 0.4, 2.6, 2.8, 0, 0, Math.PI * 2), '#7F1D1D', 0.7); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(3, my - 2, 3.2, 0.9); break;
    case 'o': ink(ctx, () => ctx.ellipse(4.6, my + 0.4, 1.5, 1.9, 0, 0, Math.PI * 2), '#450A0A', 0.6); break;
    case 'frown': ctx.beginPath(); ctx.arc(4.6, my + 1.6, 2.4, Math.PI + 0.3, -0.3); ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke(); break;
    case 'talk': ink(ctx, () => ctx.ellipse(4.6, my, 2.2, Math.max(0.6, talk), 0, 0, Math.PI * 2), '#7F1D1D', 0.6); break;
    default: ctx.fillRect(2.6, my, 4, 1);
  }
  // Hat
  const hat = s.hat;
  if (hat) {
    const hc = hat.color;
    switch (hat.style) {
      case 'cap': ink(ctx, () => { ctx.ellipse(0.5, hy - headR * 0.45, headR + 0.6, headR * 0.72, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, hc, 1); ink(ctx, () => ctx.roundRect(headR - 3, hy - headR * 0.55, 9, 2.6, 1), dark(hc, 0.2), 0.8); break;
      case 'visor': ink(ctx, () => ctx.rect(-headR, hy - headR * 0.6, headR * 2, 2.4), hc, 0.8); ink(ctx, () => ctx.roundRect(headR - 3, hy - headR * 0.6, 9, 2.4, 1), hc, 0.8); break;
      case 'hardhat': ink(ctx, () => { ctx.ellipse(0.5, hy - headR * 0.4, headR + 1, headR * 0.9, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, hc, 1); ink(ctx, () => ctx.roundRect(-headR - 2, hy - headR * 0.48, headR * 2 + 5, 2.6, 1), dark(hc, 0.18), 0.8); ctx.fillStyle = lite(hc, 0.4); ctx.fillRect(-3, hy - headR * 1.1, 5, 1.2); break;
      case 'bucket': ink(ctx, () => { ctx.moveTo(-headR + 1, hy - headR * 0.4); ctx.lineTo(-headR + 3, hy - headR * 1.25); ctx.lineTo(headR - 1, hy - headR * 1.25); ctx.lineTo(headR + 1, hy - headR * 0.4); ctx.closePath(); }, hc, 1); ink(ctx, () => ctx.ellipse(0.5, hy - headR * 0.4, headR + 4, 2, 0, 0, Math.PI * 2), dark(hc, 0.15), 0.8); break;
      case 'helmet': ink(ctx, () => { ctx.ellipse(0.5, hy - 1, headR + 1.6, headR + 1.2, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.closePath(); }, hc, 1); ctx.fillStyle = lite(hc, 0.4); ctx.fillRect(-4, hy - headR - 0.4, 6, 1.4); break;
      case 'stetson': ink(ctx, () => ctx.ellipse(0.5, hy - headR * 0.5, headR + 7, 2.6, 0, 0, Math.PI * 2), hc, 1); ink(ctx, () => ctx.roundRect(-headR + 2, hy - headR * 1.45, headR * 2 - 3, headR * 0.95, [3, 3, 0, 0]), hc, 1); ctx.fillStyle = dark(hc, 0.4); ctx.fillRect(-headR + 2, hy - headR * 0.8, headR * 2 - 3, 1.6); break;
      case 'beanie': ink(ctx, () => { ctx.ellipse(0.5, hy - headR * 0.4, headR + 0.8, headR * 0.95, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, hc, 1); ink(ctx, () => ctx.rect(-headR - 0.4, hy - headR * 0.55, headR * 2 + 1.8, 3), dark(hc, 0.2), 0.7); ink(ctx, () => ctx.arc(0.5, hy - headR * 1.38, 2.2, 0, Math.PI * 2), lite(hc, 0.3), 0.6); break;
      case 'sunhat': ink(ctx, () => ctx.ellipse(0.5, hy - headR * 0.55, headR + 9, 3, 0, 0, Math.PI * 2), hc, 1); ink(ctx, () => { ctx.ellipse(0.5, hy - headR * 0.6, headR, headR * 0.7, 0, Math.PI, Math.PI * 2); ctx.closePath(); }, hc, 1); ctx.fillStyle = hat.color === '#FDE68A' ? '#F472B6' : '#F472B6'; ctx.fillRect(-headR + 1, hy - headR * 0.8, headR * 2 - 1, 2); break;
    }
  }
  // ---- The front arm, over the body
  const handF: [number, number] = arms === 'up' ? [10, shoulderY - 18] : arms === 'wave' ? [13 + Math.sin(f * 0.4) * 3, shoulderY - 14] : arms === 'panic' ? [7, headY - 7]
    : arms === 'hold' ? [14, shoulderY + 10] : arms === 'point' ? [20, shoulderY + 1] : arms === 'hips' ? [10, hipY + 1] : arms === 'cross' ? [-6, shoulderY + 12] : [7 + Math.sin(ph) * stride * 0.6, hipY + 4];
  arm(ctx, bodyW / 2 - 2, shoulderY + 3, handF[0], handF[1], sleeve, skin, longS, armW);
  if (p.prop) p.prop(ctx, handF[0], handF[1]);
  ctx.restore();
};
