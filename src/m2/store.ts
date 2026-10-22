// What the game loop tells the React side (the map card, the prompts, where to go next): a little shared state, and
// a way to hear about it changing.

export interface M2Ui {
  /** The hub spot he's standing at (a land's path, or the staff door), or null. */
  near: number | null;
  /** The map's up for this spot, or null. */
  map: number | null;
  /** Near the pen's way back to the hub. */
  nearExit: boolean;
  /** A line across the screen for a moment ("COMING SOON"), and when it was put up. */
  notice: { text: string; at: number } | null;
  /** (the intro) The panel in the corner, what up does at the ticket window, how many are ahead of him in line, the
   *  ticket up close, and whether a scene's on (no HUD). */
  introTip?: 'postal' | 'grabs' | 'line' | null;
  introPrompt?: 'ticket' | 'barge' | 'wait' | null;
  introAhead?: number | null;
  introTicket?: 'clean' | 'shitty' | 'nude' | null;
  introCutscene?: boolean;
  /** A death's kill cam is up (a view of its own over the whole screen): no HUD over it. */
  killCam?: boolean;
  /** (the Iron Pit, the opening tutorial: intro/gym) What its card up top is teaching right now. */
  gymTip?: import('./intro/gym/index').GymTip | null;
  /** (the checkpoint-skip cheat) A land picked on the map: where in it to start, being asked. */
  pick?: string | null;
  /** (the hub) At the way back out to America USA. */
  nearAmerica?: boolean;
  /** Where he is, for the HUD's and the pause menu's look (hudThemes.tsx). */
  zone?: import('./hudThemes').Zone;
  /** Stuck with the weapon he's got (the mine cart): no switching, by any button, wheel or the pause menu. */
  noSwitch?: boolean;
  /** Not his to play right now (a cutscene, the victory walk, a grab or a lever under way, dying): no weapon wheel, no switching. */
  locked?: boolean;
  /** What pressing up does right here, if anything (a lever to pull...): its prompt (a land's own; reset each frame). */
  upPrompt?: string | null;
  /** What HOLDING up does right here, if anything (hiding in a locker: only while it's held): shown as HOLD, the up
   *  button (the real one, pad or keys) and this (a land's own; reset each frame). */
  holdUpPrompt?: string | null;
  /** What HOLDING down does right here, if anything (sitting on a star toilet...): shown as HOLD, the down button and
   *  this (a land's own; reset each frame). */
  holdDownPrompt?: string | null;
  /** (Foreign Lands' helicopter) The flying controls card: X the gun, Y the rockets, B and a direction the boost. */
  heliTips?: boolean;
  /** (Wilderness Land's rolling logs) On a log: the crouch-walk tip, down and forward (the user's). */
  logTip?: boolean;
  /** (a beatdown, on top of somebody) The punch buttons (the user's: "show the buttons you need to press"). */
  beatTip?: boolean;
  /** (the helicopter, flying) The main HUD's his helicopter's: the PWR row the rotor boost's charge (0..1), the
   *  rockets' charges beside it (0..3, fractional while one's coming back), the weapon the machine gun. */
  heliHud?: boolean;
  heliBoost?: number;
  heliRockets?: number;
  /** (Wilderness Land's dirt-bike chase) The main HUD's his bike's: the PWR row the boost (0..1), FISTS for the weapon;
   *  and the riding controls card (X hit left, B hit right, A jump, up boost, down brake; the parry is never told: found). */
  bikeHud?: boolean;
  bikeBoost?: number;
  bikeTips?: boolean;
  /** (Fairy Land's fairy wheel) A QTE on: what to press, how it's going (fantasy/wheel/QtePanel.tsx draws it). */
  qte?: QteUi | null;
  /** (Fairy Land's Truelling Tragons) Next / previous weapon (the mouse wheel, LB / RB) hop him between cars instead:
   *  requestCarHop; and the ride's controls card (the first time, till he's hopped). */
  carHops?: boolean;
  tragonTips?: boolean;
  /** (Truelling Tragons) Over each dragon he's not on, the hop button that takes him there (the user's), by lane:
   *  'up', 'down', 'both' or '' (none), joined with '|'; null: none shown (can't hop now). Where each sits on screen is
   *  tragonMarkAt, moved every frame without a re-render (TragonMarks.tsx reads it on its own frame loop). */
  tragonMarks?: string | null;
  /** (Truelling Tragons) The loop card: what's coming (or on now) on which track(s), their colors, whether his is one
   *  of them, locked in it now (HOLD!), the first one's teaching, his grip slipping. */
  tragonHold?: { kind: string; lanes: string[]; cols: string[]; mine: boolean; now: boolean; teach: boolean; slip: boolean } | null;
  /** (Fairy Land's broomstick deathmatch) The main HUD's his broom's: the PWR row the boost (0..1), the BROOM LASER for
   *  the weapon; and the flying controls card (X laser, hold X lock on, A boost, B brake, Y invert, pitch and turn). */
  broomHud?: boolean;
  broomBoost?: number;
  broomTips?: boolean;
  /** (Cartoon Land's White House) He's the cat: the gun's a HAIRBALL on the HUD. */
  catHud?: boolean;
  /** (Fairy Land's Piper fight) Frozen solid in liquid nitrogen: how far he's mashed out of the ice (0..1), or null
   *  (fantasy/bedroom/IcePanel.tsx draws the prompt). */
  iceMash?: number | null;
  /** A stretch with its own controls and no weapon switching (the user's): which one, while it's on (set by the
   *  stretch, cleared as it ends; only counted while noSwitch is on). The pause menu shows its controls in place of the
   *  weapons (PauseControls.tsx), and once its own controls card has gone a prompt says so (App.tsx). */
  pauseControls?: PauseCardId | null;
}

