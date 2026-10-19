// Every composed song, by its cue id (MUSIC.md lists every cue that wants one, and what's been written for each).
// To add one: write it in a file of its own here (title.ts is the model), import it, and put it under its cue id;
// cues.ts plays it from then on, and the cheat panel's sound test lists it.

import type { Song } from '../engine';
import { TITLE } from './title';

export const SONGS: Record<string, Song> = {
  title: TITLE,
};
