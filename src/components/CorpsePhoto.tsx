import React, { useEffect, useRef } from 'react';
import { WeaponType } from '../types';
import { drawBossCorpse } from '../game/render/corpses';

// The scene is drawn in game pixels, then scaled down to fit the photo
const SCENE_W = 190, SCENE_H = 100, FLOOR = 86;
const RES = 2;

/**
 * An evidence photo of a boss killed with his weakness: the same wrecked corpse
 * left in the arena, still dripping and buzzing with flies.
 */
const CorpsePhoto: React.FC<{ bossId: string; weapon: WeaponType }> = ({ bossId, weapon }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const corpse = { stageId: bossId, weapon, x: SCENE_W / 2, y: FLOOR, facing: 1 as const, frame0: 0 };
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
      try { drawBossCorpse(ctx, corpse, frame); } catch { /* a photo is never worth a crash */ }
      frame++;
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [bossId, weapon]);

  return <canvas ref={ref} width={SCENE_W * RES} height={SCENE_H * RES} className="block w-full h-auto" style={{ imageRendering: 'auto' }} />;
};

export default CorpsePhoto;
