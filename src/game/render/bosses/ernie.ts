// Ernie Earthquake's sprite: a retired seismologist and professional grump. Stooped, bald on top with
// white tufts, bushy brows, jowls and thick glasses; a cardigan knitted in rock strata over a shirt with a
// seismograph strip hanging out of the pocket, slacks up to his ribs, a rock hammer on his belt and his
// hearing aid wrapped in foil ("they listen through it"). Drawn in the boss's local space (0,0 = his
// top-left corner), in an 80x80 box.

import { Enemy } from '../../../types';
import { KICK_FRAMES, PUNISH_WINDUP } from '../../bosses/ernie';
import { FaceStyle, Mood, Air, drawHead, headAt, facingOf, goreOf, moodOf, limb, hand, shoe, foil, bodyBlood, breath, airOf, airBlend, joint, mix } from './kit';

const SKIN = '#E8C4A8', SKIN_DARK = '#B98E72';
const FACE: FaceStyle = {
  skin: SKIN, shadow: SKIN_DARK, highlight: '#F8E1CF', brow: '#F5F5F4', iris: '#57534E',
  jaw: 'jowly', age: 1, bags: '#9C7A66', nose: 'big', lips: '#A16B5A', bushy: true,
};
const KNIT = '#7C5A3A', KNIT_DARK = '#5B4128';

