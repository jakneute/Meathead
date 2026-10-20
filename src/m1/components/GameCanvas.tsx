import React, { useRef, useEffect } from 'react';
import { GameStatus, WeaponType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, RENDER_SCALE } from '../constants';
import { GameState, createGameState, resetStageState } from '../game/core/state';
import { buildLevel } from '../game/core/level';
import { Cheats, GameEvents, createFrameContext } from '../game/core/context';
import { KeyboardMouseState, HeldButtonGate, readControls } from '../game/platform/input';
import { stepGame } from '../game/core/update';
import { canSkip } from '../game/platform/skip';
import { drawWorld } from '../game/render/world';
import { PUBLIC_BUILD } from '../build';
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
  /** Invincible without the flicker that shows it (Meathead 2's test build: he just can't be hurt). */
  quietInvincible?: boolean;
  /** Handed the game's state once, as it's made (Meathead 2's cheats set his pants on it). */
  onState?: (state: GameState) => void;
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
/** (dev: every failed draw / frame counted, with its last error, for the smoke test: tools/smoke/run.mjs) */
const noteFail = (kind: 'draw' | 'frame', err: unknown) => {
  if (!import.meta.env.DEV) return;
  const w = window as unknown as { __smoke?: { draw: number; frame: number; lastDraw?: string; lastFrame?: string } };
  const s = (w.__smoke ??= { draw: 0, frame: 0 });
  const e = err as Error, msg = `${e?.message ?? String(err)} | ${String(e?.stack ?? '').split('\n').slice(1, 4).map(t => t.trim()).join(' | ')}`;
  if (kind === 'draw') { s.draw++; s.lastDraw = msg; } else { s.frame++; s.lastFrame = msg; }
};

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

  useEffect(() => { props.onState?.(stateRef.current!); }, []);
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
          invincibilityEnabled: p.cheats.invincible && !p.quietInvincible,
          bossTauntText: p.bossTauntText,
        });
      } catch (err) {
        // (a drawing bug mustn't black out the game: the frame's what it is, the next one starts clean)
        drawFailed = true;
        noteFail('draw', err);
        if (!drawWarned) { drawWarned = true; console.error('draw failed', err); }
        // (not in the public build: the error up on screen, so it can be read off and reported)
        if (!PUBLIC_BUILD) {
          const e = err as Error, lines = [`DRAW FAILED: ${e?.message ?? String(err)}`, ...String(e?.stack ?? '').split('\n').slice(1, 6).map(s => s.trim())];
          // (low on the screen, clear of the HUD up top; big enough to read)
          ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.font = `${Math.round(ctx.canvas.height / 40)}px monospace`; ctx.textAlign = 'left';
          const lh = Math.round(ctx.canvas.height / 32), top = ctx.canvas.height - lh * (lines.length + 1);
          lines.forEach((l, i) => { ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(4, top + i * lh, Math.min(ctx.canvas.width - 8, ctx.measureText(l).width + 12), lh); ctx.fillStyle = '#FF6B6B'; ctx.fillText(l, 10, top + i * lh + lh * 0.78); });
          ctx.restore();
        }
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
        // (and whether he's in a little cutscene, out of his hands, or one that can be skipped: the HUD's put away for it)
        p.onPlayerUpdate(player.health, player.power, player.weaponAmmo, forcedWeapon, state.lockWeapon, !!player.inCutscene || (canSkip() && state.deathTimer <= 0));
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
          noteFail('frame', err);
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
