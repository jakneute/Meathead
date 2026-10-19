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

/** What a cleared land keeps for its revisits beyond being cleared (how its boss was left: the queen's pieces where they
 *  landed), by key. For the playthrough (state.stageMemo goes with each visit; this doesn't). */
const kept = new Map<string, string>();
export const keepForRevisits = (key: string, value: string | null) => { if (value === null) kept.delete(key); else kept.set(key, value); };
export const keptForRevisits = (key: string) => kept.get(key) ?? null;
/** All of it (for a save); put back from one. */
export const allKept = () => Object.fromEntries(kept);
export const restoreKept = (o: Record<string, string>) => { kept.clear(); Object.entries(o).forEach(([k, v]) => kept.set(k, v)); };

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

/** (Wilderness Land's spin, after Tucker's walk-away) The way in again from the parking lot: set going there
 *  (goTo('intro')), read by the intro as it's built, put down once he's out of it (the gate, or SKIP INTRO). */
let walkBack = false;
export const setWalkBack = (on: boolean) => { walkBack = on; };
export const walkBackOn = () => walkBack;

/** (the checkpoint-skip cheat) Where in the land he's going into to start: taken once, by the land, as it's built. */
let startCheckpoint: number | null = null;
export const setStartCheckpoint = (cp: number | null) => { startCheckpoint = cp; };
export const takeStartCheckpoint = () => { const cp = startCheckpoint; startCheckpoint = null; return cp; };
