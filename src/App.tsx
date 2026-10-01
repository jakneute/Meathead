import React, { useState, useEffect, useRef } from 'react';
import { hasRightStick } from './game/platform/device';
import CheckpointPicker, { StartAt } from './components/CheckpointPicker';
import Garage from './components/Garage';
import { GARAGE_INDEX, WHITE_HOUSE_INDEX } from './components/Overlay';
import { takeSouvenir } from './game/garageStore';
import type { Souvenir } from './content/garage';
import HUD from './components/HUD';
import Overlay, { CheatFlags } from './components/Overlay';
import GameCanvas from './components/GameCanvas';
import EndingCutscene from './components/EndingCutscene';
import RadioCutscene from './components/RadioCutscene';
import IntroCutscene from './components/IntroCutscene';
import voicePackUrl from './generated/voices.bin?url';
import { loadVoicePack } from './game/platform/voiceclips';

// Everybody's recorded voice, loaded once (it comes inside the page: see tools/voices)
loadVoicePack(voicePackUrl);
import { canSkip, requestSkip } from './game/platform/skip';
import { setScreenMusic, setMusicPaused, musicEnabled, setMusicEnabled } from './game/music';
import DeployTransition from './components/DeployTransition';
import WeaponGetScene from './components/WeaponGetScene';
import { GameStatus, WeaponType } from './types';
import { INITIAL_PLAYER_HEALTH, MAX_AMMO, POWER_CELLS, createFullAmmo } from './constants';
import { getStages, getStartingWeapons, sortWeapons, BOSS_WEAPON_MAP, WEAPONS_AFTER_SET_0, ALL_WEAPONS, STAGES_SET_0, STAGES_SET_1 } from './content/roster';
import { VULGARITIES, BOSS_DIALOGUE, BOSS_REBUKES } from './content/dialogue';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS, menuButtons } from './game/platform/gamepad';
import WeaponWheel, { wheelIndexAt } from './components/WeaponWheel';
import { speak, say, isSpeaking, getBossVoice, takeFreshLine, MEATHEAD_MENU_VOICE } from './game/platform/speech';
import { playLockInSound, playEngageSound } from './game/platform/audio';

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

const HUD_SCREENS = [GameStatus.LEVEL_INTRO, GameStatus.PLAYING, GameStatus.BOSS_TRANSITION, GameStatus.PAUSED, GameStatus.BOSS_INTRO];
const UNPAUSABLE_SCREENS = [GameStatus.BOSS_TRANSITION, GameStatus.BOSS_INTRO, GameStatus.BOSS_VICTORY_SPEECH, GameStatus.LEVEL_INTRO, GameStatus.VICTORY, GameStatus.ENDING];

/** The ending plays once this set of bosses is beaten (later sets will move it). */
const ENDING_AFTER_RANK = 1;

/**
 * Stage select is a 2x2 grid with the garage under it (and the White House under that, once all eight are dead):
 * horizontal flips the column, vertical goes down the rows and on to the garage.
 */
const navigateStageGrid = (index: number, dx: number, dy: number, whiteHouse: boolean) => {
  let i = index;
  if (i === WHITE_HOUSE_INDEX) return dy < 0 ? GARAGE_INDEX : i;
  if (i === GARAGE_INDEX) return dy < 0 ? 2 : dy > 0 && whiteHouse ? WHITE_HOUSE_INDEX : i;
  if (dx !== 0) i = i % 2 === 0 ? i + 1 : i - 1;
  if (dy > 0) i = i < 2 ? i + 2 : GARAGE_INDEX;
  else if (dy < 0) i = i < 2 ? i : i - 2;
  return i;
};

/** Pause menu: a 3-wide weapon grid (indices 0..n-1) above a row of three buttons. */
const navigatePauseMenu = (index: number, dx: number, dy: number, numWeapons: number) => {
  if (index >= numWeapons) {
    // The button row: left/right between buttons, up back into the arsenal
    if (dx < 0) return Math.max(numWeapons, index - 1);
    if (dx > 0) return Math.min(numWeapons + 2, index + 1);
    if (dy < 0) return numWeapons - 1;
    return index;
  }
  if (dy < 0) return index >= 3 ? index - 3 : index;
  if (dy > 0) return index + 3 < numWeapons ? index + 3 : numWeapons;
  if (dx < 0) return index > 0 ? index - 1 : index;
  if (dx > 0) return index < numWeapons - 1 ? index + 1 : index;
  return index;
};

