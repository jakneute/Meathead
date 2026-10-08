import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import GameCanvas from '../m1/components/GameCanvas';
import HUD from '../m1/components/HUD';
import { Prompt } from '../m1/components/ButtonIcons';
import { GameStatus, WeaponType } from '../m1/types';
import { createFullAmmo, maxAmmo, INITIAL_PLAYER_HEALTH } from '../m1/constants';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../m1/game/platform/gamepad';
import { loadVoicePack } from '../m1/game/platform/voiceclips';
// (its own little pack: just the lines it can say, out of Meathead 1's: tools/voices/m2pack.ts)
import voicePackUrl from './generated/voices.bin?url';
import { registerStageLayout } from '../m1/game/stages/index';
import { hubLayout, HUB_STAGE, setHubStart } from './hub/index';
import { penLayout, PEN_STAGE } from './pen/index';
import { STAFF_SLOT, AMERICA_SLOT, landAt } from './hub/lands';
import { getUi, subscribeUi, onTravel, setUi } from './store';
import { attachM2Keys } from './input';
import { setFireKeys } from '../m1/game/platform/input';
import { setRayGun } from '../m1/game/combat/rayGun';
import MapCard from './hub/MapCard';
import ChordPrompt from './ChordPrompt';
import { cleanLines } from './lines/clean';
import { registerGrabCallouts } from './moves/callouts';

// Meathead 2: Meathead Goes to Happy Land. For now: the hub (walk round it, look at the map for each land) and the
// test pen behind the staff door (try out the beatdown and the shakedown on whoever walks in).

registerStageLayout(HUB_STAGE, hubLayout);
registerStageLayout(PEN_STAGE, penLayout);
loadVoicePack(voicePackUrl);
attachM2Keys();
cleanLines();
// (on the keyboard and mouse, the left button fires: no fire keys)
setFireKeys([]);
setRayGun(true);
registerGrabCallouts();

/** His one gun, for now: the ray gun (the engine's pistol, turned into one: see rayGun.ts). */
const WEAPONS: WeaponType[] = ['GUN'];
const STARTING_AMMO = createFullAmmo();
/** In the staff room (the practice pen) he can't be hurt (no flicker for it: it's how the room is); everywhere else he can. */
const PRACTICE = { invincible: true, infiniteAmmo: false, infinitePower: false, skipToBoss: false };
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
  const [stage, setStage] = useState(HUB_STAGE);
  const [status, setStatus] = useState(GameStatus.START);
  const pending = useRef<string | null>(HUB_STAGE);
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
      const to = dest === 'pen' ? PEN_STAGE : dest === 'hub' ? HUB_STAGE : null;
      if (!to) return;
      if (to === HUB_STAGE) setHubStart(stage === PEN_STAGE ? STAFF_SLOT : AMERICA_SLOT);
      setUi({ near: null, map: null, nearExit: false });
      setFade(true);
      setTimeout(() => { pending.current = to; setInitialAmmo({ ...ammoRef.current }); setStatus(GameStatus.START); }, 260);
    });
  }, [stage]);

  // Weapons: the shoulder buttons, or the mouse wheel
  useEffect(() => {
    const cycle = (d: number) => setWeapon(w => WEAPONS[(WEAPONS.indexOf(w) + d + WEAPONS.length) % WEAPONS.length]);
    const onWheel = (e: WheelEvent) => cycle(e.deltaY > 0 ? 1 : -1);
    window.addEventListener('wheel', onWheel);
    let id = 0, lb = false, rb = false;
    const poll = () => {
      const gp = getActiveGamepad();
      const l = !!gp && isButtonPressed(gp, GP_BUTTONS.LB), r = !!gp && isButtonPressed(gp, GP_BUTTONS.RB);
      if (l && !lb) cycle(-1);
      if (r && !rb) cycle(1);
      lb = l; rb = r;
      id = requestAnimationFrame(poll);
    };
    id = requestAnimationFrame(poll);
    return () => { window.removeEventListener('wheel', onWheel); cancelAnimationFrame(id); };
  }, []);

  const onPlayerUpdate = (health: number, power: number, ammo?: Record<WeaponType, number>) => {
    if (ammo) ammoRef.current = ammo;
    setHud(h => (h.health === health && h.power === power && h.ammo === ammo ? h : { health, power, ammo: ammo ?? h.ammo }));
  };

  const noticeUp = ui.notice && performance.now() - ui.notice.at < 1800;
  useEffect(() => { if (!ui.notice) return; const id = setTimeout(() => setUi({ notice: null }), 1900); return () => clearTimeout(id); }, [ui.notice]);
  const nearLand = landAt(ui.near);

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
        {status === GameStatus.PLAYING && ui.map === null && (
          <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={hud.power} currentWeapon={weapon} ammo={hud.ammo[weapon] ?? 0} maxAmmo={maxAmmo(weapon)} weaponName={weapon === 'GUN' ? 'RAY GUN' : undefined} />
        )}
        {/* What up does here */}
        {status === GameStatus.PLAYING && ui.map === null && (nearLand || ui.near === STAFF_SLOT || ui.nearExit) && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[132px] z-20 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600">
            <Prompt pad={['DPAD_UP']} kb={['W']} label={nearLand ? `MAP: ${nearLand.name}` : ui.nearExit ? 'BACK TO THE HUB' : 'STAFF ONLY: THE STAFF ROOM'} />
          </div>
        )}
        {/* The pen: how the grabs go */}
        {status === GameStatus.PLAYING && stage === PEN_STAGE && (
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 max-w-[440px] px-3 py-2 text-[8px] leading-[1.6] text-zinc-100 bg-black/70 border-2 border-zinc-600">
            <ChordPrompt pad={['Y', 'B']} join="+" kb={['R']} label="BEATDOWN (LUNGE)" />
            <span className="text-green-400 pl-1">EVERY PUNCH HEALS YOU. FINISHING HIM HEALS A LOT.</span>
            <span className="text-zinc-400 pl-1">ON HIM: <ChordPrompt pad={['X', 'B', 'Y']} join="/" mouse="left" label="PUNCH" /> · <Prompt pad={['A']} kb={['SPACE']} label="GET OFF" /></span>
            <ChordPrompt pad={['Y', 'X']} join="+" kb={['T']} label="SHAKEDOWN (GRAB)" />
            <span className="text-sky-400 pl-1">SHAKE THE AMMO OUT OF HIM (ONCE PER GUY).</span>
            <span className="text-zinc-400 pl-1">AT THE END, HOLD A DIRECTION TO THROW (DOWN: SLAM)</span>
            <span className="text-yellow-300 pl-1">SMALL CRITTERS (RATS, CRABS, BIRDS...) GIVE NO HEALTH OR AMMO. EITHER GRAB JUST PICKS ONE UP: PRESS A DIRECTION TO PITCH IT LIKE A BASEBALL.</span>
          </div>
        )}
        {ui.map !== null && <MapCard land={ui.map} />}
        {noticeUp && ui.notice && (
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 z-40 px-4 py-3 text-[12px] text-yellow-300 bg-black/85 border-2 border-yellow-500">{ui.notice.text}</div>
        )}
        <div className="absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-200" style={{ opacity: fade || status === GameStatus.START ? 1 : 0 }} />
      </div>
    </div>
  );
};

export default App2;
