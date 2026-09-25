import React, { useState, useEffect, useRef } from 'react';
import HUD from './components/HUD';
import Overlay, { CheatFlags } from './components/Overlay';
import GameCanvas from './components/GameCanvas';
import { GameStatus, WeaponType } from './types';
import { INITIAL_PLAYER_HEALTH, MAX_AMMO, createFullAmmo } from './constants';
import { getStages, getStartingWeapons, sortWeapons, BOSS_WEAPON_MAP, WEAPONS_AFTER_SET_0, ALL_WEAPONS } from './stages';
import { VULGARITIES, BOSS_DIALOGUE } from './dialogue';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS } from './game/gamepad';
import { speak, say, isSpeaking, getBossVoice, takeFreshLine, MEATHEAD_MENU_VOICE } from './game/speech';

/** Shows the dev cheat panel on the title screen. */
const SHOW_CHEATS = true;

const NO_CHEATS: CheatFlags = { allWeapons: false, invincible: false, infiniteAmmo: false, infinitePower: false, skipToBoss: false };

/** Screens whose confirm button is locked for a moment after they appear. */
const TIMED_SCREENS = [GameStatus.START, GameStatus.BOSS_INTRO, GameStatus.BOSS_VICTORY_SPEECH, GameStatus.VICTORY];
const INPUT_LOCK_MS = 2000;
/** Keyboard/gamepad confirm is accepted much sooner than the on-screen button. */
const MIN_CONFIRM_DELAY_MS = 250;
const PAD_REPEAT_MS = 180;
const REBUKE_COOLDOWN_MS = 1000;

const HUD_SCREENS = [GameStatus.LEVEL_INTRO, GameStatus.PLAYING, GameStatus.BOSS_TRANSITION, GameStatus.PAUSED, GameStatus.BOSS_INTRO, GameStatus.BOSS_VICTORY_SPEECH];
const UNPAUSABLE_SCREENS = [GameStatus.BOSS_TRANSITION, GameStatus.BOSS_INTRO, GameStatus.BOSS_VICTORY_SPEECH, GameStatus.LEVEL_INTRO, GameStatus.VICTORY];

/** Stage select is a 2x2 grid: horizontal flips the column, vertical flips the row. */
const navigateStageGrid = (index: number, dx: number, dy: number) => {
  let i = index;
  if (dx !== 0) i = i % 2 === 0 ? i + 1 : i - 1;
  if (dy !== 0) i = i < 2 ? i + 2 : i - 2;
  return i;
};

