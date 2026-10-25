// What plays where in Meathead 2 (MUSIC.md has the full list, and who's composed what). Asked ten times a second:
// the game's state (the stage, the land's section, a boss fight and which, a cutscene, a death, the VICTORY stamp,
// the walk-away, a portal walk) picks a CUE, a song id and the arrangements it'd like; the first of its candidates
// that's been composed (songs/index.ts) plays. Nothing composed for it yet: the next candidate, and in the end
// silence, so every later job only has to add songs.
//
//   'title'                  the theme: the title screen (setMusicTitle); and the last stand-in at the hub, the staff
//                            room, the intro
//   'intro'                  the way in (arrangements: garage, security, america, ticket: the intro's zones)
//   'hub' / 'staff'          the hub (an arrangement per spot round the plaza: hubArr); the staff room
//   'land:<id>'              a land's theme, an arrangement per section (its section ids), crossfading as he goes;
//                            'cutscene' (if it has one) in a cutscene; 'boss' if a boss has no theme of its own
//   'seq:<name>'             a special sequence (a ride, a chase: SEQUENCES below)
//   'boss:<name>'            a boss or sub-boss (bossQuiet.ts markBossFight names it; or SECTION_BOSS); an 'intro'
//                            arrangement (if it has one) while the fight's opening cutscene is on
//   'jingle:victory'         the VICTORY stamp; 'jingle:death' his death
//   'walkaway[:<boss>]'      the walk away from the wreck with the new weapon
//   'portal[:<land>]'        the walk into a land's portal
//
// Ducked under speech, muffled when paused or under water, quieter in a cutscene (unless the song has a 'cutscene'
// arrangement), off with the music volume at zero (the options).

import type { GameState } from '../../m1/game/core/state';
import { getAudioContext } from '../../m1/game/platform/audio';
import { getSettings } from '../../m1/game/settings';
import { isTalking } from '../../m1/game/platform/speech';
import { play, stop, setMix, useContext, prewarm, prewarmRooms, nowPlaying } from './engine';
import { SONGS } from './songs/index';
import { soundTestCue, type Cue, soundTestPicks } from './soundTest';
import { momentOn } from './moments';
import { bossFightName, inBossFight } from '../bossQuiet';
import { getUi, walkBackOn, isLandCleared } from '../store';
import { HUB_STAGE } from '../hub/index';
import { HUB, HUB_CIRC } from '../hub/geometry';
import { SPOTS, LANDS } from '../hub/lands';
import { PEN_STAGE } from '../pen/index';
import { INTRO_STAGE } from '../intro/index';
import { GYM_STAGE } from '../intro/gym/course';
import { ADV_STAGE } from '../adventure/index';
import { SPOOKY_STAGE } from '../spooky/index';
import { SPACE_STAGE } from '../space/index';
import { HOLLYWOOD_STAGE } from '../hollywood/index';
import { FOREIGN_STAGE } from '../foreign/index';
import { FRONTIER_STAGE } from '../frontier/index';
import { FANTASY_STAGE } from '../fantasy/index';
import { CARTOON_STAGE } from '../cartoon/index';
import { STAIRS_B, CEIL_B } from '../space/queen/geo';
import { HOUSE_DOOR } from '../space/crater/layout';
import { LIFT_X0, ACT2_X } from '../space/ride/layout';
import { TX0 } from '../spooky/tower/layout';
import { SHOP_X } from '../spooky/control/geo';
import { coasterOf } from '../hollywood/coaster/state';
import { STATION, x0 as COASTER_X0 } from '../hollywood/coaster/layout';
import { dzOf } from '../hollywood/disaster/state';
import { PRESHOW, THEATER, x0 as DZ_X0 } from '../hollywood/disaster/layout';
import { hvOf, FLUNG_MEMO } from '../hollywood/havoc/state';
import { WIND, QUAKE, CLIMB, DOWNHILL, CHASE_AT, x0 as HV_X0 } from '../hollywood/havoc/layout';
import { realDisastersOn } from '../hollywood/section';
import { townOf } from '../frontier/town/state';
import { trainOf } from '../frontier/train/state';
import { playerRoom } from '../frontier/train/where';
import { engineStep } from '../frontier/train/engine';
import { rideOf } from '../frontier/logride/state';
import { zoneAt, CUTTER_FROM, x0 as LR_X0 } from '../frontier/logride/layout';
import { arenaOf } from '../frontier/arena/state';
import { chaseMusic } from '../frontier/dirtbike/chase';
import { SECTIONS as FA_SECTIONS } from '../fantasy/geometry';
import { squareOf } from '../fantasy/square/state';
import { keepOf } from '../fantasy/keep/state';
import { wheelOf } from '../fantasy/wheel/state';
import { tragonsOf } from '../fantasy/tragons/state';
import { LANE_ID } from '../fantasy/tragons/layout';
import { inLoop } from '../fantasy/tragons/ride';
import { broomMusic } from '../fantasy/broom/fight';
import { piperMusic } from '../fantasy/bedroom/index';
import { whOf, COLLAPSED_MEMO } from '../cartoon/whitehouse1/state';
import { wh2Of } from '../cartoon/whitehouse2/state';
import { stupidDadMusic } from '../cartoon/amphi/index';

