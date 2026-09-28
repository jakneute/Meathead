// A screen full of cloud, parting as you fall through it. The deploy transition
// (target select into a stage) dives into it, and the stage's skyfall intro
// comes out of it, so the two meet seamlessly.

type Ctx = CanvasRenderingContext2D;

/** How far through the clouds the deploy transition's dive ends (the skyfall intro carries on from here). */
export const DEPLOY_CLOUD_SCROLL_END = 1200;
/** How fast the clouds stream past him as he falls out of them into the stage (per frame). */
export const SKYFALL_CLOUD_SPEED = 40;

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * cover: 1 is solid cloud, 0 is clear. scroll: how far you've fallen through it
 * (the puffs stream up past you as it grows).
 */
export const drawSkyClouds = (ctx: Ctx, w: number, h: number, cover: number, scroll: number) => {
  if (cover <= 0) return;
  ctx.save();
  // The murk between the puffs
  ctx.fillStyle = `rgba(214, 222, 234, ${clamp01(cover * 1.4 - 0.4)})`;
  ctx.fillRect(0, 0, w, h);
  const span = h * 1.8;
  for (let i = 0; i < 46; i++) {
    const speed = 0.6 + hash(i) * 0.9;
    const px = hash(i + 50) * (w + 200) - 100;
    const py = ((hash(i + 90) * span - scroll * speed) % span + span) % span - h * 0.4;
    const r = (55 + hash(i + 9) * 95) * (0.55 + cover * 0.6);
    ctx.globalAlpha = clamp01(cover * (0.7 + hash(i + 3) * 0.5));
    // A lit top and a shaded belly
    ctx.fillStyle = '#B8C4D6';
    ctx.beginPath(); ctx.ellipse(px, py + r * 0.18, r * 1.25, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath(); ctx.ellipse(px - r * 0.1, py, r * 1.1, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + r * 0.45, py - r * 0.18, r * 0.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};
