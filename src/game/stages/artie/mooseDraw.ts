// The moose: a huge bull with palmate antlers, a hump, a bell under its chin and
// long pale-stockinged legs. Drawn facing right from its feet, then flipped.
// Plus what's left of it, depending on what killed it, and its health bar.

import type { Enemy } from '../../../types';
import type { GameState } from '../../state';
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
}

const livePose = (m: Enemy, frame: number): Pose => {
  const t = m.aiTimer || 0;
  const running = Math.abs(m.vel.x) > 0.5;
  const base: Pose = { legPhase: running ? frame * 0.32 : 0, legSwing: running ? Math.min(1, Math.abs(m.vel.x) / 9) : 0, tilt: 0, pivotX: -45, head: 0, kick: false, rear: false, mouth: 0, eye: '#1C1917' };
  switch (m.aiState) {
    case 'charge': return { ...base, head: 0.42, eye: '#DC2626', mouth: 0.2 };
    case 'paw': return { ...base, head: 0.3 + Math.sin(frame * 0.15) * 0.05, eye: '#DC2626' };
    case 'skid': return { ...base, tilt: -0.08, pivotX: -45, head: 0.2, legSwing: 0 };
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

/** The whole animal in a pose, local frame: feet at y = 0, facing +x. */
const drawMooseBody = (ctx: Ctx, pose: Pose, frame: number) => {
  ctx.save();
  // Body tilt around the rear or front feet
  ctx.translate(pose.pivotX, 0);
  ctx.rotate(pose.tilt);
  ctx.translate(-pose.pivotX, 0);

  // Far legs (darker)
  legs(ctx, pose, true);
  // Far antler behind the head
  ctx.save(); headTransform(ctx, pose); antler(ctx, true); ctx.restore();

  // Rump, barrel, and the big shoulder hump
  ctx.fillStyle = FUR;
  ctx.beginPath(); ctx.ellipse(-42, -62, 30, 25, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-4, -60, 52, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = FUR_DARK;
  ctx.beginPath(); ctx.ellipse(28, -74, 34, 26, -0.2, 0, Math.PI * 2); ctx.fill();
  // Shaggy hump ridge and belly shading
  ctx.fillStyle = '#24160C';
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(8 + i * 7, -96 + Math.abs(i - 3) * 2); ctx.lineTo(12 + i * 7, -104 + Math.abs(i - 3) * 2.5); ctx.lineTo(15 + i * 7, -95 + Math.abs(i - 3) * 2); ctx.fill(); }
  ctx.fillStyle = FUR_LIGHT;
  ctx.beginPath(); ctx.ellipse(-8, -70, 36, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(-4, -40, 44, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Stubby tail
  ctx.fillStyle = FUR_DARK; ctx.fillRect(-72, -74, 6, 10);

  // Near legs
  legs(ctx, pose, false);

  // Neck, head, bell, near antler
  ctx.save();
  headTransform(ctx, pose);
  head(ctx, pose, frame);
  antler(ctx, false);
  ctx.restore();
  ctx.restore();
};

/** Head pivots around the top of the neck. */
const headTransform = (ctx: Ctx, pose: Pose) => {
  ctx.translate(48, -80);
  ctx.rotate(pose.head);
  ctx.translate(-48, 80);
};

const head = (ctx: Ctx, pose: Pose, _frame: number) => {
  // Thick neck
  ctx.fillStyle = FUR_DARK;
  ctx.beginPath(); ctx.moveTo(34, -96); ctx.quadraticCurveTo(70, -94, 78, -82); ctx.lineTo(70, -56); ctx.quadraticCurveTo(52, -52, 38, -58); ctx.fill();
  // The bell: a hairy flap hanging under the throat
  ctx.fillStyle = '#241509';
  ctx.beginPath(); ctx.moveTo(62, -58); ctx.quadraticCurveTo(58, -38, 64, -30); ctx.quadraticCurveTo(70, -40, 70, -58); ctx.fill();
  // Long head and the big overhanging nose
  ctx.fillStyle = FUR;
  ctx.beginPath(); ctx.moveTo(66, -92); ctx.lineTo(102, -78); ctx.quadraticCurveTo(114, -74, 112, -62); ctx.lineTo(106, -54); ctx.lineTo(72, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = FUR_LIGHT;
  ctx.beginPath(); ctx.ellipse(106, -66, 10, 9, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.ellipse(111, -65, 2.5, 3.5, 0.3, 0, Math.PI * 2); ctx.fill(); // nostril
  // Mouth (open when it bellows)
  if (pose.mouth > 0.05) {
    ctx.fillStyle = '#3F0A0A';
    ctx.beginPath(); ctx.moveTo(98, -56); ctx.lineTo(110, -56); ctx.lineTo(104, -56 + pose.mouth * 12); ctx.fill();
    ctx.fillStyle = '#E11D48'; ctx.fillRect(100, -56 + pose.mouth * 6, 6, 3);
  }
  // Ear and angry eye with a heavy brow
  ctx.fillStyle = FUR_DARK;
  ctx.beginPath(); ctx.moveTo(66, -90); ctx.lineTo(56, -102); ctx.lineTo(70, -94); ctx.fill();
  ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.ellipse(84, -80, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = pose.eye; ctx.beginPath(); ctx.arc(85, -80, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1C1917'; ctx.beginPath(); ctx.moveTo(78, -86); ctx.lineTo(92, -82); ctx.lineTo(92, -85); ctx.fill();
};

/** A broad palmate antler with tines along the top edge. */
const antler = (ctx: Ctx, far: boolean) => {
  ctx.save();
  ctx.translate(far ? 64 : 70, -92);
  ctx.scale(far ? 0.9 : 1, 1);
  ctx.fillStyle = far ? ANTLER_DARK : ANTLER;
  ctx.strokeStyle = far ? '#7A6A4C' : '#8C7A57'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -10, -30, -14);      // beam back
  ctx.lineTo(-48, -30);                           // the palm sweeping up and back
  // tines along the rim
  const tines: [number, number][] = [[-50, -44], [-40, -40], [-34, -54], [-24, -46], [-14, -58], [-6, -46], [6, -52], [8, -36]];
  for (const [x, y] of tines) { ctx.lineTo(x, y); ctx.lineTo(x + 5, y + 8); }
  ctx.quadraticCurveTo(10, -18, 4, -2);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  // Brow tine forward
  ctx.beginPath(); ctx.moveTo(2, -4); ctx.lineTo(18, -12); ctx.lineTo(16, -6); ctx.fill();
  ctx.restore();
};

/** Two legs (far or near pair), galloping, rearing or kicking. */
const legs = (ctx: Ctx, pose: Pose, far: boolean) => {
  const fx = far ? 22 : 36, hx = far ? -46 : -32;
  const off = far ? Math.PI : 0;
  const swing = (phase: number) => Math.sin(pose.legPhase + phase + off) * 0.55 * pose.legSwing;
  // Front leg: raised and folded when rearing
  leg(ctx, fx, -44, pose.rear ? -1.1 : swing(0), pose.rear ? 1.3 : 0, far);
  // Hind leg: kicked straight back
  leg(ctx, hx, -46, pose.kick ? 1.35 : swing(Math.PI / 2), 0, far);
};

/** One leg from the hip, swung by `a`, with the lower leg bent by `bend`. */
const leg = (ctx: Ctx, x: number, y: number, a: number, bend: number, far: boolean) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.fillStyle = far ? '#24160C' : FUR_DARK;
  ctx.fillRect(-6, 0, 12, 22);
  ctx.translate(0, 22);
  ctx.rotate(bend);
  ctx.fillStyle = far ? '#9C8C6E' : STOCKING;
  ctx.fillRect(-4, 0, 8, 20);
  ctx.fillStyle = HOOF;
  ctx.fillRect(-5, 18, 10, 5);
  ctx.restore();
};

// ---------------------------------------------------------------------------
// What's left of it
// ---------------------------------------------------------------------------

const deadPose: Pose = { legPhase: 0, legSwing: 0, tilt: 0, pivotX: 0, head: 0.2, kick: false, rear: false, mouth: 0.7, eye: '#1C1917' };

export const drawMooseCorpse = (ctx: Ctx, c: MooseCorpse, frame: number) => {
  const age = frame - c.t0;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(c.facing, 1);
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
};

const pool = (ctx: Ctx, w: number, color = BLOOD) => {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, -1, w, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.ellipse(-w * 0.3, -3, w * 0.3, 2, 0, 0, Math.PI * 2); ctx.fill();
};

/** Belly up, legs stiff in the air, full of holes. */
const bellyUp = (ctx: Ctx, frame: number, filter = 'none', lift = 0) => {
  ctx.save();
  // Flipped over: its back on the ground, belly and legs up
  ctx.translate(0, -96 - lift);
  ctx.rotate(Math.PI);
  ctx.filter = filter;
  drawMooseBody(ctx, { ...deadPose, legSwing: 0 }, frame);
  ctx.restore();
};

const xEyes = (ctx: Ctx, x: number, y: number) => {
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke();
};

const gunned = (ctx: Ctx, frame: number, age: number) => {
  pool(ctx, 60 + Math.min(40, age * 0.3));
  bellyUp(ctx, frame);
  // Bullet holes, each still oozing
  const holes: [number, number][] = [[-30, -62], [-6, -74], [14, -58], [32, -70], [-44, -48], [4, -44]];
  for (const [x, y] of holes) {
    ctx.fillStyle = '#1C0505'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = BLOOD_BRIGHT; ctx.fillRect(x - 1, y + 3, 2, 6 + ((frame / 3 + x) % 8));
  }
  // Tongue lolling out, X eye
  ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.ellipse(-104, -30, 9, 4, 0.6, 0, Math.PI * 2); ctx.fill();
  xEyes(ctx, -84, -36);
};

const shattered = (ctx: Ctx, frame: number) => {
  pool(ctx, 90, 'rgba(127, 16, 16, 0.7)');
  // Frozen chunks of moose: fur outside, red meat and white bone at the breaks, rimed in ice
  const chunks: [number, number, number, number, number][] = [[-70, -26, 36, 30, 0.3], [-28, -34, 44, 36, -0.2], [22, -30, 40, 32, 0.4], [64, -22, 30, 24, -0.5], [-4, -12, 26, 14, 0.1]];
  for (const [x, y, w, h, r] of chunks) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r);
    ctx.fillStyle = FUR; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = BLOOD_BRIGHT; ctx.fillRect(-w / 2, h / 2 - 8, w, 8);
    ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-4, h / 2 - 7, 8, 5);
    ctx.fillStyle = 'rgba(191, 219, 254, 0.55)'; ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
    ctx.restore();
  }
  // A leg and the head, snapped off, antler broken
  ctx.save(); ctx.translate(96, -8); ctx.rotate(1.3); ctx.fillStyle = STOCKING; ctx.fillRect(-4, 0, 8, 26); ctx.fillStyle = HOOF; ctx.fillRect(-5, 24, 10, 5); ctx.restore();
  ctx.save(); ctx.translate(-130, 60); ctx.scale(0.9, 0.9); head(ctx, deadPose, frame); antler(ctx, false); ctx.restore();
  // Ice shards glinting
  ctx.fillStyle = '#E0F2FE';
  for (let i = 0; i < 9; i++) { const x = -90 + i * 22; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 4, -8 - (i % 3) * 4); ctx.lineTo(x + 8, 0); ctx.fill(); }
};

const roasted = (ctx: Ctx, frame: number) => {
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(0, -2, 90, 8, 0, 0, Math.PI * 2); ctx.fill();
  // A charred carcass, legs curled: the whole thing blackened
  ctx.save(); ctx.filter = 'brightness(0.18) sepia(1) contrast(1.6)';
  ctx.translate(0, 10); drawMooseBody(ctx, { ...deadPose, tilt: 0.05, rear: true }, frame);
  ctx.restore();
  // Ribs burnt through
  ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-4 + i * 11 - 26, -48, 14, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  // Embers in the cracks
  for (let i = 0; i < 10; i++) { ctx.fillStyle = (frame + i * 7) % 20 < 10 ? '#F97316' : '#FDE047'; ctx.fillRect(-60 + i * 12, -40 - (i * 13) % 28, 3, 2); }
  // The antlers still burning
  for (let i = 0; i < 6; i++) {
    const fx = 30 + i * 8, fy = -150 + Math.sin(frame * 0.3 + i) * 3;
    ctx.fillStyle = i % 2 ? '#F97316' : '#FDE047';
    ctx.beginPath(); ctx.moveTo(fx - 5, fy + 14); ctx.quadraticCurveTo(fx, fy - 12 - (frame + i * 5) % 10, fx + 5, fy + 14); ctx.fill();
  }
  // Smoke
  for (let i = 0; i < 5; i++) {
    const k = ((frame * 0.6 + i * 40) % 120) / 120;
    ctx.fillStyle = `rgba(40,40,40,${0.5 - k * 0.45})`;
    ctx.beginPath(); ctx.arc(-20 + i * 12 + k * 20, -80 - k * 110, 8 + k * 16, 0, Math.PI * 2); ctx.fill();
  }
};

const flattened = (ctx: Ctx, frame: number) => {
  // Blood squirted out both sides
  ctx.fillStyle = BLOOD;
  ctx.beginPath(); ctx.ellipse(0, -2, 120, 9, 0, 0, Math.PI * 2); ctx.fill();
  for (const d of [-1, 1]) for (let i = 0; i < 5; i++) { ctx.fillRect(d * (70 + i * 14), -6 - (i % 2) * 5, 8, 4); }
  // The moose pressed flat, legs splayed out, antlers sticking out from under
  ctx.save(); ctx.translate(0, -2); ctx.scale(1.3, 0.22); drawMooseBody(ctx, { ...deadPose, legSwing: 0 }, frame); ctx.restore();
  ctx.save(); ctx.translate(-20, 4); antler(ctx, false); ctx.restore();
  for (const [x, a] of [[-70, -1.2], [-40, -1.4], [40, 1.3], [70, 1.1]] as [number, number][]) { ctx.save(); ctx.translate(x, -6); ctx.rotate(a); ctx.fillStyle = STOCKING; ctx.fillRect(-4, 0, 8, 26); ctx.fillStyle = HOOF; ctx.fillRect(-5, 24, 10, 5); ctx.restore(); }
  // The boulder that did it
  ctx.fillStyle = '#6B645C'; ctx.beginPath(); ctx.ellipse(0, -46, 56, 44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#857D73'; ctx.beginPath(); ctx.ellipse(-14, -60, 26, 18, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3F3A34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -80); ctx.lineTo(-6, -58); ctx.lineTo(10, -64); ctx.stroke();
  ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.ellipse(-6, -88, 30, 6, 0, 0, Math.PI * 2); ctx.fill(); // snow cap
};

const drowned = (ctx: Ctx, frame: number) => {
  pool(ctx, 110, 'rgba(56, 189, 248, 0.45)');
  // Bloated and belly up, blue around the edges
  ctx.save(); ctx.translate(0, -10); ctx.scale(1.2, 1.25); bellyUp(ctx, frame, 'hue-rotate(160deg) saturate(0.5) brightness(0.8)'); ctx.restore();
  // Belly swollen like a drum, eyes bulging
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'; ctx.beginPath(); ctx.ellipse(0, -78, 44, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.arc(-98, -42, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-98, -42, 2, 0, Math.PI * 2); ctx.fill();
  // A fish flopping on it
  const hop = Math.abs(Math.sin(frame * 0.2)) * 14;
  ctx.save(); ctx.translate(10, -104 - hop); ctx.rotate(Math.sin(frame * 0.4) * 0.5);
  ctx.fillStyle = '#94A3B8'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -6); ctx.lineTo(-18, 6); ctx.fill();
  ctx.fillStyle = '#111'; ctx.fillRect(7, -2, 2, 2);
  ctx.restore();
};

const overdosed = (ctx: Ctx, frame: number) => {
  pool(ctx, 60, 'rgba(232, 121, 249, 0.35)');
  // Slumped on its haunches, head drooped, twitching
  const twitch = frame % 50 < 4 ? Math.sin(frame * 3) * 3 : 0;
  ctx.save(); ctx.translate(twitch, 0); ctx.filter = `hue-rotate(${(frame * 4) % 360}deg) saturate(1.5)`;
  drawMooseBody(ctx, { ...deadPose, tilt: -0.35, pivotX: -45, head: 0.9, rear: false, kick: false }, frame);
  ctx.restore();
  // Foam pouring out of its mouth
  ctx.fillStyle = '#F8FAFC';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(70 + Math.sin(i + frame * 0.1) * 4, -8 - i * 5, 4 + (i % 2) * 2, 0, Math.PI * 2); ctx.fill(); }
  // Syringes still in it
  for (const [x, y, a] of [[-30, -90, -0.4], [0, -104, 0.2], [26, -96, 0.5]] as [number, number, number][]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-2, -18, 5, 16); ctx.fillStyle = '#E879F9'; ctx.fillRect(-1, -14, 3, 10); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(0, -2, 1, 8);
    ctx.restore();
  }
};