export type { Cue };

/** Each land's stage, by its lands.ts id. */
const LAND_OF_STAGE: Record<string, string> = {
  [ADV_STAGE]: 'adventure', [SPOOKY_STAGE]: 'spooky', [SPACE_STAGE]: 'space', [HOLLYWOOD_STAGE]: 'hollywood', [FOREIGN_STAGE]: 'foreign', [FRONTIER_STAGE]: 'frontier',
  [FANTASY_STAGE]: 'fantasy', [CARTOON_STAGE]: 'cartoon',
};
/** The special sequences: a land's section that's a ride or a chase of its own ('seq:<name>'). */
export const SEQUENCES: Record<string, Record<string, string>> = {
  // (the roof's only till he's tumbled off it: seqOver)
  adventure: { river: 'river', cart: 'mine-cart', roof: 'temple-collapse' },
  // (the clock tower itself, not its loading bay: seqOver)
  spooky: { tower: 'clock-tower' },
  space: { ride: 'space-train' },
  hollywood: { coaster: 'coaster', disaster: 'disaster-ride', havoc: 'havoc' },
  foreign: { heli: 'heli' },
  // (the dirt-bike chase is the TEENAGERS' fight: its music's theirs, below; the trail either side of it is the land's)
  frontier: { train: 'train', logride: 'log-ride' },
  // (the fairy wheel and the broomsticks are sub-bosses: their music's theirs, below)
  fantasy: { tragons: 'tragons' },
};
/** A fight that doesn't name itself: who it is, by land and section. (Future Land's saucer has the whole orbit.) */
export const SECTION_BOSS: Record<string, string> = {
  'adventure:dino': 'trex', 'adventure:clearing': 'safari-artie', 'spooky:hell': 'demon', 'spooky:ballroom': 'donnie-dracula',
  'space:orbit': 'ufo', 'space:queen': 'space-queen', 'hollywood:warehouse': 'ensemble-cast', 'hollywood:stunt': 'stuntman-steve',
  'foreign:heli': 'heli-gauntlet', 'foreign:harry': 'helicopter-harry', 'frontier:dirtbike': 'teenagers', 'frontier:arena': 'tucker',
  'fantasy:wheel': 'fairy-wheel', 'fantasy:broom': 'broomsticks', 'fantasy:bedroom': 'piper',
  // (the five pundits name themselves (pundits.ts markBossFight): two in the White House's first half, three in its second)
  'cartoon:amphi': 'stupid-dad',
};
/** Cartoon Land's pundits: one march between them, an arrangement each (named for him). */
const PUNDITS = new Set(['perot', 'falwell', 'limbaugh', 'dole', 'newt']);
/** Fights whose music is a sequence's (the TEENAGERS are the Road Rash chase), and sections that are all one fight. */
const BOSS_ALSO: Record<string, string> = { teenagers: 'seq:road-rash', 'heli-gauntlet': 'seq:heli' };
const WHOLE_SECTION_FIGHTS = new Set(['space:orbit']);
/** The intro's zones, and the theme's arrangement that stands in for each till the intro's own is written. */
const INTRO_STANDIN: Record<string, string> = { garage: 'lounge', security: 'lounge', america: 'main', ticket: 'calliope' };

interface Cand { song: string; arrs?: string[] }
interface Want { cands: Cand[]; cutscene: boolean }

let state: GameState | null = null;
let stage: string | null = null;
let paused = false;
let timer: ReturnType<typeof setInterval> | null = null;
let last = '';
let lastWasTest = false;
let lastLand: string | null = null;

export const setMusicState = (s: GameState) => { state = s; start(); };
export const setMusicStage = (id: string) => { stage = id; start(); };
export const setMusicPaused = (on: boolean) => { paused = on; };
/** The title screen's up (App.tsx): the theme plays, the game's own cues don't. */
let onTitle = false;
export const setMusicTitle = (on: boolean) => { onTitle = on; if (on) start(); };

const enabled = () => { const s = getSettings(); return s.music > 0 && s.master > 0; };

/** The first candidate that's been composed, in the first arrangement it has of the ones asked for. */
const pick = (cands: Cand[], cutscene: boolean): { cue: Cue; quiet: boolean } | null => {
  for (const c of cands) {
    const s = SONGS[c.song];
    if (!s) continue;
    const have = s.arrangements ?? {};
    const asks = [...(cutscene ? ['cutscene'] : []), ...(c.arrs ?? [])];
    const arr = asks.find(a => a in have) ?? Object.keys(have)[0] ?? 'main';
    return { cue: { song: c.song, arr }, quiet: cutscene && arr !== 'cutscene' };
  }
  return null;
};

