// Art for the projectiles that were still plain rectangles: bullets, shotgun
// pellets, darts, Hector's poop logs, Dale's cocaine and meth barrels, and
// flying sludge. World space.

import { Projectile } from '../../types';

const angleOf = (p: Projectile) => Math.atan2(p.vel.y, p.vel.x);
const speedOf = (p: Projectile) => Math.hypot(p.vel.x, p.vel.y);
const centerOf = (p: Projectile) => ({ x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 });
const seedOf = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997; return h; };

/** Meathead's gun: a hot tracer round with a fading streak. */
export const drawBullet = (ctx: CanvasRenderingContext2D, p: Projectile) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  const len = Math.min(34, 10 + speedOf(p) * 1.2);
  const trail = ctx.createLinearGradient(-len, 0, 0, 0);
  trail.addColorStop(0, 'rgba(255, 200, 40, 0)');
  trail.addColorStop(1, 'rgba(255, 220, 90, 0.8)');
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.moveTo(-len, 0); ctx.lineTo(0, -3); ctx.lineTo(0, 3);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = '#FFC400';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#FFE082';
  ctx.beginPath();
  ctx.ellipse(2, 0, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(3, 0, 3.5, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** What a shield goon's thrown, end over end: a tequila bottle, a water bottle, a coconut, a chunk of ice, a hot rock, tear gas. */
export const drawThrown = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.rotation || 0);
  switch (p.thrown) {
    case 'tequila':
      ctx.fillStyle = '#92400E'; ctx.beginPath(); ctx.roundRect(-5, -3, 10, 12, 2); ctx.fill();
      ctx.fillRect(-2, -9, 4, 7);
      ctx.fillStyle = '#FDE68A'; ctx.fillRect(-5, 1, 10, 5);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(-2, 2, 4, 3);
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-2, -11, 4, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-4, -2, 2, 9);
      break;
    case 'water':
      // A reusable one: steel, a carry loop, a sticker
      ctx.fillStyle = '#0EA5E9'; ctx.beginPath(); ctx.roundRect(-5, -6, 10, 15, 3); ctx.fill();
      ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-4, -9, 8, 4);
      ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -11, 3, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = '#A3E635'; ctx.beginPath(); ctx.arc(0, 2, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-4, -4, 2, 11);
      break;
    case 'coconut':
      ctx.fillStyle = '#5B3413'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-7, -5 + k * 2.5); ctx.lineTo(7, -6 + k * 3); ctx.stroke(); } // the husk's fibers
      ctx.fillStyle = '#1C1917'; for (const [a, b] of [[-2, -3], [2, -3], [0, 1]]) { ctx.beginPath(); ctx.arc(a, b, 1.3, 0, Math.PI * 2); ctx.fill(); } // its face
      break;
    case 'ice':
      ctx.fillStyle = '#BAE6FD'; ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(-3, -7); ctx.lineTo(6, -6); ctx.lineTo(8, 2); ctx.lineTo(2, 7); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(-2, -5); ctx.lineTo(1, -4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#0EA5E9'; ctx.lineWidth = 1; ctx.stroke();
      break;
    case 'rock': {
      ctx.fillStyle = '#292524'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-4, -6); ctx.lineTo(5, -6); ctx.lineTo(8, 1); ctx.lineTo(3, 6); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill();
      const glow = 0.6 + Math.sin(frame * 0.5) * 0.3;
      ctx.strokeStyle = `rgba(249, 115, 22, ${glow})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-5, -1); ctx.lineTo(0, 1); ctx.lineTo(4, -3); ctx.moveTo(0, 1); ctx.lineTo(1, 5); ctx.stroke();
      ctx.fillStyle = `rgba(253, 224, 71, ${glow * 0.8})`; ctx.beginPath(); ctx.arc(0, 1, 1.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'teargas':
      ctx.fillStyle = '#374151'; ctx.fillRect(-4, -7, 8, 14);
      ctx.fillStyle = '#65A30D'; ctx.fillRect(-4, -2, 8, 4);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-3, -9, 6, 2);
      ctx.fillStyle = 'rgba(226, 232, 216, 0.8)'; ctx.beginPath(); ctx.arc(0, -11, 3 + (frame % 6) * 0.4, 0, Math.PI * 2); ctx.fill(); // hissing out the top
      break;
    case 'forty':
      // A forty in a paper bag, the neck sticking out of it
      ctx.fillStyle = '#78350F'; ctx.fillRect(-2, -12, 4, 6);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(-2, -13, 4, 2);
      ctx.fillStyle = '#C8A26B'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(5, 10); ctx.lineTo(-5, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#A07F4F'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-3, -3); ctx.lineTo(0, -6); ctx.lineTo(3, -3); ctx.lineTo(6, -6); ctx.stroke();
      break;
    case 'coffee':
      // A paper cup of it, lid on, steaming, the green logo (not that one)
      ctx.fillStyle = '#F8FAFC'; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, -5); ctx.lineTo(4, 7); ctx.lineTo(-4, 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-6, -7, 12, 3);
      ctx.fillStyle = '#15803D'; ctx.beginPath(); ctx.arc(0, 1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#A16207'; ctx.fillRect(-4, 3, 8, 2); // the sleeve
      break;
    case 'stapler':
      ctx.fillStyle = '#111827'; ctx.fillRect(-8, -1, 16, 4);
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.moveTo(-8, -1); ctx.lineTo(7, -4); ctx.lineTo(8, -1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-8, 2, 16, 1);
      break;
    case 'cleaner':
      // A spray bottle: blue, the trigger, the nozzle
      ctx.fillStyle = '#2563EB'; ctx.beginPath(); ctx.roundRect(-5, -2, 10, 12, 2); ctx.fill();
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-3, -8, 6, 6); ctx.fillRect(3, -8, 4, 2);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(-4, 2, 8, 4);
      break;
    case 'flask': {
      // A round-bottomed flask, something green and bubbling in it
      ctx.fillStyle = 'rgba(224, 242, 254, 0.7)'; ctx.fillRect(-2, -9, 4, 6);
      ctx.beginPath(); ctx.arc(0, 3, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#84CC16'; ctx.beginPath(); ctx.arc(0, 4, 5, 0, Math.PI); ctx.fill(); ctx.fillRect(-5, 2, 10, 3);
      ctx.fillStyle = '#ECFCCB'; for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(-2 + k * 3, 3 - ((frame + k * 4) % 8) * 0.5, 1, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'wrench':
      // A big pipe wrench, spinning
      ctx.fillStyle = '#6B7280'; ctx.fillRect(-10, -1.5, 16, 3);
      ctx.fillStyle = '#9CA3AF'; ctx.fillRect(4, -5, 6, 4); ctx.fillRect(4, 1, 6, 3);
      ctx.fillStyle = '#B91C1C'; ctx.fillRect(-10, -2, 6, 4);
      break;
    case 'household':
      // Whatever was to hand: a pot, a toaster, a shoe, a potted plant, a phone
      switch ((p.item ?? 0) % 5) {
        case 0: ctx.fillStyle = '#6B7280'; ctx.fillRect(-7, -4, 12, 9); ctx.fillRect(5, -3, 6, 2); ctx.fillStyle = '#9CA3AF'; ctx.fillRect(-7, -5, 12, 2); break;
        case 1: ctx.fillStyle = '#D1D5DB'; ctx.beginPath(); ctx.roundRect(-8, -5, 16, 11, 3); ctx.fill(); ctx.fillStyle = '#374151'; ctx.fillRect(-5, -6, 3, 3); ctx.fillRect(1, -6, 3, 3); ctx.fillStyle = '#111827'; ctx.fillRect(8, -1, 2, 3); break;
        case 2: ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.moveTo(-8, 3); ctx.lineTo(-8, -5); ctx.lineTo(-3, -5); ctx.lineTo(-2, 0); ctx.lineTo(8, 1); ctx.lineTo(8, 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#1C1917'; ctx.fillRect(-8, 4, 16, 2); break;
        case 3: ctx.fillStyle = '#C2410C'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#15803D'; for (const a of [-1, 0, 1]) { ctx.beginPath(); ctx.ellipse(a * 4, -4, 2.5, 5, a * 0.5, 0, Math.PI * 2); ctx.fill(); } break;
        default: ctx.fillStyle = '#F5F5F4'; ctx.fillRect(-7, -4, 14, 9); ctx.fillStyle = '#1C1917'; ctx.fillRect(-8, -7, 16, 3); ctx.fillStyle = '#9CA3AF'; for (let k = 0; k < 3; k++) ctx.fillRect(-4 + k * 3, -1, 2, 2); break;
      }
      break;
  }
  ctx.restore();
};

/**
 * Enemy shots, by what fired them: a pistol or rifle slug (a hot round with a streak behind it), a cryo rifle's frost
 * bolt, a flare-gun flare; anything else, a crackling red plasma ball with a tail.
 */
export const drawEnemyBullet = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  if (p.shot) { drawGunShot(ctx, p, frame); return; }
  const { x, y } = centerOf(p);
  const r = p.width / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  for (let k = 1; k <= 3; k++) {
    ctx.fillStyle = `rgba(255, 60, 40, ${0.28 - k * 0.07})`;
    ctx.beginPath();
    ctx.arc(-k * r * 0.9, 0, r * (1 - k * 0.2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowColor = '#FF3D00';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#E53935';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = frame % 4 < 2 ? '#FFCDD2' : '#FFAB91';
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.1, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/** Meathead's shotgun pellets: little spinning ice crystals with a frosty wake. */
const drawGunShot = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  if (p.shot === 'slug') {
    // A hot round: an orange-white streak behind a brass point
    const trail = ctx.createLinearGradient(-26, 0, 0, 0);
    trail.addColorStop(0, 'rgba(251, 146, 60, 0)'); trail.addColorStop(1, 'rgba(254, 215, 170, 0.85)');
    ctx.fillStyle = trail; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(0, -2); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.ellipse(1, 0, 5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(2, 0, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  } else if (p.shot === 'cryo') {
    // A frost bolt: a pale blue core in a haze of cold, flakes coming off it
    ctx.fillStyle = 'rgba(125, 211, 252, 0.3)'; ctx.beginPath(); ctx.ellipse(-6, 0, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7DD3FC'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F0F9FF'; ctx.beginPath(); ctx.ellipse(1, 0, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) { const t = ((frame + k * 5) % 15) / 15; ctx.fillRect(-4 - t * 16, (k - 1) * 4 + Math.sin(frame * 0.3 + k) * 2, 2, 2); }
  } else if (p.shot === 'spray') {
    // A cloud of bug spray: a puff of yellow-green mist, spreading as it goes
    const age = Math.min(1, ((frame * 7 + seedOf(p.id)) % 60) / 60);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(190, 242, 100, ${0.35 - k * 0.06})`; ctx.beginPath(); ctx.arc(-k * 5, Math.sin(frame * 0.4 + k) * 2, 5 + k * 2 + age * 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(236, 252, 203, 0.6)'; ctx.beginPath(); ctx.arc(1, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else if (p.shot === 'zap') {
    // A ray gun's zap: a crackling green bolt
    ctx.strokeStyle = 'rgba(163, 230, 53, 0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(4, 0); ctx.stroke();
    ctx.strokeStyle = '#D9F99D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, 0);
    for (let k = 1; k <= 5; k++) ctx.lineTo(-18 + k * 4.4, (((frame + k * 3) % 5) - 2) * 1.6);
    ctx.stroke();
    ctx.fillStyle = '#F7FEE7'; ctx.beginPath(); ctx.arc(4, 0, 3, 0, Math.PI * 2); ctx.fill();
  } else {
    // A flare: a blinding red-orange ball throwing sparks and a trail of smoke
    const flick = 0.8 + Math.sin(frame * 0.9) * 0.2;
    ctx.fillStyle = 'rgba(120, 113, 108, 0.35)'; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(-k * 7, (k % 2 ? -1 : 1) * 1.5, 3 + k, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = `rgba(239, 68, 68, ${0.35 * flick})`; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F97316'; ctx.beginPath(); ctx.arc(0, 0, 5 * flick, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(0.5, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FDE047'; for (let k = 0; k < 3; k++) { const a = frame * 0.7 + k * 2.1; ctx.fillRect(Math.cos(a) * 8 - 4, Math.sin(a) * 6, 1.5, 1.5); }
  }
  ctx.restore();
};

export const drawIcePellet = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = Math.max(4, p.width / 2);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(200, 245, 255, 0.35)';
  const back = angleOf(p) + Math.PI;
  for (let k = 1; k <= 3; k++) {
    ctx.beginPath();
    ctx.arc(Math.cos(back) * k * 5, Math.sin(back) * k * 5, r * (1 - k * 0.22), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.rotate(frame * 0.35 + seedOf(p.id));
  ctx.shadowColor = '#80DEEA';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#E0F7FA';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, rr = i % 2 === 0 ? r * 1.2 : r * 0.6;
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#4FC3F7';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
};

/** Needle gun darts: a flying syringe, needle first. */
export const drawDart = (ctx: CanvasRenderingContext2D, p: Projectile) => {
  const { x, y } = centerOf(p);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleOf(p));
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(14, 0); ctx.stroke();       // needle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(-9, -3, 13, 6);                                               // barrel
  ctx.fillStyle = '#FF2BD6';
  ctx.fillRect(-8, -2, 10, 4);                                               // the good stuff
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(-8, -3, 10, 1.2);
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(-14, -1, 5, 2);                                               // plunger
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(-16, -4, 2, 8);                                               // thumb press
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(-10, -5, 1.5, 10);                                            // flange
  ctx.restore();
};

/**
 * Hector's soggy log of shit: a lumpy, glistening turd tumbling end over end,
 * dripping, with corn, stink lines and a couple of flies along for the ride.
 */
export const drawPoopLog = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const seed = seedOf(p.id);
  const hw = p.width / 2, hh = p.height / 2;
  const back = -Math.sign(p.vel.x || 1);
  ctx.save();

  // Stink lines trailing behind (these don't tumble)
  ctx.strokeStyle = 'rgba(150, 190, 60, 0.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const sx = x + back * (hw + 6 + k * 9), sy = y - 8 + k * 8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + back * 6, sy - 6 + Math.sin(frame * 0.3 + k) * 3, sx + back * 10, sy + 6, sx + back * 16, sy);
    ctx.stroke();
  }

  // Brown drips flung off it
  ctx.fillStyle = '#4E342E';
  for (let k = 0; k < 3; k++) {
    const t = ((frame * 1.5 + k * 13 + seed) % 30) / 30;
    ctx.beginPath();
    ctx.ellipse(x + back * (hw * 0.5 + t * 26), y + hh + t * t * 30, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(x, y);
  ctx.rotate(frame * 0.2 + seed);

  // A lumpy log: fat in the middle, tapering to a point at one end
  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(-hw * 1.1, hh * 0.15);                                   // pointy tail
    ctx.quadraticCurveTo(-hw * 0.95, -hh * 0.6, -hw * 0.55, -hh * 0.75);
    ctx.quadraticCurveTo(-hw * 0.35, -hh * 1.05, -hw * 0.1, -hh * 0.8);  // lump
    ctx.quadraticCurveTo(hw * 0.15, -hh * 1.15, hw * 0.45, -hh * 0.85); // lump
    ctx.quadraticCurveTo(hw * 1.05, -hh * 0.8, hw * 1.0, hh * 0.05);    // blunt end
    ctx.quadraticCurveTo(hw * 0.95, hh * 0.95, hw * 0.4, hh * 0.9);
    ctx.quadraticCurveTo(hw * 0.1, hh * 1.1, -hw * 0.2, hh * 0.85);
    ctx.quadraticCurveTo(-hw * 0.7, hh * 0.95, -hw * 1.1, hh * 0.15);
    ctx.closePath();
  };
  const body = ctx.createLinearGradient(0, -hh, 0, hh);
  body.addColorStop(0, '#A1795F');
  body.addColorStop(0.4, '#7B5438');
  body.addColorStop(1, '#4A2F1E');
  ctx.fillStyle = body;
  outline();
  ctx.fill();
  ctx.strokeStyle = '#2B1A10';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Creases between the lumps
  ctx.strokeStyle = 'rgba(43, 26, 16, 0.75)';
  ctx.lineWidth = 1.5;
  for (const cx of [-hw * 0.3, hw * 0.2]) {
    ctx.beginPath();
    ctx.moveTo(cx - 2, -hh * 0.85);
    ctx.quadraticCurveTo(cx + 3, 0, cx - 1, hh * 0.85);
    ctx.stroke();
  }
  // Glistening wet sheen
  ctx.fillStyle = 'rgba(255, 236, 210, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-hw * 0.5, -hh * 0.45, hw * 0.22, hh * 0.14, -0.2, 0, Math.PI * 2);
  ctx.ellipse(hw * 0.05, -hh * 0.55, hw * 0.2, hh * 0.12, 0, 0, Math.PI * 2);
  ctx.ellipse(hw * 0.6, -hh * 0.4, hw * 0.12, hh * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // A couple of undigested corn kernels
  ctx.fillStyle = '#FFD54F';
  ctx.strokeStyle = '#B7860B';
  ctx.lineWidth = 0.8;
  for (const [cx, cy] of [[-hw * 0.15, hh * 0.35], [hw * 0.6, hh * 0.3]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 2.2, 1.6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // Flies buzzing around it
  for (let k = 0; k < 2; k++) {
    const a = frame * (0.35 + k * 0.1) + k * 3 + seed;
    const fx = x + Math.cos(a) * (hw + 8), fy = y + Math.sin(a * 1.3) * (hh + 10);
    ctx.fillStyle = 'rgba(220, 230, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(fx - 2, fy - 3, 2.5, 1.5, -0.6 + (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.ellipse(fx + 2, fy - 3, 2.5, 1.5, 0.6 - (frame % 2) * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Dale's cocaine: a tumbling knotted baggie leaving a puff of powder. */
export const drawCocaine = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = p.width / 2;
  ctx.save();
  // Powder puff trail
  for (let k = 1; k <= 3; k++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.25 - k * 0.06})`;
    ctx.beginPath();
    ctx.arc(x - p.vel.x * k * 1.2, y - p.vel.y * k * 1.2, r * (0.5 + k * 0.15), 0, Math.PI * 2);
    ctx.fill();
  }
  drawCocaineBag(ctx, x, y, r, frame * 0.12 + seedOf(p.id));
  ctx.restore();
};

/** One knotted baggie of powder centred on (x, y). */
export const drawCocaineBag = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Bag
  ctx.fillStyle = 'rgba(245, 248, 255, 0.95)';
  ctx.strokeStyle = '#B0BEC5';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r);
  ctx.quadraticCurveTo(-r * 1.1, -r * 0.2, -r * 0.8, r * 0.8);
  ctx.quadraticCurveTo(0, r * 1.15, r * 0.8, r * 0.8);
  ctx.quadraticCurveTo(r * 1.1, -r * 0.2, r * 0.2, -r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Knot and twist
  ctx.fillStyle = '#CFD8DC';
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r); ctx.lineTo(-r * 0.5, -r * 1.4); ctx.lineTo(r * 0.5, -r * 1.4); ctx.lineTo(r * 0.2, -r);
  ctx.closePath();
  ctx.fill();
  // Powder inside and a crease
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.35, r * 0.65, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(144, 164, 174, 0.6)';
  ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.3); ctx.lineTo(r * 0.1, r * 0.1); ctx.stroke();
  ctx.restore();
};

/** Dale's meth barrel: a banded steel drum with a hazard label, leaking blue crystal. */
export const drawMethBarrel = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  drawMethDrum(ctx, x, y, p.width, p.height, p.rotation || 0, frame);
};

/** One METH drum centred on (x, y). */
export const drawMethDrum = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rotation: number, frame: number) => {
  const hw = width / 2, hh = height / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  // Drum with rounded shading
  const drum = ctx.createLinearGradient(-hw, 0, hw, 0);
  drum.addColorStop(0, '#0B0B0B');
  drum.addColorStop(0.35, '#3A3A3A');
  drum.addColorStop(0.6, '#1E1E1E');
  drum.addColorStop(1, '#080808');
  ctx.fillStyle = drum;
  ctx.beginPath();
  ctx.moveTo(-hw, -hh + 4); ctx.quadraticCurveTo(0, -hh - 3, hw, -hh + 4);
  ctx.lineTo(hw, hh - 4); ctx.quadraticCurveTo(0, hh + 3, -hw, hh - 4);
  ctx.closePath();
  ctx.fill();
  // Rolling hoops
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  for (const by of [-hh * 0.45, hh * 0.45]) {
    ctx.beginPath();
    ctx.moveTo(-hw, by); ctx.quadraticCurveTo(0, by + 3, hw, by);
    ctx.stroke();
  }
  // Yellow label with the hazard mark
  ctx.fillStyle = '#FFD600';
  ctx.fillRect(-hw + 4, -hh * 0.3, width - 8, hh * 0.6);
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 7px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('METH', 0, 3);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1;
  ctx.strokeRect(-hw + 4, -hh * 0.3, width - 8, hh * 0.6);
  // Lid rim and a crack leaking blue crystal
  ctx.fillStyle = '#6B6B6B';
  ctx.beginPath();
  ctx.ellipse(0, -hh + 3, hw, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = frame % 10 < 5 ? '#4FC3F7' : '#81D4FA';
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    ctx.moveTo(hw * 0.4 + k * 3, hh * 0.55);
    ctx.lineTo(hw * 0.4 + k * 3 + 2, hh * 0.55 + 4 + k * 2);
    ctx.lineTo(hw * 0.4 + k * 3 - 2, hh * 0.55 + 3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
};

/** Flying sludge/vomit: a wobbling goo blob with a stringy tail. */
export const drawSludgeBlob = (ctx: CanvasRenderingContext2D, p: Projectile, frame: number) => {
  const { x, y } = centerOf(p);
  const r = Math.max(6, Math.min(p.width, p.height) / 2);
  const toxic = p.owner === 'enemy'; // Tommy's puke is lurid; Meathead's barf is murkier
  const base = toxic ? '#7CB342' : '#2E7D32';
  const light = toxic ? '#C6FF00' : '#66BB6A';
  const a = angleOf(p), seed = seedOf(p.id);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  // Stringy tail
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -r * 0.5);
  ctx.quadraticCurveTo(-r * 2.2, 0, -r * 0.2, r * 0.5);
  ctx.closePath();
  ctx.fill();
  // Wobbling blob
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const rr = r * (0.85 + 0.15 * Math.sin(frame * 0.5 + i * 1.7 + seed));
    if (i === 0) ctx.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    else ctx.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
  // Chunks, bubbles and a slimy shine
  ctx.fillStyle = toxic ? '#FFEB3B' : '#8D6E63';
  ctx.beginPath();
  ctx.arc(r * 0.25, r * 0.2, r * 0.18, 0, Math.PI * 2);
  ctx.arc(-r * 0.3, -r * 0.25, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.35, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(r * 0.1, -r * 0.45, r * 0.25, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
