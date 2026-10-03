import React, { useRef, useEffect } from 'react';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE } from '../constants';
import { GameState, createGameState, resetStageState } from '../game/core/state';
import { buildLevel } from '../game/core/level';
import { Cheats, GameEvents, createFrameContext } from '../game/core/context';
import { KeyboardMouseState, HeldButtonGate, readControls } from '../game/platform/input';
import { stepGame } from '../game/core/update';
import { drawWorld } from '../game/render/world';
import { closeAudio } from '../game/platform/audio';
import { setGameMusic, gameMusicCue } from '../game/music';

interface GameCanvasProps extends GameEvents {
  status: GameStatus;
  stageId: string | null;
  currentWeapon: WeaponType;
  /** The weapons he's got (an ammo pickup tops up whichever of them is lowest). */
  availableWeapons: WeaponType[];
  initialAmmo: Record<WeaponType, number>;
  cheats: Cheats;
  bossTauntText: string;
  /** The checkpoint to start the stage at (the skip-level cheat's picker; 0 otherwise). */
  startCheckpoint?: number;
  /** Power is 0..POWER_CELLS (special-move cells, refilling over time). */
  onPlayerUpdate: (health: number, power: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType, lockedTo?: WeaponType, cutscene?: boolean) => void;
}

const FRAME_MS = 1000 / 60;

/**
 * Hosts the canvas and the fixed-timestep game loop. All simulation lives in
 * src/game; this component only wires React props in and HUD updates out.
 */
/** A frame's drawing threw (the next one starts from a clean canvas state); it's been reported once. */
let drawFailed = false, drawWarned = false;

const GameCanvas: React.FC<GameCanvasProps> = (props) => {
  const { status, stageId, currentWeapon, initialAmmo, cheats } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  if (!stateRef.current) stateRef.current = createGameState(stageId, initialAmmo);
  const kbRef = useRef(new KeyboardMouseState());
  const gateRef = useRef(new HeldButtonGate());
  /** The status the loop last ran in, to spot gameplay starting back up. */
  const lastStatusRef = useRef<GameStatus | null>(null);
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

  // The music asks what should be on (the stage's theme and where in it, a mid-boss, the boss, a jingle), and whether he's under water
  useEffect(() => {
    setGameMusic(() => {
      const state = stateRef.current!, p = propsRef.current;
      return { cue: gameMusicCue(state, p.status, p.stageId), muffled: !!state.player.swimming && !state.player.skiing };
    });
  }, []);
  useEffect(() => { stateRef.current!.availableWeapons = props.availableWeapons; }, [props.availableWeapons]);
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
      // (a clean slate each frame: if something threw partway through the last one, its saves and filters don't linger)
      if (drawFailed) { (ctx as CanvasRenderingContext2D & { reset?: () => void }).reset?.(); drawFailed = false; }
      // Everything draws in game pixels (800x600); the backing store is RENDER_SCALE times that
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      try {
        drawWorld(ctx, state, {
          status: p.status,
          stageId: p.stageId,
          currentWeapon: p.currentWeapon,
          invincibilityEnabled: p.cheats.invincible,
          bossTauntText: p.bossTauntText,
        });
      } catch (err) {
        // (a drawing bug mustn't black out the game: the frame's what it is, the next one starts clean)
        drawFailed = true;
        if (!drawWarned) { drawWarned = true; console.error('draw failed', err); }
      }
    };

    const tick = () => {
      const p = propsRef.current;
      const frameCtx = createFrameContext(state, p.stageId, p.currentWeapon, p.cheats, p);
      const raw = readControls(kbRef.current);
      // Back into gameplay from a pause or a menu screen: buttons still held from there don't count
      const last = lastStatusRef.current;
      if (p.status === GameStatus.PLAYING && last !== null && last !== GameStatus.PLAYING && last !== GameStatus.BOSS_TRANSITION) gateRef.current.block(raw);
      lastStatusRef.current = p.status;
      const ranGameplay = stepGame(frameCtx, p.status, gateRef.current.apply(raw));
      if (ranGameplay) {
        const { player } = state;
        // (a set piece that only allows one weapon keeps putting it back in his hands)
        const forcedWeapon: WeaponType | undefined = state.lockWeapon && p.currentWeapon !== state.lockWeapon ? state.lockWeapon : state.shouldSyncWeapon ? 'GUN' : undefined;
        state.shouldSyncWeapon = false;
        // (and whether he's in a little cutscene, out of his hands: the HUD's put away for it)
        p.onPlayerUpdate(player.health, player.power, player.weaponAmmo, forcedWeapon, state.lockWeapon, !!player.inCutscene);
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
      state.checkpoint = propsRef.current.startCheckpoint ?? 0;
      state.stageMemo = {};
      const at = buildLevel(state, stageId, cheats.skipToBoss);
      // (started at a checkpoint: he drops in there, not at the start of the stage)
      state.introAt = state.checkpoint > 0 && at && !cheats.skipToBoss ? at : undefined;
      state.frame = 1;
    }

    // Fixed 60fps timestep (with a 2ms margin to avoid jitter on 60Hz displays)
    let frameId = 0;
    let lastTime = 0;
    // (the weapon-get scene's up over it, black, after its fade-in: the stage under it needn't run, or be drawn, at all)
    const coveredAt = status === GameStatus.BOSS_VICTORY_SPEECH ? performance.now() + 1200 : Infinity;
    const loop = (now: number) => {
      if (now > coveredAt) { frameId = requestAnimationFrame(loop); return; }
      if (lastTime === 0) lastTime = now;
      const elapsed = now - lastTime;
      if (elapsed >= FRAME_MS - 2) {
        // (one bad frame must never stop the game: say what went wrong, clear the canvas state it left behind, carry on)
        try { tick(); } catch (err) {
          console.error('frame failed', err);
          const c = canvasRef.current?.getContext('2d') as (CanvasRenderingContext2D & { reset?: () => void }) | null | undefined;
          c?.reset?.();
        }
        lastTime = now - Math.min(elapsed % FRAME_MS, FRAME_MS);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [status, stageId, cheats.skipToBoss]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH * RENDER_SCALE} height={CANVAS_HEIGHT * RENDER_SCALE} className="block bg-black w-[800px] h-[600px]" />;
};

export default GameCanvas;