/** The land's section he's in (every land keeps it on state.stage). */
const sectionOf = (s: GameState) => (s.stage as { section?: string } | null)?.section ?? null;

/** Jungle Land's sections' own state, as much of it as the music looks at (adventure/cart, adventure/roof). */
interface JungleOwn { cart?: { artie?: { on?: boolean } }; roof?: { scene?: string | null; tumbled?: boolean } }
const jungleOwn = (s: GameState) => ((s.stage as { s?: JungleOwn } | null)?.s ?? {});
/** A sequence's arrangement by what's on in it: on the boat or under it; Artie on his tail in the cart; Artie having
 *  his say on the roof, or the roof coming in. */
const seqArrs = (s: GameState, land: string, sec: string): string[] => {
  if (land === 'hollywood') return hollywoodArrs(s, sec);
  if (land === 'frontier') return frontierArrs(s, sec);
  if (land === 'fantasy') return fantasyArrs(s, sec);
  if (land === 'cartoon') return cartoonArrs(s, sec);
  if (land === 'foreign') return sec === 'heli' ? [heliSeqArr(s)] : [];
  if (land === 'space') {
    // (XENOSCARE, the crater past its door; the basement's stairs' top and the disco; the star sled by where it is:
    // the dark ride, the chain lift, space, and the warehouse once the work lights are on)
    const cx = s.player.pos.x + s.player.width / 2;
    if (sec === 'crater' && cx >= HOUSE_DOOR) return ['xenoscare'];
    if (sec === 'queen' && cx >= STAIRS_B) return ['disco'];
    if (sec === 'ride') {
      const sled = spaceOwn(s).ride;
      if ((sled?.k ?? 0) >= 0.5) return ['warehouse'];
      return [cx < LIFT_X0 ? 'act1' : cx < ACT2_X ? 'lift' : 'space'];
    }
    return [];
  }
  if (land === 'spooky') {
    // (the clock tower going up, or wrecked on the way down; the control section's gift shop, the chase through it)
    if (sec === 'tower') return [spookyOwn(s).tower?.crashed ? 'down' : 'climb'];
    if (sec === 'control' && s.player.pos.x + s.player.width / 2 >= SHOP_X) return ['giftshop'];
    return [];
  }
  if (land !== 'adventure') return [];
  const own = jungleOwn(s);
  if (sec === 'river') return [s.player.swimming ? 'underwater' : 'boat'];
  if (sec === 'cart') return [own.cart?.artie?.on ? 'chase' : 'ride'];
  if (sec === 'roof') return [own.roof?.scene === 'arrive' ? 'artie' : 'run'];
  return [];
};
/** A sequence that's done while he's still in its section (the roof, once he's tumbled off it: the land's again), or
 *  isn't on yet (the clock tower's loading bay: the land's, the bay's old record); the havoc once the tornado's
 *  spent (the revisit's wreckage: the land's 'havoc'). */
const seqOver = (s: GameState, land: string, sec: string) =>
  (land === 'adventure' && sec === 'roof' && !!jungleOwn(s).roof?.tumbled) || (land === 'spooky' && sec === 'tower' && s.player.pos.x + s.player.width / 2 < TX0) ||
  (land === 'hollywood' && sec === 'havoc' && havocSpent(s)) || (land === 'foreign' && sec === 'heli' && !!foreignOwn(s).heli?.over) ||
  (land === 'frontier' && sec === 'train' && trainOf(s).phase === 'still') || (land === 'frontier' && sec === 'logride' && logOver(s)) ||
  (land === 'fantasy' && sec === 'tragons' && (tragonsOf(s).phase === 'arrive' || tragonsOf(s).phase === 'done'));

/** Fairy Land's sections as the music hears them: TRUELLING TRAGONS by the ride (the load hall; out of the station and
 *  up the lift hill; then the car he's on, or hopping to: fire, ice, lightning; in a loop, all three); the castle's base past the broom
 *  port (the runway); her room cleared (a revisit: wrecked). */
const fantasyArrs = (s: GameState, sec: string): string[] => {
  if (sec === 'tragons') {
    const t = tragonsOf(s);
    if (t.phase === 'load') return ['station'];
    if (t.phase === 'dispatch' || (t.phase === 'ride' && t.dist < 4800)) return ['lift'];
    // (locked in a loop, or his dragon in one: all three cars' parts at once)
    if (inLoop(t)) return ['main'];
    return [LANE_ID[t.hop ? t.hop.to : t.lane]];
  }
  if (sec === 'keep' && s.player.pos.x + s.player.width / 2 - FA_SECTIONS.keep.x0 >= 9000) return ['runway'];
  if (sec === 'bedroom' && isLandCleared('fantasy')) return ['wrecked'];
  return [];
};
/** Fairy Land's moments inside a section: Piper on the town's PA (the loudspeaker's scene), the broom port's scene. */
const fantasyMoment = (s: GameState, sec: string): Cand | null => {
  if (sec === 'square') { const st = squareOf(s).scene.step; if (st === 'walk' || st === 'talk' || st === 'fade') return { song: 'land:fantasy', arrs: ['speaker'] }; }
  if (sec === 'keep') { const st = keepOf(s).scene.step; if (st !== 'wait' && st !== 'done') return { song: 'land:fantasy', arrs: ['runway'] }; }
  return null;
};
/** Piper's song by her fight: the door and her purring on the chaise (the intro); him seeing her, fat, ugly (awkward);
 *  enraged on (main; fury in her last third); round the room like a let-go balloon after a flintlock hole; her death. */
