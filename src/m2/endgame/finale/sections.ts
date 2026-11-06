// THE KAIJU FINALE's run, as data: AMERICA USA on the way in, then 16 sections, two per land, in the hub's ring order
// from Hollywood (the owner's: "hollywood, then fairy, etc"). Each section: its throw target (the half's landmark a
// stunned boss is thrown into: the whole thing collapses), the other major landmarks stepped on and flattened as he
// walks over them (the owner's: "any major landmark isn't spared"), its weakness weapon (cycling section to section,
// each weapon twice, never twice running: the first half of a land the weakness its own boss had, the second the weapon
// won there; FOREIGN swapped so the crossbow doesn't come twice in a row), its ground's shape, and the two bosses'
// attack mix (a different mix each half, so 16 in a row aren't the same fight).
//
// Pure data (no drawing: landmarkArt.ts paints, landmarks.ts runs them).

import type { WeaponType } from '../../../m1/types';
import * as A from './landmarkArt';

type Ctx = CanvasRenderingContext2D;
export type Land = 'america' | 'hollywood' | 'fantasy' | 'adventure' | 'foreign' | 'space' | 'frontier' | 'spooky' | 'cartoon';

export interface LandmarkDef {
  id: string;
  /** As the game spells it (signs, the report). */
  name: string;
  land: Land;
  /** Its box: `w` wide about its foot's middle, `h` tall. */
  w: number; h: number;
  paint: (g: Ctx) => void;
  /** How it comes down: sinks into its own dust in slices; topples over (a tower: it's turned); the throw's own. */
  fall: 'sink' | 'topple';
  /** Its rubble's and debris's colors. */
  debris: string[];
  /** Fire after (dimmed, no glow: the finale's wrecks). */
  fire?: boolean;
}

const lm = (id: string, name: string, land: Land, w: number, h: number, paint: (g: Ctx) => void, debris: string[], fall: 'sink' | 'topple' = 'sink', fire = false): LandmarkDef => ({ id, name, land, w, h, paint, debris, fall, fire });