const fried = (ctx: Ctx, frame: number) => {
  ctx.fillStyle = '#0C0A09'; ctx.beginPath(); ctx.ellipse(0, -2, 90, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Crisped black, fur standing on end; flashing x-ray skeleton
  const xray = frame % 12 < 3;
  bellyUp(ctx, frame, xray ? 'invert(1) brightness(2)' : 'grayscale(1) brightness(0.25) contrast(1.6)');
  if (xray) {
    ctx.strokeStyle = '#0F172A'; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-26 + i * 11, -62, 14, 0, Math.PI); ctx.stroke(); }
  }
  // Sparks jumping off it
  ctx.strokeStyle = '#67E8F9'; ctx.lineWidth = 2;
  if (frame % 18 < 7) for (let k = 0; k < 3; k++) { let x = -40 + k * 40, y = -110; ctx.beginPath(); ctx.moveTo(x, y); for (let s = 0; s < 4; s++) { x += Math.sin(frame + k * 5 + s) * 8; y -= 8; ctx.lineTo(x, y); } ctx.stroke(); }
  // Smoke
  for (let i = 0; i < 4; i++) { const k = ((frame * 0.5 + i * 30) % 100) / 100; ctx.fillStyle = `rgba(60,60,60,${0.45 - k * 0.4})`; ctx.beginPath(); ctx.arc(-10 + i * 10, -100 - k * 90, 7 + k * 12, 0, Math.PI * 2); ctx.fill(); }
};

