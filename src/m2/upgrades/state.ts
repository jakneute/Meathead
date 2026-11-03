// Meathead 2's hidden upgrades (SPEC.md, the owner's design): what he's found, kept in the one place.
//
// ---- README, for whoever builds the next phase -------------------------------------------------------------------
//
// WHAT'S HERE: the counts and the armor, a way to hear about them changing, and the pure numbers that follow.
//   healthFinds()  0..5     each +10% max health            setHealthFinds(n)
//   ammoFinds()    0..5     each +10% ammo, every weapon    setAmmoFinds(n)
//   shards()       0..6     every 3 a power cell (2..4)     setShards(n)
//   has(piece)     the 8 armor pieces (ARMOR_PIECES)        setPiece(piece, on)
//   amuletOn()     the amulet's piss-off yell switched on (the pause menu's AMULET ON / OFF; on by default)
//                                                           setAmuletOn(on)
//   amuletActive() has the amulet AND it's switched on: what the yell's code should ask.
//   benMet()       he's met CON-FUCK-TIOUS (any land): later meetups get the short intro    setBenMet(on)
//   followArt()    Ben's taught him THE HIDDEN ART OF FOLLOW-UPS (with his first follow-up piece, any land): later
//                  follow-up pieces just bring it up                                         setFollowArt(on)
//   benGaveCount() pieces Ben's handed over himself (benGave(piece) for one): the meetup count, his backstory's place
//   benSpot(key)   a land's way in to Ben opened for good (Foreign Lands' HALLS OF VALHALLA raised: 'valhalla')
//                                                                                            setBenSpot(key)
//   subscribeUpgrades(fn) / upgradesVersion()   for React (useSyncExternalStore) or anything else that redraws.
//   resetUpgrades()   all zero (a new game).
//   snapshotUpgrades() / restoreUpgrades(raw)   for the save file (save.ts): restore cleans whatever it's handed,
//                     and anything missing or odd reads as zero (old saves have no upgrades at all).
//
// THE NUMBERS (pure: they read the state, change nothing):
//   maxHealth()       100 + 10 per find (150 with all 5)
//   ammoScale()       1 + 0.1 per find (1.5 with all 5): every weapon's capacity times this (constants maxAmmo)
//   powerCells()      2 + floor(shards / 3) (3 at 3, 4 at 6)
//   armorDamageK(move)  1.5 when that move's piece is owned, else 1 (unused on regular enemies: the owner's extra
//                       damage is for bosses only)
//   pieceFor(move)    which piece boosts a move: charge→pauldrons, slide→legs, uppercut→armguards, divekick→sabatons
//   Boss and sub-boss melee (the normalized 150 × share, doubled by the piece): bossMelee.ts.
//
// HOW IT'S WIRED (apply.ts, run once from App.tsx): the engine's hooks (m1 game/core/tuning.ts, constants
// setMaxAmmoScale) read these, so max health, respawns, pickups, ammo refills, the power cells and the HUD all follow.
// Changing the state mid-run (the cheats) also tops the live player's numbers into line (apply.ts).
//
// THE AMULET (Phase C): amulet.ts (the meter, the yell, the rage after it; its README there), AmuletHud.tsx and
// amuletFace.ts (the HUD's face and meter), lines.ts (the yell's line, recorded in its own echoing voice). Through the
// rage after the yell his charge moves and grabs hit harder (not his weapons): amulet.ts rageDamageK() / raged(n),
// tune.ts RAGE_DAMAGE_K (×1.5, times the bulk up's own), asked in bossMelee.ts, apply.ts's melee hook, moves/grab.ts
// and moves/followups.ts.
//
// THE FOLLOW-UPS (Phase D1): moves/followups.ts (the missile, the ground spin and head kick, the ninja drop, the flash
// kick), fed by upgrades/lastHit.ts (noted from apply.ts's melee hook); the hand armor's beatdown in grab.ts
// (handsOnlyFoe); the power rule through tuning.ts setPowerHold (apply.ts).
//
// THE CHEAP SHOT (Phase D2): upgrades/cheapShot.ts (its README: every boss fight asks cheapShotGate once a frame),
// closeUp.ts (the close-up; a boss's own: registerCloseUp), crushedLines.ts (the lines after it, voiced via lines.ts).
//
// HOOKS LEFT FOR LATER PHASES: the follow-ups, spike/pointy immunity, the armguards' invulnerability bypass, the slide
// trip, the helmet, the amulet, the cape and the art should each ask has(piece) (or amuletActive()) where they act;
// nothing here needs to change for them. The move a hit came from: meleeMoveOf(player) (m1 game/core/tuning.ts).
// --------------------------------------------------------------------------------------------------------------------

import type { MeleeMove } from '../../m1/game/core/tuning';

export const ARMOR_PIECES = ['sabatons', 'pauldrons', 'legs', 'armguards', 'hands', 'helmet', 'amulet', 'cape'] as const;
export type ArmorPiece = typeof ARMOR_PIECES[number];
/** What each is called on screen: the junk's own name (the owner: "instead of calling it something generic like 'hand
 *  armor' give it an interesting name, same for all armor pieces"). The equipment tab, the YOU GOT card. */