export const drawErnie = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const f = facingOf(e);
  const gore = goreOf(e);
  const lifting = e.bossState === 'attacking';
  // (not while he's stood watching the boulder go, before he sets off)
  const running = e.bossState === 'running' && !(!e.scrambling && (e.runDelay ?? 0) > 0);
  // His hop at Meathead (off the floor or off the top of the boulder): not stood up on the boulder, nor toppling once
  // the ice is off him
  const frozen = e.bossState === 'frozen';
  const A = airOf(e, frame, { vMax: 9, airborne: e.isGroundedBoss === false && e.bossState !== 'perched' && (e.bossState !== 'stunned_drop' || (e.frozenTimer ?? 0) > 0) });
  const land = e.bossState === 'stunned_drop' || frozen ? 0 : A.land;
  // (in the ice, everything about him held where it was)
  const fr = frozen ? 0 : frame;
  const airMood: Mood | undefined = A.air && !frozen ? (A.v < 0.25 ? 'grump' : 'fierce') : undefined;
  const mood = moodOf(e, frame, { attacking: 'fierce', perched: 'fierce', running: 'fierce', stunned_drop: 'dazed', frozen: 'shock', ...(airMood ? { idle: airMood } : {}) });
  const b = breath(frame, 0.05);
  const step = running ? Math.sin(frame * 0.5) * 3 : 0;
  // Kicking a rock at him (Meathead stunned): the front leg drawn back in the windup, then swung through and up
  const kicking = (e.punishT ?? 0) > 0 || (e.kickT ?? 0) > 0;
  const kickAngle = (e.punishT ?? 0) > 0 ? -0.7 * Math.min(1, Math.max(0, PUNISH_WINDUP - 6 - e.punishT!) / 4) : (e.kickT ?? 0) > 0 ? 1.15 * Math.sin(Math.PI * Math.min(1, (KICK_FRAMES - e.kickT! + 3) / KICK_FRAMES)) : 0;
  const frontX = f > 0 ? 50 : 30;
  const jump = (A.air || land > 0) && !kicking;
  // (down onto his knees with the landing)
  const lower = 5 * land;
  ctx.save();
  ctx.scale(e.width / 80, e.height / 80);
  // (leant into the hop on the way up, rocked back coming down, hunched over the landing)
  const lean = !jump ? 0 : A.air ? f * (A.v < 0 ? 0.08 * A.off : -0.05 * A.v) : f * 0.08 * land;
  if (lean) { ctx.translate(40, 70); ctx.rotate(lean); ctx.translate(-40, -70); }

  if (jump) drawHopLegs(ctx, A, land, f, frontX, fr);
  // Orthopedic shoes and slacks hitched up high (the kicking one's up off the floor)
  else {
  if (!kicking || frontX !== 30) shoe(ctx, 30 + step, 80, 15, 6, f, '#3F2A1A', '#1C1917');
  if (!kicking || frontX !== 50) shoe(ctx, 50 - step, 80, 15, 6, f, '#3F2A1A', '#1C1917');
  ctx.fillStyle = '#6B6258';
  if (!kicking) { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58 - step, 75); ctx.lineTo(43 - step, 75); ctx.lineTo(40, 60); ctx.lineTo(37 + step, 75); ctx.lineTo(22 + step, 75); ctx.closePath(); ctx.fill(); }
  // (kicking: the seat of them, and the leg he's standing on; the other one's drawn swinging, below)
  else if (f > 0) { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58, 60); ctx.lineTo(40, 61); ctx.lineTo(37, 75); ctx.lineTo(22, 75); ctx.closePath(); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(21, 50); ctx.lineTo(59, 50); ctx.lineTo(58, 75); ctx.lineTo(43, 75); ctx.lineTo(40, 61); ctx.lineTo(22, 60); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#524A42'; ctx.fillRect(21, 50, 3, kicking && f < 0 ? 10 : 25); if (!kicking || frontX !== 30) ctx.fillRect(30 + step, 58, 0.7, 16); if (!kicking || frontX !== 50) ctx.fillRect(50 - step, 58, 0.7, 16);
  if (kicking) {
    // (the kicking leg: from the hip, swung about it, the shoe on the end; the slacks' own leg there painted over first)
    const hipX = frontX, hipY = 56, a = kickAngle * f, len = 22;
    const fx = hipX + Math.sin(a) * len, fy = hipY + Math.cos(a) * len;
    limb(ctx, hipX, hipY, fx, fy, 11, '#6B6258', '#524A42');
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-a * 0.6); shoe(ctx, 0, 4, 15, 6, f, '#3F2A1A', '#1C1917'); ctx.restore();
    // (the whoosh of it, on the way through)
    if ((e.kickT ?? 0) > KICK_FRAMES - 5) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hipX, hipY, len + 4, Math.PI / 2 - f * 0.2, Math.PI / 2 - f * 1.2, f > 0); ctx.stroke(); }
  }
  }
  // Belt, and the rock hammer on it
  ctx.save(); ctx.translate(0, lower);
  ctx.fillStyle = '#292524'; ctx.fillRect(21, 50, 38, 2.6);
  ctx.fillStyle = '#A8A29E'; ctx.fillRect(38.5, 50.2, 3, 2.2);
  const hx = 40 - f * 13;
  ctx.fillStyle = '#92400E'; ctx.fillRect(hx - 0.8, 51, 1.6, 10);
  ctx.fillStyle = '#6B7280'; ctx.fillRect(hx - 3.5, 59.5, 7, 2.4); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(hx + 1, 59.5, 2.5, 1);
  ctx.restore();

  ctx.save(); ctx.translate(f * 2, -b + 2 + lower);
  // Shirt, then the cardigan over it, knitted in bands like rock strata
  ctx.fillStyle = '#D6D3C4';
  ctx.fillRect(28, 32, 24, 20);
  ctx.fillStyle = '#9F8E6F'; for (let x = 29; x < 52; x += 4) ctx.fillRect(x, 32, 0.6, 20); // plaid
  ctx.fillStyle = '#B8A987'; for (let y = 35; y < 52; y += 4) ctx.fillRect(28, y, 24, 0.6);
  const bands = ['#7C5A3A', '#A0764C', '#6E4A2E', '#B08A5B', '#5E4027'];
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 17 : 51;
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = bands[i];
      ctx.fillRect(x0, 33 + i * 4.2, 12, 4.4);
    }
    ctx.fillStyle = KNIT_DARK;
    for (let y = 34; y < 54; y += 2) ctx.fillRect(x0 + (y % 4 === 0 ? 2 : 5), y, 0.7, 0.9); // knit texture
  }
  ctx.fillStyle = KNIT_DARK; ctx.fillRect(17, 33, 3, 21);
  // A fault line running through the knit, glowing like the fissure it is
  // (its glow stepped out round it: a wide dim band, a narrower brighter one, the hot line, a white-hot core)
  ctx.save(); ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
  for (const [w, c] of [[2.8, 'rgba(180, 83, 9, 0.4)'], [1.8, 'rgba(255, 179, 0, 0.6)'], [0.9, '#F59E0B'], [0.35, '#FDE68A']] as const) {
    ctx.strokeStyle = c; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(20, 36); ctx.lineTo(23, 41); ctx.lineTo(21, 45); ctx.lineTo(25, 51); ctx.stroke();
  }
  ctx.restore();
  // Buttons, and a pocket with the seismograph strip hanging out of it and pencils
  ctx.fillStyle = '#E7E5E4'; for (const y of [37, 42, 47]) { ctx.beginPath(); ctx.arc(52.5, y, 0.9, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#BFB59A'; ctx.fillRect(31, 36, 8, 7);
  ctx.fillStyle = '#FAFAF9'; ctx.fillRect(33, 34, 4, 17);
  ctx.strokeStyle = '#DC2626'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(35, 34);
  for (let y = 35; y < 51; y += 1) ctx.lineTo(35 + ((y * 7) % 5 - 2) * (y > 44 ? 0.9 : 0.35), y);
  ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.fillRect(31.5, 32.5, 1, 5); ctx.fillStyle = '#2563EB'; ctx.fillRect(38, 33, 1, 4.5);
  bodyBlood(ctx, gore, [[43, 40, 3.5], [24, 44, 3], [46, 49, 3], [33, 47, 2.5], [55, 38, 2.5], [28, 38, 2.5]], frame);

  // Arms: cardigan sleeves, old hands (up under the boulder when he's lifting one)
  // (in a hop: flung out for balance, flapping on the way down, braced out over the landing)
  const arm = jump ? (A.air ? airBlend(A, { ext: [5, 7, 9, 13], rise: [9, 1, 16, -3], top: [9, -2, 15, -8], fall: [8, -5, 14, -12] })
    : [3, 10, 2, 19].map((v, i) => mix(v, [7, 5, 13, 11][i], land))) : null;
  for (const side of [-1, 1]) {
    const sx = 40 + side * 19, sy = 36;
    const swing = running ? Math.sin(frame * 0.5 + (side > 0 ? Math.PI : 0)) * 6 : Math.sin(frame * 0.05) * 1;
    let ex = lifting ? sx + side * 4 : sx + side * 3 + swing * 0.3, ey = lifting ? sy - 10 : sy + 10;
    let hx2 = lifting ? sx - side * 4 : sx + side * 2 + swing, hy = lifting ? sy - 22 : sy + 19;
    if (arm) {
      const flap = A.air ? Math.sin(fr * 0.55 + side * 1.3) * (1 + Math.max(0, A.v) * 3) : 0;
      ex = sx + side * arm[0]; ey = sy + arm[1] + flap * 0.6; hx2 = sx + side * arm[2]; hy = sy + arm[3] + flap * 1.6;
    }
    limb(ctx, sx, sy, ex, ey, 7.5, KNIT, KNIT_DARK);
    limb(ctx, ex, ey, hx2, hy, 6.5, KNIT, KNIT_DARK);
    ctx.fillStyle = '#A0764C'; ctx.fillRect(hx2 - 3, hy - (lifting ? -2 : 3.5), 6, 1.5); // cuff
    hand(ctx, hx2, hy + (lifting ? -2 : 1.5), 3.6, SKIN, SKIN_DARK);
  }

  // The head, stuck forward the way old men's are: white tufts, glasses, the foil hearing aid, a pencil
  drawHead(ctx, headAt(e, f, 40, 20.5), FACE, mood, frame, gore, {
    hair: () => {
      ctx.fillStyle = '#F5F5F4';
      for (const [x, y, r] of [[-11, -7, 3], [-12, -3, 2.6], [-10, -10, 2.4], [10.5, -8, 2], [11, -5, 1.8]] as const) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      // A few long strands combed over the top
      ctx.strokeStyle = '#E7E5E4'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-9, -11); ctx.quadraticCurveTo(-1, -16, 8, -11); ctx.moveTo(-8, -10); ctx.quadraticCurveTo(0, -14.5, 7, -10.5); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'; ctx.fillRect(-2, -12.3, 4, 0.8); // shine on the dome
      // Hearing aid, wrapped in foil, and a pencil over the ear
      foil(ctx, [-14.5, -5, -13, -8, -10.8, -7.5, -10.5, -2.5, -12.5, -1.5, -14.8, -2.5], frame, 5);
      ctx.fillStyle = '#FACC15'; ctx.save(); ctx.translate(-12, -8); ctx.rotate(-0.5); ctx.fillRect(-1, -6, 1.4, 9); ctx.fillStyle = '#F9A8D4'; ctx.fillRect(-1, -7.5, 1.4, 1.5); ctx.restore();
    },
    eyewear: () => {
      // Thick glasses: the eyes swim behind them
      ctx.strokeStyle = '#292524'; ctx.lineWidth = 1.1;
      ctx.strokeRect(-9, -7.2, 8, 7); ctx.strokeRect(0.5, -7.2, 8.2, 7);
      ctx.beginPath(); ctx.moveTo(-1, -4.5); ctx.lineTo(0.5, -4.5); ctx.moveTo(-9, -5); ctx.lineTo(-12, -4); ctx.stroke();
      ctx.fillStyle = 'rgba(191, 219, 254, 0.18)'; ctx.fillRect(-9, -7.2, 8, 7); ctx.fillRect(0.5, -7.2, 8.2, 7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; ctx.fillRect(-8, -6.5, 1.8, 0.8); ctx.fillRect(1.5, -6.5, 1.8, 0.8);
    },
  });
  ctx.restore();

  // Knocked silly after a drop: cracks of light and birds going round
  if (e.bossState === 'stunned_drop') {
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.12 + i * 2.1;
      ctx.fillStyle = '#FDE047';
      ctx.beginPath(); ctx.arc(40 + Math.cos(a) * 18, -2 + Math.sin(a) * 4, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
};

const SLACKS = '#6B6258', SLACKS_BACK = '#5E564D', SLACKS_DARK = '#524A42';

/**
 * His legs in a hop: the front knee hauled up stiff as he goes, the back one trailing, both stuck straight down for the
 * floor coming back; then knees bent under the landing. The slacks flap at the cuffs, and ride up off his socks as he drops.
 */
const drawHopLegs = (ctx: CanvasRenderingContext2D, A: Air, land: number, f: 1 | -1, frontX: number, fr: number) => {
  const hipY = 57 + 5 * land;
  // (each foot from its hip, front then back: forward is the way he faces)
  const p = A.air
    ? airBlend(A, { ext: [1, 21, -1, 21], rise: [7, 14, -9, 15], top: [5, 17, -7, 17], fall: [2, 20.5, -3, 20] })
    : [0, 19, 0, 19].map((v, i) => mix(v, [5, 14, -4, 14][i], land));
  const leg = (hipX: number, dx: number, dy: number, back: boolean) => {
    const ax = hipX + f * dx, ay = hipY + dy;
    const [kx, ky] = joint(hipX, hipY, ax, ay, 10.5, 10.5, f);
    const col = back ? SLACKS_BACK : SLACKS;
    // (coming down, the cuffs ride up: brown socks and a bit of white shin)
    const ride = A.air ? Math.max(0, A.v) * 0.4 : 0;
    const hemX = mix(ax, kx, ride), hemY = mix(ay, ky, ride);
    if (ride > 0.05) { limb(ctx, kx, ky, ax, ay, 5.5, '#F1E3D3'); limb(ctx, mix(ax, kx, 0.25), mix(ay, ky, 0.25), ax, ay, 6, '#57534E', '#3F3A35'); }
    limb(ctx, kx, ky, hemX, hemY, 11, col, SLACKS_DARK);
    limb(ctx, hipX, hipY, kx, ky, 12, col, SLACKS_DARK);
    // The cuff flapping in the wind of it
    if (A.air) {
      const fl = Math.sin(fr * 1.3 + hipX) * 1.6, d = A.v > 0 ? -1 : 1;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(hemX - 5.5, hemY - 1); ctx.lineTo(hemX + 5.5, hemY - 1); ctx.lineTo(hemX + 6.5 + fl, hemY + d * 2.5); ctx.lineTo(hemX - 6.5 + fl, hemY + d * 2.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = SLACKS_DARK; ctx.fillRect(hemX - 6.5 + fl, hemY + d * 2.5 - (d > 0 ? 0.8 : 0), 13, 0.8);
    }
    // The orthopedic shoe: toes down off the floor, flat for the landing
    const shin = Math.atan2(ax - kx, ay - ky);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(A.air ? -shin * 0.6 + f * (A.v < 0 ? 0.35 : 0.1) : 0);
    shoe(ctx, 0, 4, 15, 6, f, back ? '#35231A' : '#3F2A1A', '#1C1917'); ctx.restore();
  };
  const backX = frontX === 50 ? 30 : 50;
  leg(backX, p[2], p[3], true);
  // The seat of them, hitched up to his ribs
  ctx.fillStyle = SLACKS;
  ctx.beginPath(); ctx.moveTo(21, 50 + 5 * land); ctx.lineTo(59, 50 + 5 * land); ctx.lineTo(58, hipY + 4); ctx.lineTo(22, hipY + 4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = SLACKS_DARK; ctx.fillRect(21, 50 + 5 * land, 3, hipY - 46 - 5 * land);
  leg(frontX, p[0], p[1], false);
};