const dissolved = (ctx: Ctx, frame: number) => {
  // Green puddle bubbling, with the bones sticking out of it
  ctx.fillStyle = '#4D7C0F'; ctx.beginPath(); ctx.ellipse(0, -4, 110, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.ellipse(-10, -7, 80, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Ribcage and spine
  ctx.strokeStyle = '#F5F5F4'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-60, -34); ctx.lineTo(40, -40); ctx.stroke();
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-50 + i * 13, -36); ctx.quadraticCurveTo(-46 + i * 13, -14, -54 + i * 13, -6); ctx.stroke(); }
  // Skull, still wearing its antlers
  ctx.save(); ctx.translate(-20, 28);
  ctx.fillStyle = '#F5F5F4'; ctx.beginPath(); ctx.moveTo(66, -92); ctx.lineTo(102, -78); ctx.lineTo(108, -62); ctx.lineTo(72, -60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(84, -78, 4, 0, Math.PI * 2); ctx.fill();
  antler(ctx, false);
  ctx.restore();
  // Bubbles
  for (let i = 0; i < 6; i++) { const b = Math.sin(frame * 0.2 + i * 1.7); if (b > 0) { ctx.fillStyle = '#BEF264'; ctx.beginPath(); ctx.arc(-80 + i * 32, -10 - b * 6, 3 + b * 4, 0, Math.PI * 2); ctx.fill(); } }
};