export const ARMOR_NAMES: Record<ArmorPiece, string> = {
  sabatons: 'COWBELL CLODHOPPERS', pauldrons: 'COCO-NUTS', legs: 'TROPHY SHIN-DIGS', armguards: 'BEEF BRACERS',
  hands: 'MASCOT MITTS', helmet: 'KEGGER HELMET', amulet: 'PISS-OFF PENDANT', cape: 'CLEARANCE CAPE',
};
/** The four pieces that bring a follow-up (the boots' missile, the pads' bonk, the shins' flash kick, the bracers'
 *  ninja drop); the other four don't. */
export const FOLLOW_PIECES: readonly ArmorPiece[] = ['sabatons', 'pauldrons', 'legs', 'armguards'];
/** ...of those, the three that are grabs (Y + B: the missile, the bonk, the ninja drop); the shins' flash kick isn't one. */
export const GRAB_FOLLOW_PIECES: readonly ArmorPiece[] = ['sabatons', 'pauldrons', 'armguards'];
/** The plain part each is (the dev-only cheat panel's little chips). */
export const ARMOR_SHORT: Record<ArmorPiece, string> = {
  sabatons: 'BOOTS', pauldrons: 'PADS', legs: 'SHINS', armguards: 'BRACERS', hands: 'GLOVES', helmet: 'HELMET', amulet: 'AMULET', cape: 'CAPE',
};

export const MAX_HEALTH_FINDS = 5, MAX_AMMO_FINDS = 5, MAX_SHARDS = 6;
/** What each find adds (a share of the base). */
const HEALTH_STEP = 0.1, AMMO_STEP = 0.1;
const BASE_HEALTH = 100, BASE_CELLS = 2, SHARDS_PER_CELL = 3;
/** An armor piece's boost to its move on regular enemies. */
export const ARMOR_DAMAGE_K = 1.5;

interface Upgrades { health: number; ammo: number; shards: number; armor: Set<ArmorPiece>; amulet: boolean; benMet: boolean; benGave: Set<ArmorPiece>; followArt: boolean; benSpots: Set<string> }
let u: Upgrades = { health: 0, ammo: 0, shards: 0, armor: new Set(), amulet: true, benMet: false, benGave: new Set(), followArt: false, benSpots: new Set() };

// ---- who's listening
let version = 0;
const listeners = new Set<() => void>();
const changed = () => { version++; listeners.forEach(f => f()); };
export const subscribeUpgrades = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
/** Goes up on every change (useSyncExternalStore's snapshot). */
export const upgradesVersion = () => version;

const clampInt = (v: unknown, max: number) => (typeof v === 'number' && isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);

// ---- reading
export const healthFinds = () => u.health;
export const ammoFinds = () => u.ammo;
export const shards = () => u.shards;
export const has = (piece: ArmorPiece) => u.armor.has(piece);
export const ownedPieces = () => ARMOR_PIECES.filter(p => u.armor.has(p));
export const amuletOn = () => u.amulet;
export const amuletActive = () => u.armor.has('amulet') && u.amulet;
/** He's met CON-FUCK-TIOUS (in any land): the first meeting's long intro is done with, later ones get the short one. */
export const benMet = () => u.benMet;
/** That land's piece has been handed over by Ben himself (his find done), whatever the cheats have given: the meetup
 *  plays till then (the owner gave himself every piece and found Ben with nothing to say). */
export const benGave = (piece: ArmorPiece) => u.benGave.has(piece);
export const setBenGave = (piece: ArmorPiece) => { lentSet.delete(piece); if (!u.benGave.has(piece)) { u.benGave.add(piece); changed(); } };
/** How many pieces Ben himself has handed over (0..8): this meetup's the (count + 1)th lair he's met in, whatever the
 *  order of the lands (his backstory goes one beat further each one: confucktious/meetup.ts). */
export const benGaveCount = () => u.benGave.size;
/** Ben's taught THE HIDDEN ART OF FOLLOW-UPS (the first follow-up piece he hands over, whichever land): the big beat's
 *  done with, later follow-up pieces just bring it up again. */
export const followArt = () => u.followArt;
export const setFollowArt = (on: boolean) => { if (u.followArt !== on) { u.followArt = on; changed(); } };
/** A land's way in to Ben, opened for good (kept in the save: Foreign Lands' halls, once raised, stay raised). */
export const benSpot = (key: string) => u.benSpots.has(key);
export const setBenSpot = (key: string) => { if (!u.benSpots.has(key)) { u.benSpots.add(key); changed(); } };

