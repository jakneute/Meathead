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
import { LAND_ADVENTURE, SEQ_RIVER, SEQ_MINE_CART, SEQ_TEMPLE_COLLAPSE } from './jungle';
import { BOSS_TREX, BOSS_SAFARI_ARTIE } from './jungleBosses';
import { LAND_SPOOKY, SEQ_CLOCK_TOWER, SEQ_RED_MIST, SEQ_SATAN } from './spooky';
import { BOSS_DEMON, BOSS_DONNIE } from './spookyBosses';
import { LAND_SPACE, SEQ_SPACE_TRAIN, SEQ_STALKER } from './space';
import { BOSS_UFO, BOSS_SPACE_QUEEN } from './spaceBosses';
import { LAND_HOLLYWOOD, SEQ_COASTER, SEQ_DISASTER_RIDE, SEQ_HAVOC } from './hollywood';
import { BOSS_ENSEMBLE, BOSS_STEVE } from './hollywoodBosses';
import { LAND_FOREIGN, SEQ_HELI } from './foreign';
import { BOSS_HELI_GAUNTLET, BOSS_HARRY } from './foreignBosses';
import { LAND_FRONTIER, SEQ_TRAIN, SEQ_BRAWL, SEQ_DUEL, SEQ_DRAW, SEQ_LOG_RIDE } from './frontier';
import { SEQ_ROAD_RASH, BOSS_TUCKER } from './frontierBosses';

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
  'land:adventure': LAND_ADVENTURE,
  'seq:river': SEQ_RIVER,
  'seq:mine-cart': SEQ_MINE_CART,
  'seq:temple-collapse': SEQ_TEMPLE_COLLAPSE,
  'boss:trex': BOSS_TREX,
  'boss:safari-artie': BOSS_SAFARI_ARTIE,
  'land:spooky': LAND_SPOOKY,
  'seq:clock-tower': SEQ_CLOCK_TOWER,
  // (the red mist's hallway isn't built yet: the dungeon's descending ceiling plays it till then, and after)
  'seq:ceiling': SEQ_RED_MIST,
  'seq:red-mist': SEQ_RED_MIST,
  'seq:satan': SEQ_SATAN,
  'boss:demon': BOSS_DEMON,
  'boss:donnie-dracula': BOSS_DONNIE,
  'land:space': LAND_SPACE,
  'seq:space-train': SEQ_SPACE_TRAIN,
  'seq:stalker': SEQ_STALKER,
  'boss:ufo': BOSS_UFO,
  'boss:space-queen': BOSS_SPACE_QUEEN,
  'land:hollywood': LAND_HOLLYWOOD,
  'seq:coaster': SEQ_COASTER,
  'seq:disaster-ride': SEQ_DISASTER_RIDE,
  'seq:havoc': SEQ_HAVOC,
  'boss:ensemble-cast': BOSS_ENSEMBLE,
  'boss:stuntman-steve': BOSS_STEVE,
  'land:foreign': LAND_FOREIGN,
  'seq:heli': SEQ_HELI,
  'boss:heli-gauntlet': BOSS_HELI_GAUNTLET,
  'boss:helicopter-harry': BOSS_HARRY,
  'land:frontier': LAND_FRONTIER,
  'seq:train': SEQ_TRAIN,
  'seq:brawl': SEQ_BRAWL,
  'seq:duel': SEQ_DUEL,
  'seq:draw': SEQ_DRAW,
  'seq:log-ride': SEQ_LOG_RIDE,
  // (the TEENAGERS are the Road Rash chase: one song, under both cues)
  'seq:road-rash': SEQ_ROAD_RASH,
  'boss:teenagers': SEQ_ROAD_RASH,
  'boss:tucker': BOSS_TUCKER,
};
