import { Block, Enemy, Rect, PickupType } from '../../types';
import { BOSS_DOOR_X, DOOR_WIDTH, GROUND_Y, createFullAmmo } from '../../constants';
import { isKnownStage } from '../../content/roster';
import { GameState, resetStageState } from './state';
import { createBoss, getBossDef, getArenaRight, getStageWidth } from '../bosses/registry';
import { getStageLayout } from '../stages';

/** Where the player starts: the stage start, or just before the boss door when skipping. */
export const getStartX = (skipToBoss: boolean, stageId: string | null = null) =>
  skipToBoss ? getStageLayout(stageId)?.bossStartX ?? BOSS_DOOR_X - 800 : getStageLayout(stageId)?.startX ?? 0;

/** Builds the terrain, enemies and boss for a stage into `state`. */
export const buildLevel = (state: GameState, stageId: string | null, skipToBoss: boolean) => {
  state.arenaLocked = false;
  state.doorState = 'closed';
  state.doorOpenAmount = 0;
  state.bossVolcanoes = [];
  state.bossVolcanoTelegraphs = [];
  state.bossPoopTelegraphs = [];
  state.bossSteamExplosions = [];
  state.victorWallSide = 0;
  state.ernieVibrationTimer = 0;
  state.hectorFilth = 0; state.hectorFilthShown = 0;
  state.screenShakeTimer = 0;
  state.playerStunTimer = 0;
  state.tsunamiActive = false;
  state.tommyBoards = [];
  state.tommySludgeY = 510;
  state.tommySludgeOiledTimer = 0;
  state.tommyScrollY = 0;
  state.oilCells = [];
  state.icicles = [];
  state.bossCorpse = null;

  const layout = getStageLayout(stageId);
  state.blocks = buildTerrain(state, stageId);
  state.enemies = [
    ...(skipToBoss || layout ? [] : spawnStageEnemies()),
    ...(isKnownStage(stageId) ? [createBoss(stageId!)] : []),
  ];
  // A hand-built stage adds its own ground, enemies and hazards (and says where to start after a checkpoint)
  return layout?.build(state, skipToBoss) || undefined;
};

/** Resets the player and stage after death. */
export const respawn = (state: GameState, stageId: string | null, skipToBoss: boolean) => {
  resetStageState(state);
  // Died to the boss: start again right outside his door (as with the skip cheat), with no way back
  const atBoss = skipToBoss || state.bossCheckpoint;
  const p = state.player;
  p.pos = { x: getStartX(atBoss, stageId) + 150, y: 100 };
  p.vel = { x: 0, y: 0 };
  p.facing = 1;
  p.currentWeapon = 'GUN';
  p.weaponAmmo = createFullAmmo();
  state.shouldSyncWeapon = true;
  state.frame = 1;
  // (the frame count starts over: nothing still on offer from before)
  state.dyingSkipAt = undefined;
  state.deathFreeze = undefined;
  state.deathScene = undefined;
  state.killPose = null;
  state.lastHurt = undefined;
  // (back on his feet clean)
  p.bleedT = 0; p.bloodHp = undefined;
  const checkpointStart = buildLevel(state, stageId, atBoss);
  // A long stage's checkpoint: start there instead, with the camera already on him
  if (checkpointStart && !atBoss) {
    p.pos = { x: checkpointStart.x, y: checkpointStart.y - p.height };
    state.camera.x = Math.max(state.cameraMinX, p.pos.x - 250);
    state.camera.y = state.cameraRestY;
  }
  // (outside the boss's door under a ceiling: on the floor there, not on top of the roof over it)
  const bossY = atBoss ? getStageLayout(stageId)?.bossStartY : undefined;
  if (bossY !== undefined) {
    p.pos.y = bossY - p.height;
    state.camera.x = Math.max(state.cameraMinX, p.pos.x - 250);
    state.camera.y = state.cameraRestY = bossY - 550;
  }
  if (state.bossCheckpoint && !skipToBoss) {
    const startX = getStartX(true, stageId);
    // (all the way up: a stage can put its boss start high up, like Tommy's ruins)
    state.blocks.push({ x: startX - 100, y: -6000, w: 100, h: 8000, type: 'wall' });
    state.cameraMinX = startX;
  }
};

