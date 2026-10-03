import React from 'react';
import { useInputDevice, usePadFamily } from './useInputDevice';
import { Prompt } from './ButtonIcons';
import { GameStatus, WeaponType, SoundType } from '../types';
import { MAX_AMMO, WALK_ON_STAGE } from '../constants';
import {
  getStages, getWeaponDescription, BOSS_SET_TITLES, BOSS_LOCATIONS, getWeaponInfo,
} from '../content/roster';
import USAMap from './USAMap';
import BossPortrait from './BossPortrait';
import CorpsePhoto from './CorpsePhoto';
import WeaponIcon, { WeaponArt } from './WeaponIcon';
import DossierPanel from './DossierPanel';
import { DOSSIERS } from '../content/dossiers';
import { GYM_STAGE } from '../game/stages/gym/course';
import { GYM_DOSSIER_ID } from '../content/gymDossier';
import { WHITE_HOUSE_ID } from '../content/whiteHouse';
import { drawWhiteHouse, ART_W, ART_H } from '../game/scenes/ending';
import { GARAGE_ID, SOUVENIRS } from '../content/garage';
import { ownedSouvenirs } from '../game/garage/store';
import MeatheadCaricature from './MeatheadCaricature';
import ControlsGuide from './ControlsGuide';
import { setSoundTest, ALL_CUES } from '../game/music';
import { SFX_NAMES } from '../game/platform/sfx';
import { recordedVoices, playClip } from '../game/platform/voiceclips';
import { playSound } from '../game/platform/audio';

export interface CheatFlags {
  allWeapons: boolean;
  invincible: boolean;
  infiniteAmmo: boolean;
  infinitePower: boolean;
  skipToBoss: boolean;
  /** His pants are shitty, always: from the moment he's in a stage, and straight back that way after every death. */
  shittyPants: boolean;
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
  /** The title's two options: straight in, or the intro first. */
  onStartGame: (withIntro: boolean) => void;
  /** The music switch on the title screen. */
  musicOn?: boolean;
  onToggleMusic?: () => void;
  onResume: () => void;
  onBossSelect: () => void;
  onQuitToMenu: () => void;
  /** Pause menu: the "are you sure" before leaving for the boss select (and which answer's highlighted), and the answer. */
  confirmLeave?: boolean;
  /** What he shouted going in: the flourish slams the same words up. */
  engageShout?: string;
  /** What the "are you sure" is for: the boss select (this stage's progress) or quitting (the whole run). */
  leaveTo?: 'boss' | 'quit';
  confirmYes?: boolean;
  onAnswerLeave?: (yes: boolean) => void;
  /** Pause menu: its DOSSIER up (the file on this stage's boss; in the gym, the one on him), and opening / shutting it. */
  pauseDossier?: boolean;
  onOpenPauseDossier?: () => void;
  onClosePauseDossier?: () => void;
  /** Pause menu: on a ride that only allows the one weapon, the rest show locked. */
  lockedWeapon?: WeaponType;
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
  /** All eight dead: the White House is on the stage select. */
  whiteHouseOpen?: boolean;
  /** How each boss died: the weakness weapon that wrecked his corpse, or null for a plain kill. */
  killRecords: Record<string, WeaponType | null>;
  /** Which of them he killed with his pants full. */
  shatKills?: Record<string, boolean>;
  /** Dev cheat panel on the title screen; omitted when cheats are disabled. */
  cheats?: {
    flags: CheatFlags;
    onToggle: (flag: keyof CheatFlags) => void;
    onChangeRank: (delta: number) => void;
    onPlayEnding: () => void;
    onPlayCall: () => void;
  };
  /** The set's victory is the mid-game call (its own cutscene), not the victory screen. */
  showCall?: boolean;
}

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
        <EngageFlash shout={props.engageShout} bossId={props.lockedIndex === WHITE_HOUSE_INDEX ? WHITE_HOUSE_ID : getStages(props.progressionRank)[props.lockedIndex]?.id || ''} />
      )}
      {status === GameStatus.PAUSED && <PauseMenu {...props} />}
      {status === GameStatus.BOSS_INTRO && <BossIntroScreen {...props} />}
      {status === GameStatus.VICTORY && !props.showCall && <FinalVictoryScreen {...props} />}
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

