import React from 'react';
import { GameStatus, WeaponType } from '../types';
import { MAX_AMMO } from '../constants';
import {
  getStages, getWeaponDescription, BOSS_SET_TITLES, BOSS_LOCATIONS, getWeaponInfo,
} from '../stages';
import USAMap from './USAMap';
import BossPortrait from './BossPortrait';
import WeaponIcon, { WeaponArt } from './WeaponIcon';
import DossierPanel from './DossierPanel';
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
  weaponAmmo: Record<WeaponType, number>;
  onStart: () => void;
  onResume: () => void;
  onBossSelect: () => void;
  onQuitToMenu: () => void;
  onSelectIndex: (index: number) => void;
  /** Stage select: the locked-in target (null while browsing), and the ENGAGE flourish in progress. */
  lockedIndex: number | null;
  engaging: boolean;
  /** A portrait or map pin was clicked: lock it in, or unlock it if it's already locked. */
  onStageCardClick: (index: number) => void;
  onEngage: () => void;
  onWeaponIconClick: (index: number) => void;
  /** Stage select: showing the selected boss's dossier instead of the map. */
  showDossier: boolean;
  onToggleDossier: () => void;
  /** Stage select on the second set: browsing the previous set's targets (all dead) instead. */
  showArchive: boolean;
  onToggleArchive: () => void;
  /** How each boss died: the weakness weapon that wrecked his corpse, or null for a plain kill. */
  killRecords: Record<string, WeaponType | null>;
  /** Dev cheat panel on the title screen; omitted when cheats are disabled. */
  cheats?: {
    flags: CheatFlags;
    onToggle: (flag: keyof CheatFlags) => void;
    onChangeRank: (delta: number) => void;
    onPlayEnding: () => void;
  };
}

const MISSION_BRIEFING = "Your mission is to kill everything in sight for no particular reason.";