/** The stretches with a pause-menu controls card (PauseControls.tsx). */
export type PauseCardId = 'bike' | 'heli' | 'cart' | 'tragons' | 'broom' | 'sled' | 'orbit' | 'logride';

/** (Truelling Tragons) A hop asked for (wheel up or RB: the car above; wheel down or LB: the car below), taken by the
 *  ride next frame (it keeps its own cooldown); one at a time, the last asked. */
let carHop: 'up' | 'down' | null = null;
export const requestCarHop = (dir: 'up' | 'down') => { carHop = dir; };
export const takeCarHop = () => { const d = carHop; carHop = null; return d; };
/** (Truelling Tragons) Where each lane's hop button sits on screen (game px), updated every frame by the ride. */
export const tragonMarkAt: { x: number; y: number }[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];

/** A QTE's button: the face buttons by position, or left / right. */
export type QteKey = 'A' | 'B' | 'X' | 'Y' | 'LEFT' | 'RIGHT';
/** A QTE's panel: the kind (mash one button, press each shown button in time, alternate left and right, press as the
 *  ring closes on the target), the buttons shown (two for alternate, `next` the one due), the meter (0..1), the time
 *  left (0..1), the ring's size (1 out wide .. 0 shut) and the target band on it, which step of how many, whose cart,
 *  and a flash for a beat passed or failed. */
export interface QteUi {
  kind: 'mash' | 'press' | 'alternate' | 'ring';
  keys: QteKey[]; next?: number;
  fill: number; time: number;
  ring?: number; band?: [number, number];
  step: number; steps: number; name: string;
  flash?: 'good' | 'bad' | null;
}

let ui: M2Ui = { near: null, map: null, nearExit: false, notice: null };
const listeners = new Set<() => void>();
let travel: ((dest: string) => void) | null = null;

export const getUi = () => ui;
export const setUi = (patch: Partial<M2Ui>) => {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof M2Ui)[]) if (ui[k] !== patch[k]) { changed = true; break; }
  if (!changed) return;
  ui = { ...ui, ...patch };
  listeners.forEach(l => l());
};
export const subscribeUi = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

/** Where the app goes when a stage asks to leave ('hub', 'pen', or a land's id). */
export const onTravel = (fn: (dest: string) => void) => { travel = fn; };
let leaving = false;
/** Off somewhere (a door, a portal): from then till the next stage is built, he's not in control, nothing he's doing
 * carries on (a weapon held down has to be pressed again over there). */
export const goTo = (dest: string) => { leaving = true; travel?.(dest); };
// (dev builds: for tools/perf's scenarios, a way somewhere without walking there)
if (import.meta.env.DEV) (window as unknown as { __m2GoTo: typeof goTo }).__m2GoTo = goTo;

/**
 * The state of his pants (shitty, blown off: game/player/gut.ts) goes with him through a door: it's only dying that
 * gets him a clean pair (unlike Meathead 1, he never goes home between stages). Taken as he leaves, put back as the
 * next room's built.
 */
let carriedGut: import('../m1/types').Player['gut'] | undefined;
export const carryGut = (gut: import('../m1/types').Player['gut'] | undefined) => {
  carriedGut = gut ? { t: 0, stage: gut.stage, at: gut.at, debris: undefined, rearmed: gut.rearmed, washed: gut.washed } : undefined;
};
export const takeGut = () => { const g = carriedGut; carriedGut = undefined; return g; };
export const isLeaving = () => leaving;
/** (the next stage built: he's arrived) */
export const arrived = () => { leaving = false; };