/** The sound test: every song and arrangement, one after the other. */
const SoundTest: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const [i, setI] = React.useState(-1);
  const go = (d: number) => { if (!enabled) return; const n = (i + d + ALL_CUES.length + 1) % (ALL_CUES.length + 1) - 1; setI(n); setSoundTest(n < 0 ? null : ALL_CUES[n]); };
  React.useEffect(() => () => setSoundTest(null), []);
  // (music switched off: the test's off too, and back to the start)
  React.useEffect(() => { if (!enabled) { setI(-1); setSoundTest(null); } }, [enabled]);
  const c = i >= 0 ? ALL_CUES[i] : null;
  const arrow = `px-2 py-1 font-black text-[10px] ${enabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-900 text-gray-600 cursor-not-allowed'}`;
  return (
    <div className={`flex w-full border-2 border-gray-600 bg-gray-900 shadow-[2px_2px_0px_white] items-center overflow-hidden ${enabled ? '' : 'opacity-50'}`}>
      <button disabled={!enabled} onClick={() => go(-1)} className={arrow}>&lt;</button>
      <div className={`flex-1 text-[6px] leading-[8px] font-black uppercase text-center py-[2px] ${enabled ? 'text-cyan-300' : 'text-gray-500'}`}>{!enabled ? 'MUSIC OFF' : c ? `${c.song}${c.arr && c.arr !== 'main' ? ' / ' + c.arr : ''}` : 'SOUND TEST'}</div>
      <button disabled={!enabled} onClick={() => go(1)} className={arrow}>&gt;</button>
    </div>
  );
};

