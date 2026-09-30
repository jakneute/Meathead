import React, { useEffect, useRef } from 'react';
import { WeaponType } from '../types';
import { drawBossCorpse } from '../game/render/bosses/corpses';
import { drawBoss } from '../game/render/bosses';
import { createBoss } from '../game/bosses/registry';

// The scene is drawn in game pixels, then scaled down to fit the photo
const SCENE_W = 190, SCENE_H = 100, FLOOR = 86;
const RES = 2;

/**
 * An evidence photo of a dead boss. Killed with his weakness: the same wrecked corpse left in the arena, still
 * dripping and buzzing with flies. Killed any other way (weapon null): him in one piece, over on his side where he
 * fell, gone grey, a pool of it under him and a chalk line round him.
 */
const CorpsePhoto: React.FC<{ bossId: string; weapon: WeaponType | null }> = ({ bossId, weapon }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const corpse = { stageId: bossId, weapon: weapon ?? 'GUN', x: SCENE_W / 2, y: FLOOR, facing: 1 as const, frame0: 0 };
    let frame = 240; // long enough after death for everything to have slumped and settled
    let id = 0;
    const draw = () => {
      ctx.setTransform(RES, 0, 0, RES, 0, 0);
      // Flash-lit crime scene: dark room, concrete floor
      const bg = ctx.createRadialGradient(SCENE_W / 2, FLOOR - 30, 10, SCENE_W / 2, FLOOR - 30, SCENE_W * 0.7);
      bg.addColorStop(0, '#4a4540');
      bg.addColorStop(1, '#141210');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);
      ctx.fillStyle = '#2a2724';
      ctx.fillRect(0, FLOOR, SCENE_W, SCENE_H - FLOOR);
      try {
        if (weapon) drawBossCorpse(ctx, corpse, frame);
        else drawFallen(ctx, bossId);
      } catch { /* a photo is never worth a crash */ }
      frame++;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [bossId, weapon]);

  return <canvas ref={ref} width={SCENE_W * RES} height={SCENE_H * RES} className="block w-full h-auto" style={{ imageRendering: 'auto' }} />;
};

/** Him as he was, lying where he went over: drawn standing, turned onto his back about his heels, grey. */
const drawFallen = (ctx: CanvasRenderingContext2D, bossId: string) => {
  const e = createBoss(bossId);
  const scale = 0.8;
  // (lying along the floor: he's as long as he was tall)
  ctx.save();
  // the pool, and the chalk
  ctx.fillStyle = 'rgba(127, 29, 29, 0.75)'; ctx.beginPath(); ctx.ellipse(SCENE_W / 2, FLOOR + 3, e.height * scale * 0.55, 5, 0, 0, Math.PI * 2); ctx.fill();
  // (standing, his feet are at 0,0 and he's up the -y; turned a quarter over, he's along the floor, head to the left,
  // and lifted by half his width so he's lying on it)
  ctx.translate(SCENE_W / 2 + (e.height * scale) / 2, FLOOR - (e.width * scale) / 2);
  ctx.scale(scale, scale);
  ctx.rotate(-Math.PI / 2);
  ctx.filter = 'grayscale(0.6) brightness(0.8)';
  e.pos = { x: -e.width / 2, y: -e.height };
  e.facing = 1;
  drawBoss(ctx, e, bossId, 0);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 245, 244, 0.7)'; ctx.lineWidth = 1; ctx.setLineDash([3, 2]);
  ctx.beginPath(); ctx.ellipse(SCENE_W / 2, FLOOR - (e.width * scale) / 2, (e.height * scale) / 2 + 8, (e.width * scale) / 2 + 6, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
};

export default CorpsePhoto;