export const LANDMARKS: Record<string, LandmarkDef> = Object.fromEntries([
  lm('america', 'AMERICA USA', 'america', 270, 76, A.paintAmerica, ['#F1EDE4', '#B4533A', '#1D4ED8', '#DC2626']),
  // HOLLYWOOD LAND
  lm('blvd', 'HAPPYWOOD BOULEVARD', 'hollywood', 224, 60, A.paintBlvd, ['#E8DCC4', '#D9A878', '#A8503A', '#F2D27A'], 'sink', true),
  lm('chinaish', "GROWMAN'S CHINA-ISH THEATRE", 'hollywood', 96, 62, A.paintChinaish, ['#9A2A22', '#2E6A4A', '#C8382C']),
  lm('thrones', 'THRONES OF THE STARS', 'hollywood', 300, 116, A.paintThrones, ['#C81E1E', '#6A1410', '#F8FAFC', '#E8EEF0'], 'sink', true),
  lm('warehouse', "THE REVENGERS' WAREHOUSE", 'hollywood', 156, 58, A.paintWarehouse, ['#8E969C', '#8A3A22', '#2FBF4A'], 'sink', true),
  lm('backlot', 'THE BACKLOT', 'hollywood', 180, 44, A.paintBacklot, ['#8A3A2A', '#9A6A3A', '#E8E0C8']),
  lm('hwtower', 'THE HAPPYWOOD WATER TOWER', 'hollywood', 44, 96, A.paintHwTower, ['#9AA4AC', '#4A5058'], 'topple'),
  lm('disaster', 'DISASTER: THE RIDE', 'hollywood', 112, 64, A.paintDisaster, ['#A8A29A', '#5A544E', '#F8E8B0'], 'sink', true),
  lm('hwsign', 'THE HAPPYWOOD SIGN', 'hollywood', 224, 56, A.paintHwSign, ['#F8FAFC', '#9A8A5A', '#5A4A34']),
  lm('stunt', "STUNTMAN STEVE'S STUPENDOUS STUNTERY", 'hollywood', 304, 112, A.paintStunt, ['#6A6E78', '#3A3A40', '#F59E0B', '#DC2626'], 'sink', true),
  // FAIRY LAND
  lm('hogsmeat', 'HOGSMEAT', 'fantasy', 186, 60, A.paintHogsmeat, ['#E8D8B8', '#4A3A5A', '#F8FAFC']),
  lm('fairywheel', 'THE FAIRY WHEEL', 'fantasy', 104, 112, A.paintFairyWheel, ['#E0B4F0', '#F472B6', '#C084FC']),
  lm('glen', 'THE ENCHANTED GLEN', 'fantasy', 140, 56, A.paintGlen, ['#DC2626', '#A8784A', '#60A5FA']),
  lm('tragons', 'TRUELLING TRAGONS', 'fantasy', 204, 84, A.paintTragons, ['#E8B020', '#DC2626', '#3B82F6']),
  lm('broomport', 'THE BROOM PORT', 'fantasy', 156, 80, A.paintBroomPort, ['#7A6A8A', '#1E1B4B']),
  lm('pixiecastle', "THE GREAT PIXIE'S CASTLE", 'fantasy', 204, 164, A.paintPixieCastle, ['#C8B8E0', '#3B5BBF', '#F472B6']),
  // JUNGLE LAND
  lm('bigtree', 'THE GIANT TREE', 'adventure', 80, 112, A.paintBigTree, ['#6A4424', '#2E7A3A']),
  lm('cruise', 'THE JUNGLE CRUISE', 'adventure', 172, 48, A.paintCruise, ['#F8FAFC', '#15803D', '#A8784A']),
  lm('temple', 'TEMPLE OF THE JAGUAR', 'adventure', 164, 104, A.paintTemple, ['#9A9A8E', '#4A4A42', '#4A7A3A']),
  lm('dinopark', 'PRE-HYSTERIC PARK', 'adventure', 204, 62, A.paintDinoPark, ['#6A6A6A', '#FDE047', '#8A6A3A']),
  lm('rexpaddock', 'THE T. REX PADDOCK', 'adventure', 152, 74, A.paintRexPaddock, ['#7A7A7A', '#4A6A3A']),
  lm('kabooma', 'MOUNT KABOOMA', 'adventure', 204, 100, A.paintKabooma, ['#7A5A4A', '#F97316', '#5A3E30']),
  // FOREIGN LANDS (the owner's count: the pavilions are one landmark, the world monuments two)
  lm('monumentsA', 'WORLD MONUMENTS (ONE)', 'foreign', 292, 112, A.paintMonumentsA, ['#8A6A4A', '#C8A06A', '#D8C49A']),
  lm('pavilions', 'THE WORLD SHOWCASE PAVILIONS', 'foreign', 420, 82, A.paintPavilions, ['#C89A5A', '#C81E1E', '#E8E0D0', '#3B5BBF']),
  lm('libertydig', 'THE AMERICA DIG', 'foreign', 136, 50, A.paintLibertyDig, ['#8A6A4A', '#A8A090']),
  lm('monumentsB', 'WORLD MONUMENTS (TWO)', 'foreign', 316, 90, A.paintMonumentsB, ['#F1EDE4', '#D8B878', '#6A6A62']),
  // FUTURE LAND
  lm('futuresquare', 'THE PEOPLE MOVER', 'space', 204, 60, A.paintFutureSquare, ['#F1F5F9', '#14B8A6', '#F97316']),
  lm('atom', 'THE GIANT ATOM', 'space', 96, 96, A.paintAtom, ['#C4B5FD', '#CBD5E1', '#7C3AED']),
  lm('voyage', 'VOYAGE TO 2010', 'space', 124, 64, A.paintVoyage, ['#E2E8F0', '#0EA5E9', '#F97316']),
  lm('monorail', 'THE LAGOON MONORAIL', 'space', 244, 60, A.paintMonorail, ['#CBD5E1', '#F8FAFC', '#DC2626']),
  lm('xenoscare', 'XENOSCARE', 'space', 104, 56, A.paintXenoscare, ['#3F3F46', '#D6D3D1', '#16A34A']),
  lm('needle', 'SPACE NEEDLE 2', 'space', 80, A.NEEDLE_H, A.paintNeedle, ['#F1F5F9', '#38BDF8', '#94A3B8'], 'topple'),
  // WILDERNESS LAND
  lm('station', 'LONESOME PINE STATION', 'frontier', 164, 52, A.paintStation, ['#9A6A3A', '#1F2937', '#8A6A3A']),
  lm('rockies', 'THE ROCKIES (PAINTED)', 'frontier', 204, 80, A.paintRockies, ['#7A8AA0', '#F8FAFC', '#8A6A44']),
  lm('gulch', 'SAWDUST GULCH', 'frontier', 252, 80, A.paintGulch, ['#9A6A3A', '#F8FAFC', '#4A2E14'], 'sink', true),
  lm('mine', 'THE MOTHER LODE MINE', 'frontier', 220, 64, A.paintMine, ['#7A6A54', '#6A4A2A', '#8A3A2A']),
  lm('timber', 'TIMBER TUMBLE', 'frontier', 224, 116, A.paintTimber, ['#8A7A5A', '#1F5A3A', '#60A5FA']),
  // SPOOKY LAND
  lm('spookytown', 'THE TOWN SQUARE', 'spooky', 190, 60, A.paintSpookyTown, ['#5A5468', '#3A2A4A', '#A3E635']),
  lm('kiddie', 'THE KIDDIE RIDES', 'spooky', 130, 72, A.paintKiddie, ['#1F1A24', '#7C3AED', '#9A94A8']),
  lm('dracula', "DRACULA'S OTHER CASTLE", 'spooky', 204, 152, A.paintDracula, ['#8A8098', '#4A3A6A', '#DC2626'], 'sink', true),
  lm('firstcastle', "DRACULA'S FIRST CASTLE", 'spooky', 164, 100, A.paintFirstCastle, ['#6A6478', '#3A2A4A']),
  lm('giftshop', 'THE HELL GIFT SHOP', 'spooky', 104, 60, A.paintGiftShop, ['#6A3A2A', '#F97316']),
  lm('hellevator', 'THE ELEVATOR TO HELL', 'spooky', 64, 162, A.paintHellevator, ['#8A8098', '#7F1D1D', '#4A3A6A'], 'sink', true),
  // CARTOON LAND
  lm('silly', 'SILLYVILLE SQUARE', 'cartoon', 196, 64, A.paintSilly, ['#F472B6', '#C084FC', '#FDE047']),
  lm('cwtower', 'THE CARTOON LAND WATER TOWER', 'cartoon', 52, 100, A.paintCwTower, ['#F472B6', '#7C3AED', '#C084FC'], 'topple'),
  lm('studio', 'THE MAGIC OF CARTOONS', 'cartoon', 124, 60, A.paintStudio, ['#FDE68A', '#60A5FA', '#7C2D12']),
  lm('whitehouse', 'THE WACKY WHITE HOUSE', 'cartoon', 164, 72, A.paintWhiteHouse, ['#F8FAFC', '#A8A8B0', '#94A3B8']),
  lm('bigkid', 'THE BIG-KID ZONE', 'cartoon', 140, 70, A.paintBigKid, ['#22D3EE', '#A3E635', '#F0ABFC']),
  lm('punchy', 'PUNCHY & KICKY', 'cartoon', 124, 84, A.paintPunchy, ['#FDE047', '#9CA3AF', '#111827']),
  lm('amphi', 'THE UBX AMPHITHEATER', 'cartoon', 184, 90, A.paintAmphi, ['#E5E7EB', '#7C2D12', '#DC2626'], 'sink', true),
].map(d => [d.id, d]));