/** The whole 800x600 game (canvas and menus) is scaled up to fill the window, keeping its shape. */
const useFitToWindow = () => {
  const fit = () => Math.max(0.5, Math.min(window.innerWidth / 808, window.innerHeight / 608));
  const [scale, setScale] = useState(fit);
  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
};

/** How long the ENGAGE flourish plays before the stage starts. */
const ENGAGE_FLOURISH_MS = 1700;
const ENGAGE_SHOUTS = ["LET'S FUCKING GO!", "FUCK YEAH! LET'S GO!", "IT'S MEAT TIME, BABY!", "OH HELL YEAH!"];

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [health, setHealth] = useState(INITIAL_PLAYER_HEALTH);
  const [power, setPower] = useState(POWER_CELLS);
  const [bossTaunt, setBossTaunt] = useState("YOU'RE TOAST.");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [defeatedStages, setDefeatedStages] = useState<string[]>([]);
  const [availableWeapons, setAvailableWeapons] = useState<WeaponType[]>(['GUN']);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('GUN');
  const [weaponAmmo, setWeaponAmmo] = useState<Record<WeaponType, number>>(createFullAmmo);
  const [cheatFlags, setCheatFlags] = useState<CheatFlags>(NO_CHEATS);
  const [progressionRank, setProgressionRank] = useState(0);
  /** The mid-game call, played from the cheat panel. */
  const [callPreview, setCallPreview] = useState(false);
  /** The call handing off to the stage select (its title rising onto the heading, the call fading off it). */
  const [callOutro, setCallOutro] = useState(false);
  /** The music switch on the title screen. */
  const [musicOn, setMusicOn] = useState(musicEnabled());
  const toggleMusic = () => { const on = !musicEnabled(); setMusicEnabled(on); setMusicOn(on); };
  /** The opening (START GAME + INTRO): playing over the title, then fading off the stage select. */
  const [intro, setIntro] = useState<'off' | 'playing' | 'outro'>('off');
  /** True between the boss dying and the victory screen; blocks pausing. */
  const [isVictoryPhase, setIsVictoryPhase] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  /** A set piece (a ride) that only allows the one weapon: the others show locked in the pause menu. */
  const [lockedWeapon, setLockedWeapon] = useState<WeaponType | undefined>(undefined);
  /** The weapon wheel (the right stick): which one it's pointing at, while it's up. */
  const [wheelAt, setWheelAt] = useState<number | null>(null);
  /** The pause menu's "are you sure" before leaving for the boss select, and which answer's highlighted. */
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmYes, setConfirmYes] = useState(false);
  const viewScale = useFitToWindow();
  const [isInputLocked, setIsInputLocked] = useState(true);
  /** Stage select: the boss dossier is showing instead of the map. */
  const [showDossier, setShowDossier] = useState(false);
  const toggleDossier = () => { if (!engaging) setShowDossier(v => !v); };
  /** How each boss died this run: the weakness weapon that wrecked his corpse, or null for a plain kill. */
  const [killRecords, setKillRecords] = useState<Record<string, WeaponType | null>>({});
  /** Stage select on the second set: browsing the previous set's (dead) targets instead. */
  const [showArchive, setShowArchive] = useState(false);
  /** Stage select: the boss locked in as the target (null = still browsing). ENGAGE needs a lock first. */
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  /** The "LET'S FUCKIN' GO" flourish is playing; all stage select input is ignored. */
  const [engaging, setEngaging] = useState(false);
  /** The skip-level cheat's checkpoint picker: up for this stage; where it said to start (undefined: not asked yet). */
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [startAt, setStartAt] = useState<StartAt | undefined>(undefined);
  /** In the garage (from the stage select). */
  const [inGarage, setInGarage] = useState(false);
  /** What he took home from the boss he just killed (for the weapon screen to mention). */
  const [souvenir, setSouvenir] = useState<Souvenir | null>(null);
  /** The target being flown to after ENGAGE (the Mode 7 swoop), or null. */
  const [deployingTo, setDeployingTo] = useState<string | null>(null);

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

  // The music for the screens (in a stage, the game picks: see game/music)
  useEffect(() => {
    setMusicPaused(status === GameStatus.PAUSED);
    if (intro !== 'off') setScreenMusic({ song: 'briefing', arr: 'main' });
    else if (status === GameStatus.START) setScreenMusic({ song: 'title', arr: 'main' });
    else if (status === GameStatus.STAGE_SELECT) setScreenMusic(deployingTo ? { song: 'fanfare' } : callOutro ? { song: 'briefing', arr: 'radio' } : { song: 'map', arr: progressionRank >= 1 ? 'set2' : 'main' });
    else if (status === GameStatus.VICTORY) setScreenMusic(progressionRank === 0 || callPreview ? { song: 'briefing', arr: 'radio' } : { song: 'title', arr: 'ending' });
    else if (status === GameStatus.ENDING) setScreenMusic({ song: 'title', arr: 'ending' });
    else if (status === GameStatus.BOSS_VICTORY_SPEECH) setScreenMusic({ song: 'weapon' });
    else setScreenMusic(undefined);
  }, [status, intro, deployingTo, callOutro, progressionRank, callPreview]);

  // Every visit to stage select starts unlocked, on the current targets
  useEffect(() => {
    if (status !== GameStatus.STAGE_SELECT) { setLockedIndex(null); setEngaging(false); setShowArchive(false); setInGarage(false); setPickFor(null); }
    // (back on the map: the next skip asks again)
    if (status === GameStatus.STAGE_SELECT && !deployingTo) setStartAt(undefined);
    // (the title opens on START GAME)
    if (status === GameStatus.START) setSelectedIndex(0);
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
    if (count <= 1 || lockedWeapon) return;
    // Functional update so several wheel ticks between renders all register
    setCurrentWeapon(current => {
      const idx = availableWeapons.indexOf(current);
      const nextIdx = idx === -1 ? (dir > 0 ? 0 : count - 1) : (idx + dir + count) % count;
      setSelectedIndex(nextIdx); // keep the pause menu cursor in sync
      return availableWeapons[nextIdx];
    });
  };

  const selectWeaponByIndex = (index: number) => {
    if (index >= 0 && index < availableWeapons.length && (!lockedWeapon || availableWeapons[index] === lockedWeapon)) setCurrentWeapon(availableWeapons[index]);
  };

  const handleWeaponIconClick = (index: number) => {
    setSelectedIndex(index);
    selectWeaponByIndex(index);
  };

  /** Number-key hotkeys (keyboard): 1 = the first weapon in the arsenal. Empty slots do nothing. */
  const selectWeaponHotkey = (index: number) => {
    if (index < availableWeapons.length) handleWeaponIconClick(index);
  };

  // --- Flow ------------------------------------------------------------------

  const togglePause = () => {
    if (isVictoryPhase || UNPAUSABLE_SCREENS.includes(status)) return;
    // (a cutscene in the stage that can be skipped: that's what Start / Esc does)
    if (status === GameStatus.PLAYING && canSkip()) { requestSkip(); return; }
    if (status === GameStatus.PLAYING) {
      setSelectedIndex(availableWeapons.indexOf(currentWeapon));
      setConfirmLeave(false);
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      // (backing out of the "are you sure" first)
      if (confirmLeave) { setConfirmLeave(false); return; }
      setStatus(GameStatus.PLAYING);
    }
  };

  /** The "continue" action on the title, boss intro, weapon-gained and final victory screens. On the title, `withIntro`
   * says which of its two options (by default, whichever's highlighted). */
  const handleStart = (withIntro?: boolean) => {
    if (Date.now() - screenShownAtRef.current < MIN_CONFIRM_DELAY_MS) return;
    switch (status) {
      case GameStatus.START:
        if (intro !== 'off') break;
        setAvailableWeapons(getStartingWeapons(progressionRank, cheats.allWeapons));
        resetLoadout();
        // (with the intro, it plays first and brings the stage select up itself at the end)
        if (withIntro ?? selectedIndex === 1) setIntro('playing');
        else setStatus(GameStatus.STAGE_SELECT);
        break;
      case GameStatus.BOSS_INTRO:
        setStatus(GameStatus.PLAYING);
        break;
      case GameStatus.BOSS_VICTORY_SPEECH:
        setIsVictoryPhase(false);
        // (the first set done: the call; the second: back to the map, where the White House is waiting)
        if (defeatedStages.length >= 4 && progressionRank < ENDING_AFTER_RANK) {
          setStatus(GameStatus.VICTORY);
        } else {
          setStatus(GameStatus.STAGE_SELECT);
          setSelectedStage(null);
          setSelectedIndex(0);
          resetLoadout();
        }
        break;
      case GameStatus.VICTORY:
        finishVictory();
        break;
    }
  };

  /** Past the set's victory (the call, at the midpoint): on to the next set, or back to the title. */
  const finishVictory = () => {
    setCallPreview(false);
    setDefeatedStages([]);
    // (the call watched from the cheat panel goes on into the second set too, the way it does for real)
    if ((progressionRank === 0 && defeatedStages.length >= 4) || callPreview) {
      // Beat the first set: unlock the second (how the first four died stays on file)
      setProgressionRank(1);
      setAvailableWeapons(getStartingWeapons(1, cheats.allWeapons));
      setCurrentWeapon('GUN');
      setStatus(GameStatus.STAGE_SELECT);
    } else {
      setAvailableWeapons(getStartingWeapons(progressionRank, cheats.allWeapons));
      resetLoadout();
      setKillRecords({});
      setSelectedIndex(0);
      setIsVictoryPhase(false);
      setStatus(GameStatus.START);
    }
  };

  const handleResume = () => {
    // (the back button with the "are you sure" up just says no)
    if (confirmLeave) { setConfirmLeave(false); return; }
    setStatus(GameStatus.PLAYING);
  };

  /** BOSS SELECT in the pause menu: asks first (NO highlighted). */
  const askBossSelect = () => { setConfirmYes(false); setConfirmLeave(true); };
  const answerBossSelect = (yes: boolean) => {
    setConfirmLeave(false);
    if (yes) handleBossSelect();
  };

  /** After THE END: back to the title screen. */
  const handleEndingDone = () => {
    setDefeatedStages([]);
    setKillRecords({});
    setAvailableWeapons(getStartingWeapons(progressionRank, cheats.allWeapons));
    resetLoadout();
    setSelectedStage(null);
    setSelectedIndex(0);
    setIsVictoryPhase(false);
    setStatus(GameStatus.START);
  };

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
    setKillRecords({});
    setCurrentWeapon('GUN');
    setProgressionRank(0);
    setStatus(GameStatus.START);
  };

  /** Meathead complains if you pick a boss he already killed. */
  /** He's already killed this one: something about him in particular, mostly (or just that he's dead as shit). */
  const speakRebuke = (bossId?: string) => {
    if (isSpeaking() || Date.now() - lastRebukeEndRef.current < REBUKE_COOLDOWN_MS) return;
    const own = bossId ? BOSS_REBUKES[bossId] : undefined;
    const line = (own && Math.random() < 0.7 ? takeFreshLine(own) : null) ?? takeFreshLine(VULGARITIES.REBUKE) ?? (own ? takeFreshLine(own) : null);
    if (!line) return;
    speak(line, MEATHEAD_MENU_VOICE, {
      onDone: () => { lastRebukeEndRef.current = Date.now(); },
    });
  };

  const handleSelectStage = (stage: string) => {
    if (defeatedStages.includes(stage)) { speakRebuke(stage); return; }
    setSelectedStage(stage);
    setHealth(INITIAL_PLAYER_HEALTH);
    setPower(POWER_CELLS);
    resetLoadout();
    setIsVictoryPhase(false);
    setStatus(GameStatus.LEVEL_INTRO);
  };

  // --- Stage select: lock in a target, then ENGAGE ------------------------------

  /** All eight dead: the White House is on the map. */
  const whiteHouseOpen = progressionRank >= 1 && STAGES_SET_1.every(s => defeatedStages.includes(s.id));
  /** Who's on the damage report (in the garage): the first four, from the start of the second set; all eight once they're all dead. */
  const reportBosses = progressionRank >= 1 ? [...STAGES_SET_0, ...(whiteHouseOpen ? STAGES_SET_1 : [])].map(s => s.id) : [];
  /** The tab switch on the stage select: the map or the dossier. */
  const switchTab = (dir = 1) => { void dir; toggleDossier(); };

  /** Old targets (the previous set's files) can be browsed once you're on the second set. */
  const toggleArchive = () => {
    if (engaging || progressionRank < 1) return;
    setShowArchive(v => !v);
    setSelectedIndex(0);
    setLockedIndex(null);
    // (whichever of MAP or DOSSIER you were looking at stays up)
  };

  const lockStage = (idx: number) => {
    // (the garage: nothing to kill there, just somewhere to go)
    if (idx === GARAGE_INDEX || (idx === WHITE_HOUSE_INDEX && whiteHouseOpen)) { if (engaging) return; setSelectedIndex(idx); setLockedIndex(idx); playLockInSound(); return; }
    const stage = getStages(progressionRank)[idx];
    if (!stage || engaging) return;
    setSelectedIndex(idx);
    // Old targets are all dead already
    if (showArchive || defeatedStages.includes(stage.id)) { setLockedIndex(null); speakRebuke(stage.id); return; }
    setLockedIndex(idx);
    playLockInSound();
  };

  const unlockStage = () => {
    if (engaging) return;
    setLockedIndex(null);
  };

  /** Second confirmation: Meathead fires himself up, then the stage starts. */
  const engageStage = (picked?: StartAt) => {
    if (lockedIndex === null || engaging) return;
    // Home to the garage
    if (lockedIndex === GARAGE_INDEX) { setLockedIndex(null); setInGarage(true); playLockInSound(); return; }
    // To Washington: the flourish, then the end
    if (lockedIndex === WHITE_HOUSE_INDEX) {
      setEngaging(true);
      playEngageSound();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      speak(ENGAGE_SHOUTS[Math.floor(Math.random() * ENGAGE_SHOUTS.length)], MEATHEAD_MENU_VOICE);
      setTimeout(() => setStatus(GameStatus.ENDING), ENGAGE_FLOURISH_MS);
      return;
    }
    const stage = getStages(progressionRank)[lockedIndex];
    // (the skip-level cheat: which checkpoint to start at first)
    if (cheats.skipToBoss && startAt === undefined && picked === undefined) { setPickFor(stage.id); return; }
    setEngaging(true);
    playEngageSound();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    speak(ENGAGE_SHOUTS[Math.floor(Math.random() * ENGAGE_SHOUTS.length)], MEATHEAD_MENU_VOICE);
    // Then the swoop down onto his hometown (DeployTransition), which drops you into the stage
    setTimeout(() => setDeployingTo(stage.id), ENGAGE_FLOURISH_MS);
  };

  const engageRef = useRef(engageStage); engageRef.current = engageStage;

  /** Clicking a portrait (or its map pin): lock it in, or back out if it's already the locked one. */
  const handleStageCardClick = (idx: number) => {
    if (engaging) return;
    if (lockedIndex === idx) unlockStage();
    else lockStage(idx);
  };

  const activatePauseItem = (index: number) => {
    const numWeapons = availableWeapons.length;
    if (index < numWeapons) selectWeaponByIndex(index);
    else if (index === numWeapons) handleResume();
    else if (index === numWeapons + 1) askBossSelect();
    else if (index === numWeapons + 2) handleQuitToMenu();
  };

  // --- Menu input (shared by keyboard and gamepad) ---------------------------

  /** Moves the menu cursor. Returns false if the input did nothing on this screen. */
  const moveSelection = (dx: number, dy: number): boolean => {
    if (intro !== 'off') return false;
    // The title: START GAME, or START GAME + INTRO
    if (status === GameStatus.START) {
      if (!dy) return false;
      setSelectedIndex(i => (i + (dy > 0 ? 1 : -1) + 2) % 2);
      return true;
    }
    if (status === GameStatus.STAGE_SELECT) {
      if (dx === 0 && dy === 0) return false;
      if (lockedIndex !== null || engaging) return false; // locked in: back out first
      setSelectedIndex(i => navigateStageGrid(i, dx, dy, whiteHouseOpen));
      return true;
    }
    if (status === GameStatus.PAUSED) {
      const numWeapons = availableWeapons.length;
      if (dx === 0 && dy === 0) return false;
      // (the "are you sure": YES on the left, NO on the right)
      if (confirmLeave) { if (dx) setConfirmYes(dx < 0); return true; }
      setSelectedIndex(i => navigatePauseMenu(i, dx, dy, numWeapons));
      return true;
    }
    return false;
  };

  const confirmSelection = () => {
    // (nothing while the call's still fading off the stage select)
    if (callOutro || intro !== 'off') return;
    if (status === GameStatus.STAGE_SELECT) { if (lockedIndex === null) lockStage(selectedIndex); else engageStage(); }
    else if (status === GameStatus.PAUSED) { if (confirmLeave) answerBossSelect(confirmYes); else activatePauseItem(selectedIndex); }
    // The weapon screen runs its own firing range: only Start / Esc (handled there) move on
    // (the mid-game call runs its own confirm)
    else if (status === GameStatus.VICTORY && (progressionRank === 0 || callPreview)) return;
    else if (TIMED_SCREENS.includes(status) && status !== GameStatus.BOSS_VICTORY_SPEECH) handleStart();
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

  const handleBossDefeated = (stageId: string, corpseWeapon?: WeaponType) => {
    setKillRecords(prev => ({ ...prev, [stageId]: corpseWeapon ?? null }));
    // Something of his to take home to the garage
    setSouvenir(takeSouvenir(stageId));
    const newWeapon = BOSS_WEAPON_MAP[stageId];
    if (newWeapon) setAvailableWeapons(prev => prev.includes(newWeapon) ? prev : sortWeapons([...prev, newWeapon]));
    setDefeatedStages(prev => [...prev, stageId]);
    setStatus(GameStatus.BOSS_VICTORY_SPEECH);
  };

  const handlePlayerUpdate = (h: number, p: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType, lockedTo?: WeaponType) => {
    setHealth(h);
    setPower(p);
    if (ammo) setWeaponAmmo(ammo);
    if (forcedWeapon) setCurrentWeapon(forcedWeapon);
    setLockedWeapon(lockedTo);
    // Dirty Dan's machine gun takes the handgun's place in the arsenal while it's his (the same slot), and the handgun
    // goes back in it after
    if (lockedTo === 'LMG') setAvailableWeapons(ws => (ws.includes('LMG') ? ws : ws.map(w => (w === 'GUN' ? 'LMG' : w))));
    else setAvailableWeapons(ws => {
      if (!ws.includes('LMG')) return ws;
      setCurrentWeapon(c => (c === 'LMG' ? 'GUN' : c));
      return ws.map(w => (w === 'LMG' ? 'GUN' : w));
    });
  };

  // Input listeners are attached once and always call the latest render's handlers.
  /** B / Escape on stage select: back out of a lock, or back to the title when nothing is locked. */
  const stageSelectBack = (toTitle: boolean) => {
    if (engaging) return;
    if (lockedIndex !== null) unlockStage();
    else if (toTitle) setStatus(GameStatus.START);
  };

  // (in the garage, it's the garage's own input: the stage select's is off)
  const inputRef = useRef({ status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume, selectWeaponHotkey, switchTab, stageSelectBack, toggleMusic, introOn: intro !== 'off', garage: inGarage || !!pickFor, dossier: showDossier, weaponCount: availableWeapons.length, locked: !!lockedWeapon });
  inputRef.current = { status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume, selectWeaponHotkey, switchTab, stageSelectBack, toggleMusic, introOn: intro !== 'off', garage: inGarage || !!pickFor, dossier: showDossier, weaponCount: availableWeapons.length, locked: !!lockedWeapon };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (inputRef.current.garage) return;
      const { status, togglePause, moveSelection, confirmSelection, selectWeaponHotkey, switchTab, stageSelectBack } = inputRef.current;
      const key = e.key.toLowerCase();
      if (status === GameStatus.STAGE_SELECT && (key === 'escape' || key === 'backspace')) { stageSelectBack(false); return; }
      if (key === 'escape') togglePause();

      if (status === GameStatus.PLAYING) {
        // Number keys pick a weapon straight from the arsenal
        const slot = /^Digit([1-9])$/.exec(e.code);
        if (slot) selectWeaponHotkey(Number(slot[1]) - 1);
        return;
      }
      // Stage select: X (or Tab) flips between the map and the boss dossier
      if (status === GameStatus.STAGE_SELECT && (key === 'tab' || key === 'x')) { e.preventDefault(); switchTab(e.shiftKey ? -1 : 1); return; }
      // The title: M switches the music on and off
      if (status === GameStatus.START && key === 'm' && !inputRef.current.introOn) { inputRef.current.toggleMusic(); return; }
      if (key === 'arrowup' || key === 'w') moveSelection(0, -1);
      else if (key === 'arrowdown' || key === 's') moveSelection(0, 1);
      else if (key === 'arrowleft' || key === 'a') moveSelection(-1, 0);
      else if (key === 'arrowright' || key === 'd') moveSelection(1, 0);
      else if (key === 'enter' || key === ' ') {
        // A clicked menu button keeps focus; don't let the browser "click" it again on top of this
        e.preventDefault();
        confirmSelection();
      }
    };
    const onWheel = (e: WheelEvent) => {
      const { status, cycleWeapon } = inputRef.current;
      if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };
    // Right click is the menu "back" button, same as B on a controller (in-game it's the special)
    // Unpausing waits for the release, or the still-held button would fire a special on the first frame
    let rightPressedInPause = false;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2 || inputRef.current.garage) return;
      const { status, stageSelectBack } = inputRef.current;
      rightPressedInPause = status === GameStatus.PAUSED;
      if (status === GameStatus.STAGE_SELECT) stageSelectBack(true);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 2) return;
      const { status, handleResume } = inputRef.current;
      if (rightPressedInPause && status === GameStatus.PAUSED) handleResume();
      rightPressedInPause = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Gamepad menu controls (in-game movement is read by the game loop itself)
  useEffect(() => {
    let frameId = 0;
    let lastMoveAt = 0;
    const prev = { a: false, b: false, x: false, y: false, start: false, lb: false, rb: false };
    const wheel: { at: number | null } = { at: null };

    const poll = () => {
      const gp = getActiveGamepad();
      if (!gp) {
        prev.a = prev.b = prev.x = prev.y = prev.start = prev.lb = prev.rb = false;
      } else {
        const { status, togglePause, cycleWeapon, moveSelection, confirmSelection, handleResume, switchTab, stageSelectBack, garage } = inputRef.current;
        const now = Date.now();
        // (in the garage, the garage reads the pad itself)
        if (garage) { prev.a = prev.b = prev.x = prev.y = prev.start = true; frameId = requestAnimationFrame(poll); return; }
        const move = getGamepadMovement(gp, 0.25);
        // (the top button held on the dossier: the stick's scrolling it, not moving off the target)
        const scrolling = status === GameStatus.STAGE_SELECT && inputRef.current.dossier && !hasRightStick(gp.id) && isButtonPressed(gp, GP_BUTTONS.Y);
        if (!scrolling && now - lastMoveAt > PAD_REPEAT_MS) {
          const dx = move.left ? -1 : move.right ? 1 : 0;
          const dy = move.up ? -1 : move.down ? 1 : 0;
          if (moveSelection(dx, dy)) lastMoveAt = now;
        }

        const pressed = {
          // (confirm and back, wherever this controller has them)
          a: isButtonPressed(gp, menuButtons(gp).ok),
          b: isButtonPressed(gp, menuButtons(gp).back),
          x: isButtonPressed(gp, GP_BUTTONS.X),
          y: isButtonPressed(gp, GP_BUTTONS.Y),
          start: isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT),
          lb: isButtonPressed(gp, GP_BUTTONS.LB),
          rb: isButtonPressed(gp, GP_BUTTONS.RB),
        };
        const justPressed = (k: keyof typeof pressed) => pressed[k] && !prev[k];
        const inGame = status === GameStatus.PLAYING || status === GameStatus.PAUSED;

        if (inGame && justPressed('lb')) cycleWeapon(-1);
        if (inGame && justPressed('rb')) cycleWeapon(1);
        // The weapon wheel, on the right stick (not on a Joy-Con on its own: it hasn't got one; and only where the stick's
        // mapped where we'd look for it): push it any way and the wheel comes up, pointing at a weapon; let it go and
        // that's the one
        const { weaponCount, locked, selectWeaponHotkey } = inputRef.current;
        if (status === GameStatus.PLAYING && hasRightStick(gp.id) && gp.mapping === 'standard' && weaponCount > 1 && !locked) {
          const rx = gp.axes[2] ?? 0, ry = gp.axes[3] ?? 0, mag = Math.hypot(rx, ry);
          if (mag > 0.55) {
            const i = wheelIndexAt(rx, ry, weaponCount);
            if (wheel.at !== i) { wheel.at = i; setWheelAt(i); }
          } else if (mag < 0.3 && wheel.at !== null) {
            selectWeaponHotkey(wheel.at);
            wheel.at = null; setWheelAt(null);
          }
        } else if (wheel.at !== null) { wheel.at = null; setWheelAt(null); }
        if (justPressed('a') || (justPressed('start') && TIMED_SCREENS.includes(status))) confirmSelection();
        // (stage select: X, or either shoulder button, flips the map and the dossier)
        if (justPressed('x') && status === GameStatus.STAGE_SELECT) switchTab(1);
        if (justPressed('lb') && status === GameStatus.STAGE_SELECT) switchTab(-1);
        if (justPressed('rb') && status === GameStatus.STAGE_SELECT) switchTab(1);
        if (justPressed('x') && status === GameStatus.START && !inputRef.current.introOn) inputRef.current.toggleMusic();
        if (justPressed('b')) {
          if (status === GameStatus.PAUSED) handleResume();
          else if (status === GameStatus.STAGE_SELECT) stageSelectBack(true);
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
      <div className="relative shrink-0 shadow-2xl border-4 border-gray-800 bg-[#121212] overflow-hidden" style={{ width: 800, height: 600, boxSizing: 'content-box', transform: `scale(${viewScale})` }}>
        {wheelAt !== null && status === GameStatus.PLAYING && <WeaponWheel weapons={availableWeapons} index={wheelAt} current={currentWeapon} />}
        {HUD_SCREENS.includes(status) && (
          <HUD
            health={health}
            maxHealth={INITIAL_PLAYER_HEALTH}
            power={power}
            currentWeapon={currentWeapon}
            ammo={weaponAmmo[currentWeapon]}
            maxAmmo={MAX_AMMO[currentWeapon]}
          />
        )}
        {/* (hidden, so it isn't painted, while the garage covers it: the map's animations and the four photos under the
            garage and its practice range were costing frames) */}
        <div className="contents" style={{ visibility: status === GameStatus.STAGE_SELECT && inGarage ? 'hidden' : undefined }}>
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
          weaponAmmo={weaponAmmo}
          onStart={() => handleStart()}
          onStartGame={(withIntro) => handleStart(withIntro)}
          musicOn={musicOn}
          onToggleMusic={toggleMusic}
          onResume={handleResume}
          onBossSelect={askBossSelect}
          confirmLeave={confirmLeave}
          confirmYes={confirmYes}
          onAnswerLeave={answerBossSelect}
          lockedWeapon={lockedWeapon}
          onQuitToMenu={handleQuitToMenu}
          onSelectIndex={(i) => { if (lockedIndex === null && !engaging) setSelectedIndex(i); }}
          lockedIndex={lockedIndex}
          engaging={engaging}
          onStageCardClick={handleStageCardClick}
          onEngage={() => engageStage()}
          onWeaponIconClick={handleWeaponIconClick}
          showDossier={showDossier}
          onToggleDossier={toggleDossier}
          showArchive={showArchive}
          onToggleArchive={toggleArchive}
          whiteHouseOpen={whiteHouseOpen}
          killRecords={killRecords}
          cheats={SHOW_CHEATS ? { flags: cheatFlags, onToggle: handleToggleCheat, onChangeRank: handleChangeRank, onPlayEnding: () => setStatus(GameStatus.ENDING), onPlayCall: () => { setCallPreview(true); setStatus(GameStatus.VICTORY); } } : undefined}
          showCall={progressionRank === 0 || callPreview}
        />
        </div>
        {status === GameStatus.ENDING && <EndingCutscene onDone={handleEndingDone} />}
        {intro !== 'off' && (
          <IntroCutscene onHandoff={() => { setIntro('outro'); setSelectedIndex(0); setStatus(GameStatus.STAGE_SELECT); }} onDone={() => setIntro('off')} />
        )}
        {((status === GameStatus.VICTORY && (progressionRank === 0 || callPreview)) || callOutro) && (
          <RadioCutscene onHandoff={() => { setCallOutro(true); finishVictory(); }} onDone={() => setCallOutro(false)} />
        )}
        {deployingTo && status === GameStatus.STAGE_SELECT && (
          <DeployTransition
            stageId={deployingTo}
            currentStages={getStages(progressionRank)}
            defeatedStages={defeatedStages}
            onDone={() => { const id = deployingTo; setDeployingTo(null); handleSelectStage(id); }}
          />
        )}
        {status === GameStatus.BOSS_VICTORY_SPEECH && <WeaponGetScene stageId={selectedStage} souvenir={souvenir} onDone={handleStart} />}
        {status === GameStatus.STAGE_SELECT && inGarage && <Garage weapons={cheats.allWeapons ? ALL_WEAPONS : getEarnedWeapons()} onLeave={() => setInGarage(false)} report={{ bosses: reportBosses, killRecords }} />}
        {status === GameStatus.STAGE_SELECT && pickFor && (
          <CheckpointPicker stageId={pickFor} onCancel={() => setPickFor(null)}
            onPick={at => { setPickFor(null); setStartAt(at); engageRef.current(at); }} />
        )}
        <GameCanvas
          status={status}
          stageId={selectedStage}
          currentWeapon={currentWeapon}
          availableWeapons={availableWeapons}
          initialAmmo={weaponAmmo}
          cheats={{ invincible: cheats.invincible, infiniteAmmo: cheats.infiniteAmmo, infinitePower: cheats.infinitePower, skipToBoss: cheats.skipToBoss && (startAt === undefined || startAt === 'boss') }}
          startCheckpoint={cheats.skipToBoss && typeof startAt === 'number' ? startAt : 0}
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