const piperArr = (s: GameState) => {
  const m = piperMusic(s);
  if (!m) return 'main';
  if (m.mode === 'dead') return 'death';
  if (m.mode === 'intro') return m.intro === 'sees' || m.intro === 'fat' || m.intro === 'ugly' ? 'awkward' : m.intro === 'rage' || m.intro === 'fight' || m.intro === 'on' ? 'main' : 'intro';
  if (m.act === 'bounce' || m.act === 'flop' || m.act === 'getup') return 'balloon';
  return m.hp <= 1 / 3 ? 'fury' : 'main';
};

/** Wilderness Land's sections as the music hears them: the town's and the log ride's stretches (the HUD's: index.ts
 *  hudZone); the train by where he is on it (the run for the caboose, on top, in a car, in a tunnel, the engine's
 *  scene, the crash); Timber Tumble by where the log is (the platform, the ride, the chain lift, the giant saw, the
 *  sewer, the real river, the sluice into the chipper); the clearing after it is the woods. */
const frontierArrs = (s: GameState, sec: string): string[] => {
  if (sec === 'town') return [getUi().zone ?? 'gulch'];
  if (sec === 'train') {
    const tr = trainOf(s);
    if (tr.phase === 'intro') return ['run'];
    const st = engineStep(s);
    if (st === 'close' || st === 'slump' || st === 'speed' || st === 'crash' || st === 'done') return ['crash'];
    if (st === 'insult' || st === 'rant') return ['engine'];
    if (tr.dark > 0.5) return ['tunnel'];
    return [playerRoom(s, tr) >= 0 ? 'inside' : 'roof'];
  }
  if (sec === 'logride') {
    if (logOver(s)) return ['woods'];
    const r = rideOf(s), L = r.log;
    if (L.mode === 'off' || L.mode === 'scene') return ['station'];
    if (L.mode === 'chipper' || L.mode === 'leap' || r.chip.state !== 'idle') return ['chipper'];
    const z = zoneAt(L.rx);
    if (z === 'sewer') return ['sewer'];
    if (z === 'culvert' || z === 'river') return ['river'];
    if (z === 'sluice') return ['chipper'];
    if (z === 'brk' || L.rx >= CUTTER_FROM) return ['break'];
    if (z === 'lift') return ['lift'];
    return ['ride'];
  }
  return [];
};
/** Timber Tumble done with: jumped clear of the chipper, or walked about the crew's clearing (the woods' music). */
const logOver = (s: GameState) => {
  const L = rideOf(s).log;
  return L.mode === 'done' || (L.mode === 'off' && zoneAt(s.player.pos.x + s.player.width / 2 - LR_X0) === 'clearing');
};
/** Wilderness Land's moments inside a section: the log ride's song off its speakers in the town's queue; the saloon's
 *  BRAWL!; the showdown's duel (the standoff, the wait for the DRAW!, then DRAW! on the call, through the posse and the
 *  announcer's sign-off); and Tucker's fake-out (the hush before he pops, then his song from the jumpscare on, through
 *  the axe tree: its 'intro'). */
const frontierMoment = (s: GameState, sec: string): Cand | null => {
  if (sec === 'town') {
    const tw = townOf(s), d = tw.duel;
    if (getUi().zone === 'logride') return { song: 'seq:log-ride', arrs: ['queue'] };
    if (tw.saloon.state === 'on') return { song: 'seq:brawl' };
    if (d.phase === 'intro') return { song: 'seq:duel', arrs: ['standoff'] };
    if (d.phase === 'duel' && d.t < d.drawAt) return { song: 'seq:duel', arrs: ['tense'] };
    if (d.phase === 'duel' || d.phase === 'posse' || (d.phase === 'won' && !!tw.pa)) return { song: 'seq:draw' };
    return null;
  }
  if (sec === 'arena') {
    const a = arenaOf(s);
    if (a.phase === 'fakeout') return a.step === 'ask' || a.step === 'beat' ? { song: 'land:frontier', arrs: ['hush'] } : { song: 'boss:tucker', arrs: ['intro'] };
    if (a.phase === 'entry' || a.phase === 'entrance') return { song: 'boss:tucker', arrs: ['intro'] };
  }
  return null;
};

