// What the game loop tells the React side (the map card, the prompts, where to go next): a little shared state, and
// a way to hear about it changing.

import { holdControlsTillRelease } from '../m1/game/core/heldOff';
import { benGave, type ArmorPiece } from './upgrades/state';

export interface M2Ui {
  /** The hub spot he's standing at (a land's path, or the staff door), or null. */
  near: number | null;
  /** The map's up for this spot, or null. */
  map: number | null;
  /** Near the pen's way back to the hub. */
  nearExit: boolean;
  /** A line across the screen for a moment ("COMING SOON"), and when it was put up. */
  notice: { text: string; at: number; /** How long it's up (ms; 1800 if not said). */ ms?: number } | null;
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
  /** Not his to play right now (a cutscene, VICTORY, dying): no pause menu, no map, no weapon wheel. */
  noPause?: boolean;
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
  /** (the soul sucker) He's kept on trying to suck with the gore bag full: the spray button, to empty some. */
  sprayTip?: boolean;
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
  /** (Truelling Tragons from behind: fantasy/tragons/behind/ride.ts) The card at the bottom: hanging on in a roll (the
   *  lean, a hand off), a roll coming, the first time each thing comes at his track, the controls (BehindCards.tsx). */
  tragonCard?: import('./fantasy/tragons/behind/ride').BvCard | null;
  /** (Truelling Tragons from behind) The button over the next jump or duck coming at his track (where: tragonCueAt). */
  tragonCue?: 'jump' | 'duck' | null;
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
  /** (a hidden armor find: CON-FUCK-TIOUS's gift) The card for the piece he's just got: what it is, what it does, the
   *  buttons (upgrades/PieceGotCard.tsx); null: none. Set by the land each frame it's up. */
  gotPiece?: import('./upgrades/state').ArmorPiece | null;
  /** Its buffer's over: the card's PRESS ANY BUTTON shows (a press closes it). */
  gotPieceReady?: boolean;
  /** A beatdown chord prompt (Y + B, the beatdown key) with this label (CON-FUCK-TIOUS's pebble); null: none. */
  beatPrompt?: string | null;
  /** Button lines to show, each its buttons and a label (CON-FUCK-TIOUS teaching: the trial's charge, the hidden art of
   *  follow-ups); null: none. Shown in his scenes too (it's the lesson, not the HUD). */
  chordTips?: import('./upgrades/equipInfo').EquipControl[] | null;
  /** Where they go: up top (the default), or along the bottom in a row, clear of a screen's own hints (the dino hack's
   *  glyphs: the owner's "make sure the tutorial panel doesn't block the code hints"). */
  chordTipsAt?: 'top' | 'bottom' | null;
  /** A minigame asking first (minigameConfirm.ts): its name, a line, the buttons shown once it takes an answer. */
  minigameAsk?: { title: string; text: string; ready: boolean } | null;
  /** A charge shard just won (upgrades/shardAward.ts, ShardGotCard.tsx): the card's up; `ready` once its buffer's over. */
  gotShard?: { ready: boolean } | null;
  /** A max health find just picked up (upgrades/healthAward.ts, HealthGotCard.tsx): the card's up; `ready` once its buffer's over. */
  gotHealth?: { ready: boolean } | null;
  /** A max ammo find just picked up (upgrades/ammoAward.ts, AmmoGotCard.tsx): the card's up; `ready` once its buffer's over. */
  gotAmmo?: { ready: boolean } | null;
  /** A full-screen minigame's on (Cartoon Land's bumper cars): the HUD's put away for it. */
  hudOff?: boolean;
  /** Cartoon Land's bumper cars: its controls card (bigkid/BumperCard.tsx); `ready` once its buffer's over. */
  bumperCard?: { ready: boolean } | null;
  /** A minigame's controls card (MinigameCard.tsx: Future Land's lock first): its name, its buttons, how it goes;
   *  `ready` once its buffer's over. */
  minigameCard?: { title: string; rows: import('./upgrades/equipInfo').EquipControl[]; text: string; ready: boolean } | null;
}

/** The stretches with a pause-menu controls card (PauseControls.tsx). */
export type PauseCardId = 'bike' | 'heli' | 'cart' | 'tragons' | 'tragonsClassic' | 'broom' | 'sled' | 'orbit' | 'logride' | 'tube';

/** (Truelling Tragons) A hop asked for (wheel up or RB: the car above; wheel down or LB: the car below), taken by the
 *  ride next frame (it keeps its own cooldown); one at a time, the last asked. */