// ---- setting (the cheats; the finds, later)
export const setHealthFinds = (n: number) => { const v = clampInt(n, MAX_HEALTH_FINDS); if (v !== u.health) { u.health = v; changed(); } };
export const setAmmoFinds = (n: number) => { const v = clampInt(n, MAX_AMMO_FINDS); if (v !== u.ammo) { u.ammo = v; changed(); } };
export const setShards = (n: number) => { const v = clampInt(n, MAX_SHARDS); if (v !== u.shards) { u.shards = v; changed(); } };
export const setPiece = (piece: ArmorPiece, on: boolean) => {
  // (taken off: no longer lent either; the cheats' toggle on after that is his)
  if (!on) lentSet.delete(piece);
  if (u.armor.has(piece) === on) return;
  if (on) u.armor.add(piece); else u.armor.delete(piece);
  changed();
};
// ---- a piece lent for one of Ben's trials (the owner's "you have to pass the trial to take them"): worn for it, never
// his till it's passed. Never in the save (snapshotUpgrades leaves it out); off him the moment he's anywhere but the
// lair (each lair's unlend, returnLent on the way into the hub), and off on a fresh load.
const lentSet = new Set<ArmorPiece>();
/** Puts the piece on him for the trial if he hasn't got it (true: it's lent now). */
export const lendPiece = (piece: ArmorPiece) => {
  if (u.armor.has(piece)) return lentSet.has(piece);
  lentSet.add(piece); setPiece(piece, true);
  return true;
};
/** Takes a lent piece back off him (nothing, if it wasn't lent, or Ben's handed it over since). */
export const unlendPiece = (piece: ArmorPiece) => {
  if (!lentSet.delete(piece)) return;
  if (!u.benGave.has(piece)) setPiece(piece, false);
};
/** Every lent piece taken back. */
export const returnLent = () => { for (const p of [...lentSet]) unlendPiece(p); };
export const setAmuletOn = (on: boolean) => { if (u.amulet !== on) { u.amulet = on; changed(); } };
export const setBenMet = (on: boolean) => { if (u.benMet !== on) { u.benMet = on; changed(); } };
export const resetUpgrades = () => { lentSet.clear(); u = { health: 0, ammo: 0, shards: 0, armor: new Set(), amulet: true, benMet: false, benGave: new Set(), followArt: false, benSpots: new Set() }; changed(); };

// ---- the numbers
export const maxHealth = () => Math.round(BASE_HEALTH * (1 + HEALTH_STEP * u.health));
export const ammoScale = () => 1 + AMMO_STEP * u.ammo;
export const powerCells = () => BASE_CELLS + Math.floor(u.shards / SHARDS_PER_CELL);
const PIECE_FOR: Record<MeleeMove, ArmorPiece> = { charge: 'pauldrons', slide: 'legs', uppercut: 'armguards', divekick: 'sabatons' };
export const pieceFor = (move: MeleeMove) => PIECE_FOR[move];
/** That move's armor piece owned. */
export const moveArmored = (move: MeleeMove) => u.armor.has(PIECE_FOR[move]);
export const armorDamageK = (move: MeleeMove) => (moveArmored(move) ? ARMOR_DAMAGE_K : 1);

// ---- the save file (save.ts)
export interface UpgradesSave { health: number; ammo: number; shards: number; armor: ArmorPiece[]; amulet: boolean; benMet?: boolean; benGave?: ArmorPiece[]; followArt?: boolean; benSpots?: string[] }
export const snapshotUpgrades = (): UpgradesSave => ({ health: u.health, ammo: u.ammo, shards: u.shards, armor: ownedPieces().filter(p => !lentSet.has(p)), amulet: u.amulet, benMet: u.benMet, benGave: ARMOR_PIECES.filter(p => u.benGave.has(p)), followArt: u.followArt, benSpots: [...u.benSpots] });
/** Whatever was in the file, kept to what makes sense (nothing, or nonsense: zero upgrades). */
export const cleanUpgrades = (raw: unknown): UpgradesSave => {
  const o = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const armor = Array.isArray(o.armor) ? ARMOR_PIECES.filter(p => (o.armor as unknown[]).includes(p)) : [];
  // (a save from before Ben's own record: every piece he had was his to give, so counted as given)
  const gave = Array.isArray(o.benGave) ? ARMOR_PIECES.filter(p => (o.benGave as unknown[]).includes(p)) : armor;
  return { health: clampInt(o.health, MAX_HEALTH_FINDS), ammo: clampInt(o.ammo, MAX_AMMO_FINDS), shards: clampInt(o.shards, MAX_SHARDS), armor, amulet: o.amulet !== false, benMet: o.benMet === true, benGave: gave, followArt: o.followArt === true, benSpots: Array.isArray(o.benSpots) ? (o.benSpots as unknown[]).filter((k): k is string => typeof k === 'string').slice(0, 16) : [] };
};
export const restoreUpgrades = (raw: unknown) => {
  const s = cleanUpgrades(raw);
  lentSet.clear();
  u = { health: s.health, ammo: s.ammo, shards: s.shards, armor: new Set(s.armor), amulet: s.amulet, benMet: !!s.benMet, benGave: new Set(s.benGave ?? []), followArt: !!s.followArt, benSpots: new Set(s.benSpots ?? []) };
  changed();
};
