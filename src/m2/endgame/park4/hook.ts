// Ned's boss rush (the water park's level 4): the one switch the eight lands' own boss code reads while one of their
// bosses is being refought in hell (park4/refight.ts runs the land's real stage, started at its boss's checkpoint).
// Nothing in here draws or imports a land: the lands' fight code and the shared bits (emptyArena.ts, bossIntro.ts,
// walkAway.ts, store.ts, m1 speech.ts's pickLine) read it, so it stays tiny and has no imports of its own.
//
// What it changes, only while a refight's on (never in the lands themselves):
//   - the boss is there (emptyArena.ts bossGone: false for that land), and his own intro counts as seen (bossIntro.ts),
//     so the land runs its retry path: he walks in, the boss makes his short entrance, the fight's on;
//   - his health is 999 (refightHp: each fight.ts's HP);
//   - his lines are the refight's (the pools swapped in pickLine: refightLines);
//   - his death doesn't rewrite how he died the first time (store.ts markBossDeath, keepForRevisits: the look's keyed off
//     the first kill);
//   - the walk-away doesn't play (walkAway.ts): VICTORY, then back to the lot (refight.ts's onWin).

/** The eight lands' ids (hub/lands.ts), the order the hub's ring has them in. */
export type RefightLand = 'adventure' | 'spooky' | 'space' | 'hollywood' | 'foreign' | 'frontier' | 'fantasy' | 'cartoon';

export interface RefightOn {
  land: RefightLand;
  /** How he looks (stitched up the way he died): 'normal' | 'weakness'; Harry's 'spin' | 'buried' | 'barfed'. */
  look: string;
  /** Harry's only: the statue, raised too: 'shot' (she shot herself) | 'fell' (she came apart). */
  statue?: 'shot' | 'fell';
}

let set: RefightOn | null = null;
/** When the refight's stage last ran (built, ticked or drawn: refight.ts touches it). A refight left any way at all
 *  (the lot, the title, a new file) stops counting a moment later, so nothing of it ever leaks into the lands' own. */
let touchedAt = -1e9;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const live = () => (set && now() - touchedAt < 1500 ? set : null);
/** (park4/refight.ts, every build, tick and draw of the refight's stage) It's still on. */
export const touchRefight = () => { touchedAt = now(); };
/** The refight on now, or null. */
export const refightOn = () => live();
/** (park4/refight.ts) A refight's stage built (its swaps set after), or left (null). */
export const setRefightOn = (r: RefightOn | null) => { if (!r || r.land !== set?.land) swaps.clear(); set = r; if (r) touchRefight(); };
/** A refight's on (of that land's boss, if one's named). */
export const inRefight = (land?: string) => { const on = live(); return !!on && (land === undefined || on.land === land); };

/** The refight's boss health (the owner's: "all bosses have 50 percent more health (999)"); the land's own otherwise. */
export const REFIGHT_HP = 999;
export const refightHp = (base: number) => (live() ? REFIGHT_HP : base);

// ---------------------------------------------------------------------------------------------------------------
// His lines: the land's pools swapped for the refight's (m1 speech.ts pickLine asks here first)

const keyOf = (pool: readonly unknown[]) => pool.join('\u0001');
const swaps = new Map<string, readonly string[]>();
/** (park4/refight.ts) Every line pool of the land's that has a refight one: from (the land's pool, any copy of it) to. */
export const swapLines = (from: readonly string[], to: readonly string[]) => { if (from.length && to.length) swaps.set(keyOf(from), to); };
/** (pickLine) The pool to pick from: the refight's, if this one's swapped. */
export const refightPool = <T,>(pool: readonly T[]): readonly T[] => {
  if (!swaps.size || !live() || !pool.length || typeof pool[0] !== 'string') return pool;
  return (swaps.get(keyOf(pool)) as unknown as readonly T[] | undefined) ?? pool;
};

// ---------------------------------------------------------------------------------------------------------------
// Won: no walk-away (walkAway.ts asks): back to the lot

let won: ((weakness: boolean) => void) | null = null;
export const setRefightWon = (fn: ((weakness: boolean) => void) | null) => { won = fn; };
/** (walkAway.ts playWalkAway) A boss beaten: in a refight, it's handled here (true: no walk-away). */
export const refightBeaten = (weakness: boolean) => { if (!live() || !won) return false; const fn = won; won = null; fn(weakness); return true; };