let carHop: 'up' | 'down' | null = null;
export const requestCarHop = (dir: 'up' | 'down') => { carHop = dir; };
export const takeCarHop = () => { const d = carHop; carHop = null; return d; };
/** (Truelling Tragons) Where each lane's hop button sits on screen (game px), updated every frame by the ride. */
export const tragonMarkAt: { x: number; y: number }[] = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
/** (Truelling Tragons from behind) Where the jump / duck cue sits on screen (game px) and how solid it is. */
export const tragonCueAt = { x: 0, y: 0, a: 1 };
/** A button prompt hanging over something in the world (WorldPrompt.tsx reads it on its own frame loop, no re-render):
 *  'kick' (B, by a head in the ground: moves/followups.ts), 'follow' (Y + B, an armor follow-up on offer), or none;
 *  where on screen (game px); when it was last set (performance.now(): gone stale, it's hidden, so a pause or a stretch
 *  that doesn't draw the grabs never leaves one hanging). */
export const worldPrompt: { kind: 'kick' | 'follow' | null; x: number; y: number; at: number } = { kind: null, x: 0, y: 0, at: 0 };

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
/** The announcing cards (closed by a press). */
const CARD_KEYS: (keyof M2Ui)[] = ['gotPiece', 'gotShard', 'gotHealth', 'gotAmmo', 'bumperCard', 'minigameCard', 'minigameAsk', 'introTicket'];
export const setUi = (patch: Partial<M2Ui>) => {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof M2Ui)[]) if (ui[k] !== patch[k]) { changed = true; break; }
  if (!changed) return;
  // (a card that announces something taken down: the button that closed it doesn't go on to act: m1 heldOff.ts)
  if (CARD_KEYS.some(k => k in patch && patch[k] == null && ui[k] != null)) holdControlsTillRelease();
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
export const carryGut = (p: import('../m1/types').Player) => {
  // (in the space suit: the pants under it, as they were before it went on (space/needle/suit.ts takeOffSuit); the suit
  // itself stays behind, as everything the stage put on him does (state.ts plainLook))
  const gut = p.spaceSuit ? p.spaceSuit.before : p.gut;
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
export const markLandCleared = (id: string) => {
  if (cleared.has(id)) return;
  cleared.add(id);
  // (the last of the alpha's eight is no different: his walk-away, then the hub like any other (the PA's announcement
  // there: hub/announce.ts). The alpha's end is his to pick, out through America USA (hub/index.ts, endWalk.ts))
  progressListeners.forEach(l => l());
};
/** The lands in the alpha (hub/lands.ts LANDS: not imported, to keep the store free of art). */
const ALPHA_LANDS = 8;
/** It's been seen on this file (saved, for the record: a file all-cleared that never saw it plays nothing on CONTINUE;
 *  the way out through America USA is how it's seen, every time). */
let alphaSeen = false;
export const alphaEndSeen = () => alphaSeen;
export const setAlphaEndSeen = (on: boolean) => { alphaSeen = on; };
/** The hub's PA announcements, each once a file (hub/announce.ts): all eight lands cleared; everything (the eight and
 *  all 24 hidden finds: the NEVERENDING FIREWORKS SHOW). Saved. */
let announced = { lands: false, all: false };
export const announcedLands = () => announced.lands;
export const announcedAll = () => announced.all;
export const setAnnounced = (lands: boolean, all: boolean) => { announced = { lands, all }; };
export const isLandCleared = (id: string) => cleared.has(id);
/** How many lands he's cleared (0..9). */
export const landsCleared = () => cleared.size;
/** Every land he's cleared (for a save). */
export const clearedLands = () => [...cleared];
/** Put back from a save. */
export const ALPHA_LAND_COUNT = ALPHA_LANDS;
export const restoreClearedLands = (ids: string[]) => { cleared.clear(); ids.forEach(id => cleared.add(id)); progressListeners.forEach(l => l()); };
export const subscribeProgress = (l: () => void) => { progressListeners.add(l); return () => { progressListeners.delete(l); }; };

/** Collectibles: every land's three hidden finds (the 24: the memory note's tally). Two kept here by id as they're
 *  picked up (the health, ammo and shard awards: upgrades/*Award.ts, Hollywood's plunge), the third CON-FUCK-TIOUS's
 *  armor piece, kept in the upgrades as given by him (upgrades/state.ts benGave: a cheat-given piece doesn't count).
 *  Anything else marked found under a land (a seen-once flag: Area 51's 'seen-a51-kick') isn't a find. A cleared land
 *  with all three found is 100% (the hub flag, the park map's flag, the hub prompt). */
export type FindKind = 'armor' | 'health' | 'ammo' | 'shard';
export const LAND_FINDS: Record<string, { piece: ArmorPiece; finds: readonly (readonly [string, FindKind])[] }> = {
  adventure: { piece: 'pauldrons', finds: [['health-falls', 'health'], ['shard-hack', 'shard']] },
  spooky: { piece: 'cape', finds: [['health-tower', 'health'], ['shard-mash', 'shard']] },
  space: { piece: 'armguards', finds: [['ammo-ladder', 'ammo'], ['shard-lockpick', 'shard']] },
  hollywood: { piece: 'legs', finds: [['ammo-flood', 'ammo'], ['shard-plunge', 'shard']] },
  foreign: { piece: 'helmet', finds: [['health-thames', 'health'], ['ammo-shinkansen', 'ammo']] },
  frontier: { piece: 'sabatons', finds: [['ammo-train', 'ammo'], ['shard-gallery', 'shard']] },
  fantasy: { piece: 'amulet', finds: [['health-keep', 'health'], ['ammo-crypt', 'ammo']] },
  cartoon: { piece: 'hands', finds: [['health-giftshop', 'health'], ['shard-bumper', 'shard']] },
};
/** Each land's total. */
export const LAND_COLLECTIBLES: Record<string, number> = Object.fromEntries(Object.entries(LAND_FINDS).map(([k, v]) => [k, v.finds.length + 1]));
const found = new Map<string, Set<string>>();
export const markCollectibleFound = (land: string, id: string) => {
  const s = found.get(land) ?? new Set<string>();
  if (s.has(id)) return; s.add(id); found.set(land, s); progressListeners.forEach(l => l());
};
/** What he's found in a land, by kind (the armor first, then the rest in the list's order; nothing said of what's
 *  still out there). */
export const findsGot = (land: string): FindKind[] => {
  const d = LAND_FINDS[land];
  if (!d) return [];
  const got = found.get(land), out: FindKind[] = [];
  if (benGave(d.piece)) out.push('armor');
  for (const [id, kind] of d.finds) if (got?.has(id)) out.push(kind);
  return out;
};
export const collectiblesFound = (land: string) => findsGot(land).length;
/** The park's hidden finds, all lands: how many there are (24), and how many he's got. */
export const FINDS_TOTAL = Object.values(LAND_COLLECTIBLES).reduce((a, b) => a + b, 0);
/** A save file's hidden finds (the file select's): the ids it found, the armor Ben's given on it. */
export const findsOnFile = (fileFound: Record<string, string[]>, gave: readonly string[]) =>
  Object.entries(LAND_FINDS).reduce((n, [land, d]) => n + (gave.includes(d.piece) ? 1 : 0) + d.finds.filter(([id]) => fileFound[land]?.includes(id)).length, 0);
export const findsFoundTotal = () => Object.keys(LAND_FINDS).reduce((n, land) => n + collectiblesFound(land), 0);
export const isLandComplete = (land: string) => {
  const total = LAND_COLLECTIBLES[land] ?? 0;
  return cleared.has(land) && total > 0 && collectiblesFound(land) >= total;
};
/** All of it (for a save); put back from one. */
export const allFound = () => Object.fromEntries([...found].map(([k, v]) => [k, [...v]])) as Record<string, string[]>;
export const restoreFound = (o: Record<string, string[]>) => { found.clear(); Object.entries(o).forEach(([k, v]) => found.set(k, new Set(v))); progressListeners.forEach(l => l()); };

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

// ---------------------------------------------------------------------------------------------------------------
// The endgame (endgame/): out through America USA with every land cleared, past the point of no return

/** Where he's got to in the endgame: an endgame stage (endgame/stages.ts id) and a checkpoint in it; null, not in it.
 *  Set the moment he walks out of the hub through America USA (the hub's behind him for good), saved (save.ts), and
 *  CONTINUE takes him there. */
let endgame: import('./endgame/stages').EndgameRecord | null = null;
export const endgameAt = () => endgame;
export const inEndgame = () => endgame !== null;
/** (the rematches done, level 4's, are kept across a move on: only null clears them) */
export const setEndgameAt = (at: import('./endgame/stages').EndgameRecord | null) => { endgame = at ? { ...at, rematches: at.rematches ?? endgame?.rematches } : null; if (endgame && !endgame.rematches) delete endgame.rematches; };
/** (the prologue of the epilogue) The way in walked backward, out of the park to his truck: set going there
 *  (goTo('intro')), read by the intro as it's built (intro/walkOut.ts). */
let walkOut = false;
export const setWalkOut = (on: boolean) => { walkOut = on; };
export const walkOutOn = () => walkOut;
