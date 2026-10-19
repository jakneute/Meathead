// Every composed song, by its cue id (MUSIC.md lists every cue that wants one, and what's been written for each).
// To add one: write it in a file of its own here (title.ts is the model), import it, and put it under its cue id;
// cues.ts plays it from then on, and the cheat panel's sound test lists it.

import type { Song } from '../engine';
import { TITLE } from './title';
import { HUB } from './hub';
import { INTRO } from './intro';
import { STAFF } from './staff';
import { VICTORY_JINGLE, DEATH_JINGLE } from './jingles';
import { WALKAWAY, WALKAWAY_ARTIE, WALKAWAY_DONNIE, WALKAWAY_QUEEN, WALKAWAY_STEVE, WALKAWAY_HARRY, WALKAWAY_TUCKER } from './walkaway';
import { PORTAL, PORTAL_ADVENTURE, PORTAL_SPOOKY, PORTAL_SPACE, PORTAL_HOLLYWOOD, PORTAL_FOREIGN, PORTAL_FRONTIER } from './portal';

export const SONGS: Record<string, Song> = {
  title: TITLE,
  hub: HUB,
  intro: INTRO,
  staff: STAFF,
  'jingle:victory': VICTORY_JINGLE,
  'jingle:death': DEATH_JINGLE,
  walkaway: WALKAWAY,
  'walkaway:safari-artie': WALKAWAY_ARTIE,
  'walkaway:donnie-dracula': WALKAWAY_DONNIE,
  'walkaway:space-queen': WALKAWAY_QUEEN,
  'walkaway:stuntman-steve': WALKAWAY_STEVE,
  'walkaway:helicopter-harry': WALKAWAY_HARRY,
  'walkaway:tucker': WALKAWAY_TUCKER,
  portal: PORTAL,
  'portal:adventure': PORTAL_ADVENTURE,
  'portal:spooky': PORTAL_SPOOKY,
  'portal:space': PORTAL_SPACE,
  'portal:hollywood': PORTAL_HOLLYWOOD,
  'portal:foreign': PORTAL_FOREIGN,
  'portal:frontier': PORTAL_FRONTIER,
};
