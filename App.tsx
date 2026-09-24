
import React, { useState, useEffect, useCallback, useRef } from 'react';
import HUD from './components/HUD';
import Overlay from './components/Overlay';
import GameCanvas from './components/GameCanvas';
import { GameStatus, WeaponType } from './types';
import { 
  INITIAL_PLAYER_HEALTH, 
  SPECIAL_CHARGE_REGEN_FRAMES, 
  MAX_AMMO, 
  STAGES, 
  BOSS_WEAPON_MAP, 
  WEAPONS_AFTER_SET_0,
  ALL_WEAPONS,
  ALL_WEAPONS_SET_0,
  VULGARITIES, 
  BOSS_DIALOGUE 
} from './constants';
import { getActiveGamepad, isButtonPressed, getGamepadMovement, GP_BUTTONS } from './gamepad';

// --- DEV CONFIG ---
const SHOW_CHEATS = true;
// ------------------

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [health, setHealth] = useState(INITIAL_PLAYER_HEALTH);
  const [specialCharges, setSpecialCharges] = useState(2);
  const [specialChargeTimer, setSpecialChargeTimer] = useState(0);
  const [bossTaunt, setBossTaunt] = useState("YOU'RE TOAST.");
  const [victorySpeech, setVictorySpeech] = useState("");
  const [briefing, setBriefing] = useState("Your mission is to kill everything in sight for no particular reason.");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [defeatedStages, setDefeatedStages] = useState<string[]>([]);
  const [availableWeapons, setAvailableWeapons] = useState<WeaponType[]>(['GUN']);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('GUN');
  // Fix: Added missing 'SLUDGE' to initial weaponAmmo state
  const [weaponAmmo, setWeaponAmmo] = useState<Record<WeaponType, number>>({
    'GUN': Infinity,
    'BOULDER': MAX_AMMO['BOULDER'],
    'SHOTGUN': MAX_AMMO['SHOTGUN'],
    'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'],
    'TSUNAMI': MAX_AMMO['TSUNAMI'],
    'NEEDLES': MAX_AMMO['NEEDLES'],
    'TASER': MAX_AMMO['TASER'],
    'SLUDGE': MAX_AMMO['SLUDGE'],
    'OIL_ROCKET': MAX_AMMO['OIL_ROCKET']
  });
  
  const [cheatEnabled, setCheatEnabled] = useState(false);
  const [invincibilityEnabled, setInvincibilityEnabled] = useState(false);
  const [infiniteAmmoEnabled, setInfiniteAmmoEnabled] = useState(false);
  const [infinitePowerEnabled, setInfinitePowerEnabled] = useState(false);
  const [jumpToBossEnabled, setJumpToBossEnabled] = useState(false);
  const [progressionRank, setProgressionRank] = useState(0);
  
  const [isVictoryPhase, setIsVictoryPhase] = useState(false);
  const [overlayActiveTime, setOverlayActiveTime] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Refs to prevent stale closures in polling
  const statusRef = useRef(status);
  const selectedIndexRef = useRef(selectedIndex);
  const progressionRankRef = useRef(progressionRank);
  const availableWeaponsRef = useRef(availableWeapons);
  const overlayActiveTimeRef = useRef(overlayActiveTime);

  const lastPadInputRef = useRef(0);
  const lastAStateRef = useRef(false);
  const lastBStateRef = useRef(false);
  const lastStartStateRef = useRef(false);
  const lastLBStateRef = useRef(false);
  const lastRBStateRef = useRef(false);

  // Sync refs with state
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { selectedIndexRef.current = selectedIndex; }, [selectedIndex]);
  useEffect(() => { progressionRankRef.current = progressionRank; }, [progressionRank]);
  useEffect(() => { availableWeaponsRef.current = availableWeapons; }, [availableWeapons]);
  useEffect(() => { overlayActiveTimeRef.current = overlayActiveTime; }, [overlayActiveTime]);

  // Global Meathead cooldown for App-level speech
  const meatheadSpeechCooldownRef = useRef(0);

  useEffect(() => {
    let interval: number;
    if (status === GameStatus.BOSS_INTRO || status === GameStatus.BOSS_VICTORY_SPEECH || status === GameStatus.START || status === GameStatus.VICTORY) {
      setOverlayActiveTime(0);
      interval = window.setInterval(() => {
        setOverlayActiveTime(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Handle Meathead speech cooldown decrement
  useEffect(() => {
    const timer = setInterval(() => {
      if (meatheadSpeechCooldownRef.current > 0) meatheadSpeechCooldownRef.current -= 100;
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const speakBossTaunt = useCallback((stage: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      switch (stage) {
        case 'Artie Avalanche': utterance.pitch = 1.6; utterance.rate = 0.85; break;
        case 'Victor Volcano': utterance.pitch = 0.7; utterance.rate = 0.85; break;
        case 'Ernie Earthquake': utterance.pitch = 0.1; utterance.rate = 0.55; break;
        case 'Hector Hurricane': utterance.pitch = 1.2; utterance.rate = 1.5; break;
        case 'Blackout Barry': utterance.pitch = 1.4; utterance.rate = 1.1; break;
        default: utterance.pitch = 1.0; utterance.rate = 1.0;
      }
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (status === GameStatus.BOSS_INTRO && selectedStage && bossTaunt) {
      speakBossTaunt(selectedStage, bossTaunt);
    }
  }, [status, selectedStage, bossTaunt, speakBossTaunt]);

  const cycleWeapon = useCallback((dir: number) => {
    const available = availableWeaponsRef.current;
    if (available.length <= 1) return;

    setCurrentWeapon(current => {
      const idx = available.indexOf(current);
      // If the current weapon isn't found (shouldn't happen, but just in case), start at 0
      const nextIdx = (idx === -1) ? (dir > 0 ? 0 : available.length - 1) : (idx + dir + available.length) % available.length;
      const nextWeapon = available[nextIdx];
      
      // Keep selectedIndex in sync in case we pause
      setSelectedIndex(available.indexOf(nextWeapon));
      return nextWeapon;
    });
  }, []);

  const selectWeaponByIndex = useCallback((index: number) => {
    setAvailableWeapons(prev => {
      if (index >= 0 && index < prev.length) {
        setCurrentWeapon(prev[index]);
      }
      return prev;
    });
  }, []);

  const handleIconClick = useCallback((index: number) => {
    setSelectedIndex(index);
    selectWeaponByIndex(index);
  }, [selectWeaponByIndex]);

  const speakRebuke = useCallback(() => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) return;
      if (meatheadSpeechCooldownRef.current > 0) return;
      const text = VULGARITIES.REBUKE[Math.floor(Math.random() * VULGARITIES.REBUKE.length)];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.1; utterance.rate = 1.1; utterance.volume = 1.0;
      utterance.onend = () => { meatheadSpeechCooldownRef.current = 1000; };
      utterance.onerror = () => { meatheadSpeechCooldownRef.current = 1000; };
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const togglePause = useCallback(() => {
    setStatus(prev => {
      if (isVictoryPhase || prev === GameStatus.BOSS_TRANSITION || prev === GameStatus.BOSS_INTRO || prev === GameStatus.BOSS_VICTORY_SPEECH || prev === GameStatus.LEVEL_INTRO || prev === GameStatus.VICTORY) return prev;
      if (prev === GameStatus.PLAYING) { 
        setSelectedIndex(availableWeaponsRef.current.indexOf(currentWeapon));
        return GameStatus.PAUSED; 
      }
      if (prev === GameStatus.PAUSED) return GameStatus.PLAYING;
      return prev;
    });
  }, [isVictoryPhase, currentWeapon]);

  const handleStart = useCallback(() => {
    if (overlayActiveTimeRef.current < 250) return;
    if (status === GameStatus.VICTORY || status === GameStatus.GAME_OVER) {
      if (progressionRank === 0 && defeatedStages.length >= 4) {
        setProgressionRank(1); setDefeatedStages([]); setAvailableWeapons(cheatEnabled && SHOW_CHEATS ? ALL_WEAPONS : WEAPONS_AFTER_SET_0); setCurrentWeapon('GUN'); setStatus(GameStatus.STAGE_SELECT);
      } else {
        setDefeatedStages([]); 
        const weaponsToStart: WeaponType[] = (cheatEnabled && SHOW_CHEATS) ? ALL_WEAPONS : (progressionRank === 1 ? WEAPONS_AFTER_SET_0 : ['GUN']); 
        setAvailableWeapons(weaponsToStart); 
        setCurrentWeapon('GUN'); 
        setWeaponAmmo({ 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] }); 
        setSelectedIndex(0); 
        setIsVictoryPhase(false); 
        setStatus(GameStatus.START);
      }
    } else if (status === GameStatus.START) {
      const weaponsToStart: WeaponType[] = (cheatEnabled && SHOW_CHEATS) ? ALL_WEAPONS : (progressionRank === 1 ? WEAPONS_AFTER_SET_0 : ['GUN']); 
      setAvailableWeapons(weaponsToStart); 
      setCurrentWeapon('GUN'); 
      setWeaponAmmo({ 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] }); 
      setStatus(GameStatus.STAGE_SELECT);
    } else if (status === GameStatus.BOSS_INTRO) {
      setStatus(GameStatus.PLAYING);
    } else if (status === GameStatus.BOSS_VICTORY_SPEECH) {
      setIsVictoryPhase(false);
      if (defeatedStages.length >= 4) { setStatus(GameStatus.VICTORY); } 
      else { 
        // Fix: Added missing 'SLUDGE' to weaponAmmo reset
        setStatus(GameStatus.STAGE_SELECT); setSelectedStage(null); setSelectedIndex(0); setCurrentWeapon('GUN'); setWeaponAmmo({ 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] }); 
      }
    }
  }, [status, defeatedStages, cheatEnabled, progressionRank]);

  const handleResume = useCallback(() => { setStatus(GameStatus.PLAYING); }, []);

  const handleBossSelect = useCallback(() => {
    // Fix: Added missing 'SLUDGE' to weaponAmmo reset
    setSelectedStage(null); setSelectedIndex(0); setIsVictoryPhase(false); setCurrentWeapon('GUN'); setStatus(GameStatus.STAGE_SELECT); setWeaponAmmo({ 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] });
  }, []);

  const handleQuitToMenu = useCallback(() => { setSelectedStage(null); setSelectedIndex(0); setIsVictoryPhase(false); setDefeatedStages([]); setCurrentWeapon('GUN'); setProgressionRank(0); setStatus(GameStatus.START); }, []);

  const handleSelectStage = useCallback((stage: string) => {
    // Fix: Added missing 'SLUDGE' to weaponAmmo reset
    if (defeatedStages.includes(stage)) { speakRebuke(); return; }
    setSelectedStage(stage); setHealth(INITIAL_PLAYER_HEALTH); setSpecialCharges(2); setSpecialChargeTimer(0); setCurrentWeapon('GUN'); setWeaponAmmo({ 'GUN': Infinity, 'BOULDER': MAX_AMMO['BOULDER'], 'SHOTGUN': MAX_AMMO['SHOTGUN'], 'FLAMETHROWER': MAX_AMMO['FLAMETHROWER'], 'TSUNAMI': MAX_AMMO['TSUNAMI'], 'NEEDLES': MAX_AMMO['NEEDLES'], 'TASER': MAX_AMMO['TASER'], 'SLUDGE': MAX_AMMO['SLUDGE'], 'OIL_ROCKET': MAX_AMMO['OIL_ROCKET'] }); setIsVictoryPhase(false); setStatus(GameStatus.LEVEL_INTRO);
  }, [defeatedStages, speakRebuke]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'escape') togglePause();
      
      if (status === GameStatus.PAUSED || status === GameStatus.STAGE_SELECT) {
        const numW = availableWeapons.length;

        if (key === 'arrowup' || key === 'w') { 
          if (status === GameStatus.PAUSED) {
            setSelectedIndex(p => {
              if (p >= numW) return p - 1; 
              if (p >= 3) return p - 3; 
              return p;
            });
          }
          if (status === GameStatus.STAGE_SELECT) setSelectedIndex(p => (p - 2 + 4) % 4); 
        } 
        else if (key === 'arrowdown' || key === 's') { 
          if (status === GameStatus.PAUSED) {
            setSelectedIndex(p => {
              if (p < numW && p + 3 < numW) return p + 3; 
              if (p < numW) return numW; 
              if (p < numW + 2) return p + 1; 
              return p;
            });
          }
          if (status === GameStatus.STAGE_SELECT) setSelectedIndex(p => (p + 2) % 4); 
        } 
        else if (key === 'arrowleft' || key === 'a') { 
          if (status === GameStatus.STAGE_SELECT) setSelectedIndex(p => (p % 2 === 0 ? p + 1 : p - 1));
          if (status === GameStatus.PAUSED) {
            if (selectedIndex < numW) {
              setSelectedIndex(p => p > 0 ? p - 1 : p);
            }
          }
        } 
        else if (key === 'arrowright' || key === 'd') { 
          if (status === GameStatus.STAGE_SELECT) setSelectedIndex(p => (p % 2 === 0 ? p + 1 : p - 1));
          if (status === GameStatus.PAUSED) {
            if (selectedIndex < numW) {
              setSelectedIndex(p => p < numW - 1 ? p + 1 : p);
            }
          }
        } 
        else if (key === 'enter' || key === ' ') { 
          if (status === GameStatus.PAUSED) {
            if (selectedIndex < numW) {
              selectWeaponByIndex(selectedIndex);
            } else if (selectedIndex === numW) {
              handleResume();
            } else if (selectedIndex === numW + 1) {
              handleBossSelect();
            } else if (selectedIndex === numW + 2) {
              handleQuitToMenu();
            }
          } else if (status === GameStatus.STAGE_SELECT) { handleSelectStage(STAGES(progressionRank)[selectedIndex].id); } 
        }
      } else if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) { 
        if (key === 'q') cycleWeapon(-1); if (key === 'e') cycleWeapon(1); 
      } 
      else if (status === GameStatus.START || status === GameStatus.BOSS_INTRO || status === GameStatus.BOSS_VICTORY_SPEECH || status === GameStatus.VICTORY) { if (key === 'enter' || key === ' ') handleStart(); }
    };
    const handleWheel = (e: WheelEvent) => { if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) cycleWeapon(e.deltaY > 0 ? 1 : -1); };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('wheel', handleWheel);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('wheel', handleWheel); };
  }, [togglePause, status, cycleWeapon, selectWeaponByIndex, availableWeapons, currentWeapon, selectedIndex, handleResume, handleBossSelect, handleQuitToMenu, handleSelectStage, handleStart, progressionRank]);

  const handleToggleCheat = useCallback(() => {
    setCheatEnabled(prev => { 
      const newState = !prev; 
      if (newState) {
        setAvailableWeapons(ALL_WEAPONS); 
      } else {
        if (progressionRank === 0) { 
          const earned = ['GUN', ...defeatedStages.map(s => BOSS_WEAPON_MAP[s]).filter(Boolean)] as WeaponType[];
          earned.sort((a, b) => ALL_WEAPONS.indexOf(a) - ALL_WEAPONS.indexOf(b));
          setAvailableWeapons(earned); 
          if (!earned.includes(currentWeapon)) setCurrentWeapon('GUN'); 
        } else {
          const earned = Array.from(new Set([...WEAPONS_AFTER_SET_0, ...defeatedStages.map(s => BOSS_WEAPON_MAP[s]).filter(Boolean)])) as WeaponType[];
          earned.sort((a, b) => ALL_WEAPONS.indexOf(a) - ALL_WEAPONS.indexOf(b));
          setAvailableWeapons(earned);
          if (!earned.includes(currentWeapon)) setCurrentWeapon('GUN');
        }
      } 
      return newState; 
    });
  }, [progressionRank, defeatedStages, currentWeapon]);

  const handleToggleInvincibility = useCallback(() => setInvincibilityEnabled(prev => !prev), []);
  const handleToggleInfiniteAmmo = useCallback(() => setInfiniteAmmoEnabled(prev => !prev), []);
  const handleToggleInfinitePower = useCallback(() => setInfinitePowerEnabled(prev => !prev), []);
  const handleToggleJumpToBoss = useCallback(() => setJumpToBossEnabled(prev => !prev), []);
  const handleIncrementRank = useCallback(() => { 
    setProgressionRank(r => { 
      const next = Math.min(r + 1, 1); 
      if (next === 1) {
        setAvailableWeapons(cheatEnabled && SHOW_CHEATS ? ALL_WEAPONS : WEAPONS_AFTER_SET_0);
        setCurrentWeapon('GUN');
      }
      return next; 
    }); 
  }, [cheatEnabled]);
  const handleDecrementRank = useCallback(() => { 
    setProgressionRank(r => { 
      const next = Math.max(r - 1, 0); 
      if (next === 0) {
        setAvailableWeapons(cheatEnabled && SHOW_CHEATS ? ALL_WEAPONS : ['GUN']);
        setCurrentWeapon('GUN');
      }
      return next; 
    }); 
  }, [cheatEnabled]);
  const handleBossTransition = useCallback(() => setStatus(GameStatus.BOSS_TRANSITION), []);
  const handleBossDeath = useCallback(() => setIsVictoryPhase(true), []);
  const handleBossEncounter = useCallback(() => { setStatus(GameStatus.BOSS_INTRO); const pool = BOSS_DIALOGUE.INTRO_QUOTES[selectedStage || ''] || BOSS_DIALOGUE.INTRO_QUOTES['default']; const taunt = pool[1] || pool[0]; setBossTaunt(taunt); }, [selectedStage]);

  const handleBossDefeated = useCallback((stageId: string) => {
    const newWeapon = BOSS_WEAPON_MAP[stageId];
    if (newWeapon) {
      setAvailableWeapons(prev => {
        if (prev.includes(newWeapon)) return prev;
        const updated = [...prev, newWeapon];
        return updated.sort((a, b) => ALL_WEAPONS.indexOf(a) - ALL_WEAPONS.indexOf(b));
      });
    }
    setDefeatedStages(prev => [...prev, stageId]);
    const speech = VULGARITIES.LOCAL_VICTORY[Math.floor(Math.random() * VULGARITIES.LOCAL_VICTORY.length)];
    setVictorySpeech(speech); setStatus(GameStatus.BOSS_VICTORY_SPEECH);
  }, []);

  const handleGameOver = useCallback((victory: boolean) => { if (!victory) { setIsVictoryPhase(false); setStatus(GameStatus.GAME_OVER); } }, []);
  const handlePlayerUpdate = useCallback((h: number, sc: number, st: number, ammo?: Record<WeaponType, number>, forcedWeapon?: WeaponType) => { setHealth(h); setSpecialCharges(sc); setSpecialChargeTimer(st); if (ammo) setWeaponAmmo(ammo); if (forcedWeapon) setCurrentWeapon(forcedWeapon); }, []);
  const handleIntroComplete = useCallback(() => setStatus(GameStatus.PLAYING), []);

  useEffect(() => {
    let frameId: number;
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = Date.now();
        const currentStatus = statusRef.current;
        const currentIdx = selectedIndexRef.current;
        const numW = availableWeaponsRef.current.length;

        const move = getGamepadMovement(gp, 0.25);

        if (now - lastPadInputRef.current > 180) {
            let dx = 0, dy = 0;
            if (move.left) dx = -1;
            if (move.right) dx = 1;
            if (move.up) dy = -1;
            if (move.down) dy = 1;

            if (currentStatus === GameStatus.STAGE_SELECT) {
              if (dx !== 0) { setSelectedIndex(prev => (prev % 2 === 0 ? prev + 1 : prev - 1)); lastPadInputRef.current = now; }
              if (dy !== 0) { setSelectedIndex(prev => (prev < 2 ? prev + 2 : prev - 2)); lastPadInputRef.current = now; }
            } else if (currentStatus === GameStatus.PAUSED) {
              if (dy < 0) { 
                setSelectedIndex(p => {
                  if (p >= numW) return p - 1;
                  if (p >= 3) return p - 3;
                  return p;
                });
                lastPadInputRef.current = now; 
              } 
              else if (dy > 0) { 
                setSelectedIndex(p => {
                  if (p < numW && p + 3 < numW) return p + 3;
                  if (p < numW) return numW;
                  if (p < numW + 2) return p + 1;
                  return p;
                });
                lastPadInputRef.current = now; 
              }
              else if (dx < 0 && currentIdx < numW) {
                setSelectedIndex(p => p > 0 ? p - 1 : p);
                lastPadInputRef.current = now;
              }
              else if (dx > 0 && currentIdx < numW) {
                setSelectedIndex(p => p < numW - 1 ? p + 1 : p);
                lastPadInputRef.current = now;
              }
            }
        }

        const aPressed = isButtonPressed(gp, GP_BUTTONS.A); 
        const bPressed = isButtonPressed(gp, GP_BUTTONS.B); 
        const startPressed = isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT);
        const lbPressed = isButtonPressed(gp, GP_BUTTONS.LB);
        const rbPressed = isButtonPressed(gp, GP_BUTTONS.RB);

        if (currentStatus === GameStatus.PLAYING || currentStatus === GameStatus.PAUSED) {
          if (lbPressed && !lastLBStateRef.current) cycleWeapon(-1);
          if (rbPressed && !lastRBStateRef.current) cycleWeapon(1);
        }

        const confirmPressed = (aPressed && !lastAStateRef.current) || (startPressed && !lastStartStateRef.current && (currentStatus === GameStatus.START || currentStatus === GameStatus.VICTORY || currentStatus === GameStatus.GAME_OVER || currentStatus === GameStatus.BOSS_INTRO || currentStatus === GameStatus.BOSS_VICTORY_SPEECH));

        if (confirmPressed) {
            if (currentStatus === GameStatus.START || currentStatus === GameStatus.VICTORY || currentStatus === GameStatus.GAME_OVER || currentStatus === GameStatus.BOSS_INTRO || currentStatus === GameStatus.BOSS_VICTORY_SPEECH) {
              handleStart();
            } else if (currentStatus === GameStatus.STAGE_SELECT) {
              handleSelectStage(STAGES(progressionRankRef.current)[currentIdx].id);
            } else if (currentStatus === GameStatus.PAUSED) {
              if (currentIdx < numW) {
                selectWeaponByIndex(currentIdx);
              } else if (currentIdx === numW) {
                handleResume();
              } else if (currentIdx === numW + 1) {
                handleBossSelect();
              } else if (currentIdx === numW + 2) {
                handleQuitToMenu();
              }
            }
        }
        if (bPressed && !lastBStateRef.current) { 
          if (currentStatus === GameStatus.PAUSED) handleResume(); 
          else if (currentStatus === GameStatus.STAGE_SELECT) setStatus(GameStatus.START); 
        }
        if (startPressed && !lastStartStateRef.current) { 
          if (currentStatus === GameStatus.PLAYING || currentStatus === GameStatus.PAUSED) togglePause(); 
        }

        lastAStateRef.current = !!aPressed; 
        lastBStateRef.current = !!bPressed; 
        lastStartStateRef.current = !!startPressed; 
        lastLBStateRef.current = !!lbPressed; 
        lastRBStateRef.current = !!rbPressed;
      } else {
        lastAStateRef.current = false;
        lastBStateRef.current = false;
        lastStartStateRef.current = false;
        lastLBStateRef.current = false;
        lastRBStateRef.current = false;
      }
      frameId = requestAnimationFrame(poll);
    };
    frameId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frameId);
  }, [handleStart, handleSelectStage, handleResume, handleBossSelect, handleQuitToMenu, togglePause, cycleWeapon, selectWeaponByIndex]);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="relative shadow-2xl border-4 border-gray-800 bg-[#121212] overflow-hidden" style={{ width: 800, height: 600, boxSizing: 'content-box' }}>
        {(status === GameStatus.LEVEL_INTRO || status === GameStatus.PLAYING || status === GameStatus.BOSS_TRANSITION || status === GameStatus.PAUSED || status === GameStatus.BOSS_INTRO || status === GameStatus.BOSS_VICTORY_SPEECH) && (
          <HUD health={health} maxHealth={INITIAL_PLAYER_HEALTH} specialCharges={specialCharges} specialChargeTimer={specialChargeTimer} maxChargeTimer={SPECIAL_CHARGE_REGEN_FRAMES} currentWeapon={currentWeapon} ammo={weaponAmmo[currentWeapon]} maxAmmo={MAX_AMMO[currentWeapon]} />
        )}
        <Overlay 
          status={status} 
          onStart={handleStart} 
          onResume={handleResume} 
          onBossSelect={handleBossSelect} 
          onQuitToMenu={handleQuitToMenu} 
          onSelectStage={handleSelectStage} 
          onSelectIndex={setSelectedIndex}
          onIconClick={handleIconClick}
          onCheatAllWeapons={handleToggleCheat} 
          onToggleInvincibility={handleToggleInvincibility} 
          onToggleInfiniteAmmo={handleToggleInfiniteAmmo} 
          onToggleInfinitePower={handleToggleInfinitePower} 
          onToggleJumpToBoss={handleToggleJumpToBoss} 
          onIncrementRank={handleIncrementRank} 
          onDecrementRank={handleDecrementRank} 
          progressionRank={progressionRank} 
          cheatEnabled={cheatEnabled} 
          invincibilityEnabled={invincibilityEnabled} 
          infiniteAmmoEnabled={infiniteAmmoEnabled} 
          infinitePowerEnabled={infinitePowerEnabled} 
          jumpToBossEnabled={jumpToBossEnabled} 
          showCheats={SHOW_CHEATS} 
          bossTaunt={bossTaunt} 
          victorySpeech={victorySpeech} 
          briefing={briefing} 
          defeatedStages={defeatedStages} 
          selectedIndex={selectedIndex} 
          overlayActiveTime={overlayActiveTime} 
          stageId={selectedStage} 
          availableWeapons={availableWeapons}
          currentWeapon={currentWeapon}
        />
        <GameCanvas status={status} stageId={selectedStage} onPlayerUpdate={handlePlayerUpdate} onBossEncounter={handleBossEncounter} onBossTransition={handleBossTransition} onBossDefeated={handleBossDefeated} onBossDeath={handleBossDeath} onBossSelect={handleBossSelect} onGameOver={handleGameOver} onIntroComplete={handleIntroComplete} onTogglePause={togglePause} currentWeapon={currentWeapon} initialAmmo={weaponAmmo} invincibilityEnabled={invincibilityEnabled && (SHOW_CHEATS)} infiniteAmmoEnabled={infiniteAmmoEnabled && (SHOW_CHEATS)} infinitePowerEnabled={infinitePowerEnabled && (SHOW_CHEATS)} jumpToBossEnabled={jumpToBossEnabled && (SHOW_CHEATS)} bossTauntText={bossTaunt} />
      </div>
    </div>
  );
};

export default App;
