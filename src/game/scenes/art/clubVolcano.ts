// Victor's volcano, dressed as what it is: a nightclub. Searchlights sweeping up
// out of the crater, a neon ring round its rim, lasers, CLUB CALDERA in neon down
// its flank, rows of lit windows where the club's dug into the mountain, and the
// front door at its foot. Shared by the trail's backdrop (it comes into view the
// closer you get), the VIP lounge's wide shot, and the corked volcano's finale.

type Ctx = CanvasRenderingContext2D;
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const NEON = ['#F472B6', '#22D3EE', '#A78BFA', '#FB923C'];

export interface ClubVolcano {
  /** The crater's middle, its top, the foot of the mountain; half its width at the foot and at the crater. */
  cx: number; top: number; base: number; half: number; crater: number;
  /** Its scale (1 = close up), the frame. */
  s: number; f: number;
  /** How much of it shows (0 far off .. 1), and whether the power's on (0 blacked out .. 1). */
  show: number; power?: number;
  /** A spot on it to keep clear (the VIP lounge's window in the wide shot). */
  keepClear?: { x: number; y: number; r: number };
}

export const drawClubVolcano = (ctx: Ctx, v: ClubVolcano) => {
  const { cx, top, base, half, crater, s, f } = v;
  const a = Math.max(0, Math.min(1, v.show)) * (v.power ?? 1);
  if (a <= 0.01) return;
  const h = base - top;
  const beat = Math.floor(f / 30);
  const widthAt = (y: number) => crater + (half - crater) * ((y - top) / h);
  ctx.save();
  // Searchlights, sweeping up out of the crater into the sky
  for (let i = 0; i < 3; i++) {
    const ang = -Math.PI / 2 + Math.sin(f * 0.012 + i * 2.1) * 0.55;
    const len = 900 * Math.max(0.5, s), spread = 0.06;
    const col = i === 1 ? '254, 240, 138' : i === 0 ? '244, 114, 182' : '34, 211, 238';
    const g = ctx.createLinearGradient(cx, top, cx + Math.cos(ang) * len, top + Math.sin(ang) * len);
    g.addColorStop(0, `rgba(${col}, ${0.35 * a})`); g.addColorStop(1, `rgba(${col}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx + (i - 1) * crater * 0.5, top);
    ctx.lineTo(cx + Math.cos(ang - spread) * len, top + Math.sin(ang - spread) * len);
    ctx.lineTo(cx + Math.cos(ang + spread) * len, top + Math.sin(ang + spread) * len);
    ctx.closePath(); ctx.fill();
  }
  // Lasers fanning out over the rim, on the beat
  if (beat % 2 === 0) {
    ctx.strokeStyle = `rgba(74, 222, 128, ${0.5 * a})`; ctx.lineWidth = Math.max(1, 1.5 * s);
    for (let i = 0; i < 5; i++) { const ang = -Math.PI * (0.15 + i * 0.175) + Math.sin(f * 0.05) * 0.1; ctx.beginPath(); ctx.moveTo(cx, top - 4 * s); ctx.lineTo(cx + Math.cos(ang) * 260 * s, top + Math.sin(ang) * 260 * s); ctx.stroke(); }
  }
  // Rows of lit windows, where the club's dug into the mountain (colors chasing on the beat)
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y = top + h * (0.2 + r * 0.11);
    const w = widthAt(y) * 0.72;
    const n = Math.max(2, Math.floor((w * 2) / Math.max(10, 26 * s)));
    for (let k = 0; k < n; k++) {
      const x = cx - w + (k + 0.5) * (w * 2) / n;
      if (v.keepClear && Math.hypot(x - v.keepClear.x, y - v.keepClear.y) < v.keepClear.r) continue;
      if (hash(r * 31 + k) < 0.35) continue;
      const lit = (k + r + beat) % 4 !== 0;
      ctx.fillStyle = lit ? NEON[(k + r * 2 + beat) % 4] : '#1C0F14';
      ctx.globalAlpha = a * (lit ? 0.85 : 0.6);
      ctx.fillRect(x - 4 * s, y - 2.5 * s, 8 * s, 5 * s);
    }
  }
  ctx.globalAlpha = 1;
  // The neon ring round the crater's rim
  ctx.save();
  ctx.shadowColor = '#F472B6'; ctx.shadowBlur = 10 * s;
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.9 * a})`; ctx.lineWidth = Math.max(1.5, 3 * s);
  ctx.beginPath(); ctx.ellipse(cx, top + 2 * s, crater * 1.05, 5 * s, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  // CLUB CALDERA down its flank, in neon, buzzing
  const on = hash(Math.floor(f / 6) * 7.3) > 0.05;
  const size = Math.max(6, Math.round(22 * s));
  const sy = top + h * 0.42;
  ctx.save();
  ctx.font = `bold ${size}px "Press Start 2P"`; ctx.textAlign = 'center';
  ctx.shadowColor = '#FB923C'; ctx.shadowBlur = on ? 14 * s : 0;
  ctx.globalAlpha = a;
  ctx.fillStyle = on ? '#FDBA74' : '#7C2D12';
  ctx.fillText('CLUB', cx - 30 * s, sy);
  ctx.fillText('CALDERA', cx - 30 * s, sy + size * 1.3);
  // A neon cocktail glass beside it
  ctx.strokeStyle = on ? '#22D3EE' : '#164E63'; ctx.lineWidth = Math.max(1, 2.5 * s);
  const gx = cx + 110 * s, gy = sy - 4 * s;
  ctx.beginPath(); ctx.moveTo(gx - 14 * s, gy - 14 * s); ctx.lineTo(gx + 14 * s, gy - 14 * s); ctx.lineTo(gx, gy + 2 * s); ctx.closePath();
  ctx.moveTo(gx, gy + 2 * s); ctx.lineTo(gx, gy + 16 * s); ctx.moveTo(gx - 8 * s, gy + 16 * s); ctx.lineTo(gx + 8 * s, gy + 16 * s); ctx.stroke();
  ctx.restore();
  // The front door at its foot: a neon arch, the red carpet out of it
  const dx = cx - half * 0.35, dw = 26 * s, dh = 30 * s;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#0A0406'; ctx.fillRect(dx - dw / 2, base - dh, dw, dh);
  ctx.shadowColor = '#F472B6'; ctx.shadowBlur = 8 * s;
  ctx.strokeStyle = '#F472B6'; ctx.lineWidth = Math.max(1, 2 * s);
  ctx.beginPath(); ctx.moveTo(dx - dw / 2, base); ctx.lineTo(dx - dw / 2, base - dh * 0.6); ctx.arc(dx, base - dh * 0.6, dw / 2, Math.PI, 0); ctx.lineTo(dx + dw / 2, base); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#B91C1C'; ctx.beginPath(); ctx.moveTo(dx - dw * 0.3, base); ctx.lineTo(dx + dw * 0.3, base); ctx.lineTo(dx + dw * 0.7, base + 6 * s); ctx.lineTo(dx - dw * 0.7, base + 6 * s); ctx.fill();
  ctx.restore();
  ctx.restore();
};
