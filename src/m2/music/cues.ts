// What plays where in Meathead 2 (MUSIC.md has the full list, and who's composed what). Asked ten times a second:
// the game's state (the stage, the land's section, a boss fight and which, a cutscene, a death, the VICTORY stamp,
// the walk-away, a portal walk) picks a CUE, a song id and the arrangements it'd like; the first of its candidates
// that's been composed (songs/index.ts) plays. Nothing composed for it yet: the next candidate, and in the end
// silence, so every later job only has to add songs.
//
//   'title'                  the theme (no title screen yet: it stands in at the hub, the staff room, the intro)
//   'intro'                  the way in (arrangements: garage, security, america, ticket: the intro's zones)
//   'hub' / 'staff'          the hub; the staff room
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
import { play, stop, setMix, useContext, prewarm, nowPlaying } from './engine';
import { SONGS } from './songs/index';
import { soundTestCue, type Cue } from './soundTest';
import { momentOn } from './moments';
import { bossFightName, inBossFight } from '../bossQuiet';
import { getUi, walkBackOn } from '../store';
import { HUB_STAGE } from '../hub/index';
import { PEN_STAGE } from '../pen/index';
import { INTRO_STAGE } from '../intro/index';
import { ADV_STAGE } from '../adventure/index';
import { SPOOKY_STAGE } from '../spooky/index';
import { SPACE_STAGE } from '../space/index';
import { HOLLYWOOD_STAGE } from '../hollywood/index';
import { FOREIGN_STAGE } from '../foreign/index';
import { FRONTIER_STAGE } from '../frontier/index';
import { STAIRS_B, CEIL_B } from '../space/queen/geo';
import { HOUSE_DOOR } from '../space/crater/layout';
import { LIFT_X0, ACT2_X } from '../space/ride/layout';
import { TX0 } from '../spooky/tower/layout';
import { SHOP_X } from '../spooky/control/geo';

export type { Cue };

/** Each land's stage, by its lands.ts id. */
const LAND_OF_STAGE: Record<string, string> = {
  [ADV_STAGE]: 'adventure', [SPOOKY_STAGE]: 'spooky', [SPACE_STAGE]: 'space', [HOLLYWOOD_STAGE]: 'hollywood', [FOREIGN_STAGE]: 'foreign', [FRONTIER_STAGE]: 'frontier',
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
};
/** A fight that doesn't name itself: who it is, by land and section. (Future Land's saucer has the whole orbit.) */
export const SECTION_BOSS: Record<string, string> = {
  'adventure:dino': 'trex', 'adventure:clearing': 'safari-artie', 'spooky:hell': 'demon', 'spooky:ballroom': 'donnie-dracula',
  'space:orbit': 'ufo', 'space:queen': 'space-queen', 'hollywood:warehouse': 'ensemble-cast', 'hollywood:stunt': 'stuntman-steve',
  'foreign:heli': 'heli-gauntlet', 'foreign:harry': 'helicopter-harry', 'frontier:dirtbike': 'teenagers', 'frontier:arena': 'tucker',
};
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
 *  isn't on yet (the clock tower's loading bay: the land's, the bay's old record). */
const seqOver = (s: GameState, land: string, sec: string) =>
  (land === 'adventure' && sec === 'roof' && !!jungleOwn(s).roof?.tumbled) || (land === 'spooky' && sec === 'tower' && s.player.pos.x + s.player.width / 2 < TX0);

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
  queen?: { h?: { mode?: string; finale?: boolean; rattle?: unknown; fg?: unknown } | null };
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
  if (h.finale || ['hunt', 'crouch', 'leap', 'ambush', 'kill'].includes(h.mode ?? '')) return 'hunt';
  return h.mode !== 'away' || h.rattle || h.fg ? 'near' : 'dark';
};