/** Full-screen menus and story screens drawn over the game canvas. */
const Overlay: React.FC<OverlayProps> = (props) => {
  const { status } = props;
  // (The weapon screen after a boss is its own scene: see WeaponGetScene)
  if (status === GameStatus.PLAYING || status === GameStatus.LEVEL_INTRO || status === GameStatus.BOSS_TRANSITION || status === GameStatus.BOSS_VICTORY_SPEECH) return null;

  return (
    <div className={`absolute inset-0 ${status === GameStatus.PAUSED ? 'bg-black/85 backdrop-blur-[2px]' : 'bg-black'} flex flex-col items-center justify-center z-50 p-6 text-center overflow-hidden`}>
      {status === GameStatus.START && <TitleScreen {...props} />}
      {status === GameStatus.STAGE_SELECT && <StageSelectScreen {...props} />}
      {status === GameStatus.STAGE_SELECT && props.engaging && props.lockedIndex !== null && (
        <EngageFlash bossId={getStages(props.progressionRank)[props.lockedIndex]?.id || ''} />
      )}
      {status === GameStatus.PAUSED && <PauseMenu {...props} />}
      {status === GameStatus.BOSS_INTRO && <BossIntroScreen {...props} />}
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

const CheatPanel: React.FC<{ rank: number, cheats: NonNullable<OverlayProps['cheats']> }> = ({ rank, cheats: { flags, onToggle, onChangeRank, onPlayEnding } }) => (
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
    <div className="h-2 w-full" />
    <button onClick={onPlayEnding} className="w-full px-2 py-1 border-2 border-gray-600 bg-gray-800 text-yellow-300 font-black text-[7px] uppercase shadow-[2px_2px_0px_white] hover:bg-gray-700">VIEW ENDING (DEBUG)</button>
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

const StageSelectScreen: React.FC<OverlayProps> = ({ progressionRank, defeatedStages, selectedIndex, onSelectIndex, showDossier, onToggleDossier, lockedIndex, engaging, onStageCardClick, onEngage, showArchive, onToggleArchive, killRecords }) => {
  // The archive shows the previous set: every one of them already dead
  const archive = showArchive && progressionRank >= 1;
  const setRank = archive ? progressionRank - 1 : progressionRank;
  const currentStages = getStages(setRank);
  const deadIds = archive ? currentStages.map(s => s.id) : defeatedStages;
  const locked = lockedIndex !== null;
  const selectedId = currentStages[selectedIndex]?.id || currentStages[0]?.id;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-start pt-2 pb-1 overflow-hidden select-none ${engaging ? 'mh-engage-shake' : 'animate-in slide-in-from-bottom-8 duration-500'}`}>
      <div className="flex flex-col items-center mb-2 shrink-0">
        <h2 className="text-xl md:text-2xl text-red-600 font-black tracking-widest border-b-4 border-red-900 pb-1 uppercase italic drop-shadow-[0_2px_2px_rgba(153,0,0,0.8)] [text-shadow:2px_2px_0_rgb(0,0,0),_0_4px_0_rgba(153,0,0,0.8),_0_8px_0_rgba(153,0,0,0.4),_2px_12px_2px_rgba(255,0,0,0.5)]">
          {BOSS_SET_TITLES[setRank] || "THE FOUR ASSHOLES"}
        </h2>
        <div className="text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
          {archive ? 'ARCHIVE // PREVIOUSLY TERMINATED TARGETS // CASES CLOSED' : 'TARGET SELECTION // UNITED STATES RADAR INFILTRATION'}
        </div>
      </div>

      <div className="w-full max-w-[770px] flex flex-row items-center justify-center gap-4 px-2">
        <div className="w-[330px] shrink-0 flex flex-col gap-3">
        {progressionRank >= 1 && (
          <div className="flex items-center justify-between -mb-1">
            <div className="flex">
              {(['CURRENT TARGETS', 'OLD TARGETS'] as const).map(tab => {
                const on = (tab === 'OLD TARGETS') === archive;
                return (
                  <button key={tab} onClick={() => { if (!on) onToggleArchive(); }}
                    className={`px-2 py-[3px] text-[7px] font-black tracking-wider border-2 ${on ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}>
                    {tab}
                  </button>
                );
              })}
            </div>
            <span className="text-[7px] font-mono text-cyan-400/80 tracking-wider">(Y) / TAB</span>
          </div>
        )}
        {/* 2x2 boss cards */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          {currentStages.map((stage, idx) => {
            const isDefeated = deadIds.includes(stage.id);
            const isSelected = idx === selectedIndex;
            const isLocked = idx === lockedIndex;
            const loc = BOSS_LOCATIONS[stage.id];
            const frame = isLocked
              ? 'border-red-500 scale-[1.05] shadow-[0_0_26px_rgba(239,68,68,0.9)] z-10 ring-2 ring-red-500/70'
              : isSelected ? 'border-yellow-400 scale-[1.03] shadow-[0_0_20px_rgba(255,255,0,0.6)] z-10 ring-2 ring-yellow-400/50'
              : 'border-white/40 hover:border-white/80';
            return (
              <button
                key={stage.id}
                onClick={() => onStageCardClick(idx)}
                onMouseEnter={() => onSelectIndex(idx)}
                className={`w-full ${progressionRank >= 1 ? 'h-[158px]' : 'h-[165px]'} ${isDefeated ? 'opacity-70' : ''} ${locked && !isLocked ? 'opacity-35 grayscale' : ''} border-3 ${frame} bg-[#1E1E1E] transition-all flex flex-col overflow-hidden group shadow-lg rounded-sm text-left`}
              >
                <div className="flex-1 bg-black relative overflow-hidden">
                  <BossPortrait id={stage.id} />
                  {isLocked && <LockedInMark />}
                  {isDefeated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
                      <div className="text-red-600 text-xs font-black rotate-[-15deg] border-2 border-red-900 px-1 py-0.5 uppercase tracking-tighter bg-black/90 shadow-[0_0_10px_rgba(220,38,38,0.8)] [text-shadow:1px_1px_0_black]">
                        DEAD AS SHIT
                      </div>
                    </div>
                  )}
                  {loc && (
                    <div className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.5 rounded border border-cyan-500/40 text-[7px] font-mono font-bold text-cyan-300 pointer-events-none">
                      {loc.stateCode}
                    </div>
                  )}
                </div>
                <div className={`p-1 flex flex-col items-center justify-center ${isLocked ? 'bg-red-600 text-white' : isSelected ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-white'}`}>
                  <span className="text-[8.5px] font-black uppercase leading-tight text-center truncate w-full">
                    {stage.id}
                  </span>
                  {loc && (
                    <span className={`text-[7px] font-mono uppercase truncate w-full text-center ${isLocked ? 'text-white/85 font-bold' : isSelected ? 'text-black/80 font-bold' : 'text-gray-400'}`}>
                      {loc.city}, {loc.stateCode}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {archive ? (
          <div className="h-[58px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-700 text-zinc-400">
            <span className="text-[9px] font-black tracking-widest text-red-500">CASES CLOSED</span>
            <span className="text-[7px] font-mono tracking-wider">NOTHING LEFT TO KILL. READ THE FILES.</span>
          </div>
        ) : (
          <EngageBar locked={locked} engaging={engaging} onEngage={onEngage} />
        )}
        </div>

        {/* USA map (Alaska and Hawaii included), or the selected boss's dossier */}
        <div className="w-[390px] shrink-0 flex flex-col justify-center gap-1">
          <div className="flex items-center justify-between">
            <div className="flex">
              {(['MAP', 'DOSSIER'] as const).map(tab => {
                const on = (tab === 'DOSSIER') === showDossier;
                return (
                  <button key={tab} onClick={() => { if (!on) onToggleDossier(); }}
                    className={`px-3 py-[3px] text-[8px] font-black tracking-widest border-2 ${on ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'}`}>
                    {tab}
                  </button>
                );
              })}
            </div>
            <span className="text-[7px] font-mono text-cyan-400/80 tracking-wider">(X) / CLICK: SWITCH</span>
          </div>
          {showDossier ? (
            <DossierPanel bossId={selectedId} defeated={deadIds.includes(selectedId)} corpseWeapon={killRecords[selectedId]} />
          ) : (
            <USAMap
              selectedBossId={selectedId}
              defeatedStages={deadIds}
              currentStages={currentStages}
              onSelectStage={(id) => {
                const idx = currentStages.findIndex(s => s.id === id);
                if (idx !== -1) onStageCardClick(idx);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/** Crosshairs and a LOCKED IN stamp over the targeted boss's portrait. */
const LockedInMark: React.FC = () => (
  <div className="absolute inset-0 z-20 pointer-events-none">
    <style>{`
      @keyframes mh-reticle-in { 0% { transform: scale(2.2) rotate(45deg); opacity: 0; } 60% { transform: scale(0.92) rotate(0deg); opacity: 1; } 100% { transform: scale(1); } }
      .mh-reticle { animation: mh-reticle-in 0.22s ease-out; }
      @keyframes mh-stamp-in { 0% { transform: translateX(-50%) rotate(-8deg) scale(3); opacity: 0; } 100% { transform: translateX(-50%) rotate(-8deg) scale(1); opacity: 1; } }
      .mh-stamp { animation: mh-stamp-in 0.16s ease-in forwards; transform: translateX(-50%) rotate(-8deg); }
      @keyframes mh-engage-pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
      .mh-engage-btn { animation: mh-engage-pulse 0.7s ease-in-out infinite; }
    `}</style>
    <div className="absolute inset-0 bg-red-600/15" />
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full mh-reticle">
      <circle cx="50" cy="50" r="30" fill="none" stroke="#EF4444" strokeWidth="2" />
      <circle cx="50" cy="50" r="3" fill="#EF4444" />
      <path d="M50 8 V30 M50 70 V92 M8 50 H30 M70 50 H92" stroke="#EF4444" strokeWidth="2.5" />
      <path d="M4 4 H16 M4 4 V16 M96 4 H84 M96 4 V16 M4 96 H16 M4 96 V84 M96 96 H84 M96 96 V84" stroke="#FACC15" strokeWidth="3" fill="none" />
    </svg>
    <div className="absolute left-1/2 top-[14px] px-1.5 py-[2px] text-[9px] font-black tracking-widest text-white bg-red-600 border-2 border-black whitespace-nowrap shadow-[2px_2px_0_#000] mh-stamp">
      LOCKED IN
    </div>
  </div>
);

/** Below the boss cards: how to lock in, or the big red ENGAGE button once a target is locked. */
const EngageBar: React.FC<{ locked: boolean; engaging: boolean; onEngage: () => void }> = ({ locked, engaging, onEngage }) => {
  if (!locked) {
    return (
      <div className="h-[58px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-700 text-zinc-400">
        <span className="text-[9px] font-black tracking-widest text-yellow-400/90">PICK YOUR VICTIM</span>
        <span className="text-[7px] font-mono tracking-wider">(A) / ENTER / CLICK PORTRAIT: LOCK IN</span>
      </div>
    );
  }
  return (
    <div className="h-[58px] flex flex-col items-stretch gap-1">
      <button onClick={onEngage} disabled={engaging}
        className="relative flex-1 flex items-center justify-center gap-2 text-white text-[15px] font-black italic tracking-[0.2em] border-3 border-black overflow-hidden mh-engage-btn"
        style={{ background: 'linear-gradient(180deg, #F87171 0%, #DC2626 45%, #7F1D1D 100%)', boxShadow: '0 0 0 2px #FACC15, 0 0 18px rgba(239,68,68,0.8), 3px 3px 0 2px #000' }}>
        <span className="absolute inset-y-0 left-0 w-[10px]" style={{ background: 'repeating-linear-gradient(180deg, #FACC15 0 4px, #111 4px 8px)' }} />
        <span className="absolute inset-y-0 right-0 w-[10px]" style={{ background: 'repeating-linear-gradient(180deg, #FACC15 0 4px, #111 4px 8px)' }} />
        <span className="[text-shadow:2px_2px_0_#000]">ENGAGE</span>
        <span className="text-[8px] not-italic tracking-normal px-1 py-[1px] bg-black/70 border border-yellow-400 text-yellow-300">(A) / ENTER</span>
      </button>
      <span className="text-[7px] font-mono tracking-wider text-zinc-400 text-center">(B) / ESC / R-CLICK: BACK OUT</span>
    </div>
  );
};

const ENGAGE_BANDS = ["LET'S FUCKIN' GO!!", 'NO MERCY', 'NO DIGNITY', 'NO QUESTIONS', "IT'S MEAT TIME"];

/**
 * The double-confirm payoff: an arcade attract-mode blast. White flash, strobing
 * background, hazard tape and marquee bands scrolling across, and the big slam-in
 * "LET'S FUCKIN' GO!!" over the target's name.
 */
const EngageFlash: React.FC<{ bossId: string }> = ({ bossId }) => {
  const marquee = (dir: 'l' | 'r', color: string) => (
    <div className="relative w-full overflow-hidden whitespace-nowrap py-[4px] border-y-4 border-black" style={{ background: color }}>
      <div className={`inline-block text-[16px] font-black italic tracking-widest text-black ${dir === 'l' ? 'mh-marquee-l' : 'mh-marquee-r'}`}>
        {Array.from({ length: 4 }, () => ENGAGE_BANDS.join('  ★  ')).join('  ★  ')}
      </div>
    </div>
  );
  const hazard = (dir: 'l' | 'r') => (
    <div className={`h-[16px] w-[200%] ${dir === 'l' ? 'mh-marquee-l' : 'mh-marquee-r'}`}
      style={{ background: 'repeating-linear-gradient(-45deg, #FACC15 0 12px, #111 12px 24px)' }} />
  );
  return (
    <div className="absolute inset-0 z-[60] overflow-hidden mh-engage-strobe">
      <style>{`
        @keyframes mh-strobe { 0%, 8% { background: #fff; } 9%, 25%, 41%, 57% { background: #7F1D1D; } 17%, 33%, 49% { background: #000; } 65%, 100% { background: rgba(10,0,0,0.94); } }
        .mh-engage-strobe { animation: mh-strobe 1.7s steps(1, end) forwards; }
        @keyframes mh-slam { 0% { transform: scale(4) skewX(-12deg); opacity: 0; } 14% { transform: scale(0.9) skewX(-12deg); opacity: 1; } 20% { transform: scale(1.08) skewX(-12deg); } 26%, 100% { transform: scale(1) skewX(-12deg); } }
        @keyframes mh-textflash { 0%, 100% { color: #FDE047; } 33% { color: #FFFFFF; } 66% { color: #EF4444; } }
        .mh-slam { animation: mh-slam 1.7s cubic-bezier(.2,.9,.3,1) forwards, mh-textflash 0.15s steps(1, end) infinite; }
        @keyframes mh-sub { 0%, 26% { transform: translateX(-130%); } 38%, 100% { transform: translateX(0); } }
        .mh-sub { animation: mh-sub 1.7s ease-out forwards; }
        @keyframes mh-mq-l { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes mh-mq-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .mh-marquee-l { animation: mh-mq-l 1.4s linear infinite; }
        .mh-marquee-r { animation: mh-mq-r 1.4s linear infinite; }
        @keyframes mh-bands-in { 0%, 8% { transform: scaleY(0); } 16%, 100% { transform: scaleY(1); } }
        .mh-bands { animation: mh-bands-in 1.7s ease-out forwards; }
        @keyframes mh-blackout { 0%, 86% { opacity: 0; } 100% { opacity: 1; } }
        .mh-blackout { animation: mh-blackout 1.7s linear forwards; }
        @keyframes mh-shake { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-6px, 3px); } 40% { transform: translate(5px, -4px); } 60% { transform: translate(-4px, -2px); } 80% { transform: translate(4px, 4px); } }
        .mh-engage-shake { animation: mh-shake 0.09s linear infinite; }
      `}</style>
      <div className="absolute inset-x-0 top-0 overflow-hidden">{hazard('l')}</div>
      <div className="absolute inset-x-0 bottom-0 overflow-hidden">{hazard('r')}</div>
      <div className="absolute -inset-x-10 top-[74px] -rotate-3 mh-bands">{marquee('l', '#FACC15')}</div>
      <div className="absolute -inset-x-10 bottom-[74px] rotate-3 mh-bands">{marquee('r', '#EF4444')}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <div className="mh-slam text-[48px] leading-[1.15] font-black italic text-center [text-shadow:4px_4px_0_#000,-2px_-2px_0_#000,0_0_24px_rgba(239,68,68,0.9)]">
          LET'S FUCKIN'<br />GO!!
        </div>
        <div className="overflow-hidden">
          <div className="mh-sub px-3 py-1 bg-black border-2 border-red-600 text-[10px] font-black tracking-widest text-white">
            TARGET: <span className="text-red-500">{bossId.toUpperCase()}</span> // WEAPONS FREE
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black pointer-events-none mh-blackout" />
    </div>
  );
};

/**
 * Pause menu. `selectedIndex` walks the weapon grid first, then the three
 * buttons below it (RESUME, BOSS SELECT, QUIT).
 */
const PauseMenu: React.FC<OverlayProps> = ({ availableWeapons, currentWeapon, weaponAmmo, selectedIndex, onWeaponIconClick, onResume, onBossSelect, onQuitToMenu }) => {
  const numWeapons = availableWeapons.length;
  const shown = selectedIndex < numWeapons ? availableWeapons[selectedIndex] : currentWeapon;
  const info = getWeaponInfo(shown);
  const ammoOf = (w: WeaponType) => (MAX_AMMO[w] === Infinity ? null : (weaponAmmo[w] ?? MAX_AMMO[w]) / MAX_AMMO[w]);
  const ammoText = (w: WeaponType) => (MAX_AMMO[w] === Infinity ? 'INFINITE' : `${Math.floor(weaponAmmo[w] ?? MAX_AMMO[w])} / ${MAX_AMMO[w]}`);

  const menuButton = (label: string, glyph: string, index: number, onClick: () => void, face: string, edge: string) => {
    const on = selectedIndex === index;
    return (
      <button
        onClick={onClick}
        className={`relative flex items-center gap-3 pl-8 pr-4 py-[7px] text-white text-[11px] font-black uppercase tracking-wider transition-all ${on ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
        style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}
      >
        {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
        <span className="w-4 text-center">{glyph}</span>{label}
      </button>
    );
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 relative flex flex-col items-center w-[560px] px-6 pt-4 pb-3"
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.97) 100%)',
        border: '3px solid #FACC15',
        boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(250,204,21,0.06)',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)',
      }}>
      {/* Hazard-striped header */}
      <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: 'repeating-linear-gradient(135deg, #FACC15 0 8px, #111 8px 16px)' }} />
      <h2 className="mt-1 text-3xl font-black italic tracking-widest text-yellow-400" style={{ textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' }}>PAUSED</h2>
      <div className="text-[8px] text-red-500 font-black tracking-[0.3em] mb-3">&mdash; RESTING SET &mdash;</div>

      <div className="flex gap-4 w-full items-start">
        {/* The arsenal */}
        <div className="flex flex-col items-center">
          <div className="text-[8px] text-zinc-400 font-black tracking-widest mb-2">ARSENAL</div>
          <div className="grid grid-cols-3 gap-[10px] p-2 bg-black/50 border border-zinc-700">
            {availableWeapons.map((w, i) => (
              <WeaponIcon key={w} type={w} slot={i + 1} ammo={ammoOf(w)} isEquipped={w === currentWeapon} isSelected={selectedIndex === i} onClick={() => onWeaponIconClick(i)} />
            ))}
          </div>
        </div>

        {/* The highlighted weapon, up close */}
        <div className="flex-1 flex flex-col items-center text-center pt-5">
          <div className="w-[104px] h-[104px] flex items-center justify-center mb-2 border-2 border-zinc-700"
            style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.14) 0%, rgba(0,0,0,0.6) 70%)' }}>
            <WeaponArt type={shown} size={88} />
          </div>
          <div className="text-yellow-300 text-[11px] font-black uppercase leading-tight mb-1">{info.name}</div>
          <div className="text-[7px] text-red-500 font-black uppercase tracking-wider mb-2">{shown === currentWeapon ? '[ EQUIPPED ]' :`TAKEN FROM ${info.from.toUpperCase()}`}</div>
          <div className="text-zinc-300 text-[7px] leading-[11px] uppercase font-bold mb-2 min-h-[44px]">&ldquo;{getWeaponDescription(shown)}&rdquo;</div>
          <div className="text-[7px] font-black tracking-wider text-green-400">AMMO: {ammoText(shown)}</div>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {menuButton('RESUME', '▶', numWeapons, onResume, 'linear-gradient(180deg, #CA8A04, #A16207)', '#713F12')}
        {menuButton('BOSS SELECT', '☰', numWeapons + 1, onBossSelect, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A')}
        {menuButton('QUIT', '✖', numWeapons + 2, onQuitToMenu, 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B')}
      </div>
      <div className="mt-3 text-[6px] text-zinc-500 tracking-wider">ESC / START / R-CLICK: RESUME &nbsp;&middot;&nbsp; 1-9 / CLICK / D-PAD: EQUIP</div>
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