const blownInHalf = (ctx: Ctx, frame: number) => {
  pool(ctx, 120, '#0B0705');
  pool(ctx, 60, BLOOD);
  // Rear half, left behind, and the front half thrown forward; guts strung between
  ctx.save(); ctx.translate(-50, 0); ctx.beginPath(); ctx.rect(-120, -200, 120, 220); ctx.clip();
  drawMooseBody(ctx, { ...deadPose, tilt: 0.1, pivotX: -45 }, frame); ctx.restore();
  ctx.save(); ctx.translate(60, 10); ctx.rotate(0.35); ctx.beginPath(); ctx.rect(0, -200, 160, 220); ctx.clip();
  drawMooseBody(ctx, { ...deadPose, head: 0.6 }, frame); ctx.restore();
  // The torn ends
  ctx.fillStyle = BLOOD_BRIGHT; ctx.fillRect(-54, -86, 8, 50); ctx.fillRect(56, -70, 8, 46);
  ctx.strokeStyle = '#BE123C'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-48, -50); ctx.bezierCurveTo(-20, -10, 10, -40 + Math.sin(frame * 0.1) * 3, 58, -30); ctx.stroke();
  ctx.strokeStyle = '#9F1239'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-48, -64); ctx.bezierCurveTo(-10, -60, 20, -8, 58, -52); ctx.stroke();
  // Oil sheen
  ctx.fillStyle = `hsla(${(frame * 3) % 360}, 70%, 60%, 0.4)`; ctx.fillRect(-40, -4, 30, 2);
};

// ---------------------------------------------------------------------------

/** Health bar across the top while the fight's on. */
export const drawMooseHud = (ctx: Ctx, state: GameState, fight: MooseFight) => {
  if (fight.phase !== 'intro' && fight.phase !== 'fight') return;
  const m = fight.moose;
  if (!m) return;
  const fill = fight.phase === 'intro' ? Math.min(1, fight.t / 70) : Math.max(0, m.health / MOOSE_HP);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(200, 12, 400, 40);
  ctx.strokeStyle = '#78350F'; ctx.lineWidth = 2; ctx.strokeRect(200, 12, 400, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FDE68A'; ctx.textAlign = 'left';
  ctx.fillText('THE MOOSE', 210, 28);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.textAlign = 'right';
  ctx.fillText('EXTREMELY TERRITORIAL', 590, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(210, 34, 380, 10);
  ctx.fillStyle = fight.hpFlash > 0 ? '#FEF3C7' : (m.health < MOOSE_HP * 0.5 ? '#DC2626' : '#B45309');
  ctx.fillRect(210, 34, 380 * fill, 10);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 210; x < 590; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
};
