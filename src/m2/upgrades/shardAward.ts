// A CHARGE SHARD won (the standing rule: every charge shard is the prize for a minigame). One place for every land's:
// the find's kept for good in the save as one of the land's collectibles (store.ts markCollectibleFound: one id per
// minigame), the shard count goes up (state.ts setShards: every 3 another power cell), the save's written there and
// then; and the YOU GOT card (ShardGotCard.tsx, off ui.gotShard) with the explain screens' buffer: up SHARD_HOLD frames,
// then every button let go once, then a fresh press closes it (no mashing through it unread).
//
// USE: if (awardShard(land, id)) card = openShardCard(); then every frame while it's up (the player held: p.inCutscene,
// no controls passed on): tickShardCard(card, state.frame) → true once it's closed. shardWon(land, id): won before.

import { allFound, markCollectibleFound, setUi } from '../store';
import { saveProgress } from '../save';
import { shards, setShards } from './state';
import { pollM2, btn, pressed } from '../input';
import { playSound } from '../../m1/game/platform/audio';

export const SHARD_HOLD = 90;

/** That minigame's shard's been won on this save. */
export const shardWon = (land: string, id: string) => !!allFound()[land]?.includes(id);

/** Gives it (once a save): false if it was won already. */
export const awardShard = (land: string, id: string): boolean => {
  if (shardWon(land, id)) return false;
  markCollectibleFound(land, id);
  setShards(shards() + 1);
  saveProgress();
  return true;
};

export interface ShardCard { t: number; armed: boolean }
export const openShardCard = (): ShardCard => {
  playSound('powerup', 0.8);
  setUi({ gotShard: { ready: false } });
  return { t: 0, armed: false };
};
export const closeShardCard = () => setUi({ gotShard: null });
/** A frame of it; true once a fresh press after the buffer has closed it. */
export const tickShardCard = (card: ShardCard, frame: number): boolean => {
  pollM2(frame);
  card.t++;
  const held = btn('ok') || btn('back') || btn('a') || btn('b') || btn('x') || btn('y');
  if (!card.armed && card.t > SHARD_HOLD && !held) { card.armed = true; setUi({ gotShard: { ready: true } }); }
  if (card.armed && (pressed('ok') || pressed('back') || pressed('a') || pressed('b') || pressed('x') || pressed('y'))) { closeShardCard(); playSound('menuok', 0.6); return true; }
  return false;
};
