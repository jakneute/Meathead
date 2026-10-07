// Hector's studio in the eye of his own storm: a great curved window onto the eye (clear sky straight up, the eye
// wall boiling round it with lightning in it, everything the storm's picked up going round: a cow, a piano, a lawn
// chair, a motel sign), rain running down the glass. In here: his forecast on the big screen (seven days of the
// same hurricane), a studio camera with its tally light on, the lighting rig, the wind tunnel's turbine intakes in
// the side walls, his mark taped on the floor. The wind wisps show which way the room's being pulled.

import { bandedGradient, checker, steppedGlow, pixelBlob } from '../../pixelArt';
import { Ctx, hash, box, bevel, label } from './kit';

/** Something the storm's carrying, going round outside (a silhouette at distance `d` 0 far .. 1 near). */
const flotsam = (ctx: Ctx, kind: number, x: number, y: number, d: number, rot: number) => {
  const s = 0.6 + d * 0.8, c = d > 0.5 ? '#2B3442' : '#3F4A5C';
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = c;
  if (kind === 0) { ctx.fillRect(-14, -7, 26, 13); ctx.fillRect(10, -11, 9, 8); ctx.fillRect(-12, 6, 3, 8); ctx.fillRect(-2, 6, 3, 8); ctx.fillRect(6, 6, 3, 8); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-8, -5, 6, 5); } // a cow
  else if (kind === 1) { ctx.fillRect(-16, -8, 32, 12); ctx.fillRect(-16, -14, 22, 6); ctx.fillRect(-14, 4, 3, 10); ctx.fillRect(11, 4, 3, 10); ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-14, -2, 28, 2); } // a piano
  else if (kind === 2) { ctx.fillRect(-10, -2, 20, 3); ctx.fillRect(-10, -12, 3, 12); ctx.fillRect(7, 0, 3, 10); ctx.fillRect(-8, 1, 3, 9); ctx.fillStyle = '#EF4444'; ctx.fillRect(-7, -10, 2, 10); } // a lawn chair
  else { ctx.fillRect(-2, 0, 3, 16); ctx.fillStyle = '#F43F5E'; ctx.fillRect(-16, -12, 32, 12); ctx.fillStyle = '#FFE4E6'; ctx.fillRect(-12, -8, 24, 2); } // a motel sign
  ctx.restore();
};

