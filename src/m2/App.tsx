import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { setGlasses } from '../m1/game/render/player/body';
import GameCanvas from '../m1/components/GameCanvas';
import HUD from '../m1/components/HUD';
/** The PWR row's cells, wide (the user's): three of them, fully upgraded, two-thirds of the HUD plate. */
const M2_CELL_W = 54;
import { RAYGUN_ART } from '../m1/components/WeaponIcon';
import { HAIRBALL_ART, HairballSvg } from './cartoon/whitehouse1/HairballArt';
import { Prompt } from '../m1/components/ButtonIcons';
import { GameStatus, WeaponType } from '../m1/types';
import { setGutBlowout, setGutLines, setGutDeathLines } from '../m1/game/player/gut';
import { setFootstepVolume } from '../m1/game/player/footsteps';
import { setHurtScale, setShoveSetDistance, setWallSplatDeath } from '../m1/game/core/resist';
import { setDeathMessageDrawer } from '../m1/game/render/world';
import { drawM2DeathMessage } from './deathText';
import { installCanvasSafety } from './canvasSafety';
import { setDropTable } from '../m1/game/core/effects';
import { M2_GUT_LINES, M2_GUT_DEATH } from './lines/gutLines';
import { createFullAmmo, maxAmmo, INITIAL_PLAYER_HEALTH, enemyMeleeDamage, WHEEL_COOLDOWN_MS } from '../m1/constants';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS, getGamepadMovement, menuButtons } from '../m1/game/platform/gamepad';
import { hasRightStick } from '../m1/game/platform/device';
import WeaponWheel, { wheelIndexAt } from '../m1/components/WeaponWheel';
import PauseMenu from './PauseMenu';
import { portalArrivalPending } from './portalArrival';
import { THEMES, PLAIN_PAUSE } from './hudThemes';
import GoreBag from './GoreBag';
import { M2_WEAPONS, M2WeaponArt, weaponName, registerWeapons, ammoName } from './weapons';
import BulkMeter from './BulkMeter';
import { loadVoicePack } from '../m1/game/platform/voiceclips';
// (its own little pack: just the lines it can say, out of Meathead 1's: tools/voices/m2pack.ts)
import voicePackUrl from './generated/voices.bin?url';
import { registerStageLayout } from '../m1/game/stages/index';
import { hubLayout, HUB_STAGE, setHubStart, setHubExit, hubExitPending } from './hub/index';
import { penLayout, PEN_STAGE } from './pen/index';
import { advLayout, ADV_STAGE, ADV_CHECKPOINTS } from './adventure/index';
import { spookyLayout, SPOOKY_STAGE, SPOOKY_CHECKPOINTS } from './spooky/index';
import { spaceLayout, SPACE_STAGE, SPACE_CHECKPOINTS } from './space/index';
import { hollywoodLayout, HOLLYWOOD_STAGE, HOLLYWOOD_CHECKPOINTS } from './hollywood/index';
import { foreignLayout, FOREIGN_STAGE, FOREIGN_CHECKPOINTS } from './foreign/index';
import { frontierLayout, FRONTIER_STAGE, FRONTIER_CHECKPOINTS } from './frontier/index';
import { fantasyLayout, FANTASY_STAGE, FANTASY_CHECKPOINTS } from './fantasy/index';
import { cartoonLayout, CARTOON_STAGE, CARTOON_CHECKPOINTS } from './cartoon/index';
import { ROCKETS_ON } from './foreign/heli/copter';
import HeliRockets from './foreign/heli/HeliRockets';
import BikeFist from './frontier/dirtbike/BikeFist';
import BroomWand from './fantasy/broom/BroomWand';
import { usePadFamily } from '../m1/components/useInputDevice';
import { SPOTS, LANDS } from './hub/lands';
import { introLayout, INTRO_STAGE, registerIntro, introGender } from './intro/index';
import { setGenderOf, unpaired } from '../m1/content/gender';
import { m2KindGender } from './kinds';
import { KILL_LINES, GENERIC_KILL_LINES, KILL_CALLOUTS, ENEMY_KILL_LINES } from '../m1/content/dialogue';
import { M2_ENEMY_KINDS } from './roster';
import TicketCard from './intro/TicketCard';
import { gymLayout, GYM_STAGE, requestGymSkip } from './intro/gym/index';
import { registerGmen } from './intro/gym/gman';
import GymTips from './intro/gym/GymTips';
import { M2_PUBLIC } from './build';
import { clearSkyCache } from './intro/art/sky';
import { canSkip, requestSkip } from '../m1/game/platform/skip';
import { getAudioContext } from '../m1/game/platform/audio';
import { STAFF_SLOT, AMERICA_SLOT, landAt } from './hub/lands';
import { getUi, subscribeUi, onTravel, setUi, goTo, takeBossKill, setStartCheckpoint, requestCarHop, restoreClearedLands, restoreKept, restoreBossDeaths } from './store';
import TitleScreen from './title/TitleScreen';
import { readFile, deleteFile, playOnFile, saveProgress, closeFile, activeSlot, type Slot } from './save';
import { setFrameHook } from '../m1/game/core/update';
import { isKillCam } from '../m1/game/player/deathAnim';
import { disableM1Music } from '../m1/game/music';
import { setMusicState, setMusicStage, setMusicPaused, setMusicTitle } from './music/cues';

// (Meathead 2's own music: music/cues.ts; Meathead 1's never starts)
disableM1Music();

/** No weapon switching (the wheel, the shoulder buttons, the number keys, the mouse wheel, the pause menu's pick):
 *  stuck with one (the mine cart), or not his to play just now. */
const noSwitching = () => !!getUi().noSwitch || !!getUi().locked;
// (each frame: is the game his to play? Not in a cutscene (the victory walk's one), dying or dead, mid-grab, mid-lever)
setFrameHook(state => {
  const p = state.player;
  setUi({ locked: !!p.inCutscene || state.deathTimer > 0 || p.health <= 0 || !!p.hidden || !!p.leverPull || !!p.freefall || portalArrivalPending(), killCam: isKillCam(state) });
});
import { getCheats, subscribeCheats, availableWeapons, subscribeArsenal, setLiveState, cheatPanelOpen, setCheatPanelOpen, moveCheatCursor, activateCheat } from './cheats';
import { attachM2Keys, mapButton } from './input';
import { setKeyProfile, keysFor } from '../m1/game/platform/keys';
import { setSettingsStore, loadSettings, getSettings, subscribeSettings } from '../m1/game/settings';
import OptionsScreen from '../m1/components/OptionsScreen';
import { useOpenCloseSound } from '../m1/components/useCursorSound';
import { M2_GUIDE_PAGES } from './ControlsGuide';
import { setRayGun } from '../m1/game/combat/rayGun';
// (the hub's portal card, YOU ARE GOING HERE: that land's preview, off the park map's art)
import LandCard from './parkmap/LandCard';
import ParkMap from './parkmap/ParkMap';
import { openParkMap, closeParkMap, parkMapFrom, parkMapBusy, subscribeParkMap } from './parkmap/state';
import { prewarmParkMap } from './parkmap/render';
import CheckpointPicker from '../m1/components/CheckpointPicker';
import ChordPrompt from './ChordPrompt';
import { pauseCard } from './PauseControls';
import QtePanel from './fantasy/wheel/QtePanel';
import IcePanel from './fantasy/bedroom/IcePanel';
import TragonMarks from './fantasy/tragons/TragonMarks';
import { registerKillLines, m2Kill } from './moves/killLines';
import { cleanLines } from './lines/clean';
import { registerGrabCallouts } from './moves/callouts';

// Meathead 2: Meathead Goes to Happy Land. For now: the hub (walk round it, look at the map for each land) and the
// test pen behind the staff door (try out the beatdown and the shakedown on whoever walks in).