const buildTerrain = (state: GameState, stageId: string | null): Block[] => {
  const doorX = BOSS_DOOR_X;
  const isTommy = stageId === 'Toxic Tommy';
  const arena = getBossDef(stageId)?.arena;
  const stageWidth = getStageWidth(stageId);
  const layout = getStageLayout(stageId);
  if (layout) {
    // Just the boss end: the layout builds everything left of the door itself
    const blocks: Block[] = [
      { x: layout.left - 100, y: -6000, w: 100, h: 9000, type: 'wall' },
      { x: stageWidth, y: -1000, w: 100, h: 2000, type: 'wall' },
      // (a floorless arena, Tommy's sludge pool, has ground only under the door)
      { x: doorX, y: GROUND_Y, w: arena?.floorless ? DOOR_WIDTH : stageWidth - doorX, h: 50, type: 'ground' },
      { x: doorX, y: 400, w: DOOR_WIDTH, h: 150, type: 'door' },
      { x: doorX, y: -1000, w: DOOR_WIDTH, h: 1400, type: 'wall' },
      { x: getArenaRight(stageId), y: 100, w: 40, h: 500, type: 'wall' },
    ];
    if (!arena?.openTop) blocks.push({ x: doorX, y: -200, w: stageWidth - doorX, h: 300, type: 'wall' });
    arena?.build?.(state, blocks);
    return blocks;
  }

  const blocks: Block[] = [
    { x: -100, y: -1000, w: 100, h: 2000, type: 'wall' },
    { x: stageWidth, y: -1000, w: 100, h: 2000, type: 'wall' },
    { x: 0, y: -200, w: stageWidth, h: 200, type: 'wall' },
    // A floorless arena (Tommy's sludge pool) has ground only up to the door
    { x: 0, y: GROUND_Y, w: arena?.floorless ? doorX : stageWidth, h: 50, type: 'ground' },
    { x: doorX, y: 400, w: DOOR_WIDTH, h: 150, type: 'door' },
    { x: doorX, y: -1000, w: DOOR_WIDTH, h: 1400, type: 'wall' },
    { x: getArenaRight(stageId), y: 100, w: 40, h: 500, type: 'wall' },
  ];

  if (!arena?.openTop) blocks.push({ x: doorX, y: 0, w: stageWidth - doorX, h: 100, type: 'wall' });
  arena?.build?.(state, blocks);

  const addPlatform = (p: Rect, pickupChance = 0) => {
    if (p.x + p.w > doorX) return;
    blocks.push({ ...p, type: 'platform' });
    if (pickupChance > 0 && Math.random() > 1 - pickupChance) addPickupOnPlatform(state, p);
  };

  if (stageId === 'Artie Avalanche') {
    // Staircases of three ledges
    for (let i = 500; i < doorX - 600; i += 700) {
      addPlatform({ x: i, y: 450, w: 150, h: 20 });
      addPlatform({ x: i + 200, y: 320, w: 150, h: 20 }, 0.6);
      addPlatform({ x: i + 400, y: 190, w: 150, h: 20 }, 0.4);
    }
  } else if (stageId === 'Victor Volcano') {
    for (let i = 400; i < doorX - 600; i += 800) {
      addPlatform({ x: i, y: 380, w: 300, h: 20 }, 0.7);
      addPlatform({ x: i + 400, y: 250, w: 200, h: 20 }, 0.7);
    }
    for (let x = 1200; x < doorX - 500; x += 1800) blocks.push({ x, y: GROUND_Y, w: 400, h: 1000, type: 'pit' });
  } else if (isTommy) {
    for (let i = 600; i < doorX - 300; i += 600) addPlatform({ x: i, y: 350, w: 100, h: 20 });
  } else {
    for (let i = 600; i < doorX - 300; i += 600) addPlatform({ x: i, y: 400 - (Math.random() * 200), w: 200, h: 25 }, 0.6);
  }

  return blocks;
};

const addPickupOnPlatform = (state: GameState, block: Rect) => {
  const type: PickupType = Math.random() > 0.5 ? 'small_health' : 'small_ammo';
  state.pickups.push({
    id: `static-pickup-${Date.now()}-${Math.random()}`,
    pos: { x: block.x + block.w / 2 - 10, y: block.y - 25 },
    vel: { x: 0, y: 0 }, width: 20, height: 20, type, life: 20000,
  });
};

/** The same enemy squad repeats every 1000px up to the boss door. */
const spawnStageEnemies = (): Enemy[] => {
  const enemies: Enemy[] = [];
  const base = { vel: { x: 0, y: 0 }, type: 'enemy' as const, patrolRange: 0, shootTimer: 0 };
  for (let i = 1200; i < BOSS_DOOR_X - 300; i += 1000) {
    enemies.push(
      { ...base, id: `shield-${i}`, pos: { x: i, y: 480 }, vel: { x: 0, y: 0 }, width: 50, height: 70, health: 120, maxHealth: 120, enemyType: 'shield', behavior: 'shoot', initialX: i, isShieldActive: true },
      { ...base, id: `flyer-${i}`, pos: { x: i + 400, y: 150 }, vel: { x: 2, y: 0 }, width: 40, height: 30, health: 60, maxHealth: 60, enemyType: 'flyer', behavior: 'fly', patrolRange: 300, initialX: i + 400 },
      { ...base, id: `heavy-flyer-${i}`, pos: { x: i + 600, y: 100 }, vel: { x: 0, y: 0 }, width: 80, height: 65, health: 300, maxHealth: 300, enemyType: 'flyer', behavior: 'shoot', initialX: i + 600 },
      { ...base, id: `tank-${i}`, pos: { x: i + 600, y: 490 }, vel: { x: 0, y: 0 }, width: 60, height: 60, health: 200, maxHealth: 200, enemyType: 'tank', behavior: 'shoot', initialX: i + 600 },
      { ...base, id: `rusher-${i}`, pos: { x: i + 800, y: 480 }, vel: { x: 0, y: 0 }, width: 50, height: 70, health: 300, maxHealth: 300, enemyType: 'tank', behavior: 'patrol', initialX: i + 800, pauseTimer: 0 },
    );
  }
  return enemies;
};