/** The voice test: step through the cast, click the name to hear another of their lines. */
const VoiceTest: React.FC = () => {
  const [i, setI] = React.useState(-1);
  // (read when it's used: the recordings load in after the page does)
  const cast = () => { const v = recordedVoices(); return { v, names: Object.keys(v).sort() }; };
  const last = React.useRef<ReturnType<typeof playClip>>(null);
  const say = (n: number) => { const { v, names } = cast(); const lines = v[names[n]]; last.current?.stop(); if (lines?.length) last.current = playClip(names[n], lines[Math.floor(Math.random() * lines.length)]); };
  const go = (d: number) => { const { names } = cast(); if (!names.length) return; const n = (i + d + names.length) % names.length; setI(n); say(n); };
  const names = cast().names;
  return (
    <div className="flex w-full border-2 border-gray-600 bg-gray-900 shadow-[2px_2px_0px_white] items-center overflow-hidden">
      <button onClick={() => go(-1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">&lt;</button>
      <button onClick={() => { if (i >= 0) say(i); }} className="flex-1 text-[6px] leading-[8px] font-black text-orange-300 uppercase text-center py-[2px]">{i >= 0 ? names[i] : 'VOICE TEST'}</button>
      <button onClick={() => go(1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">&gt;</button>
    </div>
  );
};

/** The sound effects test: step through them, click the name to hear it again. */
const SfxTest: React.FC = () => {
  const names = SFX_NAMES();
  const [i, setI] = React.useState(-1);
  const go = (d: number) => { const n = (i + d + names.length) % names.length; setI(n); playSound(names[n] as SoundType); };
  return (
    <div className="flex w-full border-2 border-gray-600 bg-gray-900 shadow-[2px_2px_0px_white] items-center overflow-hidden">
      <button onClick={() => go(-1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">&lt;</button>
      <button onClick={() => { if (i >= 0) playSound(names[i] as SoundType); }} className="flex-1 text-[6px] leading-[8px] font-black text-lime-300 uppercase text-center py-[2px]">{i >= 0 ? names[i] : 'SFX TEST'}</button>
      <button onClick={() => go(1)} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">&gt;</button>
    </div>
  );
};

/** The music, sound and voice tests (hidden: flip this to have them back on the title screen's panel). */
const SHOW_SOUND_TESTS = false;

const CheatPanel: React.FC<{ rank: number, cheats: NonNullable<OverlayProps['cheats']>, musicOn: boolean }> = ({ rank, musicOn, cheats: { flags, onToggle, onChangeRank, onPlayEnding, onPlayCall } }) => (
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
    <CheatToggle label="SHITTY PANTS" on={flags.shittyPants} onColor="bg-amber-800" onClick={() => onToggle('shittyPants')} />
    <div className="h-2 w-full" />
    <button onClick={onPlayCall} className="w-full px-2 py-1 border-2 border-gray-600 bg-gray-800 text-yellow-300 font-black text-[7px] uppercase shadow-[2px_2px_0px_white] hover:bg-gray-700">VIEW MID-GAME CALL</button>
    <button onClick={onPlayEnding} className="w-full px-2 py-1 border-2 border-gray-600 bg-gray-800 text-yellow-300 font-black text-[7px] uppercase shadow-[2px_2px_0px_white] hover:bg-gray-700">VIEW FINALE</button>
    {SHOW_SOUND_TESTS && <>
      <div className="h-2 w-full" />
      <SoundTest enabled={musicOn} />
      <SfxTest />
      <VoiceTest />
    </>}
  </div>
);

const TITLE_OPTIONS = [{ label: 'START GAME', intro: false }, { label: 'START GAME + INTRO', intro: true }];

const TitleScreen: React.FC<OverlayProps> = ({ isInputLocked, onStartGame, onSelectIndex, selectedIndex, cheats, progressionRank, whiteHouseOpen, musicOn, onToggleMusic }) => (
  <>
    {cheats && <CheatPanel rank={progressionRank + (whiteHouseOpen ? 1 : 0)} cheats={cheats} musicOn={musicOn !== false} />}
    <div className="animate-in fade-in zoom-in duration-700 max-w-lg relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1">
      <MeatheadCaricature shitty={!!cheats?.flags.shittyPants} />
      <h1 className="text-3xl md:text-4xl text-red-600 mb-3 font-black tracking-tighter drop-shadow-[3px_3px_0px_white] shrink-0">MEATHEAD</h1>
      <div className="flex flex-col items-center gap-2 shrink-0">
        {TITLE_OPTIONS.map((o, i) => {
          const on = selectedIndex === i;
          return (
            <button key={o.label} disabled={isInputLocked} onClick={() => onStartGame(o.intro)} onMouseEnter={() => onSelectIndex(i)}
              className={`relative w-[340px] px-8 py-2 text-white text-sm md:text-base whitespace-nowrap border-b-[5px] transition-all font-black uppercase shrink-0 ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50 cursor-not-allowed' : on ? 'bg-red-600 border-red-900 ring-2 ring-yellow-300 active:translate-y-1 active:border-b-0' : 'bg-red-900/70 border-red-950 text-white/70 hover:bg-red-700'}`}>
              {on && !isInputLocked && <span className="absolute left-3 text-yellow-300 animate-pulse">&#9654;</span>}
              {isInputLocked && i === 0 ? 'READYING PUMP...' : o.label}
            </button>
          );
        })}
      </div>
      <button onClick={onToggleMusic} className={`mt-2 px-3 py-1 text-[8px] font-black tracking-wider border-2 shrink-0 ${musicOn ? 'text-yellow-300 border-yellow-500/60 bg-black/40 hover:bg-yellow-500/10' : 'text-zinc-500 border-zinc-700 bg-black/40 hover:text-zinc-300'}`}>
        <span className="inline-flex items-center gap-2"><Prompt pad={['X']} kb={['M']} size={14} />{musicOn ? '♪ MUSIC: ON' : '♪ MUSIC: OFF'}</span>
      </button>
      {!isInputLocked && <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="START" size={15} className="mt-1 text-[7px] font-black text-white/70 tracking-wider" />}
      <ControlsGuide />
    </div>
  </>
);

/**
 * The set's title over the stage select (the mid-game call's last card lands on it, so it's shared). Kept on one
 * line: a long one goes down a size.
 */
export const setTitleClass = (title: string) =>
  `${title.length > 20 ? 'text-[17px]' : 'text-xl md:text-2xl'} whitespace-nowrap text-red-600 font-black tracking-widest border-b-4 border-red-900 pb-1 uppercase italic drop-shadow-[0_2px_2px_rgba(153,0,0,0.8)] [text-shadow:2px_2px_0_rgb(0,0,0),_0_4px_0_rgba(153,0,0,0.8),_0_8px_0_rgba(153,0,0,0.4),_2px_12px_2px_rgba(255,0,0,0.5)]`;

const StageSelectScreen: React.FC<OverlayProps> = ({ progressionRank, defeatedStages, selectedIndex, onSelectIndex, showDossier, onToggleDossier, lockedIndex, engaging, onStageCardClick, onEngage, showArchive, onToggleArchive, killRecords, shatKills, whiteHouseOpen }) => {
  // The archive shows the previous set: every one of them already dead
  // (the old targets' files aren't on this screen any more)
  const archive = false;
  void showArchive; void onToggleArchive;
  const garageAt = selectedIndex === GARAGE_INDEX, garageLocked = lockedIndex === GARAGE_INDEX;
  const family = usePadFamily();
  const oneStick = family === 'joycon-l' || family === 'joycon-r';
  const device = useInputDevice();
  const setRank = archive ? progressionRank - 1 : progressionRank;
  const currentStages = getStages(setRank);
  const deadIds = archive ? currentStages.map(s => s.id) : defeatedStages;
  const locked = lockedIndex !== null;
  const whAt = !!whiteHouseOpen && selectedIndex === WHITE_HOUSE_INDEX, whLocked = lockedIndex === WHITE_HOUSE_INDEX;
  const selectedId = garageAt ? GARAGE_ID : whAt ? WHITE_HOUSE_ID : currentStages[selectedIndex]?.id || currentStages[0]?.id;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-start pt-2 pb-1 overflow-hidden select-none ${engaging ? 'mh-engage-shake' : 'animate-in slide-in-from-bottom-8 duration-500'}`}>
      <div className="flex flex-col items-center mb-2 shrink-0">
        <h2 data-set-title className={setTitleClass(whiteHouseOpen ? 'MISSION ACCOMPLISHED' : BOSS_SET_TITLES[setRank] || "THE FOUR ASSHOLES")}>
          {whiteHouseOpen ? 'MISSION ACCOMPLISHED' : BOSS_SET_TITLES[setRank] || "THE FOUR ASSHOLES"}
        </h2>
        <div className="flex items-center gap-3 text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
          <span>{archive ? 'ARCHIVE // PREVIOUSLY TERMINATED TARGETS // CASES CLOSED' : whiteHouseOpen ? 'NOBODY LEFT // WASHINGTON IS WAITING' : 'TARGET SELECTION // UNITED STATES RADAR INFILTRATION'}</span>
        </div>
      </div>

      <div className="w-full max-w-[770px] flex flex-row items-center justify-center gap-4 px-2">
        <div className="w-[330px] shrink-0 flex flex-col gap-3">
        {/* 2x2 boss cards (or, once all eight are dead, the White House in their place) */}
        {whiteHouseOpen && !archive ? (
          <WhiteHouseCard selected={whAt} locked={whLocked} dim={locked && !whLocked} onClick={() => onStageCardClick(WHITE_HOUSE_INDEX)} onHover={() => onSelectIndex(WHITE_HOUSE_INDEX)} />
        ) : (
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
                  {/* (killed with his weakness: the evidence photo of what was left of him, not the mugshot) */}
                  {isDefeated && killRecords[stage.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141210]"><div className="w-full" style={{ transform: 'scale(1.7) translateY(-6%)' }}><CorpsePhoto bossId={stage.id} weapon={killRecords[stage.id]} /></div></div>
                  ) : <BossPortrait id={stage.id} dead={isDefeated} locked={isLocked} />}
                  {isLocked && <LockedInMark />}
                  {isDefeated && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="text-red-600 text-xs font-black rotate-[-15deg] border-2 border-red-900 px-1 py-0.5 uppercase tracking-tighter bg-black/90 shadow-[0_0_10px_rgba(220,38,38,0.8)] [text-shadow:1px_1px_0_black]">
                        {killRecords[stage.id] ? 'EXTREMELY DEAD AS SHIT' : 'DEAD AS SHIT'}
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
        )}
        {archive ? (
          <div className="h-[58px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-700 text-zinc-400">
            <span className="text-[9px] font-black tracking-widest text-red-500">CASES CLOSED</span>
            <span className="text-[7px] font-mono tracking-wider">NOTHING LEFT TO KILL. READ THE FILES.</span>
          </div>
        ) : (
          <>
            <GarageCard selected={garageAt} locked={garageLocked} dim={locked && !garageLocked} onClick={() => onStageCardClick(GARAGE_INDEX)} onHover={() => onSelectIndex(GARAGE_INDEX)} />
            <EngageBar locked={locked} engaging={engaging} onEngage={onEngage} label={garageLocked ? 'GO HOME' : whLocked ? 'GO TO D.C.' : undefined} nobodyLeft={whiteHouseOpen} />
          </>
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
            <span className="inline-flex items-center gap-3">
              {showDossier && <Prompt pad={oneStick ? ['Y'] : ['RSTICK']} mouse="wheel" label={oneStick && device === 'pad' ? 'HOLD + STICK: SCROLL' : 'SCROLL'} size={14} className="text-[7px] font-mono text-cyan-400/80 tracking-wider" />}
              <Prompt pad={['X']} kb={['X']} mouse="left" label="SWITCH" size={14} className="text-[7px] font-mono text-cyan-400/80 tracking-wider" />
            </span>
          </div>
          {showDossier ? (
            <DossierPanel bossId={selectedId} defeated={deadIds.includes(selectedId)} corpseWeapon={killRecords[selectedId]} shat={!!shatKills?.[selectedId]} />
          ) : (
            <USAMap
              selectedBossId={selectedId}
              defeatedStages={deadIds}
              // (nobody left: their towns come off the map, the star on Washington is all there is)
              currentStages={whiteHouseOpen && !archive ? [] : currentStages}
              garage={garageAt}
              onSelectGarage={() => onStageCardClick(GARAGE_INDEX)}
              whiteHouse={whiteHouseOpen}
              whiteHouseSelected={whAt}
              onSelectWhiteHouse={() => onStageCardClick(WHITE_HOUSE_INDEX)}
              onSelectStage={(id) => {
                // (nobody left: the map's just for looking at, the White House is the only way on)
                if (whiteHouseOpen) return;
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
/** Where the garage sits among the targets on the stage select (after the four of them). */
export const GARAGE_INDEX = 4;
/** The White House's place on the stage select (in place of the targets, over the garage), once all eight are dead. */
export const WHITE_HOUSE_INDEX = 5;

/**
 * The White House: once there's nobody left, it takes the targets' place on the stage select, the one thing there is
 * to pick (the garage still under it): the place itself at night, the flag going, the lit windows, painted big, its
 * name and where under it.
 */
const WhiteHouseCard: React.FC<{ selected: boolean; locked: boolean; dim: boolean; onClick: () => void; onHover: () => void }> = ({ selected, locked, dim, onClick, onHover }) => {
  const art = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    let raf = 0, t = 0;
    const tick = () => {
      const c = art.current;
      if (c) { const ctx = c.getContext('2d')!; ctx.imageSmoothingEnabled = false; drawWhiteHouse(ctx, t++); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const frame = locked
    ? 'border-red-500 scale-[1.02] shadow-[0_0_26px_rgba(239,68,68,0.9)] ring-2 ring-red-500/70'
    : selected ? 'border-yellow-400 scale-[1.01] shadow-[0_0_20px_rgba(255,255,0,0.6)] ring-2 ring-yellow-400/50'
    : 'border-yellow-500/70 hover:border-yellow-300';
  return (
    <button onClick={onClick} onMouseEnter={onHover}
      className={`w-full h-[326px] border-3 ${frame} ${dim ? 'opacity-35 grayscale' : ''} bg-[#0B1023] transition-all flex flex-col overflow-hidden shadow-lg rounded-sm text-left`}>
      <div className="relative flex-1 bg-black overflow-hidden">
        <canvas ref={art} width={ART_W} height={ART_H} className="absolute inset-0 w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        {locked && <LockedInMark />}
        <div className="absolute top-1 right-1 bg-black/85 px-1 py-0.5 rounded border border-yellow-500/50 text-[7px] font-mono font-bold text-yellow-300 pointer-events-none">DC</div>
      </div>
      <div className={`py-2 flex flex-col items-center justify-center gap-1 ${locked ? 'bg-red-600 text-white' : selected ? 'bg-yellow-400 text-black' : 'bg-[#111827] text-white'}`}>
        <span className="text-[13px] font-black tracking-wider">★ {WHITE_HOUSE_ID} ★</span>
        <span className={`text-[7px] font-mono font-bold ${selected || locked ? '' : 'text-yellow-300'}`}>WASHINGTON, DC // A MEDAL WAITING</span>
      </div>
    </button>
  );
};

/** Under the targets: the garage (wherever it is), and how full it's got. */
const GarageCard: React.FC<{ selected: boolean; locked: boolean; dim: boolean; onClick: () => void; onHover: () => void }> = ({ selected, locked, dim, onClick, onHover }) => {
  const n = ownedSouvenirs().length;
  const frame = locked ? 'border-red-500 bg-red-600 text-white shadow-[0_0_18px_rgba(239,68,68,0.8)]'
    : selected ? 'border-yellow-400 bg-yellow-400 text-black shadow-[0_0_14px_rgba(255,255,0,0.5)]' : 'border-white/40 bg-zinc-900 text-white hover:border-white/80';
  return (
    <button onClick={onClick} onMouseEnter={onHover}
      className={`h-[30px] -mt-1 w-full flex items-center justify-between px-2 border-3 ${frame} ${dim ? 'opacity-35 grayscale' : ''} transition-all rounded-sm`}>
      <span className="text-[9px] font-black tracking-wider">{GARAGE_ID}</span>
      <span className={`text-[7px] font-mono font-bold ${selected || locked ? '' : 'text-cyan-300'}`}>LOCATION: ??? // SOUVENIRS {n}/{SOUVENIRS.length}</span>
    </button>
  );
};

const EngageBar: React.FC<{ locked: boolean; engaging: boolean; onEngage: () => void; label?: string; nobodyLeft?: boolean }> = ({ locked, engaging, onEngage, label, nobodyLeft }) => {
  if (!locked) {
    return (
      <div className="h-[58px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-zinc-700 text-zinc-400">
        <span className="text-[9px] font-black tracking-widest text-yellow-400/90">{nobodyLeft ? 'NOBODY LEFT TO KILL' : 'PICK YOUR VICTIM'}</span>
        <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="LOCK IN" size={15} className="text-[7px] font-mono tracking-wider" />
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
        <span className="[text-shadow:2px_2px_0_#000]">{label ?? 'ENGAGE'}</span>
        <Prompt pad={['OK']} kb={['ENTER']} size={14} className="not-italic px-1 py-[1px] bg-black/70 border border-yellow-400" />
      </button>
      <Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="BACK OUT" size={14} className="justify-center text-[7px] font-mono tracking-wider text-zinc-400" />
    </div>
  );
};

const ENGAGE_BANDS = ["LET'S FUCKIN' GO!!", 'NO MERCY', 'NO DIGNITY', 'NO QUESTIONS', "IT'S MEAT TIME"];

/**
 * The double-confirm payoff: an arcade attract-mode blast. White flash, strobing
 * background, hazard tape and marquee bands scrolling across, and the big slam-in
 * "LET'S FUCKIN' GO!!" over the target's name.
 */
const EngageFlash: React.FC<{ bossId: string; shout?: string }> = ({ bossId, shout }) => {
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
          {shout ?? "LET'S FUCKIN' GO!!"}
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
 * buttons below it (RESUME, DOSSIER, BOSS SELECT, QUIT). DOSSIER brings up the file on the stage's boss (in the gym,
 * the department's own file on him).
 */
const PauseMenu: React.FC<OverlayProps> = ({ availableWeapons, currentWeapon, weaponAmmo, selectedIndex, onWeaponIconClick, onResume, onBossSelect, onQuitToMenu, confirmLeave, leaveTo, confirmYes, onAnswerLeave, lockedWeapon, stageId, pauseDossier, onOpenPauseDossier, onClosePauseDossier }) => {
  const isLocked = (w: WeaponType) => !!lockedWeapon && w !== lockedWeapon;
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
        className={`relative flex items-center gap-2 pl-6 pr-3 py-[7px] text-white text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${on ? 'translate-x-1' : 'opacity-85 hover:opacity-100'}`}
        style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}
      >
        {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}
        <span className="w-4 text-center">{glyph}</span>{label}
      </button>
    );
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200 relative flex flex-col items-center w-[600px] px-6 pt-4 pb-3"
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.97) 100%)',
        border: '3px solid #FACC15',
        boxShadow: '0 0 0 3px #000, 0 0 40px rgba(0,0,0,0.9), inset 0 0 30px rgba(250,204,21,0.06)',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)',
      }}>
      {/* Hazard-striped header */}
      <div className="absolute left-0 right-0 top-0 h-[6px]" style={{ background: 'repeating-linear-gradient(135deg, #FACC15 0 8px, #111 8px 16px)' }} />
      <h2 className="mt-1 mb-3 text-3xl font-black italic tracking-widest text-yellow-400" style={{ textShadow: '3px 3px 0 #7F1D1D, 5px 5px 0 #000' }}>PAUSED</h2>

      <div className="flex gap-4 w-full items-start">
        {/* The arsenal */}
        <div className="flex flex-col items-center">
          <div className="text-[8px] text-zinc-400 font-black tracking-widest mb-2">ARSENAL</div>
          <div className="grid grid-cols-3 gap-[10px] p-2 bg-black/50 border border-zinc-700">
            {availableWeapons.map((w, i) => (
              <WeaponIcon key={w} type={w} slot={i + 1} ammo={ammoOf(w)} isEquipped={w === currentWeapon} isSelected={selectedIndex === i} locked={isLocked(w)} onClick={() => { if (!isLocked(w)) onWeaponIconClick(i); }} />
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
          <div className="text-[7px] text-red-500 font-black uppercase tracking-wider mb-2">{isLocked(shown) ? '[ LOCKED: HANDS FULL ]' : shown === currentWeapon ? '[ EQUIPPED ]' :`TAKEN FROM ${info.from.toUpperCase()}`}</div>
          <div className="text-zinc-300 text-[7px] leading-[11px] uppercase font-bold mb-2 min-h-[66px]">&ldquo;{getWeaponDescription(shown)}&rdquo;</div>
          <div className="text-[7px] font-black tracking-wider text-green-400">AMMO: {ammoText(shown)}</div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {menuButton('RESUME', '▶', numWeapons, onResume, 'linear-gradient(180deg, #CA8A04, #A16207)', '#713F12')}
        {menuButton('DOSSIER', '▤', numWeapons + 1, () => onOpenPauseDossier?.(), 'linear-gradient(180deg, #A16207, #713F12)', '#422006')}
        {menuButton('BOSS SELECT', '☰', numWeapons + 2, onBossSelect, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A')}
        {menuButton('QUIT', '✖', numWeapons + 3, onQuitToMenu, 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B')}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[6px] text-zinc-500 tracking-wider">
        <Prompt pad={['START', 'BACK']} kb={['ESC']} mouse="right" label="RESUME" size={15} />
        <Prompt pad={['DPAD', 'OK']} kb={['1-9']} mouse="left" label="EQUIP" size={15} />
      </div>

      {/* The file on him: this stage's boss (the briefing); in the gym, the department's own, on Meathead; on the walk out to
          the medal, the summons */}
      {pauseDossier && stageId && (stageId === GYM_STAGE || stageId === WALK_ON_STAGE || DOSSIERS[stageId]) && (
        // (over the whole screen, not just the menu: `fixed` here is the game's own 800x600, which is scaled)
        <div className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-black/85 animate-in fade-in duration-150">
          <div className="w-[640px] h-[520px]">
            <DossierPanel bossId={stageId === GYM_STAGE ? GYM_DOSSIER_ID : stageId === WALK_ON_STAGE ? WHITE_HOUSE_ID : stageId} defeated={false} />
          </div>
          <div className="mt-2 flex items-center gap-4 text-[6px] text-zinc-400 tracking-wider">
            <button onClick={() => onClosePauseDossier?.()} className="contents"><Prompt pad={['BACK']} kb={['ESC']} mouse="right" label="CLOSE" size={15} /></button>
          </div>
        </div>
      )}

      {/* Leaving for the boss select, or quitting: are you sure? */}
      {confirmLeave && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 animate-in fade-in duration-150">
          <div className="flex flex-col items-center px-8 py-5" style={{ background: 'linear-gradient(180deg, #27272A, #09090B)', border: '3px solid #EF4444', boxShadow: '0 0 0 3px #000, 0 0 30px rgba(239,68,68,0.35)' }}>
            <div className="text-yellow-400 text-[15px] font-black italic tracking-widest mb-2" style={{ textShadow: '2px 2px 0 #7F1D1D' }}>ARE YOU SURE?</div>
            <div className="text-zinc-300 text-[8px] font-black uppercase tracking-wider mb-4">{leaveTo === 'quit' ? "YOU'LL LOSE ALL YOUR PROGRESS: EVERY BOSS, EVERY WEAPON" : "YOU'LL LOSE YOUR PROGRESS ON THIS STAGE"}</div>
            <div className="flex gap-4">
              {([['YES', true, 'linear-gradient(180deg, #B91C1C, #7F1D1D)', '#450A0A'], ['NO', false, 'linear-gradient(180deg, #52525B, #3F3F46)', '#18181B']] as const).map(([label, yes, face, edge]) => {
                const on = !!confirmYes === yes;
                return (
                  <button key={label} onClick={() => onAnswerLeave?.(yes)}
                    className={`relative pl-8 pr-5 py-[7px] text-white text-[11px] font-black tracking-wider transition-all ${on ? 'translate-y-[-1px]' : 'opacity-80 hover:opacity-100'}`}
                    style={{ background: face, borderBottom: `4px solid ${edge}`, boxShadow: on ? '0 0 12px rgba(250,204,21,0.6), 3px 3px 0 #000' : '3px 3px 0 #000', outline: on ? '2px solid #FACC15' : 'none' }}>
                    {on && <span className="absolute left-2 text-yellow-300 animate-pulse">&#9654;</span>}{label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** What the face-off's fight button says: Meathead's answer to each boss's taunt. */
const FIGHT_BUTTON: Record<string, string> = {
  'Artie Avalanche': 'MELT, YOU FROSTY FUCK',
  'Victor Volcano': 'ERUPT THIS, ASSHOLE',
  'Ernie Earthquake': 'SHAKE THIS, SHITHEAD',
  'Hector Hurricane': 'BLOW ME, WINDBAG',
  'Toxic Tommy': 'EAT SHIT, SLUDGE BOY',
  'Blackout Barry': 'LIGHTS OUT, FUCKFACE',
  'Oily Oscar': 'GET DRILLED, GREASEBALL',
  'Drug Trade Dale': 'JUST SAY FUCK YOU',
};

/**
 * The face-off as you walk into a boss's arena: a hazard-striped warning bar,
 * the boss's live portrait, his name and hometown, and his taunt in a speech
 * bubble, over a slow red scanline pulse.
 */
const BossIntroScreen: React.FC<OverlayProps> = ({ bossTaunt, isInputLocked, onStart, stageId }) => {
  const loc = stageId ? BOSS_LOCATIONS[stageId] : undefined;
  return (
    <div className="relative w-[min(92vw,620px)] select-none mh-intro-in">
      <style>{`
        @keyframes mh-intro-in { 0% { transform: scale(1.25) skewX(-6deg); opacity: 0; } 60% { transform: scale(0.97) skewX(0); opacity: 1; } 100% { transform: scale(1); } }
        .mh-intro-in { animation: mh-intro-in 0.35s ease-out; }
        @keyframes mh-hazard { from { background-position: 0 0; } to { background-position: 40px 0; } }
        .mh-hazard { background: repeating-linear-gradient(-45deg, #FACC15 0 12px, #111 12px 24px); background-size: 40px 100%; animation: mh-hazard 0.6s linear infinite; }
        @keyframes mh-warn-blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.25; } }
        .mh-warn { animation: mh-warn-blink 0.9s steps(1) infinite; }
        @keyframes mh-scan { from { background-position: 0 0; } to { background-position: 0 8px; } }
        .mh-scan { background: repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 4px); animation: mh-scan 0.5s linear infinite; }
        @keyframes mh-glow { 0%, 100% { box-shadow: 0 0 28px rgba(239,68,68,0.45), inset 0 0 40px rgba(127,29,29,0.6); } 50% { box-shadow: 0 0 48px rgba(239,68,68,0.8), inset 0 0 60px rgba(127,29,29,0.9); } }
        .mh-card-glow { animation: mh-glow 1.6s ease-in-out infinite; }
        @keyframes mh-name-in { 0% { transform: translateX(40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .mh-name-in { animation: mh-name-in 0.4s 0.15s ease-out both; }
        @keyframes mh-bubble-in { 0% { transform: scale(0.6); opacity: 0; } 70% { transform: scale(1.04); opacity: 1; } 100% { transform: scale(1); } }
        .mh-bubble-in { animation: mh-bubble-in 0.3s 0.35s ease-out both; transform-origin: 0 50%; }
        @keyframes mh-engage-pulse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
        .mh-engage-btn { animation: mh-engage-pulse 0.7s ease-in-out infinite; }
      `}</style>
      {/* Warning bar */}
      <div className="mh-hazard h-3 border-x-4 border-t-4 border-red-700" />
      <div className="bg-black border-x-4 border-red-700 flex items-center justify-center gap-3 py-1">
        <span className="mh-warn text-red-500 text-[11px] font-black tracking-[0.3em]">WARNING</span>
        <span className="text-white text-[11px] font-black tracking-[0.25em]">TARGET ENGAGED</span>
        <span className="mh-warn text-red-500 text-[11px] font-black tracking-[0.3em]">WARNING</span>
      </div>
      {/* The card */}
      <div className="relative mh-card-glow bg-gradient-to-br from-red-950 via-[#1a0505] to-black border-4 border-red-700 p-4 flex gap-4 items-stretch overflow-hidden">
        <div className="mh-scan absolute inset-0 pointer-events-none" />
        <div className="relative shrink-0 w-[148px] h-[148px] border-[3px] border-red-500 bg-black overflow-hidden shadow-[0_0_18px_rgba(239,68,68,0.6)]">
          {stageId && <BossPortrait id={stageId} />}
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1 tracking-widest">TARGET</div>
        </div>
        <div className="relative flex-1 min-w-0 flex flex-col">
          <div className="mh-name-in pt-1">
            <div className="text-[9px] text-red-400 font-black tracking-[0.3em]">DESIGNATED THREAT</div>
            <h2 className="text-xl md:text-2xl font-black italic uppercase leading-tight text-white [text-shadow:3px_3px_0_#7F1D1D,0_0_12px_rgba(239,68,68,0.6)] -skew-x-6 break-words">{stageId}</h2>
            {loc && <div className="mt-1 text-[9px] font-mono font-bold text-cyan-300 uppercase">{loc.city}, {loc.stateCode}</div>}
          </div>
          {/* His taunt */}
          {/* (never a scrolling box: it's as big as it needs to be, and a long one's set a size smaller) */}
          <div className="mh-bubble-in relative mt-auto mb-auto bg-white text-black border-[3px] border-black px-3 py-2 shadow-[4px_4px_0_#7F1D1D]">
            <div className="absolute -left-[12px] top-4 w-0 h-0 border-y-[8px] border-y-transparent border-r-[12px] border-r-black" />
            <div className="absolute -left-[7px] top-[18px] w-0 h-0 border-y-[6px] border-y-transparent border-r-[9px] border-r-white" />
            <p className={`${bossTaunt.length > 110 ? 'text-[10px] md:text-[11px]' : 'text-[11px] md:text-xs'} font-black uppercase italic leading-snug`}>&ldquo;{bossTaunt}&rdquo;</p>
          </div>
        </div>
      </div>
      <div className="mh-hazard h-3 border-x-4 border-b-4 border-red-700" />
      {/* Fight */}
      <div className="flex justify-center mt-3">
        <button disabled={isInputLocked} onClick={onStart} className={`px-10 py-3 text-lg font-black uppercase italic tracking-wider -skew-x-6 border-4 transition-all ${isInputLocked ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-red-600 hover:bg-red-500 border-black text-white shadow-[5px_5px_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none mh-engage-btn'}`}>
          {isInputLocked ? 'LISTENING...' : (stageId && FIGHT_BUTTON[stageId]) || 'STFU AND DIE'}
          {!isInputLocked && <Prompt pad={['OK']} kb={['ENTER']} size={18} className="ml-3 skew-x-6 align-middle" />}
        </button>
      </div>
    </div>
  );
};

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
      {!isInputLocked && <Prompt pad={['OK']} kb={['ENTER']} size={18} className="ml-3" />}
    </button>
  </div>
);

export default Overlay;