// (in Meathead 2, what's thrown up off the top of the screen comes back down: no "TO THE MOON")
for (const l of [hubLayout, penLayout, advLayout, spookyLayout, spaceLayout, hollywoodLayout, foreignLayout, frontierLayout, fantasyLayout, cartoonLayout, introLayout, gymLayout]) l.noMoonKills = true;
// (and the camera glides where it'd jump in the lands: out of a cutscene's view, onto a fight's arena)
advLayout.smoothCameraSnaps = true;
spookyLayout.smoothCameraSnaps = true;
spaceLayout.smoothCameraSnaps = true;
hollywoodLayout.smoothCameraSnaps = true;
foreignLayout.smoothCameraSnaps = true;
frontierLayout.smoothCameraSnaps = true;
fantasyLayout.smoothCameraSnaps = true;
cartoonLayout.smoothCameraSnaps = true;
registerStageLayout(HUB_STAGE, hubLayout);
registerStageLayout(PEN_STAGE, penLayout);
registerStageLayout(ADV_STAGE, advLayout);
registerStageLayout(SPOOKY_STAGE, spookyLayout);
registerStageLayout(SPACE_STAGE, spaceLayout);
registerStageLayout(HOLLYWOOD_STAGE, hollywoodLayout);
registerStageLayout(FOREIGN_STAGE, foreignLayout);
registerStageLayout(FRONTIER_STAGE, frontierLayout);
registerStageLayout(FANTASY_STAGE, fantasyLayout);
registerStageLayout(CARTOON_STAGE, cartoonLayout);
registerStageLayout(INTRO_STAGE, introLayout);
registerStageLayout(GYM_STAGE, gymLayout);
registerIntro();
registerGmen();
loadVoicePack(voicePackUrl);
attachM2Keys();
// (Meathead 2's disguise: the nerd glasses on him everywhere, bar the gym before they're handed him: gym/index.ts)
setGlasses(true);
cleanLines();
// (the options: its own keyboard (the grabs bindable, the left button alone firing to start with, P kept for pausing),
// its own settings, remembered apart from Meathead 1's, put into effect now: the volumes, the shake, the flashing, the keys)
setKeyProfile('m2');
setSettingsStore('meathead2-settings');
loadSettings();
setRayGun(true, m2Kill('raygun_kill'));
registerGrabCallouts();
registerKillLines();
// (he or she, over whoever it was)
// (the animals are its; the people on the way in, who they are)
const ANIMALS = new Set(['pigeon', 'pitbull', 'seagull', 'goat', 'hawk', 'rat', 'wolverine', 'crab']);
setGenderOf(e => m2KindGender(e) ?? (ANIMALS.has(e.kind) ? 'n' : introGender(e)));
// (dev: ?walkaway plays the after-the-boss walk-away screen on its own, walkAway.ts)
if (import.meta.env.DEV && new URLSearchParams(location.search).has('walkaway')) void import('./walkAway').then(m => m.devPreviewWalkAway());
// (dev: ?hub=<spot> starts at the hub, stood at that spot round it: 7 is Adventure Land's portal)
if (import.meta.env.DEV && new URLSearchParams(location.search).get('hub')) setHubStart(+new URLSearchParams(location.search).get('hub')!);
// (dev: ?portal plays the walk into a land (after its portal at the hub) on its own, portalWalk.ts)
if (import.meta.env.DEV && new URLSearchParams(location.search).has('portal')) void import('./portalWalk').then(m => m.devPreviewPortalWalk());
if (import.meta.env.DEV) {
  // (the borrowed Meathead 1 people in the staff room are men, always: their own lines are fine as they are)
  const pools = [...M2_ENEMY_KINDS.filter(k => ANIMALS.has(k)).flatMap(k => ENEMY_KILL_LINES[k] ?? []), ...Object.entries(KILL_LINES).filter(([k]) => !k.startsWith('range_')).flatMap(([, v]) => v), ...GENERIC_KILL_LINES, ...Object.values(KILL_CALLOUTS).flatMap(c => c.lines)] as string[];
  const loose = unpaired(pools);
  if (loose.length) console.warn('Kill lines that say he or she with no line for the other:', loose);
}
// (already shitty, he can do it again: so hard his pants go, and he's naked: game/player/gut.ts)
setGutBlowout(true);
setGutLines(M2_GUT_LINES);
setGutDeathLines(M2_GUT_DEATH);
// (his footsteps, up where they can be heard over everything)
setFootstepVolume(2.4);
// (his shoulder charge, slide, uppercut and dive kick hit about as hard as his throws: far lighter than Meathead 1's)
Object.assign(enemyMeleeDamage, { charge: 14, slide: 14, uppercut: 45, divekick: 45 });
// (everything hits him a good deal softer than in Meathead 1; and enemies hardly ever drop anything, and only small)
setHurtScale(0.65);
// (a shield shove: a set distance, and the shoved man can't hurt him by contact meanwhile)
setShoveSetDistance(true);
setWallSplatDeath(true);
setDropTable({ health: 0.06, ammo: 0.05 });
registerWeapons();
// (no arc or ellipse with a radius gone below zero ever throws away the rest of a frame)
installCanvasSafety();
// (the death message: the letters drop in, and bleed)
setDeathMessageDrawer(drawM2DeathMessage);

/** What he can pick from: what he's got this playthrough, or every weapon (the cheat): cheats.ts. */
const arsenal = availableWeapons;
/** The weapons' pictures while he's the cat: the ray gun's the hairball. */
const CatWeaponArt: React.FC<{ type: WeaponType; size: number }> = ({ type, size }) => (type === 'GUN' ? <HairballSvg size={size} /> : <M2WeaponArt type={type} size={size} />);
const STARTING_AMMO = createFullAmmo();
/** In the staff room (the practice pen) he can't be hurt (no flicker for it: it's how the room is) and nothing runs out of ammo; everywhere else he can, and it does (bar the cheats: cheats.ts). */
const PRACTICE = { invincible: true, infiniteAmmo: true, infinitePower: false, skipToBoss: false };
const PLAY = { ...PRACTICE, invincible: false, infiniteAmmo: false };
const noop = () => {};
/** The lands that are built: each one's stage, by its lands.ts id, and every checkpoint in it (the checkpoint-skip cheat). */
const LAND_STAGES: Record<string, { stage: string; checkpoints: { name: string; cp: number }[] }> = {
  adventure: { stage: ADV_STAGE, checkpoints: ADV_CHECKPOINTS },
  spooky: { stage: SPOOKY_STAGE, checkpoints: SPOOKY_CHECKPOINTS },
  space: { stage: SPACE_STAGE, checkpoints: SPACE_CHECKPOINTS },
  hollywood: { stage: HOLLYWOOD_STAGE, checkpoints: HOLLYWOOD_CHECKPOINTS },
  foreign: { stage: FOREIGN_STAGE, checkpoints: FOREIGN_CHECKPOINTS },
  frontier: { stage: FRONTIER_STAGE, checkpoints: FRONTIER_CHECKPOINTS },
  fantasy: { stage: FANTASY_STAGE, checkpoints: FANTASY_CHECKPOINTS },
  cartoon: { stage: CARTOON_STAGE, checkpoints: CARTOON_CHECKPOINTS },
};
const landOfStage = (stage: string) => Object.keys(LAND_STAGES).find(id => LAND_STAGES[id].stage === stage) ?? null;

