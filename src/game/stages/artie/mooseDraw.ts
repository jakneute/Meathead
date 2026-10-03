// The moose: a huge bull with palmate antlers, a hump, a bell under its chin and
// long pale-stockinged legs. Drawn facing right from its feet, then flipped.
// Plus what's left of it, depending on what killed it, and its health bar.

import type { Enemy } from '../../../types';
import type { GameState } from '../../core/state';
import { drawFlameLicks } from '../../render/fx/fireball';
import { INK, ink, shaded, shadedTop, lite, dark } from '../../render/npc/kit';
import { mix } from '../../render/backdrops/core';
import type { MooseCorpse, MooseFight } from './moose';
import { MOOSE_HP } from './moose';

type Ctx = CanvasRenderingContext2D;

const FUR = '#4A2E1A', FUR_DARK = '#2E1B0F', FUR_LIGHT = '#6B4429', STOCKING = '#BFAE8E', HOOF = '#111', ANTLER = '#D9C7A3', ANTLER_DARK = '#A8946E';
const BLOOD = '#7F1010', BLOOD_BRIGHT = '#B91C1C';

interface Pose {
  /** Leg swing: phase and how far they swing. */
  legPhase: number;
  legSwing: number;
  /** Rotation of the whole body around a pivot (rear feet or front feet). */
  tilt: number;
  pivotX: number;
  /** Head: lowered (+) or tossed up (-), in radians around the neck. */
  head: number;
  /** Hind legs kicked out straight behind. */
  kick: boolean;
  /** Front legs raised (rearing up). */
  rear: boolean;
  mouth: number;
  eye: string;
  /** Dead: the mane lies flat. */
  dead?: boolean;
  /** Legs folded or splayed instead: [fore angle, fore bend, hind angle, hind bend]. */
  fold?: [number, number, number, number];
  /** The head (both antlers) behind the body, not over it; or left off it (drawn on its own). */
  headBehind?: boolean;
  noHead?: boolean;
  /** What's done to it: on the hide (body's frame, under the near legs) and on the head (head's frame). */
  onBody?: (ctx: Ctx) => void;
  onHead?: (ctx: Ctx) => void;
}

const livePose = (m: Enemy, frame: number): Pose => {
  const t = m.aiTimer || 0;
  const running = Math.abs(m.vel.x) > 0.5;
  const base: Pose = { legPhase: running ? frame * 0.32 : 0, legSwing: running ? Math.min(1, Math.abs(m.vel.x) / 9) : 0, tilt: 0, pivotX: -45, head: 0, kick: false, rear: false, mouth: 0, eye: '#1C1917' };
  switch (m.aiState) {
    case 'charge': return { ...base, head: 0.42, eye: '#DC2626', mouth: 0.2 };
    case 'paw': return { ...base, head: 0.3 + Math.sin(frame * 0.15) * 0.05, eye: '#DC2626' };
    case 'skid': return { ...base, tilt: -0.08, pivotX: -45, head: 0.2, legSwing: 0 };
    case 'retreat': return { ...base, head: -0.15, mouth: 0.3 }; // trotting off, head high, snorting
    case 'bellow': {
      const up = Math.min(1, t / 18) * (t < 60 ? 1 : Math.max(0, 1 - (t - 60) / 10));
      return { ...base, tilt: -0.45 * up, pivotX: -45, head: -0.3 * up, rear: up > 0.3, mouth: up, eye: '#DC2626' };
    }
    case 'heave': {
      const k = t < 10 ? t / 10 : Math.max(0, 1 - (t - 10) / 25);
      return { ...base, head: -0.9 * k, tilt: -0.1 * k };
    }
    case 'kick': {
      const k = t < 8 ? t / 8 : Math.max(0, 1 - (t - 8) / 25);
      return { ...base, tilt: 0.28 * k, pivotX: 45, head: 0.2, kick: k > 0.3 };
    }
    case 'buck': return { ...base, tilt: Math.sin(t * 0.35) * 0.32, pivotX: Math.sin(t * 0.35) > 0 ? 45 : -45, legSwing: 0.8, legPhase: t * 0.7, head: 0.3, mouth: 0.4, eye: '#DC2626' };
    case 'stomp': {
      const rearing = t < 18;
      return { ...base, tilt: rearing ? -0.4 * (t / 18) : 0, pivotX: -45, rear: rearing, head: rearing ? -0.2 : 0.35, mouth: 0.5, eye: '#DC2626' };
    }
    default: return base;
  }
};

export const drawMoose = (ctx: Ctx, m: Enemy, frame: number) => {
  ctx.save();
  ctx.translate(m.pos.x + m.width / 2, m.pos.y + m.height);
  ctx.scale(m.facing ?? -1, 1);
  if (m.hitFlash && m.hitFlash > 0) ctx.filter = 'brightness(1.8) saturate(0.6)';
  const pose = livePose(m, frame);
  // Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath(); ctx.ellipse(0, 0, 80, 6, 0, 0, Math.PI * 2); ctx.fill();
  drawMooseBody(ctx, pose, frame);
  // Snorting clouds while it paws / bellows
  if ((m.aiState === 'paw' || m.aiState === 'bellow') && frame % 24 < 10) {
    const k = (frame % 24) / 10;
    ctx.filter = 'none';
    ctx.fillStyle = `rgba(255,255,255,${0.7 - k * 0.5})`;
    ctx.beginPath(); ctx.arc(112 + k * 18, -38 + (m.aiState === 'bellow' ? -40 : 0), 6 + k * 8, 0, Math.PI * 2); ctx.fill();
  }
  // A hoof scraping the snow
  if (m.aiState === 'paw' && frame % 16 < 3) {
    ctx.fillStyle = '#F8FAFC';
    for (let i = 0; i < 3; i++) ctx.fillRect(40 - i * 8, -6 - i * 3, 4, 4);
  }
  ctx.restore();
};

/** An ellipse as its own subpath (so several make one outline). */
const ell = (ctx: Ctx, cx: number, cy: number, rx: number, ry: number, r: number) => {
  ctx.moveTo(cx + rx * Math.cos(r), cy + rx * Math.sin(r)); ctx.ellipse(cx, cy, rx, ry, r, 0, Math.PI * 2);
};

/** Rump, barrel and hump, as one outline. */
const hidePath = (ctx: Ctx) => { ell(ctx, -42, -62, 30, 25, -0.1); ell(ctx, -4, -60, 52, 26, 0); ell(ctx, 28, -74, 34, 26, -0.2); };

