// The pause menu's EQUIPMENT tab (PauseMenu.tsx): what each hidden upgrade is, what it does and how it's worked, and its
// icon. The 8 armor pieces (state.ts ARMOR_PIECES order), then the three finds (max health, ammo, charge shards).
// Behavior as built: SPEC.md and tune.ts. The icons are painted ONCE (the armor's own baked stamps, armorArt.ts) into a
// little canvas each, kept as a data URL: nothing's painted per frame.

import React from 'react';
import type { PadKey } from '../../m1/components/ButtonIcons';
import { ARMOR_PIECES, ARMOR_NAMES, has, FOLLOW_PIECES, type ArmorPiece } from './state';
import { armorStamp, type Stamp } from './armorArt';
import { walkCapeBack } from './walkArmor';
import { CHEAP_STUN, YELL_SHIELD, HELMET_HURT } from './tune';

/** A controls line, as the weapons' are (ChordPrompt). */
export interface EquipControl { pad: PadKey[]; join?: '+' | '/' | '>'; kb?: string[]; mouse?: 'left' | 'right'; label: string }
export interface EquipEntry {
  /** An armor piece, or one of the finds. */
  id: ArmorPiece | 'health' | 'ammo' | 'shards';
  name: string;
  /** Not found yet: all that's said about it. */
  hint: string;
  /** What the junk itself is (an armor piece: the cheap bric-a-brac he's got on; a line or two). */
  junk?: string;
  /** What it does (2-3 short lines' worth). */
  what: string;
  controls?: EquipControl[];
}

const secs = (frames: number) => Math.round(frames / 60);
/** A follow-up: the charge move's B held, then Y (on the keys, the beatdown key as its button's held). */
const FOLLOW = { pad: ['B', 'Y'] as PadKey[], join: '>' as const, kb: ['@special', '@beatdown'] };

