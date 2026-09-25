import React from 'react';
import { GameStatus, WeaponType } from '../types';
import {
  getStages, getWeaponDescription, WEAPON_NAMES, WEAPON_DESCRIPTIONS, BOSS_SET_TITLES, BOSS_LOCATIONS,
} from '../stages';
import USAMap from './USAMap';
import BossPortrait from './BossPortrait';
import WeaponIcon from './WeaponIcon';
import MeatheadCaricature from './MeatheadCaricature';
import ControlsGuide from './ControlsGuide';

export interface CheatFlags {
  allWeapons: boolean;
  invincible: boolean;
  infiniteAmmo: boolean;
  infinitePower: boolean;
  skipToBoss: boolean;
}

interface OverlayProps {
  status: GameStatus;
  selectedIndex: number;
  /** Buttons stay disabled until the screen has been up this long, so a held key can't skip it. */
  isInputLocked: boolean;
  progressionRank: number;
  defeatedStages: string[];
  stageId: string | null;
  bossTaunt: string;
  availableWeapons: WeaponType[];
  currentWeapon: WeaponType;
  onStart: () => void;
  onResume: () => void;
  onBossSelect: () => void;
  onQuitToMenu: () => void;
  onSelectStage: (stageId: string) => void;
  onSelectIndex: (index: number) => void;
  onWeaponIconClick: (index: number) => void;
  /** Dev cheat panel on the title screen; omitted when cheats are disabled. */
  cheats?: {
    flags: CheatFlags;
    onToggle: (flag: keyof CheatFlags) => void;
    onChangeRank: (delta: number) => void;
  };
}

const MISSION_BRIEFING = "Your mission is to kill everything in sight for no particular reason.";

/** Full-screen menus and story screens drawn over the game canvas. */
const Overlay: React.FC<OverlayProps> = (props) => {
  const { status } = props;
  if (status === GameStatus.PLAYING || status === GameStatus.LEVEL_INTRO || status === GameStatus.BOSS_TRANSITION) return null;

  return (
    <div className={`absolute inset-0 ${status === GameStatus.PAUSED ? 'bg-black/85 backdrop-blur-[2px]' : 'bg-black'} flex flex-col items-center justify-center z-50 p-6 text-center overflow-hidden`}>
      {status === GameStatus.START && <TitleScreen {...props} />}
      {status === GameStatus.STAGE_SELECT && <StageSelectScreen {...props} />}
      {status === GameStatus.PAUSED && <PauseMenu {...props} />}
      {status === GameStatus.BOSS_INTRO && <BossIntroScreen {...props} />}
      {status === GameStatus.BOSS_VICTORY_SPEECH && <WeaponGainedScreen {...props} />}
      {status === GameStatus.VICTORY && <FinalVictoryScreen {...props} />}
    </div>
  );
};

