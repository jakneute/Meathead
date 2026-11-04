// The cheats build's SKIP TO EPILOGUE (the title's SKIP TO HUB, left / right): everything a 100% file has, all eight
// lands cleared and all 24 hidden finds with Ben's armor and the follow-ups, the PA's announcements already made; the
// hour follows from that (9, the fireworks). The owner's: "give you all collectibles, to prepare me for testing the
// final levels when they get implemented. time of day 9, like i did 100 percent completion".

import { LAND_FINDS, markLandCleared, markCollectibleFound, setAnnounced } from './store';
import { setPiece, setBenGave, setHealthFinds, setAmmoFinds, setShards, setBenMet, setFollowArt } from './upgrades/state';

export const grantEverything = () => {
  let health = 0, ammo = 0, shards = 0;
  for (const [land, d] of Object.entries(LAND_FINDS)) {
    markLandCleared(land);
    for (const [id, kind] of d.finds) {
      markCollectibleFound(land, id);
      if (kind === 'health') health++; else if (kind === 'ammo') ammo++; else if (kind === 'shard') shards++;
    }
    setPiece(d.piece, true); setBenGave(d.piece);
  }
  setHealthFinds(health); setAmmoFinds(ammo); setShards(shards);
  setBenMet(true); setFollowArt(true);
  setAnnounced(true, true);
};
