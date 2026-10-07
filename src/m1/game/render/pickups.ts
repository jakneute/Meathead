// Health and ammo lying about: a protein shaker and a whole tub of whey (health), a box of rounds and an army ammo can
// (ammo). Each sits on its spot with a soft glow round it that breathes (red for health, gold for ammo), bobs a little,
// catches a glint now and then, and blinks when it's about to be gone.

import type { Pickup } from '../../types';

type Ctx = CanvasRenderingContext2D;

/** How long before it's gone it starts blinking (frames). */
const BLINK_FROM = 120;

export const drawPickup = (ctx: Ctx, p: Pickup, frame: number) => {
  if (p.life < BLINK_FROM && Math.floor(frame / 4) % 2 === 0) return;
  const health = p.type.includes('health');
  const big = p.type.startsWith('large');
  const seed = hashId(p.id);
  const cx = p.pos.x + p.width / 2, floor = p.pos.y + p.height;
  const bob = Math.sin(frame * 0.08 + seed) * 2 - 2;
  // The glow, breathing
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1 + seed);
  const r = (big ? 30 : 22) + pulse * 4;
  const g = ctx.createRadialGradient(cx, floor - 12 + bob, 2, cx, floor - 12 + bob, r);
  const glow = health ? '239, 68, 68' : '250, 204, 21';
  g.addColorStop(0, `rgba(${glow}, ${0.35 + pulse * 0.2})`); g.addColorStop(1, `rgba(${glow}, 0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, floor - 12 + bob, r, 0, Math.PI * 2); ctx.fill();
  // Its shadow on the ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.beginPath(); ctx.ellipse(cx, floor, big ? 14 : 9, 2.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(cx, floor + bob);
  if (p.type === 'small_health') shaker(ctx);
  else if (p.type === 'large_health') tub(ctx);
  else if (p.type === 'small_ammo') rounds(ctx);
  else ammoCan(ctx);
  // A glint that runs across it now and then
  const gt = (frame + seed * 37) % 150;
  if (gt < 10) {
    const h = big ? 26 : 20, w = big ? 30 : 18;
    ctx.globalAlpha = 1 - gt / 10;
    ctx.fillStyle = '#FFFFFF';
    const x = -w / 2 + (gt / 10) * w;
    ctx.fillRect(x, -h, 2, h - 2);
    ctx.globalAlpha = 1;
  }
  // A sparkle over it
  const st = (frame + seed * 13) % 90;
  if (st < 16) {
    const s = Math.sin((st / 16) * Math.PI) * 4;
    const sx = ((seed * 7) % 16) - 8, sy = -(big ? 32 : 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(sx - s, sy - 0.5, s * 2, 1); ctx.fillRect(sx - 0.5, sy - s, 1, s * 2);
  }
  ctx.restore();
};

const hashId = (id: string) => { let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return Math.abs(h) % 1000; };

/** A protein shaker: clear-ish bottle, chocolate shake in it, a red flip cap, a red cross on the side. */
const shaker = (ctx: Ctx) => {
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-7, -20, 14, 20);                 // outline
  ctx.fillStyle = '#E5E7EB'; ctx.fillRect(-6, -19, 12, 18);                 // bottle
  ctx.fillStyle = '#92400E'; ctx.fillRect(-6, -11, 12, 10);                 // the shake
  ctx.fillStyle = '#B45309'; ctx.fillRect(-6, -11, 12, 2);
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-7, -24, 14, 5);                  // cap
  ctx.fillStyle = '#991B1B'; ctx.fillRect(-2, -26, 5, 3);                   // spout
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4, -9, 8, 6);                    // label
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-1, -8, 2, 4); ctx.fillRect(-3, -7, 6, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-5, -18, 2, 7);     // shine
};

/** A whole tub of whey: a big black tub, a red lid, WHEY on a white label with a red cross. */
const tub = (ctx: Ctx) => {
  ctx.fillStyle = '#0B0B0F'; ctx.fillRect(-13, -26, 26, 26);
  ctx.fillStyle = '#1F2937'; ctx.fillRect(-12, -25, 24, 24);
  ctx.fillStyle = '#374151'; ctx.fillRect(-12, -25, 4, 24);                 // its roundness
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-14, -31, 28, 6);                 // lid
  ctx.fillStyle = '#F87171'; ctx.fillRect(-14, -31, 28, 2);
  ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-10, -20, 20, 13);                // label
  ctx.fillStyle = '#DC2626'; ctx.fillRect(-1, -19, 2, 6); ctx.fillRect(-3, -17, 6, 2);
  ctx.fillStyle = '#111827'; ctx.font = 'bold 4px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('WHEY', 0, -8); ctx.textAlign = 'left';
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-10, -6, 20, 2);                  // a gold stripe
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(8, -24, 2, 22);
};

/** A box of rounds: an olive cardboard box, flap open, brass tips showing. */
const rounds = (ctx: Ctx) => {
  ctx.fillStyle = '#1C1917'; ctx.fillRect(-10, -14, 20, 14);
  ctx.fillStyle = '#65A30D'; ctx.fillRect(-9, -13, 18, 12);
  ctx.fillStyle = '#4D7C0F'; ctx.fillRect(-9, -5, 18, 4);
  // The tips, in a row
  for (let i = 0; i < 5; i++) {
    const x = -8 + i * 3.5;
    ctx.fillStyle = '#B45309'; ctx.fillRect(x, -18, 3, 5);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(x, -21, 3, 3);
    ctx.fillStyle = '#FEF3C7'; ctx.fillRect(x, -21, 1, 2);
  }
  ctx.fillStyle = '#4D7C0F'; ctx.save(); ctx.translate(9, -13); ctx.rotate(-0.6); ctx.fillRect(0, -2, 10, 3); ctx.restore(); // the flap
  ctx.fillStyle = '#FDE047'; ctx.fillRect(-6, -10, 12, 2);                  // a band of yellow print
};

/** An army ammo can: olive drab, the latch and carry handle, AMMO stenciled in yellow. */
const ammoCan = (ctx: Ctx) => {
  ctx.fillStyle = '#1A2E05'; ctx.fillRect(-15, -22, 30, 22);
  ctx.fillStyle = '#4D5A1E'; ctx.fillRect(-14, -21, 28, 20);
  ctx.fillStyle = '#5F6F26'; ctx.fillRect(-14, -21, 28, 4);                 // the lid
  ctx.fillStyle = '#3F4A18'; ctx.fillRect(-14, -17, 28, 1);
  ctx.strokeStyle = '#1A2E05'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(-6, -26); ctx.lineTo(6, -26); ctx.lineTo(6, -22); ctx.stroke(); // handle
  ctx.fillStyle = '#6B7280'; ctx.fillRect(10, -20, 4, 6);                   // latch
  ctx.fillStyle = '#FACC15'; ctx.font = 'bold 6px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText('AMMO', 0, -7); ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-13, -15, 2, 13);
};
