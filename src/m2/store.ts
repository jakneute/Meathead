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
export const isLeaving = () => leaving;
/** (the next stage built: he's arrived) */
export const arrived = () => { leaving = false; };