const CheatToggle: React.FC<{ label: string, on: boolean, onColor: string, onClick: () => void }> = ({ label, on, onColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${on ? `${onColor} border-white text-black` : 'bg-gray-800 border-gray-600 text-gray-400'}`}
  >
    {label}: {on ? 'ON' : 'OFF'}
  </button>
);

const CheatPanel: React.FC<{ rank: number, cheats: NonNullable<OverlayProps['cheats']> }> = ({ rank, cheats: { flags, onToggle, onChangeRank } }) => (
  <div className="absolute top-2 right-2 z-[60] flex flex-col gap-1 items-end max-w-[150px]">
    <div className="flex w-full border-2 border-gray-600 bg-gray-900 shadow-[2px_2px_0px_white] items-center overflow-hidden">
      <button onClick={() => onChangeRank(-1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">-</button>
      <div className="flex-1 text-[7px] font-black text-yellow-400 uppercase tracking-tighter">SKP SET: {rank}</div>
      <button onClick={() => onChangeRank(1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">+</button>
    </div>
    <CheatToggle label="SKIP LEVEL" on={flags.skipToBoss} onColor="bg-red-500" onClick={() => onToggle('skipToBoss')} />
    <div className="h-2 w-full" />
    <CheatToggle label="GOD MODE" on={flags.invincible} onColor="bg-green-500" onClick={() => onToggle('invincible')} />
    <CheatToggle label="ALL WEAPONS" on={flags.allWeapons} onColor="bg-yellow-500" onClick={() => onToggle('allWeapons')} />
    <CheatToggle label="INF AMMO" on={flags.infiniteAmmo} onColor="bg-blue-500" onClick={() => onToggle('infiniteAmmo')} />
    <CheatToggle label="INF POWER" on={flags.infinitePower} onColor="bg-purple-500" onClick={() => onToggle('infinitePower')} />
  </div>
);

const TitleScreen: React.FC<OverlayProps> = ({ isInputLocked, onStart, cheats, progressionRank }) => (
  <>
    {cheats && <CheatPanel rank={progressionRank} cheats={cheats} />}
    <div className="animate-in fade-in zoom-in duration-700 max-w-lg relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1">
      <MeatheadCaricature />
      <h1 className="text-3xl md:text-4xl text-red-600 mb-1 font-black tracking-tighter drop-shadow-[3px_3px_0px_white] shrink-0">MEATHEAD</h1>
      <div className="text-white text-[8px] md:text-[8.5px] mb-2 border-y border-red-900/80 py-1 px-3 italic uppercase tracking-tight leading-relaxed max-w-sm mx-auto shrink-0">MISSION: {MISSION_BRIEFING}</div>
      <button disabled={isInputLocked} onClick={onStart} className={`px-8 py-2.5 text-white text-base md:text-lg border-b-[6px] transition-all font-black uppercase ring-2 ring-white/10 shrink-0 ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50 cursor-not-allowed' : 'bg-red-700 hover:bg-red-500 border-red-900 active:translate-y-1 active:border-b-0'}`}>
        {isInputLocked ? 'READYING PUMP...' : 'BEGIN THE PUMP'}
      </button>
      <ControlsGuide />
    </div>
  </>
);

const StageSelectScreen: React.FC<OverlayProps> = ({ progressionRank, defeatedStages, selectedIndex, onSelectIndex, onSelectStage }) => {
  const currentStages = getStages(progressionRank);
  const choose = (idx: number) => {
    onSelectIndex(idx);
    onSelectStage(currentStages[idx].id);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-2 pb-1 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden select-none">
      <div className="flex flex-col items-center mb-2 shrink-0">
        <h2 className="text-xl md:text-2xl text-red-600 font-black tracking-widest border-b-4 border-red-900 pb-1 uppercase italic drop-shadow-[0_2px_2px_rgba(153,0,0,0.8)] [text-shadow:2px_2px_0_rgb(0,0,0),_0_4px_0_rgba(153,0,0,0.8),_0_8px_0_rgba(153,0,0,0.4),_2px_12px_2px_rgba(255,0,0,0.5)]">
          {BOSS_SET_TITLES[progressionRank] || "THE FOUR ASSHOLES"}
        </h2>
        <div className="text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
          TARGET SELECTION // UNITED STATES RADAR INFILTRATION
        </div>
      </div>

      <div className="w-full max-w-[770px] flex flex-row items-center justify-center gap-4 px-2">
        {/* 2x2 boss cards */}
        <div className="w-[330px] grid grid-cols-2 gap-2.5 shrink-0">
          {currentStages.map((stage, idx) => {
            const isDefeated = defeatedStages.includes(stage.id);
            const isSelected = idx === selectedIndex;
            const loc = BOSS_LOCATIONS[stage.id];
            return (
              <button
                key={stage.id}
                onClick={() => choose(idx)}
                onMouseEnter={() => onSelectIndex(idx)}
                className={`w-full h-[185px] ${isDefeated ? 'opacity-70' : ''} border-3 ${isSelected ? 'border-yellow-400 scale-[1.03] shadow-[0_0_20px_rgba(255,255,0,0.6)] z-10 ring-2 ring-yellow-400/50' : 'border-white/40 hover:border-white/80'} bg-[#1E1E1E] transition-all flex flex-col overflow-hidden group shadow-lg rounded-sm text-left`}
              >
                <div className="flex-1 bg-black relative overflow-hidden">
                  <BossPortrait id={stage.id} />
                  {isDefeated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
                      <div className="text-red-600 text-xs font-black rotate-[-15deg] border-2 border-red-900 px-1 py-0.5 uppercase tracking-tighter bg-black/90 shadow-[0_0_10px_rgba(220,38,38,0.8)] [text-shadow:1px_1px_0_black]">
                        FUCKING DEAD
                      </div>
                    </div>
                  )}
                  {loc && (
                    <div className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.5 rounded border border-cyan-500/40 text-[7px] font-mono font-bold text-cyan-300 pointer-events-none">
                      {loc.stateCode}
                    </div>
                  )}
                </div>
                <div className={`p-1 flex flex-col items-center justify-center ${isSelected ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-white'}`}>
                  <span className="text-[8.5px] font-black uppercase leading-tight text-center truncate w-full">
                    {stage.id}
                  </span>
                  {loc && (
                    <span className={`text-[7px] font-mono uppercase truncate w-full text-center ${isSelected ? 'text-black/80 font-bold' : 'text-gray-400'}`}>
                      {loc.city}, {loc.stateCode}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* USA map (Alaska and Hawaii included) */}
        <div className="w-[390px] shrink-0 flex flex-col justify-center">
          <USAMap
            selectedBossId={currentStages[selectedIndex]?.id || currentStages[0]?.id}
            defeatedStages={defeatedStages}
            currentStages={currentStages}
            onSelectStage={(id) => {
              const idx = currentStages.findIndex(s => s.id === id);
              if (idx !== -1) choose(idx);
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Pause menu. `selectedIndex` walks the weapon grid first, then the three
 * buttons below it (RESUME, BOSS SELECT, QUIT).
 */
const PauseMenu: React.FC<OverlayProps> = ({ availableWeapons, currentWeapon, selectedIndex, onWeaponIconClick, onResume, onBossSelect, onQuitToMenu }) => {
  const numWeapons = availableWeapons.length;
  const highlightedWeapon = selectedIndex < numWeapons ? availableWeapons[selectedIndex] : undefined;
  const menuButton = (label: string, index: number, onClick: () => void, colors: string, selectedColor: string) => (
    <button onClick={onClick} className={`py-1 ${colors} text-white text-sm font-black border-b-[3px] transition-all uppercase ${selectedIndex === index ? `ring-2 ring-white scale-105 ${selectedColor}` : ''}`}>{label}</button>
  );

  return (
    <div className="animate-in fade-in duration-200 flex flex-col items-center w-full max-w-lg px-6 py-4 bg-zinc-950/95 border-2 border-yellow-500/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] rounded-sm">
      <h2 className="text-xl md:text-2xl text-white mb-2 font-black uppercase tracking-widest italic border-b-2 border-yellow-500 pb-1 shrink-0">RESTING SET</h2>
      <div className="mb-2 w-full flex flex-col items-center shrink-0">
        <div className="text-yellow-400 text-[9px] font-black uppercase mb-1 tracking-tighter italic opacity-80">CHOOSE ARMAMENT</div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {availableWeapons.map((w, i) => (
            <WeaponIcon key={w} type={w} isEquipped={w === currentWeapon} isSelected={selectedIndex === i} onClick={() => onWeaponIconClick(i)} />
          ))}
        </div>
        <div className="min-h-[50px] text-center px-2 flex flex-col items-center justify-start overflow-hidden">
          {highlightedWeapon && (
            <>
              <div className="text-white text-[10px] font-black uppercase italic drop-shadow-md underline decoration-red-600 decoration-1 underline-offset-2 mb-0.5">
                {highlightedWeapon.replace(/_/g, ' ')}
              </div>
              <div className="text-gray-400 text-[8px] font-bold italic uppercase tracking-tight leading-tight max-w-xs">
                "{getWeaponDescription(highlightedWeapon)}"
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-56 shrink-0">
        {menuButton('RESUME', numWeapons, onResume, 'bg-yellow-600 border-yellow-800', 'bg-yellow-500')}
        {menuButton('BOSS SELECT', numWeapons + 1, onBossSelect, 'bg-red-700 border-red-900', 'bg-red-600')}
        {menuButton('QUIT TO MENU', numWeapons + 2, onQuitToMenu, 'bg-gray-700 border-gray-900', 'bg-gray-600')}
      </div>
    </div>
  );
};

const BossIntroScreen: React.FC<OverlayProps> = ({ bossTaunt, isInputLocked, onStart }) => (
  <div className="bg-red-950/90 border-4 border-red-600 p-6 max-w-lg animate-in fade-in slide-in-from-top-4 duration-500 shadow-[0_0_40px_rgba(255,0,0,0.4)]">
    <h2 className="text-xl md:text-2xl text-red-500 mb-4 font-black tracking-tighter italic uppercase underline decoration-2">ENEMY LOG:</h2>
    <div className="max-h-32 overflow-y-auto mb-6 px-4 text-left border-l-4 border-red-500 bg-black/40 py-4">
      <p className="text-white italic text-sm md:text-base leading-snug uppercase tracking-tight">"{bossTaunt}"</p>
    </div>
    <button disabled={isInputLocked} onClick={onStart} className={`px-8 py-4 text-white text-lg font-black border-b-[6px] transition-all uppercase ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50' : 'bg-red-600 hover:bg-red-500 border-red-900 active:translate-y-1 active:border-b-0'}`}>
      {isInputLocked ? 'LISTENING...' : 'STFU AND DIE'}
    </button>
  </div>
);

const WeaponGainedScreen: React.FC<OverlayProps> = ({ stageId, isInputLocked, onStart }) => (
  <div className="bg-blue-900/95 border-8 border-blue-400 p-6 max-w-2xl animate-in fade-in zoom-in duration-500">
    <h2 className="text-3xl md:text-5xl text-yellow-400 mb-6 font-black uppercase tracking-widest italic underline decoration-4 underline-offset-4">GAINS</h2>
    <div className="mb-8 text-center bg-black/50 p-8 rounded-lg border-2 border-white/10 flex flex-col gap-4">
      <p className="text-yellow-400 text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">You have gained {stageId ? WEAPON_NAMES[stageId] : 'NEW MUSCLES'}</p>
      {stageId && WEAPON_DESCRIPTIONS[stageId] && <p className="text-white text-sm md:text-base font-bold italic tracking-tight leading-relaxed max-w-lg mx-auto">"{WEAPON_DESCRIPTIONS[stageId]}"</p>}
    </div>
    <button disabled={isInputLocked} onClick={onStart} className={`px-12 py-6 text-black text-xl font-black border-b-[8px] transition-all uppercase ${isInputLocked ? 'bg-gray-500 border-gray-700 opacity-50' : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-800 active:translate-y-1 active:border-b-0'}`}>
      {isInputLocked ? 'INFUSING GAINS...' : 'fuck yeah'}
    </button>
  </div>
);

const ENDINGS = [
  'Good job, Meathead. Your quest to just fucking kill everyone in sight paid off. Local counter terrorism units identified the men you killed as "The Four Assholes." You saved the world! Or did you?',
  'Meathead... you have obliterated the second set of threats. Your biceps are officially classified as weapons of mass destruction. The world is safe, and your protein shake is waiting.',
];

const FinalVictoryScreen: React.FC<OverlayProps> = ({ progressionRank, isInputLocked, onStart }) => (
  <div className="animate-in fade-in duration-1000 max-w-xl bg-black/90 p-6 md:p-10 border-4 border-yellow-400 shadow-[0_0_50px_rgba(255,255,0,0.3)] flex flex-col items-center">
    <h2 className="text-2xl md:text-3xl text-yellow-400 mb-4 font-black tracking-tighter uppercase italic leading-none drop-shadow-md shrink-0">CONGRATULATIONS!!</h2>
    <div className="mb-6 max-h-[180px] md:max-h-[240px] overflow-y-auto bg-black/60 p-4 border border-white/10 rounded-sm w-full">
      <p className="text-white text-[9px] md:text-[10px] uppercase font-black tracking-normal leading-relaxed text-left">
        {ENDINGS[progressionRank === 0 ? 0 : 1]}
      </p>
    </div>
    <button disabled={isInputLocked} onClick={onStart} className={`w-full py-5 text-black font-black border-b-[8px] text-lg shadow-xl transition-all ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50 text-gray-500' : 'bg-yellow-400 hover:bg-yellow-300 border-yellow-700 active:translate-y-1 active:border-b-0'}`}>
      {isInputLocked ? 'WAITING...' : 'BRING IT!'}
    </button>
  </div>
);

export default Overlay;