/** Foreign Lands' sections' own state, as much as the music looks at (foreign/heli, harry). */
interface ForeignOwn {
  heli?: { phase?: string; over?: boolean; transit?: boolean; cur?: number; flags?: Record<string, boolean>; mechs?: { id: string; st: string }[] };
  harry?: { f?: { crumbled?: boolean } | null };
}
const foreignOwn = (s: GameState) => ((s.stage as { s?: ForeignOwn } | null)?.s ?? {});
/** The helicopter before he takes it, by the ride: the helipad and its queue (the ride's speakers); climbing in and
 *  the lift; the tour; from the boot in Harry on (the landmarks waking). */
const heliSeqArr = (s: GameState) => {
  const h = foreignOwn(s).heli;
  if (!h || h.phase === 'pad') return 'pad';
  if (h.phase === 'board' || h.phase === 'lift') return 'board';
  return h.flags?.shoved ? 'turn' : 'tour';
};
/** The gauntlet's song by the landmark up (rising, fighting, going down: its country's flavor); the goon waves
 *  between; Harry's rocket and the fall. */
const heliArr = (s: GameState) => {
  const h = foreignOwn(s).heli;
  if (!h) return 'main';
  if (h.phase === 'end') return 'down';
  const m = h.mechs?.[h.cur ?? -1];
  return m && !h.transit && (m.st === 'intro' || m.st === 'fight' || m.st === 'dying') ? m.id : 'main';
};
/** A fight's own arrangement, by how it's going (on top of 'intro' in its cutscenes): the saucer's; the gauntlet's
 *  landmark; Harry once the statue's come apart. */
const bossArrs = (s: GameState, boss: string, cutscene: boolean): string[] => {
  if (boss === 'ufo') return [ufoArr(s)];
  if (boss === 'heli-gauntlet') return [heliArr(s)];
  if (boss === 'helicopter-harry' && !cutscene && foreignOwn(s).harry?.f?.crumbled) return ['rage'];
  if (boss === 'teenagers') { const c = chaseMusic(s); return c.outro ? ['outro'] : c.last ? ['last'] : []; }
  if (boss === 'fairy-wheel') return wheelOf(s).qte ? ['qte'] : [];
  if (boss === 'broomsticks') return [broomMusic(s)];
  if (boss === 'piper') return [piperArr(s)];
  if (PUNDITS.has(boss)) return [boss];
  if (boss === 'stupid-dad') return [stupidDadArr(s)];
  return [];
};

/** Cartoon Land's sections as the music hears them: the White House once the screen's down (the bare soundstage, both
 *  halves: 'real'); the amphitheater once the land's cleared (nobody there: 'empty'). */
const cartoonArrs = (s: GameState, sec: string): string[] => {
  if ((sec === 'whitehouse1' || sec === 'whitehouse2') && s.stageMemo[COLLAPSED_MEMO]) return ['real'];
  if (sec === 'amphi' && isLandCleared('cartoon')) return ['empty'];
  return [];
};
/** Cartoon Land's moments inside a section, at full (not the cutscene mix): the transformation (rubbed out, the cutscene's;
 *  drawn back in as the cat, the show's theme); the finale by its step (the Clintons on the cartoon TV; the snow and the
 *  shake; the screen coming down and the cat sliding off him; the bare stage after). */
const FINALE_ARR: Record<string, string> = {
  queasy: 'tv', tvdown: 'tv', bill: 'tv', hillary: 'tv', reply: 'tv', tvoff: 'judder', shake: 'judder', fall: 'down', catslip: 'down', spark: 'down',
  look: 'real', actress: 'real', answer: 'real',
};
const cartoonMoment = (s: GameState, sec: string): Cand | null => {
  if (sec === 'whitehouse1') {
    const st = whOf(s).scene?.step;
    if (st === 'draw' || st === 'look' || st === 'chelsea') return { song: 'land:cartoon', arrs: ['whitehouse1'] };
  }
  if (sec === 'whitehouse2') {
    const st = wh2Of(s).finale?.step;
    if (st && FINALE_ARR[st]) return { song: 'land:cartoon', arrs: [FINALE_ARR[st]] };
  }
  return null;
};
/** DAD GUY's song by his intro and the fight: the show stopped dead, him squinting at Meathead (hush); the family
 *  glitching, him up off the couch, the can crushed (intro); him dragging the couch up front, the fight (main); up off
 *  his crushed couch, pathetic, no family left (intro again: no drums, deflated); his death (hush). */
const stupidDadArr = (s: GameState) => {
  const m = stupidDadMusic(s);
  if (!m) return 'main';
  if (m.fight === 'dead') return 'hush';
  if (m.fight === 'sad') return 'intro';
  if (m.intro === 'walk' || m.intro === 'close' || m.intro === 'sees') return 'hush';
  if (m.intro === 'glitch' || m.intro === 'rise' || m.intro === 'crush') return 'intro';
  return 'main';
};