/** Scaled up to fill the window (the options' STRETCH), or by whole steps only (SHARP), as Meathead 1's is. */
const useFitToWindow = () => {
  const scaling = useSyncExternalStore(subscribeSettings, () => getSettings().scaling, () => getSettings().scaling);
  const fit = () => {
    const f = Math.max(0.5, Math.min(window.innerWidth / 808, window.innerHeight / 608));
    return getSettings().scaling === 'sharp' && f >= 1 ? Math.floor(f) : f;
  };
  const [scale, setScale] = useState(fit);
  useEffect(() => { const on = () => setScale(fit()); on(); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, [scaling]);
  return scale;
};

const App2: React.FC = () => {
  const scale = useFitToWindow();
  const ui = useSyncExternalStore(subscribeUi, getUi);
  // (the broomstick's boost and brake swap on a Nintendo pad: the user's)
  const padFam = usePadFamily(), joyPad = padFam === 'joycon-l' || padFam === 'joycon-r', ninPad = padFam === 'switch' || joyPad;
  // (it starts on the way in: the intro; in dev, ?adv=<checkpoint> starts in Adventure Land, ?spooky=<checkpoint> in
  // Spooky Land, ?space=<checkpoint> in Space Land, ?hollywood=<checkpoint> in Hollywood Land, ?foreign=<checkpoint> in
  // Foreign Lands, ?hub=<spot> at the hub, ?pen in the staff room)
  const devQ = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
  const first = devQ?.has('adv') ? ADV_STAGE : devQ?.has('spooky') ? SPOOKY_STAGE : devQ?.has('space') ? SPACE_STAGE : devQ?.has('hollywood') ? HOLLYWOOD_STAGE : devQ?.has('foreign') ? FOREIGN_STAGE : devQ?.has('frontier') ? FRONTIER_STAGE : devQ?.has('fantasy') ? FANTASY_STAGE : devQ?.has('cartoon') ? CARTOON_STAGE :devQ?.has('hub') ? HUB_STAGE : devQ?.has('pen') ? PEN_STAGE : devQ?.has('intro') ? INTRO_STAGE : GYM_STAGE;
  const [stage, setStage] = useState(first);
  // (the glasses: on everywhere but the gym, which hands them to him in its closing)
  useEffect(() => { if (stage !== GYM_STAGE) setGlasses(true); }, [stage]);
  const [status, setStatus] = useState(GameStatus.START);
  // The title screen first (title/TitleScreen.tsx): nothing's built behind it till START GAME (the way in, as ever) or
  // CONTINUE (the hub, a file's lands put back). (In dev, a ?stage to start in skips it.)
  // (a new game starts in his gym: the Iron Pit, intro/gym; ?gym in dev: straight into it, no title; ?intro: straight
  // into the way in after it)
  const [title, setTitle] = useState(first === GYM_STAGE && !devQ?.has('gym'));
  useEffect(() => { setMusicTitle(title); }, [title]);
  const startNew = (slot: Slot | null) => {
    if (slot !== null && readFile(slot)) deleteFile(slot);
    playOnFile(slot);
    setTitle(false);
  };
  const continueFile = (slot: Slot) => {
    const f = readFile(slot);
    if (!f) return;
    restoreClearedLands(f.cleared);
    restoreKept(f.kept);
    restoreBossDeaths(f.deaths);
    playOnFile(slot, f.playTimeMs);
    // (onto the hub, where Meathead 1's goes onto the map: in off America USA's street)
    setHubStart(AMERICA_SLOT);
    pending.current = HUB_STAGE;
    setTitle(false);
  };
  /** QUIT, from the pause menu (asked first): the file keeps what it had at the last safe point, just the time played
   *  goes on it; and back to the title, everything as it was when the page opened. */
  const quitToTitle = () => { closeFile(); location.reload(); };
  // (the music follows where he is, and goes muffled while it's paused)
  useEffect(() => { setMusicStage(stage); }, [stage]);
  useEffect(() => { setMusicPaused(status === GameStatus.PAUSED); }, [status]);
  const pending = useRef<string | null>(first);
  const [fade, setFade] = useState(false);
  const [weapon, setWeapon] = useState<WeaponType>('GUN');
  const [hud, setHud] = useState({ health: INITIAL_PLAYER_HEALTH, power: 0, ammo: STARTING_AMMO as Record<WeaponType, number> });
  const ammoRef = useRef(hud.ammo);
  const [initialAmmo, setInitialAmmo] = useState(STARTING_AMMO as Record<WeaponType, number>);
  // (what he can pick from, and the cheats: the arsenal shrinks back to what he's got when ALL WEAPONS goes off, and
  // if he's holding one he hasn't got, it's the ray gun)
  const owned = useSyncExternalStore(subscribeArsenal, availableWeapons);
  const cheat = useSyncExternalStore(subscribeCheats, getCheats);
  useEffect(() => {
    if (!owned.includes(weapon)) setWeapon('GUN');
    setPauseSel(i => (i < owned.length ? i : Math.max(0, owned.indexOf(owned.includes(weapon) ? weapon : 'GUN'))));
  }, [owned]);

  // Off to a stage: through black, the stage cleared, then built
  useEffect(() => {
    if (title || status !== GameStatus.START || !pending.current) return;
    const id = pending.current;
    pending.current = null;
    setStage(id);
    setStatus(GameStatus.LEVEL_INTRO);
    setTimeout(() => setFade(false), 120);
  }, [status, title]);
  // (saved at the safe points, as Meathead 1's is: onto the hub here, and a land cleared (save.ts); never mid-land)
  useEffect(() => { if (!title && stage === HUB_STAGE) saveProgress(); }, [stage, title]);
  useEffect(() => {
    onTravel(dest => {
      // ('intro': the way in again, from the parking lot: Wilderness Land's walk back after Tucker, store.ts setWalkBack)
      const to = dest === 'pen' ? PEN_STAGE : dest === 'hub' ? HUB_STAGE : dest === 'intro' ? INTRO_STAGE : dest === 'gym' ? GYM_STAGE : LAND_STAGES[dest]?.stage ?? null;
      if (!to) return;
      clearSkyCache();
      // (back at the hub where he left it: the staff door, the land's portal, or America USA's way in)
      const landSlot = (id: string) => SPOTS.findIndex(s => s.kind === 'land' && LANDS[s.land].id === id);
      const from = landOfStage(stage);
      if (to === HUB_STAGE) setHubStart(stage === PEN_STAGE ? STAFF_SLOT : from ? landSlot(from) : AMERICA_SLOT);
      // (back from a land, its boss beaten or BACK TO HUB: out of its portal he comes; not from the break room or the way in)
      setHubExit(to === HUB_STAGE && stage !== PEN_STAGE && !!from);
      // (through a portal: no HUD from here till the land's opened on him, not a frame of it as it loads)
      setUi({ gymTip: null, introTip: null, introPrompt: null, introAhead: null, introTicket: null, introCutscene: dest === 'intro' || portalArrivalPending() || hubExitPending() });
      setUi({ near: null, map: null, nearExit: false, nearAmerica: false, noSwitch: false, pauseControls: null, heliHud: false, bikeHud: false, bikeTips: false, carHops: false, tragonTips: false, tragonHold: null, tragonMarks: null, broomHud: false, broomTips: false, iceMash: null });
      setFade(true);
      // (into a land, everything's topped up; and back at the hub after a boss: elsewhere, what he had)
      // (the walk back after a boss: topped up there, and the boss's top-up used up on it)
      const refill = (dest === 'intro' && (takeBossKill() || true)) || (dest !== 'hub' && dest !== 'pen') || (to === HUB_STAGE && takeBossKill());
      setTimeout(() => { pending.current = to; setInitialAmmo(refill ? createFullAmmo() : { ...ammoRef.current }); setStatus(GameStatus.START); }, 260);
    });
  }, [stage]);

  // Pausing (START, or ESC), and the pause menu: which of it's picked out (a weapon, or RESUME after them)
  const [pauseSel, setPauseSel] = useState(0);
  /** The weapon wheel (the right stick): which one it's pointing at, while it's up. */
  const [wheelAt, setWheelAt] = useState<number | null>(null);
  const live = useRef({ status, weapon, stage });
  live.current = { status, weapon, stage };
  /** (after RESUME: SKIP INTRO in the intro; BACK TO HUB out in a land, or the break room) */
  const canHub = () => !!landOfStage(live.current.stage) || live.current.stage === PEN_STAGE;
  /** (the cheats build only: SKIP STAGE in the gym, to its closing cutscene) */
  const canGymSkip = () => live.current.stage === GYM_STAGE && !M2_PUBLIC;
  const skipGym = () => { setStatus(GameStatus.PLAYING); requestGymSkip(); };
  /** (RESUME, MAP, OPTIONS, then SKIP INTRO / BACK TO HUB where there's one) */
  /** (the cheats build only, the user's: SKIP INTRO / SKIP TO HUB in America USA) */
  const canIntroSkip = () => live.current.stage === INTRO_STAGE && !M2_PUBLIC;
  const lastPause = () => (canIntroSkip() || canGymSkip() || canHub() ? arsenal().length + 4 : arsenal().length + 3);
  /** (QUIT, to the title: the last of the buttons) */
  const quitIndex = () => lastPause();
  /** The options screen (OPTIONS in the pause menu): while it's up, it takes every key and button; and a moment after
   *  it's shut (the press that shut it isn't one for the pause menu too). */
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef({ open: false, shutAt: 0 });
  const openOptions = () => { optionsRef.current.open = true; setOptionsOpen(true); };
  const closeOptions = () => { optionsRef.current = { open: false, shutAt: performance.now() }; setOptionsOpen(false); };
  const inOptions = () => optionsRef.current.open || performance.now() - optionsRef.current.shutAt < 150;
  useOpenCloseSound(optionsOpen);
  useEffect(() => { if (status !== GameStatus.PAUSED && optionsRef.current.open) closeOptions(); }, [status]);
  const skipIntro = () => { setStatus(GameStatus.PLAYING); goTo('hub'); };
  /** BACK TO HUB, asked first: ARE YOU SURE? (null: not asking; 0 NO, 1 YES picked out, NO to start with) */
  const [hubAsk, setHubAsk] = useState<0 | 1 | null>(null);
  const hubAskRef = useRef(hubAsk);
  hubAskRef.current = hubAsk;
  /** Which question that is: BACK TO HUB, or QUIT (to the title). */
  const [asking, setAsking] = useState<'hub' | 'quit'>('hub');
  const askingRef = useRef(asking);
  askingRef.current = asking;
  const askHub = () => { setAsking('hub'); setHubAsk(0); };
  const askQuit = () => { setAsking('quit'); setHubAsk(0); };
  const answerHub = (yes: boolean) => { setHubAsk(null); if (!yes) return; if (askingRef.current === 'quit') { quitToTitle(); return; } setStatus(GameStatus.PLAYING); goTo('hub'); };
  /** The park map (parkmap/): SELECT on a pad, the map keys (TAB, M), MAP in the pause menu. Out of play it pauses the
   *  game and shutting it plays on; out of the pause menu, shutting it goes back to the menu. Never in a cutscene, or
   *  over the hub's portal card. */
  const mapFrom = useSyncExternalStore(subscribeParkMap, parkMapFrom);
  const openMap = () => {
    const st = live.current.status, u = getUi();
    if (st === GameStatus.PLAYING) {
      if (canSkip() || u.introCutscene || u.locked || u.map !== null || u.introTicket || u.pick) return;
      openParkMap('play'); setStatus(GameStatus.PAUSED);
    } else if (st === GameStatus.PAUSED && hubAskRef.current === null && !cheatPanelOpen()) openParkMap('pause');
  };
  const closeMap = () => { const from = parkMapFrom(); closeParkMap(); if (from === 'play' && live.current.status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING); };
  useEffect(() => { if (status !== GameStatus.PAUSED && parkMapFrom()) closeParkMap(); }, [status]);
  useOpenCloseSound(!!mapFrom);
  // (the map's painted ahead, in a quiet moment once the game's under way: it comes up at once)
  useEffect(() => { if (!title) { const id = setTimeout(prewarmParkMap, 4000); return () => clearTimeout(id); } }, [title]);
  const togglePause = () => {
    const st = live.current.status;
    // (a scene that can be skipped: START / ESC skips it, rather than pausing)
    if (st === GameStatus.PLAYING && canSkip()) { requestSkip(); return; }
    if (st === GameStatus.PLAYING) { setPauseSel(noSwitching() ? arsenal().length : Math.max(0, arsenal().indexOf(live.current.weapon))); setStatus(GameStatus.PAUSED); }
    else if (st === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };
  const resume = () => { if (live.current.status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING); };
  // (stuck with what he's got, for now: the mine cart)
  const equip = (i: number) => { if (arsenal()[i] && !noSwitching()) setWeapon(arsenal()[i]); };
  /** In the pause menu: the arsenal's a grid three across, RESUME under it. */
  const movePause = (dx: number, dy: number) => setPauseSel(i => {
    const n = arsenal().length;
    // (a controls card up in place of the weapons: just the buttons along the bottom, left and right)
    if (getUi().noSwitch && getUi().pauseControls) { if (i < n) return n; if (dx > 0) return Math.min(lastPause(), i + 1); if (dx < 0 && i > n) return i - 1; return i; }
    if (i >= n) { if (dx > 0) return Math.min(lastPause(), i + 1); if (dx < 0 && i > n) return i - 1; return dy < 0 ? Math.min(n - 1, Math.floor((n - 1) / 3) * 3) : i; }
    if (dy > 0) return i + 3 < n ? i + 3 : n;
    if (dy < 0) return i - 3 >= 0 ? i - 3 : i;
    return Math.max(0, Math.min(n - 1, i + dx));
  });
  const pauseSelRef = useRef(pauseSel);
  pauseSelRef.current = pauseSel;
  const confirmPause = () => {
    const i = pauseSelRef.current, n = arsenal().length;
    if (i === quitIndex()) askQuit(); else if (i === n + 3) { if (canHub()) askHub(); else if (canGymSkip()) skipGym(); else if (canIntroSkip()) skipIntro(); } else if (i === n + 2) openOptions(); else if (i === n + 1) openMap(); else if (i >= n) resume(); else equip(i);
  };

  // Weapons: the shoulder buttons, the right stick's wheel, the number keys, the mouse wheel; START or ESC pauses
  useEffect(() => {
    const cycle = (d: number) => { if (!noSwitching()) setWeapon(w => arsenal()[(arsenal().indexOf(w) + d + arsenal().length) % arsenal().length]); };
    const playing = () => live.current.status === GameStatus.PLAYING, paused = () => live.current.status === GameStatus.PAUSED;
    // (the mouse wheel: one weapon a notch, and a short cooldown after each, so a flick doesn't spin past three of them)
    let wheelAt = 0;
    const onWheel = (e: WheelEvent) => {
      if (!(playing() || paused()) || (paused() && cheatPanelOpen()) || inOptions() || parkMapBusy() || Math.abs(e.deltaY) < 1) return;
      const now = performance.now();
      if (now - wheelAt < WHEEL_COOLDOWN_MS) return;
      // (whatever the notch is bound to: the weapon cycling, or nothing)
      const code = e.deltaY > 0 ? 'wheeldown' : 'wheelup';
      const d = keysFor('prevWeapon').includes(code) ? -1 : keysFor('nextWeapon').includes(code) ? 1 : 0;
      if (!d) return;
      wheelAt = now;
      bump(d);
    };
    /** The previous / next weapon buttons (the wheel's notches, keys, mouse buttons, wherever they're bound); on
     *  Truelling Tragons, they hop him between cars: previous the car above, next the one below. */
    const bump = (d: number) => {
      if (getUi().carHops) { if (playing()) requestCarHop(d > 0 ? 'down' : 'up'); return; }
      cycle(d);
    };
    const bumpCode = (code: string) => {
      if (!(playing() || paused()) || (paused() && cheatPanelOpen()) || inOptions() || parkMapBusy()) return false;
      const d = keysFor('prevWeapon').includes(code) ? -1 : keysFor('nextWeapon').includes(code) ? 1 : 0;
      if (d) bump(d);
      return !!d;
    };
    // (a right-click that backed out of the options screen: its context menu, on the release, isn't one for the pause menu)
    let rightFromOptions = false;
    const onMouseDown = (e: MouseEvent) => { if (e.button === 2) rightFromOptions = inOptions(); bumpCode(`mouse${e.button}`); };
    window.addEventListener('mousedown', onMouseDown);
    const onKey = (e: KeyboardEvent) => {
      // (the first key lets the sound out: the browser holds it back till then)
      getAudioContext();
      if (e.repeat) return;
      // (the options screen up, or the park map: they take the keys themselves)
      if (inOptions() || parkMapBusy()) return;
      if (bumpCode(e.code.toLowerCase())) return;
      // (the park map's keys: TAB and M to start with; TAB never moves the browser's focus)
      if (keysFor('map').includes(e.code.toLowerCase())) { e.preventDefault(); if (!(paused() && hubAskRef.current !== null)) openMap(); return; }
      // (the cheat panel up: the pause menu behind it doesn't move, nor does the game unpause, till it's shut)
      if (paused() && cheatPanelOpen()) { if (e.code === 'Escape') setCheatPanelOpen(false); return; }
      // (ARE YOU SURE? up: left/right between NO and YES, ENTER answers, ESC is no)
      if (paused() && hubAskRef.current !== null) {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') setHubAsk(a => (a === 1 ? 0 : 1));
        else if (e.code === 'Enter' || e.code === 'Space') answerHub(hubAskRef.current === 1);
        else if (e.code === 'Escape' || e.code === 'Backspace') setHubAsk(null);
        return;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') { togglePause(); return; }
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && (playing() || paused())) { const i = +digit[1] - 1; equip(i); if (paused() && i < arsenal().length && !noSwitching()) setPauseSel(i); return; }
      if (!paused()) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') movePause(-1, 0);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') movePause(1, 0);
      else if (e.code === 'ArrowUp' || e.code === 'KeyW') movePause(0, -1);
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') movePause(0, 1);
      else if (e.code === 'Enter' || e.code === 'Space') confirmPause();
    };
    // (right-click in the pause menu: back out of it)
    const onContext = (e: MouseEvent) => { if (paused()) { e.preventDefault(); if (parkMapBusy()) return; if (inOptions() || rightFromOptions) { rightFromOptions = false; return; } if (hubAskRef.current !== null) setHubAsk(null); else if (!cheatPanelOpen()) resume(); } };
    window.addEventListener('wheel', onWheel);
    window.addEventListener('keydown', onKey);
    window.addEventListener('contextmenu', onContext);
    // (a click lets the sound out too)
    const onPointer = () => { getAudioContext(); };
    window.addEventListener('pointerdown', onPointer);
    let id = 0, lastMove = 0;
    const prev = { lb: false, rb: false, start: false, select: false, ok: false, back: false, x: false };
    const wheel: { at: number | null } = { at: null };
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = performance.now();
        // (SELECT: the park map; START pauses)
        const btn = { lb: isButtonPressed(gp, GP_BUTTONS.LB), rb: isButtonPressed(gp, GP_BUTTONS.RB), start: isButtonPressed(gp, GP_BUTTONS.START), select: mapButton(gp), ok: isButtonPressed(gp, menuButtons(gp).ok), back: isButtonPressed(gp, menuButtons(gp).back), x: isButtonPressed(gp, GP_BUTTONS.X) };
        const pressed = (k: keyof typeof btn) => btn[k] && !prev[k];
        // The options screen up, or the park map: they read the pad themselves (what's held as they shut isn't a press
        // here either)
        if (inOptions() || parkMapBusy()) {
          Object.assign(prev, btn);
          id = requestAnimationFrame(poll);
          return;
        }
        // The cheat panel (X in the pause menu): its own cursor; backing out of it is back to the weapon select
        if (paused() && cheatPanelOpen()) {
          const m = getGamepadMovement(gp, 0.25);
          const dx = m.left ? -1 : m.right ? 1 : 0, dy = m.up ? -1 : m.down ? 1 : 0;
          if ((dx || dy) && now - lastMove > 180) { moveCheatCursor(dx, dy); lastMove = now; }
          if (!dx && !dy) lastMove = 0;
          if (pressed('ok')) activateCheat();
          if (pressed('back') || pressed('x') || pressed('start')) setCheatPanelOpen(false);
          Object.assign(prev, btn);
          id = requestAnimationFrame(poll);
          return;
        }
        // ARE YOU SURE? (back to the hub): left/right, OK answers, BACK (or START) is no
        if (paused() && hubAskRef.current !== null) {
          const m = getGamepadMovement(gp, 0.25);
          if ((m.left || m.right) && now - lastMove > 180) { setHubAsk(a => (a === 1 ? 0 : 1)); lastMove = now; }
          if (!m.left && !m.right) lastMove = 0;
          if (pressed('ok')) answerHub(hubAskRef.current === 1);
          if (pressed('back') || pressed('start')) setHubAsk(null);
          Object.assign(prev, btn);
          id = requestAnimationFrame(poll);
          return;
        }
        if (paused() && pressed('x')) { setCheatPanelOpen(true); Object.assign(prev, btn); id = requestAnimationFrame(poll); return; }
        const just = pressed;
        // (Truelling Tragons: RB the car above, LB the car below)
        if (playing() && getUi().carHops) { if (just('lb')) requestCarHop('down'); if (just('rb')) requestCarHop('up'); }
        else {
          if ((playing() || paused()) && just('lb')) cycle(-1);
          if ((playing() || paused()) && just('rb')) cycle(1);
        }
        if (just('start')) togglePause();
        // (SELECT: the park map; in a scene that can be skipped it skips it, as it always has)
        if (just('select')) { if (playing() && canSkip()) requestSkip(); else openMap(); }
        if (paused() && !parkMapFrom()) {
          const m = getGamepadMovement(gp, 0.25);
          const dx = m.left ? -1 : m.right ? 1 : 0, dy = m.up ? -1 : m.down ? 1 : 0;
          if ((dx || dy) && now - lastMove > 180 && !cheatPanelOpen()) { movePause(dx, dy); lastMove = now; }
          if (!dx && !dy) lastMove = 0;
          if (just('ok')) confirmPause();
          if (just('back')) resume();
        }
        // The weapon wheel, on the right stick: push it any way and it comes up, pointing at a weapon; let it go and
        // that's the one (not on a Joy-Con on its own: it hasn't got one)
        if (playing() && !noSwitching() && hasRightStick(gp.id) && gp.mapping === 'standard' && arsenal().length > 1) {
          const rx = gp.axes[2] ?? 0, ry = gp.axes[3] ?? 0, mag = Math.hypot(rx, ry);
          if (mag > 0.55) { const i = wheelIndexAt(rx, ry, arsenal().length); if (wheel.at !== i) { wheel.at = i; setWheelAt(i); } }
          else if (mag < 0.3 && wheel.at !== null) { equip(wheel.at); wheel.at = null; setWheelAt(null); }
        } else if (wheel.at !== null) { wheel.at = null; setWheelAt(null); }
        Object.assign(prev, btn);
      }
      id = requestAnimationFrame(poll);
    };
    id = requestAnimationFrame(poll);
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('mousedown', onMouseDown); window.removeEventListener('keydown', onKey); window.removeEventListener('contextmenu', onContext); window.removeEventListener('pointerdown', onPointer); cancelAnimationFrame(id); };
  }, []);

  const onPlayerUpdate = (health: number, power: number, ammo?: Record<WeaponType, number>) => {
    if (ammo) ammoRef.current = ammo;
    // (the engine hands over the same ammo table every frame, changed in place: it's what's in it that's compared, and
    // a copy that's kept, or the HUD only caught up when something else changed, his health, his power)
    setHud(h => {
      const same = !ammo || M2_WEAPONS.every(w => h.ammo[w] === ammo[w]);
      return h.health === health && h.power === power && same ? h : { health, power, ammo: ammo ? { ...ammo } : h.ammo };
    });
  };

  // (a stretch with its own controls and no weapon switching: its controls card, for the pause menu)
  const cardId = ui.noSwitch ? ui.pauseControls ?? null : null;
  const card = cardId ? pauseCard(cardId, ninPad, joyPad) : null;
  // (and once its own controls card has gone, a few seconds of PAUSE FOR CONTROLS: once a visit to it, the user's)
  const tipsUp = !!(ui.heliTips || ui.bikeTips || ui.broomTips || ui.tragonTips || ui.tragonHold || ui.logTip);
  const [pausePrompt, setPausePrompt] = useState(false);
  const promptDone = useRef<string | null>(null);
  useEffect(() => {
    if (!cardId) { promptDone.current = null; setPausePrompt(false); return; }
    if (promptDone.current === cardId || tipsUp || ui.introCutscene || status !== GameStatus.PLAYING) return;
    // (a moment in: its own card comes up first, if it's got one, and this waits till that's gone)
    const id = setTimeout(() => { promptDone.current = cardId; setPausePrompt(true); }, 1200);
    return () => clearTimeout(id);
  }, [cardId, tipsUp, ui.introCutscene, status]);
  useEffect(() => { if (!pausePrompt) return; const id = setTimeout(() => setPausePrompt(false), 4500); return () => clearTimeout(id); }, [pausePrompt]);

  const noticeUp = ui.notice && performance.now() - ui.notice.at < 1800;
  useEffect(() => { if (!ui.notice) return; const id = setTimeout(() => setUi({ notice: null }), 1900); return () => clearTimeout(id); }, [ui.notice]);
  const nearLand = landAt(ui.near);
  // (the HUD and the pause menu, done up for wherever he is)
  // (in dev, ?zone=<zone> shows that one's look anywhere)
  const devZone = import.meta.env.DEV ? (new URLSearchParams(location.search).get('zone') as keyof typeof THEMES | null) : null;
  const zone = devZone ?? (stage === HUB_STAGE ? 'hub' : stage === PEN_STAGE ? 'staff' : stage === INTRO_STAGE || stage === GYM_STAGE || landOfStage(stage) ? ui.zone : undefined);
  const theme = zone ? THEMES[zone] : undefined;

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="relative shrink-0 border-4 border-gray-800 bg-[#121212] overflow-hidden" style={{ width: 800, height: 600, boxSizing: 'content-box', transform: `scale(${scale})` }}>
        <GameCanvas
          status={status}
          stageId={stage}
          currentWeapon={weapon}
          availableWeapons={arsenal()}
          initialAmmo={initialAmmo}
          cheats={stage === PEN_STAGE ? PRACTICE : { ...PLAY, invincible: cheat.god, infiniteAmmo: cheat.ammo }}
          onState={s => { setLiveState(s); setMusicState(s); }}
          quietInvincible
          bossTauntText=""
          onPlayerUpdate={onPlayerUpdate}
          onBossEncounter={noop}
          onBossTransition={noop}
          onBossDefeated={noop}
          onBossDeath={noop}
          onIntroComplete={() => setStatus(GameStatus.PLAYING)}
        />
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && !ui.killCam && (
          ui.heliHud
            // (flying the helicopter: the PWR row's its boost, its rockets beside it; the weapon's its machine gun)
            ? <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={ui.heliBoost ?? 0} powerCells={1} powerExtra={ROCKETS_ON ? <HeliRockets charges={ui.heliRockets ?? 0} /> : undefined} currentWeapon="LMG" ammo={Infinity} maxAmmo={Infinity} weaponName="MACHINE GUN" skin={theme?.hud} cellWidth={M2_CELL_W} />
            : ui.bikeHud
            // (on the dirt bike: the PWR row's its boost; no gun, his fists)
            ? <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={ui.bikeBoost ?? 0} powerCells={1} currentWeapon={weapon} ammo={Infinity} maxAmmo={Infinity} weaponName="FISTS" weaponArt={<BikeFist />} skin={theme?.hud} cellWidth={M2_CELL_W} />
            : ui.broomHud
            // (on the broomstick: the PWR row's its boost; the weapon's the laser on the broom's end)
            ? <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={ui.broomBoost ?? 0} powerCells={1} currentWeapon={weapon} ammo={Infinity} maxAmmo={Infinity} weaponName="BROOM LASER" weaponArt={<BroomWand />} skin={theme?.hud} cellWidth={M2_CELL_W} />
            : <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={hud.power} currentWeapon={weapon} ammo={hud.ammo[weapon] ?? 0} maxAmmo={maxAmmo(weapon)} weaponName={weapon === 'GUN' && ui.catHud ? 'HAIRBALL' : weaponName(weapon)} weaponArt={weapon === 'GUN' ? (ui.catHud ? HAIRBALL_ART : RAYGUN_ART) : undefined} weaponExtra={weapon === 'SOUL_SUCKER' ? <GoreBag /> : weapon === 'SPELLBOOK' ? <BulkMeter /> : undefined} ammoLabel={ammoName(weapon) === 'AMMO' ? undefined : ammoName(weapon)} skin={theme?.hud} cellWidth={M2_CELL_W} />
        )}
        {/* What up does here */}
        {status === GameStatus.PLAYING && ui.map === null && (nearLand || ui.near === STAFF_SLOT || ui.nearExit || ui.nearAmerica) && (
          <div className={`absolute left-1/2 -translate-x-1/2 ${stage === PEN_STAGE ? 'top-[232px]' : 'top-[132px]'} z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600`}>
            <Prompt pad={['DPAD_UP']} kb={['@up']} label={nearLand ? `MAP: ${nearLand.name}` : ui.nearExit ? 'BACK TO THE HUB' : ui.nearAmerica ? 'BACK TO AMERICA USA' : 'STAFF ONLY: THE STAFF ROOM'} />
          </div>
        )}
        {/* The staff room: practice, so the ammo's free (said only once he's got a weapon that takes any) */}
        {status === GameStatus.PLAYING && ui.map === null && stage === PEN_STAGE && owned.some(w => w !== 'GUN') && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-1 text-[8px] tracking-wider text-[#FDE047] bg-black/75 border-2 border-zinc-600 whitespace-nowrap">
            STAFF ROOM: UNLIMITED AMMO FOR EVERY WEAPON
          </div>
        )}
        {/* What up does here, in a land (a lever to pull) */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.upPrompt && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <Prompt pad={['DPAD_UP']} kb={['@up']} label={ui.upPrompt} />
          </div>
        )}
        {/* What HOLDING up or down does here, in a land (a locker to hide in, a star toilet to sit on): every one of them
            the same, HOLD and the button */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && !ui.upPrompt && (ui.holdUpPrompt || ui.holdDownPrompt) && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            {ui.holdUpPrompt
              ? <span className="inline-flex items-center gap-1 align-middle"><span>HOLD</span><Prompt pad={['DPAD_UP']} kb={['@up']} label={ui.holdUpPrompt} /></span>
              : <span className="inline-flex items-center gap-1 align-middle"><span>HOLD</span><Prompt pad={['DPAD_DOWN']} kb={['@down']} label={ui.holdDownPrompt ?? ''} /></span>}
          </div>
        )}
        {/* Wilderness Land's rolling logs: on one, down and forward crouch-walks it */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && !ui.upPrompt && !ui.holdUpPrompt && !ui.holdDownPrompt && ui.logTip && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <span className="inline-flex items-center gap-1 align-middle"><Prompt pad={['DPAD_DOWN']} kb={['@down']} /><span>+ FORWARD: CROUCH-WALK THE LOG</span></span>
          </div>
        )}
        {/* A beatdown: on top of him, the punch buttons (any of them throws one) */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.beatTip && !ui.upPrompt && !ui.holdUpPrompt && !ui.holdDownPrompt && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <span className="inline-flex items-center gap-1 align-middle"><Prompt pad={['X']} kb={['@fire']} /><span>/</span><Prompt pad={['B']} kb={['@special']} /><span>/</span><Prompt pad={['Y']} kb={['@secondary']} /><span>: PUNCH</span></span>
          </div>
        )}
        {/* Foreign Lands' helicopter: the flying controls, for a while once he's jacked it */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.heliTips && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 flex gap-4 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <Prompt pad={['X']} kb={['@fire']} label="MACHINE GUN" />
            {ROCKETS_ON && <Prompt pad={['Y']} kb={['@secondary']} label="ROCKETS" />}
            <span className="inline-flex items-center gap-1 align-middle"><Prompt pad={['DPAD']} kb={['@up', '@down', '@left', '@right']} /><span>+</span><Prompt pad={['B']} kb={['@special']} label="BOOST" /></span>
          </div>
        )}
        {/* Wilderness Land's dirt-bike chase: the riding controls, for a while at the start */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.bikeTips && (
          // (a Genesis panel: chrome bevel, a banded navy face)
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 flex flex-col items-center gap-2 px-3 py-2 text-[9px] text-white bg-gradient-to-b from-[#1E2A70] via-[#121A4A] to-[#0A0E2A] border-4 border-t-[#F2F2FA] border-l-[#CACADA] border-b-[#3A3A48] border-r-[#62627A] shadow-[0_0_0_2px_#0A0A10]">
            <div className="flex gap-4">
              <Prompt pad={['X']} kb={['@fire']} label="HIT LEFT" />
              <Prompt pad={['B']} kb={['@charge', '@special']} label="HIT RIGHT" />
              <Prompt pad={['A']} kb={['@jump']} label="JUMP" />
              <Prompt pad={['DPAD_UP']} kb={['@up']} label="BOOST" />
              <Prompt pad={['DPAD_DOWN']} kb={['@down']} label="BRAKE" />
            </div>
          </div>
        )}
        {/* Fairy Land's Truelling Tragons: over each dragon he's not on, the button that hops him there */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.tragonMarks && <TragonMarks marks={ui.tragonMarks} />}
        {/* Fairy Land's Truelling Tragons: hopping cars, the first ride (till he's hopped once) */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.tragonTips && !ui.tragonHold && (
          // (a storybook shingle: a navy field banded down, a gilt edge, inked)
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[10px] z-30 flex flex-col items-center gap-2 px-3 py-2 text-[9px] text-white bg-gradient-to-b from-[#2A4A8A] via-[#1E3A6E] to-[#0E1A3A] border-4 border-[#E0AE3A] shadow-[0_0_0_2px_#1A1028,inset_0_0_0_2px_#7A5418]">
            <div className="flex gap-4">
              <Prompt pad={['RB']} kb={['@prevWeapon']} label="HOP UP A CAR" />
              <Prompt pad={['LB']} kb={['@nextWeapon']} label="HOP DOWN A CAR" />
            </div>
            <span className="text-zinc-300">UP FROM THE TOP: ROUND TO THE BOTTOM, AND BACK</span>
            <span className="text-zinc-400">NO GUNS ON THE RIDE: HANG ON</span>
          </div>
        )}
        {/* Fairy Land's Truelling Tragons: a loop coming (which track, what it is) or on now: HOLD the real down button
            to hang on; the first one's the teaching card. At the bottom, out from over the dragons. */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.tragonHold && (() => {
          const h = ui.tragonHold;
          const tracks = h.lanes.map((l, i) => <span key={l} style={{ color: h.cols[i] }}>{l}</span>);
          const joined = tracks.flatMap((el, i) => (i ? [<span key={`a${i}`}>{i === tracks.length - 1 ? ' AND ' : ', '}</span>, el] : [el]));
          const hold = <span className="inline-flex items-center gap-1 align-middle"><span>HOLD</span><Prompt pad={['DPAD_DOWN']} kb={['@down']} /></span>;
          return (
            <div className={`absolute left-1/2 -translate-x-1/2 bottom-[10px] z-30 flex flex-col items-center gap-1 px-3 py-2 text-white bg-gradient-to-b from-[#2A4A8A] via-[#1E3A6E] to-[#0E1A3A] shadow-[0_0_0_2px_#1A1028,inset_0_0_0_2px_#E0AE3A] border-4 ${h.now ? (h.slip ? 'border-red-500 text-[12px]' : 'border-white text-[12px]') : h.teach ? 'border-[#FACC15] text-[10px]' : 'border-zinc-500 text-[9px]'}`}
              style={!h.now ? { borderColor: h.cols[0] } : undefined}>
              {h.now
                ? <span className="inline-flex items-center gap-2">{hold}<span>{h.slip ? 'HANG ON!' : 'TO HANG ON!'}</span></span>
                : h.teach
                  ? <>
                      <span className="inline-flex items-center gap-1">A {h.kind}: {hold}<span>TO HANG ON</span></span>
                      <span className="text-[9px] text-zinc-300">ON THE {joined} TRACK. LET GO AND YOU FALL. HOP OFF IT TO DODGE IT.</span>
                    </>
                  : <span className="inline-flex items-center gap-1">{h.kind} ON {joined}{h.lanes.length > 1 ? ' TRACKS' : ' TRACK'}: {hold}{h.mine ? <span className="text-red-400"> YOURS!</span> : null}</span>}
            </div>
          );
        })()}
        {/* Fairy Land's broomstick deathmatch: the flying controls, for a while at the start */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.broomTips && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 flex flex-col items-center gap-2 px-3 py-2 text-[9px] text-white bg-black/80 border-2 border-[#F472B6]">
            <div className="flex gap-4">
              <Prompt pad={['X']} kb={['@fire']} label="LASER" />
              <span className="inline-flex items-center gap-1 align-middle"><span>HOLD</span><Prompt pad={['X']} kb={['@fire']} label="LOCK ON, LET GO: HOMING SHOT" /></span>
            </div>
            <div className="flex gap-4">
              <ChordPrompt pad={[ninPad ? 'B' : 'A', 'RB', ...(joyPad ? [] : ['RT' as const])]} join="/" kb={['@jump']} label="BOOST" />
              <ChordPrompt pad={[ninPad ? 'A' : 'B', 'LB', ...(joyPad ? [] : ['LT' as const])]} join="/" kb={['@charge', '@special']} label="BRAKE" />
              <Prompt pad={['Y']} kb={['@secondary']} label="INVERT PITCH" />
            </div>
            <span className="inline-flex items-center gap-1 align-middle"><Prompt pad={['DPAD_UP', 'DPAD_DOWN']} kb={['@up', '@down']} /><span>PITCH UP / DOWN</span><Prompt pad={['DPAD_LEFT', 'DPAD_RIGHT']} kb={['@left', '@right']} /><span>TURN</span></span>
            <span className="text-zinc-400">KILL EVERY SUITOR</span>
          </div>
        )}
        {/* A stretch with its own controls: once its card's gone, where to see them again (the pause menu) */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && card && pausePrompt && !tipsUp && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-2 py-1 text-[7px] text-zinc-200 bg-black/60 border border-zinc-600 pointer-events-none">
            <Prompt pad={['START']} kb={['ESC']} label="PAUSE FOR CONTROLS" size={12} />
          </div>
        )}
        {/* Fairy Land's fairy wheel: a QTE on (in a suitor's cart) */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.zone === 'wheel' && ui.qte && <QtePanel qte={ui.qte} />}
        {/* Fairy Land's Piper fight: frozen solid, mash out */}
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && ui.zone === 'piper' && ui.iceMash != null && <IcePanel fill={ui.iceMash} />}
        {/* The intro: what the panel in the corner's teaching, where he is; what up does at the ticket window; the ticket */}
        {status === GameStatus.PLAYING && stage === INTRO_STAGE && !ui.introCutscene && ui.introTip && (
          // (the grabs' sheet goes wide, three moves side by side, under the HUD: not a tall column)
          <div className={`absolute z-20 flex flex-col gap-2 px-3 py-2 text-[8px] leading-[1.6] text-zinc-100 bg-black/70 border-2 border-zinc-600 ${ui.introTip === 'grabs' ? 'left-3 right-3 top-[124px]' : 'right-3 top-3 max-w-[420px]'}`}>
            {ui.introTip === 'postal' && <>
              <span className="text-sky-300">PARK SECURITY LEAVES YOU ALONE IF YOU LEAVE EVERYBODY ALONE.</span>
              <span className="text-zinc-400">HIT ANYBODY (OR SET OFF THE METAL DETECTOR) AND THE WHOLE PARK COMES AT YOU.</span>
              <span className="text-zinc-400">SECURITY DOESN'T SEND MORE ON ITS OWN.</span>
              <span className="text-zinc-500">SKIP THE INTRO FROM THE PAUSE MENU.</span>
            </>}
            {ui.introTip === 'grabs' && <>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                <div className="flex flex-col gap-1">
                  <ChordPrompt pad={['Y', 'B']} join="+" kb={['@beatdown']} label="BEATDOWN" />
                  <span className="text-green-400">PUNCHES HEAL YOU.</span>
                  <span className="text-zinc-400"><ChordPrompt pad={['X', 'B', 'Y']} join="/" kb={['@fire']} label="PUNCH" size={12} /> <Prompt pad={['A']} kb={['@jump']} label="GET OFF" size={12} /></span>
                </div>
                <div className="flex flex-col gap-1">
                  <ChordPrompt pad={['A', 'B']} join="+" kb={['@airGrab']} label="AIR GRAB" />
                  <span className="text-green-400">LEAP, GRAB, SLAM. IT HEALS.</span>
                  <span className="text-zinc-400">BACK: FLIP. FORWARD: DIVE.</span>
                </div>
                <div className="flex flex-col gap-1">
                  <ChordPrompt pad={['Y', 'X']} join="+" kb={['@shakedown']} label="SHAKEDOWN" />
                  <span className="text-green-400">SHAKES AMMO OUT OF THEM.</span>
                  <span className="text-zinc-400">HOLD A DIRECTION TO THROW.</span>
                </div>
              </div>
              <span className="text-yellow-300">SET OFF THE METAL DETECTOR TO CALL OUT GUARDS TO PRACTICE ON. JUMP IT TO SNEAK PAST.</span>
            </>}
            {ui.introTip === 'line' && <>
              <span className="text-sky-300">WAIT YOUR TURN AT THE WINDOW. OR PLOW THROUGH THEM.</span>
              {ui.introAhead !== null && ui.introAhead !== undefined && <span className="text-yellow-300">{ui.introAhead > 0 ? `${ui.introAhead} AHEAD OF YOU` : 'YOUR TURN'}</span>}
            </>}
          </div>
        )}
        {status === GameStatus.PLAYING && stage === INTRO_STAGE && !ui.introCutscene && ui.introPrompt && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <Prompt pad={['DPAD_UP']} kb={['@up']} label={ui.introPrompt === 'ticket' ? 'SHOW YOUR TICKET' : ui.introPrompt === 'wait' ? 'WAIT YOUR TURN' : 'IN YOU GO'} />
          </div>
        )}
        {/* The Iron Pit (the opening tutorial): the lesson card for the room he's in */}
        {status === GameStatus.PLAYING && stage === GYM_STAGE && !ui.introCutscene && ui.gymTip && <GymTips tip={ui.gymTip} />}
        {ui.introTicket && <TicketCard kind={ui.introTicket} />}
        {ui.map !== null && <LandCard land={ui.map} />}
        {/* (the checkpoint-skip cheat: where in the land to start) */}
        {ui.pick && LAND_STAGES[ui.pick] && (() => {
          const cps = LAND_STAGES[ui.pick].checkpoints;
          return (
            <CheckpointPicker stageId={LANDS.find(l => l.id === ui.pick)?.name ?? ui.pick}
              list={cps.map((c, k) => ({ label: `${k + 1}. ${c.name}`, at: c.cp }))}
              onCancel={() => setUi({ pick: null })}
              onPick={at => { const id = ui.pick!; setUi({ pick: null }); setStartCheckpoint(typeof at === 'number' ? at : cps[cps.length - 1].cp); goTo(id); }} />
          );
        })()}
        {wheelAt !== null && status === GameStatus.PLAYING && !noSwitching() && <WeaponWheel weapons={arsenal()} index={wheelAt} current={weapon} nameOf={w => (w === 'GUN' && ui.catHud ? 'HAIRBALL' : weaponName(w))} Art={ui.catHud ? CatWeaponArt : M2WeaponArt} />}
        {status === GameStatus.PAUSED && !mapFrom && (
          <PauseMenu weapons={arsenal()} current={weapon} ammo={hud.ammo} selected={pauseSel} locked={!!ui.noSwitch} card={card} cat={!!ui.catHud}
            onPick={i => { setPauseSel(i); equip(i); }} onResume={resume} onMap={() => { setPauseSel(arsenal().length + 1); openMap(); }} onOptions={() => { setPauseSel(arsenal().length + 2); openOptions(); }} onSkip={stage === INTRO_STAGE && !M2_PUBLIC ? skipIntro : stage === GYM_STAGE && !M2_PUBLIC ? skipGym : undefined} skipLabel={stage === GYM_STAGE ? 'SKIP STAGE' : undefined}
            onHub={landOfStage(stage) || stage === PEN_STAGE ? askHub : undefined} hubAsk={hubAsk} onHubAnswer={answerHub} onHubPick={a => setHubAsk(a)} skin={theme?.pause}
            onQuit={() => { setPauseSel(quitIndex()); askQuit(); }} quitAt={quitIndex()} asking={asking} onFile={activeSlot() !== null} />
        )}
        {/* The park map (SELECT, TAB / M, MAP in the pause menu): where he is, roughly, on the brochure's map */}
        {status === GameStatus.PAUSED && mapFrom && (
          <ParkMap here={{ place: stage === HUB_STAGE ? 'hub' : stage === PEN_STAGE ? 'staff' : stage === INTRO_STAGE || stage === GYM_STAGE ? 'intro' : landOfStage(stage) ?? 'hub', zone: ui.zone ?? null }} onClose={closeMap} />
        )}
        {/* OPTIONS: Meathead 1's options screen, with Meathead 2's controls, edged like the pause menu behind it */}
        {optionsOpen && status === GameStatus.PAUSED && (
          <OptionsScreen onClose={closeOptions} guidePages={M2_GUIDE_PAGES}
            look={{ border: (theme?.pause ?? PLAIN_PAUSE).frame.border, boxShadow: (theme?.pause ?? PLAIN_PAUSE).frame.boxShadow, stripe: (theme?.pause ?? PLAIN_PAUSE).stripe }} />
        )}
        {noticeUp && ui.notice && (
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 z-40 px-4 py-3 text-[12px] text-yellow-300 bg-black/85 border-2 border-yellow-500">{ui.notice.text}</div>
        )}
        <div className="absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-200" style={{ opacity: fade || status === GameStatus.START ? 1 : 0 }} />
        {title && <TitleScreen onNew={startNew} onContinue={continueFile} />}
      </div>
    </div>
  );
};

export default App2;