// ---------------------------------------------------------------------------------------------------------------
// Progress: what he's done, kept here in the one place (for saving, later). In memory for now.

/** The lands he's cleared (their boss beaten: lands.ts ids). */
const cleared = new Set<string>();
const progressListeners = new Set<() => void>();
/** A land's boss is beaten: the land's cleared (the day goes on: timeOfDay.ts). */
export const markLandCleared = (id: string) => { if (cleared.has(id)) return; cleared.add(id); progressListeners.forEach(l => l()); };
export const isLandCleared = (id: string) => cleared.has(id);
/** How many lands he's cleared (0..9). */
export const landsCleared = () => cleared.size;
/** Every land he's cleared (for a save). */
export const clearedLands = () => [...cleared];
/** Put back from a save. */
export const restoreClearedLands = (ids: string[]) => { cleared.clear(); ids.forEach(id => cleared.add(id)); progressListeners.forEach(l => l()); };
export const subscribeProgress = (l: () => void) => { progressListeners.add(l); return () => { progressListeners.delete(l); }; };

/** How each land's boss died (the park map's obituaries, parkmap/data.ts): by his weakness or any other way, by land.
 *  Marked as the boss's death plays (the latest wins: a rematch's re-kill rewrites it). A cleared land with nothing
 *  marked (an older save) reads as the normal death. */
export type BossDeath = 'normal' | 'weakness';
const deaths = new Map<string, BossDeath>();
export const markBossDeath = (land: string, weakness: boolean) => { deaths.set(land, weakness ? 'weakness' : 'normal'); };
/** How his boss died, or null: still alive (the land's not cleared). */
export const bossDeath = (land: string): BossDeath | null => deaths.get(land) ?? (cleared.has(land) ? 'normal' : null);
/** All of it (for a save); put back from one. */
export const allBossDeaths = () => Object.fromEntries(deaths) as Record<string, BossDeath>;
export const restoreBossDeaths = (o: Record<string, BossDeath>) => { deaths.clear(); Object.entries(o).forEach(([k, v]) => deaths.set(k, v)); };

/** What a cleared land keeps for its revisits beyond being cleared (how its boss was left: the queen's pieces where they
 *  landed), by key. For the playthrough (state.stageMemo goes with each visit; this doesn't). */
const kept = new Map<string, string>();
export const keepForRevisits = (key: string, value: string | null) => { if (value === null) kept.delete(key); else kept.set(key, value); };
export const keptForRevisits = (key: string) => kept.get(key) ?? null;
/** All of it (for a save); put back from one. */
export const allKept = () => Object.fromEntries(kept);
export const restoreKept = (o: Record<string, string>) => { kept.clear(); Object.entries(o).forEach(([k, v]) => kept.set(k, v)); };

/** Each land's boss's weapon: clearing the land gets it him. */
export const LAND_WEAPON: Record<string, import('../m1/types').WeaponType> = {
  adventure: 'CROSSBOW', frontier: 'FLINTLOCK', fantasy: 'SPELLBOOK', hollywood: 'STUNT_CAR', cartoon: 'MALLET',
  space: 'SPAWNER', spooky: 'SOUL_SUCKER', foreign: 'SOUVENIR',
};
/** The weapons he's got this playthrough: the ray gun, and every cleared land's boss's (worked out from the lands
 *  cleared: the one thing that's kept). */
export const ownsWeapon = (w: import('../m1/types').WeaponType) => w === 'GUN' || [...cleared].some(id => LAND_WEAPON[id] === w);

/** A boss just died (the walk-away's on): back at the hub after it, everything's topped up. Taken once. */
let bossKill = false;
export const noteBossKill = () => { bossKill = true; };
export const takeBossKill = () => { const k = bossKill; bossKill = false; return k; };

/** (Wilderness Land's spin, after Tucker's walk-away) The way in again from the parking lot: set going there
 *  (goTo('intro')), read by the intro as it's built, put down once he's out of it (the gate, or SKIP INTRO). */
let walkBack = false;
export const setWalkBack = (on: boolean) => { walkBack = on; };
export const walkBackOn = () => walkBack;

/** (the checkpoint-skip cheat) Where in the land he's going into to start: taken once, by the land, as it's built. */
let startCheckpoint: number | null = null;
export const setStartCheckpoint = (cp: number | null) => { startCheckpoint = cp; };
export const takeStartCheckpoint = () => { const cp = startCheckpoint; startCheckpoint = null; return cp; };