/** The havoc's tornado spent (the fling's been: havoc/hazards.ts spent()). */
const havocSpent = (s: GameState) => s.stageMemo[FLUNG_MEMO] === '1' || s.checkpoint >= 60 || isLandCleared('hollywood');
/** DISASTER: THE RIDE's narrator's loop, its disasters in order (disaster/show.ts DISASTERS). */
const SHOW_ARR = ['quake', 'volcano', 'tornado', 'blizzard', 'flood', 'wildfire'];
/** Hollywood Land's sequences by what's on in them: THRONES OF THE STARS by the ride (the station's queue, sat on
 *  the parked train, riding, the launch, a stop's staff coming for him); DISASTER: THE RIDE by the room (the queue,
 *  the pre-show, the theater by the disaster on, REAL DISASTERS going, the wreck after); the havoc by the stretch (the
 *  street, the wind, the quake, the flood climb, the blizzard, the tornado's chase, the fling). */
const hollywoodArrs = (s: GameState, sec: string): string[] => {
  const cx = s.player.pos.x + s.player.width / 2;
  if (sec === 'coaster') {
    const co = coasterOf(s), r = co.ride;
    if (r.on) return [r.at !== null ? 'board' : r.name === 'launch' ? 'launch' : 'ride'];
    if (co.stops.some(st => st.phase === 'intro' || st.phase === 'fight')) return ['stop'];
    return [cx - COASTER_X0 < STATION.b ? 'queue' : 'board'];
  }
  if (sec === 'disaster') {
    const rx = cx - DZ_X0, o = dzOf(s);
    if (rx < PRESHOW.a) return ['lobby'];
    if (rx < THEATER.a) return ['preshow'];
    if (o.real.phase === 'on' || rx >= THEATER.b) return ['real'];
    if (o.real.phase === 'done' || realDisastersOn(s)) return ['wrecked'];
    return [o.show.on && o.show.t >= 0 ? SHOW_ARR[o.show.beat] ?? 'theater' : 'theater'];
  }
  if (sec === 'havoc') {
    const rx = cx - HV_X0, hv = hvOf(s);
    if (hv.fling.step !== 'off') return ['fling'];
    if (hv.tornado.on || rx >= CHASE_AT - 100) return ['chase'];
    if (rx >= DOWNHILL.a) return ['blizzard'];
    if (rx >= CLIMB.a) return ['flood'];
    if (rx >= QUAKE[0][0]) return ['quake'];
    if (rx >= WIND[0][0]) return ['wind'];
    return ['street'];
  }
  return [];
};

/** Spooky Land's sections' own state, as much as the music looks at (spooky/dungeon, tower, hell). */
interface SpookyOwn { dungeon?: { room?: string }; tower?: { crashed?: boolean }; hell?: { fin?: { full?: boolean; step?: string } | null } }
const spookyOwn = (s: GameState) => ((s.stage as { s?: SpookyOwn } | null)?.s ?? {});
/** Satan's finale in hell, by its step: the demon whining for his dad and sinking; Satan up out of the lava and
 *  talking; the geyser. (Only the whole scene: stepping on the vent again later is just the ride up.) */
const SATAN_ARR: Record<string, string> = { whine: 'whine', sink: 'whine', leaves: 'whine', rise: 'satan', hi: 'satan', core: 'satan', parting: 'satan', glow: 'satan', launch: 'launch', fade: 'launch' };
/** Spooky Land's moments inside a section: the dungeon's chamber (the doors slammed: its quiet dread, then the ceiling
 *  coming down: the run), and Satan's finale. */
const spookyMoment = (s: GameState, sec: string): Cand | null => {
  const own = spookyOwn(s);
  if (sec === 'dungeon') {
    const room = own.dungeon?.room;
    if (room === 'armed' || room === 'down') return { song: 'seq:ceiling', arrs: [room === 'armed' ? 'ceiling' : 'chase'] };
  }
  if (sec === 'hell') {
    const fin = own.hell?.fin;
    if (fin?.full && fin.step && SATAN_ARR[fin.step]) return { song: 'seq:satan', arrs: [SATAN_ARR[fin.step]] };
  }
  return null;
};

/** Future Land's sections' own state, as much as the music looks at (space/ride, orbit, queen). */
interface SpaceOwn {
  ride?: { k?: number };
  orbit?: { quiet?: boolean; saucer?: { st?: string } | null };
  queen?: { h?: { mode?: string; finale?: boolean; rattle?: unknown; fg?: unknown; chase?: unknown } | null };
}
const spaceOwn = (s: GameState) => ((s.stage as { s?: SpaceOwn } | null)?.s ?? {});
/** The saucer's song by its fight: at it; pissed and the beam; it's got him, the blast, the fall; gone (back up here
 *  after, nothing about). */
