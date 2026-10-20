// Meathead the cat's death (whatever killed him in the cartoon White House: the engine's startCatDeath hands every one of
// them over here, 'own:cat'). A cartoon cat's: a hit and he goes rigid, every hair stood up, and springs straight up
// in the air yowling; comes down flat on his back, all four legs stuck straight up, X'd out, his tongue lolling; then
// his ghost peels up out of him (pale, see-through, a halo, little wings flapping, eyes shut) and floats off up out of
// the picture. No blood (the projection hides all that). Then the death screen.

import { registerDeathAnim } from '../../../m1/game/player/deathAnim';
import { registerDeathDraw } from '../../../m1/game/render/player/deathAnim';
import { beginSprite, endSprite } from '../../../m1/game/render/player/spriteOutline';
import { drawCatFig, setCatFace, setCatTail, setCatClaws, setCatGhost, setCatBody, type CatFig } from '../../../m1/game/render/player/catBody';
import { setNude } from '../../../m1/game/render/player/body';
import { playSound } from '../../../m1/game/platform/audio';
import { INK } from '../kit';

export const CAT_DEATH = 'own:cat' as const;
const JUMP = 16, LAND = 26, GHOST = 46, FRAMES = 150;

registerDeathAnim(CAT_DEATH, {
  frames: FRAMES, airOk: true,
  tick: (ctx, d, t) => {
    if (t === 1) { playSound('hurt', 1, 6); playSound('boing', 0.8, 4); }
    if (t === LAND) playSound('thud', 0.8, -2);
    if (t === GHOST) playSound('twinkle', 0.7, 0);
    if (t === GHOST + 40) playSound('twinkle', 0.4, 5);
    void ctx; void d;
  },
});

/** Stood stiff, every hair up, legs and arms splayed. */
const STIFF: CatFig = { hip: [0, -26], lean: 0, tN: [8, 0], tF: [-8, 0], fN: [22, -58], fF: [-20, -58], mood: 'yell' };
/** Flat on his back, legs and paws straight up. */
const DEAD: CatFig = { hip: [6, -8], lean: -Math.PI / 2, tN: [6, -36], tF: [12, -32], fN: [-14, -42], fF: [-22, -24], mood: 'grit', headRot: 0.1 };
/** His ghost: stood, arms out a little, eyes shut, at peace (for once). */
const GHOSTLY: CatFig = { hip: [0, -24], lean: 0, tN: [4, 0], tF: [-3, -2], fN: [16, -44], fF: [-14, -44], mood: 'grit' };

registerDeathDraw(CAT_DEATH, (c, state, d, _weapon, t, f) => {
  const floor = d.floor ?? d.y, nude = state.player.gut?.stage === 3;
  setCatBody(true); setNude(nude, 0, 0, f, d.facing);
  const put = (x: number, y: number, rot: number, q: CatFig, faceOf: Parameters<typeof setCatFace>[0], tail: [number, number, boolean]) => {
    const s = beginSprite(c), g = s ?? c;
    g.save();
    if (!s) g.translate(x, y);
    g.scale(d.facing, 1); g.rotate(rot);
    setCatFace(faceOf); setCatTail(tail[0], tail[1], tail[2]); setCatClaws(t < LAND, t < LAND);
    drawCatFig(g, q, f);
    g.restore();
    if (s) endSprite(c, x, y);
    setCatFace({}); setCatClaws(false); setCatTail(0, 0.5);
  };
  if (t < JUMP) {
    // Rigid, springing straight up, yowling
    const k = t / JUMP, up = Math.sin(k * Math.PI) * 46;
    put(d.x, floor - up, 0, STIFF, { eyes: 'wide', ears: 'flat', mouth: 'yowl', puff: true }, [0, 1, true]);
  } else if (t < LAND) {
    // Over backward on the way down
    const k = (t - JUMP) / (LAND - JUMP);
    put(d.x, floor - Math.sin((1 - k) * Math.PI * 0.5) * 18, -k * Math.PI / 2, STIFF, { eyes: 'x', ears: 'flat', mouth: 'yowl', puff: true }, [0, 1, true]);
  } else {
    // Flat on his back, legs up stiff (a bounce as he lands), X'd out, tongue out
    const bounce = t < LAND + 8 ? Math.sin(((t - LAND) / 8) * Math.PI) * 4 : 0;
    put(d.x, floor - bounce, 0, DEAD, { eyes: 'x', ears: 'back', mouth: 'tongue' }, [0, 0, false]);
    // (dizzy birdies round his head a while)
    if (t < GHOST + 20) for (let i = 0; i < 3; i++) {
      const a = f * 0.18 + (i / 3) * Math.PI * 2, hx = d.x - d.facing * 30, hy = floor - 24;
      c.fillStyle = INK; c.fillRect(Math.round(hx + Math.cos(a) * 16) - 2, Math.round(hy + Math.sin(a) * 5) - 2, 5, 5);
      c.fillStyle = '#FDE047'; c.fillRect(Math.round(hx + Math.cos(a) * 16) - 1, Math.round(hy + Math.sin(a) * 5) - 1, 3, 3);
    }
  }
  // His ghost, up out of him and away
  if (t >= GHOST) {
    const k = (t - GHOST) / (FRAMES - GHOST), gx = d.x - d.facing * 10 + Math.sin(t * 0.07) * 8, gy = floor - 10 - k * 260;
    c.save(); c.globalAlpha = 0.6 * Math.min(1, (t - GHOST) / 12) * (k > 0.8 ? (1 - k) / 0.2 : 1);
    c.translate(gx, gy); c.scale(d.facing, 1);
    // (little wings, flapping, behind him)
    const flap = Math.sin(t * 0.5) * 0.4;
    for (const s of [-1, 1]) {
      c.save(); c.translate(-8, -46); c.rotate(-0.6 + s * 0.2 + flap * s);
      c.fillStyle = INK; c.beginPath(); c.ellipse(-12, 0, 15, 7, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(-12, 0, 13, 5.5, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#CBD5E1'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-4 - i * 6, -3); c.lineTo(-8 - i * 6, 4); c.stroke(); }
      c.restore();
    }
    setCatGhost(true); setCatFace({ eyes: 'shut', ears: 'up' }); setCatTail(Math.sin(t * 0.1), 0.6);
    drawCatFig(c, GHOSTLY, f);
    setCatGhost(false); setCatFace({}); setCatTail(0, 0.5);
    // (the halo)
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.ellipse(4, -86, 12, 3.5, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#FDE047'; c.lineWidth = 2.2; c.stroke();
    c.restore();
  }
  setCatBody(!!state.player.catForm);
});
