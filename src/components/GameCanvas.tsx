import React, { useRef, useEffect } from 'react';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COOLDOWN_CHARGE, COOLDOWN_UPPERCUT } from '../constants';
import { GameState, createGameState, resetStageState } from '../game/state';
import { buildLevel } from '../game/level';
import { Cheats, GameEvents, createFrameContext } from '../game/context';
import { KeyboardMouseState, readControls } from '../game/input';
import { stepGame } from '../game/update';
import { drawWorld } from '../game/render/worldRenderer';
import { closeAudio } from '../game/audio';

interface GameCanvasProps extends GameEvents {
  status: GameStatus;
  stageId: string | null;
  currentWeapon: WeaponType;
  initialAmmo: Record<WeaponType, number>;
  cheats: Cheats;
  bossTauntText: string;
  /** Meters are 0..1: how ready the charge and uppercut are (0 while on cooldown or spent until landing). */
  onPlayerUpdate: (health: number, chargeMeter: number, uppercutMeter: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType) => void;
}

const FRAME_MS = 1000 / 60;

/**
 * Hosts the canvas and the fixed-timestep game loop. All simulation lives in
 * src/game; this component only wires React props in and HUD updates out.
 */
const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const { status, stageId, currentWeapon, initialAmmo, cheats } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  if (!stateRef.current) stateRef.current = createGameState(stageId, initialAmmo);
  const kbRef = useRef(new KeyboardMouseState());
  // The loop reads the latest props through this ref instead of restarting on every change.
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const detach = kbRef.current.attach(window);
    return () => {
      detach();
      closeAudio();
    };
  }, []);

  useEffect(() => { stateRef.current!.player.currentWeapon = currentWeapon; }, [currentWeapon]);
  useEffect(() => { stateRef.current!.stageId = stageId; }, [stageId]);
  useEffect(() => {
    const state = stateRef.current!;
    if (state.deathTimer <= 0) state.player.weaponAmmo = { ...initialAmmo };
  }, [initialAmmo]);

  useEffect(() => {
    const state = stateRef.current!;

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const p = propsRef.current;
      drawWorld(ctx, state, {
        status: p.status,
        stageId: p.stageId,
        currentWeapon: p.currentWeapon,
        invincibilityEnabled: p.cheats.invincible,
        bossTauntText: p.bossTauntText,
      });
    };

    const tick = () => {
      const p = propsRef.current;
      const frameCtx = createFrameContext(state, p.stageId, p.currentWeapon, p.cheats, p);
      const ranGameplay = stepGame(frameCtx, p.status, readControls(kbRef.current));
      if (ranGameplay) {
        const { player } = state;
        const forcedWeapon: WeaponType | undefined = state.shouldSyncWeapon ? 'GUN' : undefined;
        state.shouldSyncWeapon = false;
        const meter = (used: boolean, cooldown: number, max: number) => used ? 0 : 1 - cooldown / max;
        p.onPlayerUpdate(
          player.health,
          meter(player.chargeUsed, player.chargeCooldown, COOLDOWN_CHARGE),
          meter(player.uppercutUsed, player.uppercutCooldown, COOLDOWN_UPPERCUT),
          player.weaponAmmo,
          forcedWeapon,
        );
      }
      draw();
    };

    // In menus: clear the stage and draw a single blank frame
    if (status === GameStatus.START || status === GameStatus.STAGE_SELECT || status === GameStatus.ENDING) {
      resetStageState(state);
      state.bossCheckpoint = false;
      state.frame = 0;
      draw();
      return;
    }

    // First frame of a new stage
    if (state.frame === 0 && status === GameStatus.LEVEL_INTRO) {
      resetStageState(state);
      state.bossCheckpoint = false;
      buildLevel(state, stageId, cheats.skipToBoss);
      state.frame = 1;
    }

    // Fixed 60fps timestep (with a 2ms margin to avoid jitter on 60Hz displays)
    let frameId = 0;
    let lastTime = 0;
    const loop = (now: number) => {
      if (lastTime === 0) lastTime = now;
      const elapsed = now - lastTime;
      if (elapsed >= FRAME_MS - 2) {
        tick();
        lastTime = now - Math.min(elapsed % FRAME_MS, FRAME_MS);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [status, stageId, cheats.skipToBoss]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="block bg-black w-[800px] h-[600px]" />;
};

export default GameCanvas;
