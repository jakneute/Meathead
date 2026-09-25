import React, { useEffect, useRef } from 'react';
import { Enemy } from '../types';
import { drawBoss } from '../game/render/bosses';

/**
 * Stage-select portrait: the boss's actual in-game sprite, drawn big and
 * animated, so the card always matches how he looks in the fight.
 */

const SIZE = 240;
const SCALE = 2.6;

/** Backdrop colours (inner glow, outer edge) for each boss's card. */
const BACKDROPS: Record<string, [string, string]> = {
  'Artie Avalanche': ['#1F5F8B', '#0D1B2A'],
  'Victor Volcano': ['#8E2A0B', '#1A0602'],
  'Ernie Earthquake': ['#6D4C41', '#1C1C1C'],
  'Hector Hurricane': ['#1F6E8C', '#0E2F44'],
  'Toxic Tommy': ['#2E7D32', '#091A0D'],
  'Blackout Barry': ['#4A2A7A', '#06020D'],
  'Oily Oscar': ['#7A4A1C', '#1A110F'],
  'Drug Trade Dale': ['#B0306A', '#2A0A2E'],
};

/** How each boss poses for his portrait (a calm, fully-visible state). */
const POSES: Record<string, Partial<Enemy>> = {
  'Toxic Tommy': { bossState: 'emerge_shatter' },
  'Oily Oscar': { hasCigarette: true, oscarFacing: 1 },
};

const makeSitter = (id: string): Enemy => ({
  id: 'boss', pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, width: 80, height: 80, health: 666, maxHealth: 666,
  type: 'boss', enemyType: 'tank', behavior: 'shoot', patrolRange: 0, initialX: 0, shootTimer: 0,
  bossState: 'idle', stateTimer: 60, ...POSES[id],
});

const BossPortrait: React.FC<{ id: string }> = ({ id }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const sitter = makeSitter(id);
    const [inner, outer] = BACKDROPS[id] || ['#444444', '#111111'];
    let frame = 0, raf = 0;

    const draw = () => {
      frame++;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const bg = ctx.createRadialGradient(SIZE / 2, SIZE * 0.4, 10, SIZE / 2, SIZE / 2, SIZE * 0.75);
      bg.addColorStop(0, inner);
      bg.addColorStop(1, outer);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);
      // Head and shoulders: the sprite's top half fills the card, centred
      ctx.translate(SIZE / 2 - 40 * SCALE, SIZE * 0.14);
      ctx.scale(SCALE, SCALE);
      ctx.save();
      drawBoss(ctx, sitter, id, frame);
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return <canvas ref={ref} width={SIZE} height={SIZE} className="w-full h-full" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

export default BossPortrait;