/** What the game wants on right now. */
const gameWants = (s: GameState | null): Want => {
  const none: Want = { cands: [], cutscene: false };
  if (!s || !stage) return none;
  const p = s.player;
  const cutscene = !!p.inCutscene;
  if (s.deathTimer > 0) return { cands: [{ song: 'jingle:death' }], cutscene: false };
  if (momentOn('victory')) return { cands: [{ song: 'jingle:victory' }], cutscene: false };
  const walk = momentOn('walkaway');
  if (walk) return { cands: [{ song: `walkaway:${walk.arg}` }, { song: 'walkaway' }, { song: 'title', arrs: ['cutscene'] }], cutscene: false };
  const portal = momentOn('portal');
  if (portal) return { cands: [{ song: `portal:${portal.arg}` }, { song: 'portal' }, { song: `land:${portal.arg}`, arrs: ['portal'] }], cutscene: false };
  if (stage === HUB_STAGE) return { cands: [{ song: 'hub' }, { song: 'title', arrs: ['calliope'] }], cutscene };
  if (stage === PEN_STAGE) return { cands: [{ song: 'staff' }, { song: 'title', arrs: ['lounge'] }], cutscene };
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
      // (the saucer's song follows its fight: ufoArr)
      cands: [{ song: `boss:${boss}`, arrs: [...(boss === 'ufo' ? [ufoArr(s)] : []), ...(cutscene ? ['intro', 'main'] : ['main'])] }, ...(also ? [{ song: also }] : []), { song: `land:${land}`, arrs: ['boss', sec, 'main'] }],
      // (a boss's opening cutscene: its 'intro' if it has one, not quieter)
      cutscene: false,
    };
  }
  // Future Land's basement: the queen stalking him in the dark (the user's: atmospheric, creepy)
  if (land === 'space' && sec === 'queen' && p.pos.y + p.height > CEIL_B + 30 && p.pos.x < STAIRS_B) return { cands: [{ song: 'seq:stalker', arrs: [stalkerArr(s)] }, { song: 'land:space', arrs: ['stalker', 'queen'] }], cutscene };
  // Spooky Land's chamber and Satan (a scene, but not quieter: it's his)
  const moment = land === 'spooky' ? spookyMoment(s, sec) : null;
  if (moment) return { cands: [moment, theme], cutscene: false };
  const seq = SEQUENCES[land]?.[sec];
  if (seq && !seqOver(s, land, sec)) return { cands: [{ song: `seq:${seq}`, arrs: seqArrs(s, land, sec) }, theme], cutscene };
  return { cands: [theme], cutscene };
};

/** Starts making a land's songs in idle time as he arrives (its theme, its sequences, its bosses). */
const warmLand = (land: string | null) => {
  if (!land || land === lastLand) return;
  lastLand = land;
  const ids = [`land:${land}`, `portal:${land}`, ...Object.values(SEQUENCES[land] ?? {}).map(q => `seq:${q}`), ...Object.entries(SECTION_BOSS).filter(([k]) => k.startsWith(land + ':')).map(([, b]) => `boss:${b}`)];
  if (land === 'space') ids.push('seq:stalker');
  if (land === 'spooky') ids.push('seq:ceiling', 'seq:satan');
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
  const key = cue ? `${cue.song}:${cue.arr ?? ''}` : '';
  if (key !== last) {
    last = key;
    if (!cue || !SONGS[cue.song]) stop(0.6);
    else play(cue.song, SONGS[cue.song], cue.arr ?? 'main');
  } else if (cue && !nowPlaying() && !SONGS[cue.song].once) play(cue.song, SONGS[cue.song], cue.arr ?? 'main');
  setMix(isTalking(), !test && (paused || (!!state?.player.swimming && !!LAND_OF_STAGE[stage ?? ''])), !test && quiet);
  warmLand(stage ? LAND_OF_STAGE[stage] ?? null : null);
};

const start = () => {
  if (timer || typeof window === 'undefined') return;
  useContext(getAudioContext);
  // (the songs everybody hears made first, in idle time: the theme, the jingles, the hub, the way in)
  // (the walk-away's and the portal walk's every arrangement: the bosses' and the lands' versions are theirs)
  setTimeout(() => { for (const id of ['title', 'hub', 'intro', 'staff', 'jingle:death', 'jingle:victory', 'walkaway', 'portal']) if (SONGS[id]) prewarm(SONGS[id]); }, 2500);
  timer = setInterval(() => { try { apply(); } catch (err) { console.error('music', err); } }, 100);
};