/** The whole animal in a pose, local frame: feet at y = 0, facing +x. */
const drawMooseBody = (ctx: Ctx, pose: Pose, frame: number) => {
  ctx.save();
  // Body tilt around the rear or front feet
  ctx.translate(pose.pivotX, 0);
  ctx.rotate(pose.tilt);
  ctx.translate(-pose.pivotX, 0);

  if (pose.headBehind && !pose.noHead) { ctx.save(); headTransform(ctx, pose); antler(ctx, true); head(ctx, pose, frame); antler(ctx, false); ctx.restore(); }
  // Far legs (darker)
  legs(ctx, pose, true);
  // Far antler behind the head
  if (!pose.headBehind && !pose.noHead) { ctx.save(); headTransform(ctx, pose); antler(ctx, true); ctx.restore(); }

  // The stubby tail
  ink(ctx, () => { ctx.moveTo(-66, -80); ctx.quadraticCurveTo(-76, -78, -74, -66); ctx.lineTo(-68, -66); ctx.closePath(); }, FUR_DARK, 1.2);
  // Rump, barrel and the big shoulder hump, as one: the ink round the lot, then the hide over it, banded (lit along
  // the back, the belly in shadow), the hump darker; the coat's grain in strokes
  const mixFur = mix(FUR_DARK, FUR, 0.5);
  const hide = () => hidePath(ctx);
  ctx.beginPath(); hide(); ctx.strokeStyle = INK; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.save(); ctx.beginPath(); hide(); ctx.clip();
  ctx.fillStyle = FUR; ctx.fillRect(-80, -110, 160, 80);
  ctx.fillStyle = FUR_LIGHT; ctx.fillRect(-80, -110, 160, 30);
  ctx.fillStyle = lite(FUR_LIGHT, 0.12); ctx.fillRect(-80, -110, 160, 22);
  ctx.fillStyle = dark(FUR, 0.18); ctx.fillRect(-80, -50, 160, 8);
  ctx.fillStyle = dark(FUR, 0.36); ctx.fillRect(-80, -42, 160, 12);
  // (the rump rounded off: a highlight on it, the haunch's crease)
  ctx.fillStyle = lite(FUR_LIGHT, 0.22); ctx.beginPath(); ctx.ellipse(-50, -78, 12, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = dark(FUR, 0.35); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-30, -78); ctx.quadraticCurveTo(-20, -60, -32, -42); ctx.stroke();
  // (the hump: dark, its top lit in a step)
  ctx.fillStyle = FUR_DARK; ctx.beginPath(); ctx.ellipse(30, -72, 32, 26, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = mixFur; ctx.beginPath(); ctx.ellipse(26, -89, 22, 7, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = dark(FUR_DARK, 0.3); ctx.fillRect(10, -54, 60, 20);
  // (the grain: strokes of lit and dark hair)
  ctx.fillStyle = lite(FUR_LIGHT, 0.3);
  for (const [x, y] of [[-64, -76], [-56, -83], [-44, -72], [-36, -84], [-24, -79], [-14, -84], [-6, -77], [4, -83]]) ctx.fillRect(x, y, 4, 1);
  ctx.fillStyle = dark(FUR, 0.4);
  for (const [x, y] of [[-62, -60], [-50, -54], [-40, -66], [-22, -58], [-12, -66], [-4, -52], [-58, -46], [-16, -46]]) ctx.fillRect(x, y, 1, 4);
  ctx.fillStyle = '#100904';
  for (let i = 0; i < 6; i++) ctx.fillRect(8 + i * 8, -60 + (i % 2) * 4, 1, 5);
  ctx.restore();

  // The mane: a shaggy crest along the hump, rooted in it (no line along its foot); lying flat once it's dead
  const crest = pose.dead ? 0.4 : 1;
  ink(ctx, () => {
    ctx.moveTo(4, -90);
    for (let i = 0; i < 8; i++) { const x = 6 + i * 7, b = Math.abs(i - 3.5) * 2; ctx.lineTo(x + 1, -98 + b); ctx.lineTo(x + 4.5, -98 + b - (9 - b * 0.2) * crest); ctx.lineTo(x + 7, -97.5 + b); }
    ctx.lineTo(64, -86);
  }, '#24160C', 1.2);
  ctx.fillStyle = '#3A2414'; for (let i = 0; i < 8; i++) { const b = Math.abs(i - 3.5) * 2; ctx.fillRect(9 + i * 7, -101 + b * 1.1, 1, 3); }
  pose.onBody?.(ctx);

  // Near legs
  legs(ctx, pose, false);

  // Neck, head, bell, near antler
  if (!pose.headBehind && !pose.noHead) {
    ctx.save();
    headTransform(ctx, pose);
    head(ctx, pose, frame);
    antler(ctx, false);
    ctx.restore();
  }
  ctx.restore();
};

/** Head pivots around the top of the neck. */
const headTransform = (ctx: Ctx, pose: Pose) => {
  ctx.translate(48, -80);
  ctx.rotate(pose.head);
  ctx.translate(-48, 80);
};

const head = (ctx: Ctx, pose: Pose, _frame: number) => {
  // Thick neck: dark, the mane down the back of it, lit along the top
  const neck = () => { ctx.moveTo(34, -96); ctx.quadraticCurveTo(70, -94, 78, -82); ctx.lineTo(70, -56); ctx.quadraticCurveTo(52, -52, 38, -58); };
  ctx.save(); ctx.beginPath(); neck(); ctx.clip();
  ctx.fillStyle = FUR_DARK; ctx.fillRect(34, -100, 46, 46);
  ctx.fillStyle = mix(FUR_DARK, FUR, 0.5); ctx.fillRect(34, -100, 46, 11);
  ctx.fillStyle = dark(FUR_DARK, 0.3); ctx.fillRect(34, -66, 46, 12);
  ctx.restore();
  ctx.beginPath(); neck(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#100904'; for (let i = 0; i < 4; i++) ctx.fillRect(46 + i * 7, -78 + (i % 2) * 5, 1, 6);
  // The bell: a hairy flap hanging under the throat, its hairs in strands
  ink(ctx, () => { ctx.moveTo(62, -58); ctx.quadraticCurveTo(58, -38, 61, -32); ctx.lineTo(63, -35); ctx.lineTo(64.5, -28); ctx.lineTo(66.5, -34); ctx.quadraticCurveTo(70, -40, 70, -58); ctx.closePath(); }, '#241509', 1.1);
  ctx.strokeStyle = lite('#241509', 0.18); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(63, -54); ctx.lineTo(62, -40); ctx.moveTo(66, -54); ctx.lineTo(66, -38); ctx.stroke();
  // The ear, laid back (its inside lighter)
  ink(ctx, () => { ctx.moveTo(66, -90); ctx.quadraticCurveTo(56, -96, 52, -104); ctx.quadraticCurveTo(64, -102, 71, -94); ctx.closePath(); }, FUR_DARK, 1.1);
  ctx.fillStyle = '#5C3A22'; ctx.beginPath(); ctx.moveTo(64, -92); ctx.quadraticCurveTo(58, -97, 56, -101); ctx.quadraticCurveTo(63, -99, 67, -94); ctx.closePath(); ctx.fill();
  // The long head: lit from above, the big overhanging nose paler, its nostril; the lip line
  const face = () => { ctx.moveTo(66, -92); ctx.lineTo(102, -78); ctx.quadraticCurveTo(114, -74, 112, -62); ctx.lineTo(106, -54); ctx.lineTo(72, -60); ctx.closePath(); };
  shadedTop(ctx, face, FUR, 64, -92, 50, 38, 1.2);
  ctx.save(); ctx.beginPath(); face(); ctx.clip();
  ctx.fillStyle = FUR_LIGHT; ctx.beginPath(); ctx.ellipse(106, -66, 10, 9, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(FUR_LIGHT, 0.18); ctx.beginPath(); ctx.ellipse(104, -71, 6, 3, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(FUR, 0.28); ctx.fillRect(74, -88, 16, 1.4); ctx.fillRect(92, -81, 6, 1.2);
  ctx.restore();
  ink(ctx, () => ctx.ellipse(110.4, -65, 2.4, 3.6, 0.3, 0, Math.PI * 2), '#1C1917', 0.8); // nostril
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(84, -60); ctx.quadraticCurveTo(96, -57, 106, -55.5); ctx.stroke();
  // Mouth (open when it bellows): the gape, the teeth, the tongue
  if (pose.mouth > 0.05) {
    ink(ctx, () => { ctx.moveTo(96, -56); ctx.lineTo(110, -56); ctx.lineTo(104, -55 + pose.mouth * 12); ctx.closePath(); }, '#3F0A0A', 1);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(98, -56, 2, 1.6); ctx.fillRect(102, -56, 2, 1.6); ctx.fillRect(106, -56, 2, 1.6);
    ink(ctx, () => ctx.ellipse(103, -54 + pose.mouth * 6, 3.4, 1.6, 0, 0, Math.PI * 2), '#E11D48', 0.6);
  }
  // The eye (its iris red when it's angry) and the heavy brow over it
  ink(ctx, () => ctx.ellipse(84, -80, 4.6, 3.6, 0, 0, Math.PI * 2), '#F5F5F4', 1);
  ctx.fillStyle = pose.eye; ctx.beginPath(); ctx.arc(85, -80, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(85.4, -80, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(83.6, -81.8, 1.2, 1.2);
  ink(ctx, () => { ctx.moveTo(77, -86); ctx.lineTo(93, -82); ctx.lineTo(92, -84.6); ctx.lineTo(78, -88); ctx.closePath(); }, '#1C1917', 0.8);
  pose.onHead?.(ctx);
};

/** A broad palmate antler with tines along the top edge. */
const antler = (ctx: Ctx, far: boolean) => {
  ctx.save();
  ctx.translate(far ? 64 : 70, -92);
  ctx.scale(far ? 0.9 : 1, 1);
  const c = far ? ANTLER_DARK : ANTLER;
  const tines: [number, number][] = [[-50, -44], [-40, -40], [-34, -54], [-24, -46], [-14, -58], [-6, -46], [6, -52], [8, -36]];
  const palm = () => {
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-10, -10, -30, -14);      // beam back
    ctx.lineTo(-48, -30);                           // the palm sweeping up and back
    for (const [x, y] of tines) { ctx.lineTo(x, y); ctx.lineTo(x + 5, y + 8); }
    ctx.quadraticCurveTo(10, -18, 4, -2);
    ctx.closePath();
  };
  // Brow tine forward
  ink(ctx, () => { ctx.moveTo(2, -4); ctx.lineTo(18, -12); ctx.lineTo(16, -6); ctx.closePath(); }, c, 1.1);
  // The palm: bone in steps (lit from the upper left, the shadow under the beam), the grooves running up it into the
  // tines, the tips worn pale
  ctx.save(); ctx.beginPath(); palm(); ctx.clip();
  ctx.fillStyle = c; ctx.fillRect(-56, -62, 70, 64);
  ctx.fillStyle = lite(c, 0.25); ctx.beginPath(); ctx.moveTo(-50, -36); ctx.lineTo(-36, -50); ctx.lineTo(-10, -52); ctx.lineTo(4, -42); ctx.lineTo(-6, -34); ctx.lineTo(-30, -36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dark(c, 0.2); ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(-30, -14); ctx.quadraticCurveTo(-10, -10, 0, 0); ctx.lineTo(8, -8); ctx.quadraticCurveTo(-10, -20, -30, -22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = dark(c, 0.3); ctx.lineWidth = 1;
  for (const [x, y] of [[-38, -40], [-24, -44], [-10, -50], [2, -44]]) { ctx.beginPath(); ctx.moveTo(x * 0.5 - 8, y * 0.4 - 8); ctx.quadraticCurveTo(x * 0.8, y * 0.7, x + 2, y + 4); ctx.stroke(); }
  ctx.fillStyle = lite(c, 0.45); for (const [x, y] of tines) ctx.fillRect(x - 0.5, y, 2.6, 3);
  ctx.restore();
  ctx.beginPath(); palm(); ctx.strokeStyle = INK; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
};

/** Two legs (far or near pair), galloping, rearing or kicking. */
const legs = (ctx: Ctx, pose: Pose, far: boolean) => {
  const fx = far ? 22 : 36, hx = far ? -46 : -32;
  const off = far ? Math.PI : 0;
  const swing = (phase: number) => Math.sin(pose.legPhase + phase + off) * 0.55 * pose.legSwing;
  if (pose.fold) { const [fa, fb, ha, hb] = pose.fold; leg(ctx, fx, -44, fa, fb, far); leg(ctx, hx, -46, ha, hb, far); return; }
  // Front leg: raised and folded when rearing
  leg(ctx, fx, -44, pose.rear ? -1.1 : swing(0), pose.rear ? 1.3 : 0, far);
  // Hind leg: kicked straight back
  leg(ctx, hx, -46, pose.kick ? 1.35 : swing(Math.PI / 2), 0, far);
};

/** The lower leg from the knee: the pale stocking (shaded), the knobbly joint, the split hoof with its glint. */
const shin = (ctx: Ctx, far: boolean) => {
  const st = far ? '#9C8C6E' : STOCKING;
  shaded(ctx, () => { ctx.moveTo(-4.4, 0); ctx.lineTo(4.4, 0); ctx.lineTo(3.6, 19); ctx.lineTo(-3.8, 19); ctx.closePath(); }, st, -4.4, 0, 8.8, 19, 1.1);
  ink(ctx, () => ctx.ellipse(0.4, 1, 5, 3.2, 0, 0, Math.PI * 2), st, 1);
  ctx.fillStyle = lite(st, 0.3); ctx.fillRect(-3, 0, 3, 1);
  ctx.fillStyle = dark(st, 0.3); ctx.fillRect(-4.2, 15.4, 3, 2); // (the dewclaw)
  ink(ctx, () => ctx.roundRect(-5.4, 17.6, 10.8, 5.4, [1.4, 1.4, 2, 2]), HOOF, 1);
  ctx.fillStyle = '#57534E'; ctx.fillRect(-4.2, 18.4, 3, 1.1);
  ctx.fillStyle = INK; ctx.fillRect(0.6, 18.4, 0.9, 4.6);
};

/** One leg from the hip, swung by `a`, with the lower leg bent by `bend`. */
const leg = (ctx: Ctx, x: number, y: number, a: number, bend: number, far: boolean) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  // (the thigh: its top open, so it runs on up into the body)
  shaded(ctx, () => { ctx.moveTo(-7, -4); ctx.lineTo(-5.6, 23); ctx.lineTo(5.6, 23); ctx.lineTo(7, -4); }, far ? '#24160C' : FUR_DARK, -7, -4, 14, 27, 1.2);
  ctx.translate(0, 22);
  ctx.rotate(bend);
  shin(ctx, far);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// What's left of it
// ---------------------------------------------------------------------------

const deadPose: Pose = { legPhase: 0, legSwing: 0, tilt: 0, pivotX: 0, head: 0.2, kick: false, rear: false, mouth: 0.7, eye: '#1C1917', dead: true };

/** The corpse's own frame (where it lies, facing +x), so a wound found in the body's frame can be put back in it. */
let corpseFrame: DOMMatrix | null = null;
/** A point in the current frame, in the corpse's. */
const at = (ctx: Ctx, x: number, y: number): [number, number] => {
  const p = (corpseFrame ? corpseFrame.inverse().multiply(ctx.getTransform()) : ctx.getTransform()).transformPoint(new DOMPoint(x, y));
  return [p.x, p.y];
};
/** The turn that points +y at the ground, from here (so drips and tongues hang whichever way the frame's turned). */
const fall = (ctx: Ctx) => { const m = ctx.getTransform().inverse(); return Math.atan2(-m.c, m.d); };
/** Nothing of it goes under the snow. */
const aboveGround = (ctx: Ctx) => { ctx.beginPath(); ctx.rect(-400, -400, 800, 400); ctx.clip(); };

export const drawMooseCorpse = (ctx: Ctx, c: MooseCorpse, frame: number) => {
  const age = frame - c.t0;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.facing, 1);
  corpseFrame = ctx.getTransform();
  switch (c.weapon) {
    case 'GUN': gunned(ctx, frame, age); break;
    case 'SHOTGUN': shattered(ctx, frame); break;
    case 'FLAMETHROWER': roasted(ctx, frame); break;
    case 'BOULDER': flattened(ctx, frame); break;
    case 'TSUNAMI': drowned(ctx, frame); break;
    case 'NEEDLES': overdosed(ctx, frame); break;
    case 'TASER': fried(ctx, frame); break;
    case 'SLUDGE': dissolved(ctx, frame); break;
    case 'OIL_ROCKET': blownInHalf(ctx, frame); break;
    default: gunned(ctx, frame, age);
  }
  ctx.restore();
  corpseFrame = null;
};

const pool = (ctx: Ctx, w: number, color = BLOOD) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, -1, w, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.ellipse(-w * 0.3, -3, w * 0.3, 2, 0, 0, Math.PI * 2); ctx.fill();
};

/** The tongue lolling out of a corner of the mouth, hanging whichever way's down. */
const tongue = (ctx: Ctx, x: number, y: number, len = 14, color = '#E11D48') => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(fall(ctx));
  ink(ctx, () => { ctx.moveTo(-3, 0); ctx.lineTo(-3.8, len - 5); ctx.quadraticCurveTo(-3, len + 1, 0.4, len + 1); ctx.quadraticCurveTo(4, len, 3.8, len - 5); ctx.lineTo(3, 0); }, color, 0.9);
  ctx.fillStyle = lite(color, 0.3); ctx.fillRect(-2.6, 1, 1.2, len - 6);
  ctx.fillStyle = dark(color, 0.35); ctx.fillRect(0, 2, 0.9, len - 6); // (the groove)
  ctx.restore();
};

/** The eye shut in an X (head's frame). */
const xEye = (ctx: Ctx) => {
  ink(ctx, () => ctx.ellipse(84, -80, 4.6, 3.6, 0, 0, Math.PI * 2), dark(FUR, 0.15), 1);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(81.4, -82.6); ctx.lineTo(86.6, -77.4); ctx.moveTo(86.6, -82.6); ctx.lineTo(81.4, -77.4); ctx.stroke();
};
/** X eye, tongue out. */
const deadFace = (ctx: Ctx) => { xEye(ctx); tongue(ctx, 99, -55); };

/** The head and both antlers on their own, chin down on the snow (corpse's frame, the neck's root about x = 60, y = -50, resting on its bell,
 *  the snout toward +x); `onHead` in the head's frame. */
const lyingHead = (ctx: Ctx, frame: number, onHead: (c: Ctx) => void, mouth = 0.6) => {
  ctx.save(); ctx.translate(24, 30); ctx.translate(48, -80); ctx.rotate(0.2); ctx.translate(-48, 80);
  antler(ctx, true);
  head(ctx, { ...deadPose, mouth, onHead }, frame);
  antler(ctx, false);
  ctx.restore();
};

/** Over on its back, legs stiff in the air: rolled so the rump and hump both rest on the snow, the neck wrung round so
 *  the head lies the right way up on the snow by its shoulder. `after` draws on it in the body's frame. */
const BELLY_UP = Math.PI + 0.18;
const bellyUp = (ctx: Ctx, frame: number, o: { filter?: string; onBody?: (c: Ctx) => void; onHead?: (c: Ctx) => void; after?: (c: Ctx) => void } = {}) => {
  ctx.save();
  aboveGround(ctx);
  ctx.filter = o.filter ?? 'none';
  ctx.save(); ctx.scale(-1, 1); lyingHead(ctx, frame, o.onHead ?? deadFace); ctx.restore();
  ctx.translate(0, -93);
  ctx.rotate(BELLY_UP);
  drawMooseBody(ctx, { ...deadPose, noHead: true, onBody: o.onBody }, frame);
  ctx.filter = 'none';
  o.after?.(ctx);
  ctx.restore();
};

/** A bullet hole, still oozing down whichever way's down. */
const hole = (ctx: Ctx, x: number, y: number, frame: number, i: number) => {
  ctx.save(); ctx.translate(x, y); ctx.rotate(fall(ctx));
  const run = 5 + ((frame / 3 + i * 5) % 8);
  ctx.fillStyle = BLOOD; ctx.fillRect(-1.2, 0, 2.4, run);
  ctx.fillStyle = BLOOD_BRIGHT; ctx.fillRect(-0.6, 0, 1, run - 1);
  ink(ctx, () => ctx.arc(0, run, 1.7, 0, Math.PI * 2), BLOOD_BRIGHT, 0.6);
  ink(ctx, () => ctx.arc(0, 0, 3.4, 0, Math.PI * 2), BLOOD, 0.9);
  ctx.fillStyle = '#1C0505'; ctx.beginPath(); ctx.arc(0.4, 0.4, 1.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = lite(BLOOD_BRIGHT, 0.3); ctx.fillRect(-2, -2, 1.2, 1.2);
  ctx.restore();
};
/** Where the rounds went in (body's frame): belly, flank, shoulder, haunch, clear of the near legs. */
const GUN_HOLES: [number, number][] = [[-48, -50], [-20, -42], [-6, -50], [10, -40], [-22, -62], [2, -66], [20, -56], [52, -64]];

const gunned = (ctx: Ctx, frame: number, age: number) => {
  pool(ctx, 60 + Math.min(40, age * 0.3));
  bellyUp(ctx, frame, { onBody: c => GUN_HOLES.forEach(([x, y], i) => hole(c, x, y, frame, i)) });
};

/** A frozen piece of it: the hide (lit from above) round the broken faces, meat with its fat and a bone through it,
 *  all of it rimed and glazed in ice. */
const ICE = '#BFDBFE';
const chunk = (ctx: Ctx, x: number, outline: number[][], meats: number[][][], bones: number[][], mane = false) => {
  ctx.save(); ctx.translate(x, 0);
  const poly = (pts: number[][]) => () => { pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); };
  const out = poly(outline);
  const ys = outline.map(p => p[1]), xs = outline.map(p => p[0]);
  const top = Math.min(...ys), l = Math.min(...xs), w = Math.max(...xs) - l;
  // (the rime round it)
  ctx.beginPath(); out(); ctx.strokeStyle = ICE; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  shadedTop(ctx, out, FUR, l, top, w, -top, 1.4);
  if (mane) {
    const t = outline.filter(p => p[1] < top + 6), x0 = t[0][0], x1 = t[t.length - 1][0];
    ink(ctx, () => { ctx.moveTo(x0, top + 2); for (let i = 0; i < 6; i++) { const px = x0 + i * (x1 - x0) / 6; ctx.lineTo(px + 2, top - 5 + (i % 2) * 2); ctx.lineTo(px + (x1 - x0) / 6, top + 2); } ctx.closePath(); }, '#24160C', 1);
  }
  for (const m of meats) {
    ink(ctx, poly(m), '#A3202A', 1);
    ctx.save(); ctx.beginPath(); poly(m)(); ctx.clip();
    const mx = m.reduce((s, p) => s + p[0], 0) / m.length, my = m.reduce((s, p) => s + p[1], 0) / m.length;
    ctx.fillStyle = lite('#A3202A', 0.2); ctx.fillRect(mx - 8, my - 30, 4, 60);
    ctx.fillStyle = '#EBD3C2'; ctx.fillRect(mx - 6, my - 8, 10, 1.4); ctx.fillRect(mx - 3, my + 5, 8, 1.4); // (the fat)
    ctx.restore();
  }
  for (const [bx, by, r] of bones) {
    ink(ctx, () => ctx.arc(bx, by, r, 0, Math.PI * 2), '#EFE6D2', 1);
    ctx.fillStyle = '#8F1D2C'; ctx.beginPath(); ctx.arc(bx + 0.4, by + 0.4, r * 0.45, 0, Math.PI * 2); ctx.fill();
  }
  // The glaze: the ice over the lot, lit along the top in a step, a frost of glints
  ctx.save(); ctx.beginPath(); out(); ctx.clip();
  ctx.fillStyle = 'rgba(191, 219, 254, 0.16)'; ctx.fillRect(l, top, w, -top);
  ctx.fillStyle = 'rgba(240, 249, 255, 0.45)'; ctx.fillRect(l, top, w, 3);
  ctx.fillStyle = '#F0F9FF';
  for (let i = 0; i < 5; i++) ctx.fillRect(l + 4 + ((i * 13) % (w - 6)), top + 6 + ((i * 7) % Math.max(4, -top - 10)), 1.4, 1.4);
  ctx.restore();
  ctx.beginPath(); out(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
};

const shattered = (ctx: Ctx, frame: number) => {
  pool(ctx, 90, 'rgba(127, 16, 16, 0.7)');
  ctx.save(); aboveGround(ctx);
  // Rump (its tail), barrel (its ribs), hump (its mane), each standing where it fell
  ink(ctx, () => { ctx.moveTo(-126, -26); ctx.quadraticCurveTo(-134, -24, -132, -14); ctx.lineTo(-126, -16); ctx.closePath(); }, FUR_DARK, 1.1);
  chunk(ctx, -100, [[-24, 0], [-27, -13], [-21, -27], [-8, -34], [6, -33], [14, -26], [18, -18], [13, -11], [19, -5], [16, 0]],
    [[[14, -26], [18, -18], [13, -11], [19, -5], [16, 0], [7, 0], [9, -9], [5, -18]]], [[11, -14, 3.6]]);
  chunk(ctx, -46, [[-24, 0], [-28, -8], [-24, -18], [-28, -28], [-16, -38], [2, -41], [20, -37], [26, -28], [22, -20], [28, -12], [24, 0]],
    [[[-24, 0], [-28, -8], [-24, -18], [-28, -28], [-19, -28], [-16, -18], [-19, -8], [-16, 0]], [[26, -28], [22, -20], [28, -12], [24, 0], [16, 0], [18, -12], [14, -22]]],
    [[22, -24, 2.2], [22, -14, 2.2], [20, -5, 2.2]]);
  chunk(ctx, 6, [[-22, 0], [-26, -10], [-21, -22], [-25, -32], [-12, -42], [6, -46], [22, -40], [28, -26], [26, -12], [22, 0]],
    [[[-22, 0], [-26, -10], [-21, -22], [-25, -32], [-16, -30], [-13, -20], [-16, -8], [-14, 0]]], [[-18, -19, 4]], true);
  // The head, chin down in the snow, the neck broken off clean (meat and the bone in it), frosted over
  lyingHead(ctx, frame, c => {
    xEye(c); tongue(c, 99, -55, 10);
    ink(c, () => c.ellipse(36, -77, 5, 18, 0.1, 0, Math.PI * 2), '#A3202A', 1);
    ink(c, () => c.arc(36.5, -78, 3.6, 0, Math.PI * 2), '#EFE6D2', 1);
    c.fillStyle = 'rgba(191, 219, 254, 0.22)'; c.beginPath(); c.moveTo(34, -96); c.lineTo(102, -78); c.lineTo(112, -62); c.lineTo(70, -56); c.lineTo(38, -58); c.closePath(); c.fill();
  }, 0.4);
  // A leg, snapped at the knee, lying in front
  ctx.save(); ctx.translate(-76, -5.6); ctx.rotate(-Math.PI / 2); shin(ctx, false); ctx.restore();
  ink(ctx, () => ctx.ellipse(-77, -5.6, 2.4, 5, 0, 0, Math.PI * 2), '#A3202A', 0.9);
  ctx.restore();
  // Ice shards glinting
  for (let i = 0; i < 9; i++) {
    const x = -96 + i * 23, h = 8 + (i % 3) * 4;
    ink(ctx, () => { ctx.moveTo(x, 0); ctx.lineTo(x + 3, -h); ctx.lineTo(x + 7, 0); ctx.closePath(); }, '#E0F2FE', 0.8);
    ctx.fillStyle = (frame + i * 9) % 40 < 4 ? '#FFFFFF' : '#F0F9FF'; ctx.fillRect(x + 2.4, -h + 3, 1, h - 4);
  }
};

const roasted = (ctx: Ctx, frame: number) => {
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(0, -2, 90, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Charred where it stood: dropped to its front knees, the hind legs locked, the head hung, the whole thing blackened;
  // a hole burnt through its flank to the ribs, the antlers still alight
  let flames: [number, number][] = [[40, -130], [60, -130]];
  ctx.save(); aboveGround(ctx); ctx.filter = 'brightness(0.18) sepia(1) contrast(1.6)';
  drawMooseBody(ctx, {
    ...deadPose, tilt: 0.23, pivotX: -32, head: 0.4, mouth: 0.3, fold: [-0.23, 1.57, -0.23, 0],
    onBody: c => {
      c.save(); c.filter = 'none';
      ink(c, () => c.ellipse(-8, -58, 20, 13, 0, 0, Math.PI * 2), '#F97316', 1.2);
      c.fillStyle = '#FDE047'; c.beginPath(); c.ellipse(-9, -59, 17, 10.5, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#1C0A04'; c.beginPath(); c.ellipse(-8, -58, 15, 9.5, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.beginPath(); c.ellipse(-8, -58, 15, 9.5, 0, 0, Math.PI * 2); c.clip();
      for (let i = 0; i < 5; i++) {
        const x = -20 + i * 6;
        c.beginPath(); c.moveTo(x, -70); c.quadraticCurveTo(x + 4, -58, x + 1, -46);
        c.strokeStyle = INK; c.lineWidth = 3.4; c.stroke();
        c.strokeStyle = '#E7E5E4'; c.lineWidth = 2; c.stroke();
      }
      c.restore();
      // (embers in the cracks of the hide)
      for (let i = 0; i < 9; i++) { c.fillStyle = (frame + i * 7) % 20 < 10 ? '#F97316' : '#FDE047'; c.fillRect(-60 + i * 13, -76 + ((i * 13) % 26), 3, 1.6); }
      c.restore();
    },
    onHead: c => { flames = [at(c, 44, -128), at(c, 60, -134)]; },
  }, frame);
  ctx.restore();
  // The antlers still burning, on them
  const [[ax, ay], [bx, by]] = flames;
  drawFlameLicks(ctx, (ax + bx) / 2, (ay + by) / 2 + 6, 40, 30, frame, { seed: 21, n: 6 });
  // Smoke off them
  for (let i = 0; i < 5; i++) {
    const k = ((frame * 0.6 + i * 40) % 120) / 120;
    ctx.fillStyle = `rgba(40,40,40,${0.5 - k * 0.45})`;
    ctx.beginPath(); ctx.arc(ax - 10 + i * 6 + k * 20, ay - 20 - k * 100, 8 + k * 16, 0, Math.PI * 2); ctx.fill();
  }
};

const flattened = (ctx: Ctx, frame: number) => {
  // Blood squirted out both sides
  ctx.fillStyle = BLOOD;
  ctx.beginPath(); ctx.ellipse(0, -2, 120, 9, 0, 0, Math.PI * 2); ctx.fill();
  for (const d of [-1, 1]) for (let i = 0; i < 5; i++) { ctx.fillRect(d * (70 + i * 14), -6 - (i % 2) * 5, 8, 4); }
  // The legs splayed out from under it
  for (const [x, a] of [[-58, 1.45], [-44, 1.5], [30, -1.5], [44, -1.45]] as [number, number][]) { ctx.save(); ctx.translate(x, -8); ctx.rotate(a); shin(ctx, x > 0); ctx.restore(); }
  // The moose pressed flat, antlers and all, its head out from under
  ctx.save(); ctx.translate(0, -1); ctx.scale(1.25, 0.24); drawMooseBody(ctx, { ...deadPose, head: 0, mouth: 0.9 }, frame); ctx.restore();
  // The eye popped out onto the snow on its stalk, the tongue squeezed out flat
  ink(ctx, () => ctx.ellipse(105, -19, 3, 1.6, 0, 0, Math.PI * 2), '#1C0505', 0.8);
  ctx.strokeStyle = BLOOD; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(105, -19); ctx.quadraticCurveTo(112, -16, 114, -6); ctx.stroke();
  ink(ctx, () => ctx.arc(115, -4, 3.6, 0, Math.PI * 2), '#F5F5F4', 0.9);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(116.4, -4, 1.4, 0, Math.PI * 2); ctx.fill();
  ink(ctx, () => ctx.ellipse(136, -3, 10, 2.6, 0, 0, Math.PI * 2), '#E11D48', 0.9);
  // The boulder that did it: stone in steps (lit upper left), its crack, its cap of snow
  const rock = () => ctx.ellipse(-4, -46, 56, 44, 0, 0, Math.PI * 2);
  ctx.save(); ctx.beginPath(); rock(); ctx.clip();
  ctx.fillStyle = '#6B645C'; ctx.fillRect(-60, -90, 112, 88);
  ctx.fillStyle = '#7C746A'; ctx.beginPath(); ctx.ellipse(-14, -58, 40, 30, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8E867B'; ctx.beginPath(); ctx.ellipse(-22, -66, 22, 14, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#524C45'; ctx.beginPath(); ctx.ellipse(16, -16, 50, 24, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.beginPath(); rock(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = '#3F3A34'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-20, -80); ctx.lineTo(-6, -58); ctx.lineTo(10, -64); ctx.moveTo(-6, -58); ctx.lineTo(-10, -44); ctx.stroke();
  ink(ctx, () => { ctx.moveTo(-34, -84); ctx.quadraticCurveTo(-6, -96, 22, -84); ctx.quadraticCurveTo(8, -80, -6, -82); ctx.quadraticCurveTo(-22, -80, -34, -84); }, '#F8FAFC', 1.2); // snow cap
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-14, -83, 18, 1.4);
};

const drowned = (ctx: Ctx, frame: number) => {
  pool(ctx, 110, 'rgba(56, 189, 248, 0.45)');
  // Bloated and belly up, blue round the edges: the belly swollen like a drum, the eyes bulging, the tongue fat
  let belly: [number, number] = [0, -80];
  bellyUp(ctx, frame, {
    filter: 'hue-rotate(160deg) saturate(0.5) brightness(0.8)',
    onBody: c => {
      c.save(); c.filter = 'none';
      ink(c, () => c.ellipse(-6, -40, 42, 17, 0, 0, Math.PI * 2), '#7D8DA3', 1.4);
      c.fillStyle = '#93A3B8'; c.beginPath(); c.ellipse(-6, -34, 36, 9, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#B4C2D3'; c.beginPath(); c.ellipse(-10, -29, 22, 3.4, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#5E6E84'; for (const x of [-26, -6, 14]) c.fillRect(x, -48, 1, 6); // (the stretch marks)
      c.restore();
      belly = at(c, -6, -23);
    },
    onHead: c => {
      c.save(); c.filter = 'none';
      ink(c, () => c.arc(85, -80, 6, 0, Math.PI * 2), '#F5F5F4', 1.1);
      c.fillStyle = INK; c.beginPath(); c.arc(86, -80, 1.6, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#DC2626'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(80, -80); c.lineTo(83, -79); c.moveTo(85, -85); c.lineTo(85, -82); c.stroke();
      tongue(c, 99, -55, 16, '#9F5F86');
      c.restore();
    },
  });
  // A fish flopping on it
  const hop = Math.abs(Math.sin(frame * 0.2)) * 14;
  ctx.save(); ctx.translate(belly[0], belly[1] - 5 - hop); ctx.rotate(Math.sin(frame * 0.4) * 0.5);
  ink(ctx, () => { ctx.moveTo(-10, 0); ctx.lineTo(-18, -6); ctx.lineTo(-17, 6); ctx.closePath(); }, '#64748B', 0.9);
  ink(ctx, () => ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2), '#94A3B8', 1);
  ctx.fillStyle = '#CBD5E1'; ctx.fillRect(-6, 1.4, 12, 1.6);
  ctx.fillStyle = INK; ctx.fillRect(7, -2, 2, 2);
  ctx.restore();
};

const overdosed = (ctx: Ctx, frame: number) => {
  pool(ctx, 60, 'rgba(232, 121, 249, 0.35)');
  // Slumped on its haunches, propped on its forelegs, the head hung, eyes rolled back, twitching; the syringes still in it
  const twitch = frame % 50 < 4 ? Math.sin(frame * 3) * 3 : 0;
  let mouth: [number, number] = [60, -30];
  ctx.save(); aboveGround(ctx); ctx.translate(twitch, 32); ctx.filter = `hue-rotate(${(frame * 4) % 360}deg) saturate(1.5)`;
  drawMooseBody(ctx, {
    ...deadPose, tilt: -0.45, pivotX: -45, head: 1.25, mouth: 0.6, fold: [0.45, 0, -0.62, 2.64],
    onBody: c => {
      c.save(); c.filter = 'none';
      for (const [x, y, a] of [[-58, -78, -0.7], [-22, -84, -0.1], [52, -80, 0.7]] as [number, number, number][]) {
        c.save(); c.translate(x, y); c.rotate(a);
        c.strokeStyle = '#9CA3AF'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 3); c.lineTo(0, -6); c.stroke(); // (the needle, in)
        ink(c, () => c.rect(-2.6, -20, 5.2, 14), '#E5E7EB', 0.9);
        c.fillStyle = '#E879F9'; c.fillRect(-1.6, -14, 3.2, 7.4);
        c.fillStyle = '#F8FAFC'; c.fillRect(-1.6, -19, 1, 4);
        ink(c, () => { c.rect(-0.8, -26, 1.6, 6); c.rect(-3.4, -27.4, 6.8, 1.6); }, '#D1D5DB', 0.7); // (the plunger, pushed)
        c.restore();
      }
      c.restore();
    },
    onHead: c => {
      c.save(); c.filter = 'none';
      ink(c, () => c.ellipse(84, -80, 4.6, 3.6, 0, 0, Math.PI * 2), '#F5F5F4', 1);
      c.fillStyle = '#7C3AED'; c.beginPath(); c.arc(85, -83, 2, 0, Math.PI); c.fill(); // (rolled up)
      c.restore();
      mouth = at(c, 100, -55);
    },
  }, frame);
  ctx.restore();
  // Foam pouring out of its mouth into a heap
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1;
  const [mx, my] = mouth;
  for (let i = 0; i < 7; i++) {
    const k = i / 6, x = mx + Math.sin(i + frame * 0.1) * 3 + k * 4, y = my + (-4 - my) * k;
    ctx.beginPath(); ctx.arc(x, y, 3 + (i % 2) * 1.6 + k * 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
};

/** Bone: a pale line with its ink. */
const bone = (ctx: Ctx, path: () => void, w = 3, col = '#EDE6D6') => {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = w + 1.8; ctx.stroke();
  ctx.beginPath(); path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.lineCap = 'butt';
};

const fried = (ctx: Ctx, frame: number) => {
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(0, -2, 90, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Crisped black; flashing, the skeleton in it shows; the current still arcing hoof to hoof
  const xray = frame % 12 < 3;
  let smoke: [number, number] = [0, -60];
  bellyUp(ctx, frame, {
    filter: xray ? 'invert(1) brightness(2)' : 'grayscale(1) brightness(0.25) contrast(1.6)',
    onHead: c => {
      if (!xray) { xEye(c); return; }
      c.save(); c.filter = 'none';
      // (the skull: the brainpan, the long snout, the socket, the jaw and its teeth)
      const s = '#0F172A';
      c.strokeStyle = s; c.lineWidth = 2.2; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(66, -88); c.lineTo(100, -76); c.quadraticCurveTo(110, -72, 108, -64); c.lineTo(76, -64); c.closePath(); c.stroke();
      c.beginPath(); c.arc(84, -79, 4, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(74, -60); c.lineTo(104, -57); c.stroke();
      c.fillStyle = s; for (let i = 0; i < 4; i++) c.fillRect(88 + i * 4, -62, 2, 2);
      bone(c, () => { c.moveTo(40, -80); c.lineTo(66, -78); }, 3, s);
      c.restore();
    },
    after: c => {
      if (xray) {
        // (spine, ribs, pelvis, the legs' long bones)
        const s = '#0F172A';
        bone(c, () => { c.moveTo(-68, -74); c.quadraticCurveTo(-30, -86, 10, -84); c.quadraticCurveTo(30, -84, 44, -80); }, 3, s);
        for (let i = 0; i < 7; i++) { const x = -30 + i * 9; bone(c, () => { c.moveTo(x, -84); c.quadraticCurveTo(x - 6, -62, x + 3, -40); }, 1.8, s); }
        bone(c, () => c.ellipse(-46, -66, 10, 7, 0.4, 0, Math.PI * 2), 2, s);
        for (const [x, y] of [[22, -46], [36, -44], [-46, -46], [-32, -46]]) bone(c, () => { c.moveTo(x, y); c.lineTo(x, y + 21); c.lineTo(x + 0.4, y + 41); }, 2.4, s);
      } else if (frame % 18 < 9) {
        // (arcs between the upturned hooves)
        const up = fall(c) - Math.PI / 2;
        const ux = -Math.sin(up + Math.PI), uy = Math.cos(up + Math.PI);
        c.strokeStyle = '#67E8F9'; c.lineWidth = 2;
        for (const [x0, x1, k] of [[22, 36, 0], [-46, -32, 1], [-32, 22, 2]]) {
          c.beginPath(); c.moveTo(x0, 0);
          for (let s = 1; s <= 5; s++) {
            const u = s / 5, b = Math.sin(u * Math.PI) * Math.abs(x1 - x0) * 0.3 + Math.sin(frame + k * 5 + s) * 3;
            c.lineTo(x0 + (x1 - x0) * u + ux * b, uy * b);
          }
          c.strokeStyle = '#67E8F9'; c.lineWidth = 2; c.stroke();
          c.strokeStyle = '#ECFEFF'; c.lineWidth = 0.8; c.stroke();
        }
      }
      smoke = at(c, -4, -36);
    },
  });
  // Smoke
  for (let i = 0; i < 4; i++) { const k = ((frame * 0.5 + i * 30) % 100) / 100; ctx.fillStyle = `rgba(60,60,60,${0.45 - k * 0.4})`; ctx.beginPath(); ctx.arc(smoke[0] - 14 + i * 10, smoke[1] - 6 - k * 90, 7 + k * 12, 0, Math.PI * 2); ctx.fill(); }
};

const dissolved = (ctx: Ctx, frame: number) => {
  // Green puddle bubbling, what's left of it sunk in it where it stood: spine and ribs, the hips, a leg's bones, the
  // hooves (they don't melt), the skull at the front still wearing its antlers
  ctx.fillStyle = '#3F6212'; ctx.beginPath(); ctx.ellipse(0, -4, 112, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(0, -4, 104, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(-10, -7, 80, 6, 0, 0, Math.PI * 2); ctx.fill();
  // (the far antler, the skull, the near antler, at the front where the head was)
  ctx.save(); ctx.translate(0, 50);
  antler(ctx, true);
  const skull = () => { ctx.moveTo(62, -90); ctx.lineTo(100, -77); ctx.quadraticCurveTo(112, -72, 110, -62); ctx.lineTo(104, -56); ctx.lineTo(72, -58); ctx.closePath(); };
  shadedTop(ctx, skull, '#EDE6D6', 62, -90, 50, 34, 1.2);
  ink(ctx, () => ctx.ellipse(84, -78, 5, 4, 0, 0, Math.PI * 2), '#1C1917', 0.8);
  ink(ctx, () => ctx.ellipse(106, -66, 3, 4.4, 0.3, 0, Math.PI * 2), '#1C1917', 0.8);
  ctx.fillStyle = '#F8FAFC'; for (let i = 0; i < 5; i++) ctx.fillRect(84 + i * 4, -58, 2.4, 2.4);
  antler(ctx, false);
  ctx.restore();
  // (neck and spine sagging into it, the ribs over, the hips)
  bone(ctx, () => { ctx.moveTo(-70, -12); ctx.quadraticCurveTo(-20, -24, 34, -14); ctx.quadraticCurveTo(52, -12, 64, -8); });
  ctx.fillStyle = '#C9BFA8'; for (let i = 0; i < 14; i++) ctx.fillRect(-66 + i * 9, -17 - Math.sin((i / 13) * Math.PI) * 4, 1.4, 4);
  for (let i = 0; i < 7; i++) { const x = -38 + i * 11, h = 26 - Math.abs(i - 3) * 3; bone(ctx, () => { ctx.moveTo(x, -18); ctx.quadraticCurveTo(x + 3, -18 - h * 1.4, x + 10, -6); }, 2.2); }
  bone(ctx, () => ctx.ellipse(-58, -18, 10, 6, -0.3, 0, Math.PI * 2), 2.4);
  // (a leg's bones up out of it, a hoof on the end; another hoof just lying there)
  bone(ctx, () => { ctx.moveTo(-50, -8); ctx.lineTo(-74, -26); ctx.lineTo(-92, -14); }, 3);
  ctx.save(); ctx.translate(-92, -14); ctx.rotate(2.2); ink(ctx, () => ctx.roundRect(-5.4, -1, 10.8, 5.4, [1.4, 1.4, 2, 2]), HOOF, 1); ctx.restore();
  bone(ctx, () => { ctx.moveTo(30, -8); ctx.lineTo(44, -30); }, 3);
  ink(ctx, () => ctx.roundRect(48, -9, 10.8, 5.4, [1.4, 1.4, 2, 2]), HOOF, 1);
  // The goo's near lip, over their feet
  ctx.save(); ctx.beginPath(); ctx.rect(-120, -7, 240, 20); ctx.clip();
  ctx.fillStyle = 'rgba(101, 163, 13, 0.92)'; ctx.beginPath(); ctx.ellipse(0, -4, 104, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#A3E635'; ctx.fillRect(-60, -6, 40, 1.4); ctx.fillRect(10, -5.6, 30, 1.4);
  ctx.restore();
  // Bubbles
  for (let i = 0; i < 6; i++) { const b = Math.sin(frame * 0.2 + i * 1.7); if (b > 0) { ink(ctx, () => ctx.arc(-80 + i * 32, -8 - b * 6, 2 + b * 3.4, 0, Math.PI * 2), '#BEF264', 0.8); ctx.fillStyle = '#ECFCCB'; ctx.fillRect(-81 + i * 32 - b, -10 - b * 7, 1.4, 1.4); } }
};

/** Where it tore (body's frame): ragged, top to bottom between the shoulder and the haunch. */
const TEAR: [number, number][] = [[-6, -116], [-10, -100], [-4, -92], [-12, -84], [-5, -76], [-11, -66], [-3, -58], [-10, -50], [-4, -42], [-12, -34], [-6, -26], [-8, 40]];
/** One half: `side` -1 the back half, 1 the front; the raw end along the tear, its spine and ribs, dripping. */
const half = (ctx: Ctx, side: -1 | 1, pose: Pose, frame: number) => {
  const tear = (dx: number, start: boolean) => TEAR.forEach(([x, y], i) => (start && !i ? ctx.moveTo(x + dx, y) : ctx.lineTo(x + dx, y)));
  ctx.save();
  ctx.beginPath(); ctx.moveTo(side * 300, -200); tear(0, false); ctx.lineTo(side * 300, 40); ctx.closePath(); ctx.clip();
  drawMooseBody(ctx, pose, frame);
  // The meat along the tear, and the dark inside it
  ctx.save(); ctx.beginPath(); hidePath(ctx); ctx.clip();
  ctx.beginPath(); tear(0, true); for (let i = TEAR.length - 1; i >= 0; i--) ctx.lineTo(TEAR[i][0] + side * 9, TEAR[i][1]); ctx.closePath();
  ctx.fillStyle = BLOOD_BRIGHT; ctx.fill();
  ctx.beginPath(); tear(0, true); for (let i = TEAR.length - 1; i >= 0; i--) ctx.lineTo(TEAR[i][0] + side * 3.4, TEAR[i][1]); ctx.closePath();
  ctx.fillStyle = '#4A0808'; ctx.fill();
  ctx.fillStyle = lite(BLOOD_BRIGHT, 0.25); for (const y of [-80, -62, -46]) ctx.fillRect(-9 + side * 6, y, 2, 4);
  ctx.restore();
  ctx.restore();
  // (the spine and a rib or two, snapped, poking out; the blood running off it)
  bone(ctx, () => { ctx.moveTo(-8 + side * 6, -82); ctx.lineTo(-8 - side * 4, -84); }, 3.4);
  bone(ctx, () => { ctx.moveTo(-6 + side * 6, -60); ctx.lineTo(-6 - side * 3, -63); ctx.moveTo(-9 + side * 6, -48); ctx.lineTo(-9 - side * 2, -50); }, 1.8);
  ctx.save(); ctx.translate(-8, -34); ctx.rotate(fall(ctx));
  const run = 4 + ((frame / 4 + (side + 1) * 3) % 6);
  ctx.fillStyle = BLOOD_BRIGHT; ctx.fillRect(-1, 0, 2, run); ctx.beginPath(); ctx.arc(0, run, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

const blownInHalf = (ctx: Ctx, frame: number) => {
  pool(ctx, 120, '#0B0705');
  pool(ctx, 60, BLOOD);
  // Blown in two, both halves down on their bellies: the back half where it was, hind legs kicked out straight; the front
  // thrown on ahead, forelegs folded, its head down on the snow. The guts strung out on the snow between
  const LIE: [number, number, number, number] = [-1.2, 2.77, 1.4, 0];
  ctx.save(); aboveGround(ctx);
  ctx.save(); ctx.translate(-42, 32); half(ctx, -1, { ...deadPose, fold: LIE }, frame); ctx.restore();
  ctx.save(); ctx.translate(44, 32); half(ctx, 1, { ...deadPose, fold: LIE, head: 0.5, onHead: deadFace }, frame); ctx.restore();
  ctx.restore();
  // The guts: tubes inked, lit along the top, sagging to the snow
  const sway = Math.sin(frame * 0.1) * 2;
  const gut = (path: () => void, w: number, col: string) => {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); path(); ctx.strokeStyle = INK; ctx.lineWidth = w + 2; ctx.stroke();
    ctx.beginPath(); path(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    ctx.save(); ctx.translate(0, -w * 0.25); ctx.beginPath(); path(); ctx.strokeStyle = lite(col, 0.35); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    ctx.lineCap = 'butt';
  };
  gut(() => { ctx.moveTo(-50, -20); ctx.bezierCurveTo(-36, 0, -20, -4 + sway, -8, -5); ctx.bezierCurveTo(4, -6, 10, -2, 22, -4); ctx.bezierCurveTo(30, -6, 34, -14, 38, -22); }, 4.6, '#C2566B');
  gut(() => { ctx.moveTo(-50, -38); ctx.bezierCurveTo(-30, -36, -34, -8, -20, -6); ctx.bezierCurveTo(-8, -4, -6, -16, 6, -14 + sway); ctx.bezierCurveTo(18, -12, 24, -40, 38, -44); }, 3.4, '#D9798A');
  // (a coil of it heaped on the snow)
  for (const [x, w] of [[-14, 7], [-4, 8], [6, 6]] as [number, number][]) gut(() => ctx.ellipse(x, -4.6, w, 3, 0, Math.PI, Math.PI * 2), 3.4, '#C2566B');
  // Oil sheen
  ctx.fillStyle = `hsla(${(frame * 3) % 360}, 70%, 60%, 0.4)`; ctx.fillRect(-70, -4, 30, 2);
};

// ---------------------------------------------------------------------------

/** Health bar across the top while the fight's on. */
/** The health bar's span across the top of the screen. */
const HUD_LEFT = 330, HUD_RIGHT = 780;

export const drawMooseHud = (ctx: Ctx, state: GameState, fight: MooseFight) => {
  if (fight.phase !== 'intro' && fight.phase !== 'fight') return;
  const m = fight.moose;
  if (!m) return;
  const fill = fight.phase === 'intro' ? Math.min(1, fight.t / 70) : Math.max(0, m.health / MOOSE_HP);
  ctx.save();
  // (top right, clear of the player's panel in the top left)
  const L = HUD_LEFT, R = HUD_RIGHT;
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(L - 10, 12, R - L + 20, 40);
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.strokeRect(L - 10, 12, R - L + 20, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FDE68A'; ctx.textAlign = 'left';
  ctx.fillText('THE MOOSE', L, 28);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.textAlign = 'right';
  ctx.fillText('EXTREMELY TERRITORIAL', R, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L, 34, R - L, 10);
  ctx.fillStyle = fight.hpFlash > 0 ? '#FEF3C7' : (m.health < MOOSE_HP * 0.5 ? '#DC2626' : '#B45309');
  ctx.fillRect(L, 34, (R - L) * fill, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = L; x < R; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
};
