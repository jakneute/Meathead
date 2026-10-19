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
import { getUi } from '../store';
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

export type { Cue };

/** Each land's stage, by its lands.ts id. */
const LAND_OF_STAGE: Record<string, string> = {
  [ADV_STAGE]: 'adventure', [SPOOKY_STAGE]: 'spooky', [SPACE_STAGE]: 'space', [HOLLYWOOD_STAGE]: 'hollywood', [FOREIGN_STAGE]: 'foreign', [FRONTIER_STAGE]: 'frontier',
};
/** The special sequences: a land's section that's a ride or a chase of its own ('seq:<name>'). */
export const SEQUENCES: Record<string, Record<string, string>> = {
  adventure: { river: 'river', cart: 'mine-cart' },
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
    return { cands: [{ song: 'intro', arrs: [zone] }, { song: 'title', arrs: [INTRO_STANDIN[zone] ?? 'main'] }], cutscene: cutscene || !!getUi().introCutscene };
  }
  const land = LAND_OF_STAGE[stage];
  if (!land) return none;
  const sec = sectionOf(s) ?? '';
  const theme: Cand = { song: `land:${land}`, arrs: [sec, 'main'] };
  // A boss or sub-boss
  const named = bossFightName(s);
  const boss = named ?? (inBossFight(s) || WHOLE_SECTION_FIGHTS.has(`${land}:${sec}`) ? SECTION_BOSS[`${land}:${sec}`] : undefined);
  if (boss) {
    const also = BOSS_ALSO[boss];
    return {
      cands: [{ song: `boss:${boss}`, arrs: cutscene ? ['intro', 'main'] : ['main'] }, ...(also ? [{ song: also }] : []), { song: `land:${land}`, arrs: ['boss', sec, 'main'] }],
      // (a boss's opening cutscene: its 'intro' if it has one, not quieter)
      cutscene: false,
    };
  }
  // Future Land's basement: the queen stalking him in the dark (the user's: atmospheric, creepy)
  if (land === 'space' && sec === 'queen' && p.pos.y + p.height > CEIL_B + 30 && p.pos.x < STAIRS_B) return { cands: [{ song: 'seq:stalker' }, { song: 'land:space', arrs: ['stalker', 'queen'] }], cutscene };
  const seq = SEQUENCES[land]?.[sec];
  if (seq) return { cands: [{ song: `seq:${seq}` }, theme], cutscene };
  return { cands: [theme], cutscene };
};

/** Starts making a land's songs in idle time as he arrives (its theme, its sequences, its bosses). */
const warmLand = (land: string | null) => {
  if (!land || land === lastLand) return;
  lastLand = land;
  const ids = [`land:${land}`, `portal:${land}`, ...Object.values(SEQUENCES[land] ?? {}).map(q => `seq:${q}`), ...Object.entries(SECTION_BOSS).filter(([k]) => k.startsWith(land + ':')).map(([, b]) => `boss:${b}`)];
  if (land === 'space') ids.push('seq:stalker');
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
  setTimeout(() => { for (const id of ['title', 'hub', 'intro', 'staff', 'jingle:death', 'jingle:victory', 'walkaway']) if (SONGS[id]) prewarm(SONGS[id]); }, 2500);
  timer = setInterval(() => { try { apply(); } catch (err) { console.error('music', err); } }, 100);
};