const ufoArr = (s: GameState) => {
  const o = spaceOwn(s).orbit, st = o?.saucer?.st;
  if (!st) return o?.quiet ? 'drift' : 'main';
  if (st === 'pissed' || st === 'beam') return 'beam';
  if (st === 'inside' || st === 'boom' || st === 'fall' || st === 'factory' || st === 'gone') return 'down';
  return 'main';
};
/** The basement's stalker song by what she's doing: away (the dark), out (near), on him (the hunt; the stairs). */
const stalkerArr = (s: GameState) => {
  const h = spaceOwn(s).queen?.h;
  if (!h) return 'dark';
  // (the stairs' panic run: heard, not seen: creepy, not the Mega Man chase)
  if (h.chase) return 'panic';
  if (h.finale || ['hunt', 'crouch', 'leap', 'ambush', 'kill'].includes(h.mode ?? '')) return 'hunt';
  return h.mode !== 'away' || h.rattle || h.fg ? 'near' : 'dark';
};

/** How near a spot round the plaza he has to be for the waltz to take its colors (spots are HUB.slot apart). */
const HUB_NEAR = 170;
/** The hub's waltz by the spot round the plaza he's nearest: a land's portal (the land's id), America USA's way in
 *  ('america'), the staff door ('staff'); 'main' between them. The crossfade does the rest as he walks round. */
const hubArr = (s: GameState): string => {
  const cx = s.player.pos.x + s.player.width / 2;
  const round = (((cx - HUB.x0) % HUB_CIRC) + HUB_CIRC) % HUB_CIRC;
  const f = round / HUB.slot - 0.5, i = Math.round(f);
  if (Math.abs(f - i) * HUB.slot > HUB_NEAR) return 'main';
  const spot = SPOTS[((i % SPOTS.length) + SPOTS.length) % SPOTS.length];
  return spot.kind === 'land' ? LANDS[spot.land].id : spot.kind;
};

/** What the game wants on right now. */
const gameWants = (s: GameState | null): Want => {
  const none: Want = { cands: [], cutscene: false };
  // (the alpha's ending (alphaEnd.ts): quiet under the PA; then the theme, triumphant, under THE END?)
  { const m = momentOn('alphaend'); if (m) return m.arg === 'end' ? { cands: [{ song: 'title', arrs: ['main'] }], cutscene: false } : none; }
  // (the title screen: the theme, whatever's behind it)
  if (onTitle) return { cands: [{ song: 'title', arrs: ['main'] }], cutscene: false };
  if (!s || !stage) return none;
  const p = s.player;
  const cutscene = !!p.inCutscene;
  if (s.deathTimer > 0) return { cands: [{ song: 'jingle:death' }], cutscene: false };
  // (the VICTORY lasts the jingle's length (victory.ts), and its last hit's ring carries the first moment of the
  // walk-away's iris before the walk's silence fades it)
  if (momentOn('victory', 700)) return { cands: [{ song: 'jingle:victory' }], cutscene: false };
  // (the walk-in through a portal and the walk-away from the wreck: no music at all (the user's): their own sounds only)
  if (momentOn('walkaway') || momentOn('portal')) return none;

  // (the hub's waltz in the colors of the portal he's at: hubArr)
  if (stage === HUB_STAGE) return { cands: [{ song: 'hub', arrs: [hubArr(s), 'main'] }, { song: 'title', arrs: ['calliope'] }], cutscene };
  if (stage === PEN_STAGE) return { cands: [{ song: 'staff' }, { song: 'title', arrs: ['lounge'] }], cutscene };
  // (his gym, the opening: its own; its cutscenes the same tune, soft)
  if (stage === GYM_STAGE) { const sc = cutscene || !!getUi().introCutscene; return { cands: [{ song: 'gym', arrs: sc ? ['cutscene', 'main'] : ['main'] }, { song: 'staff' }], cutscene: sc }; }
  if (stage === INTRO_STAGE) {
    const zone = getUi().zone ?? 'garage';
    // (the walk back after Wilderness Land: its own arrangement the whole way, if the song has one)
    return { cands: [{ song: 'intro', arrs: walkBackOn() ? ['back', zone] : [zone] },{ song: 'title', arrs: [INTRO_STANDIN[zone] ?? 'main'] }], cutscene: cutscene || !!getUi().introCutscene };
  }
  const land = LAND_OF_STAGE[stage];
  if (!land) return none;
  const sec = sectionOf(s) ?? '';
  // (a set piece's own arrangement of the theme first, if it has one: the river's 'underwater')
  const theme: Cand = { song: `land:${land}`, arrs: [...seqArrs(s, land, sec), sec, 'main'] };
  // A boss or sub-boss
  const named = bossFightName(s);
  const boss = named ?? (inBossFight(s) || WHOLE_SECTION_FIGHTS.has(`${land}:${sec}`) ? SECTION_BOSS[`${land}:${sec}`] : undefined);
  if (boss) {
    const also = BOSS_ALSO[boss];
    return {
      // (the saucer's song follows its fight, the gauntlet's its landmark, Harry's the statue: bossArrs)
      cands: [{ song: `boss:${boss}`, arrs: [...bossArrs(s, boss, cutscene), ...(cutscene ? ['intro', 'main'] : ['main'])] }, ...(also ? [{ song: also }] : []), { song: `land:${land}`, arrs: ['boss', sec, 'main'] }],
      // (a boss's opening cutscene: its 'intro' if it has one, not quieter)
      cutscene: false,
    };
  }
  // Future Land's basement: the queen stalking him in the dark (the user's: atmospheric, creepy)
  if (land === 'space' && sec === 'queen' && p.pos.y + p.height > CEIL_B + 30 && p.pos.x < STAIRS_B) return { cands: [{ song: 'seq:stalker', arrs: [stalkerArr(s)] }, { song: 'land:space', arrs: ['stalker', 'queen'] }], cutscene };
  // Spooky Land's chamber and Satan (a scene, but not quieter: it's his)
  const moment = land === 'spooky' ? spookyMoment(s, sec) : land === 'frontier' ? frontierMoment(s, sec) : land === 'fantasy' ? fantasyMoment(s, sec) : land === 'cartoon' ? cartoonMoment(s, sec) : null;
  if (moment) return { cands: [moment, theme], cutscene: false };
  const seq = SEQUENCES[land]?.[sec];
  // (Hollywood Land's rides are shows he sits through (the coaster's laps, REAL DISASTERS, the fling): their songs at
  // full, by what's on (hollywoodArrs), not the quieter cutscene mix; and the helicopter's tour, the ride's own tape;
  // and Wilderness Land's run for the caboose, the engine's crash, the booth's scene and the chipper's leap; and
  // Truelling Tragons)
  if (seq && !seqOver(s, land, sec)) return { cands: [{ song: `seq:${seq}`, arrs: seqArrs(s, land, sec) }, theme], cutscene: cutscene && land !== 'hollywood' && land !== 'foreign' && land !== 'frontier' && land !== 'fantasy' };
  return { cands: [theme], cutscene };
};