export const drawHectorLair = (ctx: Ctx, L: number, R: number, T: number, B: number, f: number, windTargetX: number | null) => {
  const W = R - L, cx = L + W / 2;
  const flash = f % 160 > 154;
  // Behind it all: the eye. Clear and dark-blue straight up, the eye wall round the sides and below
  const gx = L + 24, gy = T + 14, gw = W - 48, gh = B - T - 130;
  ctx.save(); ctx.beginPath(); ctx.rect(gx, gy, gw, gh); ctx.clip();
  bandedGradient(ctx, gx, gy, gw, gh, ['#0B1A33', '#16294A', '#2A3D5C', '#4A5568', '#5B6577'], 12);
  for (let k = 0; k < 18; k++) box(ctx, gx + hash(k) * gw, gy + hash(k + 30) * gh * 0.3, 1, 1, f % (40 + k * 7) < 30 ? '#E0E7FF' : '#64748B');
  // the eye wall, in banks: far ones paler, rolling slowly round
  for (let bank = 0; bank < 3; bank++) {
    const tone = ['#6B7280', '#4B5563', '#374151'][bank], lit = ['#9CA3AF', '#6B7280', '#4B5563'][bank], drift = f * (0.15 + bank * 0.12);
    for (let k = 0; k < 9; k++) {
      const u = ((k * 97 + drift) % (gw + 200)) - 100;
      const edge = Math.abs(u - gw / 2) / (gw / 2);
      const y = gy + gh * (0.25 + bank * 0.18) - edge * 60 + Math.sin(k + bank) * 14;
      pixelBlob(ctx, gx + u - 6, y + 34, 64 + bank * 14, 30 + bank * 8, lit);
      pixelBlob(ctx, gx + u, y + 40, 70 + bank * 14, 34 + bank * 8, tone);
      pixelBlob(ctx, gx + u, y + 80, 80, 40, tone);
    }
  }
  if (flash) box(ctx, gx, gy, gw, gh, 'rgba(214, 234, 248, 0.25)');
  // a fork of it now and then, in the wall
  if (f % 160 > 150) {
    ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 2; ctx.beginPath();
    const lx = gx + 60 + hash(Math.floor(f / 160)) * (gw - 120);
    ctx.moveTo(lx, gy + gh * 0.3); for (let k = 1; k < 6; k++) ctx.lineTo(lx + (hash(k + f) - 0.5) * 30, gy + gh * 0.3 + k * 20); ctx.stroke();
  }
  // what the storm's carrying, going round
  for (let k = 0; k < 6; k++) {
    const d = (k % 3) / 2, speed = 0.4 + d * 0.6;
    const u = ((k * 211 + f * speed) % (gw + 120)) - 60;
    flotsam(ctx, k % 4, gx + u, gy + 70 + (k % 3) * 60 + Math.sin(f * 0.02 + k) * 16, d, f * 0.02 * (k % 2 ? 1 : -1) + k);
  }
  // rain running down the glass
  for (let k = 0; k < 40; k++) {
    const x = gx + hash(k + 7) * gw, len = 6 + hash(k + 3) * 10, y = gy + ((f * (2 + hash(k) * 3) + k * 53) % (gh + 20)) - 20;
    box(ctx, x, y, 1, len, 'rgba(200, 225, 255, 0.35)');
  }
  ctx.restore();
  // the window's frame: steel mullions, a sill
  box(ctx, gx - 4, gy - 4, gw + 8, 6, '#334155'); box(ctx, gx - 4, gy + gh - 2, gw + 8, 10, '#334155'); box(ctx, gx - 4, gy + gh - 2, gw + 8, 2, '#64748B');
  for (let k = 1; k < 4; k++) { const mx = gx + (gw * k) / 4; box(ctx, mx - 3, gy, 6, gh, '#334155'); box(ctx, mx - 3, gy, 1, gh, '#64748B'); }
  box(ctx, gx, gy + gh * 0.45, gw, 4, '#334155');
  // the wall under the window
  bandedGradient(ctx, L + 24, gy + gh + 8, W - 48, B - 14 - (gy + gh + 8), ['#1E293B', '#172033', '#111827'], 6);
  for (let x = L + 24; x < R - 24; x += 60) box(ctx, x, gy + gh + 8, 1, B - 14 - (gy + gh + 8), '#0B1220');

  // The lighting rig across the top, its lights on him
  box(ctx, L + 24, T + 2, W - 48, 6, '#475569'); for (let x = L + 30; x < R - 30; x += 12) box(ctx, x, T + 3, 6, 4, '#1E293B');
  for (const lx of [L + 170, cx, R - 170]) {
    box(ctx, lx - 1, T + 8, 2, 8, '#334155');
    bevel(ctx, lx - 10, T + 16, 20, 14, '#1F2937', '#4B5563', '#111827');
    box(ctx, lx - 7, T + 28, 14, 3, '#FEF3C7');
    ctx.fillStyle = 'rgba(254, 243, 199, 0.05)';
    ctx.beginPath(); ctx.moveTo(lx - 8, T + 31); ctx.lineTo(lx + 8, T + 31); ctx.lineTo(lx + 70, B - 14); ctx.lineTo(lx - 70, B - 14); ctx.closePath(); ctx.fill();
  }

  // His forecast on the big screen, left: the seven-day, and it's his hurricane every day
  const sx = L + 52, sy = B - 128;
  bevel(ctx, sx - 6, sy - 6, 182, 100, '#111827', '#374151', '#030712');
  box(ctx, sx, sy, 170, 88, '#1D4ED8');
  bandedGradient(ctx, sx, sy, 170, 88, ['#1E3A8A', '#1D4ED8', '#2563EB'], 5);
  box(ctx, sx, sy, 170, 12, '#0F172A'); label(ctx, "HECTOR'S 7-DAY", sx + 85, sy + 9, '#FACC15', 5);
  ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].forEach((d, i) => {
    const ix = sx + 13 + i * 24, iy = sy + 42;
    label(ctx, d, ix, sy + 22, '#E0E7FF', 4);
    ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ix, iy, 6, f * 0.1 + i, f * 0.1 + i + Math.PI * 1.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(ix, iy, 2, 0, Math.PI * 2); ctx.stroke();
    label(ctx, '185', ix, iy + 18, '#FCA5A5', 4);
  });
  label(ctx, 'NO CHANGE EXPECTED', sx + 85, sy + 82, '#FFFFFF', 4);
  box(ctx, sx + 80, sy + 94, 10, 20, '#1F2937'); box(ctx, sx + 66, sy + 112, 38, 4, '#1F2937');

  // The camera, right, tally light on
  const kx = R - 130;
  box(ctx, kx - 1, B - 70, 2, 56, '#374151');
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx, B - 40); ctx.lineTo(kx - 26, B - 14); ctx.moveTo(kx, B - 40); ctx.lineTo(kx + 26, B - 14); ctx.stroke();
  bevel(ctx, kx - 34, B - 100, 56, 30, '#1F2937', '#4B5563', '#0B0F19');
  bevel(ctx, kx - 52, B - 94, 20, 18, '#111827', '#374151', '#030712');
  box(ctx, kx - 54, B - 90, 4, 10, '#60A5FA');
  box(ctx, kx + 4, B - 96, 14, 10, '#0B0F19'); label(ctx, '7', kx + 11, B - 88, '#FACC15', 7);
  const tally = f % 40 < 30;
  box(ctx, kx + 14, B - 106, 6, 6, tally ? '#EF4444' : '#7F1D1D');
  if (tally) steppedGlow(ctx, kx + 17, B - 103, 12, '#EF4444', 0.25, 0, 3);
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx - 6, B - 70); ctx.quadraticCurveTo(kx - 60, B - 4, kx - 140, B - 16); ctx.stroke();

  // The telemetry on the glass
  label(ctx, 'LIVE // CH 7 STORM CENTER // PRESSURE 920 hPa', L + 40, T + 40, 'rgba(125, 249, 255, 0.8)', 5, 'left');
  label(ctx, 'WINDS 185 MPH // LOCATION: THE EYE', L + 40, T + 52, 'rgba(125, 249, 255, 0.8)', 5, 'left');

  // The side walls: the wind tunnel's turbine intakes, blades going round behind the grille
  for (const x of [L, R - 24]) {
    bevel(ctx, x, T, 24, B - T, '#1E293B', '#475569', '#0B1220');
    for (let k = 0; k < 3; k++) {
      const y = T + 50 + k * 130;
      box(ctx, x + 3, y, 18, 90, '#0B1220');
      ctx.save(); ctx.beginPath(); ctx.rect(x + 3, y, 18, 90); ctx.clip();
      for (let b = 0; b < 6; b++) { const by = y + ((b * 16 + f * 3) % 96) - 6; box(ctx, x + 3, by, 18, 6, '#94A3B8'); box(ctx, x + 3, by, 18, 1, '#E2E8F0'); }
      ctx.restore();
      for (let g = 0; g < 90; g += 6) box(ctx, x + 3, y + g, 18, 2, '#1E293B');
      box(ctx, x + 3, y - 2, 18, 2, '#475569');
    }
  }

  // The floor: the studio deck, cables, his mark
  box(ctx, L, B - 14, W, 14, '#111827'); box(ctx, L, B - 14, W, 2, '#374151');
  for (let x = L; x < R; x += 40) box(ctx, x, B - 12, 1, 12, '#1F2937');
  box(ctx, cx - 10, B - 13, 20, 2, '#FACC15'); box(ctx, cx - 1, B - 14, 2, 4, '#FACC15');
  label(ctx, 'HECTOR', cx, B - 4, '#FACC15', 4);
  checker(ctx, L, B - 14, W, 2, 'rgba(255,255,255,0.06)', 0);

  // Wind wisps: a calm breeze normally; during the hurricane they rush in toward Hector from both sides, showing
  // which way you're being pulled
  ctx.save();
  ctx.beginPath(); ctx.rect(L, T, W, B - T); ctx.clip();
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    const wy = T + 40 + ((i * 37) % (B - T - 80));
    const wlen = 60 + (i % 3) * 35;
    if (windTargetX === null) {
      ctx.strokeStyle = 'rgba(174, 214, 241, 0.3)';
      const wx = L + ((f * (4 + (i % 4)) + i * 85) % (W + 200)) - 100;
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + wlen, wy); ctx.stroke();
      continue;
    }
    const fromLeft = i % 2 === 0;
    const span = fromLeft ? windTargetX - L : R - windTargetX;
    if (span < 40) continue;
    const travel = ((f * (14 + (i % 4) * 3) + i * 85) % (span + wlen)) - wlen;
    const tail = fromLeft ? L + travel : R - travel;
    const head = fromLeft ? Math.min(windTargetX, tail + wlen) : Math.max(windTargetX, tail - wlen);
    const nearTarget = 1 - Math.min(1, Math.abs(head - windTargetX) / span);
    ctx.strokeStyle = `rgba(200, 235, 255, ${0.25 + 0.4 * nearTarget})`;
    ctx.beginPath(); ctx.moveTo(tail, wy); ctx.lineTo(head, wy); ctx.stroke();
    const dir = fromLeft ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(head, wy); ctx.lineTo(head - dir * 7, wy - 4); ctx.moveTo(head, wy); ctx.lineTo(head - dir * 7, wy + 4); ctx.stroke();
  }
  ctx.restore();
};
