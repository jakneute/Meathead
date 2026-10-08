import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import GameCanvas from '../m1/components/GameCanvas';
import HUD from '../m1/components/HUD';
import { RAYGUN_ART } from '../m1/components/WeaponIcon';
import { Prompt } from '../m1/components/ButtonIcons';
import { GameStatus, WeaponType } from '../m1/types';
import { createFullAmmo, maxAmmo, INITIAL_PLAYER_HEALTH, enemyMeleeDamage } from '../m1/constants';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS, getGamepadMovement, menuButtons } from '../m1/game/platform/gamepad';
import { hasRightStick } from '../m1/game/platform/device';
import WeaponWheel, { wheelIndexAt } from '../m1/components/WeaponWheel';
import PauseMenu from './PauseMenu';
import GoreBag from './GoreBag';
import { M2_WEAPONS, M2WeaponArt, weaponName, registerWeapons, ammoName } from './weapons';
import BulkMeter from './BulkMeter';
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
import { registerKillLines, m2Kill } from './moves/killLines';
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
setRayGun(true, m2Kill('raygun_kill'));
registerGrabCallouts();
registerKillLines();
// (his shoulder charge, slide, uppercut and dive kick hit about as hard as his throws: far lighter than Meathead 1's)
Object.assign(enemyMeleeDamage, { charge: 14, slide: 14, uppercut: 45, divekick: 45 });
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

  // Pausing (START, or ESC), and the pause menu: which of it's picked out (a weapon, or RESUME after them)
  const [pauseSel, setPauseSel] = useState(0);
  /** The weapon wheel (the right stick): which one it's pointing at, while it's up. */
  const [wheelAt, setWheelAt] = useState<number | null>(null);
  const live = useRef({ status, weapon });
  live.current = { status, weapon };
  const togglePause = () => {
    const st = live.current.status;
    if (st === GameStatus.PLAYING) { setPauseSel(Math.max(0, WEAPONS.indexOf(live.current.weapon))); setStatus(GameStatus.PAUSED); }
    else if (st === GameStatus.PAUSED) setStatus(GameStatus.PLAYING);
  };
  const resume = () => { if (live.current.status === GameStatus.PAUSED) setStatus(GameStatus.PLAYING); };
  const equip = (i: number) => { if (WEAPONS[i]) setWeapon(WEAPONS[i]); };
  /** In the pause menu: the arsenal's a grid three across, RESUME under it. */
  const movePause = (dx: number, dy: number) => setPauseSel(i => {
    const n = WEAPONS.length;
    if (i === n) return dy < 0 ? Math.min(n - 1, Math.floor((n - 1) / 3) * 3) : i;
    if (dy > 0) return i + 3 < n ? i + 3 : n;
    if (dy < 0) return i - 3 >= 0 ? i - 3 : i;
    return Math.max(0, Math.min(n - 1, i + dx));
  });
  const pauseSelRef = useRef(pauseSel);
  pauseSelRef.current = pauseSel;
  const confirmPause = () => { const i = pauseSelRef.current; if (i >= WEAPONS.length) resume(); else equip(i); };

  // Weapons: the shoulder buttons, the right stick's wheel, the number keys, the mouse wheel; START or ESC pauses
  useEffect(() => {
    const cycle = (d: number) => setWeapon(w => WEAPONS[(WEAPONS.indexOf(w) + d + WEAPONS.length) % WEAPONS.length]);
    const playing = () => live.current.status === GameStatus.PLAYING, paused = () => live.current.status === GameStatus.PAUSED;
    const onWheel = (e: WheelEvent) => { if (playing() || paused()) cycle(e.deltaY > 0 ? 1 : -1); };
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { togglePause(); return; }
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && (playing() || paused())) { const i = +digit[1] - 1; equip(i); if (paused() && i < WEAPONS.length) setPauseSel(i); return; }
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
        if (playing() && hasRightStick(gp.id) && gp.mapping === 'standard' && WEAPONS.length > 1) {
          const rx = gp.axes[2] ?? 0, ry = gp.axes[3] ?? 0, mag = Math.hypot(rx, ry);
          if (mag > 0.55) { const i = wheelIndexAt(rx, ry, WEAPONS.length); if (wheel.at !== i) { wheel.at = i; setWheelAt(i); } }
          else if (mag < 0.3 && wheel.at !== null) { equip(wheel.at); wheel.at = null; setWheelAt(null); }
        } else if (wheel.at !== null) { wheel.at = null; setWheelAt(null); }
        Object.assign(prev, btn);
      }
      id = requestAnimationFrame(poll);
    };
    id = requestAnimationFrame(poll);
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); window.removeEventListener('contextmenu', onContext); cancelAnimationFrame(id); };
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
          <HUD health={hud.health} maxHealth={INITIAL_PLAYER_HEALTH} power={hud.power} currentWeapon={weapon} ammo={hud.ammo[weapon] ?? 0} maxAmmo={maxAmmo(weapon)} weaponName={weaponName(weapon)} weaponArt={weapon === 'GUN' ? RAYGUN_ART : undefined} weaponExtra={weapon === 'SOUL_SUCKER' ? <GoreBag /> : weapon === 'SPELLBOOK' ? <BulkMeter /> : undefined} ammoLabel={ammoName(weapon) === 'AMMO' ? undefined : ammoName(weapon)} />
        )}
        {/* What up does here */}
        {status === GameStatus.PLAYING && ui.map === null && (nearLand || ui.near === STAFF_SLOT || ui.nearExit) && (
          <div className={`absolute left-1/2 -translate-x-1/2 ${stage === PEN_STAGE ? 'top-[232px]' : 'top-[132px]'} z-30 px-3 py-2 text-[9px] text-white bg-black/75 border-2 border-zinc-600`}>
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
        {wheelAt !== null && status === GameStatus.PLAYING && <WeaponWheel weapons={WEAPONS} index={wheelAt} current={weapon} nameOf={weaponName} Art={M2WeaponArt} />}
        {status === GameStatus.PAUSED && (
          <PauseMenu weapons={WEAPONS} current={weapon} ammo={hud.ammo} selected={pauseSel}
            onPick={i => { setPauseSel(i); equip(i); }} onResume={resume} />
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
