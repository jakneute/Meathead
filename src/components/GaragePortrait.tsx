import React, { useEffect, useRef } from 'react';

/**
 * The only picture anybody's got of the garage: a grainy surveillance still, at night, of what might be a roll-up door,
 * light under it, a big shape in the window. Or possibly a different garage. The timestamp doesn't agree with itself.
 */
const GaragePortrait: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    let raf = 0, f = 0;
    const W = 120, H = 120;
    const draw = () => {
      f++;
      ctx.fillStyle = '#0B0F0C'; ctx.fillRect(0, 0, W, H);
      // The building, the door, the light under it
      ctx.fillStyle = '#1F2A22'; ctx.fillRect(12, 34, 96, 70);
      ctx.fillStyle = '#2E3B31'; ctx.fillRect(24, 52, 56, 52);
      ctx.fillStyle = '#243027'; for (let y = 56; y < 104; y += 7) ctx.fillRect(24, y, 56, 2);
      ctx.fillStyle = 'rgba(190, 242, 100, 0.55)'; ctx.fillRect(24, 102, 56, 2);
      ctx.fillStyle = '#1A221C'; ctx.beginPath(); ctx.moveTo(6, 36); ctx.lineTo(60, 14); ctx.lineTo(114, 36); ctx.closePath(); ctx.fill();
      // The window, and something very big in it
      ctx.fillStyle = 'rgba(190, 242, 100, 0.35)'; ctx.fillRect(86, 58, 16, 14);
      ctx.fillStyle = '#0B0F0C'; ctx.beginPath(); ctx.arc(94, 66, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(88, 68, 14, 6);
      // Grain, a scan line, a question mark somebody drew on the print
      for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(200, 255, 200, ${Math.random() * 0.12})`; ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1); }
      const sy = (f * 0.8) % H; ctx.fillStyle = 'rgba(200, 255, 200, 0.07)'; ctx.fillRect(0, sy, W, 3);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(60, 70, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)'; ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'; ctx.fillText('?', 60, 32);
      ctx.fillStyle = 'rgba(190, 242, 100, 0.8)'; ctx.font = '7px monospace'; ctx.textAlign = 'left';
      ctx.fillText(`CAM ?? ${Math.floor(f / 30) % 2 ? '03:71' : '14:02'} AM`, 4, 114);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} width={120} height={120} className="w-full h-full block" style={{ imageRendering: 'pixelated' }} />;
};

export default GaragePortrait;