/** Starts making a land's songs in idle time as he arrives (its theme, its sequences, its bosses). */
const warmLand = (land: string | null) => {
  if (!land || land === lastLand) return;
  lastLand = land;
  const ids = [`land:${land}`, `portal:${land}`, ...Object.values(SEQUENCES[land] ?? {}).map(q => `seq:${q}`), ...Object.entries(SECTION_BOSS).filter(([k]) => k.startsWith(land + ':')).map(([, b]) => `boss:${b}`)];
  if (land === 'space') ids.push('seq:stalker');
  if (land === 'spooky') ids.push('seq:ceiling', 'seq:satan');
  if (land === 'frontier') ids.push('seq:brawl', 'seq:duel', 'seq:draw', 'seq:road-rash');
  if (land === 'cartoon') ids.push('boss:perot');
  for (const id of ids) if (SONGS[id]) prewarm(SONGS[id]);
};

const apply = () => {
  const test = soundTestCue();
  if (!enabled()) { if (last) { last = ''; stop(0.3); } return; }
  let cue: Cue | null = null, quiet = false;
  if (test) { cue = test; lastWasTest = true; }
  else if (paused && !lastWasTest) {
    // (paused: whatever was on stays on, muffled; the moments it follows aren't ticking)
    setMix(isTalking(), true, false);
    return;
  } else {
    // (the sound test just shut: back to the game's own, even paused)
    lastWasTest = false;
    const w = gameWants(state);
    const got = pick(w.cands, w.cutscene);
    cue = got?.cue ?? null; quiet = !!got?.quiet;
  }
  const key = cue ? `${cue.song}:${cue.arr ?? ''}${test ? `#${soundTestPicks()}` : ''}` : '';
  if (key !== last) {
    last = key;
    if (!cue || !SONGS[cue.song]) stop(0.6);
    else play(cue.song, SONGS[cue.song], cue.arr ?? 'main', !!test);
  } else if (cue && !nowPlaying() && !SONGS[cue.song].once) play(cue.song, SONGS[cue.song], cue.arr ?? 'main');
  setMix(isTalking(), !test && (paused || (!!state?.player.swimming && !!LAND_OF_STAGE[stage ?? ''])), !test && quiet);
  warmLand(stage ? LAND_OF_STAGE[stage] ?? null : null);
};

const start = () => {
  if (timer || typeof window === 'undefined') return;
  useContext(getAudioContext);
  // (the songs everybody hears made first, in idle time: the theme, the jingles, the hub, the way in)
  // (the walk-away's and the portal walk's every arrangement: the bosses' and the lands' versions are theirs)
  setTimeout(() => { for (const id of ['title', 'hub', 'intro', 'staff', 'jingle:death', 'jingle:victory']) if (SONGS[id]) prewarm(SONGS[id]); prewarmRooms(); }, 2500);
  timer = setInterval(() => { try { apply(); } catch (err) { console.error('music', err); } }, 100);
};