// ---------------------------------------------------------------------------------------------------------------
// The weaknesses

export interface Weak {
  w: WeaponType;
  /** Ben's lines' key (finale/lines.ts BEN_WEAPON). */
  ben: string;
  /** A per-boss split (the spellbook's elements: the owner's "ice hits satan, fire hits widow, lightning hits whatever
   *  it wants"): the moves (endgameDamage.ts tags) that count on each; unset, any of the weapon's do. */
  satan?: string[];
  widow?: string[];
}
const SPLIT: Weak = { w: 'SPELLBOOK', ben: 'SPELLBOOK:split', satan: ['comet', 'bolt', 'bulk'], widow: ['meteor', 'bolt', 'bulk'] };
const weak = (w: WeaponType): Weak => ({ w, ben: w });

// ---------------------------------------------------------------------------------------------------------------
// The two bosses' moves (bosses.ts runs them)

export type SatanMove = 'leap' | 'breath' | 'fireballs' | 'claw' | 'rain';
export type WidowMove = 'hop' | 'laser' | 'lowlaser' | 'ufos' | 'butt';

export interface SectionDef {
  key: string;
  land: Exclude<Land, 'america'>;
  half: 1 | 2;
  /** On the land's banner as he comes into it (the first half), and the test picker. */
  title: string;
  /** How far it runs (world px; he walks about 270 a second). */
  len: number;
  weak: Weak;
  /** Its throw target, and where along it (its middle, from the section's start). */
  throwAt: string; throwRx: number;
  /** The landmarks stepped on (their middles, from the start). */
  stomps: [string, number][];
  /** The ground's shape: [from the start, height over the base line] (eased between). */
  ground: [number, number][];
  satan: SatanMove[]; widow: WidowMove[];
  /** A set piece of its own (the Space Needle's fall: the Florida mini-cutscene). */
  set?: 'needle';
}

