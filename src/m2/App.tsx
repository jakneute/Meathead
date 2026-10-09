import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import GameCanvas from '../m1/components/GameCanvas';
import HUD from '../m1/components/HUD';
import { RAYGUN_ART } from '../m1/components/WeaponIcon';
import { Prompt } from '../m1/components/ButtonIcons';
import { GameStatus, WeaponType } from '../m1/types';
import { setGutBlowout, setGutLines, setGutDeathLines } from '../m1/game/player/gut';
import { setFootstepVolume } from '../m1/game/player/footsteps';
import { setHurtScale } from '../m1/game/core/resist';
import { setDropTable } from '../m1/game/core/effects';
import { M2_GUT_LINES, M2_GUT_DEATH } from './lines/gutLines';
import { createFullAmmo, maxAmmo, INITIAL_PLAYER_HEALTH, enemyMeleeDamage } from '../m1/constants';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS, getGamepadMovement, menuButtons } from '../m1/game/platform/gamepad';
import { hasRightStick } from '../m1/game/platform/device';
import WeaponWheel, { wheelIndexAt } from '../m1/components/WeaponWheel';
import PauseMenu from './PauseMenu';
import { THEMES } from './hudThemes';
import GoreBag from './GoreBag';
import { M2_WEAPONS, M2WeaponArt, weaponName, registerWeapons, ammoName } from './weapons';
import BulkMeter from './BulkMeter';
import { loadVoicePack } from '../m1/game/platform/voiceclips';
// (its own little pack: just the lines it can say, out of Meathead 1's: tools/voices/m2pack.ts)
import voicePackUrl from './generated/voices.bin?url';
import { registerStageLayout } from '../m1/game/stages/index';
import { hubLayout, HUB_STAGE, setHubStart } from './hub/index';
import { penLayout, PEN_STAGE } from './pen/index';
import { advLayout, ADV_STAGE } from './adventure/index';
import { SPOTS, LANDS } from './hub/lands';
import { introLayout, INTRO_STAGE, registerIntro, introGender } from './intro/index';
import { setGenderOf, unpaired } from '../m1/content/gender';
import { m2KindGender } from './kinds';
import { KILL_LINES, GENERIC_KILL_LINES, KILL_CALLOUTS, ENEMY_KILL_LINES } from '../m1/content/dialogue';
import { M2_ENEMY_KINDS } from './roster';
import TicketCard from './intro/TicketCard';
import { clearSkyCache } from './intro/art/sky';
import { canSkip, requestSkip } from '../m1/game/platform/skip';
import { getAudioContext } from '../m1/game/platform/audio';
import { STAFF_SLOT, AMERICA_SLOT, landAt } from './hub/lands';
import { getUi, subscribeUi, onTravel, setUi, goTo } from './store';
import { attachM2Keys } from './input';
import { setFireKeys } from '../m1/game/platform/input';
import { setRayGun } from '../m1/game/combat/rayGun';
import MapCard from './hub/MapCard';
import ChordPrompt from './ChordPrompt';
import { registerKillLines, m2Kill } from './moves/killLines';
import { cleanLines } from './lines/clean';
import { registerGrabCallouts } from './moves/callouts';

// Meathead 2: Meathead Goes to Happy Land. For now: the hub (walk round it, look at the map for each land) and the
// test pen behind the staff door (try out the beatdown and the shakedown on whoever walks in).

registerStageLayout(HUB_STAGE, hubLayout);
registerStageLayout(PEN_STAGE, penLayout);
registerStageLayout(ADV_STAGE, advLayout);
registerStageLayout(INTRO_STAGE, introLayout);
registerIntro();
loadVoicePack(voicePackUrl);
attachM2Keys();
cleanLines();
// (on the keyboard and mouse, the left button fires: no fire keys)
setFireKeys([]);
setRayGun(true, m2Kill('raygun_kill'));
registerGrabCallouts();
registerKillLines();
// (he or she, over whoever it was)
// (the animals are its; the people on the way in, who they are)
const ANIMALS = new Set(['pigeon', 'pitbull', 'seagull', 'goat', 'hawk', 'rat', 'wolverine', 'crab']);
setGenderOf(e => m2KindGender(e) ?? (ANIMALS.has(e.kind) ? 'n' : introGender(e)));
// (dev: ?walkaway plays the after-the-boss walk-away screen on its own, walkAway.ts)
if (import.meta.env.DEV && new URLSearchParams(location.search).has('walkaway')) void import('./walkAway').then(m => m.devPreviewWalkAway());
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
setDropTable({ health: 0.06, ammo: 0.05 });
registerWeapons();