const ARMOR_INFO: Record<ArmorPiece, Omit<EquipEntry, 'id' | 'name'>> = {
  sabatons: {
    hint: 'SOMETHING FOR YOUR FEET.',
    junk: 'COWBOY BOOTS BOLTED TOGETHER OUT OF RAILROAD IRON, WITH A COWBELL STRAPPED ON. CLANK, CLANK, DONG.',
    what: 'LONGER DIVE KICK. DIVE KICKS NOW DO MORE DAMAGE THAN BEFORE TO BOSSES. SPIKES CAN\'T TOUCH YOU.',
    controls: [
      { pad: ['DPAD_DOWN', 'B'], join: '+', kb: ['@down', '@special'], label: 'IN THE AIR: DIVE KICK' },
      { ...FOLLOW, label: 'DURING A DIVE KICK: MISSILE (THROW HIM)' },
    ],
  },
  pauldrons: {
    hint: 'SOMETHING FOR YOUR SHOULDERS.',
    junk: 'HALF COCONUTS FOR SHOULDER PADS, FAKE LEOPARD TRIM, A PLASTIC TUSK GLUED ON. GIFT SHOP CHIC.',
    what: 'LONGER SHOULDER CHARGE. SHOULDER CHARGES NOW DO MORE DAMAGE THAN BEFORE TO BOSSES. HORNS AND SPEARS DON\'T STOP IT.',
    controls: [
      { pad: ['B'], kb: ['@special'], label: 'SHOULDER CHARGE' },
      { ...FOLLOW, label: 'DURING A CHARGE: PLANTED (HEAD IN THE DIRT)' },
      { pad: ['B'], kb: ['@special'], label: 'BY A PLANTED HEAD: FIELD GOAL' },
    ],
  },
  legs: {
    hint: 'SOMETHING FOR YOUR SHINS.',
    junk: 'TWO KNOCKOFF GOLD AWARD STATUETTES DUCT-TAPED TO YOUR SHINS. FILM REELS FOR KNEE PADS.',
    what: 'LONGER SLIDE. SLIDE TACKLES NOW DO MORE DAMAGE THAN BEFORE TO BOSSES. NO HITS FROM THE FRONT. TRIPS GUYS AND KEEPS GOING.',
    controls: [
      { pad: ['DPAD_DOWN', 'B'], join: '+', kb: ['@down', '@special'], label: 'SLIDE TACKLE' },
      { pad: ['DPAD_UP'], kb: ['@up'], label: 'PRESS AS YOU HOLD THE SLIDE: FLASH KICK (FREE)' },
    ],
  },
  armguards: {
    hint: 'SOMETHING FOR YOUR FOREARMS.',
    junk: 'CHROME ROBOT BRACERS WITH A SCROLLING LED THAT SAYS "BEEF". BATTERIES NOT INCLUDED. IT WORKS ANYWAY.',
    what: 'HIGHER UPPERCUT. UPPERCUTS NOW DO MORE DAMAGE THAN BEFORE TO BOSSES. HITS GUYS IT USED TO BOUNCE OFF.',
    controls: [
      { pad: ['DPAD_UP', 'B'], join: '+', kb: ['@up', '@special'], label: 'UPPERCUT' },
      { ...FOLLOW, label: 'DURING AN UPPERCUT: NINJA DROP' },
    ],
  },
  hands: {
    hint: 'SOMETHING FOR YOUR HANDS.',
    junk: 'GIANT WHITE CARTOON GLOVES, FOUR FINGERS EACH. SOME MASCOT IS WALKING AROUND BARE-HANDED.',
    what: 'NOW YOU CAN BEAT DOWN REGULAR GUYS YOU COULDN\'T GRAB BEFORE. BEATDOWNS HEAL MORE.',
    controls: [
      { pad: ['Y', 'B'], join: '+', kb: ['@beatdown'], label: 'BEATDOWN' },
      { pad: ['Y', 'B'], join: '+', kb: ['@beatdown'], label: `RIGHT NEXT TO A BOSS: CHEAP SHOT (${secs(CHEAP_STUN)} SEC STUN, ONCE A LIFE)` },
    ],
  },
  helmet: {
    hint: 'SOMETHING FOR YOUR HEAD.',
    junk: 'A SOUVENIR VIKING HELMET WITH TWO BEER CANS ON IT AND A STRAW DOWN TO YOUR MOUTH. THE CANS ARE EMPTY.',
    what: `YOU TAKE ${Math.round((1 - HELMET_HURT) * 100)}% LESS DAMAGE. ANYTHING REGULAR ENEMIES SHOOT OR THROW AT YOUR HEAD BOUNCES OFF. BOSS ATTACKS STILL GET THROUGH.`,
    controls: [
      { pad: ['DPAD_DOWN'], kb: ['@down'], label: 'DUCK: MORE OF YOU COVERED' },
    ],
  },
  amulet: {
    hint: 'SOMETHING TO WEAR AROUND YOUR NECK.',
    junk: 'A BIG PINK PLASTIC PRINCESS JEWEL ON A STRING. FOR AGES 4 AND UP. IT LOOKS GREAT ON YOU.',
    what: `GET BEAT ON ENOUGH AND YOU SCREAM "FUCK OFF": IT HURTS EVERYTHING ON SCREEN. THEN ${secs(YELL_SHIELD)} SEC INVINCIBLE, CHARGES AND GRABS HIT HARDER. TRAPS DON'T COUNT.`,
  },
  cape: {
    hint: 'SOMETHING FOR YOUR BACK.',
    junk: 'A HALLOWEEN STORE VAMPIRE CAPE, STILL CREASED FROM THE BAG. THE PRICE TAG\'S STILL ON IT.',
    what: 'MORE SPEED: YOU MOVE FASTER, EVEN FASTER BULKED UP. MORE JUMP HEIGHT: YOU JUMP HIGHER. AND YOU CAN FLOAT.',
    controls: [
      { pad: ['A'], kb: ['@jump'], label: 'HOLD IN THE AIR: FLOAT' },
    ],
  },
};

export const EQUIP_ENTRIES: EquipEntry[] = [
  ...ARMOR_PIECES.map(p => ({ id: p, name: ARMOR_NAMES[p], ...ARMOR_INFO[p] })),
  { id: 'health', name: 'MAX HEALTH', hint: '', what: 'EVERY ONE YOU FIND: +10 MAX HEALTH.' },
  { id: 'ammo', name: 'MAX AMMO', hint: '', what: 'EVERY ONE YOU FIND: +10% AMMO IN EVERY WEAPON.' },
  { id: 'shards', name: 'CHARGE SHARDS', hint: '', what: 'EVERY 3 YOU FIND MAKE ANOTHER POWER CELL.' },
];
// (the gloves' follow-up line only once he's got a follow-up to use (the boots, the shoulder pads, the shins or the
// bracers: the four follow-up pieces): the owner's "don't mention follow ups in the description for the gloves unless
// the player has learned at least one of them". Read as it's shown)
{
  const hands = EQUIP_ENTRIES.find(e => e.id === 'hands')!, base = hands.what;
  Object.defineProperty(hands, 'what', {
    get: () => (FOLLOW_PIECES.some(has) ? base.replace('BEFORE.', 'BEFORE, AND YOUR FOLLOW-UPS WORK ON THEM TOO.') : base),
  });
}
/** The grid's slots, and how many across. */
export const EQUIP_SLOTS = EQUIP_ENTRIES.length, EQUIP_COLS = 4;