/** Pause menu: a 3-wide weapon grid (indices 0..n-1) followed by three stacked buttons. */
const navigatePauseMenu = (index: number, dx: number, dy: number, numWeapons: number) => {
  if (dy < 0) {
    if (index >= numWeapons) return index - 1;
    return index >= 3 ? index - 3 : index;
  }
  if (dy > 0) {
    if (index < numWeapons) return index + 3 < numWeapons ? index + 3 : numWeapons;
    return index < numWeapons + 2 ? index + 1 : index;
  }
  if (index >= numWeapons) return index;
  if (dx < 0) return index > 0 ? index - 1 : index;
  if (dx > 0) return index < numWeapons - 1 ? index + 1 : index;
  return index;
};

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [health, setHealth] = useState(INITIAL_PLAYER_HEALTH);
  const [chargeMeter, setChargeMeter] = useState(1);
  const [uppercutMeter, setUppercutMeter] = useState(1);
  const [bossTaunt, setBossTaunt] = useState("YOU'RE TOAST.");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [defeatedStages, setDefeatedStages] = useState<string[]>([]);
  const [availableWeapons, setAvailableWeapons] = useState<WeaponType[]>(['GUN']);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('GUN');
  const [weaponAmmo, setWeaponAmmo] = useState<Record<WeaponType, number>>(createFullAmmo);
  const [cheatFlags, setCheatFlags] = useState<CheatFlags>(NO_CHEATS);
  const [progressionRank, setProgressionRank] = useState(0);
  /** True between the boss dying and the victory screen; blocks pausing. */
  const [isVictoryPhase, setIsVictoryPhase] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isInputLocked, setIsInputLocked] = useState(true);

  const cheats = SHOW_CHEATS ? cheatFlags : NO_CHEATS;
  const screenShownAtRef = useRef(Date.now());
  const lastRebukeEndRef = useRef(0);

  // Briefly lock story/menu screens so a held button doesn't skip straight past them
  useEffect(() => {
    if (!TIMED_SCREENS.includes(status)) return;
    screenShownAtRef.current = Date.now();
    setIsInputLocked(true);
    const timer = setTimeout(() => setIsInputLocked(false), INPUT_LOCK_MS);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (status === GameStatus.BOSS_INTRO && selectedStage && bossTaunt) {
      // The taunt cuts off anything still playing (its text is on the intro screen)
      say(bossTaunt, getBossVoice(selectedStage), 'urgent', { onShow: () => {}, onHide: () => {} });
    }
  }, [status, selectedStage, bossTaunt]);

  // --- Weapons ---------------------------------------------------------------

  const resetLoadout = () => {
    setCurrentWeapon('GUN');
    setWeaponAmmo(createFullAmmo());
  };

  const cycleWeapon = (dir: number) => {
    const count = availableWeapons.length;
    if (count <= 1) return;
    // Functional update so several wheel ticks between renders all register
    setCurrentWeapon(current => {
      const idx = availableWeapons.indexOf(current);
      const nextIdx = idx === -1 ? (dir > 0 ? 0 : count - 1) : (idx + dir + count) % count;
      setSelectedIndex(nextIdx); // keep the pause menu cursor in sync
      return availableWeapons[nextIdx];
    });
  };

  const selectWeaponByIndex = (index: number) => {
    if (index >= 0 && index < availableWeapons.length) setCurrentWeapon(availableWeapons[index]);
  };

  const handleWeaponIconClick = (index: number) => {
    setSelectedIndex(index);
    selectWeaponByIndex(index);
  };

  // --- Flow ------------------------------------------------------------------

  const togglePause = () => {
    if (isVictoryPhase || UNPAUSABLE_SCREENS.includes(status)) return;
    if (status === GameStatus.PLAYING) {
      setSelectedIndex(availableWeapons.indexOf(currentWeapon));
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING);
    }
  };

  /** The "continue" action on the title, boss intro, weapon-gained and final victory screens. */
  const handleStart = () => {
    if (Date.now() - screenShownAtRef.current < MIN_CONFIRM_DELAY_MS) return;
    switch (status) {
      case GameStatus.START:
        setAvailableWeapons(getStartingWeapons(progressionRank, cheats.allWeapons));
        resetLoadout();
        setStatus(GameStatus.STAGE_SELECT);
        break;
      case GameStatus.BOSS_INTRO:
        setStatus(GameStatus.PLAYING);
        break;
      case GameStatus.BOSS_VICTORY_SPEECH:
        setIsVictoryPhase(false);
        if (defeatedStages.length >= 4) {
          setStatus(GameStatus.VICTORY);
        } else {
          setStatus(GameStatus.STAGE_SELECT);
          setSelectedStage(null);
          setSelectedIndex(0);
          resetLoadout();
        }
        break;
      case GameStatus.VICTORY:
        setDefeatedStages([]);
        if (progressionRank === 0 && defeatedStages.length >= 4) {
          // Beat the first set: unlock the second
          setProgressionRank(1);
          setAvailableWeapons(getStartingWeapons(1, cheats.allWeapons));
          setCurrentWeapon('GUN');
          setStatus(GameStatus.STAGE_SELECT);
        } else {
          setAvailableWeapons(getStartingWeapons(progressionRank, cheats.allWeapons));
          resetLoadout();
          setSelectedIndex(0);
          setIsVictoryPhase(false);
          setStatus(GameStatus.START);
        }
        break;
    }
  };

  const handleResume = () => setStatus(GameStatus.PLAYING);

  const handleBossSelect = () => {
    setSelectedStage(null);
    setSelectedIndex(0);
    setIsVictoryPhase(false);
    resetLoadout();
    setStatus(GameStatus.STAGE_SELECT);
  };

  const handleQuitToMenu = () => {
    setSelectedStage(null);
    setSelectedIndex(0);
    setIsVictoryPhase(false);
    setDefeatedStages([]);
    setCurrentWeapon('GUN');
    setProgressionRank(0);
    setStatus(GameStatus.START);
  };

  /** Meathead complains if you pick a boss he already killed. */
  const speakRebuke = () => {
    if (isSpeaking() || Date.now() - lastRebukeEndRef.current < REBUKE_COOLDOWN_MS) return;
    const line = takeFreshLine(VULGARITIES.REBUKE);
    if (!line) return;
    speak(line, MEATHEAD_MENU_VOICE, {
      onDone: () => { lastRebukeEndRef.current = Date.now(); },
    });
  };

  const handleSelectStage = (stage: string) => {
    if (defeatedStages.includes(stage)) { speakRebuke(); return; }
    setSelectedStage(stage);
    setHealth(INITIAL_PLAYER_HEALTH);
    setChargeMeter(1);
    setUppercutMeter(1);
    resetLoadout();
    setIsVictoryPhase(false);
    setStatus(GameStatus.LEVEL_INTRO);
  };

  const activatePauseItem = (index: number) => {
    const numWeapons = availableWeapons.length;
    if (index < numWeapons) selectWeaponByIndex(index);
    else if (index === numWeapons) handleResume();
    else if (index === numWeapons + 1) handleBossSelect();
    else if (index === numWeapons + 2) handleQuitToMenu();
  };

  // --- Menu input (shared by keyboard and gamepad) ---------------------------

  /** Moves the menu cursor. Returns false if the input did nothing on this screen. */
  const moveSelection = (dx: number, dy: number): boolean => {
    if (status === GameStatus.STAGE_SELECT) {
      if (dx === 0 && dy === 0) return false;
      setSelectedIndex(i => navigateStageGrid(i, dx, dy));
      return true;
    }
    if (status === GameStatus.PAUSED) {
      const numWeapons = availableWeapons.length;
      if (dy === 0 && (dx === 0 || selectedIndex >= numWeapons)) return false;
      setSelectedIndex(i => navigatePauseMenu(i, dx, dy, numWeapons));
      return true;
    }
    return false;
  };

  const confirmSelection = () => {
    if (status === GameStatus.STAGE_SELECT) handleSelectStage(getStages(progressionRank)[selectedIndex].id);
    else if (status === GameStatus.PAUSED) activatePauseItem(selectedIndex);
    else if (TIMED_SCREENS.includes(status)) handleStart();
  };

  // --- Cheats ----------------------------------------------------------------

  /** Weapons actually earned so far (used when turning the all-weapons cheat off). */
  const getEarnedWeapons = (): WeaponType[] => {
    const fromBosses = defeatedStages.map(s => BOSS_WEAPON_MAP[s]).filter(Boolean);
    const base: WeaponType[] = progressionRank === 0 ? ['GUN'] : WEAPONS_AFTER_SET_0;
    return sortWeapons(Array.from(new Set([...base, ...fromBosses])));
  };

  const handleToggleCheat = (flag: keyof CheatFlags) => {
    const enabled = !cheatFlags[flag];
    setCheatFlags({ ...cheatFlags, [flag]: enabled });
    if (flag !== 'allWeapons') return;
    if (enabled) {
      setAvailableWeapons(ALL_WEAPONS);
    } else {
      const earned = getEarnedWeapons();
      setAvailableWeapons(earned);
      if (!earned.includes(currentWeapon)) setCurrentWeapon('GUN');
    }
  };

  const handleChangeRank = (delta: number) => {
    const next = Math.max(0, Math.min(1, progressionRank + delta));
    setProgressionRank(next);
    if ((delta > 0 && next === 1) || (delta < 0 && next === 0)) {
      setAvailableWeapons(getStartingWeapons(next, cheats.allWeapons));
      setCurrentWeapon('GUN');
    }
  };

  // --- Events from the game --------------------------------------------------

  const handleBossEncounter = () => {
    setStatus(GameStatus.BOSS_INTRO);
    const pool = BOSS_DIALOGUE.INTRO_QUOTES[selectedStage || ''] || BOSS_DIALOGUE.INTRO_QUOTES['default'];
    setBossTaunt(pool[1] || pool[0]);
  };

  const handleBossDefeated = (stageId: string) => {
    const newWeapon = BOSS_WEAPON_MAP[stageId];
    if (newWeapon) setAvailableWeapons(prev => prev.includes(newWeapon) ? prev : sortWeapons([...prev, newWeapon]));
    setDefeatedStages(prev => [...prev, stageId]);
    setStatus(GameStatus.BOSS_VICTORY_SPEECH);
  };

  const handlePlayerUpdate = (h: number, charge: number, uppercut: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType) => {
    setHealth(h);
    setChargeMeter(charge);
    setUppercutMeter(uppercut);
    if (ammo) setWeaponAmmo(ammo);
    if (forcedWeapon) setCurrentWeapon(forcedWeapon);
  };

  // Input listeners are attached once and always call the latest render's handlers.
  const inputRef = useRef({ status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume });
  inputRef.current = { status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { status, togglePause, cycleWeapon, moveSelection, confirmSelection } = inputRef.current;
      const key = e.key.toLowerCase();
      if (key === 'escape') togglePause();

      if (status === GameStatus.PLAYING) {
        if (key === 'q') cycleWeapon(-1);
        if (key === 'e') cycleWeapon(1);
        return;
      }
      if (key === 'arrowup' || key === 'w') moveSelection(0, -1);
      else if (key === 'arrowdown' || key === 's') moveSelection(0, 1);
      else if (key === 'arrowleft' || key === 'a') moveSelection(-1, 0);
      else if (key === 'arrowright' || key === 'd') moveSelection(1, 0);
      else if (key === 'enter' || key === ' ') confirmSelection();
    };
    const onWheel = (e: WheelEvent) => {
      const { status, cycleWeapon } = inputRef.current;
      if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Gamepad menu controls (in-game movement is read by the game loop itself)
  useEffect(() => {
    let frameId = 0;
    let lastMoveAt = 0;
    const prev = { a: false, b: false, start: false, lb: false, rb: false };

    const poll = () => {
      const gp = getActiveGamepad();
      if (!gp) {
        prev.a = prev.b = prev.start = prev.lb = prev.rb = false;
      } else {
        const { status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume } = inputRef.current;
        const now = Date.now();
        const move = getGamepadMovement(gp, 0.25);
        if (now - lastMoveAt > PAD_REPEAT_MS) {
          const dx = move.left ? -1 : move.right ? 1 : 0;
          const dy = move.up ? -1 : move.down ? 1 : 0;
          if (moveSelection(dx, dy)) lastMoveAt = now;
        }

        const pressed = {
          a: isButtonPressed(gp, GP_BUTTONS.A),
          b: isButtonPressed(gp, GP_BUTTONS.B),
          start: isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT),
          lb: isButtonPressed(gp, GP_BUTTONS.LB),
          rb: isButtonPressed(gp, GP_BUTTONS.RB),
        };
        const justPressed = (k: keyof typeof pressed) => pressed[k] && !prev[k];
        const inGame = status === GameStatus.PLAYING || status === GameStatus.PAUSED;

        if (inGame && justPressed('lb')) cycleWeapon(-1);
        if (inGame && justPressed('rb')) cycleWeapon(1);
        if (justPressed('a') || (justPressed('start') && TIMED_SCREENS.includes(status))) confirmSelection();
        if (justPressed('b')) {
          if (status === GameStatus.PAUSED) handleResume();
          else if (status === GameStatus.STAGE_SELECT) setStatus(GameStatus.START);
        }
        if (justPressed('start') && inGame) togglePause();
        Object.assign(prev, pressed);
      }
      frameId = requestAnimationFrame(poll);
    };
    frameId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="relative shadow-2xl border-4 border-gray-800 bg-[#121212] overflow-hidden" style={{ width: 800, height: 600, boxSizing: 'content-box' }}>
        {HUD_SCREENS.includes(status) && (
          <HUD
            health={health}
            maxHealth={INITIAL_PLAYER_HEALTH}
            chargeMeter={chargeMeter}
            uppercutMeter={uppercutMeter}
            currentWeapon={currentWeapon}
            ammo={weaponAmmo[currentWeapon]}
            maxAmmo={MAX_AMMO[currentWeapon]}
          />
        )}
        <Overlay
          status={status}
          selectedIndex={selectedIndex}
          isInputLocked={isInputLocked}
          progressionRank={progressionRank}
          defeatedStages={defeatedStages}
          stageId={selectedStage}
          bossTaunt={bossTaunt}
          availableWeapons={availableWeapons}
          currentWeapon={currentWeapon}
          onStart={handleStart}
          onResume={handleResume}
          onBossSelect={handleBossSelect}
          onQuitToMenu={handleQuitToMenu}
          onSelectStage={handleSelectStage}
          onSelectIndex={setSelectedIndex}
          onWeaponIconClick={handleWeaponIconClick}
          cheats={SHOW_CHEATS ? { flags: cheatFlags, onToggle: handleToggleCheat, onChangeRank: handleChangeRank } : undefined}
        />
        <GameCanvas
          status={status}
          stageId={selectedStage}
          currentWeapon={currentWeapon}
          initialAmmo={weaponAmmo}
          cheats={{ invincible: cheats.invincible, infiniteAmmo: cheats.infiniteAmmo, infinitePower: cheats.infinitePower, skipToBoss: cheats.skipToBoss }}
          bossTauntText={bossTaunt}
          onPlayerUpdate={handlePlayerUpdate}
          onBossEncounter={handleBossEncounter}
          onBossTransition={() => setStatus(GameStatus.BOSS_TRANSITION)}
          onBossDefeated={handleBossDefeated}
          onBossDeath={() => setIsVictoryPhase(true)}
          onIntroComplete={() => setStatus(GameStatus.PLAYING)}
        />
      </div>
    </div>
  );
};

export default App;
