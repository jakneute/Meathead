// Steamworks hooks in here, and only here (once there's an app ID). Nothing yet: everything below is a no-op.
//
// When it's time: `npm install steamworks.js`, put the app ID in APP_ID, and fill these in, e.g.
//   const steamworks = require('steamworks.js');
//   client = steamworks.init(APP_ID);          // (in init)
//   steamworks.electronEnableSteamOverlay();   // (in init, before the window's made: the overlay)
//   client.achievement.activate(name);        // (in achievement)
// main.cjs calls init() before the window's made and shutdown() on the way out; the game itself doesn't know Steam's
// there (anything it should tell Steam, an achievement, would come through the preload as an IPC message to here).
// Steam Cloud needs no code: it's set up on Steamworks' site to sync the save folder (see saveDir() in main.cjs).

const APP_ID = null; // (none yet)
let client = null;

module.exports = {
  /** Starts Steam's side (no app ID: does nothing). False if Steam isn't there. */
  init() { if (APP_ID === null) return false; return !!client; },
  /** An achievement earned (by its API name). */
  achievement(_name) { /* (none yet) */ },
  shutdown() { client = null; },
};