/** What he's carrying (weapons/index.ts). */
const WEAPONS: WeaponType[] = M2_WEAPONS;
const STARTING_AMMO = createFullAmmo();
/** In the staff room (the practice pen) he can't be hurt (no flicker for it: it's how the room is) and nothing runs out of ammo; everywhere else he can, and it does. */
const PRACTICE = { invincible: true, infiniteAmmo: true, infinitePower: false, skipToBoss: false };
const PLAY = { ...PRACTICE, invincible: false };
const noop = () => {};

const useFitToWindow = () => {
  const fit = () => Math.max(0.5, Math.min(window.innerWidth / 808, window.innerHeight / 608));
  const [scale, setScale] = useState(fit);
  useEffect(() => { const on = () => setScale(fit()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
  return scale;
};

const App2: React.FC = () => {
  const scale = useFitToWindow();
  const ui = useSyncExternalStore(subscribeUi, getUi);
  // (it starts on the way in: the intro; in dev, ?adv=<checkpoint> starts in Adventure Land)
  const first = import.meta.env.DEV && new URLSearchParams(location.search).has('adv') ? ADV_STAGE : INTRO_STAGE;
  const [stage, setStage] = useState(first);
  const [status, setStatus] = useState(GameStatus.START);
  const pending = useRef<string | null>(first);
  const [fade, setFade] = useState(false);
  const [weapon, setWeapon] = useState<WeaponType>('GUN');
  const [hud, setHud] = useState({ health: INITIAL_PLAYER_HEALTH, power: 0, ammo: STARTING_AMMO as Record<WeaponType, number> });
  const ammoRef = useRef(hud.ammo);
  const [initialAmmo, setInitialAmmo] = useState(STARTING_AMMO as Record<WeaponType, number>);

  // Off to a stage: through black, the stage cleared, then built
  useEffect(() => {
    if (status !== GameStatus.START || !pending.current) return;
    const id = pending.current;
    pending.current = null;
    setStage(id);
    setStatus(GameStatus.LEVEL_INTRO);
    setTimeout(() => setFade(false), 120);
  }, [status]);
  useEffect(() => {
    onTravel(dest => {
      const to = dest === 'pen' ? PEN_STAGE : dest === 'hub' ? HUB_STAGE : dest === 'adventure' ? ADV_STAGE : null;
      if (!to) return;
      clearSkyCache();
      // (back at the hub where he left it: the staff door, the land's portal, or America USA's way in)
      const landSlot = (id: string) => SPOTS.findIndex(s => s.kind === 'land' && LANDS[s.land].id === id);
      if (to === HUB_STAGE) setHubStart(stage === PEN_STAGE ? STAFF_SLOT : stage === ADV_STAGE ? landSlot('adventure') : AMERICA_SLOT);
      setUi({ introTip: null, introPrompt: null, introAhead: null, introTicket: null, introCutscene: false });
      setUi({ near: null, map: null, nearExit: false, nearAmerica: false, noSwitch: false });
      setFade(true);
      setTimeout(() => { pending.current = to; setInitialAmmo({ ...ammoRef.current }); setStatus(GameStatus.START); }, 260);
    });
  }, [stage]);

  // Pausing (START, or ESC), and the pause menu: which of it's picked out (a weapon, or RESUME after them)
  const [pauseSel, setPauseSel] = useState(0);
  /** The weapon wheel (the right stick): which one it's pointing at, while it's up. */
  const [wheelAt, setWheelAt] = useState<number | null>(null);
  const live = useRef({ status, weapon, stage });
  live.current = { status, weapon, stage };
  /** (in the intro's pause menu, there's SKIP INTRO after RESUME) */
  const lastPause = () => (live.current.stage === INTRO_STAGE ? WEAPONS.length + 1 : WEAPONS.length);
  const skipIntro = () => { setStatus(GameStatus.PLAYING); goTo('hub'); };
  const togglePause = () => {
    const st = live.current.status;
    // (a scene that can be skipped: START / ESC skips it, rather than pausing)
    if (st === GameStatus.PLAYING && canSkip()) { requestSkip(); return; }
    if (st === GameStatus.PLAYING) { setPauseSel(getUi().noSwitch ? WEAPONS.length : Math.max(0, WEAPONS.indexOf(live.current.weapon))); setStatus(GameStatus.PAUSED); }
    else if (st === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };
  const resume = () => { if (live.current.status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING); };
  // (stuck with what he's got, for now: the mine cart)
  const equip = (i: number) => { if (WEAPONS[i] && !getUi().noSwitch) setWeapon(WEAPONS[i]); };
  /** In the pause menu: the arsenal's a grid three across, RESUME under it. */
  const movePause = (dx: number, dy: number) => setPauseSel(i => {
    const n = WEAPONS.length;
    if (i >= n) { if (dx > 0) return Math.min(lastPause(), i + 1); if (dx < 0 && i > n) return n; return dy < 0 ? Math.min(n - 1, Math.floor((n - 1) / 3) * 3) : i; }
    if (dy > 0) return i + 3 < n ? i + 3 : n;
    if (dy < 0) return i - 3 >= 0 ? i - 3 : i;
    return Math.max(0, Math.min(n - 1, i + dx));
  });
  const pauseSelRef = useRef(pauseSel);
  pauseSelRef.current = pauseSel;
  const confirmPause = () => { const i = pauseSelRef.current; if (i === WEAPONS.length + 1) skipIntro(); else if (i >= WEAPONS.length) resume(); else equip(i); };

  // Weapons: the shoulder buttons, the right stick's wheel, the number keys, the mouse wheel; START or ESC pauses
  useEffect(() => {
    const cycle = (d: number) => { if (!getUi().noSwitch) setWeapon(w => WEAPONS[(WEAPONS.indexOf(w) + d + WEAPONS.length) % WEAPONS.length]); };
    const playing = () => live.current.status === GameStatus.PLAYING, paused = () => live.current.status === GameStatus.PAUSED;
    const onWheel = (e: WheelEvent) => { if (playing() || paused()) cycle(e.deltaY > 0 ? 1 : -1); };
    const onKey = (e: KeyboardEvent) => {
      // (the first key lets the sound out: the browser holds it back till then)
      getAudioContext();
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { togglePause(); return; }
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && (playing() || paused())) { const i = +digit[1] - 1; equip(i); if (paused() && i < WEAPONS.length && !getUi().noSwitch) setPauseSel(i); return; }
      if (!paused()) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') movePause(-1, 0);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') movePause(1, 0);
      else if (e.code === 'ArrowUp' || e.code === 'KeyW') movePause(0, -1);
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') movePause(0, 1);
      else if (e.code === 'Enter' || e.code === 'Space') confirmPause();
    };
    // (right-click in the pause menu: back out of it)
    const onContext = (e: MouseEvent) => { if (paused()) { e.preventDefault(); resume(); } };
    window.addEventListener('wheel', onWheel);
    window.addEventListener('keydown', onKey);
    window.addEventListener('contextmenu', onContext);
    // (a click lets the sound out too)
    const onPointer = () => { getAudioContext(); };
    window.addEventListener('pointerdown', onPointer);
    let id = 0, lastMove = 0;
    const prev = { lb: false, rb: false, start: false, ok: false, back: false };
    const wheel: { at: number | null } = { at: null };
    const poll = () => {
      const gp = getActiveGamepad();
      if (gp) {
        const now = performance.now();
        const btn = { lb: isButtonPressed(gp, GP_BUTTONS.LB), rb: isButtonPressed(gp, GP_BUTTONS.RB), start: isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT), ok: isButtonPressed(gp, menuButtons(gp).ok), back: isButtonPressed(gp, menuButtons(gp).back) };
        const just = (k: keyof typeof btn) => btn[k] && !prev[k];
        if ((playing() || paused()) && just('lb')) cycle(-1);
        if ((playing() || paused()) && just('rb')) cycle(1);
        if (just('start')) togglePause();
        if (paused()) {
          const m = getGamepadMovement(gp, 0.25);
          const dx = m.left ? -1 : m.right ? 1 : 0, dy = m.up ? -1 : m.down ? 1 : 0;
          if ((dx || dy) && now - lastMove > 180) { movePause(dx, dy); lastMove = now; }
          if (!dx && !dy) lastMove = 0;
          if (just('ok')) confirmPause();
          if (just('back')) resume();
        }
        // The weapon wheel, on the right stick: push it any way and it comes up, pointing at a weapon; let it go and
        // that's the one (not on a Joy-Con on its own: it hasn't got one)
        if (playing() && !getUi().noSwitch && hasRightStick(gp.id) && gp.mapping === 'standard' && WEAPONS.length > 1) {
          const rx = gp.axes[2] ?? 0, ry = gp.axes[3] ?? 0, mag = Math.hypot(rx, ry);
          if (mag > 0.55) { const i = wheelIndexAt(rx, ry, WEAPONS.length); if (wheel.at !== i) { wheel.at = i; setWheelAt(i); } }
          else if (mag < 0.3 && wheel.at !== null) { equip(wheel.at); wheel.at = null; setWheelAt(null); }
        } else if (wheel.at !== null) { wheel.at = null; setWheelAt(null); }
        Object.assign(prev, btn);
      }
      id = requestAnimationFrame(poll);
    };
    id = requestAnimationFrame(poll);
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); window.removeEventListener('contextmenu', onContext); window.removeEventListener('pointerdown', onPointer); cancelAnimationFrame(id); };
  }, []);

  const onPlayerUpdate = (health: number, power: number, ammo?: Record<WeaponType, number>) => {
    if (ammo) ammoRef.current = ammo;
    // (the engine hands over the same ammo table every frame, changed in place: it's what's in it that's compared, and
    // a copy that's kept, or the HUD only caught up when something else changed, his health, his power)
    setHud(h => {
      const same = !ammo || WEAPONS.every(w => h.ammo[w] === ammo[w]);
      return h.health === health && h.power === power && same ? h : { health, power, ammo: ammo ? { ...ammo } : h.ammo };
    });
  };

  const noticeUp = ui.notice && performance.now() - ui.notice.at < 1800;
  useEffect(() => { if (!ui.notice) return; const id = setTimeout(() => setUi({ notice: null }), 1900); return () => clearTimeout(id); }, [ui.notice]);
  const nearLand = landAt(ui.near);
  // (the HUD and the pause menu, done up for wherever he is)
  // (in dev, ?zone=<zone> shows that one's look anywhere)
  const devZone = import.meta.env.DEV ? (new URLSearchParams(location.search).get('zone') as keyof typeof THEMES | null) : null;
  const zone = devZone ?? (stage === HUB_STAGE ? 'hub' : stage === PEN_STAGE ? 'staff' : stage === INTRO_STAGE || stage === ADV_STAGE ? ui.zone : undefined);
  const theme = zone ? THEMES[zone] : undefined;

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="relative shrink-0 border-4 border-gray-800 bg-[#121212] overflow-hidden" style={{ width: 800, height: 600, boxSizing: 'content-box', transform: `scale(${scale})` }}>
        <GameCanvas
          status={status}
          stageId={stage}
          currentWeapon={weapon}
          availableWeapons={WEAPONS}
          initialAmmo={initialAmmo}
          cheats={stage === PEN_STAGE ? PRACTICE : PLAY}
          quietInvincible
          bossTauntText=""
          onPlayerUpdate={onPlayerUpdate}
          onBossEncounter={noop}
          onBossTransition={noop}
          onBossDefeated={noop}
          onBossDeath={noop}
          onIntroComplete={() => setStatus(GameStatus.PLAYING)}
        />
        {status === GameStatus.PLAYING && ui.map === null && !ui.introCutscene && (
          <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={hud.power} currentWeapon={weapon} ammo={hud.ammo[weapon] ?? 0} maxAmmo={maxAmmo(weapon)} weaponName={weaponName(weapon)} weaponArt={weapon === 'GUN' ? RAYGUN_ART : undefined} weaponExtra={weapon === 'SOUL_SUCKER' ? <GoreBag /> : weapon === 'SPELLBOOK' ? <BulkMeter /> : undefined} ammoLabel={ammoName(weapon) === 'AMMO' ? undefined : ammoName(weapon)} skin={theme?.hud} />
        )}
        {/* What up does here */}
        {status === GameStatus.PLAYING && ui.map === null && (nearLand || ui.near === STAFF_SLOT || ui.nearExit || ui.nearAmerica) && (
          <div className={`absolute left-1/2 -translate-x-1/2 ${stage === PEN_STAGE ? 'top-[232px]' : 'top-[132px]'} z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600`}>
            <Prompt pad={['DPAD_UP']} kb={['W']} label={nearLand ? `MAP: ${nearLand.name}` : ui.nearExit ? 'BACK TO THE HUB' : ui.nearAmerica ? 'BACK TO AMERICA USA' : 'STAFF ONLY: THE STAFF ROOM'} />
          </div>
        )}
        {/* The intro: what the panel in the corner's teaching, where he is; what up does at the ticket window; the ticket */}
        {status === GameStatus.PLAYING && stage === INTRO_STAGE && !ui.introCutscene && ui.introTip && (
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 max-w-[420px] px-3 py-2 text-[8px] leading-[1.6] text-zinc-100 bg-black/70 border-2 border-zinc-600">
            {ui.introTip === 'postal' && <>
              <span className="text-sky-300">PARK SECURITY LEAVES YOU ALONE IF YOU LEAVE EVERYBODY ALONE.</span>
              <span className="text-zinc-400">HIT ANYBODY (OR SET OFF THE METAL DETECTOR) AND THE WHOLE PARK COMES AT YOU.</span>
              <span className="text-zinc-400">SECURITY DOESN'T SEND MORE ON ITS OWN.</span>
              <span className="text-zinc-500">SKIP THE INTRO FROM THE PAUSE MENU.</span>
            </>}
            {ui.introTip === 'grabs' && <>
              <ChordPrompt pad={['Y', 'B']} join="+" kb={['R']} label="BEATDOWN (LUNGE)" />
              <span className="text-green-400 pl-1">EVERY PUNCH HEALS YOU. FINISHING THEM HEALS A LOT.</span>
              <span className="text-zinc-400 pl-1">ON THEM: <ChordPrompt pad={['X', 'B', 'Y']} join="/" mouse="left" label="PUNCH" /> · <Prompt pad={['A']} kb={['SPACE']} label="GET OFF" /></span>
              <ChordPrompt pad={['Y', 'X']} join="+" kb={['T']} label="SHAKEDOWN (GRAB)" />
              <span className="text-green-400 pl-1">SHAKES AMMO OUT OF THEM, ONCE YOU'VE GOT WEAPONS THAT TAKE IT.</span>
              <span className="text-zinc-400 pl-1">AT THE END, HOLD A DIRECTION TO THROW (DOWN: SLAM). INTO A WALL: SPLAT.</span>
              <span className="text-yellow-300 pl-1">SET OFF THE METAL DETECTOR TO CALL OUT GUARDS TO PRACTICE ON. JUMP IT TO SNEAK PAST.</span>
            </>}
            {ui.introTip === 'line' && <>
              <span className="text-sky-300">WAIT YOUR TURN AT THE WINDOW. OR PLOW THROUGH THEM.</span>
              {ui.introAhead !== null && ui.introAhead !== undefined && <span className="text-yellow-300">{ui.introAhead > 0 ? `${ui.introAhead} AHEAD OF YOU` : 'YOUR TURN'}</span>}
            </>}
          </div>
        )}
        {status === GameStatus.PLAYING && stage === INTRO_STAGE && !ui.introCutscene && ui.introPrompt && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <Prompt pad={['DPAD_UP']} kb={['W']} label={ui.introPrompt === 'ticket' ? 'SHOW YOUR TICKET' : ui.introPrompt === 'wait' ? 'WAIT YOUR TURN' : 'IN YOU GO'} />
          </div>
        )}
        {ui.introTicket && <TicketCard kind={ui.introTicket} />}
        {ui.map !== null && <MapCard land={ui.map} />}
        {wheelAt !== null && status === GameStatus.PLAYING && <WeaponWheel weapons={WEAPONS} index={wheelAt} current={weapon} nameOf={weaponName} Art={M2WeaponArt} />}
        {status === GameStatus.PAUSED && (
          <PauseMenu weapons={WEAPONS} current={weapon} ammo={hud.ammo} selected={pauseSel} locked={!!ui.noSwitch}
            onPick={i => { setPauseSel(i); equip(i); }} onResume={resume} onSkip={stage === INTRO_STAGE ? skipIntro : undefined} skin={theme?.pause} />
        )}
        {noticeUp && ui.notice && (
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 z-40 px-4 py-3 text-[12px] text-yellow-300 bg-black/85 border-2 border-yellow-500">{ui.notice.text}</div>
        )}
        <div className="absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-200" style={{ opacity: fade || status === GameStatus.START ? 1 : 0 }} />
      </div>
    </div>
  );
};

export default App2;