// ---- the icons
const ICON = 48;
const STAMP_OF: Partial<Record<ArmorPiece, Stamp>> = { sabatons: 'sab', pauldrons: 'pauldron', legs: 'statue', armguards: 'bracer', hands: 'glove', helmet: 'helmet', amulet: 'amulet' };
const icons = new Map<ArmorPiece, string | null>();

/** Cuts a canvas down to what's painted on it (a one-off read, at bake time). */
const trimmed = (src: HTMLCanvasElement): [number, number, number, number] => {
  const c = src.getContext('2d');
  if (!c || !src.width || !src.height) return [0, 0, src.width, src.height];
  const d = c.getImageData(0, 0, src.width, src.height).data;
  let x0 = src.width, y0 = src.height, x1 = -1, y1 = -1;
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    if (d[(y * src.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return x1 < 0 ? [0, 0, src.width, src.height] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
};

/** An owned piece's icon (a data URL; painted the first time it's asked for, then kept). Only ask for owned ones: the
 *  cape's drawing shows only while it's owned. */
export const equipIcon = (p: ArmorPiece): string | null => {
  const have = icons.get(p);
  if (have !== undefined) return have;
  if (typeof document === 'undefined') return null;
  // (painted big first, then trimmed and fitted into the icon, square pixels kept)
  const work = document.createElement('canvas');
  work.width = work.height = 160;
  const w = work.getContext('2d');
  if (!w) return null;
  w.imageSmoothingEnabled = false;
  const s = STAMP_OF[p];
  if (s) {
    const img = armorStamp(s);
    if (!img) return null;
    const k = Math.min(150 / img.width, 150 / img.height);
    w.drawImage(img, 5, 5, img.width * k, img.height * k);
  } else {
    // (the cape: its back-on walk-screen drawing, its middle at the canvas's)
    w.save(); w.translate(80, 80 + 127 * 1.3); w.scale(1.3, 1.3); walkCapeBack(w, 0, 0.5, 0); w.restore();
  }
  const [sx, sy, sw, sh] = trimmed(work);
  const out = document.createElement('canvas');
  out.width = out.height = ICON;
  const o = out.getContext('2d');
  if (!o) return null;
  o.imageSmoothingEnabled = false;
  const k = Math.min((ICON - 4) / sw, (ICON - 4) / sh);
  const dw = sw * k, dh = sh * k;
  o.drawImage(work, sx, sy, sw, sh, (ICON - dw) / 2, (ICON - dh) / 2, dw, dh);
  const url = out.toDataURL();
  icons.set(p, url);
  return url;
};

/** The finds' icons: a heart, a bullet, a crystal (plain SVG, flat bands). */
export const FindIcon: React.FC<{ id: 'health' | 'ammo' | 'shards'; size: number; dim?: boolean }> = ({ id, size, dim }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" style={{ opacity: dim ? 0.35 : 1, imageRendering: 'pixelated' }}>
    {id === 'health' && <>
      <path d="M2 4h2V3h3v1h2V3h3v1h2v5h-1v1h-1v1h-1v1h-1v1H9v1H7v-1H6v-1H5v-1H4v-1H3V9H2z" fill="#7F1D1D" />
      <path d="M3 5h1V4h2v1h1v1h2V5h1V4h2v1h1v3h-1v1h-1v1h-1v1H9v1H7v-1H6v-1H5V9H4V8H3z" fill="#DC2626" />
      <path d="M4 5h2v1H5v1H4z" fill="#FCA5A5" />
    </>}
    {id === 'ammo' && <>
      <path d="M6 2h4v1h1v2h1v9H4V5h1V3h1z" fill="#78350F" />
      <path d="M6 3h4v2h1v4H5V5h1z" fill="#F59E0B" />
      <path d="M7 3h1v5H7z" fill="#FDE68A" />
      <path d="M5 9h6v4H5z" fill="#B45309" />
      <path d="M5 10h6v1H5z" fill="#FCD34D" />
    </>}
    {id === 'shards' && <>
      <path d="M8 1h1v2h1v2h1v3h1v3h-1v2h-1v1H9v1H7v-1H6v-1H5v-2H4V8h1V5h1V3h1V1z" fill="#1E3A8A" />
      <path d="M8 3h1v2h1v3h1v3h-1v2H9v1H7v-1H6v-2H5V8h1V5h1V3z" fill="#22D3EE" />
      <path d="M7 5h1v5H7z" fill="#E0FFFF" />
      <path d="M9 8h1v3H9z" fill="#0E7490" />
    </>}
  </svg>
);
