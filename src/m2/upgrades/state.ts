// Meathead 2's hidden upgrades (SPEC.md, the owner's design): what he's found, kept in the one place.
//
// ---- README, for whoever builds the next phase -------------------------------------------------------------------
//
// WHAT'S HERE: the counts and the armor, a way to hear about them changing, and the pure numbers that follow.
//   healthFinds()  0..5     each +10% max health            setHealthFinds(n)
//   ammoFinds()    0..5     each +10% ammo, every weapon    setAmmoFinds(n)
//   shards()       0..6     every 3 a power cell (2..4)     setShards(n)
//   has(piece)     the 8 armor pieces (ARMOR_PIECES)        setPiece(piece, on)
//   amuletOn()     the amulet's piss-off yell switched on (pause menu toggle, a later phase; on by default)
//                                                           setAmuletOn(on)
//   amuletActive() has the amulet AND it's switched on: what the yell's code should ask.
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
// HOOKS LEFT FOR LATER PHASES: the follow-ups, spike/pointy immunity, the armguards' invulnerability bypass, the slide
// trip, the helmet, the amulet, the cape and the art should each ask has(piece) (or amuletActive()) where they act;
// nothing here needs to change for them. The move a hit came from: meleeMoveOf(player) (m1 game/core/tuning.ts).
// --------------------------------------------------------------------------------------------------------------------

import type { MeleeMove } from '../../m1/game/core/tuning';

export const ARMOR_PIECES = ['sabatons', 'pauldrons', 'legs', 'armguards', 'hands', 'helmet', 'amulet', 'cape'] as const;
export type ArmorPiece = typeof ARMOR_PIECES[number];
/** What each is called on screen (the cheat panel; anywhere later). */
export const ARMOR_NAMES: Record<ArmorPiece, string> = {
  sabatons: 'SABATONS', pauldrons: 'PAULDRONS', legs: 'LEG ARMOR', armguards: 'ARMGUARDS', hands: 'HAND ARMOR', helmet: 'HELMET', amulet: 'AMULET', cape: 'CAPE',
};

export const MAX_HEALTH_FINDS = 5, MAX_AMMO_FINDS = 5, MAX_SHARDS = 6;
/** What each find adds (a share of the base). */
const HEALTH_STEP = 0.1, AMMO_STEP = 0.1;
const BASE_HEALTH = 100, BASE_CELLS = 2, SHARDS_PER_CELL = 3;
/** An armor piece's boost to its move on regular enemies. */
export const ARMOR_DAMAGE_K = 1.5;

interface Upgrades { health: number; ammo: number; shards: number; armor: Set<ArmorPiece>; amulet: boolean }
let u: Upgrades = { health: 0, ammo: 0, shards: 0, armor: new Set(), amulet: true };

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

// ---- setting (the cheats; the finds, later)
export const setHealthFinds = (n: number) => { const v = clampInt(n, MAX_HEALTH_FINDS); if (v !== u.health) { u.health = v; changed(); } };
export const setAmmoFinds = (n: number) => { const v = clampInt(n, MAX_AMMO_FINDS); if (v !== u.ammo) { u.ammo = v; changed(); } };
export const setShards = (n: number) => { const v = clampInt(n, MAX_SHARDS); if (v !== u.shards) { u.shards = v; changed(); } };
export const setPiece = (piece: ArmorPiece, on: boolean) => {
  if (u.armor.has(piece) === on) return;
  if (on) u.armor.add(piece); else u.armor.delete(piece);
  changed();
};
export const setAmuletOn = (on: boolean) => { if (u.amulet !== on) { u.amulet = on; changed(); } };
export const resetUpgrades = () => { u = { health: 0, ammo: 0, shards: 0, armor: new Set(), amulet: true }; changed(); };

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
export interface UpgradesSave { health: number; ammo: number; shards: number; armor: ArmorPiece[]; amulet: boolean }
export const snapshotUpgrades = (): UpgradesSave => ({ health: u.health, ammo: u.ammo, shards: u.shards, armor: ownedPieces(), amulet: u.amulet });
/** Whatever was in the file, kept to what makes sense (nothing, or nonsense: zero upgrades). */
export const cleanUpgrades = (raw: unknown): UpgradesSave => {
  const o = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const armor = Array.isArray(o.armor) ? ARMOR_PIECES.filter(p => (o.armor as unknown[]).includes(p)) : [];
  return { health: clampInt(o.health, MAX_HEALTH_FINDS), ammo: clampInt(o.ammo, MAX_AMMO_FINDS), shards: clampInt(o.shards, MAX_SHARDS), armor, amulet: o.amulet !== false };
};
export const restoreUpgrades = (raw: unknown) => {
  const s = cleanUpgrades(raw);
  u = { health: s.health, ammo: s.ammo, shards: s.shards, armor: new Set(s.armor), amulet: s.amulet };
  changed();
};
