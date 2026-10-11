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
  /** (the checkpoint-skip cheat) A land picked on the map: where in it to start, being asked. */
  pick?: string | null;
  /** (the hub) At the way back out to America USA. */
  nearAmerica?: boolean;
  /** Where he is, for the HUD's and the pause menu's look (hudThemes.tsx). */
  zone?: import('./hudThemes').Zone;
  /** Stuck with the weapon he's got (the mine cart): no switching, by any button, wheel or the pause menu. */
  noSwitch?: boolean;
  /** What up does right here, if anything (a lever to pull...): its prompt (a land's own; reset each frame). */
  upPrompt?: string | null;
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

/** Each land's boss's weapon: clearing the land gets it him. */
const LAND_WEAPON: Record<string, import('../m1/types').WeaponType> = {
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

/** (the checkpoint-skip cheat) Where in the land he's going into to start: taken once, by the land, as it's built. */
let startCheckpoint: number | null = null;
export const setStartCheckpoint = (cp: number | null) => { startCheckpoint = cp; };
export const takeStartCheckpoint = () => { const cp = startCheckpoint; startCheckpoint = null; return cp; };