const S = (key: string, land: SectionDef['land'], half: 1 | 2, title: string, len: number, w: Weak, throwAt: string, throwRx: number, stomps: [string, number][], ground: [number, number][], satan: SatanMove[], widow: WidowMove[], set?: 'needle'): SectionDef =>
  ({ key, land, half, title, len, weak: w, throwAt, throwRx, stomps, ground, satan, widow, set });

/** AMERICA USA, the way in (no fight: they're ahead, he stomps it flat going after them). */
export const AMERICA_LEN = 1200, AMERICA_RX = 640;

export const SECTIONS: SectionDef[] = [
  // HOLLYWOOD: the boulevard flat, the hotel; then THRONES OF THE STARS (the owner's first throw). Then the warehouse,
  // the backlot, the water tower, DISASTER: THE RIDE, the sign up its hill; then Steve's stadium (the owner's second).
  S('h1', 'hollywood', 1, 'HOLLYWOOD LAND', 1750, SPLIT, 'thrones', 1360, [['blvd', 330], ['chinaish', 760]], [[0, 0], [500, 0], [900, -10], [1200, 0]], ['leap', 'breath', 'fireballs'], ['hop', 'laser', 'butt']),
  S('h2', 'hollywood', 2, 'HOLLYWOOD LAND', 1900, weak('STUNT_CAR'), 'stunt', 1500, [['warehouse', 260], ['backlot', 560], ['hwtower', 800], ['disaster', 980], ['hwsign', 1220]], [[0, 0], [1050, 0], [1220, -34], [1380, 0]], ['breath', 'claw', 'rain'], ['lowlaser', 'ufos', 'hop']),
  // FAIRY: HOGSMEAT, the glen, the Fairy Wheel; the dragons, the broom port, the castle on its crag
  S('f1', 'fantasy', 1, 'FAIRY LAND', 1700, weak('FLINTLOCK'), 'fairywheel', 1320, [['hogsmeat', 330], ['glen', 820]], [[0, 0], [600, -20], [900, -20], [1100, 0]], ['fireballs', 'claw', 'leap'], ['laser', 'ufos']),
  S('f2', 'fantasy', 2, 'FAIRY LAND', 1750, weak('SPELLBOOK'), 'pixiecastle', 1380, [['tragons', 330], ['broomport', 760]], [[0, 0], [1000, -6], [1250, -48], [1500, -48]], ['leap', 'rain'], ['hop', 'lowlaser', 'butt']),
  // JUNGLE: the giant tree, the cruise's river, the temple; the dino park, the rex, MOUNT KABOOMA (fiberglass)
  S('j1', 'adventure', 1, 'JUNGLE LAND', 1700, weak('SPAWNER'), 'temple', 1340, [['bigtree', 300], ['cruise', 760]], [[0, 0], [620, 12], [900, 12], [1050, 0]], ['breath', 'claw'], ['hop', 'laser', 'ufos']),
  S('j2', 'adventure', 2, 'JUNGLE LAND', 1800, weak('CROSSBOW'), 'kabooma', 1420, [['dinopark', 320], ['rexpaddock', 820]], [[0, 0], [400, -24], [700, -24], [900, 0]], ['leap', 'fireballs', 'rain'], ['butt', 'lowlaser']),
  // FOREIGN: the monuments (one), the pavilions (the throw); the America dig, the monuments (two, the throw)
  S('o1', 'foreign', 1, 'FOREIGN LANDS', 1900, weak('SOUVENIR'), 'pavilions', 1420, [['monumentsA', 460]], [[0, 0], [1900, 0]], ['claw', 'breath', 'fireballs'], ['ufos', 'hop']),
  S('o2', 'foreign', 2, 'FOREIGN LANDS', 1800, weak('CROSSBOW'), 'monumentsB', 1380, [['libertydig', 520]], [[0, 0], [300, 0], [500, 10], [700, 0], [1100, -18]], ['leap', 'rain'], ['laser', 'lowlaser', 'butt']),
  // FUTURE: the people mover, VOYAGE TO 2010, the atom; the monorail, XENOSCARE, SPACE NEEDLE 2 (the Florida fall)
  S('u1', 'space', 1, 'FUTURE LAND', 1750, weak('MALLET'), 'atom', 1360, [['futuresquare', 320], ['voyage', 800]], [[0, 0], [1750, 0]], ['breath', 'fireballs'], ['laser', 'ufos', 'hop']),
  S('u2', 'space', 2, 'FUTURE LAND', 1800, weak('SPAWNER'), 'needle', 1460, [['monorail', 340], ['xenoscare', 860]], [[0, 0], [600, -14], [1000, -14], [1200, 0]], ['claw', 'leap', 'rain'], ['lowlaser', 'butt'], 'needle'),
  // WILDERNESS: the station, the painted Rockies, SAWDUST GULCH; the mine and trestle, TIMBER TUMBLE
  S('w1', 'frontier', 1, 'WILDERNESS LAND', 1800, weak('SOUL_SUCKER'), 'gulch', 1400, [['station', 320], ['rockies', 800]], [[0, 0], [600, -30], [900, -30], [1150, 0]], ['leap', 'breath'], ['hop', 'butt', 'laser']),
  S('w2', 'frontier', 2, 'WILDERNESS LAND', 1700, weak('FLINTLOCK'), 'timber', 1340, [['mine', 420]], [[0, 0], [250, -40], [550, -40], [750, 0], [1700, 0]], ['fireballs', 'rain', 'claw'], ['ufos', 'lowlaser']),
  // SPOOKY: the town square, the kiddie rides, DRACULA'S OTHER CASTLE; the first castle, the gift shop, the clock tower
  S('s1', 'spooky', 1, 'SPOOKY LAND', 1750, weak('SOUVENIR'), 'dracula', 1380, [['spookytown', 320], ['kiddie', 780]], [[0, 0], [1000, 0], [1200, -20], [1500, -20]], ['breath', 'claw', 'leap'], ['laser', 'hop']),
  S('s2', 'spooky', 2, 'SPOOKY LAND', 1750, weak('SOUL_SUCKER'), 'hellevator', 1400, [['firstcastle', 320], ['giftshop', 800]], [[0, 0], [200, -40], [480, -40], [650, 0]], ['rain', 'fireballs'], ['ufos', 'butt', 'lowlaser']),
  // CARTOON: Sillyville, the water tower (stepped on: the owner's own example), the studio, the White House; the
  // big-kid zone, Punchy & Kicky, Stupid Dad's amphitheater
  S('c1', 'cartoon', 1, 'CARTOON LAND', 1900, weak('STUNT_CAR'), 'whitehouse', 1480, [['silly', 300], ['cwtower', 640], ['studio', 960]], [[0, 0], [1900, 0]], ['leap', 'claw', 'breath'], ['hop', 'laser', 'ufos']),
  S('c2', 'cartoon', 2, 'CARTOON LAND', 1800, weak('MALLET'), 'amphi', 1420, [['bigkid', 320], ['punchy', 820]], [[0, 0], [500, -16], [800, 0], [1100, -16], [1300, 0]], ['leap', 'breath', 'fireballs', 'rain'], ['hop', 'laser', 'lowlaser', 'butt', 'ufos']),
];

/** The checkpoint in the fight: after the 8th section (FOREIGN's second: four lands flat). */
export const MID_AFTER = 7;
